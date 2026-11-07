// Spec block for UI item pages (7-Nov-2026): a plain labelled list of facts, right after dl.facts. Every line comes from data
// that exists (DESIGN.md at render, ui/<id>/spec.json written at ingest); a line with no data is left out, never guessed.
import { STYLE_PHRASES, INDUSTRY_PHRASES, OVERRIDES } from "./ui_spec_phrases.js";

const SHOWN_ROLES = ["background", "surface", "text", "muted", "primary", "accent"];
const SECTION_LABELS = { top: "hero", faq: "FAQ", rsvp: "RSVP", faqs: "FAQs" };
const SKIP_IDS = new Set(["main", "content", "app", "root"]);

// Template HTML → { v, sections: [label], breakpoints: [px, desc], darkMedia }. Run at ingest (and by the backfill), stored as ui/<id>/spec.json.
export function extractSpec(html) {
  const s = String(html || ""), sections = [], seen = new Set();
  for (const [, attrs] of s.matchAll(/<section\b([^>]*)>/gi)) {
    const id = (attrs.match(/\bid="([^"]*)"/i) || [])[1];
    if (!id || !/^[a-z][a-z-]{0,39}$/.test(id) || SKIP_IDS.has(id) || seen.has(id)) continue; // unnamed sections are left out, not guessed
    seen.add(id); sections.push(SECTION_LABELS[id] || id.replace(/-/g, " "));
  }
  if (sections.length && /<footer\b/i.test(s)) sections.push("footer");
  const bps = new Set();
  for (const [, q] of s.matchAll(/@media\b([^{]*)\{/gi)) for (const [, px] of q.matchAll(/\((?:max|min)-width\s*:\s*(\d{3,4})px\)/gi)) bps.add(+px);
  return { v: 1, sections, breakpoints: [...bps].sort((a, b) => b - a), darkMedia: /prefers-color-scheme\s*:\s*dark/i.test(s) };
}

// spec.json text → spec, or null when absent or not ours (all live items have none until the backfill runs).
export function parseSpecJson(text) {
  try { const j = JSON.parse(text); return j && j.v === 1 && Array.isArray(j.sections) && Array.isArray(j.breakpoints) ? j : null; } catch (_) { return null; }
}

// DESIGN.md → the extras the kit parser does not read: the code (mono) font and the Layout line. Missing parts stay null.
export function parseDesignExtras(md) {
  const s = String(md || ""), fm = (s.match(/^---\n([\s\S]*?)\n---/) || [])[1] || "";
  const mono = (fm.match(/^ {2}code:\n(?: {4}.+\n)*? {4}fontFamily: "([^"]+)"/m) || [])[1] || null;
  const layout = (s.match(/^- \*\*Layout:\*\*([^\n]*)/m) || [])[1] || "";
  const noScroll = +(layout.match(/no horizontal scrolling at (\d{3})px/) || [])[1] || null;
  const maxWidth = +(layout.match(/max content width (\d{3,4})px/) || [])[1] || null;
  return { mono, noScroll, maxWidth };
}

// Fixed phrase table → { best, notIdeal } for website templates; null when the pattern or style has no reviewed phrase.
export function bestFor(pattern, style) {
  const o = OVERRIDES[`${pattern}|${style}`]; if (o) return { best: o[0], notIdeal: o[1] };
  const ind = INDUSTRY_PHRASES[pattern], st = STYLE_PHRASES[style]; if (!ind || !st) return null;
  const who = ind[2] || "that wants";
  return { best: `${ind[0]} ${who} ${st[0]}`, notIdeal: `${ind[1]} ${who} ${st[1]}` };
}

const andList = (a) => (a.length < 2 ? a.join("") : a.slice(0, -1).join(", ") + " and " + a[a.length - 1]);
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// → [[label, html]] lines, in the approved order. esc = HTML escaper.
export function specLines({ tokens, extras, spec, pattern, style, isPage, isSection, hasDarkImage, esc }) {
  const L = [], x = extras || {};
  const colours = (o) => SHOWN_ROLES.filter((r) => o && o[r]).map((r) => `<span class="sc"><i style="background:${esc(o[r])}" aria-hidden="true"></i>${esc(r)} <code>${esc(o[r])}</code></span>`).join(" · ");
  if (tokens) {
    const lc = colours(tokens.light), dc = colours(tokens.dark);
    if (lc) L.push(["Colours (light)", lc]);
    if (dc) L.push(["Colours (dark)", dc]);
    const f = [];
    if (tokens.heading && tokens.body) f.push(tokens.heading === tokens.body ? `${tokens.heading} (headings and body)` : `${tokens.heading} (headings), ${tokens.body} (body)`);
    else if (tokens.heading || tokens.body) f.push(`${tokens.heading || tokens.body} (${tokens.heading ? "headings" : "body"})`);
    if (f.length && x.mono && x.mono !== tokens.heading && x.mono !== tokens.body) f.push(`${x.mono} (code)`);
    if (f.length) L.push(["Fonts", esc(f.join(", "))]);
  }
  if (spec && isPage && spec.sections.length) L.push(["Sections", esc(spec.sections.join(", "))]);
  const dark = tokens && Object.keys(tokens.dark || {}).length > 0;
  if (dark || hasDarkImage) L.push(["Light and dark", spec && spec.darkMedia ? "Both included; follows the system setting" : "Both included"]);
  const r = [];
  if (spec && spec.breakpoints.length) r.push(`layout changes at ${andList(spec.breakpoints.map((p) => p + "px"))}`);
  if (isSection && x.noScroll) r.push(`no horizontal scroll at ${x.noScroll}px`);
  if (r.length) L.push(["Responsive", esc(cap(`one HTML file, ${r.join("; ")}`))]);
  const bf = isPage ? bestFor(pattern, style) : null;
  if (bf) { L.push(["Best for", esc(cap(bf.best) + ".")]); L.push(["Not ideal for", esc(cap(bf.notIdeal) + ".")]); }
  return L;
}

export function specBlock(o) {
  const L = specLines(o);
  return L.length ? `<section class="spec" aria-labelledby="spec-h"><h2 id="spec-h">Spec</h2><dl>${L.map(([k, v]) => `<dt>${o.esc(k)}</dt><dd>${v}</dd>`).join("")}</dl></section>` : "";
}

export const SPEC_CSS = `.spec{margin:0 0 1.1rem;font-size:.88rem;line-height:1.5}.spec h2{font-size:.95rem;margin:0 0 .4rem}
.spec dl{margin:0;display:grid;grid-template-columns:max-content minmax(0,1fr);gap:.35rem .9rem}.spec dt{color:var(--muted)}.spec dd{margin:0;overflow-wrap:anywhere}
.spec .sc{white-space:nowrap}.spec .sc i{display:inline-block;width:.8em;height:.8em;border:1px solid var(--border);border-radius:3px;vertical-align:-.05em;margin-right:.3em}
.spec code{font:.82rem ui-monospace,Menlo,monospace}
@media(max-width:520px){.spec dl{grid-template-columns:1fr;gap:.1rem}.spec dd{margin:0 0 .45rem}}`;
