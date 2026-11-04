/* Operations family (Rosterline — fictional scheduling + operations app for "Kiln & Crumb", a three-location bakery-café).
   Demand (real MCP queries, 4-Nov-2026, a claude.ai small-business admin build): "team staff schedule management with weekly shifts
   and roles", "month calendar with leave and time off marks for one team member", "operations home dashboard today sales and alerts
   for two locations", "inventory stock list with low stock alerts and receive stock", "product inventory table with stock levels,
   low stock badges and restock form".
   Patterns: shift-scheduler, leave-calendar, time-off-request (request | conflict | review), ops-dashboard, inventory-stock (low-stock | receive-stock).
   One story throughout: week Mon 16 – Sun 22 Nov 2026 at Harbour St; Lin Park (barista lead) asks for annual leave Mon 23 – Wed 25 Nov;
   Tue 24 opening would drop to 1 barista (minimum 2) → Hana Sato covers → Mara Okafor (owner) approves. Locations: Harbour St, Millbrook, Eastgate. */
const { ic, esc, status, tabBar, sideNav, ICON } = require("../lib");

Object.assign(ICON, {
  ops_plane: '<path d="M3 13l18-8-5 15-4-6-6-1z"/><path d="M12 14l4-5"/>',
  ops_box: '<path d="M3 7.5L12 3l9 4.5v9L12 21l-9-4.5z"/><path d="M3 7.5l9 4.5 9-4.5M12 12v9"/>',
  ops_store: '<path d="M4 9l1.5-5h13L20 9M4 9v11h16V9M4 9h16M9 20v-6h6v6"/>',
  ops_alert: '<path d="M12 3l9.5 17h-19z"/><path d="M12 10v4.5M12 17.5h.01"/>',
  ops_truck: '<path d="M2 6h12v10H2zM14 9h4l4 4v3h-8"/><circle cx="6" cy="17.5" r="1.8"/><circle cx="17.5" cy="17.5" r="1.8"/>',
  ops_swap: '<path d="M4 8h14l-3-3M20 16H6l3 3"/>',
  ops_info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
});

const H = (st, px) => Math.round(px * st.hscale);
const tint = (pct, v = "primary") => `color-mix(in oklab,var(--${v}) ${pct}%,var(--surface))`;
const NAV = [["home", "Today"], ["calendar", "Schedule"], ["ops_plane", "Time off"], ["ops_box", "Inventory"], ["chart", "Reports"], ["users", "Team"], ["gear", "Settings"]];
const TABS = [["home", "Today"], ["calendar", "Schedule"], ["ops_plane", "Time off"], ["ops_box", "Stock"]];
const LOCS = ["Harbour St", "Millbrook", "Eastgate"];
const ROLE = { Barista: "primary", Baker: "accent", Front: "muted", Porter: "text" };
const av = (ini, s = 28, k = 0) => `<span style="flex:none;width:${s}px;height:${s}px;border-radius:50%;display:grid;place-items:center;font:600 ${Math.round(s * 0.38)}px var(--font-b);background:${tint(16 + (k % 3) * 7, k % 2 ? "accent" : "primary")};color:color-mix(in oklab,var(--${k % 2 ? "accent" : "primary"}) 72%,var(--text))">${ini}</span>`;
const chip = (t, on) => `<span style="display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 12px;border-radius:999px;font-size:12.5px;font-weight:500;white-space:nowrap;${on ? "background:var(--primary);color:var(--on-primary);border:1px solid var(--primary)" : "border:1px solid var(--border);background:var(--surface)"}">${t}</span>`;
const seg = (items, on, h = 32) => `<div style="display:inline-flex;border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;background:var(--surface)">${items.map((t, i) => `<span style="height:${h}px;padding:0 12px;display:grid;place-items:center;font-size:12.5px;font-weight:500;${i ? "border-left:1px solid var(--border);" : ""}${i === on ? "background:var(--primary);color:var(--on-primary)" : ""}">${t}</span>`).join("")}</div>`;
const sbadge = (t, k) => `<span style="display:inline-flex;align-items:center;gap:4px;height:20px;padding:0 8px;border-radius:999px;font:600 11px var(--font-b);white-space:nowrap;background:color-mix(in oklab,var(--${k}) 14%,var(--surface));color:color-mix(in oklab,var(--${k}) 78%,var(--text))">${t}</span>`;
const alertBox = (title, body, k = "danger", big = true) => `<div role="alert" style="display:flex;gap:10px;align-items:flex-start;padding:${big ? "12px 14px" : "10px 12px"};border-radius:var(--radius);border:1px solid color-mix(in oklab,var(--${k}) 45%,var(--border));background:color-mix(in oklab,var(--${k}) 8%,var(--surface));font-size:${big ? 13 : 12}px"><span style="color:var(--${k});display:flex;margin-top:1px">${ic("ops_alert", 16)}</span><div><div style="font-weight:600;color:color-mix(in oklab,var(--${k}) 80%,var(--text))">${title}</div><div style="margin-top:2px">${body}</div></div></div>`;
const locSwitch = (loc = "Harbour St") => `<span class="btn" style="gap:8px">${ic("ops_store", 15)}${loc}${ic("chevdown", 14)}</span>`;
const topbar = (title, right = "") => `<div class="top"><div style="font-weight:600;font-size:15px">${title}</div><div class="search">${ic("search", 15)}Search staff, shifts, items</div>${right}<span style="display:flex;color:var(--muted)">${ic("bell", 19)}</span></div>`;
const hatch = `repeating-linear-gradient(135deg,color-mix(in oklab,var(--muted) 16%,var(--surface)) 0 5px,var(--surface) 5px 10px)`;

