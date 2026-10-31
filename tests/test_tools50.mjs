// Node unit test of the batch-50 MCP layer (src/tools_core50.js generated cores + src/mcp_tools50.js).
// Run: node tests/test_tools50.mjs   (prints "N passed, M failed", exits 1 on failure)
import { MGDBookCover, MGDAffinity } from "../src/tools_core50.js";
import { callTools50Tool, TOOL_DEFS, NEXT50 } from "../src/mcp_tools50.js";
let ok = 0, fail = 0;
const t = (name, cond, info) => { cond ? ok++ : fail++; console.log((cond ? "PASS " : "FAIL ") + name + (cond ? "" : " | " + String(JSON.stringify(info)).slice(0, 300))); };
const txt = (r) => r.content.map((c) => c.text).join("\n");
const near = (a, b, e = 1e-6) => Math.abs(a - b) < e;
t("no window global leaked", typeof globalThis.window === "undefined");
t("2 tools, all 'Use when', all with next-step hints", TOOL_DEFS.length === 2 && TOOL_DEFS.every((d) => d.description.startsWith("Use when") && NEXT50[d.name]));
t("cores exported", !!(MGDBookCover.compute && MGDAffinity.toSVG));

// ---- get_book_cover_size: KDP Help formula (bleed + trim + spine + trim + bleed; spine = pages × factor)
let r = await callTools50Tool("get_book_cover_size", { trim: "6x9", pages: 300, paper: "white", svg: true });
let sc = r.structuredContent || {};
// 300 × 0.002252 = 0.6756 in; width = 0.125 + 6 + 0.6756 + 6 + 0.125 = 12.9256; height = 9.25
t("6x9 300pp white: spine 0.6756 in", !r.isError && near(sc.size.spine.in, 0.6756), sc.size && sc.size.spine);
t("6x9 300pp white: full 12.9256 × 9.25 in", near(sc.size.width.in, 12.9256) && near(sc.size.height.in, 9.25), sc.size);
t("6x9 300pp: px at 300 DPI = 3878 × 2775", sc.size.width.px === Math.round(12.9256 * 300) && sc.size.height.px === 2775, [sc.size.width.px, sc.size.height.px]);
t("6x9 300pp: spine text allowed", sc.spine_text.allowed === true);
t("6x9: front panel right of spine (ltr)", sc.rects_in.front.x > sc.rects_in.spine.x && sc.rects_in.back.x < sc.rects_in.spine.x);
t("barcode 2 × 1.2 in, on the back panel", near(sc.rects_in.barcode.w, 2) && near(sc.rects_in.barcode.h, 1.2) && sc.rects_in.barcode.x + 2 <= sc.rects_in.back.x + sc.rects_in.back.w);
t("svg template true-size (pt)", typeof sc.svg === "string" && sc.svg.startsWith("<svg") && sc.svg.includes(String(+(12.9256 * 72).toFixed(3)).slice(0, 6)), (sc.svg || "").slice(0, 160));
t("text cites KDP Help + not affiliated", /kdp\.amazon\.com\/en_US\/help/.test(txt(r)) && /Not affiliated with Amazon/.test(txt(r)));
t("links to calculator with hash", txt(r).includes("/tools/kdp-cover-calculator/#trim=6x9&pages=300&paper=white"));
r = await callTools50Tool("get_book_cover_size", { trim: "5x8", pages: 200, paper: "cream" });
t("5x8 200pp cream: spine 0.5 in (0.0025/page)", near(r.structuredContent.size.spine.in, 0.5), r.structuredContent.size.spine);
r = await callTools50Tool("get_book_cover_size", { trim: "8.5x11", pages: 100, paper: "color-premium", dpi: 600 });
t("8.5x11 100pp premium: spine 0.2347 in, px @600", near(r.structuredContent.size.spine.in, 0.2347) && r.structuredContent.size.height.px === Math.round(11.25 * 600), r.structuredContent.size);
r = await callTools50Tool("get_book_cover_size", { trim: "6x9", pages: 60 });
t("60 pages: no spine text + warning", r.structuredContent.spine_text.allowed === false && /spine/i.test(txt(r)));
r = await callTools50Tool("get_book_cover_size", { trim: "6x9", pages: 2000 });
t("2000 pages → isError with the KDP range", r.isError && /24.828|24–828/.test(txt(r)), txt(r));
t("no pages → isError", (await callTools50Tool("get_book_cover_size", { trim: "6x9" })).isError);
t("bad trim → isError", (await callTools50Tool("get_book_cover_size", { trim: "banana", pages: 100 })).isError);
r = await callTools50Tool("get_book_cover_size", { binding: "ebook" });
t("ebook: 1600 × 2560", !r.isError && r.structuredContent.ebook.width === 1600 && r.structuredContent.ebook.height === 2560, r.structuredContent);
r = await callTools50Tool("get_book_cover_size", { binding: "hardcover", trim: "6x9", pages: 200 });
t("hardcover: rules only, honest note", !r.isError && /does not compute|not compute/i.test(txt(r)), txt(r).slice(0, 200));
r = await callTools50Tool("get_book_cover_size", { trim: "6x9", pages: 300, direction: "rtl" });
t("rtl: front panel left of spine", r.structuredContent.rects_in.front.x < r.structuredContent.rects_in.spine.x);

