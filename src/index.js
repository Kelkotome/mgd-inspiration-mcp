// MGD Inspiration — Cloudflare Worker
// Routes: gallery (/), curation UI (/add), image serving (/img/*), JSON API (/api/*).
// Data in D1 (env.DB), images in R2 (env.BUCKET). Enrichment via NVIDIA Build (NIM).

import GALLERY_HTML from "./ui/gallery.html";
import ADD_HTML from "./ui/add.html";
import { getUser, googleLogin, googleCallback, logout, devLogin } from "./auth.js";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const method = request.method;
    // Optional mount prefix so the Worker can live at e.g. madegooddesigns.com/inspiration
    // via a Cloudflare route. Default "" = mounted at root (workers.dev).
    const base = (env.BASE_PATH || "").replace(/\/$/, "");
    let path = url.pathname;
    if (base && path.startsWith(base)) path = path.slice(base.length) || "/";

    // CORS preflight for the API (gallery may be embedded on the WP site, cross-origin).
    if (method === "OPTIONS" && path.startsWith("/api/")) {
      return new Response(null, { status: 204, headers: corsHeaders(env, request) });
    }

    try {
      // ---- Pages (inject the mount base so the front-end builds correct URLs) ----
      if (path === "/" && method === "GET") return html(injectBase(GALLERY_HTML, base));
      if (path === "/add" && method === "GET") return html(injectBase(ADD_HTML, base));

      // ---- MCP server (public, for AI assistants) ----
      if (path === "/mcp") return mcpHandler(request, env);

      // ---- Auth (return Response directly) ----
      if (path === "/auth/google/login" && method === "GET") return googleLogin(request, url, env, base);
      if (path === "/auth/google/callback" && method === "GET") return googleCallback(request, url, env, base);
      if (path === "/auth/logout") return logout(url, base);
      if (path === "/auth/dev-login" && method === "GET") return devLogin(request, url, env, base);

      // ---- Image serving from R2 ----
      if (path.startsWith("/img/") && method === "GET") return serveImage(path.slice(5), env);

      // ---- Content API ----
      if (path === "/api/items" && method === "POST") return addItem(request, env);
      if (path === "/api/feed" && method === "GET") return feed(url, env, request);
      if (path === "/api/search" && method === "GET") return search(url, env, request);
      if (path.startsWith("/api/item/") && method === "GET") return getItem(path.slice(10), env, request);
      if (path.startsWith("/api/items/") && method === "DELETE") return removeItem(path.slice(11), request, env);

      // ---- Account + boards API ----
      if (path === "/api/me" && method === "GET") return meHandler(request, env);
      if (path === "/api/me/newsletter" && method === "POST") return setNewsletter(request, env);
      if (path === "/api/boards" && method === "GET") return listBoards(request, env);
      if (path === "/api/boards" && method === "POST") return createBoard(request, env);
      if (path.match(/^\/api\/boards\/[^/]+\/add-url$/) && method === "POST") return addUrlToBoard(path.split("/")[3], request, env);
      if (path.match(/^\/api\/boards\/[^/]+\/saves$/) && method === "POST") return saveToBoard(path.split("/")[3], request, env);
      if (path.match(/^\/api\/boards\/[^/]+\/saves\/[^/]+$/) && method === "DELETE") { const s = path.split("/"); return unsave(s[3], s[5], request, env); }
      if (path.match(/^\/api\/boards\/[^/]+$/) && method === "GET") return getBoard(path.split("/")[3], request, env);
      if (path.match(/^\/api\/boards\/[^/]+$/) && method === "DELETE") return deleteBoard(path.split("/")[3], request, env);

      // ---- Admin ----
      if (path === "/api/admin/export/users.csv" && method === "GET") return exportUsers(request, env);

      return json({ error: "not_found" }, 404, env, request);
    } catch (err) {
      return json({ error: "server_error", message: String(err && err.message || err) }, 500, env, request);
    }
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

  if (!file || typeof file === "string") return json({ error: "no_image" }, 400, env, request);

  // Dedup guard: never add the same source twice (checked before any R2/AI cost).
  if (sourceUrl) {
    const dup = await env.DB.prepare("SELECT id FROM items WHERE source_url=? AND status='published' LIMIT 1").bind(sourceUrl).first();
    if (dup) return json({ ok: false, duplicate: true, error: "duplicate_source" }, 200, env, request);
  }

  const id = genId();
  const ext = (file.type && file.type.includes("png")) ? "png" : "jpg";
  const key = `items/${id}.${ext}`;
  const bytes = new Uint8Array(await file.arrayBuffer());
  await env.BUCKET.put(key, bytes, { httpMetadata: { contentType: file.type || "image/jpeg" } });

  // Enrich (best-effort — never block a save on the model).
  let ai = { description: "", tags: [], style: styleIn || null, title: titleIn || null, themes: themesIn };
  try {
    const enriched = await enrich(probeB64 ? String(probeB64) : bytesToDataUri(bytes, file.type), env);
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
    `INSERT INTO items (id,title,description,source_url,source_host,image_key,width,height,tags,themes,palette,style,status,created_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,'published',?)`
  ).bind(
    id, ai.title, ai.description, sourceUrl || null, host, key, width, height,
    JSON.stringify(ai.tags), JSON.stringify(ai.themes || []), JSON.stringify(palette), ai.style, now
  ).run();

  return json({ ok: true, item: rowToItem({
    id, title: ai.title, description: ai.description, source_url: sourceUrl, source_host: host,
    image_key: key, width, height, tags: JSON.stringify(ai.tags), themes: JSON.stringify(ai.themes || []),
    palette: JSON.stringify(palette), style: ai.style, created_at: now,
  }, env), enrich_error: ai.enrich_error || null, enrich_model: ai.model || null }, 200, env, request);
}

