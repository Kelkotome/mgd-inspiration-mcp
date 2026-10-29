/* Marketing website sections for Patchbay (API monitoring): bento-features, how-it-works, integrations-grid, changelog, careers, security-trust. */
const { ic, esc, areaChart } = require("../lib");

const TPL = {};
const H = (st, n) => Math.round(n * st.hscale);
const eyebrow = (t) => `<span class="badge">${t}</span>`;
const MONO = "ui-monospace,SFMono-Regular,Menlo,monospace";
const soft = (pct = 70) => `color-mix(in oklab,var(--bg) ${pct}%,var(--surface))`;
const tint = (c, pct) => `color-mix(in oklab,var(${c}) ${pct}%,var(--surface))`;
const ink = (c, pct = 75) => `color-mix(in oklab,var(${c}) ${pct}%,var(--text))`;
const chip = (t, on, n) => `<span style="display:inline-flex;align-items:center;gap:6px;height:32px;padding:0 13px;border-radius:999px;font-size:13px;font-weight:500;white-space:nowrap;border:1px solid ${on ? "var(--text)" : "var(--border)"};background:${on ? "var(--text)" : "var(--surface)"};color:${on ? "var(--bg)" : "var(--text)"}">${t}${n != null ? `<span style="font-size:11px;opacity:.65">${n}</span>` : ""}</span>`;
const iconTile = (n, s = 36) => `<span style="width:${s}px;height:${s}px;border-radius:var(--radius);display:grid;place-items:center;flex:none;background:${tint("--primary", 12)};color:${ink("--primary", 85)}">${ic(n, Math.round(s * 0.5))}</span>`;
const dot = (warn, s = 8) => `<span style="width:${s}px;height:${s}px;border-radius:50%;flex:none;background:${warn ? "var(--accent)" : "var(--primary)"};box-shadow:0 0 0 3px color-mix(in oklab,${warn ? "var(--accent)" : "var(--primary)"} 20%,transparent)"></span>`;
const uptime = (rnd, n, h, warnAt = []) => `<div style="display:flex;gap:2px;height:${h}px">${Array.from({ length: n }, (_, i) => { const r = rnd(); const warn = warnAt.includes(i) || r > 0.975; return `<span style="flex:1;border-radius:2px;background:${warn ? "var(--accent)" : tint("--primary", 72)}"></span>`; }).join("")}</div>`;
const arrowLink = (t) => `<span style="display:inline-flex;align-items:center;gap:6px;font-weight:600;color:${ink("--primary", 80)}">${t}${ic("arrow", 15)}</span>`;

// ---- bento-features ------------------------------------------------------------------------
const bentoTile = (title, desc, visual, extra = "") => `<div class="card" style="padding:22px;display:flex;flex-direction:column;gap:16px;overflow:hidden;${extra}"><div><div style="font-weight:600;font-size:17px">${title}</div><div class="muted" style="font-size:14px;margin-top:4px;line-height:1.45">${desc}</div></div>${visual}</div>`;
const panel = (inner, extra = "") => `<div style="border-radius:var(--radius);background:${soft()};border:1px solid var(--border);padding:14px;${extra}">${inner}</div>`;
const latencyVis = (rnd, w, h, compact) => panel(`<div style="display:flex;gap:${compact ? 14 : 22}px;margin-bottom:10px">${[["p50", "84 ms"], ["p95", "231 ms"], ["p99", "418 ms"]].map(([l, v], i) => `<div><div class="muted" style="font-size:11px;font-weight:600">${l}</div><div class="num" style="font-size:${compact ? 17 : 20}px;${i === 2 ? `color:${ink("--accent")}` : ""}">${v}</div></div>`).join("")}<span class="muted" style="margin-left:auto;font-size:11px;align-self:start">GET /v1/checkout · 24 h</span></div>
<div style="position:relative;flex:1;min-height:${h}px"><div style="position:absolute;inset:0">${areaChart(rnd, w, h).replace(`height="${h}"`, 'height="100%"').replace(/stroke-width="2"/, 'stroke-width="2" vector-effect="non-scaling-stroke"').replace(/stroke-dasharray/g, 'vector-effect="non-scaling-stroke" stroke-dasharray')}</div><div style="position:absolute;left:0;right:0;top:9%;border-top:1.5px dashed var(--accent)"></div><span style="position:absolute;left:0;top:calc(9% - 19px);font-size:10.5px;font-weight:600;padding:0 4px;border-radius:var(--radius-sm);background:${soft()};color:${ink("--accent")}">p99 budget · 400 ms</span></div>`, "flex:1;display:flex;flex-direction:column");
const alertVis = () => `<div style="display:grid;gap:8px">${panel(`<div style="display:flex;gap:10px;align-items:flex-start"><span style="width:28px;height:28px;border-radius:var(--radius);display:grid;place-items:center;flex:none;background:${tint("--accent", 18)};color:${ink("--accent")}">${ic("bell", 15)}</span><div style="font-size:12.5px;line-height:1.4;min-width:0"><div style="font-weight:600">p95 above 500 ms · /v1/search</div><div class="muted">Paged Lin Park · on call until 18:00</div></div></div><div style="display:flex;gap:6px;margin-top:10px"><span class="btn primary" style="height:28px;font-size:12px;padding:0 10px">Acknowledge</span><span class="btn" style="height:28px;font-size:12px;padding:0 10px">Snooze 15 m</span></div>`)}<div class="muted" style="display:flex;justify-content:space-between;font-size:11.5px;padding:0 2px"><span>Escalates to Sam Achebe in 5 min</span><span class="num" style="font-size:11.5px">41 s to page</span></div></div>`;
const uptimeVis = (rnd, n) => `<div style="display:grid;gap:10px">${[["Checkout API", "99.99%", 0], ["Search", "99.82%", 1], ["Auth", "100%", 0]].map(([l, v, w]) => `<div><div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:5px"><span style="display:flex;align-items:center;gap:7px;font-weight:500">${dot(w, 7)}${l}</span><span class="num" style="font-size:12px">${v}</span></div>${uptime(rnd, n, 16, w ? [n - 7, n - 6] : [])}</div>`).join("")}</div>`;
const code = (lines) => `<div style="border-radius:var(--radius);background:${soft(55)};border:1px solid var(--border);padding:14px 16px;font:12.5px/1.65 ${MONO};white-space:pre;overflow:hidden">${lines}</div>`;
const K = (t) => `<span style="color:${ink("--primary", 80)};font-weight:600">${t}</span>`;
const S = (t) => `<span style="color:${ink("--accent", 70)}">${t}</span>`;
const C = (t) => `<span class="muted">${t}</span>`;
const codeVis = (compact) => compact ? code([
  C("# patchbay.yml · reviewed in PRs"),
  `${K("checks")}:`,
  `  - ${K("name")}: ${S('"Checkout API"')}`,
  `    ${K("request")}: ${S("POST /v1/checkout")}`,
  `    ${K("every")}: ${S("30s")}`,
  `    ${K("assert")}: [${S("status == 201")}]`,
  `    ${K("notify")}: ${S("payments-on-call")}`,
].join("\n")) : code([
  C("# patchbay.yml — reviewed in pull requests"),
  `${K("checks")}:`,
  `  - ${K("name")}: ${S('"Checkout API"')}`,
  `    ${K("request")}: ${S("POST https://api.acme.dev/v1/checkout")}`,
  `    ${K("every")}: ${S("30s")}${compact ? "" : `    ${C("# from 6 regions")}`}`,
  `    ${K("assert")}: [${S("status == 201")}, ${S("p95 < 400ms")}]`,
  `    ${K("notify")}: ${S("payments-on-call")}`,
].join("\n"));
const REGIONS = [["Frankfurt", 38], ["Virginia", 61], ["Oregon", 92], ["São Paulo", 148], ["Mumbai", 173], ["Sydney", 211]];
const regionVis = (n = 6) => `<div style="display:grid;gap:7px">${REGIONS.slice(0, n).map(([r, ms]) => `<div style="display:grid;grid-template-columns:78px 1fr 48px;align-items:center;gap:10px;font-size:12px"><span>${r}</span><span style="height:6px;border-radius:3px;background:${tint("--border", 60)};overflow:hidden"><span style="display:block;height:100%;width:${Math.round(ms / 2.4)}%;border-radius:3px;background:${ms > 200 ? "var(--accent)" : "var(--primary)"}"></span></span><span class="num" style="font-size:12px;text-align:right">${ms} ms</span></div>`).join("")}</div>`;
const statusVis = (rnd) => panel(`<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px"><span style="font-weight:600;font-size:13px">status.acme.dev</span><span style="display:inline-flex;align-items:center;gap:6px;font-size:11.5px;font-weight:600">${dot(false, 7)}All systems operational</span></div>${uptime(rnd, 40, 20)}<div class="muted" style="display:flex;justify-content:space-between;font-size:11px;margin-top:5px"><span>90 days ago</span><span>99.97% uptime</span><span>Today</span></div><div style="display:flex;align-items:center;gap:8px;margin-top:12px;padding-top:10px;border-top:1px solid var(--border);font-size:12px"><span class="badge">Resolved</span><span>Search latency degraded</span><span class="muted" style="margin-left:auto">Oct 21 · 12 min</span></div>`);
const ONCALL = [["Mon", "LP"], ["Tue", "LP"], ["Wed", "SA"], ["Thu", "SA"], ["Fri", "PN"], ["Sat", "MO"], ["Sun", "MO"]];
const oncallVis = () => `<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px">${ONCALL.map(([d, a], i) => `<div style="display:grid;justify-items:center;gap:6px;padding:8px 0;border-radius:var(--radius-sm);${i === 2 ? `background:${tint("--primary", 12)};outline:1.5px solid var(--primary)` : `background:${soft()}`}"><span class="muted" style="font-size:10.5px;font-weight:600">${d}</span><span class="avatar" style="width:24px;height:24px;font-size:9.5px">${a}</span></div>`).join("")}</div><div class="muted" style="font-size:11.5px;display:flex;justify-content:space-between"><span>Now: Sam Achebe</span><span>Override: Priya, Fri 09–13</span></div>`;

