// /comparison/resolume-vs-vdmx
// Target query: "vdmx vs resolume" (content/url-plan.csv).
// A referee page (2b): which of the two is right for the reader. Facts come
// from the records through `h`. Resolume prices in EUR and VDMX in USD: each
// is shown in its own currency and never converted.
export default (h) => ({
    slug: "resolume-vs-vdmx", template: "2b",
    publishedISO: "2026-11-02", updatedISO: "2026-11-02",
    title: "VDMX vs Resolume (2026): Which VJ Software Should You Use?",
    description: "VDMX or Resolume for live visuals? Prices, platforms, trials and who each one suits, from each app's own site, so you can pick the right VJ software.",
    eyebrow: "VJ software compared",
    breadcrumb: "Resolume vs VDMX",
    h1: "VDMX vs Resolume: which VJ software is right for you?",
    answer: `If you play shows on Windows as well as a Mac, or you want the software many venues already run, pick ${h.link("resolume")}: Avenue is ${h.cost("resolume", "Avenue")} and Arena adds media-server features for ${h.cost("resolume", "Arena")}. If you work only on a Mac and want a modular rig you wire up yourself, with MIDI, OSC and DMX control and audio analysis, pick ${h.link("vdmx")}, from ${h.cost("vdmx", "VDMX6")}. Both are one-time purchases, and both let you try the full app before you pay.`,
    cta: "Try Vibresia free",
    connections: true,
    rows: [
        { label: "What it is", value: (h, s) => h.rec(s).tagline },
        { label: "Price", value: (h, s) => h.priceCell(s) },
        {
            label: "Other licences",
            value: (h, s) => s === "resolume"
                ? `Arena ${h.price(s, "Arena")}, Wire ${h.price(s, "Wire")}`
                : `VDMX6 Plus ${h.price(s, "VDMX6 Plus")}`,
        },
        { label: "Runs on", value: (h, s) => h.rec(s).requirements ? `${h.platforms(s)} (${h.rec(s).requirements})` : h.platforms(s) },
        { label: "Before you pay", value: (h, s) => h.rec(s).trial.limits },
        { label: "Known for", value: (h, s) => h.strength(s, 0) },
        { label: "Best for", value: (h, s) => h.rec(s).bestFor },
    ],
    verdict: {
        pickA: `you play on both macOS and Windows, you want the tool a lot of venues and VJs already know, or you need media-server features, which come with Arena at ${h.cost("resolume", "Arena")}. Avenue at ${h.cost("resolume", "Avenue")} covers VJing on its own.`,
        pickB: `you work only on a Mac and like building your own setup: layers, FX chains, MIDI, OSC and DMX control, audio analysis, LFOs and step sequencers. It starts at ${h.cost("vdmx", "VDMX6")}, and ${h.cost("vdmx", "VDMX6 Plus")} adds Vuo and TouchDesigner integration.`,
    },
    sections: [
        {
            h2: "Where Resolume wins",
            html: `<p><b>It runs on Windows as well as macOS.</b> ${h.name("resolume")} is listed for ${h.platforms("resolume")}. If your show laptop is a PC, or you swap between machines at different venues, that settles it. VDMX is for ${h.platforms("vdmx")} only.</p>
    <p><b>It's the common choice.</b> It is ${h.strength("resolume", 0).charAt(0).toLowerCase() + h.strength("resolume", 0).slice(1)}. Its stated audience is working VJs and venues running video on screens and projectors. Picking the tool a venue already uses can make a handover or a shared booth easier.</p>
    <p><b>Clear tiers for different jobs.</b> Avenue (${h.cost("resolume", "Avenue")}) is the VJ app. Arena (${h.cost("resolume", "Arena")}) adds media-server features for bigger rooms. Wire (${h.cost("resolume", "Wire")}) is a separate visual programming tool, for building your own effects and generators. Each licence includes 12 months of updates, and the licence keeps working once those 12 months are up.</p>
    <p><b>Arena is where the show features live.</b> Projection mapping, edge blending, SMPTE timecode input, DMX control, capture card output, and groups and slice transforms are Arena only, so a rig that needs any of them needs Arena rather than Avenue. Wire, if you want to build your own generators, adds MIDI and OSC nodes and reads and writes Syphon and Spout textures inside a patch.</p>`,
        },
        {
            h2: "Where VDMX wins",
            html: `<p><b>A lower starting price.</b> ${h.name("vdmx")}'s main licence, VDMX6, is ${h.price("vdmx", "VDMX6")}. Vidvox also mentions educational, hobbyist and upgrade discounts, though it doesn't list the amounts.</p>
    <p><b>A modular rig you build yourself.</b> It does ${h.strength("vdmx", 0).charAt(0).toLowerCase() + h.strength("vdmx", 0).slice(1)}. Control comes from MIDI, OSC and DMX, and it can drive parameters from audio analysis, LFOs and step sequencers. That suits people who want to design how their show behaves rather than use a fixed layout.</p>
    <p><b>Open formats and links to other software.</b> It runs ISF (GLSL) generators and effects alongside FFGL and Vuo. It takes video in and sends it out over Syphon and NDI, drives fullscreen displays, and records to disk. VDMX6 Plus, at ${h.cost("vdmx", "VDMX6 Plus")}, adds Vuo and TouchDesigner integration. TouchDesigner itself is licensed separately.</p>
    <p><b>Both wire into the same things.</b> MIDI in and out, OSC in and out, Syphon, NDI and video all work in both, so either one drops into a rig that already has them. DMX is the one place they differ: VDMX sends and receives DMX over Art-Net to and from multiple universes as standard, while in Resolume DMX output is an Arena feature. Resolume has Spout for Windows and Syphon for macOS; VDMX is macOS only, so it has no Spout.</p>
    <p>The other difference is how many screens each one can drive. Resolume's outputs are limited by the graphics card, to five outputs and a control monitor, and VDMX's are limited by the display ports on the Mac, so extra screens usually need a splitter or a video wall processor.</p>
    <p><b>A trial without a watermark.</b> The VDMX trial is fully functional except that you can't save projects. You can judge the output exactly as an audience would see it.</p>`,
        },
        {
            h2: "Where both fall short",
            html: `<p><b>Neither is free.</b> Both are paid, one-time purchases, and neither has a free tier. Expect to spend ${h.cost("vdmx", "VDMX6")} at the low end for VDMX and ${h.cost("resolume", "Avenue")} for Resolume.</p>
    <p><b>Both trials hold something back.</b> Resolume is free to use for as long as you like, but its video output carries a Resolume watermark and its audio has a robot voice until you enter a serial number. That's fine for practice and not for a paying show. VDMX's trial won't save projects, so you can't build a set over several days and keep it without buying.</p>
    <p><b>The extras cost extra.</b> On Resolume, media-server features mean Arena rather than Avenue, and Wire is a separate purchase. On VDMX, Vuo and TouchDesigner integration means the Plus licence, and TouchDesigner needs its own licence on top.</p>
    <p><b>Both ask something of your machine.</b> Resolume's number of outputs is capped by the graphics card, at five outputs and a control monitor, and a registered licence on a machine that stays offline has to check in every 30 days, or the watermark comes back. VDMX's outputs are capped by the display ports on the Mac, and playback runs through AVFoundation, so AV1 files cannot be played and h.264 stops at 4k.</p>`,
        },
        {
            h2: "What it costs",
            html: `<p>Prices are as listed on each shop, in the currency each one sells in. We haven't converted them, because the price you pay depends on your own bank's rate and any local tax.</p>
    <p>A Mac-only VJ wanting the basic app: Resolume Avenue is ${h.cost("resolume", "Avenue")}; VDMX6 is ${h.cost("vdmx", "VDMX6")}. A VJ wanting more: Resolume Arena is ${h.cost("resolume", "Arena")}, and VDMX6 Plus is ${h.cost("vdmx", "VDMX6 Plus")}. Those two upgrades add different things, media-server features on one and Vuo and TouchDesigner integration on the other, so compare what you need rather than the totals. Every Resolume licence includes 12 months of updates and keeps working after them.</p>`,
        },
    ],
    faq: [
        {
            q: "Is VDMX cheaper than Resolume?",
            a: `At the entry level, VDMX6 is ${h.cost("vdmx", "VDMX6")} and Resolume Avenue is ${h.cost("resolume", "Avenue")}. They're priced in different currencies, so check the rate on the day you buy.`,
        },
        {
            q: "Does VDMX run on Windows?",
            a: `No. VDMX needs ${h.rec("vdmx").requirements}. Resolume runs on ${h.platforms("resolume")}.`,
        },
        {
            q: "Can I try Resolume and VDMX for free?",
            a: `Yes, both. ${h.rec("resolume").trial.limits} The VDMX trial is fully functional except saving projects.`,
        },
        {
            q: "Do Resolume licences stop working after a year?",
            a: "No. Each licence includes 12 months of updates, and it keeps working after those 12 months end.",
        },
    ],
    related: [
        { href: "/comparison", text: "All comparisons" },
        { href: "/blog/best-music-visualizer-for-mac-2026", text: "The best music visualizer for Mac in 2026" },
    ],
});
