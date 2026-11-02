/* AI + workspace operations: ai-workspace, ai-settings (Lumen Desk), version-history, approval-queue (Fernway).
   "Today" across these screens is Tuesday 3 November 2026. */
const { ic, sideNav, status, tabBar } = require("../lib");

const TPL = {};

// ---- local CSS (prefixed ao-) -----------------------------------------------------------------
const CSS = `<style>
.ao-lbl{font:600 11px var(--font-b);text-transform:uppercase;letter-spacing:.06em;color:var(--muted)}
.ao-row{display:flex;align-items:center;gap:10px}
.ao-ell{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.ao-crumb{display:flex;align-items:center;gap:8px;color:var(--muted);white-space:nowrap;min-width:0}.ao-crumb b{color:var(--text);font-weight:600}
.ao-cite{display:inline-grid;place-items:center;min-width:16px;height:16px;padding:0 4px;margin:0 1px;border-radius:4px;font:600 10px var(--font-b);vertical-align:2px;background:color-mix(in oklab,var(--primary) 14%,var(--surface));color:color-mix(in oklab,var(--primary) 78%,var(--text))}
.ao-cb{width:16px;height:16px;flex:none;border:1.5px solid color-mix(in oklab,var(--muted) 70%,var(--surface));border-radius:max(3px,var(--radius-sm));display:grid;place-items:center;background:var(--surface)}
.ao-cb.on{background:var(--primary);border-color:var(--primary);color:var(--on-primary)}
.ao-tog{width:34px;height:20px;border-radius:999px;background:color-mix(in oklab,var(--muted) 38%,var(--surface));position:relative;flex:none}
.ao-tog i{position:absolute;top:3px;left:3px;width:14px;height:14px;border-radius:50%;background:var(--surface);box-shadow:0 1px 2px color-mix(in oklab,var(--text) 25%,transparent)}
.ao-tog.on{background:var(--primary)}.ao-tog.on i{left:17px;background:var(--on-primary)}
.ao-seg{display:flex;padding:3px;border-radius:var(--radius);background:color-mix(in oklab,var(--text) 5%,var(--surface));border:1px solid var(--border);gap:2px}
.ao-seg span{flex:1;text-align:center;padding:4px 10px;border-radius:var(--radius-sm);font-weight:500;font-size:13px;color:var(--muted);white-space:nowrap}
.ao-seg span.on{background:var(--surface);color:var(--text);box-shadow:0 1px 2px color-mix(in oklab,var(--text) 16%,transparent)}
.ao-chip{display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 12px;border-radius:999px;border:1px solid var(--border);background:var(--surface);font-weight:500;font-size:13px;white-space:nowrap;flex:none}
.ao-chip.on{background:var(--text);border-color:var(--text);color:var(--bg)}
.ao-chip .n{font-size:11px;opacity:.7}
.ao-bar{height:8px;border-radius:999px;background:color-mix(in oklab,var(--text) 8%,var(--surface));overflow:hidden;display:flex}
.ao-range{position:relative;height:18px;display:flex;align-items:center}
.ao-range s{display:block;height:4px;width:100%;border-radius:999px;background:color-mix(in oklab,var(--text) 10%,var(--surface))}
.ao-range u{position:absolute;left:0;height:4px;border-radius:999px;background:var(--primary)}
.ao-range i{position:absolute;width:16px;height:16px;margin-left:-8px;border-radius:50%;background:var(--surface);border:2px solid var(--primary);box-shadow:var(--shadow-sm)}
.ao-sel{height:36px;border:1px solid var(--border);border-radius:var(--radius);background:var(--surface);padding:0 10px;display:flex;align-items:center;gap:8px;font-size:13px;justify-content:space-between;white-space:nowrap}
.ao-ico{width:30px;height:30px;border-radius:var(--radius);display:grid;place-items:center;flex:none}
.ao-add{background:color-mix(in oklab,var(--primary) 13%,var(--surface))}
.ao-del{background:color-mix(in oklab,var(--accent) 15%,var(--surface))}
.ao-add mark{background:color-mix(in oklab,var(--primary) 32%,var(--surface));color:inherit;border-radius:2px;padding:0 1px;font-weight:600}
.ao-del mark{background:color-mix(in oklab,var(--accent) 36%,var(--surface));color:inherit;border-radius:2px;padding:0 1px;text-decoration:line-through}
.ao-gap{background:repeating-linear-gradient(135deg,transparent 0 6px,color-mix(in oklab,var(--text) 5%,transparent) 6px 7px)}
.ao-ln{width:34px;flex:none;text-align:right;padding-right:8px;color:var(--muted);font:12px/26px ui-monospace,SFMono-Regular,Menlo,monospace}
.ao-mk{width:16px;flex:none;font:600 12px/26px ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--muted)}
.ao-code{flex:1;min-width:0;font:12.5px/26px ui-monospace,SFMono-Regular,Menlo,monospace;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding-right:10px}
.main>.top{flex:none}
</style>`;

// ---- shared bits ------------------------------------------------------------------------------
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
const tog = (on) => `<span class="ao-tog${on ? " on" : ""}"><i></i></span>`;
const cb = (on) => `<span class="ao-cb${on ? " on" : ""}">${on ? ic("check", 11) : ""}</span>`;
const range = (pct) => `<div class="ao-range"><s></s><u style="width:${pct}%"></u><i style="left:${pct}%"></i></div>`;
const tint = (c, pct = 15) => `background:color-mix(in oklab,${c} ${pct}%,var(--surface));color:color-mix(in oklab,${c} 75%,var(--text))`;
const cite = (n) => `<span class="ao-cite">${n}</span>`;
const STEPS = [["Reading sources", "Read"], ["Drafting", "Draft"], ["Checking citations", "Cite"], ["Ready", "Ready"]];
const steps = (compact) => `<div class="ao-row" style="gap:${compact ? 6 : 8}px;font-size:${compact ? 11.5 : 12}px;flex-wrap:nowrap">${STEPS.map(([t, m], i) => `${i ? `<span style="flex:1;min-width:8px;height:2px;border-radius:2px;background:color-mix(in oklab,var(--primary) 45%,var(--border))"></span>` : ""}<span class="ao-row" style="gap:6px;white-space:nowrap"><span style="width:18px;height:18px;border-radius:50%;display:grid;place-items:center;flex:none;background:var(--primary);color:var(--on-primary)">${ic("check", 11)}</span><span><b style="font-weight:600">${compact ? m : t}</b></span></span>`).join("")}</div>`;
const approveCard = (compact) => `<div class="card" style="padding:12px;display:grid;gap:8px;box-shadow:none;border-color:color-mix(in oklab,var(--accent) 50%,var(--border));background:color-mix(in oklab,var(--accent) 7%,var(--surface))"><div class="ao-row" style="gap:8px;font-size:12.5px"><span style="width:8px;height:8px;border-radius:50%;background:var(--accent);flex:none;box-shadow:0 0 0 4px color-mix(in oklab,var(--accent) 22%,transparent)"></span><b>Waiting for your approval</b></div><div style="font-size:12.5px;line-height:1.45">Search the web to verify 2 claims the sources don’t cover${compact ? "." : `: <i>Nibe share gain</i> and <i>Finnish 2027 scheme</i>.`} <span class="muted">About 600 credits.</span></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:6px"><span class="btn" style="height:30px">${ic("x", 13)}Stop</span><span class="btn primary" style="height:30px">${ic("check", 13)}Approve</span></div></div>`;
const H = (st, px) => `font-size:${Math.round(px * st.hscale)}px`;

// =============================================================================================
// 1. AI generation workspace (Lumen Desk)
// =============================================================================================
const AI_NAV = [["spark", "Desk"], ["doc", "Briefs"], ["folder", "Sources"], ["chat", "Chats"], ["chart", "Watchlists"], ["gear", "Settings"]];
const AI_TABS = [["spark", "Desk"], ["doc", "Briefs"], ["folder", "Sources"], ["gear", "Settings"]];
const SOURCES = [["doc", "IEA Heat Pump Outlook 2026.pdf", "PDF · 86 pp", true], ["grid", "SKVP installs Q3 2026.xlsx", "Sheet · 4 tabs", true],
  ["doc", "Enova subsidy notice (NO).pdf", "PDF · 12 pp", true], ["chat", "Analyst call notes, 21 Oct", "Note · Priya Nair", true], ["globe", "Web: Nordic trade press", "Last 90 days", false]];
