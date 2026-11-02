/* Scan + split-view patterns.
   product-scan (beauty family, Dewline — fictional skincare routine app): camera viewfinder → scan result.
   One consistent scan throughout: user Priya Nair (combination, sensitive skin) scans "Night Barrier Gel Cream"
   by Morrow Botanics (fictional), 50 ml, which contains encapsulated retinol and clashes with her
   Halden Lab Vitamin C 15% serum (fictional) if layered in the same routine → suggested slot: PM.
   split-view (workspace family, Fernway): master–detail docs list grouped by date with a calm, hairline detail pane.
   Product shots and the blurred shelf are illustrated SVG in fixed natural tones (artwork, not UI colour). */
const { ic, esc, status, tabBar, sideNav, ICON } = require("../lib");

Object.assign(ICON, {
  scan_scan: '<path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M8 8v8M11 8v8M14 8v8M17 8v8"/>',
  scan_flash: '<path d="M13 2L5 13h6l-1 9 8-11h-6z"/>',
  scan_kbd: '<rect x="2.5" y="6" width="19" height="12" rx="2"/><path d="M6 10h.01M9.5 10h.01M13 10h.01M16.5 10h.01M6 14h.01M18 14h.01M9 14h6"/>',
  scan_drop: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',
  scan_moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
  scan_warn: '<path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17h.01"/>',
  scan_flask: '<path d="M9 3h6M10 3v6l-5.5 9.5A1.7 1.7 0 0 0 6 21h12a1.7 1.7 0 0 0 1.5-2.5L14 9V3M7.5 15h9"/>',
  scan_leaf: '<path d="M5 19c0-9 6-14 15-14 0 9-5 15-14 15zM5 19l7-7"/>',
  scan_bottle: '<path d="M10 2h4v3h-4zM9 5h6v3l1.5 2v11a1 1 0 0 1-1 1h-7a1 1 0 0 1-1-1V10L9 8z"/>',
  scan_face: '<circle cx="12" cy="12" r="9"/><path d="M9 10h.01M15 10h.01M9 15a4 4 0 0 0 6 0"/>',
  scan_cam: '<rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10.5l5-3v9l-5-3z"/>',
  scan_mirror: '<path d="M12 3v18M8 7L3 12l5 5zM16 7l5 5-5 5z"/>',
  scan_pen: '<path d="M4 20h4L19 9l-4-4L4 16z"/>',
  scan_at: '<circle cx="12" cy="12" r="3.5"/><path d="M15.5 12v1.5a2.5 2.5 0 0 0 5 0V12a8.5 8.5 0 1 0-3.4 6.8"/>',
  scan_pin: '<path d="M9 4h6l-1 6 3 3H7l3-3zM12 13v8"/>',
  scan_reply: '<path d="M10 8L4 13l6 5M4 13h11a5 5 0 0 1 5 5"/>',
  scan_archive: '<rect x="3" y="4" width="18" height="5" rx="1"/><path d="M5 9v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9M10 13h4"/>',
  scan_side: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16"/>',
});

const H = (st, px) => Math.round(px * st.hscale);
const CSS = `<style>
.sc-row{display:flex;align-items:center;gap:10px}
.mbody>*{flex-shrink:0}
.sc-ell{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.sc-lbl{font:600 11px var(--font-b);text-transform:uppercase;letter-spacing:.06em;color:var(--muted)}
.sc-hr{height:1px;background:var(--border);flex:none}
.sc-stage{position:relative;overflow:hidden;background:var(--ink);color:var(--on-ink)}
.sc-scene{position:absolute;inset:0;width:100%;height:100%;display:block}
.sc-frame{position:absolute;border-radius:26px;box-shadow:0 0 0 2400px rgba(10,10,12,.46)}
.sc-frame>i{position:absolute;width:38px;height:38px;border:3.5px solid var(--on-ink)}
.sc-frame>i:nth-child(1){left:-2px;top:-2px;border-right:0;border-bottom:0;border-top-left-radius:26px}
.sc-frame>i:nth-child(2){right:-2px;top:-2px;border-left:0;border-bottom:0;border-top-right-radius:26px}
.sc-frame>i:nth-child(3){left:-2px;bottom:-2px;border-right:0;border-top:0;border-bottom-left-radius:26px}
.sc-frame>i:nth-child(4){right:-2px;bottom:-2px;border-left:0;border-top:0;border-bottom-right-radius:26px}
.sc-laser{position:absolute;left:14px;right:14px;height:2px;border-radius:2px;background:var(--on-ink);box-shadow:0 0 12px 2px color-mix(in oklab,var(--on-ink) 70%,transparent);opacity:.9}
.sc-hit{position:absolute;border:2px solid var(--on-ink);border-radius:8px;box-shadow:0 0 0 4px color-mix(in oklab,var(--on-ink) 22%,transparent)}
.sc-hit b{position:absolute;left:-2px;top:-24px;height:20px;padding:0 7px;border-radius:6px;background:var(--on-ink);color:var(--ink);font:700 10px var(--font-b);display:inline-flex;align-items:center;gap:4px;white-space:nowrap;letter-spacing:.02em}
.sc-glass{background:rgba(16,16,18,.52);color:#fff;border:1px solid rgba(255,255,255,.16);backdrop-filter:blur(10px)}
.sc-cbtn{width:42px;height:42px;border-radius:999px;display:grid;place-items:center;flex:none}
.sc-cbtn.on{background:var(--on-ink);color:var(--ink);border-color:var(--on-ink)}
.sc-pill{display:inline-flex;align-items:center;gap:8px;height:36px;padding:0 16px;border-radius:999px;font:600 13px var(--font-b);white-space:nowrap}
.sc-modes{display:inline-flex;padding:4px;border-radius:999px;gap:2px}
.sc-modes span{display:inline-flex;align-items:center;gap:6px;height:32px;padding:0 13px;border-radius:999px;font:600 12.5px var(--font-b);white-space:nowrap;color:rgba(255,255,255,.78)}
.sc-modes span.on{background:var(--on-ink);color:var(--ink)}
.sc-zoom{display:inline-flex;gap:4px;padding:4px;border-radius:999px}
.sc-zoom span{width:32px;height:32px;border-radius:999px;display:grid;place-items:center;font:700 11px var(--font-b);color:rgba(255,255,255,.85)}
.sc-zoom span.on{background:var(--on-ink);color:var(--ink);font-size:12px}
.sc-shutter{width:74px;height:74px;border-radius:50%;border:4px solid var(--on-ink);display:grid;place-items:center;flex:none}
.sc-shutter::after{content:"";width:var(--s,58px);height:var(--s,58px);border-radius:50%;background:var(--on-ink)}
.sc-thumb{display:block;position:relative;overflow:hidden;flex:none;border-radius:var(--radius);background:#e8e1d6}
.sc-thumb>svg{position:absolute;inset:0;width:100%;height:100%;display:block}
.sc-spin{width:14px;height:14px;border-radius:50%;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;flex:none}
.sc-flag{display:inline-flex;align-items:center;gap:5px;height:24px;padding:0 9px;border-radius:999px;font:600 11.5px var(--font-b);white-space:nowrap;flex:none;border:1px solid color-mix(in oklab,var(--primary) 28%,var(--border));background:color-mix(in oklab,var(--primary) 8%,var(--surface));color:color-mix(in oklab,var(--primary) 72%,var(--text))}
.sc-flag.warn{border-color:color-mix(in oklab,var(--accent) 40%,var(--border));background:color-mix(in oklab,var(--accent) 12%,var(--surface));color:color-mix(in oklab,var(--accent) 62%,var(--text))}
.sc-flag.plain{border-color:var(--border);background:var(--surface);color:var(--muted)}
.sc-dot{width:30px;height:30px;border-radius:var(--radius);display:grid;place-items:center;flex:none;background:color-mix(in oklab,var(--primary) 12%,var(--surface));color:color-mix(in oklab,var(--primary) 78%,var(--text))}
.sc-dot.warn{background:color-mix(in oklab,var(--accent) 16%,var(--surface));color:color-mix(in oklab,var(--accent) 66%,var(--text))}
.sc-meter{height:6px;border-radius:999px;background:color-mix(in oklab,var(--text) 9%,var(--surface));overflow:hidden;flex:1}
.sc-meter>i{display:block;height:100%;border-radius:999px;background:var(--primary)}
.sc-seg{display:inline-flex;padding:3px;border-radius:var(--radius);background:color-mix(in oklab,var(--text) 6%,var(--surface));border:1px solid var(--border);font:500 13px var(--font-b)}
.sc-seg span{flex:1;display:inline-flex;align-items:center;justify-content:center;gap:6px;height:30px;padding:0 12px;border-radius:calc(var(--radius) - 2px);color:var(--muted);white-space:nowrap}
.sc-seg span.on{background:var(--surface);color:var(--text);box-shadow:var(--shadow-sm);font-weight:600}
.sc-ing{display:grid;grid-template-columns:30px 1fr;gap:4px 11px;align-content:start;padding:13px 14px;border:1px solid var(--border);border-radius:var(--radius-lg);background:var(--surface);min-width:0}
.sc-ing.warn{border-color:color-mix(in oklab,var(--accent) 45%,var(--border));background:color-mix(in oklab,var(--accent) 5%,var(--surface))}
.sc-art{position:relative;overflow:hidden;flex:none;border-radius:var(--radius-lg);background:linear-gradient(160deg,#ece6dc,#d7cdbd)}
.sc-art>svg{position:absolute;inset:0;width:100%;height:100%;display:block}
.sc-drop{border:1.5px dashed color-mix(in oklab,var(--text) 26%,var(--border));border-radius:var(--radius-lg);background:color-mix(in oklab,var(--primary) 4%,var(--surface));display:grid;justify-items:center;text-align:center;gap:8px}
.sc-step{display:flex;align-items:center;gap:10px;font-size:13px;padding:7px 0}
.sc-step .n{width:22px;height:22px;border-radius:50%;display:grid;place-items:center;flex:none;font:600 11px var(--font-b);border:1px solid var(--border);color:var(--muted);background:var(--surface)}
.sc-step.new{margin:0 -10px;padding:7px 10px;border-radius:var(--radius);background:color-mix(in oklab,var(--primary) 9%,var(--surface))}
.sc-step.new .n{background:var(--primary);border-color:var(--primary);color:var(--on-primary)}
.sc-link{color:var(--primary);font-weight:600}
</style>`;

