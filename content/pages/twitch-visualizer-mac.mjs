// /blog/twitch-visualizer-mac
// Target query: "visualizer for twitch" (content/url-plan.csv).
// A spoke of /blog/apple-music-visualizer. Facts: content/data/music-apps.json.
import { spoke } from "./_spoke.mjs";

export default (h) => spoke(h, {
    slug: "twitch-visualizer-mac",
    app: "twitch",
    name: "Twitch",
    title: "Twitch Visualizer for Mac: What Works for Streams",
    description: "Twitch has no visualiser of its own: its overlays are stream alerts. For a music stream on Mac, here's what draws the visuals and what doesn't.",
    h1: "Does Twitch have a visualizer?",
    answer: `Not one of its own. Twitch's animated graphics are alerts for stream events, a follower or a raid, and its help centre has no visualiser at all. The visuals on a Twitch stream come from the broadcaster: an Extension, an overlay, or another app in the production. For a music stream on a Mac, that means drawing them somewhere else and putting them into the stream: Vibresia, which we make, draws live visuals from whatever the Mac is playing, and your streaming software can capture its window like any other.`,
    own: {
        h2: "Twitch's graphics are alerts, not a visualiser",
        html: `<p>The animated graphics Twitch ships are alerts: a graphic that appears when somebody follows, subscribes, sends Bits, raids, or joins a Hype Train. None of them is tied to the audio of the stream, and none of them is a music visualiser.</p>
    <p>Everything else on a stream comes from the broadcaster. Twitch's own documentation describes an Extension as a webpage that sits inside Twitch and talks to it, with an overlay type that displays on top of the whole video as a transparent overlay, and it says most Extensions are built by third-party developers. So the visual layer of a stream is something you bring.</p>
    <p>On a Mac, that is easier than it sounds. Draw the visuals in an app that listens to the Mac's system audio, then capture that app's window in your streaming software, where it sits over the game or over the desktop like any other source. The visuals then react to what is actually playing, including a music stream, and you can change scenes mid-song.</p>`,
    },
    faq: [
        { q: "Does Twitch have a visualizer?", a: "No. Twitch's own graphics are alerts for stream events, and its help centre documents no visualiser, so the visuals on a stream come from the broadcaster." },
        { q: "Is there a Twitch app for Mac?", a: "No native one. Twitch is watched in the browser at twitch.tv, and its App Store listing covers iPhone, iPad and Apple TV only." },
        { q: "How do I get visuals on a Twitch music stream?", a: "Draw them in another app and put them into the stream. On a Mac, an app that listens to the system audio can draw live visuals that react to the music, and your streaming software captures its window as a source." },
    ],
});
