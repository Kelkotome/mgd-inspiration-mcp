#!/usr/bin/env node
// Element + layout inventory for every generated screen, parsed from OUR OWN HTML (out/<slug>/index.html) plus the
// template author's meta.json "elements". Writes ../src/ui_elements.json, which the Worker bundles for the
// search_ui_screens `elements` filter and the free-text ranking. No vision model, no D1 migration: re-run after
// `node gen.js` whenever patterns are added or changed, then deploy.
//   node elements.js            → writes ../src/ui_elements.json and prints a summary
//   node elements.js --show a   → print the inventory of slugs matching substring a
// Key: "<pattern>|<variant or ''>|<platform>" (the 8 styles share one template, so they share one inventory).
const fs = require("fs"), path = require("path");
const OUT = path.join(__dirname, "out"), DEST = path.join(__dirname, "..", "src", "ui_elements.json");

// [element, test(html, body)] — class names in tpl/*.js are module-prefixed ("fw-cb", "ao-tog"), so match on suffixes.
const count = (s, re) => (s.match(re) || []).length;
// High-precision detectors only (the templates style mostly inline, so class-name guessing is noisy). The author's curated
// meta.json "elements" are unioned in; these add what authors left out (checkbox columns, toggles, rings, avatar stacks…).
const styles = (b) => b.match(/style="[^"]*"/g) || [];
const px = (s, prop, lo, hi) => { const m = s.match(new RegExp(`(?<![-\\w])${prop}:\\s*(\\d+)px`)); return m && +m[1] >= lo && +m[1] <= hi; };
const D = [
  ["table", (b) => /<table\b/.test(b)],
  ["checkbox", (b) => /type="checkbox"/.test(b) || styles(b).filter((s) => px(s, "width", 12, 18) && px(s, "height", 12, 18) && /border:/.test(s) && !/border-radius:\s*(50%|99)/.test(s)).length >= 2],
  ["toggle", (b) => /role="switch"/.test(b) || styles(b).some((s) => px(s, "width", 28, 48) && px(s, "height", 14, 28) && /border-radius:\s*(99\d*px|50%|1\d\dpx)/.test(s))],
  ["progress-ring", (b) => /<circle[^>]*stroke-dasharray/.test(b)],
  ["avatar-stack", (b) => /class="avatar"[^>]*style="[^"]*margin-left:\s*-\d/.test(b) || /margin-left:\s*-\d[^"]*"[^>]*>[A-Z]{2}</.test(b)],
  ["avatar", (b) => /class="avatar"/.test(b)],
  ["badge", (b) => /class="badge/.test(b)],
  ["sparkline", (b) => count(b, /<svg[^>]*width="(?:[4-9]\d|1[0-6]\d)"[^>]*height="(?:1[2-9]|2\d|3\d|40)"[^>]*>(?:(?!<\/svg>)[^])*?<(?:polyline|path)[^>]*fill="none"/g) >= 2],
  ["chart", (b) => /<svg[^>]*(?:width|viewBox)="(?:0 0 )?(?:[2-9]\d\d|1\d\d\d)/.test(b) && /<(polyline|path|rect)[^>]*(fill="none"|stroke-width="[2-9])/.test(b)],
  ["search-bar", (b) => /class="search"/.test(b) || /placeholder="Search/i.test(b)],
  ["tab-bar", (b) => /<nav class="tabs">/.test(b)],
  ["sidebar-nav", (b) => /<aside class="side"/.test(b)],
  ["form", (b) => /class="(field|input)/.test(b) || /<(input|textarea|select)\b/.test(b)],
  ["dropdown", (b) => /<select\b/.test(b)],
  ["modal", (b) => /role="dialog"|aria-modal="true"/.test(b)],
  ["pagination", (b) => /Page \d+ of \d+|\b\d+[–-]\d+ of [\d,]+/.test(b)],
  ["stepper", (b) => /Step \d+ of \d+/i.test(b)],
  ["star-rating", (b) => /★/.test(b)],
  ["accordion", (b) => /<details\b/.test(b)],
  ["code-block", (b) => /<(pre|code)\b/.test(b)],
  ["kpi-tiles", (b) => count(b, /class="card[^"]*"[^>]*>(?:(?!class="card)[^]){0,600}?class="num"/g) >= 3],
];
function role(b, r) { return new RegExp(`role="${r}"`).test(b); }
// Layout facet: one per screen.
function layout(b, plat) {
  if (plat === "mobile") return /<nav class="tabs">/.test(b) ? "mobile-tab-bar" : "mobile-stack";
  if (/<aside class="side"/.test(b)) return count(b, /<(aside|section)[^>]*class="[^"]*\b(?:[a-z0-9]{1,4}-)?(?:pane|detail|inspector|rail|aside|panel)\b/g) ? "sidebar+detail-pane" : "sidebar";
  if (/class="[^"]*\b(?:[a-z0-9]{1,4}-)?(?:split|pane|master)\b/.test(b)) return "split";
  return /<(header|nav)\b/.test(b) ? "top-nav" : "single-column";
}
const density = (b) => { const n = count(b, />[^<>]{2,}</g); return n > 260 ? "dense" : n > 120 ? "regular" : "airy"; };

function main() {
  const show = process.argv.includes("--show") ? process.argv[process.argv.indexOf("--show") + 1] : null;
  const inv = {};
  const slugs = fs.readdirSync(OUT).filter((d) => fs.existsSync(path.join(OUT, d, "meta.json")) && fs.existsSync(path.join(OUT, d, "index.html")));
  for (const slug of slugs) {
    const m = JSON.parse(fs.readFileSync(path.join(OUT, slug, "meta.json"), "utf8"));
    const html = fs.readFileSync(path.join(OUT, slug, "index.html"), "utf8");
    const b = html.slice(html.indexOf("<body")).replace(/<style[^]*?<\/style>|<script[^]*?<\/script>/g, "");
    const key = `${m.pattern}|${m.variant || ""}|${m.platform}`;
    const e = inv[key] || (inv[key] = { el: new Set(), layout: {}, density: {} });
    // emails lay out with <table role="presentation">: that is not a data table, so skip the table detector for them
    for (const [name, t] of D) if (!(m.type === "email" && name === "table") && t(b)) e.el.add(name);
    for (const x of m.elements || []) e.el.add(x);
    const L = layout(b, m.platform), d = density(b);
    e.layout[L] = (e.layout[L] || 0) + 1; e.density[d] = (e.density[d] || 0) + 1;
    if (show && slug.includes(show)) console.log(slug, L, d, [...D.filter(([, t]) => t(b)).map(([n]) => n)].join(","));
  }
  const top = (o) => Object.entries(o).sort((a, b) => b[1] - a[1])[0][0];
  const out = {};
  for (const k of Object.keys(inv).sort()) out[k] = { elements: [...inv[k].el].sort(), layout: top(inv[k].layout), density: top(inv[k].density) };
  if (show) return;
  fs.writeFileSync(DEST, JSON.stringify(out));
  const freq = {};
  for (const v of Object.values(out)) for (const x of v.elements) freq[x] = (freq[x] || 0) + 1;
  console.log(`wrote ${path.relative(process.cwd(), DEST)}: ${Object.keys(out).length} screen templates, ${Object.keys(freq).length} element names, ${fs.statSync(DEST).size} bytes`);
  console.log(Object.entries(freq).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} ${n}`).join(" · "));
}
main();