// ---- Artwork: fictional product bottle, barcode, blurred bathroom shelf (fixed natural tones) --------------------
let artN = 0;
const BARS = "3112212213112221231114121311211413211131213114111221122131113212311133111212211132";
const barcode = (x, y, w, h) => {
  let out = "", cx = 0; const unit = w / BARS.split("").reduce((a, b) => a + +b, 0);
  BARS.split("").forEach((d, i) => { const bw = +d * unit; if (i % 2 === 0) out += `<rect x="${(x + cx).toFixed(2)}" y="${y}" width="${bw.toFixed(2)}" height="${h}" fill="#1d1b19"/>`; cx += bw; });
  return out;
};
// Airless pump bottle, viewBox 0 0 120 230. `code` adds the barcode sticker on the lower label.
const bottleG = (code) => {
  const id = `scb${artN++}`;
  return `<defs><linearGradient id="${id}b" x1="0" x2="1"><stop offset="0" stop-color="#d9d0c2"/><stop offset=".28" stop-color="#f4efe7"/><stop offset=".7" stop-color="#e6ded1"/><stop offset="1" stop-color="#c9bfae"/></linearGradient>
<linearGradient id="${id}p" x1="0" x2="1"><stop offset="0" stop-color="#3f4a3c"/><stop offset=".4" stop-color="#66745f"/><stop offset="1" stop-color="#36402f"/></linearGradient></defs>
<ellipse cx="60" cy="224" rx="44" ry="5" fill="#000" opacity=".18"/>
<rect x="36" y="6" width="48" height="14" rx="4" fill="url(#${id}p)"/><rect x="50" y="18" width="20" height="18" fill="url(#${id}p)"/>
<rect x="30" y="34" width="60" height="18" rx="5" fill="url(#${id}p)"/>
<rect x="20" y="50" width="80" height="172" rx="16" fill="url(#${id}b)"/>
<rect x="28" y="58" width="6" height="150" rx="3" fill="#fff" opacity=".45"/>
<text x="60" y="94" text-anchor="middle" font-family="Georgia,serif" font-size="13" letter-spacing="2.4" fill="#3c4638">MORROW</text>
<text x="60" y="106" text-anchor="middle" font-family="Helvetica,Arial,sans-serif" font-size="5.6" letter-spacing="2" fill="#6c7566">BOTANICS</text>
<rect x="44" y="114" width="32" height=".8" fill="#8b9384"/>
<text x="60" y="130" text-anchor="middle" font-family="Georgia,serif" font-style="italic" font-size="10" fill="#2f362c">Night Barrier</text>
<text x="60" y="142" text-anchor="middle" font-family="Helvetica,Arial,sans-serif" font-size="6.2" letter-spacing=".6" fill="#4f584b">GEL CREAM · RETINOL 0.1%</text>
<text x="60" y="${code ? 160 : 200}" text-anchor="middle" font-family="Helvetica,Arial,sans-serif" font-size="5.4" fill="#6c7566">50 ml e 1.7 fl oz</text>
${code ? `<rect x="35" y="168" width="50" height="34" rx="2" fill="#fbfaf7"/>${barcode(39, 171, 42, 22)}<text x="60" y="199.5" text-anchor="middle" font-family="Helvetica,Arial,sans-serif" font-size="4.6" letter-spacing=".9" fill="#1d1b19">5 060412 733182</text>` : ""}`;
};
const bottle = (code, w, h) => `<svg viewBox="0 0 120 230" width="${w}" height="${h}" aria-hidden="true">${bottleG(code)}</svg>`;
// Recent-scan thumbnails: small generic products in natural tones.
const THUMBS = {
  tube: ["#e9e4dc", "#c99a86", '<rect x="34" y="14" width="32" height="56" rx="6" fill="#efe9e1"/><rect x="40" y="70" width="20" height="12" rx="2" fill="#c99a86"/><rect x="38" y="30" width="24" height="14" rx="2" fill="#c99a86" opacity=".55"/>'],
  amber: ["#d9cdbb", "#8f5328", '<rect x="44" y="12" width="12" height="14" rx="2" fill="#2e2a26"/><rect x="36" y="26" width="28" height="52" rx="7" fill="#8f5328"/><rect x="40" y="42" width="20" height="18" rx="1" fill="#efe6d6"/>'],
  jar: ["#d6dccf", "#71806a", '<rect x="28" y="30" width="44" height="10" rx="3" fill="#4d5a48"/><rect x="26" y="40" width="48" height="36" rx="9" fill="#e8ecdf"/><rect x="34" y="50" width="32" height="10" rx="1" fill="#71806a" opacity=".6"/>'],
  pump: ["#e3ddd2", "#4f5b4a", '<rect x="42" y="8" width="16" height="6" rx="2" fill="#4f5b4a"/><rect x="47" y="14" width="6" height="8" fill="#4f5b4a"/><rect x="38" y="22" width="24" height="56" rx="6" fill="#f2ede5"/><rect x="42" y="40" width="16" height="10" fill="#4f5b4a" opacity=".5"/>'],
  pink: ["#ecd9d2", "#b9786a", '<rect x="40" y="10" width="20" height="16" rx="3" fill="#f6efe9"/><rect x="34" y="26" width="32" height="52" rx="10" fill="#d9a496"/><rect x="40" y="44" width="20" height="10" rx="1" fill="#f6efe9" opacity=".8"/>'],
};
const thumb = (k, s) => { const [bg, , g] = THUMBS[k]; return `<span class="sc-thumb" style="width:${s}px;height:${s}px;background:${bg}"><svg viewBox="0 0 100 90" preserveAspectRatio="xMidYMid meet" aria-hidden="true">${g}</svg></span>`; };
const artBox = (w, h, code) => `<span class="sc-art" style="width:${w}px;height:${h}px"><svg viewBox="-30 -8 180 246" preserveAspectRatio="xMidYMid meet" aria-hidden="true">${bottleG(code)}</svg></span>`;

