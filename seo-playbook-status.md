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
| 2b referee pairs, batch 8 | resolume-vs-madmapper, resolume-vs-obs, resolume-vs-millumin; touchdesigner-vs-blender and touchdesigner-vs-vvvv researched, pages to write | merged (3 pages), deploy pending |
| "Control and connections" table | on the VJ pairs, and the new batch 8 pairs | merged, deploy pending |

Also: author page `/author/syd-lawrence` (from `content/data/author.json`),
FAQs and the shared Organization node on every indexable page, the demo reel
on search pages, `/ingest` analytics proxy in the Worker.

## Where things live

- Generator: `scripts/generate-seo-pages.mjs` (all templates, hubs, author page, sitemaps). Page files: `content/pages/*.mjs` (`_spoke.mjs` is a shared helper, not a page).
- Data: `content/data/competitors.json` (validated), `music-apps.json` (2d facts), `competitor-pairs.json` (2b), `author.json`, `schema.json`. Truth sheet: `content/product-truth.md`.
- Plan and log: `content/url-plan.csv`, `SEO_CHANGELOG.md`.
- Hub scene shader: `content/scenes/hub-live.glsl`, drawn by `site/share/preview.js` (which now takes `opts.listen`).
- Drafting brief for referee pages: written to the scratchpad; the shape is in docs/seo.md section 7 if it's needed again.
- `scripts/check-sources.mjs` fetches every source a fact leans on and checks
  it stayed on the site we named and that the quote we recorded is on it.
  Needs the network, so it is not in `npm test`: run it when facts are added
  or a competitor moves a page.

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
- The VJ records (Resolume, VDMX, TouchDesigner, NestDrop) carry what each
  app can be wired into: MIDI, OSC, Syphon, Spout, NDI, DMX and video, each
  fact with its own source and date. The three VJ referee pages compare them
  side by side.
- "Not that we could find" is the wording when a product's own site doesn't
  document a protocol. It never says the product can't do it.
- A source URL that redirects to another site is a failure, not a detail:
  `check-sources.mjs` fails it. A typo turned `resolume.com` into
  `resolution.com`, which answers 200 and is a different company.
- One sitemap per template: `/sitemaps/questions.xml` for the question
  pages, `blog.xml` for the best-of lists, `comparisons.xml` for the
  head-to-heads and the hub. The monthly review reports by template and
  needs the sitemaps to match.

## Next

1. Owner deploys batches 4-8 (question pages, spokes, referee pages, the
   connections tables, the new questions.xml sitemap and three more referee
   pairs); then check the new pages live and fill in deploy dates in
   `SEO_CHANGELOG.md`. Submit `/sitemaps/questions.xml` in Search Console
   with the other two.
2. Write the two pages whose records are ready: `/comparison/touchdesigner-vs-blender`
   and `/comparison/touchdesigner-vs-vvvv`. Both pairs, both records and
   both URL plan rows are in place; only the page files are missing.
3. Stats page (2e) from anonymous usage in PostHog project Shareware. It
   needs read access to that project: this session had only the public
   ingest key, which cannot read. Ask for a personal API key, or for the
   PostHog MCP to be connected.
4. Resolume alternatives referee list (2a) if the owner wants it.
5. The wave after this one. The pairs with real demand that are still
   unbuilt: resolume-vs-propresenter, resolume-vs-vmix, resolume-vs-watchout,
   resolume-vs-qlab, touchdesigner-vs-after-effects, touchdesigner-vs-houdini,
   touchdesigner-vs-madmapper, touchdesigner-vs-notch, synesthesia-vs-mobius.
   Each needs its own sourced record first.
6. The 2d cluster has demand for pages Vibresia cannot serve: "visualizer for
   pc", "audio visualizer for rainmeter", "music visualizer for android",
   "music visualizer for car", "music visualizer for tv". Each is a page
   saying Vibresia is Mac only, so they bring little and cost a record each.
   Say whether to build them.
7. After 8 weeks (from early January 2027): decide what to build more of
   from the monthly review's per-template numbers.
