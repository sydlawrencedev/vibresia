---
title: "What people look for when they look for a Mac music visualiser"
meta_description: "Between 19 October and 12 November 2026, 215 of the 660 people who visited vibresia.com reached a shared vibescape, more than twice as many as reached a comparison page. The numbers, and how they were counted."
canonical: "https://vibresia.com/stats/data/what-mac-music-visualiser-visitors-look-for"
status: DRAFT, awaiting the owner's written sign-off (privacy gate rule 6)
byline: "Syd Lawrence, a visual artist and developer who makes Vibresia"
---

# What people look for when they look for a Mac music visualiser

Most of the search traffic that reaches a Mac visualiser site arrives with a
comparison in mind. "MilkDrop vs projectM", "is there a Resolume for Mac". That is
the shape of the query, and it is the shape the comparison pages are built for.

But it is not the shape people walk away with. Here is what our own traffic did
between 19 October and 12 November 2026.

## The findings

**215 of the 660 people who visited vibresia.com in those 25 days reached a
shared vibescape, which is 32.6% of everybody who came to the site and more than
twice as many as reached a comparison page.**

**101 of those 660 visitors reached a comparison page, 15.3% of the total, and
that was fewer than the 285 who reached the homepage.**

**43.2% of visitors, 285 people, reached the homepage first.**

The finding in one line, if you want to quote one line:

> Between 19 October and 12 November 2026, 215 of the 660 people who visited
> vibresia.com reached a shared vibescape, 32.6% of everybody who came to the
> site, and more than twice as many as reached a comparison page.

### The numbers

| Kind of page | Visitors | Share of the 660 |
|---|---|---|
| The homepage | 285 | 43.2% |
| A shared vibescape | 215 | 32.6% |
| A comparison page | 101 | 15.3% |
| A blog page | 57 | 8.6% |
| The agents page, the gallery, the vibe page or the author page | 52 | 7.9% |

These do not add up to 100%, and that is not a mistake. 59 of the 660 people
reached more than one kind of page, so they are counted in more than one row. 599
reached exactly one kind. A further 2 reached a page that is not in the table,
so they count towards the 660 and towards no row.

## What was counted, and what it does not mean

The cohort is 660 distinct people who loaded a page on vibresia.com in the
25 days from 19 October to 12 November 2026, counted up to 14:00 UTC on the
twelfth. A person is counted once per kind of page they reached. Nobody is identifiable in the data: the site's analytics
gives each browser a random identifier kept in that browser's own storage, and
nothing else is recorded about the visit beyond the page.

Three things this is not.

It is not a sample of people looking for a music visualiser. It is people who
found Vibresia. They searched for something and chose this site, so they are
selected twice over before we count them. The numbers describe this site's
audience, not the market for Mac visualisers.

It is not a preference ranking. The site records which pages people reach, not
which ones they like. A page reached twice counts the same as a page reached
once. Nothing here says anything about which vibescape is the best one.

It is not the whole audience. The site's measurement can be switched off, in the
footer or by a Do Not Track setting, and an ad blocker stops it too. People who
blocked it are not in the denominator either. Every ratio here is a ratio
between the people we can see.

## How to cite it

> Vibresia, "What people look for when they look for a Mac music visualiser",
> 19 October to 12 November 2026, cohort of 660 visitors.
> https://vibresia.com/stats/data/what-mac-music-visualiser-visitors-look-for

## Method

Who is counted: every distinct browser that loaded a page on vibresia.com
between 19 October and 12 November 2026, counted up to 14:00 UTC on the twelfth.
That is 660 people.

When: the 25 days from 19 October to 12 November 2026 inclusive.

How: the site's own anonymous analytics, held in PostHog. Each page view is
counted once per browser, and a browser is counted once per kind of page it
reached. Our own test account, our own internal traffic and our uptime probes
are excluded, which removes 6 people in total.

Cohort size: 660 visitors. The smallest cell published above is 52.

Known biases: these are people who found Vibresia, not a sample of anybody. The
window is 25 days long and it is a launch-period window, so it is not a steady
state. The measurement can be blocked, so the denominator is the people we can
see. A visitor can appear in two rows of the table. One person is one browser,
so somebody who clears their browser storage and comes back counts twice.

There is no public benchmark for this, so there is nothing to compare it
against. Published engagement figures for 2026 are platform numbers, measured on
TikTok and LinkedIn, and they are not measuring the same thing.

> **Review marker: privacy policy does not cover this.**
> `site/privacy.html` says what the site collects and who else sees it, but it
> does not say that aggregate usage figures are published. This needs the
> owner's decision before the page goes live: either add a short section to the
> privacy policy saying that aggregate figures are published, that they are
> counts of groups of at least 50 people, and that they can be checked here, or
> confirm that the existing wording already covers it.

