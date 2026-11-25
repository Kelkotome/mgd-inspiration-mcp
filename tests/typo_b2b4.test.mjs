// typo-b2b4 (26-Nov-2026): typography batches B2, B3 and B4 in get_font_pairing (data only, no code change).
//  1. 120 new guides (deploy-bundle-2026-11-25/fonts-b2, -b3, -b4, built by typo_publish/build_typo_mcp.py chained B2 -> B3 -> B4):
//     exact hits, page = the batch slug, 5 pairs each. The 146 BASE entries (106 older + 40 B1) are byte-identical, and every BASE
//     answer that cited an old guide (exact / alias / prefix / variant) is unchanged.
//  2. Fold-ins reach the parent guide (Bungee Shade, Alegreya SC, IM Fell English SC, Bowlby One SC); mono / sans siblings stay separate.
//  3. "Baloo" (no such Google family; Baloo 2 is the current one) now reaches the Baloo 2 guide instead of a similar-font answer.
//  4. Modak and Bagel Fat One still answer with neutral "similar display fonts" wording (no B2-B4 guide; B5 drafts them).
// Run: node --no-warnings tests/typo_b2b4.test.mjs   (BASE = the commit this branch was cut from)
import fs from "node:fs"; import path from "node:path"; import assert from "node:assert"; import { pathToFileURL } from "node:url";
import { execFileSync } from "node:child_process";
const BASE = process.env.TB24_BASE || "ba04652";
const BUNDLE = process.env.TB24_BUNDLE || path.join(process.env.HOME, "Downloads/EtiennAubertBonn/deploy-bundle-2026-11-25");
const src = path.resolve("src"), tmp = path.join(src, "_typo_b2b4_test.mjs"), baseFile = path.join(src, "_typo_b2b4_base.mjs");
const DATA_TEXT = fs.readFileSync(path.join(src, "font_pairings.json"), "utf8");
const DATA = JSON.parse(DATA_TEXT);
const inline = (code, json) => code.replace('import PAIRINGS from "./font_pairings.json";', "const PAIRINGS = " + json + ";");
const git = (f) => execFileSync("git", ["show", `${BASE}:src/${f}`], { encoding: "utf8", maxBuffer: 64 << 20 });
for (const f of ["font_pairing.js", "font_pairings_curated.js", "gf_meta.js", "search_extras.js", "arg_alias.js"])
  assert.equal(git(f), fs.readFileSync(path.join(src, f), "utf8"), `${f} changed since ${BASE} (this change set is data only)`);
