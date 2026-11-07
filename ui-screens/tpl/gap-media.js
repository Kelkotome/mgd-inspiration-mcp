/* gap-media (mcp-gap-r1, 8-Nov-2026): app screens for real MCP searches that returned only 1–2 distinct screens.
   audio (Tidewell): music-home, album-page, play-queue · media (Fieldnote): story-viewer, photo-post, post-composer ·
   beauty (Dewline): barcode-scanner, skincare-routine.
   One story per family: Priya Nair listens to "Low Tide Letters" by Marrow Lane; Lin Park posts from Kestrel Ridge;
   Priya scans and shelves her skincare. All artists, albums, tracks, places, brands and products are fictional.
   Album art, photos and product shots are illustrative SVG in fixed natural tones; every UI colour comes from tokens. */
const { ic, esc, status, tabBar, ICON } = require("../lib");

Object.assign(ICON, {
  gm_shuffle: '<path d="M3 7h3.5c3 0 4.5 10 8 10H21M3 17h3.5c1.4 0 2.4-2 3.3-4.2M14.5 7H21M18 4l3 3-3 3M18 14l3 3-3 3"/>',
  gm_repeat: '<path d="M4 11V9a3 3 0 0 1 3-3h13M17 3l3 3-3 3M20 13v2a3 3 0 0 1-3 3H4M7 21l-3-3 3-3"/>',
  gm_prev: '<path d="M18 5L8 12l10 7zM6 5v14"/>',
  gm_next: '<path d="M6 5l10 7-10 7zM18 5v14"/>',
  gm_vol: '<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/>',
  gm_lib: '<path d="M5 4v16M10 4v16M15 4.5l4.5 15"/>',
  gm_radio: '<circle cx="12" cy="12" r="2"/><path d="M7.8 7.8a6 6 0 0 0 0 8.4M16.2 7.8a6 6 0 0 1 0 8.4M4.9 4.9a10 10 0 0 0 0 14.2M19.1 4.9a10 10 0 0 1 0 14.2"/>',
  gm_queue: '<path d="M4 6h12M4 11h12M4 16h7M15 15v5l4-2.5z"/>',
  gm_mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/>',
  gm_device: '<rect x="6" y="3" width="12" height="18" rx="2"/><circle cx="12" cy="14" r="3.2"/><circle cx="12" cy="7.5" r="1"/>',
  gm_drag: '<path d="M5 9h14M5 15h14"/>',
  gm_dl: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5v8M8.5 12.5L12 16l3.5-3.5"/>',
  gm_ticket: '<path d="M3 8a2 2 0 0 0 0 4v0a2 2 0 0 1 0 4v2h18v-2a2 2 0 0 1 0-4 2 2 0 0 1 0-4V6H3z"/><path d="M14 6v12" stroke-dasharray="2 2"/>',
  gm_story: '<circle cx="12" cy="12" r="9" stroke-dasharray="4 2.2"/><path d="M12 8v8M8 12h8"/>',
  gm_text: '<path d="M5 6V4h14v2M12 4v16M9 20h6"/>',
  gm_sticker: '<path d="M4 4h16v9l-7 7H4z"/><path d="M13 20v-5a2 2 0 0 1 2-2h5"/>',
  gm_draw: '<path d="M4 20c3-1 4-4 7-4s3 3 6 3M14 4l6 6-8 8-6-6z"/>',
  gm_cam: '<path d="M3 8h4l2-3h6l2 3h4v11H3z"/><circle cx="12" cy="13" r="3.5"/>',
  gm_flip: '<path d="M4 9a8 8 0 0 1 14-3l2 2M20 15a8 8 0 0 1-14 3l-2-2M20 4v4h-4M4 20v-4h4"/>',
  gm_torch: '<path d="M13 2L5 13h6l-1 9 8-11h-6z"/>',
  gm_crop: '<path d="M6 2v16h16M2 6h16v16"/>',
  gm_sliders: '<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>',
  gm_at: '<circle cx="12" cy="12" r="3.5"/><path d="M15.5 12v1.5a2.5 2.5 0 0 0 5 0V12a8.5 8.5 0 1 0-3.4 6.8"/>',
  gm_hash: '<path d="M9 3L7 21M17 3l-2 18M4 8.5h17M3 15.5h17"/>',
  gm_smile: '<circle cx="12" cy="12" r="9"/><path d="M8.5 14.5a4.5 4.5 0 0 0 7 0M9 9.5h.01M15 9.5h.01"/>',
  gm_scan: '<path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M8 8v8M11 8v8M14 8v8M17 8v8"/>',
  gm_kbd: '<rect x="2.5" y="6" width="19" height="12" rx="2"/><path d="M6 10h.01M9.5 10h.01M13 10h.01M16.5 10h.01M6 14h.01M18 14h.01M9 14h6"/>',
  gm_drop: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',
  gm_moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
  gm_timer: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M9.5 2.5h5"/>',
  gm_warn: '<path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17h.01"/>',
  gm_shelf: '<path d="M3 20h18M3 12h18M5 12V5h4v7M11 12V7h3v5M16 12V4h3v8M6 20v-5h3v5M13 20v-4h5v4"/>',
  gm_alt: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 15l2.5-6 2.5 6M7.8 13h3.4M14.5 9v6h3"/>',
});

const H = (st, px) => Math.round(px * st.hscale);
const HC = (st, px, cap = 1.12) => Math.round(px * Math.min(st.hscale, cap));
const mix = (a, pct, b) => `color-mix(in oklab,${a} ${pct}%,${b})`;
const tint = (pct, v = "primary") => mix(`var(--${v})`, pct, "var(--surface)");
const ell = "white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0";
const track = mix("var(--text)", 14, "var(--surface)");
const chip = (t, on, h = 30) => `<span style="display:inline-flex;align-items:center;gap:6px;height:${h}px;padding:0 12px;border-radius:999px;font-size:12.5px;font-weight:500;white-space:nowrap;flex:none;${on ? "background:var(--primary);color:var(--on-primary);border:1px solid var(--primary)" : "border:1px solid var(--border);background:var(--surface)"}">${t}</span>`;
const sbadge = (t, k) => `<span style="display:inline-flex;align-items:center;gap:4px;height:20px;padding:0 8px;border-radius:999px;font:600 11px var(--font-b);white-space:nowrap;flex:none;background:color-mix(in oklab,var(--${k}) 14%,var(--surface));color:color-mix(in oklab,var(--${k}) 78%,var(--text))">${t}</span>`;
const toggle = (on, w = 34) => `<span style="width:${w}px;height:${Math.round(w * 0.58)}px;border-radius:999px;flex:none;padding:2px;display:flex;justify-content:${on ? "flex-end" : "flex-start"};background:${on ? "var(--primary)" : mix("var(--text)", 18, "var(--surface)")}"><span style="width:${Math.round(w * 0.58) - 4}px;height:100%;border-radius:50%;background:${on ? "var(--on-primary)" : "var(--surface)"}"></span></span>`;
const av = (ini, s = 28, k = 0) => `<span style="flex:none;width:${s}px;height:${s}px;border-radius:50%;display:grid;place-items:center;font:600 ${Math.round(s * 0.38)}px var(--font-b);background:${tint(16 + (k % 3) * 8, k % 2 ? "accent" : "primary")};color:color-mix(in oklab,var(--${k % 2 ? "accent" : "primary"}) 72%,var(--text))">${ini}</span>`;
const fillPlay = (s) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7.5 4.8v14.4l11.6-7.2z"/></svg>`;
const fillPause = (s) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="4.5" width="4" height="15" rx="1"/><rect x="14" y="4.5" width="4" height="15" rx="1"/></svg>`;
const fillHeart = (s) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>`;
const roundBtn = (sz, inner) => `<span style="width:${sz}px;height:${sz}px;flex:none;border-radius:50%;display:grid;place-items:center;background:var(--primary);color:var(--on-primary);box-shadow:var(--shadow)">${inner}</span>`;
const icoBtn = (n, s = 18, extra = "") => `<span style="display:flex;color:var(--muted);${extra}">${ic(n, s)}</span>`;
const sec = (t, r = "") => `<div style="display:flex;justify-content:space-between;align-items:baseline;flex:none"><b style="font-size:15px">${t}</b>${r ? `<span class="muted" style="font-size:12.5px;font-weight:500">${r}</span>` : ""}</div>`;
const scrub = (a, b, f, h = 4) => `<div style="display:flex;align-items:center;gap:10px;width:100%"><span class="num muted" style="font-size:11px;font-weight:500">${a}</span><span style="flex:1;height:${h}px;border-radius:2px;background:${track};position:relative"><span style="position:absolute;left:0;top:0;bottom:0;width:${f * 100}%;border-radius:2px;background:var(--primary)"></span><span style="position:absolute;left:${f * 100}%;top:50%;width:12px;height:12px;margin:-6px 0 0 -6px;border-radius:50%;background:var(--primary)"></span></span><span class="num muted" style="font-size:11px;font-weight:500">${b}</span></div>`;
const slider = (label, val, f, uni) => `<div style="display:grid;gap:6px">${label ? `<div style="display:flex;justify-content:space-between;font-size:12.5px"><span>${label}</span><span class="num muted" style="font-size:12px">${val}</span></div>` : ""}<span style="height:4px;border-radius:2px;background:${track};position:relative;display:block"><span style="position:absolute;left:${uni ? 0 : Math.min(f, 0.5) * 100}%;width:${uni ? f * 100 : Math.abs(f - 0.5) * 100}%;top:0;bottom:0;background:var(--primary);border-radius:2px"></span>${uni ? "" : `<span style="position:absolute;left:50%;top:-3px;width:1px;height:10px;background:var(--muted)"></span>`}<span style="position:absolute;left:${f * 100}%;top:50%;width:14px;height:14px;margin:-7px 0 0 -7px;border-radius:50%;background:var(--surface);border:2px solid var(--primary)"></span></span></div>`;

