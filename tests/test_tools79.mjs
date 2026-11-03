// Node unit test of the batch-79 MCP layer (src/tools_core79.js generated cores + src/mcp_tools79.js).
// Tools: get_frame_size, calc_label_wrap.
// Facts are re-derived here (frame = print + 2 mat; opening = print − 1/4 in; outside = frame + 2 moulding − 1/2 in; C = π d;
// cone sector: slant s = √(h² + (R−r)²), outer radius = s R / (R − r), angle = 2π R / outer), not copied from the core.
// Run: node tests/test_tools79.mjs
import { MGD79A, MGD79C } from "../src/tools_core79.js";
import { callTools79Tool as call, TOOL_DEFS, NEXT79, isTools79Tool } from "../src/mcp_tools79.js";
let ok = 0, fail = 0;
const t = (name, cond, info) => { cond ? ok++ : fail++; console.log((cond ? "PASS " : "FAIL ") + name + (cond ? "" : " | " + String(JSON.stringify(info)).slice(0, 400))); };
const txt = (r) => r.content.map((c) => c.text).join("\n");
const NAMES = ["get_frame_size", "calc_label_wrap"], PI = Math.PI;
const spaced = (d) => JSON.stringify(d).replace(/,"/g, ', "').replace(/":/g, '": ').replace(/,\{/g, ", {").replace(/,\[/g, ", [").length;
const near = (a, b, e = 0.06) => Math.abs(a - b) <= e;
const eq2 = (p, q, e = 0.011) => p && q && near(p[0], q[0], e) && near(p[1], q[1], e);

t("no window/document global leaked", typeof globalThis.window === "undefined" && typeof globalThis.document === "undefined");
t("cores bundled (79A frames, 79C bottles / cans / cups)", typeof MGD79A.frameOuter === "function" && typeof MGD79C.cupSector === "function" && Object.keys(MGD79C.CUPS).length === 4);
t("2 tools in order", JSON.stringify(TOOL_DEFS.map((d) => d.name)) === JSON.stringify(NAMES), TOOL_DEFS.map((d) => d.name));
for (const d of TOOL_DEFS) {
  const size = spaced(d);
  t(`${d.name}: 'Use when', < 650 chars, ≤ 1.6 KB (as Python counts it), read-only, next hint`, d.description.startsWith("Use when") && d.description.length < 650 && size <= 1640 && d.annotations.readOnlyHint && !d.annotations.openWorldHint && NEXT79[d.name] && d.inputSchema.type === "object", [d.description.length, size]);
}
t("isTools79Tool", NAMES.every(isTools79Tool) && !isTools79Tool("make_sign"));

// ---- frames
let r = await call("get_frame_size", {}), s = r.structuredContent;
t("default 16 × 20 print, 2 in mat, 1 in moulding: frame 20 × 24, opening 15.75 × 19.75, outside 21.5 × 25.5 in", !r.isError && eq2(s.print_in, [16, 20]) && eq2(s.frame_in, [20, 24]) && eq2(s.mat_opening_in, [15.75, 19.75]) && eq2(s.outer_in, [21.5, 25.5]), s);
t("cm = in × 2.54", near(s.frame_cm[0], 50.8) && near(s.outer_cm[1], 64.8));
for (const size of Object.keys(MGD79A.FRAME_SIZES)) for (const [mat, mould] of [[0, 0.5], [2, 1], [3.5, 2.5]]) {
  const q = (await call("get_frame_size", { size, mat, moulding: mould, orientation: "landscape" })).structuredContent, a = MGD79A.FRAME_SIZES[size], w = Math.max(a[0], a[1]), h = Math.min(a[0], a[1]);
  const good = eq2(q.print_in, [w, h]) && eq2(q.frame_in, [w + 2 * mat, h + 2 * mat]) && eq2(q.outer_in, [w + 2 * mat + 2 * mould - 0.5, h + 2 * mat + 2 * mould - 0.5]) && (mat ? eq2(q.mat_opening_in, [w - 0.25, h - 0.25]) : q.mat_opening_in === null);
  if (!good) t(`frame ${size} mat ${mat} moulding ${mould} landscape re-derived`, false, q);
}
t("every frame size × 3 mat/moulding combos (landscape) re-derived", true);
const cu = (await call("get_frame_size", { width: 16, height: 20 })).structuredContent;
t("custom 16 × 20 in = the 16x20 preset (same convention as the core)", JSON.stringify(cu.frame_in) === JSON.stringify(s.frame_in) && JSON.stringify(cu.outer_in) === JSON.stringify(s.outer_in) && JSON.stringify(cu.mat_opening_in) === JSON.stringify(s.mat_opening_in));
const cm = (await call("get_frame_size", { width: 30, height: 40, unit: "cm", mat: 0 })).structuredContent;
t("custom 30 × 40 cm, no mat: frame = print (11.81 × 15.75 in), no opening", eq2(cm.frame_in, [30 / 2.54, 40 / 2.54], 0.006) && cm.mat_opening_in === null);
t("text gives frame, opening, outside + page link", /buy a 20 × 24 in/.test(txt(r)) && /Mat opening 15.75 × 19.75 in/.test(txt(r)) && txt(r).includes("/tools/frame-mockup/"));

// ---- bottles
r = await call("calc_label_wrap", {}); s = r.structuredContent;
const B = MGD79C.BOTTLES.wine, zone = B.body[1] - B.body[0];
t("default wine bottle: C = π × 75, label 45% of C × 55% of the straight body", !r.isError && near(s.circumference_mm, PI * 75) && near(s.label_mm[0], PI * 75 * 0.45) && near(s.label_mm[1], zone * 0.55) && s.degrees === 162, s);
t("bottle = the core's bottleLabel", (() => { const L = MGD79C.bottleLabel({ type: "wine", labelw: 45, labelh: 55 }); return near(s.label_mm[0], L.w) && near(s.label_mm[1], L.h_mm); })());
t("front: whole label visible (< half C), apparent width = d sin(π × 0.45)", s.front_visible_arc_mm === s.label_mm[0] && near(s.front_apparent_width_mm, 75 * Math.sin(PI * 0.45)));
t("print file px at 300 DPI with 1.5 mm bleed", s.px300[0] === Math.round((PI * 75 * 0.45 + 3) / 25.4 * 300) && s.px300[1] === Math.round((zone * 0.55 + 3) / 25.4 * 300));
for (const type of Object.keys(MGD79C.BOTTLES)) {
  const q = (await call("calc_label_wrap", { type, coverage: 30, label_height: 80 })).structuredContent, b = MGD79C.BOTTLES[type];
  t(`bottle ${type}: C = π × ${b.d}, label 30% × 80% of the body`, near(q.circumference_mm, PI * b.d) && near(q.label_mm[0], PI * b.d * 0.3) && near(q.label_mm[1], (b.body[1] - b.body[0]) * 0.8), q);
}
const ov = (await call("calc_label_wrap", { diameter: 60, height: 100, coverage: 105 })).structuredContent;
t("custom bottle 105%: overlaps itself by 5% of C, front shows half C, apparent width = d", ov.type === "custom" && near(ov.overlap_mm, PI * 60 * 0.05) && near(ov.front_visible_arc_mm, PI * 30) && ov.front_apparent_width_mm === 60 && ov.degrees === 360);

// ---- cans
for (const type of Object.keys(MGD79C.CANS)) {
  const q = (await call("calc_label_wrap", { container: "can", type })).structuredContent, c = MGD79C.CANS[type], w = MGD79C.canWrap({ size: type });
  t(`can ${type}: full wrap = π × ${c.d} by the straight body (${Math.round(w.h_mm)} mm)`, near(q.label_mm[0], PI * c.d) && near(q.label_mm[1], w.h_mm) && q.coverage_pct === 100 && q.front_apparent_width_mm === c.d, q);
}
const cc = (await call("calc_label_wrap", { container: "can", diameter: 50, height: 90 })).structuredContent;
t("custom can 50 × 90 mm band", near(cc.label_mm[0], PI * 50) && cc.label_mm[1] === 90);

// ---- cups (unrolled cone)
for (const type of Object.keys(MGD79C.CUPS)) {
  const q = (await call("calc_label_wrap", { container: "cup", type })).structuredContent, c = MGD79C.CUPS[type], R = c.top / 2, rr = c.bot / 2;
  const sl = Math.hypot(c.h, R - rr), Ro = sl * R / (R - rr), ang = 2 * PI * R / Ro * 180 / PI;
  t(`cup ${type}: outer ${Ro.toFixed(1)}, inner ${(Ro - sl).toFixed(1)} mm, ${ang.toFixed(1)}°; arcs = rim / base circumference`, near(q.sector.outer_radius_mm, Ro) && near(q.sector.inner_radius_mm, Ro - sl) && near(q.sector.full_angle_deg, ang) &&
    near(q.sector.outer_arc_mm, PI * c.top) && near(q.sector.inner_arc_mm, PI * c.bot) && near(q.sector.outer_arc_mm, q.sector.outer_radius_mm * q.sector.angle_deg * PI / 180, 0.5), q.sector);
}
const half = (await call("calc_label_wrap", { container: "cup", coverage: 50 })).structuredContent;
t("cup 50%: half the angle, half the arcs", near(half.sector.angle_deg, 47.8 / 2, 0.1) && near(half.sector.outer_arc_mm, PI * 90 / 2) && half.sector.paper_mm[0] < 274.6);
const cup = (await call("calc_label_wrap", { container: "cup", rim: 80, base: 50, height: 100 })).structuredContent;
const sl = Math.hypot(100, 15);
t("custom cup 80/50/100: outer = slant × 40 / 15", near(cup.sector.outer_radius_mm, sl * 40 / 15) && near(cup.sector.inner_radius_mm, sl * 40 / 15 - sl));
t("cup text explains the curved sector + page", /curved sector/.test(txt(await call("calc_label_wrap", { container: "cup" }))) && cup.page.endsWith("/tools/coffee-cup-mockup/"));
t("deterministic", JSON.stringify((await call("calc_label_wrap", {})).structuredContent) === JSON.stringify(s));

// ---- bad inputs
for (const [n, a] of [["get_frame_size", { size: "5x7" }], ["get_frame_size", { mat: 5 }], ["get_frame_size", { moulding: 0.1 }], ["get_frame_size", { width: 10 }], ["get_frame_size", { size: "8x10", width: 8, height: 10 }],
  ["get_frame_size", { width: 100, height: 100 }], ["get_frame_size", { unit: "ft", width: 1, height: 1 }], ["calc_label_wrap", { container: "jar" }], ["calc_label_wrap", { type: "x" }],
  ["calc_label_wrap", { container: "cup", diameter: 60, height: 80 }], ["calc_label_wrap", { container: "cup", rim: 50, base: 80, height: 90 }], ["calc_label_wrap", { diameter: 60 }],
  ["calc_label_wrap", { type: "wine", diameter: 60, height: 90 }], ["calc_label_wrap", { coverage: 200 }], ["calc_label_wrap", { container: "can", label_height: 50 }]]) {
  const q = await call(n, a);
  t(`bad input → isError: ${n} ${JSON.stringify(a)}`, q.isError && txt(q).length < 200, txt(q));
}
t("unknown tool → isError", (await call("make_nothing", {})).isError);
console.log(`\n${ok} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
