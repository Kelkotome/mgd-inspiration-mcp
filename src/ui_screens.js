// MGD UI screens — original app & website screens (collection 'ui'), each with copyable HTML + DESIGN.md.
// Field mapping on the shared items table (no migration): category = pattern, country = platform,
// industry = product category, company = fictional product, style = visual style, palette = light-theme roles.
// Tags also carry "flow:<flow>:<step>" (flow membership) and "variant:<v>"; those are hidden from display.
// R2: screenshot at ui/<id>-<v>.webp (+ -dark.webp twin), code at ui/<id>/index.html, tokens at ui/<id>/DESIGN.md.

import UI_COPY from "./ui_pattern_copy.json"; // per-pattern landing-page copy: { h1, intro, tips[], faq[[q,a]] }
import { buildIndex, rankRows, resolveName, resolveStyle, resolvePlatform, resolveElement, elHas, PATTERN_ALIASES } from "./ui_search.js";
import UI_ELEMENTS from "./ui_elements.json"; // HTML-derived element/layout inventory per pattern|variant|platform (ui-screens/elements.js)
import UI_TAXONOMY from "../ui-screens/taxonomy.json"; // pattern groups + flow steps for list_ui_patterns
import { extractCopy } from "./ui_copy.js";
import { parseDesignMd, uiKitPanel, UI_KIT_CSS, UI_KIT_JS } from "./ui_kit.js";
import { specBlock, parseSpecJson, parseDesignExtras, SPEC_CSS } from "./ui_spec.js";
import { UI_COMPONENT_PATTERNS, componentMeta, componentParts, componentDemoHtml, componentCodeHtml, COMPONENT_CSS } from "./ui_component_page.js"; // UI components round 1 (7-Nov-2026)
import { resolveTree, treePaths, assertTree, nicheOfPattern, nicheOfFlatSeg, MIN_DESIGNS, PLATFORMS, liveDesigns } from "./ui_tree.js";
import { industryPage, platformPage, platformIndustryPage, platformNichePage, themePage, treeMd, themeDownload, nicheDesignsBlock, nicheCss, nicheCrumbs, nicheCrumbHtml, crumbLd, itemSibling, industryLinks, tplAnswer, tplHint, tplListLines } from "./ui_templates.js";
import { patternSlug, flatSlug, patternH1, facetSlug, resolveUiSlug, cleanUiUrl, UI_SLUG_JS, assertSlugs } from "./ui_seo.js"; // clean keyword URLs (5-Nov-2026) // copy deck (visible strings by role) for get_ui_screen_code format=copy

export const UI_SCREEN_PATTERNS = ["dashboard", "data-table", "analytics-charts", "login", "sign-up", "forgot-password", "two-factor",
  "welcome", "onboarding-step", "permissions-request", "home", "feed", "list-view", "detail-view", "kanban-board", "calendar",
  "file-manager", "search-results", "editor-toolbar", "chat-ai-assistant", "chat-list", "chat-thread", "video-call", "image-viewer",
  "map-view", "video-player", "create-post", "class-schedule", "booking-details", "booking-confirmed", "product-detail", "cart", "checkout",
  "order-confirmation", "settings", "profile", "notifications-center", "team-members", "roles-permissions", "audit-log", "api-keys",
  "integrations", "billing-plans", "invoice", "paywall-upgrade",
  "cancel-subscription", "empty-state", "error-404", "loading-skeleton", "success-confirmation",
  // 3-Nov-2026 expansion (from real search_ui_screens queries)
  "ai-workspace", "ai-settings", "version-history", "approval-queue", "doctor-directory", "telehealth-visit", "clinic-home",
  "music-player", "playlist", "portfolio-home", "case-study", "security-dashboard", "project-tracker", "course-dashboard", "form-wizard",
  "bank-onboarding", "product-scan", "split-view", "canvas-editor", "floor-plan", "voice-call",
  // 3-Nov-2026 round 3: interaction states (overlays on existing screens); pages/sitemap list them only once their rows are ingested
  "toast-snackbar", "confirm-dialog", "side-drawer", "command-palette", "date-range-picker", "form-validation",
  // error steps for flows (round 3)
  "auth-error", "payment-declined",
  // home-services family (Handmere): real query "plumber home services booking" had no answer
  "pro-directory", "service-booking", "job-tracker",
  // 5-Nov-2026 round (real queries: transactional email, staff shifts/time off, multi-location ops, inventory, savings goal, skincare carousel)
  "account-email", "order-email", "shift-scheduler", "leave-calendar", "time-off-request", "ops-dashboard", "inventory-stock", "savings-goal", "onboarding-carousel"];
// Transactional emails (table-based, inline-styled HTML for email clients): pages call them "templates", not "screens".
export const UI_EMAIL_PATTERNS = ["account-email", "order-email"];
const kindWord = (p, plural) => UI_COMPONENT_PATTERNS.includes(p) ? (plural ? "components" : "component") : UI_PAGE_PATTERNS.includes(p) ? (plural ? "templates" : "template") : UI_EMAIL_PATTERNS.includes(p) ? (plural ? "email templates" : "email template") : UI_SECTION_PATTERNS.includes(p) ? (plural ? "sections" : "section") : (plural ? "screens" : "screen");
export const UI_SECTION_PATTERNS = ["hero", "navigation-header", "feature-grid", "bento-features", "how-it-works", "logo-cloud", "stats-band",
  "testimonials", "pricing", "comparison-table", "scored-comparison", "integrations-grid", "security-trust", "faq", "cta-banner", "about-team", "careers",
  "blog-index", "changelog", "contact-form", "footer"];
// Full-length, responsive website templates by industry (type "page", 5-Nov-2026 template round n12); variants are page types (homepage first).
export const UI_PAGE_PATTERNS = ["restaurant-website", "agency-website", "architecture-website", "wedding-website", "ecommerce-website", "coffee-shop-website", "salon-website", "real-estate-website", "construction-website", "law-firm-website", "dental-website", "gym-website", "school-website", "nonprofit-website", "travel-website", "hotel-website", "saas-landing-page", "ai-website", "medical-website", "cardiology-website", "dermatology-website", "therapist-website", "physical-therapy-website", "veterinary-website", "financial-advisor-website", "cleaning-service-website", "hvac-website", "cybersecurity-website", "crm-landing-page", "coaching-website", "pest-control-website", "solar-website", "ai-agent-website", "preschool-website", "apartment-website", "pediatrics-website", "orthodontics-website", "fertility-website", "hospital-website", "mental-health-website", "optometry-website", "pharmacy-website", "real-estate-agent-website", "property-management-website", "luxury-real-estate-website", "commercial-real-estate-website", "vacation-rental-website", "home-builder-website", "bakery-website", "pizzeria-website", "bar-website", "catering-website", "food-truck-website", "fine-dining-website"];
export { UI_COMPONENT_PATTERNS }; // tabs, cards, pagination, popover, tooltip, dropdown-menu, accordion, radio-group, breadcrumbs, toggle-switch, stepper, sidebar-nav, spinner
export const UI_PATTERNS = [...UI_SCREEN_PATTERNS, ...UI_SECTION_PATTERNS, ...UI_PAGE_PATTERNS, ...UI_COMPONENT_PATTERNS];
// Gallery filter categories (4-Nov-2026, user-picked names): taxonomy screen_patterns groups merged into 9, plus website sections.
// 100+ flat chips were unscannable; the page now shows these first and reveals a category's screens once it is picked.
const UI_FILTER_GROUPS = [["signin", "Sign-in & onboarding", ["auth", "onboarding", "finance"]], ["dashboards", "Dashboards", ["home", "dashboards"]],
  ["data", "Lists & data", ["data", "forms"]], ["shopping", "Shopping & payments", ["commerce", "monetize"]], ["account", "Account & admin", ["account", "admin"]],
  ["messages", "Messages & media", ["messaging", "media", "music", "camera"]], ["tools", "Tools & AI", ["tools", "ai", "review"]],
  ["industries", "Industries", ["healthcare", "booking", "home-services", "portfolio"]], ["states", "States & feedback", ["states", "interaction-states"]],
  ["emails", "Emails", ["emails"]], ["operations", "Staff & operations", ["operations"]]]
  .map(([id, name, keys]) => [id, name, keys.flatMap((k) => (UI_TAXONOMY.screen_patterns || {})[k] || [])]);
const UI_PAGE_GROUP = ["websites", "Website templates", UI_PAGE_PATTERNS];
const UI_COMPONENT_GROUP = ["components", "UI components", UI_COMPONENT_PATTERNS];
const UI_GROUP_OF = Object.fromEntries([...UI_FILTER_GROUPS.flatMap(([id, , ps]) => ps.map((p) => [p, id])), ...UI_SECTION_PATTERNS.map((p) => [p, "sections"]), ...UI_PAGE_PATTERNS.map((p) => [p, "websites"]), ...UI_COMPONENT_PATTERNS.map((p) => [p, "components"])]);
export const UI_STYLES = ["minimal", "editorial", "brutalist", "luxury", "playful", "corporate", "retro", "monochrome"];
// Flows come straight from ui-screens/taxonomy.json (3-Nov-2026): steps are "pattern" or "pattern:variant", resolved per platform × style
// against the published rows at request time, so lengthening a flow or adding error steps needs no re-ingest. "errors" marks the
// unhappy-path steps (get_ui_flow include_errors=false drops them); "actions" are the verbs a flow covers.
const FLOW_DEFS = UI_TAXONOMY.flows || {};
export const UI_FLOWS = Object.fromEntries(Object.entries(FLOW_DEFS).map(([k, v]) => [k, v.name]));
// Nominal membership of a screen in flows (pattern[:variant] → step number), used on item pages and in search answers.
function flowsOf(pattern, variant) {
  const key = `${pattern}${variant ? ":" + variant : ""}`, out = [];
  for (const [id, f] of Object.entries(FLOW_DEFS)) f.steps.forEach((st, i) => { if (st === key || (!variant && st === pattern)) out.push({ id, step: i + 1 }); });
  return out;
}
const ROLES = ["background", "surface", "border", "text", "muted", "primary", "on-primary", "accent"];
const LABELS = { homepage: "Signature", atlas: "Atlas", folio: "Folio", ledger: "Ledger", bento: "Bento", band: "Band", concierge: "Concierge", listing: "Listing", showcase: "Showcase", menu: "Menu", reserve: "Reserve", "chat-ai-assistant": "AI chat assistant", "api-keys": "API keys", "security-trust": "Security and trust", "how-it-works": "How it works", "saas": "SaaS", "ai": "AI", "error-404": "404 error", "faq": "FAQ", "cta-banner": "CTA banner",
  "two-factor": "Two-factor code", "kanban-board": "Kanban board", "data-table": "Data table",
  "ai-workspace": "AI workspace", "ai-settings": "AI settings", "telehealth-visit": "Telehealth visit", "form-wizard": "Multi-step form wizard",
  "in-call": "In call", "visit-summary": "Visit summary",
  "split-view": "Split view (master-detail)", "verify-identity": "Verify identity", "account-ready": "Account ready",
  "pro-directory": "Find a pro (home services)", "service-booking": "Book a home-service visit", "job-tracker": "Job tracker",
  details: "Details and arrival window", "slot-taken": "Arrival window just taken", "on-the-way": "Pro on the way", "job-done": "Job done, pay and rate",
  "toast-snackbar": "Toast / snackbar with undo", "confirm-dialog": "Confirm dialog (destructive)", "side-drawer": "Side drawer", "command-palette": "Command palette",
  "date-range-picker": "Date range picker", "form-validation": "Form validation errors",
  "auth-error": "Sign-in error",
  "account-email": "Account email", "order-email": "Order email", "shift-scheduler": "Shift scheduler", "leave-calendar": "Leave calendar", "time-off-request": "Time-off request",
  "ops-dashboard": "Multi-location operations dashboard", "inventory-stock": "Inventory stock", "savings-goal": "Savings goal", "onboarding-carousel": "Onboarding carousel", "scored-comparison": "Scored comparison table",
  "verify-email": "Verify email", "magic-link": "Magic link sign-in", "shipping-update": "Shipping update", "low-stock": "Low stock", "receive-stock": "Receive stock", "conflict": "Conflicts with staffing", "review": "Manager review", "payment-declined": "Card declined at checkout", "wrong-password": "Wrong password", "account-locked": "Account locked", "code-expired": "Code expired" };
