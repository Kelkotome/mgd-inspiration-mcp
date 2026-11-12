// MCP r3 (12-Nov-2026): cache correctness on real queries, against a local copy of the live D1 (tests/r3/.data/live.sqlite).
//  1. 200 real queries from the last 7 days (tests/mcp_r3_queries.json, read-only from mcp_calls): the answer with the cache off
//     (MCP_CACHE=0), the first answer with the cache on (fills it) and a second one (served from it) are byte-identical.
//  2. The cache never stores an empty or error value (shared()/exact() on [], {}, null, isError, "0 results", throws; and every
//     entry left in the Cache API shim after the replay).
//  3. A version change (new deploy = new CF_VERSION_METADATA.id) misses every old entry; MCP_CACHE_VERSION is part of the key.
//  4. The cached tools really are served from the cache on the second call (fewer D1 statements).
// Run: node --no-warnings --import=./tests/r3/register.mjs tests/test_mcp_r3_cache.mjs   (prints "N passed, M failed")
import { readFileSync } from "node:fs";
import { openDb, makeEnv, cacheShim, callTool, argsFor } from "./r3/env.mjs";

const shim = cacheShim(); globalThis.caches = shim;
const { default: worker } = await import("../src/index.js");
const C = await import("../src/mcp_cache.js");
let ok = 0, fail = 0;
const t = (name, cond, info) => { cond ? ok++ : fail++; if (!cond || process.env.VERBOSE) console.log((cond ? "PASS " : "FAIL ") + name + (cond ? "" : " | " + String(info).slice(0, 400))); };

// ---- 1. real queries: cached == uncached
const db = openDb();
const ON = makeEnv(db, { version: "v-test-1" }), OFF = makeEnv(db, { vars: { MCP_CACHE: "0" }, version: "v-test-1" });
const all = JSON.parse(readFileSync(new URL("./mcp_r3_queries.json", import.meta.url))).rows;
// deterministic sample of 200: every tool keeps up to 12 of its queries, the rest is filled from a seeded shuffle
let seed = 20261112; const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);
const shuffled = all.map((r) => [rnd(), r]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);
const pick = [], per = {};
for (const r of shuffled) if ((per[r.tool] = (per[r.tool] || 0) + 1) <= 12) pick.push(r);
for (const r of shuffled) if (pick.length < 200 && !pick.includes(r)) pick.push(r);
const sample = pick.slice(0, 200);
t("sample has 200 real queries", sample.length === 200, sample.length);
const strip = (r) => JSON.stringify(r);
// tools whose slow-changing data (or exact answer) is cached: the repeat call must read less from D1. (The library searches keep
// their per-query FTS reads; only their "FTS index exists" check is cached, which the per-isolate memo already covered.)
const CACHED = new Set(["search_ui_screens", "get_ui_flow", "list_ui_patterns", "list_inspiration_themes", "browse_inspiration_by_theme", "get_ui_screen_code"]);
const reads = (st, from) => st.sql.slice(from).filter((q) => /^\s*(SELECT|WITH)/i.test(q) && !/mcp_events/.test(q)).length;   // the daily-cap count is not cacheable
// search_icons loads its icon data on first use; withIconHint gives up after 2.5 s, so warm it first (a timing race, not the cache)
await callTool(worker, OFF.env, "search_icons", { query: "arrow" });
let served = 0, cachedCalls = 0, iconRetries = 0;
const THEMES = JSON.parse(readFileSync(new URL("../src/index.js", import.meta.url), "utf8").match(/const MCP_THEMES = (\[[^\]]+\])/)[1]);
for (const r of sample) {
  const args = argsFor(r.tool, r.query);
  let off, on1, on2, n1, n2, a, b, c;
  for (let tries = 0; tries < 2; tries++) {
    off = await callTool(worker, OFF.env, r.tool, args);
    const n0 = ON.dbStats.sql.length; on1 = await callTool(worker, ON.env, r.tool, args); n1 = reads(ON.dbStats, n0);
    const n2s = ON.dbStats.sql.length; on2 = await callTool(worker, ON.env, r.tool, args); n2 = reads(ON.dbStats, n2s);
    a = strip(off.result || off.error); b = strip(on1.result || on1.error); c = strip(on2.result || on2.error);
    if (a === b && b === c) break;
    // the one known non-cache difference: withIconHint gives search_icons 2.5 s and a busy test machine sometimes runs out (the
    // hint then reads "Looking for UI icons? Call search_icons(...)" without the 3 icon lines). Re-run once; count it.
    if (/Looking for UI icons\?/.test(a + b + c)) iconRetries++; else break;
  }
  t(`${r.tool} "${String(r.query).slice(0, 50)}": cached == uncached`, a === b && b === c, a === b ? "2nd call differs: " + c.slice(0, 200) : "1st cached call differs:\n  off " + a.slice(0, 300) + "\n  on  " + b.slice(0, 300));
  const curated = r.tool !== "browse_inspiration_by_theme" || THEMES.includes(String(args.theme || ""));
  if (CACHED.has(r.tool) && curated && !(on1.result && on1.result.isError)) { cachedCalls++; if (n2 < n1 || (n2 === 0 && n1 === 0)) served++; else if (process.env.VERBOSE) console.log("  no saving", r.tool, r.query, n1, n2); }
}
t(`tools with cached data read less from D1 on the repeat call (${served}/${cachedCalls}; uncurated browse themes are not cached)`, served === cachedCalls, `${served}/${cachedCalls}`);
if (iconRetries) console.log(`note: ${iconRetries} icon-hint timing re-run(s) (withIconHint's 2.5 s budget on a busy machine; not the cache)`);