TPL["bento-features/web"] = (p, st, rnd) => `<section style="padding:72px 64px;display:grid;gap:40px">
<div style="display:grid;gap:14px;justify-items:center;text-align:center">${eyebrow("Platform")}<h2 style="font-size:${H(st, 44)}px;max-width:780px">One place to watch, alert on and explain every API you ship</h2><p class="muted" style="font-size:17px;max-width:640px">${esc(p.name)} pairs synthetic checks with real latency budgets, so the page that wakes you up already says what broke and where.</p></div>
<div style="display:grid;grid-template-columns:repeat(4,1fr);grid-template-rows:auto auto auto;gap:18px">
${bentoTile("Latency budgets, not just green ticks", "p50, p95 and p99 for every endpoint, with a budget line that warns before a slow deploy turns into an outage.", latencyVis(rnd, 560, 150, false), "grid-column:span 2;grid-row:span 2")}
${bentoTile("Alerts that reach a human", "Routed to whoever is on call, escalated if nobody acknowledges.", alertVis())}
${bentoTile("90-day uptime per service", "The same history your customers see.", uptimeVis(rnd, 30))}
${bentoTile("Checks as code", "Keep monitors next to the service in a YAML file and review them like any other change.", codeVis(false), "grid-column:span 2")}
${bentoTile("Six regions, every 30 seconds", "Spot the outage that only hits one continent.", regionVis(4), "")}
${bentoTile("Status pages that update themselves", "Failing monitors post an incident; recoveries close it.", statusVis(rnd), "grid-column:span 2")}
${bentoTile("On-call built in", "Rotations, overrides and swaps.", oncallVis())}
</div></section>`;
TPL["bento-features/mobile"] = (p, st, rnd) => `<section style="padding:40px 20px;display:grid;gap:22px">
<div style="display:grid;gap:10px;justify-items:start">${eyebrow("Platform")}<h2 style="font-size:${H(st, 30)}px">One place to watch, alert on and explain every API you ship</h2><p class="muted" style="font-size:15px">Synthetic checks with real latency budgets, so the page that wakes you up already says what broke.</p></div>
<div style="display:grid;gap:14px">
${bentoTile("Latency budgets, not just green ticks", "p50, p95 and p99 per endpoint, with a budget line that warns before a slow deploy becomes an outage.", latencyVis(rnd, 310, 90, true))}
${bentoTile("Alerts that reach a human", "Routed to whoever is on call, escalated if nobody acknowledges.", alertVis())}
${bentoTile("Checks as code", "Keep monitors next to the service and review them in pull requests.", codeVis(true))}
<div style="display:grid;grid-template-columns:1fr;gap:14px">${bentoTile("90-day uptime per service", "The same history your customers see.", uptimeVis(rnd, 30))}</div>
</div></section>`;

