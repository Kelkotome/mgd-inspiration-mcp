#!/usr/bin/env node
// mcp-gap-r1 (8-Nov-2026): pages and MCP answers against a LOCAL Worker with the 896 gap rows ingested (tests/gap_local_e2e.sh).
// usage: node tests/gap_routes.mjs http://127.0.0.1:8917/inspiration
import { readFileSync } from "node:fs";
const BASE = process.argv[2].replace(/\/$/, ""); let id = 1, fails = 0, n = 0;
const SEO = readFileSync(new URL("../src/ui_seo.js", import.meta.url), "utf8");
const NEW = ["music-home", "album-page", "play-queue", "story-viewer", "photo-post", "post-composer", "barcode-scanner", "skincare-routine",
  "image-editor", "document-editor", "sales-pipeline", "sprint-board", "project-timeline", "approval-request", "diff-viewer", "release-notes",
  "stock-count", "purchase-order", "subscription-billing", "usage-pricing", "payment-methods", "habit-tracker", "language-lesson", "leaderboard",
  "delete-confirm", "celebration", "integration-connect", "model-providers"];
const slugOf = (p) => (SEO.match(new RegExp(`"${p}": \\["([a-z0-9-]+)"`)) || [])[1];
const ok = (c, msg) => { n++; if (!c) { fails++; console.log("FAIL", msg); } };
const get = async (p) => { const r = await fetch(p.startsWith("http") ? p : BASE + p, { redirect: "manual", headers: { "User-Agent": "curl/8.4.0", Accept: "*/*" } }); return { s: r.status, h: r.headers, t: await r.text() }; };
const call = async (name, args) => { const r = await fetch(`${BASE}/mcp`, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json, text/event-stream", "User-Agent": "curl/8.4.0" }, body: JSON.stringify({ jsonrpc: "2.0", id: id++, method: "tools/call", params: { name, arguments: args } }) }); const j = await r.json(); return j.result.content.map((c) => c.text || "").join("\n"); };

for (const p of NEW) {
  const slug = slugOf(p); ok(!!slug, `${p} slug`); if (!slug) continue;
  const pg = await get(`/ui/${slug}`);
  ok(pg.s === 200, `/ui/${slug} ${pg.s}`);
  ok(pg.t.includes("32 examples"), `/ui/${slug} has 32 examples`);
  ok(/"@type":"FAQPage"/.test(pg.t), `/ui/${slug} FAQ schema`);
  ok((await get(`/ui/${p}`)).s === 301, `/ui/${p} old id 301`);
  const item = (pg.t.match(new RegExp(`href="(/inspiration/ui/${p}-[a-z-]*web-minimal-[0-9a-f]{12})"`)) || [])[1];
  ok(!!item, `${p}: web minimal item link`); if (!item) continue;
  const it = await get(item.replace("/inspiration", ""));
  ok(it.s === 200, `${item} ${it.s}`);
  ok(it.t.includes('class="spec"') && it.t.includes("<dt>Colours (light)</dt>") && it.t.includes("<dt>Fonts</dt>") && it.t.includes("<dt>Light and dark</dt>") && !it.t.includes("<dt>Keyboard</dt>"), `${p}: spec block (screens: no Responsive line, no breakpoints)`);
  const raw = await get(`/ui/raw/${item.slice(-12)}.html`);
  ok(raw.s === 200 && raw.t.includes("UI by Made Good Designs"), `${p}: raw HTML with credit`);
  const md = await get(`/ui/raw/${item.slice(-12)}.md`);
  ok(md.s === 200 && /^#/m.test(md.t), `${p}: DESIGN.md`);
}
const sm = await get("/ui/sitemap.xml");
ok(NEW.every((p) => sm.t.includes(`/ui/${slugOf(p)}</loc>`)), "sitemap lists all 28 pattern pages");
const lp = await call("list_ui_patterns", {});
ok(NEW.every((p) => lp.includes(p)), "list_ui_patterns names all 28");
// real queries that got 1-2 screens on 7-Nov
for (const [q, want, min] of [["music player now playing", "play-queue", 4], ["kanban board full height columns", "sprint-board", 4], ["create photo post", "post-composer", 4],
  ["approval queue pending requests approve reject", "approval-request", 3], ["receive stock count quantities expected vs counted", "stock-count", 4],
  ["destructive confirm dialog", "delete-confirm", 3], ["ai model settings with provider api keys and usage", "model-providers", 3]]) {
  const t = await call("search_ui_screens", { query: q });
  const cnt = +(t.match(/^(\d+) UI screen/m) || [])[1];
  ok(t.includes(`pattern: ${want}`) && cnt >= min, `search "${q}": ${want} listed, ${cnt} >= ${min}`);
}
const both = await call("search_ui_screens", { query: "kanban pipeline board" });
ok(/· web ·/.test(both) && /· mobile ·/.test(both), "backfill: web and mobile versions both listed when distinct screens run short");
// wrong-tool hint on design search (no design rows locally: the hint still leads the zero answer)
const d = await call("search_design_inspiration", { query: "billing settings dashboard data table saas" });
ok(d.startsWith('Looking for app or website screens? search_ui_screens(query="billing settings dashboard data table saas")'), "design search with UI words leads with the hint");
const d2 = await call("search_design_inspiration", { query: "table setting photography" });
ok(!d2.includes("Looking for app or website screens?"), "graphic query: no hint");
console.log(`\n${n - fails}/${n} checks passed`);
process.exit(fails ? 1 : 0);
