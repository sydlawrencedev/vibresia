// /comparison/houdini-vs-touchdesigner
// Target query: "houdini vs touchdesigner" (content/url-plan.csv).
// A referee page (2b): which of the two is right for the reader. Facts come
// from the records through `h`. Both are priced in dollars, so there is
// nothing to convert.

// A fact the record writes as a sentence, used in the middle of one.
const lower = (s) => s.charAt(0).toLowerCase() + s.slice(1);

export default (h) => ({
    slug: "houdini-vs-touchdesigner", template: "2b",
    publishedISO: "2026-11-02", updatedISO: "2026-11-02",
    title: "Houdini vs TouchDesigner (2026): Which for Live Visuals?",
    description: "Houdini or TouchDesigner for live visuals? A procedural 3D system against a real-time node environment. Prices, connections, hardware and who each one suits.",
    eyebrow: "Creative tools compared",
    breadcrumb: "Houdini vs TouchDesigner",
    h1: "Houdini vs TouchDesigner: a 3D pipeline or a live environment?",
    answer: `Pick ${h.link("houdini")} if you are building procedural 3D for film, TV or games and need simulation, USD look development and rendering, because Houdini writes its video out as files rather than sending a live feed. Pick ${h.link("touchdesigner")} if you are building a live or interactive visual system that has to answer MIDI, OSC, DMX, NDI or a camera while it runs, because TouchDesigner sends and receives all of those in the box. Both are node-based, both run on macOS and Windows, and each one has a free edition, but they ask for different hardware and their free versions are limited in different ways.`,
    cta: "Try Vibresia free",
    connections: true,
    rows: [
        { label: "What it is", value: (h, s) => h.rec(s).tagline },
        { label: "Price", value: (h, s) => h.priceCell(s) },
        { label: "Runs on", value: (h, s) => h.platforms(s) },
        { label: "Requirements", value: (h, s) => h.rec(s).requirements },
        { label: "Free version", value: (h, s) => s === "houdini" ? "No time-limited trial; Apprentice is free for non-commercial work, capped at 1920 by 1080" : h.rec(s).trial.limits },
        { label: "Known for", value: (h, s) => h.strength(s, 0) },
        { label: "Best for", value: (h, s) => h.rec(s).bestFor },
    ],
    verdict: {
        pickA: `you are a technical artist or a studio that needs procedural geometry, simulation and USD for film, TV or games, and you want that pipeline in one application. A Houdini Core perpetual workstation licence is ${h.cost("houdini", "Houdini Core, perpetual workstation licence")} and Houdini FX is ${h.cost("houdini", "Houdini FX, perpetual workstation licence")}.`,
        pickB: `you are building an interactive installation, a live visual system or generative work that has to respond to controllers, lighting desks, cameras and other software while it runs. The Non-Commercial licence is free for personal use and learning, and a Commercial licence is ${h.cost("touchdesigner", "Commercial")}.`,
    },
    sections: [
        {
            h2: "Why people compare them",
            html: `<p>They look like the same idea and they are not. ${h.name("houdini")} is ${h.rec("houdini").tagline.replace(/^A /, "a ").replace(/\.$/, "")}, and ${h.name("touchdesigner")} is ${h.rec("touchdesigner").tagline.replace(/\.$/, "")}.</p>
    <p>The difference is what each one is for. Houdini makes finished 3D images: geometry, simulation, look development and a render written out as a file. TouchDesigner makes systems that keep running, taking input from a controller, a camera or a lighting desk and putting something on the screen while it happens.</p>
    <p>They get compared because the way of working is the same. In both, you wire nodes together and the network is the project, so a change made deep in the graph alters everything downstream, and in both the graph has to be built before anything appears.</p>
    <p>Two other differences are worth knowing before you start. Houdini runs on ${h.platforms("houdini")}. TouchDesigner runs on ${h.platforms("touchdesigner")}. And each asks for a recent Apple silicon Mac: Houdini needs ${lower(h.rec("houdini").requirements)}, while TouchDesigner needs ${h.rec("touchdesigner").requirements.split(";")[0]}.</p>`,
        },
        {
            h2: "Where Houdini wins",
            html: `<p><b>The simulation library is the reason studios buy it.</b> ${h.strength("houdini", 1)}.</p>
    <p><b>Look development stays in the same scene.</b> ${h.strength("houdini", 3)}.</p>
    <p><b>What you build can leave Houdini.</b> ${h.strength("houdini", 2)}.</p>
    <p><b>It is node-based all the way down.</b> ${h.strength("houdini", 0)}.</p>
    <p><b>It is the one that runs on Linux.</b> Houdini runs on ${h.platforms("houdini")}, and TouchDesigner runs on ${h.platforms("touchdesigner")}.</p>
    <p><b>The free edition is the whole application.</b> Apprentice is a free build of Houdini FX for personal non-commercial projects, so you can learn the solvers and the USD tools without paying anything for them.</p>`,
        },
        {
            h2: "Where TouchDesigner wins",
            html: `<p><b>The connections are in the box.</b> ${h.io("touchdesigner", "midi").text} ${h.io("touchdesigner", "osc").text} NDI is built in as native operators, the NDI In TOP, NDI Out TOP and NDI DAT, using the NDI SDK bundled with each build, and ${lower(h.io("touchdesigner", "dmx").text)}</p>
    <p><b>It can share its textures with other applications.</b> ${h.io("touchdesigner", "syphon").text} ${h.io("touchdesigner", "spout").text}</p>
    <p><b>Video goes in and out while it runs.</b> ${h.io("touchdesigner", "video").text}</p>
    <p><b>It costs less to buy.</b> ${h.strength("touchdesigner", 0)}. ${h.strength("touchdesigner", 1)}. ${h.strength("touchdesigner", 2)}.</p>`,
        },
        {
            h2: "Where both fall short",
            html: `<p><b>Neither plays by itself.</b> Both are environments you build in, and both expect you to bring the content and decide how it reacts.</p>
    <p><b>Both free editions are limited, in different ways.</b> ${h.limit("houdini", 0)} ${h.limit("houdini", 1)} ${h.rec("touchdesigner").trial.limits} ${h.limit("touchdesigner", 2)}</p>
    <p><b>Both want a recent Mac.</b> Houdini needs ${lower(h.rec("houdini").requirements)}. TouchDesigner needs ${h.rec("touchdesigner").requirements}.</p>
    <p><b>Neither is a music visualiser.</b> Houdini's output is a rendered file and TouchDesigner's output is a network of nodes you have to build, so in both cases the reacting to the sound is your work rather than the product's. If what you want is pictures that move with the music while it plays, that is a different job from either of these.</p>
    <p><b>There are limits that are easy to miss.</b> ${h.limit("touchdesigner", 0)} ${h.limit("houdini", 3)}</p>`,
        },
        {
            h2: "What it costs",
            html: `<p>Houdini's free edition is Apprentice, and there is no time-limited trial. Apprentice is a free Houdini FX build for personal non-commercial projects, restricted to 1920x1080 renders and watermarked outside .picnc, and it runs on a licence that renews every thirty days and needs an internet connection once a month.</p>
    <p>Paid, a Houdini Core perpetual workstation licence is ${h.price("houdini", "Houdini Core, perpetual workstation licence")} and Houdini FX is ${h.price("houdini", "Houdini FX, perpetual workstation licence")}. The Indie subscription is ${h.price("houdini", "Houdini Indie, annual subscription")}, and Houdini Education, which covers students, schools and training centres, is ${h.price("houdini", "Houdini Education, annual global access")}. SideFX also lists a Houdini Core annual workstation rental at 1,475 dollars, monthly local access rentals from 370 dollars for Core and 910 dollars for FX, a two-year Indie workstation subscription at 449 dollars, and Houdini Engine licences from 525 dollars a year, and it says prices vary by currency and region.</p>
    <p>TouchDesigner is the cheaper of the two. Its Non-Commercial licence is free for personal use and learning, Educational is ${h.price("touchdesigner", "Educational")}, Commercial is ${h.price("touchdesigner", "Commercial")} for paid projects, and Pro is ${h.price("touchdesigner", "Pro")}, which adds Pro Support of six hours. Derivative lists those as from prices, and ${lower(h.strength("touchdesigner", 2))}.</p>`,
        },
    ],
    faq: [
        {
            q: "Can Houdini do live visuals, or is it only for rendering?",
            a: `Houdini is ${h.rec("houdini").tagline.replace(/^A /, "a ").replace(/\.$/, "")}, and its video leaves as a file: ${h.io("houdini", "video").text} It does read and send MIDI, through the MIDI In CHOP and the MIDI Out CHOP. TouchDesigner is built for work that stays running, and it sends live video, MIDI, OSC, DMX, NDI and shared textures while it does.`,
        },
        {
            q: "Which is cheaper, Houdini or TouchDesigner?",
            a: `TouchDesigner. Its Non-Commercial licence is free and a Commercial licence is ${h.cost("touchdesigner", "Commercial")}, where Houdini's paid tiers start at ${h.cost("houdini", "Houdini Education, annual global access")} a year for Education and ${h.cost("houdini", "Houdini Core, perpetual workstation licence")} one-time for Core. Both free versions restrict what you can do with them.`,
        },
        {
            q: "Do they run on the same computers?",
            a: `On the operating systems, mostly: Houdini runs on ${h.platforms("houdini")} and TouchDesigner runs on ${h.platforms("touchdesigner")}. On the hardware, less so. Houdini needs ${lower(h.rec("houdini").requirements)}. TouchDesigner needs ${h.rec("touchdesigner").requirements}.`,
        },
        {
            q: "Can I use the free version of either for paid work?",
            a: `No, not for either one. ${h.limit("houdini", 0)} ${h.rec("touchdesigner").trial.limits} ${h.limit("touchdesigner", 2)}`,
        },
    ],
    related: [
        { href: "/comparison", text: "All comparisons" },
        { href: "/blog/best-music-visualizer-for-mac-2026", text: "The best music visualizer for Mac in 2026" },
    ],
});