// ---- how-it-works --------------------------------------------------------------------------
const STEPS = [
  ["Install the agent", "One command on any host, or skip it and check public URLs straight from our six regions.", "download", "2 min"],
  ["Define your checks", "Point at an endpoint, assert on status, body and latency, and set how often it runs.", "edit", "5 min"],
  ["Get alerted", "The engineer on call gets paged in chat, SMS or phone with the failing request attached.", "bell", "41 s avg"],
  ["Fix faster", "Every incident links the failing region, the response body and the deploy that preceded it.", "bolt", "−38% MTTR"],
];
const stepVis = (i, compact) => {
  if (i === 0) return `<div style="border-radius:var(--radius);background:${soft(55)};border:1px solid var(--border);padding:10px 12px;font:11.5px/1.6 ${MONO};white-space:pre;overflow:hidden"><span class="muted">$</span> curl -sL get.patchbay.dev | sh\n<span style="color:${ink("--primary", 80)}">✓</span> <span class="muted">agent 4.2.0 connected · eu-west</span></div>`;
  if (i === 1) return `<div style="border-radius:var(--radius);background:${soft()};border:1px solid var(--border);padding:10px 12px;display:grid;gap:7px;font-size:12px">${[["Request", "GET /v1/orders"], ["Expect", "status = 200"], ["Budget", "p95 < 300 ms"]].map(([l, v]) => `<div style="display:flex;justify-content:space-between;gap:8px"><span class="muted">${l}</span><span style="font-family:${MONO};font-size:11.5px">${v}</span></div>`).join("")}</div>`;
  if (i === 2) return `<div style="border-radius:var(--radius);background:${soft()};border:1px solid var(--border);padding:10px 12px;display:flex;gap:9px;align-items:flex-start;font-size:12px;line-height:1.4"><span style="width:24px;height:24px;border-radius:var(--radius-sm);display:grid;place-items:center;flex:none;background:${tint("--accent", 18)};color:${ink("--accent")}">${ic("bell", 13)}</span><div><div style="font-weight:600">/v1/orders returned 503</div><div class="muted">3 of 6 regions · paged Lin Park</div></div></div>`;
  return `<div style="border-radius:var(--radius);background:${soft()};border:1px solid var(--border);padding:10px 12px;display:grid;gap:6px;font-size:12px">${[["14:02", "Deploy api@a41f9c", 1], ["14:03", "503s from 3 regions", 1], ["14:11", "Rolled back · resolved", 0]].map(([t, l, w]) => `<div style="display:flex;align-items:center;gap:8px"><span class="num muted" style="font-size:11px;width:34px">${t}</span>${dot(w && t !== "14:02", 6)}<span>${l}</span></div>`).join("")}</div>`;
};
TPL["how-it-works/web"] = (p, st) => `<section style="padding:72px 64px;display:grid;gap:48px">
<div style="display:flex;justify-content:space-between;align-items:end;gap:40px"><div style="display:grid;gap:12px;justify-items:start;max-width:640px">${eyebrow("How it works")}<h2 style="font-size:${H(st, 42)}px">From first check to first fix in under ten minutes</h2></div><p class="muted" style="font-size:16px;max-width:420px">No dashboards to build. Most teams have ${esc(p.name)} paging the right person before their coffee goes cold.</p></div>
<div style="position:relative;display:grid;grid-template-columns:repeat(4,1fr);gap:28px">
<div style="position:absolute;left:22px;right:calc(25% - 7px);top:22px;border-top:2px dashed color-mix(in oklab,var(--primary) 45%,var(--border))"></div>
${STEPS.map(([t, d, icn, m], i) => `<div style="position:relative;display:grid;gap:16px;align-content:start">
<div style="display:flex;align-items:center;gap:12px"><span class="num" style="width:44px;height:44px;border-radius:50%;display:grid;place-items:center;flex:none;font-size:17px;background:${i === 3 ? "var(--primary)" : "var(--surface)"};color:${i === 3 ? "var(--on-primary)" : "var(--text)"};border:2px solid var(--primary);box-shadow:0 0 0 6px var(--bg)">${i + 1}</span>${i < 3 ? `<span style="margin-left:auto;margin-right:-8px;width:26px;height:26px;border-radius:50%;display:grid;place-items:center;background:var(--bg);color:var(--primary)">${ic("arrow", 16)}</span>` : ""}</div>
<div class="card" style="padding:20px;display:grid;gap:12px;align-content:start;height:100%"><div style="display:flex;align-items:center;gap:10px">${iconTile(icn, 32)}<span class="badge" style="margin-left:auto">${m}</span></div><div><div style="font-weight:600;font-size:17px">${t}</div><div class="muted" style="font-size:14px;margin-top:4px;line-height:1.45">${d}</div></div>${stepVis(i, false)}</div></div>`).join("")}
</div>
<div style="display:flex;align-items:center;justify-content:center;gap:14px"><button class="btn primary" style="height:44px;padding:0 20px;font-size:14px">Start monitoring free ${ic("arrow", 16)}</button><span class="muted" style="font-size:13.5px">or read the 5-minute quickstart</span></div></section>`;
TPL["how-it-works/mobile"] = (p, st) => `<section style="padding:40px 20px;display:grid;gap:24px">
<div style="display:grid;gap:10px;justify-items:start">${eyebrow("How it works")}<h2 style="font-size:${H(st, 30)}px">From first check to first fix in under ten minutes</h2><p class="muted" style="font-size:15px">Most teams have ${esc(p.name)} paging the right person before their coffee goes cold.</p></div>
<div style="position:relative;display:grid;gap:18px">
<div style="position:absolute;left:17px;top:18px;bottom:40px;border-left:2px dashed color-mix(in oklab,var(--primary) 45%,var(--border))"></div>
${STEPS.map(([t, d, , m], i) => `<div style="position:relative;display:grid;grid-template-columns:36px 1fr;gap:14px;align-items:start"><span class="num" style="width:36px;height:36px;border-radius:50%;display:grid;place-items:center;font-size:15px;background:${i === 3 ? "var(--primary)" : "var(--surface)"};color:${i === 3 ? "var(--on-primary)" : "var(--text)"};border:2px solid var(--primary);box-shadow:0 0 0 5px var(--bg)">${i + 1}</span>
<div class="card" style="padding:16px;display:grid;gap:10px;min-width:0"><div style="display:flex;align-items:center;gap:8px"><span style="font-weight:600;font-size:16px">${t}</span><span class="badge" style="margin-left:auto">${m}</span></div><div class="muted" style="font-size:13.5px;line-height:1.45">${d}</div>${stepVis(i, true)}</div></div>`).join("")}
</div>
<button class="btn primary block" style="height:46px">Start monitoring free ${ic("arrow", 16)}</button></section>`;

