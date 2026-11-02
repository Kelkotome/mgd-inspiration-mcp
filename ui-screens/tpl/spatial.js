/* Spatial workspace patterns (Fernway — tasks, docs and files for small teams):
   canvas-editor (flow / sitemap canvas with inspector) and floor-plan (desk and room booking map).
   "Today" is Wednesday 28 October 2026, matching tpl/workspace.js. */
const { ic, esc, status, tabBar, ICON } = require("../lib");

Object.assign(ICON, {
  spatial_cursor: '<path d="M5 3.5l13.5 6.8-5.8 1.9-2 5.9z"/>',
  spatial_hand: '<path d="M8 13V6a1.5 1.5 0 0 1 3 0v5M11 10.5V4.5a1.5 1.5 0 0 1 3 0V11M14 10.5V6a1.5 1.5 0 0 1 3 0v7c0 4-2.5 7-6 7-2.5 0-4-1.2-5.5-3.5L3.8 13a1.5 1.5 0 0 1 2.5-1.6L8 14"/>',
  spatial_connector: '<circle cx="5" cy="19" r="2"/><circle cx="19" cy="5" r="2"/><path d="M7 19h3a2 2 0 0 0 2-2V7a2 2 0 0 1 2-2h3"/>',
  spatial_text: '<path d="M5 7V4h14v3M12 4v16M9 20h6"/>',
  spatial_frame: '<path d="M7 3v18M17 3v18M3 7h18M3 17h18"/>',
  spatial_undo: '<path d="M9 14L4 9l5-5M4 9h10a6 6 0 0 1 0 12h-3"/>',
  spatial_redo: '<path d="M15 14l5-5-5-5M20 9H10a6 6 0 0 0 0 12h3"/>',
  spatial_fit: '<path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"/>',
  spatial_diamond: '<path d="M12 3l9 9-9 9-9-9z"/>',
  spatial_screen: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M7 6.5h.01"/>',
  spatial_hook: '<path d="M9 7a3 3 0 1 1 3 3v4a4 4 0 1 1-4 4M15 14h4l-2-3"/>',
  spatial_note: '<path d="M4 4h16v11l-5 5H4zM15 20v-5h5"/>',
  spatial_monitor: '<rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M9 20h6M12 16v4"/>',
  spatial_stand: '<path d="M3 9h18M7 9v11M17 9v11M5 20h4M15 20h4M12 3v3"/>',
  spatial_desk: '<rect x="3" y="7" width="18" height="5" rx="1"/><path d="M5 12v8M19 12v8M9 12v4h6v-4"/>',
  spatial_room: '<rect x="3" y="4" width="18" height="16" rx="1.5"/><path d="M12 4v6M3 14h7"/>',
  spatial_video: '<rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10l5-3v10l-5-3"/>',
  spatial_access: '<circle cx="12" cy="4.5" r="1.5"/><path d="M12 7.5V13h5l2 5M12 10h4M8.5 11a5.5 5.5 0 1 0 7 7"/>',
  spatial_board: '<rect x="3" y="4" width="18" height="12" rx="1"/><path d="M8 20l2-4M16 20l-2-4M7 8.5h6M7 11.5h9"/>',
  spatial_window: '<rect x="4" y="3" width="16" height="18" rx="1"/><path d="M12 3v18M4 12h16"/>',
  spatial_layers: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
});

const mix = (a, p, b) => `color-mix(in oklab,${a} ${p}%,${b})`;
const H = (st, px) => Math.round(px * st.hscale);
const TPL = {};

const CSS = `<style>
.sp-ell{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.sp-row{display:flex;align-items:center;gap:8px}
.sp-grid{background-color:var(--bg);background-image:radial-gradient(circle,${mix("var(--text)", 24, "transparent")} 1px,transparent 1.6px);background-size:20px 20px}
.sp-node{position:absolute;padding:10px 12px;display:flex;flex-direction:column;gap:3px;line-height:1.3;border-radius:var(--radius)}
.sp-node .k{display:flex;align-items:center;gap:7px;font:600 10.5px var(--font-b);text-transform:uppercase;letter-spacing:.06em;color:var(--muted);margin-bottom:2px}
.sp-node .t{font-weight:600;font-size:13.5px}
.sp-node .d{font-size:12px;color:var(--muted)}
.sp-chip{width:22px;height:22px;border-radius:var(--radius-sm);display:grid;place-items:center;flex:none}
.sp-dot{position:absolute;left:50%;width:10px;height:10px;border-radius:50%;background:var(--surface);border:2px solid ${mix("var(--muted)", 75, "var(--surface)")};transform:translate(-50%,-50%);z-index:2}
.sp-h{position:absolute;width:8px;height:8px;background:var(--surface);border:1.5px solid var(--primary);z-index:3}
.sp-lbl{position:absolute;transform:translate(-50%,-50%);height:22px;padding:0 9px;border-radius:999px;background:var(--surface);border:1px solid var(--border);font:600 11px var(--font-b);display:inline-flex;align-items:center;gap:5px;white-space:nowrap;color:var(--text);z-index:2}
.sp-tool{width:34px;height:34px;display:grid;place-items:center;border-radius:var(--radius);color:var(--muted);flex:none}
.sp-tool.on{background:var(--primary);color:var(--on-primary)}
.sp-float{position:absolute;display:flex;align-items:center;gap:2px;padding:4px;background:var(--surface);border:1px solid var(--border);border-radius:calc(var(--radius) + 4px);box-shadow:var(--shadow);z-index:4}
.sp-sep{width:1px;height:20px;background:var(--border);margin:0 4px;flex:none}
.sp-cap{font:600 11px var(--font-b);text-transform:uppercase;letter-spacing:.07em;color:var(--muted)}
.sp-kv{display:flex;justify-content:space-between;align-items:center;gap:10px;font-size:13px;min-height:30px}
.sp-kv>span:first-child{color:var(--muted)}
.sp-tog{width:30px;height:18px;border-radius:999px;background:${mix("var(--muted)", 40, "var(--surface)")};position:relative;flex:none}
.sp-tog::after{content:"";position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;background:var(--surface)}
.sp-tog.on{background:var(--primary)}.sp-tog.on::after{left:14px;background:var(--on-primary)}
.sp-tab{padding:0 2px 9px;font-weight:500;font-size:13px;color:var(--muted);border-bottom:2px solid transparent;white-space:nowrap}
.sp-tab.on{color:var(--text);border-color:var(--primary)}
.sp-stack{display:flex;align-items:center}.sp-stack>*{box-shadow:0 0 0 2px var(--surface);margin-left:-5px}.sp-stack>*:first-child{margin-left:0}
.sp-fchip{display:inline-flex;align-items:center;gap:6px;height:32px;padding:0 12px;border-radius:999px;border:1px solid var(--border);background:var(--surface);font-weight:500;font-size:13px;white-space:nowrap;flex:none}
.sp-fchip.on{background:${mix("var(--primary)", 12, "var(--surface)")};border-color:${mix("var(--primary)", 55, "var(--border)")};color:var(--text)}
.sp-fchip .n{font:600 11px var(--font-b);color:var(--muted)}
.sp-seg{display:inline-flex;padding:3px;border-radius:var(--radius);background:${mix("var(--text)", 5, "var(--surface)")};border:1px solid var(--border);gap:2px;flex:none}
.sp-seg span{padding:4px 12px;border-radius:var(--radius-sm);font-weight:500;font-size:13px;color:var(--muted);white-space:nowrap;display:inline-flex;align-items:center;gap:6px}
.sp-seg span.on{background:var(--surface);color:var(--text);box-shadow:0 1px 2px ${mix("var(--text)", 16, "transparent")}}
.sp-eq{display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 10px;border-radius:var(--radius);background:${mix("var(--text)", 5, "var(--surface)")};border:1px solid var(--border);font-size:12px;font-weight:500;white-space:nowrap}
.sp-in{height:36px;border:1px solid var(--border);border-radius:var(--radius);background:var(--surface);padding:0 10px;display:flex;align-items:center;gap:8px;font-size:13px;color:var(--text)}
</style>`;

