// Ranking for search_ui_screens (pure JS, no Worker or D1 dependencies, so tests/ui_rank can run it in node).
// Built 3-Nov-2026 from the real MCP query log: the old SQL LIKE search had no stemming, no synonyms, no
// pattern boost and a created_at tiebreak, so "banking app onboarding" returned the canvas editor.
//
// Model: every query word is stemmed and weighted by rarity (IDF over the library). Each row scores the best
// field a word hits: pattern name/aliases > screen title > elements (tags) > product category > description.
// A fully matched multi-word alias ("doctor directory", "now playing") adds a bonus. Ties break on the
// canonical pattern order, then platform/style preference — never on created_at.

export const UI_STYLE_LIST = ["minimal", "editorial", "brutalist", "luxury", "playful", "corporate", "retro", "monochrome"];

// Curated aliases per pattern: the words people actually use for it. Matched after stemming.
export const PATTERN_ALIASES = {
  "dashboard": ["dashboard", "kpi", "kpis", "overview", "admin dashboard", "analytics dashboard", "stat tiles", "summary cards", "home dashboard"],
  "data-table": ["data table", "table", "datagrid", "data grid", "spreadsheet", "rows", "records", "customers table", "row selection"],
  "analytics-charts": ["analytics", "analytics report", "charts", "chart", "graphs", "report", "reporting", "donut chart", "revenue chart", "metrics"],
  "login": ["login", "sign in", "log in", "signin"],
  "sign-up": ["sign up", "signup", "register", "registration", "create account", "create an account"],
  "forgot-password": ["forgot password", "reset password", "password reset", "lost password"],
  "two-factor": ["two factor", "2fa", "mfa", "otp", "verification code", "one time code", "authenticator"],
  "welcome": ["welcome", "welcome screen", "get started", "carousel", "intro screen", "splash"],
  "onboarding-step": ["onboarding", "onboarding step", "choose your goal", "questionnaire", "setup step", "one question"],
  "permissions-request": ["permission", "permissions request", "notification permission", "allow notifications", "push permission"],
  "home": ["home", "home screen", "today", "habit", "habits", "daily", "checklist home", "fitness"],
  "feed": ["feed", "posts", "social feed", "photo feed", "community feed"],
  "list-view": ["list", "list view", "task list", "todo", "to do", "grouped list", "my tasks"],
  "detail-view": ["detail", "detail page", "record detail", "task detail", "item detail", "detail view"],
  "kanban-board": ["kanban", "kanban board", "board", "pipeline", "columns"],
  "calendar": ["calendar", "week view", "agenda", "schedule", "weekly calendar"],
  "file-manager": ["file manager", "files", "folders", "drive", "file browser", "downloads", "download queue", "uploads"],
  "search-results": ["search results", "search", "results", "search page"],
  "editor-toolbar": ["document editor", "text editor", "rich text", "editor", "toolbar", "writing", "docs editor"],
  "chat-ai-assistant": ["ai chat", "chat assistant", "chatbot", "ai assistant", "assistant", "copilot", "suggested prompts", "ai chat assistant"],
  "chat-list": ["chat list", "inbox", "conversations", "messages", "messaging", "chat inbox"],
  "chat-thread": ["chat thread", "channel", "thread", "chat", "team chat"],
  "video-call": ["video call", "video meeting", "meeting", "video conference", "call in progress"],
  "image-viewer": ["image viewer", "lightbox", "photo viewer", "gallery viewer", "fullscreen photo"],
  "map-view": ["map", "explore map", "map view", "location", "places"],
  "video-player": ["video player", "video", "watch", "player controls"],
  "create-post": ["create post", "new post", "compose", "composer", "upload photo", "post a photo"],
  "class-schedule": ["class schedule", "classes", "timetable", "schedule", "class"],
  "booking-details": ["booking", "book", "reservation", "booking details", "appointment booking", "book a class"],
  "booking-confirmed": ["booking confirmed", "booking confirmation", "reservation confirmed", "booked"],
  "product-detail": ["product detail", "product page", "pdp", "product", "shop", "store", "shopping", "ecommerce", "item page"],
  "cart": ["cart", "shopping cart", "basket", "bag"],
  "checkout": ["checkout", "payment", "pay", "shipping", "payment form"],
  "order-confirmation": ["order confirmation", "order confirmed", "order placed", "order"],
  "settings": ["settings", "preferences", "toggle", "toggle switches", "switches", "account settings", "settings list", "configuration", "settings panel"],
  "profile": ["profile", "member profile", "user profile", "account page", "profile header"],
  "notifications-center": ["notifications", "notification center", "notification", "alerts", "activity feed"],
  "team-members": ["team members", "members", "invite", "teammates", "users", "staff", "team"],
  "roles-permissions": ["roles", "permissions", "roles and permissions", "access control", "rbac"],
  "audit-log": ["audit log", "activity log", "log", "events log", "security log"],
  "api-keys": ["api keys", "api key", "tokens", "secret key", "developer keys"],
  "integrations": ["integrations", "connected apps", "connectors", "integrations settings", "apps"],
  "billing-plans": ["billing", "billing plans", "plans", "subscription", "usage", "current plan", "billing settings"],
  "invoice": ["invoice", "line items", "bill", "invoice detail", "payment status"],
  "paywall-upgrade": ["paywall", "upgrade", "upsell", "trial", "pro plan", "go premium"],
  "cancel-subscription": ["cancel subscription", "cancel", "churn", "retention offer", "unsubscribe"],
  "empty-state": ["empty state", "empty", "no data", "first run", "zero state", "inbox zero", "blank state"],
  "error-404": ["404", "not found", "error page", "page not found", "error"],
  "loading-skeleton": ["loading", "skeleton", "loader", "shimmer", "loading state"],
  "success-confirmation": ["success", "confirmation", "confirmed", "celebration", "completed", "done"],
  "ai-workspace": ["ai workspace", "generation", "generate", "ai generation", "prompt", "generator", "input panel", "ai tool"],
  "ai-settings": ["ai settings", "model settings", "assistant settings", "provider", "providers", "model", "models", "voice assistant", "ai model"],
  "version-history": ["version history", "versions", "version", "diff", "compare versions", "revision", "revisions", "before and after", "changes history"],
  "approval-queue": ["approval", "approve", "approval queue", "pending requests", "reject", "review queue", "requests", "approve reject"],
  "doctor-directory": ["doctor directory", "doctors", "doctor", "find a doctor", "medical team", "physicians", "care team", "doctor profile", "directory", "specialists"],
  "telehealth-visit": ["telehealth", "telemedicine", "video consultation", "video consult", "virtual visit", "virtual appointment", "waiting room", "visit summary", "consultation"],
  "clinic-home": ["clinic", "hospital", "clinic homepage", "medical specialties", "patient homepage", "healthcare website", "medical"],
  "music-player": ["music player", "now playing", "nowplaying", "audio player", "music", "player", "audio", "podcast player"],
  "playlist": ["playlist", "album", "track list", "tracklist", "tracks", "songs"],
  "portfolio-home": ["portfolio", "personal site", "work index", "personal portfolio", "selected work", "portfolio hero"],
  "case-study": ["case study", "case studies", "project write up"],
  "security-dashboard": ["security dashboard", "vulnerabilities", "vulnerability", "severity", "threats", "cve", "security"],
  "project-tracker": ["project tracker", "projects", "project", "project dashboard", "phases", "milestones", "progress ring", "project status"],
  "course-dashboard": ["course", "courses", "learning", "lms", "students", "student", "lessons", "school", "teacher", "education"],
  "form-wizard": ["form wizard", "wizard", "multi step form", "multistep form", "stepper", "step form", "application form", "multi step"],
  "bank-onboarding": ["bank onboarding", "bank account", "open account", "open a bank account", "kyc", "identity verification", "fintech", "account setup", "bank", "money account"],
  "product-scan": ["scan", "scanner", "barcode", "camera scan", "ingredients", "skincare", "beauty", "scan result"],
  "split-view": ["master detail", "split view", "detail pane", "list and detail", "two pane", "split pane"],
  "canvas-editor": ["canvas", "flow diagram", "sitemap", "diagram", "whiteboard", "nodes", "flowchart", "inspector"],
  "floor-plan": ["floor plan", "office map", "desk booking", "room booking", "building map", "indoor map"],
  "voice-call": ["voice call", "phone call", "call in progress", "calling", "audio call", "call"],
  // interaction states (3-Nov-2026 round 3)
  "toast-snackbar": ["toast", "snackbar", "toast notification", "undo", "undo toast", "toast with undo", "notification toast"],
  "confirm-dialog": ["confirm dialog", "confirmation dialog", "confirm delete", "delete confirmation", "destructive", "modal", "dialog", "are you sure", "type to confirm"],
  "side-drawer": ["drawer", "side drawer", "side panel", "slide over", "detail panel", "sheet", "bottom sheet"],
  "command-palette": ["command palette", "cmd k", "command menu", "quick switcher", "spotlight search", "command bar"],
  "date-range-picker": ["date range", "date range picker", "date picker", "range picker", "calendar picker", "datepicker"],
  "form-validation": ["validation", "form validation", "form errors", "inline errors", "error messages", "error state", "invalid", "error summary"],
  "auth-error": ["login error", "sign in error", "wrong password", "incorrect password", "account locked", "locked out", "code expired", "expired code", "auth error", "failed login"],
  "payment-declined": ["card declined", "payment declined", "payment failed", "payment error", "declined", "checkout error", "insufficient funds"],
  // website sections
  "hero": ["hero", "landing hero", "hero section", "above the fold", "landing page", "landing"],
  "navigation-header": ["navigation", "nav", "header", "navbar", "mega menu", "menu", "navigation header"],
  "feature-grid": ["features", "feature grid", "feature list", "benefits", "feature section"],
  "bento-features": ["bento", "bento grid", "bento features"],
  "how-it-works": ["how it works", "process steps", "steps", "process"],
  "logo-cloud": ["logo cloud", "logos", "trusted by", "customer logos", "logo wall"],
  "stats-band": ["stats band", "stats", "statistics", "numbers band", "metrics band"],
  "testimonials": ["testimonials", "testimonial", "reviews", "quotes", "customer stories", "social proof"],
  "pricing": ["pricing", "pricing plans", "price table", "pricing table", "packages", "tiers", "pricing section"],
  "comparison-table": ["comparison table", "comparison", "compare", "side by side", "versus"],
  "integrations-grid": ["integrations directory", "integrations grid", "app directory", "app tiles", "marketplace"],
  "security-trust": ["security and trust", "trust", "compliance", "soc 2", "gdpr"],
  "faq": ["faq", "faqs", "questions", "accordion", "frequently asked"],
  "cta-banner": ["cta", "call to action", "cta banner", "signup banner"],
  "about-team": ["about", "about us", "team page", "our team", "team grid", "about page"],
  "careers": ["careers", "jobs", "open roles", "hiring", "job listings", "job board"],
  "blog-index": ["blog", "articles", "blog index", "news", "posts index"],
  "changelog": ["changelog", "release notes", "updates", "whats new", "timeline", "changelog timeline"],
  "contact-form": ["contact", "contact form", "enquiry", "inquiry", "contact sales", "get in touch"],
  "footer": ["footer", "site footer"],
};
// Words that only point at a nearby pattern (used for suggestions when nothing matches, never as matches).
const HINTS = { homeservices: ["booking-details", "class-schedule"], shoe: ["product-detail", "cart"], sneaker: ["product-detail", "cart"], shirt: ["product-detail"], dress: ["product-detail"],
  jacket: ["product-detail"], furniture: ["product-detail"], grocery: ["cart", "product-detail"], food: ["product-detail", "hero"],
  restaurant: ["booking-details", "hero"], plumber: ["booking-details", "class-schedule"], cleaning: ["booking-details"], salon: ["booking-details", "class-schedule"],
  hotel: ["booking-details", "map-view"], flight: ["booking-details", "checkout"], travel: ["map-view", "booking-details"], real: ["map-view", "detail-view"],
  estate: ["map-view", "detail-view"], property: ["map-view", "detail-view"], toast: ["success-confirmation", "notifications-center"], snackbar: ["success-confirmation", "notifications-center"],
  undo: ["success-confirmation"], modal: ["cancel-subscription", "paywall-upgrade"], dialog: ["cancel-subscription", "paywall-upgrade"], drawer: ["split-view", "detail-view"],
  range: ["calendar", "booking-details"], picker: ["calendar", "booking-details"], dropdown: ["settings", "navigation-header"], watch: ["home", "music-player"],
  weather: ["home", "dashboard"], recipe: ["detail-view", "feed"], donation: ["checkout", "hero"], charity: ["checkout", "hero"], crypto: ["dashboard", "bank-onboarding"],
  game: ["home", "feed"], quiz: ["onboarding-step", "form-wizard"], survey: ["form-wizard", "onboarding-step"], delivery: ["map-view", "order-confirmation"] };

