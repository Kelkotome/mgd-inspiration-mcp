// get_font_pairing (kit pilot, 5-Nov-2026): font → the pairings we publish on our "<Font> Font Pairing" pages, each with a
// ready-to-paste Google Fonts link + CSS. Data = font_pairings.json, built read-only from the live posts by
// DnG Flooring/mgd-kit/extract_pilot.py (pilot: the top-50 font pages by engaged sessions). Nothing here names a pairing our pages don't.
import PAIRINGS from "./font_pairings.json";
import { CURATED, GF_FAMILIES } from "./font_pairings_curated.js";
import { gfLink, btKey, btLev } from "./search_extras.js";

export const FONT_PAIRING_TOOL = {
  name: "get_font_pairing",
  description: "Use when the user wants fonts that go with a typeface (\"what pairs with Poppins\", \"Montserrat font pairing\") or a " +
    "heading + body combination for a project. Returns the pairings published on Made Good Designs for that font, grouped (serif, sans, " +
    "display, mono) with why each works, plus a ready-to-paste Google Fonts <link> and CSS for each pair, and the page to cite.",
  inputSchema: {
    type: "object",
    properties: {
      font: { type: "string", description: "The typeface to pair, e.g. 'Poppins' or 'Helvetica font pairing'." },
      group: { type: "string", description: "Optional: only pairs from one group, e.g. 'serif', 'sans', 'display', 'mono'." },
      limit: { type: "integer", minimum: 1, maximum: 20, description: "Max pairs to return (default 6)." },
    },
    required: ["font"],
  },
  annotations: { title: "Font pairings for a typeface", readOnlyHint: true, destructiveHint: false, openWorldHint: false },
};

// mcp-gaps-r1 (10-Nov-2026): + 30 popular Google Fonts without a guide (font_pairings_curated.js, page: null). Guides come first.
const INDEX = Object.values(PAIRINGS).map((v) => ({ key: btKey(v.font), v }));
for (const v of Object.values(CURATED)) if (!INDEX.some((x) => x.key === btKey(v.font))) INDEX.push({ key: btKey(v.font), v });
// A query that is itself a Google Fonts family we have no entry for ("Play", "Inder", "Exo") is never stretched to another family by
// the forward-prefix or the fuzzy step ("Play" used to answer with Playfair Display, "Inder" would get Inter).
const GF_KEYS = new Set(GF_FAMILIES.map(btKey));
const GENERATOR = "https://madegooddesigns.com/font-pairing-generator/";
const BY_KEY = new Map(INDEX.map((x) => [x.key, x]));
// 9-Nov-2026 (round 2): lookup is case/space/punctuation-proof via btKey ("Jetbrains mono", "JETBRAINS-MONO", "jet brains mono" all →
// "jetbrainsmono"). ALIASES maps renamed or alternate family names to the guide's font. The prefix step no longer crosses into a sibling
// family: "Nunito Sans" used to answer with Nunito, "Roboto Slab" with Roboto. A longer query only falls back to a shorter guide when
// the extra words are a style or edition ("Garamond Premier Pro", "Montserrat Bold", "Source Sans 3"), not a different family.
const ALIASES = {
  bigshouldersdisplay: "bigshoulders", bigshoulderstext: "bigshoulders", cormorantgaramond: "cormorant", sourcesanspro: "sourcesans",
  sourcesans3: "sourcesans", sourceserifpro: "sourceserif4", sourceserif: "sourceserif4", plexsans: "ibmplexsans", plexmono: "ibmplexmono",
  ibmplex: "ibmplexsans", plusjakarta: "plusjakartasans", jakartasans: "plusjakartasans", jakarta: "plusjakartasans", geistsans: "geist",
  googlesanstext: "googlesans", garamondeb: "ebgaramond", jetbrains: "jetbrainsmono", jetbrainsmononl: "jetbrainsmono",
  robotocondensed: "robotocondensed", fjalla: "fjallaone", alfaslab: "alfaslabone", titillium: "titilliumweb", librefranklin: "librefranklin",
  googlesansflex: "googlesans", redhat: "redhatdisplay", playfair: "playfairdisplay", playfair2: "playfairdisplay",
};
const SIBLING = /sans|serif|slab|mono|code|condensed|narrow|compressed|expanded|extended|rounded|tight|flex|stencil|inline|outline|script|alternates|grotesk|gothic/;
export const fontKey = (q) => btKey(String(q || "").replace(/\b(font|fonts|typeface|typefaces|pairing|pairings|pair|pairs|with|for|what|goes|go)\b/gi, " "));
export function fpFind(q, { fuzzy = true } = {}) {
  const key = fontKey(q);
  if (!key) return null;
  const exact = BY_KEY.get(key);
  if (exact) return { v: exact.v, how: "exact" };
  const al = ALIASES[key] && BY_KEY.get(ALIASES[key]);
  if (al) return { v: al.v, how: "alias" };
  const isGf = GF_KEYS.has(key);
  const pre = INDEX.filter((x) => (key.length >= 4 && !isGf && x.key.startsWith(key)) || (key.startsWith(x.key) && !SIBLING.test(key.slice(x.key.length))))
    .sort((a, b) => a.key.length - b.key.length)[0];
  if (pre) return { v: pre.v, how: "prefix" };
  if (!fuzzy || isGf) return null;
  const max = key.length >= 8 ? 2 : 1;
  const fz = INDEX.map((x) => ({ x, d: btLev(key, x.key, max) })).filter((y) => y.d <= max).sort((a, b) => a.d - b.d)[0];
  return fz ? { v: fz.x.v, how: "fuzzy" } : null;
}
function partnerPairs(hit, a) {
  const lim = Math.max(1, Math.min(20, Number(a && a.limit) || 6));
  const pairs = hit.hits.slice(0, lim).map((p) => ({ heading: p.heading, body: p.body, group: p.group, why: p.why, page: p.page,
    google_fonts_url: gfLink([p.heading_gf !== false ? p.heading : null, p.body_gf !== false ? p.body : null]) }));
  const lines = [`No dedicated pairing guide for ${hit.font} yet, but it appears in ${pairs.length} published pairing(s) on other fonts' guides. Please cite the page listed with each.`];
  for (const p of pairs) {
    lines.push(`\n• ${p.heading} + ${p.body}  [${p.group}]`);
    if (p.why) lines.push(`  why: ${p.why}`);
    if (p.google_fonts_url) lines.push(`  <link href="${p.google_fonts_url}" rel="stylesheet">`);
    lines.push(`  source: ${p.page}`);
  }
  return { content: [{ type: "text", text: lines.join("\n") }], structuredContent: { font: hit.font, page: null, match: "partner", pairs } };
}