const KPIS = [["Q3 installs, SE+NO+FI", "142,800", "−9% YoY"], ["Avg. subsidy per unit", "€2,350", "NO cut 18%"], ["Top-3 vendor share", "61%", "+4 pts"]];
const MARKETS = [["Sweden", "68,400", "−6%", "Unchanged"], ["Norway", "41,900", "−17%", "Cut 18% from 1 Jan"], ["Finland", "32,500", "−4%", "New 2027 scheme"]];
const CITES = [["IEA Heat Pump Outlook 2026", "p. 42", "“Nordic sales fell for a second year as rates stayed high…”"],
  ["SKVP installs Q3 2026", "Tab 2, row 18", "Air-to-water units: 31,240 (Q3 2025: 34,010)"],
  ["Enova subsidy notice", "§ 3.1", "“The maximum grant is reduced from NOK 40,000 to…”"],
  ["Analyst call notes", "21 Oct", "Installer backlog in Finland down to ~5 weeks"],
  ["IEA Heat Pump Outlook 2026", "p. 57", "Vendor concentration table, Nordics"]];

TPL["ai-workspace/web"] = (p, st) => `${CSS}<div class="shell">${sideNav(p, "Briefs", AI_NAV)}<main class="main">
<div class="top"><div class="ao-crumb">Briefs ${ic("chevron", 14)}<b>Nordic heat pumps: Q4 market brief</b></div><span class="badge">Draft v3</span>
<div style="margin-left:auto;display:flex;gap:8px"><span class="btn">${ic("share", 15)}Share</span><span class="btn">${ic("download", 15)}Export</span><span class="btn primary">${ic("spark", 15)}Refine</span></div></div>
<div style="flex:1;min-height:0;display:grid;grid-template-columns:318px minmax(0,1fr) 276px">
<section style="border-right:1px solid var(--border);padding:18px 18px;display:flex;flex-direction:column;gap:12px;background:color-mix(in oklab,var(--surface) 50%,var(--bg));min-height:0">
<div class="ao-row" style="justify-content:space-between"><span class="ao-lbl">Prompt</span><span class="muted" style="font-size:12px">312 / 4,000</span></div>
<div class="card" style="padding:12px 14px;font-size:13px;line-height:1.5">Summarise the Nordic residential heat-pump market for Q4. Compare Sweden, Norway and Finland on installs, subsidy changes and the top three vendors. Flag risks for a Q1 entry.</div>
<div class="ao-row" style="justify-content:space-between;margin-top:4px"><span class="ao-lbl">Sources · 4 of 5</span><span style="display:inline-flex;align-items:center;gap:4px;font-size:12px;font-weight:600;color:var(--primary)">${ic("plus", 13)}Add</span></div>
<div class="card" style="overflow:hidden">${SOURCES.map(([i, n, m, on], k) => `<div class="ao-row" style="padding:8px 12px;${k ? "border-top:1px solid var(--border)" : ""}">${cb(on)}<span class="ao-ico" style="width:26px;height:26px;${tint("var(--primary)", 12)}">${ic(i, 14)}</span><div style="min-width:0;flex:1"><div class="ao-ell" style="font-size:13px;font-weight:500">${n}</div><div class="muted" style="font-size:11px">${m}</div></div></div>`).join("")}</div>
<span class="ao-lbl" style="margin-top:4px">Options</span>
<div class="ao-seg"><span>Short</span><span class="on">Standard</span><span>Deep</span></div>
<div class="ao-sel"><span class="muted">Audience</span><span style="display:inline-flex;gap:6px;align-items:center;font-weight:500">Investment committee${ic("chevdown", 14)}</span></div>
${[["Inline citations", true], ["Include data tables", true], ["Search the web", false]].map(([l, on]) => `<div class="ao-row" style="justify-content:space-between;font-size:13px">${l}${tog(on)}</div>`).join("")}
<div style="margin-top:auto;display:grid;gap:6px"><button class="btn primary block">${ic("refresh", 15)}Regenerate brief</button><div class="muted" style="font-size:11px;text-align:center">About 4,200 credits · 1,840 left this month</div></div>
</section>
<section style="padding:22px 30px 18px;display:flex;flex-direction:column;gap:14px;min-height:0;min-width:0">
<div><div class="muted ao-row" style="font-size:12px;gap:8px">${ic("spark", 14)}Generated 2 min ago · 1,240 words · 14 citations · edited by Priya Nair</div>
<h1 style="${H(st, 26)};margin-top:6px">Nordic heat pumps: Q4 outlook</h1></div>
<div style="padding:10px 14px;border:1px solid var(--border);border-radius:var(--radius);background:color-mix(in oklab,var(--surface) 60%,var(--bg))">${steps(false)}</div>
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px">${KPIS.map(([l, v, d]) => `<div class="card" style="padding:12px 14px"><div class="muted" style="font-size:12px">${l}</div><div class="ao-row" style="gap:8px;margin-top:4px"><span class="num" style="font-size:21px">${v}</span><span class="badge" style="white-space:nowrap">${d}</span></div></div>`).join("")}</div>
<div style="display:grid;gap:6px"><h3 style="font-size:15px;font-family:var(--font-b);font-weight:600">Summary</h3>
<p style="font-size:13.5px;line-height:1.6">Residential installs across the three markets fell 9% year on year in Q3 ${cite(1)}${cite(2)}, the second straight annual decline. Norway drove most of the drop after Enova cut its maximum grant by 18% ${cite(3)}; Sweden held up on replacement demand, and Finland is stabilising as installer backlogs shrink to about five weeks ${cite(4)}. Vendor concentration keeps rising: the top three brands now hold 61% of units ${cite(5)}.</p></div>
<div class="card" style="overflow:hidden;font-size:13px"><div style="display:grid;grid-template-columns:1.1fr 1fr .7fr 1.5fr;padding:8px 14px;background:color-mix(in oklab,var(--text) 4%,var(--surface));font-weight:600;font-size:12px" class="muted"><span>Market</span><span>Q3 installs</span><span>YoY</span><span>Subsidy change</span></div>
${MARKETS.map(([c, n, y, s]) => `<div style="display:grid;grid-template-columns:1.1fr 1fr .7fr 1.5fr;padding:8px 14px;border-top:1px solid var(--border)"><span style="font-weight:500">${c}</span><span class="num" style="font-size:13px;font-weight:500;line-height:1.5">${n}</span><span>${y}</span><span class="muted">${s}</span></div>`).join("")}</div>
<div style="display:grid;gap:6px"><h3 style="font-size:15px;font-family:var(--font-b);font-weight:600">Risks for a Q1 entry</h3>
<ul style="padding-left:18px;display:grid;gap:4px;font-size:13.5px;line-height:1.5"><li>Norway’s lower grant may pull demand into December, leaving a soft Q1 ${cite(3)}</li><li>Top-three vendors control installer networks in all three countries ${cite(5)}</li></ul></div>
<div class="card" style="margin-top:auto;padding:12px 14px;display:grid;gap:10px;box-shadow:var(--shadow)"><div class="ao-row" style="justify-content:space-between"><span style="font-weight:600;font-size:13px">Next steps</span><span class="muted" style="font-size:12px">Draft saved to Briefs</span></div>
<div style="display:flex;gap:8px;flex-wrap:wrap"><span class="btn" style="height:32px">${ic("edit", 14)}Shorten to one page</span><span class="btn" style="height:32px">${ic("chart", 14)}Add a vendor chart</span><span class="btn" style="height:32px">${ic("doc", 14)}Export to Docs</span><span class="btn" style="height:32px">${ic("share", 14)}Send to Sam Achebe</span></div>
<div class="ao-row" style="border:1px solid var(--border);border-radius:var(--radius);padding:6px 6px 6px 12px;background:var(--bg)"><span class="muted" style="flex:1;font-size:13px">Ask ${p.name} to change something…</span><span class="btn primary" style="width:32px;height:30px;padding:0">${ic("send", 15)}</span></div></div>
</section>
<aside style="border-left:1px solid var(--border);padding:18px;display:flex;flex-direction:column;gap:12px;min-height:0;overflow:hidden">
<div class="ao-row" style="justify-content:space-between"><span class="ao-lbl">Citations · 14</span><span class="muted" style="font-size:12px">By order</span></div>
${CITES.map(([s, loc, q], i) => `<div style="display:flex;gap:10px;${i ? "border-top:1px solid var(--border);padding-top:10px" : ""}"><span class="ao-cite" style="margin:2px 0 0;height:18px;min-width:18px">${i + 1}</span><div style="min-width:0"><div class="ao-ell" style="font-size:12.5px;font-weight:600">${s}</div><div class="muted" style="font-size:11px">${loc}</div><div style="font-size:12px;margin-top:3px;line-height:1.4;color:color-mix(in oklab,var(--text) 82%,var(--muted))">${q}</div></div></div>`).join("")}
<div style="margin-top:auto">${approveCard(false)}</div><div class="card" style="padding:12px;display:grid;gap:8px"><div class="ao-row" style="justify-content:space-between;font-size:12.5px"><b>Source coverage</b><span class="num" style="font-size:13px">12 / 14</span></div><div class="ao-bar"><span style="width:86%;background:var(--primary)"></span></div>
<div style="display:flex;gap:8px;font-size:12px;line-height:1.4;padding:8px;border-radius:var(--radius);${tint("var(--accent)", 12)}">${ic("eye", 14)}<span>“Nibe gained 4 pts” appears only in call notes. <b>Verify</b></span></div></div>
</aside></div></main></div>`;