// ---- people --------------------------------------------------------------------------------
const PEOPLE = { MO: "Mara Okafor", TR: "Teodora Ruiz", SA: "Sam Achebe", LP: "Lin Park", JW: "Jonah Weiss", PN: "Priya Nair" };
const AVT = {
  MO: "",
  TR: `background:${mix("var(--accent)", 26, "var(--surface)")};color:${mix("var(--accent)", 70, "var(--text)")}`,
  SA: `background:${mix("var(--text)", 13, "var(--surface)")};color:var(--text)`,
  LP: "background:var(--primary);color:var(--on-primary)",
  JW: `background:${mix("var(--muted)", 30, "var(--surface)")};color:var(--text)`,
  PN: "background:var(--text);color:var(--bg)",
};
const av = (k, s = 24) => `<span class="avatar" title="${PEOPLE[k]}" style="width:${s}px;height:${s}px;font-size:${Math.max(9, Math.round(s * 0.4))}px;flex:none;${AVT[k]}">${k}</span>`;
const stack = (ks, s = 24, more) => `<span class="sp-stack">${ks.map((k) => av(k, s)).join("")}${more ? `<span class="avatar" style="width:${s}px;height:${s}px;font-size:10px;background:${mix("var(--text)", 8, "var(--surface)")};color:var(--muted)">+${more}</span>` : ""}</span>`;

// =============================================================================================
// 1. CANVAS EDITOR — "Workspace onboarding v3" flow
// =============================================================================================
const KIND = {
  Trigger: ["bolt", "var(--accent)"], Condition: ["spatial_diamond", mix("var(--primary)", 50, "var(--accent)")],
  Screen: ["spatial_screen", "var(--primary)"], Action: ["users", mix("var(--primary)", 50, "var(--muted)")], Email: ["mail", "var(--accent)"],
};
const kchip = (kind, s = 22) => { const [i, c] = KIND[kind]; return `<span class="sp-chip" style="width:${s}px;height:${s}px;background:${mix(c, 16, "var(--surface)")};color:${mix(c, 78, "var(--text)")}">${ic(i, Math.round(s * 0.62))}</span>`; };

// id: [x, y, kind, title, description, ref, extra]
const NODES = {
  a: [324, 44, "Trigger", "Account created", "From pricing page or invite link", "onb-01", { live: true }],
  b: [324, 178, "Condition", "Has a pending invite?", "Checks the invite token on sign-up", "onb-02"],
  c: [96, 324, "Screen", "Join your team", "Skips setup, opens shared inbox", "onb-03"],
  d: [552, 324, "Screen", "Name your workspace", "Name, URL and team size", "onb-04", { sel: true }],
  e: [96, 470, "Screen", "Tour: shared inbox", "3 coach marks, skippable", "onb-05"],
  f: [552, 470, "Action", "Invite teammates", "Up to 5 emails or a Slack import", "onb-06"],
  g: [324, 616, "Screen", "Starter checklist", "5 first tasks · flow ends here", "onb-07", { live: true }],
  h: [604, 616, "Email", "Nudge in 24 hours", "Sent if nobody was invited", "onb-08"],
};
const EDGES = [["a", "b"], ["b", "c", "If invited"], ["b", "d", "Otherwise"], ["c", "e"], ["d", "f"], ["e", "g"], ["f", "g", "Sent"], ["f", "h", "Skipped"]];

function canvasLayer(nodes, edges, W, NH, cw, ch, opts = {}) {
  const sel = Object.keys(nodes).find((k) => nodes[k][6] && nodes[k][6].sel);
  const paths = edges.map(([s, t, lbl]) => {
    const [sx, sy] = nodes[s], [tx, ty] = nodes[t];
    const x0 = sx + W / 2, y0 = sy + NH, x1 = tx + W / 2, y1 = ty, dy = Math.max(24, (y1 - y0) * 0.55);
    const hot = s === sel || t === sel;
    return { d: `M${x0} ${y0}C${x0} ${y0 + dy} ${x1} ${y1 - dy} ${x1} ${y1 - 3}`, hot, lbl, mx: (x0 + x1) / 2, my: (y0 + y1) / 2 };
  });
  const svg = `<svg width="${cw}" height="${ch}" style="position:absolute;left:0;top:0;overflow:visible;z-index:1" fill="none">
<defs><marker id="sp-arr" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M1 1l7 4-7 4z" fill="var(--muted)"/></marker>
<marker id="sp-arr-h" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M1 1l7 4-7 4z" fill="var(--primary)"/></marker></defs>
${paths.map((p) => `<path d="${p.d}" stroke="${p.hot ? "var(--primary)" : mix("var(--muted)", 80, "var(--bg)")}" stroke-width="${p.hot ? 2 : 1.6}" ${p.lbl === "Skipped" ? 'stroke-dasharray="5 4"' : ""} marker-end="url(#${p.hot ? "sp-arr-h" : "sp-arr"})"/>`).join("")}</svg>`;
  const labels = paths.filter((p) => p.lbl).map((p) => `<span class="sp-lbl" style="left:${p.mx}px;top:${p.my}px${p.hot ? ";border-color:var(--primary);color:var(--primary)" : ""}">${p.lbl === "Otherwise" || p.lbl === "If invited" ? ic("spatial_diamond", 10) : ""}${p.lbl}</span>`).join("");
  const cards = Object.entries(nodes).map(([k, [x, y, kind, t, d, ref, ex = {}]]) => {
    const on = ex.sel;
    const handles = on ? [[-5, -5], [W - 3, -5], [-5, NH - 3], [W - 3, NH - 3]].map(([hx, hy]) => `<span class="sp-h" style="left:${hx - 4}px;top:${hy - 4}px"></span>`).join("") : "";
    return `<div class="card sp-node" style="left:${x}px;top:${y}px;width:${W}px;height:${NH}px;z-index:2;${on ? `outline:2px solid var(--primary);outline-offset:3px;box-shadow:0 0 0 7px ${mix("var(--primary)", 14, "transparent")},var(--shadow)` : ""}">
<span class="sp-dot" style="top:0"></span><span class="sp-dot" style="top:100%${on ? ";border-color:var(--primary)" : ""}"></span>${handles}
<div class="k">${kchip(kind, opts.small ? 20 : 22)}${kind}<span style="margin-left:auto;display:flex;gap:6px;align-items:center;text-transform:none;letter-spacing:0;font-weight:500">${ex.live ? `<span class="badge" style="height:18px;gap:4px"><span style="width:6px;height:6px;border-radius:50%;background:currentColor"></span>Live</span>` : opts.small ? "" : `<span style="font-size:11px">${ref}</span>`}</span></div>
<div class="t sp-ell">${t}</div><div class="d sp-ell">${d}</div></div>`;
  }).join("");
  return svg + labels + cards;
}

const cursor = (x, y, name, fill) => `<div style="position:absolute;left:${x}px;top:${y}px;z-index:6;pointer-events:none"><svg width="18" height="20" viewBox="0 0 18 20"><path d="M2 1.5l13 7.2-5.6 1.6-2.4 5.4z" fill="${fill}" stroke="var(--surface)" stroke-width="1.5" stroke-linejoin="round"/></svg>
<span style="position:absolute;left:14px;top:16px;background:var(--text);color:var(--bg);font:600 11px var(--font-b);padding:3px 8px;border-radius:999px;white-space:nowrap;box-shadow:inset 3px 0 0 ${fill}">${name}</span></div>`;

const BLOCKS = [["spatial_screen", "Screen"], ["spatial_diamond", "Condition"], ["mail", "Email"], ["users", "Action"], ["clock", "Delay"], ["spatial_hook", "Webhook"], ["spatial_note", "Note"], ["spatial_frame", "Frame"]];