async function feed(url, env, request) {
  const limit = clampInt(url.searchParams.get("limit"), 24, 1, 60);
  const style = (url.searchParams.get("style") || "").trim();
  const theme = (url.searchParams.get("theme") || "").trim();
  const cursor = parseInt(url.searchParams.get("cursor"), 10) || null; // created_at of last seen

  const where = ["status = 'published'", "owner_id IS NULL"]; // public feed = curated only
  const binds = [];
  if (style) { where.push("style = ?"); binds.push(style); }
  if (theme) { where.push("themes LIKE ?"); binds.push(`%"${theme}"%`); }
  if (cursor) { where.push("created_at < ?"); binds.push(cursor); }

  const rows = await env.DB.prepare(
    `SELECT * FROM items WHERE ${where.join(" AND ")} ORDER BY created_at DESC LIMIT ?`
  ).bind(...binds, limit).all();

  const items = (rows.results || []).map((r) => rowToItem(r, env));
  const nextCursor = items.length === limit ? items[items.length - 1].created_at : null;
  return json({ items, nextCursor }, 200, env, request);
}

async function search(url, env, request) {
  const q = (url.searchParams.get("q") || "").trim();
  const limit = clampInt(url.searchParams.get("limit"), 40, 1, 60);
  if (!q) return json({ items: [] }, 200, env, request);
  const like = `%${q}%`;
  const rows = await env.DB.prepare(
    `SELECT * FROM items WHERE status='published' AND owner_id IS NULL AND (title LIKE ? OR description LIKE ? OR tags LIKE ?)
     ORDER BY created_at DESC LIMIT ?`
  ).bind(like, like, like, limit).all();
  return json({ items: (rows.results || []).map((r) => rowToItem(r, env)) }, 200, env, request);
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
  const rows = await env.DB.prepare(
    `SELECT b.id,b.name,b.created_at,
       (SELECT COUNT(*) FROM saves s WHERE s.board_id=b.id) AS count,
       (SELECT i.image_key FROM saves s JOIN items i ON i.id=s.item_id WHERE s.board_id=b.id ORDER BY s.created_at DESC LIMIT 1) AS cover
     FROM boards b WHERE b.user_id=? ORDER BY b.created_at DESC`
  ).bind(user.id).all();
  const boards = (rows.results || []).map((b) => ({ id: b.id, name: b.name, count: b.count || 0, cover: b.cover ? `/img/${b.cover}` : null, created_at: b.created_at }));
  return json({ boards }, 200, env, request);
}

