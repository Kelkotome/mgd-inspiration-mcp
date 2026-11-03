// Node unit test of the batch-69 MCP layer (src/tools_core69.js generated cores + src/mcp_tools69.js).
// Tools: make_ribbon_banner, calc_cross_stitch, get_mockup_print_area.
// Sizes are re-derived here (stitches ÷ count, inches × dpi, mm ÷ 25.4), not copied from the core. Run: node tests/test_tools69.mjs
import { MGD69C, MGD69M } from "../src/tools_core69.js";
import { callTools69Tool as call, TOOL_DEFS, NEXT69, isTools69Tool } from "../src/mcp_tools69.js";
let ok = 0, fail = 0;
const t = (name, cond, info) => { cond ? ok++ : fail++; console.log((cond ? "PASS " : "FAIL ") + name + (cond ? "" : " | " + String(JSON.stringify(info)).slice(0, 400))); };
const txt = (r) => r.content.map((c) => c.text).join("\n");
const near = (a, b, e = 0.011) => Math.abs(a - b) <= e;
const NAMES = ["make_ribbon_banner", "calc_cross_stitch", "get_mockup_print_area"];
const svgOk = (s) => typeof s === "string" && /^<svg[\s>]/.test(s.trim()) && /<\/svg>\s*$/.test(s) && !/<script|onload=|foreignObject|href="http/i.test(s);
const spaced = (d) => JSON.stringify(d).replace(/,"/g, ', "').replace(/":/g, '": ').replace(/,\{/g, ", {").replace(/,\[/g, ", [").length;

t("no window/document global leaked", typeof globalThis.window === "undefined" && typeof globalThis.document === "undefined");
t("cores bundled (xs, rb, mockup)", typeof MGD69C.xs.plan === "function" && typeof MGD69C.rb.build === "function" && typeof MGD69M.mugWrap === "function");
t("3 tools in order", JSON.stringify(TOOL_DEFS.map((d) => d.name)) === JSON.stringify(NAMES), TOOL_DEFS.map((d) => d.name));
for (const d of TOOL_DEFS) {
  const size = spaced(d);
  t(`${d.name}: 'Use when', < 650 chars, ≤ 1.6 KB (as Python counts it), read-only, next hint`, d.description.startsWith("Use when") && d.description.length < 650 && size <= 1640 && d.annotations.readOnlyHint && !d.annotations.openWorldHint && NEXT69[d.name] && d.inputSchema.type === "object", [d.description.length, size]);
}
t("isTools69Tool", NAMES.every(isTools69Tool) && !isTools69Tool("make_certificate_border"));

// ---- ribbon banner
let r = await call("make_ribbon_banner", {}), s = r.structuredContent;
t("default: folded ribbon with notched ends, SVG with text on a path, text fits", !r.isError && s.shape === "folded" && s.end === "notch" && svgOk(s.svg) && /<textPath href="#mgd-rb-p1"/.test(s.svg) && s.text_fit[0].fits, s && s.text_fit);
t("SVG size matches the reported box", s.svg.includes(`width="${s.width}"`) && s.svg.includes(`height="${s.height}"`), [s.width, s.height]);
t("red preset colours", s.color === "#c62828" && s.text_color === "#ffffff" && s.svg.includes("#c62828"));
for (const sh of ["flat", "folded", "arc", "wavy", "double"]) for (const en of ["notch", "point", "straight", "slant"]) {
  r = await call("make_ribbon_banner", { shape: sh, end: en, text: "Hello" });
  if (r.isError || !svgOk(r.structuredContent.svg) || r.structuredContent.shape !== sh) { t(`${sh}/${en} builds`, false, txt(r).slice(0, 200)); }
}
t("all 20 shape × end combinations build", fail === 0);
r = await call("make_ribbon_banner", { shape: "double", text: "Best in Show", text2: "2026", preset: "navy" }); s = r.structuredContent;
t("double: two text paths, navy preset", s.text_fit.length === 2 && s.svg.includes("mgd-rb-p2") && s.svg.includes("2026") && s.color === "#1f3a5f");
r = await call("make_ribbon_banner", { text: "THIS IS A VERY LONG TEXT FOR A SHORT RIBBON BANNER", width: 200 });
t("over-long text on a short ribbon → fits:false + advice", r.structuredContent.text_fit[0].fits === false && /too long/.test(txt(r)));
r = await call("make_ribbon_banner", { text: "<b>R&D</b>", color: "#123456", text_color: "#fedcba" }); s = r.structuredContent;
t("text escaped, custom colours used", !s.svg.includes("<b>") && s.svg.includes("&lt;b&gt;R&amp;D") && s.svg.includes("#123456") && s.svg.includes("#fedcba"));
r = await call("make_ribbon_banner", { width: 1200, height: 120, font: "sans", uppercase: true, text: "grand opening", stitch: false }); s = r.structuredContent;
t("wider ribbon, sans font, uppercase, no stitch lines", s.width > 1200 && s.svg.includes("Arial") && /GRAND OPENING/.test(s.svg) && !s.svg.includes("stroke-dasharray"), s.width);
t("same input → identical SVG", (await call("make_ribbon_banner", { width: 1200, height: 120, font: "sans", uppercase: true, text: "grand opening", stitch: false })).structuredContent.svg === s.svg);
for (const [n, a] of [["bad shape", { shape: "zigzag" }], ["bad end", { end: "round" }], ["bad preset", { preset: "lime" }], ["bad colour", { color: "red" }], ["text 61", { text: "x".repeat(61) }], ["width 50", { width: 50 }], ["height 1000", { height: 1000 }], ["bend 2", { bend: 2 }]])
  t(`ribbon ${n} → isError`, (await call("make_ribbon_banner", a)).isError === true, n);

// ---- cross stitch (count = stitches per inch on Aida; evenweave over 2 = count / 2)
r = await call("calc_cross_stitch", { cols: 140, rows: 100 }); s = r.structuredContent;
t("140 × 100 on 14-count Aida = 10 × 7.14 in, cut 16 × 13.14 in with 3 in margins", !r.isError && near(s.finished_in[0], 140 / 14) && near(s.finished_in[1], 100 / 14) && near(s.cut_in[0], 16) && near(s.cut_in[1], 100 / 14 + 6), s);
t("cm = in × 2.54; 2 strands on 14-count", near(s.finished_cm[0], 25.4) && s.strands === 2);
t("skeins for a one-colour fill = ceil(stitches / per skein)", s.skeins_if_one_colour === Math.ceil(14000 / s.stitches_per_skein) && s.stitches_per_skein > 1000 && s.stitches_per_skein < 5000, s.stitches_per_skein);
t("8 fabrics compared; 28-count evenweave over 2 = 14-count Aida size", s.other_fabrics.length === 8 && s.other_fabrics.find((f) => /28-count/.test(f.fabric)).inW === s.finished_in[0]);
r = await call("calc_cross_stitch", { width: 8, fabric: "aida18" }); s = r.structuredContent;
t("8 in wide on 18-count = 144 stitches, square by default, 1 strand", s.cols === 144 && s.rows === 144 && s.strands === 1, [s.cols, s.rows, s.strands]);
r = await call("calc_cross_stitch", { width: 20, height: 25, unit: "cm", fabric: "ev32", margin: 2, strands: 1 }); s = r.structuredContent;
t("20 × 25 cm on 32-count over 2 (16 spi) = 126 × 157 stitches, 2 in margins, 1 strand", s.cols === Math.round(20 / 2.54 * 16) && s.rows === Math.round(25 / 2.54 * 16) && s.margin_in === 2 && s.strands === 1, [s.cols, s.rows]);
t("matches the core plan()", MGD69C.xs.plan({ cols: 50, fabric: "aida11" }).size.inW === 4.55);
for (const [n, a] of [["nothing", {}], ["bad fabric", { cols: 10, fabric: "aida13" }], ["cols 0", { cols: 0 }], ["cols 5000", { cols: 5000 }], ["strands 7", { cols: 10, strands: 7 }], ["margin -1", { cols: 10, margin: -1 }], ["width text", { width: "big" }]])
  t(`cross stitch ${n} → isError`, (await call("calc_cross_stitch", a)).isError === true, n);

// ---- mockup print areas
r = await call("get_mockup_print_area", { product: "tshirt" }); s = r.structuredContent;
const full = s.areas.find((x) => x.name === "full");
t("t-shirt: 4 areas; full front 12 × 16 in = 3600 × 4800 px at 300 dpi", !r.isError && s.areas.length === 4 && full.in[0] === 12 && full.in[1] === 16 && full.px[0] === 3600 && full.px[1] === 4800 && near(full.cm[0], 30.48), full);
r = await call("get_mockup_print_area", { product: "tshirt", area: "pocket", dpi: 150 }); s = r.structuredContent;
t("pocket 4 × 4 in at 150 dpi = 600 px", s.areas.length === 1 && s.areas[0].px[0] === 600 && s.dpi === 150);
r = await call("get_mockup_print_area", { product: "hoodie", area: "chest" }); t("hoodie chest 12 × 8 in", r.structuredContent.areas[0].in.join() === "12,8");
r = await call("get_mockup_print_area", { product: "tote", style: "wide", area: "large" }); t("wide tote large area 12 in square", r.structuredContent.areas[0].in.join() === "12,12" && /wide tote/.test(txt(r)));
r = await call("get_mockup_print_area", { product: "mug", size: "11" }); s = r.structuredContent.areas[0];
t("11 oz mug wrap 219.6 × 85 mm = 2594 × 1004 px at 300 dpi; 82 mm mug", near(s.in[0], 219.6 / 25.4) && s.px[0] === Math.round(219.6 / 25.4 * 300) && s.px[1] === Math.round(85 / 25.4 * 300) && s.mug_mm.diameter === 82, s);
t("handle gap = π·d − wrap", near(s.handle_gap_in, (Math.PI * 82 - 219.6) / 25.4, 0.006), s.handle_gap_in);
r = await call("get_mockup_print_area", { product: "mug", size: 15 }); t("15 oz (numeric size accepted)", r.structuredContent.areas[0].mug_mm.diameter === 86);
r = await call("get_mockup_print_area", { product: "poster", size: "a3" }); s = r.structuredContent.areas[0];
t("A3 poster 297 × 420 mm = 3508 × 4961 px at 300 dpi", s.mm.join() === "297,420" && s.px[0] === Math.round(297 / 25.4 * 300) && s.px[1] === Math.round(420 / 25.4 * 300), s.px);
r = await call("get_mockup_print_area", { product: "poster" }); t("all 9 poster sizes", r.structuredContent.areas.length === 9);
r = await call("get_mockup_print_area", { product: "billboard" }); s = r.structuredContent;
t("billboards: bulletin 48 × 14 ft (14.63 × 4.27 m), no px without dpi", s.areas.length === 3 && s.areas[0].ft.join() === "48,14" && near(s.areas[0].m[0], 14.63) && s.areas[0].px === null && s.dpi === null, s.areas[0]);
r = await call("get_mockup_print_area", { product: "billboard", size: "poster8", dpi: 72 }); t("8-sheet 11 × 5 ft at 72 dpi = 9504 × 4320 px", r.structuredContent.areas[0].px.join() === "9504,4320", r.structuredContent.areas[0].px);
t("page link per product", /tools\/billboard-mockup\//.test(txt(r)) && /tools\/tote-bag-mockup\//.test(txt(await call("get_mockup_print_area", { product: "tote" }))));
for (const [n, a] of [["no product", {}], ["bad product", { product: "cap" }], ["bad area", { product: "tshirt", area: "sleeve" }], ["bad mug", { product: "mug", size: "20" }], ["bad poster", { product: "poster", size: "a0" }], ["dpi 10", { product: "poster", dpi: 10 }], ["bad tote style", { product: "tote", style: "mini" }]])
  t(`mockup ${n} → isError`, (await call("get_mockup_print_area", a)).isError === true, n);
console.log(`\n${ok} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