const STOP = new Set(["the", "and", "for", "with", "from", "that", "this", "are", "some", "any", "of", "to", "in", "on", "an", "or", "by", "at", "as", "is", "it", "its",
  "my", "our", "your", "me", "we", "us", "up", "per", "via", "into", "like", "also", "each", "all", "one", "who", "what", "show", "need", "want", "give",
  "app", "apps", "application", "screen", "screens", "page", "pages", "ui", "ux", "view", "design", "designs", "designed", "layout", "layouts", "interface",
  "template", "templates", "component", "components", "example", "examples", "inspiration", "idea", "ideas", "reference", "references", "mockup", "website", "site", "web",
  "mobile", "ios", "iphone", "android", "desktop", "tablet", "responsive", "style", "styled", "theme", "themed", "mode", "light", "dark", "night",
  // tone words: describe a look, not a screen (styles are their own filter)
  "clean", "modern", "simple", "beautiful", "nice", "premium", "warm", "friendly", "calm", "soft", "rounded", "big", "large", "small", "clear", "readable",
  "distinctive", "professional", "trustworthy", "human", "centered", "centred", "easy", "browse", "sleek", "elegant", "bold", "colourful", "colorful", "cute",
  "fun", "serious", "oriented", "focused", "compact", "dense", "full", "height", "high", "quality", "best", "good", "great", "new", "blue", "green",
  "red", "purple", "orange", "black", "white", "pink", "yellow", "grey", "gray", "vibrant", "pastel", "neutral", "subtle", "exclusive", "decorative", "graphics",
  "hierarchy", "minimalist", "contemporary", "trendy", "polished", "pretty", "lovely", "creative", "unique", "stunning", "awesome", "fresh", "sophisticated"]);
