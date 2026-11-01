// No-login shareable moodboards for the public MCP (2-Nov-2026, docs/MCP-UX-AUDIT-2026-11-02.md §P2).
// One tool, save_moodboard: create a board from items in our search results and get a public, unlisted link
// (/inspiration/board/<id>, noindex) plus a private edit_token (only its SHA-256 is stored) to add/remove items,
// retitle or delete it later, in this or any later session. Replaces the Google-OAuth /mcp/boards flow for
// anonymous users (that endpoint keeps working unchanged).
//
// Limits: 30 items, title 80 chars, notes 500, per-item note 200 (all escaped on render), 20 new boards per
// IP-hash per 24 h (MOODBOARD_DAILY_LIMIT var overrides), only curated published items (never user uploads).
// Expiry: none (links get pasted into chats and docs and should keep working). Abuse: "Report" button on the page;
// 3 reports hide the board pending review; admin can disable/restore via POST /api/admin/moodboard (Bearer ADMIN_TOKEN);
// the creator can delete with the token. Needs migrate_moodboards.sql; without the table the tool says so (isError).

export const MOODBOARD_MAX_ITEMS = 30;
const TITLE_MAX = 80, NOTES_MAX = 500, ITEM_NOTE_MAX = 200, REPORTS_TO_HIDE = 3;

