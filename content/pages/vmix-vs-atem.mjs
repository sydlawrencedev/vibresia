// /comparison/vmix-vs-atem
// Target query: "vmix vs atem" (content/url-plan.csv).
// A referee page (2b): which of the two is right for the reader. Facts come
// from the records through `h`. Both are priced in dollars, so there is
// nothing to convert. The pair did not opt in to a third option, so
// Vibresia is not mentioned anywhere in the body.
export default (h) => ({
    slug: "vmix-vs-atem", template: "2b",
    publishedISO: "2026-11-03", updatedISO: "2026-11-03",
    title: "vMix vs ATEM (2026): Software Switcher or Hardware?",
    description: "vMix or ATEM for a live multi-camera show? One is Windows software from $60, the other is Blackmagic hardware from $445. Prices, platforms, who each suits.",
    eyebrow: "Live production compared",
    breadcrumb: "vMix vs ATEM",
    h1: "vMix vs ATEM: a Windows switcher or a Blackmagic box?",
    answer: `If you are running a multi-camera show on a Windows PC and want switching, recording and streaming in one application, pick ${h.link("vmix")}: the one-off licence starts at ${h.cost("vmix", "Basic HD, one-off licence")} and the same features on a subscription are ${h.cost("vmix", "vMix Max, monthly subscription")} a month. If you would rather the switching happened inside a box of its own and you want the control panel to run on your Mac, pick ${h.link("atem")}, where the ATEM Mini Pro is ${h.cost("atem", "ATEM Mini Pro")} and the control software is free. The fact that settles most of these comparisons is the platform, because vMix has no macOS build, while ATEM Software Control runs on Mac and Windows but does nothing until a switcher is connected to it.`,
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
        pickA: `you are running a multi-camera production on a Windows PC and want switching, recording, streaming and instant replay in one application. Basic HD is ${h.cost("vmix", "Basic HD, one-off licence")} once, and the full edition is ${h.cost("vmix", "vMix Max, monthly subscription")} a month, with a 60-day trial of the Pro edition to try it on.`,
        pickB: `you want the switching done in hardware so the show does not depend on how fast your computer is, and you want the control panel to run on a Mac as well as on Windows. The ATEM Mini Pro is ${h.cost("atem", "ATEM Mini Pro")} and ATEM Software Control is free to install on unlimited computers, but the switcher is the purchase.`,
    },
    sections: [
        {
            h2: "Why people compare them",
            html: `<p>They come up together because they are being asked to do the same job: several cameras, one programme output, and a recording and a stream at the end of it. ${h.name("vmix")} is ${h.rec("vmix").tagline.replace(/^A /, "a ").replace(/\.$/, "")}. ${h.name("atem")} is ${h.rec("atem").tagline.replace(/\.$/, "")}.</p>
    <p>Underneath that they are not the same kind of thing. vMix is an application you install on a Windows PC, and the computer does the switching. ATEM is a box that does the switching itself, with a control panel on your screen that has to be plugged into that box before it will do anything at all.</p>
    <p>The difference decides the price too. A vMix licence starts at ${h.cost("vmix", "Basic HD, one-off licence")} for software you run on a machine you already own. The cheapest ATEM switcher is ${h.cost("atem", "ATEM Mini Pro")} of hardware, and the family runs up to ${h.cost("atem", "ATEM 4 M/E Constellation 4K")}. So the question behind most of these comparisons is whether the show needs a computer doing the work, or a box doing the work and a computer only pointing at it.</p>
    <p>Both are production tools rather than performers. You set up your sources, choose where the output goes, and then let it run.</p>`,
        },
        {
            h2: "Where vMix wins",
            html: `<p><b>It does the whole job on one machine you already own.</b> ${h.strength("vmix", 0)}</p>
    <p><b>It gets the picture to other machines over NDI.</b> ${h.strength("vmix", 1)}</p>
    <p><b>It has remote guests and instant replay.</b> ${h.strength("vmix", 2)}</p>
    <p><b>It can be driven from the desk.</b> ${h.io("vmix", "midi").text} ${h.strength("vmix", 4)}</p>
    <p><b>The trial runs the paid edition.</b> ${h.rec("vmix").trial.limits}</p>
    <p><b>It costs less to begin with.</b> ${h.limit("vmix", 0)}</p>`,
        },
        {
            h2: "Where ATEM wins",
            html: `<p><b>The video work happens in the hardware.</b> ${h.strength("atem", 0)}</p>
    <p><b>The control panel is free and can go on every computer.</b> ${h.strength("atem", 1)}</p>
    <p><b>The ISO models record every input separately.</b> ${h.strength("atem", 2)}</p>
    <p><b>There are no licence fees on the switcher features.</b> ${h.strength("atem", 3)}</p>
    <p><b>The picture leaves the box in broadcast shapes.</b> ${h.strength("atem", 4)}</p>
    <p><b>It runs on a Mac as well as on Windows.</b> ATEM Software Control is listed for Mac and Windows. ${h.limit("atem", 1)}</p>`,
        },
        {
            h2: "Where both fall short",
            html: `<p><b>The Mac answer is not the same on each side.</b> ${h.limit("vmix", 1)} ${h.limit("atem", 0)}</p>
    <p><b>Their video over IP does not meet.</b> ${h.io("vmix", "ndi").text} ${h.io("atem", "ndi").text}</p>
    <p><b>Their MIDI is different too.</b> ${h.io("vmix", "midi").text} ${h.io("atem", "midi").text} The ATEM manual describes no MIDI output to other applications.</p>
    <p><b>Neither documents OSC, Syphon or Spout.</b> The vMix guide gives OSC and Spout as not that we could find, and it states that vMix has no Syphon input or output, because there is no macOS version of vMix, and Mac sources reach vMix through NDI or OMT scan converters instead. The ATEM Mini Manual and the ATEM Television Studio Manual do not mention OSC, Syphon or Spout either.</p>
    <p><b>The ATEM Mini line is HD only.</b> ${h.limit("atem", 2)}</p>
    <p><b>Neither one is a music visualiser.</b> Both are general tools for video, and both expect you to bring the content and the cues with you.</p>`,
        },
        {
            h2: "What it costs",
            html: `<p>vMix charges in US dollars. The one-off licences are Basic HD at ${h.cost("vmix", "Basic HD, one-off licence")}, HD at ${h.cost("vmix", "HD, one-off licence")}, 4K at ${h.cost("vmix", "4K, one-off licence")} and Pro at ${h.cost("vmix", "Pro, one-off licence")}, each one including twelve months of free version updates. The subscription edition, vMix Max, is ${h.price("vmix", "vMix Max, monthly subscription")} and carries the same features as Pro, with free version updates while it is paid for.</p>
    <p>The ATEM family is priced per box, not per seat. The ATEM Mini Pro is ${h.cost("atem", "ATEM Mini Pro")}, the ATEM Mini Extreme ISO G2 is ${h.cost("atem", "ATEM Mini Extreme ISO G2")}, the ATEM Television Studio HD8 is ${h.cost("atem", "ATEM Television Studio HD8")}, the ATEM Television Studio 4K8 is ${h.cost("atem", "ATEM Television Studio 4K8")} and the ATEM 4 M/E Constellation 4K is ${h.cost("atem", "ATEM 4 M/E Constellation 4K")}. The listed prices are the US MSRP in dollars and include duties but exclude sales tax and shipping.</p>
    <p>${h.limit("atem", 0)} ATEM Software Control is free and may be run on unlimited computers, but it controls hardware and does not include a switcher, so the family as a whole has no free tier.</p>`,
        },
    ],
    faq: [
        {
            q: "Can I use the free ATEM Software Control without the switcher?",
            a: `No. ${h.limit("atem", 0)} ATEM Software Control is free to download and can be run on unlimited computers, but it controls hardware rather than making a show of its own.`,
        },
        {
            q: "Which one is cheaper, vMix or ATEM?",
            a: `vMix is the cheaper place to start. Its one-off licence begins at ${h.cost("vmix", "Basic HD, one-off licence")} and the subscription is ${h.cost("vmix", "vMix Max, monthly subscription")} a month. The cheapest ATEM box is the ATEM Mini Pro at ${h.cost("atem", "ATEM Mini Pro")}, and the family runs up to ${h.cost("atem", "ATEM 4 M/E Constellation 4K")}.`,
        },
        {
            q: "Does vMix run on a Mac?",
            a: `No. ${h.limit("vmix", 1)} ATEM Software Control runs on Mac and Windows, so on a Mac the ATEM is the one of the two that works on your own hardware, as long as a switcher is connected to it.`,
        },
        {
            q: "Can I try either of them before I buy?",
            a: `vMix, yes. ${h.rec("vmix").trial.limits} The ATEM family has no free tier, because the control panel needs the switcher to run.`,
        },
    ],
    related: [
        { href: "/comparison", text: "All comparisons" },
        { href: "/blog/best-music-visualizer-for-mac-2026", text: "The best music visualizer for Mac in 2026" },
    ],
});
