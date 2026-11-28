// /ui/website-templates hub redesign (owner, 28-Nov-2026): category cards with niche image tiles replace the "By category" list and the
// ~90-chip "Website templates" sub-filter row; the Platform/Screens/Components/Websites rows fold behind one closed "Filters" <details>.
// Renders the real Worker against an in-memory D1 seeded with one web screen per template pattern (plus a few other screens), so it
// needs no local D1 copy. Run: node --no-warnings --import=./tests/r3/register.mjs tests/test_tpl_hub_cards.mjs
import { DatabaseSync } from "node:sqlite";
import { makeEnv, cacheShim } from "./r3/env.mjs";
globalThis.caches = cacheShim();
const { default: worker } = await import("../src/index.js");
const C = await import("../src/ui_component_page.js"), T = await import("../src/ui_tree.js"), U = await import("../src/ui_screens.js"), P = await import("../src/ui_templates.js"), SEO = await import("../src/ui_seo.js");
let ok = 0, fail = 0;
const t = (name, cond, info) => { cond ? ok++ : fail++; console.log((cond ? "ok   " : "FAIL ") + name + (cond || info == null ? "" : " | " + String(info).slice(0, 400))); };

const db = new DatabaseSync(":memory:");
db.exec(`CREATE TABLE items (id TEXT PRIMARY KEY, title TEXT, description TEXT, source_url TEXT, source_host TEXT, image_key TEXT NOT NULL, width INTEGER, height INTEGER,
  tags TEXT DEFAULT '[]', themes TEXT DEFAULT '[]', palette TEXT DEFAULT '[]', style TEXT, status TEXT NOT NULL DEFAULT 'published', created_at INTEGER NOT NULL,
  owner_id TEXT, collection TEXT DEFAULT 'design', company TEXT, report_year INTEGER, designer TEXT, industry TEXT, country TEXT, hue REAL, category TEXT, image_url TEXT,
  photographer_url TEXT, featured_on TEXT, unsplash_id TEXT, daily_query TEXT, featured_rank INTEGER, rights TEXT, rights_holder TEXT, hosting TEXT);`);
const ins = db.prepare("INSERT INTO items (id,title,image_key,width,height,style,created_at,collection,country,category) VALUES (?,?,?,?,?,?,?,?,?,?)");
let seq = 0; const hex = () => (++seq).toString(16).padStart(12, "0");
const seedPatterns = [...U.UI_PAGE_PATTERNS, "pricing", "hero-section", "login", C.UI_COMPONENT_PATTERNS[0]];
for (const p of seedPatterns) for (const style of ["minimal", "editorial"]) { const id = hex(); ins.run(id, `${p} ${style}`, `ui/${id}-k.webp`, 1440, 4000, style, 1, "ui", "web", p); }
{ const id = hex(); ins.run(id, "login mobile", `ui/${id}-k.webp`, 390, 844, "minimal", 1, "ui", "mobile", "login"); }
const E = makeEnv(db, { version: "hub-cards-1" });
const get = async (path) => { const r = await worker.fetch(new Request("https://madegooddesigns.com/inspiration" + path, { headers: { "User-Agent": "curl/8.4.0" } }), E.env, { waitUntil() {}, passThroughOnException() {} }); return { status: r.status, body: await r.text() }; };

