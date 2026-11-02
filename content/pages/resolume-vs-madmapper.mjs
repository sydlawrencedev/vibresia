// /comparison/resolume-vs-madmapper
// Target query: "resolume vs madmapper" (content/url-plan.csv).
// A referee page (2b): which of the two is right for the reader. Facts come
// from the records through `h`. Prices are in euros on both sides, so they
// are never converted.
export default (h) => ({
    slug: "resolume-vs-madmapper", template: "2b",
    publishedISO: "2026-11-02", updatedISO: "2026-11-02",
    title: "Resolume vs MadMapper (2026): Which VJ Software to Use?",
    description: "Resolume or MadMapper for live visuals? Prices, platforms, what each does and who each one suits, from each maker's own pages.",
    eyebrow: "VJ software compared",
    breadcrumb: "Resolume vs MadMapper",
    h1: "Resolume vs MadMapper: which VJ software is right for you?",
    answer: `If you want a VJ application you can open and play a show from, pick ${h.link("resolume")}: Avenue is ${h.cost("resolume", "Avenue")} and Arena, at ${h.cost("resolume", "Arena")}, adds the media-server features. If you want mapping and lighting to be the point of the software rather than an extra, pick ${h.link("madmapper")}, whose warping tools, DMX control and shader editor are built in from the start. Both run on macOS and Windows, both are made for live shows, and both are paid: MadMapper's free demo watermarks its output and blacks out its DMX every 30 seconds, and Resolume's free version watermarks the video.`,
    cta: "Try Vibresia free",
    connections: true,
    rows: [
        { label: "What it is", value: (h, s) => h.rec(s).tagline },
        { label: "Price", value: (h, s) => h.priceCell(s) },
        { label: "Runs on", value: (h, s) => h.platforms(s) },
        { label: "Requirements", value: (h, s) => h.rec(s).requirements },
        { label: "Known for", value: (h, s) => h.strength(s, 0) },
        { label: "Best for", value: (h, s) => h.rec(s).bestFor },
    ],
    verdict: {
        pickA: `you want to open an application and play a show from it, you want one tool that covers decks, effects and media playback, or your venue already runs Resolume and handover matters. Avenue is ${h.cost("resolume", "Avenue")}, and Arena at ${h.cost("resolume", "Arena")} adds the media-server features for bigger rooms.`,
        pickB: `you are mapping video onto real surfaces, running LED strips or DMX fixtures, or you want to write your own shaders and see them live. The warping and lighting tools are standard rather than an upgrade, and the shader editor is part of the software.`,
    },
    sections: [
        {
            h2: "Why people compare them",
            html: `<p>These are the two VJ applications that come up together, because they do the same job from opposite ends. ${h.name("resolume")} is built around decks of media and effects that you perform from. ${h.name("madmapper")} is built around surfaces: warping content onto whatever shape is in front of you, and driving the lights in the room from the same timeline.</p>
    <p>Both run on a Mac and on Windows, both are used for live shows, and both cost money for serious work. So the question is never which one is better, it is which one your show needs. If the show is a row of screens and a haze machine, Resolume is the simpler answer. If the show is a curved surface with a truss of fixtures, MadMapper is.</p>`,
        },
        {
            h2: "Where Resolume wins",
            html: `<p><b>It is a performance tool first.</b> ${h.name("resolume")} is ${h.strength("resolume", 0).replace(/^An/, "an")}. You load your clips, build your layers, and perform from them, which is the job a VJ application exists to do.</p>
    <p><b>One licence covers a lot.</b> Avenue (${h.cost("resolume", "Avenue")}) is the VJ application, Arena (${h.cost("resolume", "Arena")}) adds media-server features for bigger rooms, and Wire (${h.cost("resolume", "Wire")}) is a separate visual programming tool for building your own effects and generators. Each licence includes 12 months of updates and keeps working afterwards.</p>
    <p><b>You can try it for as long as you like.</b> Resolume is free to use indefinitely. The catch is that video output has a Resolume watermark and audio has a robot voice until you enter a serial number, which is enough to learn the software but not to play a paid show.</p>`,
        },
        {
            h2: "Where MadMapper wins",
            html: `<p><b>Mapping and lighting are the point of it.</b> ${h.name("madmapper")} does ${h.strength("madmapper", 0).replace(/^[A-Z]/, (c) => c.toLowerCase())}, and it also does ${h.strength("madmapper", 2).replace(/^[A-Z]/, (c) => c.toLowerCase())}. That is the difference worth checking against your show: in Resolume, ${h.limit("resolume", 0)}</p>
    <p><b>You can write your own visuals in it.</b> ${h.strength("madmapper", 3)}, with a material library the community shares. For someone who wants to make their own look rather than choose from presets, that is a real advantage.</p>
    <p><b>It can drive a lot of fixtures.</b> MadMapper handles DMX over Art-Net, sACN and USB, with a fixture editor and its own control of the output frame rate, and it can send as many projector outputs as the graphics card allows.</p>
    <p><b>The demo is genuinely free.</b> ${h.limit("madmapper", 0)} The catch is what it leaves out: ${h.limit("madmapper", 1)}</p>`,
        },
        {
            h2: "Where both fall short",
            html: `<p><b>Neither is free to run a show on.</b> Resolume's unlicensed version watermarks the video and robs the audio of its voice. MadMapper's demo watermarks its output and blacks out the DMX devices every 30 seconds, so a lighting desk stops responding halfway through a cue. Both mean you are working with the trial, not the software.</p>
    <p><b>Both need a show made before the show.</b> Whichever you pick, the visuals are only as good as the material you prepared and the cues you built. Neither turns a folder of files into a performance by itself.</p>
    <p><b>Both have a ceiling on what one machine can drive.</b> Resolume's number of outputs is limited by the graphics card, to five outputs and a control monitor. MadMapper's projector outputs are limited by the graphics card too, and its Space Scanner crops to a quarter of its resolution in the demo.</p>`,
        },
        {
            h2: "What it costs",
            html: `<p>Resolume Avenue is ${h.price("resolume", "Avenue")}, Arena is ${h.price("resolume", "Arena")} and Wire is ${h.price("resolume", "Wire")}. MadMapper is ${h.price("madmapper", "Perpetual licence")} for a perpetual licence, which covers the current version only, and ${h.price("madmapper", "Temporary licence")} as a temporary one. MadMapper's own shop calls those from prices: they exclude tax and rise with the number of seats, and an educational discount of 30% applies.</p>
    <p>So the entry points are ${h.cost("resolume", "Avenue")} against ${h.cost("madmapper", "Perpetual licence")}, and the work you need Arena or Wire for, on the Resolume side, is what you are really choosing between. Neither maker converts its prices into pounds, so the rate on the day you buy is yours to check.</p>`,
        },
    ],
    faq: [
        {
            q: "Is MadMapper cheaper than Resolume?",
            a: `MadMapper's perpetual licence starts at ${h.cost("madmapper", "Perpetual licence")} and its temporary one at ${h.cost("madmapper", "Temporary licence")} a month. Resolume Avenue is ${h.cost("resolume", "Avenue")} and Arena is ${h.cost("resolume", "Arena")}. Both are priced in euros, and both shops call their figures from-prices that rise with the number of seats.`,
        },
        {
            q: "Which one is better for projection mapping?",
            a: "MadMapper. Bezier masking and mesh warping are standard in it, and it uses structured light with a DSLR to calibrate a projection in 3D. In Resolume, projection mapping and edge blending are Arena features rather than Avenue ones.",
        },
        {
            q: "Do Resolume and MadMapper both run on a Mac?",
            a: `Yes, both run on macOS and Windows. Resolume needs ${h.rec("resolume").requirements}, and MadMapper needs ${h.rec("madmapper").requirements}.`,
        },
        {
            q: "Can I try Resolume or MadMapper for free?",
            a: `Yes, both. ${h.rec("resolume").trial.limits} MadMapper's demo is free and unlimited in time: ${h.limit("madmapper", 0).charAt(0).toLowerCase() + h.limit("madmapper", 0).slice(1)}`,
        },
    ],
    related: [
        { href: "/comparison", text: "All comparisons" },
        { href: "/blog/best-music-visualizer-for-mac-2026", text: "The best music visualizer for Mac in 2026" },
    ],
});
