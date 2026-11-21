#!/usr/bin/env node
// Beauty, fitness and wellness (seventh industry, 21-Nov-2026) MCP answers. usage: node tests/bw_mcp.mjs http://127.0.0.1:8991/inspiration
const BASE = process.argv[2].replace(/\/$/, ""); let id = 1, fails = 0, n = 0;
const call = async (name, args) => { const r = await fetch(`${BASE}/mcp`, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json, text/event-stream", "User-Agent": "curl/8.4.0" }, body: JSON.stringify({ jsonrpc: "2.0", id: id++, method: name === "tools/list" ? "tools/list" : "tools/call", params: name === "tools/list" ? {} : { name, arguments: args } }) }); const j = await r.json(); return name === "tools/list" ? j.result.tools : j.result.content.map((c) => c.text || "").join("\n"); };
const T = (q, x = {}) => call("search_ui_screens", { query: q, ...x });
const want = async (label, p, yes = [], no = []) => { const t = await p; n++; const bad = [...yes.filter((y) => !(y instanceof RegExp ? y.test(t) : t.includes(y))).map((y) => `missing ${y}`), ...no.filter((y) => (y instanceof RegExp ? y.test(t) : t.includes(y))).map((y) => `has ${y}`)]; console.log(`${bad.length ? "FAIL" : "ok  "} ${label}`); if (bad.length || process.env.SHOW) console.log(`   ${t.slice(0, process.env.SHOW ? 1500 : 500).replace(/\n/g, "\n   ")}`); if (bad.length) { fails++; console.log("   ->", bad.join("; ")); } };
const W = "/ui/wordpress-themes/beauty-fitness/", H = "/ui/beauty-fitness-website-templates/";
await want("beauty website template: hub first", T("beauty website template"), ["Beauty, fitness and wellness template hub", "/ui/beauty-fitness-website-templates", "8 sub-niches"]);
await want("wellness website template: hub first", T("wellness website template"), ["Beauty, fitness and wellness template hub"]);
await want("hair salon website template", T("hair salon website template"), [`${H}hair-salon-website-template`, "6 distinct designs"]);
await want("barber shop website template", T("barber shop website template"), [`${H}barber-shop-website-template`]);
await want("nail salon website template", T("nail salon website template"), [`${H}nail-salon-website-template`]);
await want("spa website template", T("spa website template"), [`${H}spa-website-template`]);
await want("massage website template", T("massage website template"), [`${H}spa-website-template`]);
await want("makeup artist website template", T("makeup artist website template"), [`${H}makeup-artist-website-template`]);
await want("gym website template (n12 pattern moves under the hub)", T("gym website template"), [`${H}gym-website-template`, "7 distinct designs"]);
await want("personal trainer website template", T("personal trainer website template"), [`${H}fitness-website-template`], [`${H}gym-website-template`]);
await want("fitness website template", T("fitness website template"), [`${H}fitness-website-template`]);
await want("yoga studio website template", T("yoga studio website template"), [`${H}yoga-website-template`, "7 distinct designs"]);
await want("salon wordpress theme", T("hair salon wordpress theme"), [`${W}hair-salon`, "/ui/download/wordpress/mgd-hair-salon-concierge.zip", /6 free block themes/, "Upload Theme"]);
await want("spa wordpress theme", T("spa wordpress theme"), [`${W}spa`, "not medical or health advice"]);
await want("gym wordpress theme", T("gym wordpress theme"), [`${W}gym`, "mgd-gym-timetable"], ["mgd-gym-signature"]);
await want("yoga wordpress theme", T("yoga wordpress theme"), [`${W}yoga`]);
await want("barber wordpress theme", T("barber wordpress theme"), [`${W}barbershop`]);
await want("pattern + platform param", call("search_ui_screens", { pattern: "nail-salon-website", platform: "wordpress" }), [`${W}nail-salon`]);
await want("free wordpress block theme lists the six theme industries", T("free wordpress block theme"), [/healthcare block themes/, /real estate block themes/, /restaurant block themes/, /weddings and events block themes/, /portfolios and creative studios block themes/, /beauty, fitness and wellness block themes/]);
await want("wedding makeup stays makeup, wedding photographer stays wedding", T("wedding photographer wordpress theme"), ["/ui/wordpress-themes/wedding/wedding-photographer"], [W]);
await want("medical spa goes to healthcare words, not the beauty hub line", T("medical website template"), ["/ui/healthcare-website-templates"], ["Beauty, fitness and wellness template hub"]);
await want("dermatology unchanged", T("dermatology WordPress theme"), ["/ui/wordpress-themes/healthcare/dermatology", "not medical advice"]);
await want("physical therapy unchanged", T("physical therapy website template"), ["/ui/healthcare-website-templates/physical-therapy-website-template"], [H]);
await want("portfolio unchanged", T("portfolio website template"), ["Portfolios and creative studios template hub"]);
for (const q of ["class schedule screen", "booking confirmed", "fitness app dashboard", "workout tracker", "pricing table"]) await want(`not hijacked: ${q}`, T(q), [/Get code: get_ui_screen_code|No screen in the library/], ["block themes", "No WordPress theme"]);
await want("list_ui_patterns themes", call("list_ui_patterns", { kind: "themes" }), ["TEMPLATE TREE, BEAUTY, FITNESS AND WELLNESS", `${W}yoga`, "TEMPLATE TREE, PORTFOLIOS AND CREATIVE STUDIOS", "TEMPLATE TREE, HEALTHCARE"]);
const tools = await call("tools/list"); n++; console.log(`tools/list: ${tools.length}`); if (tools.length < 100) { fails++; console.log("FAIL tool count dropped"); }
console.log(`${n} checks, ${fails} failed`); process.exit(fails ? 1 : 0);
