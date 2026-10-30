// Node unit tests for the batch-45 MCP tools (src/mcp_tools45.js). Run: node --experimental-default-type=module tests/test_tools45.mjs
import { TOOL_DEFS, callTools45Tool, isTools45Tool } from "../src/mcp_tools45.js";
let pass = 0, fail = 0;
const call = (n, a) => { const r = callTools45Tool(n, a); return { r, t: r.content.map((c) => c.text).join("\n") }; };
const check = (label, cond, extra) => { if (cond) { pass++; console.log("PASS", label); } else { fail++; console.log("FAIL", label, extra ? "\n" + String(extra).slice(0, 600) : ""); } };
const svgOf = (t) => (/```svg\n([\s\S]*?)\n```/.exec(t) || [])[1] || "";

check("6 tool defs, all dispatchable", TOOL_DEFS.length === 6 && TOOL_DEFS.every((d) => isTools45Tool(d.name) && d.inputSchema && d.annotations.readOnlyHint));

// Data Matrix
let x = call("generate_data_matrix", { data: "https://madegooddesigns.com" });
check("data matrix text → SVG", !x.r.isError && /<svg[\s\S]*<path/.test(svgOf(x.t)) && /\d+x\d+ modules/.test(x.t), x.t);
x = call("generate_data_matrix", { data: "(01)09506000134352(17)271231(10)ABC123" });
check("data matrix GS1 auto + element table", !x.r.isError && x.t.startsWith("GS1 Data Matrix") && /\(17\) \| Expiration date/.test(x.t) && /\(01\)09506000134352\(17\)271231\(10\)ABC123/.test(x.t), x.t);
x = call("generate_data_matrix", { data: "(01)09506000134353" });
check("data matrix GS1 bad check digit rejected", x.r.isError && /check digit/i.test(x.t), x.t);
x = call("generate_data_matrix", { data: "HELLO", size: "16x48" });
check("data matrix DMRE/rect size honoured", !x.r.isError && /16x48 modules/.test(x.t), x.t);
x = call("generate_data_matrix", { data: "x".repeat(2000), size: "10x10" });
check("data matrix too long for size → error", x.r.isError, x.t);
x = call("generate_data_matrix", { data: "A", color: "#123456", background: "#fefefe", quiet_zone: 1, module_px: 4 });
check("data matrix colours", /fill="#123456"/.test(svgOf(x.t)) && /fill="#fefefe"/.test(svgOf(x.t)), x.t);