export const MOODBOARD_TOOL = {
  name: "save_moodboard",
  description: "Use when the user wants to keep, share or come back to references from this server: saves items from search results " +
    "(search_design_inspiration, search_museum_art, search_annual_reports, search_ui_screens…) to a free moodboard with a public link — no sign-in. " +
    "Pass the image or page URLs (or screen_ids) from the results. Create: items + title. The answer gives the share URL and a private edit_token: " +
    "tell the user to keep the token; with board_id + edit_token you can later add_items, remove_items, change title/notes, or delete. " +
    "board_id alone returns the board's items. Max 30 items.",
  inputSchema: {
    type: "object",
    properties: {
      items: { type: "array", items: { type: "string" }, description: "Create: image URLs, page URLs or ids (screen_id) from this server's search results." },
      title: { type: "string", description: "Board title (max 80 chars)." },
      notes: { type: "string", description: "Optional board description (max 500 chars)." },
      item_notes: { type: "object", additionalProperties: { type: "string" }, description: "Optional {item URL or id: short note} shown under each image." },
      board_id: { type: "string", description: "An existing board's id (from its share URL) to view or edit." },
      edit_token: { type: "string", description: "The private token returned when the board was created; required to edit or delete." },
      add_items: { type: "array", items: { type: "string" }, description: "Edit: items to add." },
      remove_items: { type: "array", items: { type: "string" }, description: "Edit: items to remove." },
      delete: { type: "boolean", description: "Edit: true deletes the board (needs edit_token)." },
    },
  },
  annotations: { title: "Save a shareable moodboard", readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
};

const enc = new TextEncoder();
async function sha256hex(s) {
  const h = new Uint8Array(await crypto.subtle.digest("SHA-256", enc.encode(s)));
  return Array.from(h, (b) => b.toString(16).padStart(2, "0")).join("");
}
function randId(n) {
  const a = "abcdefghijklmnopqrstuvwxyz0123456789", r = crypto.getRandomValues(new Uint8Array(n));
  return Array.from(r, (x) => a[x % 36]).join("");
}
const clean = (v, max) => (v == null ? "" : String(v)).replace(/[\x00-\x09\x0b-\x1f\x7f]/g, " ").replace(/[ \t]+/g, " ").trim().slice(0, max);
const err = (t) => ({ content: [{ type: "text", text: t }], isError: true });
const ok = (t, sc) => ({ content: [{ type: "text", text: t }], ...(sc ? { structuredContent: sc } : {}) });

// "https://madegooddesigns.com/inspiration/img/museum/<id>.jpg", ".../museum/some-title-1890-<id>", ".../ui/...-<id>", "<id>" → <id>
export function moodboardItemId(ref) {
  const s = String(ref == null ? "" : ref).trim().toLowerCase();
  if (/^[0-9a-f]{12}$/.test(s)) return s;
  let path = s;
  try { path = new URL(s).pathname; } catch (_) { /* bare path */ }
  const img = path.match(/\/img\/[a-z0-9_-]+\/([0-9a-f]{12})(?=[-./]|$)/);
  if (img) return img[1];
  const all = [...path.matchAll(/(?:^|[/-])([0-9a-f]{12})(?=$|[-./])/g)];
  return all.length ? all[all.length - 1][1] : null;
}

async function loadBoard(env, id) {
  return env.DB.prepare("SELECT * FROM mcp_moodboards WHERE id=?").bind(String(id || "").toLowerCase().slice(0, 32)).first();
}
const parseItems = (s) => { try { const a = JSON.parse(s || "[]"); return Array.isArray(a) ? a : []; } catch (_) { return []; } };

// Resolve refs → curated, published items. Returns { found: [{id, note}], skipped: [ref] }.
async function resolve(env, refs, notes) {
  const want = [], skipped = [];
  for (const r of (Array.isArray(refs) ? refs : []).slice(0, 60)) {
    const id = moodboardItemId(r);
    if (id) want.push({ id, ref: r }); else skipped.push(String(r).slice(0, 80));
  }
  const ids = [...new Set(want.map((w) => w.id))];
  const okIds = new Set();
  for (let i = 0; i < ids.length; i += 50) {
    const chunk = ids.slice(i, i + 50);
    const rows = await env.DB.prepare(`SELECT id FROM items WHERE status='published' AND owner_id IS NULL AND id IN (${chunk.map(() => "?").join(",")})`).bind(...chunk).all();
    (rows.results || []).forEach((r) => okIds.add(r.id));
  }
  const noteFor = (w) => {
    if (!notes || typeof notes !== "object") return "";
    const n = notes[w.ref] != null ? notes[w.ref] : notes[w.id];
    return clean(n, ITEM_NOTE_MAX);
  };
  const found = [], seen = new Set();
  for (const w of want) {
    if (!okIds.has(w.id)) { skipped.push(String(w.ref).slice(0, 80)); continue; }
    if (seen.has(w.id)) continue;
    seen.add(w.id); found.push({ id: w.id, note: noteFor(w) });
  }
  return { found, skipped };
}

function summary(board, items, site, extra) {
  const url = `${site}/board/${board.id}`;
  return `Moodboard "${board.title}" — ${items.length} item(s).\nShare link (public, unlisted): ${url}\n` + (extra || "");
}

export async function callMoodboard(a, env, ctx) {
  const site = ctx.site;
  try {
    // ---- view (board_id only, no token, no edits)
    const editing = a.edit_token || a.add_items || a.remove_items || a.delete || a.title != null || a.notes != null;
    if (a.board_id && !editing) {
      const b = await loadBoard(env, a.board_id);
      if (!b || b.disabled) return err("No such moodboard (it may have been deleted).");
      const items = parseItems(b.items);
      return ok(summary(b, items, site, items.length ? "Items:\n" + items.map((x) => `• ${site}/board/${b.id}#${x.id}${x.note ? " — " + x.note : ""}`).join("\n") : "The board is empty."),
        { board_id: b.id, share_url: `${site}/board/${b.id}`, title: b.title, items: items.map((x) => x.id) });
    }
    // ---- edit / delete
    if (a.board_id) {
      const b = await loadBoard(env, a.board_id);
      if (!b || b.disabled) return err("No such moodboard (it may have been deleted).");
      if (!a.edit_token || (await sha256hex(String(a.edit_token))) !== b.edit_hash) return err("The edit_token is missing or wrong — only the board's creator can change it. To make your own, call save_moodboard with items and a title.");
      if (a.delete) {
        await env.DB.prepare("DELETE FROM mcp_moodboards WHERE id=?").bind(b.id).run();
        return ok(`Moodboard "${b.title}" deleted; its link no longer works.`, { board_id: b.id, deleted: true });
      }
      let items = parseItems(b.items);
      const rm = new Set((Array.isArray(a.remove_items) ? a.remove_items : []).map(moodboardItemId).filter(Boolean));
      items = items.filter((x) => !rm.has(x.id));
      const { found, skipped } = await resolve(env, a.add_items, a.item_notes);
      const have = new Set(items.map((x) => x.id));
      let dropped = 0;
      for (const f of found) { if (have.has(f.id)) continue; if (items.length >= MOODBOARD_MAX_ITEMS) { dropped++; continue; } items.push(f); have.add(f.id); }
      const title = a.title != null ? (clean(a.title, TITLE_MAX) || b.title) : b.title;
      const notes = a.notes != null ? clean(a.notes, NOTES_MAX) : b.notes;
      await env.DB.prepare("UPDATE mcp_moodboards SET title=?, notes=?, items=?, updated_at=? WHERE id=?").bind(title, notes || null, JSON.stringify(items), Date.now(), b.id).run();
      const nb = { ...b, title };
      return ok(summary(nb, items, site, (skipped.length ? `Skipped (not found in Made Good Designs' library): ${skipped.join(", ")}\n` : "") +
        (dropped ? `${dropped} item(s) not added: a board holds at most ${MOODBOARD_MAX_ITEMS}.\n` : "")),
        { board_id: b.id, share_url: `${site}/board/${b.id}`, title, items: items.map((x) => x.id), skipped, dropped });
    }
    // ---- create
    const title = clean(a.title, TITLE_MAX) || "Moodboard";
    const refs = Array.isArray(a.items) ? a.items : [];
    if (!refs.length) return err("Pass items: the image or page URLs (or screen_ids) from this server's search results. Run a search first, e.g. search_design_inspiration.");
    if (refs.length > MOODBOARD_MAX_ITEMS) return err(`Too many items (${refs.length}); a board holds at most ${MOODBOARD_MAX_ITEMS}.`);
    const iph = await sha256hex((env.MCP_HASH_SALT || "mgd-mcp-v1") + "|board|" + (ctx.ip || ""));
    const limit = parseInt(env.MOODBOARD_DAILY_LIMIT || "20", 10) || 20;
    const n = await env.DB.prepare("SELECT COUNT(*) AS n FROM mcp_moodboards WHERE ip_hash=? AND created_at>?").bind(iph, Date.now() - 86400e3).first();
    if (n && n.n >= limit) return err(`Daily limit reached (${limit} new moodboards per day from one connection). Add to an existing board with board_id + edit_token instead.`);
    const { found, skipped } = await resolve(env, refs, a.item_notes);
    if (!found.length) return err("None of those items are in Made Good Designs' library. Use the image or page URLs exactly as the search results give them." + (skipped.length ? ` Not found: ${skipped.slice(0, 5).join(", ")}` : ""));
    const token = "mbt_" + randId(28), now = Date.now();
    let id = null;
    for (let i = 0; i < 4 && !id; i++) { const c = randId(14); if (!(await loadBoard(env, c))) id = c; }
    await env.DB.prepare("INSERT INTO mcp_moodboards (id,edit_hash,title,notes,items,ip_hash,created_at,updated_at,reports,disabled) VALUES (?,?,?,?,?,?,?,?,0,0)")
      .bind(id, await sha256hex(token), title, clean(a.notes, NOTES_MAX) || null, JSON.stringify(found), iph, now, now).run();
    return ok(summary({ id, title }, found, site,
      `Private edit token (show it to the user once and tell them to keep it; it is NOT stored anywhere readable): ${token}\n` +
      `To change the board later: save_moodboard(board_id="${id}", edit_token=<token>, add_items=[…] / remove_items=[…] / title / notes / delete=true).\n` +
      (skipped.length ? `Skipped (not found in Made Good Designs' library): ${skipped.join(", ")}\n` : "")),
      { board_id: id, share_url: `${site}/board/${id}`, edit_token: token, title, items: found.map((x) => x.id), skipped });
  } catch (e) {
    if (/no such table/i.test(String(e && e.message))) return err("Moodboards are not available on this server yet.");
    throw e;
  }
}

// ---- Public page: GET /board/<id>; POST /board/<id>/report
export async function moodboardRoute(path, request, env, base, h) {
  const m = path.match(/^\/board\/([a-z0-9]{14})(\/report)?$/);
  if (!m) return null;
  const html = (body, status, extraHeaders) => new Response(body, { status: status || 200,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow", ...(extraHeaders || {}) } });
  const head = (t) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${h.escHtml(t)}</title>`;
  const simple = (t, msg, st) => html(head(t) + `<style>body{font:16px/1.6 system-ui,sans-serif;max-width:640px;margin:4rem auto;padding:0 16px;background:#fafafa;color:#171717}@media (prefers-color-scheme:dark){body{background:#111;color:#f2f2f2}a{color:#f2f2f2}}</style></head><body><h1>${h.escHtml(t)}</h1><p>${msg}</p><p><a href="${base}/">Browse the Made Good Designs inspiration library</a></p></body></html>`, st);
  let b;
  try { b = await loadBoard(env, m[1]); } catch (_) { b = null; }
  if (m[2]) {
    if (request.method !== "POST") return new Response("POST only", { status: 405, headers: { Allow: "POST" } });
    if (b) await env.DB.prepare("UPDATE mcp_moodboards SET reports=reports+1, disabled=CASE WHEN reports+1>=? THEN 2 ELSE disabled END WHERE id=?").bind(REPORTS_TO_HIDE, b.id).run();
    return simple("Thanks — reported", "We’ll review this board. Boards with several reports are hidden until checked.");
  }
  if (request.method !== "GET" && request.method !== "HEAD") return new Response("method not allowed", { status: 405 });
  if (!b) return simple("Moodboard not found", "This board doesn’t exist or was deleted by its creator.", 404);
  if (b.disabled) return simple("Moodboard unavailable", "This board has been hidden pending review.", 410);
  const list = parseItems(b.items);
  const ids = list.map((x) => x.id);
  const rows = ids.length ? ((await env.DB.prepare(`SELECT * FROM items WHERE status='published' AND owner_id IS NULL AND id IN (${ids.map(() => "?").join(",")})`).bind(...ids).all()).results || []) : [];
  const byId = Object.fromEntries(rows.map((r) => [r.id, r]));
  const cards = list.filter((x) => byId[x.id]).map((x) => {
    const r = byId[x.id], it = h.rowToItem(r, null);
    const page = h.itemPage(r, it);
    const src = r.collection === "museum" ? [it.artist, it.museum && `${it.museum} (public domain)`].filter(Boolean).join(" · ")
      : r.collection === "annual-report" ? [it.company && `${it.company}${it.report_year ? " " + it.report_year : ""}`, it.designer].filter(Boolean).join(" · ")
      : r.collection === "ui" ? "Original UI by Made Good Designs" : (it.source || it.designer || it.source_host || "");
    const ratio = it.width && it.height ? (it.height / it.width * 100).toFixed(2) : "75";
    const sw = (it.palette || []).slice(0, 5).map((c) => `<i style="background:${h.escHtml(c)}" title="${h.escHtml(c)}"></i>`).join("");
    return `<figure class="pin" id="${x.id}"><a class="img" href="${h.escHtml(page)}" style="padding-top:${ratio}%"><img loading="lazy" src="${base}${it.image}" alt="${h.escHtml(it.title || "")}"></a>` +
      `<figcaption><a href="${h.escHtml(page)}"><b>${h.escHtml(it.title || it.company || "Untitled")}</b></a>${src ? `<span>Source: ${h.escHtml(src)}</span>` : ""}` +
      (x.note ? `<p class="note">${h.escHtml(x.note)}</p>` : "") + (sw ? `<span class="sw">${sw}</span>` : "") + `</figcaption></figure>`;
  }).join("");
  const first = rows.find((r) => r.id === ids[0]);
  const title = `${b.title} — moodboard on Made Good Designs`;
  return html(head(title) + `<meta property="og:title" content="${h.escHtml(title)}"><meta property="og:description" content="${h.escHtml(b.notes || cards.length + " design references")}">` +
    (first ? `<meta property="og:image" content="${h.site}${base}/img/${h.escHtml(first.image_key)}">` : "") +
    `<style>
:root{--bg:#fafafa;--surface:#fff;--text:#171717;--muted:#666;--border:#e5e5e5}
@media (prefers-color-scheme:dark){:root{--bg:#111;--surface:#1b1b1b;--text:#f2f2f2;--muted:#a3a3a3;--border:#2c2c2c}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font:15px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif}
a{color:var(--text)}.wrap{max-width:1200px;margin:0 auto;padding:24px 16px 48px}
.top{display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:space-between;margin-bottom:18px}
h1{font-size:clamp(1.6rem,4vw,2.4rem);margin:0 0 6px;line-height:1.15}.meta{color:var(--muted);margin:0 0 20px;max-width:720px;white-space:pre-wrap}
.grid{columns:4 240px;column-gap:14px}.pin{break-inside:avoid;margin:0 0 14px;background:var(--surface);border:1px solid var(--border);border-radius:12px;overflow:hidden}
.img{display:block;position:relative;background:#ddd}.img img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
figcaption{padding:9px 11px 11px}figcaption a{text-decoration:none}figcaption b{display:block;font-size:.9rem}figcaption span{display:block;color:var(--muted);font-size:.78rem}
.note{margin:6px 0 0;font-size:.85rem;border-left:3px solid var(--border);padding-left:8px}.sw{display:flex!important;gap:3px;margin-top:7px}.sw i{width:16px;height:16px;border-radius:4px;box-shadow:inset 0 0 0 1px rgba(0,0,0,.12)}
footer{margin-top:28px;color:var(--muted);font-size:.85rem;display:flex;flex-wrap:wrap;gap:12px;justify-content:space-between;align-items:center}
footer button{font:inherit;font-size:.8rem;background:none;border:1px solid var(--border);color:var(--muted);border-radius:999px;padding:4px 12px;cursor:pointer}
</style></head><body><div class="wrap"><div class="top"><a href="https://madegooddesigns.com/">Made Good Designs</a><a href="${base}/">Browse the inspiration library</a></div>` +
    `<h1>${h.escHtml(b.title)}</h1><p class="meta">${b.notes ? h.escHtml(b.notes) + "\n" : ""}${cards ? list.filter((x) => byId[x.id]).length : 0} references</p>` +
    (cards ? `<div class="grid">${cards}</div>` : `<p>This board is empty.</p>`) +
    `<footer><span>Made with <a href="https://madegooddesigns.com/design-mcp-server/">Made Good Designs’ free design MCP</a>. Images remain the property of their creators; sources are shown under each image.</span>` +
    `<form method="post" action="${base}/board/${b.id}/report"><button type="submit">Report this board</button></form></footer></div></body></html>`);
}

// Admin: POST /api/admin/moodboard {id, disabled: 0|1}  (Bearer ADMIN_TOKEN). Returns the board's report count.
export async function moodboardAdmin(request, env, isAdmin) {
  if (!isAdmin(request, env)) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
  const body = await request.json().catch(() => ({}));
  const id = String(body.id || "").toLowerCase().slice(0, 32), dis = body.disabled ? 1 : 0;
  await env.DB.prepare("UPDATE mcp_moodboards SET disabled=?, reports=CASE WHEN ?=0 THEN 0 ELSE reports END WHERE id=?").bind(dis, dis, id).run();
  const b = await loadBoard(env, id);
  return new Response(JSON.stringify(b ? { ok: true, id, disabled: b.disabled, reports: b.reports } : { error: "not_found" }), { status: b ? 200 : 404, headers: { "Content-Type": "application/json" } });
}