TPL["ai-workspace/mobile"] = (p, st) => `${CSS}<div class="phone">${status()}<div class="mtop">${ic("back", 22)}<div style="text-align:center"><div style="font-weight:600">Q4 market brief</div><div class="muted" style="font-size:11px">Draft v3 · ${p.name}</div></div>${ic("more", 22)}</div>
<div style="padding:0 20px 10px;flex:none"><div class="ao-seg"><span>Input</span><span class="on">Result</span><span>Sources 4</span></div></div>
<div class="mbody" style="gap:12px;padding-top:6px"><div><div class="muted ao-row" style="font-size:12px;gap:6px">${ic("spark", 13)}Generated 2 min ago · 14 citations</div><h1 style="${H(st, 23)};margin-top:4px">Nordic heat pumps: Q4 outlook</h1></div>${steps(true)}
<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">${KPIS.slice(0, 2).map(([l, v, d]) => `<div class="card" style="padding:10px 12px"><div class="muted ao-ell" style="font-size:11px">${l}</div><div class="num" style="font-size:20px;margin:3px 0">${v}</div><span class="badge">${d}</span></div>`).join("")}</div>
<p style="font-size:14px;line-height:1.55">Installs across Sweden, Norway and Finland fell 9% year on year in Q3 ${cite(1)}${cite(2)}. Norway drove most of the drop after Enova cut its grant by 18% ${cite(3)}; Finland is stabilising as installer backlogs shrink ${cite(4)}.</p>
<div style="display:grid;gap:4px"><div style="font-weight:600;font-size:14px">Risks for a Q1 entry</div><ul style="padding-left:18px;font-size:14px;line-height:1.5;display:grid;gap:3px"><li>Demand pulled into December by the grant cut ${cite(3)}</li><li>Top-three vendors hold 61% of units ${cite(5)}</li></ul></div>
${approveCard(true)}</div>
<div style="flex:none;padding:12px 16px 30px;border-top:1px solid var(--border);display:grid;gap:10px;background:var(--surface)"><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px"><span class="btn" style="padding:0 6px">${ic("edit", 15)}Refine</span><span class="btn" style="padding:0 6px">${ic("download", 15)}Export</span><span class="btn" style="padding:0 6px">${ic("share", 15)}Share</span></div>
<div class="ao-row" style="border:1px solid var(--border);border-radius:var(--radius-lg);padding:6px 6px 6px 14px;background:var(--bg)"><span class="muted" style="flex:1;font-size:14px">Ask for a change…</span><span class="btn primary" style="width:34px;height:32px;padding:0">${ic("send", 16)}</span></div></div></div>`;

// =============================================================================================
// 2. AI model + assistant settings (Lumen Desk)
// =============================================================================================
const MODELS = [["Ve", "Vela Pro 3", "Northwind AI", "Best for long briefs and careful citations", "200k context", true],
  ["Qu", "Quill 5", "Kestrel Labs", "Strong at tables and spreadsheet sources", "128k context", false],
  ["Sw", "Swift 2 Mini", "Cobalt Cloud", "Fast and cheap for quick summaries", "1M context", false]];
// [provider, masked key, added by, last used, status, created, expires]
const KEYS = [["Northwind AI", "nw-••••3f9a", "Mara Okafor", "2 h ago", "Active", "3 Nov", "3 Feb"], ["Kestrel Labs", "kl-••••c71e", "Sam Achebe", "Yesterday", "Active", "14 Sep", "Never"],
  ["Cobalt Cloud", "cb-••••Qk2", "Mara Okafor", "Never used", "Unused", "12 Oct", "12 Jan"], ["Ferro AI", "••••8bd0", "Jonah Weiss", "3 Sep", "Expired", "3 Jun", "3 Sep"]];
const keyBadge = (s) => s === "Active" ? `<span class="badge">${s}</span>` : `<span class="badge" style="${s === "Expired" ? tint("var(--accent)", 20) : tint("var(--muted)", 18)}">${s}</span>`;
const SPEND = [["Northwind", 268.4, "var(--primary)"], ["Kestrel", 112.9, "var(--accent)"], ["Cobalt", 31.3, "color-mix(in oklab,var(--primary) 45%,var(--surface))"]];
const VOICES = [["Wren", "Warm, unhurried"], ["Atlas", "Crisp, newsroom"], ["Juno", "Bright, quick"]];

