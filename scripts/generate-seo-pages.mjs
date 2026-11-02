// Builds the search pages in site/blog/ from content/pages/ and the
// competitor records.
//
// The page files say what to write; every fact about another product comes
// from content/data/competitors.json, which says where it came from and when
// somebody looked. A page can't name a price, a platform, a strength or a
// weakness that isn't in a record, so it can't drift from the record either.
// See docs/seo.md, Phase 2a, and content/url-plan.csv for which pages exist.
//
//   node scripts/generate-seo-pages.mjs           write the pages
//   node scripts/generate-seo-pages.mjs --check   fail if a page is out of date
//
// release.sh runs --check. It also fails a page that's under the word count
// the playbook sets, or that uses one of the phrases on the banned list.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { validate, DATA } from "./check-competitors.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PAGES_DIR = path.join(ROOT, "content/pages");
const OUT_DIR = path.join(ROOT, "site/blog");
const SITEMAP = path.join(ROOT, "site/sitemaps/blog.xml");
const PARTIALS = path.join(ROOT, "site/_partials");
const ORIGIN = "https://vibresia.com";

// Phase 5: a best-of or comparison page under this doesn't publish.
export const MIN_WORDS = 600;

// Phase 5's writing audit, as far as a script can do it. Lowercase.
export const BANNED = [
    "delve", "in today's", "fast-paced", "game-changer", "game changer", "seamless", "unleash",
    "elevate your", "look no further", "whether you're a", "in the world of", "it's worth noting",
    "dive into", "dive in", "revolutionise", "revolutionize", "cutting-edge", "next-level", "—",
];

const AUTHOR = {
    "@type": "Person",
    name: "Syd Lawrence",
    "@id": "https://vibresia.com/author/syd-lawrence#person",
    url: "https://vibresia.com/author/syd-lawrence",
    sameAs: ["https://github.com/sydlawrencedev", "https://minithlabs.com"],
};

// Vibresia, shaped like a competitor record so a list can treat it the same
// way. These are the lines in content/product-truth.md; change them there
// first.
export const VIBRESIA = {
    slug: "vibresia",
    name: "Vibresia",
    homepage: `${ORIGIN}/`,
    platforms: ["macos"],
    requirements: "macOS 14.2 or later, Apple silicon",
    bestFor: "Mac users who want visuals for whatever the Mac is playing, free, and people who'd like to write or describe their own.",
    strengths: [
        "Listens to system audio, so it works with Spotify, Apple Music, a browser or a film, with no plug-in",
        "18 built-in scenes, and you can write your own in GLSL or ask an AI assistant to write one",
        "Free and open source (MIT), with no account, no trial and no ads",
    ],
    limits: [
        "Mac only, and only on Apple silicon with macOS 14.2 or later",
        "Doesn't play MilkDrop presets, and has no VJ outputs such as Syphon, Spout or NDI",
    ],
    pricing: {
        model: "free", freeTier: true,
        tiers: [{ name: "Vibresia", price: "0", currency: "USD", period: "once" }],
        sourceUrl: `${ORIGIN}/`, verifiedISO: "2026-11-02",
    },
    licence: { name: "MIT", openSource: true, sourceUrl: "https://github.com/sydlawrencedev/vibresia", verifiedISO: "2026-11-02" },
    profile: { sourceUrl: `${ORIGIN}/`, verifiedISO: "2026-11-02" },
};

const PLATFORM_NAMES = {
    macos: "Mac", windows: "Windows", linux: "Linux", ios: "iPhone and iPad", android: "Android",
    web: "Browser", tvos: "Apple TV", visionos: "Vision Pro",
};

