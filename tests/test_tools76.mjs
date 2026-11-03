// Node unit test of the batch-76 MCP layer (src/tools_core76.js generated cores + src/mcp_tools76.js).
// Tools: make_paper_airplane_template, make_crown_template.
// Geometry is re-derived here (dart nose folds meet the edge at y = W/2 and (W/2)/tan 22.5°; band = head + overlap; pieces tile the band), not copied from the core.
// Run: node tests/test_tools76.mjs
import { MGD76, MGD72D } from "../src/tools_core76.js";
import { callTools76Tool as call, TOOL_DEFS, NEXT76, isTools76Tool } from "../src/mcp_tools76.js";
let ok = 0, fail = 0;
const t = (name, cond, info) => { cond ? ok++ : fail++; console.log((cond ? "PASS " : "FAIL ") + name + (cond ? "" : " | " + String(JSON.stringify(info)).slice(0, 400))); };
const txt = (r) => r.content.map((c) => c.text).join("\n");
const NAMES = ["make_paper_airplane_template", "make_crown_template"], CAP = 120 * 1024;
const svgOk = (s) => typeof s === "string" && /^<svg[\s>]/.test(s) && /<\/svg>\s*$/.test(s) && !/<script|onload=|foreignObject|href="http/i.test(s);
const spaced = (d) => JSON.stringify(d).replace(/,"/g, ', "').replace(/":/g, '": ').replace(/,\{/g, ", {").replace(/,\[/g, ", [").length;
const near = (a, b, e = 0.05) => Math.abs(a - b) <= e;
const paths = (svg, id) => { const m = svg.match(new RegExp('<g id="' + id + '"[^>]*>(.*?)</g>')); return m ? (m[1].match(/<path /g) || []).length : 0; };

t("no window/document global leaked", typeof globalThis.window === "undefined" && typeof globalThis.document === "undefined");
t("cores bundled (print, tpl, plane, crown)", typeof MGD72D.print.linesSVG === "function" && typeof MGD76.tpl.svg === "function" && typeof MGD76.plane.plane === "function" && typeof MGD76.crown.crown === "function");
t("2 tools in order", JSON.stringify(TOOL_DEFS.map((d) => d.name)) === JSON.stringify(NAMES), TOOL_DEFS.map((d) => d.name));
for (const d of TOOL_DEFS) {
  const size = spaced(d);
  t(`${d.name}: 'Use when', < 650 chars, ≤ 1.6 KB (as Python counts it), read-only, next hint`, d.description.startsWith("Use when") && d.description.length < 650 && size <= 1640 && d.annotations.readOnlyHint && !d.annotations.openWorldHint && NEXT76[d.name] && d.inputSchema.type === "object", [d.description.length, size]);
}
t("isTools76Tool", NAMES.every(isTools76Tool) && !isTools76Tool("make_maze"));
t("schema enums = the core lists (designs, styles, presets; image fill left out)", JSON.stringify(TOOL_DEFS[0].inputSchema.properties.design.enum) === '["dart","glider","nakamura"]' &&
  JSON.stringify(TOOL_DEFS[1].inputSchema.properties.style.enum) === JSON.stringify(MGD76.crown.STYLES.map((s) => s[0])) && !TOOL_DEFS[0].inputSchema.properties.fill.enum.includes("image"));

// ---- paper airplane
let r = await call("make_paper_airplane_template", {}), s = r.structuredContent;
const W = 215.9, H = 279.4;
t("default: classic dart on US Letter 215.9 × 279.4 mm, true-size SVG", !r.isError && s.design === "dart" && s.paper === "letter" && s.sheet_mm[0] === W && s.sheet_mm[1] === H && svgOk(s.svg) && s.svg.includes('width="215.9mm" height="279.4mm"'), s && s.sheet_mm);
t("valley + mountain = crease count; both kinds present", s.valley + s.mountain === s.creases.length && s.valley > 0 && s.mountain > 0, [s.valley, s.mountain]);
t("SVG draws every valley (pink VALLEY group) and every mountain (blue FOLD group) segment", paths(s.svg, "VALLEY") === s.valley && paths(s.svg, "FOLD") === s.mountain, [paths(s.svg, "VALLEY"), paths(s.svg, "FOLD")]);
t("every crease lies on the sheet", s.creases.every((c) => [c.a, c.b].every((q) => q[0] > -0.05 && q[1] > -0.05 && q[0] < W + 0.05 && q[1] < H + 0.05)));
t("crease steps are 1..n and each step has its instruction", s.creases.every((c) => Number.isInteger(c.step) && c.step >= 1 && c.step <= s.steps.length) && s.steps.length >= 6);
t("dart step 2 runs from the nose (W/2, 0) to the side edge at y = W/2", s.creases.some((c) => c.step === 2 && [c.a, c.b].some((q) => near(q[0], W / 2) && near(q[1], 0)) && [c.a, c.b].some((q) => near(q[0], 0) && near(q[1], W / 2))));
t("dart step 3 meets the side edge at y = (W/2)/tan 22.5° = 260.6 mm", s.creases.some((c) => c.step === 3 && [c.a, c.b].some((q) => near(q[0], 0, 0.1) && near(q[1], W / 2 / Math.tan(Math.PI / 8), 0.1))));
const key = (c) => [c.a, c.b].map((q) => Math.round(q[0]) + "," + Math.round(q[1])).sort().join("|") + c.type, set = new Set(s.creases.map(key));
t("crease pattern is mirror-symmetric about the centre line", s.creases.every((c) => set.has(key({ a: [W - c.a[0], c.a[1]], b: [W - c.b[0], c.b[1]], type: c.type }))));
t("text lists the numbered steps + page link; SVG under the cap", txt(r).includes("1. Lay the sheet") && txt(r).includes("/tools/paper-airplane-template/") && s.svg.length <= CAP);
t("step badges on by default (numbered circles)", /<circle /.test(s.svg));
const off = (await call("make_paper_airplane_template", { numbers: false })).structuredContent;
t("numbers:false → no step badges, same creases", !/<circle /.test(off.svg) && JSON.stringify(off.creases) === JSON.stringify(s.creases));
for (const d of ["glider", "nakamura"]) for (const paper of ["letter", "a4"]) {
  const q = (await call("make_paper_airplane_template", { design: d, paper })).structuredContent, w = paper === "a4" ? 210 : 215.9;
  t(`${d}/${paper}: sheet ${w} mm wide, valley + mountain present, ≤ 120 KB`, q.design === d && q.sheet_mm[0] === w && q.valley > 0 && q.mountain > 0 && q.svg.length <= CAP, q.sheet_mm);
}
const nk = (await call("make_paper_airplane_template", { design: "nakamura" })).structuredContent;
t("nakamura: more folds than the dart, turn-over step 3 reads as a mountain on the printed side", nk.creases.length > s.creases.length && nk.creases.some((c) => c.step === 3 && near(c.a[1], W / 2, 0.1) && near(c.b[1], W / 2, 0.1) && c.type === "mountain"));
const dec = (await call("make_paper_airplane_template", { text: "Ace <b>", fill: "stripes", color: "#2563eb" })).structuredContent;
t("text on the wings (escaped), stripes in the chosen colour", dec.svg.includes("Ace &lt;b&gt;") && !dec.svg.includes("<b>") && dec.svg.includes("#2563eb"));
t("default fill none = no ART background rect", !/<g id="ART"><clipPath/.test(s.svg) && /<g id="ART"><clipPath/.test(dec.svg));
const again = (await call("make_paper_airplane_template", {})).structuredContent;
t("deterministic", again.svg === s.svg);

// ---- paper crown
r = await call("make_crown_template", {}); s = r.structuredContent;
const area = MGD76.tpl.printable("letter", "landscape");
t("default: adult 57 cm head + 2.5 cm overlap = 59.5 cm band", !r.isError && s.head_mm === 570 && s.overlap_mm === 25 && s.band_length_mm === 595 && txt(r).includes("band 59.5 cm long"), s && s.band_length_mm);
t("default points ≈ 1 per 7.5 cm (round(570/75) = 8), spaced head/n", s.points === 8 && near(s.point_spacing_mm, 570 / 8, 0.01), [s.points, s.point_spacing_mm]);
const span = s.pieces.reduce((a, p) => a + (p.to_mm - p.from_mm), 0);
t("pieces tile the band end to end (sum = band length, contiguous)", near(span, 595, 0.05) && s.pieces.every((p, i) => i === 0 ? p.from_mm === 0 : near(p.from_mm, s.pieces[i - 1].to_mm, 0.01)), span);
t("every piece but the last has a 15 mm glue tab; width = length + tab", s.pieces.every((p, i) => p.glue_tab_mm === (i < s.pieces.length - 1 ? 15 : 0) && near(p.width_mm, p.to_mm - p.from_mm + p.glue_tab_mm, 0.02)));
t("every piece fits the landscape Letter printable width", s.pieces.every((p) => p.width_mm <= area.w + 0.01), [s.pieces.map((p) => p.width_mm), area.w]);
t("splits fall between points (multiples of the spacing)", s.pieces.slice(1).every((p) => near(p.from_mm / s.point_spacing_mm, Math.round(p.from_mm / s.point_spacing_mm), 0.001)));
t("one SVG per sheet, true size = the printable area", s.svgs.length === s.sheets && s.svgs.every((v) => svgOk(v) && v.includes(`width="${area.w}mm"`)), s.svgs.map((v) => v.slice(0, 90)));
t("cut outline per piece (CUT group paths = pieces)", s.svgs.reduce((a, v) => a + paths(v, "CUT"), 0) === s.pieces.length);
t("multi-piece band: GLUE UNDER labels and the OVERLAP end", s.svgs.join("").includes("GLUE UNDER 2") && s.svgs.join("").includes("OVERLAP"));
t("total SVG under the cap; text names the sheets + page link", s.svgs.join("").length <= CAP && txt(r).includes("Sheet 1 of") && txt(r).includes("/tools/paper-crown-template/"));
const inch = (await call("make_crown_template", { head_circumference: 22, unit: "in", overlap: 1, band: 1.5, height: 2.5 })).structuredContent;
t("inches: 22 in head = 558.8 mm, 1 in overlap → 23 in band", near(inch.head_mm, 558.8, 0.01) && near(inch.band_length_mm, 584.2, 0.01) && near(inch.band_mm, 38.1, 0.01) && near(inch.point_height_mm, 63.5, 0.01), [inch.head_mm, inch.band_length_mm]);
const tod = (await call("make_crown_template", { preset: "toddler" })).structuredContent;
t("toddler preset = 48 cm head", tod.head_mm === 480 && tod.band_length_mm === 505);
const a3 = (await call("make_crown_template", { paper: "a3" })).structuredContent;
t("A3: fewer (or equal) pieces than Letter, all within its printable width", a3.pieces.length <= s.pieces.length && a3.pieces.every((p) => p.width_mm <= MGD76.tpl.printable("a3", "landscape").w + 0.01), a3.pieces.length);
const pts = (await call("make_crown_template", { points: 12 })).structuredContent;
t("12 points: spacing 570/12 = 47.5 mm", pts.points === 12 && near(pts.point_spacing_mm, 47.5, 0.01));
for (const style of MGD76.crown.STYLES.map((x) => x[0])) {
  const q = (await call("make_crown_template", { style, text: "Mia", fill: "dots" })).structuredContent;
  t(`style ${style}: valid SVG sheets, name on the front`, q && q.style === style && q.svgs.every(svgOk) && q.svgs.join("").includes(">Mia</text>") && q.svgs.join("").length <= CAP, q && q.style);
}
const ng = (await call("make_crown_template", { gems: false, fill: "none" })).structuredContent;
t("gems:false + fill none → no jewel circles", !/<circle /.test(ng.svgs.join("")));
t("deterministic", JSON.stringify((await call("make_crown_template", {})).structuredContent) === JSON.stringify(s));
const tall = await call("make_crown_template", { band: 8, height: 15 });
t("too tall for the paper → core's error (230 mm on Letter)", tall.isError && /230 mm tall/.test(txt(tall)), txt(tall));
t("…but fits on A3", !(await call("make_crown_template", { band: 8, height: 15, paper: "a3" })).isError);

// ---- bad inputs
for (const [n, a] of [["make_paper_airplane_template", { design: "jet" }], ["make_paper_airplane_template", { paper: "a3" }], ["make_paper_airplane_template", { fill: "image" }],
  ["make_paper_airplane_template", { color: "red" }], ["make_crown_template", { head_circumference: 5 }], ["make_crown_template", { head_circumference: 120 }],
  ["make_crown_template", { unit: "ft" }], ["make_crown_template", { style: "star" }], ["make_crown_template", { points: 1 }], ["make_crown_template", { points: 2.5 }],
  ["make_crown_template", { overlap: 0.2 }], ["make_crown_template", { band: 20 }], ["make_crown_template", { paper: "legal" }], ["make_crown_template", { preset: "giant" }],
  ["make_crown_template", { head_circumference: "abc" }]]) {
  const q = await call(n, a);
  t(`bad input → isError: ${n} ${JSON.stringify(a)}`, q.isError && txt(q).length < 200, txt(q));
}
t("unknown tool → isError", (await call("make_nothing", {})).isError);
console.log(`\n${ok} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