/* ---------------------------------------------------------------- illustrative artwork (fixed natural tones) */
let GID = 0;
const lg = (id, a, b, h) => `<linearGradient id="${id}" x1="0" y1="0" x2="${h ? 1 : 0}" y2="${h ? 0 : 1}"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
const svgWrap = (s, extra = "") => `<svg viewBox="0 0 100 100" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" aria-hidden="true" style="display:block;${extra}">${s}</svg>`;
function art(k) {
  const id = "gma" + GID++;
  let s;
  switch (k % 8) {
    case 0: s = `<defs>${lg(id, "#f6cb9c", "#e3876c")}${lg(id + "w", "#3d6f8f", "#1c3a52")}</defs><rect width="100" height="100" fill="url(#${id})"/><circle cx="50" cy="50" r="17" fill="#fff0d4"/><rect y="56" width="100" height="44" fill="url(#${id}w)"/><path d="M30 62h40M22 69h56M14 77h72M8 86h84" stroke="#fff0d4" stroke-opacity=".5" stroke-width="1.4"/>`; break;
    case 1: s = `<rect width="100" height="100" fill="#ebe3d1"/><circle cx="38" cy="46" r="23" fill="#d5683f"/><circle cx="63" cy="60" r="20" fill="#3f6b5a" opacity=".9"/><circle cx="62" cy="33" r="11" fill="#e8b44a"/><path d="M20 86h60" stroke="#2b2b2b" stroke-width="1.2"/>`; break;
    case 2: s = `<defs>${lg(id, "#f3d6ab", "#eaa96f")}</defs><rect width="100" height="100" fill="url(#${id})"/><circle cx="70" cy="30" r="10" fill="#c4492f"/><path d="M0 66 Q30 46 58 62 T100 58 V100 H0Z" fill="#d98f52"/><path d="M0 78 Q40 62 70 76 T100 74 V100 H0Z" fill="#b8693a"/><path d="M0 90 Q34 80 60 90 T100 88 V100 H0Z" fill="#8c4a2b"/>`; break;
    case 3: s = `<defs>${lg(id, "#1c2541", "#41507e")}</defs><rect width="100" height="100" fill="url(#${id})"/><circle cx="68" cy="30" r="11" fill="#f3e6c4"/><circle cx="72" cy="27" r="10" fill="#26315a"/>${[[14, 18], [30, 10], [44, 26], [86, 14], [22, 40], [90, 44]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r=".9" fill="#f3e6c4"/>`).join("")}<path d="M0 74 Q24 58 46 70 T100 64 V100 H0Z" fill="#141b31"/><rect x="58" y="62" width="9" height="8" fill="#f2b65a"/>`; break;
    case 4: s = `<rect width="100" height="100" fill="#24403b"/>${[34, 27, 20, 13, 6].map((r, i) => `<circle cx="50" cy="56" r="${r}" fill="none" stroke="${i % 2 ? "#d47f5a" : "#e7c58d"}" stroke-width="3"/>`).join("")}<rect y="86" width="100" height="14" fill="#1a2f2b"/>`; break;
    case 5: s = ["#f4d7b5", "#eeb48a", "#e08a6b", "#b85e5e", "#6f3f55", "#3b2a42"].map((c, i) => `<rect y="${i * 17}" width="100" height="17" fill="${c}"/>`).join("") + `<circle cx="30" cy="40" r="12" fill="#fbeee0" opacity=".9"/>`; break;
    case 6: s = `<rect width="100" height="100" fill="#efe6d8"/>${[[0, 0, "#c75b39"], [67, 0, "#2f4a5c"], [0, 34, "#e2b04a"], [34, 34, "#2f4a5c"], [67, 34, "#c75b39"], [0, 67, "#2f4a5c"], [34, 67, "#e2b04a"]].map(([x, y, c]) => `<rect x="${x}" y="${y}" width="33" height="33" fill="${c}"/>`).join("")}<path d="M34 34 a33 33 0 0 1 33 33 H34Z" fill="#efe6d8"/><circle cx="83" cy="84" r="9" fill="#c75b39"/>`; break;
    default: s = `<defs>${lg(id, "#d8e5d5", "#9dbfa8")}</defs><rect width="100" height="100" fill="url(#${id})"/>${[[10, 70, 22], [26, 64, 30], [44, 72, 20], [60, 60, 34], [80, 68, 26], [94, 74, 18]].map(([x, y, h], i) => `<path d="M${x} ${y - h} L${x + 9} ${y + 12} H${x - 9}Z" fill="${i % 2 ? "#2f5a46" : "#3e7258"}"/>`).join("")}<rect y="82" width="100" height="18" fill="#24463a"/>`;
  }
  return svgWrap(s);
}
const cover = (k, s, r = "var(--radius-sm)", extra = "") => `<div style="width:${s}px;height:${s}px;flex:none;border-radius:${r};overflow:hidden;${extra}">${art(k)}</div>`;
const coverFill = (k, r = "var(--radius-sm)") => `<div style="aspect-ratio:1;width:100%;border-radius:${r};overflow:hidden;box-shadow:var(--shadow-sm)">${art(k)}</div>`;

function photo(k, filter = "") {
  const id = "gmp" + GID++;
  let s;
  switch (k % 6) {
    case 0: s = `<defs>${lg(id, "#f2c4a0", "#9fb5d2")}</defs><rect width="100" height="100" fill="url(#${id})"/><circle cx="64" cy="40" r="8" fill="#fbe3bf"/><path d="M0 62 L18 44 L30 54 L48 34 L66 52 L80 40 L100 58 V100 H0Z" fill="#7d8aa6"/><path d="M0 72 L22 56 L40 68 L58 52 L78 66 L100 60 V100 H0Z" fill="#56627e"/><path d="M0 84 L30 70 L56 82 L80 74 L100 80 V100 H0Z" fill="#323b52"/><path d="M48 34 L44 40 L52 40Z" fill="#f4efe6"/>`; break;
    case 1: s = `<defs>${lg(id, "#cfe3ea", "#f2e5cf")}${lg(id + "s", "#3f7f96", "#25566b")}</defs><rect width="100" height="100" fill="url(#${id})"/><rect y="52" width="100" height="48" fill="url(#${id}s)"/><path d="M52 52 L64 30 L78 34 L100 26 V100 H70 Q62 74 52 52Z" fill="#6a5643"/><path d="M0 86 Q30 78 60 88 L70 100 H0Z" fill="#e7d3b0"/><path d="M8 62h20M30 68h22M12 74h18" stroke="#e8f2f4" stroke-opacity=".6" stroke-width="1"/>`; break;
    case 2: s = `<defs>${lg(id, "#dbe7f0", "#a9c4d8")}</defs><rect width="100" height="100" fill="url(#${id})"/><path d="M0 56 L14 40 L24 50 L36 34 L52 52 L66 38 L82 50 L100 42 V58 H0Z" fill="#8aa1b5"/>${[[6, 58], [16, 58], [28, 58], [70, 58], [84, 58], [94, 58]].map(([x, y], i) => `<path d="M${x} ${y - 14 - (i % 3) * 3} L${x + 5} ${y} H${x - 5}Z" fill="#2f4a3d"/>`).join("")}<rect y="58" width="100" height="42" fill="#7d9bb0"/><path d="M10 66h30M48 72h40M20 80h50" stroke="#dbe7f0" stroke-opacity=".55" stroke-width="1"/>`; break;
    case 3: s = `<defs>${lg(id, "#f0b98d", "#7d6b9a")}</defs><rect width="100" height="100" fill="url(#${id})"/>${[[0, 40, 18], [16, 28, 14], [28, 48, 16], [42, 22, 14], [54, 36, 18], [70, 30, 12], [80, 44, 20]].map(([x, y, w], i) => `<rect x="${x}" y="${y}" width="${w}" height="${100 - y}" fill="${i % 2 ? "#3a3550" : "#4a4262"}"/>${[0, 1, 2, 3, 4, 5].map((r) => `<rect x="${x + 3}" y="${y + 6 + r * 9}" width="3" height="4" fill="#f6d58e" opacity="${(r + i) % 3 ? 0.9 : 0.25}"/><rect x="${x + w - 6}" y="${y + 6 + r * 9}" width="3" height="4" fill="#f6d58e" opacity="${(r + i) % 2 ? 0.85 : 0.2}"/>`).join("")}`).join("")}<rect y="90" width="100" height="10" fill="#2a2638"/>`; break;
    case 4: s = `<defs>${lg(id, "#f3d6ab", "#e9a46c")}</defs><rect width="100" height="100" fill="url(#${id})"/><circle cx="28" cy="34" r="9" fill="#fbecd2"/><path d="M0 64 Q30 46 60 60 T100 56 V100 H0Z" fill="#d48f55"/><path d="M0 78 Q40 62 72 76 T100 72 V100 H0Z" fill="#b66a3c"/><path d="M0 92 Q34 82 62 92 T100 90 V100 H0Z" fill="#8a4a2c"/>`; break;
    default: s = `<defs>${lg(id, "#e3ebe2", "#a7c3ae")}</defs><rect width="100" height="100" fill="url(#${id})"/>${[[8, 70, 30], [22, 66, 38], [38, 74, 26], [54, 62, 42], [70, 70, 30], [86, 64, 40], [98, 72, 28]].map(([x, y, h], i) => `<path d="M${x} ${y - h} L${x + 8} ${y + 14} H${x - 8}Z" fill="${i % 2 ? "#2d5243" : "#3e6c58"}"/>`).join("")}<rect y="50" width="100" height="8" fill="#eef3ea" opacity=".5"/><rect y="84" width="100" height="16" fill="#22412f"/>`;
  }
  return svgWrap(s, filter ? `filter:${filter}` : "");
}
const pic = (k, w, h, r = "var(--radius)", filter = "", extra = "") => `<div style="width:${w};height:${h};flex:none;border-radius:${r};overflow:hidden;position:relative;${extra}">${photo(k, filter)}</div>`;

// product shots: [bg, body, cap, shape]
const PRODS = [["#efe6da", "#f8f4ec", "#c9b79c", "pump"], ["#e4ece6", "#cfe0d4", "#5f7f6b", "tube"], ["#f3e2cf", "#c98a3f", "#2f2a26", "dropper"], ["#ece7f1", "#f6f3f8", "#8f86a3", "jar"], ["#e7eef2", "#fbfcfd", "#4f7896", "bottle"], ["#f2e9dc", "#e9d6b8", "#7b6243", "jar"], ["#eae3ec", "#cdb7d6", "#4c3d57", "bottle"]];
function prod(k, s, r = "var(--radius-sm)") {
  const [bg, b, c, sh] = PRODS[k % PRODS.length];
  const shape = {
    pump: `<rect x="14" y="16" width="12" height="20" rx="2" fill="${b}" stroke="#00000018"/><rect x="18" y="10" width="4" height="6" fill="${c}"/><rect x="16" y="8" width="10" height="3" rx="1" fill="${c}"/><rect x="16" y="22" width="8" height="6" fill="${c}" opacity=".35"/>`,
    tube: `<path d="M13 8h14l-2 26h-10z" fill="${b}" stroke="#00000018"/><rect x="15" y="34" width="10" height="4" rx="1" fill="${c}"/><rect x="15" y="16" width="10" height="5" fill="${c}" opacity=".4"/>`,
    dropper: `<rect x="13" y="18" width="14" height="18" rx="3" fill="${b}"/><rect x="15" y="12" width="10" height="6" fill="${c}"/><ellipse cx="20" cy="9" rx="4" ry="4.5" fill="${c}"/><rect x="15" y="24" width="10" height="6" fill="#f6eadb" opacity=".8"/>`,
    jar: `<rect x="9" y="20" width="22" height="15" rx="3" fill="${b}" stroke="#00000018"/><rect x="8" y="14" width="24" height="7" rx="2" fill="${c}"/><rect x="13" y="25" width="14" height="5" fill="${c}" opacity=".3"/>`,
    bottle: `<rect x="13" y="14" width="14" height="22" rx="3" fill="${b}" stroke="#00000018"/><rect x="16" y="7" width="8" height="7" rx="1" fill="${c}"/><rect x="15" y="21" width="10" height="7" fill="${c}" opacity=".35"/>`,
  }[sh];
  return `<div style="width:${s}px;height:${s}px;flex:none;border-radius:${r};overflow:hidden"><svg viewBox="0 0 40 40" width="100%" height="100%" aria-hidden="true" style="display:block"><rect width="40" height="40" fill="${bg}"/>${shape}</svg></div>`;
}
const barcode = (w, h, seed = 7) => { let x = 0, out = "", n = seed; while (x < 96) { n = (n * 9301 + 49297) % 233280; const bw = 1 + (n % 3), gap = 1 + ((n >> 3) % 2); out += `<rect x="${x}" y="0" width="${bw}" height="${x < 4 || x > 90 || (x > 46 && x < 50) ? 100 : 88}" fill="#1d1d1d"/>`; x += bw + gap; } return `<svg viewBox="0 0 100 100" width="${w}" height="${h}" preserveAspectRatio="none" aria-hidden="true" style="display:block">${out}</svg>`; };

/* ---------------------------------------------------------------- audio (Tidewell) */
// title, artist, duration, plays, cover
const ALB = [["Quayside Lamps Again", "3:48", "2,412,880"], ["Paper Boats in March", "4:05", "1,906,214"], ["Low Tide Letters", "3:31", "3,118,502"], ["Salt on the Window", "4:22", "1,240,977", "Odalie Fenwick"], ["The Ferry Doesn’t Wait", "3:12", "884,310"], ["Gull Choir", "2:47", "512,066"], ["Kettle Weather", "3:56", "731,449"], ["Rope and Lantern", "4:41", "466,093"], ["Undertow, Softly", "3:09", "402,718"], ["Last Bus to Pellow Bay", "5:02", "958,120"]];
const TR = [["Quayside Lamps Again", "Marrow Lane", "3:48", 0], ["Copper Field Hymn", "Saltgrass", "3:05", 2], ["Night Ferry Static", "Paper Kestrel", "4:18", 3], ["Bloom Season", "The Quiet Orchards", "3:34", 1], ["Slow Orbit Club", "Velvet Almanac", "5:11", 4], ["Seat by the Porthole", "Odalie Fenwick", "3:27", 5], ["Pinewood Radio", "Nils Ambery", "4:02", 7], ["Tiles and Mortar", "Corvo & Wren", "2:58", 6]];
const MIX = [["Slow Sunday Mix", "Odalie Fenwick, Saltgrass and more", 1], ["Deep Focus Drift", "Paper Kestrel, Nils Ambery", 7], ["New from your artists", "Updated every Friday", 5], ["Rainy Window Mix", "The Quiet Orchards, Marrow Lane", 3], ["Coastal Throwbacks", "Songs you played in 2024", 0], ["Kitchen Floor Dance", "Corvo & Wren, Velvet Almanac", 6]];
const NEWR = [["Glass Orchard Weather", "The Quiet Orchards", "Album", 1], ["Copper Field Hymn", "Saltgrass", "Single", 2], ["Night Ferry Static", "Paper Kestrel", "EP", 3], ["Pinewood Radio", "Nils Ambery", "Album", 7], ["Tiles and Mortar", "Corvo & Wren", "Single", 6], ["Slow Orbit Club", "Velvet Almanac", "Album", 4]];
const PLS = [["Liked songs", 5], ["Sunday Porch", 1], ["Late Ferry Home", 3], ["Glass Rain Focus", 7], ["Saltgrass essentials", 2], ["Kitchen dancing", 6]];
const ANAV = [["home", "Home"], ["search", "Search"], ["gm_lib", "Your library"], ["gm_radio", "Live sessions"], ["gm_dl", "Downloads"]];
const ATABS = [["home", "Home"], ["search", "Search"], ["gm_lib", "Library"], ["gm_radio", "Live"]];

const aSide = (p, active) => `<aside class="side"><div class="logo"><b></b>${esc(p.name)}</div>
${ANAV.map(([i, l]) => `<div class="nav${l === active ? " on" : ""}">${ic(i)}${l}</div>`).join("")}
<div class="grp" style="display:flex;justify-content:space-between">Playlists <span style="display:flex">${ic("plus", 14)}</span></div>
${PLS.map(([n, k]) => `<div class="nav" style="padding:5px 8px;font-size:13px">${cover(k, 26, "4px")}<span style="${ell}">${n}</span></div>`).join("")}
<div class="foot">${av("PN", 28)}<div><div style="font-weight:500">Priya Nair</div><div class="muted" style="font-size:12px">Listener · Premium</div></div></div></aside>`;
const aTop = (ph = "What do you want to hear?") => `<div class="top"><span class="btn" style="width:34px;padding:0">${ic("back", 15)}</span><span class="btn" style="width:34px;padding:0">${ic("chevron", 15)}</span><div class="search" style="margin-left:12px;margin-right:auto;flex:0 1 380px">${ic("search", 15)}${ph}</div>${icoBtn("bell", 19)}${av("PN", 30)}</div>`;
const pbar = (fr = 0.45) => `<div style="border-top:1px solid var(--border);background:var(--surface);display:grid;grid-template-columns:1fr 1.3fr 1fr;align-items:center;padding:0 20px;gap:24px">
<div style="display:flex;gap:12px;align-items:center;min-width:0">${cover(0, 52)}<div style="${ell}"><div style="font-weight:600;font-size:13.5px">Quayside Lamps Again</div><div class="muted" style="font-size:12px">Marrow Lane</div></div><span style="color:var(--primary);display:flex">${fillHeart(18)}</span></div>
<div style="display:grid;gap:6px;justify-items:center"><div style="display:flex;gap:22px;align-items:center;color:var(--muted)">${ic("gm_shuffle", 18)}${ic("gm_prev", 18)}${roundBtn(36, fillPause(16))}${ic("gm_next", 18)}${ic("gm_repeat", 18)}</div>${scrub("1:42", "3:48", fr)}</div>
<div style="display:flex;gap:16px;justify-content:flex-end;align-items:center;color:var(--muted)">${ic("gm_mic", 17)}${ic("gm_queue", 17)}${ic("gm_device", 17)}${ic("gm_vol", 17)}<span style="width:90px;height:4px;border-radius:2px;background:${track}"><span style="display:block;width:65%;height:100%;border-radius:2px;background:var(--text)"></span></span></div></div>`;
const aWeb = (p, active, inner, bar = true) => `<div style="display:grid;grid-template-rows:minmax(0,1fr)${bar ? " 80px" : ""};height:100%"><div class="shell" style="height:auto;min-height:0">${aSide(p, active)}<main class="main">${inner}</main></div>${bar ? pbar() : ""}</div>`;
const mini = () => `<div style="flex:none;margin:0 10px 8px;padding:8px 10px 10px 8px;border-radius:var(--radius);display:flex;align-items:center;gap:10px;background:${tint(16)};position:relative;overflow:hidden">${cover(0, 40, "6px")}<div style="flex:1;${ell}"><div style="font-weight:600;font-size:13px;${ell}">Quayside Lamps Again</div><div class="muted" style="font-size:11.5px">Marrow Lane · Living room speaker</div></div>${icoBtn("gm_device", 20)}<span style="display:flex">${fillPause(22)}</span><span style="position:absolute;left:10px;right:10px;bottom:3px;height:2px;border-radius:1px;background:${track}"><span style="display:block;width:45%;height:100%;background:var(--text)"></span></span></div>`;
const trackRow = (n, t, a, d, plays, on, k) => `<div style="display:grid;grid-template-columns:32px minmax(0,1fr) 120px 52px 28px;column-gap:10px;align-items:center;height:40px;padding:0 10px;border-radius:var(--radius-sm);${on ? `background:${tint(10)}` : ""}">
<span class="num" style="font-size:13px;${on ? "color:var(--primary)" : "color:var(--muted)"}">${on ? fillPlay(13) : n}</span><div style="${ell};display:flex;gap:10px;align-items:center">${k != null ? cover(k, 30, "4px") : ""}<div style="${ell}"><div style="font-weight:500;font-size:13.5px;${ell};${on ? "color:var(--primary)" : ""}">${t}</div>${a ? `<div class="muted" style="font-size:12px;${ell}">${a}</div>` : ""}</div></div>
<span class="num muted" style="font-size:12.5px;font-weight:500">${plays}</span><span class="num muted" style="font-size:12.5px;font-weight:500;text-align:right">${d}</span>${icoBtn("more", 16)}</div>`;

// music-home
const homeWeb = (p, st) => p.variant === "library" ? libWeb(p, st) : aWeb(p, "Home", `${aTop()}
<div style="display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:24px;padding:20px 24px;min-height:0;overflow:hidden">
<div style="display:flex;flex-direction:column;gap:20px;min-width:0">
<div style="display:flex;align-items:center;gap:14px"><h1 style="font-size:${HC(st, 26)}px">Good evening, Priya</h1><div style="display:flex;gap:6px;margin-left:auto">${chip("All", true, 28)}${chip("Music", false, 28)}${chip("Live sessions", false, 28)}${chip("Downloaded", false, 28)}</div></div>
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">${[["Low Tide Letters", 0], ["Liked songs", 5], ["Glass Rain Focus", 7], ["Saltgrass", 2], ["Late Ferry Home", 3], ["Slow Orbit Club", 4]].map(([t, k], i) => `<div class="card" style="display:flex;align-items:center;gap:12px;height:64px;overflow:hidden;padding-right:12px;box-shadow:none">${cover(k, 64, "0")}<b style="font-size:13.5px;flex:1;${ell}">${t}</b>${i === 0 ? `<span style="color:var(--primary);display:flex">${ic("gm_vol", 16)}</span>` : ""}</div>`).join("")}</div>
${sec("Made for you", "Show all")}
<div style="display:grid;grid-template-columns:repeat(6,1fr);gap:16px">${MIX.map(([t, d, k]) => `<div style="min-width:0">${coverFill(k)}<div style="font-weight:600;font-size:13px;margin-top:8px;${ell}">${t}</div><div class="muted" style="font-size:12px;${ell}">${d}</div></div>`).join("")}</div>
${sec("Recently played", "Show all")}
<div style="display:grid;grid-template-columns:repeat(6,1fr);gap:16px">${[["Low Tide Letters", "Album · Marrow Lane", 0], ["Sunday Porch", "Playlist · 42 songs", 1], ["Saltgrass", "Artist", 2], ["Night Ferry Static", "EP · Paper Kestrel", 3], ["Slow Orbit Club", "Album · Velvet Almanac", 4], ["Seat by the Porthole", "Single · Odalie Fenwick", 5]].map(([t, d, k], i) => `<div style="min-width:0">${i === 2 ? `<div style="aspect-ratio:1;border-radius:50%;overflow:hidden">${art(k)}</div>` : coverFill(k)}<div style="font-weight:600;font-size:13px;margin-top:8px;${ell}">${t}</div><div class="muted" style="font-size:12px;${ell}">${d}</div></div>`).join("")}</div>
</div>
<div style="display:flex;flex-direction:column;gap:12px;min-width:0">
${sec("New releases", "Fri 6 Nov")}
<div class="card" style="padding:6px 12px">${NEWR.map(([t, a, ty, k], i) => `<div style="display:flex;gap:12px;align-items:center;padding:8px 0;${i ? "border-top:1px solid var(--border)" : ""}">${cover(k, 46)}<div style="flex:1;${ell}"><div style="font-weight:600;font-size:13px;${ell}">${t}</div><div class="muted" style="font-size:12px">${ty} · ${a}</div></div>${icoBtn("plus", 16)}</div>`).join("")}</div>
<div class="card" style="padding:14px;display:grid;gap:8px;background:${tint(10)}"><div style="display:flex;gap:8px;align-items:center">${sbadge("Live tonight", "accent")}<span class="muted" style="font-size:12px">21:00</span></div><b style="font-size:14px">Saltgrass · Front-room session</b><span class="muted" style="font-size:12.5px">Six new songs played live from Ilse Varnum’s studio. 1,204 listeners waiting.</span><span class="btn" style="justify-self:start">${ic("bell", 15)}Remind me</span></div>
</div></div>`);
const homeMobile = (p, st) => p.variant === "library" ? libMobile(p, st) : `<div class="phone">${status()}
<div class="mtop"><h1 style="font-size:${HC(st, 24)}px">Good evening</h1><span style="display:flex;gap:16px">${ic("bell", 21)}${ic("clock", 21)}${ic("gear", 21)}</span></div>
<div class="mbody" style="gap:14px;padding-right:0">
<div style="display:flex;gap:6px;overflow:hidden">${chip("All", true, 30)}${chip("Music", false, 30)}${chip("Live sessions", false, 30)}${chip("Downloaded", false, 30)}</div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding-right:20px">${[["Low Tide Letters", 0], ["Liked songs", 5], ["Glass Rain Focus", 7], ["Saltgrass", 2], ["Late Ferry Home", 3], ["Slow Orbit Club", 4]].map(([t, k]) => `<div style="display:flex;align-items:center;gap:8px;height:50px;border-radius:var(--radius-sm);overflow:hidden;background:${tint(8, "text")}">${cover(k, 50, "0")}<b style="font-size:12.5px;line-height:1.2;${ell}">${t}</b></div>`).join("")}</div>
<div style="padding-right:20px">${sec("Made for you", "Show all")}</div>
<div style="display:flex;gap:12px;overflow:hidden">${MIX.slice(0, 4).map(([t, d, k]) => `<div style="width:136px;flex:none">${cover(k, 136)}<div style="font-weight:600;font-size:12.5px;margin-top:6px;${ell}">${t}</div><div class="muted" style="font-size:11.5px;${ell}">${d}</div></div>`).join("")}</div>
<div style="padding-right:20px">${sec("New releases for you")}</div>
<div style="display:grid;gap:10px;padding-right:20px">${NEWR.slice(0, 2).map(([t, a, ty, k]) => `<div style="display:flex;gap:12px;align-items:center">${cover(k, 52)}<div style="flex:1;${ell}"><div style="font-weight:600;font-size:13.5px;${ell}">${t}</div><div class="muted" style="font-size:12px">${ty} · ${a}</div></div>${icoBtn("plus", 18)}</div>`).join("")}</div>
</div>${mini()}${tabBar("Home", ATABS)}</div>`;

const LIB = [["Liked songs", "Playlist · 318 songs", 5, "Pinned", 1], ["Low Tide Letters", "Album · Marrow Lane", 0, "Today", 1], ["Sunday Porch", "Playlist · Priya Nair · 42 songs", 1, "Yesterday", 1], ["Saltgrass", "Artist", 2, "3 Nov", 0, 1], ["Late Ferry Home", "Playlist · Priya Nair · 27 songs", 3, "1 Nov", 1], ["Slow Orbit Club", "Album · Velvet Almanac", 4, "28 Oct", 0], ["Odalie Fenwick", "Artist", 5, "22 Oct", 0, 1], ["Glass Rain Focus", "Playlist · Tidewell · 60 songs", 7, "19 Oct", 1], ["Tiles and Mortar", "Single · Corvo & Wren", 6, "12 Oct", 0], ["Kitchen dancing", "Playlist · Priya Nair · 35 songs", 6, "4 Oct", 0]];
const libWeb = (p, st) => aWeb(p, "Your library", `${aTop("Search in your library")}
<div style="display:flex;flex-direction:column;gap:16px;padding:20px 24px;min-height:0;overflow:hidden">
<div style="display:flex;align-items:center;gap:12px"><h1 style="font-size:${HC(st, 26)}px">Your library</h1><span class="muted" style="font-size:13px">214 items · 9.6 GB downloaded</span><div style="margin-left:auto;display:flex;gap:8px"><span class="btn">${ic("plus", 15)}New playlist</span><span class="btn">${ic("list", 15)}Recently added${ic("chevdown", 14)}</span></div></div>
<div style="display:flex;gap:8px">${chip("Playlists", true)}${chip("Albums")}${chip("Artists")}${chip("Downloaded")}${chip("Podcasts & sessions")}</div>
<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px">${[["Liked songs", "318 songs · updated today", 5], ["Downloads", "512 songs · 9.6 GB on this device", 7], ["Sunday Porch", "42 songs · 2 h 38 min", 1], ["Late Ferry Home", "27 songs · 1 h 41 min", 3]].map(([t, d, k], i) => `<div class="card" style="display:flex;gap:12px;align-items:center;padding:10px">${cover(k, 64)}<div style="${ell}"><div style="font-weight:600;font-size:14px;${ell}">${t}</div><div class="muted" style="font-size:12px;${ell}">${d}</div>${i < 2 ? `<div style="margin-top:4px">${sbadge(i ? "Offline" : "Pinned", i ? "success" : "accent")}</div>` : ""}</div></div>`).join("")}</div>
<div class="card" style="padding:4px 8px;overflow:hidden">
<div style="display:grid;grid-template-columns:48px minmax(0,1fr) 220px 120px 40px;padding:8px 10px;font-size:11.5px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;border-bottom:1px solid var(--border)" class="muted"><span></span><span>Title</span><span>Type</span><span>Added</span><span></span></div>
${LIB.slice(1, 10).map(([t, d, k, add, dl, artist]) => `<div style="display:grid;grid-template-columns:48px minmax(0,1fr) 220px 120px 40px;align-items:center;height:50px;padding:0 10px;border-bottom:1px solid var(--border)">${artist ? `<div style="width:38px;height:38px;border-radius:50%;overflow:hidden">${art(k)}</div>` : cover(k, 38)}<b style="font-size:13.5px;${ell}">${t}</b><span class="muted" style="font-size:12.5px;${ell}">${d}</span><span class="muted" style="font-size:12.5px">${add}</span><span style="display:flex;color:${dl ? "var(--success)" : "var(--muted)"}">${ic(dl ? "gm_dl" : "more", 17)}</span></div>`).join("")}
</div></div>`);
const libMobile = (p, st) => `<div class="phone">${status()}
<div class="mtop"><div style="display:flex;gap:10px;align-items:center">${av("PN", 32)}<h1 style="font-size:${HC(st, 24)}px">Your library</h1></div><span style="display:flex;gap:18px">${ic("search", 21)}${ic("plus", 22)}</span></div>
<div class="mbody" style="gap:10px">
<div style="display:flex;gap:6px;overflow:hidden">${chip("Playlists", true)}${chip("Albums")}${chip("Artists")}${chip("Downloaded")}</div>
<div style="display:flex;justify-content:space-between;align-items:center;font-size:12.5px;font-weight:500"><span style="display:flex;gap:6px;align-items:center">${ic("list", 15)}Recently added</span>${icoBtn("grid", 16)}</div>
${LIB.slice(0, 8).map(([t, d, k, add, dl, artist]) => `<div style="display:flex;gap:12px;align-items:center">${artist ? `<div style="width:52px;height:52px;flex:none;border-radius:50%;overflow:hidden">${art(k)}</div>` : cover(k, 52)}<div style="flex:1;${ell}"><div style="font-weight:600;font-size:14px;${ell};${add === "Today" ? "color:var(--primary)" : ""}">${t}</div><div class="muted" style="font-size:12px;display:flex;gap:5px;align-items:center;${ell}">${add === "Pinned" ? `<span style="color:var(--primary);display:flex">${ic("pin", 12)}</span>` : ""}${dl ? `<span style="color:var(--success);display:flex">${ic("gm_dl", 12)}</span>` : ""}${d}</div></div></div>`).join("")}
</div>${mini()}${tabBar("Library", ATABS)}</div>`;

// album-page
const credits = [["Written by", "Hollis Marrow, Bea Lindqvist"], ["Produced by", "Arlo Penhallow"], ["Mixed at", "Gullhouse Studio, Pellow Bay"], ["Label", "℗ 2026 Copperline Records"]];
const albumWeb = (p, st) => p.variant === "artist" ? artistWeb(p, st) : aWeb(p, "Your library", `${aTop()}
<div style="display:grid;grid-template-columns:minmax(0,1fr) 280px;gap:28px;padding:22px 24px;min-height:0;overflow:hidden">
<div style="display:flex;flex-direction:column;gap:16px;min-width:0">
<div style="display:flex;gap:24px;align-items:flex-end">${cover(0, 188, "var(--radius)", "box-shadow:var(--shadow-lg)")}<div style="display:grid;gap:8px;min-width:0"><span style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.08em" class="muted">Album</span><h1 style="font-size:${HC(st, 48)}px;line-height:1">Low Tide Letters</h1>
<div style="display:flex;gap:8px;align-items:center;font-size:13.5px">${av("ML", 24)}<b>Marrow Lane</b><span class="muted">· 2026 · 10 songs, 39 min 33 s</span></div></div></div>
<div style="display:flex;gap:18px;align-items:center">${roundBtn(52, fillPlay(22))}${icoBtn("gm_shuffle", 24)}<span style="color:var(--primary);display:flex">${fillHeart(26)}</span>${icoBtn("gm_dl", 24)}${icoBtn("share", 22)}${icoBtn("more", 22)}<span style="margin-left:auto;font-size:12.5px;display:flex;gap:6px;align-items:center" class="muted">${ic("list", 15)}List</span></div>
<div>
<div style="display:grid;grid-template-columns:32px minmax(0,1fr) 120px 52px 28px;column-gap:10px;padding:0 10px 8px;font-size:11.5px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;border-bottom:1px solid var(--border)" class="muted"><span>#</span><span>Title</span><span>Plays</span><span style="text-align:right">${ic("clock", 14)}</span><span></span></div>
${ALB.map(([t, d, pl, ft], i) => trackRow(i + 1, t, ft ? `Marrow Lane, ${ft}` : "", d, pl, i === 0)).join("")}</div></div>
<div style="display:flex;flex-direction:column;gap:14px">
<div class="card" style="padding:16px;display:grid;gap:10px">${sec("Credits")}${credits.map(([a, b]) => `<div><div class="muted" style="font-size:11.5px">${a}</div><div style="font-size:13px;font-weight:500">${b}</div></div>`).join("")}<span class="muted" style="font-size:12px">Released 23 Oct 2026</span></div>
<div class="card" style="padding:16px;display:grid;gap:10px">${sec("More by Marrow Lane")}<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">${[["Kettle Weather (Live)", "2025 · EP", 7], ["Northern Porch", "2023 · Album", 2]].map(([t, d, k]) => `<div style="min-width:0">${coverFill(k)}<div style="font-weight:600;font-size:12.5px;margin-top:6px;${ell}">${t}</div><div class="muted" style="font-size:11.5px">${d}</div></div>`).join("")}</div></div>
<div class="card" style="padding:14px 16px;display:grid;gap:10px">${sec("Fans also like")}${[["Saltgrass", 2], ["Odalie Fenwick", 5], ["Paper Kestrel", 3]].map(([n, k]) => `<div style="display:flex;gap:10px;align-items:center"><div style="width:34px;height:34px;border-radius:50%;overflow:hidden;flex:none">${art(k)}</div><b style="font-size:13px;flex:1">${n}</b>${icoBtn("plus", 15)}</div>`).join("")}</div>
</div></div>`);
const albumMobile = (p, st) => p.variant === "artist" ? artistMobile(p, st) : `<div class="phone">${status()}
<div class="mtop">${icoBtn("back", 22, "color:var(--text)")}<span style="font-size:13px;font-weight:600">Album</span>${icoBtn("search", 20, "color:var(--text)")}</div>
<div class="mbody" style="gap:10px;padding-top:0">
<div style="display:grid;justify-items:center">${cover(0, 178, "var(--radius)", "box-shadow:var(--shadow-lg)")}</div>
<div><h1 style="font-size:${HC(st, 23)}px">Low Tide Letters</h1><div style="display:flex;gap:6px;align-items:center;font-size:13px;margin-top:4px">${av("ML", 20)}<b>Marrow Lane</b></div><div class="muted" style="font-size:12px;margin-top:2px">Album · 2026 · 10 songs, 39 min</div></div>
<div style="display:flex;gap:20px;align-items:center"><span style="color:var(--primary);display:flex">${fillHeart(24)}</span>${icoBtn("gm_dl", 23)}${icoBtn("more", 22)}<span style="margin-left:auto;display:flex;gap:16px;align-items:center">${icoBtn("gm_shuffle", 24, "color:var(--primary)")}${roundBtn(50, fillPlay(22))}</span></div>
${ALB.slice(0, 5).map(([t, d, , ft], i) => `<div style="display:flex;gap:12px;align-items:center"><span class="num" style="width:16px;font-size:13px;${i ? "color:var(--muted)" : "color:var(--primary)"}">${i + 1}</span><div style="flex:1;${ell}"><div style="font-weight:500;font-size:14px;${ell};${i ? "" : "color:var(--primary)"}">${t}</div><div class="muted" style="font-size:12px;${ell}">Marrow Lane${ft ? ", " + ft : ""} · ${d}</div></div>${icoBtn("more", 18)}</div>`).join("")}
<div class="muted" style="font-size:11.5px">Produced by Arlo Penhallow · ℗ 2026 Copperline Records</div>
</div>${mini()}${tabBar("Library", ATABS)}</div>`;

const SHOWS = [["Nov", "14", "Pellow Bay", "The Lantern Room · 20:00", "Tickets"], ["Nov", "21", "Eastmoor", "Saltworks Hall · 19:30", "Few left"], ["Dec", "03", "Haverleigh", "Old Ropery · 20:00", "Tickets"], ["Dec", "12", "Brannock", "Kiln Yard Stage · 21:00", "Sold out"]];
const artistBanner = (h, name, st, mob) => `<div style="height:${h}px;position:relative;flex:none;overflow:hidden">${photo(1)}<div style="position:absolute;inset:0;background:linear-gradient(180deg,transparent 30%,${mix("var(--ink)", 80, "transparent")})"></div>
<div style="position:absolute;left:${mob ? 20 : 28}px;right:${mob ? 20 : 28}px;bottom:${mob ? 14 : 22}px;color:var(--on-ink)"><div style="display:flex;gap:6px;align-items:center;font-size:12px;font-weight:600">${sbadge("Verified artist", "accent")}</div><h1 style="font-size:${mob ? HC(st, 38) : HC(st, 64)}px;line-height:1;margin-top:8px;color:var(--on-ink)">${name}</h1><div style="font-size:13px;margin-top:6px;opacity:.85">1,204,330 monthly listeners</div></div></div>`;
const artistWeb = (p, st) => aWeb(p, "Search", `<div style="display:flex;flex-direction:column;min-height:0;overflow:hidden">${artistBanner(230, "Marrow Lane", st)}
<div style="display:flex;gap:18px;align-items:center;padding:16px 28px">${roundBtn(52, fillPlay(22))}${icoBtn("gm_shuffle", 24)}<span class="btn" style="height:34px">Following</span>${icoBtn("bell", 21)}${icoBtn("more", 22)}</div>
<div style="display:grid;grid-template-columns:minmax(0,1fr) 340px;gap:28px;padding:0 28px">
<div style="display:flex;flex-direction:column;gap:10px;min-width:0">${sec("Popular")}
<div>${ALB.slice(0, 5).map(([t, d, pl, ft], i) => trackRow(i + 1, t, ft ? `with ${ft}` : "", d, pl, i === 2, [0, 0, 0, 0, 0][i])).join("")}</div>
${sec("Discography", "Albums · Singles and EPs · Live")}
<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:16px">${[["Low Tide Letters", "2026 · Album", 0], ["Kettle Weather (Live)", "2025 · EP", 7], ["Quayside Lamps", "2024 · Single", 3], ["Northern Porch", "2023 · Album", 2], ["Rope Songs", "2021 · EP", 5]].map(([t, d, k]) => `<div style="min-width:0">${coverFill(k)}<div style="font-weight:600;font-size:12.5px;margin-top:6px;${ell}">${t}</div><div class="muted" style="font-size:11.5px">${d}</div></div>`).join("")}</div></div>
<div style="display:flex;flex-direction:column;gap:10px">${sec("Upcoming shows", "On tour")}
<div class="card" style="padding:4px 14px">${SHOWS.map(([m, d, c, v, s], i) => `<div style="display:flex;gap:12px;align-items:center;padding:10px 0;${i ? "border-top:1px solid var(--border)" : ""}"><div style="width:44px;flex:none;text-align:center;border-radius:var(--radius-sm);background:${tint(12)};padding:4px 0"><div style="font-size:10.5px;font-weight:600;text-transform:uppercase" class="muted">${m}</div><div class="num" style="font-size:17px">${d}</div></div><div style="flex:1;${ell}"><div style="font-weight:600;font-size:13.5px">${c}</div><div class="muted" style="font-size:12px;${ell}">${v}</div></div>${s === "Sold out" ? `<span class="muted" style="font-size:12px;font-weight:600">Sold out</span>` : s === "Few left" ? sbadge("Few left", "warning") : `<span class="btn" style="height:30px;padding:0 10px">${ic("gm_ticket", 14)}Tickets</span>`}</div>`).join("")}</div>
</div></div></div>`);
const artistMobile = (p, st) => `<div class="phone"><div style="position:relative">${artistBanner(214, "Marrow Lane", st, true)}<div style="position:absolute;top:0;left:0;right:0;color:var(--on-ink)">${status()}<div style="padding:0 16px"><span style="width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:${mix("var(--ink)", 50, "transparent")}">${ic("back", 18)}</span></div></div></div>
<div class="mbody" style="gap:10px;padding-top:12px">
<div style="display:flex;gap:16px;align-items:center"><span class="btn" style="height:32px">Following</span>${icoBtn("more", 22)}<span style="margin-left:auto;display:flex;gap:16px;align-items:center">${icoBtn("gm_shuffle", 24, "color:var(--primary)")}${roundBtn(50, fillPlay(22))}</span></div>
${sec("Popular")}
${ALB.slice(0, 3).map(([t, d, pl], i) => `<div style="display:flex;gap:12px;align-items:center"><span class="num muted" style="width:12px;font-size:13px">${i + 1}</span>${cover(0, 38)}<div style="flex:1;${ell}"><div style="font-weight:500;font-size:14px;${ell}">${t}</div><div class="muted num" style="font-size:12px;font-weight:500">${pl}</div></div><span class="num muted" style="font-size:12px;font-weight:500">${d}</span></div>`).join("")}
${sec("Upcoming shows", "See all 4")}
<div class="card" style="display:flex;gap:12px;align-items:center;padding:10px 12px"><div style="width:42px;flex:none;text-align:center;border-radius:var(--radius-sm);background:${tint(12)};padding:3px 0"><div style="font-size:10px;font-weight:600;text-transform:uppercase" class="muted">Nov</div><div class="num" style="font-size:16px">14</div></div><div style="flex:1;${ell}"><div style="font-weight:600;font-size:13.5px">Pellow Bay</div><div class="muted" style="font-size:12px">The Lantern Room · 20:00</div></div><span class="btn" style="height:30px;padding:0 10px">Tickets</span></div>
${sec("Discography", "Show all")}
<div style="display:flex;gap:12px;overflow:hidden;margin-right:-20px">${[["Low Tide Letters", "2026 · Album", 0], ["Kettle Weather (Live)", "2025 · EP", 7], ["Quayside Lamps", "2024 · Single", 3], ["Northern Porch", "2023", 2]].map(([t, d, k]) => `<div style="width:100px;flex:none">${cover(k, 100)}<div style="font-weight:600;font-size:12px;margin-top:5px;${ell}">${t}</div><div class="muted" style="font-size:11px">${d}</div></div>`).join("")}</div>
</div>${tabBar("Search", ATABS)}</div>`;

// play-queue
const QUEUE = [["Paper Boats in March", "Marrow Lane", "4:05", 0], ["Seat by the Porthole", "Odalie Fenwick", "3:27", 5], ["Copper Field Hymn", "Saltgrass", "3:05", 2]];
const NEXTFROM = [["Low Tide Letters", "Marrow Lane", "3:31", 0], ["Salt on the Window", "Marrow Lane, Odalie Fenwick", "4:22", 0], ["The Ferry Doesn’t Wait", "Marrow Lane", "3:12", 0], ["Gull Choir", "Marrow Lane", "2:47", 0], ["Kettle Weather", "Marrow Lane", "3:56", 0]];
const LYR = ["I left the porch light on for you", "the harbour hums the way it used to", "paper boats are running in the gutter", "all the way down to the sea", "and if the tide brings back a letter", "I’ll read it slow, I’ll read it better", "every word you never sent me", "folded up in salt and rain"];
const transport = (sz = 60, gap = 28) => `<div style="display:flex;align-items:center;justify-content:center;gap:${gap}px;color:var(--text)">${icoBtn("gm_shuffle", 22, "color:var(--primary)")}${ic("gm_prev", 28)}${roundBtn(sz, fillPause(Math.round(sz * 0.4)))}${ic("gm_next", 28)}${icoBtn("gm_repeat", 22)}</div>`;
const qRow = ([t, a, d, k], drag = true) => `<div style="display:flex;gap:12px;align-items:center;height:50px">${cover(k, 40)}<div style="flex:1;${ell}"><div style="font-weight:500;font-size:13.5px;${ell}">${t}</div><div class="muted" style="font-size:12px;${ell}">${a}</div></div><span class="num muted" style="font-size:12px;font-weight:500">${d}</span>${drag ? icoBtn("gm_drag", 18) : ""}</div>`;
const queueWeb = (p, st) => {
  const lyr = p.variant === "lyrics";
  const stage = lyr ? `<div style="display:flex;flex-direction:column;gap:18px;padding:28px 48px;min-width:0;background:${tint(14)};border-radius:var(--radius-lg)">
