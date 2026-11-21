// get_font_pairing (kit pilot, 5-Nov-2026): font → the pairings we publish on our "<Font> Font Pairing" pages, each with a
// ready-to-paste Google Fonts link + CSS. Data = font_pairings.json, built read-only from the live posts by
// DnG Flooring/mgd-kit/extract_pilot.py (pilot: the top-50 font pages by engaged sessions). Nothing here names a pairing our pages don't.
import PAIRINGS from "./font_pairings.json";
import { CURATED, GF_FAMILIES } from "./font_pairings_curated.js";
import { gfLink, btKey, btLev } from "./search_extras.js";
import { GF_META } from "./gf_meta.js";

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
  // MCP r4 (13-Nov-2026): the Noto CJK families under their OTF / Source Han names and spelled-out script names
  notosanscjksc: "notosanssc", notosanscjktc: "notosanstc", notosanscjkjp: "notosansjp", notosanscjkkr: "notosanskr",
  notoserifcjksc: "notoserifsc", notoserifcjktc: "notoseriftc", notoserifcjkjp: "notoserifjp", notoserifcjkkr: "notoserifkr",
  notosanssimplifiedchinese: "notosanssc", notoserifsimplifiedchinese: "notoserifsc", notosanstraditionalchinese: "notosanstc",
  notoseriftraditionalchinese: "notoseriftc", notosansjapanese: "notosansjp", notoserifjapanese: "notoserifjp", notosanskorean: "notosanskr",
  notoserifkorean: "notoserifkr",
  // fonts r5 (17-Nov-2026): Trajan's Adobe family names ("Trajan Pro" is the OpenType release, "Trajan Pro 3" the current Adobe Fonts
  // family, CSS name trajan-pro-3) answer with the Trajan guide. Trajan Sans is a different design and stays an honest zero.
  trajanpro: "trajan", trajanpro3: "trajan",
};
// MCP r4: a Noto family for another script ("Noto Sans Thai", "Noto Serif Devanagari", "Noto Sans HK") is not stretched to the Latin or
// another script's Noto entry by the prefix step: different script, different pairing advice. Only a display cut of the same family is.
const NOTO_OTHER_SCRIPT = (key, base) => /^noto/.test(base) && key !== base && !/^display$/.test(key.slice(base.length));
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
  const pre = INDEX.filter((x) => (key.length >= 4 && !isGf && x.key.startsWith(key)) || (key.startsWith(x.key) && !SIBLING.test(key.slice(x.key.length)) && !NOTO_OTHER_SCRIPT(key, x.key)))
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
// fonts r5 (17-Nov-2026): a guide font that is not on Google Fonts can carry its CSS generic and where to license it here (Trajan is a
// serif sold through Adobe Fonts: "licence or self-host it" would be wrong, self-hosting it needs an extra Adobe licence).
// stack = the CSS family names to emit (Adobe Fonts web projects serve Trajan as "trajan-pro-3"; installed desktop font "Trajan Pro 3").
// fonts r6 (18-Nov-2026): the serif guide fonts Garamond, Baskerville, Caslon, Bodoni and Georgia get the same treatment (they used to get
// "licence or self-host it" and a sans-serif fallback). Stack order: the licensed / preinstalled family, then the free Google Fonts revival
// (EB Garamond, Libre Baskerville, Libre Caslon Text, Bodoni Moda: all in gf_meta.js, i.e. fonts.google.com metadata), then Georgia
// (preinstalled on Windows and macOS), then serif. Baskerville, Bodoni 72 and Georgia ship with macOS; Georgia also with Windows. The
// stacks follow the CSS on our own guides (e.g. the Caslon guide's 'Adobe Caslon Pro', 'Libre Caslon Text', Georgia, serif). The sans
// commercial guides (Futura, Helvetica, Gill Sans, Proxima Nova) keep "licence or self-host it" and their sans-serif fallback. The system
// fonts that partner them (Arial, Verdana, Didot...) say where they are preinstalled; commercial partners (DIN, Akkurat...) keep the old note.
const SYS = "a system font preinstalled on Windows and macOS: name it in CSS, there is no web font to load";
const NON_GF = { trajan: { css: "serif", stack: '"trajan-pro-3", "Trajan Pro 3"', where: "not free: license it through Adobe Fonts with a Creative Cloud subscription",
  about: "About: Trajan is a capitals-only serif display typeface designed by Carol Twombly for Adobe (Adobe Originals); the current family " +
    "is Trajan Pro 3. It is not free and not on Google Fonts: a Creative Cloud subscription covers it through Adobe Fonts. The usual free " +
    "Google Fonts look-alike is Cinzel." },
  garamond: { css: "serif", stack: '"Garamond", "EB Garamond", "Georgia"',
    where: "a family with many cuts, commercial ones such as Adobe Garamond Pro and Garamond Premier Pro; the free Google Fonts revival is EB Garamond",
    about: "About: Garamond is a family of old-style serif typefaces named after the 16th-century Paris punchcutter Claude Garamond " +
      "(some cuts follow the later types of Jean Jannon), with many cuts (Adobe Garamond Pro, Garamond Premier Pro and others). Garamond itself is not on Google Fonts; the free Google " +
      "Fonts revival is EB Garamond (Cormorant Garamond is a display-oriented interpretation)." },
  baskerville: { css: "serif", stack: '"Baskerville", "Libre Baskerville", "Georgia"',
    where: "preinstalled on macOS, not on Windows; the free Google Fonts version is Libre Baskerville",
    about: "About: Baskerville is a transitional serif typeface based on the types John Baskerville cut in Birmingham in the 1750s, with many " +
      "cuts. It is not on Google Fonts, but a version ships with macOS; the free Google Fonts version, made for body text on screen, is Libre Baskerville." },
  caslon: { css: "serif", stack: '"Adobe Caslon Pro", "Libre Caslon Text", "Georgia"',
    where: "commercial cuts such as Adobe Caslon Pro; the free Google Fonts revival is Libre Caslon Text (Libre Caslon Display for headlines)",
    about: "About: Caslon is a family of old-style serif typefaces based on the types William Caslon cut in London in the 18th century, with " +
      "many cuts; Adobe Caslon Pro is the most widely used digital version. Caslon is not on Google Fonts; the free Google Fonts revival is " +
      "Libre Caslon Text (with Libre Caslon Display for headlines)." },
  bodoni: { css: "serif", stack: '"Bodoni 72", "Bodoni Moda", "Georgia"',
    where: "a family with many commercial cuts; Bodoni 72 is preinstalled on macOS; the free Google Fonts revival is Bodoni Moda (also Libre Bodoni)",
    about: "About: Bodoni is a family of high-contrast Didone (modern) serif typefaces based on the types of Giambattista Bodoni of Parma, " +
      "late 18th century, with many cuts; it reads best at display sizes. Bodoni is not on Google Fonts, but Bodoni 72 ships with macOS; the " +
      "free Google Fonts revivals are Bodoni Moda and Libre Bodoni." },
  georgia: { css: "serif", stack: '"Georgia"',
    where: SYS,
    about: "About: Georgia is a serif typeface designed by Matthew Carter for Microsoft's Core Fonts for the Web (released 1996), drawn for " +
      "legibility on screen. It is not on Google Fonts: it is a system font preinstalled on Windows and macOS, so naming it in CSS is enough " +
      "there (other devices fall back to their default serif)." },
  // partner-only system fonts on those five guides (no guide of their own, so no About line). Checked against the macOS 26 font folders
  // (/System/Library/Fonts/Supplemental: Arial, Verdana, Tahoma, Trebuchet MS, Courier New, Didot, Big Caslon; Consolas absent);
  // Arial, Verdana, Tahoma, Trebuchet MS, Georgia, Courier New and Consolas are Windows system fonts.
  arial: { css: "sans-serif", stack: '"Arial"', where: SYS }, verdana: { css: "sans-serif", stack: '"Verdana"', where: SYS },
  tahoma: { css: "sans-serif", stack: '"Tahoma"', where: SYS }, trebuchetms: { css: "sans-serif", stack: '"Trebuchet MS"', where: SYS },
  courier: { css: "monospace", stack: '"Courier New", "Courier"', where: "Courier New is a system font preinstalled on Windows and macOS: name it in CSS, there is no web font to load" },
  consolas: { css: "monospace", stack: '"Consolas"', where: "a Windows system font, not on macOS" },
  didot: { css: "serif", stack: '"Didot"', where: "preinstalled on macOS, not on Windows" },
  bigcaslon: { css: "serif", stack: '"Big Caslon"', where: "preinstalled on macOS, not on Windows" } };
