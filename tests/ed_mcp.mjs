#!/usr/bin/env node
// Education (templates r7, tenth industry, staged) MCP answers. usage: node tests/ed_mcp.mjs http://127.0.0.1:8901/inspiration
const BASE = process.argv[2].replace(/\/$/, ""); let id = 1, fails = 0, n = 0;
const call = async (name, args) => { const r = await fetch(`${BASE}/mcp`, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json, text/event-stream", "User-Agent": "curl/8.4.0" }, body: JSON.stringify({ jsonrpc: "2.0", id: id++, method: name === "tools/list" ? "tools/list" : "tools/call", params: name === "tools/list" ? {} : { name, arguments: args } }) }); const j = await r.json(); return name === "tools/list" ? j.result.tools : j.result.content.map((c) => c.text || "").join("\n"); };
const T = (q, x = {}) => call("search_ui_screens", { query: q, ...x });
const want = async (label, p, yes = [], no = []) => { const t = await p; n++; const bad = [...yes.filter((y) => !(y instanceof RegExp ? y.test(t) : t.includes(y))).map((y) => `missing ${y}`), ...no.filter((y) => (y instanceof RegExp ? y.test(t) : t.includes(y))).map((y) => `has ${y}`)]; console.log(`${bad.length ? "FAIL" : "ok  "} ${label}`); if (bad.length || process.env.SHOW) console.log(`   ${t.slice(0, process.env.SHOW ? 1500 : 500).replace(/\n/g, "\n   ")}`); if (bad.length) { fails++; console.log("   ->", bad.join("; ")); } };
const W = "/ui/wordpress-themes/education/", H = "/ui/education-website-templates/";
await want("school wordpress theme", T("school wordpress theme"), [`${W}school`, "Upload Theme", "not education, childcare or legal advice", `${H}school-website-template`], ["medical advice", "fair housing", "allergen", "insurance or financial advice"]);
await want("university wordpress theme", T("university wordpress theme"), [`${W}university`]);
await want("college wordpress theme", T("college wordpress theme"), [`${W}university`]);
await want("preschool wordpress theme", T("preschool wordpress theme"), [`${W}preschool`]);
await want("kindergarten wordpress theme", T("kindergarten wordpress theme"), [`${W}preschool`]);
await want("daycare wordpress theme", T("daycare wordpress theme"), [`${W}daycare`]);
await want("tutoring wordpress theme", T("tutoring wordpress theme"), [`${W}tutoring`]);
await want("online course wordpress theme", T("online course wordpress theme"), [`${W}online-course`]);
await want("music school wordpress theme", T("music school wordpress theme"), [`${W}music-school`]);
await want("dance studio wordpress theme", T("dance studio wordpress theme"), [`${W}dance-studio`]);
await want("pattern + platform param", call("search_ui_screens", { pattern: "tutoring-website", platform: "wordpress" }), [`${W}tutoring`]);
await want("free wordpress block theme lists education", T("free wordpress block theme"), [/healthcare block themes/, /legal and professional services block themes/, /education block themes/]);
await want("school template gets the niche", T("school website template"), [`${H}school-website-template`, "6 distinct designs"], ["template hub"]);
await want("education template gets the hub", T("education website template"), ["Education template hub", "/ui/education-website-templates"]);
await want("elearning template gets the hub or course", T("e-learning website template"), [/education-website-templates/]);
await want("university template", T("university website template"), [`${H}university-website-template`]);
await want("childcare template", T("childcare website template"), [`${H}daycare-website-template`]);
await want("tutor template", T("tutor website template"), [`${H}tutoring-website-template`]);
await want("online course template", T("online course website template"), [`${H}online-course-website-template`]);
await want("piano lessons template", T("piano lessons website template"), [`${H}music-school-website-template`]);
await want("ballet school template", T("ballet school website template"), [`${H}dance-studio-website-template`, "7 distinct designs"]);
await want("yoga classes stays yoga", T("yoga classes website template"), ["/ui/beauty-fitness-website-templates/yoga-website-template"], [H]);
await want("fitness coaching stays fitness", T("online fitness coaching website template"), ["/ui/beauty-fitness-website-templates/fitness-website-template"], [H]);
await want("shopify school theme, honest none", T("shopify school theme"), ["no Shopify templates", `${H}school-website-template`], ["download/wordpress"]);
await want("professional services unchanged", T("lawyer wordpress theme"), ["/ui/wordpress-themes/professional-services/lawyer", "not legal, tax, accounting, insurance or financial advice"], ["childcare"]);
await want("healthcare unchanged", T("cardiology WordPress theme"), ["/ui/wordpress-themes/healthcare/cardiology", "not medical advice"], ["childcare"]);
for (const q of ["course dashboard", "student progress screen", "lesson player app", "quiz screen", "dark theme dashboard"]) await want(`not hijacked: ${q}`, T(q), [/Get code: get_ui_screen_code|No screen in the library/], ["block themes", "education-website-templates/"]);
await want("list_ui_patterns themes", call("list_ui_patterns", { kind: "themes" }), ["TEMPLATE TREE, EDUCATION", `${W}dance-studio`, "TEMPLATE TREE, LEGAL AND PROFESSIONAL SERVICES", "TEMPLATE TREE, HEALTHCARE"]);
const tools = await call("tools/list"); n++; console.log(`tools/list: ${tools.length}`); if (tools.length !== 113) { fails++; console.log("FAIL tool count changed"); }
console.log(`${n} checks, ${fails} failed`); process.exit(fails ? 1 : 0);
