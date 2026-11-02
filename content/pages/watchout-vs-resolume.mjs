// /comparison/watchout-vs-resolume
// Target query: "watchout vs resolume" (content/url-plan.csv).
// A referee page (2b): which of the two is right for the reader. Facts come
// from the records through `h`. Both are priced in euros, so they are never
// converted.
export default (h) => ({
    slug: "watchout-vs-resolume", template: "2b",
    publishedISO: "2026-11-02", updatedISO: "2026-11-02",
    title: "WATCHOUT vs Resolume (2026): Which for Live Shows?",
    description: "WATCHOUT or Resolume for a live show? A media server against a VJ application. Prices, connections, and who each one suits.",
    eyebrow: "Live video compared",
    breadcrumb: "WATCHOUT vs Resolume",
    h1: "WATCHOUT vs Resolume: a media server or a VJ application?",
    answer: `If you are running a specified show on many synchronised displays from a network of Windows machines, pick ${h.link("watchout")}, which is licensed per media server at ${h.cost("watchout", "WATCHOUT 7 licence")} a node. If you are performing video from one laptop that you carry to the venue, pick ${h.link("resolume")}, whose Avenue is ${h.cost("resolume", "Avenue")} and runs on macOS and Windows. They come up together because both put prepared media in front of an audience, but they start from opposite ends: one is a system you specify and install, the other is an application you play.`,
    cta: "Try Vibresia free",
    connections: true,
    rows: [
        { label: "What it is", value: (h, s) => h.rec(s).tagline },
        { label: "Price", value: (h, s) => h.priceCell(s) },
        { label: "Runs on", value: (h, s) => h.platforms(s) },
        { label: "Requirements", value: (h, s) => h.rec(s).requirements },
        { label: "Free version", value: (h, s) => s === "watchout" ? "No time-limited trial; a licence is needed before it can drive output devices" : h.rec(s).trial.limits },
        { label: "Known for", value: (h, s) => h.strength(s, 0) },
        { label: "Best for", value: (h, s) => h.rec(s).bestFor },
    ],
    verdict: {
        pickA: `you are specifying a show for a room with many displays, the content is prepared in advance, and you want the playback to run from media servers while somebody else cues it from a lighting desk or a show controller. A WATCHOUT 7 licence is ${h.cost("watchout", "WATCHOUT 7 licence")} and covers one media server, and each licensed node drives up to 8x DCI 4K of output.`,
        pickB: `you are performing video from a laptop, you want to work on a Mac as well as Windows, or the show is a couple of screens rather than a hall of them. Avenue is ${h.cost("resolume", "Avenue")} and the free version runs indefinitely, with a watermark on the video output until you enter a serial number.`,
    },
    sections: [
        {
            h2: "Why people compare them",
            html: `<p>They end up in the same rack, driving screens in a club or a theatre, and both put prepared media in front of an audience, so the people building a show weigh one against the other. What separates them is where the show is decided.</p>
    <p>WATCHOUT is Windows multi-display production and playback software for building shows and playing them in sync across multiple displays. Resolume is VJ and media-server software (Avenue, Arena) and a visual programming tool (Wire), for macOS and Windows. One is written by a show producer and run by whoever is on the technical desk. The other is opened by the performer, who chooses what appears and when.</p>
    <p>The licence shapes much of the rest of the difference. A WATCHOUT 7 licence covers one media server, and a show that spans a hall needs one for each machine in it. Resolume's prices are for Avenue, Arena and Wire, the applications themselves, and the free Producer of WATCHOUT is a separate thing from a licence: you can install it without a licence key, and it still cannot drive an output device.</p>`,
        },
        {
            h2: "Where WATCHOUT wins",
            html: `<p><b>It is built for many displays at once.</b> ${h.strength("watchout", 0)} ${h.io("watchout", "video").text}</p>
    <p><b>It scales by adding machines.</b> ${h.strength("watchout", 1)}</p>
    <p><b>The scale has a number you can check before you buy.</b> ${h.limit("watchout", 2)}</p>
    <p><b>It plays the formats an installed show asks for.</b> ${h.strength("watchout", 2)} ${h.limit("watchout", 3)}</p>
    <p><b>It takes live control from the room.</b> ${h.strength("watchout", 3)} ${h.io("watchout", "osc").text} ${h.io("watchout", "midi").text}</p>
    <p><b>Lighting is standard rather than an upgrade.</b> ${h.io("watchout", "dmx").text}</p>
    <p><b>It can take a signal in as well as sending one out.</b> ${h.strength("watchout", 4)} ${h.io("watchout", "spout").text} ${h.io("watchout", "ndi").text}</p>`,
        },
        {
            h2: "Where Resolume wins",
            html: `<p><b>It runs on a Mac as well as Windows.</b> ${h.io("resolume", "syphon").text} ${h.io("resolume", "spout").text} ${h.io("watchout", "syphon").text}</p>
    <p><b>It costs a fraction of a specified install.</b> Avenue is ${h.cost("resolume", "Avenue")}, Arena is ${h.cost("resolume", "Arena")} and Wire is ${h.cost("resolume", "Wire")}, each a one-time purchase with 12 months of updates included, and ${h.strength("resolume", 2)}</p>
    <p><b>It is built to be played rather than specified.</b> Resolume is for working VJs and venues running video on screens and projectors, and Arena adds media-server features to Avenue for bigger rooms. Wire is a separate tool for building your own effects and generators visually.</p>
    <p><b>You can try it for as long as you like.</b> ${h.rec("resolume").trial.limits} That is enough to learn the software, and not enough to play a paid show.</p>`,
        },
        {
            h2: "Where both fall short",
            html: `<p><b>Neither one makes the show for you.</b> Both take media you prepared and cues you built, and neither generates visuals from the music it is playing. Both are general tools for video, and both expect you to bring the content.</p>
    <p><b>Both take something away in the free version.</b> ${h.limit("watchout", 0)} ${h.rec("resolume").trial.limits}</p>
    <p><b>Both have a ceiling on one machine.</b> ${h.limit("watchout", 2)} ${h.limit("resolume", 1)}</p>
    <p><b>Both leave a gap for a lighting desk that speaks USB DMX.</b> ${h.io("watchout", "dmx").text} ${h.limit("resolume", 2)}</p>
    <p><b>Both want the show designed before the night.</b> WATCHOUT wants a production computer, an Asset Manager and licensed media servers. Resolume wants decks and cues built before anyone walks in. Neither is something you switch on five minutes before the doors open.</p>`,
        },
        {
            h2: "What it costs",
            html: `<p>The WATCHOUT Producer is ${h.price("watchout", "WATCHOUT Producer").toLowerCase()} to download and install without a licence key, and a WATCHOUT 7 licence is ${h.price("watchout", "WATCHOUT 7 licence")}, one licence per media server, with additional media servers not included. Dataton publishes a single recommended retail price rather than a tier list, bought through a local Dataton partner or a price request form. The same page lists €1,950 per licence for an electronic upgrade from version 6, and educational licences are discounted, restricted to teaching institutions and require annual renewal.</p>
    <p>Resolume Avenue is ${h.price("resolume", "Avenue")}, Arena is ${h.price("resolume", "Arena")} and Wire is ${h.price("resolume", "Wire")}, and the licences keep working after the 12 months of included updates. There is a condition on them: ${h.limit("resolume", 3)} Both sides are priced in euros, so the rate on the day you buy is yours to check.</p>`,
        },
    ],
    faq: [
        {
            q: "Which is cheaper, WATCHOUT or Resolume?",
            a: `Resolume. Avenue is ${h.cost("resolume", "Avenue")} and Arena is ${h.cost("resolume", "Arena")}, each a one-time purchase with 12 months of updates included, and ${h.strength("resolume", 2).charAt(0).toLowerCase() + h.strength("resolume", 2).slice(1)} A WATCHOUT 7 licence is ${h.cost("watchout", "WATCHOUT 7 licence")} and covers one media server, with additional media servers not included. The free WATCHOUT Producer costs nothing but cannot drive an output device.`,
        },
        {
            q: "Does WATCHOUT run on a Mac?",
            a: `No. ${h.io("watchout", "syphon").text} It needs ${h.rec("watchout").requirements}. Resolume runs on ${h.platforms("resolume")} and needs ${h.rec("resolume").requirements}.`,
        },
        {
            q: "Which one handles DMX and lighting desks better?",
            a: `WATCHOUT, and without needing the more expensive edition. It accepts live control from Art-Net and DMX, OSC, MIDI, MIDI Show Control, LTC, PosiStageNet and an HTTP REST API. In Resolume, ${h.io("resolume", "dmx").text}`,
        },
        {
            q: "Can I try either one for free?",
            a: `Yes, both, in different ways. ${h.rec("watchout").trial.limits} ${h.rec("resolume").trial.limits}`,
        },
    ],
    related: [
        { href: "/comparison", text: "All comparisons" },
        { href: "/blog/best-music-visualizer-for-mac-2026", text: "The best music visualizer for Mac in 2026" },
    ],
});
