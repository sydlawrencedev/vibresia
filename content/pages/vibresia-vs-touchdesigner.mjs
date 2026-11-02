// /comparison/vibresia-vs-touchdesigner
// Target query: "touchdesigner alternatives for mac" (content/url-plan.csv).
// A head-to-head: just the two apps. The case for Vibresia is a finished
// visualiser, and scenes that are one function, for people who only want
// music as the input. It isn't a node-based replacement, and the page says so.

const us = (s) => s === "vibresia";

export default (h) => ({
    slug: "vibresia-vs-touchdesigner",
    template: "2c",
    versus: "touchdesigner",
    publishedISO: "2026-11-02",
    updatedISO: "2026-11-02",
    title: "TouchDesigner Alternative (2026): Vibresia vs TouchDesigner",
    description: "If you only want visuals that move to music, TouchDesigner makes you build them. Vibresia is a free Mac visualiser that plays out of the box.",
    eyebrow: "TouchDesigner alternative",
    breadcrumb: "Vibresia vs TouchDesigner",
    h1: "Vibresia vs TouchDesigner: the simpler alternative for music visuals on a Mac",
    answer: `If what you want from ${h.link("touchdesigner")} is visuals that move to your music, Vibresia gets you there faster: it's a finished, free Mac visualiser that listens to whatever is playing, and a new scene is one GLSL function or a sentence to an AI assistant. TouchDesigner can build almost anything, a music visualiser included, but you build it. For installations, interactive work or anything beyond music in and picture out, pick TouchDesigner. We make Vibresia, so check our reasons against the sources at the bottom.`,
    cta: "Try Vibresia free with what's playing now",
    rows: [
        { label: "What it is", value: (h, s) => us(s) ? "A finished music visualiser, with 18 built-in scenes" : h.rec(s).tagline },
        { label: "Price", value: (h, s) => us(s) ? "Free, every feature" : `${h.price(s, "Non-Commercial")} (Non-Commercial), ${h.price(s, "Commercial")} (Commercial)` },
        { label: "Free version", value: (h, s) => us(s) ? "The whole app, for any use" : h.rec(s).trial.limits },
        { label: "Runs on", value: (h, s) => h.rec(s).requirements },
        { label: "Making a new visual", value: (h, s) => us(s) ? "One GLSL function, or describe it to an AI assistant" : "Build it from nodes in its visual programming environment" },
        { label: "Music as input", value: (h, s) => us(s) ? "Built in: system audio from any app, with beat, tempo and spectrum worked out" : "Something you set up in your own project" },
        { label: "Licence", value: (h, s) => us(s) ? `Open source (${h.rec(s).licence.name})` : "Perpetual, with a year of updates" },
    ],
    verdict: {
        pickUs: "you want visuals for the music you're playing, today, without building a project first; you'd like to write scenes as code or by describing them to an AI assistant; and you don't want a resolution cap or a licence to think about.",
        pickThem: "you're building an installation, interactive piece or live show, you need inputs and outputs beyond music and a screen, or you work on Windows. TouchDesigner is a whole environment; Vibresia is one finished app.",
    },
    sections: [
        {
            h2: "Why Vibresia is the better pick for music visuals",
            html: `<p>TouchDesigner is a node-based visual programming environment for real-time interactive media. That breadth is the point of it, and it's also the cost: before anything moves to your music, you put the project together, from getting the audio in to analysing it and drawing with it.</p>
    <p>Vibresia does that part for you. It listens to the Mac's system audio, so Spotify, Apple Music, a browser or a film all work without routing. It analyses the music on the Mac (levels, bass, mids and treble, beat, tempo and the whole spectrum) and hands all of it to every scene. Open the app, allow system audio once, and one of its 18 scenes is already playing. Auto Scan moves between them on the beat.</p>`,
        },
        {
            h2: "Writing your own: one function instead of a network",
            html: `<p>If you like making visuals, this is where Vibresia is most different. A scene is a single GLSL function, <code>vec3 render(vec2 p, float t)</code>, that returns a colour for each point on the screen. The music arrives already analysed, so the function is only about the picture. The app compiles it as you go and reports errors in plain words before it saves.</p>
    <p>You don't have to write the code yourself. Vibresia ships a local MCP server, so an AI assistant can write a scene from a description, compile it, preview it and save it, while hearing what the Mac is playing. There's also a remote one at vibresia.com/mcp that can write a scene and send back a link to play it in a browser.</p>
    <p>A finished scene can be shared as a short link that plays in any browser, and the app can export the last ten seconds, with the music, as a video.</p>`,
        },
        {
            h2: "What it costs",
            html: `<p>TouchDesigner's Non-Commercial licence is ${h.cost("touchdesigner", "Non-Commercial")}, for personal use and learning. Its download page caps that licence's output at 1280x1280 and rules out paid work. For paid work, the Commercial licence is ${h.cost("touchdesigner", "Commercial")}, and Pro is ${h.cost("touchdesigner", "Pro")}. Licences are perpetual, with a year of updates included.</p>
    <p>Vibresia is free for any use, with no output cap and no licence tiers. If you made something for a client with it, that's fine too: the code is ${h.rec("vibresia").licence.name}-licensed.</p>`,
        },
        {
            h2: "Where TouchDesigner is the better choice",
            html: `<p>Vibresia isn't a node-based replacement, and it doesn't try to be. TouchDesigner is made for artists and developers building interactive installations, live visuals and generative work, and if that's your project, it's the tool. Vibresia has no MIDI, OSC, Syphon, Spout or NDI output, no projection mapping and no node editor. Its only job is music in and picture out.</p>
    <p>TouchDesigner also runs on Windows, and on Intel Macs from 2020 onwards. Vibresia needs ${h.rec("vibresia").requirements}.</p>`,
        },
    ],
    faq: [
        {
            q: "Is there a simpler alternative to TouchDesigner for music visuals?",
            a: "On a Mac, yes: Vibresia is a finished, free visualiser that listens to whatever is playing. You can watch its built-in scenes or write a new one as a single GLSL function.",
        },
        {
            q: "Is Vibresia free for commercial use?",
            a: "Yes. Vibresia is free for any use and open source under the MIT licence. The name and logo aren't covered by the licence.",
        },
        {
            q: "Can Vibresia do what TouchDesigner does?",
            a: "Only one part of it: visuals driven by music. It has no node editor and no video outputs for other software.",
        },
        {
            q: "Does Vibresia run on an Intel Mac?",
            a: "No. It needs macOS 14.2 or later on Apple silicon.",
        },
    ],
    related: [
        { href: "/comparison/vibresia-vs-synesthesia", text: "Vibresia vs Synesthesia" },
        { href: "/blog/best-music-visualizer-for-mac-2026", text: "The best music visualizer for Mac in 2026" },
        { href: "/vibe", text: "Write your own Vibresia scene" },
    ],
});
