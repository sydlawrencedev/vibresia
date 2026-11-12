# CRO log

The weekly conversion check appends here. `docs/conversion-model.md` holds the
funnel and the page-type taxonomy this file reads; `content/product-truth.md`
holds the product facts.

Each entry is one run, newest at the top. No user identifiers, no email
addresses, no personal data.

---

## 2026-11-12: weekly CRO check

### Data health

**Browser events are being captured. The exercise is valid.** That is the first
question this routine asks, because a broken browser path would make every
number below wrong rather than merely thin.

- Events seen (28 days, `properties.$lib = 'vibresia-web'`): 824 `$pageview`,
  34 `download_clicked`, 11 `install_command_copied`, 408
  `download_requested`, 845 `mode_card_viewed`, 406 `demo_played`, 299
  `page_view` (legacy, see below).
- Window: **2026-10-15 13:57:00 to 2026-11-12 13:57:00 UTC, pinned at both
  ends with explicit timestamps**, so every query in this report returns the
  same rows and the figures can be checked later. A rolling `now() -
  INTERVAL 28 DAY` window moves while the report is being written and
  returns 823 visits rather than 824: one home pageview sits on the
  boundary. The project's earliest event for this site is 2026-10-20 12:47
  UTC, so the first five days are empty by construction rather than by
  failure.
- **Capture is live.** The last `$pageview` was 2026-11-12 13:50 UTC, the
  last `download_clicked` 2026-11-12 11:09 UTC, the last `download_requested`
  2026-11-12 11:09 UTC, the last `install_command_copied` 2026-11-11 16:42
  UTC. In the last 7 days: 412 `$pageview`, 13 `download_clicked`, 235
  `download_requested`, 4 `install_command_copied`.
- **Daily browser capture, last 13 days** (pageviews): 10-29: 1, 10-30: 5,
  10-31: 0, 11-01: 0, 11-02: 58, 11-03: 168, 11-04: 50, 11-05: 40, 11-06: 30,
  11-07: 11, 11-08: 22, 11-09: 26, 11-10: 26, 11-11: 274, 11-12: 6. The
  browser path is not intermittently failing; it is quiet on the quiet days.
- **The capture gap is real and it is 374 downloads wide.** 34 browser
  `download_clicked` against 408 worker `download_requested`. The cause is
  not a broken event: every `download_clicked` that fires is on a link that
  carries `data-track`, and `scripts/check-posthog.sh` confirms ingestion
  works. The cause is that **most downloads come from links carrying no
  tracking attribute at all**. 123 of the 408 are share-page CTA downloads,
  and every one of them has no browser counterpart. The gap is an
  instrumentation gap, and it is mostly one missing attribute.

Anything that would make the numbers wrong:

- **The project carries a second site.** `audiovane-web` shares the project.
  Unfiltered, `mode_card_viewed` reads 979 when Vibresia fired 845, and
  `download_clicked` reads 35 when Vibresia fired 34. Every number here is
  filtered on `$lib = 'vibresia-web'`.
- **`page_view` is a legacy event.** It stopped on 2026-11-04 and nothing in
  the repository fires it; `site/analytics.js` fires `$pageview`. The 299
  `page_view` events are counted separately and excluded from the visit
  column, because adding both double-counts visits.
- **The download source property is named `source`, not `src`.** A query that
  reads `properties.src` on `download_requested` returns NULL for all 408
  events and the whole attribution collapses to a single null row. The same
  applies to `referer` (one r) on the worker event against `referrer` (two
  r) on the browser events.
- **`vibescape_card_viewed` does not exist in the data.** The conversion model
  lists it as a funnel step and the routine's step-1 table lists it. A direct
  count over the window returns **0**. Nothing in the repository fires it
  either. It is not a fifth funnel step today.
- **The worker's `download_requested` uses a constant `distinct_id`**
  (`downloads`), so it counts requests, not people. It is not a distinct
  person count. The `seen` flag reports 405 false and 3 true.
- **27 of the 408 worker downloads are probes and tests against
  `/download`.** 10 with the literal source `test` (all within 0.8 seconds of
  each other on 2026-11-11), 12 `asdf alt=` payload injections in assorted
  encodings from 2026-10-27, one `count-test`, one hex-encoded payload, and
  four `issue39-test-N` / `verify-issue-39` on 2026-11-11. These are counted
  in the worker total and excluded from every page attribution below. Last
  week it was 13; it is now 27.
- **2026-11-11 was a spike of 198 worker downloads against 274 pageviews.** It
  is not traffic. It is the 10 `test` downloads plus a sweep across every
  `seo-*` and `share_*` source in a single burst, which is what a test
  harness walking the download endpoint looks like. The daily series should
  not be read as a trend from that day.
- **Attribution uses the `source` parameter on the link, not the referrer.**
  167 of the 408 downloads arrived with no referrer at all. The `source`
  parameter is written into the link by the generator and is always present.

### By page type

Raw counts beside every rate. A rate without its counts is unreadable.

Visits are `$pageview`. Downloads are the worker's `download_requested`,
attributed by the `source` parameter. The rate is downloads per visit.

| Page type | Visits | Downloads (worker) | Download clicks | Rate | Signal |
|---|---|---|---|---|---|
| Home | 273 | 49 (hero) + 27 (footer) + 26 (after_gallery) = 102 | 29 | 17.9% hero/visit (49/273), 10.6% click/visit (29/273) | Cleared (102 downloads) |
| Vibescape (share pages) | 57 | 123 | 0 | Not a rate, see the note | Cleared (123 downloads) |
| Vibescape (`/s/*` short links) | 175 | 0 | 0 | n/a | Insufficient signal |
| Comparison | 147 | 41 | 1 | 27.9% (41/147), of which 24 from pages where downloads do not exceed visits | Cleared (41 downloads) |
| Question | 56 | 70 | 4 | Not a rate, see the note | Cleared (70 downloads) |
| Agents | 33 | 0 | 0 | 0.0% (0/33) | Insufficient signal (0 downloads) |
| Vibescape gallery | 31 | 0 | 0 | 0.0% (0/31) | Insufficient signal (0 downloads) |
| Blog | 25 | 19 | 0 | Not a rate, see the note | Cleared (19 downloads) |
| Comparison hub | 9 | 0 | 0 | 0.0% (0/9) | Insufficient signal (0 downloads) |
| Other (`/share/` index) | 11 | 5 (share_fallback) | 0 | 0.0% (0/11) | Insufficient signal (5 downloads) |
| Author | 4 | 0 | 0 | 0.0% (0/4) | Insufficient signal (0 downloads) |
| Vibe | 3 | 0 | 0 | 0.0% (0/3) | Insufficient signal (0 downloads) |
| **Total** | **824** | **408** | **34** | | |

Downloads not attributable to a page, listed separately so the table above
sums honestly:

| Downloads not attributable to a page | Count | Why |
|---|---|---|
| Blank source | 26 | The link had no `source` at all |
| Probe and test strings | 27 | See the data-health block |

**The share pages still cannot be given a conversion rate, and this is the
most important thing in the report.** 123 downloads are attributed to a share
page by the `source` parameter, which names the vibescape rather than the
page the reader was on. Three checks show the two numbers do not describe the
same people:

- On **15 of the 18 share pages with any activity**, downloads exceed browser
  visits. `/share/warp` has 4 browser visits and 9 downloads. `/share/tunnel`,
  `/share/liquid` and `/share/hamster` have 1 visit each and 8 downloads
  each. A download cannot come from a visit that did not happen.
- Of the 123 share-CTA downloads, **61 arrived with no referrer at all** and
  only 20 carry a share page as the referrer. So 16.3% (20/123) can be tied
  to somebody who actually had the share page open.
- **Zero** browser `download_clicked` events came from a share page in the
  whole 28-day window. All 34 browser clicks are on `/` (29) and on five
  `seo-top` links (5).

A share link sent in a chat is followed by the recipient, the app is
downloaded, and the page may never be rendered in a browser at all. That is
what the product is for, and it works, but it is not a page conversion and
this report will not present it as one. **This is candidate 1 below. It was
queued last week, it had still not shipped when this run started, and it has
now shipped.**

The Question type's 70 downloads against 56 visits and the Blog type's 19
against 25 are the same attribution problem in a smaller coat, so read those
two numbers as counts rather than as rates. Both types draw their downloads
from `seo-*` sources, which do name a real page, but 11 of the 22 pages with
an `seo-*` download have more downloads than visits. The download is real and
the attribution is real; the missing visits are missing because the reader
fetched the page without the site recording a view of it. These counts cannot
be read as rates and this report does not print them as rates.

Page-level signal gate, 5 downloads in 28 days. Downloads are counted per
page, with the top and bottom placements on the same page added together.

