/* Media family (Fieldnote, travel photo community): map-view, video-player, create-post.
   UI colours come only from tokens; the map is drawn from tokens too (water/parks/roads via color-mix) so it recolours per style
   and in dark mode. Illustrative "photos" (scene()) use fixed natural tones, like tpl/apps.js. */
const { ic, esc, status, tabBar, ICON } = require("../lib");

Object.assign(ICON, {
  media_camera: '<path d="M3 8h4l2-3h6l2 3h4v12H3z"/><circle cx="12" cy="13.5" r="3.5"/>',
  media_compass: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
  media_user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4.5 4.2-7 8-7s7 2.5 8 7"/>',
  media_volume: '<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/>',
  media_max: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
  media_pause: '<path d="M8 5v14M16 5v14"/>',
  media_skip: '<path d="M5 5l10 7-10 7zM19 5v14"/>',
  media_crop: '<path d="M6 2v14a2 2 0 0 0 2 2h14M2 6h14a2 2 0 0 1 2 2v14"/>',
  media_rotate: '<path d="M4 12a8 8 0 1 0 2.5-5.8M4 4v5h5"/>',
  media_drag: '<circle cx="9" cy="6" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="18" r="1"/>',
  media_food: '<path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M17 21V3c-2.5 1-4 3.5-4 7h4"/>',
  media_hike: '<path d="M3 20l6-10 4 6 3-4 5 8z"/><circle cx="16" cy="5" r="1.8"/>',
  media_locate: '<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',
  media_layers: '<path d="M12 3l9 5-9 5-9-5zM3 13l9 5 9-5"/>',
  media_route: '<circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M8 19h7a3.5 3.5 0 0 0 0-7H9a3.5 3.5 0 0 1 0-7h7"/>',
  media_comment: '<path d="M20 12a8 8 0 0 1-11.6 7.1L4 20l1-4.2A8 8 0 1 1 20 12z"/>',
  media_hash: '<path d="M5 9h15M4 15h15M10 3L8 21M16 3l-2 18"/>',
  media_at: '<circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8"/>',
  media_sliders: '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
});

const TPL = {};
let GID = 0;
const H = (st, px) => Math.round(px * st.hscale);
const initials = (n) => n.split(" ").map((w) => w[0]).join("").slice(0, 2);
const pav = (n, s = 32) => `<div class="avatar" style="width:${s}px;height:${s}px;flex:none;font-size:${Math.round(s * 0.36)}px">${initials(n)}</div>`;
const filledHeart = (s) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="currentColor"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>`;
const playTri = (s, c = "currentColor") => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="${c}"><path d="M7 4.5v15l12.5-7.5z"/></svg>`;
const mix = (a, pct, b) => `color-mix(in oklab,${a} ${pct}%,${b})`;
const toggle = (on, w = 36) => `<span style="width:${w}px;height:${Math.round(w * 0.58)}px;border-radius:999px;flex:none;padding:2px;display:flex;justify-content:${on ? "flex-end" : "flex-start"};background:${on ? "var(--primary)" : mix("var(--text)", 18, "var(--surface)")}"><span style="width:${Math.round(w * 0.58) - 4}px;height:100%;border-radius:50%;background:${on ? "var(--on-primary)" : "var(--surface)"};box-shadow:0 1px 2px rgba(0,0,0,.2)"></span></span>`;

/* ---------------------------------------------------------------- illustrative photos (fixed natural tones) */
function scene(kind, vb = "0 0 400 300") {
  const id = "md" + GID++;
  const lg = (n, a, b) => `<linearGradient id="${id}${n}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
  let s = "";
  if (kind === "fjord") {
    s = `<defs>${lg("s", "#f7c08f", "#c9a7b8")}${lg("w", "#7d88a6", "#2e3a55")}</defs><rect width="400" height="300" fill="url(#${id}s)"/><circle cx="214" cy="128" r="20" fill="#ffe6bf" opacity=".95"/>
<path d="M0 60 L40 40 L90 90 L130 150 L170 168 V300 H0Z" fill="#5d6a86"/><path d="M400 70 L350 50 L300 96 L262 150 L232 168 V300 H400Z" fill="#56627e"/>
<path d="M40 40 L58 58 L46 56 L36 66 L28 56Z M350 50 L366 66 L352 62 L342 72 L334 62Z" fill="#f4f1ec"/>
<path d="M0 120 L60 100 L120 150 L170 172 V300 H0Z" fill="#3f4b66"/><path d="M400 130 L330 110 L280 156 L232 172 V300 H400Z" fill="#38435c"/>
<path d="M0 172 H400 V300 H0Z" fill="url(#${id}w)"/><path d="M180 176 h40 M150 196 h100 M120 222 h160" stroke="#ffe6bf" stroke-opacity=".45" stroke-width="2"/>
<path d="M0 230 Q60 214 120 236 L130 300 H0Z" fill="#26304a"/><rect x="62" y="210" width="18" height="13" fill="#b4483c"/><path d="M60 210 l11 -9 l11 9z" fill="#7d2e27"/><rect x="88" y="216" width="14" height="10" fill="#e3c27d"/><path d="M86 216 l9 -7 l9 7z" fill="#8a5a2b"/>`;
  } else if (kind === "mountains") {
    s = `<defs>${lg("s", "#f4b98a", "#8eaed4")}${lg("w", "#6f86a8", "#2f3d57")}</defs><rect width="400" height="300" fill="url(#${id}s)"/><circle cx="292" cy="96" r="22" fill="#fde3b8" opacity=".9"/>
<path d="M0 170 L60 110 L105 150 L170 70 L232 140 L290 95 L350 150 L400 120 V300 H0Z" fill="#8a9cbb"/><path d="M170 70 L188 92 L178 90 L170 100 L160 92 L152 94Z" fill="#f4f1ec"/>
<path d="M0 200 L48 160 L96 190 L150 140 L210 196 L262 156 L330 200 L400 170 V300 H0Z" fill="#4c5f80"/><path d="M0 214 H400 V300 H0Z" fill="url(#${id}w)"/>`;
  } else if (kind === "coast") {
    s = `<defs>${lg("s", "#bfe0f3", "#f8e7c9")}${lg("w", "#3f9ab5", "#1f6582")}</defs><rect width="400" height="300" fill="url(#${id}s)"/><path d="M0 150 H400 V300 H0Z" fill="url(#${id}w)"/>
<path d="M230 150 Q260 90 300 96 Q330 70 360 92 Q392 96 400 110 V300 H250 Q236 220 230 150Z" fill="#9b7a5c"/><path d="M262 120 Q290 100 330 104 Q370 110 400 130 V160 Q340 140 262 150Z" fill="#6f8d55"/>
${[[268, 128, "#e8a06a"], [290, 120, "#f0d6a0"], [312, 126, "#d9684f"], [334, 116, "#efc27a"], [300, 140, "#f2e3c4"], [322, 136, "#e08c5c"]].map(([x, y, c]) => `<rect x="${x}" y="${y}" width="15" height="14" fill="${c}"/>`).join("")}
<path d="M0 230 Q60 210 120 228 T250 236 L250 300 H0Z" fill="#e9d4aa"/>`;
  } else if (kind === "lighthouse") {
    s = `<defs>${lg("s", "#3d4a78", "#f0a27a")}${lg("w", "#3a4f74", "#1e2a44")}</defs><rect width="400" height="300" fill="url(#${id}s)"/><circle cx="120" cy="170" r="24" fill="#ffd9a8" opacity=".8"/>
<path d="M0 180 H400 V300 H0Z" fill="url(#${id}w)"/><path d="M220 300 Q240 190 300 176 Q360 168 400 186 V300Z" fill="#2b2f3f"/>
<rect x="300" y="96" width="18" height="82" fill="#f2eee6"/><rect x="300" y="116" width="18" height="12" fill="#c0463a"/><rect x="300" y="146" width="18" height="12" fill="#c0463a"/><rect x="296" y="84" width="26" height="14" fill="#2b2f3f"/><path d="M322 90 L400 70 V110Z" fill="#ffe7b0" opacity=".35"/>`;
  } else if (kind === "forest") {
    s = `<defs>${lg("s", "#d8e4e0", "#a9c1bc")}</defs><rect width="400" height="300" fill="url(#${id}s)"/><path d="M0 180 Q200 140 400 180 V300 H0Z" fill="#7e9b92"/>${Array.from({ length: 16 }, (_, i) => { const x = i * 26 + (i % 3) * 5, h = 70 + (i * 37) % 60; return `<path d="M${x} ${230 - h} l16 ${h} h-32z" fill="${i % 2 ? "#2f4a40" : "#3c5a4e"}"/>`; }).join("")}<rect y="228" width="400" height="72" fill="#4d6b63"/>`;
  } else if (kind === "market") {
    s = `<defs>${lg("s", "#f3e2c6", "#e7c9a0")}</defs><rect width="400" height="300" fill="url(#${id}s)"/><rect y="70" width="400" height="230" fill="#7a5134"/>
${[0, 1, 2, 3].map((i) => `<path d="M${i * 100} 70 h100 l-10 40 h-80z" fill="${i % 2 ? "#e9e1d3" : "#3c6b8c"}"/>`).join("")}<rect y="190" width="400" height="110" fill="#d9c09a"/>
${Array.from({ length: 14 }, (_, i) => `<ellipse cx="${18 + i * 28}" cy="${206 + (i % 2) * 18}" rx="12" ry="8" fill="${["#d9684f", "#e8a06a", "#9db37a", "#f0d6a0", "#c2554a"][i % 5]}"/>`).join("")}
<rect x="10" y="244" width="380" height="8" fill="#a67c52"/>${Array.from({ length: 9 }, (_, i) => `<path d="M${30 + i * 42} 268 l14 -6 l14 6 l-14 6z" fill="${i % 2 ? "#b8c4c9" : "#cfd8dc"}"/>`).join("")}`;
  } else if (kind === "lake") {
    s = `<defs>${lg("s", "#cfe3ef", "#eef2e6")}${lg("w", "#6ea8b8", "#3c7486")}</defs><rect width="400" height="300" fill="url(#${id}s)"/>
<path d="M0 150 L80 90 L150 140 L230 80 L310 130 L400 100 V170 H0Z" fill="#7e93a4"/><path d="M0 170 Q200 150 400 170 V200 H0Z" fill="#5f7d5a"/><path d="M0 196 H400 V300 H0Z" fill="url(#${id}w)"/>
<path d="M0 196 L80 236 L150 210 L230 246 L310 216 L400 232 V196Z" fill="#7e93a4" opacity=".4"/><path d="M180 262 l30 0 l-6 6 h-18z" fill="#c26a3a"/>`;
  }
  return `<svg viewBox="${vb}" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" style="display:block">${s}</svg>`;
}

