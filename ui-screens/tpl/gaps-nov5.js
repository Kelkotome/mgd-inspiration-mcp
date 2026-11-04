/* 5-Nov-2026 round: three single patterns from real MCP queries that had only weak matches.
   scored-comparison (website section, Patchbay): "comparison table of products with scores and source footnotes" — placeholder plans,
     no prices, weighted criteria scores with footnoted sources.
   savings-goal (Mintwell bank): "personal finance savings goal progress dashboard with projection chart".
   onboarding-carousel (Dewline skincare): "onboarding welcome carousel beauty skincare app with illustration, large serif headline, continue button". */
const { ic, esc, status, tabBar, sideNav, ICON } = require("../lib");

Object.assign(ICON, {
  g5_target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2"/>',
  g5_bank: '<path d="M3 9l9-5 9 5M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18"/>',
  g5_swap: '<path d="M4 8h14l-3-3M20 16H6l3 3"/>',
  g5_leaf: '<path d="M5 19c0-8 5-14 15-14 0 10-6 15-14 15M5 19l7-7"/>',
});
const H = (st, px) => Math.round(px * st.hscale);
const tint = (pct, v = "primary") => `color-mix(in oklab,var(--${v}) ${pct}%,var(--surface))`;
const sup = (n) => `<sup style="font-size:10px;font-weight:600;color:var(--primary);margin-left:2px">[${n}]</sup>`;

/* ---------------------------------------------------------------- scored-comparison (section) */
const PLANS = [["Starter", "Solo developers and side projects"], ["Team", "Product teams with an on-call rota"], ["Scale", "Several teams and regulated workloads"]];
// [criterion, weight %, note, scores x3 (0–10), footnote]
const CRIT = [["Check coverage", 25, "regions, interval, protocols", [6.5, 8.5, 9.5], 1], ["Alerting and on-call", 20, "routing, escalation, quiet hours", [5, 9, 9.5], 2], ["Integrations", 15, "chat, paging, ticketing, webhooks", [6, 8, 9], null],
  ["Data retention", 15, "raw results and incident history", [4, 7, 9.5], 3], ["Team and access", 15, "seats, roles, SSO, audit log", [3.5, 7.5, 9.5], null], ["Support", 10, "channels and response targets", [5, 7.5, 9], 4]];
const total = (j) => CRIT.reduce((a, c) => a + c[1] * c[3][j], 0) / 100;
const FOOT = ["Median of 3 test accounts per plan, 6 regions, 1 Aug – 31 Oct 2026. Checks at each plan’s shortest interval.", "Time from a failing check to a page, 200 simulated incidents per plan. Escalation needs Team or higher.",
  "Retention as listed in each plan’s terms on 1 Nov 2026; longer retention is available as an add-on on Starter.", "Response targets are business-hours targets from the support policy, not guarantees."];
