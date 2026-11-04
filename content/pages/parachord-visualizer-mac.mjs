// /blog/parachord-visualizer-mac
// Target query: "parachord visualizer" (content/url-plan.csv).
// A spoke of /blog/apple-music-visualizer. Facts: content/data/music-apps.json.
import { spoke } from "./_spoke.mjs";

export default (h) => spoke(h, {
    slug: "parachord-visualizer-mac",
    app: "parachord",
    name: "Parachord",
    title: "Parachord Visualizer on Mac: Vibresia Scenes Built In",
    description: "Parachord is a multi-source player and has no visualiser of its own. Vibresia is its built-in one: the same scenes, drawn by the music it plays.",
    h1: "Does Parachord have a visualizer?",
    answer: `Not of its own. Parachord's own README lists its features, and a visualiser isn't among them: it's a multi-source player that resolves each track to the best available source across Spotify, Apple Music, Amazon Music, YouTube, Bandcamp, SoundCloud, a Subsonic server and your own files. There is now one, though: Vibresia is built into Parachord, so the visuals are drawn from the music Parachord is already playing, with no second app and no system-audio permission. Vibresia, which we make, is free.`,
    own: {
        h2: "Parachord plays many services, and had no visuals of its own",
        html: `<p>Parachord is a multi-source player, in the lineage of Tomahawk: you search several services at once and it resolves each track to whichever source can play it, with a draggable priority order and volume normalisation between sources. Its own feature list covers multi-source playback, the plug-in architecture, the AI companion, library sync, artist pages, playlists and queue, sharing, a browser extension, scrobbling and deep links. A visualiser isn't in that list.</p>
    <p>That matters more for Parachord than for a single-service player, because Parachord is playing music from lots of different places. A visualiser tied to one app would go dark the moment the resolver picked a different source. A visualiser that reads the audio Parachord itself is playing does not care which service it came from.</p>
    <p>Parachord's own copy protection is worth knowing about here, because it shapes what any visualiser can do. Spotify plays in Spotify's own app through Spotify Connect; Apple Music on macOS plays through Apple's MusicKit; Amazon Music, and Apple Music on Windows and Linux, are decrypted inside the Widevine module. Parachord does not decrypt, record, download or save protected streams, and does not extract decryption keys. So the visualiser reads the audio that is playing, in the app's own renderer, and never intercepts or re-encodes a stream.</p>`,
    },
    faq: [
        { q: "Does Parachord have a visualizer?", a: "Not one of its own. Its README lists the features and a visualiser isn't among them. Vibresia is built into Parachord, so the visuals come from the music Parachord is playing." },
        { q: "What is Parachord?", a: "A multi-source music player, in the lineage of Tomahawk. It searches several services at once and resolves each track to the best available source, with plug-ins, library sync, artist pages, playlists and an AI companion." },
        { q: "Does Parachord work on a Mac?", a: "Yes. Parachord has a native desktop app for macOS 13 (Ventura) or later, on Intel or Apple silicon, and also ships for Windows and Linux." },
        { q: "Do I need a second app for the visuals?", a: "No. The Vibresia scenes are drawn inside Parachord, from the audio it is already playing. There is no second app to install and no macOS system-audio permission to grant." },
    ],
});