Object.assign(LABELS, { homepage: "Home page", "ai-agent-website": "AI agent website", "pediatrics-website": "Pediatrics website", "fertility-website": "Fertility clinic website", "physical-therapy-website": "Physical therapy website", "hvac-website": "HVAC website", "crm-landing-page": "CRM landing page", "saas-landing-page": "SaaS landing page", "ai-website": "AI website", "school-website": "School website" });
Object.assign(LABELS, Object.fromEntries(UI_COMPONENT_PATTERNS.map((p) => [p, componentMeta(p).name])));
const label = (s) => LABELS[s] || (s || "").replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase());
const order = (p) => { const i = UI_PATTERNS.indexOf(p); return i < 0 ? 999 : i; };
const parseTags = (s) => { try { const v = JSON.parse(s || "[]"); return Array.isArray(v) ? v : []; } catch (_) { return []; } };

export function uiFields(r) {
  const tags = parseTags(r.tags);
  const v = tags.find((t) => t.startsWith("variant:"));
  const flows = flowsOf(r.category, v ? v.slice(8) : null);
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
document.querySelectorAll("iframe[data-theme-frame]").forEach(function(f){f.setAttribute("src",f.getAttribute("src").split("#")[0]+"#"+t)});document.querySelectorAll("[data-ui-theme]").forEach(function(b){b.setAttribute("aria-pressed",String(b.dataset.uiTheme===t))});try{localStorage.setItem("mgd-ui-shot",t)}catch(e){}}
document.addEventListener("click",function(e){var b=e.target.closest("[data-ui-theme]");if(b)set(b.dataset.uiTheme)});
var t="light";try{t=localStorage.getItem("mgd-ui-shot")||"light"}catch(e){}if(t==="dark")set("dark")})();</script>`;
// Crawlable links to every pattern page (gallery, pattern pages, flows index).
const patternIndex = (base, h, have) => `<h2 style="font-size:1.05rem;margin:2.25rem 0 .5rem">Browse by pattern</h2>
<p class="lede" style="margin:0 0 .4rem">App screens</p><div class="pidx">${UI_SCREEN_PATTERNS.filter((p) => !have || have.has(p)).map((p) => `<a href="${h.escHtml(base)}/ui/${patternSlug(p)}">${h.escHtml(label(p))}</a>`).join("<br>")}</div>
${UI_COMPONENT_PATTERNS.some((p) => !have || have.has(p)) ? `<p class="lede" style="margin:1rem 0 .4rem">UI components</p><div class="pidx">${UI_COMPONENT_PATTERNS.filter((p) => !have || have.has(p)).map((p) => `<a href="${h.escHtml(base)}/ui/${patternSlug(p)}">${h.escHtml(label(p))}</a>`).join("<br>")}</div>` : ""}
<p class="lede" style="margin:1rem 0 .4rem">Website sections</p><div class="pidx">${UI_SECTION_PATTERNS.filter((p) => !have || have.has(p)).map((p) => `<a href="${h.escHtml(base)}/ui/${patternSlug(p)}">${h.escHtml(label(p))}</a>`).join("<br>")}</div>${UI_PAGE_PATTERNS.some((p) => !have || have.has(p)) ? `
<p class="lede" style="margin:1rem 0 .4rem">Website templates</p><div class="pidx">${UI_PAGE_PATTERNS.filter((p) => !have || have.has(p)).map((p) => `<a href="${h.escHtml(base)}/ui/${patternSlug(p)}">${h.escHtml(patternH1(p) || label(p))}</a>`).join("<br>")}</div>` : ""}`;

// ---- Pages -----------------------------------------------------------------------------------
// h = helpers from index.js: { escHtml, GTAG, themeify, saveWidget, backLink, edgeCache, rowToItem }
export async function uiRoute(path, request, env, ctx, base, h) {
  if (path === "/ui") {
    // Old filter URLs (/ui?group=…&pattern=…&platform=…&style=…) → their clean keyword path (301, other params kept)
    const u = new URL(request.url), f = {}, cleanQ = {};
    if (UI_PATTERNS.includes(u.searchParams.get("pattern"))) f.pattern = u.searchParams.get("pattern");
    if (facetSlug("group", u.searchParams.get("group"))) f.group = u.searchParams.get("group");
    const dev = u.searchParams.get("device") || u.searchParams.get("platform"); if (["web", "mobile"].includes(dev)) f.platform = dev; // Device; ?platform= is the old name and keeps working
    if (UI_STYLES.includes(u.searchParams.get("style"))) f.style = u.searchParams.get("style");
    if (Object.keys(f).length) return Response.redirect(new URL(cleanUiUrl(f, base), request.url).toString(), 301);
    return h.edgeCache(request, ctx, 1800, () => uiGalleryPage(env, base, h, null));
  }
  if (path === "/ui/sitemap.xml") return h.edgeCache(request, ctx, 3600, () => uiSitemap(env, base));
  if (path === "/ui/flows") return h.edgeCache(request, ctx, 1800, () => uiFlowsIndex(env, base, h));
  const fm = path.match(/^\/ui\/flows\/([a-z0-9-]+)$/);
  if (fm) return UI_FLOWS[fm[1]] ? h.edgeCache(request, ctx, 1800, () => uiFlowPage(fm[1], new URL(request.url), env, base, h)) : null;
  // Template tree: nested paths, their .md twins and theme downloads
  const dl = path.match(/^\/ui\/download\/wordpress\/([a-z0-9-]+)\.(zip|blueprint\.json)$/);
  if (dl) return themeDownload(dl[1], dl[2], env, siteOf(env), base);
  const tm = path.match(/^\/ui\/([a-z0-9/-]+?)(\.md)?$/);
  const th = tm && resolveTree(tm[1]);
  if (th && tm[2]) { const { rel, md } = treeMd(th, siteOf(env), base); return new Response(md, { headers: { "Content-Type": "text/markdown; charset=utf-8", "Link": `<${siteOf(env)}${base}/ui/${rel}>; rel="canonical"`, "Cache-Control": "public, max-age=3600", "Access-Control-Allow-Origin": "*" } }); }
  if (th) {
    const x = uiX(); const go = (fn) => h.edgeCache(request, ctx, 1800, fn);
    if (th.type === "industry") return go(() => industryPage(th.ind, env, base, h, x));
    if (th.type === "niche") return go(() => uiPatternPage(th.n.pattern, env, base, h));
    if (th.type === "platform") return go(() => platformPage(env, base, h, x));
    if (th.type === "platform-industry") return go(() => platformIndustryPage(th.ind, env, base, h, x));
    if (th.type === "platform-niche") return go(() => platformNichePage(th.n, env, base, h, x));
    if (th.type === "theme") return go(() => themePage(th.n, th.d, env, base, h, x));
  }
  const pm = path.match(/^\/ui\/([a-z0-9-]+)$/);
  const hit = pm && resolveUiSlug(pm[1], UI_PATTERNS);
  // a nested niche's own segment typed flat (/ui/real-estate-agency-website-template, never live flat): one hop to its nested page
  const flatSeg = !hit && pm && nicheOfFlatSeg(pm[1]);
  if (flatSeg) { const u = new URL(request.url); return Response.redirect(new URL(`${base}/ui/${patternSlug(flatSeg.pattern)}${u.search}`, request.url).toString(), 301); }
  if (hit && hit.type === "old") { const u = new URL(request.url); return Response.redirect(new URL(`${base}/ui/${patternSlug(hit.pattern)}${u.search}`, request.url).toString(), 301); }
  if (hit && hit.type === "pattern") return h.edgeCache(request, ctx, 1800, () => uiPatternPage(hit.pattern, env, base, h));
  if (hit && hit.type === "facet") return h.edgeCache(request, ctx, 1800, () => uiGalleryPage(env, base, h, hit.facet));
  const raw = path.match(/^\/ui\/raw\/([0-9a-f]{12})\.(html|md)$/);
  if (raw) return uiRaw(raw[1], raw[2], env, base);
  if (path === "/ui/terms") return h.edgeCache(request, ctx, 3600, () => uiTermsPage(env, base, h));
  const m = path.match(/^\/ui\/[a-z0-9-]*?([0-9a-f]{12})$/);
  if (m) return h.edgeCache(request, ctx, 1800, () => uiItemPage(m[1], env, base, h));
  return null;
}
// Where an old flat path now lives (trailing-slash redirects use this too, so old URLs reach the page in one hop). null when it has not moved.
const uiX = () => ({ uiRows, uiItemPath: (it, base) => uiItemPath(it, base), head, page, siteOf, fitTitle, MGD_ORG, licenceLd, patternSlug, label, MCP_NOTE, RIGHTS });
export function uiMovedPath(rel) { const hit = resolveUiSlug(rel, UI_PATTERNS); if (hit && hit.type === "old") return patternSlug(hit.pattern); const fs = !hit && nicheOfFlatSeg(rel); return fs ? patternSlug(fs.pattern) : null; }
assertTree();
assertSlugs(UI_PATTERNS); // fails the deploy (module load) if a slug is missing, duplicated or collides with an old pattern id

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
.filters{display:grid;gap:.5rem;margin:0 0 1.25rem}.filters div{display:flex;flex-wrap:wrap;gap:.35rem;align-items:center}.filters div[hidden]{display:none}
.filters .sub{padding:.5rem 0 .5rem;border-top:1px dashed var(--border);border-bottom:1px dashed var(--border)}
.filters b{font-size:.75rem;color:var(--muted);min-width:4.5rem;font-weight:600}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:1rem}
.card{display:block;text-decoration:none;background:var(--surface);border:1px solid var(--border);border-radius:12px;overflow:hidden}
.card .th{aspect-ratio:16/10;background:#ececec;display:flex;justify-content:center;overflow:hidden}
.card img{height:100%;width:100%;object-fit:cover;object-position:top}
.card.mobile img{width:auto;object-fit:contain}
.card.mobile.page img{width:46%;object-fit:cover;object-position:top}
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
.steps .err{font-size:.7rem;border:1px solid currentColor;border-radius:999px;padding:0 .4rem;color:#b42318}
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
const lcFirst = (t) => (/^[A-Z][a-z]/.test(t) ? t[0].toLowerCase() + t.slice(1) : t); // "Login page…" → "login page…", keeps "HTML…", "UI…"
const fitTitle = (...c) => c.find((t) => t.length <= 60) || c[c.length - 1];
const clip = (s, n = 155) => { s = String(s || "").replace(/\s+/g, " ").trim(); if (s.length <= n) return s; const t = s.slice(0, n - 1); return t.slice(0, t.lastIndexOf(" ")).replace(/[,;:.\-–—]$/, "") + "…"; };
const head = (h, o) => `<!doctype html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/>
${h.GTAG}<title>${h.escHtml(o.title)}</title><meta name="description" content="${h.escHtml(clip(o.desc))}"/><link rel="canonical" href="${h.escHtml(o.canonical)}"/>
<meta property="og:type" content="${o.ogType || "website"}"/><meta property="og:title" content="${h.escHtml(o.ogTitle || o.title)}"/><meta property="og:description" content="${h.escHtml(clip(o.desc, 200))}"/>
${o.image ? `<meta property="og:image" content="${h.escHtml(o.image)}"/>` : ""}<meta property="og:url" content="${h.escHtml(o.canonical)}"/>${o.md ? `<link rel="alternate" type="text/markdown" href="${h.escHtml(o.md)}"/>` : ""}
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
const card = (it, base, h, metaHtml) => `<a class="card ${h.escHtml(it.platform)}${UI_PAGE_PATTERNS.includes(it.pattern) ? " page" : ""}" href="${h.escHtml(uiItemPath(it, base))}" data-platform="${h.escHtml(it.platform)}" data-pattern="${h.escHtml(it.pattern)}" data-group="${UI_GROUP_OF[it.pattern] || "tools"}" data-style="${h.escHtml(it.style)}">
<div class="th"><img loading="lazy"${dims(it)} src="${h.escHtml(base + it.image)}"${it.image_dark ? ` data-dark="${h.escHtml(base + it.image_dark)}"` : ""} alt="${h.escHtml(it.title)}"/></div><div class="meta">${metaHtml}</div></a>`;

