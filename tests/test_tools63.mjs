// Node unit test of the batch-63 MCP layer (src/tools_core63.js generated cores + src/mcp_tools63.js).
// Tools: get_sheet_metal_gauge, calc_sheet_metal_bend, make_cone_pattern, make_living_hinge, make_nutrition_label, get_desk_ergonomics.
// Every number is re-derived here from the published formula, not copied from the core. Run: node tests/test_tools63.mjs (exit 1 on failure)
import { MGDMetal, MGDCone, MGDHinge, MGDNutrition, MGDErgo } from "../src/tools_core63.js";
import { callTools63Tool as call, TOOL_DEFS, NEXT63, isTools63Tool } from "../src/mcp_tools63.js";
let ok = 0, fail = 0;
const t = (name, cond, info) => { cond ? ok++ : fail++; console.log((cond ? "PASS " : "FAIL ") + name + (cond ? "" : " | " + String(JSON.stringify(info)).slice(0, 400))); };
const txt = (r) => r.content.map((c) => c.text).join("\n");
const near = (a, b, e = 1e-3) => Math.abs(a - b) <= e;
const NAMES = ["get_sheet_metal_gauge", "calc_sheet_metal_bend", "make_cone_pattern", "make_living_hinge", "make_nutrition_label", "get_desk_ergonomics"];

t("no window global leaked", typeof globalThis.window === "undefined");
t("all 5 cores bundled", [MGDMetal, MGDCone, MGDHinge, MGDNutrition, MGDErgo].every((x) => x && typeof x === "object"));
t("6 tools in order", JSON.stringify(TOOL_DEFS.map((d) => d.name)) === JSON.stringify(NAMES), TOOL_DEFS.map((d) => d.name));
for (const d of TOOL_DEFS) {
  const size = JSON.stringify(d).length;
  t(`${d.name}: 'Use when', < 650 chars, ≤ 1.6 KB, read-only, next hint, object schema`, d.description.startsWith("Use when") && d.description.length < 650 && size <= 1640 && d.annotations.readOnlyHint && NEXT63[d.name] && d.inputSchema.type === "object", [d.description.length, size]);
}
t("isTools63Tool", NAMES.every(isTools63Tool) && !isTools63Tool("make_dieline"));

// ---- gauge: Manufacturers' Standard Gauge: thickness(in) = (lb/ft²) / 41.82 ; 16 ga = 2.5 lb/ft² → 0.0598 in
let r = await call("get_sheet_metal_gauge", { gauge: 16 }), s = r.structuredContent;
t("16 ga steel = 0.0598 in = 1.519 mm (2.5 lb/ft² / 41.82)", !r.isError && s.inch === 0.0598 && near(s.mm, 0.0598 * 25.4, 0.001) && near(2.5 / 41.82, 0.0598, 0.0001), s);
r = await call("get_sheet_metal_gauge", { material: "aluminium", gauge: 16 }); s = r.structuredContent;
t("16 ga aluminium follows AWG: 0.0508 in (= 0.005 × 92^((36−16)/39))", near(s.inch, 0.005 * Math.pow(92, 20 / 39), 0.0001), s);
r = await call("get_sheet_metal_gauge", { material: "galv", gauge: 20 }); s = r.structuredContent;
t("alias galv → galvanized, 20 ga = 0.0396 in", s.material === "galvanized" && s.inch === 0.0396, s);
r = await call("get_sheet_metal_gauge", { thickness: 1.5, unit: "mm" }); s = r.structuredContent;
t("nearest steel gauge to 1.5 mm = 16 ga", s.mode === "nearest" && s.best.gauge === 16, s.best);
r = await call("get_sheet_metal_gauge", { gauge: 10, length: 1000, width: 2000 }); s = r.structuredContent;
t("sheet weight 1×2 m of 10 ga steel = MSG 5.625 lb/ft² × 4.88243 kg/m² per lb/ft² × 2 m²", near(s.sheet_weight_kg, 5.625 * 4.88243 * 2, 0.3), [s.sheet_weight_kg, 5.625 * 4.88243 * 2]);
// 9-Nov-2026 (mcp-errors-r1): no gauge/thickness is now the common-gauge chart
t("no gauge/thickness → chart, not an error", !(await call("get_sheet_metal_gauge", {})).isError);
t("errors: bad material, missing gauge → isError", (await call("get_sheet_metal_gauge", { material: "unobtanium", gauge: 16 })).isError && (await call("get_sheet_metal_gauge", { gauge: 99 })).isError);

