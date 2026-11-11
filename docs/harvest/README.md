# Harvest reports

One file per run of the `gsc-keyword-harvesting` routine, named
`<YYYY-MM-DD>.md`.

If today's file exists from a morning run, prepend a "second pass" section
that leads with the three-line summary of what changed since the morning, and
keep the morning body as an appendix.

The report is written in the main working tree, not in the worktree, and it
is not committed. The changes it describes are shipped separately, through the
worktree.

A report starts with the summary and then covers: the search window and
totals, locked versus unlocked with the reason, the pages changed and why,
the checks run and their results, the push STATUS, the five analysis tables,
and what was left for tomorrow.

The report shape is in `routines/gsc-keyword-harvesting.md`.
