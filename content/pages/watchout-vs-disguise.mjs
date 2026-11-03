// /comparison/watchout-vs-disguise
// Target query: "watchout vs disguise" (content/url-plan.csv).
// A referee page (2b): which of the two is right for the reader. Facts come
// from the records through `h`. WATCHOUT publishes its price in euros and
// disguise publishes its own in dollars, so neither figure is converted.
export default (h) => ({
    slug: "watchout-vs-disguise", template: "2b",
    publishedISO: "2026-11-03", updatedISO: "2026-11-03",
    title: "WATCHOUT vs disguise (2026): Which Media Server for a Venue?",
    description: "WATCHOUT or disguise for a venue show? A one-time licence per media server against a subscription. Prices, connections and who each one suits.",
    eyebrow: "Media servers compared",
    breadcrumb: "WATCHOUT vs disguise",
    h1: "WATCHOUT vs disguise: which media server for a venue?",
    answer: `Pick ${h.link("watchout")} if you are specifying a show for a venue and want to buy the machine once, because a WATCHOUT 7 licence is ${h.cost("watchout", "WATCHOUT 7 licence")} and covers one media server. Pick ${h.link("disguise")} if you want to preview the show in 3D before it is built and you can live with a yearly subscription, because Designer Pro is ${h.cost("disguise", "Designer Pro, monthly")} a month and the X Series licences that add physical outputs run from ${h.cost("disguise", "Disguise X1")} to ${h.cost("disguise", "Disguise X3")} a year. Both are media servers for driving many synchronised displays from a set of timelines, and both run on Windows and only Windows, so the choice comes down to how you buy the room and what you want the software to do before the show is built.`,
    cta: "Try Vibresia free",
    connections: true,
    rows: [
        { label: "What it is", value: (h, s) => h.rec(s).tagline },
        { label: "Price", value: (h, s) => h.priceCell(s) },
        { label: "Runs on", value: (h, s) => h.platforms(s) },
        { label: "Requirements", value: (h, s) => h.rec(s).requirements },
        { label: "Free version", value: (h, s) => h.rec(s).trial ? (s === "watchout" ? "No time-limited trial; the free Producer cannot drive an output device" : "A free Designer Starter tier, watermarked and capped at 2K UHD") : "No free version" },
        { label: "Known for", value: (h, s) => h.strength(s, 0) },
        { label: "Best for", value: (h, s) => h.rec(s).bestFor },
    ],
    verdict: {
        pickA: `you are specifying a show for a room with many displays, the content is prepared in advance, and you want the playback to run from licensed media servers that a lighting desk or a show controller can drive. A WATCHOUT 7 licence is ${h.cost("watchout", "WATCHOUT 7 licence")} and covers one media server, and each licensed node drives up to 8x DCI 4K of output.`,
        pickB: `you want to see the show in 3D before you build it, you are running virtual production or an immersive installation, or you want a showfile that carries the production from preview through to playback. Designer Pro is ${h.cost("disguise", "Designer Pro, monthly")} a month or ${h.cost("disguise", "Designer Pro, annual")} a year, and the X Series licences are what add physical video outputs.`,
    },
    sections: [
        {
            h2: "Why people compare them",
            html: `<p>They come up in the same conversation when a show is being specified for a venue, because both are media servers: software that takes prepared media and puts it on many screens and projectors at once, in sync, from a set of timelines. Neither one is a VJ application you play, and neither one makes a picture out of the music it is playing. Both run on Windows and only Windows.</p>
    <p>WATCHOUT is ${h.rec("watchout").tagline} ${h.strength("watchout", 0).replace(/^Composes/, "It composes")}.</p>
    <p>disguise's Designer is the software to design, visualise, sequence and run visual experiences for live, location based experiences and virtual production. It is written for ${h.rec("disguise").bestFor.replace(/^Programming and delivering/, "programming and delivering")}</p>
    <p>The two are bought in different shapes, and that shapes the rest of the comparison. WATCHOUT is licensed per media server, one licence for one machine, and a room with several machines needs several licences. disguise is sold per user as a subscription, and the licences that let a laptop or PC drive physical video outputs are bought separately from the software. The show is put together in different places too: a WATCHOUT show is composed on a production computer and played from media servers in the room, while a disguise project is designed and previewed in the same application that runs it.</p>`,
        },
        {
            h2: "Where WATCHOUT wins",
            html: `<p><b>You buy it once.</b> A WATCHOUT 7 licence is ${h.cost("watchout", "WATCHOUT 7 licence")}, one licence per media server, and additional media servers are not included. ${h.strength("watchout", 1).replace(/^Scales/, "It scales")}.</p>
    <p><b>The output is broadcast grade.</b> ${h.strength("watchout", 2).replace(/^Plays/, "It plays")}. ${h.limit("watchout", 3)}</p>
    <p><b>It takes control from the room.</b> ${h.strength("watchout", 3).replace(/^Accepts/, "It accepts")}. ${h.io("watchout", "midi").text} ${h.io("watchout", "osc").text}</p>
    <p><b>Lighting is standard rather than an upgrade.</b> ${h.io("watchout", "dmx").text}</p>
    <p><b>It takes a signal in as well as sending one out.</b> ${h.strength("watchout", 4).replace(/^Takes/, "It takes")}. ${h.io("watchout", "spout").text} ${h.io("watchout", "ndi").text}</p>
    <p><b>The size of the room is a number you can check before you order.</b> ${h.limit("watchout", 2)}</p>`,
        },
        {
            h2: "Where disguise wins",
            html: `<p><b>You can see the show before you build it.</b> ${h.strength("disguise", 0)}</p>
    <p><b>The mapping is measured rather than guessed.</b> ${h.strength("disguise", 1)}</p>
    <p><b>It reaches more kinds of device.</b> ${h.strength("disguise", 2)} ${h.io("disguise", "dmx").text}</p>
    <p><b>It drives the content engines people already build in.</b> ${h.strength("disguise", 4)} ${h.io("disguise", "spout").text}</p>
    <p><b>It can take an NDI feed in.</b> ${h.io("disguise", "ndi").text}</p>
    <p><b>You can learn it on the free tier.</b> ${h.strength("disguise", 3)} ${h.rec("disguise").trial.limits}</p>
    <p><b>You can start on the software alone.</b> The Designer Pro subscription is ${h.cost("disguise", "Designer Pro, monthly")} a month, and the X Series licences that add physical video outputs are a separate purchase on top of it.</p>`,
        },
        {
            h2: "Where both fall short",
            html: `<p><b>Both want the show made before the night.</b> Each one takes media you prepared and cues you built, and neither generates visuals from the music it is playing. Both are general tools for video, and both expect you to bring the content and decide how it reacts.</p>
    <p><b>Both are Windows only.</b> ${h.io("watchout", "syphon").text} ${h.limit("disguise", 0)} For disguise, ${h.io("disguise", "syphon").note.replace(/^The/, "the")}</p>
    <p><b>Both take something away in the free version.</b> ${h.limit("watchout", 0)} In disguise, ${h.limit("disguise", 1)}</p>
    <p><b>The free disguise tier has a sharp edge in it.</b> ${h.limit("disguise", 2)} ${h.limit("disguise", 3)}</p>
    <p><b>Both have a ceiling on one machine.</b> ${h.limit("watchout", 2)} On disguise, physical video outputs come from X Series licences, and the media server hardware itself is sold by enquiry rather than from a published price list.</p>`,
        },
        {
            h2: "What it costs",
            html: `<p>The WATCHOUT Producer is ${h.price("watchout", "WATCHOUT Producer").toLowerCase()} to download and install without a licence key, and a WATCHOUT 7 licence is ${h.price("watchout", "WATCHOUT 7 licence")}, one licence per media server, with additional media servers not included and import taxes, local VAT and freight not covered. ${h.rec("watchout").pricing.note}</p>
    <p>disguise's Designer Starter is ${h.price("disguise", "Designer Starter").toLowerCase()}, and Designer Pro is ${h.price("disguise", "Designer Pro, monthly")} or ${h.price("disguise", "Designer Pro, annual")}. The X Series licences are ${h.price("disguise", "Disguise X1")}, ${h.price("disguise", "Disguise X2")} and ${h.price("disguise", "Disguise X3")}, for one, two and three 4K DCI outputs. A Disguise media server is not included in those figures, and the same X Series licences can be billed monthly from $600 per user on the X1. ${h.rec("disguise").pricing.note}</p>
    <p>So the two bills are shaped differently. WATCHOUT asks for a payment once per media server, and the licence keeps working. disguise asks for a payment every year per user, and the licences that let a machine drive physical video outputs are bought on top of that. WATCHOUT publishes its figure in euros and disguise publishes its own in dollars, so neither number is converted here and the rate on the day you buy is yours to check.</p>`,
        },
    ],
    faq: [
        {
            q: "Which is cheaper, WATCHOUT or disguise?",
            a: `The two bills are shaped differently, so the answer depends on the room rather than on a single figure. WATCHOUT charges once per media server: a WATCHOUT 7 licence is ${h.cost("watchout", "WATCHOUT 7 licence")}, and a show that needs a second node needs a second licence. disguise charges every year per user: Designer Pro is ${h.cost("disguise", "Designer Pro, monthly")} a month or ${h.cost("disguise", "Designer Pro, annual")} a year, and physical video outputs need an X Series licence on top, from ${h.cost("disguise", "Disguise X1")} to ${h.cost("disguise", "Disguise X3")} a year. The WATCHOUT price is in euros and the disguise price is in dollars.`,
        },
        {
            q: "Do either of them run on a Mac?",
            a: `No, neither of them. ${h.io("watchout", "syphon").text} ${h.limit("disguise", 0)} WATCHOUT needs ${h.rec("watchout").requirements}. disguise needs ${h.rec("disguise").requirements}.`,
        },
        {
            q: "Which one can I try for free?",
            a: `Both, and each of them takes something away. ${h.rec("watchout").trial.limits} ${h.rec("disguise").trial.limits} ${h.limit("disguise", 1)}`,
        },
        {
            q: "Which one handles DMX and lighting control better?",
            a: `disguise documents the wider set of connections. ${h.io("disguise", "dmx").text} ${h.strength("disguise", 2)} WATCHOUT is narrower: ${h.io("watchout", "dmx").text}`,
        },
    ],
    related: [
        { href: "/comparison", text: "All comparisons" },
        { href: "/blog/best-music-visualizer-for-mac-2026", text: "The best music visualizer for Mac in 2026" },
    ],
});
