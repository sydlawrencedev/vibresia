// /comparison/qlab-vs-propresenter
// Target query: "qlab vs propresenter" (content/url-plan.csv).
// A referee page (2b): which of the two is right for the reader. Facts come
// from the records through `h`. QLab is priced in dollars and ProPresenter in
// dollars too, so they are never converted.
export default (h) => ({
    slug: "qlab-vs-propresenter", template: "2b",
    publishedISO: "2026-11-03", updatedISO: "2026-11-03",
    title: "QLab vs ProPresenter (2026): Which Show Software?",
    description: "QLab or ProPresenter for a live show? Show control against church presentation software. Prices, platforms, what each does and who each one suits.",
    eyebrow: "Show software compared",
    breadcrumb: "QLab vs ProPresenter",
    h1: "QLab vs ProPresenter: show control or presentation software?",
    answer: `If you are running a theatre show, a concert or an installation, and you need sound, video, lighting and show control all cued from one timeline, pick ${h.link("qlab")}: Full-Featured is ${h.cost("qlab", "Full-Featured, Audio and Video and Lighting")} once, and its free tier already runs audio, video and lighting cues. If you are running a church service, where the lyrics and the scripture matter more than the lighting desk, pick ${h.link("propresenter")}: Standard is ${h.cost("propresenter", "Standard, one seat, billed monthly")} a month, it runs on Windows as well as a Mac, and worship tooling is built in.`,
    cta: "Try Vibresia free",
    connections: true,
    rows: [
        { label: "What it is", value: (h, s) => h.rec(s).tagline },
        { label: "Price", value: (h, s) => h.priceCell(s) },
        { label: "Runs on", value: (h, s) => h.platforms(s) },
        { label: "Requirements", value: (h, s) => h.rec(s).requirements },
        { label: "Free version", value: (h, s) => h.rec(s).trial ? `${h.rec(s).trial.limits.split(". ")[0]}.` : "No free version" },
        { label: "Known for", value: (h, s) => h.strength(s, 0) },
        { label: "Best for", value: (h, s) => h.rec(s).bestFor },
    ],
    verdict: {
        pickA: `you are running a show where sound, video and lighting have to fire together, you need video masking and edge blending across more than one screen, or several people need to work on the same show at once. Full-Featured is ${h.cost("qlab", "Full-Featured, Audio and Video and Lighting")} once, and the free tier runs audio, video and lighting cues already.`,
        pickB: `you are running a church service, you want lyrics, scripture and copyright lookup built in, you need it on Windows as well as a Mac, or the budget is per person rather than per show. Standard is ${h.cost("propresenter", "Standard, one seat, billed monthly")} a month, and falls per seat as you add them.`,
    },
    sections: [
        {
            h2: "Why people compare them",
            html: `<p>They end up in the same rack because both cue a show from a timeline on a Mac, and both are what a venue or a church reaches for when someone asks what runs the show.</p>
    <p>${h.name("qlab")} is ${h.rec("qlab").tagline.replace(/\.$/, "").toLowerCase()}. ${h.name("propresenter")} is ${h.rec("propresenter").tagline.replace(/\.$/, "").toLowerCase()}. One is built for a show with lighting in it. The other is built for a service with a congregation in it. A production that has both, which is more common than people expect, has to pick which one is in charge.</p>`,
        },
        {
            h2: "Where QLab wins",
            html: `<p><b>It cues everything, not just the pictures.</b> ${h.strength("qlab", 0)}</p>
    <p><b>The video engine does the awkward things.</b> ${h.strength("qlab", 2)}</p>
    <p><b>The lighting side is properly done.</b> ${h.strength("qlab", 3)}</p>
    <p><b>Several people can work on it at once.</b> ${h.strength("qlab", 1)}</p>
    <p><b>The free tier runs real cues.</b> ${h.strength("qlab", 4)}</p>`,
        },
        {
            h2: "Where ProPresenter wins",
            html: `<p><b>It runs on Windows as well as a Mac.</b> ${h.name("propresenter")} is listed for ${h.platforms("propresenter")}. ${h.rec("qlab").requirements.charAt(0).toLowerCase() + h.rec("qlab").requirements.slice(1)}</p>
    <p><b>The worship tooling is built in.</b> ${h.strength("propresenter", 0)}</p>
    <p><b>It costs less to start with.</b> Standard is ${h.cost("propresenter", "Standard, one seat, billed monthly")} a month or ${h.cost("propresenter", "Standard, one seat, billed annually")} a year for one seat, and the price falls per seat as you add them, against ${h.cost("qlab", "One Feature Set, Audio or Video or Lighting")} for the cheapest paid QLab licence. ${h.rec("propresenter").pricing.note.split(". ")[0]}</p>
    <p><b>It has a full trial.</b> ${h.rec("propresenter").trial.limits.charAt(0).toLowerCase() + h.rec("propresenter").trial.limits.slice(1)}</p>`,
        },
        {
            h2: "Where both fall short",
            html: `<p><b>Neither is free to run a show on.</b> ${h.limit("propresenter", 0).charAt(0).toLowerCase() + h.limit("propresenter", 0).slice(1)} QLab's free tier stops at two channels of audio output and 16 DMX addresses, and ${h.limit("qlab", 0).charAt(0).toLowerCase() + h.limit("qlab", 0).slice(1)}</p>
    <p><b>Neither is a music visualiser.</b> Both are general tools for video, and both expect you to bring the content and decide how it reacts. If what you want is visuals that react to what the Mac is playing, with nothing to prepare, that is a different job than either of these does.</p>
    <p><b>Both need the show made before the show.</b> Whichever you pick, the visuals are only as good as the material you prepared and the cues you built. Neither turns a folder of files into a performance by itself.</p>`,
        },
        {
            h2: "What it costs",
            html: `<p>QLab's licences are perpetual one-time purchases, not a subscription. One feature set is ${h.price("qlab", "One Feature Set, Audio or Video or Lighting")}, two are ${h.price("qlab", "Two Feature Sets")} and the full set is ${h.price("qlab", "Full-Featured, Audio and Video and Lighting")}, each covering installation on two computers. Site licences are ${h.price("qlab", "Site Licence, per activation")} per activation with a minimum of ten.</p>
    <p>ProPresenter Standard is ${h.price("propresenter", "Standard, one seat, billed monthly")} a month or ${h.price("propresenter", "Standard, one seat, billed annually")} a year for one seat, and the price falls per seat as you add them. Both are in dollars, so the rate on the day you buy is yours to check.</p>`,
        },
    ],
    faq: [
        {
            q: "Can I try QLab or ProPresenter for free?",
            a: `Yes, both. ${h.rec("qlab").trial.limits.charAt(0).toLowerCase() + h.rec("qlab").trial.limits.slice(1)} ${h.rec("propresenter").trial.limits.charAt(0).toLowerCase() + h.rec("propresenter").trial.limits.slice(1)}`,
        },
        {
            q: "Which one is for a church service?",
            a: `ProPresenter. ${h.strength("propresenter", 0)} QLab is the one for a show with a lighting desk in it.`,
        },
        {
            q: "Does QLab run on Windows?",
            a: `No. ${h.rec("qlab").requirements.charAt(0).toLowerCase() + h.rec("qlab").requirements.slice(1)} ProPresenter runs on ${h.platforms("propresenter")}, so on a Windows machine it is the one that works.`,
        },
        {
            q: "Which one cues the lighting?",
            a: "QLab. It patches and controls fixtures over DMX using Art-Net, with instrument definitions for over 1400 fixture types from more than 60 makers. ProPresenter can be driven from a lighting console over DMX or Art-Net, but on a Mac only, and its own cueing is built around a service rather than a show.",
        },
    ],
    related: [
        { href: "/comparison", text: "All comparisons" },
        { href: "/blog/best-music-visualizer-for-mac-2026", text: "The best music visualizer for Mac in 2026" },
    ],
});
