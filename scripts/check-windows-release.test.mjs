// Tests for the Windows release check: node --test scripts/check-windows-release.test.mjs
//
// The check answers one question: is the release asset the Worker points at
// actually published? Everything else it does is in service of that.
//
// The tests here do not reach the network. They hand the check a release
// record instead, because the decision being made is "is there a release,
// and does it have the file", and that decision does not need GitHub to
// make it. A test that reaches the network is a test that fails when
// GitHub is slow, and that starts failing for a reason nobody is looking
// at.
//
//   node --test scripts/check-windows-release.test.mjs

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");
const CHECK = path.join(HERE, "check-windows-release.py");

const ASSET =
  "https://github.com/sydlawrencedev/vibresia/releases/download/windows-v0.1.0/Vibresia-Windows-x64.zip";

/// Runs the check and returns what it printed and whether it failed.
function runCheck(args = [], { cwd = ROOT } = {}) {
  const result = spawnSync("python3", [CHECK, ...args], { cwd, encoding: "utf8" });
  return {
    code: result.status,
    out: `${result.stdout || ""}${result.stderr || ""}`,
  };
}

/// A throwaway tree with a Worker and a version file.
function fixture({ worker, version = "0.1.0\n" } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "win-release-"));
  fs.mkdirSync(path.join(root, "worker"));
  fs.mkdirSync(path.join(root, "VisualiserWindows"));
  fs.writeFileSync(
    path.join(root, "worker", "index.js"),
    worker ?? `const WINDOWS_RELEASE_ZIP =\n  "${ASSET}";\n`,
  );
  fs.writeFileSync(path.join(root, "VisualiserWindows", "VERSION"), version);
  return root;
}

/// A release record, in the shape GitHub's API returns one.
///
/// `null` is what a 404 is: there is no release under that tag at all,
/// which is a different failure from a release that exists without the
/// file in it.
function releaseRecord({ tag = "windows-v0.1.0", assets = [], prerelease = true, draft = false } = {}) {
  const file = path.join(
    fs.mkdtempSync(path.join(os.tmpdir(), "win-record-")),
    "release.json",
  );
  fs.writeFileSync(
    file,
    JSON.stringify(
      draft
        ? { tag_name: tag, draft: true, prerelease, assets: [] }
        : { tag_name: tag, draft: false, prerelease, assets: assets.map((name) => ({ name })) },
    ),
  );
  return file;
}

/// The record for a tag that was never published.
function absentRecord() {
  const file = path.join(
    fs.mkdtempSync(path.join(os.tmpdir(), "win-absent-")),
    "release.json",
  );
  fs.writeFileSync(file, "null");
  return file;
}

const PUBLISHED = releaseRecord({ assets: ["Vibresia-Windows-x64.zip", "Vibresia-Windows-x64.zip.sha256"] });

