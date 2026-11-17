# Windows and macOS Download Experience Design

**Date:** 2026-11-17

## Goal

Publish Vibresia's community-built Windows beta from the website, with platform-aware download calls to action, a manual platform fallback, distinct download analytics, and clear attribution to the Windows port's author.

## Release status

PR #50 is the source of the Windows application and has been squash-merged into `main`. Its merge commit is `c96d5250ac64063576cb0e869477b62794592905`. The Windows workflow on that merge passes the test, publish and package steps. The first Windows prerelease is published from the `windows-v*` tag; the website must not point at a prerelease asset until that release exists.

## Product positioning

Vibresia is available for:

- macOS 14.2 or later on Apple silicon: the original, signed and notarised application.
- Windows 10/11 x64: a community-built beta by Llew Roberts (`@L13w`), packaged as a portable ZIP.

Windows is a beta rather than a parity release. Its currently unavailable features remain documented in `VisualiserWindows/README.md`; site copy must not imply that the platforms are identical.

## Download routing

The Worker keeps `/download` as the macOS route and adds `/download/windows` as the Windows route. Both routes use the same counting rules, automated-request filtering and redirect status. The analytics event gains a `platform` property (`mac` or `windows`).

The Windows route redirects to the versioned `windows-vX.Y.Z` prerelease asset. The URL is kept in one Worker constant and updated by the release process; the site never redirects to GitHub's generic `latest` release for Windows because that release may contain the Mac updater's `Vibresia.zip`.

## Platform-aware website behaviour

A shared script, `site/downloads.js`, detects the visitor's platform and updates every element marked `data-install`:

- Windows becomes `Download for Windows` and links to `/download/windows`.
- macOS becomes `Download for Mac` and links to `/download`.
- Unknown platforms keep the Mac CTA in the static markup so the page remains useful without JavaScript.

The label rewrite applies only to buttons whose text is a generic platform
label, which are marked `data-install-platform`. The search pages' calls to
action say things like "Try Vibresia free with Spotify": that sentence is the
page's editorial point, it is about the app rather than about the platform,
and it is still true on Windows. So an editorial button marked only
`data-install` keeps its words and only its route changes. Every button's
route changes, because the package the visitor can run is the package they
should be sent to.

A small platform chooser is rendered beside the hero CTA, in the install
section, and after the gallery. It always offers explicit macOS and Windows links, so detection is an accelerator rather than a gate. The Windows choice is labelled as a community-built beta and links to the Windows download route. Mobile behaviour continues to use the existing share-sheet flow.

## Website content

The homepage's hero, metadata, structured data, platform requirements, privacy claims and FAQ are revised to describe both operating systems without claiming full feature parity. The Windows author is credited as Llew Roberts (`@L13w`) with a link to their GitHub profile. The install section contains separate macOS and Windows instructions, including the unsigned-app SmartScreen warning and the requirement to unzip the whole ZIP.

The shared footer CTA is platform-aware. Generated blog and comparison pages retain their Mac-focused editorial intent but their download links still route correctly on Windows. Share pages continue to describe the Mac app's `Open in Vibresia` deep link, while their fallback download CTA can select the Windows package.

## Error handling

- If Windows release lookup is unavailable, the Worker keeps serving the last configured Windows asset URL rather than failing the request.
- Missing or unusual user agents keep the default macOS route and explicit chooser.
- The Windows download remains a ZIP; the site does not imply that it is signed or notarised.
- Link preview and automated requests continue to receive the file without being counted.

## Verification

- Worker tests cover macOS and Windows redirects, platform analytics and route isolation.
- Site tests cover Windows, macOS and unknown-user-agent CTA changes and manual fallback links.
- Existing site, Worker, link, schema and generated-page checks remain green.
- The first Windows prerelease is downloaded and its SHA-256 file is checked before the site is deployed.
