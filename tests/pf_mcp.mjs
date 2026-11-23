#!/usr/bin/env node
// Portfolios and creative studios (sixth industry, 13-Nov-2026) MCP answers. usage: node tests/pf_mcp.mjs http://127.0.0.1:8981/inspiration
const BASE = process.argv[2].replace(/\/$/, ""); let id = 1, fails = 0, n = 0;
const call = async (name, args) => { const r = await fetch(`${BASE}/mcp`, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json, text/event-stream", "User-Agent": "curl/8.4.0" }, body: JSON.stringify({ jsonrpc: "2.0", id: id++, method: name === "tools/list" ? "tools/list" : "tools/call", params: name === "tools/list" ? {} : { name, arguments: args } }) }); const j = await r.json(); return name === "tools/list" ? j.result.tools : j.result.content.map((c) => c.text || "").join("\n"); };
const T = (q, x = {}) => call("search_ui_screens", { query: q, ...x });
const want = async (label, p, yes = [], no = []) => { const t = await p; n++; const bad = [...yes.filter((y) => !(y instanceof RegExp ? y.test(t) : t.includes(y))).map((y) => `missing ${y}`), ...no.filter((y) => (y instanceof RegExp ? y.test(t) : t.includes(y))).map((y) => `has ${y}`)]; console.log(`${bad.length ? "FAIL" : "ok  "} ${label}`); if (bad.length || process.env.SHOW) console.log(`   ${t.slice(0, process.env.SHOW ? 1500 : 500).replace(/\n/g, "\n   ")}`); if (bad.length) { fails++; console.log("   ->", bad.join("; ")); } };
const W = "/ui/wordpress-themes/portfolio/", H = "/ui/portfolio-website-templates/";
await want("portfolio website template: hub first", T("portfolio website template"), ["Portfolios and creative studios template hub", "/ui/portfolio-website-templates", "8 sub-niches"]);
await want("personal portfolio template", T("personal portfolio website template"), [`${H}personal-portfolio-website-template`, "6 distinct designs"]);
await want("developer portfolio template", T("developer portfolio template"), [`${H}developer-portfolio-template`]);
await want("graphic designer portfolio template", T("graphic designer portfolio template"), [`${H}graphic-designer-portfolio-template`]);
await want("photography website template", T("photography website template"), [`${H}photography-website-template`]);
await want("interior design website template", T("interior design website template"), [`${H}interior-design-website-template`]);
await want("architecture website template", T("architecture website template"), [`${H}architecture-website-template`, "6 distinct designs"]);
await want("agency website template", T("agency website template"), [`${H}agency-website-template`, "6 distinct designs"]);
await want("marketing agency website template", T("marketing agency website template"), [`${H}marketing-agency-website-template`], [`${H}agency-website-template`]);
await want("portfolio wordpress theme lists the industry", T("portfolio wordpress theme"), [/portfolios and creative studios block themes across 8 sub-niches/]);
await want("photography wordpress theme", T("photography wordpress theme"), [`${W}photography`, "/ui/download/wordpress/mgd-photography-work.zip", /6 free block themes/, "Upload Theme"], ["medical advice", "mgd-photography-signature"]);
await want("developer portfolio wordpress theme", T("developer portfolio wordpress theme"), [`${W}developer`]);
await want("interior design wordpress theme", T("interior design wordpress theme"), [`${W}interior-design`, "only show client work and results you have permission to share"]);
await want("architect wordpress theme", T("architect wordpress theme"), [`${W}architecture`]);
await want("creative agency wordpress theme", T("creative agency wordpress theme"), [`${W}agency`], [`${W}marketing-agency`]);
await want("marketing agency wordpress theme", T("marketing agency wordpress theme"), [`${W}marketing-agency`]);
await want("pattern + platform param", call("search_ui_screens", { pattern: "graphic-designer-website", platform: "wordpress" }), [`${W}graphic-designer`]);
await want("free wordpress block theme lists six industries", T("free wordpress block theme"), [/healthcare block themes/, /real estate block themes/, /restaurant block themes/, /weddings and events block themes/, /portfolios and creative studios block themes/]);
await want("squarespace portfolio, honest none", T("squarespace photography template"), ["no Squarespace templates", `${H}photography-website-template`], ["download/wordpress"]);
await want("wedding photographer stays a wedding niche", T("wedding photographer wordpress theme"), ["/ui/wordpress-themes/wedding/wedding-photographer"], [`${W}photography`]);
await want("real estate agency stays real estate", T("real estate agency wordpress theme"), ["/ui/wordpress-themes/real-estate/"], [`${W}agency`]);
await want("travel agency is not a creative agency", T("travel agency website template"), [], [`${H}agency-website-template`]);
await want("wedding unchanged", T("wedding wordpress theme"), ["/ui/wordpress-themes/wedding/wedding-website", "not legal or planning advice"]);
await want("restaurant unchanged", T("restaurant wordpress theme"), ["/ui/wordpress-themes/restaurant/casual-dining", "allergen"]);
await want("healthcare unchanged", T("cardiology WordPress theme"), ["/ui/wordpress-themes/healthcare/cardiology", "not medical advice"]);
for (const q of ["portfolio hero", "case study page", "work index list of projects", "photo gallery grid", "image lightbox", "resume builder"]) await want(`not hijacked: ${q}`, T(q), [/Get code: get_ui_screen_code|No screen in the library/], ["block themes", "No WordPress theme"]);
await want("list_ui_patterns themes", call("list_ui_patterns", { kind: "themes" }), ["TEMPLATE TREE, PORTFOLIOS AND CREATIVE STUDIOS", `${W}marketing-agency`, "TEMPLATE TREE, WEDDINGS AND EVENTS", "TEMPLATE TREE, HEALTHCARE"]);
const tools = await call("tools/list"); n++; console.log(`tools/list: ${tools.length}`); if (tools.length !== 113) { fails++; console.log("FAIL tool count changed"); }
console.log(`${n} checks, ${fails} failed`); process.exit(fails ? 1 : 0);
