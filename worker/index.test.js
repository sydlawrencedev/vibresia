// Tests for the Worker: node --test worker/*.test.js
//
// The Discord POST is captured by replacing global fetch, so nothing here
// touches the network or needs a webhook — the same reason delphina mocks
// `https` in its notification tests. Keeping the payload builder pure is what
// makes that possible.

import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";

import worker, { buildDownloadEmbed, buildErrorEmbed, resetRateLimiter } from "./index.js";

const RELEASE_ZIP =
  "https://github.com/sydlawrencedev/vibresia/releases/latest/download/Vibresia.zip";

function makeEnv(overrides = {}) {
  return {
    ASSETS: { fetch: async () => new Response("asset", { status: 200 }) },
    DISCORD_WEBHOOK_URL: "https://discord.com/api/webhooks/1/token",
    DISCORD_BOT_USERNAME: "Vibresia",
    POSTHOG_KEY: "phc_test_key",
    POSTHOG_HOST: "https://us.i.posthog.com",
    ...overrides,
  };
}

/** Runs the worker with fetch stubbed, returning the response and every POST. */
async function run(url, { env = makeEnv(), headers = {}, cf = {}, method = "GET", body } = {}) {
  const posts = [];
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (target, init) => {
    posts.push({ url: String(target), body: JSON.parse(init.body) });
    // 204 is what a Discord webhook actually answers, and it carries no body.
    return new Response(null, { status: 204 });
  };
  const request = new Request(url, { method, headers, body });
  Object.defineProperty(request, "cf", { value: cf });
  const waits = [];
  const ctx = { waitUntil: (promise) => waits.push(promise) };
  try {
    const response = await worker.fetch(request, env, ctx);
    await Promise.all(waits); // the Discord post is fire-and-forget
    // A download does two things: it tells Discord, and it counts itself in
    // the analytics. The tests care about each on its own.
    return {
      response,
      posts: posts.filter((p) => !p.url.includes("posthog")),
      events: posts.filter((p) => p.url.includes("posthog")),
    };
  } finally {
    globalThis.fetch = realFetch;
  }
}

// The debounce is per-isolate module state on purpose; the tests share one
// process, so each case starts from a clean slate.
beforeEach(resetRateLimiter);

const BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/17.0 Safari/605.1.15";

test("download redirects to the latest release", async () => {
  const { response, posts } = await run("https://vibresia.com/download?src=hero&seen=0", {
    headers: { "user-agent": BROWSER_UA, referer: "https://vibresia.com/" },
  });
  assert.equal(response.status, 302);
  assert.equal(response.headers.get("location"), RELEASE_ZIP);
  assert.equal(posts.length, 0, "a download posts nothing to Discord");
});

test("no download request posts to Discord, whoever makes it", async () => {
  // The message used to be gated on the request looking like a person. It
  // is gone for every request instead, because a download link is a public
  // URL: anything that fetches it posted a message of its own, with
  // whatever it had put in the link.
  for (const agent of [
    BROWSER_UA,
    "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    "curl/8.4.0",
    "Slackbot-LinkExpanding 1.0",
    "WhatsApp/2.23.20",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1",
  ]) {
    const { response, posts } = await run("https://vibresia.com/download?src=hero", {
      headers: { "user-agent": agent },
    });
    assert.equal(response.status, 302, `${agent} still gets the file`);
    assert.equal(posts.length, 0, `${agent} must not post`);
  }
});

test("a link preview gets the file and posts nothing", async () => {
  // Apple's preview fetcher is not a download. It used to be filtered out
  // of the notification, but the notification is gone now, so the check is
  // that the file is still served.
  const { response, posts } = await run("https://vibresia.com/download", {
    headers: { "user-agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1" },
  });
  assert.equal(response.status, 302);
  assert.equal(response.headers.get("location"), RELEASE_ZIP);
  assert.equal(posts.length, 0);
});

test("a double-clicked button still downloads twice", async () => {
  // The old rate limit existed so a double click did not post twice. There
  // is nothing to post now, so the limit is gone too, and both clicks are
  // served.
  const first = await run("https://vibresia.com/download?src=hero&seen=0", {
    headers: { "user-agent": BROWSER_UA },
  });
  const second = await run("https://vibresia.com/download?src=hero&seen=0", {
    headers: { "user-agent": BROWSER_UA },
  });
  assert.equal(first.response.status, 302);
  assert.equal(second.response.status, 302, "the file still downloads");
  assert.equal(first.posts.length, 0);
  assert.equal(second.posts.length, 0);
});

