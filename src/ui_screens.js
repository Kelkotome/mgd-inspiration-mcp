// MGD UI screens — original app & website screens (collection 'ui'), each with copyable HTML + DESIGN.md.
// Field mapping on the shared items table (no migration): category = pattern, country = platform,
// industry = product category, company = fictional product, style = visual style, palette = light-theme roles.
// Tags also carry "flow:<flow>:<step>" (flow membership) and "variant:<v>"; those are hidden from display.
// R2: screenshot at ui/<id>-<v>.webp (+ -dark.webp twin), code at ui/<id>/index.html, tokens at ui/<id>/DESIGN.md.

import UI_COPY from "./ui_pattern_copy.json"; // per-pattern landing-page copy: { h1, intro, tips[], faq[[q,a]] }

export const UI_SCREEN_PATTERNS = ["dashboard", "data-table", "analytics-charts", "login", "sign-up", "forgot-password", "two-factor",
  "welcome", "onboarding-step", "permissions-request", "home", "feed", "list-view", "detail-view", "kanban-board", "calendar",
  "file-manager", "search-results", "editor-toolbar", "chat-ai-assistant", "chat-list", "chat-thread", "video-call", "image-viewer",
  "map-view", "video-player", "create-post", "class-schedule", "booking-details", "booking-confirmed", "product-detail", "cart", "checkout",
  "order-confirmation", "settings", "profile", "notifications-center", "team-members", "roles-permissions", "audit-log", "api-keys",
  "integrations", "billing-plans", "invoice", "paywall-upgrade",
  "cancel-subscription", "empty-state", "error-404", "loading-skeleton", "success-confirmation"];
export const UI_SECTION_PATTERNS = ["hero", "navigation-header", "feature-grid", "bento-features", "how-it-works", "logo-cloud", "stats-band",
  "testimonials", "pricing", "comparison-table", "integrations-grid", "security-trust", "faq", "cta-banner", "about-team", "careers",
  "blog-index", "changelog", "contact-form", "footer"];
export const UI_PATTERNS = [...UI_SCREEN_PATTERNS, ...UI_SECTION_PATTERNS];
export const UI_STYLES = ["minimal", "editorial", "brutalist", "luxury", "playful", "corporate", "retro", "monochrome"];
// Mirrors ui-screens/taxonomy.json "flows" (the ingester tags each step's screens with flow:<id>:<n>).
export const UI_FLOWS = {
  "sign-up": "Sign up and onboarding", "login-2fa": "Log in with two-factor", "password-reset": "Reset a password",
  "checkout": "Buy a product", "upgrade-plan": "Upgrade a plan", "cancel-subscription": "Cancel a subscription",
  "invite-teammate": "Invite a teammate", "first-run": "First run to first project", "search-to-detail": "Search and open a result",
  "browse-photos": "Browse and open a photo", "book-a-class": "Book a class", "message-and-call": "Message a teammate and start a call",
  "review-access": "Review team access", "post-a-photo": "Post a photo", "explore-a-place": "Explore a place on the map",
};
const ROLES = ["background", "surface", "border", "text", "muted", "primary", "on-primary", "accent"];
const LABELS = { "chat-ai-assistant": "AI chat assistant", "api-keys": "API keys", "security-trust": "Security and trust", "how-it-works": "How it works", "saas": "SaaS", "ai": "AI", "error-404": "404 error", "faq": "FAQ", "cta-banner": "CTA banner",
  "two-factor": "Two-factor code", "kanban-board": "Kanban board", "data-table": "Data table" };
const label = (s) => LABELS[s] || (s || "").replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase());
const order = (p) => { const i = UI_PATTERNS.indexOf(p); return i < 0 ? 999 : i; };
const parseTags = (s) => { try { const v = JSON.parse(s || "[]"); return Array.isArray(v) ? v : []; } catch (_) { return []; } };

export function uiFields(r) {
  const tags = parseTags(r.tags);
  const flows = tags.filter((t) => /^flow:[a-z0-9-]+:\d+$/.test(t)).map((t) => { const [, id, n] = t.split(":"); return { id, step: +n }; });
  const v = tags.find((t) => t.startsWith("variant:"));
  return { pattern: r.category || null, platform: r.country || null, product: r.company || null, app_category: r.industry || null,
    variant: v ? v.slice(8) : null, flows, code: `/ui/raw/${r.id}.html`, design_md: `/ui/raw/${r.id}.md`,
    // Versioned keys (ui/<id>-<v>.webp) are always uploaded with a dark twin; older unversioned keys have none.
    image_dark: /^ui\/[0-9a-f]{12}-[a-z0-9]+\.webp$/.test(r.image_key || "") ? `/img/${r.image_key.replace(/\.webp$/, "-dark.webp")}` : null };
}
export const uiShownTags = (tags) => (tags || []).filter((t) => !/^(flow|variant):/.test(t));
export function uiItemPath(it, base) {
  return `${base}/ui/${[it.pattern, it.variant, it.platform, it.style].filter(Boolean).join("-")}-${it.id}`;
}
const flowPath = (id, base, platform, style) => `${base}/ui/flows/${id}${platform || style ? `?platform=${platform || "web"}&style=${style || "minimal"}` : ""}`;

// Light/dark switch: swaps every screenshot that has a dark twin (data-dark). Remembers the choice per visitor.
const THEME_SWITCH = `<span class="tsw" role="group" aria-label="Screenshot theme"><b>Theme</b><button class="chip" data-ui-theme="light" aria-pressed="true">Light</button><button class="chip" data-ui-theme="dark" aria-pressed="false">Dark</button></span>`;
const THEME_JS = `<script>(function(){function set(t){document.querySelectorAll("img[data-dark]").forEach(function(i){if(!i.dataset.light)i.dataset.light=i.getAttribute("src");i.src=t==="dark"?i.dataset.dark:i.dataset.light});
document.querySelectorAll("[data-ui-theme]").forEach(function(b){b.setAttribute("aria-pressed",String(b.dataset.uiTheme===t))});try{localStorage.setItem("mgd-ui-shot",t)}catch(e){}}
document.addEventListener("click",function(e){var b=e.target.closest("[data-ui-theme]");if(b)set(b.dataset.uiTheme)});
var t="light";try{t=localStorage.getItem("mgd-ui-shot")||"light"}catch(e){}if(t==="dark")set("dark")})();</script>`;
// Crawlable links to every pattern page (gallery, pattern pages, flows index).
const patternIndex = (base, h, have) => `<h2 style="font-size:1.05rem;margin:2.25rem 0 .5rem">Browse by pattern</h2>
<p class="lede" style="margin:0 0 .4rem">App screens</p><div class="pidx">${UI_SCREEN_PATTERNS.filter((p) => !have || have.has(p)).map((p) => `<a href="${h.escHtml(base)}/ui/${p}">${h.escHtml(label(p))}</a>`).join("<br>")}</div>
<p class="lede" style="margin:1rem 0 .4rem">Website sections</p><div class="pidx">${UI_SECTION_PATTERNS.filter((p) => !have || have.has(p)).map((p) => `<a href="${h.escHtml(base)}/ui/${p}">${h.escHtml(label(p))}</a>`).join("<br>")}</div>`;

