// MGD Inspiration — Cloudflare Worker
// Routes: gallery (/), curation UI (/add), image serving (/img/*), JSON API (/api/*).
// Data in D1 (env.DB), images in R2 (env.BUCKET). Enrichment via NVIDIA Build (NIM).

import GALLERY_HTML from "./ui/gallery.html";
import ADD_HTML from "./ui/add.html";
import ANNUAL_HTML from "./ui/annual-reports.html";
import MUSEUM_HTML from "./ui/museum.html";
import BOARD_CANVAS_JS from "./ui/board-canvas.html"; // plain JS, imported as Text via the *.html rule
import SAVE_HTML from "./ui/save.html";
import { getUser, googleLogin, googleCallback, logout, devLogin } from "./auth.js";
import { MGDRoles, MGDDesignMd } from "./design_core.js";
import { boardRolesFromWeights } from "./board_design.js";
import { TOOL_DEFS as MCP_TOOLS_43, isToolsTool, callToolsTool } from "./mcp_tools.js";
import { TOOL_DEFS as MCP_TOOLS_44, isTools44Tool, callTools44Tool } from "./mcp_tools44.js";
import { TOOL_DEFS as MCP_TOOLS_45, isTools45Tool, callTools45Tool } from "./mcp_tools45.js";
import { UI_MCP_TOOLS, isUiTool, callUiTool, uiRoute, uiFields } from "./ui_screens.js";
import { wellKnownKind, wellKnown, oauthCors, register as oauthRegister, authorize as oauthAuthorize,
  token as oauthToken, revoke as oauthRevoke, verifyBearer, challengeHeader,
  connectedAppsApi, connectedAppsPage } from "./oauth.js";

// Aggressive AI-training / SEO / bulk crawlers that spider the JSON read API (which is
// meant for the SPA running in real browsers) and can burn the D1 read quota on cache
// misses. Real search engines (Googlebot/Bingbot/DuckDuckBot/Applebot) are intentionally
// NOT listed, so HTML/GEO indexing is unaffected — only these bulk scrapers get a cheap 403.
const BLOCKED_BOT_RE = /(GPTBot|OAI-SearchBot|ChatGPT-User|ClaudeBot|Claude-Web|anthropic-ai|CCBot|Google-Extended|Applebot-Extended|PerplexityBot|Perplexity-User|Bytespider|Amazonbot|meta-externalagent|FacebookBot|Diffbot|DataForSeoBot|AhrefsBot|SemrushBot|MJ12bot|DotBot|PetalBot|Bytedance|YandexBot|Timpibot|ImagesiftBot|Omgili|magpie-crawler|Scrapy|python-requests|node-fetch|Go-http-client)/i;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const method = request.method;
    // Optional mount prefix so the Worker can live at e.g. madegooddesigns.com/inspiration
    // via a Cloudflare route. Default "" = mounted at root (workers.dev).
    const base = (env.BASE_PATH || "").replace(/\/$/, "");
    let path = url.pathname;
    if (base && path.startsWith(base)) path = path.slice(base.length) || "/";

    // OAuth discovery docs (RFC 8414 / RFC 9728). Matched on the RAW pathname because the
    // spec-correct path-inserted form (/.well-known/<doc>/inspiration...) sits OUTSIDE the
    // /inspiration prefix (needs its own Worker route — see MCP_OAUTH_README.md).
    const wk = wellKnownKind(url.pathname, base);
    if (wk) {
      if (method === "OPTIONS") return new Response(null, { status: 204, headers: oauthCors() });
      if (method === "GET") return wellKnown(wk, url, base, env);
      return new Response("method not allowed", { status: 405, headers: oauthCors() });
    }
    // CORS preflight for OAuth endpoints called from browser-based MCP clients.
    if (method === "OPTIONS" && (path === "/oauth/token" || path === "/oauth/register" || path === "/oauth/revoke")) {
      return new Response(null, { status: 204, headers: oauthCors() });
    }

    // CORS preflight for the API (gallery may be embedded on the WP site, cross-origin).
    if (method === "OPTIONS" && path.startsWith("/api/")) {
      return new Response(null, { status: 204, headers: corsHeaders(env, request) });
    }

    // Bot-guard: reject aggressive AI/SEO/bulk crawlers on the public JSON READ endpoints
    // BEFORE any D1 query, so a crawl storm can't burn the read quota on cache misses. Scoped
    // to the machine-only read API (the SPA calls these from real browsers); the HTML pages
    // (gallery, annual reports) and real search engines are unaffected. The 403 is itself
    // cacheable so repeat bot hits never reach the Worker's D1 path again for a day.
    if (method === "GET" &&
        (path === "/api/feed" || path === "/api/categories" || path === "/api/annual-facets" || path === "/api/museum-facets" ||
         path === "/api/search" || path.startsWith("/api/item/")) &&
        BLOCKED_BOT_RE.test(request.headers.get("User-Agent") || "")) {
      return new Response("This JSON API is for the app UI; crawl the HTML pages instead.", {
        status: 403,
        headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=86400" },
      });
    }

    try {
      // ---- Pages (inject the mount base so the front-end builds correct URLs) ----
      // Trailing-slash variants of collection pages → canonical (articles and people link both ways)
      if (method === "GET" && /^\/(museum|annual-reports|ui)(\/.*)?\/$/.test(path)) return Response.redirect(new URL(base + path.replace(/\/+$/, ""), request.url).toString(), 301);
      if (path === "/" && method === "GET") return html(injectBase(GALLERY_HTML, base));
      if (path === "/add" && method === "GET") return html(injectBase(ADD_HTML, base));
      if (path === "/annual-reports" && method === "GET") return html(injectBase(ANNUAL_HTML, base));
      if (path === "/annual-reports/sitemap.xml" && method === "GET") return annualSitemap(env, base);
      // One index of every collection sitemap; WordPress (robots.txt + RankMath) points only here, so new collections need no WP change.
      if (path === "/sitemap_index.xml" && method === "GET") {
        const origin = env.PUBLIC_ORIGIN || url.origin, today = new Date().toISOString().slice(0, 10);
        return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`
          + WORKER_SITEMAPS.map((p) => `<sitemap><loc>${origin}${base}${p}</loc><lastmod>${today}</lastmod></sitemap>`).join("\n") + `\n</sitemapindex>`,
          { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
      }
      if (path === "/museum" && method === "GET") return html(injectBase(MUSEUM_HTML, base));
      if (method === "GET" && (path === "/ui" || path.startsWith("/ui/"))) { const r = await uiRoute(path, request, env, ctx, base, UI_H); if (r) return r; }
      { const bm = path.match(/^\/b\/([a-z0-9]{10})$/); if (bm && method === "GET") return publicBoardPage(bm[1], env, base, url); }
      if (path === "/save" && method === "GET") return html(injectBase(SAVE_HTML, base));
      if (path === "/assets/board-canvas.js" && method === "GET")
        return new Response(BOARD_CANVAS_JS, { headers: { "Content-Type": "application/javascript; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
      if (path === "/museum/sitemap.xml" && method === "GET") return museumSitemap(env, base);
      if (path === "/museum/index" && method === "GET") return edgeCache(request, ctx, 1800, () => museumIndexPage(env, base));
      { const mm = path.match(/^\/museum\/(artist|museum|type|culture|theme)\/([^/]+)$/);
        if (mm && method === "GET") return edgeCache(request, ctx, 1800, () => museumFacetPage(mm[1], decodeURIComponent(mm[2]), env, base)); }
      if (path.startsWith("/museum/") && method === "GET") return edgeCache(request, ctx, 1800, () => museumItemPage(path.slice(8), env, base));
      // IndexNow key file (lets us push URL updates to Bing/Yandex; keyLocation points here)
      if (path === "/a7f3c9e14b8d4a2f9c6e1d0b3a5f8e2c.txt" && method === "GET")
        return new Response("a7f3c9e14b8d4a2f9c6e1d0b3a5f8e2c", { headers: { "Content-Type": "text/plain" } });
      // These annual-report pages run heavy GROUP BY / full-scan facet queries over
      // all annual rows — edge-cache them (they change only when reports are added).
      if (path === "/annual-reports/index" && method === "GET") return edgeCache(request, ctx, 1800, () => annualIndexPage(env, base));
      if (path.startsWith("/annual-reports/designer/") && method === "GET") return edgeCache(request, ctx, 1800, () => annualFacetPage("designer", decodeURIComponent(path.slice("/annual-reports/designer/".length)), env, base));
      if (path.startsWith("/annual-reports/company/") && method === "GET") return edgeCache(request, ctx, 1800, () => annualFacetPage("company", decodeURIComponent(path.slice("/annual-reports/company/".length)), env, base));
      if (path.startsWith("/annual-reports/industry/") && method === "GET") return edgeCache(request, ctx, 1800, () => annualFacetPage("industry", decodeURIComponent(path.slice("/annual-reports/industry/".length)), env, base));
      if (path.startsWith("/annual-reports/country/") && method === "GET") return edgeCache(request, ctx, 1800, () => annualFacetPage("country", decodeURIComponent(path.slice("/annual-reports/country/".length)), env, base));
      if (path.startsWith("/annual-reports/") && method === "GET") return edgeCache(request, ctx, 1800, () => annualItemPage(path.slice(16), env, base));

      // ---- MCP server (public, for AI assistants) ----
      if (path === "/mcp") return mcpHandler(request, env);
      // ---- Authenticated MCP (OAuth 2.1 bearer; the user's own boards + the public tools) ----
      if (path === "/mcp/boards" || path === "/mcp/boards/") return mcpMeHandler(request, env, ctx, url, base);

      // ---- OAuth 2.1 authorization server (for /mcp/boards) ----
      if (path === "/oauth/register" && method === "POST") return oauthRegister(request, env);
      if (path === "/oauth/authorize" && (method === "GET" || method === "POST")) return oauthAuthorize(request, url, env, base);
      if (path === "/oauth/token" && method === "POST") return oauthToken(request, url, env, base, ctx);
      if (path === "/oauth/revoke" && method === "POST") return oauthRevoke(request, env);
      if (path === "/account/connected-apps" && method === "GET") return connectedAppsPage(request, url, env, base);
      if (path === "/account/connected-apps/revoke" && method === "POST") return connectedAppsPage(request, url, env, base);
      if (path === "/api/me/connected-apps" && method === "GET") return connectedAppsApi(request, env, null);
      if (path.match(/^\/api\/me\/connected-apps\/[^/]+$/) && method === "DELETE") return connectedAppsApi(request, env, path.split("/")[4]);

      // ---- Auth (return Response directly) ----
      if (path === "/auth/google/login" && method === "GET") return googleLogin(request, url, env, base);
      if (path === "/auth/google/callback" && method === "GET") return googleCallback(request, url, env, base);
      if (path === "/auth/logout") return logout(url, base);
      if (path === "/auth/dev-login" && method === "GET") return devLogin(request, url, env, base);

      // ---- Image serving from R2 ----
      if (path.startsWith("/img/") && method === "GET") return serveImage(path.slice(5), env);

      // ---- Newsletter subscribe (public; WP footer + app) ----
      if (path === "/api/subscribe" && method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(env, request) });
      if (path === "/api/subscribe" && method === "POST") return subscribe(request, env);

      // ---- Content API ----
      // Public read endpoints are identical for all anonymous visitors and change
      // only when we add items (a few times/day), so we edge-cache them (Cache API,
      // keyed on URL) to collapse thousands of repeat D1 reads into ~one per TTL.
      if (path === "/api/items" && method === "POST") return addItem(request, env);
      if (path === "/api/feed" && method === "GET") return edgeCache(request, ctx, 1800, () => feed(url, env, request));
      if (path === "/api/categories" && method === "GET") return edgeCache(request, ctx, 21600, () => categoriesFacet(url, env, request));
      if (path === "/api/annual-facets" && method === "GET") return edgeCache(request, ctx, 21600, () => annualFacets(env, request));
      if (path === "/api/museum-facets" && method === "GET") return edgeCache(request, ctx, 21600, () => museumFacets(env, request));
      if (path === "/api/search" && method === "GET") return edgeCache(request, ctx, 900, () => search(url, env, request));
      if (path.startsWith("/api/item/") && method === "GET") return edgeCache(request, ctx, 3600, () => getItem(path.slice(10), env, request));
      if (path.startsWith("/api/items/") && method === "DELETE") return removeItem(path.slice(11), request, env);

      // ---- Account + boards API ----
      if (path === "/api/me" && method === "GET") return meHandler(request, env);
      if (path === "/api/me/newsletter" && method === "POST") return setNewsletter(request, env);
      if (path === "/api/boards" && method === "GET") return listBoards(request, env);
      if (path === "/api/boards" && method === "POST") return createBoard(request, env);
      if (path.match(/^\/api\/boards\/[^/]+\/add-url$/) && method === "POST") return addUrlToBoard(path.split("/")[3], request, env, ctx);
      if (path.match(/^\/api\/boards\/[^/]+\/saves$/) && method === "POST") return saveToBoard(path.split("/")[3], request, env);
      if (path.match(/^\/api\/boards\/[^/]+\/saves\/[^/]+$/) && method === "DELETE") { const s = path.split("/"); return unsave(s[3], s[5], request, env); }
      if (path.match(/^\/api\/boards\/[^/]+\/saves\/[^/]+$/) && method === "PATCH") { const s = path.split("/"); return setPinNote(s[3], s[5], request, env); }
      if (path.match(/^\/api\/boards\/[^/]+$/) && method === "PATCH") return updateBoard(path.split("/")[3], request, env);
      if (path.match(/^\/api\/boards\/[^/]+\/canvas$/) && method === "PUT") return saveCanvas(path.split("/")[3], request, env);
      if (path.match(/^\/api\/boards\/[^/]+\/design$/) && method === "GET") return boardDesignApi(path.split("/")[3], request, env);
      if (path.match(/^\/api\/boards\/[^/]+$/) && method === "GET") return getBoard(path.split("/")[3], request, env);
      if (path.match(/^\/api\/boards\/[^/]+$/) && method === "DELETE") return deleteBoard(path.split("/")[3], request, env);

      // ---- Admin ----
      if (path === "/api/admin/export/users.csv" && method === "GET") return exportUsers(request, env);
      if (path === "/api/admin/reenrich" && method === "POST") return reenrich(request, env);
      if (path === "/api/admin/mcp-stats" && method === "GET") return mcpStats(request, env);
      if (path === "/api/admin/subscribers" && method === "GET") return subscriberStats(request, env);
      if (path === "/api/admin/subscribers.csv" && method === "GET") return exportSubscribers(request, env);

      return json({ error: "not_found" }, 404, env, request);
    } catch (err) {
      return json({ error: "server_error", message: String(err && err.message || err) }, 500, env, request);
    }
  },

  // Daily cron (wrangler.jsonc "triggers"): MCP call logs are kept 12 months, as the MCP privacy policy states.
  async scheduled(event, env, ctx) {
    const DAY = 24 * 60 * 60 * 1000, cutoff = Date.now() - 365 * DAY;
    ctx.waitUntil(env.DB.prepare("DELETE FROM mcp_calls WHERE created_at < ?").bind(cutoff).run());
    // privacy: keep raw IPs for 90 days only (abuse checks + excluding our own tests), then blank them
    ctx.waitUntil(env.DB.prepare("UPDATE mcp_calls SET ip='' WHERE created_at < ? AND ip != ''").bind(Date.now() - 90 * DAY).run().catch(() => {}));
    ctx.waitUntil(env.DB.prepare("DELETE FROM mcp_events WHERE created_at < ?").bind(cutoff).run().catch(() => {}));
  },
};

// ---------------------------------------------------------------------------
// API handlers
// ---------------------------------------------------------------------------

async function addItem(request, env) {
  if (!isAdmin(request, env)) return json({ error: "unauthorized" }, 401, env, request);

  const form = await request.formData();
  const file = form.get("image");          // display image (File) -> R2
  const probeB64 = form.get("probe");       // small base64 JPEG -> NVIDIA (stays under inline limit)
  const sourceUrl = (form.get("source_url") || "").toString().trim();
  const titleIn = (form.get("title") || "").toString().trim();
  const styleIn = (form.get("style") || "").toString().trim();
  const width = parseInt(form.get("width"), 10) || null;
  const height = parseInt(form.get("height"), 10) || null;
  let palette = [];
  try { palette = JSON.parse(form.get("palette") || "[]"); } catch (_) {}
  let themesIn = [];
  try { themesIn = JSON.parse(form.get("themes") || "[]"); } catch (_) {}
  // Collection + annual-report metadata (curated; NULL for the default design gallery).
  const collection = (form.get("collection") || "design").toString().trim() || "design";
  const company = (form.get("company") || "").toString().trim() || null;
  const reportYear = parseInt(form.get("report_year"), 10) || null;
  const designer = (form.get("designer") || "").toString().trim() || null;
  const industry = (form.get("industry") || "").toString().trim() || null;
  const country = (form.get("country") || "").toString().trim() || null;
  const category = (form.get("category") || "").toString().trim().toLowerCase() || null; // discipline tab (spans collections)
  const descIn = (form.get("description") || "").toString().trim(); // curated description (used when enrichment is skipped)
  let tagsIn = [];
  try { tagsIn = JSON.parse(form.get("tags") || "[]"); } catch (_) {}

  if (!file || typeof file === "string") return json({ error: "no_image" }, 400, env, request);

  // Dedup guard: never add the same source twice (checked before any R2/AI cost).
  if (sourceUrl) {
    const dup = await env.DB.prepare("SELECT id, image_key FROM items WHERE source_url=? AND status='published' LIMIT 1").bind(sourceUrl).first();
    // UI screens are regenerated from code: upsert=1 refreshes the existing row in place (same id, so page URLs stay stable).
    if (dup && collection === "ui" && (form.get("upsert") || "").toString() === "1") {
      // Images are served immutable for a year, so a changed screen gets a new versioned key (old objects removed).
      const imgKey = await putUiImages(env, dup.id, file, form.get("image_dark"));
      const old = dup.image_key; if (old && old !== imgKey) await env.BUCKET.delete([old, old.replace(/\.webp$/, "-dark.webp")]);
      const code = (form.get("code_html") || "").toString(), md = (form.get("design_md") || "").toString();
      if (code) await env.BUCKET.put(`ui/${dup.id}/index.html`, code, { httpMetadata: { contentType: "text/html; charset=utf-8" } });
      if (md) await env.BUCKET.put(`ui/${dup.id}/DESIGN.md`, md, { httpMetadata: { contentType: "text/markdown; charset=utf-8" } });
      await env.DB.prepare(`UPDATE items SET image_key=?, title=?, description=?, tags=?, themes=?, palette=?, style=?, category=?, company=?, designer=?, industry=?, country=?, width=?, height=?, hue=? WHERE id=?`)
        .bind(imgKey, titleIn || null, (form.get("description") || "").toString().trim(), form.get("tags") || "[]", JSON.stringify(themesIn), JSON.stringify(palette), styleIn || null,
          category, company, designer, industry, country, width, height, hueOf(palette), dup.id).run();
      return json({ ok: true, updated: true, item: { id: dup.id } }, 200, env, request);
    }
    if (dup) return json({ ok: false, duplicate: true, error: "duplicate_source" }, 200, env, request);
  }

  const id = genId();
  const ext = (file.type && file.type.includes("png")) ? "png" : (file.type && file.type.includes("webp")) ? "webp" : "jpg";
  const bytes = new Uint8Array(await file.arrayBuffer());
  let key;
  if (collection === "ui") key = await putUiImages(env, id, bytes, form.get("image_dark"));
  else {
    key = `${collection === "annual-report" ? "annual" : collection === "museum" ? "museum" : "items"}/${id}.${ext}`;
    await env.BUCKET.put(key, bytes, { httpMetadata: { contentType: file.type || "image/jpeg" } });
  }

  // Enrich (best-effort — never block a save on the model).
  // Fast path: bulk ingests pass skip_enrich=1 to skip the (slow) vision call — the item still
  // carries curated company/year/country/designer/industry + a palette backfilled separately.
  const skipEnrich = (form.get("skip_enrich") || "").toString() === "1";
  let ai = { description: descIn, tags: Array.isArray(tagsIn) ? tagsIn.slice(0, 16) : [], style: styleIn || null, title: titleIn || null, themes: themesIn };
  // UI screens carry their code: the HTML page and its DESIGN.md (served at /ui/raw/<id>.html|.md)
  if (collection === "ui") {
    const code = (form.get("code_html") || "").toString(), md = (form.get("design_md") || "").toString();
    if (code) await env.BUCKET.put(`ui/${id}/index.html`, code, { httpMetadata: { contentType: "text/html; charset=utf-8" } });
    if (md) await env.BUCKET.put(`ui/${id}/DESIGN.md`, md, { httpMetadata: { contentType: "text/markdown; charset=utf-8" } });
  }
  try {
    if (skipEnrich) throw { message: "skipped" };
    const enriched = await enrich(probeB64 ? String(probeB64) : bytesToDataUri(bytes, file.type), env, collection);
    ai = {
      description: enriched.description || "",
      tags: Array.isArray(enriched.tags) ? enriched.tags.slice(0, 12) : [],
      style: styleIn || enriched.style || null,
      title: titleIn || enriched.title || null,
      themes: themesIn.length ? themesIn : (Array.isArray(enriched.themes) ? enriched.themes.slice(0, 6) : []),
      model: enriched._model || null,
    };
  } catch (e) {
    ai.enrich_error = String(e && e.message || e);
    ai.themes = themesIn;
  }

  const now = Date.now();
  const host = hostOf(sourceUrl);
  await env.DB.prepare(
    `INSERT INTO items (id,title,description,source_url,source_host,image_key,width,height,tags,themes,palette,style,status,created_at,collection,category,company,report_year,designer,industry,country,hue)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,'published',?,?,?,?,?,?,?,?,?)`
  ).bind(
    id, ai.title, ai.description, sourceUrl || null, host, key, width, height,
    JSON.stringify(ai.tags), JSON.stringify(ai.themes || []), JSON.stringify(palette), ai.style, now,
    collection, category, company, reportYear, designer, industry, country, hueOf(palette)
  ).run();

  return json({ ok: true, item: rowToItem({
    id, title: ai.title, description: ai.description, source_url: sourceUrl, source_host: host,
    image_key: key, width, height, tags: JSON.stringify(ai.tags), themes: JSON.stringify(ai.themes || []),
    palette: JSON.stringify(palette), style: ai.style, created_at: now,
    collection, category, company, report_year: reportYear, designer, industry,
  }, env), enrich_error: ai.enrich_error || null, enrich_model: ai.model || null }, 200, env, request);
}

async function feed(url, env, request) {
  const limit = clampInt(url.searchParams.get("limit"), 24, 1, 60);
  const style = (url.searchParams.get("style") || "").trim();
  const theme = (url.searchParams.get("theme") || "").trim();
  // Collection scope: defaults to the design gallery so annual reports never leak in.
  const collection = (url.searchParams.get("collection") || "design").trim();
  const category = (url.searchParams.get("category") || "").trim().toLowerCase(); // discipline tab
  const year = parseInt(url.searchParams.get("year"), 10) || null;
  const industry = (url.searchParams.get("industry") || "").trim();
  const designer = (url.searchParams.get("designer") || "").trim();
  const country = (url.searchParams.get("country") || "").trim();
  const decade = parseInt(url.searchParams.get("decade"), 10) || null;
  const century = url.searchParams.has("century") ? parseInt(url.searchParams.get("century"), 10) : null;
  const company = (url.searchParams.get("company") || "").trim(); // museum: holding institution
  const cursor = parseInt(url.searchParams.get("cursor"), 10) || null; // created_at of last seen
  const attributed = url.searchParams.get("attributed") === "1"; // has a documented designer
  const sort = (url.searchParams.get("sort") || "").trim();
  const useOffset = url.searchParams.has("offset"); // offset paging enables arbitrary sort
  const offset = Math.max(0, parseInt(url.searchParams.get("offset"), 10) || 0);

  const where = ["status = 'published'", "owner_id IS NULL"]; // public feed = curated only
  const binds = [];
  where.push("collection = ?"); binds.push(collection);
  if (category) { where.push("category = ?"); binds.push(category); }
  if (style) { where.push("style = ?"); binds.push(style); }
  if (theme) { where.push("themes LIKE ?"); binds.push(`%"${theme}"%`); }
  if (year) { where.push("report_year = ?"); binds.push(year); }
  if (industry) { where.push("industry = ?"); binds.push(industry); }
  if (designer) { where.push("designer = ?"); binds.push(designer); }
  if (country) { where.push("country = ?"); binds.push(country); }
  if (decade) { where.push("report_year >= ? AND report_year <= ?"); binds.push(decade, decade + 9); }
  if (century !== null && !Number.isNaN(century)) { where.push("report_year >= ? AND report_year <= ?"); binds.push(century, century + 99); }
  if (company) { where.push("company = ?"); binds.push(company); }
  if (attributed) { where.push("designer IS NOT NULL AND designer <> ''"); }
  if (!useOffset && cursor) { where.push("created_at < ?"); binds.push(cursor); }

  let order = "created_at DESC";
  if (useOffset) {
    if (sort === "year_desc") order = "report_year IS NULL, report_year DESC, created_at DESC";
    else if (sort === "year_asc") order = "report_year IS NULL, report_year ASC, created_at DESC";
    else if (sort === "company") order = "company COLLATE NOCASE ASC, report_year ASC";
    else if (sort === "color") order = "hue IS NULL, hue ASC, created_at DESC";
    else if (sort === "style") order = "style IS NULL OR style='', style COLLATE NOCASE ASC, created_at DESC";
    // Default annual view: hand-picked covers (featured_rank 1..n) lead, then newest added.
    else if (!sort && (collection === "annual-report" || collection === "museum")) order = "featured_rank IS NULL, featured_rank ASC, created_at DESC";
  }
  const sql = `SELECT * FROM items WHERE ${where.join(" AND ")} ORDER BY ${order} LIMIT ?` + (useOffset ? " OFFSET ?" : "");
  const rows = await env.DB.prepare(sql).bind(...binds, limit, ...(useOffset ? [offset] : [])).all();

  const items = (rows.results || []).map((r) => rowToItem(r, env));
  if (useOffset) {
    const nextOffset = items.length === limit ? offset + limit : null;
    return noEdgeIfEmpty(json({ items, nextOffset }, 200, env, request), items);
  }
  const nextCursor = items.length === limit ? items[items.length - 1].created_at : null;
  return noEdgeIfEmpty(json({ items, nextCursor }, 200, env, request), items);
}

// Distinct discipline categories (+counts) within a collection, for the tab bar.
// Ordered by our canonical taxonomy so tabs read consistently; the client hides
// the whole bar until >1 category exists (keeps today's single-category gallery clean).
const CATEGORY_ORDER = ["typography", "branding", "editorial", "print", "packaging", "logos", "interface", "illustration"];
async function categoriesFacet(url, env, request) {
  const collection = (url.searchParams.get("collection") || "design").trim();
  const rows = (await env.DB.prepare(
    `SELECT category, COUNT(*) n FROM items
      WHERE status='published' AND owner_id IS NULL AND collection = ? AND category IS NOT NULL AND category <> ''
      GROUP BY category`
  ).bind(collection).all()).results || [];
  const counts = Object.fromEntries(rows.map((r) => [r.category, r.n]));
  const known = CATEGORY_ORDER.filter((c) => counts[c]).map((c) => ({ category: c, n: counts[c] }));
  const extra = rows.filter((r) => !CATEGORY_ORDER.includes(r.category)).map((r) => ({ category: r.category, n: r.n }));
  return json({ categories: known.concat(extra) }, 200, env, request);
}

async function search(url, env, request) {
  const q = (url.searchParams.get("q") || "").trim();
  const limit = clampInt(url.searchParams.get("limit"), 40, 1, 60);
  const collection = (url.searchParams.get("collection") || "design").trim();
  if (!q) return json({ items: [] }, 200, env, request);
  const like = `%${cutBytes(q, 40)}%`; // D1 rejects LIKE patterns over ~50 bytes
  const rows = await env.DB.prepare(
    `SELECT * FROM items WHERE status='published' AND owner_id IS NULL AND collection = ? AND (title LIKE ? OR description LIKE ? OR tags LIKE ? OR company LIKE ?)
     ORDER BY created_at DESC LIMIT ?`
  ).bind(collection, like, like, like, like, limit).all();
  const items = (rows.results || []).map((r) => rowToItem(r, env));
  return noEdgeIfEmpty(json({ items }, 200, env, request), items);
}

async function getItem(id, env, request) {
  const row = await env.DB.prepare(`SELECT * FROM items WHERE id = ? AND status='published'`).bind(id).first();
  if (!row) return json({ error: "not_found" }, 404, env, request);
  return json({ item: rowToItem(row, env) }, 200, env, request);
}

async function removeItem(id, request, env) {
  if (!isAdmin(request, env)) return json({ error: "unauthorized" }, 401, env, request);
  await env.DB.prepare(`UPDATE items SET status='removed' WHERE id = ?`).bind(id).run();
  return json({ ok: true }, 200, env, request);
}

// ---------------------------------------------------------------------------
// Annual Reports — per-item permalink pages (server-rendered, schema.org) + sitemap.
// These give AI assistants and Google a citable URL per report (the GEO surface).
// ---------------------------------------------------------------------------

function slugify(s) {
  return (s || "").toString().toLowerCase()
    .replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "report";
}
function escHtml(s) {
  return (s == null ? "" : String(s)).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
// Human-readable plain-text source label from a host. We do NOT link out to sources
// (source_url is kept server-side for dedup/provenance only); this is the plain-text credit shown instead.
function prettySource(host) {
  const h = (host || "").toLowerCase().replace(/^www\./, "");
  const map = {
    "archive.org": "Internet Archive",
    "pm20.zbw.eu": "ZBW – Pressemappe 20. Jahrhundert",
    "wellcomecollection.org": "Wellcome Collection",
    "designarchives.aiga.org": "AIGA Design Archives",
    "fontsinuse.com": "Fonts In Use",
    "moma.org": "MoMA",
    "collection.cooperhewitt.org": "Cooper Hewitt",
    "cooperhewitt.org": "Cooper Hewitt",
    "wright20.com": "Wright",
    "ragoarts.com": "Rago",
    "letterformarchive.org": "Letterform Archive",
    "nas.gov.sg": "National Archives of Singapore",
    "eresources.nlb.gov.sg": "National Library Board Singapore",
    "graphic.sg": "graphic.sg",
    "sr692.com": "Swissair Report Archive",
    "designreviewed.com": "Design Reviewed",
    "collections.vam.ac.uk": "Victoria & Albert Museum",
    "vam.ac.uk": "Victoria & Albert Museum",
    "europeana.eu": "Europeana",
  };
  return map[h] || host || "source";
}

// Shared sign-in + save-to-board widget for the server-rendered annual pages
// (detail + facet). Fills #insp-acct, adds a board-picker popover, and wires any
// .card__save[data-id] button via delegation. Mirrors the annual gallery's save UI.
function saveWidget(base) {
  return `<style>
.mgd-acct{position:absolute;top:1rem;right:1rem;display:flex;gap:.4rem;align-items:center;z-index:5}
.mgd-btn{font:inherit;font-size:.8rem;font-weight:500;padding:.35rem .7rem;border-radius:999px;border:1px solid var(--border);background:var(--surface);color:var(--text);cursor:pointer;display:inline-flex;align-items:center;gap:.35rem;text-decoration:none}
.mgd-btn--dark{background:var(--text);color:var(--bg);border-color:var(--text)}
.mgd-acct .who{font-size:.78rem;color:var(--muted)}
.card__save{position:absolute;top:.5rem;right:.5rem;border:none;background:var(--text);color:var(--bg);cursor:pointer;font-size:.76rem;font-weight:600;line-height:1;display:inline-flex;gap:.3em;padding:.4rem .7rem;border-radius:999px;box-shadow:0 2px 6px rgba(0,0,0,.28);z-index:3}
.card__save:hover{transform:scale(1.05)}
.mgd-overlay{position:fixed;inset:0;z-index:10000;display:none}.mgd-overlay.is-open{display:block}
.mgd-pop{position:fixed;z-index:10001;background:var(--surface);border:1px solid var(--border);border-radius:12px;box-shadow:0 8px 30px rgba(0,0,0,.18);width:260px;padding:.7rem;display:none}
.mgd-pop.is-open{display:block}.mgd-pop h4{margin:.1rem 0 .5rem;font-size:.85rem}
.mgd-pop__list{max-height:200px;overflow:auto;display:flex;flex-direction:column;gap:.2rem;margin-bottom:.5rem}
.mgd-pop__b{display:flex;justify-content:space-between;gap:.5rem;padding:.4rem .5rem;border-radius:6px;cursor:pointer;font-size:.85rem}
.mgd-pop__b:hover{background:rgba(128,128,128,.12)}
.mgd-pop__new{display:flex;gap:.35rem}.mgd-pop__new input{flex:1;font:inherit;font-size:.85rem;padding:.35rem .5rem;border:1px solid var(--border);border-radius:6px;background:var(--surface);color:var(--text)}
.mgd-toast{position:fixed;bottom:1rem;left:50%;transform:translateX(-50%);background:var(--text);color:var(--bg);border-radius:999px;padding:.6rem 1rem;font-size:.85rem;z-index:10002}
</style>
<div class="mgd-acct" id="insp-acct"></div>
<div class="mgd-overlay" id="insp-overlay"></div>
<div class="mgd-pop" id="insp-pop"><h4>Save to board</h4><div class="mgd-pop__list" id="pop-list"></div><form class="mgd-pop__new" id="pop-newform"><input id="pop-new" placeholder="New board name"/><button class="mgd-btn mgd-btn--dark" type="submit">Add</button></form></div>
<script>(function(){
var API=${JSON.stringify(base || "")};var user=null,saveId=null;
var acct=document.getElementById("insp-acct"),pop=document.getElementById("insp-pop"),ov=document.getElementById("insp-overlay");
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
function api(p,o){return fetch(API+p,o||{});}
function render(){acct.innerHTML=user?'<span class="who">Signed in</span><a class="mgd-btn" href="'+API+'/auth/logout">Log out</a>':'<a class="mgd-btn mgd-btn--dark" href="'+API+'/auth/google/login">Sign in to save</a>';}
api("/api/me").then(function(r){return r.json();}).then(function(d){user=d.user||null;render();}).catch(function(){render();});
function openSave(id,x,y){if(!user){if(confirm("Sign in with Google to save to a board?"))location.href=API+"/auth/google/login";return;}saveId=id;pop.style.left=Math.min(x,window.innerWidth-280)+"px";pop.style.top=Math.min(y,window.innerHeight-260)+"px";document.getElementById("pop-list").innerHTML='<div class="who">Loading…</div>';ov.classList.add("is-open");pop.classList.add("is-open");api("/api/boards").then(function(r){return r.json();}).then(function(d){var l=document.getElementById("pop-list");l.innerHTML="";if(!d.boards||!d.boards.length)l.innerHTML='<div class="who">No boards yet — create one below.</div>';(d.boards||[]).forEach(function(b){var row=document.createElement("div");row.className="mgd-pop__b";row.innerHTML='<span>'+esc(b.name)+'</span><span class="who">'+b.count+'</span>';row.addEventListener("click",function(){saveTo(b.id,b.name);});l.appendChild(row);});});}
function closeSave(){pop.classList.remove("is-open");ov.classList.remove("is-open");}
function saveTo(bid,name){api("/api/boards/"+bid+"/saves",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({item_id:saveId})}).then(function(r){return r.json();}).then(function(){closeSave();toast("Saved to "+name);});}
function toast(m){var t=document.createElement("div");t.className="mgd-toast";t.textContent=m;document.body.appendChild(t);setTimeout(function(){t.remove();},1600);}
document.getElementById("pop-newform").addEventListener("submit",function(e){e.preventDefault();var n=document.getElementById("pop-new").value.trim();if(!n)return;api("/api/boards",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:n})}).then(function(r){return r.json();}).then(function(d){document.getElementById("pop-new").value="";if(d.board)saveTo(d.board.id,d.board.name);});});
ov.addEventListener("click",closeSave);document.addEventListener("keydown",function(e){if(e.key==="Escape")closeSave();});
document.addEventListener("click",function(e){var b=e.target.closest?e.target.closest(".card__save"):null;if(!b)return;e.preventDefault();e.stopPropagation();openSave(b.getAttribute("data-id"),e.clientX,e.clientY);});
})();</script>`;
}
// Canonical path for an annual-report item: /annual-reports/<company>-<year>-<id>
function annualItemPath(item, base) {
  const yr = item.report_year ? `-${item.report_year}` : "";
  return `${base}/annual-reports/${slugify(item.company || item.title)}${yr}-${item.id}`;
}
const GTAG = `<script async src="https://www.googletagmanager.com/gtag/js?id=GT-5M8SNVPM"></script>`
  + `<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','GT-5M8SNVPM');</script>`;

async function annualItemPage(rest, env, base) {
  // The 12-hex item id is the last hyphen-separated token; everything before it is a cosmetic slug.
  const m = (rest || "").match(/([0-9a-f]{12})$/);
  if (!m) return new Response("not found", { status: 404 });
  const row = await env.DB.prepare(`SELECT * FROM items WHERE id=? AND status='published' AND collection='annual-report'`).bind(m[1]).first();
  if (!row) return new Response("not found", { status: 404, headers: { "Content-Type": "text/plain" } });
  const it = rowToItem(row, env);
  // Full report: for archive.org-sourced items, embed the Internet Archive BookReader inline
  // (viewer stays on our page, no outbound link, nothing rehosted). Other sources hold only a cover.
  const arId = (row.source_host === "archive.org" && row.source_url)
    ? ((row.source_url.match(/archive\.org\/(?:details|embed)\/([^/?#]+)/) || [])[1] || null) : null;
  const site = (env.ALLOWED_ORIGIN || "https://madegooddesigns.com").replace(/\/$/, "");
  const canonical = site + annualItemPath(it, base);
  const imgAbs = site + base + it.image;
  const name = `${it.company || it.title || "Annual report"}${it.report_year ? " Annual Report " + it.report_year : ""}`;
  const facts = [
    it.company ? `Company: ${it.company}` : null,
    it.report_year ? `Year: ${it.report_year}` : null,
    it.designer ? `Designer / agency: ${it.designer}` : null,
    it.industry ? `Industry: ${it.industry}` : null,
    it.country ? `Country: ${it.country}` : null,
    it.source ? `Source: ${it.source}` : null,
  ].filter(Boolean);
  const jsonld = {
    "@context": "https://schema.org", "@type": "VisualArtwork",
    name, artform: "Annual report cover", url: canonical, image: imgAbs,
    creator: it.designer ? { "@type": "Person", name: it.designer } : (it.company ? { "@type": "Organization", name: it.company } : undefined),
    about: it.industry || undefined,
    dateCreated: it.report_year ? String(it.report_year) : undefined,
    description: it.description || undefined,
    isPartOf: { "@type": "Collection", name: "Annual Report Archive", url: `${site}${base}/annual-reports` },
    publisher: { "@type": "Organization", name: "Made Good Designs", url: site },
  };
  const chips = [it.industry, ...(it.themes || [])].filter(Boolean).map((t) => `<span class="chip">${escHtml(t)}</span>`).join("");
  const body = `<!doctype html><html lang="en"><head>
<meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/>
${GTAG}
<title>${escHtml(name)} — Made Good Designs</title>
<meta name="description" content="${escHtml(it.description || name)}"/>
<link rel="canonical" href="${escHtml(canonical)}"/>
<meta property="og:type" content="article"/><meta property="og:title" content="${escHtml(name)}"/>
<meta property="og:image" content="${escHtml(imgAbs)}"/><meta property="og:url" content="${escHtml(canonical)}"/>
<script type="application/ld+json">${JSON.stringify(jsonld)}</script>
<style>
:root{--bg:#fafafa;--surface:#fff;--border:#e5e5e5;--text:#171717;--muted:#737373;--font:system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font-family:var(--font);-webkit-font-smoothing:antialiased}
a{color:inherit}.wrap{max-width:900px;margin:0 auto;padding:1.25rem 1rem 4rem}
nav.crumb{font-size:.82rem;color:var(--muted);margin:.25rem 0 1rem}nav.crumb a{text-decoration:none}
.detail{display:grid;grid-template-columns:minmax(0,320px) 1fr;gap:1.5rem}
@media(max-width:640px){.detail{grid-template-columns:1fr}}
.detail img{width:100%;height:auto;border:1px solid var(--border);border-radius:12px;background:var(--surface)}
h1{font-size:1.35rem;margin:.1rem 0 .5rem;letter-spacing:-.01em}
.desc{color:var(--text);font-size:.98rem;line-height:1.5;margin:.4rem 0 1rem}
ul.facts{list-style:none;padding:0;margin:0 0 1.1rem;color:var(--muted);font-size:.9rem;line-height:1.7}
.chips{display:flex;flex-wrap:wrap;gap:.35rem;margin:.2rem 0 1.1rem}
.chip{font-size:.72rem;color:var(--muted);border:1px solid var(--border);border-radius:999px;padding:.1rem .55rem}
.cta{display:inline-block;font-size:.9rem;font-weight:600;text-decoration:none;border:1px solid var(--text);border-radius:8px;padding:.5rem .9rem}
.fullreport{margin-top:2rem}.fullreport h2{font-size:1rem;margin:0 0 .6rem}
.fullreport iframe{width:100%;height:680px;border:1px solid var(--border);border-radius:12px;background:var(--surface)}
.fullreport .fr-note{color:var(--muted);font-size:.75rem;margin:.5rem 0 0}
footer.rights{margin-top:2.5rem;padding-top:1.25rem;border-top:1px solid var(--border);color:var(--muted);font-size:.78rem;line-height:1.5;max-width:70ch}
</style></head><body><div class="wrap">
${backLink(base, "/annual-reports", "Back to archive")}
<nav class="crumb"><a href="${escHtml(base)}/annual-reports">Annual Report Archive</a> › ${escHtml(name)}</nav>
<div class="detail">
  <div style="position:relative"><button class="card__save" data-id="${escHtml(it.id)}" title="Save to a board">♥ Save</button><img src="${escHtml(base + it.image)}" alt="${escHtml(name)} cover"/></div>
  <div>
    <h1>${escHtml(name)}</h1>
    ${it.description ? `<p class="desc">${escHtml(it.description)}</p>` : ""}
    <ul class="facts">${facts.map((f) => `<li>${escHtml(f)}</li>`).join("")}</ul>
    ${chips ? `<div class="chips">${chips}</div>` : ""}
  </div>
</div>
${arId ? `<section class="fullreport"><h2>Full report</h2><iframe src="https://archive.org/embed/${escHtml(arId)}" title="${escHtml(name)} — full report" loading="lazy" allowfullscreen></iframe><p class="fr-note">Full report embedded from the Internet Archive.</p></section>` : ""}
<footer class="rights">Cover thumbnail shown for reference and commentary${it.source ? `; source: ${escHtml(it.source)}` : ""}. We claim no rights over the reproduced work — rights holders may request removal via <a href="mailto:hello@madegooddesigns.com">hello@madegooddesigns.com</a>.</footer>
</div>${saveWidget(base)}</body></html>`;
  return new Response(themeify(body), { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}

// Distinct filter values + counts for the annual archive (powers the dropdowns; one request, no pagination).
async function annualFacets(env, request) {
  const P = "collection='annual-report' AND status='published' AND owner_id IS NULL";
  const grp = (col) => env.DB.prepare(
    `SELECT ${col} v, COUNT(*) n FROM items WHERE ${P} AND ${col} IS NOT NULL AND ${col}<>'' GROUP BY ${col} ORDER BY n DESC`).all();
  const [ctry, ind, des] = await Promise.all([grp("country"), grp("industry"), grp("designer")]);
  const dec = (await env.DB.prepare(
    `SELECT (report_year/10)*10 d, COUNT(*) n FROM items WHERE ${P} AND report_year IS NOT NULL GROUP BY d ORDER BY d`).all()).results || [];
  const map = (rows) => (rows.results || rows || []).map((r) => ({ v: r.v, n: r.n }));
  return json({
    countries: map(ctry), industries: map(ind), designers: map(des),
    decades: dec.map((r) => ({ v: r.d + "s", year: r.d, n: r.n })),
  }, 200, env, request);
}

async function annualSitemap(env, base) {
  const site = (env.ALLOWED_ORIGIN || "https://madegooddesigns.com").replace(/\/$/, "");
  const rows = (await env.DB.prepare(`SELECT id,company,report_year,title,designer,industry,country FROM items WHERE status='published' AND collection='annual-report' ORDER BY created_at DESC`).all()).results || [];
  const facet = (key, kind) => [...new Set(rows.map((r) => (r[key] || "").trim()).filter(Boolean))]
    .map((v) => `${site}${base}/annual-reports/${kind}/${slugify(v)}`);
  const urls = [`${site}${base}/annual-reports`, `${site}${base}/annual-reports/index`]
    .concat(facet("country", "country"), facet("designer", "designer"), facet("company", "company"), facet("industry", "industry"))
    .concat(rows.map((r) => site + annualItemPath(rowToItem(r, env), base)));
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`
    + urls.map((u) => `  <url><loc>${escHtml(u)}</loc></url>`).join("\n") + `\n</urlset>\n`;
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}

// Shared styles for the server-rendered annual hub/facet pages.
// "← Back" for collection detail pages: returns to the previous collection view (keeps filters + scroll) when the
// visitor came from within the collection, otherwise links to the collection home.
function backLink(base, path, label) {
  const href = `${base}${path}`;
  return `<a class="backbtn" style="display:inline-flex;align-items:center;gap:.35em;font-size:.85rem;font-weight:600;text-decoration:none;border:1px solid #d4d4d4;background:#fff;border-radius:999px;padding:.35em .9em;margin:.25rem 0 .6rem;color:#171717" href="${escHtml(href)}" onclick="try{var r=document.referrer;if(r&&r.indexOf(location.origin+${escHtml(JSON.stringify(href))})===0&&history.length>1){history.back();return false}}catch(e){}">← ${escHtml(label)}</a>`;
}
const ANNUAL_PAGE_CSS = `<style>
.backbtn{display:inline-flex;align-items:center;gap:.35em;font-size:.85rem;font-weight:600;text-decoration:none;border:1px solid var(--line,rgba(127,127,127,.35));border-radius:999px;padding:.35em .9em;margin:.25rem 0 .6rem}.backbtn:hover{border-color:currentColor}
:root{--bg:#fafafa;--surface:#fff;--border:#e5e5e5;--text:#171717;--muted:#737373;--font:system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font-family:var(--font);-webkit-font-smoothing:antialiased}
a{color:inherit}.wrap{max-width:960px;margin:0 auto;padding:1.25rem 1rem 4rem}
nav.crumb{font-size:.82rem;color:var(--muted);margin:.25rem 0 1rem}nav.crumb a{text-decoration:none}
h1{font-size:1.4rem;margin:.1rem 0 .3rem;letter-spacing:-.01em}h2{font-size:1rem;margin:1.6rem 0 .6rem}
.lead{color:var(--muted);font-size:.92rem;margin:0 0 1rem;max-width:70ch}
.facet-list{display:flex;flex-wrap:wrap;gap:.5rem;margin:.3rem 0 1rem}
.facet-list a{display:inline-flex;align-items:center;gap:.4rem;text-decoration:none;border:1px solid var(--border);background:var(--surface);border-radius:999px;padding:.35rem .7rem;font-size:.85rem}
.facet-list a .n{color:var(--muted);font-size:.78rem}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:1rem;margin-top:1rem}
.card{border:1px solid var(--border);border-radius:12px;overflow:hidden;background:var(--surface);text-decoration:none;display:block}
.card img{width:100%;height:auto;display:block;background:var(--bg)}
.card .b{padding:.5rem .6rem}.card .co{font-size:.85rem;font-weight:600}.card .m{font-size:.75rem;color:var(--muted);margin-top:.15rem}
footer.rights{margin-top:2.5rem;padding-top:1.25rem;border-top:1px solid var(--border);color:var(--muted);font-size:.78rem;line-height:1.5;max-width:70ch}
</style>`;

// Browse hub: /annual-reports/index — lists designers, companies, industries as internal links.
async function annualIndexPage(env, base) {
  const site = (env.ALLOWED_ORIGIN || "https://madegooddesigns.com").replace(/\/$/, "");
  const rows = (await env.DB.prepare(`SELECT company,designer,industry,country FROM items WHERE status='published' AND collection='annual-report'`).all()).results || [];
  const tally = (key) => {
    const m = new Map();
    for (const r of rows) { const v = (r[key] || "").trim(); if (!v) continue; m.set(v, (m.get(v) || 0) + 1); }
    return [...m.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  };
  const section = (title, kind, entries) => entries.length ? `<h2>${escHtml(title)}</h2><div class="facet-list">`
    + entries.map(([v, n]) => `<a href="${escHtml(base)}/annual-reports/${kind}/${escHtml(slugify(v))}">${escHtml(v)} <span class="n">${n}</span></a>`).join("") + `</div>` : "";
  const canonical = `${site}${base}/annual-reports/index`;
  const jsonld = { "@context": "https://schema.org", "@type": "CollectionPage", name: "Annual Report Archive — browse by designer, company & industry", url: canonical, isPartOf: { "@type": "Collection", name: "Annual Report Archive", url: `${site}${base}/annual-reports` } };
  const body = `<!doctype html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/>${GTAG}
<title>Browse the Annual Report Archive — Made Good Designs</title>
<meta name="description" content="Browse vintage corporate annual report cover designs by designer (Paul Rand, Chermayeff &amp; Geismar and more), company, and industry."/>
<link rel="canonical" href="${escHtml(canonical)}"/>
<script type="application/ld+json">${JSON.stringify(jsonld)}</script>
${ANNUAL_PAGE_CSS}</head><body><div class="wrap">
${backLink(base, "/annual-reports", "Back to archive")}
<nav class="crumb"><a href="${escHtml(base)}/annual-reports">Annual Report Archive</a> › Browse</nav>
<h1>Browse the Annual Report Archive</h1>
<p class="lead">A reference archive of vintage corporate annual-report cover design. Browse by country, designer, company, or industry.</p>
${section("Countries", "country", tally("country"))}
${section("Designers", "designer", tally("designer"))}
${section("Companies", "company", tally("company"))}
${section("Industries", "industry", tally("industry"))}
<footer class="rights">Cover thumbnails shown for reference and commentary; full reports are held by their original sources. Rights holders may request removal via <a href="mailto:hello@madegooddesigns.com">hello@madegooddesigns.com</a>.</footer>
</div></body></html>`;
  return html(body);
}

// Facet listing: /annual-reports/{designer|company|industry}/<slug>
async function annualFacetPage(kind, slug, env, base) {
  const col = kind === "designer" ? "designer" : kind === "industry" ? "industry" : kind === "country" ? "country" : "company";
  const site = (env.ALLOWED_ORIGIN || "https://madegooddesigns.com").replace(/\/$/, "");
  const distinct = (await env.DB.prepare(`SELECT DISTINCT ${col} AS v FROM items WHERE status='published' AND collection='annual-report' AND ${col} IS NOT NULL AND ${col}<>''`).all()).results || [];
  const match = distinct.find((r) => slugify(r.v) === slug);
  if (!match) return new Response("not found", { status: 404, headers: { "Content-Type": "text/plain" } });
  const value = match.v;
  const rows = (await env.DB.prepare(`SELECT * FROM items WHERE status='published' AND collection='annual-report' AND ${col}=? ORDER BY report_year, company`).bind(value).all()).results || [];
  const items = rows.map((r) => rowToItem(r, env));
  const heading = kind === "designer" ? `Designed by ${value}` : kind === "country" ? `Annual reports from ${value}` : `${value} annual reports`;
  const canonical = `${site}${base}/annual-reports/${kind}/${slugify(value)}`;
  const cards = items.map((it) => {
    const href = annualItemPath(it, base);
    const img = base + it.image;
    const co = escHtml(`${it.company || it.title || ""}${it.report_year ? " " + it.report_year : ""}`);
    const meta = [kind !== "designer" ? it.designer : null, kind !== "industry" ? it.industry : null].filter(Boolean).map(escHtml).join(" · ");
    return `<div class="card" style="position:relative"><button class="card__save" data-id="${escHtml(it.id)}" title="Save to a board">♥</button><a href="${escHtml(href)}" style="text-decoration:none;display:block"><img loading="lazy" src="${escHtml(img)}" alt="${co} cover"/><div class="b"><div class="co">${co}</div>${meta ? `<div class="m">${meta}</div>` : ""}</div></a></div>`;
  }).join("");
  const jsonld = { "@context": "https://schema.org", "@type": "CollectionPage", name: heading, url: canonical, isPartOf: { "@type": "Collection", name: "Annual Report Archive", url: `${site}${base}/annual-reports` }, mainEntity: { "@type": "ItemList", numberOfItems: items.length } };
  const body = `<!doctype html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/>${GTAG}
<title>${escHtml(heading)} — Annual Report Archive — Made Good Designs</title>
<meta name="description" content="${escHtml(heading)} — vintage corporate annual report cover designs in the Made Good Designs reference archive."/>
<link rel="canonical" href="${escHtml(canonical)}"/>
<script type="application/ld+json">${JSON.stringify(jsonld)}</script>
${ANNUAL_PAGE_CSS}</head><body><div class="wrap">
${backLink(base, "/annual-reports", "Back to archive")}
<nav class="crumb"><a href="${escHtml(base)}/annual-reports">Annual Report Archive</a> › <a href="${escHtml(base)}/annual-reports/index">Browse</a> › ${escHtml(value)}</nav>
<h1>${escHtml(heading)}</h1>
<p class="lead">${items.length} ${items.length === 1 ? "report" : "reports"} in the archive.</p>
<div class="grid">${cards}</div>
<footer class="rights">Cover thumbnails shown for reference and commentary; full reports are held by their original sources. Rights holders may request removal via <a href="mailto:hello@madegooddesigns.com">hello@madegooddesigns.com</a>.</footer>
</div>${saveWidget(base)}</body></html>`;
  return html(body);
}

// ---------------------------------------------------------------------------
// Museum collection — curated public-domain / CC0 artworks (The Met, Art Institute of
// Chicago, Cleveland Museum of Art). Column mapping on `items` (collection='museum'):
//   company = holding museum · designer = artist · report_year = year · industry = object type
//   country = culture / place · category = curated theme slug · source_url = museum object page.
// Works are public domain, so (unlike the other collections) we DO link to the museum page.
// ---------------------------------------------------------------------------
const MUSEUM_THEMES = {
  "art-nouveau": "Art Nouveau", "art-deco": "Art Deco", "bauhaus": "Bauhaus", "constructivism": "Constructivism",
  "vienna-secession": "Vienna Secession", "arts-and-crafts": "Arts and Crafts", "posters": "Posters",
  "travel-posters": "Travel posters", "wpa-posters": "WPA posters", "ukiyo-e": "Ukiyo-e", "japanese-prints": "Japanese prints",
  "katagami": "Katagami stencils", "lettering": "Lettering", "calligraphy": "Calligraphy",
  "illuminated-manuscripts": "Illuminated manuscripts", "type-specimens": "Type specimens", "alphabets": "Alphabets",
  "bookplates": "Bookplates", "book-design": "Book design", "ornament": "Ornament", "pattern": "Pattern",
  "textiles": "Textiles", "wallpaper": "Wallpaper", "labels-packaging": "Labels & packaging", "trade-cards": "Trade cards",
  "playing-cards": "Playing cards", "maps": "Maps", "botanical": "Botanical illustration", "woodcut": "Woodcut",
  "engraving": "Engraving", "expressionism": "Expressionism", "islamic-art": "Islamic art", "indian-painting": "Indian painting",
  "chinese-art": "Chinese art", "ceramics": "Ceramics", "glass": "Glass",
};
// Editorial guides on madegooddesigns.com that go with museum themes / artists (internal links both ways).
const MUSEUM_GUIDES = {
  theme: { "ukiyo-e": ["ukiyo-e", "hokusai", "hiroshige"], "japanese-prints": ["ukiyo-e", "japanese-art"], "art-nouveau": ["alphonse-mucha", "art-deco-vs-art-nouveau"],
    "posters": ["vintage-posters", "toulouse-lautrec-posters", "alphonse-mucha"], "arts-and-crafts": ["arts-and-crafts-movement", "william-morris-patterns"],
    "wallpaper": ["william-morris-patterns"], "textiles": ["toile-de-jouy", "damask-pattern", "paisley-pattern"], "illuminated-manuscripts": ["illuminated-manuscripts", "gothic-art"],
    "lettering": ["illuminated-manuscripts", "medieval-fonts"], "alphabets": ["medieval-fonts", "albrecht-durer"], "calligraphy": ["japanese-calligraphy", "chinese-calligraphy"],
    "islamic-art": ["islamic-art", "islamic-geometric-patterns"], "engraving": ["etching", "albrecht-durer", "renaissance-art"], "printmaking": ["woodblock-printing", "lithography", "etching"], "glass": ["venetian-glass", "stained-glass"], "expressionism": ["expressionism-art"], "woodcut": ["woodblock-printing", "albrecht-durer"], "aesthetic-movement": ["aubrey-beardsley"],
    "maps": ["old-maps"], "fashion-plates": ["fashion-plates"], "art-deco": ["art-deco-vs-art-nouveau"], "chinese-art": ["chinese-art", "chinese-calligraphy"], "botanical": ["botanical-illustration", "audubon-birds"], "ornament": ["rococo", "celtic-knot", "renaissance-art"],
    "katagami": ["japanese-patterns", "japanese-art"], "indian-painting": ["indian-art", "islamic-art"], "ceramics": ["majolica", "delftware", "chinese-art"] },
  artist: [[/jean\-baptiste pater/i, ["jean-baptiste-pater"]], [/abu'l hasan|abu al\-hasan/i, ["abul-hasan"]], [/ren xiong/i, ["ren-xiong"]], [/henri\-gabriel ibels/i, ["henri-gabriel-ibels"]], [/ker\-xavier roussel/i, ["ker-xavier-roussel"]], [/charles\-francois daubigny|charles\-françois daubigny/i, ["charles-francois-daubigny"]], [/louis\-leopold boilly|louis\-léopold boilly/i, ["louis-leopold-boilly"]], [/john lavery/i, ["john-lavery"]], [/george romney/i, ["george-romney"]], [/henry raeburn/i, ["henry-raeburn"]], [/jean\-baptiste carpeaux/i, ["jean-baptiste-carpeaux"]], [/wilhelmina geddes/i, ["wilhelmina-geddes"]], [/lotte reiniger/i, ["lotte-reiniger"]], [/emile cohl|émile cohl/i, ["emile-cohl"]], [/ephraim moses lilien/i, ["ephraim-moses-lilien"]], [/mahmoud said|mahmoud saïd/i, ["mahmoud-said"]], [/maud lewis/i, ["maud-lewis"]], [/arthur lismer/i, ["arthur-lismer"]], [/frederick varley/i, ["frederick-varley"]], [/may gibbs/i, ["may-gibbs"]], [/norman lindsay/i, ["norman-lindsay"]], [/grace cossington smith/i, ["grace-cossington-smith"]], [/charles conder/i, ["charles-conder"]], [/nampeyo/i, ["nampeyo"]], [/frans masereel/i, ["frans-masereel"]], [/lynd ward/i, ["lynd-ward"]], [/bertha lum/i, ["bertha-lum"]], [/martin lewis/i, ["martin-lewis"]], [/charles meryon/i, ["charles-meryon"]], [/marcantonio raimondi/i, ["marcantonio-raimondi"]], [/giulio clovio/i, ["giulio-clovio"]], [/simon bening/i, ["simon-bening"]], [/jean pucelle/i, ["jean-pucelle"]], [/aqa mirak/i, ["aqa-mirak"]], [/giovanni battista palatino/i, ["giovanni-battista-palatino"]], [/torii kiyonobu/i, ["torii-kiyonobu"]], [/ishikawa toyonobu/i, ["ishikawa-toyonobu"]], [/jin nong/i, ["jin-nong"]], [/yashima gakutei/i, ["yashima-gakutei"]], [/felix buhot|félix buhot/i, ["felix-buhot"]], [/arthur heygate mackmurdo/i, ["arthur-heygate-mackmurdo"]], [/lewis foreman day/i, ["lewis-foreman-day"]], [/jean berain|jean bérain/i, ["jean-berain"]], [/daniel marot/i, ["daniel-marot"]], [/kitao shigemasa/i, ["kitao-shigemasa"]], [/auguste lepere|auguste lepère/i, ["auguste-lepere"]], [/charles robert ashbee/i, ["charles-robert-ashbee"]], [/hugh thomson/i, ["hugh-thomson"]], [/rodolphe bresdin/i, ["rodolphe-bresdin"]], [/myles birket foster/i, ["myles-birket-foster"]], [/bichitr/i, ["bichitr"]], [/wu zhen/i, ["wu-zhen"]], [/henri harpignies/i, ["henri-harpignies"]], [/lorenzo monaco/i, ["lorenzo-monaco"]], [/peter schoeffer/i, ["peter-schoeffer"]], [/thomas sheraton/i, ["thomas-sheraton"]], [/leon lhermitte|léon lhermitte/i, ["leon-lhermitte"]], [/bernardo strozzi/i, ["bernardo-strozzi"]], [/erhard ratdolt/i, ["erhard-ratdolt"]], [/bertold loffler|bertold löffler/i, ["bertold-loffler"]], [/george bickham/i, ["george-bickham"]], [/cosimo tura/i, ["cosimo-tura"]], [/xia gui/i, ["xia-gui"]], [/kono bairei|kōno bairei/i, ["kono-bairei"]], [/henri meunier/i, ["henri-meunier"]], [/paul gavarni/i, ["paul-gavarni"]], [/yun shouping/i, ["yun-shouping"]], [/imao keinen/i, ["imao-keinen"]], [/kubo shunman/i, ["kubo-shunman"]], [/bruno paul/i, ["bruno-paul"]], [/felix bracquemond|félix bracquemond/i, ["felix-bracquemond"]], [/charles ricketts/i, ["charles-ricketts"]], [/john brett/i, ["john-brett"]], [/paul sandby/i, ["paul-sandby"]], [/john frederick lewis/i, ["john-frederick-lewis"]], [/emery walker/i, ["emery-walker"]], [/giovanni battista moroni/i, ["giovanni-battista-moroni"]], [/lucien pissarro/i, ["lucien-pissarro"]], [/william powell frith/i, ["william-powell-frith"]], [/helen allingham/i, ["helen-allingham"]], [/louis anquetin/i, ["louis-anquetin"]], [/phil may/i, ["phil-may"]], [/carl otto czeschka/i, ["carl-otto-czeschka"]], [/louis majorelle/i, ["louis-majorelle"]], [/john flaxman/i, ["john-flaxman"]], [/ary scheffer/i, ["ary-scheffer"]], [/simon vouet/i, ["simon-vouet"]], [/giovanni di paolo/i, ["giovanni-di-paolo"]], [/washington allston/i, ["washington-allston"]], [/paul ranson/i, ["paul-ranson"]], [/constantin guys/i, ["constantin-guys"]], [/george du maurier/i, ["george-du-maurier"]], [/dard hunter/i, ["dard-hunter"]], [/joseph urban/i, ["joseph-urban"]], [/eugene carriere|eugène carrière/i, ["eugene-carriere"]], [/thomas couture/i, ["thomas-couture"]], [/horace vernet/i, ["horace-vernet"]], [/david wilkie/i, ["david-wilkie"]], [/john leech/i, ["john-leech"]], [/bruce rogers/i, ["bruce-rogers"]], [/wang meng/i, ["wang-meng"]], [/joseph pennell/i, ["joseph-pennell"]], [/theodore robinson/i, ["theodore-robinson"]], [/luca signorelli/i, ["luca-signorelli"]], [/lilla cabot perry/i, ["lilla-cabot-perry"]], [/thomas dewing/i, ["thomas-dewing"]], [/thomas sully/i, ["thomas-sully"]], [/may morris/i, ["may-morris"]], [/robert adam/i, ["robert-adam"]], [/ralph albert blakelock/i, ["ralph-albert-blakelock"]], [/govardhan/i, ["govardhan"]], [/frank duveneck/i, ["frank-duveneck"]], [/abbott thayer/i, ["abbott-thayer"]], [/richard doyle/i, ["richard-doyle"]], [/josiah wedgwood/i, ["josiah-wedgwood"]], [/david roberts/i, ["david-roberts"]], [/sassetta/i, ["sassetta"]], [/elbert hubbard/i, ["elbert-hubbard"]], [/mary delany/i, ["mary-delany"]], [/louis agassiz fuertes/i, ["louis-agassiz-fuertes"]], [/john gould/i, ["john-gould"]], [/basilius besler/i, ["basilius-besler"]], [/marianne north/i, ["marianne-north"]], [/walter hood fitch/i, ["walter-hood-fitch"]], [/georg dionysius ehret/i, ["georg-dionysius-ehret"]], [/thomas chippendale/i, ["thomas-chippendale"]], [/jean pillement/i, ["jean-pillement"]], [/prisse d'avennes|émile prisse d'avennes/i, ["emile-prisse-davennes"]], [/auguste racinet/i, ["auguste-racinet"]], [/maurice pillard verneuil/i, ["maurice-pillard-verneuil"]], [/emile jacques ruhlmann|émile\-jacques ruhlmann/i, ["emile-jacques-ruhlmann"]], [/jean carlu/i, ["jean-carlu"]], [/charles loupot/i, ["charles-loupot"]], [/georges lepape/i, ["georges-lepape"]], [/george barbier/i, ["george-barbier"]], [/albert robida/i, ["albert-robida"]], [/benjamin rabier/i, ["benjamin-rabier"]], [/paul berthon/i, ["paul-berthon"]], [/rube goldberg/i, ["rube-goldberg"]], [/johnny gruelle/i, ["johnny-gruelle"]], [/ethel reed/i, ["ethel-reed"]], [/e\. a\. séguy|e\.a\. seguy/i, ["ea-seguy"]], [/harrison fisher/i, ["harrison-fisher"]], [/rose o'neill/i, ["rose-oneill"]], [/franklin booth/i, ["franklin-booth"]], [/elizabeth shippen green/i, ["elizabeth-shippen-green"]], [/bill traylor/i, ["bill-traylor"]], [/grandma moses/i, ["grandma-moses"]], [/edmonia lewis/i, ["edmonia-lewis"]], [/aaron douglas/i, ["aaron-douglas"]], [/florine stettheimer/i, ["florine-stettheimer"]], [/rockwell kent/i, ["rockwell-kent"]], [/tina modotti/i, ["tina-modotti"]], [/wilson bentley/i, ["wilson-bentley"]], [/alvin langdon coburn/i, ["alvin-langdon-coburn"]], [/frances benjamin johnston/i, ["frances-benjamin-johnston"]], [/gertrude kasebier|gertrude käsebier/i, ["gertrude-kasebier"]], [/felice beato/i, ["felice-beato"]], [/carleton watkins/i, ["carleton-watkins"]], [/timothy o'sullivan/i, ["timothy-osullivan"]], [/gustave le gray/i, ["gustave-le-gray"]], [/anna atkins/i, ["anna-atkins"]], [/louis daguerre/i, ["louis-daguerre"]], [/william henry fox talbot/i, ["william-henry-fox-talbot"]], [/william de morgan/i, ["william-de-morgan"]], [/archibald knox/i, ["archibald-knox"]], [/c\. f\. a\. voysey|cfa voysey/i, ["cfa-voysey"]], [/augustus pugin/i, ["augustus-pugin"]], [/owen jones/i, ["owen-jones"]], [/christopher dresser/i, ["christopher-dresser"]], [/annie french/i, ["annie-french"]], [/rex whistler/i, ["rex-whistler"]], [/ida rentoul outhwaite/i, ["ida-rentoul-outhwaite"]], [/mabel lucie attwell/i, ["mabel-lucie-attwell"]], [/cicely mary barker/i, ["cicely-mary-barker"]], [/warwick goble/i, ["warwick-goble"]], [/hablot knight browne|phiz/i, ["hablot-knight-browne"]], [/phoebe anna traquair/i, ["phoebe-anna-traquair"]], [/margaret macdonald mackintosh/i, ["margaret-macdonald-mackintosh"]], [/frank brangwyn/i, ["frank-brangwyn"]], [/sybil andrews/i, ["sybil-andrews"]], [/cyril power/i, ["cyril-power"]], [/claude flight/i, ["claude-flight"]], [/william orpen/i, ["william-orpen"]], [/laura knight/i, ["laura-knight"]], [/eleanor fortescue\-brickdale/i, ["eleanor-fortescue-brickdale"]], [/elizabeth siddal/i, ["elizabeth-siddal"]], [/marie spartali stillman/i, ["marie-spartali-stillman"]], [/frederick sandys/i, ["frederick-sandys"]], [/nicholas hilliard/i, ["nicholas-hilliard"]], [/amadeo de souza\-cardoso/i, ["amadeo-de-souza-cardoso"]], [/alexandre de riquer/i, ["alexandre-de-riquer"]], [/fortunato depero/i, ["fortunato-depero"]], [/leopoldo metlicovitz/i, ["leopoldo-metlicovitz"]], [/marcello dudovich/i, ["marcello-dudovich"]], [/giovanna garzoni/i, ["giovanna-garzoni"]], [/elisabetta sirani/i, ["elisabetta-sirani"]], [/pietro da cortona/i, ["pietro-da-cortona"]], [/piero di cosimo/i, ["piero-di-cosimo"]], [/filippino lippi/i, ["filippino-lippi"]], [/pinturicchio/i, ["pinturicchio"]], [/ciurlionis|mikalojus konstantinas čiurlionis/i, ["mikalojus-konstantinas-ciurlionis"]], [/niko pirosmani/i, ["niko-pirosmani"]], [/maria prymachenko/i, ["maria-prymachenko"]], [/heorhiy narbut/i, ["heorhiy-narbut"]], [/alexandra exter/i, ["alexandra-exter"]], [/andrei rublev/i, ["andrei-rublev"]], [/alexandre benois/i, ["alexandre-benois"]], [/mikhail larionov/i, ["mikhail-larionov"]], [/nicolae grigorescu/i, ["nicolae-grigorescu"]], [/toyen/i, ["toyen"]], [/josef lada/i, ["josef-lada"]], [/zofia stryjenska|zofia stryjeńska/i, ["zofia-stryjenska"]], [/stanisław ignacy witkiewicz|witkacy/i, ["stanislaw-ignacy-witkiewicz"]], [/peter ilsted/i, ["peter-ilsted"]], [/frida hansen/i, ["frida-hansen"]], [/gerhard munthe/i, ["gerhard-munthe"]], [/eero jarnefelt|eero järnefelt/i, ["eero-jarnefelt"]], [/jean baptiste debret|jean\-baptiste debret/i, ["jean-baptiste-debret"]], [/anita malfatti/i, ["anita-malfatti"]], [/armando reveron|armando reverón/i, ["armando-reveron"]], [/miguel covarrubias/i, ["miguel-covarrubias"]], [/leopoldo mendez|leopoldo méndez/i, ["leopoldo-mendez"]], [/maria izquierdo|maría izquierdo/i, ["maria-izquierdo"]], [/fernando amorsolo/i, ["fernando-amorsolo"]], [/juan luna/i, ["juan-luna"]], [/raden saleh/i, ["raden-saleh"]], [/shin yun\-bok/i, ["shin-yun-bok"]], [/kim hong\-do/i, ["kim-hong-do"]], [/kamisaka sekka/i, ["kamisaka-sekka"]], [/ogata kenzan/i, ["ogata-kenzan"]], [/toyohara kunichika/i, ["toyohara-kunichika"]], [/paul jacoulet/i, ["paul-jacoulet"]], [/charles bartlett|charles w\. bartlett/i, ["charles-w-bartlett"]], [/elizabeth keith/i, ["elizabeth-keith"]], [/ito shinsui|itō shinsui/i, ["ito-shinsui"]], [/yokoyama taikan/i, ["yokoyama-taikan"]], [/wang ximeng/i, ["wang-ximeng"]], [/feng zikai/i, ["feng-zikai"]], [/zheng banqiao/i, ["zheng-banqiao"]], [/mi fu/i, ["mi-fu"]], [/zhang zeduan/i, ["zhang-zeduan"]], [/gu kaizhi/i, ["gu-kaizhi"]], [/levni/i, ["levni"]], [/matrakci nasuh|matrakçı nasuh/i, ["matrakci-nasuh"]], [/sultan muhammad/i, ["sultan-muhammad"]], [/mir emad|mir emad hasani/i, ["mir-emad-hasani"]], [/yaqut al mustasimi|yaqut al\-musta'simi/i, ["yaqut-al-mustasimi"]], [/joris hoefnagel/i, ["joris-hoefnagel"]], [/roger excoffon/i, ["roger-excoffon"]], [/herb lubalin/i, ["herb-lubalin"]], [/cobden sanderson|t\. j\. cobden\-sanderson/i, ["tj-cobden-sanderson"]], [/stanley morison/i, ["stanley-morison"]], [/william addison dwiggins/i, ["william-addison-dwiggins"]], [/william caxton/i, ["william-caxton"]], [/ludovico degli arrighi/i, ["ludovico-degli-arrighi"]], [/francesco griffo/i, ["francesco-griffo"]], [/firmin didot/i, ["firmin-didot"]], [/pierre simon fournier|pierre\-simon fournier/i, ["pierre-simon-fournier"]], [/christophe plantin/i, ["christophe-plantin"]], [/geofroy tory/i, ["geofroy-tory"]], [/robert granjon/i, ["robert-granjon"]], [/johannes gutenberg/i, ["johannes-gutenberg"]], [/josef hoffmann/i, ["josef-hoffmann"]], [/dagobert peche/i, ["dagobert-peche"]], [/hans rudi erdt/i, ["hans-rudi-erdt"]], [/julius klinger/i, ["julius-klinger"]], [/august sander/i, ["august-sander"]], [/karl blossfeldt/i, ["karl-blossfeldt"]], [/philipp otto runge/i, ["philipp-otto-runge"]], [/roelant savery/i, ["roelant-savery"]], [/gerard van honthorst/i, ["gerard-van-honthorst"]], [/hendrick goltzius/i, ["hendrick-goltzius"]], [/henry van de velde/i, ["henry-van-de-velde"]], [/albert gleizes/i, ["albert-gleizes"]], [/jean metzinger/i, ["jean-metzinger"]], [/albert marquet/i, ["albert-marquet"]], [/frederic bazille|frédéric bazille/i, ["frederic-bazille"]], [/paul delaroche/i, ["paul-delaroche"]], [/theodore rousseau|théodore rousseau/i, ["theodore-rousseau"]], [/adelaide labille\-guiard|adélaïde labille\-guiard/i, ["adelaide-labille-guiard"]], [/jean marc nattier|jean\-marc nattier/i, ["jean-marc-nattier"]], [/hans baldung grien/i, ["hans-baldung-grien"]], [/c\. r\. w\. nevinson|cr w nevinson/i, ["crw-nevinson"]], [/ren bonian/i, ["ren-bonian"]], [/w w denslow|w\. w\. denslow/i, ["ww-denslow"]], [/mikolas ales|mikoláš aleš/i, ["mikolas-ales"]], [/leon wyczolkowski|leon wyczółkowski/i, ["leon-wyczolkowski"]], [/jan preisler/i, ["jan-preisler"]], [/c\. w\. eckersberg|eckersberg/i, ["cw-eckersberg"]], [/chobunsai eishi|chōbunsai eishi/i, ["chobunsai-eishi"]], [/jozef chelmonski|józef chełmoński/i, ["jozef-chelmonski"]], [/louis le nain/i, ["louis-le-nain"]], [/basawan/i, ["basawan"]], [/totoya hokkei/i, ["totoya-hokkei"]], [/jozsef rippl ronai|józsef rippl\-rónai/i, ["jozsef-rippl-ronai"]], [/mihaly munkacsy|mihály munkácsy/i, ["mihaly-munkacsy"]], [/jenny nystrom|jenny nyström/i, ["jenny-nystrom"]], [/mizuno toshikata/i, ["mizuno-toshikata"]], [/isoda koryusai|isoda koryūsai/i, ["isoda-koryusai"]], [/manuel orazi/i, ["manuel-orazi"]], [/ludwig richter/i, ["ludwig-richter"]], [/eliseu visconti/i, ["eliseu-visconti"]], [/almeida junior|almeida júnior/i, ["almeida-junior"]], [/hermenegildo bustos/i, ["hermenegildo-bustos"]], [/csontvary|tivadar csontváry kosztka/i, ["tivadar-csontvary-kosztka"]], [/aleksander gierymski/i, ["aleksander-gierymski"]], [/santiago rusinol|santiago rusiñol/i, ["santiago-rusinol"]], [/chen hongshou/i, ["chen-hongshou"]], [/ike no taiga/i, ["ike-no-taiga"]], [/okumura masanobu/i, ["okumura-masanobu"]], [/emil orlik/i, ["emil-orlik"]], [/john hassall/i, ["john-hassall"]], [/rudolf von alt/i, ["rudolf-von-alt"]], [/moritz von schwind/i, ["moritz-von-schwind"]], [/giovanni fattori/i, ["giovanni-fattori"]], [/kano tanyu|kanō tan'yū/i, ["kano-tanyu"]], [/soga shohaku|soga shōhaku/i, ["soga-shohaku"]], [/ogata gekko|ogata gekkō/i, ["ogata-gekko"]], [/toyohara chikanobu/i, ["toyohara-chikanobu"]], [/hans burgkmair/i, ["hans-burgkmair"]], [/adolfo hohenstein/i, ["adolfo-hohenstein"]], [/palmer cox/i, ["palmer-cox"]], [/hans gude/i, ["hans-gude"]], [/john sell cotman/i, ["john-sell-cotman"]], [/richard parkes bonington/i, ["richard-parkes-bonington"]], [/ustad mansur/i, ["ustad-mansur"]], [/huang gongwang/i, ["huang-gongwang"]], [/thomas theodor heine/i, ["thomas-theodor-heine"]], [/oswald cooper/i, ["oswald-cooper"]], [/julio ruelas/i, ["julio-ruelas"]], [/juan manuel blanes/i, ["juan-manuel-blanes"]], [/josef manes|josef mánes/i, ["josef-manes"]], [/harriet backer/i, ["harriet-backer"]], [/thomas girtin/i, ["thomas-girtin"]], [/frans post/i, ["frans-post"]], [/pietro longhi/i, ["pietro-longhi"]], [/gaganendranath tagore/i, ["gaganendranath-tagore"]], [/ni zan/i, ["ni-zan"]], [/hon'ami kōetsu|honami koetsu/i, ["honami-koetsu"]], [/nagasawa rosetsu/i, ["nagasawa-rosetsu"]], [/shibata zeshin/i, ["shibata-zeshin"]], [/joseph maria olbrich/i, ["joseph-maria-olbrich"]], [/alfred roller/i, ["alfred-roller"]], [/ferdinand georg waldmuller|ferdinand georg waldmüller/i, ["ferdinand-georg-waldmuller"]], [/giuseppe de nittis/i, ["giuseppe-de-nittis"]], [/alexei savrasov/i, ["alexei-savrasov"]], [/carl holsoe|carl holsøe/i, ["carl-holsoe"]], [/l\. a\. ring|la ring/i, ["la-ring"]], [/stanhope forbes/i, ["stanhope-forbes"]], [/joos van cleve/i, ["joos-van-cleve"]], [/jean etienne liotard|jean\-étienne liotard/i, ["jean-etienne-liotard"]], [/nicolas lancret/i, ["nicolas-lancret"]], [/jacopo bassano/i, ["jacopo-bassano"]], [/reza abbasi/i, ["reza-abbasi"]], [/nainsukh/i, ["nainsukh"]], [/qiu ying/i, ["qiu-ying"]], [/hashiguchi goyo|hashiguchi goyō/i, ["hashiguchi-goyo"]], [/watanabe seitei/i, ["watanabe-seitei"]], [/katsukawa shunsho|katsukawa shunshō/i, ["katsukawa-shunsho"]], [/otto eckmann/i, ["otto-eckmann"]], [/lucien levy dhurmer|lucien lévy\-dhurmer/i, ["lucien-levy-dhurmer"]], [/georges de feure/i, ["georges-de-feure"]], [/henri riviere|henri rivière/i, ["henri-riviere"]], [/jean louis forain|jean\-louis forain/i, ["jean-louis-forain"]], [/morris fuller benton/i, ["morris-fuller-benton"]], [/rudolf koch/i, ["rudolf-koch"]], [/frederic goudy/i, ["frederic-goudy"]], [/nicolas jenson/i, ["nicolas-jenson"]], [/william caslon/i, ["william-caslon"]], [/christian krohg/i, ["christian-krohg"]], [/edward wadsworth/i, ["edward-wadsworth"]], [/francois clouet|françois clouet/i, ["francois-clouet"]], [/aert van der neer/i, ["aert-van-der-neer"]], [/melchior d'hondecoeter|melchior d hondecoeter/i, ["melchior-dhondecoeter"]], [/carlo dolci/i, ["carlo-dolci"]], [/domenichino/i, ["domenichino"]], [/federico barocci/i, ["federico-barocci"]], [/utagawa toyokuni/i, ["utagawa-toyokuni"]], [/wenceslaus hollar/i, ["wenceslaus-hollar"]], [/louis rhead/i, ["louis-rhead"]], [/edward penfield/i, ["edward-penfield"]], [/alfred stevens/i, ["alfred-stevens"]], [/peder balke/i, ["peder-balke"]], [/albert edelfelt/i, ["albert-edelfelt"]], [/sebastiano del piombo/i, ["sebastiano-del-piombo"]], [/behzad|kamāl ud\-dīn behzād/i, ["kamal-ud-din-behzad"]], [/wang hui/i, ["wang-hui"]], [/ma yuan/i, ["ma-yuan"]], [/helen hyde/i, ["helen-hyde"]], [/karl bodmer/i, ["karl-bodmer"]], [/george clausen/i, ["george-clausen"]], [/ambrosius bosschaert/i, ["ambrosius-bosschaert"]], [/emperor huizong/i, ["emperor-huizong"]], [/tang yin/i, ["tang-yin"]], [/guo xi/i, ["guo-xi"]], [/tomioka tessai/i, ["tomioka-tessai"]], [/hishikawa moronobu/i, ["hishikawa-moronobu"]], [/thomas bewick/i, ["thomas-bewick"]], [/henri le sidaner/i, ["henri-le-sidaner"]], [/giambattista bodoni/i, ["giambattista-bodoni"]], [/john baskerville/i, ["john-baskerville"]], [/pedro figari/i, ["pedro-figari"]], [/karl bryullov/i, ["karl-bryullov"]], [/albert moore/i, ["albert-moore"]], [/luis melendez|luis meléndez/i, ["luis-melendez"]], [/juan sanchez cotan|juan sánchez cotán/i, ["juan-sanchez-cotan"]], [/willem claesz heda|willem claesz\. heda/i, ["willem-claesz-heda"]], [/jean baptiste oudry|jean\-baptiste oudry/i, ["jean-baptiste-oudry"]], [/xu wei/i, ["xu-wei"]], [/zhao mengfu/i, ["zhao-mengfu"]], [/yosa buson/i, ["yosa-buson"]], [/takehisa yumeji/i, ["takehisa-yumeji"]], [/uemura shoen|uemura shōen/i, ["uemura-shoen"]], [/privat livemont|privat\-livemont/i, ["privat-livemont"]], [/wilhelm busch/i, ["wilhelm-busch"]], [/henri martin/i, ["henri-martin"]], [/maximilien luce/i, ["maximilien-luce"]], [/elihu vedder/i, ["elihu-vedder"]], [/arturo michelena/i, ["arturo-michelena"]], [/konstantin korovin/i, ["konstantin-korovin"]], [/petrus christus/i, ["petrus-christus"]], [/hyacinthe rigaud/i, ["hyacinthe-rigaud"]], [/j alden weir|j\. alden weir/i, ["j-alden-weir"]], [/claude garamond/i, ["claude-garamond"]], [/claude joseph vernet|claude\-joseph vernet/i, ["claude-joseph-vernet"]], [/fan kuan/i, ["fan-kuan"]], [/jacques callot/i, ["jacques-callot"]], [/willy pogany/i, ["willy-pogany"]], [/george cruikshank/i, ["george-cruikshank"]], [/thomas rowlandson/i, ["thomas-rowlandson"]], [/jean delville/i, ["jean-delville"]], [/jules bastien lepage|jules bastien\-lepage/i, ["jules-bastien-lepage"]], [/ernest meissonier|jean louis ernest meissonier/i, ["ernest-meissonier"]], [/william harnett|william michael harnett/i, ["william-michael-harnett"]], [/john henry twachtman|john twachtman/i, ["john-henry-twachtman"]], [/john la farge/i, ["john-la-farge"]], [/aldus manutius/i, ["aldus-manutius"]], [/saturnino herran|saturnino herrán/i, ["saturnino-herran"]], [/limbourg brothers/i, ["limbourg-brothers"]], [/jean fouquet/i, ["jean-fouquet"]], [/pompeo batoni/i, ["pompeo-batoni"]], [/giulio romano/i, ["giulio-romano"]], [/giuseppe castiglione/i, ["giuseppe-castiglione"]], [/emile galle|émile gallé/i, ["emile-galle"]], [/william glackens/i, ["william-glackens"]], [/charles le brun/i, ["charles-le-brun"]], [/rosalba carriera/i, ["rosalba-carriera"]], [/osman hamdi bey/i, ["osman-hamdi-bey"]], [/martin schongauer/i, ["martin-schongauer"]], [/arthur wesley dow/i, ["arthur-wesley-dow"]], [/james gillray/i, ["james-gillray"]], [/leon bakst|léon bakst/i, ["leon-bakst"]], [/max klinger/i, ["max-klinger"]], [/maurice prendergast/i, ["maurice-prendergast"]], [/peter behrens/i, ["peter-behrens"]], [/jose maria velasco|josé maría velasco/i, ["jose-maria-velasco"]], [/konstantin somov/i, ["konstantin-somov"]], [/william nicholson/i, ["william-nicholson"]], [/robert campin/i, ["robert-campin"]], [/pieter claesz/i, ["pieter-claesz"]], [/hubert robert/i, ["hubert-robert"]], [/giovanni paolo panini/i, ["giovanni-paolo-panini"]], [/tsuchiya koitsu/i, ["tsuchiya-koitsu"]], [/john marin/i, ["john-marin"]], [/hugo simberg/i, ["hugo-simberg"]], [/hector guimard/i, ["hector-guimard"]], [/william heath robinson/i, ["william-heath-robinson"]], [/theodor kittelsen/i, ["theodor-kittelsen"]], [/vasily vereshchagin/i, ["vasily-vereshchagin"]], [/philippe de champaigne/i, ["philippe-de-champaigne"]], [/leon spilliaert|léon spilliaert/i, ["leon-spilliaert"]], [/joseph stella/i, ["joseph-stella"]], [/jan matejko/i, ["jan-matejko"]], [/arthur hughes/i, ["arthur-hughes"]], [/francisco oller/i, ["francisco-oller"]], [/frits thaulow/i, ["frits-thaulow"]], [/gerda wegener/i, ["gerda-wegener"]], [/charles m\. russell|charles russell/i, ["charles-m-russell"]], [/george catlin/i, ["george-catlin"]], [/edward curtis|edward s\. curtis/i, ["edward-s-curtis"]], [/jose guadalupe posada|josé guadalupe posada/i, ["jose-guadalupe-posada"]], [/mathew brady/i, ["mathew-brady"]], [/currier and ives/i, ["currier-and-ives"]], [/albert pinkham ryder/i, ["albert-pinkham-ryder"]], [/lewis hine/i, ["lewis-hine"]], [/grandville|j\. j\. grandville/i, ["jj-grandville"]], [/thomas nast/i, ["thomas-nast"]], [/louis wain/i, ["louis-wain"]], [/jozef mehoffer|józef mehoffer/i, ["jozef-mehoffer"]], [/anton romako/i, ["anton-romako"]], [/juan de valdes leal|juan de valdés leal/i, ["juan-de-valdes-leal"]], [/ilya mashkov/i, ["ilya-mashkov"]], [/giuseppe pellizza da volpedo/i, ["giuseppe-pellizza-da-volpedo"]], [/olga boznanska|olga boznańska/i, ["olga-boznanska"]], [/heinrich vogeler/i, ["heinrich-vogeler"]], [/giovanni giacometti/i, ["giovanni-giacometti"]], [/wilhelm leibl/i, ["wilhelm-leibl"]], [/rudolf schlichter/i, ["rudolf-schlichter"]], [/adriaen van ostade/i, ["adriaen-van-ostade"]], [/gabriel metsu/i, ["gabriel-metsu"]], [/albert anker/i, ["albert-anker"]], [/anselm feuerbach/i, ["anselm-feuerbach"]], [/stanislaw wyspianski|stanisław wyspiański/i, ["stanislaw-wyspianski"]], [/fra bartolomeo/i, ["fra-bartolomeo"]], [/paulus potter/i, ["paulus-potter"]], [/nicolaes maes/i, ["nicolaes-maes"]], [/kuzma petrov vodkin|kuzma petrov\-vodkin/i, ["kuzma-petrov-vodkin"]], [/theo van rysselberghe|théo van rysselberghe/i, ["theo-van-rysselberghe"]], [/julio romero de torres/i, ["julio-romero-de-torres"]], [/alonso cano/i, ["alonso-cano"]], [/meindert hobbema/i, ["meindert-hobbema"]], [/lucas van leyden/i, ["lucas-van-leyden"]], [/jan gossaert/i, ["jan-gossaert"]], [/richard gerstl/i, ["richard-gerstl"]], [/gustav klucis|gustav klutsis/i, ["gustav-klutsis"]], [/vasily surikov/i, ["vasily-surikov"]], [/kurt seligmann/i, ["kurt-seligmann"]], [/albert uderzo/i, ["albert-uderzo"]], [/ignacio zuloaga/i, ["ignacio-zuloaga"]], [/adriaen coorte/i, ["adriaen-coorte"]], [/willem kalf/i, ["willem-kalf"]], [/pieter aertsen/i, ["pieter-aertsen"]], [/gerard david/i, ["gerard-david"]], [/cuno amiet/i, ["cuno-amiet"]], [/hans makart/i, ["hans-makart"]], [/hans thoma/i, ["hans-thoma"]], [/otto mueller/i, ["otto-mueller"]], [/aleksandr deyneka/i, ["aleksandr-deyneka"]], [/boris kustodiev/i, ["boris-kustodiev"]], [/frank e schoonover|frank e\. schoonover/i, ["frank-e-schoonover"]], [/giovanni segantini/i, ["giovanni-segantini"]], [/gentile da fabriano/i, ["gentile-da-fabriano"]], [/benozzo gozzoli/i, ["benozzo-gozzoli"]], [/frans snyders/i, ["frans-snyders"]], [/jacob jordaens/i, ["jacob-jordaens"]], [/dieric bouts/i, ["dieric-bouts"]], [/jeanne mammen/i, ["jeanne-mammen"]], [/marianne von werefkin/i, ["marianne-von-werefkin"]], [/wolfgang paalen/i, ["wolfgang-paalen"]], [/coles phillips/i, ["coles-phillips"]], [/ambrogio lorenzetti/i, ["ambrogio-lorenzetti"]], [/vittore carpaccio/i, ["vittore-carpaccio"]], [/lorenzo lotto/i, ["lorenzo-lotto"]], [/jan van goyen/i, ["jan-van-goyen"]], [/hendrick avercamp/i, ["hendrick-avercamp"]], [/joachim patinir/i, ["joachim-patinir"]], [/christian schad/i, ["christian-schad"]], [/karl schmidt rottluff|karl schmidt\-rottluff/i, ["karl-schmidt-rottluff"]], [/max pechstein/i, ["max-pechstein"]], [/alexej von jawlensky/i, ["alexej-von-jawlensky"]], [/varvara stepanova/i, ["varvara-stepanova"]], [/lyubov popova/i, ["lyubov-popova"]], [/jacek malczewski/i, ["jacek-malczewski"]], [/gustaf tenggren/i, ["gustaf-tenggren"]], [/jean beraud|jean béraud/i, ["jean-beraud"]], [/armand guillaumin/i, ["armand-guillaumin"]], [/paul serusier|paul sérusier/i, ["paul-serusier"]], [/guercino/i, ["guercino"]], [/david teniers the younger/i, ["david-teniers-the-younger"]], [/gerrit dou/i, ["gerrit-dou"]], [/hugo van der goes/i, ["hugo-van-der-goes"]], [/vladimir tatlin/i, ["vladimir-tatlin"]], [/william sidney mount/i, ["william-sidney-mount"]], [/eastman johnson/i, ["eastman-johnson"]], [/john frederick kensett/i, ["john-frederick-kensett"]], [/sanford gifford|sanford robinson gifford/i, ["sanford-robinson-gifford"]], [/francesco hayez/i, ["francesco-hayez"]], [/luca giordano/i, ["luca-giordano"]], [/orazio gentileschi/i, ["orazio-gentileschi"]], [/carlo crivelli/i, ["carlo-crivelli"]], [/jan van huysum/i, ["jan-van-huysum"]], [/quentin matsys/i, ["quentin-matsys"]], [/carl spitzweg/i, ["carl-spitzweg"]], [/ivan kramskoi/i, ["ivan-kramskoi"]], [/victor brauner/i, ["victor-brauner"]], [/jack davis|jack davis illustrator/i, ["jack-davis"]], [/alex raymond/i, ["alex-raymond"]], [/harvey dunn/i, ["harvey-dunn"]], [/emile bernard|émile bernard/i, ["emile-bernard"]], [/maurice denis/i, ["maurice-denis"]], [/mariano fortuny/i, ["mariano-fortuny"]], [/jusepe de ribera/i, ["jusepe-de-ribera"]], [/antonello da messina/i, ["antonello-da-messina"]], [/jan davidsz de heem|jan davidsz\. de heem/i, ["jan-davidsz-de-heem"]], [/ferdinand hodler/i, ["ferdinand-hodler"]], [/franz xaver winterhalter/i, ["franz-xaver-winterhalter"]], [/erich heckel/i, ["erich-heckel"]], [/mikhail vrubel/i, ["mikhail-vrubel"]], [/viktor vasnetsov/i, ["viktor-vasnetsov"]], [/dr seuss illustrations|dr\. seuss/i, ["dr-seuss"]], [/ronald searle/i, ["ronald-searle"]], [/hal foster/i, ["hal-foster"]], [/howard chandler christy/i, ["howard-chandler-christy"]], [/rembrandt peale/i, ["rembrandt-peale"]], [/jasper cropsey/i, ["jasper-cropsey"]], [/henri edmond cross|henri\-edmond cross/i, ["henri-edmond-cross"]], [/annibale carracci/i, ["annibale-carracci"]], [/simone martini/i, ["simone-martini"]], [/andrea del sarto/i, ["andrea-del-sarto"]], [/jan brueghel the elder/i, ["jan-brueghel-the-elder"]], [/adolph menzel/i, ["adolph-menzel"]], [/andre masson|andré masson/i, ["andre-masson"]], [/wanda gag|wanda gág/i, ["wanda-gag"]], [/garth williams/i, ["garth-williams"]], [/nicolas de stael|nicolas de staël/i, ["nicolas-de-stael"]], [/salvator rosa/i, ["salvator-rosa"]], [/uccello/i, ["paolo-uccello"]], [/max bill/i, ["max-bill"]], [/sophie taeuber arp|sophie taeuber\-arp/i, ["sophie-taeuber-arp"]], [/virginia lee burton/i, ["virginia-lee-burton"]], [/george herriman/i, ["george-herriman"]], [/haddon sundblom/i, ["haddon-sundblom"]], [/felix vallotton|félix vallotton/i, ["felix-vallotton"]], [/jean tinguely/i, ["jean-tinguely"]], [/pisanello/i, ["pisanello"]], [/pontormo/i, ["pontormo"]], [/clara peeters/i, ["clara-peeters"]], [/kay sage/i, ["kay-sage"]], [/carl barks/i, ["carl-barks"]], [/asher durand/i, ["asher-durand"]], [/antonio canova/i, ["antonio-canova"]], [/zinaida serebriakova/i, ["zinaida-serebriakova"]], [/james montgomery flagg/i, ["james-montgomery-flagg"]], [/marie laurencin/i, ["marie-laurencin"]], [/dean cornwell/i, ["dean-cornwell"]], [/charles dana gibson/i, ["charles-dana-gibson"]], [/winsor mccay/i, ["winsor-mccay"]], [/benjamin west/i, ["benjamin-west"]], [/charles willson peale/i, ["charles-willson-peale"]], [/john trumbull/i, ["john-trumbull"]], [/lavinia fontana/i, ["lavinia-fontana"]], [/andrea del verrocchio/i, ["andrea-del-verrocchio"]], [/gian lorenzo bernini/i, ["gian-lorenzo-bernini"]], [/wen zhengming/i, ["wen-zhengming"]], [/kano eitoku|kanō eitoku/i, ["kano-eitoku"]], [/lin fengmian/i, ["lin-fengmian"]], [/shitao/i, ["shitao"]], [/dong qichang/i, ["dong-qichang"]], [/torii kiyonaga/i, ["torii-kiyonaga"]], [/keisai eisen/i, ["keisai-eisen"]], [/john piper|john piper artist/i, ["john-piper"]], [/gerard sekoto/i, ["gerard-sekoto"]], [/irma stern/i, ["irma-stern"]], [/nandalal bose/i, ["nandalal-bose"]], [/harald sohlberg/i, ["harald-sohlberg"]], [/bada shanren/i, ["bada-shanren"]], [/margaret preston/i, ["margaret-preston"]], [/maruyama okyo|maruyama ōkyo/i, ["maruyama-okyo"]], [/pierre soulages/i, ["pierre-soulages"]], [/guido reni/i, ["guido-reni"]], [/leo lionni/i, ["leo-lionni"]], [/will eisner/i, ["will-eisner"]], [/meret oppenheim/i, ["meret-oppenheim"]], [/herge|hergé/i, ["herge"]], [/francis picabia/i, ["francis-picabia"]], [/gabriele munter|gabriele münter/i, ["gabriele-munter"]], [/leonor fini/i, ["leonor-fini"]], [/tasha tudor/i, ["tasha-tudor"]], [/dorothea tanning/i, ["dorothea-tanning"]], [/zdzislaw beksinski|zdzisław beksiński/i, ["zdzislaw-beksinski"]], [/al hirschfeld/i, ["al-hirschfeld"]], [/sofonisba anguissola/i, ["sofonisba-anguissola"]], [/eyvind earle/i, ["eyvind-earle"]], [/niki de saint phalle/i, ["niki-de-saint-phalle"]], [/yves klein/i, ["yves-klein"]], [/tove jansson/i, ["tove-jansson"]], [/bronzino/i, ["bronzino"]], [/steve ditko/i, ["steve-ditko"]], [/richard scarry/i, ["richard-scarry"]], [/eric carle/i, ["eric-carle"]], [/charles m\. schulz|charles schulz/i, ["charles-m-schulz"]], [/j c dahl|j\. c\. dahl/i, ["jc-dahl"]], [/a y jackson|a\. y\. jackson/i, ["ay-jackson"]], [/j e h macdonald|j\. e\. h\. macdonald/i, ["jeh-macdonald"]], [/s h raza|s\. h\. raza/i, ["sh-raza"]], [/otl aicher/i, ["otl-aicher"]], [/paul renner/i, ["paul-renner"]], [/christen kobke|christen købke/i, ["christen-kobke"]], [/lajos kassak|lajos kassák/i, ["lajos-kassak"]], [/constant permeke/i, ["constant-permeke"]], [/charles goldie/i, ["charles-goldie"]], [/tsukioka kogyo|tsukioka kōgyo/i, ["tsukioka-kogyo"]], [/pyke koch/i, ["pyke-koch"]], [/rik wouters/i, ["rik-wouters"]], [/wu changshuo/i, ["wu-changshuo"]], [/utagawa hiroshige ii/i, ["utagawa-hiroshige-ii"]], [/tawaraya sotatsu|tawaraya sōtatsu/i, ["tawaraya-sotatsu"]], [/michael ancher/i, ["michael-ancher"]], [/frederick mccubbin/i, ["frederick-mccubbin"]], [/russell drysdale/i, ["russell-drysdale"]], [/sakai hoitsu|sakai hōitsu/i, ["sakai-hoitsu"]], [/tom eckersley/i, ["tom-eckersley"]], [/august strindberg|august strindberg paintings/i, ["august-strindberg"]], [/cornelius krieghoff/i, ["cornelius-krieghoff"]], [/frances hodgkins/i, ["frances-hodgkins"]], [/colin mccahon/i, ["colin-mccahon"]], [/bart van der leck/i, ["bart-van-der-leck"]], [/carel willink/i, ["carel-willink"]], [/edward johnston/i, ["edward-johnston"]], [/david bomberg/i, ["david-bomberg"]], [/nadar|nadar photographer/i, ["nadar"]], [/hasegawa tohaku|hasegawa tōhaku/i, ["hasegawa-tohaku"]], [/abram games/i, ["abram-games"]], [/henri gaudier brzeska|henri gaudier\-brzeska/i, ["henri-gaudier-brzeska"]], [/bruno liljefors/i, ["bruno-liljefors"]], [/nikolai astrup/i, ["nikolai-astrup"]], [/abanindranath tagore/i, ["abanindranath-tagore"]], [/shen zhou/i, ["shen-zhou"]], [/patrick heron/i, ["patrick-heron"]], [/carlo carra|carlo carrà/i, ["carlo-carra"]], [/heinrich kley/i, ["heinrich-kley"]], [/anna ancher/i, ["anna-ancher"]], [/edward mcknight kauffer/i, ["edward-mcknight-kauffer"]], [/hermann zapf/i, ["hermann-zapf"]], [/jean paul riopelle|jean\-paul riopelle/i, ["jean-paul-riopelle"]], [/sanyu/i, ["sanyu"]], [/katsushika oi|katsushika ōi/i, ["katsushika-oi"]], [/gunta stolzl|gunta stölzl/i, ["gunta-stolzl"]], [/marianne brandt/i, ["marianne-brandt"]], [/sidney nolan/i, ["sidney-nolan"]], [/albert namatjira/i, ["albert-namatjira"]], [/ben enwonwu/i, ["ben-enwonwu"]], [/dr atl|dr\. atl/i, ["dr-atl"]], [/alvin lustig/i, ["alvin-lustig"]], [/kenojuak ashevak/i, ["kenojuak-ashevak"]], [/candido portinari|cândido portinari/i, ["candido-portinari"]], [/rabindranath tagore|rabindranath tagore paintings/i, ["rabindranath-tagore"]], [/jamini roy/i, ["jamini-roy"]], [/lester beall/i, ["lester-beall"]], [/gino severini/i, ["gino-severini"]], [/gerrit rietveld/i, ["gerrit-rietveld"]], [/paul kane/i, ["paul-kane"]], [/koson|shoson/i, ["ohara-koson"]], [/ben nicholson/i, ["ben-nicholson"]], [/eduardo paolozzi/i, ["eduardo-paolozzi"]], [/mark tobey/i, ["mark-tobey"]], [/dora carrington/i, ["dora-carrington"]], [/paul delvaux/i, ["paul-delvaux"]], [/frantisek kupka|františek kupka/i, ["frantisek-kupka"]], [/armin hofmann/i, ["armin-hofmann"]], [/jan tschichold/i, ["jan-tschichold"]], [/richard hamilton|richard hamilton artist/i, ["richard-hamilton"]], [/duncan grant/i, ["duncan-grant"]], [/kees van dongen/i, ["kees-van-dongen"]], [/maurice de vlaminck/i, ["maurice-de-vlaminck"]], [/victor horta/i, ["victor-horta"]], [/xul solar/i, ["xul-solar"]], [/joaquin torres garcia|joaquín torres garcía/i, ["joaquin-torres-garcia"]], [/pan yuliang/i, ["pan-yuliang"]], [/elsa beskow/i, ["elsa-beskow"]], [/adrian frutiger/i, ["adrian-frutiger"]], [/graham sutherland/i, ["graham-sutherland"]], [/wyndham lewis/i, ["wyndham-lewis"]], [/giacomo balla/i, ["giacomo-balla"]], [/josef muller brockmann|josef müller\-brockmann/i, ["josef-muller-brockmann"]], [/kenneth noland/i, ["kenneth-noland"]], [/morris louis/i, ["morris-louis"]], [/adolph gottlieb/i, ["adolph-gottlieb"]], [/maurice utrillo/i, ["maurice-utrillo"]], [/gustave baumann/i, ["gustave-baumann"]], [/jessie willcox smith/i, ["jessie-willcox-smith"]], [/john bauer/i, ["john-bauer"]], [/eric gill/i, ["eric-gill"]], [/arthur dove/i, ["arthur-dove"]], [/charles sheeler/i, ["charles-sheeler"]], [/georges rouault/i, ["georges-rouault"]], [/lucio fontana/i, ["lucio-fontana"]], [/francis bacon|francis bacon painter/i, ["francis-bacon"]], [/eugene atget|eugène atget/i, ["eugene-atget"]], [/charles demuth/i, ["charles-demuth"]], [/raoul dufy/i, ["raoul-dufy"]], [/umberto boccioni/i, ["umberto-boccioni"]], [/norval morrisseau/i, ["norval-morrisseau"]], [/tom wesselmann/i, ["tom-wesselmann"]], [/james rosenquist/i, ["james-rosenquist"]], [/marsden hartley/i, ["marsden-hartley"]], [/stuart davis/i, ["stuart-davis"]], [/vanessa bell/i, ["vanessa-bell"]], [/andre derain|andré derain/i, ["andre-derain"]], [/suzanne valadon/i, ["suzanne-valadon"]], [/chaim soutine|chaïm soutine/i, ["chaim-soutine"]], [/roberto matta/i, ["roberto-matta"]], [/elaine de kooning/i, ["elaine-de-kooning"]], [/ben shahn/i, ["ben-shahn"]], [/berenice abbott/i, ["berenice-abbott"]], [/giorgio morandi/i, ["giorgio-morandi"]], [/tarsila do amaral/i, ["tarsila-do-amaral"]], [/marcel breuer/i, ["marcel-breuer"]], [/walter gropius/i, ["walter-gropius"]], [/eva hesse/i, ["eva-hesse"]], [/richard diebenkorn/i, ["richard-diebenkorn"]], [/robert motherwell/i, ["robert-motherwell"]], [/edward steichen/i, ["edward-steichen"]], [/david alfaro siqueiros/i, ["david-alfaro-siqueiros"]], [/imogen cunningham/i, ["imogen-cunningham"]], [/julia margaret cameron/i, ["julia-margaret-cameron"]], [/helene schjerfbeck/i, ["helene-schjerfbeck"]], [/rufino tamayo/i, ["rufino-tamayo"]], [/robert indiana/i, ["robert-indiana"]], [/philip guston/i, ["philip-guston"]], [/eadweard muybridge/i, ["eadweard-muybridge"]], [/walker evans/i, ["walker-evans"]], [/alex colville/i, ["alex-colville"]], [/alice neel/i, ["alice-neel"]], [/robert capa/i, ["robert-capa"]], [/edward weston/i, ["edward-weston"]], [/alfred stieglitz/i, ["alfred-stieglitz"]], [/claes oldenburg/i, ["claes-oldenburg"]], [/louise nevelson/i, ["louise-nevelson"]], [/isamu noguchi/i, ["isamu-noguchi"]], [/wifredo lam/i, ["wifredo-lam"]], [/vivian maier/i, ["vivian-maier"]], [/henri cartier bresson|henri cartier\-bresson/i, ["henri-cartier-bresson"]], [/weegee/i, ["weegee"]], [/ruth asawa/i, ["ruth-asawa"]], [/wayne thiebaud/i, ["wayne-thiebaud"]], [/diane arbus/i, ["diane-arbus"]], [/fernando botero/i, ["fernando-botero"]], [/dorothea lange/i, ["dorothea-lange"]], [/ansel adams/i, ["ansel-adams"]], [/jan toorop/i, ["jan-toorop"]], [/albrecht altdorfer/i, ["albrecht-altdorfer"]], [/ito jakuchu|itō jakuchū/i, ["ito-jakuchu"]], [/theophile steinlen|théophile steinlen/i, ["theophile-steinlen"]], [/lucian bernhard/i, ["lucian-bernhard"]], [/ludwig hohlwein/i, ["ludwig-hohlwein"]], [/eric ravilious/i, ["eric-ravilious"]], [/george frederic watts/i, ["george-frederic-watts"]], [/tsuguharu foujita/i, ["tsuguharu-foujita"]], [/akseli gallen kallela|akseli gallen\-kallela/i, ["akseli-gallen-kallela"]], [/tom roberts|tom roberts artist/i, ["tom-roberts"]], [/lovis corinth/i, ["lovis-corinth"]], [/fitz henry lane/i, ["fitz-henry-lane"]], [/samuel palmer/i, ["samuel-palmer"]], [/pieter de hooch/i, ["pieter-de-hooch"]], [/kawanabe kyosai|kawanabe kyōsai/i, ["kawanabe-kyosai"]], [/randolph caldecott/i, ["randolph-caldecott"]], [/zhang daqian/i, ["zhang-daqian"]], [/arkhip kuindzhi/i, ["arkhip-kuindzhi"]], [/vilhelm hammershoi|vilhelm hammershøi/i, ["vilhelm-hammershoi"]], [/lyonel feininger/i, ["lyonel-feininger"]], [/herbert bayer/i, ["herbert-bayer"]], [/angelica kauffman/i, ["angelica-kauffman"]], [/harry clarke/i, ["harry-clarke"]], [/anni albers/i, ["anni-albers"]], [/amrita sher\-gil/i, ["amrita-sher-gil"]], [/ernst ludwig kirchner/i, ["ernst-ludwig-kirchner"]], [/n c wyeth|n\. c\. wyeth/i, ["nc-wyeth"]], [/moebius/i, ["moebius"]], [/donatello/i, ["donatello"]], [/bartolome esteban murillo|bartolomé esteban murillo/i, ["bartolome-esteban-murillo"]], [/sesshu|sesshū tōyō/i, ["sesshu-toyo"]], [/p\. s\. krøyer|peder severin kroyer/i, ["ps-kroyer"]], [/arthur streeton/i, ["arthur-streeton"]], [/bernardo bellotto/i, ["bernardo-bellotto"]], [/aelbert cuyp/i, ["aelbert-cuyp"]], [/toshusai sharaku|tōshūsai sharaku/i, ["toshusai-sharaku"]], [/edward bawden/i, ["edward-bawden"]], [/francesco guardi/i, ["francesco-guardi"]], [/matthias grunewald|matthias grünewald/i, ["matthias-grunewald"]], [/francisco de zurbaran|francisco de zurbarán/i, ["francisco-de-zurbaran"]], [/gerard ter borch/i, ["gerard-ter-borch"]], [/kobayashi kiyochika/i, ["kobayashi-kiyochika"]], [/suzuki harunobu/i, ["suzuki-harunobu"]], [/ogata korin|ogata kōrin/i, ["ogata-korin"]], [/eugene grasset|eugène grasset/i, ["eugene-grasset"]], [/will bradley/i, ["will-bradley"]], [/pierre joseph redoute|pierre\-joseph redouté/i, ["pierre-joseph-redoute"]], [/fernand khnopff/i, ["fernand-khnopff"]], [/thomas lawrence/i, ["thomas-lawrence"]], [/ford madox brown/i, ["ford-madox-brown"]], [/evelyn de morgan/i, ["evelyn-de-morgan"]], [/jules breton/i, ["jules-breton"]], [/domenico ghirlandaio/i, ["domenico-ghirlandaio"]], [/august macke/i, ["august-macke"]], [/max liebermann/i, ["max-liebermann"]], [/leonetto cappiello/i, ["leonetto-cappiello"]], [/kate greenaway/i, ["kate-greenaway"]], [/isaac levitan/i, ["isaac-levitan"]], [/ramon casas/i, ["ramon-casas"]], [/edward hicks/i, ["edward-hicks"]], [/cecilia beaux/i, ["cecilia-beaux"]], [/jacob van ruisdael/i, ["jacob-van-ruisdael"]], [/hans memling/i, ["hans-memling"]], [/koloman moser/i, ["koloman-moser"]], [/gwen john/i, ["gwen-john"]], [/filippo lippi/i, ["filippo-lippi"]], [/qi baishi/i, ["qi-baishi"]], [/laszlo moholy nagy|lászló moholy\-nagy/i, ["laszlo-moholy-nagy"]], [/georges de la tour/i, ["georges-de-la-tour"]], [/a\. m\. cassandre|cassandre/i, ["am-cassandre"]], [/joshua reynolds/i, ["joshua-reynolds"]], [/e\. h\. shepard|eh shepard/i, ["eh-shepard"]], [/utagawa kunisada/i, ["utagawa-kunisada"]], [/stanley spencer/i, ["stanley-spencer"]], [/xu beihong/i, ["xu-beihong"]], [/oskar schlemmer/i, ["oskar-schlemmer"]], [/johannes itten/i, ["johannes-itten"]], [/giovanni boldini/i, ["giovanni-boldini"]], [/pierre puvis de chavannes/i, ["pierre-puvis-de-chavannes"]], [/elisabeth vigee le brun|élisabeth vigée le brun/i, ["elisabeth-vigee-le-brun"]], [/paul nash/i, ["paul-nash"]], [/john william godward/i, ["john-william-godward"]], [/carel fabritius/i, ["carel-fabritius"]], [/duccio/i, ["duccio"]], [/parmigianino/i, ["parmigianino"]], [/correggio/i, ["correggio"]], [/natalia goncharova/i, ["natalia-goncharova"]], [/theo van doesburg/i, ["theo-van-doesburg"]], [/john tenniel/i, ["john-tenniel"]], [/lawren harris/i, ["lawren-harris"]], [/rene lalique|rené lalique/i, ["rene-lalique"]], [/martin johnson heade/i, ["martin-johnson-heade"]], [/george caleb bingham/i, ["george-caleb-bingham"]], [/george stubbs/i, ["george-stubbs"]], [/joseph wright of derby/i, ["joseph-wright-of-derby"]], [/rogier van der weyden/i, ["rogier-van-der-weyden"]], [/paula modersohn becker|paula modersohn\-becker/i, ["paula-modersohn-becker"]], [/carl larsson/i, ["carl-larsson"]], [/ivan bilibin/i, ["ivan-bilibin"]], [/giorgione/i, ["giorgione"]], [/andrea mantegna/i, ["andrea-mantegna"]], [/william merritt chase/i, ["william-merritt-chase"]], [/richard dadd/i, ["richard-dadd"]], [/edmund dulac/i, ["edmund-dulac"]], [/cimabue/i, ["cimabue"]], [/alexander rodchenko/i, ["alexander-rodchenko"]], [/tom thomson/i, ["tom-thomson"]], [/robert delaunay/i, ["robert-delaunay"]], [/arnold bocklin|arnold böcklin/i, ["arnold-bocklin"]], [/john sloan/i, ["john-sloan"]], [/walter sickert/i, ["walter-sickert"]], [/theodore gericault|théodore géricault/i, ["theodore-gericault"]], [/judith leyster/i, ["judith-leyster"]], [/edward lear/i, ["edward-lear"]], [/l\. s\. lowry|ls lowry/i, ["ls-lowry"]], [/emil nolde/i, ["emil-nolde"]], [/gilbert stuart/i, ["gilbert-stuart"]], [/louis comfort tiffany/i, ["louis-comfort-tiffany"]], [/joaquin sorolla|joaquín sorolla/i, ["joaquin-sorolla"]], [/auguste rodin/i, ["auguste-rodin"]], [/john martin/i, ["john-martin"]], [/thomas hart benton/i, ["thomas-hart-benton"]], [/tamara de lempicka/i, ["tamara-de-lempicka"]], [/robert henri/i, ["robert-henri"]], [/george bellows/i, ["george-bellows"]], [/john singleton copley/i, ["john-singleton-copley"]], [/anders zorn/i, ["anders-zorn"]], [/yoshida hiroshi/i, ["yoshida-hiroshi"]], [/kay nielsen/i, ["kay-nielsen"]], [/howard pyle/i, ["howard-pyle"]], [/gil elvgren/i, ["gil-elvgren"]], [/kurt schwitters/i, ["kurt-schwitters"]], [/perugino/i, ["perugino"]], [/piero della francesca/i, ["piero-della-francesca"]], [/el lissitzky/i, ["el-lissitzky"]], [/nicholas roerich/i, ["nicholas-roerich"]], [/constantin brancusi/i, ["constantin-brancusi"]], [/george grosz/i, ["george-grosz"]], [/fernand leger|fernand léger/i, ["fernand-leger"]], [/rachel ruysch/i, ["rachel-ruysch"]], [/horace pippin/i, ["horace-pippin"]], [/giorgio de chirico/i, ["giorgio-de-chirico"]], [/victor vasarely/i, ["victor-vasarely"]], [/franz kline/i, ["franz-kline"]], [/maria sibylla merian/i, ["maria-sibylla-merian"]], [/erte|erté/i, ["erte"]], [/ellsworth kelly/i, ["ellsworth-kelly"]], [/giuseppe arcimboldo/i, ["giuseppe-arcimboldo"]], [/arshile gorky/i, ["arshile-gorky"]], [/massimo vignelli/i, ["massimo-vignelli"]], [/max beckmann/i, ["max-beckmann"]], [/oskar kokoschka/i, ["oskar-kokoschka"]], [/raja ravi varma/i, ["raja-ravi-varma"]], [/yves tanguy/i, ["yves-tanguy"]], [/jean dubuffet/i, ["jean-dubuffet"]], [/alexandre cabanel/i, ["alexandre-cabanel"]], [/masaccio/i, ["masaccio"]], [/barnett newman/i, ["barnett-newman"]], [/ernst haeckel/i, ["ernst-haeckel"]], [/emily carr/i, ["emily-carr"]], [/barbara hepworth/i, ["barbara-hepworth"]], [/hannah hoch|hannah höch/i, ["hannah-hoch"]], [/clyfford still/i, ["clyfford-still"]], [/alberto giacometti/i, ["alberto-giacometti"]], [/jose clemente orozco|josé clemente orozco/i, ["jose-clemente-orozco"]], [/sonia delaunay/i, ["sonia-delaunay"]], [/juan gris/i, ["juan-gris"]], [/georges braque/i, ["georges-braque"]], [/joseph cornell/i, ["joseph-cornell"]], [/jean arp/i, ["jean-arp"]], [/rosa bonheur/i, ["rosa-bonheur"]], [/milton glaser/i, ["milton-glaser"]], [/charley harper/i, ["charley-harper"]], [/henry ossawa tanner/i, ["henry-ossawa-tanner"]], [/camille claudel/i, ["camille-claudel"]], [/sol lewitt/i, ["sol-lewitt"]], [/paul rand/i, ["paul-rand"]], [/otto dix/i, ["otto-dix"]], [/donald judd/i, ["donald-judd"]], [/frank stella/i, ["frank-stella"]], [/josef albers/i, ["josef-albers"]], [/saul bass/i, ["saul-bass"]], [/mary blair/i, ["mary-blair"]], [/henry moore/i, ["henry-moore"]], [/osamu tezuka/i, ["osamu-tezuka"]], [/maurice sendak/i, ["maurice-sendak"]], [/agnes martin/i, ["agnes-martin"]], [/lee krasner/i, ["lee-krasner"]], [/willem de kooning/i, ["willem-de-kooning"]], [/romare bearden/i, ["romare-bearden"]], [/grant wood/i, ["grant-wood"]], [/charles rennie mackintosh/i, ["charles-rennie-mackintosh"]], [/henry fuseli/i, ["henry-fuseli"]], [/franz von stuck/i, ["franz-von-stuck"]], [/ivan aivazovsky/i, ["ivan-aivazovsky"]], [/kathe kollwitz|käthe kollwitz/i, ["kathe-kollwitz"]], [/paul klee/i, ["paul-klee"]], [/hasui/i, ["kawase-hasui"]], [/ivan shishkin/i, ["ivan-shishkin"]], [/ilya repin/i, ["ilya-repin"]], [/john william waterhouse/i, ["john-william-waterhouse"]], [/john atkinson grimshaw/i, ["john-atkinson-grimshaw"]], [/kazimir malevich/i, ["kazimir-malevich"]], [/maxfield parrish/i, ["maxfield-parrish"]], [/marc chagall/i, ["marc-chagall"]], [/hilma af klint/i, ["hilma-af-klint"]], [/joan miro|joan miró/i, ["joan-miro"]], [/beatrix potter/i, ["beatrix-potter"]], [/lucian freud/i, ["lucian-freud"]], [/robert rauschenberg/i, ["robert-rauschenberg"]], [/joan mitchell/i, ["joan-mitchell"]], [/louise bourgeois/i, ["louise-bourgeois"]], [/cy twombly/i, ["cy-twombly"]], [/alexander calder/i, ["alexander-calder"]], [/remedios varo/i, ["remedios-varo"]], [/max ernst/i, ["max-ernst"]], [/andrew wyeth/i, ["andrew-wyeth"]], [/leonora carrington/i, ["leonora-carrington"]], [/helen frankenthaler/i, ["helen-frankenthaler"]], [/edward gorey/i, ["edward-gorey"]], [/jacob lawrence/i, ["jacob-lawrence"]], [/marcel duchamp/i, ["marcel-duchamp"]], [/artemisia gentileschi/i, ["artemisia-gentileschi"]], [/jack kirby/i, ["jack-kirby"]], [/frank frazetta/i, ["frank-frazetta"]], [/man ray/i, ["man-ray"]], [/m\. c\. escher|mc escher/i, ["mc-escher"]], [/diego rivera/i, ["diego-rivera"]], [/roy lichtenstein/i, ["roy-lichtenstein"]], [/mark rothko/i, ["mark-rothko"]], [/rene magritte|rené magritte/i, ["rene-magritte"]], [/henri matisse/i, ["henri-matisse"]], [/norman rockwell/i, ["norman-rockwell"]], [/georgia o'keeffe|georgia o keeffe/i, ["georgia-okeeffe"]], [/salvador dali|salvador dalí/i, ["salvador-dali"]], [/pablo picasso/i, ["pablo-picasso"]], [/andy warhol/i, ["andy-warhol"]], [/frida kahlo/i, ["frida-kahlo"]], [/edward hopper/i, ["edward-hopper"]], [/jean michel basquiat|jean\-michel basquiat/i, ["jean-michel-basquiat"]], [/jackson pollock/i, ["jackson-pollock"]], [/keith haring/i, ["keith-haring"]], [/bouguereau/i, ["william-bouguereau"]], [/schiele/i, ["egon-schiele"]], [/james ensor/i, ["james-ensor"]], [/leyendecker/i, ["jc-leyendecker"]], [/holman hunt/i, ["william-holman-hunt"]], [/greuze/i, ["jean-baptiste-greuze"]], [/jan steen/i, ["jan-steen"]], [/boudin/i, ["eugene-boudin"]], [/tiepolo/i, ["tiepolo"]], [/landseer/i, ["edwin-landseer"]], [/fantin-latour/i, ["henri-fantin-latour"]], [/veronese/i, ["paolo-veronese"]], [/claude lorrain|claude gell[eé]e/i, ["claude-lorrain"]], [/poussin/i, ["nicolas-poussin"]], [/millais/i, ["john-everett-millais"]], [/van dyck|van dijck/i, ["anthony-van-dyck"]], [/frans hals/i, ["frans-hals"]], [/giovanni bellini/i, ["giovanni-bellini"]], [/tintoretto/i, ["tintoretto"]], [/fra angelico/i, ["fra-angelico"]], [/giotto/i, ["giotto-di-bondone"]], [/yoshitoshi/i, ["tsukioka-yoshitoshi"]], [/chardin/i, ["jean-simeon-chardin"]], [/ch[eé]ret/i, ["jules-cheret"]], [/vuillard/i, ["edouard-vuillard"]], [/frederic,? lord leighton|frederic leighton/i, ["frederic-leighton"]], [/leonardo da vinci/i, ["leonardo-da-vinci"]], [/eakins/i, ["thomas-eakins"]], [/utamaro/i, ["utamaro"]], [/watteau/i, ["antoine-watteau"]], [/tissot/i, ["james-tissot"]], [/g[eé]r[oô]me/i, ["jean-leon-gerome"]], [/bonnard/i, ["pierre-bonnard"]], [/signac/i, ["paul-signac"]], [/alma-tadema/i, ["lawrence-alma-tadema"]], [/burne-jones/i, ["edward-burne-jones"]], [/piranesi/i, ["piranesi"]], [/\bingres\b/i, ["jean-auguste-dominique-ingres"]], [/gustave moreau/i, ["gustave-moreau"]], [/fragonard/i, ["jean-honore-fragonard"]], [/fran[cç]ois boucher/i, ["francois-boucher"]], [/cranach/i, ["lucas-cranach"]], [/gainsborough/i, ["thomas-gainsborough"]], [/corot/i, ["camille-corot"]], [/jean-fran[cç]ois millet/i, ["jean-francois-millet"]], [/remington/i, ["frederic-remington"]], [/vel[aá]zquez/i, ["diego-velazquez"]], [/holbein/i, ["hans-holbein"]], [/canaletto/i, ["canaletto"]], [/odilon redon/i, ["odilon-redon"]], [/[eé]douard manet/i, ["edouard-manet"]], [/inness/i, ["george-inness"]], [/hassam/i, ["childe-hassam"]], [/thomas moran/i, ["thomas-moran"]], [/bierstadt/i, ["albert-bierstadt"]], [/sisley/i, ["alfred-sisley"]], [/raphael|raffaello/i, ["raphael"]], [/dante gabriel rossetti/i, ["dante-gabriel-rossetti"]], [/modigliani/i, ["amedeo-modigliani"]], [/klimt/i, ["gustav-klimt"]], [/mondria/i, ["piet-mondrian"]], [/franz marc/i, ["franz-marc"]], [/kandinsk/i, ["wassily-kandinsky"]], [/rackham/i, ["arthur-rackham"]], [/caillebotte/i, ["gustave-caillebotte"]], [/walter crane/i, ["walter-crane"]], [/kuniyoshi/i, ["utagawa-kuniyoshi"]], [/caspar david friedrich/i, ["caspar-david-friedrich"]], [/constable/i, ["john-constable"]], [/jacques-louis david/i, ["jacques-louis-david"]],
    [/delacroix/i, ["eugene-delacroix"]], [/thomas cole/i, ["thomas-cole"]], [/frederic edwin church/i, ["frederic-edwin-church"]], [/daumier/i, ["honore-daumier"]],
    [/hogarth/i, ["william-hogarth"]],
    [/degas/i, ["edgar-degas"]], [/morisot/i, ["berthe-morisot"]], [/winslow homer/i, ["winslow-homer"]], [/turner/i, ["jmw-turner"]],
    [/gauguin/i, ["paul-gauguin"]], [/c[eé]zanne/i, ["paul-cezanne"]], [/vermeer/i, ["johannes-vermeer"]], [/botticelli/i, ["sandro-botticelli"]],
    [/gustave dor[eé]/i, ["gustave-dore"]], [/pissarro/i, ["camille-pissarro"]], [/michelangelo|buonarroti/i, ["michelangelo"]], [/titian|tiziano/i, ["titian"]],
    [/bosch/i, ["hieronymus-bosch"]], [/bruegel|brueghel/i, ["pieter-bruegel"]], [/henri rousseau/i, ["henri-rousseau"]], [/courbet/i, ["gustave-courbet"]],
    [/whistler/i, ["james-mcneill-whistler"]], [/renoir/i, ["pierre-auguste-renoir"]], [/van eyck/i, ["jan-van-eyck"]], [/rubens/i, ["peter-paul-rubens"]],
    [/van gogh/i, ["vincent-van-gogh"]], [/monet/i, ["claude-monet"]], [/rembrandt/i, ["rembrandt"]], [/caravaggio/i, ["caravaggio"]],
    [/munch/i, ["edvard-munch"]], [/cassatt/i, ["mary-cassatt"]], [/seurat/i, ["georges-seurat"]], [/sargent/i, ["john-singer-sargent"]],
    [/el greco|theotokopoulos/i, ["el-greco"]], [/goya/i, ["francisco-goya"]],
    [/hokusai/i, ["great-wave-off-kanagawa", "hokusai"]], [/hiroshige/i, ["hiroshige"]], [/mucha/i, ["alphonse-mucha"]], [/toulouse-lautrec/i, ["toulouse-lautrec-posters"]],
    [/d[uü]rer/i, ["albrecht-durer"]], [/beardsley/i, ["aubrey-beardsley"]], [/william morris/i, ["william-morris-patterns"]], [/walter crane|ashbee|voysey/i, ["arts-and-crafts-movement"]], [/blake/i, ["william-blake"]],
    [/rossetti|burne-jones|millais|holman hunt/i, ["pre-raphaelite"]], [/audubon|havell/i, ["audubon-birds"]], [/rembrandt|piranesi|goya|callot|whistler/i, ["etching"]], [/daumier|senefelder/i, ["lithography"]],
    [/tiffany|la farge/i, ["stained-glass"]], [/bewick/i, ["woodblock-printing"]], [/redout[eé]|merian|ehret|curtis/i, ["botanical-illustration"]], [/sullivan|horta|guimard|mackintosh/i, ["art-nouveau-architecture"]], [/monet|renoir|pissarro|morisot|cassatt|degas|sisley/i, ["impressionism"]],
    [/van gogh|gauguin|c[eé]zanne/i, ["post-impressionism"]], [/seurat|signac|\bcross\b/i, ["pointillism", "post-impressionism"]], [/turner|constable|friedrich|delacroix|g[eé]ricault/i, ["romanticism-art"]],
    [/jacques-louis david|canova|flaxman|wedgwood/i, ["neoclassical-art"]], [/courbet|\bmillet\b|winslow homer|eakins|bonheur/i, ["realism-art"]], [/thomas cole|frederic edwin church|lorrain|ruisdael/i, ["landscape-painting"]], [/pillement/i, ["chinoiserie"]], [/kirchner|munch|franz marc|kandinsky|schmidt-rottluff|nolde/i, ["expressionism-art"]],
    [/redon|moreau|puvis|khnopff|b[oö]cklin/i, ["symbolism-art"]], [/harnett|peto|gijsbrechts/i, ["trompe-loeil"]], [/hicks|ammi phillips/i, ["folk-art"]],
    [/oberkampf|huet/i, ["toile-de-jouy"]], [/salviati|barovier/i, ["venetian-glass"]], [/cassatt|whistler|bracquemond/i, ["japonisme"]], [/lalique|vever|fouquet/i, ["art-nouveau-jewelry"]], [/edouart/i, ["silhouette-art"]],
    [/vermeer|de hooch|hals|steen|de witte/i, ["dutch-golden-age-painting"]], [/pugin|dresser/i, ["victorian-art"]], [/ch[eé]ret|grasset|steinlen|bonnard|privat-livemont|penfield/i, ["vintage-posters"]]],
  names: { "ukiyo-e": "Ukiyo-e", "hokusai": "Hokusai", "hiroshige": "Hiroshige", "great-wave-off-kanagawa": "The Great Wave", "alphonse-mucha": "Alphonse Mucha",
    "art-deco-vs-art-nouveau": "Art Deco vs Art Nouveau", "toulouse-lautrec-posters": "Toulouse-Lautrec posters", "arts-and-crafts-movement": "The Arts and Crafts movement",
    "william-morris-patterns": "William Morris patterns", "illuminated-manuscripts": "Illuminated manuscripts", "gothic-art": "Gothic art", "medieval-fonts": "Medieval fonts",
    "albrecht-durer": "Albrecht Dürer", "japanese-calligraphy": "Japanese calligraphy", "chinese-calligraphy": "Chinese calligraphy",
    "islamic-geometric-patterns": "Islamic geometric patterns", "aubrey-beardsley": "Aubrey Beardsley", "old-maps": "Old maps", "fashion-plates": "Fashion plates", "vintage-posters": "Vintage posters", "islamic-art": "Islamic art",
    "japanese-art": "Japanese art", "renaissance-art": "Renaissance art", "rococo": "Rococo", "audubon-birds": "Audubon’s birds", "william-blake": "William Blake",
    "pre-raphaelite": "The Pre-Raphaelites", "medieval-art": "Medieval art", "baroque-art": "Baroque art",
    "etching": "Etching", "lithography": "Lithography", "stained-glass": "Stained glass", "mosaic-art": "Mosaic art", "woodblock-printing": "Woodblock printing",
    "unicorn-tapestries": "The Unicorn Tapestries", "hieroglyphics": "Hieroglyphics", "egyptian-art": "Egyptian art", "celtic-knot": "Celtic knot", "heraldry": "Heraldry", "roman-art": "Roman art", "ancient-greek-art": "Ancient Greek art",
    "aztec-art": "Aztec art", "mayan-art": "Maya art", "byzantine-art": "Byzantine art", "chinese-art": "Chinese art", "african-art": "African art",
    "art-nouveau-architecture": "Art Nouveau architecture", "japanese-patterns": "Japanese patterns", "botanical-illustration": "Botanical illustration",
    "impressionism": "Impressionism", "post-impressionism": "Post-Impressionism", "pointillism": "Pointillism", "still-life-painting": "Still life painting",
    "chinoiserie": "Chinoiserie", "paisley-pattern": "Paisley pattern", "romanticism-art": "Romanticism", "neoclassical-art": "Neoclassical art",
    "landscape-painting": "Landscape painting", "realism-art": "Realism", "trompe-loeil": "Trompe l’oeil", "folk-art": "Folk art",
    "medieval-bestiary": "The medieval bestiary", "majolica": "Majolica", "expressionism-art": "Expressionism", "symbolism-art": "Symbolism", "indian-art": "Indian art",
    "japonisme": "Japonisme", "toile-de-jouy": "Toile de Jouy", "venetian-glass": "Venetian glass",
    "cameo-jewelry": "Cameo jewellery", "art-nouveau-jewelry": "Art Nouveau jewellery", "silhouette-art": "Silhouette art", "victorian-art": "Victorian art",
    "persian-art": "Persian art", "viking-art": "Viking art", "delftware": "Delftware", "damask-pattern": "Damask pattern",
    "japanese-family-crests": "Japanese family crests", "dutch-golden-age-painting": "Dutch Golden Age painting",
    "vincent-van-gogh": "Vincent van Gogh", "claude-monet": "Claude Monet", "rembrandt": "Rembrandt", "caravaggio": "Caravaggio", "edvard-munch": "Edvard Munch",
    "mary-cassatt": "Mary Cassatt", "georges-seurat": "Georges Seurat", "john-singer-sargent": "John Singer Sargent", "el-greco": "El Greco", "francisco-goya": "Francisco Goya",
    "edgar-degas": "Edgar Degas", "berthe-morisot": "Berthe Morisot", "winslow-homer": "Winslow Homer", "jmw-turner": "J.M.W. Turner", "paul-gauguin": "Paul Gauguin",
    "paul-cezanne": "Paul Cézanne", "johannes-vermeer": "Johannes Vermeer", "sandro-botticelli": "Sandro Botticelli", "gustave-dore": "Gustave Doré",
    "camille-pissarro": "Camille Pissarro", "michelangelo": "Michelangelo", "titian": "Titian", "hieronymus-bosch": "Hieronymus Bosch", "pieter-bruegel": "Pieter Bruegel",
    "henri-rousseau": "Henri Rousseau", "gustave-courbet": "Gustave Courbet", "james-mcneill-whistler": "James McNeill Whistler", "pierre-auguste-renoir": "Pierre-Auguste Renoir",
    "jan-van-eyck": "Jan van Eyck", "peter-paul-rubens": "Peter Paul Rubens",
    "caspar-david-friedrich": "Caspar David Friedrich", "john-constable": "John Constable", "jacques-louis-david": "Jacques-Louis David", "eugene-delacroix": "Eugène Delacroix",
    "thomas-cole": "Thomas Cole", "frederic-edwin-church": "Frederic Edwin Church", "honore-daumier": "Honoré Daumier", "william-hogarth": "William Hogarth",
    "utagawa-kuniyoshi": "Utagawa Kuniyoshi", "walter-crane": "Walter Crane", "jean-baptiste-pater": "Jean-Baptiste Pater", "abul-hasan": "Abu'l Hasan", "ren-xiong": "Ren Xiong", "henri-gabriel-ibels": "Henri-Gabriel Ibels", "ker-xavier-roussel": "Ker-Xavier Roussel", "charles-francois-daubigny": "Charles-François Daubigny", "louis-leopold-boilly": "Louis-Léopold Boilly", "john-lavery": "John Lavery", "george-romney": "George Romney", "henry-raeburn": "Henry Raeburn", "jean-baptiste-carpeaux": "Jean-Baptiste Carpeaux", "wilhelmina-geddes": "Wilhelmina Geddes", "lotte-reiniger": "Lotte Reiniger", "emile-cohl": "Émile Cohl", "ephraim-moses-lilien": "Ephraim Moses Lilien", "mahmoud-said": "Mahmoud Saïd", "maud-lewis": "Maud Lewis", "arthur-lismer": "Arthur Lismer", "frederick-varley": "Frederick Varley", "may-gibbs": "May Gibbs", "norman-lindsay": "Norman Lindsay", "grace-cossington-smith": "Grace Cossington Smith", "charles-conder": "Charles Conder", "nampeyo": "Nampeyo", "frans-masereel": "Frans Masereel", "lynd-ward": "Lynd Ward", "bertha-lum": "Bertha Lum", "martin-lewis": "Martin Lewis", "charles-meryon": "Charles Meryon", "marcantonio-raimondi": "Marcantonio Raimondi", "giulio-clovio": "Giulio Clovio", "simon-bening": "Simon Bening", "jean-pucelle": "Jean Pucelle", "aqa-mirak": "Aqa Mirak", "giovanni-battista-palatino": "Giovanni Battista Palatino", "torii-kiyonobu": "Torii Kiyonobu", "ishikawa-toyonobu": "Ishikawa Toyonobu", "jin-nong": "Jin Nong", "yashima-gakutei": "Yashima Gakutei", "felix-buhot": "Félix Buhot", "arthur-heygate-mackmurdo": "Arthur Heygate Mackmurdo", "lewis-foreman-day": "Lewis Foreman Day", "jean-berain": "Jean Bérain", "daniel-marot": "Daniel Marot", "kitao-shigemasa": "Kitao Shigemasa", "auguste-lepere": "Auguste Lepère", "charles-robert-ashbee": "Charles Robert Ashbee", "hugh-thomson": "Hugh Thomson", "rodolphe-bresdin": "Rodolphe Bresdin", "myles-birket-foster": "Myles Birket Foster", "bichitr": "Bichitr", "wu-zhen": "Wu Zhen", "henri-harpignies": "Henri Harpignies", "lorenzo-monaco": "Lorenzo Monaco", "peter-schoeffer": "Peter Schoeffer", "thomas-sheraton": "Thomas Sheraton", "leon-lhermitte": "Léon Lhermitte", "bernardo-strozzi": "Bernardo Strozzi", "erhard-ratdolt": "Erhard Ratdolt", "bertold-loffler": "Bertold Löffler", "george-bickham": "George Bickham", "cosimo-tura": "Cosimo Tura", "xia-gui": "Xia Gui", "kono-bairei": "Kōno Bairei", "henri-meunier": "Henri Meunier", "paul-gavarni": "Paul Gavarni", "yun-shouping": "Yun Shouping", "imao-keinen": "Imao Keinen", "kubo-shunman": "Kubo Shunman", "bruno-paul": "Bruno Paul", "felix-bracquemond": "Félix Bracquemond", "charles-ricketts": "Charles Ricketts", "john-brett": "John Brett", "paul-sandby": "Paul Sandby", "john-frederick-lewis": "John Frederick Lewis", "emery-walker": "Emery Walker", "giovanni-battista-moroni": "Giovanni Battista Moroni", "lucien-pissarro": "Lucien Pissarro", "william-powell-frith": "William Powell Frith", "helen-allingham": "Helen Allingham", "louis-anquetin": "Louis Anquetin", "phil-may": "Phil May", "carl-otto-czeschka": "Carl Otto Czeschka", "louis-majorelle": "Louis Majorelle", "john-flaxman": "John Flaxman", "ary-scheffer": "Ary Scheffer", "simon-vouet": "Simon Vouet", "giovanni-di-paolo": "Giovanni di Paolo", "washington-allston": "Washington Allston", "paul-ranson": "Paul Ranson", "constantin-guys": "Constantin Guys", "george-du-maurier": "George du Maurier", "dard-hunter": "Dard Hunter", "joseph-urban": "Joseph Urban", "eugene-carriere": "Eugène Carrière", "thomas-couture": "Thomas Couture", "horace-vernet": "Horace Vernet", "david-wilkie": "David Wilkie", "john-leech": "John Leech", "bruce-rogers": "Bruce Rogers", "wang-meng": "Wang Meng", "joseph-pennell": "Joseph Pennell", "theodore-robinson": "Theodore Robinson", "luca-signorelli": "Luca Signorelli", "lilla-cabot-perry": "Lilla Cabot Perry", "thomas-dewing": "Thomas Dewing", "thomas-sully": "Thomas Sully", "may-morris": "May Morris", "robert-adam": "Robert Adam", "ralph-albert-blakelock": "Ralph Albert Blakelock", "govardhan": "Govardhan", "frank-duveneck": "Frank Duveneck", "abbott-thayer": "Abbott Thayer", "richard-doyle": "Richard Doyle", "josiah-wedgwood": "Josiah Wedgwood", "david-roberts": "David Roberts", "sassetta": "Sassetta", "elbert-hubbard": "Elbert Hubbard", "mary-delany": "Mary Delany", "louis-agassiz-fuertes": "Louis Agassiz Fuertes", "john-gould": "John Gould", "basilius-besler": "Basilius Besler", "marianne-north": "Marianne North", "walter-hood-fitch": "Walter Hood Fitch", "georg-dionysius-ehret": "Georg Dionysius Ehret", "thomas-chippendale": "Thomas Chippendale", "jean-pillement": "Jean Pillement", "emile-prisse-davennes": "Émile Prisse d'Avennes", "auguste-racinet": "Auguste Racinet", "maurice-pillard-verneuil": "Maurice Pillard Verneuil", "emile-jacques-ruhlmann": "Émile-Jacques Ruhlmann", "jean-carlu": "Jean Carlu", "charles-loupot": "Charles Loupot", "georges-lepape": "Georges Lepape", "george-barbier": "George Barbier", "albert-robida": "Albert Robida", "benjamin-rabier": "Benjamin Rabier", "paul-berthon": "Paul Berthon", "rube-goldberg": "Rube Goldberg", "johnny-gruelle": "Johnny Gruelle", "ethel-reed": "Ethel Reed", "ea-seguy": "E. A. Séguy", "harrison-fisher": "Harrison Fisher", "rose-oneill": "Rose O'Neill", "franklin-booth": "Franklin Booth", "elizabeth-shippen-green": "Elizabeth Shippen Green", "bill-traylor": "Bill Traylor", "grandma-moses": "Grandma Moses", "edmonia-lewis": "Edmonia Lewis", "aaron-douglas": "Aaron Douglas", "florine-stettheimer": "Florine Stettheimer", "rockwell-kent": "Rockwell Kent", "tina-modotti": "Tina Modotti", "wilson-bentley": "Wilson Bentley", "alvin-langdon-coburn": "Alvin Langdon Coburn", "frances-benjamin-johnston": "Frances Benjamin Johnston", "gertrude-kasebier": "Gertrude Käsebier", "felice-beato": "Felice Beato", "carleton-watkins": "Carleton Watkins", "timothy-osullivan": "Timothy O'Sullivan", "gustave-le-gray": "Gustave Le Gray", "anna-atkins": "Anna Atkins", "louis-daguerre": "Louis Daguerre", "william-henry-fox-talbot": "William Henry Fox Talbot", "william-de-morgan": "William De Morgan", "archibald-knox": "Archibald Knox", "cfa-voysey": "C. F. A. Voysey", "augustus-pugin": "Augustus Pugin", "owen-jones": "Owen Jones", "christopher-dresser": "Christopher Dresser", "annie-french": "Annie French", "rex-whistler": "Rex Whistler", "ida-rentoul-outhwaite": "Ida Rentoul Outhwaite", "mabel-lucie-attwell": "Mabel Lucie Attwell", "cicely-mary-barker": "Cicely Mary Barker", "warwick-goble": "Warwick Goble", "hablot-knight-browne": "Hablot Knight Browne", "phoebe-anna-traquair": "Phoebe Anna Traquair", "margaret-macdonald-mackintosh": "Margaret Macdonald Mackintosh", "frank-brangwyn": "Frank Brangwyn", "sybil-andrews": "Sybil Andrews", "cyril-power": "Cyril Power", "claude-flight": "Claude Flight", "william-orpen": "William Orpen", "laura-knight": "Laura Knight", "eleanor-fortescue-brickdale": "Eleanor Fortescue-Brickdale", "elizabeth-siddal": "Elizabeth Siddal", "marie-spartali-stillman": "Marie Spartali Stillman", "frederick-sandys": "Frederick Sandys", "nicholas-hilliard": "Nicholas Hilliard", "amadeo-de-souza-cardoso": "Amadeo de Souza-Cardoso", "alexandre-de-riquer": "Alexandre de Riquer", "fortunato-depero": "Fortunato Depero", "leopoldo-metlicovitz": "Leopoldo Metlicovitz", "marcello-dudovich": "Marcello Dudovich", "giovanna-garzoni": "Giovanna Garzoni", "elisabetta-sirani": "Elisabetta Sirani", "pietro-da-cortona": "Pietro da Cortona", "piero-di-cosimo": "Piero di Cosimo", "filippino-lippi": "Filippino Lippi", "pinturicchio": "Pinturicchio", "mikalojus-konstantinas-ciurlionis": "Mikalojus Konstantinas Čiurlionis", "niko-pirosmani": "Niko Pirosmani", "maria-prymachenko": "Maria Prymachenko", "heorhiy-narbut": "Heorhiy Narbut", "alexandra-exter": "Alexandra Exter", "andrei-rublev": "Andrei Rublev", "alexandre-benois": "Alexandre Benois", "mikhail-larionov": "Mikhail Larionov", "nicolae-grigorescu": "Nicolae Grigorescu", "toyen": "Toyen", "josef-lada": "Josef Lada", "zofia-stryjenska": "Zofia Stryjeńska", "stanislaw-ignacy-witkiewicz": "Stanisław Ignacy Witkiewicz", "peter-ilsted": "Peter Ilsted", "frida-hansen": "Frida Hansen", "gerhard-munthe": "Gerhard Munthe", "eero-jarnefelt": "Eero Järnefelt", "jean-baptiste-debret": "Jean-Baptiste Debret", "anita-malfatti": "Anita Malfatti", "armando-reveron": "Armando Reverón", "miguel-covarrubias": "Miguel Covarrubias", "leopoldo-mendez": "Leopoldo Méndez", "maria-izquierdo": "María Izquierdo", "fernando-amorsolo": "Fernando Amorsolo", "juan-luna": "Juan Luna", "raden-saleh": "Raden Saleh", "shin-yun-bok": "Shin Yun-bok", "kim-hong-do": "Kim Hong-do", "kamisaka-sekka": "Kamisaka Sekka", "ogata-kenzan": "Ogata Kenzan", "toyohara-kunichika": "Toyohara Kunichika", "paul-jacoulet": "Paul Jacoulet", "charles-w-bartlett": "Charles W. Bartlett", "elizabeth-keith": "Elizabeth Keith", "ito-shinsui": "Itō Shinsui", "yokoyama-taikan": "Yokoyama Taikan", "wang-ximeng": "Wang Ximeng", "feng-zikai": "Feng Zikai", "zheng-banqiao": "Zheng Banqiao", "mi-fu": "Mi Fu", "zhang-zeduan": "Zhang Zeduan", "gu-kaizhi": "Gu Kaizhi", "levni": "Levni", "matrakci-nasuh": "Matrakçı Nasuh", "sultan-muhammad": "Sultan Muhammad", "mir-emad-hasani": "Mir Emad Hasani", "yaqut-al-mustasimi": "Yaqut al-Musta'simi", "joris-hoefnagel": "Joris Hoefnagel", "roger-excoffon": "Roger Excoffon", "herb-lubalin": "Herb Lubalin", "tj-cobden-sanderson": "T. J. Cobden-Sanderson", "stanley-morison": "Stanley Morison", "william-addison-dwiggins": "William Addison Dwiggins", "william-caxton": "William Caxton", "ludovico-degli-arrighi": "Ludovico degli Arrighi", "francesco-griffo": "Francesco Griffo", "firmin-didot": "Firmin Didot", "pierre-simon-fournier": "Pierre-Simon Fournier", "christophe-plantin": "Christophe Plantin", "geofroy-tory": "Geofroy Tory", "robert-granjon": "Robert Granjon", "johannes-gutenberg": "Johannes Gutenberg", "josef-hoffmann": "Josef Hoffmann", "dagobert-peche": "Dagobert Peche", "hans-rudi-erdt": "Hans Rudi Erdt", "julius-klinger": "Julius Klinger", "august-sander": "August Sander", "karl-blossfeldt": "Karl Blossfeldt", "philipp-otto-runge": "Philipp Otto Runge", "roelant-savery": "Roelant Savery", "gerard-van-honthorst": "Gerard van Honthorst", "hendrick-goltzius": "Hendrick Goltzius", "henry-van-de-velde": "Henry van de Velde", "albert-gleizes": "Albert Gleizes", "jean-metzinger": "Jean Metzinger", "albert-marquet": "Albert Marquet", "frederic-bazille": "Frédéric Bazille", "paul-delaroche": "Paul Delaroche", "theodore-rousseau": "Théodore Rousseau", "adelaide-labille-guiard": "Adélaïde Labille-Guiard", "jean-marc-nattier": "Jean-Marc Nattier", "hans-baldung-grien": "Hans Baldung Grien", "crw-nevinson": "C. R. W. Nevinson", "ren-bonian": "Ren Bonian", "ww-denslow": "W. W. Denslow", "mikolas-ales": "Mikoláš Aleš", "leon-wyczolkowski": "Leon Wyczółkowski", "jan-preisler": "Jan Preisler", "cw-eckersberg": "C. W. Eckersberg", "chobunsai-eishi": "Chōbunsai Eishi", "jozef-chelmonski": "Józef Chełmoński", "louis-le-nain": "Louis Le Nain", "basawan": "Basawan", "totoya-hokkei": "Totoya Hokkei", "jozsef-rippl-ronai": "József Rippl-Rónai", "mihaly-munkacsy": "Mihály Munkácsy", "jenny-nystrom": "Jenny Nyström", "mizuno-toshikata": "Mizuno Toshikata", "isoda-koryusai": "Isoda Koryūsai", "manuel-orazi": "Manuel Orazi", "ludwig-richter": "Ludwig Richter", "eliseu-visconti": "Eliseu Visconti", "almeida-junior": "Almeida Júnior", "hermenegildo-bustos": "Hermenegildo Bustos", "tivadar-csontvary-kosztka": "Tivadar Csontváry Kosztka", "aleksander-gierymski": "Aleksander Gierymski", "santiago-rusinol": "Santiago Rusiñol", "chen-hongshou": "Chen Hongshou", "ike-no-taiga": "Ike no Taiga", "okumura-masanobu": "Okumura Masanobu", "emil-orlik": "Emil Orlik", "john-hassall": "John Hassall", "rudolf-von-alt": "Rudolf von Alt", "moritz-von-schwind": "Moritz von Schwind", "giovanni-fattori": "Giovanni Fattori", "kano-tanyu": "Kanō Tan'yū", "soga-shohaku": "Soga Shōhaku", "ogata-gekko": "Ogata Gekkō", "toyohara-chikanobu": "Toyohara Chikanobu", "hans-burgkmair": "Hans Burgkmair", "adolfo-hohenstein": "Adolfo Hohenstein", "palmer-cox": "Palmer Cox", "hans-gude": "Hans Gude", "john-sell-cotman": "John Sell Cotman", "richard-parkes-bonington": "Richard Parkes Bonington", "ustad-mansur": "Ustad Mansur", "huang-gongwang": "Huang Gongwang", "thomas-theodor-heine": "Thomas Theodor Heine", "oswald-cooper": "Oswald Cooper", "julio-ruelas": "Julio Ruelas", "juan-manuel-blanes": "Juan Manuel Blanes", "josef-manes": "Josef Mánes", "harriet-backer": "Harriet Backer", "thomas-girtin": "Thomas Girtin", "frans-post": "Frans Post", "pietro-longhi": "Pietro Longhi", "gaganendranath-tagore": "Gaganendranath Tagore", "ni-zan": "Ni Zan", "honami-koetsu": "Hon'ami Kōetsu", "nagasawa-rosetsu": "Nagasawa Rosetsu", "shibata-zeshin": "Shibata Zeshin", "joseph-maria-olbrich": "Joseph Maria Olbrich", "alfred-roller": "Alfred Roller", "ferdinand-georg-waldmuller": "Ferdinand Georg Waldmüller", "giuseppe-de-nittis": "Giuseppe De Nittis", "alexei-savrasov": "Alexei Savrasov", "carl-holsoe": "Carl Holsøe", "la-ring": "L. A. Ring", "stanhope-forbes": "Stanhope Forbes", "joos-van-cleve": "Joos van Cleve", "jean-etienne-liotard": "Jean-Étienne Liotard", "nicolas-lancret": "Nicolas Lancret", "jacopo-bassano": "Jacopo Bassano", "reza-abbasi": "Reza Abbasi", "nainsukh": "Nainsukh", "qiu-ying": "Qiu Ying", "hashiguchi-goyo": "Hashiguchi Goyō", "watanabe-seitei": "Watanabe Seitei", "katsukawa-shunsho": "Katsukawa Shunshō", "otto-eckmann": "Otto Eckmann", "lucien-levy-dhurmer": "Lucien Lévy-Dhurmer", "georges-de-feure": "Georges de Feure", "henri-riviere": "Henri Rivière", "jean-louis-forain": "Jean-Louis Forain", "morris-fuller-benton": "Morris Fuller Benton", "rudolf-koch": "Rudolf Koch", "frederic-goudy": "Frederic Goudy", "nicolas-jenson": "Nicolas Jenson", "william-caslon": "William Caslon", "christian-krohg": "Christian Krohg", "edward-wadsworth": "Edward Wadsworth", "francois-clouet": "François Clouet", "aert-van-der-neer": "Aert van der Neer", "melchior-dhondecoeter": "Melchior d'Hondecoeter", "carlo-dolci": "Carlo Dolci", "domenichino": "Domenichino", "federico-barocci": "Federico Barocci", "utagawa-toyokuni": "Utagawa Toyokuni", "wenceslaus-hollar": "Wenceslaus Hollar", "louis-rhead": "Louis Rhead", "edward-penfield": "Edward Penfield", "alfred-stevens": "Alfred Stevens", "peder-balke": "Peder Balke", "albert-edelfelt": "Albert Edelfelt", "sebastiano-del-piombo": "Sebastiano del Piombo", "kamal-ud-din-behzad": "Kamāl ud-Dīn Behzād", "wang-hui": "Wang Hui", "ma-yuan": "Ma Yuan", "helen-hyde": "Helen Hyde", "karl-bodmer": "Karl Bodmer", "george-clausen": "George Clausen", "ambrosius-bosschaert": "Ambrosius Bosschaert", "emperor-huizong": "Emperor Huizong", "tang-yin": "Tang Yin", "guo-xi": "Guo Xi", "tomioka-tessai": "Tomioka Tessai", "hishikawa-moronobu": "Hishikawa Moronobu", "thomas-bewick": "Thomas Bewick", "henri-le-sidaner": "Henri Le Sidaner", "giambattista-bodoni": "Giambattista Bodoni", "john-baskerville": "John Baskerville", "pedro-figari": "Pedro Figari", "karl-bryullov": "Karl Bryullov", "albert-moore": "Albert Moore", "luis-melendez": "Luis Meléndez", "juan-sanchez-cotan": "Juan Sánchez Cotán", "willem-claesz-heda": "Willem Claesz. Heda", "jean-baptiste-oudry": "Jean-Baptiste Oudry", "xu-wei": "Xu Wei", "zhao-mengfu": "Zhao Mengfu", "yosa-buson": "Yosa Buson", "takehisa-yumeji": "Takehisa Yumeji", "uemura-shoen": "Uemura Shōen", "privat-livemont": "Privat-Livemont", "wilhelm-busch": "Wilhelm Busch", "henri-martin": "Henri Martin", "maximilien-luce": "Maximilien Luce", "elihu-vedder": "Elihu Vedder", "arturo-michelena": "Arturo Michelena", "konstantin-korovin": "Konstantin Korovin", "petrus-christus": "Petrus Christus", "hyacinthe-rigaud": "Hyacinthe Rigaud", "j-alden-weir": "J. Alden Weir", "claude-garamond": "Claude Garamond", "claude-joseph-vernet": "Claude-Joseph Vernet", "fan-kuan": "Fan Kuan", "jacques-callot": "Jacques Callot", "willy-pogany": "Willy Pogany", "george-cruikshank": "George Cruikshank", "thomas-rowlandson": "Thomas Rowlandson", "jean-delville": "Jean Delville", "jules-bastien-lepage": "Jules Bastien-Lepage", "ernest-meissonier": "Ernest Meissonier", "william-michael-harnett": "William Michael Harnett", "john-henry-twachtman": "John Henry Twachtman", "john-la-farge": "John La Farge", "aldus-manutius": "Aldus Manutius", "saturnino-herran": "Saturnino Herrán", "limbourg-brothers": "Limbourg Brothers", "jean-fouquet": "Jean Fouquet", "pompeo-batoni": "Pompeo Batoni", "giulio-romano": "Giulio Romano", "giuseppe-castiglione": "Giuseppe Castiglione", "emile-galle": "Émile Gallé", "william-glackens": "William Glackens", "charles-le-brun": "Charles Le Brun", "rosalba-carriera": "Rosalba Carriera", "osman-hamdi-bey": "Osman Hamdi Bey", "martin-schongauer": "Martin Schongauer", "arthur-wesley-dow": "Arthur Wesley Dow", "james-gillray": "James Gillray", "leon-bakst": "Léon Bakst", "max-klinger": "Max Klinger", "maurice-prendergast": "Maurice Prendergast", "peter-behrens": "Peter Behrens", "jose-maria-velasco": "José María Velasco", "konstantin-somov": "Konstantin Somov", "william-nicholson": "William Nicholson", "robert-campin": "Robert Campin", "pieter-claesz": "Pieter Claesz", "hubert-robert": "Hubert Robert", "giovanni-paolo-panini": "Giovanni Paolo Panini", "tsuchiya-koitsu": "Tsuchiya Koitsu", "john-marin": "John Marin", "hugo-simberg": "Hugo Simberg", "hector-guimard": "Hector Guimard", "william-heath-robinson": "William Heath Robinson", "theodor-kittelsen": "Theodor Kittelsen", "vasily-vereshchagin": "Vasily Vereshchagin", "philippe-de-champaigne": "Philippe de Champaigne", "leon-spilliaert": "Léon Spilliaert", "joseph-stella": "Joseph Stella", "jan-matejko": "Jan Matejko", "arthur-hughes": "Arthur Hughes", "francisco-oller": "Francisco Oller", "frits-thaulow": "Frits Thaulow", "gerda-wegener": "Gerda Wegener", "charles-m-russell": "Charles M. Russell", "george-catlin": "George Catlin", "edward-s-curtis": "Edward S. Curtis", "jose-guadalupe-posada": "José Guadalupe Posada", "mathew-brady": "Mathew Brady", "currier-and-ives": "Currier and Ives", "albert-pinkham-ryder": "Albert Pinkham Ryder", "lewis-hine": "Lewis Hine", "jj-grandville": "J. J. Grandville", "thomas-nast": "Thomas Nast", "louis-wain": "Louis Wain", "jozef-mehoffer": "Józef Mehoffer", "anton-romako": "Anton Romako", "juan-de-valdes-leal": "Juan de Valdés Leal", "ilya-mashkov": "Ilya Mashkov", "giuseppe-pellizza-da-volpedo": "Giuseppe Pellizza da Volpedo", "olga-boznanska": "Olga Boznańska", "heinrich-vogeler": "Heinrich Vogeler", "giovanni-giacometti": "Giovanni Giacometti", "wilhelm-leibl": "Wilhelm Leibl", "rudolf-schlichter": "Rudolf Schlichter", "adriaen-van-ostade": "Adriaen van Ostade", "gabriel-metsu": "Gabriel Metsu", "albert-anker": "Albert Anker", "anselm-feuerbach": "Anselm Feuerbach", "stanislaw-wyspianski": "Stanisław Wyspiański", "fra-bartolomeo": "Fra Bartolomeo", "paulus-potter": "Paulus Potter", "nicolaes-maes": "Nicolaes Maes", "kuzma-petrov-vodkin": "Kuzma Petrov-Vodkin", "theo-van-rysselberghe": "Théo van Rysselberghe", "julio-romero-de-torres": "Julio Romero de Torres", "alonso-cano": "Alonso Cano", "meindert-hobbema": "Meindert Hobbema", "lucas-van-leyden": "Lucas van Leyden", "jan-gossaert": "Jan Gossaert", "richard-gerstl": "Richard Gerstl", "gustav-klutsis": "Gustav Klutsis", "vasily-surikov": "Vasily Surikov", "kurt-seligmann": "Kurt Seligmann", "albert-uderzo": "Albert Uderzo", "ignacio-zuloaga": "Ignacio Zuloaga", "adriaen-coorte": "Adriaen Coorte", "willem-kalf": "Willem Kalf", "pieter-aertsen": "Pieter Aertsen", "gerard-david": "Gerard David", "cuno-amiet": "Cuno Amiet", "hans-makart": "Hans Makart", "hans-thoma": "Hans Thoma", "otto-mueller": "Otto Mueller", "aleksandr-deyneka": "Aleksandr Deyneka", "boris-kustodiev": "Boris Kustodiev", "frank-e-schoonover": "Frank E. Schoonover", "giovanni-segantini": "Giovanni Segantini", "gentile-da-fabriano": "Gentile da Fabriano", "benozzo-gozzoli": "Benozzo Gozzoli", "frans-snyders": "Frans Snyders", "jacob-jordaens": "Jacob Jordaens", "dieric-bouts": "Dieric Bouts", "jeanne-mammen": "Jeanne Mammen", "marianne-von-werefkin": "Marianne von Werefkin", "wolfgang-paalen": "Wolfgang Paalen", "coles-phillips": "Coles Phillips", "ambrogio-lorenzetti": "Ambrogio Lorenzetti", "vittore-carpaccio": "Vittore Carpaccio", "lorenzo-lotto": "Lorenzo Lotto", "jan-van-goyen": "Jan van Goyen", "hendrick-avercamp": "Hendrick Avercamp", "joachim-patinir": "Joachim Patinir", "christian-schad": "Christian Schad", "karl-schmidt-rottluff": "Karl Schmidt-Rottluff", "max-pechstein": "Max Pechstein", "alexej-von-jawlensky": "Alexej von Jawlensky", "varvara-stepanova": "Varvara Stepanova", "lyubov-popova": "Lyubov Popova", "jacek-malczewski": "Jacek Malczewski", "gustaf-tenggren": "Gustaf Tenggren", "jean-beraud": "Jean Béraud", "armand-guillaumin": "Armand Guillaumin", "paul-serusier": "Paul Sérusier", "guercino": "Guercino", "david-teniers-the-younger": "David Teniers the Younger", "gerrit-dou": "Gerrit Dou", "hugo-van-der-goes": "Hugo van der Goes", "vladimir-tatlin": "Vladimir Tatlin", "william-sidney-mount": "William Sidney Mount", "eastman-johnson": "Eastman Johnson", "john-frederick-kensett": "John Frederick Kensett", "sanford-robinson-gifford": "Sanford Robinson Gifford", "francesco-hayez": "Francesco Hayez", "luca-giordano": "Luca Giordano", "orazio-gentileschi": "Orazio Gentileschi", "carlo-crivelli": "Carlo Crivelli", "jan-van-huysum": "Jan van Huysum", "quentin-matsys": "Quentin Matsys", "carl-spitzweg": "Carl Spitzweg", "ivan-kramskoi": "Ivan Kramskoi", "victor-brauner": "Victor Brauner", "jack-davis": "Jack Davis", "alex-raymond": "Alex Raymond", "harvey-dunn": "Harvey Dunn", "emile-bernard": "Émile Bernard", "maurice-denis": "Maurice Denis", "mariano-fortuny": "Mariano Fortuny", "jusepe-de-ribera": "Jusepe de Ribera", "antonello-da-messina": "Antonello da Messina", "jan-davidsz-de-heem": "Jan Davidsz. de Heem", "ferdinand-hodler": "Ferdinand Hodler", "franz-xaver-winterhalter": "Franz Xaver Winterhalter", "erich-heckel": "Erich Heckel", "mikhail-vrubel": "Mikhail Vrubel", "viktor-vasnetsov": "Viktor Vasnetsov", "dr-seuss": "Dr. Seuss", "ronald-searle": "Ronald Searle", "hal-foster": "Hal Foster", "howard-chandler-christy": "Howard Chandler Christy", "rembrandt-peale": "Rembrandt Peale", "jasper-cropsey": "Jasper Cropsey", "henri-edmond-cross": "Henri-Edmond Cross", "annibale-carracci": "Annibale Carracci", "simone-martini": "Simone Martini", "andrea-del-sarto": "Andrea del Sarto", "jan-brueghel-the-elder": "Jan Brueghel the Elder", "adolph-menzel": "Adolph Menzel", "andre-masson": "André Masson", "wanda-gag": "Wanda Gág", "garth-williams": "Garth Williams", "nicolas-de-stael": "Nicolas de Staël", "salvator-rosa": "Salvator Rosa", "paolo-uccello": "Paolo Uccello", "max-bill": "Max Bill", "sophie-taeuber-arp": "Sophie Taeuber-Arp", "virginia-lee-burton": "Virginia Lee Burton", "george-herriman": "George Herriman", "haddon-sundblom": "Haddon Sundblom", "felix-vallotton": "Félix Vallotton", "jean-tinguely": "Jean Tinguely", "pisanello": "Pisanello", "pontormo": "Pontormo", "clara-peeters": "Clara Peeters", "kay-sage": "Kay Sage", "carl-barks": "Carl Barks", "asher-durand": "Asher Durand", "antonio-canova": "Antonio Canova", "zinaida-serebriakova": "Zinaida Serebriakova", "james-montgomery-flagg": "James Montgomery Flagg", "marie-laurencin": "Marie Laurencin", "dean-cornwell": "Dean Cornwell", "charles-dana-gibson": "Charles Dana Gibson", "winsor-mccay": "Winsor McCay", "benjamin-west": "Benjamin West", "charles-willson-peale": "Charles Willson Peale", "john-trumbull": "John Trumbull", "lavinia-fontana": "Lavinia Fontana", "andrea-del-verrocchio": "Andrea del Verrocchio", "gian-lorenzo-bernini": "Gian Lorenzo Bernini", "wen-zhengming": "Wen Zhengming", "kano-eitoku": "Kanō Eitoku", "lin-fengmian": "Lin Fengmian", "shitao": "Shitao", "dong-qichang": "Dong Qichang", "torii-kiyonaga": "Torii Kiyonaga", "keisai-eisen": "Keisai Eisen", "john-piper": "John Piper", "gerard-sekoto": "Gerard Sekoto", "irma-stern": "Irma Stern", "nandalal-bose": "Nandalal Bose", "harald-sohlberg": "Harald Sohlberg", "bada-shanren": "Bada Shanren", "margaret-preston": "Margaret Preston", "maruyama-okyo": "Maruyama Ōkyo", "pierre-soulages": "Pierre Soulages", "guido-reni": "Guido Reni", "leo-lionni": "Leo Lionni", "will-eisner": "Will Eisner", "meret-oppenheim": "Meret Oppenheim", "herge": "Hergé", "francis-picabia": "Francis Picabia", "gabriele-munter": "Gabriele Münter", "leonor-fini": "Leonor Fini", "tasha-tudor": "Tasha Tudor", "dorothea-tanning": "Dorothea Tanning", "zdzislaw-beksinski": "Zdzisław Beksiński", "al-hirschfeld": "Al Hirschfeld", "sofonisba-anguissola": "Sofonisba Anguissola", "eyvind-earle": "Eyvind Earle", "niki-de-saint-phalle": "Niki de Saint Phalle", "yves-klein": "Yves Klein", "tove-jansson": "Tove Jansson", "bronzino": "Bronzino", "steve-ditko": "Steve Ditko", "richard-scarry": "Richard Scarry", "eric-carle": "Eric Carle", "charles-m-schulz": "Charles M. Schulz", "jc-dahl": "J. C. Dahl", "ay-jackson": "A. Y. Jackson", "jeh-macdonald": "J. E. H. MacDonald", "sh-raza": "S. H. Raza", "otl-aicher": "Otl Aicher", "paul-renner": "Paul Renner", "christen-kobke": "Christen Købke", "lajos-kassak": "Lajos Kassák", "constant-permeke": "Constant Permeke", "charles-goldie": "Charles Goldie", "tsukioka-kogyo": "Tsukioka Kōgyo", "pyke-koch": "Pyke Koch", "rik-wouters": "Rik Wouters", "wu-changshuo": "Wu Changshuo", "utagawa-hiroshige-ii": "Utagawa Hiroshige II", "tawaraya-sotatsu": "Tawaraya Sōtatsu", "michael-ancher": "Michael Ancher", "frederick-mccubbin": "Frederick McCubbin", "russell-drysdale": "Russell Drysdale", "sakai-hoitsu": "Sakai Hōitsu", "tom-eckersley": "Tom Eckersley", "august-strindberg": "August Strindberg", "cornelius-krieghoff": "Cornelius Krieghoff", "frances-hodgkins": "Frances Hodgkins", "colin-mccahon": "Colin McCahon", "bart-van-der-leck": "Bart van der Leck", "carel-willink": "Carel Willink", "edward-johnston": "Edward Johnston", "david-bomberg": "David Bomberg", "nadar": "Nadar", "hasegawa-tohaku": "Hasegawa Tōhaku", "abram-games": "Abram Games", "henri-gaudier-brzeska": "Henri Gaudier-Brzeska", "bruno-liljefors": "Bruno Liljefors", "nikolai-astrup": "Nikolai Astrup", "abanindranath-tagore": "Abanindranath Tagore", "shen-zhou": "Shen Zhou", "patrick-heron": "Patrick Heron", "carlo-carra": "Carlo Carrà", "heinrich-kley": "Heinrich Kley", "anna-ancher": "Anna Ancher", "edward-mcknight-kauffer": "Edward McKnight Kauffer", "hermann-zapf": "Hermann Zapf", "jean-paul-riopelle": "Jean-Paul Riopelle", "sanyu": "Sanyu", "katsushika-oi": "Katsushika Ōi", "gunta-stolzl": "Gunta Stölzl", "marianne-brandt": "Marianne Brandt", "sidney-nolan": "Sidney Nolan", "albert-namatjira": "Albert Namatjira", "ben-enwonwu": "Ben Enwonwu", "dr-atl": "Dr. Atl", "alvin-lustig": "Alvin Lustig", "kenojuak-ashevak": "Kenojuak Ashevak", "candido-portinari": "Cândido Portinari", "rabindranath-tagore": "Rabindranath Tagore", "jamini-roy": "Jamini Roy", "lester-beall": "Lester Beall", "gino-severini": "Gino Severini", "gerrit-rietveld": "Gerrit Rietveld", "paul-kane": "Paul Kane", "ohara-koson": "Ohara Koson", "ben-nicholson": "Ben Nicholson", "eduardo-paolozzi": "Eduardo Paolozzi", "mark-tobey": "Mark Tobey", "dora-carrington": "Dora Carrington", "paul-delvaux": "Paul Delvaux", "frantisek-kupka": "František Kupka", "armin-hofmann": "Armin Hofmann", "jan-tschichold": "Jan Tschichold", "richard-hamilton": "Richard Hamilton", "duncan-grant": "Duncan Grant", "kees-van-dongen": "Kees van Dongen", "maurice-de-vlaminck": "Maurice de Vlaminck", "victor-horta": "Victor Horta", "xul-solar": "Xul Solar", "joaquin-torres-garcia": "Joaquín Torres García", "pan-yuliang": "Pan Yuliang", "elsa-beskow": "Elsa Beskow", "adrian-frutiger": "Adrian Frutiger", "graham-sutherland": "Graham Sutherland", "wyndham-lewis": "Wyndham Lewis", "giacomo-balla": "Giacomo Balla", "josef-muller-brockmann": "Josef Müller-Brockmann", "kenneth-noland": "Kenneth Noland", "morris-louis": "Morris Louis", "adolph-gottlieb": "Adolph Gottlieb", "maurice-utrillo": "Maurice Utrillo", "gustave-baumann": "Gustave Baumann", "jessie-willcox-smith": "Jessie Willcox Smith", "john-bauer": "John Bauer", "eric-gill": "Eric Gill", "arthur-dove": "Arthur Dove", "charles-sheeler": "Charles Sheeler", "georges-rouault": "Georges Rouault", "lucio-fontana": "Lucio Fontana", "francis-bacon": "Francis Bacon", "eugene-atget": "Eugène Atget", "charles-demuth": "Charles Demuth", "raoul-dufy": "Raoul Dufy", "umberto-boccioni": "Umberto Boccioni", "norval-morrisseau": "Norval Morrisseau", "tom-wesselmann": "Tom Wesselmann", "james-rosenquist": "James Rosenquist", "marsden-hartley": "Marsden Hartley", "stuart-davis": "Stuart Davis", "vanessa-bell": "Vanessa Bell", "andre-derain": "André Derain", "suzanne-valadon": "Suzanne Valadon", "chaim-soutine": "Chaïm Soutine", "roberto-matta": "Roberto Matta", "elaine-de-kooning": "Elaine de Kooning", "ben-shahn": "Ben Shahn", "berenice-abbott": "Berenice Abbott", "giorgio-morandi": "Giorgio Morandi", "tarsila-do-amaral": "Tarsila do Amaral", "marcel-breuer": "Marcel Breuer", "walter-gropius": "Walter Gropius", "eva-hesse": "Eva Hesse", "richard-diebenkorn": "Richard Diebenkorn", "robert-motherwell": "Robert Motherwell", "edward-steichen": "Edward Steichen", "david-alfaro-siqueiros": "David Alfaro Siqueiros", "imogen-cunningham": "Imogen Cunningham", "julia-margaret-cameron": "Julia Margaret Cameron", "helene-schjerfbeck": "Helene Schjerfbeck", "rufino-tamayo": "Rufino Tamayo", "robert-indiana": "Robert Indiana", "philip-guston": "Philip Guston", "eadweard-muybridge": "Eadweard Muybridge", "walker-evans": "Walker Evans", "alex-colville": "Alex Colville", "alice-neel": "Alice Neel", "robert-capa": "Robert Capa", "edward-weston": "Edward Weston", "alfred-stieglitz": "Alfred Stieglitz", "claes-oldenburg": "Claes Oldenburg", "louise-nevelson": "Louise Nevelson", "isamu-noguchi": "Isamu Noguchi", "wifredo-lam": "Wifredo Lam", "vivian-maier": "Vivian Maier", "henri-cartier-bresson": "Henri Cartier-Bresson", "weegee": "Weegee", "ruth-asawa": "Ruth Asawa", "wayne-thiebaud": "Wayne Thiebaud", "diane-arbus": "Diane Arbus", "fernando-botero": "Fernando Botero", "dorothea-lange": "Dorothea Lange", "ansel-adams": "Ansel Adams", "jan-toorop": "Jan Toorop", "albrecht-altdorfer": "Albrecht Altdorfer", "ito-jakuchu": "Itō Jakuchū", "theophile-steinlen": "Théophile Steinlen", "lucian-bernhard": "Lucian Bernhard", "ludwig-hohlwein": "Ludwig Hohlwein", "eric-ravilious": "Eric Ravilious", "george-frederic-watts": "George Frederic Watts", "tsuguharu-foujita": "Tsuguharu Foujita", "akseli-gallen-kallela": "Akseli Gallen-Kallela", "tom-roberts": "Tom Roberts", "lovis-corinth": "Lovis Corinth", "fitz-henry-lane": "Fitz Henry Lane", "samuel-palmer": "Samuel Palmer", "pieter-de-hooch": "Pieter de Hooch", "kawanabe-kyosai": "Kawanabe Kyōsai", "randolph-caldecott": "Randolph Caldecott", "zhang-daqian": "Zhang Daqian", "arkhip-kuindzhi": "Arkhip Kuindzhi", "vilhelm-hammershoi": "Vilhelm Hammershøi", "lyonel-feininger": "Lyonel Feininger", "herbert-bayer": "Herbert Bayer", "angelica-kauffman": "Angelica Kauffman", "harry-clarke": "Harry Clarke", "anni-albers": "Anni Albers", "amrita-sher-gil": "Amrita Sher-Gil", "ernst-ludwig-kirchner": "Ernst Ludwig Kirchner", "nc-wyeth": "N. C. Wyeth", "moebius": "Moebius", "donatello": "Donatello", "bartolome-esteban-murillo": "Bartolomé Esteban Murillo", "sesshu-toyo": "Sesshū Tōyō", "ps-kroyer": "P. S. Krøyer", "arthur-streeton": "Arthur Streeton", "bernardo-bellotto": "Bernardo Bellotto", "aelbert-cuyp": "Aelbert Cuyp", "toshusai-sharaku": "Tōshūsai Sharaku", "edward-bawden": "Edward Bawden", "francesco-guardi": "Francesco Guardi", "matthias-grunewald": "Matthias Grünewald", "francisco-de-zurbaran": "Francisco de Zurbarán", "gerard-ter-borch": "Gerard ter Borch", "kobayashi-kiyochika": "Kobayashi Kiyochika", "suzuki-harunobu": "Suzuki Harunobu", "ogata-korin": "Ogata Kōrin", "eugene-grasset": "Eugène Grasset", "will-bradley": "Will Bradley", "pierre-joseph-redoute": "Pierre-Joseph Redouté", "fernand-khnopff": "Fernand Khnopff", "thomas-lawrence": "Thomas Lawrence", "ford-madox-brown": "Ford Madox Brown", "evelyn-de-morgan": "Evelyn De Morgan", "jules-breton": "Jules Breton", "domenico-ghirlandaio": "Domenico Ghirlandaio", "august-macke": "August Macke", "max-liebermann": "Max Liebermann", "leonetto-cappiello": "Leonetto Cappiello", "kate-greenaway": "Kate Greenaway", "isaac-levitan": "Isaac Levitan", "ramon-casas": "Ramon Casas", "edward-hicks": "Edward Hicks", "cecilia-beaux": "Cecilia Beaux", "jacob-van-ruisdael": "Jacob van Ruisdael", "hans-memling": "Hans Memling", "koloman-moser": "Koloman Moser", "gwen-john": "Gwen John", "filippo-lippi": "Filippo Lippi", "qi-baishi": "Qi Baishi", "laszlo-moholy-nagy": "László Moholy-Nagy", "georges-de-la-tour": "Georges de La Tour", "am-cassandre": "A. M. Cassandre", "joshua-reynolds": "Joshua Reynolds", "eh-shepard": "E. H. Shepard", "utagawa-kunisada": "Utagawa Kunisada", "stanley-spencer": "Stanley Spencer", "xu-beihong": "Xu Beihong", "oskar-schlemmer": "Oskar Schlemmer", "johannes-itten": "Johannes Itten", "giovanni-boldini": "Giovanni Boldini", "pierre-puvis-de-chavannes": "Pierre Puvis de Chavannes", "elisabeth-vigee-le-brun": "Élisabeth Vigée Le Brun", "paul-nash": "Paul Nash", "john-william-godward": "John William Godward", "carel-fabritius": "Carel Fabritius", "duccio": "Duccio", "parmigianino": "Parmigianino", "correggio": "Correggio", "natalia-goncharova": "Natalia Goncharova", "theo-van-doesburg": "Theo van Doesburg", "john-tenniel": "John Tenniel", "lawren-harris": "Lawren Harris", "rene-lalique": "René Lalique", "martin-johnson-heade": "Martin Johnson Heade", "george-caleb-bingham": "George Caleb Bingham", "george-stubbs": "George Stubbs", "joseph-wright-of-derby": "Joseph Wright of Derby", "rogier-van-der-weyden": "Rogier van der Weyden", "paula-modersohn-becker": "Paula Modersohn-Becker", "carl-larsson": "Carl Larsson", "ivan-bilibin": "Ivan Bilibin", "giorgione": "Giorgione", "andrea-mantegna": "Andrea Mantegna", "william-merritt-chase": "William Merritt Chase", "richard-dadd": "Richard Dadd", "edmund-dulac": "Edmund Dulac", "cimabue": "Cimabue", "alexander-rodchenko": "Alexander Rodchenko", "tom-thomson": "Tom Thomson", "robert-delaunay": "Robert Delaunay", "arnold-bocklin": "Arnold Böcklin", "john-sloan": "John Sloan", "walter-sickert": "Walter Sickert", "theodore-gericault": "Théodore Géricault", "judith-leyster": "Judith Leyster", "edward-lear": "Edward Lear", "ls-lowry": "L. S. Lowry", "emil-nolde": "Emil Nolde", "gilbert-stuart": "Gilbert Stuart", "louis-comfort-tiffany": "Louis Comfort Tiffany", "joaquin-sorolla": "Joaquín Sorolla", "auguste-rodin": "Auguste Rodin", "john-martin": "John Martin", "thomas-hart-benton": "Thomas Hart Benton", "tamara-de-lempicka": "Tamara de Lempicka", "robert-henri": "Robert Henri", "george-bellows": "George Bellows", "john-singleton-copley": "John Singleton Copley", "anders-zorn": "Anders Zorn", "yoshida-hiroshi": "Yoshida Hiroshi", "kay-nielsen": "Kay Nielsen", "howard-pyle": "Howard Pyle", "gil-elvgren": "Gil Elvgren", "kurt-schwitters": "Kurt Schwitters", "perugino": "Perugino", "piero-della-francesca": "Piero della Francesca", "el-lissitzky": "El Lissitzky", "nicholas-roerich": "Nicholas Roerich", "constantin-brancusi": "Constantin Brancusi", "george-grosz": "George Grosz", "fernand-leger": "Fernand Léger", "rachel-ruysch": "Rachel Ruysch", "horace-pippin": "Horace Pippin", "giorgio-de-chirico": "Giorgio de Chirico", "victor-vasarely": "Victor Vasarely", "franz-kline": "Franz Kline", "maria-sibylla-merian": "Maria Sibylla Merian", "erte": "Erté", "ellsworth-kelly": "Ellsworth Kelly", "giuseppe-arcimboldo": "Giuseppe Arcimboldo", "arshile-gorky": "Arshile Gorky", "massimo-vignelli": "Massimo Vignelli", "max-beckmann": "Max Beckmann", "oskar-kokoschka": "Oskar Kokoschka", "raja-ravi-varma": "Raja Ravi Varma", "yves-tanguy": "Yves Tanguy", "jean-dubuffet": "Jean Dubuffet", "alexandre-cabanel": "Alexandre Cabanel", "masaccio": "Masaccio", "barnett-newman": "Barnett Newman", "ernst-haeckel": "Ernst Haeckel", "emily-carr": "Emily Carr", "barbara-hepworth": "Barbara Hepworth", "hannah-hoch": "Hannah Höch", "clyfford-still": "Clyfford Still", "alberto-giacometti": "Alberto Giacometti", "jose-clemente-orozco": "José Clemente Orozco", "sonia-delaunay": "Sonia Delaunay", "juan-gris": "Juan Gris", "georges-braque": "Georges Braque", "joseph-cornell": "Joseph Cornell", "jean-arp": "Jean Arp", "rosa-bonheur": "Rosa Bonheur", "milton-glaser": "Milton Glaser", "charley-harper": "Charley Harper", "henry-ossawa-tanner": "Henry Ossawa Tanner", "camille-claudel": "Camille Claudel", "sol-lewitt": "Sol LeWitt", "paul-rand": "Paul Rand", "otto-dix": "Otto Dix", "donald-judd": "Donald Judd", "frank-stella": "Frank Stella", "josef-albers": "Josef Albers", "saul-bass": "Saul Bass", "mary-blair": "Mary Blair", "henry-moore": "Henry Moore", "osamu-tezuka": "Osamu Tezuka", "maurice-sendak": "Maurice Sendak", "agnes-martin": "Agnes Martin", "lee-krasner": "Lee Krasner", "willem-de-kooning": "Willem de Kooning", "romare-bearden": "Romare Bearden", "grant-wood": "Grant Wood", "charles-rennie-mackintosh": "Charles Rennie Mackintosh", "henry-fuseli": "Henry Fuseli", "franz-von-stuck": "Franz von Stuck", "ivan-aivazovsky": "Ivan Aivazovsky", "kathe-kollwitz": "Käthe Kollwitz", "paul-klee": "Paul Klee", "kawase-hasui": "Kawase Hasui", "ivan-shishkin": "Ivan Shishkin", "ilya-repin": "Ilya Repin", "john-william-waterhouse": "John William Waterhouse", "john-atkinson-grimshaw": "John Atkinson Grimshaw", "kazimir-malevich": "Kazimir Malevich", "maxfield-parrish": "Maxfield Parrish", "marc-chagall": "Marc Chagall", "hilma-af-klint": "Hilma af Klint", "joan-miro": "Joan Miró", "beatrix-potter": "Beatrix Potter", "lucian-freud": "Lucian Freud", "robert-rauschenberg": "Robert Rauschenberg", "joan-mitchell": "Joan Mitchell", "louise-bourgeois": "Louise Bourgeois", "cy-twombly": "Cy Twombly", "alexander-calder": "Alexander Calder", "remedios-varo": "Remedios Varo", "max-ernst": "Max Ernst", "andrew-wyeth": "Andrew Wyeth", "leonora-carrington": "Leonora Carrington", "helen-frankenthaler": "Helen Frankenthaler", "edward-gorey": "Edward Gorey", "jacob-lawrence": "Jacob Lawrence", "marcel-duchamp": "Marcel Duchamp", "artemisia-gentileschi": "Artemisia Gentileschi", "jack-kirby": "Jack Kirby", "frank-frazetta": "Frank Frazetta", "man-ray": "Man Ray", "mc-escher": "M. C. Escher", "diego-rivera": "Diego Rivera", "roy-lichtenstein": "Roy Lichtenstein", "mark-rothko": "Mark Rothko", "rene-magritte": "René Magritte", "henri-matisse": "Henri Matisse", "norman-rockwell": "Norman Rockwell", "georgia-okeeffe": "Georgia O'Keeffe", "salvador-dali": "Salvador Dalí", "pablo-picasso": "Pablo Picasso", "andy-warhol": "Andy Warhol", "frida-kahlo": "Frida Kahlo", "edward-hopper": "Edward Hopper", "jean-michel-basquiat": "Jean-Michel Basquiat", "jackson-pollock": "Jackson Pollock", "keith-haring": "Keith Haring", "william-bouguereau": "William-Adolphe Bouguereau", "egon-schiele": "Egon Schiele", "james-ensor": "James Ensor", "jc-leyendecker": "J. C. Leyendecker", "william-holman-hunt": "William Holman Hunt", "jean-baptiste-greuze": "Jean-Baptiste Greuze", "jan-steen": "Jan Steen", "eugene-boudin": "Eugène Boudin", "tiepolo": "Tiepolo", "edwin-landseer": "Edwin Landseer", "henri-fantin-latour": "Henri Fantin-Latour", "paolo-veronese": "Paolo Veronese", "claude-lorrain": "Claude Lorrain", "nicolas-poussin": "Nicolas Poussin", "john-everett-millais": "John Everett Millais", "anthony-van-dyck": "Anthony van Dyck", "frans-hals": "Frans Hals", "giovanni-bellini": "Giovanni Bellini", "tintoretto": "Tintoretto", "fra-angelico": "Fra Angelico", "giotto-di-bondone": "Giotto", "tsukioka-yoshitoshi": "Tsukioka Yoshitoshi", "jean-simeon-chardin": "Chardin", "jules-cheret": "Jules Chéret", "edouard-vuillard": "Édouard Vuillard", "frederic-leighton": "Frederic Leighton", "leonardo-da-vinci": "Leonardo da Vinci", "thomas-eakins": "Thomas Eakins", "utamaro": "Utamaro", "antoine-watteau": "Antoine Watteau", "james-tissot": "James Tissot", "jean-leon-gerome": "Jean-Léon Gérôme", "pierre-bonnard": "Pierre Bonnard", "paul-signac": "Paul Signac", "lawrence-alma-tadema": "Lawrence Alma-Tadema", "edward-burne-jones": "Edward Burne-Jones", "piranesi": "Piranesi", "jean-auguste-dominique-ingres": "Ingres", "gustave-moreau": "Gustave Moreau", "jean-honore-fragonard": "Jean-Honoré Fragonard", "francois-boucher": "François Boucher", "lucas-cranach": "Lucas Cranach", "thomas-gainsborough": "Thomas Gainsborough", "camille-corot": "Camille Corot", "jean-francois-millet": "Jean-François Millet", "frederic-remington": "Frederic Remington", "diego-velazquez": "Diego Velázquez", "hans-holbein": "Hans Holbein", "canaletto": "Canaletto", "odilon-redon": "Odilon Redon", "edouard-manet": "Édouard Manet", "george-inness": "George Inness", "childe-hassam": "Childe Hassam", "thomas-moran": "Thomas Moran", "albert-bierstadt": "Albert Bierstadt", "alfred-sisley": "Alfred Sisley", "raphael": "Raphael", "dante-gabriel-rossetti": "Dante Gabriel Rossetti", "amedeo-modigliani": "Amedeo Modigliani", "gustav-klimt": "Gustav Klimt", "piet-mondrian": "Piet Mondrian", "franz-marc": "Franz Marc", "wassily-kandinsky": "Wassily Kandinsky", "arthur-rackham": "Arthur Rackham", "gustave-caillebotte": "Gustave Caillebotte" },
};
function museumGuides({ theme, artist }) {
  const out = [];
  for (const [re, slugs] of MUSEUM_GUIDES.artist) if (artist && re.test(artist)) out.push(...slugs);
  if (theme && MUSEUM_GUIDES.theme[theme]) out.push(...MUSEUM_GUIDES.theme[theme]);
  const uniq = [...new Set(out)].slice(0, 3);
  if (!uniq.length) return "";
  return `<p class="guides-line" style="font-size:.9rem;margin:1rem 0 0"><strong>Read the guide:</strong> ` +
    uniq.map((s) => `<a href="https://madegooddesigns.com/${s}/">${escHtml(MUSEUM_GUIDES.names[s] || s)}</a>`).join(" · ") + `</p>`;
}
// Rijksmuseum and SMK release public-domain images under the Public Domain Mark (the other museums use CC0).
function museumPDM(it) { return /^(Rijksmuseum|Statens Museum for Kunst|Nationalmuseum Sweden|Slovak National Gallery|The Norwegian Museum of Cultural History|Albertina|Mauritshuis)$/.test(it.museum || ""); }
function museumThemeLabel(slug) { return MUSEUM_THEMES[slug] || (slug || "").replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase()); }

// Canonical path for a museum item: /museum/<title>-<year>-<id>
function museumItemPath(item, base) {
  const yr = item.year ? `-${item.year}` : "";
  return `${base}/museum/${slugify(item.title || item.artist || "artwork")}${yr}-${item.id}`;
}

async function museumItemPage(rest, env, base) {
  const m = (rest || "").match(/([0-9a-f]{12})$/);
  if (!m) return new Response("not found", { status: 404 });
  const row = await env.DB.prepare(`SELECT * FROM items WHERE id=? AND status='published' AND collection='museum'`).bind(m[1]).first();
  if (!row) return new Response("not found", { status: 404, headers: { "Content-Type": "text/plain" } });
  const it = rowToItem(row, env);
  const site = (env.ALLOWED_ORIGIN || "https://madegooddesigns.com").replace(/\/$/, "");
  const canonical = site + museumItemPath(it, base);
  const imgAbs = site + base + it.image;
  const name = it.title || "Untitled";
  const themeLabel = it.theme ? museumThemeLabel(it.theme) : null;
  const facts = [
    it.artist ? ["Artist / maker", it.artist, `${base}/museum/artist/${slugify(it.artist)}`] : null,
    it.year ? ["Date", String(it.year), null] : null,
    it.type ? ["Type", it.type, `${base}/museum/type/${slugify(it.type)}`] : null,
    it.culture ? ["Culture / place", it.culture, `${base}/museum/culture/${slugify(it.culture)}`] : null,
    it.museum ? ["Collection", it.museum, `${base}/museum/museum/${slugify(it.museum)}`] : null,
    themeLabel ? ["Theme", themeLabel, `${base}/museum/theme/${slugify(it.theme)}`] : null,
    ["Licence", museumPDM(it) ? "Public domain (Public Domain Mark) — free to reuse" : "Public domain (CC0) — free to reuse", null],
  ].filter(Boolean);
  const jsonld = {
    "@context": "https://schema.org", "@type": "VisualArtwork",
    name, url: canonical, image: imgAbs,
    creator: it.artist ? { "@type": "Person", name: it.artist } : undefined,
    artform: it.type || undefined,
    dateCreated: it.year ? String(it.year) : undefined,
    description: it.description || undefined,
    license: museumPDM(it) ? "https://creativecommons.org/publicdomain/mark/1.0/" : "https://creativecommons.org/publicdomain/zero/1.0/",
    sameAs: it.source_link || undefined,
    isPartOf: { "@type": "Collection", name: "MGD Museum Collection", url: `${site}${base}/museum` },
    publisher: { "@type": "Organization", name: "Made Good Designs", url: site },
  };
  const chips = [...(it.themes || []), ...(it.tags || []).slice(0, 6)].filter(Boolean).map((t) => `<span class="chip">${escHtml(t)}</span>`).join("");
  const pal = (it.palette || []).filter((h) => /^#[0-9a-fA-F]{6}$/.test(h)).slice(0, 6)
    .map((h) => `<span class="sw" style="background:${h}" title="${h}"></span>`).join("");
  const body = `<!doctype html><html lang="en"><head>
<meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/>
${GTAG}
<title>${escHtml(name)}${it.artist ? " — " + escHtml(it.artist) : ""}${it.year ? " (" + it.year + ")" : ""} — MGD Museum Collection</title>
<meta name="description" content="${escHtml(it.description || name)}"/>
<link rel="canonical" href="${escHtml(canonical)}"/>
<meta property="og:type" content="article"/><meta property="og:title" content="${escHtml(name)}"/>
<meta property="og:image" content="${escHtml(imgAbs)}"/><meta property="og:url" content="${escHtml(canonical)}"/>
<script type="application/ld+json">${JSON.stringify(jsonld)}</script>
<style>
:root{--bg:#fafafa;--surface:#fff;--border:#e5e5e5;--text:#171717;--muted:#737373;--font:system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font-family:var(--font);-webkit-font-smoothing:antialiased}
a{color:inherit}.wrap{max-width:1000px;margin:0 auto;padding:1.25rem 1rem 4rem}
nav.crumb{font-size:.82rem;color:var(--muted);margin:.25rem 0 1rem}nav.crumb a{text-decoration:none}
.detail{display:grid;grid-template-columns:minmax(0,460px) 1fr;gap:1.75rem}
@media(max-width:720px){.detail{grid-template-columns:1fr}}
.detail img{width:100%;height:auto;border:1px solid var(--border);border-radius:12px;background:var(--surface)}
h1{font-size:1.4rem;margin:.1rem 0 .5rem;letter-spacing:-.01em}
.desc{font-size:.98rem;line-height:1.55;margin:.4rem 0 1rem}
dl.facts{display:grid;grid-template-columns:max-content 1fr;gap:.3rem 1rem;margin:0 0 1.1rem;font-size:.9rem}
dl.facts dt{color:var(--muted)}dl.facts dd{margin:0}
.chips{display:flex;flex-wrap:wrap;gap:.35rem;margin:.2rem 0 1rem}
.chip{font-size:.72rem;color:var(--muted);border:1px solid var(--border);border-radius:999px;padding:.1rem .55rem}
.pal{display:flex;border-radius:6px;overflow:hidden;margin:0 0 1.1rem;max-width:320px}.pal .sw{flex:1;height:1.4rem}
.cta{display:inline-block;font-size:.9rem;font-weight:600;text-decoration:none;border:1px solid var(--text);border-radius:8px;padding:.5rem .9rem;margin-right:.5rem}
footer.rights{margin-top:2.5rem;padding-top:1.25rem;border-top:1px solid var(--border);color:var(--muted);font-size:.78rem;line-height:1.5;max-width:70ch}
</style></head><body><div class="wrap">
${backLink(base, "/museum", "Back to collection")}
<nav class="crumb"><a href="${escHtml(base)}/museum">Museum Collection</a>${themeLabel ? ` › <a href="${escHtml(base)}/museum/theme/${escHtml(slugify(it.theme))}">${escHtml(themeLabel)}</a>` : ""} › ${escHtml(name)}</nav>
<div class="detail">
  <div style="position:relative"><button class="card__save" data-id="${escHtml(it.id)}" title="Save to a board">♥ Save</button><img src="${escHtml(base + it.image)}" alt="${escHtml(name)}${it.artist ? " by " + escHtml(it.artist) : ""}"/></div>
  <div>
    <h1>${escHtml(name)}</h1>
    ${it.description ? `<p class="desc">${escHtml(it.description)}</p>` : ""}
    <dl class="facts">${facts.map(([k, v, href]) => `<dt>${escHtml(k)}</dt><dd>${href ? `<a href="${escHtml(href)}">${escHtml(v)}</a>` : escHtml(v)}</dd>`).join("")}</dl>
    ${pal ? `<div class="pal">${pal}</div>` : ""}
    ${chips ? `<div class="chips">${chips}</div>` : ""}
    ${it.source_link ? `<a class="cta" href="${escHtml(it.source_link)}" rel="noopener" target="_blank">View at ${escHtml(it.museum || "the museum")} ↗</a>` : ""}
    ${museumGuides({ theme: it.theme ? slugify(it.theme) : "", artist: it.artist })}
  </div>
</div>
<footer class="rights">Image: ${escHtml(it.museum || "the holding museum")}, open access — public domain (CC0). Description and design tags by Made Good Designs.</footer>
</div>${saveWidget(base)}</body></html>`;
  return new Response(themeify(body), { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}

async function museumFacets(env, request) {
  const P = "collection='museum' AND status='published' AND owner_id IS NULL";
  const grp = (col) => env.DB.prepare(
    `SELECT ${col} v, COUNT(*) n FROM items WHERE ${P} AND ${col} IS NOT NULL AND ${col}<>'' GROUP BY ${col} ORDER BY n DESC`).all();
  const [mus, art, typ, cul, thm] = await Promise.all([grp("company"), grp("designer"), grp("industry"), grp("country"), grp("category")]);
  const cen = (await env.DB.prepare(
    `SELECT (report_year/100)*100 c, COUNT(*) n FROM items WHERE ${P} AND report_year IS NOT NULL GROUP BY c ORDER BY c`).all()).results || [];
  const map = (rows) => (rows.results || rows || []).map((r) => ({ v: r.v, n: r.n }));
  return json({
    museums: map(mus), artists: map(art).filter((x) => x.n >= 2), types: map(typ), cultures: map(cul),
    themes: map(thm).map((x) => ({ v: x.v, label: museumThemeLabel(x.v), n: x.n })),
    centuries: cen.map((r) => ({ year: r.c, v: (r.c < 0 ? Math.abs(r.c) + " BCE" : r.c + "s"), n: r.n })),
  }, 200, env, request);
}

async function museumSitemap(env, base) {
  const site = (env.ALLOWED_ORIGIN || "https://madegooddesigns.com").replace(/\/$/, "");
  const rows = (await env.DB.prepare(`SELECT id,title,report_year,designer,company,industry,country,category,collection FROM items WHERE status='published' AND collection='museum' ORDER BY created_at DESC`).all()).results || [];
  const facet = (key, kind) => [...new Set(rows.map((r) => (r[key] || "").trim()).filter(Boolean))]
    .map((v) => `${site}${base}/museum/${kind}/${slugify(v)}`);
  const urls = [`${site}${base}/museum`, `${site}${base}/museum/index`]
    .concat(facet("category", "theme"), facet("designer", "artist"), facet("country", "culture"), facet("industry", "type"), facet("company", "museum"))
    .concat(rows.map((r) => site + museumItemPath(rowToItem(r, env), base)));
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`
    + urls.map((u) => `  <url><loc>${escHtml(u)}</loc></url>`).join("\n") + `\n</urlset>\n`;
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}

const MUSEUM_FACET_COL = { artist: "designer", museum: "company", type: "industry", culture: "country", theme: "category" };

async function museumIndexPage(env, base) {
  const site = (env.ALLOWED_ORIGIN || "https://madegooddesigns.com").replace(/\/$/, "");
  const rows = (await env.DB.prepare(`SELECT company,designer,industry,country,category FROM items WHERE status='published' AND collection='museum'`).all()).results || [];
  const tally = (key, min) => {
    const m = new Map();
    for (const r of rows) { const v = (r[key] || "").trim(); if (!v) continue; m.set(v, (m.get(v) || 0) + 1); }
    return [...m.entries()].filter(([, n]) => n >= (min || 1)).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  };
  const section = (title, kind, entries, labelFn) => entries.length ? `<h2>${escHtml(title)}</h2><div class="facet-list">`
    + entries.map(([v, n]) => `<a href="${escHtml(base)}/museum/${kind}/${escHtml(slugify(v))}">${escHtml(labelFn ? labelFn(v) : v)} <span class="n">${n}</span></a>`).join("") + `</div>` : "";
  const canonical = `${site}${base}/museum/index`;
  const jsonld = { "@context": "https://schema.org", "@type": "CollectionPage", name: "MGD Museum Collection — browse by theme, artist, culture and type", url: canonical, isPartOf: { "@type": "Collection", name: "MGD Museum Collection", url: `${site}${base}/museum` } };
  const body = `<!doctype html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/>${GTAG}
<title>Browse the Museum Collection — Made Good Designs</title>
<meta name="description" content="Browse public-domain artworks for designers — posters, prints, lettering, ornament and pattern from The Met, the Art Institute of Chicago, the Cleveland Museum of Art, the National Gallery of Art, the Rijksmuseum, SMK (National Gallery of Denmark), Nationalmuseum Sweden and other European museums — by theme, artist, culture and type."/>
<link rel="canonical" href="${escHtml(canonical)}"/>
<script type="application/ld+json">${JSON.stringify(jsonld)}</script>
${ANNUAL_PAGE_CSS}</head><body><div class="wrap">
${backLink(base, "/museum", "Back to collection")}
<nav class="crumb"><a href="${escHtml(base)}/museum">Museum Collection</a> › Browse</nav>
<h1>Browse the Museum Collection</h1>
<p class="lead">Public-domain artworks chosen for designers. Browse by theme, artist, culture, object type or holding museum.</p>
${section("Themes", "theme", tally("category"), museumThemeLabel)}
${section("Artists", "artist", tally("designer", 2))}
${section("Cultures & places", "culture", tally("country"))}
${section("Object types", "type", tally("industry", 2))}
${section("Museums", "museum", tally("company"))}
<footer class="rights">Images from the open-access programmes of The Metropolitan Museum of Art, the Art Institute of Chicago, the Cleveland Museum of Art, the National Gallery of Art (Washington), the Rijksmuseum, SMK – National Gallery of Denmark, Nationalmuseum Sweden, the Albertina, the Museum für Kunst und Gewerbe Hamburg, the Slovak National Gallery and other European museums — public domain (CC0 / Public Domain Mark).</footer>
</div></body></html>`;
  return html(body);
}

async function museumFacetPage(kind, slug, env, base) {
  const col = MUSEUM_FACET_COL[kind];
  if (!col) return new Response("not found", { status: 404 });
  const site = (env.ALLOWED_ORIGIN || "https://madegooddesigns.com").replace(/\/$/, "");
  const distinct = (await env.DB.prepare(`SELECT DISTINCT ${col} AS v FROM items WHERE status='published' AND collection='museum' AND ${col} IS NOT NULL AND ${col}<>''`).all()).results || [];
  const match = distinct.find((r) => slugify(r.v) === slug);
  if (!match) return new Response("not found", { status: 404, headers: { "Content-Type": "text/plain" } });
  const value = match.v;
  const rows = (await env.DB.prepare(`SELECT * FROM items WHERE status='published' AND collection='museum' AND ${col}=? ORDER BY featured_rank IS NULL, featured_rank, report_year, title LIMIT 400`).bind(value).all()).results || [];
  const items = rows.map((r) => rowToItem(r, env));
  const label = kind === "theme" ? museumThemeLabel(value) : value;
  const heading = kind === "artist" ? `Works by ${label}` : kind === "culture" ? `Artworks from ${label}` : kind === "museum" ? `From the ${label}` : `${label}`;
  const canonical = `${site}${base}/museum/${kind}/${slugify(value)}`;
  const cards = items.map((it) => {
    const href = museumItemPath(it, base);
    const t = escHtml(it.title || "Untitled");
    const meta = [kind !== "artist" ? it.artist : null, it.year, kind !== "museum" ? it.museum : null].filter(Boolean).map((x) => escHtml(String(x))).join(" · ");
    return `<div class="card" style="position:relative"><button class="card__save" data-id="${escHtml(it.id)}" title="Save to a board">♥</button><a href="${escHtml(href)}" style="text-decoration:none;display:block"><img loading="lazy" src="${escHtml(base + it.image)}" alt="${t}"/><div class="b"><div class="co">${t}</div>${meta ? `<div class="m">${meta}</div>` : ""}</div></a></div>`;
  }).join("");
  const jsonld = { "@context": "https://schema.org", "@type": "CollectionPage", name: heading, url: canonical, isPartOf: { "@type": "Collection", name: "MGD Museum Collection", url: `${site}${base}/museum` }, mainEntity: { "@type": "ItemList", numberOfItems: items.length } };
  const body = `<!doctype html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/>${GTAG}
<title>${escHtml(heading)} — Public-Domain Art for Designers — Made Good Designs</title>
<meta name="description" content="${escHtml(heading)}: public-domain artworks for design inspiration, from museum open-access collections."/>
<link rel="canonical" href="${escHtml(canonical)}"/>
<script type="application/ld+json">${JSON.stringify(jsonld)}</script>
${ANNUAL_PAGE_CSS}</head><body><div class="wrap">
${backLink(base, "/museum", "Back to collection")}
<nav class="crumb"><a href="${escHtml(base)}/museum">Museum Collection</a> › <a href="${escHtml(base)}/museum/index">Browse</a> › ${escHtml(label)}</nav>
<h1>${escHtml(heading)}</h1>
<p class="lead">${items.length} ${items.length === 1 ? "artwork" : "artworks"} in the collection.</p>
${museumGuides(kind === "theme" ? { theme: slugify(value) } : kind === "artist" ? { artist: value } : {})}
<div class="grid">${cards}</div>
<footer class="rights">Images from museum open-access programmes — public domain (CC0 / Public Domain Mark).</footer>
</div>${saveWidget(base)}</body></html>`;
  return html(body);
}

// UI screen images: ui/<id>-<version>.webp plus an optional ui/<id>-<version>-dark.webp (see uiFields image_dark).
async function putUiImages(env, id, light, dark) {
  const key = `ui/${id}-${Date.now().toString(36)}.webp`, meta = { httpMetadata: { contentType: "image/webp" } };
  await env.BUCKET.put(key, light instanceof Uint8Array ? light : new Uint8Array(await light.arrayBuffer()), meta);
  if (dark && typeof dark !== "string") await env.BUCKET.put(key.replace(/\.webp$/, "-dark.webp"), new Uint8Array(await dark.arrayBuffer()), meta);
  return key;
}

async function serveImage(key, env) {
  const obj = await env.BUCKET.get(key);
  if (!obj) return new Response("not found", { status: 404 });
  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set("Cache-Control", "public, max-age=31536000, immutable");
  headers.set("etag", obj.httpEtag);
  return new Response(obj.body, { headers });
}

// ---------------------------------------------------------------------------
// Account + boards
// ---------------------------------------------------------------------------

async function meHandler(request, env) {
  const user = await getUser(request, env);
  if (user) { env.DB.prepare("UPDATE users SET last_active_at=? WHERE id=?").bind(Date.now(), user.id).run().catch(() => {}); }
  return json({ user: user ? { id: user.id, email: user.email, name: user.name, picture: user.picture, newsletter_opt_in: !!user.newsletter_opt_in } : null }, 200, env, request);
}

async function setNewsletter(request, env) {
  const user = await getUser(request, env);
  if (!user) return json({ error: "unauthorized" }, 401, env, request);
  const body = await request.json().catch(() => ({}));
  await env.DB.prepare("UPDATE users SET newsletter_opt_in=? WHERE id=?").bind(body.opt_in ? 1 : 0, user.id).run();
  return json({ ok: true, newsletter_opt_in: !!body.opt_in }, 200, env, request);
}

async function listBoards(request, env) {
  const user = await getUser(request, env);
  if (!user) return json({ error: "unauthorized" }, 401, env, request);
  const rows = await env.DB.prepare(BOARD_LIST_SQL + " ORDER BY COALESCE(b.updated_at,b.created_at) DESC LIMIT ?").bind(user.id, MAX_BOARDS_PER_USER).all();
  return json({ boards: (rows.results || []).map(boardOut), groups: BOARD_GROUPS }, 200, env, request);
}

async function createBoard(request, env) {
  const user = await getUser(request, env);
  if (!user) return json({ error: "unauthorized" }, 401, env, request);
  const body = await request.json().catch(() => ({}));
  const name = cleanText(body.name, 80) || "Untitled board";
  const grp = cleanGroup(body.group), description = cleanText(body.description, 300) || null;
  const n = await env.DB.prepare("SELECT COUNT(*) n FROM boards WHERE user_id=?").bind(user.id).first();
  if (n && n.n >= MAX_BOARDS_PER_USER) return json({ error: "limit", message: `You can have up to ${MAX_BOARDS_PER_USER} boards.` }, 400, env, request);
  const id = genId(), now = Date.now();
  await env.DB.prepare("INSERT INTO boards (id,user_id,name,grp,description,created_at,updated_at) VALUES (?,?,?,?,?,?,?)").bind(id, user.id, name, grp, description, now, now).run();
  return json({ ok: true, board: { id, name, group: grp, description, count: 0, cover: null, share_url: null } }, 200, env, request);
}

async function saveToBoard(boardId, request, env) {
  const user = await getUser(request, env);
  if (!user) return json({ error: "unauthorized" }, 401, env, request);
  const board = await env.DB.prepare("SELECT id FROM boards WHERE id=? AND user_id=?").bind(boardId, user.id).first();
  if (!board) return json({ error: "not_found" }, 404, env, request);
  const body = await request.json().catch(() => ({}));
  const itemId = (body.item_id || "").toString();
  // Curated public items, or the user's OWN private items — never another user's private item.
  const item = await env.DB.prepare("SELECT id FROM items WHERE id=? AND status='published' AND (owner_id IS NULL OR owner_id=?)").bind(itemId, user.id).first();
  if (!item) return json({ error: "bad_item" }, 400, env, request);
  try {
    await env.DB.prepare("INSERT INTO saves (id,board_id,item_id,user_id,created_at) VALUES (?,?,?,?,?)").bind(genId(), boardId, itemId, user.id, Date.now()).run();
  } catch (e) { /* UNIQUE(board_id,item_id) — already saved; ignore */ }
  await env.DB.prepare("UPDATE boards SET updated_at=? WHERE id=? AND user_id=?").bind(Date.now(), boardId, user.id).run();
  return json({ ok: true }, 200, env, request);
}

const BROWSER_UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36";
// madegooddesigns.com's WAF 502s Mozilla UAs — use a curl UA for our own host, browser UA elsewhere.
function uaFor(u) { try { return /(^|\.)madegooddesigns\.com$/i.test(new URL(u).hostname) ? "curl/8.4.0" : BROWSER_UA; } catch (e) { return BROWSER_UA; } }

async function addUrlToBoard(boardId, request, env, ctx) {
  const user = await getUser(request, env);
  if (!user) return json({ error: "unauthorized" }, 401, env, request);
  const board = await env.DB.prepare("SELECT id FROM boards WHERE id=? AND user_id=?").bind(boardId, user.id).first();
  if (!board) return json({ error: "not_found" }, 404, env, request);
  const body = await request.json().catch(() => ({}));
  const pageUrl = (body.url || "").toString().trim();
  if (!/^https?:\/\//i.test(pageUrl)) return json({ ok: false, error: "bad_url", message: "Enter a full http(s) link." }, 200, env, request);

  // Client may pre-supply image/title/description (e.g. article pages already have og:image
  // in the DOM) — trust it and skip the page fetch. Otherwise scrape the page.
  let meta = { image: (body.image || "").toString().trim(),
               title: (body.title || "").toString().trim().slice(0, 120),
               description: (body.description || "").toString().trim().slice(0, 300) };
  if (!meta.image) {
    try { meta = await fetchPageMeta(pageUrl); }
    catch (e) { return json({ ok: false, error: "fetch_failed", message: "Couldn't open that page (it may block bots)." }, 200, env, request); }
  }
  if (!meta.image) return json({ ok: false, error: "no_image", message: "Couldn't find an image on that page." }, 200, env, request);
  try { meta.image = new URL(meta.image, pageUrl).href; } catch (e) {}

  let imgBytes, contentType = "image/jpeg";
  try {
    const ir = await fetch(meta.image, { headers: { "User-Agent": uaFor(meta.image), "Referer": pageUrl } });
    if (!ir.ok) throw new Error("image " + ir.status);
    contentType = (ir.headers.get("content-type") || "image/jpeg").split(";")[0];
    imgBytes = new Uint8Array(await ir.arrayBuffer());
  } catch (e) { return json({ ok: false, error: "image_failed", message: "Found an image but couldn't download it." }, 200, env, request); }
  if (!imgBytes.length || imgBytes.length > 8000000 || !contentType.startsWith("image/")) {
    return json({ ok: false, error: "image_bad", message: "That image couldn't be used." }, 200, env, request);
  }

  const id = genId();
  const ext = contentType.includes("png") ? "png" : (contentType.includes("webp") ? "webp" : (contentType.includes("gif") ? "gif" : "jpg"));
  const key = `user/${user.id}/${id}.${ext}`;
  await env.BUCKET.put(key, imgBytes, { httpMetadata: { contentType } });

  // Save immediately with the page's own metadata; AI tagging runs in the background (the vision
  // models can take 45s+ each to time out, which used to block the save — and the bookmarklet popup).
  const tags = [], description = meta.description || "";
  const now = Date.now();
  const host = hostOf(pageUrl);
  const title = meta.title || host;
  await env.DB.prepare(
    `INSERT INTO items (id,title,description,source_url,source_host,image_key,width,height,tags,themes,palette,style,owner_id,status,created_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,'[]',NULL,?,'published',?)`
  ).bind(id, title, description, pageUrl, host, key, meta.width || null, meta.height || null,
         JSON.stringify(tags), "[]", user.id, now).run();
  const enrichLater = (async () => {
    try {
      const en = await enrich(bytesToDataUri(imgBytes, contentType), env);
      await env.DB.prepare("UPDATE items SET tags=?, description=CASE WHEN COALESCE(description,'')='' THEN ? ELSE description END, title=CASE WHEN title=? THEN COALESCE(?, title) ELSE title END WHERE id=?")
        .bind(JSON.stringify(Array.isArray(en.tags) ? en.tags.slice(0, 12) : []), en.description || "", host, en.title || null, id).run();
    } catch (e) { /* keep the page's metadata */ }
  })();
  if (ctx && ctx.waitUntil) ctx.waitUntil(enrichLater);
  try {
    await env.DB.prepare("INSERT INTO saves (id,board_id,item_id,user_id,created_at) VALUES (?,?,?,?,?)").bind(genId(), boardId, id, user.id, now).run();
  } catch (e) {}
  await env.DB.prepare("UPDATE boards SET updated_at=? WHERE id=? AND user_id=?").bind(now, boardId, user.id).run();

  return json({ ok: true, item: rowToItem({ id, title, description, source_host: host, image_key: key,
    width: meta.width, height: meta.height, tags: JSON.stringify(tags), themes: "[]", palette: "[]", style: null, created_at: now }, env) }, 200, env, request);
}

async function fetchPageMeta(pageUrl) {
  const res = await fetch(pageUrl, { headers: { "User-Agent": uaFor(pageUrl), "Accept": "text/html,*/*" } });
  if (!res.ok) throw new Error("page " + res.status);
  const ct = res.headers.get("content-type") || "";
  if (ct.startsWith("image/")) return { image: pageUrl, title: "", description: "" };
  const html = (await res.text()).slice(0, 400000);
  const metaTag = (prop) => {
    let m = html.match(new RegExp('<meta[^>]+(?:property|name)=["\\\']' + prop + '["\\\'][^>]*content=["\\\']([^"\\\']+)', "i"));
    if (!m) m = html.match(new RegExp('<meta[^>]+content=["\\\']([^"\\\']+)["\\\'][^>]*(?:property|name)=["\\\']' + prop + '["\\\']', "i"));
    return m ? m[1] : "";
  };
  let image = metaTag("og:image") || metaTag("og:image:url") || metaTag("twitter:image") || metaTag("twitter:image:src");
  if (!image) { const m = html.match(/<img[^>]+src=["\']([^"\']+\.(?:jpg|jpeg|png|webp)[^"\']*)["\']/i); if (m) image = m[1]; }
  if (image) { try { image = new URL(image, pageUrl).href; } catch (e) {} }
  const rawTitle = metaTag("og:title") || (html.match(/<title[^>]*>([^<]+)<\/title>/i) || [])[1] || "";
  const rawDesc = metaTag("og:description") || metaTag("description") || "";
  return { image, title: decodeEntities(rawTitle).trim().slice(0, 120), description: decodeEntities(rawDesc).trim().slice(0, 300) };
}
function decodeEntities(s) { return String(s || "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#0?39;|&#x27;/gi, "'"); }

async function unsave(boardId, itemId, request, env) {
  const user = await getUser(request, env);
  if (!user) return json({ error: "unauthorized" }, 401, env, request);
  await env.DB.prepare("DELETE FROM saves WHERE board_id=? AND item_id=? AND user_id=?").bind(boardId, itemId, user.id).run();
  return json({ ok: true }, 200, env, request);
}

async function getBoard(boardId, request, env) {
  const user = await getUser(request, env);
  const board = await env.DB.prepare("SELECT * FROM boards WHERE id=?").bind(boardId).first();
  if (!board) return json({ error: "not_found" }, 404, env, request);
  if (!user || user.id !== board.user_id) return json({ error: "unauthorized" }, 401, env, request); // owner only; public view is /b/<share_id>
  const rows = await env.DB.prepare(
    `SELECT i.*, s.note AS pin_note FROM saves s JOIN items i ON i.id=s.item_id WHERE s.board_id=? AND i.status='published' ORDER BY s.created_at DESC`
  ).bind(boardId).all();
  const items = (rows.results || []).map((r) => Object.assign(rowToItem(r, env), { note: r.pin_note || "", own: !!(r.owner_id && r.owner_id === user.id) }));
  return json({ board: boardOut(Object.assign({ count: items.length }, board)), items,
    canvas: parseCanvas(board.canvas), canvas_rev: board.canvas_rev || 0 }, 200, env, request);
}

async function deleteBoard(boardId, request, env) {
  const user = await getUser(request, env);
  if (!user) return json({ error: "unauthorized" }, 401, env, request);
  await env.DB.prepare("DELETE FROM saves WHERE board_id=? AND user_id=?").bind(boardId, user.id).run();
  await env.DB.prepare("DELETE FROM boards WHERE id=? AND user_id=?").bind(boardId, user.id).run();
  return json({ ok: true }, 200, env, request);
}

// ---- Boards v2: groups, descriptions, cover, share links, pin notes ----
const BOARD_GROUPS = ["Work", "Interests", "Personal"];
const MAX_BOARDS_PER_USER = 200;
const BOARD_LIST_SQL = `SELECT b.*,
    (SELECT COUNT(*) FROM saves s WHERE s.board_id=b.id) AS count,
    COALESCE((SELECT i.image_key FROM items i JOIN saves s2 ON s2.item_id=i.id AND s2.board_id=b.id WHERE i.id=b.cover_item_id),
             (SELECT i.image_key FROM saves s JOIN items i ON i.id=s.item_id WHERE s.board_id=b.id ORDER BY s.created_at DESC LIMIT 1)) AS cover
  FROM boards b WHERE b.user_id=?`;
function cleanText(v, max) { return (v == null ? "" : String(v)).replace(/[\x00-\x09\x0b-\x1f\x7f]/g, " ").replace(/[ \t]+/g, " ").trim().slice(0, max); }
function cleanGroup(v) { const g = cleanText(v, 30); if (!g) return null; const k = BOARD_GROUPS.find((x) => x.toLowerCase() === g.toLowerCase()); return k || g; }
function shareUrlFor(id) { return id ? `${MCP_SITE}/b/${id}` : null; }
function boardOut(b) {
  return { id: b.id, name: b.name, group: b.grp || null, description: b.description || null, count: b.count || 0,
    cover: b.cover ? `/img/${b.cover}` : null, cover_item_id: b.cover_item_id || null, share_url: shareUrlFor(b.share_id),
    created_at: b.created_at, updated_at: b.updated_at || b.created_at };
}
function newShareId() {
  const a = "abcdefghijklmnopqrstuvwxyz0123456789", r = crypto.getRandomValues(new Uint8Array(10));
  return Array.from(r, (x) => a[x % 36]).join("");
}
// Shared by the web API and the MCP update_board tool. Returns the updated board row or null.
async function applyBoardUpdate(env, uid, boardId, body) {
  const board = await env.DB.prepare("SELECT * FROM boards WHERE id=? AND user_id=?").bind(boardId, uid).first();
  if (!board) return null;
  const sets = [], binds = [];
  if (body.name !== undefined) { const n = cleanText(body.name, 80); if (n) { sets.push("name=?"); binds.push(n); } }
  if (body.group !== undefined) { sets.push("grp=?"); binds.push(cleanGroup(body.group)); }
  if (body.description !== undefined) { sets.push("description=?"); binds.push(cleanText(body.description, 300) || null); }
  if (body.cover_item_id !== undefined) {
    const cid = cleanText(body.cover_item_id, 64);
    const ok = !cid || await env.DB.prepare("SELECT 1 FROM saves WHERE board_id=? AND item_id=?").bind(boardId, cid).first();
    if (ok) { sets.push("cover_item_id=?"); binds.push(cid || null); }
  }
  if (body.shared !== undefined) {
    if (body.shared && !board.share_id) {
      for (let i = 0; i < 4; i++) {  // UNIQUE index; retry on the (astronomically unlikely) collision
        const sid = newShareId();
        if (!(await env.DB.prepare("SELECT 1 FROM boards WHERE share_id=?").bind(sid).first())) { sets.push("share_id=?"); binds.push(sid); break; }
      }
    } else if (!body.shared && board.share_id) { sets.push("share_id=NULL"); }
  }
  if (sets.length) {
    sets.push("updated_at=?"); binds.push(Date.now());
    await env.DB.prepare(`UPDATE boards SET ${sets.join(",")} WHERE id=? AND user_id=?`).bind(...binds, boardId, uid).run();
  }
  return await env.DB.prepare(BOARD_LIST_SQL + " AND b.id=?").bind(uid, boardId).first();
}
async function updateBoard(boardId, request, env) {
  const user = await getUser(request, env);
  if (!user) return json({ error: "unauthorized" }, 401, env, request);
  const body = await request.json().catch(() => ({}));
  const b = await applyBoardUpdate(env, user.id, boardId, body || {});
  if (!b) return json({ error: "not_found" }, 404, env, request);
  return json({ ok: true, board: boardOut(b) }, 200, env, request);
}
async function setPinNote(boardId, itemId, request, env) {
  const user = await getUser(request, env);
  if (!user) return json({ error: "unauthorized" }, 401, env, request);
  const body = await request.json().catch(() => ({}));
  const note = cleanText(body.note, 500) || null;
  const r = await env.DB.prepare("UPDATE saves SET note=? WHERE board_id=? AND item_id=? AND user_id=?").bind(note, boardId, itemId, user.id).run();
  if (!(r.meta && r.meta.changes > 0)) return json({ error: "not_found" }, 404, env, request);
  await env.DB.prepare("UPDATE boards SET updated_at=? WHERE id=? AND user_id=?").bind(Date.now(), boardId, user.id).run();
  return json({ ok: true, note: note || "" }, 200, env, request);
}

// Public, read-only view of a board the owner chose to share. Unlisted: noindex, and the share id is
// unguessable. Sources are plain text (no outbound links), matching the gallery's attribution model.
async function publicBoardPage(shareId, env, base, url) {
  const board = await env.DB.prepare("SELECT * FROM boards WHERE share_id=?").bind(shareId).first();
  const head = (t) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,follow"><title>${escHtml(t)}</title>`;
  if (!board) return new Response(head("Board not found — Made Good Designs") + `<style>body{font:16px/1.6 system-ui,sans-serif;max-width:640px;margin:4rem auto;padding:0 16px}</style></head><body><h1>This board isn’t shared</h1><p>The owner may have turned off sharing. <a href="${base}/">Browse the design inspiration gallery</a>.</p></body></html>`,
    { status: 404, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
  const rows = (await env.DB.prepare(
    `SELECT i.*, s.note AS pin_note FROM saves s JOIN items i ON i.id=s.item_id WHERE s.board_id=? AND i.status='published' ORDER BY s.created_at DESC LIMIT 300`
  ).bind(board.id).all()).results || [];
  const owner = await env.DB.prepare("SELECT name FROM users WHERE id=?").bind(board.user_id).first();
  const first = owner && owner.name ? String(owner.name).split(" ")[0] : "";
  const cards = rows.map((r) => {
    const it = rowToItem(r, null), own = !!r.owner_id;
    const src = own ? hostOf(r.source_url || "") : (it.source || it.designer || it.source_host || "");
    const ratio = it.width && it.height ? (it.height / it.width * 100).toFixed(2) : "75";
    const sw = it.palette.slice(0, 5).map((c) => `<i style="background:${escHtml(c)}"></i>`).join("");
    const link = own ? "" : ` href="${base}/#i/${encodeURIComponent(it.id)}"`;
    return `<figure class="pin"><a class="img"${link} style="padding-top:${ratio}%"><img loading="lazy" src="${base}${it.image}" alt="${escHtml(it.title)}"></a>` +
      `<figcaption><b>${escHtml(it.title || "Untitled")}</b>${src ? `<span>${escHtml(src)}</span>` : ""}` +
      (r.pin_note ? `<p class="note">${escHtml(r.pin_note)}</p>` : "") + (sw ? `<span class="sw">${sw}</span>` : "") + `</figcaption></figure>`;
  }).join("");
  // Canvas layout (Release 2): positioned as % of the content bounds so it scales to any screen width.
  const els = parseCanvas(board.canvas), byId = Object.fromEntries(rows.map((r) => [r.id, r]));
  const vis = els.filter((e) => e.t !== "pin" || byId[e.item]);
  const wantGrid = url && url.searchParams.get("view") === "grid";
  let canvasHtml = "", fonts = [];
  if (vis.length) {
    const minX = Math.min(...vis.map((e) => e.x)), minY = Math.min(...vis.map((e) => e.y));
    const W = Math.max(...vis.map((e) => e.x + e.w)) - minX, H = Math.max(...vis.map((e) => e.y + e.h)) - minY;
    const pc = (v, d) => (v / d * 100).toFixed(3) + "%";
    canvasHtml = `<div class="cv" style="padding-top:${(H / W * 100).toFixed(3)}%"><div class="cvi">` + vis.slice().sort((a, b) => a.z - b.z).map((e) => {
      const pos = `left:${pc(e.x - minX, W)};top:${pc(e.y - minY, H)};width:${pc(e.w, W)};height:${pc(e.h, H)};z-index:${e.z}`;
      if (e.t === "pin") { const r = byId[e.item], it = rowToItem(r, null); return `<img class="el" style="${pos};object-fit:cover" loading="lazy" src="${base}${it.image}" alt="${escHtml(it.title)}">`; }
      if (e.t === "note") return `<div class="el note" style="${pos};background:${escHtml(e.color)};color:${MGDRoles.contrast(e.color, "#111111") >= MGDRoles.contrast(e.color, "#ffffff") ? "#111" : "#fff"};font-size:${(14 / W * 100).toFixed(3)}cqw">${escHtml(e.text)}</div>`;
      if (e.t === "swatch") return `<div class="el sw2" style="${pos};background:${escHtml(e.color)}"><span style="font-size:${(12 / W * 100).toFixed(3)}cqw">${escHtml(e.color.toUpperCase())}</span></div>`;
      fonts.push(e.font);
      return `<div class="el type" style="${pos};font-family:'${escHtml(e.font)}',system-ui,sans-serif;font-size:${(e.size / W * 100).toFixed(3)}cqw">${escHtml(e.text)}</div>`;
    }).join("") + `</div></div>`;
  }
  const showCanvas = canvasHtml && !wantGrid;
  const fontLink = showCanvas && fonts.length ? `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?${[...new Set(fonts)].slice(0, 8).map((f) => "family=" + encodeURIComponent(f).replace(/%20/g, "+")).join("&")}&display=swap">` : "";
  const toggle = canvasHtml ? `<p class="meta"><a href="${base}/b/${shareId}${showCanvas ? "?view=grid" : ""}">${showCanvas ? "View as a grid" : "View the canvas layout"}</a></p>` : "";
  const title = `${board.name} — mood board on Made Good Designs`;
  const page = head(title) + fontLink + `<meta property="og:title" content="${escHtml(title)}"><meta property="og:description" content="${escHtml(board.description || rows.length + " saved design references")}">` +
    (rows[0] ? `<meta property="og:image" content="${MCP_SITE}/img/${escHtml(rows[0].image_key)}">` : "") +
    `<style>
:root{--bg:#fafafa;--surface:#fff;--text:#171717;--muted:#666;--border:#e5e5e5}
@media (prefers-color-scheme:dark){:root{--bg:#111;--surface:#1b1b1b;--text:#f2f2f2;--muted:#a3a3a3;--border:#2c2c2c}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font:15px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif}
.wrap{max-width:1200px;margin:0 auto;padding:24px 16px 48px}
.top{display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:space-between;margin-bottom:18px}
.top a{color:var(--text)}h1{font-size:clamp(1.6rem,4vw,2.4rem);margin:0 0 6px;line-height:1.15}
.meta{color:var(--muted);margin:0 0 20px;max-width:720px}.cta{display:inline-block;background:var(--text);color:var(--bg)!important;text-decoration:none;border-radius:999px;padding:9px 16px;font-weight:600;font-size:.9rem}
.grid{columns:4 240px;column-gap:14px}.pin{break-inside:avoid;margin:0 0 14px;background:var(--surface);border:1px solid var(--border);border-radius:12px;overflow:hidden}
.img{display:block;position:relative;background:#ddd}.img img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
figcaption{padding:9px 11px 11px}figcaption b{display:block;font-size:.9rem}figcaption span{color:var(--muted);font-size:.78rem}
.note{margin:6px 0 0;font-size:.85rem;border-left:3px solid var(--border);padding-left:8px}.sw{display:flex;gap:3px;margin-top:7px}.sw i{width:16px;height:16px;border-radius:4px;box-shadow:inset 0 0 0 1px rgba(0,0,0,.12)}
footer{margin-top:28px;color:var(--muted);font-size:.85rem}
.cv{position:relative;width:100%;container-type:inline-size;background:var(--surface);border:1px solid var(--border);border-radius:12px;overflow:hidden}
.cvi{position:absolute;inset:2%}.el{position:absolute;border-radius:6px;overflow:hidden}.note{padding:.6em;white-space:pre-wrap;line-height:1.35;box-shadow:0 2px 8px rgba(0,0,0,.12)}
.sw2{display:flex;align-items:flex-end;box-shadow:inset 0 0 0 1px rgba(0,0,0,.12)}.sw2 span{background:rgba(255,255,255,.85);color:#111;margin:4%;padding:0 .35em;border-radius:4px;font-family:ui-monospace,monospace}
.type{line-height:1.1;white-space:pre-wrap;overflow:visible}footer a{color:var(--text)}
</style></head><body><div class="wrap"><div class="top"><a href="https://madegooddesigns.com/">Made Good Designs</a><a class="cta" href="${base}/">Make your own boards — free</a></div>` +
    `<h1>${escHtml(board.name)}</h1><p class="meta">${board.description ? escHtml(board.description) + " · " : ""}${rows.length} saved ${rows.length === 1 ? "reference" : "references"}${first ? " · shared by " + escHtml(first) : ""}${board.grp ? " · " + escHtml(board.grp) : ""}</p>` +
    toggle + (showCanvas ? canvasHtml : (cards ? `<div class="grid">${cards}</div>` : `<p>This board is empty.</p>`)) +
    `<footer>A mood board made with the free <a href="${base}/">Made Good Designs inspiration library</a>. Images remain the property of their creators; sources are shown under each image.</footer></div></body></html>`;
  return new Response(page, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=60", "X-Robots-Tag": "noindex, follow" } });
}

// ---- Board canvas (Release 2): free-form layout of pins, notes, swatches and type samples ----
const CANVAS_TYPES = ["pin", "note", "swatch", "type"];
const CANVAS_MAX_ELEMENTS = 400, CANVAS_MAX_BYTES = 200000;
function parseCanvas(s) { try { const a = JSON.parse(s || "[]"); return Array.isArray(a) ? a : []; } catch (e) { return []; } }
function cnum(v, lo, hi, def) { const n = Number(v); return Number.isFinite(n) ? Math.min(hi, Math.max(lo, Math.round(n))) : def; }
// Whitelist every field; pins must point at items that are on this board. Returns a clean array.
function sanitizeCanvas(arr, boardItemIds) {
  if (!Array.isArray(arr)) return null;
  const out = [], seen = new Set();
  for (const e of arr.slice(0, CANVAS_MAX_ELEMENTS)) {
    if (!e || typeof e !== "object" || !CANVAS_TYPES.includes(e.t)) continue;
    let id = String(e.id || "").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 16);
    if (!id || seen.has(id)) id = genId().slice(0, 12);
    seen.add(id);
    const el = { id, t: e.t, x: cnum(e.x, -20000, 20000, 0), y: cnum(e.y, -20000, 20000, 0),
      w: cnum(e.w, 24, 4000, 220), h: cnum(e.h, 16, 4000, 160), z: cnum(e.z, 0, 100000, 0) };
    if (e.t === "pin") { const it = String(e.item || "").slice(0, 64); if (!boardItemIds.has(it)) continue; el.item = it; }
    if (e.t === "note" || e.t === "type") el.text = cleanText(String(e.text == null ? "" : e.text).replace(/\r/g, ""), 1000);
    if (e.t === "note" || e.t === "swatch") { const c = MGDRoles.normHex(String(e.color || "")); el.color = c || (e.t === "note" ? "#fff6b3" : "#cccccc"); }
    if (e.t === "type") { el.font = cleanText(e.font, 60).replace(/[^A-Za-z0-9 \-]/g, "") || "Inter"; el.size = cnum(e.size, 8, 240, 48); }
    out.push(el);
  }
  return out;
}
async function boardItemIdSet(env, boardId) {
  const rows = (await env.DB.prepare("SELECT item_id FROM saves WHERE board_id=?").bind(boardId).all()).results || [];
  return new Set(rows.map((r) => r.item_id));
}
// Optimistic concurrency: the client sends the rev it loaded; a mismatch returns 409 with the current canvas.
async function writeCanvas(env, uid, boardId, elements, rev) {
  const board = await env.DB.prepare("SELECT id, canvas, canvas_rev FROM boards WHERE id=? AND user_id=?").bind(boardId, uid).first();
  if (!board) return { status: 404 };
  const cur = board.canvas_rev || 0;
  if (rev != null && Number(rev) !== cur) return { status: 409, canvas: parseCanvas(board.canvas), rev: cur };
  const clean = sanitizeCanvas(elements, await boardItemIdSet(env, boardId));
  if (!clean) return { status: 400 };
  const body = JSON.stringify(clean);
  if (body.length > CANVAS_MAX_BYTES) return { status: 413 };
  const r = await env.DB.prepare("UPDATE boards SET canvas=?, canvas_rev=?, updated_at=? WHERE id=? AND user_id=? AND COALESCE(canvas_rev,0)=?")
    .bind(body, cur + 1, Date.now(), boardId, uid, cur).run();
  if (!(r.meta && r.meta.changes > 0)) { const b2 = await env.DB.prepare("SELECT canvas, canvas_rev FROM boards WHERE id=?").bind(boardId).first(); return { status: 409, canvas: parseCanvas(b2.canvas), rev: b2.canvas_rev || 0 }; }
  return { status: 200, canvas: clean, rev: cur + 1 };
}
async function saveCanvas(boardId, request, env) {
  const user = await getUser(request, env);
  if (!user) return json({ error: "unauthorized" }, 401, env, request);
  const body = await request.json().catch(() => null);
  if (!body || !Array.isArray(body.canvas)) return json({ error: "bad_request" }, 400, env, request);
  const r = await writeCanvas(env, user.id, boardId, body.canvas, body.rev);
  if (r.status === 404) return json({ error: "not_found" }, 404, env, request);
  if (r.status === 409) return json({ error: "conflict", canvas: r.canvas, rev: r.rev }, 409, env, request);
  if (r.status === 413) return json({ error: "too_large", message: "This canvas is too big to save — remove some elements." }, 413, env, request);
  if (r.status !== 200) return json({ error: "bad_request" }, 400, env, request);
  return json({ ok: true, canvas: r.canvas, rev: r.rev }, 200, env, request);
}
// Place new elements below everything already on the canvas (used by MCP add_to_board_canvas).
function canvasBottom(els) { return els.reduce((m, e) => Math.max(m, (e.y || 0) + (e.h || 0)), 0); }

// ---- Release 3: board → design system (palette roles + DESIGN.md) ----
// Colours come from the board's canvas swatches (strong signal — the user picked them) and the saved
// pins' palettes (weighted by palette position). The primary is the most "brand-like" colour: frequent,
// clearly chromatic and mid-light; the accent hue follows the next distinct hue on the board.
async function boardDesign(env, uid, boardId) {
  const board = await env.DB.prepare("SELECT * FROM boards WHERE id=? AND user_id=?").bind(boardId, uid).first();
  if (!board) return null;
  const rows = (await env.DB.prepare(`SELECT i.palette FROM saves s JOIN items i ON i.id=s.item_id WHERE s.board_id=? AND i.status='published' LIMIT 300`).bind(boardId).all()).results || [];
  const w = {};
  const addC = (hex, wt) => { const h = MGDRoles.normHex(String(hex || "")); if (h) w[h] = (w[h] || 0) + wt; };
  rows.forEach((r) => safeArr(r.palette).slice(0, 6).forEach((c, i) => addC(c, 6 - i)));
  const els = parseCanvas(board.canvas);
  els.filter((e) => e.t === "swatch").forEach((e) => addC(e.color, 12));
  const { colors, primary, mood, light, dark } = boardRolesFromWeights(w);
  const types = els.filter((e) => e.t === "type").sort((a, b) => b.size - a.size);
  const heading = types[0] ? types[0].font : "Inter";
  const body = types.find((t) => t.font !== heading && t.size <= 24) ? types.find((t) => t.font !== heading && t.size <= 24).font : "Inter";
  const L = light.roles, D = dark.roles;
  const q = `l=${MGDRoles.packRoles(L)}&d=${MGDRoles.packRoles(D)}&hf=${encodeURIComponent(heading)}&bf=${encodeURIComponent(body)}`;
  return {
    board, colors: colors.slice(0, 12).map((c) => ({ hex: c.hex, weight: c.weight })), primary, mood,
    fonts: { heading, body }, light: L, dark: D, notes: light.notes.concat(dark.notes),
    palette_url: `${TOOLS_SITE}/website-color-palette-generator/?${q}`,
    design_md_url: `${TOOLS_SITE}/design-md-generator/?${q}&project=${encodeURIComponent(board.name)}${board.description ? "&desc=" + encodeURIComponent(board.description) : ""}`,
  };
}
async function boardDesignApi(boardId, request, env) {
  const user = await getUser(request, env);
  if (!user) return json({ error: "unauthorized" }, 401, env, request);
  const d = await boardDesign(env, user.id, boardId);
  if (!d) return json({ error: "not_found" }, 404, env, request);
  const { board, ...rest } = d;
  return json(Object.assign({ ok: true, board: { id: board.id, name: board.name } }, rest), 200, env, request);
}

async function exportUsers(request, env) {
  if (!isAdmin(request, env)) return json({ error: "unauthorized" }, 401, env, request);
  const rows = await env.DB.prepare(
    `SELECT u.id,u.email,u.name,u.newsletter_opt_in,u.created_at,u.last_active_at,
       (SELECT COUNT(*) FROM boards b WHERE b.user_id=u.id) AS boards,
       (SELECT COUNT(*) FROM saves s WHERE s.user_id=u.id) AS saves
     FROM users u ORDER BY u.created_at DESC`
  ).all();
  const head = ["email", "name", "newsletter_opt_in", "boards", "saves", "created_at", "last_active_at"];
  const lines = [head.join(",")];
  (rows.results || []).forEach((u) => {
    lines.push([csv(u.email), csv(u.name), u.newsletter_opt_in ? 1 : 0, u.boards || 0, u.saves || 0, csv(isoOrEmpty(u.created_at)), csv(isoOrEmpty(u.last_active_at))].join(","));
  });
  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="mgd-inspiration-users.csv"', ...corsHeaders(env, request) },
  });
}
function csv(v) { if (v == null) return ""; const s = String(v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }
function isoOrEmpty(ms) { if (!ms) return ""; try { return new Date(ms).toISOString(); } catch (_) { return ""; } }

// ---------------------------------------------------------------------------
// MCP server — public, so AI assistants can query the inspiration corpus and
// cite madegooddesigns.com. Streamable-HTTP transport (JSON-RPC 2.0 over POST).
// ---------------------------------------------------------------------------

const MCP_SITE = "https://madegooddesigns.com/inspiration";
const MCP_THEMES = ["retro","vintage","minimal","maximal","editorial","brutalist","y2k","monochrome","playful","luxury","hand-drawn","geometric","grunge","corporate","art-deco","psychedelic","swiss","gradient","typographic","vaporwave","neon","collage","art-nouveau","memphis","pop-art","pastel"];

const MCP_TOOLS = [
  {
    name: "search_design_inspiration",
    description: "Search Made Good Designs' curated typography & brand-design inspiration gallery. Returns real design references (title, description, tags, colour palette, source, image URL) with links back to madegooddesigns.com. Use for typography, branding, logo, editorial, poster and lettering inspiration.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Free-text search, e.g. 'serif wordmark', 'vintage poster', 'monospace terminal'." },
        theme: { type: "string", description: "Optional curated theme filter.", enum: MCP_THEMES },
        limit: { type: "integer", description: "Max results (1-20, default 8).", minimum: 1, maximum: 20 },
      },
      required: ["query"],
    },
    annotations: { title: "Search design inspiration", readOnlyHint: true, destructiveHint: false, openWorldHint: false },
  },
  {
    name: "list_inspiration_themes",
    description: "List the curated design-inspiration themes (categories) available in the Made Good Designs gallery, with how many items each has.",
    inputSchema: { type: "object", properties: {} },
    annotations: { title: "List inspiration themes", readOnlyHint: true, destructiveHint: false, openWorldHint: false },
  },
  {
    name: "browse_inspiration_by_theme",
    description: "Browse Made Good Designs inspiration items within a curated theme (e.g. 'retro', 'editorial', 'brutalist').",
    inputSchema: {
      type: "object",
      properties: {
        theme: { type: "string", description: "A curated theme.", enum: MCP_THEMES },
        limit: { type: "integer", description: "Max results (1-20, default 10).", minimum: 1, maximum: 20 },
      },
      required: ["theme"],
    },
    annotations: { title: "Browse inspiration by theme", readOnlyHint: true, destructiveHint: false, openWorldHint: false },
  },
  {
    name: "search_annual_reports",
    description: "Search Made Good Designs' curated archive of about 7,500 VINTAGE CORPORATE ANNUAL REPORT covers, mostly Canadian, American and German, from the 1850s to the 1990s (most from the 1940s–80s golden age of corporate design: railways, banks, utilities, transit authorities; designers such as Paul Rand and Herbert Bayer). Each result gives the company, year, designer/agency where known, industry, a design description, and a Made Good Designs page URL to cite.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Free-text search over company, designer, title, description and tags, e.g. 'transit authority', 'modernist grid', 'Paul Rand'." },
        year: { type: "integer", description: "Optional exact report/fiscal year filter, e.g. 1972." },
        industry: { type: "string", description: "Optional industry/sector filter, e.g. 'transit', 'oil', 'retail'." },
        limit: { type: "integer", description: "Max results (1-20, default 8).", minimum: 1, maximum: 20 },
      },
      required: ["query"],
    },
    annotations: { title: "Search vintage annual reports", readOnlyHint: true, destructiveHint: false, openWorldHint: false },
  },
  {
    name: "search_museum_art",
    description: "Search Made Good Designs' curated collection of PUBLIC-DOMAIN (CC0) MUSEUM ARTWORKS chosen for designers — posters, Art Nouveau, ukiyo-e, lettering, calligraphy, illuminated initials, ornament, pattern and textiles from The Met, the Art Institute of Chicago, the Cleveland Museum of Art, the National Gallery of Art, the Rijksmuseum, SMK (National Gallery of Denmark), Nationalmuseum Sweden and other European museums. Each result gives title, artist, date, culture, type, holding museum, a design description, palette, the museum's object page and a Made Good Designs page URL to cite. Every work is flagged public domain or CC0 by its museum.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Free-text search over title, artist, description and tags, e.g. 'Mucha poster', 'woodblock wave', 'illuminated initial'." },
        theme: { type: "string", description: "Optional museum theme slug, e.g. 'posters', 'art-nouveau', 'ukiyo-e', 'art-deco', 'vienna-secession', 'lettering', 'calligraphy', 'ornament', 'pattern', 'textiles', 'maps', 'botanical', 'type-specimens'. An unknown theme is ignored (searched as text instead)." },
        culture: { type: "string", description: "Optional culture/place, e.g. 'Japan', 'France'." },
        limit: { type: "integer", description: "Max results (1-20, default 8).", minimum: 1, maximum: 20 },
      },
      required: ["query"],
    },
    annotations: { title: "Search public-domain museum art", readOnlyHint: true, destructiveHint: false, openWorldHint: false },
  },
  {
    name: "get_share_feedback",
    description: "Fetch reviewer feedback for a page shared with Made Good Designs' HTML to Link tool (MGD Share). Returns FEEDBACK.md: every note reviewers pinned to an element, with CSS selector, element text, screen size, browser and open/resolved status. Pass the owner link (https://madegooddesigns.com/tools/html-to-link/#manage=ID.KEY), the FEEDBACK.md link, or id + key. Notes are written by members of the public who viewed the shared page.",
    inputSchema: {
      type: "object",
      properties: {
        link: { type: "string", description: "Owner link (…/tools/html-to-link/#manage=ID.KEY) or FEEDBACK.md link (…/api/sites/ID/feedback.md?k=KEY)." },
        id: { type: "string", description: "Share id (10 characters), if not passing a link." },
        key: { type: "string", description: "Owner key (24 characters), if not passing a link." },
      },
    },
    annotations: { title: "Get shared-page feedback", readOnlyHint: true, destructiveHint: false, openWorldHint: false },
  },
  {
    name: "generate_website_color_palette",
    description: "Generate an accessible website colour palette with Made Good Designs' Website Color Palette Generator: eight colour roles (background, surface, border, text, muted, primary, on-primary, accent) for a light theme and a matching dark theme, built in OKLCH and adjusted until every pairing meets WCAG AA contrast (text 4.5:1, primary 3:1, button label 4.5:1, accent 3:1; 7:1 text in the 'contrast' style). Returns both themes, the measured contrast ratios, CSS variables and a link that opens the palette in the visual tool. Each call without brand_color returns a new palette.",
    inputSchema: {
      type: "object",
      properties: {
        brand_color: { type: "string", description: "Optional brand colour as a hex code, e.g. '#e11d48'. Kept exactly when it has enough contrast; otherwise the smallest lightness change that passes is used and reported." },
        style: { type: "string", description: "Palette style (default 'clean').", enum: ["clean", "warm", "vibrant", "muted", "contrast"] },
        harmony: { type: "string", description: "How the accent relates to the primary (default 'auto').", enum: ["auto", "analogous", "complementary", "split", "triadic", "monochromatic"] },
      },
    },
    annotations: { title: "Generate website colour palette", readOnlyHint: true, destructiveHint: false, openWorldHint: false },
  },
  {
    name: "generate_design_md",
    description: "Generate a DESIGN.md file with Made Good Designs' DESIGN.md Generator, in the open DESIGN.md format (google-labs-code/design.md, version alpha): YAML front matter with colour (light + dark-*), typography, rounded, spacing and component tokens, then the spec's sections in order (Overview with rules for AI agents and voice, Colors with measured WCAG contrast tables, Typography, Layout, Elevation & Depth, Shapes, Components, Do's and Don'ts) plus Motion, Accessibility and all tokens as CSS. It passes `npx @google/design.md lint`, and `npx @google/design.md export --format css-tailwind|dtcg` reads its tokens. Pass colours (e.g. the light/dark roles from generate_website_color_palette), a brand colour, or neither (an accessible palette is generated). Returns the Markdown plus a link to edit it in the visual tool.",
    inputSchema: {
      type: "object",
      properties: {
        project_name: { type: "string", description: "Product or project name, e.g. 'Northwind'." },
        description: { type: "string", description: "One sentence on what the product is, e.g. 'a planning app for small teams'." },
        product_type: { type: "string", description: "Default 'SaaS web app'.", enum: ["Marketing website", "SaaS web app", "E-commerce store", "Blog or publication", "Mobile app", "Documentation site", "Portfolio", "Internal dashboard"] },
        personality: { type: "array", description: "Two or three personality traits.", items: { type: "string", enum: ["Calm", "Confident", "Friendly", "Playful", "Premium", "Technical", "Editorial", "Minimal", "Bold", "Warm", "Trustworthy", "Energetic"] } },
        brand_color: { type: "string", description: "Optional brand hex colour used as the primary when generating the palette." },
        colors: {
          type: "object",
          description: "Optional explicit colours. Each theme is an object of role → hex using the roles background, surface, border, text, muted, primary, on-primary, accent. Roles you leave out are generated to meet WCAG AA around the ones you give.",
          properties: { light: { type: "object", additionalProperties: { type: "string" } }, dark: { type: "object", additionalProperties: { type: "string" } } },
        },
        include_dark: { type: "boolean", description: "Include a dark theme (default true)." },
        style: { type: "string", description: "Style for generated colours (default 'clean').", enum: ["clean", "warm", "vibrant", "muted", "contrast"] },
        heading_font: { type: "string", description: "Default 'Inter'." },
        body_font: { type: "string", description: "Default 'Inter'." },
        mono_font: { type: "string", description: "Default 'JetBrains Mono'." },
        base_size: { type: "integer", description: "Base font size in px (12-24, default 16).", minimum: 12, maximum: 24 },
        scale_ratio: { type: "number", description: "Type-scale ratio (default 1.25).", enum: [1.125, 1.2, 1.25, 1.333, 1.5] },
        spacing_unit: { type: "integer", description: "Spacing unit in px (default 4).", enum: [4, 8] },
        density: { type: "string", description: "Default 'comfortable'.", enum: ["compact", "comfortable", "spacious"] },
        radius: { type: "string", description: "Corner radius in px or 'full' for pill shapes (default '8').", enum: ["0", "4", "8", "12", "16", "full"] },
        border_width: { type: "integer", description: "Default 1.", enum: [1, 2] },
        shadows: { type: "string", description: "Default 'subtle'.", enum: ["none", "subtle", "medium", "strong"] },
        motion: { type: "string", description: "Default 'subtle'.", enum: ["none", "subtle", "expressive"] },
        components: { type: "array", description: "Components to specify (default all).", items: { type: "string", enum: ["buttons", "forms", "cards", "nav", "tables", "dialogs", "feedback", "badges"] } },
        dos: { type: "array", description: "Your own 'do' rules, one per item. Defaults are used when omitted.", items: { type: "string" } },
        donts: { type: "array", description: "Your own 'don't' rules, one per item. Defaults are used when omitted.", items: { type: "string" } },
      },
    },
    annotations: { title: "Generate DESIGN.md", readOnlyHint: true, destructiveHint: false, openWorldHint: false },
  },
];
MCP_TOOLS.push(...MCP_TOOLS_43, ...MCP_TOOLS_44, ...MCP_TOOLS_45, ...UI_MCP_TOOLS); // batch-43 tool cores: unicode fonts, characters, diff, colour combos, UPC, diagrams, logos, passport sizes

// ---- Routing guide (sent on initialize; clients load it into the model's context) — 31-Oct-2026
const MCP_INSTRUCTIONS = "Made Good Designs (madegooddesigns.com): free design references and design-system generators. Which tool to use:\n" +
  "- Building an app screen, web page or landing-page section: search_ui_screens, then get_ui_screen_code for its HTML + DESIGN.md; a multi-step journey (sign-up, checkout, password reset…): get_ui_flow.\n" +
  "- Typography, branding, logo, poster or editorial references: search_design_inspiration (or browse_inspiration_by_theme for a style such as swiss, retro, brutalist).\n" +
  "- Historical art and public-domain imagery (posters, Art Nouveau, ukiyo-e, ornament, lettering, maps, textiles): search_museum_art. Corporate design history: search_annual_reports.\n" +
  "- Setting up a design system: generate_website_color_palette (accessible light + dark roles), then generate_design_md with those colours (spec-conformant DESIGN.md; lint/export with npx @google/design.md).\n" +
  "- Logos: generate_logo_concepts, then generate_color_combinations or generate_website_color_palette.\n" +
  "The other tools are utilities (charts, diagrams, timelines, barcodes, puzzles, text). Searches run in parallel fine. Cite the madegooddesigns.com page links in answers.";

// Every description leads with when to use the tool (selection quality). Applied here so the tool modules stay unchanged.
const MCP_USE_WHEN = {
  search_design_inspiration: "Use when you need real typography, branding, logo, lettering, poster or editorial design references (with colour palettes) to inform a look, a brand or a moodboard.",
  list_inspiration_themes: "Use when you want to see which curated style themes exist, with item counts, before browsing or filtering design inspiration.",
  browse_inspiration_by_theme: "Use when the user names a style (retro, swiss, brutalist, art-deco…) and wants a set of examples rather than a keyword search.",
  search_annual_reports: "Use when the question is about corporate design history, annual-report covers, mid-century corporate identity, or a company's or designer's report design.",
  search_museum_art: "Use when you need historical art or public-domain imagery as a reference or asset: posters, Art Nouveau, ukiyo-e, ornament, lettering, calligraphy, maps, textiles, pattern.",
  get_share_feedback: "Use when the user gives an MGD Share (HTML to Link) owner link and wants the reviewer notes left on their shared page.",
  generate_website_color_palette: "Use when a website or app needs a colour scheme: an accessible light + dark palette (8 roles) from a brand colour or from scratch, ready for CSS or generate_design_md.",
  generate_design_md: "Use when setting up a design system for a project or giving a coding agent design rules to follow.",
  style_text_unicode: "Use when the user wants bold, italic, cursive or other fancy text to paste into a bio, username or post.",
  count_characters: "Use when the user needs an exact character, word or reading-time count, or a check against a platform limit.",
  diff_text: "Use when comparing two versions of a text and you need the exact changes or a patch.",
  generate_color_combinations: "Use when the user wants named 2–3-colour combinations (brand, poster, logo) with contrast, rather than a full website palette.",
  generate_upc_barcode: "Use when the user needs a product barcode (UPC, EAN or ISBN) as an image.",
  text_to_diagram: "Use when turning a process or an outline into a flowchart or mind-map image.",
  generate_logo_concepts: "Use when the user wants logo ideas for a brand name.",
  passport_photo_size: "Use when the user asks for a country's passport or visa photo size.",
  make_word_search: "Use when the user wants a printable word search puzzle.",
  make_crossword: "Use when the user wants a crossword built from their own answers and clues.",
  make_bingo_cards: "Use when the user wants printable bingo cards.",
  generate_usernames: "Use when the user wants username ideas that fit a platform's rules.",
  schedule_gantt_chart: "Use when planning a project timeline with task dependencies or drawing a Gantt chart.",
  get_public_holidays: "Use when the user needs a year's public holidays for the US, UK, Canada or Australia.",
  make_weekly_schedule: "Use when turning class or shift times into a weekly timetable.",
  text_to_timeline: "Use when drawing a timeline from dated events.",
  make_org_chart: "Use when drawing an organisation chart from a list of people and managers.",
  make_venn_diagram: "Use when comparing 2–4 lists to find what they share, or drawing a Venn diagram.",
  make_pie_chart: "Use when the user wants a pie or donut chart from values.",
  generate_data_matrix: "Use when the user needs a Data Matrix code (including GS1) as an image.",
  make_color_swatches: "Use when turning a list of colours into a swatch sheet or palette files.",
  make_graph: "Use when drawing a line, bar, area or scatter chart from CSV data.",
  convert_subtitles: "Use when converting, re-timing or re-wrapping SRT/WebVTT subtitles or transcripts.",
  image_size_calculator: "Use when working out image dimensions for a resize, a print size or a social-media preset.",
  convert_text_case: "Use when changing text case or converting to camelCase, snake_case, slugs and similar.",
  search_ui_screens: "Use when building or designing an app screen, web page or landing-page section and you want an original reference with starter HTML and a DESIGN.md.",
  get_ui_flow: "Use when building a multi-step journey (sign-up, checkout, password reset, onboarding…) and you want every step in one design system.",
  get_ui_screen_code: "Use after search_ui_screens or get_ui_flow, when you want a screen's HTML/CSS and DESIGN.md to start coding from.",
};
for (const t of MCP_TOOLS) if (MCP_USE_WHEN[t.name] && !t.description.startsWith("Use when"))
  t.description = MCP_USE_WHEN[t.name] + " " + t.description.replace(/\s*Use (when|for) [^.]*\.$/, "");

// structuredContent schemas (MCP 2025-06-18) for the generators agents chain from. Text content is unchanged.
const HEXMAP = { type: "object", additionalProperties: { type: "string" } };
const MCP_OUTPUT_SCHEMAS = {
  generate_website_color_palette: { type: "object", properties: {
    style: { type: "string" }, harmony: { type: "string" }, brand_color: { type: ["string", "null"] },
    light: HEXMAP, dark: HEXMAP, notes: { type: "array", items: { type: "string" } },
    contrast: { type: "array", items: { type: "object", properties: { theme: { type: "string" }, pair: { type: "string" }, ratio: { type: "number" }, min: { type: "number" }, pass: { type: "boolean" } } } },
    palette_url: { type: "string" }, design_md_url: { type: "string" } }, required: ["light", "dark", "contrast"] },
  generate_design_md: { type: "object", properties: {
    design_md: { type: "string", description: "The DESIGN.md file (same as the first text block)." },
    tokens: { type: "object", description: "The YAML front-matter token tree (DESIGN.md spec, version alpha)." },
    spec: { type: "string" }, edit_url: { type: "string" }, contrast_failures: { type: "integer" } }, required: ["design_md", "tokens"] },
};
const MCP_TOOLS_STRUCTURED = MCP_TOOLS.map((t) => MCP_OUTPUT_SCHEMAS[t.name] ? { ...t, outputSchema: MCP_OUTPUT_SCHEMAS[t.name] } : t);
function mcpShape(r, structured) {
  if (r && r.structuredContent && (!structured || r.isError)) { const { structuredContent, ...rest } = r; return rest; }
  return r;
}

// One-line "next step" hints appended to successful, non-empty results.
const MCP_NEXT = {
  search_design_inspiration: "Next step: to turn a reference into a design system, call generate_website_color_palette with brand_color set to a palette hex above, then generate_design_md.",
  browse_inspiration_by_theme: "Next step: to turn a reference into a design system, call generate_website_color_palette with brand_color set to a palette hex above, then generate_design_md.",
  search_museum_art: "Next step: search_design_inspiration finds modern design in a similar style; generate_website_color_palette(brand_color=<a palette hex above>) builds an accessible scheme from a work.",
  search_annual_reports: "Next step: search_museum_art or search_design_inspiration for related references; generate_website_color_palette(brand_color=<a palette hex above>) for a scheme.",
  search_ui_screens: "Next step: get_ui_screen_code(screen_id=…) returns the HTML and DESIGN.md; get_ui_flow returns a whole multi-step journey.",
  get_ui_flow: "Next step: get_ui_screen_code(screen_id=…) returns any step's HTML and DESIGN.md.",
  get_ui_screen_code: "Next step: to re-theme it for a brand, call generate_design_md with brand_color (or colors) and use that DESIGN.md instead.",
  generate_design_md: "Next step: search_ui_screens finds starter screens that ship with DESIGN.md files in this format.",
  generate_logo_concepts: "Next step: generate_color_combinations or generate_website_color_palette(brand_color=…) for the brand colours.",
  generate_color_combinations: "Next step: generate_website_color_palette(brand_color=<one of these hex codes>) gives a full light + dark website scheme.",
};
function mcpAddNext(name, r) {
  const hint = MCP_NEXT[name];
  if (!hint || !r || r.isError || mcpZero(r) || !Array.isArray(r.content) || /^0 /.test((r.content[0] && r.content[0].text) || "")) return r;
  const last = [...r.content].reverse().find((c) => c && c.type === "text");
  if (last && !last.text.includes("Next step:")) last.text += "\n\n" + hint;
  return r;
}

// MCP prompts (Claude Code shows them as slash commands). Each is a short, tool-routed recipe.
const MCP_PROMPTS = [
  { name: "design-system-from-references", title: "Design system from references",
    description: "Find design references for a product, pick colours from them and produce an accessible palette and a spec-conformant DESIGN.md.",
    arguments: [{ name: "product", description: "What you're building, e.g. 'a booking app for yoga studios'.", required: true },
      { name: "style", description: "Optional style words, e.g. 'warm editorial, art nouveau'.", required: false }],
    text: (a) => `Set up a design system for ${a.product}${a.style ? ` in this style: ${a.style}` : ""}, using the Made Good Designs tools.\n` +
      `1. Call search_design_inspiration${a.style ? " and search_museum_art" : ""} with 2–3 short queries${a.style ? ` drawn from "${a.style}"` : ""}. Show me the best 4–6 references with their page links.\n` +
      `2. Pick one brand colour from their palettes and explain why in one sentence.\n` +
      `3. Call generate_website_color_palette with that brand_color.\n` +
      `4. Call generate_design_md with project_name, a one-line description, 2–3 personality traits, the light and dark colours from step 3 and fonts that suit the references.\n` +
      `5. Save the result as DESIGN.md in the project root and add "Follow DESIGN.md for all UI work" to CLAUDE.md or AGENTS.md.` },
  { name: "brand-kit", title: "Brand kit",
    description: "Logo concepts, brand colours, a website palette and a DESIGN.md for a new brand name.",
    arguments: [{ name: "brand_name", description: "The brand name.", required: true },
      { name: "industry", description: "Optional industry or what the brand does.", required: false }],
    text: (a) => `Make a starter brand kit for "${a.brand_name}"${a.industry ? ` (${a.industry})` : ""} with the Made Good Designs tools.\n` +
      `1. Call generate_logo_concepts for the name and show the 3 strongest concepts.\n` +
      `2. Call generate_color_combinations for brand colours that fit${a.industry ? " the industry" : ""}; pick one combination.\n` +
      `3. Call generate_website_color_palette with brand_color set to its main colour.\n` +
      `4. Call generate_design_md with project_name "${a.brand_name}", those light/dark colours and fonts that match the chosen logo.\n` +
      `5. Summarise the kit: logo, colours (hex), fonts, and the DESIGN.md.` },
  { name: "build-screen-from-reference", title: "Build a screen from a reference",
    description: "Find an original UI screen that matches what you're building and start from its HTML and DESIGN.md.",
    arguments: [{ name: "screen", description: "The screen or section, e.g. 'billing settings with plan cards'.", required: true },
      { name: "style", description: "Optional style: minimal, editorial, brutalist, luxury, playful, corporate, retro or monochrome.", required: false }],
    text: (a) => `I'm building: ${a.screen}.\n` +
      `1. Call search_ui_screens with query "${a.screen}"${a.style ? ` and style "${a.style}"` : ""}; show the 3 closest screens with screenshots and page links.\n` +
      `2. Call get_ui_screen_code for the best match.\n` +
      `3. Rebuild it in this project's framework, keeping the DESIGN.md tokens (save DESIGN.md in the project root if there isn't one), and credit "UI by Made Good Designs" in a code comment.` },
];
function mcpPromptGet(p) {
  const pr = MCP_PROMPTS.find((x) => x.name === p.name);
  if (!pr) return { error: "Unknown prompt: " + p.name + ". Available: " + MCP_PROMPTS.map((x) => x.name).join(", ") };
  const a = {}, args = p.arguments || {};
  for (const d of pr.arguments) {
    const v = String(args[d.name] == null ? "" : args[d.name]).trim().slice(0, 200);
    if (d.required && !v) return { error: `Missing required argument: ${d.name}` };
    a[d.name] = v;
  }
  return { description: pr.description, messages: [{ role: "user", content: { type: "text", text: pr.text(a) } }] };
}

// Q6 (31-Oct): a D1 error/timeout must never read as "0 results". Retry once, then the caller returns isError.
async function mcpRetry(fn) {
  try { return await fn(); }
  catch (e) { await new Promise((r) => setTimeout(r, 120)); return fn(); }
}
async function mcpSearchRowsRetry(...args) { return mcpRetry(() => mcpSearchRows(...args)); }
const MCP_BUSY = (e) => `The search failed (database error: ${String((e && e.message) || e).slice(0, 120)}) — this is NOT a 'no results' answer. Retry the call, or shorten the query.`;

function mcpCors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "content-type,mcp-session-id,mcp-protocol-version,authorization,accept",
    "Access-Control-Expose-Headers": "Mcp-Session-Id",
  };
}
function mcpJson(obj, status, extra) {
  return new Response(obj == null ? "" : JSON.stringify(obj), {
    status: status || (obj == null ? 202 : 200),
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...mcpCors(), ...(extra || {}) },
  });
}
const rpcOk = (id, result) => ({ jsonrpc: "2.0", id, result });
const rpcErr = (id, code, message) => ({ jsonrpc: "2.0", id, error: { code, message } });

async function mcpHandler(request, env) {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: mcpCors() });
  if (request.method === "GET") {
    // MCP clients GET with Accept: text/event-stream to open a server→client stream. We don't offer one, and the spec
    // says to answer 405; a 200 here made at least one client reconnect in a tight loop (~2.5M GETs/day, 29-Oct-2026).
    if ((request.headers.get("Accept") || "").includes("text/event-stream"))
      return new Response("SSE stream not supported; POST JSON-RPC messages", { status: 405, headers: { "Allow": "POST, OPTIONS", ...mcpCors() } });
    return mcpJson({ name: "MGD Inspiration", version: "1.0", transport: "streamable-http", endpoint: `${MCP_SITE}/mcp` });
  }
  if (request.method !== "POST") return new Response("method not allowed", { status: 405, headers: mcpCors() });

  let body;
  try { body = await request.json(); } catch (e) { return mcpJson(rpcErr(null, -32700, "Parse error")); }

  const ip = request.headers.get("CF-Connecting-IP") || "";
  const ua = request.headers.get("User-Agent") || "";
  // structuredContent/outputSchema (MCP 2025-06-18+) only for clients that send that protocol version header; older clients see the old shapes.
  const structured = (request.headers.get("MCP-Protocol-Version") || "") >= "2025-06-18";

  const handle = async (msg) => {
    if (!msg || typeof msg !== "object") return null;
    const { id, method, params } = msg;
    if (method === "initialize") {
      const pv = (params && params.protocolVersion) || "2025-06-18";
      return rpcOk(id, { protocolVersion: pv, capabilities: { tools: { listChanged: false }, prompts: { listChanged: false } },
        serverInfo: { name: "MGD Inspiration", version: "1.1" }, instructions: MCP_INSTRUCTIONS });
    }
    if (typeof method === "string" && method.startsWith("notifications/")) return null; // notifications: no reply
    if (method === "ping") return rpcOk(id, {});
    if (method === "tools/list") return rpcOk(id, { tools: structured ? MCP_TOOLS_STRUCTURED : MCP_TOOLS });
    if (method === "prompts/list") return rpcOk(id, { prompts: MCP_PROMPTS.map(({ text, ...p }) => p) });
    if (method === "prompts/get") { const p = mcpPromptGet(params || {}); return p.error ? rpcErr(id, -32602, p.error) : rpcOk(id, p); }
    if (method === "tools/call") {
      try { return rpcOk(id, mcpShape(await mcpCallTool(params || {}, env, ip, ua), structured)); }
      catch (e) { return rpcOk(id, { content: [{ type: "text", text: "Error: " + (e && e.message || e) }], isError: true }); }
    }
    return rpcErr(id, -32601, "Method not found: " + method);
  };

  const ctx = mcpCtx(request, "public"), hdrs = {};
  const run = (m) => mcpTracked(env, ctx, m, handle, hdrs);
  if (Array.isArray(body)) {
    const out = (await Promise.all(body.map(run))).filter(Boolean);
    return out.length ? mcpJson(out, 0, hdrs) : mcpJson(null, 0, hdrs);
  }
  const res = await run(body);
  return res ? mcpJson(res, 0, hdrs) : mcpJson(null, 0, hdrs);
}

// Best-effort MCP usage log (never blocks/breaks a tool call).
async function logMcp(env, tool, query, ip, ua, who) {
  if (who && who.user_id) {
    try {
      await env.DB.prepare("INSERT INTO mcp_calls (id,tool,query,ip,ua,created_at,user_id,client_id) VALUES (?,?,?,?,?,?,?,?)")
        .bind(genId(), (tool || "").toString().slice(0, 60), (query || "").toString().slice(0, 200),
              (ip || "").toString().slice(0, 60), (ua || "").toString().slice(0, 200), Date.now(),
              who.user_id, (who.client_id || "").toString().slice(0, 100)).run();
      return;
    } catch (_) { /* migration not applied yet — fall through to the legacy insert */ }
  }
  try {
    await env.DB.prepare("INSERT INTO mcp_calls (id,tool,query,ip,ua,created_at) VALUES (?,?,?,?,?,?)")
      .bind(genId(), (tool || "").toString().slice(0, 60), (query || "").toString().slice(0, 200),
            (ip || "").toString().slice(0, 60), (ua || "").toString().slice(0, 200), Date.now()).run();
  } catch (_) { /* logging must never affect the response */ }
}

// MCP analytics: connections, sessions and outcomes (migrate_mcp_events.sql). Best-effort — never affects a response.
// Includes uptime monitors / directory checkers (AMP-Server calls the same 3 tools daily) so they don't count as users.
const MCP_BOT_UA = /^(curl\/|undici|python-|Go-http-client|node-fetch|axios|okhttp|aiohttp|httpx|Wget|Java\/|node$|mgd-selftest)|mcp-probe|MCPYP|evyAI|scanner|AMP-Server|amp-mcp-tester|Inspection/i;
function mcpCtx(request, endpoint) {
  return { endpoint, ip: request.headers.get("CF-Connecting-IP") || "", ua: request.headers.get("User-Agent") || "",
    country: (request.cf && request.cf.country) || "", sid: request.headers.get("mcp-session-id") || "" };
}
async function mcpVisitor(env, ip, ua) {
  const d = new TextEncoder().encode((env.MCP_HASH_SALT || "mgd-mcp-v1") + "|" + ip + "|" + ua);
  const h = new Uint8Array(await crypto.subtle.digest("SHA-256", d));
  return Array.from(h.slice(0, 12), (b) => b.toString(16).padStart(2, "0")).join("");
}
async function mcpEvent(env, c, e) {
  try {
    const cut = (x, n) => (x == null ? null : String(x).slice(0, n));
    await env.DB.prepare("INSERT INTO mcp_events (id,created_at,endpoint,kind,session_id,client_name,client_version,protocol,visitor,ua,country,tool,ok,zero,ms,bot) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)")
      .bind(genId(), Date.now(), c.endpoint, e.kind, cut(e.sid || c.sid || null, 64), cut(e.client_name, 80), cut(e.client_version, 40), cut(e.protocol, 20),
        await mcpVisitor(env, c.ip, c.ua), cut(c.ua, 200), cut(c.country, 4), cut(e.tool, 60),
        e.ok == null ? null : e.ok ? 1 : 0, e.zero == null ? null : e.zero ? 1 : 0, e.ms == null ? null : e.ms, MCP_BOT_UA.test(c.ua) ? 1 : 0).run();
  } catch (_) { /* table missing or D1 hiccup — analytics must never break MCP */ }
}
function mcpZero(result) {
  const t = (result && result.content && result.content[0] && result.content[0].text) || "";
  return /^0 [^\n]*result|No matches —/.test(t);
}
function mcpClientTag(ua) {
  return /^Claude-User/i.test(ua) ? "claude-ai" : /^claude-code/i.test(ua) ? "claude-code" : /^Cursor/i.test(ua) ? "cursor" : /^codex/i.test(ua) ? "codex" :
    /openai-mcp|ChatGPT/i.test(ua) ? "chatgpt" : /vscode|copilot/i.test(ua) ? "vscode" : "";
}
// Tag our own page links in tool answers so GA4 shows the visits MCP sends (utm_source=mcp, medium=referral, campaign=tool).
function mcpUtm(result, tool, ua) {
  if (!result || !Array.isArray(result.content)) return result;
  const client = mcpClientTag(ua);
  const tag = "utm_source=mcp&utm_medium=referral&utm_campaign=" + encodeURIComponent(tool || "mcp") + (client ? "&utm_content=" + client : "");
  result.content.forEach((c) => {
    if (!c || c.type !== "text" || typeof c.text !== "string") return;
    c.text = c.text.replace(/https:\/\/madegooddesigns\.com\/[^\s)\]>"'`<]*/g, (u) => {
      if (/[?&]utm_/.test(u)) return u;
      const trail = (u.match(/[.,;:!]+$/) || [""])[0];
      let core = u.slice(0, u.length - trail.length);
      const h = core.indexOf("#"), hash = h >= 0 ? core.slice(h) : "";
      if (h >= 0) core = core.slice(0, h);
      if (/\/(img|wp-content|assets)\//.test(core) || /\.(png|jpe?g|webp|gif|svg|json|txt|xml|woff2?|css|js|ico|pdf)$/i.test(core)) return u;
      return core + (core.includes("?") ? "&" : "?") + tag + hash + trail;
    });
  });
  return result;
}
// One JSON-RPC message → response, with analytics. `inner(msg)` is the endpoint's own handler.
async function mcpTracked(env, c, msg, inner, hdrs) {
  const method = msg && msg.method;
  if (method === "initialize") {
    const sid = crypto.randomUUID();
    hdrs["Mcp-Session-Id"] = sid;
    const ci = (msg.params && msg.params.clientInfo) || {};
    await mcpEvent(env, c, { kind: "initialize", sid, client_name: ci.name, client_version: ci.version, protocol: msg.params && msg.params.protocolVersion });
    return inner(msg);
  }
  if (method === "tools/list") { await mcpEvent(env, c, { kind: "tools_list" }); return inner(msg); }
  if (method === "prompts/get") { await mcpEvent(env, c, { kind: "prompt", tool: String((msg.params && msg.params.name) || "").slice(0, 60) }); return inner(msg); }
  if (method !== "tools/call") return inner(msg);
  const t0 = Date.now(), tool = (msg.params && msg.params.name) || "";
  const res = await inner(msg);
  const r = res && res.result;
  await mcpEvent(env, c, { kind: "call", tool, ok: !!r && !r.isError, zero: r ? mcpZero(r) : null, ms: Date.now() - t0 });
  if (r) mcpUtm(r, tool, c.ua);
  return res;
}

async function mcpCallTool(params, env, ip, ua, who) {
  const name = params.name;
  const a = params.arguments || {};
  await logMcp(env, name, a.query || a.q || a.screen_id || a.theme || a.project_name || a.brand_color || a.name || a.document || a.keyword || a.title || (a.country ? a.country + " " + (a.year || "") : "") || (Array.isArray(a.words) ? a.words.slice(0, 6).join(" ") : "") || (typeof a.text === "string" ? a.text.slice(0, 80) : "") || (typeof a.data === "string" ? a.data.slice(0, 80) : "") || (typeof a.colors === "string" ? a.colors.slice(0, 80) : Array.isArray(a.colors) ? a.colors.slice(0, 6).join(" ") : "") || a.preset || "", ip, ua, who);
  const opts = who ? { ids: true } : undefined; // authenticated endpoint also shows item_id (needed by save_to_board)
  try { return mcpAddNext(name, await mcpCallToolInner(name, a, env, opts)); }
  catch (e) {
    if (MCP_D1_TOOLS.has(name)) return { content: [{ type: "text", text: MCP_BUSY(e) }], isError: true };
    throw e;
  }
}
const MCP_D1_TOOLS = new Set(["search_design_inspiration", "list_inspiration_themes", "browse_inspiration_by_theme", "search_annual_reports", "search_museum_art", "search_ui_screens", "get_ui_flow", "get_ui_screen_code"]);
const MCP_SIBLING = {
  design: "Nothing in the design-inspiration gallery; try search_museum_art (historical art and posters) or search_ui_screens (app and website screens).",
  "annual-report": "Nothing in the annual-report archive; try search_design_inspiration or search_museum_art.",
  museum: "Nothing in the museum collection (public-domain works, mostly before the 1930s); for modern movements such as Bauhaus or Swiss style try search_design_inspiration or search_annual_reports.",
};
async function mcpCallToolInner(name, a, env, opts) {
  if (name === "search_design_inspiration") {
    const q = (a.query || "").toString().trim();
    const limit = clampInt(a.limit, 8, 1, 20);
    const binds = ["published", "design"];
    let where = "status=? AND owner_id IS NULL AND collection=?";
    if (a.theme) { where += " AND themes LIKE ?"; binds.push(`%"${a.theme}"%`); }
    const r = await mcpSearchRowsRetry(env, where, binds, ["title", "description", "tags", "themes"], q, "created_at DESC", limit);
    return mcpItems(r.rows, `${r.rows.length} design-inspiration result(s) for "${q}"${a.theme ? " in theme "+a.theme : ""}${r.note}`, opts, MCP_SIBLING.design);
  }
  if (name === "list_inspiration_themes") {
    const rows = await mcpRetry(() => env.DB.prepare(`SELECT themes FROM items WHERE status='published' AND owner_id IS NULL AND collection='design'`).all());
    const counts = {};
    (rows.results || []).forEach((r) => safeArr(r.themes).forEach((t) => { counts[t] = (counts[t] || 0) + 1; }));
    const lines = MCP_THEMES.map((t) => `- ${t}: ${counts[t] || 0} items  (${MCP_SITE}/?theme=${t})`);
    return { content: [{ type: "text", text: `Curated design-inspiration themes at Made Good Designs (${MCP_SITE}/):\n` + lines.join("\n") }] };
  }
  if (name === "browse_inspiration_by_theme") {
    const theme = (a.theme || "").toString().trim();
    const limit = clampInt(a.limit, 10, 1, 20);
    const rows = await mcpRetry(() => env.DB.prepare(`SELECT * FROM items WHERE status='published' AND owner_id IS NULL AND collection='design' AND themes LIKE ? ORDER BY created_at DESC LIMIT ?`).bind(`%"${theme}"%`, limit).all());
    return mcpItems(rows.results || [], `${(rows.results||[]).length} item(s) in theme "${theme}"`, opts, "Try list_inspiration_themes for the themes that have items, or search_design_inspiration with a keyword.");
  }
  if (name === "search_annual_reports") {
    const q = (a.query || "").toString().trim();
    const limit = clampInt(a.limit, 8, 1, 20);
    const binds = ["published", "annual-report"];
    let where = "status=? AND owner_id IS NULL AND collection=?";
    if (a.year) { const y = parseInt(a.year, 10); if (y) { where += " AND report_year = ?"; binds.push(y); } }
    if (a.industry) { where += " AND industry = ?"; binds.push(a.industry.toString().trim()); }
    const r = await mcpSearchRowsRetry(env, where, binds, ["company", "designer", "title", "description", "tags", "industry"], q, "report_year DESC, created_at DESC", limit);
    return mcpItems(r.rows, `${r.rows.length} annual-report result(s) for "${q}"${a.year ? " ("+a.year+")" : ""}${a.industry ? " in "+a.industry : ""}${r.note}`, opts, MCP_SIBLING["annual-report"]);
  }
  if (name === "search_museum_art") {
    let q = (a.query || "").toString().trim();
    const limit = clampInt(a.limit, 8, 1, 20);
    const binds = ["published", "museum"];
    let where = "status=? AND owner_id IS NULL AND collection=?", themeNote = "";
    let theme = a.theme ? a.theme.toString().trim().toLowerCase().replace(/[\s_]+/g, "-") : "";
    // Unknown theme (e.g. 'bauhaus', which has no museum works): don't filter everything away — search it as text instead.
    if (theme && !(await mcpRetry(() => env.DB.prepare("SELECT 1 FROM items WHERE collection='museum' AND status='published' AND category=? LIMIT 1").bind(theme).first()))) {
      themeNote = ` ('${theme}' is not a museum theme, so it was searched as text)`; q = (q + " " + theme.replace(/-/g, " ")).trim(); theme = "";
    }
    if (theme) { where += " AND category = ?"; binds.push(theme); }
    if (a.culture) { where += " AND country LIKE ?"; binds.push(`%${a.culture.toString().trim()}%`); }
    const r = await mcpSearchRowsRetry(env, where, binds, ["title", "designer", "description", "tags", "industry"], q, "featured_rank IS NULL, featured_rank, created_at DESC", limit);
    return mcpItems(r.rows, `${r.rows.length} museum artwork(s) for "${q}"${theme ? " in theme "+theme : ""}${r.note}${themeNote}`, opts, MCP_SIBLING.museum);
  }
  if (name === "get_share_feedback") {
    const link = (a.link || "").toString();
    const m = link.match(/manage=([a-z0-9]{10})\.([a-z0-9]{24})/) || link.match(/sites\/([a-z0-9]{10})\/feedback\.md\?k=([a-z0-9]{24})/);
    const id = m ? m[1] : (a.id || "").toString().trim(), key = m ? m[2] : (a.key || "").toString().trim();
    if (!/^[a-z0-9]{10}$/.test(id) || !/^[a-z0-9]{24}$/.test(key)) return { content: [{ type: "text", text: "Pass the owner link from https://madegooddesigns.com/tools/html-to-link/ (it contains #manage=ID.KEY), or id and key." }], isError: true };
    const r = await fetch(`https://mgdshare.com/api/sites/${id}/feedback.md?k=${key}`, { headers: { "user-agent": "mgd-inspiration-mcp" } });
    if (!r.ok) return { content: [{ type: "text", text: r.status === 403 ? "That link was deleted, has expired, or the key is wrong." : "Couldn't fetch feedback (HTTP " + r.status + ")." }], isError: true };
    return { content: [{ type: "text", text: await r.text() }] };
  }
  if (name === "generate_website_color_palette") return mcpWebsitePalette(a);
  if (name === "generate_design_md") return mcpDesignMd(a);
  if (isToolsTool(name)) return callToolsTool(name, a);
  if (isTools44Tool(name)) return callTools44Tool(name, a);
  if (isTools45Tool(name)) return callTools45Tool(name, a);
  if (isUiTool(name)) return callUiTool(name, a, env, { mcpSearchRows: mcpSearchRowsRetry, rowToItem, clampInt, site: MCP_SITE });
  return { content: [{ type: "text", text: "Unknown tool: " + name }], isError: true };
}

// ---- design generators (shared code with /tools/website-color-palette-generator/ and /tools/design-md-generator/)
const TOOLS_SITE = "https://madegooddesigns.com/tools";
const PAL_STYLES = ["clean", "warm", "vibrant", "muted", "contrast"];
const PAL_HARM = ["analogous", "complementary", "split", "triadic", "monochromatic"];
function mcpHex(x) { return typeof x === "string" ? MGDRoles.normHex(x) : null; }
function mcpRoleMap(obj) {
  const out = {};
  if (obj && typeof obj === "object") for (const k of MGDRoles.ROLES) { const h = mcpHex(obj[k]); if (h) out[k] = h; }
  return out;
}
function mcpChecksText(roles, label, textMin) {
  return `| ${label} | Ratio | Needs | Result |\n|---|---|---|---|\n` + MGDRoles.checks(roles, textMin).map((c) =>
    `| ${c.label} (${c.a.toUpperCase()} on ${c.b.toUpperCase()}) | ${c.ratio.toFixed(2)}:1 | ${c.min}:1 | ${c.pass ? "Pass" : "Fail"} |`).join("\n");
}
function mcpPaletteLink(L, D, extra) {
  return `${TOOLS_SITE}/website-color-palette-generator/?l=${MGDRoles.packRoles(L)}&d=${MGDRoles.packRoles(D)}${extra || ""}`;
}
function mcpWebsitePalette(a) {
  const brand = a.brand_color ? mcpHex(a.brand_color) : null;
  if (a.brand_color && !brand) return { content: [{ type: "text", text: "brand_color must be a hex code such as #e11d48." }], isError: true };
  const style = PAL_STYLES.includes(a.style) ? a.style : "clean";
  const sd = MGDRoles.seed({ mood: style, harmony: PAL_HARM.includes(a.harmony) ? a.harmony : null, brand });
  const light = MGDRoles.build(sd, "light"), dark = MGDRoles.build(sd, "dark"), L = light.roles, D = dark.roles;
  const tm = MGDRoles.MOODS[style].textMin;
  const rows = MGDRoles.ROLES.map((k) => `| ${MGDRoles.LABELS[k]} | \`${L[k].toUpperCase()}\` | \`${D[k].toUpperCase()}\` |`).join("\n");
  const css = ":root {\n" + MGDRoles.ROLES.map((k) => `  --color-${k}: ${L[k]};`).join("\n") + "\n}\n@media (prefers-color-scheme: dark) {\n  :root {\n" +
    MGDRoles.ROLES.map((k) => `    --color-${k}: ${D[k]};`).join("\n") + "\n  }\n}";
  const notes = light.notes.concat(dark.notes);
  const link = mcpPaletteLink(L, D, `&m=${style}`);
  const text = `Website colour palette (style: ${style}, accent harmony: ${sd.harmony}${brand ? ", brand " + brand.toUpperCase() : ""}) — generated with Made Good Designs' Website Color Palette Generator.\n\n` +
    `| Role | Light | Dark |\n|---|---|---|\n${rows}\n\n` + (notes.length ? notes.join(" ") + "\n\n" : "") +
    mcpChecksText(L, "Light theme", tm) + "\n\n" + mcpChecksText(D, "Dark theme", tm) + "\n\n```css\n" + css + "\n```\n\n" +
    `Open and edit this palette (previews, fonts, Tailwind/JSON/SCSS export): ${link}\n` +
    `Turn it into a DESIGN.md file: ${TOOLS_SITE}/design-md-generator/?l=${MGDRoles.packRoles(L)}&d=${MGDRoles.packRoles(D)}\n\n` +
    `Next step: call generate_design_md with colors=${JSON.stringify({ light: L, dark: D })} to get a DESIGN.md with these exact colours.`;
  const contrast = [["light", L], ["dark", D]].flatMap(([th, r]) => MGDRoles.checks(r, tm).map((c) => ({ theme: th, pair: c.label, ratio: Math.round(c.ratio * 100) / 100, min: c.min, pass: c.pass })));
  return { content: [{ type: "text", text }], structuredContent: { style, harmony: sd.harmony, brand_color: brand, light: L, dark: D, notes, contrast, palette_url: link,
    design_md_url: `${TOOLS_SITE}/design-md-generator/?l=${MGDRoles.packRoles(L)}&d=${MGDRoles.packRoles(D)}` } };
}
function mcpDesignMd(a) {
  const brand = a.brand_color ? mcpHex(a.brand_color) : null;
  if (a.brand_color && !brand) return { content: [{ type: "text", text: "brand_color must be a hex code such as #e11d48." }], isError: true };
  const style = PAL_STYLES.includes(a.style) ? a.style : "clean";
  const givenL = mcpRoleMap(a.colors && a.colors.light), givenD = mcpRoleMap(a.colors && a.colors.dark);
  const anchor = brand || givenL.primary || null;
  const sd = MGDRoles.seed({ mood: style, brand: anchor });
  const L = MGDRoles.build(sd, "light", givenL).roles, D = MGDRoles.build(sd, "dark", givenD).roles;
  const dark = a.include_dark !== false;
  const strs = (x, max) => (Array.isArray(x) ? x : []).map((v) => String(v).slice(0, 300)).filter(Boolean).slice(0, max);
  const dmIn = {
    name: String(a.project_name || "").slice(0, 80), description: String(a.description || "").slice(0, 200),
    productType: typeof a.product_type === "string" ? a.product_type.slice(0, 40) : "SaaS web app",
    personality: strs(a.personality, 4), dark, light: L, darkColors: D,
    headingFont: String(a.heading_font || "").slice(0, 60), bodyFont: String(a.body_font || "").slice(0, 60), monoFont: String(a.mono_font || "").slice(0, 60),
    baseSize: clampInt(a.base_size, 16, 12, 24), scaleRatio: [1.125, 1.2, 1.25, 1.333, 1.5].includes(Number(a.scale_ratio)) ? Number(a.scale_ratio) : 1.25,
    spacingUnit: Number(a.spacing_unit) === 8 ? 8 : 4, density: a.density, radius: ["0", "4", "8", "12", "16", "full"].includes(String(a.radius)) ? String(a.radius) : "8",
    borderWidth: Number(a.border_width) === 2 ? "2" : "1", shadows: a.shadows, motion: a.motion,
    components: Array.isArray(a.components) && a.components.length ? a.components : MGDDesignMd.COMPONENTS.map((c) => c[0]),
    dos: Array.isArray(a.dos) ? strs(a.dos, 20) : MGDDesignMd.DEFAULT_DO, donts: Array.isArray(a.donts) ? strs(a.donts, 20) : MGDDesignMd.DEFAULT_DONT,
  };
  const md = MGDDesignMd.build(dmIn);
  const fonts = `&hf=${encodeURIComponent(String(a.heading_font || "Inter").slice(0, 60))}&bf=${encodeURIComponent(String(a.body_font || "Inter").slice(0, 60))}`;
  const edit = `${TOOLS_SITE}/design-md-generator/?l=${MGDRoles.packRoles(L)}${dark ? "&d=" + MGDRoles.packRoles(D) : ""}${fonts}`;
  const note = `Save this as DESIGN.md in the project root and point the agent's instructions file (CLAUDE.md, AGENTS.md or editor rules) at it. ` +
    `It follows the open DESIGN.md format (version alpha): check it with \`npx @google/design.md lint DESIGN.md\`, or export the tokens with \`npx @google/design.md export --format css-tailwind DESIGN.md\` (or \`--format dtcg\`). ` +
    `Edit it visually: ${edit} — or preview the colours on real page layouts: ${mcpPaletteLink(L, D)}`;
  const fails = MGDRoles.checks(L).filter((c) => !c.pass).length + (dark ? MGDRoles.checks(D).filter((c) => !c.pass).length : 0);
  return { content: [{ type: "text", text: md }, { type: "text", text: note }],
    structuredContent: { design_md: md, tokens: MGDDesignMd.tokens(dmIn), spec: "DESIGN.md alpha (github.com/google-labs-code/design.md)", edit_url: edit, contrast_failures: fails } };
}

// MCP text search. 1) the whole query as one phrase (the original behaviour); if nothing matches a multi-word
// query, 2) items containing every word (in any of the columns), then 3) items containing the most words.
// Assistants send natural phrases ("swiss poster", "Mucha poster") that rarely appear verbatim.
const MCP_STOP = new Set(["the","and","for","with","from","that","this","are","some","any","ideas","idea","examples","example","inspiration","design","designs","style","styled","references","reference"]);
// D1's LIKE limit is ~50 BYTES, so CJK/accented text must be capped by UTF-8 length, not characters (31-Oct-2026).
function utf8Len(s) { return new TextEncoder().encode(s).length; }
function cutBytes(s, n) { let a = Array.from(s); while (a.length && utf8Len(a.join("")) > n) a.pop(); return a.join(""); }
async function mcpSearchRows(env, where, binds, cols, q, order, limit) {
  const run = (w, wb, ord, ob) => env.DB.prepare(`SELECT * FROM items WHERE ${where}${w} ORDER BY ${ord} LIMIT ?`)
    .bind(...binds, ...wb, ...ob, limit).all().then((r) => r.results || []);
  const any = () => "(" + cols.map((c) => `${c} LIKE ?`).join(" OR ") + ")";
  const likes = (w) => cols.map(() => `%${w}%`);
  if (!q) return { rows: await run("", [], order, []), note: "" };
  // D1 caps LIKE patterns at ~50 bytes ("LIKE or GLOB pattern too complex"), so long queries skip the whole-phrase pass.
  const phrase = utf8Len(q) <= 40 ? await run(" AND " + any(), likes(q), order, []) : [];
  if (phrase.length >= limit) return { rows: phrase, note: "" };
  // Fewer exact-phrase hits than asked for: top up with word matches (e.g. "greek typography" had 1 phrase hit
  // but many items tagged "greek" + "typography").
  const r = await mcpWordRows(env, where, binds, cols, q, order, limit, run, any, likes);
  if (!phrase.length) return r;
  const seen = new Set(phrase.map((x) => x.id));
  return { rows: phrase.concat(r.rows.filter((x) => !seen.has(x.id))).slice(0, limit), note: "" };
}
async function mcpWordRows(env, where, binds, cols, q, order, limit, run, any, likes) {
  const words = [...new Set(q.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter((w) => w.length > 2 && !MCP_STOP.has(w)).map((w) => cutBytes(w, 40)))].slice(0, 6);
  if (!words.length || (words.length === 1 && words[0] === q.toLowerCase())) return { rows: [], note: "" };
  const hit = words.map(any), wb = words.flatMap(likes);
  const all = await run(" AND " + hit.join(" AND "), wb, order, []);
  if (all.length || words.length === 1) return { rows: all, note: all.length ? ` (matching all of: ${words.join(", ")})` : "" };
  // Rank partial matches by how rare each word is (IDF), so common words like "brand" or "identity" don't decide the result.
  const cnt = await env.DB.prepare(`SELECT COUNT(*) n, ${hit.map((h, i) => `SUM(CASE WHEN ${h} THEN 1 ELSE 0 END) d${i}`).join(", ")} FROM items WHERE ${where}`)
    .bind(...wb, ...binds).first(); // SELECT-list placeholders come before the WHERE ones
  const N = Math.max(1, cnt.n), df = words.map((_, i) => cnt["d" + i] || 0);
  const idf = df.map((d) => (d ? Math.log(N / d) : 0));
  const use = words.map((_, i) => i).filter((i) => df[i]);
  if (!use.length) return { rows: [], note: "" };
  const w = (i) => Math.max(1, Math.round(idf[i] * 10));
  const score = use.map((i) => `(CASE WHEN ${hit[i]} THEN ${w(i)} ELSE 0 END)`).join(" + ");
  const ub = use.flatMap((i) => likes(words[i]));
  const some = await run(" AND (" + use.map((i) => hit[i]).join(" OR ") + ")", ub, `(${score}) DESC, ${order}`, ub);
  return { rows: some, note: some.length ? ` (no item matches every word; closest matches for: ${use.map((i) => words[i]).join(", ")})` : "" };
}

function mcpItems(rows, header, opts, sibling) {
  if (!rows.length) return { content: [{ type: "text", text: header + ". No matches — try a broader query or a different theme." + (sibling ? " " + sibling : "") + " Browse all at " + MCP_SITE + "/" }] };
  const blocks = rows.map((r) => {
    const it = rowToItem(r, null);
    const isReport = it.collection === "annual-report";
    const isMuseum = it.collection === "museum";
    return [
      `• ${it.title || it.company || "Untitled"}`,
      opts && opts.ids ? `  item_id: ${it.id}` : null,
      isReport && it.company ? `  company: ${it.company}${it.report_year ? " ("+it.report_year+")" : ""}` : null,
      isReport && it.designer ? `  designer/agency: ${it.designer}` : null,
      isReport && it.industry ? `  industry: ${it.industry}` : null,
      isReport && it.country ? `  country: ${it.country}` : null,
      isMuseum && it.artist ? `  artist: ${it.artist}${it.year ? " ("+it.year+")" : ""}` : null,
      isMuseum && it.type ? `  type: ${it.type}` : null,
      isMuseum && it.culture ? `  culture: ${it.culture}` : null,
      isMuseum && it.museum ? `  collection: ${it.museum} (public domain / CC0)` : null,
      isMuseum && it.source_link ? `  museum page: ${it.source_link}` : null,
      it.description ? `  ${it.description}` : null,
      it.tags.length ? `  tags: ${it.tags.join(", ")}` : null,
      it.themes.length ? `  themes: ${it.themes.join(", ")}` : null,
      it.palette.length ? `  palette: ${it.palette.join(" ")}` : null,
      (it.source || it.source_host) ? `  source: ${it.source || it.source_host}` : null,
      isMuseum ? `  page (cite this): ${MCP_SITE}/museum/${slugify(it.title || it.artist || "artwork")}${it.year ? "-" + it.year : ""}-${it.id}` : null,
      isReport ? `  page (cite this): ${MCP_SITE}/annual-reports/${slugify(it.company || it.title)}${it.report_year ? "-" + it.report_year : ""}-${it.id}` : null,
      `  image: ${MCP_SITE}${it.image}`,
    ].filter(Boolean).join("\n");
  });
  const text = `${header}. Source: Made Good Designs — ${MCP_SITE}/ (please cite/link this).\n\n` + blocks.join("\n\n");
  return { content: [{ type: "text", text }] };
}

// ---------------------------------------------------------------------------
// Authenticated MCP server — /mcp/boards. Same JSON-RPC transport as /mcp, but every
// request needs an OAuth 2.1 bearer token (see oauth.js) and the tool set adds the
// caller's OWN mood boards. The user id ALWAYS comes from the token, never arguments.
// ---------------------------------------------------------------------------

const MCP_BOARD_TOOLS = [
  {
    name: "list_my_boards",
    description: "List the signed-in user's Made Good Designs mood boards, grouped by collection (e.g. Work, Interests, Personal): id, name, description, number of saved items, cover image and public share link if shared. Use the board id with get_board, save_to_board, update_board and remove_from_board.",
    inputSchema: { type: "object", properties: {} },
    annotations: { title: "List my boards", readOnlyHint: true, openWorldHint: false },
    scope: "boards:read",
  },
  {
    name: "get_board",
    description: "Get one of the signed-in user's mood boards with its saved items: title, description, the user's note on each pin, colour palette, tags, image URL and the Made Good Designs page URL to cite.",
    inputSchema: {
      type: "object",
      properties: {
        board_id: { type: "string", description: "Board id from list_my_boards." },
        limit: { type: "integer", description: "Max items (1-100, default 50).", minimum: 1, maximum: 100 },
      },
      required: ["board_id"],
    },
    annotations: { title: "Get board", readOnlyHint: true, openWorldHint: false },
    scope: "boards:read",
  },
  {
    name: "create_board",
    description: "Create a new, private mood board for the signed-in user, optionally in a group such as Work, Interests or Personal. Returns the new board id.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Board name (max 80 characters).", maxLength: 80 },
        group: { type: "string", description: "Optional group (max 30 characters). Suggested: Work, Interests, Personal — any other label is allowed.", maxLength: 30 },
        description: { type: "string", description: "Optional short description (max 300 characters).", maxLength: 300 },
      },
      required: ["name"],
    },
    annotations: { title: "Create board", readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    scope: "boards:write",
  },
  {
    name: "save_to_board",
    description: "Save a Made Good Designs inspiration item (item_id from the search/browse tools) to one of the signed-in user's boards, optionally with a note on why it was saved. Saving an item that is already on the board only updates its note (if one is given).",
    inputSchema: {
      type: "object",
      properties: {
        board_id: { type: "string", description: "Board id from list_my_boards or create_board." },
        item_id: { type: "string", description: "Item id (the item_id line in search_design_inspiration / browse_inspiration_by_theme / search_annual_reports results)." },
        note: { type: "string", description: "Optional note shown with the pin (max 500 characters), e.g. 'colour direction for the Q3 campaign'.", maxLength: 500 },
      },
      required: ["board_id", "item_id"],
    },
    annotations: { title: "Save to board", readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    scope: "boards:write",
  },
  {
    name: "update_board",
    description: "Update one of the signed-in user's boards: rename it, move it to a group (Work, Interests, Personal or any label), change its description, or turn its public share link on or off. Only the fields you pass are changed. A shared board can be viewed read-only by anyone with the link.",
    inputSchema: {
      type: "object",
      properties: {
        board_id: { type: "string", description: "Board id from list_my_boards." },
        name: { type: "string", description: "New name (max 80 characters).", maxLength: 80 },
        group: { type: "string", description: "Group label (max 30 characters); empty string removes the group.", maxLength: 30 },
        description: { type: "string", description: "New description (max 300 characters); empty string clears it.", maxLength: 300 },
        shared: { type: "boolean", description: "true creates (or keeps) a public read-only link; false turns sharing off." },
      },
      required: ["board_id"],
    },
    annotations: { title: "Update board", readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    scope: "boards:write",
  },
  {
    name: "add_to_board_canvas",
    description: "Add a text note, colour swatches or a type sample to the free-form canvas of one of the signed-in user's boards (the canvas view on madegooddesigns.com, where pins, notes, swatches and type can be arranged like a mood board). New elements are placed below what is already on the canvas. Pins are added with save_to_board.",
    inputSchema: {
      type: "object",
      properties: {
        board_id: { type: "string", description: "Board id from list_my_boards." },
        type: { type: "string", description: "What to add.", enum: ["note", "swatches", "type"] },
        text: { type: "string", description: "For note: the note text. For type: the sample text (max 1000 characters).", maxLength: 1000 },
        colors: { type: "array", description: "For swatches: hex colours, e.g. ['#0f766e','#f59e0b'] (max 12). For note: optional single background colour as the first item.", items: { type: "string" }, maxItems: 12 },
        font: { type: "string", description: "For type: a Google Fonts family name, e.g. 'Playfair Display' (default Inter).", maxLength: 60 },
        size: { type: "integer", description: "For type: font size in px (8-240, default 48).", minimum: 8, maximum: 240 },
      },
      required: ["board_id", "type"],
    },
    annotations: { title: "Add to board canvas", readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    scope: "boards:write",
  },
  {
    name: "board_design_system",
    description: "Turn one of the signed-in user's mood boards into a design system: extracts the board's colours (canvas swatches first, then the saved images' palettes) and fonts (canvas type samples), builds an accessible website palette for light and dark themes (WCAG AA enforced), and can return a full DESIGN.md design brief for AI coding agents. Includes links that open the result in Made Good Designs' palette and DESIGN.md tools.",
    inputSchema: {
      type: "object",
      properties: {
        board_id: { type: "string", description: "Board id from list_my_boards." },
        include_design_md: { type: "boolean", description: "Also return the full DESIGN.md (default true)." },
      },
      required: ["board_id"],
    },
    annotations: { title: "Board to design system", readOnlyHint: true, openWorldHint: false },
    scope: "boards:read",
  },
  {
    name: "remove_from_board",
    description: "Remove an item from one of the signed-in user's boards (the item itself stays in the gallery).",
    inputSchema: {
      type: "object",
      properties: {
        board_id: { type: "string", description: "Board id." },
        item_id: { type: "string", description: "Item id to remove from the board." },
      },
      required: ["board_id", "item_id"],
    },
    annotations: { title: "Remove from board", readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: false },
    scope: "boards:write",
  },
];
const MCP_BOARD_SCOPE = Object.fromEntries(MCP_BOARD_TOOLS.map((t) => [t.name, t.scope]));

function mcpMeTools(scopes) {
  const board = MCP_BOARD_TOOLS.filter((t) => scopes.has(t.scope)).map(({ scope, ...t }) => t);
  return board.concat(MCP_TOOLS);
}

function mcpMeResponse(obj, status, extraHeaders) {
  return new Response(obj == null ? "" : JSON.stringify(obj), {
    status: status || (obj == null ? 202 : 200),
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...oauthCors(), ...(extraHeaders || {}) },
  });
}

async function mcpMeHandler(request, env, ctx, url, base) {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: oauthCors() });
  const auth = await verifyBearer(request, env, url, base, ctx);
  if (!auth.ok) {
    // 401 + RFC 9728 pointer so MCP clients can discover the authorization server.
    return mcpMeResponse({ error: auth.error || "unauthorized", error_description: auth.desc || "Sign in required: this MCP endpoint needs an OAuth access token." }, 401,
      { "WWW-Authenticate": challengeHeader(url, base, env, auth.error, auth.desc) });
  }
  if (request.method === "GET") return new Response("SSE stream not supported; POST JSON-RPC messages", { status: 405, headers: { "Allow": "POST, OPTIONS", ...oauthCors() } });
  if (request.method === "DELETE") return new Response(null, { status: 405, headers: { "Allow": "POST, OPTIONS", ...oauthCors() } });
  if (request.method !== "POST") return new Response("method not allowed", { status: 405, headers: oauthCors() });

  let body;
  try { body = await request.json(); } catch (e) { return mcpMeResponse(rpcErr(null, -32700, "Parse error")); }
  const ip = request.headers.get("CF-Connecting-IP") || "";
  const ua = request.headers.get("User-Agent") || "";
  const who = { user_id: auth.user_id, client_id: auth.client_id };

  // Step-up signal: a single tools/call lacking the needed scope gets HTTP 403 insufficient_scope.
  if (!Array.isArray(body) && body && body.method === "tools/call") {
    const need = MCP_BOARD_SCOPE[(body.params || {}).name];
    if (need && !auth.scopes.has(need)) {
      return mcpMeResponse({ error: "insufficient_scope", error_description: `This tool needs the ${need} scope` }, 403,
        { "WWW-Authenticate": challengeHeader(url, base, env, "insufficient_scope", `This tool needs the ${need} scope`, need) });
    }
  }

  const handle = async (msg) => {
    if (!msg || typeof msg !== "object") return null;
    const { id, method, params } = msg;
    if (method === "initialize") {
      const pv = (params && params.protocolVersion) || "2025-06-18";
      return rpcOk(id, { protocolVersion: pv, capabilities: { tools: { listChanged: false } },
        serverInfo: { name: "MGD Inspiration (my boards)", version: "1.0" },
        instructions: "Curated typography & brand-design inspiration from Made Good Designs (madegooddesigns.com), plus the signed-in user's own mood boards. Search with the search tools, then save results to a board with save_to_board using the item_id. Cite the madegooddesigns.com links in results." });
    }
    if (typeof method === "string" && method.startsWith("notifications/")) return null;
    if (method === "ping") return rpcOk(id, {});
    if (method === "tools/list") return rpcOk(id, { tools: mcpMeTools(auth.scopes) });
    if (method === "tools/call") {
      const p = params || {};
      try {
        const need = MCP_BOARD_SCOPE[p.name];
        if (need) {
          if (!auth.scopes.has(need)) return rpcOk(id, { content: [{ type: "text", text: `Error: this tool needs the ${need} scope. Reconnect the app and allow it.` }], isError: true });
          return rpcOk(id, await mcpBoardTool(p, env, auth, ip, ua));
        }
        return rpcOk(id, mcpShape(await mcpCallTool(p, env, ip, ua, who), false));
      } catch (e) { return rpcOk(id, { content: [{ type: "text", text: "Error: " + (e && e.message || e) }], isError: true }); }
    }
    return rpcErr(id, -32601, "Method not found: " + method);
  };

  const mctx = mcpCtx(request, "boards"), hdrs = {};
  const run = (m) => mcpTracked(env, mctx, m, handle, hdrs);
  if (Array.isArray(body)) {
    const out = (await Promise.all(body.map(run))).filter(Boolean);
    return out.length ? mcpMeResponse(out, 0, hdrs) : mcpMeResponse(null, 0, hdrs);
  }
  const res = await run(body);
  return res ? mcpMeResponse(res, 0, hdrs) : mcpMeResponse(null, 0, hdrs);
}

// Page URL to cite for an item: annual reports have permalinks; gallery items deep-link via #i/<id>.
function mcpItemPage(it) {
  if (it.collection === "annual-report") return `${MCP_SITE}/annual-reports/${slugify(it.company || it.title)}${it.report_year ? "-" + it.report_year : ""}-${it.id}`;
  return `${MCP_SITE}/#i/${encodeURIComponent(it.id)}`;
}
const mcpText = (text, isError) => (isError ? { content: [{ type: "text", text }], isError: true } : { content: [{ type: "text", text }] });
const cleanId = (v) => (v == null ? "" : String(v)).trim().slice(0, 64);

async function mcpBoardTool(params, env, auth, ip, ua) {
  const name = params.name;
  const a = params.arguments || {};
  const uid = auth.user_id; // ownership is ALWAYS taken from the token
  await logMcp(env, name, a.name || a.board_id || "", ip, ua, { user_id: uid, client_id: auth.client_id });
  const ownBoard = (id) => env.DB.prepare("SELECT * FROM boards WHERE id=? AND user_id=?").bind(id, uid).first();
  const notFound = (id) => mcpText(`No board with id "${id}" was found on your account. Call list_my_boards to see your boards.`, true);

  if (name === "list_my_boards") {
    const rows = (await env.DB.prepare(BOARD_LIST_SQL + " ORDER BY COALESCE(b.grp,'~'), COALESCE(b.updated_at,b.created_at) DESC LIMIT ?").bind(uid, MAX_BOARDS_PER_USER).all()).results || [];
    if (!rows.length) return mcpText(`You have no mood boards yet. Create one with create_board (optionally in a group such as Work, Interests or Personal). Your boards are also at ${MCP_SITE}/ (My boards, signed in).`);
    const groups = {};
    rows.forEach((b) => { const g = b.grp || "Ungrouped"; (groups[g] = groups[g] || []).push(b); });
    const out = Object.keys(groups).map((g) => `## ${g}\n\n` + groups[g].map((b) => [
      `• ${b.name}`, `  board_id: ${b.id}`, `  items: ${b.count || 0}`,
      b.description ? `  description: ${b.description}` : null,
      b.share_id ? `  shared link: ${shareUrlFor(b.share_id)}` : `  sharing: private`,
      b.cover ? `  cover: ${MCP_SITE}/img/${b.cover}` : null,
      `  updated: ${new Date(b.updated_at || b.created_at).toISOString().slice(0, 10)}`,
    ].filter(Boolean).join("\n")).join("\n\n"));
    return mcpText(`${rows.length} board(s) on your Made Good Designs account — view them at ${MCP_SITE}/ (My boards, signed in).\n\n` + out.join("\n\n"));
  }

  if (name === "get_board") {
    const bid = cleanId(a.board_id);
    const board = bid && await ownBoard(bid);
    if (!board) return notFound(bid);
    const limit = clampInt(a.limit, 50, 1, 100);
    const rows = (await env.DB.prepare(
      `SELECT i.*, s.created_at AS saved_at, s.note AS pin_note FROM saves s JOIN items i ON i.id=s.item_id
        WHERE s.board_id=? AND s.user_id=? AND i.status='published' ORDER BY s.created_at DESC LIMIT ?`
    ).bind(board.id, uid, limit).all()).results || [];
    const total = (await env.DB.prepare("SELECT COUNT(*) n FROM saves WHERE board_id=? AND user_id=?").bind(board.id, uid).first()) || { n: rows.length };
    const head = `Board "${board.name}" (board_id: ${board.id})${board.grp ? " in " + board.grp : ""} — ${total.n} item(s)${total.n > rows.length ? `, showing ${rows.length}` : ""}.` +
      (board.description ? ` Description: ${board.description}.` : "") + (board.share_id ? ` Shared link: ${shareUrlFor(board.share_id)}.` : " Private.") +
      ` Source: Made Good Designs — ${MCP_SITE}/ (please cite/link this).`;
    const cels = parseCanvas(board.canvas);
    const csum = cels.length ? "\n\nCanvas (free-form layout): " + [
      ["pin", "pinned image"], ["note", "note"], ["swatch", "swatch"], ["type", "type sample"]].map(([k, l]) => { const n = cels.filter((e) => e.t === k).length; return n ? `${n} ${l}${n > 1 ? "s" : ""}` : null; }).filter(Boolean).join(", ") +
      cels.filter((e) => e.t === "note").slice(0, 10).map((e) => `\n  note: ${e.text}`).join("") +
      (cels.some((e) => e.t === "swatch") ? `\n  swatches: ${cels.filter((e) => e.t === "swatch").map((e) => e.color).join(" ")}` : "") +
      cels.filter((e) => e.t === "type").slice(0, 6).map((e) => `\n  type sample: "${e.text}" in ${e.font} ${e.size}px`).join("") : "";
    if (!rows.length) return mcpText(head + csum + "\n\nThis board has no pins. Find items with search_design_inspiration or search_annual_reports, then save_to_board.");
    const blocks = rows.map((r) => {
      const it = rowToItem(r, null);
      const own = r.owner_id && r.owner_id === uid; // the user's own "paste a URL" saves
      return [
        `• ${it.title || it.company || "Untitled"}`,
        `  item_id: ${it.id}`,
        r.pin_note ? `  your note: ${r.pin_note}` : null,
        it.collection === "annual-report" && it.company ? `  company: ${it.company}${it.report_year ? " (" + it.report_year + ")" : ""}` : null,
        it.designer ? `  designer: ${it.designer}` : null,
        it.description ? `  ${it.description}` : null,
        it.tags.length ? `  tags: ${it.tags.join(", ")}` : null,
        it.palette.length ? `  palette: ${it.palette.join(" ")}` : null,
        own ? (r.source_url ? `  saved from (your link): ${r.source_url}` : null)
            : ((it.source || it.source_host) ? `  source: ${it.source || it.source_host}` : null),
        own ? null : `  page (cite this): ${mcpItemPage(it)}`,
        `  image: ${MCP_SITE}${it.image}`,
      ].filter(Boolean).join("\n");
    });
    return mcpText(head + csum + "\n\n" + blocks.join("\n\n"));
  }

  if (name === "create_board") {
    const bname = (a.name == null ? "" : String(a.name)).replace(/[\x00-\x1f\x7f]/g, " ").trim().slice(0, 80);
    if (!bname) return mcpText("Error: a board name is required.", true);
    const n = await env.DB.prepare("SELECT COUNT(*) n FROM boards WHERE user_id=?").bind(uid).first();
    if (n && n.n >= MAX_BOARDS_PER_USER) return mcpText(`Error: you already have ${n.n} boards (limit ${MAX_BOARDS_PER_USER}).`, true);
    const id = genId(), now = Date.now(), grp = cleanGroup(a.group), desc = cleanText(a.description, 300) || null;
    await env.DB.prepare("INSERT INTO boards (id,user_id,name,grp,description,created_at,updated_at) VALUES (?,?,?,?,?,?,?)").bind(id, uid, bname, grp, desc, now, now).run();
    return mcpText(`Created board "${bname}"${grp ? " in " + grp : ""} (board_id: ${id}). Save items to it with save_to_board. View it at ${MCP_SITE}/ (My boards, signed in).`);
  }

  if (name === "save_to_board") {
    const bid = cleanId(a.board_id), iid = cleanId(a.item_id);
    const board = bid && await ownBoard(bid);
    if (!board) return notFound(bid);
    // Curated public items, or the user's OWN private items — never another user's private item.
    const item = iid && await env.DB.prepare("SELECT * FROM items WHERE id=? AND status='published' AND (owner_id IS NULL OR owner_id=?)").bind(iid, uid).first();
    if (!item) return mcpText(`No inspiration item with id "${iid}". Use the item_id from search_design_inspiration, browse_inspiration_by_theme, search_annual_reports or search_museum_art.`, true);
    let already = false;
    const note = a.note === undefined ? undefined : (cleanText(a.note, 500) || null);
    try {
      await env.DB.prepare("INSERT INTO saves (id,board_id,item_id,user_id,created_at,note) VALUES (?,?,?,?,?,?)").bind(genId(), board.id, item.id, uid, Date.now(), note || null).run();
    } catch (e) { already = true; /* UNIQUE(board_id,item_id) */ }
    if (already && note !== undefined) await env.DB.prepare("UPDATE saves SET note=? WHERE board_id=? AND item_id=? AND user_id=?").bind(note, board.id, item.id, uid).run();
    await env.DB.prepare("UPDATE boards SET updated_at=? WHERE id=? AND user_id=?").bind(Date.now(), board.id, uid).run();
    const it = rowToItem(item, null);
    return mcpText(`${already ? (note !== undefined ? "Updated the note on" : "Already on") : "Saved to"} board "${board.name}": ${it.title || it.company || it.id} (item_id: ${it.id})${note ? ` — note: ${note}` : ""}. Page: ${mcpItemPage(it)}`);
  }

  if (name === "update_board") {
    const bid = cleanId(a.board_id);
    const body = {};
    ["name", "group", "description", "shared"].forEach((k) => { if (a[k] !== undefined) body[k] = a[k]; });
    if (body.shared !== undefined) body.shared = body.shared === true || body.shared === "true";
    const b = bid && await applyBoardUpdate(env, uid, bid, body);
    if (!b) return notFound(bid);
    return mcpText(`Board "${b.name}" (board_id: ${b.id}) — group: ${b.grp || "none"}; ${b.description ? "description: " + b.description + "; " : ""}` +
      (b.share_id ? `shared — anyone with this link can view it (read-only): ${shareUrlFor(b.share_id)}` : "private (not shared)."));
  }

  if (name === "add_to_board_canvas") {
    const bid = cleanId(a.board_id);
    const board = bid && await ownBoard(bid);
    if (!board) return notFound(bid);
    const kind = String(a.type || "");
    const els = parseCanvas(board.canvas), y0 = els.length ? canvasBottom(els) + 40 : 0;
    const z = els.reduce((m, e) => Math.max(m, e.z || 0), 0) + 1;
    const added = [];
    if (kind === "note") {
      const text = cleanText(a.text, 1000); if (!text) return mcpText("Error: text is required for a note.", true);
      added.push({ id: genId().slice(0, 12), t: "note", x: 0, y: y0, w: 260, h: Math.min(400, 70 + Math.ceil(text.length / 30) * 20), z, text, color: (Array.isArray(a.colors) && MGDRoles.normHex(String(a.colors[0] || ""))) || "#fff6b3" });
    } else if (kind === "swatches") {
      const cs = (Array.isArray(a.colors) ? a.colors : []).map((c) => MGDRoles.normHex(String(c))).filter(Boolean).slice(0, 12);
      if (!cs.length) return mcpText("Error: pass one or more hex colours in colors.", true);
      cs.forEach((c, i) => added.push({ id: genId().slice(0, 12), t: "swatch", x: i * 130, y: y0, w: 120, h: 120, z: z + i, color: c }));
    } else if (kind === "type") {
      const text = cleanText(a.text, 1000) || "The quick brown fox";
      added.push({ id: genId().slice(0, 12), t: "type", x: 0, y: y0, w: 640, h: 140, z, text, font: cleanText(a.font, 60) || "Inter", size: clampInt(a.size, 48, 8, 240) });
    } else return mcpText("Error: type must be note, swatches or type.", true);
    const r = await writeCanvas(env, uid, board.id, els.concat(added), board.canvas_rev || 0);
    if (r.status === 409) return mcpText("The board was being edited at the same moment — please try again.", true);
    if (r.status !== 200) return mcpText("Error: couldn't update the canvas (it may be too large).", true);
    return mcpText(`Added ${added.length === 1 ? "a " + (kind === "type" ? "type sample" : kind) : added.length + " swatches"} to the canvas of "${board.name}". Open it at ${MCP_SITE}/ (My boards → ${board.name} → Canvas).`);
  }

  if (name === "board_design_system") {
    const bid = cleanId(a.board_id);
    const d = bid && await boardDesign(env, uid, bid);
    if (!d) return notFound(bid);
    if (!d.colors.length) return mcpText(`Board "${d.board.name}" has no colours yet — save some images to it (or add swatches with add_to_board_canvas), then try again.`);
    const rows = MGDRoles.ROLES.map((k) => `| ${MGDRoles.LABELS[k]} | \`${d.light[k].toUpperCase()}\` | \`${d.dark[k].toUpperCase()}\` |`).join("\n");
    let text = `Design system from board "${d.board.name}" (board_id: ${d.board.id}).\n\nBoard colours (most used first): ${d.colors.map((c) => c.hex).join(" ")}\n` +
      `Primary picked from the board: ${d.primary || "none (no strongly coloured references — a neutral palette was used)"}; fonts: ${d.fonts.heading} (headings), ${d.fonts.body} (body).\n\n` +
      `| Role | Light | Dark |\n|---|---|---|\n${rows}\n\n` + (d.notes.length ? d.notes.join(" ") + "\n\n" : "") +
      `All text pairs meet WCAG AA. Edit with previews: ${d.palette_url}\nEdit the DESIGN.md: ${d.design_md_url}`;
    const out = [{ type: "text", text }];
    if (a.include_design_md !== false) {
      out.push({ type: "text", text: MGDDesignMd.build({ name: d.board.name, description: d.board.description || "", productType: "Marketing website", personality: [],
        dark: true, light: d.light, darkColors: d.dark, headingFont: d.fonts.heading, bodyFont: d.fonts.body,
        components: MGDDesignMd.COMPONENTS.map((c) => c[0]), dos: MGDDesignMd.DEFAULT_DO, donts: MGDDesignMd.DEFAULT_DONT }) });
    }
    return { content: out };
  }

  if (name === "remove_from_board") {
    const bid = cleanId(a.board_id), iid = cleanId(a.item_id);
    const board = bid && await ownBoard(bid);
    if (!board) return notFound(bid);
    const r = await env.DB.prepare("DELETE FROM saves WHERE board_id=? AND item_id=? AND user_id=?").bind(board.id, iid, uid).run();
    const removed = r.meta && r.meta.changes > 0;
    return mcpText(removed ? `Removed item ${iid} from board "${board.name}".` : `Item ${iid} was not on board "${board.name}" (nothing changed).`);
  }

  return mcpText("Unknown tool: " + name, true);
}

// ---------------------------------------------------------------------------
// NVIDIA Build (NIM) enrichment — OpenAI-compatible VLM call
// ---------------------------------------------------------------------------

const ENRICH_PROMPT =
  `You are tagging an image for a TYPOGRAPHY and BRAND-DESIGN inspiration gallery. ` +
  `Look at the image and respond with ONLY a compact JSON object, no prose, no markdown fences, with keys:\n` +
  `"title": a 2-5 word title,\n` +
  `"description": one factual sentence describing the design (style, layout, type treatment),\n` +
  `"tags": array of 5-8 lowercase tags (e.g. "serif","wordmark","editorial","minimal","monochrome","logo"),\n` +
  `"style": a single kebab-case category slug like "serif-branding","display-type","editorial-layout","logo-wordmark",\n` +
  `"themes": array of 1-3 curated vibe slugs chosen ONLY from: ` +
  `retro, vintage, minimal, maximal, editorial, brutalist, y2k, monochrome, playful, luxury, hand-drawn, geometric, grunge, corporate.`;

// Annual-report covers: extract DESIGN attributes only. Company/year/designer come from
// curated metadata (a vision model can't read "designed by Chermayeff & Geismar" reliably).
const ANNUAL_PROMPT =
  `You are tagging the COVER of a vintage corporate ANNUAL REPORT for a graphic-design archive. ` +
  `Focus only on the visual design. Respond with ONLY a compact JSON object, no prose, no markdown fences, with keys:\n` +
  `"description": one factual sentence describing the cover design (typography, layout, imagery, colour, era feel),\n` +
  `"tags": array of 5-8 lowercase design tags (e.g. "modernist","serif","grid","photography","duotone","swiss","corporate"),\n` +
  `"style": a single kebab-case design slug like "modernist-cover","swiss-grid","photographic-cover","type-driven",\n` +
  `"themes": array of 1-3 curated vibe slugs chosen ONLY from: ` +
  `retro, vintage, minimal, maximal, editorial, brutalist, y2k, monochrome, playful, luxury, hand-drawn, geometric, grunge, corporate.`;

// Museum artworks: visual design attributes only — title/artist/date come from museum metadata.
const MUSEUM_PROMPT =
  `You are tagging a PUBLIC-DOMAIN MUSEUM ARTWORK for a graphic-design and typography inspiration gallery. ` +
  `Describe only what is visible; do not guess the artist, date or meaning. Respond with ONLY a compact JSON object, no prose, no markdown fences, with keys:\n` +
  `"description": one factual sentence on the visual design (composition, lettering, pattern, colour, technique),\n` +
  `"tags": array of 5-8 lowercase design tags (e.g. "lettering","ornament","woodblock","flat-colour","pattern","poster","border"),\n` +
  `"style": a single kebab-case design slug like "poster-illustration","pattern-repeat","decorative-lettering","print-graphic",\n` +
  `"themes": array of 1-3 curated vibe slugs chosen ONLY from: ` +
  `retro, vintage, minimal, maximal, editorial, brutalist, y2k, monochrome, playful, luxury, hand-drawn, geometric, grunge, corporate.`;

function promptFor(collection) { return collection === "annual-report" ? ANNUAL_PROMPT : collection === "museum" ? MUSEUM_PROMPT : ENRICH_PROMPT; }

// Try the primary vision model, fall back to the secondary on error / 429 / empty result.
// Each model can have its OWN API key (NVIDIA gives a separate key per model page).
async function enrich(imageDataUri, env, collection) {
  const NV = env.NVIDIA_BASE_URL;
  const prompt = promptFor(collection);
  const attempts = [
    { model: env.NVIDIA_MODEL, key: env.NVIDIA_API_KEY, base: NV },
    { model: env.NVIDIA_MODEL_FALLBACK, key: env.NVIDIA_API_KEY_FALLBACK || env.NVIDIA_API_KEY, base: NV },
    // Final fallback: OpenAI vision (only if OPENAI_API_KEY is set) — resilient to NVIDIA throttling.
    { model: env.OPENAI_MODEL || "gpt-4o-mini", key: env.OPENAI_API_KEY, base: "https://api.openai.com/v1" },
  ].filter((a) => a.model && a.key && a.base);
  if (!attempts.length) throw new Error("no model/key configured");
  let lastErr;
  for (const a of attempts) {
    try {
      const r = await callModel(a.model, a.key, a.base, imageDataUri, prompt);
      if (r && (r.description || (Array.isArray(r.tags) && r.tags.length))) { r._model = a.model; return r; }
      lastErr = new Error(`empty result from ${a.model}`);
    } catch (e) {
      lastErr = e; // 429s / HTTP errors — move on to the next tier
    }
  }
  throw lastErr || new Error("enrichment failed");
}

async function callModel(model, apiKey, baseUrl, imageDataUri, prompt) {
  const body = {
    model,
    messages: [{
      role: "user",
      content: [
        { type: "text", text: prompt || ENRICH_PROMPT },
        { type: "image_url", image_url: { url: imageDataUri } },
      ],
    }],
    max_tokens: 400,
    temperature: 0.2,
  };
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 45000); // don't hang forever on a slow model
  let res;
  try {
    res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(body),
      signal: ctl.signal,
    });
  } finally {
    clearTimeout(t);
  }
  if (!res.ok) throw new Error(`${model} ${res.status}: ${(await res.text()).slice(0, 160)}`);
  const data = await res.json();
  return parseJsonLoose(data?.choices?.[0]?.message?.content || "");
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function rowToItem(r, env) {
  const collection = r.collection || "design";
  const item = {
    id: r.id,
    title: r.title || "",
    description: r.description || "",
    source_host: r.source_host || "",   // NOTE: for the design gallery, source is shown as PLAIN TEXT; source_url is NOT exposed
    image: `/img/${r.image_key}`,
    width: r.width || null,
    height: r.height || null,
    tags: safeArr(r.tags),
    themes: safeArr(r.themes),
    palette: safeArr(r.palette),
    style: r.style || null,
    designer: r.designer || null,   // design gallery: photographer credit (shown plain-text, no link)
    collection,
    category: r.category || null,   // discipline tab (spans collections)
    created_at: r.created_at,
  };
  // Annual-report collection: plain-text source + curated facets. We do NOT expose an
  // outbound link — source_url stays server-side (dedup/provenance); only the plain-text
  // source name is shown (matches the design gallery's no-link attribution model).
  if (collection === "annual-report") {
    item.source = prettySource(r.source_host);
    item.company = r.company || null;
    item.report_year = r.report_year || null;
    item.designer = r.designer || null;
    item.industry = r.industry || null;
    item.country = r.country || null;
  }
  // Museum collection: public-domain works — we credit the museum AND link to its object page.
  if (collection === "museum") {
    item.museum = r.company || null;
    item.artist = r.designer || null;
    item.year = r.report_year || null;
    item.type = r.industry || null;
    item.culture = r.country || null;
    item.theme = r.category || null;
    item.source = r.company || prettySource(r.source_host);
    item.source_link = r.source_url || null;
    item.license = /^(Rijksmuseum|Statens Museum for Kunst|Nationalmuseum Sweden|Slovak National Gallery|The Norwegian Museum of Cultural History|Albertina|Mauritshuis)$/.test(r.company || "") ? "Public Domain Mark" : "CC0";
  }
  // UI screens: original MGD designs with code + DESIGN.md (see ui_screens.js for the field mapping)
  if (collection === "ui") Object.assign(item, uiFields(r));
  return item;
}

// Helpers handed to ui_screens.js (pages render with the same chrome as the museum pages).
// Collection sitemaps listed in /sitemap_index.xml (paths under the mount base). Add new collections here.
const WORKER_SITEMAPS = ["/ui/sitemap.xml", "/museum/sitemap.xml", "/annual-reports/sitemap.xml"];
const UI_H = { escHtml, GTAG, themeify, saveWidget, backLink, edgeCache, rowToItem };

function safeArr(s) { try { const v = JSON.parse(s || "[]"); return Array.isArray(v) ? v : []; } catch (_) { return []; } }

// MCP usage stats (admin): totals, per-tool, per-day (30d), top queries.
async function mcpStats(request, env) {
  if (!isAdmin(request, env)) return json({ error: "unauthorized" }, 401, env, request);
  const day = 86400000, now = Date.now();
  const total = (await env.DB.prepare("SELECT COUNT(*) n FROM mcp_calls").first()) || { n: 0 };
  const last30 = (await env.DB.prepare("SELECT COUNT(*) n FROM mcp_calls WHERE created_at > ?").bind(now - 30 * day).first()) || { n: 0 };
  const last7 = (await env.DB.prepare("SELECT COUNT(*) n FROM mcp_calls WHERE created_at > ?").bind(now - 7 * day).first()) || { n: 0 };
  const byTool = (await env.DB.prepare("SELECT tool, COUNT(*) n FROM mcp_calls GROUP BY tool ORDER BY n DESC").all()).results || [];
  const perDay = (await env.DB.prepare(
    "SELECT CAST((created_at)/? AS INT) d, COUNT(*) n FROM mcp_calls WHERE created_at > ? GROUP BY d ORDER BY d DESC").bind(day, now - 30 * day).all()).results || [];
  const topQueries = (await env.DB.prepare(
    "SELECT query, COUNT(*) n FROM mcp_calls WHERE query<>'' GROUP BY query ORDER BY n DESC LIMIT 25").all()).results || [];
  const distinctClients = (await env.DB.prepare(
    "SELECT COUNT(DISTINCT ip) n FROM mcp_calls WHERE ip<>'' AND created_at > ?").bind(now - 30 * day).first()) || { n: 0 };
  const byClient = (await env.DB.prepare(
    "SELECT ip, COUNT(*) n, MAX(created_at) last FROM mcp_calls WHERE ip<>'' AND created_at > ? GROUP BY ip ORDER BY n DESC LIMIT 25").bind(now - 30 * day).all()).results || [];
  const days = perDay.map((r) => ({ date: new Date(r.d * day).toISOString().slice(0, 10), calls: r.n }));
  return json({ total: total.n, last_30d: last30.n, last_7d: last7.n,
    distinct_clients_30d: distinctClients.n,
    by_tool: byTool.map((r) => ({ tool: r.tool, calls: r.n })),
    by_client_30d: byClient.map((r) => ({ ip: r.ip, calls: r.n, last: new Date(r.last).toISOString() })),
    per_day_30d: days, top_queries: topQueries.map((r) => ({ query: r.query, calls: r.n })) }, 200, env, request);
}

// ---- Newsletter subscribers (anonymous email capture) ----
async function subscribe(request, env) {
  let email = "", source = "", hp = "";
  const ct = request.headers.get("Content-Type") || "";
  if (ct.includes("application/json")) {
    const b = await request.json().catch(() => ({}));
    email = b.email; source = b.source; hp = b.hp || b.website || "";
  } else {
    const f = await request.formData().catch(() => null);
    if (f) { email = f.get("email"); source = f.get("source"); hp = f.get("hp") || f.get("website") || ""; }
  }
  // Honeypot: a filled hidden field = bot → pretend success, store nothing.
  if (hp) return json({ ok: true }, 200, env, request);
  email = String(email || "").trim().toLowerCase();
  if (email.length > 254 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
    return json({ ok: false, error: "invalid_email" }, 400, env, request);
  const src = String(source || "").slice(0, 40) || "unknown";
  try {
    await env.DB.prepare(
      "INSERT OR IGNORE INTO subscribers (id,email,source,status,confirm_token,created_at) VALUES (?,?,?,?,?,?)"
    ).bind(genId(), email, src, "subscribed", genId() + genId(), Date.now()).run();
  } catch (_) { /* dupe/transient — don't leak, still return ok */ }
  return json({ ok: true }, 200, env, request);
}

async function subscriberStats(request, env) {
  if (!isAdmin(request, env)) return json({ error: "unauthorized" }, 401, env, request);
  const day = 86400000, now = Date.now();
  const one = async (sql, ...b) => (await env.DB.prepare(sql).bind(...b).first())?.n ?? 0;
  const total = await one("SELECT COUNT(*) n FROM subscribers");
  const last7 = await one("SELECT COUNT(*) n FROM subscribers WHERE created_at > ?", now - 7 * day);
  const last30 = await one("SELECT COUNT(*) n FROM subscribers WHERE created_at > ?", now - 30 * day);
  const bySource = (await env.DB.prepare("SELECT source, COUNT(*) n FROM subscribers GROUP BY source ORDER BY n DESC").all()).results || [];
  return json({ total, last_7d: last7, last_30d: last30, by_source: bySource.map((r) => ({ source: r.source, count: r.n })) }, 200, env, request);
}

async function exportSubscribers(request, env) {
  if (!isAdmin(request, env)) return json({ error: "unauthorized" }, 401, env, request);
  const rows = await env.DB.prepare("SELECT email,source,status,created_at FROM subscribers ORDER BY created_at DESC").all();
  const lines = ["email,source,status,created_at"];
  (rows.results || []).forEach((r) => lines.push([csv(r.email), csv(r.source), csv(r.status), csv(isoOrEmpty(r.created_at))].join(",")));
  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="mgd-subscribers.csv"', ...corsHeaders(env, request) },
  });
}

function isAdmin(request, env) {
  const h = request.headers.get("Authorization") || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : "";
  return !!env.ADMIN_TOKEN && token === env.ADMIN_TOKEN;
}

// Backfill vision enrichment on an item that was bulk-ingested with skip_enrich
// (fills description/tags/themes/style from its stored thumbnail). Idempotent: skips
// items that already have a description. One item per request (enrich is a slow subrequest).
async function reenrich(request, env) {
  if (!isAdmin(request, env)) return json({ error: "unauthorized" }, 401, env, request);
  const body = await request.json().catch(() => ({}));
  const id = (body && body.id || "").toString();
  if (!id) return json({ error: "no_id" }, 400, env, request);
  const row = await env.DB.prepare(
    "SELECT id, image_key, collection, description FROM items WHERE id=? AND status='published'"
  ).bind(id).first();
  if (!row) return json({ error: "not_found" }, 404, env, request);
  if (row.description && row.description.trim()) return json({ ok: true, skipped: "has_description" }, 200, env, request);
  const obj = await env.BUCKET.get(row.image_key);
  if (!obj) return json({ error: "no_image" }, 404, env, request);
  const bytes = new Uint8Array(await obj.arrayBuffer());
  let enriched;
  try {
    enriched = await enrich(bytesToDataUri(bytes, "image/jpeg"), env, row.collection || "annual-report");
  } catch (e) {
    return json({ ok: false, error: "enrich_failed", detail: String(e && e.message || e) }, 200, env, request);
  }
  await env.DB.prepare("UPDATE items SET description=?, tags=?, themes=?, style=? WHERE id=?").bind(
    enriched.description || "",
    JSON.stringify(Array.isArray(enriched.tags) ? enriched.tags.slice(0, 12) : []),
    JSON.stringify(Array.isArray(enriched.themes) ? enriched.themes.slice(0, 6) : []),
    enriched.style || null, id
  ).run();
  return json({ ok: true, model: enriched._model || null }, 200, env, request);
}

function genId() {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 12);
}

// Sortable color key from a palette's dominant color, for the "by colour" rainbow sort.
// Chromatic covers sort 0..359 by hue; near-neutral (grey/black/white) covers cluster
// after them (1000 + lightness) so they don't scatter through the spectrum.
function hueOf(palette) {
  let hexes = palette;
  if (typeof hexes === "string") { try { hexes = JSON.parse(hexes); } catch (_) { hexes = []; } }
  if (!Array.isArray(hexes) || !hexes.length) return null;
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hexes[0]).trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  const r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  const l = (max + min) / 2;
  const sat = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  if (sat < 0.12) return 1000 + l * 100; // near-neutral → cluster at the end, dark→light
  let h;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  h *= 60; if (h < 0) h += 360;
  return h;
}

function hostOf(u) {
  if (!u) return "";
  try { return new URL(u).hostname.replace(/^www\./, ""); } catch (_) { return ""; }
}

function bytesToDataUri(bytes, type) {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return `data:${type || "image/jpeg"};base64,${btoa(bin)}`;
}

function parseJsonLoose(text) {
  if (!text) return {};
  let t = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  const a = t.indexOf("{"), b = t.lastIndexOf("}");
  if (a >= 0 && b > a) t = t.slice(a, b + 1);
  try { return JSON.parse(t); } catch (_) { return {}; }
}

function clampInt(v, def, min, max) {
  const n = parseInt(v, 10);
  if (isNaN(n)) return def;
  return Math.max(min, Math.min(max, n));
}

function corsHeaders(env, request) {
  const origin = request.headers.get("Origin") || "";
  const allowed = env.ALLOWED_ORIGIN || "*";
  // Reflect the configured origin, or localhost during dev.
  const allow = (origin && (origin === allowed || /^https?:\/\/localhost(:\d+)?$/.test(origin) || /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)))
    ? origin : allowed;
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Authorization,Content-Type",
    "Access-Control-Allow-Credentials": "true",
    "Vary": "Origin",
  };
}

// Edge-cache a public read response in Cloudflare's colo cache (Cache API), keyed on
// the URL only — these endpoints are auth-agnostic and identical for all anonymous
// visitors, so this collapses repeat D1 reads into ~one query per TTL window. The
// cached responses keep their `Vary: Origin` header, so cross-origin CORS stays correct.
async function edgeCache(request, ctx, ttl, handlerFn) {
  const cache = caches.default;
  const key = new Request(new URL(request.url).toString(), { method: "GET" });
  const hit = await cache.match(key);
  if (hit) return hit;
  const resp = await handlerFn();
  // Empty results are never edge-cached (a transient D1 hiccup or a just-published item must not look like "nothing" for the TTL).
  if (resp && resp.headers.get("X-MGD-No-Edge-Cache")) { resp.headers.delete("X-MGD-No-Edge-Cache"); return resp; }
  if (resp && resp.status === 200) {
    const cached = new Response(resp.body, resp);
    cached.headers.set("Cache-Control", `public, s-maxage=${ttl}, max-age=${ttl}`);
    if (ctx && ctx.waitUntil) ctx.waitUntil(cache.put(key, cached.clone()));
    return cached;
  }
  return resp;
}

function noEdgeIfEmpty(resp, items) {
  if (!items || !items.length) resp.headers.set("X-MGD-No-Edge-Cache", "1");
  return resp;
}

function json(obj, status, env, request) {
  const headers = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" };
  if (env && request) Object.assign(headers, corsHeaders(env, request));
  return new Response(JSON.stringify(obj), { status: status || 200, headers });
}

function injectBase(htmlStr, base) {
  // Front-end reads window.MGD_API_BASE and prefixes it to /api and /img URLs.
  // "" => same-origin root; "/inspiration" => same-origin under a route mount.
  return htmlStr.replace("</head>", `<script>window.MGD_API_BASE=${JSON.stringify(base || "")};</script>\n</head>`);
}


// ---- Light / dark theme (user choice, remembered in localStorage; light is the default) ----
const THEME_HEAD = `<script>try{if(localStorage.getItem("mgd-theme")==="dark")document.documentElement.setAttribute("data-theme","dark")}catch(e){}</script>
<style>:root[data-theme=dark]{--bg:#0f0f0f;--surface:#171717;--border:#2a2a2a;--border-strong:#3a3a3a;--text:#f5f5f5;--muted:#a3a3a3;--accent:#f5f5f5;--on-accent:#171717;--accent-hover:#d4d4d4;--imgbg:#1f1f1f;--tag:#1f1f1f;--text-2:#d4d4d4;color-scheme:dark}
:root[data-theme=dark] .backbtn{background:var(--surface)!important;color:var(--text)!important;border-color:var(--border-strong)!important}
.mgd-theme-toggle{position:fixed;left:14px;bottom:14px;z-index:9990;display:inline-flex;align-items:center;gap:.4em;font:600 12px/1 system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;padding:.55em .9em;border-radius:999px;border:1px solid var(--border-strong,#d4d4d4);background:var(--surface,#fff);color:var(--text,#171717);cursor:pointer;box-shadow:0 2px 10px rgba(0,0,0,.12)}
.mgd-theme-toggle:hover{border-color:var(--text,#171717)}@media print{.mgd-theme-toggle{display:none}}</style>`;
const THEME_TOGGLE = `<button type="button" class="mgd-theme-toggle" aria-label="Switch light or dark mode"></button>
<script>(function(){var b=document.querySelector(".mgd-theme-toggle"),r=document.documentElement;function lab(){var d=r.getAttribute("data-theme")==="dark";b.textContent=d?"☀ Light mode":"☾ Dark mode";b.setAttribute("aria-pressed",String(d))}b.onclick=function(){var d=r.getAttribute("data-theme")!=="dark";if(d)r.setAttribute("data-theme","dark");else r.removeAttribute("data-theme");try{localStorage.setItem("mgd-theme",d?"dark":"light")}catch(e){}lab()};lab()})();</script>`;
function themeify(body) {
  if (typeof body !== "string" || body.indexOf("</head>") < 0 || body.indexOf("mgd-theme-toggle") >= 0) return body;
  body = body.replace("</head>", THEME_HEAD + "</head>");
  const i = body.lastIndexOf("</body>");
  return i < 0 ? body + THEME_TOGGLE : body.slice(0, i) + THEME_TOGGLE + body.slice(i);
}
function html(body) {
  return new Response(themeify(body), { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache" } });
}
