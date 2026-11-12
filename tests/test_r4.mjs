// MCP r4 (13-Nov-2026): the round's changes against the base tree (tests/r4/.base = 0262278, the code of the live Worker 09fe3949, seo r1),
// both running in Node on the local copy of live D1 (tests/r3/.data/live.sqlite; see mcp-r3.md "Local D1 copy"):
//   A. library search (FTS): 320 real queries from the last 30 days. Queries the "rarer words" rule does not touch must be byte-identical
//      (proves the batched AND tiers take the same rows); the others are reported (top-8 overlap) and must never come back with fewer rows.
//   B. museum + annual facet pages: byte-identical to base for every facet value (+ case-collision and 404 slugs), one D1 statement per
//      page once the slug map is cached, and byte-identical again with the r4 partial indexes applied to a temporary copy of the DB.
//   C. get_font_pairing: the 12 Noto families answer; other-script Noto names stay honest zeros; the old 67 curated fonts unchanged.
//   D. get_ui_flow free text / search_ui_screens zero queries (see the r4 section at the end).
// Run: node --no-warnings --import=./tests/r3/register.mjs tests/test_r4.mjs   (prints "N passed, M failed"; VERBOSE=1 lists every check)
import { openDb, makeEnv, cacheShim, callTool } from "./r3/env.mjs";
import { DatabaseSync } from "node:sqlite";
import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";

const shim = cacheShim(); globalThis.caches = shim;
const { default: base } = await import("./r4/.base/src/index.js");
const { default: next } = await import("../src/index.js");
const db = openDb();
let ok = 0, fail = 0;
const t = (name, cond, info) => { cond ? ok++ : fail++; if (!cond || process.env.VERBOSE) console.log((cond ? "PASS " : "FAIL ") + name + (cond || info == null ? "" : " | " + String(info).slice(0, 400))); };
const text = (r) => ((r.result && r.result.content) || []).filter((c) => c.type === "text").map((c) => c.text).join("\n");
const ids = (s) => [...new Set([...s.matchAll(/\b[0-9a-f]{12}\b/g)].map((m) => m[0]))];

// ---------------------------------------------------------------------------------------------------------------- A. library search
{
  const B = makeEnv(db, { version: "r4-base" }), N = makeEnv(db, { version: "r4-next" });
  const { rows } = JSON.parse(readFileSync(new URL("./r4_queries.json", import.meta.url)));
  const { ftsWords, FTS_DOMINANT, isGeneric } = await import("../src/search_extras.js");
  const STOP = new Set(["the","and","for","with","from","that","this","are","some","any","ideas","idea","examples","example","inspiration","design","designs","style","styled","references","reference"]);
  let same = 0, touched = 0, untouchedDiff = [], shorter = [], overlap = 0, ovN = 0, stB = 0, stN = 0;
  const changed = [];
  for (const { tool, q } of rows) {
    const w = ftsWords(q, STOP), core = w.filter((x) => !isGeneric(x)), opt = core.length ? core : w, rare = opt.filter((x) => !FTS_DOMINANT.has(x));
    const split = opt.length > 1 && rare.length > 0 && rare.length < opt.length;
    const b0 = B.dbStats.n, n0 = N.dbStats.n;
    const rb = await callTool(base, B.env, tool, { query: q }), rn = await callTool(next, N.env, tool, { query: q });
    stB += B.dbStats.n - b0; stN += N.dbStats.n - n0;
    const tb = text(rb), tn = text(rn);
    if (tb === tn) { same++; continue; }
    const ib = ids(tb), inn = ids(tn);
    if (!split) { untouchedDiff.push(`${tool}: ${q}`); continue; }
    touched++;
    if (inn.length < ib.length) shorter.push(`${tool}: ${q} (${ib.length} -> ${inn.length})`);
    const k = Math.min(8, ib.length); if (k) { overlap += ib.slice(0, 8).filter((x) => inn.slice(0, 8).includes(x)).length / k; ovN++; }
    changed.push({ tool, q, base: ib.slice(0, 8), next: inn.slice(0, 8) });
  }
  t(`search: ${same}/${rows.length} real queries byte-identical to base; every query the rarer-words rule leaves alone is identical`, untouchedDiff.length === 0, untouchedDiff.slice(0, 5).join(" ; "));
  t(`search: ${touched} queries changed by the rarer-words rule; none returns fewer results (mean top-8 overlap with base ${(100 * overlap / Math.max(1, ovN)).toFixed(0)} %)`, shorter.length === 0, shorter.slice(0, 5).join(" ; "));
  t(`search: D1 statements for the ${rows.length} queries ${stB} -> ${stN} (the batch counts each of its statements; round trips are fewer)`, stN <= stB + rows.length, `${stB} -> ${stN}`);
  // kill switch: FTS_RARE=0 gives the base answers back for the changed queries
  const K = makeEnv(db, { version: "r4-next-k", vars: { FTS_RARE: "0" } }); let back = 0;
  for (const c of changed.slice(0, 25)) { const rb = await callTool(base, B.env, c.tool, { query: c.q }), rk = await callTool(next, K.env, c.tool, { query: c.q }); if (text(rb) === text(rk)) back++; }
  t(`search: with the Worker var FTS_RARE=0, ${back}/${Math.min(25, changed.length)} changed queries answer exactly as base`, back === Math.min(25, changed.length));
  // round trips: the batch is one
  { const R = makeEnv(db, { version: "r4-next-rt" }); let batches = 0, inBatch = 0; const ob = R.env.DB.batch; R.env.DB.batch = async (l) => { batches++; inBatch += l.length; return ob(l); };
    const B2 = makeEnv(db, { version: "r4-base-rt" }); let sb = 0, sn = 0;
    for (const { tool, q } of rows.slice(0, 120)) { const b0 = B2.dbStats.n, n0 = R.dbStats.n; await callTool(base, B2.env, tool, { query: q }); await callTool(next, R.env, tool, { query: q }); sb += B2.dbStats.n - b0; sn += R.dbStats.n - n0; }
    const rtN = sn - inBatch + batches;
    t(`search: D1 round trips for 120 real queries ${sb} -> ${rtN} (${batches} batches)`, rtN < sb, `${sb} -> ${rtN}`); }
  if (process.env.R4_CHANGED) { const { writeFileSync } = await import("node:fs"); writeFileSync(process.env.R4_CHANGED, JSON.stringify(changed, null, 1)); }
}

