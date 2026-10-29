/* Admin patterns (workspace family): api-keys, audit-log, roles-permissions, integrations. */
const { ICON, ic, sideNav, status } = require("../lib");

Object.assign(ICON, {
  "admin-plug": '<path d="M9 3v5M15 3v5M6 8h12v3a6 6 0 0 1-12 0zM12 17v4"/>',
  "admin-code": '<path d="M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16"/>',
  "admin-hook": '<circle cx="6" cy="17" r="2.5"/><circle cx="18" cy="17" r="2.5"/><circle cx="12" cy="6" r="2.5"/><path d="M10.8 8.2L7.2 14.8M8.5 17h7M13.2 8.2l3.6 6.6"/>',
  "admin-roles": '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.5 3.4-5.5 6.5-5.5 1.6 0 3 .5 4.1 1.4M17.5 13l3.5 1.3v2.6c0 1.9-1.4 3.4-3.5 4.1-2.1-.7-3.5-2.2-3.5-4.1v-2.6z"/>',
  "admin-alert": '<path d="M12 3l9.5 17h-19zM12 10v4.5M12 17.5h.01"/>',
  "admin-copy": '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
});

const TPL = {};
const NAV = [["doc", "Documents"], ["users", "Team"], ["card", "Billing"], ["bell", "Notifications"], ["gear", "Settings"]];
const WS = "Palo Verde Co.";
const MONO = "ui-monospace,'SF Mono',Menlo,Consolas,monospace";
const ini = (n) => n.split(" ").map((w) => w[0]).join("").slice(0, 2);
const crumbs = (...parts) => `<div class="top" style="flex:none">${parts.map((x, i) => i < parts.length - 1 ? `<div class="muted">${x}</div><span class="muted">/</span>` : `<div style="font-weight:500">${x}</div>`).join("")}</div>`;
const shell = (p, top, body) => `<div class="shell">${sideNav(p, "Settings", NAV)}<main class="main">${top}${body}</main></div>`;
const SUB = [["gear", "General"], ["users", "Members"], ["admin-roles", "Roles"], ["shield", "Security"], ["clock", "Audit log"], ["admin-plug", "Integrations"], ["admin-code", "API & webhooks"]];
const subnav = (active) => `<div style="display:grid;gap:2px;align-content:start">${SUB.map(([i, l]) => `<div class="nav${l === active ? " on" : ""}">${ic(i, 16)}${l}</div>`).join("")}</div>`;
const toggle = (on, s = 1) => `<span style="flex:none;width:${38 * s}px;height:${22 * s}px;border-radius:999px;padding:2px;display:flex;${on ? "justify-content:flex-end;background:var(--primary)" : "background:color-mix(in oklab,var(--muted) 35%,var(--surface))"}"><span style="width:${22 * s - 4}px;height:${22 * s - 4}px;border-radius:50%;background:${on ? "var(--on-primary)" : "var(--surface)"};box-shadow:var(--shadow-sm)"></span></span>`;
const mtop = (title, right = '<span style="width:22px"></span>') => `<div class="mtop">${ic("back", 22)}<div style="font-weight:600">${title}</div>${right}</div>`;
const tint = (pct, c = "var(--primary)") => `color-mix(in oklab,${c} ${pct}%,var(--surface))`;
const softBadge = (t) => `<span class="badge" style="background:${tint(14)};color:color-mix(in oklab,var(--primary) 75%,var(--text))">${t}</span>`;
const greyBadge = (t) => `<span class="badge" style="background:color-mix(in oklab,var(--muted) 16%,var(--surface));color:var(--muted)">${t}</span>`;
const warnBadge = (t) => `<span class="badge" style="background:var(--text);color:var(--bg)">${t}</span>`;
const scope = (t) => `<span style="display:inline-flex;align-items:center;height:20px;padding:0 6px;border-radius:var(--radius-sm);border:1px solid var(--border);font:500 11px ${MONO};color:var(--text);white-space:nowrap">${t}</span>`;
const th = (cols, pad = "9px 14px") => `<tr style="background:color-mix(in oklab,var(--bg) 60%,var(--surface))">${cols.map((h) => `<td style="padding:${pad};font-weight:600;font-size:12px;color:var(--muted);white-space:nowrap">${h}</td>`).join("")}</tr>`;

/* ---------------- api-keys ---------------- */
const KEYS = [
  ["Invoice sync (prod)", "fw_live_••••3kQ9", ["tasks:write", "files:read"], "Mara Okafor", "Just now", "new"],
  ["Ops automations", "fw_live_••••a81F", ["tasks:read", "tasks:write"], "Teodora Ruiz", "4 min ago", "active"],
  ["Weekly report script", "fw_live_••••Ld0x", ["docs:read"], "Sam Achebe", "Yesterday", "active"],
  ["Staging test runner", "fw_test_••••9ZpE", ["full access"], "Jonah Weiss", "12 Oct", "active"],
  ["Client portal embed", "fw_live_••••Qw7c", ["files:read"], "Lin Park", "3 Sep", "expiring"],
  ["Old migration key", "fw_live_••••m2Hb", ["full access"], "Mara Okafor", "2 Jun", "revoked"],
];
const keyStatus = (s) => s === "new" ? softBadge("New") : s === "active" ? `<span class="badge">Active</span>` : s === "expiring" ? warnBadge("Expires in 6 days") : greyBadge("Revoked");
const FULL_KEY = "fw_live_7Qx2mVb9Tq4LcH8sNd1RzW6pYe3kQ9";
const reveal = (p, compact) => `<div class="card" style="flex:none;padding:${compact ? "14px" : "16px 18px"};display:grid;gap:${compact ? 10 : 12}px;border-color:var(--primary);background:${tint(6)}">
<div style="display:flex;gap:12px;align-items:${compact ? "start" : "center"}"><span style="flex:none;width:${compact ? 32 : 36}px;height:${compact ? 32 : 36}px;border-radius:var(--radius);display:grid;place-items:center;background:var(--primary);color:var(--on-primary)">${ic("key", 18)}</span><div style="flex:1;min-width:0"><div style="font-weight:600">“Invoice sync (prod)” is ready</div><div class="muted" style="font-size:12px">${compact ? "Scopes: tasks:write, files:read" : `Scopes: tasks:write, files:read · Expires 30 Oct 2027 · Created by Mara Okafor`}</div></div>${compact ? "" : `<button class="btn">Done</button>`}</div>
<div style="display:flex;gap:8px"><div class="input filled" style="flex:1;min-width:0;height:${compact ? 38 : 40}px;font:500 ${compact ? 12 : 13}px ${MONO};background:var(--surface);overflow:hidden;white-space:nowrap">${compact ? "fw_live_7Qx2mVb9Tq4LcH8s…kQ9" : FULL_KEY}</div><button class="btn primary" style="height:${compact ? 38 : 40}px">${ic("admin-copy", 15)}Copy</button></div>
<div style="display:flex;gap:8px;align-items:center;font-size:12px">${ic("admin-alert", 15)}<span><b>Copy this key now.</b> For your security you won’t be able to see it again${compact ? "." : " — if you lose it, revoke it and create a new one."}</span></div></div>`;

