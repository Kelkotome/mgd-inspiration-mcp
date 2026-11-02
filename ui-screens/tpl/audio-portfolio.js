/* Audio family (Tidewell, music streaming for independent artists): music-player, playlist.
   Portfolio family (Ines Calder, independent product designer + front-end developer): portfolio-home, case-study.
   UI colours come only from tokens. Album covers and project artwork are illustrative (fixed natural-tone SVG), like tpl/media.js scenes.
   All artists, tracks, clients and projects are fictional. */
const { ic, esc, status, tabBar, ICON } = require("../lib");

Object.assign(ICON, {
  ap_shuffle: '<path d="M3 7h3.5c3 0 4.5 10 8 10H21M3 17h3.5c1.4 0 2.4-2 3.3-4.2M14.5 7H21M18 4l3 3-3 3M18 14l3 3-3 3"/>',
  ap_repeat: '<path d="M4 11V9a3 3 0 0 1 3-3h13M17 3l3 3-3 3M20 13v2a3 3 0 0 1-3 3H4M7 21l-3-3 3-3"/>',
  ap_prev: '<path d="M18 5L8 12l10 7zM6 5v14"/>',
  ap_next: '<path d="M6 5l10 7-10 7zM18 5v14"/>',
  ap_pause: '<path d="M8 5v14M16 5v14"/>',
  ap_volume: '<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/>',
  ap_lib: '<path d="M5 4v16M10 4v16M15 4.5l4.5 15"/>',
  ap_radio: '<circle cx="12" cy="12" r="2"/><path d="M7.8 7.8a6 6 0 0 0 0 8.4M16.2 7.8a6 6 0 0 1 0 8.4M4.9 4.9a10 10 0 0 0 0 14.2M19.1 4.9a10 10 0 0 1 0 14.2"/>',
  ap_queue: '<path d="M4 6h12M4 11h12M4 16h7M15 15v5l4-2.5z"/>',
  ap_mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/>',
  ap_speaker: '<rect x="6" y="3" width="12" height="18" rx="2"/><circle cx="12" cy="14" r="3.2"/><circle cx="12" cy="7.5" r="1"/>',
  ap_drag: '<path d="M5 9h14M5 15h14"/>',
  ap_coin: '<circle cx="12" cy="12" r="8.5"/><path d="M14.5 9.2c-.5-.9-1.4-1.3-2.5-1.3-1.5 0-2.6.8-2.6 2s1 1.7 2.6 2.1 2.7.9 2.7 2.2-1.2 2-2.7 2c-1.2 0-2.2-.5-2.7-1.4M12 6.5v11"/>',
  ap_moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
  ap_ext: '<path d="M7 17L17 7M9 7h8v8"/>',
});

const TPL = {};
let GID = 0;
const H = (st, px) => Math.round(px * st.hscale);
const HC = (st, px, cap = 1.15) => Math.round(px * Math.min(st.hscale, cap)); // display sizes capped so serif styles don't push sections off-screen
const mix = (a, pct, b) => `color-mix(in oklab,${a} ${pct}%,${b})`;
const ini = (n) => n.split(" ").map((w) => w[0]).join("").slice(0, 2);
const fillPlay = (s, c = "currentColor") => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="${c}" aria-hidden="true"><path d="M7.5 4.8v14.4l11.6-7.2z"/></svg>`;
const fillPause = (s, c = "currentColor") => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="${c}" aria-hidden="true"><rect x="6" y="4.5" width="4" height="15" rx="1"/><rect x="14" y="4.5" width="4" height="15" rx="1"/></svg>`;
const fillHeart = (s) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>`;
const roundBtn = (sz, inner) => `<span style="width:${sz}px;height:${sz}px;flex:none;border-radius:50%;display:grid;place-items:center;background:var(--primary);color:var(--on-primary);box-shadow:var(--shadow)">${inner}</span>`;
const toggle = (on, w = 34) => `<span style="width:${w}px;height:${Math.round(w * 0.58)}px;border-radius:999px;flex:none;padding:2px;display:flex;justify-content:${on ? "flex-end" : "flex-start"};background:${on ? "var(--primary)" : mix("var(--text)", 18, "var(--surface)")}"><span style="width:${Math.round(w * 0.58) - 4}px;height:100%;border-radius:50%;background:${on ? "var(--on-primary)" : "var(--surface)"}"></span></span>`;
const xp = () => `<span title="Explicit" style="display:inline-grid;place-items:center;width:15px;height:15px;flex:none;border-radius:3px;background:${mix("var(--text)", 55, "var(--surface)")};color:var(--surface);font:700 9px var(--font-b)">E</span>`;

/* ---------------------------------------------------------------- illustrative album covers (fixed natural tones) */
function art(kind) {
  const id = "ap" + GID++;
  const lg = (n, a, b, h) => `<linearGradient id="${id}${n}" x1="0" y1="0" x2="${h ? 1 : 0}" y2="${h ? 0 : 1}"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
  let s;
  switch (kind) {
    case "tide": s = `<defs>${lg("s", "#f6cb9c", "#e3876c")}${lg("w", "#3d6f8f", "#1c3a52")}</defs><rect width="100" height="100" fill="url(#${id}s)"/><circle cx="50" cy="50" r="17" fill="#fff0d4"/>
<rect y="56" width="100" height="44" fill="url(#${id}w)"/><path d="M30 62h40M22 69h56M14 77h72M8 86h84" stroke="#fff0d4" stroke-opacity=".5" stroke-width="1.4"/>`; break;
    case "dune": s = `<defs>${lg("s", "#f3d6ab", "#eaa96f")}</defs><rect width="100" height="100" fill="url(#${id}s)"/><circle cx="70" cy="30" r="10" fill="#c4492f"/>
<path d="M0 66 Q30 46 58 62 T100 58 V100 H0Z" fill="#d98f52"/><path d="M0 78 Q40 62 70 76 T100 74 V100 H0Z" fill="#b8693a"/><path d="M0 90 Q34 80 60 90 T100 88 V100 H0Z" fill="#8c4a2b"/>`; break;
    case "bloom": s = `<rect width="100" height="100" fill="#ebe3d1"/><g style="mix-blend-mode:multiply"><circle cx="38" cy="46" r="23" fill="#d5683f"/><circle cx="63" cy="60" r="20" fill="#3f6b5a" opacity=".9"/><circle cx="62" cy="33" r="11" fill="#e8b44a"/></g><path d="M20 86h60" stroke="#2b2b2b" stroke-width="1.2"/>`; break;
    case "night": s = `<defs>${lg("s", "#1c2541", "#41507e")}</defs><rect width="100" height="100" fill="url(#${id}s)"/><circle cx="68" cy="30" r="11" fill="#f3e6c4"/><circle cx="72" cy="27" r="10" fill="#26315a"/>
${[[14, 18], [30, 10], [44, 26], [86, 14], [22, 40], [90, 44], [52, 8]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r=".9" fill="#f3e6c4"/>`).join("")}
<path d="M0 74 Q24 58 46 70 T100 64 V100 H0Z" fill="#141b31"/><rect x="58" y="62" width="9" height="8" fill="#f2b65a"/><path d="M56 63 l6.5-6 6.5 6z" fill="#141b31"/>`; break;
    case "grid": s = `<rect width="100" height="100" fill="#efe6d8"/>${[[0, 0, "#c75b39"], [34, 0, "#efe6d8"], [67, 0, "#2f4a5c"], [0, 34, "#e2b04a"], [34, 34, "#2f4a5c"], [67, 34, "#c75b39"], [0, 67, "#2f4a5c"], [34, 67, "#e2b04a"], [67, 67, "#efe6d8"]].map(([x, y, c]) => `<rect x="${x}" y="${y}" width="33" height="33" fill="${c}"/>`).join("")}
