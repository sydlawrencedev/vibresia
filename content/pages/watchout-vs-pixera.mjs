// /comparison/watchout-vs-pixera
// Target query: "watchout vs pixera" (content/url-plan.csv).
// A referee page (2b): which of the two is right for the reader. Facts come
// from the records through `h`. WATCHOUT is priced in euros and Pixera
// publishes no prices at all, so nothing here is converted.
export default (h) => ({
    slug: "watchout-vs-pixera", template: "2b",
    publishedISO: "2026-11-03", updatedISO: "2026-11-03",
    title: "WATCHOUT vs Pixera (2026): Which Media Server?",
    description: "WATCHOUT or Pixera for projection mapping, LED walls or a live event? Published prices, free versions, connections and who each one suits.",
    eyebrow: "Media servers compared",
    breadcrumb: "WATCHOUT vs Pixera",
    h1: "WATCHOUT vs Pixera: two media servers for the same show?",
    answer: `If you are specifying a show for projection mapping, LED walls or a live event and you need a price you can put in a budget, pick ${h.link("watchout")}, whose media server licence costs ${h.cost("watchout", "WATCHOUT 7 licence")}. If you would rather have a system whose price arrives as a quotation, pick ${h.link("pixera")}, which publishes no prices at all and quotes every licence on request. Both are Windows-only media servers for the same kind of production, both take MIDI, OSC, DMX and NDI, and what separates them is money you can see and how much the free version lets you do.`,
    cta: "Try Vibresia free",
    connections: true,
    rows: [
        { label: "What it is", value: (h, s) => h.rec(s).tagline },
        { label: "Price", value: (h, s) => s === "watchout"
            ? `A WATCHOUT 7 licence is ${h.cost("watchout", "WATCHOUT 7 licence")}, and the Producer is ${h.price("watchout", "WATCHOUT Producer").toLowerCase()}`
            : `The creator licence is ${h.price("pixera", "PIXERA creator").toLowerCase()}, and the Director, Player and Server licences are quoted on request` },
        { label: "Runs on", value: (h, s) => h.platforms(s) },
        { label: "Requirements", value: (h, s) => h.rec(s).requirements },
        { label: "Free version", value: (h, s) => s === "watchout" ? h.limit("watchout", 0) : h.rec("pixera").trial.limits },
        { label: "Known for", value: (h, s) => h.strength(s, 0) },
        { label: "Best for", value: (h, s) => h.rec(s).bestFor },
    ],
    verdict: {
        pickA: `you are specifying a show across many synchronised displays and you need a number today rather than a quotation. A WATCHOUT 7 licence is ${h.cost("watchout", "WATCHOUT 7 licence")} and covers one media server, each licensed node drives up to 8x DCI 4K of output, and the Producer is free, so a show can be built before anyone buys anything.`,
        pickB: `you are mapping content onto LED pixels, running a Director with player clients across several machines, or buying the server hardware as well as the software. Pixera turns the colour information of a screen into DMX values for LED pixels, tubes and strips, the PIXERA creator licence is the full software with watermarked outputs, and every licence except that one needs a USB dongle as its licence key.`,
    },
    sections: [
        {
            h2: "Why people compare them",
            html: `<p>They sit in the same part of a rig, driving projectors, LED walls and screens in a venue, so the people specifying a production weigh one against the other. ${h.rec("watchout").tagline} ${h.rec("pixera").tagline}</p>
    <p>Both are Windows software, and both expect a dedicated machine in a rack rather than a laptop on a desk. WATCHOUT wants a Vulkan 1.3 GPU for the Producer and OpenGL 4.4 or DirectX 11 on a media server, and Pixera expects an Nvidia GPU with at least 4GB of VRAM and 8GB of RAM.</p>
    <p>What separates them is where the show is built. WATCHOUT composes and plays media from one set of timelines across a network of media servers, and it takes its cueing from outside the room. Pixera is built around a 64-bit render engine and a show control framework, with Art-Net, sACN and KiNET pixel mapping built in and a Director driving player clients across several machines.</p>
    <p>The licensing decides much of the rest. One of these two publishers prints a price and the other asks you to contact a distributor, so one of these two conversations has a number in it and the other starts with a phone call.</p>`,
        },
        {
            h2: "Where WATCHOUT wins",
            html: `<p><b>It has a price you can read before you call anyone.</b> A WATCHOUT 7 licence is ${h.cost("watchout", "WATCHOUT 7 licence")} and covers one media server, and additional media servers are not included. Dataton publishes a single recommended retail price rather than a tier list.</p>
    <p><b>It plays one set of timelines across many displays.</b> ${h.strength("watchout", 0)}.</p>
    <p><b>It scales by adding machines, and the scale is a number you can check.</b> ${h.strength("watchout", 1)}. ${h.limit("watchout", 2)}</p>
    <p><b>It plays the formats an installed show asks for.</b> ${h.strength("watchout", 2)}. ${h.limit("watchout", 3)}</p>
    <p><b>It takes live control from the room.</b> ${h.strength("watchout", 3)}. ${h.io("watchout", "osc").text} ${h.io("watchout", "midi").text}</p>
    <p><b>Lighting is part of the package rather than an upgrade.</b> ${h.io("watchout", "dmx").text}</p>
    <p><b>It sends a signal out and takes one in.</b> ${h.io("watchout", "video").text} ${h.strength("watchout", 4)}.</p>`,
        },
        {
            h2: "Where Pixera wins",
            html: `<p><b>It turns a picture into DMX values for LED.</b> ${h.strength("pixera", 2)} ${h.io("pixera", "dmx").text}</p>
    <p><b>Its render engine handles the very big files.</b> ${h.strength("pixera", 0)} ${h.io("pixera", "video").text}</p>
    <p><b>The show control framework is built in.</b> ${h.strength("pixera", 1)} ${h.limit("pixera", 2)}</p>
    <p><b>It runs across several machines as a Director and its clients.</b> ${h.strength("pixera", 4)}</p>
    <p><b>Live inputs arrive over NDI or a capture card.</b> ${h.strength("pixera", 3)} ${h.io("pixera", "ndi").text}</p>
    <p><b>The free licence is the whole software.</b> The PIXERA creator licence carries the full software with four watermarked playback outputs, and projects can be built and saved without limitation. It cannot be used during a live production, and it cannot connect to a Director and Client setup.</p>`,
        },
        {
            h2: "Where both fall short",
            html: `<p><b>Neither one runs on a Mac.</b> ${h.io("watchout", "syphon").text} ${h.io("pixera", "syphon").note}</p>
    <p><b>Spout is a one-sided story.</b> ${h.io("watchout", "spout").text} ${h.io("pixera", "spout").note}</p>
    <p><b>Both take something away in the free version.</b> ${h.limit("watchout", 0)} ${h.rec("pixera").trial.limits}</p>
    <p><b>Both put a licence between you and the output.</b> WATCHOUT needs licence keys on the production computer and on every media server it connects. ${h.limit("pixera", 1)}</p>
    <p><b>Both have a ceiling on one machine.</b> ${h.limit("pixera", 3)} ${h.limit("watchout", 2)}</p>
    <p><b>Both want the show designed before the night.</b> Neither one generates visuals from the music it is playing. Both take media you prepared and cues you built, and both expect the content to be ready before anyone walks in.</p>`,
        },
        {
            h2: "What it costs",
            html: `<p>The WATCHOUT Producer is ${h.price("watchout", "WATCHOUT Producer").toLowerCase()} to download and install without a licence key, and it cannot drive an output device until you add one. A WATCHOUT 7 licence is ${h.price("watchout", "WATCHOUT 7 licence")}, one licence per media server, with additional media servers not included. Dataton sells it through a local Dataton partner or a price request form, and the same FAQ lists €1,950 per licence for an electronic upgrade from version 6, with educational licences discounted, restricted to teaching institutions and requiring annual renewal.</p>
    <p>Pixera publishes no prices. Its own documentation says that for licence prices you should contact your local distributor or the PIXERA sales team, so the Director, Player and Server licences, the PIXERA control GATE, CORE and ENTERPRISE licences and the server hardware are all quoted on request. ${h.limit("pixera", 1)} The creator licence itself is free.</p>
    <p>One practical note if you go looking for a price online. The live media software lives at pixera.one and is run by AV Stumpfl, while pixera.com belongs to Pixera Corporation, a maker of microscope cameras.</p>`,
        },
    ],
    faq: [
        {
            q: "Which is cheaper, WATCHOUT or Pixera?",
            a: `You cannot compare them on paper, because Pixera publishes no prices at all. WATCHOUT publishes a single recommended retail price, and a WATCHOUT 7 licence is ${h.cost("watchout", "WATCHOUT 7 licence")} per media server, one licence each, with additional media servers not included. The Pixera creator licence is free, but every other licence is quoted on request.`,
        },
        {
            q: "Can I try either one for free?",
            a: `Yes, with a catch in each case. ${h.rec("watchout").trial.limits} ${h.rec("pixera").trial.limits}`,
        },
        {
            q: "Do both of them talk to a lighting desk?",
            a: `Both take MIDI, OSC, DMX and NDI, and the two use DMX for different jobs. ${h.io("watchout", "dmx").text} ${h.io("pixera", "dmx").text}`,
        },
        {
            q: "Does either of them run on a Mac?",
            a: `No. ${h.io("watchout", "syphon").text} WATCHOUT needs ${h.rec("watchout").requirements}. Pixera needs ${h.rec("pixera").requirements}.`,
        },
    ],
    related: [
        { href: "/comparison", text: "All comparisons" },
        { href: "/blog/best-music-visualizer-for-mac-2026", text: "The best music visualizer for Mac in 2026" },
    ],
});