const ring = (v, s = 64, w = 6) => { const r = (s - w) / 2, c = 2 * Math.PI * r; return `<svg width="${s}" height="${s}" viewBox="0 0 ${s} ${s}" role="img" aria-label="${v} out of 10"><circle cx="${s / 2}" cy="${s / 2}" r="${r}" fill="none" stroke="var(--border)" stroke-width="${w}"/><circle cx="${s / 2}" cy="${s / 2}" r="${r}" fill="none" stroke="var(--primary)" stroke-width="${w}" stroke-linecap="round" stroke-dasharray="${(c * v / 10).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 ${s / 2} ${s / 2})"/><text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" font-family="var(--font-b)" font-weight="700" font-size="${Math.round(s * 0.27)}" fill="var(--text)">${v.toFixed(1)}</text></svg>`; };
const scoreBar = (v, best, w) => `<div style="display:flex;align-items:center;gap:8px"><span style="flex:1;height:8px;border-radius:4px;background:color-mix(in oklab,var(--muted) 14%,var(--surface));${w ? `max-width:${w}px` : ""}"><span style="display:block;height:100%;width:${v * 10}%;border-radius:4px;background:${best ? "var(--primary)" : "color-mix(in oklab,var(--primary) 45%,var(--surface))"}"></span></span><b class="num" style="font-size:13px;min-width:26px;text-align:right">${v.toFixed(1)}</b></div>`;
const scWeb = (p, st) => {
  const cols = "grid-template-columns:1.25fr 1fr 1fr 1fr", T = [0, 1, 2].map(total), hi = 1;
  return `<style>.sc>*{flex-shrink:0}</style><section class="sc" style="height:100%;padding:60px 120px;display:flex;flex-direction:column;gap:28px">
<div style="display:flex;align-items:flex-end;justify-content:space-between;gap:40px"><div style="display:grid;gap:10px;max-width:720px"><span class="badge" style="justify-self:start">How the plans score</span><h1 style="font-size:${H(st, 40)}px">Plans compared, scored and sourced</h1><p class="muted" style="font-size:16px;line-height:1.5">Each plan is scored 0–10 on six weighted criteria. Overall scores are the weighted average. Numbers in brackets point to how we measured.</p></div>
<div class="card" style="padding:12px 16px;font-size:12.5px;display:grid;gap:6px;min-width:250px"><b style="font-size:13px">Weighting</b>${CRIT.map((c) => `<div style="display:flex;justify-content:space-between;gap:12px"><span class="muted">${c[0]}</span><span class="num" style="font-size:12.5px">${c[1]}%</span></div>`).join("")}</div></div>
<div class="card" style="overflow:hidden;padding:0">
<div style="display:grid;${cols};border-bottom:1px solid var(--border)"><div style="padding:22px 24px;display:flex;flex-direction:column;justify-content:flex-end"><b>Overall score</b><span class="muted" style="font-size:12px">weighted, out of 10</span></div>
${PLANS.map(([n, b], j) => `<div style="padding:20px 22px;border-left:1px solid var(--border);display:flex;gap:14px;align-items:center;${j === hi ? `background:${tint(7)}` : ""}">${ring(T[j])}<div style="display:grid;gap:3px"><div style="display:flex;gap:8px;align-items:center"><b style="font-size:17px">${n}</b>${j === hi ? `<span class="badge">Our pick for most teams</span>` : ""}</div><span class="muted" style="font-size:12.5px;line-height:1.35">${b}</span></div></div>`).join("")}</div>
${CRIT.map(([c, w, note, sc, f], i) => { const best = Math.max(...sc); return `<div style="display:grid;${cols};${i < CRIT.length - 1 ? "border-bottom:1px solid var(--border)" : ""}"><div style="padding:14px 24px"><div style="font-weight:600;font-size:14px">${c}${f ? sup(f) : ""}</div><div class="muted" style="font-size:12px">${note} · weight ${w}%</div></div>
${sc.map((v, j) => `<div style="padding:14px 22px;border-left:1px solid var(--border);display:flex;align-items:center;${j === hi ? `background:${tint(7)}` : ""}"><div style="flex:1">${scoreBar(v, v === best)}</div></div>`).join("")}</div>`; }).join("")}
<div style="display:grid;${cols};border-top:1px solid var(--border);background:color-mix(in oklab,var(--surface) 50%,var(--bg))"><div style="padding:16px 24px;font-size:13px" class="muted">Pick a plan</div>${PLANS.map(([n], j) => `<div style="padding:14px 22px;border-left:1px solid var(--border)"><span class="btn ${j === hi ? "primary" : ""} block" style="height:40px">Start with ${n}</span></div>`).join("")}</div></div>
<ol style="margin:0;padding:0 0 0 20px;display:grid;gap:6px;font-size:12.5px;line-height:1.5" class="muted" aria-label="Sources and methodology">${FOOT.map((t) => `<li>${t}</li>`).join("")}</ol>
</section>`;
};
const scMobile = (p, st) => {
  const T = [0, 1, 2].map(total);
  return `<style>.sc>*{flex-shrink:0}</style><section class="sc" style="height:100%;padding:36px 20px;display:flex;flex-direction:column;gap:20px">
<div style="display:grid;gap:8px"><span class="badge" style="justify-self:start">How the plans score</span><h1 style="font-size:${H(st, 28)}px">Plans compared, scored and sourced</h1><p class="muted" style="font-size:14px;line-height:1.5">Scored 0–10 on six weighted criteria. Bracketed numbers show how we measured.</p></div>
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">${PLANS.map(([n], j) => `<div class="card" style="padding:12px 6px;display:grid;justify-items:center;gap:6px;${j === 1 ? "border-color:var(--primary);box-shadow:0 0 0 1px var(--primary)" : ""}">${ring(T[j], 56, 5)}<b style="font-size:13px">${n}</b></div>`).join("")}</div>
<div class="card" style="padding:4px 14px">${CRIT.map(([c, w, , sc, f], i) => { const best = Math.max(...sc); return `<div style="padding:12px 0;${i ? "border-top:1px solid var(--border)" : ""};display:grid;gap:7px"><div style="display:flex;justify-content:space-between;font-size:13.5px"><b>${c}${f ? sup(f) : ""}</b><span class="muted" style="font-size:12px">weight ${w}%</span></div>
${sc.map((v, j) => `<div style="display:grid;grid-template-columns:52px 1fr;align-items:center;gap:8px;font-size:12px"><span class="muted">${PLANS[j][0]}</span>${scoreBar(v, v === best)}</div>`).join("")}</div>`; }).join("")}</div>
<span class="btn primary block" style="height:46px">Start with Team</span>
<ol style="margin:0;padding:0 0 0 18px;display:grid;gap:6px;font-size:12px;line-height:1.5" class="muted" aria-label="Sources and methodology">${FOOT.map((t) => `<li>${t}</li>`).join("")}</ol>
</section>`;
};

