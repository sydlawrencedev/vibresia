// /blog/spotify-visualizer-mac
// Target query: "is there a visualizer for spotify" (content/url-plan.csv).
// A spoke of /blog/apple-music-visualizer. Facts: content/data/music-apps.json.
import { spoke } from "./_spoke.mjs";

export default (h) => spoke(h, {
    slug: "spotify-visualizer-mac",
    app: "spotify",
    name: "Spotify",
    title: "Spotify Visualizer for Mac: Is There One, and What Works",
    description: "Spotify's Mac app doesn't come with a visualiser we could find, and Canvas isn't one. Here's what works with Spotify on a Mac, free.",
    h1: "Is there a visualizer for Spotify on Mac?",
    answer: `Not built in, as far as we can find: Spotify's help and download pages don't mention a visualiser, and Canvas, the looping clips on some tracks, is a video an artist adds rather than something that moves with the music. To get visuals that follow Spotify on a Mac, use an app that listens to the Mac's sound. Vibresia, which we make, does that for free.`,
    own: {
        h2: "What Spotify has instead",
        html: `<p>Spotify's own visual is Canvas: a short looping clip an artist can add to each track. It's made in advance, so it loops the same way whatever the song is doing. Spotify's desktop app once ran third-party apps through a directory called App Finder, but Spotify stopped taking new ones in March 2014 and phased them out of the desktop app in early 2015.</p>
    <p>Developers building their own visualisers have lost a route too. In November 2024 Spotify cut new apps off from its Web API's audio-analysis and audio-features data, which some visualisers used to know where the beats were. A visualiser that listens to the sound itself doesn't depend on any of that.</p>`,
    },
    faq: [
        { q: "Does Spotify have a visualizer?", a: "Not one that Spotify documents for its Mac app. Canvas clips loop the same way whatever the music does. An app that listens to the Mac's system audio, such as Vibresia, gives you visuals that follow Spotify." },
        { q: "Does Vibresia work with the Spotify web player?", a: "Yes. Vibresia hears the Mac's system audio, so it reacts to Spotify in the browser as well as in the Mac app." },
    ],
});
