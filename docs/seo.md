# SEO + CRO Boilerplate

A playbook for standing up programmatic SEO on a new product: comparison pages, "best X" round-ups, hub-and-spoke question pages, and the conversion layer on top. It is product-agnostic. The lessons come from running this on a live B2C SaaS product, and the evidence is summarised so you can judge whether it transfers to your market.

Throughout, `{product}` is your product, `{competitor}` is another product in your category, `{market}` is the country or segment you sell to.

Run it as phases, in order. Each phase has a gate: don't start the next one until the gate passes.

### How an agent runs this

A gate is a check, not a pause. Most gates are things a script or test can pass, and the agent moves on when they pass. Only these need a person:

1. **The truth sheet (1a)**: the owner confirms what the product does and doesn't do.
2. **The URL plan (1c)**: the owner approves which pages exist.
3. **The first page of each template**: the owner of brand voice approves the copy once; later pages of that template follow it.
4. **Anything that publishes or spends**: a production deploy, a post, a purchase, if the agent isn't allowed to do it.

Everything else runs without asking: research, records, validators, generators, tests, browser checks, the changelog, and moving on to the next phase or batch.

**Done means done.** A batch is finished when its pages are built, every check passes, the pages have been looked at in a browser at phone and desktop width, it's committed, and (if the kick-off allows it) merged and pushed. After a deploy, "done" also means the live checks have run: pages, sitemaps, redirects, structured data, analytics arriving. Don't end a turn with a list of what's left when the next item needs no person: do it.

**Keep the playbook moving.** The agent's job isn't finished until the playbook is, so it keeps steering towards that. At the end of every step it says which phase is next and what finishing it gets the owner, then asks **five qualifying questions** whose answers decide how to proceed: which template to build next, what the owner can supply (credentials, first-hand testing, a confirmed price), what may run without asking, what to measure. Each is multiple choice with the agent's recommendation first, so answering takes seconds. Don't ask what the code, the data or a check can answer, and don't let the questions replace work that needs no answer: do that work, then ask.

**Git.** Say in the kick-off whether the agent may commit, merge to the main branch and push. If it may, it does all three when the checks pass, without asking for each. If it may not, it asks once per batch ("commit, merge and push?"), not once per step.

**Volume.** Phase 6 says launch in waves of about 50 pages per template. The first wave is every row in the URL plan that has demand evidence and a complete record, up to that number. Don't start with three pages and wait to be asked for more.

**Delegate the parts that don't depend on each other.** Researching one competitor doesn't need another's record, and drafting one page doesn't need another page. Where the agent can run sub-agents:

- **Research (1b)**: one sub-agent per competitor, or per three or four. Each reads primary sources and returns its record, every fact with a source URL and the date checked. The lead agent merges them and runs the validator; a record the validator fails goes back to the sub-agent that wrote it.
- **Drafting (Phase 2)**: one sub-agent per page or per few pages, each given the truth sheet, the records it may use and the template's page file as an example. The lead agent reads every draft against the records before it builds: a sub-agent's claim is not a source.
- **Review**: a separate sub-agent checks the built pages for claims the records don't support and for the Phase 5 writing rules, before the batch is called done.

Keep generators, validators, shared files (`competitors.json`, the URL plan, the changelog) and git with the lead agent, so two agents never write the same file.

### Where the files go

File paths here are relative to the project root. `{data}` is wherever the project keeps structured data its pages are built from: `src/data/` in a Next.js or Astro app, `data/` beside a static site, a worker's own folder if pages are rendered there. Pick it once, before Phase 1, and write it into the product truth sheet so every generator reads from the same place.

| File | Purpose |
|---|---|
| `content/product-truth.md` | What the product does and doesn't do (Phase 1a) |
| `{data}/author.json` | Who writes the pages: byline, credentials, profiles (Phase 5) |
| `{data}/schema.json` | The Organization and WebSite nodes every page carries (Phase 4) |
| `{data}/competitors.json` | One sourced record per competitor (Phase 1b) |
| `{data}/competitor-pairs.json` | Third-party pairs worth a page (Phase 2b) |
| `competitor-profiles/raw/{slug}/` | Screenshots and notes from signing up (Phase 1b) |
| `content/url-plan.csv` | `url → target query → monthly volume → intent` (Phase 1c) |
| `SEO_CHANGELOG.md` | Every SEO change, with date and source (Phase 6) |

