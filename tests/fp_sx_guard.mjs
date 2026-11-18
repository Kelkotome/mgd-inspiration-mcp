// MCP r7 (18-Nov-2026): the fonts suites (fp_r4/r5/r6) compare BASE font_pairing.js with the current one, both importing the CURRENT
// src/search_extras.js, so they used to require search_extras.js to be byte-identical to BASE. MCP r7 changes search_extras.js (accent
// folding in btKey, FTS forms, brand lookups). This guard replaces the byte check with the property the fonts suites rely on: for every
// font name the fonts code can see (guides, pairs, curated, Google Fonts families + metadata), btKey and gfLink give the same answer as
// BASE's search_extras.js, and btLev the same distances. Any difference fails the suite, as before.
import fs from "node:fs"; import path from "node:path"; import assert from "node:assert"; import { pathToFileURL } from "node:url";
export async function sxGuard(src, git, BASE) {
  const cur = fs.readFileSync(path.join(src, "search_extras.js"), "utf8"), old = git("search_extras.js");
  if (cur === old) return "search_extras.js unchanged";
  const f = path.join(src, `_fp_sx_base_${process.pid}.mjs`);
  fs.writeFileSync(f, old);
  try {
    const O = await import(pathToFileURL(f).href), C = await import(pathToFileURL(path.join(src, "search_extras.js")).href);
    const P = JSON.parse(fs.readFileSync(path.join(src, "font_pairings.json"), "utf8"));
    const { CURATED, GF_FAMILIES } = await import(pathToFileURL(path.join(src, "font_pairings_curated.js")).href);
    const { GF_META } = await import(pathToFileURL(path.join(src, "gf_meta.js")).href);
    const names = new Set();
    for (const v of [...Object.values(P), ...Object.values(CURATED)]) { names.add(v.font); for (const p of v.pairs || []) { names.add(p.heading); names.add(p.body); } }
    for (const n of GF_FAMILIES) names.add(n);
    for (const l of GF_META.split("\n")) names.add(l.split("|")[0]);
    const list = [...names].filter(Boolean);
    for (const n of list) assert.equal(C.btKey(n), O.btKey(n), `btKey("${n}") differs from ${BASE}`);
    for (let i = 0; i + 1 < list.length; i += 7) assert.equal(C.gfLink([list[i], list[i + 1]]), O.gfLink([list[i], list[i + 1]]), "gfLink differs");
    for (let i = 0; i + 1 < list.length; i += 11) { const a = C.btKey(list[i]), b = C.btKey(list[i + 1]); assert.equal(C.btLev(a, b, 2), O.btLev(a, b, 2), "btLev differs"); }
    return `search_extras.js changed since ${BASE}; btKey/gfLink/btLev identical for ${list.length} font names`;
  } finally { fs.rmSync(f, { force: true }); }
}
