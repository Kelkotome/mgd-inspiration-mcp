// mcp-gaps-r1 (10-Nov-2026), get_font_pairing: the 10 fonts that returned 0 pairs between 5 and 9 Nov, every font ever asked for in
// mcp_calls, the 30 curated Google Fonts (font_pairings_curated.js) and the "a Google Fonts family is never swapped for another" guard.
// Run: node tests/fp_gaps_r1.test.mjs   (loads font_pairing.js with its JSON import inlined, like fp_r2.test.mjs)
import fs from "node:fs"; import path from "node:path"; import assert from "node:assert"; import { pathToFileURL } from "node:url";
const src = path.resolve("src"), tmp = path.join(src, "_fp_gaps_r1_test.mjs");
const DATA = JSON.parse(fs.readFileSync(path.join(src, "font_pairings.json"), "utf8"));
fs.writeFileSync(tmp, fs.readFileSync(path.join(src, "font_pairing.js"), "utf8").replace('import PAIRINGS from "./font_pairings.json";',
  "const PAIRINGS = " + JSON.stringify(DATA) + ";"));
let n = 0;
const fails = [];
const ok = (c, m) => { if (!c) fails.push(m); n++; };
try {
  const { fontPairing } = await import(pathToFileURL(tmp));
  const { CURATED, GF_FAMILIES } = await import(pathToFileURL(path.join(src, "font_pairings_curated.js")));
  const GF = new Set(GF_FAMILIES);
  const sc = (f) => fontPairing({ font: f }).structuredContent;
  const head = (f) => fontPairing({ font: f }).content[0].text.split("\n")[0];

  // 1. the 10 zeros of 5 to 9 Nov (mcp_events zero=1, bot=0): all have a guide since fonts r2; each spelling seen in the log
  const ZERO10 = ["Big Shoulders Display", "Anton", "Bricolage Grotesque", "Figtree", "Lexend", "Instrument Serif", "Newsreader", "Unbounded",
    "Bebas Neue", "Nunito Sans"];
  for (const f of ZERO10) for (const q of [f, f.toLowerCase(), f.toUpperCase(), f + " font pairing", f.replace(/ /g, "-")]) {
    const r = sc(q);
    ok(r.pairs.length >= 1 && r.page && r.font, `zero-10 "${q}" -> ${r.font} ${r.pairs.length} pairs`);
    ok(!/^0 results/.test(head(q)), `zero-10 "${q}" is not "0 results"`);
  }
  ok(sc("Nunito Sans").font === "Nunito Sans" && sc("Big Shoulders Display").font === "Big Shoulders", "Nunito Sans is not Nunito; Big Shoulders Display = Big Shoulders");

  // 2. every distinct get_font_pairing query in mcp_calls, Aug to 10-Nov-2026 (read-only SELECT, 74 distinct; "" and the
  //    "Zzyzx Display" probe left out): all must answer with pairs
  const HISTORY = ["Instrument Serif", "Fraunces", "Figtree", "Nunito Sans", "Anton", "Oswald", "JetBrains Mono", "Bricolage Grotesque", "Bebas Neue",
    "Unbounded", "Newsreader", "Lexend", "DM Sans", "Cormorant Garamond", "Space Grotesk", "Playfair Display", "Manrope", "Lora", "Inter",
    "Big Shoulders Display", "Archivo", "Poppins", "Plus Jakarta Sans", "Outfit", "Lato", "IBM Plex Mono", "Helvetica font pairing", "Geist",
    "Work Sans", "Urbanist", "Ubuntu", "Titillium Web", "Source Serif 4", "Source Code Pro", "Sora", "Schibsted Grotesk", "Saira", "Rubik",
    "Roboto Slab", "Roboto Mono", "Roboto Condensed", "Public Sans", "PT Serif", "Mulish", "Montserrat", "Merriweather Sans", "Merriweather",
    "Libre Franklin", "Libre Baskerville", "Karla", "Jost", "Inter Tight", "Instrument Sans", "instrument  serif", "Inconsolata", "IBM Plex Sans",
    "Google Sans", "Fredoka", "Fjalla One", "Fira Sans", "EB Garamond", "Dancing Script", "Cinzel", "Caveat", "Cabin", "Bitter", "Big Shoulders",
    "Barlow Condensed", "Barlow", "Arimo", "Archivo Black", "Alfa Slab One"];
  for (const q of HISTORY) ok(sc(q).pairs.length >= 1, `history "${q}" has pairs`);

  // 3. the 30 curated fonts
  const C = Object.values(CURATED);
  ok(C.length === 67, `67 curated fonts: 30 r1 + 37 mcp-gaps-r2 (got ${C.length})`);
  for (const v of C) {
    ok(!DATA[v.font.toLowerCase()], `${v.font}: not also a guide font`);
    ok(GF.has(v.font) && v.page === null && v.curated === true, `${v.font}: Google Fonts family, page null, curated`);
    ok(v.pairs.length === 5, `${v.font}: 5 pairs`);
    const heads = v.pairs.filter((p) => p.heading === v.font).length;
    ok(heads === 5 || heads <= 2, `${v.font}: heading in ${heads} rows`);
    if (["Display", "Handwriting"].includes(v.about.category)) ok(heads === 5, `${v.font}: ${v.about.category} face is always the heading`);
    for (const p of v.pairs) {
      const partner = p.heading === v.font ? p.body : p.heading;
      ok(GF.has(partner) && partner !== v.font, `${v.font}: partner ${partner} is a Google Fonts family`);
      ok(p.why.length >= 60 && p.why.length <= 200 && p.why.endsWith(".") && !/[—–]|delve|elevate|seamless|unleash|tapestry/i.test(p.why), `${v.font}: why "${p.why}"`);
      ok(["Sans-Serif Pairings", "Serif Pairings", "Display Pairings", "Monospace Pairings", "Script Pairings"].includes(p.group), `${v.font}: group ${p.group}`);
    }
    ok(v.about.designers.length > 0 && (v.about.added === null || (v.about.added >= 2010 && v.about.added <= 2026)), `${v.font}: about`);
    for (const q of [v.font, v.font.toLowerCase(), v.font + " font pairings", "what goes with " + v.font]) {
      const r = fontPairing({ font: q }), s = r.structuredContent, t = r.content[0].text;
      ok(s.font === v.font && s.pairs.length === 5 && s.page === null && s.curated === true && /font-pairing-generator/.test(s.try_url), `curated "${q}" -> ${s.font}`);
      ok(/no dedicated .* guide yet/.test(t) && !/Source: null/.test(t) && /About: /.test(t), `curated "${q}" text says there is no guide`);
      ok(s.pairs.every((p) => /^https:\/\/fonts\.googleapis\.com\/css2\?family=/.test(p.google_fonts_url)), `curated "${q}" Google Fonts links`);
    }
  }
  ok(sc("Dosis").about.added === null && sc("Faustina").about.added === null, "no year where METADATA.pb and fonts.google.com disagree");
  ok(fontPairing({ font: "DM Mono", limit: 20 }).structuredContent.pairs.every((p) => p.css.includes('"DM Mono", monospace')), "DM Mono falls back to monospace");
  ok(fontPairing({ font: "Great Vibes", limit: 20 }).structuredContent.pairs.every((p) => p.css.includes('"Great Vibes", cursive')), "Great Vibes falls back to cursive");

  // 4. guard: a real Google Fonts family without an entry is not stretched to another family
  for (const [q, bad] of [["Play", "Playfair Display"], ["Inder", "Inter"], ["Exo", "Exo 2"], ["Asap Condensed", "Asap"], ["Lobster Two", null]]) {
    const r = sc(q);
    ok(bad === null ? true : r.font !== bad, `"${q}" must not become ${bad} (got ${r.font})`);
  }
  ok(sc("Google Sans Flex").font === "Google Sans" && sc("Playfair").font === "Playfair Display", "aliases: Google Sans Flex, Playfair");
  ok(sc("Latto").font === "Lato" && sc("Montserat").font === "Montserrat" && sc("Monts").font === "Montserrat", "typos and partial names still work");
  ok(/^0 results/.test(head("Zzyzx Display")), "unknown font is still a zero result");
} finally {
  fs.unlinkSync(tmp);
}
if (fails.length) { console.log(fails.slice(0, 40).join("\n")); assert.fail(`${fails.length} of ${n} assertions failed`); }
console.log(`ok ${n} assertions`);
