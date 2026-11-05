// Tests for the public MCP server.
//
// The D1 binding is faked the same way the share tests fake it: the point
// is the rules — what a tool does, what it refuses, and what it says — not
// SQLite.

import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";

import worker, { resetRateLimiter } from "./index.js";
import { handleMcp, lintVibescape, resetMcpRateLimiters } from "./mcp.js";
import SERVER_JSON from "../server.json" with { type: "json" };

const PAYLOAD = "TZDNbsMgEIRfZcUJYoqIU6dtqjxCT63USy8oIcESBosfK1GUd-8CVZWLBd_M7oy5EZWT8YHsyGfSs9GOcOLUpBF8XOF";

/// The hash the site stores for a capability. The capability itself is never
/// stored, so a row in the database holds this and not the secret.
function capabilityHash(capability) {
    return createHash("sha256").update(capability).digest("hex");
}

/** A D1 stand-in, with just the queries the MCP server makes. */
function makeShares() {
    const rows = new Map();
    return {
        rows,
        prepare(sql) {
            const statement = {
                bind(...args) {
                    return {
                        async run() {
                            if (sql.includes("INSERT INTO shares")) {
                                const [id, payload, name, author, key, payloadHash, isPublic,
                                       created, editKey] = args;
                                rows.set(id, {
                                    id, payload, name, author,
                                    key: key || null,
                                    payload_hash: payloadHash || null,
                                    is_public: isPublic ? 1 : 0,
                                    created_at: created,
                                    edit_key: editKey || null,
                                    revision: 1,
                                });
                                return { success: true };
                            }
                            if (sql.includes("UPDATE shares SET is_public")) {
                                // The gallery flag is a literal in the SQL,
                                // so only the id is bound.
                                const [id] = args;
                                const row = rows.get(id);
                                if (row) row.is_public = 1;
                                return { success: true };
                            }
                            return { success: true };
                        },
                        async first() {
                            if (sql.includes("WHERE id = ?")) {
                                const row = rows.get(args[0]);
                                return row ? { ...row } : null;
                            }
                            return null;
                        },
                        async all() {
                            if (sql.includes("is_public = 1")) {
                                return { results: [...rows.values()].filter((row) => row.is_public === 1) };
                            }
                            return { results: [...rows.values()] };
                        },
                    };
                },
                async all() {
                    if (sql.includes("is_public = 1")) {
                        return { results: [...rows.values()].filter((row) => row.is_public === 1) };
                    }
                    return { results: [...rows.values()] };
                },
            };
            return statement;
        },
    };
}

function makeEnv() {
    const shares = makeShares();
    return {
        env: {
            ASSETS: { fetch: async () => new Response("", { status: 404 }) },
            SHARES: shares,
        },
        shares,
    };
}

async function rpc(env, method, params, id = 1, address = "203.0.113.1", headers = {}) {
    const edge = address ? { "CF-Connecting-IP": address } : {};
    const request = new Request("https://vibresia.com/mcp", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json, text/event-stream",
            ...edge,
            ...headers,
        },
        body: JSON.stringify({ jsonrpc: "2.0", id, method, params }),
    });
    const response = await handleMcp(request, env);
    if (response.status === 202) return null;
    return response.json();
}

function callTool(env, name, args, address) {
    return rpc(env, "tools/call", { name, arguments: args }, 1, address);
}

/// The text of a tool's answer, taking the JSON-RPC envelope off it.
/// Whether a tool said it could not do it.
function isError(answer) {
    return (answer?.result ?? answer)?.isError === true;
}

function textOf(answer) {
    const result = answer?.result ?? answer;
    return (result?.content ?? []).map((part) => part.text ?? "").join("\n");
}

beforeEach(() => {
    resetRateLimiter();
    resetMcpRateLimiters();
});

// --- the protocol ----------------------------------------------------------

test("it says hello, and says what it is for", async () => {
    const { env } = makeEnv();
    const answer = await rpc(env, "initialize", { protocolVersion: "2025-06-18" });
    assert.equal(answer.result.protocolVersion, "2025-06-18");
    assert.equal(answer.result.serverInfo.name, "vibresia");
    // The version the server reports is the one in the registry's entry, so
    // a directory that shows it agrees with the registry.
    assert.equal(answer.result.serverInfo.version, SERVER_JSON.version);
    assert.ok(answer.result.instructions.includes("music visualisation"));
});

test("a client asking for an older protocol gets it", async () => {
    const { env } = makeEnv();
    const answer = await rpc(env, "initialize", { protocolVersion: "2024-11-05" });
    assert.equal(answer.result.protocolVersion, "2024-11-05");
});

