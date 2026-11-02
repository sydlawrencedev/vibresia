// Tests for the search-page generator, and for the pages it builds.
//
// The generator's job is to refuse: a price nobody checked, a weakness with
// no source, a page too thin to publish. Each refusal has a test that asks
// for the wrong thing. The rest check the built pages for what crawlers and
// the playbook need (docs/seo.md, Phases 2a, 3 and 4).

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { DATA } from "./check-competitors.mjs";
import { render, loadPages, helpers, money, longDate, MIN_WORDS } from "./generate-seo-pages.mjs";

const records = JSON.parse(fs.readFileSync(DATA, "utf8"));
const pages = await loadPages(records);
const built = pages.map(({ fn, page }) => ({ page, html: render(fn, records) }));

const filler = Array(MIN_WORDS).fill("word").join(" ");

function page(overrides = {}) {
    return (h) => ({
        slug: "test-page", template: "2a", publishedISO: "2026-11-02", updatedISO: "2026-11-02",
        title: "Test", description: "A test page.", eyebrow: "Test", breadcrumb: "Test", h1: "Test",
        answer: filler, cta: "Try it", sections: [], faq: [], related: [],
        ...(typeof overrides === "function" ? overrides(h) : overrides),
    });
}

function ldJson(html) {
    const m = html.match(/<script type="application\/ld\+json">\n([\s\S]*?)\n<\/script>/);
    return JSON.parse(m[1]);
}

test("prices are written in their own currency", () => {
    assert.equal(money({ price: "6.99", currency: "USD" }), "US$6.99");
    assert.equal(money({ price: "299", currency: "EUR" }), "€299");
    assert.equal(money({ price: "0", currency: "USD" }), "Free");
    assert.equal(longDate("2026-11-02"), "2 November 2026");
});

test("no data, no price: asking for a price that isn't in the record fails", () => {
    const { h } = helpers(records);
    assert.throws(() => h.price("projectm"), /no pricing section/);
    assert.throws(() => h.rec("not-a-competitor"), /no competitor record/);
    assert.throws(() => h.limit("phosphor"), /no limit/);
});

test("the price column says so when there's no price", () => {
    const { h } = helpers(records);
    assert.equal(h.priceCell("projectm"), "Open source (LGPL)");
    assert.equal(h.priceCell("projectmilksyphon"), "Not listed on its site");
    assert.equal(h.priceCell("phosphor"), "US$6.99, one-time");
});

test("a page under the word count doesn't build", () => {
    assert.throws(() => render(page({ answer: "Too short." }), records), /under the 600/);
});

test("a page using a banned phrase doesn't build", () => {
    assert.throws(() => render(page({ answer: `${filler} Let's delve in.` }), records), /uses "delve"/);
});

test("a weakness in the page's own words needs a source", () => {
    const entries = [{ slug: "phosphor", weakness: "It's expensive", pickIf: "you like it." }];
    const table = [{ label: "App", value: (h, s) => h.name(s) }];
    assert.throws(() => render(page({ entries, table, entriesHeading: "x" }), records), /needs weaknessSource/);
});

test("every page file is a batch-1 row in the URL plan, with one URL per query", () => {
    const rows = fs.readFileSync(path.join(path.dirname(DATA), "../url-plan.csv"), "utf8").trim().split("\n").slice(1);
    const plan = rows.map((r) => r.split(","));
    const queries = plan.map((r) => r[2]);
    assert.equal(new Set(queries).size, queries.length, "two URLs target the same query");
    for (const { page } of built) {
        const row = plan.find((r) => r[0] === `/blog/${page.slug}`);
        assert.ok(row, `${page.slug} isn't in content/url-plan.csv`);
        assert.equal(row[1], "1", `${page.slug} isn't in batch 1`);
    }
});

for (const { page, html } of built) {
    test(`${page.slug}: canonical, title and description are its own`, () => {
        assert.match(html, new RegExp(`<link rel="canonical" href="https://vibresia.com/blog/${page.slug}">`));
        assert.equal((html.match(/rel="canonical"/g) || []).length, 1);
        assert.ok(page.title.length <= 65, `title is ${page.title.length} characters`);
    });

    test(`${page.slug}: structured data is plain JSON-LD a crawler can read`, () => {
        const types = ldJson(html)["@graph"].map((n) => n["@type"]);
        assert.ok(types.includes("Article"));
        assert.ok(types.includes("BreadcrumbList"));
        if (page.faq.length) assert.ok(types.includes("FAQPage"));
        if (page.entries) {
            const list = ldJson(html)["@graph"].find((n) => n["@type"] === "ItemList");
            assert.equal(list.itemListElement.length, page.entries.length);
        }
    });

    test(`${page.slug}: the call to action says where it came from`, () => {
        for (const position of ["top", "bottom"]) {
            assert.match(html, new RegExp(`href="/download\\?src=seo-${page.slug}-${position}"`));
        }
        assert.match(html, new RegExp(`data-template="${page.template}" data-slug="${page.slug}"`));
    });

    test(`${page.slug}: every outside link is listed in the sources`, () => {
        const sources = html.slice(html.indexOf('<section class="sources">'));
        const main = html.slice(html.indexOf("<main>"), html.indexOf('<section class="sources">'));
        const ignore = ["https://vibresia.com/", "https://github.com/sydlawrencedev/vibresia"];
        for (const [, href] of main.matchAll(/href="(https?:[^"]+)"/g)) {
            if (ignore.some((i) => href.startsWith(i))) continue;
            // Homepages can differ from the page a fact came from, so a link
            // to an app needs that app's name in the sources, at least.
            const record = records.find((r) => r.homepage === href || JSON.stringify(r).includes(`"${href}"`));
            assert.ok(record, `${href} isn't a page any record cites`);
            assert.ok(sources.includes(record.name), `${record.name} is linked but not in the sources`);
        }
    });
}
