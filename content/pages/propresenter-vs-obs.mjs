// /comparison/propresenter-vs-obs
// Target query: "propresenter vs obs" (content/url-plan.csv).
// A referee page (2b): which of the two is right for the reader. Facts come
// from the records through `h`. ProPresenter is priced in US dollars and OBS
// Studio is free, so there is nothing to convert.
export default (h) => ({
    slug: "propresenter-vs-obs", template: "2b",
    publishedISO: "2026-11-02", updatedISO: "2026-11-02",
    title: "ProPresenter vs OBS Studio (2026): Which Should You Buy?",
    description: "ProPresenter or OBS Studio for a live event? One is paid software for churches, the other free streaming software. Prices, connections and who each suits.",
    eyebrow: "Live production compared",
    breadcrumb: "ProPresenter vs OBS Studio",
    h1: "ProPresenter vs OBS Studio: which one is right for your event?",
    answer: `If you are running a church service or a live event and need lyrics, slides and media on several screens, pick ${h.link("propresenter")}. If you need the video recorded, sent to a streaming service or read by another machine, pick ${h.link("obs")}, which is free and open source and runs on Windows, macOS and Linux. They get compared because both mix sources and put a finished feed on a screen, and the choice underneath that is between a tool that holds the show and a tool that carries the feed.`,
    cta: "Try Vibresia free",
    connections: true,
    rows: [
        { label: "What it is", value: (h, s) => h.rec(s).tagline },
        { label: "Price", value: (h, s) => h.priceCell(s) },
        { label: "Runs on", value: (h, s) => h.platforms(s) },
        { label: "Requirements", value: (h, s) => h.rec(s).requirements },
        { label: "Free version", value: (h, s) => h.rec(s).trial ? `${h.rec(s).trial.limits.split(". ")[0]}.` : "Free, with every feature, and the source published" },
        { label: "Known for", value: (h, s) => h.strength(s, 0) },
        { label: "Best for", value: (h, s) => h.rec(s).bestFor },
    ],
    verdict: {
        pickA: `you are running a church service or a live event where a show of lyrics, slides and media is prepared in advance and has to reach several screens, and one operator has to run it. ProPresenter sends and receives MIDI, can be driven from a lighting console over DMX on a Mac, and outputs NDI and Syphon.`,
        pickB: `you need the video recorded, sent to a streaming service or read by another machine, and you would rather not buy a licence for the software. OBS Studio costs nothing, its source is published, and it runs on Windows, macOS and Linux.`,
    },
    sections: [
        {
            h2: "Why people compare them",
            html: `<p>They come up together because both mix sources and put a finished feed on a screen, and because one of them costs nothing. ${h.name("propresenter")} is ${h.rec("propresenter").tagline.replace(/\.$/, "").toLowerCase()}. ${h.name("obs")} is ${h.rec("obs").tagline.replace(/\.$/, "").toLowerCase()}.</p>
    <p>ProPresenter is built for a room with people in it: a church service or a live event, where the operator has a show of lyrics, slides and media prepared in advance and drives several screens from it. OBS Studio is built for a feed that leaves the machine, as a recording, a live stream to a service, a projector output, or a virtual camera that other applications can read.</p>
    <p>So the comparison is usually a question about which half of the job you are being asked to do. When it is both halves, you are looking at two applications, and the money is one decision among several.</p>`,
        },
        {
            h2: "Where ProPresenter wins",
            html: `<p><b>The worship content is in the software.</b> ${h.strength("propresenter", 0)}. You do not need a separate lyric tool or a Bible app to run a service.</p>
    <p><b>It drives many screens from one machine.</b> ${h.strength("propresenter", 1)}.</p>
    <p><b>It has broadcast outputs.</b> ${h.strength("propresenter", 2)}. ${h.io("propresenter", "video").text}</p>
    <p><b>The desk can drive it.</b> ${h.strength("propresenter", 3)}. ${h.io("propresenter", "midi").text} ${h.io("propresenter", "dmx").text} ${h.io("propresenter", "ndi").text}</p>
    <p><b>Support is there when a service is about to start.</b> ${h.strength("propresenter", 4)}.</p>`,
        },
        {
            h2: "Where OBS Studio wins",
            html: `<p><b>It costs nothing and you can read the source.</b> ${h.strength("obs", 4)}.</p>
    <p><b>It runs on three systems.</b> ${h.strength("obs", 1)}, so the same setup can go out from a Windows laptop at the venue and a Linux machine at home. ProPresenter runs on ${h.platforms("propresenter").replace(/, /, " and ")}.</p>
    <p><b>Mixing and switching are the core of it.</b> ${h.strength("obs", 0)}.</p>
    <p><b>It is arranged for running a show.</b> ${h.strength("obs", 3)}.</p>
    <p><b>Other programs can drive it.</b> ${h.strength("obs", 2)}.</p>
    <p><b>The output goes where a feed goes.</b> ${h.io("obs", "video").text}</p>`,
        },
        {
            h2: "Where both fall short",
            html: `<p><b>Neither one is a music visualiser.</b> ProPresenter shows the lyrics, slides and media you have prepared, and OBS Studio mixes the video and audio sources you have added, so in both cases the content comes from you.</p>
    <p><b>ProPresenter's free mode is watermarked.</b> ${h.limit("propresenter", 0)}</p>
    <p><b>OBS Studio reaches the rest through other people's code.</b> ${h.io("obs", "midi").text} ${h.io("obs", "osc").text} ${h.io("obs", "ndi").text} ${h.io("obs", "spout").text} ${h.io("obs", "dmx").text}</p>
    <p><b>Some of the connections only work on one system.</b> ${h.limit("propresenter", 1)} OBS Studio reads Syphon servers on a Mac and has no Syphon output, and the Spout plug-in it uses is Windows only.</p>
    <p><b>ProPresenter's own recording and streaming have a hardware condition.</b> ${h.limit("propresenter", 2)}</p>
    <p><b>OBS Studio asks more of the machine as the show gets heavier.</b> ${h.limit("obs", 3)} ${h.limit("obs", 1).replace(/^On macOS, /, "On a Mac, ")}</p>`,
        },
        {
            h2: "What it costs",
            html: `<p>ProPresenter is sold to new users as a subscription. Standard, one seat, billed annually is ${h.price("propresenter", "Standard, one seat, billed annually")} and Standard, one seat, billed monthly is ${h.price("propresenter", "Standard, one seat, billed monthly")}. Annual per-seat prices fall as the seat count rises: US$189 a year per seat for 2 to 4 seats and US$149 a year per seat for 5 to 10 seats, while 11 or more seats are quoted by sales with no published price, and monthly subscriptions get no volume discount. ${h.limit("propresenter", 3)}</p>
    <p>There is a free mode as well, though it is not a published pricing tier: it is an unregistered download or a free Local Editor seat that puts a watermark on every output. It is enough to build and edit a show on one computer.</p>
    <p>The trial is a separate thing: it runs 14 days from the moment the request is completed, it needs a credit card at sign-up, it converts automatically to a monthly or annual subscription, and only one trial is allowed per organisation. Unlike the free mode, the trial is a fully registered copy, so there is no watermark and it can be used in front of a live audience.</p>
    <p>The money side is simpler on the other side: ${h.rec("obs").pricing.note} That is not the whole comparison, because the features ProPresenter has built in are the ones OBS Studio gets from plug-ins written by other people.</p>`,
        },
    ],
    faq: [
        {
            q: "Is ProPresenter cheaper than OBS Studio?",
            a: `No. OBS Studio is free and open source, so there is nothing to buy. ProPresenter Standard, one seat is ${h.price("propresenter", "Standard, one seat, billed monthly")} or ${h.price("propresenter", "Standard, one seat, billed annually")}, and its free mode is a watermarked Local Editor seat that edits on one computer only.`,
        },
        {
            q: "Can OBS Studio do MIDI, NDI or DMX like ProPresenter?",
            a: "Not on its own. OBS Studio has no built-in MIDI, OSC, NDI, Spout or DMX, and each of those comes from a community plug-in such as obs-midi-mg, DistroAV, the OBS Spout plug-in and ArtNetOBS. ProPresenter sends and receives MIDI, outputs NDI and Syphon, and can be driven from a lighting console over DMX or Art-Net on macOS only.",
        },
        {
            q: "Which one should a church use for a service that also has to be streamed?",
            a: "ProPresenter for the service and OBS Studio for the stream. ProPresenter holds the lyrics, slides and media, sends different layouts to each screen, and can output key and fill to a switcher. OBS Studio does the recording and the sending at no cost, on Windows, macOS and Linux. A team that needs both halves is running two applications.",
        },
        {
            q: "Do they run on the same computers?",
            a: `ProPresenter runs on ${h.platforms("propresenter").replace(/, /, " and ")} and needs ${h.rec("propresenter").requirements}. OBS Studio runs on ${h.platforms("obs")} and needs ${h.rec("obs").requirements}.`,
        },
    ],
    related: [
        { href: "/comparison", text: "All comparisons" },
        { href: "/blog/best-music-visualizer-for-mac-2026", text: "The best music visualizer for Mac in 2026" },
    ],
});
