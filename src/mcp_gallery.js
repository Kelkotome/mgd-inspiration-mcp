// mcp-img-r1 (27-Nov-2026): pictures in chat for the 4 library searches (search_design_inspiration, browse_inspiration_by_theme,
// search_museum_art, search_annual_reports).
//   1. structuredContent { title, items[{ id, title, subtitle, image_url, thumb_url, page_url, ... }] } built from the rows the
//      tool already read (no extra D1 query). Link-only (non-commercial, MCP-only) records are left out: no MGD page, and their
//      images are on the library's own site.
//   2. MCP `image` content blocks (base64 JPEG/PNG, each <= THUMB_MAX bytes) for the top 3 items, after the text block. Thumbnail
//      source, in order: R2 thumb/<image_key>.jpg (made earlier) -> the Cloudflare Images binding (env.IMAGES, if bound) resizing
//      the R2 original, stored back to thumb/… so each item is resized once -> the original itself when it is already small
//      -> skipped. Any error or timeout skips that one image; the call never fails because of a picture.
//   3. An MCP Apps gallery widget (ui://mgd/gallery-v1.html, mimeType text/html;profile=mcp-app; SEP-1865, spec 2026-01-26) that
//      the 4 tools reference with _meta.ui.resourceUri (+ openai/outputTemplate for ChatGPT). Hosts without MCP Apps keep the text +
//      image blocks. The widget loads images only from madegooddesigns.com (resource _meta.ui.csp.resourceDomains).
// Kill switches (wrangler vars): MCP_THUMBS="0" (no image blocks), MCP_THUMB_STORE="0" (never write thumb/… to R2).
// Monthly cap (owner, 27-Nov-2026): Cloudflare Images transforms are capped at 5,000 per calendar month (UTC). Every attempted
// transform is counted in R2 thumb/_meta/transforms-YYYY-MM.json (read-modify-write, no D1); new transforms stop at
// MCP_THUMB_MONTHLY_CAP (default 4,900, leaving a margin for races between isolates). When capped, stored thumbnails and small
// originals still work; other items get no picture (the /img/t/ route redirects to the original).

export const GALLERY_TOOLS = new Set(["search_design_inspiration", "browse_inspiration_by_theme", "search_museum_art", "search_annual_reports"]);
export const GALLERY_URI = "ui://mgd/gallery-v1.html";
export const GALLERY_MIME = "text/html;profile=mcp-app";
export const UI_EXT = "io.modelcontextprotocol/ui";
export const THUMB_MAX = 60 * 1024;   // bytes of the decoded image, per block
export const THUMB_COUNT = 3;
const THUMB_BUDGET_MS = 2500;         // all thumbnails of one call, in parallel
const ORIGIN = "https://madegooddesigns.com";

// Tool _meta: MCP Apps standard key, the deprecated flat key (older hosts), and the ChatGPT alias + status strings.
export const GALLERY_TOOL_META = {
  ui: { resourceUri: GALLERY_URI },
  "ui/resourceUri": GALLERY_URI,
  "openai/outputTemplate": GALLERY_URI,
  "openai/toolInvocation/invoking": "Searching Made Good Designs…",
  "openai/toolInvocation/invoked": "Here are the references",
};

const ITEM_SCHEMA = { type: "object", properties: {
  id: { type: "string" }, title: { type: "string" }, subtitle: { type: "string" },
  image_url: { type: "string", description: "Full image on madegooddesigns.com." },
  thumb_url: { type: "string", description: "Small thumbnail on madegooddesigns.com (falls back to the full image)." },
  page_url: { type: "string", description: "The item's page on Made Good Designs (cite this)." },
  collection: { type: "string" }, source: { type: "string" }, licence: { type: "string" },
  width: { type: ["integer", "null"] }, height: { type: ["integer", "null"] } }, required: ["id", "title", "page_url"] };
export const GALLERY_OUTPUT_SCHEMA = { type: "object", properties: {
  title: { type: "string" }, site: { type: "string" },
  items: { type: "array", items: ITEM_SCHEMA } }, required: ["items"] };

export const thumbPath = (imageKey) => `/img/t/${imageKey}`;
export const thumbKey = (imageKey) => `thumb/${imageKey}.jpg`;

