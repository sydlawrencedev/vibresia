# Method: what people look for when they look for a Mac music visualiser

**Run date:** 2026-11-12
**Routine:** `routines/original-statistics.md` (v1.0.0)
**Status:** DRAFT. Not published. Awaiting the owner's written sign-off (privacy gate rule 6).
**Target URL (once approved):** `https://vibresia.com/stats/data/what-mac-music-visualiser-visitors-look-for`

## The buyer question

> What do people actually reach for when they are looking for a music visualiser for a Mac?

Sources for the question, per routine step 1:

- `ops/seo/ai-visibility/prompts.md`. The monthly set opens with "What is the best
  music visualiser for Mac?" (starred, so it is in the weekly set too), and carries
  "What is the best free music visualiser for Mac?" and "What is the best visualiser
  for Spotify on Mac?".
- `ops/seo/pulse/data/gsc-28d-latest.json`, the 28-day export ending 2026-11-10.
  The queries that reach this site are almost all "mac music visualizer" shaped:
  `apple music visualizer` (8 impressions), `apple music visualizer mac` (2 clicks),
  `mac music visualizer` (2), `music visualizer for mac` (1),
  `music visualizer spotify` (1), `spotify visualizer` (1),
  `does apple music have a visualizer` (1), `visualiser for spotify` (1).

No `/stats/*` page appears in the GSC export at all. There is no published
original statistic on the site yet, which is why this run is a first publication.

## The data source

**Not Supabase.** The routine's `data_source` question defaults to `supabase`, and
that default is wrong for this project. The real aggregate source is **PostHog**,
project `673583` at `https://us.i.posthog.com`, read through the Personal API query
endpoint (`POST /api/projects/673583/query`). The credentials are in
`VisualiserMac/.env` (`POSTHOG_PERSONAL_API_KEY`, `POSTHOG_PROJECT_ID`), which is
gitignored. The API key used is read-only.

What was ruled out, and why:

| Candidate | Verdict |
|---|---|
| Supabase | Not present. `wrangler.toml` has no Supabase binding and no Supabase credential exists in the repo. |
| Cloudflare D1 | Reachable in principle, but it holds one table, `shares`, and it is not user behaviour. It is one row per shared vibescape with an `author` name, a payload and a view count. There is no person dimension, so no cohort of 50 people can be defined from it. It is also the wrong privacy shape: `author` is a name somebody typed. |
| The Mac app's own events | Present in PostHog (`$lib = 'posthog-ios'` and the app's batch events), but the cohort is **16 installs**. That is below the privacy gate's floor of 50, so no app-side finding is publishable at all. The app's `distinct_id` is a random UUID held in `UserDefaults`; it identifies an install, not a person, and the privacy policy says so in as many words. |

The website and the Mac app report into the same PostHog project, which is why
the project's `surface` property exists. This run uses the website surface only.

## The cohort

**660 visitors**, counted as distinct `person_id` values that produced at least one
page view event between 2026-10-19 and 2026-11-12 inclusive, up to a fixed
cut-off of **2026-11-12 14:00:00 UTC**.

The cut-off is part of the method. PostHog is live and new events arrive while a
run is in progress, so without a cut-off the same query returns a different number
ten minutes later. Every query below carries the cut-off, and the published
figures are the result of running them with it.

Every number published on the page is a count of distinct people, taken from this
one cohort of 660. No breakdown cell falls below 50.

### Cohort definition, in full

A visitor is in the cohort when **all** of the following hold.

1. They produced at least one event named `$pageview` or `page_view`. Those are the
   two page-view event names the site emits (`site/analytics.js` fires `$pageview`;
   `page_view` is the site-side alias). Nothing else counts as a visit.
2. The event's `$lib` property is `vibresia-web` or `audiovane-web`.
   `audiovane-web` is the same site under its previous name; it is Vibresia's own
   traffic, not somebody else's, so it is included.
3. The event's `distinct_id` is not `posthog-canary-check`. That is the identifier
   the project's own liveness check posts under (`scripts/check-posthog-live.py`,
   `EVENT = "posthog_canary"`, `DISTINCT_ID = "posthog-canary-check"`). It is the
   project's test account and is excluded. It accounts for 69 events and 1 person,
   and because it posts no page views it removes nobody from this cohort.
