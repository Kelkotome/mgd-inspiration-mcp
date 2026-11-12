// MCP r3 (12-Nov-2026) unit tests (Node, no Worker runtime):
//  A. make_star_map cities: Hamburg, München, São Paulo, NYC (+ the r3 short forms and transliterations), 50 random cities of the bundled
//     GeoNames table, lat/lon still win over city, misses stay misses.
//  B. error text: mcpExcText / mcpErrText / mcpNoBlankError never give an empty class or message.
//  C. design_md_from_references on the local D1 copy: the 5-Nov query, an unknown reference + query, no arguments, a D1 that throws an
//     Error with an empty message; every logged failure has "class: message" in mcp_events.err.
//  D. tools/list: 112 tools, names and input schemas identical to the base (tests/mcp_r3_base_tools.json = fdf92f8, live 9a4267d5),
//     byte size within +5 %, instructions < 1,500 chars and lead with when to use them, changed descriptions lead with "Use when" and
//     are no longer than before, every description ≤ 1,024 chars.
// Run: node --no-warnings --import=./tests/r3/register.mjs tests/test_mcp_r3.mjs   (prints "N passed, M failed")
import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { findCity } from "../src/cities.js";
import G from "../src/cities_geonames.js";
import { callTools72Tool } from "../src/mcp_tools72.js";
import { mcpExcText, mcpErrText, mcpNoBlankError } from "../src/mcp_err.js";
import { openDb, makeEnv, cacheShim, callTool, rpc, DATA } from "./r3/env.mjs";

let ok = 0, fail = 0;
const t = (name, cond, info) => { cond ? ok++ : fail++; if (!cond || process.env.VERBOSE) console.log((cond ? "PASS " : "FAIL ") + name + (cond ? "" : " | " + String(typeof info === "string" ? info : JSON.stringify(info)).slice(0, 400))); };
const near = (a, b, e = 0.15) => Math.abs(a - b) <= e;

