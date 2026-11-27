// app-collections-feed (28-Nov-2026): GET /api/feed collections for the MGD app (src/app_feed.js).
// Runs the module's real SQL against an in-memory SQLite (node:sqlite) with the production indexes, so each collection, keyset paging,
// the public-row filters and the query plans (no full scans, no temp b-tree sort) are checked without D1.
// Run: node --no-warnings tests/app_feed.test.mjs
import assert from "node:assert";
import { DatabaseSync } from "node:sqlite";
import { appFeed, fontPairingsPage, isAppCollection, APP_COLLECTIONS } from "../src/app_feed.js";
import { APP_FONT_PAIRINGS } from "../src/app_font_pairings.js";

const PAGES = ["restaurant-website", "agency-website", "bakery-website"];
const db = new DatabaseSync(":memory:");
db.exec(`CREATE TABLE items (id TEXT PRIMARY KEY, title TEXT, description TEXT, source_url TEXT, source_host TEXT, image_key TEXT,
  width INTEGER, height INTEGER, tags TEXT, themes TEXT, palette TEXT, style TEXT, status TEXT, owner_id TEXT, collection TEXT,
  category TEXT, company TEXT, country TEXT, industry TEXT, designer TEXT, report_year INTEGER, created_at INTEGER, hosting TEXT);
  CREATE INDEX idx_items_created ON items(created_at DESC);
  CREATE INDEX idx_items_collection ON items(collection, created_at DESC);
  CREATE INDEX idx_items_category ON items(collection, category, created_at DESC);
  CREATE INDEX idx_items_feed ON items(collection, status, owner_id, created_at DESC);`);
const ins = db.prepare(`INSERT INTO items (id,title,description,source_url,source_host,image_key,width,height,tags,style,status,owner_id,collection,category,country,created_at)
  VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
let t = 1_000_000, n = 0;
const hex = () => (++n).toString(16).padStart(12, "0");
// ui: alternating templates and screens, plus an unpublished one and an owner (user) row that must never show
for (let i = 0; i < 40; i++) {
  const tpl = i % 3 === 0, id = hex(), cat = tpl ? PAGES[i % PAGES.length] : "login";
  ins.run(id, `${cat} ${i}`, "d", null, null, `ui/${id}-v${i}.webp`, 1440, tpl ? 6400 : 900, JSON.stringify([cat, "variant:signature"]), "minimal", "published", null, "ui", cat, "web", t++);
}
ins.run(hex(), "draft tpl", "", null, null, "ui/x.webp", 1, 1, "[]", "minimal", "staged", null, "ui", "bakery-website", "web", t++);
ins.run(hex(), "user tpl", "", null, null, "ui/y.webp", 1, 1, "[]", "minimal", "published", "user1", "ui", "bakery-website", "web", t++);
// brand guides: 3 tiles each (only the cover counts), a non-guide branding item, and a guide tile that points off-site
for (let i = 0; i < 12; i++) {
  for (const kind of ["Brand Guidelines", "Typeface", "Colour Palette"])
    ins.run(hex(), `Brand${i} — ${kind}`, "", `https://madegooddesigns.com/brand${i}-brand-guidelines/#${kind === "Brand Guidelines" ? "cover" : "type"}`, "madegooddesigns.com", `items/${n.toString(16).padStart(12, "0")}.png`, 1536, 1024, "[]", null, "published", null, "design", "branding", null, t++);
}
ins.run(hex(), "Some logo — Brand Guidelines", "", "https://example.com/x", "example.com", "items/zzz.png", 1, 1, "[]", null, "published", null, "design", "branding", null, t++);
ins.run(hex(), "Poster", "", "https://unsplash.com/x", "unsplash.com", "items/p.png", 1, 1, "[]", null, "published", null, "design", "branding", null, t++);

const env = { DB: { prepare: (sql) => ({ bind: (...b) => ({ all: async () => ({ results: db.prepare(sql).all(...b) }) }) }) } };
let lastSql = [];
const envSpy = { DB: { prepare: (sql) => { lastSql.push(sql); return env.DB.prepare(sql); } } };
const deps = {
  pagePatterns: PAGES, base: "/inspiration",
  isPublicRow: (r) => !!r && r.status === "published" && r.hosting !== "link",
  uiItemPath: (it, base) => `${base}/ui/${[it.pattern, it.variant, it.platform, it.style].filter(Boolean).join("-")}-${it.id}`,
  rowToItem: (r) => {
    const tags = JSON.parse(r.tags || "[]"), v = tags.find((x) => x.startsWith("variant:"));
    const it = { id: r.id, title: r.title, description: r.description, image: `/img/${r.image_key}`, width: r.width, height: r.height, style: r.style, created_at: r.created_at };
    if (r.collection === "ui") Object.assign(it, { pattern: r.category, platform: r.country, variant: v ? v.slice(8) : null, code: `/ui/raw/${r.id}.html`,
      image_dark: /-v\d+\.webp$/.test(r.image_key) ? `/img/${r.image_key.replace(/\.webp$/, "-dark.webp")}` : null });
    return it;
  },
};
const U = (q) => new URL("https://madegooddesigns.com/inspiration/api/feed?" + q);
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };

