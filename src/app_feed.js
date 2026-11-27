// App collections for GET /api/feed (app-collections-feed, 28-Nov-2026; owner request from TestFlight feedback): the MGD app's
// Inspiration tab can show our own website templates, UI screens, brand guides and font pairings next to the gallery/museum/annual
// images. Same response shape the app already parses ({ items, nextCursor }, keyset paging on a numeric cursor) plus fields the
// app's detail screen uses: kind, page_url (the madegooddesigns.com page), image_dark (UI light/dark twin), code_url (UI HTML).
//
// D1 cost per page (limit 30; the feed is edge-cached 30 min on top of this), measured on the live DB 28-Nov-2026:
//   website-templates  collection='ui' AND category IN (105 page patterns), idx_items_feed range scan newest first:
//                      ~30 rows when templates lead (1,726 of 5,390 ui rows = 32%, so ~95 rows a page on average deeper down)
//   ui-screens         collection='ui' AND category NOT IN (…): ~45 rows a page on average; a page that starts in a run of templates
//                      reads through it (first page today: 1,428 rows, then ~30-60); first pages are cached 6 h (deps.cache)
//   brand-guides       collection='design' AND category='branding' AND title LIKE '% — Brand Guidelines', INDEXED BY
//                      idx_items_category (the planner otherwise picks idx_items_feed and walks all design rows): ~70 rows for 24
//                      (each guide has 3 tiles: guidelines / typeface / colour palette; only the cover tile is shown)
//   font-pairings      0 rows: served from src/app_font_pairings.js (generated from font_pairings.json + WP featured images)
// Read-only. Never touches owner (user) rows, link-only rows or anything not status='published'.

import { APP_FONT_PAIRINGS } from "./app_font_pairings.js";

export const APP_COLLECTIONS = ["website-templates", "ui-screens", "brand-guides", "font-pairings"];
export const isAppCollection = (c) => APP_COLLECTIONS.includes(c);

const SITE = "https://madegooddesigns.com";
const BRAND_SUFFIX = " — Brand Guidelines";
const PUBLIC = "status = 'published' AND owner_id IS NULL";

// deps (from index.js, so this file stays importable by node tests without JSON/HTML module imports):
//   pagePatterns: UI_PAGE_PATTERNS, rowToItem(row, env), uiItemPath(it, base), base: the mount path ("/inspiration"), isPublicRow(row)
export async function appFeed(col, url, env, deps) {
  const limit = clampInt(url.searchParams.get("limit"), 24, 1, 60);
  const cursor = parseInt(url.searchParams.get("cursor"), 10) || null;
  if (col === "font-pairings") return fontPairingsPage(cursor, limit, deps.base);

  const binds = [];
  let sql;
  if (col === "website-templates" || col === "ui-screens") {
    const pats = deps.pagePatterns;
    // Inlined as quoted literals, not binds: D1 allows at most 100 bound parameters per query and there are 105+ patterns
    // (28-Nov: binding them threw -> 1101). The patterns are our own constants; quotes are doubled anyway.
    const lits = pats.map((p) => "'" + String(p).replace(/'/g, "''") + "'").join(",");
    const where = [`collection = 'ui'`, PUBLIC, `category ${col === "ui-screens" ? "NOT IN" : "IN"} (${lits})`];
    if (cursor) { where.push("created_at < ?"); binds.push(cursor); }
    sql = `SELECT * FROM items INDEXED BY idx_items_feed WHERE ${where.join(" AND ")} ORDER BY created_at DESC LIMIT ?`;
  } else if (col === "brand-guides") {
    const where = [`collection = 'design'`, `category = 'branding'`, PUBLIC, `title LIKE ?`, `source_url LIKE ?`];
    binds.push("%" + BRAND_SUFFIX, SITE + "/%");
    if (cursor) { where.push("created_at < ?"); binds.push(cursor); }
    sql = `SELECT * FROM items INDEXED BY idx_items_category WHERE ${where.join(" AND ")} ORDER BY created_at DESC LIMIT ?`;
  } else return null;

  const load = async () => (await env.DB.prepare(sql).bind(...binds, limit).all()).results || [];
  // First pages are what nearly every visit asks for: kept 6 hours per colo (deps.cache = mcp_cache shared()), so the one
  // expensive page (ui-screens page 1 walks a run of templates: ~1.4k rows) is read a few times a day, not every 30 minutes.
  const rows = !cursor && deps.cache ? await deps.cache(`app-feed|${col}|${limit}`, load) : await load();
  const items = [];
  for (const r of rows) {
    if (!deps.isPublicRow(r)) continue;
    const it = col === "brand-guides" ? brandItem(r, env, deps) : uiItem(r, col, env, deps);
    if (it) items.push(it);
  }
  // nextCursor comes from the last ROW read (not the last item kept), so a skipped row can't end paging early.
  const nextCursor = rows.length === limit ? rows[rows.length - 1].created_at : null;
  return { items, nextCursor };
}

function uiItem(r, col, env, deps) {
  const base = deps.rowToItem(r, env); // adds uiFields: pattern, platform, variant, image_dark, code, design_md
  const it = {
    id: base.id, title: base.title, description: base.description, image: base.image, width: base.width, height: base.height,
    created_at: base.created_at, collection: col, kind: col === "website-templates" ? "template" : "ui-screen",
    source_host: "madegooddesigns.com",
    page_url: SITE + deps.uiItemPath({ id: base.id, pattern: base.pattern, variant: base.variant, platform: base.platform, style: base.style }, deps.base),
    image_dark: base.image_dark || null,
    code_url: base.code ? SITE + deps.base + base.code : null,
    platform: base.platform || null, style: base.style || null,
  };
  return it;
}

function brandItem(r, env, deps) {
  const page = String(r.source_url || "").replace(/#.*$/, "");
  if (!page.startsWith(SITE + "/")) return null; // our own guide pages only (no outbound links)
  const base = deps.rowToItem(r, env);
  const brand = String(r.title || "").slice(0, -BRAND_SUFFIX.length).trim();
  return {
    id: base.id, title: base.title, description: base.description, image: base.image, width: base.width, height: base.height,
    created_at: base.created_at, collection: "brand-guides", kind: "brand-guide", source_host: "madegooddesigns.com",
    page_url: page, brand: brand || null,
  };
}

// Font pairings: position paging over the generated list (cursor = how many items the client has already seen; first page null).
// Image URLs are absolute (WordPress uploads on madegooddesigns.com, not the /inspiration image store).
export function fontPairingsPage(cursor, limit, _base) {
  const start = Math.max(0, cursor || 0);
  const slice = APP_FONT_PAIRINGS.slice(start, start + limit);
  const items = slice.map((f) => ({
    id: "fp-" + f.k.replace(/[^a-z0-9]+/g, "-"), title: `${f.font} font pairings`,
    description: f.partners.length ? `${f.n} pairings for ${f.font}, including ${f.partners.join(", ")}.` : f.title,
    image: f.thumb || f.img, image_full: f.img, width: f.w || null, height: f.h || null,
    created_at: Date.parse(f.d + "Z") || null, collection: "font-pairings", kind: "font-pairing", source_host: "madegooddesigns.com",
    page_url: f.page, font: f.font, partners: f.partners,
  }));
  const next = start + slice.length;
  return { items, nextCursor: slice.length === limit && next < APP_FONT_PAIRINGS.length ? next : null };
}

function clampInt(v, d, lo, hi) { const n = parseInt(v, 10); return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : d; }
