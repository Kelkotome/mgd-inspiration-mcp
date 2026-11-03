/* Home-services family (Handmere — fictional on-demand plumbers, electricians and cleaners, booked by arrival window):
   pro-directory → service-booking (details, slot-taken error) → job-tracker (on-the-way, job-done).
   Demand: real MCP query "plumber home services booking" returned nothing (3-Nov-2026 log).
   One consistent job throughout: customer Priya Nair, 2 Harbour Road, Dockside; leaking kitchen tap;
   pro Sam Achebe (Achebe Plumbing), Thu 6 Nov 2026, arrival window 10:00–12:00, $68/h + $35 call-out.
   Map and job photos are drawn from tokens (no images); pros are initials avatars. */
const { ic, esc, status, tabBar, ICON } = require("../lib");

Object.assign(ICON, {
  hs_wrench: '<path d="M14.5 5.5a4 4 0 0 0-5.3 5.3L3.5 16.5a2 2 0 0 0 2.8 2.8l5.7-5.7a4 4 0 0 0 5.3-5.3l-2.5 2.5-2.3-.5-.5-2.3z"/>',
  hs_bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
  hs_drop: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',
  hs_broom: '<path d="M14 3l-3.5 8M7 11h8l2 10H5zM9 15v6M13 15v6"/>',
  hs_van: '<path d="M2 7h11v9H2zM13 10h4l3 3v3h-7"/><circle cx="6" cy="17.5" r="1.8"/><circle cx="16.5" cy="17.5" r="1.8"/>',
  hs_shield: '<path d="M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
  hs_camera: '<path d="M4 7h3l2-2h6l2 2h3v12H4z"/><circle cx="12" cy="13" r="3.5"/>',
  hs_call: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z"/>',
  hs_house: '<path d="M3 11l9-7 9 7M5 9.5V20h14V9.5M10 20v-5h4v5"/>',
  hs_info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  hs_alert: '<path d="M12 3l9.5 17h-19z"/><path d="M12 10v4.5M12 17.5h.01"/>',
});

const H = (st, px) => Math.round(px * st.hscale);
const STAR = (s = 13) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/></svg>`;
const rating = (r, n, fs = 13) => `<span style="display:inline-flex;align-items:center;gap:4px;font-size:${fs}px"><span style="color:var(--accent);display:inline-flex">${STAR(fs)}</span><b>${r}</b><span class="muted">(${n})</span></span>`;
const av = (ini, size = 44, k = 0) => `<span style="flex:none;width:${size}px;height:${size}px;border-radius:50%;display:grid;place-items:center;font:600 ${Math.round(size * 0.36)}px var(--font-b);background:color-mix(in oklab,var(--${k % 2 ? "accent" : "primary"}) ${18 + (k % 3) * 6}%,var(--surface));color:color-mix(in oklab,var(--${k % 2 ? "accent" : "primary"}) 70%,var(--text))">${ini}</span>`;
const tint = (pct, v = "primary") => `color-mix(in oklab,var(--${v}) ${pct}%,var(--surface))`;
const chip = (t, on, ico) => `<span style="display:inline-flex;align-items:center;gap:6px;height:32px;padding:0 12px;border-radius:999px;font-size:13px;font-weight:500;white-space:nowrap;${on ? "background:var(--primary);color:var(--on-primary);border:1px solid var(--primary)" : "border:1px solid var(--border);background:var(--surface)"}">${ico ? ic(ico, 15) : ""}${t}</span>`;
const check = (on) => `<span style="flex:none;width:16px;height:16px;border-radius:4px;display:grid;place-items:center;${on ? "background:var(--primary);color:var(--on-primary);border:1px solid var(--primary)" : "border:1.5px solid var(--border)"}">${on ? ic("check", 12) : ""}</span>`;
const okBadge = (t) => `<span style="display:inline-flex;align-items:center;gap:4px;font-size:11.5px;font-weight:600;color:color-mix(in oklab,var(--success) 75%,var(--text))">${ic("hs_shield", 13)}${t}</span>`;

// shared job facts
const ADDR = "2 Harbour Road, Dockside";
const PROS = [
  { n: "Sam Achebe", ini: "SA", biz: "Achebe Plumbing & Heating", r: "4.9", rv: 318, jobs: "1,240", rate: 68, next: "Thu 10:00–12:00", slots: ["Thu 10–12", "Thu 14–16", "Fri 08–10"], tags: ["Licensed", "Same-day"], yrs: 12, resp: "replies in 6 min" },
  { n: "Wren Halloway", ini: "WH", biz: "Halloway Pipe & Drain", r: "4.8", rv: 204, jobs: "860", rate: 62, next: "Thu 14:00–16:00", slots: ["Thu 14–16", "Fri 10–12"], tags: ["Licensed"], yrs: 8, resp: "replies in 15 min" },
  { n: "Dario Velasco", ini: "DV", biz: "Velasco Home Repairs", r: "4.7", rv: 151, jobs: "512", rate: 55, next: "Fri 08:00–10:00", slots: ["Fri 08–10", "Fri 12–14"], tags: ["Same-day"], yrs: 5, resp: "replies in 22 min" },
  { n: "Kofi Mensah", ini: "KM", biz: "Mensah & Daughters Plumbing", r: "4.9", rv: 97, jobs: "388", rate: 74, next: "Sat 09:00–11:00", slots: ["Sat 09–11"], tags: ["Licensed", "Gas safe"], yrs: 15, resp: "replies in 1 h" },
];
const SAM = PROS[0];
const SERVICES = [["Leaking tap", "hs_drop"], ["Blocked drain", "hs_wrench"], ["Toilet repair", "hs_wrench"], ["Boiler check", "hs_bolt"], ["Something else", "plus"]];
const WINDOWS = [["08:00–10:00", "free"], ["10:00–12:00", "free"], ["12:00–14:00", "free"], ["14:00–16:00", "taken"], ["16:00–18:00", "free"], ["18:00–20:00", "+$15"]];
const DAYS = [["Wed", "5"], ["Thu", "6"], ["Fri", "7"], ["Sat", "8"], ["Sun", "9"], ["Mon", "10"], ["Tue", "11"]];

const header = (p, active = "Find a pro") => `<header style="height:64px;flex:none;display:flex;align-items:center;gap:22px;padding:0 32px;border-bottom:1px solid var(--border);background:var(--surface)">
<div class="logo"><b></b>${esc(p.name)}</div>
<div style="display:flex;align-items:center;gap:6px;font-size:13px;padding:0 12px;height:34px;border:1px solid var(--border);border-radius:var(--radius)">${ic("pin", 15)}<span class="muted">Job at</span><b style="font-weight:600">${ADDR}</b>${ic("chevdown", 14)}</div>
<nav style="display:flex;gap:20px;font-size:14px;font-weight:500;margin-left:12px">${["Find a pro", "My jobs", "Messages", "Help"].map((t) => `<span style="${t === active ? "color:var(--text)" : "color:var(--muted)"}">${t}</span>`).join("")}</nav>
<div style="margin-left:auto;display:flex;align-items:center;gap:16px"><span class="muted" style="position:relative;display:flex">${ic("bell", 20)}<span style="position:absolute;top:-2px;right:-2px;width:8px;height:8px;border-radius:50%;background:var(--primary)"></span></span><span class="avatar" style="width:32px;height:32px">PN</span></div></header>`;

// Token-drawn street map: blocks, a river, roads. `route` draws the pro's path; pins are absolutely positioned HTML.
const mapSvg = (w, h, route) => `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="position:absolute;inset:0;display:block" preserveAspectRatio="xMidYMid slice">
<rect width="${w}" height="${h}" fill="color-mix(in oklab,var(--muted) 9%,var(--bg))"/>
${Array.from({ length: 7 }, (_, i) => Array.from({ length: 6 }, (_, j) => `<rect x="${i * (w / 6) + 14}" y="${j * (h / 5) + 14}" width="${w / 6 - 28}" height="${h / 5 - 28}" rx="6" fill="color-mix(in oklab,var(--muted) 15%,var(--bg))"/>`).join("")).join("")}
<path d="M-20 ${h * 0.78} C ${w * 0.3} ${h * 0.68}, ${w * 0.55} ${h * 0.95}, ${w + 20} ${h * 0.82}" stroke="color-mix(in oklab,var(--primary) 22%,var(--bg))" stroke-width="34" fill="none"/>
<path d="M0 ${h * 0.4}H${w}M${w * 0.5} 0V${h}M0 ${h * 0.6}H${w}" stroke="var(--surface)" stroke-width="10" fill="none"/>
<path d="M${w * 0.17} 0V${h}M${w * 0.83} 0V${h}M0 ${h * 0.2}H${w}" stroke="var(--surface)" stroke-width="6" fill="none"/>
${route || ""}</svg>`;
const pin = (x, y, label, on) => `<span style="position:absolute;left:${x}px;top:${y}px;transform:translate(-50%,-100%);display:inline-flex;align-items:center;gap:4px;height:28px;padding:0 10px;border-radius:999px;font:600 12px var(--font-b);box-shadow:var(--shadow);${on ? "background:var(--primary);color:var(--on-primary)" : "background:var(--surface);color:var(--text);border:1px solid var(--border)"}">${label}</span>`;
const homePin = (x, y, s = 36) => `<span style="position:absolute;left:${x}px;top:${y}px;transform:translate(-50%,-50%);width:${s}px;height:${s}px;border-radius:50%;display:grid;place-items:center;background:var(--text);color:var(--bg);box-shadow:0 0 0 6px color-mix(in oklab,var(--text) 15%,transparent)">${ic("hs_house", Math.round(s * 0.5))}</span>`;
const vanPin = (x, y, s = 40) => `<span style="position:absolute;left:${x}px;top:${y}px;transform:translate(-50%,-50%);width:${s}px;height:${s}px;border-radius:50%;display:grid;place-items:center;background:var(--primary);color:var(--on-primary);box-shadow:0 0 0 8px color-mix(in oklab,var(--primary) 22%,transparent)">${ic("hs_van", Math.round(s * 0.5))}</span>`;

/* ---------------------------------------------------------------- pro-directory */
const proCard = (pr, i, compact) => compact
  ? `<div class="card" style="padding:12px;display:grid;gap:9px"><div style="display:flex;gap:11px;align-items:center">${av(pr.ini, 44, i)}<div style="flex:1;min-width:0"><div style="font-weight:600;font-size:14px">${pr.n}</div><div class="muted" style="font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${pr.biz}</div><div style="margin-top:2px">${rating(pr.r, pr.rv, 12)}</div></div><div style="text-align:right"><div class="num" style="font-size:16px">$${pr.rate}</div><div class="muted" style="font-size:11px">per hour</div></div></div>