test("a client asking for something else gets the newest", async () => {
    const { env } = makeEnv();
    const answer = await rpc(env, "initialize", { protocolVersion: "1999-01-01" });
    assert.equal(answer.result.protocolVersion, "2025-06-18");
});

test("it lists its tools, and every one says what it is and whether it writes", async () => {
    const { env } = makeEnv();
    const answer = await rpc(env, "tools/list", {});
    const tools = answer.result.tools;
    assert.ok(tools.length >= 7);
    for (const tool of tools) {
        assert.ok(tool.name, "a tool has no name");
        assert.ok(tool.title, `${tool.name} has no title`);
        assert.ok(tool.description, `${tool.name} has no description`);
        assert.ok(tool.inputSchema, `${tool.name} has no schema`);
        // The hints are what a reviewer reads, and both directories insist
        // on them being set.
        assert.equal(typeof tool.annotations.readOnlyHint, "boolean", `${tool.name} has no readOnlyHint`);
        assert.equal(typeof tool.annotations.destructiveHint, "boolean", `${tool.name} has no destructiveHint`);
        assert.equal(typeof tool.annotations.openWorldHint, "boolean", `${tool.name} has no openWorldHint`);
    }
});

test("a method it does not have is an error, not a shrug", async () => {
    const { env } = makeEnv();
    const answer = await rpc(env, "resources/list", {});
    assert.equal(answer.error.code, -32601);
});

// --- the tools -------------------------------------------------------------

test("the reference tells an agent what the language has", async () => {
    const { env } = makeEnv();
    const result = await callTool(env, "vibescape_reference", {});
    const text = textOf(result);
    assert.ok(text.includes("uBass"));
    assert.ok(text.includes("vec3 render(vec2 p, float t)"));
    assert.ok(text.includes("uScroll"));
});

test("the palettes are there, and one of them can be asked for by name", async () => {
    const { env } = makeEnv();
    const all = textOf(await callTool(env, "get_palette", {}));
    for (const name of ["NEON", "EMBER", "TOXIC", "ABYSS", "MONO"]) {
        assert.ok(all.includes(name), `${name} is missing`);
    }
    const one = textOf(await callTool(env, "get_palette", { name: "neon" }));
    assert.ok(one.includes("NEON"));
    assert.ok(one.includes("EMBED") === false);
});

test("the linter says a vibescape that ignores the music will not move", async () => {
    const { env } = makeEnv();
    const result = await callTool(env, "lint_vibescape", {
        code: "vec3 render(vec2 p, float t) { return vec3(1.0, 0.0, 0.0); }",
    });
    const text = textOf(result);
    assert.ok(text.includes("never reads the music"));
});

test("the linter is happy with a vibescape that does read the music", async () => {
    const warnings = lintVibescape(
        "vec3 render(vec2 p, float t) { float b = uBassSmooth; float d = bandAt(3); return vec3(b, d, length(p)); }");
    // The palette warning is advisory — a vibescape with fixed colours is a
    // perfectly good vibescape — but the music one is not, and it is not here.
    assert.ok(!warnings.some((w) => w.includes("never reads the music")), warnings.join("; "));
});

test("making a vibescape gives back a link", async () => {
    const { env } = makeEnv();
    const result = await callTool(env, "create_vibescape", {
        code: "vec3 render(vec2 p, float t) { return vec3(uBass, 0.2, 0.5); }",
        name: "A Test World",
    });
    const text = textOf(result);
    assert.match(text, /https:\/\/vibresia\.com\/s\/[a-z2-9]{6}/);
    assert.ok(text.includes("not in the public gallery yet"));
});

test("one address making vibescapes too fast slows itself down and nobody else", async () => {
    const { env } = makeEnv();
    const args = { code: "vec3 render(vec2 p, float t) { return vec3(uBass); }", name: "Quick" };
    assert.equal(isError(await callTool(env, "create_vibescape", args, "203.0.113.1")), false);
    assert.equal(isError(await callTool(env, "create_vibescape", args, "203.0.113.1")), true);
    assert.equal(isError(await callTool(env, "create_vibescape", args, "198.51.100.7")), false);
});

test("a forged x-forwarded-for does not buy more vibescapes", async () => {
    const { env } = makeEnv();
    const args = { code: "vec3 render(vec2 p, float t) { return vec3(uBass); }", name: "Quick" };
    // No CF-Connecting-IP at all, so the address has to come from the
    // forwarded header — which a caller can write. It must not be able to
    // mint a fresh budget per request.
    for (let attempt = 0; attempt < 3; attempt += 1) {
        const result = await rpc(env, "tools/call", { name: "create_vibescape", arguments: args },
            1, undefined, { "x-forwarded-for": `198.51.100.${attempt}` });
        assert.equal(isError(result), attempt > 0, `attempt ${attempt + 1} was not limited`);
    }
});

