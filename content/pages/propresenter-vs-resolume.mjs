// /comparison/propresenter-vs-resolume
// Target query: "propresenter vs resolume" (content/url-plan.csv).
// A referee page (2b): which of the two is right for the reader. Facts come
// from the records through `h`. ProPresenter is priced in dollars and
// Resolume in euros, so no price is converted and the two are left as their
// makers publish them.
export default (h) => ({
    slug: "propresenter-vs-resolume", template: "2b",
    publishedISO: "2026-11-02", updatedISO: "2026-11-02",
    title: "ProPresenter vs Resolume (2026): Which for Live Visuals?",
    description: "ProPresenter or Resolume for live video? One plans a church show, one performs it. Prices, connections, free versions and who each one suits.",
    eyebrow: "Live video compared",
    breadcrumb: "ProPresenter vs Resolume",
    h1: "ProPresenter vs Resolume: church presentation software or a VJ application?",
    answer: `ProPresenter and Resolume both put video on a screen in front of an audience, and the right one depends on whether the show is planned in advance or performed live. If you are running a church service or a stage show built from lyrics, slides and media, pick ${h.link("propresenter")}, which is presentation and live production software for driving screens and video outputs, and its standard seat is ${h.price("propresenter", "Standard, one seat, billed annually")}. If you are a VJ or a venue running video on screens and projectors, pick ${h.link("resolume")}, which is VJ and media-server software for macOS and Windows, and Avenue is ${h.price("resolume", "Avenue")}.`,
    cta: "Try Vibresia free",
    connections: true,
    rows: [
        { label: "What it is", value: (h, s) => h.rec(s).tagline },
        { label: "Price", value: (h, s) => h.priceCell(s) },
        { label: "Runs on", value: (h, s) => h.platforms(s) },
        { label: "Requirements", value: (h, s) => h.rec(s).requirements },
        { label: "Free version", value: (h, s) => h.rec(s).trial ? `${h.rec(s).trial.limits.split(". ")[0]}.` : "No free version" },
        { label: "Known for", value: (h, s) => h.strength(s, 0) },
        { label: "Best for", value: (h, s) => h.rec(s).bestFor },
    ],
    verdict: {
        pickA: `you are running a church service or a live event where the show is built in advance from lyrics, slides and media, and one machine drives several screens. ProPresenter does worship tooling, multi-screen outputs and broadcast feeds as standard, and a standard seat is ${h.price("propresenter", "Standard, one seat, billed annually")}, which falls to 189 dollars per seat on an annual plan with 2 to 4 seats and 149 per seat with 5 to 10 seats.`,
        pickB: `you are VJing, or running video on screens and projectors for a room, and you would rather own the licence than pay every year. Resolume's Avenue is a one-time purchase of ${h.cost("resolume", "Avenue")} that keeps working after the 12 months of updates it includes, and Resolume also does OSC and Spout, which ProPresenter does not document.`,
    },
    sections: [
        {
            h2: "Why people compare them",
            html: `<p>They come up together because both put video on a screen in a room where people are watching. ${h.name("propresenter")} is ${h.rec("propresenter").tagline.replace(/\.$/, "").toLowerCase()}. ${h.name("resolume")} is VJ and media-server software for macOS and Windows: Avenue is the VJ application, Arena adds the media-server features, and Wire is a visual programming tool for building your own effects and generators visually.</p>
    <p>They are aimed at different rooms and different jobs. ProPresenter suits churches and their volunteer or staff media teams running weekly services and live events, and it suits operators who build a planned show of lyrics, slides and media in advance and drive several screens from it. Resolume suits working VJs and venues running video on screens and projectors.</p>
    <p>So the question is not which one is better. It is whether the show is written before the audience arrives or played in front of them.</p>`,
        },
        {
            h2: "Where ProPresenter wins",
            html: `<p><b>Lyrics and copyright are handled for you.</b> ${h.strength("propresenter", 0)}.</p>
    <p><b>Several screens from one machine.</b> ${h.strength("propresenter", 1)}.</p>
    <p><b>Broadcast and network outputs.</b> ${h.strength("propresenter", 2)}. ${h.io("propresenter", "syphon").text} ${h.io("propresenter", "ndi").text}</p>
    <p><b>Automation is built in.</b> ${h.strength("propresenter", 3)}. ${h.strength("propresenter", 4)}.</p>
    <p><b>The trial is show-ready.</b> The trial is a fully registered copy, so it carries no watermark and can be used in front of a live audience, and it runs for 14 days from the moment the request is completed.</p>`,
        },
        {
            h2: "Where Resolume wins",
            html: `<p><b>You buy it once.</b> ${h.strength("resolume", 2)}. Avenue is ${h.cost("resolume", "Avenue")}, Arena is ${h.cost("resolume", "Arena")} and Wire is ${h.cost("resolume", "Wire")}, each a one-time purchase.</p>
    <p><b>You can use it for as long as you like.</b> Resolume is free to use indefinitely, and the catch is that video output has a Resolume watermark and audio has a robot voice until a serial number is entered.</p>
    <p><b>Two connections ProPresenter does not document.</b> ProPresenter documents HTTP and TCP/IP control, MIDI, DMX and timecode, and its own knowledge base search returns no results for OSC, while the maker lists Syphon as the Mac-only shared output and names no Windows equivalent, so OSC and Spout look absent rather than denied. ${h.io("resolume", "osc").text} ${h.io("resolume", "spout").text}</p>
    <p><b>DMX, in the top tier.</b> ${h.io("resolume", "dmx").text}</p>
    <p><b>Video in, and effects of your own.</b> ${h.io("resolume", "video").text} Wire is the visual programming tool, for building your own effects and generators.</p>`,
        },
        {
            h2: "Where both fall short",
            html: `<p><b>Neither one is a music visualiser.</b> Both are general tools for video and both expect you to bring the content. ProPresenter is for showing lyrics, slides and media, and Resolume is for performing video from material you have loaded, so the sound itself does not become the picture in either.</p>
    <p><b>Both need the internet at some point.</b> ${h.limit("propresenter", 3)} ${h.limit("resolume", 3)}</p>
    <p><b>The hardware has to match the job.</b> ${h.limit("propresenter", 2)} Resolume needs ${h.rec("resolume").requirements.replace(/^macOS 13.4 Ventura or later, or Windows 10 or later, with /, "")}.</p>
    <p><b>Both have a free mode that changes the output.</b> ProPresenter's free mode puts a watermark on every output and edits on one computer only, and Resolume's free version watermarks the video and robs the audio of its voice, so neither free mode is ready to put in front of an audience.</p>
    <p><b>Both have a ceiling on outputs.</b> ProPresenter supports up to 8 unique outputs, and ${h.limit("resolume", 1).charAt(0).toLowerCase() + h.limit("resolume", 1).slice(1)}</p>`,
        },
        {
            h2: "What it costs",
            html: `<p>ProPresenter is sold to new users as a subscription only. One seat is ${h.price("propresenter", "Standard, one seat, billed monthly")} or ${h.price("propresenter", "Standard, one seat, billed annually")}. Annual per-seat prices are tiered: 289 dollars for one seat, 189 per seat for 2 to 4 seats and 149 per seat for 5 to 10 seats, while 11 or more seats are quoted by sales with no published price, and monthly subscriptions get no volume discount.</p>
    <p>Resolume is a one-time purchase: Avenue is ${h.cost("resolume", "Avenue")}, Arena is ${h.cost("resolume", "Arena")} and Wire is ${h.cost("resolume", "Wire")}, and each licence keeps working after the 12 months of updates it includes.</p>
    <p>Neither free mode is a way to run a show for nothing. ProPresenter's free mode is an unregistered download or a free Local Editor seat that puts a watermark on every output, and the maker does not publish it as a pricing tier. Resolume's free version watermarks the video and robs the audio of its voice until you enter a serial number.</p>
    <p>The two are priced in different currencies, one in dollars and one in euros, and neither maker converts them, so there is no single number to set side by side. What the choice comes down to is a recurring bill against a one-off licence, and a planned show against a performed one.</p>`,
        },
    ],
    faq: [
        {
            q: "Should I buy ProPresenter or Resolume?",
            a: "ProPresenter if your show is planned in advance from lyrics, slides and media, because that is what it is built for and it suits churches and their volunteer or staff media teams. Resolume if you are working as a VJ or running video on screens and projectors, because it is for performing to a room. Neither one turns the music into the picture, so both need content brought to them.",
        },
        {
            q: "Is there a free version of ProPresenter?",
            a: `Yes. ${h.limit("propresenter", 0)} The maker also offers it as an unregistered download, and does not publish it as a pricing tier. The trial is a different thing: it runs 14 days, needs a credit card at sign-up, converts automatically to a monthly or annual subscription, and is a fully registered copy with no watermark.`,
        },
        {
            q: "Can I try Resolume for free?",
            a: `Yes. ${h.rec("resolume").trial.limits} That is enough to learn the software, but not to put a paid show on a screen.`,
        },
        {
            q: "What does each one cost?",
            a: `ProPresenter is sold to new users as a subscription only: one seat is ${h.price("propresenter", "Standard, one seat, billed monthly")} or ${h.price("propresenter", "Standard, one seat, billed annually")}, with annual per-seat rates of 189 dollars for 2 to 4 seats and 149 for 5 to 10 seats, and 11 or more seats quoted by sales. Resolume is a one-time purchase: Avenue is ${h.cost("resolume", "Avenue")}, Arena is ${h.cost("resolume", "Arena")} and Wire is ${h.cost("resolume", "Wire")}, each with 12 months of updates included and the licence still working afterwards.`,
        },
    ],
    related: [
        { href: "/comparison", text: "All comparisons" },
        { href: "/blog/best-music-visualizer-for-mac-2026", text: "The best music visualizer for Mac in 2026" },
    ],
});
