#!/usr/bin/env node
// Restaurant (third industry) MCP answers. usage: node tests/rs_mcp.mjs http://127.0.0.1:8894/inspiration
const BASE = process.argv[2].replace(/\/$/, ""); let id = 1, fails = 0, n = 0;
const call = async (name, args) => { const r = await fetch(`${BASE}/mcp`, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json, text/event-stream", "User-Agent": "curl/8.4.0" }, body: JSON.stringify({ jsonrpc: "2.0", id: id++, method: name === "tools/list" ? "tools/list" : "tools/call", params: name === "tools/list" ? {} : { name, arguments: args } }) }); const j = await r.json(); return name === "tools/list" ? j.result.tools : j.result.content.map((c) => c.text || "").join("\n"); };
const T = (q, x = {}) => call("search_ui_screens", { query: q, ...x });
const want = async (label, p, yes = [], no = []) => { const t = await p; n++; const bad = [...yes.filter((y) => !(y instanceof RegExp ? y.test(t) : t.includes(y))).map((y) => `missing ${y}`), ...no.filter((y) => (y instanceof RegExp ? y.test(t) : t.includes(y))).map((y) => `has ${y}`)]; console.log(`${bad.length ? "FAIL" : "ok  "} ${label}`); if (bad.length || process.env.SHOW) console.log(`   ${t.slice(0, process.env.SHOW ? 1500 : 500).replace(/\n/g, "\n   ")}`); if (bad.length) { fails++; console.log("   ->", bad.join("; ")); } };
const W = "/ui/wordpress-themes/restaurant/", H = "/ui/restaurant-website-templates/";
await want("restaurant wordpress theme (industry lead)", T("restaurant wordpress theme"), [/\d+ restaurant block themes across 8 sub-niches/, `${W}casual-dining`, "/ui/download/wordpress/mgd-restaurant-menu.zip", /6 free block themes/, "Upload Theme", "allergen", `${H}casual-dining-website-template`], ["medical advice", "fair housing", "mgd-restaurant-signature"]);
await want("cafe wordpress theme", T("cafe wordpress theme"), [`${W}cafe`], ["mgd-coffee-shop-signature"]);
await want("coffee shop wordpress theme", T("coffee shop wordpress theme"), [`${W}cafe`]);
await want("bakery wordpress theme", T("bakery wordpress theme"), [`${W}bakery`]);
await want("pizza wordpress theme", T("pizza wordpress theme"), [`${W}pizzeria`]);
await want("pub theme", T("pub theme"), [`${W}bar`]);
await want("bar wordpress theme", T("bar wordpress theme"), [`${W}bar`]);
await want("catering wordpress theme", T("catering wordpress theme"), [`${W}catering`]);
await want("food truck block theme", T("food truck block theme"), [`${W}food-truck`]);
await want("fine dining wordpress theme", T("fine dining wordpress theme"), [`${W}fine-dining`], [`${W}casual-dining`]);
await want("pattern + platform param", call("search_ui_screens", { pattern: "bakery-website", platform: "wordpress" }), [`${W}bakery`]);
await want("free wordpress block theme lists three industries", T("free wordpress block theme"), [/healthcare block themes/, /real estate block themes/, /restaurant block themes/]);
await want("shopify restaurant theme, honest none", T("shopify restaurant theme"), ["no Shopify templates", `${H}casual-dining-website-template`], ["download/wordpress"]);
await want("wix bakery template, honest none", T("wix bakery template"), ["no Wix templates", `${H}bakery-website-template`]);
await want("restaurant template hint leads with the hub", T("restaurant website template"), ["Restaurant template hub", "/ui/restaurant-website-templates", `${H}casual-dining-website-template`, "7 distinct designs"]);
await want("plain template gets the nested page", T("food truck website template"), [`${H}food-truck-website-template`, "6 distinct designs"]);
await want("real estate unchanged", T("real estate wordpress theme"), ["/ui/wordpress-themes/real-estate/real-estate-agency", "fair housing"], ["allergen"]);
await want("healthcare unchanged", T("cardiology WordPress theme"), ["/ui/wordpress-themes/healthcare/cardiology", "not medical advice"], ["allergen"]);
for (const q of ["navigation bar theme", "progress bar theme", "search bar wordpress", "tab bar dark theme", "sidebar theme", "food delivery app dashboard theme", "dark theme dashboard", "restaurant booking app", "menu component"]) await want(`not hijacked: ${q}`, T(q), [/Get code: get_ui_screen_code|No screen in the library/], ["block themes", "No WordPress theme", "restaurant-website-templates"]);
await want("list_ui_patterns themes", call("list_ui_patterns", { kind: "themes" }), ["TEMPLATE TREE, RESTAURANT", `${W}food-truck`, "TEMPLATE TREE, HEALTHCARE", "TEMPLATE TREE, REAL ESTATE"]);
const tools = await call("tools/list"); n++; console.log(`tools/list: ${tools.length}`); if (tools.length !== 112) { fails++; console.log("FAIL tool count changed"); }
console.log(`${n} checks, ${fails} failed`); process.exit(fails ? 1 : 0);
