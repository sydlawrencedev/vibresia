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

/// The page's structured data, parsed once.
function structured() {
  const [, body] = HOME.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  return JSON.parse(body);
}

/// The SoftwareApplication node for the Mac app.
function macNode() {
  const data = structured();
  const apps = (data["@graph"] || [data]).filter((n) => n["@type"] === "SoftwareApplication");
  const node = apps.find((n) => n["@id"] === "https://vibresia.com/#app");
  assert.ok(node, "the Mac app has no SoftwareApplication node");
  return node;
}

/// The SoftwareApplication node for the Windows app.
function windowsNode() {
  const data = structured();
  const apps = (data["@graph"] || [data]).filter((n) => n["@type"] === "SoftwareApplication");
  const node = apps.find((n) => n["@id"] === "https://vibresia.com/#windows-app");
  assert.ok(node, "the Windows app has no SoftwareApplication node");
  return node;
}

/// Follows a node reference to the node it points at.
///
/// A reference with an "@id" and nothing else is a pointer, and the thing
/// it points at is somewhere else in the graph. Reading the pointer alone
/// tells you who it points at, not who they are.
function resolve(reference) {
  if (!reference) return null;
  if (typeof reference === "string") {
    const data = structured();
    return (data["@graph"] || [data]).find((n) => n["@id"] === reference) || null;
  }
  // A reference that carries its own fields is the node itself.
  if (reference.name) return reference;
  const data = structured();
  return (data["@graph"] || [data]).find((n) => n["@id"] === reference["@id"]) || null;
}

/// One piece of text, the same way a reader gets it: tags gone, entities
/// decoded, whitespace collapsed.
///
/// The visible FAQ and the structured FAQ have to be compared word for
/// word, so both go through this. A comparison that normalises less than
/// this would let a difference through, and a difference here is a lie.
///
/// A tag becomes a space, so a link in the middle of a sentence leaves the
/// space it needs: "built by <a>Llew Roberts</a>," is "built by Llew Roberts ,"
/// until the space before a comma is put right. A reader never sees that
/// space, so neither does this.
function clean(text) {
  return visibleText(String(text ?? ""))
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")")
    .trim();
}

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

