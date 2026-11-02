# SEO playbook: where we are

Status of running `docs/seo.md` on vibresia.com, written so a new session can
carry on. Last updated 2026-11-02. Update it at the end of every batch.

## How to continue

Start a session with:

> Read `docs/seo.md` (especially "How an agent runs this" and section 7),
> `seo-playbook-status.md`, `SEO_CHANGELOG.md` and `content/url-plan.csv`,
> then carry on from "Next" in the status file. You may commit, merge to main
> and push when every check passes; deploying is mine. End each step with
> five qualifying questions.

Working rules the owner has set:
- Commit, fast-forward main and push when the checks pass, without asking.
  Deploying (`npx wrangler deploy` from the main checkout) is the owner's.
- At the end of every step, say which phase is next, and ask five
  multiple-choice qualifying questions with the recommendation first.
- Use sub-agents for research and page drafts; the lead agent keeps shared
  files and git.
- First page of a new template: the owner reviews it before it merges.

## Checks (all must pass before a push)

```
npm test
node scripts/check-competitors.mjs
node scripts/generate-seo-pages.mjs --check
node scripts/check-links.mjs          # no orphans, no broken internal links
node scripts/check-schema.mjs         # Organization + WebSite + visible FAQ on every indexable page
python3 scripts/inject-chrome.py --check
```

Then look at new pages in the browser pane at 375px and desktop (the
`site-static` preview in `.claude/launch.json`, port 8765). The pane only
paints when a screenshot is taken, so scroll-triggered code looks stuck
until then.

## What exists

| Template | Pages | State |
| --- | --- | --- |
| 2a best-of / alternatives | best-music-visualizer-for-mac-2026, milkdrop-alternatives-mac-2026, does-milkdrop-work-on-mac | live |
| 2c head-to-heads (`/comparison/vibresia-vs-*`) | synesthesia, touchdesigner, projectm, plane9, magic-music-visuals, shadertoy; hub `/comparison` | live |
| 2d question pages (`/blog/*-visualizer-mac`) | hub apple-music-visualizer (live mic scene); spotify, youtube-music, soundcloud, tidal, mixcloud | merged, deploy pending |
| 2d spokes, batch 5 | amazon-music, deezer, vlc; footer link to the app hub | merged (465e1c4), deploy pending |
| 2b referee pairs (`/comparison/{a}-vs-{b}`) | projectm-vs-milkdrop (third option on), nestdrop-vs-milkdrop, resolume-vs-vdmx, resolume-vs-touchdesigner, touchdesigner-vs-vdmx | merged, deploy pending |

Also: author page `/author/syd-lawrence` (from `content/data/author.json`),
FAQs and the shared Organization node on every indexable page, the demo reel
on search pages, `/ingest` analytics proxy in the Worker.

## Where things live

- Generator: `scripts/generate-seo-pages.mjs` (all templates, hubs, author page, sitemaps). Page files: `content/pages/*.mjs` (`_spoke.mjs` is a shared helper, not a page).
- Data: `content/data/competitors.json` (validated), `music-apps.json` (2d facts), `competitor-pairs.json` (2b), `author.json`, `schema.json`. Truth sheet: `content/product-truth.md`.
- Plan and log: `content/url-plan.csv`, `SEO_CHANGELOG.md`.
- Hub scene shader: `content/scenes/hub-live.glsl`, drawn by `site/share/preview.js` (which now takes `opts.listen`).
- Drafting brief for referee pages: written to the scratchpad; the shape is in docs/seo.md section 7 if it's needed again.

## Analytics and routines

- PostHog project **Shareware** (673583) is vibresia.com's (the default
  project in the MCP is Delphina: switch, then switch back). Dashboard
  "Search pages by template": https://us.posthog.com/project/673583/dashboard/2294411
- Search Console (`sc-domain:vibresia.com`) is connected to that project;
  its search-analytics tables hadn't synced on 2026-11-02.
- Routines (claude.ai/code/routines):
  - Monthly SEO review, 1st of the month 09:00 UTC, opens an issue; proposes an A/B test for any template past 1,000 visits a month. `trig_014UpUam21FE9oR5JB8uqWg6`
  - Quarterly competitor price check (1 Feb, May, Aug, Nov). `trig_01N9mGgp8FMcPCBvpicQ6Cum`
  - One-off: Search Console tile on the dashboard, 2026-11-16. `trig_01UX55wbk72PTFqYKCVRe5i8`
  - One-off: January year refresh, opens a PR, 2027-01-04. `trig_015pS73aiN5WUNNRT3XnhqxU`

## Decisions on record

- No head-to-head for Resolume, Winamp, VDMX, NestDrop, Specterr, VideoSync:
  their searchers want a different kind of tool. Resolume stays a "later"
  referee list.
- MilkDrop alternatives stays a list (no MilkDrop on a Mac to compare against).
- Mixcloud spoke built without demand evidence, at the owner's request: prune
  first if it gets no impressions.
- Stats page (2e) approved, using aggregated anonymous usage only (rounded,
  groups under 50 left out, privacy page linked).
- Snippet-sourced facts (TIDAL, SoundCloud, Amazon Music, Apple Music web
  player) shipped as is, flagged `needsHandCheck`; the build lists them.
- The owner hasn't tested competitor apps; pages say so.

## Next

1. Owner deploys batches 4-6 (question pages, spokes, referee pages); then check the new pages live and fill in deploy dates in
   `SEO_CHANGELOG.md`.
2. Stats page (2e) from anonymous usage in PostHog project Shareware.
3. Resolume alternatives referee list (2a) if the owner wants it.
4. Fill limits and I/O (MIDI, OSC, Syphon, Spout, NDI) in the VJ records
   (Resolume, VDMX, TouchDesigner, NestDrop) so the referee pages can compare
   them directly.
5. After 8 weeks (from early January 2027): decide what to build more of
   from the monthly review's per-template numbers.
