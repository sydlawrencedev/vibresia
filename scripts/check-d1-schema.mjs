#!/usr/bin/env node
// Checks that the Worker and the database agree.
//
// Two things can go wrong, and both of them are silent until they are not:
//
//   1. The Worker asks for a column the database does not have. The share
//      API degrades: a share is still made, but without the key that finds
//      it again, without the capability that lets its maker list it, and
//      without the hash that finds it without reading every row in the
//      table. The API answers "ok" the whole time.
//
//   2. The Worker does not ask for a column the database has. That one is
//      harmless, but it is a sign the two have drifted, and the drift is
//      what (1) comes from.
//
// The migrations in migrations/ are the source of truth for what the table
// looks like. This reads them, works out the column set, and checks that
// every column the Worker mentions exists.
//
//   node scripts/check-d1-schema.mjs
//
// It takes no arguments and talks to nothing: it is a static check, so it
// runs in CI and in release.sh, and it cannot be affected by which
// database happens to be deployed.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, "..");
const MIGRATIONS = path.join(ROOT, "migrations");
const WORKER = path.join(ROOT, "worker");

/// The columns the table has, worked out from the migrations.
///
/// `ALTER TABLE ... ADD COLUMN` adds one; `CREATE TABLE ... ( ... )`
/// creates them all. The migrations are applied in order, so reading them
/// in order gives the table as it is.
export function columnsFromMigrations(dir = MIGRATIONS) {
  const columns = new Set();
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();
  for (const file of files) {
    const sql = fs.readFileSync(path.join(dir, file), "utf8");
    for (const match of sql.matchAll(/ALTER\s+TABLE\s+\w+\s+ADD\s+COLUMN\s+(\w+)/gi)) {
      columns.add(match[1]);
    }
    for (const match of sql.matchAll(/CREATE\s+TABLE(?:\s+IF\s+NOT\s+EXISTS)?\s+\w+\s*\(([\s\S]*?)\n\);/gi)) {
      for (const line of match[1].split("\n")) {
        const column = line.trim().match(/^(\w+)\s+/);
        if (column) columns.add(column[1]);
      }
    }
  }
  return columns;
}

/// The columns the Worker's SQL mentions.
///
/// Every `shares` query is looked at. A column name is a word that follows
/// a table name in a query, or that is set by an UPDATE, or that comes back
/// from a SELECT. The simplest honest way to find them is to ask SQLite's
/// own parser — which is what the queries are written for — but that means
/// running them, and these queries run against a database that may not be
/// here. So they are read as text.
/// The words a column name cannot be.
///
/// SQL keywords turn up where a column would be if the query is read as
/// plain text — `CASE WHEN image IS NULL THEN 0 ELSE 1 END` starts with
/// `CASE`, which is not a column.
const SQL_WORDS = new Set([
  "AND", "AS", "ASC", "BETWEEN", "BY", "CASE", "DESC", "ELSE", "END", "FROM",
  "GROUP", "HAVING", "IN", "IS", "LIKE", "LIMIT", "NOT", "NULL", "OR", "ORDER",
  "SELECT", "SET", "THEN", "WHEN", "WHERE",
]);

export function columnsUsedByWorker(dir = WORKER) {
  const used = new Map(); // column -> the file and line that uses it
  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith(".js")) continue;
    const lines = fs.readFileSync(path.join(dir, file), "utf8").split("\n");
    lines.forEach((line, index) => {
      if (!/\bshares\b/i.test(line)) return;
      const note = (name) => {
        if (!/^\w+$/.test(name)) return;
        if (SQL_WORDS.has(name.toUpperCase())) return;
        used.set(name, `${file}:${index + 1}`);
      };
      // `SELECT a, b FROM shares` — the columns before FROM.
      const select = line.match(/SELECT\s+(.+?)\s+FROM\s+shares/i);
      if (select) {
        for (const part of select[1].split(",")) {
          note(part.trim().split(/\s+/)[0]);
        }
      }
      // `UPDATE shares SET a = ?, b = ?` — the columns after SET.
      const update = line.match(/UPDATE\s+shares\s+SET\s+(.+?)(?:\s+WHERE|$)/i);
      if (update) {
        for (const part of update[1].split(",")) {
          note(part.trim().split("=")[0].trim());
        }
      }
      // `WHERE a = ?` — the columns after WHERE.
      const where = line.match(/WHERE\s+(.+)$/i);
      if (where) {
        for (const part of where[1].split(/\s+AND\s+/i)) {
          note(part.trim().split(/[\s=<>]/)[0]);
        }
      }
      // `INSERT INTO shares (a, b, c) VALUES (?, ?, ?)` — the columns in the
      // list. Without this a column named only in an INSERT is not noticed,
      // and the Worker writes a row the database does not have a column for.
      //
      // The list is read across the whole statement, because the Worker's
      // INSERT is a string concatenation: the columns are on the first line
      // and the VALUES on the next.
      const insert = line.match(/INSERT\s+INTO\s+shares\s*\(([^)]*)\)/i);
      if (insert) {
        for (const part of insert[1].split(",")) {
          note(part.trim().split(/\s+/)[0]);
        }
      }
    });
  }
  return used;
}

/// The columns the Worker uses that the database does not have.
export function missingColumns(columns, used) {
  const missing = [];
  for (const [column, where] of used) {
    if (!columns.has(column)) missing.push({ column, where });
  }
  return missing;
}

export function check() {
  const columns = columnsFromMigrations();
  const used = columnsUsedByWorker();
  const missing = missingColumns(columns, used);
  return { columns, used, missing };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { columns, used, missing } = check();
  if (missing.length) {
    console.error("The Worker asks for columns the database does not have:");
    for (const { column, where } of missing) {
      console.error(`  ${column} — ${where}`);
    }
    console.error("");
    console.error("The migrations in migrations/ are the source of truth. Either the");
    console.error("migration that adds the column has not been written, or it has not");
    console.error("been applied:");
    console.error("");
    console.error("  npx wrangler d1 migrations apply vibresia-shares --remote");
    console.error("");
    console.error("Do that before deploying the Worker. A Worker that asks for a column");
    console.error("the database does not have still answers, and the answer is wrong in");
    console.error("a way nobody notices until a share cannot be found again.");
    process.exit(1);
  }
  console.log(`The Worker's ${used.size} share columns all exist in the schema (${columns.size} columns in the migrations).`);
}
