// Library-search extras (5-Nov-2026 night, SEARCH agent):
//  (A) icon-intent routing hint for the library searches ("bold icon" → search_icons),
//  (B) get_brand_typeface (brand → typeface facts we already publish), see brandTypeface() below,
//  (C) FTS5 candidate search with bm25 (see ftsCandidates()), with a fallback to the LIKE search on any error.
// Pure helpers are exported for tests/test_search_n11.mjs.

// ---- (A) icon intent -------------------------------------------------------------------------------------------------
// "bold icon", "settings icons", "icon for delete", "trash glyph" → yes. "app icon", "iconic poster", "logo icon",
// "icon design inspiration" → no (those are design references, not UI icons).
const ICON_WORD = /(^|[^\p{L}\p{N}])(icons?|glyphs?|pictograms?|iconography)($|[^\p{L}\p{N}])/iu;
const ICON_NOT = /(^|[^\p{L}\p{N}])(app|apps|logo|logos|favicon|favicons|iconic|poster|posters|painting|portrait|religious|orthodox|byzantine|saint|madonna|christ|pop|cultural|fashion|style|celebrity)($|[^\p{L}\p{N}])/iu;
const ICON_FILL = new Set(["icon", "icons", "glyph", "glyphs", "pictogram", "pictograms", "iconography", "a", "an", "the", "for", "of", "with", "svg", "ui", "set", "pack", "free", "vector", "line", "simple", "some", "me", "find", "show", "need"]);
export function iconIntent(q) {
  const s = String(q || "").trim();
  if (!s || s.length > 80 || !ICON_WORD.test(s) || ICON_NOT.test(s)) return null;
  const words = s.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(Boolean);
  if (words.length > 6) return null; // long descriptive queries are usually about imagery, not a UI icon
  const kept = words.filter((w) => !ICON_FILL.has(w));
  return kept.length ? kept.join(" ") : null;
}
// Wording (default + alternatives listed in the n11 report for Eugene to pick):
export const ICON_HINT = (cq) => `Looking for UI icons? search_icons(query="${cq}") returns open-source SVG icons with checked import names. A few matches:`;
// Prepend the hint (and up to 3 icon results, names + imports only) to a library answer. Never throws; never removes results.
export async function withIconHint(q, result, searchIcons) {
  const cq = iconIntent(q);
  if (!cq || !result || !Array.isArray(result.content) || !result.content[0] || result.isError) return result;
  let lines = [];
  try {
    const r = await Promise.race([searchIcons({ query: cq, limit: 3, svg: false }), new Promise((res) => setTimeout(() => res(null), 2500))]);
    const icons = r && r.structuredContent && Array.isArray(r.structuredContent.icons) ? r.structuredContent.icons.slice(0, 3) : [];
    lines = icons.map((x) => `• ${x.set}/${x.name} — ${x.license}${x.import ? " — `" + x.import + "`" : ""}`);
  } catch (_) { /* icon data unavailable: the hint alone still helps */ }
  const head = lines.length ? ICON_HINT(cq) + "\n" + lines.join("\n") : `Looking for UI icons? Call search_icons(query="${cq}") for open-source SVG icons with checked import names.`;
  result.content[0].text = head + "\n\n" + result.content[0].text;
  return result;
}