<div style="display:flex;gap:14px;align-items:center">${cover(0, 56)}<div><b style="font-size:15px">Quayside Lamps Again</b><div class="muted" style="font-size:12.5px">Marrow Lane · Low Tide Letters</div></div><span style="margin-left:auto">${sbadge("Synced lyrics", "accent")}</span></div>
<div style="display:grid;gap:10px;flex:1;align-content:center">${LYR.map((l, i) => `<div class="h" style="text-transform:none;font-size:${HC(st, 32)}px;line-height:1.2;${i === 3 ? "color:var(--primary)" : i < 3 ? "opacity:.4" : "opacity:.7"}">${l}</div>`).join("")}</div>
<div style="display:grid;gap:12px">${scrub("1:42", "3:48", 0.45)}${transport(56)}</div></div>`
    : `<div style="display:flex;flex-direction:column;gap:18px;align-items:center;justify-content:center;padding:20px 40px;min-width:0">
${cover(0, 380, "var(--radius-lg)", "box-shadow:var(--shadow-lg)")}
<div style="width:420px;display:flex;justify-content:space-between;align-items:center"><div><h1 style="font-size:${HC(st, 28)}px">Quayside Lamps Again</h1><div class="muted" style="font-size:14px;margin-top:2px">Marrow Lane · Low Tide Letters</div></div><span style="color:var(--primary);display:flex">${fillHeart(26)}</span></div>
<div style="width:420px">${scrub("1:42", "3:48", 0.45)}</div>${transport(60)}
<div style="display:flex;gap:22px;color:var(--muted);font-size:12.5px;align-items:center">${ic("gm_device", 17)}<span>Playing on Living room speaker</span>${ic("gm_mic", 17)}${ic("share", 17)}</div></div>`;
  const panel = lyr ? `<div class="card" style="padding:16px;display:flex;flex-direction:column;gap:6px;min-height:0;overflow:hidden">${sec("Up next", "Queue")}${QUEUE.map((r) => qRow(r, false)).join("")}<div class="muted" style="font-size:11.5px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;margin-top:6px">Next from: Low Tide Letters</div>${NEXTFROM.slice(0, 3).map((r) => qRow(r, false)).join("")}<div style="border-top:1px solid var(--border);margin-top:6px;padding-top:12px;display:grid;gap:10px">${sec("Credits")}${credits.slice(0, 3).map(([a, b]) => `<div><div class="muted" style="font-size:11.5px">${a}</div><div style="font-size:13px;font-weight:500">${b}</div></div>`).join("")}<span class="muted" style="font-size:11.5px">Lyrics provided by the artist</span></div></div>`
    : `<div class="card" style="padding:16px;display:flex;flex-direction:column;gap:4px;min-height:0;overflow:hidden">
