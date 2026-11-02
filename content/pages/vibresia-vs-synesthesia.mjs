// /comparison/vibresia-vs-synesthesia
// Target query: "synesthesia free alternative" (content/url-plan.csv).
// A head-to-head: just the two apps. The case for Vibresia is watching your
// own music at home, for free. Synesthesia is the better tool for a live set,
// and the page says so.

const us = (s) => s === "vibresia";

export default (h) => ({
    slug: "vibresia-vs-synesthesia",
    template: "2c",
    versus: "synesthesia",
    publishedISO: "2026-11-02",
    updatedISO: "2026-11-02",
    title: "Synesthesia Alternative for Mac (2026): Vibresia vs Synesthesia",
    description: `Want Synesthesia's visuals at home without paying ${h.cost("synesthesia", "Standard")}? Vibresia is a free Mac visualiser for whatever is playing. Here's where each one wins.`,
    eyebrow: "Synesthesia alternative",
    breadcrumb: "Vibresia vs Synesthesia",
    h1: "Vibresia vs Synesthesia: the free alternative for watching music at home",
    answer: `If you want visuals for your own music on a Mac, Vibresia is the better fit: it's free with every feature, it listens to whatever the Mac is playing, and a new scene is one function or a sentence to an AI assistant. ${h.link("synesthesia")} costs ${h.price("synesthesia", "Standard")} for a licence, and it earns that on stage: if you perform live and need MIDI, OSC or video outputs, pick Synesthesia. We make Vibresia, so check our reasons against the sources at the bottom.`,
    cta: "Try Vibresia free with what's playing now",
    rows: [
        { label: "Price", value: (h, s) => us(s) ? "Free, every feature" : `${h.price(s, "Standard")} (Standard), ${h.price(s, "Pro")} (Pro)` },
        { label: "Free version", value: (h, s) => us(s) ? "The whole app, no watermark, no account" : h.rec(s).trial.limits },
        { label: "Runs on", value: (h, s) => us(s) ? h.rec(s).requirements : h.platforms(s) },
        { label: "Built-in scenes", value: (h, s) => us(s) ? "18, and Auto Scan moves through them on the beat" : h.strength(s, 0) },
        { label: "Making your own", value: (h, s) => us(s) ? "One GLSL function, or describe it to an AI assistant" : h.strength(s, 3) },
        { label: "Live performance", value: (h, s) => us(s) ? "Not built for it: no MIDI mapping, OSC or video outputs" : `${h.strength(s, 1)}; ${h.strength(s, 2)}` },
        { label: "Licence", value: (h, s) => us(s) ? `Open source (${h.rec(s).licence.name})` : "Paid licence that never expires" },
    ],
    verdict: {
        pickUs: "you want something beautiful moving to Spotify, Apple Music or a film on your own Mac, you'd rather not pay for it, and you'd like to make your own scenes by writing one function or asking an AI assistant.",
        pickThem: `you play live. Synesthesia has mappable MIDI and OSC controls, Syphon, Spout and NDI on the Pro licence, and it runs on Windows as well as a Mac. Vibresia has none of those.`,
    },
    sections: [
        {
            h2: "Why Vibresia is the better pick at home",
            html: `<p>Synesthesia is built for people who put visuals in front of a crowd. Its own site describes it as live music-visual software for DJs, VJs and streamers, and the licence is priced for that work. If you only want visuals while you listen, most of what you'd be paying for is the performance side: the mapped controls, the video outputs, the second computer on the Pro licence.</p>
    <p>Vibresia is built for the other job. It listens to the Mac's system audio, so it reacts to Spotify, Apple Music, a browser tab or a film with no plug-in and no routing. It analyses the music on the Mac, picks out the beat, the bass, mids and treble, and notices when the track changes. Open it, allow system audio once, and it plays.</p>
    <p>It's also free in the plain sense: every feature, no trial period, no watermark, no account. The code is open source under the ${h.rec("vibresia").licence.name} licence, so you can read how it works.</p>`,
        },
        {
            h2: "What it costs over a year",
            html: `<p>Say you want visuals on a second screen while you work, or on the TV at a party. With Synesthesia's free version you can do that, with its logo on the output (its pricing page says the trial is unlimited, and video output carries the watermark). To remove it, a Standard licence is ${h.cost("synesthesia", "Standard")}, and Pro is ${h.cost("synesthesia", "Pro")}. Both include a year of updates, and the licence itself never expires.</p>
    <p>With Vibresia the same year costs nothing, and there's no watermark to remove. That's the whole of the price comparison, and it's the main reason to choose Vibresia if you don't perform.</p>`,
        },
        {
            h2: "Making your own scenes",
            html: `<p>Both apps let you write visuals. Synesthesia has a built-in live-coding environment, and it imports Shadertoy and ISF shaders, which is a real strength if you already have shaders you like.</p>
    <p>Vibresia makes the first one easier. A scene is a single GLSL function, <code>vec3 render(vec2 p, float t)</code>, with the music's levels, beat and spectrum already worked out for you. The app compiles it, shows it, and explains errors in plain words before it saves. And if you'd rather not write code, an AI assistant can write one from a description: Vibresia ships a local MCP server that can write, compile, preview and save a scene while it listens to what's playing.</p>`,
        },
        {
            h2: "Where Synesthesia is the better choice",
            html: `<p>If you're playing a set, use Synesthesia. It has MIDI and OSC controls you can map for performance, works alongside other VJ software over Syphon, Spout and NDI, and outputs to projectors and livestreams. Vibresia has no OSC, no Syphon, Spout or NDI output, and no controls built for a set.</p>
    <p>Synesthesia also runs on Windows, and its homepage lists 80 built-in scenes with an in-app marketplace for more. Vibresia is Mac only, needs ${h.rec("vibresia").requirements}, and has 18 built-in scenes, so if you have an Intel Mac or a PC, Synesthesia is the one of these two that will run.</p>`,
        },
    ],
    faq: [
        {
            q: "Is there a free alternative to Synesthesia?",
            a: "For watching your own music on a Mac, yes: Vibresia is free with every feature and no watermark. For live performance, Synesthesia's free version works without time limit, with its logo on the video output.",
        },
        {
            q: "Can Vibresia replace Synesthesia for VJing?",
            a: "No. Vibresia has no MIDI mapping for performance, no OSC, and no Syphon, Spout or NDI output. It's a visualiser for listening, not a VJ tool.",
        },
        {
            q: "Does Vibresia work with Spotify?",
            a: "Yes. It listens to the Mac's system audio, so it reacts to Spotify, Apple Music, a browser or anything else that plays sound, with no plug-in.",
        },
        {
            q: "Can I use Shadertoy shaders in Vibresia?",
            a: "Not directly. A Vibresia scene is one GLSL function, so a Shadertoy shader needs adapting. You can ask an AI assistant to do the adapting.",
        },
    ],
    related: [
        { href: "/blog/best-music-visualizer-for-mac-2026", text: "The best music visualizer for Mac in 2026" },
        { href: "/comparison/vibresia-vs-touchdesigner", text: "Vibresia vs TouchDesigner" },
        { href: "/vibe", text: "Write your own Vibresia scene" },
    ],
});