async function all(col, limit) {
  const out = []; let cursor = null, pages = 0;
  do {
    const r = await appFeed(col, U(`collection=${col}&limit=${limit}` + (cursor !== null ? `&cursor=${cursor}` : "")), env, deps);
    out.push(...r.items); cursor = r.nextCursor; pages++;
    ok(pages < 100, "paging terminates");
  } while (cursor !== null);
  return { out, pages };
}

// collection names
ok(APP_COLLECTIONS.length === 4 && APP_COLLECTIONS.every(isAppCollection), "4 app collections");
ok(!isAppCollection("design") && !isAppCollection("ui") && !isAppCollection("nope"), "others are not app collections");
ok((await appFeed("nope", U("limit=5"), env, deps)) === null, "unknown col -> null (index.js falls back to the default gallery)");

// website templates
{
  const { out, pages } = await all("website-templates", 5);
  ok(out.length === 14, `14 published public templates (got ${out.length})`);
  ok(pages === 3, `5+5+4 → 3 pages (got ${pages})`);
  ok(new Set(out.map((x) => x.id)).size === out.length, "no repeats across pages");
  ok(out.every((x, i) => i === 0 || x.created_at < out[i - 1].created_at), "newest first");
  ok(out.every((x) => x.kind === "template" && x.collection === "website-templates" && PAGES.some((p) => x.page_url.includes("/ui/" + p))), "kind + page_url");
  ok(out.every((x) => x.page_url.startsWith("https://madegooddesigns.com/inspiration/ui/") && x.code_url === `https://madegooddesigns.com/inspiration/ui/raw/${x.id}.html`), "MGD links only");
  ok(out.every((x) => x.image_dark && x.image_dark.endsWith("-dark.webp") && x.image.startsWith("/img/ui/")), "light + dark thumbs");
  ok(!out.some((x) => /draft|user/.test(x.title)), "no staged or user rows");
}
// ui screens
{
  const { out } = await all("ui-screens", 7);
  ok(out.length === 26 && out.every((x) => x.kind === "ui-screen" && x.page_url.includes("/ui/login-")), `26 screens, none of them templates (got ${out.length})`);
}
// brand guides
{
  const { out } = await all("brand-guides", 5);
  ok(out.length === 12, `12 guides, one cover tile each (got ${out.length})`);
  ok(out.every((x) => /^Brand\d+ — Brand Guidelines$/.test(x.title) && x.brand === x.title.replace(" — Brand Guidelines", "")), "cover tiles only, brand name");
  ok(out.every((x) => /^https:\/\/madegooddesigns\.com\/brand\d+-brand-guidelines\/$/.test(x.page_url)), "page_url = guide page, no #cover, MGD only");
}
// font pairings (0 D1)
{
  lastSql = [];
  const p1 = await appFeed("font-pairings", U("collection=font-pairings&limit=30"), envSpy, deps);
  ok(lastSql.length === 0, "font pairings make no D1 query");
  ok(p1.items.length === 30 && p1.nextCursor === 30, "first page 30, cursor 30");
  const p2 = await appFeed("font-pairings", U("collection=font-pairings&limit=30&cursor=30"), env, deps);
  ok(p2.items[0].id !== p1.items[0].id && !p1.items.some((x) => p2.items.some((y) => y.id === x.id)), "page 2 is new items");
  const last = fontPairingsPage(APP_FONT_PAIRINGS.length - 3, 30);
  ok(last.items.length === 3 && last.nextCursor === null, "last page ends paging");
  ok(fontPairingsPage(APP_FONT_PAIRINGS.length - 30, 30).nextCursor === null, "exact last page ends paging");
  const every = fontPairingsPage(0, 10000).items;
  ok(new Set(every.map((x) => x.id)).size === every.length, "unique ids");
  ok(every.every((x) => x.page_url.startsWith("https://madegooddesigns.com/") && x.image.startsWith("https://madegooddesigns.com/wp-content/") && x.width && x.height), "MGD page + image, sized");
  ok(every.length > 600, `600+ guides (got ${every.length})`);
}
// first-page cache hook: used for page 1 only, never for a cursor page
{
  const used = [];
  const d2 = { ...deps, cache: async (name, loader) => { used.push(name); return loader(); } };
  await appFeed("ui-screens", U("limit=30"), env, d2);
  await appFeed("ui-screens", U("limit=30&cursor=1000020"), env, d2);
  await appFeed("font-pairings", U("limit=30"), env, d2);
  ok(used.length === 1 && used[0] === "app-feed|ui-screens|30", `cache hook only on page 1 (${used})`);
}
// limit clamp
ok((await appFeed("ui-screens", U("limit=999"), env, deps)).items.length === 26, "limit clamps to 60");

// query plans: every SQL is an index search, never a full scan or a temp sort
for (const col of ["website-templates", "ui-screens", "brand-guides"]) {
  for (const q of ["limit=30", "limit=30&cursor=1000020"]) {
    lastSql = [];
    await appFeed(col, U(q), envSpy, deps);
    const sql = lastSql[0];
    const nBinds = (sql.match(/\?/g) || []).length;
    const plan = db.prepare("EXPLAIN QUERY PLAN " + sql).all(...Array(nBinds).fill("x")).map((r) => r.detail).join(" | ");
    ok(/SEARCH items USING INDEX/.test(plan) && !/SCAN items|TEMP B-TREE/.test(plan), `${col} ${q}: ${plan}`);
  }
}
console.log(`app_feed: ${checks} checks passed`);