// Blurred bathroom shelf behind the in-focus product. viewBox W×H, shelf line at sy.
const scene = (W, H, sy) => {
  const id = `scs${artN++}`, b = (x, w, h, c, r, extra = "") => `<rect x="${x}" y="${sy - h}" width="${w}" height="${h}" rx="${r}" fill="${c}" ${extra}/>`;
  return `<svg class="sc-scene" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs>
<linearGradient id="${id}w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d8cbb9"/><stop offset=".7" stop-color="#b9a893"/><stop offset="1" stop-color="#8d7a66"/></linearGradient>
<radialGradient id="${id}l" cx=".72" cy=".12" r=".8"><stop offset="0" stop-color="#fff6e6" stop-opacity=".55"/><stop offset="1" stop-color="#fff6e6" stop-opacity="0"/></radialGradient>
<filter id="${id}f" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="${Math.round(W / 70)}"/></filter></defs>
<rect width="${W}" height="${H}" fill="url(#${id}w)"/>
<g filter="url(#${id}f)" opacity=".95">
${Array.from({ length: 9 }, (_, i) => `<line x1="0" x2="${W}" y1="${(i + 1) * H / 10}" y2="${(i + 1) * H / 10}" stroke="#a89884" stroke-width="2"/>`).join("")}
<ellipse cx="${W * 0.86}" cy="${sy - H * 0.28}" rx="${W * 0.1}" ry="${H * 0.12}" fill="#6f7f5c"/><ellipse cx="${W * 0.8}" cy="${sy - H * 0.36}" rx="${W * 0.06}" ry="${H * 0.1}" fill="#82936b"/>
${b(W * 0.82, W * 0.1, H * 0.1, "#b76e4d", 6)}
${b(W * 0.04, W * 0.08, H * 0.24, "#8f5328", 10)}${b(W * 0.065, W * 0.03, H * 0.29, "#2e2a26", 4)}
${b(W * 0.14, W * 0.07, H * 0.16, "#ece6dd", 12)}
${b(W * 0.64, W * 0.09, H * 0.2, "#d9a496", 14)}${b(W * 0.665, W * 0.04, H * 0.24, "#f3ece5", 5)}
${b(W * 0.74, W * 0.07, H * 0.13, "#e8ecdf", 10)}
<rect x="0" y="${sy}" width="${W}" height="${H * 0.03}" fill="#7a5a40"/><rect x="0" y="${sy + H * 0.03}" width="${W}" height="${H}" fill="#6a5543"/>
</g><rect width="${W}" height="${H}" fill="url(#${id}l)"/></svg>`;
};

// ---- Copy ----------------------------------------------------------------------------------------------------
const PROD = { brand: "Morrow Botanics", name: "Night Barrier Gel Cream", size: "50 ml · 1.7 fl oz", code: "5 060412 733182", conf: 98 };
const INGS = [
  ["scan_drop", "Niacinamide", "4%", "Evens tone and calms redness; helps your barrier hold water.", "Suits sensitive skin", 0],
  ["scan_leaf", "Ceramide NP", "", "Refills the lipids that keep moisture in overnight.", "Barrier support", 0],
  ["scan_warn", "Retinol", "0.1%, encapsulated", "Speeds up cell turnover to smooth texture and fine lines.", "Not with your vitamin C serum", 1],
  ["scan_flask", "Panthenol", "B5", "Soothes tightness and helps skin recover from actives.", "Soothing", 0],
  ["scan_drop", "Squalane", "", "Light, non-greasy moisture for oily T-zones.", "Non-comedogenic", 0],
  ["scan_leaf", "Centella asiatica", "extract", "Plant extract that calms irritation and visible redness.", "Calming", 0],
];
const FLAGS = [["check", "Fragrance-free", 0], ["check", "No essential oils", 0], ["check", "Alcohol-free", 0], ["scan_warn", "Contains retinol", 1]];
const flag = ([i, t, w]) => `<span class="sc-flag${w ? " warn" : ""}">${ic(i, 12)}${t}</span>`;
const RECENT = [["tube", "Halden Lab", "Daily Mineral Sunscreen SPF 50", "Good match", 0, "Yesterday"], ["amber", "Halden Lab", "Vitamin C 15% Serum", "In your AM routine", 0, "Mon"], ["pink", "Oyelaran", "Rosewater Toning Mist", "Contains fragrance", 1, "Sat"], ["jar", "Fenna & Co.", "Oat Milk Cleansing Balm", "Good match", 0, "28 Oct"]];
const ROUTINE_PM = [["Oat Milk Cleansing Balm", "Fenna & Co."], ["Hydrating Toner", "Ilse Skin"], ["Peptide Serum", "Halden Lab"], ["Night Barrier Gel Cream", "Morrow Botanics", 1], ["Rosehip Face Oil", "Fenna & Co.", 0, "Optional"]];

const SIDE_NAV = [["home", "Today"], ["scan_scan", "Scan"], ["scan_drop", "Routine"], ["scan_bottle", "My shelf"], ["scan_face", "Skin profile"], ["calendar", "Skin diary"]];
const side = (p, active) => `<aside class="side"><div class="logo"><b></b>${esc(p.name)}</div>
${SIDE_NAV.map(([i, l]) => `<div class="nav${l === active ? " on" : ""}">${ic(i)}${l}</div>`).join("")}
<div class="grp">Your skin</div><div style="padding:0 8px;display:grid;gap:6px;font-size:12.5px"><div class="sc-row" style="gap:7px"><span class="sc-flag plain" style="height:22px">Combination</span><span class="sc-flag plain" style="height:22px">Sensitive</span></div><div class="muted" style="line-height:1.45">Goals: calm redness, smoother texture. Avoiding fragrance.</div></div>
<div class="foot"><div class="avatar">PN</div><div><div style="font-weight:500">Priya Nair</div><div class="muted" style="font-size:12px">14-day streak</div></div></div></aside>`;

const stageTop = `color:var(--on-ink)`;
// The live viewfinder (web). w/h = stage size; frame centred.
const webStage = (w, h, opts) => {
  const fw = opts.fw, fh = opts.fh, fx = (w - fw) / 2, fy = opts.fy, bh = fh - 34, bw = bh * 120 / 230;
  const bx = fx + (fw - bw) / 2, by = fy + fh - bh - 10;
  const hitX = bx + bw * 35 / 120 - 6, hitY = by + bh * 168 / 230 - 6, hitW = bw * 50 / 120 + 12, hitH = bh * 34 / 230 + 12;
  return `<div class="sc-stage" style="width:${w}px;height:${h}px;border-radius:var(--radius-lg)">${scene(w, h, by + bh - 4)}
<div style="position:absolute;left:${bx}px;top:${by}px">${bottle(1, bw, bh)}</div>
<div class="sc-frame" style="left:${fx}px;top:${fy}px;width:${fw}px;height:${fh}px"><i></i><i></i><i></i><i></i>${opts.laser ? `<span class="sc-laser" style="top:${Math.round(hitY - fy + hitH / 2)}px"></span>` : ""}</div>
${opts.hit ? `<div class="sc-hit" style="left:${hitX}px;top:${hitY}px;width:${hitW}px;height:${hitH}px"><b>${opts.hit}</b></div>` : ""}
${opts.inner || ""}</div>`;
};

const TPL = {};