fs.writeFileSync(tmp, inline(fs.readFileSync(path.join(src, "font_pairing.js"), "utf8"), DATA_TEXT));
fs.writeFileSync(baseFile, inline(git("font_pairing.js"), git("font_pairings.json")));
let n = 0;
const fails = [];
const ok = (c, m) => { if (!c) fails.push(m); n++; };
try {
  const { fontPairing } = await import(pathToFileURL(tmp));
  const { fontPairing: baseFP } = await import(pathToFileURL(baseFile));
  const { GF_META } = await import(pathToFileURL(path.join(src, "gf_meta.js")));
  const sc = (f, x) => fontPairing({ font: f, ...(x || {}) }).structuredContent;
  const txt = (f, x) => fontPairing({ font: f, ...(x || {}) }).content[0].text;
  const BASE_TEXT = git("font_pairings.json"), BASE_DATA = JSON.parse(BASE_TEXT);
  const key = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  const GFM = new Map(GF_META.split("\n").filter(Boolean).map((l) => { const [family, c, stroke, script] = l.split("|"); return [key(family), { family, c, script }]; }));

  // 0. existing entries byte-identical in the file itself: the new file is the old one with lines only added
  const oldLines = BASE_TEXT.split("\n"), newLines = DATA_TEXT.split("\n");
  let j = 0;
  for (const l of newLines) if (j < oldLines.length && l === oldLines[j]) j++;
  ok(j === oldLines.length, `every BASE line is kept in order (matched ${j} of ${oldLines.length})`);
  for (const k of Object.keys(BASE_DATA)) ok(JSON.stringify(DATA[k]) === JSON.stringify(BASE_DATA[k]), `${k}: data unchanged`);

  // 1. the 120 guides
  const plan = [];
  for (const b of ["fonts-b2", "fonts-b3", "fonts-b4"]) {
    const rows = JSON.parse(fs.readFileSync(path.join(BUNDLE, b, "src", "plan.json"), "utf8")).filter((r) => r.kind === "pairing" && !("held" in r));
    ok(rows.length === 40, `${b}: 40 pairing rows (got ${rows.length})`);
    plan.push(...rows.map((r) => ({ ...r, batch: b })));
  }
  ok(Object.keys(DATA).length === Object.keys(BASE_DATA).length + 120, `266 guide fonts (got ${Object.keys(DATA).length})`);
  ok(Object.keys(DATA).filter((k) => !(k in BASE_DATA)).length === 120, "120 new keys");
  const pairs = Object.values(DATA).reduce((a, v) => a + v.pairs.length, 0);
  ok(pairs === Object.values(BASE_DATA).reduce((a, v) => a + v.pairs.length, 0) + 600, `600 new pairs (total ${pairs})`);
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
    ok(v && v.pairs.every((p) => p.heading_gf && p.body_gf), `${row.title}: every partner is a Google Fonts family`);
    ok(v && v.about && v.about.category && v.about.designers.length > 0, `${row.title}: about block`);
    ok(v && v.pairs.every((p) => p.heading !== p.body), `${row.title}: no self-pair`);
  }
  ok(!Object.values(DATA).some((v) => /-font-alternatives\/|-vs-|google-fonts\/|typography\/|transitional-serif|what-is-a-glyph|oldstyle-numerals|ascender/.test(v.page || "")), "vein articles never feed get_font_pairing");

  // 2. fold-ins and siblings
  for (const [q, parent] of [["Bungee Shade", "Bungee"], ["Bungee Inline", "Bungee"], ["Bungee Outline", "Bungee"], ["Alegreya SC", "Alegreya"],
    ["IM Fell English SC", "IM Fell English"], ["Bowlby One SC", "Bowlby One"], ["Alegreya Sans SC", "Alegreya Sans"], ["Exo 2", "Exo 2"], ["Exo", "Exo"]]) {
    const s = sc(q);
    ok(s.font === parent && s.page === DATA[parent.toLowerCase()].page, `${q}: answers with the ${parent} guide (got ${s.match} ${s.font})`);
  }
  for (const [q, notParent] of [["Alegreya Sans", "Alegreya"], ["Chivo Mono", "Chivo"], ["B612 Mono", "B612"], ["Overpass Mono", "Overpass"], ["Lobster Two", "Lobster"], ["Crimson Text", "Crimson Pro"]]) {
    const s = sc(q);
    ok(s.font !== notParent, `${q}: a sibling family, never the ${notParent} guide (got ${s.match} ${s.font})`);
  }

  // 3. Baloo -> Baloo 2 guide
  { const s = sc("Baloo"); ok(s.font === "Baloo 2" && s.page === "https://madegooddesigns.com/baloo-2-font-pairings/", `Baloo: Baloo 2 guide (got ${s.match} ${s.font} ${s.page})`); }
  { const s = sc("Baloo 2"); ok(s.match === "exact" && s.page === "https://madegooddesigns.com/baloo-2-font-pairings/", "Baloo 2: exact"); }
  // Shrikhand (B1) unchanged
  ok(JSON.stringify(baseFP({ font: "Shrikhand" })) === JSON.stringify(fontPairing({ font: "Shrikhand" })), "Shrikhand: unchanged B1 answer");

  // 4. Modak / Bagel Fat One wording
  for (const q of ["Modak", "Bagel Fat One"]) {
    const s = sc(q), t = txt(q);
    ok(s.match === "similar" && s.similar_to.length > 0, `${q}: similar-font answer`);
    ok(!/Devanagari|Korean/.test(t), `${q}: no script claim (${t.split("\n")[0].slice(0, 140)})`);
    ok(/similar display fonts \(/.test(t), `${q}: neutral "similar display fonts" wording`);
  }

  // 5. regression vs BASE: every Google family, every BASE partner and guide font
  const names = new Set([...[...GFM.values()].map((m) => m.family), ...Object.values(BASE_DATA).flatMap((v) => [v.font, ...v.pairs.flatMap((p) => [p.heading, p.body])])]);
  const newFonts = new Set(plan.map((r) => r.title));
  const SUPERSEDED = new Set(["Cormorant Infant", "Lobster Two"]);
  const changed = {};
  for (const q of names) {
    const b = baseFP({ font: q }), c = fontPairing({ font: q });
    if (JSON.stringify(b) === JSON.stringify(c)) continue;
    const bs = b.structuredContent, cs = c.structuredContent;
    if (!bs.match && !cs.match && bs.font === null)
      ok(b.content[0].text.replace(/\d+ fonts have pairing guides/, "") === c.content[0].text.replace(/\d+ fonts have pairing guides/, ""), `${q}: zero answer differs beyond the guide count`);
    const oldGuide = bs.page && ["exact", "alias", "prefix", "variant"].includes(bs.match);
    // a font that BASE folded into a bigger family by prefix (Cormorant Infant -> Cormorant, Lobster Two -> Lobster) and that now has its
    // own B2-B4 guide answers with that guide: the one intended supersession, listed so a new one fails loudly
    const superseded = bs.match === "prefix" && cs.match === "exact" && newFonts.has(cs.font) && SUPERSEDED.has(q);
    ok(!oldGuide || superseded, `${q}: BASE cited ${bs.page} (${bs.match}); the answer must not change`);
    if (superseded) { (changed["own guide supersedes prefix"] = changed["own guide supersedes prefix"] || []).push(q); continue; }
    const why = newFonts.has(cs.font) && cs.page ? `new guide (${cs.match})` : cs.match === "similar" && bs.match === "similar" ? "similar: new guides" : `${bs.match || "zero"} -> ${cs.match || "zero"}`;
    (changed[why] = changed[why] || []).push(q);
  }
  for (const q of ["Poppins", "Montserrat", "Playfair Display", "Trajan", "Onest", "Garamond", "Inter", "Zilla Slab", "Zilla Slab Highlight", "Arvo"])
    ok(JSON.stringify(baseFP({ font: q })) === JSON.stringify(fontPairing({ font: q })), `${q}: unchanged`);
  const allowed = (k) => /^own guide supersedes prefix$|^new guide|^similar: |^similar -> partner$|^partner -> partner$|^zero -> zero$|^zero -> partner$|^zero -> similar$/.test(k);
  for (const [k, v] of Object.entries(changed)) ok(allowed(k), `unexpected change kind "${k}": ${v.slice(0, 8).join(", ")}`);
  console.log("changed vs BASE:", Object.entries(changed).map(([k, v]) => `${k}: ${v.length}`).join("; "));
} finally {
  fs.unlinkSync(tmp); fs.unlinkSync(baseFile);
}
if (fails.length) { console.log(fails.slice(0, 40).join("\n")); assert.fail(`${fails.length} of ${n} assertions failed`); }
console.log(`ok ${n} assertions`);
