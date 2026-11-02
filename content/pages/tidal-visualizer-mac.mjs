// /blog/tidal-visualizer-mac
// Target query: "does tidal have a visualizer" (content/url-plan.csv).
// A spoke of /blog/apple-music-visualizer. Facts: content/data/music-apps.json.
// TIDAL's support site blocks automated reading: two facts are flagged
// needsHandCheck there, and this page waits for a person to confirm them.
import { spoke } from "./_spoke.mjs";

export default (h) => spoke(h, {
    slug: "tidal-visualizer-mac",
    app: "tidal",
    name: "TIDAL",
    title: "TIDAL Visualizer for Mac: Is There One, and What Works",
    description: "We couldn't find a visualiser in TIDAL's Mac app or web player. Here's how to get visuals that move with TIDAL on a Mac, for free.",
    h1: "Does TIDAL have a visualizer on Mac?",
    answer: `Not that we could find: TIDAL's support pages describe its Mac app and its web player, and neither mentions a visualiser. To get visuals that follow TIDAL on a Mac, use an app that listens to the Mac's sound rather than to TIDAL itself. Vibresia, which we make, does that for free, with the Mac app or the browser.`,
    own: {
        h2: "TIDAL on a Mac",
        html: `<p>TIDAL has a desktop app for the Mac and a web player that runs in the usual browsers. Whichever you use, the sound goes out through the Mac, and that's where a visualiser that hears system audio picks it up.</p>
    <p>That matters more for TIDAL than for most services, because people choose it for sound quality. Vibresia only listens: it doesn't sit in the path between TIDAL and your speakers, so it doesn't touch what you hear.</p>`,
    },
    faq: [
        { q: "Does TIDAL have a visualizer?", a: "Not one we could find in TIDAL's Mac app or web player. A Mac app that hears system audio, such as Vibresia, gives you visuals that follow TIDAL." },
        { q: "Does Vibresia change how TIDAL sounds?", a: "No. Vibresia only listens to the Mac's system audio; it doesn't process or route the sound you hear." },
    ],
});
