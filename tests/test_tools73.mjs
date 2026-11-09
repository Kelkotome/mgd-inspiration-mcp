// Node unit test of the batch-73 MCP layer (src/tools_core73.js generated tables + src/mcp_tools73.js).
// Tools: get_brochure_panels, get_banner_spec, and the ten b73 products added to get_mockup_print_area (b69 products checked byte-identical).
// Sizes re-derived here ((W + 1/16) / 3, 2 ft grommet grid, W + 2D + 2, (w + 1/4) × dpi), not copied from the core. Run: node tests/test_tools73.mjs
import { MGD73M } from "../src/tools_core73.js";
import { callTools73Tool as call, TOOL_DEFS, NEXT73, isTools73Tool, isMockup73Call, extendMockupDefs, PRODUCTS73 } from "../src/mcp_tools73.js";
import { callTools69Tool, TOOL_DEFS as DEFS69 } from "../src/mcp_tools69.js";
let ok = 0, fail = 0;
const t = (name, cond, info) => { cond ? ok++ : fail++; console.log((cond ? "PASS " : "FAIL ") + name + (cond ? "" : " | " + String(JSON.stringify(info)).slice(0, 400))); };
const txt = (r) => r.content.map((c) => c.text).join("\n");
const near = (a, b, e = 0.0001) => Math.abs(a - b) <= e;
const NAMES = ["get_brochure_panels", "get_banner_spec"];
const spaced = (d) => JSON.stringify(d).replace(/,"/g, ', "').replace(/":/g, '": ').replace(/,\{/g, ", {").replace(/,\[/g, ", [").length;

t("no window/document global leaked", typeof globalThis.window === "undefined" && typeof globalThis.document === "undefined");
t("b73 tables bundled", !!MGD73M.BROCHURES && !!MGD73M.BANNERS && typeof MGD73M.grommets === "function" && typeof MGD73M.render === "function");
t("2 tools in order", JSON.stringify(TOOL_DEFS.map((d) => d.name)) === JSON.stringify(NAMES), TOOL_DEFS.map((d) => d.name));
for (const d of TOOL_DEFS) t(`${d.name}: 'Use when', < 650 chars, ≤ 1.6 KB, read-only, next hint`, d.description.startsWith("Use when") && d.description.length < 650 && spaced(d) <= 1640 && d.annotations.readOnlyHint && !d.annotations.openWorldHint && NEXT73[d.name] && d.inputSchema.type === "object", [d.description.length, spaced(d)]);
t("isTools73Tool", NAMES.every(isTools73Tool) && !isTools73Tool("get_mockup_print_area") && !isTools73Tool("make_star_map"));
t("isMockup73Call: only the ten b73 products", PRODUCTS73.length === 10 && PRODUCTS73.every((p) => isMockup73Call("get_mockup_print_area", { product: p })) && !["tshirt", "hoodie", "tote", "mug", "poster", "billboard", "nope"].some((p) => isMockup73Call("get_mockup_print_area", { product: p })) && !isMockup73Call("get_mockup_print_area", undefined) && !isMockup73Call("get_banner_spec", { product: "canvas" }));

// ---- brochure panels
let r = await call("get_brochure_panels", {}), s = r.structuredContent;
t("letter roll: outside 3.625 / 3.6875 / 3.6875 = (11 + 1/16)/3 less 1/16, cover = panel 3", !r.isError && near(s.outside.panels[1], (11 + 1 / 16) / 3) && near(s.outside.panels[0], (11 + 1 / 16) / 3 - 1 / 16) && s.cover_panel === 3 && JSON.stringify(s.inside.panels) === "[3.6875,3.6875,3.625]", s);
t("letter roll: panels sum to 11, folds at 3.625 and 7.3125", near(s.outside.panels.reduce((a, b) => a + b), 11) && JSON.stringify(s.outside.folds_from_left) === "[3.625,7.3125]", s.outside);
t("letter roll matches the page's engine table", JSON.stringify(s.outside.panels) === JSON.stringify(MGD73M.BROCHURES["letter-roll"].outside.map((v) => Math.round(v * 10000) / 10000)));
t("flat file at 300 dpi with 1/8 in bleed: 3375 × 2625 px", JSON.stringify(s.sheet_px) === "[3375,2625]" && /3375 × 2625 px/.test(txt(r)) && txt(r).includes("/tools/brochure-mockup/"), s.sheet_px);
r = await call("get_brochure_panels", { paper: "a4" }); s = r.structuredContent;
t("A4 roll: 97 / 100 / 100 mm (matches engine)", s.unit === "mm" && JSON.stringify(s.outside.panels) === "[97,100,100]" && near(MGD73M.BROCHURES["a4-roll"].outside[0] * 25.4, 97, 1e-9), s.outside);
r = await call("get_brochure_panels", { fold: "z", paper: "legal" }); s = r.structuredContent;
t("Legal Z: three 4.6667 in panels, cover = panel 1", s.outside.panels.every((v) => near(v, 14 / 3, 1e-4)) && s.cover_panel === 1, s.outside);
r = await call("get_brochure_panels", { fold: "bi", paper: "tabloid", dpi: 150 }); s = r.structuredContent;
t("Tabloid bi-fold at 150 dpi: 8.5 in halves, 1275 px each, sheet 2588 × 1688", JSON.stringify(s.outside.panels) === "[8.5,8.5]" && JSON.stringify(s.outside.panels_px) === "[1275,1275]" && JSON.stringify(s.sheet_px) === "[2588,1688]", s);
r = await call("get_brochure_panels", { fold: "tri", paper: "Letter" }); t("aliases: tri → roll, case-insensitive paper", !r.isError && r.structuredContent.fold === "roll");

// ---- banner spec
r = await call("get_banner_spec", { preset: "3x8" }); s = r.structuredContent;
t("3 × 8 ft: 96 × 36 in, aspect 2.67, 12 grommets (5 across, 3 down)", !r.isError && JSON.stringify(s.in) === "[96,36]" && s.aspect === 2.67 && s.grommets.total === 12 && s.grommets.across === 5 && s.grommets.down === 3, s);
t("3 × 8 ft px: 9,600 × 3,600 at 100 dpi, 14,400 × 5,400 at 150", JSON.stringify(s.px) === JSON.stringify({ 100: [9600, 3600], 150: [14400, 5400] }) && /14,400 × 5,400 px at 150 dpi/.test(txt(r)), s.px);
const pos = s.grommets.positions_in;
t("grommet positions: 12, corners 1 in in, top row every 23.5 in, all on the edge band", pos.length === 12 && pos.some((p) => p[0] === 1 && p[1] === 1) && pos.some((p) => p[0] === 95 && p[1] === 35) && pos.filter((p) => p[1] === 1).map((p) => p[0]).join() === "1,24.5,48,71.5,95" && pos.every((p) => p[0] === 1 || p[0] === 95 || p[1] === 1 || p[1] === 35), pos);
t("grommet count matches the page engine", s.grommets.total === MGD73M.grommets(96, 36).total);
r = await call("get_banner_spec", { width: 2, height: 1, unit: "m", dpi: 100 }); s = r.structuredContent;
t("custom 2 × 1 m: 78.74 × 39.37 in, px at 100 dpi only = 7874 × 3937", JSON.stringify(s.in) === "[78.74,39.37]" && JSON.stringify(Object.keys(s.px)) === '["100"]' && JSON.stringify(s.px[100]) === "[7874,3937]", s);
r = await call("get_banner_spec", { width: 10, height: 3, spacing: 12 }); s = r.structuredContent;
t("10 × 3 ft every 12 in: 11 across, 4 down, 2·11 + 2·2 = 26 grommets", s.grommets.across === 11 && s.grommets.down === 4 && s.grommets.total === 26 && s.grommets.positions_in.length === 26, s.grommets);
r = await call("get_banner_spec", { preset: "rollup" }); s = r.structuredContent;
t("roll-up 33 × 81: no grommets, stand note", s.grommets.total === 0 && /roll-up stand/.test(txt(r)) && JSON.stringify(s.in) === "[33,81]");

// ---- get_mockup_print_area: b73 products
const defs = DEFS69.map((d) => JSON.parse(JSON.stringify(d))); const before = JSON.stringify(defs.find((d) => d.name === "get_mockup_print_area"));
extendMockupDefs(defs); extendMockupDefs(defs); const md = defs.find((d) => d.name === "get_mockup_print_area");
t("extendMockupDefs: enum = 6 b69 + 10 b73 products (idempotent), depth param, description extended, ≤ 1.6 KB, < 650 chars", md.inputSchema.properties.product.enum.length === 16 && md.inputSchema.properties.depth && /paper bags\.$/.test(md.description) && md.description.length < 650 && spaced(md) <= 1640 && before !== JSON.stringify(md), [md.description.length, spaced(md)]);
t("extendMockupDefs leaves the other tools alone", JSON.stringify(defs.filter((d) => d.name !== "get_mockup_print_area")) === JSON.stringify(DEFS69.filter((d) => d.name !== "get_mockup_print_area")));
const M = (a) => call("get_mockup_print_area", a);
r = await M({ product: "canvas", size: "16x20" }); s = r.structuredContent;
t("canvas 16 × 20 gallery: wrap artwork 21 × 25 in (W + 2·1.5 + 2), 6300 × 7500 px at 300", !r.isError && JSON.stringify(s.areas[0].wrap_artwork_in) === "[21,25]" && JSON.stringify(s.areas[0].wrap_artwork_px) === "[6300,7500]" && s.page.endsWith("/tools/canvas-mockup/"), s);
r = await M({ product: "canvas", size: "16x20", depth: "slim", dpi: 150 }); t("canvas slim at 150: 19.5 × 23.5 in", JSON.stringify(r.structuredContent.areas[0].wrap_artwork_in) === "[19.5,23.5]" && JSON.stringify(r.structuredContent.areas[0].px) === "[2400,3000]");
r = await M({ product: "canvas" }); t("canvas: all 8 sizes when size omitted", r.structuredContent.areas.length === 8);
r = await M({ product: "flyer", size: "a5" }); s = r.structuredContent.areas[0];
t("flyer A5: 5.83 × 8.27 in, 1823 × 2555 px with bleed (= (148/25.4 + 0.25) × 300)", JSON.stringify(s.in) === "[5.83,8.27]" && JSON.stringify(s.with_bleed_px) === JSON.stringify([Math.round((148 / 25.4 + 0.25) * 300), Math.round((210 / 25.4 + 0.25) * 300)]), s);
r = await M({ product: "magazine", size: "standard" }); s = r.structuredContent.areas[0];
t("magazine 8.375 × 10.875: 2588 × 3338 px with bleed, spread 5063 px wide", JSON.stringify(s.with_bleed_px) === "[2588,3338]" && s.spread_px[0] === Math.round((2 * 8.375 + 0.25) * 300), s);
r = await M({ product: "brochure", size: "a4-roll" }); t("brochure A4 roll via print area: cover panel 3, sheet 11.69 × 8.27 in", r.structuredContent.areas[0].cover_panel === 3 && JSON.stringify(r.structuredContent.areas[0].in) === "[11.69,8.27]");
r = await M({ product: "notebook", size: "a5" }); t("notebook A5: 1748 × 2480 px", JSON.stringify(r.structuredContent.areas[0].px) === "[1748,2480]" && JSON.stringify(r.structuredContent.areas[0].mm) === "[148,210]");
r = await M({ product: "polo", area: "left" }); t("polo left chest 4 × 4 in = 1200 × 1200 px", JSON.stringify(r.structuredContent.areas[0].px) === "[1200,1200]" && r.structuredContent.page.endsWith("/tools/polo-shirt-mockup/"));
r = await M({ product: "cap" }); t("cap: front 4.5 × 2.25 in = 1350 × 675 px, side area too", r.structuredContent.areas.length === 2 && JSON.stringify(r.structuredContent.areas[0].px) === "[1350,675]");
r = await M({ product: "sticker", size: 3 }); t("sticker 3 in: 900 px, 975 px with bleed", JSON.stringify(r.structuredContent.areas[0].px) === "[900,900]" && JSON.stringify(r.structuredContent.areas[0].with_bleed_px) === "[975,975]");
r = await M({ product: "banner", size: "3x8" }); t("banner 3 × 8 via print area: default 150 dpi, 12 grommets", r.structuredContent.dpi === 150 && r.structuredContent.areas[0].grommets === 12 && JSON.stringify(r.structuredContent.areas[0].px) === "[14400,5400]");
r = await M({ product: "paperbag", size: "medium" }); s = r.structuredContent.areas[0];
t("paper bag medium 10 × 5 × 13: front area 8 × 8.06 in", JSON.stringify(s.in) === "[8,8.06]" && s.bag_in.gusset === 5 && r.structuredContent.page.endsWith("/tools/paper-bag-mockup/"), s);
for (const p of PRODUCTS73) { const rr = await M({ product: p }); t(`${p}: all areas, page link, text`, !rr.isError && rr.structuredContent.areas.length >= 2 && txt(rr).includes(`/tools/${{ paperbag: "paper-bag", polo: "polo-shirt" }[p] || p}-mockup/`)); }

// ---- b69 products: the b69 handler still answers them, unchanged by importing this module
for (const a of [{ product: "mug" }, { product: "tshirt", area: "pocket" }, { product: "billboard", size: "bulletin" }, { product: "poster", dpi: 150 }]) {
  const x = await callTools69Tool("get_mockup_print_area", a); t(`b69 product ${a.product} still answered by mcp_tools69 (not routed to b73)`, !x.isError && !isMockup73Call("get_mockup_print_area", a));
}

// ---- bad inputs
for (const [n, a] of [["get_brochure_panels", { fold: "gate" }], ["get_brochure_panels", { paper: "b5" }], ["get_brochure_panels", { dpi: 5 }],
  ["get_banner_spec", { preset: "huge" }], ["get_banner_spec", { width: 200, height: 2 }], ["get_banner_spec", { width: 3, height: 2, unit: "yd" }], ["get_banner_spec", { preset: "3x8", spacing: 2 }],
  ["get_mockup_print_area", { product: "canvas", depth: "deep" }], ["get_mockup_print_area", { product: "banner", dpi: 9999 }]])
  t(`bad input → isError: ${n} ${JSON.stringify(a)}`, (await call(n, a)).isError === true);
// 9-Nov-2026 (mcp-errors-r1): {} → the preset table; an unknown size / area lists every option with a note
{ const q = await call("get_banner_spec", { preset: "9x9" }); t("a size that is not a preset is read as width × height ft", !q.isError && q.structuredContent.in.join() === "108,108"); }
{ const q = await call("get_banner_spec", {}); t("get_banner_spec {} → preset table", !q.isError && q.structuredContent.presets.length === 7); }
for (const a of [{ product: "canvas", size: "7x7" }, { product: "polo", area: "pocket" }]) { const q = await call("get_mockup_print_area", a); t(`unknown key lists every option: ${JSON.stringify(a)}`, !q.isError && /every option is listed/.test(txt(q)) && q.structuredContent.areas.length > 1, txt(q).slice(0, 160)); }
t("unknown tool → isError", (await call("nope", {})).isError === true);

console.log(`\n${ok} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
