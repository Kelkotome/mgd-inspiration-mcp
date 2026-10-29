/* MGD UI screens — shared library: styles, product families, icons, base CSS and reusable parts.
   Template modules in tpl/ build screens from these; gen.js renders them. */
// ---- Styles: token presets on top of the colour engine ------------------------------------
// Corporate dark theme: every selector scoped to the dark root so nothing leaks into light mode.
const darkSide = (open, r, close) => `${open}${r} .side{background:color-mix(in oklab,var(--primary) 18%,var(--bg))!important;color:var(--text)}` +
  `${r} .side .nav,${r} .side .muted,${r} .side .grp{color:var(--muted)}${r} .side .nav.on{background:color-mix(in oklab,var(--primary) 22%,transparent);color:var(--text)}` +
  `${r} .side .logo b{background:var(--primary)}${close}`;
const STYLES = {
  minimal: { mood: "clean", hue: 255, harmony: "analogous", hf: "Inter", bf: "Inter", hw: 600, ls: "-0.02em", radius: "8", shadows: "subtle",
    personality: ["Minimal", "Calm", "Technical"], fonts: "Inter:wght@400;500;600;700", hscale: 1 },
  editorial: { mood: "warm", hue: 28, harmony: "complementary", hf: "Instrument Serif", bf: "Inter", hw: 400, ls: "-0.01em", radius: "2", shadows: "none",
    personality: ["Editorial", "Premium", "Confident"], numRule: true, fonts: "Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600", hscale: 1.35 },
  brutalist: { mood: "contrast", hue: 95, harmony: "complementary", hf: "Space Grotesk", bf: "Space Grotesk", hw: 700, ls: "-0.03em", radius: "0", shadows: "none",
    personality: ["Bold", "Technical", "Confident"], fonts: "Space+Grotesk:wght@400;500;700", hscale: 1.05,
    css: ".card,.btn,.input,.search,.badge{border:2px solid var(--text)!important;border-radius:0!important}.card{box-shadow:5px 5px 0 var(--text)!important}.btn.primary{box-shadow:3px 3px 0 var(--text)}.badge{background:var(--accent)!important;color:var(--on-primary)!important}.side,.top,.tabs,header{border-color:var(--text)!important;border-width:2px!important}h1,.h{text-transform:uppercase}" },
  luxury: { mood: "muted", hue: 80, harmony: "analogous", hf: "Cormorant Garamond", bf: "Manrope", hw: 500, ls: "0", radius: "0", shadows: "none",
    personality: ["Premium", "Calm", "Editorial"], fonts: "Cormorant+Garamond:wght@500;600&family=Manrope:wght@400;500;600", hscale: 1.35, numRule: true,
    css: ".muted{letter-spacing:.01em}.side .grp,.badge{letter-spacing:.14em;text-transform:uppercase;font-size:10px}.btn{letter-spacing:.08em;text-transform:uppercase;font-size:11px}.card{box-shadow:none}" },
  playful: { mood: "vibrant", hue: 300, harmony: "triadic", hf: "Fredoka", bf: "Nunito", hw: 600, ls: "0", radius: "14", shadows: "medium",
    personality: ["Playful", "Friendly", "Energetic"], fonts: "Fredoka:wght@500;600&family=Nunito:wght@400;600;700", hscale: 1.05,
    css: ".btn{border-radius:999px;font-weight:700}.card{border-width:0;box-shadow:var(--shadow)}.badge{font-weight:700}" },
  corporate: { mood: "clean", hue: 230, harmony: "analogous", hf: "IBM Plex Sans", bf: "IBM Plex Sans", hw: 600, ls: "-0.01em", radius: "4", shadows: "subtle",
    personality: ["Trustworthy", "Technical", "Calm"], fonts: "IBM+Plex+Sans:wght@400;500;600", hscale: 1,
    css: ".side{background:color-mix(in oklab,var(--primary) 88%,black)!important;color:var(--on-primary)}.side .nav,.side .muted,.side .grp{color:color-mix(in oklab,var(--on-primary) 70%,transparent)}.side .nav.on{background:color-mix(in oklab,var(--on-primary) 14%,transparent);color:var(--on-primary)}.side .logo b{background:var(--on-primary)}" +
      /* dark theme: a deep brand tint instead of a bright brand-colour sidebar */
      `${darkSide('@media (prefers-color-scheme:dark){', ':root:not([data-theme="light"])', "}")}${darkSide("", ':root[data-theme="dark"]', "")}` },
  retro: { mood: "warm", hue: 20, harmony: "triadic", hf: "Fraunces", bf: "DM Sans", hw: 700, ls: "-0.02em", radius: "10", shadows: "none",
    personality: ["Warm", "Playful", "Bold"], fonts: "Fraunces:opsz,wght@9..144,600;9..144,700&family=DM+Sans:wght@400;500;700", hscale: 1.1,
    css: ".card,.btn,.input{border:2px solid var(--text)!important}.card{box-shadow:4px 4px 0 var(--primary)!important}.btn.primary{box-shadow:3px 3px 0 var(--text)}h1,.h{font-variation-settings:'SOFT' 100,'WONK' 1}" },
  monochrome: { mood: "contrast", hue: 0, harmony: "monochromatic", hf: "Geist", bf: "Geist", hw: 600, ls: "-0.03em", radius: "6", shadows: "none", mono: true,
    personality: ["Minimal", "Bold", "Technical"], fonts: "Geist:wght@400;500;600;700", hscale: 1,
    css: ".feat .btn.primary{background:var(--bg);border-color:var(--bg);color:var(--text)}" },
};