// ---- bend: BA = π/180·A·(R + K·T); OSSB = tan(A/2)(R+T); BD = 2·OSSB − BA
r = await call("calc_sheet_metal_bend", { thickness: 2, radius: 2, angle: 90, k: 0.33, flanges: [50, 30], width: 40, format: "svg" }); s = r.structuredContent;
const BA = Math.PI / 180 * 90 * (2 + 0.33 * 2), OS = Math.tan(Math.PI / 4) * 4, BD = 2 * OS - BA;
t("BA / OSSB / BD match the formulas (T2 R2 90° K0.33)", near(s.ba, BA) && near(s.ossb, OS) && near(s.bd, BD), [s.ba, BA, s.bd, BD]);
t("flat = 50 + 30 − BD (outside dims)", near(s.flat, 80 - BD), [s.flat, 80 - BD]);
t("flat SVG true size, mm, with a bend line", /width="[\d.]+mm"/.test(s.svg || "") && /bend/i.test(s.svg), (s.svg || "").slice(0, 200));
r = await call("calc_sheet_metal_bend", { thickness: 1.5, radius: 1.5, angle: 135, k: 0.4, flanges: [20, 60, 20], dims: "inside", format: "dxf" }); s = r.structuredContent;
t("U part: 2 bends, DXF R12 with CUT + BEND layers", s.bends.length === 2 && /AC1009/.test(s.dxf) && /\nCUT\r?\n/.test(s.dxf) && /\nBEND\r?\n/.test(s.dxf), s.bends.length);
r = await call("calc_sheet_metal_bend", { thickness: 0.06, radius: 0.06, unit: "in" }); s = r.structuredContent;
t("inch input, K from the material table (0 < K ≤ 0.5), no flat without flanges", s.unit === "in" && s.k > 0 && s.k <= 0.5 && s.flat === null, s);
t("bend errors: thickness 0, negative flange → isError", (await call("calc_sheet_metal_bend", { thickness: 0, radius: 1 })).isError && (await call("calc_sheet_metal_bend", { thickness: 1, radius: 1, flanges: [10, -5] })).isError);

// ---- cone: slant = √(h² + ((d1−d2)/2)²); R1 = slant·d1/(d1−d2); θ = 360·d1/(2·R1)
r = await call("make_cone_pattern", { d1: 300, d2: 150, height: 200 }); s = r.structuredContent;
const sl = Math.hypot(200, 75), R1 = sl * 300 / 150;
t("frustum 300/150 × 200: slant, R1, R2, sweep from the formulas", near(s.slant, sl, 0.01) && near(s.R1, R1, 0.01) && near(s.R2, R1 / 2, 0.01) && near(s.theta, 360 * 150 / R1, 0.01), [s.slant, s.R1, s.R2, s.theta]);
t("SVG inline, mm units, a cut path", /width="[\d.]+mm"/.test(s.svg) && /<path[^>]+class="cut"/.test(s.svg), (s.svg || "").slice(0, 200));
r = await call("make_cone_pattern", { d1: 200, d2: 0, slant: 150, format: "dxf" }); s = r.structuredContent;
t("pointed cone from slant: θ = 360·r/slant, DXF with an ARC", s.type === "cone" && near(s.theta, 360 * 100 / 150, 0.01) && /\nARC\r?\n/.test(s.dxf), [s.theta, s.type]);
r = await call("make_cone_pattern", { d1: 100, d2: 100, height: 80, format: "none" }); s = r.structuredContent;
t("equal diameters → cylinder, no file", s.type === "cylinder" && !s.svg && !s.dxf, s.type);
r = await call("make_cone_pattern", { d1: 600, d2: 580, height: 50, segments: 4, format: "none" }); s = r.structuredContent;
t("4 segments: each piece sweeps θ/4", s.segments === 4 && near(s.theta_piece * 4, s.theta, 0.01), [s.theta, s.theta_piece]);
t("cone errors: no d1, no height/slant → isError", (await call("make_cone_pattern", { height: 10 })).isError && (await call("make_cone_pattern", { d1: 100, d2: 50 })).isError);