// ---- integrations-grid ---------------------------------------------------------------------
// Generic geometric marks (no real brand logos), drawn with tokens.
const MARKS = [
  `<circle cx="16" cy="16" r="11" style="fill:var(--primary)"/><circle cx="16" cy="16" r="4.5" style="fill:var(--surface)"/>`,
  `<rect x="5" y="7" width="22" height="15" rx="5" style="fill:var(--primary)"/><path d="M10 22l-2 6 7-6z" style="fill:var(--primary)"/><circle cx="11" cy="14.5" r="1.8" style="fill:var(--surface)"/><circle cx="16" cy="14.5" r="1.8" style="fill:var(--surface)"/><circle cx="21" cy="14.5" r="1.8" style="fill:var(--surface)"/>`,
  `<rect x="5" y="5" width="9" height="9" rx="2" style="fill:var(--primary)"/><rect x="18" y="5" width="9" height="9" rx="2" style="fill:var(--accent)"/><rect x="5" y="18" width="9" height="9" rx="2" style="fill:var(--accent)"/><rect x="18" y="18" width="9" height="9" rx="2" style="fill:var(--text)"/>`,
  `<path d="M4 20h5l3-9 4 14 4-11 2 6h6" style="fill:none;stroke:var(--primary);stroke-width:2.6;stroke-linecap:round;stroke-linejoin:round"/>`,
  `<circle cx="9" cy="22" r="4" style="fill:var(--accent)"/><circle cx="23" cy="22" r="4" style="fill:var(--primary)"/><circle cx="16" cy="9" r="4" style="fill:var(--text)"/><path d="M16 13l-5 6M16 13l5 6M13 22h6" style="stroke:var(--muted);stroke-width:1.6"/>`,
  `<path d="M6 6l9 5v10l-9-5z" style="fill:var(--primary)"/><path d="M17 11l9-5v10l-9 5z" style="fill:var(--accent)"/><path d="M17 23l9-5v8z" style="fill:var(--text)"/>`,
  `<rect x="4" y="8" width="24" height="16" rx="3" style="fill:none;stroke:var(--primary);stroke-width:2.4"/><path d="M5 10l11 8 11-8" style="fill:none;stroke:var(--primary);stroke-width:2.4"/>`,
  `<rect x="10" y="4" width="12" height="24" rx="3" style="fill:var(--text)"/><rect x="12.5" y="7" width="7" height="14" rx="1" style="fill:var(--accent)"/>`,
  `<path d="M6 8h20M6 14h14M6 20h20M6 26h10" style="stroke:var(--primary);stroke-width:2.8;stroke-linecap:round"/>`,
  `<rect x="5" y="17" width="5" height="10" rx="1" style="fill:var(--primary)"/><rect x="13.5" y="11" width="5" height="16" rx="1" style="fill:var(--accent)"/><rect x="22" y="5" width="5" height="22" rx="1" style="fill:var(--primary)"/>`,
  `<path d="M16 4l11 6v12l-11 6-11-6V10z" style="fill:var(--primary)"/><path d="M11 16l4 4 7-8" style="fill:none;stroke:var(--surface);stroke-width:2.6;stroke-linecap:round;stroke-linejoin:round"/>`,
  `<path d="M16 5a11 11 0 1 0 11 11" style="fill:none;stroke:var(--primary);stroke-width:3;stroke-linecap:round"/><path d="M22 5h5v5" style="fill:none;stroke:var(--accent);stroke-width:3;stroke-linecap:round;stroke-linejoin:round"/>`,
];
const mark = (i, s = 44) => `<span style="width:${s}px;height:${s}px;border-radius:var(--radius);display:grid;place-items:center;flex:none;background:${soft(60)};border:1px solid var(--border)"><svg viewBox="0 0 32 32" width="${Math.round(s * 0.6)}" height="${Math.round(s * 0.6)}">${MARKS[i % MARKS.length]}</svg></span>`;
const INTEGRATIONS = [
  ["Incident paging", "Alerting", "Page, escalate and auto-resolve incidents from failing checks.", "Popular"],
  ["Team chat", "Chat", "Alerts in channels with Acknowledge and Snooze buttons.", "Popular"],
  ["Issue tracker", "Issue tracking", "Open a ticket with the failing request and region attached.", ""],
  ["Status page", "Status & comms", "Post and close incidents on your public page automatically.", "Built in"],
  ["Webhooks", "Developer", "Signed JSON payloads for every state change, retried for 24 h.", ""],
  ["Terraform-style config", "Infrastructure", "Declare monitors, alert rules and on-call in version control.", "New"],
  ["Email digests", "Status & comms", "Weekly uptime and latency reports for the whole team.", ""],
  ["SMS & voice", "Alerting", "Phone calls that repeat until someone presses 1.", ""],
  ["Log drains", "Infrastructure", "Ship check results to your log store as structured lines.", ""],
  ["Metrics export", "Infrastructure", "Scrape uptime and p95 as OpenMetrics from one endpoint.", ""],
  ["SSO & SCIM", "Developer", "SAML sign-in and automatic user provisioning.", "Scale"],
  ["Deploy markers", "Developer", "Annotate charts with each release from your CI pipeline.", ""],
];
const CATS = [["All", 32], ["Alerting", 6], ["Chat", 4], ["Issue tracking", 5], ["Infrastructure", 9], ["Status & comms", 3], ["Developer", 5]];
const intTile = ([n, c, d, b], i, compact) => `<div class="card" style="padding:${compact ? 14 : 20}px;display:grid;gap:${compact ? 10 : 12}px;align-content:start"><div style="display:flex;align-items:center;justify-content:space-between;gap:8px">${mark(i, compact ? 38 : 44)}${b ? `<span class="badge">${b}</span>` : ""}</div><div><div style="font-weight:600;font-size:${compact ? 14 : 15.5}px;line-height:1.3">${n}</div><div class="muted" style="font-size:${compact ? 11.5 : 12}px;margin-top:2px">${c}</div></div>${compact ? "" : `<div class="muted" style="font-size:13.5px;line-height:1.45">${d}</div>`}</div>`;
TPL["integrations-grid/web"] = (p, st) => `<section style="padding:72px 64px;display:grid;gap:32px">
<div style="display:flex;justify-content:space-between;align-items:end;gap:40px"><div style="display:grid;gap:12px;justify-items:start;max-width:640px">${eyebrow("Integrations")}<h2 style="font-size:${H(st, 42)}px">Plug ${esc(p.name)} into the tools your team already uses</h2></div><p class="muted" style="font-size:16px;max-width:420px">32 integrations, all included on every plan. Connect one in a couple of clicks, or build your own on webhooks and the REST API.</p></div>
<div style="display:flex;align-items:center;gap:8px">${CATS.map(([c, n], i) => chip(c, i === 0, n)).join("")}<div class="input" style="margin-left:auto;width:260px;height:36px;gap:8px">${ic("search", 16)}Search integrations</div></div>
<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px">${INTEGRATIONS.map((x, i) => intTile(x, i, false)).join("")}</div>
<div style="display:flex;align-items:center;gap:18px;padding:20px 24px;border:1.5px dashed var(--border);border-radius:var(--radius-lg)">${iconTile("plus", 40)}<div><div style="font-weight:600;font-size:16px">Missing something?</div><div class="muted" style="font-size:14px">Tell us what you use. Most requests ship within a quarter, and we’ll email you when yours does.</div></div><span style="margin-left:auto;display:flex;gap:10px"><button class="btn">${ic("doc", 15)}Webhook docs</button><button class="btn primary">Request an integration</button></span></div></section>`;
TPL["integrations-grid/mobile"] = (p, st) => `<section style="padding:40px 20px;display:grid;gap:20px">
<div style="display:grid;gap:10px;justify-items:start">${eyebrow("Integrations")}<h2 style="font-size:${H(st, 30)}px">Plug ${esc(p.name)} into the tools you already use</h2><p class="muted" style="font-size:15px">32 integrations, included on every plan.</p></div>
<div class="input" style="gap:8px">${ic("search", 16)}Search integrations</div>
<div style="display:flex;flex-wrap:wrap;gap:6px">${CATS.slice(0, 5).map(([c, n], i) => chip(c, i === 0, n)).join("")}</div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">${INTEGRATIONS.slice(0, 8).map((x, i) => intTile(x, i, true)).join("")}</div>
<div style="display:grid;gap:12px;padding:18px;border:1.5px dashed var(--border);border-radius:var(--radius-lg)"><div style="display:flex;gap:12px;align-items:center">${iconTile("plus", 36)}<div><div style="font-weight:600">Missing something?</div><div class="muted" style="font-size:13px">Most requests ship within a quarter.</div></div></div><button class="btn primary block">Request an integration</button></div></section>`;

