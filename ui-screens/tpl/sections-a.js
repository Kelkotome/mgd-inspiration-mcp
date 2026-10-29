/* Marketing website sections for Patchbay (API monitoring): hero, feature-grid, testimonials, logo-cloud, faq, cta-banner, stats-band. */
const { ic, esc, status, areaChart } = require("../lib");

const TPL = {};
const NAV = ["Product", "Docs", "Pricing", "Changelog"];
const webHeader = (p) => `<header style="display:flex;align-items:center;gap:28px;padding:18px 64px;border-bottom:1px solid var(--border);flex:none"><div class="logo"><b></b>${esc(p.name)}</div>${NAV.map((t) => `<span class="muted">${t}</span>`).join("")}<span style="margin-left:auto" class="muted">Log in</span><button class="btn primary">Start free</button></header>`;
const mobHeader = (p) => `<header style="display:flex;align-items:center;justify-content:space-between;padding:8px 20px 14px;border-bottom:1px solid var(--border);flex:none"><div class="logo"><b></b>${esc(p.name)}</div>${ic("menu", 22)}</header>`;
const eyebrow = (t) => `<span class="badge">${t}</span>`;
const initials = (n) => n.split(" ").map((w) => w[0]).join("").slice(0, 2);

// ---- hero ---------------------------------------------------------------------------------
const MONITORS = [["GET", "/v1/orders", "99.99%", "142 ms", 0], ["POST", "/v1/payments", "99.97%", "218 ms", 0], ["GET", "/v1/search", "99.82%", "612 ms", 1], ["POST", "/oauth/token", "100%", "88 ms", 0]];
const dot = (warn, s = 8) => `<span style="width:${s}px;height:${s}px;border-radius:50%;flex:none;background:${warn ? "var(--accent)" : "var(--primary)"};box-shadow:0 0 0 3px color-mix(in oklab,${warn ? "var(--accent)" : "var(--primary)"} 20%,transparent)"></span>`;
const uptimeStrip = (rnd, n, h) => `<div style="display:flex;gap:2px;height:${h}px">${Array.from({ length: n }, (_, i) => { const r = rnd(); const warn = i === n - 9 || r > 0.965; return `<span style="flex:1;border-radius:2px;background:${warn ? "var(--accent)" : "color-mix(in oklab,var(--primary) 75%,var(--surface))"}"></span>`; }).join("")}</div>`;
const dashboard = (rnd, compact) => `<div class="card" style="overflow:hidden;box-shadow:var(--shadow-lg)">
<div style="display:flex;align-items:center;gap:10px;padding:${compact ? "12px 14px" : "14px 18px"};border-bottom:1px solid var(--border)"><div style="font-weight:600">Production APIs</div><span class="badge">4 monitors</span><span class="muted" style="margin-left:auto;font-size:12px;display:flex;gap:6px;align-items:center">${ic("globe", 14)}${compact ? "6 regions" : "6 regions · every 30 s"}</span></div>
<div style="padding:${compact ? "14px" : "18px"};display:grid;gap:${compact ? 12 : 16}px">
<div style="display:grid;grid-template-columns:repeat(${compact ? 2 : 3},1fr);gap:${compact ? 8 : 12}px">${[["Uptime · 90 days", "99.94%"], ["p95 latency", "231 ms"], ["Open incidents", "1"]].slice(0, compact ? 2 : 3).map(([l, v]) => `<div style="padding:${compact ? "10px" : "12px 14px"};border-radius:var(--radius);background:color-mix(in oklab,var(--bg) 70%,var(--surface))"><div class="muted" style="font-size:${compact ? 11 : 12}px">${l}</div><div class="num" style="font-size:${compact ? 19 : 22}px;margin-top:2px">${v}</div></div>`).join("")}</div>
<div><div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:6px"><span style="font-weight:600">Response time</span><span class="muted">Last 24 h</span></div>${areaChart(rnd, compact ? 320 : 600, compact ? 70 : 120)}</div>
<div>${uptimeStrip(rnd, compact ? 45 : 90, compact ? 18 : 24)}<div class="muted" style="display:flex;justify-content:space-between;font-size:11px;margin-top:4px"><span>${compact ? "45" : "90"} days ago</span><span>Today</span></div></div>
${compact ? "" : `<div style="border:1px solid var(--border);border-radius:var(--radius);overflow:hidden">${MONITORS.map(([m, path, up, ms, warn], i) => `<div style="display:grid;grid-template-columns:16px 52px 1fr 70px 70px;align-items:center;gap:10px;padding:9px 12px;font-size:13px;${i ? "border-top:1px solid var(--border)" : ""}">${dot(warn)}<span class="muted" style="font:600 11px ui-monospace,Menlo,monospace">${m}</span><span style="font-family:ui-monospace,Menlo,monospace;font-size:12.5px">${path}</span><span class="num" style="font-size:13px;text-align:right">${up}</span><span class="num" style="font-size:13px;text-align:right;${warn ? "color:color-mix(in oklab,var(--accent) 75%,var(--text))" : ""}">${ms}</span></div>`).join("")}</div>`}
</div></div>`;
const toast = (compact) => `<div class="card" style="display:flex;gap:10px;align-items:flex-start;padding:${compact ? "10px 12px" : "12px 14px"};box-shadow:var(--shadow-lg);${compact ? "" : "width:390px"}"><span style="width:28px;height:28px;border-radius:var(--radius);display:grid;place-items:center;flex:none;background:color-mix(in oklab,var(--accent) 18%,var(--surface));color:color-mix(in oklab,var(--accent) 75%,var(--text))">${ic("bell", 16)}</span><div style="font-size:12.5px;line-height:1.4"><div style="font-weight:600">#on-call · p95 on /v1/search above 500 ms</div><div class="muted">Acknowledged by Lin Park · 41 s after detection</div></div></div>`;
TPL["hero/web"] = (p, st, rnd) => `<div style="height:100%;display:flex;flex-direction:column">${webHeader(p)}
<section style="flex:1;display:grid;grid-template-columns:1fr 1.08fr;gap:56px;align-items:center;padding:0 64px">
<div style="display:grid;gap:22px;justify-items:start">${eyebrow("New · status pages with custom domains")}
<h1 style="font-size:${Math.round(56 * st.hscale)}px;line-height:1.04">Know your API is down before your customers do</h1>
<p class="muted" style="font-size:18px;max-width:500px">${esc(p.name)} checks every endpoint from six regions every 30 seconds, pages the right person on call, and keeps your public status page honest.</p>
<div style="display:flex;gap:10px"><button class="btn primary" style="height:44px;padding:0 20px;font-size:14px">Start monitoring free ${ic("arrow", 16)}</button><button class="btn" style="height:44px;padding:0 18px;font-size:14px">${ic("play", 14)}Watch a 2-min demo</button></div>
<div style="display:flex;align-items:center;gap:12px;font-size:13px"><div style="display:flex">${["MO", "SA", "LP", "PN"].map((a, i) => `<div class="avatar" style="width:30px;height:30px;border:2px solid var(--bg);${i ? "margin-left:-6px" : ""}">${a}</div>`).join("")}</div><span class="muted"><b style="color:var(--text)">2,400+ engineering teams</b> sleep through the night with ${esc(p.name)}</span></div>
<div class="muted" style="display:flex;gap:18px;font-size:12.5px">${["No credit card", "3 monitors free forever", "Setup in 2 minutes"].map((t) => `<span style="display:flex;gap:5px;align-items:center"><span style="color:var(--primary)">${ic("check", 14)}</span>${t}</span>`).join("")}</div></div>
<div style="position:relative;padding:0 0 44px">${dashboard(rnd, false)}<div style="position:absolute;left:-40px;bottom:0">${toast(false)}</div></div>
</section></div>`;
TPL["hero/mobile"] = (p, st, rnd) => `<div class="phone">${status()}${mobHeader(p)}
<div class="mbody" style="padding-top:26px;gap:16px">${`<div>${eyebrow("New · custom-domain status pages")}</div>`}
<h1 style="font-size:${Math.round(36 * st.hscale)}px;line-height:1.05">Know your API is down before your customers do</h1>
<p class="muted" style="font-size:15px">Checks from six regions every 30 seconds, alerts the right person on call, and a status page that stays honest.</p>
<div style="display:grid;gap:8px"><button class="btn primary block" style="height:46px">Start monitoring free ${ic("arrow", 16)}</button><button class="btn block" style="height:46px">${ic("play", 14)}Watch a 2-min demo</button></div>
<div style="display:flex;align-items:center;gap:10px;font-size:12.5px"><div style="display:flex">${["MO", "SA", "LP"].map((a, i) => `<div class="avatar" style="border:2px solid var(--bg);${i ? "margin-left:-8px" : ""}">${a}</div>`).join("")}</div><span class="muted"><b style="color:var(--text)">2,400+ teams</b> monitor with ${esc(p.name)}</span></div>
<div style="position:relative;margin-top:4px">${dashboard(rnd, true)}</div>
${toast(true)}</div></div>`;