// ---- (A2) UI-screen intent (8-Nov-2026, mcp-gap-r1) ----------------------------------------------------------------------
// Agents sometimes send app/website requests to search_design_inspiration ("billing settings dashboard data table saas" got
// brand guidelines back). A query with UI words keeps its results but leads with one line pointing to search_ui_screens.
// STRONG words are enough on their own; WEAK words ("table", "form", "settings", "page", "layout"…) need a context word
// (app, saas, web, mobile, ui…), so graphic-design queries ("editorial report layout grid data tables", "poster layout",
// "newspaper front page layout") stay quiet. NOT phrases always win ("table setting photography", "screen print poster").
// Tested in tests/test_ui_hint.mjs against the real logged queries of both tools.
const W_ = (alt) => new RegExp(`(^|[^\\p{L}\\p{N}])(${alt})($|[^\\p{L}\\p{N}])`, "iu");
const UI_STRONG = W_([
  "dashboards?", "onboarding", "checkout", "ui", "ux", "ui/ux", "user interfaces?", "interfaces?", "landing ?pages?", "home ?screens?",
  "app screens?", "web ?apps?", "mobile apps?", "ios apps?", "android apps?", "saas", "admin panels?", "admin dashboards?", "wireframes?",
  "navbar", "nav bar", "sidebar", "modal", "modals", "kanban", "login", "log in", "sign ?up", "sign ?in", "websites?", "web ?pages?",
  "web design", "settings (page|screen)s?", "pricing (page|table)s?", "data tables?.*(app|saas|dashboard)", "(app|saas|web) (layout|design)s?",
  "components?", "tailwind", "react", "shadcn", "html", "css", "frontend", "front-end",
  "toolbar", "empty states?", "hero section", "add to cart", "product (detail|listing) pages?", "product grid", "search results",
  "filter chips", "status (chips|badges)", "side panel", "detail pane", "split view", "master.detail", "kpi", "stat tiles",
  "settings (panel|form|list)s?", "(account|profile) settings", "now playing", "music player", "image editor", "rich.text editor",
  "confirm dialog", "dialogs?", "inline validation", "form wizard", "multi-step form", "navigation header", "dark mode",
].join("|"));
const UI_WEAK_LIST = ["tables?", "forms?", "settings", "screens?", "pages?", "layouts?", "cards?", "feed", "profile", "player", "editor",
  "toolbar", "chat", "inbox", "calendar", "cart", "leaderboard", "billing", "pricing", "menu", "tabs", "buttons?", "search results",
  "notifications?", "empty state", "invoices?", "subscription", "playlist", "stepper", "wizard"];
const UI_WEAK = W_(UI_WEAK_LIST.join("|"));
const UI_WEAK_G = new RegExp(`(?<=^|[^\\p{L}\\p{N}])(${UI_WEAK_LIST.join("|")})(?=$|[^\\p{L}\\p{N}])`, "giu"); // every weak word, for counting
const UI_CONTEXT = W_(["apps?", "application", "saas", "web", "mobile", "ios", "android", "software", "platform", "admin", "users?",
  "digital product", "startup", "fintech", "crm", "b2b"].join("|"));
const UI_NOT = W_(["table ?settings?", "tablescapes?", "table ?top", "tabletop", "dining table", "periodic table", "timetable poster",
  "screen ?print(ed|ing)?s?", "silk ?screen", "screen-print(ed|ing)?", "letterpress", "book (page|layout|cover)s?",
  "magazine (page|layout|spread)s?", "poster layouts?", "art form", "form follows function", "tarot cards?", "playing cards?",
  "greeting cards?", "business cards?", "trading cards?", "menu card", "restaurant menu", "cocktail menu"].join("|"));
