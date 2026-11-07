#!/usr/bin/env node
// Local replay of real search_ui_screens queries (mcp-gap-r1, 8-Nov-2026): same fake D1 as run.mjs, so it runs the real
// callUiTool code on a row dump. Prints, per query, the count from the answer header and the distinct patterns.
//   node --import ./tests/ui_rank/register.mjs tests/ui_rank/replay_real.mjs --queries q.json [--rows rows.json] [--json out.json]
// q.json = [{q, n, people}] (distinct real queries, read-only SELECT on mcp_calls). Counts: "N UI screen(s)" header; an honest
// "No screen in the library matches" answer counts as 0.
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const HERE = path.dirname(fileURLToPath(import.meta.url)), ROOT = path.resolve(HERE, "../..");
const args = process.argv.slice(2), val = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const rows = JSON.parse(readFileSync(path.resolve(val("--rows", path.join(HERE, ".cache/rows.json"))), "utf8"));
const Q = JSON.parse(readFileSync(path.resolve(val("--queries")), "utf8"));
const { callUiTool, uiFields } = await import(path.join(ROOT, "src/ui_screens.js"));
const safeArr = (s) => { try { const v = JSON.parse(s || "[]"); return Array.isArray(v) ? v : []; } catch (_) { return []; } };
const rowToItem = (r) => ({ id: r.id, title: r.title || "", description: r.description || "", image: `/img/${r.image_key}`, width: r.width, height: r.height,
  tags: safeArr(r.tags), themes: [], palette: safeArr(r.palette), style: r.style, collection: "ui", category: r.category, created_at: r.created_at, ...uiFields(r) });
const stmt = (sql) => ({ bind() { return this; }, all: async () => ({ results: /FROM items/.test(sql) ? rows : [] }), first: async () => null });
const env = { DB: { prepare: stmt } };
const h = { site: "https://madegooddesigns.com/inspiration", rowToItem, clampInt: (v, d, lo, hi) => { const n = parseInt(v, 10); return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : d; },
  mcpSearchRows: async () => ({ rows: [], note: "" }) };
const out = [];
for (const r of Q) {
  const text = (await callUiTool("search_ui_screens", { query: r.q }, env, h)).content.filter((c) => c.type === "text").map((c) => c.text).join("\n");
  const m = text.match(/^(\d+) UI screen/m);
  const none = /No screen (in the library )?(matches|has)/m.test(text);
  const n = none ? 0 : m ? +m[1] : null;
  const distinct = [...new Set([...text.matchAll(/(?:^\s+|· )pattern: ([a-z0-9-]+)/gm)].map((x) => x[1]))];
  out.push({ q: r.q, people: r.people, count: n, head: text.split("\n")[0].slice(0, 160), distinct });
}
if (val("--json")) writeFileSync(val("--json"), JSON.stringify(out, null, 1));
for (const o of out) console.log(`${String(o.count).padStart(4)}  ${o.q.slice(0, 90)}  [${o.distinct.slice(0, 4).join(", ")}]`);
