// MCP r3 (12-Nov-2026): cache for the slow-changing data behind the MCP tools, so a tool call needs fewer D1 round trips.
// Profiled on a local copy of the live D1 (mcp-r3.md): a call's time is mostly D1 round trips from the caller's colo to the D1
// primary in APAC (~0.2 s each from the US or Europe), not SQL time. Per-query search results are NOT cached (only ~4–10 % of
// queries repeat exactly); what is cached is the same for every caller:
//   - shared(): named data sets (UI screen rows for search/flows/patterns, theme counts, newest items per theme, FTS presence,
//     museum category checks). Two levels: module memory (per isolate) and the colo's Cache API (caches.default).
//   - exact(): deterministic by-ID answers (get_ui_screen_code by screen_id + format, get_font_pairing by font).
// Rules: a loader that throws is never cached; an empty value is never cached; every key carries MCP_CACHE_VERSION plus the
// deployed Worker version (CF_VERSION_METADATA, wrangler.jsonc), so each deploy starts with fresh keys and new content is not hidden
// longer than one TTL. env.MCP_CACHE = "0" turns every cache off (tests compare cached against uncached; also a kill switch).
export const MCP_CACHE_VERSION = "r3-1";   // bump by hand to invalidate every entry without a data change
const CACHE_ORIGIN = "https://madegooddesigns.com/inspiration/mcp/_cache";   // on the zone, so a /inspiration/mcp purge reaches it
const MEM = new Map();                      // key -> { at (load time, ms), exp (ms), val }
const MEM_MAX = 400;                        // exact() entries are many and small; shared() entries are few and large
export const CACHE_STATS = { mem: 0, edge: 0, load: 0, skip: 0, put: 0 };

export function cacheVersion(env) {
  const v = env && env.CF_VERSION_METADATA && env.CF_VERSION_METADATA.id;
  return MCP_CACHE_VERSION + "." + String(v || "dev").replace(/[^a-zA-Z0-9-]/g, "").slice(0, 40);
}
export const cacheOff = (env) => !!env && String(env.MCP_CACHE || "") === "0";
// "empty" = nothing worth keeping: null/undefined, [], {}, an MCP result with isError or no text. Such values are returned but never stored.
export function isEmptyValue(v) {
  if (v == null || v === false) return true;
  if (Array.isArray(v)) return v.length === 0;
  if (typeof v === "object") {
    if ("content" in v) return !!v.isError || !Array.isArray(v.content) || !v.content.some((c) => c && c.type === "text" && String(c.text || "").trim());
    return Object.keys(v).length === 0;
  }
  return v === "";
}
function edge() { try { return typeof caches !== "undefined" && caches && caches.default ? caches.default : null; } catch (_) { return null; } }
const keyUrl = (ver, name) => `${CACHE_ORIGIN}/${encodeURIComponent(ver)}/${encodeURIComponent(name)}`;
function memGet(k, now) {
  const m = MEM.get(k);
  if (!m) return undefined;
  if (now >= m.exp) { MEM.delete(k); return undefined; }
  MEM.delete(k); MEM.set(k, m);   // LRU: most recently used last
  return m.val;
}
function memSet(k, val, at, exp) {
  MEM.set(k, { at, exp, val });
  while (MEM.size > MEM_MAX) MEM.delete(MEM.keys().next().value);
}

// shared(env, name, ttlSec, loader, opts): the cached value, else loader() (stored unless empty). opts.edge=false keeps it in memory
// only; opts.keep(val) = false also skips storing (e.g. a "0 results" answer or a screen whose HTML was missing).
export async function shared(env, name, ttlSec, loader, opts = {}) {
  if (cacheOff(env)) { CACHE_STATS.skip++; return loader(); }
  const ver = cacheVersion(env), k = ver + "|" + name, now = Date.now();
  const hit = memGet(k, now);
  if (hit !== undefined) { CACHE_STATS.mem++; return hit; }
  const c = opts.edge === false ? null : edge();
  if (c) {
    try {
      const r = await c.match(keyUrl(ver, name));
      if (r) {
        const box = await r.json();
        if (box && typeof box.at === "number" && now - box.at < ttlSec * 1000 && !isEmptyValue(box.val) && (!opts.keep || opts.keep(box.val))) {
          CACHE_STATS.edge++; memSet(k, box.val, box.at, box.at + ttlSec * 1000); return box.val;
        }
      }
    } catch (_) { /* a cache read error is a miss */ }
  }
  const val = await loader();          // throws → nothing stored, the caller handles the error as before
  CACHE_STATS.load++;
  if (isEmptyValue(val) || (opts.keep && !opts.keep(val))) return val;
  memSet(k, val, now, now + ttlSec * 1000);
  if (c) {
    try {
      await c.put(keyUrl(ver, name), new Response(JSON.stringify({ at: now, val }), {
        headers: { "Content-Type": "application/json", "Cache-Control": `public, max-age=${ttlSec}, s-maxage=${ttlSec}` } }));
      CACHE_STATS.put++;
    } catch (_) { /* a cache write error only costs the next caller a reload */ }
  }
  return val;
}

// exact(): same as shared(), but the stored value is handed out as a deep copy (callers add UTM tags, next steps etc. in place).
export async function exact(env, name, ttlSec, loader, opts = {}) {
  const v = await shared(env, name, ttlSec, loader, opts);
  return v == null || typeof v !== "object" ? v : structuredClone(v);
}

// In-colo invalidation after an admin write to items (the ingest), so the colo that ran the ingest (and the live checks that
// follow it) sees new rows at once. Other colos see them after one TTL, or at once after the next deploy (new version key).
export async function dropShared(env, names) {
  const ver = cacheVersion(env), c = edge();
  for (const n of names) {
    MEM.delete(ver + "|" + n);
    if (c) { try { await c.delete(keyUrl(ver, n)); } catch (_) {} }
  }
}
export function _memClear() { MEM.clear(); for (const k of Object.keys(CACHE_STATS)) CACHE_STATS[k] = 0; }   // tests only