<div style="display:flex;justify-content:space-between;align-items:center;font-size:12px"><span style="display:flex;gap:6px;align-items:center">${ic("clock", 14)}Next: <b>${pr.next}</b></span>${pr.tags.includes("Licensed") ? okBadge("Licensed") : `<span class="badge">Same-day</span>`}</div></div>`
  : `<div class="card" style="padding:16px 18px;display:grid;grid-template-columns:56px 1fr auto;gap:8px 16px;${i === 0 ? "border-color:var(--primary);box-shadow:0 0 0 1px var(--primary),var(--shadow-sm)" : ""}">
${av(pr.ini, 56, i)}<div><div style="display:flex;align-items:center;gap:10px"><span style="font-weight:600;font-size:16px">${pr.n}</span>${pr.tags.map((t) => t === "Licensed" || t === "Gas safe" ? okBadge(t) : `<span class="badge">${t}</span>`).join("")}</div>
<div class="muted" style="font-size:13px;margin-top:2px">${pr.biz} · ${pr.yrs} years · ${pr.jobs} jobs</div><div style="display:flex;gap:14px;align-items:center;margin-top:6px">${rating(pr.r, pr.rv)}<span class="muted" style="font-size:12.5px">${pr.resp}</span></div></div>
<div style="text-align:right"><div class="num" style="font-size:22px">$${pr.rate}<span class="muted" style="font-size:12px;font-weight:500">/h</span></div><div class="muted" style="font-size:12px">+ $35 call-out</div></div>
<div></div><div style="grid-column:2/4;display:flex;align-items:center;gap:8px;border-top:1px solid var(--border);padding-top:12px;margin-top:4px"><span class="muted" style="font-size:12.5px;margin-right:2px">Arrival windows</span>${pr.slots.map((s, j) => `<span style="height:30px;padding:0 10px;display:inline-flex;align-items:center;border-radius:var(--radius);font-size:12.5px;font-weight:500;${i === 0 && j === 0 ? `background:${tint(14)};border:1px solid var(--primary);color:var(--text)` : "border:1px solid var(--border)"}">${s}</span>`).join("")}<button class="btn ${i === 0 ? "primary" : ""}" style="margin-left:auto">Book ${pr.n.split(" ")[0]}</button></div></div>`;

const filters = () => `<aside style="display:grid;gap:18px;align-content:start;font-size:13px">
<div><div style="font-weight:600;margin-bottom:8px">Service</div><div style="display:flex;flex-wrap:wrap;gap:6px">${chip("Plumbing", true, "hs_drop")}${chip("Electrical", false, "hs_bolt")}${chip("Cleaning", false, "hs_broom")}${chip("Handyman", false, "hs_wrench")}</div></div>
<div><div style="font-weight:600;margin-bottom:8px">When</div><div style="display:grid;grid-template-columns:repeat(3,1fr);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden">${["Today", "Thu 6", "This week"].map((t, i) => `<span style="height:32px;display:grid;place-items:center;font-weight:500;${i === 1 ? "background:var(--primary);color:var(--on-primary)" : ""}${i ? ";border-left:1px solid var(--border)" : ""}">${t}</span>`).join("")}</div></div>
<div><div style="display:flex;justify-content:space-between;font-weight:600;margin-bottom:10px">Hourly rate<span class="muted" style="font-weight:500">$40 – $80</span></div><div style="position:relative;height:18px"><div style="position:absolute;top:8px;left:0;right:0;height:3px;border-radius:2px;background:var(--border)"></div><div style="position:absolute;top:8px;left:18%;right:22%;height:3px;background:var(--primary)"></div>${[18, 78].map((x) => `<span style="position:absolute;top:2px;left:calc(${x}% - 8px);width:16px;height:16px;border-radius:50%;background:var(--surface);border:2px solid var(--primary)"></span>`).join("")}</div></div>
<div style="display:grid;gap:9px"><div style="font-weight:600">Must have</div>${[["Licensed & insured", true], ["Background-checked", true], ["Same-day available", false], ["Fixed-price quotes", false]].map(([t, on]) => `<label style="display:flex;gap:9px;align-items:center">${check(on)}${t}</label>`).join("")}</div>
<div style="display:grid;gap:9px"><div style="font-weight:600">Rating</div>${["4.5 and up", "4.0 and up", "Any"].map((t, i) => `<label style="display:flex;gap:9px;align-items:center"><span style="width:16px;height:16px;border-radius:50%;border:${i === 0 ? "5px solid var(--primary)" : "1.5px solid var(--border)"}"></span>${t}</label>`).join("")}</div>
<div class="card" style="padding:12px;display:flex;gap:10px;font-size:12.5px;background:${tint(8)}"><span style="color:var(--primary);display:flex">${ic("hs_shield", 18)}</span><div><b>Handmere Guarantee</b><div class="muted" style="margin-top:2px">If the fix fails within 90 days, we send a pro back free.</div></div></div></aside>`;

const TPL = {};
TPL["pro-directory/web"] = (p, st) => `<div style="height:100%;display:flex;flex-direction:column">${header(p)}
<div style="flex:1;min-height:0;display:grid;grid-template-columns:236px 1fr 400px;gap:28px;padding:22px 0 0 32px">
${filters()}
<main style="display:flex;flex-direction:column;gap:14px;min-width:0;overflow:hidden">
<div style="display:flex;align-items:flex-end;justify-content:space-between"><div><h1 style="font-size:${H(st, 26)}px">Plumbers near Dockside</h1><div class="muted" style="font-size:13px;margin-top:4px">14 available on Thu 6 Nov · showing licensed and background-checked pros</div></div>
<div style="display:flex;gap:8px"><div class="input filled" style="width:250px;height:36px;gap:8px">${ic("search", 15)}Leaking kitchen tap</div><span class="btn">${ic("filter", 15)}Best match${ic("chevdown", 14)}</span></div></div>
${PROS.slice(0, 3).map((pr, i) => proCard(pr, i)).join("")}<div style="display:flex;justify-content:center;gap:6px;align-items:center;font-size:13px;font-weight:600;color:var(--primary)">Show 11 more plumbers${ic("chevdown", 15)}</div></main>
<div style="position:relative;overflow:hidden;border-left:1px solid var(--border)">${mapSvg(400, 836)}
${pin(150, 210, "$68", true)}${pin(290, 330, "$62")}${pin(110, 470, "$55")}${pin(300, 600, "$74")}${homePin(214, 400, 30)}
<div class="card" style="position:absolute;left:16px;right:16px;bottom:18px;padding:12px 14px;display:flex;gap:10px;align-items:center;font-size:12.5px;box-shadow:var(--shadow)">${av(SAM.ini, 36, 0)}<div style="flex:1"><b>${SAM.n}</b> · 1.8 km away<div class="muted">Usually arrives in the first hour of the window</div></div>${ic("chevron", 16)}</div>
<div style="position:absolute;top:14px;right:14px;display:grid;border:1px solid var(--border);border-radius:var(--radius);background:var(--surface);overflow:hidden">${ic("plus", 16).replace("<svg", '<svg style="margin:8px"')}<span style="border-top:1px solid var(--border)"></span>${ic("minus", 16).replace("<svg", '<svg style="margin:8px"')}</div></div>
</div></div>`;

TPL["pro-directory/mobile"] = (p, st) => `<div class="phone">${status()}
<div class="mtop"><div><div class="muted" style="font-size:11.5px;display:flex;gap:4px;align-items:center">${ic("pin", 13)}Job at</div><div style="font-weight:600;font-size:14px;display:flex;gap:4px;align-items:center">${ADDR}${ic("chevdown", 14)}</div></div><span style="display:flex">${ic("bell", 22)}</span></div>
<div class="mbody" style="gap:12px">
<div class="input filled" style="gap:8px;height:44px">${ic("search", 17)}Leaking kitchen tap<span class="muted" style="margin-left:auto;display:flex">${ic("filter", 17)}</span></div>
<div style="display:flex;gap:6px;overflow:hidden;flex:none">${chip("Plumbing", true, "hs_drop")}${chip("Thu 6 Nov", false, "calendar")}${chip("Licensed", false)}${chip("4.5+", false)}</div>
<div style="display:flex;justify-content:space-between;align-items:baseline"><h1 style="font-size:${H(st, 20)}px">14 plumbers nearby</h1><span class="muted" style="font-size:12px">Best match</span></div>
${PROS.slice(0, 3).map((pr, i) => proCard(pr, i, true)).join("")}
<div style="display:flex;gap:8px;align-items:center;font-size:12px;padding:10px 12px;border-radius:var(--radius);background:${tint(8)}"><span style="color:var(--primary);display:flex">${ic("hs_shield", 16)}</span>Every pro is licensed, insured and background-checked.</div>
</div>${tabBar("Find", [["search", "Find"], ["calendar", "Jobs"], ["chat", "Messages"], ["users", "Account"]])}</div>`;

/* ---------------------------------------------------------------- service-booking (details | slot-taken) */
const SLOT_ALERT = (big) => `<div role="alert" style="display:flex;gap:10px;align-items:flex-start;padding:${big ? "12px 14px" : "10px 12px"};border-radius:var(--radius);border:1px solid color-mix(in oklab,var(--danger) 45%,var(--border));background:color-mix(in oklab,var(--danger) 8%,var(--surface));font-size:${big ? 13 : 12}px"><span style="color:var(--danger);display:flex;margin-top:1px">${ic("hs_alert", 16)}</span><div><div style="font-weight:600;color:var(--danger)">10:00–12:00 was just booked by someone else</div><div style="margin-top:2px">${big ? "Sam can still come at 12:00–14:00 on Thu 6 Nov, or 08:00–10:00 on Fri 7 Nov. Your details are saved." : "Pick another window. Your details are saved."}</div></div></div>`;
const windowGrid = (taken, cols, h) => `<div style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:8px">${WINDOWS.map(([t, s]) => {
  const isTaken = s === "taken" || (taken && t === "10:00–12:00"), sel = !taken && t === "10:00–12:00", sugg = taken && t === "12:00–14:00";
  return `<div style="height:${h}px;border-radius:var(--radius);display:grid;align-content:center;justify-items:center;gap:1px;font-size:13px;${sel ? `background:${tint(14)};border:2px solid var(--primary)` : sugg ? "border:2px dashed var(--primary)" : isTaken ? "border:1px solid var(--border);background:color-mix(in oklab,var(--muted) 8%,var(--surface));color:var(--muted)" : "border:1px solid var(--border)"}"><b style="font-weight:600;${isTaken ? "text-decoration:line-through;font-weight:500" : ""}">${t}</b><span style="font-size:11px;${sugg ? "color:var(--primary);font-weight:600" : ""}" class="${sugg ? "" : "muted"}">${isTaken ? (taken && t === "10:00–12:00" ? "Just taken" : "Booked") : sugg ? "Suggested" : s === "free" ? "Available" : "Evening " + s}</span></div>`;
}).join("")}</div>`;
const dayStrip = (n, h) => `<div style="display:grid;grid-template-columns:repeat(${n},1fr);gap:6px">${DAYS.slice(0, n).map(([d, dd], i) => `<div style="height:${h}px;border-radius:var(--radius);display:grid;align-content:center;justify-items:center;font-size:12px;${i === 1 ? "background:var(--primary);color:var(--on-primary)" : "border:1px solid var(--border)"}"><span style="${i === 1 ? "" : "color:var(--muted)"}">${d}</span><b class="num" style="font-size:16px">${dd}</b></div>`).join("")}</div>`;
const photoTile = (k, s) => `<span style="flex:none;width:${s}px;height:${s}px;border-radius:var(--radius);overflow:hidden;position:relative;background:linear-gradient(160deg,#c9ccce,#8f979b)"><span style="position:absolute;left:${k ? 30 : 20}%;top:18%;width:22%;height:46%;border-radius:40% 40% 8px 8px;background:linear-gradient(90deg,#e7e9ea,#b5bbbe)"></span><span style="position:absolute;left:${k ? 38 : 28}%;top:58%;width:6px;height:${k ? 14 : 18}%;border-radius:3px;background:#6fa6c9;opacity:.9"></span><span style="position:absolute;left:0;right:0;bottom:0;height:22%;background:#5d6468"></span></span>`;
const steps = (cur) => `<div style="display:flex;align-items:center;gap:10px;font-size:13px">${["Service", "Details & time", "Confirm"].map((t, i) => `<span style="display:flex;align-items:center;gap:8px;${i > cur ? "color:var(--muted)" : "font-weight:600"}"><span style="width:24px;height:24px;border-radius:50%;display:grid;place-items:center;font-size:12px;${i < cur ? "background:var(--primary);color:var(--on-primary)" : i === cur ? "border:2px solid var(--primary);color:var(--primary)" : "border:1px solid var(--border)"}">${i < cur ? ic("check", 13) : i + 1}</span>${t}</span>${i < 2 ? `<span style="width:40px;height:1px;background:var(--border)"></span>` : ""}`).join("")}</div>`;
const sumRow = (k, v, b) => `<div style="display:flex;justify-content:space-between;font-size:13px;${b ? "font-weight:600" : ""}"><span class="${b ? "" : "muted"}">${k}</span><span>${v}</span></div>`;

TPL["service-booking/web"] = (p, st) => {
  const taken = p.variant === "slot-taken";
  return `<div style="height:100%;display:flex;flex-direction:column">${header(p)}
