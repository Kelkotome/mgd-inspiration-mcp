// Node unit test of the batch-72 MCP layer (src/tools_core72.js generated cores + src/mcp_tools72.js).
// Tools: make_star_map, make_fantasy_map, make_paper_bag_template.
// Astronomy and sizes are re-derived here (Meeus GMST, alt = asin(sin d sin f + cos d cos f cos H), 2W + 2G + flap, mm ÷ 25.4), not copied from the core. Run: node tests/test_tools72.mjs
import { MGD72A, MGD72B, MGD72D } from "../src/tools_core72.js";
import { callTools72Tool as call, TOOL_DEFS, NEXT72, isTools72Tool } from "../src/mcp_tools72.js";
let ok = 0, fail = 0;
const t = (name, cond, info) => { cond ? ok++ : fail++; console.log((cond ? "PASS " : "FAIL ") + name + (cond ? "" : " | " + String(JSON.stringify(info)).slice(0, 400))); };
const txt = (r) => r.content.map((c) => c.text).join("\n");
const near = (a, b, e = 0.011) => Math.abs(a - b) <= e;
const NAMES = ["make_star_map", "make_fantasy_map", "make_paper_bag_template"];
const CAP = 120 * 1024;
const svgOk = (s) => typeof s === "string" && /^<svg[\s>]/.test(s.trim()) && /<\/svg>\s*$/.test(s) && !/<script|onload=|foreignObject|href="http/i.test(s);
const spaced = (d) => JSON.stringify(d).replace(/,"/g, ', "').replace(/":/g, '": ').replace(/,\{/g, ", {").replace(/,\[/g, ", [").length;
const D2R = Math.PI / 180;
const gmst = (ms) => { const J = ms / 86400000 + 2440587.5, T = (J - 2451545) / 36525; return (((280.46061837 + 360.98564736629 * (J - 2451545) + 0.000387933 * T * T - T * T * T / 38710000) % 360) + 360) % 360; };
const alt = (ra, dec, lat, lst) => Math.asin(Math.sin(dec * D2R) * Math.sin(lat * D2R) + Math.cos(dec * D2R) * Math.cos(lat * D2R) * Math.cos((lst - ra) * D2R)) / D2R;

t("no window/document global leaked", typeof globalThis.window === "undefined" && typeof globalThis.document === "undefined");
t("cores bundled (star, fantasy map, paper bag)", typeof MGD72A.star.build === "function" && typeof MGD72B.generate === "function" && typeof MGD72D.bag.bag === "function");
t("3 tools in order", JSON.stringify(TOOL_DEFS.map((d) => d.name)) === JSON.stringify(NAMES), TOOL_DEFS.map((d) => d.name));
for (const d of TOOL_DEFS) {
  const size = spaced(d);
  t(`${d.name}: 'Use when', < 650 chars, ≤ 1.6 KB (as Python counts it), read-only, next hint`, d.description.startsWith("Use when") && d.description.length < 650 && size <= 1640 && d.annotations.readOnlyHint && !d.annotations.openWorldHint && NEXT72[d.name] && d.inputSchema.type === "object", [d.description.length, size]);
}
t("isTools72Tool", NAMES.every(isTools72Tool) && !isTools72Tool("make_ribbon_banner"));

// ---- star map
let r = await call("make_star_map", { city: "Tokyo", date: "2026-12-24", time: "22:00", title: "Our first Christmas" }), s = r.structuredContent;
t("Tokyo 24 Dec 2026 22:00 JST = 13:00 UTC (+9)", !r.isError && s.utc === "2026-12-24T13:00:00.000Z" && s.utc_offset_hours === 9 && s.place === "Tokyo, Japan", s && [s.utc, s.utc_offset_hours]);
t("local sidereal time = Meeus GMST + 139.6503° E (re-derived)", near(s.local_sidereal_time_hours * 15, (gmst(Date.parse(s.utc)) + 139.6503) % 360, 0.002), [s.local_sidereal_time_hours * 15, (gmst(Date.parse(s.utc)) + 139.6503) % 360]);
const sir = s.bright_stars.find((b) => b.name === "Sirius");
t("Sirius altitude re-derived from RA 101.287° / Dec -16.716° (within 0.05°)", sir && near(sir.alt, alt(101.2871, -16.7161, 35.6762, s.local_sidereal_time_hours * 15), 0.06), [sir, alt(101.2871, -16.7161, 35.6762, s.local_sidereal_time_hours * 15)]);
t("default MCP magnitude limit 4.5 keeps the SVG under the 120 KB cap", s.mag_limit === 4.5 && svgOk(s.svg) && s.svg.length <= CAP && (s.svg.match(/<circle /g) || []).length === s.visible_stars, [s.svg && s.svg.length, s.visible_stars]);
t("SVG is a 12 × 16 in poster in mm with the title as text", /width="304.8mm" height="406.4mm"/.test(s.svg) && s.svg.includes(">Our first Christmas</text>") && s.size.name === "12 × 16 in");
t("coordinates rounded to 0.1 mm in paths / circle centres", !/ c[xy]="-?\d+\.\d\d/.test(s.svg) && !/ d="[^"]*\d\.\d\d/.test(s.svg));
t("text: UTC, sidereal time, stars, moon, page link", /13:00 UTC/.test(txt(r)) && /local sidereal time \d+h \d\dm/.test(txt(r)) && /Moon: /.test(txt(r)) && txt(r).includes("https://madegooddesigns.com/tools/star-map/"));
r = await call("make_star_map", { lat: 51.5074, lon: -0.1278, tz: "Europe/London", date: "2026-02-14", time: "21:30", mag_limit: 6 }); s = r.structuredContent;
t("London magnitude 6: ~half of 5,080 stars up, SVG over the cap → facts + page link, no SVG", !r.isError && s.visible_stars > 2300 && s.svg_too_large && !s.svg && /too large/.test(txt(r)) && /star-map\//.test(txt(r)), [s.visible_stars, s.svg_too_large]);
const pol = alt(37.95, 89.26, 51.5074, s.local_sidereal_time_hours * 15);
t("Polaris re-derived at ≈ latitude from London (51.5° ± 0.8°)", near(pol, 51.5, 0.8), pol);
r = await call("make_star_map", { city: "Singapore", date: "2026-03-03", time: "20:00" }); s = r.structuredContent;
t("3 Mar 2026 (total lunar eclipse): full moon, 100% lit, up over Singapore", s.moon.name === "Full moon" && s.moon.fraction > 0.99 && s.moon.alt > 0, s.moon);
r = await call("make_star_map", { city: "New York", date: "2026-07-04", time: "21:00" }); s = r.structuredContent;
t("New York 4 July 9 pm: daylight saving UTC-4 → 01:00 UTC on 5 July", s.utc === "2026-07-05T01:00:00.000Z" && s.utc_offset_hours === -4, s.utc);
r = await call("make_star_map", { lat: -33.87, lon: 151.21, utc_offset: 11, date: "2026-01-01", time: "00:00", size: "a2", layout: "framed", theme: "cream" }); s = r.structuredContent;
t("lat/lon + utc_offset, A2 framed cream: 420 × 594 mm, under cap", !r.isError && s.utc === "2025-12-31T13:00:00.000Z" && s.size.w_mm === 420 && s.svg && s.svg.length <= CAP && s.svg.includes('fill="#f4ecdc"'), [s.utc, s.size, s.svg && s.svg.length]);
for (const sz of MGD72A.star.SIZES.map((x) => x[0])) { r = await call("make_star_map", { city: "Paris", date: "2026-06-21", size: sz }); if (r.isError || !r.structuredContent.svg) t(`size ${sz} under the cap`, false, txt(r).slice(0, 200)); }
t("every poster size returns an SVG under the cap at magnitude 4.5", true);
for (const [a, re] of [[{}, /date/], [{ date: "21/06/2026", city: "Paris" }, /YYYY-MM-DD/], [{ date: "2026-06-21" }, /city|lat/], [{ date: "2026-06-21", city: "Atlantis" }, /Unknown city/],
  [{ date: "2026-06-21", lat: 95, lon: 0 }, /lat/], [{ date: "2026-06-21", city: "Paris", size: "huge" }, /size/], [{ date: "2026-06-21", city: "Paris", tz: "Mars/Olympus" }, /IANA/], [{ date: "2026-06-21", city: "Paris", mag_limit: 9 }, /mag_limit/]]) {
  r = await call("make_star_map", a); t(`bad input → isError: ${JSON.stringify(a)}`, r.isError && re.test(txt(r)), txt(r));
}

// ---- fantasy map
r = await call("make_fantasy_map", { seed: "amber-vale-2471" }); s = r.structuredContent;
const again = (await call("make_fantasy_map", { seed: "amber-vale-2471" })).structuredContent;
t("same seed → identical map and SVG", !r.isError && svgOk(s.svg) && again.svg === s.svg && JSON.stringify(again.towns) === JSON.stringify(s.towns), s && s.seed);
t("default island, parchment, 1500 × 1000, ~40% land, 9 named towns incl. one capital", s.shape === "island" && s.style === "parchment" && s.width === 1500 && s.height === 1000 && near(s.land_fraction, 0.4, 0.03) && s.towns.length === 9 && s.towns.filter((x) => x.capital).length === 1 && s.towns.every((x) => /^[A-Z][a-z]+$/.test(x.name)), s.towns);
t("SVG ≤ 120 KB, region name as title", s.svg.length <= CAP && s.svg.includes(s.names.region), s.svg.length);
t("scale bar for 300 mi across 1500 px = 50 mi / 250 px (nice round 20%)", s.scale.length === 50 && s.scale.units === "mi" && near(s.scale.px, 50 / (300 / 1500), 0.1), s.scale);
const other = (await call("make_fantasy_map", { seed: "iron-tide-9001" })).structuredContent;
t("different seed → different map", other.svg !== s.svg && other.names.region !== s.names.region);
r = await call("make_fantasy_map", { seed: "x", grid: "hex", across: 300, grid_cell: 6 }); s = r.structuredContent;
t("hex grid: 6 mi per cell over 300 mi / 1500 px = 30 px flat-to-flat, drawn as an SVG pattern", s.grid && s.grid.kind === "hex" && near(s.grid.cell_px, 6 / (300 / 1500), 0.01) && /<pattern id="mgd-fm-grid" width="30"/.test(s.svg) && /fill="url\(#mgd-fm-grid\)"/.test(s.svg) && s.svg.length <= CAP, s.grid);
r = await call("make_fantasy_map", { seed: "x", grid: "square", across: 100, units: "km", grid_cell: 5 }); s = r.structuredContent;
t("square grid: 5 km cells over 100 km = 75 px", s.grid.kind === "square" && near(s.grid.cell_px, 75, 0.01) && s.scale.units === "km" && /<pattern id="mgd-fm-grid" width="75" height="75"/.test(s.svg), s.grid);
let over = 0, n = 0;
for (const shape of MGD72B.SHAPES) for (const style of Object.keys(MGD72B.STYLES)) { r = await call("make_fantasy_map", { seed: "s-" + shape, shape, style, grid: "hex" }); n++; if (r.isError || !(r.structuredContent.svg && r.structuredContent.svg.length <= CAP) && !r.structuredContent.svg_too_large) over++; }
t(`all ${n} shape × style combos (with hex grid) return an SVG ≤ 120 KB or flag svg_too_large`, over === 0, over);
r = await call("make_fantasy_map", { seed: "tiny", towns: 3, rivers: 2, roads: false, title: "The Reach", style: "treasure" }); s = r.structuredContent;
t("3 towns, ≤ 2 rivers, no roads, custom title, treasure style", s.towns.length === 3 && s.rivers <= 2 && s.roads === 0 && s.svg.includes(">The Reach<") && s.style === "treasure", [s.towns.length, s.rivers, s.roads]);
r = await call("make_fantasy_map", {}); t("no seed → a random seed is chosen and reported", !r.isError && typeof r.structuredContent.seed === "string" && r.structuredContent.seed.length > 3);
for (const a of [{ shape: "donut" }, { style: "neon" }, { grid: "triangle" }, { land: 95 }, { towns: 40 }, { detail: "ultra" }]) { r = await call("make_fantasy_map", a); t(`bad input → isError: ${JSON.stringify(a)}`, r.isError, txt(r)); }

// ---- paper bag
r = await call("make_paper_bag_template", {}); s = r.structuredContent;
t("default 160 × 80 × 220 mm: net (2·160 + 2·80 + 15) × (30 + 220 + 60) = 495 × 310", !r.isError && s.net.w === 2 * 160 + 2 * 80 + 15 && s.net.h === 30 + 220 + 60 && s.bottom_flap === 0.75 * 80 && s.overlap === 2 * 60 - 80 && s.side_flap === 40, s && s.net);
t("panels: front, right side, back, left side at x = 0, 160, 240, 400", JSON.stringify(s.panels.map((p) => [p.id, p.x, p.w])) === JSON.stringify([["front", 0, 160], ["side1", 160, 80], ["back", 240, 160], ["side2", 400, 80]]));
t("8 handle-hole marks (2 holes front + 2 back, through hem and body)", s.holes.length === 8);
t("true-size SVG 495 × 310 mm, ≤ 6 KB", svgOk(s.svg) && /width="495mm" height="310mm"/.test(s.svg) && s.svg.length < 6000, s.svg.length);
t("sheets: Letter and A4 tiles listed", s.sheets.find((x) => x.paper === "US Letter").sheets >= 2 && s.sheets.find((x) => x.paper === "A4").sheets >= 2, s.sheets);
r = await call("make_paper_bag_template", { width: 4, gusset: 2.5, height: 6, unit: "in" }); s = r.structuredContent;
t("inches: 4 × 2.5 × 6 in → net width (13 in + 15 mm flap) re-derived", near(s.net.w, (2 * 4 + 2 * 2.5) + 15 / 25.4, 0.01) && s.assembled.w === 4 && s.unit === "in", s.net);
r = await call("make_paper_bag_template", { handles: false }); t("handles false → no holes", r.structuredContent.holes.length === 0);
r = await call("make_paper_bag_template", { width: 100, gusset: 150 }); t("gusset deeper than width → warning", r.structuredContent.warnings.some((w) => /gusset/.test(w)));
r = await call("make_paper_bag_template", { preset: "wine" }); s = r.structuredContent; t("wine preset 100 × 100 × 360", s.width === 100 && s.gusset === 100 && s.height === 360);
for (const a of [{ width: 5 }, { unit: "ft" }, { preset: "bucket" }, { height: -3 }]) { r = await call("make_paper_bag_template", a); t(`bad input → isError: ${JSON.stringify(a)}`, r.isError, txt(r)); }
console.log(`\n${ok} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
