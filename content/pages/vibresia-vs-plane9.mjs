// /comparison/vibresia-vs-plane9
// Target query: "plane9 alternatives" (content/url-plan.csv).
// A head-to-head: just the two apps. Plane9 is Windows only, so the case for
// Vibresia is the Mac. Plane9 wins on Windows, in VR and on scene count, and
// the page says so.

const us = (s) => s === "vibresia";

export default (h) => ({
    slug: "vibresia-vs-plane9",
    template: "2c",
    versus: "plane9",
    publishedISO: "2026-11-02",
    updatedISO: "2026-11-02",
    title: "Plane9 Alternative for Mac (2026): Vibresia vs Plane9",
    description: "Plane9 is a free 3D visualiser for Windows only. On a Mac, Vibresia is the free alternative that reacts to whatever is playing. Here's how they compare.",
    eyebrow: "Plane9 alternative",
    breadcrumb: "Vibresia vs Plane9",
    h1: "Vibresia vs Plane9: the free alternative for a Mac",
    answer: `${h.link("plane9")} doesn't run on a Mac: its download page lists Windows only. If you're on a Mac and want what Plane9 gives Windows users, free visuals that move with the music, Vibresia is the alternative: it's free, it listens to whatever the Mac is playing, and you can write new scenes or have an AI assistant write them. On Windows, Plane9 is still the pick, with far more scenes and VR support. We make Vibresia, so check our reasons against the sources at the bottom.`,
    cta: "Try Vibresia free with what's playing now",
    rows: [
        { label: "Price", value: (h, s) => us(s) ? "Free, every feature" : `${h.priceCell(s)}, ad-free` },
        { label: "Runs on", value: (h, s) => us(s) ? h.rec(s).requirements : h.limit(s, 0) },
        { label: "Built-in scenes", value: (h, s) => us(s) ? "18, and Auto Scan moves through them on the beat" : h.strength(s, 0) },
        { label: "Ways to watch", value: (h, s) => us(s) ? "A window or full screen on the Mac" : h.strength(s, 1) },
        { label: "Hears", value: (h, s) => us(s) ? "System audio from any app, the microphone, or a demo tone" : "Not stated on its download page" },
        { label: "Making your own", value: (h, s) => us(s) ? "One GLSL function, or describe it to an AI assistant" : "Combine its scenes and transitions" },
        { label: "Licence", value: (h, s) => us(s) ? `Open source (${h.rec(s).licence.name})` : "Free download" },
    ],
    verdict: {
        pickUs: "you're on a Mac with Apple silicon and want free visuals for Spotify, Apple Music, a browser or a film, and you'd like to write new scenes as code or by describing them to an AI assistant.",
        pickThem: "you're on Windows and want a free 3D visualiser or screensaver with hundreds of scenes, or you want to watch in an Oculus Rift or HTC Vive. Vibresia doesn't run on Windows and has no VR mode.",
    },
    sections: [
        {
            h2: "Why Vibresia is the pick on a Mac",
            html: `<p>Plane9 is a free 3D music visualiser and screensaver, and it's well loved on Windows. But it is Windows only. Its download page lists ${h.limit("plane9", 0).replace(/^Windows 7 to 10; /, "Windows 7 to 10, and ")}, so it hasn't had a new release in years either.</p>
    <p>Vibresia is built for the Mac and is updated now: it checks for updates on launch and installs them from the menu. It listens to the Mac's system audio, so it reacts to Spotify, Apple Music, a browser tab or a film without a plug-in, and it can use the microphone instead. It analyses the music on the Mac, picks out the beat, the bass, mids and treble and the tempo, and hands all of it to the scene on screen.</p>
    <p>It's free in the same way Plane9 is: no price, no ads. It's also open source under the ${h.rec("vibresia").licence.name} licence, and there's no account to make.</p>`,
        },
        {
            h2: "Scenes: hundreds to choose from, or ones you write",
            html: `<p>Plane9's strength is its library. Its download page lists over 250 scenes, which it can combine, with 39 transitions between them. Vibresia has 18 built-in scenes, so if variety out of the box is what you want, Plane9 has more.</p>
    <p>Vibresia makes up for it by letting you make more. A scene is a single GLSL function, <code>vec3 render(vec2 p, float t)</code>, with the music already analysed for you. The app compiles it and explains errors in plain words before it saves. If you'd rather not write code, an AI assistant can write one from a description, using the local MCP server the app ships with. A scene you like can be shared as a short link that plays in any browser, with or without the app.</p>`,
        },
        {
            h2: "Where Plane9 is the better choice",
            html: `<p>On a Windows PC, use Plane9: Vibresia is Mac only, and needs ${h.rec("vibresia").requirements}, so it won't run on an Intel Mac either. Plane9 also works as a screensaver and in Oculus Rift and HTC Vive headsets, and Vibresia does neither.</p>
    <p>If you're looking at other visualisers for the Mac too, <a href="/blog/best-music-visualizer-for-mac-2026">the best music visualizers for Mac</a> lists seven of them, with prices.</p>`,
        },
    ],
    faq: [
        {
            q: "Is there a Plane9 for Mac?",
            a: "No. Plane9's download page lists Windows 7 to 10 only. On a Mac, Vibresia is a free visualiser that reacts to whatever is playing.",
        },
        {
            q: "Is Vibresia free like Plane9?",
            a: "Yes. Vibresia is free with every feature, no ads and no account, and it's open source under the MIT licence.",
        },
        {
            q: "Can Vibresia run as a screensaver?",
            a: "No. Vibresia runs as an app, in a window or full screen. Plane9 has a screensaver mode, on Windows.",
        },
        {
            q: "Does Vibresia work on an Intel Mac?",
            a: "No. It needs macOS 14.2 or later on Apple silicon.",
        },
    ],
    related: [
        { href: "/blog/best-music-visualizer-for-mac-2026", text: "The best music visualizer for Mac in 2026" },
        { href: "/blog/milkdrop-alternatives-mac-2026", text: "MilkDrop alternatives for Mac (2026)" },
        { href: "/vibe", text: "Write your own Vibresia scene" },
    ],
});