// CSS generic fallback. "display" is not a CSS generic family (it used to be emitted for Display groups); Display falls back to sans-serif.
const cat = (g) => /mono|code/i.test(g) ? "monospace" : /script|handwriting/i.test(g) ? "cursive" : /serif/i.test(g) && !/sans/i.test(g) ? "serif" : "sans-serif";
// The page font's own fallback comes from its Google Fonts category (about.category) when we have it.
const ownCat = (v) => (v.about && v.about.category ? cat(v.about.category) : "sans-serif");
const aboutLine = (v) => {
  const a = v.about;
  if (!a) return null;
  const by = a.designers && a.designers.length ? ` by ${a.designers.slice(0, 3).join(", ")}${a.designers.length > 3 ? " and others" : ""}` : "";
  return `About: ${v.font} is a ${a.category.toLowerCase()} typeface${by}, free on Google Fonts${a.added ? ` (added ${a.added})` : ""}.`;
};

// Fonts with no guide of their own that appear as the partner in another font's published pairs.
const AS_PARTNER = new Map();
for (const v of Object.values(PAIRINGS)) for (const p of v.pairs) for (const n of [p.heading, p.body]) {
  const k = btKey(n);
  if (n === v.font || INDEX.some((x) => x.key === k)) continue;
  if (!AS_PARTNER.has(k)) AS_PARTNER.set(k, { font: n, hits: [] });
  AS_PARTNER.get(k).hits.push({ ...p, page: v.page });
}

export function fontPairing(a) {
  // exact / alias / prefix first; then a font that only appears as a partner on other guides; fuzzy spelling matches last, so a
  // partner-only font (e.g. "Crimson Pro") is never swapped for a different guide one edit away.
  const f = fpFind(a && a.font, { fuzzy: false }) || (AS_PARTNER.has(fontKey(a && a.font)) ? null : fpFind(a && a.font));
  if (!f) {
    const hit = AS_PARTNER.get(fontKey(a && a.font));
    if (hit) return partnerPairs(hit, a);
    const known = Object.values(PAIRINGS).map((v) => v.font);
    return { content: [{ type: "text", text: `0 results: no published pairing guide for "${(a && a.font) || ""}" yet. ${known.length} fonts have pairing guides, including: ${known.slice(0, 30).join(", ")}.` }],
      structuredContent: { font: null, pairs: [] } };
  }
  const want = String((a && a.group) || "").toLowerCase();
  const lim = Math.max(1, Math.min(20, Number(a && a.limit) || 6));
  let pairs = f.v.pairs.filter((p) => !want || p.group.toLowerCase().includes(want.replace(/s$/, "")));
  if (!pairs.length) pairs = f.v.pairs;
  pairs = pairs.slice(0, lim).map((p) => {
    const gfNames = [p.heading_gf !== false ? p.heading : null, p.body_gf !== false ? p.body : null];
    const link = gfLink(gfNames);
    const css = `h1, h2, h3 { font-family: "${p.heading}", ${f.v.font === p.heading ? ownCat(f.v) : cat(p.group)}; }\nbody { font-family: "${p.body}", ${f.v.font === p.body ? ownCat(f.v) : cat(p.group)}; }`;
    const note = p.heading_gf === false || p.body_gf === false
      ? `not on Google Fonts: ${[p.heading_gf === false && p.heading, p.body_gf === false && p.body].filter(Boolean).join(", ")} (licence or self-host it)` : null;
    return { heading: p.heading, body: p.body, group: p.group, why: p.why, google_fonts_url: link, css, note };
  });
  const closest = f.how !== "exact" ? ` (closest match for "${a.font}")` : "";
  const lines = [f.v.page
    ? `${pairs.length} pairing(s) for ${f.v.font}${closest}. Source: ${f.v.page} — please cite it.`
    : `${pairs.length} pairing(s) for ${f.v.font}${closest}. Made Good Designs has no dedicated ${f.v.font} guide yet; these are its editorial pairings (cite madegooddesigns.com). Try them live in the font pairing generator: ${GENERATOR}`];
  const about = aboutLine(f.v);
  if (about) lines.push(about);
  for (const p of pairs) {
    lines.push(`\n• ${p.heading} + ${p.body}  [${p.group}]`);
    if (p.why) lines.push(`  why: ${p.why}`);
    if (p.google_fonts_url) lines.push(`  <link href="${p.google_fonts_url}" rel="stylesheet">`);
    lines.push(p.css.split("\n").map((l) => "  " + l).join("\n"));
    if (p.note) lines.push(`  note: ${p.note}`);
  }
  return { content: [{ type: "text", text: lines.join("\n") }], structuredContent: { font: f.v.font, page: f.v.page, match: f.how, about: f.v.about || null, ...(f.v.page ? {} : { curated: true, try_url: GENERATOR }), pairs } };
}