4. The event's `$referrer` does not contain `localhost`, `minithlabs`, `sydlawrence`
   or `127.0.0.1`. These are the owner's own machine, the owner's staging
   deployment and the owner's other site. Excluding them removes 4 people.
5. The event's `path` does not begin with `/probe`. These are uptime probes and
   manual checks, not a site page. Excluding them removes 2 people.

The exclusions, applied in that order, take the web cohort from 666 people to
660. Four are the owner's own traffic and two are probes. The two groups do not
overlap.

### What is deliberately not in the cohort

- Any row-level record, identifier, URL, IP address or referrer string. Nothing
  below identifies a person, and nothing was pulled to make the numbers work.
- App-side installs. 16 installs, below the floor.
- The Mac app's `session_summary` and `genre_detected` events, which carry a
  coarse genre bucket. A genre breakdown of 16 installs would fail the gate twice
  over, and it would be a breakdown of a category people chose, not of a
  population.
- Any breakdown by demographic, geography, device, health, religion, ethnicity or
  sexual orientation. The data does not carry them and the gate forbids the
  sensitive ones.

## The finding

The visitors were grouped by which kind of Vibresia page they reached. A visitor
can appear in more than one group, because 59 of the 660 reached two or more
kinds of page. The percentages therefore do not add to 100 and the page says so.

| Page kind | Visitors | Share of the 660 |
|---|---|---|
| Homepage | 285 | 43.2% |
| A shared vibescape (`/share/*`, `/s/*`) | 215 | 32.6% |
| A comparison page (`/comparison/*`) | 101 | 15.3% |
| A blog page (`/blog/*`) | 57 | 8.6% |
| The agents page, the gallery or the vibe page (`/agents`, `/vibescapes`, `/vibe`, `/author/*`) | 52 | 7.9% |

Cohort: 660 visitors, 2026-10-19 to 2026-11-12, cut off at 14:00:00 UTC. Every
cell is 50 or more.

The finding in one sentence:

> Between 19 October and 12 November 2026, 215 of the 660 people who visited
> vibresia.com reached a shared vibescape, 32.6% of everybody who came to the
> site, and more than twice as many as reached a comparison page.

## The exact queries

Run with `POST https://us.i.posthog.com/api/projects/673583/query`, body
`{"query": {"kind": "HogQLQuery", "query": "<SQL below>"}}`, header
`Authorization: Bearer <POSTHOG_PERSONAL_API_KEY>`.

### The published numbers

```sql
SELECT
  count(DISTINCT person_id) AS visitors,
  count(DISTINCT if(properties.path IN ('/','/index.html'), person_id, null)) AS homepage,
  count(DISTINCT if(properties.path LIKE '/share%' OR properties.path LIKE '/s/%', person_id, null)) AS share,
  count(DISTINCT if(properties.path LIKE '/comparison%', person_id, null)) AS comparison,
  count(DISTINCT if(properties.path LIKE '/blog%', person_id, null)) AS blog,
  count(DISTINCT if(properties.path IN ('/agents','/vibescapes','/vibe') OR properties.path LIKE '/author%', person_id, null)) AS other
FROM events
WHERE event IN ('$pageview','page_view')
  AND properties.$lib IN ('vibresia-web','audiovane-web')
  AND properties.distinct_id != 'posthog-canary-check'
  AND properties.$referrer NOT LIKE '%localhost%'
  AND properties.$referrer NOT LIKE '%minithlabs%'
  AND properties.$referrer NOT LIKE '%sydlawrence%'
  AND properties.$referrer NOT LIKE '%127.0.0.1%'
  AND properties.path NOT LIKE '/probe%'
  AND timestamp <= '2026-11-12 14:00:00'
```

Result, 2026-11-12:

```
visitors  homepage  share  comparison  blog  other
660       285       215    101         57    52
```

### The overlap check behind the "does not add to 100" note

```sql
SELECT clusters_reached, count() AS visitors FROM (
  SELECT person_id, countIf(hit) AS clusters_reached FROM (
    SELECT person_id,
      (properties.path IN ('/','/index.html')) OR (properties.path LIKE '/share%' OR properties.path LIKE '/s/%') OR (properties.path LIKE '/comparison%') OR (properties.path LIKE '/blog%') OR (properties.path IN ('/agents','/vibescapes','/vibe')) AS hit
    FROM events WHERE event IN ('$pageview','page_view') AND properties.$lib IN ('vibresia-web','audiovane-web') AND properties.distinct_id != 'posthog-canary-check'
      AND properties.$referrer NOT LIKE '%localhost%' AND properties.$referrer NOT LIKE '%minithlabs%' AND properties.$referrer NOT LIKE '%sydlawrence%' AND properties.$referrer NOT LIKE '%127.0.0.1%'
  AND timestamp <= '2026-11-12 14:00:00'
  ) GROUP BY person_id
) GROUP BY clusters_reached ORDER BY clusters_reached
```

