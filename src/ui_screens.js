// MGD UI screens — original app & website screens (collection 'ui'), each with copyable HTML + DESIGN.md.
// Field mapping on the shared items table (no migration): category = pattern, country = platform,
// industry = product category, company = fictional product, style = visual style, palette = light-theme roles.
// R2: screenshot at ui/<id>.webp, code at ui/<id>/index.html, tokens at ui/<id>/DESIGN.md.

export const UI_PATTERNS = ["dashboard", "billing-plans", "login", "chat-ai-assistant", "empty-state", "pricing",
  "sign-up", "forgot-password", "two-factor", "welcome", "onboarding-step", "permissions-request", "feed", "home",
  "data-table", "analytics-charts", "detail-view", "list-view", "kanban-board", "calendar", "product-detail", "cart",
  "checkout", "order-confirmation", "invoice", "settings", "profile", "notifications-center", "team-members",
  "editor-toolbar", "image-viewer", "file-manager", "search-results", "error-404", "loading-skeleton",
  "success-confirmation", "paywall-upgrade", "cancel-subscription", "hero", "feature-grid", "testimonials", "logo-cloud",
  "faq", "cta-banner", "footer", "navigation-header", "about-team", "blog-index", "contact-form", "stats-band", "comparison-table"];
export const UI_STYLES = ["minimal", "editorial", "brutalist", "luxury", "playful", "corporate", "retro", "monochrome"];
const ROLES = ["background", "surface", "border", "text", "muted", "primary", "on-primary", "accent"];
const LABELS = { "chat-ai-assistant": "AI chat assistant", "saas": "SaaS", "ai": "AI", "error-404": "404 error", "faq": "FAQ", "cta-banner": "CTA banner" };
const label = (s) => LABELS[s] || (s || "").replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase());

export function uiFields(r) {
  return { pattern: r.category || null, platform: r.country || null, product: r.company || null, app_category: r.industry || null,
    code: `/ui/raw/${r.id}.html`, design_md: `/ui/raw/${r.id}.md` };
}
export function uiItemPath(it, base) {
  return `${base}/ui/${[it.pattern, it.platform, it.style].filter(Boolean).join("-")}-${it.id}`;
}

// ---- Pages -----------------------------------------------------------------------------------
// h = helpers from index.js: { escHtml, GTAG, themeify, saveWidget, backLink, edgeCache, rowToItem }
export async function uiRoute(path, request, env, ctx, base, h) {
  if (path === "/ui") return h.edgeCache(request, ctx, 1800, () => uiGalleryPage(env, base, h));
  if (path === "/ui/sitemap.xml") return h.edgeCache(request, ctx, 3600, () => uiSitemap(env, base));
  const raw = path.match(/^\/ui\/raw\/([0-9a-f]{12})\.(html|md)$/);
  if (raw) return uiRaw(raw[1], raw[2], env);
  const m = path.match(/^\/ui\/[a-z0-9-]*?([0-9a-f]{12})$/);
  if (m) return h.edgeCache(request, ctx, 1800, () => uiItemPage(m[1], env, base, h));
  return null;
}

async function uiRaw(id, kind, env) {
  const obj = await env.BUCKET.get(`ui/${id}/${kind === "html" ? "index.html" : "DESIGN.md"}`);
  if (!obj) return new Response("not found", { status: 404 });
  return new Response(obj.body, { headers: {
    "Content-Type": kind === "html" ? "text/html; charset=utf-8" : "text/markdown; charset=utf-8",
    "Cache-Control": "public, max-age=86400", "X-Robots-Tag": "noindex", "Access-Control-Allow-Origin": "*" } });
}

