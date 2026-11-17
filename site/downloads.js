// Vibresia's platform-aware download button.
//
// The site is static and serves one page to everybody, but the app comes in
// two packages: the original for Apple silicon Macs, and a community-built
// beta for 64-bit Windows. A visitor who came here to install the thing
// wants the package their machine can run, and a button that says "Download
// for Mac" on a Windows PC is a dead end.
//
// So this script works out what the visitor is on and points the buttons at
// the package that matches. Three rules keep it honest:
//
//   - Detection is an accelerator, never a gate. The static markup says
//     "Download for Mac", because that is what a visitor with no JavaScript
//     sees, and an unknown platform leaves the page exactly as it was.
//   - An explicit choice is always there too. The homepage offers macOS and
//     Windows side by side, so somebody who came to the wrong button — or
//     whose browser says the wrong thing — can pick the other one.
//   - Only a generic platform label is rewritten. The search pages say
//     things like "Try Vibresia free with Spotify", and that sentence is
//     the page's editorial point: it is about the app, not about the
//     platform, and it is still true on Windows. So an editorial button
//     keeps its words and only its route changes.
//
// The attribute contract:
//
//   data-install              this is a download button. Its route changes
//                             to match the visitor's platform.
//   data-install-platform     this button's text IS a platform label
//                             ("Download for Mac"), so its text may be
//                             rewritten too.
//
// A button with only `data-install` is an editorial CTA and keeps its text.
//
// The script is loaded from the shared footer, before mobile.js. That order
// matters: mobile.js remembers what each button said so it can put the
// text back when the visitor is not on a phone, and it takes that label
// from the button as it finds it. Running first means the label it
// remembers is the platform-aware one.

(function () {
  "use strict";

  /// The two packages the site ships, and what each one's button says.
  var PLATFORMS = {
    mac: { href: "/download", label: "Download for Mac" },
    windows: { href: "/download/windows", label: "Download for Windows" },
  };

  /// What machine is this?
  ///
  /// The user agent is the only thing a browser tells us about the machine
  /// it is on, and it is a string that lies about itself in a dozen ways —
  /// so this asks the narrow question: is this a Mac, or is this Windows?
  ///
  /// Anything else is null: a Linux box, a phone, a crawler, an empty
  /// string. A phone is not a Mac, even though an iPhone's agent says
  /// "like Mac OS X", because a phone gets the share sheet rather than a
  /// package it cannot install.
  function detectPlatform(userAgent) {
    var ua = String(userAgent || "");
    // Windows first: some Windows agents also carry "Mac OS X" for
    // compatibility, and a Windows machine must not be handed the Mac app.
    if (/Windows/i.test(ua)) return "windows";
    // A phone or tablet is not a Mac, however much it says "like Mac OS X".
    // The app does not run on one, and the phone flow is the share sheet.
    if (/iPhone|iPad|iPod/i.test(ua)) return null;
    if (/Macintosh|Mac OS X/i.test(ua)) return "mac";
    return null;
  }

  /// The download route, keeping whatever the link was carrying.
  ///
  /// The query string holds the `src` — which button was pressed — and the
  /// analytics read it to say where a download came from. Swapping the path
  /// and dropping the query would lose that, so the query is carried over.
  function routeFor(href, platform) {
    var target = PLATFORMS[platform].href;
    var query = "";
    var mark = String(href || "").indexOf("?");
    if (mark !== -1) {
      query = String(href).slice(mark);
      // A fragment is not part of the request, and the download route has
      // nothing to anchor to.
      var hash = query.indexOf("#");
      if (hash !== -1) query = query.slice(0, hash);
    }
    return target + query;
  }

  /// Changes every install button on the page to the given platform.
  ///
  /// Every `[data-install]` button's route changes, because the package the
  /// visitor can run is the package they should be sent to. Only the
  /// buttons marked `data-install-platform` have their text rewritten: the
  /// others say something specific about the app, and that sentence is
  /// still true on the other platform.
  ///
  /// A platform of null changes nothing at all: the page keeps the Mac CTA
  /// it shipped with, and the explicit chooser does the rest.
  function applyDownloads(doc, platform, body) {
    if (!platform || !PLATFORMS[platform]) return;
    var chosen = PLATFORMS[platform];
    var buttons = doc.querySelectorAll("[data-install]");
    for (var i = 0; i < buttons.length; i++) {
      var el = buttons[i];
      // The label a platform button should carry. It is written down
      // before the text changes, because the text is about to change and
      // the label is the original.
      if (isPlatformButton(el)) {
        el.textContent = chosen.label;
      }
      el.href = routeFor(el.getAttribute("href"), platform);
      el.dataset.platform = platform;
    }
    // The body carries it too, so a stylesheet or another script can ask
    // what platform the page thinks it is on.
    if (body) body.dataset.platform = platform;
  }

  /// Whether this button's text is a generic platform label.
  ///
  /// The attribute is the whole answer. Guessing from the text would be
  /// wrong in both directions: "Download for Mac" is a platform label, and
  /// "Try Vibresia free with Spotify" is not, and no rule that reads the
  /// words gets both right for the whole site.
  function isPlatformButton(el) {
    return !!(el.hasAttribute && el.hasAttribute("data-install-platform"));
  }

  var api = {
    detectPlatform: detectPlatform,
    applyDownloads: applyDownloads,
    isPlatformButton: isPlatformButton,
    routeFor: routeFor,
    PLATFORMS: PLATFORMS,
  };

  // The global, for the page and for the tests.
  if (typeof globalThis !== "undefined") globalThis.VibresiaDownloads = api;

  // The startup, when there is a document to change.
  if (typeof document !== "undefined" && typeof navigator !== "undefined") {
    var start = function () {
      applyDownloads(document, detectPlatform(navigator.userAgent), document.body);
    };
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", start);
    } else {
      start();
    }
  }
})();