TPL["canvas-editor/web"] = (p, st) => {
  const top = `<header style="height:56px;flex:none;display:flex;align-items:center;gap:12px;padding:0 16px;border-bottom:1px solid var(--border);background:var(--surface)">
<div class="logo"><b></b></div><span class="sp-sep"></span>
<div class="sp-row" style="gap:6px;color:var(--muted);font-size:13px;white-space:nowrap">${esc(p.name)}<span>/</span>Harbor 2.4<span>/</span>Flows<span>/</span></div>
<div class="sp-row" style="gap:6px;font-weight:600;white-space:nowrap">Workspace onboarding v3${ic("chevdown", 14)}</div>
<span class="sp-row" style="gap:6px;font-size:12px;color:var(--muted);margin-left:6px;white-space:nowrap"><span style="width:7px;height:7px;border-radius:50%;background:var(--accent)"></span>Unpublished changes · 6 edits</span>
<div class="sp-row" style="margin-left:auto;gap:10px">${stack(["TR", "LP", "SA"], 28, 2)}<span class="sp-sep"></span>
<button class="btn" style="height:34px">${ic("chat", 15)}3</button><button class="btn" style="height:34px">${ic("play", 14)}Preview</button><button class="btn" style="height:34px">${ic("share", 15)}Share</button><button class="btn primary" style="height:34px">Publish</button></div></header>`;

  const left = `<aside style="border-right:1px solid var(--border);background:var(--surface);display:flex;flex-direction:column;overflow:hidden">
<div style="display:flex;gap:18px;padding:14px 16px 0;border-bottom:1px solid var(--border)"><span class="sp-tab">Pages</span><span class="sp-tab on">Outline</span><span class="sp-tab">Assets</span></div>
<div style="padding:12px 14px;display:grid;gap:10px"><div class="sp-in" style="height:32px;color:var(--muted)">${ic("search", 14)}Search blocks…<span style="margin-left:auto;font-size:11px">/</span></div>
<div class="sp-cap" style="padding-top:2px">Add a block</div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">${BLOCKS.map(([i, l]) => `<div style="display:flex;align-items:center;gap:8px;height:34px;padding:0 8px;border:1px solid var(--border);border-radius:var(--radius);font-size:12.5px;font-weight:500;background:var(--bg)"><span class="muted">${ic(i, 15)}</span>${l}</div>`).join("")}</div></div>
<div style="padding:4px 14px 6px;display:flex;justify-content:space-between;align-items:center"><span class="sp-cap">Outline</span><span class="muted" style="font-size:11px">8 blocks</span></div>
<div style="padding:0 8px;display:grid;gap:1px;font-size:13px">
<div class="sp-row" style="padding:5px 8px;font-weight:600">${ic("chevdown", 13)}${ic("spatial_frame", 14)}Workspace onboarding v3</div>
${Object.entries(NODES).map(([k, [, , kind, t, , , ex = {}]]) => `<div class="sp-row" style="padding:5px 8px 5px ${["c", "e"].includes(k) ? 46 : ["d", "f", "h"].includes(k) ? 46 : 30}px;border-radius:var(--radius-sm);${ex.sel ? `background:${mix("var(--primary)", 12, "var(--surface)")};color:var(--text);font-weight:600` : ""}"><span style="color:${ex.sel ? "var(--primary)" : "var(--muted)"}">${ic(KIND[kind][0], 14)}</span><span class="sp-ell">${t}</span>${ex.live ? `<span style="margin-left:auto;width:6px;height:6px;border-radius:50%;background:var(--accent)" title="Live"></span>` : ""}</div>`).join("")}</div>
<div style="padding:12px 14px 6px" class="sp-cap">Other flows</div>
<div style="padding:0 8px 12px;display:grid;gap:1px;font-size:13px">${[["Trial ending in 3 days", "Live"], ["Re-engage quiet teams", "Draft"], ["Marketing site sitemap", "Live"]].map(([t, s]) => `<div class="sp-row" style="padding:5px 8px"><span class="muted">${ic("spatial_frame", 14)}</span><span class="sp-ell">${t}</span><span class="muted" style="margin-left:auto;font-size:11px">${s}</span></div>`).join("")}</div>
<div style="margin-top:auto;border-top:1px solid var(--border);padding:10px 16px;font-size:12px" class="sp-row muted">${ic("clock", 14)}Autosaved 09:41 · version 37</div></aside>`;

  const cw = 872, ch = 844;
  const canvas = `<main class="sp-grid" style="position:relative;overflow:hidden">
<div style="position:absolute;left:20px;top:22px;width:176px;padding:10px 12px;background:${mix("var(--accent)", 18, "var(--surface)")};border-radius:var(--radius-sm);box-shadow:var(--shadow-sm);font-size:12px;line-height:1.4;transform:rotate(-1.5deg);z-index:2"><div style="font-weight:700;margin-bottom:3px">Copy review · Thu 29 Oct</div>Keep the invite path under 3 screens. Tour copy still says “Projects”.<div class="muted" style="margin-top:6px;font-size:11px">— Priya Nair</div></div>
<div style="position:absolute;right:20px;top:20px;display:flex;gap:8px;z-index:4"><span class="sp-row card" style="height:30px;padding:0 10px;font-size:12px;border-radius:999px;gap:6px;box-shadow:var(--shadow-sm)"><span style="width:7px;height:7px;border-radius:50%;background:var(--accent)"></span>Teodora is editing</span></div>
${canvasLayer(NODES, EDGES, 224, 84, cw, ch)}
<div style="position:absolute;left:792px;top:300px;z-index:5;display:flex;align-items:center;gap:4px;padding:3px 8px 3px 3px;background:var(--surface);border:1px solid var(--border);border-radius:999px 999px 999px 4px;box-shadow:var(--shadow)">${av("LP", 22)}<span class="num" style="font-size:12px">2</span></div>
${cursor(276, 548, "Teodora Ruiz", "var(--accent)")}${cursor(712, 214, "Sam Achebe", "var(--primary)")}
<div style="position:absolute;left:436px;top:716px;transform:translateX(-50%);width:28px;height:28px;border-radius:50%;border:1.5px dashed ${mix("var(--muted)", 70, "var(--bg)")};display:grid;place-items:center;color:var(--muted);background:var(--bg);z-index:2">${ic("plus", 14)}</div>
<div class="sp-float" style="left:16px;bottom:16px"><span class="sp-tool">${ic("spatial_undo", 17)}</span><span class="sp-tool" style="opacity:.45">${ic("spatial_redo", 17)}</span><span class="sp-sep"></span><span class="sp-tool">${ic("minus", 16)}</span><span class="sp-row num" style="font-size:13px;gap:4px;padding:0 6px">94%${ic("chevdown", 13)}</span><span class="sp-tool">${ic("plus", 16)}</span><span class="sp-tool" title="Fit">${ic("spatial_fit", 16)}</span></div>
<div class="sp-float" style="left:50%;bottom:16px;transform:translateX(-50%)">${[["spatial_cursor", "V", 1], ["spatial_hand", "H"], ["spatial_connector", "C"], ["spatial_text", "T"], ["spatial_frame", "F"]].map(([i, k, on]) => `<span class="sp-tool${on ? " on" : ""}" title="${k}">${ic(i, 18)}</span>`).join("")}<span class="sp-sep"></span><span class="sp-tool">${ic("chat", 17)}</span><span class="sp-tool" style="color:var(--text)">${ic("plus", 18)}</span></div>
<div class="card" style="position:absolute;right:16px;bottom:16px;width:132px;height:88px;padding:6px;z-index:4;box-shadow:var(--shadow)"><svg viewBox="0 0 872 760" width="100%" height="100%">${Object.values(NODES).map(([x, y, , , , , ex = {}]) => `<rect x="${x}" y="${y}" width="224" height="84" rx="10" style="fill:${ex.sel ? "var(--primary)" : mix("var(--muted)", 40, "var(--surface)")}"/>`).join("")}<rect x="8" y="8" width="856" height="744" rx="14" fill="none" stroke="var(--primary)" stroke-width="10" opacity=".5"/></svg></div></main>`;

  const kv = (k, v) => `<div class="sp-kv"><span>${k}</span><span style="display:flex;align-items:center;gap:6px;text-align:right">${v}</span></div>`;
  const right = `<aside style="border-left:1px solid var(--border);background:var(--surface);display:flex;flex-direction:column;overflow:hidden">
<div style="display:flex;gap:18px;padding:14px 18px 0;border-bottom:1px solid var(--border)"><span class="sp-tab on">Properties</span><span class="sp-tab">Analytics</span><span class="sp-tab">Comments 2</span></div>
<div style="padding:16px 18px;display:grid;gap:12px;border-bottom:1px solid var(--border)">
<div class="sp-row">${kchip("Screen", 28)}<div style="line-height:1.25"><div style="font-weight:600">Screen</div><div class="muted" style="font-size:12px">onb-04 · step 2 of 4</div></div><span class="muted" style="margin-left:auto">${ic("more", 18)}</span></div>
<div class="field"><label style="font-size:12px">Title</label><div class="sp-in">Name your workspace</div></div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px"><div class="field"><label style="font-size:12px">Type</label><div class="sp-in">${ic("spatial_screen", 14)}Screen<span class="muted" style="margin-left:auto">${ic("chevdown", 14)}</span></div></div>
<div class="field"><label style="font-size:12px">Status</label><div class="sp-in"><span style="width:7px;height:7px;border-radius:50%;background:var(--accent)"></span>Changed<span class="muted" style="margin-left:auto">${ic("chevdown", 14)}</span></div></div></div></div>
<div style="padding:14px 18px 12px;display:grid;gap:2px;border-bottom:1px solid var(--border)"><div class="sp-row" style="justify-content:space-between;margin-bottom:4px"><span class="sp-cap">Configuration</span><span class="muted">${ic("chevdown", 14)}</span></div>
${kv("Route", `<code style="font:500 12px ui-monospace,Menlo,monospace;padding:2px 6px;border-radius:var(--radius-sm);background:${mix("var(--text)", 6, "var(--surface)")}">/welcome/workspace</code>`)}
${kv("Template", "Form · 3 fields")}
${kv("Required", `<span class="badge">Name</span><span class="badge">URL</span>`)}
${kv("Progress bar", `<span class="muted" style="font-size:12px">Step 2 of 4</span><span class="sp-tog on"></span>`)}
${kv("Skippable", `<span class="sp-tog"></span>`)}
${kv("Owner", `${av("TR", 20)}Teodora Ruiz`)}</div>
<div style="padding:14px 18px;display:grid;gap:8px;border-bottom:1px solid var(--border)"><div class="sp-row" style="justify-content:space-between"><span class="sp-cap">Next steps</span><span class="muted" style="font-size:12px">2 paths</span></div>
${[["Default", "Action", "Invite teammates", "onb-06", false], ["If URL is taken", "Screen", "Suggest a free URL", "Not connected", true]].map(([when, kind, t, ref, dash]) => `<div class="sp-row" style="padding:8px 10px;border:1px ${dash ? "dashed" : "solid"} var(--border);border-radius:var(--radius);gap:10px;font-size:13px"><span class="muted" style="font-size:11px;width:64px;flex:none;line-height:1.2">${when}</span>${ic("arrow", 13)}${kchip(kind, 20)}<div style="min-width:0;line-height:1.25"><div class="sp-ell" style="font-weight:600">${t}</div><div class="muted" style="font-size:11px">${ref}</div></div></div>`).join("")}
<div class="sp-row" style="justify-content:center;height:32px;border-radius:var(--radius);color:var(--primary);font-weight:600;font-size:13px;gap:6px">${ic("plus", 14)}Add next step</div></div>
<div style="padding:14px 18px;display:grid;gap:8px"><div class="sp-row" style="justify-content:space-between;font-size:13px"><span class="muted">Drop-off this week</span><span class="num" style="font-size:14px">18.4%</span></div>
<div style="height:6px;border-radius:9px;background:${mix("var(--text)", 9, "var(--surface)")};overflow:hidden"><div style="width:18.4%;height:100%;background:var(--accent)"></div></div>
<div class="muted" style="font-size:12px">412 reached this step · median 38 s · team size is skipped by 61%</div></div>
<div style="margin-top:auto;padding:12px 18px;border-top:1px solid var(--border);font-size:12px" class="sp-row muted">${av("LP", 20)}Edited by Lin Park · 4 min ago</div></aside>`;

  return `${CSS}<div style="height:100%;display:flex;flex-direction:column">${top}<div style="flex:1;display:grid;grid-template-columns:248px 1fr 320px;min-height:0">${left}${canvas}${right}</div></div>`;
};

