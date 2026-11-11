# Daily error reports

One file per run of the `posthog-error-check` routine, named
`<YYYY-MM-DD>.md`.

A report calls out the outcome for every finding, not only the open ones. An
issue that was resolved in PostHog, an issue that was a bot, an issue that was
left active on purpose: each gets a line. A report that lists only what is
still broken makes the next run re-derive what was already known.

Sections:

1. Data health
2. Active errors, each with its decision (fix / resolve / leave / bot)
3. Reports from the self-driving inbox
4. Replay Vision findings
5. Rageclicks
6. Health and volumes
7. What shipped, with the SHA