/* ---------------------------------------------------------------- MAP (token-coloured) */
const M = {
  land: mix("var(--surface)", 88, "var(--bg)"),
  land2: mix("var(--text)", 5, "var(--surface)"),
  water: mix("var(--primary)", 20, "var(--surface)"),
  waterLine: mix("var(--primary)", 34, "var(--surface)"),
  park: mix("var(--accent)", 20, "var(--surface)"),
  road: "var(--surface)",
  roadEdge: mix("var(--text)", 14, "var(--surface)"),
  major: mix("var(--accent)", 38, "var(--surface)"),
  block: mix("var(--text)", 9, "var(--surface)"),
};
const sty = (o) => `style="${Object.entries(o).map(([k, v]) => `${k}:${v}`).join(";")}"`;
/* Normalised 1000×1000 map, stretched to the box (strokes are non-scaling); labels and pins are HTML in %. */
function mapSvg() {
  const road = (d, w, major) => `<path d="${d}" ${sty({ fill: "none", stroke: M.roadEdge, "stroke-width": w + 2, "stroke-linecap": "round" })} vector-effect="non-scaling-stroke"/><path d="${d}" ${sty({ fill: "none", stroke: major ? M.major : M.road, "stroke-width": w, "stroke-linecap": "round" })} vector-effect="non-scaling-stroke"/>`;
  const blocks = [];
  for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) if ((r * 3 + c) % 7 !== 3) blocks.push(`<rect x="${470 + c * 46}" y="${560 + r * 40}" width="36" height="30" rx="3" ${sty({ fill: M.block })}/>`);
  return `<svg viewBox="0 0 1000 1000" width="100%" height="100%" preserveAspectRatio="none" style="position:absolute;inset:0;display:block">
<rect width="1000" height="1000" ${sty({ fill: M.land })}/>
<path d="M600 0 C640 80 700 110 760 90 C840 60 900 120 1000 100 V0Z" ${sty({ fill: M.land2 })}/>
<path d="M560 80 C640 60 720 120 700 210 C680 290 590 300 540 250 C490 200 500 100 560 80Z" ${sty({ fill: M.park })}/>
<path d="M820 450 C880 430 940 470 935 530 C930 590 870 600 830 580 C790 560 780 470 820 450Z" ${sty({ fill: M.park })}/>
<path d="M400 380 C440 365 480 390 472 425 C465 460 420 468 400 448 C380 428 375 392 400 380Z" ${sty({ fill: M.park })}/>
<ellipse cx="760" cy="260" rx="95" ry="48" ${sty({ fill: M.water, stroke: M.waterLine, "stroke-width": 1.5 })} vector-effect="non-scaling-stroke"/>
<path d="M670 270 C600 320 560 380 520 470 C490 540 430 560 380 600" ${sty({ fill: "none", stroke: M.water, "stroke-width": 7, "stroke-linecap": "round" })} vector-effect="non-scaling-stroke"/>
<path d="M0 0 H190 C230 120 150 230 220 340 C270 430 220 520 300 600 C360 670 470 700 520 790 C560 860 640 900 680 1000 H0Z" ${sty({ fill: M.water, stroke: M.waterLine, "stroke-width": 1.5 })} vector-effect="non-scaling-stroke"/>
<path d="M70 420 C110 400 150 420 140 460 C130 500 80 500 65 470Z M120 720 C160 710 190 740 170 770 C150 790 110 780 120 720Z" ${sty({ fill: M.land, stroke: M.waterLine, "stroke-width": 1.5 })} vector-effect="non-scaling-stroke"/>
${[[1, 0], [2, 0]].map(([k]) => `<path d="M${190 - k * 30} 0 C${230 - k * 30} 120 ${150 - k * 30} 230 ${220 - k * 30} 340 C${270 - k * 30} 430 ${220 - k * 30} 520 ${300 - k * 30} 600 C${360 - k * 30} 670 ${470 - k * 30} 700 ${520 - k * 30} 790 C${560 - k * 30} 860 ${640 - k * 30} 900 ${680 - k * 30} 1000" ${sty({ fill: "none", stroke: M.waterLine, "stroke-width": 1, opacity: 0.6 - k * 0.2 })} vector-effect="non-scaling-stroke"/>`).join("")}
${[0, 1, 2, 3].map((k) => `<path d="M${880 - k * 30} ${150 + k * 14} C${900 - k * 20} ${110 + k * 6} ${960 - k * 10} ${120 + k * 4} ${1000} ${140 + k * 14}" ${sty({ fill: "none", stroke: M.roadEdge, "stroke-width": 1, opacity: 0.7 })} vector-effect="non-scaling-stroke"/>`).join("")}
${[0, 1, 2].map((k) => `<ellipse cx="620" cy="165" rx="${40 + k * 28}" ry="${26 + k * 20}" ${sty({ fill: "none", stroke: mix("var(--accent)", 45, "var(--surface)"), "stroke-width": 1, opacity: 0.7 })} vector-effect="non-scaling-stroke"/>`).join("")}
<path d="M300 610 C220 650 140 700 40 720" ${sty({ fill: "none", stroke: M.waterLine, "stroke-width": 1.5, "stroke-dasharray": "2 6" })} vector-effect="non-scaling-stroke"/>
${road("M380 440 C430 470 450 510 470 545 M720 640 C800 660 880 650 1000 600 M780 820 C840 760 900 760 1000 780 M560 720 C600 800 640 860 720 1000", 2)}
${blocks.join("")}
${road("M300 330 C420 300 520 340 620 330 C760 316 860 340 1000 300", 5, true)}
${road("M420 1000 C450 860 470 720 520 620 C560 540 640 470 720 430 C820 380 900 380 1000 390", 5, true)}
${road("M460 545 H720 M460 545 V720 M560 545 V720 M650 545 V720 M460 640 H720 M720 545 C780 600 860 700 1000 720", 2.5)}
${road("M620 330 C640 250 600 160 620 0 M880 0 C860 120 900 200 860 300", 2.5)}
<path d="M560 230 C600 180 640 160 680 120 C720 80 760 70 800 40" ${sty({ fill: "none", stroke: "var(--accent)", "stroke-width": 2, "stroke-dasharray": "5 5" })} vector-effect="non-scaling-stroke"/>
<path d="M830 500 C860 530 880 560 900 600" ${sty({ fill: "none", stroke: "var(--accent)", "stroke-width": 2, "stroke-dasharray": "5 5" })} vector-effect="non-scaling-stroke"/>
</svg>`;
}
const mapLabel = (x, y, t, o = {}) => `<span style="position:absolute;left:${x}%;top:${y}%;transform:translate(-50%,-50%);font-size:${o.fs || 11}px;font-weight:${o.w || 600};letter-spacing:${o.ls || ".02em"};color:${o.c || "var(--muted)"};${o.it ? "font-style:italic;" : ""}${o.up ? "text-transform:uppercase;" : ""}white-space:nowrap;text-shadow:0 0 3px var(--surface),0 0 3px var(--surface)">${t}</span>`;
const LABELS = (big) => [
  mapLabel(big ? 9 : 15, 26, "Vestfjorden", { it: 1, c: mix("var(--primary)", 60, "var(--text)"), fs: big ? 13 : 11, ls: ".12em" }),
  mapLabel(76, 26, "Reinvatnet", { it: 1, c: mix("var(--primary)", 55, "var(--text)"), fs: big ? 11 : 10 }),
  mapLabel(60, 66, "HAVNØY", { up: 1, c: "var(--text)", fs: big ? 13 : 11, ls: ".18em", w: 700 }),
  mapLabel(big ? 60 : 50, big ? 18 : 13, "Tindheia", { fs: big ? 11 : 10 }), // mobile: clear of the viewpoint pin
  mapLabel(88, 53, "Kvalnes Park", { fs: big ? 11 : 10 }),
  ...(big ? [mapLabel(83, 36, "E10", { fs: 10, w: 700 }), mapLabel(10, 49, "Skarvholmen", { fs: 10 })] : []),
];
const PLACES = [
  // name, kind, scene, rating, saves, dist, photos, x, y
  ["Skarvet Viewpoint", "Viewpoint", "fjord", "4.9", "2.4k", "1.2 km", 318, 34, 34],
  ["Brygga Fish Hall", "Food", "market", "4.7", "1.1k", "0.4 km", 142, 55, 58],
  ["Tindheia Ridge Trail", "Hike", "mountains", "4.8", "3.0k", "3.6 km", 406, 68, 12],
  ["Kvalnes Lighthouse", "Viewpoint", "lighthouse", "4.6", "860", "5.1 km", 97, 40, 86],
  ["Reinvatnet Lake Loop", "Hike", "lake", "4.5", "740", "4.2 km", 88, 82, 30],
  ["Sjøhuset Bakery", "Food", "coast", "4.8", "1.6k", "0.6 km", 64, 66, 62],
  ["Olstind Forest Camp", "Hike", "forest", "4.4", "520", "6.8 km", 52, 90, 82],
];
const KIND_IC = { Viewpoint: "eye", Food: "media_food", Hike: "media_hike" };
const pin = (pl, s, on) => `<div style="position:absolute;left:${pl[7]}%;top:${pl[8]}%;transform:translate(-50%,-100%);display:grid;justify-items:center;z-index:${on ? 3 : 2}">
<div style="width:${s}px;height:${s}px;border-radius:50%;overflow:hidden;border:${on ? 3 : 2.5}px solid ${on ? "var(--primary)" : "var(--surface)"};box-shadow:var(--shadow)${on ? ",0 0 0 4px " + mix("var(--primary)", 25, "transparent") : ""}">${scene(pl[2], "80 40 240 240")}</div>
<span style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:8px solid ${on ? "var(--primary)" : "var(--surface)"};margin-top:-1px"></span></div>`;
const cluster = (x, y, n, s) => `<div class="num" style="position:absolute;left:${x}%;top:${y}%;transform:translate(-50%,-50%);width:${s}px;height:${s}px;border-radius:50%;display:grid;place-items:center;font-size:${s > 40 ? 14 : 12}px;background:var(--primary);color:var(--on-primary);box-shadow:0 0 0 5px ${mix("var(--primary)", 22, "transparent")},var(--shadow);z-index:2">${n}</div>`;
const dot = (x, y) => `<span style="position:absolute;left:${x}%;top:${y}%;width:12px;height:12px;border-radius:50%;background:var(--accent);border:2px solid var(--surface);box-shadow:var(--shadow-sm);transform:translate(-50%,-50%)"></span>`;
const me = (x, y) => `<span style="position:absolute;left:${x}%;top:${y}%;transform:translate(-50%,-50%);width:16px;height:16px;border-radius:50%;background:var(--primary);border:3px solid var(--surface);box-shadow:0 0 0 10px ${mix("var(--primary)", 16, "transparent")};z-index:2"></span>`;
const FILTERS = [["eye", "Viewpoints", true], ["media_food", "Food", false], ["media_hike", "Hikes", true], ["sun", "Golden hour", false], ["media_camera", "Top rated", false]];
const chip = ([i, t, on], h = 32, fs = 13) => `<span style="display:inline-flex;align-items:center;gap:6px;height:${h}px;padding:0 ${Math.round(h * 0.38)}px;border-radius:999px;font-size:${fs}px;font-weight:600;white-space:nowrap;flex:none;box-shadow:var(--shadow-sm);${on ? "background:var(--text);color:var(--bg);border:1px solid var(--text)" : "background:var(--surface);color:var(--text);border:1px solid var(--border)"}">${ic(i, fs + 2)}${t}</span>`;
const mapCtl = (icons, s = 36) => `<div class="card" style="display:grid;overflow:hidden;border-radius:var(--radius);box-shadow:var(--shadow)">${icons.map((i, k) => `<span style="width:${s}px;height:${s}px;display:grid;place-items:center;${k ? "border-top:1px solid var(--border)" : ""}">${ic(i, 17)}</span>`).join("")}</div>`;
const thumbBox = (k, w, h, r = "var(--radius)") => `<div style="width:${w}px;height:${h}px;flex:none;border-radius:${r};overflow:hidden">${scene(k)}</div>`;

