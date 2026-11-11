# Product facts: where they live

The routines in `routines/` refer to a `docs/product-facts.md`. **That file
does not exist, and should not.** The project's own product truth sheet
already exists, is more complete, and is owned by Syd:

> `content/product-truth.md`

That is the single source of truth for every fact about Vibresia: what it is,
what it does, what it deliberately does not do, the price, the privacy lines,
the regulatory lines and the house style.

## What a routine does instead of reading a missing file

When a routine says "facts come from `docs/product-facts.md`", read
**`content/product-truth.md`** instead. If a fact you need is not there, do not
invent it and do not write around it: note it in the report as a gap, and
leave it out of shipped copy.

## The two facts that live elsewhere

Two things the truth sheet covers only in prose, kept here because a routine
does arithmetic on them.

### The site funnel events

The truth sheet describes the product. This is the funnel the CRO routine, the
organic conversion review and the harvest measure. Source:
`site/analytics.js` and `worker/index.js`.

| Step | Event | Where it fires |
|---|---|---|
| Visit | `$pageview` | `site/analytics.js` |
| Page view (site-side alias) | `page_view` | `site/analytics.js` |
| Download link clicked | `download_clicked` | `site/analytics.js` |
| Install command copied | `install_command_copied` | `site/analytics.js`, on a `[data-copy]` button |
| Download started | `download_requested` | `worker/index.js`, in the Worker |
| Vibescape card seen | `mode_card_viewed` | `site/analytics.js`, on scroll into view |
| Demo video played | `demo_played` | `site/analytics.js` |
| Outbound link clicked | `outbound_clicked` | `site/analytics.js` |

`mode_card_viewed` is the real name. An earlier routine wrote it as
`vibescape_card_viewed`, which the site has never emitted. The app-side
events (`app_launched`, `genre_detected`, `mode_changed`, `session_summary`,
`Application Installed` and the rest) describe app use, not the site funnel,
and must not be mixed into a site conversion rate.

### The one competitor fact that needs checking each run

`content/data/competitors.json` holds the competitor records: the price, the
platform, the licence and the last-verified date, per competitor. A page
cannot name a price or a platform that is not in a record, and a routine
cannot either. Read the record for the competitor in the same run it writes
about them.

## House style, for quick reference

- UK English. "visualiser", not "visualizer", except where the query is
  spelled the US way.
- No em dashes in shipped copy. `content/product-truth.md` and the generator's
  banned-phrase list both forbid them.
- Free to use, and yours to share. No ads, no account, no trial.
- macOS 14.2 or later, Apple silicon only.
- No product recommendation or pricing claims outside the truth sheet.
