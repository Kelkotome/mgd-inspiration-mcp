// Node unit test of the batch-78 MCP layer (src/tools_core78.js generated cores + src/mcp_tools78.js).
// Tools: get_sign_letter_height, plan_sign_tiling, make_sign.
// Facts are re-derived here (10 / 30 ft per inch; tiles step by printable − overlap and cover the sign; fewest sheets over both orientations), not copied from the core.
// Run: node tests/test_tools78.mjs
import { MGD72C, MGD78 } from "../src/tools_core78.js";
import { callTools78Tool as call, TOOL_DEFS, NEXT78, isTools78Tool } from "../src/mcp_tools78.js";
let ok = 0, fail = 0;
const t = (name, cond, info) => { cond ? ok++ : fail++; console.log((cond ? "PASS " : "FAIL ") + name + (cond ? "" : " | " + String(JSON.stringify(info)).slice(0, 400))); };
const txt = (r) => r.content.map((c) => c.text).join("\n");
const NAMES = ["get_sign_letter_height", "plan_sign_tiling", "make_sign"], CAP = 120 * 1024, IN = 25.4;
const svgOk = (s) => typeof s === "string" && /^<svg[\s>]/.test(s) && /<\/svg>\s*$/.test(s) && !/<script|onload=|foreignObject|href="http/i.test(s);
const spaced = (d) => JSON.stringify(d).replace(/,"/g, ', "').replace(/":/g, '": ').replace(/,\{/g, ", {").replace(/,\[/g, ", [").length;
const near = (a, b, e = 0.06) => Math.abs(a - b) <= e;
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

t("no window/document global leaked", typeof globalThis.window === "undefined" && typeof globalThis.document === "undefined");
t("cores bundled (sign 72C, sign 78, icons)", typeof MGD72C.tiles === "function" && typeof MGD78.build === "function" && typeof MGD78.legibility === "function" && Object.keys(MGD78.kinds).join() === "ooo,dnd,reserved,yard");
t("3 tools in order", JSON.stringify(TOOL_DEFS.map((d) => d.name)) === JSON.stringify(NAMES), TOOL_DEFS.map((d) => d.name));
for (const d of TOOL_DEFS) {
  const size = spaced(d);
  t(`${d.name}: 'Use when', < 650 chars, ≤ 1.6 KB (as Python counts it), read-only, next hint`, d.description.startsWith("Use when") && d.description.length < 650 && size <= 1640 && d.annotations.readOnlyHint && !d.annotations.openWorldHint && NEXT78[d.name] && d.inputSchema.type === "object", [d.description.length, size]);
}
t("isTools78Tool", NAMES.every(isTools78Tool) && !isTools78Tool("make_maze"));
t("core rules: 10 ft per inch easy, 30 ft per inch max", MGD78.READ.best === 10 && MGD78.READ.max === 30);

// ---- letter height
let r = await call("get_sign_letter_height", { distance: 100 }), s = r.structuredContent;
t("100 ft: easy 10 in (254 mm), minimum 100/30 = 3.33 in", !r.isError && s.easy_cap_in === 10 && near(s.easy_cap_mm, 254, 0.05) && s.min_cap_in === 3.33 && near(s.distance_m, 30.48, 0.01), s);
t("100 ft: no standard size reads easily (title < 10 in) → null + honest text", s.recommended_size === null && /None of the standard sign sizes/.test(txt(r)));
t("sizes table: cap_in = cap_mm / 25.4, easy = cap_in × 10 ft, max = × 30", s.sizes.length === 9 && s.sizes.every((x) => near(x.cap_in, x.cap_mm / IN, 0.01) && Math.abs(x.easy_ft - x.cap_mm / IN * 10) <= 0.6 && Math.abs(x.max_ft - x.cap_mm / IN * 30) <= 0.6), s.sizes);
const cap = (k) => s.sizes.find((x) => x.size === k).cap_mm;
t("bigger signs carry taller titles (Letter < Tabloid < 18 × 24 < 24 × 36)", cap("letter") < cap("tabloid") && cap("tabloid") < cap("18x24") && cap("18x24") < cap("24x36"));
r = await call("get_sign_letter_height", { distance: 20 }); s = r.structuredContent;
const need = 20 / 10, idx = s.sizes.findIndex((x) => x.cap_in >= need);
t("20 ft: needs 2 in; recommends the first size in the table whose title is ≥ 2 in", s.easy_cap_in === 2 && s.recommended_size === s.sizes[idx].size && s.sizes.slice(0, idx).every((x) => x.cap_in < need), [s.recommended_size, idx]);
t("20 ft: legible sizes = title ≥ 20/30 in", JSON.stringify(s.legible_sizes) === JSON.stringify(s.sizes.filter((x) => x.cap_in >= 20 / 30).map((x) => x.size)));
r = await call("get_sign_letter_height", { distance: 10, distance_unit: "m" }); s = r.structuredContent;
t("10 m = 32.81 ft → easy 3.28 in, min 1.09 in", near(s.distance_ft, 32.81, 0.01) && s.easy_cap_in === 3.28 && s.min_cap_in === 1.09, s);
r = await call("get_sign_letter_height", { cap_height: 1 }); s = r.structuredContent;
t("1 in letters: easy 10 ft (3 m), max 30 ft (9.1 m)", s.mode === "cap_height" && s.easy_ft === 10 && s.max_ft === 30 && s.easy_m === 3 && s.max_m === 9.1, s);
r = await call("get_sign_letter_height", { cap_height: 50, height_unit: "mm" }); s = r.structuredContent;
t("50 mm letters = 1.97 in: easy 19.7 ft, max 59.1 ft; sizes tall enough have title ≥ 50 mm", s.cap_in === 1.97 && s.easy_ft === 19.7 && s.max_ft === 59.1 && s.sizes_tall_enough.every((k) => s.sizes.find((x) => x.size === k).cap_mm >= 49.95) && s.sizes_tall_enough.length > 0, s);
t("text cites both rules (signsnow + IJSW) and links the yard sale page", /signsnow\.com/.test(txt(r)) && /Signage and Wayfinding/.test(txt(r)) && txt(r).includes("/tools/yard-sale-sign/"));
r = await call("get_sign_letter_height", { cap_height: 4, height_unit: "cm" });
t("4 cm = 40 mm", near(r.structuredContent.cap_mm, 40, 0.01));

// ---- tiling
const tileCheck = (s, W, H, sheet, ov) => {
  const P = MGD72C.SIZES[sheet], mg = 8;
  let best = null; for (const land of [false, true]) { const pw = (land ? P.h : P.w) - 2 * mg, ph = (land ? P.w : P.h) - 2 * mg - 6, cols = W <= pw ? 1 : Math.ceil((W - ov) / (pw - ov)), rows = H <= ph ? 1 : Math.ceil((H - ov) / (ph - ov)); if (!best || cols * rows < best.n) best = { n: cols * rows, cols, rows, pw, ph }; }
  const xs = [...new Set(s.tiles.map((x) => x.crop_mm.x))], ys = [...new Set(s.tiles.map((x) => x.crop_mm.y))];
  const lastX = s.tiles.filter((x) => x.col === s.cols)[0], lastY = s.tiles.filter((x) => x.row === s.rows)[0];
  return s.sheets === best.n && s.cols === best.cols && s.rows === best.rows && s.tiles.length === s.sheets &&
    xs.every((x, i) => near(x, i * (best.pw - ov), 0.1)) && ys.every((y, i) => near(y, i * (best.ph - ov), 0.1)) &&
    near(lastX.crop_mm.x + lastX.crop_mm.w, W, 0.15) && near(lastY.crop_mm.y + lastY.crop_mm.h, H, 0.15) &&
    s.tiles.every((x) => x.crop_mm.w <= best.pw + 0.05 && x.crop_mm.h <= best.ph + 0.05) &&
    JSON.stringify(s.grid.flat()) === JSON.stringify(s.tiles.map((x) => x.sheet)) && s.tiles.every((x) => x.sheet === (x.row - 1) * s.cols + x.col);
};
r = await call("plan_sign_tiling", {}); s = r.structuredContent;
t("18 × 24 in on Letter: fewest sheets over both orientations, tiles step by printable − 12 mm and cover the sign exactly", !r.isError && s.sheet === "letter" && s.overlap_mm === 12 && tileCheck(s, 18 * IN, 24 * IN, "letter", 12), [s.sheets, s.cols, s.rows]);
t("18 × 24 on Letter = 8 sheets (2 × 4), landscape sheets", s.sheets === 8 && s.cols === 2 && s.rows === 4 && s.sheet_orientation === "landscape");
t("text shows the grid and every sheet's crop", txt(r).includes("Sheet grid") && s.tiles.every((x) => txt(r).includes(`- ${x.sheet} (row ${x.row}, col ${x.col})`)) && txt(r).includes("/tools/sign-maker/"));
for (const [size, sheet, W, H] of [["24x36", "letter", 24 * IN, 36 * IN], ["a2", "a4", 420, 594], ["a1", "a4", 594, 841], ["16x20", "a4", 16 * IN, 20 * IN]]) {
  const q = (await call("plan_sign_tiling", { size, sheet })).structuredContent;
  t(`${size} on ${sheet}: re-derived tiling (${q.sheets} sheets)`, tileCheck(q, W, H, sheet, 12), [q.sheets, q.cols, q.rows]);
}
const land = (await call("plan_sign_tiling", { size: "24x36", orientation: "landscape" })).structuredContent;
t("landscape 24 × 36 = 36 × 24 in sign", land.sign_mm[0] === 914.4 && land.sign_mm[1] === 609.6 && tileCheck(land, 36 * IN, 24 * IN, "letter", 12));
const cus = (await call("plan_sign_tiling", { width: 60, height: 90, unit: "cm", sheet: "a4" })).structuredContent;
t("custom 60 × 90 cm on A4", cus.sign_mm[0] === 600 && cus.sign_mm[1] === 900 && tileCheck(cus, 600, 900, "a4", 12), cus.sign_mm);
const zero = (await call("plan_sign_tiling", { overlap: 0 })).structuredContent;
t("overlap 0: never more sheets than with 12 mm, still covers the sign", zero.sheets <= 8 && tileCheck(zero, 18 * IN, 24 * IN, "letter", 0));
const one = (await call("plan_sign_tiling", { width: 7, height: 9 })).structuredContent;
t("7 × 9 in fits one Letter sheet (printable 199.9 × 257.4 mm): 1 sheet, no overlap", one.sheets === 1 && one.overlap_mm === 0 && one.tiles[0].crop_mm.w === 177.8);
const two = (await call("plan_sign_tiling", { width: 8, height: 10 })).structuredContent;
t("8 × 10 in (203.2 mm) is wider than the 199.9 mm printable width: 2 sheets", two.sheets === 2 && tileCheck(two, 8 * IN, 10 * IN, "letter", 12));

// ---- make_sign
let all = true, bad = [];
for (const kind of Object.keys(MGD78.kinds)) for (const preset of Object.keys(MGD78.presets[kind])) for (const size of ["letter", "24x36"]) {
  const q = await call("make_sign", { kind, preset, size }), sc = q.structuredContent, p = MGD78.presets[kind][preset];
  const good = !q.isError && sc.svgs.every(svgOk) && sc.svgs.join("").length <= CAP && p.title.split(" ").every((w) => new RegExp("[> ]" + esc(w).replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "[ <]").test(sc.svgs[0])) && sc.page === `https://madegooddesigns.com/tools/${{ ooo: "out-of-order-sign", dnd: "do-not-disturb-sign", reserved: "reserved-sign", yard: "yard-sale-sign" }[kind]}/`;
  if (!good) { all = false; bad.push([kind, preset, size, q.isError && txt(q)]); }
}
t("every kind × preset at Letter and 24 × 36: valid SVG ≤ 120 KB with every word of the preset title (it may wrap), kind's page", all, bad);
r = await call("make_sign", {}); s = r.structuredContent;
t("default: out of order, general preset, Letter portrait 215.9 × 279.4 mm, 1 page", s.kind === "ooo" && s.preset === "general" && s.sheet_mm[0] === 215.9 && s.sheet_mm[1] === 279.4 && s.pages === 1 && s.svgs[0].includes('width="215.9mm"'));
const ln = (await call("make_sign", { lines: ["BROKEN <again>", "Use the stairs"] })).structuredContent;
t("lines replace title + subtitle (escaped)", ln.svgs[0].includes(">BROKEN &lt;again&gt;<") && ln.svgs[0].includes(">Use the stairs<") && !ln.svgs[0].includes("Sorry for the inconvenience"));
const y = (await call("make_sign", { kind: "yard", lines: ["GARAGE SALE", "SAT NOV 14", "8 AM – 1 PM", "12 Elm Rd", "Bikes"], size: "18x24" })).structuredContent;
t("yard: landscape by default (609.6 × 457.2), all 5 lines drawn", y.orientation === "landscape" && y.sheet_mm[0] === 609.6 && ["GARAGE SALE", "SAT NOV 14", "12 Elm Rd", "Bikes"].every((w) => y.svgs[0].includes(">" + w + "<")));
t("yard: title height → reading distance at 10 / 30 ft per inch", y.title_cap_mm > 0 && y.easy_read_ft === Math.round(y.title_cap_mm / IN * 10) && Math.abs(y.max_read_ft - y.title_cap_mm / IN * 30) <= 1, [y.title_cap_mm, y.easy_read_ft]);
const wd = (await call("make_sign", { kind: "reserved", preset: "wedding" })).structuredContent;
t("reserved wedding preset: one tent page per name (2), both halves (one rotated 180°)", wd.pages === 2 && wd.layout === "tent" && /rotate\(180 /.test(wd.svgs[0]) && wd.svgs[0].includes("Family of the Bride") && wd.svgs[1].includes("Family of the Groom"));
const wl = (await call("make_sign", { kind: "reserved", preset: "wedding", lines: ["Reserved", "for", "The Lees"] })).structuredContent;
t("reserved with lines: one page, your name", wl.pages === 1 && wl.svgs[0].includes(">The Lees<") && !wl.svgs[0].includes("Family of"));
const hh = (await call("make_sign", { kind: "dnd", layout: "half2up" })).structuredContent;
t("dnd half2up: two signs on one sheet (title twice)", hh.pages === 1 && hh.svgs[0].split(">DO NOT DISTURB<").length === 3);
const sc2 = (await call("make_sign", { scheme: "red" })).structuredContent;
t("scheme changes the colours", sc2.scheme === "red" && sc2.svgs[0] !== s.svgs[0]);
t("deterministic", JSON.stringify((await call("make_sign", {})).structuredContent) === JSON.stringify(s));

// ---- bad inputs
for (const [n, a] of [["get_sign_letter_height", {}], ["get_sign_letter_height", { distance: 10, cap_height: 1 }], ["get_sign_letter_height", { distance: -5 }], ["get_sign_letter_height", { distance: 10, distance_unit: "yd" }],
  ["get_sign_letter_height", { cap_height: 0 }], ["get_sign_letter_height", { cap_height: 2, height_unit: "pt" }], ["plan_sign_tiling", { size: "a0" }], ["plan_sign_tiling", { sheet: "a3" }],
  ["plan_sign_tiling", { width: 20 }], ["plan_sign_tiling", { size: "18x24", width: 10, height: 10 }], ["plan_sign_tiling", { overlap: 50 }], ["plan_sign_tiling", { width: 1, height: 1 }],
  ["make_sign", { kind: "exit" }], ["make_sign", { kind: "dnd", preset: "zzz" }], ["make_sign", { size: "a0" }], ["make_sign", { kind: "yard", layout: "tent" }],
  ["make_sign", { lines: "OPEN" }], ["make_sign", { lines: ["a", "b", "c", "d", "e", "f"] }], ["make_sign", { scheme: "pink" }]]) {
  const q = await call(n, a);
  t(`bad input → isError: ${n} ${JSON.stringify(a)}`, q.isError && txt(q).length < 200, txt(q));
}
t("unknown tool → isError", (await call("make_nothing", {})).isError);
console.log(`\n${ok} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