<div style="flex:1;min-height:0;display:grid;grid-template-columns:1fr 380px;gap:36px;padding:22px 40px 0;max-width:1240px;width:100%;margin:0 auto">
<main style="display:flex;flex-direction:column;gap:16px;min-width:0">
<div style="display:flex;justify-content:space-between;align-items:center"><div><div class="muted" style="font-size:13px;display:flex;gap:6px;align-items:center">${ic("back", 14)}Back to plumbers</div><h1 style="font-size:${H(st, 26)}px;margin-top:6px">Book ${SAM.n}</h1></div>${steps(1)}</div>
${taken ? SLOT_ALERT(true) : ""}
<div class="card" style="padding:18px 20px;display:grid;gap:14px">
<div><div style="font-weight:600;font-size:15px;margin-bottom:10px">What needs fixing?</div><div style="display:flex;flex-wrap:wrap;gap:8px">${SERVICES.map(([t, i], j) => chip(t, j === 0, i)).join("")}</div></div>
<div class="field"><label>Describe the problem</label><div class="input filled" style="height:${taken ? 54 : 64}px;align-items:flex-start;padding-top:10px;line-height:1.45;font-size:13.5px">Kitchen mixer tap drips constantly from the spout, and water pools under the sink when it runs. Shut-off valve is under the sink.</div></div>
<div style="display:flex;gap:10px;align-items:center">${photoTile(0, 56)}${photoTile(1, 56)}<span style="width:56px;height:56px;border-radius:var(--radius);border:1.5px dashed var(--border);display:grid;place-items:center;color:var(--muted)">${ic("hs_camera", 20)}</span><span class="muted" style="font-size:12.5px;margin-left:4px">2 photos added · photos help Sam bring the right parts</span></div></div>
<div class="card" style="padding:18px 20px;display:grid;gap:12px">
<div style="display:flex;justify-content:space-between;align-items:baseline"><div style="font-weight:600;font-size:15px">When should Sam arrive?</div><span class="muted" style="font-size:12.5px">November 2026 · 2-hour arrival windows</span></div>
${dayStrip(7, 60)}${windowGrid(taken, 6, 58)}</div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px"><div class="field"><label>Address</label><div class="input filled" style="gap:8px">${ic("pin", 15)}${ADDR}, Flat 4</div></div><div class="field"><label>Access notes <span class="muted" style="font-weight:400">(optional)</span></label><div class="input filled">Buzz 4 · parking bay behind the building</div></div></div>
<div style="display:flex;gap:24px;font-size:13px${taken ? ";display:none" : ""}">${[["Someone 18+ will be home", true], ["Pets in the home", false], ["Text me when Sam is on the way", true]].map(([t, on]) => `<label style="display:flex;gap:9px;align-items:center">${check(on)}${t}</label>`).join("")}</div>
</main>
<aside style="align-self:start;display:grid;gap:12px">
<div class="card" style="padding:18px;display:grid;gap:12px">
<div style="display:flex;gap:12px;align-items:center">${av(SAM.ini, 48, 0)}<div><div style="font-weight:600">${SAM.n}</div><div class="muted" style="font-size:12.5px">${SAM.biz}</div><div style="margin-top:2px">${rating(SAM.r, SAM.rv, 12)}</div></div></div>
<div style="display:grid;gap:8px;padding:12px 0;border-top:1px solid var(--border);border-bottom:1px solid var(--border);font-size:13px">
<div style="display:flex;gap:8px">${ic("hs_drop", 16)}Leaking tap · kitchen</div><div style="display:flex;gap:8px;${taken ? "color:var(--danger)" : ""}">${ic("calendar", 16)}${taken ? "<s>Thu 6 Nov, 10:00–12:00</s>&nbsp;· pick a new window" : "Thu 6 Nov, 10:00–12:00"}</div><div style="display:flex;gap:8px">${ic("pin", 16)}${ADDR}</div></div>
${sumRow("Call-out fee", "$35.00")}${sumRow("Labour (est. 1 h × $68)", "$68.00")}${sumRow("Parts", "at cost, approved by you")}
<div style="display:flex;justify-content:space-between;align-items:baseline;border-top:1px solid var(--border);padding-top:10px"><b>Estimate</b><span class="num" style="font-size:24px">$103.00</span></div>
<button class="btn primary block" style="${taken ? "opacity:.5" : ""}">${taken ? "Choose a new window" : "Confirm booking"}</button>
<div class="muted" style="font-size:12px;text-align:center">You pay after the job is done. Free to cancel until Wed 5 Nov, 18:00.</div></div>
<div class="card" style="padding:12px 14px;display:flex;gap:10px;font-size:12.5px"><span style="color:var(--primary);display:flex">${ic("hs_shield", 18)}</span><div><b>Covered by the Handmere Guarantee</b><div class="muted" style="margin-top:2px">90-day workmanship cover and $1M liability insurance.</div></div></div>
</aside></div></div>`;
};

TPL["service-booking/mobile"] = (p, st) => {
  const taken = p.variant === "slot-taken";
  return `<div class="phone">${status()}