Result, 2026-11-12: 599 visitors reached exactly one kind of page, 59 reached two
or more, and 2 reached none of the five kinds and are counted in the total but in
no group.

### The date range

```sql
SELECT min(timestamp) AS first_ev, max(timestamp) AS last_ev, count() AS total_events, count(DISTINCT person_id) AS people
FROM events WHERE properties.$lib IN ('vibresia-web','audiovane-web')
  AND timestamp <= '2026-11-12 14:00:00'
```

Result, 2026-11-12: `2026-10-19T13:40:21.941000Z` to `2026-11-12T13:41:57.183000Z`,
3,033 events, 668 people before the internal-exclusion filters.

### The exclusion arithmetic

Applied in the order the cohort definition gives, each on top of the last.

```sql
SELECT count(DISTINCT person_id) FROM events WHERE event IN ('$pageview','page_view') AND properties.$lib IN ('vibresia-web','audiovane-web')  AND timestamp <= '2026-11-12 14:00:00'
```

Result: 666.

```sql
SELECT count(DISTINCT person_id) FROM events WHERE event IN ('$pageview','page_view') AND properties.$lib IN ('vibresia-web','audiovane-web') AND properties.distinct_id != 'posthog-canary-check'  AND timestamp <= '2026-11-12 14:00:00'
```

Result: 666. The canary posts no page views, so it removes nobody here.

```sql
SELECT count(DISTINCT person_id) FROM events WHERE event IN ('$pageview','page_view') AND properties.$lib IN ('vibresia-web','audiovane-web') AND properties.distinct_id != 'posthog-canary-check' AND properties.$referrer NOT LIKE '%localhost%' AND properties.$referrer NOT LIKE '%minithlabs%' AND properties.$referrer NOT LIKE '%sydlawrence%' AND properties.$referrer NOT LIKE '%127.0.0.1%'  AND timestamp <= '2026-11-12 14:00:00'
```

Result: 662. Four people removed.

The final query above, adding the probe-path exclusion, returns 660. Two more
people removed, and the two groups do not overlap.

### The app-side cohort, checked and rejected

```sql
SELECT count(DISTINCT person_id) AS people, count() AS n FROM events WHERE properties.surface='mac_app'
```

Result, 2026-11-12: 16 people, 7,573 events. Below the floor of 50. Not used.

## Known biases

- **These are people who found Vibresia, not people who want a Mac visualiser.**
  They are self-selected twice over: they searched for something, and they chose
  this site. The numbers describe Vibresia's audience, not the market.
- **The window is 25 days**, from the first event in the project to the run date.
  It is a short window and it is a launch-period window, so it is not a steady
  state.
- **One person is one browser.** A visitor who clears their local storage becomes
  a second person in the count. The site's own identifier is a random UUID in
  `localStorage` (`site/analytics.js`, `ID_KEY = "vibresia.site.distinctId"`), so
  there is no way to count a person more reliably than that, and no way to count
  them less reliably either.
- **A visitor can be in two groups**, which is why the percentages do not add to
  100.
- **The site's analytics is opt-out and can be blocked.** A visitor using an
  ad blocker, or who has switched the footer measurement off, sends nothing. They
  are not in the denominator either, so the ratios are between people we can see,
  not between all people who came.
- **Crawl and preview traffic is not distinguished** in the page-view events, so
  some of the 660 may be link previews rather than people.

## The sanity check against a public benchmark