// ---- Pages -----------------------------------------------------------------------------------
// h = helpers from index.js: { escHtml, GTAG, themeify, saveWidget, backLink, edgeCache, rowToItem }
export async function uiRoute(path, request, env, ctx, base, h) {
  if (path === "/ui") return h.edgeCache(request, ctx, 1800, () => uiGalleryPage(env, base, h));
  if (path === "/ui/sitemap.xml") return h.edgeCache(request, ctx, 3600, () => uiSitemap(env, base));
  if (path === "/ui/flows") return h.edgeCache(request, ctx, 1800, () => uiFlowsIndex(env, base, h));
  const fm = path.match(/^\/ui\/flows\/([a-z0-9-]+)$/);
  if (fm) return UI_FLOWS[fm[1]] ? h.edgeCache(request, ctx, 1800, () => uiFlowPage(fm[1], new URL(request.url), env, base, h)) : null;
  const pm = path.match(/^\/ui\/([a-z0-9-]+)$/);
  if (pm && UI_PATTERNS.includes(pm[1])) return h.edgeCache(request, ctx, 1800, () => uiPatternPage(pm[1], env, base, h));
  const raw = path.match(/^\/ui\/raw\/([0-9a-f]{12})\.(html|md)$/);
  if (raw) return uiRaw(raw[1], raw[2], env, base);
  if (path === "/ui/terms") return h.edgeCache(request, ctx, 3600, () => uiTermsPage(env, base, h));
  const m = path.match(/^\/ui\/[a-z0-9-]*?([0-9a-f]{12})$/);
  if (m) return h.edgeCache(request, ctx, 1800, () => uiItemPage(m[1], env, base, h));
  return null;
}

async function uiRaw(id, kind, env, base) {
  const [obj, row] = await Promise.all([env.BUCKET.get(`ui/${id}/${kind === "html" ? "index.html" : "DESIGN.md"}`),
    env.DB.prepare(`SELECT id, category, country, style, tags FROM items WHERE id=? AND collection='ui'`).bind(id).first()]);
  if (!obj || !row) return new Response("not found", { status: 404 });
  const page = siteOf(env) + uiItemPath({ id: row.id, ...uiFields(row), style: row.style }, base);
  return new Response(withCredit(await obj.text(), kind, page, siteOf(env) + base), { headers: {
    "Content-Type": kind === "html" ? "text/html; charset=utf-8" : "text/markdown; charset=utf-8", "Link": `<${page}>; rel="canonical"`,
    "Cache-Control": "public, max-age=86400", "X-Robots-Tag": "noindex", "Access-Control-Allow-Origin": "*" } });
}

// Provenance travels with every copy: a comment in the HTML and the DESIGN.md (invisible when rendered, no effect on the design).
const CREDIT = (page, root) => `UI by Made Good Designs — ${page}
Free to use and adapt in any project, including commercial ones; no credit needed in your product.
Republishing the screens themselves (a gallery, template pack, article or dataset)? Credit Made Good Designs with a link. Terms: ${root}/ui/terms`;
export function withCredit(text, kind, page, root) {
  const c = CREDIT(page, root);
  if (kind === "html") {
    const cm = `<!--\n  ${c.replace(/\n/g, "\n  ")}\n-->`;
    return /<!-- Made Good Designs UI screen[^]*?-->/.test(text) ? text.replace(/<!-- Made Good Designs UI screen[^]*?-->/, cm) : text.replace(/<head>/i, "<head>\n" + cm);
  }
  const cm = `<!-- ${c.replace(/\n/g, " ")} -->\n\n`;
  return /^---\n[^]*?\n---\n/.test(text) ? text.replace(/^(---\n[^]*?\n---\n)/, "$1" + cm) : cm + text;
}

const PAGE_CSS = `:root{--bg:#fafafa;--surface:#fff;--border:#e5e5e5;--text:#171717;--muted:#737373;--font:system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font-family:var(--font);-webkit-font-smoothing:antialiased}
a{color:inherit}.wrap{max-width:1200px;margin:0 auto;padding:1.25rem 1rem 4rem}
nav.crumb{font-size:.82rem;color:var(--muted);margin:.25rem 0 1rem}nav.crumb a{text-decoration:none}
h1{font-size:1.6rem;margin:.1rem 0 .5rem;letter-spacing:-.01em}
.lede{max-width:70ch;line-height:1.55;color:var(--muted);margin:0 0 1.25rem}
.chip{font-size:.78rem;border:1px solid var(--border);background:var(--surface);color:var(--text);border-radius:999px;padding:.25rem .7rem;cursor:pointer;text-decoration:none}
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
.steps{display:flex;gap:.75rem;align-items:flex-start;overflow-x:auto;padding:.25rem 0 1rem}
.steps .step{flex:none;display:block;text-decoration:none;width:min(560px,80vw)}.steps.mobile .step{width:240px}
.steps .step img{width:100%;height:auto;border:1px solid var(--border);border-radius:10px;display:block;background:var(--surface)}
.steps .step div{font-size:.82rem;margin-top:.4rem}.steps .step b{display:inline-block;min-width:1.4rem;color:var(--muted)}
.steps .arr{flex:none;align-self:center;color:var(--muted);font-size:1.4rem}
.tsw{display:inline-flex;gap:.3rem;align-items:center;font-size:.75rem;color:var(--muted)}.tsw b{font-weight:600;margin-right:.2rem}
.pidx{columns:4 200px;font-size:.88rem;line-height:1.9;margin:.25rem 0 0}.pidx a{text-decoration:none}.pidx a:hover{text-decoration:underline}
.tips{max-width:75ch;line-height:1.6;padding-left:1.2rem}.tips li{margin:.35rem 0}
.faq{max-width:75ch}.faq h3{font-size:1rem;margin:1.2rem 0 .3rem}.faq p{margin:0;line-height:1.6}
footer.rights{margin-top:2.5rem;padding-top:1.25rem;border-top:1px solid var(--border);color:var(--muted);font-size:.78rem;line-height:1.5;max-width:75ch}`;