<div class="mtop">${ic("back", 22)}<div style="text-align:center"><div style="font-weight:600;font-size:15px">Book ${SAM.n.split(" ")[0]}</div><div class="muted" style="font-size:11.5px">Step 2 of 3 · Details & time</div></div>${ic("x", 20)}</div>
<div style="height:3px;flex:none;margin:0 20px;border-radius:2px;background:var(--border)"><div style="width:66%;height:100%;border-radius:2px;background:var(--primary)"></div></div>
<div class="mbody" style="gap:12px;padding-top:14px">
${taken ? SLOT_ALERT(false) : ""}
<div><div style="font-weight:600;font-size:14px;margin-bottom:8px">What needs fixing?</div><div style="display:flex;flex-wrap:wrap;gap:6px">${SERVICES.slice(0, taken ? 3 : 4).map(([t, i], j) => chip(t, j === 0, i)).join("")}</div></div>
<div class="input filled" style="height:${taken ? 48 : 62}px;align-items:flex-start;padding-top:9px;font-size:13px;line-height:1.4">Kitchen mixer tap drips from the spout${taken ? "…" : "; water pools under the sink when it runs."}</div>
${taken ? "" : `<div style="display:flex;gap:8px;align-items:center">${photoTile(0, 46)}${photoTile(1, 46)}<span style="width:46px;height:46px;border-radius:var(--radius);border:1.5px dashed var(--border);display:grid;place-items:center;color:var(--muted)">${ic("hs_camera", 18)}</span></div>`}
<div style="display:flex;justify-content:space-between;align-items:baseline"><div style="font-weight:600;font-size:14px">Arrival window</div><span class="muted" style="font-size:12px">Nov 2026</span></div>
${dayStrip(5, 52)}${windowGrid(taken, 2, 46)}
<div style="display:flex;gap:8px;align-items:center;font-size:12.5px;padding:10px 12px;border:1px solid var(--border);border-radius:var(--radius)">${ic("pin", 15)}<span style="flex:1">${ADDR}, Flat 4</span><span style="color:var(--primary);font-weight:600">Edit</span></div>
</div>
<div style="flex:none;display:flex;gap:12px;align-items:center;padding:12px 20px 30px;border-top:1px solid var(--border);background:var(--surface)"><div><div class="muted" style="font-size:11.5px">Estimate · pay after</div><div class="num" style="font-size:20px">$103.00</div></div><button class="btn primary" style="flex:1;height:46px;font-size:14px;${taken ? "opacity:.5" : ""}">${taken ? "Pick a window" : "Continue"}</button></div></div>`;
};

/* ---------------------------------------------------------------- job-tracker (on-the-way | job-done) */
const TIMELINE = [["Booked", "Wed 5 Nov, 21:14", "done"], ["Sam accepted", "Wed 5 Nov, 21:20", "done"], ["On the way", "Thu 6 Nov, 10:12", "now"], ["Job started", "", "next"], ["Done & paid", "", "next"]];
const TIMELINE_DONE = [["Booked", "Wed 5 Nov, 21:14"], ["On the way", "Thu 10:12"], ["Arrived", "Thu 10:26"], ["Job finished", "Thu 11:08"]];
const timeline = (rows, fs = 13) => `<div style="display:grid">${rows.map(([t, d, s], i) => `<div style="display:grid;grid-template-columns:22px 1fr auto;gap:10px;align-items:start;font-size:${fs}px"><div style="display:grid;justify-items:center;height:100%"><span style="width:${s === "now" ? 18 : 14}px;height:${s === "now" ? 18 : 14}px;border-radius:50%;margin-top:2px;${s === "done" ? "background:var(--primary)" : s === "now" ? "background:var(--surface);border:5px solid var(--primary);box-shadow:0 0 0 4px color-mix(in oklab,var(--primary) 18%,transparent)" : "border:2px solid var(--border);background:var(--surface)"}"></span>${i < rows.length - 1 ? `<span style="width:2px;min-height:16px;flex:1;background:${s === "done" ? "var(--primary)" : "var(--border)"}"></span>` : ""}</div><div style="padding-bottom:${i < rows.length - 1 ? 10 : 0}px;${s === "next" ? "color:var(--muted)" : "font-weight:" + (s === "now" ? 600 : 500)}">${t}</div><span class="muted" style="font-size:${fs - 1}px">${d}</span></div>`).join("")}</div>`;
const route = (w, h) => `<path d="M${w * 0.22} ${h * 0.18} L${w * 0.5} ${h * 0.2} L${w * 0.5} ${h * 0.4} L${w * 0.66} ${h * 0.4} L${w * 0.66} ${h * 0.6}" stroke="var(--primary)" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M${w * 0.22} ${h * 0.18} L${w * 0.5} ${h * 0.2}" stroke="color-mix(in oklab,var(--primary) 35%,var(--bg))" stroke-width="6" fill="none" stroke-linecap="round"/>`;
const proRow = (big) => `<div style="display:flex;gap:12px;align-items:center">${av(SAM.ini, big ? 52 : 44, 0)}<div style="flex:1;min-width:0"><div style="font-weight:600;font-size:${big ? 15 : 14}px">${SAM.n}</div><div class="muted" style="font-size:12px">${SAM.biz}</div><div style="margin-top:2px">${rating(SAM.r, SAM.rv, 12)}</div></div>
${[["hs_call", "Call"], ["chat", "Message"]].map(([i, t]) => `<span style="width:${big ? 40 : 38}px;height:${big ? 40 : 38}px;border-radius:50%;display:grid;place-items:center;border:1px solid var(--border);color:var(--primary)" aria-label="${t}">${ic(i, 17)}</span>`).join("")}</div>`;
const stars5 = (n, s) => `<div style="display:flex;gap:6px">${[0, 1, 2, 3, 4].map((i) => `<span style="display:inline-flex;color:${i < n ? "var(--accent)" : "var(--border)"}">${STAR(s)}</span>`).join("")}</div>`;
const RECEIPT = [["Call-out fee", "$35.00"], ["Labour · 42 min (billed 45 min)", "$51.00"], ["Cartridge + washer set (approved)", "$18.40"]];
const doneIcon = (s) => `<span style="flex:none;width:${s}px;height:${s}px;border-radius:50%;display:grid;place-items:center;background:color-mix(in oklab,var(--success) 18%,var(--surface));color:color-mix(in oklab,var(--success) 70%,var(--text))">${ic("check", Math.round(s * 0.5))}</span>`;

