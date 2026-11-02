// /blog/apple-music-visualizer
// Target query: "does apple music have a visualizer" (content/url-plan.csv).
// The hub for the "visualizer for {app}" spokes (template 2d). Its
// interactive element is a Vibresia scene drawn live in the browser, which
// follows the reader's microphone if they allow it. The table of apps and the
// links to every spoke are generated.

export default (h) => ({
    slug: "apple-music-visualizer",
    template: "2d",
    hub: true,
    app: "apple-music",
    publishedISO: "2026-11-02",
    updatedISO: "2026-11-02",
    title: "Does Apple Music Have a Visualizer? Yes, on Mac. Here's How",
    description: "Apple Music's visualiser is in the Music app on a Mac: Window, then Visualizer. It only works with the Music app. Here's what works with every app.",
    eyebrow: "Music visualizers on Mac",
    breadcrumb: "Apple Music visualizer",
    h1: "Does Apple Music have a visualizer?",
    answer: `Yes, on a Mac. Open the Music app, play a song, and choose Window, then Visualizer. It only visualises songs playing in the Music app, though, so it stops when you switch to Spotify, a browser or anything else. For visuals that follow every app, use one that listens to the Mac's sound: Vibresia, which we make, is free. Try a Vibresia scene below, live in this page.`,
    cta: "Get Vibresia free for every app",
    sections: [
        {
            h2: "How to turn on the Apple Music visualizer",
            html: `<p>On a Mac, open the Music app and start a song. Then choose <b>Window</b>, then <b>Visualizer</b> in the menu bar. Apple's guide says the effects change with the type of music and with whether it's playing or paused, and that the visualiser can show music videos instead of effects, from its settings.</p>
    <p>${h.limit("apple-music-visualizer")}. That's the catch: it's a feature of the Music app, so it's only there for Apple Music and your own library in that app.</p>`,
        },
        {
            h2: "A visualiser for every music app",
            html: `<p>The table above shows the other music apps people use on a Mac. As far as we can find, none of them has a visualiser built in, which is why the same question gets asked about each one. Each app's page says what it does have, with sources.</p>
    <p>Vibresia works with all of them the same way: it listens to the Mac's system audio rather than to one app. It picks out the beat, the bass, mids and treble and the tempo on the Mac, and nothing is uploaded. It has 18 built-in scenes, Auto Scan moves between them on the beat, and a new scene is one GLSL function, or a sentence to an AI assistant. The scene playing at the top of this page is drawn by the same shader code, in your browser.</p>`,
        },
        {
            h2: "Where a visualiser earns its place",
            html: `<p>Most people put a visualiser on for the same few reasons: something moving on a second display while they work, on the TV at a party, or full screen while an album plays through. In each of those the music changes source more than you'd think: a playlist in Spotify, a video someone sends, a mix in the browser. A visualiser tied to one app goes dark at the first switch; one that hears the Mac keeps going.</p>
    <p>Vibresia also notices when the track changes in Apple Music or Spotify and looks the song up in Apple's public catalogue to work out its genre, so The Band, one of its scenes, changes its line-up to suit. If a scene looks good, you can share it as a link that plays in any browser, or export the last ten seconds, with the music, as a video.</p>`,
        },
        {
            h2: "Apple's visualiser or Vibresia?",
            html: `<p>If all your music is in the Music app and you want something on screen with nothing to install, use Apple's: it's already on your Mac. If you also listen in Spotify, YouTube Music, SoundCloud, TIDAL, Mixcloud or a browser, or you want to make your own scenes, Vibresia covers all of that. It needs ${h.rec("vibresia").requirements}, and it's free.</p>`,
        },
    ],
    faq: [
        { q: "Does Apple Music have a visualizer?", a: "Yes, in the Music app on a Mac: choose Window, then Visualizer, while a song plays." },
        { q: "Does the Apple Music visualizer work with Spotify?", a: "No. It only visualises songs playing in the Music app. For Spotify and other apps, use a visualiser that hears the Mac's system audio, such as Vibresia." },
        { q: "Does the scene on this page use my microphone?", a: "Only if you press the button and allow it. The sound is analysed in the page to move the scene; nothing is recorded or sent anywhere." },
    ],
    related: [
        { href: "/blog/best-music-visualizer-for-mac-2026", text: "The best music visualizer for Mac in 2026" },
        { href: "/comparison", text: "Vibresia compared with other visualisers" },
    ],
});
