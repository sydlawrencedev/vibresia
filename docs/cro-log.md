# CRO log

The weekly conversion check appends here. `docs/conversion-model.md` holds the
funnel and the page-type taxonomy this file reads; `content/product-truth.md`
holds the product facts.

Each entry is one run, newest at the top. No user identifiers, no email
addresses, no personal data.

---

## 2026-11-22: weekly CRO check

### Data health

**The browser side is live. The worker side is counting things that are not
downloads.** Both facts sit at the top of this report, because the second one
makes most of the numbers below wrong rather than merely thin.

- Window: **2026-10-25 22:56:11 to 2026-11-22 22:56:11 UTC, pinned at both
  ends**. The routine's rolling shape (`now() - INTERVAL 7 DAY`) was run first
  and returned the same counts, so the window did not move while the report was
  being written. The 7-day window is 2026-11-15 22:56:11 to 2026-11-22
  22:56:11.
- Events seen (28 days, `properties.$lib = 'vibresia-web'`): 1542 `$pageview`,
  867 `download_requested`, 509 `demo_played`, 478 `mode_card_viewed`, 43
  `download_clicked`, 27 `page_view` (legacy), 17 `gallery_card_clicked`, 16
  `outbound_clicked`, 13 `send_to_mac_clicked`, 11 `install_command_copied`, 3
  `coffee_clicked`, 1 `live_scene_mic`.
- Last 7 days: 518 `$pageview`, 386 `download_requested`, 168 `demo_played`,
  117 `mode_card_viewed`, 19 `download_clicked`, 9 `gallery_card_clicked`, 7
  `outbound_clicked`, 6 `install_command_copied`, 4 `send_to_mac_clicked`, 1
  `coffee_clicked`.
- Capture is live. The last `$pageview` was 2026-11-22 19:24 UTC, the last
  `download_clicked` 2026-11-22 13:12 UTC, the last `download_requested`
  2026-11-22 22:38 UTC, the last `install_command_copied` 2026-11-19 15:21
  UTC.
- The project's earliest event for this site is 2026-10-20 12:47 UTC, so the
  first five days of the window are empty by construction rather than by
  failure.

#### The capture gap is 824 wide, and it has a cause that is not the browser

Three numbers for one funnel, same 28 days, three different writers:

| Signal | Count | Written by | What it counts |
|---|---|---|---|
| `download_requested` | 867 | the Worker, on every request to `/download` | requests |
| `download_clicked` | 43 | the browser, on a click | clicks |
| `Application Installed` | 28, from 28 distinct people | the app, when Vibresia is first run | installs |

The gap between the first two is 824. The third number is the check on both: 28
people installed the app in 28 days, so a download count of 867 is 31 times the
number of installs. The app's own `Application Installed` events line up with
the browser's clicks to the second, which is what makes the third number
trustworthy as a check.

**The 11-12 fix is live and it did not close the gap.** The deployed page was
fetched today: `https://vibresia.com/share/warp` carries
`data-track="download_clicked" data-placement="share-cta"`. Across the whole
site, **all 154 anchors that point at `/download`, in 80 HTML files, carry a
`data-track` attribute.** The missing attribute is no longer the explanation,
and the last two runs both said it was.