// ---- changelog -----------------------------------------------------------------------------
const TAGS = { New: "--primary", Improved: "--accent", Fixed: "--muted" };
const tag = (t) => `<span style="display:inline-flex;align-items:center;height:22px;padding:0 9px;border-radius:999px;font:600 11px var(--font-b);flex:none;background:${tint(TAGS[t], t === "Fixed" ? 14 : 16)};color:${ink(TAGS[t], t === "Fixed" ? 100 : 72)};border:1px solid ${tint(TAGS[t], 30)}">${t}</span>`;
const RELEASES = [
  ["4.2.0", "Oct 28, 2026", "Multi-step API checks", "Chain up to eight requests into one check, pass values between them, and catch broken checkout and sign-up flows end to end.", [
    ["New", "Multi-step checks on Team and Scale plans, with per-step timings and assertions."],
    ["New", "Extract values from a response with JSONPath and reuse them as {{variables}}."],
    ["Improved", "Incident timelines now show which step failed and the exact request sent."],
  ]],
  ["4.1.3", "Oct 14, 2026", "Faster status pages", "", [
    ["Improved", "Public status pages load 3× faster and cache for 30 s at the edge."],
    ["Fixed", "Maintenance windows no longer trigger alerts when they cross midnight UTC."],
  ]],
  ["4.1.0", "Sep 30, 2026", "On-call overrides", "", [
    ["New", "Swap a shift from the alert itself; the rotation updates for everyone."],
    ["Fixed", "SMS alerts to +65 and +61 numbers were delayed by up to 90 seconds."],
  ]],
];
const shot = (compact) => `<div class="card" style="overflow:hidden;box-shadow:var(--shadow);background:${soft(40)}"><div style="display:flex;align-items:center;gap:6px;padding:9px 12px;border-bottom:1px solid var(--border);background:var(--surface)">${[0, 1, 2].map(() => `<span style="width:8px;height:8px;border-radius:50%;background:var(--border)"></span>`).join("")}<span class="muted" style="font-size:11.5px;margin-left:8px">Checkout flow · multi-step check</span><span class="badge" style="margin-left:auto">Passing</span></div>
<div style="padding:${compact ? 12 : 16}px;display:grid;gap:8px">${[["POST", "/v1/cart", "112 ms", "cart_id"], ["POST", "/v1/checkout", "238 ms", "order_id"], ["GET", "/v1/orders/{{order_id}}", "64 ms", ""]].slice(0, compact ? 2 : 3).map(([m, u, ms, v], i) => `<div style="display:grid;grid-template-columns:22px ${compact ? "1fr 56px" : "44px 1fr 110px 64px"};align-items:center;gap:10px;padding:9px 11px;border-radius:var(--radius);background:var(--surface);border:1px solid var(--border);font-size:12px"><span class="num" style="width:22px;height:22px;border-radius:50%;display:grid;place-items:center;font-size:11px;background:${tint("--primary", 16)};color:${ink("--primary", 80)}">${i + 1}</span>${compact ? `<span style="font-family:${MONO};font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis"><b>${m}</b> ${u}</span>` : `<span class="muted" style="font:600 11px ${MONO}">${m}</span><span style="font-family:${MONO};font-size:11.5px">${u}</span><span class="muted" style="font-size:11px">${v ? `→ {{${v}}}` : "assert 200"}</span>`}<span class="num" style="font-size:12px;text-align:right">${ms}</span></div>`).join("")}</div></div>`;
const relHead = (v, d, t, big, st) => `<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap"><span class="num" style="font-size:13px;padding:2px 8px;border-radius:var(--radius-sm);border:1px solid var(--border);background:var(--surface)">v${v}</span><span class="muted" style="font-size:13px">${d}</span></div><h3 style="font-size:${H(st, big ? 28 : 20)}px;margin-top:8px">${t}</h3>`;
const entries = (items) => `<div style="display:grid;gap:9px">${items.map(([t, x]) => `<div style="display:flex;gap:10px;align-items:baseline;font-size:14px;line-height:1.45">${tag(t)}<span>${x}</span></div>`).join("")}</div>`;
TPL["changelog/web"] = (p, st) => `<section style="padding:72px 64px;display:grid;grid-template-columns:340px 1fr;gap:72px">
<div style="display:grid;gap:18px;align-content:start;justify-items:stretch"><div>${eyebrow("Changelog")}</div><h2 style="font-size:${H(st, 42)}px">What’s new in ${esc(p.name)}</h2><p class="muted" style="font-size:15.5px">New features, improvements and fixes, shipped every two weeks. Follow along so you never miss a check type.</p>
<div class="card" style="padding:18px;display:grid;gap:10px;margin-top:6px"><div style="font-weight:600">Get release notes by email</div><div class="input">you@company.com</div><button class="btn primary block">Subscribe to updates</button><div class="muted" style="font-size:12px;display:flex;gap:14px"><span style="display:flex;gap:5px;align-items:center">${ic("share", 13)}RSS feed</span><span>One email per release</span></div></div>
<div style="display:grid;gap:6px;margin-top:4px"><div class="muted" style="font:600 11px var(--font-b);text-transform:uppercase;letter-spacing:.08em">Filter</div><div style="display:flex;gap:6px;flex-wrap:wrap">${chip("All", true)}${chip("New")}${chip("Improved")}${chip("Fixed")}</div></div>
<div style="display:grid;gap:10px;margin-top:6px;padding-top:18px;border-top:1px solid var(--border)"><div class="muted" style="font:600 11px var(--font-b);text-transform:uppercase;letter-spacing:.08em">Coming next</div>${[["clock", "Scheduled maintenance windows from the API", "In progress"], ["globe", "Two new check regions: Tokyo and Johannesburg", "Nov"], ["lock", "Bring-your-own-key encryption on Scale", "Q1 2027"]].map(([i, t, w]) => `<div style="display:flex;gap:10px;align-items:flex-start;font-size:13.5px;line-height:1.4"><span class="muted" style="display:flex;margin-top:2px">${ic(i, 15)}</span><span style="flex:1">${t}</span><span class="muted" style="font-size:12px;white-space:nowrap">${w}</span></div>`).join("")}</div></div>
<div style="position:relative;display:grid;gap:40px;padding-left:36px">
<div style="position:absolute;left:6px;top:8px;bottom:8px;border-left:2px solid var(--border)"></div>
${RELEASES.map(([v, d, t, intro, items], i) => `<div style="position:relative;display:grid;gap:14px">
<span style="position:absolute;left:-36px;top:5px;width:14px;height:14px;border-radius:50%;background:${i ? "var(--surface)" : "var(--primary)"};border:2px solid ${i ? "var(--border)" : "var(--primary)"};box-shadow:0 0 0 4px var(--bg)"></span>
<div>${relHead(v, d, t, i === 0, st)}${intro ? `<p class="muted" style="font-size:15px;margin-top:6px;max-width:720px">${intro}</p>` : ""}</div>
${i === 0 ? `<div style="max-width:820px">${shot(false)}</div>` : ""}${entries(items)}</div>`).join("")}
<div style="display:flex;align-items:center;gap:8px;font-size:14px">${arrowLink("View all 2026 releases")}</div></div></section>`;
TPL["changelog/mobile"] = (p, st) => `<section style="padding:40px 20px;display:grid;gap:22px">
<div style="display:grid;gap:10px;justify-items:start">${eyebrow("Changelog")}<h2 style="font-size:${H(st, 30)}px">What’s new in ${esc(p.name)}</h2><p class="muted" style="font-size:15px">Features, improvements and fixes, shipped every two weeks.</p></div>
<div style="display:flex;gap:6px;flex-wrap:wrap">${chip("All", true)}${chip("New")}${chip("Improved")}${chip("Fixed")}</div>
<div style="position:relative;display:grid;gap:28px;padding-left:26px">
<div style="position:absolute;left:5px;top:8px;bottom:8px;border-left:2px solid var(--border)"></div>
${RELEASES.slice(0, 2).map(([v, d, t, intro, items], i) => `<div style="position:relative;display:grid;gap:12px">
<span style="position:absolute;left:-26px;top:5px;width:12px;height:12px;border-radius:50%;background:${i ? "var(--surface)" : "var(--primary)"};border:2px solid ${i ? "var(--border)" : "var(--primary)"};box-shadow:0 0 0 4px var(--bg)"></span>
<div>${relHead(v, d, t, i === 0, st)}${intro ? `<p class="muted" style="font-size:14px;margin-top:6px">${intro}</p>` : ""}</div>
${i === 0 ? shot(true) : ""}<div style="display:grid;gap:9px">${items.map(([g, x]) => `<div style="display:grid;gap:4px;font-size:13.5px;line-height:1.45;justify-items:start">${tag(g)}<span>${x}</span></div>`).join("")}</div></div>`).join("")}
</div>
<div class="card" style="padding:16px;display:grid;gap:10px"><div style="font-weight:600">Get release notes by email</div><div class="input">you@company.com</div><button class="btn primary block">Subscribe to updates</button></div></section>`;

