// Builds the search pages in site/blog/ and site/comparison/ from
// content/pages/ and the competitor records.
//
// The page files say what to write; every fact about another product comes
// from content/data/competitors.json, which says where it came from and when
// somebody looked. A page can't name a price, a platform, a strength or a
// weakness that isn't in a record, so it can't drift from the record either.
// See docs/seo.md, Phases 2a and 2c, and content/url-plan.csv for which
// pages exist.
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
// Where each template's pages live, and the sitemap each is listed in. One
// sitemap per section, so Search Console reports on each separately (Phase 4).
export const SECTIONS = {
    blog: { templates: ["2a", "2d"], sitemap: "blog.xml" },
    comparison: { templates: ["2c"], sitemap: "comparisons.xml" },
};
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

// Who writes the pages. The byline, the Person schema and the author page all
// come from content/data/author.json, which the playbook's author questions
// fill in (docs/seo.md, Phase 5).
export const AUTHOR_DATA = JSON.parse(fs.readFileSync(path.join(ROOT, "content/data/author.json"), "utf8"));
const AUTHOR_PATH = `/author/${AUTHOR_DATA.slug}`;

// The Organization and WebSite nodes every page carries, from one file, so
// no page describes Minith Labs differently (docs/seo.md, Phase 4).
export const SCHEMA = JSON.parse(fs.readFileSync(path.join(ROOT, "content/data/schema.json"), "utf8"));
const ORG_REF = { "@id": SCHEMA.organization["@id"] };

/** A page's JSON-LD: the shared nodes, then the page's own. */
function graphJson(nodes) {
    return JSON.stringify({ "@context": "https://schema.org", "@graph": [SCHEMA.organization, SCHEMA.website, ...nodes] }, null, 2)
        .replace(/</g, "\\u003c");
}

/** FAQPage from the same questions the page shows, so the two can't differ. */
function faqNode(faq) {
    return {
        "@type": "FAQPage",
        mainEntity: faq.map((f) => ({
            "@type": "Question", name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a.replace(/<[^>]+>/g, "") },
        })),
    };
}

