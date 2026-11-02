// /comparison/projectm-vs-milkdrop
// Target query: "projectm vs milkdrop" (content/url-plan.csv).
// A referee page (2b): which of the two is right for the reader. Facts come
// from the records through `h`.
export default (h) => ({
    slug: "projectm-vs-milkdrop", template: "2b",
    publishedISO: "2026-11-02", updatedISO: "2026-11-02",
    title: "projectM vs MilkDrop (2026): Which Should You Use?",
    description: "projectM rebuilds MilkDrop for Windows, macOS and Linux. MilkDrop is the Winamp original, on Windows only. Here's which one fits your computer.",
    eyebrow: "Music visualiser comparison",
    breadcrumb: "projectM vs MilkDrop",
    h1: "projectM vs MilkDrop: the original or the open-source rebuild?",
    answer: `Pick ${h.link("milkdrop")} if you're on Windows, use Winamp and want the original plug-in as its author made it. Pick ${h.link("projectm")} if you're on a Mac or Linux, or want MilkDrop's presets outside Winamp: it's an open-source rebuild that plays the same .milk files on ${h.platforms("projectm")}. On a Mac, projectM is the only one of the two that runs at all, but its Mac apps are still previews.`,
    cta: "Try Vibresia free",
    rows: [
        { label: "What it is", value: (h, s) => h.rec(s).tagline },
        { label: "Price", value: (h, s) => h.priceCell(s) },
        { label: "Runs on", value: (h, s) => h.platforms(s) },
        { label: "Best for", value: (h, s) => h.rec(s).bestFor },
        { label: "Main strength", value: (h, s) => h.strength(s, 0) },
        { label: "Also good at", value: (h, s) => h.strength(s, 1) },
        { label: "Biggest limit", value: (h, s) => h.limit(s, 0) },
    ],
    verdict: {
        pickA: "you use a Mac or Linux, you want MilkDrop's preset library outside Winamp, or you'd like an open-source library that other apps build on. Expect preview builds on the Mac.",
        pickB: "you're on Windows with Winamp and want the original plug-in, made by the person who wrote MilkDrop, with a microphone or line-in as an extra audio source.",
    },
    sections: [
        {
            h2: "Where projectM wins",
            html: `<p>The first win is simple: it runs on more computers. ${h.name("milkdrop")} is a Winamp plug-in for Windows. ${h.name("projectm")} runs on ${h.platforms("projectm")}, so it's the route to MilkDrop's look on a Mac or a Linux box.</p>
    <p>It keeps the presets. projectM is a faithful reimplementation of MilkDrop, so it plays the large library of community <code>.milk</code> presets people have made over the years. The default pack, Cream of the Crop, has about 10,000 presets, and larger packs are available if that isn't enough.</p>
    <p>It's also a library, not just an app. projectM is published under the ${h.rec("projectm").licence.name}, and other apps build on it, with front-ends for Windows, macOS and Linux. Like MilkDrop, it detects tempo and draws equation-based visuals from the audio it hears.</p>`,
        },
        {
            h2: "Where MilkDrop wins",
            html: `<p>MilkDrop is the original. Ryan Geiss wrote it, and its beat detection drives a huge range of effects. The presets projectM plays were written for MilkDrop first, so on Windows with Winamp you get them in the program they were made for.</p>
    <p>It isn't tied to the song Winamp is playing. MilkDrop can be driven by a live feed such as a microphone or line-in, so it can react to whatever you plug in, not just files on the computer.</p>
    <p>Its author has also published the source code for several versions, so the original isn't a black box. If you want to know how a MilkDrop effect works, you can read the code it came from.</p>`,
        },
        {
            h2: "Where both fall short",
            html: `<p>On a Mac, neither is a finished app. MilkDrop doesn't run on macOS at all: its page lists Windows 98 through Windows 7. projectM does run on a Mac, but its standalone Mac apps are pre-releases or development previews. The Steam and Homebrew builds are an old 3.1.12 release, and the Apple Music plug-in for macOS is an unsigned development preview.</p>
    <p>MilkDrop's age shows on Windows too. It's a Winamp plug-in, so you need Winamp to use it, and the newest Windows its page lists is Windows 7.</p>
    <p>Both are built around the same preset format, so if you want to make your own visuals, you work in MilkDrop's preset language whichever of the two you pick.</p>`,
        },
        {
            h2: "What it costs",
            html: `<p>projectM is open source under the ${h.rec("projectm").licence.name}, and its code is on GitHub. MilkDrop's author publishes source code for several versions, but our record of its site doesn't list a price or a licence, so we haven't put one in the table. Check ${h.link("milkdrop")}'s page before you rely on either.</p>`,
        },
    ],
    faq: [
        {
            q: "Is projectM the same as MilkDrop?",
            a: "No, but it's close. projectM is an open-source reimplementation of MilkDrop that plays the same .milk presets. MilkDrop is the original Winamp plug-in by Ryan Geiss.",
        },
        {
            q: "Does MilkDrop work on a Mac?",
            a: "No. MilkDrop is a Winamp plug-in for Windows, and its page lists Windows 98 through Windows 7. On a Mac, projectM is the way to play MilkDrop presets, though its Mac apps are previews.",
        },
        {
            q: "Can projectM use my old MilkDrop presets?",
            a: "Yes. projectM is built to play MilkDrop's .milk presets. It ships with a default pack of about 10,000 presets, Cream of the Crop, and larger packs are available.",
        },
        {
            q: "Can MilkDrop react to a microphone instead of Winamp?",
            a: "Yes. MilkDrop can be driven by a live feed such as a microphone or line-in, not only by what Winamp is playing.",
        },
    ],
    related: [
        { href: "/blog/does-milkdrop-work-on-mac", text: "Does MilkDrop work on a Mac?" },
        { href: "/blog/milkdrop-alternatives-mac-2026", text: "MilkDrop alternatives for Mac" },
        { href: "/comparison", text: "All comparisons" },
    ],
});