// ---- hinge
r = await call("make_living_hinge", {}); s = r.structuredContent;
t("defaults: staggered 40 × 100 mm plywood 3 mm, pitch 2 → ~20 columns, cuts > 0, SVG true size", s.style === "staggered" && s.width === 40 && s.height === 100 && s.cols >= 19 && s.stats.cuts > 0 && /width="[\d.]+mm"/.test(s.svg), [s.cols, s.stats]);
t("bend estimate positive, min radius ≥ 2 × thickness (core cap)", s.max_angle > 0 && s.min_radius >= 2 * 3 - 1e-9, [s.max_angle, s.min_radius]);
const r2w = await call("make_living_hinge", { width: 80 });
t("a wider hinge allows more bend", r2w.structuredContent.max_angle >= s.max_angle, [r2w.structuredContent.max_angle, s.max_angle]);
r = await call("make_living_hinge", { style: "lattice", material: "acrylic", unit: "in", width: 2, height: 4, format: "dxf" }); s = r.structuredContent;
t("lattice in inches → DXF with entities on CUT", s.style === "lattice" && s.unit === "in" && /\nCUT\r?\n/.test(s.dxf), s.style);
t("hinge error: pitch 0 → isError", (await call("make_living_hinge", { pitch: 0 })).isError);

// ---- nutrition: 21 CFR 101.9(c) rounding re-derived
const NT = { calories: 234, fat: 4.7, satfat: 0.4, transfat: 0, cholesterol: 3, sodium: 137, carb: 0.7, fiber: 0.3, sugars: 12.5, addedsugars: 10, protein: 3.2, vitd: 2, calcium: 260, iron: 8, potassium: 240 };
r = await call("make_nutrition_label", { nutrients: NT, servings_per_container: "About 8", serving_size: "2/3 cup", serving_size_metric: "55g" }); s = r.structuredContent;
const row = (k) => s.rows.find((x) => x.key === k);
t("calories 234 → 230 (>50 kcal: nearest 10)", row("calories").declared === "230", row("calories"));
t("fat 4.7 g → 4.5g (<5 g: nearest 0.5); sat fat 0.4 → 0g", row("fat").declared === "4.5g" && row("satfat").declared === "0g", [row("fat"), row("satfat")]);
t("cholesterol 3 mg → 'less than 5mg'", /^(<|less than )5\s?mg$/i.test(row("cholesterol").declared), row("cholesterol"));
t("sodium 137 mg → 135mg (5–140: nearest 5)", row("sodium").declared === "135mg", row("sodium"));
t("carbohydrate 0.7 g → 'less than 1g'; fiber 0.3 → 0g", /^(<|less than )1\s?g$/i.test(row("carb").declared) && row("fiber").declared === "0g", [row("carb"), row("fiber")]);
t("sugars 12.5 → 13g (nearest 1 g, half up), protein 3.2 → 3g", row("sugars").declared === "13g" && row("protein").declared === "3g", [row("sugars"), row("protein")]);
t("%DV: fat 4.5/78 = 6%, sodium 135/2300 = 6%, added sugars 10/50 = 20%", row("fat").dvText === "6%" && row("sodium").dvText === "6%" && row("addedsugars").dvText === "20%", [row("fat").dvText, row("sodium").dvText]);
t("%DV vitamins: iron 8/18 = 44.4 → 45% (nearest 5), potassium 240/4700 = 5.1 → 6% (nearest 2)", row("iron").dvText === "45%" && row("potassium").dvText === "6%", [row("iron").dvText, row("potassium").dvText]);
t("SVG panel true size in pt with 'Nutrition Facts' text", /width="[\d.]+pt"/.test(s.svg) && /Nutrition Facts/.test(s.svg), (s.svg || "").slice(0, 160));
t("text carries the compliance caveat + page link", /confirm with your regulator/.test(txt(r)) && /nutrition-label-generator/.test(txt(r)));
r = await call("make_nutrition_label", { nutrients: { "Total Fat": 0.2, Calories: 3, Sodium: 2, carbs: 0.2, bogus: 1 }, output: "none" }); s = r.structuredContent;
t("aliases (Total Fat, carbs), calories <5 → 0, unknown key reported, no SVG", s.rows.find((x) => x.key === "calories").declared === "0" && s.rows.find((x) => x.key === "fat").raw === 0.2 && /bogus/.test(txt(r)) && !s.svg, txt(r).slice(0, 300));
t("mostly-zero product: simplified format eligible", s.simplified_eligible === true, s.insignificant_count);
for (const f of ["tabular", "linear", "simplified"]) { const x = await call("make_nutrition_label", { nutrients: NT, format: f }); t(`format ${f} renders an SVG`, !x.isError && x.structuredContent.format === f && /<svg/.test(x.structuredContent.svg), x.isError && txt(x)); }
t("nutrition errors: array, negative, no known keys → isError", (await call("make_nutrition_label", { nutrients: [1] })).isError && (await call("make_nutrition_label", { nutrients: { fat: -1 } })).isError && (await call("make_nutrition_label", { nutrients: { foo: 1 } })).isError);

