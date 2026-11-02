#!/usr/bin/env node
// A tiny MCP stdio client for the Vibresia local MCP server.
//
//   node scripts/vibresia-mcp.mjs list
//   node scripts/vibresia-mcp.mjs call <tool> '<json args>'
//
// The server is the app binary run with --mcp, speaking JSON-RPC 2.0 over
// stdin/stdout, one JSON message per line. Images come back base64 PNGs, so
// they're written to /tmp and the path is printed.

import { spawn } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const BIN = "/Users/sydlawrence/minithlabs/visualiser/VisualiserMac/build/Vibresia.app/Contents/MacOS/Vibresia";
const OUT = join(tmpdir(), "vibresia-mcp");

const argv = process.argv.slice(2);
const mode = argv[0] ?? "list";

const server = spawn(BIN, ["--mcp"], { stdio: ["pipe", "pipe", "inherit"] });

let buffer = "";
const pending = new Map();
let nextId = 1;

server.stdout.on("data", (chunk) => {
  buffer += chunk.toString("utf8");
  let newline;
  while ((newline = buffer.indexOf("\n")) >= 0) {
    const line = buffer.slice(0, newline).trim();
    buffer = buffer.slice(newline + 1);
    if (!line) continue;
    let message;
    try {
      message = JSON.parse(line);
    } catch {
      continue;
    }
    const resolver = pending.get(message.id);
    if (resolver) {
      pending.delete(message.id);
      resolver(message);
    }
  }
});

function send(method, params) {
  const id = nextId++;
  return new Promise((resolve, reject) => {
    pending.set(id, resolve);
    server.stdin.write(JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n");
    setTimeout(() => {
      if (pending.has(id)) {
        pending.delete(id);
        reject(new Error(`Timed out waiting for ${method}`));
      }
    }, 120000);
  });
}

function notify(method, params) {
  server.stdin.write(JSON.stringify({ jsonrpc: "2.0", method, params }) + "\n");
}

async function main() {
  await send("initialize", {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "vibresia-mcp-client", version: "1.0.0" },
  });
  notify("notifications/initialized", {});

  if (mode === "list") {
    const { result } = await send("tools/list", {});
    for (const tool of result.tools) {
      console.log(`\n### ${tool.name}`);
      console.log(tool.description);
      console.log("params:", JSON.stringify(tool.inputSchema.properties ?? {}));
    }
  } else if (mode === "call") {
    const tool = argv[1];
    const args = argv[2] ? JSON.parse(argv[2]) : {};
    const { result, error } = await send("tools/call", { name: tool, arguments: args });
    if (error) {
      console.error("ERROR:", JSON.stringify(error));
      process.exitCode = 1;
    } else {
      mkdirSync(OUT, { recursive: true });
      for (const item of result.content ?? []) {
        if (item.type === "text") {
          console.log(item.text);
        } else if (item.type === "image") {
          const file = join(OUT, `${tool}-${Date.now()}.png`);
          writeFileSync(file, Buffer.from(item.data, "base64"));
          console.log(`\n[image] ${file}`);
        }
      }
    }
  } else {
    console.error("usage: vibresia-mcp.mjs list | call <tool> <json>");
    process.exitCode = 2;
  }

  server.stdin.end();
  server.kill();
  setTimeout(() => process.exit(process.exitCode ?? 0), 100);
}

main().catch((error) => {
  console.error(error);
  server.kill();
  process.exit(1);
});
