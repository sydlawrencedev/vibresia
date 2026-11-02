// Checks the competitor records the comparison pages are built from.
//
// A wrong fact about another product is a legal risk and a lost reader, and
// the way it happens is quiet: a price copied from memory, a review score
// nobody can find again, a pricing page that changed a year ago. So every
// section that states a fact carries the page it came from and the day it
// was checked, and this fails the release when one doesn't — or when the
// check is too old to trust.
//
//   node scripts/check-competitors.mjs
//
// It exits non-zero on an error, and prints warnings for records getting
// stale. See docs/seo.md, Phase 1b.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const DATA = path.join(ROOT, "content/data/competitors.json");

export const CATEGORIES = ["visualiser", "vj", "creative-coding"];
export const AUDIENCES = ["mac_consumer", "windows_consumer", "web_consumer", "vj_pro", "creative_coder"];
export const PLATFORMS = ["macos", "windows", "linux", "ios", "android", "web", "tvos", "visionos"];
export const PRICING_MODELS = ["free", "one-time", "subscription"];
export const PERIODS = ["once", "month", "year"];

const MAX_AGE_MONTHS = 12;
const WARN_AGE_MONTHS = 9;
const MAX_QUOTE_WORDS = 25;
const MIN_STRENGTHS = 3;

// What a product can be wired into. A referee page compares two of these
// side by side, so a record has to say where it stands on each one.
export const IO_KINDS = ["midi", "osc", "syphon", "spout", "ndi", "dmx", "video"];
export const IO_STATUSES = ["yes", "no", "unknown"];

/** Months between two ISO dates, as a fraction. */
function monthsBetween(fromISO, toISO) {
    const ms = Date.parse(toISO) - Date.parse(fromISO);
    return ms / (1000 * 60 * 60 * 24 * 30.44);
}

function isISODate(value) {
    return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
}

function isURL(value) {
    try {
        return ["https:", "http:"].includes(new URL(value).protocol);
    } catch {
        return false;
    }
}

