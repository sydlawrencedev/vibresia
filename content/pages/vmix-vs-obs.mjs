// /comparison/vmix-vs-obs
// Target query: "vmix vs obs" (content/url-plan.csv).
// A referee page (2b): which of the two is right for the reader. Facts come
// from the records through `h`. Both products are priced in dollars, so there
// is nothing to convert. The pair did not opt in to a third option, so
// Vibresia is not mentioned anywhere in the body.
export default (h) => ({
    slug: "vmix-vs-obs", template: "2b",
    publishedISO: "2026-11-02", updatedISO: "2026-11-02",
    title: "vMix vs OBS Studio (2026): Which for Live Video?",
    description: "vMix or OBS Studio for live video? One is a paid Windows switcher, the other is free streaming software on three platforms. Prices and who each suits.",
    eyebrow: "Live video compared",
    breadcrumb: "vMix vs OBS Studio",
    h1: "vMix vs OBS Studio: a paid Windows switcher or free streaming software?",
    answer: `If you want to record and stream live video without paying for software, pick ${h.link("obs")}: it is free and open source and it runs on Mac, Windows and Linux. If you are running a multi-camera production on a Windows PC and want switching, recording and streaming in one application, pick ${h.link("vmix")}, which starts at ${h.cost("vmix", "Basic HD, one-off licence")} for a one-off licence and has no macOS version at all. Where the two meet is a live stream that needs a proper production switcher, and there the machine in front of you and the budget behind it settle the answer.`,
    cta: "Try Vibresia free",
    connections: true,
    rows: [
        { label: "What it is", value: (h, s) => h.rec(s).tagline },
        { label: "Price", value: (h, s) => h.priceCell(s) },
        { label: "Runs on", value: (h, s) => h.platforms(s) },
        { label: "Requirements", value: (h, s) => h.rec(s).requirements },
        { label: "Free version", value: (h, s) => h.rec(s).trial ? h.rec(s).trial.limits : "Free, with every feature, and the source published" },
        { label: "Known for", value: (h, s) => h.strength(s, 0) },
        { label: "Best for", value: (h, s) => h.rec(s).bestFor },
    ],
    verdict: {
        pickA: `you are running a multi-camera production on a Windows PC and want switching, recording, streaming and instant replay in one application. vMix mixes cameras, capture cards and network sources, sends its output to other machines over NDI, and the full feature set is ${h.price("vmix", "vMix Max, monthly subscription")} on the vMix Max subscription.`,
        pickB: `you want the same application on a Mac, Windows and Linux, or you would rather not pay for software at all. OBS Studio costs nothing, its source is published, and every feature is included.`,
    },
    sections: [
        {
            h2: "Why people compare them",
            html: `<p>They come up together because both take several sources, let you switch between them, and send the result out as a recording or a live stream. ${h.name("vmix")} is ${h.rec("vmix").tagline.replace(/^A /, "a ").replace(/\.$/, "")}. ${h.name("obs")} is ${h.rec("obs").tagline.charAt(0).toLowerCase() + h.rec("obs").tagline.slice(1).replace(/\.$/, "")}.</p>
    <p>The difference that settles most comparisons is not the feature list. vMix runs on Windows and nothing else, while OBS Studio runs on ${h.platforms("obs")}. One of them is paid and the other is free.</p>
    <p>Both are production tools rather than performers: you set up your sources, choose where the output goes, and then let it run. Neither one turns music into pictures by itself, and both expect you to bring the content.</p>`,
        },
        {
            h2: "Where vMix wins",
            html: `<p><b>It handles the sources and the output together.</b> ${h.strength("vmix", 0)}</p>
    <p><b>It can send its output to more than one machine.</b> ${h.strength("vmix", 1)}</p>
    <p><b>It does more than switch.</b> ${h.strength("vmix", 2)}</p>
    <p><b>Control from the desk is built in.</b> ${h.io("vmix", "midi").text} ${h.strength("vmix", 4)}</p>
    <p><b>The trial runs the paid edition.</b> ${h.rec("vmix").trial.limits}</p>
    <p><b>It names the machine it expects.</b> vMix's stated requirements: ${h.rec("vmix").requirements}</p>`,
        },
        {
            h2: "Where OBS Studio wins",
            html: `<p><b>There is no paid tier to move up to.</b> ${h.strength("obs", 4)}</p>
    <p><b>The same application runs on all three systems.</b> ${h.strength("obs", 1)}</p>
    <p><b>Scenes come with filters, a mixer and hotkeys.</b> ${h.strength("obs", 0)}</p>
    <p><b>Other programs can drive it.</b> ${h.strength("obs", 2)}</p>
    <p><b>There is a mode for rehearsing.</b> ${h.strength("obs", 3)}</p>
    <p><b>The result goes out in several ways.</b> ${h.io("obs", "video").text}</p>
    <p><b>It reads Syphon video on a Mac.</b> ${h.io("obs", "syphon").text}</p>`,
        },
        {
            h2: "Where both fall short",
            html: `<p><b>Neither is ready the moment you open it.</b> OBS Studio wants its scenes, its sources and its encoder chosen. On a Mac, ${h.limit("obs", 1).replace(/^On macOS, OBS Studio /, "OBS Studio ")} vMix wants its inputs and outputs set up as well.</p>
    <p><b>The connections are where they differ most.</b> vMix has MIDI in and out and NDI in and out built in, and the control interfaces its documentation lists are an HTTP web API and a TCP API on port 8099. No OSC reference appears in the vMix 29 user guide, and neither the vMix feature list nor that guide mentions DMX or lighting control. OBS Studio has no built-in MIDI source, filter or action, no NDI support of its own, no Spout support and no DMX support of its own: each of those comes from a community plug-in.</p>
    <p><b>Both ask for a machine that can keep up.</b> ${h.limit("obs", 3)} vMix's stated requirements: ${h.rec("vmix").requirements}</p>
    <p><b>Neither is a music visualiser.</b> Both are general tools for video, and both expect you to bring the content. If what you want is pictures that react to what the Mac is playing, with nothing to prepare, that is a different job from either of these.</p>`,
        },
        {
            h2: "What it costs",
            html: `<p>vMix charges in US dollars, and the one-off licences are Basic HD at ${h.cost("vmix", "Basic HD, one-off licence")}, HD at ${h.cost("vmix", "HD, one-off licence")}, 4K at ${h.cost("vmix", "4K, one-off licence")} and Pro at ${h.cost("vmix", "Pro, one-off licence")}, each one including twelve months of free version updates. The subscription edition, vMix Max, is ${h.price("vmix", "vMix Max, monthly subscription")} and carries the same features as Pro, with free version updates while it is paid for.</p>
    <p>${h.limit("vmix", 0)}</p>
    <p>OBS Studio costs nothing. Its licence is the GNU General Public License version 2, and every feature is included. The add-ons that give it NDI, Spout, DMX and MIDI are maintained by other people, so they depend on those projects rather than on OBS Studio itself.</p>`,
        },
    ],
    faq: [
        {
            q: "Does vMix run on a Mac?",
            a: `No. ${h.limit("vmix", 1)} OBS Studio runs on ${h.platforms("obs")}, so it is the one of the two that runs on a Mac.`,
        },
        {
            q: "Which one is cheaper?",
            a: `OBS Studio. It is free with every feature included and its source is published. vMix starts at ${h.cost("vmix", "Basic HD, one-off licence")} for a one-off licence, with one-off licences at ${h.cost("vmix", "HD, one-off licence")}, ${h.cost("vmix", "4K, one-off licence")} and ${h.cost("vmix", "Pro, one-off licence")} for the higher editions, and vMix Max at ${h.price("vmix", "vMix Max, monthly subscription")}.`,
        },
        {
            q: "Can I try vMix before I pay for it?",
            a: `Yes. ${h.rec("vmix").trial.limits} OBS Studio needs no trial, because it is free from the start.`,
        },
        {
            q: "Can OBS Studio do MIDI, NDI or DMX?",
            a: `Not on its own. ${h.io("obs", "midi").text} ${h.io("obs", "ndi").text} ${h.io("obs", "dmx").text} vMix takes MIDI in and sends MIDI out, and receives NDI and sends it back, with no plug-in to install.`,
        },
    ],
    related: [
        { href: "/comparison", text: "All comparisons" },
        { href: "/blog/best-music-visualizer-for-mac-2026", text: "The best music visualizer for Mac in 2026" },
    ],
});
