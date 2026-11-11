# Conversion model

The definitions every conversion routine reads instead of assuming. The CRO
routine, the organic conversion review and the keyword harvest all rank pages
against this file.

Last reviewed: 11 November 2026.

## The funnel

Vibresia has no signup, no account, no onboarding and no checkout. A visitor
lands on a page and the conversion is a **download of the app**.

The download happens at three observable points, in descending order of intent:

| Event | Fires in | Meaning |
|---|---|---|
| `download_requested` | Worker (`worker/index.js`) | The download actually started. Strongest signal. |
| `download_clicked` | Browser (`site/analytics.js`) | Somebody clicked a download link. Strong signal, but the click can fail. |
| `install_command_copied` | Browser (`site/analytics.js`) | Somebody copied the install command. Mid-funnel intent. |

`download_requested` is the conversion. `download_clicked` is the browser-side
approximation of it and is a lower bound.

## The capture gap

The browser events reach PostHog through the site's own `/ingest` proxy. The
Worker's `download_requested` reaches PostHog directly. If the browser path
breaks (an ad blocker, a proxy failure), clicks fall while downloads do not.

**Every report prints both counts and says when they disagree.** A page with
40 `download_clicked` and 3 `download_requested` is a capture gap until proven
otherwise, not a page that converts at 7.5%.

`download_requested` has a floor of 1 user in the last 28 days, because the
Worker only reports the download once per distinct person in a window. Treat a
low `download_requested` count with a healthy `download_clicked` count as
capture loss until the data says otherwise.

## First-touch attribution

The site sends a `$set_once` block on `$pageview`, so the first page a person
landed on and the first site that referred them are kept on the person and
never overwritten:

| Property | Where it lives | What it is |
|---|---|---|
| `$initial_pathname` | person properties | The path of the first page the person saw |
| `$initial_referring_domain` | person properties | The hostname that first referred them, or `$direct` |

Both were verified against PostHog itself on 11 November 2026: a probe event
with `$set_once` at the top level of the event and another with it nested
inside `properties` were both applied to the person, so the client's nesting
is correct.

**Read them from the person, not from the event.** `properties.$set_once` is
absent from a stored event by design, because it has been applied to the
person instead. A query that looks for the property on the event finds
nothing and wrongly concludes the attribution is broken.

A person whose first event was not a pageview, such as the worker-side
download, has a null `$initial_pathname`. That is expected, not missing data.

The routine `organic-conversion-review` asks for `landing_page` and
`landing_referrer`. **Nothing sets those names.** They are the same idea
under different names, and this file is the mapping. Use
`$initial_pathname` and `$initial_referring_domain`.

## Page types

The taxonomy. A routine groups pages by type before interpreting a rate,
because the same copy change lands differently on a blog page than on a
comparison page.

| Type | URL pattern | Job | Audience | Typical benchmark |
|---|---|---|---|---|
| Home | `/` | Say what it is, get the download | Cold visitor, one minute | Best-in-class: the home page is the reference rate |
| Comparison hub | `/comparison` | List the alternatives | Reader in active evaluation | Against other comparison pages |
| Comparison | `/comparison/*` | Show why it beats X | Reader in active evaluation | Against other comparison pages |
| Blog | `/blog/*` | Build trust and search presence | Researcher, often mobile | Against other blog pages |
| Question | `/questions/*` | Answer a search-shaped question | Search traffic | Against other question pages |
| Vibescape | `/vibescapes`, `/share/*` | Show the worlds, let somebody try one | Somebody already interested | Its own type |
| Agents | `/agents` | Show how an AI assistant can write one | Developer arriving from a link | Its own type |
| Author | `/author/*` | Bylines for the search pages | Search crawler, for trust | Its own type |
| Static legal | `/privacy`, `/terms` | Legal pages | Nobody | Excluded from every rate |
| Admin | `/admin` | Owner tooling | The owner | Excluded from every rate |

### Type mapping for this site

The site is static HTML in `site/`. The route directory maps to the type
directly:

| Directory | Type |
|---|---|
| `site/index.html` | Home |
| `site/comparison.html` | Comparison hub |
| `site/comparison/*.html` | Comparison |
| `site/blog/*.html` | Blog |
| `site/questions/*.html` | Question (directory currently empty; the question-shaped pages live in `site/blog/`) |
| `site/vibescapes.html` | Vibescape |
| `site/share/*.html` | Vibescape |
| `site/agents.html` | Agents |
| `site/author/*.html` | Author |
| `site/privacy.html`, `site/terms.html` | Static legal |
| `site/admin.html` | Admin |

Note that the question-shaped pages are published under `/blog/` and listed in
`sitemaps/questions.xml`. A routine that maps by URL pattern alone will
misclassify twelve pages. Use the sitemap as the authority on a page's
intended type: `sitemaps/questions.xml` holds the question pages,
`sitemaps/blog.xml` holds the blog pages, `sitemaps/comparisons.xml` holds the
comparisons.

## Signal gate

A page needs **5 downloads in 28 days** before a report draws any conclusion
about it. A page type needs **10 downloads in 28 days**.

Below that, say "insufficient signal" and move on. A page with little traffic
has not failed; it is under the gate. Do not report the smallest rate you can
find as though it were a finding.

Every conclusion prints its raw counts beside it. At these volumes one person
moves a rate by a large number of points, so a rate without its counts is
unreadable.

## Page-level ranking data

The harvest uses a two-layer model:

- `intent_weight`: how close the query is to a purchase. Switching and
  alternative intent scores 3, evaluation intent 2, general information 1,
  fee or spec lookup 0.5.
- `conversion_weight`: 2 if the page or its type had organic conversions in
  the last 28 days, 1 if unknown, 0.5 if it cleared the signal gate with zero
  conversions.

```
priority = impressions × intent_weight × conversion_weight
```

Impressions are not customers. Rank by this score, not by impressions alone.

## Reporting rules

- No user identifiers, email addresses or personal data in any report.
- The analytics project is `673583` at `https://us.i.posthog.com`. The personal
  API key is in `VisualiserMac/.env`.
- Raw counts beside every rate. Always.
- A merge is not a deploy. The site ships when the Worker is deployed
  (`npx wrangler deploy`); the app ships when a release is cut.

## Reading PostHog without being misled

Two measurement traps, both hit on 11 November 2026 and both producing a
confident wrong answer. Check before you believe a negative.

**`countIf(x != '')` counts the string "null" as present.** HogQL renders a
missing property as the literal string `null`, so
`countIf(toString(properties.$session_id) != '')` returned 548 of 548 for a
property that was absent from every event. The comparison is against a
string, and "null" is a non-empty string. Use a `GROUP BY` instead: a
missing value produces one row with `null`, and a present value produces one
row per distinct value, so the shape of the result tells you which you have.

**A property that has been applied to the person is absent from the event.**
`$set_once` is applied to the person profile and does not stay on the event.
Looking for it on the event and concluding the attribution is broken is
wrong; read `person.properties.$initial_pathname`.

The raw events API, `GET /api/projects/673583/events/?event=<name>`, returns
the real properties object and is a good second opinion when HogQL and the
raw event disagree. It is also how to see a property that PostHog derives,
such as the geo fields.