test("there is an explicit chooser inside the install section", () => {
  // The install block is where somebody who came to install the thing
  // actually is, so it is where the choice has to be. A chooser in the
  // hero and another one after the gallery are not enough: the page is
  // very long, and on a phone the install block may be folded away
  // entirely by the time the visitor is reading it.
  const install = HOME.match(/<details class="install" id="install"[\s\S]*?<\/details>/);
  assert.ok(install, "the install block is there");

  const block = install[0];
  assert.match(block, /class="install-choose"/, "the install block has a chooser");
  assert.match(block, /href="\/download\/windows\?src=[^"]*"/, "it offers the Windows route");
  assert.match(block, /href="\/download\?src=[^"]*"/, "it offers the Mac route");
  assert.match(block, /Windows beta</, "the Windows choice says it is a beta");
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

test("every generic platform button is marked so its label may be rewritten", () => {
  // The contract: `data-install` says "this is a download button, its
  // route changes". `data-install-platform` says "its text IS a platform
  // label, so the text may be rewritten too". A generic label without the
  // second attribute keeps saying "Download for Mac" on a Windows PC.
  const generic = [...HOME.matchAll(/<a\b[^>]*>(?:Download for Mac|Download Vibresia for Mac)<\/a>/g)];
  assert.ok(generic.length > 0, "the homepage has generic platform buttons");
  for (const [markup] of generic) {
    assert.match(markup, /data-install-platform/, `marked: ${markup}`);
  }
});

test("no editorial CTA is marked as a platform button", () => {
  // A search page says "Try Vibresia free with Spotify". That sentence is
  // the page's editorial point and it is still true on Windows, so it must
  // not be rewritten into "Download for Windows".
  for (const [markup] of HOME.matchAll(/<a\b[^>]*>[^<]*(?:Try Vibresia|Get Vibresia)[^<]*<\/a>/g)) {
    assert.doesNotMatch(markup, /data-install-platform/, `not marked: ${markup}`);
  }
});

test("every download link on the page is tracked", () => {
  // A download link with no tracking is a download nobody can attribute.
  // The chooser links are the ones that were missed: they were added
  // after the buttons, and the buttons already had data-track.
  for (const [markup] of HOME.matchAll(/<a\b[^>]*href="\/download[^"]*"[^>]*>/g)) {
    assert.match(markup, /data-track="download_clicked"/, `tracked: ${markup}`);
    assert.match(markup, /data-placement="[^"]+"/, `placed: ${markup}`);
  }
});

test("every download link on the page has its own placement", () => {
  // The placement says where on the page the click came from. Two links
  // sharing one placement cannot be told apart in the dashboard, so the
  // chooser links have to have their own.
  const placements = [...HOME.matchAll(/<a\b[^>]*href="\/download[^"]*"[^>]*data-placement="([^"]+)"/g)]
    .map(([, placement]) => placement);
  assert.ok(placements.length > 0, "the page has download links");
  assert.equal(
    new Set(placements).size,
    placements.length,
    `every download link has its own placement: ${placements.join(", ")}`
  );
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

  // Both packages are downloadable, and the page names them by the site's
  // own routes. The Worker owns the asset URLs: a GitHub release URL
  // written into the page is a second copy of a fact that changes when
  // the release is republished, and the copy that gets forgotten is the
  // one that sends somebody to an asset that is not there.
  const windowsUrls = [].concat(mac.downloadUrl, windows.downloadUrl);
  assert.ok(
    windowsUrls.some((u) => /\/download\/windows$/.test(u)),
    "the Windows package is named by the site's own route"
  );
  assert.ok(
    windowsUrls.some((u) => /\/download$/.test(u)),
    "the Mac package is named by the site's own route"
  );
  assert.ok(
    !windowsUrls.some((u) => /github\.com/.test(u)),
    "the page names no release asset URL: the Worker owns those"
  );
});

test("the Mac application node describes only the Mac app", () => {
  // One node for two applications is one node that is wrong about both.
  // A search engine reading `operatingSystem: "macOS …; Windows …"` and
  // `downloadUrl: [mac, windows]` cannot tell which package it is being
  // told about, and the Windows package is a beta with different
  // features, so merging them says something untrue.
  const mac = macNode();
  assert.doesNotMatch(
    mac.operatingSystem,
    /Windows/i,
    `the Mac node names Windows: ${mac.operatingSystem}`
  );
  assert.doesNotMatch(
    mac.downloadUrl,
    /windows/i,
    `the Mac node points at the Windows package: ${mac.downloadUrl}`
  );
  assert.doesNotMatch(
    mac.installUrl,
    /windows/i,
    `the Mac node points at the Windows installer: ${mac.installUrl}`
  );
  assert.doesNotMatch(
    mac.featureList.join(" "),
    /Windows/i,
    "the Mac node lists a Windows feature"
  );
});

test("the Windows application node describes only the Windows app", () => {
  const windows = windowsNode();
  assert.match(windows.operatingSystem, /Windows/);
  assert.doesNotMatch(
    windows.operatingSystem,
    /macOS/i,
    `the Windows node names macOS: ${windows.operatingSystem}`
  );

  // The version, the download and the install are the Windows ones.
  assert.match(windows.softwareVersion, /^0\./, `the Windows version: ${windows.softwareVersion}`);
  assert.match(
    windows.downloadUrl,
    /\/download\/windows$/,
    `the Windows download: ${windows.downloadUrl}`
  );
  assert.match(
    windows.installUrl,
    /\/download\/windows$/,
    `the Windows install: ${windows.installUrl}`
  );

  // And it is Llew Roberts's app, which is the whole reason it is a
  // separate node.
  const author = resolve(windows.author);
  assert.ok(author, "the Windows app has no author");
  assert.match(author.name, /Llew Roberts/, `the Windows author: ${author.name}`);
  assert.match(
    [author.url, ...(author.sameAs || [])].join(" "),
    /github\.com\/L13w/i,
    "the Windows author is not linked to their GitHub profile"
  );
});

test("the Mac application node is not credited to the Windows author", () => {
  const mac = macNode();
  const author = resolve(mac.author);
  const id = typeof mac.author === "string" ? mac.author : mac.author["@id"];
  assert.doesNotMatch(id, /L13w/i, `the Mac author: ${id}`);
  assert.doesNotMatch(
    [author?.name, author?.url, ...(author?.sameAs || [])].filter(Boolean).join(" "),
    /L13w/i,
    "the Mac app is credited to the Windows author"
  );
});

test("the homepage names no release asset URL at all", () => {
  // The Worker holds the one copy of the Windows asset URL. A second copy
  // here would go stale the day the release is republished, and a stale
  // copy points at a file that is not there.
  assert.doesNotMatch(HOME, /windows-v\d+\.\d+\.\d+/, "no versioned Windows tag");
  // A release *asset* is a file inside a release. A link to the releases
  // index is a page, and the Mac installer's link to it is legitimate.
  assert.doesNotMatch(
    HOME,
    /github\.com\/sydlawrencedev\/vibresia\/releases\/(download|latest\/download)/,
    "no release asset URL"
  );

  // The filename itself may appear once, in the prose that tells a Windows
  // visitor what the download will be called. It must not appear as part
  // of a link.
  const links = [...HOME.matchAll(/href="([^"]*)"/g)].map(([, href]) => href);
  for (const href of links) {
    assert.doesNotMatch(href, /Vibresia-Windows-x64/, `no asset in a link: ${href}`);
    assert.doesNotMatch(href, /windows-v/, `no versioned tag in a link: ${href}`);
  }
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

test("the structured FAQ answers say what the visible ones say", () => {
  // Structured data that says something the page does not is the kind
  // search engines penalise (docs/seo.md, Phase 4), and it is a lie to
  // somebody reading it in a search result.
  //
  // Three of the answers drifted when the copy was rewritten for two
  // platforms: the visible answer said "your system's audio" and the
  // structured one still said "the Mac's system audio". The question was
  // the same on both sides, so nothing noticed.
  const [, body] = HOME.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  const data = JSON.parse(body);
  const faq = (data["@graph"] || [data]).find((n) => n["@type"] === "FAQPage");

  // The visible FAQ, in the same shape as the structured one.
  const section = HOME.match(/<section id="faq">([\s\S]*?)<\/section>/);
  assert.ok(section, "the page has a visible FAQ section");
  const visible = new Map();
  for (const [, question, answer] of section[1].matchAll(
    /<h3>([^<]*)<\/h3><p>([\s\S]*?)<\/p>/g,
  )) {
    visible.set(clean(question), clean(answer));
  }
  assert.ok(visible.size > 0, "the visible FAQ has answers");

  for (const entry of faq.mainEntity) {
    const question = clean(entry.name);
    const answer = clean(entry.acceptedAnswer.text);
    assert.ok(
      visible.has(question),
      `the question is on the page: "${question}"`
    );
    assert.equal(
      answer,
      visible.get(question),
      `the structured answer matches the visible one: "${question}"`
    );
  }
});

test("every visible FAQ question is in the structured data", () => {
  // The other direction: a question that is only on the page is not
  // searchable as a FAQ, and a question that is only in the structured
  // data is not on the page at all.
  const [, body] = HOME.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  const data = JSON.parse(body);
  const faq = (data["@graph"] || [data]).find((n) => n["@type"] === "FAQPage");
  const structured = new Set(faq.mainEntity.map((q) => clean(q.name)));

  const section = HOME.match(/<section id="faq">([\s\S]*?)<\/section>/);
  for (const [, question] of section[1].matchAll(/<h3>([^<]*)<\/h3>/g)) {
    assert.ok(
      structured.has(clean(question)),
      `the visible question is in the structured data: "${clean(question)}"`
    );
  }
});

test("the privacy claim covers the Windows app too", () => {
  // The old copy was "Your audio stays on your Mac". The Windows app makes
  // no network connections at all, and the claim should say so.
  assert.doesNotMatch(TEXT, /Your audio stays on your Mac/);
  assert.match(TEXT, /Your audio stays on your machine/);
  assert.match(TEXT, /no network connections/i);
});