<path d="M34 34 a33 33 0 0 1 33 33 H34Z" fill="#efe6d8"/><path d="M67 0 a33 33 0 0 0 33 33 V0Z" fill="#e2b04a"/><circle cx="17" cy="84" r="9" fill="#c75b39"/>`; break;
    case "rings": s = `<rect width="100" height="100" fill="#24403b"/>${[34, 27, 20, 13, 6].map((r, i) => `<circle cx="50" cy="56" r="${r}" fill="none" stroke="${i % 2 ? "#d47f5a" : "#e7c58d"}" stroke-width="3"/>`).join("")}<rect y="86" width="100" height="14" fill="#1a2f2b"/>`; break;
    case "stripes": s = ["#f4d7b5", "#eeb48a", "#e08a6b", "#b85e5e", "#6f3f55", "#3b2a42"].map((c, i) => `<rect y="${i * 17}" width="100" height="17" fill="${c}"/>`).join("") + `<circle cx="30" cy="40" r="12" fill="#fbeee0" opacity=".9"/>`; break;
    case "forest": s = `<defs>${lg("s", "#d8e5d5", "#9dbfa8")}</defs><rect width="100" height="100" fill="url(#${id}s)"/>
${[[10, 70, 22], [26, 64, 30], [44, 72, 20], [60, 60, 34], [80, 68, 26], [94, 74, 18]].map(([x, y, h], i) => `<path d="M${x} ${y - h} L${x + 9} ${y + 12} H${x - 9}Z" fill="${i % 2 ? "#2f5a46" : "#3e7258"}"/>`).join("")}<rect y="82" width="100" height="18" fill="#24463a"/><rect y="50" width="100" height="6" fill="#eef3ea" opacity=".45"/>`; break;
    default: s = `<rect width="100" height="100" fill="#ccc"/>`;
  }
  return `<svg viewBox="0 0 100 100" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" aria-hidden="true" style="display:block">${s}</svg>`;
}
const cover = (kind, s, r = "var(--radius-sm)") => `<div style="width:${s}px;height:${s}px;flex:none;border-radius:${r};overflow:hidden">${art(kind)}</div>`;

/* ---------------------------------------------------------------- audio data */
// title, artist, album, duration, plays, explicit, cover
const TR = [
  ["Lanterns on the Weir", "Marisol Vane", "Salt Year", "4:12", "1,284,019", 0, "tide"],
  ["Paper Moons", "The Low Orchard", "Kitchen Radio", "3:38", "612,447", 0, "bloom"],
  ["Copper Wire Summer", "Kofi Arden", "Northbound Static", "3:05", "2,031,560", 1, "dune"],
  ["Halfway House Lights", "Juno & the Pale Hours", "Rooms We Rent", "5:21", "389,102", 0, "night"],
  ["Ferry at Six", "Sable Coast", "Low Tide Songs", "4:47", "174,860", 0, "stripes"],
  ["Glasshouse", "Wren Halloway", "Glasshouse EP", "2:58", "905,233", 1, "grid"],
  ["Saltmarsh", "Odile Brannock", "Estuary", "6:02", "88,391", 0, "rings"],
  ["Night Bus to Ardmore", "Teo Lindqvist", "Ardmore", "3:44", "456,718", 0, "night"],
  ["Brass Lungs", "Kofi Arden", "Northbound Static", "2:49", "1,102,875", 1, "dune"],
  ["Slow Signal", "The Low Orchard", "Kitchen Radio", "4:21", "297,036", 0, "bloom"],
  ["Driftwood Choir", "Sable Coast", "Low Tide Songs", "5:08", "143,529", 0, "stripes"],
  ["Kites over Lisnacree", "Odile Brannock", "Estuary", "3:57", "61,904", 0, "forest"],
];
const PLAYLISTS = [["Late Ferry", "Playlist · 28 songs", "stripes"], ["Salt Year", "Album · Marisol Vane", "tide"], ["Kitchen floor dancing", "Playlist · 41 songs", "bloom"], ["Northbound Static", "Album · Kofi Arden", "dune"], ["Rainy commute", "Playlist · 63 songs", "forest"]];
const audioSide = (p, active, activeList) => `<aside class="side" style="gap:1px"><div class="logo"><b></b>${esc(p.name)}</div>
${[["home", "Home"], ["search", "Discover"], ["ap_lib", "Library"], ["ap_radio", "Radio"], ["download", "Downloads"]].map(([i, l]) => `<div class="nav${l === active ? " on" : ""}">${ic(i)}${l}</div>`).join("")}
<div class="grp" style="display:flex;justify-content:space-between;align-items:center">Your library ${ic("plus", 14)}</div>
${PLAYLISTS.map(([n, m, k]) => `<div class="nav${n === activeList ? " on" : ""}" style="padding:5px 8px">${cover(k, 34)}<div style="min-width:0;line-height:1.3"><div style="font-weight:500;color:inherit;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:13px">${n}</div><div style="font-size:11px;font-weight:400;opacity:.85">${m}</div></div></div>`).join("")}
<div class="foot"><div class="avatar">LP</div><div style="line-height:1.3"><div style="font-weight:500">Lin Park</div><div class="muted" style="font-size:12px">Supporter · $6/mo</div></div></div></aside>`;

const scrub = (pct, a, b, h = 4) => `<div><div style="position:relative;height:${h}px;border-radius:9px;background:${mix("var(--text)", 14, "var(--surface)")}"><div style="width:${pct}%;height:100%;border-radius:9px;background:var(--primary)"></div><span style="position:absolute;left:${pct}%;top:50%;width:13px;height:13px;margin:-6.5px 0 0 -6.5px;border-radius:50%;background:var(--primary);border:2px solid var(--surface);box-shadow:var(--shadow-sm)"></span></div>
<div style="display:flex;justify-content:space-between;margin-top:7px"><span class="num muted" style="font-size:12px;font-weight:500">${a}</span><span class="num muted" style="font-size:12px;font-weight:500">${b}</span></div></div>`;
const transport = (big, gap) => `<div style="display:flex;align-items:center;justify-content:space-between;gap:${gap}px">
<span style="color:var(--primary);display:grid;justify-items:center;gap:2px">${ic("ap_shuffle", 20)}<span style="width:4px;height:4px;border-radius:50%;background:var(--primary)"></span></span>
<span>${ic("ap_prev", 26)}</span>
${roundBtn(big, fillPause(Math.round(big * 0.4)))}
<span>${ic("ap_next", 26)}</span>
<span class="muted" style="display:grid;justify-items:center;gap:2px">${ic("ap_repeat", 20)}<span style="width:4px;height:4px"></span></span></div>`;
const LYRICS = [["I left the boat keys under the stone", 0], ["where your father kept the good tobacco", 0], ["and every lantern on the weir", 2], ["was a small apology, burning", 1], ["We said the tide would make us honest", 1], ["it only made us late", 1], ["(it only made us late)", 1], ["Hold the rope, hold the rope", 1], ["the harbour lights are counting", 1]];
const CREDITS = [["Written by", "Marisol Vane, Ciarán Doherty"], ["Produced by", "Hollis Mbeki"], ["Mixed by", "Anouk de Vries at Saltbox Studio"], ["Recorded at", "Corran Hall, Galway"], ["Label", "Self-released · IE-T1W-26-00417"]];

