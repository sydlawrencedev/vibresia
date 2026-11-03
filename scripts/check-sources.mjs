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
const APPS = path.join(ROOT, "content/data/music-apps.json");

/** How long to wait for a source before giving up on it. */
const TIMEOUT_MS = 20000;

const hostOf = (u) => {
    try {
        return new URL(u).hostname.replace(/^www\./, "");
    } catch {
        return null;
    }
};

/**
 * Whether two hosts are the same site. A help centre that moves from
 * support.example.com to www.example.com is the same publisher; a typo that
 * turns example.com into exarnple.com is not, and that is the failure this
 * check exists for.
 */
function sameSite(a, b) {
    if (!a || !b) return false;
    if (a === b) return true;
    return a.endsWith(`.${b}`) || b.endsWith(`.${a}`);
}

/** The page as text: no tags, no entities, spaces collapsed. */
function asText(html) {
    return html
        .replace(/<script[\s\S]*?<\/script>/gi, " ")
        .replace(/<style[\s\S]*?<\/style>/gi, " ")
        // Only real tags. "<.milk2>" is part of a sentence about a file
        // format, not markup, and stripping it would lose the quote.
        .replace(/<\/?[a-zA-Z][^>]*>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        // Entities a page renders as punctuation: a curly apostrophe is the
        // same word as a straight one, and a quote copied out of the page
        // keeps whichever the page used.
        .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
        .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)))
        .replace(/&rsquo;/g, "'").replace(/&lsquo;/g, "'")
        .replace(/&rdquo;/g, '"').replace(/&ldquo;/g, '"')
        .replace(/&ndash;/g, "-").replace(/&mdash;/g, "-")
        .replace(/&hellip;/g, "...").replace(/&bull;/g, "-")
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, " ")
        .trim();
}

/**
 * A page and a quote, both made comparable: spaces collapsed, the space a
 * link leaves before a comma taken out, and the typographic punctuation a
 * page renders normalised. "DMX , Art-Net" and "DMX, Art-Net" are the same
 * sentence, and only one of them is what the HTML renders. A page that
 * renders "you'll" with a curly apostrophe and a record that writes it
 * straight are also the same words.
 */
function comparable(s) {
    return String(s)
        .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
        .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
        .replace(/[\u2010-\u2015]/g, "-")
        .replace(/\s+/g, " ")
        .replace(/\s+([,.;:!?])/g, "$1")
        .trim()
        .toLowerCase();
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
 * The facts behind the "visualizer for {app}" pages. They are read from the
 * app's own support pages and its store listing, so the same checks apply:
 * the source has to still be where it was, and still be the same site.
 */
export function appFacts(apps) {
    const facts = [];
    for (const app of apps) {
        const add = (where, fact) => {
            if (fact && fact.sourceUrl) facts.push({ where: `${app.slug}.${where}`, url: fact.sourceUrl, quote: fact.quote });
        };
        (app.visualizerFacts || []).forEach((f, i) => add(`visualizerFacts[${i}]`, f));
        add("macApp", app.macApp);
        add("webPlayer", app.webPlayer);
        (app.other || []).forEach((f, i) => add(`other[${i}]`, f));
    }
    return facts;
}

/**
 * Checks one source. `fetchPage` is a parameter so a test can hand it a page
 * instead of going to the network. It returns {url, text}.
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
        text = page.text;
    } catch (e) {
        return [`${fact.where}: ${fact.url} couldn't be read (${e.message})`];
    }

    // A redirect to another site is the failure this script exists for: the
    // URL looks right, the page answers 200, and it is somebody else's page.
    // A redirect within the same site is not that — a help centre that
    // moves from support.example.com to www.example.com is still the same
    // publisher — so the two are compared both ways round.
    const finalHost = hostOf(finalUrl);
    if (finalHost && !sameSite(finalHost, wanted)) {
        problems.push(`${fact.where}: ${fact.url} redirects to ${finalHost}, a different site`);
    }

    if (fact.quote && text !== null) {
        const needle = comparable(fact.quote);
        if (!comparable(text).includes(needle)) {
            problems.push(`${fact.where}: the quote isn't on ${fact.url}: "${fact.quote}"`);
        }
    }
    return problems;
}

/** The text of a PDF, through pdftotext. Null when it can't be read. */
async function pdfText(body) {
    const { execFileSync } = await import("node:child_process");
    const fs = await import("node:fs");
    const os = await import("node:os");
    const path = await import("node:path");
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "check-sources-"));
    const file = path.join(dir, "source.pdf");
    try {
        fs.writeFileSync(file, body);
        const out = path.join(dir, "source.txt");
        execFileSync("pdftotext", ["-layout", file, out], { stdio: "ignore" });
        return asText(fs.readFileSync(out, "utf8"));
    } catch {
        // No pdftotext, or a PDF it can't read: the quote stays unchecked,
        // and the caller says so rather than pretending it passed.
        return null;
    } finally {
        fs.rmSync(dir, { recursive: true, force: true });
    }
}

