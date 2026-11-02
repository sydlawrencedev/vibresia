// Checks the structured data on every page a search engine may index.
//
// Every indexable page carries the shared Organization and WebSite nodes from
// content/data/schema.json, word for word, and an FAQPage whose questions are
// on the page where a reader can see them: structured data that says
// something the page doesn't is the kind search engines penalise (docs/seo.md,
// Phase 4). Pages marked noindex are skipped; nothing reads their schema.
//
//   node scripts/check-schema.mjs

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { isDeepStrictEqual } from "node:util";

import { sitePages } from "./check-links.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const SCHEMA = JSON.parse(fs.readFileSync(path.join(ROOT, "content/data/schema.json"), "utf8"));

/** Every node in every ld+json block on the page, @graph or not. */
export function nodesIn(html) {
    const nodes = [];
    for (const [, body] of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
        const data = JSON.parse(body);
        nodes.push(...(data["@graph"] || [data]));
    }
    return nodes;
}

/** What a reader sees: tags gone, entities decoded, whitespace collapsed. */
function visibleText(html) {
    return html
        .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/&amp;/g, "&").replace(/&#39;|&rsquo;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">")
        .replace(/\s+/g, " ");
}

export function checkPage(html) {
    const problems = [];
    if (/name="robots" content="noindex/.test(html)) return problems;
    let nodes;
    try {
        nodes = nodesIn(html);
    } catch (e) {
        return [`structured data isn't valid JSON: ${e.message}`];
    }
    for (const key of ["organization", "website"]) {
        const want = SCHEMA[key];
        const got = nodes.find((n) => n["@id"] === want["@id"]);
        if (!got) problems.push(`no ${want["@type"]} node (${want["@id"]})`);
        else if (!isDeepStrictEqual(got, want)) problems.push(`its ${want["@type"]} node differs from content/data/schema.json`);
    }
    const faq = nodes.find((n) => n["@type"] === "FAQPage");
    if (!faq || !(faq.mainEntity || []).length) {
        problems.push("no FAQPage");
    } else {
        const text = visibleText(html);
        for (const q of faq.mainEntity) {
            if (!text.includes(q.name)) problems.push(`FAQ question isn't on the page: "${q.name}"`);
        }
    }
    return problems;
}

export function check() {
    const failures = [];
    for (const [p, html] of sitePages()) {
        for (const problem of checkPage(html)) failures.push(`${p}: ${problem}`);
    }
    return failures;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const failures = check();
    for (const f of failures) console.error(`  x ${f}`);
    if (failures.length) process.exit(1);
    console.log("every indexable page has the shared Organization and WebSite nodes, and FAQs it shows");
}
