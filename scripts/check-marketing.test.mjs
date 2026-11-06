// Tests for the marketing claims the site makes about itself.
//
// Every one of these is a promise the site makes to a visitor, a journalist
// or a reader. A promise that cannot be checked cannot be defended, and an
// undefended promise spends the credibility of everything around it.
//
// The failures this catches are the ones a reviewer found by reading the
// site against the code: the site promising a data flow the app cannot
// make, and the site claiming a feature it never mentions.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import assert from "node:assert/strict";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => fs.readFileSync(path.join(ROOT, file), "utf8");

// --- The privacy page must match what the app can actually do -------------

test("the privacy page does not promise a data flow the shipped build cannot make", () => {
    const privacy = read("site/privacy.html");
    // "Identify by listening" sends a fingerprint to Apple. That path is
    // behind a build flag and the entitlement has not been granted, so
    // nothing is ever sent. The page has to say so.
    assert.doesNotMatch(privacy, /sending a one-way fingerprint of a few seconds of sound\.(?!.{0,400}(cannot|has not|not been granted))/is,
        "the privacy page describes the fingerprint being sent without saying it cannot happen yet");
});

test("the privacy page says the fingerprint feature cannot run yet", () => {
    const privacy = read("site/privacy.html");
    assert.match(privacy, /has not granted|cannot run|is not available|unavailable/i,
        "the privacy page does not say that the identify-by-listening feature cannot run in the shipped build");
});

// --- The pages that load the analytics script must be able to send ----------

test("every page that loads analytics.js can actually send an event", () => {
    // analytics.js reads the key from a meta tag and returns early without
    // it, so a page with the script and no key is a page that does not
    // exist as far as measurement is concerned.
    //
    // The privacy and terms pages are the exception: they load the script
    // for the opt-out link, and they are deliberately not measured.
    const DELIBERATELY_UNMEASURED = new Set(["site/privacy.html", "site/terms.html"]);

    const pages = [];
    (function walk(dir) {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            if (entry.name.startsWith("_")) continue;
            const file = path.join(dir, entry.name);
            if (entry.isDirectory()) walk(file);
            else if (entry.name.endsWith(".html")) pages.push(file);
        }
    })(path.join(ROOT, "site"));

    const dark = [];
    for (const file of pages) {
        const html = fs.readFileSync(file, "utf8");
        if (!html.includes("/analytics.js")) continue;
        const relative = path.relative(ROOT, file);
        if (DELIBERATELY_UNMEASURED.has(relative)) continue;
        if (!html.includes('name="posthog-key"')) dark.push(relative);
    }
    assert.deepEqual(dark, [],
        "these pages load analytics.js but have no posthog-key, so they record nothing");
});

// --- The homepage must name the thing people actually use it for ----------

test("the homepage names the second-screen use case", () => {
    const home = read("site/index.html");
    // The app ships full screen and always-on-top. The strongest audience
    // for this product is people who want something on the screen they are
    // not working on, and the site never says so.
    assert.match(home, /second screen|second display|screen you are not working on|not working on/i,
        "the homepage never names the second-screen use case");
});

test("the homepage says the app can go full screen and stay on top", () => {
    const home = read("site/index.html");
    // Both are shipped features (AppState.swift: toggleFullScreen,
    // alwaysOnTop). Neither is mentioned anywhere on the site.
    assert.match(home, /full screen|fullscreen/i, "the homepage never mentions full screen");
    assert.match(home, /always on top|always-on-top|stays on top/i,
        "the homepage never mentions always on top");
});

// --- The homepage must not target an audience the product disclaims -------

test("the homepage says what the app is not, so a VJ does not expect a VJ tool", () => {
    const home = read("site/index.html");
    // The comparison pages are scrupulous about this. The homepage carries
    // the download button and has to be too.
    assert.match(home, /not a (vj|live|performance) tool|no midi.*osc|isn.?t for live shows/i,
        "the homepage never says it is not a live-performance tool");
});

// --- Third-party comparison pages must not be a dead end ------------------

test("every third-party comparison page has a way in", () => {
    // 28 pages rank for queries like "Resolume vs TouchDesigner". The
    // person who lands there is looking for a live-show tool. Vibresia is
    // not one, and the page says so nowhere. A page that has no CTA and no
    // disambiguation is a footprint, not a strategy.
    const dir = path.join(ROOT, "site", "comparison");
    const dead = [];
    for (const name of fs.readdirSync(dir)) {
        if (!name.endsWith("-vs-") && !name.endsWith(".html")) continue;
        if (!name.includes("-vs-")) continue;
        if (name.startsWith("vibresia-vs-")) continue;
        const html = fs.readFileSync(path.join(dir, name), "utf8");
        const hasCta = /class="cta"/.test(html);
        const hasDisambiguation = /not a live|live-show tool|not for live shows|Vibresia is not/i.test(html);
        if (!hasCta && !hasDisambiguation) dead.push(name);
    }
    assert.deepEqual(dead, [],
        "these third-party comparison pages have neither a call to action nor a disambiguation");
});

// --- The gallery has to be findable by the person who made the thing -------

test("gallery cards link to the author's other work", () => {
    const worker = read("worker/index.js");
    // "by Priya" is currently a plain span. A gallery where the author is
    // text is a catalogue, not a community: there is nowhere to go from a
    // name.
    assert.match(worker, /card-by[^\n]*<a|by <a href="[^"]*by=|href="\/vibescapes\?by=/,
        "the gallery card does not link the author to their other work");
});

// --- The share message must credit the maker ------------------------------

test("the share pitch names the author", () => {
    const view = read("VisualiserMac/Sources/VisualiserMac/UI/ShareVibescapeView.swift");
    // The text that lands in someone's chat is the highest-frequency string
    // in the whole loop. If it does not carry the maker's name, the maker
    // gets no credit in the channel where the sharing happens.
    const pitch = view.match(/private var pitch: String \{[\s\S]*?\n    \}/);
    assert.ok(pitch, "could not find the share pitch");
    assert.match(pitch[0], /author/i,
        "the share pitch does not name the author");
});
