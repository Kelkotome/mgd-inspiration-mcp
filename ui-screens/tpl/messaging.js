/* Messaging patterns for the workspace family (Fernway — tasks, docs and files for small teams):
   chat-list, chat-thread, video-call. "Now" across these screens is Wednesday 28 October 2026, about 4:15 PM. */
const { ic, ICON, sideNav, status, tabBar } = require("../lib");

Object.assign(ICON, {
  "messaging-mic": '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/>',
  "messaging-micoff": '<path d="M9 8.5V6a3 3 0 0 1 6 0v5.5M14.6 13.4A3 3 0 0 1 9 11.8M5.5 11a6.5 6.5 0 0 0 10.4 5.2M18.3 13a6.6 6.6 0 0 0 .2-2M12 17.5V21M4 4l16 16"/>',
  "messaging-cam": '<rect x="3" y="6.5" width="13" height="11" rx="2"/><path d="M16 10.5l5-3v9l-5-3z"/>',
  "messaging-screen": '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4M12 13.5V8M9.5 10.5L12 8l2.5 2.5"/>',
  "messaging-hand": '<path d="M8 13V6.5a1.5 1.5 0 0 1 3 0V11M11 11V4.5a1.5 1.5 0 0 1 3 0V11M14 11V6.5a1.5 1.5 0 0 1 3 0V13c0 4.2-2.6 7.5-6.2 7.5-2.3 0-3.8-1.1-5.2-3.3l-1.9-3.4a1.5 1.5 0 0 1 2.5-1.7L8 14"/>',
  "messaging-hangup": '<path d="M3 14c5-4.6 13-4.6 18 0l-2.3 2.6-3.6-1.4.1-2.6a10.5 10.5 0 0 0-6.4 0l.1 2.6-3.6 1.4z"/>',
  "messaging-hash": '<path d="M5 9h15M4 15h15M10 4L8 20M16 4l-2 16"/>',
  "messaging-at": '<circle cx="12" cy="12" r="3.5"/><path d="M15.5 12v1.3a2.6 2.6 0 0 0 5.2 0V12a8.7 8.7 0 1 0-3.4 6.9"/>',
  "messaging-smile": '<circle cx="12" cy="12" r="9"/><path d="M8.5 14.5a4.5 4.5 0 0 0 7 0M9 9.5h.01M15 9.5h.01"/>',
  "messaging-clip": '<path d="M20 11.5l-8 8a5 5 0 0 1-7-7l8.5-8.5a3.3 3.3 0 0 1 4.7 4.7l-8.4 8.4a1.7 1.7 0 0 1-2.4-2.4l7.6-7.6"/>',
  "messaging-thread": '<path d="M4 5h16v10H10l-4 4v-4H4z"/><path d="M8 9h8M8 12h5"/>',
  "messaging-reply": '<path d="M10 7L4 12l6 5M4 12h10a6 6 0 0 1 6 6"/>',
  "messaging-cc": '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M10.5 10.2a2.4 2.4 0 1 0 0 3.6M17 10.2a2.4 2.4 0 1 0 0 3.6"/>',
  "messaging-layout": '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 15h18M9 15v5M15 15v5"/>',
  "messaging-flip": '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><path d="M9 13a3 3 0 0 1 5.2-2M15 13a3 3 0 0 1-5.2 2M14.5 9.5V11h-1.5M9.5 16.5V15H11"/>',
  "messaging-headset": '<path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="14" width="4" height="6" rx="1.5"/><rect x="17" y="14" width="4" height="6" rx="1.5"/>',
});
const I = (n, s = 18) => ic("messaging-" + n, s);

const TPL = {};
const NAV = [["inbox", "Inbox"], ["chat", "Messages"], ["check", "My tasks"], ["grid", "Projects"], ["doc", "Docs"], ["folder", "Files"], ["users", "Team"], ["gear", "Settings"]];
const MTABS = [["inbox", "Inbox"], ["chat", "Chat"], ["check", "Tasks"], ["folder", "Files"]];