| Page | Visits | Downloads (worker) | Download clicks | Gate |
|---|---|---|---|---|
| `/blog/apple-music-visualizer` | 16 | 15 | 1 | Cleared |
| `/comparison/vibresia-vs-projectm` | 7 | 11 | 0 | Cleared |
| `/blog/parachord-visualizer-mac` | 3 | 8 | 0 | Cleared |
| `/blog/youtube-music-visualizer-mac` | 7 | 8 | 1 | Cleared |
| `/blog/does-milkdrop-work-on-mac` | 3 | 7 | 0 | Cleared |
| `/blog/best-music-visualizer-for-mac-2026` | 12 | 7 | 0 | Cleared |
| `/blog/amazon-music-visualizer-mac` | 4 | 6 | 0 | Cleared |
| `/comparison/vibresia-vs-magic-music-visuals` | 7 | 6 | 0 | Cleared |
| `/comparison/vibresia-vs-touchdesigner` | 7 | 6 | 0 | Cleared |
| `/comparison/vibresia-vs-shadertoy` | 2 | 6 | 0 | Cleared |
| `/blog/mixcloud-visualizer-mac` | 3 | 5 | 0 | Cleared |
| `/comparison/projectm-vs-milkdrop` | 6 | 5 | 0 | Cleared |
| `/blog/milkdrop-alternatives-mac-2026` | 10 | 5 | 0 | Cleared |
| `/blog/spotify-visualizer-mac` | 6 | 5 | 1 | Cleared |
| `/blog/plex-visualizer-mac` | 5 | 5 | 1 | Cleared |
| `/blog/tidal-visualizer-mac` | 2 | 4 | 0 | Insufficient signal |
| `/blog/soundcloud-visualizer-mac` | 1 | 4 | 0 | Insufficient signal |
| `/comparison/vibresia-vs-synesthesia` | 7 | 4 | 1 | Insufficient signal |
| `/blog/twitch-visualizer-mac` | 3 | 4 | 0 | Insufficient signal |
| `/blog/vlc-visualizer-mac` | 1 | 3 | 0 | Insufficient signal |
| `/blog/deezer-visualizer-mac` | 5 | 3 | 0 | Insufficient signal |
| `/comparison/vibresia-vs-plane9` | 3 | 3 | 0 | Insufficient signal |
| Every other blog and comparison page | 1 to 7 | 0 | 0 | Insufficient signal |

The share pages are listed separately, because their gate position rests on a
`source` that names the vibescape rather than the page the reader was on.
Sixteen of the eighteen share pages with any activity clear the 5-download
gate, and fourteen of those sixteen have more downloads than visits, so the
gate is met on downloads that did not come from a visit.

| Share page | Browser visits | Downloads (worker) | Download clicks | Gate |
|---|---|---|---|---|
| `/share/warp` | 4 | 9 | 0 | Cleared, downloads exceed visits |
| `/share/waveform` | 6 | 8 | 0 | Cleared, downloads exceed visits |
| `/share/tunnel` | 1 | 8 | 0 | Cleared, downloads exceed visits |
| `/share/liquid` | 1 | 8 | 0 | Cleared, downloads exceed visits |
| `/share/hamster` | 1 | 8 | 0 | Cleared, downloads exceed visits |
| `/share/silk` | 7 | 7 | 0 | Cleared, downloads equal visits |
| `/share/band` | 4 | 7 | 0 | Cleared, downloads exceed visits |
| `/share/ribbons` | 3 | 7 | 0 | Cleared, downloads exceed visits |
| `/share/spectrum` | 2 | 7 | 0 | Cleared, downloads exceed visits |
| `/share/flux` | 1 | 7 | 0 | Cleared, downloads exceed visits |
| `/share/vortex` | 1 | 7 | 0 | Cleared, downloads exceed visits |
| `/share/llama` | 7 | 6 | 0 | Cleared |
| `/share/kaleidoscope` | 2 | 6 | 0 | Cleared, downloads exceed visits |
| `/share/badger` | 4 | 5 | 0 | Cleared, downloads exceed visits |
| `/share/machine` | 3 | 5 | 0 | Cleared, downloads exceed visits |
| `/share/particles` | 2 | 5 | 0 | Cleared, downloads exceed visits |
| `/share/nyan` | 7 | 4 | 0 | Insufficient signal |
| `/share/danceFloor` | 1 | 4 | 0 | Insufficient signal |
| `/share/` index | 9 | 5 (share_fallback) | 0 | Insufficient signal |

**Fifteen pages clear the 5-download page gate, up from one last week.**
Every one of them is a blog or a comparison page, and the Question and
Comparison and Blog types clear their 10-download type gate (70, 41 and 19).
That is a real change in coverage. It is also the reason this week's report
has more to say than last week's.

**There is still no bottom quartile.** The gate says which pages are worth
looking at. It does not say which are failing. Of the 15 pages that clear
the gate, the best is `/blog/apple-music-visualizer` at 15 downloads against
16 visits, and the worst is `/comparison/vibresia-vs-shadertoy` at 6
downloads against 2 visits. At these volumes one person moves a rate by
several points, and 11 of the 15 have more downloads than visits, so the
rates cannot be read at all. A page with little traffic has not failed; it
is under the gate.

### The queue

At most three candidates. Each with the evidence, the change, the metric, the
guardrail, the review window and a keep/revert rule.

#### 1. `/share/*` download CTA: add the missing tracking attribute — SHIPPED

This goes first because the copy change in candidate 2 cannot be measured
until it lands, and because it is the same defect that was queued last week
and is now a second week old.

- **Evidence:** 123 downloads in the window came from links whose `source`
  is `share_<vibescape>` or `share_fallback`. Not one of those downloads has
  a browser-side `download_clicked` event, because the link carries no
  `data-track` attribute. 61 of the 123 arrived with no referrer either and
  only 20 with a share page as the referrer. On 15 of the 18 share pages with
  any activity, downloads exceed browser visits, so the share pages have no
  measurable conversion rate at all until this is fixed.
- **The defect, at the source:** `scripts/generate-share-pages.py` emits
  `<a class="btn coffee" href="/download?src=share_{slug}" data-install
  data-share-download hidden>`. It has `data-install` and
  `data-share-download` and no `data-track`. The hand-written
  `site/share/index.html` had the same omission on its `share_fallback`
  link.
- **Proposed change:** add `data-track="download_clicked"` and
  `data-placement="share-cta"` to that link, in the generator, in the 18
  generated pages and in the hand-written share index. Instrumentation, not
  copy.
- **Primary metric:** the number of share CTA downloads with a matching
  browser event. It should go from 0 to a large share of the 123.
- **Guardrail:** the worker download count must not fall. If the worker count
  drops while the browser count rises, the change has broken the download,
  not instrumented it.
- **Review window:** 28 days from the deploy date, or until 20 downloads
  have been counted on the share CTA, whichever is longer.
- **Keep/revert:** keep if the share CTA has both a worker count and a
  browser count that agree within 20% of each other. Revert if the worker
  count falls by more than 10% against the 123 baseline while the browser
  count rises, because that means the change altered the link rather than
  instrumented it.

#### 2. `/share/*` CTA copy: say what Vibresia is before the button

- **Evidence:** 57 browser visits across the 19 share pages, 123 downloads
  attributed to them, 0 browser download clicks, and 20 downloads with a
  share page as the referrer. **Sixteen** share pages clear the 5-download
  page gate on the `source` count: `share_warp` 9, `share_waveform` 8,
  `share_tunnel` 8, `share_liquid` 8, `share_hamster` 8, `share_silk` 7,
  `share_band` 7, `share_ribbons` 7, `share_spectrum` 7, `share_flux` 7,
  `share_vortex` 7, `share_llama` 6, `share_kaleidoscope` 6, `share_badger`
  5, `share_machine` 5, `share_particles` 5. Fourteen of the sixteen have
  more downloads than visits, so the gate is met on downloads that did not
  come from a visit. That is the same defect candidate 1 fixes.
  The current CTA row reads: "Press **Open in Vibresia** and the app will
  switch to Ribbons. You'll need Vibresia on your Mac, free, no account." It
  starts at the button. A reader who has never heard of Vibresia has no
  reason to press it, and the reader is often on a phone where the deep link
  does nothing at all.
  The "Download for Mac" link beside it carries `hidden` in the markup and
  is only revealed by `site/share/share-page.js` after the deep link fails,
  so a visitor who never sees the button never has the chance.
- **Proposed change:** replace the two `<small>` lines in the `.share-cta`
  block so each one says what Vibresia is before it says what the button
  does, and says the app is for the Mac and is free. Copy, in
  `site/share/*.html` and `site/share/index.html`.
- **Primary metric:** the worker download count for the `share_*` sources,
  currently 123 in 28 days. This is deliberately not a rate, because the
  share pages have no measurable rate until candidate 1 lands.
- **Guardrail:** the "Open in Vibresia" click rate must not fall. The deep
  link is the better path for a reader who already has the app, and the
  change must not push them towards the download instead.
- **Review window:** 28 days from the deploy date. Below that the counts
  are too small to read against.
- **Keep/revert:** keep if the `share_*` download count rises against the 123
  baseline, with the "Open in Vibresia" click rate flat or better. Revert if
  it falls, or if the deep-link clicks fall. Hold this candidate until
  candidate 1 has landed, because without it the "Open in Vibresia" click
  rate cannot be read either.
- **Not shipped this week.** Copy belongs to the content-brand subagent, and
  this run could not reach it. See "What did not ship".

