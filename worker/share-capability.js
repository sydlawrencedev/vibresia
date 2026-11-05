// The capability that proves a share is yours.
//
// A share's maker keeps a random string on their own Mac. Only its hash is
// stored, so the table cannot be used to change anything. The app's token is
// not a capability: it ships inside the bundle, so anybody can read it out.
// The capability is the thing that says "this is the share I made".
//
// These live in their own file because both the share API and the public MCP
// server need them, and the MCP server is imported by the Worker — importing
// back from `index.js` would make a cycle.

/// The hash of a capability, which is what the server keeps.
export async function hashEditKey(editKey) {
  if (!editKey) return null;
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(editKey));
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

/// Whether a capability is the one this share's maker has.
///
/// A database without the `edit_key` column yet is treated as "no capability
/// matches", rather than throwing: the share API's other queries all treat
/// a missing column as a degraded-but-working database, and this one is on
/// the path every share takes.
export async function editKeyMatches(env, id, editKey) {
  if (!editKey) return false;
  try {
    const row = await env.SHARES.prepare("SELECT edit_key FROM shares WHERE id = ?")
      .bind(id).first();
    if (!row || !row.edit_key) return false;
    return row.edit_key === await hashEditKey(editKey);
  } catch (error) {
    console.log(`[share] could not read the capability of ${id}: ${error}`);
    return false;
  }
}

/// Whether this share has no capability yet.
///
/// The shares that existed before the capability did are in this state, and
/// they are the ones whose maker needs to be able to claim them.
export async function shareHasNoCapability(env, id) {
  try {
    const row = await env.SHARES.prepare("SELECT edit_key FROM shares WHERE id = ?")
      .bind(id).first();
    return !!row && !row.edit_key;
  } catch (error) {
    console.log(`[share] could not read the capability of ${id}: ${error}`);
    return false;
  }
}

/// Gives a share that has no capability the one the maker is holding.
///
/// Only ever called on a row with no capability at all: the shares that
/// existed before capabilities did. There is no owner to take it from, so
/// the first person to claim it with the content key that finds the row is
/// the maker of that share. A row that already has a capability is left
/// alone, so this can never take a share away from somebody.
export async function claimShareCapability(env, id, editKey) {
  if (!editKey) return false;
  const hash = await hashEditKey(editKey);
  try {
    const result = await env.SHARES.prepare(
      "UPDATE shares SET edit_key = ? WHERE id = ? AND edit_key IS NULL"
    ).bind(hash, id).run();
    return (result?.meta?.changes ?? 0) > 0;
  } catch (error) {
    console.log(`[share] could not give ${id} a capability: ${error}`);
    return false;
  }
}