// ---- desk ergonomics: ANSUR II ratios (seat 0.2415, sit elbow 0.3828, stand elbow 0.6291, sit eye 0.7003) + shoes 2.5 cm, desk = elbow − 3 cm
r = await call("get_desk_ergonomics", { height: 175 }); s = r.structuredContent;
t("175 cm: seat ≈ 0.2415·175 + 2.5", near(s.sit.seat, 0.2415 * 175 + 2.5, 0.06), s.sit.seat);
t("sit desk ≈ 0.3828·175 + 2.5 − 3; stand desk ≈ 0.6291·175 + 2.5 − 3", near(s.sit.desk, 0.3828 * 175 - 0.5, 0.06) && near(s.stand.desk, 0.6291 * 175 - 0.5, 0.06), [s.sit.desk, s.stand.desk]);
t("monitor top ≈ seated eye height (0.7003·175 + 2.5), view 50–100 cm", near(s.sit.monitorTop, 0.7003 * 175 + 2.5, 0.06) && s.sit.viewMin === 50 && s.sit.viewMax === 100, s.sit);
t("ranges bracket the estimate", s.sit.ranges.desk[0] < s.sit.desk && s.sit.desk < s.sit.ranges.desk[1], s.sit.ranges);
r = await call("get_desk_ergonomics", { height: 69, unit: "in", mode: "stand", elbow_stand: 44 }); s = r.structuredContent;
t("inches + measured standing elbow: desk = 44 − keyboard allowance, sit omitted", s.unit === "in" && s.stand.measured && s.stand.desk < 44 && s.stand.desk > 42 && !s.sit, s.stand);
t("ergonomics cites ANSUR II + OSHA", /ANSUR II/.test(txt(r)) && /OSHA/.test(txt(r)));
t("ergonomics error: height 0 → isError", (await call("get_desk_ergonomics", { height: 0 })).isError);
t("unknown tool → isError", (await call("nope", {})).isError);
console.log(`\n${ok} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
