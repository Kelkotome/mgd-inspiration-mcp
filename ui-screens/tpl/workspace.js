/* Workspace family (Fernway — tasks, docs and files for small teams):
   list-view, detail-view, kanban-board, calendar, file-manager, search-results, editor-toolbar.
   "Today" across these screens is Wednesday 28 October 2026. */
const { ic, sideNav, status, tabBar } = require("../lib");

const TPL = {};
const NAV = [["inbox", "Inbox"], ["check", "My tasks"], ["grid", "Projects"], ["doc", "Docs"], ["folder", "Files"], ["users", "Team"], ["gear", "Settings"]];
const MTABS = [["inbox", "Inbox"], ["check", "Tasks"], ["doc", "Docs"], ["folder", "Files"]];

// ---- local CSS (prefixed fw-) -----------------------------------------------------------------
const CSS = `<style>
.fw-tag{display:inline-flex;align-items:center;height:20px;padding:0 7px;border-radius:var(--radius-sm);font:600 11px var(--font-b);white-space:nowrap}
.fw-cb{width:18px;height:18px;flex:none;border:1.5px solid color-mix(in oklab,var(--muted) 70%,var(--surface));border-radius:max(4px,var(--radius-sm));display:grid;place-items:center;background:var(--surface)}
.fw-cb.on{background:var(--primary);border-color:var(--primary);color:var(--on-primary)}
.fw-stack{display:flex;align-items:center}.fw-stack .avatar{box-shadow:0 0 0 2px var(--surface);margin-left:-6px}.fw-stack .avatar:first-child{margin-left:0}
.fw-seg{display:inline-flex;padding:3px;border-radius:var(--radius);background:color-mix(in oklab,var(--text) 5%,var(--surface));border:1px solid var(--border);gap:2px;flex:none}
.fw-seg span{padding:3px 10px;border-radius:var(--radius-sm);font-weight:500;font-size:13px;color:var(--muted);display:inline-flex;gap:6px;align-items:center;white-space:nowrap}
.fw-seg span.on{background:var(--surface);color:var(--text);box-shadow:0 1px 2px color-mix(in oklab,var(--text) 14%,transparent)}
.fw-meta{display:inline-flex;align-items:center;gap:4px;font-size:12px;color:var(--muted);white-space:nowrap}
.fw-tool{width:32px;height:32px;display:grid;place-items:center;border-radius:var(--radius-sm);color:var(--text);flex:none}
.fw-tool.on{background:color-mix(in oklab,var(--primary) 14%,var(--surface));color:var(--primary)}
.fw-sep{width:1px;height:20px;background:var(--border);margin:0 4px;flex:none}
.fw-hl{background:color-mix(in oklab,var(--accent) 28%,transparent);color:inherit;border-radius:2px;padding:0 1px;font-weight:600}
.fw-fab{position:absolute;right:20px;bottom:96px;width:54px;height:54px;border-radius:50%;background:var(--primary);color:var(--on-primary);display:grid;place-items:center;box-shadow:var(--shadow-lg),0 6px 16px color-mix(in oklab,var(--primary) 35%,transparent)}
.fw-chip{display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 12px;border-radius:999px;border:1px solid var(--border);background:var(--surface);font-weight:500;font-size:13px;white-space:nowrap;flex:none}
.fw-chip.on{background:var(--text);border-color:var(--text);color:var(--bg)}
.fw-ell{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.fw-crumb{display:flex;align-items:center;gap:8px;color:var(--muted);white-space:nowrap}.fw-crumb b{color:var(--text);font-weight:600}
.fw-row{display:flex;align-items:center;gap:10px}
.main>.top{flex:none}
</style>`;

// ---- people, tones, small parts ---------------------------------------------------------------
const PEOPLE = { MO: "Mara Okafor", TR: "Teodora Ruiz", SA: "Sam Achebe", LP: "Lin Park", JW: "Jonah Weiss", PN: "Priya Nair" };
const AVT = {
  MO: "",
  TR: "background:color-mix(in oklab,var(--accent) 24%,var(--surface));color:color-mix(in oklab,var(--accent) 70%,var(--text))",
  SA: "background:color-mix(in oklab,var(--text) 12%,var(--surface));color:var(--text)",
  LP: "background:var(--primary);color:var(--on-primary)",
  JW: "background:color-mix(in oklab,var(--muted) 30%,var(--surface));color:var(--text)",
  PN: "background:var(--text);color:var(--bg)",
};
const av = (k, s = 24) => `<span class="avatar" title="${PEOPLE[k]}" style="width:${s}px;height:${s}px;font-size:${Math.max(9, Math.round(s * 0.4))}px;flex:none;${AVT[k]}">${k}</span>`;
const stack = (ks, s = 24) => `<span class="fw-stack">${ks.map((k) => av(k, s)).join("")}</span>`;
const TONE = { p: "var(--primary)", a: "var(--accent)", n: "var(--muted)", m: "color-mix(in oklab,var(--primary) 50%,var(--accent))" };
const TAGT = { Planning: "p", Launch: "a", Copy: "n", Review: "m", Client: "a", Ops: "n", Design: "m", Docs: "p", Research: "n", Finance: "a", Eng: "p", Bug: "a" };
const tag = (t, tone) => { const c = TONE[tone || TAGT[t] || "n"]; return `<span class="fw-tag" style="background:color-mix(in oklab,${c} 15%,var(--surface));color:color-mix(in oklab,${c} 72%,var(--text))">${t}</span>`; };
const cb = (on) => `<span class="fw-cb${on ? " on" : ""}">${on ? ic("check", 12) : ""}</span>`;
const prioIc = (lv) => lv === "Urgent"
  ? `<span style="width:15px;height:15px;border-radius:3px;background:var(--accent);color:var(--on-primary);display:grid;place-items:center;font:800 10px var(--font-b);flex:none">!</span>`
  : `<svg width="15" height="15" viewBox="0 0 15 15" style="flex:none">${[0, 1, 2].map((i) => `<rect x="${1 + i * 5}" y="${10 - i * 4}" width="3" height="${4 + i * 4}" rx="1" fill="${i < { High: 3, Medium: 2, Low: 1 }[lv] ? "currentColor" : "var(--border)"}"/>`).join("")}</svg>`;
const prio = (lv) => `<span class="fw-meta" style="color:var(--text);gap:6px">${prioIc(lv)}${lv}</span>`;
const seg = (items, on) => `<span class="fw-seg">${items.map((t, i) => `<span class="${i === on ? "on" : ""}">${t}</span>`).join("")}</span>`;
const bar = (pct, h = 6, c = "var(--primary)") => `<div style="height:${h}px;border-radius:9px;background:color-mix(in oklab,var(--text) 9%,var(--surface));overflow:hidden"><div style="width:${pct}%;height:100%;border-radius:9px;background:${c}"></div></div>`;
const EXT = { FIG: "a", PDF: "p", PNG: "m", JPG: "m", DOC: "p", XLS: "n", MP4: "a", ZIP: "n", KEY: "m", CSV: "n" };
const fileIc = (ext, s = 28) => { const c = TONE[EXT[ext] || "n"]; return `<svg width="${s}" height="${Math.round(s * 1.15)}" viewBox="0 0 30 35" style="flex:none"><path d="M4 1.5h15.5l7 7v24a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-30a1 1 0 0 1 1-1z" fill="color-mix(in oklab,${c} 14%,var(--surface))" stroke="color-mix(in oklab,${c} 55%,var(--surface))" stroke-width="1.2"/><path d="M19.5 1.5v7h7" fill="none" stroke="color-mix(in oklab,${c} 55%,var(--surface))" stroke-width="1.2"/><text x="15" y="26" text-anchor="middle" font-size="7.6" font-weight="800" font-family="system-ui,sans-serif" fill="color-mix(in oklab,${c} 85%,var(--text))">${ext}</text></svg>`; };
const folderIc = (s = 28, tone = "p") => `<svg width="${s}" height="${s}" viewBox="0 0 32 32" style="flex:none"><path d="M3 8a2 2 0 0 1 2-2h7l3 3h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="color-mix(in oklab,${TONE[tone]} 30%,var(--surface))"/><path d="M3 12h26v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="color-mix(in oklab,${TONE[tone]} 55%,var(--surface))"/></svg>`;
const shell = (p, active, main) => `${CSS}<div class="shell">${sideNav(p, active, NAV)}<main class="main">${main}</main></div>`;
const title = (st, t, px = 15) => `<div class="h" style="font-size:${Math.round(px * st.hscale)}px;white-space:nowrap">${t}</div>`;
const phone = (inner) => `${CSS}<div class="phone" style="position:relative">${status()}${inner}</div>`;