// Product families: every pattern belongs to one, so screens in a flow share the product name and palette.
const FAMILIES = {
  workspace: { name: "Fernway", cat: "productivity", desc: "a shared task, docs and files workspace for small teams", type: { web: "SaaS web app", mobile: "Mobile app" } },
  finance: { name: "Tallyfold", cat: "finance", desc: "revenue analytics for subscription businesses", type: { web: "Internal dashboard", mobile: "Mobile app" } },
  ai: { name: "Lumen Desk", cat: "ai", desc: "an AI research assistant for analysts", type: { web: "SaaS web app", mobile: "Mobile app" } },
  commerce: { name: "Juniper Supply", cat: "commerce", desc: "an online store for home and kitchen goods", type: { web: "E-commerce store", mobile: "Mobile app" } },
  media: { name: "Fieldnote", cat: "media", desc: "a photo-sharing community for travel photographers", type: { web: "SaaS web app", mobile: "Mobile app" } },
  health: { name: "Steadyfit", cat: "health", desc: "a habit and workout tracker", type: { web: "SaaS web app", mobile: "Mobile app" } },
  marketing: { name: "Patchbay", cat: "developer", desc: "API monitoring for small engineering teams", type: { web: "Marketing website", mobile: "Marketing website" } },
};

const ICON = {
  home: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.5 3.4-5.5 6.5-5.5s5.7 2 6.5 5.5M16 4.5a3.5 3.5 0 0 1 0 7M18 14.5c2 .6 3.2 2.5 3.5 5.5"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>',
  card: '<rect x="2.5" y="5" width="19" height="14" rx="2"/><path d="M2.5 10h19M6 15h4"/>',
  chat: '<path d="M4 5h16v11H9l-5 4z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/>',
  inbox: '<path d="M3 13l3-8h12l3 8v6H3zM3 13h5l1.5 2.5h5L16 13h5"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  send: '<path d="M4 12l16-8-6 16-2.5-6.5z"/>',
  bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15zM10 20.5a2 2 0 0 0 4 0"/>',
  doc: '<path d="M6 3h8l4 4v14H6zM14 3v4h4M9 12h6M9 16h6"/>',
  spark: '<path d="M12 3l1.8 5.4L19 10l-5.2 1.6L12 17l-1.8-5.4L5 10l5.2-1.6z"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
};
const ic = (n, s = 18) => `<svg class="i" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[n]}</svg>`;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
Object.assign(ICON, {
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  folder: '<path d="M3 6a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/>',
  image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/>',
  cart: '<path d="M3 4h2l2.4 11h11L21 8H6.2"/><circle cx="9" cy="19.5" r="1.3"/><circle cx="17" cy="19.5" r="1.3"/>',
  heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
  star: '<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/>',
  filter: '<path d="M4 5h16l-6 7.5V19l-4 2v-8.5z"/>',
  more: '<circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  upload: '<path d="M12 16V4M7 9l5-5 5 5M4 20h16"/>',
  download: '<path d="M12 4v12M7 11l5 5 5-5M4 20h16"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/>',
  eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.3 3 14.7 0 18M12 3c-3 3.3-3 14.7 0 18"/>',
  phone: '<rect x="7" y="2.5" width="10" height="19" rx="2"/><path d="M11 18.5h2"/>',
  play: '<path d="M7 4.5v15l12-7.5z"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  chevron: '<path d="M9 5l7 7-7 7"/>',
  chevdown: '<path d="M5 9l7 7 7-7"/>',
  grid: '<rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="4" width="7" height="7" rx="1"/><rect x="4" y="13" width="7" height="7" rx="1"/><rect x="13" y="13" width="7" height="7" rx="1"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>',
  tag: '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.3"/>',
  shield: '<path d="M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6z"/>',
  key: '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M16 7l3 3"/>',
  pin: '<path d="M12 21s-6-5.3-6-11a6 6 0 0 1 12 0c0 5.7-6 11-6 11z"/><circle cx="12" cy="10" r="2.2"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
  bookmark: '<path d="M6 3h12v18l-6-4-6 4z"/>',
  share: '<circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.2 10.8l7.6-3.6M8.2 13.2l7.6 3.6"/>',
  refresh: '<path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  minus: '<path d="M5 12h14"/>',
  bold: '<path d="M7 5h6a3.5 3.5 0 0 1 0 7H7zM7 12h7a3.5 3.5 0 0 1 0 7H7z"/>',
  italic: '<path d="M10 5h8M6 19h8M14 5l-4 14"/>',
  heading: '<path d="M6 4v16M18 4v16M6 12h12"/>',
  quote: '<path d="M7 7h4v4c0 3-2 5-4 5M14 7h4v4c0 3-2 5-4 5"/>',
});