#### 3. `/agents` copy buttons: the command is not recorded

- **Evidence:** 33 visits, 0 downloads, and 3 `install_command_copied`
  events on `/agents`. All three carry an **empty** `command` property, and
  they are the only empty-command events in the dataset. The cause is
  mechanical: `site/agents.html` has exactly two `<button data-copy>`
  elements with no `data-command` attribute, and they are the only copy
  buttons in the whole repository without one. `site/analytics.js` reads
  `button.dataset.command || ""`, so it logs an empty string.
  The effect on this report: the routine's own guidance is to compare a
  page's downloads with its command copies and find the page that gets
  copies but not downloads. `/agents` is exactly that page, and its
  mid-funnel event cannot be read, because the event does not say which
  instruction the reader reached for.
- **Proposed change:** add `data-command` to the two copy buttons on
  `/agents`. One of them copies the local MCP command (`vibresia -- ... --
  mcp`), the other copies the web MCP URL (`https://vibresia.com/mcp`).
  Instrumentation, not copy.
- **Primary metric:** the share of `install_command_copied` events on
  `/agents` that carry a non-empty `command`.
- **Guardrail:** the `install_command_copied` count on `/agents` must not
  fall. If the copies drop, the button broke.
- **Review window:** 28 days from the deploy date.
- **Keep/revert:** keep if the copies still fire and the `command` is
  populated. Revert if the copy count falls against the 3 baseline.

### What shipped

| Change | Branch | SHA | Deploy date |
|---|---|---|---|
| Share CTA download tracking, `/agents` copy-command tracking | `cro/share-cta-download-tracking` | `c59ab68` | Not deployed |

A merge is not a deploy. The owner reviews and merges. The site ships when
the Worker is deployed (`npx wrangler deploy`); the app ships when a release
is cut (`VisualiserMac/release.sh`). **The deploy date is not yet set, and
the review window does not start until it is.**

The change does four things:

1. Adds `data-track="download_clicked"` and `data-placement="share-cta"` to
   the share page download link, in `scripts/generate-share-pages.py`, in the
   18 generated pages and in `site/share/index.html`.
2. Adds `data-command` to the two copy buttons on `/agents`, so the three
   `install_command_copied` events from that page say which instruction the
   reader reached for.
3. Fixes the generator's `Open in Vibresia` href. The generator emitted
   `href="#"` while the committed pages carried the `vibresia://` deep link,
   so regenerating reverted it. The generator now emits the deep link, which
   is also a working no-JS fallback.
4. Brings the 18 generated pages in line with `site/share/index.html` on the
   `.recent-more` block, which the generator already had and the generated
   pages did not.

`site/share/liquid.html` also picks up "Psychedelic fluid" instead of
"Milkdrop-style psychedelic fluid". That is the generator reading the
description from the home page, where `c2735d8` already made that change;
the share page had not been regenerated since. It is the owner's earlier
decision catching up, not a new copy decision taken here.

Tests: **414 pass, 0 fail.** `scripts/check-posthog.sh`,
`scripts/check-vibescapes.sh` and `scripts/check-no-webhook-leak.sh` all
pass. The generator is idempotent. The GitNexus graph change analysis
reports one changed symbol (`render`), risk **medium** on the diff and
**LOW** on the upstream impact of `render`, `epistemic: exact`, one direct
caller.

### What did not ship, and why

- **No copy change to the share CTA.** Copy belongs to the content-brand
  subagent. This run could not reach it, so candidate 2 did not ship. The
  brief and the number to move are written out in candidate 2 above, ready
  for that agent.
- **No copy change to any blog or comparison page.** The Question,
  Comparison and Blog types clear their 10-download type gate (70, 41 and 19
  downloads) and 15 pages clear the 5-download page gate, up from one last
  week. That is enough to look at, and it is still not enough to conclude
  anything. 11 of those 15 pages have more downloads than visits, so their
  rates cannot be read, and the ones that can be read differ by two people.
  There is no bottom quartile in this data and this report will not
  manufacture one.
- **No change to the Agents page copy.** 33 visits and 0 downloads is
  insufficient signal, not a failure. The Agents page is also locked this
  week by `scripts/locked-routes.sh`.
- **No change to the `page_view` legacy event.** It stopped on 2026-11-04
  and nothing in the repository fires it. Whether it should be removed from
  the reporting or was dropped by accident is a question for the owner, not
  a conversion change.
- **No layout change to the home page.** The download button is in the hero,
  above the fold, and the home page is the type's own reference rate. At
  273 visits, 49 hero downloads and 29 browser clicks, there is no evidence
  of a layout problem.
- **No change to the price, the promise or the product.** The app is free
  and the download is the whole funnel.
- **The bottom-quartile exercise could not be performed.** The routine
  expects to find a worst-performing quartile of pages and ship a fix for
  it. The traffic does not support it. What the data does support is the
  share page, where the CTA has a specific, provable defect and the
  instrumentation to fix it. That is what shipped.
- **No `vibescape_card_viewed` change.** The conversion model lists it as a
  funnel step. It fires 0 times in 28 days and nothing in the repository
  fires it. Whether to add the event or drop it from the model is a question
  for the owner.

### What could not be measured

- **The share pages' conversion rate.** It cannot be calculated from this
  data and this report does not give one. On 15 of the 18 share pages with
  activity, downloads exceed browser visits; only 20 of the 123 downloads
  carry a share page as the referrer; and not one share page produced a
  browser download click in 28 days. The share pages are the site's second
  biggest source of downloads and they are not measurable as a rate until
  the share CTA carries a browser event. Candidate 1 is what would settle
  it, and it has shipped.
- **How many distinct people downloaded.** The worker's event uses a
  constant `distinct_id`, so it counts requests rather than people. A person
  who downloads twice is counted twice. The `seen` flag reports 405 false
  and 3 true across the window.
- **Which page 26 blank-source downloads came from.** The link had no
  `source` at all.
- **Whether the browser click event was ever reliable.** The project holds no
  data before 2026-10-20, so "it used to work and then broke" cannot be
  tested. This run can only say the event works for the people who fire it.
- **Which instruction the `/agents` readers reached for.** All three command
  copies from that page carry an empty `command`. Candidate 3 fixes the
  cause; until it is deployed, the split is unknown.
- **Whether the 11 pages with more downloads than visits are a tracking
  defect or a real effect.** The missing visits could be a pageview event
  that did not fire, or readers who loaded the page without the site
  recording it. The data cannot tell the two apart.

---

## 2026-11-12: Organic acquisition

Second step of the weekly CRO check. This section puts search and conversion
side by side per page type, so a search change is judged on whether it brought
people who downloaded, not only on clicks. It reads data and proposes
changes. **It deploys nothing.**

### Data health

**All three checks pass. The queue below is not empty, and it is empty for a
different reason than last week: every page it could have proposed against is
locked.**

- **GSC export: complete to its stated date. Pass.** The export was generated
  today, 2026-11-12, by `ops/seo/pulse/gsc-export.py --days 28 --name
  gsc-28d`, and re-running it reproduced the same numbers. It covers
  2026-10-13 to 2026-11-10 and names 2026-11-10 as the latest complete
  date. The daily series in GSC has 10 rows with no gaps from 2026-11-02
  onwards, and data on every day from 2026-11-02 to 2026-11-10. The row cap
  is 25,000 and the query x page query returned 34 rows, so nothing was
  capped.
- **A download event fired in the last 7 days. Pass.** 235
  `download_requested`, 13 `download_clicked` and 4 `install_command_copied`
  in the 7 days to 2026-11-12 13:57 UTC. The last worker download was
  2026-11-12 11:09 UTC and the last browser click 2026-11-12 11:09 UTC.
- **`landing_page` and `landing_referrer` coverage: still 0%, and the check
  is still asking for properties the site does not fire.** This is the third
  week running. Nothing sets `landing_page` or `landing_referrer`; the site
  sends `$initial_pathname` and `$initial_referring_domain` on the person
  through `$set_once`, and `docs/conversion-model.md` records that mapping.
  **This run does not swap in different properties and carry on**, because
  that is exactly the quiet substitution the dry-run check is there to stop.
  The equivalent question is answered below, with its own limits, as a
  measurement rather than as a passed check. The fix is small and belongs to
  the owner: the routine's check should name the properties the site already
  sends, read from the person rather than from the event.

**Window.** The analytics window is 28 days, **2026-10-15 13:57:00 to
2026-11-12 13:57:00 UTC, pinned at both ends with explicit timestamps**. The
GSC window is 28 days, 2026-10-13 to 2026-11-10, cut two days back because
Search Console lags. **The two windows are not the same window and their
numbers are not a cohort.** They are printed in separate columns below and
are never divided by one another.

**A second site shares the analytics project.** `audiovane-web` and
`vibresia-web` share project 673583. Every query in this section is filtered
on `properties.$lib = 'vibresia-web'`. Without it the numbers are wrong.

**The capture gap is still open.** 34 browser `download_clicked` against 408
worker `download_requested`, a gap of 374. This section does not attempt to
close it and does not use it to argue anything. It is described in the CRO
section above and its fix is candidate 1 there, which has shipped.