// ---- make_affinity_diagram
r = await callTools50Tool("make_affinity_diagram", { title: "Onboarding interviews", groups: [
  { name: "Setup is confusing", notes: ["I didn't know which plan to pick", { text: "Too many steps before I saw anything", participant: "P2", votes: 3 }] },
  { name: "Trust", color: "blue", notes: ["Wanted to see pricing first", "Worried about my data <script>"] }] });
sc = r.structuredContent || {};
t("groups in: 4 notes, 2 groups, 3 votes", !r.isError && sc.stats.notes === 4 && sc.stats.groups === 2 && sc.stats.votes === 3, sc.stats);
t("svg board, text escaped", typeof sc.svg === "string" && sc.svg.startsWith("<svg") && !sc.svg.includes("<script>") && sc.svg.includes("&lt;script&gt;"));
t("markdown has group headings", /Setup is confusing/.test(sc.markdown) && /Trust/.test(sc.markdown), sc.markdown);
t("csv has header + 4 rows", sc.csv.trim().split(/\r?\n/).length === 5, sc.csv);
r = await callTools50Tool("make_affinity_diagram", { notes: "Checkout button hard to find\nCould not find the checkout\nPrices unclear on mobile\nMobile prices are confusing\nLove the colours", auto_group: true });
sc = r.structuredContent || {};
t("auto_group: ≥2 keyword groups from 5 notes", !r.isError && sc.stats.groups >= 2 && sc.stats.notes === 5, sc.stats);
t("auto_group deterministic (same text twice)", txt(r).replace(/auto[a-z0-9]+/g, "") === txt(await callTools50Tool("make_affinity_diagram", { notes: "Checkout button hard to find\nCould not find the checkout\nPrices unclear on mobile\nMobile prices are confusing\nLove the colours", auto_group: true })).replace(/auto[a-z0-9]+/g, ""));
r = await callTools50Tool("make_affinity_diagram", { notes: "## Pricing\n- too expensive\n- unclear tiers\n## Speed\n- slow export", svg: false });
t("markdown input → 2 groups, no svg", !r.isError && r.structuredContent.stats.groups === 2 && r.structuredContent.svg === null, r.structuredContent && r.structuredContent.stats);
r = await callTools50Tool("make_affinity_diagram", { notes: ["a note", "another note"] });
t("array notes → ungrouped notes", !r.isError && r.structuredContent.stats.notes === 2);
t("empty → isError", (await callTools50Tool("make_affinity_diagram", {})).isError);
t("links to the web board", /\/tools\/affinity-diagram\//.test(txt(r)));
console.log(`${ok} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
