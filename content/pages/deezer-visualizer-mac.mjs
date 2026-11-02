// /blog/deezer-visualizer-mac
// Target query: "deezer visualizer" (content/url-plan.csv).
// A spoke of /blog/apple-music-visualizer. Facts: content/data/music-apps.json.
import { spoke } from "./_spoke.mjs";

export default (h) => spoke(h, {
    slug: "deezer-visualizer-mac",
    app: "deezer",
    name: "Deezer",
    title: "Deezer Visualizer for Mac: Is There One, and What Works",
    description: "Deezer's Mac app shows lyrics, but its support pages don't mention a visualiser. Here's how to get visuals that move with Deezer on a Mac.",
    h1: "Is there a visualizer for Deezer on Mac?",
    answer: `Not that we could find: Deezer's support pages describe its Mac app and web player, and the visual they mention is lyrics, not a visualiser. To get visuals that follow Deezer on a Mac, use an app that listens to the Mac's sound. Vibresia, which we make, does that for free, with the Deezer app or the browser.`,
    own: {
        h2: "Lyrics are Deezer's visual",
        html: `<p>Deezer's own help pages put lyrics forward as what you see while a song plays, in the desktop app and on deezer.com, and Deezer opened desktop lyrics to Free users in 2020. Lyrics follow the words; a visualiser follows the sound, and the two work well side by side.</p>
    <p>Deezer's Mac app needs macOS 12 or later, and Vibresia needs ${h.rec("vibresia").requirements}, so on an Apple silicon Mac you can run both: Deezer showing the lyrics in one window, Vibresia full screen on another display.</p>`,
    },
    faq: [
        { q: "Does Deezer have a visualizer?", a: "Not one Deezer's support pages mention. It shows lyrics in the Mac app and on deezer.com. A Mac app that hears system audio, such as Vibresia, gives you visuals that follow Deezer." },
        { q: "Is there a Deezer app for Mac?", a: "Yes. Deezer has a desktop app for macOS 12 or later, and it also plays in a browser at deezer.com." },
    ],
});
