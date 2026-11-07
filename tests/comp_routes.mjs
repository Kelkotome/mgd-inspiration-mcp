#!/usr/bin/env node
// UI components round 1: pages and MCP answers against a LOCAL Worker that has the component rows ingested (tests/comp_local_e2e.sh).
// usage: node tests/comp_routes.mjs http://127.0.0.1:8911/inspiration
import { readFileSync } from "node:fs";
const BASE = process.argv[2].replace(/\/$/, ""); let id = 1, fails = 0, n = 0;
const META = JSON.parse(readFileSync(new URL("../src/ui_components.json", import.meta.url), "utf8"));
const SEO = readFileSync(new URL("../src/ui_seo.js", import.meta.url), "utf8");
const slugOf = (p) => (SEO.match(new RegExp(`"?${p}"?: \\["([a-z0-9-]+)"`)) || [])[1];
const ok = (c, msg) => { n++; if (!c) { fails++; console.log("FAIL", msg); } };
const get = async (p, o = {}) => { const r = await fetch(p.startsWith("http") ? p : BASE + p, { redirect: "manual", headers: { "User-Agent": "curl/8.4.0", Accept: "*/*" }, ...o }); return { s: r.status, h: r.headers, t: await r.text() }; };
const call = async (name, args) => { const r = await fetch(`${BASE}/mcp`, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json, text/event-stream", "User-Agent": "curl/8.4.0" }, body: JSON.stringify({ jsonrpc: "2.0", id: id++, method: "tools/call", params: { name, arguments: args } }) }); const j = await r.json(); return j.result.content.map((c) => c.text || "").join("\n"); };

// hub (facet) page
const hub = await get("/ui/ui-components");
ok(hub.s === 200, `/ui/ui-components ${hub.s}`);
ok(/<h1>Free UI components with HTML and CSS<\/h1>/.test(hub.t), "hub H1");
ok(/rel="canonical" href="[^"]*\/ui\/ui-components"/.test(hub.t), "hub canonical");
ok(/>208 components</.test(hub.t), "hub lists 208 components");
const gal = await get("/ui");
ok(gal.s === 200 && gal.t.includes('data-v="components"') && gal.t.includes("/ui/ui-components"), "gallery has the Components chip and facet link");
ok(/UI components<\/p><div class="pidx">/.test(gal.t), "gallery pattern index lists UI components");
ok((await get("/ui?group=components")).s === 301, "old ?group=components 301s");

for (const [p, m] of Object.entries(META)) {
  const slug = slugOf(p); ok(!!slug, `${p} slug`);
  const pg = await get(`/ui/${slug}`);
  ok(pg.s === 200, `/ui/${slug} ${pg.s}`);
  ok(pg.t.includes("16 examples"), `/ui/${slug} has 16 examples`);
  ok(/"@type":"FAQPage"/.test(pg.t), `/ui/${slug} FAQ schema`);
  ok((await get(`/ui/${p}`)).s === (slug === p ? 200 : 301), `/ui/${p} old id redirects`);
  const item = (pg.t.match(new RegExp(`href="(/inspiration/ui/${p}-web-minimal-[0-9a-f]{12})"`)) || [])[1];
  ok(!!item, `${p}: web minimal item link on pattern page`); if (!item) continue;
  const it = await get(item.replace("/inspiration", ""));
  ok(it.s === 200, `${item} ${it.s}`);
  ok(/<iframe class="demo"[^>]+sandbox="allow-scripts"[^>]+data-theme-frame/.test(it.t), `${p}: live demo iframe`);
  ok(it.t.includes('id="code-html"') && it.t.includes('id="code-css"'), `${p}: HTML and CSS code blocks`);
  ok(it.t.includes('id="code-js"') === !!readFileSync(new URL(`../ui-screens/out-comp/${p}-web-minimal/index.html`, import.meta.url), "utf8").includes('id="mgd-component-js"'), `${p}: JS block iff the component has a script`);
  ok(it.t.includes("Component section (states, ARIA, keyboard)") && it.t.includes(`## Component: ${m.name}`.replace(/&/g, "&amp;")), `${p}: DESIGN.md component section`);
  ok(it.t.includes("<dt>Keyboard</dt>") && it.t.includes("<dt>States</dt>") && it.t.includes("<dt>ARIA pattern</dt>"), `${p}: spec block component lines`);
  ok(!it.t.includes("<dt>Responsive</dt>") && !it.t.includes("<dt>Sections</dt>"), `${p}: spec block leaves out sections and breakpoints`);
  ok(it.t.includes("<dt>Colours (light)</dt>") && it.t.includes("<dt>Fonts</dt>"), `${p}: spec block colours and fonts still work`);
  ok(new RegExp(`<title>${m.name.replace(/[()]/g, ".")} component \\(web, minimal\\)`).test(it.t), `${p}: title`);
  const rid = item.slice(-12), raw = await get(`/ui/raw/${rid}.html`);
  ok(raw.s === 200 && raw.t.includes("<!-- component -->") && raw.t.includes("UI by Made Good Designs"), `${p}: raw HTML with credit`);
  ok(!/frame-ancestors|X-Frame-Options/i.test([...raw.h].join(" ")), `${p}: raw HTML can be framed by the item page`);
}
const sm = await get("/ui/sitemap.xml");
ok(sm.t.includes("/ui/ui-components</loc>") && sm.t.includes("/ui/tabs-ui</loc>") && sm.t.includes("/ui/loading-spinner</loc>"), "sitemap has the hub and component pages");

// MCP
const L = await call("list_ui_patterns", {});
ok(/UI COMPONENTS/.test(L) && /tabs — Tabs \(16 screens\)/.test(L) && /spinner — Loading spinner/.test(L), "list_ui_patterns lists components");
const LC = await call("list_ui_patterns", { kind: "components" });
ok(/UI COMPONENTS/.test(LC) && !/APP SCREENS/.test(LC), "list_ui_patterns kind=components");
for (const [q, p] of [["tabs", "tabs"], ["accordion html css", "accordion"], ["tooltip", "tooltip"], ["dropdown menu", "dropdown-menu"], ["radio buttons", "radio-group"], ["breadcrumb navigation", "breadcrumbs"], ["toggle switch", "toggle-switch"], ["loading spinner", "spinner"], ["sidebar navigation", "sidebar-nav"], ["pagination", "pagination"], ["popover", "popover"], ["stepper", "stepper"], ["product card component", "cards"]]) {
  const t = await call("search_ui_screens", { query: q });
  ok(((t.match(/\n1\. [\s\S]*?pattern: ([a-z0-9-]+)/) || [])[1]) === p, `search_ui_screens "${q}" → ${p} first`);
}
const byPat = await call("search_ui_screens", { pattern: "toggle switch", query: "settings" });
ok(/toggle-switch-/.test(byPat), "pattern filter accepts a plain component name");
const code = await call("get_ui_screen_code", { screen_id: (byPat.match(/screen_id[:=]\s*"?([0-9a-f]{12})/) || [])[1] || "" });
ok(/role="switch"/.test(code), "get_ui_screen_code returns the component HTML");
const faq = await call("search_ui_screens", { query: "faq section" });
ok(((faq.match(/\n1\. [\s\S]*?pattern: ([a-z0-9-]+)/) || [])[1]) === "faq", "faq section still finds the FAQ section");
console.log(`${n} checks, ${fails} failed`);
process.exit(fails ? 1 : 0);