// ---- local CSS (prefixed ms-) -----------------------------------------------------------------
const CSS = `<style>
.ms-row{display:flex;align-items:center;gap:10px}
.ms-ell{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.ms-n{min-width:19px;height:19px;padding:0 6px;border-radius:999px;background:var(--primary);color:var(--on-primary);font:700 11px/19px var(--font-b);text-align:center;flex:none}
.ms-n.soft{background:color-mix(in oklab,var(--text) 10%,var(--surface));color:var(--muted)}
.ms-av{position:relative;display:inline-flex;flex:none}
.ms-dot{position:absolute;right:-1px;bottom:-1px;width:10px;height:10px;border-radius:50%;box-shadow:0 0 0 2px var(--surface)}
.ms-dot.on{background:var(--primary)}
.ms-dot.away{background:var(--surface);border:2.5px solid var(--accent)}
.ms-dot.off{background:var(--surface);border:2px solid color-mix(in oklab,var(--muted) 80%,var(--surface))}
.ms-ch{width:30px;height:30px;border-radius:var(--radius);display:grid;place-items:center;background:color-mix(in oklab,var(--text) 7%,var(--surface));color:var(--muted);flex:none}
.ms-grp{font:600 11px var(--font-b);text-transform:uppercase;letter-spacing:.06em;color:var(--muted);padding:12px 16px 4px;display:flex;align-items:center;gap:6px}
.ms-item{display:flex;align-items:center;gap:11px;padding:8px 16px}
.ms-item.on{background:color-mix(in oklab,var(--primary) 10%,var(--surface));box-shadow:inset 3px 0 0 var(--primary)}
.ms-div{display:flex;align-items:center;gap:12px;font:600 12px var(--font-b);color:var(--muted);white-space:nowrap}
.ms-div::before,.ms-div::after{content:"";flex:1;height:1px;background:var(--border)}
.ms-rx{display:inline-flex;align-items:center;gap:5px;height:24px;padding:0 8px;border-radius:999px;border:1px solid var(--border);background:var(--surface);font:600 12px var(--font-b);color:var(--muted);white-space:nowrap}
.ms-rx.me{border-color:color-mix(in oklab,var(--primary) 45%,var(--surface));background:color-mix(in oklab,var(--primary) 10%,var(--surface));color:var(--primary)}
.ms-file{display:flex;align-items:center;gap:12px;padding:9px 12px;border:1px solid var(--border);border-radius:var(--radius);background:var(--surface);max-width:400px}
.ms-thr{display:inline-flex;align-items:center;gap:8px;font-size:12px;color:var(--muted);white-space:nowrap}.ms-thr b{color:var(--primary);font-weight:600}
.ms-type{display:inline-flex;gap:3px;align-items:center}.ms-type i{width:5px;height:5px;border-radius:50%;background:var(--muted)}
.ms-tool{width:30px;height:30px;display:grid;place-items:center;border-radius:var(--radius-sm);color:var(--muted);flex:none}
.ms-sep{width:1px;height:18px;background:var(--border);margin:0 4px;flex:none}
.ms-ment{background:color-mix(in oklab,var(--primary) 14%,transparent);color:var(--primary);font-weight:600;border-radius:3px;padding:0 2px}
.ms-stack{display:flex;align-items:center}.ms-stack .avatar{box-shadow:0 0 0 2px var(--surface);margin-left:-7px}.ms-stack .avatar:first-child{margin-left:0}
.ms-chip{display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 12px;border-radius:999px;border:1px solid var(--border);background:var(--surface);font-weight:500;font-size:13px;white-space:nowrap;flex:none}
.ms-chip.on{background:var(--text);border-color:var(--text);color:var(--bg)}
.ms-seg{display:inline-flex;padding:3px;border-radius:var(--radius);background:color-mix(in oklab,var(--text) 5%,var(--surface));border:1px solid var(--border);gap:2px;flex:none}
.ms-seg span{padding:3px 10px;border-radius:var(--radius-sm);font-weight:500;font-size:13px;color:var(--muted);display:inline-flex;gap:6px;align-items:center;white-space:nowrap}
.ms-seg span.on{background:var(--surface);color:var(--text);box-shadow:0 1px 2px color-mix(in oklab,var(--text) 14%,transparent)}
.ms-bub{padding:9px 13px;border-radius:var(--radius-lg);max-width:72%;line-height:1.5}
.ms-bub.in{background:color-mix(in oklab,var(--text) 6%,var(--surface));border-top-left-radius:var(--radius-sm)}
.ms-bub.out{background:var(--primary);color:var(--on-primary);border-top-right-radius:var(--radius-sm);align-self:flex-end}
.ms-tile{position:relative;overflow:hidden;border-radius:var(--radius-lg);background:color-mix(in oklab,var(--text) 8%,var(--surface))}
.ms-tile>svg{position:absolute;inset:0;width:100%;height:100%;display:block}
.ms-tag{position:absolute;left:10px;bottom:10px;display:inline-flex;align-items:center;gap:6px;height:26px;padding:0 9px;border-radius:var(--radius);background:rgba(18,16,14,.55);color:#fff;font:600 12px var(--font-b);white-space:nowrap}
.ms-tag.ui{background:var(--surface);color:var(--text);border:1px solid var(--border)}
.ms-spk{display:inline-flex;align-items:flex-end;gap:2px;height:12px}.ms-spk i{width:3px;border-radius:2px;background:currentColor}
.ms-live{box-shadow:0 0 0 3px var(--primary),0 0 0 6px color-mix(in oklab,var(--primary) 25%,transparent)}
.ms-ctl{width:48px;height:48px;padding:0;border-radius:999px}
.ms-ctl.off{background:color-mix(in oklab,var(--accent) 16%,var(--surface));color:color-mix(in oklab,var(--accent) 75%,var(--text));border-color:color-mix(in oklab,var(--accent) 40%,var(--surface))}
.ms-leave{background:color-mix(in oklab,var(--accent) 82%,var(--text));border-color:transparent;color:var(--bg)}
.ms-cap{position:absolute;left:50%;transform:translateX(-50%);bottom:52px;max-width:78%;padding:8px 14px;border-radius:var(--radius);background:rgba(18,16,14,.66);color:#fff;font-size:14px;line-height:1.45;text-align:center}
.main>.top{flex:none}
</style>`;

// ---- people, small parts ----------------------------------------------------------------------
const PEOPLE = { MO: "Mara Okafor", TR: "Teodora Ruiz", SA: "Sam Achebe", LP: "Lin Park", JW: "Jonah Weiss", PN: "Priya Nair" };
const AVT = {
  MO: "",
  TR: "background:color-mix(in oklab,var(--accent) 24%,var(--surface));color:color-mix(in oklab,var(--accent) 70%,var(--text))",
  SA: "background:color-mix(in oklab,var(--text) 12%,var(--surface));color:var(--text)",
  LP: "background:var(--primary);color:var(--on-primary)",
  JW: "background:color-mix(in oklab,var(--muted) 30%,var(--surface));color:var(--text)",
  PN: "background:var(--text);color:var(--bg)",
};
const PRES = { MO: "on", TR: "on", SA: "on", LP: "away", JW: "on", PN: "off" };
const av = (k, s = 28) => `<span class="avatar" style="width:${s}px;height:${s}px;font-size:${Math.max(9, Math.round(s * 0.38))}px;flex:none;${AVT[k]}">${k}</span>`;
const avp = (k, s = 28, pr = PRES[k]) => `<span class="ms-av">${av(k, s)}${pr ? `<span class="ms-dot ${pr}" style="${s >= 36 ? "width:12px;height:12px" : ""}"></span>` : ""}</span>`;
const stack = (ks, s = 24) => `<span class="ms-stack">${ks.map((k) => av(k, s)).join("")}</span>`;
const duo = (a, b, s = 36) => { const d = Math.round(s * 0.62); return `<span style="position:relative;width:${s}px;height:${s}px;flex:none"><span style="position:absolute;left:0;top:0;display:flex">${av(a, d)}</span><span style="position:absolute;right:0;bottom:0;display:flex;border-radius:50%;box-shadow:0 0 0 2px var(--surface)">${av(b, d)}</span></span>`; };
const chan = (s = 30, priv) => `<span class="ms-ch" style="width:${s}px;height:${s}px">${priv ? ic("lock", Math.round(s * 0.5)) : I("hash", Math.round(s * 0.55))}</span>`;
const typing = () => `<span class="ms-type">${[1, 0.6, 0.3].map((o) => `<i style="opacity:${o}"></i>`).join("")}</span>`;
const TONE = { p: "var(--primary)", a: "var(--accent)", n: "var(--muted)", m: "color-mix(in oklab,var(--primary) 50%,var(--accent))" };
const EXT = { FIG: "a", PDF: "p", CSV: "n", DOC: "p", PNG: "m", XLS: "n" };
const fileIc = (ext, s = 28) => { const c = TONE[EXT[ext] || "n"]; return `<svg width="${s}" height="${Math.round(s * 1.15)}" viewBox="0 0 30 35" style="flex:none"><path d="M4 1.5h15.5l7 7v24a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-30a1 1 0 0 1 1-1z" fill="color-mix(in oklab,${c} 14%,var(--surface))" stroke="color-mix(in oklab,${c} 55%,var(--surface))" stroke-width="1.2"/><path d="M19.5 1.5v7h7" fill="none" stroke="color-mix(in oklab,${c} 55%,var(--surface))" stroke-width="1.2"/><text x="15" y="26" text-anchor="middle" font-size="7.6" font-weight="800" font-family="system-ui,sans-serif" fill="color-mix(in oklab,${c} 85%,var(--text))">${ext}</text></svg>`; };
const fileCard = (ext, name, meta, s = 30) => `<div class="ms-file">${fileIc(ext, s)}<div style="flex:1;min-width:0"><div class="ms-ell" style="font-weight:600;font-size:13px">${name}</div><div class="muted ms-ell" style="font-size:12px">${meta}</div></div><span class="ms-tool">${ic("download", 16)}</span></div>`;
const rx = (icon, n, me) => `<span class="ms-rx${me ? " me" : ""}">${ic(icon, 13)}${n}</span>`;
const seg = (items, on) => `<span class="ms-seg">${items.map((t, i) => `<span class="${i === on ? "on" : ""}">${t}</span>`).join("")}</span>`;
const title = (st, t, px = 15) => `<div class="h" style="font-size:${Math.round(px * st.hscale)}px;white-space:nowrap">${t}</div>`;
const shell = (p, active, main) => `${CSS}<div class="shell">${sideNav(p, active, NAV)}<main class="main">${main}</main></div>`;
const phone = (inner) => `${CSS}<div class="phone" style="position:relative">${status()}${inner}</div>`;
const ment = (t) => `<span class="ms-ment">@${t}</span>`;

