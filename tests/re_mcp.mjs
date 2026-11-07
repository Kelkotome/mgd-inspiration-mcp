#!/usr/bin/env node
// Real estate (second industry) MCP answers. usage: node tests/re_mcp.mjs http://127.0.0.1:8874/inspiration
const BASE = process.argv[2].replace(/\/$/, ""); let id = 1, fails = 0, n = 0;
const call = async (name, args) => { const r = await fetch(`${BASE}/mcp`, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json, text/event-stream", "User-Agent": "curl/8.4.0" }, body: JSON.stringify({ jsonrpc: "2.0", id: id++, method: name === "tools/list" ? "tools/list" : "tools/call", params: name === "tools/list" ? {} : { name, arguments: args } }) }); const j = await r.json(); return name === "tools/list" ? j.result.tools : j.result.content.map((c) => c.text || "").join("\n"); };
const T = (q, x = {}) => call("search_ui_screens", { query: q, ...x });
const want = async (label, p, yes = [], no = []) => { const t = await p; n++; const bad = [...yes.filter((y) => !(y instanceof RegExp ? y.test(t) : t.includes(y))).map((y) => `missing ${y}`), ...no.filter((y) => (y instanceof RegExp ? y.test(t) : t.includes(y))).map((y) => `has ${y}`)]; console.log(`${bad.length ? "FAIL" : "ok  "} ${label}`); if (bad.length || process.env.SHOW) console.log(`   ${t.slice(0, process.env.SHOW ? 1500 : 500).replace(/\n/g, "\n   ")}`); if (bad.length) { fails++; console.log("   ->", bad.join("; ")); } };
const W = "/ui/wordpress-themes/real-estate/", H = "/ui/real-estate-website-templates/", SCREENS = /Get code: get_ui_screen_code/;
await want("real estate wordpress theme", T("real estate wordpress theme"), [`${W}real-estate-agency`, "/ui/download/wordpress/mgd-real-estate-listing.zip", /6 free block themes/, "Upload Theme", "fair housing", `${H}real-estate-agency-website-template`], ["medical advice", "mgd-real-estate-signature"]);
await want("realtor wordpress theme", T("realtor wordpress theme"), [`${W}real-estate-agent`]);
await want("property management wordpress", T("property management wordpress"), [`${W}property-management`]);
await want("letting agent theme", T("letting agent theme"), [`${W}property-management`]);
await want("luxury homes block theme", T("luxury homes block theme"), [`${W}luxury`]);
await want("commercial real estate wordpress theme", T("commercial real estate wordpress theme"), [`${W}commercial`], [`${W}real-estate-agency`]);
await want("vacation rental wordpress theme", T("vacation rental wordpress theme"), [`${W}vacation-rental`]);
await want("holiday let theme", T("holiday let theme"), [`${W}vacation-rental`]);
await want("home builder wordpress", T("home builder wordpress"), [`${W}home-builder`]);
await want("apartment complex wordpress theme", T("apartment complex wordpress theme"), [`${W}apartment`]);
await want("pattern + platform param", call("search_ui_screens", { pattern: "vacation-rental-website", platform: "wordpress" }), [`${W}vacation-rental`]);
await want("real estate wordpress themes (industry)", T("real estate wordpress themes"), [/\d+ real estate block themes across 8 sub-niches/, "/ui/wordpress-themes"]);
await want("free wordpress block theme lists both", T("free wordpress block theme"), [/healthcare block themes/, /real estate block themes/]);
await want("shopify real estate theme, honest none", T("shopify real estate theme"), ["no Shopify templates", `${H}real-estate-agency-website-template`], ["download/wordpress"]);
await want("wix realtor template, honest none", T("wix realtor template"), ["no Wix templates", `${H}real-estate-agent-website-template`]);
await want("plain template gets the nested page", T("property management website template"), [`${H}property-management-website-template`, "6 distinct designs"]);
await want("agency template hint", T("real estate website template"), [`${H}real-estate-agency-website-template`, "7 distinct designs"]);
await want("restaurant still honest none", T("restaurant wordpress theme"), [/No WordPress theme for "restaurant"/]);
await want("healthcare unchanged", T("cardiology WordPress theme"), ["/ui/wordpress-themes/healthcare/cardiology", "not medical advice"], ["fair housing"]);
for (const q of ["apartment app dashboard theme", "dark theme dashboard", "property card component", "rental booking app"]) await want(`not hijacked: ${q}`, T(q), [/Get code: get_ui_screen_code|No screen in the library/], ["block themes", "No WordPress theme"]);
await want("list_ui_patterns themes", call("list_ui_patterns", { kind: "themes" }), ["TEMPLATE TREE, REAL ESTATE", `${W}vacation-rental`, "TEMPLATE TREE, HEALTHCARE"]);
const tools = await call("tools/list"); n++; console.log(`tools/list: ${tools.length}`); if (tools.length !== 112) { fails++; console.log("FAIL tool count changed"); }
console.log(`${n} checks, ${fails} failed`); process.exit(fails ? 1 : 0);
