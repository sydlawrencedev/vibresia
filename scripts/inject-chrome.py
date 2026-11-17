#!/usr/bin/env python3
"""Put the shared navbar and footer into every page, from one source of truth.

There is no templating on the way to Cloudflare Workers Static Assets — the
HTML that ships is the HTML in the repo. So "every page has the same navbar" is
either true because one file owns it, or it is true until someone edits one page
and forgets the other twenty.

Each page keeps a marked region:

    <!-- chrome:nav -->
    ...generated...
    <!-- /chrome:nav -->

Running this rewrites the inside of those regions from site/_partials/. Running
it with --check only reports, which is what release.sh does: three definitions
of `.brand` is not a problem on its own, three definitions that quietly drift
apart is.

    ./scripts/inject-chrome.py            rewrite every page
    ./scripts/inject-chrome.py --check    fail if any page is out of date
"""
import os
import re
import sys

REGIONS = {"nav": "nav.html", "footer": "footer.html"}

# The scripts every page has to load, and where they have to come.
#
# The download script detects the visitor's platform and changes the button
# to match; without it every page's button says "Download for Mac" on a
# Windows PC, which is a dead end. The share-sheet script comes after it:
# both are deferred, so they run in the order they are written, and the
# second one remembers the button's label so it can put it back when the
# visitor is not on a phone. The other way round, it would remember
# "Download for Mac" and put that back on a desktop.
REQUIRED_SCRIPTS = [
    ("/downloads.js", "/mobile.js"),
]

# The share pages are generated, so they are not in the repo as a thing you
# edit — but they are in the repo as files that ship, so they are checked like
# anything else. generate-share-pages.py calls this at the end for that reason.
#
# The dataset pages under site/stats/data/ are hand-written, and they carry
# the shared chrome too. They were left out of this list, so their footer was
# a hand-maintained copy that quietly drifted: it kept working, and it was
# the one place on the site whose download button never learned about the
# Windows package. A page is on the list or it is not; "not on the list" is
# not a way of saying "it does not need the shared footer".
PAGES = ["site/index.html", "site/agents.html", "site/vibescapes.html", "site/vibe.html",
         "site/admin.html", "site/privacy.html", "site/terms.html",
         "site/author/syd-lawrence.html"]


def pages(root):
    found = list(PAGES)
    share = os.path.join(root, "site", "share")
    if os.path.isdir(share):
        for name in sorted(os.listdir(share)):
            if name.endswith(".html"):
                found.append(f"site/share/{name}")
    # The search pages are generated too (scripts/generate-seo-pages.mjs),
    # from the same partials.
    found.append("site/comparison.html")  # the comparisons hub
    for section in ("blog", "comparison"):
        folder = os.path.join(root, "site", section)
        if os.path.isdir(folder):
            for name in sorted(os.listdir(folder)):
                if name.endswith(".html"):
                    found.append(f"site/{section}/{name}")
    # The dataset pages. Hand-written, but they ship with the shared chrome.
    stats = os.path.join(root, "site", "stats", "data")
    if os.path.isdir(stats):
        for name in sorted(os.listdir(stats)):
            if name.endswith(".html"):
                found.append(f"site/stats/data/{name}")
    return [p for p in found if os.path.exists(os.path.join(root, p))]


def block(region, partial):
    """The marked region, with the partial's lines re-indented to match."""
    body = open(partial).read().strip("\n")
    return f"<!-- chrome:{region} -->\n{body}\n<!-- /chrome:{region} -->"


def inject(text, region, partial):
    pattern = re.compile(
        r"^(?P<indent>[ \t]*)<!-- chrome:" + region + r" -->.*?"
        r"^[ \t]*<!-- /chrome:" + region + r" -->",
        re.S | re.M,
    )
    match = pattern.search(text)
    if not match:
        return None

    indent = match.group("indent")
    body = open(partial).read().strip("\n")
    # Match the indentation the page already uses, so an injected navbar lines
    # up with the markup around it instead of jumping to column zero.
    body = "\n".join(indent + line if line.strip() else line for line in body.split("\n"))
    return pattern.sub(lambda m: f"{indent}<!-- chrome:{region} -->\n{body}\n"
                                  f"{indent}<!-- /chrome:{region} -->", text, count=1)


def main():
    # The root is whatever positional argument is left after the flags, not
    # argv[1] — release.sh passes `--check` first, and treating that as the
    # root makes every path resolve to nonsense and every page look unbuildable.
    check = "--check" in sys.argv
    positional = [a for a in sys.argv[1:] if not a.startswith("-")]
    root = positional[0] if positional else os.path.dirname(
        os.path.dirname(os.path.abspath(__file__)))

    partials = {r: os.path.join(root, "site", "_partials", f)
                for r, f in REGIONS.items()}
    for region, path in partials.items():
        if not os.path.exists(path):
            print(f"missing site/_partials/{REGIONS[region]} — nothing to inject.")
            return 1

    changed, missing, drift = [], [], []
    unscripted = []
    for page in pages(root):
        full = os.path.join(root, page)
        original = open(full).read()
        text = original
        for region, partial in partials.items():
            result = inject(text, region, partial)
            if result is None:
                missing.append(f"{page} (no chrome:{region} region)")
                text = None
                break
            text = result
        if text is None:
            continue
        # The scripts the shared chrome has to load, and the order they have
        # to load in. A page that lost one of them still looks right, and the
        # visitor gets a button for a machine they do not have.
        for earlier, later in REQUIRED_SCRIPTS:
            first = text.find(f'src="{earlier}"')
            second = text.find(f'src="{later}"')
            if first == -1 or second == -1 or first > second:
                unscripted.append(f"{page} ({earlier} before {later})")
        if text == original:
            continue
        if check:
            drift.append(page)
        else:
            open(full, "w").write(text)
            changed.append(page)

    for page in missing:
        print(f"  x {page}")

    if check:
        if drift:
            print("Shared navbar/footer is out of date on:")
            for page in drift:
                print(f"  x {page}")
            print("  Fix with ./scripts/inject-chrome.py")
            return 1
        if missing:
            print("Pages are missing a shared navbar/footer region.")
            return 1
        if unscripted:
            print("Pages are missing a shared script, or load it in the wrong order:")
            for page in unscripted:
                print(f"  x {page}")
            return 1
        print(f"every page's navbar and footer matches site/_partials ({len(pages(root))} pages)")
        return 0

    if missing:
        print("Pages are missing a shared navbar/footer region:")
        for page in missing:
            print(f"  x {page}")
        return 1
    if unscripted:
        print("Pages are missing a shared script, or load it in the wrong order:")
        for page in unscripted:
            print(f"  x {page}")
        return 1
    if changed:
        for page in changed:
            print(f"  updated {page}")
        print(f"navbar and footer injected into {len(changed)} page(s)")
    else:
        print("every page already matched site/_partials")
    return 0


if __name__ == "__main__":
    sys.exit(main())