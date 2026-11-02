// Checks the site's internal links: no orphan pages, no links to nowhere.
//
// An orphan is a page in a sitemap that nobody can reach by following links
// from the homepage. Search engines find those slowly or not at all, and the
// playbook rules them out (docs/seo.md, Phase 4). The check walks the links in
// the built HTML, the nav and footer included, the way a crawler would.
//
//   node scripts/check-links.mjs

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE = path.join(ROOT, "site");

// Paths the Worker answers rather than a file (worker/index.js). A link to
// one of these isn't broken just because site/ has no file for it.
const WORKER_ROUTES = [/^\/download$/, /^\/vibescapes$/, /^\/s\/[^/]+$/, /^\/og\//, /^\/mcp$/, /^\/api\//, /^\/ingest\//];

// Not for the public: never linked, never in a sitemap.
const PRIVATE = new Set(["/admin"]);

/** Every HTML page in site/, by the path it's served at. */
export function sitePages(root = SITE) {
    const pages = new Map();
    (function walk(dir) {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            if (entry.name.startsWith("_")) continue;
            const file = path.join(dir, entry.name);
            if (entry.isDirectory()) walk(file);
            else if (entry.name.endsWith(".html")) {
                let p = "/" + path.relative(root, file).replace(/\\/g, "/").replace(/\.html$/, "");
                if (p === "/index") p = "/";
                else if (p.endsWith("/index")) p = p.slice(0, -"index".length);
                if (!PRIVATE.has(p)) pages.set(p, fs.readFileSync(file, "utf8"));
            }
        }
    })(root);
    return pages;
}

/** The site-internal paths a page links to, without query or fragment. */
export function linksIn(html) {
    const out = new Set();
    for (const [, href] of html.matchAll(/href="([^"]+)"/g)) {
        let p = href;
        if (p.startsWith("https://vibresia.com")) p = p.slice("https://vibresia.com".length) || "/";
        if (!p.startsWith("/") || p.startsWith("//")) continue;
        p = p.split(/[?#]/)[0];
        if (/\.[a-z0-9]+$/i.test(p) && !p.endsWith(".html")) continue; // a file: css, js, xml, txt, media
        out.add(p.replace(/\.html$/, "") || "/");
    }
    return out;
}

/** Every path listed in site/sitemap.xml and site/sitemaps/*.xml. */
export function sitemapPaths(root = SITE) {
    const files = [path.join(root, "sitemap.xml")];
    const dir = path.join(root, "sitemaps");
    if (fs.existsSync(dir)) for (const f of fs.readdirSync(dir)) if (f.endsWith(".xml")) files.push(path.join(dir, f));
    const paths = [];
    for (const f of files) {
        for (const [, loc] of fs.readFileSync(f, "utf8").matchAll(/<loc>([^<]+)<\/loc>/g)) {
            paths.push(new URL(loc).pathname);
        }
    }
    return paths;
}

/**
 * What a crawler starting at the homepage reaches, and which links on the
 * way lead nowhere.
 */
export function crawl(pages) {
    const reached = new Set(["/"]);
    const queue = ["/"];
    const broken = [];
    while (queue.length) {
        const from = queue.shift();
        for (const to of linksIn(pages.get(from))) {
            if (pages.has(to)) {
                if (!reached.has(to)) { reached.add(to); queue.push(to); }
            } else if (!WORKER_ROUTES.some((r) => r.test(to))) {
                broken.push(`${from} → ${to}`);
            }
        }
    }
    return { reached, broken };
}

export function check(root = SITE) {
    const pages = sitePages(root);
    const { reached, broken } = crawl(pages);
    const orphans = sitemapPaths(root).filter((p) => !reached.has(p));
    return { orphans, broken, reached: reached.size };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const { orphans, broken, reached } = check();
    for (const o of orphans) console.error(`  x orphan: ${o} is in a sitemap but no link from the homepage reaches it`);
    for (const b of broken) console.error(`  x broken: ${b}`);
    if (orphans.length || broken.length) process.exit(1);
    console.log(`every sitemap page is linked, and no internal link is broken (${reached} pages reached)`);
}
