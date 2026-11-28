// typo-b20 (29-Nov-2026): get_font_pairing answers commercial / system fonts that have a published free-alternatives page.
//  0. Scope: font_pairings.json, font_pairings_curated.js, gf_meta.js, search_extras.js, arg_alias.js unchanged since BASE; the only code
//     change is font_pairing.js; src/font_alternatives.js equals a fresh build_mcp_alts.py run over the typography batches (B1-B20).
//  1. Data: one entry per non-held alternatives row (all 27 B20 rows included), page = the batch slug, 5+ look-alikes, every look-alike a
//     Google Fonts family (gf_meta.js), never a font that has its own guide or is itself a Google Fonts family.
//  2. Every alternatives font (name, aliases, upper case, "<name> font") answers match "alternatives" citing its page (partner-only fonts:
//     match "partner" plus alternatives_page); borrowed pairs come only from look-alike guides and include the look-alike.
//  3. Negatives: Google Fonts families, guide fonts and unrelated names never get an alternatives answer (Hobonichi, Courier, Seasonal).
//  4. Regression vs BASE over every Google family, BASE partner and guide font: unchanged, except alternatives fonts (zero / fuzzy /
//     partner -> alternatives or partner + look-alikes).
// Run: node --no-warnings tests/typo_b20.test.mjs   (BASE = 9750580 = typo-b19-mcp, so B20 stacks on B19)
import fs from "node:fs"; import path from "node:path"; import assert from "node:assert"; import { pathToFileURL } from "node:url";
import { execFileSync } from "node:child_process"; import os from "node:os";
const BASE = process.env.TB20_BASE || "9750580";
const BUNDLE = process.env.TB20_BUNDLE || path.join(process.env.HOME, "Downloads/EtiennAubertBonn/deploy-bundle-2026-11-25");
const src = path.resolve("src"), tmp = path.join(src, "_typo_b20_test.mjs"), baseFile = path.join(src, "_typo_b20_base.mjs");
const PAIR_TEXT = fs.readFileSync(path.join(src, "font_pairings.json"), "utf8");
const ALT_TEXT = fs.readFileSync(path.join(src, "font_alternatives.js"), "utf8");
const ALT = JSON.parse(ALT_TEXT.replace(/^\/\/.*\n/, "").replace(/^export default /, "").replace(/;\s*$/, "")), DATA = JSON.parse(PAIR_TEXT);
const git = (f) => execFileSync("git", ["show", `${BASE}:src/${f}`], { encoding: "utf8", maxBuffer: 64 << 20 });
for (const f of ["font_pairings.json", "font_pairings_curated.js", "gf_meta.js", "search_extras.js", "arg_alias.js"])
  assert.equal(git(f), fs.readFileSync(path.join(src, f), "utf8"), `${f} changed since ${BASE} (B20 changes only font_pairing.js + font_alternatives.json)`);
// fresh build of the data from the batches must equal the committed file
const fresh = path.join(os.tmpdir(), `typo_b20_alts_${process.pid}.js`);
execFileSync("python3", ["-I", path.join(BUNDLE, "fonts-b20", "src", "build_mcp_alts.py"), fresh], { encoding: "utf8" });
assert.equal(fs.readFileSync(fresh, "utf8"), ALT_TEXT, "src/font_alternatives.js differs from a fresh build_mcp_alts.py run (rebuild it)");
fs.unlinkSync(fresh);
const inline = (code, pj, aj) => code.replace('import PAIRINGS from "./font_pairings.json";', "const PAIRINGS = " + pj + ";")
  .replace('import ALTERNATIVES from "./font_alternatives.js";', "const ALTERNATIVES = " + aj + ";");
