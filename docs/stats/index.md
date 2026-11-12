# Original statistics

The published statistics, one row each. The `original-statistics` routine adds
a row when it publishes a new metric and updates the "last refreshed" date
when it re-runs the same one.

A number is only publishable when it clears the privacy gate in
`routines/original-statistics.md`: aggregates only, a cohort of at least 50
people, no sensitive categories, and a method file recording the cohort, the
date and the exact query.

A URL never changes. When the numbers update, add a dated update section to
the page rather than republishing under a new path.

## Published

| Metric | URL | Published | Last refreshed | Cohort |
|---|---|---|---|---|
| _(none yet)_ | | | | |

## In progress

| Metric | Question it answers | Status |
|---|---|---|
| What people look for when they look for a Mac music visualiser | What do people actually reach for when they are looking for a music visualiser for a Mac? | Drafted 2026-11-12, waiting on the owner's written sign-off. Not published. |

## Notes

- The first publication needs the owner's written sign-off on the draft.
  Later runs on the same metric need none unless the method changes.
- `/stats/*` pages that restate published government or industry figures are
  not original statistics. They are excluded from this index.
- The data source is PostHog, project `673583`, not Supabase. The routine's
  `data_source` question defaults to `supabase` and that default is wrong for
  this project. The Mac app reports into the same project but its cohort is 16
  installs, below the privacy gate's floor of 50, so nothing app-side is
  publishable. The website surface is the only source that clears the gate.
- The privacy policy does not yet say that aggregate figures are published.
  That is the open item for the owner on the first publication, and the draft
  carries the marker "privacy policy does not cover this".
