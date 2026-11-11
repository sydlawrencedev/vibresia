// Tests for the shared-vibescape part of the Worker.
//
// The D1 binding is faked with a tiny in-memory table, because the point of
// these tests is the rules — who may create a share, what may be in it, and
// what the served page says — not SQLite.

import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";

import worker, { buildSharePage, toBytes, resetRateLimiter } from "./index.js";

const SHARE_TOKEN = "share-token-for-tests";
const PAYLOAD = "TZDNbsMgEIRfZcUJYoqIU6dtqjxCT63USy8oIcESBosfK1GUd-8CVZWLBd_M7oy5EZWT8YHsyGfSs9GOcOLUpBF8XOF";

/** A D1 stand-in: just enough SQL for the queries the Worker makes. */
function makeShares() {
  const rows = new Map();
  const byKey = new Map();
  const byPayloadHash = new Map();
  return {
    rows,
    byKey,
    byPayloadHash,
    prepare(sql) {
      // `.all()` is called without bindings — the gallery's query has no
      // parameters — so it lives on the statement as well as on the bound
      // one.
      const all = async () => {
        if (sql.includes("WHERE is_public = 1")) {
          return {
            results: [...rows.values()].filter((row) => (row.is_public ? 1 : 0) === 1),
          };
        }
        return { results: [...rows.values()] };
      };
      const statement = {
        all,
        bind(...args) {
          return {
            all,
            async run() {
              if (sql.includes("INSERT INTO shares")) {
                const [id, payload, name, author, image, key, payloadHash, isPublic,
                       , editKeyHash] = args;
                if (rows.has(id)) throw new Error("UNIQUE constraint failed: shares.id");
                if (key && byKey.has(key)) {
                  throw new Error("UNIQUE constraint failed: shares.key");
                }
                rows.set(id, {
                  id, payload, name, author, image,
                  key: key || null,
                  payload_hash: payloadHash || null,
                  is_public: isPublic ? 1 : 0,
                  created_at: 1_700_000_000_000,
                  revision: 1,
                  edit_key: editKeyHash || null,
                  admin_edited: 0,
                });
                if (key) byKey.set(key, id);
                if (payloadHash) byPayloadHash.set(payloadHash, id);
                return { success: true };
              }
              if (sql.includes("UPDATE shares SET image")) {
                const [image, id] = args;
                const row = rows.get(id);
                if (row) row.image = image;
                return { success: true };
              }
              if (sql.includes("UPDATE shares SET is_public")) {
                const [isPublic, id] = args;
                const row = rows.get(id);
                if (row) row.is_public = isPublic;
                return { success: true };
              }
              if (sql.includes("UPDATE shares SET edit_key")) {
                const [editKeyHash, id] = args;
                const row = rows.get(id);
                if (!row) return { success: true, meta: { changes: 0 } };
                if (row.edit_key) return { success: true, meta: { changes: 0 } };
                row.edit_key = editKeyHash;
                return { success: true, meta: { changes: 1 } };
              }
              if (sql.includes("UPDATE shares SET payload = ?")) {
                const [payload, name, author, payloadHash, image, id] = args;
                const row = rows.get(id);
                if (row) {
                  row.payload = payload;
                  row.name = name;
                  row.author = author;
                  row.payload_hash = payloadHash;
                  row.revision = (row.revision ?? 1) + 1;
                  if (image) row.image = image;
                }
                return { success: true };
              }
              if (sql.includes("UPDATE shares SET name = ?")) {
                const [name, author, payload, revision, id] = args;
                const row = rows.get(id);
                if (row) {
                  row.name = name;
                  row.author = author;
                  row.payload = payload;
                  row.revision = revision;
                  row.admin_edited = 1;
                }
                return { success: true };
              }
              if (sql.includes("DELETE FROM shares")) {
                const id = args[0];
                const existed = rows.delete(id);
                for (const [key, value] of byKey) if (value === id) byKey.delete(key);
                for (const [key, value] of byPayloadHash) if (value === id) byPayloadHash.delete(key);
                return { success: true, meta: { changes: existed ? 1 : 0 } };
              }
              return { success: true };
            },
            async first() {
              if (sql.includes("WHERE key = ?")) {
                const id = byKey.get(args[0]);
                if (!id) return null;
                const row = rows.get(id);
                return { ...row, image: row.image ? Array.from(row.image) : null };
              }
              if (sql.includes("SELECT id, image FROM shares WHERE key = ?")) {
                for (const row of rows.values()) {
                  if (row.key === args[0]) {
                    return { ...row, image: row.image ? Array.from(row.image) : null };
                  }
                }
                return null;
              }
              if (sql.includes("SELECT edit_key FROM shares WHERE id = ?")) {
                const row = rows.get(args[0]);
                return row ? { edit_key: row.edit_key || null } : null;
              }
              if (sql.includes("SELECT is_public FROM shares WHERE id = ?")) {
                const row = rows.get(args[0]);
                return row ? { is_public: row.is_public } : null;
              }
              if (sql.includes("WHERE payload_hash = ?")) {
                const id = byPayloadHash.get(args[0]);
                if (!id) return null;
                const row = rows.get(id);
                return { ...row, image: row.image ? Array.from(row.image) : null };
              }
              if (sql.includes("WHERE payload = ?")) {
                for (const row of rows.values()) {
                  if (row.payload === args[0]) {
                    return { ...row, image: row.image ? Array.from(row.image) : null };
                  }
                }
                return null;
              }
              if (sql.includes("FROM shares WHERE id = ?")) {
                const row = rows.get(args[0]);
                if (!row) return null;
                // The revision and the capability come out of the SELECT.
                // D1 hands BLOBs back as a plain array of bytes, which is what
                // the code has to cope with.
                // The picture flag comes out of the SELECT, so the fake
                // works it out rather than reading it off the row.
                return {
                  ...row,
                  image: row.image ? Array.from(row.image) : null,
                  has_image: row.image ? 1 : 0,
                };
              }
              return null;
            },
          };
        },
      };
      return statement;
    },
  };
}

function makeEnv(overrides = {}) {
  const shares = makeShares();
  return {
    env: {
      ASSETS: {
        fetch: async (request) => {
          const path = new URL(request.url).pathname;
          if (path === "/share/manifest.json") {
            return new Response(JSON.stringify({
              generated: "test",
              base: "https://vibresia.com",
              built_ins: [
                { slug: "ribbons", title: "Ribbons", date: "2026-10-19" },
                { slug: "band", title: "The Band", date: "2026-10-18" },
              ],
            }), { status: 200 });
          }
          return new Response(
            `<!doctype html><html><head><title>A vibescape was shared with you — Vibresia</title>
<meta name="description" content="Someone shared a Vibresia vibescape with you.">
<link rel="canonical" href="https://vibresia.com/share">
<meta property="og:url" content="https://vibresia.com/share">
<meta property="og:title" content="A vibescape was shared with you — Vibresia">
<meta property="og:description" content="Someone shared a Vibresia vibescape with you.">
<meta property="og:image" content="https://vibresia.com/media/share.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:title" content="A vibescape was shared with you — Vibresia">
<meta name="twitter:description" content="Someone shared a Vibresia vibescape with you.">
<meta name="twitter:image" content="https://vibresia.com/media/share.jpg">
<!-- gallery:builtin-cards -->
<!-- gallery:cards -->
</head><body>hi</body></html>`,
            { status: 200 }
          );
        },
      },
      SHARE_TOKEN,
      ADMIN_TOKEN: "admin-token-for-tests",
      SHARES: shares,
      ...overrides,
    },
    shares,
  };
}

