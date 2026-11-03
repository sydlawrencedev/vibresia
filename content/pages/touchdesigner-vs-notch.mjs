// /comparison/touchdesigner-vs-notch
// Target query: "touchdesigner vs notch" (content/url-plan.csv).
// A referee page (2b): which of the two is right for the reader. Facts come
// from the records through `h`. Both are priced in dollars, so there is
// nothing to convert. The pair did not opt in to a third option, so this
// page never mentions our own app.
//
// The RFX tier is the one Notch sells with a dongle, so its exclusion is
// quoted rather than paraphrased.
const rfx = (h) => h.rec("notch").pricing.tiers.find((t) => t.name === "RFX, annual");

export default (h) => ({
    slug: "touchdesigner-vs-notch", template: "2b",
    publishedISO: "2026-11-03", updatedISO: "2026-11-03",
    title: "TouchDesigner vs Notch (2026): Which for Live Visuals?",
    description: "TouchDesigner or Notch for real-time 3D? One runs on Mac and Windows, the other is Windows only. Prices, licences, connections and who each one suits.",
    eyebrow: "Creative tools compared",
    breadcrumb: "TouchDesigner vs Notch",
    h1: "TouchDesigner vs Notch: one runs on a Mac, the other cannot",
    answer: `If you are on a Mac, pick ${h.link("touchdesigner")}, because Notch cannot run on macOS at all. If you are on Windows and want real-time 3D made for concerts, live events and broadcast, pick ${h.link("notch")}, whose VFX licence is ${h.cost("notch", "VFX, annual")} a year. Both drive a graph of nodes while something else is happening. The licences part company, because TouchDesigner has a free Non-Commercial licence and the free option from Notch is a 60-day trial.`,
    cta: "Try Vibresia free",
    connections: true,
    rows: [
        { label: "What it is", value: (h, s) => h.rec(s).tagline },
        { label: "Price", value: (h, s) => h.priceCell(s) },
        { label: "Runs on", value: (h, s) => h.platforms(s) },
        { label: "Requirements", value: (h, s) => h.rec(s).requirements },
        { label: "Free version", value: (h, s) => h.rec(s).trial ? h.rec(s).trial.limits : "No free version" },
        { label: "Known for", value: (h, s) => h.strength(s, 0) },
        { label: "Best for", value: (h, s) => h.rec(s).bestFor },
    ],
    verdict: {
        pickA: `you are on a Mac, or you want to learn on a node environment without paying for it, or you want MIDI, OSC, DMX, Syphon, Spout and NDI in the box with nothing to install. The Non-Commercial licence is ${h.cost("touchdesigner", "Non-Commercial")} and caps output at 1280x1280, and Commercial is ${h.cost("touchdesigner", "Commercial")}, one time.`,
        pickB: `you are on Windows and want real-time 3D made for concerts and live events, or you need the show to travel as a self-contained block or executable that a media server can run. The Indie licence is ${h.cost("notch", "Indie, annual")} a year for hobbyists and non-commercial work, and the VFX licence is ${h.cost("notch", "VFX, annual")} a year.`,
    },
    sections: [
        {
            h2: "Why people compare them",
            html: `<p>They get compared because they are being asked to do the same job: real-time 3D that keeps running while a show or an installation is going on. ${h.rec("notch").tagline} TouchDesigner is Derivative's node-based visual programming environment for real-time interactive media.</p>
    <p>What each one is built to deliver is different. Notch is for professional real-time 3D motion design at concerts and live events, for interactive installations, for broadcast and for delivery to media servers. TouchDesigner is for artists and developers building interactive installations, live visuals and generative work.</p>
    <p>One fact settles most of these comparisons before any feature list does. Notch is listed for ${h.platforms("notch")} only. TouchDesigner runs on ${h.platforms("touchdesigner")}.</p>`,
        },
        {
            h2: "Where TouchDesigner wins",
            html: `<p><b>It runs on the computer you already have.</b> TouchDesigner runs on ${h.platforms("touchdesigner")}, and Notch is listed for ${h.platforms("notch")} only, so on a Mac TouchDesigner is the one of the two that runs on your own hardware.</p>
    <p><b>The connections are in the box.</b> ${h.io("touchdesigner", "midi").text} ${h.io("touchdesigner", "osc").text} ${h.io("touchdesigner", "ndi").text}</p>
    <p><b>Shared textures come with it.</b> ${h.io("touchdesigner", "syphon").text} ${h.io("touchdesigner", "spout").text}</p>
    <p><b>It sends lighting data out of the box.</b> ${h.io("touchdesigner", "dmx").text}</p>
    <p><b>You can learn on it without paying.</b> ${h.strength("touchdesigner", 0)} ${h.rec("touchdesigner").trial.limits}</p>
    <p><b>The picture can leave the machine.</b> ${h.io("touchdesigner", "video").text}</p>`,
        },
        {
            h2: "Where Notch wins",
            html: `<p><b>The 3D is the product, not a by-product.</b> ${h.strength("notch", 0)}</p>
    <p><b>It ships as something a media server can run.</b> ${h.strength("notch", 1)} That export sits in the RFX licence, which is ${h.cost("notch", "RFX, annual")} a year, and the VFX licence excludes Notch Blocks and standalone EXE export.</p>
    <p><b>It composites video and renders it out.</b> ${h.strength("notch", 3)}</p>
    <p><b>It takes live control from the room.</b> ${h.strength("notch", 2)}</p>
    <p><b>Paid work is allowed once you buy the right licence.</b> The VFX licence adds support and no commercial revenue limit, and it costs ${h.cost("notch", "VFX, annual")} a year.</p>
    <p><b>Video is a first-class output.</b> ${h.io("notch", "video").text}</p>`,
        },
        {
            h2: "Where both fall short",
            html: `<p><b>Neither one plays by itself.</b> Both are tools you build in, and the result is only as good as the work you put into it.</p>
    <p><b>Both take something back in the free version.</b> ${h.rec("touchdesigner").trial.limits} ${h.limit("notch", 0)} ${h.limit("notch", 2)}</p>
    <p><b>Each licence leaves a gap you have to plan for.</b> ${h.limit("touchdesigner", 2)} Notch states one exclusion on the RFX licence: ${rfx(h).excludes[0]}.</p>
    <p><b>A Notch trial project cannot be carried forward.</b> ${h.limit("notch", 3)}</p>
    <p><b>Both want a recent machine.</b> TouchDesigner needs ${h.rec("touchdesigner").requirements}. Notch needs ${h.rec("notch").requirements}.</p>
    <p><b>Both cap what can leave the tool.</b> ${h.limit("touchdesigner", 0)} ${h.limit("notch", 1)}</p>`,
        },
        {
            h2: "What it costs",
            html: `<p>TouchDesigner sells licences you keep. The Non-Commercial licence is ${h.price("touchdesigner", "Non-Commercial")} for personal use and learning, capped at 1280x1280 output. Educational is ${h.price("touchdesigner", "Educational")} and rules out paid work, Commercial is ${h.price("touchdesigner", "Commercial")} for paid projects, and Pro is ${h.price("touchdesigner", "Pro")}, which adds six hours of Pro Support. Derivative lists those as from prices, and a licence includes a year of updates.</p>
    <p>${h.rec("notch").pricing.note.split(". ")[0]}. The Indie licence is ${h.price("notch", "Indie, annual")}, and it is the tier for hobbyists and non-commercial work. The VFX licence is ${h.price("notch", "VFX, annual")}, or ${h.price("notch", "VFX, month to month")}, and it adds support and no commercial revenue limit. The RFX licence is ${h.price("notch", "RFX, annual")}, and it is the tier that exports Notch Blocks, Standalone and VR executables for media servers. A Render Node is ${h.price("notch", "Render Node, annual")}, or ${h.price("notch", "Render Node, month to month")}.</p>
    <p>So the two price lists do not meet. The route to paid work in TouchDesigner is a one-off ${h.cost("touchdesigner", "Commercial")}. The route to paid work in Notch is ${h.cost("notch", "VFX, annual")} every year, or ${h.cost("notch", "RFX, annual")} every year if you need the media server delivery.</p>`,
        },
    ],
    faq: [
        {
            q: "Does Notch run on a Mac?",
            a: `No. Notch is listed for ${h.platforms("notch")} only, and it cannot run on macOS at all. Its stated requirements are ${h.rec("notch").requirements}. TouchDesigner runs on ${h.platforms("touchdesigner")}, so on a Mac TouchDesigner is the one of the two that runs on your own hardware.`,
        },
        {
            q: "Can I use Notch for paid work?",
            a: `Only on the VFX licence or above. ${h.limit("notch", 0)} The VFX licence adds support and no commercial revenue limit, and it is ${h.cost("notch", "VFX, annual")} a year.`,
        },
        {
            q: "Which one is cheaper?",
            a: `TouchDesigner has a free Non-Commercial licence for learning, and a Commercial licence is ${h.cost("touchdesigner", "Commercial")} once. Notch starts at ${h.cost("notch", "Indie, annual")} a year for the Indie licence, and the licence you would need for paid work is ${h.cost("notch", "VFX, annual")} a year.`,
        },
        {
            q: "Do they both handle MIDI, OSC and NDI?",
            a: "TouchDesigner has MIDI, OSC, Syphon, Spout, NDI and DMX built in, with no add-on to install. Notch documents MIDI, OSC, NDI, Spout and DMX over ArtNet, but its Syphon status is unknown, and the Indie licence excludes NDI and Spout.",
        },
    ],
    related: [
        { href: "/comparison", text: "All comparisons" },
        { href: "/blog/best-music-visualizer-for-mac-2026", text: "The best music visualizer for Mac in 2026" },
    ],
});
