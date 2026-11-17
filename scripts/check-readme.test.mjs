// Tests for the README's Discord section: node --test scripts/check-readme.test.mjs
//
// The README says what the Worker does, and it used to say a download posts
// an embed to Discord. It stopped doing that: a download is counted in the
// analytics and nothing else is sent anywhere. Discord now receives gallery
// announcements and crash reports.
//
// A README that says the wrong thing about what the code does is worse
// than one that says nothing, because it is what somebody reads to find out
// whether a change is safe. So this reads the Worker to find out what it
// really sends to Discord, and checks that the README agrees.
//
//   node --test scripts/check-readme.test.mjs

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const README = fs.readFileSync(path.join(ROOT, "README.md"), "utf8");
const WORKER = fs.readFileSync(path.join(ROOT, "worker", "index.js"), "utf8");

/// The part of the Worker that answers a download.
function handleDownload() {
  const start = WORKER.indexOf("function handleDownload");
  const end = WORKER.indexOf("function postDownloadEvent");
  assert.ok(start !== -1 && end > start, "the Worker has no download handler");
  return WORKER.slice(start, end);
}

test("the Worker does not post a download to Discord", () => {
  // The ground truth, read out of the Worker's own source.
  assert.doesNotMatch(
    handleDownload(),
    /postDiscord/,
    "handleDownload posts to Discord, so the README has to say so"
  );
});

test("the README does not say a download is posted to Discord", () => {
  assert.doesNotMatch(
    README,
    /posts an embed to Discord/i,
    "the README still says a download posts an embed"
  );
  assert.doesNotMatch(
    README,
    /download notifications \(Discord\)/i,
    "the README still has the old section heading"
  );
  assert.doesNotMatch(
    README,
    /DISCORD_NOTIFICATIONS_ENABLED/,
    "the README names a flag the Worker does not have"
  );
});

test("the README says what Discord does receive", () => {
  assert.match(README, /## Discord notifications/);
  assert.match(README, /gallery/i, "the README does not mention the gallery");
  assert.match(README, /crash report/i, "the README does not mention crash reports");
  assert.match(README, /not\*{0,2} downloads/i, "the README does not say downloads are excluded");
});

test("the README's anchor for the Discord section resolves", () => {
  // The deploy steps link to it by anchor. A renamed heading with a stale
  // link sends somebody to the top of the file.
  const heading = README.match(/^## (Discord notifications)$/m);
  assert.ok(heading, "the README has a Discord section");
  const anchor = heading[1]
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, "")
    .trim()
    .replace(/\s+/g, "-");
  assert.match(
    README,
    new RegExp(`\\(#${anchor.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\)`),
    `something links to #${anchor}`
  );
});