// =============================================================================================
// list-view — My tasks
const TODAY = [
  ["Finalise Q4 launch plan for Harbor release", "Harbor launch", ["Planning", "Launch"], "Urgent", "Today, 5:00 PM", ["MO", "TR"], 6, false, true],
  ["Reply to Ostrava Labs on SSO timeline", "Client · Ostrava Labs", ["Client"], "High", "Yesterday", ["MO"], 3, false, false, true],
  ["Review onboarding copy from Lin", "Website refresh", ["Copy", "Review"], "High", "Today", ["MO", "LP"], 2, false, false],
  ["Book venue walkthrough for team offsite", "Operations", ["Ops"], "Low", "Today", ["MO"], 0, true, false],
];
const WEEK = [
  ["Approve icon set v3 for mobile app", "Mobile app 2.0", ["Design"], "Medium", "Thu 29 Oct", ["MO", "PN"], 4, false],
  ["Write release notes for Harbor 2.4", "Harbor launch", ["Docs"], "Medium", "Thu 29 Oct", ["MO", "JW"], 1, false],
  ["Reconcile October contractor invoices", "Finance", ["Finance"], "High", "Fri 30 Oct", ["MO"], 0, false],
  ["Prepare customer interview guide", "Research", ["Research"], "Low", "Fri 30 Oct", ["MO", "SA", "PN"], 5, false],
  ["Send SOW revision to Brightwell Studio", "Client · Brightwell", ["Client"], "Medium", "Fri 30 Oct", ["MO"], 0, false],
];
const COLS = "28px minmax(0,1fr) 170px 100px 120px 76px 44px";
const taskRow = ([t, proj, tags, pr, due, ppl, com, done, , late]) => `<div style="display:grid;grid-template-columns:${COLS};gap:12px;align-items:center;padding:7px 18px;border-top:1px solid var(--border)">${cb(done)}
<div style="min-width:0"><div class="fw-ell" style="font-weight:500;${done ? "text-decoration:line-through;color:var(--muted)" : ""}">${t}</div><div class="muted fw-ell" style="font-size:12px">${proj}</div></div>
<div style="display:flex;gap:4px;overflow:hidden">${tags.map((x) => tag(x)).join("")}</div>${prio(pr)}
<span class="fw-meta" style="${late ? "color:color-mix(in oklab,var(--accent) 80%,var(--text));font-weight:600" : due.startsWith("Today") ? "color:var(--text);font-weight:500" : ""}">${ic("calendar", 13)}${due}</span>${stack(ppl, 24)}<span class="fw-meta">${com ? ic("chat", 13) + com : ""}</span></div>`;
const groupHead = (name, n, sub, open = true) => `<div style="display:flex;align-items:center;gap:8px;padding:10px 18px;${open ? "" : "border-top:1px solid var(--border)"};background:color-mix(in oklab,var(--text) 3%,var(--surface))">${ic(open ? "chevdown" : "chevron", 14)}<span style="font-weight:600">${name}</span><span class="muted" style="font-size:12px;font-weight:600">${n}</span><span class="muted" style="font-size:12px">· ${sub}</span><span class="muted" style="margin-left:auto;font-size:12px;display:inline-flex;gap:4px;align-items:center">${ic("plus", 13)}Add task</span></div>`;

TPL["list-view/web"] = (p, st) => shell(p, "My tasks", `
<div class="top">${title(st, "My tasks")}<span style="margin-left:12px">${seg([`${ic("list", 14)}List`, `${ic("grid", 14)}Board`, `${ic("calendar", 14)}Calendar`], 0)}</span><div class="search">${ic("search", 16)}Search tasks</div><button class="btn">${ic("bell", 16)}</button><button class="btn primary">${ic("plus", 16)}New task</button></div>
<div class="page" style="gap:16px"><div class="ph" style="display:flex;align-items:end;justify-content:space-between;gap:24px"><div><h1>Good afternoon, Mara</h1><p>12 open tasks · 4 due today · 1 overdue</p></div>
<div style="width:260px;display:grid;gap:6px"><div style="display:flex;justify-content:space-between;font-size:12px"><span class="muted">This week</span><span style="font-weight:600">9 of 21 done</span></div>${bar(43)}</div></div>
<div style="display:flex;gap:8px;align-items:center;flex-wrap:nowrap">
<span class="btn" style="height:32px">${ic("filter", 14)}Filter</span><span class="btn" style="height:32px">Assignee: Me ${ic("x", 12)}</span><span class="btn" style="height:32px">Project: All ${ic("chevdown", 12)}</span><span class="btn" style="height:32px">Priority ${ic("chevdown", 12)}</span><span class="btn" style="height:32px">${ic("tag", 14)}Tags ${ic("chevdown", 12)}</span>
<span class="muted" style="margin-left:auto;font-size:13px">Sort</span><span class="btn" style="height:32px">Due date ${ic("chevdown", 12)}</span><span class="muted" style="font-size:13px">Group</span><span class="btn" style="height:32px">Due ${ic("chevdown", 12)}</span></div>
<div class="card" style="overflow:hidden">
<div style="display:grid;grid-template-columns:${COLS};gap:12px;padding:8px 18px;font-size:12px;font-weight:600;color:var(--muted)"><span></span><span>Task</span><span>Tags</span><span>Priority</span><span>Due</span><span>Assignees</span><span></span></div>
${groupHead("Today", 4, "Wed 28 Oct")}${TODAY.map(taskRow).join("")}
<div style="border-top:1px solid var(--border)">${groupHead("This week", 5, "29 Oct – 1 Nov")}</div>${WEEK.map(taskRow).join("")}
${groupHead("Next week", 6, "2 – 8 Nov", false)}</div></div>`);

TPL["list-view/mobile"] = (p, st) => phone(`<div class="mtop"><div><div class="muted" style="font-size:12px">Wednesday, 28 Oct</div><h1 style="font-size:${Math.round(26 * st.hscale)}px">My tasks</h1></div><div class="fw-row">${ic("search", 22)}${ic("filter", 22)}</div></div>
<div style="display:flex;gap:8px;padding:0 20px 10px;overflow:hidden;flex:none">${[["All", 12], ["Today", 4], ["Upcoming", 8], ["Assigned by me", 5]].map(([t, n], i) => `<span class="fw-chip${i === 1 ? " on" : ""}">${t}<span style="opacity:.6">${n}</span></span>`).join("")}</div>
<div class="mbody" style="gap:10px">
${[["Today", TODAY], ["This week", WEEK.slice(0, 3)]].map(([g, rows]) => `<div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px"><div style="font-weight:600">${g} <span class="muted" style="font-weight:500;font-size:13px">${g === "Today" ? 4 : 5}</span></div><span class="muted" style="font-size:12px">${g === "Today" ? "1 overdue" : "29 Oct – 1 Nov"}</span></div>
<div class="card">${rows.map(([t, proj, tags, pr, due, ppl, com, done, , late], i) => `<div style="display:flex;gap:12px;padding:11px 14px;align-items:flex-start;${i ? "border-top:1px solid var(--border)" : ""}"><span style="margin-top:2px">${cb(done)}</span><div style="flex:1;min-width:0"><div class="fw-ell" style="font-weight:500;${done ? "text-decoration:line-through;color:var(--muted)" : ""}">${t}</div>
<div style="display:flex;gap:8px;align-items:center;margin-top:4px">${prioIc(pr)}<span class="fw-meta" style="${late ? "color:color-mix(in oklab,var(--accent) 80%,var(--text));font-weight:600" : ""}">${due.replace(", 5:00 PM", " 5 PM")}</span>${tag(tags[0])}${com ? `<span class="fw-meta">${ic("chat", 12)}${com}</span>` : ""}</div></div>${av(ppl[ppl.length - 1], 24)}</div>`).join("")}</div>`).join("")}
</div><div class="fw-fab">${ic("plus", 24)}</div>
${tabBar("Tasks", MTABS)}`);

// =============================================================================================
// detail-view — single task
const SUBS = [["Confirm launch date with engineering", true, "SA", "21 Oct"], ["Lock pricing for annual plans", true, "TR", "24 Oct"], ["Draft announcement email and in-app banner", true, "LP", "27 Oct"], ["Get legal sign-off on the comparison page", false, "JW", "Today"], ["Share final plan with Ostrava Labs and Brightwell", false, "MO", "29 Oct"]];
const statusPill = (t = "In progress") => `<span class="fw-meta" style="height:24px;padding:0 9px;border-radius:999px;background:color-mix(in oklab,var(--primary) 12%,var(--surface));color:color-mix(in oklab,var(--primary) 80%,var(--text));font-weight:600"><span style="width:8px;height:8px;border-radius:50%;border:2px solid currentColor;border-right-color:transparent"></span>${t}</span>`;
const attach = (ext, n, s) => `<div class="card" style="display:flex;align-items:center;gap:10px;padding:8px 12px;box-shadow:none">${fileIc(ext, 22)}<div><div style="font-weight:500;font-size:13px">${n}</div><div class="muted" style="font-size:11px">${s}</div></div></div>`;