// Swatches
x = call("make_color_swatches", { colors: "Ocean #264653\n#2a9d8f, rgb(233,196,106)\ncoral", formats: ["css", "gpl", "ase", "aco", "procreate", "tailwind"] });
check("swatches parse 4 colours", !x.r.isError && /^4 colours/.test(x.t), x.t);
check("swatches table + svg", /\| Ocean \| #264653 \|/.test(x.t) && /<svg/.test(svgOf(x.t)), x.t);
check("swatches exports", /:root \{/.test(x.t) && /GIMP Palette/.test(x.t) && /\.ase\), base64:\n```text\nQVNFR/.test(x.t) && /\.aco\), base64/.test(x.t) && /"swatches"/.test(x.t) && /module\.exports/.test(x.t), x.t);
x = call("make_color_swatches", { colors: ["#2a9d8f"], scale: "both", steps: 5, layout: "strips" });
check("swatches scale both = 9", /^9 colours \(both scale\)/.test(x.t), x.t);
x = call("make_color_swatches", { colors: "nothing here" });
check("swatches no colours → error", x.r.isError);

// Graph
x = call("make_graph", { data: "Month,Sales,Costs\nJan,120,80\nFeb,150,95\nMar,170,90", type: "bar", title: "Q1", values: true });
check("graph bar 3×2", !x.r.isError && /3 categories, 2 series \(Sales, Costs\)/.test(x.t) && /<svg/.test(svgOf(x.t)) && /Q1/.test(svgOf(x.t)), x.t);
x = call("make_graph", { data: "x,y\n1,2\n2,4.1\n3,5.9\n4,8.2", type: "scatter", trend: true });
check("graph scatter trendline R²", /Trendline \(y\): y = 2\.0\d*x/.test(x.t) && /R² = 0\.99/.test(x.t), x.t);
x = call("make_graph", { data: "v\n1\n2\n2\n3\n3\n3\n4\n9", type: "histogram", bins: 4 });
check("graph histogram bins", /Histogram bins: /.test(x.t), x.t);
x = call("make_graph", { data: "" });
check("graph empty → error", x.r.isError);

// Subtitles
const SRT = "1\n00:00:01,000 --> 00:00:03,500\nHello there.\n\n2\n00:00:06,000 --> 00:00:08,000\nThis is a fairly long subtitle line that should wrap onto two lines.\n";
x = call("convert_subtitles", { text: SRT, to: "vtt" });
check("subs SRT → VTT", /```text\nWEBVTT\n\n00:00:01\.000 --> 00:00:03\.500\nHello there\./.test(x.t) && /^2 cues, 15 words/.test(x.t), x.t);
x = call("convert_subtitles", { text: SRT, to: "srt", shift_seconds: -0.5, max_chars: 30 });
check("subs shift + wrap", /00:00:00,500 --> 00:00:03,000/.test(x.t) && /should\nwrap|line that\nshould|subtitle line\n|\n.*\n.*two lines/.test(x.t), x.t);
x = call("convert_subtitles", { segments: [{ start: 0, end: 2, text: "One." }, { start: 5, end: 6, text: "Two." }], to: "txt" });
check("subs segments → txt paragraphs", /```text\nOne\.\n\nTwo\.\n```/.test(x.t), x.t);
x = call("convert_subtitles", { segments: [{ start: 61, end: 62, text: "a,b" }], to: "csv" });
check("subs csv quoting", /00:01:01\.000,00:01:02\.000,"a,b"/.test(x.t), x.t);
x = call("convert_subtitles", { text: "no cues" });
check("subs none → error", x.r.isError);

// Image size
x = call("image_size_calculator", { mode: "print", width: 4, height: 6, unit: "in", dpi: 300 });
check("print 4×6 @300 = 1200×1800", /= 1200 × 1800 px/.test(x.t), x.t);
x = call("image_size_calculator", { source_width: 4000, source_height: 3000, preset: "ig-portrait" });
check("preset cover crop", /output 1080 × 1350 px/.test(x.t) && /crops the source to 2400 × 3000/.test(x.t), x.t);
x = call("image_size_calculator", { source_width: 4000, source_height: 3000, width: 1000, height: 1000 });
check("px lock aspect into box", /output 1000 × 750 px/.test(x.t), x.t);
x = call("image_size_calculator", { source_width: 800, source_height: 600, percent: 50, mode: "percent" });
check("percent 50", /output 400 × 300 px/.test(x.t), x.t);
x = call("image_size_calculator", { source_width: 800, source_height: 600, width: 1600, no_enlarge: true });
check("no_enlarge caps", /output 800 × 600 px/.test(x.t), x.t);
x = call("image_size_calculator", { preset: "list" });
check("preset list", /yt-thumb — YouTube thumbnail: 1280×720/.test(x.t), x.t);
x = call("image_size_calculator", { preset: "nope" });
check("unknown preset → error", x.r.isError);

// Case
x = call("convert_text_case", { text: "NASA launched a NEW PDF guide for iphone users", case: "lower", keep_acronyms: true, keep: ["iPhone"] });
check("case lower keep acronyms + words", /NASA launched a new PDF guide for iPhone users/.test(x.t), x.t);
x = call("convert_text_case", { text: "the lord of the rings: the return of the king", case: "title" });
check("case title", /The Lord of the Rings: The Return of the King/.test(x.t), x.t);
x = call("convert_text_case", { text: "Hello World Example", case: "snake" });
check("case snake", /hello_world_example/.test(x.t), x.t);
x = call("convert_text_case", { text: "İSTANBUL", case: "lower", locale: "tr" });
check("case turkish", /istanbul/.test(x.t), x.t);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
