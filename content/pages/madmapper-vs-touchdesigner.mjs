// /comparison/madmapper-vs-touchdesigner
// Target query: "madmapper vs touchdesigner" (content/url-plan.csv).
// A referee page (2b): which of the two is right for the reader. Facts come
// from the records through `h`. MadMapper prices are EUR and TouchDesigner's
// USD, as the records list them: never converted.
export default (h) => ({
    slug: "madmapper-vs-touchdesigner", template: "2b",
    publishedISO: "2026-11-02", updatedISO: "2026-11-02",
    title: "MadMapper vs TouchDesigner (2026): Which Should You Use?",
    description: "MadMapper or TouchDesigner for live visuals? Mapping software against a node-based environment: prices, free versions, connections and who each suits.",
    eyebrow: "Live visual tools compared",
    breadcrumb: "MadMapper vs TouchDesigner",
    h1: "MadMapper vs TouchDesigner: mapping surfaces or building a system?",
    answer: `Pick ${h.link("madmapper")} if your show needs video warped onto real surfaces with the lights driven from the same place, because it is software built around surfaces, cues and fixtures. Pick ${h.link("touchdesigner")} if you want to build the visual system yourself out of nodes, for an installation or for generative work. Both run on a Mac and on Windows, and both take MIDI, OSC, Syphon, Spout, NDI and DMX.`,
    cta: "Try Vibresia free",
    connections: true,
    rows: [
        { label: "What it is", value: (h, s) => h.rec(s).tagline },
        { label: "Price", value: (h, s) => h.priceCell(s) },
        { label: "Runs on", value: (h, s) => h.platforms(s) },
        { label: "Requirements", value: (h, s) => h.rec(s).requirements },
        { label: "Free version", value: (h, s) => s === "madmapper" ? "A free demo, but watermarked, and its DMX devices cut out every 30 seconds" : h.rec(s).trial.limits },
        { label: "Known for", value: (h, s) => h.strength(s, 0) },
        { label: "Best for", value: (h, s) => h.rec(s).bestFor },
    ],
    verdict: {
        pickA: `you are mapping video onto real surfaces and driving LED or DMX fixtures during a live show, and you would rather fill in surfaces, cues and fixtures than assemble them from parts. MadMapper has bezier masking, mesh warping, DMX, Art-Net and sACN light control with a cueing system for the show, and a GLSL shader editor, and it takes MIDI, OSC, Syphon, Spout, NDI and DMX.`,
        pickB: `you want to build the visual system itself: an interactive installation, generative work or a live rig of your own design, and you are happy wiring nodes together to make it. The Non-Commercial licence is ${h.cost("touchdesigner", "Non-Commercial")} for personal use and learning, so you can find out whether node-based work suits you before you pay for anything.`,
    },
    sections: [
        {
            h2: "Why people compare them",
            html: `<p>They are two ways of getting the same thing onto a wall. MadMapper is video and LED mapping software for macOS and Windows, with mesh warping, DMX and Art-Net lighting control and a live GLSL shader editor. TouchDesigner is Derivative's node-based visual programming environment for real-time interactive media. One has the shape of a show built into it, and the other gives you parts and leaves the shape to you.</p>
    <p>They get compared because both run on a Mac and both end up in the same room. MadMapper needs ${h.rec("madmapper").requirements}. TouchDesigner needs ${h.rec("touchdesigner").requirements}.</p>
    <p>The connections are the same set on both sides. MadMapper takes MIDI and OSC in and out, and sends and receives Syphon textures on a Mac and Spout textures on Windows. TouchDesigner reads MIDI with the MIDI In CHOP and sends it with the MIDI Out CHOP, and handles OSC through four operators over UDP. MadMapper sends and receives NDI for passing video between machines, and TouchDesigner has NDI as native operators.</p>`,
        },
        {
            h2: "Where MadMapper wins",
            html: `<p><b>The mapping and the lighting are the point of it.</b> ${h.strength("madmapper", 0)}. ${h.strength("madmapper", 2)}. You are filling in surfaces and cues rather than assembling them from parts.</p>
    <p><b>One machine can drive a room.</b> MadMapper sends video to projectors and displays, one output for each GPU-capable projector, so one machine can drive many projectors.</p>
    <p><b>It can measure the room before you map it.</b> ${h.strength("madmapper", 5)}.</p>
    <p><b>The shader editor is in the box.</b> MadMapper has ${h.strength("madmapper", 3).charAt(0).toLowerCase() + h.strength("madmapper", 3).slice(1)}, so a look can be written rather than picked from a menu.</p>
    <p><b>The music can drive it.</b> MadMapper's ${h.strength("madmapper", 4).charAt(0).toLowerCase() + h.strength("madmapper", 4).slice(1)}, so a track can push the surfaces while you are busy with something else.</p>
    <p><b>The demo is free and has no time limit.</b> It cannot be authorised, so the watermarks and the DMX blackout stay in it, but you can keep learning on it for as long as you like.</p>`,
        },
        {
            h2: "Where TouchDesigner wins",
            html: `<p><b>It can become whatever you build.</b> TouchDesigner is for ${h.rec("touchdesigner").bestFor.charAt(0).toLowerCase() + h.rec("touchdesigner").bestFor.slice(1)} The graph is yours to assemble, so a rig that needs an unusual behaviour needs a new part of the network rather than a new application.</p>
    <p><b>Learning costs nothing.</b> TouchDesigner has ${h.strength("touchdesigner", 0).charAt(0).toLowerCase() + h.strength("touchdesigner", 0).slice(1)}. Its limits are that it rules out paid work and caps output at 1280x1280.</p>
    <p><b>Paid work has its own licence.</b> There are ${h.strength("touchdesigner", 1).charAt(0).toLowerCase() + h.strength("touchdesigner", 1).slice(1)}. Its ${h.strength("touchdesigner", 2).charAt(0).toLowerCase() + h.strength("touchdesigner", 2).slice(1)}, so the software keeps working once the updates have run out.</p>
    <p><b>It reads what is around it.</b> The Video Device In TOP takes video from external cameras, capture cards, capture dongles, IP cameras and decoders, with several devices able to stream at once. OSC runs over UDP through the OSC In CHOP, the OSC Out CHOP, the OSC In DAT and the OSC Out DAT.</p>
    <p><b>Output goes where a show needs it.</b> Video goes to the screen, to SDI and HDMI cards through the Video Device Out TOP, or to TouchPlayer for playback on another machine. The DMX Out CHOP sends channels to DMX, Art-Net, sACN, KiNET and FTDI devices, and a DMX In CHOP receives them.</p>`,
        },
        {
            h2: "Where both fall short",
            html: `<p><b>Neither turns the music into visuals on its own.</b> MadMapper binds bass, mid and treble to any parameter, with beat detection and Ableton Live Link, but you decide what that drives. TouchDesigner reacts to whatever you put into its graph. Neither is a music visualiser that opens and starts moving.</p>
    <p><b>Both free versions are cut back in ways that matter.</b> ${h.limit("madmapper", 0)} ${h.limit("madmapper", 1)} The Space Scanner is cropped to one quarter of its resolution, and export to SVG, PNG and PDF is disabled. TouchDesigner's Non-Commercial licence is free but capped at 1280x1280 output and not for paid work.</p>
    <p><b>Some textures never leave the machine.</b> ${h.limit("touchdesigner", 0)} The Non-Commercial licence also leaves out a subset of Pro and Commercial operators, including the Shared Memory OPs and DirectX OPs, and its keys are single use with 10 keys per account.</p>
    <p><b>MadMapper has edges of its own.</b> ${h.limit("madmapper", 2)} You need two surfaces to crossfade, and ${h.limit("madmapper", 3).charAt(0).toLowerCase() + h.limit("madmapper", 3).slice(1)}</p>
    <p><b>TouchDesigner has edges of its own.</b> ${h.limit("touchdesigner", 1)} On a Mac it needs macOS 13 Ventura or later and a 2020-or-later machine, with a discrete AMD GPU required on Intel-based Macs.</p>
    <p><b>Both are Mac and Windows only.</b> Each one lists macOS and Windows and nothing else, so there is no Linux build to install.</p>`,
        },
        {
            h2: "What it costs",
            html: `<p>MadMapper's demo is free and cannot be authorised. A temporary licence is ${h.price("madmapper", "Temporary licence")} and expires at the end of its term, and a perpetual licence is ${h.price("madmapper", "Perpetual licence")}, which covers the current 6.xx version and includes one extra seat for a spare computer. MadMapper's shop calls those from prices: they exclude tax and rise with the number of seats. Educational users get 30% off, and extensions such as MadLaser and MadProjectorControl need a licence of their own.</p>
    <p>TouchDesigner's Non-Commercial licence is free for personal use and learning. Educational is ${h.price("touchdesigner", "Educational")}, Commercial is ${h.price("touchdesigner", "Commercial")} for paid projects, and Pro is ${h.price("touchdesigner", "Pro")}, which adds six hours of Pro Support. Derivative lists those as from prices, and the licences are perpetual with one year of updates included.</p>
    <p>MadMapper prices itself in euros and Derivative in US dollars, so both are left as listed rather than converted. Check each shop on the day you buy.</p>`,
        },
    ],
    faq: [
        {
            q: "Do MadMapper and TouchDesigner both run on a Mac?",
            a: `Yes. MadMapper needs ${h.rec("madmapper").requirements}. TouchDesigner needs ${h.rec("touchdesigner").requirements}.`,
        },
        {
            q: "Can I use TouchDesigner for paid work without paying?",
            a: `No. The Non-Commercial licence rules out paid work and caps output at 1280x1280. A paid project needs the Commercial licence at ${h.cost("touchdesigner", "Commercial")}, or Pro at ${h.cost("touchdesigner", "Pro")}.`,
        },
        {
            q: "What does MadMapper's free demo stop me from doing?",
            a: `It watermarks input, output and output preview, and loading and saving a project is disabled. ${h.limit("madmapper", 1)} The Space Scanner is cropped to one quarter of its resolution, and export to SVG, PNG and PDF is disabled.`,
        },
        {
            q: "Can TouchDesigner send a texture to another computer?",
            a: `No. ${h.limit("touchdesigner", 0)} NDI is built in as native operators, the NDI In TOP, NDI Out TOP and NDI DAT, with no documented limit on frame rate or resolution beyond what the hardware can handle.`,
        },
    ],
    related: [
        { href: "/comparison", text: "All comparisons" },
        { href: "/blog/best-music-visualizer-for-mac-2026", text: "The best music visualizer for Mac in 2026" },
    ],
});
