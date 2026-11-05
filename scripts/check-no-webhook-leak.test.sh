#!/bin/bash
# Proves the leak check sees the working tree, not only the tracked files.
#
# Each case plants one of the three secret shapes in a scratch file and
# asserts the check fails. The untracked case is the one that matters: a
# webhook URL reached the tree in an untracked file, and `git grep` reads
# the index, so it could not see it.
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

expect_fail() {
  local label="$1" file="$2" contents="$3"
  printf '%s' "$contents" > "$SCRATCH/$file"
  if (cd "$SCRATCH" && bash "$CHECK" >/dev/null 2>&1); then
    echo "FAIL: $label — the check passed when it should not have"
    fails=$((fails + 1))
  else
    echo "ok: $label"
  fi
  rm -f "$SCRATCH/$file"
}

expect_fail "a webhook URL in an untracked file" leak.txt "$(webhook_url)"
expect_fail "a NOTIFY_TOKEN in an untracked file" leak.txt "$(notify_token)"
expect_fail "a SHARE_TOKEN in an untracked file" leak.txt "$(share_token)"

if [ "$fails" -ne 0 ]; then
  echo "$fails case(s) did not fail as they should"
  exit 1
fi
echo "the leak check sees the working tree"
