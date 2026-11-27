// typo-b11 (27-Nov-2026): typography batch B11 in get_font_pairing (data only, no code change).
//  1. The non-held B11 pairing guides (deploy-bundle-2026-11-25/fonts-b11, built by typo_publish/build_typo_mcp.py on BASE): exact hits,
//     page = the batch slug, 5 pairs each. Every BASE entry is byte-identical (lines only added), and every BASE answer that cited a
//     guide (exact / alias / prefix / variant) is unchanged.
//  2. Siblings with their own guides stay separate (IBM Plex Sans vs IBM Plex Serif, Red Hat Display vs Red Hat Text, Funnel Display vs Funnel Sans).
// Run: node --no-warnings tests/typo_b11.test.mjs   (BASE = the commit this branch was cut from)
import fs from "node:fs"; import path from "node:path"; import assert from "node:assert"; import { pathToFileURL } from "node:url";
import { execFileSync } from "node:child_process";
const BASE = process.env.TB11_BASE || "9ac372b";
const BUNDLE = process.env.TB11_BUNDLE || path.join(process.env.HOME, "Downloads/EtiennAubertBonn/deploy-bundle-2026-11-25");
const src = path.resolve("src"), tmp = path.join(src, "_typo_b11_test.mjs"), baseFile = path.join(src, "_typo_b11_base.mjs");
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

  // 1. the B11 guides (plan rows without "held"). MCP_HELD: published guides kept OUT of this data (none in B11). B8's Waiting for the
  //    Sunrise stays held (fontKey() strips the stop word "for"), so it must still be absent.
  const MCP_HELD = new Set([]);
  ok(!("waiting for the sunrise" in DATA), "Waiting for the Sunrise: still held out of the data");
  const plan = JSON.parse(fs.readFileSync(path.join(BUNDLE, "fonts-b11", "src", "plan.json"), "utf8")).filter((r) => r.kind === "pairing" && !("held" in r) && !MCP_HELD.has(r.title)).map((r) => ({ ...r, batch: "fonts-b11" }));
  const NEW = plan.length;
  ok(NEW > 0, `fonts-b11: ${NEW} pairing rows`);
  ok(Object.keys(DATA).length === Object.keys(BASE_DATA).length + NEW, `${Object.keys(BASE_DATA).length} + ${NEW} guide fonts (got ${Object.keys(DATA).length})`);
  ok(Object.keys(DATA).filter((k) => !(k in BASE_DATA)).length === NEW, `${NEW} new keys`);
  const pairs = Object.values(DATA).reduce((a, v) => a + v.pairs.length, 0);
  ok(pairs === Object.values(BASE_DATA).reduce((a, v) => a + v.pairs.length, 0) + 5 * NEW, `${5 * NEW} new pairs (total ${pairs})`);
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

    // 2. siblings with their own guides stay separate
  for (const [q, want] of [["IBM Plex Sans", "IBM Plex Sans"], ["Red Hat Display", "Red Hat Display"], ["Funnel Display", "Funnel Display"]]) {
    const s = sc(q), b = baseFP({ font: q }).structuredContent;
    ok(s.font === want && s.page === b.page, `${q}: still its own guide (got ${s.match} ${s.font} ${s.page})`);
  }

  // 5. regression vs BASE: every Google family, every BASE partner and guide font
  const names = new Set([...[...GFM.values()].map((m) => m.family), ...Object.values(BASE_DATA).flatMap((v) => [v.font, ...v.pairs.flatMap((p) => [p.heading, p.body])])]);
  const newFonts = new Set(plan.map((r) => r.title));
  const SUPERSEDED = new Set([]);
  const changed = {};
  for (const q of names) {
    const b = baseFP({ font: q }), c = fontPairing({ font: q });
    if (JSON.stringify(b) === JSON.stringify(c)) continue;
    const bs = b.structuredContent, cs = c.structuredContent;
    if (!bs.match && !cs.match && bs.font === null)
      ok(b.content[0].text.replace(/\d+ fonts have pairing guides/, "") === c.content[0].text.replace(/\d+ fonts have pairing guides/, ""), `${q}: zero answer differs beyond the guide count`);
    const oldGuide = bs.page && ["exact", "alias", "prefix", "variant"].includes(bs.match);
    // a font that BASE folded into a bigger family by prefix (Cormorant Infant -> Cormorant, Lobster Two -> Lobster) and that now has its
    // own B11 guide answers with that guide: the one intended supersession, listed so a new one fails loudly
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
