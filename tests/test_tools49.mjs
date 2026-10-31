// Node unit test of the batch-49 MCP layer (src/tools_core49.js generated cores + src/mcp_tools49.js + the convert_color
// extension in src/mcp_tools48.js). Run: node tests/test_tools49.mjs   (prints "N passed, M failed", exits 1 on failure)
import { MGDPaper, MGDPaperSizes, MGDColorRef, MGDStoryboard, MGDLlmsTxt } from "../src/tools_core49.js";
import { callTools49Tool, TOOL_DEFS, NEXT49 } from "../src/mcp_tools49.js";
import { callTools48Tool } from "../src/mcp_tools48.js";
let ok = 0, fail = 0;
const t = (name, cond, info) => { cond ? ok++ : fail++; console.log((cond ? "PASS " : "FAIL ") + name + (cond ? "" : " | " + String(JSON.stringify(info)).slice(0, 300))); };
const txt = (r) => r.content.map((c) => c.text).join("\n");
t("no window global leaked", typeof globalThis.window === "undefined");
t("4 tools, all 'Use when', all with next-step hints", TOOL_DEFS.length === 4 && TOOL_DEFS.every((d) => d.description.startsWith("Use when") && NEXT49[d.name]), TOOL_DEFS.map((d) => [d.name, d.description.slice(0, 12), !!NEXT49[d.name]]));
// paper sizes (ISO 216 / ANSI values)
const a4 = MGDPaperSizes.get("A4"), l = MGDPaperSizes.get("8.5x11"), a1 = MGDPaperSizes.get("A1");
t("A4 = 210 × 297 mm", a4.w_mm === 210 && a4.h_mm === 297, a4);
t("8.5x11 → Letter 612 × 792 pt", /letter/i.test(l.name) && l.w_pt === 612 && l.h_pt === 792, l);
t("A1 = 594 × 841 (round-down rule)", a1.w_mm === 594 && a1.h_mm === 841, a1);
t("A4 @300 DPI = 2480 × 3508 px", (({ w, h }) => w === 2480 && h === 3508)(MGDPaperSizes.px(a4, 300, "portrait")));
let r = await callTools49Tool("get_paper_sizes", { query: "A4", compare_with: "letter" });
t("get_paper_sizes A4: @page + compare", !r.isError && /size: 210mm 297mm/.test(txt(r)) && r.structuredContent.compare, txt(r).slice(0, 300));
r = await callTools49Tool("get_paper_sizes", { family: "ANSI", unit: "in" });
t("get_paper_sizes ANSI table", !r.isError && r.structuredContent.sizes.length >= 5 && /\| ANSI/.test(txt(r)), txt(r).slice(0, 300));
t("get_paper_sizes nonsense → clean error", (await callTools49Tool("get_paper_sizes", { query: "zzqq paper" })).isError);
// grid paper
r = await callTools49Tool("make_grid_paper", { type: "dot", paper: "a4", spacing: 5 });
const svg = r.structuredContent && r.structuredContent.svg;
t("make_grid_paper dot A4: true-size SVG", !r.isError && /width="210mm" height="297mm"/.test(svg) && /dot-grid-paper/.test(txt(r)), (svg || "").slice(0, 200));
r = await callTools49Tool("make_grid_paper", { type: "graph", paper: "letter", spacing: "1/4" });
t("make_grid_paper 1/4 in = 18 pt", Math.abs(r.structuredContent.meta.spacingPt - 18) < 0.01, r.structuredContent.meta);
r = await callTools49Tool("make_grid_paper", { type: "lined", rule: "college" });
t("make_grid_paper college rule 9/32 in = 20.25 pt", Math.abs(r.structuredContent.meta.spacingPt - 20.25) < 0.01, r.structuredContent.meta);
// storyboard
r = await callTools49Tool("make_storyboard", { title: "Launch ad", shots: [{ scene: "1", shot_type: "WS", camera: "dolly", duration: 4, action: "City at dawn" }, { shot_type: "CU", duration: 2.5, action: "Hand taps phone", dialogue: "Ready?" }, "Logo end card"] });
t("make_storyboard: 3 shots, svg page, markdown table", !r.isError && r.structuredContent.shots.length === 3 && r.structuredContent.svg_pages.length >= 1 && r.structuredContent.svg_pages[0].startsWith("<svg") && /\|/.test(r.structuredContent.markdown), txt(r).slice(0, 300));
t("make_storyboard: CSV has header + 3 rows", r.structuredContent.csv.trim().split(/\r?\n/).length === 4, r.structuredContent.csv);
t("make_storyboard: text escaped in SVG", !(await callTools49Tool("make_storyboard", { shots: ["<script>x</script> & go"] })).structuredContent.svg_pages[0].includes("<script>"));
t("make_storyboard: no shots → clean error", (await callTools49Tool("make_storyboard", {})).isError);
// llms.txt
r = await callTools49Tool("generate_llms_txt", { title: "Acme Docs", summary: "Docs for Acme.", sections: [{ name: "Docs", links: [{ title: "Quick start", url: "https://acme.dev/start.md", notes: "Install" }] }], optional: [{ title: "Blog", url: "https://acme.dev/blog" }] });
t("generate_llms_txt build: 0 errors", !r.isError && r.structuredContent.report.errors === 0 && r.structuredContent.llms_txt.startsWith("# Acme Docs"), txt(r).slice(0, 300));
r = await callTools49Tool("generate_llms_txt", { lint: "## Docs\n- [x](https://a.b)\n" });
t("generate_llms_txt lint flags missing H1", r.structuredContent.report.errors >= 1 && /missing-h1/.test(txt(r)), txt(r).slice(0, 300));
t("generate_llms_txt: no title → clean error", (await callTools49Tool("generate_llms_txt", {})).isError);
// convert_color extension: byte-identical without new params, alpha/flatten/name with them
const base = txt(await callTools48Tool("convert_color", { colors: ["#2563eb", "oklch(70% 0.25 150)"] }));
t("convert_color unchanged without new params", !/HEX8|flattened|nearest CSS name/.test(base) && base.includes("oklch-color-picker"));
r = await callTools48Tool("convert_color", { colors: ["rgba(37,99,235,0.5)"], alpha: true, flatten_on: "#fff", nearest_name: true });
t("convert_color flatten rgba(37,99,235,.5) on white = #92b1f5 (Chrome-painted)", txt(r).includes("`#92b1f5`"), txt(r).slice(-500));
t("convert_color alpha formats", txt(r).includes("#2563eb80") && txt(r).includes("rgb(37 99 235 / 0.5)"));
t("convert_color nearest name tomato exact", txt(await callTools48Tool("convert_color", { colors: ["#ff6347"], nearest_name: true })).includes("`tomato` #ff6347 (exact)"));
t("convert_color bad flatten_on → message, no crash", /not a colour/.test(txt(await callTools48Tool("convert_color", { colors: ["#000"], flatten_on: "nope" }))));
t("MGDColorRef 148 names", Object.keys(MGDColorRef.NAMED).length === 148);
t("MGDPaper/MGDLlmsTxt/MGDStoryboard exported", !!(MGDPaper.svg && MGDLlmsTxt.lint && MGDStoryboard.layout));
console.log(`${ok} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
