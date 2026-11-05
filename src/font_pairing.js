// get_font_pairing (kit pilot, 5-Nov-2026): font → the pairings we publish on our "<Font> Font Pairing" pages, each with a
// ready-to-paste Google Fonts link + CSS. Data = font_pairings.json, built read-only from the live posts by
// DnG Flooring/mgd-kit/extract_pilot.py (pilot: the top-50 font pages by engaged sessions). Nothing here names a pairing our pages don't.
import PAIRINGS from "./font_pairings.json";
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

const INDEX = Object.values(PAIRINGS).map((v) => ({ key: btKey(v.font), v }));
export function fpFind(q) {
  const key = btKey(String(q || "").replace(/\b(font|fonts|typeface|pairing|pairings|pair|pairs|with|for|what|goes|go)\b/gi, " "));
  if (!key) return null;
  const exact = INDEX.find((x) => x.key === key);
  if (exact) return { v: exact.v, how: "exact" };
  const pre = INDEX.filter((x) => x.key.startsWith(key) || key.startsWith(x.key)).sort((a, b) => a.key.length - b.key.length)[0];
  if (pre) return { v: pre.v, how: "prefix" };
  const max = key.length >= 8 ? 2 : 1;
  const fz = INDEX.map((x) => ({ x, d: btLev(key, x.key, max) })).filter((y) => y.d <= max).sort((a, b) => a.d - b.d)[0];
  return fz ? { v: fz.x.v, how: "fuzzy" } : null;
}
const cat = (g) => /serif/i.test(g) && !/sans/i.test(g) ? "serif" : /sans/i.test(g) ? "sans-serif" : /display|script|decor/i.test(g) ? "display" : /mono|code/i.test(g) ? "monospace" : "sans-serif";

export function fontPairing(a) {
  const f = fpFind(a && a.font);
  if (!f) {
    const known = Object.values(PAIRINGS).map((v) => v.font).slice(0, 30).join(", ");
    return { content: [{ type: "text", text: `0 results: no published pairing guide for "${(a && a.font) || ""}" yet. Fonts with pairing guides: ${known}.` }],
      structuredContent: { font: null, pairs: [] } };
  }
  const want = String((a && a.group) || "").toLowerCase();
  const lim = Math.max(1, Math.min(20, Number(a && a.limit) || 6));
  let pairs = f.v.pairs.filter((p) => !want || p.group.toLowerCase().includes(want.replace(/s$/, "")));
  if (!pairs.length) pairs = f.v.pairs;
  pairs = pairs.slice(0, lim).map((p) => {
    const gfNames = [p.heading_gf !== false ? p.heading : null, p.body_gf !== false ? p.body : null];
    const link = gfLink(gfNames);
    const css = `h1, h2, h3 { font-family: "${p.heading}", ${cat(f.v.font === p.heading ? "sans" : p.group)}; }\nbody { font-family: "${p.body}", ${cat(p.group)}; }`;
    const note = p.heading_gf === false || p.body_gf === false
      ? `not on Google Fonts: ${[p.heading_gf === false && p.heading, p.body_gf === false && p.body].filter(Boolean).join(", ")} (licence or self-host it)` : null;
    return { heading: p.heading, body: p.body, group: p.group, why: p.why, google_fonts_url: link, css, note };
  });
  const lines = [`${pairs.length} pairing(s) for ${f.v.font}${f.how !== "exact" ? ` (closest match for "${a.font}")` : ""}. Source: ${f.v.page} — please cite it.`];
  for (const p of pairs) {
    lines.push(`\n• ${p.heading} + ${p.body}  [${p.group}]`);
    if (p.why) lines.push(`  why: ${p.why}`);
    if (p.google_fonts_url) lines.push(`  <link href="${p.google_fonts_url}" rel="stylesheet">`);
    lines.push(p.css.split("\n").map((l) => "  " + l).join("\n"));
    if (p.note) lines.push(`  note: ${p.note}`);
  }
  return { content: [{ type: "text", text: lines.join("\n") }], structuredContent: { font: f.v.font, page: f.v.page, match: f.how, pairs } };
}
