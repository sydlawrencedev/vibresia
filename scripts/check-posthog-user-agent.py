#!/usr/bin/env python3
"""Check both surfaces tell PostHog who they are.

PostHog sorts the traffic it stores into human and not-human by reading the
user agent on each event. An event that carries none is classified as
automation — traffic type `Automation`, category `no_user_agent` — and
`isLikelyBot` is true for it. That is right for a server-to-server call and
wrong for a person who opened the site or the app.

Measured on 22 November 2026 against us.i.posthog.com, by posting one event
per case and reading the classification back out of the project:

    properties sent        traffic type    category         is bot
    $raw_user_agent        Regular         regular          false
    $user_agent            Automation      no_user_agent    true
    both                   Regular         regular          false
    neither                Automation      no_user_agent    true

Two things fall out of that. `$raw_user_agent` is the property that counts;
`$user_agent` on its own is read by some PostHog functions and ignored by
the classifier, so a client that sends only that is still automation. And the
classification was `Automation`, not `Bot` — a bot is a crawler, and this was
a person, so the event was filed under the wrong heading and dropped out of
every PostHog view filtered to human traffic. That filter is the one
PostHog's own documentation gives for measuring people.

Neither surface sent a user agent, so every event this project produced was
filed as automation: the whole of the site's analytics, and the whole of the
app's product analytics. Only the events the PostHog iOS SDK sends itself
were classified as regular traffic, because a mobile SDK is exempt from the
empty-user-agent rule.

So this checks that all three surfaces send `$raw_user_agent`, that none of
them sends only `$user_agent`, and that none of them sends the property
empty — an empty string is the same as no user agent at all.

Split out of check-posthog.sh so it can be run on its own.
"""
import os
import re
import sys

root = sys.argv[1] if len(sys.argv) > 1 else os.path.dirname(
    os.path.dirname(os.path.abspath(__file__)))

SURFACES = (
    ("site/analytics.js", os.path.join(root, "site/analytics.js")),
    ("Analytics.swift", os.path.join(
        root, "VisualiserMac/Sources/VisualiserMac/Analytics/Analytics.swift")),
    ("worker/index.js", os.path.join(root, "worker/index.js")),
)

for _, path in SURFACES:
    if not os.path.exists(path):
        print(f"missing {path}")
        sys.exit(1)


def without_comments(text):
    """Drops line comments so a comment explaining the fix doesn't trip the check.

    Without this, the comment that documents why the property is there
    matches the very pattern being looked for, and the check fails on
    correct code.
    """
    out = []
    for line in text.splitlines():
        # Good enough for these files: none of them has a string literal
        # containing "//" that this would mangle. The Worker has URLs in it,
        # so the tail of those lines is dropped, and nothing this check
        # looks for lives on one.
        out.append(line.split("//", 1)[0])
    return "\n".join(out)


# The property the classifier reads, and the one it does not.
RAW = re.compile(r'"?\$raw_user_agent"?\s*[:=]')
# An empty value is no user agent at all, however well spelled the key is.
EMPTY = re.compile(r'"?\$raw_user_agent"?\s*[:=]\s*""|\'\'')
# The property that looks right and is not read.
USER_ONLY = re.compile(r'"?\$user_agent"?\s*[:=]')

problems = []

for name, path in SURFACES:
    body = without_comments(open(path).read())
    raw = RAW.search(body)
    if not raw:
        if USER_ONLY.search(body):
            problems.append(
                f"{name} sends $user_agent, which the classifier ignores; it reads $raw_user_agent"
            )
        else:
            problems.append(
                f"{name} sends no user agent, so PostHog files every event it sends as automation traffic"
            )
    elif EMPTY.search(body):
        problems.append(f"{name} sends $raw_user_agent empty, which is no user agent at all")

if problems:
    print("PostHog is told nothing about who the traffic is:")
    for problem in problems:
        print(f"  x {problem}")
    print("  An event with no user agent is classified as automation, and drops out of")
    print("  every PostHog view filtered to human traffic.")
    sys.exit(1)

print("all three surfaces send $raw_user_agent, so PostHog reads them as human traffic")