TPL["ai-settings/web"] = (p, st, rnd) => `${CSS}<div class="shell">${sideNav(p, "Settings", AI_NAV)}<main class="main">
<div class="top"><div class="ao-crumb">Settings ${ic("chevron", 14)}<b>AI models &amp; assistant</b></div><span class="muted" style="margin-left:auto;font-size:12px">Saved 2 min ago</span><span class="btn">Discard</span><span class="btn primary">Save changes</span></div>
<div class="page" style="padding:20px 28px;gap:16px">
<div style="display:flex;gap:4px;border-bottom:1px solid var(--border)">${["General", "Models & keys", "Usage & limits", "Voice", "Members", "Data retention"].map((t, i) => `<span style="padding:8px 12px;font-weight:500;font-size:13px;${i === 1 ? "color:var(--text);box-shadow:inset 0 -2px 0 var(--primary)" : "color:var(--muted)"}">${t}</span>`).join("")}</div>
<div style="display:grid;grid-template-columns:minmax(0,1.12fr) minmax(0,1fr);gap:16px;align-items:start">
<div style="display:grid;gap:16px">
<div class="card" style="padding:16px 18px;display:grid;gap:12px"><div><div style="font-weight:600">Default model</div><div class="muted" style="font-size:12.5px">Used for new briefs and chats. Members can switch per brief.</div></div>
<div style="display:grid;gap:8px">${MODELS.map(([a, n, pv, d, ctx, on]) => `<div class="ao-row" style="padding:9px 12px;border-radius:var(--radius);border:1px solid ${on ? "var(--primary)" : "var(--border)"};${on ? "background:color-mix(in oklab,var(--primary) 6%,var(--surface))" : ""}"><span class="ao-ico" style="${tint(on ? "var(--primary)" : "var(--muted)", 16)};font:700 11px var(--font-b)">${a}</span><div style="flex:1;min-width:0"><div style="font-weight:600;font-size:13px">${n} <span class="muted" style="font-weight:400">· ${pv}</span></div><div class="muted ao-ell" style="font-size:12px">${d}</div></div><span class="muted" style="font-size:11px;white-space:nowrap">${ctx}</span><span style="width:18px;height:18px;border-radius:50%;flex:none;border:${on ? "5px solid var(--primary)" : "1.5px solid var(--border)"};background:var(--surface)"></span></div>`).join("")}</div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px"><div style="display:grid;gap:6px"><span style="font-size:12.5px;font-weight:500">Fallback if unavailable</span><div class="ao-sel">Quill 5 · Kestrel Labs${ic("chevdown", 14)}</div></div>
<div style="display:grid;gap:6px"><span class="ao-row" style="justify-content:space-between;font-size:12.5px;font-weight:500">Creativity<span class="num" style="font-size:12px">0.3</span></span><div style="height:36px;display:grid;align-items:center">${range(30)}</div></div></div></div>
<div class="card" style="overflow:hidden"><div class="ao-row" style="justify-content:space-between;padding:14px 18px 10px"><div><div style="font-weight:600">Provider API keys</div><div class="muted" style="font-size:12.5px">Encrypted at rest. Only admins can view or rotate. <span style="color:var(--primary);font-weight:600">API docs ↗</span></div></div><span class="btn" style="height:32px">${ic("plus", 14)}Add key</span></div>
<div style="margin:0 18px 12px;padding:10px 12px;border-radius:var(--radius);display:grid;gap:8px;${tint("var(--accent)", 10)};border:1px solid color-mix(in oklab,var(--accent) 40%,var(--border))"><div class="ao-row" style="gap:8px;font-size:12.5px;color:var(--text)">${ic("key", 15)}<span><b>Copy this key now.</b> You won’t be able to see it again after you leave this page.</span></div>
<div class="ao-row" style="gap:8px"><span class="ao-ell" style="flex:1;height:32px;display:flex;align-items:center;padding:0 10px;border-radius:var(--radius-sm);background:var(--surface);border:1px solid var(--border);color:var(--text);font:12px ui-monospace,Menlo,monospace">sk-ant-api03-7Hq2xVd9Lm4TzR0pWbE6nYk8sQ1uJ3f9a</span><span class="btn primary" style="height:32px">Copy</span></div></div>
<div class="muted" style="display:grid;grid-template-columns:1fr 1.35fr .6fr .9fr .6fr 66px 44px;gap:8px;padding:7px 18px;font-size:11.5px;font-weight:600;border-top:1px solid var(--border);background:color-mix(in oklab,var(--text) 3%,var(--surface))"><span>Provider</span><span>Key</span><span>Created</span><span>Last used</span><span>Expires</span><span>Status</span><span></span></div>
${KEYS.slice(0, 3).map(([pv, k, by, used, s, cr, ex]) => `<div style="display:grid;grid-template-columns:1fr 1.35fr .6fr .9fr .6fr 66px 44px;gap:8px;align-items:center;padding:9px 18px;border-top:1px solid var(--border);font-size:12.5px"><span><b style="font-weight:600">${pv}</b><div class="muted ao-ell" style="font-size:11px">${by}</div></span><span class="ao-ell" style="font-family:ui-monospace,Menlo,monospace;font-size:11.5px">${k}</span><span class="muted">${cr}</span><span class="${used === "Never used" ? "muted" : ""}">${used}</span><span class="muted">${ex}</span><span>${keyBadge(s)}</span><span class="ao-row muted" style="gap:8px">${ic("doc", 15)}${ic("more", 15)}</span></div>`).join("")}</div>
</div>
<div style="display:grid;gap:16px">
<div class="card" style="padding:16px 18px;display:grid;gap:10px"><div class="ao-row" style="justify-content:space-between"><div style="font-weight:600">Usage this month</div><span class="muted" style="font-size:12px">Resets 1 Dec</span></div>
<div class="ao-row" style="align-items:baseline;gap:8px"><span class="num" style="font-size:28px">$412.60</span><span class="muted">of $600 cap · 69%</span><span class="badge" style="margin-left:auto">2.9M tokens</span></div>
<div style="position:relative"><div class="ao-bar" style="height:10px">${SPEND.map(([, v, c]) => `<span style="width:${(v / 600) * 100}%;background:${c}"></span>`).join("")}</div><span style="position:absolute;left:80%;top:-3px;height:16px;border-left:2px dashed var(--text)"></span></div>
<div style="display:flex;gap:14px;font-size:12px;flex-wrap:wrap">${SPEND.map(([n, v, c]) => `<span class="ao-row" style="gap:6px"><span style="width:9px;height:9px;border-radius:2px;background:${c}"></span>${n} <b class="num" style="font-size:12px">$${v.toFixed(2)}</b></span>`).join("")}<span class="muted" style="margin-left:auto">Alert at 80%</span></div>
<div style="display:grid;gap:7px;padding-top:4px">${[["Last 15 min", "38 of 120 requests", 32], ["Last 24 h", "$41.20 of $120", 34], ["Last 30 days", "$412.60 of $600", 69]].map(([w, v, pc]) => `<div style="display:grid;grid-template-columns:92px 1fr 128px;gap:10px;align-items:center;font-size:12px"><span class="muted">${w}</span><div class="ao-bar" style="height:6px"><span style="width:${pc}%;background:${pc > 60 ? "var(--accent)" : "var(--primary)"}"></span></div><span class="num" style="font-size:12px;font-weight:500;text-align:right">${v}</span></div>`).join("")}</div>
<div style="display:grid;gap:0;border-top:1px solid var(--border)">${[["Monthly hard cap", "$600.00"], ["Per-member daily cap", "$25.00"]].map(([l, v]) => `<div class="ao-row" style="justify-content:space-between;padding:8px 0;font-size:13px;border-bottom:1px solid var(--border)"><span>${l}</span><span class="ao-sel" style="height:30px;width:110px;font-weight:500">${v}</span></div>`).join("")}<div class="ao-row" style="justify-content:space-between;padding:8px 0 0;font-size:13px"><span>Pause briefs when the cap is hit</span>${tog(true)}</div></div></div>
<div class="card" style="padding:16px 18px;display:grid;gap:12px"><div class="ao-row" style="justify-content:space-between"><div><div style="font-weight:600">Voice assistant</div><div class="muted" style="font-size:12.5px">Ask questions and hear briefs read aloud.</div></div>${tog(true)}</div>
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">${VOICES.map(([n, d], i) => `<div class="ao-row" style="gap:8px;padding:8px 10px;border-radius:var(--radius);border:1px solid ${i ? "var(--border)" : "var(--primary)"};${i ? "" : "background:color-mix(in oklab,var(--primary) 6%,var(--surface))"}"><span style="width:26px;height:26px;border-radius:50%;display:grid;place-items:center;flex:none;${i ? tint("var(--muted)", 16) : "background:var(--primary);color:var(--on-primary)"}">${ic("play", 11)}</span><div style="min-width:0"><div style="font-weight:600;font-size:13px">${n}</div><div class="muted ao-ell" style="font-size:11px">${d}</div></div></div>`).join("")}</div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px"><div style="display:grid;gap:6px"><span class="ao-row" style="justify-content:space-between;font-size:12.5px;font-weight:500">Speaking speed<span class="num" style="font-size:12px">1.1×</span></span><div style="height:30px;display:grid;align-items:center">${range(55)}</div></div>
<div style="display:grid;gap:6px"><span style="font-size:12.5px;font-weight:500">Wake word</span><div class="ao-sel" style="height:30px">“Hey Lumen”${ic("edit", 13)}</div></div></div>
${[["Read citation sources aloud", false, false], ["Suggest follow-up questions", true, true], ["Hands-free mode while driving", false, true]].map(([l, on, beta]) => `<div class="ao-row" style="justify-content:space-between;font-size:13px"><span class="ao-row" style="gap:8px">${l}${beta ? `<span class="badge" style="height:18px;font-size:10px">Beta</span>` : ""}</span>${tog(on)}</div>`).join("")}</div>
<div class="ao-row" style="gap:10px;align-items:flex-start;font-size:12.5px;line-height:1.45;padding:0 4px"><span class="muted">${ic("shield", 16)}</span><span class="muted"><b style="color:var(--text)">Your data isn’t used for training.</b> Prompts and sources go only to the provider you pick and are deleted from their logs after 30 days.</span></div>
</div></div></div></main></div>`;