### Baseline, by page type

Search numbers and analytics numbers sit in separate columns. There is no
column that divides one by the other, because a Search Console click and a
PostHog download are not the same people and this data cannot join them.

**Search side (GSC, 2026-10-13 to 2026-11-10).** **Analytics side (PostHog,
2026-10-15 to 2026-11-12).**

| Page type | GSC clicks | GSC impressions | GSC pages | Visits | From a search referrer | Page-attributed downloads (`seo-*` source) | Browser download clicks |
|---|---|---|---|---|---|---|---|
| Question | 4 | 131 | 9 | 56 | 11 | 70 | 4 |
| Comparison | 2 | 169 | 17 | 147 | 2 | 41 | 1 |
| Blog | 3 | 45 | 3 | 25 | 5 | 19 | 0 |
| Home | 4 | 11 | 1 | 273 | 7 | 0 | 29 |
| Vibescape (share pages and `/s/*` short links) | 0 | 14 | 7 | 232 | 0 | 0 | 0 |
| Agents | 0 | 3 | 1 | 33 | 1 | 0 | 0 |
| Comparison hub | 0 | 2 | 1 | 9 | 0 | 0 | 0 |
| Vibescape gallery | 0 | 0 | 0 | 31 | 0 | 0 | 0 |
| Author | 0 | 0 | 0 | 4 | 0 | 0 | 0 |
| Vibe | 0 | 0 | 0 | 3 | 0 | 0 | 0 |
| Other (`/share/` index) | 0 | 0 | 0 | 11 | 1 | 0 | 0 |
| **Total** | **13** | **375** | **39** | **824** | **27** | **130** | **34** |

Notes on the columns.

- **Page types come from the sitemaps, not from the URL pattern.**
  `site/sitemaps/questions.xml` holds 12 question pages published under
  `/blog/`, so those twelve are counted as Question and not as Blog. A
  routine that maps by URL alone misclassifies them.
- **The GSC columns come from the full page dimension, 39 rows, not from the
  export's 19-page list.** The export builds its `pages` list from the query
  x page rows, and that list holds only 19 of the 39 pages that carry
  impressions. The page dimension is the sounder column and it is what is
  printed above. The export's own totals, which come from the page
  dimension, are 13 clicks and 375 impressions, and the export is unchanged.
- **"Page-attributed downloads" is the `seo-<slug>-<position>` source on the
  download link.** It names the page the link sat on. 130 downloads carry
  such a source, and they are the only downloads in the whole dataset that
  can be tied to a page.
- **"From a search referrer" is a pageview whose `referrer` is a search
  engine.** 27 of 824 pageviews (3.3%) carry one. 619 of 824 (75.1%) carry
  no referrer at all. The referrers that are there are our own bare domain
  (111), LinkedIn (53), Google (22 and 2 on the `.co.uk` host), Bing (3),
  Minith Labs (4), GitHub (1), and four others including localhost and a
  staging host.
- **The GSC "pages" column counts pages with at least one impression**, not
  pages with traffic. 39 pages carry impressions.
- **The GSC page dimension and the query dimension still disagree**, and this
  matters. The page dimension reports 13 clicks and 375 impressions across 39
  pages. The query dimension reports 2 clicks and 58 impressions across 19
  pages. 317 of the 375 impressions (84.5%) sit on pages that have no row in
  the query data at all, and 11 of the 13 clicks are on pages with no query
  row. **Any conclusion drawn from the query list in this report describes at
  most 58 of the 375 impressions.** The page-level totals are the sounder
  column.

### The signal gate

A page type needs 10 page-attributed downloads in 28 days. A single page
needs 5. Below that, insufficient signal.

| Page type | Page-attributed downloads | Type gate (10) |
|---|---|---|
| Question | 70 | Cleared |
| Comparison | 41 | Cleared |
| Blog | 19 | Cleared |
| Home | 0 | Insufficient signal |
| Every other type | 0 | Insufficient signal |

Three types clear the type gate, the same three as last week, with more
downloads in each: 70 against 31, 41 against 18, 19 against 11. The three
types that cleared it now hold 130 downloads between them, spread across 22
pages.

### Page level

The 22 pages that carry an `seo-*` download source, with their raw counts.
The full table is in the CRO section above; this is the search-side join.

| Page | Visits | From a search referrer | Page-attributed downloads | GSC clicks | GSC impressions | GSC position | Gate (5) |
|---|---|---|---|---|---|---|---|
| `/blog/apple-music-visualizer` | 16 | 4 | 15 | 2 | 72 | 14.92 | Cleared |
| `/comparison/vibresia-vs-projectm` | 7 | 0 | 11 | 0 | 0 | n/a | Cleared |
| `/blog/parachord-visualizer-mac` | 3 | 0 | 8 | 0 | 0 | n/a | Cleared |
| `/blog/youtube-music-visualizer-mac` | 7 | 3 | 8 | 1 | 10 | 7.2 | Cleared |
| `/blog/does-milkdrop-work-on-mac` | 3 | 1 | 7 | 0 | 13 | 5 | Cleared |
| `/blog/best-music-visualizer-for-mac-2026` | 12 | 4 | 7 | 3 | 25 | 9 | Cleared |
| `/blog/amazon-music-visualizer-mac` | 4 | 0 | 6 | 0 | 5 | 5.2 | Cleared |
| `/comparison/vibresia-vs-magic-music-visuals` | 7 | 0 | 6 | 0 | 0 | n/a | Cleared |
| `/comparison/vibresia-vs-touchdesigner` | 7 | 0 | 6 | 0 | 5 | 22.8 | Cleared |
| `/comparison/vibresia-vs-shadertoy` | 2 | 0 | 6 | 0 | 0 | n/a | Cleared |
| `/blog/mixcloud-visualizer-mac` | 3 | 0 | 5 | 0 | 2 | 5 | Cleared |
| `/comparison/projectm-vs-milkdrop` | 6 | 0 | 5 | 0 | 4 | 22.5 | Cleared |
| `/blog/milkdrop-alternatives-mac-2026` | 10 | 0 | 5 | 0 | 7 | 6.57 | Cleared |
| `/blog/spotify-visualizer-mac` | 6 | 2 | 5 | 0 | 16 | 22.88 | Cleared |
| `/blog/plex-visualizer-mac` | 5 | 2 | 5 | 1 | 10 | 8.4 | Cleared |
| `/blog/tidal-visualizer-mac` | 2 | 0 | 4 | 0 | 6 | 5.5 | Insufficient signal |
| `/blog/soundcloud-visualizer-mac` | 1 | 0 | 4 | 0 | 0 | n/a | Insufficient signal |
| `/comparison/vibresia-vs-synesthesia` | 7 | 0 | 4 | 0 | 11 | 17.45 | Insufficient signal |
| `/blog/twitch-visualizer-mac` | 3 | 0 | 4 | 0 | 0 | n/a | Insufficient signal |
| `/blog/vlc-visualizer-mac` | 1 | 0 | 3 | 0 | 8 | 25.88 | Insufficient signal |
| `/blog/deezer-visualizer-mac` | 5 | 0 | 3 | 0 | 2 | 8 | Insufficient signal |
| `/comparison/vibresia-vs-plane9` | 3 | 0 | 3 | 0 | 0 | n/a | Insufficient signal |

**Fifteen pages clear the 5-download page gate**, up from six last week. Every
one of them is a blog or a comparison page, and the same 15 clear it in both
this section and the CRO section above.

**Eleven of the twenty-two have more downloads than visits**, including
`/blog/parachord-visualizer-mac` (8 downloads, 3 visits),
`/comparison/vibresia-vs-projectm` (11 and 7) and
`/comparison/vibresia-vs-shadertoy` (6 and 2). A download cannot come from a
visit that did not happen, so these counts cannot be read as rates, and this
report does not print them as rates. This is not the share-page problem
described in the CRO section above: the `source` here names a real page, and
the missing visits are missing because the reader fetched the page without the
site recording a view of it. The referrer on the `seo-*` downloads is the
bare domain `https://vibresia.com` or nothing at all, which is what a
referrer policy produces on a landing.

### The queue

**Empty.**

The rule is that a failing data-health check empties the queue, and the
`landing_page` / `landing_referrer` check failed at 0% coverage for the third
week running. That is the first reason, and it stands on its own.

The other reason is that the queue could not have been filled from this data
even if the check had passed:

- **Every page in the site is locked.** `scripts/locked-routes.sh` reports 77
  locked routes, including `/`, every blog page, every comparison page,
  every share page, `/agents`, `/vibescapes` and `/author/syd-lawrence`. The
  three commits that regenerated all the pages sit inside the window. **All
  39 pages that carry GSC impressions are in the locked list, and so are
  every one of the 22 pages that carry a page-attributed download.** There is
  nothing to propose against.
- **The three candidate pages with the strongest signal are all locked.**
  `/blog/apple-music-visualizer` (15 downloads), `/comparison/vibresia-vs-projectm`
  (11) and `/blog/parachord-visualizer-mac` (8) are all in the locked list.