const NAV_MEDIA = [["home", "Home"], ["media_compass", "Explore"], ["pin", "Map"], ["bookmark", "Saved"], ["media_user", "Profile"]];
const mediaSide = (p, active) => `<aside class="side"><div class="logo"><b></b>${esc(p.name)}</div>${NAV_MEDIA.map(([i, l]) => `<div class="nav${l === active ? " on" : ""}">${ic(i)}${l}</div>`).join("")}<div class="grp">Saved lists</div>${[["Lofoten, next June", 18], ["Food stops", 31], ["Sunrise spots", 12]].map(([t, n]) => `<div class="nav" style="justify-content:space-between"><span style="display:flex;gap:10px;align-items:center">${ic("bookmark")}${t}</span><span style="font-size:12px">${n}</span></div>`).join("")}
<button class="btn primary" style="margin:16px 8px 0;height:40px">${ic("upload", 16)}Share a photo</button><div class="foot"><div class="avatar">PN</div><div><div style="font-weight:500">Priya Nair</div><div class="muted" style="font-size:12px">412 followers</div></div></div></aside>`;

const placeRow = (pl, on, compact) => {
  const [n, kind, sc, rat, saves, dist, photos] = pl;
  return `<div style="display:flex;gap:12px;padding:${compact ? "9px 0" : "12px"};${compact ? "border-top:1px solid var(--border)" : `border-radius:var(--radius-lg);${on ? `background:${mix("var(--primary)", 9, "var(--surface)")};box-shadow:inset 0 0 0 1.5px var(--primary)` : ""}`}">${thumbBox(sc, compact ? 56 : 84, compact ? 56 : 72)}
<div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:3px;line-height:1.3"><div style="display:flex;justify-content:space-between;gap:8px"><div style="font-weight:600;font-size:${compact ? 13 : 14}px">${n}</div>${compact ? "" : `<span class="muted">${ic("bookmark", 16)}</span>`}</div>
<div class="muted" style="font-size:12px;display:flex;gap:6px;align-items:center">${ic(KIND_IC[kind], 13)}${kind} · ${dist} · <span style="color:var(--text);display:inline-flex;gap:3px;align-items:center"><svg width="12" height="12" viewBox="0 0 24 24" fill="var(--accent)"><path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/></svg>${rat}</span></div>
${compact ? "" : `<div class="muted" style="font-size:12px;display:flex;gap:12px;margin-top:auto"><span style="display:flex;gap:4px;align-items:center">${ic("image", 13)}${photos} photos</span><span style="display:flex;gap:4px;align-items:center">${ic("bookmark", 13)}${saves} saves</span></div>`}</div></div>`;
};

