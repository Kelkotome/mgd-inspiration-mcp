// Node unit test of the batch-80 MCP layer (src/tools_core80.js generated cores + src/mcp_tools80.js).
// Tools: make_habit_tracker, make_badge.
// Calendar facts are re-derived here with Date.UTC (days in month, weekday of the 1st, weeks covering the month, leap years), not copied from the core.
// Run: node tests/test_tools80.mjs
import { MGD80C, MGD80D, MGD72Icons } from "../src/tools_core80.js";
import { callTools80Tool as call, TOOL_DEFS, NEXT80, isTools80Tool } from "../src/mcp_tools80.js";
let ok = 0, fail = 0;
const t = (name, cond, info) => { cond ? ok++ : fail++; console.log((cond ? "PASS " : "FAIL ") + name + (cond ? "" : " | " + String(JSON.stringify(info)).slice(0, 400))); };
const txt = (r) => r.content.map((c) => c.text).join("\n");
const NAMES = ["make_habit_tracker", "make_badge"], CAP = 120 * 1024;
const svgOk = (s) => typeof s === "string" && /^<svg[\s>]/.test(s) && /<\/svg>\s*$/.test(s) && !/<script|onload=|foreignObject|href="http/i.test(s);
const spaced = (d) => JSON.stringify(d).replace(/,"/g, ', "').replace(/":/g, '": ').replace(/,\{/g, ", {").replace(/,\[/g, ", [").length;
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const dim = (y, m) => new Date(Date.UTC(y, m, 0)).getUTCDate(), wd = (y, m, d) => new Date(Date.UTC(y, m - 1, d)).getUTCDay();
const iso = (ms) => new Date(ms).toISOString().slice(0, 10);

t("no window/document global leaked", typeof globalThis.window === "undefined" && typeof globalThis.document === "undefined");
t("cores bundled (habit, badge, 83 icons)", typeof MGD80C.habit.layout === "function" && typeof MGD80D.badge === "function" && Object.keys(MGD72Icons.icons).length === 83);
t("2 tools in order", JSON.stringify(TOOL_DEFS.map((d) => d.name)) === JSON.stringify(NAMES), TOOL_DEFS.map((d) => d.name));
for (const d of TOOL_DEFS) {
  const size = spaced(d);
  t(`${d.name}: 'Use when', < 650 chars, ≤ 1.6 KB (as Python counts it), read-only, next hint`, d.description.startsWith("Use when") && d.description.length < 650 && size <= 1640 && d.annotations.readOnlyHint && !d.annotations.openWorldHint && NEXT80[d.name] && d.inputSchema.type === "object", [d.description.length, size]);
}
t("isTools80Tool", NAMES.every(isTools80Tool) && !isTools80Tool("get_frame_size"));

// ---- habit tracker: monthly
let r = await call("make_habit_tracker", {}), s = r.structuredContent;
t("default: monthly November 2026, 30 days, the 1st is a Sunday, 8 sample habits", !r.isError && s.layout === "monthly" && s.days_in_month === dim(2026, 11) && s.first_weekday === DAYS[wd(2026, 11, 1)] && s.habits.length === 8 && s.habits.every(Boolean), s);
t("monthly: one landscape Letter page 279.4 × 215.9 mm, true-size SVG ≤ 120 KB", s.pages === 1 && s.orientation === "landscape" && s.svgs.length === 1 && svgOk(s.svgs[0]) && s.svgs[0].includes('width="279.4mm"') && s.svgs[0].length <= CAP);
t("monthly: day numbers 1..30 drawn, no 31", [1, 15, 30].every((d) => s.svgs[0].includes(`>${d}</text>`)) && !s.svgs[0].includes(">31</text>"));
t("habit names in the SVG; text links the page", s.habits.every((h) => s.svgs[0].includes(h.replace(/&/g, "&amp;").replace(/,/g, ",").slice(0, 10))) && txt(r).includes("/tools/habit-tracker-template/"));
for (const [y, m] of [[2028, 2], [2027, 2], [2026, 1], [2025, 6], [2100, 2], [2000, 2]]) {
  const q = (await call("make_habit_tracker", { year: y, month: m, count: 5 })).structuredContent;
  t(`${y}-${m}: ${dim(y, m)} days, 1st = ${DAYS[wd(y, m, 1)]}, 5 blank lines`, q.days_in_month === dim(y, m) && q.first_weekday === DAYS[wd(y, m, 1)] && q.habits.length === 5 && q.habits.every((h) => h === "") && q.svgs[0].includes(`>${dim(y, m)}</text>`), [q.days_in_month, q.first_weekday]);
}
const nm = (await call("make_habit_tracker", { habits: ["Run 5k", "Read <30 min>", "", "Stretch"] })).structuredContent;
t("named habits incl. a blank line, escaped", nm.habits.length === 4 && nm.habits[2] === "" && nm.svgs[0].includes("Read &lt;30 min&gt;") && !nm.svgs[0].includes("<30 min>"));
const a5 = (await call("make_habit_tracker", { paper: "a5", orientation: "portrait", style: "pastel" })).structuredContent;
t("A5 portrait 148 × 210 mm, pastel", a5.page_mm[0] === 148 && a5.page_mm[1] === 210 && a5.style === "pastel" && a5.svgs[0].includes('width="148mm"'));
const big = (await call("make_habit_tracker", { count: 20, style: "dots" })).structuredContent;
t("20 habits dot grid still one page ≤ 120 KB", big.pages === 1 && big.svgs[0].length <= CAP, big.svgs[0].length);

// ---- weekly
for (const [y, m, ws] of [[2027, 2, "sun"], [2026, 11, "mon"], [2026, 3, "mon"], [2021, 2, "mon"]]) {
  const q = (await call("make_habit_tracker", { layout: "weekly", year: y, month: m, week_start: ws, count: 3 })).structuredContent, sd = ws === "sun" ? 0 : 1;
  const back = (wd(y, m, 1) - sd + 7) % 7, n = Math.ceil((back + dim(y, m)) / 7), start = Date.UTC(y, m - 1, 1) - back * 864e5;
  const exp = Array.from({ length: n }, (_, i) => Array.from({ length: 7 }, (_, k) => iso(start + (i * 7 + k) * 864e5)));
  t(`weekly ${y}-${m} (${ws}): ${n} weeks, each starting on ${DAYS[sd]}, covering the 1st to the ${dim(y, m)}th, one portrait page each`,
    JSON.stringify(q.weeks) === JSON.stringify(exp) && q.pages === n && q.svgs.length === n && q.orientation === "portrait" && q.svgs.every(svgOk), [q.weeks && q.weeks.length, n, q.weeks && q.weeks[0]]);
}

// ---- yearly
r = await call("make_habit_tracker", { layout: "yearly", year: 2028, habits: ["Water", "Sleep"] }); s = r.structuredContent;
t("yearly 2028 (leap): 366 days, 6 greyed cells, one page per habit named on it", s.days_in_year === 366 && s.off_cells === 6 && s.pages === 2 && s.svgs[0].includes(">Water<") && s.svgs[1].includes(">Sleep<"), s);
s = (await call("make_habit_tracker", { layout: "yearly", year: 2026, count: 1 })).structuredContent;
t("yearly 2026: 365 days, 7 greyed cells", s.days_in_year === 365 && s.off_cells === 7 && s.pages === 1);
r = await call("make_habit_tracker", { layout: "yearly", count: 20 }); s = r.structuredContent;
t("20 yearly pages: facts for all 20, only as many SVGs inline as fit 240 KB, page link for the rest", s.pages === 20 && s.svgs.length < 20 && s.svgs.length > 0 && s.svgs.join("").length <= 240 * 1024 && JSON.stringify(s.svg_pages) === JSON.stringify(s.svgs.map((_, i) => i + 1)) && /not returned inline/.test(txt(r)), [s.svgs.length]);
t("deterministic", JSON.stringify((await call("make_habit_tracker", {})).structuredContent) === JSON.stringify((await call("make_habit_tracker", {})).structuredContent));

// ---- badge
r = await call("make_badge", {}); s = r.structuredContent;
t("default: navy circle, 100 mm, star icon, top text in capitals", !r.isError && s.shape === "circle" && s.scheme === "navy" && s.size_mm === 100 && s.icon === "star" && s.text_lines[0] === "YOUR NAME" && svgOk(s.svg) && s.svg.includes('width="100mm"'), s.text_lines);
let all = true, bad = [];
for (const shape of MGD80D.SHAPES) for (const scheme of Object.keys(MGD80D.SCHEMES)) {
  const q = (await call("make_badge", { shape, scheme, top: "Made Good Coffee", bottom: "Singapore", est: "EST. 2026" })).structuredContent;
  const good = q && svgOk(q.svg) && q.svg.length <= CAP && q.svg.includes(MGD80D.SCHEMES[scheme].fill) && q.text_lines.includes("MADE GOOD COFFEE") && q.text_lines.includes("SINGAPORE") && q.text_lines.includes("EST. 2026");
  if (!good) { all = false; bad.push([shape, scheme]); }
}
t("every shape × scheme: valid SVG with the scheme fill and all three text lines", all, bad);
const ini = (await call("make_badge", { center: "initials", initials: "MG", top: "A & B" })).structuredContent;
t("initials in the middle; & escaped", ini.text_lines.includes("MG") && ini.svg.includes("&amp;") && ini.icon === null);
const ctr = (await call("make_badge", { center: "text", center_text: "COFFEE\nROASTERS" })).structuredContent;
t("centre text: up to 3 lines", ctr.text_lines.includes("COFFEE") && ctr.text_lines.includes("ROASTERS"));
const rib = (await call("make_badge", { shape: "ribbon", center_text: "BAKERY" })).structuredContent;
t("ribbon shape puts the centre text on the band", rib.text_lines.includes("BAKERY"));
const ic = (await call("make_badge", { icon: "coffee" })).structuredContent, nic = (await call("make_badge", { center: "star" })).structuredContent;
t("icon changes the drawing; star centre has no icon", ic.icon === "coffee" && ic.svg !== s.svg && nic.icon === null);
const lng = (await call("make_badge", { top: "The Very Long Name Of A Neighbourhood Bakery And Coffee Company" })).structuredContent;
t("long ring text → set smaller + a note", lng.warnings.length > 0 && /smaller/.test(lng.warnings[0]));
const sz = (await call("make_badge", { size_mm: 40 })).structuredContent;
t("size 40 mm", sz.svg.includes('width="40mm"') && sz.size_mm === 40);
t("deterministic", (await call("make_badge", {})).structuredContent.svg === s.svg);

// ---- bad inputs
for (const [n, a] of [["make_habit_tracker", { layout: "daily" }], ["make_habit_tracker", { month: 13 }], ["make_habit_tracker", { year: 1800 }], ["make_habit_tracker", { week_start: "wed" }],
  ["make_habit_tracker", { habits: [] }], ["make_habit_tracker", { habits: Array(21).fill("x") }], ["make_habit_tracker", { count: 0 }], ["make_habit_tracker", { count: 3, habits: ["a"] }],
  ["make_habit_tracker", { paper: "a3" }], ["make_habit_tracker", { style: "neon" }], ["make_badge", { shape: "square" }], ["make_badge", { scheme: "pink" }], ["make_badge", { ornament: "hearts" }],
  ["make_badge", { center: "logo" }], ["make_badge", { icon: "not-an-icon" }], ["make_badge", { size_mm: 5 }], ["make_badge", { ring: "triple" }]]) {
  const q = await call(n, a);
  t(`bad input → isError: ${n} ${JSON.stringify(a)}`, q.isError && txt(q).length < 200, txt(q));
}
t("unknown tool → isError", (await call("make_nothing", {})).isError);
console.log(`\n${ok} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