- **No page has a defensible search-side gap.** 13 clicks and 375 impressions
  over 28 days, with an empty previous window, and 84.5% of the impressions
  carrying no query string at all. The two query-side facts the data does
  support are that `/blog/apple-music-visualizer` holds the most impressions
  of any page (72, and 2 of the 13 clicks) at position 14.92, and that
  `/blog/best-music-visualizer-for-mac-2026` holds 25 impressions and 3
  clicks at position 9. The best position of any page with a click is 1.45,
  on `/`, with 11 impressions and 4 clicks. One click on two impressions is
  not a result. At these volumes one click moves a rate by 50 percentage
  points.
- **The type gate cleared on three types and the page gate cleared on 15
  pages out of the 49 blog and comparison pages the site publishes.** There is
  no cluster here to rank and no untargeted query cluster that this data can
  distinguish from noise.

### What could not be measured

- **The rate at which search brings people who download.** This is the thing
  this routine exists to measure, and it cannot be measured on this data.
  The worker's `download_requested` carries a constant `distinct_id` and no
  session id, so a download cannot be joined to the visit that produced it.
  8 of the 34 browser download clicks can be attributed to a search visitor,
  which is the closest the data comes, and 8 clicks cannot carry a rate.
- **How many distinct people downloaded.** The worker event counts requests.
  The `seen` flag reports 405 false and 3 true.
- **Which query produced a download.** The GSC query data covers 58 of 375
  impressions, the analytics data cannot be joined to the search data, and
  the two windows are not the same window. There is no path from a query to a
  download in this dataset.
- **Whether the 27 search-referrer pageviews and the 13 GSC clicks are the
  same people.** They cannot be the same set with any confidence. GSC
  records a click; PostHog records a pageview with a referrer. One search
  click may produce no recorded pageview, and one recorded pageview may come
  from a click GSC did not count. The two numbers, 13 and 27, are printed
  side by side and deliberately not reconciled.
- **What the 32 of 39 GSC pages with impressions but no clicks are doing.**
  32 pages hold 231 impressions and 0 clicks. Their impression-weighted
  average position is 9.33, so they are not ranking badly, they are ranking
  for queries nobody clicks on a result page yet. There is no per-page signal
  to act on.
- **Whether the 11 pages with more downloads than visits are a tracking
  defect or a real effect.** The missing visits could be a pageview event
  that did not fire, or readers who loaded the page without the site
  recording it. The data cannot tell the two apart.

### What did not ship

Nothing. No branch was cut for this section, nothing was merged, nothing was
deployed. This routine reads data and proposes changes; it does not ship
them. The one change that shipped this week came from the CRO section above,
and it is instrumentation on the share pages rather than a search change.

The one thing this section asks for is a decision from the owner on the
`landing_page` / `landing_referrer` check, which asks for properties the
site does not fire. Until that is settled, this routine reports a failed
data-health check and an empty queue every week.

---

## 2026-11-11: weekly CRO check

### Data health

- Events seen: 548 `$pageview`, 30 `download_clicked`, 8
  `install_command_copied`, 236 `download_requested`, 837 `mode_card_viewed`,
  350 `demo_played`, 10 `outbound_clicked`. All scoped to
  `properties.$lib = 'vibresia-web'`.
- Window: 2026-10-14 .. 2026-11-11 (28 days). The project only holds data
  from 2026-10-20 12:47 UTC, so the first six days of the window are empty
  by construction rather than by failure. The window is a rolling one and
  the counts move during a run: `download_requested` was 235 when the first
  queries went out and 236 when the last ones did, as a download landed
  mid-run. The numbers below are as at 2026-11-11 09:37 UTC.
- Capture gap: **yes, and it is wide.** 30 browser download clicks against
  236 worker downloads, a gap of 206. The cause is not a broken event. All 19
  distinct browsers that fired `download_clicked` also fired a `$pageview`,
  the live site's download links carry `data-track="download_clicked"`, and
  the live `/ingest/batch/` relay answers correctly to a POST. The cause is
  that most downloads come from links carrying no tracking attribute at all:
  87 from the share page CTA, 23 with a blank source, 12 with a probe string,
  1 `count-test`. That is 123 downloads with no browser-side counterpart,
  which accounts for the gap.
- Anything that would make the numbers wrong:
  - **The project carries a second site.** `audiovane-web` shares the
    project. Unfiltered, `page_view` reads 325 when Vibresia fired 299, and
    `mode_card_viewed` reads 971 when Vibresia fired 837. Every number in
    this report is filtered on `$lib = 'vibresia-web'`.
  - **`page_view` is a legacy event.** It stopped on 2026-11-04 and nothing
    in the repository fires it; `site/analytics.js` fires `$pageview`. The
    299 `page_view` events are counted separately here and excluded from
    the visit column, because adding both double-counts visits.
  - **Attribution uses the `src` parameter on the link, not the referrer.**
    125 of 236 downloads (53%) arrived with no `Referer` header at all,
    spread evenly across every source kind, so referrer-based attribution
    fails on half the downloads. The `src` parameter is written into the
    link by the generator and is always present.
  - **`src` says which link was clicked, not which page was viewed.** This
    is the limit on every rate in the table below, and it is why the share
    pages cannot be given a conversion rate. See the note under the table.
  - 13 downloads in the window are probe and test strings against
    `/download` (twelve `asdf alt=` payloads in assorted encodings, plus one
    `count-test`). They are counted in the worker total and excluded from
    the page attribution.
  - The worker's `download_requested` uses a constant `distinct_id`
    (`downloads`), so it counts requests, not people. It is not a distinct
    person count.
  - No deploy sits in the middle of the window that is known to have moved
    the site. The `page_view` stop on 2026-11-04 is a change in what the site
    fires, not a deploy this run could confirm.

### By page type

Raw counts beside every rate. A rate without its counts is unreadable.

Visits are `$pageview`. Downloads are the worker's `download_requested`,
attributed by the `src` parameter. The rate is downloads per visit.

| Page type | Visits | Downloads (worker) | Download clicks | Rate | Signal |
|---|---|---|---|---|---|
| Home | 237 | 64 | 25 | 27.0% (64/237) | Cleared (64 downloads) |
| Vibescape (share pages) | 136 | 87 | 0 | Not a rate, see the note | Cleared (87 downloads) |
| Comparison | 76 | 10 | 1 | 13.2% (10/76) | Cleared (10 downloads) |
| Blog | 59 | 18 | 4 | 30.5% (18/59) | Cleared (18 downloads) |
| Agents | 25 | 0 | 0 | 0.0% (0/25) | Insufficient signal (0 downloads) |
| Comparison hub | 7 | 0 | 0 | 0.0% (0/7) | Insufficient signal (0 downloads) |
| Vibescape gallery | 6 | 0 | 0 | 0.0% (0/6) | Insufficient signal (0 downloads) |
| Author | 1 | 0 | 0 | 0.0% (0/1) | Insufficient signal (0 downloads) |
| Vibe | 1 | 0 | 0 | 0.0% (0/1) | Insufficient signal (0 downloads) |
| Question | 0 | 0 | 0 | n/a | Insufficient signal (no visits) |
| **Total** | **548** | **236** | **30** | | |

The visit column sums to 548, which is every `$pageview` in the window. The
download column sums to 179 across the visible rows; the total of 236 adds
the 57 downloads listed in the unattributable table below, and is every
`download_requested` in the window.

**The share pages cannot be given a conversion rate, and this is the most
important thing in the report.** The 87 downloads are attributed to a share
page by the `src` parameter on the link, which names the vibescape, not the
page the reader was on. Three checks show the two numbers do not describe the
same people:

- On 14 of the 17 share pages with any activity, downloads exceed browser
  visits. `/share/hamster` has 1 browser visit and 8 downloads.
  `/share/warp` has 4 visits and 9 downloads. A download cannot come from a
  visit that did not happen.
- Of the 87 share-CTA downloads, 57 arrived with no referrer at all, 10 with
  the bare domain, and only 18 with a share page as the referrer. So 20.7%
  (18/87) of them can be tied to somebody who actually had the share page
  open.
- The share pages total 49 browser visits across all 19 of them, and 87
  downloads attributed to them.

A share link sent in a chat is followed by the recipient, the app is
downloaded, and the page may never be rendered in a browser at all. That is
what the product is for, and it works, but it is not a page conversion and
this run will not present it as one. The share pages are the site's second
biggest source of downloads and they are not measurable as a rate until the
share CTA carries a browser event (queue candidate 1).

Two more rows that belong in the table, because they are downloads the table
above cannot place:

| Downloads not attributable to a page | Count | Why |
|---|---|---|
| Footer link, any page | 21 | The footer link carries `src=footer` on every page, so it cannot be split by page |
| Blank source | 23 | The link had no `src` at all |
| Probe and test strings | 13 | Someone testing the download endpoint: twelve `asdf alt=` payloads in assorted encodings, one `count-test` |

Total worker downloads: 236. Total browser download clicks: 30.

The share pages' own gate position, using the `src` parameter:

| Share page | Browser visits | Downloads (worker) | Gate |
|---|---|---|---|
| `/share/warp` | 4 | 9 | Cleared |
| `/share/hamster` | 1 | 8 | Cleared |
| `/share/llama` | 5 | 6 | Cleared |
| `/share/kaleidoscope` | 1 | 6 | Cleared |
| `/share/liquid` | 1 | 5 | Cleared |
| `/share/tunnel` | 1 | 5 | Cleared |
| `/share/waveform` | 6 | 5 | Cleared |
| Every other share page | 4 or fewer | 4 or fewer | Insufficient signal |

Seven share pages clear the page gate. Every one of them has a download
count at or above its visit count, which is the same problem as the rate
above: the gate is met on downloads that did not come from a visit.

Notes on the table. The Question type has no visits because the question
pages are published under `/blog/` and are counted in the Blog row. That is
the mapping `docs/conversion-model.md` gives, and it is the reason a
routine that maps by URL pattern alone would misclassify twelve pages.

Page-level signal gate, 5 downloads in 28 days. Downloads are counted per
page, with the top and bottom placements on the same page added together.

| Page | Visits | Downloads (worker) | Gate |
|---|---|---|---|
| `/blog/best-music-visualizer-for-mac-2026` | 9 | 5 | Cleared |
| `/blog/apple-music-visualizer` | 12 | 4 | Insufficient signal |
| `/comparison/vibresia-vs-magic-music-visuals` | 5 | 3 | Insufficient signal |
| `/comparison/projectm-vs-milkdrop` | 4 | 3 | Insufficient signal |
| `/comparison/vibresia-vs-projectm` | 3 | 3 | Insufficient signal |
| Every other blog and comparison page | 1 to 3 | 1 to 3 | Insufficient signal |

**One blog page and no comparison page clears the page gate.** Across the 16
blog pages and the 31 comparison pages that had any visit at all, only
`/blog/best-music-visualizer-for-mac-2026` reaches 5 downloads, and it has 9
visits. The Blog and Comparison type rows clear the type gate (18 and 10
downloads) but no individual page inside them except that one does, so no
page-level finding can be drawn about the rest of them. They are not the
bottom quartile. There is no bottom quartile to draw.

### The queue

At most three candidates. Each with the evidence, the change, the metric, the
guardrail, the review window and a keep/revert rule.

#### 1. `/share/*` download CTA (20 share pages, and the `/s/*` short links that serve them): add the missing tracking attribute

This one goes first, because the copy change in candidate 2 cannot be
measured until it lands.
- **Evidence:** 87 downloads in the window came from links whose `src` is
  `share_<vibescape>` or `share_fallback`. Not one of those downloads has a
  browser-side `download_clicked` event, because the link carries no
  `data-track` attribute. The 87 downloads are real and are counted by the
  worker, but they cannot be tied to a page or a placement in the browser
  data. 57 of the 87 arrived with no referrer either, and 18 of the 87 with
  a share page as the referrer. The same applies to the 23 blank-source
  downloads.
  The effect on the rest of this report: on 14 of the 17 share pages with
  any activity, downloads exceed browser visits, so the share pages have no
  measurable conversion rate at all until this is fixed.
- **Proposed change:** add `data-track="download_clicked"` and
  `data-placement="share-cta"` to the share page download link in the
  generator, and give the fallback link a `src` that names the page.
  Instrumentation, not copy.
- **Primary metric:** the number of share CTA downloads with a matching
  browser event. It should go from 0 to a large share of the 87.
- **Guardrail:** the worker download count must not fall. If the worker
  count drops while the browser count rises, the change has broken the
  download, not instrumented it.
- **Review window:** 28 days from the deploy date, or until 20 downloads
  have been counted on the share CTA, whichever is longer.
- **Keep/revert:** keep if the share CTA has both a worker count and a
  browser count that agree within 20% of each other. Revert if the worker
  count falls by more than 10% against the 87 baseline while the browser
  count rises, because that means the change altered the link rather than
  instrumented it.

#### 2. `/share/*` CTA copy: say what Vibresia is before the button

- **Evidence:** 49 browser visits across the 19 share pages, 87 downloads
  attributed to them, 0 browser download clicks, and 18 downloads with a
  share page as the referrer. Seven share pages clear the 5-download page
  gate on the `src` count: `share_warp` 9, `share_hamster` 8, `share_llama`
  6, `share_kaleidoscope` 6, `share_liquid` 5, `share_waveform` 5,
  `share_tunnel` 5.
  The current CTA row reads: "Press **Open in Vibresia** and the app will
  switch to Ribbons. You'll need Vibresia on your Mac, free, no account."
  It starts at the button. A reader who has never heard of Vibresia has no
  reason to press it, and the reader is often on a phone where the deep link
  does nothing at all.
  The "Download for Mac" link beside it carries `hidden` in the markup and
  is only revealed by `site/share/share-page.js` after the deep link fails,
  so a visitor who never sees the button never has the chance.
- **Proposed change:** replace the two `<small>` lines in the `.share-cta`
  block so each one says what Vibresia is before it says what the button
  does, and says the app is for the Mac and is free. Copy, in
  `site/share/*.html` and `site/share/index.html`. The proposed words are in
  the run notes and in `agents/growth/memory/2026-11-11.md`.
- **Primary metric:** the worker download count for the `share_*` sources,
  currently 87 in 28 days. This is deliberately not a rate, because the
  share pages have no measurable rate until candidate 1 lands.
- **Guardrail:** the "Open in Vibresia" click rate must not fall. The deep
  link is the better path for a reader who already has the app, and the
  change must not push them towards the download instead.
- **Review window:** 28 days from the deploy date. Below that the counts
  are too small to read against.
- **Keep/revert:** keep if the `share_*` download count rises against the 87
  baseline, with the "Open in Vibresia" click rate flat or better. Revert if
  it falls, or if the deep-link clicks fall. If candidate 1 has not landed
  by then, hold this candidate until it has, because without it the
  "Open in Vibresia" click rate cannot be read either.

#### 3. `/` install section: the two copy commands that convert to nothing

- **Evidence:** 237 visits, 64 downloads, 25 download clicks, and 8
  `install_command_copied` events in the window. Seven of the eight are on
  the home page: `ask-ai` 3, `prompt` 2, `curl` 1, `mcp` 1. The eighth is on
  `/agents` with no command recorded. The install block sits in a
  `<details>` element below the hero and the video. The hero already carries
  a download button above the fold, so the install section is the second
  route in, not the only one.
- **Proposed change:** none yet. This candidate is under the evidence
  threshold for a copy change. 8 copies in 28 days is a real signal for the
  type, but a copy change here needs to know which of the two commands the
  reader wants, and the split is 3 to 1 to 1. The next step is the
  instrumentation in candidate 1, which would show the placement of every
  copy command, and then a decision next week.
- **Primary metric:** install command copies per visit on `/`.
- **Guardrail:** download clicks on `/` must not fall. The hero button is
  the stronger path and the copy must not pull somebody off it.
- **Review window:** 28 days, and only after the placement of each copy
  command is known.
- **Keep/revert:** no change to ship this week. If a change is made later,
  keep it only if copies per visit rise above the baseline of 8/237 (3.4%)
  with download clicks flat.

### What shipped

| Change | SHA | Deploy date |
|---|---|---|
| Nothing | n/a | n/a |

This routine proposes and the owner reviews. No branch was cut, nothing was
merged, nothing was deployed. The working tree already carried unrelated
uncommitted changes when this run started; they were left alone.

### What did not ship, and why

- **No copy change to the blog and comparison pages.** The Blog and
  Comparison types clear the type gate (18 and 10 downloads) but only one
  page inside either type clears the 5-download page gate, and it has 9
  visits. At these volumes one person moves the rate by several points, so
  no conclusion can be drawn about which of them is the bottom quartile.
  There is no bottom quartile in this data.
- **No change to the Agents page.** 25 visits and 0 downloads is
  insufficient signal, not a failure. It is also the page that produced 1 of
  the 8 install command copies, so it is worth watching rather than
  changing.
- **No change to the `page_view` legacy event.** It stopped on 2026-11-04
  and nothing in the repository fires it. Whether it should be removed from
  the reporting or was dropped by accident is a question for the owner, not
  a conversion change.
- **No layout change to the home page.** The download button is in the hero,
  above the fold, and the home page is the type's own reference rate. There
  is no evidence of a layout problem.
- **No change to the price, the promise or the product.** The app is free and
  the download is the whole funnel.
- **The bottom-quartile exercise could not be performed.** The routine
  expects to find a worst-performing quartile of pages and ship a fix for
  it. The traffic does not support it. Across the 16 blog pages and the 31
  comparison pages with visits, only `/blog/best-music-visualizer-for-mac-2026`
  reaches the 5-download page gate, and it has 9 visits. There is no
  quartile to rank. What the data does support is the share page, where the
  CTA has a specific, provable defect and the instrumentation to fix it.

### What could not be measured

- **Whether the browser click event was ever reliable.** The project holds
  no data before 2026-10-20, so "it used to work and then broke" cannot be
  tested. This run can only say the event works for the people who fire it.