<div style="display:flex;gap:16px;border-bottom:1px solid var(--border);margin-bottom:8px">${["Queue", "Recently played"].map((t, i) => `<span style="padding:0 0 10px;font-weight:600;font-size:13.5px;${i ? "color:var(--muted)" : "border-bottom:2px solid var(--primary)"}">${t}</span>`).join("")}</div>
<div class="muted" style="font-size:11.5px;font-weight:600;text-transform:uppercase;letter-spacing:.05em">Now playing</div>
<div style="display:flex;gap:12px;align-items:center;height:52px">${cover(0, 40)}<div style="flex:1;${ell}"><div style="font-weight:600;font-size:13.5px;color:var(--primary)">Quayside Lamps Again</div><div class="muted" style="font-size:12px">Marrow Lane</div></div><span style="color:var(--primary);display:flex">${ic("gm_vol", 16)}</span></div>
<div style="display:flex;justify-content:space-between;margin-top:6px"><span class="muted" style="font-size:11.5px;font-weight:600;text-transform:uppercase;letter-spacing:.05em">Next in queue</span><span style="font-size:12px;font-weight:600;color:var(--primary)">Clear queue</span></div>
${QUEUE.map((r, i) => i === 1 ? `<div style="border-radius:var(--radius-sm);background:${tint(10)};box-shadow:var(--shadow);padding:0 8px;margin:0 -8px">${qRow(r)}</div>` : qRow(r)).join("")}
<div class="muted" style="font-size:11.5px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;margin-top:6px">Next from: Low Tide Letters</div>
${NEXTFROM.slice(0, 4).map((r) => qRow(r)).join("")}
<div style="margin-top:auto;display:flex;gap:12px;align-items:center;padding-top:10px;border-top:1px solid var(--border)"><div style="flex:1"><b style="font-size:13px">Autoplay</b><div class="muted" style="font-size:12px">Keep playing similar music when your queue ends</div></div>${toggle(true)}</div></div>`;
  return aWeb(p, "Home", `<div class="top"><span class="btn" style="width:34px;padding:0">${ic("chevdown", 16)}</span><div style="text-align:center;margin:0 auto"><div class="muted" style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.06em">Playing from album</div><b style="font-size:13.5px">Low Tide Letters</b></div>${icoBtn("more", 20)}</div>
<div style="display:grid;grid-template-columns:minmax(0,1fr) 400px;gap:24px;padding:20px 24px;flex:1;min-height:0">${stage}${panel}</div>`, false);
};
const queueMobile = (p, st) => {
  const lyr = p.variant === "lyrics";
  const head = `<div class="mtop">${icoBtn("chevdown", 24, "color:var(--text)")}<div style="text-align:center"><div class="muted" style="font-size:10.5px;font-weight:600;text-transform:uppercase;letter-spacing:.06em">Playing from album</div><b style="font-size:13px">Low Tide Letters</b></div>${icoBtn("more", 22, "color:var(--text)")}</div>`;
  if (lyr) return `<div class="phone" style="background:${tint(18)}">${status()}${head}
<div class="mbody" style="gap:14px">
<div style="display:flex;gap:12px;align-items:center">${cover(0, 44)}<div style="flex:1"><b style="font-size:14px">Quayside Lamps Again</b><div class="muted" style="font-size:12px">Marrow Lane</div></div><span style="color:var(--primary);display:flex">${fillHeart(22)}</span></div>
<div style="display:grid;gap:12px;flex:1;align-content:center">${LYR.map((l, i) => `<div class="h" style="text-transform:none;font-size:${HC(st, 23)}px;line-height:1.2;${i === 3 ? "color:var(--primary)" : i < 3 ? "opacity:.4" : "opacity:.75"}">${l}</div>`).join("")}</div>
${scrub("1:42", "3:48", 0.45)}${transport(60, 24)}
<div style="display:flex;justify-content:space-between;color:var(--muted);padding-bottom:8px">${ic("gm_device", 19)}<span style="font-size:11.5px;font-weight:600">Synced lyrics</span>${ic("share", 19)}</div></div></div>`;
  return `<div class="phone">${status()}${head}
<div class="mbody" style="gap:12px">
<div style="display:flex;gap:12px;align-items:center">${cover(0, 72, "var(--radius)", "box-shadow:var(--shadow)")}<div style="flex:1;${ell}"><h1 style="font-size:${HC(st, 20)}px">Quayside Lamps Again</h1><div class="muted" style="font-size:13px">Marrow Lane</div></div><span style="color:var(--primary);display:flex">${fillHeart(24)}</span></div>
${scrub("1:42", "3:48", 0.45)}${transport(56, 26)}
<div style="display:flex;justify-content:space-between;align-items:center;padding-top:6px;border-top:1px solid var(--border)"><b style="font-size:15px">Up next</b><span style="display:flex;gap:8px;align-items:center;font-size:12.5px" class="muted">Autoplay ${toggle(true, 30)}</span></div>
<div class="muted" style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.05em">Next in queue</div>
<div style="margin-top:-6px">${QUEUE.map((r, i) => i === 1 ? `<div style="border-radius:var(--radius-sm);background:${tint(10)};box-shadow:var(--shadow);padding:0 8px;margin:0 -8px">${qRow(r)}</div>` : qRow(r)).join("")}</div>
<div class="muted" style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.05em">Next from: Low Tide Letters</div>
<div style="margin-top:-6px">${NEXTFROM.slice(0, 4).map((r) => qRow(r)).join("")}</div>
<div style="margin-top:auto;display:flex;justify-content:space-between;color:var(--muted)">${ic("gm_device", 20)}${ic("share", 20)}<span style="color:var(--primary);display:flex">${ic("gm_queue", 20)}</span></div></div></div>`;
};

/* ---------------------------------------------------------------- media (Fieldnote) */
const MNAV = [["home", "Feed"], ["globe", "Explore"], ["gm_story", "Stories"], ["bookmark", "Saved"], ["bell", "Activity"], ["users", "Profile"]];
const MTABS = [["home", "Feed"], ["globe", "Explore"], ["plus", "Post"], ["users", "Profile"]];
const mSide = (p, active) => `<aside class="side"><div class="logo"><b></b>${esc(p.name)}</div>
${MNAV.map(([i, l]) => `<div class="nav${l === active ? " on" : ""}">${ic(i)}${l}</div>`).join("")}
<span class="btn primary" style="margin:14px 4px 0">${ic("plus", 15)}New post</span>
<div class="grp">Following trips</div>${[["Kestrel Ridge, 4 days", 0], ["Saltmarsh Point", 1], ["Vallorn Pass", 5]].map(([t, k]) => `<div class="nav" style="padding:5px 8px;font-size:13px">${pic(k, "24px", "24px", "6px")}<span style="${ell}">${t}</span></div>`).join("")}
<div class="foot">${av("PN", 28)}<div><div style="font-weight:500">Priya Nair</div><div class="muted" style="font-size:12px">@priya.wanders</div></div></div></aside>`;
const mWeb = (p, active, inner) => `<div class="shell">${mSide(p, active)}<main class="main">${inner}</main></div>`;
const mTop = (t) => `<div class="top"><div style="font-weight:600;font-size:15px">${t}</div><div class="search">${ic("search", 15)}Search places, people, tags</div>${icoBtn("chat", 19)}${icoBtn("bell", 19)}</div>`;
const ring = (inner, s, seen) => `<span style="flex:none;width:${s}px;height:${s}px;border-radius:50%;padding:2px;background:${seen ? "var(--border)" : "conic-gradient(var(--primary),var(--accent),var(--primary))"};display:grid"><span style="border-radius:50%;padding:2px;background:var(--surface);display:grid">${inner}</span></span>`;
const PEOPLE = [["Lin Park", "LP", "@linpark.frames"], ["Teodora Ruiz", "TR", "@teo.outdoors"], ["Sam Achebe", "SA", "@samachebe"], ["Jonah Weiss", "JW", "@jonah.w"], ["Wren Halloway", "WH", "@wrenhalloway"], ["Priya Nair", "PN", "@priya.wanders"]];
const progBars = (n, on, f) => `<div style="display:flex;gap:4px">${Array.from({ length: n }, (_, i) => `<span style="flex:1;height:3px;border-radius:2px;background:${mix("var(--on-ink)", 35, "transparent")};overflow:hidden"><span style="display:block;height:100%;width:${i < on ? 100 : i === on ? f * 100 : 0}%;background:var(--on-ink)"></span></span>`).join("")}</div>`;
const storyCard = (w, h, mob) => `<div style="width:${w};height:${h};position:relative;${mob ? "" : "border-radius:var(--radius-lg);box-shadow:var(--shadow-lg);"}overflow:hidden;flex:none">${photo(0)}
<div style="position:absolute;inset:0;background:linear-gradient(180deg,${mix("var(--ink)", 55, "transparent")} 0,transparent 22%,transparent 62%,${mix("var(--ink)", 70, "transparent")} 100%)"></div>
<div style="position:absolute;left:12px;right:12px;top:${mob ? 50 : 12}px;color:var(--on-ink);display:grid;gap:10px">${progBars(5, 2, 0.6)}
<div style="display:flex;gap:10px;align-items:center">${av("LP", 34, 0)}<div style="flex:1;line-height:1.25"><b style="font-size:13.5px">linpark.frames</b> <span style="font-size:12px;opacity:.8">2 h</span><div style="font-size:11.5px;opacity:.85;display:flex;gap:4px;align-items:center">${ic("pin", 11)}Kestrel Ridge</div></div><span style="display:flex;gap:14px">${fillPause(18)}${ic("more", 20)}${mob ? ic("x", 22) : ""}</span></div></div>
<div style="position:absolute;left:50%;top:44%;transform:translate(-50%,-50%) rotate(-3deg);padding:8px 14px;border-radius:var(--radius);background:var(--surface);color:var(--text);font:600 15px var(--font-b);box-shadow:var(--shadow);white-space:nowrap">5:52 am, worth it</div>
<div style="position:absolute;left:12px;right:12px;bottom:${mob ? 30 : 14}px;color:var(--on-ink);display:grid;gap:10px">
<div style="display:flex;gap:8px">${["Wow", "Where is this?", "Saving this"].map((t) => `<span style="height:28px;padding:0 11px;border-radius:999px;display:inline-flex;align-items:center;font-size:12px;font-weight:600;background:${mix("var(--on-ink)", 18, "transparent")};border:1px solid ${mix("var(--on-ink)", 40, "transparent")}">${t}</span>`).join("")}</div>
<div style="display:flex;gap:12px;align-items:center"><div style="flex:1;height:42px;border-radius:999px;border:1px solid ${mix("var(--on-ink)", 55, "transparent")};display:flex;align-items:center;padding:0 16px;font-size:13px;opacity:.9">Reply to linpark.frames…</div>${fillHeart(24)}${ic("send", 23)}</div></div></div>`;
const STOOLS = [["gm_text", "Text"], ["gm_sticker", "Stickers"], ["gm_draw", "Draw"], ["pin", "Location"], ["users", "Mention"], ["gm_radio", "Music"]];
const storyWeb = (p, st) => {
  if (p.variant === "create") return mWeb(p, "Stories", `${mTop("Create story")}
<div style="display:grid;grid-template-columns:320px minmax(0,1fr) 320px;gap:24px;padding:20px 24px;flex:1;min-height:0">
<div class="card" style="padding:16px;display:flex;flex-direction:column;gap:12px;min-height:0;overflow:hidden">
<div style="display:flex;gap:6px">${chip(ic("gm_cam", 14) + "Camera")}${chip(ic("image", 14) + "Gallery", true)}</div>
<div style="display:flex;justify-content:space-between;font-size:12.5px"><b>Recents</b><span class="muted">Select multiple</span></div>
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px">${[0, 1, 5, 2, 3, 4, 1, 0, 5, 2, 4, 3, 5, 1, 2].map((k, i) => `<div style="aspect-ratio:3/4;border-radius:var(--radius-sm);overflow:hidden;position:relative;${i === 0 ? "outline:3px solid var(--primary);outline-offset:-3px" : ""}">${photo(k)}${i === 0 ? `<span style="position:absolute;top:5px;right:5px;width:20px;height:20px;border-radius:50%;background:var(--primary);color:var(--on-primary);display:grid;place-items:center;font:700 11px var(--font-b)">1</span>` : ""}</div>`).join("")}</div>
<div class="muted" style="font-size:12px;margin-top:auto">Photos from Kestrel Ridge · 46 items</div></div>
<div style="display:flex;gap:18px;justify-content:center;align-items:center;min-height:0">
<div style="height:100%;max-height:690px;aspect-ratio:9/16;position:relative;border-radius:var(--radius-lg);overflow:hidden;box-shadow:var(--shadow-lg)">${photo(0)}
<div class="h" style="position:absolute;left:24px;right:24px;top:22%;text-align:center;color:var(--on-ink);font-size:${HC(st, 30)}px;line-height:1.15;text-shadow:0 1px 8px ${mix("var(--ink)", 60, "transparent")};outline:1.5px dashed var(--on-ink);outline-offset:8px">Sunrise from the ridge</div>
<div style="position:absolute;left:50%;top:52%;transform:translateX(-50%) rotate(4deg);display:flex;gap:6px;align-items:center;padding:7px 12px;border-radius:var(--radius);background:var(--surface);color:var(--primary);font:700 13px var(--font-b);box-shadow:var(--shadow)">${ic("pin", 14)}KESTREL RIDGE</div>
<div style="position:absolute;right:20px;bottom:24px;padding:8px 12px;border-radius:var(--radius);background:var(--surface);color:var(--text);font-size:12px;box-shadow:var(--shadow);display:grid;gap:4px;width:170px"><b>Which trail next?</b><span style="height:24px;border-radius:var(--radius-sm);background:${tint(14)};display:flex;align-items:center;padding:0 8px">Vallorn Pass</span><span style="height:24px;border-radius:var(--radius-sm);background:${tint(14)};display:flex;align-items:center;padding:0 8px">Saltmarsh Point</span></div></div>
<div style="display:grid;gap:10px">${STOOLS.map(([i, l], n) => `<div style="display:grid;justify-items:center;gap:3px;font-size:10.5px;font-weight:500" class="muted"><span style="width:42px;height:42px;border-radius:50%;display:grid;place-items:center;${n === 0 ? "background:var(--primary);color:var(--on-primary)" : "border:1px solid var(--border);background:var(--surface);color:var(--text)"}">${ic(i, 19)}</span>${l}</div>`).join("")}</div></div>
<div class="card" style="padding:16px;display:flex;flex-direction:column;gap:12px">
<b style="font-size:15px">Who can see this story?</b>
${[["globe", "Everyone", "Anyone on Fieldnote", 0], ["users", "Followers", "1,284 people", 1], ["star", "Close friends", "18 people", 0]].map(([i, t, d, on]) => `<div style="display:flex;gap:12px;align-items:center;padding:10px 12px;border-radius:var(--radius);border:1px solid ${on ? "var(--primary)" : "var(--border)"};${on ? `background:${tint(8)}` : ""}">${icoBtn(i, 18, "color:var(--text)")}<div style="flex:1"><b style="font-size:13.5px">${t}</b><div class="muted" style="font-size:12px">${d}</div></div><span style="width:18px;height:18px;border-radius:50%;border:${on ? "5px solid var(--primary)" : "1.5px solid var(--border)"}"></span></div>`).join("")}
<div style="border-top:1px solid var(--border);padding-top:12px;display:grid;gap:12px">${[["Allow replies", 1], ["Allow sharing to messages", 1], ["Save to Kestrel Ridge trip", 1], ["Hide from Jonah Weiss", 0]].map(([t, on]) => `<div style="display:flex;justify-content:space-between;align-items:center;font-size:13px">${t}${toggle(on)}</div>`).join("")}</div>
<div class="field" style="border-top:1px solid var(--border);padding-top:12px"><label>Add to highlight</label><div class="input filled">${ic("bookmark", 15)}<span style="margin-left:8px">Kestrel Ridge 2026</span><span style="margin-left:auto;display:flex">${ic("chevdown", 14)}</span></div><span class="muted" style="font-size:12px">Stories disappear after 24 hours unless added to a highlight.</span></div>
<div style="margin-top:auto;display:grid;gap:8px"><span class="btn primary block">${ic("send", 15)}Share to story</span><span class="btn block">Save draft</span></div></div></div>`);
  return `<div style="height:100%;background:var(--ink);color:var(--on-ink);position:relative;display:flex;align-items:center;justify-content:center;gap:26px;overflow:hidden">
<div style="position:absolute;top:22px;left:28px;font:600 17px var(--font-b);display:flex;gap:8px;align-items:center"><b style="width:22px;height:22px;border-radius:var(--radius-sm);background:var(--primary);display:inline-block"></b>${esc(p.name)}</div>
<div style="position:absolute;top:22px;right:28px;display:flex">${ic("x", 26)}</div>
${[[3, "TR", "teo.outdoors", "5 h"], [2, "SA", "samachebe", "7 h"]].map(([k, a, n, t]) => `<div style="width:166px;height:296px;border-radius:var(--radius);overflow:hidden;position:relative;opacity:.55;flex:none">${photo(k)}<div style="position:absolute;inset:0;display:grid;place-items:center;align-content:center;gap:6px;text-align:center;background:${mix("var(--ink)", 40, "transparent")}">${ring(av(a, 46, 1), 54)}<b style="font-size:13px">${n}</b><span style="font-size:11.5px;opacity:.8">${t}</span></div></div>`).join("")}
<span style="width:36px;height:36px;border-radius:50%;background:${mix("var(--on-ink)", 85, "transparent")};color:var(--ink);display:grid;place-items:center;flex:none">${ic("back", 18)}</span>
${storyCard("452px", "804px")}
<span style="width:36px;height:36px;border-radius:50%;background:${mix("var(--on-ink)", 85, "transparent")};color:var(--ink);display:grid;place-items:center;flex:none">${ic("chevron", 18)}</span>
${[[5, "JW", "jonah.w", "9 h"], [4, "WH", "wrenhalloway", "11 h"]].map(([k, a, n, t]) => `<div style="width:166px;height:296px;border-radius:var(--radius);overflow:hidden;position:relative;opacity:.55;flex:none">${photo(k)}<div style="position:absolute;inset:0;display:grid;place-items:center;align-content:center;gap:6px;text-align:center;background:${mix("var(--ink)", 40, "transparent")}">${ring(av(a, 46, 0), 54)}<b style="font-size:13px">${n}</b><span style="font-size:11.5px;opacity:.8">${t}</span></div></div>`).join("")}
</div>`;
};
const storyMobile = (p, st) => {
  if (p.variant === "create") return `<div class="phone" style="background:var(--ink);color:var(--on-ink);position:relative">
