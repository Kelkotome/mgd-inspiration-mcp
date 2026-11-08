// get_font_pairing round 2 (9-Nov-2026): every guide font resolves from case / spacing / punctuation variants and aliases, sibling
// families no longer collapse into each other (Nunito Sans ≠ Nunito), the data is well-formed, and parallel calls are independent.
// Run: node tests/fp_r2.test.mjs   (loads font_pairing.js with its JSON import inlined, like fp_partner.test.mjs)
import fs from "node:fs"; import path from "node:path"; import assert from "node:assert"; import { pathToFileURL } from "node:url";
const src = path.resolve("src"), tmp = path.join(src, "_fp_r2_test.mjs");
const DATA = JSON.parse(fs.readFileSync(path.join(src, "font_pairings.json"), "utf8"));
fs.writeFileSync(tmp, fs.readFileSync(path.join(src, "font_pairing.js"), "utf8").replace('import PAIRINGS from "./font_pairings.json";',
  "const PAIRINGS = " + JSON.stringify(DATA) + ";"));
let n = 0;
const fails = [];
const ok = (c, m) => { if (!c) fails.push(m); n++; };
try {
  const { fontPairing, fpFind } = await import(pathToFileURL(tmp));
  const sc = (f) => fontPairing({ font: f }).structuredContent;
  const head = (f) => fontPairing({ font: f }).content[0].text.split("\n")[0];

  // 1. data shape
  for (const [k, v] of Object.entries(DATA)) {
    ok(k === v.font.toLowerCase(), `key ${k} = lower(font)`);
    ok(/^https:\/\/madegooddesigns\.com\/[a-z0-9-]+-font-pairings?\/$/.test(v.page), `page url ${v.page}`);
    ok(v.pairs.length >= 4, `${v.font} has ${v.pairs.length} pairs`);
    for (const p of v.pairs) {
      ok(p.heading === v.font || p.body === v.font, `${v.font}: pair ${p.heading} + ${p.body} names the font`);
      // single-family pairs ("PT Sans + PT Sans", two weights) are published advice on the live PT Sans / Work Sans pages
      // older singular pages carry a few em dashes in their "why"; the plural *-font-pairings pages (round 1 + 2) must not
      ok(typeof p.why === "string" && p.why.length >= 20 && (!v.page.endsWith("-font-pairings/") || !/[\u2014\u2013]/.test(p.why)), `${v.font}: why`);
    }
    if (v.about) {
      ok(["Sans Serif", "Serif", "Display", "Handwriting", "Monospace"].includes(v.about.category), `${v.font}: category ${v.about.category}`);
      ok(Array.isArray(v.about.designers) && v.about.designers.length > 0, `${v.font}: designers`);
      ok(v.about.added === null || (v.about.added >= 2010 && v.about.added <= 2026), `${v.font}: year ${v.about.added}`);
    }
  }

  // 2. every guide font resolves exactly from many spellings
  const variants = (f) => [f, f.toLowerCase(), f.toUpperCase(), f.replace(/ /g, ""), f.replace(/ /g, "-"), `  ${f.replace(/ /g, "  ")}  `,
    f.toLowerCase().replace(/(^| )(\w)/g, (m, a, b) => a + b.toUpperCase()), `${f} font pairing`, `what goes with ${f}`, `${f} fonts`];
  for (const v of Object.values(DATA)) for (const q of variants(v.font)) {
    const r = sc(q);
    ok(r.font === v.font && r.pairs.length > 0, `"${q}" -> ${r.font} (want ${v.font})`);
  }

  // 3. the 8-Nov gap list, spelled the way callers sent it
  const gap = { "Anton": "Anton", "Big Shoulders Display": "Big Shoulders", "Bricolage Grotesque": "Bricolage Grotesque", "JetBrains Mono": "JetBrains Mono",
    "Jetbrains mono": "JetBrains Mono", "jetbrains": "JetBrains Mono", "Archivo": "Archivo", "Fraunces": "Fraunces", "Oswald": "Oswald",
    "Nunito Sans": "Nunito Sans", "Bebas Neue": "Bebas Neue", "Instrument Serif": "Instrument Serif", "instrument serif": "Instrument Serif" };
  for (const [q, want] of Object.entries(gap)) {
    const r = sc(q); ok(r.font === want && r.pairs.length >= 4, `gap "${q}" -> ${r.font} (want ${want})`);
    ok(!/^0 /.test(head(q)), `gap "${q}" is not a zero result`);
  }

  // 4. aliases and style suffixes land on the right guide; sibling families never collapse into each other
  const alias = { "Big Shoulders Text": "Big Shoulders", "Cormorant Garamond": "Cormorant", "Source Sans Pro": "Source Sans", "Source Sans 3": "Source Sans",
    "Source Serif Pro": "Source Serif 4", "Plex Sans": "IBM Plex Sans", "IBM Plex": "IBM Plex Sans", "Plus Jakarta": "Plus Jakarta Sans",
    "Montserrat Bold": "Montserrat", "Garamond Premier Pro": "Garamond", "Inter Display": "Inter", "Geist Sans": "Geist", "Playfair": "Playfair Display",
    "Roboto Slab": "Roboto Slab", "Roboto Mono": "Roboto Mono", "Roboto Condensed": "Roboto Condensed", "Merriweather Sans": "Merriweather Sans",
    "Inter Tight": "Inter Tight", "Archivo Black": "Archivo Black", "Barlow Condensed": "Barlow Condensed", "EB Garamond": "EB Garamond" };
  for (const [q, want] of Object.entries(alias)) { const r = sc(q); ok(r.font === want, `alias "${q}" -> ${r.font} (want ${want})`); }
  for (const q of ["Roboto Serif", "Josefin Slab", "PT Sans Narrow", "Open Sans Condensed", "Fira Code", "Noto Sans", "Barlow Semi Condensed"]) {
    const r = sc(q), base = q.split(" ")[0];
    ok(r.font !== base && !(r.font || "").startsWith(base + " ") || r.match === "partner" || r.font === null, `sibling "${q}" must not become ${r.font}`);
  }
  ok(fpFind("Lato").how === "exact" && fpFind("Latto").how === "fuzzy", "fuzzy still works");
  ok(/^0 results/.test(head("Zzyzx Display")), "unknown font is a zero result");
  ok(/fonts have pairing guides/.test(head("Zzyzx Display")), "zero result lists the guide count");

  // 5. answer quality: about line, CSS generic families, group filter
  const an = fontPairing({ font: "Anton" }).content[0].text;
  if (DATA.anton && DATA.anton.about) ok(/About: Anton is a [a-z ]+ typeface by Vernon Adams/.test(an), "Anton about line");
  for (const v of Object.values(DATA)) for (const p of fontPairing({ font: v.font, limit: 20 }).structuredContent.pairs)
    ok(/^h1, h2, h3 \{ font-family: "[^"]+", (serif|sans-serif|monospace|cursive); \}\nbody \{ font-family: "[^"]+", (serif|sans-serif|monospace|cursive); \}$/.test(p.css), `${v.font}: css ${p.css}`);
  if (DATA["eb garamond"]) ok(fontPairing({ font: "EB Garamond", limit: 20 }).structuredContent.pairs.some((p) => / serif; \}/.test(p.css) && p.css.includes('"EB Garamond", serif')), "EB Garamond falls back to serif");
  if (DATA["jetbrains mono"]) ok(fontPairing({ font: "JetBrains Mono", limit: 20 }).structuredContent.pairs.every((p) => p.css.includes('"JetBrains Mono", monospace')), "JetBrains Mono falls back to monospace");
  ok(sc("Oswald").pairs.length === 6 && fontPairing({ font: "Oswald", limit: 1 }).structuredContent.pairs.length === 1, "limit");

  // 6. parallel calls (the 8-Nov 21:29 fan-out: Bricolage Grotesque + Instrument Serif + Space Grotesk within 12 ms) are independent:
  // the tool is a pure lookup over a bundled JSON, no D1, no cache, no shared state between calls.
  const qs = ["Bricolage Grotesque", "Instrument Serif", "Space Grotesk", "Archivo", "JetBrains Mono", "Anton", "Big Shoulders Display"];
  const serial = qs.map((q) => JSON.stringify(fontPairing({ font: q })));
  for (let i = 0; i < 20; i++) {
    const par = await Promise.all(qs.map(async (q) => JSON.stringify(fontPairing({ font: q }))));
    ok(par.every((x, j) => x === serial[j]), "parallel = serial");
  }
  if (fails.length) { console.log(fails.slice(0, 40).join("\n")); assert.fail(`${fails.length} of ${n} assertions failed`); }
  console.log(`ok ${n} assertions, ${Object.keys(DATA).length} fonts, ${Object.values(DATA).reduce((s, v) => s + v.pairs.length, 0)} pairs`);
} finally { fs.unlinkSync(tmp); }