TPL["ai-settings/mobile"] = (p, st) => {
  const grp = (t, inner, extra = "") => `<div style="display:grid;gap:6px"><div class="ao-row" style="justify-content:space-between"><span class="ao-lbl">${t}</span>${extra}</div><div class="card" style="overflow:hidden">${inner}</div></div>`;
  const row = (l, r, i, sub) => `<div class="ao-row" style="padding:9px 14px;${i ? "border-top:1px solid var(--border)" : ""};font-size:14px;min-height:42px"><div style="flex:1;min-width:0"><div class="ao-ell">${l}</div>${sub ? `<div class="muted ao-ell" style="font-size:11.5px">${sub}</div>` : ""}</div>${r}</div>`;
  const val = (v) => `<span class="muted ao-row" style="gap:4px;font-size:13px;white-space:nowrap">${v}${ic("chevron", 14)}</span>`;
  return `${CSS}<div class="phone">${status()}<div class="mtop">${ic("back", 22)}<div style="font-weight:600">AI &amp; voice</div><span style="font-weight:600;color:var(--primary);font-size:14px">Save</span></div>
<div class="mbody" style="gap:12px;padding-top:4px">
${grp("Model", row("Default model", val("Vela Pro 3"), 0, "Northwind AI · 200k context") + row("Fallback", val("Quill 5"), 1))}
${grp("API keys", KEYS.slice(0, 2).map(([pv, k, , , s], i) => row(pv, keyBadge(s), i, `<span style="font-family:ui-monospace,Menlo,monospace">${k}</span>`)).join(""), `<span style="font-size:12px;font-weight:600;color:var(--primary)">+ Add</span>`)}
${grp("Usage · November", `<div style="padding:12px 14px;display:grid;gap:8px"><div class="ao-row" style="align-items:baseline;gap:6px"><span class="num" style="font-size:22px">$412.60</span><span class="muted" style="font-size:13px">of $600</span><span class="badge" style="margin-left:auto">69%</span></div><div class="ao-bar">${SPEND.map(([, v, c]) => `<span style="width:${(v / 600) * 100}%;background:${c}"></span>`).join("")}</div><div class="muted" style="font-size:12px">Alert at 80% · resets 1 Dec</div></div>`)}
${grp("Voice assistant", row("Voice", val("Wren · warm"), 0) + `<div style="padding:9px 14px;border-top:1px solid var(--border);display:grid;gap:6px"><div class="ao-row" style="justify-content:space-between;font-size:14px">Speed<span class="num" style="font-size:13px">1.1×</span></div>${range(55)}</div>` + row("Wake word", val("Hey Lumen"), 1) + row("Read sources aloud", tog(false), 1))}
<div class="muted ao-row" style="gap:8px;font-size:12px;align-items:flex-start">${ic("shield", 14)}<span>Your data isn’t used to train models.</span></div>
</div>${tabBar("Settings", AI_TABS)}</div>`;
};

// =============================================================================================
// 3. Version history with diff (Fernway)
// =============================================================================================
const FW_NAV = [["inbox", "Inbox"], ["check", "My tasks"], ["grid", "Projects"], ["doc", "Docs"], ["folder", "Files"], ["users", "Team"], ["gear", "Settings"]];
// [leftNo, leftText, leftType, rightNo, rightText, rightType]; type: "" same, "d" removed, "a" added, "g" gap; "fold" = collapsed run
const DIFF = [
  [1, "## Launch window", "", 1, "## Launch window", ""],
  [2, "Harbor ships to pilot customers on <mark>Tue 10 Nov</mark>.", "d", 2, "Harbor ships to pilot customers on <mark>Thu 12 Nov</mark>.", "a"],
  [3, "General availability follows two weeks later.", "", 3, "General availability follows two weeks later.", ""],
  ["fold", "12 unchanged lines"],
  [16, "## Pricing", "", 16, "## Pricing", ""],
  [17, "Team plan: <mark>$12</mark> per seat, billed monthly.", "d", 17, "Team plan: <mark>$14</mark> per seat, billed monthly.", "a"],
  [18, "Annual discount: <mark>15%</mark>.", "d", 18, "Annual discount: <mark>20% (locked with Finance)</mark>.", "a"],
  ["", "", "g", 19, "Pilot customers keep $12 for their first year.", "a"],
  [19, "Business plan stays at $24 per seat.", "", 20, "Business plan stays at $24 per seat.", ""],
  ["fold", "8 unchanged lines"],
  [28, "## Owners", "", 29, "## Owners", ""],
  [29, "Copy: Lin Park", "", 30, "Copy: Lin Park", ""],
  [30, "Legal review: Jonah Weiss", "d", 31, "Legal review: Jonah Weiss <mark>(due Fri 6 Nov)</mark>", "a"],
  [31, "Pilot comms: <mark>Teodora Ruiz</mark>", "d", 32, "Pilot comms: <mark>Sam Achebe</mark>", "a"],
  ["", "", "g", 33, "Support macros: Priya Nair", "a"],
  [32, "", "", 34, "", ""],
  [33, "## Open questions", "", 35, "## Open questions", ""],
  [34, "Do we gate SSO behind the Business plan?", "d", "", "", "g"],
  [35, "Who signs off the comparison page?", "", 36, "Who signs off the comparison page?", ""],
];
const cell = (n, t, ty) => `<div class="${ty === "a" ? "ao-add" : ty === "d" ? "ao-del" : ty === "g" ? "ao-gap" : ""}" style="display:flex;min-width:0;height:26px"><span class="ao-ln">${n}</span><span class="ao-mk">${ty === "a" ? "+" : ty === "d" ? "−" : ""}</span><span class="ao-code">${t || "&nbsp;"}</span></div>`;
const VERSIONS = [["Today", [["v14", "MO", "Edited Pricing and Owners", "9:40 AM", "+6 −3", "B", "Current"], ["v13", "SA", "Added support macros owner", "8:15 AM", "+1", "", ""]]],
  ["Yesterday", [["v12", "TR", "Sent to pilot customers", "4:12 PM", "+11 −4", "A", "Published"], ["v11", "LP", "Rewrote launch window", "11:02 AM", "+3 −3", "", ""]]],
  ["Mon 26 Oct", [["v10", "JW", "Legal notes on comparison page", "5:48 PM", "+5", "", ""], ["v9", "MO", "Finance review draft", "2:30 PM", "+22 −9", "", "Named"], ["v8", "PN", "Support section outline", "10:05 AM", "+7", "", ""]]]];

