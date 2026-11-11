#!/usr/bin/env node
// mcp-gaps-r2 (11-Nov-2026): pages and MCP answers for the 4 dating patterns (128 rows, Duskwell).
//   node tests/gaps_r2_routes.mjs http://127.0.0.1:8981/inspiration          local Worker from tests/gaps_r2_local_e2e.sh
//   node tests/gaps_r2_routes.mjs https://madegooddesigns.com/inspiration --live   read-only live checks (UA curl/8.4.0)
import { readFileSync } from "node:fs";
const BASE = process.argv[2].replace(/\/$/, ""), LIVE = process.argv.includes("--live"); let id = 1, fails = 0, n = 0;
const SEO = readFileSync(new URL("../src/ui_seo.js", import.meta.url), "utf8");
export const NEW = ["dating-swipe", "dating-profile", "dating-chat", "dating-onboarding"];
const slugOf = (p) => (SEO.match(new RegExp(`"${p}": \\["([a-z0-9-]+)"`)) || [])[1];
const ok = (c, msg) => { n++; if (!c) { fails++; console.log("FAIL", msg); } };
const H = { "User-Agent": "curl/8.4.0", Accept: "*/*" };
const get = async (p) => { const r = await fetch(p.startsWith("http") ? p : BASE + p, { redirect: "manual", headers: H }); return { s: r.status, h: r.headers, t: await r.text() }; };
const call = async (name, args) => {
  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetch(`${BASE}/mcp`, { method: "POST", headers: { ...H, "Content-Type": "application/json", Accept: "application/json, text/event-stream" },
        body: JSON.stringify({ jsonrpc: "2.0", id: id++, method: "tools/call", params: { name, arguments: args } }) });
      const j = await r.json(); return j.result.content.map((c) => c.text || "").join("\n");
    } catch (e) { if (i === 2) throw e; await new Promise((res) => setTimeout(res, 2000 * (i + 1))); }
  }
};
const BRANDS = /tinder|bumble|hinge|badoo|okcupid|grindr|happn|it[’']s a match/i;

for (const p of NEW) {
  const slug = slugOf(p); ok(!!slug, `${p} slug`); if (!slug) continue;
  const pg = await get(`/ui/${slug}`);
  ok(pg.s === 200, `/ui/${slug} ${pg.s}`);
  ok(pg.t.includes("32 examples"), `/ui/${slug} has 32 examples`);
  ok(/"@type":"FAQPage"/.test(pg.t), `/ui/${slug} FAQ schema`);
  ok(!BRANDS.test(pg.t.replace(/<script[^]*?<\/script>/g, "")), `/ui/${slug} names no real dating app`);
  ok((await get(`/ui/${p}`)).s === 301 || slug === p, `/ui/${p} old id 301`);
  const item = (pg.t.match(new RegExp(`href="(/inspiration/ui/${p}-[a-z-]*(?:web|mobile)-minimal-[0-9a-f]{12})"`)) || [])[1];
  ok(!!item, `${p}: minimal item link`); if (!item) continue;
  const it = await get(item.replace("/inspiration", ""));
  ok(it.s === 200, `${item} ${it.s}`);
  ok(it.t.includes('class="spec"') && it.t.includes("<dt>Colours (light)</dt>") && it.t.includes("<dt>Fonts</dt>"), `${p}: spec block`);
  const raw = await get(`/ui/raw/${item.slice(-12)}.html`);
  ok(raw.s === 200 && raw.t.includes("UI by Made Good Designs") && raw.t.includes("Duskwell"), `${p}: raw HTML with credit`);
  ok(!BRANDS.test(raw.t) && !/<img\b|https?:\/\/(?!fonts\.(?:googleapis|gstatic)\.com|madegooddesigns\.com)[^"' )]+\.(?:png|jpe?g|webp)/i.test(raw.t), `${p}: raw HTML has no brand names and no external images`);
  ok(/prefers-color-scheme:dark/.test(raw.t), `${p}: raw HTML ships a dark theme`);
  const md = await get(`/ui/raw/${item.slice(-12)}.md`);
  ok(md.s === 200 && /^#/m.test(md.t) && /dark/i.test(md.t), `${p}: DESIGN.md (with dark tokens)`);
}
const sm = await get("/ui/sitemap.xml");
ok(NEW.every((p) => sm.t.includes(`/ui/${slugOf(p)}</loc>`)), "sitemap lists all 4 pattern pages");
const lp = await call("list_ui_patterns", {});
ok(NEW.every((p) => lp.includes(p)), "list_ui_patterns names all 4");

// [query, pattern that must be first, minimum screens]. Minimums are for the local Worker (the 128 rows + a few neighbours).
for (const [q, want, min] of [
  ["mobile dating swipe dark luxury", "dating-swipe", 2], ["dating app swipe", "dating-swipe", 2], ["tinder-like swipe cards", "dating-swipe", 2],
  ["swipe", "dating-swipe", 2], ["dating match screen", "dating-swipe", 2], ["dating profile prompts", "dating-profile", 2],
  ["dating app filters age range distance", "dating-profile", 2], ["dating app chat", "dating-chat", 2], ["new matches list", "dating-chat", 2],
  ["dating app onboarding photos", "dating-onboarding", 2], ["dating app sign up", "dating-onboarding", 2]]) {
  const t = await call("search_ui_screens", { query: q });
  const cnt = +(t.match(/^(\d+) UI screen/m) || [])[1] || 0, top = (t.match(/(?:^\s+|· )pattern: ([a-z0-9-]+)/m) || [])[1];
  ok(top === want && cnt >= min, `search "${q}": ${want} first (top ${top}), ${cnt} >= ${min}`);
}
// "mobile … dark luxury": the first screen is a mobile luxury one
const dl = await call("search_ui_screens", { query: "mobile dating swipe dark luxury" });
ok(/^1\. .+ — mobile, luxury \(Duskwell\)$/m.test(dl) && /^\s+screen_id: .+ · pattern: dating-swipe /m.test(dl), "dark luxury query: result 1 is a mobile, luxury dating-swipe screen");
// neighbours keep their queries (local rows include them; live has many more)
for (const [q, want] of [["team chat inbox", "chat-list"], ["onboarding carousel", "onboarding-carousel"], ["account settings", "settings"]]) {
  const t = await call("search_ui_screens", { query: q }), top = (t.match(/(?:^\s+|· )pattern: ([a-z0-9-]+)/m) || [])[1];
  ok(top === want, `neighbour "${q}" still leads with ${want} (top ${top})`);
}
console.log(`\n${n - fails}/${n} checks passed`);
process.exit(fails ? 1 : 0);