TPL["api-keys/web"] = (p) => shell(p, crumbs("Settings", "API & webhooks"), `<div class="page" style="grid-template-columns:184px minmax(0,1fr);gap:28px;padding-top:22px">
${subnav("API & webhooks")}
<div style="display:grid;gap:20px;align-content:start;min-width:0">
<div class="ph" style="display:flex;justify-content:space-between;align-items:end"><div><h1>API keys</h1><p>Keys let scripts and internal tools call the ${p.name} REST API on behalf of ${WS}</p></div><div style="display:flex;gap:8px"><button class="btn">${ic("doc", 15)}API reference</button><button class="btn primary">${ic("plus", 15)}Create key</button></div></div>
${reveal(p, false)}
<div class="card" style="overflow:hidden"><table style="width:100%;border-collapse:collapse;font-size:13px">${th(["Name", "Key", "Scopes", "Created by", "Last used", "Status", ""])}
${KEYS.map(([n, k, sc, by, last, s]) => `<tr style="border-top:1px solid var(--border);${s === "revoked" ? "opacity:.55" : ""}${s === "new" ? `background:${tint(5)}` : ""}"><td style="padding:12px 14px;font-weight:500;white-space:nowrap">${n}</td><td style="padding:12px 14px;font:12px ${MONO};white-space:nowrap" class="muted">${k}</td><td style="padding:12px 14px"><div style="display:flex;gap:4px">${sc.map(scope).join("")}</div></td>
<td style="padding:12px 14px;white-space:nowrap"><div style="display:flex;gap:8px;align-items:center"><div class="avatar" style="width:24px;height:24px;font-size:10px">${ini(by)}</div>${by}</div></td><td style="padding:12px 14px;white-space:nowrap" class="muted">${last}</td><td style="padding:12px 14px;white-space:nowrap">${keyStatus(s)}</td><td style="padding:12px 14px;text-align:right;white-space:nowrap" class="muted">${s === "revoked" ? "" : `<span style="font-weight:500;color:var(--text);margin-right:10px">${s === "expiring" ? "Rotate" : "Revoke"}</span>`}${ic("more", 16)}</td></tr>`).join("")}</table></div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
<div class="card" style="padding:16px 18px;display:grid;gap:10px;align-content:start"><div style="display:flex;justify-content:space-between;align-items:center"><div style="display:flex;gap:10px;align-items:center">${ic("admin-hook", 18)}<div style="font-weight:600">Webhooks</div></div><span style="color:var(--primary);font-weight:500;font-size:13px;display:flex;gap:4px;align-items:center">Manage webhooks ${ic("arrow", 14)}</span></div>
<div style="display:flex;gap:18px;font-size:13px"><span><b>3</b> <span class="muted">endpoints</span></span><span><b>2</b> <span class="muted">healthy</span></span><span><b>1</b> <span class="muted">failing since 09:12</span></span></div>
<div style="display:flex;gap:8px;align-items:center;font-size:12px;padding:8px 10px;border-radius:var(--radius);background:color-mix(in oklab,var(--muted) 10%,var(--surface))"><span style="font-family:${MONO}">hooks.paloverde.co/fernway</span><span class="muted" style="margin-left:auto">410 Gone · 14 retries queued</span></div></div>
<div class="card" style="padding:16px 18px;display:grid;gap:10px;align-content:start"><div style="display:flex;justify-content:space-between;align-items:center"><div style="font-weight:600">Usage this hour</div><span class="muted" style="font-size:12px">Resets at 11:00</span></div>
<div style="display:flex;justify-content:space-between;align-items:baseline"><span><span class="num" style="font-size:22px">1,284</span><span class="muted" style="font-size:13px"> / 5,000 requests</span></span><span class="muted" style="font-size:12px">26%</span></div>
<div style="height:6px;border-radius:9px;background:${tint(14)}"><div style="width:26%;height:100%;border-radius:9px;background:var(--primary)"></div></div>
<div class="muted" style="font-size:12px">Limits: 5,000 requests per hour per workspace, 100 per key per minute. Over-limit calls return 429.</div></div></div>
</div></div>`);

