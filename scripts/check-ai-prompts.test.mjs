// Tests that scripts/check-ai-prompts.mjs keeps the weekly and monthly
// prompt sets in step.
//
// The AI visibility check compares a weekly run with the last weekly run, and
// a monthly run with the last monthly run. The weekly set is the set of
// starred prompts in the monthly list, so the two have to be the same set. If
// a prompt is starred in one and not the other, the scores are not
// comparable and nobody notices until the numbers look wrong.

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");
const SCRIPT = path.join(HERE, "check-ai-prompts.mjs");
const PROMPTS = path.join(ROOT, "ops/seo/ai-visibility/prompts.md");

// The script reads a fixed path, so a test of a broken file needs a copy of
// the tree. Make one with the prompts file replaced.
function withPrompts(content) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ai-prompts-"));
  fs.mkdirSync(path.join(dir, "ops/seo/ai-visibility"), { recursive: true });
  fs.mkdirSync(path.join(dir, "scripts"), { recursive: true });
  fs.writeFileSync(path.join(dir, "ops/seo/ai-visibility/prompts.md"), content);
  const script = path.join(dir, "scripts/check-ai-prompts.mjs");
  fs.copyFileSync(SCRIPT, script);
  return { script, prompts: path.join(dir, "ops/seo/ai-visibility/prompts.md") };
}

const REAL = fs.readFileSync(PROMPTS, "utf8");

test("the shipped prompt sets agree", () => {
  const r = spawnSync(process.execPath, [SCRIPT], { encoding: "utf8" });
  assert.equal(r.status, 0, `the shipped prompts disagree:\n${r.stderr}`);
  assert.match(r.stdout, /agree/);
});

test("the weekly set has the prompts it says it has", () => {
  const weekly = REAL.split("## Weekly set")[1].split("## Monthly set")[0];
  // Count the stars on the table rows, not in the prose above them, which
  // mentions the star to explain what it means.
  const stars = weekly
    .split("\n")
    .filter((line) => line.trim().startsWith("|"))
    .filter((line) => line.includes("★")).length;
  // The heading states the count. If the count in the text and the number of
  // stars disagree, the file lies to whoever reads it.
  const claimed = weekly.match(/The (\d+) prompts marked/);
  assert.ok(claimed, "the weekly set heading does not state a count");
  assert.equal(Number(claimed[1]), stars, "the stated count is not the number of stars");
});

test("a prompt starred in one set and not the other is caught", () => {
  const broken = REAL.replace("- Who makes Vibresia? ★", "- Who makes Vibresia?");
  assert.notEqual(broken, REAL, "the test did not change the file");
  const { script } = withPrompts(broken);
  const r = spawnSync(process.execPath, [script], { encoding: "utf8" });
  assert.equal(r.status, 1, "the drift was not caught");
  assert.match(r.stderr, /Who makes Vibresia/);
});

test("an empty weekly set is caught", () => {
  const broken = REAL.replace(/★/g, "");
  const { script } = withPrompts(broken);
  const r = spawnSync(process.execPath, [script], { encoding: "utf8" });
  assert.equal(r.status, 1, "the empty set was not caught");
});