TPL["map-view/web"] = (p, st) => `<div class="shell" style="grid-template-columns:232px 384px 1fr">${mediaSide(p, "Map")}
<section style="border-right:1px solid var(--border);display:flex;flex-direction:column;overflow:hidden;background:var(--surface)">
<div style="padding:20px 20px 12px;display:grid;gap:12px;flex:none"><div style="display:flex;align-items:baseline;justify-content:space-between"><h1 class="h" style="font-size:${H(st, 22)}px">Explore Havnøy</h1><span class="muted" style="font-size:12px">Lofoten, Norway</span></div>
<div class="input" style="height:38px;gap:8px;font-size:13px">${ic("search", 16)}Search places, trails, cafés…</div>
<div style="display:flex;justify-content:space-between;align-items:center;font-size:12px"><span><b class="num" style="font-size:13px">128</b> <span class="muted">photo spots in this area</span></span><span style="display:flex;gap:4px;align-items:center;font-weight:600">Most saved${ic("chevdown", 14)}</span></div></div>
<div style="flex:1;overflow:hidden;padding:0 8px;display:grid;gap:2px;align-content:start">${PLACES.map((pl, i) => placeRow(pl, i === 0)).join("")}</div>
<div class="muted" style="flex:none;border-top:1px solid var(--border);padding:10px 20px;font-size:12px;display:flex;justify-content:space-between;align-items:center"><span>Showing 7 of 128</span><span style="display:flex;gap:6px;align-items:center;color:var(--text);font-weight:600">${ic("refresh", 14)}Search as I move the map</span></div></section>
<main style="position:relative;overflow:hidden">${mapSvg()}${LABELS(true).join("")}
${dot(48, 40)}${dot(52, 47)}${dot(73, 70)}${dot(44, 74)}
${PLACES.map((pl, i) => (i === 0 ? "" : pin(pl, 44, false))).join("")}${pin(PLACES[0], 58, true)}
${cluster(86, 46, 24, 46)}${cluster(74, 84, 9, 36)}${cluster(30, 62, 14, 40)}${me(60, 48)}
<div style="position:absolute;top:18px;left:20px;right:20px;display:flex;gap:8px;align-items:center;z-index:4">${FILTERS.map((f) => chip(f, 34)).join("")}<span style="margin-left:auto">${chip(["media_sliders", "Filters · 2", false], 34)}</span></div>
<div style="position:absolute;right:20px;top:72px;display:grid;gap:10px;z-index:4">${mapCtl(["plus", "minus"])}${mapCtl(["media_locate"])}${mapCtl(["media_layers"])}</div>
<div class="card" style="position:absolute;left:20px;bottom:20px;width:440px;display:flex;overflow:hidden;box-shadow:var(--shadow-lg);z-index:4">${thumbBox("fjord", 150, 176, "0")}
<div style="flex:1;padding:14px 16px;display:flex;flex-direction:column;gap:6px;min-width:0"><div style="display:flex;justify-content:space-between;align-items:center"><span class="badge" style="gap:4px">${ic("eye", 12)}Viewpoint</span><span class="muted">${ic("x", 16)}</span></div>
<div style="font-weight:700;font-size:16px;line-height:1.2">Skarvet Viewpoint</div><div class="muted" style="font-size:12px;line-height:1.4">20-min climb from the harbour. Best 21:00–22:30 in September when the sun drops behind Olstind.</div>
<div style="display:flex;align-items:center;gap:8px;font-size:12px"><div style="display:flex">${["Teodora Ruiz", "Sam Achebe", "Lin Park"].map((n, i) => `<span style="margin-left:${i ? -8 : 0}px;border-radius:50%;box-shadow:0 0 0 2px var(--surface)">${pav(n, 22)}</span>`).join("")}</div><span class="muted">318 photos · 4.9</span></div>
<div style="display:flex;gap:8px;margin-top:auto"><span class="btn primary" style="height:32px;flex:1">${ic("media_route", 15)}Directions</span><span class="btn" style="height:32px">${ic("bookmark", 15)}Save</span></div></div></div>
<div class="muted" style="position:absolute;right:20px;bottom:20px;font-size:11px;display:flex;gap:8px;align-items:center;z-index:4;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:4px 8px"><span style="width:40px;border-bottom:2px solid var(--muted);height:6px;border-left:2px solid var(--muted);border-right:2px solid var(--muted)"></span>500 m</div>
</main></div>`;

