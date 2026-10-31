// Node unit test of the batch-51 MCP layer (src/tools_core51.js generated cores + src/mcp_tools51.js).
// Run: node tests/test_tools51.mjs   (prints "N passed, M failed", exits 1 on failure)
import * as C from "../src/tools_core51.js";
import { callTools51Tool, TOOL_DEFS, NEXT51, isTools51Tool } from "../src/mcp_tools51.js";
const { MGDMesh } = C;
let ok = 0, fail = 0;
const t = (name, cond, info) => { cond ? ok++ : fail++; console.log((cond ? "PASS " : "FAIL ") + name + (cond ? "" : " | " + String(JSON.stringify(info)).slice(0, 400))); };
const txt = (r) => r.content.map((c) => c.text).join("\n");
const near = (a, b, e = 1e-6) => Math.abs(a - b) <= e;
t("no window global leaked", typeof globalThis.window === "undefined");
t("every tool: 'Use when' + next-step hint + inputSchema object", TOOL_DEFS.length >= 1 && TOOL_DEFS.every((d) => d.description.startsWith("Use when") && NEXT51[d.name] && d.inputSchema.type === "object" && d.annotations && d.annotations.readOnlyHint), TOOL_DEFS.map((d) => d.name));
t("isTools51Tool", isTools51Tool("make_extruded_part") && !isTools51Tool("get_book_cover_size"));