async function createBoard(request, env) {
  const user = await getUser(request, env);
  if (!user) return json({ error: "unauthorized" }, 401, env, request);
  const body = await request.json().catch(() => ({}));
  const name = (body.name || "").toString().trim().slice(0, 80) || "Untitled board";
  const id = genId();
  await env.DB.prepare("INSERT INTO boards (id,user_id,name,created_at) VALUES (?,?,?,?)").bind(id, user.id, name, Date.now()).run();
  return json({ ok: true, board: { id, name, count: 0, cover: null } }, 200, env, request);
}

async function saveToBoard(boardId, request, env) {
  const user = await getUser(request, env);
  if (!user) return json({ error: "unauthorized" }, 401, env, request);
  const board = await env.DB.prepare("SELECT id FROM boards WHERE id=? AND user_id=?").bind(boardId, user.id).first();
  if (!board) return json({ error: "not_found" }, 404, env, request);
  const body = await request.json().catch(() => ({}));
  const itemId = (body.item_id || "").toString();
  const item = await env.DB.prepare("SELECT id FROM items WHERE id=? AND status='published'").bind(itemId).first();
  if (!item) return json({ error: "bad_item" }, 400, env, request);
  try {
    await env.DB.prepare("INSERT INTO saves (id,board_id,item_id,user_id,created_at) VALUES (?,?,?,?,?)").bind(genId(), boardId, itemId, user.id, Date.now()).run();
  } catch (e) { /* UNIQUE(board_id,item_id) — already saved; ignore */ }
  return json({ ok: true }, 200, env, request);
}

const BROWSER_UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36";
// madegooddesigns.com's WAF 502s Mozilla UAs — use a curl UA for our own host, browser UA elsewhere.
function uaFor(u) { try { return /(^|\.)madegooddesigns\.com$/i.test(new URL(u).hostname) ? "curl/8.4.0" : BROWSER_UA; } catch (e) { return BROWSER_UA; } }

async function addUrlToBoard(boardId, request, env) {
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

  let tags = [], description = meta.description || "", title = meta.title || "";
  try {
    const enriched = await enrich(bytesToDataUri(imgBytes, contentType), env);
    if (Array.isArray(enriched.tags)) tags = enriched.tags.slice(0, 12);
    if (!description) description = enriched.description || "";
    if (!title) title = enriched.title || "";
  } catch (e) { /* keep og metadata */ }

  const now = Date.now();
  const host = hostOf(pageUrl);
  await env.DB.prepare(
    `INSERT INTO items (id,title,description,source_url,source_host,image_key,width,height,tags,themes,palette,style,owner_id,status,created_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,'[]',NULL,?,'published',?)`
  ).bind(id, title || host, description, pageUrl, host, key, meta.width || null, meta.height || null,
         JSON.stringify(tags), "[]", user.id, now).run();
  try {
    await env.DB.prepare("INSERT INTO saves (id,board_id,item_id,user_id,created_at) VALUES (?,?,?,?,?)").bind(genId(), boardId, id, user.id, now).run();
  } catch (e) {}

  return json({ ok: true, item: rowToItem({ id, title: title || host, description, source_host: host, image_key: key,
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
  const board = await env.DB.prepare("SELECT id,user_id,name FROM boards WHERE id=?").bind(boardId).first();
  if (!board) return json({ error: "not_found" }, 404, env, request);
  if (!user || user.id !== board.user_id) return json({ error: "unauthorized" }, 401, env, request); // private for now
  const rows = await env.DB.prepare(
    `SELECT i.* FROM saves s JOIN items i ON i.id=s.item_id WHERE s.board_id=? AND i.status='published' ORDER BY s.created_at DESC`
  ).bind(boardId).all();
  return json({ board: { id: board.id, name: board.name }, items: (rows.results || []).map((r) => rowToItem(r, env)) }, 200, env, request);
}

async function deleteBoard(boardId, request, env) {
  const user = await getUser(request, env);
  if (!user) return json({ error: "unauthorized" }, 401, env, request);
  await env.DB.prepare("DELETE FROM saves WHERE board_id=? AND user_id=?").bind(boardId, user.id).run();
  await env.DB.prepare("DELETE FROM boards WHERE id=? AND user_id=?").bind(boardId, user.id).run();
  return json({ ok: true }, 200, env, request);
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
const MCP_THEMES = ["retro","vintage","minimal","maximal","editorial","brutalist","y2k","monochrome","playful","luxury","hand-drawn","geometric","grunge","corporate"];

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
  },
  {
    name: "list_inspiration_themes",
    description: "List the curated design-inspiration themes (categories) available in the Made Good Designs gallery, with how many items each has.",
    inputSchema: { type: "object", properties: {} },
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
  },
];

function mcpCors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "content-type,mcp-session-id,mcp-protocol-version,authorization,accept",
  };
}
function mcpJson(obj, status) {
  return new Response(obj == null ? "" : JSON.stringify(obj), {
    status: status || (obj == null ? 202 : 200),
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...mcpCors() },
  });
}
const rpcOk = (id, result) => ({ jsonrpc: "2.0", id, result });
const rpcErr = (id, code, message) => ({ jsonrpc: "2.0", id, error: { code, message } });