fs.writeFileSync(tmp, inline(fs.readFileSync(path.join(src, "font_pairing.js"), "utf8"), PAIR_TEXT, JSON.stringify(ALT)));
fs.writeFileSync(baseFile, inline(git("font_pairing.js"), git("font_pairings.json"), "[]"));
let n = 0;
const fails = [];
const ok = (c, m) => { if (!c) fails.push(m); n++; };
try {
  const { fontPairing } = await import(pathToFileURL(tmp));
  const { fontPairing: baseFP } = await import(pathToFileURL(baseFile));
  const { GF_META } = await import(pathToFileURL(path.join(src, "gf_meta.js")));
  const key = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  const GFK = new Set(GF_META.split("\n").filter(Boolean).map((l) => key(l.split("|")[0])));
  const GUIDE = new Set(Object.values(DATA).filter((v) => v.page).map((v) => key(v.font)));
  const sc = (f) => fontPairing({ font: f }).structuredContent;

  // 1. data
  const rows = [];
  for (let b = 1; b <= 20; b++) {
    const pf = path.join(BUNDLE, `fonts-b${b}`, "src", "plan.json");
    if (!fs.existsSync(pf)) continue;
    for (const r of JSON.parse(fs.readFileSync(pf, "utf8"))) if (r.vtype === "alternatives" && !("held" in r) && r.paid && r.paid.length) rows.push({ ...r, b });
  }
  ok(rows.filter((r) => r.b === 20).length === 27, `27 B20 alternatives rows (got ${rows.filter((r) => r.b === 20).length})`);
  ok(ALT.length === rows.length, `${rows.length} entries (got ${ALT.length})`);
  for (const r of rows) {
    const e = ALT.find((x) => x.font === r.paid[0]);
    ok(e && e.page === `https://madegooddesigns.com/${r.slug}/`, `${r.paid[0]}: page ${r.slug}`);
    if (!e) continue;
    ok(e.lookalikes.length >= 5 && e.lookalikes.every((x) => GFK.has(key(x))), `${e.font}: 5+ Google Fonts look-alikes`);
    ok(!GFK.has(key(e.font)), `${e.font}: not a Google family`);
  }

  // 2. positives. A font answered by a guide in BASE (exact / alias / prefix / variant) keeps that guide answer: Georgia has its own
  //    guide, and BASE answers "Sofia Pro" with the Sofia guide by prefix. Listed so that a new one fails loudly.
  const GUIDED = new Set(["Georgia", "Sofia Pro"]);
  for (const e of ALT) {
    const bs = baseFP({ font: e.font }).structuredContent;
    const guided = !!(bs.page && ["exact", "alias", "prefix", "variant"].includes(bs.match));
    ok(guided === GUIDED.has(e.font), `${e.font}: guide-answered in BASE = ${guided} (expected ${GUIDED.has(e.font)})`);
    if (guided) { ok(JSON.stringify(baseFP({ font: e.font })) === JSON.stringify(fontPairing({ font: e.font })), `${e.font}: guide answer unchanged`); continue; }
    for (const q of [e.font, e.font.toUpperCase(), `${e.font} font`, ...(e.aliases || [])]) {
      const s = sc(q);
      ok((s.match === "alternatives" || s.match === "partner") && s.alternatives_page === e.page, `${q}: cites ${e.page} (got ${s.match} ${s.alternatives_page})`);
      if (s.match !== "alternatives") continue;
      ok(s.font === e.font && s.page === null && JSON.stringify(s.lookalikes) === JSON.stringify(e.lookalikes), `${q}: font + look-alikes`);
      ok(s.pairs.every((p) => p.page && e.lookalikes.includes(p.lookalike) && (p.heading === p.lookalike || p.body === p.lookalike)), `${q}: pairs only from look-alike guides`);
      const t = fontPairing({ font: q }).content[0].text;
      ok(t.startsWith(`No pairing guide for ${e.font}. Free Google Fonts look-alikes for ${e.font}`) && t.includes(e.page), `${q}: first line cites the page`);
      ok(!/^0 [^\n]*result/.test(t), `${q}: not a zero answer`);
    }
  }
  for (const [q, want] of [["ITC Kabel", "Kabel"], ["OCR A Extended", "OCR-A"], ["OCR-B", "OCR-A"], ["Bauhaus 93", "ITC Bauhaus"], ["Edwardian Script", "Edwardian Script ITC"],
    ["Kristen", "Kristen ITC"], ["Curlz", "Curlz MT"], ["Neue Haas Grotesk Display", "Neue Haas Grotesk"], ["Trade Gothic LT Std", "Trade Gothic"], ["Sabon Next", "Sabon"]]) {
    const s = sc(q);
    ok(s.font === want || (s.alternatives_page && ALT.find((x) => x.font === want)?.page === s.alternatives_page), `${q} -> ${want} (got ${s.match} ${s.font})`);
  }

  // 3. negatives
  for (const q of ["Hobonichi", "Courier", "Seasonal", "Poppins", "Inter", "Georgia", "Trajan", "Garamond", "Montserrat", "Anton", "Cinzel", "Fraunces", "Gotham", "Helvetica"]) {
    const s = sc(q);
    ok(s.match !== "alternatives" && !s.alternatives_page, `${q}: no alternatives answer (got ${s.match} ${s.alternatives_page})`);
  }
  for (const l of GF_META.split("\n").filter(Boolean)) {
    const fam = l.split("|")[0], s = sc(fam);
    if (s.match === "alternatives" || s.alternatives_page) ok(false, `${fam} (Google family) got an alternatives answer`);
  }

  // 4. regression vs BASE
  const altKeys = new Set(ALT.flatMap((e) => [e.font, ...(e.aliases || [])]).map(key));
  const names = new Set([...GF_META.split("\n").filter(Boolean).map((l) => l.split("|")[0]), ...Object.values(DATA).flatMap((v) => [v.font, ...v.pairs.flatMap((p) => [p.heading, p.body])]),
    ...ALT.map((e) => e.font)]);
  const changed = {};
  for (const q of names) {
    const b = baseFP({ font: q }), c = fontPairing({ font: q });
    if (JSON.stringify(b) === JSON.stringify(c)) continue;
    const bs = b.structuredContent, cs = c.structuredContent;
    const kind = `${bs.match || "zero"} -> ${cs.match || "zero"}${cs.alternatives_page ? " + alternatives" : ""}`;
    ok(altKeys.has(key(q)) || cs.alternatives_page, `${q}: changed (${kind}) but is not an alternatives font`);
    ok(!(bs.page && ["exact", "alias", "prefix", "variant"].includes(bs.match)), `${q}: BASE cited guide ${bs.page} (${bs.match}); must not change`);
    (changed[kind] = changed[kind] || []).push(q);
  }
  const allowed = (k) => /^(zero|fuzzy|similar|partner|undefined) -> (alternatives|partner) \+ alternatives$/.test(k);
  for (const [k, v] of Object.entries(changed)) ok(allowed(k), `unexpected change kind "${k}": ${v.slice(0, 8).join(", ")}`);
  console.log("changed vs BASE:", Object.entries(changed).map(([k, v]) => `${k}: ${v.length}${v.length <= 12 ? " (" + v.join(", ") + ")" : ""}`).join("; "));
} finally {
  fs.unlinkSync(tmp); fs.unlinkSync(baseFile);
}
if (fails.length) { console.log(fails.slice(0, 40).join("\n")); assert.fail(`${fails.length} of ${n} assertions failed`); }
console.log(`ok ${n} assertions, ${ALT.length} alternatives pages`);