TPL["api-keys/mobile"] = (p) => `<div class="phone">${status()}${mtop("API keys", `<span style="color:var(--primary)">${ic("plus", 22)}</span>`)}
<div class="mbody" style="gap:12px">${reveal(p, true)}
<div style="display:flex;justify-content:space-between;align-items:center"><div style="font-weight:600">Keys</div><span class="muted" style="font-size:12px">5 active · 1 revoked</span></div>
<div class="card" style="flex:none">${KEYS.slice(1, 5).map(([n, k, sc, by, last, s], i) => `<div style="display:flex;gap:12px;align-items:center;padding:10px 14px;${i ? "border-top:1px solid var(--border)" : ""}"><span style="flex:none;width:32px;height:32px;border-radius:var(--radius);display:grid;place-items:center;background:${tint(12)};color:var(--primary)">${ic("key", 16)}</span><div style="flex:1;min-width:0"><div style="font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${n}</div><div class="muted" style="font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis"><span style="font-family:${MONO}">${k.replace("fw_live_", "").replace("fw_test_", "test ")}</span> · ${sc.join(", ")}</div><div class="muted" style="font-size:12px">${by} · used ${last.toLowerCase()}</div></div>${s === "expiring" ? warnBadge("6 days") : `<span class="badge">Active</span>`}</div>`).join("")}</div>
<div class="card" style="flex:none;padding:12px 14px;display:grid;gap:8px"><div style="display:flex;justify-content:space-between;font-size:13px"><span style="font-weight:500">Requests this hour</span><span><b>1,284</b> <span class="muted">/ 5,000</span></span></div><div style="height:6px;border-radius:9px;background:${tint(14)}"><div style="width:26%;height:100%;border-radius:9px;background:var(--primary)"></div></div><div class="muted" style="font-size:12px">100 requests per key per minute</div></div>
<div class="card" style="flex:none;padding:0 14px;height:50px;display:flex;align-items:center;gap:12px">${ic("admin-hook", 18)}<span style="flex:1;font-weight:500">Webhooks</span>${warnBadge("1 failing")}<span class="muted" style="display:flex">${ic("chevron", 16)}</span></div></div></div>`;

/* ---------------- audit-log ---------------- */
const EV = [
  ["Today"],
  ["Mara Okafor", "Changed role", "Teodora Ruiz · Member → Admin", "81.2.69.142", "London, UK", "10:42", "perm"],
  ["Sam Achebe", "Signed in", "Authenticator app (2FA)", "92.40.12.8", "Bristol, UK", "10:15", "auth"],
  ["Ops automations", "Created 48 tasks", "Operations / Intake", "34.89.110.5", "Frankfurt, DE", "09:58", "api"],
  ["Priya Nair", "Downloaded file", "Brand_guidelines_v3.pdf", "103.6.150.21", "Singapore", "09:31", "file"],
  ["Jonah Weiss", "Created public link", "Q4 offsite plan", "86.12.200.3", "Manchester, UK", "08:47", "share"],
  ["Unknown", "Failed sign-in ×3", "lin.park@paloverde.co", "185.220.101.4", "Location hidden", "07:12", "flag"],
  ["Yesterday"],
  ["Mara Okafor", "Exported data", "All tasks · CSV · 1,284 rows", "81.2.69.142", "London, UK", "17:20", "file"],
  ["Teodora Ruiz", "Removed member", "Dele Mensah", "81.2.69.150", "London, UK", "15:04", "perm"],
  ["Mara Okafor", "Enforced SSO", "Workspace security policy", "81.2.69.142", "London, UK", "11:36", "auth"],
  ["Lin Park", "Revoked API key", "Old migration key", "92.40.18.77", "Bristol, UK", "09:02", "api"],
];
const EVIC = { perm: "admin-roles", auth: "lock", api: "admin-code", file: "download", share: "link", flag: "admin-alert" };
const actorAv = (n, s = 28) => n === "Unknown" ? `<div class="avatar" style="width:${s}px;height:${s}px;background:var(--text);color:var(--bg)">?</div>` : n === "Ops automations" ? `<div class="avatar" style="width:${s}px;height:${s}px;border-radius:var(--radius-sm)">${ic("key", 14)}</div>` : `<div class="avatar" style="width:${s}px;height:${s}px;font-size:${s < 28 ? 10 : 11}px">${ini(n)}</div>`;
const ECHIPS = [["All events", "412"], ["Sign-ins", "138"], ["Permissions", "21"], ["Sharing", "64"], ["Files", "97"], ["API", "86"], ["Billing", "6"]];
const echip = (t, n, on, small) => `<span style="flex:none;display:inline-flex;align-items:center;gap:6px;height:${small ? 30 : 30}px;padding:0 ${small ? 11 : 12}px;border-radius:999px;font-size:13px;font-weight:500;white-space:nowrap;${on ? "background:var(--text);color:var(--bg)" : "border:1px solid var(--border);background:var(--surface)"}">${t}${n ? `<span style="opacity:.6;font-size:12px">${n}</span>` : ""}</span>`;

TPL["audit-log/web"] = (p) => shell(p, crumbs("Settings", "Security", "Audit log"), `<div style="flex:1;min-height:0;display:grid;grid-template-columns:minmax(0,1fr) 352px">
<div class="page" style="padding:22px 24px 24px 28px;gap:16px;min-width:0">
<div class="ph" style="display:flex;justify-content:space-between;align-items:end"><div><h1>Audit log</h1><p>Sign-ins, permission changes, sharing and exports across ${WS} — kept for 12 months.</p></div><div style="display:flex;gap:8px"><button class="btn">${ic("calendar", 15)}1 Oct – 30 Oct 2026${ic("chevdown", 14)}</button><button class="btn primary">${ic("download", 15)}Export CSV</button></div></div>
<div style="display:flex;gap:8px;align-items:center"><div class="input" style="width:300px;height:34px;gap:8px;font-size:13px">${ic("search", 15)}Search actor, action, target or IP</div><span class="btn" style="height:34px">${ic("users", 15)}Any member${ic("chevdown", 14)}</span><span class="btn" style="height:34px">${ic("globe", 15)}Any location${ic("chevdown", 14)}</span></div>
<div style="display:flex;gap:6px">${ECHIPS.map(([t, n], i) => echip(t, n, i === 0)).join("")}</div>
<div class="card" style="overflow:hidden"><table style="width:100%;border-collapse:collapse;font-size:13px">${th(["Actor", "Action", "Target", "IP / location", "Time"], "8px 14px")}
${EV.map((e) => e.length === 1 ? `<tr style="border-top:1px solid var(--border)"><td colspan="5" style="padding:6px 14px;font:600 11px var(--font-b);letter-spacing:.06em;text-transform:uppercase;color:var(--muted);background:color-mix(in oklab,var(--bg) 40%,var(--surface))">${e[0]}</td></tr>` : (([a, act, tgt, ip, loc, t, k]) => {
    const sel = act === "Changed role";
    return `<tr style="border-top:1px solid var(--border);${sel ? `background:${tint(9)};box-shadow:inset 3px 0 0 var(--primary)` : ""}"><td style="padding:7px 14px;white-space:nowrap"><div style="display:flex;gap:9px;align-items:center">${actorAv(a, 26)}<span style="font-weight:500">${a}</span></div></td>
<td style="padding:7px 14px;white-space:nowrap"><div style="display:flex;gap:7px;align-items:center"><span style="display:flex;color:${k === "flag" ? "var(--text)" : "var(--muted)"}">${ic(EVIC[k], 15)}</span><span style="${k === "flag" ? "font-weight:600" : ""}">${act}</span></div></td>
<td style="padding:7px 14px;max-width:190px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${tgt}</td><td style="padding:7px 14px;white-space:nowrap"><div style="font:12px ${MONO}">${ip}</div><div class="muted" style="font-size:11px;line-height:1.3">${loc}</div></td><td style="padding:7px 14px;white-space:nowrap" class="muted">${t}</td></tr>`;
  })(e)).join("")}</table></div>
