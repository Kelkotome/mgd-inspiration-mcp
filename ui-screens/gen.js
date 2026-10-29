#!/usr/bin/env node
/* MGD UI screens — pilot generator. Original screens only (no real-app content).
   For each pattern × platform × style: index.html (self-contained), DESIGN.md (tokens), meta.json.
   Colours come from color-roles-core.js and DESIGN.md from design-md-core.js, so the
   screens, the website tools and the MCP all share one design engine.
   Usage: node gen.js [--all]   (default = pilot set from taxonomy.json) */
const fs = require("fs"), path = require("path"), vm = require("vm");

const ROOT = __dirname, CORES = path.join(ROOT, "../../tool-gap-2026-10/newtools");
const OUT = path.join(ROOT, "out");
const TAX = JSON.parse(fs.readFileSync(path.join(ROOT, "taxonomy.json"), "utf8"));

// Seeded Math.random so a given screen always renders the same colours and data.
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function hashStr(s) { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; }
const sandbox = { Math: Object.create(Math) };
sandbox.window = sandbox;
vm.createContext(sandbox);
for (const f of ["color-roles-core.js", "design-md-core.js"]) vm.runInContext(fs.readFileSync(path.join(CORES, f), "utf8").replace(/\}\)\((typeof window[^)]*|window|this)\);?\s*$/, "})(window);"), sandbox);
const R = sandbox.MGDRoles, DM = sandbox.MGDDesignMd;
if (!R || !DM) throw new Error("cores did not load");

// ---- Styles: token presets on top of the colour engine ------------------------------------
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
    css: ".side{background:color-mix(in oklab,var(--primary) 88%,black)!important;color:var(--on-primary)}.side .nav,.side .muted,.side .grp{color:color-mix(in oklab,var(--on-primary) 70%,transparent)}.side .nav.on{background:color-mix(in oklab,var(--on-primary) 14%,transparent);color:var(--on-primary)}.side .logo b{background:var(--on-primary)}" },
  retro: { mood: "warm", hue: 20, harmony: "triadic", hf: "Fraunces", bf: "DM Sans", hw: 700, ls: "-0.02em", radius: "10", shadows: "none",
    personality: ["Warm", "Playful", "Bold"], fonts: "Fraunces:opsz,wght@9..144,600;9..144,700&family=DM+Sans:wght@400;500;700", hscale: 1.1,
    css: ".card,.btn,.input{border:2px solid var(--text)!important}.card{box-shadow:4px 4px 0 var(--primary)!important}.btn.primary{box-shadow:3px 3px 0 var(--text)}h1,.h{font-variation-settings:'SOFT' 100,'WONK' 1}" },
  monochrome: { mood: "contrast", hue: 0, harmony: "monochromatic", hf: "Geist", bf: "Geist", hw: 600, ls: "-0.03em", radius: "6", shadows: "none", mono: true,
    personality: ["Minimal", "Bold", "Technical"], fonts: "Geist:wght@400;500;600;700", hscale: 1,
    css: ".feat .btn.primary{background:var(--bg);border-color:var(--bg);color:var(--text)}" },
};