// ============================== product-scan: camera ==============================
TPL["camera/web"] = (p, st) => `${CSS}<div class="shell">${side(p, "Scan")}<main class="main">
<div class="top"><div class="h" style="font-size:${H(st, 17)}px">Scan a product</div><span class="sc-seg" style="margin-left:14px">${[[`${ic("scan_cam", 14)}Camera`, 1], [`${ic("upload", 14)}Upload photo`], [`${ic("scan_kbd", 14)}Type code`]].map(([t, on]) => `<span class="${on ? "on" : ""}">${t}</span>`).join("")}</span>
<div class="search">${ic("search", 16)}Search products or ingredients</div><span class="btn">${ic("clock", 15)}Recent scans</span></div>
<div style="flex:1;display:grid;grid-template-columns:minmax(0,1fr) 356px;gap:22px;padding:22px 28px 24px;min-height:0">
<div style="display:flex;flex-direction:column;gap:12px;min-width:0">
${webStage(788, 794, { fw: 336, fh: 452, fy: 104, laser: 1, hit: `${ic("scan_scan", 11)}EAN-13 · reading`, inner: `
<div style="position:absolute;left:18px;top:18px;right:18px;display:flex;align-items:center;gap:10px">
<span class="sc-pill sc-glass" style="height:38px;font-weight:500">${ic("scan_cam", 15)}FaceTime HD Camera${ic("chevdown", 13)}</span>
<span class="sc-pill sc-glass" style="height:38px;margin-left:auto;font-weight:500"><span style="width:8px;height:8px;border-radius:50%;background:#e25b4b"></span>Live</span>
<span class="sc-cbtn sc-glass">${ic("scan_mirror", 17)}</span><span class="sc-cbtn sc-glass on">${ic("scan_flash", 17)}</span></div>
<div style="position:absolute;left:0;right:0;top:582px;display:flex;justify-content:center"><span class="sc-pill sc-glass">${`<span class="sc-spin"></span>`}Hold steady — scanning barcode</span></div>
<div style="position:absolute;left:0;right:0;bottom:0;height:150px;background:linear-gradient(to bottom,transparent,rgba(10,10,12,.7))"></div>
<div style="position:absolute;left:20px;right:20px;bottom:22px;display:flex;align-items:center;gap:14px">
<span class="sc-zoom sc-glass"><span>.5</span><span class="on">1×</span><span>2</span></span>
<span class="sc-modes sc-glass" style="margin:0 auto">${[["scan_scan", "Barcode", 1], ["doc", "Ingredients label"], ["image", "Product photo"]].map(([i, t, on]) => `<span class="${on ? "on" : ""}">${ic(i, 14)}${t}</span>`).join("")}</span>
<span class="sc-shutter" style="width:64px;height:64px;border-width:3px;--s:48px"></span></div>` })}
</div>
<div style="display:flex;flex-direction:column;gap:16px;min-width:0">
<div class="sc-drop" style="padding:22px 18px"><span class="sc-dot" style="width:42px;height:42px">${ic("upload", 20)}</span><div style="font-weight:600">Drop a photo of the barcode or label</div><div class="muted" style="font-size:12.5px;line-height:1.45">PNG, JPG or HEIC up to 12 MB. For ingredient lists, flatten the tube and avoid glare.</div><span class="btn" style="height:32px">${ic("image", 14)}Choose a file</span></div>
<div style="display:grid;gap:8px"><div class="sc-row" style="justify-content:space-between"><span style="font-weight:600;font-size:13px">${ic("scan_kbd", 15)} Type the code instead</span><span class="muted" style="font-size:12px">EAN / UPC</span></div>
<div class="sc-row" style="gap:8px"><div class="input" style="flex:1;letter-spacing:.08em">5 060412 7…</div><span class="btn primary">Look up</span></div></div>
<div class="sc-hr"></div>
<div style="display:flex;justify-content:space-between;align-items:baseline"><span style="font-weight:600">Recent scans</span><span class="sc-link" style="font-size:13px">View all 23</span></div>
<div style="display:grid;gap:0;margin-top:-6px">${RECENT.map(([k, br, n, v, w, d], i) => `<div class="sc-row" style="gap:12px;padding:9px 0;${i ? "border-top:1px solid var(--border)" : ""}">${thumb(k, 44)}<div style="flex:1;min-width:0"><div class="muted sc-ell" style="font-size:11.5px">${br}</div><div class="sc-ell" style="font-weight:600;font-size:13px">${n}</div><div class="sc-ell" style="font-size:11.5px;color:${w ? "color-mix(in oklab,var(--accent) 62%,var(--text))" : "color-mix(in oklab,var(--primary) 70%,var(--text))"}">${w ? ic("scan_warn", 11) : ic("check", 11)} ${v}</div></div><span class="muted" style="font-size:11.5px">${d}</span></div>`).join("")}</div>
<div style="margin-top:auto;padding:12px 14px;border-radius:var(--radius-lg);background:color-mix(in oklab,var(--primary) 7%,var(--surface));border:1px solid color-mix(in oklab,var(--primary) 18%,var(--border));font-size:12.5px;line-height:1.5"><b style="font-weight:600">Checked against your profile.</b> <span class="muted">Results flag fragrance, clashing actives and anything you’ve marked as a trigger.</span></div>
</div></div></main></div>`;

TPL["camera/mobile"] = (p, st) => {
  const fx = 50, fy = 132, fw = 290, fh = 352, bw = 150, bh = 288, bx = fx + (fw - bw) / 2, by = fy + fh - bh - 14;
  const hitX = bx + bw * 35 / 120 - 6, hitY = by + bh * 168 / 230 - 6, hitW = bw * 50 / 120 + 12, hitH = bh * 34 / 230 + 12;
  return `${CSS}<div class="phone sc-stage">${scene(390, 844, by + bh - 4)}
<div style="position:absolute;left:${bx}px;top:${by}px">${bottle(1, bw, bh)}</div>
<div class="sc-frame" style="left:${fx}px;top:${fy}px;width:${fw}px;height:${fh}px"><i></i><i></i><i></i><i></i><span class="sc-laser" style="top:${Math.round(hitY - fy + hitH / 2)}px"></span></div>
<div class="sc-hit" style="left:${hitX}px;top:${hitY}px;width:${hitW}px;height:${hitH}px"><b>${ic("scan_scan", 11)}EAN-13</b></div>
<div style="position:relative;${stageTop}">${status()}</div>
<div style="position:relative;display:flex;align-items:center;justify-content:space-between;padding:6px 18px 0">
<span class="sc-cbtn sc-glass">${ic("x", 20)}</span>
<div style="text-align:center;color:#fff"><div style="font-weight:600;font-size:15px">Scan a product</div><div style="font-size:12px;opacity:.75">Checked against your skin profile</div></div>
<span class="sc-cbtn sc-glass on">${ic("scan_flash", 19)}</span></div>
<div style="position:absolute;left:0;right:0;top:${fy + fh + 18}px;display:flex;justify-content:center"><span class="sc-pill sc-glass"><span class="sc-spin"></span>Hold steady — scanning barcode</span></div>
<div style="position:absolute;left:0;right:0;top:${fy + fh + 68}px;display:flex;justify-content:center"><span class="sc-zoom sc-glass"><span>.5</span><span class="on">1×</span><span>2</span></span></div>
<div style="position:absolute;left:0;right:0;bottom:0;height:268px;background:linear-gradient(to bottom,transparent,rgba(10,10,12,.62) 26%,rgba(10,10,12,.78))"></div>
<div style="position:absolute;left:0;right:0;bottom:200px;display:flex;justify-content:center"><span class="sc-modes sc-glass">${[["Barcode", 1], ["Ingredients label"], ["Product photo"]].map(([t, on]) => `<span class="${on ? "on" : ""}">${t}</span>`).join("")}</span></div>
<div style="position:absolute;left:26px;right:26px;bottom:96px;display:flex;align-items:center;justify-content:space-between;color:#fff">
<div style="display:grid;justify-items:center;gap:5px;width:64px"><span class="sc-thumb" style="width:46px;height:46px;border:2px solid rgba(255,255,255,.85);background:#d9cdbb"><svg viewBox="0 0 100 90" aria-hidden="true">${THUMBS.amber[2]}</svg></span><span style="font-size:11px;font-weight:600">Gallery</span></div>
<span class="sc-shutter"></span>
<div style="display:grid;justify-items:center;gap:5px;width:64px"><span style="position:relative;width:46px;height:46px">${["jar", "pink", "tube"].map((k, i) => `<span style="position:absolute;left:${i * 5}px;top:${8 - i * 4}px;border-radius:10px;box-shadow:0 0 0 2px rgba(20,20,22,.9)">${thumb(k, 36)}</span>`).join("")}<b style="position:absolute;right:-8px;top:-8px;min-width:20px;height:20px;padding:0 5px;border-radius:999px;background:var(--on-ink);color:var(--ink);font:700 10.5px var(--font-b);display:grid;place-items:center">23</b></span><span style="font-size:11px;font-weight:600;white-space:nowrap">Recent scans</span></div></div>
<div style="position:absolute;left:0;right:0;bottom:42px;display:flex;justify-content:center"><span class="sc-row" style="gap:8px;color:#fff;font-weight:600;font-size:14px;text-decoration:underline;text-underline-offset:4px;text-decoration-color:rgba(255,255,255,.4)">${ic("scan_kbd", 18)}Type the code instead</span></div>
<div style="position:absolute;left:50%;bottom:9px;transform:translateX(-50%);width:134px;height:5px;border-radius:3px;background:rgba(255,255,255,.85)"></div></div>`;
};

