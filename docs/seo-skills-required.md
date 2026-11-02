# Skills required to run the SEO playbook

`docs/seo.md` says what to do. This file says which agent skills do it, phase by
phase, so a new session can check its environment before it starts and a gap in
the list is noticed rather than quietly skipped.

Two rules hold the list together:

- **A skill is a method. The gates are the repo's scripts.** `npm test` and the
  `scripts/check-*.mjs` set decide whether a batch ships. A skill's checklist
  never stands in for a script that fails the build.
- **A missing skill does not lower the gate.** It means the work is done by
  hand, under the same rules in `docs/seo.md`.

## Where the skills live

| Location | What it holds |
|---|---|
| `~/.claude/skills/<name>/` | Most of them. Some directories carry a hash suffix (`seo-audit--4af4d70125`), which is the same skill under a different directory name. Many are symlinks into a plugin cache. |
| `~/.claude/skills/agent-skills/skills/<name>/` | `performance-optimization`, `browser-testing-with-devtools`, `test-driven-development`, `code-review-and-quality`, `planning-and-task-breakdown`. |
| `~/.agents/skills/<name>/` | `stop-slop`. |
| `.claude/skills/` in this repo | Project-local skills (`integration-swift`). The SEO work does not use them. |

## Required skills

### Operating mode: "How an agent runs this"

The playbook runs the lead agent, sub-agents and git in a specific shape. These
three cover that shape.

| Skill | What the playbook asks for |
|---|---|
| `dispatching-parallel-agents` | "Delegate the parts that don't depend on each other": one sub-agent per competitor, one per page draft, one reviewer per batch. |
| `subagent-driven-development` | Running those sub-agents inside the current session, with the lead agent keeping the shared files (`competitors.json`, the URL plan, the changelog) and git. |
| `verification-before-completion` | "Done means done". Evidence from a command before the claim that a batch is finished. |

### Phase 1: product truth and market research

| Skill | What the playbook asks for |
|---|---|
| `deep-research` | Reading primary sources for a competitor record with the citation trail intact, and treating a source that refuses to be read as a fact about the site. |
| `competitor-profiling` | Building each competitor's profile from its own pricing page, docs, changelog, app store listing and terms (1b). |
| `keyword-research` | Demand research (1c): brand volume, "alternatives", "vs", "pricing", "does X work in {market}", and the pair queries. Feeds `content/url-plan.csv`. |
| `test-driven-development` | The validator and its unit tests (1b: "add unit tests that pin structural claims to the structured data"), and the generator's `--check`. |

### Phase 2: page templates

| Skill | What the playbook asks for |
|---|---|
| `programmatic-seo` | Templates and data at scale: the URL plan, one URL per intent, the thin-page guard, the wave of about 50 pages. |
| `site-architecture` | The URL plan and internal linking: hubs to spokes, every comparison to its siblings, no orphans, breadcrumbs. |

### Phase 3: CRO on every SEO page

| Skill | What the playbook asks for |
|---|---|
| `page-cro` | The page anatomy: answer first, proof above the fold, one primary CTA, context carried into signup. |
| `meta-tags-optimizer` | Title and meta description as a conversion problem: "for any query at position 1-20 with impressions and CTR under 1%, rewrite the title". |
| `analytics-tracking` | The events (`cta_clicked`, `signup_started`, `user_signed_up`), the first-touch fields, the template on every event, the script proxied through our own domain. On this site the conversion is a download, so the events that exist are `outbound_clicked`, `demo_played` and `install_command_copied`. |
| `ab-test-setup` | CTA copy and placement per template, once a template passes about 1,000 sessions a month. |
| `ab-test-analysis` | Reading the result: significance, sample size, ship, extend or stop. |

### Phase 4: technical SEO

| Skill | What the playbook asks for |
|---|---|
| `schema-markup` | The per-template JSON-LD: `Article`, `Person`, `FAQPage`, `ItemList`, `BreadcrumbList`, `SoftwareApplication` and `Product` with sourced offers. |
| `schema-markup-generator` | Generating and validating the JSON-LD for a page type before it goes into the template. |
| `ai-seo` | Getting the comparison tables and stats pages cited by AI answer engines. |
| `geo-llmstxt` | `llms.txt`. |
| `geo-crawlers` | `robots.txt` for GPTBot, ClaudeBot, PerplexityBot and the rest, so the crawlers can read the site at all. |
| `geo-citability` | Scoring whether a page is worth quoting, and rewriting it when it is not. |
| `performance-optimization` | Core Web Vitals on each template, not just the homepage. |
| `browser-testing-with-devtools` | The browser checks: real HTML, console errors, network, 375px and desktop, the demo reel on a search page. |

### Phase 5: writing and quality gates

| Skill | What the playbook asks for |
|---|---|
| `content-writer` | Drafting the first page of a template to the house pattern, so later pages of that template follow it. |
| `copywriting` | CTA text that names the job ("See your own number" beats "Sign up"), and the third-option block that stays a referee and not an advert. |
| `copy-editing` | The copy sweep on each page, including the January year refresh. |
| `avoid-ai-writing` | The AI-writing audit the playbook requires ("no 'In today's fast-paced world', no 'delve', no em-dash cascades"). Detection mode is enough for a gate. |
| `stop-slop` | The same audit from the other side: filler phrases, formulaic binary contrasts, dramatic fragmentation. |
| `grammar-check` | The last read for grammar, logic and flow before the page goes to the owner. |

### Phase 6: launch, measure, prune, refresh

