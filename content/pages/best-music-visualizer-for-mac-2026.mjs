// /blog/best-music-visualizer-for-mac-2026
// Target query: "best music visualizer for mac" (content/url-plan.csv).
// Facts come from the records through `h`; this file only says how to put them.

const table = [
    { label: "App", value: (h, s) => h.name(s) },
    { label: "Price", value: (h, s) => h.priceCell(s) },
    { label: "Runs on", value: (h, s) => h.platforms(s) },
    { label: "Best for", value: (h, s) => h.rec(s).bestFor },
];

export default (h) => ({
    slug: "best-music-visualizer-for-mac-2026",
    template: "2a",
    publishedISO: "2026-11-02",
    updatedISO: "2026-11-02",
    title: "Best Music Visualizer for Mac (2026): 7 Apps Compared",
    description: "Seven music visualisers for the Mac, with prices, what each is good at and where each falls short. Free and paid, checked November 2026.",
    eyebrow: "Mac music visualisers",
    breadcrumb: "Best music visualizer for Mac",
    h1: "The best music visualizer for Mac in 2026",
    answer: `For most people the answer depends on where the music is coming from. If it's the Music app, Apple's own visualiser is already on your Mac and costs nothing. If it's Spotify, a browser or anything else, you need an app that listens to the Mac's system audio: Vibresia does that for free (we make it, so weigh that), and Phosphor does it for ${h.cost("phosphor")} with an Apple TV option Vibresia doesn't have.`,
    cta: "Try Vibresia with what's playing now",
    table,
    entriesHeading: "The seven, one by one",
    entries: [
        {
            slug: "vibresia",
            pickIf: "you listen in more than one app, want something free, or want to make your own visuals by writing a shader or describing one to an AI assistant.",
        },
        {
            slug: "apple-music-visualizer",
            pickIf: "all your music is in the Music app and you don't want to install anything. Open the Music app, play a song, and choose Window, then Visualizer.",
        },
        {
            slug: "phosphor",
            strength: "Mirrors to an Apple TV, synced to the beat, and can run as a desktop wallpaper or record to video",
            weakness: `It costs ${h.cost("phosphor")}, and linking it to an Apple TV is a separate in-app purchase of ${h.cost("phosphor", "Phosphor Link (in-app purchase)")}; it needs ${h.rec("phosphor").requirements}`,
            weaknessSource: "https://apps.apple.com/us/app/id6762527200",
            pickIf: "you want the visuals on the TV, or as a wallpaper behind your work, and don't mind paying for a polished app.",
        },
        {
            slug: "projectm",
            pickIf: "you miss MilkDrop. projectM plays the same presets, thousands of them, and nothing else on this list does that on a Mac.",
        },
        {
            slug: "muvis",
            pickIf: "you want to see the notes rather than abstract shapes, or you'd like the same app on your iPhone and iPad.",
        },
        {
            slug: "nyquist",
            strength: "A clean spectrum analyser with 16 to 128 bands, in a window or the menu bar, from system audio or the microphone",
            weakness: `It's a spectrum analyser and nothing else, it costs ${h.cost("nyquist")}, and it needs ${h.rec("nyquist").requirements}`,
            weaknessSource: "https://apps.apple.com/us/app/id6759973894",
            pickIf: "you want a tidy frequency display in the menu bar more than a light show.",
        },
        {
            slug: "synesthesia",
            strength: "80 built-in scenes, MIDI and OSC controls, and Syphon, Spout and NDI output for projectors and streams",
            weakness: "It's built for live performance, and the free version puts a watermark on video output",
            weaknessSource: "https://synesthesia.live/pricing",
            pickIf: 'you DJ, VJ or stream and need to control the visuals during a set. For watching at home it\'s more than you need (see <a href="/comparison/vibresia-vs-synesthesia">Vibresia vs Synesthesia</a>).',
        },
    ],
    sections: [
        {
            h2: "What actually decides it",
            html: `<p>Three questions sort this list faster than any feature table.</p>
    <p><b>Where does your music play?</b> Apple's visualiser only reacts to songs playing in the Music app. It doesn't see Spotify, YouTube in a browser, or a DJ app. Vibresia, Phosphor and Nyquist listen to the Mac's system audio instead, so they react to whatever is playing. MuVis plays its own files or listens through the microphone.</p>
    <p><b>Do you want to watch it or perform with it?</b> Most people want something on a second screen while they work or have friends round. That's what Vibresia, Phosphor and the Apple visualiser are for. Synesthesia is a performance tool, with MIDI controllers and video outputs, and it's the right pick if you play live. The visualisers on this list don't try to do that.</p>
    <p><b>Do you want to change it?</b> projectM gives you thousands of community MilkDrop presets to choose from. Vibresia lets you write a scene from scratch, as a single GLSL function, or describe one to an AI assistant and have it written for you. Phosphor's site doesn't mention making your own scenes.</p>`,
        },
        {
            h2: "Free or paid",
            html: `<p>Four of the seven cost nothing. Apple's is part of the Music app. Vibresia and MuVis are free apps, and both are open source. projectM's library is open source under the LGPL; its Mac apps are early releases, which is worth knowing before you expect a polished install.</p>
    <p>Phosphor and Nyquist are cheap one-off purchases on the Mac App Store. Phosphor's Apple TV link is an extra in-app purchase, so the full setup is ${h.cost("phosphor")} plus ${h.cost("phosphor", "Phosphor Link (in-app purchase)")}. Synesthesia has a free version with a watermark on video output, and a licence is ${h.cost("synesthesia", "Standard")} (<a href="${h.sourceOf("synesthesia", "pricing")}">its pricing page</a>).</p>`,
        },
        {
            h2: "Which Macs they run on",
            html: `<p>Check this before anything else if your Mac is a few years old. Vibresia needs Apple silicon and macOS 14.2 or later, so it won't run on an Intel Mac. Phosphor needs Apple silicon and macOS 14.4. Nyquist needs macOS 15. MuVis needs macOS 14. Apple's visualiser is already on every Mac, in the Music app.</p>`,
        },
        {
            h2: "How we put this together",
            html: `<p>We read each app's own website, Mac App Store listing or source code on the date shown at the top, and every price, platform and feature here comes from there. We didn't buy the paid apps for this page, so we haven't written about how they feel to use, only what their makers say they do. The strengths are the ones we think each maker would agree with. We make Vibresia and put it first because it's ours; the "pick it if" lines are there so you can skip it when something else fits better.</p>`,
        },
    ],
    faq: [
        {
            q: "Does Apple Music have a visualizer on Mac?",
            a: "Yes. Play a song in the Music app and choose Window, then Visualizer. It only reacts to music playing in the Music app.",
        },
        {
            q: "Is there a free music visualizer for Mac that works with Spotify?",
            a: `Vibresia is free and listens to the Mac's system audio, so it reacts to Spotify without a plug-in. Phosphor and Nyquist also capture system audio, for ${h.cost("phosphor")} and ${h.cost("nyquist")}.`,
        },
        {
            q: "Can I get MilkDrop on a Mac?",
            a: "Not MilkDrop itself, which is a Winamp plug-in for Windows. projectM plays MilkDrop's presets on a Mac. See <a href=\"/blog/milkdrop-alternatives-mac-2026\">MilkDrop alternatives for Mac</a>.",
        },
        {
            q: "Will these work on an Intel Mac?",
            a: "Vibresia and Phosphor need Apple silicon, so no. Check the other apps' requirements on their own pages before you download.",
        },
    ],
    related: [
        { href: "/blog/milkdrop-alternatives-mac-2026", text: "MilkDrop alternatives for Mac (2026)" },
        { href: "/blog/does-milkdrop-work-on-mac", text: "Does MilkDrop work on a Mac?" },
        { href: "/comparison/vibresia-vs-synesthesia", text: "Vibresia vs Synesthesia" },
        { href: "/vibescapes", text: "See Vibresia's scenes, and ones people have made" },
        { href: "/agents", text: "Have an AI assistant write a scene for you" },
    ],
});