TPL["detail-view/web"] = (p, st) => shell(p, "My tasks", `
<div class="top"><div class="fw-crumb">${ic("grid", 15)}Projects<span>/</span>Harbor launch<span>/</span><b>FW-218</b></div><span style="margin-left:auto">${stack(["MO", "TR", "SA", "LP"], 26)}</span><button class="btn">${ic("link", 15)}Copy link</button><button class="btn">${ic("more", 16)}</button><button class="btn primary">${ic("check", 16)}Mark complete</button></div>
<div style="flex:1;display:grid;grid-template-columns:minmax(0,1fr) 320px;min-height:0">
<div style="padding:22px 40px;display:grid;gap:16px;align-content:start;overflow:hidden">
<div class="fw-row">${statusPill()}<span class="fw-tag" style="background:color-mix(in oklab,var(--text) 7%,var(--surface));color:var(--muted)">FW-218</span><span class="muted" style="font-size:12px">Created by Teodora Ruiz on 21 Oct · Updated 12 min ago</span></div>
<h1 style="font-size:${Math.round(28 * st.hscale)}px">Finalise Q4 launch plan for Harbor release</h1>
<div style="display:grid;gap:8px;max-width:760px;line-height:1.6"><p>Pull the workstreams into one plan we can share with the two pilot customers on Thursday. The draft lives in <b style="color:var(--primary);font-weight:600">Harbor Q4 launch plan</b>; this task tracks sign-off.</p><p class="muted">Done means: dates confirmed with engineering, pricing locked, comms drafted, legal has approved the comparison page, and both pilots have the PDF.</p></div>
<div style="display:flex;gap:10px">${attach("PDF", "launch-plan-v6.pdf", "1.8 MB · Teodora")}${attach("FIG", "Harbor launch assets", "Figma · Lin")}${attach("XLS", "pricing-annual.xlsx", "64 KB · Teodora")}</div>
<div class="card" style="overflow:hidden"><div style="display:flex;align-items:center;gap:12px;padding:10px 16px"><span style="font-weight:600">Subtasks</span><span class="muted" style="font-size:12px">3 of 5</span><div style="width:140px">${bar(60, 5)}</div><span class="muted" style="margin-left:auto;font-size:12px;display:inline-flex;gap:4px;align-items:center">${ic("plus", 13)}Add subtask</span></div>
${SUBS.map(([t, d, who, due]) => `<div style="display:flex;align-items:center;gap:12px;padding:7px 16px;border-top:1px solid var(--border)">${cb(d)}<span style="flex:1;${d ? "text-decoration:line-through;color:var(--muted)" : "font-weight:500"}">${t}</span><span class="fw-meta" style="${due === "Today" ? "color:color-mix(in oklab,var(--accent) 80%,var(--text));font-weight:600" : ""}">${due}</span>${av(who, 22)}</div>`).join("")}</div>
<div style="display:grid;gap:12px"><div class="fw-row" style="gap:16px;border-bottom:1px solid var(--border);padding-bottom:8px"><span style="font-weight:600">Activity</span><span style="font-size:13px;font-weight:600;color:var(--primary)">Comments 3</span><span class="muted" style="font-size:13px">History</span></div>
<div style="display:flex;gap:10px">${av("TR", 28)}<div style="flex:1"><div style="font-size:13px"><b style="font-weight:600">Teodora Ruiz</b> <span class="muted">· 2 h ago</span></div><div style="margin-top:2px">Pricing is locked — annual Growth stays at $24/seat. Updated the sheet and the plan PDF. <b style="color:var(--primary);font-weight:600">@Mara</b> can you chase legal before 3?</div></div></div>
<div class="fw-meta" style="padding-left:38px">${ic("clock", 13)}Sam Achebe changed the due date from 30 Oct to <b style="color:var(--text);font-weight:600">Today</b> · 1 h ago</div>
<div style="display:flex;gap:10px">${av("LP", 28)}<div style="flex:1"><div style="font-size:13px"><b style="font-weight:600">Lin Park</b> <span class="muted">· 40 min ago</span></div><div style="margin-top:2px">Banner and email are in the doc now. I left two subject-line options for Jonah to pick from.</div><div class="fw-row" style="gap:6px;margin-top:6px"><span class="fw-chip" style="height:24px;font-size:12px;padding:0 8px">${ic("heart", 12)}2</span><span class="fw-chip" style="height:24px;font-size:12px;padding:0 8px">${ic("check", 12)}Seen by Mara</span></div></div></div>
<div style="display:flex;gap:10px;align-items:center">${av("MO", 28)}<div class="input" style="flex:1;height:38px">Reply or mention someone with @</div><button class="btn primary" style="height:38px">${ic("send", 15)}</button></div></div>
</div>
<aside style="border-left:1px solid var(--border);padding:22px 22px;display:grid;gap:14px;align-content:start;background:color-mix(in oklab,var(--surface) 60%,var(--bg))">
<div style="font-weight:600">Properties</div>
${[["Status", statusPill()], ["Assignee", `<span class="fw-row" style="gap:8px">${av("MO", 22)}Mara Okafor</span>`], ["Collaborators", `<span class="fw-row" style="gap:8px">${stack(["TR", "SA", "LP"], 22)}<span class="muted" style="font-size:12px">+ Add</span></span>`],
  ["Due date", `<span class="fw-meta" style="font-size:13px;color:color-mix(in oklab,var(--accent) 80%,var(--text));font-weight:600">${ic("calendar", 14)}Today, 5:00 PM</span>`], ["Priority", prio("Urgent")], ["Project", `<span class="fw-row" style="gap:6px">${folderIc(18)}Harbor launch</span>`],
  ["Labels", `<span class="fw-row" style="gap:4px">${tag("Planning")}${tag("Launch")}</span>`], ["Sprint", "Sprint 14 · 27 Oct – 7 Nov"], ["Estimate", `<div style="display:grid;gap:5px;width:100%"><span style="font-size:13px">3h 40m of 6h</span>${bar(61, 5, "var(--accent)")}</div>`]]
  .map(([l, v]) => `<div style="display:grid;grid-template-columns:96px 1fr;align-items:center;gap:8px;font-size:13px;min-height:26px"><span class="muted">${l}</span><div>${v}</div></div>`).join("")}
<div style="border-top:1px solid var(--border);padding-top:14px;display:grid;gap:10px"><div style="font-weight:600;font-size:13px">Linked</div>
${[["doc", "Harbor Q4 launch plan", "Doc · edited 20 min ago"], ["check", "FW-224 Legal review: comparison page", "In review"]].map(([i, t, s]) => `<div class="fw-row" style="gap:10px"><span style="width:28px;height:28px;border-radius:var(--radius-sm);display:grid;place-items:center;background:color-mix(in oklab,var(--primary) 10%,var(--surface));color:var(--primary)">${ic(i, 15)}</span><div style="min-width:0"><div class="fw-ell" style="font-size:13px;font-weight:500">${t}</div><div class="muted" style="font-size:11px">${s}</div></div></div>`).join("")}</div>
<div class="muted" style="font-size:12px;border-top:1px solid var(--border);padding-top:12px">4 people watching · You get updates</div>
</aside></div>`);

TPL["detail-view/mobile"] = (p, st) => phone(`<div class="mtop" style="border-bottom:1px solid var(--border)">${ic("back", 22)}<div style="text-align:center"><div style="font-weight:600">FW-218</div><div class="muted" style="font-size:11px">Harbor launch</div></div>${ic("more", 22)}</div>
<div class="mbody" style="padding-top:14px;gap:12px"><div class="fw-row" style="gap:8px">${statusPill()}<span class="fw-meta" style="color:var(--text);gap:6px">${prioIc("Urgent")}Urgent</span></div>
<h1 style="font-size:${Math.round(22 * st.hscale)}px">Finalise Q4 launch plan for Harbor release</h1>
<div class="card">${[["Assignee", `<span class="fw-row" style="gap:8px">${av("MO", 22)}Mara Okafor</span>`], ["Due", `<span style="color:color-mix(in oklab,var(--accent) 80%,var(--text));font-weight:600">Today, 5:00 PM</span>`], ["Labels", `<span class="fw-row" style="gap:4px">${tag("Planning")}${tag("Launch")}</span>`]].map(([l, v], i) => `<div style="display:flex;justify-content:space-between;align-items:center;padding:9px 14px;font-size:13px;${i ? "border-top:1px solid var(--border)" : ""}"><span class="muted">${l}</span>${v}</div>`).join("")}</div>
<p style="font-size:13px;line-height:1.55">Pull the workstreams into one plan we can share with the two pilot customers on Thursday.</p>
<div style="display:flex;justify-content:space-between;align-items:center"><span style="font-weight:600">Subtasks <span class="muted" style="font-weight:500;font-size:13px">3 of 5</span></span><div style="width:110px">${bar(60, 5)}</div></div>
<div class="card">${[["Lock pricing for annual plans", true, "TR"], ["Draft announcement email", true, "LP"], ["Legal sign-off on comparison page", false, "JW"], ["Share final plan with pilots", false, "MO"]].map(([t, d, who], i) => `<div style="display:flex;align-items:center;gap:10px;padding:9px 14px;font-size:13px;${i ? "border-top:1px solid var(--border)" : ""}">${cb(d)}<span class="fw-ell" style="flex:1;${d ? "text-decoration:line-through;color:var(--muted)" : "font-weight:500"}">${t}</span>${av(who, 20)}</div>`).join("")}</div>
<div style="font-weight:600">Comments <span class="muted" style="font-weight:500;font-size:13px">3</span></div>
<div style="display:flex;gap:10px;font-size:13px">${av("TR", 28)}<div><b style="font-weight:600">Teodora Ruiz</b> <span class="muted">· 2 h</span><div style="margin-top:2px">Pricing is locked — annual Growth stays at $24/seat. <b style="color:var(--primary);font-weight:600">@Mara</b> can you chase legal before 3?</div></div></div>
</div><div style="flex:none;display:flex;gap:10px;align-items:center;padding:10px 16px 30px;border-top:1px solid var(--border);background:var(--surface)">${av("MO", 30)}<div class="input" style="flex:1;height:40px;border-radius:999px">Add a comment…</div><span class="btn primary" style="width:40px;height:40px;padding:0;border-radius:999px">${ic("send", 16)}</span></div>`);

// =============================================================================================
// kanban-board
const BOARD = [
  ["Backlog", 6, "n", [
    [["Research"], "Interview five Ostrava Labs admins about permissions", "6 Nov", 2, null, ["PN"]],
    [["Design"], "Empty states for the new Files view", null, 0, "0/3", ["LP"]],
    [["Docs", "Launch"], "Draft Harbor 2.4 help-centre articles", "10 Nov", 1, null, ["JW"]],
    [["Bug"], "Duplicate notifications when a task is reassigned", null, 4, null, ["SA"]],
    [["Eng"], "Export a board as CSV", null, 1, null, ["JW"]],
  ], 1],
  ["In progress", 4, "p", [
    [["Design"], "Hero illustration for the launch email", "Today", 5, null, ["LP", "TR"], "cover"],
    [["Launch", "Planning"], "Finalise Q4 launch plan for Harbor release", "Today", 6, "3/5", ["MO", "TR"], 60],
    [["Eng"], "Bulk-move tasks between projects", "30 Oct", 2, "1/4", ["SA", "JW"]],
    [["Ops"], "Book venue walkthrough for team offsite", "2 Nov", 0, null, ["MO"]],
  ], 0],
  ["In review", 4, "a", [
    [["Design"], "Approve icon set v3 for mobile app", "29 Oct", 4, null, ["PN", "MO"]],
    [["Docs"], "Release notes for Harbor 2.4", "29 Oct", 1, "4/4", ["JW"]],
    [["Eng", "Bug"], "Calendar sync drops recurring events", "30 Oct", 7, null, ["SA"]],
    [["Copy"], "Homepage hero copy — final pass", "31 Oct", 3, null, ["LP", "TR"]],
  ], 0],
  ["Done", 12, "m", [
    [["Launch"], "Pricing page copy sign-off", null, 3, null, ["TR"], "done"],
    [["Eng"], "File previews support HEIC photos", null, 2, null, ["SA"], "done"],
    [["Ops"], "Renew design tool seats for 2027", null, 0, null, ["MO"], "done"],
    [["Design"], "Logo lock-ups for dark backgrounds", null, 1, null, ["PN"], "done"],
    [["Research"], "Summarise pilot survey results", null, 4, null, ["PN", "TR"], "done"],
  ], 7],
];
const cover = () => `<div style="height:84px;border-radius:var(--radius);overflow:hidden;position:relative;background:linear-gradient(160deg,#f3c9a1,#e58f6b 55%,#9a4f52)"><svg width="100%" height="84" style="display:block" viewBox="0 0 260 84" preserveAspectRatio="xMidYMid slice"><circle cx="196" cy="30" r="16" fill="#fde7c2"/><path d="M0 64 L60 38 L110 58 L170 30 L260 60 V84 H0Z" fill="#6f3a48" opacity=".85"/><path d="M0 74 L80 56 L150 72 L260 58 V84 H0Z" fill="#41283a"/></svg></div>`;
const kcard = ([labels, t, due, com, subs, ppl, extra]) => {
  const done = extra === "done", today = due === "Today";
  return `<div class="card" style="padding:12px;display:grid;gap:9px;box-shadow:var(--shadow-sm)">${extra === "cover" ? cover() : ""}<div style="display:flex;gap:4px">${labels.map((x) => tag(x)).join("")}</div>
<div style="font-weight:500;line-height:1.35;${done ? "color:var(--muted)" : ""}">${t}</div>${typeof extra === "number" ? bar(extra, 4) : ""}
<div style="display:flex;align-items:center;gap:10px">${done ? `<span class="fw-meta" style="color:color-mix(in oklab,var(--primary) 80%,var(--text))">${ic("check", 13)}Completed</span>` : due ? `<span class="fw-meta" style="height:20px;padding:0 6px;border-radius:var(--radius-sm);${today ? "background:color-mix(in oklab,var(--accent) 16%,var(--surface));color:color-mix(in oklab,var(--accent) 75%,var(--text));font-weight:600" : "background:color-mix(in oklab,var(--text) 6%,var(--surface))"}">${ic("clock", 12)}${due}</span>` : ""}
${com ? `<span class="fw-meta">${ic("chat", 13)}${com}</span>` : ""}${subs ? `<span class="fw-meta">${ic("check", 13)}${subs}</span>` : ""}<span style="margin-left:auto">${stack(ppl, 22)}</span></div></div>`;
};
const colHead = (n, c, tone) => `<div style="display:flex;align-items:center;gap:8px;padding:2px 4px"><span style="width:9px;height:9px;border-radius:50%;background:${TONE[tone]}"></span><span style="font-weight:600">${n}</span><span class="muted" style="font-size:12px;font-weight:600">${c}</span><span class="muted" style="margin-left:auto;display:flex;gap:6px">${ic("plus", 16)}${ic("more", 16)}</span></div>`;