TPL["job-tracker/web"] = (p, st) => {
  if (p.variant === "job-done") return `<div style="height:100%;display:flex;flex-direction:column">${header(p, "My jobs")}
<div style="flex:1;min-height:0;display:grid;grid-template-columns:1fr 420px;gap:32px;padding:24px 40px 0;max-width:1240px;width:100%;margin:0 auto">
<main style="display:flex;flex-direction:column;gap:16px;min-width:0">
<div style="display:flex;gap:14px;align-items:center">${doneIcon(48)}<div><h1 style="font-size:${H(st, 26)}px">Your tap is fixed</h1><div class="muted" style="font-size:13px;margin-top:3px">Sam finished at 11:08 on Thu 6 Nov · job #HM-20581</div></div></div>
<div class="card" style="padding:18px 20px;display:grid;gap:12px"><div style="font-weight:600;font-size:15px">What Sam did</div>
<div style="font-size:13.5px;line-height:1.55">Replaced the worn ceramic cartridge and the spout O-ring on the kitchen mixer tap, re-seated the under-sink compression fitting that was weeping, and ran the tap for 10 minutes with no drips or leaks.</div>
<div style="display:flex;gap:10px;align-items:center">${photoTile(0, 92)}${photoTile(1, 92)}<div style="display:grid;gap:6px;font-size:12.5px;margin-left:10px;flex:1">${[["Ceramic cartridge 35 mm", "1 × $14.20"], ["Spout O-ring + fibre washer set", "1 × $4.20"]].map(([k, v]) => `<div style="display:flex;justify-content:space-between;border-bottom:1px solid var(--border);padding-bottom:6px"><span>${k}</span><span class="muted">${v}</span></div>`).join("")}<span class="muted">Parts approved by you at 10:41 · before and after photos</span></div></div></div>
<div class="card" style="padding:18px 20px;display:grid;gap:12px"><div style="display:flex;justify-content:space-between;align-items:baseline"><div style="font-weight:600;font-size:15px">Rate Sam</div><span class="muted" style="font-size:12.5px">Your review helps neighbours pick a pro</span></div>
<div style="display:flex;align-items:center;gap:14px">${stars5(5, 30)}<b style="font-size:14px">Excellent</b></div>
<div style="display:flex;flex-wrap:wrap;gap:8px">${["On time", "Tidy work", "Explained the fix", "Fair price", "Friendly"].map((t, i) => chip(t, i < 3)).join("")}</div>
<div class="input filled" style="height:76px;align-items:flex-start;padding-top:10px;font-size:13.5px;line-height:1.45">Arrived early in the window, showed me the worn cartridge and cleaned up after. Would book again.</div>
<div style="display:flex;justify-content:space-between;align-items:center"><label style="display:flex;gap:9px;align-items:center;font-size:13px">${check(true)}Add Sam to my saved pros</label><button class="btn">Post review</button></div></div>
<div class="card" style="padding:16px 20px;display:flex;gap:16px;align-items:center"><div style="flex:1"><div style="font-weight:600;font-size:15px">Book Sam again</div><div class="muted" style="font-size:12.5px;margin-top:2px">Saved pros see your address and access notes, so rebooking takes one tap.</div></div>${SERVICES.slice(1, 4).map(([t, i]) => chip(t, false, i)).join("")}</div>
</main>
<aside style="align-self:start;display:grid;gap:12px">
<div class="card" style="padding:18px;display:grid;gap:10px"><div style="display:flex;justify-content:space-between;align-items:center"><div style="font-weight:600;font-size:15px">Receipt</div><span class="badge">Estimate was $103.00</span></div>
${RECEIPT.map(([k, v]) => sumRow(k, v)).join("")}
<div style="display:flex;justify-content:space-between;align-items:baseline;border-top:1px solid var(--border);padding-top:10px"><b>Total</b><span class="num" style="font-size:26px">$104.40</span></div>
<div style="display:grid;gap:8px"><div style="font-size:13px;font-weight:600">Add a tip for Sam</div><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px">${["None", "$5", "$10", "Custom"].map((t, i) => `<span style="height:36px;border-radius:var(--radius);display:grid;place-items:center;font-size:13px;font-weight:500;${i === 2 ? `background:${tint(14)};border:2px solid var(--primary)` : "border:1px solid var(--border)"}">${t}</span>`).join("")}</div></div>
<div style="display:flex;gap:8px;align-items:center;font-size:13px;padding:10px 12px;border:1px solid var(--border);border-radius:var(--radius)">${ic("card", 16)}Card ending 4417<span class="muted" style="margin-left:auto">Change</span></div>
<button class="btn primary block">Pay $114.40</button><div class="muted" style="font-size:12px;text-align:center">Tip goes 100% to Sam. Covered by the 90-day Handmere Guarantee.</div></div>
<div class="card" style="padding:14px 16px;display:grid;gap:8px">${timeline(TIMELINE_DONE.map(([t, d]) => [t, d, "done"]), 12.5)}</div>
</aside></div></div>`;
  return `<div style="height:100%;display:flex;flex-direction:column">${header(p, "My jobs")}
<div style="flex:1;min-height:0;display:grid;grid-template-columns:1fr 440px">
<div style="position:relative;overflow:hidden">${mapSvg(1000, 836, route(1000, 836))}${vanPin(500, 167, 46)}${homePin(660, 836 * 0.6, 40)}
<div class="card" style="position:absolute;left:536px;top:96px;padding:8px 12px;font-size:12.5px;box-shadow:var(--shadow)"><b>Sam · 12 min</b><div class="muted">3.4 km · light traffic</div></div>
<div class="card" style="position:absolute;left:24px;top:22px;padding:10px 14px;display:flex;gap:10px;align-items:center;font-size:13px;box-shadow:var(--shadow)">${ic("back", 16)}<b>Job #HM-20581</b><span class="muted">Leaking tap · kitchen</span></div></div>
<aside style="border-left:1px solid var(--border);background:var(--surface);padding:24px 28px;display:flex;flex-direction:column;gap:16px;overflow:hidden">
<div><span class="badge">Arriving in your window · 10:00–12:00</span><h1 style="font-size:${H(st, 26)}px;margin-top:10px">Sam is on the way</h1><div style="display:flex;align-items:baseline;gap:10px;margin-top:6px"><span class="num" style="font-size:34px">10:24</span><span class="muted" style="font-size:13px">estimated arrival · 12 min</span></div></div>
<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:4px">${[1, 1, 1, 0, 0].map((d, i) => `<span style="height:5px;border-radius:3px;background:${d ? "var(--primary)" : "var(--border)"}${i === 2 ? ";opacity:.6" : ""}"></span>`).join("")}</div>
<div class="card" style="padding:14px;display:grid;gap:12px">${proRow(true)}<div style="display:flex;gap:8px;align-items:center;font-size:12.5px;border-top:1px solid var(--border);padding-top:10px"><span class="muted" style="display:flex">${ic("hs_van", 16)}</span>White van · plate KD71 RTX<span class="muted" style="margin-left:auto">${SAM.yrs} yrs · ${SAM.jobs} jobs</span></div></div>
<div style="display:flex;gap:10px;align-items:center;padding:12px 14px;border-radius:var(--radius);background:${tint(9)};font-size:13px"><span style="color:var(--primary);display:flex">${ic("lock", 18)}</span><div style="flex:1">Share this code at the door<div class="muted" style="font-size:12px">Sam will ask for it before starting</div></div><span class="num" style="font-size:22px;letter-spacing:.12em">4817</span></div>
${timeline(TIMELINE)}
<div class="card" style="padding:14px 16px;display:grid;gap:8px;font-size:13px"><div style="font-weight:600">Job details</div>${[["hs_drop", "Leaking kitchen mixer tap · 2 photos"], ["calendar", "Thu 6 Nov · arrival 10:00–12:00"], ["pin", ADDR + ", Flat 4 · buzz 4"], ["card", "Estimate $103.00 · pay after the job"]].map(([i, t]) => `<div style="display:flex;gap:9px;align-items:center"><span class="muted" style="display:flex">${ic(i, 15)}</span>${t}</div>`).join("")}</div>
<div style="margin-top:auto;display:flex;gap:10px"><button class="btn" style="flex:1">Reschedule</button><button class="btn" style="flex:1">Cancel job</button></div></aside></div></div>`;
};

