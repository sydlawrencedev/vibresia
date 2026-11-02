// /comparison/nestdrop-vs-milkdrop
// Target query: "nestdrop vs milkdrop" (content/url-plan.csv).
// A referee page (2b): which of the two is right for the reader. Facts come
// from the records through `h`.
export default (h) => ({
    slug: "nestdrop-vs-milkdrop", template: "2b",
    publishedISO: "2026-11-02", updatedISO: "2026-11-02",
    title: "NestDrop vs MilkDrop (2026): Which Should You Use?",
    description: "NestDrop vs MilkDrop: one is a VJ tool built on the MilkDrop engine, the other is the original Winamp plug-in. Who each suits, what each costs.",
    eyebrow: "Referee comparison",
    breadcrumb: "NestDrop vs MilkDrop",
    h1: "NestDrop vs MilkDrop: which one is right for you?",
    answer: `Pick ${h.link("milkdrop")} if you use Winamp on Windows and want the original visualiser, as its author made it. Pick ${h.link("nestdrop")} if you want MilkDrop presets for live work: it's built on the MilkDrop engine and adds beat-driven preset changes, hotkeys, queues and up to four video decks over Spout. Both are Windows only, so neither is an answer on a Mac.`,
    cta: "Try Vibresia free",
    rows: [
        { label: "What it is", value: (h, s) => h.rec(s).tagline },
        { label: "Price", value: (h, s) => h.priceCell(s) },
        { label: "Runs on", value: (h, s) => h.platforms(s) },
        { label: "Best for", value: (h, s) => h.rec(s).bestFor },
        { label: "Main strength", value: (h, s) => h.strength(s, 0) },
        { label: "Also good at", value: (h, s) => h.strength(s, 1) },
        { label: "And", value: (h, s) => h.strength(s, 2) },
    ],
    verdict: {
        pickA: "you play visuals for an audience: you want presets that change on the beat, hotkeys, favourites and queues, and video sent on to other software over Spout. The free Classic edition is enough to find out.",
        pickB: "you listen to music in Winamp on Windows and want the original MilkDrop, with its huge range of beat-driven effects, and you have no need for video output or VJ controls.",
    },
    sections: [
        {
            h2: "How the two are related",
            html: `<p>These two aren't rivals from different camps. ${h.name("nestdrop")} is built on the MilkDrop engine and plays MilkDrop presets. What it adds is everything around the engine that a VJ needs on a night: control while it runs, and a way to get the picture out to other software.</p>
    <p>MilkDrop is Ryan Geiss's original, made as a plug-in for Winamp. So the real question isn't which one looks better. The presets are the same family. It's whether you're watching your own music or performing for someone else.</p>`,
        },
        {
            h2: "Where NestDrop wins",
            html: `<p><b>Live control.</b> NestDrop changes presets automatically on the beat, and gives you hotkeys, favourites and queues. That's the difference between leaving a visualiser running and steering one through a set.</p>
    <p><b>Video output.</b> It can run up to four video decks over Spout, at resolutions above 8K at 60 fps. Spout passes video to other Windows software, so NestDrop can feed a mixer or a projection tool rather than only filling its own window.</p>
    <p><b>A curated library.</b> It comes with a curated library of 1,900 presets, and it takes your own as well. You don't have to hunt for preset packs before your first gig.</p>
    <p><b>A clear upgrade path.</b> The Classic edition is free. If you outgrow it, the paid editions add colour, strobe and LFO controls, more MIDI controllers and more ways in and out (see below).</p>`,
        },
        {
            h2: "Where MilkDrop wins",
            html: `<p><b>It's the original.</b> Beat detection drives a huge range of effects, and the presets NestDrop plays come from this engine. If you want MilkDrop as it was made, this is it.</p>
    <p><b>It isn't tied to Winamp playback.</b> It can be driven by a live feed such as a microphone or line-in. So it can react to sound coming into the computer, not only to files in a playlist.</p>
    <p><b>The source is out there.</b> Its author has published the source code for several versions. If you'd like to read how it works, or build on it, you can.</p>
    <p><b>Less to learn.</b> It's a visualiser in your music player, not a VJ tool. If you only want something good to look at while an album plays, the extra controls in NestDrop are more than you need.</p>`,
        },
        {
            h2: "Where both fall short",
            html: `<p>Both run on ${h.platforms("milkdrop")} only. Neither one is listed for any other system.</p>
    <p>MilkDrop's age shows here too: ${h.limit("milkdrop", 0).replace(/^Windows only, as a Winamp plug-in; /, "")}. It's a Winamp plug-in, so you also need Winamp to use it the usual way.</p>
    <p>If you're on a Mac and searched for either one, see <a href="/blog/does-milkdrop-work-on-mac">does MilkDrop work on a Mac?</a> for what does run there.</p>`,
        },
        {
            h2: "What it costs",
            html: `<p>NestDrop sells one-time licences, not a subscription. ${h.rec("nestdrop").pricing.tiers[0].name} is free and includes four Spout decks, the 1,900 presets and beat-driven preset changes. Midnight is ${h.cost("nestdrop", "Midnight")} once, and adds colour, strobe and LFO controls, several MIDI controllers and direct fullscreen output. Midnight Pro is ${h.cost("nestdrop", "Midnight Pro")} once, and adds OSC remote control, ASIO input, Ableton Link and NDI output.</p>
    <p>So a VJ who wants Ableton Link to keep visuals in time with a set pays ${h.cost("nestdrop", "Midnight Pro")} once, and that's the total. Someone who only needs to drive a projector full screen pays ${h.cost("nestdrop", "Midnight")}.</p>
    <p>MilkDrop's site doesn't list a price, so we haven't given one here.</p>`,
        },
    ],
    faq: [
        {
            q: "Is NestDrop the same as MilkDrop?",
            a: "No, but it's built on the MilkDrop engine and plays MilkDrop presets. NestDrop adds VJ controls such as beat-driven preset changes, hotkeys and queues, and sends video to other software over Spout.",
        },
        {
            q: "Is NestDrop free?",
            a: "The Classic edition is free. It includes four Spout decks, 1,900 presets and beat-driven preset changes. The paid Midnight and Midnight Pro editions are one-time purchases.",
        },
        {
            q: "Can MilkDrop react to a microphone instead of Winamp?",
            a: "Yes. MilkDrop can be driven by a live feed such as a microphone or line-in, not only by what Winamp is playing.",
        },
        {
            q: "Do NestDrop or MilkDrop work on a Mac?",
            a: "No. Both are Windows only. MilkDrop's page lists Windows 98 through Windows 7.",
        },
    ],
    related: [
        { href: "/comparison", text: "All comparisons" },
        { href: "/blog/milkdrop-alternatives-mac-2026", text: "MilkDrop alternatives for Mac" },
        { href: "/blog/does-milkdrop-work-on-mac", text: "Does MilkDrop work on a Mac?" },
    ],
});
