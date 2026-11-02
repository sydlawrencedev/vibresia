// /comparison/vibresia-vs-shadertoy
// Target query: "shadertoy alternative" (content/url-plan.csv).
// A head-to-head: just the two. The case for Vibresia is narrow and real:
// shaders that react to the music the Mac is actually playing, full screen,
// with the analysis done. Shadertoy wins everywhere else, and the page says
// so. Shadertoy's site blocks automated reading, so its record is from
// Wikipedia.

const us = (s) => s === "vibresia";

export default (h) => ({
    slug: "vibresia-vs-shadertoy",
    template: "2c",
    versus: "shadertoy",
    publishedISO: "2026-11-02",
    updatedISO: "2026-11-02",
    title: "Shadertoy Alternative for Music (2026): Vibresia vs Shadertoy",
    description: "Want your shaders to react to the music your Mac is playing? Vibresia is a free Mac app built for that. Shadertoy is better for everything else.",
    eyebrow: "Shadertoy alternative",
    breadcrumb: "Vibresia vs Shadertoy",
    h1: "Vibresia vs Shadertoy: an alternative for shaders that move to your music",
    answer: `If you write shaders and want them to react to the music you're actually listening to, Vibresia is built for that one job: it's a free Mac app that hears whatever the Mac is playing, analyses it, and hands the beat, bass and spectrum to a scene that's a single GLSL function. ${h.link("shadertoy")} is the place to write, share and learn from shaders in any browser, and for everything that isn't music on your Mac, it's the better choice. We make Vibresia, so check our reasons against the sources at the bottom.`,
    cta: "Try Vibresia free with what's playing now",
    rows: [
        { label: "What it is", value: (h, s) => us(s) ? "A Mac music visualiser you can write scenes for" : h.rec(s).tagline },
        { label: "Price", value: (h, s) => us(s) ? "Free, every feature" : h.priceCell(s) },
        { label: "Runs on", value: (h, s) => us(s) ? h.rec(s).requirements : "A web browser with WebGL" },
        { label: "Audio in", value: (h, s) => us(s) ? "System audio from any app (Spotify, Apple Music, a browser), or the microphone" : h.strength(s, 1) },
        { label: "Audio analysis", value: (h, s) => us(s) ? "Done for you: levels, bass, mids, treble, beat, tempo, spectrum" : "Not stated in our source" },
        { label: "Writing a shader", value: (h, s) => us(s) ? "One function, vec3 render(vec2 p, float t), or describe it to an AI assistant" : "GLSL in the browser" },
        { label: "Sharing", value: (h, s) => us(s) ? "A short link that plays in any browser, and an optional public gallery" : h.strength(s, 2) },
    ],
    verdict: {
        pickUs: "you want a shader to react to the music you're playing on your Mac, from Spotify, Apple Music or anything else, full screen while you listen, without building the audio side; or you'd like an AI assistant to write one for you.",
        pickThem: "you want to write and share shaders on any computer, learn from a big community's work, or use inputs like the webcam, keyboard, video or VR. Shadertoy runs in a browser everywhere; Vibresia is one Mac app.",
    },
    sections: [
        {
            h2: "Why Vibresia is the better pick for music",
            html: `<p>Shadertoy can take sound in: Wikipedia lists the microphone and SoundCloud among its inputs. Music playing in another app, such as Spotify or Apple Music, isn't on that list, so a Shadertoy shader can't react to it directly.</p>
    <p>Vibresia can. It listens to the Mac's system audio, so whatever is playing, in any app, drives the scene. It does the analysis on the Mac (levels, bass, mids and treble, the beat, the tempo and the whole spectrum) and passes all of it to your function, so the shader is only about the picture. It notices when the track changes in Apple Music or Spotify, too, and runs full screen as a visualiser while you listen.</p>`,
        },
        {
            h2: "Writing a scene",
            html: `<p>If you've written for Shadertoy, a Vibresia scene will feel familiar. It's one GLSL function, <code>vec3 render(vec2 p, float t)</code>, that returns a colour for each point, with the music's values available alongside. The app compiles it as you go and explains errors in plain words before it saves. A Shadertoy shader needs some adapting to run in Vibresia, and an AI assistant can do that adapting for you.</p>
    <p>That's the other difference: Vibresia ships a local MCP server, so an AI assistant can write a scene from a description, compile it, preview it and save it, while hearing what's playing. There's also a remote one at vibresia.com/mcp that writes a scene and returns a link.</p>`,
        },
        {
            h2: "Sharing what you make",
            html: `<p>Both let you share. Shadertoy gives every shader a permanent URL, lets you embed it in other sites, and has a community that comments and likes. Vibresia gives a scene a short link that plays in any browser, with or without the app, and you can add it to a public gallery. Shadertoy's community is far bigger, and if learning from other people's shaders is the point, that matters.</p>`,
        },
        {
            h2: "Where Shadertoy is the better choice",
            html: `<p>For nearly everything that isn't music on your own Mac, use Shadertoy. It runs in a browser on any computer, takes the webcam, keyboard, mouse, video, textures and VR headsets as inputs, and has years of shared work to learn from. Vibresia is Mac only, needs ${h.rec("vibresia").requirements}, and its only input that matters is sound.</p>`,
        },
    ],
    faq: [
        {
            q: "Can Shadertoy react to Spotify?",
            a: "Not directly. Shadertoy runs in a browser tab, and its listed sound inputs are the microphone and SoundCloud. Vibresia listens to the Mac's system audio, so it reacts to Spotify and every other app.",
        },
        {
            q: "Can I use my Shadertoy shaders in Vibresia?",
            a: "With some adapting. A Vibresia scene is one GLSL function, render(p, t), so a Shadertoy shader needs reshaping to fit. An AI assistant can do it for you.",
        },
        {
            q: "Is Vibresia free?",
            a: "Yes. Every feature is free, with no account, and the code is open source under the MIT licence.",
        },
        {
            q: "Does Vibresia run in a browser?",
            a: "Shared scenes play in any browser. To visualise your own music, you need the Mac app, on macOS 14.2 or later with Apple silicon.",
        },
    ],
    related: [
        { href: "/vibe", text: "Write your own Vibresia scene" },
        { href: "/agents", text: "Have an AI assistant write a scene for you" },
        { href: "/vibescapes", text: "See scenes people have made" },
    ],
});
