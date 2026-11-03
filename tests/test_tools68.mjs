// Node unit test of the batch-68 MCP layer (src/tools_core68.js generated cores + src/mcp_tools68.js).
// Tools: make_certificate_border, calc_kitchen_work_triangle, plan_square_foot_garden.
// Numbers are re-derived here from paper sizes / the NKBA guideline / square-foot gardening counts, not copied from the core. Run: node tests/test_tools68.mjs
import { MGD67D, MGD68B, MGD68C } from "../src/tools_core68.js";
import { callTools68Tool as call, TOOL_DEFS, NEXT68, isTools68Tool } from "../src/mcp_tools68.js";
let ok = 0, fail = 0;
const t = (name, cond, info) => { cond ? ok++ : fail++; console.log((cond ? "PASS " : "FAIL ") + name + (cond ? "" : " | " + String(JSON.stringify(info)).slice(0, 400))); };
const txt = (r) => r.content.map((c) => c.text).join("\n");
const near = (a, b, e = 1e-2) => Math.abs(a - b) <= e;
const NAMES = ["make_certificate_border", "calc_kitchen_work_triangle", "plan_square_foot_garden"];
const svgOk = (s) => typeof s === "string" && /^<svg[\s>]/.test(s.trim()) && /<\/svg>\s*$/.test(s) && !/<script|onload=|foreignObject|href="http/i.test(s);

t("no window/document global leaked", typeof globalThis.window === "undefined" && typeof globalThis.document === "undefined");
t("cores bundled (draw, plan, planner, cert)", MGD67D.draw && MGD67D.plan && typeof MGD68B.triangle === "function" && typeof MGD68C.cert.build === "function");
t("3 tools in order", JSON.stringify(TOOL_DEFS.map((d) => d.name)) === JSON.stringify(NAMES), TOOL_DEFS.map((d) => d.name));
for (const d of TOOL_DEFS) {
  const size = JSON.stringify(d).length;
  t(`${d.name}: 'Use when', < 650 chars, ≤ 1.6 KB, read-only, next hint, object schema`, d.description.startsWith("Use when") && d.description.length < 650 && size <= 1640 && d.annotations.readOnlyHint && !d.annotations.openWorldHint && NEXT68[d.name] && d.inputSchema.type === "object", [d.description.length, size]);
}
t("isTools68Tool", NAMES.every(isTools68Tool) && !isTools68Tool("make_speech_bubble"));