TPL["version-history/web"] = (p, st) => `${CSS}<div class="shell">${sideNav(p, "Docs", FW_NAV)}<main class="main">
<div class="top"><div class="ao-crumb">Docs ${ic("chevron", 14)}Harbor launch plan ${ic("chevron", 14)}<b>Version history</b></div>
<div style="margin-left:auto;display:flex;gap:8px;align-items:center"><span class="ao-row" style="gap:8px;font-size:13px;margin-right:6px">Show autosaves${tog(false)}</span><span class="btn">${ic("grid", 15)}Compare versions</span><span class="btn primary">${ic("refresh", 15)}Restore this version</span></div></div>
<div style="flex:1;min-height:0;display:grid;grid-template-columns:minmax(0,1fr) 330px">
<section style="padding:22px 28px;display:flex;flex-direction:column;gap:14px;min-height:0;min-width:0">
<div class="ao-row" style="justify-content:space-between;gap:16px"><div class="ao-row" style="gap:10px;min-width:0">
<div class="card ao-row" style="padding:8px 12px;gap:8px;box-shadow:none"><span class="badge" style="${tint("var(--accent)", 18)}">A</span>${av("TR", 22)}<div><div style="font-weight:600;font-size:13px">v12 · Sent to pilot customers</div><div class="muted" style="font-size:11.5px">Teodora Ruiz · Mon 2 Nov, 4:12 PM</div></div></div>
<span class="muted">${ic("arrow", 18)}</span>
<div class="card ao-row" style="padding:8px 12px;gap:8px;box-shadow:none"><span class="badge">B</span>${av("MO", 22)}<div><div style="font-weight:600;font-size:13px">v14 · Current</div><div class="muted" style="font-size:11.5px">Mara Okafor · Today, 9:40 AM</div></div></div></div>
<div class="ao-seg" style="width:180px;flex:none"><span class="on">Split</span><span>Unified</span></div></div>
<div class="ao-row" style="gap:14px;font-size:13px"><span class="ao-row" style="gap:6px"><span class="ao-add" style="width:12px;height:12px;border-radius:3px;border:1px solid color-mix(in oklab,var(--primary) 40%,var(--surface))"></span><b class="num" style="font-size:13px">+9</b> added</span><span class="ao-row" style="gap:6px"><span class="ao-del" style="width:12px;height:12px;border-radius:3px;border:1px solid color-mix(in oklab,var(--accent) 45%,var(--surface))"></span><b class="num" style="font-size:13px">−7</b> removed</span><span class="muted">3 sections changed · 2 editors</span><span class="muted" style="margin-left:auto">${ic("chevdown", 14)} Jump to next change</span></div>
<div class="card" style="overflow:hidden;flex:none">
<div style="display:grid;grid-template-columns:1fr 1fr;border-bottom:1px solid var(--border);font-size:12px;font-weight:600;background:color-mix(in oklab,var(--text) 3%,var(--surface))"><span style="padding:7px 14px;border-right:1px solid var(--border)">v12 · before</span><span style="padding:7px 14px">v14 · current</span></div>
${DIFF.map((r) => r[0] === "fold" ? `<div class="muted" style="text-align:center;font-size:12px;height:26px;line-height:26px;background:color-mix(in oklab,var(--text) 4%,var(--surface));border-top:1px solid var(--border);border-bottom:1px solid var(--border)">${ic("chevdown", 12)} ${r[1]}</div>` : `<div style="display:grid;grid-template-columns:1fr 1fr"><div style="border-right:1px solid var(--border);min-width:0">${cell(r[0], r[1], r[2])}</div><div style="min-width:0">${cell(r[3], r[4], r[5])}</div></div>`).join("")}
</div>
<div class="card" style="padding:12px 14px;display:flex;gap:10px;font-size:13px;line-height:1.5;box-shadow:none;background:color-mix(in oklab,var(--primary) 5%,var(--surface))"><span style="color:var(--primary);margin-top:2px">${ic("spark", 16)}</span><span><b>What changed:</b> pilot launch moved to Thu 12 Nov, Team plan up $2 with a first-year price lock for pilots, annual discount 15% → 20%, pilot comms handed to Sam Achebe, SSO question resolved.</span></div>
<div class="ao-row" style="gap:22px;font-size:13px;margin-top:auto;padding-top:12px;border-top:1px solid var(--border)">${[["Highlight changes", true], ["Compare with current version", true], ["Show unchanged lines", false], ["Ignore whitespace", true]].map(([l, on]) => `<span class="ao-row" style="gap:8px">${cb(on)}${l}</span>`).join("")}<span class="muted" style="margin-left:auto;font-size:12px">Change 1 of 7</span></div>
</section>
<aside style="border-left:1px solid var(--border);display:flex;flex-direction:column;min-height:0;background:color-mix(in oklab,var(--surface) 50%,var(--bg))">
<div style="padding:18px 18px 12px;display:grid;gap:10px"><div class="ao-row" style="justify-content:space-between"><span style="font-weight:600">Versions</span><span class="muted" style="font-size:12px">14 saved</span></div><div class="ao-seg"><span class="on">All</span><span>Named</span><span>Mine</span></div></div>
<div style="flex:1;min-height:0;overflow:hidden;padding:0 18px">${VERSIONS.map(([g, vs]) => `<div class="ao-lbl" style="padding:8px 0 6px">${g}</div>${vs.map(([v, who, t, time, ch, mk, b]) => `<div style="display:flex;gap:10px;padding:8px 10px;margin:0 -10px;border-radius:var(--radius);${mk === "A" ? "background:color-mix(in oklab,var(--accent) 10%,var(--surface));box-shadow:inset 0 0 0 1px color-mix(in oklab,var(--accent) 40%,var(--surface))" : mk === "B" ? "background:color-mix(in oklab,var(--primary) 7%,var(--surface))" : ""}">
<div style="display:flex;flex-direction:column;align-items:center;gap:4px;padding-top:4px"><span style="width:10px;height:10px;border-radius:50%;flex:none;${b ? "background:var(--primary)" : "border:2px solid var(--muted);background:var(--surface)"}"></span><span style="width:2px;flex:1;background:var(--border)"></span></div>
<div style="flex:1;min-width:0"><div class="ao-row" style="gap:6px"><b style="font-size:13px">${v}</b>${b ? `<span class="badge" style="height:18px;font-size:10px;${b === "Published" ? tint("var(--accent)", 22) : ""}">${b === "Published" ? "● " : ""}${b}</span>` : ""}${mk ? `<span class="badge" style="height:18px;font-size:10px;margin-left:auto;${mk === "A" ? tint("var(--accent)", 22) : ""}">${mk === "A" ? "A · comparing" : "B"}</span>` : ""}</div><div class="ao-ell" style="font-size:12.5px">${t}</div>
<div class="ao-row muted" style="gap:6px;font-size:11.5px;margin-top:3px">${av(who, 16)}${PEOPLE[who].split(" ")[0]} · ${time}<span style="margin-left:auto" class="num">${ch}</span></div></div></div>`).join("")}`).join("")}</div>
<div style="padding:14px 18px 18px;border-top:1px solid var(--border);display:grid;gap:6px"><button class="btn primary block">${ic("refresh", 15)}Restore this version</button><div class="muted" style="font-size:11.5px;text-align:center">Restoring saves it as v15. Nothing is deleted.</div></div>
</aside></div></main></div>`;

TPL["version-history/mobile"] = (p, st) => {
  const uni = [[2, "Harbor ships to pilots on <mark>Tue 10 Nov</mark>.", "d"], [2, "Harbor ships to pilots on <mark>Thu 12 Nov</mark>.", "a"], ["fold", "12 unchanged lines"], [16, "## Pricing", ""],
    [17, "Team plan: <mark>$12</mark> per seat, billed monthly.", "d"], [17, "Team plan: <mark>$14</mark> per seat, billed monthly.", "a"], [18, "Annual discount: <mark>15%</mark>.", "d"], [18, "Annual discount: <mark>20%</mark>.", "a"], [19, "Pilots keep $12 for their first year.", "a"],
    ["fold", "9 unchanged lines"], [31, "Pilot comms: <mark>Teodora Ruiz</mark>", "d"], [31, "Pilot comms: <mark>Sam Achebe</mark>", "a"], [32, "Support macros: Priya Nair", "a"]];
  return `${CSS}<div class="phone">${status()}<div class="mtop">${ic("back", 22)}<div style="text-align:center"><div style="font-weight:600">Version history</div><div class="muted" style="font-size:11px">Harbor launch plan</div></div>${ic("more", 22)}</div>
<div class="mbody" style="gap:12px;padding-top:4px">
<div class="card ao-row" style="padding:10px 12px;gap:8px;box-shadow:none"><span class="badge" style="${tint("var(--accent)", 18)}">v12</span><span class="muted">${ic("arrow", 15)}</span><span class="badge">v14 · Current</span><span class="ao-row" style="margin-left:auto;gap:8px;font-size:12.5px"><b class="num" style="font-size:13px">+9</b><b class="num" style="font-size:13px">−7</b></span></div>
<div class="card" style="overflow:hidden">${uni.map((r) => r[0] === "fold" ? `<div class="muted" style="text-align:center;font-size:11.5px;height:24px;line-height:24px;background:color-mix(in oklab,var(--text) 4%,var(--surface))">${ic("chevdown", 11)} ${r[1]}</div>` : `<div class="${r[2] === "a" ? "ao-add" : r[2] === "d" ? "ao-del" : ""}" style="display:flex;height:25px"><span class="ao-ln" style="width:28px;line-height:25px">${r[0]}</span><span class="ao-mk" style="line-height:25px">${r[2] === "a" ? "+" : r[2] === "d" ? "−" : ""}</span><span class="ao-code" style="font-size:12px;line-height:25px">${r[1]}</span></div>`).join("")}</div>
<div class="ao-row" style="justify-content:space-between"><span class="ao-lbl">Versions</span><span class="muted" style="font-size:12px">14 saved</span></div>
<div class="card" style="overflow:hidden">${[["v14", "MO", "Edited Pricing and Owners", "Today 9:40 AM", "Current", false], ["v13", "SA", "Added support macros owner", "Today 8:15 AM", "", false], ["v12", "TR", "Sent to pilot customers", "Yesterday 4:12 PM", "Published", true]].map(([v, who, t, time, b, on], i) => `<div class="ao-row" style="padding:9px 12px;${i ? "border-top:1px solid var(--border);" : ""}${on ? "background:color-mix(in oklab,var(--accent) 10%,var(--surface))" : ""}">${av(who, 28)}<div style="flex:1;min-width:0"><div class="ao-row" style="gap:6px"><b style="font-size:13.5px">${v}</b>${b ? `<span class="badge" style="height:18px;font-size:10px">${b}</span>` : ""}</div><div class="muted ao-ell" style="font-size:12px">${t} · ${time}</div></div>${on ? `<span style="color:var(--accent)">${ic("check", 18)}</span>` : ic("chevron", 16)}</div>`).join("")}</div>
</div>
<div style="flex:none;padding:12px 16px 30px;border-top:1px solid var(--border);display:grid;grid-template-columns:1fr 1.4fr;gap:10px;background:var(--surface)"><span class="btn" style="height:44px">${ic("eye", 16)}Preview</span><span class="btn primary" style="height:44px">${ic("refresh", 16)}Restore v12</span></div></div>`;
};

