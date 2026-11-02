// /blog/youtube-music-visualizer-mac
// Target query: "is there a visualizer for youtube music" (content/url-plan.csv).
// A spoke of /blog/apple-music-visualizer. Facts: content/data/music-apps.json.
import { spoke } from "./_spoke.mjs";

export default (h) => spoke(h, {
    slug: "youtube-music-visualizer-mac",
    app: "youtube-music",
    name: "YouTube Music",
    title: "YouTube Music Visualizer for Mac: What Works",
    description: "YouTube Music has no visualiser in Google's help pages, and there's no native Mac app. Here's how to get visuals that follow it on a Mac.",
    h1: "Is there a visualizer for YouTube Music on Mac?",
    answer: `Not built in: Google's help pages for YouTube Music on a computer don't mention one, and on a Mac YouTube Music is a web app, installed from Chrome or played in the browser. The visualisers people use with it are browser extensions. Or use an app that listens to the Mac's sound and works with every tab: Vibresia, which we make, does that for free.`,
    own: {
        h2: "Browser extensions, or an app",
        html: `<p>Because YouTube Music on a computer runs in a browser, the visualisers for it are mostly Chrome extensions that draw on top of the web player. They only see that tab, and only in the browser they're installed in.</p>
    <p>An app that listens to the Mac's system audio works the other way round. It doesn't need to know YouTube Music exists: whatever the tab is playing, the app hears it, and it keeps working when you switch to another app or another browser.</p>`,
    },
    faq: [
        { q: "Does YouTube Music have a visualizer?", a: "Not one Google documents for the computer version. Visualisers for it come from browser extensions, or from a Mac app that hears system audio, such as Vibresia." },
        { q: "Is there a YouTube Music app for Mac?", a: "Not a native one. Google's route on a computer is the YouTube Music web app, which you can install from Chrome." },
    ],
});
