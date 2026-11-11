#!/usr/bin/env node
// Checks whether a commit actually landed on origin/main.
//
//   node scripts/check-landing.js <sha>
//
// Prints LANDED or STRANDED.
//
// A push that reports success but did not reach origin/main is the failure
// mode this catches. The SEO routines must not claim a change shipped on a
// STRANDED result. Report it plainly instead.
//
// STRANDED means: the commit is not an ancestor of origin/main. That covers
// both "the push never landed" and "the push landed on a branch instead".
// Check the branch yourself if you need to tell them apart.

import { execFileSync } from "node:child_process";

const sha = process.argv[2];
if (!sha) {
  console.error("usage: check-landing.js <sha>");
  process.exit(2);
}

function git(args) {
  return execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
}

let ok = false;
try {
  git(["fetch", "origin", "main", "--quiet"]);
} catch {
  // A fetch failure is not a stranding by itself; the check below is the
  // authority, so carry on and let it decide.
}

try {
  git(["merge-base", "--is-ancestor", sha, "origin/main"]);
  ok = true;
} catch {
  ok = false;
}

if (ok) {
  console.log("LANDED");
  process.exit(0);
}

// Is it on origin at all, on some branch?
let onBranch = "";
try {
  const branches = git(["branch", "-r", "--contains", sha, "origin"]).split("\n").filter(Boolean);
  onBranch = branches.join(", ");
} catch {
  onBranch = "";
}

if (!onBranch) {
  // The remote-tracking refs can be stale. Ask the remote directly.
  try {
    const remotes = git(["ls-remote", "--heads", "origin"]).split("\n").filter(Boolean);
    const targets = remotes
      .map((line) => line.split(/\s+/))
      .filter((parts) => parts.length === 2)
      .filter(([, sha2]) => sha2.startsWith(sha));
    if (targets.length) {
      onBranch = targets.map(([, name]) => `origin/${name}`).join(", ");
    }
  } catch {
    onBranch = "";
  }
}

console.log("STRANDED");
if (onBranch) {
  console.log(`(the commit is on ${onBranch}, not on origin/main)`);
}
process.exit(1);
