# SEO changelog

Every change that could move a page in search: what changed, on which URL,
for which queries, and why. Newest first. It's how a ranking change gets
explained later (docs/seo.md, Phase 6). Log the deploy date when a change goes
live, not the commit date.

Recurring dates:

- **January each year**: refresh every page with the year in its title or
  URL. For a URL with the year in it, publish the new year's URL and 301 the
  old one. First due January 2027.
- **Quarterly**: re-check prices in `content/data/competitors.json`. First due
  February 2027.
- **Monthly**: Search Console review (positions 11-20 with impressions;
  low click-through on page one; one query, several URLs).
- **August 2027**: the validator starts warning about records checked on
  2026-11-02; it fails them in November 2027.
- **Eight weeks after launch**: decide which `later` rows in
  `content/url-plan.csv` to build, from impressions.

## 2026-11-02 (not yet deployed): batch 5, three more spokes, footer, routines

- Spokes for Amazon Music, Deezer and VLC, researched by three sub-agents.
  VLC is the one app with its own visualiser (Audio, then Visualizations;
  VideoLAN's docs), so its page shows how to turn it on; the hub now says so.
  Verdict tables leave out a row that has no fact (VLC has no web player).
- Check by hand: Amazon's main help pages couldn't be read; its facts come
  from Amazon-owned help mirrors and an Apple forum thread, and whether its
  Mac app is still offered is unclear.
- Footer links "Visualizers for every music app" (the hub) on every page.
- Routines: the monthly SEO review now proposes a CTA experiment for any
  template past 1,000 visits a month; a new quarterly routine re-checks
  competitor prices (1 Feb, May, Aug, Nov) and opens an issue.

## 2026-11-02 (merged 2026-11-02, not yet deployed): batch 4, question pages

Template 2d, the first of its kind, so it waits for Syd's approval before it
merges. Hub `/blog/apple-music-visualizer` ("does apple music have a
visualizer") with a live Vibresia scene drawn in the browser by
`site/share/preview.js`, following the microphone if the reader allows it
(nothing recorded or sent). Spokes for Spotify, YouTube Music, SoundCloud,
TIDAL and Mixcloud, each with a verdict table computed from
`content/data/music-apps.json`.

- App facts were researched by five sub-agents in parallel and merged by the
  lead agent. No service documents a visualiser except Apple's Music app,
  so pages say "not that we could find", not "no".
- Check by hand before merging (the build prints these): SoundCloud's and
  TIDAL's help centres block automated reading, so their facts come from
  search snippets; TIDAL's macOS minimum disagrees (14 on its page, 12 in
  Homebrew). Apple Music's web player fact needs its page confirmed.
- Mixcloud has no autocomplete demand; built at Syd's request. Prune first if
  it gets no impressions.
- New "later" spokes with demand: Amazon Music, VLC, Deezer.
- Spokes need 300 words plus the computed table (Phase 5); hubs and
  comparisons stay at 600.

## 2026-11-02 (not yet deployed): schema, author and reel

- Every indexable page now carries one shared `Organization` (Minith Labs,
  `https://minithlabs.com/#org`) and `WebSite` node from
  `content/data/schema.json`, and an `FAQPage` whose questions are visible
  on the page. New FAQs on the homepage, `/agents`, `/comparison`, the
  author page and all 18 `/share/{scene}` pages. `scripts/check-schema.mjs`
  (in `npm test` and the release script) fails any indexable page without
  them. Noindex pages (privacy, terms, `/vibe`, `/vibescapes`, `/share/`,
  `/s/{id}`) are skipped.
- Author: `content/data/author.json`, from Syd's answers to five questions.
  Byline now "a visual artist and developer who makes Vibresia"; the Person
  schema gains jobTitle, description, image (GitHub avatar), knowsAbout and
  LinkedIn and X in sameAs. `/author/syd-lawrence` is now generated, with a
  bio and a list of every search page.
- The homepage demo reel (`media/demo-low.mp4`, poster first) is on every
  search page under the table, loaded only when scrolled near, so it doesn't
  slow the first paint. Its first play is counted as `demo_played`.

## 2026-11-02 (deployed 2026-11-02): batch 3

Four more head-to-heads, chosen by "{competitor} alternative(s)" demand in
Google autocomplete (2026-11-02), where Vibresia is a real answer for the
searcher. Author: Syd Lawrence.

| URL | Target query | Title |
| --- | --- | --- |
| `/comparison/vibresia-vs-projectm` | projectm alternative | projectM Alternative for Mac (2026): Vibresia vs projectM |
| `/comparison/vibresia-vs-plane9` | plane9 alternatives | Plane9 Alternative for Mac (2026): Vibresia vs Plane9 |
| `/comparison/vibresia-vs-magic-music-visuals` | magic music visuals alternative | Magic Music Visuals Alternative (2026): Vibresia vs Magic |
| `/comparison/vibresia-vs-shadertoy` | shadertoy alternative | Shadertoy Alternative for Music (2026): Vibresia vs Shadertoy |

- Magic Music Visuals and Shadertoy block automated reading with a human
  check, so their records come from third-party pages (Wikipedia; a 2021
  VintageSynth article) and are marked `"via": "third-party"`. Their pages
  say so in the sources section, and the price cell reads "Not confirmed"
  rather than guessing. Magic's prices (found only in 2020-2021 sources)
  are left out until someone confirms them on its site.
- Demand without a head-to-head: Resolume, Winamp, VDMX, NestDrop,
  Specterr and VideoSync. Their searchers want a VJ tool, a music player or
  a music-video maker, which Vibresia isn't. Resolume stays a "later"
  referee list.
- All six head-to-heads link to each other and to `/comparison`.
- `docs/seo.md` gained "How an agent runs this": which gates need a person,
  what done means, git, first-wave volume, and delegating to sub-agents.
  2c now lives at `/comparison/{product}-vs-{competitor}` and covers the
  singular "{competitor} alternative" query.

Checked live on 2026-11-02: the four pages and the updated hub return 200
with their own canonical and JSON-LD; `/sitemaps/comparisons.xml` lists 7
URLs; `llms.txt` lists every comparison.

Core Web Vitals, 2026-11-02 (lab, in a browser at 375px, not throttled; the
PageSpeed Insights API was over its keyless daily quota): best-of and
head-to-head pages are about 65 KB in total with no layout shift (CLS 0) and
a 30-170 ms time to first byte. The two render-blocking requests are the
Google Fonts stylesheet and `/chrome.css`. Paint timings need a foreground
tab or PageSpeed Insights; take field data from Search Console once the
pages have traffic.

`docs/seo.md` also gained "Keep the playbook moving": five qualifying
questions at the end of every step.

## 2026-11-02 (deployed 2026-11-02): batch 2

Template 2c, head-to-heads at `/comparison/vibresia-vs-{competitor}`. Author:
Syd Lawrence. These replace the planned "{competitor} alternatives" lists for
Synesthesia and TouchDesigner: just the two apps, the case for Vibresia, and
who should pick the other one.

| URL | Target query | Title | Schema |
| --- | --- | --- | --- |
| `/comparison/vibresia-vs-synesthesia` | synesthesia free alternative | Synesthesia Alternative for Mac (2026): Vibresia vs Synesthesia | Article, BreadcrumbList, SoftwareApplication x2, FAQPage |
| `/comparison/vibresia-vs-touchdesigner` | touchdesigner alternatives for mac | TouchDesigner Alternative (2026): Vibresia vs TouchDesigner | Article, BreadcrumbList, SoftwareApplication x2, FAQPage |

- New sitemap `/sitemaps/comparisons.xml`, listed in `robots.txt`; both
  pages in `llms.txt`.
- Synesthesia's record gained a pricing section (Standard US$199, Pro
  US$399, one-time; the page shows "$" with no currency code). The best-of
  page's price cell for Synesthesia changed from "Free to try; paid plans on
  its site" to "US$199, one-time", and it links to the new comparison.
