// Node unit test of the batch-64 MCP layer (src/tools_core64.js generated cores + src/mcp_tools64.js).
// Tools: calc_quilt, calc_fabric_yardage, optimize_cut_list, make_jigsaw_puzzle, convert_drawing_scale.
// Numbers are re-derived here from the published formulas, not copied from the core. Run: node tests/test_tools64.mjs (exit 1 on failure)
import { MGDQuilt, MGDFabric, MGDCutList, MGDJigsaw, MGDScale } from "../src/tools_core64.js";
import { callTools64Tool as call, TOOL_DEFS, NEXT64, isTools64Tool } from "../src/mcp_tools64.js";
let ok = 0, fail = 0;
const t = (name, cond, info) => { cond ? ok++ : fail++; console.log((cond ? "PASS " : "FAIL ") + name + (cond ? "" : " | " + String(JSON.stringify(info)).slice(0, 400))); };
const txt = (r) => r.content.map((c) => c.text).join("\n");
const near = (a, b, e = 1e-3) => Math.abs(a - b) <= e;
const ydUp = (inch) => Math.ceil(inch / 36 * 8 - 1e-9) / 8;
const NAMES = ["calc_quilt", "calc_fabric_yardage", "optimize_cut_list", "make_jigsaw_puzzle", "convert_drawing_scale"];

t("no window global leaked", typeof globalThis.window === "undefined");
t("all 5 cores bundled", [MGDQuilt, MGDFabric, MGDCutList, MGDJigsaw, MGDScale].every((x) => x && typeof x === "object"));
t("5 tools in order", JSON.stringify(TOOL_DEFS.map((d) => d.name)) === JSON.stringify(NAMES), TOOL_DEFS.map((d) => d.name));
for (const d of TOOL_DEFS) {
  const size = JSON.stringify(d).length;
  t(`${d.name}: 'Use when', < 650 chars, ≤ 1.6 KB, read-only, next hint, object schema`, d.description.startsWith("Use when") && d.description.length < 650 && size <= 1640 && d.annotations.readOnlyHint && !d.annotations.openWorldHint && NEXT64[d.name] && d.inputSchema.type === "object", [d.description.length, size]);
}
t("isTools64Tool", NAMES.every(isTools64Tool) && !isTools64Tool("make_cone_pattern"));

