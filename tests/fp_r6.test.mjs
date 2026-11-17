// get_font_pairing, fonts r6 (18-Nov-2026): the serif guide fonts that are not on Google Fonts (Garamond, Baskerville, Caslon, Bodoni,
// Georgia) get the Trajan treatment from fonts r5 (NON_GF in src/font_pairing.js):
//  - an accurate licence / availability note per font instead of "licence or self-host it" (Georgia = system font on Windows and macOS;
//    Garamond / Baskerville / Caslon / Bodoni name their free Google Fonts revival, which must exist in gf_meta.js = fonts.google.com metadata)
//  - a serif family stack (licensed or preinstalled family, the free revival, Georgia, serif) instead of a sans-serif fallback, both on the
//    font's own guide and when it is the partner on another guide (Futura + Bodoni [Display Pairings] used to fall back to sans-serif)
//  - an About line (they had none: about = null)
//  - a row with two non-Google fonts gets one note per font (Garamond + Futura); two fonts without an entry keep the old shared note
//  - the same checks run against BASE and must FAIL there (the old note / fallback), so this suite proves the fix
//  - every other answer is byte-identical to BASE; a changed answer differs only in the css / note / About text of the five fonts
// Run: node tests/fp_r6.test.mjs   (inlines the JSON import like fp_r5; BASE = the design-r1 tip = live Worker cbcb5729, fonts r5)
import fs from "node:fs"; import path from "node:path"; import assert from "node:assert"; import { pathToFileURL } from "node:url";
import { execFileSync } from "node:child_process";
const BASE = process.env.FP6_BASE || "3c739d8";
const src = path.resolve("src"), tmp = path.join(src, "_fp_r6_test.mjs"), baseFile = path.join(src, "_fp_r6_base.mjs");
const inline = (code, json) => code.replace('import PAIRINGS from "./font_pairings.json";', "const PAIRINGS = " + json + ";");
const git = (f) => execFileSync("git", ["show", `${BASE}:src/${f}`], { encoding: "utf8", maxBuffer: 64 << 20 });
for (const f of ["font_pairings.json", "font_pairings_curated.js", "search_extras.js", "gf_meta.js"]) assert.equal(git(f), fs.readFileSync(path.join(src, f), "utf8"), `${f} changed since ${BASE}`);
fs.writeFileSync(tmp, inline(fs.readFileSync(path.join(src, "font_pairing.js"), "utf8"), git("font_pairings.json")));
fs.writeFileSync(baseFile, inline(git("font_pairing.js"), git("font_pairings.json")));
const DATA = JSON.parse(git("font_pairings.json"));
let n = 0;
const fails = [];
const ok = (c, m) => { if (!c) fails.push(m); n++; };

