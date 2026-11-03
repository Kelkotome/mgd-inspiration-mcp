/* Interaction-state screens (3-Nov-2026): overlays and inline states rendered ON TOP of an existing family screen, so the
   context is real: toast with undo, destructive confirm dialog, side drawer, command palette, date-range picker, and a form
   with inline validation errors. Backgrounds come from the existing templates (same product, palette and copy).
   Original content only; colours from tokens (status tokens for errors / destructive actions). */
const { ic, esc, status, tabBar } = require("../lib");
const W = require("./workspace"), A = require("./apps"), ACC = require("./account");

const hs = (st, n) => `font-size:${Math.round(n * st.hscale)}px`;
// Scrim: --ink is always the darker of text/background, so the dimming works in light and dark themes.
const SCRIM = `position:absolute;inset:0;background:color-mix(in oklab,var(--ink) 42%,transparent)`;
const stage = (bg, over) => `<div style="position:relative;height:100%;overflow:hidden">${bg}${over}</div>`;
const kbd = (k) => `<span style="display:inline-grid;place-items:center;min-width:20px;height:20px;padding:0 5px;border:1px solid var(--border);border-bottom-width:2px;border-radius:var(--radius-sm);font:600 11px var(--font-b);color:var(--muted);background:var(--bg)">${k}</span>`;
const dangerBtn = (label, extra = "") => `<button class="btn" style="background:var(--danger);border-color:var(--danger);color:var(--on-danger)${extra}">${label}</button>`;
const errText = (t) => `<div style="display:flex;align-items:center;gap:6px;color:var(--danger);font-size:12px;font-weight:500">${ic("x", 13)}${esc(t)}</div>`;
const errInput = (val) => `<div class="input filled" style="border-color:var(--danger);box-shadow:0 0 0 3px color-mix(in oklab,var(--danger) 16%,transparent)">${esc(val)}</div>`;
const okInput = (val) => `<div class="input filled" style="justify-content:space-between">${esc(val)}<span style="color:var(--success);display:inline-flex">${ic("check", 15)}</span></div>`;

const TPL = {};

// ---------------------------------------------------------------- toast with undo (over the task list)
TPL["toast-snackbar"] = {
  family: "workspace", name: "Toast with undo (task deleted)",
  shows: "the task list right after a task is deleted: the row collapsing out, a toast 'Task deleted' with the task name, an Undo action, a keyboard hint and a countdown bar, plus a smaller success toast stacked above it",
  elements: ["toast", "snackbar", "undo", "list", "checkbox", "sidebar-nav", "progress", "notification"],
  web: (p, st, rnd) => stage(W["list-view"].web(p, st, rnd), `
<div style="position:absolute;left:256px;bottom:24px;display:grid;gap:10px;width:420px">
  <div class="card" style="display:flex;align-items:center;gap:10px;padding:10px 14px;box-shadow:var(--shadow)"><span style="color:var(--success);display:inline-flex">${ic("check", 16)}</span><span style="flex:1;font-size:13px">3 subtasks moved to <b>Launch checklist</b></span><span class="muted" style="font-size:12px">now</span></div>
  <div style="position:relative;overflow:hidden;display:flex;align-items:center;gap:12px;padding:14px 16px;border-radius:var(--radius-lg);background:var(--text);color:var(--bg);box-shadow:var(--shadow-lg)">
    <span style="display:inline-flex;opacity:.8">${ic("trash", 18)}</span>
    <div style="flex:1;min-width:0"><div style="font-weight:600">Task deleted</div><div style="font-size:12px;opacity:.75;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">“Draft Q3 launch brief” · restore within 10 s</div></div>
    <button class="btn" style="height:32px;background:transparent;border-color:color-mix(in oklab,var(--bg) 40%,transparent);color:var(--bg)">Undo</button>
    <span style="font-size:11px;opacity:.65">⌘Z</span><span style="display:inline-flex;opacity:.65">${ic("x", 15)}</span>
    <div style="position:absolute;left:0;bottom:0;height:3px;width:62%;background:var(--primary)"></div></div>
</div>`),
  mobile: (p, st, rnd) => stage(W["list-view"].mobile(p, st, rnd), `
<div style="position:absolute;left:12px;right:12px;bottom:92px;position:absolute;overflow:hidden;display:flex;align-items:center;gap:12px;padding:14px 16px;border-radius:var(--radius-lg);background:var(--text);color:var(--bg);box-shadow:var(--shadow-lg)">
  <div style="flex:1;min-width:0"><div style="font-weight:600">Task deleted</div><div style="font-size:12px;opacity:.75;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">“Draft Q3 launch brief”</div></div>
  <span style="font-weight:700;letter-spacing:.02em;color:color-mix(in oklab,var(--primary) 55%,var(--bg))">UNDO</span>
  <div style="position:absolute;left:0;bottom:0;height:3px;width:62%;background:var(--primary)"></div></div>`),
};