test("no webhook configured means a silent download, not an error", async () => {
  const { response, posts } = await run("https://vibresia.com/download", {
    env: makeEnv({ DISCORD_WEBHOOK_URL: "" }),
    headers: { "user-agent": BROWSER_UA },
  });
  assert.equal(response.status, 302);
  assert.equal(posts.length, 0);
});

test("a download posts nothing even with the webhook on", async () => {
  const env = makeEnv();
  const { response, posts } = await run("https://vibresia.com/download", {
    env,
    headers: { "user-agent": BROWSER_UA },
  });
  assert.equal(response.status, 302);
  assert.equal(posts.length, 0);
});

test("a Discord outage never breaks the download", async () => {
  const realFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    throw new Error("ECONNREFUSED");
  };
  const request = new Request("https://vibresia.com/download", {
    headers: { "user-agent": BROWSER_UA },
  });
  const waits = [];
  try {
    const response = await worker.fetch(request, makeEnv(), { waitUntil: (p) => waits.push(p) });
    assert.equal(response.status, 302);
    assert.equal(response.headers.get("location"), RELEASE_ZIP);
    await Promise.all(waits); // resolves rather than rejecting: waitUntil would log an unhandled error
    // One: the count in the analytics. The Discord alert is gone, so a
    // Discord outage cannot touch the download at all.
    assert.equal(calls, 1, "only the count, and no alert to fail");
  } finally {
    globalThis.fetch = realFetch;
  }
});

// The iPhone user agent Apple's servers use to build a link preview in a
// message. A preview fetching the download link is somebody reading a link,
// not somebody installing anything.
const LINK_PREVIEW_AGENT =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1";

test("a link preview is not a download", async () => {
  const { response, posts } = await run("https://vibresia.com/download?src=share_waveform", {
    headers: { "user-agent": LINK_PREVIEW_AGENT, referer: "https://vibresia.com/share/waveform" },
  });
  // The redirect still happens: a preview fetcher wants the zip.
  assert.equal(response.status, 302);
  assert.equal(response.headers.get("location"), RELEASE_ZIP);
  // But nobody is told about it, and it is not counted.
  assert.equal(posts.length, 0);
});

test("a HEAD request is a check, not a download", async () => {
  const { response, posts } = await run("https://vibresia.com/download?src=hero", {
    method: "HEAD",
    headers: { "user-agent": BROWSER_UA },
  });
  assert.equal(response.status, 302);
  assert.equal(posts.length, 0);
});

test("a real download is counted on the server", async () => {
  const { response, posts, events } = await run("https://vibresia.com/download?src=hero&seen=0", {
    headers: { "user-agent": BROWSER_UA, referer: "https://vibresia.com/" },
  });
  assert.equal(response.status, 302);
  // The count — which is the one that does not depend on anybody's
  // JavaScript running. There is no Discord alert alongside it any more.
  assert.equal(posts.length, 0, "a download posts nothing to Discord");
  assert.equal(events.length, 1, "the download was not counted on the server");
  const [event] = events[0].body;
  assert.equal(event.event, "download_requested");
  assert.equal(event.properties.source, "hero");
  assert.equal(event.properties.seen, false);
  assert.equal(event.properties.surface, "web");
});

test("http and www are redirected to the canonical URL", async () => {
  const http = await run("http://vibresia.com/");
  assert.equal(http.response.status, 301);
  assert.equal(http.response.headers.get("location"), "https://vibresia.com/");

  const www = await run("https://www.vibresia.com/download?src=hero");
  assert.equal(www.response.status, 301);
  assert.equal(www.response.headers.get("location"), "https://vibresia.com/download?src=hero");
});

test("the old hostname redirects to the new one, keeping the path", async () => {
  // The old install command and any old link in someone's post have to
  // keep working, and land on the page they asked for rather than the
  // homepage.
  const install = await run("https://audiovane.minithlabs.com/install.sh");
  assert.equal(install.response.status, 301);
  assert.equal(
    install.response.headers.get("location"),
    "https://vibresia.com/install.sh"
  );

  const download = await run("https://audiovane.minithlabs.com/download?src=hero");
  assert.equal(download.response.status, 301);
  assert.equal(
    download.response.headers.get("location"),
    "https://vibresia.com/download?src=hero"
  );

  // An old plain-http link goes straight to the new address, in one hop.
  const plain = await run("http://audiovane.minithlabs.com/");
  assert.equal(plain.response.status, 301);
  assert.equal(plain.response.headers.get("location"), "https://vibresia.com/");
});

