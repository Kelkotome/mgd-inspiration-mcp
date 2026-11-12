// MCP r3 (12-Nov-2026): the UI web pages now read the cached UI rows (filtered in JS) instead of one D1 query per page. This renders
// the gallery, the sitemap, the flows index, every pattern page and a seeded sample of item, facet and template pages on the local
// D1 copy with the cache OFF (MCP_CACHE=0: the rows come straight from D1, as before) and ON (served from the cache), and requires
// byte-identical HTML. The page edge cache (edgeCache) is cleared before every request so each render really runs.
// Run: node --no-warnings --import=./tests/r3/register.mjs tests/test_mcp_r3_pages.mjs   (prints "N passed, M failed")
import { openDb, makeEnv, cacheShim } from "./r3/env.mjs";
const shim = cacheShim(); globalThis.caches = shim;
const { default: worker } = await import("../src/index.js");
const db = openDb();
const ON = makeEnv(db, { version: "pages-1" }), OFF = makeEnv(db, { version: "pages-1", vars: { MCP_CACHE: "0" } });
let ok = 0, fail = 0;
const t = (name, cond, info) => { cond ? ok++ : fail++; if (!cond || process.env.VERBOSE) console.log((cond ? "PASS " : "FAIL ") + name + (cond ? "" : " | " + String(info).slice(0, 300))); };
const clearPages = () => { for (const k of [...shim.store.keys()]) if (!k.includes("/inspiration/mcp/_cache/")) shim.store.delete(k); };
const get = async (env, path) => { clearPages(); const r = await worker.fetch(new Request("https://madegooddesigns.com/inspiration" + path, { headers: { "User-Agent": "r3-pages" } }), env, { waitUntil() {}, passThroughOnException() {} }); return { status: r.status, body: await r.text() }; };

const sm = await get(OFF.env, "/ui/sitemap.xml");
t("UI sitemap renders", sm.status === 200 && /<urlset/.test(sm.body), sm.status);
const urls = [...sm.body.matchAll(/<loc>https:\/\/madegooddesigns\.com\/inspiration([^<]+)<\/loc>/g)].map((m) => m[1]);
let seed = 4242; const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);
const items = urls.filter((u) => /[0-9a-f]{12}$/.test(u)), other = urls.filter((u) => !/[0-9a-f]{12}$/.test(u));
const pick = (a, n) => a.map((x) => [rnd(), x]).sort((p, q) => p[0] - q[0]).slice(0, n).map((x) => x[1]);
const paths = ["/ui", "/ui/sitemap.xml", "/ui/flows", ...other, ...pick(items, 60), "/ui/website-templates", "/ui/no-such-pattern-r3"];
let n = 0, same = 0; const bad = [];
for (const p of [...new Set(paths)]) {
  const a = await get(OFF.env, p), b = await get(ON.env, p), c = await get(ON.env, p);
  n++; if (a.status === b.status && a.body === b.body && b.body === c.body) same++; else bad.push(`${p} ${a.status}/${b.status}/${c.status}`);
}
t(`${same}/${n} UI pages byte-identical with the cache off, on (fill) and on (served) (${other.length} non-item sitemap pages + 60 item pages + gallery, flows, sitemap, 404)`, same === n, bad.slice(0, 8).join(" ; "));
// the item pages' "related" D1 scan is gone: an item page on a warm cache reads one row (its own) from D1
const it = items[0]; await get(ON.env, it); const s0 = ON.dbStats.sql.length; await get(ON.env, it);
const readsNow = ON.dbStats.sql.slice(s0).filter((q) => /^\s*SELECT/i.test(q));
t(`a UI item page on a warm cache runs ${readsNow.length} D1 read(s), none of them over all UI rows`, readsNow.every((q) => !/collection='ui'(?! AND category)/.test(q) || /id=\?/.test(q)) && readsNow.length <= 2, readsNow.join(" | "));
console.log(`${ok} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