/* ---------------------------------------------------------------- shift-scheduler */
const WEEK = [["Mon", 16], ["Tue", 17], ["Wed", 18], ["Thu", 19], ["Fri", 20], ["Sat", 21], ["Sun", 22]];
// [name, initials, role, contracted h, shifts per day: "06-14" | "off" | "TO:label" | null]
const STAFF = [
  ["Lin Park", "LP", "Barista", 40, ["06-14", "06-14", "10-18", null, "06-14", "07-15", null]],
  ["Hana Sato", "HS", "Barista", 38, [null, "10-18", "06-14", "06-14", null, "07-15", "08-14"]],
  ["Omar Haddad", "OH", "Barista", 30, ["10-18", null, "06-11", "10-18", "10-18", null, "TO:Unavailable"]],
  ["Sam Achebe", "SA", "Baker", 40, ["04-12", "04-12", "04-12", "04-12", "04-12", null, null]],
  ["Jonah Weiss", "JW", "Baker", 40, [null, null, "05-13", "05-13", "05-13", "04-12", "05-13"]],
  ["Teodora Ruiz", "TR", "Front", 40, ["07-15", "07-15", null, "11-19", "11-19", "08-16", null]],
  ["Priya Nair", "PN", "Front", 20, [null, "11-17", "11-17", null, null, "09-17", "09-15"]],
  ["Freya Lund", "FL", "Porter", 25, ["12-18", "12-18", "12-18", "TO:Annual leave", "TO:Annual leave", null, null]],
];
const hrs = (s) => { const [a, b] = s.split("-").map(Number); return b - a; };
const shiftBlock = (s, role, compact) => {
  if (!s) return "";
  if (s.startsWith("TO:")) return `<div style="height:100%;border-radius:var(--radius-sm);background:${hatch};border:1px dashed var(--border);display:grid;place-items:center;font-size:11px;font-weight:600;color:var(--muted)">${s.slice(3)}</div>`;
  const [a, b] = s.split("-");
  return `<div style="height:100%;border-radius:var(--radius-sm);background:${tint(14, ROLE[role])};border-left:3px solid var(--${ROLE[role]});padding:${compact ? "4px 7px" : "5px 8px"};display:grid;align-content:center;gap:1px"><span class="num" style="font-size:12px">${a}:00–${b}:00</span><span style="font-size:10.5px;color:var(--muted)">${role === "Front" ? "Front of house" : role}</span></div>`;
};
const ssWeb = (p, st) => {
  const tot = STAFF.map((r) => r[4].filter((s) => s && !s.startsWith("TO")).reduce((a, s) => a + hrs(s), 0));
  const dayH = WEEK.map((_, d) => STAFF.reduce((a, r) => a + (r[4][d] && !r[4][d].startsWith("TO") ? hrs(r[4][d]) : 0), 0));
  const labour = [23.8, 24.6, 27.9, 24.1, 22.7, 21.4, 25.2];
  const cols = "196px repeat(7,1fr)";
  return `<div class="shell">${sideNav(p, "Schedule", NAV)}<main class="main">${topbar("Kiln &amp; Crumb", locSwitch())}
<div class="page" style="gap:14px;padding:20px 24px">
<div style="display:flex;align-items:center;gap:12px"><div class="ph"><h1 style="font-size:${H(st, 24)}px">Schedule · Harbour St</h1></div>
<div style="display:flex;align-items:center;gap:6px;margin-left:16px"><span class="btn" style="width:34px;padding:0">${ic("back", 15)}</span><span style="font-weight:600;font-size:14px;padding:0 6px">16 – 22 Nov 2026</span><span class="btn" style="width:34px;padding:0">${ic("chevron", 15)}</span></div>
<div style="margin-left:auto;display:flex;gap:8px;align-items:center">${seg(["Day", "Week", "Month"], 1)}<span class="btn">${ic("ops_swap", 15)}Copy last week</span><span class="btn primary">Publish week <span style="display:inline-grid;place-items:center;min-width:20px;height:18px;border-radius:9px;background:color-mix(in oklab,var(--on-primary) 22%,transparent);font-size:11px">3</span></span></div></div>
<div style="display:flex;gap:16px;font-size:12px;align-items:center" class="muted">${Object.entries(ROLE).map(([r, k]) => `<span style="display:inline-flex;gap:6px;align-items:center"><span style="width:10px;height:10px;border-radius:3px;background:var(--${k})"></span>${r === "Front" ? "Front of house" : r === "Porter" ? "Kitchen porter" : r}</span>`).join("")}<span style="display:inline-flex;gap:6px;align-items:center"><span style="width:14px;height:10px;border-radius:3px;background:${hatch};border:1px dashed var(--border)"></span>Time off / unavailable</span><span style="margin-left:auto">Draft · last edited by Mara Okafor 12 min ago</span></div>
<div class="card" style="overflow:hidden;padding:0">
<div style="display:grid;grid-template-columns:${cols};border-bottom:1px solid var(--border);background:color-mix(in oklab,var(--surface) 50%,var(--bg))">
<div style="padding:10px 14px;font-size:12px;font-weight:600" class="muted">Team (8)</div>
${WEEK.map(([d, n], i) => `<div style="padding:8px 10px;border-left:1px solid var(--border);display:flex;justify-content:space-between;align-items:center"><span style="font-size:12.5px"><b>${d}</b> <span class="muted">${n}</span></span>${i === 2 ? sbadge("1 short", "warning") : ""}</div>`).join("")}</div>
<div style="display:grid;grid-template-columns:${cols};border-bottom:1px solid var(--border);height:52px;background:${tint(5)}">
<div style="padding:8px 14px;display:flex;flex-direction:column;justify-content:center"><b style="font-size:13px">Open shifts</b><span class="muted" style="font-size:11.5px">2 need cover</span></div>
${WEEK.map((_, i) => `<div style="border-left:1px solid var(--border);padding:5px">${i === 2 ? `<div style="height:100%;border-radius:var(--radius-sm);border:1.5px dashed var(--primary);display:flex;align-items:center;justify-content:space-between;padding:0 8px"><span><span class="num" style="font-size:12px">06:00–14:00</span><div style="font-size:10.5px" class="muted">Barista · open</div></span>${ic("plus", 14)}</div>` : i === 5 ? `<div style="height:100%;border-radius:var(--radius-sm);border:1.5px dashed var(--border);display:flex;align-items:center;justify-content:space-between;padding:0 8px"><span><span class="num" style="font-size:12px">12:00–18:00</span><div style="font-size:10.5px" class="muted">Porter · 2 offers</div></span>${ic("users", 14)}</div>` : ""}</div>`).join("")}</div>
${STAFF.map((r, k) => `<div style="display:grid;grid-template-columns:${cols};border-bottom:1px solid var(--border);height:62px">
<div style="padding:0 14px;display:flex;gap:10px;align-items:center">${av(r[1], 30, k)}<div style="min-width:0"><div style="font-weight:600;font-size:13px;white-space:nowrap">${r[0]}</div><div style="font-size:11.5px;${tot[k] > r[3] ? "color:color-mix(in oklab,var(--warning) 80%,var(--text))" : ""}" class="${tot[k] > r[3] ? "" : "muted"}">${tot[k]} / ${r[3]} h</div></div></div>
${r[4].map((s) => `<div style="border-left:1px solid var(--border);padding:5px">${shiftBlock(s, r[2])}</div>`).join("")}</div>`).join("")}
<div style="display:grid;grid-template-columns:${cols};height:50px;background:color-mix(in oklab,var(--surface) 50%,var(--bg))">
<div style="padding:0 14px;display:flex;flex-direction:column;justify-content:center"><b style="font-size:12.5px">Day totals</b><span class="muted" style="font-size:11px">labour % of forecast sales</span></div>
${dayH.map((h, i) => `<div style="border-left:1px solid var(--border);padding:0 10px;display:flex;flex-direction:column;justify-content:center"><span class="num" style="font-size:13px">${h} h</span><span style="font-size:11px;${labour[i] > 26 ? "color:color-mix(in oklab,var(--warning) 80%,var(--text));font-weight:600" : ""}" class="${labour[i] > 26 ? "" : "muted"}">${labour[i]}%</span></div>`).join("")}</div>
</div></div></main></div>`;
};
const ssMobile = (p, st) => {
  const day = 1, list = STAFF.map((r, k) => [r, k]).filter(([r]) => r[4][day] && !r[4][day].startsWith("TO")).sort((a, b) => +a[0][4][day].split("-")[0] - +b[0][4][day].split("-")[0]);
  return `<div class="phone">${status()}
<div class="mtop"><div><div class="muted" style="font-size:12px;display:flex;gap:4px;align-items:center">${ic("ops_store", 13)}Harbour St${ic("chevdown", 12)}</div><h1 style="font-size:${H(st, 22)}px;margin-top:2px">Schedule</h1></div><span class="btn primary" style="height:34px">Publish</span></div>
<div class="mbody" style="gap:12px">
<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px">${WEEK.map(([d, n], i) => `<div style="height:56px;border-radius:var(--radius);display:grid;align-content:center;justify-items:center;font-size:11px;${i === day ? "background:var(--primary);color:var(--on-primary)" : "border:1px solid var(--border)"}"><span style="${i === day ? "" : "color:var(--muted)"}">${d}</span><b class="num" style="font-size:16px">${n}</b>${i === 2 ? `<span style="width:5px;height:5px;border-radius:50%;background:var(--warning)"></span>` : ""}</div>`).join("")}</div>
<div style="display:flex;justify-content:space-between;align-items:baseline"><b style="font-size:15px">Tue 17 Nov · 7 shifts</b><span class="muted" style="font-size:12px">46 h · labour 24.6%</span></div>
${list.slice(0, 6).map(([r, k]) => { const [a, b] = r[4][day].split("-").map(Number); return `<div style="display:grid;grid-template-columns:34px 1fr;gap:10px;align-items:center">${av(r[1], 34, k)}<div><div style="display:flex;justify-content:space-between;font-size:13px"><b>${r[0]}</b><span class="num" style="font-size:12.5px">${String(a).padStart(2, "0")}:00–${b}:00</span></div>
<div style="position:relative;height:8px;margin-top:6px;border-radius:4px;background:color-mix(in oklab,var(--muted) 12%,var(--surface))"><span style="position:absolute;left:${(a - 4) / 15 * 100}%;width:${(b - a) / 15 * 100}%;top:0;bottom:0;border-radius:4px;background:var(--${ROLE[r[2]]})"></span></div><div class="muted" style="font-size:11px;margin-top:3px">${r[2] === "Front" ? "Front of house" : r[2] === "Porter" ? "Kitchen porter" : r[2]}</div></div></div>`; }).join("")}
<div class="card" style="padding:12px 14px;display:flex;gap:10px;align-items:center;border-style:dashed;border-color:var(--primary)"><span style="color:var(--primary);display:flex">${ic("plus", 18)}</span><div style="flex:1;font-size:13px"><b>Open shift · Wed 18</b><div class="muted" style="font-size:12px">Barista 06:00–14:00 · 1 below minimum</div></div><span class="btn" style="height:32px">Offer</span></div>
</div>${tabBar("Schedule", TABS)}</div>`;
};

