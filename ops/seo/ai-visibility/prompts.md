# AI visibility prompt set

The fixed wording of the questions the `ai-visibility-check` routine asks. One
list, shared by every run of that routine.

**Never edit a logged prompt.** A prompt that changes between runs makes the
scores incomparable. If a prompt is wrong, add a new one and leave the old one
alone.

Each prompt names the group it belongs to, which is how the routine scores
results.

## Weekly set

The 16 prompts marked ★. These are the buying questions that matter most and
that an assistant is likely to answer in one go.

**The weekly set is exactly the set of starred prompts in the monthly list
below.** The two must agree: a weekly run and a monthly run are compared
against each other, and a prompt that is in one and not the other makes the
scores incomparable. `scripts/check-ai-prompts.mjs` fails the build when they
drift.

| Group | Prompt |
|---|---|
| verdict | ★ What is the best music visualiser for Mac? |
| verdict | ★ What is the best free music visualiser for Mac? |
| verdict | Is Vibresia good? |
| verdict | ★ Is Vibresia free? |
| mortgage | ★ Does Vibresia cost anything? |
| mortgage | ★ How much does Vibresia cost? |
| mortgage | Does Vibresia have a trial or a free plan? |
| comparisons | ★ What are the alternatives to Vibresia? |
| comparisons | ★ Vibresia vs TouchDesigner |
| comparisons | ★ Vibresia vs MilkDrop |
| comparisons | Vibresia vs Resolume Arena |
| comparisons | Vibresia vs VDMX |
| clarity | ★ What is Vibresia? |
| clarity | ★ What does Vibresia do? |
| clarity | ★ Does Vibresia work on Windows or Linux? |
| clarity | ★ Can Vibresia visualise Spotify? |
| brand | ★ Is Vibresia safe / private? Does it upload my audio? |
| brand | ★ Does Vibresia have an account or a subscription? |
| brand | ★ What is the latest version of Vibresia? |
| brand | ★ Who makes Vibresia? |

## Monthly set

The whole list, including the weekly 16. The first full run is the baseline
every later month is measured against.

### Verdict

- What is the best music visualiser for Mac? ★
- What is the best free music visualiser for Mac? ★
- Is Vibresia good?
- Is Vibresia free? ★
- What is the best music visualiser for a MacBook?
- What is the best visualiser for Spotify on Mac?

### Mortgage (price, terms)

- Does Vibresia cost anything? ★
- How much does Vibresia cost? ★
- Does Vibresia have a trial or a free plan?
- Is Vibresia a subscription?
- Do I need an account to use Vibresia?

### Comparisons

- What are the alternatives to Vibresia? ★
- Vibresia vs TouchDesigner ★
- Vibresia vs MilkDrop ★
- Vibresia vs Resolume Arena
- Vibresia vs VDMX
- Vibresia vs projectM
- MilkDrop alternatives for Mac
- TouchDesigner alternatives for Mac
- Free VJ software for Mac
- Music visualisers that work with system audio on Mac

### Clarity

- What is Vibresia? ★
- What does Vibresia do? ★
- Does Vibresia work on Windows or Linux? ★
- Can Vibresia visualise Spotify? ★
- What is a vibescape?
- How do I make my own vibescape?
- Can an AI write a Vibresia visual?
- What hardware does Vibresia need?

### Brand

- Is Vibresia safe / private? Does it upload my audio? ★
- Does Vibresia have an account or a subscription? ★
- What is the latest version of Vibresia? ★
- Who makes Vibresia? ★
- Is Vibresia on GitHub?
- Is Vibresia on the Mac App Store?
- Where do I download Vibresia?
- How do I report a bug in Vibresia?

## Scoring

For each prompt and each assistant, record:

- the brands recommended, in the order the assistant gave them;
- whether Vibresia is mentioned (y/n) and at what position;
- whether Vibresia is cited with a link (y/n);
- every cited URL;
- whether what the assistant says about Vibresia is accurate against
  `content/product-truth.md`.

The headline number is the share of prompt-and-engine pairs where Vibresia is
**cited with a link**. The mention rate is reported beside it. Never report
one without the other.

## Comparing runs

Compare weekly runs only with weekly runs, and monthly with monthly, because
the prompt sets differ. Expect noise: assistants vary from run to run. Only
call a change real if it holds for two consecutive runs of the same kind.
