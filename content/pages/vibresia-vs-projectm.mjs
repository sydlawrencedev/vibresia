// /comparison/vibresia-vs-projectm
// Target query: "projectm alternative" (content/url-plan.csv).
// A head-to-head: just the two apps. The case for Vibresia is a finished,
// signed Mac app that hears every app. projectM is the better pick for
// MilkDrop's presets, and on Windows or Linux, and the page says so.

const us = (s) => s === "vibresia";

export default (h) => ({
    slug: "vibresia-vs-projectm",
    template: "2c",
    versus: "projectm",
    publishedISO: "2026-11-02",
    updatedISO: "2026-11-02",
    title: "projectM Alternative for Mac (2026): Vibresia vs projectM",
    description: "projectM's Mac apps are still previews. Vibresia is a free, signed Mac visualiser that hears any app. Here's how they compare, and when projectM wins.",
    eyebrow: "projectM alternative",
    breadcrumb: "Vibresia vs projectM",
    h1: "Vibresia vs projectM: a finished alternative for the Mac",
    answer: `If you want a music visualiser on your Mac that installs like any other app and reacts to whatever is playing, Vibresia is the easier choice: it's free, signed and notarised, updates itself, and listens to Spotify, Apple Music or a browser with no plug-in. ${h.link("projectm")} is the open-source rebuild of MilkDrop, and if it's MilkDrop's presets you want, it's the one to pick, though its own page calls the Mac apps previews. Both are free and open source. We make Vibresia, so check our reasons against the sources at the bottom.`,
    cta: "Try Vibresia free with what's playing now",
    rows: [
        { label: "What it is", value: (h, s) => us(s) ? "A finished Mac app with 18 built-in scenes" : h.rec(s).tagline },
        { label: "Price", value: (h, s) => us(s) ? "Free, every feature" : "Free" },
        { label: "Licence", value: (h, s) => `Open source (${h.rec(s).licence.name})` },
        { label: "Runs on", value: (h, s) => us(s) ? h.rec(s).requirements : h.platforms(s) },
        { label: "Mac app status", value: (h, s) => us(s) ? "Signed, notarised, updates itself" : h.limit(s, 1) },
        { label: "MilkDrop presets", value: (h, s) => us(s) ? "No" : h.strength(s, 1) },
        { label: "Making your own", value: (h, s) => us(s) ? "One GLSL function, or describe it to an AI assistant" : "Write MilkDrop-style presets" },
    ],
    verdict: {
        pickUs: "you're on a Mac with Apple silicon and want something that installs and plays in a minute, reacts to every app's audio, and lets you make new scenes as code or by describing them to an AI assistant.",
        pickThem: "you want MilkDrop's look and its community presets, you're on Windows or Linux, or you want an open-source library to build your own visualiser on. projectM plays .milk presets; Vibresia doesn't.",
    },
    sections: [
        {
            h2: "Why Vibresia is the easier pick on a Mac",
            html: `<p>projectM is a library first. Its GitHub page describes a cross-platform library with several front-ends, and it's honest about where the Mac ones are: ${h.limit("projectm", 1).charAt(0).toLowerCase() + h.limit("projectm", 1).slice(1)}. ${h.limit("projectm", 0)}, so macOS will warn you before it runs. None of that makes projectM bad, but on a Mac it means some setup and some patience.</p>
    <p>Vibresia is one finished Mac app. It's signed and notarised, so macOS opens it without complaint, and it checks for updates on launch and installs them from the menu. It listens to the Mac's system audio, so it reacts to Spotify, Apple Music, a browser tab or a film, with nothing to route and no plug-in for each player. It analyses the music on the Mac (levels, bass, mids and treble, beat, tempo and the whole spectrum) and notices when the track changes in Apple Music or Spotify.</p>`,
        },
        {
            h2: "Presets, or scenes you can write",
            html: `<p>This is the real difference. projectM exists to play MilkDrop presets: small files of equations that the MilkDrop community wrote thousands of. Its default pack has about ten thousand. If you remember a particular MilkDrop look, projectM can show it to you, and Vibresia can't: it doesn't read .milk files.</p>
    <p>Vibresia has its own scenes instead, 18 of them, and Auto Scan moves between them on the beat. A new one is a single GLSL function, <code>vec3 render(vec2 p, float t)</code>, with the music already analysed and handed to it. The app compiles it and reports errors in plain words before it saves. If you'd rather not write code, an AI assistant can: Vibresia ships a local MCP server that can write, compile, preview and save a scene while it hears what's playing.</p>`,
        },
        {
            h2: "What both get right",
            html: `<p>Both are free, and both are open source: projectM under the ${h.rec("projectm").licence.name} licence, Vibresia under ${h.rec("vibresia").licence.name}. Neither has an account, a trial or an upgrade to buy. If you care about being able to read the code of the thing drawing on your screen, either one passes.</p>`,
        },
        {
            h2: "Where projectM is the better choice",
            html: `<p>If you're on Windows or Linux, projectM is the one of these two that runs: Vibresia is Mac only, and needs ${h.rec("vibresia").requirements}. If you want MilkDrop's presets, projectM plays them and Vibresia never will. And if you're building something of your own, projectM's library is made for other apps to build on, which is why apps like ProjectMilkSyphon use it.</p>
    <p>For a side-by-side of every way to get MilkDrop-style visuals on a Mac, presets included, see <a href="/blog/milkdrop-alternatives-mac-2026">MilkDrop alternatives for Mac</a>.</p>`,
        },
    ],
    faq: [
        {
            q: "Is there an alternative to projectM for Mac?",
            a: "Yes. Vibresia is a free, signed Mac visualiser that listens to whatever the Mac is playing. It doesn't play MilkDrop presets; it has its own scenes, and you can write more.",
        },
        {
            q: "Does Vibresia play MilkDrop presets?",
            a: "No. Vibresia's scenes are GLSL functions, not MilkDrop's preset language. For the presets on a Mac, use projectM or ProjectMilkSyphon.",
        },
        {
            q: "Are projectM and Vibresia both free?",
            a: "Yes. Both are free and open source: projectM under the LGPL, Vibresia under the MIT licence.",
        },
        {
            q: "Does Vibresia work with Spotify?",
            a: "Yes. It listens to the Mac's system audio, so it reacts to Spotify, Apple Music, a browser or anything else that plays sound.",
        },
    ],
    related: [
        { href: "/blog/milkdrop-alternatives-mac-2026", text: "MilkDrop alternatives for Mac (2026)" },
        { href: "/blog/does-milkdrop-work-on-mac", text: "Does MilkDrop work on a Mac?" },
        { href: "/vibe", text: "Write your own Vibresia scene" },
    ],
});
