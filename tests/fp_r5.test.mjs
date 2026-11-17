// get_font_pairing, fonts r5 (17-Nov-2026): Trajan (a commercial Adobe font, not on Google Fonts) and Onest get their own guides
// (deploy-bundle-2026-11-09/fonts-r5, published separately; the Worker deploy waits until both pages answer 200).
//  - Trajan / Trajan Pro / Trajan Pro 3 answer with trajan-font-pairings (exact or alias), 5 pairs, Trajan always the heading; the CSS
//    names the Adobe Fonts family stack with a serif fallback; the note says it is not free and licensed through Adobe Fonts; the About
//    line never says "free on Google Fonts"; the Google Fonts link carries only the partner; Trajan Sans stays an honest zero.
//  - Onest answers with onest-font-pairings (was the curated, page-null entry); about block from google/fonts METADATA.pb.
//  - Big Shoulders Display still answers with the live Big Shoulders guide (alias since fonts r2; no second guide).
//  - every other answer (all guide fonts, all curated fonts, the similar / partner / junk / zero probes) is byte-identical to BASE.
// Run: node tests/fp_r5.test.mjs   (inlines the JSON import like fp_r4; BASE = the tip before this round)
import fs from "node:fs"; import path from "node:path"; import assert from "node:assert"; import { pathToFileURL } from "node:url";
import { execFileSync } from "node:child_process";
const BASE = process.env.FP5_BASE || "575308f";   // museum-collection-2026-10 with fonts r4 (104 guides), before fonts r5
const src = path.resolve("src"), tmp = path.join(src, "_fp_r5_test.mjs");
const DATA = JSON.parse(fs.readFileSync(path.join(src, "font_pairings.json"), "utf8"));
const inline = (code, json) => code.replace('import PAIRINGS from "./font_pairings.json";', "const PAIRINGS = " + json + ";");
fs.writeFileSync(tmp, inline(fs.readFileSync(path.join(src, "font_pairing.js"), "utf8"), JSON.stringify(DATA)));
const git = (f) => execFileSync("git", ["show", `${BASE}:src/${f}`], { encoding: "utf8", maxBuffer: 64 << 20 });
for (const f of ["font_pairings_curated.js", "search_extras.js", "gf_meta.js"]) assert.equal(git(f), fs.readFileSync(path.join(src, f), "utf8"), `${f} changed since ${BASE}`);
const baseFile = path.join(src, "_fp_r5_base.mjs");
fs.writeFileSync(baseFile, inline(git("font_pairing.js"), git("font_pairings.json")));
let n = 0;
const fails = [];
const ok = (c, m) => { if (!c) fails.push(m); n++; };
try {
  const { fontPairing, similarGuides } = await import(pathToFileURL(tmp));
  const { fontPairing: baseFP } = await import(pathToFileURL(baseFile));
  const r = (f, extra) => fontPairing({ font: f, ...(extra || {}) });
  const sc = (f, extra) => r(f, extra).structuredContent;
  const txt = (f, extra) => r(f, extra).content[0].text;
  const { GF_META } = await import(pathToFileURL(path.join(src, "gf_meta.js")));
  const GF_FAMILIES = new Set(GF_META.split("\n").map((l) => l.split("|")[0]));
  const BASE_DATA = JSON.parse(git("font_pairings.json"));

  // 0. data: exactly two new entries, the 104 old ones untouched
  ok(Object.keys(DATA).length === Object.keys(BASE_DATA).length + 2, `106 guide fonts (got ${Object.keys(DATA).length})`);
  for (const k of Object.keys(BASE_DATA)) ok(JSON.stringify(DATA[k]) === JSON.stringify(BASE_DATA[k]), `${k}: data unchanged`);

  // 1. Trajan
  const TP = "https://madegooddesigns.com/trajan-font-pairings/";
  for (const [q, how] of [["Trajan", "exact"], ["trajan", "exact"], ["Trajan font pairing", "exact"], ["TRAJAN", "exact"], ["Trajan Pro", "alias"],
    ["Trajan Pro 3", "alias"], ["trajan-pro-3", "alias"], ["TrajanPro", "alias"], ["what goes with Trajan Pro", "alias"]]) {
    const s = sc(q);
    ok(s.font === "Trajan" && s.page === TP && s.match === how && s.pairs.length === 5, `${q}: ${how} hit on the Trajan guide (got ${s.match} ${s.font} ${s.page})`);
  }
  const t = txt("Trajan", { limit: 20 }), tp = sc("Trajan", { limit: 20 }).pairs;
  ok(t.startsWith(`5 pairing(s) for Trajan. Source: ${TP}`), "Trajan: first line cites the guide");
  ok(/About: Trajan is a capitals-only serif display typeface designed by Carol Twombly for Adobe/.test(t) && /not free and not on Google Fonts/.test(t) && /Cinzel/.test(t), "Trajan: About line (commercial, Adobe, Cinzel look-alike)");
  ok(!/free on Google Fonts/.test(t), "Trajan: never 'free on Google Fonts'");
  ok(sc("Trajan").about === null, "Trajan: no Google Fonts about block");
  ok(tp.every((p) => p.heading === "Trajan"), "Trajan: always the heading (capitals-only display face)");
  for (const p of tp) {
    ok(GF_FAMILIES.has(p.body) && p.body !== "Trajan", `Trajan: partner ${p.body} is a Google Fonts family`);
    ok(p.css.startsWith('h1, h2, h3 { font-family: "trajan-pro-3", "Trajan Pro 3", serif; }'), `Trajan: CSS heading stack + serif fallback (${p.css})`);
    ok(p.note === "not on Google Fonts: Trajan (not free: license it through Adobe Fonts with a Creative Cloud subscription)", `Trajan: licence note (${p.note})`);
    ok(p.google_fonts_url && p.google_fonts_url.includes("family=" + p.body.replace(/ /g, "+")) && !/Trajan/i.test(p.google_fonts_url), `Trajan: Google Fonts link carries only ${p.body}`);
    ok(p.why.length >= 60 && p.why.length <= 200 && p.why.endsWith(".") && !/[—–]/.test(p.why), `Trajan: why "${p.why}"`);
  }
  ok(["EB Garamond", "Cormorant Garamond", "Libre Baskerville", "Source Sans 3", "Lato"].join() === tp.map((p) => p.body).join(), "Trajan: the 5 partners in table order");
  ok(sc("Trajan", { group: "sans" }).pairs.map((p) => p.body).join() === "Source Sans 3,Lato", "Trajan: group filter sans");
  for (const q of ["Trajan Sans", "Trajan Sans Pro"]) ok(/^0 results/.test(txt(q)), `${q}: a different design, still an honest zero`);
  ok(!similarGuides({ family: "Cinzel Decorative", c: "R", stroke: "Serif", script: "", pop: 500 }).some((v) => v.font === "Trajan"), "Trajan is never a 'similar' guide for a Google Font");

  // 2. Onest: the curated entry is superseded by the guide
  const OP = "https://madegooddesigns.com/onest-font-pairings/";
  for (const q of ["Onest", "onest", "Onest font pairings", "what goes with Onest", "ONEST"]) {
    const s = sc(q);
    ok(s.font === "Onest" && s.page === OP && s.match === "exact" && s.pairs.length === 5 && !s.curated, `${q}: exact hit on the Onest guide (got ${s.match} ${s.page} curated=${s.curated})`);
  }
  ok(sc("Onest").page !== baseFP({ font: "Onest" }).structuredContent.page && baseFP({ font: "Onest" }).structuredContent.curated === true, "Onest: was the curated page-null answer on BASE");
  ok(JSON.stringify(sc("Onest").about) === JSON.stringify({ category: "Sans Serif", designers: ["Dmitri Voloshin", "Andrey Kudryavtsev"], added: 2023 }), "Onest about");
  ok(txt("Onest").includes("About: Onest is a sans serif typeface by Dmitri Voloshin, Andrey Kudryavtsev, free on Google Fonts (added 2023)."), "Onest about line");
  const op = sc("Onest", { limit: 20 }).pairs;
  ok(op.filter((p) => p.heading === "Onest").length === 2, "Onest: heading in 2 rows, body in 3");
  for (const p of op) {
    for (const x of [p.heading, p.body]) ok(GF_FAMILIES.has(x), `Onest: ${x} is a Google Fonts family`);
    ok(/^https:\/\/fonts\.googleapis\.com\/css2\?family=/.test(p.google_fonts_url) && !p.note, `Onest: Google Fonts link, no licence note`);
    ok(p.css.includes('"Onest", sans-serif'), `Onest: sans-serif fallback (${p.css})`);
  }

  // 3. Big Shoulders Display: still the live Big Shoulders guide (no second guide this round)
  for (const q of ["Big Shoulders Display", "big shoulders display font pairing", "Big Shoulders Text"]) {
    const s = sc(q);
    ok(s.font === "Big Shoulders" && s.page === "https://madegooddesigns.com/big-shoulders-font-pairings/" && s.match === "alias", `${q}: alias to the Big Shoulders guide`);
  }

  // 4. everything else unchanged versus BASE (the zero answer's guide count is normalised: 104 -> 106)
  const N = (x) => x.replace(/\d+ fonts have pairing guides/g, "N fonts have pairing guides");
  const NEW = new Set(["trajan", "onest"]);
  const { CURATED } = await import(pathToFileURL(path.join(src, "font_pairings_curated.js")));
  const names = new Set([...Object.values(BASE_DATA).map((v) => v.font), ...Object.values(CURATED).map((v) => v.font),
    "Play", "Martian Mono", "Noto Kufi Arabic", "Crimson Pro", "Crimson Text", "Spectral", "Gotham", "Noto Sans Thai", "Zzyzx Display",
    "python asyncio", "", "Poppins font pairing", "Montserrat Bold", "Helvetica Neue", "Garamond Premier Pro", "Cinzel Decorative", "Marcellus SC"]);
  let same = 0, total = 0;
  for (const q of names) {
    if (NEW.has(q.toLowerCase())) continue;
    for (const extra of [{}, { group: "serif", limit: 3 }]) {
      total++;
      const a = N(JSON.stringify(r(q, extra))), b = N(JSON.stringify(baseFP({ font: q, ...extra })));
      ok(a === b, `"${q}" ${JSON.stringify(extra)}: unchanged versus ${BASE}`);
      if (a === b) same++;
    }
  }
  console.log(`${total} answers compared with ${BASE}, ${same} unchanged`);
} finally {
  fs.unlinkSync(tmp);
  fs.unlinkSync(baseFile);
}
if (fails.length) { console.log(fails.slice(0, 40).join("\n")); assert.fail(`${fails.length} of ${n} assertions failed`); }
console.log(`ok ${n} assertions`);
