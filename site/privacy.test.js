// Tests for the privacy page's disclosures: node --test site/privacy.test.js
//
// The privacy page says what goes where. A disclosure that is wrong is
// worse than one that is missing: somebody reads it, believes it, and
// takes their data somewhere they did not mean to.
//
// The Downloads section and the "Who else sees anything" list both used to
// say that a download posts a note to the Discord chat. It stopped doing
// that: a download is counted in the analytics and nothing else is sent
// anywhere. Discord now receives gallery announcements and crash reports,
// and only those.
//
// So these tests read the Worker's own source to find out what it sends to
// Discord, and check that the privacy page says the same thing. A page
// that says something the Worker does not do is the bug.

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");
const PRIVACY = fs.readFileSync(path.join(HERE, "privacy.html"), "utf8");
const WORKER = fs.readFileSync(path.join(ROOT, "worker", "index.js"), "utf8");

/// What a reader sees: tags gone, entities decoded, whitespace collapsed.
function visibleText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&").replace(/&#39;|&rsquo;/g, "'").replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/\s+/g, " ");
}

const TEXT = visibleText(PRIVACY);

test("the Worker does not post a download to Discord", () => {
  // The ground truth, read out of the Worker's own source. If somebody
  // turns the download message back on, this fails and the privacy page
  // has to be changed with it.
  const download = WORKER.slice(
    WORKER.indexOf("function handleDownload"),
    WORKER.indexOf("function postDownloadEvent"),
  );
  assert.doesNotMatch(
    download,
    /postDiscord/,
    "handleDownload posts to Discord, so the privacy page has to say so"
  );
});

test("the privacy page does not say a download is posted to Discord", () => {
  assert.doesNotMatch(TEXT, /download notes/i, "the page still claims there are download notes");
  assert.doesNotMatch(
    TEXT,
    /post a note to our own chat/i,
    "the page still claims a download posts a note to the chat"
  );
});

test("the privacy page says what Discord does receive", () => {
  // It has to name what is sent, not just drop what is not: a reader who
  // wants to know whether anything of theirs reaches the chat needs the
  // answer, and so does the reader who wants to know it does not.
  const discord = PRIVACY.match(/<li><strong>Discord<\/strong>([\s\S]*?)<\/li>/);
  assert.ok(discord, "the page lists who else sees anything");
  const said = visibleText(discord[1]);
  assert.match(said, /gallery/i, "the Discord line does not mention the gallery");
  assert.match(said, /crash report/i, "the Discord line does not mention crash reports");
});

test("the Downloads section says the count and nothing more", () => {
  const downloads = PRIVACY.match(/<h2>Downloads<\/h2>([\s\S]*?)<h2>/);
  assert.ok(downloads, "the page has a Downloads section");
  const said = visibleText(downloads[1]);
  assert.match(said, /record that a download happened/i, "it does not say a download is counted");
  assert.match(said, /anonymous/i, "it does not say the count is anonymous");
  // The section may mention the chat to say that a note no longer goes
  // there. What it must not do is say one does.
  assert.doesNotMatch(said, /post a note to our own chat/i);
  assert.doesNotMatch(said, /we post a note/i);
});
