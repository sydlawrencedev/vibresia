// Tests for the competitor-record validator, and for the records themselves.
//
// The rules are what keeps a comparison page honest, so each one has a
// test that breaks it on purpose. The last tests run the real file: the
// release check does too, but a failing test says which record and why.

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import { validate, DATA } from "./check-competitors.mjs";

const TODAY = "2026-11-02";

function record(overrides = {}) {
    return {
        slug: "example-app",
        name: "Example App",
        category: "visualiser",
        audience: "mac_consumer",
        homepage: "https://example.com/",
        tagline: "A music visualiser.",
        bestFor: "People who want one.",
        ourAngle: "Where we differ.",
        platforms: ["macos"],
        strengths: ["One", "Two", "Three"],
        profile: { sourceUrl: "https://example.com/", verifiedISO: TODAY },
        pricing: {
            model: "one-time",
            freeTier: false,
            tiers: [{ name: "App", price: "6.99", currency: "USD", period: "once" }],
            sourceUrl: "https://example.com/buy",
            verifiedISO: TODAY,
        },
        ...overrides,
    };
}

function errorsFor(records) {
    return validate(records, { today: TODAY }).errors;
}

test("a complete record passes", () => {
    assert.deepEqual(errorsFor([record()]), []);
});

test("optional sections can be left out", () => {
    const r = record();
    delete r.pricing;
    assert.deepEqual(errorsFor([r]), []);
});

test("a section without a source fails", () => {
    const r = record();
    delete r.pricing.sourceUrl;
    assert.match(errorsFor([r]).join("\n"), /pricing: no sourceUrl/);
});

test("a section without a verification date fails", () => {
    const r = record({ profile: { sourceUrl: "https://example.com/" } });
    assert.match(errorsFor([r]).join("\n"), /profile: no verifiedISO/);
});

test("a check over 12 months old fails, and over 9 warns", () => {
    const stale = record({ profile: { sourceUrl: "https://example.com/", verifiedISO: "2025-10-01" } });
    assert.match(errorsFor([stale]).join("\n"), /over 12 months/);

    const ageing = record({ profile: { sourceUrl: "https://example.com/", verifiedISO: "2026-01-15" } });
    const { errors, warnings } = validate([ageing], { today: TODAY });
    assert.deepEqual(errors, []);
    assert.match(warnings.join("\n"), /re-check soon/);
});

test("a date in the future fails", () => {
    const r = record({ profile: { sourceUrl: "https://example.com/", verifiedISO: "2027-01-01" } });
    assert.match(errorsFor([r]).join("\n"), /in the future/);
});

test("an unknown category fails", () => {
    assert.match(errorsFor([record({ category: "budgeting" })]).join("\n"), /unknown category/);
});

test("fewer than three strengths fails", () => {
    assert.match(errorsFor([record({ strengths: ["One", "Two"] })]).join("\n"), /at least 3 strengths/);
});

test("a quote over 25 words fails", () => {
    const quote = {
        text: Array(26).fill("word").join(" "),
        attribution: "A reviewer",
        sourceUrl: "https://example.com/review",
        verifiedISO: TODAY,
    };
    assert.match(errorsFor([record({ quotes: [quote] })]).join("\n"), /26 words, over 25/);
});

test("a pain point needs two independent sources", () => {
    const one = { text: "Crashes", sources: ["https://a.example/1"], verifiedISO: TODAY };
    assert.match(errorsFor([record({ painPoints: [one] })]).join("\n"), /two independent sources/);

    const same = { ...one, sources: ["https://a.example/1", "https://a.example/1"] };
    assert.match(errorsFor([record({ painPoints: [same] })]).join("\n"), /two independent sources/);

    const two = { ...one, sources: ["https://a.example/1", "https://b.example/2"] };
    assert.deepEqual(errorsFor([record({ painPoints: [two] })]), []);

    const docs = { ...one, fromOwnDocs: true };
    assert.deepEqual(errorsFor([record({ painPoints: [docs] })]), []);
});

