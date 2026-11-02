// Node unit test of the batch-65 MCP layer (src/tools_core65.js generated cores + src/mcp_tools65.js).
// Tools: get_logo_placement, make_cd_case_template, make_paper_piecing_template, make_voronoi_pattern, edit_svg_path, calc_depth_of_field.
// Numbers are re-derived here from published specs / formulas, not copied from the core. Run: node tests/test_tools65.mjs (exit 1 on failure)
import { MGDLogoPlace, MGDCdCase, MGDEpp, MGDVoronoi, MGDSvgPath, MGDDof } from "../src/tools_core65.js";
import { callTools65Tool as call, TOOL_DEFS, NEXT65, isTools65Tool } from "../src/mcp_tools65.js";
let ok = 0, fail = 0;
const t = (name, cond, info) => { cond ? ok++ : fail++; console.log((cond ? "PASS " : "FAIL ") + name + (cond ? "" : " | " + String(JSON.stringify(info)).slice(0, 400))); };
const txt = (r) => r.content.map((c) => c.text).join("\n");
const near = (a, b, e = 1e-3) => Math.abs(a - b) <= e;
const NAMES = ["get_logo_placement", "make_cd_case_template", "make_paper_piecing_template", "make_voronoi_pattern", "edit_svg_path", "calc_depth_of_field"];
const svgOk = (s) => typeof s === "string" && /^<svg[\s>]/.test(s.trim()) && /<\/svg>\s*$/.test(s) && !/<script|onload=|foreignObject/i.test(s);

t("no window/document global leaked", typeof globalThis.window === "undefined" && typeof globalThis.document === "undefined");
t("all 6 cores bundled", [MGDLogoPlace, MGDCdCase, MGDEpp, MGDVoronoi, MGDSvgPath, MGDDof].every((x) => x && typeof x === "object"));
t("6 tools in order", JSON.stringify(TOOL_DEFS.map((d) => d.name)) === JSON.stringify(NAMES), TOOL_DEFS.map((d) => d.name));
for (const d of TOOL_DEFS) {
  const size = JSON.stringify(d).length;
  t(`${d.name}: 'Use when', < 650 chars, ≤ 1.6 KB, read-only, next hint, object schema`, d.description.startsWith("Use when") && d.description.length < 650 && size <= 1640 && d.annotations.readOnlyHint && !d.annotations.openWorldHint && NEXT65[d.name] && d.inputSchema.type === "object", [d.description.length, size]);
}
t("isTools65Tool", NAMES.every(isTools65Tool) && !isTools65Tool("calc_quilt"));
t("no trademark/brand names in tool descriptions", !TOOL_DEFS.some((d) => /printful|ooshirts|gildan|bella|canon|nikon|sony|apple|iphone|adobe|figma/i.test(d.description)));