// ---------------------------------------------------------------------------------------------------------------- B. facet pages
{
  const slug = (s) => (s || "").toString().toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "report";   // = slugify() in src/index.js
  const get = async (worker, env, path) => {
    for (const k of [...shim.store.keys()]) if (!k.includes("/inspiration/mcp/_cache/")) shim.store.delete(k);   // page edge cache off
    const r = await worker.fetch(new Request("https://madegooddesigns.com/inspiration" + path, { headers: { "User-Agent": "r4-facets" } }), env, { waitUntil() {}, passThroughOnException() {} });
    return { status: r.status, body: await r.text() };
  };
  const paths = [];
  const MUS = { artist: "designer", museum: "company", type: "industry", culture: "country", theme: "category" };
  const ANN = { designer: "designer", company: "company", industry: "industry", country: "country" };
  let seed = 913; const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);
  const pick = (a, n) => a.map((x) => [rnd(), x]).sort((p, q) => p[0] - q[0]).slice(0, n).map((x) => x[1]);
  for (const [kind, col] of Object.entries(MUS)) {
    const vals = db.prepare(`SELECT DISTINCT ${col} AS v FROM items WHERE status='published' AND collection='museum' AND ${col} IS NOT NULL AND ${col}<>''`).all().map((r) => r.v);
    for (const v of pick(vals, kind === "theme" || kind === "museum" ? 60 : 70)) paths.push(`/museum/${kind}/${encodeURIComponent(slug(v))}`);
  }
  for (const [kind, col] of Object.entries(ANN)) {
    const vals = db.prepare(`SELECT DISTINCT ${col} AS v FROM items WHERE status='published' AND collection='annual-report' AND ${col} IS NOT NULL AND ${col}<>''`).all().map((r) => r.v);
    for (const v of pick(vals, 60)) paths.push(`/annual-reports/${kind}/${encodeURIComponent(slug(v))}`);
  }
  paths.push("/museum/culture/greek", "/museum/artist/no-such-artist-r4", "/annual-reports/company/no-such-company-r4", "/museum/artist/constructor", "/annual-reports/company/__proto__", "/museum/nope/x");
  const B = makeEnv(db, { version: "r4-base-f" }), N = makeEnv(db, { version: "r4-next-f" });
  let same = 0; const bad = [];
  for (const p of paths) { const a = await get(base, B.env, p), b = await get(next, N.env, p), c = await get(next, N.env, p); if (a.status === b.status && a.body === b.body && b.body === c.body) same++; else bad.push(`${p} ${a.status}/${b.status}/${c.status}`); }
  t(`facets: ${same}/${paths.length} museum + annual facet pages byte-identical to base (cache fill and served), incl. 404s and prototype-name slugs`, same === paths.length, bad.slice(0, 6).join(" ; "));
  const p0 = paths.find((p) => p.startsWith("/museum/artist/")); await get(next, N.env, p0);
  const s0 = N.dbStats.sql.length; await get(next, N.env, p0); const sq = N.dbStats.sql.slice(s0);
  t(`facets: a warm museum artist page runs ${sq.length} D1 statement(s), no SELECT DISTINCT`, sq.length === 1 && !sq.some((x) => /DISTINCT/.test(x)), sq.join(" | "));
  const a0 = paths.find((p) => p.startsWith("/annual-reports/company/")); await get(next, N.env, a0);
  const s1 = N.dbStats.sql.length; await get(next, N.env, a0); const sa = N.dbStats.sql.slice(s1);
  t(`facets: a warm annual company page runs ${sa.length} D1 statement(s), no SELECT DISTINCT`, sa.length === 1 && !sa.some((x) => /DISTINCT/.test(x)), sa.join(" | "));
  // the staged partial indexes: same pages, and the facet queries use them
  const dir = new URL("./r4/.data/", import.meta.url).pathname; mkdirSync(dir, { recursive: true });
  const tmp = dir + "live_idx.sqlite"; copyFileSync(new URL("./r3/.data/live.sqlite", import.meta.url).pathname, tmp);
  const sqlPath = new URL("../../deploy-bundle-2026-11-09/r4-indexes.sql", import.meta.url).pathname;
  const raw = new DatabaseSync(tmp);
  for (const st of readFileSync(sqlPath, "utf8").split("\n").filter((l) => /^CREATE INDEX/.test(l))) raw.exec(st);
  const plans = [];
  for (const [coll, cols, ord] of [["museum", Object.values(MUS), "featured_rank IS NULL, featured_rank, report_year, title, owner_id, created_at DESC, rowid LIMIT 400"], ["annual-report", Object.values(ANN), "report_year, company, owner_id, created_at DESC, rowid"]])
    for (const c of cols) plans.push(raw.prepare(`EXPLAIN QUERY PLAN SELECT * FROM items WHERE status='published' AND collection='${coll}' AND ${c}=? ORDER BY ${ord}`).all("x").map((r) => r.detail).join(" "));
  t(`indexes: all 9 facet item queries use their r4 partial index`, plans.every((p) => /USING INDEX idx_r4_/.test(p)), plans.filter((p) => !/idx_r4_/.test(p)).join(" | "));
  raw.close();
  const dbi = openDb(tmp), I = makeEnv(dbi, { version: "r4-next-i" });
  let same2 = 0; const bad2 = [];
  for (const p of paths) { const a = await get(base, B.env, p), b = await get(next, I.env, p); if (a.status === b.status && a.body === b.body) same2++; else bad2.push(p); }
  t(`indexes: ${same2}/${paths.length} facet pages byte-identical to base with the r4 indexes applied`, same2 === paths.length, bad2.slice(0, 6).join(" ; "));
  dbi.close();
}