async function mcpHandler(request, env) {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: mcpCors() });
  if (request.method === "GET") {
    return mcpJson({ name: "MGD Inspiration", version: "1.0", transport: "streamable-http", endpoint: `${MCP_SITE}/mcp` });
  }
  if (request.method !== "POST") return new Response("method not allowed", { status: 405, headers: mcpCors() });

  let body;
  try { body = await request.json(); } catch (e) { return mcpJson(rpcErr(null, -32700, "Parse error")); }

  const handle = async (msg) => {
    if (!msg || typeof msg !== "object") return null;
    const { id, method, params } = msg;
    if (method === "initialize") {
      const pv = (params && params.protocolVersion) || "2025-06-18";
      return rpcOk(id, { protocolVersion: pv, capabilities: { tools: { listChanged: false } },
        serverInfo: { name: "MGD Inspiration", version: "1.0" },
        instructions: "Curated typography & brand-design inspiration from Made Good Designs (madegooddesigns.com). Cite the source links in results." });
    }
    if (typeof method === "string" && method.startsWith("notifications/")) return null; // notifications: no reply
    if (method === "ping") return rpcOk(id, {});
    if (method === "tools/list") return rpcOk(id, { tools: MCP_TOOLS });
    if (method === "tools/call") {
      try { return rpcOk(id, await mcpCallTool(params || {}, env)); }
      catch (e) { return rpcOk(id, { content: [{ type: "text", text: "Error: " + (e && e.message || e) }], isError: true }); }
    }
    return rpcErr(id, -32601, "Method not found: " + method);
  };

  if (Array.isArray(body)) {
    const out = (await Promise.all(body.map(handle))).filter(Boolean);
    return out.length ? mcpJson(out) : mcpJson(null);
  }
  const res = await handle(body);
  return res ? mcpJson(res) : mcpJson(null);
}