test("a forged x-forwarded-for cannot get round the limiter when the edge sets the address", async () => {
    const { env } = makeEnv();
    const args = { code: "vec3 render(vec2 p, float t) { return vec3(uBass); }", name: "Quick" };
    const first = await rpc(env, "tools/call", { name: "create_vibescape", arguments: args },
        1, "203.0.113.1", { "x-forwarded-for": "198.51.100.1" });
    assert.equal(isError(first), false);
    const second = await rpc(env, "tools/call", { name: "create_vibescape", arguments: args },
        1, "203.0.113.1", { "x-forwarded-for": "198.51.100.2" });
    assert.equal(isError(second), true, "the forged header changed the budget");
});

test("a vibescape that is made is not in the gallery until it is shared", async () => {
    const { env } = makeEnv();
    const created = await callTool(env, "create_vibescape", {
        code: "vec3 render(vec2 p, float t) { return vec3(uBass, 0.2, 0.5); }",
        name: "A Test World",
    });
    const text = textOf(created);
    const id = text.match(/\/s\/([a-z2-9]{6})/)[1];
    // The capability comes back with it. The site keeps only its hash, so
    // this is the one copy of it that exists.
    const editKey = text.match(/editKey: (\S+)/)[1];

    let gallery = textOf(await callTool(env, "list_vibescapes", {}));
    assert.ok(!gallery.includes("A Test World"), "it is in the gallery before it was shared");

    const shared = await callTool(env, "share_vibescape", { id, editKey });
    assert.ok(textOf(shared).includes("Listed"));

    gallery = textOf(await callTool(env, "list_vibescapes", {}));
    assert.ok(gallery.includes("A Test World"), "it is not in the gallery after it was shared");
});

test("a vibescape that was made can be read back", async () => {
    const { env } = makeEnv();
    const code = "vec3 render(vec2 p, float t) { return vec3(uBass, 0.2, 0.5); }";
    const created = await callTool(env, "create_vibescape", { code, name: "Readable" });
    const id = textOf(created).match(/\/s\/([a-z2-9]{6})/)[1];
    const read = await callTool(env, "get_vibescape", { id });
    const text = textOf(read);
    assert.ok(text.includes("Readable"));
    assert.ok(text.includes("vec3 render"));
});

test("a bad id is refused rather than guessed at", async () => {
    const { env } = makeEnv();
    const result = await callTool(env, "get_vibescape", { id: "../../etc/passwd" });
    assert.equal(isError(result), true);
});

test("a vibescape needs a name and some code", async () => {
    const { env } = makeEnv();
    assert.equal(isError(await callTool(env, "create_vibescape", { code: "", name: "X" })), true);
    assert.equal(isError(await callTool(env, "create_vibescape", { code: "x", name: "" })), true);
});

test("the MCP server refuses a vibescape that is too big", async () => {
    const { env } = makeEnv();
    // Content that does not compress: the row costs what the payload costs,
    // so this is the case that burns the quota. (A long run of the same
    // character compresses to nothing and is harmless.)
    const noise = Array.from({ length: 100_000 },
        () => "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/"
            [Math.floor(Math.random() * 64)]).join("");
    const result = await callTool(env, "create_vibescape", {
        name: "Big", code: noise,
    });
    assert.equal(isError(result), true);
});

test("the MCP server refuses a name that is too long", async () => {
    const { env } = makeEnv();
    const result = await callTool(env, "create_vibescape", {
        name: "x".repeat(200), code: "vec3 render(vec2 p, float t) { return vec3(0.0); }",
    });
    assert.equal(isError(result), true);
});

test("the MCP server refuses an author that is too long", async () => {
    const { env } = makeEnv();
    const result = await callTool(env, "create_vibescape", {
        name: "Fine", author: "x".repeat(200),
        code: "vec3 render(vec2 p, float t) { return vec3(0.0); }",
    });
    assert.equal(isError(result), true);
});

test("the MCP server cannot list somebody else's vibescape", async () => {
    const { env, shares } = makeEnv();
    // A share somebody else made, kept out of the gallery on purpose, with a
    // capability of their own.
    shares.rows.set("abc234", {
        id: "abc234", payload: PAYLOAD, name: "Private", author: "Somebody",
        is_public: 0, created_at: 1, edit_key: capabilityHash("the-capability"),
    });

    const result = await callTool(env, "share_vibescape", { id: "abc234" });
    assert.equal(isError(result), true);
    assert.equal(shares.rows.get("abc234").is_public, 0, "it was listed anyway");
});

