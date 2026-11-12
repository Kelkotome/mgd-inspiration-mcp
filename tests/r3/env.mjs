// MCP r3 (12-Nov-2026) test environment: run the Worker's fetch() in Node against a LOCAL SQLite copy of the live D1 (read-only
// SELECT copy in tests/r3/.data/live.sqlite, gitignored; see mcp-r3.md), with
//   - a D1 shim (node:sqlite) that counts statements and can add a simulated round trip per statement (rtt ms),
//   - an R2 shim (BUCKET.get) that serves deterministic text for ui/<id>/index.html|DESIGN.md (and nothing else) after r2rtt ms,
//   - a caches.default shim (Cache API) with a small simulated latency, and ctx.waitUntil that collects the deferred promises.
// Writes (mcp_calls, mcp_events, moodboards…) go to TEMP tables on the connection, so the copy is never changed.
import { DatabaseSync } from "node:sqlite";
import { existsSync } from "node:fs";

export const DATA = new URL("./.data/live.sqlite", import.meta.url).pathname;
const sleep = (ms) => (ms > 0 ? new Promise((r) => setTimeout(r, ms)) : Promise.resolve());

export function openDb(path = DATA) {
  if (!existsSync(path)) throw new Error(`no local D1 copy at ${path} (see mcp-r3.md, "Local D1 copy")`);
  const db = new DatabaseSync(path, { readOnly: false });
  db.exec(`CREATE TEMP TABLE IF NOT EXISTS mcp_calls (id TEXT PRIMARY KEY, tool TEXT, query TEXT, ip TEXT, ua TEXT, created_at INTEGER, user_id TEXT, client_id TEXT);
    CREATE TEMP TABLE IF NOT EXISTS mcp_events (id TEXT PRIMARY KEY, created_at INTEGER NOT NULL, endpoint TEXT, kind TEXT, session_id TEXT, client_name TEXT,
      client_version TEXT, protocol TEXT, visitor TEXT, ua TEXT, country TEXT, tool TEXT, ok INTEGER, zero INTEGER, ms INTEGER, bot INTEGER, err TEXT);
    CREATE TEMP TABLE IF NOT EXISTS mcp_moodboards (id TEXT PRIMARY KEY, edit_hash TEXT, title TEXT, notes TEXT, items TEXT, ip_hash TEXT, created_at INTEGER, updated_at INTEGER, reports INTEGER, disabled INTEGER);`);
  return db;
}

// D1-compatible subset: prepare().bind().all()/first(col)/run()/raw(), batch(). stats: per statement {sql, ms}.
export function d1(db, opt = {}) {
  const stats = opt.stats || { n: 0, writes: 0, sql: [] };
  const norm = (v) => (v === undefined ? null : typeof v === "boolean" ? (v ? 1 : 0) : v);
  const exec = async (sql, b, kind) => {
    stats.n++; if (/^\s*(INSERT|UPDATE|DELETE)/i.test(sql)) stats.writes++;
    stats.sql.push(sql.replace(/\s+/g, " ").slice(0, 160));
    await sleep(opt.rtt || 0);
    // Live D1 plans the FTS join FTS-first (EXPLAIN QUERY PLAN on 12-Nov: SCAN items_fts, then items by rowid); the local SQLite
    // 3.51 planner scans items first and runs the MATCH per row (~10 s a query). CROSS JOIN pins the live order; same rows, same ORDER BY.
    const st = db.prepare(sql.replace("FROM items_fts JOIN items ON", "FROM items_fts CROSS JOIN items ON"));
    if (kind === "run") { const r = st.run(...b.map(norm)); return { success: true, meta: { changes: Number(r.changes), last_row_id: Number(r.lastInsertRowid) } }; }
    if (kind === "raw") { st.setReturnArrays?.(true); return st.all(...b.map(norm)); }
    const rows = st.all(...b.map(norm)).map((r) => ({ ...r }));
    return { success: true, results: rows, meta: {} };
  };
  const stmt = (sql, b = []) => ({
    bind: (...args) => stmt(sql, args),
    all: () => exec(sql, b, "all"),
    first: async (col) => { const r = (await exec(sql, b, "all")).results[0]; return r == null ? null : col ? (r[col] ?? null) : r; },
    run: () => exec(sql, b, "run"),
    raw: () => exec(sql, b, "raw"),
  });
  return { prepare: (sql) => stmt(sql), batch: async (list) => { const out = []; for (const s of list) out.push(await s.all()); return out; }, stats };
}