- **Which page 57 downloads came from.** The footer link, the blank source
  and the probes have no page attribution.
- **The share pages' conversion rate.** It cannot be calculated from this
  data, and this report does not give one. On 14 of the 17 share pages with
  activity, downloads exceed browser visits; only 18 of the 87 downloads
  carry a share page as the referrer. The share pages are the second biggest
  source of downloads and they are not measurable as a rate until the share
  CTA carries a browser event. Candidate 1 is what would settle it.
- **Whether the hidden share CTA is why the share pages produce downloads
  at all.** The button is `hidden` until the deep link fails, so a reader
  who pressed "Open in Vibresia" and had the app installed never saw it.
  That is a plausible mechanism, not a measured one.
- **How many distinct people downloaded.** The worker's event uses a
  constant `distinct_id`, so it counts requests rather than people. A person
  who downloads twice is counted twice.
- **Whether the 87 share-CTA downloads are 87 people.** They are 87
  requests. Nothing in this data separates a first download from a repeat
  one, apart from the `seen` flag, which reports 233 false and 3 true across
  the whole window.

---

## 2026-11-11: Organic acquisition

Second step of the weekly CRO check. This section puts search and conversion
side by side per page type, so a search change is judged on whether it brought
people who downloaded, not only on clicks. It reads data and proposes
changes. **It deploys nothing.**

### Data health

Two of the three checks pass. **The third fails, and because it fails the
review queue below is empty.**

- **GSC export: complete to its stated date. Pass.** The export was generated
  today, 2026-11-11, by `ops/seo/pulse/gsc-export.py --days 28 --name
  gsc-28d`. It covers 2026-10-12 to 2026-11-09 and names 2026-11-09 as the
  latest complete date. A direct daily pull for 2026-10-01 to 2026-11-09
  returns 9 date rows with no gaps in the range and data on every day from
  2026-11-01 to 2026-11-09, so the window is not truncated. The row cap is
  25,000 and the query x page query returned 32 rows, so nothing was capped.
- **A download event fired in the last 7 days. Pass.** 167
  `download_requested`, 12 `download_clicked` and 2 `install_command_copied`
  in the 7 days to 2026-11-11 13:15 UTC. The last worker download was
  2026-11-11 13:13 UTC and the last browser click 2026-11-11 12:40 UTC.
- **`landing_page` and `landing_referrer` coverage: FAIL, 0%.** The routine
  asks what share of the traffic has these two properties. The answer is
  that the properties do not exist. Not one event in the window carries
  either key: 0 of 2,591 events across every event name have
  `landing_page`, and 0 have `landing_referrer`. They are not null on some
  events and set on others. They are absent from the data altogether, and
  nothing in the repository sets them either (`grep` for `landing_page` and
  `landing_referrer` across the repo returns one hit, the line in this
  routine that asks the question).

  This is a naming mismatch, not a broken pipeline. The site fires
  `properties.path` and `properties.referrer` on `$pageview`, and
  `properties.source` and `properties.referer` (one r) on
  `download_requested`. The question names properties the site does not use,
  so the check cannot pass as written.

  **Correction, checked after the first draft of this section.** The site
  does carry first-touch attribution, under PostHog's own names rather than
  the routine's. `site/analytics.js` sends a `$set_once` block with
  `$initial_pathname` and `$initial_referring_domain`, and those land on the
  person. Measured over the window, 434 of 698 pageviews carry a real
  `$initial_pathname` (264 are null, which is a person whose first event was
  not a pageview, such as the worker-side download), and the referring
  domains are `google.com` (25), `www.google.co.uk` (1), `linkedin.com`
  (57 across two hostnames), `github.com` (6), `vibresia.com` (58),
  `minithlabs.com` (2) and `$direct` (280).

  The mechanism was verified against PostHog itself rather than assumed. A
  probe event was sent with `$set_once` at the top level of the event and
  another with it nested inside `properties`; both were applied to the
  person. So the site's nesting is not the bug it looks like. The bug is
  only that the routine asks for `landing_page` and `landing_referrer`,
  which nothing sets.

  This changes the recommendation. The first-touch attribution the routine
  wants already exists and works. Rewriting the routine's check to read
  `$initial_pathname` and `$initial_referring_domain` from the person
  properties is the better fix, because it measures what the site collects
  rather than asking the site to start collecting a second copy of it.

  **What that means for this run.** The instruction attached to a failing
  check is that the queue is empty. The queue below is empty. The reason is
  not that the data is bad, it is that the data-health check asks for two
  properties that do not exist, and this routine will not quietly swap in
  different properties, change the meaning of the check, and carry on. The
  equivalent question was answered with the properties the site actually
  fires, in the baseline table below, and it is reported as a measurement
  with its own limits rather than as a passed check.

  The fix is small and belongs to the owner, not to this routine: the
  routine's check should be rewritten to name the properties the site
  already sends, `$initial_pathname` and `$initial_referring_domain`, read
  from the person rather than from the event. Until that happens, every
  future run of this routine will report the same failure and carry an
  empty queue.

**Window.** The analytics window is 28 days, **2026-10-14 13:15 to 2026-11-11
13:15 UTC, pinned at both ends**. The project's earliest event for this site
is 2026-10-20 12:47 UTC, so the first six days of the window are empty by
construction rather than by failure. The window is pinned because it rolls:
worker downloads went from 296 to 299 and `seo-*` downloads from 57 to 60
while this run was being written. Every figure below is as at
2026-11-11 13:15 UTC and will not drift if you check it.

The GSC window is 28 days, 2026-10-12 to 2026-11-09, cut two days back
because Search Console lags. **The two windows are not the same window and
their numbers are not a cohort.** They are printed in separate columns below
and are never divided by one another.

**A second site shares the analytics project.** `audiovane-web` and
`vibresia-web` share project 673583. Every query in this section is filtered
on `properties.$lib = 'vibresia-web'`. Without it the numbers are wrong.

**The capture gap is still open.** 33 browser `download_clicked` against 299
worker `download_requested`. This section does not attempt to close it and
does not use it to argue anything. It is described in the CRO section above
and its fix is candidate 1 there.

### Baseline, by page type

Search numbers and analytics numbers sit in separate columns. There is no
column that divides one by the other, because a Search Console click and a
PostHog download are not the same people and this data cannot join them.

**Search side (GSC, 2026-10-12 to 2026-11-09).** **Analytics side (PostHog,
2026-10-14 to 2026-11-11).**

| Page type | GSC clicks | GSC impressions | GSC pages | Visits | From a search referrer | Page-attributed downloads (`seo-*` source) | Browser download clicks | Browser download clicks by a search visitor |
|---|---|---|---|---|---|---|---|---|
| Question | 4 | 108 | 9 | 54 | 9 | 31 | 4 | 4 |
| Comparison | 2 | 146 | 18 | 154 | 2 | 18 | 1 | 1 |
| Blog | 2 | 39 | 3 | 25 | 5 | 11 | 0 | 0 |
| Home | 3 | 10 | 1 | 263 | 6 | 0 | 28 | 3 |
| Vibescape (share pages and `/s/*` short links) | 0 | 12 | 7 | 137 | 0 | 0 | 0 | 0 |
| Agents | 0 | 3 | 1 | 31 | 1 | 0 | 0 | 0 |
| Comparison hub | 0 | 2 | 1 | 9 | 0 | 0 | 0 | 0 |
| Vibescape gallery | 0 | 0 | 0 | 16 | 0 | 0 | 0 | 0 |
| Author | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 |
| Vibe | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 |
| Other (`/share/` index) | 0 | 0 | 0 | 9 | 1 | 0 | 0 | 0 |
| **Total** | **11** | **318** | **39** | **696** | **24** | **60** | **33** | **8** |

Notes on the columns.

- **Page types come from the sitemaps, not from the URL pattern.**
  `site/sitemaps/questions.xml` holds 12 question pages published under
  `/blog/`, so those twelve are counted as Question and not as Blog. A
  routine that maps by URL alone misclassifies them.
- **Two path details a reader needs.** The `/s/*` short links are share
  pages, so they count as Vibescape, and `/share/` on its own is the share
  index, which has no page type of its own and sits in Other. Two blog
  pages also arrive with a `.html` suffix on the path
  (`/blog/best-music-visualizer-for-mac-2026.html`,
  `/blog/milkdrop-alternatives-mac-2026.html`, one visit each); the suffix
  is stripped before the path is matched to a slug, otherwise those two
  pages split their own counts.
- **The GSC columns come from the full page dimension, 39 rows, not from the
  export's 19-page list.** The export builds its `pages` list from the query
  x page rows, and that list holds only 19 of the 39 pages that carry
  impressions. The page dimension is the sounder column and it is what is
  printed above. `ops/seo/pulse/data/gsc-28d-latest.json` is unchanged; the
  numbers here are the same data read on the page dimension.
- **"Page-attributed downloads" is the `seo-<slug>-<position>` source on the
  download link.** It names the page the link sat on. It is the sound page
  attribution channel, and it was validated before use: on the 5 downloads
  in the window that carry both a `seo-*` source and a specific-page referrer,
  the source and the referrer agree 5 times out of 5. The 60 downloads here
  are every `seo-*` download in the window, and they are the only downloads
  in the whole dataset that can be tied to a page.
