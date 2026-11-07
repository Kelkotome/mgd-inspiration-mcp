// Next-step offer on library searches (5-Nov-2026, NEXT-STEP agent, approved by Eugene ~01:10).
// 14 days of MCP data: people search styles/subjects/brand briefs, but only ~2 sessions went on to a palette or DESIGN.md.
// The old "Next step: … call generate_website_color_palette with brand_color set to a palette hex above" line was an
// instruction to the model and was almost never followed. This replaces it on the 4 library searches with:
//   1. a merged palette from the top results (value with zero extra calls),
//   2. an offer the model can relay to the user, with three prefilled one-call options.
// Pure helpers (no D1, no fetch) so tests/test_next_offer.mjs can test them.
import { iconIntent, uiIntent } from "./search_extras.js";

// ONE SWITCH (8-Nov-2026, mcp-gap-r1) for what follows the results of the 4 library searches:
//   "offer"   = the 5-Nov behaviour: merged palette line + "Next step:" offer with 3 prefilled calls (OFFER_HEAD).
//   "palette" = the merged palette line only (zero extra calls for the model); no offer block. RECOMMENDED: the offer was
//               followed by 2 of 36 visitors (5 of 142 offers) in 5–8 Nov, while 6 visitors went to search_ui_screens on their own.
//   "off"     = nothing after the results.
// In every mode a search_design_inspiration query with UI words gets the search_ui_screens hint (search_extras.js withUiHint)
// and no palette/offer, so the answer carries one pointer, not two.
export const NEXT_STEP_MODE = "palette";

export const OFFER_TOOLS = new Set(["search_design_inspiration", "browse_inspiration_by_theme", "search_museum_art", "search_annual_reports"]);
// Calls that count as "following" the offer in mcp_report.py (kept in sync there).
export const OFFER_FOLLOW_TOOLS = ["generate_website_color_palette", "design_md_from_references", "generate_design_md", "generate_type_scale", "save_moodboard"];

// tag → [heading, body] Google Fonts (OFL) suggestions; first match wins. Shared with design_md_from_references.
export const REF_FONTS = [
  [/art-?deco|deco/, ["Poiret One", "Josefin Sans"]], [/art-?nouveau|nouveau|ornament/, ["Cormorant Garamond", "Source Serif 4"]],
  [/swiss|grid|modernis|bauhaus|helvetica|sans/, ["Inter Tight", "Inter"]], [/brutalis|mono|code|terminal/, ["Space Grotesk", "IBM Plex Mono"]],
  [/editorial|magazine|serif|classic|book/, ["Playfair Display", "Source Serif 4"]], [/retro|vintage|70s|groovy/, ["Fraunces", "DM Sans"]],
  [/playful|kids|hand-?drawn|fun|cartoon/, ["Baloo 2", "Nunito"]], [/luxury|elegant|fashion|premium/, ["Bodoni Moda", "Jost"]],
  [/japan|ukiyo|woodblock/, ["Shippori Mincho", "Noto Sans JP"]], [/tech|futur|sci-?fi|cyber/, ["Space Grotesk", "Inter"]],
  // 5-Nov: soft/wellness briefs (last, so it only applies when nothing above matched; before, these got Inter / Inter).
  [/calm|gentle|wellness|well-being|wellbeing|serene|mindful|yoga|\bspa\b|\bsoft\b|organic|botanical/, ["Lora", "Nunito Sans"]],
];
export function pickFonts(words) {
  const s = String(words || "").toLowerCase();
  const hit = REF_FONTS.find(([re]) => re.test(s));
  return hit ? hit[1] : null;
}

// ---- skip rules ------------------------------------------------------------------------------------------------------
// Coding agents mid-task ("pricing table component tailwind") want code, not a mood board.
const CODING = /(^|[^\p{L}\p{N}])(components?|tailwind|react|css|scss|jsx|tsx|html|vue|svelte|shadcn|nextjs|next\.js|frontend|page sections?|screens?)($|[^\p{L}\p{N}])/iu;
export function offerSkip(tool, q) {
  if (!OFFER_TOOLS.has(tool)) return "tool";
  if (iconIntent(q)) return "icon";
  if (CODING.test(String(q || ""))) return "coding";
  if (tool === "search_design_inspiration" && uiIntent(q)) return "ui"; // the UI-screens hint leads instead
  return null;
}

