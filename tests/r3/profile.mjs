// MCP r3 (12-Nov-2026) latency profile: the Worker's fetch() in Node on the local D1 copy, with a simulated network between the
// Worker and D1 / R2 (each statement and each R2 get waits RTT ms, plus result bytes / THROUGHPUT), so the time per tool is
// "round trips × RTT + transfer + CPU", like a call from the US or Europe to the D1 primary in APAC.
// Each measured call runs in a fresh worker thread (= a cold isolate). Scenarios:
//   cold        fresh isolate, empty colo cache (the first call in a colo after a deploy or a TTL)
//   colo        fresh isolate, colo cache warmed by a DIFFERENT call of the same tool (the common case with ≥1 call per colo per TTL)
//   isolate     warm isolate (a different call of the same tool ran just before in the same isolate)
// Usage: node --no-warnings --import=./tests/r3/register.mjs tests/r3/profile.mjs <src root> [rtt=230] [mbit=60] [per_tool=12] [conc=6] > out.json
import { Worker, isMainThread, parentPort, workerData } from "node:worker_threads";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

if (isMainThread) {
  const [root, rtt = "230", mbit = "60", perTool = "12", conc = "6"] = process.argv.slice(2);
  const rows = JSON.parse(readFileSync(new URL("../mcp_r3_queries.json", import.meta.url))).rows;
  const TOOLS = ["search_ui_screens", "search_design_inspiration", "search_museum_art", "search_annual_reports", "list_inspiration_themes", "get_ui_flow", "list_ui_patterns", "get_brand_typeface", "browse_inspiration_by_theme", "get_ui_screen_code", "get_font_pairing"];
  const PRIME = { search_ui_screens: "dashboard", search_design_inspiration: "poster", search_museum_art: "flowers", search_annual_reports: "airline", list_inspiration_themes: "", get_ui_flow: '{"flow":"sign-up"}',
    list_ui_patterns: '{"kind":"flows"}', get_brand_typeface: "Nike", browse_inspiration_by_theme: "retro", get_ui_screen_code: "PRIME", get_font_pairing: "Inter" };
  const jobs = [];
  for (const tool of TOOLS) {
    const qs = rows.filter((r) => r.tool === tool);
    let seed = 7; const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);
    const pick = qs.map((r) => [rnd(), r]).sort((a, b) => a[0] - b[0]).slice(0, +perTool).map((x) => x[1]);
    for (const r of pick) for (const sc of ["cold", "colo", "isolate"]) jobs.push({ tool, query: r.query, prime: PRIME[tool], sc });
  }
  const out = []; let i = 0;
  const run = (job) => new Promise((res) => {
    const w = new Worker(fileURLToPath(import.meta.url), { workerData: { ...job, root, rtt: +rtt, mbit: +mbit }, execArgv: ["--no-warnings", "--import=" + new URL("./register.mjs", import.meta.url).pathname] });
    w.once("message", (m) => { out.push({ ...job, ...m }); res(); }); w.once("error", (e) => { out.push({ ...job, err: String(e) }); res(); });
  });
  await Promise.all(Array.from({ length: +conc }, async () => { while (i < jobs.length) await run(jobs[i++]); }));
  process.stdout.write(JSON.stringify({ root, rtt: +rtt, mbit: +mbit, jobs: out }));
} else {
  const { tool, query, prime, sc, root, rtt, mbit } = workerData;
  const E = await import(new URL("./env.mjs", import.meta.url));
  const shim = E.cacheShim({ lat: 2 }); globalThis.caches = shim;
  const db = E.openDb();
  // transfer time: result bytes over the link (D1 statements), on top of the RTT
  const { env, dbStats, r2Stats } = E.makeEnv(db, { rtt, r2rtt: rtt, version: "prof" });
  const inner = env.DB.prepare;
  env.DB.prepare = (sql) => { const s = inner(sql); const wrap = (st) => ({ ...st, bind: (...b) => wrap(st.bind(...b)),
    all: async () => { const r = await st.all(); const kb = Buffer.byteLength(JSON.stringify(r.results || [])); await new Promise((z) => setTimeout(z, kb * 8 / (mbit * 1e6) * 1000)); return r; },
    first: async (c) => { const r = await st.all(); const row = (r.results || [])[0]; return row == null ? null : c ? row[c] ?? null : row; } }); return wrap(s); };
  const { default: worker } = await import(root + "/src/index.js");
  let C = null; try { C = await import(root + "/src/mcp_cache.js"); } catch (_) { /* base code: no cache module */ }
  let U = null; try { U = await import(root + "/src/ui_screens.js"); } catch (_) {}
  const pargs = prime === "PRIME" ? { screen_id: "000000000000" } : E.argsFor(tool, prime);
  // base code (no src/mcp_cache.js): there is no colo cache, so "colo" = a fresh isolate = cold
  if (sc === "isolate" || (sc === "colo" && C)) await E.callTool(worker, env, tool, pargs);
  if (sc === "colo" && C) { C._memClear(); if (U && U.uiIndexReset) U.uiIndexReset(); }
  const n0 = dbStats.n, r0 = r2Stats.n; let atResp = 0;
  const r = await E.callTool(worker, env, tool, E.argsFor(tool, query), { onResponse: () => { atResp = dbStats.n - n0; } });
  parentPort.postMessage({ ms: Math.round(r.ms), d1: atResp, d1_all: dbStats.n - n0, r2: r2Stats.n - r0, ok: !!(r.result && !r.result.isError) });
}