<div style="position:absolute;inset:0">${photo(0)}</div><div style="position:absolute;inset:0;background:linear-gradient(180deg,${mix("var(--ink)", 50, "transparent")} 0,transparent 20%,transparent 66%,var(--ink) 92%)"></div>
<div style="position:relative;display:flex;flex-direction:column;height:100%">${status()}
<div style="display:flex;justify-content:space-between;align-items:center;padding:4px 18px">${ic("x", 26)}<span style="display:flex;gap:18px">${ic("gm_torch", 22)}${ic("gear", 22)}</span></div>
<div style="position:absolute;right:14px;top:110px;display:grid;gap:14px">${STOOLS.slice(0, 5).map(([i], n) => `<span style="width:40px;height:40px;border-radius:50%;display:grid;place-items:center;${n === 0 ? "background:var(--on-ink);color:var(--ink)" : `background:${mix("var(--ink)", 45, "transparent")}`}">${ic(i, 19)}</span>`).join("")}</div>
<div class="h" style="margin:120px 70px 0 30px;text-align:center;font-size:${HC(st, 28)}px;line-height:1.15;text-shadow:0 1px 8px ${mix("var(--ink)", 60, "transparent")}">Sunrise from the ridge</div>
<div style="align-self:center;margin-top:18px;transform:rotate(4deg);display:flex;gap:6px;align-items:center;padding:7px 12px;border-radius:var(--radius);background:var(--surface);color:var(--primary);font:700 13px var(--font-b);box-shadow:var(--shadow)">${ic("pin", 14)}KESTREL RIDGE</div>
<div style="margin-top:auto;padding:0 16px 10px;display:grid;gap:12px">
<div style="display:flex;gap:8px;justify-content:center">${["Text", "Stickers", "Draw", "Music"].map((t, i) => `<span style="height:28px;padding:0 12px;border-radius:999px;display:inline-flex;align-items:center;font-size:12px;font-weight:600;${i === 1 ? "background:var(--on-ink);color:var(--ink)" : `background:${mix("var(--ink)", 45, "transparent")}`}">${t}</span>`).join("")}</div>
<div style="display:flex;gap:6px;overflow:hidden">${[["gm_cam", ""], ...[1, 5, 2, 3, 4, 1]].map((k, i) => i === 0 ? `<span style="width:46px;height:58px;flex:none;border-radius:var(--radius-sm);display:grid;place-items:center;background:${mix("var(--on-ink)", 18, "transparent")}">${ic("gm_cam", 20)}</span>` : `<div style="width:46px;height:58px;flex:none;border-radius:var(--radius-sm);overflow:hidden">${photo(k)}</div>`).join("")}</div>
<div style="display:flex;gap:10px;align-items:center"><span style="flex:1;height:44px;border-radius:999px;display:flex;align-items:center;gap:10px;padding:0 6px 0 6px;background:${mix("var(--on-ink)", 16, "transparent")}">${av("PN", 32)}<b style="font-size:13px">Your story</b></span><span style="height:44px;padding:0 14px;border-radius:999px;display:flex;align-items:center;gap:6px;font-size:13px;font-weight:600;background:${mix("var(--on-ink)", 16, "transparent")}">${ic("star", 16)}Close friends</span><span style="width:44px;height:44px;border-radius:50%;background:var(--primary);color:var(--on-primary);display:grid;place-items:center">${ic("send", 19)}</span></div></div></div></div>`;
  return `<div class="phone" style="background:var(--ink);position:relative">${storyCard("100%", "100%", true)}<div style="position:absolute;top:0;left:0;right:0;color:var(--on-ink)">${status()}</div></div>`;
};

// photo-post
const COMMENTS = [["Teodora Ruiz", "TR", "That light on the second ridge. What time did you start the climb?", "1 h", 24, [["Lin Park", "LP", "Left the hut at 4:40. Headtorch the whole way up, totally worth it.", "48 min", 9], ["Teodora Ruiz", "TR", "Adding it to the list for spring.", "30 min", 2]]], ["Sam Achebe", "SA", "Was the trail still muddy after the rain on Thursday?", "52 min", 6, [["Lin Park", "LP", "Only the first kilometre past the car park. Boots, not trainers.", "40 min", 4]]], ["Wren Halloway", "WH", "Framing with the cairn in the foreground is so good.", "25 min", 11, []], ["Jonah Weiss", "JW", "Saved for our trip in March.", "12 min", 3, []]];
const actions = (s = 24) => `<div style="display:flex;gap:16px;align-items:center"><span style="color:var(--danger);display:flex">${fillHeart(s)}</span>${ic("chat", s)}${ic("send", s)}<span style="margin-left:auto;display:flex;color:var(--primary)">${ic("bookmark", s)}</span></div>`;
const caption = `Left the hut at 4:40 to catch first light on Kestrel Ridge. Three layers, one flask, zero regrets. <span style="color:var(--primary);font-weight:500">#kestrelridge #goldenhour #hikingdiaries</span>`;
const cmt = ([n, a, t, ago, likes], reply, sz = 13) => `<div style="display:flex;gap:10px;align-items:flex-start;${reply ? "margin-left:42px" : ""}">${av(a, reply ? 26 : 32, a.charCodeAt(0))}<div style="flex:1;min-width:0;font-size:${sz}px;line-height:1.4"><b>${n}</b> ${t}<div class="muted" style="font-size:11.5px;margin-top:3px;display:flex;gap:12px"><span>${ago}</span><span>${likes} likes</span><b>Reply</b></div></div><span style="display:flex;color:var(--muted);margin-top:4px">${ic("heart", 14)}</span></div>`;
const author = (s = 36, follow = true) => `<div style="display:flex;gap:10px;align-items:center">${ring(av("LP", s - 8, 0), s)}<div style="flex:1;line-height:1.25"><b style="font-size:13.5px">Lin Park</b><div class="muted" style="font-size:12px;display:flex;gap:4px;align-items:center">${ic("pin", 11)}Kestrel Ridge · Day 2 of 4</div></div>${follow ? `<span class="btn primary" style="height:30px">Follow</span>` : ""}${icoBtn("more", 20)}</div>`;
const postWeb = (p, st) => {
  if (p.variant === "comments") return mWeb(p, "Feed", `${mTop("Comments")}
<div style="display:grid;grid-template-columns:560px minmax(0,1fr);gap:0;margin:20px 24px;flex:1;min-height:0" class="card">
<div style="position:relative;overflow:hidden;border-radius:var(--radius-lg) 0 0 var(--radius-lg)">${photo(0)}<span style="position:absolute;bottom:14px;left:50%;transform:translateX(-50%);display:flex;gap:5px">${[1, 0, 0, 0].map((o) => `<span style="width:6px;height:6px;border-radius:50%;background:var(--on-ink);opacity:${o ? 1 : 0.5}"></span>`).join("")}</span></div>
<div style="display:flex;flex-direction:column;min-height:0;border-left:1px solid var(--border)">
<div style="padding:14px 18px;border-bottom:1px solid var(--border)">${author(40, false)}<div style="font-size:13px;margin-top:10px;line-height:1.45">${caption}</div></div>
<div style="display:flex;gap:10px;padding:10px 18px;border-bottom:1px solid var(--border);align-items:center"><b style="font-size:13.5px">48 comments</b><span style="margin-left:auto;display:flex;gap:6px">${chip("Top", true, 26)}${chip("Newest", false, 26)}</span></div>
<div style="flex:1;overflow:hidden;padding:14px 18px;display:grid;gap:14px;align-content:start">${COMMENTS.map(([n, a, t, ago, l, reps]) => cmt([n, a, t, ago, l]) + reps.map((r) => cmt(r, true)).join("") + (reps.length > 1 ? `<div class="muted" style="margin-left:42px;font-size:12px;font-weight:600">— View 3 more replies</div>` : "")).join("")}</div>
<div style="padding:12px 18px;border-top:1px solid var(--border);display:grid;gap:10px">${actions(22)}<div style="font-size:13px"><b>1,286 likes</b> <span class="muted">· 2 hours ago</span></div>
<div style="display:flex;gap:10px;align-items:center">${av("PN", 30)}<div class="input" style="flex:1;border-radius:999px">${icoBtn("gm_smile", 17)}<span style="margin-left:8px">Add a comment for Lin…</span></div><span style="font-weight:600;color:var(--primary);font-size:13.5px">Post</span></div></div></div></div>`);
  return mWeb(p, "Feed", `${mTop("Post")}
<div style="display:grid;grid-template-columns:500px minmax(0,1fr) 220px;gap:20px;padding:20px 24px;flex:1;min-height:0">
<div style="position:relative;border-radius:var(--radius-lg);overflow:hidden;box-shadow:var(--shadow)">${photo(0)}<span style="position:absolute;top:12px;right:12px;padding:3px 9px;border-radius:999px;background:${mix("var(--ink)", 60, "transparent")};color:var(--on-ink);font:600 11.5px var(--font-b)">1/4</span><span style="position:absolute;left:12px;bottom:12px;display:flex;gap:6px;align-items:center;padding:4px 10px;border-radius:999px;background:${mix("var(--ink)", 60, "transparent")};color:var(--on-ink);font:500 12px var(--font-b)">${ic("users", 13)}2 people tagged</span></div>
<div class="card" style="padding:18px;display:flex;flex-direction:column;gap:12px;min-height:0;overflow:hidden">${author(40)}
<div style="font-size:13.5px;line-height:1.5">${caption}</div>
<div style="display:flex;gap:6px;flex-wrap:wrap">${sbadge("Kestrel Ridge, Day 2", "accent")}${sbadge("f/8 · 1/250 s · ISO 100", "primary")}</div>
${actions(24)}
<div style="font-size:13px;display:flex;gap:8px;align-items:center"><span style="display:flex">${["TR", "SA", "WH"].map((a, i) => `<span style="margin-left:${i ? -8 : 0}px;border:2px solid var(--surface);border-radius:50%;display:flex">${av(a, 22, i)}</span>`).join("")}</span><span>Liked by <b>teo.outdoors</b> and <b>1,285 others</b></span></div>
<div style="display:flex;gap:10px;align-items:center;padding:10px;border-radius:var(--radius);background:${tint(6, "text")}">${pic(5, "40px", "40px", "var(--radius-sm)")}<div style="flex:1;line-height:1.3"><b style="font-size:13px">Part of: Kestrel Ridge, 4 days</b><div class="muted" style="font-size:12px">23 photos · 41 km · Oct 2026</div></div><span style="font-size:12.5px;font-weight:600;color:var(--primary)">View trip</span></div>
<div style="border-top:1px solid var(--border);padding-top:12px;display:grid;gap:12px">${COMMENTS.map(([n, a, t, ago, l]) => cmt([n, a, t, ago, l])).join("")}<span class="muted" style="font-size:12.5px;font-weight:600">View all 48 comments</span></div>
<div style="margin-top:auto;display:flex;gap:10px;align-items:center;border-top:1px solid var(--border);padding-top:12px">${av("PN", 30)}<div class="input" style="flex:1;border-radius:999px">Add a comment…</div><span style="font-weight:600;color:var(--primary);font-size:13.5px">Post</span></div></div>
<div style="display:flex;flex-direction:column;gap:10px;min-height:0;overflow:hidden">${sec("More from Lin")}
<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">${[2, 5, 1, 4, 3, 0, 5, 2].map((k) => `<div style="aspect-ratio:1;border-radius:var(--radius-sm);overflow:hidden">${photo(k)}</div>`).join("")}</div>
${sec("Related on Fieldnote")}<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">${[1, 4, 5, 3].map((k) => `<div style="aspect-ratio:1;border-radius:var(--radius-sm);overflow:hidden">${photo(k)}</div>`).join("")}</div></div></div>`);
};
const postMobile = (p, st) => {
  if (p.variant === "comments") return `<div class="phone">${status()}
<div class="mtop">${icoBtn("back", 22, "color:var(--text)")}<b style="font-size:15px">Comments</b>${icoBtn("send", 21, "color:var(--text)")}</div>
<div style="display:flex;gap:12px;padding:0 20px 12px;border-bottom:1px solid var(--border);flex:none">${pic(0, "54px", "54px", "var(--radius-sm)")}<div style="font-size:12.5px;line-height:1.4;min-width:0"><b>linpark.frames</b> Left the hut at 4:40 to catch first light on Kestrel Ridge. <span style="color:var(--primary)">#kestrelridge</span><div class="muted" style="font-size:11.5px;margin-top:2px">2 h · 1,286 likes · 48 comments</div></div></div>
<div class="mbody" style="gap:14px;padding-top:14px">${COMMENTS.map(([n, a, t, ago, l, reps], i) => cmt([n, a, t, ago, l], false, 13) + reps.slice(0, 2).map((r) => cmt(r, true, 13)).join("") + (i === 0 ? `<div class="muted" style="margin-left:42px;font-size:12px;font-weight:600;margin-top:-4px">— View 3 more replies</div>` : "")).join("")}</div>
<div style="flex:none;border-top:1px solid var(--border);padding:10px 16px 30px;display:grid;gap:10px;background:var(--surface)">
<div style="display:flex;gap:6px;overflow:hidden">${["Stunning", "Which trail?", "Saving this", "Gear list?"].map((t) => chip(t, false, 28)).join("")}</div>
<div style="display:flex;gap:10px;align-items:center">${av("PN", 32)}<div class="input" style="flex:1;border-radius:999px">Reply to Teodora Ruiz…</div><span style="font-weight:600;color:var(--primary);font-size:14px">Post</span></div></div></div>`;
  return `<div class="phone">${status()}
<div class="mtop">${icoBtn("back", 22, "color:var(--text)")}<b style="font-size:15px">Post</b>${icoBtn("more", 22, "color:var(--text)")}</div>
<div style="padding:0 16px 10px;flex:none">${author(38)}</div>
<div style="position:relative;flex:none">${pic(0, "100%", "276px", "0")}<span style="position:absolute;top:10px;right:10px;padding:3px 9px;border-radius:999px;background:${mix("var(--ink)", 60, "transparent")};color:var(--on-ink);font:600 11px var(--font-b)">1/4</span></div>
<div class="mbody" style="gap:8px;padding-top:10px">${actions(24)}
<div style="font-size:13px"><b>1,286 likes</b></div>
<div style="font-size:13px;line-height:1.45;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden"><b>linpark.frames</b> ${caption}</div>
<span class="muted" style="font-size:12.5px">View all 48 comments</span>
<div style="font-size:13px;line-height:1.4"><b>teo.outdoors</b> That light on the second ridge. What time did you start?</div>
<div style="display:flex;justify-content:space-between;align-items:baseline;margin-top:4px"><b style="font-size:14px">More from Lin</b><span class="muted" style="font-size:12px">See all</span></div>
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px">${[2, 5, 1].map((k) => `<div style="aspect-ratio:1;border-radius:var(--radius-sm);overflow:hidden">${photo(k)}</div>`).join("")}</div>
</div>${tabBar("Feed", MTABS)}</div>`;
};

