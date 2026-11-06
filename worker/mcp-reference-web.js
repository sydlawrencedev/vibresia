// The reference the public web server hands out.
//
// The app's server and the website's server both explain the vibescape
// language, and they differ in what they can do with it.
//
// The app can draw a vibescape and hand back the picture, and it can read
// the music it is playing right now. The website cannot: there is no GPU
// there and nothing is playing.
//
// Before this was split, the web server handed agents a reference describing
// `preview_vibescape`, `preview_vibescape_animation`, `get_uniform_snapshot`
// and `what_i_hear` — none of which it has. An agent that read it and
// believed it would call a tool that does not exist, and the one thing this
// product does that no competitor does, look at the picture before believing
// it, collapsed on the one surface where somebody without a Mac can try it.
//
// So: the language is shared, and each server adds the part that is true of
// it. `worker/mcp-reference.js` keeps the app's copy verbatim, and
// `scripts/check-mcp-reference.py` still fails the release if the shared
// language drifts from the app's.

import { VIBESCAPE_REFERENCE_CORE } from "./mcp-reference.js";
import { VIBESCAPE_STYLE } from "./mcp-style.js";

export const VIBESCAPE_REFERENCE_WEB = VIBESCAPE_REFERENCE_CORE + `

## Look at it before you believe it

This server cannot draw. There is no GPU here and nothing is playing, so it
cannot hand you a picture of your shader and it cannot check that the shader
compiles.

The link it gives you back does both. The page draws the vibescape live in
the browser and animates it, so you can look at what you wrote, in motion,
before you send it to anybody. A shader that does not compile shows you the
compiler's own error rather than a blank picture.

The uniforms below still matter, because the picture on that page is driven
by them the same way the app drives it.

## Tune to the real numbers

The music this server can hear is the music you tell it about, and that is
all. There is no snapshot of live values to read and no genre detector to
ask, because nothing is playing here.

Write for the music you want, and use the uniforms as its shape: \`uBass\` for
the low end, \`uBeatStrength\` for what a kick feels like, \`uActive\` so the
picture rests when the room is quiet. Draw the same shader at \`uBass\` 0.1
and \`uBass\` 0.9 and look at both before you decide how much it should
react.

The genre is not only something to read. It is in the shader, as \`uGenre\`, so
a world can change shape with the music in a way the bass alone cannot manage
— a stage for jazz, a different sky for ambient, a harder edge for rock.` + VIBESCAPE_STYLE;

export default VIBESCAPE_REFERENCE_WEB;