// ---- logo placement
let r = await call("get_logo_placement", { garment: "tee", size: "L", location: "left-chest", aspect: 2 }), s = r.structuredContent;
t("left chest L tee: rec box, max box ≥ rec, offset from centre > 0, below collar > 0", !r.isError && s.rec.w > 0 && s.max.w >= s.rec.w && s.max.h >= s.rec.h && s.fromCenter > 0 && s.below > 0, s);
t("left chest typical width 3-5 in (common guidance 3.5-4 in)", s.rec.w >= 3 && s.rec.w <= 5, s.rec);
t("aspect 2 fit = largest 2:1 box inside rec", s.fit && near(s.fit.w / s.fit.h, 2, 0.02) && s.fit.w <= s.rec.w + 1e-9 && s.fit.h <= s.rec.h + 1e-9 && (near(s.fit.w, s.rec.w, 0.01) || near(s.fit.h, s.rec.h, 0.01)), s.fit);
t("text says typical, not a standard; page link", /typical/i.test(txt(r)) && /shirt-logo-placement\//.test(txt(r)));
let rc = (await call("get_logo_placement", { garment: "tee", size: "L", location: "left-chest", unit: "cm" })).structuredContent;
t("cm = in × 2.54 (rec width, ±0.1)", near(rc.rec.w, s.rec.w * 2.54, 0.1), [rc.rec.w, s.rec.w]);
const ff = (await call("get_logo_placement", { size: "L", location: "full-front" })).structuredContent, fy = (await call("get_logo_placement", { size: "YS", location: "full-front" })).structuredContent;
t("full front: centred, larger than left chest, youth smaller than adult", ff.fromCenter === 0 && ff.rec.w > s.rec.w && fy.rec.w < ff.rec.w, [ff.rec, fy.rec]);
r = await call("get_logo_placement", { location: "all", size: "M" });
t("location all: table with ≥ 8 rows", !r.isError && r.structuredContent.rows.length >= 8 && /\| Location \|/.test(txt(r)), r.structuredContent.rows.length);
r = await call("get_logo_placement", { location: "left-chest", format: "svg" });
t("svg diagram returned", svgOk(r.structuredContent.svg));
r = await call("get_logo_placement", { garment: "tank", location: "hood" });
t("hood on a tank -> isError (location not on that garment)", r.isError === true, txt(r));

// ---- CD case: published trim sizes
const cd = async (a) => (await call("make_cd_case_template", a)).structuredContent;
s = await cd({ part: "front" }); t("jewel front insert 120 × 120 mm, +3 mm bleed = 126", s.trim_w === 120 && s.trim_h === 120 && s.w === 126 && s.h === 126, s);
s = await cd({ part: "tray" }); t("tray card 150 × 118 mm with 2 spines of 6.5 mm (150 = 6.5 + 137 + 6.5), 2 folds", s.trim_w === 150 && s.trim_h === 118 && s.panels.length === 3 && near(s.panels[0].w + s.panels[1].w + s.panels[2].w, 150) && near(s.panels[0].w, 6.5) && s.folds.length === 2, s.panels);
s = await cd({ part: "booklet" }); t("4-page booklet spread 240 × 120 mm", s.trim_w === 240 && s.trim_h === 120, s);
s = await cd({ part: "disc" }); t("disc label: 120 mm disc, centre hole 15 mm", s.round && s.round.hole === 15 && s.round.outer <= 120 && s.round.outer >= 115, s.round);
s = await cd({ part: "dvd" }); t("DVD wrap 273 × 183 mm, 14 mm spine", s.trim_w === 273 && s.trim_h === 183 && s.panels.some((p) => near(p.w, 14)), s);
s = await cd({ part: "front", unit: "in" }); t("inches: 120 mm = 4.724 in (±0.01)", near(s.trim_w, 120 / 25.4, 0.01), s.trim_w);
s = await cd({ part: "tray" }); t("tray SVG true size in mm, has text labels", svgOk(s.svg) && /width="156mm"/.test(s.svg) && /<text/.test(s.svg), (s.svg || "").slice(0, 160));
r = await call("make_cd_case_template", { part: "front", bleed: -2 }); t("negative bleed ignored (default 3 mm)", r.structuredContent.bleed === 3, r.structuredContent.bleed);

// ---- EPP: regular-polygon geometry
s = (await call("make_paper_piecing_template", { shape: "hexagon", side: 1 })).structuredContent;
t("1 in hexagon: point to point 2, flat to flat √3, area 3√3/2", near(s.point_to_point, 2) && near(s.flat_to_flat, Math.sqrt(3), 1e-3) && near(s.area, 3 * Math.sqrt(3) / 2, 1e-3), s);
t("fabric outline = paper grown by 3/8 in seam each side: flat-to-flat + 0.75", near(s.fabric_height, Math.sqrt(3) + 0.75, 2e-3), s.fabric_height);
t("fits several per Letter sheet (honeycomb)", s.per_sheet >= 15, s.per_sheet);
s = (await call("make_paper_piecing_template", { shape: "triangle", side: 2 })).structuredContent;
t("2 in equilateral triangle area √3", near(s.area, Math.sqrt(3), 1e-3), s.area);
s = (await call("make_paper_piecing_template", { shape: "square", side: 3, unit: "cm", seam: 0 })).structuredContent;
t("3 cm square, seam 0: paper = fabric = 3 × 3, area 9", near(s.area, 9) && near(s.fabric_width, 3) && s.seam === 0, s);
s = (await call("make_paper_piecing_template", { shape: "diamond60", side: 1 })).structuredContent;
t("60° diamond angles 60/120/60/120, area sin60", JSON.stringify(s.angles.map(Math.round).sort()) === JSON.stringify([120, 120, 60, 60]) && near(s.area, Math.sin(Math.PI / 3), 1e-3), s);
r = await call("make_paper_piecing_template", { shape: "hexagon", side: 1, count: 100 });
t("fabric estimate for 100 hexies present and > 0", r.structuredContent.fabric && r.structuredContent.fabric.length > 0, r.structuredContent.fabric);
r = await call("make_paper_piecing_template", { shape: "hexagon", side: 1, format: "sheet" });
t("sheet SVG is Letter size", svgOk(r.structuredContent.svg) && /width="8\.5in"/.test(r.structuredContent.svg), (r.structuredContent.svg || "").slice(0, 120));
r = await call("make_paper_piecing_template", { shape: "hexagon", side: -1 }); t("negative side -> default 1 in (not an error)", !r.isError && r.structuredContent.side === 1);

// ---- Voronoi: tiling + determinism
r = await call("make_voronoi_pattern", { width: 200, height: 100, cells: 40, seed: 7, format: "none" }); s = r.structuredContent;
t("40 cells, mean area = frame / cells", s.stats.cells === 40 && near(s.stats.meanArea, 200 * 100 / 40, 1), s.stats);
const v1 = MGDVoronoi.generate({ width: 200, height: 100, cells: 40, seed: 7 }), v2 = MGDVoronoi.generate({ width: 200, height: 100, cells: 40, seed: 7 });
const sumA = v1.cells.reduce((a, c) => a + Math.abs(c.area), 0);
t("cells tile the frame (Σ area = 20,000 ± 0.5%)", Math.abs(sumA - 20000) / 20000 < 0.005, sumA);
t("same seed → identical SVG; other seed differs", MGDVoronoi.svg(v1) === MGDVoronoi.svg(v2) && MGDVoronoi.svg(v1) !== MGDVoronoi.svg(MGDVoronoi.generate({ width: 200, height: 100, cells: 40, seed: 8 })));
const convex = (p) => { let sg = 0; for (let i = 0; i < p.length; i++) { const a = p[i], b = p[(i + 1) % p.length], c = p[(i + 2) % p.length]; const z = (b[0] - a[0]) * (c[1] - b[1]) - (b[1] - a[1]) * (c[0] - b[0]); if (Math.abs(z) < 1e-9) continue; if (!sg) sg = Math.sign(z); else if (Math.sign(z) !== sg) return false; } return true; };
t("every cell convex and inside the frame", v1.cells.every((c) => convex(c.poly) && c.poly.every(([x, y]) => x >= -1e-6 && x <= 200 + 1e-6 && y >= -1e-6 && y <= 100 + 1e-6)));
r = await call("make_voronoi_pattern", { cells: 30, mode: "lattice", web: 3, format: "cut" });
t("lattice cut SVG: hairline red outlines, no fill", svgOk(r.structuredContent.svg) && /#ff0000/i.test(r.structuredContent.svg) && r.structuredContent.stats.holes > 0, r.structuredContent.stats);
r = await call("make_voronoi_pattern", { cells: 30, format: "dxf" });
t("DXF R12 with POLYLINE entities and EOF", /SECTION/.test(r.structuredContent.dxf) && /POLYLINE/.test(r.structuredContent.dxf) && /EOF\s*$/.test(r.structuredContent.dxf));
r = await call("make_voronoi_pattern", { cells: 99999 }); t("cells over the limit -> isError", r.isError === true, txt(r).slice(0, 120));
r = await call("make_voronoi_pattern", { cells: 12, colors: ["#ff0000", "javascript:x", "#00ff00"], format: "svg" });
t("bad colour strings dropped, SVG safe", !r.isError && svgOk(r.structuredContent.svg) && !/javascript/.test(r.structuredContent.svg));

// ---- SVG path
r = await call("edit_svg_path", { d: "M10 10 h20 v20 h-20 z" }); s = r.structuredContent;
t("info: square bbox 10,10 20×20, length 80, closed", near(s.bbox.x, 10) && near(s.bbox.width, 20) && near(s.length, 80) && s.closed === true, s);
r = await call("edit_svg_path", { d: "M10 10 h20 v20 h-20 z", op: "transform", translate: [5, -5] }); s = r.structuredContent;
t("translate (5,-5): bbox moves to 15,5; size and length unchanged", near(s.bbox.x, 15) && near(s.bbox.y, 5) && near(s.bbox.width, 20) && near(s.length, 80), s.bbox);
r = await call("edit_svg_path", { d: "M10 10 h20 v20 h-20 z", op: "transform", scale: [2, 2] }); s = r.structuredContent;
t("scale 2 about the bbox centre (20,20): bbox 0,0 40×40, length 160", near(s.bbox.x, 0) && near(s.bbox.width, 40) && near(s.length, 160), s);
const circ = "M0 50 A50 50 0 1 0 100 50 A50 50 0 1 0 0 50 Z";
s = (await call("edit_svg_path", { d: circ })).structuredContent;
t("circle r=50 via 2 arcs: bbox 100×100, length 2πr", near(s.bbox.width, 100, 1e-3) && near(s.bbox.height, 100, 1e-3) && near(s.length, 2 * Math.PI * 50, 1e-3), s);
s = (await call("edit_svg_path", { d: circ, op: "transform", scale: [2, 1] })).structuredContent;
t("non-uniform scale of a circle → ellipse 200×100 (arcs handled)", near(s.bbox.width, 200, 1e-2) && near(s.bbox.height, 100, 1e-2), s.bbox);
s = (await call("edit_svg_path", { d: "M0 0 C0 100 100 100 100 0" })).structuredContent;
t("cubic extrema: bbox height = 75 (max of the Bézier at t=0.5)", near(s.bbox.height, 75, 1e-6), s.bbox);
const rel = (await call("edit_svg_path", { d: "M10 10 L30 10 L30 30 Z", op: "relative" })).structuredContent.d, back = (await call("edit_svg_path", { d: rel, op: "absolute" })).structuredContent;
t("relative → absolute round-trip keeps bbox", near(back.bbox.x, 10) && near(back.bbox.width, 20) && /^m/.test(rel.trim()), [rel, back.d]);
r = await call("edit_svg_path", { d: "M1.23456 2.34567 L3 4", op: "round", decimals: 1 }); t("round to 1 decimal", /M ?1\.2 ?2\.3/.test(r.structuredContent.d), r.structuredContent.d);
r = await call("edit_svg_path", { d: "M10 10 Q" }); t("broken path -> isError", r.isError === true);
r = await call("edit_svg_path", {}); t("missing d -> isError", r.isError === true);

// ---- depth of field: thin-lens, re-derived
const dofRef = (f, N, sMm, c) => { const H = f * f / (N * c) + f; return { H, near: sMm * (H - f) / (H + sMm - 2 * f), far: sMm >= H ? Infinity : sMm * (H - f) / (H - sMm) }; };
r = await call("calc_depth_of_field", { focal: 50, aperture: 8, distance: 3, coc: 0.03 }); s = r.structuredContent; let ref = dofRef(50, 8, 3000, 0.03);
t("50 mm f/8 at 3 m, CoC 0.03: near/far/hyperfocal match thin-lens (±1 mm)", near(s.near, ref.near / 1000, 0.002) && near(s.far, ref.far / 1000, 0.002) && near(s.hyperfocal, ref.H / 1000, 0.002), [s.near, s.far, s.hyperfocal, ref]);
t("…which is ≈ 2.34 m to 4.18 m, hyperfocal ≈ 10.47 m (as online DOF tables give for CoC 0.03)", near(s.near, 2.34, 0.01) && near(s.far, 4.18, 0.01) && near(s.hyperfocal, 10.47, 0.1), [s.near, s.far, s.hyperfocal]);
r = await call("calc_depth_of_field", { focal: 24, aperture: 11, distance: 5 }); s = r.structuredContent;
t("24 mm f/11 at 5 m full frame: beyond hyperfocal → far = infinity", s.far === "infinity" && s.total === "infinity" && /infinity/.test(txt(r)), s);
const apsc = (await call("calc_depth_of_field", { focal: 50, aperture: 8, distance: 3, sensor: "apsc15" })).structuredContent, ffs = (await call("calc_depth_of_field", { focal: 50, aperture: 8, distance: 3 })).structuredContent;
t("same lens on APS-C (smaller CoC) → shallower DOF than full frame", apsc.coc < ffs.coc && apsc.total < ffs.total, [apsc.coc, ffs.coc, apsc.total, ffs.total]);
r = await call("calc_depth_of_field", { focal: 50, aperture: 8, distance: 10, unit: "ft", table: true }); s = r.structuredContent;
t("feet + table across 9 apertures", s.unit === "ft" && Array.isArray(s.table) && s.table.length === 9 && /\| f\/ \|/.test(txt(r)), s.table && s.table.length);
r = await call("calc_depth_of_field", { focal: 50, aperture: 8 }); t("missing distance -> isError", r.isError === true);
r = await call("calc_depth_of_field", { focal: 50, aperture: 8, distance: 0.02 }); t("distance inside the focal length -> isError", r.isError === true, txt(r).slice(0, 120));

// ---- every successful answer links its page with the right slug
const PAGES = { get_logo_placement: "shirt-logo-placement", make_cd_case_template: "cd-case-template", make_paper_piecing_template: "english-paper-piecing-templates",
  make_voronoi_pattern: "voronoi-generator", edit_svg_path: "svg-path-editor", calc_depth_of_field: "depth-of-field-calculator" };
const SAMPLE = { get_logo_placement: {}, make_cd_case_template: { format: "none" }, make_paper_piecing_template: { format: "none" }, make_voronoi_pattern: { format: "none" }, edit_svg_path: { d: "M0 0L1 1" }, calc_depth_of_field: { focal: 35, aperture: 4, distance: 2 } };
for (const n of NAMES) { const x = await call(n, SAMPLE[n]); t(`${n}: page link https://madegooddesigns.com/tools/${PAGES[n]}/`, !x.isError && x.structuredContent.page === `https://madegooddesigns.com/tools/${PAGES[n]}/` && txt(x).includes(PAGES[n])); }
t("non-object args handled", (await call("calc_depth_of_field", null)).isError === true && (await call("nope", {})).isError === true);
console.log(`\n${ok} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