TPL["kanban-board/web"] = (p, st) => shell(p, "Projects", `
<div class="top"><div class="fw-crumb">Projects<span>/</span></div>${title(st, "Harbor launch")}<span style="margin-left:12px">${seg([`${ic("list", 14)}List`, `${ic("grid", 14)}Board`, `${ic("calendar", 14)}Calendar`, `${ic("folder", 14)}Files`], 1)}</span><span style="margin-left:auto">${stack(["MO", "TR", "SA", "LP", "JW"], 28)}</span><button class="btn">${ic("share", 15)}Share</button><button class="btn primary">${ic("plus", 16)}New task</button></div>
<div style="display:flex;align-items:center;gap:8px;padding:14px 28px 0"><span class="btn" style="height:32px">Sprint 14 · 27 Oct – 7 Nov ${ic("chevdown", 12)}</span><span class="btn" style="height:32px">${ic("filter", 14)}Filter</span><span class="btn" style="height:32px">${ic("users", 14)}Everyone ${ic("chevdown", 12)}</span><span class="btn" style="height:32px">${ic("tag", 14)}Labels ${ic("chevdown", 12)}</span>
<span class="muted" style="margin-left:auto;font-size:13px">8 of 25 tasks done</span><div style="width:160px">${bar(32)}</div></div>
<div style="flex:1;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;padding:16px 28px 24px;min-height:0">
${BOARD.map(([n, c, tone, cards, more]) => `<div style="background:color-mix(in oklab,var(--text) 4%,var(--bg));border-radius:var(--radius-lg);padding:12px;display:flex;flex-direction:column;gap:10px;overflow:hidden">${colHead(n, c, tone)}${cards.map(kcard).join("")}
${more ? `<div class="muted" style="font-size:13px;text-align:center;padding:6px">Show ${more} more</div>` : `<div class="muted" style="font-size:13px;display:flex;gap:6px;align-items:center;padding:6px 4px">${ic("plus", 14)}Add task</div>`}</div>`).join("")}
</div>`);

TPL["kanban-board/mobile"] = (p, st) => phone(`<div class="mtop">${ic("back", 22)}<div style="text-align:center"><div style="font-weight:600">Harbor launch</div><div class="muted" style="font-size:11px">Sprint 14 · 8 of 25 done</div></div>${ic("filter", 22)}</div>
<div style="display:flex;gap:20px;padding:0 20px;border-bottom:1px solid var(--border);flex:none;overflow:hidden">${BOARD.map(([n, c], i) => `<div style="padding:8px 0 10px;white-space:nowrap;font-weight:${i === 1 ? 600 : 500};${i === 1 ? "color:var(--text);box-shadow:inset 0 -2px 0 var(--primary)" : "color:var(--muted)"}">${n} <span style="font-size:12px;opacity:.7">${c}</span></div>`).join("")}</div>
<div class="mbody" style="padding:14px 0 12px 20px;gap:10px"><div style="display:flex;gap:12px;flex:1;min-height:0">
${[BOARD[1], BOARD[2]].map(([n, c, tone, cards]) => `<div style="width:316px;flex:none;display:flex;flex-direction:column;gap:10px;overflow:hidden">${cards.slice(0, 4).map(kcard).join("")}</div>`).join("")}</div>
<div style="display:flex;align-items:center;justify-content:center;gap:10px;padding-right:20px"><span style="display:flex;gap:5px">${[0, 1, 2, 3].map((i) => `<span style="width:${i === 1 ? 16 : 6}px;height:6px;border-radius:9px;background:${i === 1 ? "var(--primary)" : "var(--border)"}"></span>`).join("")}</span><span class="muted" style="font-size:12px;display:inline-flex;gap:4px;align-items:center">Swipe for In review ${ic("arrow", 12)}</span></div></div>
${tabBar("Tasks", MTABS)}`);

// =============================================================================================
// calendar
const DAYS = [["Mon", 26], ["Tue", 27], ["Wed", 28], ["Thu", 29], ["Fri", 30], ["Sat", 31], ["Sun", 1]];
// [day, start, end, title, sub, tone, col, cols]
const EV = [
  ...[0, 1, 2, 3, 4].map((d) => [d, 9, 9.5, "Daily standup", "", "n", 0, 1]),
  [0, 8.25, 8.75, "Inbox triage", "", "m", 0, 1], [3, 8, 8.75, "Coffee with Sam", "", "a", 0, 1], [0, 10, 11.5, "Harbor launch planning", "Room 2 · 6 people", "p", 0, 1], [0, 14, 15, "1:1 Teodora", "", "a", 0, 1], [0, 16, 17, "Hiring sync", "", "m", 0, 1],
  [1, 11, 12, "Ostrava Labs check-in", "Video call", "a", 0, 1], [1, 13, 15.5, "Focus: release notes", "No meetings", "m", 0, 1], [1, 16, 17, "Design crit", "Lin, Priya", "p", 0, 1],
  [2, 10, 11, "Interview", "Brightwell Studio", "p", 0, 2], [2, 10.5, 11.75, "Icon set v3", "Priya", "a", 1, 2], [2, 13, 14, "Lunch & learn: Docs", "Kitchen", "m", 0, 1], [2, 15, 16.5, "Sprint 14 review", "Room 1", "p", 0, 1],
  [3, 9.75, 12, "Offsite planning", "Mara, Sam, Jonah", "m", 0, 1], [3, 14, 15, "Invoice review", "Finance", "a", 0, 2], [3, 14.5, 15.5, "Vendor call", "Printwell", "p", 1, 2],
  [4, 11, 12, "Harbor go / no-go", "All hands", "p", 0, 1], [4, 15, 17, "Team retro + drinks", "Rooftop", "a", 0, 1],
  [5, 10, 12, "Venue walkthrough", "Larkspur Hall", "n", 0, 1],
];
const H0 = 8, H1 = 19;
const evStyle = (tone) => `background:color-mix(in oklab,${TONE[tone]} 16%,var(--surface));border-left:3px solid ${TONE[tone]};color:color-mix(in oklab,${TONE[tone]} 55%,var(--text))`;
const hh = (h) => `${Math.floor(h) > 12 ? Math.floor(h) - 12 : Math.floor(h)}${h % 1 ? ":" + String(Math.round((h % 1) * 60)).padStart(2, "0") : ""}`;
const miniMonth = (sel, small) => {
  const cells = []; for (let i = 0; i < 35; i++) { const d = i - 2; cells.push(d < 1 ? [28 + i, true] : d > 31 ? [d - 31, true] : [d, false]); }
  const dots = { 26: 1, 27: 1, 28: 1, 29: 1, 30: 1, 2: 1, 5: 1, 9: 1, 12: 1, 14: 1, 15: 1, 20: 1, 21: 1, 22: 1 };
  return `<div style="display:grid;grid-template-columns:repeat(7,1fr);text-align:center;row-gap:${small ? 2 : 6}px;font-size:${small ? 12 : 14}px">${["M", "T", "W", "T", "F", "S", "S"].map((d) => `<span class="muted" style="font-size:${small ? 11 : 12}px;font-weight:600;padding-bottom:4px">${d}</span>`).join("")}
${cells.map(([d, o]) => { const on = !o && d === sel, s = small ? 23 : 36; return `<div style="display:grid;justify-items:center;gap:2px"><span style="width:${s}px;height:${s}px;border-radius:50%;display:grid;place-items:center;${on ? "background:var(--primary);color:var(--on-primary);font-weight:700" : o ? "color:color-mix(in oklab,var(--muted) 55%,var(--bg))" : ""}">${d}</span>${small ? "" : `<span style="width:4px;height:4px;border-radius:50%;background:${!o && dots[d] && !on ? "var(--accent)" : "transparent"}"></span>`}</div>`; }).join("")}</div>`;
};