// ---------------------------------------------------------------- destructive confirm dialog (over settings)
TPL["confirm-dialog"] = {
  family: "workspace", name: "Confirm delete dialog (destructive)",
  shows: "a modal over workspace settings that confirms deleting the workspace: what will be lost (tasks, docs, files, members), an export-first link, a type-the-workspace-name field, an acknowledgement checkbox, Cancel and a red Delete workspace button that stays disabled until confirmed",
  elements: ["modal", "dialog", "confirmation", "destructive-action", "form", "checkbox", "overlay", "button"],
  web: (p, st, rnd) => stage(ACC["settings"].web(p, st, rnd), `<div style="${SCRIM}"></div>
<div role="dialog" aria-modal="true" class="card" style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:500px;padding:24px;display:grid;gap:16px;box-shadow:var(--shadow-lg)">
  <div style="display:flex;gap:14px;align-items:flex-start"><div style="flex:none;width:40px;height:40px;border-radius:50%;display:grid;place-items:center;background:color-mix(in oklab,var(--danger) 14%,var(--surface));color:var(--danger)">${ic("trash", 20)}</div>
    <div><h2 style="${hs(st, 20)}">Delete Palo Verde Co.?</h2><p class="muted" style="margin-top:4px">This can’t be undone. Every task, doc and file in this workspace is removed for all 18 members.</p></div></div>
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px">${[["1,284", "tasks"], ["312", "docs"], ["4.2 GB", "files"], ["18", "members"]].map(([n, l]) => `<div style="border:1px solid var(--border);border-radius:var(--radius);padding:10px;text-align:center"><div class="num" style="font-size:17px">${n}</div><div class="muted" style="font-size:12px">${l}</div></div>`).join("")}</div>
  <div style="font-size:13px;display:flex;gap:8px;align-items:center">${ic("download", 15)}<span>Need a copy? <u>Export everything</u> first (ZIP, ~4.3 GB).</span></div>
  <div class="field"><label>Type <b>Palo Verde Co.</b> to confirm</label><div class="input filled">Palo Verde<span style="width:1px;height:18px;background:var(--text);margin-left:1px"></span></div></div>
  <label style="display:flex;gap:10px;align-items:center;font-size:13px"><span style="flex:none;width:16px;height:16px;border:1.5px solid var(--border);border-radius:4px"></span>I understand members lose access immediately</label>
  <div style="display:flex;justify-content:flex-end;gap:8px;border-top:1px solid var(--border);padding-top:16px"><button class="btn">Cancel</button>${dangerBtn(`${ic("trash", 15)}Delete workspace`, ";opacity:.45")}</div>
</div>`),
  mobile: (p, st, rnd) => stage(ACC["settings"].mobile(p, st, rnd), `<div style="${SCRIM}"></div>
<div role="dialog" aria-modal="true" class="card" style="position:absolute;left:20px;right:20px;top:50%;transform:translateY(-50%);padding:22px;display:grid;gap:14px;text-align:center;box-shadow:var(--shadow-lg)">
  <div style="justify-self:center;width:48px;height:48px;border-radius:50%;display:grid;place-items:center;background:color-mix(in oklab,var(--danger) 14%,var(--surface));color:var(--danger)">${ic("trash", 22)}</div>
  <h2 style="${hs(st, 19)}">Delete Palo Verde Co.?</h2>
  <p class="muted" style="font-size:13px">1,284 tasks, 312 docs and 4.2 GB of files are removed for all 18 members. This can’t be undone.</p>
  <div class="field" style="text-align:left"><label>Type <b>Palo Verde Co.</b></label><div class="input filled">Palo Verde Co.</div></div>
  ${dangerBtn("Delete workspace", ";height:44px;width:100%")}<button class="btn" style="height:44px;width:100%">Cancel</button>
</div>`),
};

