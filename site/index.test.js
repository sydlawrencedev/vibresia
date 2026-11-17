// Tests for the homepage's two-platform copy: node --test site/index.test.js
//
// The homepage used to say there was no Windows version and would not be
// one. That was true when it was written and false now, and a false claim
// on the front page is worse than a missing feature: it tells somebody
// looking for a Windows build that there is not one.
//
// So these tests assert the things the copy has to say, in the page's own
// markup. They are about the words, because the words are the feature here:
// the routes and the buttons are covered by the Worker's tests and by
// site/downloads.test.js.

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const HOME = fs.readFileSync(path.join(HERE, "index.html"), "utf8");

/// What a reader sees: tags gone, entities decoded, whitespace collapsed.
function visibleText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&").replace(/&#39;|&rsquo;/g, "'").replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/\s+/g, " ");
}

const TEXT = visibleText(HOME);

test("the homepage does not claim there is no Windows version", () => {
  // The old copy: "There is no Intel, Windows, Linux, iPhone or Android
  // version, and there is not going to be one."
  assert.doesNotMatch(TEXT, /no Intel, Windows/i);
  assert.doesNotMatch(TEXT, /not going to be one/i);
  assert.doesNotMatch(TEXT, /Mac only/i);
});

test("the homepage says both operating systems", () => {
  assert.match(TEXT, /macOS/);
  assert.match(TEXT, /Windows/);
  // The requirements, not just the names. A reader needs to know whether
  // their machine qualifies before they download anything.
  assert.match(TEXT, /macOS 14\.2 or later/);
  assert.match(TEXT, /64-bit Windows/);
});

test("there is an explicit macOS choice and an explicit Windows choice", () => {
  // The button changes itself for the visitor's platform, but a guess is
  // not a decision. Both routes have to be in the markup, so somebody on
  // the wrong one can pick the other.
  assert.match(HOME, /href="\/download\/windows\?src=[^"]*"/, "a link to the Windows route");
  assert.match(HOME, /href="\/download\?src=[^"]*"/, "a link to the Mac route");
  // The chooser is in the hero and again after the gallery, because the
  // page is very long on a phone.
  assert.ok(
    HOME.match(/class="platform-choices"/g).length >= 2,
    "the choices are offered in more than one place"
  );
});

test("the Windows choice is labelled as a beta", () => {
  assert.match(HOME, />Windows beta</, "the Windows link says it is a beta");
});

test("the install steps say how to install on Windows", () => {
  assert.match(TEXT, /On a Mac/);
  assert.match(TEXT, /On Windows/);
  // The three things a Windows visitor gets wrong if they are not told.
  assert.match(TEXT, /Unzip the whole ZIP/i);
  assert.match(TEXT, /Vibresia\.exe/);
  assert.match(TEXT, /SmartScreen/);
  assert.match(TEXT, /More info/);
  assert.match(TEXT, /Run anyway/);
});

test("the homepage credits the Windows author, with a link", () => {
  assert.match(TEXT, /Llew Roberts/);
  assert.match(HOME, /href="https:\/\/github\.com\/L13w"/, "a link to their GitHub profile");
  // The credit is visible on the page, not only in the metadata.
  assert.ok(TEXT.includes("Llew Roberts (@L13w)"), "the credit names their handle too");
});

test("the structured data describes both packages", () => {
  const [, body] = HOME.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  const data = JSON.parse(body);
  const apps = (data["@graph"] || [data]).filter((n) => n["@type"] === "SoftwareApplication");
  assert.ok(apps.length >= 2, "the Mac app and the Windows app are both described");

  const mac = apps.find((n) => n["@id"] === "https://vibresia.com/#app");
  const windows = apps.find((n) => n["@id"] === "https://vibresia.com/#windows-app");
  assert.ok(mac, "the Mac app is described");
  assert.ok(windows, "the Windows app is described");

  assert.match(mac.operatingSystem, /macOS/);
  assert.match(windows.operatingSystem, /Windows/);
  assert.match(mac.operatingSystem, /Windows/, "the Mac node says the app is for Windows too");

  // Both packages are downloadable, and the Windows one is not the Mac's
  // `latest` release: that release holds Vibresia.zip, the Mac updater's
  // file, and a Windows visitor sent there gets the wrong app.
  const windowsUrls = [].concat(mac.downloadUrl, windows.downloadUrl);
  assert.ok(windowsUrls.some((u) => /Vibresia-Windows-x64\.zip$/.test(u)), "a Windows package");
  assert.ok(
    windowsUrls.some((u) => /windows-v/.test(u)),
    "the Windows package is on a versioned prerelease"
  );
  assert.ok(
    !windowsUrls.some((u) => /releases\/latest\/download\/Vibresia\.zip/.test(u) && u === windows.downloadUrl),
    "the Windows download is not GitHub's latest release"
  );
});

test("the FAQ asks about both platforms and the page shows both questions", () => {
  const [, body] = HOME.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  const data = JSON.parse(body);
  const faq = (data["@graph"] || [data]).find((n) => n["@type"] === "FAQPage");
  const questions = faq.mainEntity.map((q) => q.name);
  assert.ok(
    questions.some((q) => /Windows version/.test(q)),
    "the FAQ asks about the Windows version"
  );
  assert.ok(
    questions.some((q) => /run on/.test(q)),
    "the FAQ asks what it runs on"
  );
  // The schema check requires each question to be visible on the page.
  for (const question of questions) {
    assert.ok(TEXT.includes(question), `"${question}" is on the page`);
  }
});

test("the privacy claim covers the Windows app too", () => {
  // The old copy was "Your audio stays on your Mac". The Windows app makes
  // no network connections at all, and the claim should say so.
  assert.doesNotMatch(TEXT, /Your audio stays on your Mac/);
  assert.match(TEXT, /Your audio stays on your machine/);
  assert.match(TEXT, /no network connections/i);
});