// Fictional products, one per pattern, so every screen has believable, original copy.
const PRODUCTS = {
  "dashboard": { name: "Tallyfold", cat: "finance", desc: "revenue analytics for subscription businesses" },
  "billing-plans": { name: "Quillstack", cat: "saas", desc: "a writing workspace for content teams" },
  "login": { name: "Harbourline", cat: "productivity", desc: "project planning for agencies" },
  "chat-ai-assistant": { name: "Lumen Desk", cat: "ai", desc: "an AI research assistant for analysts" },
  "empty-state": { name: "Fernway", cat: "productivity", desc: "a shared task inbox for small teams" },
  "pricing": { name: "Patchbay", cat: "developer", desc: "API monitoring for small engineering teams" },
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

// ---- Shared CSS ---------------------------------------------------------------------------
function baseCss(t, st) {
  const r = parseInt(st.radius, 10), sh = DM.SHADOWS[st.shadows];
  return `:root{--bg:${t.background};--surface:${t.surface};--border:${t.border};--text:${t.text};--muted:${t.muted};--primary:${t.primary};--on-primary:${t["on-primary"]};--accent:${t.accent};
--radius-sm:${Math.round(r / 2)}px;--radius:${r}px;--radius-lg:${r * 2}px;--shadow-sm:${sh[0]};--shadow:${sh[1]};--shadow-lg:${sh[2]};
--font-h:"${st.hf}",Georgia,serif;--font-b:"${st.bf}",system-ui,sans-serif;--hw:${st.hw};--ls:${st.ls}}
*{box-sizing:border-box;margin:0;padding:0}
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
.top{height:60px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:12px;padding:0 28px}
.top .search{flex:0 1 320px;margin-left:auto;height:34px;border:1px solid var(--border);border-radius:var(--radius);display:flex;align-items:center;gap:8px;padding:0 10px;color:var(--muted);background:var(--surface)}
.page{padding:28px;display:grid;gap:20px;align-content:start}
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

// ---- Templates: (p, st, rnd) -> body html -------------------------------------------------
const NAV_WEB = [["home", "Overview"], ["chart", "Reports"], ["users", "Customers"], ["card", "Billing"], ["gear", "Settings"]];
const TPL = {};

TPL["dashboard/web"] = (p, st, rnd) => {
  const kpi = [["MRR", "$84,210", "+6.2%"], ["Active subscribers", "3,918", "+148"], ["Churn", "2.1%", "−0.3 pts"], ["ARPU", "$21.49", "+$0.84"]];
  const rows = [["Juniper Bakery", "Growth", "$129", "Active"], ["Ostrava Labs", "Scale", "$499", "Active"], ["Palo Verde Co.", "Starter", "$29", "Trial"], ["Brightwell Studio", "Growth", "$129", "Past due"], ["Kettle & Fern", "Scale", "$499", "Active"]];
  return `<div class="shell">${sideNav(p, "Overview", NAV_WEB)}<main class="main">
<div class="top"><div class="h" style="font-size:${Math.round(15 * st.hscale)}px">Overview</div><div class="search">${ic("search", 16)}Search customers, invoices…</div><button class="btn">${ic("bell", 16)}</button><button class="btn primary">${ic("plus", 16)}New report</button></div>
<div class="page"><div class="ph" style="display:flex;align-items:end;justify-content:space-between"><div><h1>Good morning, Mara</h1><p>Here’s how subscriptions moved in the last 30 days.</p></div><div style="display:flex;gap:6px"><span class="btn">Last 30 days</span><span class="btn">Export</span></div></div>
<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px">${kpi.map(([l, v, d]) => `<div class="card" style="padding:16px"><div class="muted" style="font-size:12px;font-weight:500">${l}</div><div class="num" style="font-size:26px;margin:6px 0 4px">${v}</div><span class="badge">${d}</span></div>`).join("")}</div>
<div style="display:grid;grid-template-columns:2fr 1fr;gap:16px"><div class="card" style="padding:18px"><div style="display:flex;justify-content:space-between;margin-bottom:12px"><div><div style="font-weight:600">Monthly recurring revenue</div><div class="muted" style="font-size:12px">Daily, all plans</div></div><span class="badge">+6.2%</span></div>${areaChart(rnd, 600, 170)}</div>
<div class="card" style="padding:18px"><div style="font-weight:600">New subscribers</div><div class="muted" style="font-size:12px;margin-bottom:14px">By week</div>${bars(rnd, 8, 150)}</div></div>
<div class="card" style="overflow:hidden"><div style="padding:14px 18px;font-weight:600;border-bottom:1px solid var(--border)">Recent customers</div>
<table style="width:100%;border-collapse:collapse;font-size:13px">${[["Customer", "Plan", "Amount", "Status"], ...rows].map((r, i) => `<tr style="${i ? "border-top:1px solid var(--border)" : "background:color-mix(in oklab,var(--bg) 60%,var(--surface))"}">${r.map((c, j) => `<td style="padding:10px 18px;${i ? "" : "font-weight:600;font-size:12px;color:var(--muted)"}">${i && j === 3 ? `<span class="badge">${c}</span>` : c}</td>`).join("")}</tr>`).join("")}</table></div></div></main></div>`;
};
TPL["dashboard/mobile"] = (p, st, rnd) => `<div class="phone">${status()}<div class="mtop"><div><div class="muted" style="font-size:12px">Thursday, 30 Oct</div><h1 style="font-size:${Math.round(24 * st.hscale)}px">Overview</h1></div><div class="avatar" style="width:36px;height:36px">MO</div></div>
<div class="mbody"><div class="card" style="padding:16px"><div class="muted" style="font-size:12px;font-weight:500">Monthly recurring revenue</div><div style="display:flex;align-items:baseline;gap:8px;margin:4px 0 10px"><div class="num" style="font-size:30px">$84,210</div><span class="badge">+6.2%</span></div>${areaChart(rnd, 320, 110)}</div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">${[["Subscribers", "3,918"], ["Churn", "2.1%"]].map(([l, v]) => `<div class="card" style="padding:14px"><div class="muted" style="font-size:12px">${l}</div><div class="num" style="font-size:22px;margin-top:4px">${v}</div></div>`).join("")}</div>
<div style="display:flex;justify-content:space-between;align-items:center"><div style="font-weight:600">Recent activity</div><span class="muted" style="font-size:13px">See all</span></div>
<div class="card">${[["Juniper Bakery", "Upgraded to Growth", "+$100"], ["Ostrava Labs", "Renewed Scale", "$499"], ["Palo Verde Co.", "Started a trial", "—"]].map(([n, a, v], i) => `<div style="display:flex;align-items:center;gap:12px;padding:12px 14px;${i ? "border-top:1px solid var(--border)" : ""}"><div class="avatar">${n.split(" ").map((w) => w[0]).join("").slice(0, 2)}</div><div style="flex:1"><div style="font-weight:500">${n}</div><div class="muted" style="font-size:12px">${a}</div></div><div style="font-weight:600">${v}</div></div>`).join("")}</div></div>
${tabBar("Home", [["home", "Home"], ["chart", "Reports"], ["users", "Customers"], ["gear", "Settings"]])}</div>`;

const PLANS = [["Starter", "$9", "For one writer getting organised", ["1 workspace", "5 GB storage", "Version history (7 days)"]],
  ["Team", "$24", "For content teams shipping weekly", ["Unlimited workspaces", "Review and approvals", "Version history (1 year)", "Brand voice checks"]],
  ["Enterprise", "Custom", "For organisations with compliance needs", ["SSO and SCIM", "Audit log export", "Dedicated success manager"]]];
TPL["billing-plans/web"] = (p, st) => `<div class="shell">${sideNav(p, "Billing", [["doc", "Documents"], ["users", "Team"], ["card", "Billing"], ["bell", "Notifications"], ["gear", "Settings"]])}<main class="main">
<div class="top"><div class="muted">Settings</div><span class="muted">/</span><div style="font-weight:500">Billing</div></div>
<div class="page" style="max-width:1080px"><div class="ph"><h1>Billing and plans</h1><p>Manage your plan, seats and invoices. Changes take effect immediately.</p></div>
<div class="card" style="padding:18px;display:grid;grid-template-columns:1.4fr 1fr 1fr 1fr auto;gap:18px;align-items:center"><div><div class="muted" style="font-size:12px">Current plan</div><div style="font-weight:600;font-size:16px;display:flex;gap:8px;align-items:center">Team <span class="badge">Annual</span></div></div><div><div class="muted" style="font-size:12px">Seats</div><div style="font-weight:600">8 of 10 used</div></div><div><div class="muted" style="font-size:12px">Next invoice</div><div style="font-weight:600">$2,304 · 14 Jan</div></div><div><div class="muted" style="font-size:12px">Payment</div><div style="font-weight:600">Visa ·· 4242</div></div><button class="btn">Manage seats</button></div>
<div style="display:flex;justify-content:space-between;align-items:center"><div class="h" style="font-size:${Math.round(18 * st.hscale)}px">Change plan</div><div class="card" style="display:flex;padding:3px;border-radius:999px;font-size:12px;font-weight:500"><span style="padding:4px 12px">Monthly</span><span style="padding:4px 12px;border-radius:999px;background:var(--primary);color:var(--on-primary)">Yearly · save 20%</span></div></div>
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px">${PLANS.map(([n, pr, d, f], i) => `<div class="card" style="padding:20px;display:flex;flex-direction:column;gap:12px;${i === 1 ? "border-color:var(--primary);box-shadow:0 0 0 1px var(--primary),var(--shadow)" : ""}"><div style="display:flex;justify-content:space-between"><div style="font-weight:600">${n}</div>${i === 1 ? '<span class="badge">Current plan</span>' : ""}</div><div><span class="num" style="font-size:30px">${pr}</span>${pr[0] === "$" ? '<span class="muted"> / seat / month</span>' : ""}</div><div class="muted">${d}</div><div style="display:grid;gap:7px;font-size:13px">${f.map((x) => `<div style="display:flex;gap:8px;align-items:center"><span style="color:var(--primary)">${ic("check", 16)}</span>${x}</div>`).join("")}</div><button class="btn${i === 2 ? " primary" : ""} block" style="margin-top:auto${i === 1 ? ";background:color-mix(in oklab,var(--primary) 10%,var(--surface));border-color:transparent;color:var(--muted)" : ""}"${i === 1 ? " disabled" : ""}>${i === 0 ? "Downgrade" : i === 1 ? "Your plan" : "Talk to sales"}</button></div>`).join("")}</div>
<div class="card" style="overflow:hidden"><div style="padding:14px 18px;font-weight:600;border-bottom:1px solid var(--border)">Invoices</div>${[["14 Oct 2026", "INV-2041", "$192.00"], ["14 Sep 2026", "INV-1987", "$192.00"]].map(([d, n, a]) => `<div style="display:grid;grid-template-columns:1fr 1fr 1fr auto;padding:11px 18px;border-top:1px solid var(--border);font-size:13px"><span>${d}</span><span class="muted">${n}</span><span>${a} <span class="badge">Paid</span></span><span style="color:var(--primary);font-weight:500">Download</span></div>`).join("")}</div></div></main></div>`;
TPL["billing-plans/mobile"] = (p, st) => `<div class="phone">${status()}<div class="mtop">${ic("back", 22)}<div style="font-weight:600">Billing</div><span style="width:22px"></span></div>
<div class="mbody"><div class="card" style="padding:16px;display:grid;gap:10px"><div style="display:flex;justify-content:space-between"><div><div class="muted" style="font-size:12px">Current plan</div><div class="num" style="font-size:22px">Team</div></div><span class="badge">Annual</span></div><div style="display:flex;justify-content:space-between;font-size:13px"><span class="muted">Seats</span><span>8 of 10 used</span></div><div style="height:6px;border-radius:9px;background:color-mix(in oklab,var(--primary) 14%,var(--surface))"><div style="width:80%;height:100%;border-radius:9px;background:var(--primary)"></div></div><div style="display:flex;justify-content:space-between;font-size:13px"><span class="muted">Next invoice</span><span>$2,304 · 14 Jan</span></div></div>
<div style="font-weight:600;margin-top:4px">Change plan</div>
${PLANS.map(([n, pr, d], i) => `<div class="card" style="padding:14px 16px;display:flex;align-items:center;gap:12px;${i === 1 ? "border-color:var(--primary);box-shadow:0 0 0 1px var(--primary)" : ""}"><div style="width:20px;height:20px;border-radius:50%;border:2px solid ${i === 1 ? "var(--primary)" : "var(--border)"};display:grid;place-items:center">${i === 1 ? '<div style="width:10px;height:10px;border-radius:50%;background:var(--primary)"></div>' : ""}</div><div style="flex:1"><div style="font-weight:600">${n}</div><div class="muted" style="font-size:12px">${d}</div></div><div style="font-weight:600">${pr}${pr[0] === "$" ? '<span class="muted" style="font-weight:400;font-size:12px">/mo</span>' : ""}</div></div>`).join("")}
<div class="card" style="padding:14px 16px;display:flex;align-items:center;gap:12px">${ic("card", 20)}<div style="flex:1"><div style="font-weight:500">Visa ·· 4242</div><div class="muted" style="font-size:12px">Expires 08/28</div></div><span style="color:var(--primary);font-weight:500">Edit</span></div>
<button class="btn primary block" style="margin-top:auto">Keep Team plan</button></div></div>`;

const loginForm = (st, big) => `<div style="display:grid;gap:16px"><div><h1 style="font-size:${Math.round((big ? 30 : 26) * st.hscale)}px">Welcome back</h1><p class="muted" style="margin-top:6px">Sign in to pick up where your team left off.</p></div>
<button class="btn block">${'<svg width="16" height="16" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 12h8" stroke="currentColor" stroke-width="2"/></svg>'}Continue with Google</button>
<div style="display:flex;align-items:center;gap:10px;color:var(--muted);font-size:12px"><span style="flex:1;height:1px;background:var(--border)"></span>or with email<span style="flex:1;height:1px;background:var(--border)"></span></div>
<div class="field"><label>Work email</label><div class="input filled">mara@juniperbakery.co</div></div>
<div class="field"><label style="display:flex;justify-content:space-between">Password <span style="color:var(--primary);font-weight:500">Forgot?</span></label><div class="input filled" style="letter-spacing:3px">••••••••••</div></div>
<label style="display:flex;gap:8px;align-items:center;font-size:13px"><span style="width:16px;height:16px;border-radius:4px;background:var(--primary);color:var(--on-primary);display:grid;place-items:center">${ic("check", 12)}</span>Keep me signed in for 30 days</label>
<button class="btn primary block">Sign in</button><p class="muted" style="text-align:center;font-size:13px">New to Harbourline? <span style="color:var(--primary);font-weight:500">Create an account</span></p></div>`;
TPL["login/web"] = (p, st, rnd) => `<div style="display:grid;grid-template-columns:1fr 1fr;height:100%"><div style="display:flex;flex-direction:column;padding:32px 56px"><div class="logo"><b></b>${p.name}</div><div style="margin:auto 0;max-width:380px;width:100%;align-self:center">${loginForm(st, true)}</div><div class="muted" style="font-size:12px">© 2026 ${p.name} · Privacy · Terms</div></div>
<div style="background:var(--primary);color:var(--on-primary);padding:56px;display:flex;flex-direction:column;justify-content:space-between;position:relative;overflow:hidden">
<svg style="position:absolute;right:-80px;top:-60px;opacity:.18" width="520" height="520" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width=".4">${Array.from({ length: 9 }, (_, i) => `<circle cx="50" cy="50" r="${6 + i * 5.5}"/>`).join("")}</svg>
<div class="badge" style="background:color-mix(in oklab,var(--on-primary) 16%,transparent);color:var(--on-primary);align-self:flex-start">New · Resource planning</div>
<div><div class="h" style="font-size:${Math.round(38 * st.hscale)}px;max-width:460px">“We stopped double-booking designers the week we switched.”</div><div style="margin-top:18px;opacity:.85">Teodora Ruiz — Studio lead, Palo Verde Co.</div>
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:40px;border-top:1px solid color-mix(in oklab,var(--on-primary) 25%,transparent);padding-top:20px">${[["1,200+", "agencies"], ["38%", "fewer overruns"], ["4.8/5", "average rating"]].map(([a, b]) => `<div><div class="num" style="font-size:24px">${a}</div><div style="opacity:.8;font-size:13px">${b}</div></div>`).join("")}</div></div></div></div>`;
TPL["login/mobile"] = (p, st) => `<div class="phone">${status()}<div class="mbody" style="padding-top:28px;gap:28px"><div class="logo"><b></b>${p.name}</div>${loginForm(st, false)}</div></div>`;

const CHAT = [["user", "Summarise what changed in the Q3 churn numbers versus Q2, and flag anything unusual."],
  ["ai", "Q3 churn fell to <b>2.1%</b> from 2.6% in Q2. Most of the drop came from the Growth plan after annual billing launched in July.", ["Growth plan churn: 3.4% → 2.2%", "Starter plan churn barely moved (4.1% → 4.0%)", "Unusual: 11 Scale accounts cancelled in one week of August — all on the same reseller contract"]],
  ["user", "Draft a short note to the account team about the reseller cancellations."]];
const chatMsgs = (st, w) => CHAT.map(([who, t, list]) => who === "user"
  ? `<div style="align-self:flex-end;max-width:${w};background:var(--primary);color:var(--on-primary);padding:10px 14px;border-radius:var(--radius-lg) var(--radius-lg) var(--radius-sm) var(--radius-lg)">${t}</div>`
  : `<div style="display:flex;gap:10px;max-width:${w === "78%" ? "88%" : "100%"}"><div class="avatar" style="background:var(--accent);color:var(--on-primary)">${ic("spark", 14)}</div><div class="card" style="padding:12px 14px;display:grid;gap:8px"><div>${t}</div><ul style="padding-left:18px;display:grid;gap:4px">${list.map((x) => `<li>${x}</li>`).join("")}</ul><div style="display:flex;gap:6px;flex-wrap:wrap">${["Q3 churn.csv", "Plans dashboard"].map((s) => `<span class="badge" style="gap:4px">${ic("doc", 12)}${s}</span>`).join("")}</div></div></div>`).join("") +
  `<div style="display:flex;gap:10px"><div class="avatar" style="background:var(--accent);color:var(--on-primary)">${ic("spark", 14)}</div><div class="card" style="padding:12px 14px;display:flex;gap:5px">${[1, 0.6, 0.3].map((o) => `<span style="width:7px;height:7px;border-radius:50%;background:var(--muted);opacity:${o}"></span>`).join("")}</div></div>`;
const composer = (st) => `<div class="card" style="padding:10px 10px 10px 14px;display:flex;align-items:center;gap:10px;box-shadow:var(--shadow)"><span class="muted" style="flex:1">Ask a follow-up…</span><span class="btn" style="height:30px;padding:0 10px">${ic("doc", 14)}Attach</span><span class="btn primary" style="width:34px;padding:0">${ic("send", 16)}</span></div>`;
TPL["chat-ai-assistant/web"] = (p, st) => `<div class="shell" style="grid-template-columns:260px 1fr"><aside class="side"><div class="logo"><b></b>${p.name}</div><button class="btn primary block" style="margin-bottom:10px">${ic("plus", 16)}New chat</button><div class="grp">Today</div>
${["Q3 churn review", "Reseller contract terms", "Board deck: retention slide"].map((t, i) => `<div class="nav${i ? "" : " on"}">${ic("chat", 16)}${t}</div>`).join("")}<div class="grp">Previous 7 days</div>${["Pricing test readout", "Cohort definitions", "Survey themes, August"].map((t) => `<div class="nav">${ic("chat", 16)}${t}</div>`).join("")}
<div class="foot"><div class="avatar">MO</div><div style="font-weight:500">Mara Okafor</div></div></aside>
<main class="main"><div class="top"><div style="font-weight:600">Q3 churn review</div><span class="badge">3 sources</span><span class="btn" style="margin-left:auto">Share</span></div>
<div style="flex:1;display:flex;flex-direction:column;gap:16px;padding:28px max(28px,calc(50% - 380px));overflow:hidden">${chatMsgs(st, "78%")}</div>
<div style="padding:0 max(28px,calc(50% - 380px)) 24px">${composer(st)}<div class="muted" style="text-align:center;font-size:12px;margin-top:8px">Answers cite your workspace files. Check figures before sharing.</div></div></main></div>`;
TPL["chat-ai-assistant/mobile"] = (p, st) => `<div class="phone">${status()}<div class="mtop" style="border-bottom:1px solid var(--border)">${ic("menu", 22)}<div style="text-align:center"><div style="font-weight:600">Q3 churn review</div><div class="muted" style="font-size:11px">${p.name}</div></div>${ic("plus", 22)}</div>
<div class="mbody" style="padding-top:16px;font-size:14px">${chatMsgs(st, "85%")}</div><div style="padding:10px 16px 30px;flex:none">${composer(st)}</div></div>`;

const emptyArt = () => `<svg width="168" height="120" viewBox="0 0 168 120" fill="none"><rect x="24" y="22" width="120" height="84" rx="10" fill="var(--surface)" stroke="var(--border)"/><rect x="38" y="38" width="56" height="8" rx="4" fill="color-mix(in oklab,var(--primary) 25%,var(--surface))"/><rect x="38" y="54" width="92" height="6" rx="3" fill="var(--border)"/><rect x="38" y="66" width="74" height="6" rx="3" fill="var(--border)"/><circle cx="126" cy="30" r="16" fill="var(--accent)"/><path d="M119 30l5 5 9-9" stroke="var(--on-primary)" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>`;
const emptyBody = (st, small) => `<div style="display:grid;justify-items:center;gap:14px;text-align:center;max-width:420px">${emptyArt()}<h2 style="font-size:${Math.round((small ? 22 : 26) * st.hscale)}px">Inbox zero. Nicely done.</h2><p class="muted">New requests from your team land here. Forward an email to <b style="color:var(--text)">tasks@fernway.app</b> or create one yourself.</p>
<div style="display:flex;gap:8px;${small ? "flex-direction:column;width:100%" : ""}"><button class="btn primary${small ? " block" : ""}">${ic("plus", 16)}New task</button><button class="btn${small ? " block" : ""}">Connect email</button></div></div>`;
TPL["empty-state/web"] = (p, st) => `<div class="shell">${sideNav(p, "Inbox", [["inbox", "Inbox"], ["check", "My tasks"], ["users", "Team"], ["chart", "Insights"], ["gear", "Settings"]])}<main class="main">
<div class="top"><div class="h" style="font-size:${Math.round(15 * st.hscale)}px">Inbox</div><div style="display:flex;gap:4px;margin-left:16px">${["Open · 0", "Snoozed · 2", "Done"].map((t, i) => `<span class="btn" style="height:30px;${i ? "border-color:transparent;background:none;color:var(--muted)" : ""}">${t}</span>`).join("")}</div><div class="search">${ic("search", 16)}Search tasks</div></div>
<div style="flex:1;display:grid;place-items:center">${emptyBody(st, false)}</div></main></div>`;
TPL["empty-state/mobile"] = (p, st) => `<div class="phone">${status()}<div class="mtop"><h1 style="font-size:${Math.round(26 * st.hscale)}px">Inbox</h1>${ic("search", 22)}</div><div class="mbody" style="justify-content:center;align-items:center">${emptyBody(st, true)}</div>
${tabBar("Inbox", [["inbox", "Inbox"], ["check", "Tasks"], ["users", "Team"], ["gear", "Settings"]])}</div>`;

const TIERS = [["Hobby", "$0", "For side projects", ["3 monitors", "5-minute checks", "Email alerts"], "Start free"],
  ["Team", "$49", "For teams on call", ["50 monitors", "30-second checks", "Slack and PagerDuty alerts", "Status page"], "Start 14-day trial"],
  ["Scale", "$199", "For multi-region APIs", ["500 monitors", "10 regions", "SLA reports", "SSO"], "Contact sales"]];
TPL["pricing/web"] = (p, st) => `<div style="height:100%;display:flex;flex-direction:column"><header style="display:flex;align-items:center;gap:28px;padding:18px 64px;border-bottom:1px solid var(--border)"><div class="logo"><b></b>${p.name}</div>${["Product", "Docs", "Pricing", "Changelog"].map((t) => `<span style="${t === "Pricing" ? "font-weight:600" : "color:var(--muted)"}">${t}</span>`).join("")}<span style="margin-left:auto" class="muted">Log in</span><button class="btn primary">Start free</button></header>
<section style="padding:56px 64px;display:grid;gap:36px;justify-items:center"><div style="text-align:center;display:grid;gap:12px;justify-items:center"><span class="badge">Pricing</span><h1 style="font-size:${Math.round(44 * st.hscale)}px;max-width:640px">Know your API is down before your customers do</h1><p class="muted" style="font-size:16px">Simple plans. No per-seat fees. Cancel any time.</p></div>
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px;width:100%;max-width:1080px">${TIERS.map(([n, pr, d, f, cta], i) => `<div class="card${i === 1 ? " feat" : ""}" style="padding:26px;display:flex;flex-direction:column;gap:14px;${i === 1 ? "background:var(--text);color:var(--bg);border-color:var(--text)" : ""}"><div style="display:flex;justify-content:space-between;align-items:center"><div style="font-weight:600;font-size:16px">${n}</div>${i === 1 ? '<span class="badge" style="background:var(--accent);color:var(--on-primary)">Most popular</span>' : ""}</div><div><span class="num" style="font-size:40px">${pr}</span><span style="opacity:.7"> / month</span></div><div style="opacity:.75">${d}</div><div style="display:grid;gap:9px;padding-top:14px;border-top:1px solid ${i === 1 ? "color-mix(in oklab,var(--bg) 25%,transparent)" : "var(--border)"}">${f.map((x) => `<div style="display:flex;gap:8px;align-items:center">${ic("check", 16)}${x}</div>`).join("")}</div><button class="btn block${i === 1 ? " primary" : ""}" style="margin-top:auto">${cta}</button></div>`).join("")}</div>
<p class="muted" style="font-size:13px">All plans include unlimited team members, 90-day history and two-factor sign-in.</p></section></div>`;
TPL["pricing/mobile"] = (p, st) => `<div class="phone">${status()}<header style="display:flex;align-items:center;justify-content:space-between;padding:8px 20px 14px;border-bottom:1px solid var(--border);flex:none"><div class="logo"><b></b>${p.name}</div>${ic("menu", 22)}</header>
<div class="mbody" style="padding-top:24px;gap:16px"><div style="text-align:center;display:grid;gap:10px;justify-items:center"><span class="badge">Pricing</span><h1 style="font-size:${Math.round(30 * st.hscale)}px">Know your API is down first</h1><p class="muted">No per-seat fees. Cancel any time.</p></div>
<div class="card" style="display:flex;padding:3px;border-radius:999px;font-size:13px;font-weight:500;align-self:center"><span style="padding:5px 14px">Monthly</span><span style="padding:5px 14px;border-radius:999px;background:var(--primary);color:var(--on-primary)">Yearly −20%</span></div>
${TIERS.slice(1, 2).map(([n, pr, d, f, cta]) => `<div class="card feat" style="padding:20px;display:grid;gap:12px;background:var(--text);color:var(--bg);border-color:var(--text)"><div style="display:flex;justify-content:space-between;align-items:center"><div style="font-weight:600;font-size:16px">${n}</div><span class="badge" style="background:var(--accent);color:var(--on-primary)">Most popular</span></div><div><span class="num" style="font-size:36px">${pr}</span><span style="opacity:.7"> / month</span></div><div style="display:grid;gap:8px">${f.map((x) => `<div style="display:flex;gap:8px;align-items:center">${ic("check", 16)}${x}</div>`).join("")}</div><button class="btn primary block">${cta}</button></div>`).join("")}
${[TIERS[0], TIERS[2]].map(([n, pr, d]) => `<div class="card" style="padding:14px 16px;display:flex;justify-content:space-between;align-items:center"><div><div style="font-weight:600">${n}</div><div class="muted" style="font-size:12px">${d}</div></div><div style="font-weight:600">${pr}<span class="muted" style="font-weight:400">/mo</span></div></div>`).join("")}</div></div>`;

// ---- Build ---------------------------------------------------------------------------------
const VIEWPORT = { web: [1440, 900], mobile: [390, 844] };
function buildOne(pattern, platform, styleName) {
  const st = STYLES[styleName], p = PRODUCTS[pattern], tpl = TPL[`${pattern}/${platform}`];
  if (!st || !p || !tpl) return null;
  const slug = `${pattern}-${platform}-${styleName}`, rnd = mulberry32(hashStr(slug));
  sandbox.Math.random = mulberry32(hashStr(p.name + styleName)); // same product+style → same palette on web and mobile
  const sd = R.seed({ mood: st.mood, harmony: st.harmony, hue: st.hue });
  const light = R.build(sd, "light").roles, dark = R.build(sd, "dark").roles;
  if (st.mono) for (const [t, g] of [[light, ["#ffffff", "#fafafa", "#e4e4e4", "#111111", "#666666", "#111111", "#ffffff", "#444444"]], [dark, ["#0a0a0a", "#161616", "#2c2c2c", "#f2f2f2", "#a0a0a0", "#f2f2f2", "#0a0a0a", "#c8c8c8"]]])
    R.ROLES.forEach((k, i) => { t[k] = g[i]; });
  const md = DM.build({ name: p.name, description: p.desc, productType: platform === "web" ? "SaaS web app" : "Mobile app", personality: st.personality,
    light, darkColors: dark, dark: true, headingFont: st.hf, bodyFont: st.bf, radius: st.radius, shadows: st.shadows, motion: "subtle",
    density: platform === "web" ? "comfortable" : "spacious", components: ["buttons", "forms", "cards", "nav", "tables", "badges"],
    dos: st.numRule ? DM.DEFAULT_DO + "\nUse the heading serif only for page titles and marketing headlines. Set metrics, prices, plan names and table figures in the body sans with `font-variant-numeric: tabular-nums`." : undefined });
  const [w, h] = VIEWPORT[platform];
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=${platform === "web" ? "device-width" : w},initial-scale=1">
<title>${esc(p.name)} — ${pattern.replace(/-/g, " ")} (${platform}, ${styleName}) · MGD UI screens</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=${st.fonts}&display=swap" rel="stylesheet">
<!-- Made Good Designs UI screen — original reference design, free to copy. Tokens: see DESIGN.md -->
<style>${baseCss(light, st)}${st.css || ""}</style></head><body>${tpl(p, st, rnd)}</body></html>`;
  const dir = path.join(OUT, slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), html);
  fs.writeFileSync(path.join(dir, "DESIGN.md"), md);
  const meta = { slug, type: pattern === "pricing" ? "section" : "screen", pattern, platform, style: styleName, category: p.cat, product: p.name,
    viewport: { w, h }, tokens: { light, dark }, fonts: { heading: st.hf, body: st.bf } };
  fs.writeFileSync(path.join(dir, "meta.json"), JSON.stringify(meta, null, 2));
  return meta;
}

const all = process.argv.includes("--all");
const pats = all ? Object.keys(PRODUCTS) : TAX.pilot.patterns, plats = TAX.pilot.platforms, styles = all ? Object.keys(STYLES) : TAX.pilot.styles;
const built = [];
for (const pa of pats) for (const pl of plats) for (const s of styles) { const m = buildOne(pa, pl, s); if (m) built.push(m); else console.error("skip", pa, pl, s); }
fs.writeFileSync(path.join(OUT, "manifest.json"), JSON.stringify(built.map(({ tokens, ...m }) => m), null, 2));
console.log(`built ${built.length} screens → ${OUT}`);