async function mcpCallTool(params, env) {
  const name = params.name;
  const a = params.arguments || {};
  if (name === "search_design_inspiration") {
    const q = (a.query || "").toString().trim();
    const limit = clampInt(a.limit, 8, 1, 20);
    const binds = ["published"];
    let where = "status=? AND owner_id IS NULL";
    if (a.theme) { where += " AND themes LIKE ?"; binds.push(`%"${a.theme}"%`); }
    if (q) { const like = `%${q}%`; where += " AND (title LIKE ? OR description LIKE ? OR tags LIKE ?)"; binds.push(like, like, like); }
    const rows = await env.DB.prepare(`SELECT * FROM items WHERE ${where} ORDER BY created_at DESC LIMIT ?`).bind(...binds, limit).all();
    return mcpItems(rows.results || [], `${(rows.results||[]).length} design-inspiration result(s) for "${q}"${a.theme ? " in theme "+a.theme : ""}`);
  }
  if (name === "list_inspiration_themes") {
    const rows = await env.DB.prepare(`SELECT themes FROM items WHERE status='published' AND owner_id IS NULL`).all();
    const counts = {};
    (rows.results || []).forEach((r) => safeArr(r.themes).forEach((t) => { counts[t] = (counts[t] || 0) + 1; }));
    const lines = MCP_THEMES.map((t) => `- ${t}: ${counts[t] || 0} items  (${MCP_SITE}/?theme=${t})`);
    return { content: [{ type: "text", text: `Curated design-inspiration themes at Made Good Designs (${MCP_SITE}/):\n` + lines.join("\n") }] };
  }
  if (name === "browse_inspiration_by_theme") {
    const theme = (a.theme || "").toString().trim();
    const limit = clampInt(a.limit, 10, 1, 20);
    const rows = await env.DB.prepare(`SELECT * FROM items WHERE status='published' AND owner_id IS NULL AND themes LIKE ? ORDER BY created_at DESC LIMIT ?`).bind(`%"${theme}"%`, limit).all();
    return mcpItems(rows.results || [], `${(rows.results||[]).length} item(s) in theme "${theme}"`);
  }
  return { content: [{ type: "text", text: "Unknown tool: " + name }], isError: true };
}

function mcpItems(rows, header) {
  if (!rows.length) return { content: [{ type: "text", text: header + ". No matches — try a broader query or a different theme. Browse all at " + MCP_SITE + "/" }] };
  const blocks = rows.map((r) => {
    const it = rowToItem(r, null);
    return [
      `• ${it.title || "Untitled"}`,
      it.description ? `  ${it.description}` : null,
      it.tags.length ? `  tags: ${it.tags.join(", ")}` : null,
      it.themes.length ? `  themes: ${it.themes.join(", ")}` : null,
      it.palette.length ? `  palette: ${it.palette.join(" ")}` : null,
      it.source_host ? `  source: ${it.source_host}` : null,
      `  image: ${MCP_SITE}${it.image}`,
    ].filter(Boolean).join("\n");
  });
  const text = `${header}. Source: Made Good Designs — ${MCP_SITE}/ (please cite/link this).\n\n` + blocks.join("\n\n");
  return { content: [{ type: "text", text }] };
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

// Try the primary vision model, fall back to the secondary on error / 429 / empty result.
// Each model can have its OWN API key (NVIDIA gives a separate key per model page).
async function enrich(imageDataUri, env) {
  const NV = env.NVIDIA_BASE_URL;
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
      const r = await callModel(a.model, a.key, a.base, imageDataUri);
      if (r && (r.description || (Array.isArray(r.tags) && r.tags.length))) { r._model = a.model; return r; }
      lastErr = new Error(`empty result from ${a.model}`);
    } catch (e) {
      lastErr = e; // 429s / HTTP errors — move on to the next tier
    }
  }
  throw lastErr || new Error("enrichment failed");
}

async function callModel(model, apiKey, baseUrl, imageDataUri) {
  const body = {
    model,
    messages: [{
      role: "user",
      content: [
        { type: "text", text: ENRICH_PROMPT },
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
  return {
    id: r.id,
    title: r.title || "",
    description: r.description || "",
    source_host: r.source_host || "",   // NOTE: source shown as plain text; source_url is NOT exposed to the public API
    image: `/img/${r.image_key}`,
    width: r.width || null,
    height: r.height || null,
    tags: safeArr(r.tags),
    themes: safeArr(r.themes),
    palette: safeArr(r.palette),
    style: r.style || null,
    created_at: r.created_at,
  };
}

function safeArr(s) { try { const v = JSON.parse(s || "[]"); return Array.isArray(v) ? v : []; } catch (_) { return []; } }

function isAdmin(request, env) {
  const h = request.headers.get("Authorization") || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : "";
  return !!env.ADMIN_TOKEN && token === env.ADMIN_TOKEN;
}

function genId() {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 12);
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

function html(body) {
  return new Response(body, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache" } });
}
