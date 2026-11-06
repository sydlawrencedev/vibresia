#!/bin/bash
# Proves the leak check sees the files git would commit, and does not fail on
# the ones it would not.
#
# Each case plants one of the three secret shapes in a scratch tree and
# asserts the check fails when the file would be committed, and passes when
# the file is ignored. The untracked-but-not-ignored case is the one that
# matters: a webhook URL reached the tree in exactly that shape, and the
# old check — which read the index — could not see it.
set -uo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CHECK="$ROOT/scripts/check-no-webhook-leak.sh"
SCRATCH="$(mktemp -d)"
trap 'rm -rf "$SCRATCH"' EXIT

fails=0

# The fixtures are built from parts rather than written out, so this file
# does not itself contain a secret for the sweep to find.
webhook_url() {
  printf 'https://discord.com/api/webhooks/%s/%s' \
    '123456789012345678' 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJ'
}
notify_token() { printf 'NOTIFY_TOKEN=%s' 'zyxwvutsrqponmlkjihgfedcba987654'; }
share_token()  { printf 'SHARE_TOKEN=%s' 'zyxwvutsrqponmlkjihgfedcba987654'; }
# The forms the tokens are actually written in. The old pattern only matched
# the first of these, so the others walked past it.
notify_token_spaced() { printf 'NOTIFY_TOKEN = %s' 'zyxwvutsrqponmlkjihgfedcba987654'; }
share_token_quoted()  { printf 'SHARE_TOKEN="%s"' 'zyxwvutsrqponmlkjihgfedcba987654'; }
share_token_exported() { printf 'export SHARE_TOKEN=%s' 'zyxwvutsrqponmlkjihgfedcba987654'; }
webhook_env_name() { printf 'DISCORD_WEBHOOK_URL=%s' 'abcdefghijklmnopqrstuvwxyz0123456789ABCD'; }

# A scratch directory that is a git repository, so `git check-ignore` and
# `git ls-files` answer the way they do in the project.
make_repo() {
  local dir="$1"
  mkdir -p "$dir"
  git -C "$dir" init -q
  git -C "$dir" config user.email "test@example.com"
  git -C "$dir" config user.name "Test"
}

# expect_fail <label> <contents> — the file is untracked and not ignored.
expect_fail() {
  local label="$1" contents="$2"
  local dir="$SCRATCH/fail"
  rm -rf "$dir"; make_repo "$dir"
  printf '%s' "$contents" > "$dir/leak.txt"
  if (cd "$dir" && LEAK_CHECK_ROOT="$dir" bash "$CHECK" >/dev/null 2>&1); then
    echo "FAIL: $label — the check passed when it should not have"
    fails=$((fails + 1))
  else
    echo "ok: $label"
  fi
}

# expect_fail_from_subdir <label> <contents> — the leak is in the tree, but the
# check is invoked from somewhere else inside it. The sweep must still find
# it: the release script runs from `VisualiserMac/`, and a cwd-based root
# would sweep only that folder.
expect_fail_from_subdir() {
  local label="$1" contents="$2"
  local dir="$SCRATCH/scope"
  rm -rf "$dir"; make_repo "$dir"
  mkdir -p "$dir/sub"
  printf '%s' "$contents" > "$dir/leak.txt"
  if (cd "$dir/sub" && LEAK_CHECK_ROOT="$dir" bash "$CHECK" >/dev/null 2>&1); then
    echo "FAIL: $label — the check passed when it should not have"
    fails=$((fails + 1))
  else
    echo "ok: $label"
  fi
}

# expect_pass <label> <contents> — the file is gitignored, so it cannot be
# committed by accident and the secret is where it belongs.
expect_pass() {
  local label="$1" contents="$2"
  local dir="$SCRATCH/pass"
  rm -rf "$dir"; make_repo "$dir"
  printf '.env\n' > "$dir/.gitignore"
  printf '%s' "$contents" > "$dir/.env"
  if (cd "$dir" && LEAK_CHECK_ROOT="$dir" bash "$CHECK" >/dev/null 2>&1); then
    echo "ok: $label"
  else
    echo "FAIL: $label — the check failed on a file git would not commit"
    fails=$((fails + 1))
  fi
}

expect_fail "a webhook URL in an untracked file" "$(webhook_url)"
expect_fail "a NOTIFY_TOKEN in an untracked file" "$(notify_token)"
expect_fail "a SHARE_TOKEN in an untracked file" "$(share_token)"
expect_fail "a NOTIFY_TOKEN with spaces around the =" "$(notify_token_spaced)"
expect_fail "a SHARE_TOKEN in quotes" "$(share_token_quoted)"
expect_fail "an exported SHARE_TOKEN" "$(share_token_exported)"
expect_fail "a webhook under its environment variable name" "$(webhook_env_name)"
expect_fail_from_subdir "a webhook URL in the tree, checked from a subdirectory" "$(webhook_url)"

expect_pass "a webhook URL in a gitignored file" "$(webhook_url)"
expect_pass "a NOTIFY_TOKEN in a gitignored file" "$(notify_token)"
expect_pass "a SHARE_TOKEN in a gitignored file" "$(share_token)"

if [ "$fails" -ne 0 ]; then
  echo "$fails case(s) did not behave as they should"
  exit 1
fi
echo "the leak check sees what git would commit, and only that"