| Window | Worker requests | Browser clicks | Requests per click |
|---|---|---|---|
| 28 days to 2026-11-12 (the last run's window) | 408 | 34 | 12.0 |
| 28 days to 2026-11-22 (this window) | 867 | 43 | 20.2 |
| 2026-11-12 16:00 to 2026-11-22 22:56 (since the deploy) | 524 | 24 | 21.8 |

**Share and short-link browser clicks are still zero, in the window and since
the project began.** The site has recorded 58 `download_clicked` events in
total, ever. None of them is on `/share/*` or `/s/*`.

#### What the other 828 requests are

Five checks, each one on the worker's own event data.

1. **A real click always carries the page it came from.** Joining every
   worker request to the browser's clicks on the same source family within 120
   seconds: **39 of the 867 requests have a browser click, and all 39 carry a
   full page URL as the HTTP referrer** (`https://vibresia.com/blog/apple-music-visualizer`
   and so on). The other 828 do not.
2. **598 of the 867 (69%) carry no HTTP referrer at all.** A browser
   navigating from a page on this site sends one. Every request that can be
   tied to a click has one, and not one of the 598 has a click behind it.
3. **They arrive in linked groups, which a person cannot do.** 67 groups of
   two or more arrived from one address within 60 seconds, holding 395
   requests. The largest group is 66 requests inside two seconds from one
   address in the Netherlands: every one of the 19 `share_*` sources, all 19
   share pages, in one sweep. On 2026-11-19 at 04:43 UTC the worker recorded
   the `seo-*` links of 12 different pages, two seconds apart, from three
   addresses in the United States. On the home page the `hero`, `hero-mac` and
   `hero-windows` links are requested within the same second of each other,
   and again for the three `after_gallery*` links. One person clicks one
   button.
4. **17 of the 21 pages carrying an `seo-*` source have more downloads than
   visits**, and 2 more have exactly as many. A download cannot come from a
   visit that did not happen.
5. **The Worker's own bot filter did not catch them.** `worker/index.js` line
   100 filters on a user-agent regex, and line 108 adds Apple's preview
   fetcher. Neither matched the agents that produced these requests.

**Conclusion.** The worker's `download_requested` is a request count. Most of
it is automated link walking. It is not a conversion count and must not be used
as one. **The conversion count available today is the browser's 43 clicks, and
the only measure of a completed install is the app's 28.** Every rate below
prints the worker count and the browser count side by side, and the rate that
is quoted is the browser's.

#### Anything else that would make the numbers wrong

- **The project carries more than one site.** Unfiltered over 28 days the
  project holds 5,766 events with no `$lib` (the desktop app's own events),
  3,527 with `$lib = 'vibresia-web'` and 1,730 with `$lib = 'posthog-ios'`.
  Every number in this report is filtered on `properties.$lib =
  'vibresia-web'`. The `audiovane-web` site named in the 11-11 and 11-12
  reports no longer appears in this window.
- **`page_view` is a legacy event.** 27 events, last seen 2026-11-04, nothing
  in the repository fires it, `site/analytics.js` fires `$pageview`. Counted
  separately and excluded from the visit column, because adding both
  double-counts visits.
- **`vibescape_card_viewed` does not exist in the data.** The conversion model
  lists it as a funnel step and the routine's step-1 table lists it. A direct
  count over the window returns **0** and nothing in the repository fires it.
  The real name is `mode_card_viewed`, which fires 478 times, on the home page
  only.
- **`mode_card_viewed` fell from 845 to 478 and it is not a traffic drop.** The
  daily series shows 54 events on 2026-10-20 and 334 on 2026-10-21 against
  **zero** `$pageview` on both days: the build then in production fired the
  card event without firing a pageview. The comparison with the 11-12 figure
  is not like for like.
- **`mode_card_viewed` is intermittent.** It fires on 19 of the 26 days in the
  window, and 2026-11-11 carried 274 pageviews and 0 card events.
- **The `platform` property on the worker event only exists from the Windows
  deploy.** 566 of the 867 events have no `platform`, 223 say `mac` and 78 say
  `windows`. A platform split is only readable for the part of the window
  after that deploy.
- **The worker's `distinct_id` is the constant `downloads`.** The event counts
  requests, not people. The `seen` flag reports 863 false and 4 true.
- **26 worker requests are probes and tests against `/download`** (one `test`
  source, eleven `asdf alt=` payload injections in assorted encodings, three
  `issue39-test-N`, one `verify-issue-39` and one hex-encoded payload). They
  are counted in the worker total and excluded from every page attribution
  below. Last week it was 27.
- **`footer` downloads cannot be split by page.** The footer's download link
  carries `src=footer` on all 80 pages, so its 38 downloads belong to the
  site, not to a page type. The 11-12 report folded them into Home. That was
  wrong and this report does not repeat it.
- **`content/product-truth.md` is out of date.** It was checked on 2026-11-02
  and says "No Windows, Linux, iOS, iPadOS or Android version". The site now
  carries a community-built Windows beta with its own download route, and
  `VisualiserWindows/` is in the repository. Any copy written from the truth
  sheet this week would be wrong about the platform. The owner owns that file
  and its update.

### By page type

Raw counts beside every rate. A rate without its counts is unreadable.

Visits are `$pageview`. The worker column is `download_requested` attributed by
the `source` parameter. The browser column is `download_clicked`. **The rate is
the browser column over the visits**, because that is the only conversion
count that survives the data health above.

| Page type | Visits 28d | Visits 7d | Downloads (worker) | Download clicks 28d | Download clicks 7d | Click rate | Signal (5 per page, 10 per type, on clicks) |
|---|---|---|---|---|---|---|---|
| Home | 462 | 130 | 208 | 36 | 18 | 7.8% (36/462) | Cleared (36 clicks) |
| Comparison | 423 | 197 | 120 | 1 | 0 | 0.2% (1/423) | Insufficient signal (1 click) |
| Blog | 69 | 26 | 53 | 1 | 0 | 1.4% (1/69) | Insufficient signal (1 click) |
| Question | 150 | 64 | 208 | 5 | 1 | 3.3% (5/150) | Insufficient signal (5 clicks) |
| Vibescape (share pages) | 131 | 58 | 153 | 0 | 0 | 0.0% (0/131) | Insufficient signal (0 clicks) |
| Vibescape (short links) | 153 | 12 | 0 | 0 | 0 | 0.0% (0/153) | Insufficient signal (0 clicks) |
| Vibescape gallery | 55 | 15 | 0 | 0 | 0 | 0.0% (0/55) | Insufficient signal (0 clicks) |
| Agents | 45 | 6 | 0 | 0 | 0 | 0.0% (0/45) | Insufficient signal (0 clicks) |
| Comparison hub | 20 | 2 | 0 | 0 | 0 | 0.0% (0/20) | Insufficient signal (0 clicks) |
| Vibe | 18 | 5 | 0 | 0 | 0 | 0.0% (0/18) | Insufficient signal (0 clicks) |
| Author | 10 | 3 | 0 | 0 | 0 | 0.0% (0/10) | Insufficient signal (0 clicks) |
| Share index (`/share/`) | 4 | 0 | 8 | 0 | 0 | 0.0% (0/4) | Insufficient signal (0 clicks) |
| Probe paths (`/probe-nested`, `/probe-top`) | 2 | 0 | 0 | 0 | 0 | n/a | Excluded |
| **Total** | **1542** | **518** | **750** | **43** | **19** | | |

Downloads not attributable to a page, listed separately so the table above
sums honestly:

| Worker downloads not attributable to a page | Count | Why |
|---|---|---|
| Blank source | 53 | The link carried no `source` at all |
| Footer link | 38 | `src=footer` on all 80 pages, so it cannot be split by page |
| Probe and test strings | 26 | See the data health block |

**One type clears the gate and it is the one the routine already knows.** The
home page, on 36 browser clicks against 462 visits. Every other type is under
the 10-click type gate. Of the 49 blog and comparison pages the site
publishes, 42 have no click at all and 7 have exactly one.

**There is still no bottom quartile, and this time the reason is not volume.**
Last week's report said the rates could not be read because 11 of the 15
gated pages had more downloads than visits. This run has the cause of that:
the download counts are not page conversions. On the browser's own count, the
home page is at 7.8% and the 642 visits to the blog, comparison and question
pages are at 1.1% (7 clicks). That is a real gap, but 7 clicks cannot carry a
conclusion about a page, and this report will not turn it into one.

#### Page level: the pages that carry an `seo-*` download source

All 21 pages, with both counts. The worker column is the number the last two
reports ranked on. The browser column is the one that counts people.

| Page | Visits | Downloads (worker) | Browser clicks | Worker column over visits |
|---|---|---|---|---|
| `/blog/apple-music-visualizer` | 26 | 24 | 1 | 92% |
| `/blog/youtube-music-visualizer-mac` | 14 | 21 | 1 | 150% |
| `/blog/amazon-music-visualizer-mac` | 15 | 20 | 1 | 133% |
| `/blog/does-milkdrop-work-on-mac` | 14 | 20 | 0 | 143% |
| `/comparison/vibresia-vs-projectm` | 16 | 19 | 0 | 119% |
| `/comparison/projectm-vs-milkdrop` | 13 | 19 | 0 | 146% |
| `/comparison/vibresia-vs-shadertoy` | 11 | 19 | 0 | 173% |
| `/blog/parachord-visualizer-mac` | 11 | 19 | 0 | 173% |
| `/blog/best-music-visualizer-for-mac-2026` | 31 | 18 | 0 | 58% |
| `/comparison/vibresia-vs-touchdesigner` | 18 | 18 | 0 | 100% |
| `/blog/mixcloud-visualizer-mac` | 12 | 18 | 0 | 150% |
| `/blog/tidal-visualizer-mac` | 10 | 18 | 0 | 180% |
| `/blog/plex-visualizer-mac` | 8 | 17 | 1 | 213% |
| `/comparison/vibresia-vs-synesthesia` | 16 | 16 | 1 | 100% |
| `/comparison/vibresia-vs-magic-music-visuals` | 13 | 16 | 0 | 123% |
| `/blog/milkdrop-alternatives-mac-2026` | 22 | 15 | 1 | 68% |
| `/blog/spotify-visualizer-mac` | 14 | 15 | 1 | 107% |
| `/blog/twitch-visualizer-mac` | 11 | 15 | 0 | 136% |
| `/blog/soundcloud-visualizer-mac` | 9 | 15 | 0 | 167% |
| `/blog/deezer-visualizer-mac` | 12 | 14 | 0 | 117% |
| `/comparison/vibresia-vs-plane9` | 8 | 13 | 0 | 163% |
| `/blog/vlc-visualizer-mac` | 8 | 12 | 0 | 150% |

**None of these pages clears the 5-download page gate on the browser's count.**
The highest is 1 click. The other 28 blog and comparison pages in the site
carry 0 clicks each.

The worker column is printed because it is the number the last two reports
ranked on, and because the pattern is the finding: **17 of these 21 pages
record more downloads than visits, 2 record exactly as many, and 2 record
fewer.** A page cannot convert more people than visited it.

#### The share pages

| Share page | Visits | Downloads (worker) | Browser clicks |
|---|---|---|---|
| `/share/spectrum` | 3 | 10 | 0 |
| `/share/hamster` | 4 | 10 | 0 |
| `/share/warp` | 5 | 10 | 0 |
| `/share/tunnel` | 9 | 10 | 0 |
| `/share/waveform` | 11 | 10 | 0 |
| `/share/silk` | 10 | 9 | 0 |
| `/share/vortex` | 10 | 9 | 0 |
| `/share/flux` | 9 | 9 | 0 |
| `/share/band` | 6 | 9 | 0 |
| `/share/ribbons` | 7 | 8 | 0 |
| `/share/particles` | 5 | 8 | 0 |
| `/share/kaleidoscope` | 5 | 8 | 0 |
| `/share/liquid` | 8 | 8 | 0 |
| `/share/` index | 4 | 8 | 0 |
| `/share/badger` | 5 | 7 | 0 |
| `/share/llama` | 12 | 7 | 0 |
| `/share/danceFloor` | 4 | 7 | 0 |
| `/share/machine` | 6 | 7 | 0 |
| `/share/nyan` | 12 | 7 | 0 |
| **Total** | **135** | **161** | **0** |

The short-link pages (`/s/*`, which the Worker renders for a share somebody
made) add **153 visits and 0 browser clicks**.

Every one of the 19 share sources carries between 7 and 10 downloads, and the
page it names carries between 3 and 12 visits. The counts are flat against the
traffic, which is what a sweep looks like and not what a conversion looks
like.

### The queue

At most three candidates. Each with the evidence, the change, the metric, the
guardrail, the review window and a keep/revert rule.

#### 1. `worker/index.js`: the download counter counts link walkers

This goes first because every number in every report depends on it, and
because the other two candidates cannot be measured until it lands.

- **Evidence:** 867 worker requests against 43 browser clicks and 28 app
  installs in the same 28 days. 39 requests have a browser click within 120
  seconds and all 39 carry a page URL as the referrer; the other 828 do not.
  598 of the 867 carry no referrer at all. 395 of the 828 arrive in 67 groups
  of two or more from one address inside 60 seconds, the largest group being
  all 19 `share_*` sources in two seconds. 17 of the 21 `seo-*` pages record
  more downloads than visits. The Worker's own filters are a user-agent regex
  (line 100) and one rule for Apple's preview fetcher (line 108), and neither
  matched.
- **Proposed change, in `worker/index.js`:** (a) send the request's user agent
  with the event as a coarse class rather than the raw string, so a person can
  be told from a link walker in the data; (b) record the `seen` parameter as
  the tri-state it is (`0`, `1`, or absent) instead of a boolean, because
  `site/analytics.js` appends `seen` to every download link on every page, so
  a request carrying it came from a page on this site and a request without it
  did not; (c) do not count a request that carries neither a `seen` parameter
  nor a same-site referer as a download, and record it separately as
  `download_request_ignored` so the excluded volume is visible rather than
  gone.
  **This is instrumentation on the server. It is not a page change and it is
  not a copy change.**
- **Primary metric:** the number of counted downloads that have a browser
  click within 120 seconds. It is 39 of 867 today (4.5%). It should be above
  90% within a week of the deploy.
- **Guardrail:** the counted download total must not fall below the app's
  install count. 28 people installed the app in 28 days. If the count falls
  under 28, real downloads are being lost, and the change is wrong.
- **Review window:** 28 days from the deploy date, or until 60 counted
  downloads have been recorded, whichever is longer. Below 60 the matched
  fraction is too small to read.
- **Keep/revert:** keep if the matched fraction is above 90% and the counted
  total is at or above the install count over the same window. Revert if the
  matched fraction does not rise, because that means the unmatched requests
  are people and the filter is wrong.
- **Not shipped this run.** The owner reviews and merges. See "What did not
  ship".
- **One coordination note:** another routine is working in a separate
  worktree today (`.worktrees/fix/error-check-2026-11-22`, branch
  `fix/error-check-2026-11-22`) and it has edits open against `worker/index.js`
  and `site/analytics.js`. This candidate touches `worker/index.js`, so it
  should be cut after that work lands, not alongside it.

#### 2. `/share/*` and `/s/*`: the download is behind the deep link, and the line under the button starts at the button

- **Evidence:** 135 visits across the 19 share pages and 153 visits across the
  short-link pages, **0 browser download clicks on either, ever**. 161 worker
  requests are attributed to the share family, and the 11-12 run's explanation
  for them (a missing `data-track` attribute) has been disproved: the
  attribute is on the deployed page today and the click count is still zero.
  Reading the page, three things stand out:
  1. The "Download for Mac" link carries `hidden` in the markup.
     `site/share/share-page.js` reveals it only when the `vibresia://open`
     deep link fails, which takes 1500ms, and it removes it entirely once
     `localStorage.vibresia_installed` is set. A reader who has the app never
     sees it, and a reader on a phone, where the deep link does nothing at
     all, may never reach it either.
  2. The line under the buttons starts at the button: "Press **Open in
     Vibresia** and the app will switch to Warp. You'll need Vibresia on your
     Mac — free, no account." It says what the button does before it says
     what Vibresia is, and the reader is often somebody who has never heard
     of the app. The line also carries em dashes, which the brand rules do
     not allow.
  3. There is no install command on the page at all (`install.sh` appears
     zero times in `site/share/warp.html` and `site/share/index.html`), so
     the reader who cannot use the deep link has one hidden button and no
     command to copy.
  The video is not the problem here: `site/share/warp.mp4` is 438K with
  `preload="metadata"`.
- **Proposed change:** replace the two `<small>` lines in the `.share-cta`
  block so each says what Vibresia is before it says what the button does,
  and says the app is for the Mac and is free. Copy, in the 18 generated
  pages and `site/share/index.html`. **The words must come from the
  content-brand subagent.** See "What did not ship" for why they are not
  written yet.
- **Primary metric:** browser `download_clicked` events on `/share/*` and
  `/s/*` pages. The baseline is 0, in the 28-day window and since the site
  began.
- **Guardrail:** the "Open in Vibresia" deep link must not lose readers. The
  deep link is the better path for a reader who already has the app, and the
  change must not push them towards downloading it instead. The worker count
  for the `share_*` sources must also not be used as the metric: it is
  currently 161 against 135 visits and it is mostly automated.
- **Review window:** 28 days from the deploy date. Below that the counts are
  too small to read against.
- **Keep/revert:** keep if the browser click count on the share pages rises
  above 0, with the deep-link clicks flat. Revert if the deep-link clicks
  fall. Inconclusive if there are fewer than 5 browser clicks on the share
  pages at the end of the window, because that is still under the gate.
- **Parked this week.** `scripts/locked-routes.sh` reports `/share/*`,
  `/share/index` and every share page as locked. The share pages were
  rewritten on 2026-11-17 by the Windows beta release and by the footer
  attribution, both inside the 7-day window.

#### 3. `/blog/*` and `/comparison/*`: the search pages have no mid-funnel event and no rate that can be read

- **Evidence:** 642 visits across the blog, comparison and question pages
  (423, 69 and 150) and **7 browser download clicks in 28 days**, one on each
  of 7 pages. Every one of the 49 search pages the site publishes is under
  the 5-download page gate on the browser's count, and the type gate is
  cleared by one type only (the home page, on 36 clicks). The routine's own
  instruction is to compare a page's downloads with its command copies and
  find the page that gets copies but not downloads: **there are no command
  copies on any search page.** All 11 `install_command_copied` events in the
  window are on the home page (8) or on `/agents` (3). The search pages have
  no mid-funnel signal at all, so there is no way to tell whether a search
  reader who does not download is lost at the pitch or at the install
  instruction.
- **Proposed change:** put the install command on the search pages, in the
  same place the home page puts it, so the mid-funnel event exists. Layout,
  in the generator `scripts/generate-seo-pages.mjs` and the pages it writes.
  **No copy: the wording of the command block is the home page's existing
  wording, and if new words are needed they come from the content-brand
  subagent.**
- **Primary metric:** `install_command_copied` events on `/blog/*` and
  `/comparison/*` pages, over 28 days. The baseline is 0.
- **Guardrail:** the browser download clicks on the search pages must not
  fall, and the total `install_command_copied` count on the home page must
  not fall. A command block that takes somebody off the download button has
  cost more than it won.
- **Review window:** 28 days from the deploy date.
- **Keep/revert:** keep if the search pages record command copies and the
  browser clicks on those pages do not fall. Revert if the home page's
  command copies fall. Inconclusive if the search pages record fewer than 5
  command copies in the window.
- **Parked this week.** All 49 search pages are locked: they were rewritten on
  2026-11-17 by the Windows beta release and by the footer attribution, both
  inside the 7-day window. This candidate also cannot be judged until
  candidate 1 lands, because until then the download side of the comparison
  is a request count.

### What shipped

| Change | Branch | SHA | Deploy date |
|---|---|---|---|
| Nothing | n/a | n/a | n/a |

**Nothing shipped this run.** No branch was cut, no worktree was created,
nothing was committed and no file was edited except this log. The routine's
step 5 describes the owner reviewing and merging, and a merge is not a deploy
either way: the site ships when the Worker is deployed (`npx wrangler
deploy`), and the app ships when a release is cut.

The change in candidate 1 is specified in full above, with the evidence, the
primary metric, the guardrail, the review window and the keep/revert rule, so
that it can be cut as a branch and reviewed without anything else being
re-decided. It needs the owner's deploy.

### What did not ship, and why

- **No copy change to the share pages.** Copy belongs to the content-brand
  subagent. This run could not reach it: the harness refused to spawn a
  subagent from this session (`Subagent depth limit reached`), in the
  background and in the foreground. **The words are therefore unmade**, and
  candidate 2 stays a brief until that agent writes them. The brief is the
  one above: the `.share-cta` block, the Vibescape audience from the
  conversion model, and the one number, which is 0 browser clicks on the
  share pages.
- **No change to any search page.** 7 browser clicks across 49 pages is
  insufficient signal, not a failure. All 49 are locked this week anyway.
- **No change to the Agents page.** 45 visits and 0 clicks is insufficient
  signal. It is locked this week as well.
- **No change to the home page.** The hero button is above the fold and
  carries 29 of the site's 36 browser clicks. At 462 visits and 36 clicks
  there is no evidence of a layout problem, and the home page is the
  benchmark the other types are measured against.
- **No layout change to the share pages' video.** The mp4 is 438K and the
  `preload` is `metadata`.
- **No change to the `page_view` legacy event.** It stopped on 2026-11-04
  and nothing in the repository fires it. Whether to remove it from the
  reporting or to treat it as a break is a question for the owner.
- **No change to `vibescape_card_viewed`.** It fires 0 times and nothing in
  the repository fires it. Whether to add the event or drop it from the
  conversion model is a question for the owner.
- **No change to the price, the promise or the product.** The app is free
  and the download is the whole funnel.
- **The bottom-quartile exercise could not be performed.** The routine
  expects to rank pages and ship a fix for the worst of them. On the only
  conversion count that survives the data health, 42 of the 49 blog and
  comparison pages have no click at all and 7 have exactly one. There is no
  quartile to rank. What the data does support is the counter itself, which
  is candidate 1.

### What could not be measured

- **How many people downloaded.** The worker's event uses a constant
  `distinct_id`, so it counts requests. The app's `Application Installed`
  event counts people (28 people, 28 events) but it is a different id space
  and cannot be joined to a web visitor: a join on `distinct_id` between the
  two returns **0** people.
- **Which page a worker download belongs to, for 117 of the 867.** 53 have a
  blank source, 38 are the site-wide footer link, and 26 are probes.
- **The conversion rate of any page except the home page.** 43 clicks and 37
  distinct people across the whole site. One person moves the site's click
  rate by 0.06 points and a page's rate by much more.
- **Whether the 828 unmatched worker requests are people.** The evidence
  above says most of them are not, but the data cannot name the agent that
  made them, because the Worker does not record the user agent. That is the
  change in candidate 1.
  - **Since this entry:** the Worker was deployed on 23 November 2026 and
    now records the user agent. The event stream shows the boundary
    exactly: the download events at 07:51 and 07:52 UTC carry no user
    agent, and the two at 10:35 and 10:36 carry a full Chrome string. The
    next run of this routine can name the agent, which is what candidate 1
    needs in order to be measured rather than argued.
    - **Two of those events are mine.** They carry `source=deploy-check`
      and a `https://vibresia.com/` referrer, and they are legitimate
      downloads counted correctly. The personal API key cannot delete
      events, so they stay in the project.
- **Whether the share pages ever worked.** There is no browser click on a
  share page in the project's whole history, so there is no before and no
  after to compare.
- **What the 9 installs with no browser click near them were.** 19 of the 28
  installs can be tied to a click within 180 seconds. The other 9 either
  downloaded without the browser event firing, or installed another way.

---

## 2026-11-22: Organic acquisition

Second step of the weekly CRO check. This section puts search and conversion
side by side per page type, so a search change is judged on whether it brought
people who downloaded, not only on clicks. It reads data and proposes changes.
**It deploys nothing.**

### Data health

**Two of the three checks pass. The third fails for the fourth week running,
and because it fails the review queue below is empty. It would be empty
anyway, for a second reason that has nothing to do with the check.**

- **GSC export: complete to its stated date. Pass.** Generated today,
  2026-11-22, by `ops/seo/pulse/gsc-export.py --days 28 --name gsc-28d`. It
  covers 2026-10-23 to 2026-11-20 and names 2026-11-20 as the latest
  complete date. A direct daily pull for the same window returns 20 date
  rows with no gaps and data on every day from 2026-11-02 to 2026-11-20, so
  the window is not truncated. The row cap is 25,000, and the page dimension
  returned 55 rows while the query x page query returned 75, so nothing was
  capped. The previous window (2026-09-25 to 2026-10-23) has 0 clicks and 0
  impressions: the site has only just started to appear in search.
- **A download event fired in the last 7 days. Pass.** 386
  `download_requested`, 19 `download_clicked` and 6 `install_command_copied`
  in the 7 days to 2026-11-22 22:56 UTC. The last worker download was
  2026-11-22 22:38 UTC and the last browser click 2026-11-22 13:12 UTC.
- **`landing_page` and `landing_referrer` coverage: FAIL, 0%.** The routine
  asks what share of the traffic carries these two properties. The answer is
  that the properties do not exist: nothing sets them, and the only hit for
  either name in the repository is the line in this routine that asks the
  question. This is the fourth week running, and this run does not swap in
  different properties and carry on, because that is the substitution the
  dry-run check is there to stop.
  The equivalent question is answered below as a measurement, with its own
  limits. `docs/conversion-model.md` records the mapping: the site sends
  `$initial_pathname` and `$initial_referring_domain` on the person through
  `$set_once`. **881 of 1,271 persons (69.3%) carry both.** The 390 without
  one are people whose first event was not a pageview, which is what the
  conversion model says to expect. The referring domains are `$direct` (765),
  LinkedIn (52), Google (46), Minith Labs (4), GitHub (3), Bing (2) and
  nine others. **49 of the 881 first landings came from a search engine
  (5.6%).**
  The fix belongs to the owner and is small: the routine's check should name
  the properties the site already sends, read from the person rather than
  from the event. Until that happens this routine reports the same failure
  every week.

**Window.** The analytics window is 28 days, **2026-10-25 22:56:11 to
2026-11-22 22:56:11 UTC, pinned at both ends**. The GSC window is 28 days,
2026-10-23 to 2026-11-20, cut two days back because Search Console lags.
**The two windows are not the same window and their numbers are not a
cohort.** They sit in separate columns below and are never divided by one
another.

**A second site shares the analytics project.** Every query here is filtered
on `properties.$lib = 'vibresia-web'`. Without it the numbers are wrong.

**The capture gap is open and it is 824 wide.** This section does not attempt
to close it and does not use it to argue anything. It is described in the CRO
section above: the worker counted 867 requests where the app recorded 28
installs, and the fix is candidate 1 there.

**The export's page list is not the page dimension, and the difference is
large.** `ops/seo/pulse/gsc-export.py` writes the export's `totals` from a
page-dimension query (31 clicks, 966 impressions, 55 pages) and writes the
export's `pages` list from the query x page rows, which cover **160
impressions and 5 clicks across 30 pages**. Every GSC column below is read
from the page dimension, because that is the sounder one. This is the same
trap the 11-11 and 11-12 runs flagged, and it is still open in the export.

### Baseline, by page type

Search numbers and analytics numbers sit in separate columns. There is no
column that divides one by the other, because a Search Console click and a
PostHog download are not the same people and this data cannot join them.

**Search side (GSC, 2026-10-23 to 2026-11-20).** **Analytics side (PostHog,
2026-10-25 22:56:11 to 2026-11-22 22:56:11).**

| Page type | GSC clicks | GSC impressions | GSC pages | Visits | From a search referrer | Worker requests attributed to the page | Browser download clicks |
|---|---|---|---|---|---|---|---|
| Home | 6 | 20 | 1 | 462 | 15 | 208 | 36 |
| Comparison hub | 0 | 18 | 1 | 20 | 0 | 0 | 0 |
| Comparison | 10 | 456 | 26 | 423 | 15 | 120 | 1 |
| Blog | 7 | 124 | 3 | 69 | 15 | 53 | 1 |
| Question | 8 | 297 | 10 | 150 | 13 | 208 | 5 |
| Vibescape (share pages) | 0 | 42 | 13 | 131 | 0 | 153 | 0 |
| Vibescape (short links) | 0 | 0 | 0 | 153 | 0 | 0 | 0 |
| Vibescape gallery | 0 | 0 | 0 | 55 | 0 | 0 | 0 |
| Share index (`/share/`) | 0 | 0 | 0 | 4 | 0 | 8 | 0 |
| Agents | 0 | 9 | 1 | 45 | 1 | 0 | 0 |
| Author | 0 | 0 | 0 | 10 | 0 | 0 | 0 |
| Vibe | 0 | 0 | 0 | 18 | 0 | 0 | 0 |
| Probe paths | 0 | 0 | 0 | 2 | 0 | 0 | 0 |
| **Total** | **31** | **966** | **55** | **1542** | **59** | **750** | **43** |

Notes on the columns.

- **Page types come from the sitemaps, not from the URL pattern.**
  `site/sitemaps/questions.xml` holds 12 question pages published under
  `/blog/`, so those twelve are counted as Question and not as Blog.
- **"From a search referrer" is a pageview whose `referrer` is a search
  engine.** 59 of 1542 pageviews (3.8%) carry one. 1255 of 1542 (81.4%)
  carry no referrer at all. The referrers that are there are our own bare
  domain (148), LinkedIn (56), Google (50), Minith Labs (7), Bing (3),
  GitHub (4) and others.
- **The worker column is a request count, not a conversion count.** It is
  printed because it is the number the last three reports ranked on. The
  reasoning and the evidence are in the CRO section above: 828 of the 867
  worker requests have no browser click behind them, and 598 carry no referrer
  at all.
- **The GSC page dimension and the query dimension still disagree.** The page
  dimension reports 31 clicks and 966 impressions across 55 pages. The query
  dimension reports 5 clicks and 160 impressions across 30 pages. **806 of the
  966 impressions (83.4%) carry no query string at all, and 26 of the 31
  clicks do.** Any conclusion drawn from the query list describes at most 160
  of the 966 impressions.

### The signal gate

A page type needs 10 downloads in 28 days. A single page needs 5. Below that,
insufficient signal. **On the browser's count, which is the only count that
survives the data health, one type clears the type gate and no page clears
the page gate.**

| Page type | Browser download clicks | Type gate (10) |
|---|---|---|
| Home | 36 | Cleared |
| Question | 5 | Insufficient signal |
| Blog | 1 | Insufficient signal |
| Comparison | 1 | Insufficient signal |
| Every other type | 0 | Insufficient signal |

Last week this table said Question 70, Comparison 41 and Blog 19, all cleared,
on the worker count. On the count that survives the health check, the same
three types hold 5, 1 and 1.

### Page level

The 21 pages that carry an `seo-*` source, with both counts. The full table is
in the CRO section above.

| Page | Visits | From a search referrer | GSC clicks | GSC impressions | GSC position | Worker requests | Browser clicks | Gate (5) |
|---|---|---|---|---|---|---|---|---|
| `/blog/apple-music-visualizer` | 26 | 4 | 3 | 177 | 15.30 | 24 | 1 | Insufficient signal |
| `/blog/youtube-music-visualizer-mac` | 14 | 3 | 2 | 14 | 5.86 | 21 | 1 | Insufficient signal |
| `/blog/amazon-music-visualizer-mac` | 15 | 2 | 1 | 16 | 6.38 | 20 | 1 | Insufficient signal |
| `/blog/does-milkdrop-work-on-mac` | 14 | 1 | 0 | 18 | 5.17 | 20 | 0 | Insufficient signal |
| `/comparison/projectm-vs-milkdrop` | 13 | 0 | 0 | 0 | n/a | 19 | 0 | Insufficient signal |
| `/comparison/vibresia-vs-projectm` | 16 | 0 | 0 | 0 | n/a | 19 | 0 | Insufficient signal |
| `/comparison/vibresia-vs-shadertoy` | 11 | 0 | 0 | 3 | 49.33 | 19 | 0 | Insufficient signal |
| `/blog/parachord-visualizer-mac` | 11 | 0 | 0 | 0 | n/a | 19 | 0 | Insufficient signal |
| `/blog/tidal-visualizer-mac` | 10 | 0 | 0 | 7 | 5.86 | 18 | 0 | Insufficient signal |
| `/blog/best-music-visualizer-for-mac-2026` | 31 | 11 | 6 | 75 | 12.75 | 18 | 0 | Insufficient signal |
| `/comparison/vibresia-vs-touchdesigner` | 18 | 0 | 0 | 6 | 19.17 | 18 | 0 | Insufficient signal |
| `/blog/mixcloud-visualizer-mac` | 12 | 0 | 0 | 4 | 7.50 | 18 | 0 | Insufficient signal |
| `/blog/plex-visualizer-mac` | 8 | 2 | 1 | 14 | 9.86 | 17 | 1 | Insufficient signal |
| `/comparison/vibresia-vs-magic-music-visuals` | 13 | 0 | 1 | 5 | 30.00 | 16 | 0 | Insufficient signal |
| `/comparison/vibresia-vs-synesthesia` | 16 | 0 | 0 | 22 | 15.55 | 16 | 1 | Insufficient signal |
| `/blog/soundcloud-visualizer-mac` | 9 | 0 | 0 | 0 | n/a | 15 | 0 | Insufficient signal |
| `/blog/milkdrop-alternatives-mac-2026` | 22 | 3 | 1 | 31 | 13.35 | 15 | 1 | Insufficient signal |
| `/blog/spotify-visualizer-mac` | 14 | 2 | 1 | 20 | 22.90 | 15 | 1 | Insufficient signal |
| `/blog/twitch-visualizer-mac` | 11 | 0 | 0 | 4 | 9.00 | 15 | 0 | Insufficient signal |
| `/blog/deezer-visualizer-mac` | 12 | 0 | 0 | 3 | 8.00 | 14 | 0 | Insufficient signal |
| `/comparison/vibresia-vs-plane9` | 8 | 0 | 0 | 0 | n/a | 13 | 0 | Insufficient signal |
| `/blog/vlc-visualizer-mac` | 8 | 0 | 0 | 38 | 18.47 | 12 | 0 | Insufficient signal |

**No page clears the 5-download page gate.** The highest is 1 browser click.

### First value

The routine asks for the first download, by the same people, within 28 days of
the visit. The worker's event cannot carry it, because its `distinct_id` is a
constant. The browser's click can, and the app's install event can.

**The app's `Application Installed` event is the only event in the project
that means a person finished installing.** 28 events from 28 distinct people
in the window. Joining it to the browser's clicks on time:

| Measure | Count |
|---|---|
| App installs in 28 days | 28, from 28 people |
| Installs within 180 seconds of a browser download click | 19 |
| Of those, the click came from a search referrer | 5 |
| Of those, the click came from the home page with no search referrer | 14 |
| Installs with no click within 180 seconds | 9 |

The gap between the click and the install runs from 7 seconds to 129 seconds,
with most inside 20. That is what a download, an install and a first launch
look like.

**This is the measure the last two reports said could not be measured.** They
were right that it cannot be joined on identity, because the app and the site
do not share an id space (a join on `distinct_id` returns 0 people). It can be
joined on time, and it is a time join, so it is a measurement with limits and
not a cohort.

**5 of the 28 people who installed Vibresia came from a search referrer, and
those 5 are 5 of the 19 matched installs.** Both numbers are printed because at
this volume one person moves the share by five points. Three of the 5 came
from a question page and two from the home page.

### The queue

**Empty.**

The rule is that a failing data-health check empties the queue, and the
`landing_page` / `landing_referrer` check failed at 0% coverage for the
fourth week running. That is the first reason, and it stands on its own.

The second reason is that the queue could not have been filled from this data
even if the check had passed:

- **Every page with search signal is locked.** `scripts/locked-routes.sh`
  reports 79 locked routes. **All 55 pages that carry GSC impressions are in
  the locked list**, including `/`, every blog page, every comparison page,
  every share page, `/agents` and `/vibescapes`. There is nothing to propose
  against.
- **The three pages with the strongest signal are all locked.**
  `/blog/apple-music-visualizer` (177 impressions, 3 clicks),
  `/blog/best-music-visualizer-for-mac-2026` (75 impressions, 6 clicks) and
  `/comparison/vmix-vs-resolume` (56 impressions, 0 clicks) are all in the
  locked list.
- **No page has a defensible search-side gap.** 31 clicks and 966 impressions
  over 28 days against an empty previous window, and 83.4% of the impressions
  carry no query string at all. The two query-side facts the data does
  support are that `/blog/apple-music-visualizer` holds the most impressions
  of any page (177) at position 15.30, and that
  `/blog/best-music-visualizer-for-mac-2026` holds 75 impressions and 6 of the
  31 clicks at position 12.75. The best position of any page with a click is
  1.00, on `/comparison/resolume-vs-obs`, which has 1 impression and 1 click.
  One click on one impression is not a result. At these volumes one click
  moves a rate by 50 percentage points.
- **38 of the 55 pages with impressions hold no click at all** (405
  impressions), and their impression-weighted average position is 9.14, so
  they are not ranking badly, they are ranking for queries nobody clicks on
  a result page yet. There is no per-page signal to act on.
- **The page gate cleared on no page.** On the count that survives the data
  health, no page clears 5 browser clicks and only one type clears 10. There
  is no cluster here to rank and no untargeted query cluster that this data
  can distinguish from noise.

### What could not be measured

- **The rate at which search brings people who download, as a ratio.** The
  first-value measure above is a time join between two event streams, not a
  join on identity, and it covers 19 of the 28 installs. The GSC clicks and
  the PostHog downloads cannot be divided by one another as if they were a
  cohort.
- **Which query produced a download.** The GSC query data covers 160 of 966
  impressions and 5 of 31 clicks, the analytics data cannot be joined to the
  search data, and the two windows are not the same window. There is no path
  from a query to a download in this dataset.
- **Whether the 59 search-referrer pageviews and the 31 GSC clicks are the
  same people.** They cannot be the same set with any confidence. One search
  click may produce no recorded pageview, and one recorded pageview may come
  from a click GSC did not count. The two numbers are printed side by side
  and deliberately not reconciled.
- **What the 38 pages with impressions and no click are doing.** They hold
  405 impressions and 0 clicks at an impression-weighted position of 9.14.
  There is no per-page signal to act on.
- **How many distinct people downloaded.** The worker event counts requests.
  The app's install event counts people but cannot be joined to a visitor.
- **Whether the 9 installs with no nearby click were downloads the browser
  missed or installs another way.**

### What did not ship

Nothing. No branch was cut, no worktree was created, nothing was committed,
nothing was deployed and no file was edited except this log. This routine
reads data and proposes changes; it does not ship them.

The one change this week's numbers ask for came from the CRO section above,
and it is instrumentation on the Worker rather than a search change. The two
things this section asks for are a decision from the owner on the
`landing_page` / `landing_referrer` check, which asks for properties the site
does not fire, and an update to `content/product-truth.md`, which still says
there is no Windows version.

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