TPL["map-view/mobile"] = (p, st) => `<div class="phone">${status()}
<div style="flex:1;position:relative;overflow:hidden">${mapSvg()}${LABELS(false).join("")}
${dot(48, 30)}${dot(73, 44)}${me(60, 34)}
${[PLACES[1], PLACES[2], PLACES[4]].map((pl) => pin([...pl.slice(0, 7), pl[7], pl[8] * 0.62 + 14], 38, false)).join("")}${pin([...PLACES[0].slice(0, 7), 34, 36], 50, true)}
${cluster(86, 34, 24, 40)}${cluster(22, 42, 14, 34)}
<div style="position:absolute;top:4px;left:16px;right:16px;display:grid;gap:10px;z-index:4"><div class="input" style="height:44px;gap:10px;font-size:14px;box-shadow:var(--shadow);border-radius:999px;padding:0 6px 0 16px">${ic("search", 18)}<span style="flex:1">Search Havnøy</span><div class="avatar" style="width:32px;height:32px">PN</div></div>
<div style="display:flex;gap:6px;overflow:hidden">${FILTERS.slice(0, 3).map((f) => chip(f, 30, 12)).join("")}<span style="margin-left:auto">${chip(["media_sliders", "2", false], 30, 12)}</span></div></div>
<div style="position:absolute;right:16px;top:118px;display:grid;gap:8px;z-index:4">${mapCtl(["media_layers"], 38)}${mapCtl(["media_locate"], 38)}</div>
<div style="position:absolute;left:0;right:0;bottom:0;background:var(--surface);border-top:1px solid var(--border);border-radius:calc(var(--radius-lg) + 6px) calc(var(--radius-lg) + 6px) 0 0;box-shadow:var(--shadow-lg);padding:8px 16px 4px;z-index:5;display:grid;gap:10px">
<span style="justify-self:center;width:38px;height:5px;border-radius:9px;background:${mix("var(--text)", 20, "var(--surface)")}"></span>
<div style="display:flex;gap:12px">${thumbBox("fjord", 96, 96)}<div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:4px;line-height:1.3"><div style="display:flex;justify-content:space-between;align-items:center"><span class="badge" style="gap:4px">${ic("eye", 12)}Viewpoint</span><span class="muted" style="font-size:12px">1.2 km</span></div>
<div style="font-weight:700;font-size:16px">Skarvet Viewpoint</div><div class="muted" style="font-size:12px">20-min climb · best 21:00–22:30</div><div style="display:flex;align-items:center;gap:6px;font-size:12px"><div style="display:flex">${["Teodora Ruiz", "Sam Achebe", "Lin Park"].map((n, i) => `<span style="margin-left:${i ? -7 : 0}px;border-radius:50%;box-shadow:0 0 0 2px var(--surface)">${pav(n, 20)}</span>`).join("")}</div><span class="muted">318 photos · ★ 4.9</span></div></div></div>
<div style="display:grid;grid-template-columns:1fr 1fr 44px;gap:8px"><span class="btn primary" style="height:38px">${ic("media_route", 15)}Directions</span><span class="btn" style="height:38px">${ic("image", 15)}Photos</span><span class="btn" style="height:38px;padding:0">${ic("bookmark", 16)}</span></div>
<div style="display:flex;justify-content:space-between;align-items:baseline;font-size:12px;padding-top:2px"><span style="font-weight:700;font-size:13px">Nearby · 128 spots</span><span class="muted">Most saved</span></div>
<div>${placeRow(PLACES[1], false, true)}</div></div></div>
${tabBar("Map", [["home", "Home"], ["pin", "Map"], ["bookmark", "Saved"], ["media_user", "Profile"]])}</div>`;