test("currency is a structured ISO code, never a symbol", () => {
    const r = record();
    r.pricing.tiers[0].currency = "$";
    assert.match(errorsFor([r]).join("\n"), /currency must be an ISO code/);
});

test("freeTier has to agree with the tiers", () => {
    const r = record();
    r.pricing.tiers.push({ name: "Free", price: "0", currency: "USD", period: "once" });
    assert.match(errorsFor([r]).join("\n"), /freeTier is false but the tiers say true/);
});

test("a free model can't have a paid tier", () => {
    const r = record();
    r.pricing.model = "free";
    assert.match(errorsFor([r]).join("\n"), /model is free but a tier costs money/);
});

test("a subscription needs a recurring tier", () => {
    const r = record();
    r.pricing.model = "subscription";
    assert.match(errorsFor([r]).join("\n"), /no tier is monthly or yearly/);
});

test("slugs are unique", () => {
    assert.match(errorsFor([record(), record()]).join("\n"), /duplicate slug/);
});

test("a connection without a source fails", () => {
    const io = {
        sourceUrl: "https://example.com/docs", verifiedISO: TODAY,
        midi: { status: "yes", text: "It takes MIDI.", sourceUrl: "https://example.com/docs", verifiedISO: TODAY },
    };
    const ok = record({ io });
    assert.deepEqual(errorsFor([ok]), []);

    const noSource = structuredClone(io);
    delete noSource.midi.sourceUrl;
    assert.match(errorsFor([record({ io: noSource })]).join("\n"), /io\.midi: no sourceUrl/);
});

test("a connection has to say yes, no, or unknown", () => {
    const io = {
        sourceUrl: "https://example.com/docs", verifiedISO: TODAY,
        midi: { status: "maybe", text: "It takes MIDI.", sourceUrl: "https://example.com/docs", verifiedISO: TODAY },
    };
    assert.match(errorsFor([record({ io })]).join("\n"), /io\.midi: status must be one of/);
});

test("a connection of a kind we don't know fails", () => {
    const io = {
        sourceUrl: "https://example.com/docs", verifiedISO: TODAY,
        bluetooth: { status: "no", text: "No Bluetooth.", sourceUrl: "https://example.com/docs", verifiedISO: TODAY },
    };
    assert.match(errorsFor([record({ io })]).join("\n"), /io\.bluetooth: unknown kind/);
});

test("a limit is a sentence, or a sentence with its own source", () => {
    assert.deepEqual(errorsFor([record({ limits: ["Windows only."] })]), []);

    const sourced = { text: "Capped at 1280x1280.", sourceUrl: "https://example.com/licence", verifiedISO: TODAY };
    assert.deepEqual(errorsFor([record({ limits: [sourced] })]), []);

    const { sourceUrl, ...withoutSource } = sourced;
    assert.match(errorsFor([record({ limits: [withoutSource] })]).join("\n"), /limits\[0\]: no sourceUrl/);
});

// The real records.

const records = JSON.parse(fs.readFileSync(DATA, "utf8"));
const bySlug = Object.fromEntries(records.map((r) => [r.slug, r]));

test("content/data/competitors.json passes", () => {
    assert.deepEqual(validate(records).errors, []);
});

test("the structural claims a page will repeat match the data", () => {
    // Resolume prices in euros. A page that says "$299" is wrong.
    assert.ok(bySlug.resolume.pricing.tiers.every((t) => t.currency === "EUR"));
    // Phosphor is a one-time purchase, not a subscription.
    assert.equal(bySlug.phosphor.pricing.model, "one-time");
    // MilkDrop and Plane9 are Windows only, so they are never "for Mac".
    assert.deepEqual(bySlug.milkdrop.platforms, ["windows"]);
    assert.deepEqual(bySlug.plane9.platforms, ["windows"]);
    // TouchDesigner's free tier is real, and capped.
    assert.equal(bySlug.touchdesigner.pricing.freeTier, true);
    assert.match(bySlug.touchdesigner.trial.limits, /1280/);
});