// post-composer
const FILTERS = [["Original", ""], ["Coast", "saturate(1.25) hue-rotate(-8deg)"], ["Dune", "sepia(.35) saturate(1.2)"], ["Fog", "contrast(.85) brightness(1.08) saturate(.7)"], ["Ember", "saturate(1.5) hue-rotate(-18deg)"], ["Slate", "grayscale(.6) contrast(1.1)"], ["Bloom", "brightness(1.1) saturate(1.3)"], ["Noir", "grayscale(1) contrast(1.2)"]];
const cropGrid = `<div style="position:absolute;inset:0;border:2px solid var(--on-ink);background:linear-gradient(90deg,transparent 33.2%,${mix("var(--on-ink)", 60, "transparent")} 33.2% 33.5%,transparent 33.5% 66.5%,${mix("var(--on-ink)", 60, "transparent")} 66.5% 66.8%,transparent 66.8%),linear-gradient(180deg,transparent 33.2%,${mix("var(--on-ink)", 60, "transparent")} 33.2% 33.5%,transparent 33.5% 66.5%,${mix("var(--on-ink)", 60, "transparent")} 66.5% 66.8%,transparent 66.8%)"></div>${[["top:-3px;left:-3px", "border-width:4px 0 0 4px"], ["top:-3px;right:-3px", "border-width:4px 4px 0 0"], ["bottom:-3px;left:-3px", "border-width:0 0 4px 4px"], ["bottom:-3px;right:-3px", "border-width:0 4px 4px 0"]].map(([pos, bw]) => `<span style="position:absolute;${pos};width:22px;height:22px;border:0 solid var(--on-ink);${bw}"></span>`).join("")}`;
const filterStrip = (n, s) => FILTERS.slice(0, n).map(([t, f], i) => `<div style="display:grid;gap:5px;justify-items:center;flex:none;font-size:11.5px;font-weight:${i === 2 ? 700 : 500};${i === 2 ? "color:var(--primary)" : ""}"><span>${t}</span><div style="width:${s}px;height:${s}px;border-radius:var(--radius-sm);overflow:hidden;${i === 2 ? "outline:2.5px solid var(--primary);outline-offset:2px" : ""}">${photo(0, f)}</div></div>`).join("");
const hl = (t) => `<span style="color:var(--primary);font-weight:500">${t}</span>`;
const capText = `Sunrise from ${hl("@kestrel.hut")} after a 4:40 start with ${hl("@teo.outdoors")}. Three layers, one flask, zero regrets. ${hl("#kestrelridge")} ${hl("#goldenhour")} ${hl("#hikingdiaries")}`;
const composerWeb = (p, st) => {
  const top = (step) => `<div class="top">${icoBtn("back", 18, "color:var(--text)")}<div style="font-weight:600;font-size:15px">Create photo post</div><div style="display:flex;gap:6px;margin:0 auto">${["Select", "Edit", "Details"].map((t, i) => `<span style="display:flex;gap:6px;align-items:center;font-size:12.5px;font-weight:600;${i === step ? "" : "color:var(--muted)"}"><span style="width:20px;height:20px;border-radius:50%;display:grid;place-items:center;font-size:11px;${i <= step ? "background:var(--primary);color:var(--on-primary)" : "border:1px solid var(--border)"}">${i < step ? ic("check", 12) : i + 1}</span>${t}${i < 2 ? `<span style="width:28px;height:1px;background:var(--border);margin-left:4px"></span>` : ""}</span>`).join("")}</div><span class="btn">Save draft</span><span class="btn primary">${step === 2 ? "Share" : "Next"}</span></div>`;
  if (p.variant === "details") return mWeb(p, "Feed", `${top(2)}
<div style="display:grid;grid-template-columns:480px minmax(0,1fr);gap:28px;padding:20px 28px;flex:1;min-height:0">
<div style="display:flex;flex-direction:column;gap:12px"><div style="position:relative;aspect-ratio:4/5;border-radius:var(--radius-lg);overflow:hidden;box-shadow:var(--shadow)">${photo(0, FILTERS[2][1])}<span style="position:absolute;top:12px;right:12px;padding:3px 9px;border-radius:999px;background:${mix("var(--ink)", 60, "transparent")};color:var(--on-ink);font:600 11.5px var(--font-b)">1/4</span>${[["38%", "62%", "teo.outdoors"], ["64%", "30%", "kestrel.hut"]].map(([l, t, n]) => `<span style="position:absolute;left:${l};top:${t};padding:4px 9px;border-radius:var(--radius-sm);background:${mix("var(--ink)", 75, "transparent")};color:var(--on-ink);font:600 11.5px var(--font-b)">${n}</span>`).join("")}</div>
<div style="display:flex;gap:8px">${[0, 2, 5, 1].map((k, i) => `<div style="width:56px;height:56px;border-radius:var(--radius-sm);overflow:hidden;${i === 0 ? "outline:2.5px solid var(--primary);outline-offset:2px" : ""}">${photo(k, i ? "" : FILTERS[2][1])}</div>`).join("")}<span class="muted" style="font-size:12px;align-self:center;margin-left:6px">Tap a photo to tag people</span></div></div>
<div style="display:flex;flex-direction:column;gap:18px;min-width:0">
<div style="display:flex;gap:10px;align-items:center">${av("PN", 32)}<b style="font-size:14px">priya.wanders</b></div>
<div class="field"><label>Caption</label><div class="card" style="padding:12px 14px;font-size:14px;line-height:1.55;min-height:150px;box-shadow:none">${capText}<span style="display:inline-block;width:1.5px;height:16px;background:var(--primary);vertical-align:-3px;margin-left:2px"></span></div>
<div style="display:flex;justify-content:space-between;font-size:12px" class="muted"><span style="display:flex;gap:12px">${ic("gm_at", 15)}${ic("gm_hash", 15)}${ic("gm_smile", 15)}</span><span class="num" style="font-size:12px;font-weight:500">186 / 2,200</span></div></div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
<div class="field"><label>Location</label><div class="input filled">${icoBtn("pin", 15)}<span style="margin-left:8px">Kestrel Ridge</span><span style="margin-left:auto;display:flex;color:var(--muted)">${ic("x", 14)}</span></div><div style="display:flex;gap:6px">${["Kestrel Hut", "Vallorn Pass", "Pellow Bay"].map((t) => chip(t, false, 26)).join("")}</div></div>
<div class="field"><label>Tag people</label><div class="input filled" style="gap:6px">${["teo.outdoors", "kestrel.hut"].map((t) => `<span style="height:24px;padding:0 8px;border-radius:999px;background:${tint(14)};display:inline-flex;align-items:center;gap:4px;font-size:12px;font-weight:600">@${t}${ic("x", 11)}</span>`).join("")}<span class="muted" style="font-size:13px">Add…</span></div><span class="muted" style="font-size:12px">2 people tagged on photo 1</span></div></div>
<div class="field"><label>Audience</label><div style="display:flex;gap:8px">${[["globe", "Public"], ["users", "Followers"], ["star", "Close friends"]].map(([i, t], n) => `<span class="btn" style="flex:1;${n === 0 ? `border-color:var(--primary);background:${tint(10)};color:var(--text)` : ""}">${ic(i, 15)}${t}</span>`).join("")}</div></div>
<div class="field"><label style="display:flex;gap:6px;align-items:center">${ic("gm_alt", 15)}Alt text <span class="muted" style="font-weight:400">· describes the photo for screen readers</span></label><div class="input filled" style="font-size:13px">A hiker stands by a stone cairn above layered blue ridges at sunrise.</div></div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px 24px">${[["Add to trip: Kestrel Ridge, 4 days", 1], ["Hide like count", 0], ["Turn off comments", 0], ["Also share to story", 1], ["Show camera settings (f/8 · 1/250 s)", 1], ["Allow downloads", 0]].map(([t, on]) => `<div style="display:flex;justify-content:space-between;align-items:center;font-size:13px">${t}${toggle(on)}</div>`).join("")}</div>
<div style="display:flex;gap:10px;margin-top:auto"><span class="btn" style="flex:1;height:42px">Schedule for later</span><span class="btn primary" style="flex:2;height:42px">${ic("send", 15)}Share post</span></div></div></div>`);
  return mWeb(p, "Feed", `${top(1)}
<div style="display:grid;grid-template-columns:120px minmax(0,1fr) 320px;gap:24px;padding:20px 24px;flex:1;min-height:0">
<div style="display:flex;flex-direction:column;gap:10px"><b style="font-size:12.5px">Photos (4)</b>${[0, 2, 5, 1].map((k, i) => `<div style="position:relative;display:flex;gap:6px;align-items:center"><span class="muted" style="display:flex">${ic("gm_drag", 14)}</span><div style="width:84px;height:84px;border-radius:var(--radius-sm);overflow:hidden;position:relative;${i === 0 ? "outline:2.5px solid var(--primary);outline-offset:2px" : ""}">${photo(k, i ? "" : FILTERS[2][1])}<span style="position:absolute;top:4px;left:4px;width:18px;height:18px;border-radius:50%;background:${mix("var(--ink)", 65, "transparent")};color:var(--on-ink);display:grid;place-items:center;font:700 10px var(--font-b)">${i + 1}</span></div></div>`).join("")}<span style="width:84px;height:60px;margin-left:20px;border-radius:var(--radius-sm);border:1.5px dashed var(--border);display:grid;place-items:center;color:var(--muted)">${ic("plus", 18)}</span><span class="muted" style="font-size:11.5px">Drag to reorder the carousel</span></div>
<div style="display:flex;flex-direction:column;gap:14px;align-items:center;min-width:0">
<div style="display:flex;gap:6px">${["Original", "1:1", "4:5", "16:9"].map((t, i) => chip(t, i === 2, 28)).join("")}<span style="margin-left:10px;display:flex;gap:6px">${["gm_crop", "refresh", "gm_flip"].map((i) => `<span class="btn" style="width:30px;height:28px;padding:0">${ic(i, 15)}</span>`).join("")}</span></div>
<div style="position:relative;height:520px;aspect-ratio:4/5;border-radius:var(--radius-sm)">${photo(0, FILTERS[2][1])}${cropGrid}</div>
<div style="display:flex;gap:12px;justify-content:center">${filterStrip(8, 66)}</div></div>
<div class="card" style="padding:16px;display:flex;flex-direction:column;gap:14px">
<div style="display:grid;gap:6px"><div style="display:flex;justify-content:space-between;font-size:12px" class="muted"><span>Histogram</span><span>Hold photo to compare</span></div><div style="height:64px;display:flex;align-items:flex-end;gap:2px;padding:6px;border-radius:var(--radius-sm);background:${tint(6, "text")}">${Array.from({ length: 48 }, (_, i) => `<span style="flex:1;height:${Math.round(18 + 70 * Math.abs(Math.sin(i / 7.5)) * (0.6 + 0.4 * Math.abs(Math.cos(i / 3.1))))}%;background:${mix("var(--primary)", 55, "var(--surface)")};border-radius:1px"></span>`).join("")}</div></div>
<div style="display:flex;gap:16px;border-bottom:1px solid var(--border)">${["Filters", "Adjust"].map((t, i) => `<span style="padding:0 0 10px;font-weight:600;font-size:13.5px;${i ? "border-bottom:2px solid var(--primary)" : "color:var(--muted)"}">${t}</span>`).join("")}</div>
<div style="display:flex;justify-content:space-between;align-items:center"><span style="font-size:13px"><b>Dune</b> <span class="muted">filter strength</span></span><span class="num" style="font-size:13px">70</span></div>${slider("", "", 0.7, true)}
<div style="display:grid;gap:16px;border-top:1px solid var(--border);padding-top:14px">${[["Brightness", "+12", 0.56], ["Contrast", "+8", 0.54], ["Warmth", "+20", 0.6], ["Saturation", "−6", 0.47], ["Fade", "0", 0.5], ["Highlights", "−10", 0.45], ["Shadows", "+18", 0.59], ["Vignette", "+15", 0.57], ["Grain", "+4", 0.52], ["Sharpen", "+10", 0.55]].map(([l, v, f]) => slider(l, v, f)).join("")}</div>
<div style="display:flex;justify-content:space-between;align-items:center;font-size:13px">Show original while editing${toggle(false)}</div>
<div style="margin-top:auto;display:flex;gap:8px"><span class="btn" style="flex:1">Reset</span><span class="btn" style="flex:1">Apply to all 4</span></div></div></div>`);
};
const composerMobile = (p, st) => {
  if (p.variant === "details") return `<div class="phone">${status()}
<div class="mtop">${icoBtn("back", 22, "color:var(--text)")}<b style="font-size:15px">New post</b><span style="font-weight:700;color:var(--primary);font-size:14.5px">Share</span></div>
<div class="mbody" style="gap:0;padding:0">
<div style="display:flex;gap:12px;padding:4px 20px 14px;border-bottom:1px solid var(--border)"><div style="position:relative">${pic(0, "76px", "95px", "var(--radius-sm)", FILTERS[2][1])}<span style="position:absolute;top:4px;right:4px;padding:1px 6px;border-radius:999px;background:${mix("var(--ink)", 60, "transparent")};color:var(--on-ink);font:600 10px var(--font-b)">1/4</span></div><div style="font-size:13.5px;line-height:1.5;flex:1">${capText}</div></div>
<div style="display:flex;justify-content:space-between;padding:8px 20px;border-bottom:1px solid var(--border);font-size:12px" class="muted"><span style="display:flex;gap:14px">${ic("gm_at", 16)}${ic("gm_hash", 16)}${ic("gm_smile", 16)}</span><span class="num" style="font-size:12px;font-weight:500">186 / 2,200</span></div>
${[["pin", "Location", "Kestrel Ridge"], ["users", "Tag people", "2 people"], ["globe", "Audience", "Public"], ["gm_alt", "Alt text", "Added"], ["folder", "Add to trip", "Kestrel Ridge, 4 days"]].map(([i, t, v]) => `<div style="display:flex;gap:12px;align-items:center;padding:13px 20px;border-bottom:1px solid var(--border)">${icoBtn(i, 19, "color:var(--text)")}<span style="flex:1;font-size:14px">${t}</span><span class="muted" style="font-size:13px">${v}</span>${icoBtn("chevron", 15)}</div>`).join("")}
<div style="display:flex;gap:6px;padding:10px 20px;overflow:hidden">${["Kestrel Hut", "Vallorn Pass", "Pellow Bay"].map((t) => chip(t, false, 28)).join("")}</div>
<div style="padding:4px 20px;display:grid;gap:12px">${[["Hide like count", 0], ["Turn off comments", 0], ["Also share to story", 1]].map(([t, on]) => `<div style="display:flex;justify-content:space-between;align-items:center;font-size:14px">${t}${toggle(on)}</div>`).join("")}</div>
<div style="margin:12px 20px 0;padding:10px 12px;border-radius:var(--radius);background:${tint(6, "text")};font-size:12.5px"><b style="display:flex;gap:6px;align-items:center">${ic("gm_alt", 14)}Alt text</b><span class="muted">A hiker stands by a stone cairn above layered blue ridges at sunrise.</span></div>
<div style="margin-top:auto;padding:0 20px 28px"><button class="btn primary block" style="height:46px">${ic("send", 16)}Share post</button></div></div></div>`;
  return `<div class="phone">${status()}
<div class="mtop">${icoBtn("back", 22, "color:var(--text)")}<b style="font-size:15px">Edit photo</b><span style="font-weight:700;color:var(--primary);font-size:14.5px">Next</span></div>
<div style="position:relative;height:430px;flex:none;margin:0 20px">${photo(0, FILTERS[2][1])}${cropGrid}<span style="position:absolute;bottom:10px;left:10px;display:flex;gap:6px">${["4:5", "1:1"].map((t, i) => `<span style="height:26px;padding:0 10px;border-radius:999px;display:inline-flex;align-items:center;font:600 11.5px var(--font-b);${i ? `background:${mix("var(--ink)", 55, "transparent")};color:var(--on-ink)` : "background:var(--surface);color:var(--text)"}">${t}</span>`).join("")}</span></div>
<div style="display:flex;gap:8px;padding:12px 20px 0;align-items:center;flex:none">${[0, 2, 5, 1].map((k, i) => `<div style="width:40px;height:40px;border-radius:var(--radius-sm);overflow:hidden;${i === 0 ? "outline:2px solid var(--primary);outline-offset:2px" : "opacity:.8"}">${photo(k, i ? "" : FILTERS[2][1])}</div>`).join("")}<span style="width:40px;height:40px;border-radius:var(--radius-sm);border:1.5px dashed var(--border);display:grid;place-items:center;color:var(--muted)">${ic("plus", 16)}</span><span class="muted" style="font-size:11.5px;margin-left:auto">Hold to reorder</span></div>
<div class="mbody" style="gap:12px;padding:14px 0 0">
<div style="display:flex;gap:12px;overflow:hidden;padding-left:20px">${filterStrip(6, 70)}</div>
<div style="padding:0 20px">${slider("Dune strength", "70", 0.7, true)}</div>
</div>
<nav class="tabs" style="grid-template-columns:repeat(4,1fr)">${[["gm_sparkle", "Filter", 1], ["gm_sliders", "Adjust"], ["gm_crop", "Crop"], ["gm_text", "Text"]].map(([i, l, on]) => `<div class="${on ? "on" : ""}">${ic(i === "gm_sparkle" ? "spark" : i, 22)}${l}</div>`).join("")}</nav></div>`;
};

