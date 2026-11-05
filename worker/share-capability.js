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
export async function editKeyMatches(env, id, editKey) {
  if (!editKey) return false;
  const row = await env.SHARES.prepare("SELECT edit_key FROM shares WHERE id = ?")
    .bind(id).first();
  if (!row || !row.edit_key) return false;
  return row.edit_key === await hashEditKey(editKey);
}