// ---- careers -------------------------------------------------------------------------------
const PERKS = [["globe", "Remote-first, 11 countries"], ["calendar", "30 days off + local holidays"], ["heart", "Health cover for you & family"], ["bolt", "4-day weeks in August"], ["upload", "$1,500 home-office budget"], ["star", "Meet-ups twice a year"]];
const JOBS = [
  ["Senior Backend Engineer, Check Runners", "Engineering", "Remote · Europe", "Full-time"],
  ["Site Reliability Engineer", "Engineering", "Remote · Americas", "Full-time"],
  ["Staff Frontend Engineer, Dashboards", "Engineering", "Remote · anywhere", "Full-time"],
  ["Product Designer, Alerting", "Design", "Remote · Europe", "Full-time"],
  ["Developer Advocate", "Marketing", "Remote · North America", "Full-time"],
  ["Support Engineer, APAC", "Support", "Singapore or remote", "Full-time"],
  ["Account Executive, Mid-market", "Sales", "London · hybrid", "Full-time"],
  ["Technical Writer", "Engineering", "Remote · anywhere", "Contract · 6 mo"],
];
const DEPTS = [["All teams", 8], ["Engineering", 4], ["Design", 1], ["Marketing", 1], ["Support", 1], ["Sales", 1]];
TPL["careers/web"] = (p, st) => `<section style="padding:72px 64px;display:grid;gap:36px">
<div style="display:grid;grid-template-columns:1fr 1fr;gap:72px;align-items:end"><div style="display:grid;gap:14px;justify-items:start">${eyebrow("Careers · 8 open roles")}<h2 style="font-size:${H(st, 44)}px">Help small teams sleep through the night</h2></div>
<div style="display:grid;gap:18px"><p class="muted" style="font-size:16px">We’re 34 people across 11 countries building the monitoring we always wanted on call. We write things down, ship every two weeks and keep meetings rare, so you can do the best work of your career from wherever you do it best.</p>
<div style="display:flex;gap:28px">${[["34", "people"], ["11", "countries"], ["2 wks", "release cycle"]].map(([v, l]) => `<div><div class="num" style="font-size:26px">${v}</div><div class="muted" style="font-size:13px">${l}</div></div>`).join("")}</div></div></div>
<div style="display:flex;flex-wrap:wrap;gap:8px">${PERKS.slice(0, 5).map(([i, t]) => `<span style="display:inline-flex;align-items:center;gap:8px;height:36px;padding:0 14px;border-radius:999px;border:1px solid var(--border);background:${soft(50)};font-size:13.5px;font-weight:500"><span style="color:${ink("--primary", 85)};display:flex">${ic(i, 15)}</span>${t}</span>`).join("")}</div>
<div class="card" style="overflow:hidden">
<div style="display:flex;align-items:center;gap:8px;padding:14px 20px;border-bottom:1px solid var(--border)">${DEPTS.map(([d, n], i) => chip(d, i === 0, n)).join("")}<span class="muted" style="margin-left:auto;font-size:13px;display:flex;align-items:center;gap:6px">${ic("pin", 14)}Any location ${ic("chevdown", 14)}</span></div>
<div style="display:grid;grid-template-columns:1.6fr 1fr 1fr 0.8fr 40px;gap:16px;padding:10px 20px;font:600 11px var(--font-b);text-transform:uppercase;letter-spacing:.08em;color:var(--muted);border-bottom:1px solid var(--border)"><span>Role</span><span>Team</span><span>Location</span><span>Type</span><span></span></div>
${JOBS.map(([t, d, l, ty], i) => `<div style="display:grid;grid-template-columns:1.6fr 1fr 1fr 0.8fr 40px;gap:16px;align-items:center;padding:15px 20px;font-size:14px;${i ? "border-top:1px solid var(--border);" : ""}${i === 1 ? `background:${tint("--primary", 5)}` : ""}"><span style="font-weight:600;font-size:15px">${t}</span><span class="muted">${d}</span><span style="display:flex;align-items:center;gap:6px"><span class="muted" style="display:flex">${ic("pin", 14)}</span>${l}</span><span><span class="badge">${ty}</span></span><span style="width:32px;height:32px;border-radius:50%;display:grid;place-items:center;justify-self:end;border:1px solid ${i === 1 ? "var(--primary)" : "var(--border)"};background:${i === 1 ? "var(--primary)" : "var(--surface)"};color:${i === 1 ? "var(--on-primary)" : "var(--text)"}">${ic("arrow", 15)}</span></div>`).join("")}
</div>
<div style="display:flex;align-items:center;justify-content:space-between;font-size:14px"><span class="muted">Don’t see a fit? We read every general application, usually within a week.</span>${arrowLink("Send a general application")}</div></section>`;
TPL["careers/mobile"] = (p, st) => `<section style="padding:40px 20px;display:grid;gap:22px">
<div style="display:grid;gap:10px;justify-items:start">${eyebrow("Careers · 8 open roles")}<h2 style="font-size:${H(st, 30)}px">Help small teams sleep through the night</h2><p class="muted" style="font-size:15px">We’re 34 people in 11 countries building the monitoring we always wanted on call. We write things down and keep meetings rare.</p></div>
<div style="display:flex;flex-wrap:wrap;gap:6px">${PERKS.slice(0, 4).map(([i, t]) => `<span style="display:inline-flex;align-items:center;gap:6px;height:32px;padding:0 12px;border-radius:999px;border:1px solid var(--border);background:${soft(50)};font-size:12.5px;font-weight:500"><span style="color:${ink("--primary", 85)};display:flex">${ic(i, 14)}</span>${t}</span>`).join("")}</div>
<div style="display:flex;flex-wrap:wrap;gap:6px">${DEPTS.slice(0, 4).map(([d, n], i) => chip(d, i === 0, n)).join("")}</div>
<div class="card" style="overflow:hidden">${JOBS.slice(0, 5).map(([t, d, l, ty], i) => `<div style="display:flex;align-items:center;gap:12px;padding:14px 16px;${i ? "border-top:1px solid var(--border)" : ""}"><div style="min-width:0;flex:1"><div style="font-weight:600;font-size:14.5px;line-height:1.35">${t}</div><div class="muted" style="font-size:12.5px;margin-top:3px">${d} · ${l} · ${ty}</div></div><span style="width:30px;height:30px;border-radius:50%;display:grid;place-items:center;flex:none;border:1px solid var(--border);background:var(--surface)">${ic("arrow", 14)}</span></div>`).join("")}</div>
<div style="display:grid;gap:8px;justify-items:center;text-align:center"><button class="btn block">See all 8 roles</button><span class="muted" style="font-size:13px">or send a general application</span></div></section>`;