## See it on your own Mac

Vibresia is free, it has no account and it has no ads. Download it, put on
something you like, and watch the screen.

**Download Vibresia for Mac**

---

## Notes for the reviewer

- Every number here matches `method.md` in this folder and the `Dataset`
  structured data below.
- No em dashes, UK English, no exclamation points, no banned phrases.
- One next step, not a menu.
- The privacy marker is deliberately visible and is in the routine's exact
  wording. It comes out when the owner closes rule 4.
- The copy says "our own traffic" and "our test account". The page is written in
  the first person plural because the byline is Syd and the data is the
  project's own. If the owner would rather it read as a neutral dataset, the
  method section can be switched to "the site's" throughout without changing a
  number.

---

## Structured data

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Dataset",
      "@id": "https://vibresia.com/stats/data/what-mac-music-visualiser-visitors-look-for#dataset",
      "name": "What people look for when they look for a Mac music visualiser",
      "description": "Aggregate counts of 660 distinct visitors to vibresia.com, grouped by the kind of page each visitor reached, 19 October to 12 November 2026.",
      "url": "https://vibresia.com/stats/data/what-mac-music-visualiser-visitors-look-for",
      "creator": {
        "@id": "https://vibresia.com/author/syd-lawrence#person"
      },
      "isAccessibleForFree": true,
      "license": "https://vibresia.com/terms",
      "keywords": [
        "music visualiser",
        "Mac",
        "web analytics",
        "aggregate statistics"
      ],
      "temporalCoverage": "2026-10-19/2026-11-12",
      "dateCreated": "2026-11-12",
      "dateModified": "2026-11-12",
      "variableMeasured": [
        {
          "@type": "PropertyValue",
          "name": "Homepage",
          "description": "Visitors who reached the homepage",
          "value": "285",
          "unitText": "visitors"
        },
        {
          "@type": "PropertyValue",
          "name": "A shared vibescape",
          "description": "Visitors who reached a shared vibescape at /share/ or /s/",
          "value": "215",
          "unitText": "visitors"
        },
        {
          "@type": "PropertyValue",
          "name": "A comparison page",
          "description": "Visitors who reached a comparison page at /comparison/",
          "value": "101",
          "unitText": "visitors"
        },
        {
          "@type": "PropertyValue",
          "name": "A blog page",
          "description": "Visitors who reached a blog page at /blog/",
          "value": "57",
          "unitText": "visitors"
        },
        {
          "@type": "PropertyValue",
          "name": "The agents page, the gallery, the vibe page or the author page",
          "description": "Visitors who reached /agents, /vibescapes, /vibe or /author/",
          "value": "52",
          "unitText": "visitors"
        }
      ],
      "measurementTechnique": "Aggregate count of distinct anonymous browser identifiers per page kind. Minimum cohort of 50 people behind every published number. Test and internal accounts excluded.",
      "sampleSize": "660",
      "distribution": [
        {
          "@type": "DataDownload",
          "encodingFormat": "text/html",
          "contentUrl": "https://vibresia.com/stats/data/what-mac-music-visualiser-visitors-look-for"
        }
      ]
    },
    {
      "@type": "WebPage",
      "@id": "https://vibresia.com/stats/data/what-mac-music-visualiser-visitors-look-for#webpage",
      "url": "https://vibresia.com/stats/data/what-mac-music-visualiser-visitors-look-for",
      "name": "What people look for when they look for a Mac music visualiser",
      "description": "Between 19 October and 12 November 2026, 215 of the 660 people who visited vibresia.com reached a shared vibescape, more than twice as many as reached a comparison page. The numbers, and how they were counted.",
      "isPartOf": {
        "@id": "https://vibresia.com/#website"
      },
      "inLanguage": "en-GB",
      "datePublished": "2026-11-12",
      "dateModified": "2026-11-12",
      "author": {
        "@id": "https://vibresia.com/author/syd-lawrence#person"
      },
      "about": {
        "@id": "https://vibresia.com/stats/data/what-mac-music-visualiser-visitors-look-for#dataset"
      }
    }
  ]
}
</script>
```

### A note on the `license` property

`https://vibresia.com/terms` is used as the licence reference because the
project's terms page is the closest thing to a reuse statement the site has. If
the owner would rather these figures carry an explicit Creative Commons licence
instead, that is a one-line change and worth doing: a dataset nobody is allowed
to quote cannot do the job this page exists to do. The owner should pick the
licence. Not published until they do.
