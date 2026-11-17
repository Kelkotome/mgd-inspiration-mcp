// get_font_pairing, fonts r4 (16-Nov-2026): the 11 fonts that answered "0 results" on 9-16 Nov are exact guide hits, a Google Font with no
// guide and no partner hits answers with the published pairings of similar guide fonts (match "similar", honest label, a source page per
// pair), junk input gets a short validation message (match "invalid", no 30-font list, not a zero), and existing answers are unchanged.
// Run: node tests/fp_r4.test.mjs   (inlines the JSON import like fp_r2; compares with the code + data at BASE = r4 before this round)
import fs from "node:fs"; import path from "node:path"; import assert from "node:assert"; import { pathToFileURL } from "node:url";
import { execFileSync } from "node:child_process";
const BASE = process.env.FP4_BASE || "633ffbc";   // r4 tip with fonts r3 (102 guides), before fonts r4
const src = path.resolve("src"), tmp = path.join(src, "_fp_r4_test.mjs");
const DATA = JSON.parse(fs.readFileSync(path.join(src, "font_pairings.json"), "utf8"));
const inline = (code, json) => code.replace('import PAIRINGS from "./font_pairings.json";', "const PAIRINGS = " + json + ";");
fs.writeFileSync(tmp, inline(fs.readFileSync(path.join(src, "font_pairing.js"), "utf8"), JSON.stringify(DATA)));
const git = (f) => execFileSync("git", ["show", `${BASE}:src/${f}`], { encoding: "utf8", maxBuffer: 64 << 20 });
// the base copy sits next to the live modules: this round leaves font_pairings_curated.js and search_extras.js untouched (checked here)
for (const f of ["font_pairings_curated.js", "search_extras.js"]) assert.equal(git(f), fs.readFileSync(path.join(src, f), "utf8"), `${f} changed since ${BASE}`);
const baseFile = path.join(src, "_fp_r4_base.mjs");
fs.writeFileSync(baseFile, inline(git("font_pairing.js"), git("font_pairings.json")));
let n = 0;
const fails = [];
const ok = (c, m) => { if (!c) fails.push(m); n++; };
try {
  const { fontPairing, notAFont, similarGuides } = await import(pathToFileURL(tmp));
  const { fontPairing: baseFP } = await import(pathToFileURL(baseFile));
  const r = (f, extra) => fontPairing({ font: f, ...(extra || {}) });
  const sc = (f, extra) => r(f, extra).structuredContent;
  const head = (f) => r(f).content[0].text.split("\n")[0];
  const { GF_META } = await import(pathToFileURL(path.join(src, "gf_meta.js")));
  const GF_FAMILIES = new Set(GF_META.split("\n").map((l) => l.split("|")[0]));

  // 1. the 11 zero fonts of 9-16 Nov: exact hits on their own published guide, 5 pairs, every partner a Google Fonts family
  const ELEVEN = { "Golos Text": "golos-text", "Vazirmatn": "vazirmatn", "Noto Sans SC": "noto-sans-sc", "Noto Serif SC": "noto-serif-sc",
    "Estedad": "estedad", "Forum": "forum", "Prata": "prata", "Bellefair": "bellefair", "Tenor Sans": "tenor-sans",
    "Gilda Display": "gilda-display", "Italiana": "italiana" };
  for (const [f, slug] of Object.entries(ELEVEN)) {
    for (const q of [f, f.toLowerCase(), f + " font pairing", f.toUpperCase()]) {
      const s = sc(q);
      ok(s.match === "exact" && s.font === f, `${q}: exact hit on ${f} (got ${s.match} ${s.font})`);
      ok(s.page === `https://madegooddesigns.com/${slug}-font-pairings/`, `${q}: cites ${slug}-font-pairings (got ${s.page})`);
      ok(s.pairs.length === 5, `${q}: 5 pairs (got ${s.pairs.length})`);
      ok(!/^0 results/.test(head(q)), `${q}: not "0 results"`);
    }
    for (const p of sc(f).pairs) {
      ok(p.heading === f || p.body === f, `${f}: ${p.heading} + ${p.body} names the font`);
      for (const x of [p.heading, p.body]) ok(GF_FAMILIES.has(x), `${f}: ${x} is a Google Fonts family`);
      ok(typeof p.why === "string" && p.why.length >= 60 && p.why.length <= 200 && /[.!?]$/.test(p.why) && !/[—–]/.test(p.why), `${f}: why "${p.why}"`);
      ok(/^https:\/\/fonts\.googleapis\.com\/css2\?/.test(p.google_fonts_url), `${f}: Google Fonts link`);
    }
    ok(sc(f).about && sc(f).about.designers.length > 0, `${f}: about block`);
  }
  // the two new guides: facts from google/fonts METADATA.pb; bilingual / script partners
  ok(JSON.stringify(sc("Golos Text").about) === JSON.stringify({ category: "Sans Serif", designers: ["Alexandra Korolkova", "Vitaly Kuzmin"], added: 2023 }), "Golos Text about");
  ok(JSON.stringify(sc("Estedad").about) === JSON.stringify({ category: "Sans Serif", designers: ["Amin Abedi", "Fontamin"], added: 2026 }), "Estedad about");
  const partners = (f) => sc(f).pairs.map((p) => (p.heading === f ? p.body : p.heading));
  ok(["Lalezar", "Amiri", "Noto Naskh Arabic"].every((x) => partners("Estedad").includes(x)), "Estedad: Arabic-script partners");
  ok(partners("Estedad").includes("Manrope") && /bilingual/i.test(sc("Estedad").pairs.find((p) => p.heading === "Manrope").why), "Estedad: Latin partner for bilingual pages");
  ok(partners("Golos Text").includes("PT Serif") && /Cyrillic/.test(sc("Golos Text").pairs.map((p) => p.why).join(" ")), "Golos Text: Cyrillic partners");
  ok(sc("Estedad").pairs.find((p) => p.body === "Amiri").group === "Serif Pairings", "Amiri is grouped as a serif partner");
  ok(sc("Estedad", { group: "mono" }).pairs.length === 5, "Estedad: unknown group falls back to all pairs (unchanged rule)");
  ok(r("Estedad").content[0].text.includes('body { font-family: "Amiri", serif; }'), "Estedad + Amiri CSS uses the serif fallback");

  // 2. similar-font fallback: a Google Font with no guide, no curated entry and no partner hits
  for (const f of ["Play", "Pinyon Script", "Noto Kufi Arabic", "Martian Mono"]) {
    const s = sc(f), t = r(f).content[0].text;
    if (!s.match) { ok(false, `${f}: no answer at all (${t.slice(0, 80)})`); continue; }
    ok(s.match === "similar" && s.font === f && s.page === null, `${f}: match similar (got ${s.match})`);
    ok(s.pairs.length >= 1 && s.pairs.length <= 6, `${f}: 1-6 pairs (got ${s.pairs.length})`);
    ok(new RegExp(`^No dedicated guide for ${f} yet; these are published pairings for similar `).test(t), `${f}: honest label (${t.split("\n")[0].slice(0, 90)})`);
    ok(!/^0 results/.test(t), `${f}: not "0 results"`);
    ok(s.pairs.every((p) => /^https:\/\/madegooddesigns\.com\/[a-z0-9-]+\/$/.test(p.page) && s.similar_to.includes(p.similar_to)), `${f}: a source page per pair`);
    ok(s.pairs.every((p) => t.includes(`source: ${p.page}`)), `${f}: source pages in the text`);
    ok(s.try_url === "https://madegooddesigns.com/font-pairing-generator/", `${f}: generator link`);
  }
  ok(sc("Play").category === "Sans Serif" && /similar sans-serif fonts/.test(head("Play")), "Play: sans-serif label");
  ok(!sc("Play").similar_to.includes("Playfair Display"), "Play never borrows Playfair Display");
  ok(sc("Pinyon Script").category === "Handwriting" && sc("Pinyon Script").similar_to.every((f) => DATA[f.toLowerCase()].about.category === "Handwriting"), "Pinyon Script: handwriting guides only");
  ok(/similar Arabic-script sans-serif fonts/.test(head("Noto Kufi Arabic")) && sc("Noto Kufi Arabic").similar_to.every((f) => ["Vazirmatn", "Estedad"].includes(f)), "Noto Kufi Arabic: Arabic-script guides only");
  ok(sc("Martian Mono").category === "Monospace" && sc("Martian Mono").similar_to.every((f) => DATA[f.toLowerCase()].about.category === "Monospace"), "Martian Mono: monospace guides only");
  ok(sc("Play", { limit: 2 }).pairs.length === 2 && sc("Play", { limit: 20 }).pairs.length <= 20, "similar respects limit");
  // round-robin: the first pairs come from different guides
  const sp = sc("Play").pairs;
  ok(new Set(sp.slice(0, Math.min(3, sc("Play").similar_to.length)).map((p) => p.similar_to)).size === Math.min(3, sc("Play").similar_to.length), "similar: first pairs from different guides");
  // a script with no guide of its own stays an honest zero (never Latin advice for a Thai or Korean font)
  for (const f of ["Noto Sans Thai", "Noto Serif Devanagari", "Gowun Batang", "Noto Color Emoji", "Libre Barcode 39", "Redacted"]) ok(/^0 results/.test(head(f)) && sc(f).pairs.length === 0, `${f}: honest zero (no ${f.split(" ").pop()} guide)`);
  ok(similarGuides({ family: "X", c: "S", stroke: "S", script: "Thai", pop: 1 }).length === 0, "no Thai guides to borrow from");

  // 3. junk / non-font input: short validation, no font list, not a zero, not an error
  for (const q of ["python asyncio", "", "   ", "lorem ipsum dolor", "SELECT * FROM fonts", "https://example.com/font", "<script>alert(1)</script>",
    "what is the weather in paris tomorrow morning please", "x".repeat(120), "font pairing", "hello world"]) {
    const res = r(q), t = res.content[0].text;
    ok(res.structuredContent.match === "invalid" && res.structuredContent.pairs.length === 0, `${JSON.stringify(q.slice(0, 30))}: match invalid (got ${res.structuredContent.match})`);
    ok(t.length < 200 && !/fonts have pairing guides/.test(t) && !/^0 /.test(t) && !res.isError, `${JSON.stringify(q.slice(0, 30))}: short message (${t.length} chars)`);
  }
  ok(r(undefined).structuredContent.match === "invalid" && r(null).structuredContent.match === "invalid", "missing font: invalid");
  ok(fontPairing({}).structuredContent.match === "invalid", "no arguments: invalid");
  // real names never count as junk: guide fonts, Google Fonts families, commercial names, misspellings
  for (const q of ["Gotham", "Proxima Nova", "Helvetica Neue", "Zzyzx Display", "Circular Std", "Neue Haas Grotesk", "monserrat", "Avenir Next"])
    ok(notAFont(q) === null, `${q}: not flagged as junk`);
  ok(/^0 results/.test(head("Gotham")) && /^0 results/.test(head("Zzyzx Display")), "unknown non-Google names keep the 0-results answer (gap signal)");

  // 4. regressions: Poppins, Montserrat, the Crimson Pro partner case and every other old answer are byte-identical to BASE
  for (const q of ["Poppins", "Montserrat", "Crimson Pro", "Poppins font pairing", "Montserrat Bold", "Spectral", "Crimson Text", "Inter", "Helvetica"]) {
    ok(JSON.stringify(r(q)) === JSON.stringify(baseFP({ font: q })), `${q}: unchanged versus ${BASE}`);
    ok(JSON.stringify(r(q, { group: "serif", limit: 3 })) === JSON.stringify(baseFP({ font: q, group: "serif", limit: 3 })), `${q} (group serif, limit 3): unchanged`);
  }
  ok(sc("Poppins").match === "exact" && sc("Poppins").page === "https://madegooddesigns.com/poppins-font-pairing/", "Poppins: exact, own guide");
  ok(sc("Montserrat").match === "exact" && sc("Montserrat").pairs.length >= 4, "Montserrat: exact");
  ok(sc("Crimson Pro").match === "partner" && sc("Crimson Pro").font === "Crimson Pro" && sc("Crimson Pro").pairs.length >= 1, "Crimson Pro: partner answer");
  const NEW = new Set(["golos text", "estedad", "trajan", "onest"]);   // fonts r5 (17-Nov): Trajan + Onest guides are checked in fp_r5
  const SIMILAR_NOW = new Set(["play"]);   // guard probe of mcp-gaps-r1: was "0 results", now similar
  let same = 0, total = 0;
  for (const v of Object.values(DATA)) {
    if (NEW.has(v.font.toLowerCase())) continue;
    total++;
    const a = JSON.stringify(r(v.font)), b = JSON.stringify(baseFP({ font: v.font }));
    ok(a === b, `${v.font}: unchanged versus ${BASE}`);
    if (a === b) same++;
  }
  const { CURATED } = await import(pathToFileURL(path.join(src, "font_pairings_curated.js")));
  for (const v of Object.values(CURATED)) {
    if (DATA[v.font.toLowerCase()]) continue;   // fonts that have their own guide now are compared above
    total++;
    const a = JSON.stringify(r(v.font)), b = JSON.stringify(baseFP({ font: v.font }));
    ok(a === b, `${v.font} (curated): unchanged versus ${BASE}`);
    if (a === b) same++;
  }
  for (const q of ["Play"]) ok(SIMILAR_NOW.has(q.toLowerCase()) && /^0 results/.test(baseFP({ font: q }).content[0].text), `${q}: was 0 results on ${BASE}`);
  console.log(`${total} guide + curated fonts compared with ${BASE}, ${same} unchanged`);
} finally {
  fs.unlinkSync(tmp);
  fs.unlinkSync(baseFile);
}
if (fails.length) { console.log(fails.slice(0, 40).join("\n")); assert.fail(`${fails.length} of ${n} assertions failed`); }
console.log(`ok ${n} assertions`);