// ---- feature-grid -------------------------------------------------------------------------
const FEATURES = [
  ["globe", "Checks from six regions", "Run HTTP, TCP and GraphQL checks every 30 seconds from Frankfurt, Virginia, Oregon, São Paulo, Mumbai and Sydney."],
  ["bolt", "Latency, not just uptime", "Track p50, p95 and p99 per endpoint and get warned when a slow deploy creeps past your budget."],
  ["bell", "Alerts that reach a human", "Route by service to Slack, PagerDuty, SMS or phone. Escalate automatically if nobody acknowledges."],
  ["calendar", "On-call schedules built in", "Weekly rotations, overrides and holiday swaps. The alert goes to whoever is actually on call."],
  ["shield", "Public status pages", "A branded page on status.yourdomain.com that updates itself when a monitor fails and recovers."],
  ["key", "Assertions and auth", "Send real tokens, assert on JSON fields and headers, and catch the 200 OK that returns an empty body."],
];
const featIcon = (n, s = 40) => `<span style="width:${s}px;height:${s}px;border-radius:var(--radius);display:grid;place-items:center;flex:none;background:color-mix(in oklab,var(--primary) 12%,var(--surface));color:var(--primary)">${ic(n, Math.round(s * 0.5))}</span>`;
TPL["feature-grid/web"] = (p, st) => `<section style="padding:72px 64px;display:grid;gap:44px">
<div style="display:flex;justify-content:space-between;align-items:end;gap:40px"><div style="display:grid;gap:12px;justify-items:start;max-width:660px">${eyebrow("Features")}<h2 style="font-size:${Math.round(40 * st.hscale)}px">Everything a small team needs to stay on top of its APIs</h2></div><p class="muted" style="font-size:16px;max-width:400px">No agents to install and no dashboards to build. Paste a URL, pick who gets paged, and ${esc(p.name)} does the rest.</p></div>
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px">${FEATURES.map(([i, t, d]) => `<div class="card" style="padding:26px;display:grid;gap:12px;align-content:start">${featIcon(i)}<div style="font-weight:600;font-size:17px">${t}</div><div class="muted" style="font-size:14.5px">${d}</div></div>`).join("")}</div></section>`;
TPL["feature-grid/mobile"] = (p, st) => `<section style="padding:36px 20px;display:grid;gap:22px">
<div style="display:grid;gap:10px;justify-items:start">${eyebrow("Features")}<h2 style="font-size:${Math.round(28 * st.hscale)}px">Everything a small team needs to stay on top of its APIs</h2><p class="muted" style="font-size:15px">Paste a URL, pick who gets paged, and ${esc(p.name)} does the rest.</p></div>
<div class="card">${FEATURES.map(([i, t, d], k) => `<div style="display:flex;gap:14px;padding:16px;${k ? "border-top:1px solid var(--border)" : ""}">${featIcon(i, 36)}<div><div style="font-weight:600;font-size:15px">${t}</div><div class="muted" style="font-size:13.5px;margin-top:2px">${d}</div></div></div>`).join("")}</div></section>`;