// ============================== product-scan: result ==============================
const verdict = (st, compact) => `<div style="display:grid;gap:${compact ? 10 : 12}px">
<div class="sc-row" style="gap:12px;align-items:flex-start"><span class="sc-dot" style="width:${compact ? 36 : 40}px;height:${compact ? 36 : 40}px">${ic("scan_face", compact ? 18 : 20)}</span><div style="min-width:0"><div class="h" style="font-size:${H(st, compact ? 17 : 20)}px">Good match for combination, sensitive skin</div><div class="muted" style="font-size:12.5px;margin-top:3px">8 of 9 key ingredients suit your profile · no fragrance or drying alcohols</div></div></div>
<div style="display:flex;gap:10px;align-items:flex-start;padding:${compact ? "9px 11px" : "11px 13px"};border-radius:var(--radius);background:color-mix(in oklab,var(--accent) 11%,var(--surface));border:1px solid color-mix(in oklab,var(--accent) 34%,var(--border));font-size:${compact ? 12.5 : 13}px;line-height:1.45"><span style="color:color-mix(in oklab,var(--accent) 66%,var(--text));margin-top:1px">${ic("scan_warn", 16)}</span><div><b style="font-weight:600">Contains retinol.</b> Don’t layer it with your Halden Lab Vitamin C 15% serum — use it at night only, 2–3 nights a week to start.</div></div></div>`;
const ingCard = ([i, n, conc, what, tag, w]) => `<div class="sc-ing${w ? " warn" : ""}"><span class="sc-dot${w ? " warn" : ""}">${ic(i, 15)}</span><div style="min-width:0"><div style="font-weight:600;font-size:13.5px" class="sc-ell">${n}${conc ? ` <span class="muted" style="font-weight:500;font-size:12px">${conc}</span>` : ""}</div></div>
<span></span><div style="display:grid;gap:7px"><div class="muted" style="font-size:12.5px;line-height:1.45">${what}</div><span class="sc-flag${w ? " warn" : ""}" style="justify-self:start;height:22px;font-size:11px">${w ? ic("scan_warn", 11) : ic("check", 11)}${tag}</span></div></div>`;

TPL["result/web"] = (p, st) => `${CSS}<div class="shell">${side(p, "Scan")}<main class="main">
<div class="top"><div class="muted">Scan</div><span class="muted">/</span><div style="font-weight:500">${PROD.name}</div><span class="sc-flag" style="margin-left:6px">${ic("check", 12)}Matched in 1.4 s</span><div class="search">${ic("search", 16)}Search products or an ingredient…</div><span class="btn">${ic("share", 15)}Share</span></div>
<div style="flex:1;display:grid;grid-template-columns:330px minmax(0,1fr);min-height:0">
<div style="border-right:1px solid var(--border);padding:22px 22px 22px 24px;display:flex;flex-direction:column;gap:14px;background:color-mix(in oklab,var(--surface) 50%,var(--bg))">
<div class="sc-row" style="justify-content:space-between"><span style="font-weight:600">Scanner</span><span class="sc-seg" style="font-size:12px"><span class="on" style="height:26px;padding:0 10px">${ic("scan_cam", 13)}Webcam</span><span style="height:26px;padding:0 10px">${ic("upload", 13)}Upload</span></span></div>
${webStage(284, 250, { fw: 150, fh: 196, fy: 26, hit: `${ic("check", 11)}Matched`, inner: `<div style="position:absolute;left:10px;top:10px"><span class="sc-pill sc-glass" style="height:26px;padding:0 10px;font-size:11px">Paused · frame captured</span></div><div style="position:absolute;right:10px;bottom:10px;display:flex;gap:6px"><span class="sc-cbtn sc-glass" style="width:32px;height:32px">${ic("scan_flash", 14)}</span><span class="sc-cbtn sc-glass" style="width:32px;height:32px">${ic("refresh", 14)}</span></div>` })}
<div class="sc-drop" style="padding:16px 14px;gap:6px"><span class="sc-dot">${ic("upload", 16)}</span><div style="font-weight:600;font-size:13px">Drop a label photo to scan another</div><div class="muted" style="font-size:12px">or paste an image · PNG, JPG, HEIC</div></div>
<div style="display:grid;gap:7px"><span style="font-weight:600;font-size:13px">Barcode</span><div class="sc-row" style="gap:8px"><div class="input filled" style="flex:1;letter-spacing:.06em;font-size:13px">${PROD.code}</div><span class="btn">${ic("scan_kbd", 15)}</span></div></div>
<div class="sc-hr"></div>
<div style="display:grid;gap:4px;font-size:13px"><span style="font-weight:600;margin-bottom:4px">Not the right product?</span><span class="muted" style="font-size:12.5px;line-height:1.45">Barcodes are sometimes reused across sizes and regions. Rescan the ingredients label to confirm.</span><span class="sc-row sc-link" style="gap:6px;margin-top:6px">${ic("refresh", 15)}Rescan with the ingredients label</span></div>
</div>
<div style="padding:24px 32px;display:flex;flex-direction:column;gap:18px;min-width:0;overflow:hidden">
<div style="display:flex;gap:24px;align-items:stretch">${artBox(150, 184, 0)}
<div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:9px"><div class="sc-row" style="gap:8px"><span class="muted" style="font-size:13px;font-weight:500">${PROD.brand}</span><span class="muted">·</span><span class="muted" style="font-size:13px">${PROD.size}</span><span class="muted">·</span><span class="muted" style="font-size:13px">EAN ${PROD.code}</span></div>
<h1 style="font-size:${H(st, 28)}px">${PROD.name}</h1>
<div style="display:flex;flex-wrap:wrap;gap:6px">${FLAGS.map(flag).join("")}</div>
<div class="sc-row" style="gap:12px;max-width:440px;font-size:12.5px"><span class="muted" style="white-space:nowrap">Match confidence</span><span class="sc-meter"><i style="width:${PROD.conf}%"></i></span><span class="num" style="font-size:14px">${PROD.conf}%</span></div>
<div class="muted" style="font-size:12px;margin-top:-4px">Barcode and label text agree · formula updated Aug 2026</div>
<div class="sc-row" style="gap:10px;margin-top:auto"><span class="btn primary" style="height:40px">${ic("plus", 16)}Add to PM routine</span><span class="btn" style="height:40px">${ic("bookmark", 15)}Save to shelf</span><span class="btn" style="height:40px">${ic("scan_flask", 15)}Compare</span></div></div></div>
<div style="display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,1fr);gap:18px">
<div class="card" style="padding:16px 18px">${verdict(st, true)}</div>
<div class="card" style="padding:16px 18px;display:flex;flex-direction:column;gap:2px"><div class="sc-row" style="justify-content:space-between;margin-bottom:6px"><span style="font-weight:600">Routine slot</span><span class="sc-seg" style="font-size:12px"><span style="height:24px;padding:0 10px">${ic("sun", 13)}AM</span><span class="on" style="height:24px;padding:0 10px">${ic("scan_moon", 13)}PM</span></span></div>
${ROUTINE_PM.slice(0, 4).map(([n, b, isNew], i) => `<div class="sc-step${isNew ? " new" : ""}" style="padding-top:5px;padding-bottom:5px"><span class="n">${i + 1}</span><span class="sc-ell" style="flex:1;${isNew ? "font-weight:600" : ""}">${n} <span class="muted" style="font-weight:400">· ${b}</span></span>${isNew ? '<span class="sc-flag" style="height:20px;font-size:10.5px">New</span>' : ""}</div>`).join("")}</div></div>
<div style="display:flex;justify-content:space-between;align-items:baseline"><div class="h" style="font-size:${H(st, 18)}px">What’s inside</div><span class="muted" style="font-size:13px">6 key ingredients of 27 · <span class="sc-link">Full INCI list</span></span></div>
<div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-top:-6px">${INGS.map(ingCard).join("")}</div>
</div></div></main></div>`;