TPL["calendar/web"] = (p, st) => {
  const HP = 69, cols = "56px repeat(5,minmax(0,1fr)) repeat(2,minmax(0,.6fr))";
  return shell(p, "My tasks", `
<div class="top">${title(st, "Calendar")}<button class="btn" style="margin-left:12px;height:32px">Today</button><span class="fw-row" style="gap:2px;color:var(--muted)"><span class="fw-tool">${ic("back", 16)}</span><span class="fw-tool">${ic("chevron", 16)}</span></span><span style="font-weight:600;white-space:nowrap">26 Oct – 1 Nov 2026</span>
<span style="margin-left:auto">${seg(["Day", "Week", "Month", "Agenda"], 1)}</span><button class="btn">${ic("search", 15)}</button><button class="btn primary">${ic("plus", 16)}New event</button></div>
<div style="flex:1;display:grid;grid-template-columns:212px minmax(0,1fr);min-height:0">
<div style="border-right:1px solid var(--border);padding:18px 14px;display:grid;gap:18px;align-content:start"><div><div style="font-weight:600;margin-bottom:8px;display:flex;justify-content:space-between">October 2026 <span class="muted fw-row" style="gap:2px">${ic("back", 14)}${ic("chevron", 14)}</span></div>${miniMonth(28, true)}</div>
<div style="display:grid;gap:9px"><div class="muted" style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.06em">Calendars</div>${[["Harbor launch", "p", 1], ["Team meetings", "n", 1], ["Clients", "a", 1], ["Focus time", "m", 1], ["Out of office", "n", 0]].map(([t, tone, on]) => `<div class="fw-row" style="gap:9px;font-size:13px"><span style="width:16px;height:16px;border-radius:4px;display:grid;place-items:center;${on ? `background:${TONE[tone]};color:var(--on-primary)` : `border:1.5px solid ${TONE[tone]}`}">${on ? ic("check", 11) : ""}</span>${t}</div>`).join("")}</div>
<div class="card" style="padding:12px;display:grid;gap:6px;box-shadow:none"><div style="font-weight:600;font-size:13px">Due this week</div>${[["Approve icon set v3", "Thu"], ["Harbor 2.4 notes", "Thu"], ["Contractor invoices", "Fri"]].map(([t, d]) => `<div class="fw-row" style="gap:8px;font-size:12px">${cb(false)}<span class="fw-ell" style="flex:1">${t}</span><span class="muted">${d}</span></div>`).join("")}</div></div>
<div style="display:flex;flex-direction:column;min-height:0;overflow:hidden">
<div style="display:grid;grid-template-columns:${cols};border-bottom:1px solid var(--border)"><span></span>${DAYS.map(([d, n], i) => `<div style="padding:10px 10px 8px;display:flex;align-items:baseline;gap:6px;border-left:1px solid var(--border);${i > 4 ? "background:color-mix(in oklab,var(--text) 3%,var(--bg))" : ""}"><span class="muted" style="font-size:12px;font-weight:600">${d}</span><span style="font-size:18px;font-weight:600;${i === 2 ? "width:30px;height:30px;border-radius:50%;background:var(--primary);color:var(--on-primary);display:inline-grid;place-items:center;font-size:15px" : ""}">${n}</span></div>`).join("")}</div>
<div style="display:grid;grid-template-columns:${cols};border-bottom:1px solid var(--border);font-size:12px"><span class="muted" style="font-size:10px;padding:6px 4px;text-align:right">all-day</span>
<div style="grid-column:3;margin:4px;padding:2px 8px;border-radius:var(--radius-sm);${evStyle("a")};font-weight:600" class="fw-ell">Harbor 2.4 code freeze</div><div style="grid-column:5 / span 2;margin:4px;padding:2px 8px;border-radius:var(--radius-sm);${evStyle("n")};font-weight:600" class="fw-ell">Lin Park — out of office</div></div>
<div style="position:relative;flex:1;display:grid;grid-template-columns:${cols};min-height:0">
<div>${Array.from({ length: H1 - H0 }, (_, i) => `<div class="muted" style="height:${HP}px;font-size:11px;text-align:right;padding-right:8px;transform:translateY(${i ? -7 : 2}px)">${hh(H0 + i) + (H0 + i < 12 ? " AM" : " PM")}</div>`).join("")}</div>
${DAYS.map((_, d) => `<div style="position:relative;border-left:1px solid var(--border);background:${d > 4 ? "color-mix(in oklab,var(--text) 3%,var(--bg))" : "transparent"};background-image:repeating-linear-gradient(to bottom,transparent 0,transparent ${HP - 1}px,var(--border) ${HP - 1}px,var(--border) ${HP}px)">
${EV.filter((e) => e[0] === d).map(([, s, e, t, sub, tone, c, n]) => `<div style="position:absolute;top:${(s - H0) * HP + 1}px;height:${(e - s) * HP - 3}px;left:calc(${(c / n) * 100}% + 3px);width:calc(${100 / n}% - 6px);border-radius:var(--radius-sm);padding:3px 7px;font-size:12px;line-height:1.3;overflow:hidden;${evStyle(tone)};${c ? "box-shadow:0 0 0 1.5px var(--bg)" : ""}"><div style="font-weight:600;display:-webkit-box;-webkit-line-clamp:${e - s >= 1.5 || n > 1 ? 2 : 1};-webkit-box-orient:vertical;overflow:hidden">${t}</div>${e - s >= 1 && !(n > 1 && e - s < 1.5) ? `<div class="fw-ell" style="opacity:.8">${hh(s)}–${hh(e)}${sub && n === 1 ? " · " + sub : ""}</div>` : ""}</div>`).join("")}
${d === 2 ? `<div style="position:absolute;left:-5px;right:0;top:${(12.4 - H0) * HP}px;height:2px;background:var(--accent)"><span style="position:absolute;left:0;top:-4px;width:10px;height:10px;border-radius:50%;background:var(--accent)"></span></div>` : ""}</div>`).join("")}
</div></div></div>`);
};

const AGENDA = [["9:00", "9:30", "Daily standup", "Team meetings · Video", "n", ["MO", "TR", "SA", "LP"]], ["10:00", "11:00", "Customer interview", "Brightwell Studio · Zoom", "p", ["MO", "PN"]], ["10:30", "11:45", "Review icon set v3", "Overlaps · Priya Nair", "a", ["PN"]], ["1:00", "2:00", "Lunch & learn: Docs", "Kitchen", "m", ["JW", "SA"]], ["3:00", "4:30", "Sprint 14 review", "Room 1", "p", ["MO", "TR", "SA"]]];
TPL["calendar/mobile"] = (p, st) => phone(`<div class="mtop"><div class="fw-row" style="gap:6px"><h1 style="font-size:${Math.round(24 * st.hscale)}px">October</h1><span class="muted" style="font-size:${Math.round(24 * st.hscale)}px;font-family:var(--font-h)">2026</span>${ic("chevdown", 18)}</div><div class="fw-row" style="gap:14px">${ic("search", 22)}${ic("plus", 22)}</div></div>
<div style="padding:0 16px 10px;flex:none">${miniMonth(28, false)}</div>
<div class="mbody" style="border-top:1px solid var(--border);padding-top:14px;gap:10px"><div style="display:flex;justify-content:space-between;align-items:baseline"><div style="font-weight:600">Wednesday, 28 Oct</div><span class="muted" style="font-size:12px">5 events · 2 tasks due</span></div>
${AGENDA.map(([s, e, t, sub, tone, ppl]) => `<div style="display:grid;grid-template-columns:46px 1fr;gap:10px;align-items:stretch"><div style="font-size:12px;text-align:right;padding-top:6px"><div style="font-weight:600">${s}</div><div class="muted">${e}</div></div><div style="border-radius:var(--radius);padding:8px 12px;display:flex;align-items:center;gap:10px;${evStyle(tone)}"><div style="flex:1;min-width:0"><div class="fw-ell" style="font-weight:600;color:var(--text)">${t}</div><div class="fw-ell" style="font-size:12px">${sub}</div></div>${stack(ppl.slice(0, 3), 22)}</div></div>`).join("")}
</div>${tabBar("Tasks", MTABS)}`);