TPL["canvas-editor/mobile"] = (p, st) => {
  const M = {
    b: [107, 18, "Condition", "Has a pending invite?", "Checks the invite token", "onb-02"],
    c: [-58, 146, "Screen", "Join your team", "Opens the shared inbox", "onb-03"],
    d: [196, 146, "Screen", "Name your workspace", "Name, URL and team size", "onb-04", { sel: true }],
    e: [-58, 282, "Screen", "Tour: shared inbox", "3 coach marks", "onb-05"],
    f: [196, 282, "Action", "Invite teammates", "Up to 5 emails or Slack", "onb-06"],
  };
  const E = [["b", "c", "If invited"], ["b", "d", "Otherwise"], ["c", "e"], ["d", "f"]];
  return `${CSS}<div class="phone" style="position:relative">${status()}
<div class="mtop" style="border-bottom:1px solid var(--border);gap:10px;padding-bottom:10px">${ic("back", 22)}<div style="flex:1;min-width:0;text-align:center;line-height:1.25"><div class="sp-ell" style="font-weight:600">Workspace onboarding v3</div><div class="muted" style="font-size:11px">View &amp; comment · 3 here now</div></div>${stack(["TR", "LP"], 24)}</div>
<div class="sp-grid" style="flex:1;position:relative;overflow:hidden">
<div style="position:absolute;left:12px;top:10px;z-index:4" class="sp-float"><span class="sp-row num" style="font-size:12px;padding:0 6px;height:26px">62%</span><span class="sp-tool" style="width:28px;height:26px">${ic("spatial_fit", 15)}</span></div>
<div style="position:absolute;right:12px;top:10px;z-index:4" class="sp-float"><span class="sp-tool" style="width:30px;height:26px">${ic("spatial_cursor", 15)}</span><span class="sp-tool on" style="width:30px;height:26px">${ic("chat", 15)}</span></div>
<div style="position:absolute;left:0;top:30px;width:390px;height:400px">${canvasLayer(M, E, 176, 82, 390, 400, { small: true })}
<div style="position:absolute;left:340px;top:126px;z-index:5;display:flex;align-items:center;gap:3px;padding:2px 7px 2px 2px;background:var(--surface);border:1px solid var(--border);border-radius:999px 999px 999px 4px;box-shadow:var(--shadow)">${av("LP", 20)}<span class="num" style="font-size:11px">2</span></div>
${cursor(70, 236, "Teodora", "var(--accent)")}</div>
<div style="position:absolute;left:0;right:0;bottom:0;background:var(--surface);border-top:1px solid var(--border);border-radius:calc(var(--radius-lg) + 6px) calc(var(--radius-lg) + 6px) 0 0;box-shadow:var(--shadow-lg);padding:8px 18px 30px;display:grid;gap:10px;z-index:6">
<span style="justify-self:center;width:38px;height:5px;border-radius:9px;background:${mix("var(--text)", 20, "var(--surface)")}"></span>
<div class="sp-row">${kchip("Screen", 26)}<span class="muted" style="font-size:12px">Screen · onb-04 · step 2 of 4</span><span class="badge" style="margin-left:auto;gap:4px"><span style="width:6px;height:6px;border-radius:50%;background:currentColor"></span>Changed</span></div>
<div><div class="h" style="font-size:${H(st, 20)}px">Name your workspace</div><div class="muted" style="font-size:13px;margin-top:2px">Workspace name, URL and team size. Shown to people who sign up without an invite.</div></div>
<div style="display:grid;grid-template-columns:1.55fr 1fr 1fr;gap:8px">${[["Route", "/welcome/workspace"], ["Required", "Name, URL"], ["Next", "Invite team"]].map(([k, v]) => `<div style="padding:8px 10px;border-radius:var(--radius);background:${mix("var(--text)", 5, "var(--surface)")};min-width:0"><div class="muted" style="font-size:11px">${k}</div><div class="sp-ell" style="font-size:12px;font-weight:600">${v}</div></div>`).join("")}</div>
<div style="border-top:1px solid var(--border);padding-top:10px;display:grid;gap:10px">
<div style="display:flex;gap:10px">${av("LP", 28)}<div style="font-size:13px;line-height:1.4;min-width:0"><b style="font-weight:600">Lin Park</b> <span class="muted" style="font-size:11px">· 4 min</span><div>Can we drop team size? 61% skip it and it isn’t used until billing.</div><div class="muted" style="font-size:12px;margin-top:3px">1 reply · Teodora Ruiz</div></div></div>
<div class="sp-row"><div class="sp-in" style="flex:1;height:40px;border-radius:999px;color:var(--muted);padding-left:14px">Reply or @mention…</div><span style="width:40px;height:40px;border-radius:50%;background:var(--primary);color:var(--on-primary);display:grid;place-items:center;flex:none">${ic("send", 17)}</span></div></div></div></div></div>`;
};

