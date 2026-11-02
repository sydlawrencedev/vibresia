# SEO changelog

Every change that could move a page in search: what changed, on which URL,
for which queries, and why. Newest first. It's how a ranking change gets
explained later (docs/seo.md, Phase 6). Log the deploy date when a change goes
live, not the commit date.

Recurring dates:

- **January each year**: refresh every page with the year in its title or
  URL. For a URL with the year in it, publish the new year's URL and 301 the
  old one. First due January 2027.
- **Quarterly**: re-check prices in `content/data/competitors.json`. First due
  February 2027.
- **Monthly**: Search Console review (positions 11-20 with impressions;
  low click-through on page one; one query, several URLs).
- **August 2027**: the validator starts warning about records checked on
  2026-11-02; it fails them in November 2027.
- **Eight weeks after launch**: decide which `later` rows in
  `content/url-plan.csv` to build, from impressions.

## 2026-11-02 (not yet deployed): batch 2

Template 2c, head-to-heads at `/comparison/vibresia-vs-{competitor}`. Author:
Syd Lawrence. These replace the planned "{competitor} alternatives" lists for
Synesthesia and TouchDesigner: just the two apps, the case for Vibresia, and
who should pick the other one.

| URL | Target query | Title | Schema |
| --- | --- | --- | --- |
| `/comparison/vibresia-vs-synesthesia` | synesthesia free alternative | Synesthesia Alternative for Mac (2026): Vibresia vs Synesthesia | Article, BreadcrumbList, SoftwareApplication x2, FAQPage |
| `/comparison/vibresia-vs-touchdesigner` | touchdesigner alternatives for mac | TouchDesigner Alternative (2026): Vibresia vs TouchDesigner | Article, BreadcrumbList, SoftwareApplication x2, FAQPage |

- New sitemap `/sitemaps/comparisons.xml`, listed in `robots.txt`; both
  pages in `llms.txt`.
- Synesthesia's record gained a pricing section (Standard US$199, Pro
  US$399, one-time; the page shows "$" with no currency code). The best-of
  page's price cell for Synesthesia changed from "Free to try; paid plans on
  its site" to "US$199, one-time", and it links to the new comparison.
- Resolume stays a "later" referee list, with no head-to-head: its
  searchers want another VJ tool, and Vibresia isn't one.

## 2026-11-02 (not yet deployed): batch 1

Batch 1 of `content/url-plan.csv`. Template 2a. Author: Syd Lawrence.

| URL | Target query | Title | Schema |
| --- | --- | --- | --- |
| `/blog/best-music-visualizer-for-mac-2026` | best music visualizer for mac | Best Music Visualizer for Mac (2026): 7 Apps Compared | Article, BreadcrumbList, ItemList, FAQPage |
| `/blog/milkdrop-alternatives-mac-2026` | milkdrop alternative for mac | MilkDrop Alternatives for Mac (2026): 5 Options Compared | Article, BreadcrumbList, ItemList, FAQPage |
| `/blog/does-milkdrop-work-on-mac` | does milkdrop work on mac | Does MilkDrop Work on Mac? No, but Its Presets Can | Article, BreadcrumbList, FAQPage |
| `/author/syd-lawrence` | (author page) | Syd Lawrence, who makes Vibresia | ProfilePage, Person |

- Links: every page's footer links to the first two; each search page links
  to the other two and to the author page.
- New sitemap `/sitemaps/blog.xml`, listed in `robots.txt`. The author page
  is in `/sitemap.xml`.
- The three pages are listed in `llms.txt` under "Comparisons".
- Download links carry `src=seo-{slug}-{top|bottom}`. Every event on a
  search page carries `template` (from `<meta name="seo-template">`), and
  `download_clicked` adds `slug`.
- Analytics go through `/ingest/batch/` on vibresia.com (the Worker passes
  them to PostHog), so blocklists that name PostHog's host don't skew one
  template against another. Every site page now points there.
- First touch: the first pageview sets `$initial_pathname` and
  `$initial_referring_domain` on the person.
- PostHog dashboard "Search pages by template" (Shareware project):
  visits, download click rate, per-page totals and server-counted
  downloads. Search Console (`sc-domain:vibresia.com`) is connected and
  syncing by page, query, and query and page; its tile is added once those
  tables have data.
- Demand evidence: Google autocomplete on 2026-11-02 (no volume data).
- Competitor facts checked 2026-11-02, from each app's own pages.

After deploying: fill in the date above, submit both sitemaps in Search
Console, and note the first impressions here.