async function run(url, { env, headers = {}, method = "GET", body } = {}) {
  const request = new Request(url, { method, headers, body });
  const ctx = { waitUntil: () => {} };
  return worker.fetch(request, env, ctx);
}

function shareRequest(body, token = SHARE_TOKEN) {
  return {
    method: "POST",
    headers: { "x-av-token": token, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

beforeEach(() => {
  resetRateLimiter();
});

// --- creating a share ------------------------------------------------------

test("a share needs the token", async () => {
  const { env } = makeEnv();
  const response = await run("https://vibresia.com/api/share", {
    env,
    ...shareRequest({ payload: PAYLOAD, name: "A" }, "wrong-token"),
  });
  assert.equal(response.status, 401);
});

test("a share comes back with a short URL on this domain", async () => {
  const { env } = makeEnv();
  const response = await run("https://vibresia.com/api/share", {
    env,
    ...shareRequest({ payload: PAYLOAD, name: "My World", author: "Stephen" }),
  });
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.ok, true);
  assert.match(body.url, /^https:\/\/vibresia\.com\/s\/[a-z2-9]{6}$/);
  assert.equal(body.imageUrl, null);
});

test("making a share does not read every row in the table", async () => {
  // A share used to be looked up by its payload when the hash lookup found
  // nothing — which is every genuinely new share. The payload cannot be
  // indexed, so that query reads every row in the table, and D1 charges for
  // the rows it reads. At a few thousand shares a day that spends the whole
  // day's read quota.
  //
  // The payload lookup is only worth doing when the database has not been
  // migrated yet and the rows have no hash to be found by.
  const { env, shares } = makeEnv();
  const queries = [];
  const realPrepare = shares.prepare.bind(shares);
  shares.prepare = (sql) => {
    queries.push(sql);
    return realPrepare(sql);
  };

  resetRateLimiter();
  const response = await run("https://vibresia.com/api/share", {
    env,
    ...shareRequest({ payload: PAYLOAD, name: "Scanned", author: "Stephen", key: "scanme1" }),
  });
  assert.equal(response.status, 200);

  const scanned = queries.filter((sql) => sql.includes("WHERE payload = ?"));
  assert.deepEqual(scanned, [], "a new share read the whole table to look for its payload");
});

test("a share is still found by its payload when the hash column is not there yet", async () => {
  // A database that has not been migrated has no hash to look a share up by,
  // so the payload itself is the only way to find the row. This is the case
  // the slow query is for, and it has to keep working.
  const { env, shares } = makeEnv();
  shares.rows.set("legac3", {
    id: "legac3", payload: PAYLOAD, name: "Old World", author: "Stephen",
    image: null, key: null, payload_hash: null,
    is_public: 0, created_at: 1_700_000_000_000, revision: 1,
    edit_key: null, admin_edited: 0,
  });

  const realPrepare = shares.prepare.bind(shares);
  shares.prepare = (sql) => {
    if (sql.includes("WHERE payload_hash = ?")) {
      return {
        bind: () => ({
          async first() { throw new Error("D1_ERROR: no such column: payload_hash"); },
        }),
      };
    }
    return realPrepare(sql);
  };

  resetRateLimiter();
  const response = await run("https://vibresia.com/api/share", {
    env,
    ...shareRequest({ payload: PAYLOAD, name: "Old World", author: "Stephen" }),
  });
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.id, "legac3", "it made a second share instead of finding the first");
  assert.equal(body.existing, true);
});

test("a payload that is not a payload is refused", async () => {
  const { env } = makeEnv();
  // The last one is longer than the site will hold. It used to be nine
  // thousand characters, because the payload used to travel in the query
  // string of the link; the short link stores it instead, so there is room
  // for twice that.
  for (const payload of ["", "not base64!", "x".repeat(20000), "../../etc/passwd"]) {
    // The rate limiter runs before the validation, so a burst of rubbish
    // still counts against the budget — that is the point of it. Reset
    // between cases so this is testing the validation and not the limiter.
    resetRateLimiter();
    const response = await run("https://vibresia.com/api/share", {
      env,
      ...shareRequest({ payload, name: "A" }),
    });
    assert.equal(response.status, 400, `should refuse ${JSON.stringify(payload.slice(0, 20))}`);
  }
});

test("a name or an author that is too long is refused", async () => {
  const { env } = makeEnv();
  const long = "x".repeat(200);
  const response = await run("https://vibresia.com/api/share", {
    env,
    ...shareRequest({ payload: PAYLOAD, name: long }),
  });
  assert.equal(response.status, 400);
});

test("an image over the cap is refused rather than stored", async () => {
  const { env } = makeEnv();
  const big = Buffer.alloc(500 * 1024).toString("base64");
  const response = await run("https://vibresia.com/api/share", {
    env,
    ...shareRequest({ payload: PAYLOAD, name: "A", image: big }),
  });
  assert.equal(response.status, 400);
});

test("a share with a picture gets an image URL, and the picture comes back", async () => {
  const { env } = makeEnv();
  const jpeg = Uint8Array.from([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3]);
  const response = await run("https://vibresia.com/api/share", {
    env,
    ...shareRequest({ payload: PAYLOAD, name: "A", image: Buffer.from(jpeg).toString("base64") }),
  });
  const body = await response.json();
  assert.match(body.imageUrl, /^https:\/\/vibresia\.com\/og\/[a-z2-9]{6}\.jpg$/);

  const image = await run(body.imageUrl, { env });
  assert.equal(image.status, 200);
  assert.equal(image.headers.get("content-type"), "image/jpeg");
  assert.equal(image.headers.get("cache-control"), "public, max-age=31536000, immutable");
  const bytes = new Uint8Array(await image.arrayBuffer());
  assert.deepEqual([...bytes], [...jpeg]);
});

// --- the same vibescape, the same link ---------------------------------------

test("the same vibescape shared twice gets the same link", async () => {
  const { env } = makeEnv();
  const first = await run("https://vibresia.com/api/share", {
    env,
    ...shareRequest({ payload: PAYLOAD, name: "My World", author: "Stephen", key: "abc123" }),
  });
  const firstBody = await first.json();
  assert.equal(firstBody.existing, false);

  // One per second, so a person sharing twice in a row is fine but two
  // requests in the same test are not.
  resetRateLimiter();
  const second = await run("https://vibresia.com/api/share", {
    env,
    ...shareRequest({ payload: PAYLOAD, name: "My World", author: "Stephen", key: "abc123" }),
  });
  const secondBody = await second.json();
  assert.equal(secondBody.existing, true);
  assert.equal(secondBody.id, firstBody.id);
  assert.equal(secondBody.url, firstBody.url);
});

test("an existing share comes back with the revision it is at", async () => {
  const { env } = makeEnv();
  resetRateLimiter();
  const first = await run("https://vibresia.com/api/share", {
    env,
    ...shareRequest({ payload: PAYLOAD, name: "My World", author: "Stephen", key: "abc123",
                      editKey: "the-capability" }),
  });
  const { id } = await first.json();

  // A new version is published, so the share is at revision 2.
  resetRateLimiter();
  const updated = await run(`https://vibresia.com/api/share/${id}`, {
    env,
    method: "POST",
    headers: { "x-av-token": SHARE_TOKEN, "Content-Type": "application/json" },
    body: JSON.stringify({ payload: "QU5PVEhFUi1wYXlsb2Fk", name: "My World", author: "Stephen",
                           editKey: "the-capability" }),
  });
  assert.equal((await updated.json()).revision, 2);

  // Sharing the same vibescape again finds the share that is already there.
  // It has to say which revision that is: the app records what it is told,
  // and if the answer is missing it records the first one and then thinks
  // it is behind forever.
  resetRateLimiter();
  const second = await run("https://vibresia.com/api/share", {
    env,
    ...shareRequest({ payload: PAYLOAD, name: "My World", author: "Stephen", key: "abc123",
                      editKey: "the-capability" }),
  });
  const secondBody = await second.json();
  assert.equal(secondBody.existing, true);
  assert.equal(secondBody.revision, 2);
});

test("the same vibescape without a key still gets the same link", async () => {
  const { env } = makeEnv();
  const first = await run("https://vibresia.com/api/share", {
    env,
    ...shareRequest({ payload: PAYLOAD, name: "My World" }),
  });
  const firstBody = await first.json();
  // One per second, so a person sharing twice in a row is fine but two
  // requests in the same test are not.
  resetRateLimiter();
  const second = await run("https://vibresia.com/api/share", {
    env,
    ...shareRequest({ payload: PAYLOAD, name: "My World" }),
  });
  const secondBody = await second.json();
  assert.equal(secondBody.id, firstBody.id);
  assert.equal(secondBody.url, firstBody.url);
});

test("a different vibescape gets a different link", async () => {
  const { env } = makeEnv();
  const first = await run("https://vibresia.com/api/share", {
    env,
    ...shareRequest({ payload: PAYLOAD, name: "One", key: "key-one" }),
  });
  // One per second, so a person sharing twice in a row is fine but two
  // requests in the same test are not.
  resetRateLimiter();
  const second = await run("https://vibresia.com/api/share", {
    env,
    ...shareRequest({ payload: "Zm91ci1vdGhlci1wYXlsb2Fk", name: "Two", key: "key-two" }),
  });
  const firstBody = await first.json();
  const secondBody = await second.json();
  assert.notEqual(secondBody.id, firstBody.id);
});

test("a share made without a picture gets one when it is shared again with one", async () => {
  const { env } = makeEnv();
  const first = await run("https://vibresia.com/api/share", {
    env,
    ...shareRequest({ payload: PAYLOAD, name: "A", key: "abc123" }),
  });
  const firstBody = await first.json();
  assert.equal(firstBody.imageUrl, null);

  const jpeg = Uint8Array.from([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3]);
  // One per second, so a person sharing twice in a row is fine but two
  // requests in the same test are not.
  resetRateLimiter();
  const second = await run("https://vibresia.com/api/share", {
    env,
    ...shareRequest({
      payload: PAYLOAD, name: "A", key: "abc123",
      image: Buffer.from(jpeg).toString("base64"),
    }),
  });
  const secondBody = await second.json();
  assert.equal(secondBody.id, firstBody.id);
  assert.match(secondBody.imageUrl, /\/og\/[a-z2-9]{6}\.jpg$/);

  const image = await run(secondBody.imageUrl, { env });
  assert.equal(image.status, 200);
});

test("a key that isn't a key is refused", async () => {
  const { env } = makeEnv();
  for (const key of ["", "x".repeat(200), "not a key!", "../../etc/passwd"]) {
    resetRateLimiter();
    const response = await run("https://vibresia.com/api/share", {
      env,
      ...shareRequest({ payload: PAYLOAD, name: "A", key }),
    });
    // An empty key is simply no key; anything else has to be refused.
    if (key === "") {
      assert.equal(response.status, 200);
    } else {
      assert.equal(response.status, 400, `should refuse ${JSON.stringify(key)}`);
    }
  }
});

test("creating shares in a loop is rate limited", async () => {
  const { env } = makeEnv();
  let created = 0;
  for (let i = 0; i < 5; i += 1) {
    const response = await run("https://vibresia.com/api/share", {
      env,
      ...shareRequest({ payload: PAYLOAD, name: "A" }),
    });
    if (response.status === 200) created += 1;
    else assert.equal(response.status, 429);
  }
  assert.ok(created >= 1 && created <= 2, `expected a few to get through, got ${created}`);
});

// --- serving a share -------------------------------------------------------

test("the share page has the payload inlined and the URL stays short", async () => {
  const { env } = makeEnv();
  const created = await run("https://vibresia.com/api/share", {
    env,
    ...shareRequest({ payload: PAYLOAD, name: "My World", author: "Stephen" }),
  });
  const { id } = await created.json();

  const response = await run(`https://vibresia.com/s/${id}`, { env });
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.ok(html.includes(`window.__VIBRESIA_SHARE__ = {"d":"${PAYLOAD}","id":"${id}"}`), "payload not inlined");
  // The id goes with it, so the page can put it in the deep link and the app
  // can hand the same link back when the vibescape is shared on.
  assert.ok(html.includes(`"id":"${id}"`), "the share's id was not inlined");
  assert.ok(html.includes(`<meta property="og:url" content="https://vibresia.com/s/${id}">`));
});

test("the metadata names the vibescape and points at its own picture", async () => {
  const { env } = makeEnv();
  const created = await run("https://vibresia.com/api/share", {
    env,
    ...shareRequest({ payload: PAYLOAD, name: "My World", author: "Stephen",
                      image: Buffer.from([0xff, 0xd8, 0xff]).toString("base64") }),
  });
  const { id } = await created.json();
  const html = await (await run(`https://vibresia.com/s/${id}`, { env })).text();

  assert.ok(html.includes("<title>My World — Vibresia</title>"));
  assert.ok(html.includes('<meta property="og:title" content="My World — Vibresia">'));
  assert.ok(html.includes(`<meta property="og:image" content="https://vibresia.com/og/${id}.jpg">`));
  assert.ok(html.includes("by Stephen"));
});

test("a share with no picture of its own gets the general one, not a broken link", async () => {
  const { env } = makeEnv();
  resetRateLimiter();
  const created = await run("https://vibresia.com/api/share", {
    env,
    ...shareRequest({ payload: PAYLOAD, name: "No Picture", author: "Nobody" }),
  });
  const { id } = await created.json();
  const html = await (await run(`https://vibresia.com/s/${id}`, { env })).text();
  // An agent's share has no picture, because the server cannot draw one.
  // Pointing the preview at a picture that is not there would be worse than
  // the general one.
  assert.ok(html.includes('<meta property="og:image" content="https://vibresia.com/media/share.jpg">'));
  assert.ok(!html.includes(`content="https://vibresia.com/og/${id}.jpg"`));
});

test("a name with markup in it is escaped, not pasted in", async () => {
  const { env } = makeEnv();
  const created = await run("https://vibresia.com/api/share", {
    env,
    ...shareRequest({ payload: PAYLOAD, name: '"><script>alert(1)</script>', author: "x" }),
  });
  const { id } = await created.json();
  const html = await (await run(`https://vibresia.com/s/${id}`, { env })).text();

  assert.ok(!html.includes("<script>alert(1)</script>"), "markup was not escaped");
  assert.ok(html.includes("&lt;script&gt;"));
});

test("a name with a dollar in it does not paste the page into itself", async () => {
  // `String.replace` treats `$&` and `$'` in a replacement as patterns, and
  // the replacement here is a name somebody typed. Without a function
  // replacement, "evil$'x" pasted the page's own title into the middle of
  // the new one.
  const { env } = makeEnv();
  for (const name of ["evil$&x", "evil$`x", "evil$'x", "$$", "a$1b"]) {
    resetRateLimiter();
    const created = await run("https://vibresia.com/api/share", {
      env,
      ...shareRequest({ payload: PAYLOAD, name, author: "x" }),
    });
    const { id } = await created.json();
    const html = await (await run(`https://vibresia.com/s/${id}`, { env })).text();

    const title = html.match(/<title>([^<]*)<\/title>/);
    assert.ok(title, `no title for ${JSON.stringify(name)}`);
    assert.ok(!title[1].includes("<"), `the title was mangled: ${title[1]}`);
    assert.equal((html.match(/<title>/g) || []).length, 1, "the title was duplicated");
  }
});

test("a share that does not exist is a 404, and so is a nonsense id", async () => {
  const { env } = makeEnv();
  assert.equal((await run("https://vibresia.com/s/aaaaaa", { env })).status, 404);
  assert.equal((await run("https://vibresia.com/s/NOT-A-VALID-ID", { env })).status, 404);
  assert.equal((await run("https://vibresia.com/og/aaaaaa.jpg", { env })).status, 404);
});

test("a share with no picture has no picture, rather than a broken one", async () => {
  const { env } = makeEnv();
  const created = await run("https://vibresia.com/api/share", {
    env,
    ...shareRequest({ payload: PAYLOAD, name: "A" }),
  });
  const { id } = await created.json();
  assert.equal((await run(`https://vibresia.com/og/${id}.jpg`, { env })).status, 404);
});

// --- the gallery ------------------------------------------------------------

/** The shares people made, not the built-ins — which are always in the list. */
function sharedIn(gallery) {
  return gallery.vibescapes.filter((v) => !v.builtin);
}

test("the gallery lists the shares that were ticked into it", async () => {
  const { env } = makeEnv();
  // A public share and a private one.
  resetRateLimiter();
  await run("https://vibresia.com/api/share", {
    env,
    ...shareRequest({ payload: PAYLOAD, name: "In The Gallery", author: "Stephen", key: "gallery1", public: true }),
  });
  resetRateLimiter();
  await run("https://vibresia.com/api/share", {
    env,
    ...shareRequest({ payload: "Zm91ci1vdGhlci1wYXlsb2Fk", name: "Kept Out", author: "Nobody", key: "hidden1", public: false }),
  });

  const api = await run("https://vibresia.com/api/gallery", { env });
  const body = await api.json();
  assert.equal(body.ok, true);
  const shared = sharedIn(body);
  assert.equal(shared.length, 1);
  assert.equal(shared[0].name, "In The Gallery");
  assert.equal(shared[0].author, "Stephen");
  // The built-ins are in the gallery too.
  assert.equal(body.vibescapes.filter((v) => v.builtin).length, 2);
});

test("a share is only in the gallery if it was ticked in", async () => {
  const { env } = makeEnv();
  resetRateLimiter();
  await run("https://vibresia.com/api/share", {
    env,
    ...shareRequest({ payload: PAYLOAD, name: "Quiet", author: "Nobody", key: "quiet1" }),
  });
  const body = await (await run("https://vibresia.com/api/gallery", { env })).json();
  assert.equal(sharedIn(body).length, 0);
});

test("sharing it again with the tickbox on puts it in the gallery", async () => {
  const { env } = makeEnv();
  resetRateLimiter();
  await run("https://vibresia.com/api/share", {
    env,
    ...shareRequest({ payload: PAYLOAD, name: "Later", author: "Stephen", key: "later1",
                      editKey: "the-capability" }),
  });
  let body = await (await run("https://vibresia.com/api/gallery", { env })).json();
  assert.equal(sharedIn(body).length, 0);

  // The maker shares it again with the tickbox on. The capability is what
  // says this is their share, so the flag follows them in.
  resetRateLimiter();
  await run("https://vibresia.com/api/share", {
    env,
    ...shareRequest({ payload: PAYLOAD, name: "Later", author: "Stephen", key: "later1",
                      public: true, editKey: "the-capability" }),
  });
  body = await (await run("https://vibresia.com/api/gallery", { env })).json();
  assert.equal(sharedIn(body).length, 1);
  assert.equal(sharedIn(body)[0].name, "Later");
});

test("the gallery page is a page, with the shares on it", async () => {
  const { env } = makeEnv();
  resetRateLimiter();
  await run("https://vibresia.com/api/share", {
    env,
    ...shareRequest({ payload: PAYLOAD, name: "On The Page", author: "Stephen", key: "page1", public: true }),
  });
  const response = await run("https://vibresia.com/vibescapes", { env });
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.ok(html.includes("On The Page"), "the share was not on the page");
  assert.ok(html.includes("/s/"), "the share was not linked");
});

test("a gallery card does not put one link inside another", async () => {
  const { env } = makeEnv();
  resetRateLimiter();
  await run("https://vibresia.com/api/share", {
    env,
    ...shareRequest({ payload: PAYLOAD, name: "Nested", author: "Stephen", key: "nest1", public: true }),
  });
  const response = await run("https://vibresia.com/vibescapes", { env });
  const html = await response.text();

  // A link inside a link is not valid HTML, and every browser resolves it
  // the same way: the outer link is closed before the inner one, so the
  // inner link's contents leave the card and become a sibling of it. The
  // author's name then falls out of the grid it was in.
  //
  // So the card holds two links — the vibescape and the author — and they
  // must be side by side, not one inside the other.
  const card = html.match(/<div class="card"[\s\S]*?<\/div>/);
  assert.ok(card, "the card was not on the page");
  const cardHtml = card[0];
  assert.ok(!/<a class="card"/i.test(cardHtml), "the card is still a link itself");
  // Every link in the card is closed before the next one opens, which is
  // what "siblings, not nested" looks like in the markup.
  const opens = (cardHtml.match(/<a\b/gi) || []).length;
  const closes = (cardHtml.match(/<\/a>/gi) || []).length;
  assert.equal(opens, closes, `the card has ${opens} links and ${closes} closes`);
  // And the author's link comes after the vibescape's is closed.
  const vibescapeEnd = cardHtml.indexOf("</a>");
  const authorAt = cardHtml.indexOf("/vibescapes?by=");
  assert.ok(authorAt > vibescapeEnd,
    "the author's link is inside the vibescape's link");
});

test("a gallery card is tracked on the link, where the click handler looks", async () => {
  const { env } = makeEnv();
  resetRateLimiter();
  await run("https://vibresia.com/api/share", {
    env,
    ...shareRequest({ payload: PAYLOAD, name: "Tracked", author: "Ada", key: "track1", public: true }),
  });
  const response = await run("https://vibresia.com/vibescapes", { env });
  const html = await response.text();

  // The site's click handler finds the nearest ancestor matching
  // "[data-track], a[href]". The card's link is nearer than the card, so an
  // attribute on the card alone is never found and the gallery's
  // click-through count quietly goes to zero.
  const card = html.match(/<div class="card"[\s\S]*?<\/div>/);
  assert.ok(card, "the card was not on the page");
  const link = card[0].match(/<a class="card-link"[^>]*>/);
  assert.ok(link, "the card's link was not on the page");
  assert.match(link[0], /data-track="gallery_card_clicked"/,
    "the card's link carries no tracking attribute");
  assert.match(link[0], /data-target="/,
    "the card's link carries no target");

  // And the card itself must not be the one carrying it, because that is
  // the mistake this test exists to catch.
  assert.doesNotMatch(card[0].match(/<div class="card"[^>]*>/)[0], /data-track=/,
    "the tracking attribute is on the card, where the click handler cannot find it");
});

// --- the admin --------------------------------------------------------------

test("the admin needs the admin token", async () => {
  const { env } = makeEnv();
  for (const headers of [{}, { "x-av-admin-token": "wrong" }]) {
    const response = await run("https://vibresia.com/api/admin/shares", { env, headers });
    assert.equal(response.status, 401);
  }
  const ok = await run("https://vibresia.com/api/admin/shares", {
    env, headers: { "x-av-admin-token": "admin-token-for-tests" },
  });
  assert.equal(ok.status, 200);
});

test("the admin sees the shares that are hidden as well as the ones that are not", async () => {
  const { env } = makeEnv();
  resetRateLimiter();
  await run("https://vibresia.com/api/share", {
    env,
    ...shareRequest({ payload: PAYLOAD, name: "Listed", author: "Stephen", key: "listed1", public: true }),
  });
  resetRateLimiter();
  await run("https://vibresia.com/api/share", {
    env,
    ...shareRequest({ payload: "aGlkZGVu", name: "Hidden", author: "Nobody", key: "hidden2" }),
  });

  const body = await (await run("https://vibresia.com/api/admin/shares", {
    env, headers: { "x-av-admin-token": "admin-token-for-tests" },
  })).json();
  assert.equal(body.ok, true);
  const names = body.shares.map((s) => s.name).sort();
  assert.deepEqual(names, ["Hidden", "Listed"]);
  assert.equal(body.shares.find((s) => s.name === "Hidden").inGallery, false);
  assert.equal(body.shares.find((s) => s.name === "Listed").inGallery, true);
});

test("hiding a share takes it out of the gallery and leaves the link working", async () => {
  const { env } = makeEnv();
  resetRateLimiter();
  const created = await run("https://vibresia.com/api/share", {
    env,
    ...shareRequest({ payload: PAYLOAD, name: "Hide Me", author: "Stephen", key: "hide1", public: true }),
  });
  const { id } = await created.json();

  const hidden = await run(`https://vibresia.com/api/admin/shares/${id}`, {
    env,
    method: "POST",
    headers: { "x-av-admin-token": "admin-token-for-tests", "Content-Type": "application/json" },
    body: JSON.stringify({ action: "hide" }),
  });
  assert.equal(hidden.status, 200);

  const gallery = await (await run("https://vibresia.com/api/gallery", { env })).json();
  assert.equal(sharedIn(gallery).length, 0);

  // The link still works: hiding is not deleting.
  const page = await run(`https://vibresia.com/s/${id}`, { env });
  assert.equal(page.status, 200);
});

test("showing a share puts it back in the gallery", async () => {
  const { env } = makeEnv();
  resetRateLimiter();
  const created = await run("https://vibresia.com/api/share", {
    env,
    ...shareRequest({ payload: PAYLOAD, name: "Show Me", author: "Stephen", key: "show1" }),
  });
  const { id } = await created.json();

  await run(`https://vibresia.com/api/admin/shares/${id}`, {
    env,
    method: "POST",
    headers: { "x-av-admin-token": "admin-token-for-tests", "Content-Type": "application/json" },
    body: JSON.stringify({ action: "show" }),
  });
  const gallery = await (await run("https://vibresia.com/api/gallery", { env })).json();
  assert.equal(sharedIn(gallery).length, 1);
});

test("deleting a share takes the link with it", async () => {
  const { env } = makeEnv();
  resetRateLimiter();
  const created = await run("https://vibresia.com/api/share", {
    env,
    ...shareRequest({ payload: PAYLOAD, name: "Delete Me", author: "Stephen", key: "del1", public: true }),
  });
  const { id } = await created.json();

  const deleted = await run(`https://vibresia.com/api/admin/shares/${id}`, {
    env,
    method: "POST",
    headers: { "x-av-admin-token": "admin-token-for-tests", "Content-Type": "application/json" },
    body: JSON.stringify({ action: "delete" }),
  });
  assert.equal(deleted.status, 200);
  assert.equal((await run(`https://vibresia.com/s/${id}`, { env })).status, 404);
  const gallery = await (await run("https://vibresia.com/api/gallery", { env })).json();
  assert.equal(sharedIn(gallery).length, 0);
});

test("the admin cannot delete a share that isn't there", async () => {
  const { env } = makeEnv();
  const response = await run("https://vibresia.com/api/admin/shares/aaaaaa", {
    env,
    method: "POST",
    headers: { "x-av-admin-token": "admin-token-for-tests", "Content-Type": "application/json" },
    body: JSON.stringify({ action: "delete" }),
  });
  assert.equal(response.status, 404);
});

// --- the gallery ------------------------------------------------------------

test("the gallery is one list, newest first", async () => {
  const { env } = makeEnv();
  resetRateLimiter();
  await run("https://vibresia.com/api/share", {
    env,
    ...shareRequest({ payload: PAYLOAD, name: "Shared", author: "Stephen", key: "shared1", public: true }),
  });
  const body = await (await run("https://vibresia.com/api/gallery", { env })).json();

  // The built-ins are in it, with the shares people made.
  assert.ok(body.vibescapes.some((v) => v.builtin && v.name === "Ribbons"));
  assert.ok(body.vibescapes.some((v) => !v.builtin && v.name === "Shared"));

  // Newest first: a share made now is above a built-in from the 18th.
  const dates = body.vibescapes.map((v) => v.sharedAt);
  const sorted = [...dates].sort((a, b) => b - a);
  assert.deepEqual(dates, sorted);

  // The built-ins carry the day they appeared, and the clean still rather
  // than the framed share graphic.
  const ribbons = body.vibescapes.find((v) => v.id === "ribbons");
  assert.equal(ribbons.imageUrl, "https://vibresia.com/media/modes/ribbons.jpg");
  assert.equal(ribbons.url, "https://vibresia.com/share/ribbons");
  assert.ok(ribbons.sharedAt > 0);
});

// --- the pure parts --------------------------------------------------------

test("a share with no name still gets a usable title and the payload", () => {
  const html = "<html><head><title>Same</title></head><body></body></html>";
  const out = buildSharePage(html, {
    id: "aaaaaa",
    payload: PAYLOAD,
    name: "",
    author: "",
    url: "https://vibresia.com/s/aaaaaa",
  });
  assert.ok(out.includes("<title>A vibescape was shared with you — Vibresia</title>"));
  assert.ok(out.includes(`window.__VIBRESIA_SHARE__ = {"d":"${PAYLOAD}","id":"aaaaaa"}`));
});

test("a payload cannot close the script tag it is in", () => {
  const html = "<html><head></head><body></body></html>";
  const out = buildSharePage(html, {
    id: "aaaaaa",
    payload: "abc</script><script>alert(1)</script>",
    name: "",
    author: "",
    url: "https://vibresia.com/s/aaaaaa",
  });
  assert.ok(!out.includes("</script><script>alert(1)"), "the script tag was closed early");
  assert.ok(out.includes("\\u003c/script>"));
});

test("bytes come out of D1 in whichever shape it hands them over", () => {
  assert.deepEqual([...toBytes(new Uint8Array([1, 2, 3]))], [1, 2, 3]);
  assert.deepEqual([...toBytes(new Uint8Array([1, 2, 3]).buffer)], [1, 2, 3]);
  assert.deepEqual([...toBytes([1, 2, 3])], [1, 2, 3]);
  assert.equal(toBytes(null), null);
  assert.equal(toBytes(undefined), null);
});

// --- the gallery tickbox, and replacing a share -----------------------------

test("the gallery tickbox reaches the site", async () => {
  const { env } = makeEnv();
  resetRateLimiter();
  const created = await run("https://vibresia.com/api/share", {
    env,
    ...shareRequest({ payload: PAYLOAD, name: "Ticked", author: "Stephen", key: "ticked1",
                      public: true, editKey: "the-capability" }),
  });
  const { id } = await created.json();

  // Unticking it takes the share out of the gallery, which it never used to
  // do: the tickbox was only read when a share was made. The capability is
  // what says this is the maker's share.
  const patched = await run(`https://vibresia.com/api/share/${id}`, {
    env,
    method: "PATCH",
    headers: { "x-av-token": SHARE_TOKEN, "Content-Type": "application/json" },
    body: JSON.stringify({ public: false, editKey: "the-capability" }),
  });
  assert.equal(patched.status, 200);

  const gallery = await (await run("https://vibresia.com/api/gallery", { env })).json();
  assert.equal(sharedIn(gallery).length, 0, "the share is still in the gallery");

  // And the share says so, so the app's tickbox can show what is true.
  const details = await (await run(`https://vibresia.com/api/share/${id}`, { env })).json();
  assert.equal(details.ok, true);
  assert.equal(details.public, false);
  assert.equal(details.name, "Ticked");
});

test("the share token alone cannot list somebody else's share", async () => {
  const { env } = makeEnv();
  resetRateLimiter();
  const created = await run("https://vibresia.com/api/share", {
    env,
    ...shareRequest({ payload: PAYLOAD, name: "Private", author: "Stephen", key: "private1",
                      public: false, editKey: "the-capability" }),
  });
  const { id } = await created.json();

  // The token ships in the app bundle, so it is not proof of anything about
  // this particular share.
  const patched = await run(`https://vibresia.com/api/share/${id}`, {
    env,
    method: "PATCH",
    headers: { "x-av-token": SHARE_TOKEN, "Content-Type": "application/json" },
    body: JSON.stringify({ public: true }),
  });
  assert.equal(patched.status, 403);

  const details = await (await run(`https://vibresia.com/api/share/${id}`, { env })).json();
  assert.equal(details.public, false, "the share was listed anyway");
});

test("the maker can still list their own share", async () => {
  const { env } = makeEnv();
  resetRateLimiter();
  const created = await run("https://vibresia.com/api/share", {
    env,
    ...shareRequest({ payload: PAYLOAD, name: "Mine", author: "Stephen", key: "mine1",
                      public: false, editKey: "the-capability" }),
  });
  const { id } = await created.json();

  const patched = await run(`https://vibresia.com/api/share/${id}`, {
    env,
    method: "PATCH",
    headers: { "x-av-token": SHARE_TOKEN, "Content-Type": "application/json" },
    body: JSON.stringify({ public: true, editKey: "the-capability" }),
  });
  assert.equal(patched.status, 200);
  const details = await (await run(`https://vibresia.com/api/share/${id}`, { env })).json();
  assert.equal(details.public, true);
});

test("sharing an existing vibescape cannot list somebody else's share", async () => {
  const { env } = makeEnv();
  resetRateLimiter();
  const created = await run("https://vibresia.com/api/share", {
    env,
    ...shareRequest({ payload: PAYLOAD, name: "Theirs", author: "Somebody", key: "theirs1",
                      public: false, editKey: "their-capability" }),
  });
  const { id } = await created.json();

  // Somebody else, with the app's token, shares the same vibescape with the
  // gallery ticked on. The share that is already there is not theirs, so the
  // tickbox must not follow them in.
  resetRateLimiter();
  const second = await run("https://vibresia.com/api/share", {
    env,
    ...shareRequest({ payload: PAYLOAD, name: "Theirs", author: "Somebody", key: "theirs1",
                      public: true }),
  });
  assert.equal(second.status, 200);
  const body = await second.json();
  assert.equal(body.existing, true);
  assert.equal(body.public, false, "the share was listed anyway");

  const details = await (await run(`https://vibresia.com/api/share/${id}`, { env })).json();
  assert.equal(details.public, false, "the share is in the gallery");
});

test("a share made before capabilities did cannot be claimed by a stranger", async () => {
    const { env, shares } = makeEnv();
    // A share from an older build of the app: it has a row and a link, but
    // no capability, because capabilities did not exist when it was made.
    shares.rows.set("egac2a", {
        id: "egac2a", payload: PAYLOAD, name: "Old World", author: "Stephen",
        image: null, key: "legacy1", payload_hash: null,
        is_public: 0, created_at: 1_700_000_000_000, revision: 1,
        edit_key: null, admin_edited: 0,
    });
    shares.byKey.set("legacy1", "egac2a");

    // Somebody who is not the maker, with the app's token — which is in the
    // bundle, so it is not proof of anything — and the content key that
    // finds the row. The content key is public: it is in the share link.
    // So is the share id. Neither says "I made this".
    resetRateLimiter();
    const second = await run("https://vibresia.com/api/share", {
        env,
        ...shareRequest({ payload: PAYLOAD, name: "Old World", author: "Stephen",
                          key: "legacy1", public: true, editKey: "a-strangers-key" }),
    });
    assert.equal(second.status, 200);
    const body = await second.json();
    assert.equal(body.existing, true, "it made a second share instead of finding the first");
    assert.equal(body.owns, false, "it was told it owned somebody else's share");
    assert.equal(body.public, false, "somebody else's share was listed");

    // And the share still has no capability, so the stranger cannot use the
    // key they just offered to change it.
    const row = shares.rows.get("egac2a");
    assert.equal(row.edit_key, null, "the stranger gave the share a capability");

    const patched = await run("https://vibresia.com/api/share/egac2a", {
        env,
        method: "PATCH",
        headers: { "x-av-token": SHARE_TOKEN, "Content-Type": "application/json" },
        body: JSON.stringify({ public: false, editKey: "a-strangers-key" }),
    });
    assert.equal(patched.status, 403, "the stranger can change the share");

    // Nor can they publish a new version of it.
    const updated = await run("https://vibresia.com/api/share/egac2a", {
        env,
        method: "POST",
        headers: { "x-av-token": SHARE_TOKEN, "Content-Type": "application/json" },
        body: JSON.stringify({ payload: "QU5PVEhFUi1wYXlsb2Fk", name: "Hijacked", author: "Stephen",
                               editKey: "a-strangers-key" }),
    });
    assert.equal(updated.status, 403, "the stranger can publish a new version");
    assert.equal(shares.rows.get("egac2a").payload, PAYLOAD, "the shader was replaced");
});

test("a gallery write that fails is not reported as a success", async () => {
    const { env, shares } = makeEnv();
    // A share that already exists, made by somebody with the capability.
    resetRateLimiter();
    const created = await run("https://vibresia.com/api/share", {
        env,
        ...shareRequest({ payload: PAYLOAD, name: "Broken", author: "Stephen", key: "broken1",
                          public: false, editKey: "the-capability" }),
    });
    const { id } = await created.json();

    // Now the database refuses the gallery write — the column is not there,
    // or the write is refused for any other reason. The share is still made,
    // but the answer must not say it is in the gallery when it is not.
    const realPrepare = shares.prepare.bind(shares);
    shares.prepare = (sql) => {
        if (sql.includes("UPDATE shares SET is_public")) {
            return {
                bind: () => ({
                    async run() { throw new Error("D1_ERROR: no such column: is_public"); },
                }),
            };
        }
        return realPrepare(sql);
    };

    resetRateLimiter();
    const second = await run("https://vibresia.com/api/share", {
        env,
        ...shareRequest({ payload: PAYLOAD, name: "Broken", author: "Stephen", key: "broken1",
                          public: true, editKey: "the-capability" }),
    });
    const body = await second.json();
    assert.equal(body.ok, true, "the share itself should still be made");
    assert.equal(body.public, false, "the share is not in the gallery, but it said it was");
});

test("the gallery tickbox needs the token", async () => {
  const { env } = makeEnv();
  const response = await run("https://vibresia.com/api/share/aaaaaa", {
    env,
    method: "PATCH",
    headers: { "x-av-token": "wrong", "Content-Type": "application/json" },
    body: JSON.stringify({ public: false }),
  });
  assert.equal(response.status, 401);
});

test("a share that does not exist is a 404", async () => {
  const { env } = makeEnv();
  const response = await run("https://vibresia.com/api/share/aaaaaa", { env });
  assert.equal(response.status, 404);
});

test("changing your name replaces the share rather than leaving it behind", async () => {
  const { env } = makeEnv();
  resetRateLimiter();
  const first = await run("https://vibresia.com/api/share", {
    env,
    ...shareRequest({ payload: PAYLOAD, name: "Before", author: "Stephen", key: "before1",
                      public: true, editKey: "the-capability" }),
  });
  const { id: oldId } = await first.json();

  // The name is part of the payload, so a new name is a different vibescape
  // and gets its own link — and says which share it replaces.
  resetRateLimiter();
  const second = await run("https://vibresia.com/api/share", {
    env,
    ...shareRequest({
      payload: "QU5PVEhFUi1wYXlsb2Fk", name: "After", author: "Stephen",
      key: "after1", public: true, replaces: oldId, editKey: "the-capability",
    }),
  });
  const { id: newId } = await second.json();
  assert.notEqual(newId, oldId);

  // The old share is gone, so the gallery does not fill up with every
  // version of the same vibescape.
  const gallery = await (await run("https://vibresia.com/api/gallery", { env })).json();
  assert.equal(sharedIn(gallery).length, 1);
  assert.equal(sharedIn(gallery)[0].name, "After");
  assert.equal((await run(`https://vibresia.com/api/share/${oldId}`, { env })).status, 404);
});

test("a share nobody owns cannot be replaced", async () => {
  const { env } = makeEnv();
  resetRateLimiter();
  const first = await run("https://vibresia.com/api/share", {
    env,
    ...shareRequest({ payload: PAYLOAD, name: "Before", author: "Stephen", key: "before1",
                      public: true, editKey: "the-capability" }),
  });
  const { id: oldId } = await first.json();

  // Somebody else, with the app's token, names the share to be replaced.
  // The token is in the bundle, so it is not proof of anything.
  resetRateLimiter();
  const second = await run("https://vibresia.com/api/share", {
    env,
    ...shareRequest({
      payload: "QU5PVEhFUi1wYXlsb2Fk", name: "After", author: "Stephen",
      key: "after1", public: true, replaces: oldId, editKey: "not-the-capability",
    }),
  });
  assert.equal(second.status, 200);

  // The old share is still there: it was not theirs to delete.
  assert.equal((await run(`https://vibresia.com/api/share/${oldId}`, { env })).status, 200);
});

test("the maker of a share can publish a new version of it", async () => {
  const { env } = makeEnv();
  resetRateLimiter();
  const first = await run("https://vibresia.com/api/share", {
    env,
    ...shareRequest({ payload: PAYLOAD, name: "Before", author: "Stephen", key: "before1",
                      public: true, editKey: "the-capability" }),
  });
  const { id } = await first.json();

  // A new version of the same share: the same link, a later revision.
  const updated = await run(`https://vibresia.com/api/share/${id}`, {
    env,
    method: "POST",
    headers: { "x-av-token": SHARE_TOKEN, "Content-Type": "application/json" },
    body: JSON.stringify({
      payload: "QU5PVEhFUi1wYXlsb2Fk", name: "After", author: "Stephen",
      editKey: "the-capability",
    }),
  });
  assert.equal(updated.status, 200);
  const body = await updated.json();
  assert.equal(body.revision, 2);
  assert.equal(body.changed, true);

  // Somebody else's capability is refused.
  const refused = await run(`https://vibresia.com/api/share/${id}`, {
    env,
    method: "POST",
    headers: { "x-av-token": SHARE_TOKEN, "Content-Type": "application/json" },
    body: JSON.stringify({
      payload: "QU5PVEhFUi1wYXlsb2Fk", name: "Hijacked", author: "Somebody",
      editKey: "not-the-capability",
    }),
  });
  assert.equal(refused.status, 403);
});

test("a correction made in the admin stands when the maker publishes again", async () => {
  const { env } = makeEnv();
  resetRateLimiter();
  const first = await run("https://vibresia.com/api/share", {
    env,
    ...shareRequest({ payload: PAYLOAD, name: "Before", author: "Old Name", key: "before1",
                      public: true, editKey: "the-capability" }),
  });
  const { id } = await first.json();

  const edited = await run(`https://vibresia.com/api/admin/shares/${id}`, {
    env,
    method: "POST",
    headers: { "x-av-admin-token": "admin-token-for-tests", "Content-Type": "application/json" },
    body: JSON.stringify({ action: "edit", name: "After", author: "New Name" }),
  });
  assert.equal(edited.status, 200);

  // The maker publishes a new version with the old words in it. The
  // correction stands: a stale copy must not put the old words back.
  const updated = await run(`https://vibresia.com/api/share/${id}`, {
    env,
    method: "POST",
    headers: { "x-av-token": SHARE_TOKEN, "Content-Type": "application/json" },
    body: JSON.stringify({
      payload: "QU5PVEhFUi1wYXlsb2Fk", name: "Before", author: "Old Name",
      editKey: "the-capability",
    }),
  });
  assert.equal(updated.status, 200);

  const details = await (await run(`https://vibresia.com/api/share/${id}`, { env })).json();
  assert.equal(details.name, "After");
  assert.equal(details.author, "New Name");
});

test("a share that replaces itself is not deleted", async () => {
  const { env } = makeEnv();
  resetRateLimiter();
  const created = await run("https://vibresia.com/api/share", {
    env,
    ...shareRequest({ payload: PAYLOAD, name: "Same", author: "Stephen", key: "same1", public: true }),
  });
  const { id } = await created.json();

  // Sharing the same vibescape again finds the share that is already there
  // rather than making a second one, so the one that is there must survive.
  resetRateLimiter();
  await run("https://vibresia.com/api/share", {
    env,
    ...shareRequest({
      payload: PAYLOAD, name: "Same", author: "Stephen",
      key: "same1", public: true, replaces: id,
    }),
  });
  assert.equal((await run(`https://vibresia.com/api/share/${id}`, { env })).status, 200);
});


// --- telling Discord about the gallery --------------------------------------

/**
 * Runs a request with the Discord POST captured, the way the Worker's own
 * tests do it: nothing here touches the network.
 */
async function runCatchingDiscord(url, { env, ...rest } = {}) {
  const posts = [];
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (target, init) => {
    posts.push({ url: String(target), body: JSON.parse(init.body) });
    return new Response(null, { status: 204 });
  };
  const waits = [];
  const request = new Request(url, { method: rest.method || "GET", headers: rest.headers, body: rest.body });
  try {
    const response = await worker.fetch(request, env, { waitUntil: (p) => waits.push(p) });
    await Promise.all(waits);
    return { response, posts };
  } finally {
    globalThis.fetch = realFetch;
  }
}

test("a new vibescape in the gallery is announced on Discord with its picture and its link", async () => {
  const { env } = makeEnv({ DISCORD_WEBHOOK_URL: "https://discord.com/api/webhooks/1/token" });
  resetRateLimiter();
  const { response, posts } = await runCatchingDiscord("https://vibresia.com/api/share", {
    env,
    ...shareRequest({
      payload: PAYLOAD, name: "Galaxy", author: "Stephen", key: "galaxy1", public: true,
      image: Buffer.from("pretend-jpeg").toString("base64"),
    }),
  });
  assert.equal(response.status, 200);
  assert.equal(posts.length, 1, "one message about the new vibescape");
  assert.equal(posts[0].url, "https://discord.com/api/webhooks/1/token");

  const { id } = await response.json();
  const embed = posts[0].body.embeds[0];
  assert.match(embed.title, /Galaxy/, "the message names the vibescape");
  assert.match(embed.description, /Stephen/, "the message says who made it");
  assert.match(embed.description, /vibresia\.com/, "the message links to the site");
  assert.equal(embed.url, `https://vibresia.com/s/${id}`);
  assert.equal(embed.image.url, `https://vibresia.com/og/${id}.jpg`);
  assert.deepEqual(posts[0].body.allowed_mentions, { parse: [] },
    "a vibescape called @everyone must not ping the channel");
});

test("a vibescape kept out of the gallery is not announced", async () => {
  const { env } = makeEnv({ DISCORD_WEBHOOK_URL: "https://discord.com/api/webhooks/1/token" });
  resetRateLimiter();
  const { posts } = await runCatchingDiscord("https://vibresia.com/api/share", {
    env,
    ...shareRequest({ payload: PAYLOAD, name: "Private", author: "Stephen", key: "priv1", public: false }),
  });
  assert.equal(posts.length, 0, "a private share is not news");
});

test("the same vibescape shared again is not announced twice", async () => {
  const { env } = makeEnv({ DISCORD_WEBHOOK_URL: "https://discord.com/api/webhooks/1/token" });
  resetRateLimiter();
  const first = await runCatchingDiscord("https://vibresia.com/api/share", {
    env,
    ...shareRequest({ payload: PAYLOAD, name: "Twice", author: "Stephen", key: "twice1", public: true }),
  });
  assert.equal(first.posts.length, 1, "the first share is announced");

  resetRateLimiter();
  const second = await runCatchingDiscord("https://vibresia.com/api/share", {
    env,
    ...shareRequest({ payload: PAYLOAD, name: "Twice", author: "Stephen", key: "twice1", public: true }),
  });
  assert.equal(second.posts.length, 0, "sharing the same vibescape again is not news");
});

test("a share that was kept private and is then shared publicly is announced", async () => {
  const { env } = makeEnv({ DISCORD_WEBHOOK_URL: "https://discord.com/api/webhooks/1/token" });
  resetRateLimiter();
  await runCatchingDiscord("https://vibresia.com/api/share", {
    env,
    ...shareRequest({ payload: PAYLOAD, name: "Later", author: "Stephen", key: "later1",
                      public: false, editKey: "the-capability" }),
  });

  resetRateLimiter();
  const { posts } = await runCatchingDiscord("https://vibresia.com/api/share", {
    env,
    ...shareRequest({ payload: PAYLOAD, name: "Later", author: "Stephen", key: "later1",
                      public: true, editKey: "the-capability" }),
  });
  assert.equal(posts.length, 1, "joining the gallery is the news");
});

test("gallery announcements can be switched off without taking the other messages with them", async () => {
  const { env } = makeEnv({
    DISCORD_WEBHOOK_URL: "https://discord.com/api/webhooks/1/token",
    DISCORD_GALLERY_ENABLED: "false",
  });
  resetRateLimiter();
  const { posts } = await runCatchingDiscord("https://vibresia.com/api/share", {
    env,
    ...shareRequest({ payload: PAYLOAD, name: "Quiet", author: "Stephen", key: "quiet1", public: true }),
  });
  assert.equal(posts.length, 0, "the gallery is silent");
});

test("the gallery has its own budget, so a burst of shares cannot flood the channel", async () => {
  const { env } = makeEnv({ DISCORD_WEBHOOK_URL: "https://discord.com/api/webhooks/1/token" });
  resetRateLimiter();
  const send = (n) => runCatchingDiscord("https://vibresia.com/api/share", {
    env,
    ...shareRequest({ payload: `${PAYLOAD}${n}`, name: `Many ${n}`, author: "Stephen", key: `many${n}`, public: true }),
  });
  const first = await send(1);
  assert.equal(first.posts.length, 1, "the first share is announced");
  for (let i = 2; i < 5; i += 1) await send(i);
  const last = await send(5);
  assert.equal(last.posts.length, 0, "the rest wait for the cooldown");
});
