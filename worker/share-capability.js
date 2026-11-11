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

// There is deliberately no way to give a share that has no capability one.
//
// The shares that existed before the capability did cannot be claimed by
// their maker, because the maker and a stranger look the same from the
// server's side: the share id and the content key that finds the row are
// both public — they are in the link anybody can open. Letting the first
// person to ask claim the row would hand a stranger the ability to publish
// a new version of somebody else's vibescape, and every installed copy
// would load it.
//
// So a share made before the capability stays as it was made. The migration
// that added the capability says the same thing: "the shares that already
// exist have no edit key, so nobody can update them".

