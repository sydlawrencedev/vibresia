// /comparison/touchdesigner-vs-vvvv
// Target query: "touchdesigner vs vvvv" (content/url-plan.csv).
// A referee page (2b): which of the two is right for the reader. Facts come
// from the records through `h`. Both are priced in euros, so they are never
// converted.
export default (h) => ({
    slug: "touchdesigner-vs-vvvv", template: "2b",
    publishedISO: "2026-11-02", updatedISO: "2026-11-02",
    title: "TouchDesigner vs vvvv (2026): Which for Live Visuals?",
    description: "TouchDesigner or vvvv for live visuals? Two node-based environments, one of them Mac-only and the other Windows-only. Prices, platforms, who each suits.",
    eyebrow: "Creative tools compared",
    breadcrumb: "TouchDesigner vs vvvv",
    h1: "TouchDesigner vs vvvv: two node-based environments, one per platform",
    answer: `If you have a Mac, the answer is ${h.link("touchdesigner")}: vvvv has no native macOS version at all, so a Mac user has to run the Windows build in a virtual machine. If you are on Windows and want to write your patches in C# and export them as standalone applications, ${h.link("vvvv")} is the stronger of the two. Both are node-based environments for real-time graphics, both handle MIDI, OSC, DMX and NDI, and both are free for learning.`,
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
        pickA: `you have a Mac, you want MIDI, OSC, DMX, Syphon, Spout and NDI built in without installing packs, and you want a free licence for learning that will not lock you out of a Mac. The Non-Commercial licence is ${h.cost("touchdesigner", "Non-Commercial")} and Commercial is ${h.cost("touchdesigner", "Commercial")}.`,
        pickB: `you are on Windows, you want to write C# inside your patches and export them as standalone applications you can deploy without vvvv on the machine, or you need several PCs driven from one primary.`,
    },
    sections: [
        {
            h2: "Why people compare them",
            html: `<p>They are close relatives. Both are node-based environments where you patch together graphics and let them run live, both come from the same tradition of VJ and installation work, and both have been asked the same question: which one should I learn?</p>
    <p>The answer has got simpler than it was, because of the one thing that separates them now. ${h.name("vvvv")} is ${h.platforms("vvvv")} only: ${h.limit("vvvv", 1).charAt(0).toLowerCase() + h.limit("vvvv", 1).slice(1)} ${h.name("touchdesigner")} runs on ${h.platforms("touchdesigner")}.</p>`,
        },
        {
            h2: "Where TouchDesigner wins",
            html: `<p><b>It runs on a Mac.</b> ${h.name("touchdesigner")} runs on ${h.platforms("touchdesigner")}, while vvvv has no native macOS version at all, so on a Mac it is the one that runs on your own hardware rather than in a virtual machine.</p>
    <p><b>The connections are in the box.</b> TouchDesigner reads MIDI and sends it, sends and receives OSC, has Syphon on a Mac and Spout on Windows, has NDI, and has a DMX Out CHOP that sends to DMX, Art-Net, sACN, KiNET and FTDI devices. vvvv covers the same ground, but through packs you install: its MIDI nodes ship in the VL.IO.Midi package, OSC in VL.IO.OSC, Spout in VL.Stride and NDI in VL.IO.NDI.</p>
    <p><b>It has a player for the output.</b> TouchPlayer runs a TouchDesigner file on another machine, and ${h.limit("touchdesigner", 2).charAt(0).toLowerCase() + h.limit("touchdesigner", 2).slice(1)}</p>`,
        },
        {
            h2: "Where vvvv wins",
            html: `<p><b>You can write real code in it.</b> ${h.strength("vvvv", 0)} vvvv is built on .NET, so a patch that gets complicated can become C# rather than a bigger graph.</p>
    <p><b>It exports an application.</b> ${h.strength("vvvv", 2)}</p>
    <p><b>It drives a room.</b> ${h.strength("vvvv", 3)}</p>
    <p><b>The free edition is genuinely free.</b> ${h.strength("vvvv", 4)}, and ${h.limit("vvvv", 0).charAt(0).toLowerCase() + h.limit("vvvv", 0).slice(1)}</p>`,
        },
        {
            h2: "Where both fall short",
            html: `<p><b>Both need a system built before anything happens.</b> Neither plays by itself. You patch, or you build, and the result is only as good as the work you put in.</p>
    <p><b>Both cap the free edition in a way that matters.</b> TouchDesigner's Non-Commercial licence rules out paid work and caps output at 1280x1280. vvvv's free edition has no feature limits at all, but ${h.limit("vvvv", 0)}</p>
    <p><b>Neither is a music visualiser.</b> Both are general tools, and both expect you to bring the content and decide how it reacts. If what you want is visuals that react to what the Mac is playing, with nothing to prepare, that is a different job than either of these does.</p>`,
        },
        {
            h2: "What it costs",
            html: `<p>TouchDesigner's Non-Commercial licence is ${h.price("touchdesigner", "Non-Commercial")} for personal use and learning, capped at 1280x1280 output. Commercial is ${h.price("touchdesigner", "Commercial")} for paid projects, Educational is ${h.price("touchdesigner", "Educational")}, and Pro is ${h.price("touchdesigner", "Pro")}, which adds six hours of Pro Support. Derivative lists those as from prices.</p>
    <p>vvvv is free for non-commercial use, and a developer licence is ${h.price("vvvv", "Developer licence, annual, individual")} for an individual, ${h.price("vvvv", "Developer licence, annual, freelancer, SME or NPO")} for a freelancer, small or medium business or non-profit, and ${h.price("vvvv", "Developer licence, annual, NFT artists and larger enterprises")} for NFT artists and larger enterprises. A device licence for running vvvv on somebody else's computer is ${h.price("vvvv", "Device licence, annual, individual")}, and there is an educational licence at ${h.price("vvvv", "Educational licence")}. Licences stay valid once bought; only the updates expire.</p>`,
        },
    ],
    faq: [
        {
            q: "Does vvvv run on a Mac?",
            a: `Not natively. ${h.limit("vvvv", 1)} TouchDesigner runs on ${h.platforms("touchdesigner")}, so on a Mac it is the one that runs on your own hardware.`,
        },
        {
            q: "Which is easier to learn?",
            a: "That depends on what you already know. TouchDesigner is a visual environment where you wire nodes together, and its free licence is generous enough to learn on. vvvv is the same shape but sits on .NET, so if you write C# it is the more familiar of the two, and its free edition has no feature limits at all.",
        },
        {
            q: "Do they both handle MIDI, OSC and DMX?",
            a: "Yes, both do. TouchDesigner has them built in, in the MIDI CHOPs, the OSC CHOPs and the DMX Out CHOP. vvvv covers the same protocols through installable packs, and adds Art-Net, Spout, NDI and TUIO.",
        },
        {
            q: "Can I use vvvv for commercial work?",
            a: `No, not on the free edition. ${h.limit("vvvv", 0)} A developer licence is ${h.cost("vvvv", "Developer licence, annual, individual")} for an individual.`,
        },
    ],
    related: [
        { href: "/comparison", text: "All comparisons" },
        { href: "/blog/best-music-visualizer-for-mac-2026", text: "The best music visualizer for Mac in 2026" },
    ],
});