// Filter-chip script shared by the gallery and its facet pages. Chips are real links to the clean URL of the state they
// select (so crawlers and no-JS visitors navigate); with JS, a chip whose state stays inside what this page rendered
// filters in place and replaceState()s to that clean URL (no history entries, so Back leaves the page). SCOPE is the
// facet the server applied ({k,v}) or null on /ui.
const FILTER_JS = (base, scope, page) => `<script>
(function(){var S=${UI_SLUG_JS()},B=${JSON.stringify(base)},SCOPE=${JSON.stringify(scope)},PAGE=${page || 0},shown=PAGE||1e9,f={platform:"",group:"",pattern:"",style:""},
cards=[].slice.call(document.querySelectorAll("#grid .card")),cnt=document.getElementById("count"),more=document.getElementById("more"),word=cnt.dataset.word||"screen";
if(SCOPE)f[SCOPE.k]=SCOPE.v;
try{var q=new URLSearchParams(location.search);["platform","style"].forEach(function(k){var v=q.get(k==="platform"?"device":k)||q.get(k);if(v&&!(SCOPE&&SCOPE.k===k))f[k]=v})}catch(e){}
function grp(p){var c=document.querySelector('.sub .chip[data-v="'+String(p).replace(/[^a-z0-9-]/g,"")+'"]');return c?c.closest(".sub").dataset.g:""}
if(f.pattern&&!f.group)f.group=grp(f.pattern);
function url(s){var q=new URLSearchParams(),seg="";
if(s.pattern){seg=S.p[s.pattern]||s.pattern;if(s.platform)q.set("device",s.platform);if(s.style)q.set("style",s.style)}
else if(s.group&&S.f["group:"+s.group]){seg=S.f["group:"+s.group];if(s.platform)q.set("device",s.platform);if(s.style)q.set("style",s.style)}
else if(s.platform&&S.f["platform:"+s.platform]){seg=S.f["platform:"+s.platform];if(s.style)q.set("style",s.style)}
else if(s.style&&S.f["style:"+s.style])seg=S.f["style:"+s.style];
q=q.toString();return B+"/ui"+(seg?"/"+seg:"")+(q?"?"+q:"")}
function next(b){var s={};for(var k in f)s[k]=f[k];s[b.dataset.f]=b.dataset.v;if(b.dataset.f==="group")s.pattern="";if(b.dataset.f==="pattern"&&b.dataset.v)s.group=grp(b.dataset.v);return s}
function inside(s){return !SCOPE||s[SCOPE.k]===SCOPE.v}
function apply(){var n=0;cards.forEach(function(c){var ok=true;for(var k in f)if(f[k]&&c.dataset[k]!==f[k])ok=false;if(ok)n++;c.style.display=ok&&n<=shown?"":"none"});
cnt.textContent=n+" "+word+(n===1?"":"s");if(more)more.hidden=n<=shown;document.querySelectorAll(".sub").forEach(function(s){s.hidden=s.dataset.g!==f.group});
document.querySelectorAll(".chip[data-f]").forEach(function(b){var s=b.closest(".sub");b.setAttribute("aria-pressed",String(f[b.dataset.f]===b.dataset.v&&(!s||s.dataset.g===f.group)));
var h=url(next(b));b.setAttribute("href",h);if(h.indexOf("?")>0)b.setAttribute("rel","nofollow");else b.removeAttribute("rel")})}
if(more)more.addEventListener("click",function(){shown+=PAGE*2;apply()});
document.querySelector(".filters").addEventListener("click",function(e){var b=e.target.closest(".chip[data-f]");if(!b||e.metaKey||e.ctrlKey||e.shiftKey||e.button)return;var s=next(b);if(!inside(s))return;
e.preventDefault();f=s;shown=PAGE||1e9;apply();try{history.replaceState(null,"",url(f))}catch(e){}});apply()})();
</script>`;

