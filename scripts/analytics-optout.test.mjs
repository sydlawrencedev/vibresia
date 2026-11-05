// Tests for the landing page's analytics client.
//
// The one that matters most: opting out has to *drop* what is queued, not
// send it. The footer's "no thanks" link is the one action a person takes to
// stop being measured, and flushing the queue on that click would report the
// very pageview they asked not to have reported — the opt-out would be the
// thing that reports the visit.
//
// The client is a plain IIFE over `document`, `window`, `localStorage` and
// `fetch`, so it is loaded into a small fake of those here. That is the same
// shape the page gives it; nothing about the client changes.

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CLIENT = fs.readFileSync(path.join(HERE, "..", "site", "analytics.js"), "utf8");

/// A document with one element, enough for the client to find.
function makeElement({ attributes = {}, text = "" } = {}) {
  const element = {
    hidden: true,
    textContent: text,
    dataset: {},
    tagName: "A",
    getAttribute(name) {
      if (name in attributes) return attributes[name];
      return null;
    },
    hasAttribute(name) {
      return name in attributes;
    },
    setAttribute() {},
    querySelectorAll() { return []; },
    querySelector() { return null; },
    closest(selector) {
      // The client looks for `[data-optout]`, `[data-track], a[href]` and
      // `a[href*="/download"]`.
      const wantsOptOut = selector.includes("data-optout");
      const wantsHref = selector.includes("a[href");
      if (wantsOptOut && "data-optout" in attributes) return element;
      if (wantsHref && "href" in attributes) return element;
      return null;
    },
  };
  return element;
}

/// Loads the client into a fake page and returns what it did.
function run({ optedOut = false, doNotTrack = false } = {}) {
  const listeners = new Map();
  const store = new Map();
  const note = { hidden: true };

  // The footer's opt-out link.
  const element = makeElement({
    attributes: { "data-optout": "", href: "#" },
  });

  const document = {
    title: "Vibresia",
    referrer: "",
    visibilityState: "visible",
    body: {},
    querySelector(selector) {
      if (selector === 'meta[name="posthog-key"]') return { content: "phc_test_key" };
      if (selector === 'meta[name="posthog-host"]') return { content: "/ingest" };
      if (selector === 'meta[name="seo-template"]') return { content: "" };
      return null;
    },
    querySelectorAll() { return []; },
    getElementById(id) { return id === "optout-note" ? note : null; },
    addEventListener(type, handler) {
      if (!listeners.has(type)) listeners.set(type, []);
      listeners.get(type).push(handler);
    },
  };

  const window = {
    doNotTrack: doNotTrack ? "1" : "0",
    crypto: { randomUUID: () => "11111111-2222-3333-4444-555555555555" },
    addEventListener(type, handler) {
      if (!listeners.has("window:" + type)) listeners.set("window:" + type, []);
      listeners.get("window:" + type).push(handler);
    },
  };

  const localStorage = {
    getItem(key) {
      if (key === "vibresia.site.optOut") return optedOut ? "1" : null;
      return store.get(key) ?? null;
    },
    setItem(key, value) { store.set(key, value); },
  };

  const navigator = { doNotTrack: doNotTrack ? "1" : "0", language: "en-GB" };

  const fetchCalls = [];
  const fetchImpl = async (url, options) => {
    fetchCalls.push({ url, body: JSON.parse(options.body) });
    return { ok: true };
  };

  const sandbox = {
    document,
    window,
    localStorage,
    navigator,
    location: { pathname: "/", href: "https://vibresia.com/", hostname: "vibresia.com" },
    URL,
    console,
    setTimeout: () => 0,
    clearTimeout: () => {},
    fetch: fetchImpl,
    sendBeacon: undefined,
    IntersectionObserver: undefined,
  };
  sandbox.globalThis = sandbox;
  const names = Object.keys(sandbox);
  const values = names.map((name) => sandbox[name]);
  // The client is an IIFE, so it has to run in a scope where `document`,
  // `window`, `localStorage`, `navigator`, `location`, `fetch` and `console`
  // all resolve. `new Function` gives it exactly that.
  const run_ = new Function(...names, CLIENT);
  run_(...values);

  const click = (target) => {
    const event = {
      target,
      preventDefault() { this.defaultPrevented = true; },
      defaultPrevented: false,
    };
    for (const handler of listeners.get("click") || []) handler(event);
    return event;
  };

  return { fetchCalls, note, click, element, store };
}

test("opting out drops the queued pageview instead of sending it", () => {
  const page = run();
  // The pageview was queued by loading the client.
  const { click, fetchCalls, store } = page;
  click(page.element);
  assert.equal(fetchCalls.length, 0, "the opt-out sent the queued pageview");
  assert.equal(store.get("vibresia.site.optOut"), "1", "the opt-out was not remembered");
});

test("the opt-out note is shown, so the link does not look broken", () => {
  const page = run();
  page.click(page.element);
  assert.equal(page.note.hidden, false, "the note stayed hidden");
});

test("Do Not Track sends nothing at all", () => {
  const page = run({ doNotTrack: true });
  assert.equal(page.fetchCalls.length, 0, "a pageview was sent with Do Not Track on");
});

test("an opt-out already recorded means nothing is sent", () => {
  const page = run({ optedOut: true });
  assert.equal(page.fetchCalls.length, 0, "a pageview was sent after opting out");
});

test("the opt-out link still works on a later visit, when nothing is being measured", () => {
  const page = run({ optedOut: true });
  // The link has to say "Done" rather than sitting there doing nothing.
  page.click(page.element);
  assert.equal(page.note.hidden, false, "the opt-out link was inert on a later visit");
});