export function uiIntent(q) {
  const s = String(q || "").trim();
  if (!s || s.length > 200 || UI_NOT.test(s)) return null;
  // two different weak words also count ("settings form", "editor preview toolbar"), except print-ish ones (page, layout, card, menu)
  const weak = new Set((s.toLowerCase().match(UI_WEAK_G) || []).map((w) => w.replace(/s$/, "")).filter((w) => !/^(page|layout|card|menu)$/.test(w)));
  if (!(UI_STRONG.test(s) || (UI_WEAK.test(s) && UI_CONTEXT.test(s)) || weak.size >= 2)) return null;
  return s.replace(/["\\\n\r]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 80);
}
export const UI_HINT_HEAD = "Looking for app or website screens?";
// Wording option A (default; B and C are in deploy-bundle-2026-11-07/mcp-gap-r1.md for Eugene to pick).
export const UI_HINT = (cq) => `${UI_HINT_HEAD} search_ui_screens(query="${cq}") returns original UI screens with their HTML and a DESIGN.md. The results below are graphic-design references.`;
// Prepend the hint to a search_design_inspiration answer. Never throws; never removes results.
export function withUiHint(q, result) {
  const cq = uiIntent(q);
  if (!cq || !result || result.isError || !Array.isArray(result.content) || !result.content[0] || typeof result.content[0].text !== "string") return result;
  if (iconIntent(q)) return result; // the icon hint (withIconHint) leads instead; one hint per answer
  result.content[0].text = UI_HINT(cq) + "\n\n" + result.content[0].text;
  return result;
}

// ---- (B) get_brand_typeface ----------------------------------------------------------------------------------------------
// Data = D1 table brand_type (build_brand_type.py: our "What font does X use?" articles + the brand-guide specimen blocks +
// the "<Brand> — Typeface" tiles). Brands published after the last build fall back to their D1 tile (guide + palette, no font facts).
// Nothing here names a font that our own pages do not name.
export const BRAND_TYPEFACE_TOOL = {
  name: "get_brand_typeface",
  description: "Use when the user asks which font or typeface a brand uses (\"Nike font\", \"Rolex typeface\"), or wants fonts like a brand's. " +
    "Pass one brand or a list of up to 10 in one call instead of many parallel searches. For each brand: our published answer (custom " +
    "lettering or a named retail typeface), free Google Fonts look-alikes, the brand-guide type register and specimen font (flagged when it " +
    "is a stand-in), the guide's palette, the specimen tile image and the madegooddesigns.com pages to cite. Only facts from our own guides; " +
    "fuzzy-matches names and ignores words like 'font' or 'typeface'.",
  inputSchema: {
    type: "object",
    properties: {
      brand: { type: "string", description: "A brand name, e.g. 'Supreme' or 'Rolex typeface'. A comma-separated list also works." },
      brands: { type: "array", items: { type: "string" }, maxItems: 10, description: "Several brand names at once (max 10)." },
    },
  },
  annotations: { title: "Look up a brand's typeface", readOnlyHint: true, destructiveHint: false, openWorldHint: false },
};

const BT_FILL = /\b(what|which|font|fonts|typeface|typefaces|type face|brand font|logo font|wordmark|lettering|logotype|typography|brand guidelines?|guidelines?|logo|brand|does|do|is|the|use|uses|used|of|for|official|style|similar|like)\b/gi;
export function btClean(s) {
  return String(s || "").replace(/[’']s\b/g, "").replace(/[?!]/g, " ").replace(BT_FILL, " ").replace(/\s+/g, " ").trim();
}
export function btKey(s) {
  let k = String(s || "").normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/&/g, " and ");
  k = k.replace(/[^a-z0-9]+/g, " ").trim().replace(/^the /, "");
  return k.replace(/ /g, "");
}
export function btLev(a, b, max) {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i]; let best = i;
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (cur[j] < best) best = cur[j];
    }
    if (best > max) return max + 1;
    prev = cur;
  }
  return prev[b.length];
}
export function btInputs(a) {
  const raw = [];
  if (Array.isArray(a.brands)) raw.push(...a.brands);
  else if (typeof a.brands === "string") raw.push(...a.brands.split(/[,;\n]/));
  if (typeof a.brand === "string") raw.push(...a.brand.split(/[,;\n]/));
  else if (Array.isArray(a.brand)) raw.push(...a.brand);
  const seen = new Set(), out = [];
  for (const r of raw) {
    const q = String(r == null ? "" : r).slice(0, 80).trim(); if (!q) continue;
    const clean = btClean(q) || q, key = btKey(clean);
    if (!key || seen.has(key)) continue;
    seen.add(key); out.push({ q, clean, key });
  }
  return out.slice(0, 10);
}
const j = (s) => { try { const v = JSON.parse(s || "[]"); return Array.isArray(v) ? v : []; } catch (_) { return []; } };