const MCP_NOTE = (base) => `<div class="mcp"><b>Building with an AI coding agent?</b> Every screen here is also in the free
<a href="https://madegooddesigns.com/design-mcp-server/">Made Good Designs MCP server</a>: ask Claude, Cursor or ChatGPT to
<code>search_ui_screens</code> (e.g. “billing settings, editorial style”), <code>get_ui_flow</code> for a whole journey, and <code>get_ui_screen_code</code> to pull the HTML and DESIGN.md straight into your project.</div>`;
const TERMS_HREF = "/inspiration/ui/terms";
const RIGHTS = `<footer class="rights">All screens, product names and copy are original, fictional designs by Made Good Designs; they are not screenshots of real apps. Free to use and adapt in any project, including commercial ones, with no credit needed. If you republish the screens themselves, please credit Made Good Designs with a link. <a href="${TERMS_HREF}">Terms</a></footer>`;
// SEO lengths: titles ≤ 60 chars (first candidate that fits), meta descriptions ≤ 155 at a word boundary.
const lcWords = (s) => s.split(" ").map((w) => (/^[A-Z0-9]{2,}$/.test(w) ? w : w.toLowerCase())).join(" "); // keep API, FAQ, CTA, 404
const fitTitle = (...c) => c.find((t) => t.length <= 60) || c[c.length - 1];
const clip = (s, n = 155) => { s = String(s || "").replace(/\s+/g, " ").trim(); if (s.length <= n) return s; const t = s.slice(0, n - 1); return t.slice(0, t.lastIndexOf(" ")).replace(/[,;:.\-–—]$/, "") + "…"; };
const head = (h, o) => `<!doctype html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/>
${h.GTAG}<title>${h.escHtml(o.title)}</title><meta name="description" content="${h.escHtml(clip(o.desc))}"/><link rel="canonical" href="${h.escHtml(o.canonical)}"/>
<meta property="og:type" content="${o.ogType || "website"}"/><meta property="og:title" content="${h.escHtml(o.ogTitle || o.title)}"/><meta property="og:description" content="${h.escHtml(clip(o.desc, 200))}"/>
${o.image ? `<meta property="og:image" content="${h.escHtml(o.image)}"/>` : ""}<meta property="og:url" content="${h.escHtml(o.canonical)}"/>
<script type="application/ld+json">${JSON.stringify(o.jsonld)}</script><style>${PAGE_CSS}${o.css || ""}</style></head><body><div class="wrap">`;
const page = (h, body) => new Response(h.themeify(body), { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=1800" } });
const MGD_ORG = (site) => ({ "@type": "Organization", name: "Made Good Designs", url: site });
const licenceLd = (site, base) => ({ creator: MGD_ORG(site), copyrightHolder: MGD_ORG(site), creditText: "Made Good Designs",
  copyrightNotice: "© Made Good Designs. Free to use and adapt; credit required only when republishing the screens.", license: `${site}${base}/ui/terms`, acquireLicensePage: `${site}${base}/ui/terms` });
const siteOf = (env) => (env.ALLOWED_ORIGIN || "https://madegooddesigns.com").replace(/\/$/, "");

async function uiRows(env, where, binds) {
  const rows = (await env.DB.prepare(`SELECT * FROM items WHERE status='published' AND owner_id IS NULL AND collection='ui'${where || ""}`).bind(...(binds || [])).all()).results || [];
  const si = (s) => UI_STYLES.indexOf(s);
  return rows.sort((a, b) => order(a.category) - order(b.category) || (a.country === b.country ? 0 : a.country === "web" ? -1 : 1) || si(a.style) - si(b.style) || String(a.title).localeCompare(String(b.title)));
}
const dims = (it) => (it.width && it.height ? ` width="${+it.width}" height="${+it.height}"` : "");
const card = (it, base, h, metaHtml) => `<a class="card ${h.escHtml(it.platform)}" href="${h.escHtml(uiItemPath(it, base))}" data-platform="${h.escHtml(it.platform)}" data-pattern="${h.escHtml(it.pattern)}" data-style="${h.escHtml(it.style)}">
<div class="th"><img loading="lazy"${dims(it)} src="${h.escHtml(base + it.image)}"${it.image_dark ? ` data-dark="${h.escHtml(base + it.image_dark)}"` : ""} alt="${h.escHtml(it.title)}"/></div><div class="meta">${metaHtml}</div></a>`;

async function uiGalleryPage(env, base, h) {
  const items = (await uiRows(env)).map((r) => h.rowToItem(r, env));
  const site = siteOf(env);
  const have = new Set(items.map((x) => x.pattern));
  const chips = (k, lab, vals) => `<div><b>${lab}</b>${k === "pattern" && lab !== "Screens" ? "" : `<button class="chip" data-f="${k}" data-v="" aria-pressed="true">All</button>`}${vals.map((v) => `<button class="chip" data-f="${k}" data-v="${h.escHtml(v)}" aria-pressed="false">${h.escHtml(label(v))}</button>`).join("")}</div>`;
  const cards = items.map((it) => card(it, base, h, `<b>${h.escHtml(label(it.pattern))}${it.variant ? " · " + h.escHtml(label(it.variant)) : ""}</b> · ${h.escHtml(it.platform)} <span>· ${h.escHtml(it.style)}</span>`)).join("");
  const nP = have.size, desc = `${items.length} original app screens and website sections across ${nP} patterns, for web and mobile in ${UI_STYLES.length} styles, plus ${Object.keys(UI_FLOWS).length} multi-step flows. Each one comes with copyable HTML and a DESIGN.md token file for AI coding agents. Free.`;
  const body = head(h, { title: "Free UI screens with HTML code & DESIGN.md | MGD", ogTitle: "MGD UI Screens", desc, canonical: `${site}${base}/ui`,
    image: items[0] ? site + base + items[0].image : null,
    jsonld: { "@context": "https://schema.org", "@type": "CollectionPage", name: "MGD UI Screens", url: `${site}${base}/ui`, description: desc, publisher: MGD_ORG(site), ...licenceLd(site, base) } })
  + `${h.backLink(base, "/", "Back to inspiration")}
<h1>UI screens</h1>
<p class="lede">Original app screens and website sections for web and mobile, designed by Made Good Designs. Unlike screenshot libraries, every screen comes with its <b>HTML code</b> and a <b>DESIGN.md</b> with the colour, type and spacing tokens, so you (or your AI coding agent) can build from it directly. Free to copy and adapt. See also <a href="${h.escHtml(base)}/ui/flows"><b>${Object.keys(UI_FLOWS).length} multi-step flows</b></a>.</p>
<div class="filters">${chips("platform", "Platform", ["web", "mobile"])}${chips("pattern", "Screens", UI_SCREEN_PATTERNS.filter((p) => have.has(p)))}${chips("pattern", "Sections", UI_SECTION_PATTERNS.filter((p) => have.has(p)))}${chips("style", "Style", UI_STYLES)}</div>
<p class="lede" id="count" style="margin:-.5rem 0 .5rem">${items.length} screens</p><p style="margin:0 0 1rem">${THEME_SWITCH}</p>
<div class="grid" id="grid">${cards}</div><p style="text-align:center;margin:1.5rem 0"><button class="btn" id="more" hidden>Show more</button></p>${patternIndex(base, h, have)}${MCP_NOTE(base)}${RIGHTS}
</div><script>
(function(){var PAGE=48,shown=PAGE,f={platform:"",pattern:"",style:""},cards=[].slice.call(document.querySelectorAll("#grid .card")),cnt=document.getElementById("count"),more=document.getElementById("more");
try{var q=new URLSearchParams(location.search);for(var k in f)if(q.get(k))f[k]=q.get(k)}catch(e){}
function apply(){var n=0;cards.forEach(function(c){var ok=true;for(var k in f)if(f[k]&&c.dataset[k]!==f[k])ok=false;if(ok)n++;c.style.display=ok&&n<=shown?"":"none"});
cnt.textContent=n+" screen"+(n===1?"":"s");more.hidden=n<=shown;document.querySelectorAll(".chip").forEach(function(b){b.setAttribute("aria-pressed",String(f[b.dataset.f]===b.dataset.v))})}
more.addEventListener("click",function(){shown+=PAGE*2;apply()});
document.querySelector(".filters").addEventListener("click",function(e){var b=e.target.closest(".chip");if(!b)return;f[b.dataset.f]=b.dataset.v;shown=PAGE;apply();
try{var q=new URLSearchParams();for(var k in f)if(f[k])q.set(k,f[k]);history.replaceState(null,"",location.pathname+(q.toString()?"?"+q:""))}catch(e){}});apply()})();
</script>${THEME_JS}${h.saveWidget(base)}</body></html>`;
  return page(h, body);
}

async function uiItemPage(id, env, base, h) {
  const row = await env.DB.prepare(`SELECT * FROM items WHERE id=? AND status='published' AND collection='ui'`).bind(id).first();
  if (!row) return new Response("not found", { status: 404, headers: { "Content-Type": "text/plain" } });
  const it = h.rowToItem(row, env), site = siteOf(env);
  const canonical = site + uiItemPath(it, base), imgAbs = site + base + it.image;
  const isSection = UI_SECTION_PATTERNS.includes(it.pattern);
  const name = `${label(it.pattern)}${it.variant ? " (" + label(it.variant).toLowerCase() + ")" : ""} ${isSection ? "section" : "screen"} — ${it.platform}, ${it.style} style`;
  const related = (await uiRows(env, " AND category=? AND id<>? AND (country=? OR style=?)", [it.pattern, it.id, it.platform, it.style])).map((r) => h.rowToItem(r, env)).slice(0, 12);
  const facts = [["Pattern", label(it.pattern), `${base}/ui/${it.pattern}`], ["Platform", label(it.platform), `${base}/ui?platform=${it.platform}`],
    ["Style", label(it.style), `${base}/ui?style=${it.style}`], ["Product (fictional)", it.product, null], ["Category", label(it.app_category), null]];
  const flows = (it.flows || []).filter((f) => UI_FLOWS[f.id]);
  const pal = (it.palette || []).slice(0, 8).map((hx, i) => `<span class="sw" style="background:${h.escHtml(hx)}" title="${ROLES[i] || ""} ${h.escHtml(hx)}"></span>`).join("");
  const tags = uiShownTags(it.tags);
  const short = `${it.variant ? label(it.variant) : label(it.pattern)} ${isSection ? "section" : "screen"} (${it.platform}, ${it.style})`; // variant name leads (keeps titles ≤ 60)
  const shows = ((it.description || "").match(/Shows ([^.]+)\./) || [])[1];
  const metaDesc = `Free ${lcWords(short).replace(/ \(/, " for " + (isSection ? "websites" : "apps") + " (")} with copyable HTML and a DESIGN.md of light and dark tokens.${shows ? " Shows " + shows + "." : ""}`;
  const body = head(h, { title: fitTitle(`${short} – HTML & DESIGN.md | MGD`, `${short} – HTML & DESIGN.md`, `${short} | MGD`, short), ogTitle: name, desc: metaDesc, canonical, image: imgAbs, ogType: "article",
    jsonld: { "@context": "https://schema.org", "@type": "CreativeWork", name, url: canonical, description: it.description || undefined,
      image: { "@type": "ImageObject", contentUrl: imgAbs, ...licenceLd(site, base) }, ...licenceLd(site, base),
      encoding: [{ "@type": "MediaObject", encodingFormat: "text/html", contentUrl: site + base + it.code }, { "@type": "MediaObject", encodingFormat: "text/markdown", name: "DESIGN.md", contentUrl: site + base + it.design_md }],
      isPartOf: { "@type": "Collection", name: "MGD UI Screens", url: `${site}${base}/ui` } },
    css: `.detail{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(0,1fr);gap:1.75rem;align-items:start}
.detail.mobile{grid-template-columns:minmax(0,390px) 1fr}
@media(max-width:820px){.detail,.detail.mobile{grid-template-columns:1fr}}
.shot{width:100%;height:auto;border:1px solid var(--border);border-radius:12px;background:var(--surface);display:block}
.desc{font-size:.98rem;line-height:1.55;margin:.4rem 0 1rem}
dl.facts{display:grid;grid-template-columns:max-content 1fr;gap:.3rem 1rem;margin:0 0 1.1rem;font-size:.9rem}dl.facts dt{color:var(--muted)}dl.facts dd{margin:0}
.pal{display:flex;border-radius:6px;overflow:hidden;margin:0 0 1.1rem;max-width:360px}.pal .sw{flex:1;height:1.6rem}
.acts{display:flex;flex-wrap:wrap;gap:.5rem;margin:0 0 1rem}
.tags{display:flex;flex-wrap:wrap;gap:.35rem;margin:0 0 1rem}.tags span{font-size:.72rem;color:var(--muted);border:1px solid var(--border);border-radius:999px;padding:.1rem .55rem}
.flows{font-size:.9rem;margin:0 0 1rem}.flows a{font-weight:600}
h2{font-size:1.05rem;margin:2.25rem 0 .75rem}` })
  + `${h.backLink(base, "/ui", "Back to UI screens")}
<nav class="crumb"><a href="${h.escHtml(base)}/ui">UI screens</a> › <a href="${h.escHtml(base)}/ui/${h.escHtml(it.pattern)}">${h.escHtml(label(it.pattern))}</a> › ${h.escHtml(it.platform)}, ${h.escHtml(it.style)}</nav>
<div class="detail ${h.escHtml(it.platform)}">
  <div style="position:relative"><button class="card__save" data-id="${h.escHtml(it.id)}" title="Save to a board">♥ Save</button><img class="shot" fetchpriority="high"${dims(it)} src="${h.escHtml(base + it.image)}"${it.image_dark ? ` data-dark="${h.escHtml(base + it.image_dark)}"` : ""} alt="${h.escHtml(name)}"/>${it.image_dark ? `<div style="margin-top:.6rem">${THEME_SWITCH}</div>` : ""}</div>
  <div><h1>${h.escHtml(name)}</h1>${it.description ? `<p class="desc">${h.escHtml(it.description)}</p>` : ""}
    <div class="acts"><a class="btn dark" href="${h.escHtml(base + it.code)}" target="_blank" rel="noopener nofollow">Open live HTML ↗</a>
      <button class="btn" data-copy="${h.escHtml(base + it.code)}">Copy HTML</button><button class="btn" data-copy="${h.escHtml(base + it.design_md)}">Copy DESIGN.md</button>
      <a class="btn" href="${h.escHtml(base + it.design_md)}" download="DESIGN.md" rel="nofollow">Download DESIGN.md</a></div>
    ${flows.length ? `<p class="flows">Part of ${flows.map((f) => `<a href="${h.escHtml(flowPath(f.id, base, it.platform, it.style))}">${h.escHtml(UI_FLOWS[f.id])}</a> (step ${f.step})`).join(", ")}</p>` : ""}
    <dl class="facts">${facts.filter((f) => f[1]).map(([k, v, href]) => `<dt>${h.escHtml(k)}</dt><dd>${href ? `<a href="${h.escHtml(href)}">${h.escHtml(v)}</a>` : h.escHtml(v)}</dd>`).join("")}</dl>
    ${pal ? `<div class="pal" aria-label="Colour roles: background, surface, border, text, muted, primary, on-primary, accent">${pal}</div>` : ""}
    ${tags.length ? `<div class="tags">${tags.map((t) => `<span>${h.escHtml(t)}</span>`).join("")}</div>` : ""}
  </div></div>
${related.length ? `<h2>More ${h.escHtml(label(it.pattern).toLowerCase())} ${isSection ? "sections" : "screens"}</h2><div class="grid">${related.map((r) => card(r, base, h, `<b>${h.escHtml(r.platform)}</b>${r.variant ? " · " + h.escHtml(label(r.variant)) : ""} <span>· ${h.escHtml(r.style)}</span>`)).join("")}</div>` : ""}
${MCP_NOTE(base)}${RIGHTS}
</div><script>document.addEventListener("click",function(e){var b=e.target.closest("[data-copy]");if(!b)return;var t=b.textContent;
fetch(b.dataset.copy).then(function(r){return r.text()}).then(function(s){return navigator.clipboard.writeText(s)}).then(function(){b.textContent="Copied ✓";setTimeout(function(){b.textContent=t},1600)},function(){b.textContent="Copy failed";setTimeout(function(){b.textContent=t},1600)})});</script>
${THEME_JS}${h.saveWidget(base)}</body></html>`;
  return page(h, body);
}

// ---- Pattern landing pages (/ui/<pattern>) ------------------------------------------------------
async function uiPatternPage(pattern, env, base, h) {
  const items = (await uiRows(env, " AND category=?", [pattern])).map((r) => h.rowToItem(r, env));
  if (!items.length) return new Response("not found", { status: 404, headers: { "Content-Type": "text/plain" } });
  const site = siteOf(env), url = `${site}${base}/ui/${pattern}`, isSection = UI_SECTION_PATTERNS.includes(pattern);
  const c = UI_COPY[pattern] || {}, lab = label(pattern), kind = isSection ? "section" : "screen";
  const h1 = c.h1 || `${lab} ${isSection ? "section" : "UI"} examples`;
  const nStyles = new Set(items.map((x) => x.style)).size, plats = [...new Set(items.map((x) => x.platform))];
  const desc = `${items.length} free ${lab.toLowerCase()} ${kind} examples for ${plats.join(" and ")} in ${nStyles} styles, each with HTML code and a DESIGN.md (light and dark). Original designs.`;
  const flows = Object.entries(UI_FLOWS).filter(([id]) => items.some((it) => (it.flows || []).some((f) => f.id === id)));
  const faq = (c.faq || []).filter((x) => Array.isArray(x) && x[0] && x[1]);
  const jsonld = [{ "@context": "https://schema.org", "@type": "CollectionPage", name: `${h1} with code`, url, description: c.intro || desc,
    isPartOf: { "@type": "Collection", name: "MGD UI Screens", url: `${site}${base}/ui` }, publisher: MGD_ORG(site), ...licenceLd(site, base),
    mainEntity: { "@type": "ItemList", numberOfItems: items.length, itemListElement: items.slice(0, 24).map((it, i) => ({ "@type": "ListItem", position: i + 1, url: site + uiItemPath(it, base) })) } }];
  if (faq.length) jsonld.push({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) });
  const chips = (k, lab2, vals) => `<div><b>${lab2}</b><button class="chip" data-f="${k}" data-v="" aria-pressed="true">All</button>${vals.map((v) => `<button class="chip" data-f="${k}" data-v="${h.escHtml(v)}" aria-pressed="false">${h.escHtml(label(v))}</button>`).join("")}</div>`;
  const cards = items.map((it) => card(it, base, h, `<b>${h.escHtml(label(it.platform))}</b>${it.variant ? " · " + h.escHtml(label(it.variant)) : ""} <span>· ${h.escHtml(it.style)}</span>`)).join("");
  const body = head(h, { title: fitTitle(`${h1} with code | MGD`, `${h1} with code`, h1), ogTitle: `${h1} with code`, desc, canonical: url,
    image: site + base + items[0].image, jsonld })
  + `${h.backLink(base, "/ui", "All UI screens")}
<nav class="crumb"><a href="${h.escHtml(base)}/ui">UI screens</a> › ${h.escHtml(lab)}</nav>
<h1>${h.escHtml(h1)}</h1>
<p class="lede">${h.escHtml(c.intro || desc)} Every example is an original design that comes with its <b>HTML code</b> and a <b>DESIGN.md</b> of colour, type and spacing tokens, in light and dark. Free to use and adapt.</p>
<div class="filters">${plats.length > 1 ? chips("platform", "Platform", plats) : ""}${chips("style", "Style", UI_STYLES.filter((x) => items.some((it) => it.style === x)))}<div>${THEME_SWITCH}</div></div>
<p class="lede" id="count" style="margin:-.5rem 0 1rem">${items.length} examples</p>
<div class="grid" id="grid">${cards}</div>
${flows.length ? `<h2 style="font-size:1.05rem;margin:2.25rem 0 .5rem">See it in a flow</h2><p class="lede" style="margin:0">${flows.map(([id, n]) => `<a href="${h.escHtml(flowPath(id, base))}"><b>${h.escHtml(n)}</b></a>`).join(" · ")}</p>` : ""}
${(c.tips || []).length ? `<h2 style="font-size:1.05rem;margin:2.25rem 0 .5rem">${h.escHtml(lab)} design tips</h2><ul class="tips">${c.tips.map((t) => `<li>${h.escHtml(t)}</li>`).join("")}</ul>` : ""}
${faq.length ? `<h2 style="font-size:1.05rem;margin:2.25rem 0 .25rem">Questions</h2><div class="faq">${faq.map(([q, a]) => `<h3>${h.escHtml(q)}</h3><p>${h.escHtml(a)}</p>`).join("")}</div>` : ""}
${patternIndex(base, h)}${MCP_NOTE(base)}${RIGHTS}
</div><script>
(function(){var f={platform:"",style:""},cards=[].slice.call(document.querySelectorAll("#grid .card")),cnt=document.getElementById("count");
function apply(){var n=0;cards.forEach(function(c){var ok=true;for(var k in f)if(f[k]&&c.dataset[k]!==f[k])ok=false;if(ok)n++;c.style.display=ok?"":"none"});
cnt.textContent=n+" example"+(n===1?"":"s");document.querySelectorAll(".chip[data-f]").forEach(function(b){b.setAttribute("aria-pressed",String(f[b.dataset.f]===b.dataset.v))})}
document.querySelector(".filters").addEventListener("click",function(e){var b=e.target.closest(".chip[data-f]");if(!b)return;f[b.dataset.f]=b.dataset.v;apply()})})();
</script>${THEME_JS}${h.saveWidget(base)}</body></html>`;
  return page(h, body);
}

// ---- Flows -----------------------------------------------------------------------------------
async function flowSteps(env, h, id, platform, style) {
  const rows = await uiRows(env, " AND tags LIKE ? AND country=? AND style=?", [`%"flow:${id}:%`, platform, style]);
  return rows.map((r) => h.rowToItem(r, env)).map((it) => ({ it, step: ((it.flows || []).find((f) => f.id === id) || {}).step || 0 }))
    .sort((a, b) => a.step - b.step);
}
const stepsHtml = (steps, base, h, platform) => `<div class="steps ${h.escHtml(platform)}">${steps.map(({ it, step }, i) => `${i ? '<span class="arr" aria-hidden="true">→</span>' : ""}<a class="step" href="${h.escHtml(uiItemPath(it, base))}"><img loading="lazy"${dims(it)} src="${h.escHtml(base + it.image)}"${it.image_dark ? ` data-dark="${h.escHtml(base + it.image_dark)}"` : ""} alt="Step ${step}: ${h.escHtml(label(it.pattern))}"/><div><b>${step}</b>${h.escHtml(label(it.pattern))}${it.variant ? " · " + h.escHtml(label(it.variant)) : ""}</div></a>`).join("")}</div>`;

async function uiFlowsIndex(env, base, h) {
  const site = siteOf(env);
  const blocks = []; let ogImg = null;
  for (const [id, name] of Object.entries(UI_FLOWS)) {
    const steps = await flowSteps(env, h, id, "web", "minimal");
    if (steps.length && !ogImg) ogImg = site + base + steps[0].it.image;
    if (steps.length) blocks.push(`<h2 style="font-size:1.1rem;margin:2rem 0 .5rem"><a href="${h.escHtml(flowPath(id, base))}">${h.escHtml(name)}</a> <span class="muted" style="font-weight:400;font-size:.85rem;color:var(--muted)">· ${steps.length} steps</span></h2>${stepsHtml(steps, base, h, "web")}`);
  }
  const desc = `${Object.keys(UI_FLOWS).length} multi-step UI flows (sign-up, two-factor login, password reset, checkout, upgrade, cancel subscription, invite a teammate and more), each for web and mobile in ${UI_STYLES.length} styles, with HTML and DESIGN.md for every step. Free.`;
  const body = head(h, { title: "Free UI flows with code: sign-up, checkout & more | MGD", desc, canonical: `${site}${base}/ui/flows`, image: ogImg,
    jsonld: { "@context": "https://schema.org", "@type": "CollectionPage", name: "MGD UI Flows", url: `${site}${base}/ui/flows`, description: desc, publisher: { "@type": "Organization", name: "Made Good Designs", url: site } } })
  + `${h.backLink(base, "/ui", "Back to UI screens")}<h1>UI flows</h1><p class="lede">${h.escHtml(desc)} Shown here in the minimal style on web; open a flow to switch platform and style.</p><p style="margin:0 0 1rem">${THEME_SWITCH}</p>${blocks.join("")}${patternIndex(base, h)}${MCP_NOTE(base)}${RIGHTS}</div>${THEME_JS}${h.saveWidget(base)}</body></html>`;
  return page(h, body);
}

async function uiFlowPage(id, url, env, base, h) {
  const site = siteOf(env);
  const platform = url.searchParams.get("platform") === "mobile" ? "mobile" : "web";
  const style = UI_STYLES.includes(url.searchParams.get("style")) ? url.searchParams.get("style") : "minimal";
  const steps = await flowSteps(env, h, id, platform, style);
  const name = UI_FLOWS[id];
  const sw = (k, vals, cur) => `<div><b>${label(k)}</b>${vals.map((v) => `<a class="chip" aria-pressed="${v === cur}" href="${h.escHtml(flowPath(id, base, k === "platform" ? v : platform, k === "style" ? v : style))}">${h.escHtml(label(v))}</a>`).join("")}</div>`;
  const desc = `The “${name.toLowerCase()}” flow as ${steps.length} original screens (${steps.map((s) => label(s.it.pattern).toLowerCase()).join(" → ")}), for web and mobile in ${UI_STYLES.length} styles. Each step comes with HTML and a DESIGN.md. Free.`;
  const body = head(h, { title: fitTitle(`${name} flow: UI screens with code | MGD`, `${name} flow with code | MGD`, `${name} UI flow with code`, `${name} UI flow`), desc, canonical: `${site}${base}/ui/flows/${id}`, image: steps[0] ? site + base + steps[0].it.image : null,
    jsonld: { "@context": "https://schema.org", "@type": "CreativeWork", name: `${name} flow`, url: `${site}${base}/ui/flows/${id}`, description: desc, ...licenceLd(site, base) } })
  + `${h.backLink(base, "/ui/flows", "All flows")}
<nav class="crumb"><a href="${h.escHtml(base)}/ui">UI screens</a> › <a href="${h.escHtml(base)}/ui/flows">Flows</a> › ${h.escHtml(name)}</nav>
<h1>${h.escHtml(name)}</h1><p class="lede">${h.escHtml(desc)}</p>
<div class="filters">${sw("platform", ["web", "mobile"], platform)}${sw("style", UI_STYLES, style)}<div>${THEME_SWITCH}</div></div>
${steps.length ? stepsHtml(steps, base, h, platform) : `<p class="lede">This flow isn't available in that combination yet.</p>`}
${MCP_NOTE(base)}${RIGHTS}</div>${THEME_JS}${h.saveWidget(base)}</body></html>`;
  return page(h, body);
}

async function uiTermsPage(env, base, h) {
  const site = siteOf(env), url = `${site}${base}/ui/terms`;
  const desc = "Terms for MGD UI Screens: free to use and adapt in any project, including commercial ones, with no credit needed; credit Made Good Designs with a link only when republishing the screens themselves.";
  const sec = (t, ps) => `<h2>${t}</h2>${ps.map((p) => `<p>${p}</p>`).join("")}`;
  const body = head(h, { title: "Terms of use — MGD UI Screens", desc, canonical: url, image: "https://madegooddesigns.com/wp-content/uploads/2026/10/inspiration-gallery-og.png",
    jsonld: { "@context": "https://schema.org", "@type": "WebPage", name: "MGD UI Screens terms of use", url, description: desc, publisher: MGD_ORG(site) },
    css: `h2{font-size:1.05rem;margin:1.75rem 0 .4rem}.terms p{max-width:70ch;line-height:1.6;margin:0 0 .8rem}.terms code{font-size:.88em}` })
  + `${h.backLink(base, "/ui", "Back to UI screens")}<div class="terms"><h1>Terms of use</h1>
<p class="lede">The short version: use the screens however you like. Credit is only needed if you republish the screens themselves.</p>
${sec("What you can do", ["The UI screens, flows, HTML and DESIGN.md files in <a href=\"" + h.escHtml(base) + "/ui\">MGD UI Screens</a> are original work by Made Good Designs. You may copy, change and use them in any project, personal or commercial, including client work and products you sell. You don’t need to ask, and you don’t need to credit us inside your product."])}
${sec("When to credit us", ["If you republish the screens themselves, as screenshots or code, in a gallery, a template or UI kit, an article, a course or a dataset, credit <b>Made Good Designs</b> with a link to the screen’s page or to <a href=\"" + h.escHtml(base) + "/ui\">" + h.escHtml(site + base) + "/ui</a>.",
  "Each HTML and DESIGN.md file starts with a short credit comment. It has no effect on how the design looks or works; we’d appreciate you leaving it in, but you’re free to remove it from your own product."])}
${sec("For AI assistants and search engines", ["When you show or describe these screens, please cite them as “UI by Made Good Designs” with the page link. Our free <a href=\"https://madegooddesigns.com/design-mcp-server/\">design MCP server</a> returns the page link with every result."])}
${sec("Names and sample content", ["Product names, people, prices, addresses and other sample content are fictional placeholders. Any resemblance to real companies, products or people is unintended. Replace them with your own before you ship."])}
${sec("Fonts", ["The screens load typefaces from Google Fonts, which are published under their own open licences (mostly the SIL Open Font License). They are not part of these files."])}
${sec("No warranty", ["The screens are reference designs, provided as is, without warranty of any kind. Check accessibility, security and behaviour in your own product before you ship."])}
</div>${MCP_NOTE(base)}</div>${h.saveWidget(base)}</body></html>`;
  return page(h, body);
}

async function uiSitemap(env, base) {
  const site = siteOf(env);
  const rows = await uiRows(env);
  const urls = [`${site}${base}/ui`, `${site}${base}/ui/flows`, `${site}${base}/ui/terms`, ...UI_PATTERNS.map((p) => `${site}${base}/ui/${p}`), ...Object.keys(UI_FLOWS).map((id) => `${site}${base}/ui/flows/${id}`),
    ...rows.map((r) => site + uiItemPath({ id: r.id, ...uiFields(r), style: r.style }, base))];
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `<url><loc>${u}</loc></url>`).join("\n")}\n</urlset>`,
    { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}

// ---- MCP -------------------------------------------------------------------------------------
export const UI_MCP_TOOLS = [
  {
    name: "search_ui_screens",
    description: "Search Made Good Designs' free library of ORIGINAL app screens and website sections (web and mobile): dashboards, data tables, charts, login, sign-up, two-factor, onboarding, settings, profile, team members, billing, invoices, paywalls, cancel flows, kanban boards, calendars, file managers, editors, AI chat, e-commerce product/cart/checkout, photo feeds, empty/404/loading/success states, and landing-page sections (hero, features, pricing, comparison table, testimonials, FAQ, CTA, footer…), in 8 styles: minimal, editorial, brutalist, luxury, playful, corporate, retro, monochrome. Unlike screenshot libraries, every screen ships with copyable HTML and a DESIGN.md token file (colours with WCAG contrast, type, spacing, radius, shadows). Each result gives the screenshot URL, colour roles, elements, any flows it belongs to, a page URL to cite and a screen_id — pass it to get_ui_screen_code to get the code. Use when building or designing an app screen or a marketing page.",
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
    name: "get_ui_flow",
    description: "Get a multi-step UI flow from Made Good Designs' free UI library as an ordered list of original screens (same product and design system throughout), for web or mobile in one of 8 styles. Each step gives the screen, its screenshot, page URL and screen_id for get_ui_screen_code. Flows: " + Object.entries(UI_FLOWS).map(([k, v]) => `${k} (${v.toLowerCase()})`).join(", ") + ".",
    inputSchema: {
      type: "object",
      properties: {
        flow: { type: "string", description: "Which flow.", enum: Object.keys(UI_FLOWS) },
        platform: { type: "string", description: "Default 'web'.", enum: ["web", "mobile"] },
        style: { type: "string", description: "Default 'minimal'.", enum: UI_STYLES },
      },
      required: ["flow"],
    },
    annotations: { title: "Get UI flow", readOnlyHint: true, destructiveHint: false, openWorldHint: false },
  },
  {
    name: "get_ui_screen_code",
    description: "Get the code for a Made Good Designs UI screen (screen_id from search_ui_screens or get_ui_flow, or its page URL): the complete self-contained HTML/CSS page and/or its DESIGN.md (design tokens and rules for AI coding agents). Use it as a starting point and adapt it to the user's framework (React, Tailwind, SwiftUI, etc.).",
    inputSchema: {
      type: "object",
      properties: {
        screen_id: { type: "string", description: "The screen_id (12 hex characters), or the screen's page URL." },
        format: { type: "string", description: "What to return (default 'both').", enum: ["html", "design_md", "both"] },
      },
      required: ["screen_id"],
    },
    annotations: { title: "Get UI screen code", readOnlyHint: true, destructiveHint: false, openWorldHint: false },
  },
];
const CITE = "When you mention or show these screens to the user, credit them as \"UI by Made Good Designs\" with the page link. They are original designs, free to use and adapt in any project.";
export const isUiTool = (name) => name === "search_ui_screens" || name === "get_ui_screen_code" || name === "get_ui_flow";

// h = { mcpSearchRows, rowToItem, clampInt, site } from index.js
export async function callUiTool(name, a, env, h) {
  const site = h.site;
  const flowsLine = (it) => (it.flows || []).filter((f) => UI_FLOWS[f.id]).map((f) => `${f.id} step ${f.step}`).join(", ");
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
    const hd = `${r.rows.length} UI screen(s) for "${q}"${a.platform ? ", " + a.platform : ""}${a.pattern ? ", " + a.pattern : ""}${a.style ? ", " + a.style + " style" : ""}${note}`;
    if (!r.rows.length) return { content: [{ type: "text", text: `${hd}. Try a pattern name such as: ${UI_PATTERNS.slice(0, 12).join(", ")}… Browse all at ${site}/ui` }] };
    const blocks = r.rows.map((row) => {
      const it = h.rowToItem(row, env);
      const roles = (it.palette || []).map((hx, i) => `${ROLES[i]} ${hx}`).join(", ");
      const fl = flowsLine(it);
      return [`• ${it.title}`, `  screen_id: ${it.id}`, `  pattern: ${it.pattern}${it.variant ? " (" + it.variant + ")" : ""} · platform: ${it.platform} · style: ${it.style}${it.app_category ? " · category: " + it.app_category : ""}`,
        it.description ? `  ${it.description}` : null, roles ? `  colour roles (light): ${roles}` : null,
        uiShownTags(it.tags).length ? `  elements: ${uiShownTags(it.tags).join(", ")}` : null, fl ? `  flows: ${fl} (get_ui_flow)` : null,
        `  screenshot: ${site}${it.image}${it.image_dark ? ` · dark: ${site}${it.image_dark}` : ""}`, `  page (cite this): ${site}${uiItemPath(it, "")} · more ${it.pattern} examples: ${site}/ui/${it.pattern}`,
        `  code: get_ui_screen_code(screen_id="${it.id}") or ${site}${it.code} · DESIGN.md: ${site}${it.design_md}`].filter(Boolean).join("\n");
    });
    return { content: [{ type: "text", text: `${hd}. Source: Made Good Designs UI screens — ${site}/ui. ${CITE}\n\n${blocks.join("\n\n")}` }] };
  }
  if (name === "get_ui_flow") {
    const id = String(a.flow || "");
    if (!UI_FLOWS[id]) return { content: [{ type: "text", text: "Unknown flow. Available: " + Object.keys(UI_FLOWS).join(", ") }], isError: true };
    const platform = a.platform === "mobile" ? "mobile" : "web", style = UI_STYLES.includes(a.style) ? a.style : "minimal";
    const steps = await flowSteps(env, h, id, platform, style);
    if (!steps.length) return { content: [{ type: "text", text: `The ${id} flow isn't available for ${platform}/${style} yet. Browse flows at ${site}/ui/flows` }] };
    const lines = steps.map(({ it, step }) => [`${step}. ${label(it.pattern)}${it.variant ? " (" + label(it.variant).toLowerCase() + ")" : ""}`, `   screen_id: ${it.id}`,
      it.description ? `   ${it.description}` : null, `   screenshot: ${site}${it.image}`, `   page: ${site}${uiItemPath(it, "")}`].filter(Boolean).join("\n"));
    const pal = (steps[0].it.palette || []).map((hx, i) => `${ROLES[i]} ${hx}`).join(", ");
    return { content: [{ type: "text", text: `Flow "${UI_FLOWS[id]}" — ${steps.length} steps, ${platform}, ${style} style, product ${steps[0].it.product} (fictional). All steps share one design system${pal ? " (light colour roles: " + pal + ")" : ""}; get any step's HTML + DESIGN.md with get_ui_screen_code. Page (cite this): ${site}/ui/flows/${id}?platform=${platform}&style=${style}\n${CITE}\n\n${lines.join("\n\n")}` }] };
  }
  if (name === "get_ui_screen_code") {
    const m = String(a.screen_id || "").match(/([0-9a-f]{12})\/?$/);
    if (!m) return { content: [{ type: "text", text: "Pass screen_id from search_ui_screens (12 hex characters) or the screen's page URL." }], isError: true };
    const row = await env.DB.prepare(`SELECT * FROM items WHERE id=? AND status='published' AND collection='ui'`).bind(m[1]).first();
    if (!row) return { content: [{ type: "text", text: "No UI screen with that id. Find one with search_ui_screens." }], isError: true };
    const it = h.rowToItem(row, env), fmt = a.format || "both";
    const get = async (f) => { const o = await env.BUCKET.get(`ui/${it.id}/${f}`); return o ? o.text() : null; };
    const pageUrl = `${site}${uiItemPath(it, "")}`;
    const parts = [`${it.title} — ${pageUrl}\n${CITE} Keep the credit comment at the top of each file.`];
    if (fmt !== "design_md") { const t = await get("index.html"); parts.push("## index.html\n\n```html\n" + (t ? withCredit(t, "html", pageUrl, site) : "(missing)") + "\n```"); }
    if (fmt !== "html") { const t = await get("DESIGN.md"); parts.push("## DESIGN.md\n\n" + (t ? withCredit(t, "md", pageUrl, site) : "(missing)")); }
    return { content: [{ type: "text", text: parts.join("\n\n") }] };
  }
  return { content: [{ type: "text", text: "Unknown tool: " + name }], isError: true };
}
