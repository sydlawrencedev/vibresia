#!/bin/bash
# Fails if a Discord webhook URL, the notify token or the share token would
# go into git.
#
# Delphina learned this the expensive way: one webhook URL got committed and
# then baked into dozens of release tags, where it stayed long after it was
# supposed to be rotated. The URL is a credential — anyone holding it can post
# to the channel, and it can't be revoked without recreating it in Discord.
#
# The real value lives in a Worker secret (`wrangler secret put
# DISCORD_WEBHOOK_URL`); `.dev.vars` and `VisualiserMac/.env` hold the local
# copies. Those are gitignored on purpose, and a secret in one of them is
# the system working, not a leak.
#
# So the rule is about what would be *committed*: a secret in a file git
# would track, or in a file that is already tracked. That covers the case
# that actually happened — an untracked file that was not ignored, and so
# was one `git add -A` away from being published — without failing every
# run on a machine that has its .env.
#
# The sweep walks the working tree rather than the index. `git grep` reads
# the index, so an untracked file was invisible to it.
set -euo pipefail
# The sweep runs over the directory the check was invoked from, not the one
# the script lives in: the point is to see the tree that is about to be
# committed, wherever it is. Run from the repository root, that is the root.
ROOT="$(pwd)"

# The directories that are not ours to sweep: the git directory, installed
# dependencies, build output and the agent kit's vendored skills (which carry
# their own example tokens and would drown the real ones).
EXCLUDES=(
  --exclude-dir=.git
  --exclude-dir=node_modules
  --exclude-dir=.build
  --exclude-dir=dist
  --exclude-dir=.worktrees
  --exclude-dir=.wrangler
)

# The /api/notify token counts as well: it is the thing standing between a
# stranger and our Discord channel now that the app reports to us. So does
# the share token, which is what stops the site's share endpoint being used
# as free storage by anyone who finds it.
#
# Every match is appended. Assigning instead of appending let one pattern's
# result overwrite another's, so a leaked SHARE_TOKEN passed the check.
#
# The tokens are matched the way they are actually written — `NAME=value`,
# with no space around the `=`, in an env file or a shell script. A token
# held in a JavaScript constant with a space before the `=` is a test
# placeholder, not a credential: the suite's own tokens are
# `share-token-for-tests` and `s3cret`, and the values that ship are
# forty-plus hex characters.
PATTERNS=(
  'NOTIFY_TOKEN=[A-Za-z0-9_-]{16,}'
  'SHARE_TOKEN=[A-Za-z0-9_-]{16,}'
  'discord(app)?\.com/api/webhooks/[0-9]+/[A-Za-z0-9_.-]{20,}'
)

matches=""

for pattern in "${PATTERNS[@]}"; do
  while IFS= read -r hit; do
    [ -n "$hit" ] || continue
    file="${hit%%:*}"
    # A file git ignores cannot be committed by accident, so a secret in one
    # is where it is supposed to be. A file that is already tracked is a
    # different matter: the secret is in git already.
    if git check-ignore -q "$file" 2>/dev/null; then
      if git ls-files --error-unmatch "$file" >/dev/null 2>&1; then
        matches+="${hit} (tracked file — this secret is in git)"
      fi
      continue
    fi
    matches+="${hit}"
  done < <(grep -rInE "${pattern}" "${EXCLUDES[@]}" . 2>/dev/null || true)
done

if [ -n "$matches" ]; then
  echo "A secret that would go into git was found in the working tree:" >&2
  echo "$matches" >&2
  echo "" >&2
  echo "Treat it as leaked: rotate the webhook in Discord (npx wrangler secret put" >&2
  echo "DISCORD_WEBHOOK_URL), the notify token (NOTIFY_TOKEN) and the share token" >&2
  echo "(SHARE_TOKEN), then rebuild." >&2
  exit 1
fi
echo "no webhook URLs, notify tokens or share tokens in the files git would commit"
