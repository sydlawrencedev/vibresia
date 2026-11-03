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

Before that, check the tools are there: `docs/seo-skills-required.md` lists the
agent skills the playbook needs, by phase, and the last section of it is a
command that prints `MISSING` for any skill that is not installed.

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
| 2d question pages (`/blog/*-visualizer-mac`) | hub apple-music-visualizer (live mic scene); spotify, youtube-music, soundcloud, tidal, mixcloud | live |
| 2d spokes, batch 5 | amazon-music, deezer, vlc; footer link to the app hub | live |
| 2b referee pairs (`/comparison/{a}-vs-{b}`) | projectm-vs-milkdrop (third option on), nestdrop-vs-milkdrop, resolume-vs-vdmx, resolume-vs-touchdesigner, touchdesigner-vs-vdmx | live |
| 2b referee pairs, batch 8 | resolume-vs-madmapper, resolume-vs-obs, resolume-vs-millumin, touchdesigner-vs-blender, touchdesigner-vs-vvvv | live |
| 2b referee pairs, batch 9 | vmix-vs-obs, vmix-vs-resolume, vmix-vs-wirecast, watchout-vs-resolume, qlab-vs-resolume, propresenter-vs-resolume, propresenter-vs-obs, propresenter-vs-vmix, houdini-vs-touchdesigner, madmapper-vs-touchdesigner, madmapper-vs-millumin | live |
| 2b referee pairs, batch 10 | qlab-vs-propresenter, touchdesigner-vs-notch, touchdesigner-vs-after-effects, vmix-vs-tricaster, vmix-vs-atem, watchout-vs-disguise, watchout-vs-pixera | live |
| 2d question pages, batch 10 | plex (has visualisers, behind Plex Pass), twitch (has none: its overlays are stream alerts) | merged, deploy pending |
| "Control and connections" table | on the VJ pairs, and the batch 8 and 9 pairs | live |

## The target: about 50 pages on the site, not 50 of anything

The playbook says "waves of about 50 pages per template", and that was read
literally for a while, which pushed the site towards comparisons and away from
everything else. The number that means something is **about 50 pages on the
site in total**, of whatever kind serve the audience, with the mix leaning
towards the pages that answer a question rather than the pages that compare
two rivals.

Current mix, 48 search pages plus three other indexable pages:

| Kind | Pages | Share |
| --- | --- | --- |
| Comparisons (2b, 2c) | 34 | 70% |
| Blog: best-of lists and question pages (2a, 2d) | 14 | 29% |
| Other indexable (home, agents, author) | 3 | 1% |

The next slots go to blog and question pages, not to more comparisons. The
comparison set is broad enough: 35 competitor records and 28 referee pairs
cover the VJ, live production and creative tools space. What is thin is the
"visualizer for {app}" cluster and the everyday guide questions a person
actually asks.

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
- The homepage (`site/index.html`) and the agents page (`site/agents.html`)
  still have em dashes in their hand-written copy. The generated pages and
  the footer don't, because the style rules ban them and a check enforces
  it. The homepage is the owner's voice, so that copy is theirs to change.
- The next wave of referee pairs came from fresh autocomplete demand rather
  than the URL plan, whose "later" rows are used up. The pairs with demand
  still unbuilt are listed under "Next".
- Church presentation software is out of scope, like Winamp. ProPresenter
  against EasyWorship and against Proclaim were researched and dropped: both
  are church tools, and a church's problem is lyrics and scripture on a
  screen, not visuals that react to the music. ProPresenter stays, because it
  is a general live video product used at concerts and events as well as in
  churches, and it is already in three pages.
- No separate page for plain "YouTube". Google's own autocomplete ranks
  "visualizer for youtube music" above "visualizer for youtube", so the
  YouTube Music page already targets the bigger of the two, and a second
  page for the same answer would be the thin duplicate the playbook warns
  about.
- A referee page is worth building when the searcher's market is one a Mac
  music visualiser could plausibly serve. That is the test EasyWorship and
  Proclaim failed, and the reason the comparison set has stopped growing.

## Next

1. Owner deploys batch 10 (seven referee pairs, and the question pages for
   Plex and Twitch), then checks the new pages live and fills in deploy dates
   in `SEO_CHANGELOG.md`.
2. Owner submits `/sitemaps/questions.xml` in Search Console with the
   other two, so each template's impressions can be read apart. The monthly
   review reports by template and needs the sitemaps to match.
3. Stats page (2e) from anonymous usage in PostHog project Shareware. It
   needs read access to that project: this session had only the public
   ingest key, which cannot read, and there is no personal key on this
   machine. Ask for a personal API key (phx_...) or for the PostHog MCP to
   be connected to OpenCode, which is where it has to be configured.
4. Owner tries one free tier and says what they saw, so a page can say
   "we tried it" instead of "not confirmed". OBS Studio, Blender, projectM
   and MilkDrop all have a free version that needs no card, and those four
   records are the ones whose first-hand claim a reader would most believe.
5. The next pages, leaning on blog and questions rather than comparisons.
   Demand found on 2026-11-03, in rough order of size:
   - "what is a music visualiser" and "what is a song visualizer": an
     explainer that answers the plainest question in the category and
     links to every spoke. "what a goom music visualizer" sits in the same
     cluster, so GooM is worth a record.
   - "how to make a music visualizer", and its variants in CapCut, DaVinci
     Resolve, Blender, After Effects and Premiere Pro: a guide page that
     shows the long way and then the short way.
   - "best free music visualizer", "best music visualizer for pc" and
     "for windows": a page for the platform, answered honestly, which
     Vibresia cannot serve because it is Mac only. Decide whether a page
     that says so is worth building before building it.
   - "best music visualizer for iphone", "for ipad", "for android" and
     "for apple tv": the site already has MuVis, Butterchurn and Phosphor
     records for these, so the records are ready.
6. The Resolume alternatives referee list (2a), which the URL plan has as a
   "later" row. With 35 records it could list real alternatives now, but
   the searchers want a VJ tool rather than a visualiser, so it may be a
   page with no path to Vibresia. The owner's call.
7. After 8 weeks (from early January 2027): decide what to build more of
   from the monthly review's per-template numbers.