/* ---------------------------------------------------------------- beauty (Dewline) */
const BNAV = [["home", "Today"], ["gm_drop", "Routine"], ["gm_scan", "Scan"], ["gm_shelf", "My shelf"], ["calendar", "Skin diary"], ["gear", "Settings"]];
const BTABS = [["gm_drop", "Routine"], ["gm_scan", "Scan"], ["gm_shelf", "Shelf"], ["users", "Me"]];
const bSide = (p, active) => `<aside class="side"><div class="logo"><b></b>${esc(p.name)}</div>
${BNAV.map(([i, l]) => `<div class="nav${l === active ? " on" : ""}">${ic(i)}${l}</div>`).join("")}
<div class="card" style="margin:16px 4px 0;padding:12px;display:grid;gap:6px;box-shadow:none;background:${tint(8)}"><b style="font-size:12.5px">Skin profile</b><span class="muted" style="font-size:12px">Combination · sensitive · avoids fragrance</span><span style="font-size:12px;font-weight:600;color:var(--primary)">Edit profile</span></div>
<div class="foot">${av("PN", 28)}<div><div style="font-weight:500">Priya Nair</div><div class="muted" style="font-size:12px">14-day streak</div></div></div></aside>`;
const bWeb = (p, active, inner) => `<div class="shell">${bSide(p, active)}<main class="main">${inner}</main></div>`;
const bTop = (t, right = "") => `<div class="top"><div style="font-weight:600;font-size:15px">${t}</div><div class="search">${ic("search", 15)}Search products, ingredients</div>${right}${icoBtn("bell", 19)}</div>`;
// name, brand, step, prod idx
const PR = [["Gentle Oat Cleanser", "Oatmere", "Cleanse", 0], ["Rice Water Toner", "Pellumi", "Tone", 4], ["Vitamin C 15% Serum", "Halden Lab", "Serum", 2], ["Barrier Moisture Cream", "Quillby Skin", "Moisturise", 3], ["Daily Fluid SPF 50", "Fernhollow", "Sunscreen", 1], ["Night Barrier Gel Cream", "Morrow Botanics", "Moisturise", 5], ["Lactic Resurfacing Toner", "Pellumi", "Exfoliate", 6]];
const SCANS = [["Night Barrier Gel Cream", "Morrow Botanics", "Matched", "Today, 08:12", [["Fragrance-free", "success"], ["Not with vitamin C", "warning"]], 5, "4 820193 557204"], ["Cloud Milk Body Lotion", "Oatmere", "Matched", "Yesterday", [["Contains fragrance", "warning"]], 0, "4 820193 118450"], ["Hydra Mist 100 ml", "Saltbloom", "Partial match", "3 Nov", [["Alcohol denat.", "warning"], ["Check size", "muted"]], 4, "6 104427 902318"], ["Lactic Resurfacing Toner", "Pellumi", "Matched", "1 Nov", [["Exfoliating acid", "accent"], ["PM only", "primary"]], 6, "5 207731 440962"], ["Unknown barcode", "Not in the database yet", "Not found", "30 Oct", [["Add product", "primary"]], 3, "8 800151 237715"], ["Calm Balm Lip Care", "Quillby Skin", "Matched", "28 Oct", [["Fragrance-free", "success"]], 3, "4 403318 006275"], ["Sea Clay Mask", "Saltbloom", "Matched", "26 Oct", [["Essential oils", "warning"]], 5, "6 104427 551093"], ["Overnight Oat Mask", "Oatmere", "Matched", "22 Oct", [["Fragrance-free", "success"]], 0, "4 820193 220117"], ["Brightening Eye Gel", "Fernhollow", "Partial match", "19 Oct", [["Check size", "muted"]], 1, "7 311890 064428"], ["Rosewater Facial Spray", "Saltbloom", "Matched", "15 Oct", [["Contains fragrance", "warning"], ["Essential oils", "warning"]], 6, "6 104427 337481"]];
const resK = { Matched: "success", "Partial match": "warning", "Not found": "danger" };
const viewfinder = (w, h, mob) => `<div style="position:relative;width:${w};height:${h};overflow:hidden;background:var(--ink);${mob ? "" : "border-radius:var(--radius-lg)"}">
<svg viewBox="0 0 200 200" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" style="display:block;filter:blur(${mob ? 1.2 : 1.5}px)" aria-hidden="true"><rect width="200" height="200" fill="#d9cfc2"/><rect y="150" width="200" height="50" fill="#b9ab98"/><rect x="18" y="40" width="34" height="120" rx="6" fill="#efe6da"/><rect x="148" y="56" width="36" height="104" rx="6" fill="#cfe0d4"/><rect x="62" y="22" width="76" height="150" rx="10" fill="#f3e9db"/><rect x="88" y="10" width="24" height="16" rx="3" fill="#7b6243"/><rect x="74" y="58" width="52" height="22" fill="#7b6243" opacity=".25"/></svg>
<div style="position:absolute;inset:0;background:${mix("var(--ink)", 35, "transparent")}"></div>
<div style="position:absolute;left:50%;top:${mob ? "44%" : "46%"};transform:translate(-50%,-50%);width:${mob ? 270 : 360}px;height:${mob ? 150 : 190}px">
<div style="position:absolute;inset:18px 26px;background:#fbfaf7;border-radius:4px;padding:10px 14px 6px;display:flex;flex-direction:column;align-items:center;gap:4px">${barcode(mob ? 190 : 280, mob ? 74 : 106, 11)}<span style="font:600 ${mob ? 11 : 13}px ui-monospace,monospace;color:#1d1d1d;letter-spacing:2px;line-height:1">4 820193 557204</span></div>
${[["top:0;left:0", "4px 0 0 4px"], ["top:0;right:0", "4px 4px 0 0"], ["bottom:0;left:0", "0 0 4px 4px"], ["bottom:0;right:0", "0 4px 4px 0"]].map(([pos, bw]) => `<span style="position:absolute;${pos};width:34px;height:34px;border:0 solid var(--on-ink);border-width:${bw};border-radius:6px"></span>`).join("")}
<span style="position:absolute;left:8px;right:8px;top:54%;height:2px;background:var(--primary);box-shadow:0 0 12px 2px var(--primary)"></span></div>
<div style="position:absolute;left:0;right:0;top:${mob ? "calc(44% + 96px)" : "calc(46% + 118px)"};text-align:center;color:var(--on-ink);font-size:13.5px;font-weight:500">Hold steady — reading barcode…</div></div>`;
const scanResultMini = `<div style="display:flex;gap:12px;align-items:center">${prod(5, 48)}<div style="flex:1;min-width:0"><div style="display:flex;gap:6px;align-items:center">${sbadge("Matched", "success")}<span class="muted" style="font-size:11.5px">just now</span></div><b style="font-size:14px;display:block;margin-top:3px;${ell}">Night Barrier Gel Cream</b><span class="muted" style="font-size:12px">Morrow Botanics · 50 ml</span></div><span class="btn primary" style="height:32px">View result</span></div>`;
const scanWeb = (p, st) => {
  if (p.variant === "history") return bWeb(p, "Scan", `${bTop("Scan history", `<span class="btn primary">${ic("gm_scan", 15)}Scan a product</span>`)}
<div style="display:grid;grid-template-columns:minmax(0,1fr) 360px;gap:20px;padding:20px 24px;flex:1;min-height:0">
<div style="display:flex;flex-direction:column;gap:14px;min-width:0">
<div style="display:flex;align-items:center;gap:12px"><h1 style="font-size:${HC(st, 24)}px">Scanned products</h1><span class="muted" style="font-size:13px">38 scans · 31 matched</span></div>
<div style="display:flex;gap:8px;align-items:center">${chip("All 38", true)}${chip("Matched 31")}${chip("Flagged 9")}${chip("Partial 4")}${chip("Not found 3")}<span class="btn" style="margin-left:auto">${ic("filter", 15)}Ingredient flags</span></div>
<div class="card" style="overflow:hidden">
<div style="display:grid;grid-template-columns:minmax(0,1.4fr) 120px minmax(0,1.3fr) 104px;gap:12px;padding:10px 16px;font-size:11.5px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;border-bottom:1px solid var(--border)" class="muted"><span>Product</span><span>Match result</span><span>Ingredient flags</span><span>Scanned</span></div>
${SCANS.map(([n, b, r, d, flags, k], i) => `<div style="display:grid;grid-template-columns:minmax(0,1.4fr) 120px minmax(0,1.3fr) 104px;gap:12px;align-items:center;padding:0 16px;height:62px;border-bottom:1px solid var(--border);${i === 0 ? `background:${tint(7)}` : ""}"><div style="display:flex;gap:12px;align-items:center;min-width:0">${prod(k, 40)}<div style="${ell}"><b style="font-size:13.5px;${ell};display:block">${n}</b><span class="muted" style="font-size:12px">${b}</span></div></div><span>${sbadge(r, resK[r])}</span><span style="display:flex;gap:6px;overflow:hidden">${flags.map(([f, k2]) => sbadge(f, k2)).join("")}</span><span class="muted" style="font-size:12.5px">${d}</span></div>`).join("")}
</div></div>
<div class="card" style="padding:18px;display:flex;flex-direction:column;gap:12px;min-height:0;overflow:hidden">
<div style="display:flex;gap:14px;align-items:center">${prod(5, 72, "var(--radius)")}<div><div style="display:flex;gap:6px">${sbadge("Matched", "success")}</div><b style="font-size:16px;display:block;margin-top:4px">Night Barrier Gel Cream</b><span class="muted" style="font-size:12.5px">Morrow Botanics · 50 ml · gel cream</span></div></div>
<div style="display:flex;gap:8px;align-items:center;font-size:12px" class="muted">${ic("gm_scan", 15)}<span class="num" style="font-size:12px;font-weight:500;letter-spacing:.06em">4 820193 557204</span><span style="margin-left:auto">Today, 08:12</span></div>
<div style="padding:10px 12px;border-radius:var(--radius);border:1px solid ${mix("var(--warning)", 45, "var(--border)")};background:${mix("var(--warning)", 8, "var(--surface)")};font-size:12.5px;display:flex;gap:8px"><span style="color:var(--warning);display:flex">${ic("gm_warn", 16)}</span><span><b>Layering note.</b> You use Vitamin C 15% Serum in the morning. Dewline suggests keeping this cream for your evening routine.</span></div>
<b style="font-size:13.5px">Ingredients <span class="muted" style="font-weight:400">· 18 listed</span></b>
<div style="font-size:12.5px;line-height:1.6" class="muted">Aqua, Glycerin, Squalane, <b style="color:var(--text)">Bakuchiol</b>, Niacinamide, Ceramide NP, Panthenol, Allantoin, Sodium Hyaluronate, Tocopherol, Xanthan Gum, Carbomer, Phenoxyethanol, Ethylhexylglycerin…</div>
<div style="display:flex;gap:6px;flex-wrap:wrap">${sbadge("Fragrance-free", "success")}${sbadge("No essential oils", "success")}${sbadge("Alcohol-free", "success")}${sbadge("Evening use", "primary")}</div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;border-top:1px solid var(--border);padding-top:12px">${[["Suggested slot", "Evening · step 3"], ["Similar on your shelf", "Barrier Moisture Cream"]].map(([a, b]) => `<div><div class="muted" style="font-size:11.5px">${a}</div><div style="font-size:13px;font-weight:600">${b}</div></div>`).join("")}</div>
<div style="margin-top:auto;display:grid;gap:8px"><span class="btn primary block">${ic("plus", 15)}Add to my shelf</span><span class="btn block">Compare with my routine</span></div></div></div>`);
  return bWeb(p, "Scan", `${bTop("Scan a product")}
<div style="display:grid;grid-template-columns:minmax(0,1fr) 380px;grid-template-rows:minmax(0,1fr);gap:20px;padding:20px 24px;flex:1;min-height:0">
<div style="display:flex;flex-direction:column;gap:12px;min-width:0">
<div style="position:relative;flex:1;min-height:0">${viewfinder("100%", "100%")}
<div style="position:absolute;top:16px;left:16px;right:16px;display:flex;justify-content:space-between;color:var(--on-ink)"><span style="display:flex;gap:8px;align-items:center;padding:6px 12px;border-radius:999px;background:${mix("var(--ink)", 55, "transparent")};font-size:12.5px;font-weight:500">${ic("gm_cam", 15)}Desk camera (HD)${ic("chevdown", 13)}</span><span style="display:flex;gap:8px">${[["gm_torch", "Torch on", 1], ["gm_flip", "", 0]].map(([i, t, on]) => `<span style="display:flex;gap:6px;align-items:center;height:34px;padding:0 ${t ? 12 : 9}px;border-radius:999px;font-size:12.5px;font-weight:600;${on ? "background:var(--on-ink);color:var(--ink)" : `background:${mix("var(--ink)", 55, "transparent")}`}">${ic(i, 16)}${t}</span>`).join("")}</span></div>
<div style="position:absolute;bottom:16px;left:50%;transform:translateX(-50%);display:flex;gap:6px;padding:4px;border-radius:999px;background:${mix("var(--ink)", 55, "transparent")};color:var(--on-ink)">${["Barcode", "Ingredient list", "Product photo"].map((t, i) => `<span style="height:30px;padding:0 14px;border-radius:999px;display:grid;place-items:center;font-size:12.5px;font-weight:600;${i ? "" : "background:var(--on-ink);color:var(--ink)"}">${t}</span>`).join("")}</div></div>
<div class="card" style="padding:12px 14px">${scanResultMini}</div></div>
<div style="display:flex;flex-direction:column;gap:14px;min-height:0">
<div class="card" style="padding:16px;display:grid;gap:10px"><b style="font-size:14px;display:flex;gap:8px;align-items:center">${ic("gm_kbd", 17)}Enter barcode manually</b><span class="muted" style="font-size:12.5px">The 8–13 digit number under the bars on the box or bottle.</span><div style="display:flex;gap:8px"><div class="input filled" style="flex:1;font-family:ui-monospace,monospace;letter-spacing:.08em">4 820193 5572<span style="display:inline-block;width:1.5px;height:16px;background:var(--primary)"></span></div><span class="btn primary" style="height:40px">Look up</span></div></div>
<div class="card" style="padding:16px;display:flex;flex-direction:column;gap:4px;flex:1;min-height:0;overflow:hidden">${sec("Recent scans", "View history")}
${SCANS.slice(1, 6).map(([n, b, r, d, flags, k]) => `<div style="display:flex;gap:12px;align-items:center;padding:9px 0;border-bottom:1px solid var(--border)">${prod(k, 42)}<div style="flex:1;${ell}"><b style="font-size:13px;display:block;${ell}">${n}</b><span class="muted" style="font-size:12px">${b} · ${d}</span></div>${sbadge(r, resK[r])}</div>`).join("")}
<div class="muted" style="font-size:12px;margin-top:auto;padding-top:10px;display:flex;gap:6px;align-items:center">${ic("lock", 14)}Camera frames stay on this device.</div></div></div></div>`);
};
const scanMobile = (p, st) => {
  if (p.variant === "history") return `<div class="phone">${status()}
<div class="mtop"><h1 style="font-size:${HC(st, 24)}px">Scan history</h1><span style="display:flex;gap:16px">${ic("search", 21)}${ic("filter", 21)}</span></div>
<div class="mbody" style="gap:10px">
<div style="display:flex;gap:6px;overflow:hidden">${chip("All 38", true)}${chip("Flagged 9")}${chip("Partial 4")}${chip("Not found 3")}</div>
<span class="muted" style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.05em">This week</span>
${SCANS.slice(0, 7).map(([n, b, r, d, flags, k], i) => `<div style="display:flex;gap:12px;align-items:flex-start;padding-bottom:10px;border-bottom:1px solid var(--border)">${prod(k, 48)}<div style="flex:1;min-width:0;display:grid;gap:4px"><div style="display:flex;justify-content:space-between;gap:8px"><b style="font-size:13.5px;${ell}">${n}</b><span class="muted" style="font-size:11.5px;white-space:nowrap">${d}</span></div><span class="muted" style="font-size:12px;margin-top:-3px">${b}</span><div style="display:flex;gap:5px;overflow:hidden">${sbadge(r, resK[r])}${flags.slice(0, 1).map(([f, k2]) => sbadge(f, k2)).join("")}</div></div></div>`).join("")}
</div>${tabBar("Scan", BTABS)}</div>`;
  return `<div class="phone" style="background:var(--ink);color:var(--on-ink);position:relative">
<div style="position:absolute;inset:0">${viewfinder("100%", "100%", true)}</div>
<div style="position:relative;display:flex;flex-direction:column;height:100%">${status()}
<div style="display:flex;justify-content:space-between;align-items:center;padding:4px 18px">${["x", "gm_torch"].map((i, n) => `<span style="width:40px;height:40px;border-radius:50%;display:grid;place-items:center;${n ? "background:var(--on-ink);color:var(--ink)" : `background:${mix("var(--ink)", 55, "transparent")}`}">${ic(i, 19)}</span>`).join("")}</div>
<div style="text-align:center;margin-top:10px"><b style="font-size:17px">Scan a barcode</b><div style="font-size:12.5px;opacity:.8">Line up the bars inside the frame</div></div>
<div style="margin-top:auto;background:var(--surface);color:var(--text);border-radius:var(--radius-lg) var(--radius-lg) 0 0;padding:10px 18px 28px;display:grid;gap:12px">
<span style="width:36px;height:4px;border-radius:2px;background:var(--border);justify-self:center"></span>
${scanResultMini}
<div style="display:flex;justify-content:space-between;align-items:baseline"><b style="font-size:13.5px">Recent scans</b><span class="muted" style="font-size:12px">History</span></div>
<div style="display:flex;gap:10px">${SCANS.slice(1, 4).map(([n, b, r, d, f, k]) => `<div style="flex:1;min-width:0;display:grid;gap:5px">${prod(k, 52)}<span style="font-size:11.5px;font-weight:600;${ell}">${n}</span>${sbadge(r === "Partial match" ? "Partial" : r, resK[r])}</div>`).join("")}</div>
<span class="btn block">${ic("gm_kbd", 16)}Enter code manually</span></div></div></div>`;
};