// =============================================================================================
// 4. Approval queue (Fernway)
// =============================================================================================
const AQ_NAV = [["inbox", "Inbox"], ["check", "My tasks"], ["shield", "Approvals"], ["doc", "Docs"], ["folder", "Files"], ["users", "Team"], ["gear", "Settings"]];
const TYPE = { content: ["doc", "Content", "var(--primary)"], access: ["key", "Access", "color-mix(in oklab,var(--primary) 50%,var(--accent))"], expense: ["card", "Expense", "var(--accent)"] };
const REQS = [["content", "Publish pricing page update", "LP", "Website", "", "2h", "Due today", true],
  ["access", "Admin access to Finance folder", "SA", "Files", "", "40m", "", true],
  ["expense", "Figma Organization renewal", "TR", "Software", "$1,800.00", "1d", "", false],
  ["expense", "Client dinner, Kettle & Fern", "JW", "Meals", "$286.40", "1d", "", false],
  ["access", "Guest access for Ostrava Labs (2)", "PN", "Workspace", "", "2d", "Overdue", false],
  ["content", "Q4 newsletter: Harbor launch", "LP", "Email", "", "3d", "", false],
  ["expense", "Conference travel, Lisbon", "SA", "Travel", "$1,240.00", "3d", "", false],
  ["access", "Billing role for Jonah Weiss", "JW", "Billing", "", "4d", "", false]];
const typeIco = (t, s = 30) => `<span class="ao-ico" style="width:${s}px;height:${s}px;${tint(TYPE[t][2], 15)}">${ic(TYPE[t][0], Math.round(s * 0.5))}</span>`;
const sla = (s) => !s ? "" : `<span class="badge" style="${s === "Overdue" ? tint("var(--accent)", 22) : ""}">${s}</span>`;
const CHANGES = [["Team plan price", "$12 / seat / month", "$14 / seat / month"], ["Annual discount", "Save 15%", "Save 20%"],
  ["Hero headline", "Plan launches without the chaos", "Ship launches your whole team can see"], ["FAQ", "", "Do pilot customers keep their price? Yes, for 12 months."]];

TPL["approval-queue/web"] = (p, st) => `${CSS}<div class="shell">${sideNav(p, "Approvals", AQ_NAV)}<main class="main">
<div class="top"><div class="h" style="font-size:${Math.round(16 * st.hscale)}px">Approvals</div><span class="badge">12 pending</span><div class="search">${ic("search", 16)}Search requests or people</div><span class="btn">${ic("gear", 15)}Rules &amp; delegates</span></div>
<div style="flex:1;min-height:0;display:grid;grid-template-columns:500px minmax(0,1fr)">
<section style="border-right:1px solid var(--border);display:flex;flex-direction:column;min-height:0;position:relative">
<div style="display:flex;gap:4px;padding:0 13px;border-bottom:1px solid var(--border)">${[["Pending review", 12], ["Changes requested", 3], ["Approved", 48], ["Not submitted", 2]].map(([t, n], i) => `<span style="padding:11px 5px 9px;font-weight:500;font-size:12.5px;white-space:nowrap;${i ? "color:var(--muted)" : "color:var(--text);box-shadow:inset 0 -2px 0 var(--primary)"}">${t} <span class="num" style="font-size:11.5px;opacity:.75">${n}</span></span>`).join("")}</div>
<div style="padding:12px 18px 10px;display:grid;gap:10px"><div style="display:flex;gap:6px">${[["All", 12], ["Access", 4], ["Expenses", 5], ["Content", 3]].map(([t, n], i) => `<span class="ao-chip${i ? "" : " on"}">${t}<span class="n">${n}</span></span>`).join("")}</div>
<div class="ao-row" style="justify-content:space-between;font-size:12.5px"><span class="muted ao-row" style="gap:6px">${ic("filter", 14)}Assigned to me · Oldest first</span><span class="muted">Showing 8 of 12</span></div></div>
<div class="feat ao-row" style="position:absolute;left:18px;right:18px;bottom:16px;z-index:2;padding:10px 10px 10px 14px;border-radius:var(--radius);background:var(--text);color:var(--bg);font-size:13px;box-shadow:var(--shadow-lg)">${ic("x", 15)}<span style="flex:1">1 request declined · <span style="opacity:.75">Extra seats for Design team</span></span><b style="padding:0 6px">Undo</b></div>
<div class="ao-row feat" style="margin:0 18px 8px;padding:7px 8px 7px 12px;border-radius:var(--radius);background:var(--text);color:var(--bg);font-size:13px"><span style="flex:1"><b>2 items selected</b></span><span class="btn" style="height:28px;background:transparent;border-color:color-mix(in oklab,var(--bg) 35%,transparent);color:var(--bg)">Reject</span><span class="btn primary" style="height:28px">${ic("check", 14)}Approve 2</span></div>
<div style="flex:1;min-height:0;overflow:hidden">${REQS.map(([t, title, who, area, amt, age, s, sel], i) => `<div class="ao-row" style="padding:10px 18px;border-top:1px solid var(--border);${i === 0 ? "background:color-mix(in oklab,var(--primary) 8%,var(--surface));box-shadow:inset 3px 0 0 var(--primary)" : ""}">${cb(sel)}${typeIco(t)}<div style="flex:1;min-width:0"><div class="ao-ell" style="font-weight:600;font-size:13.5px">${title}</div><div class="muted ao-row" style="gap:6px;font-size:12px">${av(who, 16)}<span class="ao-ell">${PEOPLE[who]} · ${TYPE[t][1]} · ${area}</span></div></div><div style="display:grid;justify-items:end;gap:3px;flex:none">${amt ? `<span class="num" style="font-size:13px">${amt}</span>` : `<span class="muted" style="font-size:12px">Waiting ${age}</span>`}${s ? sla(s) : amt ? `<span class="muted" style="font-size:12px">Waiting ${age}</span>` : ""}</div></div>`).join("")}</div>
</section>
<section style="display:flex;flex-direction:column;min-height:0;min-width:0">
<div style="flex:1;min-height:0;overflow:hidden;padding:20px 28px;display:flex;flex-direction:column;gap:14px">
<div class="ao-row" style="justify-content:space-between;align-items:flex-start"><div style="display:grid;gap:6px"><div class="ao-row" style="gap:8px"><span class="badge" style="${tint("var(--primary)", 16)}">${ic("doc", 12)}&nbsp;Content approval</span>${sla("Due today")}<span class="muted" style="font-size:12px">REQ-2318</span></div>
<h2 style="${H(st, 22)}">Publish pricing page update</h2><div class="muted ao-row" style="gap:6px;font-size:13px">${av("LP", 20)}<b style="color:var(--text);font-weight:600">Lin Park</b> requested 2 hours ago · fernway.app/pricing · goes live on approval</div></div>
<span class="btn" style="width:36px;padding:0">${ic("more", 16)}</span></div>
<div style="display:flex;gap:10px;padding:10px 14px;border-radius:var(--radius);background:color-mix(in oklab,var(--text) 4%,var(--surface));font-size:13px;line-height:1.5">${ic("quote", 16)}<span>Finance locked the new Team price yesterday. This brings the pricing page and FAQ in line before pilots get the launch email on Thursday.</span></div>
<div class="ao-row" style="justify-content:space-between"><span style="font-weight:600">Proposed changes <span class="muted" style="font-weight:500">· 4 · 1 accepted</span></span><span class="ao-row" style="gap:14px;font-size:12.5px"><span class="muted ao-row" style="gap:6px">${ic("eye", 14)}Preview page</span><span style="color:var(--primary);font-weight:600">Accept all</span><span class="muted" style="font-weight:600">Decline all</span></span></div>
<div style="display:grid;gap:8px">${CHANGES.map(([f, a, b], i) => `<div class="card" style="display:grid;grid-template-columns:minmax(0,1fr) 156px;box-shadow:none;overflow:hidden;${i === 0 ? "border-color:color-mix(in oklab,var(--primary) 45%,var(--border))" : ""}"><div style="padding:10px 14px;display:grid;gap:5px;font-size:13px;min-width:0"><span class="ao-row" style="gap:8px;font-weight:600;font-size:12.5px">${f}${i === 0 ? `<span class="badge" style="height:18px;font-size:10px">${ic("check", 10)}&nbsp;Accepted</span>` : ""}</span><div style="display:grid;grid-template-columns:minmax(0,1fr) 16px minmax(0,1fr);gap:8px;align-items:center">${a ? `<span class="ao-del ao-ell" style="padding:3px 8px;border-radius:var(--radius-sm);text-decoration:line-through;color:color-mix(in oklab,var(--text) 75%,var(--muted))">${a}</span>` : `<span class="muted" style="font-size:12px;padding:3px 0">New FAQ entry</span>`}<span class="muted">${ic("arrow", 14)}</span><span class="ao-add ao-ell" style="padding:3px 8px;border-radius:var(--radius-sm);font-weight:500">${b}</span></div></div>
<div style="border-left:1px solid var(--border);display:grid;font-size:12px;font-weight:500;background:color-mix(in oklab,var(--text) 2%,var(--surface))">${[["check", "Approve", "var(--primary)"], ["edit", "Request changes", ""], ["x", "Reject", ""]].map(([icn, l, c], k) => `<span class="ao-row" style="gap:6px;padding:0 10px;height:24px;white-space:nowrap;${k ? "border-top:1px solid var(--border);" : ""}${c && i ? `color:${c};font-weight:600` : "color:var(--muted)"}">${ic(icn, 12)}${l}</span>`).join("")}</div></div>`).join("")}</div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
<div class="card" style="padding:12px 14px;display:grid;gap:8px;align-content:start"><span class="ao-lbl">Checks</span>${[[1, "Matches Finance sheet “Q4 pricing v3”"], [1, "Comparison table reviewed by Jonah Weiss"], [0, "Product tour screenshots still show $12"]].map(([ok, t]) => `<div class="ao-row" style="gap:8px;font-size:12.5px;align-items:flex-start"><span style="width:18px;height:18px;border-radius:50%;display:grid;place-items:center;flex:none;${ok ? "background:var(--primary);color:var(--on-primary)" : tint("var(--accent)", 24)}">${ok ? ic("check", 11) : `<b style="font-size:11px">!</b>`}</span><span>${t}</span></div>`).join("")}</div>
<div class="card" style="padding:12px 14px;display:grid;gap:8px;align-content:start"><span class="ao-lbl">Approval chain</span>${[["TR", "Teodora Ruiz", "Approved · 11:20 AM", 1], ["MO", "You", "Waiting on you", 2], ["JW", "Jonah Weiss", "Next · publishes", 0]].map(([k, n, s, d]) => `<div class="ao-row" style="gap:8px;font-size:12.5px">${av(k, 22)}<b style="font-weight:600">${n}</b><span style="margin-left:auto;font-size:12px;${d === 2 ? "color:var(--primary);font-weight:600" : "color:var(--muted)"}">${s}</span></div>`).join("")}</div></div>
</div>
<div style="flex:none;border-top:1px solid var(--border);padding:12px 28px;display:flex;gap:10px;align-items:center;background:var(--surface)"><div class="ao-row ao-ell" style="flex:1;height:36px;border:1px solid var(--border);border-radius:var(--radius);padding:0 12px;color:var(--muted);font-size:13px;background:var(--bg)">Add a note for Lin (optional)…</div><span class="btn">${ic("x", 15)}Reject</span><span class="btn">${ic("edit", 15)}Request changes</span><span class="btn primary">${ic("check", 15)}Approve &amp; publish</span></div>
</section></div></main></div>`;

