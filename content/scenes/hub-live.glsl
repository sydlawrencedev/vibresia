// The scene on the question-page hub: rings that breathe with the bass and
// ripple with the spectrum. Drawn in the browser by site/share/preview.js,
// from the synthetic beat or, once the reader allows it, their microphone.
vec3 render(vec2 p, float t) {
    float e = clamp(uBassSmooth * 1.3, 0.0, 1.0);
    float r = length(p);
    float a = atan(p.y, p.x);
    float glow = 0.0;
    for (int i = 0; i < 5; i++) {
        float fi = float(i);
        float band = uBands[int(fi * 18.0)];
        float wobble = 0.05 * sin(a * (3.0 + fi) + uBeats * 0.8 + fi) * (0.4 + e + band);
        float rad = 0.14 + fi * 0.11 + wobble + 0.05 * uBeatStrength;
        glow += 0.010 / (abs(r - rad) + 0.004);
    }
    vec3 hot = vec3(1.0, 0.17, 0.84);
    vec3 cool = vec3(0.17, 0.95, 1.0);
    vec3 col = mix(hot, cool, 0.5 + 0.5 * sin(a + uBeats * 0.25)) * glow * (0.30 + uLevelSmooth * 1.1);
    col += vec3(0.06, 0.0, 0.10) * (1.0 - r);
    return clamp(col, 0.0, 1.0);
}
