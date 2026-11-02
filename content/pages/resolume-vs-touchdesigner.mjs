// /comparison/resolume-vs-touchdesigner
// Target query: "resolume vs touchdesigner" (content/url-plan.csv).
// A referee page (2b): which of the two is right for the reader. Facts come
// from the records through `h`. Resolume prices are EUR and TouchDesigner's
// USD, as the records list them: never converted.
export default (h) => ({
    slug: "resolume-vs-touchdesigner", template: "2b",
    publishedISO: "2026-11-02", updatedISO: "2026-11-02",
    title: "Resolume vs TouchDesigner (2026): Which Should You Use?",
    description: "Resolume is a VJ application; TouchDesigner is a node-based programming environment. Prices, free versions and who each one suits.",
    eyebrow: "Resolume vs TouchDesigner",
    breadcrumb: "Resolume vs TouchDesigner",
    h1: "Resolume vs TouchDesigner: a VJ application or a programming environment?",
    answer: `Pick ${h.link("resolume")} if you want a ready-made VJ application for playing video to screens and projectors at a gig or a venue. Pick ${h.link("touchdesigner")} if you want to build your own live visuals, installations or interactive pieces from nodes, and don't mind building before anything plays. They're different kinds of tool, but both are used for live visuals, which is why people starting out often weigh one against the other.`,
    cta: "Try Vibresia free",
    rows: [
        { label: "What it is", value: (h, s) => h.rec(s).tagline },
        { label: "Best for", value: (h, s) => h.rec(s).bestFor },
        { label: "Price", value: (h, s) => h.priceCell(s) },
        { label: "Free version", value: (h, s) => h.rec(s).trial.limits },
        { label: "Runs on", value: (h, s) => h.platforms(s) },
        { label: "Licence", value: (h, s) => h.strength(s, 2) },
    ],
    verdict: {
        pickA: `you perform video to a room: a club, a stage, a venue's screens. Avenue (${h.cost("resolume", "Avenue")}) is the VJ application, and Arena (${h.cost("resolume", "Arena")}) adds media-server features. You start with an application that is already built for the job.`,
        pickB: `you want to build the thing itself: an interactive installation, generative work, or a live visual system of your own design. The Non-Commercial licence is free for personal use and learning, so you can find out whether node-based work suits you before you pay anything.`,
    },
    sections: [
        {
            h2: "Why people compare them",
            html: `<p>On paper these two shouldn't meet. Resolume is VJ and media-server software. TouchDesigner is Derivative's node-based visual programming environment for real-time interactive media. One is an application you perform with; the other is an environment you build in.</p>
    <p>They meet because of what people want to make. Both are used for live visuals, and someone starting out often has one question: which do I learn? The honest answer depends on whether you want to play visuals or make the system that plays them.</p>`,
        },
        {
            h2: "Where Resolume wins",
            html: `<p><b>It's made for the gig.</b> Resolume is for working VJs and venues running video on screens and projectors. Avenue and Arena are ${h.strength("resolume", 0).replace(/^An/, "an")}. If your job is to turn up and run visuals for a night, you start with an application built around that job, not an empty project.</p>
    <p><b>You can add your own tools later.</b> Resolume also sells Wire, a visual programming tool for building your own effects and generators. It's a separate licence at ${h.cost("resolume", "Wire")}, so you can start with Avenue and add Wire if you find you want to build.</p>
    <p><b>You can try it for as long as you like.</b> Resolume is free to use indefinitely. The catch is that video output has a Resolume watermark and audio has a robot voice until you enter a serial number. That's enough to learn the software, not to play a paid show.</p>`,
        },
        {
            h2: "Where TouchDesigner wins",
            html: `<p><b>It can be almost anything.</b> TouchDesigner is for artists and developers building interactive installations, live visuals and generative work. You put together your own system from nodes, so you're not limited to what an application's designers chose to include.</p>
    <p><b>It's free to learn properly.</b> The Non-Commercial licence is ${h.cost("touchdesigner", "Non-Commercial")} for personal use and learning. Its limits are that it isn't for paid work and output is capped at 1280x1280. For many people learning at home, that's enough for a long time.</p>
    <p><b>There's a licence for each stage.</b> After Non-Commercial there's Educational at ${h.cost("touchdesigner", "Educational")}, Commercial at ${h.cost("touchdesigner", "Commercial")} for paid projects, and Pro at ${h.cost("touchdesigner", "Pro")}, which adds six hours of Pro Support. Derivative lists these as "from" prices.</p>`,
        },
        {
            h2: "Where both fall short",
            html: `<p><b>Paid work costs money with either.</b> Neither has a free option you can use for a paid job. Resolume's free version watermarks the video, and TouchDesigner's free licence rules out paid work. The cheapest paid route is ${h.cost("resolume", "Avenue")} for Avenue or ${h.cost("touchdesigner", "Commercial")} for TouchDesigner Commercial.</p>
    <p><b>Updates run out.</b> Both sell perpetual licences, which is good: you own what you paid for. But Resolume includes 12 months of updates and TouchDesigner a year. After that, the software keeps working, but new versions aren't included.</p>
    <p><b>Neither is a shortcut.</b> Resolume gives you an application, but you still bring the content and run the show. TouchDesigner gives you the parts, and you build the rest. Either way, the visuals are only as good as the work you put in.</p>
    <p><b>Only Mac and Windows.</b> Both list macOS and Windows and nothing else. TouchDesigner on a Mac needs ${h.rec("touchdesigner").requirements.split(";")[0]}.</p>`,
        },
        {
            h2: "What it costs",
            html: `<p>Take someone who wants to start doing paid visuals work. With Resolume, Avenue is ${h.price("resolume", "Avenue")}, and Arena is ${h.price("resolume", "Arena")} if the work needs media-server features. Adding Wire to build your own effects is another ${h.cost("resolume", "Wire")}. With TouchDesigner, they can learn on the free Non-Commercial licence first, then pay ${h.price("touchdesigner", "Commercial")} for Commercial when the first paid project arrives.</p>
    <p>Resolume lists its prices in euros and Derivative in US dollars, so we've left both as listed rather than convert them. Check each shop on the day you buy.</p>`,
        },
    ],
    faq: [
        {
            q: "Is Resolume or TouchDesigner better for beginners?",
            a: "It depends on what you want to do. If you want to perform video at events, Resolume gives you a VJ application from the start. If you want to build your own visual systems, TouchDesigner's free Non-Commercial licence lets you learn without paying.",
        },
        {
            q: "Is TouchDesigner free?",
            a: "The Non-Commercial licence is free for personal use and learning. It isn't for paid work and output is capped at 1280x1280. Paid work needs a Commercial or Pro licence.",
        },
        {
            q: "Is Resolume free?",
            a: "You can use it free indefinitely, but video output has a Resolume watermark and audio has a robot voice until you enter a serial number. Avenue and Arena are one-time purchases.",
        },
        {
            q: "Do Resolume and TouchDesigner run on a Mac?",
            a: "Yes, both run on macOS and Windows. TouchDesigner on a Mac needs macOS 13 or later on a 2020-or-later Mac, and Derivative highly recommends Apple silicon.",
        },
    ],
    related: [
        { href: "/comparison", text: "All comparisons" },
        { href: "/blog/best-music-visualizer-for-mac-2026", text: "The best music visualizer for Mac in 2026" },
    ],
});