// ---- quilt size: bed = mattress W + 2·drop; L = mattress L + drop + pillow tuck. Queen 60×80, drop 12, tuck 10 → 84 × 102
let r = await call("calc_quilt", { what: "size", bed: "queen" }), s = r.structuredContent;
t("queen bed: 60+2·12 = 84 wide, 80+12+10 = 102 long", !r.isError && s.width === 84 && s.length === 102, [s.width, s.length]);
r = await call("calc_quilt", { what: "size", bed: "king", drop: 10 }); s = r.structuredContent;
t("king 76×80 with drop 10: 96 × 100", s.width === 96 && s.length === 100, [s.width, s.length]);
// blocks: inner = cols·block + (cols−1)·sash + 2·sash (frame); finished = inner + 2·Σborders
r = await call("calc_quilt", { cols: 5, rows: 6, block: 12, sashing: 2, borders: [3, 5] }); s = r.structuredContent;
t("blocks 5×6 of 12 + 2 sashing framed + borders 3,5: 5·12+6·2+16 = 88 × 6·12+7·2+16 = 102", s.size.width === 88 && s.size.length === 102, [s.size.width, s.size.length]);
const blocks = s.cutting.find((c) => /Blocks/.test(c.item));
t("30 block squares cut at 12 1/2 in (finished + 2 × 1/4 seam)", blocks && /30 squares 12 1\/2/.test(blocks.cut), blocks);
const sash = s.cutting.find((c) => /Sashing/.test(c.item)), corner = s.cutting.find((c) => /Cornerstones/.test(c.item));
t("sashing pieces = (cols+1)·rows + (rows+1)·cols = 36+35 = 71; cornerstones (cols+1)(rows+1) = 42", sash && /^71 /.test(sash.cut) && corner && /^42 /.test(corner.cut), [sash && sash.cut, corner && corner.cut]);
t("plan text has a cutting table and the page link", /\| Item \| Cut \| Buy \|/.test(txt(r)) && /quilt-calculator\//.test(txt(r)));
// backing: need = quilt + 2·4; panels = 1 + ceil((need − 42)/(42 − 1))
r = await call("calc_quilt", { what: "backing", width: 60, length: 72 }); s = r.structuredContent;
const vPanels = 1 + Math.ceil((68 - 42) / 41), hPanels = 1 + Math.ceil((80 - 42) / 41);
t("backing 60×72: need 68×80; vertical 2 panels × 80, horizontal 2 × 68", s.need.width === 68 && s.need.length === 80 && s.vertical.panels === vPanels && s.horizontal.panels === hPanels, [s.vertical.panels, s.horizontal.panels]);
t("best = horizontal (2·68 = 136 in < 2·80 = 160 in), yards rounded up to 1/8: " + ydUp(136), s.best === "horizontal" && s.horizontal.yards === ydUp(136), s.horizontal);
// binding: length = 2(W+L) + 10; strips = ceil(len / (42 − 2.5)); fabric = strips × 2.5
r = await call("calc_quilt", { what: "binding", width: 60, length: 72 }); s = r.structuredContent;
const bl = 2 * (60 + 72) + 10, strips = Math.ceil(bl / (42 - 2.5));
t(`binding 60×72: ${bl} in, ${strips} strips, ${ydUp(strips * 2.5)} yd`, s.length === bl && s.strips === strips && s.yards === ydUp(strips * 2.5), [s.length, s.strips, s.yards]);
t("bias square ≥ √(length × strip width)", s.bias.squareMin >= Math.sqrt(bl * 2.5) - 0.01 && s.bias.square > s.bias.squareMin, s.bias);
r = await call("calc_quilt", { what: "border", width: 60, length: 72, borders: [4], border_style: "butted" }); s = r.structuredContent;
t("butted 4 in border: cut 4 1/2 in wide; sides = 72, top/bottom = 60 + 8 = 68; grows to 68 × 80", s.borders[0].cutWidth === 4.5 && s.borders[0].strips[0].length === 72 && s.borders[0].strips[2].length === 68 && s.final.width === 68 && s.final.length === 80, s.borders[0]);
r = await call("calc_quilt", { what: "size", unit: "cm", cols: 4, rows: 4, block: 30 }); s = r.structuredContent;
t("cm: 4 × 30 cm blocks = 120 × 120 cm", s.unit === "cm" && s.width === 120 && s.length === 120, [s.unit, s.width]);
t("quilt errors: nothing given, bad bed, backing without size → isError", (await call("calc_quilt", {})).isError && (await call("calc_quilt", { bed: "emperor" })).isError && (await call("calc_quilt", { what: "backing" })).isError);

// ---- fabric yardage: 4 panels 20×30 on 54 in: 2 fit across (40 ≤ 54) → 2 rows of 30 = 60 in; turned 30 across fits only 1 → longer
r = await call("calc_fabric_yardage", { width: 54, pieces: [{ w: 20, h: 30, qty: 4, label: "Panel" }] }); s = r.structuredContent;
t("4 × 20×30 on 54 in: 60 in used, buy 1 3/4 yd (60/36 = 1.667 → 1.75)", near(s.exact, 60) && s.yards === ydUp(60) && s.yards === 1.75, [s.exact, s.yards]);
t("efficiency = 4·600 / (54·60) = 74%", Math.round(s.efficiency) === Math.round(2400 / (54 * 60) * 100), s.efficiency);
r = await call("calc_fabric_yardage", { width: 54, pieces: [{ w: 20, h: 30, qty: 4 }], shrink: 5, extra: 5, format: "svg" }); s = r.structuredContent;
t("+5% shrink +5% margin: buy = 60 × 1.10 = 66 in → 1 7/8 yd; SVG inline", near(s.buy, 66, 0.01) && s.yards === ydUp(66) && /^<svg/.test(s.svg || ""), [s.buy, s.yards]);
r = await call("calc_fabric_yardage", { width: 42, pieces: [{ w: 30, h: 10, qty: 3 }], repeat: 12 }); s = r.structuredContent;
t("repeat 12: each 10 in piece rounds up to 12, 3 rows (30 across fits once) → 36 in = 1 yd", near(s.exact, 36) && s.yards === 1, [s.exact, s.yards]);
r = await call("calc_fabric_yardage", { width: 42, pieces: [{ w: 30, h: 10, qty: 3 }], nap: true }); s = r.structuredContent;
t("nap: never turned", s.placements.every((p) => !p.turned), s.placements);
t("yardage errors: no width, no pieces, negative piece → isError", (await call("calc_fabric_yardage", { pieces: [{ w: 1, h: 1 }] })).isError && (await call("calc_fabric_yardage", { width: 42, pieces: [] })).isError && (await call("calc_fabric_yardage", { width: 42, pieces: [{ w: -1, h: 3 }] })).isError);

// ---- cut list (sheet): every part placed inside the sheet, no overlaps (incl. kerf), utilisation = part area / sheet area
r = await call("optimize_cut_list", { stocks: [{ w: 2440, h: 1220 }], parts: [{ w: 600, h: 300, qty: 10, name: "Shelf" }, { w: 800, h: 400, qty: 3, name: "Side" }], kerf: 3, trim: 10 }); s = r.structuredContent;
const all = s.sheets.flatMap((sh, i) => sh.parts.map((p) => ({ ...p, sheet: i, W: sh.w, H: sh.h })));
t("13/13 parts placed", s.summary.placed === 13 && all.length === 13, s.summary);
t("every part inside the trimmed sheet", all.every((p) => p.x >= 10 - 1e-6 && p.y >= 10 - 1e-6 && p.x + p.w <= p.W - 10 + 1e-6 && p.y + p.h <= p.H - 10 + 1e-6), all.slice(0, 3));
let overlap = false;
for (const a of all) for (const b of all) if (a !== b && a.sheet === b.sheet && a.x < b.x + b.w + 3 - 1e-6 && b.x < a.x + a.w + 3 - 1e-6 && a.y < b.y + b.h + 3 - 1e-6 && b.y < a.y + a.h + 3 - 1e-6 && !(a.x + a.w + 3 <= b.x + 1e-6 || b.x + b.w + 3 <= a.x + 1e-6 || a.y + a.h + 3 <= b.y + 1e-6 || b.y + b.h + 3 <= a.y + 1e-6)) overlap = true;
t("no two parts closer than the 3 mm kerf", !overlap);
const partArea = 10 * 600 * 300 + 3 * 800 * 400;
t("utilisation = part area / (sheets × 2440 × 1220)", near(s.summary.util, partArea / (s.summary.sheets * 2440 * 1220) * 100, 0.01), [s.summary.util, s.summary.sheets]);
t("CSV inline with a header", /^sheet,stock,part,x,y,width,length,rotated/m.test(s.csv || ""), (s.csv || "").slice(0, 80));
r = await call("optimize_cut_list", { stocks: [{ w: 1000, h: 500 }], parts: [{ w: 900, h: 100, qty: 2, grain: true }, { w: 2000, h: 50 }], format: "svg" }); s = r.structuredContent;
t("grain-locked parts never rotated; oversize part reported unplaced; SVG per sheet", s.sheets[0].parts.every((p) => !p.rotated) && s.unplaced.length === 1 && /^<svg/.test((s.svgs || [])[0] || ""), [s.unplaced, (s.svgs || []).length]);
// linear: 5 × 700 from 2400 bars with 3 mm kerf → 3 per bar (3·700 + 2·3 = 2106 ≤ 2400; 4 = 2809 > 2400) → 2 bars
r = await call("optimize_cut_list", { mode: "linear", stocks: [{ len: 2400 }], parts: [{ len: 700, qty: 5, name: "Rail" }] }); s = r.structuredContent;
t("linear: 5 × 700 mm from 2400 mm bars = 2 bars, util 3500/4800", s.summary.bars === 2 && near(s.summary.util, 3500 / 4800 * 100, 0.01), s.summary);
t("cut list errors: no stocks, bad part → isError", (await call("optimize_cut_list", { parts: [{ w: 1, h: 1 }] })).isError && (await call("optimize_cut_list", { stocks: [{ w: 100, h: 100 }], parts: [{ w: 0, h: 5 }] })).isError);

// ---- jigsaw: pieces = rows × cols; cell = board / count; same seed = same file, other seed = different
r = await call("make_jigsaw_puzzle", { rows: 4, cols: 6, width: 300, height: 200, seed: 7 }); s = r.structuredContent;
t("4 × 6 on 300 × 200: 24 pieces of 50 × 50 mm", s.pieces === 24 && near(s.cell_w, 50) && near(s.cell_h, 50), [s.pieces, s.cell_w, s.cell_h]);
t("cut length > grid lines (2·(300+200) + 3·300 + 5·200 = 2900) because knobs add length", s.cut_length > 2900 && s.cut_length < 2900 * 1.6, s.cut_length);
t("true-size SVG in mm", /width="300mm"/.test(s.svg) && /height="200mm"/.test(s.svg), (s.svg || "").slice(0, 200));
const again = (await call("make_jigsaw_puzzle", { rows: 4, cols: 6, width: 300, height: 200, seed: 7 })).structuredContent.svg;
const other = (await call("make_jigsaw_puzzle", { rows: 4, cols: 6, width: 300, height: 200, seed: 8 })).structuredContent.svg;
t("same seed → identical file; another seed → different", again === s.svg && other !== s.svg);
r = await call("make_jigsaw_puzzle", { rows: 3, cols: 3, format: "dxf" }); s = r.structuredContent;
t("DXF R12 output", /AC1009/.test(s.dxf || "") && !s.svg, (s.dxf || "").slice(0, 120));
r = await call("make_jigsaw_puzzle", { rows: 40, cols: 40, format: "dxf" });
t("very large DXF is not returned inline", !r.isError && !r.structuredContent.dxf && /too big/.test(txt(r)));
t("jigsaw errors: rows 1, cols 41 → isError", (await call("make_jigsaw_puzzle", { rows: 1, cols: 5 })).isError && (await call("make_jigsaw_puzzle", { rows: 5, cols: 41 })).isError);

// ---- drawing scale: 1/4" = 1'-0" → 1:48; 27'-6" = 330 in → 330/48 = 6.875 in
r = await call("convert_drawing_scale", { value: "27'-6\"", scale: "1/4\"=1'-0\"" }); s = r.structuredContent;
t("27'-6\" at 1/4\" = 1'-0\": ratio 48, 330/48 = 6.875 in", s.ratio === 48 && near(s.out, 330 / 48) && s.out_unit === "in", s);
r = await call("convert_drawing_scale", { value: "100 mm", scale: "1:50", direction: "toReal", out_unit: "m", to_scale: "1:100" }); s = r.structuredContent;
t("100 mm on a 1:50 drawing = 5 m; at 1:100 it would measure 50 mm", near(s.out, 5) && near(s.rescaled.mm, 50) && /100 mm on the drawing/.test(txt(r)), [s.out, s.rescaled]);
r = await call("convert_drawing_scale", { value: "1\"", scale: "1\"=20'", direction: "toReal", out_unit: "ft" }); s = r.structuredContent;
t("engineer 1\" = 20': ratio 240, 1 in → 20 ft", s.ratio === 240 && near(s.out, 20), s);
r = await call("convert_drawing_scale", { value: 2400, scale: "1:100" }); s = r.structuredContent;
t("bare number with a metric ratio = mm: 2400 mm → 24 mm", near(s.out, 24) && s.out_unit === "mm", s);
r = await call("convert_drawing_scale", { real: "10 m", drawing: "200 mm" }); s = r.structuredContent;
t("find scale: 10 m drawn 200 mm long → 1:50, nearest standard 1:50", near(s.ratio, 50) && s.nearest[0].label === "1:50", s.nearest && s.nearest[0]);
t("scale errors: nothing, unreadable scale → isError", (await call("convert_drawing_scale", {})).isError && (await call("convert_drawing_scale", { value: "3 m", scale: "zz" })).isError);

t("unknown tool → isError", (await call("nope", {})).isError);
console.log(`\n${ok} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