/* ---------------------------------------------------------------- leave-calendar */
// Nov 2026, Monday-first. 1 Nov 2026 is a Sunday.
const NOV = (() => { const out = []; const first = new Date(Date.UTC(2026, 10, 1)), lead = (first.getUTCDay() + 6) % 7; for (let i = 0; i < 42; i++) { const d = new Date(Date.UTC(2026, 10, 1 - lead + i)); out.push({ d: d.getUTCDate(), m: d.getUTCMonth(), dow: (d.getUTCDay() + 6) % 7 }); } return out; })();
// Lin Park's marks
const LIN = { 6: ["Sick day", "danger"], 13: ["Half day (pm)", "accent"], 23: ["Annual leave", "primary"], 24: ["Annual leave", "primary"], 25: ["Annual leave", "primary"] };
const TEAM_OFF = { 19: ["FL"], 20: ["FL"], 30: ["SA"], 27: ["OH"] };
const balanceCards = (compact) => [["Annual leave", "6.5", "of 14 days left", 0.54, "primary"], ["Sick days", "2", "used this year", 0.2, "danger"], ["Pending", "1", "request (Dec)", 0, "muted"]].map(([t, n, s, f, k]) =>
  `<div class="card" style="padding:${compact ? "10px 12px" : "14px 16px"};display:grid;gap:4px"><div class="muted" style="font-size:12px">${t}</div><div style="display:flex;align-items:baseline;gap:6px"><span class="num" style="font-size:${compact ? 20 : 24}px">${n}</span><span class="muted" style="font-size:12px">${s}</span></div>${f ? `<div style="height:5px;border-radius:3px;background:color-mix(in oklab,var(--muted) 14%,var(--surface))"><div style="height:100%;width:${f * 100}%;border-radius:3px;background:var(--${k})"></div></div>` : ""}</div>`);
