// /blog/mixcloud-visualizer-mac
// Target query: "mixcloud visualizer" (content/url-plan.csv). No autocomplete
// evidence: built at the owner's request.
// A spoke of /blog/apple-music-visualizer. Facts: content/data/music-apps.json.
import { spoke } from "./_spoke.mjs";

export default (h) => spoke(h, {
    slug: "mixcloud-visualizer-mac",
    app: "mixcloud",
    name: "Mixcloud",
    title: "Mixcloud Visualizer for Mac: What Works for DJ Mixes",
    description: "Mixcloud's visuals come from DJs streaming video on Mixcloud Live, not a visualiser. Here's how to get visuals that follow any mix on a Mac.",
    h1: "Is there a visualizer for Mixcloud on Mac?",
    answer: `Not in the player: the visual Mixcloud offers is Mixcloud Live, where DJs stream their own video, and on a Mac Mixcloud is the website. For visuals that follow any mix or radio show, live or not, use an app that listens to the Mac's sound. Vibresia, which we make, does that for free.`,
    own: {
        h2: "Mixcloud Live is the DJ's video, not a visualiser",
        html: `<p>Mixcloud Live lets creators stream video alongside their sets, and its own setup guide treats a webcam as optional. When there's video, it's whatever the DJ points a camera at. When there isn't, or for the archive of mixes and radio shows, there's nothing on screen that follows the music.</p>
    <p>Long DJ mixes are a good fit for a visualiser that listens, because nobody chose visuals for them. Vibresia follows the mix as it changes, notices the beat and the bass, and keeps going for the whole set.</p>`,
    },
    faq: [
        { q: "Does Mixcloud have a visualizer?", a: "Not in its player. Mixcloud Live lets DJs stream their own video. For visuals that follow any mix, use a Mac app that hears system audio, such as Vibresia." },
        { q: "Is there a Mixcloud app for Mac?", a: "Not on the Mac App Store: Mixcloud's App Store listing covers iPhone, iPad, Apple TV and Vision Pro. On a Mac, Mixcloud is the website." },
    ],
});
