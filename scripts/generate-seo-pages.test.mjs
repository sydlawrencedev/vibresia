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
import { render, renderHub, loadPages, helpers, money, longDate, pathOf, HUB, MIN_WORDS, PAIRS } from "./generate-seo-pages.mjs";
import { check as checkLinks, crawl, linksIn } from "./check-links.mjs";

const records = JSON.parse(fs.readFileSync(DATA, "utf8"));
const pages = await loadPages(records);
const all = pages.map((p) => p.page);
const built = pages.map(({ fn, page }) => ({ page, html: render(fn, records, all) }));
// The comparisons hub is built by renderHub, not render, so it does not
// come back from loadPages. Without this line the hub is outside every
// check below, which is how it shipped with a skipped heading level.
const hub = { page: { slug: "comparison", template: "hub" }, html: renderHub(all.filter((p) => p.template === "2b" || p.template === "2c"), records) };

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

test("each referee pair has one canonical order, and the reverse 301s to it", async () => {
    const { PAIRS } = await import("./generate-seo-pages.mjs");
    const root = path.join(path.dirname(DATA), "../..");
    const redirects = fs.readFileSync(path.join(root, "site/_redirects"), "utf8");
    for (const pair of PAIRS) {
        assert.notEqual(pair.a, pair.b, `${pair.slug} compares an app with itself`);
        const reverse = `/comparison/${pair.b}-vs-${pair.a}`;
        assert.ok(
            redirects.includes(`${reverse}  /comparison/${pair.slug}  301`),
            `no redirect from ${reverse} to /comparison/${pair.slug}`,
        );
    }
});

test("a page that asks for a connection the record doesn't have doesn't build", () => {
    const { h } = helpers(records);
    assert.throws(() => h.io("phosphor", "midi"), /no io\.midi/);
});

test("the connections table compares two apps on what they can be wired into", () => {
    const pairs = built.filter((b) => b.page.connections);
    assert.ok(pairs.length, "no page shows the connections table");
    const KINDS = ["MIDI", "OSC", "Syphon", "Spout", "NDI", "DMX", "Video in and out"];
    for (const { page, html } of pairs) {
        assert.match(html, /<h2>Control and connections<\/h2>/, `${page.slug} has no connections table`);
        const table = html.slice(html.indexOf("Control and connections"));
        // A row appears when at least one of the two apps documents it, and
        // is left out when neither does: there is nothing to compare.
        for (const kind of KINDS) {
            const key = kind === "Video in and out" ? "video" : kind.toLowerCase();
            const [a, b] = sidesOf(page);
            const documented = [a, b].some((s) => {
                const rec = records.find((r) => r.slug === s);
                return rec && rec.io && rec.io[key] && rec.io[key].status !== "unknown";
            });
            const row = new RegExp(`<th scope="row">${kind}</th>`);
            if (documented) assert.match(table, row, `${page.slug} has no ${kind} row`);
            else assert.doesNotMatch(table, row, `${page.slug} has a ${kind} row neither app documents`);
        }
        // No cell is empty: a row says yes, no, or that it wasn't found.
        for (const cell of table.matchAll(/<td>([\s\S]*?)<\/td>/g)) {
            assert.ok(cell[1].trim().length > 0, `${page.slug} has an empty cell`);
        }
    }
});

/** The two apps a referee page compares. */
function sidesOf(page) {
    const pair = PAIRS.find((p) => p.slug === page.slug);
    return [pair.a, pair.b];
}

