#!/usr/bin/env node
// Weddings and events (fifth industry, 9-Nov-2026) MCP answers. usage: node tests/wd_mcp.mjs http://127.0.0.1:8941/inspiration
const BASE = process.argv[2].replace(/\/$/, ""); let id = 1, fails = 0, n = 0;
const call = async (name, args) => { const r = await fetch(`${BASE}/mcp`, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json, text/event-stream", "User-Agent": "curl/8.4.0" }, body: JSON.stringify({ jsonrpc: "2.0", id: id++, method: name === "tools/list" ? "tools/list" : "tools/call", params: name === "tools/list" ? {} : { name, arguments: args } }) }); const j = await r.json(); return name === "tools/list" ? j.result.tools : j.result.content.map((c) => c.text || "").join("\n"); };
const T = (q, x = {}) => call("search_ui_screens", { query: q, ...x });
const want = async (label, p, yes = [], no = []) => { const t = await p; n++; const bad = [...yes.filter((y) => !(y instanceof RegExp ? y.test(t) : t.includes(y))).map((y) => `missing ${y}`), ...no.filter((y) => (y instanceof RegExp ? y.test(t) : t.includes(y))).map((y) => `has ${y}`)]; console.log(`${bad.length ? "FAIL" : "ok  "} ${label}`); if (bad.length || process.env.SHOW) console.log(`   ${t.slice(0, process.env.SHOW ? 1500 : 500).replace(/\n/g, "\n   ")}`); if (bad.length) { fails++; console.log("   ->", bad.join("; ")); } };
const W = "/ui/wordpress-themes/wedding/", H = "/ui/wedding-website-templates/";
await want("wedding wordpress theme (industry lead)", T("wedding wordpress theme"), [/\d+ weddings and events block themes across 8 sub-niches/, `${W}wedding-website`, "/ui/download/wordpress/mgd-wedding-invite.zip", /6 free block themes/, "Upload Theme", "not legal or planning advice", `${H}wedding-website-template`], ["medical advice", "fair housing", "allergen", "mgd-wedding-signature"]);
await want("wedding invitation wordpress theme", T("wedding invitation wordpress theme"), [`${W}wedding-invitation`], [`${W}wedding-website\n`]);
await want("save the date theme", T("save the date wordpress theme"), [`${W}wedding-invitation`]);
await want("wedding planner wordpress theme", T("wedding planner wordpress theme"), [`${W}wedding-planner`]);
await want("wedding venue wordpress theme", T("wedding venue wordpress theme"), [`${W}wedding-venue`]);
await want("wedding photographer theme", T("wedding photographer theme"), [`${W}wedding-photographer`]);
await want("florist wordpress theme", T("florist wordpress theme"), [`${W}florist`]);
await want("flower shop block theme", T("flower shop block theme"), [`${W}florist`]);
await want("event planner wordpress theme", T("event planner wordpress theme"), [`${W}event-planner`], [`${W}event\n`]);
await want("event wordpress theme", T("event wordpress theme"), [`${W}event`]);
await want("conference wordpress theme", T("conference wordpress theme"), [`${W}event`]);
await want("pattern + platform param", call("search_ui_screens", { pattern: "florist-website", platform: "wordpress" }), [`${W}florist`]);
await want("free wordpress block theme lists four industries", T("free wordpress block theme"), [/healthcare block themes/, /real estate block themes/, /restaurant block themes/, /weddings and events block themes/]);
await want("shopify wedding theme, honest none", T("shopify wedding theme"), ["no Shopify templates", `${H}wedding-website-template`], ["download/wordpress"]);
await want("wix florist template, honest none", T("wix florist template"), ["no Wix templates", `${H}florist-website-template`]);
await want("wedding template hint leads with the hub", T("wedding website template"), ["Weddings and events template hub", "/ui/wedding-website-templates", `${H}wedding-website-template`, "7 distinct designs"]);
await want("plain template gets the nested page", T("wedding venue website template"), [`${H}wedding-venue-website-template`, "6 distinct designs"]);
await want("event website template gets the event page", T("event website template"), [`${H}event-website-template`]);
await want("wedding catering stays a caterer", T("wedding catering wordpress theme"), ["/ui/wordpress-themes/restaurant/catering"], [`${W}`]);
await want("restaurant unchanged", T("restaurant wordpress theme"), ["/ui/wordpress-themes/restaurant/casual-dining", "allergen"], ["planning advice"]);
await want("real estate unchanged", T("real estate wordpress theme"), ["/ui/wordpress-themes/real-estate/real-estate-agency", "fair housing"], ["planning advice"]);
await want("healthcare unchanged", T("cardiology WordPress theme"), ["/ui/wordpress-themes/healthcare/cardiology", "not medical advice"], ["planning advice"]);
await want("salon still honest none", T("salon wordpress theme"), [/No WordPress theme for "salon"/]);
for (const q of ["calendar event card", "event list component", "rsvp form", "countdown timer", "photo gallery grid", "event ticket checkout"]) await want(`not hijacked: ${q}`, T(q), [/Get code: get_ui_screen_code|No screen in the library/], ["block themes", "No WordPress theme"]);
await want("list_ui_patterns themes", call("list_ui_patterns", { kind: "themes" }), ["TEMPLATE TREE, WEDDINGS AND EVENTS", `${W}florist`, "TEMPLATE TREE, RESTAURANT", "TEMPLATE TREE, HEALTHCARE", "TEMPLATE TREE, REAL ESTATE"]);
const tools = await call("tools/list"); n++; console.log(`tools/list: ${tools.length}`); if (tools.length !== 112) { fails++; console.log("FAIL tool count changed"); }
console.log(`${n} checks, ${fails} failed`); process.exit(fails ? 1 : 0);