const balances = (compact) => balanceCards(compact).join("");
const legend = () => `<div style="display:flex;flex-wrap:wrap;gap:12px;font-size:12px" class="muted">${[["Annual leave", "primary"], ["Sick", "danger"], ["Half day", "accent"]].map(([t, k]) => `<span style="display:inline-flex;gap:6px;align-items:center"><span style="width:10px;height:10px;border-radius:3px;background:var(--${k})"></span>${t}</span>`).join("")}<span style="display:inline-flex;gap:6px;align-items:center"><span style="width:16px;height:16px;border-radius:50%;font-size:8px;display:grid;place-items:center;border:1px solid var(--border)">FL</span>Teammate off</span></div>`;
const cell = (c, big) => {
  const m = c.m === 10 && LIN[c.d], weekend = c.dow > 4, other = c.m !== 10;
  return `<div style="padding:${big ? "8px 9px" : "4px"};border-right:1px solid var(--border);border-bottom:1px solid var(--border);display:flex;flex-direction:column;gap:4px;min-height:0;${other ? "color:var(--muted);background:color-mix(in oklab,var(--muted) 5%,var(--surface))" : weekend ? "background:color-mix(in oklab,var(--muted) 4%,var(--surface))" : ""}">
<div style="display:flex;justify-content:space-between;align-items:center"><span class="num" style="font-size:${big ? 13 : 12}px;${c.m === 10 && c.d === 5 ? "width:22px;height:22px;border-radius:50%;display:grid;place-items:center;background:var(--text);color:var(--bg)" : ""}">${c.d}</span>${big && c.m === 10 && TEAM_OFF[c.d] ? TEAM_OFF[c.d].map((x) => `<span style="width:20px;height:20px;border-radius:50%;font-size:9px;font-weight:600;display:grid;place-items:center;border:1px solid var(--border)">${x}</span>`).join("") : ""}</div>
${m ? (big ? `<div style="border-radius:var(--radius-sm);padding:4px 6px;font-size:11px;font-weight:600;background:${tint(16, m[1])};border-left:3px solid var(--${m[1]});color:color-mix(in oklab,var(--${m[1]}) 70%,var(--text))">${m[0]}${c.d === 23 ? `<div style="font-weight:500;color:var(--muted)">Approved · 3 days</div>` : ""}</div>` : `<span style="height:6px;border-radius:3px;background:var(--${m[1]})"></span>`) : ""}</div>`;
};
const lcWeb = (p, st) => `<div class="shell">${sideNav(p, "Time off", NAV)}<main class="main">${topbar("Kiln &amp; Crumb", locSwitch())}
<div class="page" style="grid-template-columns:minmax(0,1fr) 300px;gap:20px;padding:20px 24px">
<div style="display:flex;flex-direction:column;gap:12px;min-width:0">
<div style="display:flex;align-items:center;gap:12px"><span style="display:flex;gap:10px;align-items:center">${av("LP", 40, 0)}<span><h1 style="font-size:${H(st, 22)}px">Lin Park</h1><span class="muted" style="font-size:12.5px">Barista lead · Harbour St · 40 h/week</span></span></span>
<div style="margin-left:auto;display:flex;gap:8px;align-items:center">${seg(["Lin Park", "Whole team"], 0)}<span class="btn" style="width:34px;padding:0">${ic("back", 15)}</span><b style="font-size:14px;padding:0 4px">November 2026</b><span class="btn" style="width:34px;padding:0">${ic("chevron", 15)}</span><span class="btn primary">${ic("plus", 15)}Request time off</span></div></div>
${legend()}
<div class="card" style="padding:0;overflow:hidden;display:grid;grid-template-rows:34px repeat(6,1fr);height:700px">
<div style="display:grid;grid-template-columns:repeat(7,1fr);border-bottom:1px solid var(--border)">${["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => `<div style="padding:8px 9px;font-size:12px;font-weight:600;border-right:1px solid var(--border)" class="muted">${d}</div>`).join("")}</div>
${[0, 1, 2, 3, 4, 5].map((w) => `<div style="display:grid;grid-template-columns:repeat(7,1fr);min-height:0">${NOV.slice(w * 7, w * 7 + 7).map((c) => cell(c, true)).join("")}</div>`).join("")}</div></div>
<aside style="display:grid;gap:12px;align-content:start">
<div style="font-weight:600;font-size:14px">Balances · 2026</div>${balances()}
<div class="card" style="padding:14px 16px;display:grid;gap:10px"><div style="font-weight:600;font-size:14px">Upcoming</div>
${[["Mon 23 – Wed 25 Nov", "Annual leave · 3 days", "Approved", "success"], ["Mon 21 – Fri 25 Dec", "Annual leave · 4 days", "Pending", "warning"]].map(([d, t, s, k]) => `<div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start;font-size:13px"><div><b>${d}</b><div class="muted" style="font-size:12px">${t}</div></div>${sbadge(s, k)}</div>`).join("")}</div>
<div class="card" style="padding:14px 16px;display:grid;gap:8px;font-size:12.5px"><div style="font-weight:600;font-size:14px">Also off at Harbour St</div>
${[["FL", "Freya Lund", "Thu 19 – Fri 20 Nov"], ["OH", "Omar Haddad", "Fri 27 Nov"], ["SA", "Sam Achebe", "Mon 30 Nov – Fri 4 Dec"]].map(([i, n, d], k) => `<div style="display:flex;gap:8px;align-items:center">${av(i, 24, k + 1)}<b style="font-weight:600">${n}</b><span class="muted" style="margin-left:auto">${d}</span></div>`).join("")}</div>
</aside></div></main></div>`;
const lcMobile = (p, st) => `<div class="phone">${status()}
<div class="mtop"><span style="display:flex;gap:10px;align-items:center">${av("LP", 36, 0)}<span><h1 style="font-size:${H(st, 19)}px">Lin Park</h1><span class="muted" style="font-size:12px">Barista lead · Harbour St</span></span></span><span class="btn primary" style="height:34px;width:34px;padding:0" aria-label="Request time off">${ic("plus", 17)}</span></div>
<div class="mbody" style="gap:12px">
<div style="display:flex;justify-content:space-between;align-items:center"><span class="btn" style="width:32px;height:32px;padding:0">${ic("back", 14)}</span><b style="font-size:15px">November 2026</b><span class="btn" style="width:32px;height:32px;padding:0">${ic("chevron", 14)}</span></div>
<div class="card" style="padding:0;overflow:hidden"><div style="display:grid;grid-template-columns:repeat(7,1fr)">${["M", "T", "W", "T", "F", "S", "S"].map((d) => `<div style="padding:6px 0;text-align:center;font-size:11px;font-weight:600;border-bottom:1px solid var(--border)" class="muted">${d}</div>`).join("")}
${NOV.map((c) => { const m = c.m === 10 && LIN[c.d]; return `<div style="height:40px;display:grid;justify-items:center;align-content:center;gap:4px;${c.m !== 10 ? "color:var(--muted)" : ""}"><span class="num" style="font-size:13px;width:26px;height:26px;border-radius:50%;display:grid;place-items:center;${m ? `background:${tint(18, m[1])};color:color-mix(in oklab,var(--${m[1]}) 70%,var(--text));font-weight:700` : c.m === 10 && c.d === 5 ? "border:1.5px solid var(--text)" : ""}">${c.d}</span>${c.m === 10 && TEAM_OFF[c.d] ? `<span style="width:4px;height:4px;border-radius:50%;background:var(--muted)"></span>` : `<span style="height:4px"></span>`}</div>`; }).join("")}</div></div>
${legend()}
<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">${balanceCards(true).slice(0, 2).join("")}</div>
<div class="card" style="padding:12px 14px;display:flex;justify-content:space-between;align-items:center;font-size:13px"><div><b>Mon 23 – Wed 25 Nov</b><div class="muted" style="font-size:12px">Annual leave · 3 days</div></div>${sbadge("Approved", "success")}</div>
<div class="card" style="padding:12px 14px;display:flex;justify-content:space-between;align-items:center;font-size:13px"><div><b>Mon 21 – Fri 25 Dec</b><div class="muted" style="font-size:12px">Annual leave · 4 days</div></div>${sbadge("Pending", "warning")}</div>
</div>${tabBar("Time off", TABS)}</div>`;

/* ---------------------------------------------------------------- time-off-request (request | conflict | review) */
const LIN_SHIFTS = [["Mon 23", "06:00–14:00", "Barista", "3 of min 2", "ok"], ["Tue 24", "06:00–14:00", "Barista", "1 of min 2", "short"], ["Wed 25", "10:00–18:00", "Barista", "2 of min 2", "ok"]];
const typeChips = () => `<div style="display:flex;flex-wrap:wrap;gap:8px">${["Annual leave", "Sick", "Unpaid", "Other"].map((t, i) => chip(t, i === 0)).join("")}</div>`;
const dateFields = (err, compact) => `<div style="display:grid;grid-template-columns:1fr 1fr;gap:${compact ? 10 : 14}px">${[["From", "Mon 23 Nov 2026"], ["To", "Wed 25 Nov 2026"]].map(([l, v]) => `<div class="field"><label>${l}</label><div class="input filled" style="gap:8px;${err ? "border-color:var(--danger);box-shadow:0 0 0 1px var(--danger)" : ""}" ${err ? 'aria-invalid="true"' : ""}>${ic("calendar", 15)}${v}</div></div>`).join("")}</div>
${err ? `<div style="font-size:12px;color:color-mix(in oklab,var(--danger) 80%,var(--text));display:flex;gap:6px;align-items:center;margin-top:-4px">${ic("ops_info", 14)}Tue 24 Nov leaves the opening shift below the minimum of 2 baristas.</div>` : ""}`;
const halfDay = () => `<div style="display:flex;gap:20px;font-size:13px">${[["Start with a half day", false], ["End with a half day", false]].map(([t, on]) => `<label style="display:flex;gap:9px;align-items:center"><span role="switch" aria-checked="${on}" style="width:34px;height:20px;border-radius:999px;position:relative;background:${on ? "var(--primary)" : "color-mix(in oklab,var(--muted) 30%,var(--surface))"}"><span style="position:absolute;top:2px;left:${on ? 16 : 2}px;width:16px;height:16px;border-radius:50%;background:var(--surface);box-shadow:var(--shadow-sm)"></span></span>${t}</label>`).join("")}</div>`;
const shiftImpact = (err) => `<div style="display:grid;gap:8px">${LIN_SHIFTS.map(([d, t, r, n, s]) => { const bad = err && s === "short"; return `<div style="display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:var(--radius);border:1px solid ${bad ? "color-mix(in oklab,var(--danger) 45%,var(--border))" : "var(--border)"};${bad ? "background:color-mix(in oklab,var(--danger) 6%,var(--surface))" : ""};font-size:13px"><b style="width:56px">${d}</b><span class="num" style="font-size:13px">${t}</span><span class="muted">${r}</span><span style="margin-left:auto;font-size:12px">${s === "short" ? (err ? sbadge("1 of min 2", "danger") : sbadge("needs cover", "warning")) : `<span class="muted">${n} after</span>`}</span></div>`; }).join("")}</div>`;
const reqSummary = (err) => `<div class="card" style="padding:18px;display:grid;gap:12px;align-self:start">
<div style="font-weight:600;font-size:15px">Summary</div>
${[["Type", "Annual leave"], ["Dates", "Mon 23 – Wed 25 Nov"], ["Working days", "3"], ["Shifts released", "3 (24 h)"]].map(([k, v]) => `<div style="display:flex;justify-content:space-between;font-size:13px"><span class="muted">${k}</span><b style="font-weight:600">${v}</b></div>`).join("")}
<div style="border-top:1px solid var(--border);padding-top:12px;display:grid;gap:6px"><div style="display:flex;justify-content:space-between;font-size:13px"><span class="muted">Annual leave balance</span><span><span class="num" style="font-size:13px">9.5</span> → <b class="num" style="font-size:15px">6.5 days</b></span></div>
<div style="height:6px;border-radius:3px;background:color-mix(in oklab,var(--muted) 14%,var(--surface));position:relative"><div style="position:absolute;inset:0 32% 0 0;border-radius:3px;background:${tint(40)}"></div><div style="position:absolute;inset:0 54% 0 0;border-radius:3px;background:var(--primary)"></div></div></div>
<div style="display:flex;gap:10px;align-items:center;font-size:12.5px;padding-top:4px">${av("MO", 28, 1)}<span>Goes to <b>Mara Okafor</b><div class="muted" style="font-size:12px">usually replies within a day</div></span></div>
${err ? `<button class="btn primary block">${ic("ops_swap", 15)}Ask Hana to cover Tue</button><button class="btn block">Send anyway with a note</button>` : `<button class="btn primary block">Send request</button><button class="btn block">Save draft</button>`}</div>`;
const conflictAlert = (big) => alertBox("Tuesday’s opening would be short-staffed", big ? `Without you, Tue 24 Nov 06:00–14:00 at Harbour St has 1 barista (minimum 2). <b>Hana Sato</b> is free and asked for extra hours — ask her to cover, or move your leave to Wed 25 – Fri 27 Nov.` : `Tue 24 Nov opening drops to 1 barista (min 2). Hana Sato is free to cover.`, "danger", big);

const torWebRequest = (p, st, err) => `<div class="shell">${sideNav(p, "Time off", NAV)}<main class="main">${topbar("Kiln &amp; Crumb", locSwitch())}
<div class="page" style="grid-template-columns:minmax(0,1fr) 340px;gap:24px;padding:22px 32px;max-width:1160px">
<div style="display:flex;flex-direction:column;gap:14px;min-width:0">
<div><div class="muted" style="font-size:13px;display:flex;gap:6px;align-items:center">${ic("back", 14)}Time off</div><h1 style="font-size:${H(st, 26)}px;margin-top:6px">Request time off</h1></div>
${err ? conflictAlert(true) : ""}
<div class="card" style="padding:18px 20px;display:grid;gap:16px">
<div class="field"><label>Type</label>${typeChips()}</div>
${dateFields(err)}
${halfDay()}
<div class="field"><label>Note for Mara <span class="muted" style="font-weight:400">(optional)</span></label><div class="input filled" style="height:${err ? 56 : 66}px;align-items:flex-start;padding-top:10px;line-height:1.45;font-size:13.5px">Family visiting from Busan that week. Happy to swap my Sat 28 Nov shift if it helps.</div></div></div>
<div class="card" style="padding:16px 20px;display:grid;gap:10px"><div style="display:flex;justify-content:space-between;align-items:baseline"><b style="font-size:15px">Your shifts in these dates</b><span class="muted" style="font-size:12.5px">They’ll become open shifts once approved</span></div>${shiftImpact(err)}</div>
</div>${reqSummary(err)}</div></main></div>`;
const torMobileRequest = (p, st, err) => `<div class="phone">${status()}
<div class="mtop"><span style="display:flex">${ic("x", 22)}</span><b style="font-size:16px">Request time off</b><span style="width:22px"></span></div>
<div class="mbody" style="gap:12px">
${err ? conflictAlert(false) : ""}
<div class="field"><label>Type</label>${typeChips()}</div>
${dateFields(err, true)}
<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 12px;border-radius:var(--radius);background:${tint(8)};font-size:13px"><span>3 working days</span><span>Balance <span class="num">9.5</span> → <b class="num">6.5</b></span></div>
<div class="field"><label>Note for Mara</label><div class="input filled" style="height:58px;align-items:flex-start;padding-top:9px;line-height:1.4;font-size:13px">Family visiting that week. Happy to swap my Sat 28 Nov shift.</div></div>
<b style="font-size:13.5px">Shifts you’d release</b>
${LIN_SHIFTS.map(([d, t, , , s]) => `<div style="display:flex;justify-content:space-between;align-items:center;font-size:13px;padding:${err && s === "short" ? "8px 10px" : "0 2px"};${err && s === "short" ? "border-radius:var(--radius);background:color-mix(in oklab,var(--danger) 7%,var(--surface))" : ""}"><span><b>${d}</b> <span class="num muted" style="font-weight:500">${t}</span></span>${s === "short" ? sbadge(err ? "1 of min 2" : "needs cover", err ? "danger" : "warning") : `<span class="muted" style="font-size:12px">covered</span>`}</div>`).join("")}
<div style="margin-top:auto;display:grid;gap:8px">${err ? `<button class="btn primary block">Ask Hana to cover Tue</button><button class="btn block">Send anyway</button>` : `<button class="btn primary block">Send request to Mara</button>`}</div>
</div></div>`;

const COVER = [["Mon 23", "06:00–14:00 opening", "2", "3", "Hana Sato, Omar Haddad, +1", "ok"], ["Tue 24", "06:00–14:00 opening", "2", "2", "Hana Sato (accepted swap)", "ok"], ["Wed 25", "10:00–18:00 mid", "2", "2", "Omar Haddad, Priya Nair*", "warn"]];
const PENDING = [["LP", "Lin Park", "Annual leave · Mon 23 – Wed 25 Nov", "3 days", true], ["OH", "Omar Haddad", "Annual leave · Fri 27 Nov", "1 day"], ["SA", "Sam Achebe", "Annual leave · 30 Nov – 4 Dec", "5 days"], ["PN", "Priya Nair", "Unpaid · Sat 12 Dec", "1 day"]];
const reviewDetail = (compact) => `<div style="display:flex;gap:12px;align-items:center">${av("LP", compact ? 40 : 48, 0)}<div><div style="font-weight:600;font-size:${compact ? 15 : 17}px">Lin Park</div><div class="muted" style="font-size:12.5px">Barista lead · Harbour St · sent Thu 5 Nov, 09:12</div></div>${compact ? "" : `<span style="margin-left:auto">${sbadge("Awaiting you", "warning")}</span>`}</div>
<div style="display:grid;grid-template-columns:repeat(${compact ? 2 : 4},1fr);gap:${compact ? 8 : 12}px">${[["Type", "Annual leave"], ["Dates", "Mon 23 – Wed 25 Nov"], ["Days", "3 working days"], ["Balance after", "6.5 of 14"]].map(([k, v]) => `<div style="padding:10px 12px;border-radius:var(--radius);background:${tint(6)}"><div class="muted" style="font-size:11.5px">${k}</div><b style="font-size:13.5px">${v}</b></div>`).join("")}</div>
<div style="font-size:13.5px;line-height:1.5;padding:${compact ? "0" : "0 2px"}">“Family visiting from Busan that week. Happy to swap my Sat 28 Nov shift if it helps.”</div>`;
const coverTable = (compact) => `<div style="display:grid;gap:${compact ? 8 : 0}px">${compact ? COVER.map(([d, s, min, after, who, k]) => `<div style="display:flex;justify-content:space-between;align-items:center;font-size:13px"><span><b>${d}</b> <span class="muted">${s.split(" ")[0]}</span></span>${sbadge(`${after} of min ${min}`, k === "ok" ? "success" : "warning")}</div>`).join("")
  : `<table style="width:100%;border-collapse:collapse;font-size:13px"><thead><tr>${["Day", "Lin’s shift", "Baristas after", "Who’s on", ""].map((h) => `<th style="text-align:left;font-weight:600;font-size:12px;padding:8px 10px;border-bottom:1px solid var(--border)" class="muted">${h}</th>`).join("")}</tr></thead><tbody>
${COVER.map(([d, s, min, after, who, k]) => `<tr><td style="padding:10px;border-bottom:1px solid var(--border)"><b>${d}</b></td><td style="padding:10px;border-bottom:1px solid var(--border)" class="num">${s}</td><td style="padding:10px;border-bottom:1px solid var(--border)"><span class="num">${after}</span> <span class="muted">/ min ${min}</span></td><td style="padding:10px;border-bottom:1px solid var(--border)">${who}</td><td style="padding:10px;border-bottom:1px solid var(--border);text-align:right">${k === "ok" ? sbadge("Covered", "success") : sbadge("At minimum", "warning")}</td></tr>`).join("")}</tbody></table>
<div class="muted" style="font-size:12px;padding:8px 10px 0">* Priya would work 26 h that week (contract 20 h). Freya Lund is also off Thu 19 – Fri 20 Nov (approved).</div>`}</div>`;
const torWebReview = (p, st) => `<div class="shell">${sideNav(p, "Time off", NAV)}<main class="main">${topbar("Kiln &amp; Crumb", locSwitch("All locations"))}
<div style="flex:1;min-height:0;display:grid;grid-template-columns:340px 1fr">
<div style="border-right:1px solid var(--border);padding:18px 14px;display:flex;flex-direction:column;gap:10px;overflow:hidden">
<div style="display:flex;justify-content:space-between;align-items:center;padding:0 4px"><h1 style="font-size:${H(st, 20)}px">Requests</h1>${seg(["Pending 4", "Decided"], 0, 28)}</div>
${PENDING.map(([i, n, t, d, on], k) => `<div style="display:flex;gap:10px;padding:12px;border-radius:var(--radius);${on ? `background:${tint(10)};border:1px solid var(--primary)` : "border:1px solid var(--border);background:var(--surface)"}">${av(i, 34, k)}<div style="flex:1;min-width:0"><div style="display:flex;justify-content:space-between"><b style="font-size:13.5px">${n}</b><span class="muted" style="font-size:12px">${d}</span></div><div class="muted" style="font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${t}</div>${k === 0 ? `<div style="margin-top:4px">${sbadge("Cover found", "success")}</div>` : k === 2 ? `<div style="margin-top:4px">${sbadge("Overlaps 1 request", "warning")}</div>` : ""}</div></div>`).join("")}
</div>
<div style="padding:22px 28px;display:flex;flex-direction:column;gap:16px;overflow:hidden">
<div class="card" style="padding:20px;display:grid;gap:14px">${reviewDetail(false)}</div>
<div class="card" style="padding:16px 18px;display:grid;gap:8px"><div style="display:flex;justify-content:space-between;align-items:baseline"><b style="font-size:15px">Coverage check · Harbour St</b><span class="muted" style="font-size:12.5px">minimum 2 baristas per shift</span></div>${coverTable(false)}</div>
<div class="field"><label>Reply to Lin <span class="muted" style="font-weight:400">(optional)</span></label><div class="input filled">Enjoy the visit! Hana has your Tuesday opening.</div></div>
<div style="display:flex;gap:10px;justify-content:flex-end;align-items:center"><span class="muted" style="font-size:12.5px;margin-right:auto">Approving publishes Hana’s swap and notifies Lin and Hana.</span><button class="btn" style="color:color-mix(in oklab,var(--danger) 80%,var(--text));border-color:color-mix(in oklab,var(--danger) 45%,var(--border))">Decline</button><button class="btn primary">${ic("check", 15)}Approve 3 days</button></div>
</div></div></main></div>`;
const torMobileReview = (p, st) => `<div class="phone">${status()}
<div class="mtop"><span style="display:flex">${ic("back", 22)}</span><b style="font-size:16px">Time-off request</b><span>${sbadge("1 of 4", "muted")}</span></div>
<div class="mbody" style="gap:12px">
${reviewDetail(true)}
<div class="card" style="padding:12px 14px;display:grid;gap:8px"><b style="font-size:13.5px">Coverage · Harbour St baristas</b>${coverTable(true)}<div class="muted" style="font-size:11.5px">Hana Sato accepted Lin’s Tue 24 opening.</div></div>
<div class="field"><label>Reply to Lin</label><div class="input filled" style="font-size:13px">Enjoy the visit! Hana has your Tuesday.</div></div>
<div style="margin-top:auto;display:grid;grid-template-columns:1fr 2fr;gap:8px"><button class="btn" style="height:44px;color:color-mix(in oklab,var(--danger) 80%,var(--text))">Decline</button><button class="btn primary" style="height:44px">Approve 3 days</button></div>
</div></div>`;

/* ---------------------------------------------------------------- ops-dashboard */
const LOCDATA = [["Harbour St", 3618, 3400, 268, 6, 7, "Open · closes 18:00", 1], ["Millbrook", 2846, 3100, 205, 4, 5, "Open · closes 17:00", 1], ["Eastgate", 1948, 2050, 139, 4, 5, "Open · closes 16:00", 2]];
const ALERTS = [["danger", "ops_box", "Oat milk almost out · Millbrook", "4 left, par 24 · next delivery Fri", "Reorder"], ["warning", "clock", "Jonah Weiss hasn’t clocked in · Eastgate", "Shift started 11:00 · 40 min ago", "Call"], ["warning", "ops_truck", "Flour delivery running late · Harbour St", "Fieldgrain Flour Co. · new ETA 13:30", "Details"], ["muted", "card", "Card terminal 2 offline · Eastgate", "Since 10:52 · terminal 1 is working", "Fix"]];
const hourBars = (rnd, w, h) => {
  const hrsL = ["7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17"], now = 4, k = ["primary", "accent", "muted"];
  const gw = w / hrsL.length;
  return `<svg viewBox="0 0 ${w} ${h + 18}" width="100%" height="${h + 18}" role="img" aria-label="Sales per hour by location, today">${[0.33, 0.66].map((g) => `<line x1="0" x2="${w}" y1="${h * g}" y2="${h * g}" stroke="var(--border)" stroke-dasharray="3 4"/>`).join("")}
