// /comparison/vmix-vs-wirecast
// Target query: "vmix vs wirecast" (content/url-plan.csv).
// A referee page (2b): which of the two is right for the reader. Facts come
// from the records through `h`. Both are priced in dollars, so they are
// never converted.
export default (h) => ({
    slug: "vmix-vs-wirecast", template: "2b",
    publishedISO: "2026-11-02", updatedISO: "2026-11-02",
    title: "vMix vs Wirecast (2026): Which Live Video Software?",
    description: "vMix or Wirecast for live video? Two paid production switchers compared. Prices, platforms, what each does and who each one suits.",
    eyebrow: "Live production compared",
    breadcrumb: "vMix vs Wirecast",
    h1: "vMix vs Wirecast: two ways to switch live video",
    answer: `If you are on Windows and want the cheaper way in, pick ${h.link("vmix")}: Basic HD is ${h.cost("vmix", "Basic HD, one-off licence")} once, and there is a 60-day trial of the full Pro edition. If you need it on a Mac as well, or want remote guests, ISO recording or sports tools, pick ${h.link("wirecast")}, which runs on both and is ${h.cost("wirecast", "Wirecast Studio, billed monthly")} a month. The platform difference settles more than the price does: ${h.limit("vmix", 1).charAt(0).toLowerCase() + h.limit("vmix", 1).slice(1)}`,
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
        pickA: `you are on Windows, you want to pay once rather than every month, and you need instant replay or remote callers. Basic HD is ${h.cost("vmix", "Basic HD, one-off licence")} once, the full edition is ${h.cost("vmix", "vMix Max, monthly subscription")} a month, and the trial runs the Pro edition for 60 days.`,
        pickB: `you need it on a Mac as well as Windows, you want ISO recording of each camera feed, or you need sports production tools and PTZ camera control. Studio is ${h.cost("wirecast", "Wirecast Studio, billed monthly")} a month and Pro is ${h.cost("wirecast", "Wirecast Pro, billed monthly")}.`,
    },
    sections: [
        {
            h2: "Why people compare them",
            html: `<p>They are the two paid live production switchers that come up together, because they do the same job: mix cameras and other sources, and send the result out as a stream, a recording and a feed to other machines.</p>
    <p>${h.name("vmix")} is ${h.rec("vmix").tagline.replace(/\.$/, "").toLowerCase()}. ${h.name("wirecast")} is ${h.rec("wirecast").tagline.replace(/\.$/, "").toLowerCase()}. The interesting part is not the feature list, it is that one of them does not run on the computer half the people reading this own.</p>`,
        },
        {
            h2: "Where vMix wins",
            html: `<p><b>It costs less to get into.</b> ${h.price("vmix", "Basic HD, one-off licence")} once for Basic HD, and one-off licences at ${h.price("vmix", "HD, one-off licence")}, ${h.price("vmix", "4K, one-off licence")} and ${h.price("vmix", "Pro, one-off licence")} above it, each with twelve months of free version updates. The subscription is ${h.price("vmix", "vMix Max, monthly subscription")} a month for the full edition.</p>
    <p><b>Its trial is the better one.</b> ${h.rec("vmix").trial.limits.charAt(0).toLowerCase() + h.rec("vmix").trial.limits.slice(1)}</p>
    <p><b>It has instant replay.</b> ${h.strength("vmix", 2)}</p>
    <p><b>It sends its output to other machines.</b> ${h.strength("vmix", 1)}</p>`,
        },
        {
            h2: "Where Wirecast wins",
            html: `<p><b>It runs on a Mac.</b> ${h.name("wirecast")} is listed for ${h.platforms("wirecast")}. ${h.limit("vmix", 1).charAt(0).toLowerCase() + h.limit("vmix", 1).slice(1)}</p>
    <p><b>Its free download is unlimited.</b> ${h.rec("wirecast").trial.limits.charAt(0).toLowerCase() + h.rec("wirecast").trial.limits.slice(1)}</p>
    <p><b>It records each camera separately.</b> ${h.strength("wirecast", 4)}</p>
    <p><b>Remote guests need no download.</b> ${h.strength("wirecast", 1)}</p>
    <p><b>It has sports tools.</b> ${h.strength("wirecast", 2)}</p>`,
        },
        {
            h2: "Where both fall short",
            html: `<p><b>Neither is free to run.</b> ${h.limit("vmix", 0).charAt(0).toLowerCase() + h.limit("vmix", 0).slice(1)} ${h.limit("wirecast", 0).charAt(0).toLowerCase() + h.limit("wirecast", 0).slice(1)}</p>
    <p><b>Both are subscriptions once you are past the trial.</b> vMix has one-off licences but they carry twelve months of free version updates and nothing after that, and Wirecast's pricing page lists no one-time or perpetual purchase at all.</p>
    <p><b>Both cap what you can drive.</b> ${h.limit("vmix", 2).charAt(0).toLowerCase() + h.limit("vmix", 2).slice(1)} And ${h.limit("wirecast", 3).charAt(0).toLowerCase() + h.limit("wirecast", 3).slice(1)}</p>
    <p><b>Neither is a music visualiser.</b> Both are general tools for video, and both expect you to bring the content. If what you want is visuals that react to what the Mac is playing, with nothing to prepare, that is a different job than either of these does.</p>`,
        },
        {
            h2: "What it costs",
            html: `<p>vMix has one-off licences from ${h.price("vmix", "Basic HD, one-off licence")} for Basic HD up to ${h.price("vmix", "Pro, one-off licence")} for Pro, and a subscription at ${h.price("vmix", "vMix Max, monthly subscription")} a month for the full edition.</p>
    <p>Wirecast Studio is ${h.price("wirecast", "Wirecast Studio, billed monthly")} a month, or ${h.price("wirecast", "Wirecast Studio, billed annually")} a month when billed yearly, which the price page says saves ${h.rec("wirecast").pricing.note.split("saves ")[1].split(" a year")[0]} a year. Wirecast Pro is ${h.price("wirecast", "Wirecast Pro, billed monthly")} a month, or ${h.price("wirecast", "Wirecast Pro, billed annually")} a month billed yearly. Both charge in US dollars, so the rate on the day you buy is yours to check.</p>`,
        },
    ],
    faq: [
        {
            q: "Does vMix run on a Mac?",
            a: `No. ${h.limit("vmix", 1)} Wirecast runs on ${h.platforms("wirecast")}, so on a Mac it is the one that works.`,
        },
        {
            q: "Which is cheaper, vMix or Wirecast?",
            a: `vMix's entry point is ${h.cost("vmix", "Basic HD, one-off licence")} once, though Basic HD is limited to three camera inputs and 1080p. Wirecast Studio is ${h.cost("wirecast", "Wirecast Studio, billed monthly")} a month, or ${h.cost("wirecast", "Wirecast Studio, billed annually")} a month billed yearly.`,
        },
        {
            q: "Can I try either one for free?",
            a: `Yes. ${h.rec("vmix").trial.limits.charAt(0).toLowerCase() + h.rec("vmix").trial.limits.slice(1)} ${h.rec("wirecast").trial.limits.charAt(0).toLowerCase() + h.rec("wirecast").trial.limits.slice(1)}`,
        },
        {
            q: "Which one records each camera separately?",
            a: "Wirecast Pro. Its ISO recording saves each camera feed as its own file, with multi-track audio recording of up to eight stereo tracks. vMix has MultiCorder, which the trial includes, but it is a Pro feature rather than a Studio one.",
        },
    ],
    related: [
        { href: "/comparison", text: "All comparisons" },
        { href: "/blog/best-music-visualizer-for-mac-2026", text: "The best music visualizer for Mac in 2026" },
    ],
});
