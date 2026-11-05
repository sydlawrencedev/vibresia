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