${hrsL.map((t, i) => { const base = [0.45, 0.8, 0.95, 0.7, 0.6, 0.85, 0.7, 0.5, 0.45, 0.4, 0.3][i]; return [0, 1, 2].map((j) => { const v = base * (1 - j * 0.22) * (0.85 + rnd() * 0.3), bh = Math.round(v * h * 0.95), x = i * gw + 6 + j * ((gw - 12) / 3); return `<rect x="${x.toFixed(1)}" y="${h - bh}" width="${((gw - 12) / 3 - 2).toFixed(1)}" height="${bh}" rx="2" fill="var(--${k[j]})" opacity="${i > now ? 0.28 : 1}"/>`; }).join("") + `<text x="${(i * gw + gw / 2).toFixed(1)}" y="${h + 14}" text-anchor="middle" font-size="10" fill="var(--muted)" font-family="var(--font-b)">${t}:00</text>`; }).join("")}
<line x1="${(now + 1) * gw}" x2="${(now + 1) * gw}" y1="0" y2="${h}" stroke="var(--text)" stroke-width="1"/></svg>`;
};
const kpis = (compact) => [["Sales today", "$8,412", "+6% vs last Thu", "success"], ["Orders", "612", "+41", "success"], ["Avg ticket", "$13.74", "−$0.22", "muted"], ["Labour", "24.1%", "of sales · target ≤ 26%", "muted"], ["On shift now", "14 / 17", "1 late · 2 on break", "warning"]].slice(0, compact ? 4 : 5).map(([l, v, d, k]) =>
  `<div class="card" style="padding:${compact ? "11px 12px" : "14px 16px"}"><div class="muted" style="font-size:12px">${l}</div><div class="num" style="font-size:${compact ? 21 : 26}px;margin-top:4px">${v}</div><div style="font-size:11.5px;margin-top:2px;${k === "muted" ? "" : `color:color-mix(in oklab,var(--${k}) 78%,var(--text))`}" class="${k === "muted" ? "muted" : ""}">${d}</div></div>`).join("");
const opsWeb = (p, st, rnd) => `<div class="shell">${sideNav(p, "Today", NAV)}<main class="main">${topbar("Kiln &amp; Crumb", locSwitch("All locations (3)"))}
<div class="page" style="gap:16px;padding:20px 24px">
<div style="display:flex;align-items:flex-end;justify-content:space-between"><div class="ph"><h1 style="font-size:${H(st, 24)}px">Good morning, Mara</h1><p style="font-size:13px">Thu 5 Nov 2026 · 11:40 · 3 locations open</p></div><div style="display:flex;gap:8px">${seg(["Today", "Week", "Month"], 0)}<span class="btn">${ic("download", 15)}Export</span></div></div>
<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:12px">${kpis(false)}</div>
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px">${LOCDATA.map(([n, s, t, o, on, of, open, al], i) => `<div class="card" style="padding:14px 16px;display:grid;gap:9px">
<div style="display:flex;justify-content:space-between;align-items:center"><span style="display:flex;gap:8px;align-items:center;font-weight:600;font-size:14px"><span style="width:10px;height:10px;border-radius:3px;background:var(--${["primary", "accent", "muted"][i]})"></span>${n}</span>${sbadge(`${al} alert${al > 1 ? "s" : ""}`, al > 1 ? "warning" : "muted")}</div>
<div style="display:flex;align-items:baseline;justify-content:space-between"><span class="num" style="font-size:22px">$${s.toLocaleString("en-US")}</span><span class="muted" style="font-size:12px">target $${t.toLocaleString("en-US")}</span></div>
<div style="height:6px;border-radius:3px;background:color-mix(in oklab,var(--muted) 14%,var(--surface))"><div style="height:100%;width:${Math.min(100, s / t * 100).toFixed(0)}%;border-radius:3px;background:${s >= t ? "var(--success)" : "var(--primary)"}"></div></div>
<div style="display:flex;justify-content:space-between;font-size:12px" class="muted"><span>${o} orders · ${on}/${of} staff on</span><span>${open}</span></div></div>`).join("")}</div>
<div style="display:grid;grid-template-columns:minmax(0,1.35fr) minmax(0,1fr);gap:12px">
<div class="card" style="padding:16px 18px;display:grid;gap:10px;align-content:start"><div style="display:flex;justify-content:space-between;align-items:baseline"><b style="font-size:14px">Sales per hour</b><span class="muted" style="font-size:12px;display:flex;gap:12px">${LOCS.map((l, i) => `<span style="display:inline-flex;gap:5px;align-items:center"><span style="width:8px;height:8px;border-radius:2px;background:var(--${["primary", "accent", "muted"][i]})"></span>${l}</span>`).join("")}</span></div>${hourBars(rnd, 640, 268)}</div>
<div class="card" style="padding:16px 18px;display:grid;gap:4px;align-content:start"><div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px"><b style="font-size:14px">Needs attention</b><span class="muted" style="font-size:12px">4 open</span></div>
${ALERTS.map(([k, i, t, s, a], j) => `<div style="display:flex;gap:10px;align-items:center;padding:9px 0;${j ? "border-top:1px solid var(--border)" : ""}"><span style="flex:none;width:32px;height:32px;border-radius:var(--radius);display:grid;place-items:center;background:color-mix(in oklab,var(--${k}) 14%,var(--surface));color:color-mix(in oklab,var(--${k}) 80%,var(--text))">${ic(i, 16)}</span><div style="flex:1;min-width:0"><div style="font-weight:600;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${t}</div><div class="muted" style="font-size:12px">${s}</div></div><span class="btn" style="height:30px;font-size:12px">${a}</span></div>`).join("")}</div>
</div></div></main></div>`;
const opsMobile = (p, st) => `<div class="phone">${status()}
<div class="mtop"><div><div class="muted" style="font-size:12px">Thu 5 Nov · 11:40</div><h1 style="font-size:${H(st, 22)}px">Today</h1></div><span style="position:relative;display:flex">${ic("bell", 22)}<span style="position:absolute;top:-3px;right:-4px;min-width:16px;height:16px;border-radius:8px;background:var(--danger);color:var(--on-danger);font:700 10px/16px var(--font-b);text-align:center">4</span></span></div>
<div class="mbody" style="gap:12px">
<div style="display:flex;gap:6px;overflow:hidden;flex:none">${chip("All 3", true)}${LOCS.map((l) => chip(l)).join("")}</div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">${kpis(true)}</div>
<b style="font-size:14px">Needs attention</b>
${ALERTS.slice(0, 3).map(([k, i, t, s]) => `<div style="display:flex;gap:10px;align-items:center"><span style="flex:none;width:34px;height:34px;border-radius:var(--radius);display:grid;place-items:center;background:color-mix(in oklab,var(--${k}) 14%,var(--surface));color:color-mix(in oklab,var(--${k}) 80%,var(--text))">${ic(i, 17)}</span><div style="flex:1;min-width:0"><div style="font-weight:600;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${t}</div><div class="muted" style="font-size:12px">${s}</div></div>${ic("chevron", 15)}</div>`).join("")}
<b style="font-size:14px">Locations</b>
${LOCDATA.map(([n, s, t, , on, of], i) => `<div style="display:grid;gap:5px"><div style="display:flex;justify-content:space-between;font-size:13px"><span style="display:flex;gap:7px;align-items:center"><span style="width:9px;height:9px;border-radius:3px;background:var(--${["primary", "accent", "muted"][i]})"></span><b>${n}</b><span class="muted" style="font-size:12px">${on}/${of} on</span></span><span class="num" style="font-size:14px">$${s.toLocaleString("en-US")}</span></div><div style="height:5px;border-radius:3px;background:color-mix(in oklab,var(--muted) 14%,var(--surface))"><div style="height:100%;width:${Math.min(100, s / t * 100).toFixed(0)}%;border-radius:3px;background:${s >= t ? "var(--success)" : "var(--primary)"}"></div></div></div>`).join("")}
</div>${tabBar("Today", TABS)}</div>`;

/* ---------------------------------------------------------------- inventory-stock (low-stock | receive-stock) */
// [item, sku, category, location, on hand, par, unit, last counted, suggested]
const ITEMS = [
  ["Oat milk 1 L", "DRY-0412", "Dairy & alt", "Millbrook", 4, 24, "cartons", "Today 07:10", "24"],
  ["Espresso beans, house blend", "COF-0101", "Coffee", "Harbour St", 3, 12, "kg", "Today 06:55", "12"],
  ["Takeaway cups 12 oz", "PKG-2203", "Packaging", "Eastgate", 0, 500, "cups", "Yesterday", "1,000"],
  ["Butter, unsalted 5 kg", "DRY-0207", "Dairy & alt", "Harbour St", 2, 6, "blocks", "Today 05:40", "6"],
  ["Bread flour 25 kg", "BAK-0010", "Baking", "Harbour St", 1, 4, "sacks", "Today 05:40", "On order"],
  ["Free-range eggs, tray of 30", "DRY-0330", "Dairy & alt", "Millbrook", 3, 8, "trays", "Today 07:10", "6"],
  ["Cup lids 12 oz", "PKG-2204", "Packaging", "Eastgate", 120, 500, "lids", "Yesterday", "500"],
  ["Vanilla syrup 750 ml", "SYR-0005", "Syrups", "Millbrook", 0, 4, "bottles", "Mon 2 Nov", "4"],
  ["Almond croissant dough", "BAK-0114", "Frozen", "Eastgate", 18, 40, "pieces", "Today 06:20", "40"],
];
const stockStatus = (o, par, sugg) => sugg === "On order" ? sbadge("On order", "muted") : o === 0 ? sbadge("Out", "danger") : o / par < 0.25 ? sbadge("Critical", "danger") : sbadge("Low", "warning");
const stockBar = (o, par, w = 70) => `<span style="display:inline-block;width:${w}px;height:5px;border-radius:3px;background:color-mix(in oklab,var(--muted) 14%,var(--surface));vertical-align:middle"><span style="display:block;height:100%;width:${Math.max(3, o / par * 100).toFixed(0)}%;border-radius:3px;background:${o === 0 || o / par < 0.25 ? "var(--danger)" : "var(--warning)"}"></span></span>`;
const cb = (on) => `<span style="flex:none;display:inline-grid;place-items:center;width:16px;height:16px;border-radius:4px;${on ? "background:var(--primary);color:var(--on-primary);border:1px solid var(--primary)" : "border:1.5px solid var(--border)"}">${on ? ic("check", 12) : ""}</span>`;
const invTable = (dim) => `<div class="card" style="padding:0;overflow:hidden;${dim ? "opacity:.55" : ""}"><table style="width:100%;border-collapse:collapse;font-size:13px"><thead><tr style="background:color-mix(in oklab,var(--surface) 50%,var(--bg))">${["", "Item", "Category", "Location", "On hand / par", "Status", "Last counted", "Suggested order"].map((h, i) => `<th style="text-align:${i > 3 && i !== 5 && i !== 6 ? "right" : "left"};font-weight:600;font-size:12px;padding:10px 12px;border-bottom:1px solid var(--border)" class="muted">${i === 0 ? cb(false) : h}</th>`).join("")}</tr></thead><tbody>
${ITEMS.map(([n, sku, c, l, o, par, u, last, sugg], i) => `<tr style="${[0, 2, 7].includes(i) ? `background:${tint(5)}` : ""}"><td style="padding:9px 12px;border-bottom:1px solid var(--border);width:36px">${cb([0, 2, 7].includes(i))}</td><td style="padding:9px 12px;border-bottom:1px solid var(--border)"><b style="font-weight:600">${n}</b><div class="muted" style="font-size:11.5px">${sku}</div></td><td style="padding:9px 12px;border-bottom:1px solid var(--border)" class="muted">${c}</td><td style="padding:9px 12px;border-bottom:1px solid var(--border)">${l}</td>
<td style="padding:9px 12px;border-bottom:1px solid var(--border);text-align:right;white-space:nowrap"><span class="num" style="font-size:13px">${o}</span><span class="muted"> / ${par} ${u}</span> ${stockBar(o, par)}</td><td style="padding:9px 12px;border-bottom:1px solid var(--border)">${stockStatus(o, par, sugg)}</td><td style="padding:9px 12px;border-bottom:1px solid var(--border)" class="muted">${last}</td><td style="padding:9px 12px;border-bottom:1px solid var(--border);text-align:right" class="num">${sugg}</td></tr>`).join("")}</tbody></table></div>`;
const invHeader = (st) => `<div style="display:flex;align-items:flex-end;justify-content:space-between"><div class="ph"><h1 style="font-size:${H(st, 24)}px">Inventory</h1><p style="font-size:13px">142 items across 3 locations · counts update from deliveries and closing stocktakes</p></div><div style="display:flex;gap:8px"><span class="btn">${ic("upload", 15)}Import count</span><span class="btn">${ic("ops_truck", 15)}Receive delivery</span><span class="btn primary">${ic("plus", 15)}Add item</span></div></div>
<div style="display:flex;gap:22px;border-bottom:1px solid var(--border);font-size:13.5px;font-weight:500">${[["All items", 142], ["Low stock", 9], ["Out of stock", 2], ["On order", 4]].map(([t, n], i) => `<span style="padding:0 2px 10px;display:flex;gap:6px;align-items:center;${i === 1 ? "border-bottom:2px solid var(--primary);color:var(--text)" : "color:var(--muted)"}">${t}<span style="font-size:11px;font-weight:600;padding:1px 7px;border-radius:999px;background:${i === 1 ? tint(16) : "color-mix(in oklab,var(--muted) 12%,var(--surface))"}">${n}</span></span>`).join("")}</div>
<div style="display:flex;gap:8px;align-items:center">${chip("All locations", true)}${LOCS.map((l) => chip(l)).join("")}<span style="width:1px;height:22px;background:var(--border);margin:0 4px"></span>${chip("Dairy &amp; alt")}${chip("Packaging")}${chip("Coffee")}<span class="muted" style="margin-left:auto;font-size:12.5px">Sorted by urgency</span></div>`;
const bulkBar = () => `<div style="display:flex;align-items:center;gap:12px;padding:10px 14px;border-radius:var(--radius);background:var(--text);color:var(--bg)" class="feat"><b style="font-size:13px">3 selected</b><span style="font-size:12.5px;opacity:.75">2 suppliers · Coldbrook Dairy, Packwell</span><span style="margin-left:auto;display:flex;gap:8px"><span class="btn" style="height:32px;background:transparent;color:var(--bg);border-color:color-mix(in oklab,var(--bg) 40%,transparent)">Mark counted</span><span class="btn primary" style="height:32px">Create 2 purchase orders</span></span></div>`;
const RECV = [["Bread flour 25 kg", "sacks", 4, 4, ""], ["Rye flour 10 kg", "sacks", 2, 2, ""], ["Wholemeal flour 25 kg", "sacks", 2, 1, "short"], ["Caster sugar 10 kg", "bags", 3, 3, ""], ["Sea salt 5 kg", "tubs", 1, 1, ""], ["Dried yeast 500 g", "packs", 6, 6, ""]];
const stepper = (v, warn, h = 32) => `<span style="display:inline-flex;align-items:center;border:1px solid ${warn ? "var(--warning)" : "var(--border)"};border-radius:var(--radius);height:${h}px;background:var(--surface)"><span style="width:28px;display:grid;place-items:center;color:var(--muted)">${ic("minus", 13)}</span><b class="num" style="min-width:24px;text-align:center;font-size:13px">${v}</b><span style="width:28px;display:grid;place-items:center;color:var(--muted)">${ic("plus", 13)}</span></span>`;
const recvLines = (compact) => RECV.map(([n, u, ord, got, s]) => `<div style="display:flex;align-items:center;gap:10px;padding:${compact ? "8px 0" : "9px 0"};border-bottom:1px solid var(--border);font-size:13px"><div style="flex:1;min-width:0"><b style="font-weight:600">${n}</b><div class="muted" style="font-size:11.5px">Ordered ${ord} ${u}</div></div>${s ? sbadge("1 short", "warning") : `<span style="color:var(--success);display:flex">${ic("check", 15)}</span>`}${stepper(got, !!s, compact ? 34 : 32)}</div>`).join("");
const recvForm = (compact) => `<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px"><div class="field"><label>Delivered to</label><div class="input filled" style="gap:6px">${ic("ops_store", 14)}Harbour St</div></div><div class="field"><label>Delivery note no.</label><div class="input filled">FG-55102</div></div></div>
<div style="display:flex;justify-content:space-between;align-items:baseline;margin-top:2px"><b style="font-size:13.5px">Lines (6)</b><span style="font-size:12.5px;font-weight:600;color:var(--primary)">Mark all as received</span></div>
<div>${recvLines(compact)}</div>
<div class="field"><label>Note on shortage</label><div class="input filled" style="height:${compact ? 48 : 54}px;align-items:flex-start;padding-top:9px;font-size:13px;line-height:1.4">1 sack of wholemeal torn in transit, refused at the door. Driver signed.</div></div>
<label style="display:flex;gap:9px;align-items:center;font-size:13px"><span role="switch" aria-checked="true" style="width:34px;height:20px;border-radius:999px;position:relative;background:var(--primary)"><span style="position:absolute;top:2px;left:16px;width:16px;height:16px;border-radius:50%;background:var(--surface)"></span></span>Add to on-hand counts and close PO when saved</label>`;
const invWeb = (p, st) => {
  const recv = p.variant === "receive-stock";
  return `<div class="shell">${sideNav(p, "Inventory", NAV)}<main class="main" style="position:relative">${topbar("Kiln &amp; Crumb", locSwitch("All locations"))}
