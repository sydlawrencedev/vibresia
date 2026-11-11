// Tests for the schema check.
//
// The check itself lives in check-d1-schema.mjs, which is also a command the
// CI and the release script run. These tests were in that file, where the
// test runner never found them: the suite globs "scripts/*.test.mjs", and a
// file called "check-d1-schema.mjs" does not match it. So the tests sat
// there, unrun, and one of them failed when it was run by hand.

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import {
  check,
  columnsFromMigrations,
  columnsUsedByWorker,
} from "./check-d1-schema.mjs";

test("the migrations give the columns the Worker asks for", () => {
  const { missing } = check();
  assert.deepEqual(missing, [], `missing columns: ${missing.map((m) => m.column).join(", ")}`);
});

test("the schema really does have the columns the share API needs", () => {
  const columns = columnsFromMigrations();
  for (const column of [
    "id", "payload", "name", "author", "image", "created_at",
    "key", "payload_hash", "is_public", "revision", "edit_key", "admin_edited",
  ]) {
    assert.ok(columns.has(column), `the migrations do not add ${column}`);
  }
});

test("a column used only in an INSERT is still noticed", () => {
  // An INSERT names its columns in a list rather than after SET or WHERE,
  // so it needs its own scan. Without it, a column that appears nowhere
  // else would not be checked against the schema — and the Worker would
  // fail at runtime with "no such column" the first time it made a share.
  const scratch = fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), "d1-"));
  try {
    fs.mkdirSync(path.join(scratch, "worker"));
    fs.writeFileSync(path.join(scratch, "worker", "index.js"), [
      'const q = "INSERT INTO shares (id, payload, a_column_only_here) VALUES (?, ?, ?)"',
    ].join("\n"));
    const used = columnsUsedByWorker(path.join(scratch, "worker"));
    assert.ok(used.has("a_column_only_here"),
      "a column named only in an INSERT was not noticed");
  } finally {
    fs.rmSync(scratch, { recursive: true, force: true });
  }
});

test("the Worker's own INSERT columns are all noticed", () => {
  // The real Worker writes a row with this list. Every column in it has to
  // be checked against the migrations, or the check is not checking the
  // thing that breaks.
  const used = columnsUsedByWorker();
  for (const column of ["id", "payload", "name", "author", "image", "is_public", "created_at"]) {
    assert.ok(used.has(column), `the Worker's INSERT columns are missing ${column}`);
  }
});