// ---- security-trust ------------------------------------------------------------------------
const CERTS = [["SOC 2", "Type II"], ["ISO", "27001"], ["GDPR", "EU + UK"], ["CCPA", "Calif."]];
const seal = ([a, b], s = 92) => `<div style="display:grid;justify-items:center;gap:8px"><div style="width:${s}px;height:${s}px;border-radius:50%;display:grid;place-items:center;align-content:center;gap:1px;border:2px solid var(--text);box-shadow:inset 0 0 0 4px var(--surface),inset 0 0 0 5.5px color-mix(in oklab,var(--text) 35%,transparent);background:var(--surface);text-align:center"><span style="color:${ink("--primary", 85)};display:flex;justify-content:center">${ic("shield", Math.round(s * 0.18))}</span><span class="num" style="font-size:${Math.round(s * 0.18)}px;letter-spacing:-0.01em">${a}</span><span style="font:600 ${Math.max(9, Math.round(s * 0.105))}px var(--font-b);text-transform:uppercase;letter-spacing:.08em;color:var(--muted)">${b}</span></div></div>`;
const PRACTICES = [
  ["lock", "Encryption everywhere", "TLS 1.3 in transit and AES-256 at rest, with keys rotated every 90 days."],
  ["key", "SSO & SCIM", "SAML 2.0 with any identity provider, enforced 2FA and automatic de-provisioning."],
  ["globe", "Data residency", "Keep check results and logs in the EU or US. Your choice, per workspace."],
  ["shield", "99.99% uptime SLA", "Service credits in writing on Scale, monitored independently from three clouds."],
];
const statusCard = (rnd, compact) => `<div class="card" style="padding:${compact ? 16 : 20}px;display:grid;gap:14px"><div style="display:flex;align-items:center;justify-content:space-between"><span style="font-weight:600">System status</span><span style="display:inline-flex;align-items:center;gap:7px;font-size:12.5px;font-weight:600">${dot(false, 7)}All systems operational</span></div>
${[["Check runners", "100%"], ["Alert delivery", "99.998%"], ["Dashboard & API", "99.99%"]].map(([l, v], i) => `<div><div style="display:flex;justify-content:space-between;font-size:12.5px;margin-bottom:5px"><span>${l}</span><span class="num" style="font-size:12.5px">${v}</span></div>${uptime(rnd, compact ? 36 : 45, 14, i === 1 ? [30] : [])}</div>`).join("")}
<div class="muted" style="display:flex;justify-content:space-between;font-size:11.5px"><span>90 days</span><span>Last incident: Sep 12 · 6 min</span></div></div>`;
const DOCS = [["doc", "SOC 2 Type II report", "Under NDA"], ["doc", "2026 penetration test summary", "PDF · 4 pages"], ["doc", "Data processing agreement", "Self-serve"], ["list", "Sub-processors", "12 vendors"]];
TPL["security-trust/web"] = (p, st, rnd) => `<section style="padding:72px 64px;display:grid;gap:40px">
<div style="display:grid;grid-template-columns:1fr auto;gap:56px;align-items:center"><div style="display:grid;gap:14px;justify-items:start;max-width:620px">${eyebrow("Security & trust")}<h2 style="font-size:${H(st, 42)}px">Your API keys and payloads are safe with us</h2><p class="muted" style="font-size:16px">${esc(p.name)} sees the inside of your production traffic, so we treat security as the product. Independently audited every year, with reports you can read.</p></div>
<div style="display:flex;gap:20px">${CERTS.map((c) => seal(c, 104)).join("")}</div></div>
<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px">${PRACTICES.map(([i, t, d]) => `<div class="card" style="padding:22px;display:grid;gap:12px;align-content:start">${iconTile(i, 38)}<div style="font-weight:600;font-size:16px">${t}</div><div class="muted" style="font-size:14px;line-height:1.45">${d}</div></div>`).join("")}</div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">${statusCard(rnd, false)}
<div class="card feat" style="padding:24px;display:grid;gap:16px;align-content:start;background:var(--text);color:var(--bg);border-color:var(--text)"><div style="display:flex;align-items:center;justify-content:space-between;gap:12px"><div><div style="font-weight:600;font-size:17px">Trust center</div><div style="font-size:13.5px;opacity:.72;margin-top:2px">Audit reports, policies and answers to your security questionnaire.</div></div><button class="btn primary">Visit trust center ${ic("arrow", 14)}</button></div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">${DOCS.map(([i, t, m]) => `<div style="display:flex;gap:10px;align-items:center;padding:11px 12px;border-radius:var(--radius);border:1px solid color-mix(in oklab,var(--bg) 22%,transparent);background:color-mix(in oklab,var(--bg) 7%,transparent)"><span style="display:flex;opacity:.8">${ic(i, 16)}</span><div style="min-width:0"><div style="font-weight:600;font-size:13px">${t}</div><div style="font-size:11.5px;opacity:.65">${m}</div></div></div>`).join("")}</div></div></div></section>`;
TPL["security-trust/mobile"] = (p, st, rnd) => `<section style="padding:40px 20px;display:grid;gap:22px">
<div style="display:grid;gap:10px;justify-items:start">${eyebrow("Security & trust")}<h2 style="font-size:${H(st, 30)}px">Your API keys and payloads are safe with us</h2><p class="muted" style="font-size:15px">Independently audited every year, with reports you can read.</p></div>
<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;justify-items:center">${CERTS.map((c) => seal(c, 78)).join("")}</div>
<div class="card">${PRACTICES.map(([i, t, d], k) => `<div style="display:flex;gap:12px;padding:14px 16px;${k ? "border-top:1px solid var(--border)" : ""}">${iconTile(i, 34)}<div><div style="font-weight:600;font-size:15px">${t}</div><div class="muted" style="font-size:13px;margin-top:2px;line-height:1.45">${d}</div></div></div>`).join("")}</div>
${statusCard(rnd, true)}
<div class="card feat" style="padding:18px;display:grid;gap:12px;background:var(--text);color:var(--bg);border-color:var(--text)"><div><div style="font-weight:600;font-size:16px">Trust center</div><div style="font-size:13px;opacity:.72;margin-top:2px">SOC 2 report, pen test summary, DPA and sub-processors.</div></div><button class="btn primary block">Visit trust center ${ic("arrow", 14)}</button></div></section>`;