// expected per font: CSS stack, the note, the Google Fonts revival(s) it names, About must mention
const R6 = {
  Garamond: { stack: '"Garamond", "EB Garamond", "Georgia"', gf: ["EB Garamond", "Cormorant Garamond"], about: /Claude Garamond/,
    note: "a family with many cuts, commercial ones such as Adobe Garamond Pro and Garamond Premier Pro; the free Google Fonts revival is EB Garamond" },
  Baskerville: { stack: '"Baskerville", "Libre Baskerville", "Georgia"', gf: ["Libre Baskerville"], about: /John Baskerville/,
    note: "preinstalled on macOS, not on Windows; the free Google Fonts version is Libre Baskerville" },
  Caslon: { stack: '"Adobe Caslon Pro", "Libre Caslon Text", "Georgia"', gf: ["Libre Caslon Text", "Libre Caslon Display"], about: /William Caslon/,
    note: "commercial cuts such as Adobe Caslon Pro; the free Google Fonts revival is Libre Caslon Text (Libre Caslon Display for headlines)" },
  Bodoni: { stack: '"Bodoni 72", "Bodoni Moda", "Georgia"', gf: ["Bodoni Moda", "Libre Bodoni"], about: /Giambattista Bodoni/,
    note: "a family with many commercial cuts; Bodoni 72 is preinstalled on macOS; the free Google Fonts revival is Bodoni Moda (also Libre Bodoni)" },
  Georgia: { stack: '"Georgia"', gf: [], about: /Matthew Carter/,
    note: "a system font preinstalled on Windows and macOS: name it in CSS, there is no web font to load" },
};
// partner-only system fonts on those guides: availability note, own generic, no About line
const SYSN = "a system font preinstalled on Windows and macOS: name it in CSS, there is no web font to load";
const SYSF = {
  Arial: { stack: '"Arial"', css: "sans-serif", note: SYSN }, Verdana: { stack: '"Verdana"', css: "sans-serif", note: SYSN },
  Tahoma: { stack: '"Tahoma"', css: "sans-serif", note: SYSN }, "Trebuchet MS": { stack: '"Trebuchet MS"', css: "sans-serif", note: SYSN },
  Courier: { stack: '"Courier New", "Courier"', css: "monospace", note: "Courier New is a system font preinstalled on Windows and macOS: name it in CSS, there is no web font to load" },
  Consolas: { stack: '"Consolas"', css: "monospace", note: "a Windows system font, not on macOS" },
  Didot: { stack: '"Didot"', css: "serif", note: "preinstalled on macOS, not on Windows" },
  "Big Caslon": { stack: '"Big Caslon"', css: "serif", note: "preinstalled on macOS, not on Windows" },
};
for (const v of Object.values(R6)) v.css = "serif";
const KNOWN = { ...R6, ...SYSF };   // every other non-Google font keeps "licence or self-host it" (Futura, Helvetica, DIN, Akkurat...)
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// The fonts r6 contract for one font, as a list of failures (empty = pass). Run on the new code (must pass) and on BASE (must fail).
function contract(fontPairing, font) {
  const out = [], e = R6[font];
  const res = fontPairing({ font, limit: 20 }), s = res.structuredContent, t = res.content[0].text;
  if (s.font !== font || s.match !== "exact" || !s.page) out.push(`${font}: exact guide hit`);
  if (!new RegExp(`^About: ${font} is .*not on Google Fonts`, "m").test(t) || !e.about.test(t)) out.push(`${font}: About line`);
  if (/free on Google Fonts/.test(t)) out.push(`${font}: never "free on Google Fonts"`);
  for (const p of s.pairs) {
    for (const [side, sel] of [[p.heading, "h1, h2, h3"], [p.body, "body"]]) {
      const k = KNOWN[side];
      if (!k) continue;
      if (!p.css.includes(`${sel} { font-family: ${k.stack}, ${k.css}; }`)) out.push(`${font}: ${side} ${sel} stack + ${k.css} (${p.css.replace("\n", " | ")})`);
    }
    if (!p.note) out.push(`${font}: ${p.heading} + ${p.body} has no note`);
    for (const x of [p.heading, p.body]) {
      if (KNOWN[x] && !(p.note || "").includes(`${x} (${KNOWN[x].note})`)) out.push(`${font}: note for ${x} (${p.note})`);
      if (KNOWN[x] && (p.note || "").includes(`${x} (licence or self-host it)`)) out.push(`${font}: ${x} still "licence or self-host it"`);
    }
  }
  return out;
}

