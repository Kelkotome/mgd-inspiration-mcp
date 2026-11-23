#!/usr/bin/env node
// Legal and professional services (templates r6, ninth industry) MCP answers. usage: node tests/cn_mcp.mjs http://127.0.0.1:8901/inspiration
const BASE = process.argv[2].replace(/\/$/, ""); let id = 1, fails = 0, n = 0;
const call = async (name, args) => { const r = await fetch(`${BASE}/mcp`, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json, text/event-stream", "User-Agent": "curl/8.4.0" }, body: JSON.stringify({ jsonrpc: "2.0", id: id++, method: name === "tools/list" ? "tools/list" : "tools/call", params: name === "tools/list" ? {} : { name, arguments: args } }) }); const j = await r.json(); return name === "tools/list" ? j.result.tools : j.result.content.map((c) => c.text || "").join("\n"); };
const T = (q, x = {}) => call("search_ui_screens", { query: q, ...x });
const want = async (label, p, yes = [], no = []) => { const t = await p; n++; const bad = [...yes.filter((y) => !(y instanceof RegExp ? y.test(t) : t.includes(y))).map((y) => `missing ${y}`), ...no.filter((y) => (y instanceof RegExp ? y.test(t) : t.includes(y))).map((y) => `has ${y}`)]; console.log(`${bad.length ? "FAIL" : "ok  "} ${label}`); if (bad.length || process.env.SHOW) console.log(`   ${t.slice(0, process.env.SHOW ? 1500 : 500).replace(/\n/g, "\n   ")}`); if (bad.length) { fails++; console.log("   ->", bad.join("; ")); } };
const W = "/ui/wordpress-themes/professional-services/", H = "/ui/professional-services-website-templates/";
await want("lawyer wordpress theme", T("lawyer wordpress theme"), [`${W}lawyer`, "Upload Theme", "not legal, tax, accounting, insurance or financial advice", `${H}lawyer-website-template`], ["medical advice", "fair housing", "allergen", "safety advice"]);
await want("attorney wordpress theme", T("attorney wordpress theme"), [`${W}lawyer`]);
await want("law firm wordpress theme", T("law firm wordpress theme"), [`${W}law-firm`]);
await want("accounting wordpress theme", T("accounting wordpress theme"), [`${W}accounting`]);
await want("tax preparation wordpress theme", T("tax preparation wordpress theme"), [`${W}tax-preparation`]);
await want("financial advisor wordpress theme", T("financial advisor wordpress theme"), [`${W}financial-advisor`]);
await want("insurance agency wordpress theme", T("insurance agency wordpress theme"), [`${W}insurance`]);
await want("consulting wordpress theme", T("consulting wordpress theme"), [`${W}consulting`]);
await want("staffing agency wordpress theme", T("staffing agency wordpress theme"), [`${W}staffing-agency`]);
await want("recruitment block theme", T("recruitment block theme"), [`${W}staffing-agency`]);
await want("pattern + platform param", call("search_ui_screens", { pattern: "accounting-website", platform: "wordpress" }), [`${W}accounting`]);
await want("free wordpress block theme lists professional services", T("free wordpress block theme"), [/healthcare block themes/, /construction and home services block themes/, /legal and professional services block themes/]);
await want("lawyer template gets the niche", T("lawyer website template"), [`${H}lawyer-website-template`, "6 distinct designs"], ["template hub"]);
await want("law firm template gets the niche", T("law firm website template"), [`${H}law-firm-website-template`, "6 distinct designs"]);
await want("accountant template", T("accountant website template"), [`${H}accounting-website-template`]);
await want("bookkeeping template", T("bookkeeping website template"), [`${H}accounting-website-template`]);
await want("tax website template", T("tax website template"), [`${H}tax-preparation-website-template`]);
await want("insurance website template", T("insurance website template"), [`${H}insurance-website-template`]);
await want("consultant website template", T("consultant website template"), [`${H}consulting-website-template`]);
await want("recruitment website template", T("recruitment website template"), [`${H}staffing-agency-website-template`]);
await want("professional services gets the hub", T("professional services website template"), ["Legal and professional services template hub", "/ui/professional-services-website-templates"]);
await want("marketing consultancy stays marketing agency", T("marketing consultancy website template"), ["/ui/portfolio-website-templates/marketing-agency-website-template"], [H]);
await want("creative agency stays agency", T("creative agency website template"), ["/ui/portfolio-website-templates/agency-website-template"], [H]);
await want("travel agency not insurance", T("travel agency website template"), [], [`${H}insurance`]);
await want("shopify lawyer theme, honest none", T("shopify lawyer theme"), ["no Shopify templates", `${H}lawyer-website-template`], ["download/wordpress"]);
await want("construction unchanged", T("plumber wordpress theme"), ["/ui/wordpress-themes/construction/plumber", "not building, electrical, gas or safety advice"], ["insurance or financial advice"]);
await want("healthcare unchanged", T("cardiology WordPress theme"), ["/ui/wordpress-themes/healthcare/cardiology", "not medical advice"], ["insurance or financial advice"]);
for (const q of ["invoice screen", "tax settings form", "insurance claim form app", "billing plans", "dark theme dashboard"]) await want(`not hijacked: ${q}`, T(q), [/Get code: get_ui_screen_code|No screen in the library/], ["block themes", "professional-services-website-templates"]);
await want("list_ui_patterns themes", call("list_ui_patterns", { kind: "themes" }), ["TEMPLATE TREE, LEGAL AND PROFESSIONAL SERVICES", `${W}staffing-agency`, "TEMPLATE TREE, CONSTRUCTION AND HOME SERVICES", "TEMPLATE TREE, HEALTHCARE"]);
const tools = await call("tools/list"); n++; console.log(`tools/list: ${tools.length}`); if (tools.length !== 113) { fails++; console.log("FAIL tool count changed"); }
console.log(`${n} checks, ${fails} failed`); process.exit(fails ? 1 : 0);
