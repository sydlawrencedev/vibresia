# MCP directories

Where Vibresia's MCP servers are listed, and the copy to paste when a
directory asks for it. Two servers:

- **Remote**: `https://vibresia.com/mcp`, streamable HTTP, no sign-in.
- **Local**: the app binary run with `--mcp`, stdio, macOS only.

## Status

| Directory | Server | How | Status |
|---|---|---|---|
| Official MCP Registry | remote | `mcp-publisher publish` | Live as `com.vibresia/music-visualizer` 1.1.0 |
| PulseMCP | remote | Copies the official registry | Waiting on their sync |
| awesome-remote-mcp-servers | remote | PR | [jaw9c/awesome-remote-mcp-servers#1912](https://github.com/jaw9c/awesome-remote-mcp-servers/pull/1912) |
| Claude Connectors Directory | remote | claude.ai/directory/manage, paid plan | To do: needs you signed in |
| ChatGPT apps | remote | OpenAI Platform dashboard | To do: needs org verification, a demo video, domain token |
| Glama | both | glama.ai, sign in with GitHub, Add server | To do: `glama.json` is in the repo |
| awesome-mcp-servers (punkpeye) | local | PR, with the Glama badge | After Glama |
| Smithery | remote | smithery.ai, sign in | To do |
| mcp.so | both | mcp.so/submit (free, reviewed) | To do |
| mcpservers.org | both | mcpservers.org/submit (free, reviewed) | To do: asks for a contact email |
| Cursor directory | both | cursor.directory | To do |

To publish a new version to the official registry, bump `version` in
`server.json`, then:

```bash
mcp-publisher login http --domain vibresia.com --private-key "$(security find-generic-password -s vibresia-mcp-registry -a vibresia.com -w)"
mcp-publisher publish
```

## Copy

Vary the opening line between directories rather than pasting the same text
everywhere.

**Name:** Vibresia

**One-liner (≤200):** A music visualiser your assistant can write: describe a
look, get back a live GLSL vibescape that moves with the music, as a link that
plays in any browser.

**Short (≤100):** Music visualiser (visualizer): write live GLSL music
visualisations, shared as links that play.

**Description:**

Vibresia is a music visualiser. Its visuals are vibescapes: small GLSL
programs that draw one function, `vec3 render(vec2 p, float t)`, driven by the
bass, the mids, the treble and the beat of whatever is playing.

Connect the server and ask for a music visualisation in plain words — "a neon
tunnel that pulses on the kick", "slow ink in water for ambient tracks". The
assistant reads the vibescape reference, writes the shader, checks it with the
linter, and hands back a link. The link is live: the page runs the vibescape in
the browser with WebGL, so it plays for anyone it is sent to, with or without
the app.

New vibescapes are unlisted. Asking the assistant to share one puts it in the
public gallery at vibresia.com/vibescapes, which the assistant can also browse
for ideas or adapt.

No account and no sign-in. Vibresia is also a free macOS app that listens to
the system audio directly; the `get_app` tool has the download link.

**Categories:** Design, Creative / Art, Music, Entertainment

**Tools:** `create_vibescape`, `share_vibescape`, `list_vibescapes`,
`get_vibescape`, `lint_vibescape`, `vibescape_reference`, `get_palette`,
`get_app`. Every tool has a title and read-only/destructive annotations.

**Links**

- Website and docs: https://vibresia.com/agents
- Privacy: https://vibresia.com/privacy
- Terms: https://vibresia.com/terms
- Support: https://github.com/sydlawrencedev/vibresia/issues
- Repository: https://github.com/sydlawrencedev/vibresia
- Icon: https://vibresia.com/favicon.svg

**Reviewer access:** none needed; the server has no sign-in.

## Test prompts (ChatGPT asks for these)

Should use the server:

1. "Make me a music visualiser that looks like a neon tunnel pulsing on the bass." → `vibescape_reference`, `create_vibescape`; returns a live link.
2. "Show me some music visualisations other people have made." → `list_vibescapes`; returns names, authors and links.
3. "Take this vibescape and make it calmer: vibresia.com/s/abc123" → `get_vibescape`, `create_vibescape`.
4. "Check this shader works as a vibescape before I share it." → `lint_vibescape`; reports problems such as ignoring the music.
5. "Put my vibescape in the public gallery." → `share_vibescape` on the id, after confirming the name and author.

Should not use the server:

1. "Visualise this sales data as a bar chart." → data charts, not music visuals.
2. "Write me a song about the sea." → music writing, not visualisation.
3. "Recommend some albums like Kid A." → music recommendations, nothing to draw.
