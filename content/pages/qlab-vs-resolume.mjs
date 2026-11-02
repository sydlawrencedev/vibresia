// /comparison/qlab-vs-resolume
// Target query: "qlab vs resolume" (content/url-plan.csv).
// A referee page (2b): which of the two is right for the reader. Facts come
// from the records through `h`. QLab is priced in dollars and Resolume in
// euros, so they are never converted.
export default (h) => ({
    slug: "qlab-vs-resolume", template: "2b",
    publishedISO: "2026-11-02", updatedISO: "2026-11-02",
    title: "QLab vs Resolume (2026): Which for Live Shows?",
    description: "QLab or Resolume for a live show? Show control against a VJ application. Prices, what each does and who each one suits, from each maker's own pages.",
    eyebrow: "Live show compared",
    breadcrumb: "QLab vs Resolume",
    h1: "QLab vs Resolume: show control or a VJ application?",
    answer: `If you are running a designed show, where a technical director presses GO and cues fire in order across sound, video, lighting and the rest of the rig, pick ${h.link("qlab")}: Full-Featured is ${h.cost("qlab", "Full-Featured, Audio and Video and Lighting")} once, and it runs on a Mac. If you are performing video to a room, triggering clips and effects as the music goes, pick ${h.link("resolume")}: Avenue is ${h.cost("resolume", "Avenue")} and it runs on ${h.platforms("resolume")}. They overlap in one place, which is a Mac user with a rig who wants to know whether a show system or a VJ application is the right shape for the evening.`,
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
        pickA: `you are running a designed show with cues, lighting and show control, several people need to work on the same workspace, or you need video masking and edge blending across more than one screen. Full-Featured is ${h.cost("qlab", "Full-Featured, Audio and Video and Lighting")} once, and the free tier already runs audio, video and lighting cues.`,
        pickB: `you are performing video to a room, you want to trigger clips and effects rather than cue a timeline, or you need it on Windows as well as a Mac. Avenue is ${h.cost("resolume", "Avenue")} and Arena is ${h.cost("resolume", "Arena")}.`,
    },
    sections: [
        {
            h2: "Why people compare them",
            html: `<p>They are both ways of running a show on a Mac, and both end up with video on a screen in front of an audience. The difference is what happens before the show starts.</p>
    <p>${h.name("resolume")} is ${h.rec("resolume").tagline.replace(/\.$/, "").toLowerCase()}. ${h.name("qlab")} is ${h.rec("qlab").tagline.replace(/\.$/, "").toLowerCase()}. One is an application you perform from, with decks of media and effects that you trigger. The other is a workspace of cues, designed in advance, that somebody runs through.</p>`,
        },
        {
            h2: "Where QLab wins",
            html: `<p><b>It runs the whole show, not just the pictures.</b> ${h.strength("qlab", 0)}</p>
    <p><b>Several people can work on it at once.</b> ${h.strength("qlab", 1)}</p>
    <p><b>The video engine does the awkward things.</b> ${h.strength("qlab", 2)}</p>
    <p><b>The lighting side is properly done.</b> ${h.strength("qlab", 3)}</p>
    <p><b>The free tier is genuinely usable.</b> ${h.strength("qlab", 4)}</p>`,
        },
        {
            h2: "Where Resolume wins",
            html: `<p><b>It is an instrument, not a script.</b> ${h.name("resolume")} does ${h.strength("resolume", 0).replace(/^An/, "an")}. You pick the clip, you ride the fader, and the show follows the music rather than a timeline. ${h.limit("qlab", 3).charAt(0).toLowerCase() + h.limit("qlab", 3).slice(1)}</p>
    <p><b>It runs on Windows too.</b> ${h.name("resolume")} is listed for ${h.platforms("resolume")}. QLab is ${h.platforms("qlab")} only, so a booth running Windows cannot use it.</p>
    <p><b>It costs less to start with.</b> Avenue is ${h.cost("resolume", "Avenue")} against ${h.cost("qlab", "One Feature Set, Audio or Video or Lighting")} for one QLab feature set, and QLab's cheapest paid tier leaves out multi-screen video and more than 16 DMX addresses.</p>
    <p><b>You can try it for as long as you like.</b> ${h.rec("resolume").trial.limits}</p>`,
        },
        {
            h2: "Where both fall short",
            html: `<p><b>Neither is a music visualiser.</b> Both are general tools for video, and both expect you to bring the content and decide how it reacts. If what you want is visuals that react to what the Mac is playing, with nothing to prepare, that is a different job than either of these does.</p>
    <p><b>Both cap what you can drive.</b> ${h.limit("resolume", 1).charAt(0).toLowerCase() + h.limit("resolume", 1).slice(1)} And ${h.limit("qlab", 0).charAt(0).toLowerCase() + h.limit("qlab", 0).slice(1)}</p>
    <p><b>Both need the show made before the show.</b> Whichever you pick, the visuals are only as good as the material you prepared and the cues you built. Neither turns a folder of files into a performance by itself.</p>`,
        },
        {
            h2: "What it costs",
            html: `<p>QLab's licences are perpetual one-time purchases, not a subscription. One feature set is ${h.price("qlab", "One Feature Set, Audio or Video or Lighting")}, two are ${h.price("qlab", "Two Feature Sets")} and the full set is ${h.price("qlab", "Full-Featured, Audio and Video and Lighting")}, each covering installation on two computers. Site licences are ${h.price("qlab", "Site Licence, per activation")} per activation with a minimum of ten.</p>
    <p>Resolume Avenue is ${h.price("resolume", "Avenue")}, Arena is ${h.price("resolume", "Arena")} and Wire is ${h.price("resolume", "Wire")}, each a one-time purchase with 12 months of updates included, and the licence keeps working after that. QLab is priced in dollars and Resolume in euros, so the rate on the day you buy is yours to check.</p>`,
        },
    ],
    faq: [
        {
            q: "Does QLab run on Windows?",
            a: `No. ${h.rec("qlab").requirements.charAt(0).toLowerCase() + h.rec("qlab").requirements.slice(1)} Resolume runs on ${h.platforms("resolume")}, so on a Windows machine it is the one that works.`,
        },
        {
            q: "Is QLab more expensive than Resolume?",
            a: `QLab's full set is ${h.cost("qlab", "Full-Featured, Audio and Video and Lighting")} once and Resolume Avenue is ${h.cost("resolume", "Avenue")}, but they are not the same thing: QLab's price buys the audio, video and lighting licences, while Resolume's Avenue buys the VJ application. QLab's free tier already runs audio, video and lighting cues, up to two channels of audio and 16 DMX addresses.`,
        },
        {
            q: "Can I try QLab or Resolume for free?",
            a: `Yes, both. ${h.rec("qlab").trial.limits.charAt(0).toLowerCase() + h.rec("qlab").trial.limits.slice(1)} ${h.rec("resolume").trial.limits.charAt(0).toLowerCase() + h.rec("resolume").trial.limits.slice(1)}`,
        },
        {
            q: "Which one is for lighting control?",
            a: "QLab. It patches and controls fixtures over DMX using Art-Net, with instrument definitions for over 1400 fixture types from more than 60 makers, and unlimited patchable addresses on a paid licence. In Resolume, DMX output is an Arena feature rather than an Avenue one.",
        },
    ],
    related: [
        { href: "/comparison", text: "All comparisons" },
        { href: "/blog/best-music-visualizer-for-mac-2026", text: "The best music visualizer for Mac in 2026" },
    ],
});