function faqHtml(faq) {
    return `<section class="faq">
      <h2>Questions people ask</h2>
      ${faq.map((f) => `<h3>${escapeHtml(f.q)}</h3>\n      <p>${f.a}</p>`).join("\n      ")}
    </section>`;
}
const AUTHOR = {
    "@type": "Person",
    name: AUTHOR_DATA.name,
    "@id": `${ORIGIN}${AUTHOR_PATH}#person`,
    url: `${ORIGIN}${AUTHOR_PATH}`,
    jobTitle: AUTHOR_DATA.jobTitle,
    description: AUTHOR_DATA.description,
    image: AUTHOR_DATA.image,
    knowsAbout: AUTHOR_DATA.knowsAbout,
    worksFor: { "@id": "https://minithlabs.com/#org" },
    sameAs: AUTHOR_DATA.sameAs,
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

// The page that lists every head-to-head, at /comparison. Linked from the
// footer, so every comparison is two clicks from anywhere on the site.
export const HUB = {
    path: "/comparison",
    file: "site/comparison.html",
    breadcrumb: "Comparisons",
    linkText: "All Vibresia comparisons",
    title: "Vibresia Compared: Head-to-Heads With Other Visualisers",
    description: "Vibresia side by side with other music visualisers and visual tools: what each costs, what each does well, and who should pick which.",
};

// Sourced facts about music apps, for the "visualizer for {app}" question
// pages (Phase 2d). Researched per app; see content/data/music-apps.json.
export const MUSIC_APPS = JSON.parse(fs.readFileSync(path.join(ROOT, "content/data/music-apps.json"), "utf8")).apps;
// A spoke needs less prose than a comparison because it carries a computed
// verdict for its app (docs/seo.md, Phase 5: 300 words plus a computed element).
export const MIN_WORDS_SPOKE = 300;

function musicApp(slug) {
    const a = MUSIC_APPS.find((x) => x.slug === slug);
    if (!a) throw new Error(`no music app "${slug}" in content/data/music-apps.json`);
    return a;
}

/** Every sourced fact about one music app, for the sources list. */
function appFacts(a) {
    return [...a.visualizerFacts, a.macApp, a.webPlayer, ...(a.other || [])].filter(Boolean);
}

/** Facts read from search snippets, because the site blocks reading: a person checks these. */
export function handChecks(slugs) {
    return slugs.flatMap((slug) => appFacts(musicApp(slug)).filter((f) => f.needsHandCheck)
        .map((f) => `${slug}: "${f.text}" (${f.sourceUrl}): ${f.needsHandCheck}`));
}

/**
 * The spoke's computed element: does this app have a visualiser, where does
 * it run on a Mac, and does Vibresia work with it. Every cell but the last is
 * a sourced fact; the last follows from Vibresia hearing system audio.
 */
function appVerdictHtml(a) {
    const builtIn = a.hasVisualizer === true ? `Yes. ${a.visualizerFacts[0].text}`
        : a.hasVisualizer === false ? "No." : a.noVisualizerNote;
    const places = !a.webPlayer ? "its Mac app"
        : a.macApp && /no (official )?native|not the Mac|no official native/i.test(a.macApp.text) ? "the browser" : "its Mac app or the browser";
    const withUs = a.slug === "apple-music"
        ? "Yes, and it keeps going when you switch to Spotify, a browser or anything else."
        : `Yes. Vibresia hears the Mac's system audio, so it reacts to ${a.name} in ${places}, with no plug-in.`;
    const rows = [
        ["Built-in visualiser", builtIn],
        ["On a Mac", a.macApp.text],
        ["In a browser", a.webPlayer && a.webPlayer.text],
        ["Works with Vibresia", withUs],
    ];
    return `<div class="table-scroll"><table class="versus verdict-table">
        <thead><tr><th scope="col"></th><th scope="col">${escapeHtml(a.name)} on a Mac</th></tr></thead>
        <tbody>
          ${rows.filter(([, v]) => v).map(([k, v]) => `<tr><th scope="row">${escapeHtml(k)}</th><td>${escapeHtml(v)}</td></tr>`).join("\n          ")}
        </tbody>
      </table></div>`;
}

/** The hub's table: one row per app, linking to its spoke. */
function appsTableHtml(spokes) {
    const rows = spokes.map((sp) => {
        const a = musicApp(sp.app);
        const built = a.hasVisualizer === true ? "Yes" : a.hasVisualizer === false ? "No" : "Not that we could find";
        return `<tr><th scope="row"><a href="${pathOf(sp)}">${escapeHtml(a.name)}</a></th><td>${built}</td><td>Yes, through system audio</td></tr>`;
    });
    return `<div class="table-scroll"><table>
        <thead><tr><th scope="col">App</th><th scope="col">Built-in visualiser</th><th scope="col">Works with Vibresia</th></tr></thead>
        <tbody>
          ${rows.join("\n          ")}
        </tbody>
      </table></div>`;
}

/** A spoke links to its hub and every other spoke; the hub to every spoke. */
function moreAppsHtml(page, others) {
    const hub = others.find((o) => o.template === "2d" && o.hub);
    const items = others.filter((o) => o.template === "2d" && !o.hub && o.slug !== page.slug)
        .map((o) => `<li><a href="${pathOf(o)}">${escapeHtml(o.breadcrumb)}</a></li>`);
    if (hub && !page.hub) items.unshift(`<li><a href="${pathOf(hub)}">${escapeHtml(hub.breadcrumb)}</a></li>`);
    return `<h2>${page.hub ? "Visualisers for each app" : "Other music apps"}</h2>
    <ul class="related">
        ${items.join("\n        ")}
    </ul>`;
}

const HUB_SCENE = fs.readFileSync(path.join(ROOT, "content/scenes/hub-live.glsl"), "utf8");

/**
 * The hub's interactive element (Phase 2d): a Vibresia scene drawn live in
 * the browser by the share-link player. It moves to a synthetic beat until
 * the reader allows the microphone, then to whatever the room is playing.
 * Nothing is recorded or sent anywhere: the analysis happens in the page.
 */
const LIVE_SCENE = `<figure class="live">
      <canvas width="960" height="540" aria-label="A Vibresia scene, drawn live in your browser"></canvas>
      <figcaption><button type="button" class="mic" data-track="live_scene_mic" data-placement="seo-hub">Use my microphone</button> <span class="mic-note">Play music near your computer and the scene follows it. The sound stays in this page: nothing is recorded or sent.</span></figcaption>
    </figure>
    <script src="/share/preview.js"></script>
    <script>
      (function () {
        var canvas = document.querySelector(".live canvas");
        var player = window.vibresiaPreview && window.vibresiaPreview.animate(${JSON.stringify(HUB_SCENE).replace(/</g, "\\u003c")}, canvas);
        var button = document.querySelector(".live .mic");
        if (!player || !player.ok) { document.querySelector(".live").hidden = true; return; }
        button.addEventListener("click", function () {
          if (!navigator.mediaDevices) return;
          navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
            var ctx = new (window.AudioContext || window.webkitAudioContext)();
            var an = ctx.createAnalyser();
            an.fftSize = 2048;
            ctx.createMediaStreamSource(stream).connect(an);
            var bins = new Uint8Array(an.frequencyBinCount);
            var hz = ctx.sampleRate / an.fftSize;
            var smooth = { level: 0, bass: 0, avg: 0.2 }, kick = 0;
            function band(lo, hi) {
              var a = Math.floor(lo / hz), b = Math.max(a + 1, Math.floor(hi / hz)), s = 0;
              for (var i = a; i < b; i++) s += bins[i];
              return s / (b - a) / 255;
            }
            player.listen(function () {
              an.getByteFrequencyData(bins);
              var bass = band(30, 150), mid = band(300, 2000), treble = band(4000, 12000);
              var level = (bass + mid + treble) / 3;
              smooth.level += (level - smooth.level) * 0.08;
              smooth.bass += (bass - smooth.bass) * 0.1;
              smooth.avg += (bass - smooth.avg) * 0.02;
              kick = bass > smooth.avg * 1.3 && bass > 0.25 ? 1 : kick * 0.85;
              var bands = [];
              for (var j = 0; j < 96; j++) bands.push(band(40 * Math.pow(400, j / 96), 40 * Math.pow(400, (j + 1) / 96)));
              return { bass: bass, mid: mid, treble: treble, level: level, levelSmooth: smooth.level,
                       bassSmooth: smooth.bass, beat: kick > 0.75 ? 1 : 0, beatStrength: 0.62 * kick, bands: bands };
            });
            button.textContent = "Listening";
            button.disabled = true;
          }).catch(function () {
            button.textContent = "No microphone, so it's playing a beat of its own";
            button.disabled = true;
          });
        });
      })();
    </script>`;

/** The section a template's pages live in. */
export function sectionOf(page) {
    const found = Object.entries(SECTIONS).find(([, s]) => s.templates.includes(page.template));
    if (!found) throw new Error(`${page.slug}: no section takes template ${page.template}`);
    return found[0];
}

/** "/blog/x" or "/comparison/vibresia-vs-x". */
export function pathOf(page) {
    return `/${sectionOf(page)}/${page.slug}`;
}

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
            if (r.pricing && !r.pricing.tiers.length) {
                // No tiers: say "Free" only when the record says the whole thing is.
                if (r.pricing.model === "free") return "Free";
            } else if (r.pricing) {
                // A free tier beside paid ones isn't "Free": say both.
                const paid = r.pricing.tiers.filter((t) => Number(t.price) > 0);
                if (Number(r.pricing.tiers[0].price) === 0 && paid.length) {
                    const cheapest = paid.reduce((a, b) => (Number(a.price) <= Number(b.price) ? a : b));
                    return `Free version; paid from ${money(cheapest)}`;
                }
                return h.price(slug);
            }
            if (r.licence && r.licence.openSource) return `Open source (${r.licence.name})`;
            if (r.trial) return "Free to try; paid plans on its site";
            // Its own site couldn't be read, so "not listed" would be a guess.
            if (r.profile.via === "third-party") return "Not confirmed";
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

/**
 * The head-to-head table: one row per question, Vibresia and the other app
 * side by side. Each row reads its two answers from the records.
 */
function versusTableHtml(h, page) {
    const pair = ["vibresia", page.versus];
    const head = `<th scope="col"></th>${pair.map((s) => `<th scope="col">${escapeHtml(h.name(s))}</th>`).join("")}`;
    const rows = page.rows.map((row) =>
        `<tr><th scope="row">${escapeHtml(row.label)}</th>${pair.map((s) => `<td>${escapeHtml(row.value(h, s))}</td>`).join("")}</tr>`);
    return `<div class="table-scroll"><table class="versus">\n        <thead><tr>${head}</tr></thead>\n        <tbody>\n          ${rows.join("\n          ")}\n        </tbody>\n      </table></div>`;
}

/**
 * Who should pick which. A head-to-head page argues for Vibresia, and it
 * still says who the other app is right for: that's the honest verdict the
 * playbook asks for (Phase 2c), and comparative claims have to hold up
 * (Phase 5). A page without "pick them if" doesn't build.
 */
function verdictHtml(h, page) {
    const v = page.verdict || {};
    if (!v.pickUs || !v.pickThem) throw new Error(`${page.slug}: a head-to-head needs verdict.pickUs and verdict.pickThem`);
    return `<div class="verdict">
      <div><h3>Pick Vibresia if</h3><p>${v.pickUs}</p></div>
      <div><h3>Pick ${escapeHtml(h.name(page.versus))} if</h3><p>${v.pickThem}</p></div>
    </div>`;
}

/**
 * The homepage's demo reel, so a reader sees Vibresia move before deciding
 * to download it (Phase 3: let the visitor do something first). It's 2 MB,
 * so it waits for the reader to scroll near it: the poster is what loads
 * with the page, and the answer stays the largest thing on first paint.
 * analytics.js already counts its first play as demo_played.
 */
const REEL = `<figure class="reel">
      <video muted loop playsinline preload="none" poster="/media/poster.jpg" data-src="/media/demo-low.mp4" aria-label="Vibresia playing visuals to music"></video>
      <figcaption>Vibresia, reacting to whatever the Mac is playing.</figcaption>
    </figure>
    <script>
      (function () {
        var v = document.querySelector(".reel video");
        if (!v || !("IntersectionObserver" in window)) return;
        new IntersectionObserver(function (entries, o) {
          if (!entries[0].isIntersecting) return;
          o.disconnect();
          v.src = v.dataset.src;
          v.play().catch(function () {});
        }, { rootMargin: "200px" }).observe(v);
      })();
    </script>`;

/** Vibresia, then the comparisons hub for a head-to-head, then the page. */
function breadcrumbs(page, url) {
    const trail = [{ name: "Vibresia", item: `${ORIGIN}/` }];
    if (page.versus) trail.push({ name: HUB.breadcrumb, item: `${ORIGIN}${HUB.path}` });
    if (page.template === "2d" && !page.hub && page.hubPage) trail.push({ name: page.hubPage.breadcrumb, item: `${ORIGIN}${pathOf(page.hubPage)}` });
    trail.push({ name: page.breadcrumb, item: url });
    return trail.map((t, i) => ({ "@type": "ListItem", position: i + 1, ...t }));
}

/**
 * Every other head-to-head, and the hub that lists them all. A comparison
 * page links to its siblings so none of them hangs off a single link
 * (docs/seo.md, Phase 4: no orphans).
 */
function moreComparisonsHtml(page, others) {
    const items = others
        .filter((o) => o.versus && o.slug !== page.slug)
        .map((o) => `<li><a href="${pathOf(o)}">${escapeHtml(o.breadcrumb)}</a></li>`);
    items.push(`<li><a href="${HUB.path}">${escapeHtml(HUB.linkText)}</a></li>`);
    return `<h2>More comparisons</h2>
    <ul class="related">
        ${items.join("\n        ")}
    </ul>`;
}

/** SoftwareApplication for each app on a head-to-head, with sourced offers. */
function appNode(h, slug) {
    const r = h.rec(slug);
    const node = {
        "@type": "SoftwareApplication",
        name: r.name,
        url: r.homepage,
        applicationCategory: "MultimediaApplication",
        operatingSystem: h.platforms(slug),
    };
    if (r.pricing) {
        node.offers = r.pricing.tiers.map((t) => ({
            "@type": "Offer", name: t.name, price: String(Number(t.price)), priceCurrency: t.currency, url: r.pricing.sourceUrl,
        }));
    }
    return node;
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
            publisher: ORG_REF,
            isPartOf: { "@id": SCHEMA.website["@id"] },
            image: `${ORIGIN}/media/share.jpg`,
            inLanguage: "en-GB",
        },
        {
            "@type": "BreadcrumbList",
            itemListElement: breadcrumbs(page, url),
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
    if (page.versus) graph.push(appNode(h, "vibresia"), appNode(h, page.versus));
    if (!page.faq || !page.faq.length) throw new Error(`${page.slug}: every page needs FAQs (docs/seo.md, Phase 4)`);
    graph.push(faqNode(page.faq));
    return graphJson(graph);
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
  .related { padding-left: 20px; }
  .reel { margin: 26px 0 0; }
  .reel video { width: 100%; aspect-ratio: 1280 / 844; border-radius: 14px; border: 1px solid var(--line); background: var(--panel); display: block; }
  .reel figcaption { color: var(--muted); font-size: 14px; margin-top: 8px; }
  .live { margin: 26px 0 0; }
  .live canvas { width: 100%; aspect-ratio: 16 / 9; border-radius: 14px; border: 1px solid var(--line); background: var(--panel); display: block; }
  .live figcaption { color: var(--muted); font-size: 14px; margin-top: 10px; }
  .mic { font: inherit; font-weight: 700; color: var(--text); background: var(--panel); border: 1px solid var(--magenta); border-radius: 999px; padding: 6px 14px; cursor: pointer; margin-right: 8px; }
  .mic:disabled { border-color: var(--line); cursor: default; }
  .avatar { border-radius: 50%; border: 1px solid var(--line); margin: 0 0 18px; display: block; }
  .versus { min-width: 480px; }
  .verdict-table { min-width: 0; }
  .verdict-table tbody th { width: 34%; }
  .versus tbody th { font-weight: 500; color: var(--muted); }
  .verdict { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin: 22px 0; }
  .verdict > div { background: var(--panel); border: 1px solid var(--line); border-radius: 14px; padding: 18px 20px 6px; }
  .verdict > div:first-child { border-color: var(--magenta); }
  @media (max-width: 640px) { .verdict { grid-template-columns: 1fr; } }`;

/**
 * The whole page, as the file that ships. A page file exports a function of
 * the helpers, so its prose can say a price and still read it from the record.
 */
export function render(pageFn, records, others = []) {
    const { h, used } = helpers(records);
    const page = pageFn(h);
    const url = `${ORIGIN}${pathOf(page)}`;
    if (page.template === "2c" && !page.versus) throw new Error(`${page.slug}: a head-to-head needs versus`);

    // Build the body first: it's what asks for records, and the sources and
    // the "last verified" date come from whichever records it asked for.
    const entries = page.entries ? page.entries.map((e, i) => entryHtml(h, e, i + 1)).join("\n    ") : "";
    const spokes = others.filter((o) => o.template === "2d" && !o.hub);
    if (page.template === "2d" && !page.hub) page.hubPage = others.find((o) => o.template === "2d" && o.hub);
    const table = page.versus ? versusTableHtml(h, page)
        : page.template === "2d" ? (page.hub ? appsTableHtml(spokes) : appVerdictHtml(musicApp(page.app)))
        : page.table ? tableHtml(h, page) : "";
    const verdict = page.versus ? verdictHtml(h, page) : "";
    const sections = page.sections.map((s) => `<h2>${escapeHtml(s.h2)}</h2>\n    ${s.html}`).join("\n    ");
    const faq = (page.faq || []).map((f) => `<h3>${escapeHtml(f.q)}</h3>\n      <p>${f.a}</p>`).join("\n      ");

    const recordsUsed = [...used].map((s) => h.rec(s));
    const sources = new Map();
    for (const r of recordsUsed) for (const [u, d] of sourcesFor(r)) if (!sources.has(u)) sources.set(u, [r.name, d]);
    const appsUsed = page.template === "2d" ? [page.app, ...(page.hub ? spokes.map((sp) => sp.app) : [])] : [];
    for (const slug of appsUsed) {
        const a = musicApp(slug);
        for (const f of appFacts(a)) if (!sources.has(f.sourceUrl)) sources.set(f.sourceUrl, [a.name, f.verifiedISO]);
    }
    const verifiedISO = [...sources.values()].map(([, d]) => d).sort()[0];

    const prose = [page.answer, verdict, entries, sections, faq].join(" ");
    const count = words(prose);
    const minWords = page.template === "2d" && !page.hub ? MIN_WORDS_SPOKE : MIN_WORDS;
    if (count < minWords) throw new Error(`${page.slug}: ${count} words, under the ${minWords} a page needs to publish`);
    const lower = prose.toLowerCase() + " " + page.title.toLowerCase() + " " + page.description.toLowerCase();
    for (const phrase of BANNED) if (lower.includes(phrase)) throw new Error(`${page.slug}: uses "${phrase}"`);
    if (page.description.length > 160) throw new Error(`${page.slug}: description is ${page.description.length} characters, over 160`);

    // Most facts come from each app's own pages. Say so when some don't.
    const thirdParty = recordsUsed.filter((r) => r.profile && r.profile.via === "third-party").map((r) => r.name);
    const sourcesNote = thirdParty.length
        ? `Every fact about another app on this page comes from the source listed for it, on the date shown. ${thirdParty.join(" and ")}'s own site blocks automated reading, so its facts come from the third-party pages below.`
        : "Every fact about another app on this page comes from that app's own site, store listing or code, on the date shown.";
    const sourceItems = [...sources.entries()]
        .map(([u, [n, d]]) => `<li>${escapeHtml(n)}: <a href="${escapeHtml(u)}">${escapeHtml(u)}</a> (checked ${longDate(d)})</li>`)
        .join("\n        ");
    const related = page.related.map((r) => `<li><a href="${r.href}">${escapeHtml(r.text)}</a></li>`).join("\n        ");
    const more = page.versus ? moreComparisonsHtml(page, others) : page.template === "2d" ? moreAppsHtml(page, others) : "";

    return shell({
        page, url, source: `content/pages/${page.slug}.mjs`, ldJson: jsonLd(page, h, url, verifiedISO),
        main: `<p class="eyebrow">${escapeHtml(page.eyebrow)}</p>
    <h1>${escapeHtml(page.h1)}</h1>
    <p class="byline">By <a href="${AUTHOR_PATH}">${escapeHtml(AUTHOR_DATA.name)}</a>, ${escapeHtml(AUTHOR_DATA.byline)}. Facts last checked ${longDate(verifiedISO)}; updated ${longDate(page.updatedISO)}.</p>
    <p class="answer">${page.answer}</p>
    ${table}
    ${verdict}
    ${page.hub ? LIVE_SCENE : REEL}
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
    ${more}

    <section class="sources">
      <h2>Sources</h2>
      <p>${sourcesNote} We make Vibresia, so we've tried to say where each of the others is the better choice. If something here is out of date, <a href="https://github.com/sydlawrencedev/vibresia/issues">tell us</a> and we'll fix it.</p>
      <ul>
        ${sourceItems}
      </ul>
    </section>`,
    });
}

/** The document around a page's <main>: head, chrome, analytics. */
function shell({ page, url, source, ldJson, main }) {
    const title = escapeHtml(page.title);
    const description = escapeHtml(page.description);
    return `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<!-- Generated by scripts/generate-seo-pages.mjs from ${source}. Edit that, not this. -->
<title>${title}</title>
<meta name="description" content="${description}">
<link rel="canonical" href="${url}">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="theme-color" content="#06010d">
<meta property="og:type" content="${page.ogType || (page.publishedISO ? "article" : "website")}">
<meta property="og:site_name" content="Vibresia">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:image" content="${ORIGIN}/media/share.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
${page.publishedISO ? `<meta property="article:published_time" content="${page.publishedISO}">\n<meta property="article:modified_time" content="${page.updatedISO}">\n` : ""}<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}">
<meta name="twitter:image" content="${ORIGIN}/media/share.jpg">
<meta name="posthog-key" content="phc_pzYyxiM6u2pYa6FbCkRY8HPudHDopu5LrTwnoamHaeg2">
<meta name="posthog-host" content="/ingest">
<meta name="seo-template" content="${page.template}">
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
${ldJson}
</script>
</head>
<body>
<div class="wrap">
  <!-- chrome:nav -->
${partial("nav.html")}
  <!-- /chrome:nav -->

  <main>
    ${main}
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

const HUB_FAQ = [
    {
        q: "Which comparison should I read?",
        a: `Start with the app you use now, or the one you were about to try. If you'd rather see every option for the Mac in one list, read <a href="/blog/best-music-visualizer-for-mac-2026">the best music visualizers for Mac</a>.`,
    },
    {
        q: "Are these comparisons fair if you make Vibresia?",
        a: "We have a reason to favour Vibresia, so every page says who the other app is better for, and every fact about the other app comes from a named source with the date it was checked.",
    },
    {
        q: "Is Vibresia free?",
        a: "Yes. Every feature is free, with no account and no trial, and the code is open source under the MIT licence. It needs macOS 14.2 or later on Apple silicon.",
    },
];