// =============================================================================================
// file-manager
const FOLDERS = [["Logos & marks", "24 files", "p"], ["Email assets", "11 files", "a"], ["Social cut-downs", "38 files", "m"], ["Archive", "102 files", "n"]];
const FILES = [
  ["FIG", "Harbor launch assets", "LP", "12 min ago", "—", true],
  ["PNG", "hero-illustration-v4.png", "LP", "Today, 11:02", "3.4 MB"],
  ["PDF", "launch-plan-v6.pdf", "TR", "Today, 9:41", "1.8 MB"],
  ["MP4", "harbor-teaser-15s.mp4", "PN", "Yesterday", "48.2 MB"],
  ["KEY", "pilot-customer-briefing.key", "MO", "26 Oct", "22.7 MB"],
  ["XLS", "pricing-annual.xlsx", "TR", "24 Oct", "64 KB"],
  ["DOC", "press-release-draft.docx", "JW", "23 Oct", "212 KB"],
  ["ZIP", "brand-fonts-2026.zip", "SA", "19 Oct", "8.9 MB"],
  ["JPG", "offsite-venue-larkspur.jpg", "MO", "17 Oct", "5.1 MB"],
  ["CSV", "pilot-signups-export.csv", "SA", "15 Oct", "38 KB"],
  ["PDF", "brand-guidelines-2026.pdf", "PN", "12 Oct", "14.6 MB"],
];
const FCOLS = "minmax(0,1fr) 170px 140px 90px 40px";
TPL["file-manager/web"] = (p, st) => shell(p, "Files", `
<div class="top"><div class="fw-crumb">${ic("folder", 15)}Files<span>/</span>Harbor launch<span>/</span><b>Design</b></div><div class="search">${ic("search", 16)}Search files</div><button class="btn">${ic("folder", 15)}New folder</button><button class="btn primary">${ic("upload", 16)}Upload</button></div>
<div style="flex:1;display:grid;grid-template-columns:236px minmax(0,1fr);min-height:0">
<div style="border-right:1px solid var(--border);padding:16px 12px;display:flex;flex-direction:column;gap:2px;font-size:13px">
${[["folder", "My files"], ["users", "Shared with me"], ["clock", "Recent"], ["star", "Starred"], ["trash", "Trash"]].map(([i, t]) => `<div class="nav" style="padding:6px 8px">${ic(i, 16)}${t}</div>`).join("")}
<div class="muted" style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;padding:14px 8px 6px">Projects</div>
${[[0, "Harbor launch", 1], [1, "Design", 2], [2, "Logos & marks"], [2, "Email assets"], [1, "Research"], [1, "Release notes"], [0, "Mobile app 2.0"], [0, "Website refresh"], [0, "Operations"]].map(([d, t, s]) => `<div class="nav${s === 2 ? " on" : ""}" style="padding:5px 8px 5px ${8 + d * 16}px;gap:6px">${d < 2 ? `<span class="muted">${ic(s ? "chevdown" : "chevron", 12)}</span>` : `<span style="width:12px"></span>`}${folderIc(18, s === 2 ? "p" : "n")}<span class="fw-ell">${t}</span></div>`).join("")}
<div class="card" style="margin-top:auto;padding:12px;display:grid;gap:8px;box-shadow:none"><div style="display:flex;justify-content:space-between;font-size:12px"><span style="font-weight:600">Storage</span><span class="muted">68.4 of 100 GB</span></div>
<div style="display:flex;height:6px;border-radius:9px;overflow:hidden;gap:2px">${[[34, "var(--primary)"], [18, "var(--accent)"], [16, "color-mix(in oklab,var(--primary) 50%,var(--accent))"], [32, "color-mix(in oklab,var(--text) 9%,var(--surface))"]].map(([w, c]) => `<span style="width:${w}%;background:${c}"></span>`).join("")}</div>
<div style="display:flex;gap:10px;font-size:11px" class="muted">${[["Video", "var(--primary)"], ["Design", "var(--accent)"], ["Docs", "color-mix(in oklab,var(--primary) 50%,var(--accent))"]].map(([t, c]) => `<span class="fw-row" style="gap:4px"><span style="width:7px;height:7px;border-radius:50%;background:${c}"></span>${t}</span>`).join("")}</div><span style="font-size:12px;font-weight:600;color:var(--primary)">Upgrade storage</span></div></div>
<div style="padding:22px 28px;display:flex;flex-direction:column;gap:18px;min-height:0;overflow:hidden;position:relative">
<div style="display:flex;align-items:end;gap:12px"><div><h1 style="font-size:${Math.round(24 * st.hscale)}px">Design</h1><div class="muted" style="font-size:13px;margin-top:2px">4 folders · 26 files · shared with 6 people</div></div><span style="margin-left:auto" class="btn">Modified ${ic("chevdown", 12)}</span><span class="btn">${ic("filter", 14)}Type</span>${seg([ic("list", 15), ic("grid", 15)], 0)}</div>
<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px">${FOLDERS.map(([t, n, tone]) => `<div class="card" style="padding:12px 14px;display:flex;align-items:center;gap:12px">${folderIc(32, tone)}<div style="min-width:0;flex:1"><div class="fw-ell" style="font-weight:600">${t}</div><div class="muted" style="font-size:12px">${n}</div></div><span class="muted">${ic("more", 16)}</span></div>`).join("")}</div>
<div class="card" style="overflow:hidden"><div style="display:grid;grid-template-columns:${FCOLS};gap:12px;padding:9px 16px;font-size:12px;font-weight:600;color:var(--muted);background:color-mix(in oklab,var(--text) 3%,var(--surface))"><span>Name</span><span>Owner</span><span>Modified</span><span>Size</span><span></span></div>
${FILES.map(([ext, n, o, m, s, star], i) => `<div style="display:grid;grid-template-columns:${FCOLS};gap:12px;align-items:center;padding:8px 16px;border-top:1px solid var(--border);${i === 2 ? "background:color-mix(in oklab,var(--primary) 8%,var(--surface))" : ""}"><div class="fw-row" style="gap:12px;min-width:0">${i === 2 ? cb(true) : ""}${fileIc(ext, 24)}<span class="fw-ell" style="font-weight:500">${n}</span>${star ? `<span style="color:var(--accent)">${ic("star", 14)}</span>` : ""}</div><span class="fw-row" style="gap:8px;font-size:13px">${av(o, 22)}<span class="fw-ell">${o === "MO" ? "You" : PEOPLE[o]}</span></span><span class="muted" style="font-size:13px">${m}</span><span class="muted" style="font-size:13px">${s}</span><span class="muted">${ic("more", 16)}</span></div>`).join("")}</div>
<div class="card" style="position:absolute;right:28px;bottom:22px;width:330px;padding:12px 14px;display:grid;gap:8px;box-shadow:var(--shadow-lg)"><div style="display:flex;justify-content:space-between;align-items:center;font-weight:600;font-size:13px">Uploading 2 files <span class="muted">${ic("x", 14)}</span></div>
<div class="fw-row" style="gap:10px">${fileIc("PNG", 18)}<div style="flex:1;display:grid;gap:4px"><div style="display:flex;justify-content:space-between;font-size:12px"><span>social-square-01.png</span><span class="muted">68%</span></div>${bar(68, 4)}</div></div></div>
</div></div>`);

TPL["file-manager/mobile"] = (p, st) => phone(`<div class="mtop"><h1 style="font-size:${Math.round(26 * st.hscale)}px">Files</h1><div class="fw-row" style="gap:14px">${ic("grid", 22)}${ic("more", 22)}</div></div>
<div class="mbody" style="gap:12px"><div class="input" style="gap:8px;flex:none">${ic("search", 16)}Search Harbor launch</div>
<div style="display:flex;gap:8px">${["Recent", "Starred", "Shared", "Offline"].map((t, i) => `<span class="fw-chip${i ? "" : " on"}">${t}</span>`).join("")}</div>
<div class="card" style="padding:12px 14px;display:grid;gap:8px"><div style="display:flex;justify-content:space-between;font-size:13px"><span style="font-weight:600">Team storage</span><span class="muted">68.4 of 100 GB</span></div>${bar(68)}</div>
<div style="display:flex;justify-content:space-between;align-items:center"><div style="font-weight:600">Folders</div><span class="muted" style="font-size:13px">See all</span></div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">${FOLDERS.map(([t, n, tone]) => `<div class="card" style="padding:10px 12px;display:flex;align-items:center;gap:10px">${folderIc(28, tone)}<div style="min-width:0"><div class="fw-ell" style="font-weight:600;font-size:13px">${t}</div><div class="muted" style="font-size:12px">${n}</div></div></div>`).join("")}</div>
<div style="font-weight:600">Recent files</div>
<div class="card">${FILES.slice(1, 5).map(([ext, n, o, m, s], i) => `<div style="display:flex;align-items:center;gap:12px;padding:9px 14px;${i ? "border-top:1px solid var(--border)" : ""}">${fileIc(ext, 22)}<div style="flex:1;min-width:0"><div class="fw-ell" style="font-weight:500;font-size:13px">${n}</div><div class="muted" style="font-size:11px">${m} · ${s}</div></div>${av(o, 22)}</div>`).join("")}</div>
</div><div class="fw-fab">${ic("upload", 22)}</div>${tabBar("Files", MTABS)}`);

// =============================================================================================
// search-results
const Q = (s) => s.replace(/launch plan/gi, (m) => `<mark class="fw-hl">${m}</mark>`);
const RES = [
  ["doc", "Harbor Q4 launch plan", "Doc · Harbor launch · edited 20 min ago by Teodora Ruiz", "…the launch plan covers three workstreams: product, comms and pilots. Dates below are confirmed with engineering as of 21 Oct…", ["TR", "MO"]],
  ["task", "Finalise Q4 launch plan for Harbor release", "Task · FW-218 · Due today · Urgent", "Pull the workstreams into one launch plan we can share with the two pilot customers on Thursday.", ["MO"]],
  ["file", "launch-plan-v6.pdf", "PDF · 1.8 MB · Files / Harbor launch / Design", "Page 3: “Launch plan at a glance” — milestones, owners and the go / no-go checklist.", ["TR"]],
  ["doc", "Mobile app 2.0 launch plan (draft)", "Doc · Mobile app 2.0 · edited 3 days ago by Priya Nair", "Rough launch plan for the app store release. Still needs QA dates and the marketing calendar.", ["PN"]],
  ["task", "Share launch plan with Ostrava Labs", "Task · FW-231 · Due 29 Oct · Assigned to Sam Achebe", "Send the PDF with a short note on what changes for their admins.", ["SA"]],
  ["doc", "Website refresh — launch plan retro", "Doc · Website refresh · edited 2 weeks ago by Jonah Weiss", "What worked: one launch plan owner, a single go / no-go call. What didn’t: comms drafted too late.", ["JW"]],
];
const resIc = (k) => k === "file" ? fileIc("PDF", 26) : `<span style="width:32px;height:32px;flex:none;border-radius:var(--radius);display:grid;place-items:center;${k === "doc" ? "background:color-mix(in oklab,var(--primary) 12%,var(--surface));color:var(--primary)" : "background:color-mix(in oklab,var(--accent) 14%,var(--surface));color:color-mix(in oklab,var(--accent) 75%,var(--text))"}">${ic(k === "doc" ? "doc" : "check", 17)}</span>`;
const facet = (h, rows, radio) => `<div style="display:grid;gap:8px"><div style="font-weight:600;font-size:13px">${h}</div>${rows.map(([t, n, on]) => `<div class="fw-row" style="gap:9px;font-size:13px">${radio ? `<span style="width:16px;height:16px;border-radius:50%;border:${on ? "5px solid var(--primary)" : "1.5px solid var(--border)"};flex:none"></span>` : `<span class="fw-cb${on ? " on" : ""}" style="width:16px;height:16px">${on ? ic("check", 11) : ""}</span>`}<span style="flex:1" class="fw-row">${t}</span>${n != null ? `<span class="muted" style="font-size:12px">${n}</span>` : ""}</div>`).join("")}</div>`;