// ---------------------------------------------------------------- side drawer (over the customers table)
const drawerBody = (st) => `
  <div style="display:flex;align-items:center;gap:12px"><div class="avatar" style="width:44px;height:44px;font-size:14px">HB</div><div style="flex:1"><div style="font-weight:600;font-size:16px">Halden Bikes</div><div class="muted" style="font-size:12px">ops@haldenbikes.example · Oslo, NO</div></div><span class="badge">Active</span></div>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">${[["MRR", "$1,240"], ["Seats", "24 / 30"], ["Since", "Mar 2024"]].map(([l, n]) => `<div style="border:1px solid var(--border);border-radius:var(--radius);padding:10px"><div class="muted" style="font-size:11px">${l}</div><div class="num" style="font-size:16px;margin-top:2px">${n}</div></div>`).join("")}</div>
  <div style="display:flex;gap:18px;border-bottom:1px solid var(--border);font-weight:500;font-size:13px">${["Overview", "Invoices", "Activity", "Notes"].map((t, i) => `<div style="padding:8px 0;${i ? "color:var(--muted)" : "border-bottom:2px solid var(--primary)"}">${t}</div>`).join("")}</div>
  <div style="display:grid;gap:10px;font-size:13px">${[["Plan", "Growth · annual"], ["Next invoice", "Dec 1 · $14,880"], ["Payment", "Card •••• 4417 · exp 08/27"], ["Owner", "Sam Achebe"], ["Health", "Usage up 18% in 30 days"]].map(([k, v]) => `<div style="display:flex;justify-content:space-between;gap:12px"><span class="muted">${k}</span><span style="font-weight:500;text-align:right">${v}</span></div>`).join("")}</div>
  <div style="display:grid;gap:8px"><div class="muted" style="font-size:11px;text-transform:uppercase;letter-spacing:.06em;font-weight:600">Recent activity</div>${[["card", "Invoice #INV-2291 paid", "2 days ago"], ["users", "6 seats added by Lin Park", "Oct 28"], ["refresh", "Renewed Growth annual", "Mar 1"]].map(([i, t, d]) => `<div style="display:flex;gap:10px;align-items:center;font-size:13px"><span class="muted" style="display:inline-flex">${ic(i, 15)}</span><span style="flex:1">${t}</span><span class="muted" style="font-size:12px">${d}</span></div>`).join("")}</div>`;
TPL["side-drawer"] = {
  family: "finance", name: "Side drawer over a data table (record details)",
  shows: "a right-hand drawer sliding over the customers table with the selected row still highlighted: customer header and status, MRR / seats / customer-since tiles, tabs, plan and payment details, recent activity and a sticky footer with Open full page and Edit (a bottom sheet on mobile)",
  elements: ["drawer", "side-panel", "overlay", "tabs", "kpi-tiles", "badge", "avatar", "timeline", "table"],
  web: (p, st, rnd) => stage(A["data-table"].web(p, st, rnd), `<div style="${SCRIM};background:color-mix(in oklab,var(--ink) 22%,transparent)"></div>
<aside class="drawer" role="dialog" aria-label="Customer details" style="position:absolute;top:0;right:0;bottom:0;width:440px;background:var(--surface);border-left:1px solid var(--border);box-shadow:var(--shadow-lg);display:flex;flex-direction:column">
  <div style="display:flex;align-items:center;gap:10px;padding:14px 20px;border-bottom:1px solid var(--border)"><span class="muted" style="font-size:12px;flex:1">Customers / CUS-0418</span><span class="muted" style="display:inline-flex">${ic("link", 16)}</span><span class="muted" style="display:inline-flex">${ic("more", 16)}</span><span style="display:inline-flex">${ic("x", 18)}</span></div>
  <div style="flex:1;overflow:hidden;padding:20px;display:grid;gap:18px;align-content:start">${drawerBody(st)}</div>
  <div style="display:flex;gap:8px;padding:14px 20px;border-top:1px solid var(--border)"><button class="btn" style="flex:1">Open full page</button><button class="btn primary" style="flex:1">${ic("edit", 15)}Edit customer</button></div>
</aside>`),
  mobile: (p, st, rnd) => stage(A["data-table"].mobile(p, st, rnd), `<div style="${SCRIM}"></div>
<div class="sheet" role="dialog" style="position:absolute;left:0;right:0;bottom:0;height:640px;background:var(--surface);border-radius:var(--radius-lg) var(--radius-lg) 0 0;box-shadow:var(--shadow-lg);padding:10px 20px 28px;display:grid;gap:16px;align-content:start">
  <div style="justify-self:center;width:40px;height:5px;border-radius:9px;background:var(--border)"></div>${drawerBody(st)}
  <button class="btn primary block">${ic("edit", 15)}Edit customer</button></div>`),
};

