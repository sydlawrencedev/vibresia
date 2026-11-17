#!/usr/bin/env python3
"""Check the Windows release asset the site points at is actually published.

The site's Windows download button is a link to `/download/windows`, and the
Worker turns that into a redirect to a GitHub release asset. The URL for that
asset lives in one constant in `worker/index.js`, and the site never holds a
copy of it.

That leaves one way for this to be broken: the constant names a release that
has not been published. The site looks fine, the Worker answers, and the
visitor is redirected to a 404. Nothing in the build notices, because the
build has no idea what the asset should look like.

So this check resolves the configured URL and asks GitHub whether it is there.
It is a release-time check, not a pull-request one: the first Windows
prerelease is published by tagging, and until that happens this fails on
purpose.

    python3 scripts/check-windows-release.py --check "$PWD"

Without `--check` it only prints what is configured and what is missing,
which is what somebody wants to know when the check fails.

The asset is a prerelease, and the tag names the version, so the check also
compares the tag in the URL against `VisualiserWindows/VERSION`. A URL
pointing at an older version is a released site serving a stale package, and
that is worth knowing about even though the file is there.
"""
import json
import os
import re
import sys
import urllib.error
import urllib.request

def _root_from_args(argv):
    """The repository root, from the first argument that is not a flag.

    An option's value is not the root, so the arguments are walked and the
    value of `--release-json` is skipped rather than mistaken for one.
    """
    skip = False
    for argument in argv:
        if skip:
            skip = False
            continue
        if argument == "--release-json":
            skip = True
            continue
        if not argument.startswith("-"):
            return os.path.abspath(argument)
    return os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


ROOT = _root_from_args(sys.argv[1:])

# The release asset the Worker redirects to.
#
# Read out of the Worker's own source rather than written here, because a
# second copy of a URL that changes with every release is exactly the thing
# this check exists to prevent.
ASSET_RE = re.compile(
    r'const\s+WINDOWS_RELEASE_ZIP\s*=\s*\n?\s*"([^"]+)"'
)

# GitHub's own API answers what a release is without the redirect dance, and
# it says plainly whether the release exists at all.
RELEASE_API = "https://api.github.com/repos/sydlawrencedev/vibresia/releases/tags/"


def configured_asset(root=ROOT):
    """The Windows asset URL the Worker is configured to redirect to."""
    worker = os.path.join(root, "worker", "index.js")
    if not os.path.exists(worker):
        return None
    source = open(worker, encoding="utf-8").read()
    match = ASSET_RE.search(source)
    return match.group(1) if match else None


def tag_of(url):
    """The release tag in a GitHub download URL."""
    match = re.search(r"/releases/download/([^/]+)/", url or "")
    return match.group(1) if match else None


def expected_tag(root=ROOT):
    """The tag the Windows version in the tree should be published under."""
    version_file = os.path.join(root, "VisualiserWindows", "VERSION")
    if not os.path.exists(version_file):
        return None
    version = open(version_file, encoding="utf-8").read().strip()
    return f"windows-v{version}" if version else None


def fetch_release(tag, release_json=None):
    """GitHub's record of a release, or None if there is not one.

    A release that exists but is a draft is not a release anybody can
    download from, so it counts as absent.

    `release_json` is a file holding the record instead of asking GitHub
    for it. That is how the tests exercise the resolution without a
    network: the decision this function makes is "is there a release, and
    does it have the file", and that decision does not need GitHub to
    make it.
    """
    if release_json:
        if not os.path.exists(release_json):
            print(f"The release record {release_json} does not exist.")
            sys.exit(2)
        with open(release_json, encoding="utf-8") as handle:
            release = json.load(handle)
        # A null record is what a 404 is: there is no release under that
        # tag at all.
        if not release:
            return None
        return None if release.get("draft") else release

    request = urllib.request.Request(
        RELEASE_API + tag,
        headers={"Accept": "application/vnd.github+json",
                 "User-Agent": "vibresia-release-check"},
    )
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            release = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as error:
        if error.code == 404:
            return None
        raise
    except urllib.error.URLError as error:
        print(f"Could not reach GitHub: {error.reason}")
        sys.exit(2)
    if release.get("draft"):
        return None
    return release


def main():
    check = "--check" in sys.argv
    release_json = None
    for index, argument in enumerate(sys.argv):
        if argument == "--release-json" and index + 1 < len(sys.argv):
            release_json = sys.argv[index + 1]

    asset = configured_asset(ROOT)
    if not asset:
        print("worker/index.js has no WINDOWS_RELEASE_ZIP constant.")
        print("The Worker cannot redirect a Windows download without one.")
        return 1

    tag = tag_of(asset)
    if not tag:
        print(f"The configured Windows asset is not a release URL: {asset}")
        print("It should be https://github.com/…/releases/download/<tag>/<file>")
        return 1

    expected = expected_tag(ROOT)
    print(f"Configured asset: {asset}")
    print(f"Release tag:      {tag}")

    # Every problem is reported, not just the first one.
    #
    # Somebody reading the output of a failed release wants to know what is
    # wrong, and a check that stops at the first thing it finds makes them
    # run it again to find the next thing. The exit code says whether
    # there was a problem; the output says all of them.
    problems = 0

    # Whether the configured tag is the version in the tree.
    #
    # This is its own failure, not a footnote on another one. A stale tag
    # means the site is serving the old package to everybody who downloads
    # it, and every other part of this check passes: the release is
    # published, the asset is in it, the redirect works and the count goes
    # up. It looks like a working site serving a working file.
    stale = bool(expected) and tag != expected
    if stale:
        print(f"VisualiserWindows/VERSION is {expected}, so the tag should be {expected}.")
        print("The site would be serving a stale package.")
        problems += 1

    release = fetch_release(tag, release_json)
    if not release:
        print(f"There is no published release for {tag}.")
        print("The Windows download would redirect to a 404.")
        problems += 1
        if check:
            print("")
            print("Publish it first, then run this again:")
            print(f'  git tag -a "{expected or tag}" -m "Vibresia for Windows beta"')
            print(f"  git push origin {expected or tag}")
            return 1
        return 0

    names = [a.get("name") for a in release.get("assets", [])]
    filename = os.path.basename(asset)
    if filename not in names:
        print(f"The release {tag} exists but has no {filename}.")
        print(f"It has: {', '.join(names) if names else 'no assets at all'}")
        problems += 1
        if check:
            return 1
        return 0

    print(f"The asset is published: {filename} in {tag}.")
    if not release.get("prerelease"):
        print("The release is not marked as a prerelease.")
        print("The Mac app finds its updates through releases/latest, so a Windows")
        print("release there would stop every Mac install from updating.")
        problems += 1

    if problems and check:
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
