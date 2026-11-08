#!/usr/bin/env node
// mcp-gap-r2 (9-Nov-2026): pages and MCP answers for the 10 r2 patterns (320 rows), the museum hint, the synonyms, generic-word
// weighting and the annual-report zero text.
//   node tests/gap2_routes.mjs http://127.0.0.1:8927/inspiration          local Worker from tests/gap2_local_e2e.sh (seeded design rows)
//   node tests/gap2_routes.mjs https://madegooddesigns.com/inspiration --live   read-only live checks (skips the seeded-row checks)
import { readFileSync } from "node:fs";
const BASE = process.argv[2].replace(/\/$/, ""), LIVE = process.argv.includes("--live"); let id = 1, fails = 0, n = 0;
const SEO = readFileSync(new URL("../src/ui_seo.js", import.meta.url), "utf8");
export const NEW = ["payroll", "timesheet", "invoice-list", "first-run", "media-library", "subscriptions-admin", "upgrade-preview", "plan-checkout", "compact-header", "loyalty-card"];
const slugOf = (p) => (SEO.match(new RegExp(`"${p}": \\["([a-z0-9-]+)"`)) || [])[1];
const ok = (c, msg) => { n++; if (!c) { fails++; console.log("FAIL", msg); } };
const H = { "User-Agent": "curl/8.4.0", Accept: "*/*" };
const get = async (p) => { const r = await fetch(p.startsWith("http") ? p : BASE + p, { redirect: "manual", headers: H }); return { s: r.status, h: r.headers, t: await r.text() }; };
const call = async (name, args) => {
  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetch(`${BASE}/mcp`, { method: "POST", headers: { ...H, "Content-Type": "application/json", Accept: "application/json, text/event-stream" },
        body: JSON.stringify({ jsonrpc: "2.0", id: id++, method: "tools/call", params: { name, arguments: args } }) });
      const j = await r.json(); return j.result.content.map((c) => c.text || "").join("\n");
    } catch (e) { if (i === 2) throw e; await new Promise((res) => setTimeout(res, 2000 * (i + 1))); }
  }
};

