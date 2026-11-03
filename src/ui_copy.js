// Copy deck for a UI screen: every visible string in OUR generated HTML, grouped by role, as JSON — for localisation,
// swapping the fictional copy for the user's own, or feeding a CMS. Pure function (no DOM in Workers): a small tag
// tokenizer with a context stack; the nearest classifying ancestor decides the group.
const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);
const ENT = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", middot: "·", hellip: "…", ndash: "–", mdash: "—", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“", times: "×", copy: "©", bull: "•", rarr: "→", larr: "←" };
const dec = (s) => s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => e[0] === "#" ? String.fromCodePoint(e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : +e.slice(1)) : ENT[e.toLowerCase()] ?? m);
function roleOf(tag, attrs) {
  const cls = (attrs.match(/\bclass="([^"]*)"/) || [])[1] || "", role = (attrs.match(/\brole="([^"]*)"/) || [])[1] || "";
  if (/^h[1-6]$/.test(tag)) return tag === "h1" ? "title" : "headings";
  if (/(^|\s)(h|mtitle|title)(\s|$)/.test(cls)) return "headings";
  if (tag === "button" || tag === "a" && /\bbtn\b/.test(cls) || /(^|\s)([\w]{1,4}-)?btn(\s|$)/.test(cls) || role === "button") return "buttons";
  if (tag === "label" || tag === "legend") return "labels";
  if (role === "alert" || role === "status") return "messages";
  if (tag === "nav" || tag === "aside" && /\bside\b/.test(cls) || role === "tablist" || /(^|\s)tabs?(\s|$)/.test(cls)) return "navigation";
  if (tag === "th" || tag === "thead") return "table_headers";
  if (/(^|\s)badge/.test(cls)) return "badges";
  if (tag === "footer") return "footer";
  if (tag === "header") return "header";
  return null;
}
export function extractCopy(html) {
  let b = String(html || "");
  const bi = b.search(/<body[\s>]/i); if (bi >= 0) b = b.slice(bi);
  b = b.replace(/<div class="status">(?:(?!<\/div>)[^])*<\/div>/g, " ").replace(/<(style|script|svg|template)\b[^]*?<\/\1>/gi, " ").replace(/<!--[^]*?-->/g, " ");
  const groups = {}, seen = new Set(), stack = [];
  const add = (g, s) => { s = dec(s).replace(/\s+/g, " ").trim(); if (!s || !/[A-Za-z0-9]/.test(s) || s.length > 400) return; const k = g + "\u0000" + s; if (seen.has(k)) return; seen.add(k); (groups[g] = groups[g] || []).push(s); };
  const ctx = () => { for (let i = stack.length - 1; i >= 0; i--) if (stack[i].role) return stack[i].role; return "text"; };
  const re = /<(\/?)([a-zA-Z][\w-]*)([^>]*)>|([^<]+)/g; let m, buf = "", bufRole = null;
  const flush = () => { if (buf) add(bufRole || "text", buf); buf = ""; bufRole = null; };
  // inline tags don't break a string ("Free over <b>$100</b>" stays one string)
  const INLINE = new Set(["b", "strong", "i", "em", "span", "small", "u", "s", "sup", "sub", "mark", "abbr", "code", "kbd", "time"]);
  while ((m = re.exec(b))) {
    if (m[4] != null) { const r = ctx(); if (bufRole && bufRole !== r) flush(); bufRole = r; buf += m[4]; continue; }
    const close = m[1] === "/", tag = m[2].toLowerCase(), attrs = m[3] || "";
    // a span styled as a box (chip, pill, page number, avatar) is its own string; plain <b>/<span class="muted"> runs merge
    const boxy = !INLINE.has(tag) || /display:|padding|width:|height:|border|margin/.test(attrs) || /class="[^"]*\b(btn|badge|avatar|chip|pill|tag|kbd)/.test(attrs) || roleOf(tag, attrs);
    if (boxy) flush(); 
    for (const at of ["placeholder", "aria-label", "alt", "title"]) { const v = !close && (attrs.match(new RegExp(`\\b${at}="([^"]+)"`)) || [])[1]; if (v) add(at === "placeholder" ? "placeholders" : "accessibility_labels", v); }
    if (!close && tag === "input") { const v = (attrs.match(/\bvalue="([^"]+)"/) || [])[1]; if (v && !/type="(hidden|checkbox|radio)"/.test(attrs)) add("field_values", v); }
    if (VOID.has(tag) || attrs.endsWith("/")) continue;
    if (close) { const i = stack.map((s) => s.tag).lastIndexOf(tag); if (i >= 0) stack.length = i; }
    else stack.push({ tag, role: roleOf(tag, attrs) });
  }
  flush();
  const ORDER = ["title", "headings", "navigation", "buttons", "labels", "placeholders", "field_values", "messages", "table_headers", "badges", "header", "text", "footer", "accessibility_labels"];
  const out = {}; for (const k of ORDER) if (groups[k]) out[k] = groups[k];
  return out;
}