// The gallery (/ui) and its clean facet pages (/ui/<group|platform|style slug>): the facet is applied server-side
// (only matching cards are rendered) with its own title, H1, intro and self-canonical; secondary filters run in place.
async function uiGalleryPage(env, base, h, facet) {
  const all = (await uiRows(env)).map((r) => h.rowToItem(r, env));
  const site = siteOf(env);
  const have = new Set(all.map((x) => x.pattern));
  const match = (it) => !facet || (facet.kind === "group" ? UI_GROUP_OF[it.pattern] === facet.value : facet.kind === "platform" ? it.platform === facet.value : it.style === facet.value);
  const items = all.filter(match);
  if (!items.length) return new Response("not found", { status: 404, headers: { "Content-Type": "text/plain" } });
  const state = { platform: "", group: "", pattern: "", style: "" }; if (facet) state[facet.kind] = facet.value;
  const hrefFor = (k, v) => { const s = { ...state, [k]: v }; if (k === "group") s.pattern = ""; if (k === "pattern" && v) s.group = UI_GROUP_OF[v] || ""; return cleanUiUrl(s, base); };
  const chip = (k, v, text) => { const href = hrefFor(k, v); return `<a class="chip" data-f="${k}" data-v="${h.escHtml(v)}" href="${h.escHtml(href)}"${href.includes("?") ? ' rel="nofollow"' : ""} aria-pressed="${state[k] === v ? "true" : "false"}">${h.escHtml(text)}</a>`; };
  const chips = (k, lab, vals) => `<div><b>${lab}</b>${chip(k, "", "All")}${vals.map((v) => chip(k, v, label(v))).join("")}</div>`;
  const groups = [...UI_FILTER_GROUPS, ["sections", "Website sections", UI_SECTION_PATTERNS], UI_PAGE_GROUP, UI_COMPONENT_GROUP].map(([id, name, ps]) => [id, name, ps.filter((p) => have.has(p))]).filter((g) => g[2].length);
  const groupChips = `<div><b>Screens</b>${chip("group", "", "All")}${groups.filter((g) => g[0] !== "sections" && g[0] !== "websites" && g[0] !== "components").map((g) => chip("group", g[0], g[1])).join("")}</div>`
    + (groups.some((g) => g[0] === "components") ? `<div><b>Components</b>${chip("group", "components", "UI components")}</div>` : "")
    + (groups.some((g) => g[0] === "sections" || g[0] === "websites") ? `<div><b>Websites</b>${groups.some((g) => g[0] === "websites") ? chip("group", "websites", "Website templates") : ""}${groups.some((g) => g[0] === "sections") ? chip("group", "sections", "Website sections") : ""}</div>` : "")
    + groups.map(([id, name, ps]) => `<div class="sub" data-g="${id}"${state.group === id ? "" : " hidden"}><b></b>${chip("pattern", "", "All " + name.toLowerCase())}${ps.map((p) => chip("pattern", p, label(p))).join("")}</div>`).join("");
  const cards = items.map((it) => card(it, base, h, `<b>${h.escHtml(label(it.pattern))}${it.variant ? " · " + h.escHtml(label(it.variant)) : ""}</b> · ${h.escHtml(it.platform)} <span>· ${h.escHtml(it.style)}</span>`)).join("");
  const nP = new Set(items.map((x) => x.pattern)).size, nS = new Set(items.map((x) => x.style)).size;
  const word = facet && facet.kind === "group" && (facet.value === "emails" || facet.value === "websites") ? "template" : facet && facet.kind === "group" && facet.value === "components" ? "component" : "screen";
  const url = facet ? `${site}${base}/ui/${facet.slug}` : `${site}${base}/ui`;
  const desc = facet
    ? `${items.length} free ${lcFirst(facet.h1.replace(/^Free /, ""))} across ${nP} patterns${facet.kind === "style" ? "" : ` in ${nS} styles`}, each with copyable HTML and a DESIGN.md token file (light and dark). Original designs by Made Good Designs.`
    : `${items.length} original app screens and website sections across ${nP} patterns, for web and mobile in ${UI_STYLES.length} styles, plus ${Object.keys(UI_FLOWS).length} multi-step flows. Each one comes with copyable HTML and a DESIGN.md token file for AI coding agents. Free.`;
  const title = facet ? facet.title : "Free UI screens with HTML code & DESIGN.md | MGD";
  const body = head(h, { title, ogTitle: facet ? facet.h1 : "MGD UI Screens", desc, canonical: url,
    image: items[0] ? site + base + items[0].image : null,
    jsonld: { "@context": "https://schema.org", "@type": "CollectionPage", name: facet ? facet.h1 : "MGD UI Screens", url, description: desc, publisher: MGD_ORG(site), ...licenceLd(site, base),
      ...(facet ? { isPartOf: { "@type": "Collection", name: "MGD UI Screens", url: `${site}${base}/ui` }, mainEntity: { "@type": "ItemList", numberOfItems: items.length, itemListElement: items.slice(0, 24).map((it, i) => ({ "@type": "ListItem", position: i + 1, url: site + uiItemPath(it, base) })) } } : {}) } })
  + `${h.backLink(base, "/", "Back to inspiration")}
${facet ? `<nav class="crumb"><a href="${h.escHtml(base)}/ui">UI screens</a> › ${h.escHtml(facet.h1)}</nav>` : ""}
<h1>${h.escHtml(facet ? facet.h1 : "UI screens")}</h1>
${facet && facet.value === "websites" && industryLinks(base, h) ? `<p class="lede">By industry: ${industryLinks(base, h)}</p>` : ""}${facet ? `<p class="lede">${h.escHtml(facet.intro)} Every ${word} is an original design by Made Good Designs with its <b>HTML code</b> and a <b>DESIGN.md</b> of colour, type and spacing tokens, so you (or your AI coding agent) can build from it directly. Free to copy and adapt. See also <a href="${h.escHtml(base)}/ui"><b>all ${all.length} UI screens</b></a> and <a href="${h.escHtml(base)}/ui/flows"><b>${Object.keys(UI_FLOWS).length} multi-step flows</b></a>.</p>`
  : `<p class="lede">Original app screens and website sections for web and mobile, designed by Made Good Designs. Unlike screenshot libraries, every screen comes with its <b>HTML code</b> and a <b>DESIGN.md</b> with the colour, type and spacing tokens, so you (or your AI coding agent) can build from it directly. Free to copy and adapt. See also <a href="${h.escHtml(base)}/ui/flows"><b>${Object.keys(UI_FLOWS).length} multi-step flows</b></a>.</p>`}
<div class="filters">${chips("platform", "Platform", ["web", "mobile"])}${groupChips}${chips("style", "Style", UI_STYLES)}</div>
<p class="lede" id="count" data-word="${word}" style="margin:-.5rem 0 .5rem">${items.length} ${word}s</p><p style="margin:0 0 1rem">${THEME_SWITCH}</p>
<div class="grid" id="grid">${cards}</div><p style="text-align:center;margin:1.5rem 0"><button class="btn" id="more" hidden>Show more</button></p>${patternIndex(base, h, have)}${facetIndex(base, h, all)}${MCP_NOTE(base)}${RIGHTS}
</div>${FILTER_JS(base, facet ? { k: facet.kind, v: facet.value } : null, 48)}${THEME_JS}${h.saveWidget(base)}</body></html>`;
  return page(h, body);
}
// Facet slugs that have at least one screen (sitemap + crawlable index).
function uiFacetsPresent(rows) {
  const its = rows.map((r) => ({ pattern: r.category, platform: r.country, style: r.style }));
  const out = [];
  for (const g of [...UI_FILTER_GROUPS.map((x) => x[0]), "sections", "websites", "components"]) if (its.some((it) => UI_GROUP_OF[it.pattern] === g) && facetSlug("group", g)) out.push(facetSlug("group", g));
  for (const p of ["web", "mobile"]) if (its.some((it) => it.platform === p)) out.push(facetSlug("platform", p));
  for (const s of UI_STYLES) if (its.some((it) => it.style === s)) out.push(facetSlug("style", s));
  return out;
}
const facetIndex = (base, h, all) => {
  const link = (k, v, text) => { const s = facetSlug(k, v); return s && all.some((it) => (k === "group" ? UI_GROUP_OF[it.pattern] === v : k === "platform" ? it.platform === v : it.style === v)) ? `<a href="${h.escHtml(base)}/ui/${s}">${h.escHtml(text)}</a>` : ""; };
  return `<h2 style="font-size:1.05rem;margin:2.25rem 0 .5rem">Browse by category, device and style</h2><div class="pidx">${[...UI_FILTER_GROUPS.map(([id, name]) => link("group", id, name)), link("group", "sections", "Website sections"), link("group", "websites", "Website templates"), link("group", "components", "UI components"),
    link("platform", "web", "Web UI"), link("platform", "mobile", "Mobile app UI"), ...UI_STYLES.map((st) => link("style", st, label(st) + " style"))].filter(Boolean).join("<br>")}</div>`;
};