// ---- A. cities
for (const [q, name, lat, lon] of [["Hamburg", "Hamburg, Germany", 53.55, 9.99], ["München", "Munich, Germany", 48.14, 11.58], ["São Paulo", "São Paulo, Brazil", -23.55, -46.63],
  ["NYC", "New York City, New York, USA", 40.71, -74.01], ["nyc", "New York City, New York, USA", 40.71, -74.01], ["NYC, USA", "New York City, New York, USA", 40.71, -74.01],
  ["Köln", "Köln, Germany", 50.94, 6.96], ["Cologne", "Köln, Germany", 50.94, 6.96], ["Koeln", "Köln, Germany", 50.94, 6.96], ["Muenchen", "Munich, Germany", 48.14, 11.58],
  ["Duesseldorf", "Düsseldorf, Germany", 51.22, 6.78], ["Zuerich", "Zürich, Switzerland", 47.37, 8.54], ["LA", "Los Angeles, California, USA", 34.05, -118.24],
  ["SF", "San Francisco, California, USA", 37.77, -122.42], ["DC", "Washington, District of Columbia, USA", 38.9, -77.04], ["NOLA", "New Orleans, Louisiana, USA", 29.95, -90.07],
  ["New Orleans, LA", "New Orleans, Louisiana, USA", 29.95, -90.07], ["Rio", "Rio de Janeiro, Brazil", -22.91, -43.18], ["KL", "Kuala Lumpur, Malaysia", 3.14, 101.69],
  ["HCMC", "Ho Chi Minh City, Vietnam", 10.82, 106.63], ["Calcutta", "Kolkata, India", 22.57, 88.36], ["Firenze", "Florence, Italy", 43.77, 11.25],
  ["Venezia", "Venice, Italy", 45.44, 12.33], ["Genève", "Geneva, Switzerland", 46.2, 6.15], ["HK", "Hong Kong, Hong Kong", 22.32, 114.17], ["SG", "Singapore, Singapore", 1.29, 103.85]]) {
  const r = findCity(q);
  t(`city "${q}" → ${name}`, r && r.name === name && near(r.lat, lat) && near(r.lon, lon), r);
}
for (const q of ["Atlantis", "Paris, Texas", "Zzyzx", ""]) t(`city "${q}" is still a miss`, findCity(q) === null, findCity(q));
// 50 random cities of the table, asked as "Name, Country": each resolves to the first (most populous) place of that name in that country
let seed = 1112; const rnd = () => ((seed = (seed * 1103515245 + 12345) >>> 0) / 2 ** 32);
const fold = (s) => String(s).normalize("NFKD").replace(/\p{M}/gu, "").toLowerCase();
let hit50 = 0; const miss50 = [];
for (let n = 0; n < 50; n++) {
  const i = Math.floor(rnd() * G.cities.length), c = G.cities[i], country = G.countries[c[3]] || c[3];
  const first = G.cities.findIndex((x) => x[3] === c[3] && fold(x[0]) === fold(c[0]));
  const want = G.cities[first], r = findCity(`${c[0]}, ${country}`);
  if (r && near(r.lat, want[1], 0.01) && near(r.lon, want[2], 0.01)) hit50++; else miss50.push(`${c[0]}, ${country} → ${r && r.name}`);
}
t(`50 random table cities resolve (${hit50}/50)`, hit50 === 50, miss50);
const sm = await callTools72Tool("make_star_map", { city: "Hamburg", date: "2026-06-21", time: "22:00" });
t("make_star_map city Hamburg answers", !sm.isError && /Hamburg/.test(sm.content[0].text), sm.content[0].text.slice(0, 160));
const sn = await callTools72Tool("make_star_map", { city: "NYC", date: "2026-06-21" });
t("make_star_map city NYC answers (New York)", !sn.isError && /New York/.test(sn.content[0].text), sn.content[0].text.slice(0, 160));
const sl = await callTools72Tool("make_star_map", { city: "Hamburg", lat: 10, lon: 20, date: "2026-06-21" });
t("lat/lon still win over city", !sl.isError && sl.structuredContent.lat === 10 && sl.structuredContent.lon === 20 && !/Hamburg/.test(sl.content[0].text.slice(0, 200)), sl.structuredContent);
const sa = await callTools72Tool("make_star_map", { city: "Atlantis", date: "2026-06-21" });
t("unknown city is a clear error that names GeoNames coverage", sa.isError && /Unknown city "Atlantis"/.test(sa.content[0].text), sa.content[0].text);
const desc72 = JSON.stringify((await import("../src/mcp_tools72.js")).TOOL_DEFS.find((x) => x.name === "make_star_map"));
t("make_star_map credits GeoNames (CC BY 4.0) in its answer", /GeoNames/.test(JSON.stringify(sm)) && /CC BY 4\.0/.test(JSON.stringify(sm)), "");

// ---- B. error text
for (const [e, want] of [[new Error(""), /^Error thrown with no message$/], [new TypeError(""), /^TypeError thrown with no message$/], [{}, /^Object thrown with no message$/], [null, /^null thrown with no message$/],
  [undefined, /^undefined thrown with no message$/], ["", /^empty string thrown with no message$/], [{ code: 7 }, /^Object \{"code":7\}$/], [new Error("D1 overloaded"), /^D1 overloaded$/], ["plain", /^plain$/]])
  t(`mcpExcText(${String(e && e.constructor && e.constructor.name)} ${JSON.stringify(e)})`, want.test(mcpExcText(e)), mcpExcText(e));
for (const [r, want] of [[{ isError: true, content: [{ type: "text", text: "" }] }, /^tool: \(no error text\)$/], [{ isError: true }, /^tool: \(no error text; no content\)$/],
  [{ isError: true, content: [{ type: "text", text: "Error: " }] }, /^exception: Error: \(no message\)$/], [{ isError: true, content: [{ type: "text", text: "Error: boom" }] }, /^exception: Error: boom$/],
  [{ isError: true, content: [{ type: "text", text: "The search failed (database error: x) — this is NOT" }] }, /^busy: /], [{ isError: true, content: [{ type: "text", text: "date must be YYYY-MM-DD." }] }, /^tool: date must/]])
  t(`mcpErrText → ${want}`, want.test(mcpErrText(r)), mcpErrText(r));
