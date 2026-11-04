#!/usr/bin/env node
// Render every built-in Vibresia scene through the app, and say which drew.
//
//   node scripts/check-builtin-scenes.mjs
//
// It calls the app's MCP server, whose list_vibescapes renders each scene to
// a picture: a text line naming the scene, then its image. A scene that
// stopped compiling comes back with a picture that says what is wrong, so
// the check fails on the scene rather than on the app.
//
// Use it after a change to a scene, to a shader, or to the renderer: it is
// the only check that sees the real thing, through the real driver.

import { spawn } from "node:child_process";

const BIN = "/Users/sydlawrence/minithlabs/visualiser/VisualiserMac/build/Vibresia.app/Contents/MacOS/Vibresia";

const server = spawn(BIN, ["--mcp"], { stdio: ["pipe", "pipe", "ignore"] });
let buffer = "";
const pending = new Map();
let nextId = 1;

server.stdout.on("data", (chunk) => {
  buffer += chunk.toString("utf8");
  let nl;
  while ((nl = buffer.indexOf("\n")) >= 0) {
    const line = buffer.slice(0, nl).trim();
    buffer = buffer.slice(nl + 1);
    if (!line) continue;
    let msg;
    try { msg = JSON.parse(line); } catch { continue; }
    const entry = pending.get(msg.id);
    if (entry) { pending.delete(msg.id); entry(msg); }
  }
});

function call(method, params) {
  return new Promise((resolve, reject) => {
    const id = nextId++;
    pending.set(id, resolve);
    server.stdin.write(JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n");
    setTimeout(() => {
      if (pending.has(id)) { pending.delete(id); reject(new Error(`${method} timed out`)); }
    }, 120000);
  });
}

await call("initialize", {
  protocolVersion: "2024-11-05",
  capabilities: {},
  clientInfo: { name: "check-builtin-scenes", version: "1.0.0" }
});
server.stdin.write(JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }) + "\n");

const res = await call("tools/call", { name: "list_vibescapes", arguments: {} });
server.kill();

const content = res.result?.content || [];
// A text line names the scene, and the image after it is that scene's
// picture. A scene that would not compile comes back with the compiler's
// words in place of the picture.
//
// The last text block is the index — a list of every scene's name, with no
// pictures after it — so it is not a scene and is left out.
const index = content.length - 1;
let current = null;
const scenes = [];
for (let i = 0; i < content.length; i++) {
  const item = content[i];
  if (i === index) break;
  if (item.type === "image") {
    if (current) { current.bytes = (item.data || "").length; scenes.push(current); current = null; }
  } else if (item.type === "text") {
    const text = (item.text || "").trim();
    if (!text) continue;
    if (current) { current.error = text; scenes.push(current); }
    current = { name: text.split("\n")[0], bytes: 0 };
  }
}
if (current) scenes.push(current);

let failed = 0;
for (const s of scenes) {
  if (s.error) {
    console.error(`[scenes] ${s.name}: did not draw — ${s.error.split("\n")[0]}`);
    failed++;
  } else if (!s.bytes) {
    console.error(`[scenes] ${s.name}: drew nothing.`);
    failed++;
  } else {
    console.log(`[scenes] ${s.name}: drew (${s.bytes} bytes).`);
  }
}

if (failed) {
  console.error(`[scenes] ${failed} of ${scenes.length} scenes did not draw.`);
  process.exit(1);
}
console.log(`[scenes] all ${scenes.length} scenes drew.`);