- Resolume stays a "later" referee list, with no head-to-head: its
  searchers want another VJ tool, and Vibresia isn't one.
- New hub `/comparison` lists every head-to-head, is in the comparisons
  sitemap and is linked from every page's footer. Each head-to-head links to
  the hub and to every other head-to-head ("More comparisons").
- New check `scripts/check-links.mjs` (in `npm test` and the release
  script): every sitemap page must be reachable from the homepage, and no
  internal link may lead nowhere. Deepest sitemap page is two clicks from
  the homepage.
- Price cells for an app with a free tier beside paid ones now read "Free
  version; paid from ..." instead of "Free" (TouchDesigner on the hub).

## 2026-11-02 (deployed 2026-11-02): batch 1

Batch 1 of `content/url-plan.csv`. Template 2a. Author: Syd Lawrence.

| URL | Target query | Title | Schema |
| --- | --- | --- | --- |
| `/blog/best-music-visualizer-for-mac-2026` | best music visualizer for mac | Best Music Visualizer for Mac (2026): 7 Apps Compared | Article, BreadcrumbList, ItemList, FAQPage |
| `/blog/milkdrop-alternatives-mac-2026` | milkdrop alternative for mac | MilkDrop Alternatives for Mac (2026): 5 Options Compared | Article, BreadcrumbList, ItemList, FAQPage |
| `/blog/does-milkdrop-work-on-mac` | does milkdrop work on mac | Does MilkDrop Work on Mac? No, but Its Presets Can | Article, BreadcrumbList, FAQPage |
| `/author/syd-lawrence` | (author page) | Syd Lawrence, who makes Vibresia | ProfilePage, Person |

- Links: every page's footer links to the first two; each search page links
  to the other two and to the author page.
- New sitemap `/sitemaps/blog.xml`, listed in `robots.txt`. The author page
  is in `/sitemap.xml`.
- The three pages are listed in `llms.txt` under "Comparisons".
- Download links carry `src=seo-{slug}-{top|bottom}`. Every event on a
  search page carries `template` (from `<meta name="seo-template">`), and
  `download_clicked` adds `slug`.
- Analytics go through `/ingest/batch/` on vibresia.com (the Worker passes
  them to PostHog), so blocklists that name PostHog's host don't skew one
  template against another. Every site page now points there.
- First touch: the first pageview sets `$initial_pathname` and
  `$initial_referring_domain` on the person.
- PostHog dashboard "Search pages by template" (Shareware project):
  visits, download click rate, per-page totals and server-counted
  downloads. Search Console (`sc-domain:vibresia.com`) is connected and
  syncing by page, query, and query and page; its tile is added once those
  tables have data.
- Demand evidence: Google autocomplete on 2026-11-02 (no volume data).
- Competitor facts checked 2026-11-02, from each app's own pages.

Checked live on 2026-11-02: every page above, the `/comparison` hub and the
author page return 200 with their own canonical and JSON-LD; the three
sitemaps and `robots.txt` serve; Googlebot and GPTBot get 200; `/ingest`
forwards to PostHog (a GET is 405, any other path 404). `.html` URLs and a
trailing slash redirect to the clean URL with a 307 (Cloudflare's asset
handling), and the canonical tags name the clean URL.

Still to do: submit `/sitemap.xml`, `/sitemaps/blog.xml` and
`/sitemaps/comparisons.xml` in Search Console, and note the first
impressions here.