| Skill | What the playbook asks for |
|---|---|
| `seo-analysis` | The monthly Search Console review: striking distance, zero-click, long-tail gaps, cannibalisation, and the per-template numbers that decide what to build more of. |
| `seo-audit` | The wider technical audit: indexation, schema gaps, Core Web Vitals, crawl errors, metadata. |
| `seo-page` | A single page that ranks but does not convert, or one that has fallen under the word bar. |

## Optional skills

Useful here, not needed to run the playbook.

| Skill | Use it for |
|---|---|
| `qwoted-seo-backlinks` | Stats pages (2e) earn backlinks: build the sourced stats page, then pitch it to journalists. |
| `picky-performance` | A deeper pass at Core Web Vitals than `performance-optimization` when a template is slow. |
| `picky-tester` | Black-box QA of the search pages, as a reader moving through them. |
| `dogfood` | Exploratory testing of a new template before the batch ships. |
| `content-strategy` | Choosing the next template from the per-template numbers. |
| `planning-and-task-breakdown` | Breaking the URL plan into batches of about 50. |
| `code-review-and-quality` | The generator and validator code, before a large template lands. |
| `market-seo` | A single-page SEO audit with a score. Overlaps `seo-audit`, use one. |
| `market-competitors` | A competitor landscape view. Overlaps `competitor-profiling`, use one. |
| `geo` | The full GEO audit across every platform, when one is worth the time. |
| `git-workflow-and-versioning` | The commit, merge and push discipline the playbook expects of a batch. |
| `signup-flow-cro` | Carrying `?from={template}&topic={slug}` into signup and personalising the first step. Vibresia has no signup form, so this one has nothing to bite on yet. |
| `onboarding-cro` | The same, for the first run after the download. |
| `clarify` | The wording of CTAs, inline error messages and labels on the search pages. |

## What no skill covers

These are the playbook's gates that the repo enforces in code. A skill may help
write them, but the script decides.

| Playbook requirement | What enforces it here |
|---|---|
| Competitor record validation: missing source, stale date, quote over 25 words, unknown category | `node scripts/check-competitors.mjs` |
| The source URL is still the page the fact came from, and the quote is on it | `node scripts/check-sources.mjs`. Needs the network, so it is not in `npm test`. Run it when facts are added or a competitor moves a page. |
| Word count, banned phrases, description length, out-of-date pages | `node scripts/generate-seo-pages.mjs --check` |
| No orphan pages, no broken internal links | `node scripts/check-links.mjs` |
| Organization, WebSite and a visible FAQ on every indexable page | `node scripts/check-schema.mjs` |
| The banned phrase list in hand-written copy | `python3 scripts/inject-chrome.py --check`, and the generator's own `BANNED` list |
| Live checks after a deploy: pages, sitemaps, redirects, structured data, analytics arriving | The owner deploys. The agent checks the live site straight after. |

## Where this site differs from the playbook

The playbook is product-agnostic. These are the places where Vibresia does not
match it, so a skill is not asked for something the site cannot do.

- The conversion is a download, not a signup. There is no account, no trial and
  no subscription (`content/product-truth.md`), so `signup_started` and
  `user_signed_up` have no counterpart, and the Phase 3 rule about carrying
  `?from={template}&topic={slug}` into signup has nothing to land on.
- The app is free, so the Phase 2c sub-pages (`/pricing`, `/review`,
  `/free-trial`) do not exist.
- The author questions in Phase 5 are answered and stored in
  `content/data/author.json`, so the byline, the `Person` schema and the author
  page are built from one file.
- The owner has not tested the competitor apps, so the pages say so rather than
  claiming first-hand evidence.

## Gaps that need a person

No skill closes these, so the playbook's rule applies: the owner does them.

- Signing up for a competitor's free tier or trial, seeing what it actually
  does, and keeping the screenshots (1b). Not done yet: the pages say so.
- Approving the truth sheet, the URL plan, and the first page of each new
  template. The truth sheet and the plan are done; the first page of every
  template still comes back to the owner.
- Anything that publishes or spends: a production deploy, a post, a purchase.
- A confirmed price, or a confirmed currency, when the source only shows a
  symbol.

## Checking the list is still true

Run this at the start of a session. It prints one line per required skill and
says `MISSING` for any that is not installed. The name in the list is the
skill's own name, so the directory may carry a hash suffix.

```sh
for s in dispatching-parallel-agents subagent-driven-development \
         verification-before-completion deep-research competitor-profiling \
         keyword-research test-driven-development programmatic-seo \
         site-architecture page-cro meta-tags-optimizer analytics-tracking \
         ab-test-setup ab-test-analysis schema-markup schema-markup-generator \
         ai-seo geo-llmstxt geo-crawlers geo-citability performance-optimization \
         browser-testing-with-devtools content-writer copywriting copy-editing \
         avoid-ai-writing stop-slop grammar-check seo-analysis seo-audit seo-page; do
  found=$(find ~/.claude/skills ~/.agents/skills -maxdepth 3 \
            \( -name "$s" -o -name "$s--*" \) 2>/dev/null | head -1)
  if [ -n "$found" ]; then printf 'ok      %s\n' "$s"; else printf 'MISSING %s\n' "$s"; fi
done
```

Note that many of the skill directories are symlinks into a plugin cache, so
`find -type d` will not see them. Match on the name alone.

## Tools that are not skills

The hub scene and the browser checks need more than a skill.

| Tool | What it does |
|---|---|
| The vibresia MCP server (`preview_vibescape`, `vibescape_reference`) | Drawing the hub's live scene so the answer on the page is the real thing, not a mockup. The scene shader lives in `content/scenes/hub-live.glsl` and is drawn by `site/share/preview.js`. |
| The Chrome DevTools MCP server | What `browser-testing-with-devtools` drives. It is not configured in this repo, so the browser checks so far have used the local static preview on port 8765 instead. |
