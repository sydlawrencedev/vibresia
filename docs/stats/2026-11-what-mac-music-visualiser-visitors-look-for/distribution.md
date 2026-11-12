# Distribution draft: what people look for when they look for a Mac music visualiser

**Run date:** 2026-11-12
**Status:** DRAFT. Nothing here has been sent. A human sends it.

The routine says distribution is drafted here and sent by a human. That is the
only shape this takes. No email has been sent, no third party has been contacted,
and no reviewer has been replied to. Both drafts below are waiting for Syd.

---

## 1. The note for journalists

**To:** journalists covering Mac software, audio, and the free and open source
desktop app scene. The relevant outlets are the ones that already run roundups
of Mac music visualisers, plus the Mac and indie-software newsletters.
**Not a pitch.** It is a note about a dataset that exists, with the number in the
first line and the method link in the third, so that whoever wants to use it can
check it.

**Subject:** A number about how people look for Mac music visualisers, from our
own traffic

> Between 19 October and 12 November 2026, 215 of the 660 people who visited
> vibresia.com reached a shared vibescape, 32.6% of everybody who came to the
> site, and more than twice as many as reached a comparison page.
>
> We publish our own traffic as a dataset, with the method and the cohort size:
> https://vibresia.com/stats/data/what-mac-music-visualiser-visitors-look-for
>
> Happy to answer questions on the method, or to run the same query over a longer
> window.

**Notes for Syd before sending:**

- The page is not live yet. This note goes out only after the page is published
  and the privacy question is settled.
- The number is a reach count, not a preference ranking. It says which kind of
  page people reached, not which one they liked. If a journalist asks "so what do
  people want", the honest answer is that this does not measure that, and we
  would say so.
- The bias line belongs in the reply if anybody asks: these are people who found
  Vibresia, not a sample of the market.
- There is no comparison to a benchmark, because no public benchmark measures
  this. Say so rather than borrowing a platform engagement rate.

---

## 2. The addition request

The routine asks for "an addition request for any page the AI visibility check
found being cited for this question". The check is
`ops/seo/ai-visibility/2026-11-12.md`, and it found 24 third-party pages that
write the answers to these buying questions. Every one of the 24 was fetched on
12 November 2026 and checked for the string "vibresia". None of them mentions
Vibresia.

The strongest three for this particular question, because they answer it
directly:

| Page | Why this one | Vibresia mentioned |
|---|---|---|
| `renderwave.io/blog/best-mac-music-visualizers` | The most likely page an assistant reads for "best music visualiser for Mac". It answers 8 of the 37 monthly prompts. | no |
| `getphosphor.com/mac-music-visualizer-alternatives/` | Phosphor's own "full comparison" page, whose table omits us. It answers the same two questions plus "system audio on Mac". | no |
| `freebeat.ai/articles/best-milkdrop-and-projectm-alternatives-in-2026-modern-music-visualizers-compared` | The page that gets read for the MilkDrop and projectM questions, and the one a buyer lands on when they are choosing a visualiser. | no |

**The request, drafted for a human to send. Not sent.**

> **Subject:** A row for Vibresia in your Mac music visualiser comparison
>
> Hello,
>
> I build Vibresia, the free macOS app that turns whatever your Mac is playing
> into live visuals. I am writing because you have put together a comparison of
> Mac music visualisers, and it is a good one, and Vibresia is missing from it.
>
> The row, in the same shape as the others in your table:
>
> | | |
> |---|---|
> | Price | Free, every feature, no trial, no subscription |
> | Platform | macOS 14.2 or later, Apple silicon only |
> | System audio | Yes, from any app, with no plug-in and no loopback driver |
> | Account | None. No sign-in, no cloud sync |
> | Scenes | 18 built in, plus you can write your own as one GLSL function or have an AI assistant write it for you |
> | Audio leaves the Mac? | No. It is analysed on the Mac and never uploaded |
> | Licence | MIT, open source |
>
> The caveat that belongs in the same row: Mac only and Apple silicon only, and
> no Syphon, Spout, NDI or MIDI output. We are not a VJ tool and do not claim to
> be one.
>
> If you would rather describe it as a Mac-only free alternative that does not
> play MilkDrop presets, that is accurate too, and the page below sets out the
> difference:
> https://vibresia.com/blog/milkdrop-alternatives-mac-2026
>
> Happy to send a screenshot of any of it running, or to correct anything above.
>
> Syd Lawrence
> https://vibresia.com

**Notes for Syd before sending:**

- **The facts in the table must be re-checked against the competitor's own site
  on the day it is sent.** The rule in `docs/product-facts.md` is that a page
  cannot name a price or a platform that is not in a record in
  `content/data/competitors.json`. Vibresia's own row is drawn from
  `content/product-truth.md`, which is dated 2026-11-02. Check it again before
  the note goes out.
- **None of the three sites has a record in `content/data/competitors.json`.**
  The AI visibility log records the same gap for MScopes, Synesthia and Bloop.
  The competitor's own claims are not quoted in the draft above, so this is not
  blocked, but a decision is worth making: do we record these three?
- The freebeat.ai fetch returned 429 on re-verification in the AI visibility
  check. The request above does not depend on it being fetchable.
- **The dataset is a separate, second thing.** The request above asks to be
  added to a comparison table. The dataset link is a different asset and does not
  belong in this note. If a third party asks about the numbers, point them at
  the dataset page.
- **A published dataset is worth more here than a comment is.** All 24 of these
  pages omit us. That is the standing gap the AI visibility log has been
  tracking since 11 November, and a single dataset page that answer engines can
  cite addresses it more durably than 24 individual requests.

---

## What was not done

- Nothing was sent to anybody. Not the journalists, not Phosphor, not freebeat,
  not anyone.
- No reviewer was replied to.
- No page was published, deployed or merged. The draft page is in
  `docs/stats/2026-11-what-mac-music-visualiser-visitors-look-for/page-copy.md`
  and has not been built into `site/`.