const STYLE_WORDS = { minimal: "minimal", minimalist: "minimal", clean: "minimal", editorial: "editorial", magazine: "editorial", brutalist: "brutalist", brutal: "brutalist",
  luxury: "luxury", premium: "luxury", elegant: "luxury", playful: "playful", fun: "playful", friendly: "playful", cute: "playful", corporate: "corporate", enterprise: "corporate",
  business: "corporate", retro: "retro", vintage: "retro", monochrome: "monochrome", mono: "monochrome", grayscale: "monochrome", greyscale: "monochrome" };
const PLATFORM_WORDS = { mobile: "mobile", ios: "mobile", iphone: "mobile", android: "mobile", web: "web", desktop: "web", website: "web", browser: "web" };

// Multi-word phrases folded into one token before splitting (applied to queries and documents alike).
const PHRASES = [[/\bsign[\s-]?in\b/g, "login"], [/\blog[\s-]?in\b/g, "login"], [/\bsign[\s-]?up\b/g, "signup"], [/\bto[\s-]do\b/g, "todo"],
  [/\be[\s-]commerce\b/g, "ecommerce"], [/\bnow[\s-]playing\b/g, "nowplaying"], [/\bwhat'?s new\b/g, "whatsnew changelog"], [/\bcheck[\s-]out\b/g, "checkout"],
  [/\bmulti[\s-]step\b/g, "multistep"], [/\bmaster[\s-]detail\b/g, "masterdetail"], [/\bwork[\s-]?flow\b/g, "workflow"], [/\b2[\s-]?fa\b/g, "2fa"],
  [/\bone[\s-]time\b/g, "onetime"], [/\bset[\s-]?up\b/g, "setup"], [/\bdrop[\s-]?down\b/g, "dropdown"], [/\bfaq'?s\b/g, "faq"], [/\b(e-?mail)\b/g, "email"],
  [/\bhome[\s-]services?\b/g, "homeservices"], [/\bcolou?rs?\b/g, "colour"], [/\bkpis?\b/g, "kpi"]];
const IRREG = { children: "child", people: "person", men: "man", women: "woman", analyses: "analysis", statuses: "status", buses: "bus", menus: "menu" };

export function stem(w) {
  if (IRREG[w]) return IRREG[w];
  if (w.length <= 3 || /\d/.test(w)) return w;
  let s = w, cut = false;
  if (s.endsWith("ies") && s.length > 4) s = s.slice(0, -3) + "y";
  else if (s.endsWith("sses")) s = s.slice(0, -2);
  else if (/(ch|sh|x|zz)es$/.test(s)) s = s.slice(0, -2);
  else if (s.endsWith("s") && !/(ss|us|is|os)$/.test(s)) s = s.slice(0, -1);
  if (s.endsWith("ing") && s.length - 3 >= 4) { s = s.slice(0, -3); cut = true; }
  else if (s.endsWith("ed") && s.length - 2 >= 4) { s = s.slice(0, -2); cut = true; }
  if (cut && /([b-df-hj-np-tv-z])\1$/.test(s) && !/(ll|ss|zz)$/.test(s)) s = s.slice(0, -1); // running → run, but keep "scroll"
  if (s.length > 3 && s.endsWith("e")) s = s.slice(0, -1); // price/pricing → pric, share/shared → shar
  return s;
}
const norm = (s) => { let t = String(s || "").toLowerCase().replace(/[’']/g, "'"); for (const [re, to] of PHRASES) t = t.replace(re, to); return t; };
export function words(s) { return norm(s).split(/[^\p{L}\p{N}]+/u).filter((w) => w.length > 1 || /\d/.test(w)); }
export function tokens(s, keepStop) { return words(s).filter((w) => keepStop || !STOP.has(w)).map(stem); }

// Character trigrams, for typo tolerance ("dashbord", "kanbam") and free-text pattern names.
const grams = (w) => { const s = ` ${w} `, g = new Set(); for (let i = 0; i < s.length - 2; i++) g.add(s.slice(i, i + 3)); return g; };
const jacc = (a, b) => { let n = 0; for (const x of a) if (b.has(x)) n++; return n / (a.size + b.size - n || 1); };

const W = { pattern: 3, title: 2, tags: 1.5, industry: 1.2, desc: 0.6 };

// Build once per row set (the Worker caches it per isolate).
export function buildIndex(rows, patternOrder, elMap) {
  const order = new Map((patternOrder || []).map((p, i) => [p, i]));
  const pat = {}; // pattern → { tok:Set, aliases:[[tokens]], label }
  const patOf = (p) => pat[p] || (pat[p] = { tok: new Set(), all: new Set(), aliases: [] });
  for (const p of new Set([...(patternOrder || []), ...Object.keys(PATTERN_ALIASES)])) {
    const P = patOf(p);
    for (const a of [p.replace(/-/g, " "), ...(PATTERN_ALIASES[p] || [])]) {
      const t = tokens(a); if (!t.length) continue;
      P.aliases.push(t);
      if (t.length === 1) P.tok.add(t[0]); // multi-word aliases only count when fully matched (aliasBonus): "first run" must not claim "running"
      t.forEach((x) => P.all.add(x));
    }
  }
  const docs = rows.map((r) => {
    const tags = parseArr(r.tags);
    const title = String(r.title || "").replace(/\s+—\s+[^—]*$/, ""); // drop " — web, playful (Fernway)"
    const d = String(r.description || "");
    const shows = (d.match(/Shows ([^]*?)\.\s+[A-Z][\w-]* style:/) || d.match(/Shows ([^]*?)\.\s/) || [])[1] || "";
    const first = d.split(/\.\s/)[0] || "";
    const variant = (tags.find((t) => t.startsWith("variant:")) || "").slice(8);
    // Element inventory: the row's own tags + the HTML-derived inventory (src/ui_elements.json, built by ui-screens/elements.js).
    const inv = (elMap && elMap[`${r.category}|${variant}|${r.country}`]) || null;
    const elTags = [...new Set([...tags.filter((t) => !/^(flow|variant):/.test(t) && t !== r.country && t !== r.category && t !== r.industry), ...((inv && inv.elements) || [])])];
    const f = { pattern: patOf(r.category || "").tok, title: new Set(tokens(title + " " + variant.replace(/-/g, " "))),
      tags: new Set(elTags.flatMap((t) => tokens(t.replace(/-/g, " ")))),
      industry: new Set(tokens(`${r.industry || ""} ${r.company || ""}`)), desc: new Set(tokens(first + " " + shows)) };
    const steps = tags.filter((t) => /^flow:[a-z0-9-]+:\d+$/.test(t)).map((t) => +t.split(":")[2]);
    patOf(r.category || "").n = (patOf(r.category || "").n || 0) + 1;
    return { r, f, variant, els: new Set(elTags), layout: inv ? inv.layout : null, density: inv ? inv.density : null, step: steps.length ? Math.min(...steps) : 0, pattern: r.category, ord: order.has(r.category) ? order.get(r.category) : 999 };
  });
  const df = new Map();
  for (const d of docs) { const seen = new Set(patOf(d.pattern || "").all); for (const k in d.f) for (const t of d.f[k]) seen.add(t); for (const t of seen) df.set(t, (df.get(t) || 0) + 1); }
  const vocab = [...df.keys()].filter((t) => t.length >= 4 && !/\d/.test(t)).map((t) => [t, grams(t)]);
  return { docs, df, N: Math.max(1, docs.length), pat, vocab, order };
}
function parseArr(s) { if (Array.isArray(s)) return s; try { const v = JSON.parse(s || "[]"); return Array.isArray(v) ? v : []; } catch (_) { return []; } }

// Parse a free-text query into weighted terms + soft preferences.
export function parseQuery(q, idx) {
  const raw = words(q);
  const prefs = { style: null, platform: null };
  for (const w of raw) { if (!prefs.style && STYLE_WORDS[w] && UI_STYLE_LIST.includes(STYLE_WORDS[w]) && /^(minimal|minimalist|editorial|brutalist|brutal|luxury|playful|corporate|retro|monochrome|vintage|magazine)$/.test(w)) prefs.style = STYLE_WORDS[w];
    if (!prefs.platform && PLATFORM_WORDS[w]) prefs.platform = PLATFORM_WORDS[w]; }
  const styleNames = new Set(["minimal", "minimalist", "editorial", "brutalist", "brutal", "luxury", "playful", "corporate", "retro", "monochrome", "vintage", "magazine", "mono", "grayscale", "greyscale"]);
  const seen = new Set(), terms = [];
  const maxIdf = Math.log(1 + idx.N);
  for (const w of raw) {
    if (STOP.has(w) || styleNames.has(w)) continue;
    let t = stem(w), fuzzy = false;
    if (seen.has(t)) continue;
    if (!idx.df.has(t) && t.length >= 4 && !/\d/.test(t)) { // typo tolerance: nearest vocabulary word by trigrams
      const g = grams(t); let best = null, bs = 0;
      for (const [v, vg] of idx.vocab) { const s = jacc(g, vg); if (s > bs) { bs = s; best = v; } }
      if (best && bs >= 0.5 && !seen.has(best)) { t = best; fuzzy = true; }
    }
    seen.add(t);
    const d = idx.df.get(t) || 0;
    terms.push({ w, t, df: d, idf: d ? Math.log(1 + idx.N / d) : maxIdf, fuzzy });
  }
  return { terms, prefs, raw };
}

// Score every row; return them ranked with match info. opts: { platform, style, pattern } hard filters (already resolved).
export function rankRows(q, idx, opts = {}) {
  const pq = parseQuery(q, idx);
  const terms = pq.terms, known = terms.filter((x) => x.df);
  const prefPlatform = opts.platform || pq.prefs.platform, prefStyle = opts.style || pq.prefs.style;
  const total = terms.reduce((s, x) => s + x.idf, 0) || 1;
  // Alias bonus per pattern: fully matched multi-word aliases (strong evidence of intent).
  const tset = new Set(known.map((x) => x.t)), idfOf = new Map(known.map((x) => [x.t, x.idf * (x.fuzzy ? 0.7 : 1)]));
  const aliasBonus = {};
  for (const [p, P] of Object.entries(idx.pat)) {
    let b = 0;
    for (const a of P.aliases) if (a.length > 1 && a.every((t) => tset.has(t))) b = Math.max(b, a.reduce((s, t) => s + idfOf.get(t), 0) * 2.5);
    if (b) aliasBonus[p] = b;
  }
  const out = [];
  for (const d of idx.docs) {
    const r = d.r;
    if (opts.elements && opts.elements.length && !opts.elements.every((e) => elHas(d, e))) continue;
    if (opts.platform && r.country !== opts.platform) continue;
    if (opts.style && r.style !== opts.style) continue;
    if (opts.pattern && r.category !== opts.pattern) continue;
    let score = 0, matched = 0, hitW = 0, strong = !!aliasBonus[d.pattern]; const hit = [];
    for (const x of known) {
      let fw = 0;
      for (const k in W) if (W[k] > fw && d.f[k].has(x.t)) fw = W[k];
      if (fw) { const iw = idfOf.get(x.t); score += iw * fw; matched += x.idf; hitW += x.idf * Math.min(1, fw / W.tags); hit.push(x.w); if (fw >= W.tags) strong = true; }
    }
    score += aliasBonus[d.pattern] || 0;
    // Soft preferences: a small nudge (never enough to beat a better text match) + a deterministic order.
    const pref = (prefPlatform && r.country === prefPlatform ? 0.3 : 0) + (prefStyle && r.style === prefStyle ? 0.2 : 0);
    score *= 0.6 + 0.4 * (hitW / total); // rows covering more of the query win close calls
    out.push({ d, r, score: score + pref, text: score, cover: matched / total, hit, strong });
  }
  const si = (s) => { const i = UI_STYLE_LIST.indexOf(s); return i < 0 ? 99 : i; };
  out.sort((a, b) => b.score - a.score || a.d.ord - b.d.ord || a.d.step - b.d.step || String(a.d.variant).localeCompare(String(b.d.variant))
    || (a.r.country === b.r.country ? 0 : a.r.country === "web" ? -1 : 1) || si(a.r.style) - si(b.r.style) || String(a.r.id).localeCompare(String(b.r.id)));
  const best = out[0];
  const unmatched = terms.filter((x) => !(best && best.hit.includes(x.w))).map((x) => x.w);
  let tier = "none";
  if (!terms.length) tier = "all";
  // Honesty: a result needs a hit on the pattern, title or elements; description-only hits count only when they cover most of the query.
  else if (best && best.text > 0) tier = best.strong ? (best.cover >= 0.5 ? "good" : "partial") : best.cover >= 0.6 ? "partial" : "none";
  return { ranked: out, terms, prefs: pq.prefs, tier, unmatched, suggestions: tier === "none" || tier === "partial" ? suggest(pq, idx, out) : [] };
}

// Closest patterns for an honest "no match" answer: patterns the matched words point at, then hint words, then trigram similarity.
function suggest(pq, idx, ranked) {
  const s = new Map();
  const add = (p, v) => { if (idx.pat[p] && idx.pat[p].n) s.set(p, (s.get(p) || 0) + v); };
  for (const x of ranked.slice(0, 40)) if (x.text > 0) add(x.r.category, x.text / 10);
  for (const w of pq.raw) { const h = HINTS[w] || HINTS[w.replace(/s$/, "")] || HINTS[stem(w)]; if (h) h.forEach((p, i) => add(p, 3 - i)); }
  for (const x of pq.terms) {
    if (x.t.length < 5) continue;
    const g = grams(x.t);
    for (const [p, P] of Object.entries(idx.pat)) { let m = 0; for (const t of P.all) m = Math.max(m, jacc(g, grams(t))); if (m >= 0.45) add(p, m); }
  }
  return [...s.entries()].sort((a, b) => b[1] - a[1] || (idx.order.get(a[0]) ?? 999) - (idx.order.get(b[0]) ?? 999)).map(([p]) => p).slice(0, 5);
}

// Free-text pattern / flow names → canonical id ("doctor directory", "Doctors", "kanban" → kanban-board). Returns { id, how } or null.
export function resolveName(input, ids, aliases) {
  const raw = String(input || "").trim().toLowerCase();
  if (!raw) return null;
  const slug = raw.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  if (ids.includes(slug)) return { id: slug, how: "exact" };
  const qt = tokens(raw.replace(/-/g, " "), true);
  if (!qt.length) return null;
  const key = qt.join(" ");
  // whole-name or alias equality
  for (const id of ids) { const names = [id.replace(/-/g, " "), ...((aliases && aliases[id]) || [])]; if (names.some((n) => tokens(n, true).join(" ") === key)) return { id, how: "alias" }; }
  // best token overlap, then trigram similarity of the whole string
  let best = null, bs = 0;
  const g = grams(slug.replace(/-/g, " "));
  for (const id of ids) {
    const names = [id.replace(/-/g, " "), ...((aliases && aliases[id]) || [])];
    for (const n of names) {
      const nt = tokens(n, true); const ov = qt.filter((t) => nt.includes(t)).length / Math.max(qt.length, nt.length);
      const sc = Math.max(ov, jacc(g, grams(n)) * 0.9);
      if (sc > bs) { bs = sc; best = id; }
    }
  }
  return bs >= 0.5 ? { id: best, how: "fuzzy" } : null;
}

// Free-text style / platform → canonical value (null if unknown). "minimalist" → minimal, "premium" → luxury, "iPhone" → mobile.
export function resolveStyle(v) {
  const w = String(v || "").trim().toLowerCase(); if (!w) return null;
  if (UI_STYLE_LIST.includes(w)) return w;
  if (STYLE_WORDS[w]) return STYLE_WORDS[w];
  const r = resolveName(w, UI_STYLE_LIST, null); return r ? r.id : null;
}
export function resolvePlatform(v) {
  const w = String(v || "").trim().toLowerCase(); if (!w) return null;
  if (PLATFORM_WORDS[w]) return PLATFORM_WORDS[w];
  if (/^(phone|app|native|mobile[\s-]?app|ios[\s-]?app)$/.test(w)) return "mobile";
  if (/^(webapp|web[\s-]?app|saas|laptop)$/.test(w)) return "web";
  return null;
}

// ---- Elements filter -------------------------------------------------------------------------
// Words people use for a component → canonical element names in the inventory (any of them satisfies the element).
export const ELEMENT_ALIASES = {
  "checkbox": ["checkbox", "checkboxes", "row selection", "row checkboxes", "select rows", "tick box"],
  "toggle": ["toggle", "toggles", "toggle switch", "switch", "switches"],
  "progress-ring": ["progress ring", "progress circle", "circular progress", "ring", "radial progress", "donut progress", "progress-rings"],
  "progress": ["progress bar", "progress", "progress-bar", "meter", "usage meter", "storage-meter", "usage-meter", "capacity-bar"],
  "avatar-stack": ["avatar stack", "avatars", "team avatars", "facepile", "avatar group", "collaborators"],
  "sparkline": ["sparkline", "sparklines", "mini chart", "trend line"],
  "chart": ["chart", "charts", "graph", "line-chart", "bar-chart", "donut-chart", "area chart", "heatmap"],
  "table": ["table", "data table", "grid", "rows"],
  "badge": ["badge", "badges", "status chip", "status chips", "status badge", "status-pill", "pill", "severity-badge", "tag"],
  "chips": ["chips", "filter chips", "filter-chips", "tags", "chip"],
  "toast": ["toast", "snackbar", "toast notification"],
  "modal": ["modal", "dialog", "popup", "overlay"],
  "drawer": ["drawer", "side panel", "side-panel", "slide over", "details-panel", "detail-panel", "inspector-panel", "properties-panel"],
  "bottom-sheet": ["bottom sheet", "sheet"],
  "date-picker": ["date picker", "date range", "date-range", "calendar picker", "day-picker", "mini-month"],
  "stepper": ["stepper", "steps", "progress-steps", "status-steps", "wizard steps", "step indicator"],
  "tabs": ["tabs", "segmented control", "segmented-control", "tab"],
  "tab-bar": ["tab bar", "bottom nav", "bottom navigation", "tabbar"],
  "sidebar-nav": ["sidebar", "side nav", "sidebar navigation", "left nav"],
  "search-bar": ["search bar", "search", "search field", "search input"],
  "pagination": ["pagination", "pager"],
  "breadcrumbs": ["breadcrumbs", "breadcrumb"],
  "kpi-tiles": ["kpi tiles", "stat tiles", "stat cards", "kpi cards", "metrics cards", "summary cards", "kpi", "stats"],
  "empty-illustration": ["empty state", "illustration"],
  "timeline": ["timeline", "activity feed", "activity-feed", "history"],
  "checklist": ["checklist", "onboarding checklist", "todo list"],
  "dropdown": ["dropdown", "select", "menu", "combobox"],
  "form": ["form", "inputs", "input", "fields", "text field"],
  "avatar": ["avatar", "profile photo"],
  "star-rating": ["rating", "stars", "star rating", "reviews"],
  "accordion": ["accordion", "collapsible", "faq"],
  "code-block": ["code block", "code", "code-snippet", "snippet"],
  "map": ["map", "map-pins", "pins"],
  "chat-bubbles": ["chat bubbles", "messages", "chat-messages", "message bubbles"],
  "upload-dropzone": ["dropzone", "file upload", "upload", "drag and drop"],
  "plan-cards": ["plan cards", "pricing cards", "plans"],
  "bulk-actions": ["bulk actions", "bulk action bar", "batch actions"],
  "video-tiles": ["video tiles", "participants grid"],
};
const elKey = (s) => tokens(String(s).replace(/-/g, " "), true).join(" ");
// Resolve one requested element to the set of inventory names that satisfy it (null if unknown).
export function resolveElement(input, idx) {
  const k = elKey(input); if (!k) return null;
  const vocab = idx.elVocab || (idx.elVocab = (() => { const v = new Set(); for (const d of idx.docs) for (const e of d.els) v.add(e); return v; })());
  const out = new Set();
  for (const [canon, al] of Object.entries(ELEMENT_ALIASES)) if (elKey(canon) === k || al.some((a) => elKey(a) === k)) { out.add(canon); al.forEach((a) => vocab.has(a) && out.add(a)); }
  for (const v of vocab) if (elKey(v) === k) out.add(v);
  if (!out.size) { const r = resolveName(input, [...vocab], null); if (r) out.add(r.id); }
  return out.size ? { input: String(input), names: [...out] } : null;
}
export function elHas(d, e) { return e.names.some((n) => d.els.has(n)); }