const fam = (name) => (NON_GF[btKey(name)] || {}).stack || `"${name}"`;
const ownCat = (v) => (v.about && v.about.category ? cat(v.about.category) : (NON_GF[btKey(v.font)] || {}).css || "sans-serif");
// A partner font's generic comes from the pair's group, except a NON_GF font, which always carries its own (Georgia is a serif in every group).
const partnerCat = (name, group) => (NON_GF[btKey(name)] || {}).css || cat(group);
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

// fonts r4 (16-Nov-2026): a Google Font with no guide and no partner hits used to get "0 results" (15 of 70 calls on 9-16 Nov). It now
// gets the published pairings of the closest guide fonts, labelled as such: same Google Fonts category (display / handwriting fonts:
// same stroke first), same primary script (an Arabic-script or Chinese font only borrows from Arabic-script or Chinese guides; none
// = honest zero), then Google Fonts popularity. Data: gf_meta.js (fonts.google.com metadata, build_gf_meta.py). No D1, no network.
const CAT_NAME = { S: "Sans Serif", R: "Serif", D: "Display", H: "Handwriting", M: "Monospace" };
const CAT_LABEL = { S: "sans-serif", R: "serif", D: "display", H: "handwriting (script)", M: "monospace" };
const SCRIPT_LABEL = { Arab: "Arabic-script", Hans: "Simplified Chinese", Hant: "Traditional Chinese", Jpan: "Japanese", Kore: "Korean",
  Cyrl: "Cyrillic", Deva: "Devanagari", Hebr: "Hebrew", Thai: "Thai", Grek: "Greek" };