// DESIGN.md core (for shadow presets); gen.js injects it after loading the cores.
let DM = null;
const setCore = (dm) => { DM = dm; };

// ---- Shared CSS ---------------------------------------------------------------------------
// Colour tokens for one theme (light or dark); the rest of the CSS only reads the variables.
// --ink/--on-ink: an always-dark surface (photo viewers, video stages): the text colour in light, the background in dark.
const colorVars = (t, dark) => `--ink:${dark ? t.background : t.text};--on-ink:${dark ? t.text : t.background};--bg:${t.background};--surface:${t.surface};--border:${t.border};--text:${t.text};--muted:${t.muted};--primary:${t.primary};--on-primary:${t["on-primary"]};--accent:${t.accent};`;
function baseCss(t, st, dk) {
  const r = parseInt(st.radius, 10), sh = DM.SHADOWS[st.shadows];
  const dark = dk ? `@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){${colorVars(dk, true)}color-scheme:dark}}:root[data-theme="dark"]{${colorVars(dk, true)}color-scheme:dark}\n` : "";
  return `:root{--ink:${t.text};--on-ink:${t.background};--bg:${t.background};--surface:${t.surface};--border:${t.border};--text:${t.text};--muted:${t.muted};--primary:${t.primary};--on-primary:${t["on-primary"]};--accent:${t.accent};
--radius-sm:${Math.round(r / 2)}px;--radius:${r}px;--radius-lg:${r * 2}px;--shadow-sm:${sh[0]};--shadow:${sh[1]};--shadow-lg:${sh[2]};
--font-h:"${st.hf}",Georgia,serif;--font-b:"${st.bf}",system-ui,sans-serif;--hw:${st.hw};--ls:${st.ls}}
${dark}*{box-sizing:border-box;margin:0;padding:0}
html,body{height:100%}
body{background:var(--bg);color:var(--text);font:14px/1.5 var(--font-b);-webkit-font-smoothing:antialiased}
.num{font-family:var(--font-b);font-weight:600;letter-spacing:-0.025em;line-height:1.15;font-variant-numeric:tabular-nums}
h1,h2,h3,.h{font-family:var(--font-h);font-weight:var(--hw);letter-spacing:var(--ls);line-height:1.15}
.i{flex:none}
.muted{color:var(--muted)}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;height:36px;padding:0 14px;border-radius:var(--radius);border:1px solid var(--border);background:var(--surface);color:var(--text);font:500 13px var(--font-b);white-space:nowrap}
.btn.primary{background:var(--primary);border-color:var(--primary);color:var(--on-primary)}
.btn.block{width:100%;height:42px}
.card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);box-shadow:var(--shadow-sm)}
.badge{display:inline-flex;align-items:center;height:20px;padding:0 8px;border-radius:999px;font:600 11px var(--font-b);background:color-mix(in oklab,var(--accent) 16%,var(--surface));color:color-mix(in oklab,var(--accent) 70%,var(--text))}
.field{display:grid;gap:6px}
.field label{font-weight:500;font-size:13px}
.input{height:40px;border:1px solid var(--border);border-radius:var(--radius);background:var(--surface);padding:0 12px;display:flex;align-items:center;color:var(--muted);font-size:14px}
.input.filled{color:var(--text)}
.avatar{width:28px;height:28px;border-radius:50%;display:grid;place-items:center;font:600 11px var(--font-b);background:color-mix(in oklab,var(--primary) 18%,var(--surface));color:color-mix(in oklab,var(--primary) 80%,var(--text))}
.logo{display:flex;align-items:center;gap:8px;font:600 15px var(--font-b);letter-spacing:-0.01em}
.logo b{width:22px;height:22px;border-radius:var(--radius-sm);background:var(--primary);display:inline-block}
/* web app shell */
.shell{display:grid;grid-template-columns:232px 1fr;height:100%}
.side{border-right:1px solid var(--border);padding:18px 12px;display:flex;flex-direction:column;gap:2px;background:color-mix(in oklab,var(--surface) 60%,var(--bg))}
.side .logo{padding:2px 8px 18px}
.nav{display:flex;align-items:center;gap:10px;padding:7px 8px;border-radius:var(--radius);color:var(--muted);font-weight:500}
.nav.on{background:color-mix(in oklab,var(--primary) 10%,var(--surface));color:var(--text)}
.side .grp{font:600 11px var(--font-b);text-transform:uppercase;letter-spacing:.06em;color:var(--muted);padding:16px 8px 6px}
.side .foot{margin-top:auto;display:flex;align-items:center;gap:10px;padding:8px}
.main{overflow:hidden;display:flex;flex-direction:column}
.main>.top{flex:none}
.top{height:60px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:12px;padding:0 28px}
.top .search{flex:0 1 320px;margin-left:auto;height:34px;border:1px solid var(--border);border-radius:var(--radius);display:flex;align-items:center;gap:8px;padding:0 10px;color:var(--muted);background:var(--surface)}
.page{padding:28px;display:grid;grid-template-columns:minmax(0,1fr);gap:20px;align-content:start}
.ph h1{font-size:${Math.round(26 * st.hscale)}px}
.ph p{color:var(--muted);margin-top:4px}
/* mobile frame */
.phone{height:100%;display:flex;flex-direction:column;overflow:hidden}
.status{height:44px;display:flex;align-items:center;justify-content:space-between;padding:0 24px;font:600 14px var(--font-b);flex:none}
.status span:last-child{letter-spacing:2px;font-size:11px}
.mtop{display:flex;align-items:center;justify-content:space-between;padding:6px 20px 12px;flex:none}
.mbody{flex:1;overflow:hidden;padding:4px 20px 20px;display:flex;flex-direction:column;gap:14px}
.tabs{flex:none;height:78px;border-top:1px solid var(--border);display:grid;grid-template-columns:repeat(4,1fr);padding:8px 8px 26px;background:var(--surface)}
.tabs div{display:grid;justify-items:center;gap:2px;font:500 10px var(--font-b);color:var(--muted)}
.tabs .on{color:var(--primary)}
`;
}

