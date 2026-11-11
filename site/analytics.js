// Minimal PostHog client for the landing page.
//
// Deliberately not the official snippet: that pulls in session replay, surveys,
// feature flags and a cross-session cookie banner, and the page here is a
// single static HTML file. This sends the handful of events that are actually
// worth having (did they download, did they copy the install command, which
// mode cards got scrolled to) and nothing else. Same client shape as the one in
// the Mac app, so both surfaces read the same way in PostHog.
//
// What is sent: page views, which buttons got clicked, which mode cards were
// scrolled into view, and the usual anonymous install id. Never: query strings,
// anything typed into the page, or anything identifying — there is nothing to
// identify, this is a marketing page with no form and no account.
//
// To turn it off for one visit: the footer's "no thanks" link, or Do Not Track
// on. Both stop the page sending anything at all.

(function () {
  "use strict";

  function meta(name) {
    var el = document.querySelector('meta[name="' + name + '"]');
    return el ? el.content.trim() : "";
  }

  var KEY = meta("posthog-key");
  // "/ingest" on the live site: the Worker passes it on to PostHog, so a
  // blocklist that names PostHog's host doesn't drop the visit.
  var HOST = (meta("posthog-host") || "/ingest").replace(/\/+$/, "");
  var TEMPLATE = meta("seo-template");
  var OPT_OUT_KEY = "vibresia.site.optOut";
  var ID_KEY = "vibresia.site.distinctId";

  function uuid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    // Not every browser gets randomUUID, and this id doesn't need to be
    // unguessable — it identifies an install, not a person.
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0;
      return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    });
  }

  // The session id has to be a UUIDv7, not a UUIDv4.
  //
  // PostHog only counts an event towards a session when the session id is a
  // UUIDv7, and it only reads that id out of the properties bag. A UUIDv4
  // in a top-level `session_id` key is dropped twice over: the key is not a
  // property, and the value is not a v7. The symptom was invisible — the
  // events arrived, the pageviews counted, and every session number in web
  // analytics was wrong.
  //
  // A v7 puts a millisecond timestamp in the first 48 bits, so it sorts by
  // time and PostHog can tell when the session started. `randomUUID` cannot
  // make one, so this builds it by hand.
  function uuidV7() {
    var bytes = new Uint8Array(16);
    if (window.crypto && crypto.getRandomValues) {
      crypto.getRandomValues(bytes);
    } else {
      // No web crypto at all. The randomness only has to be good enough to
      // keep two visits apart, not to be unguessable.
      for (var i = 0; i < 16; i++) bytes[i] = (Math.random() * 256) | 0;
    }

    // The first 48 bits are the timestamp, in milliseconds, big-endian. It
    // has to be the time the session started: PostHog checks that the
    // timestamp is at or before the first event of the session and no more
    // than 24 hours after the last.
    //
    // 48 bits is two bytes of the high word and four of the low, so the
    // high half is written as a 16-bit number. Writing it as a full 32-bit
    // word pushes the timestamp four bytes along and the id decodes to a
    // date in the year 7607.
    var now = Date.now();
    var view = new DataView(bytes.buffer);
    view.setUint16(0, Math.floor(now / 0x100000000)); // the top 16 bits
    view.setUint32(2, now >>> 0); // the low 32 bits
    bytes[6] = (bytes[6] & 0x0f) | 0x70; // version 7
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 1

    var hex = [];
    for (var j = 0; j < 16; j++) hex.push((bytes[j] + 0x100).toString(16).slice(1));

    return (
      hex.slice(0, 4).join("") + "-" +
      hex.slice(4, 6).join("") + "-" +
      hex.slice(6, 8).join("") + "-" +
      hex.slice(8, 10).join("") + "-" +
      hex.slice(10, 16).join("")
    );
  }

  function optedOut() {
    try {
      if (localStorage.getItem(OPT_OUT_KEY) === "1") return true;
    } catch (e) { /* private mode: no stored opt-out, carry on */ }
    // Do Not Track is a clear enough signal, and honouring it costs nothing.
    return navigator.doNotTrack === "1" || window.doNotTrack === "1";
  }

  function distinctId() {
    var id;
    try {
      id = localStorage.getItem(ID_KEY);
      if (!id) {
        id = uuid();
        localStorage.setItem(ID_KEY, id);
      }
    } catch (e) {
      id = uuid(); // no storage: still send, just don't remember
    }
    return id;
  }

  if (!KEY || KEY.indexOf("phc_") !== 0) return; // no key in this build: stay quiet

  // The opt-out link has to work on every page, including the ones where
  // measuring is already off. If the script returned as soon as it saw an
  // opt-out, the link in the footer would be dead on the next visit — it
  // would scroll to the top and never say "Done". So the link is wired up
  // first, and only then does the script decide whether to measure anything.
  function showOptOutNote() {
    var note = document.getElementById("optout-note");
    if (note) note.hidden = false;
  }
  document.addEventListener("click", function (e) {
    var el = e.target.closest("[data-optout]");
    if (!el) return;
    e.preventDefault();
    try { localStorage.setItem(OPT_OUT_KEY, "1"); } catch (err) { /* nothing we can do */ }
    showOptOutNote();
  });

  if (optedOut()) {
    showOptOutNote();
    return;
  }

  var id = distinctId();
  // One per page load: groups a single visit together. A UUIDv7, because
  // PostHog counts a session only when the id is one.
  var sessionId = uuidV7();
  var queue = [];
  var flushTimer = null;
  var ENDPOINT = HOST + "/batch/";

  function baseProperties() {
    var props = {
      surface: "web",
      $lib: "vibresia-web",
      path: location.pathname,
      title: document.title,
      language: navigator.language || "",
      // Query strings are dropped on purpose: the page has none it needs, and
      // UTM-ish params are the classic way to smuggle personal data into an
      // analytics payload.
      referrer: document.referrer ? new URL(document.referrer).hostname : ""
    };
    // Search pages say which template built them, so every event from one,
    // the visit included, can be grouped by template (docs/seo.md, Phase 3).
    if (TEMPLATE) props.template = TEMPLATE;
    return props;
  }

  function track(event, properties) {
    var props = baseProperties();
    // The session id goes in the properties bag, under the name PostHog
    // looks for. A top-level `session_id` key is not a property, so PostHog
    // never saw it and every event looked like it belonged to no session.
    props.$session_id = sessionId;
    for (var k in properties) props[k] = properties[k];
    queue.push({
      api_key: KEY,
      event: event,
      distinct_id: id,
      properties: props,
      timestamp: new Date().toISOString()
    });
    schedule();
  }

  function send(payload, keepalive) {
    var body = JSON.stringify(payload);
    if (keepalive && navigator.sendBeacon) {
      // The page may be going away; a beacon is the one request that survives.
      return navigator.sendBeacon(ENDPOINT, body);
    }
    return fetch(ENDPOINT, {
      method: "POST",
      // application/json because that is the only body shape /batch/ reads as
      // a batch. text/plain was here to skip the CORS preflight, and PostHog
      // does answer that preflight (allow-origin echoes, allow-headers
      // content-type), so the saving was small next to sending nothing.
      headers: { "Content-Type": "application/json" },
      body: body,
      keepalive: !!keepalive,
      mode: "cors"
    }).catch(function () { /* offline: the visit just doesn't get counted */ });
  }

  function flush(keepalive) {
    if (flushTimer) { clearTimeout(flushTimer); flushTimer = null; }
    if (!queue.length) return;
    var batch = queue;
    queue = [];
    // `/batch/` takes a JSON array of events, one per element. It used to be
    // sent as a wrapper object — {"api_key": …, "batch": [ … ]} — which
    // PostHog accepts and answers with {"status":"Ok"} while recording
    // nothing, because the object it looks at has no `event` field. That's the
    // worst kind of failure to debug: a 200 forever and an empty project.
    send(batch, keepalive);
  }

  function schedule() {
    if (flushTimer) return;
    flushTimer = setTimeout(function () { flush(false); }, 2500);
  }

  // --- "Have they downloaded before?" -----------------------------------
  //
  // The worker turns this into one line on the Discord notification ("first
  // download from this browser", or not). It rides on the download link's own
  // URL, because a plain link click can't carry a header.
  //
  // The Discord notification itself is fired by the server when it hands over
  // the download, not from here: a webhook URL in the page would be public,
  // and a click that never completes isn't a download.
  var DOWNLOADED_KEY = "vibresia.site.downloaded";

  function tagDownloadLinks() {
    var seen = "0";
    try { if (localStorage.getItem(DOWNLOADED_KEY) === "1") seen = "1"; } catch (e) { /* no storage */ }
    var links = document.querySelectorAll('a[href*="/download"]');
    for (var i = 0; i < links.length; i++) {
      var href = links[i].getAttribute("href").split("&seen=")[0];
      links[i].setAttribute("href", href + "&seen=" + seen);
    }
  }

  document.addEventListener("click", function (e) {
    if (!e.target.closest('a[href*="/download"]')) return;
    try { localStorage.setItem(DOWNLOADED_KEY, "1"); } catch (err) { /* nothing we can do */ }
  });
  tagDownloadLinks();

  // --- Events -----------------------------------------------------------

  // PostHog has a pageview of its own — "$pageview" — and it counts as a
  // visit in the way a custom event does not: it is what the web analytics
  // built-ins are built on, so the paths, the referrers and the "where did
  // this person come from" panel all work without anybody having to
  // reconstruct them from an event with a different name.
  track("$pageview", {
    $current_url: location.href.split("?")[0],
    $referrer: document.referrer || "",
    // First touch: the page and the site that first brought this browser
    // here, kept on the person and never overwritten, so a download a week
    // later still says which search page started it (docs/seo.md, Phase 3).
    $set_once: {
      $initial_pathname: location.pathname,
      $initial_referring_domain: document.referrer ? new URL(document.referrer).hostname : "$direct"
    }
  });

  // Delegated, so the page can be edited without re-wiring anything here.
  document.addEventListener("click", function (e) {
    var el = e.target.closest("[data-track], a[href]");
    if (!el) return;

    if (el.hasAttribute("data-optout")) {
      e.preventDefault();
      try { localStorage.setItem(OPT_OUT_KEY, "1"); } catch (err) { /* nothing we can do */ }
      // The queue is dropped, not sent. Opting out is the one action a
      // person takes to stop being measured, and flushing it would send the
      // very pageview they asked not to have sent — the click that opts out
      // would be the thing that reports the visit. The Mac app clears its
      // queue the same way (Analytics.swift).
      if (flushTimer) { clearTimeout(flushTimer); flushTimer = null; }
      queue.length = 0;
      var note = document.getElementById("optout-note");
      if (note) note.hidden = false;
      return;
    }

    if (el.hasAttribute("data-track")) {
      var props = { placement: el.dataset.placement || "" };
      if (el.dataset.command) props.command = el.dataset.command;
      if (el.dataset.target) props.target = el.dataset.target;
      // Which page, and where on it: the template comes with every event.
      if (el.dataset.slug) props.slug = el.dataset.slug;
      track(el.dataset.track, props);
      return;
    }

    // Anything that leaves the site and isn't already tracked above.
    var href = el.getAttribute("href") || "";
    if (/^https?:/.test(href)) {
      var host = new URL(href, location.href).hostname;
      if (host !== location.hostname) track("outbound_clicked", { target: host });
    }
  });

  // Which mode cards people actually scroll to is the closest thing this page
  // has to a "what interested you" signal.
  if ("IntersectionObserver" in window) {
    var seen = {};
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var mode = entry.target.dataset.vibescape;
        if (!entry.isIntersecting || seen[mode]) return;
        seen[mode] = true;
        track("mode_card_viewed", { target: mode });
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "-20% 0px" });
    // The cards are `.vibescape[data-vibescape]`. This used to ask for
// `.mode[data-mode]`, which has not matched anything on the page since the
// cards were renamed — so mode_card_viewed had quietly stopped firing while the
// dashboard carried on showing the events it did manage to collect.
document.querySelectorAll(".vibescape[data-vibescape]").forEach(function (card) {
      observer.observe(card);
    });
  }

  var video = document.querySelector("video");
  if (video) {
    var reported = false;
    video.addEventListener("play", function () {
      if (reported) return;
      reported = true;
      track("demo_played", {});
    });
  }

  // Copy buttons log which instruction people reach for — "ask your AI
  // assistant" versus a curl pipe is a real difference in who this page
  // reaches, so it's worth knowing which one wins.
  document.querySelectorAll("[data-copy]").forEach(function (button) {
    button.addEventListener("click", function () {
      track("install_command_copied", { command: button.dataset.command || "" });
    });
  });

  window.addEventListener("pagehide", function () { flush(true); });
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") flush(true);
  });
})();