/* ---------------------------------------------------------------- music-player */
TPL["music-player/web"] = (p, st) => {
  const q = TR.slice(1, 12);
  return `<div class="shell" style="grid-template-columns:232px 1fr 330px">${audioSide(p, "Home", "Late Ferry")}
<main class="main"><div class="top"><span class="btn" style="width:34px;padding:0">${ic("back", 16)}</span><div style="line-height:1.25"><div class="muted" style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.06em">Playing from playlist</div><div style="font-weight:600">Late Ferry</div></div><div class="search">${ic("search", 16)}Artists, songs, venues…</div><span class="btn" style="width:34px;padding:0">${ic("bell", 16)}</span></div>
<div style="flex:1;min-height:0;padding:24px 28px;display:grid;grid-template-columns:330px minmax(0,1fr);gap:28px;overflow:hidden">
<div style="display:flex;flex-direction:column;gap:14px;min-height:0">
<div class="card" style="width:330px;height:330px;padding:0;overflow:hidden;flex:none">${art("tide")}</div>
<div class="card" style="padding:14px 16px;display:grid;gap:10px"><div style="display:flex;justify-content:space-between;align-items:center"><div style="font-weight:600">Credits</div><span class="muted" style="font-size:12px">Liner notes</span></div>
${CREDITS.map(([k, v]) => `<div style="display:grid;grid-template-columns:88px 1fr;gap:8px;font-size:12px;line-height:1.35"><span class="muted">${k}</span><span>${v}</span></div>`).join("")}</div>
<div class="card" style="padding:12px 14px;display:flex;align-items:center;gap:12px;background:${mix("var(--accent)", 10, "var(--surface)")}"><span style="color:var(--accent)">${ic("ap_coin", 22)}</span><div style="flex:1;font-size:12px;line-height:1.35"><b>78%</b> of your Supporter share goes to Marisol Vane</div><span class="btn" style="height:30px">Tip $3</span></div>
<div class="card" style="padding:12px 16px;display:grid;gap:8px;flex:1;min-height:0;align-content:start;overflow:hidden"><div style="display:flex;justify-content:space-between;align-items:center"><div style="font-weight:600">On tour</div><span class="muted" style="font-size:12px">2 dates near you</span></div>
${[["14", "NOV", "Corran Hall", "Galway · 8 tickets left"], ["22", "NOV", "The Lantern Rooms", "Dublin · On sale Fri"]].map(([d, m, v, n]) => `<div style="display:flex;align-items:center;gap:12px;font-size:12px"><div style="width:38px;text-align:center;line-height:1.1;padding:4px 0;border-radius:var(--radius-sm);background:${mix("var(--primary)", 10, "var(--surface)")}"><div class="num" style="font-size:15px">${d}</div><div style="font-size:9px;font-weight:600;letter-spacing:.06em;color:var(--muted)">${m}</div></div><div style="flex:1;line-height:1.3"><div style="font-weight:600;font-size:13px">${v}</div><div class="muted">${n}</div></div>${ic("chevron", 14)}</div>`).join("")}</div></div>
<div style="display:flex;flex-direction:column;gap:16px;min-width:0;min-height:0">
<div><div style="display:flex;gap:6px;margin-bottom:10px"><span class="badge">Single · 2026</span><span class="badge">Lossless 24-bit</span></div>
<h1 style="font-size:${H(st, 38)}px">Lanterns on the Weir</h1>
<div style="display:flex;align-items:center;gap:10px;margin-top:10px"><div class="avatar" style="width:30px;height:30px">MV</div><div style="line-height:1.3"><div style="font-weight:600">Marisol Vane</div><div class="muted" style="font-size:12px">48,210 monthly listeners · Galway, IE</div></div><span class="btn" style="height:30px;margin-left:6px">Following</span></div></div>
<div style="display:flex;gap:8px"><span class="btn" style="color:var(--primary)">${fillHeart(16)}Liked</span><span class="btn">${ic("plus", 16)}Add to playlist</span><span class="btn">${ic("share", 16)}Share</span><span class="btn" style="width:36px;padding:0">${ic("more", 16)}</span></div>
${scrub(41, "1:43", "4:12")}
<div style="padding:0 18px">${transport(58, 10)}</div>
<div class="card" style="flex:1;min-height:0;padding:16px 20px;overflow:hidden;display:flex;flex-direction:column;gap:10px">
<div style="display:flex;align-items:center;gap:6px;font-size:13px"><span style="font-weight:600;padding:4px 10px;border-radius:999px;background:${mix("var(--primary)", 12, "var(--surface)")}">Lyrics</span><span class="muted" style="padding:4px 10px">Credits</span><span class="muted" style="padding:4px 10px">About the artist</span><span class="muted" style="margin-left:auto;font-size:12px;display:flex;gap:4px;align-items:center">${ic("clock", 13)}Synced</span></div>
${LYRICS.map(([l, s]) => `<div style="font-size:${s === 2 ? 20 : 17}px;line-height:1.3;font-weight:${s === 2 ? 700 : 500};${s === 0 ? "color:var(--muted);opacity:.7" : s === 1 ? "color:var(--muted)" : "color:var(--text);border-left:3px solid var(--primary);padding-left:10px;margin-left:-13px"}">${l}</div>`).join("")}
<div class="muted" style="margin-top:auto;padding-top:10px;border-top:1px solid var(--border);font-size:12px;display:flex;justify-content:space-between"><span>Lyrics written and synced by the artist</span><span style="color:var(--primary);font-weight:600">Open full screen</span></div></div></div></div></main>
<aside style="border-left:1px solid var(--border);display:flex;flex-direction:column;overflow:hidden;background:${mix("var(--surface)", 60, "var(--bg)")}">
<div style="height:60px;flex:none;display:flex;align-items:center;gap:6px;padding:0 18px;border-bottom:1px solid var(--border);font-size:13px"><span style="font-weight:600;padding:5px 10px;border-radius:999px;background:${mix("var(--primary)", 12, "var(--surface)")}">Up next</span><span class="muted" style="padding:5px 10px">History</span><span class="muted" style="margin-left:auto">Clear</span></div>
<div style="padding:14px 18px;display:flex;flex-direction:column;gap:6px;flex:1;min-height:0">
<div class="muted" style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.06em">Now playing</div>
<div style="display:flex;align-items:center;gap:10px;padding:6px 8px;margin:0 -8px;border-radius:var(--radius);background:${mix("var(--primary)", 10, "var(--surface)")}">${cover("tide", 40)}<div style="flex:1;min-width:0;line-height:1.3"><div style="font-weight:600;color:var(--primary)">Lanterns on the Weir</div><div class="muted" style="font-size:12px">Marisol Vane</div></div><span style="display:flex;align-items:flex-end;gap:2px;height:14px">${[9, 14, 6, 11].map((h) => `<span style="width:3px;height:${h}px;background:var(--primary);border-radius:1px"></span>`).join("")}</span></div>
<div class="muted" style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;margin-top:8px">Next from Late Ferry · 27 songs</div>
${q.map(([t, a, , d, , e, k]) => `<div style="display:flex;align-items:center;gap:10px;padding:4px 0">${cover(k, 40)}<div style="flex:1;min-width:0;line-height:1.3"><div style="font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${t}</div><div class="muted" style="font-size:12px;display:flex;gap:5px;align-items:center">${e ? xp() : ""}${a}</div></div><span class="num muted" style="font-size:12px;font-weight:500">${d}</span><span class="muted">${ic("ap_drag", 16)}</span></div>`).join("")}
<div style="margin-top:auto;display:grid;gap:10px;padding-top:12px;border-top:1px solid var(--border)"><div style="display:flex;align-items:center;gap:10px;font-size:13px"><div style="flex:1"><div style="font-weight:500">Autoplay similar artists</div><div class="muted" style="font-size:12px">When the queue ends</div></div>${toggle(true)}</div>
<div style="display:flex;align-items:center;gap:10px;font-size:13px"><span style="color:var(--primary)">${ic("ap_speaker", 18)}</span><div style="flex:1">Kitchen speaker</div><span class="muted">${ic("ap_volume", 16)}</span><span style="width:70px;height:4px;border-radius:9px;background:${mix("var(--text)", 14, "var(--surface)")}"><span style="display:block;width:64%;height:100%;border-radius:9px;background:var(--text)"></span></span></div></div></div></aside></div>`;
};
TPL["music-player/mobile"] = (p, st) => `<div class="phone">${status()}<div class="mtop">${ic("chevdown", 24)}<span class="btn" style="height:30px;border-radius:999px;font-size:12px;gap:5px">${ic("ap_queue", 15)}Queue · 27</span>${ic("share", 22)}</div>
<div class="mbody" style="padding-top:6px;gap:14px">
<div class="card" style="width:282px;height:282px;padding:0;overflow:hidden;align-self:center;flex:none;box-shadow:var(--shadow-lg)">${art("tide")}</div>
<div style="display:flex;align-items:center;gap:12px"><div style="flex:1;min-width:0"><h1 style="font-size:${H(st, 22)}px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">Lanterns on the Weir</h1><div class="muted" style="margin-top:2px">Marisol Vane · Salt Year</div></div><span style="color:var(--primary)">${fillHeart(24)}</span></div>
<div style="display:flex;gap:8px;overflow:hidden;margin-right:-20px">${[["ap_mic", "Lyrics", 1], ["doc", "Credits"], ["plus", "Save to playlist"], ["ap_moon", "Sleep timer"], ["ap_radio", "Song radio"]].map(([i, t, on]) => `<span class="btn" style="height:30px;border-radius:999px;font-size:12px;flex:none;gap:5px;${on ? "background:" + mix("var(--primary)", 12, "var(--surface)") + ";color:var(--primary);border-color:transparent" : ""}">${ic(i, 14)}${t}</span>`).join("")}</div>
${scrub(41, "1:43", "−2:29")}
<div style="padding:0 6px">${transport(64, 4)}</div>
<div style="display:flex;justify-content:space-between;align-items:center;font-size:12px;color:var(--muted)"><span style="display:flex;gap:6px;align-items:center;color:var(--primary);font-weight:600">${ic("ap_speaker", 16)}Kitchen speaker</span><span style="display:flex;gap:6px;align-items:center">${ic("ap_moon", 18)}<span class="num" style="font-size:12px;font-weight:500">Off</span></span></div>
<div class="card" style="padding:12px 14px;display:grid;gap:8px"><div style="display:flex;justify-content:space-between;align-items:center"><div style="font-weight:600;font-size:13px">Up next</div><span class="muted" style="font-size:12px">27 songs · Shuffle on</span></div>
${TR.slice(1, 2).map(([t, a, , d, , e, k]) => `<div style="display:flex;align-items:center;gap:10px">${cover(k, 36)}<div style="flex:1;min-width:0;line-height:1.3"><div style="font-weight:500;font-size:13px">${t}</div><div class="muted" style="font-size:12px;display:flex;gap:5px;align-items:center">${e ? xp() : ""}${a}</div></div><span class="num muted" style="font-size:12px;font-weight:500">${d}</span></div>`).join("")}</div></div>
${tabBar("Home", [["home", "Home"], ["search", "Discover"], ["ap_lib", "Library"], ["download", "Downloads"]])}</div>`;

/* ---------------------------------------------------------------- playlist */
// download state per track: done | ring:<pct> | queued | none
const DL = ["done", "done", "done", "ring:.72", "ring:.18", "queued", "queued", "none", "none", "none", "none", "none"];
const ringSvg = (pct, s = 18) => `<svg width="${s}" height="${s}" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8" fill="none" stroke="${mix("var(--primary)", 20, "var(--surface)")}" stroke-width="2.4"/><circle cx="10" cy="10" r="8" fill="none" stroke="var(--primary)" stroke-width="2.4" stroke-linecap="round" stroke-dasharray="${(pct * 50.27).toFixed(1)} 50.27" transform="rotate(-90 10 10)"/></svg>`;
const doneDot = (s = 18) => `<span style="width:${s}px;height:${s}px;border-radius:50%;display:grid;place-items:center;background:var(--primary);color:var(--on-primary)">${ic("download", s - 6)}</span>`;
const dlIcon = (d, s = 18) => d === "done" ? doneDot(s) : d.startsWith("ring") ? ringSvg(+d.split(":")[1], s) : d === "queued" ? `<span class="muted">${ic("clock", s)}</span>` : `<span style="width:${s}px"></span>`;
const plHeadArt = (s) => `<div class="card" style="width:${s}px;height:${s}px;padding:0;overflow:hidden;flex:none;position:relative">${art("stripes")}<div style="position:absolute;left:10%;bottom:9%;font:700 ${Math.round(s * 0.11)}px var(--font-b);color:#fbeee0;letter-spacing:-.02em;line-height:1">Late<br>Ferry</div></div>`;

TPL["playlist/web"] = (p, st) => {
  const prog = [["Halfway House Lights", "Juno & the Pale Hours", 72, "13.1 of 18.2 MB", "night"], ["Ferry at Six", "Sable Coast", 18, "3.0 of 16.4 MB", "stripes"], ["Glasshouse", "Wren Halloway", 0, "Queued · 10.2 MB", "grid"]];
  return `<div class="shell" style="grid-template-columns:232px 1fr 300px">${audioSide(p, "Library", "Late Ferry")}
<main class="main"><div class="top"><span class="btn" style="width:34px;padding:0">${ic("back", 16)}</span><span class="muted">Library</span><span class="muted">/</span><span style="font-weight:500">Late Ferry</span><div class="search">${ic("search", 16)}Search in playlist</div></div>
<div style="flex:1;min-height:0;padding:24px 28px;display:flex;flex-direction:column;gap:18px;overflow:hidden">
<div style="display:flex;gap:24px;align-items:flex-end">${plHeadArt(196)}<div style="flex:1;min-width:0;display:grid;gap:8px">
<div class="muted" style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.08em">Public playlist</div><h1 style="font-size:${H(st, 40)}px">Late Ferry</h1>
<p class="muted" style="max-width:560px;line-height:1.45">Quiet coastal folk and slow indie for the last crossing home. Every artist here is independent and paid per stream through ${esc(p.name)}.</p>
<div style="display:flex;align-items:center;gap:8px;font-size:13px;flex-wrap:wrap"><div class="avatar" style="width:24px;height:24px;font-size:10px">TR</div><b>Teodora Ruiz</b><span class="muted">· 4,812 saves · 28 songs · 1 h 52 min · updated 2 days ago</span></div>
<div style="display:flex;align-items:center;gap:10px;margin-top:6px">${roundBtn(48, fillPlay(20))}<span class="btn">${ic("ap_shuffle", 16)}Shuffle</span><span class="btn" style="color:var(--primary)">${ringSvg(0.32, 16)}Downloading 9 of 28</span><span class="btn" style="width:36px;padding:0;color:var(--primary)">${fillHeart(16)}</span><span class="btn" style="width:36px;padding:0">${ic("share", 16)}</span><span class="btn" style="width:36px;padding:0">${ic("more", 16)}</span><span class="muted" style="margin-left:auto;font-size:13px;display:flex;gap:6px;align-items:center">${ic("list", 16)}Custom order</span></div></div></div>
<div class="card" style="overflow:hidden;flex:1;min-height:0"><div style="display:grid;grid-template-columns:34px minmax(0,1fr) 170px 104px 34px 52px;gap:12px;padding:9px 16px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);border-bottom:1px solid var(--border)"><span>#</span><span>Title</span><span>Album</span><span style="text-align:right">Plays</span><span></span><span style="text-align:right">${ic("clock", 14)}</span></div>
${TR.slice(0, 11).map(([t, a, al, d, pl, e, k], i) => `<div style="display:grid;grid-template-columns:34px minmax(0,1fr) 170px 104px 34px 52px;gap:12px;align-items:center;padding:6px 16px;font-size:13px;${i === 0 ? `background:${mix("var(--primary)", 9, "var(--surface)")}` : ""}"><span class="num ${i ? "muted" : ""}" style="font-size:13px;font-weight:500;${i ? "" : "color:var(--primary)"}">${i ? i + 1 : `<span style="display:flex;align-items:flex-end;gap:2px;height:12px">${[7, 12, 5].map((h) => `<span style="width:3px;height:${h}px;background:var(--primary);border-radius:1px"></span>`).join("")}</span>`}</span>
<div style="display:flex;align-items:center;gap:10px;min-width:0">${cover(k, 32)}<div style="min-width:0;line-height:1.3"><div style="font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;${i ? "" : "color:var(--primary)"}">${t}</div><div class="muted" style="font-size:12px;display:flex;gap:5px;align-items:center">${e ? xp() : ""}${a}</div></div></div>
<span class="muted" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${al}</span><span class="num muted" style="text-align:right;font-size:13px;font-weight:500">${pl}</span><span style="display:grid;place-items:center">${dlIcon(DL[i])}</span><span class="num muted" style="text-align:right;font-size:13px;font-weight:500">${d}</span></div>`).join("")}</div></div></main>
<aside style="border-left:1px solid var(--border);display:flex;flex-direction:column;overflow:hidden;background:${mix("var(--surface)", 60, "var(--bg)")}">
<div style="height:60px;flex:none;display:flex;align-items:center;justify-content:space-between;padding:0 18px;border-bottom:1px solid var(--border)"><div style="font-weight:600">Downloads</div><span class="muted" style="font-size:13px">Pause all</span></div>
<div style="padding:16px 18px;display:flex;flex-direction:column;gap:14px;flex:1;min-height:0">
<div style="display:grid;gap:6px"><div style="display:flex;justify-content:space-between;font-size:12px"><span class="muted">On this device</span><span class="num" style="font-size:12px">3.2 GB of 8 GB</span></div><div style="height:6px;border-radius:9px;background:${mix("var(--text)", 12, "var(--surface)")};display:flex;overflow:hidden"><span style="width:34%;background:var(--primary)"></span><span style="width:6%;background:var(--accent)"></span></div><div class="muted" style="font-size:11px;display:flex;gap:12px"><span style="display:flex;gap:4px;align-items:center"><span style="width:7px;height:7px;border-radius:2px;background:var(--primary)"></span>Music 2.7 GB</span><span style="display:flex;gap:4px;align-items:center"><span style="width:7px;height:7px;border-radius:2px;background:var(--accent)"></span>Pending 0.5 GB</span></div></div>
<div class="muted" style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.06em">In progress · 3</div>
${prog.map(([t, a, pc, sz, k]) => `<div style="display:flex;gap:10px;align-items:center">${cover(k, 38)}<div style="flex:1;min-width:0;display:grid;gap:5px"><div style="display:flex;justify-content:space-between;gap:6px;font-size:13px"><span style="font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${t}</span><span class="num" style="font-size:12px;${pc ? "color:var(--primary)" : "color:var(--muted)"}">${pc ? pc + "%" : "—"}</span></div><div style="height:4px;border-radius:9px;background:${mix("var(--text)", 12, "var(--surface)")}"><div style="width:${pc}%;height:100%;border-radius:9px;background:var(--primary)"></div></div><div class="muted" style="font-size:11px">${sz}</div></div><span class="muted">${ic(pc ? "ap_pause" : "x", 15)}</span></div>`).join("")}
<div style="display:flex;gap:10px;align-items:center;padding:10px 12px;border-radius:var(--radius);border:1px dashed ${mix("var(--accent)", 60, "var(--border)")};background:${mix("var(--accent)", 8, "var(--surface)")}"><span style="color:var(--accent)">${ic("refresh", 18)}</span><div style="flex:1;font-size:12px;line-height:1.35"><b>Saltmarsh</b> failed — connection lost<div class="muted">Odile Brannock · 22.4 MB</div></div><span style="color:var(--primary);font-weight:600;font-size:12px">Retry</span></div>
<div class="muted" style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.06em">Queued · 15</div>
${TR.slice(7, 12).map(([t, a, , , , , k]) => `<div style="display:flex;gap:10px;align-items:center;font-size:13px">${cover(k, 30)}<div style="flex:1;min-width:0;line-height:1.3"><div style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${t}</div><div class="muted" style="font-size:11px">${a}</div></div><span class="muted">${ic("clock", 15)}</span></div>`).join("")}
<div style="margin-top:auto;display:grid;gap:10px;padding-top:12px;border-top:1px solid var(--border);font-size:13px"><div style="display:flex;align-items:center;gap:10px"><span style="flex:1">Download on Wi-Fi only</span>${toggle(true)}</div><div style="display:flex;align-items:center;gap:10px"><span style="flex:1">Quality</span><span class="muted">High · 320 kbps</span>${ic("chevron", 14)}</div></div></div></aside></div>`;
};
TPL["playlist/mobile"] = (p, st) => `<div class="phone">${status()}<div class="mtop">${ic("back", 22)}<span class="muted" style="font-size:13px">Library</span>${ic("more", 22)}</div>
<div class="mbody" style="padding-top:2px;gap:12px">
<div style="display:flex;gap:14px;align-items:flex-end">${plHeadArt(132)}<div style="min-width:0;display:grid;gap:5px"><div class="muted" style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.08em">Public playlist</div><h1 style="font-size:${H(st, 26)}px">Late Ferry</h1>
<div style="display:flex;align-items:center;gap:6px;font-size:12px"><div class="avatar" style="width:20px;height:20px;font-size:9px">TR</div><b>Teodora Ruiz</b></div><div class="muted" style="font-size:12px">28 songs · 1 h 52 min · 4,812 saves</div></div></div>
<div style="display:flex;align-items:center;gap:14px"><span style="color:var(--primary)">${ringSvg(0.32, 26)}</span><span style="color:var(--primary)">${fillHeart(24)}</span><span>${ic("share", 22)}</span><span style="margin-left:auto">${ic("ap_shuffle", 24)}</span>${roundBtn(52, fillPlay(22))}</div>
<div class="card" style="padding:10px 12px;display:grid;gap:6px"><div style="display:flex;justify-content:space-between;font-size:12px"><span style="font-weight:600">Downloading 9 of 28 songs</span><span class="num" style="font-size:12px;color:var(--primary)">32%</span></div><div style="height:4px;border-radius:9px;background:${mix("var(--text)", 12, "var(--surface)")}"><div style="width:32%;height:100%;border-radius:9px;background:var(--primary)"></div></div><div class="muted" style="font-size:11px">Wi-Fi only · 41 MB left · 1 failed, tap to retry</div></div>
<div style="display:flex;flex-direction:column">${TR.slice(0, 7).map(([t, a, , d, , e, k], i) => `<div style="display:flex;align-items:center;gap:11px;padding:6px 0">${cover(k, 42)}<div style="flex:1;min-width:0;line-height:1.3"><div style="font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;${i ? "" : "color:var(--primary)"}">${t}</div><div class="muted" style="font-size:12px;display:flex;gap:5px;align-items:center">${dlIcon(DL[i], 14)}${e ? xp() : ""}${a} · <span class="num" style="font-size:12px;font-weight:500">${d}</span></div></div><span class="muted">${ic("more", 18)}</span></div>`).join("")}</div></div>
${tabBar("Library", [["home", "Home"], ["search", "Discover"], ["ap_lib", "Library"], ["download", "Downloads"]])}</div>`;

/* ---------------------------------------------------------------- portfolio artwork (fixed natural tones) */
function work(kind) {
  const id = "pw" + GID++;
  const lg = (n, a, b) => `<linearGradient id="${id}${n}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
  const phone = (x, y, w, h, hd, acc, rot = 0) => `<g transform="rotate(${rot} ${x + w / 2} ${y + h / 2})"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${w * 0.14}" fill="#1d1d1f"/><rect x="${x + 4}" y="${y + 4}" width="${w - 8}" height="${h - 8}" rx="${w * 0.11}" fill="#fbfaf7"/>
<rect x="${x + 4}" y="${y + 4}" width="${w - 8}" height="${h * 0.26}" rx="${w * 0.11}" fill="${hd}"/><rect x="${x + 4}" y="${y + h * 0.2}" width="${w - 8}" height="${h * 0.1}" fill="${hd}"/>
<rect x="${x + 12}" y="${y + h * 0.12}" width="${w * 0.45}" height="5" rx="2.5" fill="#fbfaf7" opacity=".85"/><rect x="${x + 12}" y="${y + h * 0.36}" width="${w - 24}" height="${h * 0.12}" rx="5" fill="#eceae4"/><rect x="${x + 12}" y="${y + h * 0.51}" width="${w - 24}" height="${h * 0.12}" rx="5" fill="#eceae4"/>
<rect x="${x + 18}" y="${y + h * 0.39}" width="${w * 0.35}" height="4" rx="2" fill="#9a968d"/><rect x="${x + 18}" y="${y + h * 0.54}" width="${w * 0.45}" height="4" rx="2" fill="#9a968d"/><rect x="${x + 12}" y="${y + h * 0.8}" width="${w - 24}" height="${h * 0.09}" rx="${h * 0.045}" fill="${acc}"/></g>`;
  let s;
  switch (kind) {
    case "rail": s = `<defs>${lg("b", "#dfe8e1", "#a9c5b8")}</defs><rect width="400" height="300" fill="url(#${id}b)"/><path d="M-10 250 C120 210 200 280 410 200" stroke="#1f4e46" stroke-width="10" fill="none" opacity=".25"/><path d="M-10 250 C120 210 200 280 410 200" stroke="#fbfaf7" stroke-width="2" stroke-dasharray="10 8" fill="none"/>
${phone(96, 40, 100, 210, "#1f4e46", "#e0703e", -6)}${phone(212, 52, 100, 210, "#1f4e46", "#e0703e", 5)}`; break;
    case "rope": s = `<rect width="400" height="300" fill="#efe2cc"/>${[110, 92, 74, 56, 38].map((r, i) => `<circle cx="140" cy="160" r="${r}" fill="none" stroke="${i % 2 ? "#8f5a2e" : "#b5763f"}" stroke-width="9"/>`).join("")}
<rect x="236" y="70" width="136" height="170" rx="6" fill="#fbf7ef" stroke="#d9c7a8"/><rect x="250" y="84" width="108" height="78" rx="3" fill="#c9a77a"/><circle cx="304" cy="123" r="24" fill="none" stroke="#8f5a2e" stroke-width="6"/><rect x="250" y="172" width="70" height="7" rx="3" fill="#3a2d22"/><rect x="250" y="186" width="44" height="6" rx="3" fill="#9a8a72"/><rect x="250" y="206" width="108" height="20" rx="3" fill="#3a2d22"/>`; break;
    case "dash": s = `<rect width="400" height="300" fill="#1f2a36"/><rect x="40" y="44" width="320" height="214" rx="8" fill="#f5f3ee"/><rect x="40" y="44" width="320" height="22" rx="8" fill="#e3dfd6"/>${[54, 64, 74].map((x) => `<circle cx="${x}" cy="55" r="3" fill="#b9b3a7"/>`).join("")}
<rect x="40" y="66" width="70" height="192" fill="#ebe7df"/>${[84, 100, 116, 132].map((y) => `<rect x="52" y="${y}" width="44" height="6" rx="3" fill="#b9b3a7"/>`).join("")}
<path d="M126 200 L160 176 L194 186 L228 150 L262 160 L296 120 L340 132" stroke="#e39b57" stroke-width="3" fill="none"/><path d="M126 200 L160 176 L194 186 L228 150 L262 160 L296 120 L340 132 V236 H126Z" fill="#e39b57" opacity=".15"/>
${[0, 1, 2, 3].map((i) => `<rect x="${126 + i * 54}" y="80" width="46" height="26" rx="4" fill="${i ? "#e3dfd6" : "#6c8fa8"}"/>`).join("")}`; break;
    case "phone": s = `<defs>${lg("b", "#f4cfae", "#e39a7b")}</defs><rect width="400" height="300" fill="url(#${id}b)"/><circle cx="320" cy="70" r="60" fill="#f7dcc2" opacity=".6"/>
${phone(120, 36, 104, 220, "#7a3b2e", "#2f5a46", -4)}<rect x="244" y="96" width="104" height="120" rx="10" fill="#fbfaf7"/><rect x="256" y="110" width="80" height="44" rx="6" fill="#d9b48f"/><path d="M262 148 l16-18 12 12 10-8 14 14" stroke="#7a3b2e" stroke-width="3" fill="none"/><rect x="256" y="164" width="56" height="7" rx="3" fill="#3a2d22"/><rect x="256" y="178" width="80" height="22" rx="11" fill="#2f5a46"/>`; break;
    case "flow": s = `<rect width="400" height="300" fill="#e8ece6"/>${[["Search", 30], ["Pick fare", 150], ["Pay", 270]].map(([t, x], i) => `${phone(x, 30, 100, 210, "#1f4e46", i === 2 ? "#e0703e" : "#9fb8ac")}<text x="${x + 50}" y="266" text-anchor="middle" font-family="system-ui,sans-serif" font-size="12" font-weight="600" fill="#1f4e46">${i + 1} · ${t}</text>`).join("")}
<path d="M134 135 h12 M254 135 h12" stroke="#1f4e46" stroke-width="2"/>`; break;
    case "type": s = `<rect width="400" height="300" fill="#26324a"/><text x="200" y="210" text-anchor="middle" font-family="Georgia,serif" font-size="190" fill="#f1c27d">Aa</text><rect x="40" y="244" width="320" height="2" fill="#f1c27d" opacity=".5"/>${["#f1c27d", "#e37b5b", "#8fb3a6", "#f5efe4"].map((c, i) => `<rect x="${40 + i * 30}" y="258" width="22" height="22" rx="11" fill="${c}"/>`).join("")}`; break;
    default: s = `<rect width="400" height="300" fill="#ccc"/>`;
  }
  const fit = kind === "flow"; // the flow diagram must show whole phones + step labels: letterbox on its own background
  return `<svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMid ${fit ? "meet" : "slice"}" aria-hidden="true" style="display:block${fit ? ";background:#e8ece6" : ""}">${s}</svg>`;
}
const panel = (kind, h, r = "var(--radius-lg)") => `<div style="height:${h}px;border-radius:${r};overflow:hidden;border:1px solid var(--border);flex:none">${work(kind)}</div>`;

const PROJECTS = [["Kestrel Rail", "Ticketing app redesign", "2026", "Lead designer + React Native", "rail"],
  ["Oakum & Daughters", "Storefront for a rope maker", "2025", "Design + Shopify build", "rope"],
  ["Fathom", "Research workspace design system", "2025", "Design systems in code", "dash"],
  ["Harbour Tool Library", "Borrowing and booking app", "2024", "UX + front-end", "phone"]];
const pfMail = (p) => `hello@${p.name.toLowerCase().replace(/[^a-z]/g, "")}.studio`;
const pfMark = (p, st, px) => `<div class="h" style="font-size:${H(st, px)}px;white-space:nowrap">${esc(p.name)}<span style="color:var(--primary)">.</span></div>`;
const pfHeader = (p, st, active) => `<header style="display:flex;align-items:center;gap:30px;padding:18px 64px;border-bottom:1px solid var(--border);flex:none">${pfMark(p, st, 20)}
<nav style="display:flex;gap:26px;margin-left:24px">${["Work", "Services", "About", "Notes"].map((t) => `<span style="${t === active ? "font-weight:600;border-bottom:2px solid var(--primary);padding-bottom:2px" : "color:var(--muted)"}">${t}</span>`).join("")}</nav>
<span class="badge" style="margin-left:auto;gap:6px"><span style="width:7px;height:7px;border-radius:50%;background:currentColor"></span>Booking from January 2027</span><button class="btn primary">Start a project</button></header>`;
const pfMHeader = (p, st) => `<header style="display:flex;align-items:center;justify-content:space-between;padding:8px 20px 12px;border-bottom:1px solid var(--border);flex:none">${pfMark(p, st, 19)}<span style="display:flex;gap:14px;align-items:center"><span class="badge" style="gap:5px"><span style="width:6px;height:6px;border-radius:50%;background:currentColor"></span>Jan 2027</span>${ic("menu", 22)}</span></header>`;

/* ---------------------------------------------------------------- portfolio-home */
TPL["portfolio-home/web"] = (p, st) => `<div style="height:100%;display:flex;flex-direction:column;overflow:hidden">${pfHeader(p, st, "Work")}
<div style="flex:1;min-height:0;padding:34px 64px 30px;display:flex;flex-direction:column;gap:28px">
<section style="display:grid;grid-template-columns:minmax(0,1fr) 420px;gap:48px;align-items:end">
<div><div class="muted" style="font-size:13px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;margin-bottom:14px">Product designer &amp; front-end developer · Lisbon</div>
<h1 style="font-size:${HC(st, 48)}px;max-width:780px">I design digital products, then build the front-end that ships them.</h1>
<p class="muted" style="font-size:16px;margin-top:14px;max-width:620px">Nine years across transport, retail and research tools. One person from first sketch to production React, so nothing gets lost in hand-off.</p></div>
<div style="display:grid;gap:12px">
<div class="card feat" style="padding:18px 20px;background:var(--text);color:var(--bg);border-color:var(--text);display:flex;align-items:center;gap:14px"><div style="flex:1"><div style="font-size:12px;opacity:.7;font-weight:600;text-transform:uppercase;letter-spacing:.06em">Hiring for a project?</div><div style="font-weight:600;font-size:16px;margin-top:3px">Book a 20-minute intro call</div><div style="font-size:13px;opacity:.75;margin-top:2px">Sprints from €6,500 · replies within a day</div></div><span class="btn primary" style="width:42px;height:42px;padding:0">${ic("arrow", 18)}</span></div>
<div class="card" style="padding:18px 20px;display:flex;align-items:center;gap:14px"><div style="flex:1"><div class="muted" style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.06em">Just looking?</div><div style="font-weight:600;font-size:16px;margin-top:3px">See 12 selected projects</div><div class="muted" style="font-size:13px;margin-top:2px">Case studies with process and outcomes</div></div><span class="btn" style="width:42px;height:42px;padding:0">${ic("chevdown", 18)}</span></div></div></section>
<section style="display:flex;flex-direction:column;gap:14px;flex:1;min-height:0"><div style="display:flex;align-items:baseline;gap:14px;border-top:1px solid var(--border);padding-top:16px"><h2 style="font-size:${H(st, 22)}px">Selected work</h2><span class="muted num" style="font-size:13px;font-weight:500">04 / 12</span><span style="margin-left:auto;display:flex;gap:6px">${["All", "Apps", "Web", "Systems"].map((t, i) => `<span class="btn" style="height:28px;padding:0 11px;font-size:12px;${i ? "border-color:transparent;background:none;color:var(--muted)" : ""}">${t}</span>`).join("")}</span><span style="color:var(--primary);font-weight:600;font-size:13px;display:flex;gap:4px;align-items:center">Full index ${ic("arrow", 14)}</span></div>
<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:18px;flex:1;min-height:0">${PROJECTS.map(([c, t, y, r, k]) => `<div style="display:grid;grid-template-rows:minmax(0,1fr) auto auto auto;gap:9px;min-height:0"><div style="min-height:120px;border-radius:var(--radius);overflow:hidden;border:1px solid var(--border)">${work(k)}</div><div style="display:flex;justify-content:space-between;gap:8px;align-items:baseline"><b>${c}</b><span class="num muted" style="font-size:12px;font-weight:500">${y}</span></div><div style="font-size:13px;line-height:1.35;margin-top:-6px">${t}</div><div class="muted" style="font-size:12px;margin-top:-6px">${r}</div></div>`).join("")}</div></section>
<section style="display:grid;grid-template-columns:repeat(3,1fr) 1.15fr;gap:18px">
${[["spark", "Product design sprints", "2–6 weeks. Research, flows and tested prototypes for one problem.", "from €6,500"], ["grid", "Design systems in code", "Tokens, Figma library and a React component kit that match.", "from €12,000"], ["bolt", "Front-end builds", "Next.js or Astro, accessible to WCAG 2.2 AA, handed over with docs.", "€720 / day"]].map(([i, t, d, pr]) => `<div class="card" style="padding:16px;display:grid;gap:6px;align-content:start"><div style="display:flex;justify-content:space-between;align-items:center"><span style="color:var(--primary)">${ic(i, 20)}</span><span class="num muted" style="font-size:12px;font-weight:500">${pr}</span></div><div style="font-weight:600">${t}</div><div class="muted" style="font-size:13px;line-height:1.4">${d}</div></div>`).join("")}
<div class="card" style="padding:16px;display:grid;gap:8px;align-content:start;background:${mix("var(--primary)", 9, "var(--surface)")}"><div style="font-weight:600">Say hello</div><div style="display:flex;gap:8px;align-items:center;font-size:13px">${ic("mail", 16)}${pfMail(p)}</div><div style="display:flex;gap:8px;align-items:center;font-size:13px">${ic("clock", 16)}Lisbon (WET) · overlaps EU &amp; US East</div><div style="display:flex;gap:8px;font-size:13px;color:var(--primary);font-weight:600"><span>Read.cv</span><span>GitHub</span><span>LinkedIn</span></div></div></section></div></div>`;
TPL["portfolio-home/mobile"] = (p, st) => `<div class="phone">${status()}${pfMHeader(p, st)}
<div class="mbody" style="padding-top:20px;gap:14px">
<div class="muted" style="font-size:11px;font-weight:600;letter-spacing:.06em;text-transform:uppercase">Product designer &amp; front-end dev · Lisbon</div>
<h1 style="font-size:${HC(st, 30, 1.1)}px">I design digital products, then build the front-end that ships them.</h1>
<p class="muted" style="font-size:14px;line-height:1.45">Nine years across transport, retail and research tools — from first sketch to production React.</p>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><button class="btn primary" style="height:44px">Hire me</button><button class="btn" style="height:44px">See work ${ic("chevdown", 15)}</button></div>
<div style="display:flex;align-items:baseline;justify-content:space-between;border-top:1px solid var(--border);padding-top:12px;margin-top:2px"><h2 style="font-size:${H(st, 19)}px">Selected work</h2><span class="muted num" style="font-size:12px;font-weight:500">12 projects</span></div>
<div style="display:grid;gap:8px">${panel("rail", 150, "var(--radius)")}<div style="display:flex;justify-content:space-between;align-items:baseline"><b>Kestrel Rail</b><span class="num muted" style="font-size:12px;font-weight:500">2026</span></div><div class="muted" style="font-size:13px;margin-top:-6px">Ticketing app redesign · Lead designer + React Native</div></div>
${PROJECTS.slice(1, 3).map(([c, t, y, r, k]) => `<div style="display:flex;gap:12px;align-items:center;border-top:1px solid var(--border);padding-top:10px"><div style="width:72px;height:54px;flex:none;border-radius:var(--radius-sm);overflow:hidden">${work(k)}</div><div style="flex:1;min-width:0;line-height:1.35"><div style="display:flex;justify-content:space-between"><b>${c}</b><span class="num muted" style="font-size:12px;font-weight:500">${y}</span></div><div class="muted" style="font-size:12px">${t}</div></div>${ic("chevron", 16)}</div>`).join("")}</div></div>`;

/* ---------------------------------------------------------------- case-study */
const CS_META = [["Client", "Kestrel Rail"], ["Role", "Lead product designer, front-end"], ["Timeline", "Feb – Jul 2026 · 22 weeks"], ["Stack", "Figma, React Native, TypeScript, Storybook"]];
const CS_STEPS = [["01", "Audit", "Mapped 9 taps and 4 dead ends in the old purchase flow with 14 riders at Ardrossan station."], ["02", "Prototype", "Three flows tested in Figma; the saved-journey card won 11 of 14 sessions."], ["03", "Build", "Shipped a 38-component React Native kit with the in-house team, behind a feature flag."], ["04", "Measure", "Staged rollout to 10%, then 100% after two weeks of clean payment metrics."]];
const CS_OUT = [["3 taps", "to buy a ticket, down from 9"], ["+31%", "mobile ticket sales in 8 weeks"], ["−42%", "support tickets about fares"]];
TPL["case-study/web"] = (p, st) => `<div style="height:100%;display:flex;flex-direction:column;overflow:hidden">${pfHeader(p, st, "Work")}
<div style="flex:1;min-height:0;padding:28px 64px 28px;display:grid;grid-template-columns:minmax(0,1fr) 700px;gap:44px">
<div style="display:flex;flex-direction:column;gap:18px;min-width:0">
<div class="muted" style="font-size:13px;display:flex;gap:8px;align-items:center">${ic("back", 14)}Work <span>/</span><span style="color:var(--text)">Kestrel Rail</span><span class="badge" style="margin-left:6px">Case study · 6 min read</span></div>
<h1 style="font-size:${H(st, 34)}px">Cutting a regional rail ticket purchase from nine taps to three</h1>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px 20px;padding:14px 0;border-top:1px solid var(--border);border-bottom:1px solid var(--border)">${CS_META.map(([k, v]) => `<div style="line-height:1.35"><div class="muted" style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.06em">${k}</div><div style="font-size:13px;font-weight:500;margin-top:2px">${v}</div></div>`).join("")}</div>
<div><div style="font-weight:600;margin-bottom:4px">The problem</div><p class="muted" style="font-size:14px;line-height:1.5">Six in ten Kestrel riders started buying a ticket in the app and finished at the station machine. Fares were shown last, saved journeys were buried in a menu, and the payment sheet reset on every network drop.</p></div>
<div style="display:grid;gap:10px"><div style="font-weight:600">Process</div>${CS_STEPS.map(([n, t, d]) => `<div style="display:grid;grid-template-columns:34px 1fr;gap:10px;align-items:start"><span class="num" style="font-size:13px;color:var(--primary);padding-top:1px">${n}</span><div style="font-size:13px;line-height:1.4"><b>${t}.</b> <span class="muted">${d}</span></div></div>`).join("")}</div>
<div style="margin-top:auto;padding:14px 16px;border-left:3px solid var(--primary);background:${mix("var(--primary)", 7, "var(--surface)")};border-radius:0 var(--radius) var(--radius) 0"><div style="font-size:14px;line-height:1.45">“Ines ran research in the morning and merged the components by evening. We shipped a quarter early.”</div><div class="muted" style="font-size:12px;margin-top:6px">Jonah Weiss — Head of Digital, Kestrel Rail</div></div></div>
<div style="display:flex;flex-direction:column;gap:14px;min-width:0;min-height:0">
${panel("flow", 372)}
<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">${panel("rail", 150)}${panel("type", 150)}</div>
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px">${CS_OUT.map(([v, l]) => `<div class="card" style="padding:14px 16px"><div class="num" style="font-size:30px;color:var(--primary)">${v}</div><div class="muted" style="font-size:12px;margin-top:4px;line-height:1.35">${l}</div></div>`).join("")}</div>
<div class="card feat" style="padding:14px 18px;display:flex;align-items:center;gap:16px;background:var(--text);color:var(--bg);border-color:var(--text);margin-top:auto"><div style="width:84px;height:56px;border-radius:var(--radius-sm);overflow:hidden;flex:none">${work("rope")}</div><div style="flex:1"><div style="font-size:11px;opacity:.7;font-weight:600;text-transform:uppercase;letter-spacing:.06em">Next project</div><div style="font-weight:600;font-size:15px">Oakum &amp; Daughters — a storefront for a 140-year-old rope maker</div></div><span class="btn primary" style="width:40px;height:40px;padding:0">${ic("arrow", 18)}</span></div></div></div></div>`;
TPL["case-study/mobile"] = (p, st) => `<div class="phone">${status()}${pfMHeader(p, st)}
<div class="mbody" style="padding-top:14px;gap:12px">
<div class="muted" style="font-size:12px;display:flex;gap:6px;align-items:center">${ic("back", 13)}Work / <span style="color:var(--text)">Kestrel Rail</span></div>
<h1 style="font-size:${HC(st, 24, 1.1)}px">Cutting a rail ticket purchase from nine taps to three</h1>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px 14px;padding:10px 0;border-top:1px solid var(--border);border-bottom:1px solid var(--border)">${CS_META.map(([k, v], i) => `<div style="line-height:1.3"><div class="muted" style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.06em">${k}</div><div style="font-size:12px;font-weight:500">${i === 3 ? "React Native, TypeScript" : i === 1 ? "Lead designer, front-end" : v}</div></div>`).join("")}</div>
${panel("flow", 214, "var(--radius)")}
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">${CS_OUT.map(([v, l]) => `<div class="card" style="padding:10px"><div class="num" style="font-size:20px;color:var(--primary)">${v}</div><div class="muted" style="font-size:11px;line-height:1.3;margin-top:2px">${l}</div></div>`).join("")}</div>
<div><div style="font-weight:600;font-size:14px">The problem</div><p class="muted" style="font-size:13px;line-height:1.45;margin-top:2px">Six in ten riders started a purchase in the app and finished at the station machine.</p></div>
<div style="display:flex;gap:6px;flex-wrap:wrap">${CS_STEPS.map(([n, t]) => `<span class="badge" style="gap:5px;height:24px;padding:0 10px"><span class="num" style="font-size:11px">${n}</span>${t}</span>`).join("")}</div>
<div class="card feat" style="padding:12px 14px;display:flex;align-items:center;gap:12px;background:var(--text);color:var(--bg);border-color:var(--text);margin-top:auto"><div style="flex:1;line-height:1.35"><div style="font-size:10px;opacity:.7;font-weight:600;text-transform:uppercase;letter-spacing:.06em">Next project</div><div style="font-weight:600;font-size:14px">Oakum &amp; Daughters storefront</div></div><span class="btn primary" style="width:38px;height:38px;padding:0">${ic("arrow", 16)}</span></div></div></div>`;

/* ---------------------------------------------------------------- registry */
const def = (family, name, shows, elements, key) => ({ family, name, shows, elements, web: TPL[key + "/web"], mobile: TPL[key + "/mobile"] });
module.exports = {
  "music-player": def("audio", "Music player (now playing)", "a now-playing screen with album artwork, track and artist, a scrubber with elapsed and remaining time, shuffle/previous/pause/next/repeat transport, like and share actions, synced lyrics, credits, an artist-support tip card and an up-next queue (library sidebar + queue panel on web)",
    ["music-player", "album-art", "scrubber", "media-controls", "queue", "up-next", "lyrics", "credits", "like-button", "share", "sidebar-nav", "toggle", "tab-bar"], "music-player"),
  "playlist": def("audio", "Playlist / album detail", "a playlist header with cover, title, curator and stats, play/shuffle/download/like actions, a numbered track list with plays, durations, explicit badges and per-track download state, and a download queue with progress bars, storage usage and status icons",
    ["playlist", "track-list", "album-art", "table", "badge", "progress", "download-queue", "status-icons", "storage-meter", "toggle", "sidebar-nav", "tab-bar"], "playlist"),
  "portfolio-home": def("portfolio", "Personal portfolio home", "a designer-developer portfolio with a name header and availability badge, an editorial hero with positioning and two paths (hire me / see work), a selected-work index of project tiles with client, year, role and artwork, priced services and contact details",
    ["navigation-header", "hero", "headline", "button", "project-grid", "work-index", "filter-chips", "services", "contact", "badge", "portfolio"], "portfolio-home"),
  "case-study": def("portfolio", "Project case study", "a portfolio case study with breadcrumb, title, client/role/timeline/stack metadata, the problem, numbered process steps, large artwork panels, outcome metrics and a next-project link",
    ["navigation-header", "breadcrumbs", "headline", "metadata", "process-steps", "image-gallery", "kpi", "next-link", "portfolio", "case-study"], "case-study"),
};