async function fetchPage(url) {
    // Most sites want to look like a browser. Some, like Adobe's help
    // server, refuse a browser and serve a plain client instead, so a
    // refusal is retried the other way round. Neither is a human check:
    // there is no puzzle to solve, only a filter on what you look like.
    const AGENTS = [
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36",
        "curl/8.7.1",
    ];
    let res;
    try {
        for (let attempt = 0; ; attempt++) {
            res = await fetch(url, {
                redirect: "follow",
                signal: AbortSignal.timeout(TIMEOUT_MS),
                headers: {
                    "user-agent": AGENTS[attempt],
                    accept: "text/html,application/xhtml+xml,application/pdf",
                },
            });
            if (![401, 403, 429].includes(res.status) || attempt >= AGENTS.length - 1) break;
        }
    } catch (e) {
        // A slow site is not a broken citation. A timeout is reported and
        // the check carries on; the source may well be perfectly good.
        if (e.name === "TimeoutError" || e.name === "AbortError") {
            const err = new Error("the request timed out");
            err.blocked = true;
            throw err;
        }
        throw e;
    }
    // A site that refuses to be read is not the same as a link that died.
    // The first is a fact about the site; the second is a broken citation.
    if (res.status === 401 || res.status === 403 || res.status === 429 || res.status >= 500) {
        const err = new Error(`HTTP ${res.status} (the site refused to be read)`);
        err.blocked = true;
        throw err;
    }
    if (!res.ok) {
        const err = new Error(`HTTP ${res.status}`);
        err.dead = true;
        throw err;
    }
    const type = res.headers.get("content-type") || "";
    const body = Buffer.from(await res.arrayBuffer());
    if (type.includes("pdf") || url.toLowerCase().split("?")[0].endsWith(".pdf")) {
        return { url: res.url, text: await pdfText(body) };
    }
    return { url: res.url, text: asText(body.toString("utf8")) };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const records = JSON.parse(fs.readFileSync(DATA, "utf8"));
    const apps = fs.existsSync(APPS) ? JSON.parse(fs.readFileSync(APPS, "utf8")).apps : [];
    const facts = [...records.flatMap(factsOf), ...appFacts(apps)];
    const problems = [];
    const blocked = [];
    let checked = 0;
    let quotes = 0;
    let unchecked = 0;
    // One request per URL, however many facts cite it.
    const pages = new Map();
    for (const fact of facts) {
        if (!pages.has(fact.url)) {
            pages.set(fact.url, fetchPage(fact.url).catch((e) => ({ error: e })));
        }
        const got = await pages.get(fact.url);
        if (got.error) {
            // A refused site is reported, not failed: the citation may well be
            // right, and a person can open it in a browser. A dead link is a
            // broken citation and fails.
            if (got.error.dead || !got.error.blocked) {
                problems.push(`${fact.where}: ${fact.url} couldn't be read (${got.error.message})`);
            } else if (!blocked.some(([u]) => u === fact.url)) {
                blocked.push([fact.url, got.error.message]);
            }
            continue;
        }
        checked++;
        if (fact.quote) quotes++;
        const found = await checkFact(fact, async () => got);
        problems.push(...found);
        if (fact.quote && got.text === null) unchecked++;
    }
    for (const p of problems) console.error(`error: ${p}`);
    for (const [u, why] of blocked) console.log(`blocked: ${u} (${why})`);
    console.log(`checked ${checked} source${checked === 1 ? "" : "s"} (${quotes} with a quote) across ${facts.length} facts`);
    if (unchecked) console.log(`${unchecked} quote${unchecked === 1 ? "" : "s"} could not be checked (a PDF pdftotext can't read)`);
    if (blocked.length) console.log(`${blocked.length} source${blocked.length === 1 ? "" : "s"} refused to be read, so its quotes are unconfirmed`);
    if (problems.length) {
        console.error(`${problems.length} source${problems.length === 1 ? "" : "s"} could not be confirmed`);
        process.exit(1);
    }
}
