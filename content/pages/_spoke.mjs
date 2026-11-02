// The shared shape of a "visualizer for {app} on Mac" spoke (template 2d).
// The verdict table at the top is computed from content/data/music-apps.json
// by the generator; this file writes the prose around it. A spoke supplies
// only what's particular to its app: the answer, one section of its own and
// its own questions. Everything said about the app comes from that app's
// facts; everything said about Vibresia comes from the truth sheet.

export function spoke(h, c) {
    return {
        slug: c.slug,
        template: "2d",
        app: c.app,
        publishedISO: "2026-11-02",
        updatedISO: "2026-11-02",
        title: c.title,
        description: c.description,
        eyebrow: `Visualizer for ${c.name}`,
        breadcrumb: `${c.name} visualizer on Mac`,
        h1: c.h1,
        answer: c.answer,
        cta: `Try Vibresia free with ${c.name}`,
        sections: [
            c.own,
            {
                h2: `How to get visuals for ${c.name} on a Mac`,
                html: `<p>Vibresia is a free Mac app that listens to the Mac's system audio, so it doesn't need ${c.name} to support it. Install it, allow it to hear system audio the first time it asks, and play something in ${c.name}. The visuals follow the music straight away: it picks out the beat, the bass, mids and treble and the tempo on the Mac, and nothing is uploaded.</p>
    <p>It has 18 built-in scenes, and Auto Scan moves between them on the beat. If you want something of your own, a scene is a single GLSL function, or you can describe one to an AI assistant and have it written for you. It needs ${h.rec("vibresia").requirements}.</p>`,
            },
            {
                h2: "Why system audio is the way to do it",
                html: `<p>A visualiser built into one music app only sees that app. Apple's own visualiser is a good example: it only works with songs playing in the Music app. Listening to the Mac's system audio instead means one visualiser works with ${c.name}, with every other music app, with a browser tab and with a film, and keeps going when you switch between them.</p>`,
            },
        ],
        faq: [
            ...c.faq,
            {
                q: `Is Vibresia free?`,
                a: "Yes. Every feature is free, with no account and no trial, and the code is open source under the MIT licence.",
            },
        ],
        related: [
            { href: "/blog/best-music-visualizer-for-mac-2026", text: "The best music visualizer for Mac in 2026" },
            { href: "/vibe", text: "Write your own Vibresia scene" },
        ],
    };
}