// ---------------------------------------------------------------------------------------------------------------- C. fonts
{
  const N = makeEnv(db, { version: "r4-next-fp" });
  const noto = ["Noto Sans", "Noto Serif", "Noto Sans SC", "Noto Serif SC", "Noto Sans TC", "Noto Serif TC", "Noto Sans JP", "Noto Serif JP", "Noto Sans KR", "Noto Serif KR", "Noto Sans Arabic", "Noto Sans Devanagari"];
  for (const f of noto) { const r = text(await callTool(next, N.env, "get_font_pairing", { font: f })); t(`fonts: ${f} answers 5 pairings`, new RegExp(`^5 pairing\\(s\\) for ${f}\\.`).test(r), r.slice(0, 120)); }
  for (const [q, want] of [["Noto Sans CJK SC", "Noto Sans SC"], ["Noto Serif CJK JP", "Noto Serif JP"], ["Noto Sans Simplified Chinese", "Noto Sans SC"]]) {
    const r = text(await callTool(next, N.env, "get_font_pairing", { font: q })); t(`fonts: "${q}" -> ${want}`, r.startsWith(`5 pairing(s) for ${want}`), r.slice(0, 120)); }
  for (const q of ["Noto Sans Thai", "Noto Sans Hebrew", "Noto Sans HK", "Noto Serif Devanagari", "Noto Color Emoji", "Play"]) {
    const r = text(await callTool(next, N.env, "get_font_pairing", { font: q })); t(`fonts: "${q}" stays an honest zero`, /^0 results/.test(r), r.slice(0, 120)); }
  const { CURATED } = await import("../src/font_pairings_curated.js"), { CURATED: OLD } = await import("./r4/.base/src/font_pairings_curated.js");
  t(`fonts: the ${Object.keys(OLD).length} older curated fonts are unchanged; ${Object.keys(CURATED).length - Object.keys(OLD).length} added`, Object.keys(OLD).every((k) => JSON.stringify(OLD[k]) === JSON.stringify(CURATED[k])) && Object.keys(CURATED).length === 79);
}

// ---------------------------------------------------------------------------------------------------------------- D. UI flows + UI zeros
if (existsSync(new URL("./r4_ui.mjs", import.meta.url))) { const m = await import("./r4_ui.mjs"); const r = await m.run({ base, next, db, makeEnv, callTool, text, t }); }

console.log(`${ok} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
