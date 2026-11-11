# SEO audit reports

One file per run of the `seo-audit` routine, named `seo-audit-<YYYY-MM-DD>.md`.

Sections, in this order:

1. Traffic snapshot
2. Group A table (top 15) — queries at position 4 to 20
3. Group B table (top 15) — pages with any query past position 20
4. Content briefs — what shipped, and what was parked
5. Issue close list
6. Links to the pull requests

A finding that cannot ship in the run is parked in the report, not filed as
an issue. The report's "parked for next rotation" section is the right
surface for it.