/**
 * The comparisons hub: one entry per head-to-head, in the words each page
 * already uses to describe itself, so the hub can't say something the page
 * doesn't.
 */
export function renderHub(comparisons, records) {
    const { h } = helpers(records);
    const url = `${ORIGIN}${HUB.path}`;
    const entries = comparisons.map((c) => `<article class="entry">
      <h3><a href="${pathOf(c)}">${escapeHtml(c.breadcrumb)}</a></h3>
      <p class="meta">${escapeHtml(h.priceCell(c.versus))} · ${escapeHtml(h.platforms(c.versus))}</p>
      <p>${escapeHtml(c.description)}</p>
    </article>`);
    const page = { title: HUB.title, description: HUB.description, template: "hub", slug: "comparison" };
    const graph = [
        {
            "@type": "CollectionPage", name: HUB.title, description: HUB.description, url, inLanguage: "en-GB",
            publisher: ORG_REF,
            isPartOf: { "@id": SCHEMA.website["@id"] },
        },
        {
            "@type": "BreadcrumbList",
            itemListElement: [
                { "@type": "ListItem", position: 1, name: "Vibresia", item: `${ORIGIN}/` },
                { "@type": "ListItem", position: 2, name: HUB.breadcrumb, item: url },
            ],
        },
        {
            "@type": "ItemList", name: HUB.title,
            itemListElement: comparisons.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.breadcrumb, url: `${ORIGIN}${pathOf(c)}` })),
        },
    ];
    return shell({
        page, url, source: "the head-to-head pages in content/pages/",
        ldJson: graphJson([...graph, faqNode(HUB_FAQ)]),
        main: `<p class="eyebrow">Comparisons</p>
    <h1>Vibresia, compared</h1>
    <p class="answer">Each page here puts Vibresia next to one other app: what each costs, what each is good at, and who should pick which. We make Vibresia, so every page also says when the other app is the better choice, and every fact about the other app comes from its own site.</p>
    <p>Vibresia is a free Mac app that turns whatever the Mac is playing into visuals. If you'd rather see every option for the Mac in one list, read <a href="/blog/best-music-visualizer-for-mac-2026">the best music visualizers for Mac</a>.</p>
    ${entries.join("\n    ")}

    ${faqHtml(HUB_FAQ)}`,
    });
}

