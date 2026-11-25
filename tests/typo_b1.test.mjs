// typo-b1 (25-Nov-2026): typography batch B1 in get_font_pairing + two MCP fixes.
//  1. 40 new guides (deploy-bundle-2026-11-25/fonts-b1, built by typo_publish/build_typo_mcp.py): exact hits, page = the B1 slug, 5 pairs.
//     The 106 BASE entries are byte-identical in the data, and every BASE answer that cited an old guide (exact / alias / prefix) is unchanged.
//  2. Style variants with no guide (Zilla Slab Highlight, Vollkorn SC, Patrick Hand SC...) answer with the parent family's guide (match
//     "variant") before the partner / similar fallbacks; mono / sans siblings (Syne Mono, Noto Sans Mono) are never folded into a parent.
//  3. Similar-font fallback: the script is named only when every suggested guide font shares it (Modak, Bagel Fat One: neutral wording).
//  4. src/arg_alias.js: id -> screen_id, color -> colors, font_name -> font, camelCase -> snake_case; never overwrites a sent argument.
// Run: node --no-warnings tests/typo_b1.test.mjs   (BASE = museum-collection-2026-10 tip this branch started from)
import fs from "node:fs"; import path from "node:path"; import assert from "node:assert"; import { pathToFileURL } from "node:url";
import { execFileSync } from "node:child_process";
const BASE = process.env.TB1_BASE || "70d41a9";
const PLAN = process.env.TB1_PLAN || path.join(process.env.HOME, "Downloads/EtiennAubertBonn/deploy-bundle-2026-11-25/fonts-b1/src/plan.json");
const src = path.resolve("src"), tmp = path.join(src, "_typo_b1_test.mjs"), baseFile = path.join(src, "_typo_b1_base.mjs");
const DATA = JSON.parse(fs.readFileSync(path.join(src, "font_pairings.json"), "utf8"));
const inline = (code, json) => code.replace('import PAIRINGS from "./font_pairings.json";', "const PAIRINGS = " + json + ";");
const git = (f) => execFileSync("git", ["show", `${BASE}:src/${f}`], { encoding: "utf8", maxBuffer: 64 << 20 });
for (const f of ["font_pairings_curated.js", "gf_meta.js", "search_extras.js"]) assert.equal(git(f), fs.readFileSync(path.join(src, f), "utf8"), `${f} changed since ${BASE}`);
fs.writeFileSync(tmp, inline(fs.readFileSync(path.join(src, "font_pairing.js"), "utf8"), JSON.stringify(DATA)));
fs.writeFileSync(baseFile, inline(git("font_pairing.js"), git("font_pairings.json")));
let n = 0;
const fails = [];
const ok = (c, m) => { if (!c) fails.push(m); n++; };
try {
  const { fontPairing } = await import(pathToFileURL(tmp));
  const { fontPairing: baseFP } = await import(pathToFileURL(baseFile));
  const { GF_META } = await import(pathToFileURL(path.join(src, "gf_meta.js")));
  const { normalizeArgs } = await import(pathToFileURL(path.join(src, "arg_alias.js")));
  const sc = (f, x) => fontPairing({ font: f, ...(x || {}) }).structuredContent;
  const txt = (f, x) => fontPairing({ font: f, ...(x || {}) }).content[0].text;
  const BASE_DATA = JSON.parse(git("font_pairings.json"));
  const key = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  const GFM = new Map(GF_META.split("\n").filter(Boolean).map((l) => { const [family, c, stroke, script] = l.split("|"); return [key(family), { family, c, script }]; }));

  // 1. data + the 40 guides
  const plan = JSON.parse(fs.readFileSync(PLAN, "utf8")).filter((r) => r.kind === "pairing");
  ok(plan.length === 40, `40 pairing rows in plan.json (got ${plan.length})`);
  ok(Object.keys(DATA).length === Object.keys(BASE_DATA).length + 40, `146 guide fonts (got ${Object.keys(DATA).length})`);
  for (const k of Object.keys(BASE_DATA)) ok(JSON.stringify(DATA[k]) === JSON.stringify(BASE_DATA[k]), `${k}: data unchanged`);
  for (const row of plan) {
    const page = `https://madegooddesigns.com/${row.slug}/`;
    for (const q of [row.title, row.title.toUpperCase(), `${row.title} font pairings`, `what goes with ${row.title}`]) {
      const s = sc(q);
      ok(s.font === row.title && s.page === page && s.match === "exact" && s.pairs.length === 5, `${q}: exact hit on ${page} (got ${s.match} ${s.font} ${s.page})`);
    }
    ok(txt(row.title).startsWith(`5 pairing(s) for ${row.title}. Source: ${page}`), `${row.title}: first line cites ${page}`);
    const v = DATA[row.title.toLowerCase()];
    ok(v && v.pairs.every((p) => p.heading === row.title || p.body === row.title), `${row.title}: every pair includes the font`);
    ok(v && v.pairs.every((p) => p.why && p.why.length >= 20 && p.why.length <= 262), `${row.title}: why lines present`);
  }
  ok(DATA["dosis"].about.added === null, "Dosis: no year (METADATA.pb and the API disagree)");
  ok(!Object.values(DATA).some((v) => /fonts-b1|-font-alternatives\/|blackletter-fonts|didone-fonts/.test(v.page || "")), "vein articles never feed get_font_pairing");

  // 2. style variants -> parent guide
  for (const [q, parent] of [["Zilla Slab Highlight", "Zilla Slab"], ["zilla slab highlight font", "Zilla Slab"], ["Vollkorn SC", "Vollkorn"],
    ["Patrick Hand SC", "Patrick Hand"], ["Noto Serif Display", "Noto Serif"], ["Noto Sans Display", "Noto Sans"], ["Lobster Outline", "Lobster"],
    ["Bangers Inline", "Bangers"], ["Space Mono Italic", "Space Mono"]]) {
    const s = sc(q);
    ok(s.font === parent && s.page === DATA[parent.toLowerCase()].page, `${q}: answers with the ${parent} guide (got ${s.match} ${s.font})`);
  }
  ok(["prefix", "variant"].includes(sc("Zilla Slab Highlight").match), "Zilla Slab Highlight: parent guide via the prefix step (highlight is not a sibling word)");
  ok(sc("Bangers Inline").match === "variant" && txt("Bangers Inline").includes('"Bangers Inline" is a style of Bangers with no separate guide'), "Bangers Inline: variant wording");
  for (const [q, notParent] of [["Syne Mono", "Syne"], ["Noto Sans Mono", "Noto Sans"], ["Josefin Sans", "Josefin Slab"], ["Courier Prime Sans", "Courier Prime"], ["Quattrocento Sans", "Quattrocento"]]) {
    const s = sc(q);
    ok(s.font !== notParent, `${q}: a sibling family, never the ${notParent} guide (got ${s.match} ${s.font})`);
  }
  ok(/^0 results/.test(txt("Zzyzx Highlight")), "unknown family + style word is still a zero");

  // 3. script wording
  for (const q of ["Modak", "Bagel Fat One"]) {
    const s = sc(q), t = txt(q);
    ok(s.match === "similar" && s.similar_to.length > 0, `${q}: similar-font answer`);
    ok(!/Devanagari|Korean/.test(t), `${q}: no script claim for Latin guides (${t.split("\n")[0].slice(0, 140)})`);
    ok(/similar display fonts \(/.test(t), `${q}: neutral "similar display fonts" wording`);
  }
  const LABEL = { Arab: "Arabic-script", Hans: "Simplified Chinese", Hant: "Traditional Chinese", Jpan: "Japanese", Kore: "Korean", Cyrl: "Cyrillic", Deva: "Devanagari", Hebr: "Hebrew", Thai: "Thai", Grek: "Greek" };
  let shared = 0, mixed = 0;
  for (const m of GFM.values()) {
    if (!LABEL[m.script]) continue;
    const s = sc(m.family);
    if (s.match !== "similar") continue;
    const all = s.similar_to.every((f) => (GFM.get(key(f)) || {}).script === m.script);
    const first = txt(m.family).split("\n")[0];
    ok(all === first.includes(`similar ${LABEL[m.script]} `), `${m.family}: script named iff every similar guide shares ${m.script} (${first.slice(0, 120)})`);
    all ? shared++ : mixed++;
  }
  ok(shared > 0 && mixed > 0, `script property covers both cases (shared ${shared}, mixed ${mixed})`);

  // 4. regression vs BASE: every family / partner / curated name
  const names = new Set([...[...GFM.values()].map((m) => m.family), ...Object.values(BASE_DATA).flatMap((v) => [v.font, ...v.pairs.flatMap((p) => [p.heading, p.body])])]);
  const newFonts = new Set(plan.map((r) => r.title));
  const changed = {};
  for (const q of names) {
    const b = baseFP({ font: q }), c = fontPairing({ font: q });
    if (JSON.stringify(b) === JSON.stringify(c)) continue;
    if (!b.structuredContent.match && !c.structuredContent.match && b.structuredContent.font === null)
      ok(b.content[0].text.replace(/\d+ fonts have pairing guides/, "") === c.content[0].text.replace(/\d+ fonts have pairing guides/, ""), `${q}: zero answer differs beyond the guide count`);
    const bs = b.structuredContent, cs = c.structuredContent;
    const oldGuide = bs.page && ["exact", "alias", "prefix"].includes(bs.match);
    ok(!oldGuide, `${q}: BASE cited ${bs.page} (${bs.match}); the answer must not change`);
    const why = newFonts.has(cs.font) && cs.page ? `new guide (${cs.match})` : cs.match === "similar" && bs.match === "similar" ? "similar: new guides / wording" : `${bs.match || "zero"} -> ${cs.match || "zero"}`;
    (changed[why] = changed[why] || []).push(q);
  }
  for (const q of ["Poppins", "Montserrat", "Playfair Display", "Trajan", "Onest", "Garamond", "Inter"]) ok(JSON.stringify(baseFP({ font: q })) === JSON.stringify(fontPairing({ font: q })), `${q}: unchanged`);
  // zero -> zero: only the guide count in the zero text moves (106 -> 146); similar -> partner: the font is now a partner on a B1 guide
  const allowed = (k) => /^new guide|^similar: |-> variant$|^similar -> partner$|^partner -> partner$|^zero -> zero$/.test(k);
  for (const [k, v] of Object.entries(changed)) ok(allowed(k), `unexpected change kind "${k}": ${v.slice(0, 8).join(", ")}`);
  console.log("changed vs BASE:", Object.entries(changed).map(([k, v]) => `${k}: ${v.length}`).join("; "));
  console.log("  variant examples:", Object.entries(changed).filter(([k]) => /variant/.test(k)).flatMap(([, v]) => v).slice(0, 12).join(", "));

  // 5. argument aliases
  const P = (...k) => Object.fromEntries(k.map((x) => [x, {}]));
  const cases = [
    ["get_ui_screen_code", { id: "abcdef123456" }, P("screen_id", "format"), { screen_id: "abcdef123456" }],
    ["get_ui_screen_code", { screenId: "abcdef123456" }, P("screen_id", "format"), { screen_id: "abcdef123456" }],
    ["get_ui_screen_code", { screen_id: "aaaaaaaaaaaa", id: "bbbbbbbbbbbb" }, P("screen_id", "format"), { screen_id: "aaaaaaaaaaaa" }],
    ["generate_color_scale", { color: "#e0a775" }, P("colors", "keep_color", "anchor", "formats"), { colors: "#e0a775" }],
    ["generate_color_scale", { colour: "#123456" }, P("colors"), { colors: "#123456" }],
    ["get_font_pairing", { font_name: "Arvo" }, P("font", "group", "limit"), { font: "Arvo" }],
    ["get_font_pairing", { fontFamily: "Arvo" }, P("font", "group", "limit"), { font: "Arvo" }],
    ["search_ui_screens", { q: "login" }, P("query", "pattern"), { query: "login" }],
    ["search_design_inspiration", { search: "art deco" }, P("query", "theme", "limit"), { query: "art deco" }],
    ["generate_website_color_palette", { brandColor: "#2563eb" }, P("brand_color", "harmony", "style"), { brand_color: "#2563eb" }],
    ["generate_website_color_palette", { primary_color: "#2563eb" }, P("brand_color", "harmony", "style"), { brand_color: "#2563eb" }],
    ["check_contrast", { fg: "#333", bg: "#fff" }, P("foreground", "background", "colors"), { foreground: "#333", background: "#fff" }],
    ["generate_logo_concepts", { brand_name: "Acme" }, P("name", "industry"), { name: "Acme" }],
    ["make_brand_board", { name: "Acme" }, P("brand_name", "colors"), { brand_name: "Acme" }],
    ["get_brand_typeface", { company: "IBM" }, P("brand", "brands"), { brand: "IBM" }],
    ["get_ui_flow", { flow_id: "onboarding" }, P("flow", "platform"), { flow: "onboarding" }],
  ];
  for (const [tool, a, props, want] of cases) {
    const out = normalizeArgs(tool, a, props);
    ok(Object.entries(want).every(([k, v]) => out[k] === v), `${tool} ${JSON.stringify(a)} -> ${JSON.stringify(out)}`);
    ok(Object.keys(a).every((k) => out[k] === a[k]), `${tool}: sent arguments kept`);
  }
  const same = { query: "x" };
  ok(normalizeArgs("search_ui_screens", same, P("query")) === same, "no alias needed: same object back");
  ok(normalizeArgs("unknown_tool", { id: 1 }, null).id === 1, "unknown tool: untouched");
  ok(normalizeArgs("search_icons", { name: "home" }, P("query", "name")).query === undefined, "an alias that is the tool's own property is not copied");
} finally {
  fs.unlinkSync(tmp); fs.unlinkSync(baseFile);
}
if (fails.length) { console.log(fails.slice(0, 40).join("\n")); assert.fail(`${fails.length} of ${n} assertions failed`); }
console.log(`ok ${n} assertions`);
