// /comparison/propresenter-vs-vmix
// Target query: "propresenter vs vmix" (content/url-plan.csv).
// A referee page (2b): which of the two is right for the reader. Facts come
// from the records through `h`. Both are priced in dollars, so they are
// never converted.
export default (h) => ({
    slug: "propresenter-vs-vmix", template: "2b",
    publishedISO: "2026-11-02", updatedISO: "2026-11-02",
    title: "ProPresenter vs vMix (2026): Which for Live Production?",
    description: "ProPresenter or vMix for live production? Presentation software against a video switcher. Prices, platforms, what each does and who each suits.",
    eyebrow: "Live production compared",
    breadcrumb: "ProPresenter vs vMix",
    h1: "ProPresenter vs vMix: a planned show or a live switcher?",
    answer: `If you are running a show you built in advance, with lyrics, slides and media on several screens, pick ${h.link("propresenter")}: Standard is ${h.cost("propresenter", "Standard, one seat, billed monthly")} a month and it runs on macOS and Windows. If you are mixing live cameras into a feed you record and stream, pick ${h.link("vmix")}, which is a switcher rather than a show system, but it is Windows only: there is no Mac build of vMix at all, and ${h.rec("vmix").trial.limits.charAt(0).toLowerCase() + h.rec("vmix").trial.limits.slice(1)}`,
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
        pickA: `you are running a planned show with lyrics, slides and media, you have more than one screen, and you need the Mac version. Standard is ${h.cost("propresenter", "Standard, one seat, billed monthly")} a month or ${h.cost("propresenter", "Standard, one seat, billed annually")} a year for one seat.`,
        pickB: `you are switching live cameras into a feed you record and stream, you want instant replay or remote callers, and you have a Windows machine. Basic HD is ${h.cost("vmix", "Basic HD, one-off licence")} once, and the full edition is ${h.cost("vmix", "vMix Max, monthly subscription")} a month.`,
    },
    sections: [
        {
            h2: "Why people compare them",
            html: `<p>They end up in the same rack at the same event, because both take a set of sources and put them on a screen in front of people. But they are built around different jobs. ${h.name("propresenter")} is ${h.rec("propresenter").tagline.replace(/\.$/, "").toLowerCase()}. ${h.name("vmix")} is ${h.rec("vmix").tagline.replace(/\.$/, "").toLowerCase()}.</p>
    <p>One is a show system you build and then run. The other is a switcher you operate. If your evening is a service with lyrics, scripture and slides, they are not close. If it is a multi-camera broadcast, they are not close either. They meet in the middle: churches and venues that stream their service need both kinds of job done.</p>`,
        },
        {
            h2: "Where ProPresenter wins",
            html: `<p><b>It runs on a Mac.</b> ${h.name("propresenter")} is listed for ${h.platforms("propresenter")}. ${h.limit("vmix", 1).charAt(0).toLowerCase() + h.limit("vmix", 1).slice(1)}</p>
    <p><b>It is built for a show you have prepared.</b> ${h.strength("propresenter", 0)} ${h.strength("propresenter", 1)}</p>
    <p><b>The outputs are broadcast-shaped.</b> ${h.rec("propresenter").io.video.text.charAt(0).toLowerCase() + h.rec("propresenter").io.video.text.slice(1)}</p>
    <p><b>It can be driven from the desk.</b> ${h.strength("propresenter", 3)}, so one operator can run the evening without touching the mouse.</p>`,
        },
        {
            h2: "Where vMix wins",
            html: `<p><b>It mixes live cameras.</b> ${h.strength("vmix", 0)}</p>
    <p><b>It has replay and remote guests.</b> ${h.strength("vmix", 2)}</p>
    <p><b>It has a free trial worth something.</b> ${h.rec("vmix").trial.limits.charAt(0).toLowerCase() + h.rec("vmix").trial.limits.slice(1)} ProPresenter's trial is 14 days, needs a card at sign-up and converts to a paid subscription on its own.</p>
    <p><b>It gets the picture to other machines.</b> ${h.strength("vmix", 1)}</p>`,
        },
        {
            h2: "Where both fall short",
            html: `<p><b>Neither is free to run.</b> ${h.rec("propresenter").pricing.note.split(". ")[0]} ${h.limit("vmix", 0).charAt(0).toLowerCase() + h.limit("vmix", 0).slice(1)}</p>
    <p><b>Both need a show made before the show.</b> Whichever you pick, the visuals are only as good as the material you prepared and the cues you built. Neither turns a camera into a performance by itself.</p>
    <p><b>Both cap what you can drive.</b> ${h.limit("vmix", 2).charAt(0).toLowerCase() + h.limit("vmix", 2).slice(1)} And ${h.limit("propresenter", 1).charAt(0).toLowerCase() + h.limit("propresenter", 1).slice(1)}</p>
    <p><b>Neither is a music visualiser.</b> Both are general tools for video, and both expect you to bring the content. If what you want is visuals that react to what the Mac is playing, with nothing to prepare, that is a different job than either of these does.</p>`,
        },
        {
            h2: "What it costs",
            html: `<p>ProPresenter Standard is ${h.price("propresenter", "Standard, one seat, billed monthly")} a month or ${h.price("propresenter", "Standard, one seat, billed annually")} a year for one seat, and the price falls per seat as you add them: 189 dollars a seat for 2 to 4 seats and 149 for 5 to 10, while 11 or more are quoted by sales. The free mode is a watermarked Local Editor seat that edits on one computer and does not sync to the cloud.</p>
    <p>vMix has one-off licences at ${h.price("vmix", "Basic HD, one-off licence")} for Basic HD, ${h.price("vmix", "HD, one-off licence")} for HD, ${h.price("vmix", "4K, one-off licence")} for 4K and ${h.price("vmix", "Pro, one-off licence")} for Pro, each with twelve months of free version updates, and a subscription at ${h.price("vmix", "vMix Max, monthly subscription")} a month for the full edition. Both charge in US dollars, so the rate on the day you buy is yours to check.</p>`,
        },
    ],
    faq: [
        {
            q: "Does vMix run on a Mac?",
            a: `No. ${h.limit("vmix", 1)} ProPresenter runs on ${h.platforms("propresenter")}, so on a Mac it is the one that runs on your own hardware.`,
        },
        {
            q: "Which is cheaper, ProPresenter or vMix?",
            a: `It depends on the edition. ProPresenter Standard is ${h.cost("propresenter", "Standard, one seat, billed monthly")} a month for one seat and the price falls per seat as you add them. vMix starts at ${h.cost("vmix", "Basic HD, one-off licence")} once for Basic HD, which is limited to three camera inputs and 1080p, and the full edition is ${h.cost("vmix", "vMix Max, monthly subscription")} a month.`,
        },
        {
            q: "Can I try either one for free?",
            a: `Yes. ${h.rec("propresenter").trial.limits.charAt(0).toLowerCase() + h.rec("propresenter").trial.limits.slice(1)} vMix's trial lasts 60 days and runs the Pro edition with every feature.`,
        },
        {
            q: "Which one is for a church service?",
            a: "ProPresenter. It has lyrics, scripture and copyright lookup built in, separate layouts for stage displays and confidence monitors, and it sends key and fill feeds to a switcher. vMix is for mixing cameras into a feed, not for running a service.",
        },
    ],
    related: [
        { href: "/comparison", text: "All comparisons" },
        { href: "/blog/best-music-visualizer-for-mac-2026", text: "The best music visualizer for Mac in 2026" },
    ],
});