TPL["result/mobile"] = (p, st) => `${CSS}<div class="phone">${status()}<div class="mtop" style="padding-bottom:8px">${ic("back", 22)}<div style="font-weight:600">Scan result</div><span class="sc-row" style="gap:16px">${ic("bookmark", 20)}${ic("share", 20)}</span></div>
<div class="mbody" style="gap:13px;padding-top:2px">
<div style="display:flex;gap:14px;align-items:center">${artBox(92, 118, 0)}<div style="min-width:0;display:grid;gap:4px"><div class="muted" style="font-size:12.5px;font-weight:500">${PROD.brand}</div><h1 style="font-size:${H(st, 21)}px">${PROD.name}</h1><div class="muted" style="font-size:12px">${PROD.size}</div>
<div class="sc-row" style="gap:8px;font-size:12px;margin-top:2px"><span class="sc-meter" style="max-width:90px"><i style="width:${PROD.conf}%"></i></span><span style="font-weight:600">${PROD.conf}% match</span></div></div></div>
<div class="card" style="padding:14px">${verdict(st, true)}</div>
<div style="display:flex;gap:6px;margin-right:-20px;overflow:hidden">${FLAGS.slice(0, 3).map(flag).join("")}</div>
<div style="display:flex;justify-content:space-between;align-items:baseline"><div class="h" style="font-size:${H(st, 17)}px">What’s inside</div><span class="sc-link" style="font-size:13px">All 27</span></div>
<div style="display:grid;grid-template-columns:minmax(0,1fr);margin-top:-6px">${INGS.slice(0, 3).map(([i, n, conc, what, tag, w], k) => `<div style="display:flex;gap:11px;padding:9px 0;${k ? "border-top:1px solid var(--border)" : ""}"><span class="sc-dot${w ? " warn" : ""}">${ic(i, 15)}</span><div style="flex:1;min-width:0"><div class="sc-row" style="gap:6px;justify-content:space-between"><span style="font-weight:600;font-size:13.5px" class="sc-ell">${n}${conc ? ` <span class="muted" style="font-weight:500;font-size:11.5px">${conc.replace(", encapsulated", "")}</span>` : ""}</span>${w ? `<span class="sc-flag warn" style="height:20px;font-size:10.5px">Not with vitamin C</span>` : ""}</div><div class="muted sc-ell" style="font-size:12px">${what}</div></div></div>`).join("")}</div>
</div>
<div style="flex:none;padding:12px 20px 28px;border-top:1px solid var(--border);background:var(--surface);display:grid;gap:10px">
<div class="sc-row" style="justify-content:space-between;font-size:13px"><span><span class="muted">Routine slot</span> · <b style="font-weight:600">PM, step 4</b></span><span class="sc-seg" style="font-size:12px"><span style="height:26px;padding:0 10px">${ic("sun", 13)}AM</span><span class="on" style="height:26px;padding:0 10px">${ic("scan_moon", 13)}PM</span></span></div>
<span class="btn primary block" style="height:46px">${ic("plus", 16)}Add to PM routine</span>
<div style="text-align:center;font-size:13px"><span class="muted">Not the right product?</span> <span class="sc-link">Scan again</span></div></div></div>`;

TPL["product-scan/web"] = (p, st, rnd) => TPL[`${p.variant === "result" ? "result" : "camera"}/web`](p, st, rnd);
TPL["product-scan/mobile"] = (p, st, rnd) => TPL[`${p.variant === "result" ? "result" : "camera"}/mobile`](p, st, rnd);

