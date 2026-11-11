# CRO log

The weekly conversion check appends here. `docs/conversion-model.md` holds the
funnel and the page-type taxonomy this file reads; `content/product-truth.md`
holds the product facts.

Each entry is one run, newest at the top. No user identifiers, no email
addresses, no personal data.

---

## <YYYY-MM-DD> — weekly CRO check

### Data health

- Events seen: <n> `$pageview`, <n> `download_clicked`, <n> `install_command_copied`, <n> `download_requested`
- Window: <start> .. <end> (28 days)
- Capture gap: <yes/no. If browser clicks and worker downloads disagree by
  more than the usual, say so and name the number>
- Anything that would make the numbers wrong: <ad blockers, a proxy failure,
  a deploy in the middle of the window, whatever applies>

### By page type

Raw counts beside every rate. A rate without its counts is unreadable.

| Page type | Visits | Downloads (worker) | Download clicks | Rate | Signal |
|---|---|---|---|---|---|
| Home | | | | | |
| Comparison | | | | | |
| Blog | | | | | |
| Question | | | | | |
| Vibescape | | | | | |
| Agents | | | | | |

### The queue

At most three candidates. Each with the evidence, the change, the metric, the
guardrail, the review window and a keep/revert rule.

#### 1. <page> — <the change in one line>

- **Evidence:** <the numbers>
- **Proposed change:** <one change, the smallest that would plausibly move it>
- **Primary metric:** <what moves>
- **Guardrail:** <what must not get worse>
- **Review window:** <length>
- **Keep/revert:** <the rule>

### What shipped

| Change | SHA | Deploy date |
|---|---|---|

A merge is not a deploy. The site ships when the Worker is deployed; the app
ships when a release is cut. Record the deploy date and the SHA before the
review window starts.

### What did not ship, and why

-
