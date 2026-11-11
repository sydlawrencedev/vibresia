#!/usr/bin/env node
// Fills in the pictures for the shares that have none.
//
//   node scripts/backfill-share-pictures.mjs [--local] [--dry-run]
//
// A share made by an agent — through the MCP server — has no picture, because
// the server has no GPU to draw one with and the agent has no Mac to draw it
// on. The row is born with `image IS NULL`, and the share page then falls
// back to the placeholder, so a shared starfield appears in the gallery as a
// picture that says nothing about it.
//
// The drawing has to happen somewhere with a GPU, and a browser is the one
// place that is always to hand: the share page already renders the vibescape
// with WebGL for the person looking at it. So this script opens the share
// page in a headless browser, waits for it to draw, and asks it for the
// frame — then posts that frame to the same endpoint the page posts to.
//
// It goes through the site's own endpoint rather than writing to the
// database, so the picture that lands is one the site would have accepted:
// the same size, the same cap, the same permission. A backfill that wrote
// straight to D1 could put there something the site would never have let
// anybody store.
//
// Safe to run twice: the endpoint only ever fills an empty slot, so a share
// that already has a picture is left alone and the second run does nothing
// to it. The list of shares to fix is read fresh each time, so a run after
// another one only picks up what is still missing.
//
// Run it against production:
//
//   node scripts/backfill-share-pictures.mjs
//
// The browser it needs is Playwright, which is not a dependency of this
// project:
//
//   npx playwright install chromium

import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createRequire } from "node:module";

const local = process.argv.includes("--local");
const dryRun = process.argv.includes("--dry-run");
// Where the local D1 lives. It has to be the same place the local Worker
// is looking, or the two talk about different databases.
const persistTo = process.argv.includes("--persist-to")
  ? process.argv[process.argv.indexOf("--persist-to") + 1]
  : null;
// D1's commands are local unless they are told otherwise, and the point of
// this script is the live database.
const flags = local ? ["--local"] : ["--remote"];
const database = "vibresia-shares";

// Where the shares live. The script talks to the live site, because that is
// where the pictures are stored and where the permission comes from.
const site = process.env.VIBRESIA_SITE || "https://vibresia.com";

function wrangler(args, options = {}) {
  const extra = persistTo ? ["--persist-to", persistTo] : [];
  return execFileSync("npx", ["wrangler", "d1", "execute", database, ...flags, ...extra, ...args], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    ...options,
  });
}

/** The rows out of wrangler's JSON, which wraps them one level deeper than
 *  you would expect: an array of `{results: [...]}` objects. */
function rowsFrom(text) {
  const parsed = JSON.parse(text);
  const out = [];
  for (const entry of Array.isArray(parsed) ? parsed : [parsed]) {
    if (entry && Array.isArray(entry.results)) out.push(...entry.results);
    else if (entry) out.push(entry);
  }
  return out;
}

/** The shares that have no picture, and how many there are. */
function sharesWithoutPictures() {
  const rows = rowsFrom(wrangler([
    "--command",
    "SELECT id, name FROM shares WHERE image IS NULL ORDER BY created_at ASC",
    "--json",
  ]));
  return rows;
}

/** How many shares have no picture at all. */
function missingCount() {
  const counted = rowsFrom(wrangler([
    "--command",
    "SELECT COUNT(*) AS n FROM shares WHERE image IS NULL",
    "--json",
  ]));
  return Number(counted[0]?.n ?? 0);
}

/** Playwright, from wherever it happens to be.
 *
 *  It is not a dependency of this project — the site has no build step and
 *  the Worker has no browser — so it is loaded from the npm cache that
 *  `npx playwright` leaves behind, and from the project itself if it has
 *  been installed there.
 */
function loadPlaywright() {
  const require = createRequire(import.meta.url);
  const candidates = [
    "playwright",
    "playwright-core",
  ];
  for (const name of candidates) {
    try {
      return require(name);
    } catch {
      // Try the next one.
    }
  }
  // `npx playwright --version` puts the package in the npx cache. Look
  // there, so the script works without a second install.
  const cache = join(process.env.HOME || "", ".npm", "_npx");
  try {
    const { readdirSync } = require("node:fs");
    for (const entry of readdirSync(cache)) {
      for (const name of candidates) {
        try {
          return require(join(cache, entry, "node_modules", name));
        } catch {
          // Not this one.
        }
      }
    }
  } catch {
    // No cache: fall through to the message below.
  }
  throw new Error(
    "Playwright could not be found. Install it with:\n\n" +
    "  npx playwright install chromium\n"
  );
}

/** Draws one share and posts the frame.
 *
 *  The page does the drawing, because it is the page that knows how to draw
 *  a vibescape — the same WebGL contract the app uses. So this opens the
 *  share's own page, waits for the canvas to have something on it, reads
 *  the frame out of it, and posts it.
 *
 *  The capability comes from the page too: the Worker mints it when it
 *  serves the page, and puts it there. So the picture is one the site
 *  itself would have accepted.
 */
