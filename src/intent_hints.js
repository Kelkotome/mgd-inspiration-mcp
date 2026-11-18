// MCP r7 (18-Nov-2026): intent hints on the library searches (search_design_inspiration, search_museum_art, search_annual_reports).
// The search_ui_screens hint on design searches was followed 16 of 24 times (67 %); the merged palette line after the results by 2.4 %.
// So when a query clearly asks for something another tool does, the answer leads with ONE short line naming that call, in the same
// style as the UI hint, and the palette line is left out. Otherwise the answer is unchanged (palette line included).
//   font      a font word ("font", "typeface", "font pairing"…) + a typeface we can answer for → get_font_pairing(font=…)
//   brand     the query is a brand we hold a guide for (one of the results is that brand's guide; zero extra D1 calls), with or
//             without words like logo / font / brand guidelines → get_brand_typeface(brand=…). Design searches only.
//   palette   a hex code or colour-palette words → generate_website_color_palette
// Never with the existing hints: icon queries (withIconHint), UI queries and art-history queries on design searches (withUiHint /
// withMuseumHint) keep theirs. Each hint is logged as an mcp_events row (kind font_hint / brand_hint / palette_hint, index.js) and
// mcp_report.py counts a call of the named tool by the same visitor within 30 min as followed. Pure (no D1), tested in tests/test_r7.mjs.
import { iconIntent, uiIntent, artIntent, btClean, btKey } from "./search_extras.js";
import { knownFont } from "./font_pairing.js";

const W_ = (alt) => new RegExp(`(^|[^\\p{L}\\p{N}])(${alt})($|[^\\p{L}\\p{N}])`, "iu");
const WG = (alt) => new RegExp(`(?<=^|[^\\p{L}\\p{N}])(${alt})(?=$|[^\\p{L}\\p{N}])`, "giu");
const FONT_WORD = W_("fonts?|typefaces?|type ?faces?|font pairings?|font pairs?|font combinations?");
// words removed before the rest is read as a typeface name; then, if that is not a family we know, styles and weights too
// ("DM Serif Display font" → DM Serif Display; "Montserrat Bold font" → Montserrat)
const FONT_FILL = WG(["fonts?", "typefaces?", "type ?faces?", "pairings?", "pairs?", "combinations?", "combos?", "what", "which",
  "goes", "go", "with", "for", "the", "a", "an", "and", "to", "of", "in", "similar", "like", "alternatives?", "free", "google", "matching", "matches",
  "match", "partner", "partners", "family", "families", "download", "ideas?", "examples?", "inspiration", "design", "designs", "style"].join("|"));
const FONT_STYLE = WG(["regular", "bold", "light", "thin", "medium", "black", "italic", "semibold", "extrabold", "heading", "headings", "body",
  "text", "display", "web"].join("|"));
const PALETTE_WORD = W_("colou?r palettes?|colou?r schemes?|colou?r combinations?|colou?rways?|palettes?|colou?r themes?");
const PALETTE_NOT = W_("palette knife|palette knives|palette-knife|palette cleanser");
const HEX = /(^|[^0-9a-z&])#([0-9a-f]{6}|[0-9a-f]{3})(?![0-9a-z])/i;
const PAL_STYLE = { warm: "warm", vibrant: "vibrant", bright: "vibrant", bold: "vibrant", muted: "muted", pastel: "muted", soft: "muted",
  "high contrast": "contrast", contrast: "contrast" };
// extra words that do not change which brand a query is about ("Nike branding", "Nike visual identity")
const BRAND_FILL = WG(["branding", "visual identity", "brand identity", "identity", "brand book", "brand guide", "guide", "colou?rs?", "colou?r palette",
  "palette", "typography", "wordmark", "logos?", "font", "fonts", "typeface", "typefaces"].join("|"));

