// Tests for the shared download script: node --test site/downloads.test.js
//
// The script has two jobs. It works out what the visitor's machine is, and
// it changes the download buttons to match. The first is pure and is tested
// directly. The second needs a document, and there is no DOM library in this
// repository — so the tests bring a small one.
//
// The small one is deliberately literal: an element is an object with
// textContent, href and dataset, and the document hands back the elements
// it was given. That is enough for the script's whole job, and it is enough
// to catch the things that go wrong: the wrong label, the wrong route, a
// query string dropped on the way.

import { test } from "node:test";
import assert from "node:assert/strict";

// The script is a plain browser script — the site has no bundler and no
// module loader, so it is loaded with <script src>. Importing it here runs
// it, and the API it leaves on the global object is what the tests use.
import "./downloads.js";

const { detectPlatform, applyDownloads, PLATFORMS } = globalThis.VibresiaDownloads;

/// A link that behaves enough like one for the script's purposes.
function element({ text = "", href = "", dataset = {} } = {}) {
  const attributes = { ...dataset };
  return {
    textContent: text,
    get href() { return href; },
    set href(value) { href = value; },
    get dataset() { return attributes; },
    getAttribute(name) {
      if (name === "href") return href;
      if (name === "data-install") return "";
      return attributes[name] ?? null;
    },
    setAttribute(name, value) {
      if (name === "href") { href = value; return; }
      attributes[name] = value;
    },
  };
}

/// A document that hands back the elements it was given.
function documentOf(elements) {
  return {
    querySelectorAll(selector) {
      assert.equal(selector, "[data-install]", "the script asks for the install buttons and nothing else");
      return elements;
    },
  };
}

// --- the pure part: what machine is this? --------------------------------

test("Windows user agents select the Windows download", () => {
  assert.equal(detectPlatform("Mozilla/5.0 (Windows NT 10.0; Win64; x64)"), "windows");
  assert.equal(
    detectPlatform("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"),
    "windows"
  );
});

test("macOS user agents select the Mac download", () => {
  assert.equal(detectPlatform("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"), "mac");
  assert.equal(
    detectPlatform("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/17.0 Safari/605.1.15"),
    "mac"
  );
});

test("a Linux agent is not a Mac and not a Windows", () => {
  // Linux has no build, so there is nothing to point the button at. The
  // page keeps the Mac CTA and the explicit chooser does the rest.
  assert.equal(detectPlatform("Mozilla/5.0 (X11; Linux x86_64)"), null);
});

test("an unknown agent is left alone", () => {
  assert.equal(detectPlatform(""), null);
  assert.equal(detectPlatform(undefined), null);
  assert.equal(detectPlatform(null), null);
  assert.equal(detectPlatform("Some crawler that says nothing"), null);
});

test("an iPhone is not a Mac", () => {
  // An iPhone's user agent says "like Mac OS X". Sending a phone to the
  // Mac package is the dead end the phone share-sheet flow exists to avoid.
  assert.equal(
    detectPlatform("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1"),
    null
  );
});

test("an iPad is not a Mac either", () => {
  assert.equal(
    detectPlatform("Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1"),
    null
  );
});

// --- the part that touches the page: what does the button say? ----------

test("a Windows visitor gets the Windows button and the Windows route", () => {
  const button = element({ text: "Download for Mac", href: "/download?src=hero" });
  applyDownloads(documentOf([button]), "windows");
  assert.equal(button.textContent, "Download for Windows");
  // The attribute, not the property: the property reads back as an absolute
  // URL in a browser, and the attribute is what the page navigates to.
  assert.equal(button.getAttribute("href"), "/download/windows?src=hero");
  assert.equal(button.dataset.platform, "windows");
});

test("a macOS visitor gets the Mac button and the Mac route", () => {
  const button = element({ text: "Download for Mac", href: "/download?src=hero" });
  applyDownloads(documentOf([button]), "mac");
  assert.equal(button.textContent, "Download for Mac");
  assert.equal(button.getAttribute("href"), "/download?src=hero");
  assert.equal(button.dataset.platform, "mac");
});

test("an unknown platform leaves the button exactly as it was", () => {
  // The static markup says "Download for Mac", and that is what a visitor
  // with no JavaScript sees too. Detection is an accelerator, not a gate.
  const button = element({ text: "Download for Mac", href: "/download?src=hero" });
  applyDownloads(documentOf([button]), null);
  assert.equal(button.textContent, "Download for Mac");
  assert.equal(button.getAttribute("href"), "/download?src=hero");
  assert.equal(button.dataset.platform, undefined);
});

test("the query string survives the change of route", () => {
  // The `src` is where the download came from, and the analytics use it to
  // say which button was pressed. Losing it would make every download look
  // like it came from nowhere.
  const button = element({ text: "Download for Mac", href: "/download?src=hero" });
  applyDownloads(documentOf([button]), "windows");
  assert.match(button.getAttribute("href"), /[?&]src=hero/, "the source is still on the link");
});

test("a link with no query string gets none added", () => {
  const button = element({ text: "Download for Mac", href: "/download" });
  applyDownloads(documentOf([button]), "windows");
  assert.equal(button.getAttribute("href"), "/download/windows");
});

test("every install button on the page is changed", () => {
  const buttons = [
    element({ text: "Download for Mac", href: "/download?src=hero" }),
    element({ text: "Download for Mac", href: "/download?src=footer" }),
    element({ text: "Download for Mac", href: "/download?src=share_band" }),
  ];
  applyDownloads(documentOf(buttons), "windows");
  for (const button of buttons) {
    assert.equal(button.textContent, "Download for Windows");
    assert.match(button.getAttribute("href"), /^\/download\/windows/);
  }
});

test("the platform is recorded on the page as well as the button", () => {
  // The body carries it so a stylesheet or another script can ask what
  // platform the page thinks it is on.
  const button = element({ text: "Download for Mac", href: "/download?src=hero" });
  const body = { dataset: {} };
  applyDownloads(documentOf([button]), "windows", body);
  assert.equal(body.dataset.platform, "windows");
});

test("the supported platforms are the two the site ships", () => {
  assert.deepEqual(Object.keys(PLATFORMS).sort(), ["mac", "windows"]);
  assert.equal(PLATFORMS.windows.href, "/download/windows");
  assert.equal(PLATFORMS.windows.label, "Download for Windows");
  assert.equal(PLATFORMS.mac.href, "/download");
  assert.equal(PLATFORMS.mac.label, "Download for Mac");
});