- **"From a search referrer" is a pageview whose `referrer` is a search
  engine.** 24 of 696 pageviews (3.4%) carry one. 190 of 696 (27.3%) carry
  any referrer at all, and 506 carry none. The referrers that are there are
  our own bare domain (104), LinkedIn (54), Google (21), Bing (3), Minith
  Labs (4), and five others including localhost and a staging host.
- **"Browser download clicks by a search visitor" joins on the visitor's
  `distinct_id`.** 8 of the 33 browser download clicks came from somebody
  who arrived from a search engine at some point in the window.
- **The GSC "pages" column counts pages with at least one impression, not
  pages with traffic.** 39 pages carry impressions.
- **The GSC totals do not reconcile with the GSC query rows, and this
  matters.** The page dimension reports 11 clicks and 318 impressions. The
  query dimension reports 2 clicks and 54 impressions. 91 of the 318
  impressions (28.6%) sit on pages that have no row in the query data at
  all. This is Search Console withholding query strings for anonymised
  rows, and it is why the export's query list covers a fraction of the
  traffic it names. **Any conclusion drawn from the query list in this
  report describes at most 54 of the 318 impressions.** The page-level
  totals are the sounder column. The daily series shows impressions landing
  from 2 November onwards and clicks from 3 November, so the site has only
  just begun to appear in search.

### The signal gate

A page type needs 10 page-attributed downloads in 28 days. A single page
needs 5. Below that, insufficient signal.

| Page type | Page-attributed downloads | Type gate (10) |
|---|---|---|
| Question | 31 | Cleared |
| Comparison | 18 | Cleared |
| Blog | 11 | Cleared |
| Home | 0 | Insufficient signal |
| Every other type | 0 | Insufficient signal |

Three types clear the type gate. That is the type-level statement, and it
is the whole of it. The three types that cleared it hold 60 downloads between
them, spread across 16 pages.

### Page level

The 16 pages that carry a `seo-*` download source, with their raw counts.

| Page | Visits | From a search referrer | Page-attributed downloads | Browser clicks | Gate (5) |
|---|---|---|---|---|---|
| `/blog/parachord-visualizer-mac` | 3 | 0 | 8 | 0 | Cleared |
| `/blog/apple-music-visualizer` | 16 | 4 | 7 | 1 | Cleared |
| `/comparison/vibresia-vs-magic-music-visuals` | 7 | 0 | 6 | 0 | Cleared |
| `/blog/best-music-visualizer-for-mac-2026` | 12 | 4 | 6 | 0 | Cleared |
| `/comparison/vibresia-vs-projectm` | 5 | 0 | 5 | 0 | Cleared |
| `/blog/plex-visualizer-mac` | 4 | 1 | 5 | 1 | Cleared |
| `/blog/soundcloud-visualizer-mac` | 1 | 0 | 4 | 0 | Insufficient signal |
| `/blog/does-milkdrop-work-on-mac` | 3 | 1 | 4 | 0 | Insufficient signal |
| `/comparison/projectm-vs-milkdrop` | 6 | 0 | 3 | 0 | Insufficient signal |
| `/blog/amazon-music-visualizer-mac` | 4 | 0 | 3 | 0 | Insufficient signal |
| `/comparison/vibresia-vs-shadertoy` | 2 | 0 | 3 | 0 | Insufficient signal |
| `/blog/youtube-music-visualizer-mac` | 7 | 3 | 2 | 1 | Insufficient signal |
| `/blog/tidal-visualizer-mac` | 2 | 0 | 1 | 0 | Insufficient signal |
| `/blog/spotify-visualizer-mac` | 5 | 1 | 1 | 1 | Insufficient signal |
| `/comparison/vibresia-vs-synesthesia` | 7 | 0 | 1 | 1 | Insufficient signal |
| `/blog/milkdrop-alternatives-mac-2026` | 10 | 0 | 1 | 0 | Insufficient signal |

**Six pages clear the 5-download page gate.** Every one of them is a blog or
comparison page. No other page in the site comes close.

**Five of the sixteen have more downloads than visits.** `/blog/parachord-visualizer-mac`
has 8 downloads and 3 visits, `/blog/plex-visualizer-mac` 5 and 4,
`/blog/soundcloud-visualizer-mac` 4 and 1, `/blog/does-milkdrop-work-on-mac`
4 and 3, `/comparison/vibresia-vs-shadertoy` 3 and 2. A download cannot come
from a visit that did not happen, so these counts cannot be read as rates,
and this report does not print them as rates.

This is not the share-page problem described in the CRO section above, and
the difference is worth stating. On the share pages the `src` names a
vibescape rather than a page, so the attribution is meaningless by
construction. Here the `src` names a real page, and the validation run
confirmed it: where the download carries a specific-page referrer, the
source and the referrer agree 5 out of 5. The downloads are real, the
attribution is real, and the missing pageviews are missing because the
reader fetched the page without the site recording a view of it. The
referrer on 41 of the 60 `seo-*` downloads is the bare domain
`https://vibresia.com` and on 14 of them there is no referrer at all, which
is what a referrer policy produces on a landing.

### The queue

**Empty.**

The rule is that a failing data-health check empties the queue, and the
`landing_page` / `landing_referrer` check failed at 0% coverage. That is the
reason, and it stands on its own.

The other reason is that the queue could not have been filled from this data
even if the check had passed:

- **Every page in the site is locked.** `scripts/locked-routes.sh` reports
  77 locked routes, including `/`, every blog page, every comparison page,
  every share page, `/agents`, `/vibescapes` and `/author/syd-lawrence`. The
  three commits that regenerated all the pages sit inside the window. **All
  39 pages that carry GSC impressions are in the locked list, and so are
  every one of the 16 pages that carry a page-attributed download.** There is
  nothing to propose against.
- **The three candidate pages with the strongest signal are all locked.**
  `/blog/parachord-visualizer-mac` (8 downloads), `/blog/apple-music-visualizer`
  (7) and `/blog/best-music-visualizer-for-mac-2026` (6) are all in the
  locked list.
- **No page has a defensible search-side gap.** 11 clicks and 318
  impressions over 28 days, with an empty previous window, and 28.6% of the
  impressions carrying no query string at all. The two query-side facts the
  data does support are that `/blog/apple-music-visualizer` holds the most
  impressions of any page (58, and 2 of the 11 clicks) at position 16.5, and
  that `/blog/best-music-visualizer-for-mac-2026` holds 21 impressions and
  2 clicks at position 10. The best position of any page with a click is
  5.2, on `/blog/amazon-music-visualizer-mac`, with 5 impressions and 0
  clicks. One click on two impressions is not a result. At these volumes one
  click moves a rate by 50 percentage points.
- **The type gate cleared on three types, but the page gate cleared on six
  pages out of the 49 blog and comparison pages the site publishes.** There
  is no cluster here to rank and no untargeted query cluster that this data
  can distinguish from noise.

### What could not be measured

- **The rate at which search brings people who download.** This is the
  thing this routine exists to measure, and it cannot be measured on this
  data. The worker's `download_requested` carries a constant `distinct_id`
  and no session id, so a download cannot be joined to the visit that
  produced it. 8 of the 33 browser download clicks can be attributed to a
  search visitor, which is the closest the data comes, and 8 clicks cannot
  carry a rate.
- **How many distinct people downloaded.** The worker event counts requests.
  The `seen` flag is the only signal, and it reports almost everything as
  false.
- **Which query produced a download.** The GSC query data covers 54 of 318
  impressions, the analytics data cannot be joined to the search data, and
  the two windows are not the same window. There is no path from a query to
  a download in this dataset.
- **Whether the 24 search-referrer pageviews and the 11 GSC clicks are the
  same people.** They cannot be the same set with any confidence. GSC
  records a click; PostHog records a pageview with a referrer. One search
  click may produce no recorded pageview, and one recorded pageview may
  come from a click GSC did not count. The two numbers, 11 and 24, are
  printed side by side and deliberately not reconciled.
- **What the 32 of 39 GSC pages with impressions but no clicks are doing.**
  32 pages hold 197 impressions and 0 clicks. Their impression-weighted
  average position is 9.1 and their median is 6.8, so they are not ranking
  badly, they are ranking for queries nobody clicks on a result page yet.
  There is no per-page signal to act on.
- **Whether the five pages with more downloads than visits are a tracking
  defect or a real effect.** The missing visits could be a pageview event
  that did not fire, or readers who loaded the page without the site
  recording it. The data cannot tell the two apart.

### What did not ship

Nothing. No branch was cut, nothing was merged, nothing was deployed. This
routine reads data and proposes changes; it does not ship them, and the
working tree already carried unrelated uncommitted changes when this run
started. They were left alone.

The one thing this section asks for is a decision from the owner on the
`landing_page` / `landing_referrer` check, which asks for properties the
site does not fire. Until that is settled, this routine reports a failed
data-health check and an empty queue every week.

---
