// /blog/soundcloud-visualizer-mac
// Target query: "soundcloud visualizer" (content/url-plan.csv).
// A spoke of /blog/apple-music-visualizer. Facts: content/data/music-apps.json.
import { spoke } from "./_spoke.mjs";

export default (h) => spoke(h, {
    slug: "soundcloud-visualizer-mac",
    app: "soundcloud",
    name: "SoundCloud",
    title: "SoundCloud Visualizer for Mac: What Works",
    description: "SoundCloud's waveform isn't a visualiser, and there's no native Mac app. Here's how to get visuals that move with SoundCloud on a Mac.",
    h1: "Is there a visualizer for SoundCloud on Mac?",
    answer: `Not built in: SoundCloud shows a waveform of each track, but it's a picture of the whole track for seeking and comments, and it doesn't move with the music. On a Mac, SoundCloud is the website, or the website installed as an app. To get visuals that follow it, use a browser extension or an app that listens to the Mac's sound. Vibresia, which we make, does that for free.`,
    own: {
        h2: "The waveform isn't a visualiser",
        html: `<p>SoundCloud's waveform is drawn once for each track: you click along it to jump, and comments sit at the moment they're about. It's useful, but it shows the shape of the whole track; it doesn't react to the music as it plays.</p>
    <p>SoundCloud's Desktop Player is the website installed as an app from Chrome, Brave or Edge, so visualisers for it are browser extensions that draw on the web player. An app that hears the Mac's system audio works with the Desktop Player, the website and everything else.</p>`,
    },
    faq: [
        { q: "Does SoundCloud have a visualizer?", a: "Not a music visualiser. Its waveform shows the whole track for seeking and comments and doesn't move with the music. Visualisers for it come from browser extensions, or from a Mac app that hears system audio, such as Vibresia." },
        { q: "Is there a SoundCloud app for Mac?", a: "Not a native one. SoundCloud's Desktop Player is its website installed as an app from Chrome, Brave or Edge." },
    ],
});