<div style="display:flex;justify-content:space-between;align-items:center;font-size:13px" class="muted"><span>Showing 10 of 412 events</span><div style="display:flex;gap:6px"><span class="btn" style="height:30px">Previous</span><span class="btn" style="height:30px">Next</span></div></div></div>
<aside style="border-left:1px solid var(--border);background:var(--surface);padding:20px 22px;display:flex;flex-direction:column;gap:16px;min-height:0">
<div style="display:flex;justify-content:space-between;align-items:center"><div class="muted" style="font:600 11px var(--font-b);letter-spacing:.06em;text-transform:uppercase">Event detail</div><span class="muted">${ic("x", 18)}</span></div>
<div style="display:flex;gap:12px;align-items:center"><span style="width:40px;height:40px;border-radius:var(--radius);display:grid;place-items:center;background:${tint(14)};color:var(--primary)">${ic("admin-roles", 20)}</span><div><div style="font-weight:600;font-size:16px">Changed role</div><div class="muted" style="font-size:12px">Today at 10:42:17 BST</div></div></div>
<div style="display:grid;gap:8px;padding:12px;border-radius:var(--radius);border:1px solid var(--border)"><div class="muted" style="font-size:12px">Teodora Ruiz’s role</div><div style="display:flex;align-items:center;gap:10px">${greyBadge("Member")}<span class="muted" style="display:flex">${ic("arrow", 15)}</span>${softBadge("Admin")}</div><div class="muted" style="font-size:12px">Gains billing, integrations and audit log access</div></div>
<div style="display:grid;gap:10px;font-size:13px">${[["Actor", `<span style="display:flex;gap:8px;align-items:center">${actorAv("Mara Okafor", 22)}Mara Okafor <span class="muted">(Owner)</span></span>`], ["Target", "Teodora Ruiz"], ["IP address", `<span style="font-family:${MONO};font-size:12px">81.2.69.142</span>`], ["Location", "London, United Kingdom"], ["Device", "Chrome 130 on macOS"], ["Session", "Signed in 08:02 with SSO"]].map(([k, v]) => `<div style="display:grid;grid-template-columns:86px 1fr;gap:10px;align-items:center"><span class="muted">${k}</span><span>${v}</span></div>`).join("")}</div>
<div style="display:grid;gap:6px"><div class="muted" style="font-size:12px">Raw event</div><pre style="margin:0;padding:10px 12px;border-radius:var(--radius);background:color-mix(in oklab,var(--muted) 10%,var(--surface));font:11.5px/1.55 ${MONO};white-space:pre;overflow:hidden">{
  "id": "evt_01JBX4Q7M2RZ",
  "type": "member.role_changed",
  "actor": "usr_mara_okafor",
  "target": "usr_teodora_ruiz",
  "from": "member", "to": "admin"
}</pre></div>
<div style="display:grid;gap:8px"><div class="muted" style="font-size:12px">Related events</div>${[["Teodora Ruiz", "Opened Billing settings", "10:46"], ["Teodora Ruiz", "Connected Forms & surveys (requested)", "10:51"]].map(([a, t, h]) => `<div style="display:flex;gap:10px;align-items:center;font-size:13px">${actorAv(a, 22)}<span style="flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${t}</span><span class="muted" style="font-size:12px">${h}</span></div>`).join("")}</div>
<div style="margin-top:auto;display:grid;gap:8px"><button class="btn">${ic("admin-copy", 15)}Copy event ID</button><button class="btn">${ic("clock", 15)}All activity by Mara Okafor</button></div></aside></div>`);

TPL["audit-log/mobile"] = (p) => `<div class="phone">${status()}${mtop("Audit log", `<span>${ic("download", 20)}</span>`)}
<div class="mbody" style="gap:12px"><div class="input" style="flex:none;height:40px;gap:8px">${ic("search", 16)}Search actor, action or IP</div>
<div style="display:flex;gap:6px;overflow:hidden;flex:none;margin-right:-20px">${ECHIPS.slice(0, 5).map(([t, n], i) => echip(t, i ? "" : n, i === 0, true)).join("")}</div>
<div style="display:flex;justify-content:space-between;align-items:center;font-size:13px;flex:none"><span class="btn" style="height:32px">${ic("calendar", 15)}Last 30 days${ic("chevdown", 14)}</span><span class="muted">412 events</span></div>
${["Today", "Yesterday"].map((g) => {
    const start = EV.findIndex((e) => e[0] === g), rows = EV.slice(start + 1).filter((_, i, a) => a.slice(0, i + 1).every((x) => x.length > 1)).slice(0, g === "Today" ? 6 : 2);
    return `<div style="display:grid;gap:6px;flex:none"><div class="muted" style="font:600 11px var(--font-b);letter-spacing:.06em;text-transform:uppercase;padding:0 4px">${g}</div><div class="card">${rows.map(([a, act, tgt, ip, loc, t, k], i) => `<div style="display:flex;gap:11px;align-items:center;padding:9px 14px;${i ? "border-top:1px solid var(--border)" : ""}">${actorAv(a, 32)}<div style="flex:1;min-width:0"><div style="font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis"><b style="font-weight:600">${a}</b> <span style="${k === "flag" ? "font-weight:600" : ""}">${act.toLowerCase()}</span></div><div class="muted" style="font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${tgt} · ${loc}</div></div><span class="muted" style="font-size:12px">${t}</span></div>`).join("")}</div></div>`;
  }).join("")}</div></div>`;

/* ---------------- roles-permissions ---------------- */
const ROLES = [["Owner", 1, "Full control, including billing and deleting the workspace", false], ["Admin", 2, "Manage members, integrations and security settings", false],
  ["Member", 9, "Create and edit tasks, docs and files in their teams", false], ["Guest", 4, "View and comment on projects they’re invited to", false],
  ["Project lead", 3, "Members who also run projects and invite clients", true]];
const RCOL = ["Owner", "Admin", "Member", "Guest", "Project lead"];
// value per role column: 1 = on, 0 = off, 2 = changed on (unsaved), 3 = changed off (unsaved)
const PERMS = [
  ["Tasks", [["Create and edit tasks", "", [1, 1, 1, 0, 1]], ["Delete tasks", "Moves to trash for 30 days", [1, 1, 1, 0, 1]], ["Create and archive projects", "", [1, 1, 0, 0, 2]]]],
  ["Docs and files", [["Edit docs", "", [1, 1, 1, 0, 1]], ["Create public share links", "Anyone with the link can view", [1, 1, 0, 0, 2]], ["Download and export", "", [1, 1, 1, 1, 1]]]],
  ["People", [["Invite members", "", [1, 1, 0, 0, 0]], ["Invite guests", "Guests are free on the Team plan", [1, 1, 1, 0, 2]], ["Change member roles", "", [1, 1, 0, 0, 0]]]],
  ["Workspace", [["Manage integrations", "", [1, 1, 0, 0, 0]], ["View audit log", "", [1, 1, 0, 0, 3]], ["Manage billing and plan", "", [1, 0, 0, 0, 0]]]],
];
const box = (v, locked, s = 18) => {
  const on = v === 1 || v === 2, ch = v >= 2;
  const fill = locked ? "color-mix(in oklab,var(--muted) 45%,var(--surface))" : "var(--primary)";
  return `<span style="position:relative;display:inline-grid;place-items:center;width:${s}px;height:${s}px;border-radius:var(--radius-sm);${on ? `background:${fill};color:var(--on-primary)` : "border:1.5px solid color-mix(in oklab,var(--muted) 60%,var(--surface));background:var(--surface)"}">${on ? ic("check", s - 4) : ""}${ch ? `<span style="position:absolute;top:-4px;right:-4px;width:8px;height:8px;border-radius:50%;background:var(--accent);box-shadow:0 0 0 2px var(--surface)"></span>` : ""}</span>`;
};
const stack = (n) => ["Hana Ito", "Sam Achebe", "Jonah Weiss", "Lin Park"].slice(0, n).map((x, i) => `<div class="avatar" style="width:22px;height:22px;font-size:9px;${i ? "margin-left:-6px;" : ""}box-shadow:0 0 0 2px var(--surface)">${ini(x)}</div>`).join("");
const unsaved = (mobile) => `<div style="${mobile ? "flex:none;margin:0 12px 30px" : "position:absolute;left:50%;bottom:22px;transform:translateX(-50%);width:640px"};display:flex;align-items:center;gap:12px;padding:${mobile ? "10px 10px 10px 14px" : "10px 10px 10px 18px"};border-radius:var(--radius-lg);background:var(--text);color:var(--bg);box-shadow:var(--shadow-lg)" class="feat"><span style="width:8px;height:8px;border-radius:50%;background:var(--accent);flex:none"></span><span style="flex:1;font-size:13px">${mobile ? "4 unsaved changes" : "4 unsaved changes to <b>Project lead</b> · affects 3 members"}</span>${mobile ? "" : `<button class="btn" style="background:transparent;border-color:color-mix(in oklab,var(--bg) 35%,transparent);color:var(--bg)">Discard</button>`}<button class="btn primary">Save${mobile ? "" : " changes"}</button></div>`;

TPL["roles-permissions/web"] = (p, st) => shell(p, crumbs("Settings", "Roles & permissions"), `<div style="flex:1;min-height:0;position:relative"><div class="page" style="grid-template-columns:184px 280px minmax(0,1fr);gap:24px;padding-top:22px">
${subnav("Roles")}
<div style="display:grid;gap:10px;align-content:start"><div style="display:flex;justify-content:space-between;align-items:center;padding:4px 2px 2px"><div class="h" style="font-size:${Math.round(18 * st.hscale)}px">Roles</div><span style="color:var(--primary);font-weight:500;font-size:13px;display:flex;gap:4px;align-items:center">${ic("plus", 14)}New role</span></div>
${ROLES.map(([n, c, d, custom]) => { const on = n === "Project lead"; return `<div class="card" style="padding:12px 14px;display:grid;gap:6px;${on ? `border-color:var(--primary);box-shadow:0 0 0 1px var(--primary);background:${tint(6)}` : ""}"><div style="display:flex;align-items:center;gap:8px"><span style="font-weight:600">${n}</span>${custom ? softBadge("Custom") : ""}${n === "Owner" ? `<span class="muted" style="display:flex">${ic("lock", 13)}</span>` : ""}<span class="muted" style="margin-left:auto;font-size:12px">${c} ${c === 1 ? "member" : "members"}</span></div><div class="muted" style="font-size:12px;line-height:1.4">${d}</div>${on ? `<div style="display:flex;align-items:center;margin-top:2px">${stack(3)}<span class="muted" style="font-size:12px;margin-left:8px">Hana, Sam, Jonah</span></div>` : ""}</div>`; }).join("")}
<div class="muted" style="font-size:12px;padding:2px 4px">Owner permissions can’t be changed. Custom roles are on the Team plan.</div></div>
<div style="display:grid;gap:14px;align-content:start;min-width:0">
<div class="ph" style="display:flex;justify-content:space-between;align-items:end"><div><h1>Project lead</h1><p>Based on Member · edited by ${"Mara Okafor"} on 28 Oct</p></div><div style="display:flex;gap:8px"><button class="btn">Duplicate</button><button class="btn">${ic("trash", 15)}Delete role</button></div></div>
<div class="card" style="overflow:hidden"><table style="width:100%;border-collapse:collapse;font-size:13px"><tr style="background:color-mix(in oklab,var(--bg) 60%,var(--surface))"><td style="padding:9px 16px;font-weight:600;font-size:12px;color:var(--muted)">Capability</td>${RCOL.map((r) => `<td style="padding:9px 6px;width:84px;text-align:center;font-weight:600;font-size:12px;${r === "Project lead" ? `color:var(--text);background:${tint(12)}` : "color:var(--muted)"}">${r}</td>`).join("")}</tr>
${PERMS.map(([g, rows]) => `<tr style="border-top:1px solid var(--border)"><td colspan="6" style="padding:7px 16px 3px;font:600 11px var(--font-b);letter-spacing:.06em;text-transform:uppercase;color:var(--muted)">${g}</td></tr>
${rows.map(([cap, note, vals]) => `<tr><td style="padding:5px 16px;white-space:nowrap">${cap}${note ? ` <span class="muted" style="font-size:12px">· ${note}</span>` : ""}</td>${vals.map((v, j) => `<td style="padding:5px 6px;text-align:center;${j === 4 ? `background:${tint(6)}` : ""}">${box(v, j === 0)}</td>`).join("")}</tr>`).join("")}`).join("")}</table></div>
<div class="muted" style="font-size:12px;display:flex;gap:16px;align-items:center"><span style="display:flex;gap:6px;align-items:center">${box(1, false, 14)}Allowed</span><span style="display:flex;gap:6px;align-items:center">${box(2, false, 14)}Unsaved change</span><span style="display:flex;gap:6px;align-items:center">${box(1, true, 14)}Locked</span></div>
</div></div>${unsaved(false)}</div>`);

TPL["roles-permissions/mobile"] = (p, st) => `<div class="phone">${status()}${mtop("Roles & permissions")}
<div class="mbody" style="gap:12px;padding-bottom:12px"><div style="display:flex;gap:6px;overflow:hidden;flex:none;margin-right:-20px">${["Project lead", "Owner", "Admin", "Member", "Guest"].map((r, i) => echip(r, "", i === 0, true)).join("")}</div>
<div class="card" style="flex:none;padding:14px;display:grid;gap:8px"><div style="display:flex;align-items:center;gap:8px"><span class="h" style="font-size:${Math.round(18 * st.hscale)}px">Project lead</span>${softBadge("Custom")}</div><div class="muted" style="font-size:12px;line-height:1.4">Members who also run projects and invite clients. Based on Member.</div><div style="display:flex;align-items:center">${stack(3)}<span class="muted" style="font-size:12px;margin-left:8px">3 members</span><span style="margin-left:auto;color:var(--primary);font-weight:500;font-size:13px">Edit</span></div></div>
${PERMS.slice(0, 3).map(([g, rows]) => `<div style="display:grid;gap:6px;flex:none"><div class="muted" style="font:600 11px var(--font-b);letter-spacing:.06em;text-transform:uppercase;padding:0 4px">${g}</div><div class="card">${rows.map(([cap, , vals], i) => `<div style="display:flex;align-items:center;gap:10px;padding:0 14px;height:42px;${i ? "border-top:1px solid var(--border)" : ""}"><span style="flex:1;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${cap}</span>${vals[4] >= 2 ? `<span style="width:7px;height:7px;border-radius:50%;background:var(--accent)"></span>` : ""}${toggle(vals[4] === 1 || vals[4] === 2, 0.9)}</div>`).join("")}</div></div>`).join("")}
</div>${unsaved(true)}</div>`;

/* ---------------- integrations ---------------- */
// Generic token-coloured logo marks (no real brands): tile background + simple SVG glyph.
const MARKS = {
  cal: ["var(--primary)", "var(--on-primary)", '<rect x="5" y="7" width="22" height="20" rx="3" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M5 13h22" stroke="currentColor" stroke-width="2.4"/><rect x="10" y="17" width="5" height="5" rx="1" fill="currentColor"/><path d="M11 4v5M21 4v5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>'],
  git: ["var(--text)", "var(--bg)", '<circle cx="10" cy="8" r="3.2" fill="currentColor"/><circle cx="10" cy="24" r="3.2" fill="currentColor"/><circle cx="22" cy="13" r="3.2" fill="currentColor"/><path d="M10 11v10M22 16c0 4-5 4-11 6" fill="none" stroke="currentColor" stroke-width="2.4"/>'],
  chat: ["var(--accent)", "var(--surface)", '<path d="M6 8a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3h-8l-6 5v-5a3 3 0 0 1-3-3z" fill="currentColor"/><circle cx="12" cy="13" r="1.6" fill="var(--accent)"/><circle cx="16" cy="13" r="1.6" fill="var(--accent)"/><circle cx="20" cy="13" r="1.6" fill="var(--accent)"/>'],
  cloud: ["color-mix(in oklab,var(--primary) 18%,var(--surface))", "var(--primary)", '<path d="M10 24a5.5 5.5 0 0 1-.6-11A7.5 7.5 0 0 1 24 12.5a5.8 5.8 0 0 1-.5 11.5z" fill="currentColor"/>'],
  sso: ["color-mix(in oklab,var(--text) 86%,var(--primary))", "var(--bg)", '<path d="M16 4l10 4v7c0 6-4.3 10.6-10 12-5.7-1.4-10-6-10-12V8z" fill="none" stroke="currentColor" stroke-width="2.4"/><circle cx="16" cy="14" r="3" fill="currentColor"/><path d="M16 17v5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>'],
  mail: ["color-mix(in oklab,var(--accent) 20%,var(--surface))", "color-mix(in oklab,var(--accent) 70%,var(--text))", '<rect x="5" y="8" width="22" height="16" rx="2.5" fill="currentColor"/><path d="M6 10l10 7 10-7" fill="none" stroke="var(--surface)" stroke-width="2.2"/>'],
  time: ["var(--primary)", "var(--on-primary)", '<circle cx="16" cy="17" r="9" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M16 12v5l3.5 2.5M13 4h6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>'],
  video: ["color-mix(in oklab,var(--muted) 18%,var(--surface))", "var(--text)", '<rect x="4" y="9" width="17" height="14" rx="3" fill="currentColor"/><path d="M22 14l6-4v12l-6-4z" fill="currentColor"/>'],
  form: ["var(--accent)", "var(--surface)", '<rect x="7" y="5" width="18" height="22" rx="2.5" fill="currentColor"/><path d="M11 11h10M11 16h10M11 21h6" stroke="var(--accent)" stroke-width="2.2" stroke-linecap="round"/>'],
};
const mark = (k, s = 40) => { const [bg, fg, svg] = MARKS[k]; return `<span style="flex:none;width:${s}px;height:${s}px;border-radius:var(--radius);display:grid;place-items:center;background:${bg};color:${fg}"><svg width="${Math.round(s * 0.62)}" height="${Math.round(s * 0.62)}" viewBox="0 0 32 32" aria-hidden="true">${svg}</svg></span>`; };
const APPS = [
  ["chat", "Chat notifications", "Post task updates and mentions to team channels", "Communication", "on", "Mara Okafor · 3 Oct"],
  ["cal", "Calendar sync", "Two-way sync of due dates with team calendars", "Calendar", "on", "Teodora Ruiz · 19 Sep"],
  ["git", "Git provider", "Link commits and pull requests to tasks", "Developer", "on", "Jonah Weiss · 2 Aug"],
  ["cloud", "Cloud storage", "Attach and preview files from shared drives", "Storage", "on", "Mara Okafor · 14 Jul"],
  ["sso", "SSO / SAML", "Single sign-on and automatic provisioning", "Security", "off", "Team plan and above"],
  ["mail", "Email to task", "Forward emails to a project inbox address", "Communication", "off", "Free"],
  ["time", "Time tracking", "Start timers on tasks and export timesheets", "Productivity", "off", "Free"],
  ["video", "Video meetings", "Add a meeting room link to any task or doc", "Communication", "off", "Free"],
  ["form", "Forms & surveys", "Turn form responses into new tasks", "Productivity", "pending", "Awaiting approval"],
];
const ICATS = [["All", "9"], ["Connected", "4"], ["Communication", ""], ["Calendar", ""], ["Developer", ""]];
const appState = (s) => s === "on" ? `<span class="badge" style="flex:none">${ic("check", 12)}&nbsp;Connected</span>` : s === "pending" ? `<span style="flex:none;display:flex">${greyBadge("Requested")}</span>` : `<button class="btn" style="height:30px">Connect</button>`;

TPL["integrations/web"] = (p) => shell(p, crumbs("Settings", "Integrations"), `<div style="flex:1;min-height:0;display:grid;grid-template-columns:minmax(0,1fr) 380px">
<div class="page" style="padding:22px 24px 24px 28px;gap:16px;min-width:0">
<div class="ph" style="display:flex;justify-content:space-between;align-items:end"><div><h1>Integrations</h1><p>Connect the tools ${WS} already uses: 4 connected, 1 waiting for approval.</p></div><button class="btn">${ic("admin-code", 15)}Build your own</button></div>
<div style="display:flex;gap:8px;align-items:center"><div class="input" style="width:220px;flex:none;height:34px;gap:8px;font-size:13px;white-space:nowrap">${ic("search", 15)}Search integrations</div><div style="display:flex;gap:6px">${ICATS.map(([t, n], i) => echip(t, n, i === 0)).join("")}</div></div>
<div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px">${APPS.map(([k, n, d, cat, s, meta]) => { const sel = k === "chat"; return `<div class="card" style="padding:16px;display:grid;gap:12px;align-content:start;min-width:0;overflow:hidden;${sel ? "border-color:var(--primary);box-shadow:0 0 0 1px var(--primary)" : ""}">
<div style="display:flex;gap:12px;align-items:start">${mark(k)}<div style="flex:1;min-width:0"><div style="font-weight:600">${n}</div><div class="muted" style="font-size:12px">${cat}</div></div>${s === "on" ? `<span class="muted" style="display:flex">${ic("gear", 16)}</span>` : ""}</div>
<div style="font-size:13px;line-height:1.45;min-height:38px">${d}</div>
<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;border-top:1px solid var(--border);padding-top:10px;min-height:41px"><span class="muted" style="flex:1;min-width:0;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${s === "on" ? meta : meta}</span>${appState(s)}</div></div>`; }).join("")}</div>
<div class="card" style="padding:14px 18px;display:flex;align-items:center;gap:14px;box-shadow:none;border-style:dashed"><span style="flex:none;width:36px;height:36px;border-radius:var(--radius);display:grid;place-items:center;background:${tint(10)};color:var(--primary)">${ic("admin-code", 18)}</span><div style="flex:1"><div style="font-weight:600">Don’t see your tool?</div><div class="muted" style="font-size:12px">Use webhooks and the REST API, or tell us what to build next. 38 requests this month.</div></div><button class="btn">Request an integration</button></div></div>
<aside style="border-left:1px solid var(--border);background:var(--surface);padding:20px 22px;display:flex;flex-direction:column;gap:16px;min-height:0">
<div style="display:flex;gap:12px;align-items:center">${mark("chat", 44)}<div style="flex:1"><div style="font-weight:600;font-size:16px">Chat notifications</div><div class="muted" style="font-size:12px">Connected by Mara Okafor on 3 Oct</div></div><span class="muted">${ic("x", 18)}</span></div>
<div style="display:flex;gap:8px;align-items:center;font-size:12px;padding:8px 10px;border-radius:var(--radius);background:${tint(8, "var(--accent)")}">${ic("check", 14)}<span>Delivered 312 messages this week · last 4 min ago</span></div>
<div style="display:grid;gap:8px"><div style="font-weight:600;font-size:13px">Channel mapping</div>${[["Operations", "#ops-updates"], ["Client services", "#client-desk"], ["Launch squad", "#launch-q4"]].map(([t, c]) => `<div style="display:grid;grid-template-columns:1fr 16px 1fr;gap:8px;align-items:center;font-size:13px"><div class="input filled" style="height:34px;font-size:13px">${t}</div><span class="muted" style="display:flex">${ic("arrow", 15)}</span><div class="input filled" style="height:34px;font-size:13px;justify-content:space-between;font-family:${MONO};font-size:12px">${c}<span class="muted">${ic("chevdown", 14)}</span></div></div>`).join("")}<span style="color:var(--primary);font-weight:500;font-size:13px;display:flex;gap:4px;align-items:center">${ic("plus", 14)}Map another team</span></div>
<div style="display:grid;gap:2px"><div style="font-weight:600;font-size:13px;margin-bottom:4px">Send a message when</div>${[["A task is assigned to someone", true], ["Someone is @mentioned", true], ["A task is due tomorrow", true], ["A file is uploaded", false], ["A doc is published", false]].map(([t, on]) => `<div style="display:flex;align-items:center;gap:12px;padding:6px 0;font-size:13px"><span style="flex:1">${t}</span>${toggle(on, 0.85)}</div>`).join("")}</div>
<div style="display:grid;gap:8px"><div style="font-weight:600;font-size:13px">Access granted</div>${[["eye", "Read task titles, assignees and due dates"], ["send", "Post messages as the " + p.name + " bot"], ["lock", "No access to doc contents or files"]].map(([i, t]) => `<div style="display:flex;gap:10px;align-items:center;font-size:13px"><span class="muted" style="display:flex">${ic(i, 15)}</span>${t}</div>`).join("")}</div>
<div style="margin-top:auto;display:grid;grid-template-columns:1fr 1fr;gap:8px"><button class="btn">${ic("send", 15)}Send test</button><button class="btn">Disconnect</button></div></aside></div>`);

TPL["integrations/mobile"] = (p) => `<div class="phone">${status()}${mtop("Integrations", `<span>${ic("search", 20)}</span>`)}
<div class="mbody" style="gap:12px"><div class="muted" style="font-size:13px;flex:none">4 connected to ${WS}</div>
<div class="card" style="flex:none">${APPS.filter((a) => a[4] === "on").map(([k, n, d, cat, s, meta], i) => `<div style="display:flex;gap:12px;align-items:center;padding:10px 14px;${i ? "border-top:1px solid var(--border)" : ""}">${mark(k, 36)}<div style="flex:1;min-width:0"><div style="font-weight:500">${n}</div><div class="muted" style="font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${k === "chat" ? "3 channels · 312 messages this week" : k === "cal" ? "Syncing 41 due dates" : k === "git" ? "2 repositories linked" : "Shared drive “Clients”"}</div></div><span class="muted" style="display:flex">${ic("chevron", 16)}</span></div>`).join("")}</div>
<div style="display:flex;justify-content:space-between;align-items:center;flex:none"><div style="font-weight:600">Available</div><span class="muted" style="font-size:13px">Browse all</span></div>
<div class="card" style="flex:none">${APPS.filter((a) => a[4] !== "on").map(([k, n, d, cat, s], i) => `<div style="display:flex;gap:12px;align-items:center;padding:10px 14px;${i ? "border-top:1px solid var(--border)" : ""}">${mark(k, 36)}<div style="flex:1;min-width:0"><div style="font-weight:500">${n}</div><div class="muted" style="font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${d}</div></div>${s === "pending" ? greyBadge("Requested") : `<button class="btn" style="height:30px;padding:0 12px">Connect</button>`}</div>`).join("")}</div>
<div class="card" style="flex:none;padding:12px 14px;display:flex;align-items:center;gap:12px;box-shadow:none;border-style:dashed"><span style="flex:none;width:36px;height:36px;border-radius:var(--radius);display:grid;place-items:center;background:${tint(10)};color:var(--primary)">${ic("admin-code", 18)}</span><div style="flex:1;min-width:0"><div style="font-weight:500">Don’t see your tool?</div><div class="muted" style="font-size:12px">Request an integration or use the API</div></div><span class="muted" style="display:flex">${ic("chevron", 16)}</span></div>
</div></div>`;

const def = (name, shows, elements, key) => ({ family: "workspace", name, shows, elements, web: TPL[key + "/web"], mobile: TPL[key + "/mobile"] });
module.exports = {
  "api-keys": def("API keys", "a developer settings list of API keys with masked keys, scopes, creators, last-used times and statuses, a just-created key reveal banner with copy and a one-time warning, webhook health and rate-limit usage",
    ["sidebar-nav", "breadcrumbs", "table", "badge", "banner", "copy-field", "progress-bar", "api-keys", "settings"], "api-keys"),
  "audit-log": def("Security audit log", "a searchable, filterable table of workspace events with actor avatars, actions, targets, IP addresses and locations, event-type chips, a date range, export and an event detail panel",
    ["sidebar-nav", "breadcrumbs", "table", "search", "chips", "date-range", "drawer", "avatar", "audit-log", "pagination"], "audit-log"),
  "roles-permissions": def("Roles and permissions", "a roles list with member counts and a custom role, a permission matrix of checkboxes grouped by capability for the selected role, and an unsaved-changes bar",
    ["sidebar-nav", "breadcrumbs", "role-list", "permission-matrix", "checkbox", "toggle", "badge", "save-bar", "settings"], "roles-permissions"),
  "integrations": def("Integrations", "a grid of connected and available app integrations with simple logo marks, category chips and connect buttons, and a settings panel for the selected integration with channel mapping and event toggles",
    ["sidebar-nav", "breadcrumbs", "card-grid", "chips", "badge", "button", "side-panel", "toggle", "integrations", "settings"], "integrations"),
};
