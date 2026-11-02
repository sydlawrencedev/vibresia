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
import { render, renderHub, loadPages, helpers, money, longDate, pathOf, HUB, MIN_WORDS } from "./generate-seo-pages.mjs";
import { check as checkLinks, crawl, linksIn } from "./check-links.mjs";

const records = JSON.parse(fs.readFileSync(DATA, "utf8"));
const pages = await loadPages(records);
const all = pages.map((p) => p.page);
const built = pages.map(({ fn, page }) => ({ page, html: render(fn, records, all) }));

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

test("a head-to-head that doesn't say who should pick the other app doesn't build", () => {
    const rows = [{ label: "Price", value: (h, s) => h.priceCell(s) }];
    const versus = { template: "2c", versus: "touchdesigner", rows };
    assert.throws(() => render(page({ ...versus, verdict: { pickUs: "you want it free." } }), records), /verdict.pickThem/);
    assert.throws(() => render(page({ template: "2c", rows }), records), /needs versus/);
});

test("every page file is a planned row in the URL plan, with one URL per query", () => {
    const rows = fs.readFileSync(path.join(path.dirname(DATA), "../url-plan.csv"), "utf8").trim().split("\n").slice(1);
    const plan = rows.map((r) => r.split(","));
    const queries = plan.map((r) => r[2]);
    assert.equal(new Set(queries).size, queries.length, "two URLs target the same query");
    for (const { page } of built) {
        const row = plan.find((r) => r[0] === pathOf(page));
        assert.ok(row, `${pathOf(page)} isn't in content/url-plan.csv`);
        assert.notEqual(row[1], "later", `${page.slug} is built but planned for later`);
        assert.equal(row[5], page.template, `${page.slug} is planned as template ${row[5]}`);
    }
});

test("no page in a sitemap is an orphan, and no internal link is broken", () => {
    const { orphans, broken } = checkLinks();
    assert.deepEqual(orphans, [], "pages no link from the homepage reaches");
    assert.deepEqual(broken, [], "internal links to pages that don't exist");
});

test("the orphan check does catch an orphan", () => {
    const pages = new Map([["/", '<a href="/a">a</a>'], ["/a", ""], ["/b", '<a href="/">home</a>']]);
    const { reached, broken } = crawl(pages);
    assert.ok(!reached.has("/b"), "a page nothing links to was reached");
    assert.deepEqual(crawl(new Map([["/", '<a href="/nowhere">x</a>']])).broken, ["/ → /nowhere"]);
    assert.deepEqual([...linksIn('<a href="https://vibresia.com/x?y=1#z">')], ["/x"]);
});

test("the comparisons hub lists every head-to-head, and each links back to it and to the others", () => {
    const comparisons = all.filter((p) => p.versus);
    const hub = renderHub(comparisons, records);
    for (const c of comparisons) assert.ok(hub.includes(`href="${pathOf(c)}"`), `the hub doesn't list ${c.slug}`);
    for (const { page, html } of built.filter((b) => b.page.versus)) {
        assert.ok(html.includes(`href="${HUB.path}"`), `${page.slug} doesn't link to the hub`);
        for (const other of comparisons.filter((c) => c.slug !== page.slug)) {
            assert.ok(html.includes(`href="${pathOf(other)}"`), `${page.slug} doesn't link to ${other.slug}`);
        }
    }
});

for (const { page, html } of built) {
    test(`${page.slug}: canonical, title and description are its own`, () => {
        assert.match(html, new RegExp(`<link rel="canonical" href="https://vibresia.com${pathOf(page)}">`));
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
        if (page.versus) {
            const apps = ldJson(html)["@graph"].filter((n) => n["@type"] === "SoftwareApplication");
            assert.deepEqual(apps.map((a) => a.name).sort(), [records.find((r) => r.slug === page.versus).name, "Vibresia"].sort());
        }
    });

    test(`${page.slug}: the call to action says where it came from`, () => {
        for (const position of ["top", "bottom"]) {
            assert.match(html, new RegExp(`href="/download\\?src=seo-${page.slug}-${position}"`));
        }
        assert.match(html, new RegExp(`data-template="${page.template}" data-slug="${page.slug}"`));
        // Every event from the page carries the template, the visit included.
        assert.match(html, new RegExp(`<meta name="seo-template" content="${page.template}">`));
        assert.match(html, /<meta name="posthog-host" content="\/ingest">/);
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