/* ---------------------------------------------------------------- savings-goal (Mintwell) */
const BNAV = [["home", "Home"], ["card", "Accounts"], ["send", "Payments"], ["g5_target", "Goals"], ["chart", "Insights"], ["gear", "Settings"]];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May"];
const HIST = [600, 980, 1290, 1610, 1820, 2150, 2440, 2700, 3010, 3420, 3840]; // Jan–Nov 2026
const projChart = (w, h, compact) => {
  const max = 6600, x = (i) => 8 + i * (w - 16) / (MONTHS.length - 1), y = (v) => h - 20 - v / max * (h - 34);
  const base = [3840], fast = [3840]; for (let i = 1; i <= 5; i++) { base.push(Math.min(6000, 3840 + 432 * i)); fast.push(Math.min(6000, 3840 + 540 * i)); }
  const path = (arr, off) => arr.map((v, i) => `${i ? "L" : "M"}${x(i + off).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
  const hit = 10 + Math.ceil(2160 / 432), hitFast = 10 + Math.ceil(2160 / 540);
  return `<svg viewBox="0 0 ${w} ${h}" width="100%" height="${h}" role="img" aria-label="Savings balance Jan to Nov 2026 and projection reaching 6,000 dollars in April 2027">
${[2000, 4000].map((v) => `<line x1="0" x2="${w}" y1="${y(v)}" y2="${y(v)}" stroke="var(--border)" stroke-dasharray="3 4"/><text x="${w - 4}" y="${y(v) - 4}" text-anchor="end" font-size="10" fill="var(--muted)" font-family="var(--font-b)">$${v / 1000}k</text>`).join("")}
<line x1="0" x2="${w}" y1="${y(6000)}" y2="${y(6000)}" stroke="var(--success)" stroke-width="1.5" stroke-dasharray="6 4"/><text x="8" y="${y(6000) - 6}" font-size="11" font-weight="600" fill="var(--success)" font-family="var(--font-b)">Goal $6,000</text>
<path d="${path(HIST, 0)} L${x(10)} ${h - 20} L${x(0)} ${h - 20}Z" fill="color-mix(in oklab,var(--primary) 14%,transparent)"/>
<path d="${path(HIST, 0)}" fill="none" stroke="var(--primary)" stroke-width="2.5"/>
<path d="${path(fast.slice(0, hitFast - 9), 10)}" fill="none" stroke="var(--accent)" stroke-width="2" stroke-dasharray="2 5" stroke-linecap="round"/>
<path d="${path(base.slice(0, hit - 9), 10)}" fill="none" stroke="var(--primary)" stroke-width="2" stroke-dasharray="6 5"/>
<circle cx="${x(10)}" cy="${y(3840)}" r="5" fill="var(--surface)" stroke="var(--primary)" stroke-width="2.5"/>
<circle cx="${x(hit)}" cy="${y(6000)}" r="5" fill="var(--success)"/>
${MONTHS.map((m, i) => (compact && i % 2) ? "" : `<text x="${x(i)}" y="${h - 4}" text-anchor="middle" font-size="10" fill="${i === 10 ? "var(--text)" : "var(--muted)"}" font-weight="${i === 10 ? 700 : 400}" font-family="var(--font-b)">${m}</text>`).join("")}</svg>`;
};
const goalRing = (s, w) => { const r = (s - w) / 2, c = 2 * Math.PI * r; return `<svg width="${s}" height="${s}" viewBox="0 0 ${s} ${s}" role="img" aria-label="64 percent saved"><circle cx="${s / 2}" cy="${s / 2}" r="${r}" fill="none" stroke="color-mix(in oklab,var(--primary) 16%,var(--surface))" stroke-width="${w}"/><circle cx="${s / 2}" cy="${s / 2}" r="${r}" fill="none" stroke="var(--primary)" stroke-width="${w}" stroke-linecap="round" stroke-dasharray="${(c * 0.64).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 ${s / 2} ${s / 2})"/><text x="50%" y="47%" text-anchor="middle" font-family="var(--font-b)" font-weight="700" font-size="${Math.round(s * 0.2)}" fill="var(--text)">64%</text><text x="50%" y="64%" text-anchor="middle" font-family="var(--font-b)" font-size="${Math.round(s * 0.085)}" fill="var(--muted)">saved</text></svg>`; };
const OTHER = [["Japan trip", "$1,250", "$3,500", 0.36, "Oct 2027"], ["New laptop", "$900", "$2,000", 0.45, "Mar 2027"], ["Car service", "$480", "$600", 0.8, "Dec 2026"]];
const legendS = () => `<div style="display:flex;gap:14px;font-size:12px;flex-wrap:wrap" class="muted"><span style="display:inline-flex;gap:6px;align-items:center"><span style="width:14px;height:3px;background:var(--primary)"></span>Saved</span><span style="display:inline-flex;gap:6px;align-items:center"><span style="width:14px;border-top:2px dashed var(--primary)"></span>At $400/mo → Apr 2027</span><span style="display:inline-flex;gap:6px;align-items:center"><span style="width:14px;border-top:2px dotted var(--accent)"></span>At $500/mo → Mar 2027</span></div>`;
const slider = (pct) => `<div style="position:relative;height:18px"><div style="position:absolute;top:8px;left:0;right:0;height:4px;border-radius:2px;background:var(--border)"></div><div style="position:absolute;top:8px;left:0;width:${pct}%;height:4px;border-radius:2px;background:var(--primary)"></div><span role="slider" aria-valuenow="400" aria-label="Monthly contribution" style="position:absolute;top:1px;left:calc(${pct}% - 8px);width:16px;height:16px;border-radius:50%;background:var(--surface);border:2px solid var(--primary)"></span></div>`;
const sgWeb = (p, st) => `<div class="shell">${sideNav(p, "Goals", BNAV)}<main class="main"><div class="top"><div style="font-weight:600">Goals</div><div class="search">${ic("search", 15)}Search</div><span style="display:flex;color:var(--muted)">${ic("bell", 19)}</span></div>
<div class="page" style="grid-template-columns:minmax(0,1fr) 320px;gap:20px;padding:22px 28px">
<div style="display:flex;flex-direction:column;gap:16px;min-width:0">
<div style="display:flex;justify-content:space-between;align-items:flex-end"><div class="ph"><div class="muted" style="font-size:13px;display:flex;gap:6px;align-items:center">${ic("back", 14)}All goals</div><h1 style="font-size:${H(st, 26)}px;margin-top:4px">Emergency fund</h1><p style="font-size:13px">Three months of rent and bills · started Jan 2026</p></div><div style="display:flex;gap:8px"><span class="btn">${ic("edit", 15)}Edit goal</span><span class="btn primary">${ic("plus", 15)}Add money</span></div></div>
<div class="card" style="padding:20px;display:grid;grid-template-columns:auto 1fr;gap:28px;align-items:center">${goalRing(150, 14)}
<div style="display:grid;gap:14px"><div style="display:flex;align-items:baseline;gap:10px"><span class="num" style="font-size:40px">$3,840</span><span class="muted" style="font-size:15px">of $6,000</span></div>
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px">${[["Left to save", "$2,160"], ["On track for", "Apr 2027"], ["Interest earned", "$46.18"]].map(([k, v]) => `<div style="padding:10px 12px;border-radius:var(--radius);background:${tint(7)}"><div class="muted" style="font-size:12px">${k}</div><b class="num" style="font-size:18px">${v}</b></div>`).join("")}</div>
<div style="font-size:13px;display:flex;gap:8px;align-items:center;color:color-mix(in oklab,var(--success) 78%,var(--text))">${ic("check", 15)}<span>You’re <b>$240 ahead</b> of plan this month</span></div></div></div>
<div class="card" style="padding:18px 20px;display:grid;gap:10px"><div style="display:flex;justify-content:space-between;align-items:baseline"><b style="font-size:15px">Balance and projection</b>${legendS()}</div>${projChart(760, 330)}</div>
</div>
<aside style="display:grid;gap:12px;align-content:start">
<div class="card" style="padding:16px 18px;display:grid;gap:12px"><b style="font-size:15px">Auto-save</b>
<div style="display:flex;justify-content:space-between;align-items:baseline;font-size:13px"><span class="muted">Monthly transfer · on the 1st</span><b class="num" style="font-size:18px">$400</b></div>${slider(40)}
<div style="display:flex;justify-content:space-between;font-size:11.5px" class="muted"><span>$0</span><span>$1,000</span></div>
${[["Round up card spending", true, "+$32 this month"], ["Save 10% of incoming pay", false, ""]].map(([t, on, s]) => `<div style="display:flex;gap:10px;align-items:center;font-size:13px"><span role="switch" aria-checked="${on}" style="flex:none;width:34px;height:20px;border-radius:999px;position:relative;background:${on ? "var(--primary)" : "color-mix(in oklab,var(--muted) 30%,var(--surface))"}"><span style="position:absolute;top:2px;left:${on ? 16 : 2}px;width:16px;height:16px;border-radius:50%;background:var(--surface)"></span></span><span style="flex:1">${t}${s ? `<div class="muted" style="font-size:11.5px">${s}</div>` : ""}</span></div>`).join("")}
<div style="font-size:12.5px;padding:10px 12px;border-radius:var(--radius);background:${tint(8, "accent")}"><b>Try $500/mo</b> to reach your goal a month sooner, in Mar 2027.</div></div>
<div class="card" style="padding:16px 18px;display:grid;gap:11px"><b style="font-size:15px">Other goals</b>${OTHER.map(([n, a, t, f, d]) => `<div style="display:grid;gap:5px"><div style="display:flex;justify-content:space-between;font-size:13px"><b style="font-weight:600">${n}</b><span><span class="num">${a}</span><span class="muted"> / ${t}</span></span></div><div style="height:5px;border-radius:3px;background:color-mix(in oklab,var(--muted) 14%,var(--surface))"><div style="height:100%;width:${f * 100}%;border-radius:3px;background:var(--primary)"></div></div><span class="muted" style="font-size:11.5px">Target ${d}</span></div>`).join("")}</div>
</aside></div></main></div>`;
const sgMobile = (p, st) => `<div class="phone">${status()}
<div class="mtop"><span style="display:flex">${ic("back", 22)}</span><b style="font-size:16px">Emergency fund</b><span style="display:flex">${ic("more", 22)}</span></div>
<div class="mbody" style="gap:12px">
<div style="display:flex;gap:16px;align-items:center">${goalRing(112, 11)}<div><div class="num" style="font-size:30px">$3,840</div><div class="muted" style="font-size:13px">of $6,000 · $2,160 to go</div><div style="margin-top:6px;font-size:12.5px;color:color-mix(in oklab,var(--success) 78%,var(--text));font-weight:600">On track for Apr 2027</div></div></div>
<div class="card" style="padding:12px 12px 6px;display:grid;gap:8px"><div style="display:flex;justify-content:space-between;align-items:baseline"><b style="font-size:13.5px">Projection</b><span class="muted" style="font-size:11.5px">at $400/mo</span></div>${projChart(330, 170, true)}</div>
<div class="card" style="padding:12px 14px;display:grid;gap:10px"><div style="display:flex;justify-content:space-between;align-items:baseline;font-size:13px"><b>Monthly auto-save</b><b class="num" style="font-size:17px">$400</b></div>${slider(40)}<div style="font-size:12px" class="muted">$500/mo gets you there in Mar 2027.</div></div>
<div style="display:flex;justify-content:space-between;font-size:13px;align-items:center"><span><b>Round-ups</b><div class="muted" style="font-size:12px">+$32 this month</div></span><span role="switch" aria-checked="true" style="width:40px;height:24px;border-radius:999px;position:relative;background:var(--primary)"><span style="position:absolute;top:2px;left:18px;width:20px;height:20px;border-radius:50%;background:var(--surface)"></span></span></div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:auto"><span class="btn" style="height:44px">Withdraw</span><span class="btn primary" style="height:44px">Add money</span></div>
</div>${tabBar("Goals", [["home", "Home"], ["card", "Accounts"], ["g5_target", "Goals"], ["chart", "Insights"]])}</div>`;

/* ---------------------------------------------------------------- onboarding-carousel (Dewline) */
// Token-drawn illustration: an arch, a dropper bottle, a jar and leaves (no images).
const illo = (w, h) => `<svg viewBox="0 0 300 300" width="${w}" height="${h}" role="img" aria-label="Illustration of a serum bottle, a cream jar and leaves">
<path d="M40 290V140a110 110 0 0 1 220 0v150z" fill="color-mix(in oklab,var(--primary) 18%,var(--surface))"/>
<circle cx="222" cy="82" r="26" fill="color-mix(in oklab,var(--accent) 35%,var(--surface))"/>
<path d="M70 250c-8-46 18-84 58-96-6 44-26 78-58 96z" fill="color-mix(in oklab,var(--accent) 55%,var(--surface))"/><path d="M70 250c14-30 30-56 54-88" stroke="var(--surface)" stroke-width="2" fill="none"/>
<path d="M232 254c10-40-8-74-42-90 0 40 14 72 42 90z" fill="color-mix(in oklab,var(--primary) 45%,var(--surface))"/>
<rect x="128" y="118" width="46" height="132" rx="14" fill="var(--surface)" stroke="var(--text)" stroke-width="3"/><rect x="138" y="96" width="26" height="26" rx="4" fill="var(--text)"/><rect x="146" y="70" width="10" height="28" rx="5" fill="var(--text)"/>
<rect x="128" y="168" width="46" height="40" fill="color-mix(in oklab,var(--primary) 30%,var(--surface))"/><text x="151" y="193" text-anchor="middle" font-family="var(--font-h)" font-size="14" fill="var(--text)">B5</text>
<rect x="180" y="206" width="68" height="44" rx="10" fill="var(--surface)" stroke="var(--text)" stroke-width="3"/><rect x="176" y="194" width="76" height="18" rx="6" fill="var(--text)"/>
<path d="M40 290h220" stroke="var(--text)" stroke-width="3"/></svg>`;
const dots = (on = 0) => `<div role="tablist" aria-label="Intro slides" style="display:flex;gap:7px;align-items:center">${[0, 1, 2].map((i) => `<span role="tab" aria-selected="${i === on}" aria-label="Slide ${i + 1} of 3" style="height:8px;border-radius:4px;width:${i === on ? 24 : 8}px;background:${i === on ? "var(--primary)" : "var(--border)"}"></span>`).join("")}</div>`;
const SLIDE = { kicker: "Step 1 of 3 · Your skin", h: "Skincare that learns your skin", body: "Tell us how your skin feels through the week and Dewline builds a simple morning and evening routine around the products you already own." };
const ocWeb = (p, st) => `<div style="height:100%;display:grid;grid-template-columns:1fr 1fr">
<div style="background:color-mix(in oklab,var(--primary) 7%,var(--bg));display:grid;place-items:center;position:relative">${illo(520, 520)}<div class="logo" style="position:absolute;top:32px;left:40px"><b></b>${esc(p.name)}</div></div>
<div style="display:flex;flex-direction:column;justify-content:center;gap:26px;padding:0 120px 0 96px;position:relative">
<span style="position:absolute;top:32px;right:40px;font-size:14px;font-weight:600" class="muted">Skip</span>
<span class="muted" style="font-size:13px;font-weight:600;letter-spacing:.06em;text-transform:uppercase">${SLIDE.kicker}</span>
<h1 style="font-size:${H(st, 56)}px;line-height:1.04;max-width:520px">${SLIDE.h}</h1>
<p class="muted" style="font-size:18px;line-height:1.55;max-width:480px">${SLIDE.body}</p>
<div style="display:grid;gap:12px;max-width:440px">${[["g5_leaf", "Check-ins take 20 seconds"], ["scan", "Scan labels to see what’s inside"], ["calendar", "Routines adjust to the season"]].map(([i, t]) => `<div style="display:flex;gap:12px;align-items:center;font-size:15px"><span style="width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:${tint(14)};color:color-mix(in oklab,var(--primary) 75%,var(--text))">${ic(ICON[i] ? i : "spark", 17)}</span>${t}</div>`).join("")}</div>
<div style="display:flex;align-items:center;gap:24px;margin-top:8px">${dots(0)}<span class="btn primary" style="height:50px;padding:0 30px;font-size:15px;margin-left:auto">Continue${ic("arrow", 17)}</span></div>
</div></div>`;
const ocMobile = (p, st) => `<div class="phone">${status()}
<div class="mtop"><div class="logo"><b></b>${esc(p.name)}</div><span class="muted" style="font-size:14px;font-weight:600">Skip</span></div>
<div style="flex:none;margin:0 20px;border-radius:var(--radius-lg);background:color-mix(in oklab,var(--primary) 7%,var(--bg));display:grid;place-items:center;height:350px">${illo(300, 300)}</div>
<div class="mbody" style="padding-top:24px;gap:14px">
<span class="muted" style="font-size:12px;font-weight:600;letter-spacing:.06em;text-transform:uppercase">${SLIDE.kicker}</span>
<h1 style="font-size:${H(st, 34)}px;line-height:1.08">${SLIDE.h}</h1>
<p class="muted" style="font-size:15px;line-height:1.55">${SLIDE.body}</p>
<div style="margin-top:auto;display:flex;align-items:center;justify-content:space-between">${dots(0)}<span class="btn primary" style="height:52px;padding:0 28px;font-size:15px">Continue${ic("arrow", 17)}</span></div>
</div></div>`;

module.exports = {
  "scored-comparison": { family: "marketing", type: "section", name: "Scored comparison table",
    shows: "a scored plan comparison table: three placeholder plans as columns with overall score rings, six weighted criteria with 0–10 score bars (best score highlighted), bracketed footnote markers, a weighting panel, plan CTAs and a numbered sources and methodology list (no prices)",
    elements: ["comparison-table", "table", "progress-ring", "score-bars", "footnotes", "badge", "button", "marketing"], size: { web: [1440, 1220], mobile: [390, 1700] }, web: scWeb, mobile: scMobile },
  "savings-goal": { family: "bank", name: "Savings goal with projection",
    shows: "a personal savings goal: a progress ring (64% saved), amount saved vs target, months to goal, a balance chart with a dashed projection to the goal line and a faster what-if scenario, an auto-save slider, round-up toggles and other goals with progress bars",
    elements: ["sidebar-nav", "chart", "progress-ring", "progress", "toggle", "slider", "card"], web: sgWeb, mobile: sgMobile },
  "onboarding-carousel": { family: "beauty", name: "Onboarding carousel",
    shows: "a first slide of a three-slide onboarding carousel for a skincare app: a token-drawn illustration (serum bottle, jar, leaves), a large display headline, body copy, three benefit rows on web, page dots, Skip and a Continue button",
    elements: ["carousel", "illustration", "page-dots", "button"], web: ocWeb, mobile: ocMobile },
};