<div class="page" style="gap:14px;padding:20px 24px">${invHeader(st)}${recv ? "" : bulkBar()}${invTable(recv)}</div>
${recv ? `<div style="position:absolute;inset:0;background:color-mix(in oklab,var(--text) 22%,transparent)"></div>
<aside role="dialog" aria-modal="true" aria-label="Receive delivery" style="position:absolute;top:0;right:0;bottom:0;width:480px;background:var(--surface);border-left:1px solid var(--border);box-shadow:var(--shadow-lg);display:flex;flex-direction:column">
<div style="padding:18px 22px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:flex-start"><div><div class="muted" style="font-size:12px">PO-2291 · ordered Mon 2 Nov</div><h2 style="font-size:${H(st, 20)}px;margin-top:2px">Receive delivery</h2><div style="font-size:13px;margin-top:2px">Fieldgrain Flour Co. · arrived 13:34</div></div><span style="display:flex;color:var(--muted)">${ic("x", 20)}</span></div>
<div style="flex:1;padding:14px 22px;display:flex;flex-direction:column;gap:10px;overflow:hidden">${recvForm(false)}</div>
<div style="padding:14px 22px;border-top:1px solid var(--border);display:flex;gap:10px;align-items:center"><span class="muted" style="font-size:12.5px">17 of 18 units</span><span class="btn" style="margin-left:auto">Cancel</span><span class="btn primary">Receive 6 lines</span></div></aside>` : ""}
</main></div>`;
};
const invMobile = (p, st) => p.variant === "receive-stock" ? `<div class="phone">${status()}
<div class="mtop"><span style="display:flex">${ic("x", 22)}</span><div style="text-align:center"><b style="font-size:15px">Receive delivery</b><div class="muted" style="font-size:11.5px">PO-2291 · Fieldgrain Flour Co.</div></div><span style="width:22px"></span></div>
<div class="mbody" style="gap:10px">${recvForm(true)}
<button class="btn primary block" style="margin-top:auto;height:46px">Receive 17 of 18 units</button></div></div>`
  : `<div class="phone">${status()}
