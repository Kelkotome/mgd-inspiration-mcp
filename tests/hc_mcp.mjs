#!/usr/bin/env node
// What an assistant actually gets back. usage: node tests/hc_mcp.mjs http://127.0.0.1:8873/inspiration
const BASE = process.argv[2].replace(/\/$/, ""); let id = 1, fails = 0, n = 0;
const call = async (name, args) => { const r = await fetch(`${BASE}/mcp`, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json, text/event-stream", "User-Agent": "curl/8.4.0" }, body: JSON.stringify({ jsonrpc: "2.0", id: id++, method: name === "tools/list" ? "tools/list" : "tools/call", params: name === "tools/list" ? {} : { name, arguments: args } }) }); const j = await r.json(); return name === "tools/list" ? j.result.tools : j.result.content.map((c) => c.text || "").join("\n"); };
const T = (q, x = {}) => call("search_ui_screens", { query: q, ...x });
const want = async (label, p, yes = [], no = []) => { const t = await p; n++; const bad = [...yes.filter((y) => !(y instanceof RegExp ? y.test(t) : t.includes(y))).map((y) => `missing ${y}`), ...no.filter((y) => (y instanceof RegExp ? y.test(t) : t.includes(y))).map((y) => `has ${y}`)]; console.log(`${bad.length ? "FAIL" : "ok  "} ${label}`); if (bad.length || process.env.SHOW) console.log(`   ${t.slice(0, process.env.SHOW ? 1500 : 500).replace(/\n/g, "\n   ")}`); if (bad.length) { fails++; console.log("   ->", bad.join("; ")); } };
const nested = "/ui/wordpress-themes/healthcare/";
const SCREENS = /Get code: get_ui_screen_code/;
await want("cardiology WordPress theme", T("cardiology WordPress theme"), [`${nested}cardiology`, "/ui/download/wordpress/mgd-cardiology-signature.zip", /6 free block themes/, "Upload Theme", "Licence", "Same designs as HTML", "/ui/healthcare-website-templates/cardiology-website-template"]);
await want("cardiology + platform param", T("cardiology", { platform: "wordpress" }), [`${nested}cardiology`]);
await want("pattern + platform param", call("search_ui_screens", { pattern: "dental-website", platform: "wordpress" }), [`${nested}dental`]);
await want("wordpress theme for a dentist", T("wordpress theme for a dentist"), [`${nested}dental`]);
await want("orthodontist wordpress", T("orthodontist wordpress"), [`${nested}orthodontics`]);
await want("animal hospital wordpress theme", T("animal hospital wordpress theme"), [`${nested}veterinary`], [`${nested}hospital`]);
await want("hospital block theme", T("hospital block theme"), [`${nested}hospital`]);
await want("mental health wordpress theme", T("mental health wordpress theme"), [`${nested}mental-health`]);
await want("psychologist theme", T("psychologist theme"), [`${nested}therapist`]);
await want("pharmacy theme", T("pharmacy theme"), [`${nested}pharmacy`]);
await want("eye clinic wordpress", T("eye clinic wordpress"), [`${nested}optometry`]);
await want("healthcare wordpress themes", T("healthcare wordpress themes"), [/\d+ healthcare block themes across 14 sub-niches/, "/ui/wordpress-themes"]);
await want("free wordpress block theme", T("free wordpress block theme"), ["/ui/wordpress-themes", /healthcare block themes/]);
await want("salon wordpress theme, honest none (restaurant is now an industry, 7-Nov-2026)", T("salon wordpress theme"), [/No WordPress theme for "salon"/, "/ui/website-templates"], ["healthcare-website-templates/"]);
await want("shopify dental theme, honest none", T("shopify dental theme"), ["no Shopify templates", "/ui/healthcare-website-templates/dental-website-template"], ["download/wordpress"]);
await want("platform=shopify param", T("cardiology", { platform: "shopify" }), ["no Shopify templates"]);
await want("joomla medical template", T("joomla medical template"), ["no Joomla templates"]);
await want("magento pharmacy store", T("magento pharmacy store"), ["no Magento templates"]);
await want("plain template gets the nested page", T("cardiology website template"), ["/ui/healthcare-website-templates/cardiology-website-template", SCREENS, "6 distinct designs"]);
await want("healthcare website template hub", T("healthcare website template"), ["/ui/healthcare-website-templates"]);
for (const q of ["dark theme dashboard", "theme switcher", "settings page theme toggle", "medical app dashboard theme", "login page", "doctor directory"]) await want(`not hijacked: ${q}`, T(q), [/Get code: get_ui_screen_code|No screen in the library/], ["block themes", "No WordPress theme"]); // the local database has website rows only
await want("device param", T("pricing page", { device: "mobile" }), [SCREENS]);
await want("old platform=mobile still means device", T("pricing page", { platform: "mobile" }), [SCREENS], ["not available"]);
await want("get_ui_flow device alias", call("get_ui_flow", { flow: "checkout", device: "web" }), [/step/i]);
await want("list_ui_patterns themes", call("list_ui_patterns", { kind: "themes" }), ["TEMPLATE TREE, HEALTHCARE", "/ui/wordpress-themes/healthcare/cardiology"]);
await want("list_ui_patterns templates", call("list_ui_patterns", { kind: "templates" }), ["TEMPLATE TREE, HEALTHCARE"]);
const tools = await call("tools/list"); n++; const s = tools.find((t) => t.name === "search_ui_screens"); if (!s.inputSchema.properties.device) { fails++; console.log("FAIL device param missing"); } console.log(`tools/list: ${tools.length}`);
console.log(`${n} checks, ${fails} failed`); process.exit(fails ? 1 : 0);