// Balance headline wrapping; centre so slack between styles' font metrics is shared top/bottom.
const finish = (fn) => (p, st, rnd) => `<div style="min-height:100%;display:grid;align-content:center">${fn(p, st, rnd).replace(/<(h1|h2|h3) style="/g, '<$1 style="text-wrap:balance;')}</div>`;
const def = (key, name, shows, elements, size) => ({ family: "marketing", type: "section", name, shows, elements,
  web: finish(TPL[key + "/web"]), mobile: finish(TPL[key + "/mobile"]), size });
module.exports = {
  "bento-features": def("bento-features", "Bento feature grid", "a centred heading over a bento grid of mixed-size feature tiles with a latency chart, an alert card, uptime bars, a config snippet, region latencies, a status page and an on-call rota",
    ["bento-grid", "feature-grid", "card", "chart", "code-snippet", "uptime-bars", "section-heading", "marketing", "landing-page"], { web: [1440, 1280], mobile: [390, 1552] }),
  "how-it-works": def("how-it-works", "How it works steps", "four numbered steps joined by a dashed line, each with an icon, time badge, description and a small product visual, plus a start CTA",
    ["steps", "how-it-works", "numbered-list", "timeline", "card", "code-snippet", "button", "marketing", "landing-page"], { web: [1440, 790], mobile: [390, 1298] }),
  "integrations-grid": def("integrations-grid", "Integrations directory", "category filter chips with counts, a search field, a grid of twelve integration tiles with generic marks and badges, and a request-an-integration card",
    ["integrations", "card-grid", "filter-chips", "search-bar", "badge", "icon", "button", "marketing"], { web: [1440, 1130], mobile: [390, 1120] }),
  "changelog": def("changelog", "Changelog timeline", "a release-notes timeline with versions, dates and New/Improved/Fixed tags, a screenshot card on the latest release, filter chips and an email subscribe box",
    ["changelog", "timeline", "release-notes", "tag", "screenshot-card", "filter-chips", "newsletter-signup", "marketing"], { web: [1440, 994], mobile: [390, 1350] }),
  "careers": def("careers", "Careers open roles", "a culture blurb with team stats, perk chips, department filter chips and a list of eight open roles with team, location, type and apply arrows",
    ["careers", "job-list", "filter-chips", "chips", "stats", "table", "link", "marketing"], { web: [1440, 1084], mobile: [390, 1078] }),
  "security-trust": def("security-trust", "Security and trust", "a heading with four compliance seals, four security-practice cards, a system-status card with uptime bars and a dark trust-center card listing audit documents",
    ["security", "compliance-badges", "trust-center", "card", "uptime-bars", "status-indicator", "document-list", "marketing"], { web: [1440, 898], mobile: [390, 1260] }),
};