// =============================================================================================
// chat-list — channels + direct messages
const CHANNELS = [
  ["harbor-launch", "Lin Park: Banner v3 and both subject lines are in the doc", "4:08 PM", 4, false, true],
  ["design-crit", "Priya Nair: Icon set v3 — rounded or square corners? Vote by 5", "3:51 PM", 2],
  ["client-ostrava", "Sam Achebe: They want SSO by the 15th, not the 30th", "2:30 PM", 1, true],
  ["general", "Jonah Weiss: Offsite walkthrough moved to Monday, 10 AM", "1:12 PM", 0],
  ["ops-offsite", "You: Booked the minibus for 14 people", "Tue", 0, false, false, true],
];
const DMS = [
  [["TR"], "Teodora Ruiz", "Sending the PDF to both pilots now", "4:12 PM", 1],
  [["SA"], "Sam Achebe", "Can you hop on a quick call about Ostrava?", "3:40 PM", 2],
  [["LP"], "Lin Park", "You: Thanks! Looks great on mobile too", "2:05 PM", 0],
  [["JW", "PN"], "Jonah Weiss, Priya Nair", "Priya: I’ll take the interview guide if Jonah does notes", "Mon", 0],
  [["PN"], "Priya Nair", "Sent you the survey export (CSV, 2.1 MB)", "Mon", 0],
];
const chRow = ([n, prev, t, un, priv, ment, mute]) => `<div class="ms-item">${chan(30, priv)}<div style="flex:1;min-width:0"><div class="ms-row" style="gap:6px"><span class="ms-ell" style="font-weight:${un ? 700 : 500};${mute ? "color:var(--muted)" : ""}">${n}</span>${mute ? `<span class="muted" style="display:inline-flex">${ic("bell", 12)}</span>` : ""}<span class="muted" style="margin-left:auto;font-size:11px;flex:none">${t}</span></div>
<div class="ms-row" style="gap:6px"><span class="muted ms-ell" style="font-size:12px;flex:1">${prev}</span>${ment ? `<span class="ms-n" style="min-width:19px;padding:0">@</span>` : ""}${un ? `<span class="ms-n">${un}</span>` : ""}</div></div></div>`;
const dmRow = ([ks, n, prev, t, un], on) => `<div class="ms-item${on ? " on" : ""}">${ks.length > 1 ? duo(ks[0], ks[1], 34) : avp(ks[0], 34)}<div style="flex:1;min-width:0"><div class="ms-row" style="gap:6px"><span class="ms-ell" style="font-weight:${un ? 700 : 500}">${n}</span><span class="muted" style="margin-left:auto;font-size:11px;flex:none">${t}</span></div>
<div class="ms-row" style="gap:6px"><span class="muted ms-ell" style="font-size:12px;flex:1;${un ? "color:var(--text)" : ""}">${prev}</span>${un ? `<span class="ms-n">${un}</span>` : ""}</div></div></div>`;