test("the MCP server cannot list a vibescape with the wrong capability", async () => {
    const { env, shares } = makeEnv();
    shares.rows.set("abc234", {
        id: "abc234", payload: PAYLOAD, name: "Private", author: "Somebody",
        is_public: 0, created_at: 1, edit_key: capabilityHash("the-capability"),
    });

    const result = await callTool(env, "share_vibescape", { id: "abc234", editKey: "not-the-capability" });
    assert.equal(isError(result), true);
    assert.equal(shares.rows.get("abc234").is_public, 0, "it was listed anyway");
});

test("the maker can list their own vibescape with its capability", async () => {
    const { env, shares } = makeEnv();
    shares.rows.set("abc234", {
        id: "abc234", payload: PAYLOAD, name: "Mine", author: "Me",
        is_public: 0, created_at: 1, edit_key: capabilityHash("the-capability"),
    });

    const result = await callTool(env, "share_vibescape", { id: "abc234", editKey: "the-capability" });
    assert.equal(isError(result), false);
    assert.equal(shares.rows.get("abc234").is_public, 1);
});

test("an agent-made vibescape is found again when the app shares the same one", async () => {
    const { env, shares } = makeEnv();
    const code = "vec3 render(vec2 p, float t) { return vec3(uBass, 0.2, 0.5); }";
    const created = await callTool(env, "create_vibescape", { code, name: "Same World" });
    const id = textOf(created).match(/\/s\/([a-z2-9]{6})/)[1];
    const row = shares.rows.get(id);

    // The row the agent made has to be findable by the key the app sends,
    // and by the hash of its payload — otherwise the app makes a second row
    // and a second link for the same vibescape.
    assert.ok(row.key, "the row has no key, so the app cannot find it by key");
    assert.ok(row.payload_hash, "the row has no payload hash, so it can only be found by a table scan");

    // And the key has to be the one the app computes for the same content.
    const { shareIdentityKey } = await import("./share-limits.js");
    const appKey = await shareIdentityKey({
        name: "Same World", author: "", url: null, shader: code,
    });
    assert.equal(row.key, appKey, "the key is not the one the app computes");
});

test("the tool descriptions say what the capability actually does", async () => {
    const { env } = makeEnv();
    const listed = await rpc(env, "tools/list", {});
    const tools = listed.result.tools;
    const share = tools.find((t) => t.name === "share_vibescape");
    assert.ok(share, "there is no share_vibescape tool");
    assert.match(share.description, /create_vibescape/,
        "the description does not say where the capability comes from");
    assert.doesNotMatch(share.description, /a vibescape made here has none/i,
        "the description says agent-made vibescapes have no capability, which is false");

    const create = tools.find((t) => t.name === "create_vibescape");
    assert.match(create.description, /capability/i,
        "create_vibescape does not mention the capability it returns");
});

test("the app's own download is in there for somebody who wants it", async () => {
    const { env } = makeEnv();
    const text = textOf(await callTool(env, "get_app", {}));
    assert.ok(text.includes("vibresia.com"));
    assert.ok(text.includes("install.sh"));
});

test("the server refuses to be made to do something it does not have", async () => {
    const { env } = makeEnv();
    const result = await callTool(env, "delete_everything", {});
    assert.equal(isError(result), true);
});

// --- the discovery file ----------------------------------------------------

test("the registry's discovery file points at this server", async () => {
    const { env } = makeEnv();
    const response = await worker.fetch(
        new Request("https://vibresia.com/.well-known/mcp.json"), env, { waitUntil: () => {} });
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.remotes[0].url, "https://vibresia.com/mcp");
    assert.equal(body.remotes[0].type, "streamable-http");
    assert.match(body.name, /^[a-zA-Z0-9.-]+\/[a-zA-Z0-9._-]+$/);
    assert.ok(body.description.length <= 100, "the registry refuses a description over 100 characters");
    assert.ok(body.name.startsWith("com.vibresia/"), "the name sits in the namespace the domain proves");
});

test("the domain proves it owns the com.vibresia namespace", async () => {
    const { env } = makeEnv();
    const response = await worker.fetch(
        new Request("https://vibresia.com/.well-known/mcp-registry-auth"), env, { waitUntil: () => {} });
    assert.equal(response.status, 200);
    assert.match(await response.text(), /^v=MCPv1; k=ed25519; p=[A-Za-z0-9+/]{43}=$/);
});
