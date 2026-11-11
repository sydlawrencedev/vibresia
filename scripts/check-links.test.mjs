// Tests for the link check's llms.txt coverage rule.
//
//   node --test scripts/check-links.test.mjs
//
// The rule exists because three pages were published without being added to
// llms.txt, and nothing noticed. Plex, Twitch and Parachord each had a page
// of their own, and the file that tells an answer engine what the site is
// left all three out. These tests are what makes the next one a build
// failure rather than a gap nobody sees.

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { check, llmsGaps, llmsPaths, sitemapPaths } from "./check-links.mjs";

/** A throwaway site tree with the files the check reads. */
function fixture({ llms, sitemaps }) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "llms-cov-"));
    fs.writeFileSync(path.join(root, "llms.txt"), llms);
    fs.mkdirSync(path.join(root, "sitemaps"), { recursive: true });
    for (const [name, text] of Object.entries(sitemaps)) {
        fs.writeFileSync(path.join(root, "sitemaps", name), text);
    }
    return root;
}

const sitemapXml = (paths) =>
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths
        .map((p) => `  <url><loc>https://vibresia.com${p}</loc></url>`)
        .join("\n")}\n</urlset>\n`;

test("a page in a sitemap and missing from llms.txt is reported", () => {
    const root = fixture({
        llms: "- [One](https://vibresia.com/blog/one): a page\n",
        sitemaps: { "blog.xml": sitemapXml(["/blog/one", "/blog/two"]) },
    });
    assert.deepEqual(llmsGaps(root), ["/blog/two"]);
});

test("a page in a sitemap and present in llms.txt is not reported", () => {
    const root = fixture({
        llms: "- [One](https://vibresia.com/blog/one): a page\n",
        sitemaps: { "blog.xml": sitemapXml(["/blog/one"]) },
    });
    assert.deepEqual(llmsGaps(root), []);
});

test("a bare URL in prose counts as coverage, not only a Markdown link", () => {
    const root = fixture({
        llms: "Install it, then read https://vibresia.com/blog/one for the details.\n",
        sitemaps: { "blog.xml": sitemapXml(["/blog/one"]) },
    });
    assert.deepEqual(llmsGaps(root), []);
});

test("the homepage and the author page are not search landing pages, so they are not required", () => {
    const root = fixture({
        llms: "- [One](https://vibresia.com/blog/one): a page\n",
        sitemaps: { "blog.xml": sitemapXml(["/", "/author/syd-lawrence", "/blog/one"]) },
    });
    assert.deepEqual(llmsGaps(root), []);
});

test("a trailing slash does not make a covered page look uncovered", () => {
    const root = fixture({
        llms: "- [Gallery](https://vibresia.com/vibescapes/): the gallery\n",
        sitemaps: { "blog.xml": sitemapXml(["/vibescapes"]) },
    });
    assert.deepEqual(llmsGaps(root), []);
});

test("the site's own llms.txt covers every landing page in its own sitemaps", () => {
    const gaps = llmsGaps();
    assert.deepEqual(gaps, [], `llms.txt is missing: ${gaps.join(", ")}`);
});

test("the link check reports the llms.txt gap alongside the other findings", () => {
    const { notInLlms } = check();
    assert.deepEqual(notInLlms, []);
});

test("sitemapPaths reads every sitemap, including the top level one", () => {
    const paths = sitemapPaths();
    assert.ok(paths.includes("/"), "the top level sitemap lists the homepage");
    assert.ok(paths.length > 1, "there is more than one sitemap");
});

test("llmsPaths finds the paths in the site's own llms.txt", () => {
    const paths = llmsPaths();
    assert.ok(paths.has("/blog/apple-music-visualizer"));
    assert.ok(paths.has("/vibescapes"));
});