TPL["search-results/web"] = (p, st) => shell(p, "", `
<div class="top"><div class="input filled" style="flex:1;max-width:640px;height:40px;gap:10px;border-color:var(--primary);box-shadow:0 0 0 3px color-mix(in oklab,var(--primary) 18%,transparent)">${ic("search", 17)}<span style="flex:1">launch plan</span><span class="muted">${ic("x", 15)}</span></div><span class="muted" style="font-size:12px;margin-left:auto">Press <b style="font-weight:600;color:var(--text)">↵</b> to open · <b style="font-weight:600;color:var(--text)">⌘K</b> anywhere</span></div>
<div style="flex:1;display:grid;grid-template-columns:240px minmax(0,1fr) 280px;min-height:0">
<div style="border-right:1px solid var(--border);padding:22px 20px;display:grid;gap:22px;align-content:start">
${facet("Type", [[`${ic("grid", 14)}All results`, 38, true], [`${ic("check", 14)}Tasks`, 14], [`${ic("doc", 14)}Docs`, 9], [`${ic("folder", 14)}Files`, 11], [`${ic("users", 14)}People`, 4]], true)}
${facet("Owner", [[`${av("MO", 20)}Me`, 12, true], [`${av("TR", 20)}Teodora Ruiz`, 9, true], [`${av("PN", 20)}Priya Nair`, 6], [`${av("SA", 20)}Sam Achebe`, 5]])}
${facet("Modified", [["Any time", null], ["Past week", null, true], ["Past 30 days", null], ["Custom range…", null]], true)}
${facet("Project", [["Harbor launch", 21, true], ["Mobile app 2.0", 8], ["Website refresh", 5]])}</div>
<div style="padding:22px 28px;display:flex;flex-direction:column;gap:14px;overflow:hidden">
<div style="display:flex;align-items:baseline;gap:10px"><h1 style="font-size:${Math.round(22 * st.hscale)}px">Results for “launch plan”</h1><span class="muted" style="font-size:13px">21 of 38 · filtered</span><span class="btn" style="margin-left:auto;height:32px">Sort: Relevance ${ic("chevdown", 12)}</span></div>
<div style="display:flex;gap:6px;flex-wrap:wrap">${["Owner: Me, Teodora", "Past week", "Harbor launch"].map((t) => `<span class="fw-chip" style="height:26px;font-size:12px">${t}${ic("x", 12)}</span>`).join("")}<span style="font-size:12px;color:var(--primary);font-weight:600;align-self:center;margin-left:4px">Clear all</span></div>
${RES.slice(0, 5).map(([k, t, meta, snip, ppl], i) => `<div class="card" style="padding:14px 16px;display:flex;gap:14px;${i ? "" : "border-color:var(--primary);box-shadow:0 0 0 1px var(--primary)"}">${resIc(k)}<div style="flex:1;min-width:0;display:grid;gap:3px"><div style="font-weight:600;font-size:15px" class="fw-ell">${Q(t)}</div><div class="muted fw-ell" style="font-size:12px">${meta}</div><div style="font-size:13px;line-height:1.5;margin-top:2px">${Q(snip)}</div></div><div style="display:grid;justify-items:end;align-content:space-between;gap:8px">${stack(ppl, 22)}${i ? "" : `<span class="badge">Best match</span>`}</div></div>`).join("")}
<div style="display:flex;justify-content:center;gap:8px;align-items:center"><span class="btn">Show 16 more results</span><span class="muted" style="font-size:12px">or press ↓ to keep scrolling</span></div></div>
<div style="border-left:1px solid var(--border);padding:22px 20px;display:grid;gap:14px;align-content:start;background:color-mix(in oklab,var(--surface) 60%,var(--bg))">
<div style="font-weight:600">People <span class="muted" style="font-weight:500;font-size:13px">4</span></div>
${[["TR", "Teodora Ruiz", "Studio lead · owns 6 launch docs"], ["PN", "Priya Nair", "Product designer · Mobile app 2.0"], ["SA", "Sam Achebe", "Engineer · 3 launch tasks"], ["JW", "Jonah Weiss", "Content · Harbor release notes"]].map(([k, n, r]) => `<div class="fw-row" style="gap:10px">${av(k, 34)}<div style="min-width:0"><div style="font-weight:500">${n}</div><div class="muted fw-ell" style="font-size:12px">${r}</div></div></div>`).join("")}
<div style="border-top:1px solid var(--border);padding-top:14px;display:grid;gap:10px"><div style="font-weight:600;font-size:13px">Projects</div>${[["Harbor launch", "21 matches", "p"], ["Mobile app 2.0", "8 matches", "a"]].map(([t, n, tone]) => `<div class="fw-row" style="gap:10px">${folderIc(26, tone)}<div><div style="font-weight:500;font-size:13px">${t}</div><div class="muted" style="font-size:11px">${n}</div></div></div>`).join("")}</div>
<div style="border-top:1px solid var(--border);padding-top:14px;display:grid;gap:8px"><div style="font-weight:600;font-size:13px">Recent searches</div>${["pricing annual", "ostrava sso", "icon set v3"].map((t) => `<div class="fw-row muted" style="gap:8px;font-size:13px">${ic("clock", 14)}${t}</div>`).join("")}</div>
<div class="card" style="padding:12px;display:grid;gap:6px;box-shadow:none;font-size:12px"><div style="font-weight:600;font-size:13px;display:flex;gap:6px;align-items:center">${ic("bolt", 14)}Search tips</div><span class="muted"><b style="color:var(--text);font-weight:600">type:doc</b> only docs · <b style="color:var(--text);font-weight:600">from:teodora</b> by owner · <b style="color:var(--text);font-weight:600">"…"</b> exact phrase</span></div>
</div></div>`);