// ---- make_extruded_part
let r = await callTools51Tool("make_extruded_part", { polygons: [[[0, 0], [60, 0], [60, 15], [0, 15]]], thickness_mm: 3, format: "stl_ascii", name: "bar" });
let sc = r.structuredContent;
t("polygon bar: 60 × 15 × 3 mm, volume 2700 mm³, watertight", !r.isError && sc.dims_mm.w === 60 && sc.dims_mm.h === 15 && sc.dims_mm.t === 3 && near(sc.volume_mm3, 2700, 1e-3) && sc.watertight, sc);
const back = MGDMesh.parseSTL(new TextEncoder().encode(sc.file.stl)), ab = MGDMesh.analyze(back.mesh);
t("returned ASCII STL parses back watertight, same volume", back.format === "stl-ascii" && ab.watertight && near(ab.volume, 2700, 0.01), ab);
t("file name carries mm size", sc.file.filename === "bar-60x15x3mm.stl", sc.file.filename);
r = await callTools51Tool("make_extruded_part", { polygons: [[[[0, 0], [40, 0], [40, 20], [0, 20]], [[10, 5], [30, 5], [30, 15], [10, 15]]]], thickness_mm: 2, format: "stl_base64" });
sc = r.structuredContent;
const bin = MGDMesh.fromBase64(sc.file.base64), ap = MGDMesh.analyze(MGDMesh.parseSTL(bin).mesh);
t("frame with hole (evenodd), base64 binary STL: volume (800 − 200) × 2", near(ap.volume, 1200, 0.01) && ap.watertight && bin.length === sc.file.bytes, ap.volume);
r = await callTools51Tool("make_extruded_part", { polygons: [[[0, 0], [100, 0], [100, 14], [0, 14]]], thickness_mm: 4, holes: [{ x: 10, y: 7, d: 4, pin: true }], pins: [{ d: 4, length: 9 }], loops: [{ x: 60, y: 24, d_inner: 20, wall: 3 }], format: "3mf_base64" });
sc = r.structuredContent;
const p3 = await MGDMesh.parse3MF(MGDMesh.fromBase64(sc.file.base64)), a3 = MGDMesh.analyze(p3.mesh);
t("handle + loop + hole + pin → 3MF: 2 objects, mm, watertight, main part 4 mm thick", p3.objects === 2 && p3.unit === "millimeter" && a3.watertight && a3.shells === 2 && sc.dims_mm.t === 4 && sc.overall_mm.t === 9, { o: p3.objects, sc: sc.dims_mm });
for (const style of ["raised", "engraved", "keychain"]) {
  r = await callTools51Tool("make_extruded_part", { polygons: [[[0, 0], [30, 0], [30, 10], [0, 10]]], style, format: "none" });
  t(`style ${style}: watertight, no file`, !r.isError && r.structuredContent.watertight && !r.structuredContent.file.stl, r.structuredContent && r.structuredContent.warnings);
}
r = await callTools51Tool("make_extruded_part", { polygons: [[[0, 0], [10, 0], [10, 5], [0, 5]]], width_mm: 50, format: "none" });
t("width_mm scales to 50 × 25", r.structuredContent.dims_mm.w === 50 && r.structuredContent.dims_mm.h === 25, r.structuredContent.dims_mm);
r = await callTools51Tool("make_extruded_part", { polygons: [[[[0, 0], [40, 0], [40, 0.6], [0, 0.6]]], [[[0, 5], [40, 5], [40, 10], [0, 10]]]], format: "none" });
t("hairline strip → min-wall warning in text", /narrower than 1.2 mm/.test(txt(r)) && r.structuredContent.thin.ok === false);
r = await callTools51Tool("make_extruded_part", {});
t("no input → isError with an example", r.isError && /polygons/.test(txt(r)));
r = await callTools51Tool("make_extruded_part", { polygons: [[[0, 0], [1, 1]]] });
t("degenerate ring → isError (no throw)", r.isError);
r = await callTools51Tool("make_extruded_part", { polygons: [[[0, 0], [60, 0], [60, 15], [0, 15]]] });
t("text has SVG preview + STL fence + web link", /```svg/.test(txt(r)) && /```stl/.test(txt(r)) && /tools\/svg-to-stl\//.test(txt(r)));
// ---- analyze_3d_model
const cube = MGDMesh.box(0, 0, 0, 20, 20, 20);
r = await callTools51Tool("analyze_3d_model", { model_text: MGDMesh.toSTLAscii(cube, "cube"), material: "pla" });
sc = r.structuredContent;
t("analyze 20 mm cube: dims 20×20×20, volume 8000, watertight, cost/weight text", !r.isError && /20 × 20 × 20 mm/.test(txt(r)) && /volume 8 cm³/.test(txt(r)) && /watertight and manifold/.test(txt(r)) && /Estimated PLA/.test(txt(r)), txt(r).slice(0, 300));
r = await callTools51Tool("analyze_3d_model", { file_base64: MGDMesh.toBase64(MGDMesh.toSTL(cube, "cube")) });
t("analyze binary STL base64 works", !r.isError && /20 × 20 × 20 mm/.test(txt(r)) && /volume 8 cm³/.test(txt(r)), txt(r).slice(0, 200));
r = await callTools51Tool("analyze_3d_model", { model_text: "solid x\nendsolid x" });
t("analyze empty STL → isError", r.isError, txt(r));
r = await callTools51Tool("analyze_3d_model", {});
t("analyze no input → isError", r.isError);

// ---- get_print_clearance
r = await callTools51Tool("get_print_clearance", {});
t("clearance table: markdown + sources", !r.isError && /\| process \| fit/.test(txt(r)) && /Sources:/.test(txt(r)) && r.structuredContent.rows.length >= 4);
r = await callTools51Tool("get_print_clearance", { process: "fdm", fit: "sliding", nominal_mm: 5 });
sc = r.structuredContent;
t("fdm sliding 5 mm pin: hole > 5, pin = 5, sources", !r.isError && sc.pin_mm === 5 && sc.hole_mm > 5 && sc.sources.length > 0, sc);

// ---- get_screw_specs
r = await callTools51Tool("get_screw_specs", { size: "M3" });
t("M3: pitch 0.5, tap drill 2.5, sources", !r.isError && /0\.5/.test(txt(r)) && /2\.5/.test(txt(r)) && /Sources:/.test(txt(r)), txt(r).slice(0, 300));
r = await callTools51Tool("get_screw_specs", { size: "1/4-20" });
t("1/4-20 (UNC) found, 20 TPI", !r.isError && /20/.test(txt(r)), txt(r).slice(0, 200));
r = await callTools51Tool("get_screw_specs", { size: "M7.3" });
t("bogus size → isError", r.isError, txt(r));
r = await callTools51Tool("get_screw_specs", {});
t("no input → isError", r.isError);

// ---- get_hand_anthropometrics
r = await callTools51Tool("get_hand_anthropometrics", { measure: "handlength", value: 190, sex: "male" });
t("hand length 190 mm male → percentile leads, ANSUR source", !r.isError && /^\*\*/.test(txt(r)) && /ANSUR/.test(txt(r)), txt(r).slice(0, 300));
r = await callTools51Tool("get_hand_anthropometrics", { grip: true, hand_length: 180 });
t("grip guidance for 180 mm hand", !r.isError && /grip/i.test(txt(r)));
r = await callTools51Tool("get_hand_anthropometrics", { measure: "noselength" });
t("unknown measure → isError listing measures", r.isError && /handlength/.test(txt(r)), txt(r));

// ---- make_box_template
r = await callTools51Tool("make_box_template", { width: 100, depth: 60, height: 40, thickness: 3 });
sc = r.structuredContent;
t("laser box 100×60×40: 6 panels, SVG returned in mm, kerf 0.2", !r.isError && sc.panels.length === 6 && /^<svg|<\?xml/.test(sc.svg) && /mm"/.test(sc.svg) && sc.dims.kerf === 0.2 && /```xml/.test(txt(r)), sc && sc.dims);
t("laser box: bottom cut size 100.2 × 60.2 (kerf/2 each edge)", sc.panels.some((p) => p.name === "Bottom" && near(p.w, 100.2, 1e-6) && near(p.h, 60.2, 1e-6)), sc.panels);
r = await callTools51Tool("make_box_template", { width: 100, depth: 60, height: 40, format: "dxf", style: "lid", dividers_x: 1 });
t("laser box DXF (R12), lid + divider", !r.isError && /SECTION/.test(r.structuredContent.dxf) && /EOF/.test(r.structuredContent.dxf) && r.structuredContent.dims.style === "lid", txt(r).slice(0, 300));
r = await callTools51Tool("make_box_template", { width: 10, depth: 10, height: 10, thickness: 5 });
t("too-small laser box → isError", r.isError, txt(r));
r = await callTools51Tool("make_box_template", { kind: "enclosure", length: 60, width: 40, height: 20 });
sc = r.structuredContent;
t("enclosure dims only: outer 64×44×22, no file", !r.isError && sc.dims.outer.join() === "64,44,22" && !sc.base64 && /enclosure-generator/.test(txt(r)), sc && sc.dims);
r = await callTools51Tool("make_box_template", { kind: "enclosure", length: 60, width: 40, height: 20, lid: "screw", screw: "M3", cutouts: [{ face: "front", shape: "rect", x: 30, z: 10, w: 12, h: 6 }], format: "3mf_base64" });
sc = r.structuredContent;
const e3 = sc.base64 ? await MGDMesh.parse3MF(MGDMesh.fromBase64(sc.base64)) : null;
t("screw enclosure 3MF: 2 objects, mm, both parts watertight, screw data", !r.isError && e3 && e3.objects === 2 && e3.unit === "millimeter" && MGDMesh.analyze(e3.mesh).watertight && sc.parts.every((p) => p.watertight) && sc.screw && sc.screw.size === "M3", { s: sc && sc.screw, p: sc && sc.parts, tb: sc && sc.too_big });
r = await callTools51Tool("make_box_template", { kind: "enclosure", length: 60, width: 40, height: 20, lid: "screw", cutouts: [{ face: "front", shape: "round", x: 30, z: 10, d: 8 }], format: "3mf_base64" });
t("dense enclosure → too_big hint, not an error, no base64", !r.isError && r.structuredContent.too_big && /stl_base64/.test(r.structuredContent.too_big) && !r.structuredContent.base64, txt(r).slice(0, 300));
r = await callTools51Tool("make_box_template", { kind: "enclosure", length: 1, width: 1, height: 1 });
t("too-small enclosure → isError", r.isError, txt(r));

// ---- make_gear
r = await callTools51Tool("make_gear", { module: 2, teeth: 20 });
sc = r.structuredContent;
t("gear m2 z20: pitch 40, tip 44, root 35", !r.isError && sc.dims.pitchDiameter === 40 && sc.dims.tipDiameter === 44 && sc.dims.rootDiameter === 35, sc && sc.dims);
r = await callTools51Tool("make_gear", { module: 2, teeth: 20, teeth2: 40, format: "svg" });
sc = r.structuredContent;
t("pair 20:40: centre 60, ratio 2, contact ratio ~1.635, SVG", !r.isError && sc.dims.centreDistance === 60 && sc.dims.ratio === 2 && near(sc.dims.contactRatio, 1.635, 0.01) && /<svg/.test(sc.svg), sc && sc.dims);
r = await callTools51Tool("make_gear", { module: 2, teeth: 20, bore: 6, thickness: 8, format: "stl_base64" });
sc = r.structuredContent;
const gm = MGDMesh.parseSTL(MGDMesh.fromBase64(sc.base64)).mesh, ga = MGDMesh.analyze(gm);
let gx = 0; for (let i = 0; i < gm.pos.length; i += 3) gx = Math.max(gx, Math.hypot(gm.pos[i], gm.pos[i + 1]));
t("gear STL: watertight, 1 shell, tip radius 22 ±0.02", ga.watertight && ga.shells === 1 && near(gx, 22, 0.02), { a: ga, gx });
r = await callTools51Tool("make_gear", { dp: 12, teeth: 24 });
t("DP 12, 24 teeth: tip Ø 55.033", !r.isError && near(r.structuredContent.dims.tipDiameter, 55.0333, 0.001), r.structuredContent && r.structuredContent.dims);
r = await callTools51Tool("make_gear", { module: 2, teeth: 10 });
t("10 teeth at 20° → undercut warning", !r.isError && /undercut/i.test(txt(r)));
r = await callTools51Tool("make_gear", { module: 1, teeth: 12, bore: 20 });
t("bore through the root → isError", r.isError, txt(r));
r = await callTools51Tool("make_gear", { module: 2, teeth: 20, format: "dxf" });
t("gear DXF in mm", !r.isError && /SECTION/.test(r.structuredContent.dxf));

// ---- STEP output (our own faceted AP214 writer)
const stepRefsOK = (s) => { const ids = new Set([...s.matchAll(/^#(\d+)=/gm)].map((m) => m[1])); return s.startsWith("ISO-10303-21;") && /END-ISO-10303-21;\s*$/.test(s) && [...s.matchAll(/#(\d+)/g)].every((m) => ids.has(m[1])); };
r = await callTools51Tool("make_extruded_part", { polygons: [[[[0, 0], [40, 0], [40, 20], [0, 20]], [[10, 5], [30, 5], [30, 15], [10, 15]]]], thickness_mm: 2, format: "step" });
sc = r.structuredContent;
t("extruded frame → STEP: AP214, mm, 1 solid, 10 faces (holes as inner loops), refs intact, fenced in text", !r.isError && sc.file.step && /AUTOMOTIVE_DESIGN/.test(sc.file.step) && /SI_UNIT\(\.MILLI\.,\.METRE\.\)/.test(sc.file.step) && sc.file.step_stats.solids === 1 && sc.file.step_stats.faces === 10 && stepRefsOK(sc.file.step) && /```step/.test(txt(r)) && sc.file.filename.endsWith(".step"), sc.file.step_stats);
r = await callTools51Tool("make_box_template", { kind: "enclosure", length: 60, width: 40, height: 20, format: "step" });
sc = r.structuredContent;
t("enclosure → STEP: 2 named solids (Box, Lid), refs intact", !r.isError && sc.step && (sc.step.match(/MANIFOLD_SOLID_BREP\(/g) || []).length === 2 && /'Box'/.test(sc.step) && /'Lid'/.test(sc.step) && stepRefsOK(sc.step), sc && (sc.too_big || sc.step_stats));
r = await callTools51Tool("make_box_template", { kind: "enclosure", length: 60, width: 40, height: 20, lid: "screw", cutouts: [{ face: "front", shape: "round", x: 30, z: 10, d: 8 }], format: "step" });
t("dense enclosure → STEP too_big hint, not an error", !r.isError && r.structuredContent.too_big && !r.structuredContent.step, txt(r).slice(0, 200));
t("all 7 tools registered", ["make_extruded_part", "analyze_3d_model", "get_print_clearance", "make_box_template", "make_gear", "get_screw_specs", "get_hand_anthropometrics"].every(isTools51Tool) && TOOL_DEFS.length === 7);
console.log(`${ok} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