// ---- colour maths (sRGB ↔ OKLab, WCAG contrast) ------------------------------------------------------------------------
export function normHex(h) {
  let s = String(h || "").trim().toLowerCase();
  if (!s.startsWith("#")) s = "#" + s;
  if (/^#[0-9a-f]{3}$/.test(s)) s = "#" + s.slice(1).split("").map((c) => c + c).join("");
  return /^#[0-9a-f]{6}$/.test(s) ? s : null;
}
const lin = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
const gam = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);
function rgb(hex) { const n = parseInt(hex.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => v / 255); }
export function toOklab(hex) {
  const [r, g, b] = rgb(hex).map(lin);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s];
}
export function fromOklab([L, A, B]) {
  const l = Math.pow(L + 0.3963377774 * A + 0.2158037573 * B, 3), m = Math.pow(L - 0.1055613458 * A - 0.0638541728 * B, 3), s = Math.pow(L - 0.0894841775 * A - 1.291485548 * B, 3);
  const c = [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s];
  return "#" + c.map((v) => Math.round(Math.min(1, Math.max(0, gam(Math.min(1, Math.max(0, v))))) * 255).toString(16).padStart(2, "0")).join("");
}
export function luminance(hex) { const [r, g, b] = rgb(hex).map(lin); return 0.2126 * r + 0.7152 * g + 0.0722 * b; }
export function contrast(a, b) { const x = luminance(a), y = luminance(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
const dist = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);
const chroma = (p) => Math.hypot(p[1], p[2]);

// ---- palette merge ---------------------------------------------------------------------------------------------------
// palettes: array (rank order) of arrays of hex strings. Earlier results and earlier swatches (dominant) weigh more.
// Greedy OKLab clustering (ΔE < 0.08 joins a cluster; the cluster keeps its heaviest real swatch), then: the darkest and
// the lightest cluster, plus 2–4 distinct accents ranked by weight × chroma. If dark/light contrast < 4.5, the dark is
// darkened and the light lightened in OKLab L until it passes. Output is ordered dark → light. Deterministic.
export function mergePalette(palettes, opts = {}) {
  const max = Math.min(6, Math.max(3, opts.max || 6));
  const sw = [];
  (Array.isArray(palettes) ? palettes : []).slice(0, 5).forEach((pal, i) => (Array.isArray(pal) ? pal : []).slice(0, 8).forEach((h, j) => {
    const hex = normHex(h); if (hex) sw.push({ hex, lab: toOklab(hex), w: (1 / (1 + 0.35 * i)) * (1 / (1 + 0.25 * j)), k: i * 100 + j });
  }));
  if (sw.length < 2) return null;
  sw.sort((a, b) => b.w - a.w || a.k - b.k);
  const cl = [];
  for (const s of sw) {
    let best = null, bd = 0.08;
    for (const c of cl) { const d = dist(c.lab, s.lab); if (d < bd) { bd = d; best = c; } }
    if (best) {
      const W = best.w + s.w;
      best.lab = best.lab.map((v, n) => (v * best.w + s.lab[n] * s.w) / W); best.w = W;
    } else cl.push({ hex: s.hex, lab: s.lab.slice(), rep: s.lab.slice(), w: s.w });
  }
  const byL = cl.slice().sort((a, b) => a.rep[0] - b.rep[0] || b.w - a.w);
  const darkC = byL[0], lightC = byL[byL.length - 1];
  let dark = darkC.rep.slice(), light = lightC.rep.slice();
  for (let n = 0; n < 40 && contrast(fromOklab(dark), fromOklab(light)) < 4.5; n++) {
    if (dark[0] > 0.12) { dark[0] -= 0.03; dark[1] *= 0.92; dark[2] *= 0.92; }
    if (light[0] < 0.985) { light[0] = Math.min(0.985, light[0] + 0.02); light[1] *= 0.85; light[2] *= 0.85; }
  }
  const darkHex = dist(dark, darkC.rep) < 1e-9 ? darkC.hex : fromOklab(dark);
  const lightHex = dist(light, lightC.rep) < 1e-9 ? lightC.hex : fromOklab(light);
  const picked = [dark, light];
  const accents = cl.filter((c) => c !== darkC && c !== lightC)
    .map((c) => ({ ...c, score: c.w * (0.25 + chroma(c.rep) * 5) }))
    .sort((a, b) => b.score - a.score || a.rep[0] - b.rep[0]);
  const acc = [];
  for (const c of accents) {
    if (acc.length >= max - 2) break;
    if (picked.every((p) => dist(p, c.rep) >= 0.1)) { acc.push(c); picked.push(c.rep); }
  }
  const out = [{ hex: darkHex, L: dark[0] }, { hex: lightHex, L: light[0] }, ...acc.map((c) => ({ hex: c.hex, L: c.rep[0] }))]
    .sort((a, b) => a.L - b.L).map((x) => x.hex.toUpperCase());
  // Best accent for a brand colour: the most chromatic accent (weight-ranked); a neutral palette falls back to the dark.
  const chromatic = acc.filter((c) => chroma(c.rep) >= 0.04);
  const accent = (chromatic[0] || acc[0] || { hex: darkHex }).hex.toUpperCase();
  return { palette: [...new Set(out)], dark: darkHex.toUpperCase(), light: lightHex.toUpperCase(), accent };
}

// ---- the offer -------------------------------------------------------------------------------------------------------
// items: [{ id, palette, tags, themes }] in result order (link-only rows already removed). Returns text or null.
// Wording = option C (Eugene, 5-Nov); the "Offer the user…" framing tells the model to relay it, not to run all three.
export const OFFER_HEAD = "Next step: turn these references into a palette, a type pairing, or a shareable mood board. Offer the user one (each is a single call):";
export function buildOffer(tool, q, items) {
  if (offerSkip(tool, q)) return null;
  const list = (Array.isArray(items) ? items : []).filter((it) => it && /^[0-9a-f]{12}$/.test(String(it.id || "")));
  if (!list.length) return null;
  const top = list.slice(0, 5);
  const m = mergePalette(top.map((it) => it.palette || []));
  if (!m) return null;
  const title = String(q || "").replace(/["\\\n\r]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 80) || "Mood board";
  // The query's own style words win ("calm wellness" → Lora / Nunito Sans even if a result is tagged "playful"); else the tags.
  const fonts = pickFonts(q) || pickFonts(top.flatMap((it) => [...(it.tags || []), ...(it.themes || [])]).join(" "));
  const refs = JSON.stringify(top.map((it) => it.id));
  const board = JSON.stringify(list.slice(0, 8).map((it) => it.id));
  const typeCall = fonts
    ? `design_md_from_references(references=${refs}, project_name="${title}", heading_font="${fonts[0]}", body_font="${fonts[1]}")`
    : `design_md_from_references(references=${refs}, project_name="${title}")`;
  const text = `Palette from these references: ${m.palette.join(" ")}\n` + OFFER_HEAD + "\n" +
    `• Palette: generate_website_color_palette(brand_color="${m.accent}")\n` +
    `• Type pairing${fonts ? ` (${fonts[0]} / ${fonts[1]})` : ""} + DESIGN.md: ${typeCall}\n` +
    `• Mood board: save_moodboard(items=${board}, title="${title}")`;
  return { text, palette: m.palette, accent: m.accent, fonts, references: top.map((it) => it.id), board: list.slice(0, 8).map((it) => it.id), title };
}

// What mcpOffer (index.js) appends, per NEXT_STEP_MODE. Returns { text, kind } or null; kind 'offer' is logged as an mcp_events row.
export function buildNextStep(tool, q, items, mode = NEXT_STEP_MODE) {
  if (mode === "off") return null;
  const o = buildOffer(tool, q, items);
  if (!o) return null;
  if (mode === "offer") return { text: o.text, kind: "offer" };
  return { text: `Palette from these references: ${o.palette.join(" ")}`, kind: null };
}
