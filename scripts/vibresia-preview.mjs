#!/usr/bin/env node
// Preview a vibescape from a file, through the Vibresia MCP server.
//
//   node scripts/vibresia-preview.mjs <file.glsl> [--pos 0.5] [--dur 222] [--w 480] [--h 270] [--time 12] [--frames 1] [--palette NEON]
//
// --pos and --dur are passed as uTrackPos/uTrackDuration, which the renderer
// turns into uTrackProgress and uTrackKnown — so --pos/--dur is how you see
// the scene at a particular point in a track.

import { spawn } from "node:child_process";
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const BIN = "/Users/sydlawrence/minithlabs/visualiser/VisualiserMac/build/Vibresia.app/Contents/MacOS/Vibresia";
const OUT = join(tmpdir(), "vibresia-mcp");

const argv = process.argv.slice(2);
const file = argv[0];
if (!file) {
  console.error("usage: vibresia-preview.mjs <file.glsl> [--pos N] [--dur N] [--w N] [--h N] [--time N] [--frames N] [--palette NAME] [--grade false] [--no-track]");
  process.exit(2);
}

function flag(name, fallback) {
  const i = argv.indexOf(`--${name}`);
  if (i < 0) return fallback;
  const v = argv[i + 1];
  return v === undefined || v.startsWith("--") ? true : v;
}

const uniforms = {};
if (!argv.includes("--no-track")) {
  const dur = Number(flag("dur", 222));
  const pos = Number(flag("pos", 0)) * dur;
  uniforms.uTrackDuration = dur;
  uniforms.uTrackPos = pos;
}

const options = {
  width: Number(flag("w", 480)),
  height: Number(flag("h", 270)),
  frames: Number(flag("frames", 1)),
  time_start: Number(flag("time", 12)),
  time_step: Number(flag("timestep", 0.5)),
  uniforms,
};
if (flag("palette", null)) options.palette = flag("palette", null);
if (flag("grade", null) !== null) options.grade = flag("grade", null) !== "false";

const code = readFileSync(file, "utf8");

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
    const r = pending.get(msg.id);
    if (r) { pending.delete(msg.id); r(msg); }
  }
});

function send(method, params) {
  const id = nextId++;
  return new Promise((resolve, reject) => {
    pending.set(id, resolve);
    server.stdin.write(JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n");
    setTimeout(() => { if (pending.has(id)) { pending.delete(id); reject(new Error(`timeout ${method}`)); } }, 180000);
  });
}

const server_ = (await import("node:child_process"));
const result = await (async () => {
  await send("initialize", { protocolVersion: "2024-11-05", capabilities: {}, clientInfo: { name: "preview", version: "1" } });
  server.stdin.write(JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized", params: {} }) + "\n");
  return send("tools/call", { name: "preview_vibescape", arguments: { code, options } });
})();

mkdirSync(OUT, { recursive: true });
let i = 0;
for (const item of result.result?.content ?? []) {
  if (item.type === "text") console.log(item.text);
  else if (item.type === "image") {
    const p = join(OUT, `preview-${Date.now()}-${i++}.png`);
    writeFileSync(p, Buffer.from(item.data, "base64"));
    console.log(`\n[image] ${p}`);
  }
}
if (result.error) console.error("ERROR:", JSON.stringify(result.error));
server.stdin.end();
server.kill();
setTimeout(() => process.exit(0), 100);
