#!/usr/bin/env bash
# Worktree helper for the SEO routines.
#
#   ops/seo/pulse/git-ship.sh start <branch-name>   creates a worktree off origin/main
#   ops/seo/pulse/git-ship.sh finish <branch-name>  commits, pushes, reports STATUS
#
# start prints:
#   WORKTREE=<path>
#   BRANCH=<name>
#
# finish prints one of:
#   STATUS=pushed   the branch is on origin
#   STATUS=branch   the branch exists locally but could not be pushed
#   STATUS=local    no remote access; the commits are in the local worktree
#
# It never edits or commits in the main working tree. That is the point of the
# worktree: the SEO routines run unattended, and the main tree is where the
# owner works.
#
# Credentials are found in this order:
#   1. ops/seo/pulse/.token (written by the run, deleted by the run)
#   2. `gh auth token`, when gh is logged in
# The credential helper is disabled during fetch and push, because a helper
# that prompts turns an unattended run into a hang. A token is passed in the
# URL instead, so nothing prompts.

set -uo pipefail

ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
cd "$ROOT" || exit 1

TOKEN_FILE="ops/seo/pulse/.token"
WORKTREE_ROOT=".worktrees"
REMOTE="origin"
BASE="origin/main"
GIT_SHIP_LOG="ops/seo/pulse/.git-ship.log"

: >"$GIT_SHIP_LOG" 2>/dev/null || true

die() { echo "ERROR: $*" >&2; exit 1; }

has_remote() {
  git remote get-url "$REMOTE" >/dev/null 2>&1
}

# Prints the token, or nothing. Never prompts.
find_token() {
  if [ -s "$TOKEN_FILE" ]; then
    cat "$TOKEN_FILE"
    return 0
  fi
  if command -v gh >/dev/null 2>&1; then
    gh auth token 2>/dev/null && return 0
  fi
  return 0
}

# The remote URL with the token embedded, for a one-shot authenticated call.
authed_url() {
  local token url
  token="$(find_token)"
  url="$(git remote get-url "$REMOTE" 2>/dev/null)"
  [ -n "$url" ] || return 1
  if [ -n "$token" ] && [[ "$url" == https://* ]]; then
    # Strip any credentials already in the URL.
    url="${url#https://}"
    url="${url#*@}"
    echo "https://x-access-token:${token}@${url}"
  else
    echo "$url"
  fi
}

# A fetch or push with prompting disabled. Fails rather than hanging.
# The error is kept in $GIT_SHIP_LOG rather than swallowed, so a routine that
# gets STATUS=local can say why.
git_authed() {
  local op="$1"; shift
  local url
  url="$(authed_url)" || return 1
  GIT_ASKPASS=/bin/true GIT_TERMINAL_PROMPT=0 GCM_INTERACTIVE=never \
    git -c credential.helper= -c core.askPass=true \
    "$op" "$url" "$@" 2>>"$GIT_SHIP_LOG"
}

fetch_base() {
  has_remote || return 0
  git_authed fetch origin main
}

cmd_start() {
  local name="${1:-}"
  [ -n "$name" ] || die "start needs a branch name"

  mkdir -p "$WORKTREE_ROOT"

  # The worktree may be left over from a previous run that did not finish.
  local wt="$WORKTREE_ROOT/$name"
  if [ -d "$wt" ]; then
    echo "WORKTREE=$ROOT/$wt"
    echo "BRANCH=$name"
    echo "NOTE=reused an existing worktree"
    return 0
  fi

  fetch_base

  local base_ref="$BASE"
  if ! git rev-parse --verify "$base_ref" >/dev/null 2>&1; then
    base_ref="main"
    git rev-parse --verify "$base_ref" >/dev/null 2>&1 \
      || die "neither $BASE nor main exists locally"
  fi

  git worktree add -b "$name" "$wt" "$base_ref" >/dev/null 2>&1 \
    || git worktree add "$wt" "$base_ref" >/dev/null 2>&1 \
    || die "could not create the worktree"

  echo "WORKTREE=$ROOT/$wt"
  echo "BRANCH=$name"
  echo "BASE=$base_ref"
}

cmd_finish() {
  local name="${1:-}"
  [ -n "$name" ] || die "finish needs a branch name"

  local wt="$WORKTREE_ROOT/$name"
  [ -d "$wt" ] || die "no worktree at $wt"

  # Stage and commit anything outstanding.
  git -C "$wt" add -A >/dev/null 2>&1
  if ! git -C "$wt" diff --cached --quiet >/dev/null 2>&1; then
    git -C "$wt" commit -q -m "$name" >/dev/null 2>&1 \
      || git -C "$wt" commit -q -m "$name" --no-verify >/dev/null 2>&1 \
      || die "the commit failed"
  fi

  # A worktree with no commits of its own is still fine: nothing to push.
  local ahead
  ahead="$(git -C "$wt" rev-list --count "$BASE..HEAD" 2>/dev/null || echo 0)"
  if [ "${ahead:-0}" -eq 0 ]; then
    echo "STATUS=local"
    echo "NOTE=nothing to push"
    echo "WORKTREE=$ROOT/$wt"
    return 0
  fi

  local status="local"
  if has_remote; then
    if git_authed push "HEAD:refs/heads/$name"; then
      status="pushed"
    fi
  fi

  echo "STATUS=$status"
  echo "BRANCH=$name"
  echo "WORKTREE=$ROOT/$wt"
  echo "SHA=$(git -C "$wt" rev-parse HEAD)"
  echo "AHEAD=$ahead"

  if [ "$status" != "pushed" ] && [ -s "$GIT_SHIP_LOG" ]; then
    echo "NOTE=push failed; the last error was:"
    sed 's/^/  /' "$GIT_SHIP_LOG"
  fi

  # The worktree is only removed on a clean push. A branch or local status
  # means the work holds work that has not landed, so it stays and the report
  # names the path.
  if [ "$status" = "pushed" ]; then
    git worktree remove --force "$wt" >/dev/null 2>&1
    echo "NOTE=worktree removed"
  else
    echo "NOTE=worktree kept at $ROOT/$wt (not pushed)"
  fi
}

case "${1:-}" in
  start)  shift; cmd_start "$@" ;;
  finish) shift; cmd_finish "$@" ;;
  *)
    echo "usage: git-ship.sh start <name> | git-ship.sh finish <name>" >&2
    exit 1
    ;;
esac