---

## 0. What we learned (evidence)

Search Console data, 90 days, web search only, grouped by page template:

| Template | Pages | CTR | Avg pos | Clicks / page |
|---|---|---|---|---|
| Third-party X vs Y (two competitors, we're the third option) | ~90 | 1.0% | 5.8 | **~14** |
| "Top 5 {competitor} alternatives" / "Best {category} tools" | ~70 | **1.4%** | 8.1 | ~8 |
| Original stats / data pages | 5 | 1.2% | 12.3 | ~9 |
| Head-to-head competitor X vs Y (category-wide) | ~55 | 1.3% | 8.5 | ~7 |
| Other blog posts | ~125 | 1.2% | 10.6 | ~3 |
| `{product}` vs `{competitor}` (+ sub-pages) | ~350 | 0.9% | 8.7 | 0.7 |
| Hub-and-spoke question pages ("Can I do X at Y with Z") | ~1,050 | **2.2%** | 14.3 | 0.26 |
| Guides | ~100 | 0.4% | 29 | 0.6 |
| Calculators | 15 | 0.1% | 37 | 0.9 |
| Location pages (`/locations/{town}/{service}`) | ~2,000 | 0.3% | 40 | **0.06** |

What converted: the pages that brought in signups on the first visit were "top 5 {competitor} alternatives" posts, "does {competitor} work in {market}" posts, and a handful of `{product}` vs `{competitor}` pages. Most other organic signups came in through the homepage or login page, i.e. branded search from people who already knew the name.

The lessons:

1. **Third-party X vs Y pages are the biggest traffic engine**, by a distance. People search "{competitor A} vs {competitor B}" far more than "{product} vs anything". You win the click as a neutral referee and introduce your product as the third option.
2. **"Alternatives to {competitor}" and "does {competitor} work in {market}" convert best.** The searcher is unhappy with, or blocked by, something they already use. That is the highest-intent organic visitor you'll get.
3. **`{product}` vs `{competitor}` pages get little traffic per page but convert when they do.** Their search volume is capped by the competitor's brand volume. Build them for competitors people actually search for, not for every company in the category. ~350 pages at 0.7 clicks each meant we built far too many.
4. **Mass location pages were a mistake.** ~2,000 pages, average position 40, 0.06 clicks a page. Several sub-pages per town competed for the same query (cannibalisation), and the content was a template with a place name swapped in. Google treats that as doorway pages. Don't do it without real local data.
5. **Hub-and-spoke question pages get the best CTR** because the title answers the exact question. But ~1,050 spokes producing very few impressions means most of the long tail had no demand. Generate spokes where search data shows demand, not every combination.
6. **Thin sub-pages hurt the parent.** An audit found ~90 competitor sub-pages under 300 words (the worst ~50 words). Three near-empty pages per competitor dilute the one good page.
7. **Calculators and guides underperformed** because the calculators shipped ~20 words of server-rendered HTML (results gated behind a client-only check). Crawlers saw a skeleton.
8. **Analytics undercounted organic by roughly 3x** compared with Search Console. Proxy the analytics script through your own domain from day one, and treat Search Console as the source of truth for traffic and analytics for behaviour.
9. **Pages rank but don't get clicked.** A Search Console review found dozens of queries at positions 11-20 with real impressions and zero clicks. Title and meta description are a conversion problem, not an afterthought.
10. **Wrong facts are expensive.** Copy across the site claimed an integration the product didn't have. A pattern-matching rule told readers two local companies billed in dollars when they billed in local currency. Every fact needs a source, and claims must be derived from structured data, never pattern-matched from prose.

---

## Phase 1. Product truth and market research

Nothing gets written until these files exist in the repo.

### 1a. Product truth sheet (`content/product-truth.md`)

One page, owned by the founder or product owner, that every page generator and writer reads first:

- What the product does today, in plain words. What it does **not** do (missing integrations, platforms, markets).
- Pricing, free tier, trial length, refund terms, as shipped.
- Who it is for, who it is not for.
- Regulatory lines it must not cross (e.g. a finance product that gives guidance but not regulated advice, a health product that can't make medical claims). Any required disclaimer text.
- Market and locale (currency, spelling, tax or legal system).
- Where `{data}` lives in this codebase.

Gate: a search for claims that contradict the truth sheet across existing copy returns nothing.

### 1b. Competitor research (non-negotiable)

Pros and cons on comparison pages must be accurate. A wrong "con" about a competitor is a legal risk and a trust killer. A wrong "pro" for yourself is worse.

Build `{data}/competitors.json`. One record per competitor, minimum fields:

```jsonc
{
  "slug": "example-app",
  "name": "Example App",
  "category": "budgeting",          // from a fixed list
  "audience": "uk_consumer",        // market/segment; drives which pairs make sense
  "homepage": "https://...",
  "tagline": "...",                 // one line, neutral
  "bestFor": "...",                 // who should genuinely pick them
  "strengths": ["..."],             // real ones; at least 3
  "painPoints": ["..."],            // from reviews/docs, not invented
  "ourAngle": "...",                // where we differ, honestly, including where they win
  "pricing": {
    "tiers": [{ "name": "...", "price": "36.99", "currency": "GBP", "period": "year|month|usage", "includes": [], "excludes": [] }],
    "freeTier": false,
    "sourceUrl": "https://.../pricing",
    "verifiedISO": "2026-08-04"
  },
  "trial":    { "...": "...", "sourceUrl": "...", "verifiedISO": "..." },
  "reviews":  { "score": 4.3, "count": 812, "platform": "Trustpilot", "sourceUrl": "...", "verifiedISO": "..." }
}
```

Research rules for whoever (human or agent) fills it in:

- **Primary sources first**: the competitor's own pricing page, docs, changelog, app store listing, terms. Then review sites (Trustpilot, G2, Capterra, App Store, Reddit) for pain points. Never rely on another comparison site or an LLM's memory.
- **Every factual section carries `sourceUrl` + `verifiedISO`.** If a section can't be sourced, leave it out and the page for that section doesn't render. No data, no page.
- **Sign up for the free tier or trial** where one exists and note what you actually saw. Keep screenshots in `competitor-profiles/raw/{slug}/`.
- **Pain points must appear in at least two independent reviews** or in the competitor's own docs. Quote at most 25 words from any review, attributed.
- **Write strengths as if the competitor would agree with them.** If you can't name three real strengths, you don't understand the product well enough to write about it.
- **Currency, market and billing are structured fields**, and copy that mentions them reads from those fields. Never infer them from text.
- **Freshness**: max 12 months since `verifiedISO`; warn at 9. Pricing pages change constantly.

Ship gate: a validator script, run in the build, that fails on a missing source, a stale date, a quote over 25 words, or an unknown category. Add unit tests that pin structural claims (currency, free tier, pricing model) to the structured data.

### 1c. Demand research

Before generating any template, pull keyword data (Search Console once the site exists; a keyword tool before then) for:

- `{competitor}` brand volume, `{competitor} alternatives`, `{competitor} vs`, `{competitor} pricing`, `{competitor} review`, `does {competitor} work in {market}`.
- Pairs people actually search for (`{a} vs {b}`). Autocomplete and "People also search for" are free sources.
- The question patterns for the hub-and-spoke cluster.

Gate: every page you're about to create maps to a query with measurable demand, or to a hub that the demand pages need. A spreadsheet of `url → target query → monthly volume → intent`, kept in `content/url-plan.csv`, is the plan.

---

## Phase 2. Page templates

Build in this order: it follows the traffic and conversion evidence above.

### 2a. "Alternatives to {competitor}" and "Best {category} tools in {YEAR}" (highest conversion)

URLs: `/blog/top-5-{competitor}-alternatives-{market}-{year}`, `/blog/best-{category}-tools-{year}`, `/blog/does-{competitor}-work-in-{market}`.

- Title pattern that won: `Top 5 {Competitor} Alternatives in the {Market} ({Year})`. Put the year in the title and the URL, and plan the refresh (see Phase 6).
- Open with the reason people leave the competitor (sourced pain points), then the list.
- Your product is in the list, honestly placed. If it isn't the best pick for a stated need, say who is.
- Each entry: who it's for, price (sourced), one real strength, one real weakness, "pick this if…".
- A comparison table near the top for skimmers and AI answer engines.
- "Does X work in {market}" pages answer the question in the first sentence, with the evidence, then offer the alternative.

### 2b. Third-party "X vs Y" (highest traffic)

URL: `/compare/{a}-vs-{b}` or a category-scoped path (`/{category}/comparison/{a}-vs-{b}`). Pick one canonical order per pair and 301 the reverse.

- Store pairs in `{data}/competitor-pairs.json` with `audience`, `whyCompared` and a `verdict`. Only pair products that share an audience: two products from different markets or categories is not a real search.
- The page is a **referee, not a player**: it answers "which of these two is right for me" fairly. That's why it ranks and why the visitor trusts the third option.
- Structure: verdict first → side-by-side table (price, free tier, key features, ratings, all sourced) → where A wins → where B wins → **where both fall short** → the third option (your product) framed around that gap → FAQ.
- The third option is opt-in per pair and only where you genuinely fill the shared gap. Add a test that fails if the promotional block appears on pairs that haven't opted in: a block that shows on every page by default turns dozens of fair comparisons into adverts.

### 2c. `{product}` vs `{competitor}`

URL: `/comparison/{product}-vs-{competitor}`, with a hub at `/comparison` that lists them all. This is also the page for the singular "{competitor} alternative" query: the reader wants one replacement, so show the two products and make the case for yours. (The plural "{competitor} alternatives" with several real options is a 2a list.) No year in the URL; the year goes in the title. Optional data-backed sub-pages: `/pricing`, `/review`, `/free-trial`, `/alternatives`, rendered only when the data exists.

- Only build for competitors with measurable brand search volume. Start with the top 10-20.
- Honest verdict at a glance, including "pick {competitor} if…". Argue for your product, but only where it wins for the reader: a page saying you beat a tool your product doesn't replace is wrong for its readers and a risky comparative claim (Phase 5).
- Every head-to-head links to the hub and to every other head-to-head, generated, so no new page hangs off one link.
- Feature table with ✓/✗ only for features verified in Phase 1b.
- Pricing comparison worked through a realistic example (e.g. what a percentage fee or per-seat price costs a typical customer over a year). A worked number is more persuasive than any adjective.
- Switching section: what it takes to move, how long, what you lose.
- No topical sub-pages (`/budgeting`, `/reporting`, etc.) unless each has 600+ words of original analysis. Thin ones drag the parent down.

### 2d. Hub-and-spoke question pages

Pattern: a hub that answers the general question, spokes that answer the specific one. Examples: hub `/can-i-retire-at`, spokes `/can-i-retire-at/{age}`; "how much does X cost in {city}"; "{tool} for {use case}"; "is {thing} worth it at {scale}".

- Each spoke must contain something computed for that combination: a worked number, a chart, a verdict. If two spokes would read the same with the variable swapped, merge them.
- Answer in the first sentence, in the words of the query. That's what drives the high CTR.
- Only generate spokes where demand data shows the query exists. Cap the first batch at ~50, measure for 8 weeks, then expand the ones getting impressions.
- Spokes link to the hub and to 2-4 neighbours (adjacent values). The hub links to every spoke it has.
- An embedded interactive tool on the hub, server-rendered (see Phase 4).

### 2e. Data / stats pages

URL: `/stats/{topic}`. Original numbers (your own aggregated, anonymised product data, or public data you've analysed) are what journalists and AI answer engines cite. A handful of these outperformed most templates per page, and they earn backlinks.

### 2f. What not to build (or build only with real data)

- **Location pages** without genuinely local data (local prices, providers, regulations, stats). If you do build them: one page per place, never several service sub-pages per place targeting the same query.
- **Glossary pages** with one term per URL. One glossary page with anchors is enough.
- **Thin calculator pages** that render nothing server-side.

---

## Phase 3. CRO on every SEO page

The searcher arrived with a question. The page converts by answering it fully, then showing the product as the natural next step for *their* situation.

### Page anatomy

1. **H1 = the query, answered.** Verdict in the first 2 sentences.
2. **Skimmable proof**: comparison table or computed result above the fold.
3. **Contextual CTA after the answer**, not before. The CTA text names the job ("See your own number" beats "Sign up"). CTAs vary by template; keep the mapping in one file.
4. **Body**: the detail, with an inline CTA where the content exposes the gap the product fills (the "where both fall short" section is the best spot).
5. **Trust**: author byline with real credentials, "last verified {date}", sources listed, any regulatory disclaimer.
6. **FAQ** (with FAQPage schema), drawn from People Also Ask and real support questions.
7. **Closing CTA** that removes the remaining objection (free tier, no card, time to value).

### Rules

- One primary CTA per page; everything else is secondary styling.
- Carry context into signup: pass `?from={template}&topic={slug}` and use it to personalise the signup heading and the first onboarding step ("You were comparing {competitor}: here's how to bring your data across"). Comparison visitors who sign up tend to do it in the same visit; don't make them start from zero.
- Let the visitor do something before signup where possible: a calculator result, a score, a preview. Gate the save, not the answer.
- Title + meta description are CRO. For any query at position 1-20 with impressions and CTR under 1%, rewrite the title to match the query wording and promise the specific answer.
- Mobile first: the comparison table must work at 375px (stack, or horizontal scroll with the first column sticky).

### Measurement (set up before launch)

- Proxy analytics through your own domain.
- Connect Search Console to your analytics warehouse (PostHog has a native Search Console source; BigQuery has a bulk export) so impressions → sessions → signups can be joined by page.
- Events: `cta_clicked` with `{template, slug, position}`, `signup_started`, `user_signed_up` with first-touch `{initial_pathname, initial_referring_domain}`, set server-side as well as client-side.
- A dashboard grouped by **template**, not by URL: impressions, clicks, CTR, position, sessions, CTA click rate, signup rate. Template-level numbers are how you decide what to build more of and what to kill.
- A/B test CTA copy and placement per template once a template passes ~1,000 sessions a month.

---

## Phase 4. Technical SEO checklist

We hit every one of these. Check them on day one.

- [ ] **Server-render the content.** Fetch real HTML with `curl` and count words. Calculators: render the page and the explanatory content on the server; gate only the interactive result on the client.
- [ ] **JSON-LD in a plain `<script type="application/ld+json">`.** In Next.js, `next/script` puts it in the RSC payload, not the HTML, so crawlers never see it.
- [ ] **Canonicals per page.** Never set a canonical in a shared layout; every child inherits it and points at the wrong URL.
- [ ] **Middleware actually runs in production.** Verify headers and redirects on the deployed site, not in dev.
- [ ] **Sitemap index** split by template (`/sitemaps/comparisons.xml`, `/sitemaps/questions.xml`), with real `lastmod`. Submit each to Search Console so indexing can be tracked per template.
- [ ] **Schema per template**: `Article` + `Person` author (with credentials, `sameAs`), `FAQPage`, `ItemList` for best-of lists, `BreadcrumbList` everywhere, `SoftwareApplication`/`Product` with sourced offers for comparisons.
- [ ] **FAQs and Organization on every indexable page**, not just the search pages: the homepage, docs pages, hubs, author pages, generated pages. One `Organization` (and `WebSite`) node, defined once in `{data}/schema.json` and copied word for word everywhere, with every other node pointing at it by `@id` (`publisher`, `worksFor`). Every `FAQPage` question is visible on the page. A check fails any indexable page that's missing either, or whose Organization node differs; noindex pages are skipped.
- [ ] **Internal linking**: hubs ↔ spokes, every competitor page ↔ its pairs and alternatives post, a related-links block on every template. No orphan pages.
- [ ] **One URL per intent.** Before generating, check no two URLs target the same query. Run a cannibalisation check on Search Console monthly (one query, several ranking pages).
- [ ] **`llms.txt` and AI crawler access** (GPTBot, ClaudeBot, PerplexityBot allowed in robots.txt) so comparison tables and stats get cited.
- [ ] **Verify audits against real HTML.** Audit tools and agents that fetch pages often strip `<script>` and falsely report "no schema". Parse the actual `ld+json` blocks yourself.
- [ ] **Core Web Vitals** on each template, not just the homepage.

---

## Phase 5. Writing and quality gates

- Copy goes through whoever owns brand voice. Engineers build templates; they don't ship wording.
- Run every page through an AI-writing audit (no "In today's fast-paced world", no "delve", no em-dash cascades, no empty superlatives).
- Minimum original content: 600 words for comparison and best-of pages, 300 for spokes **plus** a computed element. A page under the bar doesn't publish; it waits or merges into its parent.
- E-E-A-T: a real named author with credentials relevant to the topic, an author page, and first-hand evidence ("we signed up for the free trial on {date}; here's what we saw").
- Get the author's credentials by asking them five questions (role, years of experience, what makes them credible on this topic, public profiles, photo). Store the answers once, in `{data}/author.json`, and build the byline, the `Person` schema and the author page from it, so they can't disagree. The author page lists every page the author wrote, generated.
- Dates, currency and spelling in the target market's format.
- Legal: comparative claims must be factual and verifiable (UK CAP code, US FTC and EU rules on comparative advertising all apply). Don't use competitor logos without permission; trademarked names in text are fine for comparison.

---

## Phase 6. Launch, measure, prune, refresh

- **Launch in waves of ~50 pages per template**, not thousands. Measure for 6-8 weeks before generating more of a template.
- **Monthly Search Console review:**
  - Striking distance: position 11-20, >50 impressions → improve content and title.
  - Zero-click: position 1-10, CTR well under the expected rate → rewrite title and meta.
  - Long-tail gaps: queries ranking >30 with impressions → new spoke or new section.
  - Cannibalisation: one query, several URLs → merge and 301.
- **Prune**: after 6 months, a page with under ~10 impressions a month and no backlinks is either merged into its parent (301) or noindexed. Fewer, better pages beat many thin ones.
- **Year rollover**: every `{YEAR}` page gets refreshed and re-dated in January (change the URL only if the year is in it, and 301 the old one). Put it on the calendar on day one.
- **Re-verify competitor data** on the validator's schedule (12-month max, warn at 9). Re-check pricing quarterly for the top 10 competitors.
- **Event-driven refreshes**: when the market changes (new regulation, a competitor's price change, a major industry event), sweep every affected page within a week and log it in an `SEO_CHANGELOG.md` with the source.
- Keep a changelog of every SEO change (date, URL, queries targeted, title before → after, schema, links). It's the only way to attribute ranking changes later.

---

## Kick-off prompt for a new project

> Using `seo.md`: decide `{data}` for this codebase, then run Phase 1 for {product} ({one-line description}, market: {market}). Read the codebase and write `content/product-truth.md` for me to check. Then list the 20 competitors with the most search demand, research each from primary sources into `{data}/competitors.json` with a source and verification date on every fact, and build the validator. Then pull demand data and produce `content/url-plan.csv` for templates 2a-2d. Stop for my review at the truth sheet and the URL plan only (see "How an agent runs this"); run everything else through to done. Use sub-agents for competitor research and page drafts. {You may / may not} commit, merge to main and push when every check passes.