/**
 * The author page: who writes the search pages, how they're researched, and
 * every page they've written, so the list can't fall behind the site.
 */
export function renderAuthor(pages) {
    const url = `${ORIGIN}${AUTHOR_PATH}`;
    const page = {
        title: `${AUTHOR_DATA.name}, who makes Vibresia`,
        description: `${AUTHOR_DATA.name} is ${AUTHOR_DATA.byline}, and writes its comparison pages. About ${AUTHOR_DATA.name.split(" ")[0]}, how the pages are researched, and how to report a mistake.`,
        template: "author", slug: AUTHOR_DATA.slug, ogType: "profile",
    };
    const faq = [
        { q: "Who writes the comparison pages?", a: `${escapeHtml(AUTHOR_DATA.name)}, ${escapeHtml(AUTHOR_DATA.byline)}.` },
        { q: "Where do the facts about other apps come from?", a: "From each app's own website, store listing, documentation or code, stored with the page and the date it was checked. When an app's site can't be read, from named third-party pages, and the page says so." },
        { q: "How do I report a mistake?", a: `<a href="https://github.com/sydlawrencedev/vibresia/issues">Open an issue</a> on GitHub with the page and what's wrong, and it'll be fixed.` },
    ];
    const list = [...pages.filter((p) => !p.versus), ...pages.filter((p) => p.versus)]
        .map((p) => `<li><a href="${pathOf(p)}">${escapeHtml(p.versus ? p.breadcrumb : p.h1)}</a></li>`);
    list.push(`<li><a href="${HUB.path}">${escapeHtml(HUB.linkText)}</a></li>`);
    const links = AUTHOR_DATA.sameAs.map((u) => `<a href="${escapeHtml(u)}">${escapeHtml(new URL(u).hostname.replace(/^www\./, ""))}</a>`);
    return shell({
        page, url, source: "content/data/author.json",
        ldJson: graphJson([{ "@type": "ProfilePage", url, mainEntity: AUTHOR, isPartOf: { "@id": SCHEMA.website["@id"] } }, faqNode(faq)]),
        main: `<p class="eyebrow">Author</p>
    <h1>${escapeHtml(AUTHOR_DATA.name)}</h1>
    <img class="avatar" src="${escapeHtml(AUTHOR_DATA.image)}" alt="${escapeHtml(AUTHOR_DATA.name)}" width="120" height="120">
    ${AUTHOR_DATA.bio.map((b) => `<p>${b}</p>`).join("\n    ")}
    <p>Elsewhere: ${links.join(" · ")}</p>

    <h2>How the comparison pages are written</h2>
    <p>Every fact about another app, its price, what it runs on, what it does well and where it falls short, comes from that app's own website, store listing, documentation or code. Each one is stored with the page it came from and the day it was checked, and the site won't build if a fact is missing its source or is more than a year old. When an app's own site can't be read, the facts come from named third-party pages, and the page says so.</p>
    <p>Where I haven't used an app myself, the page says so and describes what its maker says it does. Prices are shown in the currency the maker uses, and left out when they can't be confirmed.</p>
    <p>Vibresia is my app, so I have a reason to favour it. Each page says who the other apps are better for, and a list puts the better pick first when Vibresia isn't it.</p>

    <h2>Something wrong?</h2>
    <p>If a price has changed or a page gets something wrong, <a href="https://github.com/sydlawrencedev/vibresia/issues">open an issue</a> and I'll fix it.</p>

    <h2>Pages</h2>
    <ul class="related">
        ${list.join("\n        ")}
    </ul>

    ${faqHtml(faq)}`,
    });
}