try {
  const { fontPairing } = await import(pathToFileURL(tmp));
  const { fontPairing: baseFP } = await import(pathToFileURL(baseFile));
  const { GF_META } = await import(pathToFileURL(path.join(src, "gf_meta.js")));
  const GF = new Set(GF_META.split("\n").map((l) => l.split("|")[0]));
  const GF_CAT = new Map(GF_META.split("\n").map((l) => l.split("|")).map((x) => [x[0], x[1]]));

  // 0. facts the notes rely on: the five are not Google Fonts families; every revival named is one, and a serif
  for (const [font, e] of Object.entries(R6)) {
    ok(!GF.has(font), `${font} is not a Google Fonts family (gf_meta)`);
    for (const g of e.gf) {
      ok(GF.has(g) && GF_CAT.get(g) === "R", `${font}: revival ${g} is a Google Fonts serif (gf_meta)`);
      ok(e.note.includes(g) || g === "Cormorant Garamond", `${font}: note names ${g}`);
    }
    if (e.gf.length) ok(e.stack.includes(`"${e.gf[0]}"`), `${font}: stack carries the revival ${e.gf[0]}`);
    ok(DATA[font.toLowerCase()] && DATA[font.toLowerCase()].about == null, `${font}: a guide font with no Google Fonts about block`);
  }

  // 1. the contract passes now and fails on BASE (old note "licence or self-host it" + sans-serif fallback, no About line)
  for (const font of Object.keys(R6)) {
    const now = contract(fontPairing, font), old = contract(baseFP, font);
    ok(now.length === 0, `${font}: fonts r6 contract: ${now.slice(0, 3).join(" / ")}`);
    ok(old.length > 0, `${font}: the contract must fail on ${BASE}`);
    const b = baseFP({ font, limit: 20 }).structuredContent.pairs;
    ok(b.some((p) => /licence or self-host it/.test(p.note || "")), `${font}: BASE note said "licence or self-host it"`);
    ok(fontPairing({ font, limit: 20 }).structuredContent.pairs.every((p) => (p.note || "").split(/, (?=[A-Z][^()]*\()/).every((seg) => !/licence or self-host it/.test(seg) || !KNOWN[seg.replace(/ \(.*$/, "")])),
      `${font}: "licence or self-host it" only for commercial fonts without an entry`);
    ok(fontPairing({ font }).structuredContent.about === null, `${font}: structured about stays null (no Google Fonts metadata)`);
  }
  // the old own-font fallback was sans-serif on every guide row (e.g. Garamond + Montserrat)
  const gm = (fp) => fp({ font: "Garamond", limit: 20 }).structuredContent.pairs.find((p) => p.body === "Montserrat");
  ok(gm(baseFP).css.startsWith('h1, h2, h3 { font-family: "Garamond", sans-serif; }'), "BASE: Garamond fell back to sans-serif");
  ok(gm(fontPairing).css === 'h1, h2, h3 { font-family: "Garamond", "EB Garamond", "Georgia", serif; }\nbody { font-family: "Montserrat", sans-serif; }', `Garamond + Montserrat css (${gm(fontPairing).css})`);
  ok(gm(fontPairing).note === `not on Google Fonts: Garamond (${R6.Garamond.note})`, `Garamond + Montserrat note (${gm(fontPairing).note})`);
  const geo = fontPairing({ font: "Georgia", limit: 20 }).structuredContent.pairs;
  ok(geo.every((p) => !(p.google_fonts_url || "").includes("Georgia")), "Georgia: never in a Google Fonts link");
  ok(geo.filter((p) => p.heading === "Georgia" || p.body === "Georgia").every((p) => p.css.includes('"Georgia", serif;')), "Georgia: system stack + serif");

  // 2. as a partner on another guide: own stack + serif whatever the group; one note per font
  const row = (guide, h, b) => fontPairing({ font: guide, limit: 20 }).structuredContent.pairs.find((p) => p.heading === h && p.body === b);
  const fb = row("Futura", "Futura", "Bodoni");   // group "Serif Body Fonts" comes first; the Display Pairings row is checked below
  ok(fb && fb.css.endsWith(`body { font-family: ${R6.Bodoni.stack}, serif; }`), `Futura + Bodoni: Bodoni serif stack (${fb && fb.css})`);
  ok(fb && fb.note === `not on Google Fonts: Futura (licence or self-host it), Bodoni (${R6.Bodoni.note})`, `Futura + Bodoni: one note per font (${fb && fb.note})`);
  const disp = fontPairing({ font: "Futura", group: "display", limit: 20 }).structuredContent.pairs.find((p) => p.body === "Bodoni");
  const dispOld = baseFP({ font: "Futura", group: "display", limit: 20 }).structuredContent.pairs.find((p) => p.body === "Bodoni");
  ok(disp && /Display/.test(disp.group) && disp.css.endsWith(`body { font-family: ${R6.Bodoni.stack}, serif; }`), `Futura + Bodoni [Display Pairings]: serif (${disp && disp.css})`);
  ok(dispOld && dispOld.css.endsWith('body { font-family: "Bodoni", sans-serif; }'), "BASE: Futura + Bodoni [Display Pairings] fell back to sans-serif");
  const hg = row("Helvetica", "Helvetica", "Georgia"), pg = row("Proxima Nova", "Proxima Nova", "Georgia");
  for (const [nm, p, other] of [["Helvetica + Georgia", hg, "Helvetica"], ["Proxima Nova + Georgia", pg, "Proxima Nova"]]) {
    ok(p && p.css.endsWith('body { font-family: "Georgia", serif; }'), `${nm}: Georgia system stack (${p && p.css})`);
    ok(p && p.note === `not on Google Fonts: ${other} (licence or self-host it), Georgia (${R6.Georgia.note})`, `${nm}: note (${p && p.note})`);
  }
  const bb = row("Baskerville", "Baskerville", "Bodoni");
  ok(bb && bb.css === `h1, h2, h3 { font-family: ${R6.Baskerville.stack}, serif; }\nbody { font-family: ${R6.Bodoni.stack}, serif; }`, `Baskerville + Bodoni css (${bb && bb.css})`);
  ok(bb && bb.note === `not on Google Fonts: Baskerville (${R6.Baskerville.note}), Bodoni (${R6.Bodoni.note})`, `Baskerville + Bodoni note (${bb && bb.note})`);
  // rows whose non-Google fonts all lack an entry (Futura + Helvetica, Garamond-free rows with DIN...) keep the old note and css
  for (const v of Object.values(DATA)) for (const p of fontPairing({ font: v.font, limit: 20 }).structuredContent.pairs) {
    if (!p.note || [p.heading, p.body].some((x) => KNOWN[x] || x === "Trajan")) continue;
    const base = baseFP({ font: v.font, limit: 20 }).structuredContent.pairs.find((q) => q.heading === p.heading && q.body === p.body && q.group === p.group);
    ok(base && base.note === p.note && base.css === p.css, `${v.font}: ${p.heading} + ${p.body} unchanged (${p.note})`);
  }
  // Trajan (fonts r5) is untouched
  ok(JSON.stringify(fontPairing({ font: "Trajan", limit: 20 })) === JSON.stringify(baseFP({ font: "Trajan", limit: 20 })), "Trajan: unchanged");

  // 3. everything else byte-identical versus BASE; a changed answer moves only css / note / About for the five fonts
  const { CURATED } = await import(pathToFileURL(path.join(src, "font_pairings_curated.js")));
  const names = new Set([...Object.values(DATA).map((v) => v.font), ...Object.values(CURATED).map((v) => v.font),
    "Play", "Martian Mono", "Noto Kufi Arabic", "Crimson Pro", "Crimson Text", "Spectral", "Gotham", "Noto Sans Thai", "Zzyzx Display",
    "python asyncio", "", "Poppins font pairing", "Montserrat Bold", "Helvetica Neue", "Garamond Premier Pro", "Cinzel Decorative", "Marcellus SC",
    "EB Garamond", "Libre Baskerville", "Libre Caslon Text", "Bodoni Moda", "Cormorant Garamond", "Trajan Pro", "Adobe Garamond", "Big Caslon", "Didot"]);
  const R6RE = new RegExp(Object.keys(KNOWN).map(esc).join("|"));
  let same = 0, changed = 0, total = 0;
  for (const q of names) for (const extra of [{}, { group: "serif", limit: 3 }, { limit: 20 }]) {
    total++;
    const A = fontPairing({ font: q, ...extra }), B = baseFP({ font: q, ...extra });
    const a = JSON.stringify(A), b = JSON.stringify(B);
    if (a === b) { same++; continue; }
    changed++;
    const touches = (B.structuredContent.pairs || []).some((p) => KNOWN[p.heading] || KNOWN[p.body]);
    ok(touches, `"${q}" ${JSON.stringify(extra)} changed but has no row with one of the r6 fonts`);
    const strip = (r) => JSON.stringify({ ...r.structuredContent, pairs: (r.structuredContent.pairs || []).map(({ css, note, ...rest }) => rest) });
    ok(strip(A) === strip(B), `"${q}" ${JSON.stringify(extra)}: only css / note differ in structuredContent`);
    (A.structuredContent.pairs || []).forEach((p, i) => {
      const o = B.structuredContent.pairs[i];
      p.css.split("\n").forEach((l, j) => { if (l !== o.css.split("\n")[j]) ok(R6RE.test(o.css.split("\n")[j]), `"${q}": css line "${l}" changed but names none of the five`); });
      if (p.note !== o.note) ok(R6RE.test(o.note || ""), `"${q}": note changed without one of the five (${p.note})`);
    });
    const la = A.content[0].text.split("\n"), lb = B.content[0].text.split("\n");
    const keep = (ls) => ls.filter((l) => !/^  (h1, h2, h3|body) \{|^  note: |^About: /.test(l));
    ok(keep(la).join("\n") === keep(lb).join("\n"), `"${q}" ${JSON.stringify(extra)}: text differs outside css / note / About lines`);
  }
  ok(changed >= 5 * 3 + 4, `at least the five guides + their partner guides changed (got ${changed})`);
  console.log(`${total} answers compared with ${BASE}: ${same} unchanged, ${changed} changed (all within the r6 fonts' css / note / About)`);
} finally {
  fs.unlinkSync(tmp);
  fs.unlinkSync(baseFile);
}
if (fails.length) { console.log(fails.slice(0, 40).join("\n")); assert.fail(`${fails.length} of ${n} assertions failed`); }
console.log(`ok ${n} assertions`);