const nb = mcpNoBlankError("make_star_map", { isError: true, content: [{ type: "text", text: " " }] });
t("a blank tool error gets a message", /^Error: make_star_map failed with no message/.test(nb.content[0].text), nb.content[0].text);
const nb2 = mcpNoBlankError("x", { isError: true });
t("a tool error without content gets one", nb2.content && /failed with no message/.test(nb2.content[0].text), nb2);
const nb3 = { content: [{ type: "text", text: "" }] };
t("non-errors are untouched", mcpNoBlankError("x", nb3) === nb3 && nb3.content[0].text === "", nb3);

// ---- C. design_md_from_references + mcp_events.err on the local D1 copy
if (!existsSync(DATA)) { t("local D1 copy present (tests/r3/.data/live.sqlite)", false, "missing: see mcp-r3.md, 'Local D1 copy'"); }
else {
  globalThis.caches = cacheShim();
  const { default: worker } = await import("../src/index.js");
  const db = openDb(); const { env } = makeEnv(db, { version: "unit" });
  const ev = () => db.prepare("SELECT ok, err FROM temp.mcp_events WHERE kind='call' ORDER BY rowid DESC LIMIT 1").get();
  const r1 = await callTool(worker, env, "design_md_from_references", { query: "Eco-Friendly AI Product Launch Visual" });
  t("design_md 5-Nov query answers (no error)", !r1.result.isError && /^Design system from \d+ reference/.test(r1.result.content[0].text) && ev().ok === 1, r1.result.content[0].text.slice(0, 120));
  const r2 = await callTool(worker, env, "design_md_from_references", { query: "Eco-Friendly AI Product Launch Visual", references: ["0123456789ab"] });
  t("design_md unknown reference + query falls back to the query (the 5-Nov failure shape)", !r2.result.isError && /references were not found/.test(r2.result.content[0].text), r2.result.content[0].text.slice(0, 200));
  const r3 = await callTool(worker, env, "design_md_from_references", {});
  const e3 = ev();
  t("design_md with no arguments: an error with class and message in mcp_events.err", r3.result.isError && e3.ok === 0 && /^bad_args: Pass references/.test(e3.err), e3);
  const r4 = await callTool(worker, env, "design_md_from_references", { query: "zzqxv qqzzv" });
  t("design_md true zero is an ordinary '0 results' answer", !r4.result.isError && /^0 results/.test(r4.result.content[0].text), r4.result.content[0].text.slice(0, 120));
  // a D1 that throws an Error with an EMPTY message (the 'empty error' shape): the answer and the log both name it
  const bad = makeEnv(db, { version: "unit" }); const real = bad.env.DB.prepare;
  bad.env.DB.prepare = (sql) => (/^\s*SELECT/i.test(sql) && /FROM items/.test(sql) ? { bind: () => ({ all: async () => { throw new Error(""); }, first: async () => { throw new Error(""); } }), all: async () => { throw new Error(""); } } : real(sql));
  const r5 = await callTool(worker, bad.env, "design_md_from_references", { query: "eco packaging" });
  const e5 = ev();
  t("design_md on a D1 error with an empty message: isError with a message", r5.result.isError && /database error: Error thrown with no message/.test(r5.result.content[0].text), r5.result.content[0].text.slice(0, 200));
  t("…and mcp_events.err = 'busy: …' (never empty)", e5.ok === 0 && /^busy: The search failed \(database error: Error thrown with no message\)/.test(e5.err), e5);
  const r6 = await callTool(worker, bad.env, "search_design_inspiration", { query: "eco packaging" });
  t("search_design_inspiration on the same D1 error: busy, with a message", r6.result.isError && /^busy: .*Error thrown with no message/.test(ev().err), ev());
  const rows = db.prepare("SELECT ok, err FROM temp.mcp_events WHERE kind='call'").all();
  t(`every failed call in this run has "class: message" in mcp_events.err (${rows.filter((x) => x.ok === 0).length} failures)`, rows.every((x) => (x.ok === 0) === !!x.err && (!x.err || /^[a-z_]+: \S/.test(x.err))), rows);

  // ---- D. tools/list and instructions
  const base = JSON.parse(readFileSync(new URL("./mcp_r3_base_tools.json", import.meta.url)));
  const tl = await rpc(worker, env, "tools/list"), tools = tl.json.result.tools;
  t("tools/list has 112 tools", tools.length === 112 && base.tools.length === 112, tools.length);
  t("tool names unchanged and in the same order", JSON.stringify(tools.map((x) => x.name)) === JSON.stringify(base.tools.map((x) => x.name)), "");
  const sch = tools.filter((x, i) => createHash("sha256").update(JSON.stringify(x.inputSchema)).digest("hex").slice(0, 16) !== base.tools[i].schema).map((x) => x.name);
  t("every input schema byte-identical to the base", sch.length === 0, sch);
  t(`tools/list size within +5 % (${base.bytes.mcp} → ${tl.bytes} bytes)`, tl.bytes <= base.bytes.mcp * 1.05, tl.bytes);
  const longer = tools.filter((x, i) => x.description.length > base.tools[i].desc_len && x.description !== undefined).map((x, i) => x.name);
  t("no description got longer", longer.length === 0, longer);
  t("every description ≤ 1,024 chars", tools.every((x) => x.description.length <= 1024), tools.filter((x) => x.description.length > 1024).map((x) => x.name));
  const TOP = ["search_ui_screens", "search_design_inspiration", "get_ui_screen_code", "get_ui_flow", "list_ui_patterns", "get_font_pairing", "get_brand_typeface", "generate_website_color_palette",
    "check_contrast", "generate_logo_concepts", "search_museum_art", "browse_inspiration_by_theme", "search_annual_reports", "design_md_from_references", "generate_design_md", "search_icons"];
  const notUse = TOP.filter((n) => !/^Use (when|after)/.test(tools.find((x) => x.name === n).description));
  t("the top design tools lead with when to use them", notUse.length === 0, notUse);
  const ini = (await rpc(worker, env, "initialize", { protocolVersion: "2025-06-18" })).json.result.instructions;
  t(`/mcp instructions < 1,500 chars (${ini.length})`, ini.length < 1500, ini.length);
  t("/mcp instructions line 1: when to use + BEFORE building or restyling UI", /Use for ANY design, UI, font, colour, logo, brand or inspiration request/.test(ini.split("\n")[0]) && ini.split("\n")[0].includes("BEFORE building or restyling UI"), ini.split("\n")[0]);
  const OLD_ROUTED = ["search_ui_screens", "get_ui_screen_code", "get_ui_flow", "search_design_inspiration", "search_museum_art", "search_annual_reports", "generate_website_color_palette", "generate_design_md",
    "generate_logo_concepts", "make_extruded_part", "make_box_template", "get_book_cover_size", "lookup_character", "fix_typography", "make_affinity_diagram", "get_paper_sizes", "make_grid_paper", "make_storyboard",
    "generate_llms_txt", "make_dieline", "analyze_3d_model", "get_print_clearance", "make_gear", "get_screw_specs", "get_hand_anthropometrics", "browse_inspiration_by_theme", "design_md_from_references",
    "generate_shadcn_theme", "generate_color_scale", "generate_type_scale", "export_design_tokens", "check_contrast", "lint_design_md", "convert_color", "search_icons", "get_screen_sizes", "generate_slogans",
    "make_brand_board", "generate_color_combinations", "get_font_pairing", "get_brand_typeface", "list_ui_patterns", "save_moodboard", "make_star_map"];
  t("/mcp instructions name every tool the older suites route to, plus the font tools", OLD_ROUTED.every((n) => ini.includes(n)), OLD_ROUTED.filter((n) => !ini.includes(n)));
  const names = new Set(tools.map((x) => x.name)), named = (ini.match(/[a-z0-9]+(?:_[a-z0-9]+)+/g) || []).filter((n) => !names.has(n));
  t("/mcp instructions name only real tools", named.length === 0, named);
  const cins = (await (async () => { const { ctx } = { ctx: { waitUntil() {} } }; const r = await worker.fetch(new Request("https://madegooddesigns.com/inspiration/mcp/core", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }) }), env, ctx); return (await r.json()).result.instructions; })());
  t(`/mcp/core instructions < 1,500 chars (${cins.length}), lead with when to use, name get_font_pairing`, cins.length < 1500 && /Use them for ANY design/.test(cins.split("\n")[0]) && /BEFORE/.test(cins.split("\n")[0]) && cins.includes("get_font_pairing") && cins.includes("browse_design_tools") && cins.includes("run_design_tool"), cins.slice(0, 300));
}
console.log(`${ok} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