There is no public benchmark for "which kind of page does a visitor to a music
visualiser site reach". Published engagement benchmarks for 2026 are platform
figures (TikTok at 2.60%, Instagram Reels at 0.45%, YouTube Shorts at 0.30%,
per Socialinsider's analysis of 69 million videos) and landing-page video
figures ("landing pages with embedded video see up to 86% higher conversion
rates", Komet Media). None of these measure the same thing as the reach of a
share page against a comparison page, so no comparison is drawn on the page.

The one internal cross-check that is available is the site's own search data, and
it points the same way: the queries reaching the site in the 28 days to
2026-11-10 are overwhelmingly "music visualiser for Mac" and "does X have a
visualiser" shaped, and the comparison cluster exists because those questions
arrive as comparisons. The share cluster's size is not a search effect, because a
shared link arrives by being sent to somebody, which is a different route in
entirely.

## Privacy gate, rule by rule

| Rule | How it is met |
|---|---|
| 1. Aggregates only | Every published number is a `count(DISTINCT person_id)`. No row, no identifier, no URL, no string. Nothing was logged or pasted. |
| 2. Minimum cohort of 50 | Cohort is 660. The smallest published cell is 52. Nothing below 50 is published. |
| 3. No sensitive categories | No breakdown by health, religion, ethnicity or sexual orientation. No category that could embarrass a group of users. |
| 4. Privacy policy covers aggregate publication | **Not clearly covered. See below.** |
| 5. Test and internal accounts excluded | The project's own canary identifier is excluded. Internal referrers (owner's machine, staging, owner's other site) and probe paths are excluded. 6 people removed. |
| 6. First publication needs the owner's sign-off | **This is the first publication of an original statistic. The draft stops here and waits for the owner's written sign-off.** |

### Rule 4, for the owner

`site/privacy.html` says what the app and the site collect, who else sees it
(PostHog, Cloudflare, GitHub, Discord, Stripe), and that the app's statistics are
tied to a random install identifier rather than to you. It does not say anywhere
that aggregate usage figures are published on the site.

The lines that are close, and what they do not do:

- "The website counts visits and clicks anonymously: which pages are looked at,
  which buttons are pressed, which vibescape cards are scrolled to." This says
  what is counted. It does not say the counts are published.
- "The count itself is done on our side, so the number of downloads is right even
  when an ad blocker stops the website's own count. The count is anonymous: it is
  a count, not a list of who." This is about the download count, and about the
  count being anonymous. It is the closest the policy comes, and it still does
  not say the number appears in public.

**This is the one thing the owner needs to decide.** Two ways to close it:

1. Add a short section to `site/privacy.html` saying that aggregate usage
   figures are published, that they are counts of groups of at least 50 people,
   and that they can be checked at `/stats/data/*`. This is the better answer,
   because it makes the published numbers auditable by the people whose data they
   are, which is what the section would be for.
2. Confirm that publishing the figures is already covered by the existing
   wording, and record that decision here.

Until one of those happens, the draft carries the marker **"privacy policy does
not cover this"** in the method section of the page, exactly as the routine
requires. The same marker is recorded here, because this is where the decision
is tracked:

> **privacy policy does not cover this**

Owner decision required before publication.

## What the build needs, when it is signed off

Not done in this run. The page was drafted as copy only, and `site/` was not
touched. When it is built:

- The page needs `index, follow` in its robots meta, unlike `/privacy` and
  `/terms`, which are `noindex, follow` by design. This page exists to be found
  and cited, so it has to be indexable.
- The page needs an entry in a sitemap. The site runs four of them
  (`/sitemaps/blog.xml`, `/sitemaps/comparisons.xml`, `/sitemaps/questions.xml`,
  `/sitemaps/gallery.xml`) plus the small `/sitemap.xml`. A statistics page does
  not belong in the blog, comparison, question or gallery lists, so it wants a
  fifth, `/sitemaps/stats.xml`, referenced from `robots.txt`.
- The page needs to be in `site/llms.txt`. The AI visibility check of 2026-11-12
  found that only 18 of the 30 monthly prompts that have an answer are reachable
  by an answer engine, because they are in `llms.txt` **and** carry FAQPage. A
  dataset page carrying `Dataset` structured data is exactly the kind of page
  that belongs in that file.
- The `license` property in the `Dataset` schema points at `/terms` as a
  placeholder. The owner should pick a real reuse licence for the figures. A
  dataset nobody is allowed to quote cannot do the job this page exists to do.

## What a later run needs

Nothing, unless the method changes. A refresh of the same metric, with the same
cohort definition and the same queries, does not need a second sign-off. If the
cohort definition, the exclusion rules or the queries change, it does.

The URL does not change when the numbers do. A later run adds a dated update
section to the page and updates the "last refreshed" row in `docs/stats/index.md`.
