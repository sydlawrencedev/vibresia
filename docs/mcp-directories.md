# MCP directories

Where Vibresia's MCP servers are listed, and the copy to paste when a
directory asks for it. Two servers:

- **Remote**: `https://vibresia.com/mcp`, streamable HTTP, no sign-in.
- **Local**: the app binary run with `--mcp`, stdio, macOS only.

## Status

| Directory | Server | How | Status |
|---|---|---|---|
| Official MCP Registry | remote | `mcp-publisher publish` | Live as `com.vibresia/music-visualizer` 1.1.0. The Worker was redeployed on 2026-11-03, so the server now reports that same 1.1.0 in `serverInfo` — it used to say 1.0.0 |
| PulseMCP | remote | Copies the official registry | Waiting on their sync |
| awesome-remote-mcp-servers | remote | PR | [punkpeye/awesome-remote-mcp-servers#3723](https://github.com/punkpeye/awesome-remote-mcp-servers/pull/3723), opened 2026-11-03. Under **Multimedia**, next to the other music servers. CI green. The first attempt, [jaw9c#1912](https://github.com/jaw9c/awesome-remote-mcp-servers/pull/1912), was against a fork that stopped being maintained in September 2026; it is closed |
| Claude Connectors Directory | remote | claude.ai/directory/manage, paid plan | In review as "Vibresia Music Visualiser" (slug `vibresia-music-visualiser`), submitted 2026-11-02 |
| ChatGPT apps | remote | platform.openai.com/plugins, upload a ZIP of `chatgpt-plugin/` | Package ready. Waiting on Minith Labs organisation verification (started 2026-11-02); then a demo video link, the domain token at `/.well-known/openai-apps-challenge`, and the category the checks ask for |
| Glama (hosted) | remote | Imported from the official registry; claimed via `/.well-known/glama.json` | Ownership verified, healthy since 2026-11-02 (Cloudflare had been blocking its checker with a 403 until the bot setting was changed) |
| Glama (source) | local | glama.ai, Add Server, Runs from source | Submitted for review 2026-11-02. Glama will ask for a Dockerfile, which a macOS app can't provide |
| awesome-mcp-servers (punkpeye) | local | PR, under **Art & Culture**, with the Glama badge | [punkpeye/awesome-mcp-servers#18447](https://github.com/punkpeye/awesome-mcp-servers/pull/18447), opened 2026-11-03. CI green: `has-glama`, `has-emoji`, `valid-name`. The badge is at `glama.ai/mcp/servers/sydlawrencedev/vibresia`, which resolves |
| Smithery | — | — | Closed to submissions: since 2026-10-31 it is a curated, read-only directory run by Arcade, with no accounts |
| mcp.so | remote | Free review request as a GitHub issue (the site's form only offers the $39 option) | [chatmcp/mcpso#6615](https://github.com/chatmcp/mcpso/issues/6615) |
| mcpservers.org | remote | mcpservers.org/submit, free plan, contact syd@minithlabs.com | Submitted 2026-11-02; review within 2 weeks, approval comes by email |
| Cursor directory | remote | cursor.directory, Submit a plugin, Manual, MCP Server component | Submitted 2026-11-02 at [cursor.directory/plugins/vibresia-music-visualiser](https://cursor.directory/plugins/vibresia-music-visualiser); hidden until its security scan finishes. No logo yet |
| Cursor Marketplace | remote | cursor.com/marketplace/publish, submit the repo URL | Manifest committed at `.cursor-plugin/plugin.json` with `mcp.json` at the repository root. Not submitted yet; reviews are slow |
| Docker MCP Catalog | remote | docker/mcp-registry, remote route, `task remote-wizard` | Not started. The remote route needs no Dockerfile: `type: remote`, `transport_type: streamable-http`, no OAuth |
| Gemini CLI extension gallery | remote | The `gemini-cli-extension` topic plus `gemini-extension.json` at the repository root | Committed. The topic is on the repo, so the daily crawler will find it. It appears once a tag is pushed |

To publish a new version to the official registry, bump `version` in
`server.json`, then:

```bash
mcp-publisher login http --domain vibresia.com --private-key "$(security find-generic-password -s vibresia-mcp-registry -a vibresia.com -w)"
mcp-publisher publish
```

`server.json` is the one place the server's version is written down. The
Worker reads it and reports it in `serverInfo`, and the plugin manifests
below repeat it — so a bump means editing one file and the copies beside it:

| File | What it is |
|---|---|
| `server.json` | The official MCP Registry's entry. Also served at `/.well-known/mcp.json`. The source of the version. |
| `mcp.json` | The client config: how a cursor or an editor connects to `https://vibresia.com/mcp`. |
| `.cursor-plugin/plugin.json` | The Cursor plugin manifest. Cursor finds `mcp.json` at the repository root on its own. |
| `gemini-extension.json` | The Gemini CLI extension manifest. Same endpoint, spelled `httpUrl` because that is Gemini's name for it. |
| `chatgpt-plugin/` | The ChatGPT apps package, uploaded as a ZIP rather than read from the repository. |
| `glama.json` | Proves the Glama connector listing is ours. Served with the claim at `/.well-known/glama.json`. |

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