// ---- testimonials -------------------------------------------------------------------------
const QUOTES = [
  ["Our payments API went down at 3:12 on a Sunday. Patchbay paged me, the status page updated itself, and by the time support woke up there was nothing left to explain. We closed the incident in 14 minutes.", "Priya Nair", "Staff engineer", "Ledgerline"],
  ["We replaced three tools and a cron job with one dashboard. The p95 alerts caught a slow deploy before a single customer ticket came in.", "Jonah Weiss", "CTO", "Copperhill Freight"],
  ["Setting up on-call took one afternoon. The escalation rules mean nobody sleeps through a page any more.", "Teodora Ruiz", "Platform lead", "Wavelet Health"],
];
const stars = (s = 15, feat) => `<div style="display:flex;gap:2px;color:${feat ? "color-mix(in oklab,var(--accent) 55%,var(--bg))" : "var(--accent)"}">${Array.from({ length: 5 }, () => ic("star", s).replace('fill="none"', 'fill="currentColor"')).join("")}</div>`;
const person = (n, r, c, feat, size = 40) => `<div style="display:flex;align-items:center;gap:12px"><div class="avatar" style="width:${size}px;height:${size}px;font-size:${Math.round(size * 0.34)}px;${feat ? "background:color-mix(in oklab,var(--bg) 18%,transparent);color:var(--bg)" : ""}">${initials(n)}</div><div style="line-height:1.35"><div style="font-weight:600">${n}</div><div style="font-size:13px;opacity:.7">${r}, ${c}</div></div></div>`;
const q = (s, p) => s.replace("Patchbay", esc(p.name));
TPL["testimonials/web"] = (p, st) => `<section style="padding:72px 64px;display:grid;gap:40px">
<div style="text-align:center;display:grid;gap:12px;justify-items:center">${eyebrow("Customers")}<h2 style="font-size:${Math.round(40 * st.hscale)}px;max-width:720px">On-call engineers sleep better with ${esc(p.name)}</h2></div>
<div style="display:grid;grid-template-columns:1.25fr 1fr;gap:20px">
<div class="card feat" style="padding:36px;display:flex;flex-direction:column;gap:24px;background:var(--text);color:var(--bg);border-color:var(--text)">${stars(18, true)}<blockquote class="h" style="font-size:${Math.round(28 * Math.min(st.hscale, 1.2))}px;line-height:1.3;text-transform:none">“${q(QUOTES[0][0], p)}”</blockquote><div style="margin-top:auto;display:flex;justify-content:space-between;align-items:center">${person(QUOTES[0][1], QUOTES[0][2], QUOTES[0][3], true, 46)}<div style="text-align:right"><div class="num" style="font-size:26px">14 min</div><div style="font-size:12px;opacity:.7">mean time to resolve</div></div></div></div>
<div style="display:grid;gap:20px">${QUOTES.slice(1).map(([t, n, r, c]) => `<div class="card" style="padding:26px;display:flex;flex-direction:column;gap:16px">${stars()}<p style="font-size:16px">“${t}”</p><div style="margin-top:auto">${person(n, r, c)}</div></div>`).join("")}</div></div></section>`;
TPL["testimonials/mobile"] = (p, st) => `<section style="padding:36px 20px;display:grid;gap:18px">
<div style="display:grid;gap:10px;justify-items:start">${eyebrow("Customers")}<h2 style="font-size:${Math.round(28 * st.hscale)}px">On-call engineers sleep better with ${esc(p.name)}</h2></div>
<div class="card feat" style="padding:22px;display:grid;gap:16px;background:var(--text);color:var(--bg);border-color:var(--text)">${stars(16, true)}<blockquote class="h" style="font-size:${Math.round(19 * Math.min(st.hscale, 1.2))}px;line-height:1.35;text-transform:none">“${q(QUOTES[0][0], p)}”</blockquote>${person(QUOTES[0][1], QUOTES[0][2], QUOTES[0][3], true)}</div>
${QUOTES.slice(1).map(([t, n, r, c]) => `<div class="card" style="padding:18px;display:grid;gap:12px"><p style="font-size:14.5px">“${t}”</p>${person(n, r, c, false, 36)}</div>`).join("")}</section>`;

