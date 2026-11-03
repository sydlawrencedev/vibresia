// /blog/plex-visualizer-mac
// Target query: "visualizer for plex" (content/url-plan.csv).
// A spoke of /blog/apple-music-visualizer. Facts: content/data/music-apps.json.
import { spoke } from "./_spoke.mjs";

export default (h) => spoke(h, {
    slug: "plex-visualizer-mac",
    app: "plex",
    name: "Plex",
    title: "Plex Visualizer for Mac: What Plex Has and What Doesn't",
    description: "Plex has visualisers, in Plexamp and the mobile app, as a Plex Pass feature. On a Mac, here's where they are and where they aren't.",
    h1: "Does Plex have a visualizer on Mac?",
    answer: `Partly. Plex does have visualisers, and they are good ones: they live in Plexamp, the music player, and in the mobile apps, and Plex lists them as a Plex Pass premium music feature. What they do not do is appear in the Plex desktop app for Mac or in the Plex web player, which is where a lot of people play their library on a Mac. If you play Plex in Plexamp, use Plex's own. If you play it in the desktop app or in a browser, an app that listens to the Mac's system audio works with all of them: Vibresia, which we make, does that for free.`,
    own: {
        h2: "Where Plex's visualisers are, and where they aren't",
        html: `<p>Plex's own documentation puts visualisers in the apps that support them: Plexamp, its music player, which advertises over a dozen of them, and the mobile app, where the visualiser is dynamic and follows the track being played. Both need Plex Pass. Plex says the visualisers are driven straight from the audio engine, so they react to the music rather than to a beat clock.</p>
    <p>The gap is on a Mac. Plex's list of the Plex Web App player controls covers playback, quality, audio, subtitles, chapters and the play queue, with no visualiser among them, and the documentation for the Plex desktop app for Mac lists player settings for audio and subtitles and download settings, with no visualiser there either. Searching Plex's own support library for visualisers turns up the iOS player, Plex Music, licence information and the Plex Pass feature list, and nothing about the web or Mac players.</p>
    <p>An app that listens to the Mac's system audio does not have that gap. It does not need to know Plex exists: whatever Plex is playing, the app hears it, and the visuals follow, whether it came from Plexamp, the desktop app or a tab in the browser.</p>`,
    },
    faq: [
        { q: "Does Plex have a visualizer?", a: "Yes, in Plexamp and the mobile apps, where they are a Plex Pass premium music feature. The Plex desktop app for Mac and the Plex web player do not list one." },
        { q: "Is there a Plex app for Mac?", a: "Yes, a native desktop app alongside the Plex web player, which runs in the browser. Plex Media Player is also available for Mac as a home theatre player." },
        { q: "Do I need Plex Pass for the visualisers?", a: "For Plex's own, yes: Plex lists them as a Plex Pass premium music feature." },
    ],
});