// ---- certificate border (US Letter 8.5 × 11 in = 215.9 × 279.4 mm; A4 210 × 297 mm)
let r = await call("make_certificate_border", { style: "ornate" }), s = r.structuredContent;
t("ornate Letter landscape: page 279.4 × 215.9 mm, SVG inline in mm", !r.isError && s.page_mm.w === 279.4 && s.page_mm.h === 215.9 && svgOk(s.svg) && /width="279\.4mm"/.test(s.svg), s && s.page_mm);
t("writing area inside the page and inside the margin", s.inner_mm.x >= 10 && s.inner_mm.y >= 10 && s.inner_mm.x + s.inner_mm.w <= 279.4 - 10 && s.inner_mm.y + s.inner_mm.h <= 215.9 - 10, s.inner_mm);
t("writing area centred", near(s.inner_mm.x + s.inner_mm.w / 2, 279.4 / 2, 0.2) , s.inner_mm);
t("seal inside the writing area, bottom", s.seal_mm && s.seal_mm.cy > s.inner_mm.y + s.inner_mm.h / 2 && s.seal_mm.cy + s.seal_mm.r <= s.inner_mm.y + s.inner_mm.h + 0.2, s.seal_mm);
t("path coordinates rounded to 0.1 mm", !/ d="[^"]*\d\.\d\d/.test(s.svg));
t("rounding moves geometry < 0.06 mm (bbox matches the core)", (() => { const raw = MGD68C.cert.svg(MGD68C.cert.build({ style: "ornate" })); const nums = (x) => [...x.matchAll(/ d="([^"]*)"/g)].flatMap((m) => m[1].match(/-?\d+(\.\d+)?/g).map(Number)); const a = nums(raw), b = nums(s.svg); return a.length === b.length && a.every((v, i) => Math.abs(v - b[i]) <= 0.0501); })());
r = await call("make_certificate_border", { style: "deco", paper: "a4", orient: "portrait", seal: "none", format: "svg" }); s = r.structuredContent;
t("deco A4 portrait: 210 × 297 mm, no seal", !r.isError && s.page_mm.w === 210 && s.page_mm.h === 297 && s.seal_mm === null && svgOk(s.svg), s && s.page_mm);
for (const st of ["classic", "ropewave"]) { r = await call("make_certificate_border", { style: st }); t(`${st}: fits inline (≤ 120 KB)`, !r.isError && r.structuredContent.svg && r.structuredContent.svg.length <= 120 * 1024, r.structuredContent.svg && r.structuredContent.svg.length); }
for (const st of ["banknote", "lattice", "diploma"]) { r = await call("make_certificate_border", { style: st }); t(`${st}: too large inline → layout + page link, no SVG`, !r.isError && !r.structuredContent.svg && r.structuredContent.svg_too_large && /certificate-border\//.test(txt(r)) && r.structuredContent.inner_mm.w > 100, txt(r).slice(0, 200)); }
r = await call("make_certificate_border", { style: "classic", format: "none" }); t("format none → no SVG", !r.isError && !r.structuredContent.svg);
r = await call("make_certificate_border", { style: "ornate", scheme: "custom", color: "#123456", color2: "#abcdef" }); t("custom colours used", r.structuredContent.svg.includes("#123456"));
r = await call("make_certificate_border", { style: "ornate", title: "<Award & Honour>" }); t("title escaped in the SVG", !r.structuredContent.svg.includes("<Award") && r.structuredContent.svg.includes("&lt;Award &amp; Honour&gt;"));
r = await call("make_certificate_border", { style: "ornate", margin: 3 }); t("tiny margin → printer warning", r.structuredContent.warnings.length > 0 && /printer/i.test(txt(r)));
for (const [n, a] of [["bad style", { style: "fancy" }], ["bad paper", { paper: "b5" }], ["bad colour", { scheme: "custom", color: "red" }], ["band 100", { band: 100 }], ["title 81", { title: "x".repeat(81) }], ["bad seal", { seal: "wax" }]])
  t(`cert ${n} → isError`, (await call("make_certificate_border", a)).isError === true, n);

// ---- kitchen work triangle (NKBA: legs 4–9 ft ≈ 1.2–2.7 m, total ≤ 26 ft ≈ 7.9 m, ≥ 4.0 m; island intrusion ≤ 12 in ≈ 300 mm)
r = await call("calc_kitchen_work_triangle", { legs: [1.8, 2.1, 1.5] }); s = r.structuredContent;
t("1.8 / 2.1 / 1.5 m: total 5.4 m, within the guideline", !r.isError && near(s.total, 5.4) && s.ok === true && s.issues.length === 0, s);
r = await call("calc_kitchen_work_triangle", { unit: "ft", legs: [3, 5, 5] }); s = r.structuredContent;
t("3 ft leg flagged as shorter than 1.2 m (3.94 ft)", !r.isError && s.ok === false && s.issues.some((x) => /Sink to cooktop/.test(x) && /shorter/.test(x)) && near(s.total, 13), s.issues);
r = await call("calc_kitchen_work_triangle", { legs: [2.7, 2.7, 2.7] }); s = r.structuredContent;
t("2.7 × 3 = 8.1 m total → over 7.9 m only", s.ok === false && s.issues.length === 1 && /over/.test(s.issues[0]), s.issues);
r = await call("calc_kitchen_work_triangle", { unit: "cm", sink: [0, 0], cooktop: [240, 0], fridge: [120, 160] }); s = r.structuredContent;
t("positions → legs 240, 200, 200 cm (3-4-5 triangles)", !r.isError && near(s.legs[0], 240) && near(s.legs[1], 200) && near(s.legs[2], 200) && s.ok, s.legs);
r = await call("calc_kitchen_work_triangle", { unit: "cm", sink: [0, 0], cooktop: [240, 0], fridge: [120, 160], islands: [[60, -30, 120, 60]] }); s = r.structuredContent;
t("island across the sink–cooktop leg cuts it by 120 cm → flagged", near(s.island_cut_mm[0], 1200, 0.5) && s.ok === false && s.issues.some((x) => /island/.test(x)), s.island_cut_mm);
r = await call("calc_kitchen_work_triangle", { unit: "cm", sink: [0, 0], cooktop: [240, 0], fridge: [120, 160], islands: [[100, -100, 20, 120]] }); s = r.structuredContent;
t("island crossing the leg by 20 cm (< 30 cm) is allowed", near(s.island_cut_mm[0], 200, 0.5) && s.ok, s.island_cut_mm);
r = await call("calc_kitchen_work_triangle", { legs: [1.8, 2.1, 1.5], aisle: 1.0 }); t("aisle 1.0 m < 1.07 m (one cook) flagged", r.structuredContent.aisle.ok === false && r.structuredContent.ok === false);
r = await call("calc_kitchen_work_triangle", { unit: "in", legs: [72, 80, 60], aisle: 44, cooks: 2 }); t("44 in aisle < 48 in for two cooks", r.structuredContent.aisle.ok === false && r.structuredContent.aisle.min_mm === 1220, r.structuredContent.aisle);
t("guideline values exposed", JSON.stringify(r.structuredContent.guideline_mm) === JSON.stringify({ leg_min: 1200, leg_max: 2700, total_min: 4000, total_max: 7900, island_max: 300 }));
for (const [n, a] of [["2 legs", { legs: [1, 2] }], ["impossible triangle", { legs: [1, 1, 5] }], ["no fridge", { sink: [0, 0], cooktop: [1, 0] }], ["bad island", { sink: [0, 0], cooktop: [1, 0], fridge: [0, 1], islands: [[0, 0, -1, 1]] }], ["aisle 0", { legs: [2, 2, 2], aisle: 0 }]])
  t(`triangle ${n} → isError`, (await call("calc_kitchen_work_triangle", a)).isError === true, n);

// ---- square-foot garden
r = await call("plan_square_foot_garden", {}); s = r.structuredContent;
t("default 4 × 8 ft bed = 32 squares, crop table listed", !r.isError && s.squares === 32 && s.cols === 4 && s.rows === 8 && /Carrot 16/.test(txt(r)), s && s.squares);
r = await call("plan_square_foot_garden", { width: 4, length: 4, crops: [{ crop: "tomato", squares: 4 }, { crop: "carrot", squares: 2 }, { crop: "lettuce" }, { crop: "spinach" }] }); s = r.structuredContent;
t("4 × 4: tomato 4×1, carrot 2×16 = 32, lettuce/spinach share 10 free squares 5 each → 20 and 45", !r.isError && s.crops[0].plants === 4 && s.crops[1].plants === 32 && s.crops[2].squares === 5 && s.crops[2].plants === 20 && s.crops[3].plants === 45 && s.free === 0, s.crops);
t("layout lists one entry per planted square", s.layout.length === 16 && s.layout[0].crop === "tomato" && s.layout[15].row === 4);
r = await call("plan_square_foot_garden", { width: 1.2, length: 2.4, unit: "m", grid: "metric", crops: [{ crop: "squash", squares: 9 }] }); s = r.structuredContent;
t("1.2 × 2.4 m on 30 cm squares = 4 × 8; squash 9 squares → 1 plant", !r.isError && s.cols === 4 && s.rows === 8 && s.crops[0].plants === 1, s.crops);
r = await call("plan_square_foot_garden", { width: 46, length: 46, unit: "in" }); t("46 in = 3 whole 1 ft squares per side (9)", r.structuredContent.squares === 9, r.structuredContent.squares);
t("matches the planner core sqft()", MGD68B.sqft(4 * 304.8, 4 * 304.8, "onion", "ft").plants === 16 * 16);
for (const [n, a] of [["unknown crop", { crops: [{ crop: "banana" }] }], ["too many squares", { width: 2, length: 2, crops: [{ crop: "kale", squares: 5 }] }], ["tiny bed", { width: 0.5, length: 0.5 }], ["negative", { width: -1 }], ["fraction squares", { crops: [{ crop: "kale", squares: 1.5 }] }]])
  t(`garden ${n} → isError`, (await call("plan_square_foot_garden", a)).isError === true, n);
console.log(`\n${ok} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