const PAGE_CSS = `:root{--bg:#fafafa;--surface:#fff;--border:#e5e5e5;--text:#171717;--muted:#737373;--font:system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font-family:var(--font);-webkit-font-smoothing:antialiased}
a{color:inherit}.wrap{max-width:1200px;margin:0 auto;padding:1.25rem 1rem 4rem}
nav.crumb{font-size:.82rem;color:var(--muted);margin:.25rem 0 1rem}nav.crumb a{text-decoration:none}
h1{font-size:1.6rem;margin:.1rem 0 .5rem;letter-spacing:-.01em}
.lede{max-width:70ch;line-height:1.55;color:var(--muted);margin:0 0 1.25rem}
.chip{font-size:.78rem;border:1px solid var(--border);background:var(--surface);color:var(--text);border-radius:999px;padding:.25rem .7rem;cursor:pointer}
.chip[aria-pressed=true]{background:var(--text);color:var(--bg);border-color:var(--text)}
.filters{display:grid;gap:.5rem;margin:0 0 1.25rem}.filters div{display:flex;flex-wrap:wrap;gap:.35rem;align-items:center}
.filters b{font-size:.75rem;color:var(--muted);min-width:4.5rem;font-weight:600}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:1rem}
.card{display:block;text-decoration:none;background:var(--surface);border:1px solid var(--border);border-radius:12px;overflow:hidden}
.card .th{aspect-ratio:16/10;background:#ececec;display:flex;justify-content:center;overflow:hidden}
.card img{height:100%;width:100%;object-fit:cover;object-position:top}
.card.mobile img{width:auto;object-fit:contain}
.card .meta{padding:.6rem .75rem;font-size:.82rem}.card .meta span{color:var(--muted)}
.btn{display:inline-flex;align-items:center;gap:.4rem;font:600 .88rem var(--font);text-decoration:none;border:1px solid var(--text);background:var(--surface);color:var(--text);border-radius:8px;padding:.5rem .9rem;cursor:pointer}
.btn.dark{background:var(--text);color:var(--bg)}
.mcp{margin:2rem 0 0;padding:1rem 1.1rem;border:1px solid var(--border);border-radius:12px;background:var(--surface);font-size:.9rem;line-height:1.55}
.mcp code{font-size:.85em;background:var(--bg);padding:.05rem .3rem;border-radius:4px}
footer.rights{margin-top:2.5rem;padding-top:1.25rem;border-top:1px solid var(--border);color:var(--muted);font-size:.78rem;line-height:1.5;max-width:75ch}`;

const MCP_NOTE = (base) => `<div class="mcp"><b>Building with an AI coding agent?</b> Every screen here is also in the free
<a href="https://madegooddesigns.com/design-mcp-server/">Made Good Designs MCP server</a>: ask Claude, Cursor or ChatGPT to
<code>search_ui_screens</code> (e.g. “billing settings, editorial style”) and then <code>get_ui_screen_code</code> to pull the HTML and DESIGN.md straight into your project.</div>`;

async function uiRows(env, where, binds) {
  return (await env.DB.prepare(`SELECT * FROM items WHERE status='published' AND owner_id IS NULL AND collection='ui'${where || ""} ORDER BY category, country DESC, style`).bind(...(binds || [])).all()).results || [];
}