export const FONT_HINT_HEAD = "Looking for font pairings?";
export const BRAND_HINT_HEAD = "Looking for a brand's typeface?";
export const PALETTE_HINT_HEAD = "Need a website colour palette?";
export const HINT_KINDS = { font: "font_hint", brand: "brand_hint", palette: "palette_hint" };
const WHAT = { search_design_inspiration: "graphic-design references", search_museum_art: "museum works", search_annual_reports: "annual-report covers" };
const q_ = (s) => String(s || "").replace(/["\\\n\r]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 60);

export function fontName(q) {
  const s = String(q || "").trim();
  if (!s || s.length > 80 || !FONT_WORD.test(s)) return null;
  const tidy = (x) => x.replace(/[?!.,:;()]/g, " ").replace(/\s+/g, " ").trim();
  const rest = tidy(s.replace(FONT_FILL, " "));
  if (!rest || rest.split(" ").length > 5) return null;
  const bare = tidy(rest.replace(FONT_STYLE, " "));
  return knownFont(rest) || (bare && bare !== rest ? knownFont(bare) : null);
}
// The brand a design query is about, if one of its result rows is that brand's guide (company = the cleaned query).
export function brandOf(q, rows) {
  const s = String(q || "").trim();
  if (!s || s.length > 60 || !Array.isArray(rows) || !rows.length) return null;
  const clean = btClean(s.replace(BRAND_FILL, " ")).replace(/\s+/g, " ").trim();
  if (!clean || clean.split(" ").length > 4) return null;
  const key = btKey(clean);
  if (!key || key.length < 2) return null;
  const hit = rows.find((r) => r && r.company && btKey(r.company) === key && /^(brand-cover|type-specimen|color-palette)$/.test(String(r.style || "")));
  return hit ? hit.company : null;
}
export function paletteAsk(q) {
  const s = String(q || "").trim();
  if (!s || s.length > 120 || PALETTE_NOT.test(s)) return null;
  const hex = (s.match(HEX) || [])[2];
  if (!hex && !PALETTE_WORD.test(s)) return null;
  const low = s.toLowerCase();
  const style = Object.keys(PAL_STYLE).find((w) => W_(w).test(low));
  return { hex: hex ? "#" + (hex.length === 3 ? hex.split("").map((c) => c + c).join("") : hex).toUpperCase() : null, style: style ? PAL_STYLE[style] : null };
}

// → { kind, text } or null. rows = the search's result rows (full items rows).
export function intentHint(tool, q, rows) {
  try {
    if (!WHAT[tool]) return null;
    const s = String(q || "").trim();
    if (!s || iconIntent(s)) return null;
    if (tool === "search_design_inspiration" && (uiIntent(s) || artIntent(s))) return null;   // the UI / museum hint leads instead
    const what = WHAT[tool];
    const brand = tool === "search_design_inspiration" ? brandOf(s, rows) : null;
    if (brand) return { kind: "brand", text: `${BRAND_HINT_HEAD} get_brand_typeface(brand="${q_(brand)}") returns its typeface, free look-alike fonts and palette from our brand guide. The results below are ${what}.` };
    const font = fontName(s);
    if (font) return { kind: "font", text: `${FONT_HINT_HEAD} get_font_pairing(font="${q_(font)}") returns the fonts that pair with it, with Google Fonts links. The results below are ${what}.` };
    const pal = paletteAsk(s);
    if (pal) {
      const arg = pal.hex ? `brand_color="${pal.hex}"` : pal.style ? `style="${pal.style}"` : "";
      return { kind: "palette", text: `${PALETTE_HINT_HEAD} generate_website_color_palette(${arg}) returns an accessible light and dark palette, ready for CSS. The results below are ${what}.` };
    }
  } catch (_) { /* a hint must never break a search answer */ }
  return null;
}
// Prepend the hint line to the answer (like the UI hint). Never throws; never removes results.
export function withIntentHint(h, result) {
  if (!h || !result || result.isError || !Array.isArray(result.content) || !result.content[0] || typeof result.content[0].text !== "string") return result;
  result.content[0].text = h.text + "\n\n" + result.content[0].text;
  return result;
}
// mcp_events kind for an answer that leads with one of these hints (index.js mcpTracked), else null
export function hintKindOf(text) {
  const t = String(text || "");
  return t.startsWith(FONT_HINT_HEAD) ? HINT_KINDS.font : t.startsWith(BRAND_HINT_HEAD) ? HINT_KINDS.brand : t.startsWith(PALETTE_HINT_HEAD) ? HINT_KINDS.palette : null;
}
