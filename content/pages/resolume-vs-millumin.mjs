// /comparison/resolume-vs-millumin
// Target query: "resolume vs millumin" (content/url-plan.csv).
// A referee page (2b): which of the two is right for the reader. Facts come
// from the records through `h`. Both are priced in euros, so they are never
// converted.
export default (h) => ({
    slug: "resolume-vs-millumin", template: "2b",
    publishedISO: "2026-11-02", updatedISO: "2026-11-02",
    title: "Resolume vs Millumin (2026): Which for Live Shows?",
    description: "Resolume or Millumin for a live show? A VJ application against a media server and show sequencer. Prices, platforms and who each one suits.",
    eyebrow: "Live video compared",
    breadcrumb: "Resolume vs Millumin",
    h1: "Resolume vs Millumin: a VJ application or a show sequencer?",
    answer: `If you are performing video from a laptop, picking it as you go, pick ${h.link("resolume")}: Avenue is ${h.cost("resolume", "Avenue")} and it is an application for playing decks of media and effects. If you are running a show with prepared media, cues, projectors and lighting, pick ${h.link("millumin")}, which is a media server and a timeline at ${h.cost("millumin", "Lifetime licence, one seat")} for a lifetime licence. One is a performer, the other is a control desk, and the show you are running decides which you need.`,
    cta: "Try Vibresia free",
    connections: true,
    rows: [
        { label: "What it is", value: (h, s) => h.rec(s).tagline },
        { label: "Price", value: (h, s) => h.priceCell(s) },
        { label: "Runs on", value: (h, s) => h.platforms(s) },
        { label: "Requirements", value: (h, s) => h.rec(s).requirements },
        { label: "Free version", value: (h, s) => h.rec(s).trial.limits },
        { label: "Known for", value: (h, s) => h.strength(s, 0) },
        { label: "Best for", value: (h, s) => h.rec(s).bestFor },
    ],
    verdict: {
        pickA: `you are performing video in front of people and want to trigger clips and effects as you go, you want to work on Windows as well as a Mac, or you would rather not sit in front of a timeline. Avenue is ${h.cost("resolume", "Avenue")}.`,
        pickB: `you are running a show with prepared media, cues to fire in order, projectors to drive and lighting to control, and you want the whole thing on a timeline you can hand to a technician. It is Mac only.`,
    },
    sections: [
        {
            h2: "Why people compare them",
            html: `<p>They both end up in the same rack, driving screens in a theatre or a club, and they get compared because both are paid and both are for shows. But they sit at different points in the evening.</p>
    <p>${h.name("resolume")} is ${h.rec("resolume").tagline.replace(/\.$/, "").toLowerCase()}. ${h.name("millumin")} is ${h.rec("millumin").tagline.replace(/\.$/, "").toLowerCase()}. If you are the artist on the night, you are in the first. If you are running the show and handing it over, you are in the second.</p>`,
        },
        {
            h2: "Where Resolume wins",
            html: `<p><b>It is built to be played.</b> ${h.name("resolume")} does ${h.strength("resolume", 0).replace(/^An/, "an")}. You trigger clips and effects as the music goes, rather than cueing a timeline.</p>
    <p><b>It runs on Windows as well as macOS.</b> ${h.name("resolume")} is listed for ${h.platforms("resolume")}. Millumin is ${h.platforms("millumin")} only, and its maker says a Windows version is a very large project that is not a priority, so a Windows show has to use MilluNode, the separate player that carries video and nothing else.</p>
    <p><b>You can try it for as long as you like.</b> Resolume is free to use indefinitely. The catch is that video output has a Resolume watermark and audio has a robot voice until you enter a serial number.</p>`,
        },
        {
            h2: "Where Millumin wins",
            html: `<p><b>It is a show sequencer.</b> ${h.strength("millumin", 2)}, so a show is written as columns of cues that launch in order and can be handed to a technician.</p>
    <p><b>Mapping and lighting are in the same place as the video.</b> ${h.strength("millumin", 3)}, and it drives DMX fixtures, LED strips and ILDA lasers from the same timeline as the pictures.</p>
    <p><b>It goes further with the picture.</b> ${h.strength("millumin", 1)}, and it can send the output to capture cards, to Syphon, to NDI and out as an RTMP stream, with Warp and other tools for fitting video to a surface.</p>
    <p><b>The trial is a real trial.</b> ${h.rec("millumin").trial.limits}</p>`,
        },
        {
            h2: "Where both fall short",
            html: `<p><b>Both need the show made first.</b> Whichever you pick, the visuals are only as good as the material you prepared and the cues you built. Neither turns a folder of files into a performance by itself.</p>
    <p><b>Both take something away for free.</b> ${h.rec("resolume").trial.limits} ${h.limit("millumin", 0)}</p>
    <p><b>Neither is a music visualiser.</b> Both are general tools for video, and both expect you to bring the content and decide how it reacts. If what you want is visuals that react to what the Mac is playing, with nothing to prepare, that is a different job than either of these does.</p>`,
        },
        {
            h2: "What it costs",
            html: `<p>Resolume Avenue is ${h.price("resolume", "Avenue")}, Arena is ${h.price("resolume", "Arena")} and Wire is ${h.price("resolume", "Wire")}, each a one-time purchase with 12 months of updates included, and the licence keeps working after that.</p>
    <p>Millumin is ${h.price("millumin", "Lifetime licence, one seat")} for a lifetime licence on one computer, and ${h.price("millumin", "Upgrade to V5, or an extra seat")} for an upgrade to V5 or an extra seat. Rental licences are also sold: 29 euros for 7 days, 69 euros for 30 days and 199 euros for a year, and any version of Millumin can be used with them. Both are priced in euros, so the rate on the day you buy is yours to check.</p>`,
        },
    ],
    faq: [
        {
            q: "Is Millumin cheaper than Resolume?",
            a: `Millumin is ${h.cost("millumin", "Lifetime licence, one seat")} for a lifetime licence on one computer, plus ${h.cost("millumin", "Upgrade to V5, or an extra seat")} for an upgrade or an extra seat. Resolume Avenue is ${h.cost("resolume", "Avenue")}. Millumin's figures are per computer and rise with the number of seats.`,
        },
        {
            q: "Does Millumin run on Windows?",
            a: `No. ${h.limit("millumin", 1)} On Windows, Millumin's separate MilluNode player carries video, and ${h.limit("millumin", 2)}`,
        },
        {
            q: "Which one is better for lighting control?",
            a: "Millumin. It takes DMX over Art-Net, sACN and USB DMX, and drives fixtures, LED strips and ILDA lasers from the same timeline as the video. In Resolume, DMX output and fixture control are Arena features rather than Avenue ones.",
        },
        {
            q: "Can I try Resolume or Millumin for free?",
            a: `Yes, both. ${h.rec("resolume").trial.limits} Millumin's trial runs for 30 days with no limitation, after which white lines are watermarked onto the outputs.`,
        },
    ],
    related: [
        { href: "/comparison", text: "All comparisons" },
        { href: "/blog/best-music-visualizer-for-mac-2026", text: "The best music visualizer for Mac in 2026" },
    ],
});
