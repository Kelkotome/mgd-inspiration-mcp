// mcp-gaps-r2 (11-Nov-2026), get_font_pairing: 37 more curated fonts (font_pairings_curated.js): the 7 real-user zeros of 10-11 Nov and
// 30 popular display/serif Google Fonts (list in tests/gaps_r2_fonts.json). Also checks that every other answer is unchanged versus the
// base commit 0ae403f (mcp gaps r1): every old curated font, every guide font and every mcp_calls query since 9-Nov.
// Run: node tests/fp_gaps_r2.test.mjs   (loads font_pairing.js with its JSON import inlined, like fp_gaps_r1.test.mjs)
import fs from "node:fs"; import path from "node:path"; import assert from "node:assert"; import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
const BASE = "0ae403f";
const src = path.resolve("src"), tmp = path.join(src, "_fp_gaps_r2_test.mjs");
const baseDir = fs.mkdtempSync(path.join(path.resolve("tests"), "_fp_gaps_r2_base_"));
const inline = (js, json) => js.replace('import PAIRINGS from "./font_pairings.json";', "const PAIRINGS = " + json + ";");
const DATA = JSON.parse(fs.readFileSync(path.join(src, "font_pairings.json"), "utf8"));
fs.writeFileSync(tmp, inline(fs.readFileSync(path.join(src, "font_pairing.js"), "utf8"), JSON.stringify(DATA)));
const git = (f) => execFileSync("git", ["show", `${BASE}:src/${f}`], { encoding: "utf8", maxBuffer: 1 << 28 });
const baseJson = git("font_pairings.json");
fs.writeFileSync(path.join(baseDir, "fp.mjs"), inline(git("font_pairing.js"), baseJson));
for (const f of ["font_pairings_curated.js", "search_extras.js"]) fs.writeFileSync(path.join(baseDir, f), git(f));
const LIST = JSON.parse(fs.readFileSync(path.resolve("tests", "gaps_r2_fonts.json"), "utf8"));
const NEW37 = [...LIST.zeros7, ...LIST.popular30];
let n = 0;
const fails = [];
const ok = (c, m) => { if (!c) fails.push(m); n++; };
try {
  const { fontPairing } = await import(pathToFileURL(tmp));
  const { fontPairing: baseFP } = await import(pathToFileURL(path.join(baseDir, "fp.mjs")));
  const { CURATED: BASE_CURATED } = await import(pathToFileURL(path.join(baseDir, "font_pairings_curated.js")));
  const { CURATED, GF_FAMILIES } = await import(pathToFileURL(path.join(src, "font_pairings_curated.js")));
  const GF = new Set(GF_FAMILIES);
  const sc = (f) => fontPairing({ font: f }).structuredContent;
  const head = (f) => fontPairing({ font: f }).content[0].text.split("\n")[0];

  // 1. the list: 7 + 30 = 37 distinct fonts, all new in CURATED (none a guide or an r1 font), 67 curated in total
  ok(LIST.zeros7.length === 7 && LIST.popular30.length === 30 && new Set(NEW37).size === 37, "7 + 30 distinct fonts");
  ok(Object.keys(CURATED).length === 67, `67 curated fonts (got ${Object.keys(CURATED).length})`);
  for (const f of NEW37) {
    const v = CURATED[f.toLowerCase()];
    ok(v && v.font === f && !BASE_CURATED[f.toLowerCase()] && !DATA[f.toLowerCase()], `${f}: new curated entry, not a guide or r1 font`);
    ok(/^0 results/.test(baseFP({ font: f }).content[0].text), `${f}: was "0 results" on ${BASE}`);
  }

  // 2. every spelling of the 37 answers with exactly that font, 5 curated pairs
  for (const f of NEW37) {
    const v = CURATED[f.toLowerCase()];
    if (!v) continue;
    ok(GF.has(f) && v.page === null && v.curated === true && v.pairs.length === 5, `${f}: Google Fonts family, page null, curated, 5 pairs`);
    const heads = v.pairs.filter((p) => p.heading === f).length;
    ok(heads === 5 || heads <= 2, `${f}: heading in ${heads} rows`);
    if (["Display", "Handwriting"].includes(v.about.category)) ok(heads === 5, `${f}: ${v.about.category} face is always the heading`);
    ok(v.about.designers.length > 0 && (v.about.added === null || (v.about.added >= 2010 && v.about.added <= 2026)), `${f}: about`);
    const partners = v.pairs.map((p) => (p.heading === f ? p.body : p.heading));
    ok(new Set(partners).size === 5, `${f}: 5 different partners`);
    for (const p of v.pairs) {
      const partner = p.heading === f ? p.body : p.heading;
      ok((p.heading === f) !== (p.body === f), `${f}: row ${p.heading} + ${p.body} names the font once`);
      ok(GF.has(partner) && partner !== f, `${f}: partner ${partner} is a Google Fonts family`);
      ok(p.why.length >= 60 && p.why.length <= 200 && p.why.endsWith(".") &&
        !/[—–]|delve|elevate|seamless|game-changer|unleash|tapestry|digital landscape/i.test(p.why), `${f}: why "${p.why}"`);
    }
    for (const q of [f, f.toLowerCase(), f.toUpperCase(), f + " font pairing", f.replace(/ /g, "-")]) {
      const r = fontPairing({ font: q }), s = r.structuredContent, t = r.content[0].text;
      ok(s.font === f && s.pairs.length === 5 && ["exact", "alias"].includes(s.match), `"${q}" -> ${s.font} (${s.match}, ${s.pairs.length} pairs)`);
      ok(s.page === null && s.curated === true && /font-pairing-generator/.test(s.try_url), `"${q}": curated, try_url`);
      ok(/Made Good Designs has no dedicated .* guide yet/.test(t) && t.includes("https://madegooddesigns.com/font-pairing-generator/") &&
        !/Source: null/.test(t) && /About: /.test(t), `"${q}": text says there is no guide and links the generator`);
      ok(s.pairs.every((p) => p.heading === f || p.body === f), `"${q}": every pair names ${f}`);
      ok(s.pairs.every((p) => GF.has(p.heading) && GF.has(p.body)), `"${q}": partners are Google Fonts families`);
      ok(s.pairs.every((p) => /^https:\/\/fonts\.googleapis\.com\/css2\?family=/.test(p.google_fonts_url)), `"${q}": google_fonts_url`);
    }
  }
  ok(sc("Libre Caslon Text").about.added === null, "Libre Caslon Text: no year (METADATA.pb 2020 vs fonts.google.com 2013)");

  // 3. the 7 real-user zeros of 10-11 Nov, by the spelling logged in mcp_calls
  for (const q of ["Forum", "Prata", "Bellefair", "Tenor Sans", "Gilda Display", "Libre Caslon Text", "Italiana"]) {
    ok(sc(q).font === q && sc(q).pairs.length === 5 && !/^0 results/.test(head(q)), `logged zero "${q}" now has 5 pairs`);
  }

  // 4. short spellings
  for (const [q, want] of [["Gilda", "Gilda Display"], ["Tenor", "Tenor Sans"], ["Libre Caslon", "Libre Caslon Text"], ["STIX Two", "STIX Two Text"],
    ["STIX", "STIX Two Text"], ["DM Serif Text", "DM Serif Text"], ["Frank Ruhl", "Frank Ruhl Libre"], ["Sorts Mill", "Sorts Mill Goudy"],
    ["Baskerville", "Baskerville"], ["Caslon", "Caslon"]]) ok(sc(q).font === want, `"${q}" -> ${want} (got ${sc(q).font})`);

  // 5. guards: unknown and guard probes still zero; partner-only answers kept
  ok(/^0 results/.test(head("Play")) && sc("Play").pairs.length === 0, '"Play" is still "0 results"');
  ok(/^0 results/.test(head("Zzyzx Display")), '"Zzyzx Display" is still "0 results"');
  for (const q of ["Spectral", "Crimson Pro"]) ok(sc(q).match === "partner" && sc(q).font === q && sc(q).pairs.length >= 1, `${q}: still a partner-only answer`);
  for (const [q, want] of [["League Spartan", "League Spartan"], ["Marcellus", "Marcellus"], ["Great Vibes", "Great Vibes"],
    ["Playfair Display", "Playfair Display"], ["Lora", "Lora"], ["Cormorant Garamond", "Cormorant"], ["Bodoni Moda", "Bodoni"],
    ["DM Serif Display", "DM Serif Display"], ["Josefin Sans", "Josefin Sans"]]) ok(sc(q).font === want, `"${q}" -> ${want} (got ${sc(q).font})`);

  // 6. unchanged versus the base: every old curated font, every guide font and every mcp_calls query since 9-Nov; only the 37 may differ
  const QUERIES = ("Fraunces|Bricolage Grotesque|Anton|Nunito Sans|Big Shoulders Display|anton|JetBrains Mono|Instrument Serif|Bebas Neue|Prata|" +
    "Plus Jakarta Sans|Playfair Display|Outfit|Oswald|Newsreader|Marcellus|Libre Baskerville|Jetbrains mono|Italiana|INSTRUMENT SERIF|Geist|" +
    "Figtree|EB Garamond|Cormorant Garamond|Cinzel|Archivo|instrument serif|figtree|Varela Round|Urbanist|Unbounded|Ubuntu|Titillium Web|" +
    "Tenor Sans|Space Grotesk|Source Serif 4|Source Code Pro|Sora|Shadows Into Light|Schibsted Grotesk|Saira|Rubik|Roboto Slab|Roboto Mono|" +
    "Roboto Flex|Roboto Condensed|Red Hat Display|Questrial|Public Sans|Poppins|Play|Pacifico|PT Serif|Oxygen|Overpass|Onest|Mulish|" +
    "Merriweather Sans|Maven Pro|Lora|Lobster|Lilita One|Libre Franklin|Libre Caslon Text|Lexend|League Spartan|Karla|Josefin Sans|Inter Tight|" +
    "Instrument Sans|Inconsolata|IBM Plex Sans|IBM Plex Mono|Hanken Grotesk|Great Vibes|Google Sans Flex|Google Sans|Gilda Display|Geologica|" +
    "Fredoka|Forum|Fjalla One|Fira Sans|Faustina|Exo 2|Epilogue|Dosis|Domine|Dancing Script|DM Serif Display|DM Sans|DM Mono|Comfortaa|Caveat|" +
    "Cabin|Bodoni Moda|Bitter|Big Shoulders|Bellefair|Be Vietnam Pro|Barlow Condensed|Barlow|Asap|Arvo|Arimo|Archivo Narrow|Archivo Black|" +
    "Alfa Slab One|Albert Sans|Abel").split("|");
  for (const q of QUERIES) ok(q === "Play" ? sc(q).pairs.length === 0 : sc(q).pairs.length >= 1, `mcp_calls "${q}" ${q === "Play" ? "has no pairs" : "has pairs"}`);
  const NEWK = new Set(NEW37.map((f) => f.toLowerCase()));
  const names = new Set([...Object.values(BASE_CURATED).map((v) => v.font), ...Object.values(DATA).map((v) => v.font), ...QUERIES,
    "Spectral", "Crimson Pro", "Play", "Zzyzx Display"]);
  let same = 0;
  for (const q of names) {
    const a = JSON.stringify(fontPairing({ font: q })), b = JSON.stringify(baseFP({ font: q }));
    if (NEWK.has(q.toLowerCase())) { ok(a !== b, `"${q}" (new) differs from base`); continue; }
    ok(a === b, `"${q}" unchanged versus ${BASE}`);
    if (a === b) same++;
  }
  console.log(`${names.size} names compared with ${BASE}, ${same} unchanged`);
} finally {
  fs.unlinkSync(tmp);
  fs.rmSync(baseDir, { recursive: true, force: true });
}
if (fails.length) { console.log(fails.slice(0, 40).join("\n")); assert.fail(`${fails.length} of ${n} assertions failed`); }
console.log(`ok ${n} assertions`);
