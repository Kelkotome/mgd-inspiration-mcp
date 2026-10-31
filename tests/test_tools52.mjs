// Node unit test of the batch-52 MCP layer (src/tools_core52.js generated cores + src/mcp_tools52.js).
// Run: node tests/test_tools52.mjs   (prints "N passed, M failed", exits 1 on failure)
import { MGDChars, MGDTypo } from "../src/tools_core52.js";
import { callTools52Tool, TOOL_DEFS, NEXT52, isTools52Tool } from "../src/mcp_tools52.js";
let ok = 0, fail = 0;
const t = (name, cond, info) => { cond ? ok++ : fail++; console.log((cond ? "PASS " : "FAIL ") + name + (cond ? "" : " | " + String(JSON.stringify(info)).slice(0, 400))); };
const txt = (r) => r.content.map((c) => c.text).join("\n");
t("no window global leaked", typeof globalThis.window === "undefined");
t("2 tools, 'Use when', next hints, read-only", TOOL_DEFS.length === 2 && TOOL_DEFS.every((d) => d.description.startsWith("Use when") && NEXT52[d.name] && d.inputSchema.type === "object" && d.annotations.readOnlyHint));
t("descriptions tight (< 650 chars each)", TOOL_DEFS.every((d) => d.description.length < 650), TOOL_DEFS.map((d) => d.description.length));
t("isTools52Tool", isTools52Tool("lookup_character") && isTools52Tool("fix_typography") && !isTools52Tool("make_gear"));
t("cores: 10k chars, Unicode 18", MGDChars.count() > 10000 && MGDChars.unicodeVersion() === "Unicode 18.0.0");
let r = await callTools52Tool("lookup_character", { query: "em dash" }); let m = r.structuredContent.matches[0];
t("lookup em dash: U+2014, &mdash;, Option+Shift+-, Alt+0151, Word Ctrl+Alt+Num -, LaTeX ---, page /em-dash/", m.char === "—" && m.codepoint === "U+2014" && m.html === "&mdash;" && m.mac[0] === "Option+Shift+-" && m.windows_alt[0] === "Alt+0151" && m.word === "Ctrl+Alt+Num -" && /---/.test(m.latex) && m.page.endsWith("/em-dash/"), m);
t("lookup text line has codes + page link", /U\+2014/.test(txt(r)) && /madegooddesigns\.com\/tools\/em-dash\//.test(txt(r)));
for (const [q, ch, page] of [["U+00B0", "°", "degree-symbol"], ["&trade;", "™", "trademark-symbol"], ["pilcrow", "¶", "paragraph-symbol"], ["é", "é", "accent-marks"], ["alpha", "α", "greek-alphabet"], ["&#8364;", "€", "currency-symbols"], ["check mark", "✓", "check-mark-symbol"], ["😀", "😀", "unicode-characters"]]) {
  r = await callTools52Tool("lookup_character", { query: q }); m = (r.structuredContent.matches || [])[0] || {};
  t(`lookup ${q} → ${ch} (${page})`, m.char === ch && m.page.endsWith(`/${page}/`), m);
}
r = await callTools52Tool("lookup_character", { query: "zzqqxx" });
t("lookup no match: friendly 0 result, not error", !r.isError && /^0 characters/.test(txt(r)));
r = await callTools52Tool("lookup_character", { text: "a​b c—" });
t("inspect text: 6 chars, flags ZWSP and NBSP", r.structuredContent.count === 6 && /ZERO WIDTH SPACE/.test(txt(r)) && /NO-BREAK SPACE/.test(txt(r)), txt(r));
t("lookup nothing → isError", (await callTools52Tool("lookup_character", {})).isError);
r = await callTools52Tool("fix_typography", { text: 'He said "it\'s 5\'10" -- and 10-20 ..." ' });
t("fix: quotes, apostrophe, primes, dash, range, ellipsis", r.structuredContent.text === "He said “it’s 5′10″—and 10–20 …” ", r.structuredContent.text);
r = await callTools52Tool("fix_typography", { text: 'Er sagte "Hallo"', locale: "de" });
t("fix de: „Hallo“", r.structuredContent.text === "Er sagte „Hallo“");
r = await callTools52Tool("fix_typography", { text: "a - b", dash_style: "en_spaced" });
t("fix dash_style en_spaced", r.structuredContent.text === "a – b");
r = await callTools52Tool("fix_typography", { text: 'x "y"', options: { quotes: false } });
t("fix options quotes:false leaves quotes", r.structuredContent.text === 'x "y"');
r = await callTools52Tool("fix_typography", { text: "“Hi”—it’s…", mode: "straighten" });
t("straighten", r.structuredContent.text === '"Hi"--it\'s...');
r = await callTools52Tool("fix_typography", { text: 'a -- b "c" ...', mode: "audit" });
t("audit lists 3 issues", r.structuredContent.issues.length === 3 && /straight double quotes/.test(txt(r)));
t("fix: code and URL untouched", (await callTools52Tool("fix_typography", { text: 'see `"x"` at https://a.com/b--c...' })).structuredContent.text === 'see `"x"` at https://a.com/b--c...');
t("fix: empty → isError", (await callTools52Tool("fix_typography", { text: "" })).isError);
t("fix: too long → isError", (await callTools52Tool("fix_typography", { text: "x".repeat(20001) })).isError);
console.log(`${ok} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
