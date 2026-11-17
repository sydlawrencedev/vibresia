# Windows Download Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish Vibresia's community-built Windows beta with platform-aware download CTAs, separate Mac and Windows download routes, accurate site messaging, and attribution to the Windows author.

**Architecture:** The Cloudflare Worker owns platform-specific release URLs and download analytics. A shared static-site script owns browser platform detection and updates all `data-install` elements; explicit chooser links provide a JavaScript-independent fallback. The homepage carries broad two-platform messaging while generated Mac-focused pages retain their editorial focus.

**Tech Stack:** Cloudflare Workers JavaScript, Node.js test runner, static HTML/CSS/JavaScript, GitHub Actions.

---

## File structure

- `worker/index.js`: platform-specific release constants, route dispatch and download analytics platform property.
- `worker/index.test.js`: route and analytics regression coverage.
- `site/downloads.js`: platform detection, CTA mutation and platform chooser behaviour.
- `site/downloads.test.js`: browser-behaviour unit tests using lightweight DOM fixtures.
- `site/index.html`: two-platform hero, install instructions, metadata, structured data, FAQ and author credit.
- `site/_partials/footer.html`: shared platform-aware download CTA and script include.
- `scripts/inject-chrome.py`: preserves the shared footer script include, and checks the order it loads in.
- `.github/workflows/windows.yml`: publishes the versioned prerelease asset used by the Worker.

The script is loaded from the shared footer, not the nav. The footer is
where `mobile.js` already lives, and the two have to load in that order:
`mobile.js` remembers each button's label so it can put it back when the
visitor is not on a phone, and it takes that label from the button as it
finds it. So `downloads.js` changes the button first. `site/_partials/nav.html`
does not change, and `scripts/inject-chrome.py` is what enforces the order.

The site's pages name the packages by the site's own routes
(`/download` and `/download/windows`), never by a GitHub asset URL. The Worker
holds the one copy of a release asset URL, so a release republished under a
new tag changes one constant rather than the page and the Worker at once.

### Task 1: Add the Windows release and Worker route

**Files:**
- Modify: `worker/index.js`
- Test: `worker/index.test.js`

- [ ] **Step 1: Write the failing Worker tests**

Add a `WINDOWS_RELEASE_ZIP` constant matching the configured versioned asset and tests asserting that `/download/windows` redirects to it, `/download` remains the Mac route, and the analytics event includes `platform`.

```js
const WINDOWS_RELEASE_ZIP =
  "https://github.com/sydlawrencedev/vibresia/releases/download/windows-v0.1.0/Vibresia-Windows-x64.zip";

test("Windows download redirects to the Windows beta asset", async () => {
  const { response } = await run("https://vibresia.com/download/windows?src=hero", {
    headers: { "user-agent": BROWSER_UA },
  });
  assert.equal(response.status, 302);
  assert.equal(response.headers.get("location"), WINDOWS_RELEASE_ZIP);
});

test("download analytics distinguish macOS and Windows", async () => {
  const { events } = await run("https://vibresia.com/download/windows?src=hero", {
    headers: { "user-agent": BROWSER_UA },
  });
  assert.equal(events[0].body.properties.platform, "windows");
});
```

- [ ] **Step 2: Run the Worker tests and verify they fail**

Run: `node --test worker/index.test.js`
Expected: FAIL because `/download/windows` is not routed and `platform` is absent.

- [ ] **Step 3: Implement the platform-aware Worker route**

Add the Windows release constant, extend `handleDownload` with a `platform` argument, include `platform` in `postDownloadEvent`, and dispatch `/download/windows` before `/download`.

```js
const WINDOWS_RELEASE_ZIP =
  "https://github.com/sydlawrencedev/vibresia/releases/download/windows-v0.1.0/Vibresia-Windows-x64.zip";

function handleDownload(request, url, env, ctx, platform = "mac") {
  const release = platform === "windows" ? WINDOWS_RELEASE_ZIP : RELEASE_ZIP;
  // existing counting logic
  ctx.waitUntil(postDownloadEvent(env, {
    source,
    referer,
    country: request.cf?.country || "",
    city: request.cf?.city || "",
    seen: seen === null ? false : seen === "1",
    platform,
  }));
  return Response.redirect(release, 302);
}
```

- [ ] **Step 4: Run the Worker tests and verify they pass**

Run: `node --test worker/index.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add worker/index.js worker/index.test.js
git commit -m "feat: route Windows downloads separately"
```

### Task 2: Add shared platform-aware download behaviour

