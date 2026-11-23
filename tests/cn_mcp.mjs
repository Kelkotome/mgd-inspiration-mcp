#!/usr/bin/env node
// Construction and home services (fourth industry) MCP answers. usage: node tests/cn_mcp.mjs http://127.0.0.1:8901/inspiration
const BASE = process.argv[2].replace(/\/$/, ""); let id = 1, fails = 0, n = 0;
const call = async (name, args) => { const r = await fetch(`${BASE}/mcp`, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json, text/event-stream", "User-Agent": "curl/8.4.0" }, body: JSON.stringify({ jsonrpc: "2.0", id: id++, method: name === "tools/list" ? "tools/list" : "tools/call", params: name === "tools/list" ? {} : { name, arguments: args } }) }); const j = await r.json(); return name === "tools/list" ? j.result.tools : j.result.content.map((c) => c.text || "").join("\n"); };
const T = (q, x = {}) => call("search_ui_screens", { query: q, ...x });
const want = async (label, p, yes = [], no = []) => { const t = await p; n++; const bad = [...yes.filter((y) => !(y instanceof RegExp ? y.test(t) : t.includes(y))).map((y) => `missing ${y}`), ...no.filter((y) => (y instanceof RegExp ? y.test(t) : t.includes(y))).map((y) => `has ${y}`)]; console.log(`${bad.length ? "FAIL" : "ok  "} ${label}`); if (bad.length || process.env.SHOW) console.log(`   ${t.slice(0, process.env.SHOW ? 1500 : 500).replace(/\n/g, "\n   ")}`); if (bad.length) { fails++; console.log("   ->", bad.join("; ")); } };
const W = "/ui/wordpress-themes/construction/", H = "/ui/construction-website-templates/";
await want("construction wordpress theme (industry lead)", T("construction wordpress theme"), [/\d+ construction and home services block themes across 8 sub-niches/, `${W}construction-company`, "/ui/download/wordpress/mgd-construction-project.zip", /6 free block themes/, "Upload Theme", "not building, electrical, gas or safety advice", `${H}construction-company-website-template`], ["medical advice", "fair housing", "allergen", "mgd-construction-signature"]);
await want("plumber wordpress theme", T("plumber wordpress theme"), [`${W}plumber`]);
await want("plumbing wordpress theme", T("plumbing wordpress theme"), [`${W}plumber`]);
await want("electrician wordpress theme", T("electrician wordpress theme"), [`${W}electrician`]);
await want("roofing wordpress theme", T("roofing wordpress theme"), [`${W}roofing`]);
await want("hvac wordpress theme", T("hvac wordpress theme"), [`${W}hvac`], ["mgd-hvac-signature"]);
await want("cleaning wordpress theme", T("cleaning company wordpress theme"), [`${W}cleaning`]);
await want("landscaping block theme", T("landscaping block theme"), [`${W}landscaping`]);
await want("pest control wordpress theme", T("pest control wordpress theme"), [`${W}pest-control`]);
await want("pattern + platform param", call("search_ui_screens", { pattern: "roofing-website", platform: "wordpress" }), [`${W}roofing`]);
await want("free wordpress block theme lists four industries", T("free wordpress block theme"), [/healthcare block themes/, /real estate block themes/, /restaurant block themes/, /construction and home services block themes/]);
await want("home builder stays real estate", T("home builder wordpress theme"), ["/ui/wordpress-themes/real-estate/home-builder"], [W]);
await want("website builder theme is not a builder niche", T("website builder theme"), [], [W, "construction-website-templates"]);
await want("shopify plumber theme, honest none", T("shopify plumber theme"), ["no Shopify templates", `${H}plumber-website-template`], ["download/wordpress"]);
await want("construction template hint leads with the hub", T("construction website template"), ["Construction and home services template hub", "/ui/construction-website-templates", `${H}construction-company-website-template`, "7 distinct designs"]);
await want("construction company template gets the niche", T("construction company website template"), [`${H}construction-company-website-template`], ["template hub"]);
await want("plain template gets the nested page", T("landscaping website template"), [`${H}landscaping-website-template`, "6 distinct designs"]);
await want("home services website template gets the hub", T("home services website template"), ["Construction and home services template hub"]);
await want("restaurant unchanged", T("restaurant wordpress theme"), ["/ui/wordpress-themes/restaurant/casual-dining", "allergen"], ["safety advice"]);
await want("real estate unchanged", T("real estate wordpress theme"), ["/ui/wordpress-themes/real-estate/real-estate-agency", "fair housing"], ["safety advice"]);
await want("healthcare unchanged", T("cardiology WordPress theme"), ["/ui/wordpress-themes/healthcare/cardiology", "not medical advice"], ["safety advice"]);
await want("builder wordpress theme: honest none, not the construction niche (page-builder intent)", T("builder wordpress theme"), ['No WordPress theme for "builder"'], [W, "construction-website-templates/"]);
for (const q of ["page builder theme", "form builder dark theme", "progress bar theme", "home services app", "job tracker app", "contractor dashboard theme", "dark theme dashboard"]) await want(`not hijacked: ${q}`, T(q), [/Get code: get_ui_screen_code|No screen in the library/], ["block themes", "construction-website-templates"]);
await want("list_ui_patterns themes", call("list_ui_patterns", { kind: "themes" }), ["TEMPLATE TREE, CONSTRUCTION AND HOME SERVICES", `${W}pest-control`, "TEMPLATE TREE, RESTAURANT", "TEMPLATE TREE, HEALTHCARE", "TEMPLATE TREE, REAL ESTATE"]);
const tools = await call("tools/list"); n++; console.log(`tools/list: ${tools.length}`); if (tools.length !== 112) { fails++; console.log("FAIL tool count changed"); }
console.log(`${n} checks, ${fails} failed`); process.exit(fails ? 1 : 0);