// One gallery item from a row (rowToItem output + the page URL the text cites). Null for link-only rows.
export function galleryItem(it, page, site, linkOnly) {
  if (linkOnly || !it || !it.id) return null;
  const key = String(it.image || "").replace(/^\/img\//, "");
  const coll = it.collection || "design";
  const join = (...xs) => xs.filter(Boolean).join(" · ");
  const subtitle = coll === "museum" ? join(it.artist ? it.artist + (it.year ? `, ${it.year}` : "") : it.year ? String(it.year) : "", it.museum)
    : coll === "annual-report" ? join(it.company ? it.company + (it.report_year ? ` (${it.report_year})` : "") : "", it.designer)
    : join(it.designer, (it.tags || []).slice(0, 3).join(", "));
  const out = { id: String(it.id), title: String(it.title || it.company || "Untitled").slice(0, 160), subtitle: subtitle.slice(0, 160),
    page_url: page, collection: coll, source: String(it.source || it.source_host || "").slice(0, 80), width: it.width || null, height: it.height || null };
  if (key) { out.image_url = `${site}/img/${key}`; out.thumb_url = `${site}${thumbPath(key)}`; }
  if (it.license) out.licence = it.license;
  return out;
}

// ---- thumbnails ---------------------------------------------------------------------------------------------------------
const MEM = new Map(); const MEM_MAX = 60;   // per isolate: image_key -> { mime, bytes } (small; saves the R2 read on repeats)
const mimeOf = (key, obj) => (obj && obj.httpMetadata && obj.httpMetadata.contentType) || (/\.png$/i.test(key) ? "image/png" : /\.webp$/i.test(key) ? "image/webp" : "image/jpeg");
const IMG_KEY = /^(items|museum|annual)\/[A-Za-z0-9._-]{1,80}\.(jpe?g|png|webp)$/;
export const okImageKey = (k) => IMG_KEY.test(String(k || ""));

// ---- monthly transform cap ----
export const DEFAULT_MONTHLY_CAP = 4900;
export const monthKey = (now = Date.now()) => new Date(now).toISOString().slice(0, 7);   // UTC "YYYY-MM"
export const counterKey = (month) => `thumb/_meta/transforms-${month}.json`;
export function monthlyCap(env) {
  const v = env && env.MCP_THUMB_MONTHLY_CAP;
  if (v == null || String(v).trim() === "") return DEFAULT_MONTHLY_CAP;
  const n = Math.floor(Number(v));
  return Number.isFinite(n) && n >= 0 ? n : DEFAULT_MONTHLY_CAP;
}
const CAPMEM = { month: "", count: 0, capped: false };   // per isolate
export function _resetCapMemory() { CAPMEM.month = ""; CAPMEM.count = 0; CAPMEM.capped = false; }
async function readCount(env, month) {
  const o = await env.BUCKET.get(counterKey(month));
  if (!o) return 0;
  const j = JSON.parse(await o.text());
  return Number.isFinite(+j.count) ? +j.count : 0;
}
// Reserve one transform for this month. True = go ahead (already counted); false = capped or the counter is unreadable (fail closed).
// Reservations in one isolate run one after another (a promise chain), so its counter writes land in order; races between isolates
// can lose a few increments, which the 100-transform margin (4,900 of 5,000) absorbs.
let CHAIN = Promise.resolve();
export function reserveTransform(env, now = Date.now()) {
  const run = CHAIN.then(() => reserveOne(env, now));
  CHAIN = run.catch(() => false);
  return run;
}
async function reserveOne(env, now) {
  try {
    const month = monthKey(now), cap = monthlyCap(env);
    if (CAPMEM.month !== month) { CAPMEM.month = month; CAPMEM.count = 0; CAPMEM.capped = false; }
    if (CAPMEM.capped || CAPMEM.count >= cap) { CAPMEM.capped = true; return false; }
    const count = Math.max(await readCount(env, month), CAPMEM.count);
    if (count >= cap) { CAPMEM.count = count; CAPMEM.capped = true; console.log(`mcp-thumbs: monthly transform cap reached (${count}/${cap}, ${month})`); return false; }
    CAPMEM.count = count + 1;
    await env.BUCKET.put(counterKey(month), JSON.stringify({ month, count: CAPMEM.count, cap, updated_at: new Date(now).toISOString() }),
      { httpMetadata: { contentType: "application/json", cacheControl: "no-store" } });
    return true;
  } catch (_) { return false; }
}
// Read-only view for the admin endpoint (one R2 read).
export async function transformStats(env, now = Date.now()) {
  const month = monthKey(now), cap = monthlyCap(env);
  let count = null, error = null;
  try { count = await readCount(env, month); } catch (e) { error = String((e && e.message) || e).slice(0, 120); }
  return { month, count, cap, capped: count != null && count >= cap, binding: !!(env && env.IMAGES), key: counterKey(month), ...(error ? { error } : {}) };
}

async function resize(env, body) {
  for (const [width, quality] of [[320, 72], [240, 55]]) {
    if (!(await reserveTransform(env))) return null;   // counted before the call: an attempt counts, success or failure
    const out = await env.IMAGES.input(body()).transform({ width, height: 400, fit: "scale-down", background: "#ffffff" }).output({ format: "image/jpeg", quality });
    const bytes = new Uint8Array(await out.response().arrayBuffer());
    if (bytes.byteLength && bytes.byteLength <= THUMB_MAX) return bytes;
  }
  return null;
}
// { mime, bytes } or null. Never throws.
export async function getThumb(env, imageKey, defer) {
  try {
    if (!okImageKey(imageKey) || !env || !env.BUCKET) return null;
    const m = MEM.get(imageKey); if (m) return m;
    const keep = (v) => { MEM.set(imageKey, v); while (MEM.size > MEM_MAX) MEM.delete(MEM.keys().next().value); return v; };
    const t = await env.BUCKET.get(thumbKey(imageKey));
    if (t) { const bytes = new Uint8Array(await t.arrayBuffer()); if (bytes.byteLength && bytes.byteLength <= THUMB_MAX) return keep({ mime: "image/jpeg", bytes }); }
    const orig = await env.BUCKET.get(imageKey);
    if (!orig) return null;
    const buf = new Uint8Array(await orig.arrayBuffer());
    if (env.IMAGES && typeof env.IMAGES.input === "function") {
      try {
        const bytes = await resize(env, () => new Blob([buf]).stream());
        if (bytes) {
          if (String(env.MCP_THUMB_STORE || "") !== "0") {
            const put = env.BUCKET.put(thumbKey(imageKey), bytes, { httpMetadata: { contentType: "image/jpeg", cacheControl: "public, max-age=31536000, immutable" } });
            if (defer) defer(put); else await put.catch(() => {});
          }
          return keep({ mime: "image/jpeg", bytes });
        }
      } catch (_) { /* Images unavailable or over quota: fall through to the original */ }
    }
    if (buf.byteLength && buf.byteLength <= THUMB_MAX) return keep({ mime: mimeOf(imageKey, orig), bytes: buf });
    return null;
  } catch (_) { return null; }
}

export function b64(bytes) {
  let s = "";
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

// Adds up to THUMB_COUNT image blocks after the text. Uses structuredContent.items (so it works the same on cached rows).
export async function addThumbBlocks(r, env, defer) {
  try {
    if (!r || r.isError || !Array.isArray(r.content) || String((env && env.MCP_THUMBS) || "") === "0") return r;
    const items = (r.structuredContent && Array.isArray(r.structuredContent.items) ? r.structuredContent.items : []).filter((x) => x && x.image_url).slice(0, THUMB_COUNT);
    if (!items.length) return r;
    const keyOf = (u) => String(u).replace(/^https:\/\/madegooddesigns\.com\/inspiration\/img\//, "").replace(/^https?:\/\/[^/]+\/inspiration\/img\//, "");
    let timer;
    const budget = new Promise((res) => { timer = setTimeout(() => res("timeout"), THUMB_BUDGET_MS); });
    const got = await Promise.all(items.map((x) => Promise.race([getThumb(env, keyOf(x.image_url), defer), budget.then(() => null)])));
    clearTimeout(timer);
    got.forEach((g) => { if (g && g.bytes && g.bytes.byteLength <= THUMB_MAX) r.content.push({ type: "image", data: b64(g.bytes), mimeType: g.mime }); });
  } catch (_) { /* pictures are a bonus */ }
  return r;
}

// GET /img/t/<image_key>: the thumbnail (for the widget), else a redirect to the original.
export async function serveThumb(key, env, ctx, base) {
  const defer = ctx && typeof ctx.waitUntil === "function" ? (p) => ctx.waitUntil(p) : null;
  if (!okImageKey(key)) return new Response("not found", { status: 404 });
  const t = await getThumb(env, key, defer);
  if (!t) return Response.redirect(`${env.PUBLIC_ORIGIN || ORIGIN}${base}/img/${key}`, 302);
  return new Response(t.bytes, { headers: { "Content-Type": t.mime, "Cache-Control": "public, max-age=31536000, immutable", "Access-Control-Allow-Origin": "*" } });
}

// ---- MCP Apps resource --------------------------------------------------------------------------------------------------
const RESOURCE_META = {
  ui: { csp: { resourceDomains: [ORIGIN], connectDomains: [] }, prefersBorder: false },
  "openai/widgetDescription": "A grid of design references from Made Good Designs; tap one to open its page on madegooddesigns.com.",
  "openai/widgetPrefersBorder": false,
  "openai/widgetCSP": { connect_domains: [], resource_domains: [ORIGIN], redirect_domains: [ORIGIN] },
};
export const GALLERY_RESOURCE = { uri: GALLERY_URI, name: "mgd-gallery", title: "Made Good Designs gallery",
  description: "Image grid for the library search results (design inspiration, museum art, annual reports).", mimeType: GALLERY_MIME, _meta: RESOURCE_META };

export function resourcesList() { return { resources: [GALLERY_RESOURCE] }; }
export function resourcesRead(params) {
  const uri = params && params.uri;
  if (uri !== GALLERY_URI) return null;
  return { contents: [{ uri: GALLERY_URI, mimeType: GALLERY_MIME, text: GALLERY_HTML, _meta: RESOURCE_META }] };
}
// The MCP methods both MCP endpoints answer the same way. Returns a JSON-RPC result object, an {error} or undefined (not ours).
export function galleryRpc(method, params) {
  if (method === "resources/list") return resourcesList();
  if (method === "resources/templates/list") return { resourceTemplates: [] };
  if (method === "resources/read") { const r = resourcesRead(params); return r || { error: { code: -32002, message: "Resource not found: " + String((params && params.uri) || "").slice(0, 120) } }; }
  return undefined;
}
export const GALLERY_CAPS = { resources: { listChanged: false }, extensions: { [UI_EXT]: { mimeTypes: [GALLERY_MIME] } } };

// Self-contained widget. Data: MCP Apps (ui/notifications/tool-result -> structuredContent), ChatGPT (window.openai.toolOutput),
// or window.__MGD_DEMO__ (local screenshots). Links open through the host (ui/open-link, openai.openExternal), else window.open.
export const GALLERY_HTML = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Made Good Designs</title>
<style>
:root{--bg:#ffffff;--card:#f5f5f4;--fg:#171717;--muted:#6b6b6b;--line:#e5e5e5;--accent:#171717;color-scheme:light}
:root[data-theme="dark"]{--bg:#141414;--card:#1f1f1f;--fg:#f5f5f5;--muted:#a3a3a3;--line:#2e2e2e;--accent:#f5f5f5;color-scheme:dark}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#141414;--card:#1f1f1f;--fg:#f5f5f5;--muted:#a3a3a3;--line:#2e2e2e;--accent:#f5f5f5;color-scheme:dark}}
*{box-sizing:border-box}html,body{margin:0;padding:0;background:var(--bg);color:var(--fg);font:14px/1.35 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
.wrap{padding:12px}
.head{display:flex;align-items:baseline;justify-content:space-between;gap:8px;margin:0 2px 10px}
.head h1{font-size:13px;font-weight:600;margin:0;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px}
@media (max-width:420px){.grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.wrap{padding:8px}}
a.card{display:flex;flex-direction:column;text-decoration:none;color:inherit;background:var(--card);border-radius:12px;overflow:hidden;min-width:0;-webkit-tap-highlight-color:transparent;outline-offset:2px}
a.card:active{transform:scale(.98)}a.card:focus-visible{outline:2px solid var(--accent)}
.ph{position:relative;aspect-ratio:4/5;background:var(--line);overflow:hidden}
.ph img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
.meta{padding:8px 10px 10px;min-height:56px}
.t{font-weight:600;font-size:13px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.s{color:var(--muted);font-size:12px;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.foot{margin:12px 2px 2px;font-size:12px;color:var(--muted)}.foot a{color:inherit}
.empty{color:var(--muted);padding:16px 4px}
</style></head>
<body><div class="wrap"><div class="head"><h1 id="h">Made Good Designs</h1></div><div class="grid" id="g"></div>
<div class="foot" id="f">Tap a picture to open it on <a href="https://madegooddesigns.com/inspiration/" data-href="https://madegooddesigns.com/inspiration/">madegooddesigns.com</a></div></div>
<script>
(function(){
  var ORIGIN="https://madegooddesigns.com/", rid=0, pending={}, isApps=window.parent&&window.parent!==window;
  function safe(u){u=String(u||"");return u.indexOf(ORIGIN)===0?u:"";}
  function send(m){try{window.parent.postMessage(m,"*");}catch(e){}}
  function req(method,params){var id=++rid;send({jsonrpc:"2.0",id:id,method:method,params:params||{}});return new Promise(function(res,rej){pending[id]={res:res,rej:rej};setTimeout(function(){if(pending[id]){delete pending[id];rej(new Error("timeout"));}},4000);});}
  function note(method,params){send({jsonrpc:"2.0",method:method,params:params||{}});}
  function theme(t){if(t==="dark"||t==="light")document.documentElement.setAttribute("data-theme",t);}
  function open(url){
    url=safe(url);if(!url)return;
    if(window.openai&&typeof window.openai.openExternal==="function"){try{window.openai.openExternal({href:url});return;}catch(e){}}
    if(isApps){req("ui/open-link",{url:url}).catch(function(){window.open(url,"_blank","noopener");});return;}
    window.open(url,"_blank","noopener");
  }
  function el(tag,cls,txt){var e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e;}
  function render(data){
    if(!data||!Array.isArray(data.items))return;
    var g=document.getElementById("g");g.textContent="";
    if(data.title)document.getElementById("h").textContent=String(data.title).replace(/\\. Source:.*$/,"");
    if(!data.items.length){g.appendChild(el("div","empty","No pictures for this search."));}
    data.items.forEach(function(it){
      var page=safe(it.page_url);if(!page)return;
      var a=el("a","card");a.href=page;a.setAttribute("data-href",page);a.target="_blank";a.rel="noopener";
      var ph=el("div","ph"),src=safe(it.thumb_url)||safe(it.image_url);
      if(src){var img=new Image();img.loading="lazy";img.decoding="async";img.alt=String(it.title||"");img.src=src;
        img.onerror=function(){var f=safe(it.image_url);if(f&&img.src!==f)img.src=f;else img.remove();};ph.appendChild(img);}
      a.appendChild(ph);var m=el("div","meta");m.appendChild(el("div","t",it.title||"Untitled"));if(it.subtitle)m.appendChild(el("div","s",it.subtitle));a.appendChild(m);
      g.appendChild(a);
    });
    size();
  }
  document.addEventListener("click",function(e){var a=e.target.closest&&e.target.closest("[data-href]");if(!a)return;e.preventDefault();open(a.getAttribute("data-href"));});
  var lastH=0;function size(){var h=Math.ceil(document.documentElement.scrollHeight);if(isApps&&h!==lastH){lastH=h;note("ui/notifications/size-changed",{width:Math.ceil(document.documentElement.scrollWidth),height:h});}
    if(window.openai&&typeof window.openai.notifyIntrinsicHeight==="function"){try{window.openai.notifyIntrinsicHeight(h);}catch(e){}}}
  if(typeof ResizeObserver==="function")new ResizeObserver(size).observe(document.body);
  window.addEventListener("message",function(ev){
    var m=ev.data;if(!m||m.jsonrpc!=="2.0")return;
    if(m.id!=null&&pending[m.id]&&(("result" in m)||("error" in m))){var p=pending[m.id];delete pending[m.id];m.error?p.rej(m.error):p.res(m.result);return;}
    if(m.method==="ui/notifications/tool-result"&&m.params)render(m.params.structuredContent);
    else if(m.method==="ui/notifications/host-context-changed"&&m.params)theme(m.params.theme);
    else if(m.method==="ui/resource-teardown"&&m.id!=null)send({jsonrpc:"2.0",id:m.id,result:{}});
  });
  // ChatGPT (Apps SDK globals)
  function fromOpenai(){if(window.openai){theme(window.openai.theme);if(window.openai.toolOutput)render(window.openai.toolOutput);}}
  window.addEventListener("openai:set_globals",fromOpenai);
  if(window.__MGD_DEMO__){theme(window.__MGD_DEMO__.theme);render(window.__MGD_DEMO__);}
  else if(window.openai)fromOpenai();
  else if(isApps){
    req("ui/initialize",{protocolVersion:"2026-01-26",appCapabilities:{availableDisplayModes:["inline"]},clientInfo:{name:"mgd-gallery",version:"1.0.0"}})
      .then(function(r){var c=r&&r.hostContext;if(c)theme(c.theme);note("ui/notifications/initialized",{});size();})
      .catch(function(){note("ui/notifications/initialized",{});});
  }
})();
</script></body></html>`;