test("a page's source list names the pages it states facts from, and no others", () => {
    // The TouchDesigner head-to-head doesn't show the connections table, so
    // it must not list the documentation pages behind it.
    const head = built.find((b) => b.page.slug === "vibresia-vs-touchdesigner");
    const headSources = head.html.slice(head.html.indexOf('<section class="sources">'));
    assert.doesNotMatch(headSources, /Syphon_Spout_Out_TOP/);
    // The referee page that does show it lists them.
    const referee = built.find((b) => b.page.slug === "resolume-vs-touchdesigner");
    assert.match(referee.html, /Syphon_Spout_Out_TOP/);
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

test("the heading order never skips a level", () => {
    // A screen reader moves between headings by level. H1 then H3 skips H2,
    // which reads as a missing section rather than a subsection, so the
    // outline is broken for anybody navigating by heading.
    const levels = (html) => [...html.matchAll(/<h([1-6])[\s>]/g)].map((m) => Number(m[1]));
    for (const { page, html } of [...built, hub]) {
        const seen = levels(html);
        for (let i = 1; i < seen.length; i++) {
            assert.ok(
                seen[i] - seen[i - 1] <= 1,
                `${page.slug} jumps from H${seen[i - 1]} to H${seen[i]}`,
            );
        }
    }
});

test("the comparisons hub opens its list under a heading of its own", () => {
    // The hub's entries are H3, one per comparison. The first group had no
    // section heading above it, so the page went H1 then straight to H3 and
    // a screen reader moving by heading started part-way down the page.
    const html = hub.html;
    assert.match(html, /<h2>Vibresia vs another app<\/h2>/);
    // The first entry heading comes after that H2, not straight after the H1.
    const h1 = html.indexOf("<h1>");
    const h2 = html.indexOf("<h2>Vibresia vs another app</h2>");
    const firstH3 = html.search(/<h3>/);
    assert.ok(h1 < h2, "the section heading is not under the page's H1");
    assert.ok(h2 < firstH3, "the first entry heading is not under the section heading");
});

test("every table header cell has a name", () => {
    // The first column of a side-by-side table is the row's label — "Price",
    // "What it is" — and its header cell was empty. A screen reader reads the
    // header row as a blank and then an app name, with nothing saying what
    // the first column holds. The name is for the screen reader only, so the
    // layout is unchanged.
    for (const { page, html } of [...built, hub]) {
        // <th, not <th: the naive pattern also matches <thead>, and then the
        // header cells that follow it are never seen at all.
        const cells = [...html.matchAll(/<th(\s[^>]*)>([\s\S]*?)<\/th>/g)];
        for (const [, attrs, inner] of cells) {
            if (!/scope="col"/.test(attrs)) continue;
            const text = inner.replace(/<[^>]*>/g, "").trim();
            assert.ok(text, `${page.slug} has a table header cell with no name`);
        }
    }
});

test("the verdict box headings sit one level under the page's first heading", () => {
    // The "Pick X if" box is the first thing under the H1, so it has to be
    // an H2. It was an H3, which made every comparison page open on a
    // skipped level.
    const rows = [{ label: "Price", value: (h, s) => h.priceCell(s) }];
    const versus = { template: "2c", versus: "touchdesigner", rows, verdict: { pickUs: "you want it free.", pickThem: "you want control." } };
    const html = render(page({ ...versus, faq: [{ q: "Is it free?", a: filler }] }), records);
    assert.match(html, /<h2>Pick Vibresia if<\/h2>/);
    assert.match(html, /<h2>Pick TouchDesigner if<\/h2>/);
    assert.doesNotMatch(html, /<h3>Pick /);
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

test("the statistics sitemap lists every dataset page, and its dates come from the page", async () => {
    const { statsSitemap } = await import("./generate-seo-pages.mjs");
    const xml = statsSitemap();
    const dir = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../site/stats/data");
    const files = fs.readdirSync(dir).filter((f) => f.endsWith(".html"));
    assert.ok(files.length > 0, "there are statistics pages to list");
    for (const f of files) {
        const html = fs.readFileSync(path.join(dir, f), "utf8");
        const slug = f.replace(/\.html$/, "").replace(/^index$/, "");
        const loc = slug ? `/stats/data/${slug}` : "/stats/data/";
        assert.ok(xml.includes(`<loc>https://vibresia.com${loc}</loc>`), `${loc} is not in the statistics sitemap`);
        // The date has to come from the page, not from the file's mtime: a
        // fresh checkout would rewrite every lastmod and leave the
        // generator's own check permanently out of date.
        const updated = html.match(/<meta name="stats-updated" content="(\d{4}-\d{2}-\d{2})"/);
        assert.ok(updated, `${f} has no stats-updated meta`);
        assert.ok(xml.includes(`<lastmod>${updated[1]}</lastmod>`), `${loc} does not carry the date the page says`);
    }
});

test("every indexable page has the shared Organization node and FAQs it shows", async () => {
    const { check, checkPage, SCHEMA } = await import("./check-schema.mjs");
    assert.deepEqual(check(), []);
    const ld = (nodes) => `<script type="application/ld+json">${JSON.stringify({ "@graph": nodes })}</script>`;
    const faq = { "@type": "FAQPage", mainEntity: [{ "@type": "Question", name: "Is it free?" }] };
    assert.deepEqual(checkPage(ld([SCHEMA.organization, SCHEMA.website, faq]) + "<h3>Is it free?</h3>"), []);
    assert.match(checkPage(ld([SCHEMA.organization, SCHEMA.website, faq])).join(), /isn't on the page/);
    assert.match(checkPage(ld([{ ...SCHEMA.organization, name: "Someone else" }, SCHEMA.website, faq]) + "Is it free?").join(), /differs/);
    assert.throws(() => render(page({ faq: [] }), records), /every page needs FAQs/);
});

test("Vibresia appears on a referee page only when its pair opted in", async () => {
    const { PAIRS } = await import("./generate-seo-pages.mjs");
    for (const { page, html } of built.filter((b) => b.page.template === "2b")) {
        const pair = PAIRS.find((x) => x.slug === page.slug);
        // The article itself: navigation lists further down may name other
        // comparison pages, which is linking, not promotion.
        const main = html.slice(html.indexOf("<main>"), html.indexOf("<h2>Read next</h2>"));
        const promo = /download_clicked|class="third-option"|class="reel"/.test(main);
        assert.equal(promo, pair.thirdOption, `${page.slug}: third option is ${pair.thirdOption} but the page ${promo ? "promotes" : "doesn't promote"} Vibresia`);
        // The disambiguation note is not promotion. It tells somebody who
        // landed on a live-show comparison by accident that they are in the
        // wrong place, and it says what Vibresia is not. A referee page
        // that says nothing about its own category leaves the reader
        // assuming the site is what it is not.
        const withoutNote = main
            .replace(/<p class="byline">[\s\S]*?<\/p>/, "")
            .replace(/<aside class="referee-note">[\s\S]*?<\/aside>/, "");
        if (!pair.thirdOption) assert.ok(!/Vibresia/.test(withoutNote), `${page.slug} mentions Vibresia outside the byline and the disambiguation note`);
    }
    for (const pair of PAIRS) assert.ok(pair.audience && pair.whyCompared, `${pair.slug} needs audience and whyCompared`);
});

test("every referee page says what category it is in", async () => {
    const { PAIRS } = await import("./generate-seo-pages.mjs");
    for (const { page, html } of built.filter((b) => b.page.template === "2b")) {
        const pair = PAIRS.find((x) => x.slug === page.slug);
        if (pair.thirdOption) continue;
        // A visitor who lands on "Resolume vs TouchDesigner" is looking for
        // a live-show tool. Vibresia is not one, and the page says so
        // rather than leaving the reader to work it out.
        assert.match(html, /These are live-show tools/,
            `${page.slug} does not say these are live-show tools`);
        assert.match(html, /no MIDI, OSC, NDI or Syphon output/,
            `${page.slug} does not say what Vibresia is not`);
    }
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

    test(`${page.slug}: the call to action says where it came from`, async () => {
        // A referee page that didn't opt in has no call to action at all;
        // the opt-in test above checks that. The template meta still applies.
        const { PAIRS } = await import("./generate-seo-pages.mjs");
        const promotes = page.template !== "2b" || PAIRS.find((x) => x.slug === page.slug).thirdOption;
        if (promotes) {
            for (const position of ["top", "bottom"]) {
                assert.match(html, new RegExp(`href="/download\\?src=seo-${page.slug}-${position}"`));
            }
            assert.match(html, new RegExp(`data-template="${page.template}" data-slug="${page.slug}"`));
        }
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