TPL["job-tracker/mobile"] = (p, st) => {
  if (p.variant === "job-done") return `<div class="phone">${status()}
<div class="mtop">${ic("x", 22)}<span style="font-weight:600;font-size:15px">Job #HM-20581</span>${ic("more", 20)}</div>
<div class="mbody" style="gap:12px">
<div style="display:flex;gap:12px;align-items:center">${doneIcon(44)}<div><h1 style="font-size:${H(st, 21)}px">Your tap is fixed</h1><div class="muted" style="font-size:12px;margin-top:2px">Sam finished at 11:08 · Thu 6 Nov</div></div></div>
<div style="display:flex;gap:10px;align-items:center">${photoTile(0, 52)}${photoTile(1, 52)}<div style="font-size:12.5px;line-height:1.4;flex:1">Replaced the worn cartridge and spout O-ring; no drips after a 10-minute test.</div></div>
<div class="card" style="padding:12px 14px;display:grid;gap:7px">${RECEIPT.map(([k, v]) => sumRow(k.replace(" (billed 45 min)", "").replace(" (approved)", ""), v)).join("")}
<div style="display:flex;justify-content:space-between;align-items:baseline;border-top:1px solid var(--border);padding-top:8px"><b style="font-size:13px">Total</b><span class="num" style="font-size:20px">$104.40</span></div></div>
<div><div style="font-weight:600;font-size:13px;margin-bottom:8px">Tip for Sam</div><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px">${["None", "$5", "$10", "Other"].map((t, i) => `<span style="height:36px;border-radius:var(--radius);display:grid;place-items:center;font-size:13px;font-weight:500;${i === 2 ? `background:${tint(14)};border:2px solid var(--primary)` : "border:1px solid var(--border)"}">${t}</span>`).join("")}</div></div>
<div class="card" style="padding:12px 14px;display:grid;gap:10px"><div style="display:flex;justify-content:space-between;align-items:center"><b style="font-size:14px">Rate Sam</b>${stars5(5, 22)}</div>
<div style="display:flex;flex-wrap:wrap;gap:6px">${["On time", "Tidy work", "Explained the fix", "Fair price"].map((t, i) => chip(t, i < 3)).join("")}</div></div>
<div class="input filled" style="height:56px;align-items:flex-start;padding-top:9px;font-size:12.5px;line-height:1.4">Arrived early, showed me the worn part and cleaned up after.</div>
<label style="display:flex;gap:9px;align-items:center;font-size:12.5px">${check(true)}Save Sam to my pros</label>
</div>
<div style="flex:none;display:grid;gap:6px;padding:12px 20px 30px;border-top:1px solid var(--border);background:var(--surface)"><div style="display:flex;gap:8px;align-items:center;font-size:12px" class="muted">${ic("card", 15)}Card ending 4417 · tip goes 100% to Sam</div><button class="btn primary" style="height:46px;font-size:14px">Pay $114.40</button></div></div>`;
  return `<div class="phone" style="position:relative">${status()}
<div style="height:350px;flex:none;position:relative;overflow:hidden">${mapSvg(390, 350, route(390, 350))}${vanPin(195, 70, 38)}${homePin(390 * 0.66, 350 * 0.6, 34)}
<span style="position:absolute;left:16px;top:12px;width:38px;height:38px;border-radius:50%;display:grid;place-items:center;background:var(--surface);box-shadow:var(--shadow)">${ic("back", 18)}</span>
<div class="card" style="position:absolute;left:222px;top:38px;padding:6px 10px;font-size:12px;box-shadow:var(--shadow)"><b>12 min</b> · 3.4 km</div></div>
<div style="flex:1;margin-top:-22px;position:relative;border-radius:22px 22px 0 0;background:var(--surface);box-shadow:var(--shadow-lg);padding:10px 20px 0;display:flex;flex-direction:column;gap:12px;overflow:hidden">
<span style="width:40px;height:4px;border-radius:2px;background:var(--border);align-self:center"></span>
<div><div class="muted" style="font-size:12px">Sam is on the way · window 10:00–12:00</div><div style="display:flex;align-items:baseline;gap:8px;margin-top:2px"><span class="num" style="font-size:30px">10:24</span><span class="muted" style="font-size:13px">arrival</span></div></div>
<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:4px">${[1, 1, 1, 0, 0].map((d) => `<span style="height:5px;border-radius:3px;background:${d ? "var(--primary)" : "var(--border)"}"></span>`).join("")}</div>
${proRow(false)}
<div style="display:flex;gap:10px;align-items:center;padding:10px 12px;border-radius:var(--radius);background:${tint(9)};font-size:12.5px"><span style="color:var(--primary);display:flex">${ic("lock", 16)}</span><div style="flex:1">Door code for Sam</div><span class="num" style="font-size:19px;letter-spacing:.12em">4817</span></div>
${timeline(TIMELINE.slice(1, 4), 12.5)}
</div>${tabBar("Jobs", [["search", "Find"], ["calendar", "Jobs"], ["chat", "Messages"], ["users", "Account"]])}</div>`;
};