// ---------------------------------------------------------------- command palette (over the kanban board)
const CMD = [["Jump to", [["folder", "Website relaunch", "Project", ""], ["doc", "Q3 launch brief", "Doc · edited 2 h ago", ""]]],
  ["Actions", [["plus", "Create task in Website relaunch", "", "C"], ["users", "Invite teammate…", "", "I"], ["calendar", "Set due date…", "", "D"], ["tag", "Add label…", "", "L"]]],
  ["Recent", [["check", "Fix nav overlap on Safari", "Task · Lin Park", ""], ["image", "hero-v4-final.png", "File · 2.1 MB", ""]]]];
TPL["command-palette"] = {
  family: "workspace", name: "Command palette (open)",
  shows: "a ⌘K command palette over the kanban board: a search field with the typed query, grouped results (jump to, actions with keyboard shortcuts, recent items), the highlighted row, and a footer with navigate / open / close key hints",
  elements: ["command-palette", "search-bar", "dropdown", "modal", "overlay", "keyboard-shortcuts", "list"],
  web: (p, st, rnd) => stage(W["kanban-board"].web(p, st, rnd), `<div style="${SCRIM}"></div>
<div role="dialog" aria-modal="true" class="card" style="position:absolute;left:50%;top:120px;transform:translateX(-50%);width:620px;overflow:hidden;box-shadow:var(--shadow-lg);padding:0">
  <div style="display:flex;align-items:center;gap:10px;padding:14px 18px;border-bottom:1px solid var(--border)">${ic("search", 18)}<span style="flex:1;font-size:16px">laun<span style="display:inline-block;width:1px;height:18px;background:var(--text);vertical-align:middle"></span></span>${kbd("esc")}</div>
  <div style="padding:8px">${CMD.map(([g, rows], gi) => `<div class="muted" style="font:600 11px var(--font-b);text-transform:uppercase;letter-spacing:.06em;padding:10px 10px 4px">${g}</div>` + rows.map(([i, t, s, k], ri) => `<div style="display:flex;align-items:center;gap:12px;padding:9px 10px;border-radius:var(--radius);${gi === 1 && ri === 0 ? "background:color-mix(in oklab,var(--primary) 12%,var(--surface))" : ""}"><span class="muted" style="display:inline-flex">${ic(i, 16)}</span><span style="flex:1;font-weight:500">${t}${s ? ` <span class="muted" style="font-weight:400;font-size:12px">· ${s}</span>` : ""}</span>${k ? kbd(k) : ""}${gi === 1 && ri === 0 ? `<span class="muted" style="display:inline-flex">${ic("arrow", 14)}</span>` : ""}</div>`).join("")).join("")}</div>
  <div style="display:flex;gap:16px;align-items:center;padding:10px 18px;border-top:1px solid var(--border);font-size:12px;color:var(--muted);background:color-mix(in oklab,var(--surface) 50%,var(--bg))">${kbd("↑")}${kbd("↓")} navigate <span style="display:inline-flex;gap:4px;align-items:center">${kbd("↵")} open</span><span style="margin-left:auto;display:inline-flex;gap:4px;align-items:center">${kbd("⌘")}${kbd("K")} toggle</span></div>
</div>`),
  mobile: (p, st, rnd) => stage(W["kanban-board"].mobile(p, st, rnd), `
<div style="position:absolute;inset:0;background:var(--bg);display:flex;flex-direction:column">${status()}
  <div style="display:flex;align-items:center;gap:10px;padding:6px 16px 12px"><div class="input filled" style="flex:1;gap:8px">${ic("search", 16)}laun</div><span style="color:var(--primary);font-weight:600">Cancel</span></div>
  <div style="padding:0 16px;display:grid;gap:2px">${CMD.map(([g, rows]) => `<div class="muted" style="font:600 11px var(--font-b);text-transform:uppercase;letter-spacing:.06em;padding:12px 0 4px">${g}</div>` + rows.map(([i, t, s], ri) => `<div style="display:flex;align-items:center;gap:12px;padding:11px 0;border-bottom:1px solid var(--border)"><span class="muted" style="display:inline-flex">${ic(i, 18)}</span><span style="flex:1;font-weight:500">${t}${s ? `<div class="muted" style="font-weight:400;font-size:12px">${s}</div>` : ""}</span></div>`).join("")).join("")}</div>
  <div style="margin-top:auto;padding:14px 16px 30px;border-top:1px solid var(--border);display:flex;gap:10px;align-items:center;color:var(--muted);font-size:13px">${ic("search", 15)}Search “laun” in all docs and files<span style="margin-left:auto;display:inline-flex">${ic("arrow", 15)}</span></div>
</div>`),
};