TPL["chat-list/web"] = (p, st) => shell(p, "Messages", `
<div style="flex:1;display:grid;grid-template-columns:360px minmax(0,1fr);min-height:0">
<section style="border-right:1px solid var(--border);display:flex;flex-direction:column;min-height:0;background:var(--surface)">
<div style="height:60px;flex:none;display:flex;align-items:center;gap:10px;padding:0 16px;border-bottom:1px solid var(--border)">${title(st, "Messages", 17)}<span class="ms-n" style="margin-top:2px">10</span><button class="btn primary" style="margin-left:auto;height:32px">${ic("edit", 14)}New message</button></div>
<div style="padding:12px 16px 8px;display:grid;gap:10px;flex:none"><div class="input" style="height:36px;gap:8px">${ic("search", 15)}Search people and channels</div>
<div class="ms-row" style="gap:6px">${seg(["All", "Unread · 10", `${I("at", 13)}Mentions`], 0)}<span class="ms-tool" style="margin-left:auto">${ic("filter", 15)}</span></div></div>
<div class="ms-grp">${ic("chevdown", 12)}Channels<span style="margin-left:auto">${ic("plus", 13)}</span></div>
${CHANNELS.map(chRow).join("")}
<div class="ms-grp">${ic("chevdown", 12)}Direct messages<span style="margin-left:auto">${ic("plus", 13)}</span></div>
${DMS.map((d, i) => dmRow(d, i === 0)).join("")}
</section>
<section style="display:flex;flex-direction:column;min-height:0">
<div style="height:60px;flex:none;display:flex;align-items:center;gap:12px;padding:0 24px;border-bottom:1px solid var(--border)">${avp("TR", 36)}<div><div style="font-weight:600">Teodora Ruiz</div><div class="muted" style="font-size:12px">Studio lead · Active now · 4:15 PM local time</div></div>
<span style="margin-left:auto" class="btn">${I("headset", 15)}Huddle</span><span class="btn" style="width:36px;padding:0">${I("cam", 16)}</span><span class="btn" style="width:36px;padding:0">${ic("search", 16)}</span><span class="btn" style="width:36px;padding:0">${ic("more", 16)}</span></div>
<div style="flex:none;display:flex;align-items:center;gap:10px;padding:9px 24px;border-bottom:1px solid var(--border);font-size:13px;background:color-mix(in oklab,var(--primary) 5%,var(--surface))"><span style="color:var(--primary);display:inline-flex">${ic("pin", 15)}</span><b style="font-weight:600">Pinned</b><span class="muted ms-ell">Go / no-go moved to <b style="color:var(--text);font-weight:600">Wed 28 Oct, 3:00 PM</b> · Harbor launch plan v6</span><span class="muted" style="margin-left:auto;display:inline-flex;gap:6px;align-items:center;flex:none">${ic("doc", 14)}2 shared files · ${ic("check", 14)}3 shared tasks</span></div>
<div style="flex:1;min-height:0;display:flex;flex-direction:column;justify-content:flex-end;gap:10px;padding:20px max(28px,calc(50% - 360px));overflow:hidden">
<div class="ms-div">Yesterday</div>
<div class="ms-bub in">Can we move the go / no-go to 3 tomorrow? Engineering wants the morning for the freeze check.</div>
<div class="ms-bub out">Works for me — I’ll update the invite and tell Sam.</div>
<div class="ms-bub in">Thanks! Is the pilot list final? I only see Ostrava Labs and Brightwell Studio.</div>
<div style="display:grid;justify-items:end;gap:4px"><div class="ms-bub out" style="max-width:72%">That’s it for November. Palo Verde moved to the January cohort, so we keep it to two.</div><span class="ms-row" style="gap:6px">${rx("check", 1)}</span></div>
<div class="ms-div">Today</div>
<div style="display:flex;gap:8px;align-items:flex-end">${av("TR", 26)}<div style="display:grid;gap:4px;max-width:72%"><div class="ms-bub in" style="max-width:none">Legal came back on the comparison page: two small wording changes, nothing structural.</div><div class="ms-bub in" style="max-width:none">Pricing is locked at <b>$24/seat</b> annual. Sending the PDF to both pilots now.</div>${fileCard("PDF", "harbor-launch-plan-v6.pdf", "1.8 MB · PDF · 14 pages")}<span class="muted" style="font-size:11px">4:12 PM</span></div></div>
<div style="display:grid;justify-items:end;gap:4px"><div class="ms-bub out" style="max-width:72%">Perfect. Copy me on the Ostrava one so Sam can follow up Thursday.</div><span class="muted" style="font-size:11px;display:inline-flex;gap:4px;align-items:center">${ic("check", 12)}Seen 4:14 PM</span></div>
<div class="ms-row" style="gap:8px;font-size:12px" >${av("TR", 22)}<span class="ms-bub in" style="padding:9px 12px">${typing()}</span><span class="muted">Teodora is typing…</span></div>
</div>
<div style="flex:none;padding:0 max(28px,calc(50% - 360px)) 20px"><div class="card" style="display:flex;align-items:center;gap:6px;padding:8px 8px 8px 14px;box-shadow:var(--shadow)"><span class="muted" style="flex:1">Message Teodora</span><span class="ms-tool">${I("clip", 16)}</span><span class="ms-tool">${I("smile", 16)}</span><span class="ms-tool">${I("at", 16)}</span><button class="btn primary" style="width:36px;padding:0">${ic("send", 16)}</button></div></div>
</section></div>`);

const MLIST = [
  ["dm", ["TR"], "Teodora Ruiz", "Sending the PDF to both pilots now", "4:12 PM", 1],
  ["ch", "harbor-launch", "Lin: Banner v3 and both subject lines are in the doc", "4:08 PM", 4, false, true],
  ["ch", "design-crit", "Priya: Icon set v3 — rounded or square? Vote by 5", "3:51 PM", 2],
  ["dm", ["SA"], "Sam Achebe", "Can you hop on a quick call about Ostrava?", "3:40 PM", 2],
  ["ch", "client-ostrava", "Sam: They want SSO by the 15th, not the 30th", "2:30 PM", 1, true],
  ["dm", ["LP"], "Lin Park", "You: Thanks! Looks great on mobile too", "2:05 PM", 0],
  ["dm", ["JW", "PN"], "Jonah, Priya", "Priya: I’ll take the interview guide", "Mon", 0],
];
TPL["chat-list/mobile"] = (p, st) => phone(`<div class="mtop"><h1 style="font-size:${Math.round(26 * st.hscale)}px">Messages</h1><div class="ms-row" style="gap:16px">${I("headset", 22)}${ic("edit", 22)}</div></div>
<div class="mbody" style="gap:12px;padding:0 0 0">
<div style="padding:0 20px"><div class="input" style="gap:8px;height:38px;border-radius:999px">${ic("search", 16)}Search messages</div></div>
<div style="display:flex;gap:14px;padding:2px 20px 0;overflow:hidden">${[["TR", "Teodora"], ["SA", "Sam"], ["JW", "Jonah"], ["LP", "Lin"], ["PN", "Priya"]].map(([k, n]) => `<div style="display:grid;justify-items:center;gap:4px;width:56px;flex:none">${avp(k, 52)}<span style="font-size:12px;font-weight:500">${n}</span></div>`).join("")}</div>
<div style="display:flex;gap:8px;padding:0 20px;overflow:hidden">${["All", "Unread 10", "Mentions", "Channels"].map((t, i) => `<span class="ms-chip${i ? "" : " on"}">${t}</span>`).join("")}</div>
<div style="border-top:1px solid var(--border)">${MLIST.map(([kind, a, b, c, d, e, f, g]) => {
    const isDm = kind === "dm", un = isDm ? e : d;
    const icon = isDm ? (a.length > 1 ? duo(a[0], a[1], 44) : avp(a[0], 44)) : chan(44, f);
    const name = isDm ? b : a, prev = isDm ? c : b, t = isDm ? d : c;
    return `<div style="display:flex;align-items:center;gap:12px;padding:10px 20px;border-bottom:1px solid var(--border)">${icon}<div style="flex:1;min-width:0"><div class="ms-row" style="gap:6px"><span class="ms-ell" style="font-weight:${un ? 700 : 500};font-size:15px">${isDm ? name : "#" + name}</span><span class="muted" style="margin-left:auto;font-size:12px;flex:none;${un ? "color:var(--primary);font-weight:600" : ""}">${t}</span></div><div class="ms-row" style="gap:6px"><span class="muted ms-ell" style="font-size:13px;flex:1;${un ? "color:var(--text)" : ""}">${prev}</span>${!isDm && g ? `<span class="ms-n" style="padding:0">@</span>` : ""}${un ? `<span class="ms-n">${un}</span>` : ""}</div></div></div>`;
  }).join("")}</div></div>
<div style="position:absolute;right:20px;bottom:96px;width:54px;height:54px;border-radius:50%;background:var(--primary);color:var(--on-primary);display:grid;place-items:center;box-shadow:var(--shadow-lg)">${ic("edit", 22)}</div>
${tabBar("Chat", MTABS)}`);

