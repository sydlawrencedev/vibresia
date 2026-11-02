// /comparison/madmapper-vs-millumin
// Target query: "madmapper vs millumin" (content/url-plan.csv).
// A referee page (2b): which of the two is right for the reader. Facts come
// from the records through `h`. Both are priced in euros, so they are never
// converted.
export default (h) => ({
    slug: "madmapper-vs-millumin", template: "2b",
    publishedISO: "2026-11-02", updatedISO: "2026-11-02",
    title: "MadMapper vs Millumin (2026): Which Should You Buy?",
    description: "MadMapper or Millumin for mapping video and driving lights? One runs on Mac and Windows, the other on macOS only. Prices, connections and who each one suits.",
    eyebrow: "Mapping tools compared",
    breadcrumb: "MadMapper vs Millumin",
    h1: "MadMapper vs Millumin: a live mapping tool or a timeline of cues?",
    answer: `Pick ${h.link("madmapper")} if you are mapping video onto real surfaces and driving fixtures, because it runs on macOS and Windows and its demo is free for as long as you want it. Pick ${h.link("millumin")} if you are programming a show in advance and triggering it from controllers, because in Millumin a show is written as columns of cues that launch in order. MadMapper is the one you work in live, with parameters driven from MIDI or OSC controllers. Millumin is the one you build in advance, and it is macOS only. The permanent licences cost the same: ${h.cost("madmapper", "Perpetual licence")} for MadMapper against ${h.cost("millumin", "Lifetime licence, one seat")} for Millumin.`,
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
        pickA: `you are mapping video onto real surfaces, running LED strips or DMX fixtures, or writing your own GLSL shaders, and you want the same rig to work on a Mac or a Windows machine. It is listed for ${h.platforms("madmapper")} and its demo is free indefinitely with a watermark over the output.`,
        pickB: `you are running a show that has to be programmed in advance, you need a timeline of cues to hand to a technician, or you are sending video to several displays at once. It is ${h.platforms("millumin")} only, and the lifetime licence for one seat is ${h.cost("millumin", "Lifetime licence, one seat")}.`,
    },
    sections: [
        {
            h2: "Why people compare them",
            html: `<p>These are the two tools people reach for when the picture has to land on something other than a flat screen: a building, a stage, a truss of fixtures. Both warp video onto a real surface, both put lighting control next to the video, and both are paid, so people building one rig compare them before they commit.</p>
    <p>They are not the same kind of tool. ${h.name("madmapper")} is video and LED mapping software for macOS and Windows, with mesh warping, DMX and Art-Net lighting control and a live GLSL shader editor. ${h.name("millumin")} is software for creating and playing audiovisual shows on stage, with media playback, projection mapping and lighting control, and it runs on macOS only.</p>
    <p>The difference shows up in how a night is organised. In Millumin a show is written as columns of cues that launch in order, and the file can be handed to whoever is on the desk. In MadMapper you build surfaces and cues and drive parameters from controllers while the room plays. If the show is a programmed sequence, the timeline is the reason to pick Millumin. If it is a performance, the live controls are the reason to pick MadMapper.</p>`,
        },
        {
            h2: "Where MadMapper wins",
            html: `<p><b>It runs on a Mac and on Windows.</b> MadMapper is listed for ${h.platforms("madmapper")}, and it needs ${h.rec("madmapper").requirements}. ${h.name("millumin")} is macOS only, and its maker says a Windows version is a very large project that is not a priority, so a Windows show has to use MilluNode, the separate player that carries video and nothing else.</p>
    <p><b>The demo never expires.</b> ${h.rec("madmapper").trial.limits}</p>
    <p><b>You can write your own look.</b> MadMapper has ${h.strength("madmapper", 3).replace(/^A /, "a ")}.</p>
    <p><b>The music can drive it.</b> ${h.strength("madmapper", 4)}.</p>
    <p><b>It can be calibrated in 3D.</b> ${h.strength("madmapper", 5)}.</p>
    <p><b>It shares video with Windows software.</b> ${h.io("madmapper", "spout").text} On a Mac the same job is done over Syphon.</p>`,
        },
        {
            h2: "Where Millumin wins",
            html: `<p><b>It is a show sequencer.</b> Millumin has ${h.strength("millumin", 2).replace(/^A sequencer/, "a sequencer")}. MadMapper's lighting tools work differently: ${h.strength("madmapper", 2)}.</p>
    <p><b>It drives the lights from the same place as the pictures.</b> ${h.io("millumin", "dmx").text}</p>
    <p><b>It takes more kinds of input.</b> It takes ${h.strength("millumin", 3).replace(/^Live inputs/, "live inputs")}.</p>
    <p><b>It sends video out in more ways.</b> ${h.io("millumin", "video").text}</p>
    <p><b>Its mapping is applied at every level.</b> It has ${h.strength("millumin", 0).replace(/^Projection/, "a projection")}. It also handles ${h.strength("millumin", 1).replace(/^Multiple/, "multiple")}.</p>
    <p><b>The trial is a real trial.</b> ${h.rec("millumin").trial.limits}</p>`,
        },
        {
            h2: "Where both fall short",
            html: `<p><b>Both need the show made before the show.</b> Whichever you pick, the visuals are only as good as the material you prepared and the cues you built. Neither turns a folder of files into a performance by itself.</p>
    <p><b>Both take something away for free.</b> ${h.limit("madmapper", 1)} In Millumin, ${h.limit("millumin", 0).charAt(0).toLowerCase() + h.limit("millumin", 0).slice(1)}</p>
    <p><b>Each has an edge worth knowing.</b> In MadMapper, ${h.limit("madmapper", 3).replace(/^The software/, "the software")} ${h.limit("madmapper", 2)} In Millumin, ${h.limit("millumin", 2).replace(/^The MilluNode/, "the MilluNode")} ${h.limit("millumin", 3)}</p>
    <p><b>Neither is a music visualiser.</b> Both are general tools for video and lighting, and both expect you to bring the content and decide how it reacts. If what you want is visuals that react to what the Mac is playing, with nothing to prepare, that is a different job than either of these does.</p>`,
        },
        {
            h2: "What it costs",
            html: `<p>MadMapper's perpetual licence is a one-time purchase of ${h.cost("madmapper", "Perpetual licence")}. It covers the current 6.xx version and it includes one extra seat for a spare computer. A temporary licence is ${h.price("madmapper", "Temporary licence")}. The <a href="${h.sourceOf("madmapper", "profile")}">MadMapper software page</a> calls those from prices: they exclude tax and rise with the number of seats, and an educational discount of 30% applies.</p>
    <p>Millumin's lifetime licence for one seat is a one-time purchase of ${h.cost("millumin", "Lifetime licence, one seat")}, and an upgrade to V5 or an extra seat is ${h.cost("millumin", "Upgrade to V5, or an extra seat")}. Rental licences are also sold: 29 euros for 7 days, 69 euros for 30 days and 199 euros for a year, and any version of Millumin can be used with them. The <a href="${h.sourceOf("millumin", "profile")}">Millumin site</a> shows its figures in euros, per computer and before tax.</p>
    <p>So the permanent licences land in the same place, ${h.cost("madmapper", "Perpetual licence")} for MadMapper and ${h.cost("millumin", "Lifetime licence, one seat")} for Millumin, and what differs is what each one covers. MadMapper's perpetual licence covers the current 6.xx version and carries an upgrade fee when you move to a new major version. Millumin's lifetime licence covers V5 and the versions before it, with one computer activated at a time. Both are priced in euros, so the rate on the day you buy is yours to check.</p>`,
        },
    ],
    faq: [
        {
            q: "Which is better for projection mapping?",
            a: `Both do it. MadMapper has bezier masking and mesh warping to fit content to real surfaces, and its Space Scanner uses structured light with a Canon DSLR to capture the projector's view for 3D calibration. Millumin's toolkit has perspective transform, mesh warping and masks, applied from layers up to outputs. What differs is what sits around the mapping: MadMapper gives you a GLSL shader editor with live coding and a material library, Millumin gives you a sequencer and timeline where the show is written as columns of cues.`,
        },
        {
            q: "Do MadMapper and Millumin cost the same?",
            a: `The permanent licences are the same figure: ${h.cost("madmapper", "Perpetual licence")} for MadMapper's perpetual licence and ${h.cost("millumin", "Lifetime licence, one seat")} for Millumin's lifetime licence on one computer. MadMapper also sells a temporary licence at ${h.cost("madmapper", "Temporary licence")} a month, and Millumin sells rentals at 29 euros for 7 days, 69 euros for 30 days and 199 euros for a year. Both shops call their figures from prices that exclude tax and rise with the number of seats.`,
        },
        {
            q: "Does Millumin run on Windows?",
            a: `No. ${h.limit("millumin", 1)} MadMapper is listed for ${h.platforms("madmapper")}, so it is the one of the two that works on a Windows machine.`,
        },
        {
            q: "Can I try either one for free?",
            a: `Yes. ${h.rec("madmapper").trial.limits} ${h.rec("millumin").trial.limits}`,
        },
    ],
    related: [
        { href: "/comparison", text: "All comparisons" },
        { href: "/blog/best-music-visualizer-for-mac-2026", text: "The best music visualizer for Mac in 2026" },
    ],
});