// ---------------------------------------------------------------- date range picker (over the analytics report)
const WD = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
function month(title, startDow, days, from, to, cell = 36) {
  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push(`<span></span>`);
  for (let d = 1; d <= days; d++) {
    const inR = d >= from && d <= to, edge = d === from || d === to;
    cells.push(`<span style="height:${cell}px;display:grid;place-items:center;font-size:13px;${inR ? `background:color-mix(in oklab,var(--primary) ${edge ? 100 : 14}%,var(--surface));` : ""}${edge ? "color:var(--on-primary);font-weight:600;border-radius:var(--radius);" : ""}${d === from && !edge ? "" : ""}">${d}</span>`);
  }
  return `<div><div style="font-weight:600;text-align:center;margin-bottom:8px">${title}</div><div style="display:grid;grid-template-columns:repeat(7,${cell}px);row-gap:2px">${WD.map((w) => `<span class="muted" style="text-align:center;font-size:11px;padding-bottom:4px">${w}</span>`).join("")}${cells.join("")}</div></div>`;
}
const PRESETS = ["Today", "Last 7 days", "Last 30 days", "This quarter", "Last quarter", "Year to date", "Custom"];
TPL["date-range-picker"] = {
  family: "finance", name: "Date range picker (open)",
  shows: "a date-range popover over the revenue report: presets (last 7 / 30 days, quarter, year to date, custom), two months with the selected range highlighted, start and end date inputs, a compare-to-previous-period toggle, and Cancel / Apply (one month in a bottom sheet on mobile)",
  elements: ["date-picker", "date-range", "calendar", "popover", "toggle", "form", "chart"],
  web: (p, st, rnd) => stage(A["analytics-charts"].web(p, st, rnd), `<div style="${SCRIM};background:color-mix(in oklab,var(--ink) 14%,transparent)"></div>
<div class="card" role="dialog" aria-label="Choose dates" style="position:absolute;right:28px;top:126px;display:flex;box-shadow:var(--shadow-lg);padding:0;overflow:hidden">
  <div style="width:168px;border-right:1px solid var(--border);padding:12px;display:grid;gap:2px;align-content:start">${PRESETS.map((x) => `<div style="padding:8px 10px;border-radius:var(--radius);font-size:13px;${x === "Custom" ? "background:color-mix(in oklab,var(--primary) 12%,var(--surface));font-weight:600" : ""}">${x}</div>`).join("")}</div>
  <div style="padding:16px 20px;display:grid;gap:14px">
    <div style="display:flex;gap:24px;align-items:flex-start"><span class="muted" style="display:inline-flex;margin-top:2px">${ic("back", 16)}</span>${month("September 2026", 1, 30, 14, 30)}${month("October 2026", 3, 31, 1, 12)}<span class="muted" style="display:inline-flex;margin-top:2px;transform:rotate(180deg)">${ic("back", 16)}</span></div>
    <div style="display:flex;align-items:center;gap:10px"><div class="input filled" style="width:150px">Sep 14, 2026</div><span class="muted">–</span><div class="input filled" style="width:150px;border-color:var(--primary)">Oct 12, 2026</div><span class="muted" style="font-size:12px">29 days</span></div>
    <div style="display:flex;align-items:center;gap:10px;border-top:1px solid var(--border);padding-top:14px"><span style="flex:none;width:36px;height:20px;border-radius:999px;padding:2px;display:flex;justify-content:flex-end;background:var(--primary)"><span style="width:16px;height:16px;border-radius:50%;background:var(--surface)"></span></span><span style="font-size:13px;flex:1">Compare to previous period <span class="muted">(Aug 16 – Sep 13)</span></span><button class="btn">Cancel</button><button class="btn primary">Apply</button></div>
  </div></div>`),
  mobile: (p, st, rnd) => stage(A["analytics-charts"].mobile(p, st, rnd), `<div style="${SCRIM}"></div>
<div class="sheet" role="dialog" style="position:absolute;left:0;right:0;bottom:0;background:var(--surface);border-radius:var(--radius-lg) var(--radius-lg) 0 0;box-shadow:var(--shadow-lg);padding:10px 20px 30px;display:grid;gap:14px">
  <div style="justify-self:center;width:40px;height:5px;border-radius:9px;background:var(--border)"></div>
  <div style="display:flex;justify-content:space-between;align-items:center"><div class="h" style="${hs(st, 18)}">Date range</div><span class="muted" style="font-size:13px">Reset</span></div>
  <div style="display:flex;gap:8px;overflow:hidden">${["7 days", "30 days", "YTD", "Custom"].map((x) => `<span style="flex:none;padding:6px 12px;border-radius:999px;border:1px solid ${x === "Custom" ? "var(--primary)" : "var(--border)"};font-size:13px;${x === "Custom" ? "background:color-mix(in oklab,var(--primary) 12%,var(--surface));font-weight:600" : ""}">${x}</span>`).join("")}</div>
  <div style="display:flex;justify-content:center">${month("October 2026", 3, 31, 1, 12, 44)}</div>
  <div style="display:flex;gap:10px"><div class="input filled" style="flex:1">Sep 14</div><div class="input filled" style="flex:1;border-color:var(--primary)">Oct 12</div></div>
  <button class="btn primary block">Apply · 29 days</button></div>`),
};

