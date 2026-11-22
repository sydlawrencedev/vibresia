// Tests for the ship helper: node --test scripts/check-git-ship.test.mjs
//
// The helper moves a change from the main working tree onto a branch on the
// remote, through a worktree. The point of the worktree is that the owner's
// tree is never touched, so a routine can run unattended while they work.
//
// The bug this guards against is in `finish`: it pushed `HEAD`, and `HEAD`
// in the script's own directory is the main working tree's commit — the
// owner's, not the routine's. So the branch on the remote came back holding
// somebody else's work and the routine's own commit was left behind, and
// the helper still printed `STATUS=pushed`. Measured on 22 November 2026:
// the branch on origin came back holding c51e44f, the main tree's commit,
// and not bf59de2, the commit the run had just made.
//
// The tests here use a throwaway repository and a throwaway remote. Nothing
// reaches the network.
//
//   node --test scripts/check-git-ship.test.mjs

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");
const HELPER = path.join(ROOT, "ops/seo/pulse/git-ship.sh");

const GIT_ENV = {
  ...process.env,
  GIT_AUTHOR_NAME: "Test",
  GIT_AUTHOR_EMAIL: "test@example.com",
  GIT_COMMITTER_NAME: "Test",
  GIT_COMMITTER_EMAIL: "test@example.com",
};

function git(cwd, args) {
  const result = spawnSync("git", args, { cwd, encoding: "utf8", env: GIT_ENV });
  if (result.status !== 0) {
    throw new Error(`git ${args.join(" ")} failed:\n${result.stdout}\n${result.stderr}`);
  }
  return (result.stdout || "").trim();
}

function run(cwd, cmd, args) {
  const result = spawnSync(cmd, args, { cwd, encoding: "utf8", env: GIT_ENV });
  return {
    code: result.status,
    out: `${result.stdout || ""}${result.stderr || ""}`,
  };
}

/// A repository with a remote, the helper in place, and a commit on main
/// that has been pushed — and a second commit on main that has not.
function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "git-ship-"));
  const repo = path.join(root, "repo");
  const remote = path.join(root, "remote.git");

  fs.mkdirSync(path.join(repo, "ops/seo/pulse"), { recursive: true });
  fs.copyFileSync(HELPER, path.join(repo, "ops/seo/pulse/git-ship.sh"));
  fs.chmodSync(path.join(repo, "ops/seo/pulse/git-ship.sh"), 0o755);
  // The real .gitignore, so the fixture is the repository as it ships: the
  // helper writes its log into the tree it runs in, and the tree is meant to
  // ignore it.
  fs.copyFileSync(path.join(ROOT, ".gitignore"), path.join(repo, ".gitignore"));
  fs.writeFileSync(path.join(repo, "thing.txt"), "one\n");

  git(root, ["init", "--bare", "-b", "main", remote]);
  git(repo, ["init", "-b", "main"]);
  git(repo, ["remote", "add", "origin", remote]);
  git(repo, ["add", "-A"]);
  git(repo, ["commit", "-m", "the base commit"]);
  git(repo, ["push", "-u", "origin", "main"]);

  // The owner's work: a commit on the main tree that is not on the remote.
  fs.writeFileSync(path.join(repo, "owner.txt"), "the owner's own work\n");
  git(repo, ["add", "-A"]);
  git(repo, ["commit", "-m", "the owner's unpushed work"]);

  return { root, repo, remote };
}

/// The commit a ref on the remote points at.
function remoteSha(remote, ref) {
  return git(remote, ["rev-parse", ref]);
}

test("the helper puts the run's own commit on the branch", () => {
  // The case that matters. The main tree is on a commit of its own — the
  // owner's, unpushed — and the branch is created off the remote's main.
  // The branch on the remote has to come back holding the run's commit.
  const { repo, remote } = fixture();
  const ownerSha = git(repo, ["rev-parse", "HEAD"]);

  const start = run(repo, "bash", ["ops/seo/pulse/git-ship.sh", "start", "run-branch"]);
  assert.equal(start.code, 0, `start failed:\n${start.out}`);
  const worktree = start.out.match(/WORKTREE=(.+)/)[1].trim();

  fs.writeFileSync(path.join(worktree, "thing.txt"), "two\n");

  const finish = run(repo, "bash", ["ops/seo/pulse/git-ship.sh", "finish", "run-branch"]);
  assert.equal(finish.code, 0, `finish failed:\n${finish.out}`);
  assert.match(finish.out, /STATUS=pushed/);

  const branchSha = remoteSha(remote, "refs/heads/run-branch");
  // The helper removes the worktree once the push succeeds, so the run's
  // commit is read from what the helper reported rather than from the
  // directory it has already cleaned up.
  const runSha = finish.out.match(/SHA=([0-9a-f]{40})/)[1];

  assert.equal(
    branchSha,
    runSha,
    "the branch on the remote holds something other than the run's commit"
  );
  assert.notEqual(
    branchSha,
    ownerSha,
    "the branch on the remote holds the main working tree's commit"
  );
});

test("the branch on the remote carries the change the run made", () => {
  // The commit is the right one; this is the other half of it. The file the
  // run edited in the worktree has to be on the branch, and the owner's own
  // unpushed commit must not be.
  const { repo, remote } = fixture();

  const start = run(repo, "bash", ["ops/seo/pulse/git-ship.sh", "start", "run-branch"]);
  const worktree = start.out.match(/WORKTREE=(.+)/)[1].trim();
  fs.writeFileSync(path.join(worktree, "thing.txt"), "two\n");

  const finish = run(repo, "bash", ["ops/seo/pulse/git-ship.sh", "finish", "run-branch"]);
  assert.equal(finish.code, 0, `finish failed:\n${finish.out}`);

  const onBranch = git(remote, ["show", "refs/heads/run-branch:thing.txt"]);
  assert.equal(onBranch, "two", "the run's change is not on the branch");

  const files = git(remote, ["ls-tree", "--name-only", "refs/heads/run-branch"]);
  assert.ok(
    !files.includes("owner.txt"),
    "the owner's unpushed work travelled to the branch"
  );
});

test("the helper leaves the main working tree alone", () => {
  // The worktree exists so the owner's tree is never touched. The main tree's
  // commit and its files have to be exactly as they were.
  const { repo } = fixture();
  const before = git(repo, ["rev-parse", "HEAD"]);
  const status = git(repo, ["status", "--porcelain"]);

  const start = run(repo, "bash", ["ops/seo/pulse/git-ship.sh", "start", "run-branch"]);
  const worktree = start.out.match(/WORKTREE=(.+)/)[1].trim();
  fs.writeFileSync(path.join(worktree, "thing.txt"), "two\n");
  const finish = run(repo, "bash", ["ops/seo/pulse/git-ship.sh", "finish", "run-branch"]);
  assert.equal(finish.code, 0, `finish failed:\n${finish.out}`);

  assert.equal(git(repo, ["rev-parse", "HEAD"]), before, "the main tree's commit moved");
  assert.equal(git(repo, ["status", "--porcelain"]), status, "the main tree's files changed");
});

test("the helper reports where the worktree was", () => {
  // A caller needs the path to edit in, and the branch name to finish with.
  const { repo } = fixture();
  const start = run(repo, "bash", ["ops/seo/pulse/git-ship.sh", "start", "run-branch"]);
  assert.equal(start.code, 0, `start failed:\n${start.out}`);
  assert.match(start.out, /WORKTREE=.+/);
  assert.match(start.out, /BRANCH=run-branch/);
  assert.ok(fs.existsSync(start.out.match(/WORKTREE=(.+)/)[1].trim()));
});