// ============================== split-view (Fernway) ==============================
const SV_CSS = `<style>
.sv-row{display:flex;align-items:center;gap:10px}
.mbody>*{flex-shrink:0}
.sv-ell{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.sv-grp{display:flex;align-items:baseline;justify-content:space-between;font:600 11px var(--font-b);text-transform:uppercase;letter-spacing:.07em;color:var(--muted);padding:16px 20px 7px;border-bottom:1px solid var(--border)}
.sv-item{display:grid;grid-template-columns:10px minmax(0,1fr) auto;gap:3px 10px;padding:11px 20px 12px 12px;border-bottom:1px solid var(--border);position:relative}
.sv-item .u{display:block;width:7px;height:7px;border-radius:50%;background:var(--primary);margin-top:7px}
.sv-item.on{background:color-mix(in oklab,var(--primary) 8%,var(--bg))}
.sv-item.on::before{content:"";position:absolute;left:0;top:0;bottom:0;width:2px;background:var(--primary)}
.sv-t{font-weight:600;font-size:13.5px}
.sv-item.read .sv-t{font-weight:500}
.sv-snip{grid-column:2/4;color:var(--muted);font-size:12.5px;line-height:1.45;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden}
.sv-meta{grid-column:2/4;display:flex;align-items:center;gap:8px;font-size:11.5px;color:var(--muted)}
.sv-st{display:inline-flex;align-items:center;gap:5px;font-size:11.5px;font-weight:500;white-space:nowrap}
.sv-st i{width:6px;height:6px;border-radius:50%;background:var(--muted)}
.sv-st.rev i{background:var(--accent)}
.sv-st.dr i{background:transparent;border:1.5px solid var(--muted)}
.sv-st.ok i{background:var(--primary)}
.sv-ib{width:32px;height:32px;display:grid;place-items:center;border-radius:var(--radius);color:var(--muted);flex:none}
.sv-tabs{display:flex;gap:18px;font-size:13px;font-weight:500;color:var(--muted)}
.sv-tabs span{padding:0 0 9px;border-bottom:2px solid transparent;white-space:nowrap}
.sv-tabs span.on{color:var(--text);border-bottom-color:var(--text)}
.sv-cb{width:16px;height:16px;border-radius:4px;border:1.5px solid color-mix(in oklab,var(--text) 30%,var(--bg));display:grid;place-items:center;flex:none;margin-top:2px}
.sv-cb.on{background:var(--text);border-color:var(--text);color:var(--bg)}
.sv-prose{font-size:14.5px;line-height:1.7;color:color-mix(in oklab,var(--text) 88%,var(--bg))}
.sv-act{display:grid;grid-template-columns:24px 1fr;gap:10px;padding:13px 0;border-bottom:1px solid var(--border);font-size:13px;line-height:1.5}
.sv-av{width:24px;height:24px;border-radius:50%;display:grid;place-items:center;font:600 9.5px var(--font-b);background:color-mix(in oklab,var(--primary) 16%,var(--bg));color:color-mix(in oklab,var(--primary) 78%,var(--text));flex:none}
.sv-kbd{display:inline-grid;place-items:center;min-width:18px;height:18px;padding:0 4px;border:1px solid var(--border);border-radius:4px;font:500 10.5px var(--font-b);color:var(--muted)}
</style>`;
const PEOPLE = { TR: "Teodora Ruiz", SA: "Sam Achebe", LP: "Lin Park", PN: "Priya Nair", JW: "Jonah Weiss", MO: "Mara Okafor" };
const ST = { rev: "In review", dr: "Draft", ok: "Approved", pub: "Published" };
const DOCS = [
  ["Today", [
    ["Q4 launch checklist — Juniper Bakery", "Moved the print proofs to Thursday. Need sign-off on the menu card copy before Sam sends files to the printer.", "TR", "10:42", "rev", 1, 3, "Clients / Juniper Bakery"],
    ["Freelancer onboarding guide", "Added the invoicing section, the new NDA template and who approves expenses over $500.", "SA", "9:15", "dr", 1, 1, "Studio / Handbook"],
    ["Weekly sync notes — 3 Nov", "Decisions: pause the Ostrava retainer renewal until January; Lin owns the Palo Verde handoff.", "LP", "8:30", "ok", 0, 0, "Team / Meetings"],
  ]],
  ["Yesterday", [
    ["Brand voice: product descriptions", "Shorter openers. Lead with what it’s for, not what it’s made of. Two examples per category.", "PN", "4:58 PM", "rev", 1, 5, "Clients / Juniper Supply"],
    ["Client feedback, round 2 — Palo Verde", "Mostly typographic: headline size on mobile, the footer contrast and the order of case studies.", "JW", "2:10 PM", "ok", 0, 2, "Clients / Palo Verde Co."],
    ["Holiday cover rota", "Who’s around 22 Dec – 2 Jan, plus the on-call phone handover and the out-of-office copy.", "MO", "11:20 AM", "pub", 0, 0, "Team / Ops"],
  ]],
  ["Earlier this week", [
    ["Pricing page copy, v3", "Dropped the comparison table below the fold and rewrote the FAQ about seats.", "PN", "Sun", "dr", 0, 4, "Website"],
    ["Retro — October sprint", "What slowed us down: late briefs, two rounds of unplanned revisions, unclear owners on QA.", "LP", "Sat", "pub", 0, 7, "Team / Meetings"],
    ["Studio handbook: expenses", "Receipts within 14 days. Software over $50 a month needs a quick note in #ops first.", "MO", "Fri", "pub", 0, 0, "Studio / Handbook"],
  ]],
];
const svItem = ([t, s, who, when, stt, unread, cm], sel, mobile) => `<div class="sv-item${sel ? " on" : ""}${unread ? "" : " read"}"${mobile ? ' style="padding:11px 20px 12px 10px"' : ""}><span>${unread ? '<span class="u"></span>' : ""}</span><span class="sv-t sv-ell">${t}</span><span class="muted" style="font-size:11.5px;white-space:nowrap">${when}</span>
<span class="sv-snip">${s}</span>
<span class="sv-meta"><span class="sv-st ${stt}"><i></i>${ST[stt]}</span><span>·</span><span class="sv-ell">${PEOPLE[who]}</span>${cm ? `<span class="sv-row" style="gap:3px;margin-left:auto">${ic("chat", 12)}${cm}</span>` : ""}</span></div>`;

const svSide = (p) => sideNav(p, "Docs", [["inbox", "Inbox"], ["check", "My tasks"], ["grid", "Projects"], ["doc", "Docs"], ["folder", "Files"], ["users", "Team"], ["gear", "Settings"]]);
const CHECK = [[1, "Final menu prices, incl. seasonal loaves", "LP", "Done"], [1, "Photo selects, 12 hero + 30 product", "JW", "Done"], [0, "Menu card copy sign-off", "TR", "Due Wed"], [0, "Print proofs to Hollis Press", "SA", "Due Thu"], [0, "Window decal sizes confirmed on site", "MO", "Due Fri"]];
const ACT = [
  ["TR", "<b>Teodora Ruiz</b> edited <span style=\"text-decoration:underline;text-decoration-color:var(--border);text-underline-offset:3px\">Before print</span>", "10:42"],
  ["SA", "<b>Sam Achebe</b> commented", "10:20", "Proofs look good. One bleed issue on page 3 — the loaf photo runs 2 mm short. I’ll fix it before Thursday."],
  ["LP", "<b>Lin Park</b> checked off <i>Final menu prices</i>", "9:58"],
  ["MO", "<b>Mara Okafor</b> changed status to <span class=\"sv-st rev\"><i></i>In review</span>", "9:30"],
  ["JW", "<b>Jonah Weiss</b> commented", "Yesterday", "Juniper asked if the decal can say “Open from 7” instead of the full hours."],
];