// ---- logo-cloud ---------------------------------------------------------------------------
// Fictional wordmarks set in type (no real brands). Each: [html, style]
const mark = (shape) => shape === "circle" ? `<span style="width:16px;height:16px;border-radius:50%;border:3px solid currentColor;display:inline-block"></span>`
  : shape === "square" ? `<span style="width:14px;height:14px;background:currentColor;display:inline-block;transform:rotate(45deg)"></span>`
  : shape === "bars" ? `<span style="display:inline-flex;gap:2px;align-items:flex-end;height:16px">${[7, 12, 16].map((h) => `<span style="width:3px;height:${h}px;background:currentColor"></span>`).join("")}</span>` : "";
const LOGOS = [
  ["Ledgerline", "font:700 21px var(--font-b);letter-spacing:-0.04em", "circle"],
  ["COPPERHILL", "font:600 15px var(--font-b);letter-spacing:.24em", ""],
  ["wavelet", "font:500 italic 24px Georgia,serif;letter-spacing:-0.01em", ""],
  ["kiln.dev", "font:600 19px ui-monospace,Menlo,monospace;letter-spacing:-0.03em", ""],
  ["Halyard", "font:var(--hw) 23px var(--font-h);letter-spacing:var(--ls)", "square"],
  ["QUILLSTACK", "font:800 17px var(--font-b);letter-spacing:.02em", "bars"],
  ["brightloop", "font:300 22px var(--font-b);letter-spacing:.06em", ""],
  ["Tessera/9", "font:700 20px Georgia,serif;letter-spacing:.01em", ""],
];
const wordmark = ([t, s, sh]) => `<span style="display:inline-flex;align-items:center;gap:8px;color:color-mix(in oklab,var(--muted) 80%,var(--text));white-space:nowrap">${mark(sh)}<span style="${s}">${t}</span></span>`;
TPL["logo-cloud/web"] = (p) => `<section style="padding:52px 64px;display:grid;gap:30px;justify-items:center">
<p class="muted" style="font-size:14px;font-weight:500">Trusted by 2,400+ engineering teams to watch over 180,000 endpoints</p>
<div style="display:grid;grid-template-columns:repeat(4,1fr);width:100%;border-top:1px solid var(--border);border-left:1px solid var(--border)">${LOGOS.map((l) => `<div style="height:100px;display:grid;place-items:center;border-right:1px solid var(--border);border-bottom:1px solid var(--border)"><div style="transform:scale(1.2)">${wordmark(l)}</div></div>`).join("")}</div>
<span style="font-size:13px;font-weight:500;color:var(--primary);display:flex;gap:6px;align-items:center">Read customer stories ${ic("arrow", 14)}</span></section>`;
TPL["logo-cloud/mobile"] = () => `<section style="padding:32px 20px;display:grid;gap:20px;justify-items:center">
<p class="muted" style="font-size:13.5px;font-weight:500;text-align:center">Trusted by 2,400+ engineering teams</p>
<div style="display:grid;grid-template-columns:1fr 1fr;width:100%;border-top:1px solid var(--border);border-left:1px solid var(--border)">${LOGOS.map((l) => `<div style="height:72px;display:grid;place-items:center;border-right:1px solid var(--border);border-bottom:1px solid var(--border);transform-origin:center"><div style="transform:scale(.82)">${wordmark(l)}</div></div>`).join("")}</div>
<span style="font-size:13px;font-weight:500;color:var(--primary);display:flex;gap:6px;align-items:center">Read customer stories ${ic("arrow", 14)}</span></section>`;