// =============================================================================================
// chat-thread — an open channel conversation
const msgRow = (k, time, body, extra = "", s = 36) => `<div style="display:flex;gap:12px">${k ? av(k, s) : `<span style="width:${s}px;flex:none;font-size:11px;color:var(--muted);text-align:right;padding-top:2px">${time}</span>`}<div style="flex:1;min-width:0;display:grid;gap:6px;justify-items:start">${k ? `<div class="ms-row" style="gap:8px;margin-bottom:-4px"><b style="font-weight:600">${PEOPLE[k]}</b><span class="muted" style="font-size:12px">${time}</span></div>` : ""}<div style="line-height:1.55">${body}</div>${extra}</div></div>`;
const threadInd = (ks, n, last) => `<span class="ms-thr">${stack(ks, 20)}<b>${n} replies</b>${last}</span>`;

TPL["chat-thread/web"] = (p, st) => shell(p, "Messages", `
<div style="flex:1;display:grid;grid-template-columns:minmax(0,1fr) 300px;min-height:0">
<section style="display:flex;flex-direction:column;min-height:0">
<div class="top" style="padding:0 24px;gap:10px"><span class="ms-ch" style="width:32px;height:32px">${I("hash", 17)}</span><div style="min-width:0"><div class="ms-row" style="gap:6px">${title(st, "harbor-launch", 16)}<span class="muted" style="display:inline-flex">${ic("star", 14)}</span></div><div class="muted ms-ell" style="font-size:12px">Harbor 2.4 ships Tue 10 Nov · go / no-go today at 3 PM</div></div>
<span style="margin-left:auto" class="ms-row"><span class="btn" style="gap:8px">${stack(["TR", "LP", "SA", "JW"], 22)}12</span><span class="btn">${I("headset", 15)}Huddle</span><span class="btn" style="width:36px;padding:0">${ic("search", 16)}</span><span class="btn" style="width:36px;padding:0;background:color-mix(in oklab,var(--primary) 12%,var(--surface));color:var(--primary)">${ic("menu", 16)}</span></span></div>
<div style="flex:1;min-height:0;display:flex;flex-direction:column;justify-content:flex-end;gap:14px;padding:16px 28px 10px;overflow:hidden">
<div class="ms-div">Yesterday</div>
${msgRow("JW", "5:40 PM", `Release notes draft for Harbor 2.4 is up. Anything missing from the Files permissions section?`, threadInd(["TR", "SA"], 3, `<span>Last reply yesterday at 6:12 PM</span>`))}
<div class="ms-div">Today · Wednesday 28 October</div>
${msgRow("TR", "9:14 AM", `Morning! Go / no-go is at 3 today. Agenda: pricing, legal, pilot comms, support readiness. Add anything else to the doc.`, `<span class="ms-row" style="gap:6px">${rx("check", 5, true)}${rx("star", 2)}</span>`)}
${msgRow("LP", "3:52 PM", `Banner v3 and both subject lines are in the doc. Option B tested better with the pilot group — <b>31%</b> opens vs 24%.`, `${fileCard("FIG", "Harbor banner v3", "Figma · 4 frames · edited 6 min ago")}<span class="ms-row" style="gap:6px">${rx("heart", 3, true)}${rx("check", 2)}${rx("bolt", 1)}<span class="ms-rx" style="padding:0 6px">${I("smile", 13)}${ic("plus", 11)}</span></span>`)}
${msgRow("TR", "4:08 PM", `Pricing is locked at $24/seat annual and legal approved the comparison page. ${ment("Mara")} you’re clear to send the plan to both pilots.`, `${fileCard("PDF", "harbor-launch-plan-v6.pdf", "1.8 MB · PDF · 14 pages")}`)}
${msgRow("SA", "4:10 PM", `Ostrava confirmed they can join the pilot call Thursday at 10. I’ll drop the invite here once it’s sent.`, threadInd(["SA", "MO"], 2, `<span>Last reply 3 min ago</span>`))}
</div>
<div style="flex:none;padding:0 28px 6px;display:flex;align-items:center;gap:8px;font-size:12px" class="muted">${typing()}<span><b style="color:var(--text);font-weight:600">Priya Nair</b> is typing…</span></div>
<div style="flex:none;padding:0 28px 20px"><div class="card" style="overflow:hidden;box-shadow:var(--shadow)">
<div class="ms-row" style="gap:2px;padding:4px 8px;border-bottom:1px solid var(--border)">${["bold", "italic", "link"].map((n) => `<span class="ms-tool">${ic(n, 15)}</span>`).join("")}<span class="ms-sep"></span>${["list", "quote"].map((n) => `<span class="ms-tool">${ic(n, 15)}</span>`).join("")}<span class="ms-sep"></span><span class="ms-tool" style="font:600 12px var(--font-b);width:auto;padding:0 6px">&lt;/&gt;</span></div>
<div style="padding:10px 14px;color:var(--muted)">Message #harbor-launch</div>
<div class="ms-row" style="gap:2px;padding:4px 8px 8px"><span class="ms-tool">${ic("plus", 16)}</span><span class="ms-tool">${I("clip", 16)}</span><span class="ms-tool">${I("at", 16)}</span><span class="ms-tool">${I("smile", 16)}</span><span class="muted" style="margin-left:auto;font-size:12px;margin-right:8px">Enter to send · Shift + Enter for a new line</span><button class="btn primary" style="height:32px;width:40px;padding:0">${ic("send", 15)}</button></div></div></div>
</section>
<aside style="border-left:1px solid var(--border);padding:16px 18px;display:flex;flex-direction:column;gap:14px;background:color-mix(in oklab,var(--surface) 60%,var(--bg));min-height:0;overflow:hidden">
<div class="ms-row"><span style="font-weight:600">Details</span><span class="ms-tool" style="margin-left:auto">${ic("x", 15)}</span></div>
<div style="display:grid;gap:4px"><div class="muted" style="font-size:12px;font-weight:600">About</div><div style="font-size:13px;line-height:1.5">Launch coordination for Harbor 2.4: product, comms, pricing and the two pilot customers.</div><div class="muted" style="font-size:12px">Created by Teodora Ruiz on 2 Sep</div></div>
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px">${[["bell", "Mute"], ["pin", "Pinned"], ["link", "Copy link"]].map(([i, l]) => `<div class="btn" style="height:auto;padding:8px 4px;display:grid;justify-items:center;gap:3px;font-size:12px">${ic(i, 16)}${l}</div>`).join("")}</div>
<div style="display:grid;gap:8px;border-top:1px solid var(--border);padding-top:12px"><div class="ms-row"><span style="font-weight:600;font-size:13px">Members</span><span class="muted" style="font-size:12px">12 · 5 online</span><span style="margin-left:auto;font-size:12px;color:var(--primary);font-weight:600">Add</span></div>
${[["TR", "Studio lead"], ["LP", "Designer · away"], ["SA", "Account manager"], ["JW", "Engineering"], ["PN", "Research · offline"], ["MO", "Admin (you)"]].map(([k, r]) => `<div class="ms-row" style="gap:9px">${avp(k, 28)}<div style="min-width:0"><div style="font-size:13px;font-weight:500">${PEOPLE[k]}</div><div class="muted" style="font-size:11px">${r}</div></div></div>`).join("")}</div>
<div style="display:grid;gap:8px;border-top:1px solid var(--border);padding-top:12px"><div class="ms-row"><span style="font-weight:600;font-size:13px">Files</span><span class="muted" style="font-size:12px">8</span><span style="margin-left:auto;font-size:12px;color:var(--primary);font-weight:600">See all</span></div>
${[["PDF", "harbor-launch-plan-v6.pdf", "Teodora · 4:08 PM"], ["FIG", "Harbor banner v3", "Lin · 3:52 PM"], ["CSV", "pilot-open-rates.csv", "Lin · Mon"]].map(([e, n, m]) => `<div class="ms-row" style="gap:9px">${fileIc(e, 22)}<div style="min-width:0"><div class="ms-ell" style="font-size:13px;font-weight:500">${n}</div><div class="muted" style="font-size:11px">${m}</div></div></div>`).join("")}</div>
</aside></div>`);