async function uiItemPage(id, env, base, h) {
  const row = await env.DB.prepare(`SELECT * FROM items WHERE id=? AND status='published' AND collection='ui'`).bind(id).first();
  if (!row) return new Response("not found", { status: 404, headers: { "Content-Type": "text/plain" } });
  const it = h.rowToItem(row, env), site = siteOf(env);
  const canonical = site + uiItemPath(it, base), imgAbs = site + base + it.image;
  const isSection = UI_SECTION_PATTERNS.includes(it.pattern) || UI_PAGE_PATTERNS.includes(it.pattern), isPage = UI_PAGE_PATTERNS.includes(it.pattern), isComp = UI_COMPONENT_PATTERNS.includes(it.pattern);
  const name = `${label(it.pattern)}${it.variant ? " (" + label(it.variant).toLowerCase() + ")" : ""} ${kindWord(it.pattern)} — ${it.platform}, ${it.style} style`;
  const related = (await uiRows(env, " AND category=? AND id<>? AND (country=? OR style=?)", [it.pattern, it.id, it.platform, it.style])).map((r) => h.rowToItem(r, env)).slice(0, 12);
  const facts = [["Pattern", label(it.pattern), `${base}/ui/${patternSlug(it.pattern)}`], ["Device", label(it.platform), cleanUiUrl({ platform: it.platform }, base)],
    ["Style", label(it.style), cleanUiUrl({ style: it.style }, base)], ["Product (fictional)", it.product, null], ["Category", label(it.app_category), null]];
  const flows = (it.flows || []).filter((f) => UI_FLOWS[f.id]);
  const pal = (it.palette || []).slice(0, 8).map((hx, i) => `<span class="sw" style="background:${h.escHtml(hx)}" title="${ROLES[i] || ""} ${h.escHtml(hx)}"></span>`).join("");
  const tags = uiShownTags(it.tags);
  const short = isPage ? `${label(it.pattern)}${it.variant && it.variant !== "homepage" ? " " + label(it.variant).toLowerCase() : ""} template (${it.platform}, ${it.style})`
    : `${it.variant ? label(it.variant) : label(it.pattern)} ${kindWord(it.pattern).replace("email ", "")} (${it.platform}, ${it.style})`; // variant name leads (keeps titles ≤ 60)
  const shows = ((it.description || "").match(/Shows ([^.]+)\./) || [])[1];
  const [mdText, specText, compHtml] = await Promise.all([`ui/${it.id}/DESIGN.md`, `ui/${it.id}/spec.json`, isComp ? `ui/${it.id}/index.html` : null].map((k) => (k ? env.BUCKET.get(k).then((o) => (o ? o.text() : null)).catch(() => null) : null)));
  const compParts = isComp ? componentParts(compHtml) : null;
  const tokens = mdText ? parseDesignMd(mdText) : null; // no tokens = no panel
  const spec = specText ? parseSpecJson(specText) : null; // written at ingest; absent on items ingested before the spec block → those lines are left out
  const specHtml = specBlock({ tokens, extras: mdText ? parseDesignExtras(mdText) : null, spec, pattern: it.pattern, style: it.style, isPage, isSection, isComp, hasDarkImage: !!it.image_dark, esc: h.escHtml });
  const kind = kindWord(it.pattern), what = `${label(it.pattern)} ${kind}`;
  const metaDesc = isComp ? `Free ${label(it.pattern)} UI component (${it.platform}, ${it.style}) with a live demo and copyable HTML, CSS and JavaScript: keyboard support, ARIA, light and dark tokens.` : `Free ${lcWords(short).replace(/ \(/, isPage ? " (" : " for " + (isSection ? "websites" : UI_EMAIL_PATTERNS.includes(it.pattern) ? "transactional email" : "apps") + " (")} with copyable HTML and a DESIGN.md of light and dark tokens.${shows ? " Shows " + shows + "." : ""}`;
  const body = head(h, { title: fitTitle(`${short} – HTML & DESIGN.md | MGD`, `${short} – HTML & DESIGN.md`, `${short} | MGD`, short), ogTitle: name, desc: metaDesc, canonical, image: imgAbs, ogType: "article",
    jsonld: { "@context": "https://schema.org", "@type": "CreativeWork", name, url: canonical, description: it.description || undefined,
      image: { "@type": "ImageObject", contentUrl: imgAbs, ...licenceLd(site, base) }, ...licenceLd(site, base),
      encoding: [{ "@type": "MediaObject", encodingFormat: "text/html", contentUrl: site + base + it.code }, { "@type": "MediaObject", encodingFormat: "text/markdown", name: "DESIGN.md", contentUrl: site + base + it.design_md }],
      isPartOf: { "@type": "Collection", name: "MGD UI Screens", url: `${site}${base}/ui` } },
    css: `.detail{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(0,1fr);gap:1.75rem;align-items:start}
.detail.mobile{grid-template-columns:minmax(0,390px) 1fr}
@media(max-width:820px){.detail,.detail.mobile{grid-template-columns:1fr}}
.shot{width:100%;height:auto;border:1px solid var(--border);border-radius:12px;background:var(--surface);display:block}
.pagebox .shot{max-height:none}.pagebox>.shotscroll{max-height:82vh;overflow:auto;border-radius:12px}
.desc{font-size:.98rem;line-height:1.55;margin:.4rem 0 1rem}
dl.facts{display:grid;grid-template-columns:max-content 1fr;gap:.3rem 1rem;margin:0 0 1.1rem;font-size:.9rem}dl.facts dt{color:var(--muted)}dl.facts dd{margin:0}
.pal{display:flex;border-radius:6px;overflow:hidden;margin:0 0 1.1rem;max-width:360px}.pal .sw{flex:1;height:1.6rem}
.acts{display:flex;flex-wrap:wrap;gap:.5rem;margin:0 0 1rem}
.tags{display:flex;flex-wrap:wrap;gap:.35rem;margin:0 0 1rem}.tags span{font-size:.72rem;color:var(--muted);border:1px solid var(--border);border-radius:999px;padding:.1rem .55rem}
.flows{font-size:.9rem;margin:0 0 1rem}.flows a{font-weight:600}
h2{font-size:1.05rem;margin:2.25rem 0 .75rem}${specHtml ? SPEC_CSS : ""}${isComp ? COMPONENT_CSS : ""}${tokens ? UI_KIT_CSS : ""}` })
  + `${h.backLink(base, "/ui", "Back to UI screens")}
${itemSibling(it, base, h)}<nav class="crumb"><a href="${h.escHtml(base)}/ui">UI screens</a> › <a href="${h.escHtml(base)}/ui/${h.escHtml(patternSlug(it.pattern))}">${h.escHtml(label(it.pattern))}</a> › ${h.escHtml(it.platform)}, ${h.escHtml(it.style)}</nav>
<div class="detail ${h.escHtml(it.platform)}">
  <div style="position:relative"${isPage ? ' class="pagebox"' : ""}>${isComp && compParts ? componentDemoHtml(it, base, h, name, it.height) + `<details style="margin-top:.6rem"><summary class="muted" style="font-size:.85rem;cursor:pointer">Screenshot</summary>` : ""}<button class="card__save" data-id="${h.escHtml(it.id)}" title="Save to a board">♥ Save</button>${isPage ? '<div class="shotscroll">' : ""}<img class="shot" fetchpriority="high"${dims(it)} src="${h.escHtml(base + it.image)}"${it.image_dark ? ` data-dark="${h.escHtml(base + it.image_dark)}"` : ""} alt="${h.escHtml(name)}"/>${isPage ? "</div>" : ""}${isComp && compParts ? "</details>" : ""}${it.image_dark ? `<div style="margin-top:.6rem">${THEME_SWITCH}</div>` : ""}</div>
  <div><h1>${h.escHtml(name)}</h1>${it.description ? `<p class="desc">${h.escHtml(it.description)}</p>` : ""}
    <div class="acts"><a class="btn dark" href="${h.escHtml(base + it.code)}" target="_blank" rel="noopener nofollow">Open live HTML ↗</a>
      <button class="btn" data-copy="${h.escHtml(base + it.code)}">Copy HTML</button><button class="btn" data-copy="${h.escHtml(base + it.design_md)}">Copy DESIGN.md</button>
      <a class="btn" href="${h.escHtml(base + it.design_md)}" download="DESIGN.md" rel="nofollow">Download DESIGN.md</a></div>
    ${flows.length ? `<p class="flows">Part of ${flows.map((f) => `<a href="${h.escHtml(flowPath(f.id, base, it.platform, it.style))}">${h.escHtml(UI_FLOWS[f.id])}</a> (step ${f.step})`).join(", ")}</p>` : ""}
    <dl class="facts">${facts.filter((f) => f[1]).map(([k, v, href]) => `<dt>${h.escHtml(k)}</dt><dd>${href ? `<a href="${h.escHtml(href)}">${h.escHtml(v)}</a>` : h.escHtml(v)}</dd>`).join("")}</dl>
    ${specHtml}${pal && !specHtml.includes('class="sc"') ? `<div class="pal" aria-label="Colour roles: background, surface, border, text, muted, primary, on-primary, accent">${pal}</div>` : ""}
    ${tags.length ? `<div class="tags">${tags.map((t) => `<span>${h.escHtml(t)}</span>`).join("")}</div>` : ""}
  </div></div>
${isComp ? componentCodeHtml(compParts, mdText, h) : ""}
${tokens ? uiKitPanel({ tokens, what, kind, name, pageUrl: canonical, mdUrl: site + base + it.design_md, codeUrl: site + base + it.code, ref: `ui-${flatSlug(it.pattern)}`, esc: h.escHtml }) : ""}
${related.length ? `<h2>More ${h.escHtml(label(it.pattern).toLowerCase())} ${kindWord(it.pattern, true)}</h2><div class="grid">${related.map((r) => card(r, base, h, `<b>${h.escHtml(r.platform)}</b>${r.variant ? " · " + h.escHtml(label(r.variant)) : ""} <span>· ${h.escHtml(r.style)}</span>`)).join("")}</div>` : ""}
${MCP_NOTE(base)}${RIGHTS}
</div><script>document.addEventListener("click",function(e){var c=e.target.closest("[data-copy-el]");if(c){var x=document.getElementById(c.dataset.copyEl),ct=c.textContent;navigator.clipboard.writeText(x?x.textContent:"").then(function(){c.textContent="Copied ✓";setTimeout(function(){c.textContent=ct},1600)},function(){c.textContent="Copy failed";setTimeout(function(){c.textContent=ct},1600)});return}var b=e.target.closest("[data-copy]");if(!b)return;var t=b.textContent;
fetch(b.dataset.copy).then(function(r){return r.text()}).then(function(s){return navigator.clipboard.writeText(s)}).then(function(){b.textContent="Copied ✓";setTimeout(function(){b.textContent=t},1600)},function(){b.textContent="Copy failed";setTimeout(function(){b.textContent=t},1600)})});</script>
${THEME_JS}${tokens ? UI_KIT_JS : ""}${h.saveWidget(base)}</body></html>`;
  return page(h, body);
}

// ---- Pattern landing pages (/ui/<pattern>) ------------------------------------------------------
async function uiPatternPage(pattern, env, base, h) {
  const items = (await uiRows(env, " AND category=?", [pattern])).map((r) => h.rowToItem(r, env));
  if (!items.length) return new Response("not found", { status: 404, headers: { "Content-Type": "text/plain" } });
  const site = siteOf(env), url = `${site}${base}/ui/${patternSlug(pattern)}`, isSection = UI_SECTION_PATTERNS.includes(pattern), tn = nicheOfPattern(pattern);
  const c = UI_COPY[pattern] || {}, lab = label(pattern), kind = kindWord(pattern).replace("email ", "");
  const h1 = patternH1(pattern) || c.h1 || `${lab} ${isSection ? "section" : UI_EMAIL_PATTERNS.includes(pattern) ? "template" : "UI"} examples`;
  const nStyles = new Set(items.map((x) => x.style)).size, plats = [...new Set(items.map((x) => x.platform))];
  const desc = `${items.length} free ${lcFirst(h1)} for ${plats.join(" and ")} in ${nStyles} styles, each with HTML code and a DESIGN.md (light and dark). Original designs.`;
  const flows = Object.entries(UI_FLOWS).filter(([id]) => items.some((it) => (it.flows || []).some((f) => f.id === id)));
  const faq = (c.faq || []).filter((x) => Array.isArray(x) && x[0] && x[1]);
  const jsonld = [{ "@context": "https://schema.org", "@type": "CollectionPage", name: `${h1} with code`, url, description: c.intro || desc,
    isPartOf: { "@type": "Collection", name: "MGD UI Screens", url: `${site}${base}/ui` }, publisher: MGD_ORG(site), ...licenceLd(site, base),
    mainEntity: { "@type": "ItemList", numberOfItems: items.length, itemListElement: items.slice(0, 24).map((it, i) => ({ "@type": "ListItem", position: i + 1, url: site + uiItemPath(it, base) })) } }];
  if (faq.length) jsonld.push({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) });
  const nd = tn ? liveDesigns(tn).length : 0; // sub-niche pages count distinct designs, not style and device screens
  if (tn) jsonld.push(crumbLd(site, base, nicheCrumbs(tn)));
  const chipLink = (k, v, text) => { const href = cleanUiUrl({ pattern, [k]: v }, base); return `<a class="chip" data-f="${k}" data-v="${h.escHtml(v)}" href="${h.escHtml(href)}"${href.includes("?") ? ' rel="nofollow"' : ""} aria-pressed="${v ? "false" : "true"}">${h.escHtml(text)}</a>`; };
  const chips = (k, lab2, vals) => `<div><b>${lab2}</b>${chipLink(k, "", "All")}${vals.map((v) => chipLink(k, v, label(v))).join("")}</div>`;
  const cards = items.map((it) => card(it, base, h, `<b>${h.escHtml(label(it.platform))}</b>${it.variant ? " · " + h.escHtml(label(it.variant)) : ""} <span>· ${h.escHtml(it.style)}</span>`)).join("");
  const body = head(h, { css: tn ? nicheCss : "", md: tn ? `${url}.md` : null, title: tn ? fitTitle(`${h1} (${nd} designs, free, with code) | MGD`, `${h1} (${nd} designs, free) | MGD`, `${h1} (${nd} free) | MGD`, `${h1} | MGD`) : fitTitle(`${h1} (${items.length} free, with code) | MGD`, `${h1} (${items.length} free) | MGD`, `${h1} with code | MGD`, `${h1} | MGD`, `${h1.replace(/ \(.*\)$/, "")} (${items.length} free, with code) | MGD`, `${h1.replace(/ \(.*\)$/, "")} | MGD`, h1), ogTitle: `${h1} with code`, desc, canonical: url,
    image: site + base + items[0].image, jsonld })
  + `${h.backLink(base, "/ui", "All UI screens")}
${tn ? nicheCrumbHtml(tn, h, base) : `<nav class="crumb"><a href="${h.escHtml(base)}/ui">UI screens</a> › ${h.escHtml(lab)}</nav>`}
<h1>${h.escHtml(h1)}</h1>
<p class="lede">${h.escHtml(c.intro || desc)} Every example is an original design that comes with its <b>HTML code</b> and a <b>DESIGN.md</b> of colour, type and spacing tokens, in light and dark. Free to use and adapt.</p>
${tn ? nicheDesignsBlock(tn, items, base, h, uiItemPath) + `<h2 class="s">Every screen, by style and device</h2>` : ""}<div class="filters">${plats.length > 1 ? chips("platform", "Device", plats) : ""}${chips("style", "Style", UI_STYLES.filter((x) => items.some((it) => it.style === x)))}<div>${THEME_SWITCH}</div></div>
<p class="lede" id="count" data-word="example" style="margin:-.5rem 0 1rem">${items.length} examples</p>
<div class="grid" id="grid">${cards}</div>
${flows.length ? `<h2 style="font-size:1.05rem;margin:2.25rem 0 .5rem">See it in a flow</h2><p class="lede" style="margin:0">${flows.map(([id, n]) => `<a href="${h.escHtml(flowPath(id, base))}"><b>${h.escHtml(n)}</b></a>`).join(" · ")}</p>` : ""}
${(c.tips || []).length ? `<h2 style="font-size:1.05rem;margin:2.25rem 0 .5rem">${h.escHtml(lab)} design tips</h2><ul class="tips">${c.tips.map((t) => `<li>${h.escHtml(t)}</li>`).join("")}</ul>` : ""}
${faq.length ? `<h2 style="font-size:1.05rem;margin:2.25rem 0 .25rem">Questions</h2><div class="faq">${faq.map(([q, a]) => `<h3>${h.escHtml(q)}</h3><p>${h.escHtml(a)}</p>`).join("")}</div>` : ""}
${patternIndex(base, h, await uiPopulated(env))}${MCP_NOTE(base)}${RIGHTS}
</div>${FILTER_JS(base, { k: "pattern", v: pattern }, 0)}${THEME_JS}${h.saveWidget(base)}</body></html>`;
  return page(h, body);
}

