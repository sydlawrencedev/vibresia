// /comparison/touchdesigner-vs-blender
// Target query: "touchdesigner vs blender" (content/url-plan.csv).
// A referee page (2b): which of the two is right for the reader. Facts come
// from the records through `h`. TouchDesigner is priced in dollars and
// Blender is free, so there is nothing to convert.
export default (h) => ({
    slug: "touchdesigner-vs-blender", template: "2b",
    publishedISO: "2026-11-02", updatedISO: "2026-11-02",
    title: "TouchDesigner vs Blender (2026): Which for Live Visuals?",
    description: "TouchDesigner or Blender for live visuals? A node-based environment against a free 3D suite. Prices, what each does, and who each one suits.",
    eyebrow: "Creative tools compared",
    breadcrumb: "TouchDesigner vs Blender",
    h1: "TouchDesigner vs Blender: a live environment or a 3D suite?",
    answer: `If you want to build something that reacts live, to a show, a room or an installation, pick ${h.link("touchdesigner")}: it is a node-based environment for real-time work, with MIDI, OSC, DMX, Syphon, Spout and NDI built in. If you want to model, animate and render, and want a suite that covers the whole 3D pipeline for nothing, pick ${h.link("blender")}. Both run on macOS and Windows and both are free to start with, but they differ on one thing that matters here: TouchDesigner reads live audio and control signals, while Blender analyses a sound held in the file rather than what the computer is playing.`,
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
        pickA: `you are building something live, on a Mac or a Windows machine, and you want MIDI, OSC, DMX, video in and video out without installing anyone else's add-on. The Non-Commercial licence is ${h.cost("touchdesigner", "Non-Commercial")} for learning, and Commercial is ${h.cost("touchdesigner", "Commercial")} for paid work.`,
        pickB: `you are making 3D and animation and want one application that covers modelling, rigging, simulation, rendering and video editing, for nothing, with no licence to buy before a paid job.`,
    },
    sections: [
        {
            h2: "Why people compare them",
            html: `<p>They are both free, both run on a Mac, and both end up on a laptop at a live show. But they are built around different ideas about what you make. ${h.name("blender")} is ${h.rec("blender").tagline.replace(/\.$/, "").toLowerCase()}. ${h.name("touchdesigner")} is ${h.rec("touchdesigner").tagline.replace(/\.$/, "").toLowerCase()}.</p>
    <p>One makes finished images and films. The other makes systems that run while something else is happening. If you want a video, one of them is the answer. If you want visuals that answer the room, the other is.</p>`,
        },
        {
            h2: "Where TouchDesigner wins",
            html: `<p><b>The connections are built in.</b> This is the difference that decides a live setup. TouchDesigner reads MIDI and sends it, sends and receives OSC, has Syphon on a Mac and Spout on Windows, has NDI, and has a DMX Out CHOP that sends to DMX, Art-Net, sACN, KiNET and FTDI devices. Blender has none of these itself: ${h.rec("blender").io.midi.text.charAt(0).toLowerCase() + h.rec("blender").io.midi.text.slice(1)}, and the rest come from add-ons on the Extensions platform or from third parties.</p>
    <p><b>It hears what is playing.</b> TouchDesigner takes audio input live and can drive parameters from it, and it takes MIDI and OSC to change them while it runs. Blender cannot do the equivalent: ${h.limit("blender", 3).charAt(0).toLowerCase() + h.limit("blender", 3).slice(1)}</p>
    <p><b>It has a player for the output.</b> TouchPlayer runs a TouchDesigner file on another machine, and ${h.rec("touchdesigner").io.video.text.charAt(0).toLowerCase() + h.rec("touchdesigner").io.video.text.slice(1)}</p>`,
        },
        {
            h2: "Where Blender wins",
            html: `<p><b>It is free for paid work.</b> ${h.strength("blender", 4)}. Its licence page states that Blender can be used commercially by artists and studios and that what you create is yours alone, with no registration and no internet connection. TouchDesigner's free licence is ${h.cost("touchdesigner", "Non-Commercial")} and it rules out paid work and caps output at 1280x1280.</p>
    <p><b>It covers the whole pipeline.</b> ${h.strength("blender", 0)}</p>
    <p><b>It is three platforms.</b> ${h.name("blender")} runs on ${h.platforms("blender")}, so the same project opens on whatever the studio has. TouchDesigner runs on ${h.platforms("touchdesigner")}.</p>
    <p><b>It has three engines.</b> ${h.strength("blender", 2)}</p>`,
        },
        {
            h2: "Where both fall short",
            html: `<p><b>Neither is small.</b> Blender's download is listed at 330 MB for the macOS disk image and 349 MB for the Windows installer, and ${h.limit("blender", 1)} TouchDesigner is a full environment too, and it wants a machine that can run it.</p>
    <p><b>Both are built to be driven by a person.</b> Neither plays by itself. Blender wants a scene built and then rendered; TouchDesigner wants a network of nodes built and then run. Either way, the result is only as good as the work you put in.</p>
    <p><b>Neither is a music visualiser.</b> Both are general tools, and both expect you to bring the content and decide how it reacts. If what you want is visuals that react to what the Mac is playing, with nothing to prepare, that is a different job than either of these does.</p>`,
        },
        {
            h2: "What it costs",
            html: `<p>Blender is free. That is the whole price: ${h.price("blender", "Blender")}, and its licence lets studios use it commercially. The paid parts of the Blender world are training, production assets and support, sold by Blender Studio as a subscription, not the software itself.</p>
    <p>TouchDesigner's Non-Commercial licence is ${h.price("touchdesigner", "Non-Commercial")} for personal use and learning, capped at 1280x1280 output. Commercial is ${h.price("touchdesigner", "Commercial")} for paid projects, Educational is ${h.price("touchdesigner", "Educational")} and Pro is ${h.price("touchdesigner", "Pro")}, which adds six hours of Pro Support. Derivative lists those as from prices.</p>`,
        },
    ],
    faq: [
        {
            q: "Is Blender better than TouchDesigner for live visuals?",
            a: "For a live system that reacts to sound and control signals, TouchDesigner is the better tool: its MIDI, OSC, DMX and video connections are built in and it reads live audio. For modelling, animation and finished renders, Blender is the better tool by a distance, and it is free for commercial work.",
        },
        {
            q: "Can Blender react to music?",
            a: `Not live. ${h.rec("blender").io.midi.text.charAt(0).toLowerCase() + h.rec("blender").io.midi.text.slice(1)} Blender analyses the sound in the file, so making it react to a live input means routing that input into it yourself.`,
        },
        {
            q: "Can I use Blender for commercial work?",
            a: "Yes. Blender is free and open source under the GNU General Public License, and its licence page states that it can be used commercially by artists and studios. TouchDesigner's free Non-Commercial licence is the one that rules out paid work.",
        },
        {
            q: "Do they run on the same computers?",
            a: `Both run on a Mac and on Windows, and Blender also runs on Linux. Blender needs ${h.rec("blender").requirements}, and TouchDesigner needs ${h.rec("touchdesigner").requirements.split(";")[0]}.`,
        },
    ],
    related: [
        { href: "/comparison", text: "All comparisons" },
        { href: "/blog/best-music-visualizer-for-mac-2026", text: "The best music visualizer for Mac in 2026" },
    ],
});
