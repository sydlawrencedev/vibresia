// /comparison/touchdesigner-vs-vdmx
// Target query: "vdmx vs touchdesigner" (content/url-plan.csv).
// A referee page (2b): which of the two is right for the reader. Facts come
// from the records through `h`.

// Both apps together: VDMX6 Plus (which carries the TouchDesigner
// integration) and a TouchDesigner Commercial licence, summed from the records.
const tierOf = (h, slug, name) => h.rec(slug).pricing.tiers.find((t) => t.name === name);
const bothCost = (h) => {
    const plus = tierOf(h, "vdmx", "VDMX6 Plus");
    const td = tierOf(h, "touchdesigner", "Commercial");
    const total = Number(plus.price) + Number(td.price);
    const whole = Number.isInteger(total);
    return new Intl.NumberFormat("en-GB", { style: "currency", currency: plus.currency, minimumFractionDigits: whole ? 0 : 2 }).format(total);
};

export default (h) => ({
    slug: "touchdesigner-vs-vdmx",
    template: "2b",
    publishedISO: "2026-11-02",
    updatedISO: "2026-11-02",
    title: "VDMX vs TouchDesigner (2026): Which Should You Use?",
    description: "VDMX is a ready-made Mac VJ app; TouchDesigner is a node-based environment you build in. Prices, platforms and who each one suits, checked against both sites.",
    eyebrow: "VJ software compared",
    breadcrumb: "TouchDesigner vs VDMX",
    h1: "VDMX vs TouchDesigner: which should you use?",
    answer: `Pick ${h.link("vdmx")} if you want a finished VJ application for live shows on a Mac, with layers, effects and MIDI, OSC and DMX control already built. Pick ${h.link("touchdesigner")} if you want to build your own interactive or generative system from nodes, need Windows as well as macOS, or want to start free with the Non-Commercial licence. They also work together: VDMX6 Plus adds TouchDesigner integration, so you don't have to choose only one.`,
    rows: [
        { label: "What it is", value: (h, s) => h.rec(s).tagline },
        { label: "Price", value: (h, s) => h.priceCell(s) },
        { label: "Free version", value: (h, s) => h.rec(s).trial.limits },
        { label: "Runs on", value: (h, s) => h.platforms(s) },
        { label: "Requirements", value: (h, s) => h.rec(s).requirements },
        { label: "Stand-out strength", value: (h, s) => h.strength(s, 0) },
        { label: "Best for", value: (h, s) => h.rec(s).bestFor },
    ],
    verdict: {
        pickA: "you want to build your own interactive installation, live visual system or generative piece from nodes, you need Windows as well as macOS, or you want to learn for free before paying for a Commercial licence.",
        pickB: "you're a VJ on a Mac who wants a finished app for live shows: layers, blend modes, effect chains and MIDI, OSC or DMX control, ready to use rather than built from scratch.",
    },
    sections: [
        {
            h2: "Where TouchDesigner wins",
            html: `<p>TouchDesigner is ${h.rec("touchdesigner").tagline.replace(/\.$/, "")}. You don't get a finished show when you open it. You get the parts to build one, and that is its strength: it can build almost anything, as long as you build it. It suits ${h.rec("touchdesigner").bestFor.replace(/^Artists/, "artists").replace(/\.$/, "")}.</p>
    <p>It's also the easier one to start with on cost. There is ${h.strength("touchdesigner", 0).toLowerCase()}, priced at ${h.cost("touchdesigner", "Non-Commercial")}. That version is capped at 1280x1280 output and can't be used for paid work, but it lets you learn the whole way of working before you spend anything. VDMX has no free tier; its trial is fully functional except that it can't save projects.</p>
    <p>TouchDesigner runs on ${h.platforms("touchdesigner")}. If any part of your work happens on a Windows machine, that settles it, because VDMX is Mac only. ${h.strength("touchdesigner", 2)}.</p>`,
        },
        {
            h2: "Where VDMX wins",
            html: `<p>VDMX is ${h.rec("vdmx").tagline.replace(/\.$/, "")}. The live-show tools are already there when you open it, so you spend your time on the show rather than on the system that runs it. Its feature list covers:</p>
    <p><b>Compositing:</b> ${h.strength("vdmx", 0)}.<br><b>Control:</b> ${h.strength("vdmx", 1)}.<br><b>Shaders and plug-ins:</b> ${h.strength("vdmx", 2)}.<br><b>Getting video in and out:</b> ${h.strength("vdmx", 3)}.</p>
    <p>For a VJ, that list is most of a show. Audio analysis, LFOs and step sequencers are built in, and MIDI, OSC and DMX control lets you run the show from hardware or other software.</p>
    <p>It also asks less of an older Mac. VDMX needs ${h.rec("vdmx").requirements}. TouchDesigner on a Mac needs ${h.rec("touchdesigner").requirements.split(";")[0]}. And the paid version costs less: ${h.cost("vdmx", "VDMX6")} once for VDMX6, against ${h.cost("touchdesigner", "Commercial")} for a TouchDesigner Commercial licence.</p>`,
        },
        {
            h2: "Where both fall short",
            html: `<p>Neither is free for paid work. TouchDesigner's free licence rules out paid projects and caps output at 1280x1280, and its Educational licence at ${h.cost("touchdesigner", "Educational")} rules out paid work too. VDMX's trial can't save a project, so you can try it but you can't run a real show from it without buying.</p>
    <p>Neither is a quick start for someone who only wants something to look at. TouchDesigner gives you an environment to build in. VDMX gives you a full VJ rig, which still means loading clips, building layers and mapping controls before a show.</p>
    <p>And on a Mac, both need macOS 13 or later. If your Mac can't run that, neither is an option.</p>`,
        },
        {
            h2: "What it costs, and using both",
            html: `<p>On their own, VDMX6 is ${h.price("vdmx", "VDMX6")} and TouchDesigner Commercial is ${h.price("touchdesigner", "Commercial")}. TouchDesigner Pro, which adds Pro Support (6 hours), is ${h.cost("touchdesigner", "Pro")}. TouchDesigner's prices are listed as "from", and its licences are perpetual with a year of updates included. Vidvox mentions educational, hobbyist and upgrade discounts for VDMX without giving amounts.</p>
    <p>You don't have to pick only one. VDMX6 Plus, at ${h.cost("vdmx", "VDMX6 Plus")}, adds Vuo and TouchDesigner integration, so you can bring TouchDesigner work into a VDMX setup. TouchDesigner is licensed separately, so for paid work the pair comes to <b>${bothCost(h)}</b>: VDMX6 Plus plus a TouchDesigner Commercial licence. If you're still learning, the free Non-Commercial licence brings that down to the price of VDMX6 Plus alone, within its 1280x1280 cap.</p>`,
        },
    ],
    faq: [
        {
            q: "Is VDMX or TouchDesigner better for VJing?",
            a: "For a live VJ show on a Mac, VDMX gives you the tools ready-made: layers, blend modes, effect chains, and MIDI, OSC and DMX control. TouchDesigner can do live visuals too, but you build the system yourself in its node-based environment.",
        },
        {
            q: "Can VDMX and TouchDesigner work together?",
            a: "Yes. VDMX6 Plus adds Vuo and TouchDesigner integration. The plain VDMX6 licence doesn't include it, and TouchDesigner is licensed separately.",
        },
        {
            q: "Is there a free version of VDMX or TouchDesigner?",
            a: "TouchDesigner has a free Non-Commercial licence for personal use and learning, capped at 1280x1280 output and not for paid work. VDMX has no free tier, but its trial is fully functional except for saving projects.",
        },
        {
            q: "Does VDMX run on Windows?",
            a: "No. VDMX is Mac only, on macOS 13 or later with Intel or Apple silicon. TouchDesigner runs on both Windows and macOS.",
        },
    ],
    related: [
        { href: "/comparison", text: "All comparisons" },
        { href: "/blog/best-music-visualizer-for-mac-2026", text: "The best music visualizer for Mac in 2026" },
    ],
});