test("local dev is left alone", async () => {
  // `wrangler dev` rewrites Host to the production hostname over plain http.
  // Redirecting there would loop /download back onto itself forever, so the
  // miniflare proxy's header is what marks a request as local.
  const { response, posts } = await run("http://vibresia.com/download?src=hero&seen=0", {
    headers: { "user-agent": BROWSER_UA, "mf-original-hostname": "127.0.0.1:8787" },
  });
  assert.equal(response.status, 302);
  assert.equal(response.headers.get("location"), RELEASE_ZIP);
  assert.equal(posts.length, 0);

  const onLocalhost = await run("http://localhost:8787/", { headers: { host: "localhost:8787" } });
  assert.equal(onLocalhost.response.status, 200);
});

test("the site's analytics reach PostHog through this domain", async () => {
  const batch = [{ api_key: "phc_test_key", event: "$pageview", distinct_id: "a" }];
  const { response, events } = await run("https://vibresia.com/ingest/batch/", {
    method: "POST",
    headers: { "content-type": "application/json", "cf-connecting-ip": "203.0.113.7" },
    body: JSON.stringify(batch),
  });
  assert.equal(response.status, 204);
  assert.equal(events.length, 1);
  assert.equal(events[0].url, "https://us.i.posthog.com/batch/");
  assert.deepEqual(events[0].body, batch, "the batch was changed on the way through");
});

test("the analytics proxy forwards one endpoint, not all of PostHog", async () => {
  const other = await run("https://vibresia.com/ingest/decide/", { method: "POST", body: "{}" });
  assert.equal(other.response.status, 404);
  const get = await run("https://vibresia.com/ingest/batch/");
  assert.equal(get.response.status, 405);
  assert.equal(other.events.length + get.events.length, 0);
});

test("a download cannot ping the channel", async () => {
  // The `src` and the referrer are whatever the caller typed, so they can
  // carry a mention. A download posts nothing at all now, so there is
  // nothing that could be pinged with one.
  const { posts } = await run(
    "https://vibresia.com/download?src=" + encodeURIComponent("@everyone"),
    { headers: { "user-agent": BROWSER_UA, referer: "https://evil.example/@here" } },
  );
  assert.equal(posts.length, 0, "a download posts nothing, so it cannot ping");
});

test("an error report cannot ping the channel", async () => {
  const body = JSON.stringify({
    kind: "audio_error",
    title: "@everyone",
    message: "@here",
    priority: "urgent",
  });
  const posts = [];
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (target, init) => {
    posts.push({ url: String(target), body: JSON.parse(init.body) });
    return new Response(null, { status: 204 });
  };
  const request = new Request("https://vibresia.com/api/notify", {
    method: "POST",
    headers: { "content-type": "application/json", "x-av-token": "s3cret" },
    body,
  });
  const waits = [];
  try {
    await worker.fetch(request, makeEnv({ NOTIFY_TOKEN: "s3cret" }), {
      waitUntil: (p) => waits.push(p),
    });
    await Promise.all(waits);
    assert.deepEqual(posts[0].body.allowed_mentions, { parse: [] });
  } finally {
    globalThis.fetch = realFetch;
  }
});

test("everything else falls through to the static assets", async () => {
  const { response, posts } = await run("https://vibresia.com/index.html");
  assert.equal(response.status, 200);
  assert.equal(await response.text(), "asset");
  assert.equal(posts.length, 0);
});

test("the app can report a problem, but only with the token", async () => {
  const body = {
    kind: "audio_error",
    title: "Audio source failed: denied",
    message: "Failed to create process tap (OSStatus -536905213).",
    priority: "urgent",
    fields: [{ name: "mode", value: "band" }],
  };
  const env = makeEnv({ NOTIFY_TOKEN: "s3cret" });

  const wrong = await run("https://vibresia.com/api/notify", {
    env,
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json", "x-av-token": "nope" },
  });
  assert.equal(wrong.response.status, 401, "a bad token gets nothing");
  assert.equal(wrong.posts.length, 0);

  const ok = await run("https://vibresia.com/api/notify", {
    env,
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json", "x-av-token": "s3cret" },
  });
  assert.equal(ok.response.status, 200);
});

test("an error report reaches Discord shaped like an error", async () => {
  const body = JSON.stringify({
    kind: "audio_error",
    title: "Audio source failed: system audio failed",
    message: "Failed to create process tap.",
    priority: "urgent",
    fields: [{ name: "mode", value: "band" }, { name: "genre", value: "Jazz" }],
  });
  const posts = [];
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (target, init) => {
    posts.push({ url: String(target), body: JSON.parse(init.body) });
    return new Response(null, { status: 204 });
  };
  const request = new Request("https://vibresia.com/api/notify", {
    method: "POST",
    headers: { "content-type": "application/json", "x-av-token": "s3cret" },
    body,
  });
  const waits = [];
  try {
    const response = await worker.fetch(request, makeEnv({ NOTIFY_TOKEN: "s3cret" }), {
      waitUntil: (p) => waits.push(p),
    });
    await Promise.all(waits);
    assert.equal(response.status, 200);
    const embed = posts[0].body.embeds[0];
    assert.equal(embed.color, 0xe74c3c, "urgent is red");
    assert.match(embed.title, /Audio source failed/);
    assert.deepEqual(embed.fields.map((f) => f.name), ["mode", "genre"]);
  } finally {
    globalThis.fetch = realFetch;
  }
});