TPL["chat-thread/mobile"] = (p, st) => phone(`<div class="mtop" style="border-bottom:1px solid var(--border);gap:10px;padding-bottom:10px">${ic("back", 22)}<span class="ms-ch" style="width:32px;height:32px">${I("hash", 17)}</span><div style="flex:1;min-width:0"><div style="font-weight:700">harbor-launch</div><div class="muted" style="font-size:12px">12 members · 5 online</div></div>${I("headset", 21)}<span style="width:6px"></span>${ic("more", 21)}</div>
<div class="mbody" style="padding:12px 16px 8px;gap:13px;justify-content:flex-end;font-size:14px">
<div class="ms-div">Yesterday</div>
${msgRow("JW", "5:40 PM", `Release notes draft for Harbor 2.4 is up. Anything missing from Files permissions?`, "", 32)}
<div class="ms-div">Today</div>
${msgRow("TR", "9:14 AM", `Morning! Go / no-go is at 3 today: pricing, legal, pilot comms, support.`, threadInd(["SA", "JW"], 4, ""), 32)}
${msgRow("LP", "3:52 PM", `Banner v3 is in the doc. Option B won with the pilot group — <b>31%</b> opens vs 24%.`, `${fileCard("FIG", "Harbor banner v3", "Figma · 4 frames", 26)}<span class="ms-row" style="gap:6px">${rx("heart", 3, true)}${rx("check", 2)}<span class="ms-rx" style="padding:0 6px">${I("smile", 13)}</span></span>`, 32)}
${msgRow("TR", "4:08 PM", `Pricing locked at $24/seat. ${ment("Mara")} clear to send the plan to both pilots.`, fileCard("PDF", "harbor-launch-plan-v6.pdf", "1.8 MB · 14 pages", 26), 32)}
${msgRow("SA", "4:10 PM", `Ostrava can join Thursday at 10. Invite coming.`, threadInd(["MO"], 2, ""), 32)}
<div class="muted ms-row" style="gap:8px;font-size:12px;padding-left:44px">${typing()}Priya Nair is typing…</div>
</div>
<div style="flex:none;padding:8px 12px 30px;border-top:1px solid var(--border);display:flex;align-items:center;gap:8px;background:var(--surface)"><span class="btn" style="width:36px;height:36px;padding:0;border-radius:999px">${ic("plus", 18)}</span><div class="input" style="flex:1;height:38px;border-radius:999px;justify-content:space-between">Message #harbor-launch<span style="display:inline-flex">${I("smile", 18)}</span></div><span class="btn primary" style="width:38px;height:38px;padding:0;border-radius:999px">${ic("send", 17)}</span></div>`);

// =============================================================================================
// video-call — meeting in progress. Tiles are illustrated "camera feeds" (fixed natural tones, no photos).
const ART = {
  TR: { wall: ["#cdb79c", "#a68d72"], prop: "#e9dcc8", skin: "#c68642", hair: "#2b1d14", shirt: "#2f5d50", style: "long" },
  SA: { wall: ["#7f9399", "#56676d"], prop: "#9fb0b3", skin: "#6b4226", hair: "#1a1410", shirt: "#c9a66b", style: "short" },
  LP: { wall: ["#ddd0bc", "#b8a68e"], prop: "#7b8f6a", skin: "#f0c9a2", hair: "#1c1a19", shirt: "#4a5d7a", style: "bob" },
  PN: { wall: ["#8f9d7e", "#66745a"], prop: "#c4b48f", skin: "#a86b40", hair: "#20160f", shirt: "#8b3a4a", style: "bun" },
  MO: { wall: ["#ad978a", "#826c60"], prop: "#d9c6ae", skin: "#5a3825", hair: "#120d0a", shirt: "#e0cfb2", style: "curly" },
};
let artN = 0;
const feed = (k) => {
  const a = ART[k], id = `msg${k}${artN++}`;
  const hair = {
    long: `<path d="M61 62c-1-18 7-28 19-28s20 10 19 28c2 12 4 22 7 30H54c3-8 5-18 7-30z" fill="${a.hair}"/>`,
    short: `<path d="M64 56c0-12 7-18 16-18s16 6 16 18c-3-6-8-8-16-8s-13 2-16 8z" fill="${a.hair}"/>`,
    bob: `<path d="M62 64c-2-17 6-27 18-27s20 10 18 27c0 6-2 10-3 12h-2c1-8 0-16-4-20-6 3-13 4-20 3-3 5-4 10-3 17h-2c-1-2-2-6-2-12z" fill="${a.hair}"/>`,
    bun: `<circle cx="80" cy="33" r="7" fill="${a.hair}"/><path d="M64 58c0-13 7-19 16-19s16 6 16 19c-3-7-9-10-16-10s-13 3-16 10z" fill="${a.hair}"/>`,
    curly: `${[[66, 50, 8], [74, 42, 9], [86, 42, 9], [94, 50, 8], [64, 60, 6], [96, 60, 6]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${a.hair}"/>`).join("")}`,
  }[a.style];
  return `<svg viewBox="0 0 160 120" preserveAspectRatio="xMidYMax slice" aria-hidden="true"><defs><linearGradient id="${id}w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a.wall[0]}"/><stop offset="1" stop-color="${a.wall[1]}"/></linearGradient><radialGradient id="${id}l" cx=".3" cy=".2" r=".9"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset="1" stop-color="#000" stop-opacity=".18"/></radialGradient></defs>
