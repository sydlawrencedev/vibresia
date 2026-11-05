// The caps on what one share can be.
//
// The HTTP share API and the public MCP server write to the same table, so
// the caps live here and both import them. Two definitions of "too big" is
// how the MCP server ends up with a quota burner of its own: the HTTP path
// caps a payload at sixteen kilobytes, and the MCP path had no cap at all.
//
// A share is a row with a payload and, at most, a picture in it. The caps
// are what stops one request writing a megabyte of somebody else's text
// into a table that is meant to hold a vibescape.

export const MAX_PAYLOAD_CHARS = 16384;
export const MAX_NAME_CHARS = 120;
export const MAX_AUTHOR_CHARS = 120;
export const MAX_IMAGE_BYTES = 400 * 1024;
export const MAX_KEY_CHARS = 128;

/// The key a vibescape's content hashes to.
///
/// This is the same key the Mac app computes (`ShareIdentity.key`): SHA-256
/// over the fields that make a vibescape what it is, with each field's
/// byte length in front of it, so no two different vibescapes can produce
/// the same key by moving text between the fields.
///
/// The app sends this key when it shares, so the site can find the row that
/// already holds this vibescape. The public MCP server writes to the same
/// table, so it has to store the same key — otherwise an agent-made
/// vibescape and the app-made copy of the same thing are two rows and two
/// links, and every app-side re-share of it scans the whole table looking
/// for a match it cannot index.
///
/// The author is normalised the way the app normalises it: an empty author
/// is Minith Labs, because that is what it is called on screen.
export async function shareIdentityKey({ name, author, url, shader }) {
  const shown = String(author ?? "").trim() || "Minith Labs";
  let text = "";
  for (const field of [String(name ?? ""), shown, String(url ?? ""), String(shader ?? "")]) {
    text += `${new TextEncoder().encode(field).length}:${field}`;
  }
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