// ---- 2. never stores empty / error values
let loads = 0; const L = (v) => async () => { loads++; return v; };
for (const [name, v] of [["empty-array", []], ["empty-object", {}], ["null", null], ["error", { content: [{ type: "text", text: "boom" }], isError: true }], ["blank-text", { content: [{ type: "text", text: "  " }] }]]) {
  loads = 0; await C.shared(ON.env, "t-" + name, 600, L(v)); await C.shared(ON.env, "t-" + name, 600, L(v));
  t(`empty value not stored: ${name}`, loads === 2, loads);
}
loads = 0; const zero = { content: [{ type: "text", text: "0 results: nothing" }] };
await C.exact(ON.env, "t-zero", 600, L(zero), { keep: (r) => !/^0 /.test(r.content[0].text) }); await C.exact(ON.env, "t-zero", 600, L(zero), { keep: (r) => !/^0 /.test(r.content[0].text) });
t("keep()=false (a '0 results' answer) not stored", loads === 2, loads);
let threw = 0;
for (let i = 0; i < 2; i++) { try { await C.shared(ON.env, "t-throws", 600, async () => { loads++; throw new Error("D1 down"); }); } catch (e) { threw++; } }
t("a loader that throws is not stored (and the error reaches the caller)", threw === 2, threw);
loads = 0; await C.shared(ON.env, "t-full", 600, L([1])); await C.shared(ON.env, "t-full", 600, L([1]));
t("a non-empty value is stored (one load for two calls)", loads === 1, loads);
const e1 = await C.exact(ON.env, "t-obj", 600, async () => ({ content: [{ type: "text", text: "x" }] })); e1.content[0].text = "mutated";
const e2 = await C.exact(ON.env, "t-obj", 600, async () => ({ content: [{ type: "text", text: "never" }] }));
t("exact() hands out copies (a caller's edit does not reach the cache)", e2.content[0].text === "x", e2.content[0].text);
// font pairing zero through the Worker: two calls of an unknown font both run the lookup (the answer is "0 results" both times)
const fz = await callTool(worker, ON.env, "get_font_pairing", { font: "Zzyzx Display r3" });
t("unknown font is still a '0 results' answer", /^0 results/.test(fz.result.content[0].text), fz.result.content[0].text.slice(0, 80));
let bad = 0;
for (const [k, v] of shim.store) { let box; try { box = JSON.parse(v); } catch (_) { bad++; continue; } if (C.isEmptyValue(box.val)) bad++; if (/"0 results/.test(v.slice(0, 400))) bad++; }
t(`no empty or zero entry in the Cache API after the replay (${shim.store.size} entries)`, bad === 0 && shim.store.size > 0, bad);

// ---- 3. versions
const V2 = makeEnv(db, { version: "v-test-2" });
t("cache key carries MCP_CACHE_VERSION and the deploy version", C.cacheVersion(ON.env).startsWith(C.MCP_CACHE_VERSION + ".") && C.cacheVersion(ON.env) !== C.cacheVersion(V2.env), C.cacheVersion(ON.env));
loads = 0; await C.shared(ON.env, "t-ver", 600, L([1])); await C.shared(ON.env, "t-ver", 600, L([1])); await C.shared(V2.env, "t-ver", 600, L([2]));
t("a new deploy version misses the old entry", loads === 2, loads);
const a1 = await callTool(worker, ON.env, "list_inspiration_themes", {}); const n0 = V2.dbStats.n;
const a2 = await callTool(worker, V2.env, "list_inspiration_themes", {});
t("list_inspiration_themes on a new version reloads from D1 (and gives the same answer)", V2.dbStats.n - n0 >= 1 && JSON.stringify(a1.result) === JSON.stringify(a2.result), V2.dbStats.n - n0);
// TTL: an entry older than its TTL is reloaded (memory and Cache API both check the load time)
C._memClear(); shim.store.clear(); loads = 0;
await C.shared(ON.env, "t-ttl", 1, L([1])); await new Promise((r) => setTimeout(r, 1100)); await C.shared(ON.env, "t-ttl", 1, L([1]));
t("an expired entry is reloaded", loads === 2, loads);
// edge level: a fresh isolate (memory cleared) is served from the Cache API, not D1
C._memClear(); loads = 0; await C.shared(ON.env, "t-edge", 600, L([7])); C._memClear(); const ev = await C.shared(ON.env, "t-edge", 600, L([8]));
t("a cold isolate is served from the colo cache", loads === 1 && ev[0] === 7, `${loads} ${ev}`);
// MCP_CACHE=0 never touches the cache
const before = shim.stats.put; await callTool(worker, OFF.env, "list_inspiration_themes", {});
t("MCP_CACHE=0 writes nothing to the cache", shim.stats.put === before, shim.stats.put - before);
// dropShared (ingest in this colo)
loads = 0; await C.shared(ON.env, "t-drop", 600, L([1])); await C.dropShared(ON.env, ["t-drop"]); await C.shared(ON.env, "t-drop", 600, L([1]));
t("dropShared() forgets an entry (memory and Cache API)", loads === 2, loads);

console.log(`${ok} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