<div class="mtop"><h1 style="font-size:${H(st, 22)}px">Stock</h1><span style="display:flex;gap:14px">${ic("search", 21)}${ic("ops_truck", 21)}</span></div>
<div class="mbody" style="gap:10px">
<div style="display:flex;gap:6px;overflow:hidden;flex:none">${chip("Low stock 9", true)}${chip("Out 2")}${chip("On order 4")}${chip("All")}</div>
<div style="display:flex;justify-content:space-between;align-items:center;font-size:12.5px"><span class="muted">All locations · by urgency</span><span style="font-weight:600;color:var(--primary)">Select</span></div>
${ITEMS.slice(0, 6).map(([n, sku, c, l, o, par, u, , sugg]) => `<div style="display:grid;gap:5px;padding:9px 0;border-bottom:1px solid var(--border)"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><b style="font-size:13.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${n}</b>${stockStatus(o, par, sugg)}</div>
<div style="display:flex;justify-content:space-between;align-items:center;font-size:12px"><span class="muted">${l} · ${c}</span><span><span class="num">${o}</span><span class="muted"> / ${par} ${u}</span></span></div>${stockBar(o, par, 350)}</div>`).join("")}
<button class="btn primary block" style="height:44px">Reorder low items (7)</button>
</div>${tabBar("Stock", TABS)}</div>`;

module.exports = {
  "shift-scheduler": { family: "ops", name: "Shift scheduler", shows: "a staff shift scheduler with a week grid (team × days), colour-coded role shifts, open shifts to fill, time off and unavailability, contracted vs scheduled hours, a short-staffed warning, daily labour totals and a publish action",
    elements: ["sidebar-nav", "table", "avatar", "badge", "tabs", "calendar-grid", "legend"], web: ssWeb, mobile: ssMobile },
  "leave-calendar": { family: "ops", name: "Leave calendar", shows: "a month calendar of one team member’s leave and time off (annual leave, sick day, half day) with teammates who are also off, leave balances with progress bars, upcoming requests and a request-time-off button",
    elements: ["sidebar-nav", "calendar-grid", "card", "badge", "avatar", "legend", "progress"], web: lcWeb, mobile: lcMobile },
  "time-off-request": { family: "ops", name: "Time-off request", shows: "a time-off request: leave type, dates, half-day toggles, note to the manager, shifts that will be released and the leave balance after",
    elements: ["form", "toggle", "card", "badge", "avatar"],
    variants: {
      request: { name: "Request time off", shows: "an employee’s time-off request form with leave type chips, from/to dates, half-day toggles, a note for the manager, the shifts that would be released (one needs cover) and a summary with the balance before and after" },
      conflict: { name: "Request conflicts with staffing", shows: "the time-off request form in an error state: an alert that one day would drop below minimum staffing, the date fields marked invalid with an inline message, the short shift highlighted and a suggested colleague to cover" },
      review: { name: "Manager review (approve or decline)", shows: "a manager’s time-off approval screen: a pending-requests list, the request details and balance, a per-day coverage check against minimum staffing, a reply field and approve/decline buttons" },
    },
    web: (p, st) => p.variant === "review" ? torWebReview(p, st) : torWebRequest(p, st, p.variant === "conflict"),
    mobile: (p, st) => p.variant === "review" ? torMobileReview(p, st) : torMobileRequest(p, st, p.variant === "conflict") },
  "ops-dashboard": { family: "ops", name: "Multi-location operations dashboard", shows: "a multi-location operations dashboard for today: sales, orders, average ticket, labour % and staff on shift, a card per location with sales vs target, hourly sales bars by location and a needs-attention list (low stock, late clock-in, late delivery, offline terminal)",
    elements: ["sidebar-nav", "kpi-tiles", "chart", "card", "badge", "progress", "list"], web: opsWeb, mobile: opsMobile },
  "inventory-stock": { family: "ops", name: "Inventory stock", shows: "inventory stock levels across locations with low-stock and out-of-stock badges",
    elements: ["sidebar-nav", "table", "checkbox", "badge", "tabs", "progress"],
    variants: {
      "low-stock": { name: "Low stock list", shows: "an inventory table filtered to low stock: tabs with counts, location and category chips, on hand vs par with stock bars, Low/Critical/Out/On order badges, last counted, suggested order quantities and a bulk create-purchase-orders bar" },
      "receive-stock": { name: "Receive stock (delivery form)", shows: "a receive-delivery drawer over the inventory table: purchase order and supplier, delivered-to location, line items with ordered vs received steppers, a short-delivery badge, a shortage note and a toggle to update on-hand counts" },
    },
    web: invWeb, mobile: invMobile },
};
