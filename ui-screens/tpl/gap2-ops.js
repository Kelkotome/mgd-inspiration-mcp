/* Gap round mcp-gap-r2 (9-Nov-2026): payroll, timesheets and invoicing.
   Demand (real MCP search_ui_screens queries that returned 0 or thin results): "payroll", "timesheet" (twice), "invoice",
   "invoices list table with status, simple small business billing", "invoice detail with payment status and line items".
   Stories: payroll + timesheet continue Rosterline / Kiln & Crumb (operations.js, gap-ops.js): week Mon 16 – Sun 22 Nov 2026 at
   Harbour St (same roster as the shift scheduler), fortnightly pay run 9–22 Nov paid Thu 26 Nov 2026; Lin Park (barista lead) is the
   employee view, Mara Okafor (owner) the manager view. Pay is country-neutral: "income tax withheld", "retirement contribution".
   invoice-list continues Mintwell (banking.js): Lin Park t/a Park Studio invoices clients (INV-0042 Ostrava Labs, Palo Verde Co.);
   "now" is Mon 9 Nov 2026; pounds and VAT as in the Mintwell onboarding story. */
const { ic, status, tabBar, ICON, esc } = require("../lib");

Object.assign(ICON, {
  g2o_pay: '<rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.6"/><path d="M6 9.5v5M18 9.5v5"/>',
  g2o_clock: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M9.5 2.5h5"/>',
  g2o_plane: '<path d="M3 13l18-8-5 15-4-6-6-1z"/><path d="M12 14l4-5"/>',
  g2o_box: '<path d="M3 7.5L12 3l9 4.5v9L12 21l-9-4.5z"/><path d="M3 7.5l9 4.5 9-4.5M12 12v9"/>',
  g2o_store: '<path d="M4 9l1.5-5h13L20 9M4 9v11h16V9M4 9h16M9 20v-6h6v6"/>',
  g2o_alert: '<path d="M12 3l9.5 17h-19z"/><path d="M12 10v4.5M12 17.5h.01"/>',
  g2o_invoice: '<path d="M6 3h12v18l-2.5-1.5L13 21l-2.5-1.5L8 21l-2-1.5z"/><path d="M9 8h6M9 11.5h6M9 15h3.5"/>',
  g2o_bank: '<path d="M3 9.5L12 4l9 5.5M4.5 10v8M9.5 10v8M14.5 10v8M19.5 10v8M3 20h18"/>',
  g2o_coffee: '<path d="M4 9h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM17 10.5h1.5a2.5 2.5 0 0 1 0 5H17M8 3.5v2.5M12 3.5v2.5"/>',
  g2o_query: '<path d="M4 5h16v11H9l-5 4z"/><path d="M10 9.2a2 2 0 1 1 2.6 1.9c-.4.2-.6.5-.6.9v.4M12 14h.01"/>',
  g2o_bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15zM10 20.5a2 2 0 0 0 4 0"/><path d="M19.5 4.5l1.5-1.5M21 8h1.5"/>',
});