<rect x="-200" y="0" width="560" height="120" fill="url(#${id}w)"/><rect x="18" y="18" width="34" height="44" rx="2" fill="${a.prop}" opacity=".55"/><rect x="112" y="40" width="44" height="4" fill="${a.prop}" opacity=".7"/><rect x="118" y="26" width="8" height="14" fill="${a.prop}" opacity=".5"/><rect x="130" y="30" width="6" height="10" fill="${a.prop}" opacity=".4"/><circle cx="146" cy="33" r="6" fill="${a.prop}" opacity=".45"/>
${a.style === "long" ? hair : ""}<path d="M36 121c1-21 17-32 44-32s43 11 44 32z" fill="${a.shirt}"/><path d="M73.5 76h13v12c-3 4-10 4-13 0z" fill="${a.skin}"/><path d="M73.5 88.5c2 4 11 4 13 0" fill="none" stroke="#000" stroke-opacity=".12" stroke-width="2"/>
<ellipse cx="65.5" cy="64" rx="3" ry="4.5" fill="${a.skin}"/><ellipse cx="94.5" cy="64" rx="3" ry="4.5" fill="${a.skin}"/><ellipse cx="80" cy="62" rx="15" ry="18" fill="${a.skin}"/><g fill="#1f1510" opacity=".78"><ellipse cx="74" cy="62" rx="1.7" ry="2"/><ellipse cx="86" cy="62" rx="1.7" ry="2"/></g><path d="M71 57.5q3-1.6 6 0M83 57.5q3-1.6 6 0" stroke="#1f1510" stroke-opacity=".55" stroke-width="1.2" fill="none" stroke-linecap="round"/><path d="M80 63.5l-1.4 4.2h2.4" stroke="#000" stroke-opacity=".18" stroke-width="1" fill="none"/><path d="M75.5 72q4.5 3.2 9 0" stroke="#5a2a20" stroke-opacity=".7" stroke-width="1.3" fill="none" stroke-linecap="round"/><ellipse cx="72" cy="68" rx="3" ry="1.8" fill="#d0705a" opacity=".12"/><ellipse cx="88" cy="68" rx="3" ry="1.8" fill="#d0705a" opacity=".12"/>${a.style === "long" ? `<path d="M64 58c0-13 7-20 16-20s16 7 16 20c-4-8-10-11-16-11s-12 3-16 11z" fill="${a.hair}"/>` : hair}
<rect x="-200" y="0" width="560" height="120" fill="url(#${id}l)"/></svg>`;
};
const spk = (h = [6, 11, 8]) => `<span class="ms-spk">${h.map((x) => `<i style="height:${x}px"></i>`).join("")}</span>`;
const tile = (k, opt = {}) => {
  const name = opt.label || PEOPLE[k].split(" ")[0] + (opt.full ? " " + PEOPLE[k].split(" ")[1] : "");
  if (opt.camOff) return `<div class="ms-tile${opt.live ? " ms-live" : ""}" style="${opt.style || ""};display:grid;place-items:center">${av(k, opt.avs || 64)}<span class="ms-tag ui">${opt.muted ? I("micoff", 13) : ""}${name}</span></div>`;
  return `<div class="ms-tile${opt.live ? " ms-live" : ""}" style="${opt.style || ""}">${feed(k)}<span class="ms-tag">${opt.muted ? I("micoff", 13) : opt.live ? spk() : ""}${name}</span>${opt.extra || ""}</div>`;
};
const ctl = (icon, label, cls = "", lab = true) => `<div style="display:grid;justify-items:center;gap:5px"><span class="btn ms-ctl ${cls}">${icon}</span>${lab ? `<span style="font-size:11px;font-weight:500" class="muted">${label}</span>` : ""}</div>`;

TPL["video-call/web"] = (p, st) => `${CSS}<div style="height:100%;display:flex;flex-direction:column">
<header style="height:60px;flex:none;display:flex;align-items:center;gap:14px;padding:0 24px;border-bottom:1px solid var(--border);background:var(--surface)"><div class="logo"><b></b>${p.name}</div><span class="ms-sep" style="height:24px"></span>
<div style="min-width:0"><div class="ms-row" style="gap:8px">${title(st, "Harbor launch go / no-go", 16)}<span class="badge" style="gap:5px"><span style="width:7px;height:7px;border-radius:50%;background:currentColor"></span>Recording</span></div><div class="muted" style="font-size:12px">#harbor-launch · Wed 28 Oct · 3:00 – 3:45 PM</div></div>
<span class="num" style="font-size:15px;margin-left:auto;display:inline-flex;gap:6px;align-items:center">${ic("clock", 15)}24:18</span>
${seg([`${ic("grid", 13)}Gallery`, `${I("layout", 13)}Speaker`], 1)}<span class="btn">${ic("users", 15)}6</span><span class="btn">${ic("link", 15)}Copy invite</span></header>
<div style="flex:1;display:grid;grid-template-columns:minmax(0,1fr) 340px;min-height:0">
<div style="display:flex;flex-direction:column;min-height:0">
<div style="flex:1;min-height:0;display:grid;grid-template-rows:minmax(0,1fr) 168px;gap:12px;padding:18px 20px 12px">
${tile("TR", { live: true, full: true, style: "height:100%", extra: `<div class="ms-cap"><b>Teodora:</b> …so pricing’s locked, legal’s two edits are in, and both pilots get the PDF tonight. I’m a go.</div><span class="ms-tag ui" style="left:auto;right:10px;bottom:auto;top:10px">${I("cc", 13)}Captions on</span>` })}
<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:12px">${tile("SA", { muted: true })}${tile("LP")}${tile("JW", { camOff: true, muted: true, avs: 56 })}${tile("PN", { muted: true })}${tile("MO", { label: "You" })}</div></div>
<div style="height:84px;flex:none;display:flex;align-items:center;padding:0 20px;border-top:1px solid var(--border);background:var(--surface)">
<div style="flex:1;display:flex;gap:8px;align-items:center" class="muted"><span class="ms-row" style="gap:6px;font-size:13px">${I("hand", 15)}<b style="color:var(--text);font-weight:600">Sam</b> raised a hand</span></div>
<div class="ms-row" style="gap:10px">${ctl(I("mic", 20), "Mute", "", false)}${ctl(I("cam", 20), "Camera", "", false)}${ctl(I("screen", 20), "Share", "", false)}${ctl(I("hand", 20), "Raise", "", false)}${ctl(I("smile", 20), "React", "", false)}${ctl(I("cc", 20), "Captions", "", false)}${ctl(ic("more", 20), "More", "", false)}</div>
<div style="flex:1;display:flex;justify-content:flex-end"><span class="btn ms-leave" style="height:44px;padding:0 18px">${I("hangup", 18)}Leave call</span></div></div>
</div>
<aside style="border-left:1px solid var(--border);display:flex;flex-direction:column;min-height:0;background:var(--surface)">
<div style="padding:14px 16px 0;display:grid;gap:12px;flex:none">${seg([`${ic("chat", 13)}Chat`, `${ic("users", 13)}People · 6`, `${ic("doc", 13)}Notes`], 0)}</div>
<div style="padding:12px 16px;display:flex;gap:8px;align-items:center;border-bottom:1px solid var(--border);flex:none">${stack(["TR", "SA", "LP", "JW"], 26)}<span class="muted" style="font-size:12px;font-weight:600">+2</span><span class="muted" style="font-size:12px">In call · Teodora is presenting</span></div>
<div style="padding:12px 16px;border-bottom:1px solid var(--border);display:grid;gap:7px;flex:none"><div class="ms-row"><span style="font-weight:600;font-size:13px">Agenda</span><span class="muted" style="font-size:12px">2 of 4 done</span><span class="muted" style="margin-left:auto;font-size:12px">Harbor launch plan</span></div>
${[["Pricing: annual Growth at $24/seat", 2], ["Legal: comparison page wording", 2], ["Pilot comms: Ostrava and Brightwell", 1], ["Support readiness for Files permissions", 0]].map(([t, d]) => `<div class="ms-row" style="gap:9px;font-size:13px"><span style="width:18px;height:18px;border-radius:50%;flex:none;display:grid;place-items:center;${d === 2 ? "background:var(--primary);color:var(--on-primary)" : d === 1 ? "border:2px solid var(--primary)" : "border:1.5px solid var(--border)"}">${d === 2 ? ic("check", 11) : d === 1 ? '<span style="width:6px;height:6px;border-radius:50%;background:var(--primary)"></span>' : ""}</span><span style="${d === 2 ? "color:var(--muted);text-decoration:line-through" : d === 1 ? "font-weight:600" : ""}">${t}</span>${d === 1 ? '<span class="badge" style="margin-left:auto">Now</span>' : ""}</div>`).join("")}</div>
<div style="flex:1;min-height:0;display:flex;flex-direction:column;justify-content:flex-end;gap:14px;padding:14px 16px;overflow:hidden;font-size:13px">
${[["MO", "3:02 PM", "Slides and the launch plan are linked in Notes if you joined late."], ["SA", "3:07 PM", "Ostrava can do Thursday at 10 for the pilot call."], ["LP", "3:11 PM", `Banner options for anyone who missed them: ${fileCard("FIG", "Harbor banner v3", "Figma · 4 frames", 22)}`], ["PN", "3:14 PM", "+1 to option B. The pilot data is pretty clear."], ["JW", "3:19 PM", "Release notes go out with the 10 Nov build. I’ll post the final draft here after the call."], ["TR", "3:22 PM", `${ment("Mara")} can you confirm support is briefed on Files permissions?`]]
    .map(([k, t, m]) => `<div style="display:flex;gap:9px">${av(k, 26)}<div style="min-width:0;flex:1;display:grid;gap:4px"><div class="ms-row" style="gap:6px"><b style="font-weight:600">${PEOPLE[k]}</b><span class="muted" style="font-size:11px">${t}</span></div><div style="line-height:1.5">${m}</div></div></div>`).join("")}
