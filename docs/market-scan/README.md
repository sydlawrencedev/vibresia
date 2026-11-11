# Market scans

One file per run of the `ongoing-market-scanner` routine, named
`<YYYY-MM-DD>.md`.

Each scan records:

- new competitors found, and the check against the bar in
  `docs/competitors.md` (launched in Global, 20 or more monthly impressions
  before a "5 alternatives" post is written). Record the check either way.
- competitor review complaints, counted by theme rather than merely flagged,
  with links. A theme that repeats 3 or more times in 30 days becomes a page
  brief, written into the same file.
- news worth covering, checked against existing site coverage first
  (`git grep -il "<topic>" origin/main`).
- the "Paste and send" block, at most 5 lines, when the routine cannot post.

Reviews are research, not a contact list. Never reply to a reviewer on a
review site to pitch Vibresia. Flag a review to a human only where the
reviewer publicly asks for alternatives.