async function btFind(env, key, retry) {
  const run = (sql, ...b) => retry(() => env.DB.prepare(sql).bind(...b).all()).then((r) => r.results || []);
  let rows = await run("SELECT * FROM brand_type WHERE key=? OR alias=? LIMIT 4", key, key);
  if (rows.length) return { rows, how: "exact" };
  if (key.length >= 3) {
    rows = await run("SELECT * FROM brand_type WHERE key LIKE ? ORDER BY length(key) LIMIT 4", key + "%");
    if (rows.length && rows[0].key.length - key.length <= Math.max(3, key.length)) return { rows: rows.slice(0, 2), how: "prefix" };
    // typo tolerance: same first two letters, edit distance ≤ 1 (≤ 2 for names of 8+ letters)
    const max = key.length >= 8 ? 2 : 1;
    const cands = await run("SELECT * FROM brand_type WHERE key LIKE ? AND length(key) BETWEEN ? AND ? LIMIT 400", key.slice(0, 2) + "%", key.length - max, key.length + max);
    const scored = cands.map((r) => ({ r, d: btLev(key, r.key, max) })).filter((x) => x.d <= max).sort((x, y) => x.d - y.d || x.r.key.length - y.r.key.length);
    if (scored.length) return { rows: scored.slice(0, 2).map((x) => x.r), how: "fuzzy" };
  }
  return { rows: [], how: "" };
}
// Fallback for brands newer than the last build: their D1 "— Typeface" tile (guide link + palette).
async function btTile(env, clean, retry) {
  const r = await retry(() => env.DB.prepare("SELECT id, company, source_url, palette, industry, image_key FROM items WHERE style='type-specimen' AND status='published' AND owner_id IS NULL AND collection='design' AND company LIKE ? ORDER BY length(company) LIMIT 2")
    .bind(clean.replace(/[%_]/g, "") + "%").all());
  return (r.results || []).map((t) => ({ key: btKey(t.company), brand: t.company, guide_url: String(t.source_url || "").replace(/#.*$/, "") || null, tile_id: t.id,
    tile_key: t.image_key, palette: t.palette, industry: t.industry, named: "[]", alts: "[]" }));
}

// Ready-to-paste tokens (kit pilot, 5-Nov-2026): palette → CSS custom properties + Tailwind colours; the first two free look-alikes
// → one Google Fonts css2 link (heading + body). Only names we already publish; nothing is invented.
export function gfLink(names) {
  const fams = [...new Set(names.filter(Boolean))].slice(0, 3).map((n) => "family=" + encodeURIComponent(n).replace(/%20/g, "+") + ":wght@400;600;700");
  return fams.length ? `https://fonts.googleapis.com/css2?${fams.join("&")}&display=swap` : null;
}
export function btTokens(pal, alts) {
  const names = ["1", "2", "3", "4", "5", "6", "7", "8"]; // positional: our palettes are not role-ordered
  const cols = pal.slice(0, 8).map((hex, i) => [names[i], String(hex).toUpperCase()]);
  const fonts = alts.slice(0, 2).map((x) => x.name);
  if (!cols.length && !fonts.length) return null;
  const fam = (n, fb) => (n ? `"${n}", ${fb}` : fb);
  const css = [":root {", ...cols.map(([k, v]) => `  --brand-${k}: ${v};`),
    ...(fonts.length ? [`  --font-heading: ${fam(fonts[0], "sans-serif")};`, `  --font-body: ${fam(fonts[1] || fonts[0], "sans-serif")};`] : []), "}"].join("\n");
  const tailwind = { theme: { extend: { colors: Object.fromEntries(cols.map(([k, v]) => [`brand-${k}`, v])),
    ...(fonts.length ? { fontFamily: { heading: [fonts[0], "sans-serif"], body: [fonts[1] || fonts[0], "sans-serif"] } } : {}) } } };
  return { css, google_fonts_url: gfLink(fonts), tailwind };
}

export function btFormat(r, site) {
  const named = j(r.named), alts = j(r.alts), pal = j(r.palette);
  const kind = r.kind === "custom" ? "custom lettering (not a font you can download)" : r.kind === "named" ? "a named typeface" :
    r.kind === "mixed" ? "custom lettering plus a named typeface" : r.font_url ? "see our answer" : null;
  const tileImg = r.tile_id ? `${site}/img/${r.tile_key || "items/" + r.tile_id + ".png"}` : null;
  const spec = r.spec_font ? { register: r.style || null, font: r.spec_font, is_brand_font: r.spec_brand === 1,
    note: r.spec_brand === 1 ? "the guide names this as the brand's typeface" : "a free stand-in chosen for the specimen, NOT the brand's own font" } : (r.style ? { register: r.style } : null);
  const lines = [`• ${r.brand}`];
  if (kind) lines.push(`  verdict: ${kind}`);
  if (named.length) lines.push(`  typefaces named in our guide: ${named.map((x) => `${x.name} (${x.licence})`).join(", ")}`);
  if (r.summary) lines.push(`  our answer: ${r.summary}`);
  if (alts.length) lines.push(`  free look-alikes (Google Fonts): ${alts.map((x) => x.name + (x.category ? ` (${x.category.toLowerCase()})` : "")).join(", ")}`);
  if (spec && spec.font) lines.push(`  brand-guide specimen: ${spec.register ? spec.register + ", " : ""}set in ${spec.font} — ${spec.note}`);
  else if (spec) lines.push(`  brand-guide type register: ${spec.register}`);
  if (!r.font_url && !spec) lines.push("  font details: not in our data yet; the brand guide below covers its identity");
  if (pal.length) lines.push(`  palette (from our guide; not always official brand colours): ${pal.join(" ")}`);
  if (tileImg) lines.push(`  specimen tile: ${tileImg}`);
  if (r.font_url) lines.push(`  font guide (cite this): ${r.font_url}`);
  if (r.guide_url) lines.push(`  brand guide (cite this): ${r.guide_url}`);
  const tokens = btTokens(pal, alts);
  if (tokens) {
    lines.push("  ready to use (palette + free look-alike fonts; structuredContent.tokens also has a Tailwind theme):");
    if (tokens.google_fonts_url) lines.push(`  <link href="${tokens.google_fonts_url}" rel="stylesheet">`);
    lines.push(tokens.css.split("\n").map((l) => "  " + l).join("\n"));
  }
  return { text: lines.join("\n"), data: { brand: r.brand, verdict: r.kind || null, typefaces: named, summary: r.summary || null, free_alternatives: alts,
    specimen: spec, palette: pal, tile_image: tileImg, font_guide_url: r.font_url || null, brand_guide_url: r.guide_url || null, industry: r.industry || null,
    tokens } };
}

export async function brandTypeface(a, env, site, retry) {
  retry = retry || ((fn) => fn());
  const inputs = btInputs(a || {});
  if (!inputs.length) return { content: [{ type: "text", text: "Pass brand (e.g. 'Supreme') or brands (a list of up to 10 names)." }], isError: true };
  const found = [], missing = [], blocks = [];
  for (const inp of inputs) {
    let rows = [], how = "";
    try { ({ rows, how } = await btFind(env, inp.key, retry)); }
    catch (e) { if (!/no such table/i.test(String((e && e.message) || e))) throw e; }   // brand_type not loaded yet → tiles only
    if (!rows.length) { rows = await btTile(env, inp.clean, retry); how = rows.length ? "tile" : ""; }
    if (!rows.length) { missing.push(inp.q); continue; }
    const seen = new Set();
    for (const r of rows) {
      const id = (r.font_url || "") + "|" + (r.guide_url || "");
      if (seen.has(id)) continue; seen.add(id);
      const f = btFormat(r, site);
      const note = how === "fuzzy" || how === "prefix" ? `  (closest match for "${inp.q}")\n` : "";
      blocks.push(f.text.replace("\n", "\n" + note).replace(/\n\n/g, "\n"));
      found.push({ query: inp.q, match: how, ...f.data });
    }
  }
  if (!found.length) return { content: [{ type: "text", text: `0 results: no brand typeface on file for ${missing.map((m) => `"${m}"`).join(", ")}. Try the brand's main name (e.g. 'Nike' rather than 'Nike Air Max'), or search_design_inspiration for type references. Browse the guides: ${site}/?theme=type-specimen` }],
    structuredContent: { brands: [], not_found: missing } };
  const head = `${found.length} brand typeface result(s)${missing.length ? `; nothing on file for ${missing.map((m) => `"${m}"`).join(", ")}` : ""}. Source: Made Good Designs brand guides — please cite the page links.`;
  return { content: [{ type: "text", text: head + "\n\n" + blocks.join("\n\n") }], structuredContent: { brands: found, not_found: missing } };
}

// ---- (C) FTS5 library search -------------------------------------------------------------------------------------------
// items_fts = external-content FTS5 over items (migrate_fts.sql): tokenize 'porter unicode61 remove_diacritics 2', prefix 2/3.
// Tiers, each one D1 query, filled in order until `limit`: exact phrase → every word → any word (bm25: rare words weigh more)
// → word prefixes. Tokens are whole words, so 'med' no longer matches 'Named'; porter folds posters/poster. Column weights
// keep title/company/designer/tags ahead of long descriptions. Returns null when FTS is unavailable or can't serve the call
// (table missing, unsupported column, zero hits), and the caller runs the existing LIKE search; it THROWS only never: errors → null.
export const FTS_COLS = ["title", "company", "designer", "tags", "themes", "industry", "country", "category", "description"];
const FTS_W = [10, 8, 6, 5, 3, 3, 2, 2, 1];
const FTS_STATE = { ok: null, at: 0, errAt: 0 };
export function ftsWords(q, stop) {
  return [...new Set(String(q || "").toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").split(/[^\p{L}\p{N}]+/u)
    .filter((w) => w.length > 1 && !(stop && stop.has(w))))].slice(0, 8);
}
export function ftsTiers(words, cols) {
  const fc = cols && cols.length ? `{${cols.join(" ")}} : ` : "";
  const qt = (w) => `"${w}"`;
  const t = [];
  if (words.length > 1) t.push({ tier: "phrase", expr: fc + `"${words.join(" ")}"` });
  t.push({ tier: "all", expr: fc + "(" + words.map(qt).join(" AND ") + ")" });
  if (words.length > 1) t.push({ tier: "any", expr: fc + "(" + words.map(qt).join(" OR ") + ")" });
  const pre = words.filter((w) => w.length >= 3);
  if (pre.length) t.push({ tier: "prefix", expr: fc + "(" + pre.map((w) => qt(w) + "*").join(" OR ") + ")" });
  return t;
}
// The callers' WHERE strings name items columns bare; inside the FTS join they must be qualified (themes/industry/… exist in both).
export function ftsQualify(where) {
  return where.replace(/\b(status|owner_id|collection|themes|report_year|industry|category|country|created_at|featured_rank|style|company|title|tags|designer)\b/g, "items.$1");
}
const stem = (w) => w.length > 4 ? w.replace(/(ing|es|ed|s)$/, "") : w;
export function ftsCoverageSort(rows, words, cols, prefix) {
  const qs = words.map(stem);
  return rows.map((r, i) => {
    const toks = new Set(cols.map((c) => String(r[c] == null ? "" : r[c])).join(" ").toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
      .split(/[^\p{L}\p{N}]+/u).filter(Boolean).map(stem));
    const hit = qs.filter((q) => toks.has(q) || (prefix && [...toks].some((x) => x.startsWith(q)))).length;
    return { r, i, hit };
  }).sort((a, b) => b.hit - a.hit || a.i - b.i).map((x) => x.r);
}
async function ftsReady(env) {
  const now = Date.now();
  if (FTS_STATE.errAt && now - FTS_STATE.errAt < 600e3) return false;          // an error in the last 10 min: stay on LIKE
  if (FTS_STATE.ok !== null && now - FTS_STATE.at < 600e3) return FTS_STATE.ok;
  try {
    const r = await env.DB.prepare("SELECT 1 AS x FROM sqlite_master WHERE type='table' AND name='items_fts'").first();
    FTS_STATE.ok = !!r; FTS_STATE.at = now;
  } catch (_) { FTS_STATE.ok = false; FTS_STATE.at = now; }
  return FTS_STATE.ok;
}
export async function ftsSearch(env, where, binds, cols, q, order, limit, stop) {
  try {
    if (env.SEARCH_FTS === "0" || !q) return null;
    if (cols && cols.some((c) => !FTS_COLS.includes(c))) return null;
    const words = ftsWords(q, stop);
    if (!words.length) return null;
    if (!(await ftsReady(env))) return null;
    const w = ftsQualify(where), ord = ftsQualify(order);
    // museum: the 48 hand-featured works (featured_rank) get a small bump, as the LIKE search ordered them first among equal hits.
    const rank = `bm25(items_fts, ${FTS_W.join(", ")})` + (/^featured_rank/.test(order) ? " - (CASE WHEN items.featured_rank IS NOT NULL THEN 3 ELSE 0 END)" : "");
    const out = [], seen = new Set(), from = {}; let last = "";
    for (const t of ftsTiers(words, cols)) {
      if (out.length >= limit) break;
      if (t.tier === "prefix" && out.length) break;   // prefixes only when no whole-word hit at all
      const any = t.tier === "any" || (t.tier === "prefix" && words.length > 1);
      let rows = await env.DB.prepare(`SELECT items.* FROM items_fts JOIN items ON items.rowid = items_fts.rowid WHERE items_fts MATCH ? AND ${w} ORDER BY ${rank}, ${ord} LIMIT ?`)
        .bind(t.expr, ...binds, any ? Math.max(120, limit * 15) : limit + seen.size).all().then((r) => r.results || []);
      // OR-matches: bm25 alone lets one rare word win ("emerald" → the Emerald brand tiles for "dark luxury landscape emerald green"),
      // so rank by how many of the query words a row has (as before 5-Nov), bm25 order breaking ties.
      if (any) rows = ftsCoverageSort(rows, words, cols && cols.length ? cols : FTS_COLS, t.tier === "prefix");
      let added = 0;
      for (const r of rows) { if (!seen.has(r.id) && out.length < limit) { seen.add(r.id); out.push(r); added++; } }
      if (added) { last = t.tier; from[t.tier] = added; }
    }
    if (!out.length) return null;   // zero via FTS → let the LIKE search try (substrings, CJK, rows the index may lack)
    const full = (from.phrase || 0) + (from.all || 0), ws = words.join(", ");
    const note = words.length < 2 || last === "phrase" ? "" : last === "all" ? ` (matching all of: ${ws})` :
      full ? ` (the first ${full} match all of: ${ws}; the rest match some of them)` : ` (no item matches every word; closest matches for: ${ws})`;
    return { rows: out, note, engine: "fts" };
  } catch (e) {
    if (!/overloaded|too many resources|timed? ?out/i.test(String((e && e.message) || e))) FTS_STATE.errAt = Date.now(); // transient D1 load: LIKE for this call only
    console.log("fts fallback: " + String((e && e.message) || e).slice(0, 200));
    return null;
  }
}