// =============================================================================================
// 2. FLOOR PLAN — Harbour Street office, Level 3
// =============================================================================================
const AVAIL = { f: mix("var(--primary)", 14, "var(--surface)"), s: "var(--primary)" };
const BOOKED_S = mix("var(--muted)", 70, "var(--surface)");
const deskSvg = (x, y, num, state) => {
  const w = 44, h = 28;
  let r;
  if (state === "a") r = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" style="fill:${AVAIL.f};stroke:${AVAIL.s}" stroke-width="1.5"/>`;
  else if (state === "y") r = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" style="fill:${mix("var(--accent)", 26, "var(--surface)")};stroke:var(--accent)" stroke-width="2.5"/>`;
  else r = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="url(#sp-hatch)" style="stroke:${BOOKED_S}" stroke-width="1.2"/>`;
  let label = "";
  if (state === "y") label = `<text x="${x + w / 2}" y="${y + 18}" text-anchor="middle" style="fill:var(--text);font:800 10px var(--font-b)">YOU</text>`;
  else if (state.length === 2 && state !== "a") label = `<circle cx="${x + w / 2}" cy="${y + h / 2}" r="11.5" style="fill:${state === "LP" ? "var(--primary)" : mix("var(--primary)", 28, "var(--surface)")};stroke:var(--surface)" stroke-width="2"/><text x="${x + w / 2}" y="${y + h / 2 + 3.5}" text-anchor="middle" style="fill:${state === "LP" ? "var(--on-primary)" : "var(--text)"};font:700 9.5px var(--font-b)">${state}</text>`;
  else label = `<text x="${x + w / 2}" y="${y + 17.5}" text-anchor="middle" style="fill:${state === "a" ? mix("var(--primary)", 70, "var(--text)") : "var(--muted)"};font:600 9px var(--font-b)">${num}</text>`;
  return r + label;
};
const cluster = (x, y, start, states, zone) => {
  let s = zone ? `<text x="${x}" y="${y - 8}" style="fill:var(--muted);font:700 10px var(--font-b);letter-spacing:.12em">${zone}</text>` : "";
  states.forEach((stt, i) => {
    const col = i % 3, row = Math.floor(i / 3), dx = x + col * 48, dy = y + 12 + row * 28;
    s += `<circle cx="${dx + 22}" cy="${row ? dy + 34 : dy - 6}" r="5" style="fill:var(--surface);stroke:${mix("var(--muted)", 60, "var(--surface)")}" stroke-width="1.2"/>`;
  });
  states.forEach((stt, i) => { const col = i % 3, row = Math.floor(i / 3); s += deskSvg(x + col * 48, y + 12 + row * 28, `3.${String(start + i).padStart(2, "0")}`, stt); });
  return s;
};
const roomTable = (x, y, w, h, nTop, nSide) => {
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${Math.min(h / 2, 14)}" style="fill:${mix("var(--text)", 7, "var(--surface)")};stroke:${mix("var(--muted)", 55, "var(--surface)")}" stroke-width="1.2"/>`;
  for (let i = 0; i < nTop; i++) { const cx = x + (w / (nTop + 1)) * (i + 1); s += `<circle cx="${cx}" cy="${y - 8}" r="5"/><circle cx="${cx}" cy="${y + h + 8}" r="5"/>`; }
  if (nSide) s += `<circle cx="${x - 9}" cy="${y + h / 2}" r="5"/><circle cx="${x + w + 9}" cy="${y + h / 2}" r="5"/>`;
  return s.replace(/<circle /g, `<circle style="fill:var(--surface);stroke:${mix("var(--muted)", 60, "var(--surface)")}" stroke-width="1.2" `);
};
const doorUp = (x, y, w) => `<line x1="${x}" y1="${y}" x2="${x + w}" y2="${y}" style="stroke:var(--surface)" stroke-width="5"/><path d="M${x} ${y}L${x} ${y - w}A${w} ${w} 0 0 1 ${x + w} ${y}" fill="none" style="stroke:var(--muted)" stroke-width="1.2"/>`;
const doorDown = (x, y, w) => `<line x1="${x}" y1="${y}" x2="${x + w}" y2="${y}" style="stroke:var(--surface)" stroke-width="5"/><path d="M${x} ${y}L${x} ${y + w}A${w} ${w} 0 0 0 ${x + w} ${y}" fill="none" style="stroke:var(--muted)" stroke-width="1.2"/>`;
const room = (x, y, w, h, state) => {
  const fill = state === "sel" ? mix("var(--primary)", 20, "var(--surface)") : state === "a" ? mix("var(--primary)", 7, "var(--surface)") : null;
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" ${fill ? `style="fill:${fill}"` : 'fill="url(#sp-hatch)"'}/>`;
};
const rlabel = (x, y, t, sub, o = {}) => `<text x="${x}" y="${y}" style="fill:var(--text);font:700 ${o.fs || 13}px var(--font-b)">${t}</text>${sub ? `<text x="${x}" y="${y + 15}" style="fill:${o.subc || "var(--muted)"};font:${o.subw || 500} 10.5px var(--font-b)">${sub}</text>` : ""}`;
const tip = (x, y, t, w) => `<g><rect x="${x - w / 2}" y="${y - 30}" width="${w}" height="22" rx="11" style="fill:var(--text)"/><path d="M${x - 5} ${y - 8.5}l5 6 5-6z" style="fill:var(--text)"/><circle cx="${x - w / 2 + 12}" cy="${y - 19}" r="3.5" style="fill:var(--accent)"/><text x="${x - w / 2 + 21}" y="${y - 15}" style="fill:var(--bg);font:600 11px var(--font-b)">${t}</text></g>`;

function floorPlan(vb, w, h, o = {}) {
  const wall = "var(--text)", win = mix("var(--primary)", 45, "var(--surface)");
  const winSeg = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" style="stroke:${win}" stroke-width="6"/><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" style="stroke:var(--surface)" stroke-width="1.6"/>`;
  return `<svg viewBox="${vb}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid meet" style="display:block">
<defs><pattern id="sp-hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="7" height="7" style="fill:${mix("var(--text)", 6, "var(--surface)")}"/><line x1="0" y1="0" x2="0" y2="7" style="stroke:${mix("var(--muted)", 45, "var(--surface)")}" stroke-width="2.2"/></pattern></defs>
<rect x="20" y="20" width="960" height="620" style="fill:var(--surface)"/>
${room(20, 20, 190, 150, "b")}${room(210, 20, 150, 150, "a")}${room(360, 20, 70, 80, "b")}${room(430, 20, 70, 80, "a")}${room(500, 20, 160, 150, "a")}${room(660, 20, 320, 190, "sel")}
${room(720, 470, 170, 170, "b")}${room(890, 470, 90, 85, "a")}${room(890, 555, 90, 85, "b")}
<rect x="20" y="470" width="250" height="170" style="fill:${mix("var(--accent)", 8, "var(--surface)")}"/>
<rect x="430" y="560" width="150" height="80" style="fill:${mix("var(--text)", 4, "var(--surface)")}"/>
<rect x="440" y="250" width="130" height="130" style="fill:${mix("var(--text)", 10, "var(--surface)")}"/>
<g fill="none" style="stroke:${wall}" stroke-width="3" stroke-linejoin="miter">
<path d="M20 170H660M210 20V170M360 20V170M430 20V100M360 100H500M500 20V170M660 20V210H980"/>
<path d="M20 470H270V640M720 640V470H980M890 470V640M890 555H980M430 640V560H580V640"/>
<rect x="440" y="250" width="130" height="130"/><path d="M505 250V380M440 315H505"/></g>
<g style="stroke:${mix("var(--muted)", 60, "var(--surface)")}" stroke-width="1.2" fill="none"><path d="M448 258l49 49M497 258l-49 49M448 323l49 49M497 323l-49 49"/><path d="M515 262h45M515 274h45M515 286h45M515 298h45M515 310h45M515 322h45"/></g>
${doorUp(80, 170, 28)}${doorUp(268, 170, 26)}${doorUp(382, 100, 22)}${doorUp(452, 100, 22)}${doorUp(560, 170, 26)}${doorUp(690, 210, 30)}
${doorDown(740, 470, 28)}${doorDown(898, 470, 22)}${doorDown(150, 470, 30)}
<rect x="20" y="20" width="960" height="620" fill="none" style="stroke:${wall}" stroke-width="6"/>
${winSeg(40, 20, 190, 20)}${winSeg(230, 20, 340, 20)}${winSeg(520, 20, 640, 20)}${winSeg(690, 20, 950, 20)}${winSeg(20, 200, 20, 450)}${winSeg(980, 240, 980, 450)}${winSeg(40, 640, 250, 640)}${winSeg(740, 640, 870, 640)}
<line x1="472" y1="640" x2="538" y2="640" style="stroke:var(--bg)" stroke-width="8"/>
${roomTable(62, 96, 110, 40, 3, true)}${roomTable(250, 96, 70, 38, 2, false)}${roomTable(540, 98, 80, 36, 2, true)}${roomTable(730, 104, 190, 50, 5, true)}${roomTable(770, 548, 90, 40, 2, true)}
<circle cx="395" cy="62" r="6" style="fill:var(--surface);stroke:var(--muted)" stroke-width="1.2"/><circle cx="465" cy="62" r="6" style="fill:var(--surface);stroke:var(--muted)" stroke-width="1.2"/><circle cx="935" cy="520" r="6" style="fill:var(--surface);stroke:var(--muted)" stroke-width="1.2"/><circle cx="935" cy="605" r="6" style="fill:var(--surface);stroke:var(--muted)" stroke-width="1.2"/>
<line x1="972" y1="96" x2="972" y2="164" style="stroke:var(--text)" stroke-width="4"/>
<g style="fill:${mix("var(--accent)", 22, "var(--surface)")};stroke:${mix("var(--accent)", 50, "var(--surface)")}" stroke-width="1.2"><rect x="36" y="580" width="110" height="34" rx="10"/><rect x="36" y="546" width="30" height="34" rx="8"/><circle cx="232" cy="550" r="18"/><circle cx="232" cy="606" r="18"/></g>
<rect x="36" y="492" width="70" height="20" rx="3" style="fill:${mix("var(--text)", 10, "var(--surface)")}"/>
<rect x="455" y="582" width="100" height="22" rx="11" style="fill:${mix("var(--text)", 9, "var(--surface)")};stroke:${mix("var(--muted)", 55, "var(--surface)")}" stroke-width="1.2"/>
${rlabel(36, 44, "Kestrel", "6 seats · In use until 10:00")}${rlabel(224, 44, "Heron", "4 seats · Free")}${rlabel(514, 44, "Wren", "6 seats · Free")}
<text x="395" y="46" text-anchor="middle" style="fill:var(--muted);font:600 10px var(--font-b)">Booth 1</text><text x="465" y="46" text-anchor="middle" style="fill:var(--text);font:600 10px var(--font-b)">Booth 2</text>
${rlabel(676, 46, "Osprey", "12 seats · Free until 11:00", { fs: 15, subc: mix("var(--primary)", 75, "var(--text)"), subw: 700 })}
${rlabel(736, 512, "Puffin", "5 seats · In use")}<text x="935" y="545" text-anchor="middle" style="fill:var(--text);font:600 10px var(--font-b)">Booth 3</text><text x="935" y="630" text-anchor="middle" style="fill:var(--muted);font:600 10px var(--font-b)">Booth 4</text>
${rlabel(118, 506, "Kitchen &amp; lounge", "Coffee · lockers")}<text x="472" y="275" style="fill:var(--muted);font:600 9px var(--font-b)" text-anchor="middle">LIFTS</text><text x="537" y="345" style="fill:var(--muted);font:600 9px var(--font-b)" text-anchor="middle">STAIRS</text><text x="472" y="355" style="fill:var(--muted);font:600 9px var(--font-b)" text-anchor="middle">WC</text>
<text x="505" y="623" text-anchor="middle" style="fill:var(--muted);font:600 10px var(--font-b)">Reception</text>
${cluster(60, 252, 1, ["a", "PN", "b", "a", "a", "b"], "PRODUCT")}${cluster(60, 360, 7, ["b", "a", "a", "JW", "b", "a"])}
${cluster(250, 252, 13, ["b", "y", "SA", "a", "b", "a"], "DESIGN")}${cluster(285, 478, 19, ["a", "a", "b", "b", "a", "a"], "QUIET ZONE")}
${cluster(632, 266, 25, ["LP", "a", "b", "a", "a", "b"], "ENGINEERING")}${cluster(808, 266, 31, ["b", "b", "a", "a", "MO", "a"])}
<g transform="translate(940 386)"><circle r="17" style="fill:var(--surface);stroke:var(--border)" stroke-width="1.2"/><path d="M0 -12l5 12h-10z" style="fill:var(--text)"/><text y="11" text-anchor="middle" style="fill:var(--muted);font:700 8px var(--font-b)">N</text></g>
${o.tipSam ? tip(368, 238, "Sam is in today · until 17:30", 186) : ""}${o.tipLin ? tip(654, 240, "Lin is in today", 108) : ""}
<g transform="translate(505 548)"><circle r="16" style="fill:${mix("var(--primary)", 18, "transparent")}"/><path d="M0 4c-6-7-10-11-10-16a10 10 0 0 1 20 0c0 5-4 9-10 16z" style="fill:var(--primary);stroke:var(--surface)" stroke-width="2"/><circle cy="-12" r="3.5" style="fill:var(--on-primary)"/></g>
<g><rect x="530" y="524" width="86" height="22" rx="11" style="fill:var(--surface);stroke:var(--primary)" stroke-width="1.2"/><text x="573" y="539" text-anchor="middle" style="fill:var(--text);font:700 11px var(--font-b)">You are here</text></g>
<text x="505" y="656" text-anchor="middle" style="fill:var(--muted);font:600 9px var(--font-b);letter-spacing:.14em">ENTRANCE</text>
</svg>`;
}

const legendSw = (k) => {
  if (k === "a") return `<svg width="18" height="12"><rect x="1" y="1" width="16" height="10" rx="2" style="fill:${AVAIL.f};stroke:${AVAIL.s}" stroke-width="1.5"/></svg>`;
  if (k === "b") return `<svg width="18" height="12"><rect x="1" y="1" width="16" height="10" rx="2" fill="url(#sp-hatch)" style="stroke:${BOOKED_S}" stroke-width="1.2"/></svg>`;
  if (k === "s") return `<svg width="18" height="12"><rect x="1.5" y="1.5" width="15" height="9" rx="2" style="fill:${mix("var(--primary)", 20, "var(--surface)")};stroke:var(--primary)" stroke-width="2.5"/></svg>`;
  return `<svg width="18" height="12"><rect x="1.5" y="1.5" width="15" height="9" rx="2" style="fill:${mix("var(--accent)", 26, "var(--surface)")};stroke:var(--accent)" stroke-width="2.5"/></svg>`;
};
const SCHED = [[8.5, 9.5, "Design crit", "LP", "b"], [9.5, 11, "Your booking", "MO", "y"], [11, 12, "Harbor 2.4 go / no-go", "MO", "b"], [14, 15.5, "Pilot call · Brightwell", "TR", "b"]];
const timeline = (hFrom, hTo, h = 30) => {
  const pct = (t) => ((t - hFrom) / (hTo - hFrom)) * 100;
  const ticks = []; for (let t = hFrom; t <= hTo; t += 2) ticks.push(t);
  return `<div style="position:relative;height:${h + 18}px"><div style="position:absolute;left:0;right:0;top:0;height:${h}px;border-radius:var(--radius-sm);background:${AVAIL.f};border:1px solid ${mix("var(--primary)", 35, "var(--border)")};overflow:hidden">
${SCHED.map(([a, b, , , k]) => `<div style="position:absolute;top:0;bottom:0;left:${pct(a)}%;width:${pct(b) - pct(a)}%;${k === "y" ? `background:var(--primary);color:var(--on-primary);display:grid;place-items:center;font:700 10px var(--font-b)` : `background-image:repeating-linear-gradient(45deg,${mix("var(--muted)", 45, "var(--surface)")} 0 2px,${mix("var(--text)", 6, "var(--surface)")} 2px 6px);border-left:1px solid var(--surface);border-right:1px solid var(--surface)`}">${k === "y" ? "You" : ""}</div>`).join("")}
<div style="position:absolute;top:-2px;bottom:-2px;left:${pct(9.68)}%;width:2px;background:var(--accent)"></div></div>
${ticks.map((t) => `<span class="muted" style="position:absolute;top:${h + 3}px;left:${pct(t)}%;transform:translateX(${t === hFrom ? 0 : t === hTo ? -100 : -50}%);font-size:10px">${String(t).padStart(2, "0")}:00</span>`).join("")}</div>`;
};
const roomPhoto = (w, h) => `<svg viewBox="0 0 360 160" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice" style="display:block">
<rect width="360" height="160" style="fill:${mix("var(--primary)", 9, "var(--bg)")}"/><rect x="24" y="16" width="190" height="88" style="fill:${mix("var(--primary)", 26, "var(--surface)")}"/>
<path d="M87 16v88M150 16v88M24 60h190" style="stroke:var(--surface)" stroke-width="3"/><rect x="250" y="34" width="86" height="50" rx="2" style="fill:var(--text)"/><rect x="256" y="40" width="74" height="38" style="fill:${mix("var(--primary)", 40, "var(--text)")}"/>
<path d="M0 112h360v48H0z" style="fill:${mix("var(--text)", 14, "var(--bg)")}"/><path d="M60 118h240l22 22H38z" style="fill:${mix("var(--text)", 30, "var(--surface)")}"/>
${[72, 120, 168, 216, 264].map((x) => `<rect x="${x}" y="100" width="22" height="20" rx="5" style="fill:${mix("var(--text)", 55, "var(--surface)")}"/>`).join("")}${[60, 112, 164, 216, 268].map((x) => `<rect x="${x}" y="140" width="28" height="20" rx="6" style="fill:${mix("var(--text)", 62, "var(--surface)")}"/>`).join("")}</svg>`;

const EQUIP = [["spatial_monitor", "75-inch display"], ["spatial_video", "Video bar"], ["spatial_board", "Whiteboard wall"], ["phone", "Conference phone"], ["spatial_access", "Step-free"]];

TPL["floor-plan/web"] = (p, st) => {
  const top = `<header class="top" style="height:56px;padding:0 20px;gap:22px;background:var(--surface)"><div class="logo"><b></b>${esc(p.name)}</div>
<nav class="sp-row" style="gap:4px;font-size:13.5px;font-weight:500">${["Inbox", "Tasks", "Docs", "Files", "Office"].map((t) => `<span style="padding:6px 12px;border-radius:var(--radius);${t === "Office" ? `background:${mix("var(--primary)", 11, "var(--surface)")};color:var(--text)` : "color:var(--muted)"}">${t}</span>`).join("")}</nav>
<div class="search" style="flex:0 1 300px">${ic("search", 15)}Find a desk, room or person…</div><span class="muted">${ic("bell", 18)}</span>${av("MO", 30)}</header>`;
  const tb1 = `<div style="display:flex;align-items:center;gap:14px;padding:16px 24px 12px">
<div style="min-width:0"><h1 class="h" style="font-size:${H(st, 22)}px;white-space:nowrap">Book a space</h1><div class="muted" style="font-size:12.5px;white-space:nowrap">Harbour Street office</div></div>
<span class="sp-seg" style="margin-left:auto">${["Level 2", "Level 3", "Level 4"].map((t, i) => `<span class="${i === 1 ? "on" : ""}">${ic("spatial_layers", 13)}${t}</span>`).join("")}</span>
<span class="btn" style="height:36px;padding:0 4px">${`<span class="sp-tool" style="width:28px;height:28px">${ic("back", 15)}</span>`}<span class="sp-row" style="gap:7px">${ic("calendar", 15)}Wed 28 Oct</span><span class="sp-tool" style="width:28px;height:28px">${ic("chevron", 15)}</span></span>
<span class="btn" style="height:36px">${ic("clock", 15)}09:30 – 11:00${ic("chevdown", 13)}</span>
<button class="btn primary" style="height:36px">${ic("calendar", 15)}Mine · 2</button></div>`;
  const tb2 = `<div style="display:flex;align-items:center;gap:8px;padding:0 24px 14px;border-bottom:1px solid var(--border)">
<span class="sp-fchip on">${ic("spatial_desk", 15)}Desks <span class="n">14 free</span></span><span class="sp-fchip on">${ic("spatial_room", 15)}Meeting rooms <span class="n">3 free</span></span><span class="sp-fchip">${ic("phone", 15)}Phone booths <span class="n">2 free</span></span>
<span class="sp-sep" style="height:24px;margin:0 6px"></span><span class="sp-fchip on">${ic("spatial_monitor", 15)}Monitor</span><span class="sp-fchip">${ic("spatial_stand", 15)}Standing</span>
<div class="sp-row" style="margin-left:auto;gap:10px;font-size:13px;white-space:nowrap">${stack(["SA", "LP", "PN", "JW"], 26, 9)}<span><b style="font-weight:600">13</b> <span class="muted">on Level 3 today</span></span></div></div>`;
  const plan = `<section style="display:flex;flex-direction:column;min-width:0;min-height:0">${tb1}${tb2}
<div style="flex:1;min-height:0;padding:14px 20px 4px;display:flex;align-items:center;justify-content:center;background:var(--bg)">${floorPlan("0 0 1000 664", "100%", "100%", { tipSam: true })}</div>
<div style="flex:none;display:flex;align-items:center;gap:18px;padding:10px 24px 14px;font-size:12px;border-top:1px solid var(--border)">
${[["a", "Available"], ["b", "Booked"], ["s", "Selected"], ["y", "Your desk · 3.14"]].map(([k, t]) => `<span class="sp-row" style="gap:7px">${legendSw(k)}${t}</span>`).join("")}
<span class="sp-row" style="gap:7px"><span class="avatar" style="width:18px;height:18px;font-size:8px">SA</span>Colleague</span><span class="sp-row" style="gap:6px;color:var(--primary)">${ic("pin", 15)}<span style="color:var(--text)">You are here</span></span>
<div class="sp-row" style="margin-left:auto;gap:2px"><span class="sp-tool" style="width:30px;height:30px">${ic("minus", 15)}</span><span class="num" style="font-size:12px;width:40px;text-align:center">100%</span><span class="sp-tool" style="width:30px;height:30px">${ic("plus", 15)}</span><span class="sp-tool" style="width:30px;height:30px">${ic("spatial_fit", 15)}</span></div></div></section>`;

  const panel = `<aside style="border-left:1px solid var(--border);background:var(--surface);display:flex;flex-direction:column;gap:14px;padding:16px 20px 18px;overflow:hidden">
<div class="sp-row" style="justify-content:space-between"><span class="badge" style="gap:5px">${ic("spatial_room", 12)}Meeting room</span><span class="sp-row muted" style="gap:12px">${ic("share", 16)}${ic("x", 18)}</span></div>
<div style="position:relative;border-radius:var(--radius-lg);overflow:hidden;flex:none">${roomPhoto(340, 140)}<span style="position:absolute;right:8px;bottom:8px;background:var(--text);color:var(--bg);font:600 11px var(--font-b);padding:2px 8px;border-radius:999px">1 / 4</span></div>
<div><div class="sp-row" style="justify-content:space-between;align-items:baseline"><h2 class="h" style="font-size:${H(st, 24)}px">Osprey</h2><span class="sp-row" style="gap:5px;font-size:12px;font-weight:600;color:${mix("var(--primary)", 75, "var(--text)")}"><span style="width:7px;height:7px;border-radius:50%;background:var(--primary)"></span>Free until 11:00</span></div>
<div class="muted" style="font-size:12.5px">Level 3 · North-east corner · Room 3.20</div></div>
<div style="display:grid;grid-template-columns:repeat(3,1fr);border:1px solid var(--border);border-radius:var(--radius)">${[["Capacity", "12 seats"], ["Size", "38 m²"], ["Check-in", "By 09:45"]].map(([k, v], i) => `<div style="padding:8px 12px;${i ? "border-left:1px solid var(--border)" : ""}"><div class="muted" style="font-size:11px">${k}</div><div class="num" style="font-size:14px">${v}</div></div>`).join("")}</div>
<div style="display:flex;flex-wrap:wrap;gap:6px">${EQUIP.map(([i, t]) => `<span class="sp-eq">${ic(i, 14)}${t}</span>`).join("")}</div>
<div style="display:grid;gap:8px"><div class="sp-row" style="justify-content:space-between"><span style="font-weight:600;font-size:13px">Today’s schedule</span><span class="muted" style="font-size:12px">3 bookings · 1 yours</span></div>
${timeline(8, 18)}
<div style="display:grid">${SCHED.map(([a, b, t, who, k]) => { const f = (x) => `${String(Math.floor(x)).padStart(2, "0")}:${x % 1 ? "30" : "00"}`; return `<div class="sp-row" style="gap:10px;padding:6px 0;border-top:1px solid var(--border);font-size:12.5px"><span class="num" style="font-size:12px;width:84px;flex:none;color:var(--muted)">${f(a)}–${f(b)}</span><span class="sp-ell" style="flex:1;font-weight:${k === "y" ? 700 : 500};${k === "y" ? "color:var(--primary)" : ""}">${t}</span>${av(who, 20)}</div>`; }).join("")}</div></div>
<div style="margin-top:auto;display:grid;gap:8px"><div class="sp-in">${ic("edit", 14)}Sprint planning · Harbor 2.4</div>
<div class="sp-row" style="justify-content:space-between;font-size:12.5px">${stack(["TR", "LP", "SA", "JW"], 24, 3)}<span class="sp-row" style="gap:8px"><span class="muted">Add video link</span><span class="sp-tog on"></span></span></div>
<button class="btn primary block">Book Osprey · 09:30–11:00</button><div class="muted" style="font-size:11.5px;text-align:center">Releases automatically if nobody checks in by 09:45</div></div></aside>`;
  return `${CSS}<div style="height:100%;display:flex;flex-direction:column">${top}<div style="flex:1;display:grid;grid-template-columns:1fr 380px;min-height:0">${plan}${panel}</div></div>`;
};

TPL["floor-plan/mobile"] = (p, st) => `${CSS}<div class="phone" style="position:relative">${status()}
<div style="padding:4px 16px 10px;display:grid;gap:10px;flex:none;border-bottom:1px solid var(--border)">
<div class="sp-row" style="justify-content:space-between"><div><div class="h" style="font-size:${H(st, 20)}px">Book a space</div><div class="muted" style="font-size:12px">Harbour Street office</div></div><span class="btn" style="height:34px;padding:0 10px;font-size:12.5px">${ic("calendar", 14)}Wed 28 · 09:30</span></div>
<div class="sp-row" style="gap:6px"><span class="sp-seg">${["L2", "L3", "L4"].map((t, i) => `<span class="${i === 1 ? "on" : ""}" style="padding:4px 10px">${t}</span>`).join("")}</span><span class="sp-fchip on" style="height:30px;padding:0 10px;font-size:12.5px">${ic("spatial_room", 14)}Rooms</span><span class="sp-fchip" style="height:30px;padding:0 10px;font-size:12.5px">${ic("spatial_desk", 14)}Desks</span><span class="sp-fchip" style="height:30px;padding:0 9px">${ic("filter", 14)}</span></div></div>
<div style="flex:none;height:328px;position:relative;background:var(--bg);overflow:hidden">${floorPlan("512 4 476 400", 390, 328, { tipLin: true })}
<span class="sp-row card" style="position:absolute;left:12px;bottom:10px;height:28px;padding:0 10px;border-radius:999px;font-size:11.5px;gap:6px;box-shadow:var(--shadow-sm)"><span style="color:var(--primary)">${ic("pin", 13)}</span>You are here · 40 m</span>
<div class="sp-float" style="right:12px;bottom:10px;flex-direction:column;padding:2px"><span class="sp-tool" style="width:30px;height:28px">${ic("plus", 15)}</span><span class="sp-tool" style="width:30px;height:28px">${ic("minus", 15)}</span></div></div>
<div style="flex:1;min-height:0;background:var(--surface);border-top:1px solid var(--border);border-radius:calc(var(--radius-lg) + 6px) calc(var(--radius-lg) + 6px) 0 0;box-shadow:var(--shadow-lg);margin-top:-14px;position:relative;z-index:3;padding:8px 18px 12px;display:flex;flex-direction:column;gap:10px;overflow:hidden">
<span style="align-self:center;width:38px;height:5px;border-radius:9px;background:${mix("var(--text)", 20, "var(--surface)")}"></span>
<div style="display:flex;gap:12px"><div style="width:84px;height:64px;border-radius:var(--radius);overflow:hidden;flex:none">${roomPhoto(84, 64)}</div><div style="min-width:0;flex:1;line-height:1.3"><div class="sp-row" style="justify-content:space-between"><div class="h" style="font-size:${H(st, 20)}px">Osprey</div><span class="sp-row" style="gap:5px;font-size:11.5px;font-weight:600;color:${mix("var(--primary)", 75, "var(--text)")}"><span style="width:7px;height:7px;border-radius:50%;background:var(--primary)"></span>Free until 11:00</span></div>
<div class="muted" style="font-size:12px">Level 3 · Room 3.20 · 12 seats · 38 m²</div><div class="sp-row muted" style="gap:10px;margin-top:5px">${EQUIP.map(([i]) => ic(i, 16)).join("")}</div></div></div>
<div style="display:grid;gap:6px"><div class="sp-row" style="justify-content:space-between;font-size:12.5px"><b style="font-weight:600">Today</b><span class="muted">3 bookings · next 11:00 go / no-go</span></div>${timeline(8, 18, 24)}</div>
<div class="sp-row" style="padding:10px 12px;border:1.5px solid var(--primary);border-radius:var(--radius);background:${mix("var(--primary)", 8, "var(--surface)")};font-size:13px"><span style="color:var(--primary)">${ic("clock", 16)}</span><div style="flex:1;line-height:1.25"><div style="font-weight:600">09:30 – 11:00 · 1 h 30 min</div><div class="muted" style="font-size:11.5px">Sprint planning · 7 people invited</div></div><span style="font-weight:600;color:var(--primary);font-size:12.5px">Change</span></div>
<button class="btn primary block" style="flex:none">Book Osprey</button></div>
${tabBar("Office", [["inbox", "Inbox"], ["check", "Tasks"], ["spatial_room", "Office"], ["folder", "Files"]])}</div>`;

// =============================================================================================
const def = (name, shows, elements, key) => ({ family: "workspace", name, shows, elements, web: TPL[key + "/web"], mobile: TPL[key + "/mobile"] });
module.exports = {
  "canvas-editor": def("Flow canvas editor (sitemap / onboarding diagram)",
    "a dotted-grid canvas of connected step nodes with SVG connector lines and branch labels, a selected node, an outline and block palette, an inspector with configuration and next steps, collaborators with live cursors, zoom and undo controls and a floating tool palette (mobile: read and comment view with the selected node in a bottom sheet)",
    ["canvas", "flow-diagram", "node-card", "connector", "inspector-panel", "outline-tree", "toolbar", "zoom-control", "collaborators", "live-cursor", "comments", "bottom-sheet"], "canvas-editor"),
  "floor-plan": def("Office floor plan (desk and room booking)",
    "an interactive SVG floor plan with available, booked and selected desks and rooms (hatching and labels, not colour alone), a floor switcher, space and amenity filters, a date and time picker, colleague avatars at desks, a 'You are here' pin, a legend and a selected-room details panel with photo, capacity, equipment, today's schedule and a Book button (bottom sheet on mobile)",
    ["floor-plan", "map", "filter-chips", "segmented-control", "date-picker", "legend", "details-panel", "timeline", "avatar", "booking", "bottom-sheet", "tab-bar"], "floor-plan"),
};