**Files:**
- Create: `site/downloads.js`
- Create: `site/downloads.test.js`
- Modify: `site/_partials/footer.html`
- Modify: `scripts/inject-chrome.py`
- Modify: `scripts/generate-share-pages.py`

- [ ] **Step 1: Write failing platform-detection tests**

Create Node tests for a pure `detectPlatform(userAgent)` function and CTA mutation helper. Cover Windows, macOS, Linux and unknown agents.

```js
test("Windows user agents select the Windows download", () => {
  assert.equal(detectPlatform("Mozilla/5.0 (Windows NT 10.0; Win64; x64)"), "windows");
});

test("macOS user agents select the Mac download", () => {
  assert.equal(detectPlatform("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"), "mac");
});
```

- [ ] **Step 2: Run the tests and verify they fail**

Run: `node --test site/downloads.test.js`
Expected: FAIL because `site/downloads.js` does not exist.

- [ ] **Step 3: Implement `site/downloads.js`**

Export `detectPlatform` for tests and update every `[data-install]` element when a supported platform is detected.

```js
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.VibresiaDownloads = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  function detectPlatform(userAgent) {
    const ua = String(userAgent || "");
    if (/Windows/i.test(ua)) return "windows";
    if (/Macintosh|Mac OS X/i.test(ua)) return "mac";
    return null;
  }

  function applyDownloads(doc, platform, nav) {
    if (!platform) return;
    const href = platform === "windows" ? "/download/windows" : "/download";
    const label = platform === "windows" ? "Download for Windows" : "Download for Mac";
    doc.querySelectorAll("[data-install]").forEach((el) => {
      el.textContent = label;
      el.href = href;
      el.dataset.platform = platform;
      if (nav) nav.dataset.platform = platform;
    });
  }

  return { detectPlatform, applyDownloads };
});
```

Add DOM-ready startup:

```js
if (typeof document !== "undefined") {
  const start = () => applyDownloads(document, detectPlatform(navigator.userAgent), document.body);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
}
```

**The attribute contract.** `data-install` marks a download button, and its
route changes to match the visitor's platform. `data-install-platform` marks
the buttons whose *text* is a generic platform label ("Download for Mac"),
and only those have their text rewritten. A button with only `data-install`
is an editorial CTA: the search pages say "Try Vibresia free with Spotify",
and that sentence is the page's editorial point, so on Windows it keeps its
words and only its route changes. The link's query string is carried over
either way, because the `src` on it is which button was pressed and the
analytics read it.

- [ ] **Step 4: Run the tests and verify they pass**

Run: `node --test site/downloads.test.js`
Expected: PASS.

- [ ] **Step 5: Include the script in shared chrome**

Add `<script src="/downloads.js" defer></script>` to `site/_partials/footer.html`, **before** the `mobile.js` line, and update `scripts/inject-chrome.py` so the chrome check expects it and fails a page that loads the two the other way round.

Mark the generic platform buttons with `data-install-platform`: the footer's
download link in the partial, the homepage's hero and after-gallery buttons,
and the share pages' fallback CTA in `scripts/generate-share-pages.py`. The
search pages' editorial CTAs are left unmarked.

- [ ] **Step 6: Run the chrome check**

Run: `python3 scripts/inject-chrome.py --check "$PWD"`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add site/downloads.js site/downloads.test.js site/_partials/footer.html scripts/inject-chrome.py
git commit -m "feat: detect the visitor's download platform"
```

### Task 3: Revise the homepage for macOS and Windows

**Files:**
- Modify: `site/index.html`

- [ ] **Step 1: Update hero metadata and structured data**

Describe macOS and Windows in the description and `operatingSystem`, add `downloadUrl` values for both packages, and keep the Mac installer as `installUrl`.

The `downloadUrl` values are the site's own routes — `https://vibresia.com/download`
and `https://vibresia.com/download/windows` — not GitHub asset URLs. The Worker
holds the one copy of a release asset URL, so a release republished under a new
tag changes one constant rather than the page and the Worker at once. A copy on
the page goes stale the day the release moves, and a stale copy points at a
file that is not there.

- [ ] **Step 2: Update hero and install copy**

Use “your Mac or PC”, label the hero CTA `data-install` and `data-install-platform`, and add an explicit chooser:

```html
<p class="platform-choices">
  <a href="/download?src=hero-mac">macOS</a>
  <a href="/download/windows?src=hero-windows">Windows beta</a>
</p>
```

The chooser goes in three places, not two: beside the hero CTA, inside the
install section, and after the gallery. The install block is where somebody
who came to install the thing actually is, and on a phone it may be the only
part of the page still open.