test("reports stop at one a minute, so a broken install can't flood the channel", async () => {
  const headers = { "content-type": "application/json", "x-av-token": "s3cret" };
  const body = JSON.stringify({ kind: "audio_error", title: "still broken", message: "again" });
  const env = makeEnv({ NOTIFY_TOKEN: "s3cret" });
  const send = () => run("https://vibresia.com/api/notify", { env, method: "POST", headers, body });

  const first = await send();
  assert.equal(first.posts.length, 1);
  for (let i = 0; i < 4; i++) await send(); // inside the cooldown
  const last = await send();
  assert.equal(last.posts.length, 0);
});

test("a bot filling in the honeypot gets a polite nothing", async () => {
  const headers = { "content-type": "application/json", "x-av-token": "s3cret" };
  const request = new Request("https://vibresia.com/api/notify", {
    method: "POST",
    headers,
    body: JSON.stringify({ title: "buy followers", message: "cheap links", website: "http://spam" }),
  });
  const posts = [];
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (t, i) => { posts.push(i); return new Response(null, { status: 204 }); };
  try {
    const response = await worker.fetch(request, makeEnv({ NOTIFY_TOKEN: "s3cret" }), {
      waitUntil: () => {},
    });
    assert.equal(response.status, 200);
    assert.equal(posts.length, 0);
  } finally {
    globalThis.fetch = realFetch;
  }
});

test("errors can be switched off without taking downloads with them", async () => {
  const headers = { "content-type": "application/json", "x-av-token": "s3cret" };
  const { response, posts } = await run("https://vibresia.com/api/notify", {
    env: makeEnv({ NOTIFY_TOKEN: "s3cret", DISCORD_ERRORS_ENABLED: "false" }),
    method: "POST",
    headers,
    body: JSON.stringify({ kind: "audio_error", title: "quiet please", message: "" }),
  });
  assert.equal(response.status, 200);
  assert.equal(posts.length, 0);

  const dl = await run("https://vibresia.com/download?src=hero&seen=0", {
    env: makeEnv({ DISCORD_ERRORS_ENABLED: "false" }),
    headers: { "user-agent": BROWSER_UA },
  });
  assert.equal(dl.response.status, 302, "the download still works");
  assert.equal(dl.posts.length, 0, "and it posts nothing either way");
});

test("a long report is trimmed to what Discord accepts", () => {
  const embed = buildErrorEmbed({
    title: "t".repeat(400),
    message: "m".repeat(6000),
    fields: Array.from({ length: 30 }, (_, i) => ({ name: `f${i}`, value: "v".repeat(2000) })),
  });
  assert.ok(embed.embeds[0].title.length <= 256);
  assert.ok(embed.embeds[0].description.length <= 4096);
  assert.ok(embed.embeds[0].fields.length <= 10);
  for (const f of embed.embeds[0].fields) assert.ok(f.value.length <= 1024);
});

test("health reports which state the webhook is in", async () => {
  const ok = await run("https://vibresia.com/api/health", {
    env: makeEnv({ NOTIFY_TOKEN: "s3cret" }),
  });
  assert.deepEqual(await ok.response.json(), {
    ok: true,
    notify: "accepting app reports",
    discord: "configured (gallery announcements and app reports; downloads are silent)",
  });

  const noToken = await run("https://vibresia.com/api/health");
  assert.match((await noToken.response.json()).notify, /NOTIFY_TOKEN/);

  const missing = await run("https://vibresia.com/api/health", {
    env: makeEnv({ DISCORD_WEBHOOK_URL: "" }),
  });
  assert.match((await missing.response.json()).discord, /wrangler secret put/);
});

test("the payload is truncated to what Discord accepts", () => {
  const embed = buildDownloadEmbed({
    source: "x".repeat(500),
    referer: "https://example.com/" + "y".repeat(5000),
    country: "GB",
    city: "Alton",
    agent: "z".repeat(5000),
    firstSeen: false,
  });
  for (const field of embed.embeds[0].fields) {
    assert.ok(field.value.length <= 1024, `${field.name} is ${field.value.length} chars`);
  }
});