// Checks that every source a comparison page leans on still says what the
// record says it says.
//
// A validator can check that a source URL is a URL and that it was checked
// recently. It can't check that the URL is the page the fact came from: a
// typo turns "resolume.com" into "resolution.com", which resolves, redirects
// and answers 200, and is a different company entirely. The page then reads
// as sourced and is wrong.
//
// So this fetches each source and asks two questions: did it stay on the site
// we named, and does the quote we recorded actually appear on it?
//
//   node scripts/check-sources.mjs
//
// It needs the network, so it isn't in `npm test` or the release script:
// run it when facts are added or a competitor's page moves. It exits
// non-zero when a source can't be confirmed.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA = path.join(ROOT, "content/data/competitors.json");

/** How long to wait for a source before giving up on it. */
const TIMEOUT_MS = 20000;

const hostOf = (u) => {
    try {
        return new URL(u).hostname.replace(/^www\./, "");
    } catch {
        return null;
    }
};

/** The page as text: no tags, no entities, spaces collapsed. */
function asText(html) {
    return html
        .replace(/<script[\s\S]*?<\/script>/gi, " ")
        .replace(/<style[\s\S]*?<\/style>/gi, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)))
        .replace(/\s+/g, " ")
        .trim();
}

/** Every fact in a record that carries a source, and a quote where we have one. */
export function factsOf(record) {
    const facts = [];
    const add = (where, section) => {
        if (section && section.sourceUrl) facts.push({ where, url: section.sourceUrl, quote: section.quote });
    };
    for (const key of ["profile", "pricing", "licence", "trial", "reviews"]) add(`${record.slug}.${key}`, record[key]);
    for (const [i, l] of (record.limits || []).entries()) {
        if (l && typeof l === "object") add(`${record.slug}.limits[${i}]`, l);
    }
    if (record.io) {
        add(`${record.slug}.io`, record.io);
        for (const [kind, e] of Object.entries(record.io)) {
            if (e && typeof e === "object") add(`${record.slug}.io.${kind}`, e);
        }
    }
    for (const [i, q] of (record.quotes || []).entries()) add(`${record.slug}.quotes[${i}]`, q);
    return facts;
}

/**
 * Checks one source. `fetchPage` is a parameter so a test can hand it a page
 * instead of going to the network.
 */
export async function checkFact(fact, fetchPage) {
    const problems = [];
    const wanted = hostOf(fact.url);
    if (!wanted) return [`${fact.where}: ${fact.url} isn't a URL`];

    let finalUrl;
    let text;
    try {
        const page = await fetchPage(fact.url);
        finalUrl = page.url;
        text = asText(page.html);
    } catch (e) {
        return [`${fact.where}: ${fact.url} couldn't be read (${e.message})`];
    }

    // A redirect to another site is the failure this script exists for: the
    // URL looks right, the page answers 200, and it is somebody else's page.
    const finalHost = hostOf(finalUrl);
    if (finalHost && finalHost !== wanted && !finalHost.endsWith(`.${wanted}`)) {
        problems.push(`${fact.where}: ${fact.url} redirects to ${finalHost}, a different site`);
    }

    if (fact.quote) {
        const needle = fact.quote.replace(/\s+/g, " ").trim();
        if (!text.toLowerCase().includes(needle.toLowerCase())) {
            problems.push(`${fact.where}: the quote isn't on ${fact.url}: "${needle}"`);
        }
    }
    return problems;
}

async function fetchPage(url) {
    const res = await fetch(url, {
        redirect: "follow",
        signal: AbortSignal.timeout(TIMEOUT_MS),
        headers: {
            // A plain reader, not a scraper pretending to be a browser.
            "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36",
            accept: "text/html,application/xhtml+xml",
        },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return { url: res.url, html: await res.text() };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const records = JSON.parse(fs.readFileSync(DATA, "utf8"));
    const facts = records.flatMap(factsOf);
    const problems = [];
    let checked = 0;
    let quotes = 0;
    // One request per URL, however many facts cite it.
    const pages = new Map();
    for (const fact of facts) {
        if (!pages.has(fact.url)) {
            pages.set(fact.url, fetchPage(fact.url).catch((e) => ({ error: e })));
        }
        const promise = pages.get(fact.url);
        const got = await promise;
        if (got.error) {
            problems.push(`${fact.where}: ${fact.url} couldn't be read (${got.error.message})`);
            continue;
        }
        checked++;
        if (fact.quote) quotes++;
        const wanted = hostOf(fact.url);
        const finalHost = hostOf(got.url);
        if (finalHost && finalHost !== wanted && !finalHost.endsWith(`.${wanted}`)) {
            problems.push(`${fact.where}: ${fact.url} redirects to ${finalHost}, a different site`);
            continue;
        }
        if (fact.quote) {
            const needle = fact.quote.replace(/\s+/g, " ").trim().toLowerCase();
            if (!asText(got.html).toLowerCase().includes(needle)) {
                problems.push(`${fact.where}: the quote isn't on ${fact.url}: "${fact.quote}"`);
            }
        }
    }
    for (const p of problems) console.error(`error: ${p}`);
    console.log(`checked ${checked} source${checked === 1 ? "" : "s"} (${quotes} with a quote) across ${facts.length} facts`);
    if (problems.length) {
        console.error(`${problems.length} source${problems.length === 1 ? "" : "s"} could not be confirmed`);
        process.exit(1);
    }
}