const hub = await get("/ui/website-templates"), B = "/inspiration";
t("hub renders 200", hub.status === 200, hub.status);
const html = hub.body, hrefs = new Set([...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1].replace(/&amp;/g, "&")));
// every industry hub, category page and live niche page is linked from the hub
const inds = Object.values(T.INDUSTRIES).filter((i) => T.industryNiches(i.id).length);
const miss = inds.filter((i) => !hrefs.has(`${B}/ui/${i.hub}`)).map((i) => i.hub);
t(`every industry hub linked (${inds.length})`, inds.length > 0 && miss.length === 0, miss);
const cats = T.liveCategories(), missC = cats.filter((c) => !hrefs.has(`${B}/ui/${T.categoryPath(c)}`)).map((c) => c.seg);
t(`every live category page linked (${cats.length})`, missC.length === 0, missC);
const niches = T.NICHES.filter((n) => n.htmlLive), missN = niches.filter((n) => !hrefs.has(`${B}/ui/${T.nichePath(n)}`)).map((n) => n.id);
t(`every live niche page linked (${niches.length})`, missN.length === 0, missN);
// the old sub-filter row's hrefs (one per template pattern with a screen) are all still on the page
const chipHrefs = U.UI_PAGE_PATTERNS.map((p) => SEO.cleanUiUrl({ platform: "", group: "websites", pattern: p, style: "" }, B));
const missP = chipHrefs.filter((u) => !hrefs.has(u)); t(`every former niche-chip href still present (${chipHrefs.length})`, missP.length === 0, missP);
// cards
const loose = inds.filter((i) => !T.homeCategory(i.id));
const nCards = (html.match(/<section class="cat">/g) || []).length;
t(`cards = live categories + More industries (${nCards})`, nCards === cats.length + (loose.length ? 1 : 0) && nCards > 0, nCards);
t("one .cats grid, before the filters, after the intro", html.indexOf('<div class="cats">') > html.indexOf('<p class="lede">') && html.indexOf('<div class="cats">') < html.indexOf('<div class="filters">'));
t('"By category" list is gone', !html.includes(">By category</h2>"));
const cardsHtml = html.slice(html.indexOf('<div class="cats">'), html.indexOf('<div class="filters">'));
const sections = cardsHtml.split('<section class="cat">').slice(1);
let tileOk = true, tileInfo = "";
for (const s of sections) {
  const topPart = s.split("<details>")[0], restPart = s.includes("<details>") ? s.slice(s.indexOf("<details>")) : "";
  const nTop = (topPart.match(/class="ct"/g) || []).length, nRest = (restPart.match(/class="ct"/g) || []).length, more = (restPart.match(/\+(\d+) more/) || [])[1];
  if (nTop > P.CAT_TOP || (nRest && (nTop !== P.CAT_TOP || +more !== nRest)) || (!nRest && restPart)) { tileOk = false; tileInfo += ` ${nTop}/${nRest}/${more}`; }
}
t(`each card: top ${P.CAT_TOP} tiles, the rest inside <details> "+N more"`, tileOk, tileInfo);
const tiles = [...cardsHtml.matchAll(/<a class="ct" href="[^"]+"><span class="ti">(<img [^>]*>)?<\/span>/g)];
const imgs = tiles.map((m) => m[1]).filter(Boolean);
t(`tiles = live niches (${tiles.length})`, tiles.length === niches.length, tiles.length);
t("every tile image: lazy, alt, width/height, stored-only thumb route", imgs.length === tiles.length && imgs.every((i) => /loading="lazy"/.test(i) && /alt="[^"]+"/.test(i) && /width="320" height="\d+"/.test(i) && /src="\/inspiration\/img\/t\/ui\/[0-9a-f]{12}-k\.webp\?src=app"/.test(i)), imgs.find((i) => !/loading="lazy"/.test(i)));
t("tile picture is the niche pattern's first web screen (deterministic)", (() => { const n = niches[0], m = cardsHtml.match(new RegExp(`href="${B}/ui/${T.nichePath(n).replace(/[/.]/g, "\\$&")}"><span class="ti"><img [^>]*src="([^"]+)"`)); const row = db.prepare("SELECT id FROM items WHERE category=? AND country='web' AND style='minimal'").get(n.pattern); return m && m[1].includes(row.id); })());
t("tile labels drop a trailing ' website'", !/<span class="tl">[^<]* website<\/span>/i.test(cardsHtml));
// filters fold
const fstart = html.indexOf('<div class="filters">'), fhtml = html.slice(fstart, html.indexOf('id="count"'));
t('filters wrapped in a closed <details class="ffold"> with a "Filters" summary', /^<div class="filters"><details class="ffold"><summary>Filters<\/summary>/.test(fhtml));
const fold = fhtml.slice(0, fhtml.indexOf("</details>"));
t("Platform, Screens, Components and Websites rows are inside the fold", ["<b>Platform</b>", "<b>Screens</b>", "<b>Components</b>", "<b>Websites</b>"].every((x) => fold.includes(x)), fold.slice(0, 200));
t("Style row stays outside the fold", fhtml.includes("<b>Style</b>") && !fold.includes("<b>Style</b>"));
t('the ~90-chip "websites" sub row is gone from the hub', !fhtml.includes('data-g="websites"') && !fhtml.includes(">All website templates</a>"));
t("FILTER_JS opens the fold on a non-default filter", html.includes('document.querySelector(".filters .ffold")') && html.includes("fd.open=true"));
t("hub CSS carries the card grid breakpoints (3/2/1)", html.includes(".cats{display:grid;grid-template-columns:repeat(3,") && /max-width:960px\)\{\.cats\{grid-template-columns:repeat\(2,/.test(html) && /max-width:620px\)\{\.cats\{grid-template-columns:minmax\(0,1fr\)\}/.test(html));
t("no outbound links in the cards", ![...cardsHtml.matchAll(/href="([^"]+)"/g)].some((m) => /^https?:/.test(m[1])));
// other UI pages keep their filters as they are
for (const p of ["/ui", "/ui/website-sections"]) {
  const r = await get(p); if (r.status !== 200) { t(`${p} renders`, false, r.status); continue; }
  t(`${p}: filters not folded, no cards`, !r.body.includes('class="ffold"') && !r.body.includes('<div class="cats">') && /<div class="filters"><div><b>Platform<\/b>/.test(r.body));
}
{ const r = await get("/ui"); t("/ui keeps the websites sub row", r.body.includes('<div class="sub" data-g="websites"')); }
console.log(`${ok} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