const def = (name, shows, elements, key, extra) => ({ family: "homeservices", name, shows, elements, web: TPL[key + "/web"], mobile: TPL[key + "/mobile"], ...(extra || {}) });
module.exports = {
  "pro-directory": def("Find a pro (home services directory)", "a home-services directory of local plumbers with service chips, arrival-day, hourly-rate range, must-have and rating filters, search, pro cards with initials avatar, licence and same-day badges, rating, jobs done, reply time, hourly rate and call-out fee, bookable arrival windows, and a map with price pins",
    ["navigation-header", "search-bar", "filters", "chips", "checkbox", "range-slider", "segmented-control", "pro-cards", "avatar", "badge", "star-rating", "time-slots", "map", "button", "home-services"], "pro-directory"),
  "service-booking": def("Book a home-service visit", "booking a plumber: the problem as service chips, a description and photos, a day strip and two-hour arrival windows, the address and access notes, and a summary with the pro, call-out fee, labour estimate and pay-after-the-job note",
    ["form", "chips", "textarea", "photo-upload", "date-picker", "time-slots", "stepper", "order-summary", "button", "home-services"], "service-booking", {
      variants: {
        details: { name: "Book a home-service visit (details and arrival window)", shows: "the booking form with the leaking-tap service chosen, a description and two photos, Thursday selected in a day strip, the 10:00–12:00 arrival window selected (one window already booked), and a summary with a $103 estimate and a confirm button" },
        "slot-taken": { name: "Booking error: arrival window just taken", shows: "the same booking after the chosen arrival window was taken by someone else: an error alert with the next free windows, the taken slot struck through, a suggested window outlined, saved details, and the confirm button waiting for a new choice" },
      },
    }),
  "job-tracker": def("Job tracker (pro on the way / job done)", "a booked home-service job: live tracking of the pro on a map with arrival time, progress and a door code, then the finished job with what was done, before and after photos, a receipt, a tip and a rating",
    ["map", "eta", "progress", "status-steps", "pro-card", "call-button", "receipt", "tip-selector", "star-rating", "chips", "home-services"], "job-tracker", {
      variants: {
        "on-the-way": { name: "Job tracker: pro on the way", shows: "a live map with the pro's van, route and the customer's home, the arrival time and minutes away inside the booked window, a five-step progress bar, the pro with call and message buttons, the van and plate, a door code to share, a status timeline and reschedule or cancel actions" },
        "job-done": { name: "Job done: pay, tip and rate", shows: "the finished job: a success header, what the pro did with before and after photos, a receipt against the estimate, tip choices, the saved card and a pay button, a five-star rating with quick tags and a written review" },
      },
    }),
};
