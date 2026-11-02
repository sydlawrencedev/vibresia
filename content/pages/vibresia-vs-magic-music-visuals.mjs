// /comparison/vibresia-vs-magic-music-visuals
// Target query: "magic music visuals alternative" (content/url-plan.csv).
// A head-to-head: just the two apps. The case for Vibresia is a finished,
// free visualiser for what the Mac is playing. Magic is the better pick for
// building visuals for a live show or a music video, and the page says so.
// Magic's own site blocks automated reading, so its record is from
// third-party pages and has no price: the page doesn't state one.

const us = (s) => s === "vibresia";

export default (h) => ({
    slug: "vibresia-vs-magic-music-visuals",
    template: "2c",
    versus: "magic-music-visuals",
    publishedISO: "2026-11-02",
    updatedISO: "2026-11-02",
    title: "Magic Music Visuals Alternative (2026): Vibresia vs Magic",
    description: "Magic Music Visuals is a modular editor for live visuals. If you only want visuals for what your Mac is playing, Vibresia is free and plays out of the box.",
    eyebrow: "Magic Music Visuals alternative",
    breadcrumb: "Vibresia vs Magic Music Visuals",
    h1: "Vibresia vs Magic Music Visuals: the simpler alternative for your own music",
    answer: `If you want visuals for the music you're playing on a Mac, without building them first, Vibresia is the simpler choice: it's free, it listens to whatever the Mac is playing, and it has 18 scenes ready to watch. ${h.link("magic-music-visuals")} is a modular editor for building visuals, made for live performances and music videos, and if that's your work, it's the better tool. We make Vibresia, so check our reasons against the sources at the bottom.`,
    cta: "Try Vibresia free with what's playing now",
    rows: [
        { label: "What it is", value: (h, s) => us(s) ? "A finished music visualiser, with 18 built-in scenes" : h.rec(s).tagline },
        { label: "Price", value: (h, s) => us(s) ? "Free, every feature" : h.priceCell(s) },
        { label: "Runs on", value: (h, s) => us(s) ? h.rec(s).requirements : h.platforms(s) },
        { label: "Making a visual", value: (h, s) => us(s) ? "One GLSL function, or describe it to an AI assistant" : h.strength(s, 0) },
        { label: "What drives it", value: (h, s) => us(s) ? "System audio from any app, analysed for you" : h.strength(s, 1) },
        { label: "Live performance", value: (h, s) => us(s) ? "Not built for it: no MIDI, OSC or video outputs" : h.strength(s, 3) },
        { label: "Licence", value: (h, s) => us(s) ? `Open source (${h.rec(s).licence.name})` : "Proprietary" },
    ],
    verdict: {
        pickUs: "you want something beautiful moving to Spotify, Apple Music or a film on your own Mac, today, for free, and you'd rather write a scene as one function, or describe it to an AI assistant, than wire one up in an editor.",
        pickThem: "you're making visuals for a live show or a music video, you want MIDI, OSC and several audio inputs driving them, or you work on Windows. Magic is built for that work, and Vibresia isn't.",
    },
    sections: [
        {
            h2: "Why Vibresia is the simpler pick for listening",
            html: `<p>Magic Music Visuals is an editor. Wikipedia describes it as a music visualiser and VJ application with a modular interface for many types of media, where nearly every setting can be driven by audio or MIDI. That flexibility is why people use it for live shows and music videos. It also means the visuals are something you put together.</p>
    <p>Vibresia is a finished visualiser. It listens to the Mac's system audio, so it reacts to Spotify, Apple Music, a browser tab or a film, with nothing to route. It analyses the music on the Mac (levels, bass, mids and treble, beat, tempo and the whole spectrum) and hands all of it to the scene on screen. Open it, allow system audio once, and one of its 18 scenes is already playing. Auto Scan moves between them on the beat.</p>`,
        },
        {
            h2: "Making your own: a function, or a sentence",
            html: `<p>You can make new visuals in both. In Magic you build them from modules. In Vibresia a scene is a single GLSL function, <code>vec3 render(vec2 p, float t)</code>, with the music already analysed for you; the app compiles it and explains errors in plain words before it saves.</p>
    <p>If you'd rather not write code at all, an AI assistant can write a Vibresia scene from a description. The app ships a local MCP server that can write, compile, preview and save a scene while hearing what's playing. A scene you like can be shared as a short link that plays in any browser, and the app can export the last ten seconds, with the music, as a video.</p>`,
        },
        {
            h2: "What it costs",
            html: `<p>Vibresia is free, with every feature, no trial and no account, and it's open source under the ${h.rec("vibresia").licence.name} licence.</p>
    <p>Magic is a paid app with a free demo, according to the third-party sources below. We couldn't confirm its current prices: its own site blocks automated reading, and the prices we found elsewhere are years old. Check its site before you buy.</p>`,
        },
        {
            h2: "Where Magic Music Visuals is the better choice",
            html: `<p>For live performance, use Magic. It takes several audio, MIDI and OSC inputs at once and has a full-screen mode for shows. Vibresia has no MIDI or OSC control and no video outputs for other software; it's for watching your own music.</p>
    <p>Magic also runs on Windows, and Vibresia needs ${h.rec("vibresia").requirements}. And if you're making a full music video, Magic is built for it, where Vibresia's export is a ten-second clip.</p>`,
        },
    ],
    faq: [
        {
            q: "Is there a free alternative to Magic Music Visuals?",
            a: "For visuals while you listen on a Mac, yes: Vibresia is free with every feature. For live shows and music videos, Magic is the more capable tool.",
        },
        {
            q: "Does Vibresia work with Spotify?",
            a: "Yes. It listens to the Mac's system audio, so it reacts to Spotify, Apple Music, a browser or anything else that plays sound.",
        },
        {
            q: "Can Vibresia make music videos?",
            a: "Only short ones: it exports the last ten seconds of a scene, with the music, as a video. For a full music video, a tool like Magic is a better fit.",
        },
        {
            q: "Does Vibresia run on Windows?",
            a: "No. Vibresia needs macOS 14.2 or later on Apple silicon.",
        },
    ],
    related: [
        { href: "/blog/best-music-visualizer-for-mac-2026", text: "The best music visualizer for Mac in 2026" },
        { href: "/vibe", text: "Write your own Vibresia scene" },
        { href: "/agents", text: "Have an AI assistant write a scene for you" },
    ],
});
