// /comparison/vmix-vs-resolume
// Target query: "vmix vs resolume" (content/url-plan.csv).
// A referee page (2b): which of the two is right for the reader. Facts come
// from the records through `h`. vMix is priced in dollars and Resolume in
// euros, so the two price lists are never converted into each other.
export default (h) => {
    // The records write a fact without a full stop at the end of it. The
    // prose does, so a quoted sentence joins the next one cleanly.
    const stops = (s) => `${s}`.replace(/\s+$/, "").replace(/[.!?]$/, "") + ".";
    return {
        slug: "vmix-vs-resolume", template: "2b",
        publishedISO: "2026-11-02", updatedISO: "2026-11-02",
        title: "vMix vs Resolume (2026): Switcher or VJ Software?",
        description: "vMix or Resolume for live video? One is a Windows production switcher, one is a VJ application on Mac and Windows. Prices, connections, who each suits.",
        eyebrow: "Live video compared",
        breadcrumb: "vMix vs Resolume",
        h1: "vMix vs Resolume: a production switcher or a VJ application?",
        answer: `If you are mixing live cameras into a feed you then record and stream, pick ${h.link("vmix")}: it is a production switcher for Windows, and it is the one of the two that records and streams a show. If you are performing video to a room from decks of clips and effects, pick ${h.link("resolume")}: it is a VJ application, and it runs on macOS as well as Windows. The vMix vs Resolume question turns first on one fact: there is no macOS build of vMix.`,
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
            pickA: `you are switching between cameras, you need that production recorded and streamed, and you have a Windows machine to run it on. Basic HD is ${h.cost("vmix", "Basic HD, one-off licence")} once, and the full edition is ${h.cost("vmix", "vMix Max, monthly subscription")} a month on the Max subscription.`,
            pickB: `you are performing video to people in a room, from decks of clips and effects, and you want software that runs on your own Mac. Avenue is ${h.cost("resolume", "Avenue")} once and Arena is ${h.cost("resolume", "Arena")}, and Resolume runs on ${h.platforms("resolume")}.`,
        },
        sections: [
            {
                h2: "Why people compare them",
                html: `<p>They come up together because both take video sources and put them on a screen live, and both cost money. But they are built for different ends of the same evening. <a href="${h.sourceOf("vmix", "profile")}">vMix</a> is a live video production and streaming switcher for Windows that mixes cameras, network sources and media, then records and streams the result. <a href="${h.sourceOf("resolume", "profile")}">Resolume</a> is VJ and media-server software, with a visual programming tool in Wire, for macOS and Windows.</p>
    <p>One is a control room you sit behind: you cut between cameras, add titles and overlays, record the programme and send it out to a streaming service and to other machines. The other is the performance itself: you trigger clips and effects from a show, in front of an audience. A broadcast needs the first. A club night needs the second. A venue that streams its own show needs both jobs done, and that is where people meet this pair.</p>`,
            },
            {
                h2: "Where vMix wins",
                html: `<p><b>It mixes sources and sends the result out.</b> ${h.io("vmix", "video").text}</p>
    <p><b>It has the broadcast furniture.</b> ${stops(h.strength("vmix", 2).replace(/^Handles/, "vMix handles"))} ${stops(h.strength("vmix", 4).replace(/^Can/, "It can"))} ${h.io("vmix", "midi").text}</p>
    <p><b>It sends its programme to other machines.</b> ${stops(h.strength("vmix", 1).replace(/^Sends/, "vMix sends"))}</p>
    <p><b>Its trial is worth using.</b> ${h.rec("vmix").trial.limits}</p>`,
            },
            {
                h2: "Where Resolume wins",
                html: `<p><b>It runs on a Mac.</b> Resolume runs on ${h.platforms("resolume")}. It needs ${h.rec("resolume").requirements}. By contrast, ${h.limit("vmix", 1).charAt(0).toLowerCase() + h.limit("vmix", 1).slice(1)}</p>
    <p><b>It is a performance tool.</b> ${stops(h.name("resolume") + " is " + h.strength("resolume", 0).replace(/^An/, "an"))} ${stops(h.strength("resolume", 1).replace(/^Wire/, "Wire is"))}</p>
    <p><b>It takes control from the desk.</b> ${h.io("resolume", "midi").text} ${h.io("resolume", "osc").text}</p>
    <p><b>It has the video connections.</b> ${h.io("resolume", "syphon").text} ${h.io("resolume", "spout").text} ${h.io("resolume", "ndi").text} ${h.io("resolume", "dmx").text}</p>
    <p><b>Its licence keeps working, and its free version lasts.</b> ${stops(h.strength("resolume", 2).replace(/^Licences/, "Resolume licences"))} ${h.rec("resolume").trial.limits.replace(/^Free to use indefinitely,/, "Resolume is free to use indefinitely,")}</p>`,
            },
            {
                h2: "Where both fall short",
                html: `<p><b>Neither is a music visualiser.</b> Both are general tools for video, and both expect you to bring the content. If what you want is visuals that react to what the Mac is playing, with nothing to prepare, that is a different job than either of these does.</p>
    <p><b>Both need a show made before the show.</b> Whichever one you pick, the output is only as good as the sources you prepared and the cues you built.</p>
    <p><b>Both cap what one machine can drive.</b> ${h.limit("vmix", 2)} ${h.limit("resolume", 1)}</p>
    <p><b>The cheaper editions leave out the work.</b> ${h.limit("vmix", 0)} ${h.limit("resolume", 0)}</p>
    <p><b>Both have a limit you meet on the night.</b> ${h.limit("vmix", 3)} ${h.limit("resolume", 3)}</p>`,
            },
            {
                h2: "What it costs",
                html: `<p>vMix has one-off licences at ${h.cost("vmix", "Basic HD, one-off licence")} for Basic HD, ${h.cost("vmix", "HD, one-off licence")} for HD, ${h.cost("vmix", "4K, one-off licence")} for 4K and ${h.cost("vmix", "Pro, one-off licence")} for Pro, each a one-time purchase with twelve months of free version updates included. The full edition is also sold as a subscription at ${h.price("vmix", "vMix Max, monthly subscription")}, which is equivalent to the Pro edition in all its features and adds 1000 total inputs, a maximum resolution of 4096 by 2160 and streaming to five destinations at once. Free version updates with Max last only for as long as the subscription is paid. ${h.rec("vmix").pricing.note.split(". ").pop()}</p>
    <p>Resolume Avenue is ${h.cost("resolume", "Avenue")}, Arena is ${h.cost("resolume", "Arena")} and Wire is ${h.cost("resolume", "Wire")}, each a one-time purchase with 12 months of updates included, and the licence keeps working after that.</p>
    <p>So the entry points are ${h.cost("vmix", "Basic HD, one-off licence")} against ${h.cost("resolume", "Avenue")}, in two different currencies, and the shape of the two lists differs as much as the numbers do. vMix gives you the switcher for a single payment or for a monthly fee that stops when you stop paying. Resolume charges once for a licence that keeps working, and the features a show tends to need, such as DMX control and capture card output, are Arena rather than Avenue.</p>`,
            },
        ],
        faq: [
            {
                q: "Does vMix run on a Mac?",
                a: `No. ${h.limit("vmix", 1)} Resolume runs on ${h.platforms("resolume")}, so it is the one of the two that runs on your own hardware.`,
            },
            {
                q: "Which is cheaper, vMix or Resolume?",
                a: `It depends on the edition and on the job. vMix starts at ${h.cost("vmix", "Basic HD, one-off licence")} once for Basic HD, which is limited to four total inputs, three of them cameras or NDI. Resolume starts at ${h.cost("resolume", "Avenue")} once for Avenue, and Arena is ${h.cost("resolume", "Arena")}. vMix charges in US dollars and Resolume's prices are in euros, so the rate on the day you buy is yours to check.`,
            },
            {
                q: "Can I try either one for free?",
                a: `Yes, both. ${h.rec("vmix").trial.limits} ${h.rec("resolume").trial.limits.replace(/^Free to use indefinitely,/, "Resolume is free to use indefinitely,")}`,
            },
            {
                q: "Which one is for a live show in front of people?",
                a: `Resolume, if the show is performed in a room: Avenue and Arena are made for playing decks of media and effects to screens and projectors. vMix is for a multi-camera production that has to be switched, recorded and streamed, and it needs a Windows machine. Where a venue needs both, they can be chained: vMix sends its programme out over NDI, and Resolume takes NDI input.`,
            },
        ],
        related: [
            { href: "/comparison", text: "All comparisons" },
            { href: "/blog/best-music-visualizer-for-mac-2026", text: "The best music visualizer for Mac in 2026" },
        ],
    };
};