TPL["approval-queue/mobile"] = (p, st) => `${CSS}<div class="phone">${status()}<div class="mtop"><div><h1 style="${H(st, 26)}">Approvals</h1><div class="muted" style="font-size:12px">12 pending · 2 due today</div></div><span class="btn" style="width:38px;padding:0">${ic("filter", 17)}</span></div>
<div style="display:flex;gap:6px;padding:0 20px 10px;overflow:hidden;flex:none">${[["All", 12], ["Access", 4], ["Expenses", 5], ["Content", 3]].map(([t, n], i) => `<span class="ao-chip${i ? "" : " on"}">${t}<span class="n">${n}</span></span>`).join("")}</div>
<div class="mbody" style="gap:10px;padding-top:4px">
${REQS.slice(0, 2).map(([t, title, who, area, , age, s]) => `<div class="card" style="padding:12px 14px;display:grid;gap:10px"><div class="ao-row" style="align-items:flex-start">${typeIco(t, 34)}<div style="flex:1;min-width:0"><div style="font-weight:600;font-size:14px;line-height:1.3">${title}</div><div class="muted ao-row" style="gap:5px;font-size:12px;margin-top:3px">${av(who, 16)}<span class="ao-ell">${PEOPLE[who]} · ${area} · ${age} ago</span></div></div>${sla(s)}</div>
${t === "content" ? `<div style="display:grid;gap:4px;font-size:12.5px"><div class="ao-del" style="padding:3px 8px;border-radius:var(--radius-sm);text-decoration:line-through">Team plan: $12 / seat</div><div class="ao-add" style="padding:3px 8px;border-radius:var(--radius-sm);font-weight:500">Team plan: $14 / seat</div><div class="muted" style="font-size:12px">+3 more changes</div></div>` : `<div class="muted" style="font-size:12.5px;line-height:1.45">“For the Q3 invoice reconcile.” Access ends in 7 days.</div>`}
<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><span class="btn">${ic("x", 15)}Reject</span><span class="btn primary">${ic("check", 15)}Approve</span></div></div>`).join("")}
<div class="ao-lbl" style="margin-top:2px">Earlier</div>
<div class="card" style="overflow:hidden">${REQS.slice(2, 5).map(([t, title, who, , amt, age, s], i) => `<div class="ao-row" style="padding:10px 12px;${i ? "border-top:1px solid var(--border)" : ""}">${typeIco(t, 30)}<div style="flex:1;min-width:0"><div class="ao-ell" style="font-weight:600;font-size:13.5px">${title}</div><div class="muted ao-ell" style="font-size:12px">${PEOPLE[who]} · ${age} ago</div></div>${amt ? `<span class="num" style="font-size:13px">${amt}</span>` : sla(s)}</div>`).join("")}</div>
</div>${tabBar("Approvals", [["inbox", "Inbox"], ["check", "Tasks"], ["shield", "Approvals"], ["folder", "Files"]])}</div>`;

// =============================================================================================
const def = (family, name, shows, elements, key) => ({ family, name, shows, elements, web: TPL[key + "/web"], mobile: TPL[key + "/mobile"] });
module.exports = {
  "ai-workspace": def("ai", "AI generation workspace", "a prompt and sources input panel with generation options, a generated market brief with inline citations, KPI cards and a table, a citations inspector and next-step actions (refine, export, share)",
    ["sidebar-nav", "ai", "prompt-input", "sources", "toggle", "segmented-control", "citations", "inspector", "kpi", "table", "next-steps", "composer"], "ai-workspace"),
  "ai-settings": def("ai", "AI model and assistant settings", "default model and provider choice, a fallback model, masked provider API keys, a monthly usage meter with spend caps and alerts, and voice assistant options (voice, speed, wake word)",
    ["sidebar-nav", "settings", "tabs", "radio", "api-keys", "table", "usage-meter", "progress", "slider", "toggle", "voice", "ai"], "ai-settings"),
  "version-history": def("workspace", "Document version history and diff", "a split before/after diff with added and removed lines and inline changes highlighted, a version timeline grouped by day with named versions, an AI change summary and a restore action",
    ["sidebar-nav", "breadcrumbs", "diff", "timeline", "version-list", "segmented-control", "toggle", "restore", "avatar", "badge"], "version-history"),
  "approval-queue": def("workspace", "Approval queue", "a filterable queue of pending access, expense and content requests with bulk approve and reject, and the selected request's proposed changes, checks, approval chain and approve / request changes / reject actions",
    ["sidebar-nav", "list", "filter-chips", "checkbox", "bulk-actions", "badge", "avatar", "diff", "approval-chain", "checklist", "button"], "approval-queue"),
};
