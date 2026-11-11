# CRO log

The weekly conversion check appends here. `docs/conversion-model.md` holds the
funnel and the page-type taxonomy this file reads; `content/product-truth.md`
holds the product facts.

Each entry is one run, newest at the top. No user identifiers, no email
addresses, no personal data.

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