// ---------------------------------------------------------------- inline form validation errors
const FIELDS_OK = [["Workspace name", "Northwind Studio"], ["Work email", "mara@northwind.example"]];
TPL["form-validation"] = {
  family: "workspace", name: "Form with inline validation errors",
  shows: "a create-workspace form after a failed submit: an error summary that links to each problem, fields marked in the danger colour with icon + text messages (not colour alone), a taken URL with suggested alternatives, a password strength meter with unmet rules, valid fields ticked, and the submit button with the error count",
  elements: ["form", "validation", "inline-errors", "error-summary", "password-strength", "input", "checkbox", "button"],
  web: (p, st) => `<div style="height:100%;display:grid;grid-template-columns:1fr 1fr">
  <div style="padding:36px 64px;display:flex;flex-direction:column;gap:18px;overflow:hidden">
    <div class="logo"><b></b>${esc(p.name)}</div>
    <div><h1 style="${hs(st, 28)}">Create your workspace</h1><p class="muted" style="margin-top:4px">Step 1 of 2 · Free for up to 5 members</p></div>
    <div role="alert" style="border:1px solid color-mix(in oklab,var(--danger) 45%,var(--border));background:color-mix(in oklab,var(--danger) 7%,var(--surface));border-radius:var(--radius);padding:12px 14px;display:grid;gap:6px;font-size:13px"><div style="font-weight:600;color:var(--danger);display:flex;gap:8px;align-items:center">${ic("x", 15)}Fix 3 things to continue</div>
      <div style="display:grid;gap:2px;padding-left:23px"><u>Workspace URL is already taken</u><u>Password needs a number and 12+ characters</u><u>Accept the terms to continue</u></div></div>
    ${FIELDS_OK.map(([l, v]) => `<div class="field"><label>${l}</label>${okInput(v)}</div>`).join("")}
    <div class="field"><label>Workspace URL</label><div style="display:flex">${`<div class="input" style="border-radius:var(--radius) 0 0 var(--radius);border-right:0;background:var(--bg)">fernway.app/</div>`}<div class="input filled" style="flex:1;border-radius:0 var(--radius) var(--radius) 0;border-color:var(--danger);box-shadow:0 0 0 3px color-mix(in oklab,var(--danger) 16%,transparent)">northwind</div></div>
      ${errText("“northwind” is taken.")}<div style="display:flex;gap:6px;align-items:center;font-size:12px"><span class="muted">Try:</span>${["northwind-studio", "northwindhq", "nw-studio"].map((x) => `<span style="padding:2px 8px;border:1px solid var(--border);border-radius:999px">${x}</span>`).join("")}</div></div>
    <div class="field"><label>Password</label>${errInput("••••••••")}
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px">${[1, 1, 0, 0].map((on) => `<span style="height:4px;border-radius:9px;background:${on ? "var(--warning)" : "var(--border)"}"></span>`).join("")}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:12px">${[["Upper and lower case", 1], ["A symbol", 1], ["12+ characters (8 now)", 0], ["A number", 0]].map(([t, ok]) => `<span style="display:flex;gap:6px;align-items:center;color:${ok ? "var(--success)" : "var(--danger)"}">${ic(ok ? "check" : "x", 13)}${t}</span>`).join("")}</div></div>
    <label style="display:flex;gap:10px;align-items:center;font-size:13px"><span style="flex:none;width:16px;height:16px;border:1.5px solid var(--danger);border-radius:4px"></span>I agree to the Terms and Privacy Policy</label>${errText("Accept the terms to continue")}
    <button class="btn primary" style="height:44px">Create workspace</button>
  </div>
  <div style="background:color-mix(in oklab,var(--primary) 8%,var(--bg));border-left:1px solid var(--border);padding:64px;display:flex;flex-direction:column;justify-content:center;gap:18px">
    <div class="h" style="${hs(st, 26)};max-width:420px">“We moved 40 projects over in an afternoon.”</div><div class="muted">Teodora Ruiz, Operations lead</div>
    <div style="display:grid;gap:10px;margin-top:10px">${["Tasks, docs and files in one place", "Invite up to 5 members free", "Import from spreadsheets and CSV"].map((t) => `<div style="display:flex;gap:10px;align-items:center"><span style="color:var(--primary);display:inline-flex">${ic("check", 16)}</span>${t}</div>`).join("")}</div>
  </div></div>`,
  mobile: (p, st) => `<div class="phone">${status()}<div class="mtop"><span style="display:inline-flex">${ic("back", 20)}</span><span class="muted" style="font-size:13px">Step 1 of 2</span></div>
  <div class="mbody" style="gap:12px">
    <h1 style="${hs(st, 24)}">Create your workspace</h1>
    <div role="alert" style="border:1px solid color-mix(in oklab,var(--danger) 45%,var(--border));background:color-mix(in oklab,var(--danger) 7%,var(--surface));border-radius:var(--radius);padding:10px 12px;font-size:13px;color:var(--danger);font-weight:600;display:flex;gap:8px;align-items:center">${ic("x", 15)}Fix 2 things to continue</div>
    <div class="field"><label>Workspace name</label>${okInput("Northwind Studio")}</div>
    <div class="field"><label>Work email</label>${okInput("mara@northwind.example")}</div>
    <div class="field"><label>Workspace URL</label>${errInput("fernway.app/northwind")}${errText("That URL is taken. Try northwind-studio")}</div>
    <div class="field"><label>Password</label>${errInput("••••••••")}<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px">${[1, 1, 0, 0].map((on) => `<span style="height:4px;border-radius:9px;background:${on ? "var(--warning)" : "var(--border)"}"></span>`).join("")}</div><div style="display:grid;gap:4px;font-size:12px">${[["Upper and lower case", 1], ["A symbol", 1], ["12+ characters (8 now)", 0], ["A number", 0]].map(([t, ok]) => `<span style="display:flex;gap:6px;align-items:center;color:${ok ? "var(--success)" : "var(--danger)"}">${ic(ok ? "check" : "x", 13)}${t}</span>`).join("")}</div></div>
    <div class="field"><label>Team size</label><div style="display:flex;gap:6px">${["Just me", "2–5", "6–20", "21+"].map((x) => `<span style="flex:1;text-align:center;padding:8px 0;border-radius:var(--radius);border:1px solid ${x === "6–20" ? "var(--primary)" : "var(--border)"};font-size:13px;${x === "6–20" ? "background:color-mix(in oklab,var(--primary) 12%,var(--surface));font-weight:600" : ""}">${x}</span>`).join("")}</div></div>
    <label style="display:flex;gap:10px;align-items:center;font-size:13px"><span style="flex:none;width:18px;height:18px;border:1.5px solid var(--primary);border-radius:4px;background:var(--primary);display:grid;place-items:center;color:var(--on-primary)">${ic("check", 12)}</span>I agree to the Terms and Privacy Policy</label>
    <button class="btn primary block" style="margin-top:auto;height:46px">Create workspace</button>
  </div></div>`,
};

module.exports = TPL;