const H = (st, px) => Math.round(px * st.hscale);
const tint = (pct, v = "primary") => `color-mix(in oklab,var(--${v}) ${pct}%,var(--surface))`;
const ink = (k, pct = 78) => `color-mix(in oklab,var(--${k}) ${pct}%,var(--text))`;
const track = "color-mix(in oklab,var(--muted) 15%,var(--surface))";
const av = (ini, s = 28, k = 0) => `<span style="flex:none;width:${s}px;height:${s}px;border-radius:50%;display:grid;place-items:center;font:600 ${Math.round(s * 0.38)}px var(--font-b);background:${tint(16 + (k % 3) * 7, k % 2 ? "accent" : "primary")};color:${ink(k % 2 ? "accent" : "primary", 72)}">${ini}</span>`;
const chip = (t, on) => `<span style="flex:none;display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 12px;border-radius:999px;font-size:12.5px;font-weight:500;white-space:nowrap;${on ? "background:var(--primary);color:var(--on-primary);border:1px solid var(--primary)" : "border:1px solid var(--border);background:var(--surface)"}">${t}</span>`;
const seg = (items, on, h = 32, full) => `<div style="flex:none;display:${full ? "grid;grid-template-columns:repeat(" + items.length + ",1fr)" : "inline-flex"};border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;background:var(--surface)">${items.map((t, i) => `<span style="height:${h}px;padding:0 12px;display:grid;place-items:center;font-size:12.5px;font-weight:500;white-space:nowrap;${i ? "border-left:1px solid var(--border);" : ""}${i === on ? "background:var(--primary);color:var(--on-primary)" : ""}">${t}</span>`).join("")}</div>`;
const sb = (t, k) => `<span style="display:inline-flex;align-items:center;gap:4px;height:20px;padding:0 8px;border-radius:999px;font:600 11px var(--font-b);white-space:nowrap;background:color-mix(in oklab,var(--${k}) 14%,var(--surface));color:${ink(k)}">${t}</span>`;
const cb = (on) => `<span style="flex:none;display:inline-grid;place-items:center;width:16px;height:16px;border-radius:4px;${on ? "background:var(--primary);color:var(--on-primary);border:1px solid var(--primary)" : "border:1.5px solid var(--border)"}">${on ? ic("check", 12) : ""}</span>`;
const bar = (pct, k = "primary", h = 6) => `<div style="height:${h}px;border-radius:${h}px;background:${track};overflow:hidden"><div style="height:100%;width:${Math.max(2, Math.min(100, pct)).toFixed(1)}%;border-radius:${h}px;background:var(--${k})"></div></div>`;
const tog = (on) => `<span role="switch" aria-checked="${on}" style="flex:none;width:34px;height:20px;border-radius:999px;position:relative;background:${on ? "var(--primary)" : track};border:1px solid ${on ? "var(--primary)" : "var(--border)"}"><span style="position:absolute;top:1px;left:${on ? 15 : 1}px;width:16px;height:16px;border-radius:50%;background:var(--surface);box-shadow:var(--shadow-sm)"></span></span>`;
const sub = (t, fs = 11.5) => `<div class="muted" style="font-size:${fs}px">${t}</div>`;
const lbl = (t) => `<div class="muted" style="font:600 11px var(--font-b);text-transform:uppercase;letter-spacing:.06em">${t}</div>`;
const kpi = (label, val, note, k) => `<div class="card" style="padding:12px 14px;display:grid;gap:3px;min-width:0"><span class="muted" style="font-size:12px">${label}</span><span class="num" style="font-size:22px;${k ? `color:${ink(k, 85)}` : ""}">${val}</span><span class="muted" style="font-size:11.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${note}</span></div>`;
const tbl = (cols, rows, o = {}) => `<div class="card" style="padding:0;overflow:hidden;${o.style || ""}"><table style="width:100%;border-collapse:collapse;font-size:${o.fs || 13}px"><thead><tr style="background:color-mix(in oklab,var(--surface) 50%,var(--bg))">${cols.map(([h, a, w]) => `<th style="text-align:${a || "left"};font-weight:600;font-size:12px;padding:${o.pad || "9px 12px"};border-bottom:1px solid var(--border);white-space:nowrap;${w ? `width:${w}px` : ""}" class="muted">${h}</th>`).join("")}</tr></thead><tbody>${rows.map((r, i) => `<tr style="${o.hl && o.hl.includes(i) ? `background:${tint(8)}` : ""}${o.foot && i === rows.length - 1 ? `;background:color-mix(in oklab,var(--surface) 50%,var(--bg))` : ""}">${r.map((c, j) => `<td style="padding:${o.pad || "9px 12px"};border-bottom:${i === rows.length - 1 ? "0" : "1px solid var(--border)"};text-align:${cols[j][1] || "left"};vertical-align:middle;white-space:nowrap">${c}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
const mtop = (left, title, subt, right = "") => `<div class="mtop"><span style="display:flex;width:24px">${left ? ic(left, 22) : ""}</span><div style="text-align:center;min-width:0"><b style="font-size:15px">${title}</b>${subt ? `<div class="muted" style="font-size:11.5px">${subt}</div>` : ""}</div><span style="display:flex;width:24px;justify-content:flex-end">${right}</span></div>`;
const alertRow = (title, body, k = "warning", action = "") => `<div role="alert" style="display:flex;gap:10px;align-items:center;padding:9px 12px;border-radius:var(--radius);border:1px solid color-mix(in oklab,var(--${k}) 45%,var(--border));background:color-mix(in oklab,var(--${k}) 8%,var(--surface));font-size:12.5px;min-width:0"><span style="color:var(--${k});display:flex">${ic("g2o_alert", 16)}</span><div style="flex:1;min-width:0"><div style="font-weight:600;color:${ink(k, 85)};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${title}</div><div class="muted" style="font-size:11.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${body}</div></div>${action}</div>`;
const n2 = (n, d = 2) => n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
const $ = (n) => "$" + n2(n);
const gbp = (n) => "£" + n2(n);
const h1 = (n) => n.toFixed(1);
const pick = (map) => (p, st, rnd) => (map[p.variant] || Object.values(map)[0])(p, st, rnd);
const MOB = "<style>.mbody>*{flex-shrink:0}</style>";

/* ================================================================ OPS (Rosterline · Kiln & Crumb) */
const MNAV = [["home", "Today"], ["calendar", "Schedule"], ["g2o_clock", "Timesheets"], ["g2o_pay", "Payroll"], ["g2o_plane", "Time off"], ["g2o_box", "Inventory"], ["chart", "Reports"], ["users", "Team"], ["gear", "Settings"]];
const ENAV = [["home", "Today"], ["calendar", "My shifts"], ["g2o_clock", "Timesheet"], ["g2o_pay", "Payslips"], ["g2o_plane", "Time off"], ["chat", "Messages"]];
const MTABS = [["home", "Today"], ["calendar", "Schedule"], ["g2o_clock", "Timesheets"], ["g2o_pay", "Payroll"]];
const ETABS = [["home", "Today"], ["calendar", "Shifts"], ["g2o_clock", "Timesheet"], ["g2o_pay", "Pay"]];
const oside = (p, active, items, who) => `<aside class="side"><div class="logo"><b></b>${esc(p.name)}</div>
${items.map(([i, l]) => `<div class="nav${l === active ? " on" : ""}">${ic(i)}${l}</div>`).join("")}
<div class="foot">${av(who[0], 28, who[3] || 0)}<div><div style="font-weight:500">${who[1]}</div><div class="muted" style="font-size:12px">${who[2]}</div></div></div></aside>`;
const MARA = ["MO", "Mara Okafor", "Owner · admin"], LIN = ["LP", "Lin Park", "Barista lead · Harbour St", 1];
const otop = (search, right = "") => `<div class="top"><div style="font-weight:600;font-size:15px">Kiln &amp; Crumb</div><div class="search">${ic("search", 15)}${search}</div>${right}<span style="display:flex;color:var(--muted)">${ic("bell", 19)}</span></div>`;
const locSwitch = (l = "Harbour St") => `<span class="btn" style="gap:8px">${ic("g2o_store", 15)}${l}${ic("chevdown", 14)}</span>`;

/* ---------------- payroll (pay-run | payslip) */
// [name, initials, role, location, hourly rate, ordinary h, overtime h, leave h, warning]
const PAY = [
  ["Lin Park", "LP", "Barista lead", "Harbour St", 22.0, 64, 3.5, 8, "Clock-out fixed · awaiting approval"],
  ["Hana Sato", "HS", "Barista", "Harbour St", 19.5, 71, 3.5, 0, ""],
  ["Omar Haddad", "OH", "Barista", "Harbour St", 19.5, 27.5, 0, 0, "Timesheet 16–22 Nov missing"],
  ["Sam Achebe", "SA", "Baker", "Harbour St", 21.5, 75, 0.5, 0, ""],
  ["Jonah Weiss", "JW", "Baker", "Harbour St", 21.5, 75, 1.5, 0, ""],
  ["Teodora Ruiz", "TR", "Front of house", "Harbour St", 18.75, 74.5, 0, 0, ""],
  ["Priya Nair", "PN", "Front of house", "Harbour St", 18.75, 43.5, 0, 0, ""],
  ["Freya Lund", "FL", "Porter", "Harbour St", 18.2, 34, 0, 12, ""],
  ["Ayo Mensah", "AM", "Barista", "Millbrook", 19.5, 64, 0, 0, ""],
  ["Nell Ashby", "NA", "Baker", "Millbrook", 21.5, 74, 6, 0, "Overtime over 4 h limit"],
  ["Kofi Asante", "KA", "Shift lead", "Eastgate", 22.0, 75, 2.5, 0, ""],
  ["Rhea Kapoor", "RK", "Front of house", "Eastgate", 18.75, 52, 0, 0, ""],
];
const payCalc = (r) => {
  const gross = (r[5] + r[7]) * r[4] + r[6] * r[4] * 1.5;
  const tax = Math.round(gross * (gross > 1500 ? 0.155 : 0.12) * 100) / 100, ret = Math.round(gross * 5) / 100;
  return { hours: r[5] + r[7], gross, tax, ret, net: gross - tax - ret };
};
const PAYC = PAY.map(payCalc);
const RUN = { gross: 42318.4, tax: 5964.18, ret: 2115.92, net: 34238.3, employer: 3385.47 }; // all 31 employees
const STEPS = [["Timesheets", "29 of 31 approved"], ["Review pay", "In progress"], ["Approve", "Mara Okafor"], ["Paid", "Thu 26 Nov"]];
const stepper = (on, compact) => `<div style="display:flex;align-items:center;gap:${compact ? 6 : 10}px">${STEPS.map(([t, s], i) => `${i ? `<span style="flex:1;min-width:16px;height:2px;background:${i <= on ? "var(--primary)" : "var(--border)"}"></span>` : ""}<span style="display:flex;align-items:center;gap:8px;flex:none"><span style="width:22px;height:22px;border-radius:50%;display:grid;place-items:center;font:600 11px var(--font-b);${i < on ? "background:var(--primary);color:var(--on-primary)" : i === on ? "border:2px solid var(--primary);color:var(--primary)" : "border:1.5px solid var(--border);color:var(--muted)"}">${i < on ? ic("check", 12) : i + 1}</span>${compact ? "" : `<span style="line-height:1.2"><b style="font-size:12.5px;display:block">${t}</b><span class="muted" style="font-size:11px">${s}</span></span>`}</span>`).join("")}</div>`;

const prWeb = (p, st) => {
  const SH = PAY.slice(0, 10), SC = PAYC.slice(0, 10), ss = (k) => SC.reduce((a, c) => a + c[k], 0);
  const rows = SH.map((r, i) => {
    const c = SC[i];
    return [cb(!r[8] || i === 0), `<span style="display:flex;gap:9px;align-items:center">${av(r[1], 24, i)}<b style="font-weight:600">${r[0]}</b><span class="muted" style="font-size:12px">${r[2]}</span></span>`, `<span class="muted">${r[3]}</span>`,
      `<span class="num">${h1(c.hours)}</span>${r[7] ? `<span class="muted" style="font-size:11px"> incl. ${r[7]} leave</span>` : ""}`,
      r[6] ? `<span class="num" style="${r[6] > 4 ? `color:${ink("warning", 85)};font-weight:700` : ""}">${h1(r[6])}</span>` : `<span class="muted">—</span>`,
      `<span class="num">${$(c.gross)}</span>`, `<span class="num muted">−${$(c.tax)}</span>`, `<span class="num muted">−${$(c.ret)}</span>`, `<b class="num">${$(c.net)}</b>`,
      r[8] ? sb(r[8].includes("missing") ? "Missing timesheet" : r[8].includes("Overtime") ? "Check overtime" : "Pending fix", r[8].includes("missing") ? "danger" : "warning") : sb("Ready", "success")];
  });
  rows.push(["", `<b style="font-size:12.5px">Total · 10 shown of 31</b> <span class="muted" style="font-size:12px">· page 1 of 4</span>`, "", `<b class="num">${h1(ss("hours"))}</b>`, `<b class="num">${h1(SH.reduce((a, r) => a + r[6], 0))}</b>`, `<b class="num">${$(ss("gross"))}</b>`, `<b class="num">−${$(ss("tax"))}</b>`, `<b class="num">−${$(ss("ret"))}</b>`, `<b class="num">${$(ss("net"))}</b>`, ""]);
  return `<div class="shell">${oside(p, "Payroll", MNAV, MARA)}<main class="main">${otop("Search employees, pay runs", locSwitch("All locations"))}
<div class="page" style="gap:12px;padding:18px 24px">
<div style="display:flex;align-items:flex-end;justify-content:space-between;gap:20px"><div class="ph"><div style="display:flex;gap:10px;align-items:center"><h1 style="font-size:${H(st, 24)}px">Pay run · 9–22 Nov 2026</h1>${sb("Draft", "muted")}</div><p style="font-size:13px">Fortnightly · 31 employees at 3 locations · pay date Thu 26 Nov 2026 · bank file goes Wed 25 Nov 14:00</p></div>
<div style="display:flex;gap:8px"><span class="btn">${ic("download", 15)}Pay summary</span><span class="btn primary">${ic("check", 15)}Approve and pay ${$(RUN.net)}</span></div></div>
<div class="card" style="padding:9px 16px">${stepper(1)}</div>
<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:10px">${kpi("Gross pay", $(RUN.gross), "+4.2% on last run (26 Oct–8 Nov)")}${kpi("Income tax withheld", $(RUN.tax), "Paid to the tax office by 7 Dec")}${kpi("Retirement (5%)", $(RUN.ret), `Employer adds ${$(RUN.employer)}`)}${kpi("Net pay to staff", $(RUN.net), "31 bank transfers")}${kpi("Hours paid", "2,206.5", "incl. 41.5 h overtime, 36 h leave")}</div>
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">${alertRow("Omar Haddad · timesheet missing", "Week 16–22 Nov not submitted · paying week 1 only (27.5 h)", "danger", `<span class="btn" style="height:28px;font-size:12px">Remind</span>`)}${alertRow("Lin Park · missed clock-out Wed 18 Nov", "Finish time 18:05 added by Lin · approve before paying", "warning", `<span class="btn" style="height:28px;font-size:12px">Review</span>`)}${alertRow("Nell Ashby · 6 h overtime", "Above the 4 h per fortnight limit at Millbrook", "warning", `<span class="btn" style="height:28px;font-size:12px">Check</span>`)}</div>
<div style="display:flex;gap:8px;align-items:center">${chip("All 31", true)}${chip("Harbour St 14")}${chip("Millbrook 9")}${chip("Eastgate 8")}${chip("Needs attention 3")}<span class="muted" style="margin-left:auto;font-size:12.5px;display:flex;gap:6px;align-items:center">${ic("filter", 14)}Sorted by location</span></div>
${tbl([[cb(false)], ["Employee"], ["Location"], ["Hours", "right"], ["Overtime", "right"], ["Gross", "right"], ["Tax", "right"], ["Retirement", "right"], ["Net pay", "right"], ["Status"]], rows, { pad: "6px 12px", hl: [2], foot: true })}
</div></main></div>`;
};
const prMobile = (p, st) => `<div class="phone">${status()}${MOB}${mtop("back", "Pay run", "9–22 Nov · pays Thu 26 Nov", ic("more", 20))}
<div class="mbody" style="gap:11px">
<div class="card" style="padding:14px 16px;display:grid;gap:10px"><div style="display:flex;justify-content:space-between;align-items:flex-start"><div><span class="muted" style="font-size:12px">Net pay to 31 staff</span><div class="num" style="font-size:28px">${$(RUN.net)}</div></div>${sb("Draft", "muted")}</div>
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;padding-top:10px;border-top:1px solid var(--border)">${[["Gross", RUN.gross], ["Tax", RUN.tax], ["Retirement", RUN.ret]].map(([l, v]) => `<div><span class="muted" style="font-size:11px">${l}</span><div class="num" style="font-size:13.5px">${$(v)}</div></div>`).join("")}</div>${stepper(1, true)}</div>
${alertRow("2 timesheets need you", "Omar Haddad missing · Lin Park clock-out fix", "warning", `<span style="display:flex;color:var(--muted)">${ic("chevron", 16)}</span>`)}
<div style="display:flex;gap:6px;overflow:hidden">${chip("All 31", true)}${chip("Harbour St 14")}${chip("Millbrook 9")}${chip("Eastgate 8")}</div>
<div style="display:grid">${PAY.slice(0, 5).map((r, i) => `<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border)">${av(r[1], 34, i)}<div style="flex:1;min-width:0"><b style="font-size:13.5px;display:flex;gap:6px;align-items:center">${r[0]}${r[8] ? `<span style="display:flex;color:var(--${r[8].includes("missing") ? "danger" : "warning"})">${ic("g2o_alert", 13)}</span>` : ""}</b><span class="muted" style="font-size:11.5px">${r[2]} · ${h1(PAYC[i].hours)} h${r[6] ? ` · ${r[6]} h OT` : ""}</span></div><div style="text-align:right"><b class="num" style="font-size:14px">${$(PAYC[i].net)}</b>${sub("gross " + $(PAYC[i].gross), 11)}</div></div>`).join("")}</div>
<button class="btn primary block" style="height:46px;margin-top:auto">${ic("check", 16)}Approve and pay</button></div>${tabBar("Payroll", MTABS)}</div>`;

// payslip (Lin Park, 9–22 Nov 2026)
const EARN = [["Ordinary hours", "64.00 h", "$22.00", 1408.0, 33264.0], ["Overtime (×1.5)", "3.50 h", "$33.00", 115.5, 1914.0], ["Weekend penalty (+25%)", "15.00 h", "$5.50", 82.5, 1694.0], ["Holiday pay (annual leave)", "8.00 h", "$22.00", 176.0, 2068.5]];
const DED = [["Income tax withheld", "", 268.0, 5812.0], ["Retirement contribution", "5% of gross", 89.1, 1947.03]];
const GROSS = EARN.reduce((a, r) => a + r[3], 0), GROSSY = EARN.reduce((a, r) => a + r[4], 0);
const DEDT = DED.reduce((a, r) => a + r[2], 0), DEDY = DED.reduce((a, r) => a + r[3], 0);
const NET = GROSS - DEDT, NETY = GROSSY - DEDY;
const SLIPS = [["26 Nov 2026", "9–22 Nov", NET], ["12 Nov 2026", "26 Oct–8 Nov", 1388.4], ["29 Oct 2026", "12–25 Oct", 1402.15], ["15 Oct 2026", "28 Sep–11 Oct", 1351.8], ["1 Oct 2026", "14–27 Sep", 1420.6], ["17 Sep 2026", "31 Aug–13 Sep", 1365.25], ["3 Sep 2026", "17–30 Aug", 1377.9]];
const psWeb = (p, st) => `<div class="shell">${oside(p, "Payslips", ENAV, LIN)}<main class="main">${otop("Search shifts, payslips")}
<div class="page" style="grid-template-columns:250px minmax(0,1fr) 290px;gap:18px;padding:20px 24px;align-items:start">
<div style="display:grid;gap:10px"><div class="ph"><h1 style="font-size:${H(st, 22)}px">Payslips</h1><p style="font-size:12.5px">Paid fortnightly on Thursdays</p></div>
${seg(["2026", "2025"], 0, 30)}
<div class="card" style="padding:6px">${SLIPS.map(([d, per, n], i) => `<div style="display:flex;align-items:center;gap:10px;padding:9px 10px;border-radius:var(--radius);${i === 0 ? `background:${tint(10)}` : ""}"><span style="display:flex;color:${i === 0 ? "var(--primary)" : "var(--muted)"}">${ic("doc", 16)}</span><div style="flex:1;min-width:0"><b style="font-size:13px;font-weight:${i === 0 ? 700 : 500}">${d}</b>${sub(per, 11)}</div><span class="num" style="font-size:12.5px">${$(n)}</span></div>`).join("")}</div>
<span class="muted" style="font-size:12px;padding:0 4px">Older payslips are kept for 7 years.</span></div>
<div class="card" style="padding:22px 24px;display:grid;gap:14px;box-shadow:var(--shadow)">
<div style="display:flex;justify-content:space-between;align-items:flex-start"><div><div class="logo" style="font-size:14px"><b></b>Kiln &amp; Crumb</div>${sub("14 Harbour St · Employer ID KC-20-4471", 11.5)}</div><div style="text-align:right"><div class="h" style="font-size:${H(st, 20)}px">Payslip</div>${sub("No. PS-2026-23-0142", 11.5)}</div></div>
<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;padding:12px 0;border-top:1px solid var(--border);border-bottom:1px solid var(--border);font-size:12.5px">${[["Employee", "Lin Park"], ["Employee ID", "KC-0142"], ["Role", "Barista lead · Harbour St"], ["Pay period", "Mon 9 – Sun 22 Nov 2026"], ["Pay date", "Thu 26 Nov 2026"], ["Pay rate", "$22.00 / hour"], ["Pay frequency", "Fortnightly"], ["Tax code", "Standard · no extras"]].map(([l, v]) => `<div style="min-width:0"><span class="muted" style="font-size:11px">${l}</span><div style="font-weight:600">${v}</div></div>`).join("")}</div>
${tbl([["Earnings"], ["Hours / units", "right"], ["Rate", "right"], ["This period", "right"], ["Year to date", "right"]], [...EARN.map(([n, u, r, a, y]) => [n, `<span class="num muted">${u}</span>`, `<span class="num muted">${r}</span>`, `<span class="num">${$(a)}</span>`, `<span class="num muted">${$(y)}</span>`]), [`<b>Gross pay</b>`, "", "", `<b class="num">${$(GROSS)}</b>`, `<b class="num">${$(GROSSY)}</b>`]], { pad: "7px 12px", foot: true, style: "box-shadow:none" })}
${tbl([["Deductions"], ["Basis", "right"], ["", "right"], ["This period", "right"], ["Year to date", "right"]], [...DED.map(([n, b, a, y]) => [n, `<span class="muted">${b}</span>`, "", `<span class="num">−${$(a)}</span>`, `<span class="num muted">−${$(y)}</span>`]), [`<b>Total deductions</b>`, "", "", `<b class="num">−${$(DEDT)}</b>`, `<b class="num">−${$(DEDY)}</b>`]], { pad: "7px 12px", foot: true, style: "box-shadow:none" })}
<div class="feat" style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-radius:var(--radius);background:var(--text);color:var(--bg)"><div><b style="font-size:14px">Net pay</b><div style="font-size:12px;opacity:.75">Deposited to Everyday account ••4417 · Thu 26 Nov</div></div><div style="text-align:right"><div class="num" style="font-size:24px">${$(NET)}</div><div style="font-size:11.5px;opacity:.75">YTD ${$(NETY)}</div></div></div>
<div class="muted" style="font-size:11.5px">Employer retirement contribution (8%) this period: $142.56 · YTD $3,115.24. Not deducted from your pay.</div>
</div>
<div style="display:grid;gap:12px">
<div class="card" style="padding:16px;display:grid;gap:10px"><span class="muted" style="font-size:12px">Net pay · 26 Nov 2026</span><div class="num" style="font-size:30px">${$(NET)}</div>
<div style="display:flex;height:10px;border-radius:5px;overflow:hidden;gap:2px"><span style="width:${(NET / GROSS * 100).toFixed(1)}%;background:var(--primary)"></span><span style="width:${(268 / GROSS * 100).toFixed(1)}%;background:var(--accent)"></span><span style="flex:1;background:${tint(40, "muted")}"></span></div>
<div style="display:grid;gap:4px;font-size:12px">${[["var(--primary)", "Take-home", $(NET)], ["var(--accent)", "Income tax", $(268)], [tint(40, "muted"), "Retirement", $(89.1)]].map(([c, l, v]) => `<div style="display:flex;align-items:center;gap:8px"><span style="width:8px;height:8px;border-radius:2px;background:${c}"></span><span class="muted" style="flex:1">${l}</span><span class="num">${v}</span></div>`).join("")}</div>
<span class="btn primary block">${ic("download", 15)}Download PDF</span><span class="btn block" style="height:36px">${ic("mail", 15)}Email to me</span></div>
<div class="card" style="padding:14px 16px;display:grid;gap:8px"><b style="font-size:13px">Bank deposit</b><div style="display:flex;gap:10px;align-items:center;font-size:12.5px"><span style="width:34px;height:34px;border-radius:var(--radius);display:grid;place-items:center;background:${tint(12)};color:${ink("primary", 80)}">${ic("g2o_bank", 17)}</span><div style="flex:1"><b>Everyday account ••4417</b>${sub("100% of net pay · arrives by 09:00")}</div></div></div>
<div class="card" style="padding:14px 16px;display:grid;gap:9px"><b style="font-size:13px">Leave balances</b>${[["Annual leave", 62.4, 152], ["Sick leave", 38.0, 76]].map(([l, v, t]) => `<div style="display:grid;gap:4px"><div style="display:flex;justify-content:space-between;font-size:12.5px"><span>${l}</span><span class="num">${h1(v)} h</span></div>${bar(v / t * 100, "primary", 5)}</div>`).join("")}</div>
</div></div></main></div>`;
const psMobile = (p, st) => `<div class="phone">${status()}${MOB}${mtop("back", "Payslip", "Paid Thu 26 Nov 2026", ic("share", 19))}
<div class="mbody" style="gap:9px">
<div class="card" style="padding:14px 16px;display:grid;gap:4px;text-align:center"><span class="muted" style="font-size:12px">Net pay · 9–22 Nov 2026</span><div class="num" style="font-size:32px">${$(NET)}</div><span class="muted" style="font-size:12px;display:inline-flex;gap:6px;align-items:center;justify-content:center">${ic("g2o_bank", 14)}Deposited to Everyday ••4417</span></div>
${seg(["This pay", "Year to date"], 0, 32, true)}
<div style="display:grid;gap:0">${lbl("Earnings")}${EARN.map(([n, u, r, a]) => `<div style="display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid var(--border)"><div style="min-width:0"><div style="font-size:13px;font-weight:500">${n}</div>${sub(`${u} × ${r}`, 11)}</div><span class="num" style="font-size:13.5px">${$(a)}</span></div>`).join("")}<div style="display:flex;justify-content:space-between;padding:6px 0 2px;font-weight:700;font-size:13.5px"><span>Gross pay</span><span class="num">${$(GROSS)}</span></div></div>
<div style="display:grid;gap:0">${lbl("Deductions")}${DED.map(([n, b, a]) => `<div style="display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid var(--border)"><div><div style="font-size:13px;font-weight:500">${n}</div>${b ? sub(b, 11) : ""}</div><span class="num" style="font-size:13.5px">−${$(a)}</span></div>`).join("")}<div style="display:flex;justify-content:space-between;padding:6px 0 2px;font-weight:700;font-size:13.5px"><span>Total deductions</span><span class="num">−${$(DEDT)}</span></div></div>
<div style="display:flex;justify-content:space-between;font-size:12px;padding:9px 12px;border-radius:var(--radius);background:${tint(8)}"><span class="muted">Employer retirement (8%)</span><span class="num">+$142.56</span></div>
<button class="btn primary block" style="height:46px;margin-top:auto">${ic("download", 16)}Download PDF</button></div>${tabBar("Pay", ETABS)}</div>`;

/* ---------------- timesheet (week | approval) */
// Lin Park, week Mon 16 – Sun 22 Nov 2026: [day, date, rostered, in, out, break min, worked h | null, note]
const LWEEK = [
  ["Mon", 16, "06:00–14:00", "05:56", "14:08", 30, 7.7, ""],
  ["Tue", 17, "06:00–14:00", "05:58", "14:41", 30, 8.22, "Stayed for Coldbrook Dairy delivery"],
  ["Wed", 18, "10:00–18:00", "09:55", null, 30, null, "Missed clock-out"],
  ["Thu", 19, null, null, null, 0, 0, "Day off"],
  ["Fri", 20, "06:00–14:00", "06:02", "14:00", 30, 7.47, ""],
  ["Sat", 21, "07:00–15:00", "06:57", "15:20", 30, 7.88, "Weekend rate"],
  ["Sun", 22, null, null, null, 0, 0, "Day off"],
];
const LOGGED = LWEEK.reduce((a, r) => a + (r[6] || 0), 0);
const otOf = (r) => r[6] && r[2] ? Math.max(0, r[6] - 7.5) : 0;
const LOT = LWEEK.reduce((a, r) => a + (otOf(r) >= 0.25 ? otOf(r) : 0), 0);
const hhmm = (h) => `${Math.floor(h)}:${String(Math.round((h % 1) * 60)).padStart(2, "0")}`;
const tsWeek = (p, st) => {
  const maxH = 9, cH = 150;
  return `<div class="shell">${oside(p, "Timesheet", ENAV, LIN)}<main class="main">${otop("Search shifts, payslips")}
<div class="page" style="grid-template-columns:minmax(0,1fr) 300px;gap:18px;padding:20px 24px;align-items:start">
<div style="display:grid;gap:12px;min-width:0">
<div style="display:flex;align-items:flex-end;justify-content:space-between;gap:16px"><div class="ph"><div style="display:flex;gap:10px;align-items:center"><h1 style="font-size:${H(st, 24)}px">My timesheet</h1>${sb("Draft · due Mon 23 Nov 10:00", "warning")}</div><p style="font-size:13px">Harbour St · clocked on the counter tablet · manager Mara Okafor</p></div>
<div style="display:flex;gap:8px;align-items:center"><span class="btn" style="padding:0 10px">${ic("back", 15)}</span><span class="btn" style="gap:8px">${ic("calendar", 15)}Mon 16 – Sun 22 Nov 2026</span><span class="btn" style="padding:0 10px">${ic("chevron", 15)}</span></div></div>
${alertRow("Missed clock-out on Wed 18 Nov", "You clocked in at 09:55 but not out. Add your finish time and a reason before you submit.", "danger")}
${tbl([["Day"], ["Rostered"], ["Clock in"], ["Clock out"], ["Break", "right"], ["Hours", "right"], ["Overtime", "right"], ["Notes"]], LWEEK.map((r) => {
    const off = !r[2], miss = r[2] && !r[4], ot = otOf(r);
    return [`<b style="font-weight:600">${r[0]}</b> <span class="muted">${r[1]} Nov</span>`, off ? `<span class="muted">Not rostered</span>` : `<span class="num" style="font-weight:500">${r[2]}</span>`,
      r[3] ? `<span class="num">${r[3]}</span>` : `<span class="muted">—</span>`,
      miss ? `<span style="display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 10px;border:1.5px solid var(--danger);border-radius:var(--radius);background:var(--surface);font-size:12.5px"><span class="num">18:05</span>${ic("g2o_clock", 14)}</span>` : r[4] ? `<span class="num">${r[4]}</span>` : `<span class="muted">—</span>`,
      r[5] ? `<span class="num muted">${r[5]} min</span>` : `<span class="muted">—</span>`,
      miss ? `<span class="num muted">7:40</span>` : off ? `<span class="muted">—</span>` : `<b class="num">${hhmm(r[6])}</b>`,
      ot >= 0.25 ? sb("+" + hhmm(ot), "warning") : `<span class="muted">—</span>`,
      miss ? `<span style="display:inline-flex;align-items:center;justify-content:space-between;gap:6px;width:200px;height:30px;padding:0 10px;border:1px solid var(--border);border-radius:var(--radius);font-size:12.5px;background:var(--surface)">Forgot to clock out${ic("chevdown", 13)}</span>` : `<span class="muted" style="font-size:12.5px">${r[7]}</span>`];
  }), { pad: "8px 12px", hl: [2] })}
<div class="card" style="padding:14px 16px;display:grid;gap:10px"><div style="display:flex;justify-content:space-between;align-items:center"><b style="font-size:13.5px">Worked vs rostered by day</b><span class="muted" style="font-size:12px;display:flex;gap:12px"><span style="display:inline-flex;gap:6px;align-items:center"><span style="width:10px;height:10px;border-radius:2px;background:${tint(30, "muted")}"></span>Rostered</span><span style="display:inline-flex;gap:6px;align-items:center"><span style="width:10px;height:10px;border-radius:2px;background:var(--primary)"></span>Worked</span></span></div>
<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:14px;align-items:end">${LWEEK.map((r) => { const ro = r[2] ? 7.5 : 0, w = r[6] == null ? 7.67 : r[6]; return `<div style="display:grid;gap:5px;justify-items:center"><div style="display:flex;gap:4px;align-items:flex-end;height:${cH}px">${ro ? `<span style="width:14px;height:${ro / maxH * cH}px;border-radius:3px 3px 0 0;background:${tint(30, "muted")}"></span><span style="width:14px;height:${w / maxH * cH}px;border-radius:3px 3px 0 0;background:${r[6] == null ? "repeating-linear-gradient(135deg,var(--danger) 0 3px,transparent 3px 6px)" : "var(--primary)"}"></span>` : `<span class="muted" style="font-size:11px">off</span>`}</div><span class="muted" style="font-size:11.5px">${r[0]}</span></div>`; }).join("")}</div></div>
</div>
<div style="display:grid;gap:12px">
<div class="card" style="padding:16px;display:grid;gap:12px"><b style="font-size:14px">Week total</b>
<div style="display:flex;align-items:baseline;gap:6px"><span class="num" style="font-size:30px">${hhmm(LOGGED + 7.67)}</span><span class="muted" style="font-size:13px">of 37:30 rostered</span></div>${bar((LOGGED + 7.67) / 37.5 * 100 > 100 ? 100 : (LOGGED + 7.67) / 37.5 * 100)}
<div style="display:grid;gap:7px;font-size:12.5px">${[["Ordinary", hhmm(LOGGED + 7.67 - LOT)], ["Overtime (×1.5)", hhmm(LOT)], ["Weekend hours", hhmm(7.88)], ["Unpaid breaks", "2:30"], ["Includes Wed fix", "7:40"]].map(([l, v], i) => `<div style="display:flex;justify-content:space-between"><span class="muted">${l}</span><span class="num" style="${i === 4 ? `color:${ink("danger", 85)}` : ""}">${v}</span></div>`).join("")}</div>
<span class="btn primary block">${ic("send", 15)}Submit for approval</span><span class="muted" style="font-size:11.5px;text-align:center">Fix Wed 18 Nov first · approved hours go to the 26 Nov pay run</span></div>
<div class="card" style="padding:14px 16px;display:grid;gap:10px"><b style="font-size:13px">Approval</b>${[["Clocked all shifts", "Kiosk at Harbour St", 1], ["Submit timesheet", "Due Mon 23 Nov 10:00", 0], ["Mara Okafor approves", "Usually same day", 0], ["Paid", "Thu 26 Nov 2026", 0]].map(([t, s, d], i) => `<div style="display:flex;gap:10px;align-items:flex-start"><span style="width:20px;height:20px;border-radius:50%;flex:none;display:grid;place-items:center;font:600 10px var(--font-b);${d ? "background:var(--primary);color:var(--on-primary)" : i === 1 ? "border:2px solid var(--primary);color:var(--primary)" : "border:1.5px solid var(--border);color:var(--muted)"}">${d ? ic("check", 11) : i + 1}</span><div><b style="font-size:12.5px">${t}</b>${sub(s, 11)}</div></div>`).join("")}</div>
<div class="card" style="padding:12px 14px;display:flex;gap:10px;align-items:center;font-size:12.5px"><span style="display:flex;color:var(--muted)">${ic("g2o_coffee", 18)}</span><div>Breaks over 6 h shifts are 30 min, unpaid. ${sub("Kiln &amp; Crumb staff handbook, section 4")}</div></div>
</div></div></main></div>`;
};
const tsWeekM = (p, st) => `<div class="phone">${status()}${MOB}${mtop("", "Timesheet", "Week of 16 Nov · Harbour St", ic("calendar", 20))}
<div class="mbody" style="gap:12px">
<div class="card" style="padding:16px;display:grid;gap:12px;box-shadow:var(--shadow)"><div style="display:flex;justify-content:space-between;align-items:center"><div><b style="font-size:14px">Today · Sat 21 Nov</b>${sub("Rostered 07:00–15:00 · Barista lead")}</div>${sb("On shift", "success")}</div>
<div style="display:flex;align-items:baseline;gap:8px"><span class="num" style="font-size:38px">4:45</span><span class="muted" style="font-size:13px">since 06:57 clock-in</span></div>${bar(4.75 / 8 * 100)}
<div style="display:flex;justify-content:space-between;font-size:12px" class="muted"><span>In 06:57 · Harbour St</span><span>Break 0 of 30 min</span><span>Ends 15:00</span></div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><span class="btn" style="height:44px">${ic("g2o_coffee", 16)}Start break</span><span class="btn primary" style="height:44px">${ic("g2o_clock", 16)}Clock out</span></div></div>
<div style="display:flex;justify-content:space-between;align-items:baseline"><b style="font-size:14px">This week</b><span class="muted" style="font-size:12.5px"><b class="num" style="color:var(--text)">${hhmm(7.7 + 8.22 + 7.47)}</b> logged · 37:30 rostered</span></div>
<div style="display:grid">${LWEEK.map((r) => { const today = r[1] === 21, miss = r[2] && !r[4] && !today; return `<div style="display:flex;align-items:center;gap:12px;padding:6px 0;border-bottom:1px solid var(--border)"><div style="width:38px;text-align:center;flex:none"><div class="muted" style="font-size:11px">${r[0]}</div><b class="num" style="font-size:16px">${r[1]}</b></div><div style="flex:1;min-width:0">${!r[2] ? `<span class="muted" style="font-size:13px">Day off</span>` : today ? `<b style="font-size:13px">06:57 – now</b>${sub("On shift · break not taken")}` : miss ? `<b style="font-size:13px;color:${ink("danger", 85)}">09:55 – missed clock-out</b>${sub("Tap to add your finish time")}` : `<b style="font-size:13px">${r[3]} – ${r[4]}</b>${sub(`Rostered ${r[2]} · ${r[5]} min break`)}`}</div>${!r[2] ? "" : today ? sb("Live", "success") : miss ? `<span class="btn" style="height:30px;font-size:12px;border-color:var(--danger)">Fix</span>` : `<span style="text-align:right"><b class="num" style="font-size:13.5px">${hhmm(r[6])}</b>${otOf(r) >= 0.25 ? `<div style="font-size:11px;font-weight:600;color:${ink("warning", 85)}">+${hhmm(otOf(r))} OT</div>` : ""}</span>`}</div>`; }).join("")}</div>
</div>${tabBar("Timesheet", ETABS)}</div>`;

// approvals, Harbour St, week 16–22 Nov (rostered = shift length minus 30 min unpaid break)
// [name, ini, role, rostered, submitted|null, overtime, flags[[label,kind]], status]
const APR = [
  ["Lin Park", "LP", "Barista lead", 37.5, 38.97, 1.1, [["Missed clock-out fixed", "warning"]], "Submitted"],
  ["Hana Sato", "HS", "Barista", 35.5, 39.74, 1.74, [["Unrostered shift", "warning"]], "Submitted"],
  ["Omar Haddad", "OH", "Barista", 27.0, null, 0, [["Not submitted", "danger"]], "Missing"],
  ["Sam Achebe", "SA", "Baker", 37.5, 37.9, 0, [], "Approved"],
  ["Jonah Weiss", "JW", "Baker", 37.5, 38.6, 0.75, [["Short break Fri", "warning"]], "Submitted"],
  ["Teodora Ruiz", "TR", "Front of house", 37.5, 37.4, 0, [], "Approved"],
  ["Priya Nair", "PN", "Front of house", 24.0, 21.9, 0, [["Left early Sun", "muted"]], "Queried"],
  ["Freya Lund", "FL", "Porter", 28.5, 28.3, 0, [["12 h annual leave", "muted"]], "Submitted"],
];
const AK = { Submitted: "primary", Approved: "success", Queried: "warning", Missing: "danger" };
const varc = (r) => r[4] == null ? `<span class="muted">—</span>` : (() => { const d = r[4] - r[3]; const big = Math.abs(d) >= 1; return `<b class="num" style="font-size:13px;color:${big ? ink(d > 0 ? "warning" : "danger", 85) : "var(--muted)"}">${d >= 0 ? "+" : "−"}${hhmm(Math.abs(d))}</b>`; })();
// Hana's days: [day, rostered, in, out, break, hours, note]
const HANA = [["Mon 16", "—", "10:02", "14:01", "0", 3.98, "Covered Omar’s sick call"], ["Tue 17", "10:00–18:00", "09:58", "18:04", "30", 7.6, ""], ["Wed 18", "06:00–14:00", "05:57", "14:02", "30", 7.58, ""], ["Thu 19", "06:00–14:00", "06:00", "14:05", "30", 7.58, ""], ["Sat 21", "07:00–15:00", "06:59", "15:00", "30", 7.52, ""], ["Sun 22", "08:00–14:00", "07:58", "13:57", "30", 5.48, ""]];
const taWeb = (p, st) => {
  const subm = APR.filter((r) => r[4] != null).reduce((a, r) => a + r[4], 0), ros = APR.reduce((a, r) => a + r[3], 0);
  return `<div class="shell">${oside(p, "Timesheets", MNAV, MARA)}<main class="main">${otop("Search staff, shifts", locSwitch())}
<div class="page" style="grid-template-columns:minmax(0,1fr) 350px;gap:16px;padding:18px 24px;align-items:start">
<div style="display:grid;gap:12px;min-width:0">
<div style="display:flex;align-items:flex-end;justify-content:space-between;gap:16px"><div class="ph"><h1 style="font-size:${H(st, 24)}px">Timesheet approvals</h1><p style="font-size:13px">Harbour St · week Mon 16 – Sun 22 Nov 2026 · locks for payroll Wed 25 Nov 12:00</p></div>
<div style="display:flex;gap:8px"><span class="btn">${ic("download", 15)}Export</span><span class="btn primary">${ic("check", 15)}Approve selected (1)</span></div></div>
<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px">${kpi("Waiting for you", "4", "submitted, not yet approved")}${kpi("Submitted vs rostered", `${hhmm(subm)} h`, `vs ${hhmm(ros - 27)} h rostered`)}${kpi("Overtime this week", hhmm(APR.reduce((a, r) => a + r[5], 0)) + " h", "paid at ×1.5 on 26 Nov")}${kpi("Not submitted", "1", "Omar Haddad · reminded 08:00", "danger")}</div>
<div style="display:flex;gap:8px;align-items:center">${chip("All 8", true)}${chip("Submitted 4")}${chip("Flagged 5")}${chip("Queried 1")}${chip("Approved 2")}<span class="muted" style="margin-left:auto;font-size:12.5px">Variance = submitted − rostered</span></div>
${tbl([[cb(false)], ["Employee"], ["Rostered", "right"], ["Submitted", "right"], ["Variance", "right"], ["OT", "right"], ["Flags"], ["Status"], ["", "right"]], APR.map((r, i) => [cb(i === 1), `<span style="display:flex;gap:9px;align-items:center">${av(r[1], 28, i)}<span><b style="font-weight:600">${r[0]}</b>${sub(r[2])}</span></span>`, `<span class="num muted">${hhmm(r[3])}</span>`, r[4] == null ? `<span class="muted">—</span>` : `<b class="num">${hhmm(r[4])}</b>`, varc(r), r[5] ? `<span class="num">${hhmm(r[5])}</span>` : `<span class="muted">—</span>`, r[6].length ? r[6].map(([t, k]) => sb(t, k)).join(" ") : `<span class="muted" style="font-size:12px">None</span>`, sb(r[7], AK[r[7]]),
    r[7] === "Submitted" ? `<span style="display:inline-flex;gap:6px"><span class="btn" title="Query" style="height:28px;width:30px;padding:0">${ic("g2o_query", 14)}</span><span class="btn primary" title="Approve" style="height:28px;width:30px;padding:0">${ic("check", 14)}</span></span>` : r[7] === "Missing" ? `<span class="btn" title="Remind" style="height:28px;width:30px;padding:0">${ic("mail", 14)}</span>` : `<span class="muted" style="display:inline-flex">${ic("more", 16)}</span>`]), { pad: "7px 10px", hl: [1] })}
<div class="card" style="padding:12px 16px;display:grid;grid-template-columns:repeat(3,1fr);gap:16px;font-size:12.5px">${[["g2o_clock", "Overtime", "After a 38 h contract week or past 8 h in a day, paid ×1.5"], ["g2o_coffee", "Breaks", "30 min unpaid on shifts over 6 h · flagged if shorter"], ["g2o_pay", "Payroll lock", "Approved hours go to the 9–22 Nov run, paid Thu 26 Nov"]].map(([i, t, d]) => `<div style="display:flex;gap:10px;align-items:flex-start"><span style="display:flex;color:${ink("primary", 80)}">${ic(i, 17)}</span><div><b>${t}</b>${sub(d)}</div></div>`).join("")}</div>
</div>
<div class="card" style="padding:16px;display:grid;gap:11px;box-shadow:var(--shadow)">
<div style="display:flex;gap:10px;align-items:center">${av("HS", 38, 1)}<div style="flex:1"><b style="font-size:15px">Hana Sato</b>${sub("Barista · 38 h contract")}</div>${sb("Submitted", "primary")}</div>
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;text-align:center">${[["Rostered", "35:30"], ["Submitted", hhmm(39.74)], ["Variance", "+" + hhmm(39.74 - 35.5)]].map(([l, v], i) => `<div style="padding:8px 4px;border-radius:var(--radius);background:${i === 2 ? tint(12, "warning") : track}"><span class="muted" style="font-size:11px">${l}</span><div class="num" style="font-size:16px;${i === 2 ? `color:${ink("warning", 85)}` : ""}">${v}</div></div>`).join("")}</div>
<div style="display:grid">${HANA.map(([d, ro, a, b, br, h, note]) => `<div style="display:grid;grid-template-columns:52px 1fr auto;gap:8px;align-items:center;padding:6px 0;border-bottom:1px solid var(--border);font-size:12.5px"><b style="font-weight:600">${d}</b><div style="min-width:0"><span class="num">${a}–${b}</span>${note ? `<div style="font-size:11px;font-weight:600;color:${ink("warning", 85)}">Unrostered · ${note}</div>` : `<div class="muted" style="font-size:11px">Rostered ${ro} · ${br} min break</div>`}</div><b class="num">${hhmm(h)}</b></div>`).join("")}</div>
<div class="input" style="height:58px;align-items:flex-start;padding-top:9px;font-size:12.5px">Add a note for Hana (optional)</div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><span class="btn">${ic("g2o_query", 15)}Query</span><span class="btn primary">${ic("check", 15)}Approve</span></div>
<span class="muted" style="font-size:11.5px;text-align:center">Approving sends ${hhmm(39.74 - 35.5)} extra hours to the 26 Nov pay run</span>
</div></div></main></div>`;
};
const taMobile = (p, st) => `<div class="phone">${status()}${MOB}${mtop("", "Approvals", "Harbour St · 16–22 Nov", ic("filter", 20))}
<div class="mbody" style="gap:11px">
${seg(["Pending 4", "Queried 1", "Approved 2"], 0, 34, true)}
${alertRow("Omar Haddad hasn’t submitted", "Rostered 27:00 · locks Wed 25 Nov 12:00", "danger", `<span class="btn" style="height:28px;font-size:12px">Remind</span>`)}
${APR.filter((r) => r[7] === "Submitted").map((r, i) => `<div class="card" style="padding:12px 14px;display:grid;gap:9px"><div style="display:flex;gap:10px;align-items:center">${av(r[1], 34, i)}<div style="flex:1;min-width:0"><b style="font-size:14px">${r[0]}</b>${sub(r[2])}</div><div style="text-align:right"><b class="num" style="font-size:15px">${hhmm(r[4])}</b><div style="font-size:11.5px">${varc(r).replace("font-size:13px", "font-size:11.5px")} <span class="muted">vs ${hhmm(r[3])}</span></div></div></div>
<div style="display:flex;gap:8px;align-items:center"><span style="flex:1;display:flex;gap:6px;overflow:hidden">${r[6].map(([t, k]) => sb(t, k)).join("")}</span><span class="btn" style="height:32px;padding:0 10px">${ic("g2o_query", 15)}</span><span class="btn primary" style="height:32px">${ic("check", 14)}Approve</span></div></div>`).join("")}
<span class="btn block" style="margin-top:auto;height:44px">Approve all 4 · ${hhmm(APR.filter((r) => r[7] === "Submitted").reduce((a, r) => a + r[4], 0))} h</span></div>${tabBar("Timesheets", MTABS)}</div>`;

/* ================================================================ BANK (Mintwell · Park Studio invoices) */
const BNAV = [["home", "Home"], ["card", "Accounts"], ["send", "Payments"], ["g2o_invoice", "Invoices"], ["users", "Clients"], ["chart", "Insights"], ["gear", "Settings"]];
const BTABS = [["home", "Home"], ["card", "Accounts"], ["g2o_invoice", "Invoices"], ["send", "Payments"]];
const bside = (p, active) => `<aside class="side"><div class="logo" style="white-space:nowrap"><b></b>${esc(p.name)}<span class="muted" style="font-weight:500;font-size:12px;margin-left:2px">Business</span></div>
${BNAV.map(([i, l]) => `<div class="nav${l === active ? " on" : ""}">${ic(i)}${l}</div>`).join("")}
<div class="foot">${av("PS", 28, 1)}<div><div style="font-weight:500">Park Studio</div><div class="muted" style="font-size:12px">Lin Park · owner</div></div></div></aside>`;
const btop = (title, search) => `<div class="top"><div style="font-weight:600;font-size:15px">${title}</div><div class="search">${ic("search", 15)}${search}</div><span style="display:flex;color:var(--muted)">${ic("bell", 19)}</span></div>`;
// [no, client, initials, issued, due, amount, status, note]
const INV = [
  ["INV-0052", "Fennimore Tea Rooms", "FT", "—", "—", 5164.2, "Draft", "Not sent"],
  ["INV-0051", "Ostrava Labs", "OL", "—", "—", 1800.0, "Draft", "Not sent"],
  ["INV-0050", "Hollowmere Books", "HB", "6 Nov", "20 Nov", 960.0, "Sent", "Viewed 7 Nov"],
  ["INV-0049", "Palo Verde Co.", "PV", "2 Nov", "2 Dec", 3120.0, "Sent", "Due in 23 days"],
  ["INV-0048", "Saltmarsh Cycles", "SC", "30 Oct", "13 Nov", 1440.0, "Sent", "Due in 4 days"],
  ["INV-0047", "Quillfeather Press", "QP", "15 Oct", "29 Oct", 1650.0, "Overdue", "11 days late"],
  ["INV-0046", "Orrin & Bell Architects", "OB", "26 Oct", "25 Nov", 2070.0, "Sent", "Not viewed yet"],
  ["INV-0045", "Hollowmere Books", "HB", "9 Oct", "23 Oct", 660.0, "Overdue", "17 days late"],
  ["INV-0044", "Ostrava Labs", "OL", "5 Oct", "4 Nov", 4200.0, "Paid", "Paid 3 Nov"],
  ["INV-0043", "Palo Verde Co.", "PV", "1 Oct", "31 Oct", 2880.0, "Paid", "Paid 28 Oct"],
  ["INV-0042", "Ostrava Labs", "OL", "28 Sep", "28 Oct", 3412.8, "Paid", "Paid 27 Oct"],
];
const IK = { Draft: "muted", Sent: "primary", Overdue: "danger", Paid: "success" };
const tot = (s) => INV.filter((r) => s.includes(r[6])).reduce((a, r) => a + r[5], 0);
const OUT = tot(["Sent", "Overdue"]), OVER = tot(["Overdue"]), PAID = tot(["Paid"]);
const cnt = (s) => INV.filter((r) => r[6] === s).length;
const invAct = (s) => s === "Draft" ? "Edit" : s === "Overdue" ? "Send reminder" : s === "Sent" ? "Record payment" : "Receipt";
const ilWeb = (p, st) => `<div class="shell">${bside(p, "Invoices")}<main class="main">${btop("Invoices", "Search invoices, clients, amounts")}
<div class="page" style="grid-template-columns:minmax(0,1fr) 300px;gap:18px;padding:20px 24px;align-items:start">
<div style="display:grid;gap:12px;min-width:0">
<div style="display:flex;align-items:flex-end;justify-content:space-between"><div class="ph"><h1 style="font-size:${H(st, 24)}px">Invoices</h1><p style="font-size:13px">Park Studio · payments to your ${esc(p.name)} account are matched and marked paid automatically</p></div>
<div style="display:flex;gap:8px"><span class="btn">${ic("download", 15)}Export</span><span class="btn primary">${ic("plus", 15)}New invoice</span></div></div>
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">${kpi("Outstanding", gbp(OUT), `${cnt("Sent") + cnt("Overdue")} invoices sent and unpaid`)}${kpi("Overdue", gbp(OVER), `${cnt("Overdue")} invoices · oldest 17 days late`, "danger")}${kpi("Paid in the last 30 days", gbp(PAID), `${cnt("Paid")} invoices · average 27 days to pay`, "success")}</div>
<div style="display:flex;gap:8px;align-items:center">${chip(`All ${INV.length}`, true)}${chip(`Draft ${cnt("Draft")}`)}${chip(`Sent ${cnt("Sent")}`)}${chip(`Overdue ${cnt("Overdue")}`)}${chip(`Paid ${cnt("Paid")}`)}<span style="margin-left:auto;display:flex;gap:8px"><span class="btn" style="height:32px">${ic("users", 14)}All clients${ic("chevdown", 13)}</span><span class="btn" style="height:32px">${ic("calendar", 14)}Last 90 days${ic("chevdown", 13)}</span></span></div>
${tbl([[cb(false)], ["Invoice"], ["Client"], ["Issued"], ["Due"], ["Amount", "right"], ["Status"], ["", "right"]], INV.map((r, i) => [cb(r[6] === "Overdue"), `<b class="num" style="font-size:13px">${r[0]}</b>`, `<span style="display:flex;gap:9px;align-items:center">${av(r[2], 26, i)}<b style="font-weight:600">${r[1]}</b></span>`, `<span class="muted">${r[3]}</span>`, `<span style="${r[6] === "Overdue" ? `color:${ink("danger", 85)};font-weight:600` : ""}" class="${r[6] === "Overdue" ? "" : "muted"}">${r[4]}</span> <span class="muted" style="font-size:11.5px;font-weight:400">· ${r[7]}</span>`, `<b class="num">${gbp(r[5])}</b>`, sb(r[6], IK[r[6]]), `<span style="display:inline-flex;gap:8px;align-items:center"><span style="font-size:12.5px;font-weight:600;color:${r[6] === "Paid" ? "var(--muted)" : "var(--primary)"}">${invAct(r[6])}</span><span class="muted" style="display:flex">${ic("more", 16)}</span></span>`]), { pad: "9px 12px", hl: [5, 7] })}
<div style="display:flex;justify-content:space-between;align-items:center;font-size:12.5px" class="muted"><span>Showing 11 of 46 invoices · 2 selected</span><span style="display:flex;gap:6px">${["‹", "1", "2", "3", "4", "5", "›"].map((t, i) => `<span style="width:28px;height:28px;display:grid;place-items:center;border-radius:var(--radius-sm);${i === 1 ? "background:var(--primary);color:var(--on-primary)" : "border:1px solid var(--border)"}">${t}</span>`).join("")}</span></div>
</div>
<div style="display:grid;gap:12px">
<div class="card" style="padding:16px;display:grid;gap:10px"><b style="font-size:13.5px">Expected in the next 4 weeks</b>
<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;align-items:end;height:96px">${[["9–15 Nov", 1440, 2310], ["16–22 Nov", 960, 0], ["23–29 Nov", 2070, 0], ["30 Nov–6 Dec", 3120, 0]].map(([w, a, o]) => `<div style="display:grid;gap:4px;justify-items:center;align-self:end"><div class="num" style="font-size:11px">${gbp(a + o).replace(".00", "")}</div><div style="width:100%;display:flex;flex-direction:column;justify-content:flex-end;height:${Math.round((a + o) / 3800 * 62)}px;border-radius:4px 4px 0 0;overflow:hidden">${o ? `<span style="height:${Math.round(o / (a + o) * 100)}%;background:var(--danger)"></span>` : ""}<span style="flex:1;background:var(--primary)"></span></div></div>`).join("")}</div>
<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;text-align:center" class="muted">${["9–15 Nov", "16–22 Nov", "23–29 Nov", "30 Nov–6 Dec"].map((w) => `<span style="font-size:10.5px">${w}</span>`).join("")}</div>
<div class="muted" style="font-size:11.5px;display:flex;gap:12px"><span style="display:inline-flex;gap:5px;align-items:center"><span style="width:8px;height:8px;border-radius:2px;background:var(--primary)"></span>Due</span><span style="display:inline-flex;gap:5px;align-items:center"><span style="width:8px;height:8px;border-radius:2px;background:var(--danger)"></span>Overdue, chasing</span></div></div>
<div class="card" style="padding:14px 16px;display:grid;gap:10px"><b style="font-size:13.5px">Overdue · chase</b>${INV.filter((r) => r[6] === "Overdue").map((r, i) => `<div style="display:grid;gap:6px;padding-bottom:9px;border-bottom:1px solid var(--border)"><div style="display:flex;justify-content:space-between;font-size:12.5px"><b>${r[1]}</b><b class="num">${gbp(r[5])}</b></div><div style="display:flex;justify-content:space-between;align-items:center;font-size:11.5px"><span style="color:${ink("danger", 85)};font-weight:600">${r[0]} · ${r[7]}</span><span class="btn" style="height:26px;font-size:11.5px;padding:0 9px">${ic("mail", 13)}Remind</span></div></div>`).join("")}
<div style="display:flex;justify-content:space-between;align-items:center;font-size:12.5px"><span>Auto-remind 3 and 10 days after due</span>${tog(true)}</div></div>
<div class="card" style="padding:14px 16px;display:flex;gap:10px;align-items:flex-start;font-size:12.5px"><span style="display:flex;color:${ink("primary", 80)}">${ic("link", 17)}</span><div><b>Card payment links</b>${sub("On for new invoices · clients pay by card or bank transfer from the invoice")}</div></div>
</div></div></main></div>`;
const ilMobile = (p, st) => `<div class="phone">${status()}${MOB}<div class="mtop"><b class="h" style="font-size:${H(st, 24)}px">Invoices</b><span style="display:flex;gap:16px;color:var(--muted)">${ic("search", 21)}${ic("filter", 21)}</span></div>
<div class="mbody" style="gap:11px;position:relative">
<div class="card" style="padding:14px 16px;display:grid;grid-template-columns:1fr 1fr;gap:10px"><div><span class="muted" style="font-size:12px">Outstanding</span><div class="num" style="font-size:22px">${gbp(OUT)}</div>${sub(cnt("Sent") + cnt("Overdue") + " unpaid", 11)}</div><div style="padding-left:12px;border-left:1px solid var(--border)"><span class="muted" style="font-size:12px">Overdue</span><div class="num" style="font-size:22px;color:${ink("danger", 85)}">${gbp(OVER)}</div>${sub(cnt("Overdue") + " invoices", 11)}</div>
<div style="grid-column:1/-1;display:flex;justify-content:space-between;font-size:12px;padding-top:9px;border-top:1px solid var(--border)"><span class="muted">Paid last 30 days</span><b class="num" style="color:${ink("success", 85)}">${gbp(PAID)}</b></div></div>
<div style="display:flex;gap:6px;overflow:hidden">${chip("All", true)}${chip("Draft " + cnt("Draft"))}${chip("Sent " + cnt("Sent"))}${chip("Overdue " + cnt("Overdue"))}${chip("Paid")}</div>
<div style="display:grid">${INV.slice(1, 8).map((r, i) => `<div style="display:flex;align-items:center;gap:11px;padding:8px 0;border-bottom:1px solid var(--border)">${av(r[2], 34, i)}<div style="flex:1;min-width:0"><b style="font-size:13.5px;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${r[1]}</b><span class="muted" style="font-size:11.5px">${r[0]} · ${r[6] === "Draft" ? "draft" : "due " + r[4]}</span></div><div style="text-align:right;display:grid;gap:3px;justify-items:end"><b class="num" style="font-size:14px">${gbp(r[5])}</b>${sb(r[6], IK[r[6]])}</div></div>`).join("")}</div>
<span class="btn primary" style="position:absolute;right:20px;bottom:14px;height:48px;padding:0 18px;border-radius:999px;box-shadow:var(--shadow-lg)">${ic("plus", 18)}New invoice</span>
</div>${tabBar("Invoices", BTABS)}</div>`;

// create invoice INV-0052 for Fennimore Tea Rooms
const LINES = [["Brand identity refresh", "Logo, colour palette and type system", 1, "item", 2400], ["Packaging design", "Tins for 3 tea blends, front and back", 3, "design", 450], ["Print-ready artwork and press check", "Half a day at the printer included", 1.5, "day", 520]];
const SUBT = LINES.reduce((a, l) => a + l[2] * l[4], 0), DISC = SUBT * 0.05, NETT = SUBT - DISC, VAT = NETT * 0.2, TOTAL = NETT + VAT;
const fld = (label, val, o = {}) => `<div class="field" style="gap:5px;min-width:0"><label style="font-size:12px">${label}</label><div class="input${val ? " filled" : ""}" style="height:${o.h || 38}px;font-size:13px;gap:8px;justify-content:space-between;${o.style || ""}">${val || o.ph || ""}${o.icon ? `<span style="display:flex;color:var(--muted)">${ic(o.icon, 15)}</span>` : ""}</div></div>`;
const totRows = (fs = 13) => [["Subtotal", gbp(SUBT)], ["Discount (5%, returning client)", "−" + gbp(DISC)], ["VAT 20%", gbp(VAT)]].map(([l, v]) => `<div style="display:flex;justify-content:space-between;font-size:${fs}px"><span class="muted">${l}</span><span class="num">${v}</span></div>`).join("");
const icWeb = (p, st) => `<div class="shell">${bside(p, "Invoices")}<main class="main">${btop("Invoices", "Search invoices, clients, amounts")}
<div class="page" style="grid-template-columns:minmax(0,1fr) 450px;gap:20px;padding:18px 24px;align-items:start">
<div style="display:grid;gap:12px;min-width:0">
<div style="display:flex;align-items:center;justify-content:space-between"><div class="ph"><div class="muted" style="font-size:12.5px;display:flex;gap:6px;align-items:center">${ic("back", 13)}Invoices</div><h1 style="font-size:${H(st, 24)}px">New invoice</h1></div><div style="display:flex;gap:8px"><span class="btn">Save draft</span><span class="btn primary">${ic("send", 15)}Send invoice</span></div></div>
<div class="card" style="padding:14px 16px;display:grid;grid-template-columns:1.7fr 1fr 1fr 1fr;gap:12px">${fld("Client", `<span style="display:flex;gap:8px;align-items:center;min-width:0">${av("FT", 22, 0)}<b style="font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">Fennimore Tea Rooms</b></span>`, { icon: "chevdown" })}${fld("Invoice number", "INV-0052")}${fld("Issue date", "9 Nov 2026", { icon: "calendar" })}${fld("Due date", "23 Nov 2026", { icon: "chevdown" })}
${fld("Send to", "Hollis Fennimore · accounts", { icon: "chevdown" })}${fld("Currency", "GBP £", { icon: "chevdown" })}${fld("Client PO ref", "FTR-PO-118")}${fld("Attachment", `<span style="display:flex;gap:6px;align-items:center;min-width:0">${ic("doc", 14)}<span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">tin-dielines.pdf</span></span>`, { icon: "x" })}</div>
<div class="card" style="padding:14px 16px;display:grid;gap:8px"><div style="display:grid;grid-template-columns:minmax(0,1fr) 80px 110px 100px 24px;gap:10px;font:600 12px var(--font-b)" class="muted"><span>Item and description</span><span style="text-align:right">Qty</span><span style="text-align:right">Rate</span><span style="text-align:right">Amount</span><span></span></div>
${LINES.map(([n, d, q, u, r]) => `<div style="display:grid;grid-template-columns:minmax(0,1fr) 80px 110px 100px 24px;gap:10px;align-items:center"><div class="input filled" style="height:46px;display:grid;align-content:center;gap:0;font-size:13px;line-height:1.3"><b style="font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${n}</b><span class="muted" style="font-size:11.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${d}</span></div><div class="input filled num" style="height:46px;justify-content:flex-end;font-size:13px">${q} <span class="muted" style="font-size:11px;margin-left:4px">${u}${q > 1 && u !== "day" ? "s" : q > 1 ? "s" : ""}</span></div><div class="input filled num" style="height:46px;justify-content:flex-end;font-size:13px">${gbp(r)}</div><b class="num" style="text-align:right;font-size:13.5px">${gbp(q * r)}</b><span class="muted" style="display:flex">${ic("trash", 15)}</span></div>`).join("")}
<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:20px;padding-top:8px;border-top:1px solid var(--border)"><span style="display:flex;gap:8px"><span class="btn" style="height:32px">${ic("plus", 14)}Add line</span><span class="btn" style="height:32px">${ic("tag", 14)}Add discount</span></span>
<div style="display:grid;gap:6px;width:300px">${totRows()}<div style="display:flex;justify-content:space-between;font-size:15px;font-weight:700;padding-top:6px;border-top:1px solid var(--border)"><span>Total due</span><span class="num">${gbp(TOTAL)}</span></div></div></div></div>
<div class="card" style="padding:14px 16px;display:grid;grid-template-columns:1fr 1fr;gap:14px">
<div style="display:grid;gap:10px">${fld("Payment terms", "Net 14 · pay by 23 Nov 2026", { icon: "chevdown" })}<div style="display:grid;gap:8px;font-size:12.5px">${[["Card payment link on the invoice", true], ["Remind client 3 days before due", true], ["Charge late fee after 30 days", false]].map(([t, on]) => `<div style="display:flex;justify-content:space-between;align-items:center"><span>${t}</span>${tog(on)}</div>`).join("")}</div></div>
<div class="field" style="gap:5px"><label style="font-size:12px">Notes to client</label><div class="input filled" style="height:116px;align-items:flex-start;padding-top:9px;font-size:12.5px;line-height:1.45">Thanks for having us back for the tea tins. Bank transfer to the account below or pay by card from the link. Quote INV-0052 as the reference.</div></div></div>
</div>
<div style="display:grid;gap:8px"><div style="display:flex;justify-content:space-between;align-items:center"><span class="muted" style="font-size:12.5px;display:flex;gap:6px;align-items:center">${ic("eye", 15)}Live preview · what Fennimore Tea Rooms sees</span>${seg(["Invoice", "Email"], 0, 28)}</div>
<div class="card" style="padding:22px 24px;display:grid;gap:13px;box-shadow:var(--shadow-lg);font-size:11.5px">
<div style="display:flex;justify-content:space-between;align-items:flex-start"><div><div style="display:flex;gap:8px;align-items:center"><span style="width:26px;height:26px;border-radius:50%;background:var(--text)"></span><b style="font-size:14px">Park Studio</b></div>${sub("Lin Park · 7 Cooper’s Yard, Leeds", 10.5)}</div><div style="text-align:right"><div class="h" style="font-size:${H(st, 22)}px">Invoice</div><b class="num" style="font-size:12px">INV-0052</b></div></div>
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">${[["Billed to", "Fennimore Tea Rooms<br>12 Abbey Row, York"], ["Issued", "9 Nov 2026"], ["Due", "23 Nov 2026"]].map(([l, v]) => `<div><div class="muted" style="font-size:10px;text-transform:uppercase;letter-spacing:.06em">${l}</div><div style="font-weight:600;font-size:11.5px">${v}</div></div>`).join("")}</div>
<div style="display:grid">${`<div style="display:grid;grid-template-columns:1fr 46px 74px;gap:8px;padding:5px 0;border-bottom:1.5px solid var(--text);font-weight:600;font-size:10.5px"><span>Description</span><span style="text-align:right">Qty</span><span style="text-align:right">Amount</span></div>`}${LINES.map(([n, d, q, u, r]) => `<div style="display:grid;grid-template-columns:1fr 46px 74px;gap:8px;padding:6px 0;border-bottom:1px solid var(--border)"><span><b style="font-weight:600">${n}</b><div class="muted" style="font-size:10.5px">${gbp(r)} per ${u}</div></span><span class="num" style="text-align:right">${q}</span><span class="num" style="text-align:right">${gbp(q * r)}</span></div>`).join("")}</div>
<div style="display:grid;gap:4px;justify-self:end;width:230px">${totRows(11.5)}<div style="display:flex;justify-content:space-between;font-size:13.5px;font-weight:700;padding-top:5px;border-top:1.5px solid var(--text)"><span>Total due</span><span class="num">${gbp(TOTAL)}</span></div></div>
<div style="display:grid;grid-template-columns:1fr auto;gap:12px;align-items:center;padding:10px 12px;border-radius:var(--radius);background:${tint(8)}"><div><b style="font-size:11.5px">Pay by bank transfer</b><div class="muted num" style="font-size:10.5px">Park Studio · 04-00-62 · 31873817 · ref INV-0052</div></div><span class="btn primary" style="height:28px;font-size:11px">Pay by card</span></div>
<div class="muted" style="font-size:10.5px">Payment terms: Net 14. VAT reg. 318 2201 74. Thanks for having us back for the tea tins.</div>
</div>
<div class="card" style="padding:12px 14px;display:grid;gap:8px;font-size:12.5px"><div style="display:flex;justify-content:space-between;align-items:center"><b>When you send</b><span class="muted" style="font-size:11.5px">Draft saved 10:42</span></div>${[["mail", "Emailed to Hollis Fennimore with a PDF and pay link"], ["g2o_bank", "Bank transfers quoting INV-0052 are matched and marked paid"], ["g2o_bell", "Reminder on Fri 20 Nov if still unpaid"]].map(([i, t]) => `<div style="display:flex;gap:9px;align-items:center"><span style="display:flex;color:${ink("primary", 80)}">${ic(i, 15)}</span><span class="muted">${t}</span></div>`).join("")}</div>
</div></div></main></div>`;
const icMobile = (p, st) => `<div class="phone">${status()}${MOB}${mtop("x", "New invoice", "INV-0052 · draft saved", `<span style="font-size:13px;font-weight:600;color:var(--primary)">Preview</span>`)}
<div class="mbody" style="gap:11px;padding-bottom:10px">
<div class="card" style="padding:10px 12px;display:flex;gap:10px;align-items:center">${av("FT", 34, 0)}<div style="flex:1;min-width:0"><span class="muted" style="font-size:11px">Bill to</span><b style="display:block;font-size:14px">Fennimore Tea Rooms</b></div><span class="muted" style="display:flex">${ic("chevron", 16)}</span></div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">${fld("Issue date", "9 Nov 2026", { h: 36 })}${fld("Due", "23 Nov · Net 14", { h: 36 })}</div>
<div style="display:flex;justify-content:space-between;align-items:baseline">${lbl("Line items")}<span class="muted" style="font-size:12px">3 items</span></div>
<div style="display:grid;gap:8px">${LINES.map(([n, d, q, u, r]) => `<div class="card" style="padding:10px 12px;display:grid;gap:4px;box-shadow:none"><div style="display:flex;justify-content:space-between;gap:10px"><b style="font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${n}</b><b class="num" style="font-size:13.5px">${gbp(q * r)}</b></div><div style="display:flex;justify-content:space-between;font-size:11.5px" class="muted"><span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0">${d}</span><span class="num" style="flex:none;margin-left:8px">${q} × ${gbp(r)}</span></div></div>`).join("")}
<span class="btn" style="height:38px;border-style:dashed">${ic("plus", 15)}Add line item</span></div>
<div style="display:grid;gap:6px;padding:10px 12px;border-radius:var(--radius);background:color-mix(in oklab,var(--surface) 50%,var(--bg));border:1px solid var(--border)">${totRows(12.5)}</div>
<div style="display:flex;justify-content:space-between;align-items:center;font-size:13px"><span>Card payment link</span>${tog(true)}</div>
<div style="display:flex;justify-content:space-between;align-items:center;font-size:13px"><span>Remind 3 days before due</span>${tog(true)}</div>
</div>
<div style="flex:none;border-top:1px solid var(--border);background:var(--surface);padding:12px 20px 30px;display:flex;align-items:center;gap:14px;box-shadow:var(--shadow-lg)"><div style="flex:1"><span class="muted" style="font-size:11.5px">Total incl. VAT</span><div class="num" style="font-size:22px">${gbp(TOTAL)}</div></div><span class="btn primary" style="height:46px;padding:0 22px">${ic("send", 16)}Send</span></div></div>`;

module.exports = {
  payroll: { family: "ops", name: "Payroll", shows: "payroll for a small multi-location business: a fortnightly pay run to review and approve with hours, overtime, gross, tax, retirement deductions and net pay per employee, and an employee payslip with earnings, deductions, year-to-date totals and bank deposit",
    elements: ["sidebar-nav", "table", "kpi-tiles", "stepper", "alert", "badge", "filter-chips", "checkbox", "avatar", "button", "list", "download"],
    variants: {
      "pay-run": { name: "Pay run review and approval", shows: "a fortnightly pay run to review and approve: pay period and pay date, progress steps, gross / tax / retirement / net pay totals, warnings for a missing timesheet and excess overtime, an employees table with role, location, hours, overtime, gross, tax, deductions and net pay, and an approve and pay button" },
      payslip: { name: "Employee payslip (pay stub)", shows: "an employee payslip / pay stub: employee and pay period details, earnings lines (ordinary hours, overtime, weekend penalty, holiday pay) with rates, deductions (income tax, retirement contribution), this period and year-to-date columns, net pay, bank deposit, leave balances, past payslips and a download PDF button" },
    },
    web: pick({ "pay-run": prWeb, payslip: psWeb }), mobile: pick({ "pay-run": prMobile, payslip: psMobile }) },
  timesheet: { family: "ops", name: "Timesheet", shows: "employee timesheets: a weekly timesheet grid with clock in/out per day, breaks, hours, overtime flags and a missed clock-out to fix before submitting, and a manager timesheet approval list with submitted vs rostered hours, variance flags and approve or query actions",
    elements: ["sidebar-nav", "table", "time-input", "alert", "badge", "chart", "progress", "timeline", "kpi-tiles", "filter-chips", "checkbox", "segmented-control", "button"],
    variants: {
      week: { name: "Weekly timesheet (clock in / out)", shows: "an employee weekly timesheet grid: days with rostered shift, clock in and clock out, break, hours and overtime flags, a missed clock-out to fix with a reason, worked vs rostered bars, the week total vs rostered and a submit for approval button; on mobile a today clock in/out card with break and clock-out buttons above the week list" },
      approval: { name: "Timesheet approval (manager)", shows: "a manager timesheet approval screen: staff table with rostered vs submitted hours, variance, overtime, flags (unrostered shift, short break, missed clock-out), status and approve / query actions, KPI tiles, and a selected employee's daily timesheet detail with a note and approve button" },
    },
    web: pick({ week: tsWeek, approval: taWeb }), mobile: pick({ week: tsWeekM, approval: taMobile }) },
  "invoice-list": { family: "bank", name: "Invoices", shows: "small business invoicing: an invoices list table with Draft, Sent, Overdue and Paid status chips, outstanding / overdue / paid totals, filters and reminders, and a create invoice form with line items, tax, discount, totals and a live invoice preview",
    elements: ["sidebar-nav", "table", "badge", "filter-chips", "kpi-tiles", "search", "checkbox", "pagination", "chart", "form", "toggle", "button", "fab", "avatar"],
    variants: {
      list: { name: "Invoices list with status", shows: "an invoices list table for a small business: outstanding, overdue and paid totals, status filter chips (Draft, Sent, Overdue, Paid), client and date filters, invoice number, client, issue and due date, amount, status chips and row actions (send reminder, record payment), cash expected by week and an overdue chase list, plus a New invoice button" },
      create: { name: "Create invoice with live preview", shows: "a create invoice form: client, invoice number, issue and due dates, line items with quantity, rate and amount, discount, VAT, subtotal and total, payment terms, card payment link and reminder toggles, notes, and a live preview of the finished invoice beside the form; on mobile a form with line item cards and a sticky total with a send button" },
    },
    web: pick({ list: ilWeb, create: icWeb }), mobile: pick({ list: ilMobile, create: icMobile }) },
};
