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
  // `data-track` and friends reach the client through `dataset`, the way a
  // real browser turns `data-placement` into `dataset.placement`.
  const dataset = {};
  for (const [name, value] of Object.entries(attributes)) {
    if (name.startsWith("data-")) {
      dataset[name.slice(5).replace(/-(\w)/g, (_, c) => c.toUpperCase())] = value;
    }
  }
  const element = {
    hidden: true,
    textContent: text,
    dataset,
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
      const wantsTrack = selector.includes("data-track");
      const wantsHref = selector.includes("a[href");
      if (wantsOptOut && "data-optout" in attributes) return element;
      if (wantsTrack && "data-track" in attributes) return element;
      if (wantsHref && "href" in attributes) return element;
      return null;
    },
  };
  return element;
}

/// Loads the client into a fake page and returns what it did.
///
/// `flush` makes the client's 2.5-second timer fire at once, so a test can
/// see what the page actually sent. Without it the queue stays in memory and
/// the only thing a test can assert is that nothing was sent.
function run({ optedOut = false, doNotTrack = false, randomUUID = null, flush = false } = {}) {
  const listeners = new Map();
  const store = new Map();
  const note = { hidden: true };

  // The footer's opt-out link.
  const element = makeElement({
    attributes: { "data-optout": "", href: "#" },
  });

  // A button that reports itself when it is clicked, so a test can put two
  // events in one visit.
  const tracked = makeElement({
    attributes: { "data-track": "download_clicked", "data-placement": "hero" },
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
    // The client asks for randomUUID when it can and falls back when it
    // cannot. A test can turn it off to check the fallback, or hand it a
    // value to check the client does not lean on it.
    crypto: {
      randomUUID: randomUUID === null
        ? () => "11111111-2222-3333-4444-555555555555"
        : randomUUID,
      getRandomValues: (array) => {
        for (let i = 0; i < array.length; i++) array[i] = 0xab;
        return array;
      },
    },
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

  const timers = [];
  const sandbox = {
    document,
    window,
    localStorage,
    navigator,
    location: { pathname: "/", href: "https://vibresia.com/", hostname: "vibresia.com" },
    URL,
    console,
    Date,
    // The client schedules its flush on a timer. When the test asks for it,
    // the callback is kept so it can be run by hand; otherwise the timer
    // never fires and the queue stays where it is.
    setTimeout: (fn) => {
      if (!flush) return 0;
      timers.push(fn);
      return timers.length;
    },
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

  const runTimers = async () => {
    while (timers.length) timers.shift()();
    // The client sends with `fetch`, which is a promise.
    await new Promise((resolve) => setImmediate(resolve));
  };

  const click = (target) => {
    const event = {
      target,
      preventDefault() { this.defaulted = true; },
      defaultPrevented: false,
    };
    for (const handler of listeners.get("click") || []) handler(event);
    return event;
  };

  return { fetchCalls, note, click, element, tracked, store, runTimers };
}

/// Is this a UUIDv7? The version is the first nibble of the third group.
function isUuidV7(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ""));
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

test("the session id travels as $session_id inside properties", async () => {
  // PostHog reads $session_id from the properties bag. A top-level
  // `session_id` key is dropped on the way in, so the session was never
  // recorded and every web-analytics session count was wrong.
  const page = run({ flush: true });
  await page.runTimers();
  const event = page.fetchCalls[0].body[0];
  assert.ok(event.properties.$session_id, "the event carried no $session_id property");
  assert.equal(
    event.session_id,
    undefined,
    "the event still carries a top-level session_id, which PostHog ignores",
  );
});

test("the session id is a UUIDv7, because PostHog requires one", async () => {
  // PostHog drops events whose session id is not a UUIDv7 from its session
  // aggregations, so a UUIDv4 means the visit counts for nothing.
  const page = run({ flush: true });
  await page.runTimers();
  const event = page.fetchCalls[0].body[0];
  assert.ok(
    isUuidV7(event.properties.$session_id),
    `$session_id was not a UUIDv7: ${event.properties.$session_id}`,
  );
});

test("a browser without randomUUID still gets a UUIDv7 session id", async () => {
  // crypto.randomUUID is v4 and is missing on older browsers anyway. The
  // client has to make its own v7 either way.
  const page = run({ flush: true, randomUUID: undefined });
  await page.runTimers();
  const event = page.fetchCalls[0].body[0];
  assert.ok(
    isUuidV7(event.properties.$session_id),
    `$session_id was not a UUIDv7 without randomUUID: ${event.properties.$session_id}`,
  );
});

test("every event in a visit carries the same session id", async () => {
  // A session is a set of events, so the id has to hold still across them.
  const page = run({ flush: true });
  page.click(page.tracked);
  await page.runTimers();
  const body = page.fetchCalls[0].body;
  assert.equal(body.length, 2, "the visit did not report two events");
  const sessionId = body[0].properties.$session_id;
  assert.ok(sessionId, "the first event carried no $session_id");
  assert.equal(body[0].properties.$session_id, sessionId);
  assert.equal(body[1].properties.$session_id, sessionId);
});

test("the session id carries the time the visit started", async () => {
  // The first 48 bits of a UUIDv7 are a millisecond timestamp, and PostHog
  // reads it to know when the session began. Getting the bytes in the wrong
  // place still makes a well-formed v7, so only decoding it catches it: a
  // mis-packed id decodes to a date far in the future and PostHog counts it
  // as a session that has not happened yet.
  const page = run({ flush: true });
  await page.runTimers();
  const sessionId = page.fetchCalls[0].body[0].properties.$session_id;
  const hex = sessionId.replace(/-/g, "");
  const decoded = new Date(parseInt(hex.slice(0, 12), 16));
  const drift = Math.abs(Date.now() - decoded.getTime());
  assert.ok(
    drift < 60000,
    `the session id decoded to ${decoded.toISOString()}, which is ${drift}ms away from now`,
  );
});