test("the check reads the asset URL out of the Worker's own source", () => {
  // A second copy of the URL in the check would be a second thing to
  // forget to update, and the whole point is that there is one copy.
  const root = fixture();
  const result = runCheck(["--release-json", PUBLISHED, root]);
  assert.match(result.out, /Configured asset: https:\/\/github\.com\//);
  assert.match(result.out, /Release tag:\s+windows-v/);
});

test("the check passes when the asset is published", () => {
  const root = fixture();
  const result = runCheck(["--check", "--release-json", PUBLISHED, root]);
  assert.equal(result.code, 0, `expected success, got:\n${result.out}`);
  assert.match(result.out, /The asset is published/);
});

test("the check fails when the release does not exist", () => {
  // A tag that was never published is a 404, which the check reads as "no
  // release". A file holding null is the same answer without the network.
  const absent = absentRecord();
  const root = fixture();
  const result = runCheck(["--check", "--release-json", absent, root]);
  assert.equal(result.code, 1, `expected a failure, got:\n${result.out}`);
  assert.match(result.out, /no published release/i);
  assert.match(result.out, /redirect to a 404/i);
});

test("the failure says how to publish it", () => {
  // A check that only says "no" costs somebody an hour.
  const absent = absentRecord();
  const root = fixture();
  const result = runCheck(["--check", "--release-json", absent, root]);
  assert.match(result.out, /git tag -a "windows-v0\.1\.0"/);
  assert.match(result.out, /git push origin windows-v0\.1\.0/);
});

test("the check reports without failing when it is not checking", () => {
  const absent = absentRecord();
  const root = fixture();
  const result = runCheck(["--release-json", absent, root]);
  assert.equal(result.code, 0, `expected success, got:\n${result.out}`);
  assert.match(result.out, /no published release/i);
});

test("the check fails when the release has no such asset", () => {
  // The release exists but the file in it is named something else, or is
  // not there at all. The redirect would land on a 404 inside a release
  // that looks fine.
  const wrongFile = releaseRecord({ assets: ["Vibresia-Windows-x64.zip.sha256"] });
  const root = fixture();
  const result = runCheck(["--check", "--release-json", wrongFile, root]);
  assert.equal(result.code, 1, `expected a failure, got:\n${result.out}`);
  assert.match(result.out, /has no Vibresia-Windows-x64\.zip/);
});

test("the check fails when the release is a draft", () => {
  // A draft release is not downloadable by anybody. It counts as absent.
  const draft = releaseRecord({ assets: ["Vibresia-Windows-x64.zip"], draft: true });
  const root = fixture();
  const result = runCheck(["--check", "--release-json", draft, root]);
  assert.equal(result.code, 1, `expected a failure, got:\n${result.out}`);
  assert.match(result.out, /no published release/i);
});

test("the check fails when the release is not a prerelease", () => {
  // The Mac app finds its updates through releases/latest. A Windows
  // release marked as the latest one would stop every Mac install from
  // updating, so the release is a prerelease and the check says so.
  const latest = releaseRecord({
    assets: ["Vibresia-Windows-x64.zip"],
    prerelease: false,
  });
  const root = fixture();
  const result = runCheck(["--check", "--release-json", latest, root]);
  assert.equal(result.code, 1, `expected a failure, got:\n${result.out}`);
  assert.match(result.out, /not marked as a prerelease/);
  assert.match(result.out, /releases\/latest/);
});

test("the check notices a tag that is not the version in the tree", () => {
  // A site serving a stale package looks exactly like a working one. The
  // version in the tree and the tag in the URL have to agree.
  const root = fixture({
    worker: `const WINDOWS_RELEASE_ZIP =\n  "https://github.com/sydlawrencedev/vibresia/releases/download/windows-v0.0.1/Vibresia-Windows-x64.zip";\n`,
    version: "0.1.0\n",
  });
  const stale = releaseRecord({
    tag: "windows-v0.0.1",
    assets: ["Vibresia-Windows-x64.zip"],
  });
  const result = runCheck(["--release-json", stale, root]);
  assert.match(result.out, /stale package/i);
  assert.match(result.out, /windows-v0\.0\.1/);
  assert.match(result.out, /windows-v0\.1\.0/);
});

test("the check fails when the tag is stale, even if the release is published", () => {
  // This is the case that matters. The stale release IS published and the
  // asset IS in it, so every other part of the check passes. Without this
  // the site would go on serving the old package to everybody who
  // downloads it, and nothing would notice: the file is there, the
  // redirect works, the count goes up.
  const root = fixture({
    worker: `const WINDOWS_RELEASE_ZIP =\n  "https://github.com/sydlawrencedev/vibresia/releases/download/windows-v0.0.1/Vibresia-Windows-x64.zip";\n`,
    version: "0.1.0\n",
  });
  const stale = releaseRecord({
    tag: "windows-v0.0.1",
    assets: ["Vibresia-Windows-x64.zip"],
  });
  const result = runCheck(["--check", "--release-json", stale, root]);
  assert.equal(result.code, 1, `expected a failure, got:\n${result.out}`);
  assert.match(result.out, /stale package/i);
});

test("the check fails when the tag is stale and the release is not published either", () => {
  const root = fixture({
    worker: `const WINDOWS_RELEASE_ZIP =\n  "https://github.com/sydlawrencedev/vibresia/releases/download/windows-v0.0.1/Vibresia-Windows-x64.zip";\n`,
    version: "0.1.0\n",
  });
  const result = runCheck(["--check", "--release-json", absentRecord(), root]);
  assert.equal(result.code, 1, `expected a failure, got:\n${result.out}`);
  // Both problems are reported: the package is the wrong one AND it is
  // not published. Saying only one of them is half the answer.
  assert.match(result.out, /stale package/i);
  assert.match(result.out, /no published release/i);
});

test("the check fails when the Worker has no Windows asset at all", () => {
  const root = fixture({
    worker: 'const RELEASE_ZIP = "https://example.com/Vibresia.zip";\n',
  });
  const result = runCheck(["--check", "--release-json", PUBLISHED, root]);
  assert.equal(result.code, 1, `expected a failure, got:\n${result.out}`);
  assert.match(result.out, /no WINDOWS_RELEASE_ZIP/);
});

test("the check fails when the configured URL is not a release URL", () => {
  // A URL that names no tag cannot be resolved to a release, and it would
  // 404 for every visitor. The check says so rather than reporting a
  // missing release for a tag it never had.
  const root = fixture({
    worker: 'const WINDOWS_RELEASE_ZIP =\n  "https://example.com/Vibresia-Windows-x64.zip";\n',
  });
  const result = runCheck(["--check", "--release-json", PUBLISHED, root]);
  assert.equal(result.code, 1, `expected a failure, got:\n${result.out}`);
  assert.match(result.out, /not a release URL/);
});