Add separate Windows instructions: unzip the ZIP, run `Vibresia.exe`, and expect an unsigned-app SmartScreen warning with “More info” then “Run anyway”.

- [ ] **Step 3: Correct the “Mac only” section and FAQ**

Replace the false “no Windows version” claim with the beta distinction and credit Llew Roberts:

```html
<div class="fact"><h3>Mac and Windows</h3><p>The original app runs on Apple silicon Macs. The community-built Windows beta by <a href="https://github.com/L13w">Llew Roberts</a> runs on 64-bit Windows and does not yet have every Mac feature.</p></div>
```

- [ ] **Step 4: Add attribution to the visible page**

Credit Llew Roberts in the install section and footer-facing copy, including a link to `https://github.com/L13w`.

- [ ] **Step 5: Run site validation**

Run:

```bash
node scripts/check-schema.mjs
node scripts/check-links.mjs
python3 scripts/inject-chrome.py --check "$PWD"
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add site/index.html
git commit -m "feat: present Vibresia on Mac and Windows"
```

### Task 4: Publish the first Windows prerelease

**Files:**
- Modify: `.github/workflows/windows.yml`
- Modify: `worker/index.js`
- Modify: `worker/index.test.js`

- [ ] **Step 1: Confirm the Windows version**

Run: `cat VisualiserWindows/VERSION`
Expected: the version used in the `windows-v*` tag.

- [ ] **Step 2: Publish the prerelease**

Run:

```bash
git tag -a "windows-v$(cat VisualiserWindows/VERSION | tr -d '[:space:]')" -m "Vibresia for Windows beta"
git push origin "windows-v$(cat VisualiserWindows/VERSION | tr -d '[:space:]')"
gh run watch
```

Expected: the Windows workflow succeeds and creates a prerelease with `Vibresia-Windows-x64.zip` and its SHA-256 file.

- [ ] **Step 3: Update the Worker constant to the published version**

Replace the test version in `WINDOWS_RELEASE_ZIP` with the published `windows-vX.Y.Z` tag.

- [ ] **Step 4: Verify the release asset**

Run:

```bash
python3 scripts/check-windows-release.py --check "$PWD"
```

Expected: `The asset is published: Vibresia-Windows-x64.zip in windows-vX.Y.Z`.

The check reads the configured URL out of the Worker's own source, so it
cannot fall out of step with it, and it resolves the URL against GitHub. It
fails when the release is not published, when the release has no such asset,
when the release is a draft, when the release is not a prerelease (the Mac
app finds its updates through `releases/latest`, so a Windows release there
would stop every Mac install from updating), and when the tag is not the
version in `VisualiserWindows/VERSION`.

The check runs as part of the release script, not the pull-request gate: it
needs the network, and until the first prerelease is published it fails on
purpose.

- [ ] **Step 5: Run and commit the Worker tests**

Run: `node --test worker/index.test.js`
Expected: PASS.

```bash
git add worker/index.js worker/index.test.js
git commit -m "chore: point downloads at the Windows beta release"
```

### Task 5: Verify the complete change

**Files:**
- No new files.

- [ ] **Step 1: Run the full Node test suite**

Run: `npm test`
Expected: PASS.

- [ ] **Step 2: Run repository site checks**

Run:

```bash
node scripts/check-schema.mjs
node scripts/check-links.mjs
node scripts/generate-seo-pages.mjs --check
python3 scripts/inject-chrome.py --check "$PWD"
```

Expected: PASS.

- [ ] **Step 3: Analyze graph changes**

Run: `node .gitnexus/run.cjs detect-changes --scope compare --base-ref "main" --repo .`
Expected: complete report with no partial or truncated result.

- [ ] **Step 4: Review the diff**

Run: `git diff main...HEAD --stat && git diff main...HEAD -- worker/index.js site/downloads.js site/index.html`
Expected: only the Windows download site implementation and its tests.

- [ ] **Step 5: Push and open a pull request**

```bash
git push -u origin feature/windows-download-site
gh pr create --base main --head feature/windows-download-site --title "Add the Windows beta download" --body "Adds the community-built Windows beta by @L13w, platform-aware downloads for macOS and Windows, separate Worker routing and analytics, explicit platform choices, and Windows installation guidance."
```

Expected: CI runs for the Worker, site and Windows application.

- [ ] **Step 6: Merge after CI succeeds**

Run: `gh pr merge <number> --squash --delete-branch`
Expected: PR merged into `main`.