async function uiGalleryPage(env, base, h) {
  const items = (await uiRows(env)).map((r) => h.rowToItem(r, env));
  const site = (env.ALLOWED_ORIGIN || "https://madegooddesigns.com").replace(/\/$/, "");
  const uniq = (k) => [...new Set(items.map((x) => x[k]).filter(Boolean))];
  const chips = (k, vals) => `<div><b>${label(k)}</b><button class="chip" data-f="${k}" data-v="" aria-pressed="true">All</button>${vals.map((v) => `<button class="chip" data-f="${k}" data-v="${h.escHtml(v)}" aria-pressed="false">${h.escHtml(label(v))}</button>`).join("")}</div>`;
  const cards = items.map((it) => `<a class="card ${h.escHtml(it.platform)}" href="${h.escHtml(uiItemPath(it, base))}" data-platform="${h.escHtml(it.platform)}" data-pattern="${h.escHtml(it.pattern)}" data-style="${h.escHtml(it.style)}">
<div class="th"><img loading="lazy" src="${h.escHtml(base + it.image)}" alt="${h.escHtml(it.title)}"/></div><div class="meta"><b>${h.escHtml(label(it.pattern))}</b> · ${h.escHtml(it.platform)} <span>· ${h.escHtml(it.style)}</span></div></a>`).join("");
  const title = "Free UI screens with HTML code and DESIGN.md — app & website UI inspiration";
  const desc = `${items.length} original app and website screens (dashboards, billing, login, AI chat, empty states, pricing) for web and mobile in ${UI_STYLES.length} styles. Each one comes with copyable HTML and a DESIGN.md token file for AI coding agents. Free.`;
  const jsonld = { "@context": "https://schema.org", "@type": "CollectionPage", name: "MGD UI Screens", url: `${site}${base}/ui`, description: desc,
    publisher: { "@type": "Organization", name: "Made Good Designs", url: site } };
  const body = `<!doctype html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/>
${h.GTAG}<title>${h.escHtml(title)}</title><meta name="description" content="${h.escHtml(desc)}"/><link rel="canonical" href="${site}${base}/ui"/>
<meta property="og:title" content="MGD UI Screens"/><meta property="og:description" content="${h.escHtml(desc)}"/>${items[0] ? `<meta property="og:image" content="${h.escHtml(site + base + items[0].image)}"/>` : ""}
<script type="application/ld+json">${JSON.stringify(jsonld)}</script><style>${PAGE_CSS}</style></head><body><div class="wrap">
${h.backLink(base, "", "Back to inspiration")}
<h1>UI screens</h1>
<p class="lede">Original app and website screens for web and mobile, designed by Made Good Designs. Unlike screenshot libraries, every screen comes with its <b>HTML code</b> and a <b>DESIGN.md</b> with the colour, type and spacing tokens, so you (or your AI coding agent) can build from it directly. Free to copy and adapt.</p>
<div class="filters">${chips("platform", uniq("platform"))}${chips("pattern", uniq("pattern"))}${chips("style", UI_STYLES.filter((s) => uniq("style").includes(s)))}</div>
<p class="lede" id="count" style="margin:-.5rem 0 1rem">${items.length} screens</p>
<div class="grid">${cards}</div>${MCP_NOTE(base)}
<footer class="rights">All screens, product names and copy are original, fictional designs by Made Good Designs; they are not screenshots of real apps. Free to copy and adapt for your own projects.</footer>
</div><script>
(function(){var f={platform:"",pattern:"",style:""},cards=[].slice.call(document.querySelectorAll(".card")),cnt=document.getElementById("count");
try{var q=new URLSearchParams(location.search);for(var k in f)if(q.get(k))f[k]=q.get(k)}catch(e){}
function apply(){var n=0;cards.forEach(function(c){var ok=true;for(var k in f)if(f[k]&&c.dataset[k]!==f[k])ok=false;c.style.display=ok?"":"none";if(ok)n++});
cnt.textContent=n+" screen"+(n===1?"":"s");document.querySelectorAll(".chip").forEach(function(b){b.setAttribute("aria-pressed",String(f[b.dataset.f]===b.dataset.v))})}
document.querySelector(".filters").addEventListener("click",function(e){var b=e.target.closest(".chip");if(!b)return;f[b.dataset.f]=b.dataset.v;apply();
try{var q=new URLSearchParams();for(var k in f)if(f[k])q.set(k,f[k]);history.replaceState(null,"",location.pathname+(q.toString()?"?"+q:""))}catch(e){}});apply()})();
</script>${h.saveWidget(base)}</body></html>`;
  return new Response(h.themeify(body), { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=1800" } });
}

async function uiItemPage(id, env, base, h) {
  const row = await env.DB.prepare(`SELECT * FROM items WHERE id=? AND status='published' AND collection='ui'`).bind(id).first();
  if (!row) return new Response("not found", { status: 404, headers: { "Content-Type": "text/plain" } });
  const it = h.rowToItem(row, env);
  const site = (env.ALLOWED_ORIGIN || "https://madegooddesigns.com").replace(/\/$/, "");
  const canonical = site + uiItemPath(it, base), imgAbs = site + base + it.image;
  const name = `${label(it.pattern)} screen — ${it.platform}, ${it.style} style`;
  const related = (await uiRows(env, " AND category=? AND id<>?", [it.pattern, it.id])).map((r) => h.rowToItem(r, env));
  const facts = [["Pattern", label(it.pattern), `${base}/ui?pattern=${it.pattern}`], ["Platform", label(it.platform), `${base}/ui?platform=${it.platform}`],
    ["Style", label(it.style), `${base}/ui?style=${it.style}`], ["Product (fictional)", it.product, null], ["Category", label(it.app_category), null]];
  const pal = (it.palette || []).slice(0, 8).map((hx, i) => `<span class="sw" style="background:${h.escHtml(hx)}" title="${ROLES[i] || ""} ${h.escHtml(hx)}"></span>`).join("");
  const jsonld = { "@context": "https://schema.org", "@type": "CreativeWork", name, url: canonical, image: imgAbs, description: it.description || undefined,
    creator: { "@type": "Organization", name: "Made Good Designs", url: site }, isPartOf: { "@type": "Collection", name: "MGD UI Screens", url: `${site}${base}/ui` } };
  const body = `<!doctype html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/>
${h.GTAG}<title>${h.escHtml(name)} — free HTML + DESIGN.md | MGD UI Screens</title><meta name="description" content="${h.escHtml(it.description || name)}"/>
<link rel="canonical" href="${h.escHtml(canonical)}"/><meta property="og:type" content="article"/><meta property="og:title" content="${h.escHtml(name)}"/>
<meta property="og:image" content="${h.escHtml(imgAbs)}"/><meta property="og:url" content="${h.escHtml(canonical)}"/>
<script type="application/ld+json">${JSON.stringify(jsonld)}</script><style>${PAGE_CSS}
.detail{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(0,1fr);gap:1.75rem;align-items:start}
.detail.mobile{grid-template-columns:minmax(0,390px) 1fr}
@media(max-width:820px){.detail,.detail.mobile{grid-template-columns:1fr}}
.shot{width:100%;height:auto;border:1px solid var(--border);border-radius:12px;background:var(--surface);display:block}
.desc{font-size:.98rem;line-height:1.55;margin:.4rem 0 1rem}
dl.facts{display:grid;grid-template-columns:max-content 1fr;gap:.3rem 1rem;margin:0 0 1.1rem;font-size:.9rem}dl.facts dt{color:var(--muted)}dl.facts dd{margin:0}
.pal{display:flex;border-radius:6px;overflow:hidden;margin:0 0 1.1rem;max-width:360px}.pal .sw{flex:1;height:1.6rem}
.acts{display:flex;flex-wrap:wrap;gap:.5rem;margin:0 0 1rem}
.tags{display:flex;flex-wrap:wrap;gap:.35rem;margin:0 0 1rem}.tags span{font-size:.72rem;color:var(--muted);border:1px solid var(--border);border-radius:999px;padding:.1rem .55rem}
h2{font-size:1.05rem;margin:2.25rem 0 .75rem}</style></head><body><div class="wrap">
${h.backLink(base, "/ui", "Back to UI screens")}
<nav class="crumb"><a href="${h.escHtml(base)}/ui">UI screens</a> › <a href="${h.escHtml(base)}/ui?pattern=${h.escHtml(it.pattern)}">${h.escHtml(label(it.pattern))}</a> › ${h.escHtml(it.platform)}, ${h.escHtml(it.style)}</nav>
<div class="detail ${h.escHtml(it.platform)}">
  <div style="position:relative"><button class="card__save" data-id="${h.escHtml(it.id)}" title="Save to a board">♥ Save</button><img class="shot" src="${h.escHtml(base + it.image)}" alt="${h.escHtml(name)}"/></div>
  <div><h1>${h.escHtml(name)}</h1>${it.description ? `<p class="desc">${h.escHtml(it.description)}</p>` : ""}
    <div class="acts"><a class="btn dark" href="${h.escHtml(base + it.code)}" target="_blank" rel="noopener">Open live HTML ↗</a>
      <button class="btn" data-copy="${h.escHtml(base + it.code)}">Copy HTML</button><button class="btn" data-copy="${h.escHtml(base + it.design_md)}">Copy DESIGN.md</button>
      <a class="btn" href="${h.escHtml(base + it.design_md)}" download="DESIGN.md">Download DESIGN.md</a></div>
    <dl class="facts">${facts.filter((f) => f[1]).map(([k, v, href]) => `<dt>${h.escHtml(k)}</dt><dd>${href ? `<a href="${h.escHtml(href)}">${h.escHtml(v)}</a>` : h.escHtml(v)}</dd>`).join("")}</dl>
    ${pal ? `<div class="pal" aria-label="Colour roles: background, surface, border, text, muted, primary, on-primary, accent">${pal}</div>` : ""}
    ${(it.tags || []).length ? `<div class="tags">${it.tags.map((t) => `<span>${h.escHtml(t)}</span>`).join("")}</div>` : ""}
  </div></div>
${related.length ? `<h2>More ${h.escHtml(label(it.pattern).toLowerCase())} screens</h2><div class="grid">${related.map((r) => `<a class="card ${h.escHtml(r.platform)}" href="${h.escHtml(uiItemPath(r, base))}"><div class="th"><img loading="lazy" src="${h.escHtml(base + r.image)}" alt="${h.escHtml(r.title)}"/></div><div class="meta"><b>${h.escHtml(r.platform)}</b> <span>· ${h.escHtml(r.style)}</span></div></a>`).join("")}</div>` : ""}
${MCP_NOTE(base)}
<footer class="rights">Original, fictional design by Made Good Designs (not a screenshot of a real app). Free to copy and adapt for your own projects.</footer>
</div><script>document.addEventListener("click",function(e){var b=e.target.closest("[data-copy]");if(!b)return;var t=b.textContent;
fetch(b.dataset.copy).then(function(r){return r.text()}).then(function(s){return navigator.clipboard.writeText(s)}).then(function(){b.textContent="Copied ✓";setTimeout(function(){b.textContent=t},1600)},function(){b.textContent="Copy failed";setTimeout(function(){b.textContent=t},1600)})});</script>
${h.saveWidget(base)}</body></html>`;
  return new Response(h.themeify(body), { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=1800" } });
}

async function uiSitemap(env, base) {
  const site = (env.ALLOWED_ORIGIN || "https://madegooddesigns.com").replace(/\/$/, "");
  const rows = await uiRows(env);
  const urls = [`${site}${base}/ui`, ...rows.map((r) => site + uiItemPath({ id: r.id, pattern: r.category, platform: r.country, style: r.style }, base))];
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `<url><loc>${u}</loc></url>`).join("\n")}\n</urlset>`,
    { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}

// ---- MCP -------------------------------------------------------------------------------------
export const UI_MCP_TOOLS = [
  {
    name: "search_ui_screens",
    description: "Search Made Good Designs' free library of ORIGINAL app and website UI screens (web and mobile): dashboards, billing and plans, login, AI chat assistants, empty states, pricing sections and more, in styles such as minimal, editorial, brutalist, luxury, playful, corporate, retro and monochrome. Unlike screenshot libraries, every screen ships with copyable HTML and a DESIGN.md token file (colours with WCAG contrast, type, spacing, radius, shadows). Each result gives the screenshot URL, colour roles, fonts, a page URL to cite and a screen_id — pass it to get_ui_screen_code to get the code. Use when building or designing an app screen or a marketing page.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "What screen you need, e.g. 'billing settings with plan cards', 'AI chat assistant', 'dashboard with data table'." },
        platform: { type: "string", description: "Optional platform filter.", enum: ["web", "mobile"] },
        pattern: { type: "string", description: "Optional screen pattern or website section.", enum: UI_PATTERNS },
        style: { type: "string", description: "Optional visual style.", enum: UI_STYLES },
        limit: { type: "integer", description: "Max results (1-12, default 6).", minimum: 1, maximum: 12 },
      },
      required: ["query"],
    },
    annotations: { title: "Search UI screens", readOnlyHint: true, destructiveHint: false, openWorldHint: false },
  },
  {
    name: "get_ui_screen_code",
    description: "Get the code for a Made Good Designs UI screen (screen_id from search_ui_screens, or its page URL): the complete self-contained HTML/CSS page and/or its DESIGN.md (design tokens and rules for AI coding agents). Use it as a starting point and adapt it to the user's framework (React, Tailwind, SwiftUI, etc.).",
    inputSchema: {
      type: "object",
      properties: {
        screen_id: { type: "string", description: "The screen_id from search_ui_screens (12 hex characters), or the screen's page URL." },
        format: { type: "string", description: "What to return (default 'both').", enum: ["html", "design_md", "both"] },
      },
      required: ["screen_id"],
    },
    annotations: { title: "Get UI screen code", readOnlyHint: true, destructiveHint: false, openWorldHint: false },
  },
];
export const isUiTool = (name) => name === "search_ui_screens" || name === "get_ui_screen_code";

// h = { mcpSearchRows, rowToItem, clampInt, site } from index.js
export async function callUiTool(name, a, env, h) {
  const site = h.site;
  if (name === "search_ui_screens") {
    const q = (a.query || "").toString().trim();
    const limit = h.clampInt(a.limit, 6, 1, 12);
    const binds = ["published", "ui"];
    let where = "status=? AND owner_id IS NULL AND collection=?";
    if (a.platform) { where += " AND country=?"; binds.push(String(a.platform)); }
    if (a.pattern) { where += " AND category=?"; binds.push(String(a.pattern)); }
    if (a.style) { where += " AND style=?"; binds.push(String(a.style)); }
    let r = await h.mcpSearchRows(env, where, binds, ["title", "description", "tags", "category", "style", "industry"], q, "created_at DESC", limit);
    let note = r.note;
    // Filters alone already narrow the set; if the free text matches nothing inside them, show the filtered set instead of nothing.
    if (!r.rows.length && (a.platform || a.pattern || a.style)) { r = await h.mcpSearchRows(env, where, binds, ["title"], "", "created_at DESC", limit); note = " (no text match; showing screens matching your filters)"; }
    const head = `${r.rows.length} UI screen(s) for "${q}"${a.platform ? ", " + a.platform : ""}${a.pattern ? ", " + a.pattern : ""}${a.style ? ", " + a.style + " style" : ""}${note}`;
    if (!r.rows.length) return { content: [{ type: "text", text: `${head}. The library currently covers: ${UI_PATTERNS.slice(0, 6).join(", ")} (more patterns are being added). Browse all at ${site}/ui` }] };
    const blocks = r.rows.map((row) => {
      const it = h.rowToItem(row, env);
      const roles = (it.palette || []).map((hx, i) => `${ROLES[i]} ${hx}`).join(", ");
      return [`• ${it.title}`, `  screen_id: ${it.id}`, `  pattern: ${it.pattern} · platform: ${it.platform} · style: ${it.style}${it.app_category ? " · category: " + it.app_category : ""}`,
        it.description ? `  ${it.description}` : null, roles ? `  colour roles (light): ${roles}` : null,
        it.tags.length ? `  elements: ${it.tags.join(", ")}` : null,
        `  screenshot: ${site}${it.image}`, `  page (cite this): ${site}${uiItemPath(it, "")}`,
        `  code: get_ui_screen_code(screen_id="${it.id}") or ${site}${it.code} · DESIGN.md: ${site}${it.design_md}`].filter(Boolean).join("\n");
    });
    return { content: [{ type: "text", text: `${head}. Source: Made Good Designs UI screens — ${site}/ui (original designs, free to copy and adapt; please cite).\n\n${blocks.join("\n\n")}` }] };
  }
  if (name === "get_ui_screen_code") {
    const m = String(a.screen_id || "").match(/([0-9a-f]{12})\/?$/);
    if (!m) return { content: [{ type: "text", text: "Pass screen_id from search_ui_screens (12 hex characters) or the screen's page URL." }], isError: true };
    const row = await env.DB.prepare(`SELECT * FROM items WHERE id=? AND status='published' AND collection='ui'`).bind(m[1]).first();
    if (!row) return { content: [{ type: "text", text: "No UI screen with that id. Find one with search_ui_screens." }], isError: true };
    const it = h.rowToItem(row, env), fmt = a.format || "both";
    const get = async (f) => { const o = await env.BUCKET.get(`ui/${it.id}/${f}`); return o ? o.text() : null; };
    const parts = [`${it.title} — ${site}${uiItemPath(it, "")} (original design by Made Good Designs, free to copy and adapt).`];
    if (fmt !== "design_md") parts.push("## index.html\n\n```html\n" + ((await get("index.html")) || "(missing)") + "\n```");
    if (fmt !== "html") parts.push("## DESIGN.md\n\n" + ((await get("DESIGN.md")) || "(missing)"));
    return { content: [{ type: "text", text: parts.join("\n\n") }] };
  }
  return { content: [{ type: "text", text: "Unknown tool: " + name }], isError: true };
}