// ---- Shared bits --------------------------------------------------------------------------
const sideNav = (p, active, items) => `<aside class="side"><div class="logo"><b></b>${esc(p.name)}</div>
${items.map(([i, l]) => `<div class="nav${l === active ? " on" : ""}">${ic(i)}${l}</div>`).join("")}
<div class="foot"><div class="avatar">MO</div><div><div style="font-weight:500">Mara Okafor</div><div class="muted" style="font-size:12px">Admin</div></div></div></aside>`;
const status = () => `<div class="status"><span>9:41</span><span>●●● ▮</span></div>`;
const tabBar = (active, items) => `<nav class="tabs">${items.map(([i, l]) => `<div class="${l === active ? "on" : ""}">${ic(i, 22)}${l}</div>`).join("")}</nav>`;

function series(rnd, n, base, drift) { const a = []; let v = base; for (let i = 0; i < n; i++) { v = Math.max(base * 0.4, v + (rnd() - 0.38) * drift); a.push(v); } return a; }
function areaChart(rnd, w, h) {
  const d = series(rnd, 24, 40, 9), max = Math.max(...d) * 1.15, step = w / (d.length - 1);
  const pts = d.map((v, i) => [i * step, h - (v / max) * h]);
  const line = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  const grid = [0.25, 0.5, 0.75].map((g) => `<line x1="0" x2="${w}" y1="${h * g}" y2="${h * g}" stroke="var(--border)" stroke-dasharray="3 4"/>`).join("");
  return `<svg viewBox="0 0 ${w} ${h}" width="100%" height="${h}" preserveAspectRatio="none">${grid}<path d="${line} L${w} ${h} L0 ${h}Z" fill="color-mix(in oklab,var(--primary) 14%,transparent)"/><path d="${line}" fill="none" stroke="var(--primary)" stroke-width="2"/></svg>`;
}
function bars(rnd, n, h) {
  const d = Array.from({ length: n }, () => 0.3 + rnd() * 0.7);
  return `<div style="display:flex;align-items:flex-end;gap:6px;height:${h}px">${d.map((v, i) => `<div style="flex:1;height:${Math.round(v * 100)}%;border-radius:var(--radius-sm) var(--radius-sm) 0 0;background:${i === n - 1 ? "var(--accent)" : "color-mix(in oklab,var(--primary) 70%,var(--surface))"}"></div>`).join("")}</div>`;
}


module.exports = { setCore, STYLES, FAMILIES, ICON, ic, esc, baseCss, sideNav, status, tabBar, series, areaChart, bars };