/** Each page file's function, with the page it makes from these records. */
export async function loadPages(records) {
    // Files starting with "_" are shared helpers for page files, not pages.
    const files = fs.readdirSync(PAGES_DIR).filter((f) => f.endsWith(".mjs") && !f.startsWith("_")).sort();
    const pages = [];
    for (const f of files) {
        const mod = await import(pathToFileURL(path.join(PAGES_DIR, f)).href);
        const page = mod.default(helpers(records).h);
        if (`${page.slug}.mjs` !== f) throw new Error(`${f}: slug "${page.slug}" doesn't match the file name`);
        pages.push({ fn: mod.default, page });
    }
    return pages;
}

export function sitemap(pages, extra = []) {
    const urls = [...extra, ...pages.map((p) => ({ path: pathOf(p), lastmod: p.updatedISO }))]
        .map((u) => `  <url>\n    <loc>${ORIGIN}${u.path}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n  </url>`);
    return `<?xml version="1.0" encoding="UTF-8"?>
<!-- Generated by scripts/generate-seo-pages.mjs. The search pages, in a
     sitemap per section so Search Console can report how each indexes
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
    const all = pages.map((p) => p.page);
    for (const w of handChecks(all.filter((p) => p.app).map((p) => p.app))) console.warn(`  ! check by hand: ${w}`);
    const outputs = new Map(pages.map(({ fn, page }) => [path.join(ROOT, "site", `${pathOf(page)}.html`), render(fn, records, all)]));
    outputs.set(path.join(ROOT, `site${AUTHOR_PATH}.html`), renderAuthor(all));
    const comparisons = all.filter((p) => p.versus);
    if (comparisons.length) outputs.set(path.join(ROOT, HUB.file), renderHub(comparisons, records));
    for (const [section, { sitemap: file }] of Object.entries(SECTIONS)) {
        const listed = all.filter((p) => sectionOf(p) === section);
        // The hub goes in the comparisons sitemap, dated by its newest entry.
        const extra = section === "comparison" && comparisons.length
            ? [{ path: HUB.path, lastmod: comparisons.map((c) => c.updatedISO).sort().at(-1) }] : [];
        if (listed.length) outputs.set(path.join(ROOT, "site/sitemaps", file), sitemap(listed, extra));
    }

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
