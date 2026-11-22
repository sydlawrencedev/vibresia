// Tests for the user agent check: node --test scripts/check-posthog-user-agent.test.mjs
//
// The check answers one question: does each surface tell PostHog which user
// agent it is? An event with no user agent is classified as automation, so a
// person who opened the site is filed under the wrong heading and drops out
// of every PostHog view filtered to human traffic.
//
// The tests here do not reach the network. They hand the check a set of
// source files, because the decision being made is "does this file send the
// property", and that decision does not need PostHog to make it.
//
//   node --test scripts/check-posthog-user-agent.test.mjs

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");
const CHECK = path.join(HERE, "check-posthog-user-agent.py");

/// Runs the check and returns what it printed and whether it failed.
function runCheck(args = [], { cwd = ROOT } = {}) {
  const result = spawnSync("python3", [CHECK, ...args], { cwd, encoding: "utf8" });
  return {
    code: result.status,
    out: `${result.stdout || ""}${result.stderr || ""}`,
  };
}

/// A throwaway tree with the three files the check reads.
function fixture({ js = "", swift = "", worker = "" } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "posthog-ua-"));
  fs.mkdirSync(path.join(root, "site"));
  fs.mkdirSync(path.join(root, "worker"));
  fs.mkdirSync(path.join(root, "VisualiserMac/Sources/VisualiserMac/Analytics"), {
    recursive: true,
  });
  fs.writeFileSync(path.join(root, "site/analytics.js"), js);
  fs.writeFileSync(
    path.join(root, "VisualiserMac/Sources/VisualiserMac/Analytics/Analytics.swift"),
    swift
  );
  fs.writeFileSync(path.join(root, "worker/index.js"), worker);
  return root;
}

const GOOD_JS = `function baseProperties() {
  var props = {
    surface: "web",
    $raw_user_agent: navigator.userAgent
  };
  return props;
}`;

const GOOD_SWIFT = `private func defaultProperties() -> [String: Any] {
  var props: [String: Any] = [
    "surface": "mac_app",
    "$raw_user_agent": userAgent
  ]
  return props
}`;

const GOOD_WORKER = `function postDownloadEvent(env, { userAgent = "" }) {
  const event = {
    properties: {
      $raw_user_agent: userAgent
    }
  };
}`;

const ALL_GOOD = { js: GOOD_JS, swift: GOOD_SWIFT, worker: GOOD_WORKER };

test("the check passes when every surface sends a user agent", () => {
  const root = fixture(ALL_GOOD);
  const result = runCheck([root]);
  assert.equal(result.code, 0, `expected success, got:\n${result.out}`);
  assert.match(result.out, /all three surfaces send \$raw_user_agent/);
});

test("the check fails when a surface sends no user agent", () => {
  // This is the bug: the files that shipped. All three surfaces had no user
  // agent, so every event the project produced was classified as automation.
  const root = fixture({ ...ALL_GOOD, js: 'var props = { surface: "web" };' });
  const result = runCheck([root]);
  assert.equal(result.code, 1, `expected a failure, got:\n${result.out}`);
  assert.match(result.out, /site\/analytics\.js sends no user agent/);
});

test("the check fails when the Worker sends no user agent", () => {
  // The Worker's download count is the number this project is judged on. An
  // event with no user agent is invisible in every view filtered to human
  // traffic, so the count would read as zero where it matters most.
  const root = fixture({ ...ALL_GOOD, worker: 'const event = { properties: {} };' });
  const result = runCheck([root]);
  assert.equal(result.code, 1, `expected a failure, got:\n${result.out}`);
  assert.match(result.out, /worker\/index\.js sends no user agent/);
});

test("the check fails when a surface sends only the property that is ignored", () => {
  // `$user_agent` looks right and is not what the classifier reads. A client
  // that sends only that is still automation traffic.
  const root = fixture({
    ...ALL_GOOD,
    js: 'var props = { $user_agent: navigator.userAgent };',
  });
  const result = runCheck([root]);
  assert.equal(result.code, 1, `expected a failure, got:\n${result.out}`);
  assert.match(result.out, /\$user_agent, which the classifier ignores/);
});

test("the check fails when the user agent is sent empty", () => {
  // An empty string is no user agent at all, however well spelled the key is.
  const root = fixture({
    ...ALL_GOOD,
    js: 'var props = { $raw_user_agent: "" };',
  });
  const result = runCheck([root]);
  assert.equal(result.code, 1, `expected a failure, got:\n${result.out}`);
  assert.match(result.out, /sends \$raw_user_agent empty/);
});

test("the check reports every surface when all of them are wrong", () => {
  // Saying only one of them is half the answer, and the one that is left out
  // is the one that keeps shipping.
  const root = fixture({
    js: 'var props = { surface: "web" };',
    swift: 'var props: [String: Any] = ["surface": "mac_app"]',
    worker: 'const event = { properties: {} };',
  });
  const result = runCheck([root]);
  assert.equal(result.code, 1, `expected a failure, got:\n${result.out}`);
  assert.match(result.out, /site\/analytics\.js sends no user agent/);
  assert.match(result.out, /Analytics\.swift sends no user agent/);
  assert.match(result.out, /worker\/index\.js sends no user agent/);
});

test("a comment explaining the property does not trip the check", () => {
  // The comment that says why the property is there mentions the property.
  // Without comment stripping the check would fail on correct code, and
  // then somebody would delete the comment to make it pass.
  const root = fixture({
    ...ALL_GOOD,
    js: `// $raw_user_agent is what the classifier reads.
       var props = { $raw_user_agent: navigator.userAgent };`,
  });
  const result = runCheck([root]);
  assert.equal(result.code, 0, `expected success, got:\n${result.out}`);
});

test("the check fails when a file is missing", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "posthog-ua-empty-"));
  const result = runCheck([root]);
  assert.equal(result.code, 1, `expected a failure, got:\n${result.out}`);
  assert.match(result.out, /missing/);
});

test("the check passes on the tree it ships with", () => {
  // The real files, not a fixture. A check that only passes on a fixture
  // says nothing about the code it is guarding.
  const result = runCheck([ROOT]);
  assert.equal(result.code, 0, `expected success, got:\n${result.out}`);
});