</div>
<div style="padding:12px 16px 16px;flex:none;border-top:1px solid var(--border)"><div class="input" style="gap:8px;height:40px">Send a message to everyone<span style="margin-left:auto;display:inline-flex;gap:8px">${I("smile", 16)}<span style="color:var(--primary);display:inline-flex">${ic("send", 16)}</span></span></div></div>
</aside></div></div>`;

TPL["video-call/mobile"] = (p, st) => phone(`<div class="mtop" style="gap:12px;padding-bottom:10px">${ic("chevdown", 22)}<div style="flex:1;min-width:0;text-align:center"><div style="font-weight:700" class="ms-ell">Harbor go / no-go</div><div class="muted" style="font-size:12px;display:inline-flex;gap:6px;align-items:center"><span style="width:7px;height:7px;border-radius:50%;background:var(--accent)"></span>REC · <span class="num" style="font-size:12px;font-weight:600">24:18</span> · 6 people</div></div>${I("flip", 22)}</div>
<div style="flex:1;min-height:0;display:flex;flex-direction:column;gap:10px;padding:2px 14px 12px;position:relative">
${tile("TR", { live: true, full: true, style: "flex:1;min-height:0", extra: `<div class="ms-cap" style="bottom:48px;max-width:88%;font-size:13px"><b>Teodora:</b> Pricing’s locked and both pilots get the PDF tonight. I’m a go.</div>` })}
<div style="position:absolute;right:26px;top:14px;width:96px;height:132px;border-radius:var(--radius-lg);box-shadow:var(--shadow-lg),0 0 0 2px var(--surface);overflow:hidden" class="ms-tile">${feed("MO")}<span class="ms-tag" style="left:6px;bottom:6px;height:22px;font-size:11px;padding:0 7px">You</span></div>
<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;height:104px;flex:none">${tile("SA", { muted: true, style: "height:100%" })}${tile("LP", { style: "height:100%" })}${tile("PN", { muted: true, style: "height:100%" })}<div class="ms-tile" style="display:grid;place-items:center;align-content:center;gap:6px">${stack(["JW", "MO"], 26)}<span style="font-size:12px;font-weight:600">+2 more</span></div></div>
</div>
<div style="flex:none;padding:14px 18px 30px;border-top:1px solid var(--border);background:var(--surface);display:flex;justify-content:space-between">${ctl(I("micoff", 21), "Unmute", "off")}${ctl(I("cam", 21), "Camera")}${ctl(I("screen", 21), "Share")}${ctl(ic("chat", 21), "Chat")}${ctl(I("hangup", 22), "Leave", "ms-leave")}</div>`);

// =============================================================================================
const def = (name, shows, elements, key) => ({ family: "workspace", name, shows, elements, web: TPL[key + "/web"], mobile: TPL[key + "/mobile"] });
module.exports = {
  "chat-list": def("Team chat inbox (conversations)", "channels and direct messages with unread counts, presence dots and last-message previews, a search bar, a new-message action and a selected conversation",
    ["sidebar-nav", "conversation-list", "search-bar", "unread-badge", "presence", "avatar", "segmented-control", "chat-bubbles", "composer", "fab"], "chat-list"),
  "chat-thread": def("Team chat channel thread", "a channel conversation with day dividers, reply-thread indicators, reactions, shared file cards, a typing indicator, a formatting composer and a channel details panel",
    ["sidebar-nav", "chat-messages", "day-divider", "reactions", "thread-replies", "attachments", "typing-indicator", "composer", "members-list", "details-panel"], "chat-thread"),
  "video-call": def("Video call in progress", "a speaker-view meeting with an active-speaker tile and live captions, participant tiles, mute, camera, share and leave controls, a timer and an in-call chat panel",
    ["video-tiles", "active-speaker", "call-controls", "captions", "timer", "chat-panel", "self-view", "recording-badge", "avatar"], "video-call"),
};
