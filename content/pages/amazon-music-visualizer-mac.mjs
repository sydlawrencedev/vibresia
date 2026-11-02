// /blog/amazon-music-visualizer-mac
// Target query: "does amazon music have a visualizer" (content/url-plan.csv).
// A spoke of /blog/apple-music-visualizer. Facts: content/data/music-apps.json.
// Amazon's main help pages couldn't be read, and whether its Mac app is still
// offered is unclear, so the page leans on the web player, which is sourced.
import { spoke } from "./_spoke.mjs";

export default (h) => spoke(h, {
    slug: "amazon-music-visualizer-mac",
    app: "amazon-music",
    name: "Amazon Music",
    title: "Amazon Music Visualizer for Mac: Is There One?",
    description: "Amazon Music shows lyrics, but its help pages don't mention a visualiser. Here's how to get visuals that move with Amazon Music on a Mac, free.",
    h1: "Does Amazon Music have a visualizer on Mac?",
    answer: `Not that we could find: the visual Amazon documents for its web app is lyrics that scroll with the song, not a visualiser. On a Mac, Amazon Music plays in the browser at music.amazon.com. To get visuals that follow it, use an app that listens to the Mac's sound: Vibresia, which we make, does that for free.`,
    own: {
        h2: "Amazon Music on a Mac today",
        html: `<p>The dependable way to play Amazon Music on a Mac is the web player, which works in Safari, Chrome, Firefox and Edge. Whether Amazon still offers a separate Mac app is unclear: a post from Amazon in February 2025, relayed on Apple's forums, says it was discontinued. A visualiser that hears the Mac's system audio doesn't mind which one you use.</p>
    <p>In the full-screen player, Amazon shows lyrics that scroll in time with the song. Like Deezer's, they follow the words rather than the sound, so they sit happily beside a visualiser on another display.</p>`,
    },
    faq: [
        { q: "Does Amazon Music have a visualizer?", a: "Not one that Amazon's help pages mention. The web app shows lyrics that scroll with the song. A Mac app that hears system audio, such as Vibresia, gives you visuals that follow Amazon Music." },
        { q: "Is there an Amazon Music app for Mac?", a: "It's unclear whether Amazon still offers one; a February 2025 post from Amazon says it was discontinued. The web player at music.amazon.com works in Safari, Chrome, Firefox and Edge." },
    ],
});