TPL["split-view/web"] = (p, st) => `${SV_CSS}<div class="shell">${svSide(p)}<main class="main" style="display:grid;grid-template-columns:384px minmax(0,1fr);height:100%">
<section style="border-right:1px solid var(--border);display:flex;flex-direction:column;min-height:0;overflow:hidden">
<div style="padding:18px 20px 0;display:grid;gap:12px;flex:none"><div class="sv-row" style="justify-content:space-between"><div class="h" style="font-size:${H(st, 22)}px">Docs</div><span class="sv-row" style="gap:2px"><span class="sv-ib">${ic("search", 17)}</span><span class="sv-ib">${ic("filter", 17)}</span><span class="btn primary" style="height:32px;padding:0 11px;margin-left:6px">${ic("plus", 15)}New</span></span></div>
<div class="sv-tabs" style="border-bottom:1px solid var(--border)">${[["All", 1], ["Unread · 3"], ["Mine"], ["Shared with me"]].map(([t, on]) => `<span class="${on ? "on" : ""}">${t}</span>`).join("")}<span class="sv-row" style="margin-left:auto;gap:4px;padding-bottom:9px;font-size:12px">${ic("list", 13)}Date${ic("chevdown", 12)}</span></div></div>
<div style="flex:1;overflow:hidden">${DOCS.map(([g, items]) => `<div class="sv-grp" style="${g === "Today" ? "padding-top:12px" : ""}"><span>${g}</span><span style="letter-spacing:0;font-weight:500">${items.length}</span></div>${items.map((d, i) => svItem(d, g === "Today" && i === 0)).join("")}`).join("")}</div></section>
<section style="display:flex;flex-direction:column;min-width:0;min-height:0;overflow:hidden">
<div class="top" style="height:58px;padding:0 28px;gap:6px"><span class="muted sv-row" style="gap:6px;font-size:13px">${ic("folder", 15)}Clients <span>/</span> Juniper Bakery</span>
<span class="sv-row" style="margin-left:auto;gap:2px"><span class="sv-ib">${ic("star", 17)}</span><span class="sv-ib">${ic("bell", 17)}</span><span class="sv-ib">${ic("link", 17)}</span><span class="sv-ib">${ic("scan_archive", 17)}</span><span class="sv-ib">${ic("more", 17)}</span><span style="width:1px;height:20px;background:var(--border);margin:0 8px"></span>
<span class="sv-row" style="margin-right:8px">${["TR", "SA", "LP"].map((a, i) => `<span class="sv-av" style="width:26px;height:26px;margin-left:${i ? -7 : 0}px;box-shadow:0 0 0 2px var(--bg)">${a}</span>`).join("")}</span><span class="btn">${ic("share", 15)}Share</span><span class="btn primary">${ic("check", 15)}Approve</span></span></div>
<div style="flex:1;display:grid;grid-template-columns:minmax(0,1fr) 300px;min-height:0">
<article style="padding:30px 44px 24px 48px;display:flex;flex-direction:column;gap:16px;min-width:0;overflow:hidden">
<div style="display:grid;gap:10px"><div class="sv-row" style="gap:12px;font-size:12.5px"><span class="sv-st rev"><i></i>In review</span><span class="muted" style="white-space:nowrap">Owner: Teodora Ruiz</span><span class="muted">·</span><span class="muted" style="white-space:nowrap">Updated today, 10:42</span><span class="muted">·</span><span class="muted" style="white-space:nowrap">6 min read</span></div>
<h1 style="font-size:${H(st, 32)}px;max-width:620px">Q4 launch checklist — Juniper Bakery</h1></div>
<p class="sv-prose" style="max-width:620px">Juniper opens its second shop on <b style="font-weight:600">Mon 17 Nov</b>. Everything printed has to be with Hollis Press by Thursday so it’s back for the install weekend. Anything not ticked below by Wednesday evening moves to the soft-launch list instead.</p>
<div style="max-width:620px"><div class="h" style="font-size:${H(st, 17)}px;padding-bottom:8px;border-bottom:1px solid var(--border)">Before print <span class="muted" style="font-family:var(--font-b);font-size:12.5px;font-weight:500;letter-spacing:0;text-transform:none">· 2 of 5 done</span></div>
${CHECK.map(([on, t, who, due]) => `<div class="sv-row" style="align-items:flex-start;gap:11px;padding:9px 0;border-bottom:1px solid var(--border);font-size:14px"><span class="sv-cb${on ? " on" : ""}">${on ? ic("check", 11) : ""}</span><span style="flex:1;${on ? "color:var(--muted);text-decoration:line-through;text-decoration-color:var(--border)" : ""}">${t}</span><span class="sv-av" style="width:22px;height:22px">${who}</span><span class="muted" style="font-size:12px;width:56px;text-align:right">${due}</span></div>`).join("")}</div>
<div style="max-width:620px;display:grid;gap:8px"><div class="h" style="font-size:${H(st, 17)}px">Launch week</div><p class="sv-prose">Soft launch for neighbours on Saturday, full opening Monday. Priya is drafting the two newsletter sends; keep the tone warm and specific — the oven, the 7 AM queue, the sourdough starter from the first shop.</p></div>
<div style="max-width:620px;border-left:2px solid var(--text);padding:2px 0 2px 16px;font-size:14px;line-height:1.6;font-style:italic" class="muted">“If the decal and the menu cards don’t match, customers notice before we do.” — Juniper, kickoff call</div>
</article>
<aside style="border-left:1px solid var(--border);padding:22px 24px 18px;display:flex;flex-direction:column;min-height:0;overflow:hidden">
<div class="sv-row" style="justify-content:space-between;padding-bottom:4px"><span style="font-weight:600">Activity</span><span class="sv-tabs" style="gap:12px;font-size:12px"><span class="on" style="padding-bottom:4px">All</span><span style="padding-bottom:4px">Comments · 3</span></span></div>
<div style="border-top:1px solid var(--border)">${ACT.map(([a, t, when, quote]) => `<div class="sv-act"><span class="sv-av">${a}</span><div style="min-width:0"><div>${t.replace(/<b>/g, '<b style="font-weight:600">')}</div><div class="muted" style="font-size:11.5px">${when}</div>${quote ? `<div style="margin-top:6px;font-size:13px;line-height:1.5">${quote}</div>` : ""}</div></div>`).join("")}</div>
<div style="margin-top:auto;padding-top:14px;display:grid;gap:8px"><div class="input" style="height:auto;min-height:64px;align-items:flex-start;padding:10px 12px;font-size:13px">Reply or @mention someone…</div><div class="sv-row muted" style="justify-content:space-between;font-size:11.5px"><span class="sv-row" style="gap:8px">${ic("scan_at", 15)}${ic("image", 15)}</span><span class="sv-row" style="gap:4px"><span class="sv-kbd">⌘</span><span class="sv-kbd">↵</span> to send</span></div></div>
</aside></div></section></main></div>`;

TPL["split-view/mobile"] = (p, st) => `${SV_CSS}<div class="phone">${status()}
<div style="padding:4px 20px 10px;display:grid;gap:12px;flex:none"><div class="sv-row" style="justify-content:space-between"><span class="sv-row" style="gap:4px;color:var(--muted);font-size:13px">${ic("back", 18)}Workspace</span><span class="sv-row" style="gap:16px">${ic("search", 21)}${ic("scan_pen", 21)}</span></div>
<div class="sv-row" style="justify-content:space-between;align-items:baseline"><h1 style="font-size:${H(st, 28)}px">Docs</h1><span class="muted" style="font-size:12.5px">3 unread · 9 this week</span></div>
<div class="sv-tabs" style="border-bottom:1px solid var(--border)">${[["All", 1], ["Unread"], ["Mine"], ["Shared"]].map(([t, on]) => `<span class="${on ? "on" : ""}">${t}</span>`).join("")}<span class="sv-row" style="margin-left:auto;gap:4px;padding-bottom:9px;font-size:12px">Date${ic("chevdown", 12)}</span></div></div>
<div style="flex:1;overflow:hidden;margin-top:-10px">${DOCS.map(([g, items]) => `<div class="sv-grp"><span>${g}</span><span style="letter-spacing:0;font-weight:500">${items.length}</span></div>${items.slice(0, g === "Earlier this week" ? 1 : 3).map((d) => svItem(d, 0, 1)).join("")}`).join("")}</div>
${tabBar("Docs", [["home", "Home"], ["doc", "Docs"], ["inbox", "Inbox"], ["users", "Team"]])}</div>`;

// =============================================================================================
module.exports = {
  "product-scan": {
    family: "beauty", name: "Product and ingredient scanner (skincare)",
    shows: "a skincare app's product scanner: a camera viewfinder with a corner-bracket frame, scan modes, zoom, flash and manual barcode entry, and the scan result with the matched product, a skin-profile compatibility verdict, key ingredients explained in plain language and a routine slot",
    elements: ["camera-viewfinder", "scan-frame", "barcode-scanner", "segmented-control", "zoom-control", "upload-dropzone", "product-card", "ingredient-list", "badge", "progress-bar", "recent-items", "button", "beauty"],
    web: TPL["product-scan/web"], mobile: TPL["product-scan/mobile"],
    variants: {
      camera: { name: "Barcode / product scanner camera view", shows: "a full-screen camera viewfinder over a blurred bathroom shelf with a rounded corner-bracket scan frame locked on a product's barcode, a 'Hold steady — scanning barcode' hint, Barcode / Ingredients label / Product photo mode pills, .5× 1× 2× zoom chips, flash toggle, close, gallery import, recent scans and a 'Type the code instead' fallback; on web, a webcam panel with a photo drop zone, barcode entry and a recent scans list" },
      result: { name: "Product scan result (ingredients and skin match)", shows: "the matched skincare product with generated bottle artwork, brand, size and match confidence, a 'Good match for combination, sensitive skin' verdict with one retinol caution, fragrance-free and other flags, 'What's inside' ingredient cards with plain-language purposes, an AM/PM routine slot, an add-to-routine button and a rescan link; on web, the paused webcam, a drop zone and barcode entry sit beside the result" },
    },
  },
  "split-view": {
    family: "workspace", name: "Master–detail split view (docs list and detail pane)",
    shows: "a calm, card-free master–detail layout: documents grouped by date in compact hairline rows with title, snippet, status, author, time, comment count and unread dots, a selected row, and a detail pane with breadcrumbs, header actions, an editorial document with a checklist and an activity rail with comments; on mobile, the grouped list screen",
    elements: ["split-view", "master-detail", "grouped-list", "list-rows", "unread-indicator", "tabs", "breadcrumbs", "toolbar", "checklist", "activity-feed", "comment-box", "tab-bar"],
    web: TPL["split-view/web"], mobile: TPL["split-view/mobile"],
  },
};
