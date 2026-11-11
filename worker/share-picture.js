// The picture a share gets when the browser draws one.
//
// A share made by the Mac app carries its own picture: the app renders the
// vibescape on the GPU, brands it and uploads the JPEG. A share made by an
// agent — through the MCP server — has no picture at all, because the
// server has no GPU to draw one with and the agent has no Mac to draw it
// on.
//
// So the picture is drawn where the drawing can happen: in the browser of
// whoever opens the share page. The page renders the vibescape with WebGL,
// exactly as it already does for the person looking at it, and posts the
// frame it drew. The next visitor, and every link preview crawler that
// runs the page, gets a picture of the actual vibescape.
//
// This file holds the two ends of that: the capability the Worker mints so
// the page may fill an empty picture, and the check that the bytes it was
// given are a picture at all.

// The capability that lets a browser fill an empty picture.
//
// The page cannot hold the app's token — that ships inside the app, and
// putting it on the public web would let any script fill any share's
// picture. And it cannot hold the share's own capability, because that
// belongs to whoever made the share and is not in the link.
//
// So the Worker mints a short-lived one of its own when it serves the
// share page, and puts it in the page. It says: this page may fill this
// share's picture, once, for the next hour.
//
// It is deliberately weak. It cannot prove the picture is a rendering of
// this vibescape — the server has no GPU and cannot check the pixels — so
// it says nothing about who is asking. What it does say is enough to stop
// the two things that matter:
//
//   * The picture can only ever go into a slot that is empty. A share
//     that has a real picture of it keeps it, so nothing here can replace
//     a true picture with a false one.
//
//   * The capability is bound to one share and to that share's payload, so
//     it cannot be taken from one share's page and used on another's, and
//     it stops working when the share is republished.
//
// The residual risk — somebody posting a picture that is not a rendering of
// the vibescape they are filling in — is the same risk the app's own
// upload already carries: the app's token is in a bundle anybody can
// download, so that path can write any picture into any share too. The
// difference is that this one only ever writes into an empty slot.

/// How long a picture capability lasts.
///
/// Long enough for a page to be opened, drawn and posted, even on a slow
/// connection. Short enough that a capability left in a page's source is
/// not a standing key to the site's database.
export const PICTURE_CAPABILITY_TTL_SECONDS = 3600;

/// The capability for filling one share's picture.
export async function makePictureCapability(secret, id, payloadHash) {
  const expires = Math.floor(Date.now() / 1000) + PICTURE_CAPABILITY_TTL_SECONDS;
  const body = `${id}.${payloadHash}.${expires}`;
  const signature = await sign(secret, body);
  return `${body}.${signature}`;
}

/// Whether a capability is one this Worker minted, and whether it is for
/// this share and this payload, and whether it has run out.
export async function checkPictureCapability(secret, capability, id, payloadHash) {
  if (typeof capability !== "string" || !capability) return false;
  const parts = capability.split(".");
  if (parts.length !== 4) return false;
  const [capId, capHash, expires, signature] = parts;
  if (capId !== id || capHash !== payloadHash) return false;
  const expiresAt = Number(expires);
  if (!Number.isFinite(expiresAt) || expiresAt * 1000 < Date.now()) return false;
  const expected = await sign(secret, `${capId}.${capHash}.${expires}`);
  return timingSafeEqual(signature, expected);
}

/// A short signature over a string, with the secret as the key.
///
/// HMAC rather than a bare hash, so the secret cannot be recovered from
/// the signature the way it could with `hash(secret + body)`.
async function sign(secret, body) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  return Array.from(new Uint8Array(mac))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

/// Whether two strings are the same, without letting the comparison say
/// where they differ.
function timingSafeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  if (a.length !== b.length) return false;
  let difference = 0;
  for (let index = 0; index < a.length; index += 1) {
    difference |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return difference === 0;
}

/// The size of a JPEG, read out of its own header.
///
/// The bytes are checked before they are stored: the database holds them
/// as a picture, and the page serves them back as `image/jpeg` to whatever
/// asks. A file that claims to be a JPEG and is not would be served as
/// one, so the claim is checked rather than trusted.
///
/// This reads the frame header rather than decoding the picture: the size
/// is in the header, and decoding a 400KB JPEG to learn two numbers is
/// work the Worker does not need to do.
export function jpegSize(bytes) {
  // Every JPEG starts with the start-of-image marker.
  if (!bytes || bytes.length < 4) return null;
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;
  let offset = 2;
  while (offset + 3 < bytes.length) {
    if (bytes[offset] !== 0xff) {
      // Not a marker: the file is not a JPEG.
      return null;
    }
    const marker = bytes[offset + 1];
    // Padding: any number of 0xff bytes may sit before a marker.
    if (marker === 0xff) {
      offset += 1;
      continue;
    }
    // Standalone markers: no length follows them.
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      offset += 2;
      continue;
    }
    // The end of the picture.
    if (marker === 0xd9) return null;
    const length = (bytes[offset + 2] << 8) | bytes[offset + 3];
    // A frame header: SOF0..SOF15, except the ones that are not frames
    // (DHT is 0xc4, JPG is 0xc8 and DAC is 0xcc).
    const isFrame = marker >= 0xc0 && marker <= 0xcf
      && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
    if (isFrame) {
      if (offset + 9 >= bytes.length) return null;
      const height = (bytes[offset + 5] << 8) | bytes[offset + 6];
      const width = (bytes[offset + 7] << 8) | bytes[offset + 8];
      if (width <= 0 || height <= 0) return null;
      return { width, height };
    }
    offset += 2 + length;
  }
  return null;
}