// ---- faq ----------------------------------------------------------------------------------
const FAQ = [
  ["How often does Patchbay check my endpoints?", "Every 30 seconds on Team and Scale, every 5 minutes on Hobby. Each check runs from at least three regions, and we only alert when two or more agree the endpoint is failing, so a single flaky network hop never pages anyone."],
  ["Can I monitor APIs behind authentication?", ""],
  ["Which alert channels do you support?", ""],
  ["How does on-call scheduling work?", ""],
  ["Can I host the status page on my own domain?", ""],
  ["What happens if I go over my monitor limit?", ""],
];
const faqItem = (qq, a, open, i, mob) => `<div style="padding:${mob ? "15px 0" : "18px 0"};${i ? "border-top:1px solid var(--border)" : ""}"><div style="display:flex;justify-content:space-between;align-items:center;gap:16px;font-weight:600;font-size:${mob ? 15 : 16}px">${qq}<span style="flex:none;color:${open ? "var(--primary)" : "var(--muted)"}">${ic(open ? "minus" : "plus", 18)}</span></div>${open ? `<p class="muted" style="margin-top:8px;font-size:${mob ? 14 : 15}px;max-width:620px">${a}</p>` : ""}</div>`;
const contact = (mob) => `<div class="card" style="padding:${mob ? 18 : 22}px;display:grid;gap:12px;justify-items:start"><div style="display:flex;gap:-6px">${["SA", "LP"].map((a, i) => `<div class="avatar" style="width:34px;height:34px;border:2px solid var(--surface);${i ? "margin-left:-8px" : ""}">${a}</div>`).join("")}</div><div><div style="font-weight:600;font-size:15px">Still have questions?</div><div class="muted" style="font-size:13.5px">Talk to an engineer, not a sales script. We reply within a few hours, weekdays.</div></div><div style="display:flex;gap:8px"><button class="btn primary">${ic("chat", 15)}Chat with us</button><button class="btn">${ic("doc", 15)}Read the docs</button></div></div>`;
TPL["faq/web"] = (p, st) => `<section style="padding:72px 64px;display:grid;grid-template-columns:460px 1fr;gap:72px;align-items:start">
<div style="display:grid;gap:16px;justify-items:start">${eyebrow("FAQ")}<h2 style="font-size:${Math.round(40 * st.hscale)}px">Questions teams ask before switching</h2><p class="muted" style="font-size:15.5px">Everything about checks, alerts and status pages. Billing questions are on the pricing page.</p>${contact(false)}</div>
<div style="border-top:1px solid var(--border);border-bottom:1px solid var(--border)">${FAQ.map(([qq, a], i) => faqItem(q(qq, p), a, i === 0, i, false)).join("")}</div></section>`;
TPL["faq/mobile"] = (p, st) => `<section style="padding:36px 20px;display:grid;gap:20px">
<div style="display:grid;gap:10px;justify-items:start">${eyebrow("FAQ")}<h2 style="font-size:${Math.round(28 * st.hscale)}px">Questions teams ask before switching</h2></div>
<div style="border-top:1px solid var(--border);border-bottom:1px solid var(--border)">${FAQ.map(([qq, a], i) => faqItem(q(qq, p), a, i === 0, i, true)).join("")}</div>${contact(true)}</section>`;