function escapeHtml(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** "2 November 2026", which is how the truth sheet says to write dates. */
export function longDate(iso) {
    return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

/** A tier's price in its own currency: "US$6.99", "€299", "Free". */
export function money(tier) {
    if (Number(tier.price) === 0) return "Free";
    const whole = Number.isInteger(Number(tier.price));
    return new Intl.NumberFormat("en-GB", {
        style: "currency", currency: tier.currency,
        minimumFractionDigits: whole ? 0 : 2,
    }).format(Number(tier.price));
}

/**
 * The helpers a page file gets. Everything that states a fact about a product
 * goes through here, and each one throws when the record doesn't have it,
 * so a page asking for a price nobody checked fails to build.
 */
export function helpers(records) {
    const bySlug = Object.fromEntries([...records, VIBRESIA].map((r) => [r.slug, r]));
    const used = new Set();

    function rec(slug) {
        const r = bySlug[slug];
        if (!r) throw new Error(`no competitor record "${slug}"`);
        used.add(slug);
        return r;
    }

    const h = {
        rec,
        name: (slug) => rec(slug).name,
        link: (slug) => `<a href="${escapeHtml(rec(slug).homepage)}">${escapeHtml(rec(slug).name)}</a>`,
        platforms: (slug) => rec(slug).platforms.map((p) => PLATFORM_NAMES[p]).join(", "),
        strength(slug, i = 0) {
            const s = rec(slug).strengths[i];
            if (!s) throw new Error(`${slug} has no strength ${i}`);
            return s;
        },
        limit(slug, i = 0) {
            const l = (rec(slug).limits || [])[i];
            if (!l) throw new Error(`${slug} has no limit ${i}: add it to the record, with its source, first`);
            return l;
        },
        /** One tier's price, by name or the first. Throws with no pricing. */
        price(slug, tierName) {
            const p = rec(slug).pricing;
            if (!p) throw new Error(`${slug} has no pricing section: no data, no price`);
            const tier = tierName ? p.tiers.find((t) => t.name === tierName) : p.tiers[0];
            if (!tier) throw new Error(`${slug} has no tier "${tierName}"`);
            const once = tier.period === "once" && Number(tier.price) > 0 ? ", one-time" : "";
            const every = tier.period === "month" ? " a month" : tier.period === "year" ? " a year" : "";
            return money(tier) + every + once;
        },
        /** Just the amount, for a sentence that says "for US$6.99". */
        cost(slug, tierName) {
            const p = rec(slug).pricing;
            if (!p) throw new Error(`${slug} has no pricing section: no data, no price`);
            const tier = tierName ? p.tiers.find((t) => t.name === tierName) : p.tiers[0];
            if (!tier) throw new Error(`${slug} has no tier "${tierName}"`);
            return money(tier);
        },
        /** What a table shows in the price column: a price, a licence, or the honest gap. */
        priceCell(slug) {
            const r = rec(slug);
            if (r.pricing) return h.price(slug);
            if (r.licence && r.licence.openSource) return `Open source (${r.licence.name})`;
            if (r.trial) return "Free to try; paid plans on its site";
            return "Not listed on its site";
        },
        /** A source a weakness written in the page's own words leans on. */
        sourceOf(slug, section) {
            const s = rec(slug)[section];
            if (!s || !s.sourceUrl) throw new Error(`${slug} has no ${section} section`);
            return s.sourceUrl;
        },
    };
    return { h, used, bySlug };
}

/** Every page that a section of a record came from, for the sources list. */
function sourcesFor(record) {
    const urls = [];
    for (const key of ["profile", "pricing", "licence", "trial", "reviews"]) {
        if (record[key] && record[key].sourceUrl) urls.push([record[key].sourceUrl, record[key].verifiedISO]);
    }
    return urls;
}

function words(html) {
    return html.replace(/<[^>]+>/g, " ").replace(/&[a-z]+;/g, " ").split(/\s+/).filter(Boolean).length;
}

function partial(name) {
    const body = fs.readFileSync(path.join(PARTIALS, name), "utf8").replace(/^\n+|\n+$/g, "");
    return body.split("\n").map((l) => (l.trim() ? "  " + l : l)).join("\n");
}

function cta(page, position, label) {
    // One primary action. The source on the link is how the server-side
    // download count knows which page and which spot sent it.
    const src = `seo-${page.slug}-${position}`;
    return `<p class="cta"><a class="button" data-install data-track="download_clicked" data-placement="seo-${position}" data-template="${page.template}" data-slug="${page.slug}" href="/download?src=${src}">${escapeHtml(label)}</a><span>Free, no account, macOS 14.2+ on Apple silicon.</span></p>`;
}

function entryHtml(h, entry, n) {
    const r = h.rec(entry.slug);
    const strength = entry.strength ?? h.strength(entry.slug, 0);
    let weakness = entry.weakness;
    if (weakness === undefined) weakness = h.limit(entry.slug, 0);
    else if (!entry.weaknessSource) throw new Error(`${entry.slug}: a weakness in the page's own words needs weaknessSource`);
    return `<article class="entry" id="${r.slug}">
      <h3>${n}. ${escapeHtml(r.name)}</h3>
      <p class="meta">${escapeHtml(h.priceCell(entry.slug))} · ${escapeHtml(h.platforms(entry.slug))}${r.requirements ? ` · ${escapeHtml(r.requirements)}` : ""}</p>
      <p><b>Who it's for:</b> ${escapeHtml(r.bestFor)}</p>
      <p><b>Good at:</b> ${escapeHtml(strength)}.</p>
      <p><b>Falls short:</b> ${escapeHtml(weakness)}.</p>
      <p><b>Pick it if</b> ${entry.pickIf}</p>
    </article>`;
}

function tableHtml(h, page) {
    const cols = page.table;
    const head = cols.map((c) => `<th scope="col">${escapeHtml(c.label)}</th>`).join("");
    const rows = page.entries.map((e) => {
        const cells = cols.map((c, i) => {
            const value = c.value(h, e.slug);
            return i === 0 ? `<th scope="row"><a href="#${e.slug}">${escapeHtml(value)}</a></th>` : `<td>${escapeHtml(value)}</td>`;
        });
        return `<tr>${cells.join("")}</tr>`;
    });
    return `<div class="table-scroll"><table>\n        <thead><tr>${head}</tr></thead>\n        <tbody>\n          ${rows.join("\n          ")}\n        </tbody>\n      </table></div>`;
}

function jsonLd(page, h, url, verifiedISO) {
    const graph = [
        {
            "@type": "Article",
            headline: page.h1,
            description: page.description,
            url,
            mainEntityOfPage: url,
            datePublished: page.publishedISO,
            dateModified: page.updatedISO,
            author: AUTHOR,
            publisher: { "@type": "Organization", name: "Minith Labs", url: "https://minithlabs.com" },
            image: `${ORIGIN}/media/share.jpg`,
            inLanguage: "en-GB",
        },
        {
            "@type": "BreadcrumbList",
            itemListElement: [
                { "@type": "ListItem", position: 1, name: "Vibresia", item: `${ORIGIN}/` },
                { "@type": "ListItem", position: 2, name: page.breadcrumb, item: url },
            ],
        },
    ];
    if (page.entries) {
        graph.push({
            "@type": "ItemList",
            name: page.h1,
            itemListElement: page.entries.map((e, i) => ({
                "@type": "ListItem", position: i + 1, name: h.name(e.slug), url: `${url}#${e.slug}`,
            })),
        });
    }
    if (page.faq && page.faq.length) {
        graph.push({
            "@type": "FAQPage",
            mainEntity: page.faq.map((f) => ({
                "@type": "Question", name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a.replace(/<[^>]+>/g, "") },
            })),
        });
    }
    return JSON.stringify({ "@context": "https://schema.org", "@graph": graph }, null, 2).replace(/</g, "\\u003c");
}

const STYLE = `  :root {
    --bg: #06010d; --panel: #0d0519; --line: #241038; --text: #efe7f5;
    --muted: #a08fb4; --magenta: #ff2bd6; --cyan: #2bf2ff; --gold: #ffc35a;
  }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--text);
    font: 400 17px/1.7 "Space Grotesk", system-ui, sans-serif; }
  a { color: var(--cyan); }
  .wrap { max-width: 1120px; margin: 0 auto; padding: 0 20px; }
  main { padding: 40px 0 40px; max-width: 760px; }
  .eyebrow { font: 700 12px/1 "JetBrains Mono", ui-monospace, monospace; letter-spacing: 3.4px;
    text-transform: uppercase; color: var(--magenta); margin: 0 0 16px; }
  h1 { font-size: clamp(32px, 5vw, 50px); line-height: 1.08; margin: 0 0 18px; letter-spacing: -0.02em; }
  h2 { font-size: clamp(23px, 3vw, 30px); margin: 46px 0 12px; letter-spacing: -0.01em; }
  h3 { font-size: 20px; margin: 0 0 6px; }
  p { margin: 0 0 14px; }
  .answer { font-size: 19px; }
  .byline { color: var(--muted); font-size: 14px; margin: 0 0 26px; }
  .table-scroll { overflow-x: auto; margin: 22px 0 8px; border: 1px solid var(--line); border-radius: 12px; }
  table { width: 100%; border-collapse: collapse; min-width: 560px; }
  th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid var(--line); font-size: 15px; vertical-align: top; }
  thead th { color: var(--muted); font: 600 12px "JetBrains Mono", monospace; letter-spacing: 1px; text-transform: uppercase; }
  tbody th { position: sticky; left: 0; background: var(--bg); font-weight: 700; }
  tbody tr:last-child > * { border-bottom: 0; }
  .entry { background: var(--panel); border: 1px solid var(--line); border-radius: 14px; padding: 20px 22px 8px; margin: 16px 0; }
  .entry .meta { color: var(--gold); font-size: 14px; }
  .cta { display: flex; flex-wrap: wrap; align-items: center; gap: 10px 16px; margin: 26px 0; }
  .cta span { color: var(--muted); font-size: 14px; }
  .button { display: inline-block; background: linear-gradient(90deg, var(--magenta), #a33bff); color: #fff;
    text-decoration: none; font-weight: 700; padding: 12px 20px; border-radius: 999px; }
  .faq h3 { margin-top: 22px; }
  .sources { color: var(--muted); font-size: 14px; }
  .sources li { overflow-wrap: anywhere; }
  .related { padding-left: 20px; }`;

/**
 * The whole page, as the file that ships. A page file exports a function of
 * the helpers, so its prose can say a price and still read it from the record.
 */
export function render(pageFn, records) {
    const { h, used } = helpers(records);
    const page = pageFn(h);
    const url = `${ORIGIN}/blog/${page.slug}`;

    // Build the body first: it's what asks for records, and the sources and
    // the "last verified" date come from whichever records it asked for.
    const entries = page.entries ? page.entries.map((e, i) => entryHtml(h, e, i + 1)).join("\n    ") : "";
    const table = page.table ? tableHtml(h, page) : "";
    const sections = page.sections.map((s) => `<h2>${escapeHtml(s.h2)}</h2>\n    ${s.html}`).join("\n    ");
    const faq = (page.faq || []).map((f) => `<h3>${escapeHtml(f.q)}</h3>\n      <p>${f.a}</p>`).join("\n      ");

    const recordsUsed = [...used].map((s) => h.rec(s));
    const sources = new Map();
    for (const r of recordsUsed) for (const [u, d] of sourcesFor(r)) if (!sources.has(u)) sources.set(u, [r.name, d]);
    const verifiedISO = [...sources.values()].map(([, d]) => d).sort()[0];

    const prose = [page.answer, entries, sections, faq].join(" ");
    const count = words(prose);
    if (count < MIN_WORDS) throw new Error(`${page.slug}: ${count} words, under the ${MIN_WORDS} a page needs to publish`);
    const lower = prose.toLowerCase() + " " + page.title.toLowerCase() + " " + page.description.toLowerCase();
    for (const phrase of BANNED) if (lower.includes(phrase)) throw new Error(`${page.slug}: uses "${phrase}"`);
    if (page.description.length > 160) throw new Error(`${page.slug}: description is ${page.description.length} characters, over 160`);

    const sourceItems = [...sources.entries()]
        .map(([u, [n, d]]) => `<li>${escapeHtml(n)}: <a href="${escapeHtml(u)}">${escapeHtml(u)}</a> (checked ${longDate(d)})</li>`)
        .join("\n        ");
    const related = page.related.map((r) => `<li><a href="${r.href}">${escapeHtml(r.text)}</a></li>`).join("\n        ");
    const title = escapeHtml(page.title);
    const description = escapeHtml(page.description);

    return `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<!-- Generated by scripts/generate-seo-pages.mjs from content/pages/${page.slug}.mjs. Edit that, not this. -->
<title>${title}</title>
<meta name="description" content="${description}">
<link rel="canonical" href="${url}">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="theme-color" content="#06010d">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Vibresia">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:image" content="${ORIGIN}/media/share.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="article:published_time" content="${page.publishedISO}">
<meta property="article:modified_time" content="${page.updatedISO}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}">
<meta name="twitter:image" content="${ORIGIN}/media/share.jpg">
<meta name="posthog-key" content="phc_pzYyxiM6u2pYa6FbCkRY8HPudHDopu5LrTwnoamHaeg2">
<meta name="posthog-host" content="https://us.i.posthog.com">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/media/share.jpg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
<style>
${STYLE}
</style>
<link rel="stylesheet" href="/chrome.css">
<script type="application/ld+json">
${jsonLd(page, h, url, verifiedISO)}
</script>
</head>
<body>
<div class="wrap">
  <!-- chrome:nav -->
${partial("nav.html")}
  <!-- /chrome:nav -->

  <main>
    <p class="eyebrow">${escapeHtml(page.eyebrow)}</p>
    <h1>${escapeHtml(page.h1)}</h1>
    <p class="byline">By <a href="/author/syd-lawrence">Syd Lawrence</a>, who makes Vibresia. Facts last checked ${longDate(verifiedISO)}; updated ${longDate(page.updatedISO)}.</p>
    <p class="answer">${page.answer}</p>
    ${table}
    ${cta(page, "top", page.cta)}
    ${page.entries ? `<h2>${escapeHtml(page.entriesHeading)}</h2>\n    ${entries}` : ""}
    ${sections}

    <section class="faq">
      <h2>Questions people ask</h2>
      ${faq}
    </section>

    ${cta(page, "bottom", page.cta)}

    <h2>Read next</h2>
    <ul class="related">
        ${related}
    </ul>

    <section class="sources">
      <h2>Sources</h2>
      <p>Every fact about another app on this page comes from that app's own site, store listing or code, on the date shown. We make Vibresia, so we've tried to say where each of the others is the better choice. If something here is out of date, <a href="https://github.com/sydlawrencedev/vibresia/issues">tell us</a> and we'll fix it.</p>
      <ul>
        ${sourceItems}
      </ul>
    </section>
  </main>

  <!-- chrome:footer -->
${partial("footer.html")}
  <!-- /chrome:footer -->
</div>
<script src="/analytics.js" defer></script>
</body>
</html>
`;
}

/** Each page file's function, with the page it makes from these records. */
export async function loadPages(records) {
    const files = fs.readdirSync(PAGES_DIR).filter((f) => f.endsWith(".mjs")).sort();
    const pages = [];
    for (const f of files) {
        const mod = await import(pathToFileURL(path.join(PAGES_DIR, f)).href);
        const page = mod.default(helpers(records).h);
        if (`${page.slug}.mjs` !== f) throw new Error(`${f}: slug "${page.slug}" doesn't match the file name`);
        pages.push({ fn: mod.default, page });
    }
    return pages;
}

export function sitemap(pages) {
    const urls = pages.map((p) => `  <url>\n    <loc>${ORIGIN}/blog/${p.slug}</loc>\n    <lastmod>${p.updatedISO}</lastmod>\n  </url>`);
    return `<?xml version="1.0" encoding="UTF-8"?>
<!-- Generated by scripts/generate-seo-pages.mjs. The search pages, in a
     sitemap of their own so Search Console can report how they index
     separately from the rest of the site. -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>
`;
}

async function main() {
    const check = process.argv.includes("--check");
    const records = JSON.parse(fs.readFileSync(DATA, "utf8"));
    const { errors } = validate(records);
    if (errors.length) {
        console.error("competitors.json has errors; run node scripts/check-competitors.mjs");
        process.exit(1);
    }

    const pages = await loadPages(records);
    const outputs = new Map(pages.map(({ fn, page }) => [path.join(OUT_DIR, `${page.slug}.html`), render(fn, records)]));
    outputs.set(SITEMAP, sitemap(pages.map((p) => p.page)));

    const stale = [];
    for (const [file, text] of outputs) {
        const current = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : null;
        if (current === text) continue;
        if (check) stale.push(path.relative(ROOT, file));
        else {
            fs.mkdirSync(path.dirname(file), { recursive: true });
            fs.writeFileSync(file, text);
            console.log(`  wrote ${path.relative(ROOT, file)}`);
        }
    }
    if (check && stale.length) {
        console.error("Search pages are out of date:");
        for (const f of stale) console.error(`  x ${f}`);
        console.error("  Fix with node scripts/generate-seo-pages.mjs");
        process.exit(1);
    }
    console.log(`${pages.length} search pages ${check ? "up to date" : "built"}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
