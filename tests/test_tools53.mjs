// Node unit test of the batch-53 MCP layer (src/tools_core53.js generated core + src/mcp_tools53.js: make_dieline).
// Run: node tests/test_tools53.mjs   (prints "N passed, M failed", exits 1 on failure)
import { MGDFold } from "../src/tools_core53.js";
import { callTools53Tool, TOOL_DEFS, NEXT53, isTools53Tool } from "../src/mcp_tools53.js";
let ok = 0, fail = 0;
const t = (name, cond, info) => { cond ? ok++ : fail++; console.log((cond ? "PASS " : "FAIL ") + name + (cond ? "" : " | " + String(JSON.stringify(info)).slice(0, 400))); };
const txt = (r) => r.content.map((c) => c.text).join("\n");
const near = (a, b, e = 1e-6) => Math.abs(a - b) <= e;
t("no window global leaked", typeof globalThis.window === "undefined");
const d = TOOL_DEFS[0], size = JSON.stringify(d).length;
t("1 tool, 'Use when', next hint, read-only", TOOL_DEFS.length === 1 && d.name === "make_dieline" && d.description.startsWith("Use when") && NEXT53.make_dieline && d.annotations.readOnlyHint);
t("description < 650 chars, definition ≤ 1.6 KB", d.description.length < 650 && size <= 1640, [d.description.length, size]);
t("isTools53Tool", isTools53Tool("make_dieline") && !isTools53Tool("make_box_template"));
t("core bundled with polygon-clipping (bleed works)", MGDFold && MGDFold.structure({ structure: "rte" }).bleed.length === 1);

let r = await callTools53Tool("make_dieline", { length: 80, width: 40, height: 120 }), s = r.structuredContent;
t("default: reverse tuck end, 16 pt, inside 80×40×120 → crease +0.41, outside +0.81", !r.isError && s.structure === "rte" && near(s.board_mm, 0.406) && s.dims.crease[0] === 80.41 && s.dims.outside[2] === 120.81, s && s.dims);
t("panels: back 80.41 × 120.41, glue flap 12 mm, 13 pieces", s.panels.length === 13 && s.panels[0].w === 80.41 && s.panels[0].h === 120.41 && s.panels.find((p) => p.role === "glue").w === 12, s.panels.slice(0, 2));
t("SVG inline, true size in mm, cut/crease/bleed groups", /width="265\.626mm"/.test(s.svg) && /id="cut"/.test(s.svg) && /id="crease"/.test(s.svg) && /id="bleed"/.test(s.svg), (s.svg || "").slice(0, 200));
t("text: fold check, sheets, page link, print-at-100% guidance", /Fold check passed/.test(txt(r)) && /fits tabloid, a3/.test(txt(r)) && /tools\/dieline-generator\//.test(txt(r)) && /100%/.test(txt(r)), txt(r).slice(0, 600));
r = await callTools53Tool("make_dieline", { structure: "rsc", length: 12, width: 9, height: 6, unit: "in", format: "dxf" }); s = r.structuredContent;
t("RSC 12×9×6 in defaults to B-flute 3.2 mm; flap = W/2", s.board_mm === 3.2 && near(s.panels.find((p) => p.role === "flap" || /flap/i.test(p.name)).h, (9 * 25.4 + 3.2) / 2 / 25.4, 0.01), s.panels.slice(4, 6));
t("DXF R12 with CUT/CREASE/BLEED layers, no svg", /AC1009/.test(s.dxf) && /\nCUT\r?\n/.test(s.dxf) && /CREASE/.test(s.dxf) && /BLEED/.test(s.dxf) && !s.svg);
t("RSC page link + FEFCO 0201 ref", s.ref === "FEFCO 0201" && /dieline-generator/.test(s.page));
r = await callTools53Tool("make_dieline", { structure: "rte", length: 2, width: 1.5, height: 3, unit: "in", board: "cardstock-65lb", format: "svg" }); s = r.structuredContent;
const m = s.svg.match(/width="([\d.]+)mm"/), flatmm = s.flat[0] * 25.4;
t("inch mode: bleed stays 3 mm (SVG = flat + 2×(3+3) mm)", m && near(+m[1], flatmm + 12, 0.02), [m && m[1], flatmm]);
t("inch mode: fits letter", s.fits_sheets.includes("letter"), s.fits_sheets);
r = await callTools53Tool("make_dieline", { structure: "ste", length: 60, width: 25, height: 100, board: "0.5", basis: "outside", format: "none" }); s = r.structuredContent;
t("custom board 0.5 mm + outside basis → crease = outside − t", s.board_mm === 0.5 && s.dims.crease[0] === 59.5 && !s.svg && !s.dxf, s.dims);
for (const st of ["tray", "lidbase", "sleeve", "matchbox", "pillow", "cuboid"]) {
  r = await callTools53Tool("make_dieline", { structure: st, length: 100, width: 70, height: st === "pillow" ? 12 : 40, format: "none" });
  t(`${st}: builds + fold check`, !r.isError && r.structuredContent.fold_check && /Fold check passed/.test(txt(r)), txt(r).slice(0, 300));
}
r = await callTools53Tool("make_dieline", { length: 80, width: 40, height: 120, bleed_mm: 0 }); t("bleed 0 → no bleed group content", !/id="bleed"/.test(r.structuredContent.svg) || !/<g id="bleed"[^>]*><path/.test(r.structuredContent.svg));
t("bad size → isError", (await callTools53Tool("make_dieline", { length: -1, width: 2, height: 3 })).isError);
t("missing size → isError", (await callTools53Tool("make_dieline", { length: 10 })).isError);
t("unknown structure → isError listing structures", /rte, ste, rsc/.test(txt(await callTools53Tool("make_dieline", { structure: "pizza", length: 1, width: 1, height: 1 }))));
t("unknown board → isError", (await callTools53Tool("make_dieline", { length: 80, width: 40, height: 120, board: "unobtainium" })).isError);
t("too small after allowance → isError", (await callTools53Tool("make_dieline", { structure: "rsc", length: 4, width: 40, height: 40, basis: "outside" })).isError);
r = await callTools53Tool("make_dieline", { structure: "rsc", length: 1500, width: 1000, height: 1000, format: "svg" });
t("huge box: still small output (SVG is a few KB)", !r.isError && JSON.stringify(r).length < 40000, JSON.stringify(r).length);
r = await callTools53Tool("make_dieline", { structure: "pillow", length: 6, width: 3, height: 0.5, unit: "in", format: "none" });
t("pillow in inches: panel 3.01 × 6.01 in, curve 0.5 in", /Each panel 3\.01 × 6\.01 in/.test(txt(r)) && /end curves 0\.5 in deep/.test(txt(r)), txt(r).slice(0, 300));
r = await callTools53Tool("make_dieline", { structure: "rte", length: 2, width: 1.5, height: 3, unit: "in", format: "none" }); s = r.structuredContent;
t("inch mode: cut/crease lengths labelled in inches, structured in mm", /Cut line [\d.]+ in, crease line [\d.]+ in/.test(txt(r)) && s.cut_length_mm > 800 && s.cut_length_mm < 900, [s.cut_length_mm, txt(r).slice(0, 400)]);
console.log(`${ok} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