// skincare-routine
const AM = [[0, "Cleanse", "Gentle Oat Cleanser", 0, 1, ""], [1, "Tone", "Rice Water Toner", 4, 1, ""], [2, "Serum", "Vitamin C 15% Serum", 2, 1, "Wait 1 min"], [3, "Moisturise", "Barrier Moisture Cream", 3, 0, "Wait 2 min"], [4, "Sunscreen", "Daily Fluid SPF 50", 1, 0, "Last step"]];
const PM = [[0, "Cleanse", "Gentle Oat Cleanser", 0, 0, ""], [1, "Exfoliate", "Lactic Resurfacing Toner", 6, 0, "Mon · Thu only"], [2, "Moisturise", "Night Barrier Gel Cream", 5, 0, "Wait 1 min"]];
const check = (on, s = 26) => `<span style="width:${s}px;height:${s}px;border-radius:50%;flex:none;display:grid;place-items:center;${on ? "background:var(--success);color:var(--bg)" : "border:2px solid var(--border)"}">${on ? ic("check", Math.round(s * 0.6)) : ""}</span>`;
const stepRow = ([, step, name, k, done, note], i, active, mob) => `<div style="display:flex;gap:12px;align-items:center;padding:${mob ? "10px 12px" : "12px 14px"};border-radius:var(--radius);border:1px solid ${active ? "var(--primary)" : "var(--border)"};background:${active ? tint(8) : "var(--surface)"}">
<span class="num muted" style="font-size:12px;width:14px">${i + 1}</span>${prod(k, mob ? 44 : 48)}<div style="flex:1;min-width:0"><div style="font-size:11.5px;font-weight:600;text-transform:uppercase;letter-spacing:.05em" class="muted">${step}</div><b style="font-size:${mob ? 13.5 : 14}px;display:block;${ell};${done ? "text-decoration:line-through;text-decoration-color:var(--muted)" : ""}">${name}</b>${note ? `<span style="font-size:11.5px;display:inline-flex;gap:4px;align-items:center;${active ? "color:var(--primary);font-weight:600" : ""}" class="${active ? "" : "muted"}">${ic(note.startsWith("Wait") ? "gm_timer" : "clock", 12)}${active ? "Absorbing · 0:42 left" : note}</span>` : ""}</div>${check(done, mob ? 26 : 28)}</div>`;
const flame = (s, on = true) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2c1 4 5 6 5 11a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5 0 2 1 3 2 3 0-3-1-6 1-9.5z" fill="${on ? "var(--warning)" : "var(--border)"}"/></svg>`;
const weekDots = (n = 7, done = 5) => `<div style="display:flex;gap:6px">${["M", "T", "W", "T", "F", "S", "S"].slice(0, n).map((d, i) => `<div style="display:grid;gap:4px;justify-items:center;font-size:11px" class="muted"><span style="width:26px;height:26px;border-radius:50%;display:grid;place-items:center;${i < done ? "background:var(--primary);color:var(--on-primary)" : i === done ? "border:2px solid var(--primary);color:var(--text)" : "border:1px solid var(--border)"}">${i < done ? ic("check", 13) : ""}</span>${d}</div>`).join("")}</div>`;
const routineWeb = (p, st) => {
  if (p.variant === "shelf") return shelfWeb(p, st);
  return bWeb(p, "Routine", `${bTop("Routine")}
<div style="display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr) 300px;grid-template-rows:auto 1fr;gap:20px;padding:20px 24px;flex:1;min-height:0">
<div style="display:flex;flex-direction:column;gap:10px;min-width:0"><div style="display:flex;align-items:center;gap:10px">${icoBtn("sun", 20, "color:var(--warning)")}<h1 style="font-size:${HC(st, 22)}px">Morning routine</h1><span class="muted" style="font-size:12.5px;margin-left:auto">3 of 5 done · about 6 min</span></div>
<div style="height:6px;border-radius:3px;background:${track}"><div style="width:60%;height:100%;border-radius:3px;background:var(--success)"></div></div>
${AM.map((r, i) => stepRow(r, i, i === 3)).join("")}
<div class="card" style="padding:12px 14px;display:flex;gap:12px;align-items:center;box-shadow:none"><span style="width:44px;height:44px;border-radius:50%;display:grid;place-items:center;background:conic-gradient(var(--primary) 0 70%,${track} 70%);flex:none"><span style="width:36px;height:36px;border-radius:50%;background:var(--surface);display:grid;place-items:center" class="num">0:42</span></span><div style="flex:1"><b style="font-size:13.5px">Let the serum settle</b><div class="muted" style="font-size:12px">Moisturiser next. We’ll nudge you when the timer ends.</div></div><span class="btn">Skip wait</span></div></div>
<div style="display:flex;flex-direction:column;gap:10px;min-width:0"><div style="display:flex;align-items:center;gap:10px">${icoBtn("gm_moon", 20, "color:var(--primary)")}<h1 style="font-size:${HC(st, 22)}px">Evening routine</h1><span class="muted" style="font-size:12.5px;margin-left:auto">from 21:30</span></div>
<div style="height:6px;border-radius:3px;background:${track}"></div>
${PM.map((r, i) => stepRow(r, i, false)).join("")}
<div style="padding:12px 14px;border-radius:var(--radius);border:1.5px dashed var(--border);display:flex;gap:10px;align-items:center;color:var(--muted);font-size:13px">${ic("plus", 16)}Add a step or <b style="color:var(--primary)">scan a product</b></div>
<div class="card" style="padding:14px;display:grid;gap:8px;box-shadow:none;background:${tint(6)}"><b style="font-size:13.5px">Tonight is an exfoliation night</b><span class="muted" style="font-size:12.5px">Lactic Resurfacing Toner is set for Mondays and Thursdays. Your morning Vitamin C serum stays in the AM routine so the two aren’t layered.</span></div></div>
<div style="display:flex;flex-direction:column;gap:14px;grid-row:1 / 3;grid-column:3">
<div class="card" style="padding:16px;display:grid;gap:12px"><div style="display:flex;gap:10px;align-items:center">${flame(30)}<div><div class="num" style="font-size:24px">14 days</div><div class="muted" style="font-size:12px">Current streak · best 21</div></div></div>${weekDots(7, 4)}</div>
<div class="card" style="padding:16px;display:grid;gap:10px"><b style="font-size:13.5px">This week</b>${[["Morning", 6, 7], ["Evening", 5, 7], ["Exfoliation", 1, 2]].map(([t, a, b]) => `<div style="display:grid;gap:5px"><div style="display:flex;justify-content:space-between;font-size:12.5px"><span>${t}</span><span class="num muted" style="font-size:12px">${a}/${b}</span></div><div style="height:6px;border-radius:3px;background:${track}"><div style="width:${(a / b) * 100}%;height:100%;border-radius:3px;background:var(--primary)"></div></div></div>`).join("")}</div>
<div class="card" style="padding:16px;display:grid;gap:8px"><b style="font-size:13.5px">Running low</b>${[["Daily Fluid SPF 50", "About 9 days left", 1], ["Rice Water Toner", "Use by 2 Jan 2027", 4]].map(([n, d, k]) => `<div style="display:flex;gap:10px;align-items:center">${prod(k, 36)}<div style="flex:1;${ell}"><b style="font-size:13px;display:block;${ell}">${n}</b><span class="muted" style="font-size:12px">${d}</span></div></div>`).join("")}<span class="btn" style="margin-top:4px">${ic("gm_scan", 15)}Scan to add product</span></div>
<div class="card" style="padding:16px;display:grid;gap:10px"><b style="font-size:13.5px">Skin diary · how does it feel today?</b><div style="display:flex;gap:6px;flex-wrap:wrap">${["Calm", "Dry patches", "Oily T-zone", "Tight"].map((t, i) => chip(t, i === 1, 28)).join("")}</div><span class="muted" style="font-size:12px">Notes are private and only shown to you.</span></div></div>
<div class="card" style="grid-column:1 / 3;padding:16px 18px;display:grid;gap:10px;align-self:start"><div style="display:flex;justify-content:space-between"><b style="font-size:14px">Last 14 days</b><span class="muted" style="font-size:12px;display:flex;gap:14px"><span style="display:flex;gap:5px;align-items:center"><span style="width:10px;height:10px;border-radius:3px;background:var(--primary)"></span>Done</span><span style="display:flex;gap:5px;align-items:center"><span style="width:10px;height:10px;border-radius:3px;background:${track}"></span>Missed</span></span></div>
${[["sun", "Morning", "11111110111111"], ["gm_moon", "Evening", "11011111101110"]].map(([i, t, pat]) => `<div style="display:grid;grid-template-columns:110px repeat(14,1fr);gap:6px;align-items:center"><span style="display:flex;gap:6px;align-items:center;font-size:12.5px">${ic(i, 15)}${t}</span>${[...pat].map((c, d) => `<span style="height:26px;border-radius:var(--radius-sm);background:${d === 13 && t === "Evening" ? "transparent;border:1.5px dashed var(--border)" : c === "1" ? "var(--primary)" : track}"></span>`).join("")}</div>`).join("")}
<div style="display:grid;grid-template-columns:110px repeat(14,1fr);gap:6px;font-size:10.5px;text-align:center" class="muted"><span></span>${["M", "T", "W", "T", "F", "S", "S", "M", "T", "W", "T", "F", "S", "S"].map((d) => `<span>${d}</span>`).join("")}</div></div></div>`);
};
const routineMobile = (p, st) => {
  if (p.variant === "shelf") return shelfMobile(p, st);
  return `<div class="phone">${status()}
<div class="mtop"><div><div class="muted" style="font-size:12px">Sunday 8 Nov</div><h1 style="font-size:${HC(st, 23)}px">Morning routine</h1></div><span style="display:flex;gap:6px;align-items:center;padding:6px 10px;border-radius:999px;background:${mix("var(--warning)", 16, "var(--surface)")};font-weight:700;font-size:13px">${flame(16)}14</span></div>
<div class="mbody" style="gap:10px">
<div style="display:flex;gap:6px">${chip(ic("sun", 14) + "Morning", true)}${chip(ic("gm_moon", 14) + "Evening")}<span class="muted" style="font-size:12px;margin-left:auto;align-self:center">3 of 5 done</span></div>
<div style="height:6px;border-radius:3px;background:${track};flex:none"><div style="width:60%;height:100%;border-radius:3px;background:var(--success)"></div></div>
${AM.map((r, i) => stepRow(r, i, i === 3, true)).join("")}
<div class="card" style="padding:12px;display:flex;gap:12px;align-items:center;box-shadow:none;background:${tint(8)}"><span style="width:42px;height:42px;border-radius:50%;display:grid;place-items:center;background:conic-gradient(var(--primary) 0 70%,${track} 70%);flex:none"><span style="width:34px;height:34px;border-radius:50%;background:var(--surface);display:grid;place-items:center;font-size:11px" class="num">0:42</span></span><div style="flex:1"><b style="font-size:13px">Let the serum settle</b><div class="muted" style="font-size:11.5px">Moisturiser next</div></div><span style="font-size:12.5px;font-weight:600;color:var(--primary)">Skip</span></div>
${weekDots(7, 4).replace('display:flex;gap:6px', 'display:flex;justify-content:space-between')}
</div>${tabBar("Routine", BTABS)}</div>`;
};
// shelf: [name, brand, prodIdx, opened, useBy, frac used, status]
const SHELF = [["Cleanse", [["Gentle Oat Cleanser", "Oatmere", 0, "Opened 2 Sep", "Use by Mar 2027", 0.35]]], ["Tone & exfoliate", [["Rice Water Toner", "Pellumi", 4, "Opened 4 Jul", "Use by 2 Jan 2027", 0.8, "Use soon"], ["Lactic Resurfacing Toner", "Pellumi", 6, "Opened 12 Oct", "Use by Apr 2027", 0.15, "PM only"]]], ["Serum", [["Vitamin C 15% Serum", "Halden Lab", 2, "Opened 20 Oct", "Use by Jan 2027", 0.25, "AM only"]]], ["Moisturise", [["Barrier Moisture Cream", "Quillby Skin", 3, "Opened 1 Aug", "Use by Feb 2027", 0.6], ["Night Barrier Gel Cream", "Morrow Botanics", 5, "Added today", "Unopened", 0, "New"]]], ["Sunscreen", [["Daily Fluid SPF 50", "Fernhollow", 1, "Opened 15 Jun", "Use by Jun 2027", 0.9, "Running low"]]]];
const tagK = { "Use soon": "warning", "Running low": "warning", "PM only": "primary", "AM only": "primary", New: "success" };
const shelfCard = ([n, b, k, op, ub, f, tag], mob) => `<div class="card" style="padding:${mob ? 10 : 12}px;display:flex;gap:12px;align-items:center;box-shadow:none">${prod(k, mob ? 48 : 56)}<div style="flex:1;min-width:0;display:grid;gap:3px"><div style="display:flex;gap:6px;align-items:center;justify-content:space-between"><b style="font-size:13.5px;${ell}">${n}</b>${tag ? sbadge(tag, tagK[tag]) : ""}</div><span class="muted" style="font-size:12px">${b} · ${op}</span><div style="display:flex;gap:8px;align-items:center"><span style="flex:1;height:4px;border-radius:2px;background:${track}"><span style="display:block;height:100%;width:${f * 100}%;border-radius:2px;background:${f > 0.75 ? "var(--warning)" : "var(--primary)"}"></span></span><span style="font-size:11.5px;white-space:nowrap" class="muted">${ub}</span></div></div></div>`;
const conflictNote = (mob) => `<div style="display:flex;gap:10px;padding:${mob ? "10px 12px" : "12px 14px"};border-radius:var(--radius);border:1px solid ${mix("var(--warning)", 45, "var(--border)")};background:${mix("var(--warning)", 8, "var(--surface)")};font-size:${mob ? 12 : 12.5}px"><span style="color:var(--warning);display:flex;margin-top:1px">${ic("gm_warn", 16)}</span><div><b>Layering note</b><div style="margin-top:2px">Vitamin C 15% Serum and Lactic Resurfacing Toner aren’t layered in the same routine: the serum stays in the morning, the toner on evening nights.</div></div></div>`;
const shelfWeb = (p, st) => bWeb(p, "My shelf", `${bTop("My shelf", `<span class="btn primary">${ic("gm_scan", 15)}Scan to add product</span>`)}
<div style="display:flex;flex-direction:column;gap:14px;padding:20px 24px;flex:1;min-height:0;overflow:hidden">
<div style="display:flex;align-items:center;gap:12px"><h1 style="font-size:${HC(st, 24)}px">My products</h1><span class="muted" style="font-size:13px">7 products · 2 need attention</span><div style="margin-left:auto;display:flex;gap:6px">${chip("By step", true)}${chip("By category")}${chip("Use-by date")}</div></div>
${conflictNote()}
<div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px;align-items:start">
${[[SHELF[0], SHELF[1]], [SHELF[2], SHELF[3]], [SHELF[4]]].map((col, ci) => `<div style="display:grid;gap:10px">${col.map(([g, items]) => `<div style="display:flex;justify-content:space-between;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;margin-top:4px" class="muted"><span>${g}</span><span>${items.length}</span></div>${items.map((it) => shelfCard(it)).join("")}`).join("")}${ci === 2 ? `<div style="padding:18px;border-radius:var(--radius-lg);border:1.5px dashed var(--border);display:grid;justify-items:center;gap:8px;text-align:center;margin-top:8px">${icoBtn("gm_scan", 28, "color:var(--primary)")}<b style="font-size:13.5px">Add a product</b><span class="muted" style="font-size:12.5px">Scan the barcode or search by name. We’ll fill in the step and ingredients.</span><span class="btn primary">Scan barcode</span></div>
<div class="card" style="padding:14px;display:grid;gap:6px;box-shadow:none"><b style="font-size:13px">Use-by reminders</b><span class="muted" style="font-size:12.5px">We count from the day you open a product, using the months printed on the jar symbol.</span><div style="display:flex;justify-content:space-between;align-items:center;font-size:13px;margin-top:4px">Remind me 2 weeks before${toggle(true)}</div></div>` : ""}</div>`).join("")}
</div>
<div class="card" style="padding:16px 18px;display:grid;gap:10px"><div style="display:flex;justify-content:space-between"><b style="font-size:14px">Use-by timeline</b><span class="muted" style="font-size:12px">Nov 2026 – Jun 2027</span></div>
<div style="display:grid;grid-template-columns:200px repeat(8,1fr);font-size:11px;font-weight:600" class="muted"><span></span>${["Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((m) => `<span style="border-left:1px solid var(--border);padding-left:6px">${m}</span>`).join("")}</div>
${[["Rice Water Toner", 0, 1.1, "warning"], ["Vitamin C 15% Serum", 0, 2.4, "primary"], ["Barrier Moisture Cream", 0, 3.2, "primary"], ["Daily Fluid SPF 50", 0, 7.3, "primary"]].map(([n, a, b, k]) => `<div style="display:grid;grid-template-columns:200px 1fr;align-items:center;font-size:12.5px"><span style="${ell}">${n}</span><span style="height:10px;position:relative"><span style="position:absolute;left:${(a / 8) * 100}%;width:${(b / 8) * 100}%;top:0;bottom:0;border-radius:5px;background:${mix(`var(--${k})`, 55, "var(--surface)")}"></span><span style="position:absolute;left:${(b / 8) * 100}%;top:-3px;width:3px;height:16px;border-radius:2px;background:var(--${k})"></span></span></div>`).join("")}</div>
</div>`);
const shelfMobile = (p, st) => `<div class="phone">${status()}
<div class="mtop"><h1 style="font-size:${HC(st, 24)}px">My shelf</h1><span style="display:flex;gap:16px">${ic("search", 21)}${ic("filter", 21)}</span></div>
<div class="mbody" style="gap:10px">
<div style="display:flex;gap:6px;overflow:hidden">${chip("By step", true)}${chip("By category")}${chip("Use-by")}</div>
${conflictNote(true)}
${[SHELF[1], SHELF[2], SHELF[3]].map(([g, items]) => `<div style="display:flex;justify-content:space-between;font-size:11.5px;font-weight:600;text-transform:uppercase;letter-spacing:.05em" class="muted"><span>${g}</span><span>${items.length}</span></div>${items.slice(0, g === "Moisturise" ? 1 : 2).map((it) => shelfCard(it, true)).join("")}`).join("")}
<button class="btn primary block" style="height:44px;margin-top:auto;flex:none">${ic("gm_scan", 16)}Scan to add product</button>
</div>${tabBar("Shelf", BTABS)}</div>`;

const FIX = "<style>.mbody>*{flex-shrink:0}</style>";
const EXP = {
  "music-home": { family: "audio", name: "Music home", shows: "a music streaming home screen with a greeting, recently played, made-for-you playlists with cover art, new releases and a now playing bar",
    elements: ["sidebar-nav", "card", "chips", "cover-art", "list", "mini-player", "tab-bar"],
    variants: {
      home: { name: "Music home screen", shows: "a music home screen: greeting, filter chips, recently played tiles, made-for-you playlists with cover art, new releases, a live session reminder and a mini now playing bar" },
      library: { name: "Your library (music)", shows: "a music library: playlists, albums, artists and downloaded filters, pinned liked songs and downloads, a sorted list with cover art and a mini now playing bar" },
    },
    web: homeWeb, mobile: homeMobile },
  "album-page": { family: "audio", name: "Album and artist page", shows: "a music album page and artist profile with cover art, play and shuffle, a numbered track list with durations and a player",
    elements: ["sidebar-nav", "cover-art", "track-list", "table", "card", "buttons", "mini-player"],
    variants: {
      album: { name: "Album page with track list", shows: "an album page: big cover art, artist, year and length, play/shuffle/like/download, a numbered track list with plays and durations, credits, more by the artist and a mini player" },
      artist: { name: "Artist profile", shows: "an artist profile: full-bleed header image with name and monthly listeners, follow and play, popular tracks list, discography with cover art and upcoming shows with tickets" },
    },
    web: albumWeb, mobile: albumMobile },
  "play-queue": { family: "audio", name: "Now playing queue and lyrics", shows: "a music player now playing screen with the up next queue or synced lyrics, scrubber and transport controls",
    elements: ["cover-art", "scrubber", "transport-controls", "track-list", "toggle", "tabs"],
    variants: {
      queue: { name: "Now playing with up next queue", shows: "a now playing music player: large cover art, track and artist, scrubber, shuffle/previous/pause/next/repeat, and an up next queue with a dragged track, next-from-album tracks and an autoplay toggle" },
      lyrics: { name: "Now playing lyrics", shows: "full-screen synced lyrics in the music player with the current line highlighted, past lines faded, a scrubber and transport controls, plus the up next queue and credits" },
    },
    web: queueWeb, mobile: queueMobile },
  "story-viewer": { family: "media", name: "Stories", shows: "photo stories for a social feed: a story viewer with segmented progress bars and replies, and a create story screen with camera, gallery and sticker tools",
    elements: ["full-bleed-photo", "progress-bars", "avatar", "input", "chips", "toolbar", "radio"],
    variants: {
      viewer: { name: "Photo story viewer", shows: "a photo story viewer: segmented progress bars, author with location and time, full-bleed photo with a text sticker, quick reactions, a reply field, like and send, with neighbouring stories dimmed" },
      create: { name: "Create story", shows: "a create story screen: camera/gallery picker with recent photos, the story canvas with text, location and poll stickers, a tool rail (text, stickers, draw, location, mention, music), audience choice and share to story" },
    },
    web: storyWeb, mobile: storyMobile },
  "photo-post": { family: "media", name: "Photo post", shows: "a social photo post with author, caption, location, likes, save and comments",
    elements: ["sidebar-nav", "photo", "avatar", "card", "comments", "input", "grid", "tab-bar"],
    variants: {
      detail: { name: "Photo post detail", shows: "a photo post detail: large photo with carousel count, author and follow, caption with hashtags, location, like/comment/share/save, liked by, a comments preview, comment input and a related posts grid" },
      comments: { name: "Comments thread", shows: "a comments thread for a photo post: photo header with caption, threaded comments with replies and likes, top/newest sort, quick reply chips and a comment composer" },
    },
    web: postWeb, mobile: postMobile },
  "post-composer": { family: "media", name: "Create photo post", shows: "a create photo post flow: edit the photo with crop and filters, then add a caption, location, tagged people and audience before you share",
    elements: ["stepper", "photo", "crop", "filter-strip", "sliders", "form", "toggle", "buttons"],
    variants: {
      filters: { name: "Edit photo before posting (crop and filters)", shows: "a photo editor before posting: crop grid with aspect ratio chips, a filter strip with the selected filter, filter strength and adjust sliders (brightness, contrast, warmth, saturation, fade, vignette) and a reorderable multi-photo carousel" },
      details: { name: "New post details (caption and share)", shows: "the new post details step: photo preview with tags, caption with mentions and hashtags and a character count, location suggestions, tag people, audience, alt text, toggles and a share button" },
    },
    web: composerWeb, mobile: composerMobile },
  "barcode-scanner": { family: "beauty", name: "Barcode scanner", shows: "a product barcode scanner for a skincare beauty app: camera scan frame, scan result and scan history",
    elements: ["camera-viewfinder", "scan-frame", "card", "badge", "input", "list", "table", "chips"],
    variants: {
      scanning: { name: "Scan a product barcode", shows: "a camera scan screen: viewfinder with barcode scan frame and laser line, torch and camera switch, barcode/ingredient list/photo modes, the matched scan result, manual barcode entry and recent scans" },
      history: { name: "Scan history and results", shows: "a scan history list of scanned products with match result badges (matched, partial, not found), ingredient flags, filters, and a scan result panel with barcode number, layering note, ingredients and add to shelf" },
    },
    web: scanWeb, mobile: scanMobile },
  "skincare-routine": { family: "beauty", name: "Skincare routine", shows: "a skincare routine app with morning and evening steps, product thumbnails, done checks, wait timers, a streak and a products shelf with scan to add",
    elements: ["sidebar-nav", "checklist", "progress", "timer", "streak", "card", "badge", "tab-bar"],
    variants: {
      routine: { name: "Morning and evening skincare routine", shows: "a skincare routine: ordered morning and evening steps with product thumbnails and done checks, a wait timer between steps, progress, a 14-day streak with week dots and running-low products" },
      shelf: { name: "My products shelf", shows: "a skincare products shelf grouped by routine step with product thumbnails, opened date, use-by and amount left, use soon / running low badges, a layering note and scan to add product" },
    },
    web: routineWeb, mobile: routineMobile },
};
for (const d of Object.values(EXP)) { const m = d.mobile; d.mobile = (p, st, r) => FIX + m(p, st, r); }
module.exports = EXP;