for (const p of NEW) {
  const slug = slugOf(p); ok(!!slug, `${p} slug`); if (!slug) continue;
  const pg = await get(`/ui/${slug}`);
  ok(pg.s === 200, `/ui/${slug} ${pg.s}`);
  ok(pg.t.includes("32 examples"), `/ui/${slug} has 32 examples`);
  ok(/"@type":"FAQPage"/.test(pg.t), `/ui/${slug} FAQ schema`);
  ok((await get(`/ui/${p}`)).s === 301 || slug === p, `/ui/${p} old id 301`);
  const item = (pg.t.match(new RegExp(`href="(/inspiration/ui/${p}-[a-z-]*(?:web|mobile)-minimal-[0-9a-f]{12})"`)) || [])[1];
  ok(!!item, `${p}: minimal item link`); if (!item) continue;
  const it = await get(item.replace("/inspiration", ""));
  ok(it.s === 200, `${item} ${it.s}`);
  ok(it.t.includes('class="spec"') && it.t.includes("<dt>Colours (light)</dt>") && it.t.includes("<dt>Fonts</dt>"), `${p}: spec block`);
  const raw = await get(`/ui/raw/${item.slice(-12)}.html`);
  ok(raw.s === 200 && raw.t.includes("UI by Made Good Designs"), `${p}: raw HTML with credit`);
  const md = await get(`/ui/raw/${item.slice(-12)}.md`);
  ok(md.s === 200 && /^#/m.test(md.t) && /dark/i.test(md.t), `${p}: DESIGN.md (with dark tokens)`);
}
const sm = await get("/ui/sitemap.xml");
ok(NEW.every((p) => sm.t.includes(`/ui/${slugOf(p)}</loc>`)), "sitemap lists all 10 pattern pages");
const lp = await call("list_ui_patterns", {});
ok(NEW.every((p) => lp.includes(p)), "list_ui_patterns names all 10");

// the real gap queries (7 days to 9-Nov) and synonym phrasings: [query, a pattern that must be listed, minimum screens, must be first?]
// Minimums are for the local Worker (only the r2 rows + a few neighbours); live answers have more rows to fill with.
for (const [q, want, min, first] of [
  ["payroll", "payroll", 2, true], ["timesheet", "timesheet", 2, true], ["invoices list table with status, simple small business billing", "invoice-list", 2, true],
  ["empty state first run checklist", "first-run", 2, true], ["delete confirmation dialog with image preview", "media-library", 2, false],
  ["admin subscription management subscribers table filter", "subscriptions-admin", 2, true], ["premium upgrade benefit feature preview", "upgrade-preview", 2, true],
  ["minimal dark subscription billing plan checkout", "plan-checkout", 2, false], ["compact logo badge dark header", "compact-header", 2, true],
  ["loyalty stamp card wallet pass on phone", "loyalty-card", 2, true], ["media library image picker gallery modal", "media-library", 2, true],
  // synonyms
  ["salary slip", "payroll", 2, true], ["employee pay stub", "payroll", 2, true], ["time tracking weekly hours", "timesheet", 2, true],
  ["clock in clock out", "timesheet", 2, true], ["zero state", "empty-state", 2, false], ["blank slate new project", "first-run", 2, false],
  ["rewards stamp card", "loyalty-card", 2, true]]) {
  const t = await call("search_ui_screens", { query: q });
  const cnt = +(t.match(/^(\d+) UI screen/m) || [])[1] || 0, top = (t.match(/(?:^\s+|· )pattern: ([a-z0-9-]+)/m) || [])[1];
  ok(t.includes(`pattern: ${want}`) && cnt >= min && (!first || top === want), `search "${q}": ${want} ${first ? "first" : "listed"} (top ${top}), ${cnt} >= ${min}`);
}
// (a) museum hint as the next step; not on UI requests
const MH = "Next step: this looks like an art-history search.";
const u1 = await call("search_ui_screens", { query: "ukiyo-e" });
ok(u1.includes(MH) && u1.includes('search_museum_art(query="ukiyo-e")'), "UI search 'ukiyo-e' ends with the museum next step");
const u2 = await call("search_ui_screens", { query: "Bauhaus poster" });
ok(u2.includes(MH) && !u2.includes("Next step: get_ui_screen_code"), "UI search 'Bauhaus poster': museum next step replaces the screen-code one");
const u3 = await call("search_ui_screens", { query: "art deco hotel website hero" });
ok(!u3.includes(MH), "UI search 'art deco hotel website hero': no museum hint");
const d1 = await call("search_design_inspiration", { query: "Greek vase" });
ok(d1.includes(MH) && d1.includes('search_museum_art(query="Greek vase")'), "design search 'Greek vase' gets the museum next step");
const d2 = await call("search_design_inspiration", { query: "art deco logo" });
ok(!d2.includes(MH), "design search 'art deco logo': no museum hint (brand work)");
// (3) annual-report brand zero: explains the archive and points to the brand tools; no "we fill gaps in 1-2 days" promise
const a1 = await call("search_annual_reports", { query: "Xerox" });
ok(/^0 annual-report result/.test(a1) && a1.includes("public domain or openly licensed") && a1.includes("get_brand_typeface(") && a1.includes("search_design_inspiration(") && !a1.includes("fill gaps"), "annual-report zero 'Xerox': archive scope + brand tools, no fill-gaps note");
const u4 = await call("search_ui_screens", { query: "zzqx flurb" });
ok(u4.includes("we usually fill gaps"), "UI zeros keep the fill-gaps note");
// (c) generic words (seeded design rows, local only)
if (!LIVE) {
  const g = await call("search_design_inspiration", { query: "modern minimal jazz poster" });
  const firstTitle = (g.match(/^• (.+)$/m) || [])[1] || "";
  ok(/jazz/i.test(firstTitle), `generic words count less: 'modern minimal jazz poster' leads with a jazz poster (got "${firstTitle}")`);
  const g2 = await call("search_design_inspiration", { query: "modern minimal" });
  ok(/^\d+ design-inspiration result/.test(g2) && !/^0 /.test(g2), "only generic words still search normally");
} else console.log("note: generic-word checks need the seeded local rows; skipped live");
console.log(`\n${n - fails}/${n} checks passed`);
process.exit(fails ? 1 : 0);