/** Why the page did not draw the vibescape.
 *
 *  A share that cannot be drawn can never have a picture, and there is no
 *  point trying again: a payload that will not decode, or a shader that
 *  will not compile. Saying so is more use than a timeout.
 */
async function whyItDidNotDraw(page) {
  const why = await page.evaluate(() => {
    const preview = document.getElementById("preview");
    const text = (preview && preview.textContent) || "";
    if (text.indexOf("Couldn't read this share link") !== -1) {
      return "the payload would not decode";
    }
    if (document.getElementById("shot-canvas")) {
      return "the shader would not compile";
    }
    return "the page drew nothing";
  });
  return why;
}

async function fillPicture(browser, id) {
  const page = await browser.newPage({
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 1,
  });
  try {
    // The page posts its own picture as soon as it has drawn one, which is
    // the thing that makes the site self-healing. It is stopped here so
    // that this script's own upload is the one that does the work: the
    // outcome is then the script's doing, rather than a race between the
    // two, and the script can say which of them filled the slot.
    await page.route("**/api/share/*/picture", (route) => route.abort());

    await page.goto(`${site}/s/${id}`, { waitUntil: "load", timeout: 30000 });

    // Wait for the picture to be drawn. The page draws the first frame
    // synchronously and then animates, so the canvas has something on it
    // as soon as the page's own script has run.
    //
    // The page unhides the picture slot when the preview succeeds, so the
    // slot being visible is the signal that the vibescape drew. A slot
    // that is still hidden means it did not — and the page says why.
    await page.waitForFunction(() => {
      const canvas = document.getElementById("shot-canvas");
      if (!canvas || !canvas.width || !canvas.height) return false;
      const wrap = document.getElementById("shot");
      if (wrap && wrap.hidden) return false;
      return true;
    }, null, { timeout: 20000 }).catch(async () => {
      // It did not draw. The page knows why, and the reason is worth more
      // than a timeout: a share whose shader does not compile can never
      // have a picture, and a share whose payload is corrupt never draws
      // at all.
      throw new Error(await whyItDidNotDraw(page));
    });

    // The picture, and the permission to store it. The page holds both.
    const shot = await page.evaluate(() => {
      const canvas = document.getElementById("shot-canvas");
      const share = window.__VIBRESIA_SHARE__ || {};
      if (!canvas || !share.pictureCapability) return null;
      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      if (!dataUrl || dataUrl.indexOf("data:image/jpeg") !== 0) return null;
      return {
        image: dataUrl.slice(dataUrl.indexOf(",") + 1),
        capability: share.pictureCapability,
      };
    });
    if (!shot) return { ok: false, error: "the page drew nothing to send" };

    const response = await fetch(`${site}/api/share/${id}/picture`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(shot),
    });
    if (!response.ok) {
      const said = await response.text();
      return { ok: false, error: `the site said ${response.status}: ${said.slice(0, 120)}` };
    }
    const result = await response.json();
    return { ok: true, stored: result.stored === true };
  } finally {
    await page.close();
  }
}

async function main() {
  console.log(`==> Reading the shares that have no picture`);
  const before = missingCount();
  const rows = sharesWithoutPictures();
  console.log(`==> ${rows.length} share(s) have no picture (${before} in total)`);

  if (rows.length === 0) {
    console.log("==> Nothing to do — every share has a picture");
    return;
  }
  if (dryRun) {
    for (const row of rows) {
      console.log(`    ${row.id}  ${row.name || "(no name)"}`);
    }
    console.log("==> Dry run: nothing was drawn and nothing was written");
    return;
  }

  const { chromium } = loadPlaywright();
  const browser = await chromium.launch({
    args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
  });
  let fixed = 0;
  let failed = 0;
  try {
    for (const row of rows) {
      const id = String(row.id);
      try {
        const result = await fillPicture(browser, id);
        if (result.ok && result.stored) {
          fixed += 1;
          console.log(`    ${id}  drew a picture`);
        } else if (result.ok) {
          // The site already had one by the time it was asked — which is
          // what happens when two runs overlap, or when somebody opened the
          // share page in the meantime.
          console.log(`    ${id}  already had a picture`);
        } else {
          failed += 1;
          console.log(`    ${id}  FAILED: ${result.error}`);
        }
      } catch (error) {
        failed += 1;
        console.log(`    ${id}  FAILED: ${error.message}`);
      }
    }
  } finally {
    await browser.close();
  }

  const after = missingCount();
  console.log(`==> ${fixed} fixed, ${failed} failed`);
  console.log(`==> ${before} share(s) had no picture, ${after} now`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