// ---- Flows -----------------------------------------------------------------------------------
// Steps whose screen isn't published yet are skipped (so a flow degrades to its existing steps); fewer than 2 = not available.
async function flowSteps(env, h, id, platform, style, opts = {}) {
  const f = FLOW_DEFS[id]; if (!f) return [];
  const idx = await uiSearchIndex(env);
  const byKey = idx.byKey || (idx.byKey = new Map(idx.docs.map((d) => [`${d.pattern}|${d.variant || ""}|${d.r.country}|${d.r.style}`, d.r])));
  const errs = new Set(f.errors || []), out = [];
  for (const st of f.steps) {
    if (opts.noErrors && errs.has(st)) continue;
    const [pa, v] = st.split(":");
    const row = byKey.get(`${pa}|${v || ""}|${platform}|${style}`);
    if (row) out.push({ it: h.rowToItem(row, env), step: out.length + 1, error: errs.has(st) });
  }
  return out.length >= 2 ? out : [];
}
const stepsHtml = (steps, base, h, platform) => `<div class="steps ${h.escHtml(platform)}">${steps.map(({ it, step, error }, i) => `${i ? '<span class="arr" aria-hidden="true">→</span>' : ""}<a class="step" href="${h.escHtml(uiItemPath(it, base))}"><img loading="lazy"${dims(it)} src="${h.escHtml(base + it.image)}"${it.image_dark ? ` data-dark="${h.escHtml(base + it.image_dark)}"` : ""} alt="Step ${step}: ${h.escHtml(label(it.pattern))}"/><div><b>${step}</b>${h.escHtml(label(it.pattern))}${it.variant ? " · " + h.escHtml(label(it.variant)) : ""}${error ? ' <span class="err">error state</span>' : ""}</div></a>`).join("")}</div>`;

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
  + `${h.backLink(base, "/ui", "Back to UI screens")}<h1>UI flows</h1><p class="lede">${h.escHtml(desc)} Shown here in the minimal style on web; open a flow to switch platform and style.</p><p style="margin:0 0 1rem">${THEME_SWITCH}</p>${blocks.join("")}${patternIndex(base, h, await uiPopulated(env))}${MCP_NOTE(base)}${RIGHTS}</div>${THEME_JS}${h.saveWidget(base)}</body></html>`;
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
  const have = new Set(rows.map((r) => r.category)); // only patterns that have screens (new patterns appear after their ingest)
  const urls = [`${site}${base}/ui`, `${site}${base}/ui/flows`, `${site}${base}/ui/terms`, ...UI_PATTERNS.filter((p) => have.has(p)).map((p) => `${site}${base}/ui/${patternSlug(p)}`), ...uiFacetsPresent(rows).map((slug) => `${site}${base}/ui/${slug}`), ...(await availableFlows(env)).map((id) => `${site}${base}/ui/flows/${id}`),
    ...[...new Set(treePaths())].filter((p) => !UI_PATTERNS.some((x) => patternSlug(x) === p)).map((p) => `${site}${base}/ui/${p}`),
    ...rows.map((r) => site + uiItemPath({ id: r.id, ...uiFields(r), style: r.style }, base))];
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `<url><loc>${u}</loc></url>`).join("\n")}\n</urlset>`,
    { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}

// ---- MCP -------------------------------------------------------------------------------------
export const UI_MCP_TOOLS = [
  {
    name: "search_ui_screens",
    description: "Search Made Good Designs' free library of ORIGINAL app screens and website sections (web and mobile), and find installable WordPress block themes by niche: dashboards, data tables, charts, login, sign-up, two-factor, onboarding, settings, profile, team members, billing, invoices, paywalls, cancel flows, kanban boards, calendars, file managers, editors, AI chat, e-commerce product/cart/checkout, transactional emails, shift schedules, time off, inventory, ops dashboards, photo feeds, empty/404/loading/success states, landing-page sections (hero, features, pricing, testimonials, FAQ, footer…) and UI components (tabs, accordion, tooltip, dropdown, toggle…), in 8 visual styles. Unlike screenshot libraries, every screen ships with copyable HTML and a DESIGN.md token file (colours with WCAG contrast, type, spacing). Each result gives the screenshot URL, colour roles, elements, any flows it belongs to, a page URL to cite and a screen_id — pass it to get_ui_screen_code to get the code. Use when building or designing an app screen or a marketing page.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "What screen you need, e.g. 'billing settings with plan cards', 'AI chat assistant', 'dashboard with data table'." },
        device: { type: "string", description: "Optional device: web or mobile." },
        platform: { type: "string", description: "Optional delivery platform: html or wordpress. wordpress returns installable block themes with download links, for example query 'cardiology'. web and mobile still work here and mean device." },
        pattern: { type: "string", description: "Optional pattern filter. Free text is fine: an exact id (e.g. doctor-directory, kanban-board, pricing) or a plain name ('doctor directory', 'kanban') is matched server-side. Call list_ui_patterns for the live list; new patterns are added often." },
        style: { type: "string", description: "Optional visual style: minimal, editorial, brutalist, luxury, playful, corporate, retro or monochrome." },
        limit: { type: "integer", description: "Max distinct screens (1-12, default 6). Each result also lists its other styles.", minimum: 1, maximum: 12 },
        elements: { type: "array", items: { type: "string" }, description: "Optional components the screen must contain (all of them), e.g. ['table', 'checkbox', 'badge'] or ['progress ring', 'avatar stack']. Plain words are fine; list_ui_patterns(kind='elements') shows the vocabulary." },
        distinct: { type: "boolean", description: "Default true: one result per screen (max 2 per pattern), other styles listed on one line. false = every style as its own result." },
        previews: { type: "boolean", description: "Default false. true = also attach the screenshots of the first 4 results as images (about 100 KB each), so you can see them without opening the URLs." },
      },
      required: ["query"],
    },
    annotations: { title: "Search UI screens", readOnlyHint: true, destructiveHint: false, openWorldHint: false },
  },
  {
    name: "get_ui_flow",
    description: "Get a multi-step UI flow from Made Good Designs' free UI library as an ordered list of original screens (same product and design system throughout), for web or mobile in one of 8 styles. Each step gives the screen, its screenshot, page URL and screen_id for get_ui_screen_code. Flows (ids; plain descriptions also work, and list_ui_patterns describes each): " + Object.keys(UI_FLOWS).join(", ") + ".", // ids only: with labels it passed the 1,024-char description limit some clients apply (1,409 chars on 4-Nov)
    inputSchema: {
      type: "object",
      properties: {
        flow: { type: "string", description: "Which flow: an id from the list above or a plain description ('reset password', 'open a bank account'); matched server-side. list_ui_patterns lists the live flows." },
        device: { type: "string", description: "web (default) or mobile." },
        platform: { type: "string", description: "Old name for device; web or mobile still work here." },
        style: { type: "string", description: "Default 'minimal'. Also: editorial, brutalist, luxury, playful, corporate, retro, monochrome." },
        include_errors: { type: "boolean", description: "Default true: include the flow's error/unhappy-path steps (wrong password, expired code, card declined, form errors). false = happy path only." },
        previews: { type: "boolean", description: "Default false. true = also attach the step screenshots as images (first 6 steps, about 100 KB each)." },
      },
      required: ["flow"],
    },
    annotations: { title: "Get UI flow", readOnlyHint: true, destructiveHint: false, openWorldHint: false },
  },
  {
    name: "get_ui_screen_code",
    description: "Get the code for a Made Good Designs UI screen (screen_id from search_ui_screens or get_ui_flow, or its page URL): the complete self-contained HTML/CSS page and/or its DESIGN.md (design tokens and rules for AI coding agents), or format=copy for the screen's copy deck as JSON. Use it as a starting point and adapt it to the user's framework (React, Tailwind, SwiftUI, etc.).",
    inputSchema: {
      type: "object",
      properties: {
        screen_id: { type: "string", description: "The screen_id (12 hex characters), or the screen's page URL." },
        format: { type: "string", description: "What to return (default 'both'): html, design_md, both, or copy (every visible string grouped by role as JSON: title, headings, navigation, buttons, labels, placeholders, messages, table headers, badges, text; for localisation or swapping in your own copy).", enum: ["html", "design_md", "both", "copy"] },
      },
      required: ["screen_id"],
    },
    annotations: { title: "Get UI screen code", readOnlyHint: true, destructiveHint: false, openWorldHint: false },
  },
  {
    name: "list_ui_patterns",
    description: "List every pattern (app screens, website sections, UI components and full website templates) and multi-step flow in Made Good Designs' free UI library, live, with screen counts, variants and flow steps. Use it to pick a pattern or flow id for search_ui_screens / get_ui_flow, or to see what exists before searching.",
    inputSchema: {
      type: "object",
      properties: { kind: { type: "string", description: "Optional: screens, sections, components (tabs, accordion, tooltip…), templates (full website templates by industry, with the template tree and WordPress themes), themes, flows, elements (component vocabulary for the elements filter) or all (default)." } },
    },
    annotations: { title: "List UI patterns", readOnlyHint: true, destructiveHint: false, openWorldHint: false },
  },
];
// previews=true: attach screenshots from R2 as MCP image content (webp). Best-effort: a missing or oversized object is skipped,
// never an error, so the text answer is always returned.
async function previewImages(env, its, dark, max) {
  const out = [];
  await Promise.all(its.slice(0, max).map(async (it, i) => {
    const src = (dark && it.image_dark) || it.image || "";
    if (!src.startsWith("/img/")) return;
    try {
      const o = await env.BUCKET.get(src.slice(5)); if (!o) return;
      const buf = new Uint8Array(await o.arrayBuffer()); if (buf.length > 400000) return;
      let bin = ""; for (let j = 0; j < buf.length; j += 0x8000) bin += String.fromCharCode.apply(null, buf.subarray(j, j + 0x8000));
      out[i] = { type: "image", data: btoa(bin), mimeType: src.endsWith(".png") ? "image/png" : src.endsWith(".jpg") ? "image/jpeg" : "image/webp" };
    } catch (e) { /* skip */ }
  }));
  return out.filter(Boolean);
}
const CITE = "When you mention or show these screens to the user, credit them as \"UI by Made Good Designs\" with the page link. They are original designs, free to use and adapt in any project.";
export const isUiTool = (name) => name === "search_ui_screens" || name === "get_ui_screen_code" || name === "get_ui_flow" || name === "list_ui_patterns";

// Diversify: one result per pattern+variant (at most 2 per pattern), best style/platform first; the other styles of the
// same screen are listed as twins on one line instead of filling the answer with six restyled copies.
// byPlatform (a pattern filter is set): web and mobile count as different screens.
const ROLE_SHORT = ["bg", "surface", "border", "text", "muted", "primary", "on-primary", "accent"];
function diversify(ranked, limit, o) {
  const groups = new Map(), perPat = new Map(), picks = [];
  for (const x of ranked) {
    const r = x.r, v = (parseTags(r.tags).find((t) => t.startsWith("variant:")) || "");
    const key = o.distinct ? `${r.category}|${v}|${o.byPlatform ? r.country : ""}` : r.id;
    let g = groups.get(key);
    if (!g) {
      if (picks.length >= limit) continue;
      const n = perPat.get(r.category) || 0;
      if (o.distinct && !o.byPlatform && n >= 2) continue;
      perPat.set(r.category, n + 1);
      g = { row: r, twins: [] }; groups.set(key, g); picks.push(g); continue;
    }
    if (r.country === g.row.country && g.twins.length < 7 && !g.twins.some((t) => t.style === r.style)) g.twins.push({ style: r.style, id: r.id });
  }
  return picks;
}

const filt0 = (platform, pattern, style) => `${platform ? " on " + platform : ""}${pattern ? " in " + pattern : ""}${style ? " in the " + style + " style" : ""}`;

async function availableFlows(env) { const fake = { rowToItem: (r) => r }; const ok = []; for (const id of Object.keys(FLOW_DEFS)) if ((await flowSteps(env, fake, id, "web", "minimal")).length) ok.push(id); return ok; }
// Patterns that have published screens (crawlable pattern links must not point at a pattern before its screens are ingested).
async function uiPopulated(env) { const idx = await uiSearchIndex(env); return new Set(idx.docs.map((d) => d.pattern)); }

// All published UI rows + their search index, cached per isolate (the library is ~1.6k rows and changes only on ingest).
let UI_IDX = null;
async function uiSearchIndex(env) {
  if (UI_IDX && Date.now() - UI_IDX.at < 10 * 60 * 1000) return UI_IDX.idx;
  const rows = (await env.DB.prepare(`SELECT * FROM items WHERE status='published' AND owner_id IS NULL AND collection='ui'`).all()).results || [];
  const idx = buildIndex(rows, UI_PATTERNS, UI_ELEMENTS);
  UI_IDX = { at: Date.now(), idx };
  return idx;
}

// h = { mcpSearchRows, rowToItem, clampInt, site } from index.js
export async function callUiTool(name, a, env, h) {
  const site = h.site;
  const flowsLine = (it) => (it.flows || []).filter((f) => UI_FLOWS[f.id]).map((f) => `${f.id} step ${f.step}`).join(", ");
  if (name === "search_ui_screens") {
    const q = (a.query || "").toString().trim();
    // Every screen ships light AND dark (tokens + screenshot), so "dark" is a theme, not a search word: drop it from the text match
    // (it matched almost nothing and pushed out the right pattern) and lead with the dark screenshot instead.
    const wantDark = /\b(dark|night)(\s+(mode|theme|ui))?\b/i.test(q);
    const qText = wantDark ? q.replace(/\b(dark|night)(\s+(mode|theme|ui))?\b/gi, " ").replace(/\s+/g, " ").trim() : q;
    const limit = h.clampInt(a.limit, 6, 1, 12);
    const deliver = /^(wordpress|wp|html)$/i.test(String(a.platform || "")) ? String(a.platform).toLowerCase().replace("wp", "wordpress") : null; // Platform = what it ships as; web and mobile are the device
    if (!a.pattern || deliver === "wordpress") { const other = a.platform && !deliver && !resolvePlatform(a.platform) ? a.platform : "", ans = tplAnswer({ q: `${q} ${String(a.pattern || "").replace(/-/g, " ")} ${other}`, platform: deliver }, site); if (ans) return { content: [{ type: "text", text: `${ans}\n\n${CITE}` }] }; }
    const platform = resolvePlatform(a.device || (deliver ? null : a.platform)), style = resolveStyle(a.style);
    const pr = a.pattern ? resolveName(a.pattern, UI_PATTERNS, PATTERN_ALIASES) : null;
    const pattern = pr ? pr.id : null;
    const idx = await uiSearchIndex(env);
    const reqEls = (Array.isArray(a.elements) ? a.elements : typeof a.elements === "string" ? a.elements.split(/[,;]/) : []).map((x) => String(x).trim()).filter(Boolean).slice(0, 8);
    const els = reqEls.map((x) => resolveElement(x, idx)).filter(Boolean), unkEls = reqEls.filter((x) => !resolveElement(x, idx));
    let res = rankRows(qText, idx, { platform, style, pattern, elements: els });
    let elNote = unkEls.length ? ` (unknown element${unkEls.length > 1 ? "s" : ""} ignored: ${unkEls.join(", ")})` : "";
    if (els.length && !res.ranked.length) { // nothing has ALL the elements: rank by how many it has, and say so
      const all = rankRows(qText, idx, { platform, style, pattern });
      const nHas = (x) => els.filter((e) => elHas(x.d, e)).length;
      all.ranked = all.ranked.filter((x) => nHas(x) > 0).sort((p, q) => nHas(q) - nHas(p) || q.score - p.score);
      if (!all.ranked.length) return { content: [{ type: "text", text: `No screen in the library has ${els.map((e) => e.input).join(" or ")}${filt0(platform, pattern, style)} yet, so none are shown. Search again without the elements filter for the closest screens, or call list_ui_patterns(kind="elements") for the components that exist. Browse all at ${site}/ui` }] };
      res = all; elNote += ` (no screen has all of: ${els.map((e) => e.input).join(", ")}; showing screens with the most of them)`;
    }
    const filt = `${platform ? ", " + platform : ""}${pattern ? ", " + pattern : ""}${style ? ", " + style + " style" : ""}`;
    const patNote = elNote + ((a.device || (a.platform && !deliver)) && !platform ? ` (device "${a.device || a.platform}" not available yet; web and mobile only)` : "") + (a.style && !style ? ` (unknown style "${a.style}" ignored)` : "")
      + (a.pattern && !pattern ? ` (unknown pattern "${a.pattern}" ignored; list_ui_patterns shows them all)` : pr && pr.how !== "exact" ? ` (pattern "${a.pattern}" → ${pattern})` : "");
    const sugg = (res.suggestions || []).filter((p) => p !== pattern);
    const suggLine = sugg.length ? ` Closest patterns: ${sugg.map((p) => `${p} (${label(p).toLowerCase()})`).join(", ")} — search again with one of them, or pass pattern="…".` : "";
    let note = patNote, pool;
    if (res.tier === "none" && !pattern && !els.length) {
      const unk = res.terms.filter((t) => !t.df).map((t) => t.w);
      return { content: [{ type: "text", text: `No screen in the library matches "${q}"${filt}${unk.length ? ` (nothing about: ${unk.join(", ")})` : ""}, so none are shown rather than unrelated ones.${suggLine} Browse all at ${site}/ui` }] };
    }
    if (res.tier === "none") { pool = res.ranked; note += ` (no text match ${pattern ? `inside pattern ${pattern}` : "among screens with those elements"}; showing them by pattern order)`; }
    else {
      const top = res.ranked[0] ? res.ranked[0].score : 0;
      pool = res.tier === "all" ? res.ranked : res.ranked.filter((x) => x.text > 0 && x.score >= top * 0.2); // relevance floor: no filler
      if (res.tier === "partial") note += ` (no screen matches every part; closest matches, unmatched: ${res.unmatched.join(", ")})`;
    }
    const picks = diversify(pool, limit, { distinct: a.distinct !== false, byPlatform: !!pattern });
    if (!picks.length) return { content: [{ type: "text", text: `No screen in the library matches "${q}"${filt}.${suggLine} Browse all at ${site}/ui` }] };
    const nPat = new Set(picks.map((p) => p.row.category)).size;
    const hd = `${picks.length} UI screen(s) for "${q}"${filt} across ${nPat} pattern${nPat === 1 ? "" : "s"}${note}`;
    const blocks = picks.map(({ row, twins }, i) => {
      const it = h.rowToItem(row, env);
      const roles = (it.palette || []).map((hx, j) => `${ROLE_SHORT[j]} ${hx}`).join(" ");
      const fl = flowsLine(it);
      const shows = ((it.description || "").match(/Shows ([^]*?)\.\s+[A-Z][\w-]* style:/) || (it.description || "").match(/Shows ([^]*?)\.(\s|$)/) || [])[1];
      const d0 = idx.docs.find((d) => d.r.id === row.id);
      const matchedEls = els.length && d0 ? els.map((e) => e.names.find((n) => d0.els.has(n))).filter(Boolean) : [];
      const tw = twins.length ? `  other styles (same screen, pass the screen_id): ${twins.map((t) => `${t.style} ${t.id}`).join(" · ")}` : null;
      return [`${i + 1}. ${it.title}`, `  screen_id: ${it.id} · pattern: ${it.pattern}${it.variant ? " (" + it.variant + ")" : ""} · ${it.platform} · ${it.style}${it.app_category ? " · " + it.app_category : ""}${fl ? " · flows: " + fl : ""}`,
        shows ? `  shows: ${shows}` : (it.description ? `  ${it.description}` : null), matchedEls.length ? `  matched elements: ${matchedEls.join(", ")}` : null,
        d0 && d0.els.size ? `  elements: ${[...d0.els].slice(0, 18).join(", ")}${d0.layout ? ` · layout: ${d0.layout}${d0.density ? ", " + d0.density : ""}` : ""}` : null, roles ? `  colours (light): ${roles}` : null,
        wantDark && it.image_dark ? `  screenshot (dark): ${site}${it.image_dark}` : `  screenshot: ${site}${it.image}`, `  page (cite this): ${site}${uiItemPath(it, "")}`, tw].filter(Boolean).join("\n");
    });
    const darkNote = wantDark ? " Every screen ships a dark theme: its HTML switches on prefers-color-scheme or data-theme=\"dark\" on <html>, and DESIGN.md lists the dark colour tokens; light screenshots are the same URL without -dark." : " Dark screenshots: same URL ending -dark.webp.";
    const how = `Get code: get_ui_screen_code(screen_id) returns the HTML + DESIGN.md. Flows: get_ui_flow(flow). Browse any pattern at ${site}/ui.`;
    const hint = tplHint({ q }, site);
    const imgs = a.previews === true ? await previewImages(env, picks.map(({ row }) => h.rowToItem(row, env)), wantDark, 4) : [];
    return { content: [{ type: "text", text: `${hint ? hint + "\n\n" : ""}${hd}.${darkNote} ${how} ${CITE}${imgs.length ? ` Attached: screenshots of results 1-${imgs.length}, in order.` : ""}\n\n${blocks.join("\n\n")}` }, ...imgs] };
  }
  if (name === "get_ui_flow") {
    const fr = resolveName(a.flow, Object.keys(UI_FLOWS), Object.fromEntries(Object.entries(UI_FLOWS).map(([k, v]) => [k, [v, ...((FLOW_DEFS[k] || {}).aliases || [])]])));
    if (!fr) return { content: [{ type: "text", text: `No flow matches "${a.flow || ""}". Available: ` + Object.entries(UI_FLOWS).map(([k, v]) => `${k} (${v.toLowerCase()})`).join(", ") }], isError: true };
    const id = fr.id;
    const platform = resolvePlatform(a.device || a.platform) || "web", style = resolveStyle(a.style) || "minimal";
    const steps = await flowSteps(env, h, id, platform, style, { noErrors: a.include_errors === false });
    if (!steps.length) return { content: [{ type: "text", text: `The ${id} flow isn't available for ${platform}/${style} yet. Browse flows at ${site}/ui/flows` }] };
    const fd = FLOW_DEFS[id] || {}, nErr = steps.filter((s) => s.error).length;
    // until the error-step screens are ingested, don't claim the flow covers its failure states
    const acts = (fd.actions || []).filter((x) => nErr || !/declin|error|wrong|expir|lock|invalid|fail/i.test(x));
    const lines = steps.map(({ it, step, error }) => [`${step}. ${label(it.pattern)}${it.variant ? " (" + label(it.variant).toLowerCase() + ")" : ""}${error ? " — ERROR STATE" : ""}`, `   screen_id: ${it.id}`,
      it.description ? `   ${it.description}` : null, `   screenshot: ${site}${it.image}`, `   page: ${site}${uiItemPath(it, "")}`].filter(Boolean).join("\n"));
    const pal = (steps[0].it.palette || []).map((hx, i) => `${ROLES[i]} ${hx}`).join(", ");
    const matched = fr.how === "exact" ? "" : `(flow "${a.flow}" → ${id}) `;
    const fimgs = a.previews === true ? await previewImages(env, steps.map((x) => x.it), false, 6) : [];
    return { content: [{ type: "text", text: `${matched}Flow "${UI_FLOWS[id]}" — ${steps.length} steps${nErr ? ` incl. ${nErr} error state${nErr > 1 ? "s" : ""}` : ""}, ${platform}, ${style} style, product ${steps[0].it.product} (fictional).${acts.length ? " Covers: " + acts.join(", ") + "." : ""}${a.include_errors === false && (fd.errors || []).length ? " Error steps omitted (include_errors=false)." : ""} All steps share one design system${pal ? " (light colour roles: " + pal + ")" : ""}; get any step's HTML + DESIGN.md with get_ui_screen_code. Page (cite this): ${site}/ui/flows/${id}?platform=${platform}&style=${style}\n${CITE}${fimgs.length ? `\nAttached: screenshots of steps 1-${fimgs.length}, in order.` : ""}\n\n${lines.join("\n\n")}` }, ...fimgs] };
  }
  if (name === "list_ui_patterns") {
    const kind = String(a.kind || "all").toLowerCase();
    if (/^(theme|wordpress)/.test(kind)) return { content: [{ type: "text", text: `Made Good Designs template tree. Plain names work: search_ui_screens(query="cardiology", platform="wordpress").\n${tplListLines(site).join("\n")}` }] };
    const want = (k) => kind === "all" || kind.startsWith(k) || !/^(screen|section|flow|app|element|component)/.test(kind);
    const idx = await uiSearchIndex(env);
    const cnt = {}, vars = {};
    for (const d of idx.docs) { cnt[d.pattern] = (cnt[d.pattern] || 0) + 1; if (d.variant) (vars[d.pattern] = vars[d.pattern] || new Set()).add(d.variant); }
    const line = (p) => `  ${p} — ${label(p)} (${cnt[p] || 0} screens${vars[p] ? `; variants: ${[...vars[p]].join(", ")}` : ""})`;
    const out = [], grouped = new Set();
    if (want("screen") || kind.startsWith("app")) {
      out.push("APP SCREENS (pattern ids for search_ui_screens):");
      for (const [g, ps] of Object.entries(UI_TAXONOMY.screen_patterns || {})) {
        const live = ps.filter((p) => cnt[p]); live.forEach((p) => grouped.add(p));
        if (live.length) out.push(`${g}:`, ...live.map(line));
      }
      const rest = Object.keys(cnt).filter((p) => !grouped.has(p) && !UI_SECTION_PATTERNS.includes(p) && !UI_PAGE_PATTERNS.includes(p) && !UI_COMPONENT_PATTERNS.includes(p));
      if (rest.length) out.push("other:", ...rest.map(line));
    }
    if (want("section")) out.push("", "WEBSITE SECTIONS:", ...UI_SECTION_PATTERNS.filter((p) => cnt[p]).map(line));
    if ((want("section") || kind.startsWith("page") || kind.startsWith("website") || kind.startsWith("template")) && UI_PAGE_PATTERNS.some((p) => cnt[p])) out.push("", "WEBSITE TEMPLATES (full responsive home pages by industry):", ...UI_PAGE_PATTERNS.filter((p) => cnt[p]).map(line), ...tplListLines(site));
    if (want("component") && UI_COMPONENT_PATTERNS.some((p) => cnt[p])) out.push("", "UI COMPONENTS (HTML + CSS + a few lines of plain JS, keyboard support and ARIA per the WAI-ARIA Authoring Practices; pattern ids for search_ui_screens):", ...UI_COMPONENT_PATTERNS.filter((p) => cnt[p]).map(line));
    if (want("flow")) {
      const tf = UI_TAXONOMY.flows || {};
      out.push("", "FLOWS (ids for get_ui_flow):", ...Object.entries(UI_FLOWS).map(([k, v]) => `  ${k} — ${v}${tf[k] && tf[k].steps ? ` (${tf[k].steps.length} steps: ${tf[k].steps.join(" → ")})` : ""}`));
    }
    if (kind.startsWith("element")) {
      const f = {}; for (const d of idx.docs) for (const e of d.els) f[e] = (f[e] || 0) + 1;
      const top = Object.entries(f).filter(([, n]) => n >= 16).sort((p, q) => q[1] - p[1]);
      return { content: [{ type: "text", text: `Elements you can require with search_ui_screens(elements=[…]) — ${top.length} components found in the screens' own HTML and specs, with screen counts (plain words like 'checkboxes' or 'progress circle' are mapped):\n${top.map(([e, n]) => `${e} (${n})`).join(", ")}` }] };
    }
    return { content: [{ type: "text", text: `Made Good Designs UI library: ${idx.docs.length} screens, ${Object.keys(cnt).length} patterns, ${Object.keys(UI_FLOWS).length} flows; every pattern in web + mobile × ${UI_STYLES.length} styles (${UI_STYLES.join(", ")}), each with HTML + DESIGN.md. Plain names work too: search_ui_screens(pattern="doctor directory"). Browse: ${site}/ui\n\n${out.join("\n").trim()}` }] };
  }
  if (name === "get_ui_screen_code") {
    const m = String(a.screen_id || "").match(/([0-9a-f]{12})\/?$/);
    if (!m) return { content: [{ type: "text", text: "Pass screen_id from search_ui_screens (12 hex characters) or the screen's page URL." }], isError: true };
    const row = await env.DB.prepare(`SELECT * FROM items WHERE id=? AND status='published' AND collection='ui'`).bind(m[1]).first();
    if (!row) return { content: [{ type: "text", text: "No UI screen with that id. Find one with search_ui_screens." }], isError: true };
    const it = h.rowToItem(row, env), fmt = a.format || "both";
    const get = async (f) => { const o = await env.BUCKET.get(`ui/${it.id}/${f}`); return o ? o.text() : null; };
    const pageUrl = `${site}${uiItemPath(it, "")}`;
    if (fmt === "copy") {
      const t = await get("index.html");
      if (!t) return { content: [{ type: "text", text: "This screen's HTML is missing, so its copy can't be extracted. Try another screen_id." }], isError: true };
      const deck = { screen_id: it.id, title: it.title, pattern: it.pattern, variant: it.variant || null, platform: it.platform, style: it.style, product: it.product || null, page: pageUrl, strings: extractCopy(t) };
      return { content: [{ type: "text", text: `Copy deck for ${it.title} (all names, people and figures are fictional). Replace the strings with the user's own copy, or translate them, then pass them back into the HTML from get_ui_screen_code. ${CITE}\n\n\`\`\`json\n${JSON.stringify(deck, null, 1)}\n\`\`\`` }] };
    }
    const parts = [`${it.title} — ${pageUrl}\n${CITE} Keep the credit comment at the top of each file.`];
    if (fmt !== "design_md") { const t = await get("index.html"); parts.push("## index.html\n\n```html\n" + (t ? withCredit(t, "html", pageUrl, site) : "(missing)") + "\n```"); }
    if (fmt !== "html") { const t = await get("DESIGN.md"); parts.push("## DESIGN.md\n\n" + (t ? withCredit(t, "md", pageUrl, site) : "(missing)")); }
    return { content: [{ type: "text", text: parts.join("\n\n") }] };
  }
  return { content: [{ type: "text", text: "Unknown tool: " + name }], isError: true };
}