const GFM = new Map();
for (const line of GF_META.split("\n")) {
  const [family, c, stroke, script, pop] = line.split("|");
  GFM.set(btKey(family), { family, c, stroke, script, pop: Number(pop) || 9999 });
}
// 22-Nov-2026: Google Fonts lists only "Baloo 2" (the old "Baloo" family was retired), but people still ask for plain "Baloo".
if (!GFM.has("baloo") && GFM.has("baloo2")) GFM.set("baloo", GFM.get("baloo2"));
const GUIDES = Object.values(PAIRINGS).filter((v) => v.page && GFM.has(btKey(v.font))).map((v) => ({ v, m: GFM.get(btKey(v.font)) }));
// Emoji, symbol, barcode and redaction fonts are not text faces: no "similar" pairings for them (honest zero).
const NO_SIMILAR = /emoji|symbols|barcode|redacted|^flow /i;
export function similarGuides(m, n = 3) {
  if (NO_SIMILAR.test(m.family)) return [];
  // 21-Nov-2026: Bagel Fat One, Modak, Shrikhand, Baloo 2 are Latin display faces whose METADATA lists a second script (Kore/Deva/Gujr),
  // so no guide shared their script and they got a zero. Display and handwriting faces are used as Latin headings: fall back to Latin guides.
  const scriptOk = (g) => g.m.script === m.script || ((m.c === "D" || m.c === "H") && m.script && !g.m.script && g.m.c === m.c);
  return GUIDES.filter((g) => g.m.c === m.c && scriptOk(g) && btKey(g.v.font) !== btKey(m.family))
    .map((g) => ({ g, s: (m.stroke && g.m.stroke === m.stroke ? 0 : 1) * 100000 + g.m.pop }))
    .sort((x, y) => x.s - y.s).slice(0, n).map((x) => x.g.v);
}
function similarPairs(m, a) {
  const lim = Math.max(1, Math.min(20, Number(a && a.limit) || 6));
  const guides = similarGuides(m);
  if (!guides.length) return null;
  const pairs = [];
  for (let i = 0; pairs.length < lim && i < 20; i++) {   // round-robin over the guides: their best pairs first
    let added = false;
    for (const v of guides) {
      const p = v.pairs[i];
      if (!p || pairs.length >= lim) continue;
      added = true;
      pairs.push({ heading: p.heading, body: p.body, group: p.group, why: p.why, similar_to: v.font, page: v.page,
        google_fonts_url: gfLink([p.heading_gf !== false ? p.heading : null, p.body_gf !== false ? p.body : null]) });
    }
    if (!added) break;
  }
  const kind = (m.script && SCRIPT_LABEL[m.script] ? SCRIPT_LABEL[m.script] + " " : "") + CAT_LABEL[m.c];
  const names = guides.map((v) => v.font);
  const lines = [`No dedicated guide for ${m.family} yet; these are published pairings for similar ${kind} fonts (${names.join(", ")}). ` +
    `Each pair comes from that font's own guide: use ${m.family} in place of the similar font, and cite the page listed with each. Try ${m.family} with these partners live: ${GENERATOR}`,
    `About: ${m.family} is a ${CAT_NAME[m.c].toLowerCase()} typeface, free on Google Fonts.`];
  for (const p of pairs) {
    lines.push(`\n• ${p.heading} + ${p.body}  [${p.group}; from the ${p.similar_to} guide]`);
    if (p.why) lines.push(`  why: ${p.why}`);
    if (p.google_fonts_url) lines.push(`  <link href="${p.google_fonts_url}" rel="stylesheet">`);
    lines.push(`  source: ${p.page}`);
  }
  return { content: [{ type: "text", text: lines.join("\n") }],
    structuredContent: { font: m.family, page: null, match: "similar", category: CAT_NAME[m.c], similar_to: names, try_url: GENERATOR, pairs } };
}
// Input that is not a typeface name (scanners send "python asyncio"; empty strings; code; whole sentences) gets a short validation
// message instead of the zero answer with its 30-font list. It is not an error and not a zero, so it does not count as a failure.
const NOT_FONT_WORDS = /\b(python|asyncio|javascript|typescript|java|react|node|nodejs|sql|select|insert|docker|kubernetes|api|https?|www|json|html|css|regex|lorem|ipsum|hello|world|weather|recipe|null|undefined|test|testing|asdf|qwerty|foo|bar|baz)\b/i;
const GF_WORDS = new Set();
for (const m of GFM.values()) for (const w of m.family.toLowerCase().split(/\s+/)) if (w.length >= 3) GF_WORDS.add(w);
for (const v of INDEX) for (const w of v.v.font.toLowerCase().split(/\s+/)) if (w.length >= 3) GF_WORDS.add(w);
export function notAFont(raw) {
  const s = String(raw == null ? "" : raw).trim();
  if (!s) return "empty";
  if (s.length > 80 || /[{}<>;=\[\]\\`$@#%^*|~]|:\/\//.test(s)) return "not a name";
  const words = s.replace(/\b(font|fonts|typeface|typefaces|pairing|pairings|pair|pairs|with|for|what|goes|go)\b/gi, " ").trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "empty";
  if (words.length > 6) return "not a name";
  const known = words.some((w) => GF_WORDS.has(w.toLowerCase()));
  if (!known && NOT_FONT_WORDS.test(s)) return "not a name";
  if (!known && words.length >= 2 && s === s.toLowerCase() && /[a-z]/.test(s)) return "not a name";
  return null;
}
function invalidFont(raw, why) {
  const shown = String(raw == null ? "" : raw).trim().slice(0, 60);
  return { content: [{ type: "text", text: why === "empty"
    ? `get_font_pairing needs a typeface name in "font", e.g. font="Poppins" or font="Playfair Display".`
    : `"${shown}" does not look like a typeface name. get_font_pairing takes one font family, e.g. font="Poppins" or font="Playfair Display".` }],
    structuredContent: { font: null, match: "invalid", pairs: [] } };
}

// MCP r7 (18-Nov-2026): the family name if the text names a typeface we can answer for (a guide, a curated or partner font, or any
// Google Fonts family), exact names and aliases only (no prefix or spelling guesses). Used by the library-search font hint.
export function knownFont(q) {
  const key = fontKey(q);
  if (!key) return null;
  const g = BY_KEY.get(key) || (ALIASES[key] && BY_KEY.get(ALIASES[key]));
  if (g) return g.v.font;
  const p = AS_PARTNER.get(key);
  if (p) return p.font;
  const m = GFM.get(key);
  return m ? m.family : null;
}
export function fontPairing(a) {
  // exact / alias / prefix first; then a font that only appears as a partner on other guides; fuzzy spelling matches last, so a
  // partner-only font (e.g. "Crimson Pro") is never swapped for a different guide one edit away.
  const f = fpFind(a && a.font, { fuzzy: false }) || (AS_PARTNER.has(fontKey(a && a.font)) ? null : fpFind(a && a.font));
  if (!f) {
    const hit = AS_PARTNER.get(fontKey(a && a.font));
    if (hit) return partnerPairs(hit, a);
    const gm = GFM.get(fontKey(a && a.font));
    const sim = gm && similarPairs(gm, a);
    if (sim) return sim;
    const bad = !gm && notAFont(a && a.font);
    if (bad) return invalidFont(a && a.font, bad);
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
    const css = `h1, h2, h3 { font-family: ${fam(p.heading)}, ${f.v.font === p.heading ? ownCat(f.v) : partnerCat(p.heading, p.group)}; }\nbody { font-family: ${fam(p.body)}, ${f.v.font === p.body ? ownCat(f.v) : partnerCat(p.body, p.group)}; }`;
    const nonGf = [p.heading_gf === false && p.heading, p.body_gf === false && p.body].filter(Boolean);
    // one licence / availability note per font once any of them has its own (Garamond + Futura: each gets its own parenthesis); two
    // fonts with no NON_GF entry keep the old shared "(licence or self-host it)".
    const own = (n) => (NON_GF[btKey(n)] || {}).where;
    const note = !nonGf.length ? null : nonGf.some(own)
      ? `not on Google Fonts: ${nonGf.map((n) => `${n} (${own(n) || "licence or self-host it"})`).join(", ")}`
      : `not on Google Fonts: ${nonGf.join(", ")} (licence or self-host it)`;
    return { heading: p.heading, body: p.body, group: p.group, why: p.why, google_fonts_url: link, css, note };
  });
  const closest = f.how !== "exact" ? ` (closest match for "${a.font}")` : "";
  const lines = [f.v.page
    ? `${pairs.length} pairing(s) for ${f.v.font}${closest}. Source: ${f.v.page} — please cite it.`
    : `${pairs.length} pairing(s) for ${f.v.font}${closest}. Made Good Designs has no dedicated ${f.v.font} guide yet; these are its editorial pairings (cite madegooddesigns.com). Try them live in the font pairing generator: ${GENERATOR}`];
  const about = aboutLine(f.v) || (NON_GF[btKey(f.v.font)] || {}).about || null;
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
