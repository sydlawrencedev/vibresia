// /blog/vlc-visualizer-mac
// Target query: "vlc visualizations mac" (content/url-plan.csv).
// A spoke of /blog/apple-music-visualizer. Facts: content/data/music-apps.json.
// VLC is the one app here with a visualiser of its own, so this page shows
// how to turn it on before it says what Vibresia adds.
import { spoke } from "./_spoke.mjs";

export default (h) => spoke(h, {
    slug: "vlc-visualizer-mac",
    app: "vlc",
    name: "VLC",
    title: "VLC Visualizations on Mac: How to Turn Them On",
    description: "VLC for Mac has built-in visualisations: Audio, then Visualizations. Here's how to turn them on, what they show, and what to use for every other app.",
    h1: "How to use VLC's visualizer on a Mac",
    answer: `VLC for Mac has visualisations built in: play some audio, then choose Audio, then Visualizations, and pick one. They're effects on VLC's own audio, so they show what VLC is playing and nothing else. For visuals that follow Spotify, a browser or any other app as well, use one that listens to the Mac's sound: Vibresia, which we make, is free.`,
    own: {
        h2: "What VLC's visualisations are",
        html: `<p>VideoLAN's documentation lists the effects in VLC's visualizer as scope, spectrum, spectrometer and VU meter, with spectrum the default. They're drawn in a separate video window while the audio plays. If you're playing a music file in VLC and want something on screen, they're already there and free.</p>
    <p>They're measurement-style effects: bars, a waveform and level meters, drawn from VLC's own audio output. That makes them tied to VLC, and it's the reason to reach for something else when the music is coming from Spotify, a streaming site or another player.</p>`,
    },
    faq: [
        { q: "Does VLC have a visualizer on Mac?", a: "Yes. With audio playing, choose Audio, then Visualizations, in VLC for Mac. The effects include spectrum, scope, spectrometer and VU meter." },
        { q: "Can VLC's visualizer show Spotify?", a: "No. VLC's visualisations are effects on VLC's own audio output, so they only show what VLC is playing. Vibresia hears the Mac's system audio, so it follows Spotify and every other app." },
    ],
});
