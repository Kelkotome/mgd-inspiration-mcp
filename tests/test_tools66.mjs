// Node unit test of the batch-66 MCP layer (src/tools_core66.js generated cores + src/mcp_tools66.js).
// Tools: make_speech_bubble, make_coat_of_arms, make_jcard_template, calc_field_of_view, calc_exposure_value.
// Numbers are re-derived here from formulas / published sizes, not copied from the core. Run: node tests/test_tools66.mjs (exit 1 on failure)
import { MGDBubble, MGDHeraldry, MGDJCard, MGDFov, MGDEv } from "../src/tools_core66.js";
import { callTools66Tool as call, TOOL_DEFS, NEXT66, isTools66Tool } from "../src/mcp_tools66.js";
let ok = 0, fail = 0;
const t = (name, cond, info) => { cond ? ok++ : fail++; console.log((cond ? "PASS " : "FAIL ") + name + (cond ? "" : " | " + String(JSON.stringify(info)).slice(0, 400))); };
const txt = (r) => r.content.map((c) => c.text).join("\n");
const near = (a, b, e = 1e-2) => Math.abs(a - b) <= e;
const deg = (x) => (x * 180) / Math.PI;
const NAMES = ["make_speech_bubble", "make_coat_of_arms", "make_jcard_template", "calc_field_of_view", "calc_exposure_value"];
const svgOk = (s) => typeof s === "string" && /^<svg[\s>]/.test(s.trim()) && /<\/svg>\s*$/.test(s) && !/<script|onload=|foreignObject|href="http/i.test(s);

t("no window/document global leaked", typeof globalThis.window === "undefined" && typeof globalThis.document === "undefined");
t("all 5 cores bundled", [MGDBubble, MGDHeraldry, MGDJCard, MGDFov, MGDEv].every((x) => x && typeof x === "object"));
t("5 tools in order", JSON.stringify(TOOL_DEFS.map((d) => d.name)) === JSON.stringify(NAMES), TOOL_DEFS.map((d) => d.name));
for (const d of TOOL_DEFS) {
  const size = JSON.stringify(d).length;
  t(`${d.name}: 'Use when', < 650 chars, ≤ 1.6 KB, read-only, next hint, object schema`, d.description.startsWith("Use when") && d.description.length < 650 && size <= 1640 && d.annotations.readOnlyHint && !d.annotations.openWorldHint && NEXT66[d.name] && d.inputSchema.type === "object", [d.description.length, size]);
}
t("isTools66Tool", NAMES.every(isTools66Tool) && !isTools66Tool("calc_depth_of_field"));
t("no trademark/brand names in tool descriptions", !TOOL_DEFS.some((d) => /tyvek|maxell|tdk|sony|canon|nikon|apple|iphone|marvel|dc comics|pantone/i.test(d.description)));

// ---- speech bubble
let r = await call("make_speech_bubble", { shape: "speech", width: 300, height: 160, tail: [60, 240], text: "Hello there!" }), s = r.structuredContent;
t("speech: body 300 × 160, one wedge tail reaching (60, 240), valid SVG, text placed", !r.isError && s.body.w === 300 && s.body.h === 160 && s.tails.length === 1 && s.tails[0].tip[0] === 60 && s.tails[0].tip[1] === 240 && svgOk(s.svg) && s.text.lines.length >= 1, s && s.tails);
t("viewBox contains the tail tip", s.viewBox[1] + s.viewBox[3] >= 240 && s.viewBox[0] <= 60, s.viewBox);
t("text is escaped inside the SVG", (await call("make_speech_bubble", { text: "<b>&</b>" })).structuredContent.svg.includes("&lt;b&gt;&amp;"));
t("deterministic: same input → identical SVG", (await call("make_speech_bubble", { shape: "shout", seed: 1, text: "BOOM" })).structuredContent.svg === (await call("make_speech_bubble", { shape: "shout", seed: 1, text: "BOOM" })).structuredContent.svg);
r = await call("make_speech_bubble", { shape: "thought" });
t("thought: trail tail", !r.isError && r.structuredContent.tails[0].kind === "trail", r.structuredContent.tails);
r = await call("make_speech_bubble", { shape: "box", tail: [] });
t("tail [] = no tail", !r.isError && r.structuredContent.tails.length === 0, r.structuredContent.tails);
r = await call("make_speech_bubble", { shape: "whisper", tails: [[20, 300], [200, 300], [340, 300]] });
t("whisper: 3 tails, dashed outline", !r.isError && r.structuredContent.tails.length === 3 && /stroke-dasharray/.test(r.structuredContent.svg), r.structuredContent.tails.length);
for (const [n, a] of [["bad shape", { shape: "heart" }], ["bad colour", { fill: "red;}" }], ["4 tails", { tails: [[1, 1], [2, 2], [3, 3], [4, 4]] }], ["bad tail", { tail: ["x"] }], ["text > 600", { text: "x".repeat(601) }]])
  t(`bubble ${n} → isError`, (await call("make_speech_bubble", a)).isError === true, n);

