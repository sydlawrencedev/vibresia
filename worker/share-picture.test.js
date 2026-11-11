// Tests for the picture capability and the picture check.
//
// The capability is what lets a browser fill a share's empty picture, and
// the JPEG reader is what stops the bytes being stored without being a
// picture. Both are pure, so both are tested on their own.

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  makePictureCapability, checkPictureCapability, jpegSize,
} from "./share-picture.js";

const SECRET = "picture-secret-for-tests";
const OTHER_SECRET = "a-different-secret";
const ID = "abc234";
const HASH = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

test("a capability the Worker made is one the Worker accepts", async () => {
  const capability = await makePictureCapability(SECRET, ID, HASH);
  assert.equal(await checkPictureCapability(SECRET, capability, ID, HASH), true);
});

test("a capability signed with another secret is not accepted", async () => {
  const capability = await makePictureCapability(SECRET, ID, HASH);
  assert.equal(await checkPictureCapability(OTHER_SECRET, capability, ID, HASH), false);
});

test("a capability for one share does not work on another", async () => {
  const capability = await makePictureCapability(SECRET, ID, HASH);
  assert.equal(await checkPictureCapability(SECRET, capability, "zzz999", HASH), false);
});

test("a capability for one payload does not work on another", async () => {
  const capability = await makePictureCapability(SECRET, ID, HASH);
  const other = "f".repeat(64);
  assert.equal(await checkPictureCapability(SECRET, capability, ID, other), false);
});

test("a capability that has run out is not accepted", async () => {
  // One that says it ran out an hour ago.
  const expired = `${ID}.${HASH}.${Math.floor(Date.now() / 1000) - 3600}.deadbeef`;
  assert.equal(await checkPictureCapability(SECRET, expired, ID, HASH), false);
});

test("rubbish is not a capability", async () => {
  for (const rubbish of ["", "nonsense", "a.b.c", "a.b.c.d.e", null, undefined, 42]) {
    assert.equal(await checkPictureCapability(SECRET, rubbish, ID, HASH), false,
                 `accepted ${JSON.stringify(rubbish)}`);
  }
});

test("a capability with its signature changed is not accepted", async () => {
  const capability = await makePictureCapability(SECRET, ID, HASH);
  const parts = capability.split(".");
  const tampered = [parts[0], parts[1], parts[2], "0".repeat(64)].join(".");
  assert.equal(await checkPictureCapability(SECRET, tampered, ID, HASH), false);
});

test("two capabilities for the same share are both accepted", async () => {
  // The page is served once per visitor, so there is more than one.
  const first = await makePictureCapability(SECRET, ID, HASH);
  const second = await makePictureCapability(SECRET, ID, HASH);
  assert.equal(await checkPictureCapability(SECRET, first, ID, HASH), true);
  assert.equal(await checkPictureCapability(SECRET, second, ID, HASH), true);
});

// --- the picture itself ----------------------------------------------------

/** A JPEG header with the size in it, and the picture's bytes after it.
 *
 *  A segment's length field counts itself, so an APP0 segment with a
 *  length of 16 is sixteen bytes from the marker onwards: two of length
 *  and fourteen of payload.
 */
function jpegWithSize(width, height) {
  return Uint8Array.from([
    0xff, 0xd8,                        // start of image
    0xff, 0xe0, 0x00, 0x10,            // an app segment, which comes first
    ...new Array(14).fill(0),
    0xff, 0xc0, 0x00, 0x11, 0x08,      // the frame header
    (height >> 8) & 0xff, height & 0xff,
    (width >> 8) & 0xff, width & 0xff,
    0x03, 0x01, 0x11, 0x00, 0x02, 0x11, 0x01, 0x03, 0x11, 0x01,
    0xff, 0xd9,                        // end of image
  ]);
}

test("the size of a JPEG is read out of its header", () => {
  assert.deepEqual(jpegSize(jpegWithSize(1200, 630)), { width: 1200, height: 630 });
  assert.deepEqual(jpegSize(jpegWithSize(640, 360)), { width: 640, height: 360 });
});

test("something that is not a JPEG has no size", () => {
  assert.equal(jpegSize(Uint8Array.from([1, 2, 3, 4])), null);
  assert.equal(jpegSize(Uint8Array.from([])), null);
  assert.equal(jpegSize(null), null);
  assert.equal(jpegSize(undefined), null);
  // A PNG: it starts with a different marker.
  assert.equal(jpegSize(Uint8Array.from([0x89, 0x50, 0x4e, 0x47])), null);
});

test("a JPEG with nothing in it has no size", () => {
  // Just the start-of-image marker, and nothing else.
  assert.equal(jpegSize(Uint8Array.from([0xff, 0xd8])), null);
  assert.equal(jpegSize(Uint8Array.from([0xff, 0xd8, 0xff, 0xd9])), null);
});