/* ---------------------------------------------------------------- VIDEO PLAYER */
const CHAPTERS = [["Arrival in Havnøy", "0:00", 14], ["Fish racks at dawn", "3:12", 18], ["The Kvalvika descent", "7:30", 26], ["Blue hour on the ridge", "13:45", 24], ["Camp and aurora", "19:40", 18]];
const UPNEXT = [
  ["Chasing aurora above Tromsø: a 3-night timelapse", "Rafael Duarte", "fjord", "18:22", "112k views · 1 week ago"],
  ["Cinque Terre by boat, one village per hour", "Sam Achebe", "coast", "11:05", "64k views · 3 weeks ago"],
  ["How I shoot blue hour without a filter kit", "Teodora Ruiz", "mountains", "9:48", "38k views · 5 days ago"],
  ["Kvalnes lighthouse in a winter storm", "Noor Haddad", "lighthouse", "6:31", "21k views · 2 days ago"],
  ["Forest light: walking the Tindheia trail in fog", "Aiko Mori", "forest", "14:12", "17k views · 1 month ago"],
  ["Breakfast at Brygga Fish Hall", "Lin Park", "market", "4:56", "9.8k views · 4 days ago"],
  ["Three lakes in one day: Reinvatnet loop", "Jonah Weiss", "lake", "12:40", "26k views · 2 weeks ago"],
];
const POS = 54; // % played
function scrubber(big) {
  let acc = 0;
  const segs = CHAPTERS.map(([, , w], i) => { const from = acc; acc += w; const fill = Math.max(0, Math.min(1, (POS - from) / w)), buf = Math.max(0, Math.min(1, (POS + 14 - from) / w)); return `<div style="flex:${w};height:${big ? 5 : 4}px;border-radius:2px;background:rgba(255,255,255,.28);position:relative;overflow:hidden${i === 3 && big ? ";transform:scaleY(1.6)" : ""}"><span style="position:absolute;inset:0;width:${buf * 100}%;background:rgba(255,255,255,.4)"></span><span style="position:absolute;inset:0;width:${fill * 100}%;background:var(--primary)"></span></div>`; });
  return `<div style="position:relative;display:flex;gap:3px;align-items:center">${segs.join("")}<span style="position:absolute;left:${POS}%;top:50%;width:${big ? 14 : 12}px;height:${big ? 14 : 12}px;margin:-${big ? 7 : 6}px 0 0 -${big ? 7 : 6}px;border-radius:50%;background:var(--primary);box-shadow:0 0 0 3px rgba(255,255,255,.9)"></span></div>`;
}
const player = (big) => {
  const ctlIc = (i, s) => `<span style="display:grid;place-items:center">${ic(i, s)}</span>`;
  return `<div style="position:relative;width:100%;height:100%;overflow:hidden;border-radius:${big ? "var(--radius-lg)" : "0"};background:#151a26">${scene("fjord", "0 20 400 225")}
<div style="position:absolute;inset:auto 0 0 0;height:${big ? 130 : 78}px;background:linear-gradient(to top,rgba(10,12,20,.78),rgba(10,12,20,0))"></div>
${big ? `<span style="position:absolute;top:16px;left:16px;display:flex;gap:6px;align-items:center;font-size:12px;font-weight:600;color:#fff;background:rgba(15,15,20,.45);padding:4px 10px;border-radius:999px">${ic("pin", 13)}Havnøy, Lofoten · Shot in 4K</span>
<div style="position:absolute;left:${POS}%;bottom:76px;transform:translateX(-50%);display:grid;justify-items:center;gap:6px"><div style="width:168px;height:94px;border-radius:var(--radius);overflow:hidden;border:2px solid #fff;box-shadow:0 6px 18px rgba(0,0,0,.35)">${scene("mountains", "0 30 400 225")}</div><span style="font-size:12px;font-weight:600;color:#fff;background:rgba(15,15,20,.7);padding:3px 8px;border-radius:6px;white-space:nowrap">14:02 · Blue hour on the ridge</span></div>`
    : `<span style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:52px;height:52px;border-radius:50%;background:rgba(15,15,20,.45);color:#fff;display:grid;place-items:center">${ic("media_pause", 24)}</span><span style="position:absolute;top:10px;right:12px;color:#fff;display:flex;gap:14px">${ic("media_camera", 18)}${ic("more", 18)}</span>`}
<div style="position:absolute;left:${big ? 20 : 12}px;right:${big ? 20 : 12}px;bottom:${big ? 14 : 10}px;color:#fff;display:grid;gap:${big ? 12 : 6}px">${big ? "" : `<div style="display:flex;justify-content:space-between;font-size:11px;font-weight:600"><span class="num" style="font-size:11px">12:48 / 24:10</span><span style="display:flex;gap:12px">${ic("media_max", 15)}</span></div>`}${scrubber(big)}
${big ? `<div style="display:flex;align-items:center;gap:18px;font-size:13px;font-weight:600">${ctlIc("media_pause", 22)}${ctlIc("media_skip", 20)}<span style="display:flex;gap:8px;align-items:center">${ic("media_volume", 20)}<span style="width:80px;height:4px;border-radius:2px;background:rgba(255,255,255,.3);position:relative"><span style="position:absolute;inset:0;width:70%;border-radius:2px;background:#fff"></span></span></span><span class="num" style="font-size:13px">12:48 <span style="opacity:.6">/ 24:10</span></span><span style="opacity:.85;display:flex;gap:6px;align-items:center">· Blue hour on the ridge ${ic("chevron", 14)}</span>
<span style="margin-left:auto;display:flex;gap:16px;align-items:center"><span style="border:1.5px solid #fff;border-radius:4px;padding:0 5px;font-size:11px;line-height:16px">CC</span>${ctlIc("gear", 19)}<span style="font-size:11px;background:rgba(255,255,255,.2);border-radius:4px;padding:1px 5px">4K</span>${ctlIc("media_max", 19)}</span></div>` : ""}</div></div>`;
};
const creatorRow = (s) => `<div style="display:flex;align-items:center;gap:12px">${pav("Teodora Ruiz", s)}<div style="line-height:1.3;min-width:0"><div style="font-weight:600;display:flex;gap:5px;align-items:center">Teodora Ruiz<span style="color:var(--primary)">${ic("check", 14)}</span></div><div class="muted" style="font-size:12px">86.4k followers</div></div><span class="btn primary" style="height:${s > 36 ? 34 : 30}px;margin-left:${s > 36 ? 12 : "auto"}">${ic("plus", 14)}Follow</span></div>`;
const actPill = (i, t, on) => `<span class="btn" style="height:34px;border-radius:999px;${on ? "color:var(--primary);border-color:" + mix("var(--primary)", 40, "var(--border)") + ";background:" + mix("var(--primary)", 8, "var(--surface)") : ""}">${i}${t}</span>`;
const upRow = ([t, n, k, d, m], w, h, fs = 13) => `<div style="display:flex;gap:10px"><div style="position:relative;flex:none;width:${w}px;height:${h}px;border-radius:var(--radius);overflow:hidden">${scene(k, "0 30 400 225")}<span class="num" style="position:absolute;right:5px;bottom:5px;font-size:10px;color:#fff;background:rgba(10,12,20,.72);padding:1px 5px;border-radius:4px">${d}</span></div>
<div style="min-width:0;line-height:1.3;display:grid;gap:3px;align-content:start"><div style="font-weight:600;font-size:${fs}px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${t}</div><div class="muted" style="font-size:12px">${n}</div><div class="muted" style="font-size:11px">${m}</div></div></div>`;

TPL["video-player/web"] = (p, st) => `<header style="height:60px;display:flex;align-items:center;gap:20px;padding:0 28px;border-bottom:1px solid var(--border);background:var(--surface)"><div class="logo"><b></b>${esc(p.name)}</div>
<nav style="display:flex;gap:20px;font-weight:500;color:var(--muted);margin-left:16px">${["Feed", "Explore", "Films", "Map"].map((t) => `<span style="${t === "Films" ? "color:var(--text);font-weight:600" : ""}">${t}</span>`).join("")}</nav>
<div class="input" style="margin-left:auto;width:340px;height:36px;gap:8px;font-size:13px">${ic("search", 16)}Search films, places, creators</div><span class="btn primary">${ic("upload", 15)}Upload</span><span class="muted">${ic("bell", 20)}</span><div class="avatar" style="width:32px;height:32px">PN</div></header>
<div style="display:grid;grid-template-columns:1fr 392px;gap:28px;padding:20px 28px 0;height:calc(100% - 60px);overflow:hidden">
<main style="display:flex;flex-direction:column;gap:14px;min-width:0"><div style="height:556px;flex:none">${player(true)}</div>
<div style="display:grid;gap:4px"><h1 class="h" style="font-size:${H(st, 22)}px">Three days on the Kvalvika coast: a fjord film in 4K</h1><div class="muted" style="font-size:13px;display:flex;gap:6px;align-items:center">48,210 views · 2 days ago · ${ic("pin", 13)}Havnøy, Lofoten, Norway</div></div>
<div style="display:flex;align-items:center;gap:8px">${creatorRow(40)}<span style="margin-left:auto;display:flex;gap:8px">${actPill(filledHeart(16), "3.2k", true)}${actPill(ic("bookmark", 16), "Save")}${actPill(ic("media_comment", 16), "214")}${actPill(ic("share", 16), "Share")}<span class="btn" style="height:34px;width:34px;padding:0;border-radius:999px">${ic("more", 16)}</span></span></div>
<div class="card" style="padding:12px 16px;display:grid;grid-template-columns:1fr 1.15fr;gap:20px;font-size:13px;box-shadow:none;background:${mix("var(--text)", 3, "var(--surface)")}"><div style="line-height:1.5">Shot over three days in late September with one body, a 24–70 and a lot of waiting for the cloud to lift. Gear list, every camp spot and the full route are pinned on the map. <span style="font-weight:600">#lofoten #bluehour #fjords</span></div>
<div style="display:grid;grid-template-columns:1fr 1fr;grid-template-rows:repeat(3,auto);grid-auto-flow:column;gap:4px 16px;align-content:start">${CHAPTERS.map(([t, ts], i) => `<div style="display:flex;gap:8px;font-size:12px;${i === 3 ? "font-weight:600" : ""}"><span class="num" style="font-size:12px;color:var(--primary);min-width:36px">${ts}</span><span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${t}</span></div>`).join("")}</div></div></main>
<aside style="display:flex;flex-direction:column;gap:12px;overflow:hidden"><div style="display:flex;justify-content:space-between;align-items:center"><div style="font-weight:700">Up next</div><span class="muted" style="display:flex;gap:8px;align-items:center;font-size:12px">Autoplay ${toggle(true, 32)}</span></div>
<div style="display:flex;gap:6px">${["All", "From Teodora", "Norway", "Timelapse"].map((t, i) => `<span style="height:28px;padding:0 11px;border-radius:999px;display:flex;align-items:center;font-size:12px;font-weight:600;white-space:nowrap;${i ? "background:" + mix("var(--text)", 6, "var(--surface)") + ";border:1px solid var(--border)" : "background:var(--text);color:var(--bg)"}">${t}</span>`).join("")}</div>
${UPNEXT.map((u) => upRow(u, 160, 90)).join("")}</aside></div>`;

TPL["video-player/mobile"] = (p, st) => `<div class="phone">${status()}<div style="height:220px;flex:none">${player(false)}</div>
<div class="mbody" style="padding-top:12px;gap:12px"><div style="display:grid;gap:4px"><h1 class="h" style="font-size:${H(st, 18)}px">Three days on the Kvalvika coast: a fjord film in 4K</h1><div class="muted" style="font-size:12px">48,210 views · 2 days ago · Havnøy, Lofoten</div></div>
${creatorRow(34)}
<div style="display:flex;gap:6px;overflow:hidden">${actPill(filledHeart(15), "3.2k", true)}${actPill(ic("bookmark", 15), "Save")}${actPill(ic("media_comment", 15), "214")}${actPill(ic("share", 15), "Share")}</div>
<div style="display:grid;gap:8px"><div style="display:flex;justify-content:space-between;font-size:13px"><b>Chapters</b><span class="muted" style="font-size:12px">5 chapters</span></div><div style="display:flex;gap:8px;overflow:hidden">${CHAPTERS.slice(2).map(([t, ts], i) => `<div class="card" style="flex:none;width:150px;padding:6px;display:flex;gap:8px;align-items:center;box-shadow:none;${i === 1 ? "border-color:var(--primary);box-shadow:0 0 0 1px var(--primary)" : ""}"><div style="width:44px;height:34px;border-radius:var(--radius-sm);overflow:hidden;flex:none">${scene(["coast", "mountains", "forest"][i], "0 30 400 225")}</div><div style="line-height:1.25;min-width:0"><div class="num" style="font-size:11px;color:var(--primary)">${ts}</div><div style="font-size:11px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${t}</div></div></div>`).join("")}</div></div>
<div style="display:grid;gap:10px;border-top:1px solid var(--border);padding-top:12px"><div style="display:flex;justify-content:space-between;align-items:center"><b style="font-size:14px">Up next</b><span class="muted" style="display:flex;gap:6px;align-items:center;font-size:12px">Autoplay ${toggle(true, 30)}</span></div>${UPNEXT.slice(0, 2).map((u) => upRow(u, 136, 76)).join("")}</div></div>
${tabBar("Films", [["home", "Home"], ["media_compass", "Explore"], ["play", "Films"], ["media_user", "Profile"]])}</div>`;

/* ---------------------------------------------------------------- CREATE POST */
const SEL = [["fjord", "IMG_2041"], ["mountains", "IMG_2047"], ["lake", "IMG_2063"], ["lighthouse", "IMG_2088"], ["market", "IMG_2102"]];
const CAPTION = `Blue hour over Havnøy from Skarvet. Waited two evenings for the cloud to lift off Olstind, then got eleven minutes of this. <span style="color:var(--primary);font-weight:600">#lofoten #bluehour #fjords #norway</span> <span style="color:var(--primary);font-weight:600">@sam.achebe</span> thanks for carrying the tripod<span style="display:inline-block;width:1.5px;height:15px;background:var(--text);vertical-align:-2px;margin-left:1px"></span>`;
const cropView = (k, side = 12) => `<div style="position:relative;width:100%;height:100%;overflow:hidden;background:#151a26">${scene(k, "0 0 400 300")}
<div style="position:absolute;inset:0;box-shadow:inset 0 0 0 9999px rgba(10,12,20,0)"></div>
<div style="position:absolute;left:${side}%;right:${side}%;top:5%;bottom:5%;border:2px solid #fff;box-shadow:0 0 0 9999px rgba(10,12,20,.5)">
${[33.3, 66.6].map((v) => `<span style="position:absolute;left:${v}%;top:0;bottom:0;border-left:1px solid rgba(255,255,255,.55)"></span><span style="position:absolute;top:${v}%;left:0;right:0;border-top:1px solid rgba(255,255,255,.55)"></span>`).join("")}
${[["0", "0", "top", "left"], ["0", "auto", "top", "right"], ["auto", "0", "bottom", "left"], ["auto", "auto", "bottom", "right"]].map(([t, l, a, b]) => `<span style="position:absolute;${a}:-4px;${b}:-4px;width:18px;height:18px;border-${a}:4px solid #fff;border-${b}:4px solid #fff"></span>`).join("")}</div></div>`;
const ratio = (sel, h = 32, fs = 12) => `<div style="display:flex;gap:4px;padding:3px;border-radius:calc(var(--radius) + 3px);background:${mix("var(--text)", 6, "var(--surface)")};border:1px solid var(--border)">${["Original", "4:5", "1:1", "16:9"].map((t) => `<span style="height:${h - 8}px;padding:0 10px;display:flex;align-items:center;border-radius:var(--radius);font-size:${fs}px;font-weight:600;${t === sel ? "background:var(--surface);box-shadow:var(--shadow-sm);color:var(--text)" : "color:var(--muted)"}">${t}</span>`).join("")}</div>`;
const strip = (s, gap, showName) => `<div style="display:flex;gap:${gap}px;align-items:flex-start">${SEL.map(([k, n], i) => `<div style="display:grid;gap:4px;flex:none"><div style="position:relative;width:${s}px;height:${s}px;border-radius:var(--radius);overflow:hidden;${i === 0 ? "box-shadow:0 0 0 2px var(--surface),0 0 0 4px var(--primary)" : i === 2 ? "transform:translateY(-4px) rotate(-3deg);box-shadow:var(--shadow-lg)" : ""}">${scene(k, "60 20 280 280")}
<span class="num" style="position:absolute;top:4px;left:4px;width:20px;height:20px;border-radius:50%;display:grid;place-items:center;font-size:11px;${i === 0 ? "background:var(--primary);color:var(--on-primary)" : "background:rgba(10,12,20,.55);color:#fff"}">${i + 1}</span><span style="position:absolute;top:4px;right:4px;color:#fff;opacity:.9">${ic("x", 14)}</span>${i === 2 ? `<span style="position:absolute;bottom:4px;right:4px;color:#fff">${ic("media_drag", 14)}</span>` : ""}</div>${showName ? `<span class="muted" style="font-size:11px;text-align:center">${n}</span>` : ""}</div>`).join("")}
<div style="width:${s}px;height:${s}px;flex:none;border-radius:var(--radius);border:1.5px dashed ${mix("var(--text)", 30, "var(--border)")};display:grid;place-items:center;align-content:center;gap:2px;color:var(--muted);font-size:11px;font-weight:600">${ic("plus", 18)}${showName ? "Add" : ""}</div></div>`;
const setRow = (i, label, val, extra = "", pad = "11px 0") => `<div style="display:flex;align-items:center;gap:12px;padding:${pad};border-top:1px solid var(--border)"><span class="muted">${ic(i, 18)}</span><div style="flex:1;min-width:0;line-height:1.3"><div style="font-weight:600;font-size:13px">${label}</div>${val ? `<div class="muted" style="font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${val}</div>` : ""}</div>${extra}</div>`;
const peopleChips = (s = 26) => `<div style="display:flex;gap:6px;flex-wrap:wrap">${["Sam Achebe", "Teodora Ruiz"].map((n) => `<span style="display:inline-flex;align-items:center;gap:6px;height:${s + 4}px;padding:0 10px 0 2px;border-radius:999px;font-size:12px;font-weight:600;background:${mix("var(--primary)", 9, "var(--surface)")};border:1px solid ${mix("var(--primary)", 25, "var(--border)")}">${pav(n, s)}${n}${ic("x", 12)}</span>`).join("")}</div>`;
const progress = (pad, short) => `<div class="card" style="padding:${pad};display:grid;gap:7px;box-shadow:none"><div style="display:flex;justify-content:space-between;align-items:center;font-size:12px"><span style="display:flex;gap:7px;align-items:center;font-weight:600"><span style="color:var(--primary)">${ic("upload", 15)}</span>Uploading 3 of 5${short ? "" : " · IMG_2063.raf"}</span><span class="muted"><span class="num" style="font-size:12px;color:var(--text)">68%</span> · ${short ? "41 / 60 MB" : "41 MB of 60 MB"}</span></div>
<div style="height:6px;border-radius:9px;background:${mix("var(--primary)", 14, "var(--surface)")};overflow:hidden"><div style="width:68%;height:100%;border-radius:9px;background:var(--primary)"></div></div></div>`;
const vis = (fs = 12) => `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px">${[["globe", "Public"], ["users", "Followers"], ["lock", "Only me"]].map(([i, t], k) => `<span style="height:34px;display:flex;align-items:center;justify-content:center;gap:6px;border-radius:var(--radius);font-size:${fs}px;font-weight:600;${k === 0 ? `border:1.5px solid var(--primary);background:${mix("var(--primary)", 8, "var(--surface)")};color:var(--primary)` : "border:1px solid var(--border);color:var(--muted)"}">${ic(i, 14)}${t}</span>`).join("")}</div>`;

TPL["create-post/web"] = (p, st) => `<header style="height:60px;display:flex;align-items:center;gap:16px;padding:0 28px;border-bottom:1px solid var(--border);background:var(--surface)"><div class="logo"><b></b>${esc(p.name)}</div><span class="muted" style="margin-left:8px">/</span><span style="font-weight:600">New post</span>
<div style="margin-left:auto;display:flex;gap:10px;align-items:center"><span class="muted" style="font-size:12px;display:flex;gap:5px;align-items:center">${ic("check", 14)}Draft saved 9:41</span><span class="btn">Save draft</span><span class="btn primary" style="padding:0 22px">${ic("send", 15)}Post</span></div></header>
<div style="display:grid;grid-template-columns:1fr 452px;grid-template-rows:minmax(0,1fr);height:calc(100% - 60px);overflow:hidden">
<main style="padding:20px 28px;display:flex;flex-direction:column;gap:14px;min-width:0;background:${mix("var(--text)", 3, "var(--bg)")}">
<div style="display:flex;align-items:center;gap:12px"><h1 class="h" style="font-size:${H(st, 20)}px">Edit photos</h1><span class="muted" style="font-size:13px">5 selected · drag to reorder</span><span style="margin-left:auto">${ratio("4:5", 34)}</span></div>
<div style="flex:1;min-height:0;display:grid;grid-template-columns:1fr 52px;grid-template-rows:minmax(0,1fr);gap:12px"><div style="border-radius:var(--radius-lg);overflow:hidden;min-height:0">${cropView("fjord", 21)}</div>
<div style="display:grid;gap:8px;align-content:start">${[["media_crop", 1], ["media_rotate"], ["media_sliders"], ["image"], ["trash"]].map(([i, on]) => `<span class="btn" style="width:52px;height:46px;padding:0;${on ? "background:var(--text);color:var(--bg);border-color:var(--text)" : ""}">${ic(i, 18)}</span>`).join("")}</div></div>
<div style="display:flex;align-items:center;gap:20px;font-size:12px"><span class="muted" style="display:flex;gap:8px;align-items:center">Straighten<span style="width:180px;height:4px;border-radius:2px;background:var(--border);position:relative"><span style="position:absolute;left:56%;top:-6px;width:16px;height:16px;border-radius:50%;background:var(--surface);border:2px solid var(--primary)"></span></span><span class="num" style="font-size:12px;color:var(--text)">+1.5°</span></span><span class="muted">Crop 3456 × 4320</span><span style="margin-left:auto;display:flex;gap:6px;align-items:center" class="muted">${ic("media_camera", 14)}X-T5 · 23mm · f/8 · 1/60s · ISO 400</span></div>
${strip(84, 12, true)}</main>
<aside style="min-width:0;border-left:1px solid var(--border);background:var(--surface);padding:18px 24px;display:flex;flex-direction:column;gap:12px;overflow:hidden">
<div style="display:flex;align-items:center;gap:10px">${pav("Priya Nair", 34)}<div style="line-height:1.3"><div style="font-weight:600">Priya Nair</div><div class="muted" style="font-size:12px">Posting to your profile</div></div></div>
<div class="field" style="gap:6px"><label>Caption</label><div class="input filled" style="height:auto;display:block;padding:10px 12px;font-size:13px;line-height:1.5;border-color:var(--primary);box-shadow:0 0 0 3px ${mix("var(--primary)", 16, "transparent")}">${CAPTION}</div>
<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;min-width:0"><div style="display:flex;gap:6px;min-width:0;overflow:hidden">${["#nordiclight", "#lofotenislands", "#reine"].map((t) => `<span style="font-size:11px;font-weight:600;padding:2px 8px;border-radius:999px;background:${mix("var(--text)", 6, "var(--surface)")};border:1px solid var(--border)">${t}</span>`).join("")}</div><span class="muted num" style="font-size:11px;font-weight:500">212 / 2,200</span></div></div>
<div style="display:grid;grid-template-columns:minmax(0,1fr)">${setRow("pin", "Location", "Skarvet Viewpoint · Havnøy, Lofoten, Norway", `<span class="muted">${ic("x", 15)}</span>`)}
<div style="padding:11px 0;border-top:1px solid var(--border);display:grid;gap:8px"><div style="display:flex;gap:12px;align-items:center"><span class="muted">${ic("users", 18)}</span><div style="flex:1;font-weight:600;font-size:13px">Tag people</div><span class="muted" style="font-size:12px">2 tagged on photo 1</span></div><div style="padding-left:30px">${peopleChips(24)}</div></div>
${setRow("folder", "Add to album", "Norway, Sep 2026 · 24 photos", ic("chevdown", 16))}
<div style="padding:11px 0;border-top:1px solid var(--border);display:grid;gap:8px"><div style="display:flex;gap:12px;align-items:center"><span class="muted">${ic("eye", 18)}</span><div style="flex:1;font-weight:600;font-size:13px">Who can see this</div></div>${vis()}</div>
${setRow("media_camera", "Show camera settings", "Lens, aperture and shutter on each photo", toggle(true))}
${setRow("media_comment", "Allow comments", "", toggle(true), "9px 0")}${setRow("clock", "Schedule", "Post now, or pick a time in your followers’ time zone", ic("chevdown", 16))}</div>
<div style="margin-top:auto">${progress("10px 12px")}</div></aside></div>`;

TPL["create-post/mobile"] = (p, st) => `<div class="phone">${status()}<div class="mtop" style="padding-bottom:10px">${ic("x", 22)}<div style="font-weight:600">New post</div><span class="btn primary" style="height:32px;padding:0 16px">Post</span></div>
<div style="flex:none;height:262px;position:relative">${cropView("fjord", 25)}<span style="position:absolute;left:12px;bottom:10px">${ratio("4:5", 30, 11)}</span><span style="position:absolute;right:12px;bottom:10px;display:flex;gap:6px">${["media_rotate", "media_sliders"].map((i) => `<span style="width:30px;height:30px;border-radius:50%;background:rgba(10,12,20,.55);color:#fff;display:grid;place-items:center">${ic(i, 15)}</span>`).join("")}</span></div>
<div style="flex:none;padding:12px 16px 2px;overflow:hidden">${strip(54, 10, false)}</div>
<div class="mbody" style="padding-top:8px;gap:8px"><div class="input filled" style="height:auto;display:block;padding:9px 12px;font-size:13px;line-height:1.45">${CAPTION}</div>
<div style="display:flex;justify-content:space-between;font-size:11px"><span style="display:flex;gap:12px;color:var(--muted)"><span style="display:flex;gap:3px;align-items:center">${ic("media_hash", 13)}Hashtags</span><span style="display:flex;gap:3px;align-items:center">${ic("media_at", 13)}Mention</span></span><span class="muted num" style="font-size:11px;font-weight:500">212 / 2,200</span></div>
<div>${setRow("pin", "Skarvet Viewpoint", "Havnøy, Lofoten, Norway", ic("chevron", 16), "8px 0")}${setRow("users", "Tag people", "Sam Achebe, Teodora Ruiz", ic("chevron", 16), "8px 0")}${setRow("folder", "Album", "Norway, Sep 2026", ic("chevron", 16), "8px 0")}${setRow("globe", "Visibility", "Public · anyone on " + esc(p.name), ic("chevron", 16), "8px 0")}</div>
<div style="margin-top:auto">${progress("9px 12px", true)}</div></div></div>`;

const def = (name, shows, elements, key) => ({ family: "media", name, shows, elements, web: TPL[key + "/web"], mobile: TPL[key + "/mobile"] });
module.exports = {
  "map-view": def("Explore map", "an illustrated map with photo-spot pins and clusters, category filter chips, search, a selected-place card with photo and directions, and a results list (side panel on web, bottom sheet on mobile)",
    ["map", "map-pins", "clusters", "filter-chips", "search-bar", "place-card", "list", "bottom-sheet", "sidebar-nav", "tab-bar"], "map-view"),
  "video-player": def("Video player", "a travel film player with chapter scrubber and playback controls, title, creator row with follow, like/save/share actions, description with chapters and an up-next list",
    ["video-player", "scrubber", "chapters", "media-controls", "avatar", "follow-button", "like-button", "up-next", "toggle", "tab-bar"], "video-player"),
  "create-post": def("Create photo post", "a photo post composer with crop and aspect-ratio tools, reorderable selected photos, caption with hashtags and mentions, location and people tags, album and visibility settings and an upload progress bar",
    ["composer", "image-crop", "thumbnail-strip", "reorder", "textarea", "hashtags", "tag-people", "toggle", "segmented-control", "progress", "button"], "create-post"),
};