// ---- coat of arms
r = await call("make_coat_of_arms", { division: "per-pale", tinctures: ["azure", "or"], ordinary: "chevron", ordinary_tincture: "gules", charge: "mullet", charge_count: 3, charge_tincture: "argent" }); s = r.structuredContent;
t("blazon: Per pale Azure and Or, a chevron Gules between three mullets Argent", !r.isError && s.blazon === "Per pale Azure and Or, a chevron Gules between three mullets Argent", s && s.blazon);
t("arms SVG valid", svgOk(s.svg));
r = await call("make_coat_of_arms", { tinctures: ["gules"], ordinary: "fess", ordinary_tincture: "azure" }); s = r.structuredContent;
t("colour on colour (azure fess on gules) fails the rule of tincture", !r.isError && s.tincture_rule.ok === false && s.tincture_rule.problems.length > 0, s.tincture_rule);
t("blazon text: Gules, a fess Azure", /^Gules, a fess Azure/.test(s.blazon), s.blazon);
r = await call("make_coat_of_arms", { tinctures: ["argent"], ordinary: "cross", ordinary_tincture: "gules" });
t("Argent, a cross Gules passes the rule", r.structuredContent.tincture_rule.ok === true && /^Argent, a cross Gules/.test(r.structuredContent.blazon), r.structuredContent.blazon);
r = await call("make_coat_of_arms", { motto: "Fortis et liber", format: "none" });
t("format none: no SVG, motto kept", !r.isError && !r.structuredContent.svg && r.structuredContent.motto === "Fortis et liber", r.structuredContent);
t("page link + not-a-grant note", /coat-of-arms-maker\//.test(txt(r)) && /not a grant/i.test(txt(r)));
for (const [n, a] of [["unknown tincture", { tinctures: ["pink"] }], ["same tinctures per pale", { division: "per-pale", tinctures: ["or", "or"] }], ["13 charges", { charge: "mullet", charge_count: 13 }]])
  t(`arms ${n} → isError`, (await call("make_coat_of_arms", a)).isError === true, n);

// ---- J-card (standard J-card 4 1/8 × 4 in = 104.775 × 101.6 mm)
r = await call("make_jcard_template", {}); s = r.structuredContent;
t("jcard-3: trim 104.775 × 101.6 mm, bleed box +6 mm, 3 panels, true-size SVG", !r.isError && near(s.size.trimW, 104.775, 1e-3) && near(s.size.trimH, 101.6, 1e-3) && near(s.size.w, 110.775, 1e-3) && s.panels.length === 3 && /width="110\.775mm"/.test(s.svg) && svgOk(s.svg), s && s.size);
t("px at 300 DPI = mm / 25.4 × 300", near(s.px.w, Math.round(110.775 / 25.4 * 300), 1) && near(s.px.h, Math.round(107.6 / 25.4 * 300), 1), s.px);
t("panel widths sum to the trim width", near(s.panels.reduce((x, p) => x + p.w, 0), 104.775, 0.01), s.panels.map((p) => p.w));
r = await call("make_jcard_template", { part: "jcard-5", unit: "in", format: "none" }); s = r.structuredContent;
t("jcard-5 in inches: 5 panels, trim height 4 in, no SVG", !r.isError && s.panels.length >= 5 && near(s.size.trimH, 4, 1e-3) && !s.svg, s && s.size);
r = await call("make_jcard_template", { part: "shell" });
t("shell labels flagged typical", !r.isError && /typical/i.test(txt(r)));
for (const [n, a] of [["bleed 20 mm", { bleed: 20 }], ["dpi 5000", { dpi: 5000 }]]) t(`jcard ${n} → isError`, (await call("make_jcard_template", a)).isError === true, n);

// ---- field of view (rectilinear: 2·atan(d / 2f))
r = await call("calc_field_of_view", { focal: 50, distance: 3 }); s = r.structuredContent;
t("50 mm full frame: 39.6° h, 27.0° v, 46.8° d", near(s.angle.h, deg(2 * Math.atan(18 / 50)), 0.01) && near(s.angle.v, deg(2 * Math.atan(12 / 50)), 0.01) && near(s.angle.d, deg(2 * Math.atan(Math.hypot(36, 24) / 2 / 50)), 0.01), s.angle);
t("framed width at 3 m = 3 × 36 / 50 = 2.16 m", near(s.frame.w, 2.16, 0.01) && near(s.frame.h, 1.44, 0.01), s.frame);
r = await call("calc_field_of_view", { focal: 35, sensor: "apsc15" });
t("APS-C 1.5×: 35 mm ≈ 53 mm equivalent", near(r.structuredContent.equivFocal, 35 * r.structuredContent.cropFactor, 0.6) && r.structuredContent.cropFactor > 1.45 && r.structuredContent.cropFactor < 1.6, r.structuredContent);
r = await call("calc_field_of_view", { op: "focal_for", frame_width: 2.16, distance: 3 });
t("focal_for: 2.16 m wide at 3 m on full frame → 50 mm", !r.isError && near(r.structuredContent.focal, 50, 0.1), r.structuredContent && r.structuredContent.focal);
r = await call("calc_field_of_view", { op: "convert", vfov: 59, aspect: "16:9" });
const hf = deg(2 * Math.atan(Math.tan((59 * Math.PI) / 360) * 16 / 9));
t("convert: vfov 59° at 16:9 → hfov 2·atan(tan(29.5°)·16/9)", !r.isError && near(r.structuredContent.hfov, hf, 0.05), [r.structuredContent && r.structuredContent.hfov, hf]);
for (const [n, a] of [["no focal", {}], ["focal 0", { focal: 0 }], ["convert without aspect", { op: "convert", hfov: 90 }]]) t(`fov ${n} → isError`, (await call("calc_field_of_view", a)).isError === true, n);

// ---- exposure value (EV = log2(N²/t), EV100 = EV − log2(ISO/100))
r = await call("calc_exposure_value", { aperture: 16, shutter: "1/125", iso: 100 }); s = r.structuredContent;
t("f/16 1/125 ISO 100: EV100 = log2(256·125) ≈ 14.97 (sunny 16)", near(s.ev100, Math.log2(256 * 125), 0.01) && /sun/i.test(txt(r)), s.ev100);
r = await call("calc_exposure_value", { aperture: 2.8, shutter: "1/60", iso: 1600 });
t("EV100 = EV − 4 at ISO 1600", near(r.structuredContent.ev100, Math.log2(7.84 * 60) - 4, 0.01), r.structuredContent.ev100);
r = await call("calc_exposure_value", { op: "solve", solve_for: "shutter", ev100: 15, aperture: 16, iso: 100 });
t("solve shutter for EV100 15 at f/16: 256/2^15 s ≈ 1/128, nearest 1/125", !r.isError && near(r.structuredContent.value, 256 / 2 ** 15, 1e-4) && /1\/125/.test(r.structuredContent.nearest.text), r.structuredContent);
r = await call("calc_exposure_value", { op: "nd", shutter: "1/60", factor: 1000 });
t("ND1000: 1/60 s → 16.7 s (shown as 17 s), ~10 stops, density 3", !r.isError && near(r.structuredContent.newShutter, 1000 / 60, 0.01) && near(r.structuredContent.stops, Math.log2(1000), 0.01) && near(r.structuredContent.density, 3, 0.01), r.structuredContent);
r = await call("calc_exposure_value", { op: "equivalents", aperture: 8, shutter: "1/250", iso: 100 });
t("equivalents: table rows, one at f/8 1/250", !r.isError && r.structuredContent.rows.length >= 5 && /\| Aperture \| Shutter \|/.test(txt(r)), r.structuredContent.rows && r.structuredContent.rows.length);
for (const [n, a] of [["no shutter", { aperture: 8 }], ["bad shutter", { aperture: 8, shutter: "fast", iso: 100 }], ["nd without amount", { op: "nd", shutter: "1/60" }]]) t(`ev ${n} → isError`, (await call("calc_exposure_value", a)).isError === true, n);

t("unknown tool → isError", (await call("nope", {})).isError === true);
console.log(`\n${ok} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
