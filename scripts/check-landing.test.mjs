// Tests for the landing check.
//
// The check answers one question: did this commit actually reach origin/main?
// Two answers matter and they are different. LANDED means the commit is on
// main. STRANDED means it is not — which covers both "the push never landed"
// and "the push landed on a branch instead", and the two need different
// answers from the person reading it.
//
// So STRANDED has to say where the commit went, if it went anywhere. That
// part used to be broken in a way no amount of reading would have caught:
// the code took the second half of each `ls-remote` line, which is the
// branch name, and asked whether the branch name started with the sha. The
// answer was always no, so a commit sitting on a remote branch was reported
// as stranded with no hint of where it was.
//
// The test uses a real repository and a real remote, in a temporary
// directory. A fake would not have caught it: the bug was in reading git's
// output, and only git's output shows it.

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CHECK = path.join(HERE, "check-landing.js");

function git(args, cwd) {
  return execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
}

/// A repository with a bare remote, one commit on main.
function makeRepo() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "vib-landing-"));
  const remote = path.join(root, "remote.git");
  const work = path.join(root, "work");

  git(["init", "--bare", "-b", "main", remote], root);
  fs.mkdirSync(work);
  git(["init", "-b", "main"], work);
  git(["config", "user.email", "test@example.invalid"], work);
  git(["config", "user.name", "Test"], work);
  git(["remote", "add", "origin", remote], work);
  fs.writeFileSync(path.join(work, "README.md"), "one\n");
  git(["add", "."], work);
  git(["commit", "-m", "one"], work);
  git(["push", "-u", "origin", "main"], work);

  return { root, remote, work };
}

/// Runs the check and returns what it printed.
function runCheck(sha, cwd) {
  const out = execFileSync("node", [CHECK, sha], {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  return { code: 0, out };
}

function runCheckExpectingFailure(sha, cwd) {
  try {
    execFileSync("node", [CHECK, sha], { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    return { code: 0, out: "" };
  } catch (error) {
    return { code: error.status, out: error.stdout };
  }
}

test("a commit on origin/main is LANDED", () => {
  const { work } = makeRepo();
  const sha = git(["rev-parse", "HEAD"], work);
  const result = runCheck(sha, work);
  assert.match(result.out, /LANDED/);
});

test("a commit pushed to a branch is STRANDED and says which branch", () => {
  // This is the case the old code got wrong: the commit was on the remote,
  // on a branch, and the check could not name it.
  const { work } = makeRepo();
  git(["checkout", "-b", "a-branch"], work);
  fs.writeFileSync(path.join(work, "second.md"), "two\n");
  git(["add", "."], work);
  git(["commit", "-m", "two"], work);
  const sha = git(["rev-parse", "HEAD"], work);
  git(["push", "origin", "a-branch"], work);

  const result = runCheckExpectingFailure(sha, work);
  assert.match(result.out, /STRANDED/);
  assert.match(
    result.out,
    /origin\/a-branch/,
    "the check did not say which branch the commit is on",
  );
});

test("a commit that was never pushed is STRANDED and names no branch", () => {
  const { work } = makeRepo();
  fs.writeFileSync(path.join(work, "third.md"), "three\n");
  git(["add", "."], work);
  git(["commit", "-m", "three"], work);
  const sha = git(["rev-parse", "HEAD"], work);

  const result = runCheckExpectingFailure(sha, work);
  assert.match(result.out, /STRANDED/);
  assert.doesNotMatch(
    result.out,
    /origin\//,
    "the check named a branch for a commit that was never pushed",
  );
});

test("a short sha finds the branch too", () => {
  // The routine passes a short sha, so the branch lookup has to work with
  // one.
  const { work } = makeRepo();
  git(["checkout", "-b", "short-sha-branch"], work);
  fs.writeFileSync(path.join(work, "fourth.md"), "four\n");
  git(["add", "."], work);
  git(["commit", "-m", "four"], work);
  const sha = git(["rev-parse", "--short", "HEAD"], work);
  git(["push", "origin", "short-sha-branch"], work);

  const result = runCheckExpectingFailure(sha, work);
  assert.match(result.out, /STRANDED/);
  assert.match(result.out, /origin\/short-sha-branch/);
});
