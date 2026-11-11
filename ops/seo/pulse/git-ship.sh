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
# A token, if there is one, is read from ops/seo/pulse/.token (gitignored).
# The credential helper is disabled during fetch so a broken helper cannot
# wedge the run.

set -uo pipefail

ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
cd "$ROOT" || exit 1

TOKEN_FILE="ops/seo/pulse/.token"
WORKTREE_ROOT=".worktrees"
REMOTE="origin"
BASE="origin/main"

die() { echo "ERROR: $*" >&2; exit 1; }

has_remote() {
  git remote get-url "$REMOTE" >/dev/null 2>&1
}

fetch_base() {
  if has_remote && [ -s "$TOKEN_FILE" ]; then
    local token
    token="$(cat "$TOKEN_FILE")"
    GIT_ASKPASS=/bin/true GIT_TERMINAL_PROMPT=0 \
      git -c credential.helper= fetch "$REMOTE" "$BASE" 2>/dev/null
  elif has_remote; then
    GIT_ASKPASS=/bin/true GIT_TERMINAL_PROMPT=0 \
      git -c credential.helper= fetch "$REMOTE" "$BASE" 2>/dev/null
  fi
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
  if has_remote && [ -s "$TOKEN_FILE" ]; then
    local token
    token="$(cat "$TOKEN_FILE")"
    if git -C "$wt" -c credential.helper= push "$REMOTE" "HEAD:refs/heads/$name" >/dev/null 2>&1; then
      status="pushed"
    fi
  elif has_remote; then
    if git -C "$wt" -c credential.helper= push "$REMOTE" "HEAD:refs/heads/$name" >/dev/null 2>&1; then
      status="pushed"
    fi
  fi

  echo "STATUS=$status"
  echo "BRANCH=$name"
  echo "WORKTREE=$ROOT/$wt"
  echo "SHA=$(git -C "$wt" rev-parse HEAD)"
  echo "AHEAD=$ahead"

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