export function bucket(opt = {}) {
  const stats = opt.stats || { n: 0 };
  return {
    stats,
    async get(key) {
      stats.n++; await sleep(opt.r2rtt || 0);
      const m = String(key).match(/^ui\/([0-9a-f]{12})\/(index\.html|DESIGN\.md|spec\.json)$/);
      if (!m || (opt.missing && opt.missing.has(m[1]))) return null;
      const body = m[2] === "index.html" ? `<!doctype html><html><head><!-- Made Good Designs UI screen ${m[1]} --><title>${m[1]}</title></head><body><h1>Screen ${m[1]}</h1><button>Continue</button></body></html>`
        : m[2] === "DESIGN.md" ? `---\nname: Screen ${m[1]}\n---\n# DESIGN.md for ${m[1]}\n` : "{}";
      return { text: async () => body, arrayBuffer: async () => new TextEncoder().encode(body).buffer };
    },
    async put() {}, async delete() {}, async head() { return null; },
  };
}

// caches.default shim: stores the body text; honours nothing else (the cache module checks its own TTL from the stored load time).
export function cacheShim(opt = {}) {
  const store = new Map(), stats = { match: 0, hit: 0, put: 0, del: 0 };
  const k = (u) => (typeof u === "string" ? u : u.url);
  return {
    store, stats,
    default: {
      async match(u) { stats.match++; await sleep(opt.lat || 0); const v = store.get(k(u)); if (v == null) return undefined; stats.hit++; return new Response(v, { headers: { "Content-Type": "application/json" } }); },
      async put(u, resp) { stats.put++; await sleep(opt.lat || 0); store.set(k(u), await resp.text()); },
      async delete(u) { stats.del++; return store.delete(k(u)); },
    },
  };
}

export function makeEnv(db, opt = {}) {
  const dbStats = { n: 0, writes: 0, sql: [] }, r2Stats = { n: 0 };
  const env = {
    DB: d1(db, { rtt: opt.rtt, stats: dbStats }), BUCKET: bucket({ r2rtt: opt.r2rtt, stats: r2Stats, missing: opt.missing }),
    BASE_PATH: "/inspiration", ALLOWED_ORIGIN: "https://madegooddesigns.com", PUBLIC_ORIGIN: "https://madegooddesigns.com",
    MCP_HASH_SALT: "r3-test", ...(opt.vars || {}),
  };
  if (opt.version) env.CF_VERSION_METADATA = { id: opt.version, tag: "", timestamp: "" };
  return { env, dbStats, r2Stats };
}
export function makeCtx() {
  const pending = [];
  return { ctx: { waitUntil: (p) => pending.push(p), passThroughOnException() {} }, flush: () => Promise.allSettled(pending.splice(0)) };
}

let RPC = 0;
// One tools/call through the Worker's fetch(); returns { result, ms } (ms = until the response; deferred writes are flushed after).
export async function callTool(worker, env, name, args, opt = {}) {
  const { ctx, flush } = makeCtx();
  const body = JSON.stringify({ jsonrpc: "2.0", id: ++RPC, method: "tools/call", params: { name, arguments: args || {} } });
  const req = new Request("https://madegooddesigns.com/inspiration/mcp", { method: "POST", body,
    headers: { "Content-Type": "application/json", Accept: "application/json, text/event-stream", "User-Agent": opt.ua || "r3-harness", "CF-Connecting-IP": "127.0.0.9" } });
  const t0 = performance.now();
  const res = await worker.fetch(req, env, opt.noCtx ? undefined : ctx);
  const j = await res.json();
  const ms = performance.now() - t0;
  if (opt.onResponse) opt.onResponse();
  await flush();
  return { result: j.result, error: j.error, ms };
}
export async function rpc(worker, env, method, params) {
  const { ctx, flush } = makeCtx();
  const req = new Request("https://madegooddesigns.com/inspiration/mcp", { method: "POST", body: JSON.stringify({ jsonrpc: "2.0", id: ++RPC, method, params: params || {} }),
    headers: { "Content-Type": "application/json", Accept: "application/json, text/event-stream", "User-Agent": "r3-harness" } });
  const res = await worker.fetch(req, env, ctx); const txt = await res.text(); await flush();
  return { json: txt ? JSON.parse(txt) : null, bytes: Buffer.byteLength(txt) };
}

// The 7-day real queries (tests/mcp_r3_queries.json: tool + logged query text) → tool arguments.
export function argsFor(tool, q) {
  q = q == null ? "" : String(q);
  let j = null; if (q.startsWith("{")) { try { j = JSON.parse(q); } catch (_) {} }
  if (j && typeof j === "object") return j;
  switch (tool) {
    case "get_font_pairing": return { font: q };
    case "get_ui_screen_code": return { screen_id: q };
    case "browse_inspiration_by_theme": return { theme: q };
    case "get_brand_typeface": return { brands: q.split(/\s*,\s*/).filter(Boolean) };
    case "get_ui_flow": return { flow: q };
    case "list_ui_patterns": return q ? { kind: q } : {};
    case "list_inspiration_themes": return {};
    case "design_md_from_references": return { query: q };
    default: return { query: q };
  }
}
