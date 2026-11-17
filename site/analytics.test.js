// Tests for the analytics platform property: node --test site/analytics.test.js
//
// The download event should say which platform was asked for. The Worker
// counts the download and records a `platform` property on its own side;
// this is the browser's half of the same fact, and without it the two
// halves of the count cannot be compared.
//
// The property comes from the element that was clicked. Two places put it
// there:
//
//   - `site/downloads.js` sets `data-platform` on every [data-install]
//     button, because it knows what it detected.
//   - The explicit chooser links carry it in the markup, because a link
//     that says "Windows beta" knows what it is offering whether or not
//     any JavaScript ran.
//
// So the test checks that the two agree on the attribute name, and that
// the chooser links carry it. A rename on one side and not the other is
// exactly how a property goes missing while everything still looks fine.

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DOWNLOADS = fs.readFileSync(path.join(HERE, "downloads.js"), "utf8");
const ANALYTICS = fs.readFileSync(path.join(HERE, "analytics.js"), "utf8");
const HOME = fs.readFileSync(path.join(HERE, "index.html"), "utf8");

test("the analytics sends the platform with a tracked event", () => {
  // The property is read off the element that was clicked and sent with
  // the event, so the dashboard can tell a Mac download from a Windows
  // one.
  assert.match(
    ANALYTICS,
    /props\.platform\s*=\s*el\.dataset\.platform/,
    "the tracked event does not carry the platform"
  );
});

test("the platform is only sent when the element knows one", () => {
  // A click on the coffee button was not for a platform. An empty
  // platform on every event is noise in the dashboard, and a property
  // that is sometimes there and sometimes not is harder to query than
  // one that is only there when it means something.
  assert.match(
    ANALYTICS,
    /if \(el\.dataset\.platform\)\s*props\.platform\s*=/,
    "the platform is sent whether or not the element has one"
  );
});
test("the download script and the analytics agree on the attribute", () => {
  // Both sides have to read the same attribute. If one is renamed and
  // the other is not, the property is silently empty and nothing fails.
  assert.match(
    DOWNLOADS,
    /el\.dataset\.platform\s*=/,
    "the download script does not set the platform on the button"
  );
  assert.match(
    ANALYTICS,
    /el\.dataset\.platform/,
    "the analytics does not read the platform from the button"
  );
});

test("the explicit chooser links carry their platform", () => {
  // The chooser links are not [data-install] buttons, so the download
  // script never touches them. Their platform is in their own markup: a
  // link that says "Windows beta" knows what it is offering whether or
  // not any JavaScript ran.
  //
  // A chooser link is one of the explicit platform choices, so it is
  // identified by the class its row carries rather than by a guess about
  // the placement name.
  const choosers = [...HOME.matchAll(
    /<p class="(?:platform-choices|install-choose)">(.*?)<\/p>/g,
  )].flatMap(([, row]) => [...row.matchAll(/<a\b[^>]*>/g)].map(([markup]) => markup));

  assert.ok(choosers.length > 0, "the page has chooser links");
  for (const markup of choosers) {
    assert.match(
      markup,
      /data-platform="(mac|windows)"/,
      `the chooser link says which platform: ${markup}`
    );
  }
});

test("a chooser link's platform matches the route it points at", () => {
  // The two have to agree. A link that says "macOS" but points at the
  // Windows route would report the wrong platform in the analytics.
  for (const [markup] of HOME.matchAll(/<a\b[^>]*href="\/download[^"]*"[^>]*>/g)) {
    const platform = markup.match(/data-platform="([^"]*)"/);
    if (!platform) continue;
    const windows = markup.includes("/download/windows");
    assert.equal(
      platform[1],
      windows ? "windows" : "mac",
      `the platform matches the route: ${markup}`
    );
  }
});
