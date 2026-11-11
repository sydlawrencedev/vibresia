#!/usr/bin/env node
// Checks that the weekly and monthly prompt sets in
// ops/seo/ai-visibility/prompts.md agree.
//
//   node scripts/check-ai-prompts.mjs
//
// The weekly set is the set of starred prompts in the monthly list. They have
// to be the same set, because a weekly run and a monthly run are compared
// against each other and a prompt in one but not the other makes the scores
// incomparable.
//
// The prompt file is the record of what was asked, so its wording is not
// checked here. Only the membership of the two sets is.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FILE = path.join(ROOT, "ops/seo/ai-visibility/prompts.md");

if (!fs.existsSync(FILE)) {
  console.error(`missing: ${path.relative(ROOT, FILE)}`);
  process.exit(1);
}

const text = fs.readFileSync(FILE, "utf8");

const weeklySection = text.split("## Weekly set")[1]?.split("## Monthly set")[0] ?? "";
const monthlySection = text.split("## Monthly set")[1] ?? "";

if (!weeklySection || !monthlySection) {
  console.error("the prompt file no longer has a '## Weekly set' and a '## Monthly set' section");
  process.exit(1);
}

// The weekly table lists one prompt per row: "| group | prompt |", with a
// star on the ones that are in the weekly set. The monthly list is one
// prompt per bullet, with a star on the same ones.
const weekly = new Set();
for (const line of weeklySection.split("\n")) {
  if (!line.trim().startsWith("|")) continue;
  const cells = line.split("|").map((c) => c.trim());
  // cells[0] is empty (the line starts with "|"), cells[1] is the group and
  // cells[2] is the prompt.
  const prompt = cells[2];
  if (!prompt || prompt === "Prompt" || /^-+$/.test(prompt)) continue;
  if (prompt.includes("★")) weekly.add(prompt.replace("★", "").trim());
}

const monthly = new Set();
for (const line of monthlySection.split("\n")) {
  const m = line.match(/^-\s+(.*?)\s*(★)?\s*$/);
  if (!m) continue;
  const prompt = m[1].trim();
  if (!prompt) continue;
  if (m[2]) monthly.add(prompt);
}

const problems = [];

const inWeeklyOnly = [...weekly].filter((p) => !monthly.has(p));
const inMonthlyOnly = [...monthly].filter((p) => !weekly.has(p));

if (inWeeklyOnly.length) {
  problems.push(`starred in the weekly table but not in the monthly list:\n  ${inWeeklyOnly.join("\n  ")}`);
}
if (inMonthlyOnly.length) {
  problems.push(`starred in the monthly list but not in the weekly table:\n  ${inMonthlyOnly.join("\n  ")}`);
}
if (weekly.size === 0) problems.push("the weekly set is empty");
if (monthly.size === 0) problems.push("the monthly list has no starred prompts");

if (problems.length) {
  console.error("the AI visibility prompt sets do not agree:");
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}

console.log(`the weekly set and the monthly list agree: ${weekly.size} prompts`);
