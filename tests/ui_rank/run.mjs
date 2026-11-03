#!/usr/bin/env node
// search_ui_screens ranking regression test.
//   node --import ./tests/ui_rank/register.mjs tests/ui_rank/run.mjs            local: real callUiTool code + a read-only dump of the live rows
//   ... run.mjs --refresh                                                      re-dump rows (wrangler d1 execute --remote, SELECT only)
//   ... run.mjs --live [https://madegooddesigns.com/inspiration/mcp]           against the deployed MCP (POST tools/call)
//   flags: --verbose (print every case), --json out.json (machine-readable results), --min 0.9 (exit 1 below this hit rate)
// A case passes when the FIRST result's pattern is one of the expected patterns, or, when "none" is expected,
// the answer honestly says nothing matches (old code: "0 UI screen(s)").
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../..");
const args = process.argv.slice(2);
const flag = (k) => args.includes(k);
const val = (k, d) => { const i = args.indexOf(k); return i >= 0 && args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : d; };
const LIVE = flag("--live") ? val("--live", "https://madegooddesigns.com/inspiration/mcp") : null;

const cases = readFileSync(path.join(HERE, "cases.txt"), "utf8").split("\n").filter((l) => l.trim() && !l.startsWith("#")).map((l) => {
  const [q, exp, extra] = l.split("|").map((s) => (s || "").trim());
  const a = { query: q };
  for (const kv of (extra || "").split(/\s+/).filter(Boolean)) { const [k, v] = kv.split("="); a[k] = v; }
  return { q, args: a, expect: exp.split(/\s+/).filter(Boolean) };
});

let call;
if (LIVE) {
  let n = 0;
  call = async (a) => {
    const res = await fetch(LIVE, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json, text/event-stream", "User-Agent": "curl/8.4.0" },
      body: JSON.stringify({ jsonrpc: "2.0", id: ++n, method: "tools/call", params: { name: "search_ui_screens", arguments: a } }) });
    const j = await res.json();
    if (j.error) return `ERROR ${JSON.stringify(j.error)}`;
    return (j.result.content || []).filter((c) => c.type === "text").map((c) => c.text).join("\n");
  };
} else {
  const cache = path.join(HERE, ".cache"), file = path.join(cache, "rows.json");
  if (flag("--refresh") || !existsSync(file)) {
    mkdirSync(cache, { recursive: true });
    console.error("dumping published UI rows (read-only SELECT on remote D1)…");
    const sql = "SELECT * FROM items WHERE collection='ui' AND status='published' AND owner_id IS NULL";
    const out = execSync(`npx wrangler d1 execute mgd-inspiration --remote --json --command "${sql}"`, { cwd: ROOT, maxBuffer: 1 << 28, stdio: ["ignore", "pipe", "inherit"] }).toString();
    writeFileSync(file, JSON.stringify(JSON.parse(out)[0].results));
  }
  const rows = JSON.parse(readFileSync(file, "utf8"));
  const { callUiTool } = await import(path.join(ROOT, "src/ui_screens.js"));
  const safeArr = (s) => { try { const v = JSON.parse(s || "[]"); return Array.isArray(v) ? v : []; } catch (_) { return []; } };
  const { uiFields } = await import(path.join(ROOT, "src/ui_screens.js"));
  const rowToItem = (r) => ({ id: r.id, title: r.title || "", description: r.description || "", image: `/img/${r.image_key}`, width: r.width, height: r.height,
    tags: safeArr(r.tags), themes: [], palette: safeArr(r.palette), style: r.style, collection: "ui", category: r.category, created_at: r.created_at, ...uiFields(r) });
  // Fake D1: the UI search loads every published UI row once; anything else gets an empty answer.
  const stmt = (sql) => ({ bind() { return this; }, all: async () => ({ results: /FROM items/.test(sql) ? rows : [] }), first: async () => null });
  const env = { DB: { prepare: stmt } };
  const h = { site: "https://madegooddesigns.com/inspiration", rowToItem, clampInt: (v, d, lo, hi) => { const n = parseInt(v, 10); return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : d; },
    mcpSearchRows: async () => ({ rows: [], note: "" }) };
  call = async (a) => (await callUiTool("search_ui_screens", a, env, h)).content.map((c) => c.text).join("\n");
}

const NONE_RE = /^0 UI screen\(s\)|No screen (in the library )?matches/m;
const results = [];
let pass = 0, chars = 0;
for (const c of cases) {
  const text = await call(c.args);
  chars += text.length;
  const top = (text.match(/pattern: ([a-z0-9-]+)/) || [])[1] || null;
  const none = NONE_RE.test(text);
  const ok = none ? c.expect.includes("none") : !!top && c.expect.includes(top);
  if (ok) pass++;
  const distinct = [...new Set([...text.matchAll(/pattern: ([a-z0-9-]+)/g)].map((m) => m[1]))];
  results.push({ q: c.q, args: c.args, expect: c.expect, got: none ? "none" : top, ok, distinct, chars: text.length });
  if (flag("--verbose") || !ok) console.log(`${ok ? "PASS" : "FAIL"}  ${c.q}${Object.keys(c.args).length > 1 ? " " + JSON.stringify({ ...c.args, query: undefined }) : ""}\n      expect ${c.expect.join("|")}  got ${none ? "none" : top}  [${distinct.join(", ")}]`);
}
const secA = results.slice(0, 89), secA_pass = secA.filter((r) => r.ok).length;
const rate = pass / cases.length;
console.log(`\n${LIVE ? "LIVE " + LIVE : "LOCAL (src/ui_screens.js)"}: ${pass}/${cases.length} = ${(rate * 100).toFixed(1)}% hit@1  ·  real-log queries ${secA_pass}/${secA.length} = ${(secA_pass / secA.length * 100).toFixed(1)}%  ·  avg ${Math.round(chars / cases.length)} chars/answer  ·  avg distinct patterns ${(results.reduce((s, r) => s + r.distinct.length, 0) / results.length).toFixed(1)}`);
if (val("--json")) writeFileSync(val("--json"), JSON.stringify(results, null, 1));
const min = parseFloat(val("--min", "0"));
if (rate < min) process.exit(1);