function words(text) {
    return String(text).trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Checks the records and returns what is wrong with them. `today` is a
 * parameter so the tests can say what day it is.
 */
export function validate(records, { today = new Date().toISOString().slice(0, 10) } = {}) {
    const errors = [];
    const warnings = [];

    if (!Array.isArray(records)) {
        return { errors: ["competitors.json must be an array of records"], warnings };
    }

    // A sourced section: where it came from and when somebody looked.
    function checkSource(where, section) {
        if (!isURL(section.sourceUrl)) errors.push(`${where}: no sourceUrl`);
        if (!isISODate(section.verifiedISO)) {
            errors.push(`${where}: no verifiedISO date`);
            return;
        }
        if (section.verifiedISO > today) errors.push(`${where}: verifiedISO ${section.verifiedISO} is in the future`);
        const age = monthsBetween(section.verifiedISO, today);
        if (age > MAX_AGE_MONTHS) errors.push(`${where}: verified ${section.verifiedISO}, over ${MAX_AGE_MONTHS} months ago`);
        else if (age > WARN_AGE_MONTHS) warnings.push(`${where}: verified ${section.verifiedISO}, re-check soon`);
    }

    const slugs = new Set();
    for (const [i, r] of records.entries()) {
        const at = r && r.slug ? r.slug : `record ${i}`;

        if (!r || typeof r !== "object") {
            errors.push(`${at}: not an object`);
            continue;
        }
        if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(r.slug || "")) errors.push(`${at}: slug must be lowercase-kebab`);
        if (slugs.has(r.slug)) errors.push(`${at}: duplicate slug`);
        slugs.add(r.slug);

        for (const field of ["name", "tagline", "bestFor", "ourAngle"]) {
            if (typeof r[field] !== "string" || !r[field].trim()) errors.push(`${at}: no ${field}`);
        }
        if (!isURL(r.homepage)) errors.push(`${at}: no homepage`);
        if (!CATEGORIES.includes(r.category)) errors.push(`${at}: unknown category "${r.category}"`);
        if (!AUDIENCES.includes(r.audience)) errors.push(`${at}: unknown audience "${r.audience}"`);

        // The profile: what it is, where it runs, what it's good at.
        if (!r.profile || typeof r.profile !== "object") {
            errors.push(`${at}: no profile section`);
        } else {
            checkSource(`${at}.profile`, r.profile);
        }
        if (!Array.isArray(r.platforms) || r.platforms.length === 0) {
            errors.push(`${at}: no platforms`);
        } else {
            for (const p of r.platforms) if (!PLATFORMS.includes(p)) errors.push(`${at}: unknown platform "${p}"`);
        }
        if (!Array.isArray(r.strengths) || r.strengths.length < MIN_STRENGTHS) {
            errors.push(`${at}: needs at least ${MIN_STRENGTHS} strengths`);
        }

        // Optional sections. Absent is fine: the page for that section just
        // doesn't render. Present means sourced.
        if (r.pricing !== undefined) {
            const p = r.pricing;
            checkSource(`${at}.pricing`, p);
            if (!PRICING_MODELS.includes(p.model)) errors.push(`${at}.pricing: unknown model "${p.model}"`);
            if (typeof p.freeTier !== "boolean") errors.push(`${at}.pricing: freeTier must be true or false`);
            if (!Array.isArray(p.tiers)) {
                errors.push(`${at}.pricing: tiers must be a list`);
            } else {
                for (const t of p.tiers) {
                    const where = `${at}.pricing.${t.name || "?"}`;
                    if (!t.name) errors.push(`${where}: tier has no name`);
                    if (!/^\d+(\.\d{2})?$/.test(String(t.price))) errors.push(`${where}: price must be a number like "6.99"`);
                    if (!/^[A-Z]{3}$/.test(t.currency || "")) errors.push(`${where}: currency must be an ISO code like "USD"`);
                    if (!PERIODS.includes(t.period)) errors.push(`${where}: unknown period "${t.period}"`);
                }
                // The structural claims a page will make have to agree with
                // the tiers they're made from.
                const hasFree = p.tiers.some((t) => Number(t.price) === 0);
                if (p.tiers.length && p.freeTier !== hasFree) {
                    errors.push(`${at}.pricing: freeTier is ${p.freeTier} but the tiers say ${hasFree}`);
                }
                if (p.model === "free" && p.tiers.some((t) => Number(t.price) > 0)) {
                    errors.push(`${at}.pricing: model is free but a tier costs money`);
                }
                if (p.model === "subscription" && !p.tiers.some((t) => ["month", "year"].includes(t.period))) {
                    errors.push(`${at}.pricing: model is subscription but no tier is monthly or yearly`);
                }
            }
        }

        if (r.trial !== undefined) {
            checkSource(`${at}.trial`, r.trial);
            if (typeof r.trial.limits !== "string" || !r.trial.limits.trim()) errors.push(`${at}.trial: say what the trial limits`);
        }

        if (r.licence !== undefined) {
            checkSource(`${at}.licence`, r.licence);
            if (typeof r.licence.name !== "string" || !r.licence.name.trim()) errors.push(`${at}.licence: no name`);
            if (typeof r.licence.openSource !== "boolean") errors.push(`${at}.licence: openSource must be true or false`);
        }

        // Limits are what a page lists as the weakness, so they are claims
        // too. A limit is either a sentence, which the record's profile
        // source covers, or an object with its own source, for a limit that
        // came from somewhere else (a manual, a features page).
        if (r.limits !== undefined) {
            if (!Array.isArray(r.limits)) {
                errors.push(`${at}.limits: must be a list of sentences`);
            } else {
                for (const [j, l] of r.limits.entries()) {
                    const where = `${at}.limits[${j}]`;
                    if (typeof l === "string") {
                        if (!l.trim()) errors.push(`${where}: empty limit`);
                    } else if (!l || typeof l !== "object") {
                        errors.push(`${where}: must be a sentence or an object`);
                    } else {
                        if (typeof l.text !== "string" || !l.text.trim()) errors.push(`${where}: no text`);
                        checkSource(where, l);
                    }
                }
            }
        }

        // Requirements are a fact too. The sentence may come from the
        // profile page, in which case the record's own source covers it, or
        // from a specifications page of its own.
        if (r.requirements !== undefined && (typeof r.requirements !== "string" || !r.requirements.trim())) {
            errors.push(`${at}.requirements: must be a sentence`);
        }
        if (r.requirementsSource !== undefined) {
            checkSource(`${at}.requirementsSource`, r.requirementsSource);
        }

        // What a product can be wired into. Each kind says whether it is
        // supported, and says so with its own source: "not that we could
        // find" is a valid answer, a guess is not.
        if (r.io !== undefined) {
            if (!r.io || typeof r.io !== "object") {
                errors.push(`${at}.io: must be an object`);
            } else {
                checkSource(`${at}.io`, r.io);
                for (const [kind, entry] of Object.entries(r.io)) {
                    if (kind === "sourceUrl" || kind === "verifiedISO" || kind === "via") continue;
                    const where = `${at}.io.${kind}`;
                    if (!IO_KINDS.includes(kind)) {
                        errors.push(`${where}: unknown kind "${kind}"`);
                        continue;
                    }
                    if (!entry || typeof entry !== "object") {
                        errors.push(`${where}: must be an object`);
                        continue;
                    }
                    if (!IO_STATUSES.includes(entry.status)) {
                        errors.push(`${where}: status must be one of ${IO_STATUSES.join(", ")}`);
                    }
                    if (typeof entry.text !== "string" || !entry.text.trim()) errors.push(`${where}: no text`);
                    checkSource(where, entry);
                }
            }
        }

        if (r.reviews !== undefined) {
            checkSource(`${at}.reviews`, r.reviews);
            if (typeof r.reviews.score !== "number") errors.push(`${at}.reviews: no score`);
            if (!Number.isInteger(r.reviews.count)) errors.push(`${at}.reviews: no count`);
            if (!r.reviews.platform) errors.push(`${at}.reviews: no platform`);
        }

        // A pain point is something people complain about, not something we
        // think: two independent sources, or the competitor's own docs.
        if (r.painPoints !== undefined) {
            if (!Array.isArray(r.painPoints)) {
                errors.push(`${at}.painPoints: must be a list`);
            } else {
                for (const [j, pp] of r.painPoints.entries()) {
                    const where = `${at}.painPoints[${j}]`;
                    if (!pp.text) errors.push(`${where}: no text`);
                    const sources = Array.isArray(pp.sources) ? pp.sources : [];
                    if (!sources.every(isURL)) errors.push(`${where}: a source isn't a URL`);
                    const fromDocs = pp.fromOwnDocs === true && sources.length >= 1;
                    if (!fromDocs && new Set(sources).size < 2) errors.push(`${where}: needs two independent sources, or the competitor's own docs`);
                    if (!isISODate(pp.verifiedISO)) errors.push(`${where}: no verifiedISO date`);
                    else checkSource(where, { sourceUrl: sources[0], verifiedISO: pp.verifiedISO });
                }
            }
        }

        for (const [j, q] of (r.quotes || []).entries()) {
            const where = `${at}.quotes[${j}]`;
            if (words(q.text) > MAX_QUOTE_WORDS) errors.push(`${where}: quote is ${words(q.text)} words, over ${MAX_QUOTE_WORDS}`);
            if (!q.attribution) errors.push(`${where}: no attribution`);
            checkSource(where, q);
        }
    }

    return { errors, warnings };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const records = JSON.parse(fs.readFileSync(DATA, "utf8"));
    const { errors, warnings } = validate(records);
    for (const w of warnings) console.warn(`warning: ${w}`);
    for (const e of errors) console.error(`error: ${e}`);
    if (errors.length) {
        console.error(`${path.relative(ROOT, DATA)}: ${errors.length} error(s)`);
        process.exit(1);
    }
    console.log(`${path.relative(ROOT, DATA)}: ${records.length} competitors, all sourced`);
}
