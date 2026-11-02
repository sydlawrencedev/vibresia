# Vibresia: product truth

What every page, generator and writer reads before saying anything about
Vibresia. If copy and this sheet disagree, one of them is wrong: fix it,
don't write around it. Checked against the code and site on 2026-11-02.

**Owner:** Syd Lawrence (Minith Labs). Changes to this file need their OK.

## Where things live

- `{data}` = `content/data/`. Competitor records, pairs and anything else a
  page is built from. Not `site/`, because everything in `site/` is served to
  the public as it is.
- Generators live in `scripts/` and write HTML into `site/`.
- The URL plan is `content/url-plan.csv`; the SEO changelog is
  `SEO_CHANGELOG.md` at the repo root.

## What it is

A macOS app that turns whatever the Mac is playing into live visuals
("vibescapes") that move with the music. You can watch the built-in ones, write
your own, or have an AI assistant write one for you.

## What it does today

- **Listens to system audio** from any app (macOS system-audio capture), so it
  works with Spotify, Apple Music, a browser, a film. Also offers the
  microphone and a built-in demo tone as sources. No plug-in or browser
  extension.
- **Analyses on the Mac**: levels, bass/mids/treble, beat, tempo, the whole
  spectrum. Instrument detection uses Apple's built-in sound classifier
  (SoundAnalysis).
- **Notices track changes** in Apple Music and Spotify, and looks the title and
  artist up in Apple's public catalogue to get the genre.
- **18 built-in vibescapes**: Ribbons, Vortex, Silk Flight, Flux, Spectrum,
  Tunnel, Liquid, Kaleidoscope, Neon Wave, Machine, Warp, Constellation, Nyan
  Cat, Hamster Dance, Badger Badger, Whooping Llama, Dance Floor, The Band.
  Auto Scan cycles through them on the beat.
- **The Band**: a pixel-art band in ten genre sets; musicians walk on when
  their instrument is heard.
- **Write your own**: a vibescape is one GLSL function,
  `vec3 render(vec2 p, float t)`. The app compiles it, draws it and reports
  errors in plain words before it saves. Pointer, keyboard and MIDI keyboard
  are available as inputs.
- **AI assistants can write them**:
  - a local MCP server (the app binary run with `--mcp`, stdio) that can
    write, compile, preview and save, and can hear what's playing;
  - a remote MCP server at `https://vibresia.com/mcp`, no sign-in, that can
    write and lint a vibescape and return a link. It cannot draw, check that a
    shader compiles, or hear the Mac's music.
- **Share**: a short link (`vibresia.com/s/{id}`) that plays in any browser
  via WebGL, with or without the app. Optional public gallery at
  `/vibescapes`.
- **Export video**: the last ten seconds of a vibescape, with the music, as a
  movie in Downloads.
- **Updates itself**: checks on launch and hourly, installs from the menu.

## What it does not do

- **No Windows, Linux, iOS, iPadOS or Android version.** No Intel Mac support.
  Requires macOS 14.2 or later on Apple silicon.
- **No web app.** The browser plays shared vibescapes; it does not visualise
  your own music.
- **Not a DJ, VJ or live-performance tool.** No timeline, no MIDI/OSC/NDI/
  Syphon/Spout output, no projection mapping, no multi-output control.
  (Not verified as absent from every corner of the code: confirm before any
  page claims it either way.)
- **Doesn't edit, record or touch your music files.** It does not record
  audio, except the ten-second clip a user explicitly exports.
- **No Shazam matching in the shipped build.** The ShazamKit path is behind a
  build flag and off; genre from listening alone is the app's own heuristic.
- **No App Store listing.** Distributed via GitHub releases, the website and
  `install.sh`.
- **No account, no sign-in, no cloud sync.**

## Price and terms

- **Free.** Every feature, no trial, no expiry, no ads, no account, no
  subscription. Structured data: price `0`.
- **Optional donation** ("buy me a coffee", Stripe link). Changes nothing in
  the app. Never framed as an obligation (see `shareware.md`).
- **Open source, MIT licence.** The name and logo are not covered by MIT.
- "Proudly shareware: free to use, and yours to share" is the line. "Free and
  open source" is also true.

## Who it is for

- People who want something beautiful on a screen while music plays: at home,
  at a party, on a second display.
- Mac users nostalgic for iTunes Visualizer, Milkdrop or Winamp-era visuals.
- Creative coders and shader tinkerers who want music as input without
  building the audio side.
- People using AI coding assistants who want to make something visual by
  describing it.

## Who it is not for

- Anyone on Windows, Linux, mobile or an Intel Mac.
- Professional VJs who need outputs, mapping, timelines or MIDI/OSC control.
- Anyone who wants visuals inside a streaming app's own window.

## Privacy lines (copy must match `site/privacy.html`)

- Audio is analysed on the Mac and never uploaded, stored or transmitted.
- Track title and artist are sent to Apple's public catalogue for genre, when
  a music app announces them. Nothing else about the track.
- Anonymous usage statistics are on by default and can be switched off in the
  About panel. The switch stops usage stats and crash reports.
- Audio-source failures are reported even with the switch off (app state
  only, no audio).
- The website uses no cookies; Do Not Track is honoured; footer opt-out.

## Regulatory and legal lines

- No regulated domain. Comparative claims about other apps must be factual
  and sourced (UK CAP code, FTC, EU comparative-advertising rules).
- Don't use other products' logos. Product names in text for comparison are
  fine.
- Nyan Cat, Hamster Dance, Badger Badger and Whooping Llama are tributes to
  internet memes; don't use them in titles or ads as if they were Vibresia's
  own brands.

## Market and locale

- **Market:** worldwide, English-language. No country restriction.
- **Spelling:** British English ("visualiser", "colour"), except where a
  query is spelled the US way ("visualizer"), which is also the registry name.
- **Currency:** none needed (free). Donation is in whatever Stripe shows.
- **Dates:** "2 November 2026" in prose; ISO in data.