TPL["search-results/mobile"] = (p, st) => phone(`<div style="display:flex;gap:12px;align-items:center;padding:6px 16px 10px;flex:none"><div class="input filled" style="flex:1;gap:8px;border-color:var(--primary)">${ic("search", 16)}<span style="flex:1">launch plan</span><span class="muted">${ic("x", 14)}</span></div><span style="color:var(--primary);font-weight:600">Cancel</span></div>
<div style="display:flex;gap:8px;padding:0 16px 10px;overflow:hidden;flex:none">${[["All", 38], ["Tasks", 14], ["Docs", 9], ["Files", 11], ["People", 4]].map(([t, n], i) => `<span class="fw-chip${i ? "" : " on"}">${t}<span style="opacity:.6">${n}</span></span>`).join("")}</div>
<div class="mbody" style="gap:10px;padding-top:6px"><div style="display:flex;justify-content:space-between;font-size:12px" class="muted"><span>38 results</span><span class="fw-row" style="gap:4px">${ic("filter", 13)}Relevance</span></div>
<div class="card">${RES.slice(0, 4).map(([k, t, meta, snip], i) => `<div style="display:flex;gap:12px;padding:12px 14px;${i ? "border-top:1px solid var(--border)" : ""}">${resIc(k)}<div style="flex:1;min-width:0;display:grid;gap:2px"><div class="fw-ell" style="font-weight:600">${Q(t)}</div><div class="muted fw-ell" style="font-size:11px">${meta.split(" · ").slice(0, 2).join(" · ")}</div><div style="font-size:12px;line-height:1.45;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${Q(snip)}</div></div></div>`).join("")}</div>
<div style="display:flex;justify-content:space-between;align-items:center"><div style="font-weight:600">People</div><span class="muted" style="font-size:13px">See all 4</span></div>
<div style="display:flex;gap:14px">${[["TR", "Teodora"], ["PN", "Priya"], ["SA", "Sam"], ["JW", "Jonah"]].map(([k, n]) => `<div style="display:grid;justify-items:center;gap:4px;font-size:12px;flex:1">${av(k, 46)}${n}</div>`).join("")}</div>
</div>${tabBar("", MTABS)}`);

// =============================================================================================
// editor-toolbar — Fernway Docs
const TOOLS = (big) => `<span class="btn" style="height:30px;padding:0 10px;font-size:13px">Heading 2 ${ic("chevdown", 12)}</span><span class="fw-sep"></span>
${[["bold"], ["italic", 1], ["heading"], ["sep"], ["list"], ["check"], ["quote"], ["sep"], ["link"], ["image"], ["chat"], ["sep"], ["more"]].map(([n, on]) => n === "sep" ? '<span class="fw-sep"></span>' : `<span class="fw-tool${on ? " on" : ""}" title="${n}">${ic(n, big ? 17 : 18)}</span>`).join("")}`;
const cursor = (k, name) => `<span style="position:relative;display:inline-block;width:2px;height:1.2em;vertical-align:-3px;background:var(--accent)"><span style="position:absolute;bottom:100%;left:-1px;font:600 10px var(--font-b);background:var(--accent);color:var(--on-primary);padding:1px 5px;border-radius:3px 3px 3px 0;white-space:nowrap">${name}</span></span>`;
const commented = (s) => `<span style="background:color-mix(in oklab,var(--accent) 22%,transparent);border-bottom:2px solid var(--accent)">${s}</span>`;

TPL["editor-toolbar/web"] = (p, st) => shell(p, "Docs", `
<div class="top"><div class="fw-crumb">${ic("doc", 15)}Docs<span>/</span>Harbor launch<span>/</span><b>Harbor Q4 launch plan</b></div><span class="muted fw-row" style="gap:6px;font-size:12px;margin-left:8px">${ic("check", 13)}Saved</span>
<span style="margin-left:auto" class="fw-row"><span class="fw-stack">${["TR", "LP", "SA"].map((k) => av(k, 28)).join("")}</span><span class="muted" style="font-size:12px;margin-left:8px">3 editing</span></span><button class="btn">${ic("chat", 15)}4</button><button class="btn primary">${ic("share", 15)}Share</button></div>
<div style="display:flex;align-items:center;gap:2px;padding:6px 28px;border-bottom:1px solid var(--border);background:color-mix(in oklab,var(--surface) 70%,var(--bg))">${TOOLS(true)}<span class="muted" style="margin-left:auto;font-size:12px">Last edit by Lin Park · just now</span></div>
<div style="flex:1;display:grid;grid-template-columns:minmax(0,1fr) 300px;min-height:0;overflow:hidden">
<article style="padding:36px 0 0 max(56px,calc(50% - 300px));padding-right:40px;display:grid;gap:14px;align-content:start;line-height:1.65;max-width:900px">
<div class="fw-row" style="gap:8px">${tag("Launch")}<span class="muted" style="font-size:12px">Teodora Ruiz · Updated 28 Oct · 6 min read</span></div>
<h1 style="font-size:${Math.round(36 * st.hscale)}px">Harbor Q4 launch plan</h1>
<p>Harbor 2.4 ships to everyone on <b>Tuesday 10 November</b>. This plan lines up product, comms and our two pilot customers so nobody hears about it from a changelog first.</p>
<h2 style="font-size:${Math.round(22 * st.hscale)}px;margin-top:6px">Goals</h2>
<p>${commented("Move 40% of active teams onto annual billing by the end of Q1")}, and get both pilots — Ostrava Labs and Brightwell Studio — to publish a case study. ${cursor("LP", "Lin Park")}</p>
<h2 style="font-size:${Math.round(22 * st.hscale)}px;margin-top:6px">Before launch day</h2>
<div style="display:grid;gap:8px">${[["Lock annual pricing ($24 / seat)", true], ["Announcement email and in-app banner", true], ["Legal sign-off on the comparison page", false], ["Brief support on the new Files permissions", false]].map(([t, d]) => `<div class="fw-row" style="gap:10px">${cb(d)}<span style="${d ? "text-decoration:line-through;color:var(--muted)" : ""}">${t}</span></div>`).join("")}</div>
<blockquote style="border-left:3px solid var(--primary);padding:4px 0 4px 16px;color:var(--muted)">If we slip past 10 Nov, we hold until after the holiday freeze — no partial launch.</blockquote>
<h2 style="font-size:${Math.round(22 * st.hscale)}px;margin-top:6px">Timeline</h2>
<div style="border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;font-size:13px;line-height:1.4">${[["Date", "Milestone", "Owner"], ["27 Oct", "Code freeze for Harbor 2.4", "SA"], ["29 Oct", "Pilots receive the plan PDF", "MO"], ["30 Oct", "Go / no-go call", "TR"], ["10 Nov", "General availability + email send", "LP"]].map((r, i) => `<div style="display:grid;grid-template-columns:90px 1fr 150px;gap:12px;padding:8px 12px;${i ? "border-top:1px solid var(--border)" : "background:color-mix(in oklab,var(--text) 4%,var(--surface));font-weight:600;color:var(--muted);font-size:12px"}"><span>${r[0]}</span><span>${r[1]}</span><span class="fw-row" style="gap:6px">${i ? av(r[2], 20) + PEOPLE[r[2]] : r[2]}</span></div>`).join("")}</div>
</article>
<aside style="padding:150px 24px 0 8px;display:grid;gap:12px;align-content:start">
<div class="card" style="padding:14px;display:grid;gap:10px;box-shadow:var(--shadow);border-left:3px solid var(--accent)"><div class="fw-row" style="gap:8px">${av("JW", 26)}<div><div style="font-weight:600;font-size:13px">Jonah Weiss</div><div class="muted" style="font-size:11px">35 min ago</div></div><span class="muted" style="margin-left:auto">${ic("check", 15)}</span></div>
<div style="font-size:13px">Is 40% realistic? Last year’s switch peaked at 28%. Suggest 35% with a stretch goal.</div>
<div style="border-top:1px solid var(--border);padding-top:10px;display:flex;gap:8px;font-size:13px">${av("TR", 22)}<div><b style="font-weight:600">Teodora</b> <span class="muted" style="font-size:11px">· 12 min</span><div>Pricing is better this time — keeping 40, adding a note.</div></div></div>
<div class="input" style="height:34px;font-size:13px">Reply…</div></div>
<div class="muted" style="font-size:12px;display:flex;gap:6px;align-items:center;padding-left:4px">${ic("chat", 13)}3 more comments below</div></aside></div>`);

const KEYS = [["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"], ["a", "s", "d", "f", "g", "h", "j", "k", "l"], ["⇧", "z", "x", "c", "v", "b", "n", "m", "⌫"]];
TPL["editor-toolbar/mobile"] = (p, st) => phone(`<div class="mtop" style="border-bottom:1px solid var(--border)">${ic("back", 22)}<div style="text-align:center;min-width:0"><div style="font-weight:600" class="fw-ell">Harbor Q4 launch plan</div><div class="muted" style="font-size:11px">Saved · 3 editing</div></div><span class="fw-stack">${av("TR", 24)}${av("LP", 24)}</span></div>
<div class="mbody" style="padding-top:16px;gap:10px;line-height:1.55;font-size:15px"><h1 style="font-size:${Math.round(24 * st.hscale)}px">Harbor Q4 launch plan</h1>
<p>Harbor 2.4 ships to everyone on <b>Tuesday 10 November</b>. This plan lines up product, comms and both pilot customers.</p>
<h2 style="font-size:${Math.round(18 * st.hscale)}px">Before launch day</h2>
<div style="display:grid;gap:7px">${[["Lock annual pricing", true], ["Announcement email and banner", true], ["Legal sign-off on comparison page", false]].map(([t, d]) => `<div class="fw-row" style="gap:10px">${cb(d)}<span style="${d ? "text-decoration:line-through;color:var(--muted)" : ""}">${t}</span></div>`).join("")}
<div class="fw-row" style="gap:10px">${cb(false)}<span>Brief support on Files permis<span style="display:inline-block;width:2px;height:1.1em;vertical-align:-2px;background:var(--primary)"></span></span></div></div>
<h2 style="font-size:${Math.round(18 * st.hscale)}px">Timeline</h2><p class="muted" style="font-size:14px">Code freeze 27 Oct · pilots get the PDF 29 Oct · go / no-go 30 Oct · launch 10 Nov.</p></div>
<div style="flex:none;display:flex;align-items:center;gap:0;padding:4px 8px;border-top:1px solid var(--border);background:var(--surface);overflow:hidden">${["heading", "bold", "italic", "list", "check", "link", "image", "chat"].map((n, i) => `<span class="fw-tool${i === 4 ? " on" : ""}" style="width:40px;height:38px">${ic(n, 19)}</span>`).join("")}<span class="fw-sep"></span><span class="fw-tool" style="width:36px;color:var(--primary)">${ic("chevdown", 19)}</span></div>
<div style="flex:none;padding:8px 4px 30px;background:color-mix(in oklab,var(--text) 10%,var(--bg));display:grid;gap:10px">
<div style="display:flex;justify-content:space-around;font-size:14px;padding:2px 0 0" class="muted"><span>permissions</span><span style="color:var(--text);font-weight:600">“permis”</span><span>permission</span></div>
${KEYS.map((r, ri) => `<div style="display:flex;gap:6px;justify-content:center;padding:0 ${ri === 1 ? 18 : 0}px">${r.map((k) => `<span style="flex:${k.length > 1 || "⇧⌫".includes(k) ? 1.4 : 1};height:40px;border-radius:5px;background:${"⇧⌫".includes(k) ? "color-mix(in oklab,var(--text) 22%,var(--bg))" : "var(--bg)"};box-shadow:0 1px 0 color-mix(in oklab,var(--text) 30%,transparent);display:grid;place-items:center;font-size:18px">${k}</span>`).join("")}</div>`).join("")}
<div style="display:flex;gap:6px;padding:0 0"><span style="flex:1.3;height:40px;border-radius:5px;background:color-mix(in oklab,var(--text) 22%,var(--bg));display:grid;place-items:center;font-size:14px">123</span><span style="flex:5;height:40px;border-radius:5px;background:var(--bg);box-shadow:0 1px 0 color-mix(in oklab,var(--text) 30%,transparent);display:grid;place-items:center;font-size:14px">space</span><span style="flex:1.6;height:40px;border-radius:5px;background:color-mix(in oklab,var(--text) 22%,var(--bg));display:grid;place-items:center;font-size:14px">return</span></div></div>`);

// =============================================================================================
const def = (name, shows, elements, key) => ({ family: "workspace", name, shows, elements, web: TPL[key + "/web"], mobile: TPL[key + "/mobile"] });
module.exports = {
  "list-view": def("Task list (My tasks)", "tasks grouped by due date with checkboxes, tags, priority, due dates, assignee avatars and a filter and sort bar",
    ["sidebar-nav", "list", "checkbox", "avatar", "tag", "priority", "filter-bar", "segmented-control", "fab"], "list-view"),
  "detail-view": def("Task detail", "a task's title, status, description, attachments, a subtask checklist, a comment thread and a properties sidebar",
    ["sidebar-nav", "breadcrumbs", "status-pill", "checklist", "progress", "comments", "properties-panel", "attachments"], "detail-view"),
  "kanban-board": def("Kanban board", "four status columns of task cards with labels, due chips, comment and subtask counts and assignee avatars",
    ["sidebar-nav", "kanban", "card", "tag", "avatar", "segmented-control", "filter-bar", "tabs"], "kanban-board"),
  "calendar": def("Calendar (week view)", "a week time grid with colour-coded and overlapping events, an all-day row, a mini month and calendar toggles",
    ["sidebar-nav", "calendar", "time-grid", "mini-month", "segmented-control", "event-card", "agenda-list"], "calendar"),
  "file-manager": def("File manager", "a folder tree, folder cards, a file list with type icons, owners, dates and sizes, storage usage and an upload in progress",
    ["sidebar-nav", "folder-tree", "breadcrumbs", "file-list", "file-icon", "storage-meter", "upload", "view-toggle"], "file-manager"),
  "search-results": def("Search results", "mixed task, doc, file and people results for a query with highlighted matches and type, owner and date filters",
    ["search-bar", "filter-facets", "highlight", "result-list", "chips", "avatar", "radio", "checkbox"], "search-results"),
  "editor-toolbar": def("Document editor with toolbar", "a formatting toolbar, a document with headings, a checklist and a quote, live collaborator cursors and a margin comment",
    ["sidebar-nav", "editor", "toolbar", "checklist", "collaborators", "comments", "breadcrumbs", "keyboard"], "editor-toolbar"),
};