// ---- cta-banner ---------------------------------------------------------------------------
const darkInput = (w) => `<div class="input" style="${w ? `width:${w}px;` : ""}height:46px;background:color-mix(in oklab,var(--bg) 8%,transparent);border-color:color-mix(in oklab,var(--bg) 28%,transparent);color:color-mix(in oklab,var(--bg) 60%,transparent);gap:8px">${ic("mail", 16)}you@company.com</div>`;
TPL["cta-banner/web"] = (p, st) => `<section style="padding:56px 64px">
<div class="card feat" style="padding:56px 64px;display:grid;grid-template-columns:1fr auto;gap:48px;align-items:center;background:var(--text);color:var(--bg);border-color:var(--text);position:relative;overflow:hidden">
<div style="display:grid;gap:14px;max-width:700px;position:relative"><h2 style="font-size:${Math.round(42 * st.hscale)}px">Stop finding out about outages from your customers</h2><p style="font-size:16.5px;opacity:.75">Add your first endpoint in two minutes. ${esc(p.name)} starts checking from six regions before you have finished your coffee.</p></div>
<div style="display:grid;gap:12px;position:relative"><div style="display:flex;gap:8px">${darkInput(280)}<button class="btn primary" style="height:46px;padding:0 20px;font-size:14px">Start free ${ic("arrow", 16)}</button></div><div style="display:flex;gap:16px;font-size:12.5px;opacity:.7">${["Free forever for 3 monitors", "No credit card"].map((t) => `<span style="display:flex;gap:5px;align-items:center">${ic("check", 14)}${t}</span>`).join("")}</div><div style="font-size:13px;opacity:.85;display:flex;gap:6px;align-items:center">or <u>book a 20-minute walkthrough</u> with an engineer</div></div></div></section>`;
TPL["cta-banner/mobile"] = (p, st) => `<section style="padding:28px 20px">
<div class="card feat" style="padding:28px 22px;display:grid;gap:16px;background:var(--text);color:var(--bg);border-color:var(--text)">
<h2 style="font-size:${Math.round(28 * st.hscale)}px">Stop finding out about outages from your customers</h2><p style="font-size:15px;opacity:.75">Add your first endpoint in two minutes. ${esc(p.name)} starts checking from six regions right away.</p>
${darkInput(0)}<button class="btn primary block" style="height:46px">Start free ${ic("arrow", 16)}</button>
<div style="display:grid;gap:4px;font-size:12.5px;opacity:.7">${["Free forever for 3 monitors", "No credit card required"].map((t) => `<span style="display:flex;gap:5px;align-items:center">${ic("check", 14)}${t}</span>`).join("")}</div></div></section>`;

