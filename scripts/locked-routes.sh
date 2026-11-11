#!/bin/bash
# Prints the site routes an SEO run touched in the last 7 days.
#
# The lock is dynamic. There is no static list, because a hand-maintained list
# is stale the moment a routine ships, and a list that drifts reads as
# current. This script is the only lock source.
#
#   scripts/locked-routes.sh
#
# It prints three things:
#   1. the locked site routes, one per line
#   2. the shared files in the window, each of which locks its dependents
#   3. the experiment freezes
#
# Two rules the script cannot decide on its own:
#
#   - A change to a shared file locks every page that consumes it. A change
#     to content/pages/<slug>.mjs locks that page. A change to
#     content/data/competitors.json locks every page that names a competitor.
#   - A cluster that is re-touched weekly stays locked in practice even when
#     the individual page is not in the 7-day log.
#
# /blog/*, /guides/* and /locations/* are deliberately NOT convention-locked.

set -uo pipefail

cd "$(dirname "$0")/.." || exit 1

DAYS="${1:-7}"
SINCE="${DAYS}.days.ago"

echo "=== Locked routes (${SINCE}) ==="

# 1. The direct case: a site/ HTML file changed in the window.
git log --since="$SINCE" --no-merges --name-only --format="" origin/main 2>/dev/null \
  | grep '^site/' \
  | grep '\.html$' \
  | grep -v '^site/_partials/' \
  | sort -u \
  | while read -r f; do
      [ -n "$f" ] || continue
      # site/blog/x.html -> /blog/x ; site/index.html -> /
      route="${f#site/}"
      route="${route%.html}"
      if [ "$route" = "index" ]; then
        echo "/"
      else
        echo "/$route"
      fi
    done | sort -u

echo ""
echo "=== Source pages locked (content/pages/) ==="
git log --since="$SINCE" --no-merges --name-only --format="" origin/main 2>/dev/null \
  | grep '^content/pages/' \
  | sort -u

echo ""
echo "=== Shared files in the window (each locks its dependents) ==="
git log --since="$SINCE" --no-merges --name-only --format="" origin/main 2>/dev/null \
  | grep -E '^content/data/|^content/product-truth\.md|^site/_partials/|^scripts/generate-seo-pages\.mjs' \
  | sort -u

echo ""
echo "=== Experiment freezes ==="
if [ -f "content/experiments.json" ] || [ -f "docs/experiments.json" ]; then
  exp=$(ls content/experiments.json docs/experiments.json 2>/dev/null | head -1)
  echo "(from $exp)"
  node -e '
    const fs = require("fs");
    const p = process.argv[1];
    let data;
    try { data = JSON.parse(fs.readFileSync(p, "utf8")); } catch (e) { console.log("could not parse:", e.message); process.exit(0); }
    const list = Array.isArray(data) ? data : (data.experiments || []);
    const now = Date.now();
    let any = false;
    for (const e of list) {
      const until = e.until || e.freezeUntil || e.ends || e.end;
      const frozen = e.frozen === true || (until && new Date(until).getTime() > now);
      if (!frozen) continue;
      any = true;
      const routes = Array.isArray(e.routes) ? e.routes.join(" ") : (e.route || "");
      console.log([e.name || e.id || "?", routes, until ? "until " + until : "no end date"].join(" | "));
    }
    if (!any) console.log("(none frozen)");
  ' "$exp"
else
  echo "(no experiments file: content/experiments.json or docs/experiments.json)"
fi
