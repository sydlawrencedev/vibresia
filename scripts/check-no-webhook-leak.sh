#!/bin/bash
# Fails if a Discord webhook URL, the notify token or the share token is
# anywhere in the working tree.
#
# Delphina learned this the expensive way: one webhook URL got committed and
# then baked into dozens of release tags, where it stayed long after it was
# supposed to be rotated. The URL is a credential — anyone holding it can post
# to the channel, and it can't be revoked without recreating it in Discord.
#
# The real value lives in a Worker secret (`wrangler secret put
# DISCORD_WEBHOOK_URL`); `.dev.vars` holds the local copy. Neither is tracked.
#
# The sweep walks the working tree, not the index. `git grep` reads the index,
# so an untracked file — which is exactly how the webhook reached the tree
# the first time — was invisible to it. The git pass is kept below as a
# second opinion, but it is not what the check rests on.
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
matches=""
matches+=$(grep -rInE '^[^#]*\bNOTIFY_TOKEN=[A-Za-z0-9_-]{16,}' "${EXCLUDES[@]}" . 2>/dev/null || true)
matches+=$(grep -rInE '^[^#]*\bSHARE_TOKEN=[A-Za-z0-9_-]{16,}' "${EXCLUDES[@]}" . 2>/dev/null || true)
matches+=$(grep -rInE 'discord(app)?\.com/api/webhooks/[0-9]+/[A-Za-z0-9_.-]{20,}' "${EXCLUDES[@]}" . 2>/dev/null || true)

# The tracked tree gets a second opinion, in case a path is excluded from the
# sweep above for a reason the patterns do not know about.
tracked=$(git grep -InE 'discord(app)?\.com/api/webhooks/[0-9]+/[A-Za-z0-9_.-]{20,}' -- . 2>/dev/null || true)
if [ -n "$tracked" ]; then
  matches+="${tracked}"
fi

# The ignored files are included by the sweep above — it reads the working
# tree, not the index — but they are called out by name so the message says
# "do not commit it" rather than "this is in git".
for f in .env .dev.vars VisualiserMac/.env; do
  [ -f "$f" ] || continue
  if grep -qE 'discord(app)?\.com/api/webhooks/' "$f"; then
    matches+="${f}: contains a Discord webhook URL (ignored file — do not commit it)"
  fi
  if grep -qE '^\s*NOTIFY_TOKEN\s*=\s*\S{16,}' "$f"; then
    matches+="${f}: contains the /api/notify token (ignored file — do not commit it)"
  fi
  if grep -qE '^\s*SHARE_TOKEN\s*=\s*\S{16,}' "$f"; then
    matches+="${f}: contains the share token (ignored file — do not commit it)"
  fi
done
if [ -n "$matches" ]; then
  echo "A secret that shouldn't be in git found in the working tree:" >&2
  echo "$matches" >&2
  echo "" >&2
  echo "Treat it as leaked: rotate the webhook in Discord (npx wrangler secret put" >&2
  echo "DISCORD_WEBHOOK_URL), the notify token (NOTIFY_TOKEN) and the share token" >&2
  echo "(SHARE_TOKEN), then rebuild." >&2
  exit 1
fi
echo "no webhook URLs, notify tokens or share tokens in the working tree"