// ---- stats-band ---------------------------------------------------------------------------
const STATS = [["48M", "uptime checks run every day"], ["41 s", "average time from failure to alert"], ["6", "check regions on four continents"], ["2,400+", "engineering teams on call with us"]];
TPL["stats-band/web"] = (p, st) => `<section style="padding:64px 64px;display:grid;gap:36px">
<div style="display:flex;justify-content:space-between;align-items:end;gap:40px"><h2 style="font-size:${Math.round(34 * st.hscale)}px;max-width:620px">${esc(p.name)} in numbers</h2><p class="muted" style="font-size:15px;max-width:440px">Live figures from our own status page, updated hourly. We monitor ${esc(p.name)} with ${esc(p.name)}.</p></div>
<div style="display:grid;grid-template-columns:repeat(4,1fr);border-top:2px solid var(--text)">${STATS.map(([v, l], i) => `<div style="padding:24px ${i === 3 ? 0 : 28}px 4px ${i ? 28 : 0}px;${i ? "border-left:1px solid var(--border)" : ""}"><div class="num" style="font-size:60px;letter-spacing:-0.04em">${v}</div><div class="muted" style="font-size:15px;margin-top:6px">${l}</div></div>`).join("")}</div></section>`;
TPL["stats-band/mobile"] = (p, st) => `<section style="padding:36px 20px;display:grid;gap:22px">
<div style="display:grid;gap:8px"><h2 style="font-size:${Math.round(26 * st.hscale)}px">${esc(p.name)} in numbers</h2><p class="muted" style="font-size:14px">Live figures from our own status page, updated hourly.</p></div>
<div style="display:grid;grid-template-columns:1fr 1fr;border-top:2px solid var(--text)">${STATS.map(([v, l], i) => `<div style="padding:18px ${i % 2 ? 0 : 14}px 18px ${i % 2 ? 14 : 0}px;${i % 2 ? "border-left:1px solid var(--border);" : ""}${i > 1 ? "border-top:1px solid var(--border)" : ""}"><div class="num" style="font-size:36px;letter-spacing:-0.04em">${v}</div><div class="muted" style="font-size:13px;margin-top:4px">${l}</div></div>`).join("")}</div></section>`;

// Balance headline wrapping; centre short sections vertically so slack between styles' font metrics is shared top/bottom.
const finish = (fn, centre) => (p, st, rnd) => {
  const html = fn(p, st, rnd).replace(/<(h1|h2) style="/g, '<$1 style="text-wrap:balance;');
  return centre ? `<div style="min-height:100%;display:grid;align-content:center">${html}</div>` : html;
};
const def = (name, shows, elements, key, size) => ({ family: "marketing", type: "section", name, shows, elements,
  web: finish(TPL[key + "/web"], key !== "hero"), mobile: finish(TPL[key + "/mobile"], key !== "hero"), size });
module.exports = {
  "hero": def("Landing page hero", "the site header, a headline with subhead, two CTAs, a social-proof line and an illustrated uptime dashboard with an alert toast",
    ["navigation-header", "hero", "headline", "button", "social-proof", "avatar-stack", "chart", "marketing", "landing-page"], "hero", { web: [1440, 900], mobile: [390, 966] }),
  "feature-grid": def("Feature grid", "a section heading with intro copy and six features, each with an icon, title and description",
    ["feature-grid", "icon", "card", "section-heading", "badge", "marketing", "landing-page"], "feature-grid", { web: [1440, 760], mobile: [390, 1044] }),
  "testimonials": def("Testimonials", "a featured dark quote card with a metric plus two customer quotes with star ratings, names, roles and initials avatars",
    ["testimonial", "quote", "avatar", "rating", "card", "section-heading", "marketing"], "testimonials", { web: [1440, 764], mobile: [390, 922] }),
  "logo-cloud": def("Logo cloud", "a 'trusted by' line above a ruled grid of eight fictional company wordmarks set in type, with a link to customer stories",
    ["logo-cloud", "social-proof", "wordmark", "grid", "link", "marketing"], "logo-cloud", { web: [1440, 406], mobile: [390, 434] }),
  "faq": def("FAQ accordion", "a section heading, six questions with the first expanded, and a contact card for further questions",
    ["accordion", "faq", "section-heading", "card", "avatar", "button", "marketing"], "faq", { web: [1440, 596], mobile: [390, 922] }),
  "cta-banner": def("Call-to-action banner", "a dark end-of-page banner with a headline, subhead, email field, primary CTA and reassurance points",
    ["cta-banner", "dark-card", "email-input", "button", "checklist", "marketing", "landing-page"], "cta-banner", { web: [1440, 422], mobile: [390, 512] }),
  "stats-band": def("Stats band", "a heading with a short line and four large figures with labels for checks, alert time, regions and teams",
    ["stats", "kpi", "section-heading", "divider", "numbers", "marketing"], "stats-band", { web: [1440, 346], mobile: [390, 430] }),
};
