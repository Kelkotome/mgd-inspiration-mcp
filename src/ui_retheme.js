// Website-template detail pages (/ui/<template>): live preview with a device toggle + "Try it with" re-theming (owner, 28-Nov-2026).
//
// Preview: the template's own live HTML (/ui/raw/<id>.html, same origin, no scripts in any template) in an <iframe
// sandbox="allow-same-origin"> — no allow-scripts, so nothing inside the frame can run (no cookie/session access, no forms, no
// popups, no top navigation), while the parent page can still set CSS variables on the frame's document. The iframe is created by
// JS only when the stage nears the viewport; with JS off the page is unchanged (the screenshot <img> stays in the HTML for SEO).
//
// Re-theming: every template drives its colours and fonts from root CSS variables (--bg --surface --border --text --muted --primary
// --on-primary --accent, --ink/--on-ink = text/bg in light and bg/text in dark, --font-h/--font-b) whose values equal the
// DESIGN.md colour roles. RT_CORE (below) is plain ES5 so the exact same code runs here (tests) and in the browser (stringified).
//
// Palettes: the 10 seeds of the logo maker (tools_core.js PALETTES: primary, accent, ink, paper) expanded to the 9 DESIGN.md roles in
// light and dark by scratch derive_pal.mjs, each pair checked for WCAG AA (tests/test_tpl_retheme.mjs recomputes every ratio).
// Font pairings: Google Fonts pairs from font_pairings.json (both faces on Google Fonts); the stylesheet loads only when picked.

// Visible copy in one place so the owner can swap the wording (options in the round report).
export const RT_COPY = {
  title: "Try it with",
  helper: "Preview this template in another palette or font pairing. Copy HTML and DESIGN.md will use what you pick.",
  palettes: "Colours",
  fonts: "Fonts",
  reset: "Reset",
  original: "Original",
  devices: "Preview size",
  popout: "Pop out ↗",
  status: "Showing {v}. Copy HTML and DESIGN.md now use it.", // {v} = e.g. "Forest colours with Playfair Display + Lato"
};

export const RT_DEVICES = [["desktop", "Desktop", 1280], ["tablet", "Tablet", 768], ["phone", "Phone", 390]];

export const RT_PALETTES = [
  { id: "ink-blue", name: "Ink blue",
    light: { "background": "#f9fbfe", "surface": "#ecf1fc", "border": "#d1d4da", "text": "#0f172a", "muted": "#656b78", "primary": "#1d4ed8", "on-primary": "#ffffff", "accent": "#ba7808", "on-accent": "#000000" },
    dark: { "background": "#0b0f18", "surface": "#171b24", "border": "#30333b", "text": "#e9ebf1", "muted": "#90939a", "primary": "#5378e1", "on-primary": "#111111", "accent": "#f59e0b", "on-accent": "#000000" } },
  { id: "forest", name: "Forest",
    light: { "background": "#f5f6f0", "surface": "#e8ede5", "border": "#cfd2cc", "text": "#14231a", "muted": "#616b63", "primary": "#166534", "on-primary": "#ffffff", "accent": "#ae7703", "on-accent": "#000000" },
    dark: { "background": "#0b100d", "surface": "#171c19", "border": "#303431", "text": "#e9ecea", "muted": "#909492", "primary": "#4e8a65", "on-primary": "#111111", "accent": "#ca8a04", "on-accent": "#000000" } },
  { id: "terracotta", name: "Terracotta",
    light: { "background": "#fdf3eb", "surface": "#f9e8de", "border": "#d9cec6", "text": "#2a1a12", "muted": "#74665e", "primary": "#c2410c", "on-primary": "#ffffff", "accent": "#0f766e", "on-accent": "#ffffff" },
    dark: { "background": "#170e0a", "surface": "#231a16", "border": "#3a322f", "text": "#f0ebe9", "muted": "#999390", "primary": "#cc5f33", "on-primary": "#111111", "accent": "#147971", "on-accent": "#ffffff" } },
  { id: "plum", name: "Plum",
    light: { "background": "#fcf9fe", "surface": "#f4ecfb", "border": "#d6d1da", "text": "#1e1028", "muted": "#706677", "primary": "#7e22ce", "on-primary": "#ffffff", "accent": "#c85d95", "on-accent": "#000000" },
    dark: { "background": "#120c18", "surface": "#1e1824", "border": "#36303b", "text": "#edeaf1", "muted": "#95919a", "primary": "#a260dc", "on-primary": "#111111", "accent": "#f472b6", "on-accent": "#000000" } },
  { id: "navy-gold", name: "Navy & gold",
    light: { "background": "#f9fafb", "surface": "#eceef2", "border": "#d2d5db", "text": "#14213d", "muted": "#626b7e", "primary": "#1e3a5f", "on-primary": "#ffffff", "accent": "#9d7e1e", "on-accent": "#000000" },
    dark: { "background": "#0b0d10", "surface": "#17191c", "border": "#303134", "text": "#eaebec", "muted": "#919294", "primary": "#6f8199", "on-primary": "#111111", "accent": "#c9a227", "on-accent": "#000000" } },
  { id: "sage", name: "Sage",
    light: { "background": "#f6f7f1", "surface": "#edf0e8", "border": "#d1d4cd", "text": "#1f2a20", "muted": "#656c64", "primary": "#59775d", "on-primary": "#ffffff", "accent": "#ad784d", "on-accent": "#000000" },
    dark: { "background": "#101210", "surface": "#1c1e1c", "border": "#343634", "text": "#ecedec", "muted": "#949594", "primary": "#69876c", "on-primary": "#111111", "accent": "#c98b5a", "on-accent": "#000000" } },
  { id: "ocean", name: "Ocean",
    light: { "background": "#f9fbfc", "surface": "#ebf2f4", "border": "#d1d5d8", "text": "#0b1e26", "muted": "#616d73", "primary": "#155e75", "on-primary": "#ffffff", "accent": "#298cb8", "on-accent": "#000000" },
    dark: { "background": "#0b1011", "surface": "#171c1d", "border": "#303435", "text": "#e9eced", "muted": "#909495", "primary": "#528899", "on-primary": "#111111", "accent": "#38bdf8", "on-accent": "#000000" } },
  { id: "cherry", name: "Cherry",
    light: { "background": "#fdf9fa", "surface": "#f9ebef", "border": "#d6d1d2", "text": "#1a0b10", "muted": "#72676a", "primary": "#be123c", "on-primary": "#ffffff", "accent": "#111827", "on-accent": "#ffffff" },
    dark: { "background": "#170b0e", "surface": "#23171a", "border": "#3a3032", "text": "#f0e9eb", "muted": "#999093", "primary": "#d05473", "on-primary": "#111111", "accent": "#676b75", "on-accent": "#ffffff" } },
  { id: "mocha", name: "Mocha",
    light: { "background": "#f9f4ee", "surface": "#f1eae3", "border": "#d6cfc9", "text": "#2b1d14", "muted": "#72675e", "primary": "#6f4e37", "on-primary": "#ffffff", "accent": "#9d7955", "on-accent": "#000000" },
    dark: { "background": "#110f0d", "surface": "#1d1b19", "border": "#353331", "text": "#edebeb", "muted": "#959392", "primary": "#947c6b", "on-primary": "#111111", "accent": "#d4a373", "on-accent": "#000000" } },
  { id: "mono", name: "Mono",
    light: { "background": "#fafafa", "surface": "#ededed", "border": "#d3d3d3", "text": "#171717", "muted": "#696969", "primary": "#262626", "on-primary": "#ffffff", "accent": "#737373", "on-accent": "#ffffff" },
    dark: { "background": "#0c0c0c", "surface": "#181818", "border": "#303030", "text": "#eaeaea", "muted": "#919191", "primary": "#818181", "on-primary": "#111111", "accent": "#737373", "on-accent": "#ffffff" } },
];

// heading/body: Google Fonts families (pairs from font_pairings.json); h/b: generic fallbacks; q: css2 query (weights that exist).
export const RT_FONTS = [
  { id: "playfair-lato", heading: "Playfair Display", body: "Lato", h: "Georgia, serif", b: "system-ui, sans-serif", q: "family=Playfair+Display:wght@400;600;700&family=Lato:wght@400;700" },
  { id: "poppins-inter", heading: "Poppins", body: "Inter", h: "system-ui, sans-serif", b: "system-ui, sans-serif", q: "family=Poppins:wght@400;500;600;700&family=Inter:wght@400;500;600;700" },
  { id: "robotoslab-opensans", heading: "Roboto Slab", body: "Open Sans", h: "Georgia, serif", b: "system-ui, sans-serif", q: "family=Roboto+Slab:wght@400;500;600;700&family=Open+Sans:wght@400;500;600;700" },
  { id: "oswald-lato", heading: "Oswald", body: "Lato", h: "Impact, system-ui, sans-serif", b: "system-ui, sans-serif", q: "family=Oswald:wght@400;500;600;700&family=Lato:wght@400;700" },
  { id: "montserrat-merriweather", heading: "Montserrat", body: "Merriweather", h: "system-ui, sans-serif", b: "Georgia, serif", q: "family=Montserrat:wght@400;500;600;700&family=Merriweather:wght@400;700" },
];

// Pure re-theming core. V = { pal: palette|null, font: font|null }. ES5, no outer references (it is stringified into the page).
export function RT_CORE() {
  var ROLES = ["background", "surface", "border", "text", "muted", "primary", "on-primary", "accent", "on-accent"];
  function lum(h) {
    h = String(h).replace("#", ""); if (h.length === 3) h = h.replace(/./g, "$&$&");
    var c = [0, 2, 4].map(function (i) { var v = parseInt(h.slice(i, i + 2), 16) / 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }
  function ratio(a, b) { var x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
  // CSS variable name → DESIGN.md role for this mode (null = leave alone). --color-x, --x, --bg; --ink/--on-ink are the inverse band.
  function roleOf(name, dark) {
    var n = name.replace(/^color-/, "");
    if (n === "bg") n = "background";
    if (n === "ink") return dark ? "background" : "text";
    if (n === "on-ink") return dark ? "text" : "background";
    return ROLES.indexOf(n) >= 0 ? n : null;
  }
  function fontOf(name) { return /^font-(h|heading)$/.test(name) ? "heading" : /^font-(b|body)$/.test(name) ? "body" : null; }
  function stack(V, which, spaced) {
    var f = V.font, s = '"' + f[which] + '", ' + f[which === "heading" ? "h" : "b"];
    return spaced ? s : s.replace(/, /g, ",");
  }
  // Rewrites declarations inside the theme blocks only: ":root", ':root:not([data-theme="light"])' (inside the dark media query)
  // and ':root[data-theme="dark"]'. Other selectors (".side", ":root .x") are untouched.
  function rewriteCss(css, V) {
    return String(css).replace(/(^|[{}\s;])(:root(?::not\(\[data-theme="light"\]\)|\[data-theme="dark"\])?)(\s*\{)([^}]*)\}/g, function (m, pre, sel, open, body) {
      var dark = sel !== ":root";
      body = body.replace(/(--([a-z0-9-]+)\s*:\s*)([^;}]*?)(\s*)(?=;|$)/g, function (d, lead, name, val, ws) {
        var r = V.pal && roleOf(name, dark), fr = !dark && V.font && fontOf(name);
        if (r && V.pal[dark ? "dark" : "light"][r]) return lead + V.pal[dark ? "dark" : "light"][r] + ws;
        if (fr) return lead + stack(V, fr, /, /.test(val)) + ws;
        return d;
      });
      return pre + sel + open + body + "}";
    });
  }
  function fontsHref(V) { return "https://fonts.googleapis.com/css2?" + V.font.q + "&display=swap"; }
  function label(V) { return [V.pal ? 'palette "' + V.pal.name + '" (light and dark)' : "", V.font ? "fonts " + V.font.heading + " + " + V.font.body : ""].filter(Boolean).join(", "); }
  function short(V) { return [V.pal ? V.pal.name + " colours" : "", V.font ? V.font.heading + " + " + V.font.body : ""].filter(Boolean).join(" with "); }
  function note(V) { return "Variant: " + label(V) + ", picked on Made Good Designs."; }
  function rewriteHtml(html, V) {
    if (!V.pal && !V.font) return html;
    var out = String(html).replace(/(<style[^>]*>)([\s\S]*?)(<\/style>)/gi, function (m, a, b, c) { return a + rewriteCss(b, V) + c; });
    if (V.font) {
      var href = fontsHref(V).replace(/&/g, "&amp;"), done = false;
      out = out.replace(/(<link\b[^>]*href=")https:\/\/fonts\.googleapis\.com\/css2\?[^"]*("[^>]*>)/i, function (m, a, b) { done = true; return a + href + b; });
      if (!done) out = out.replace(/<\/head>/i, '<link href="' + href + '" rel="stylesheet">\n</head>');
    }
    return out.replace(/<\/head>/i, "<!-- " + note(V) + " --></head>");
  }
  // The <style> the preview frame gets: same selectors as the template, appended last, so it wins on source order.
  function overrideCss(V) {
    var d = function (o, dark) {
      var out = [];
      if (V.pal) ["bg", "surface", "border", "text", "muted", "primary", "on-primary", "accent", "on-accent", "ink", "on-ink"].forEach(function (n) { out.push("--" + n + ":" + o[roleOf(n, dark)]); });
      if (!dark && V.font) { out.push("--font-h:" + stack(V, "heading")); out.push("--font-b:" + stack(V, "body")); }
      return out.join(";");
    };
    var css = ":root{" + d(V.pal ? V.pal.light : null, false) + "}";
    if (V.pal) css += '@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){' + d(V.pal.dark, true) + '}}:root[data-theme="dark"]{' + d(V.pal.dark, true) + "}";
    return css;
  }
  // Contrast-table rows: roles from the row label (falls back to the old→new colour map for that mode).
  var PAIRS = { "text on background": ["text", "background"], "text on surface": ["text", "surface"], "muted text on background": ["muted", "background"],
    "muted text on surface": ["muted", "surface"], "primary on background": ["primary", "background"], "label on primary button": ["on-primary", "primary"],
    "accent on surface": ["accent", "surface"], "label on accent": ["on-accent", "accent"] };
  function rewriteMd(md, V) {
    if (!V.pal && !V.font) return md;
    var s = String(md), fm = s.match(/^---\n([\s\S]*?)\n---\n/);
    var old = { light: {}, dark: {} };
    if (fm) fm[1].replace(/^ {2}([a-z-]+): "(#[0-9a-fA-F]{3,8})"/gm, function (m, k, v) { var dk = k.indexOf("dark-") === 0; old[dk ? "dark" : "light"][dk ? k.slice(5) : k] = v.toLowerCase(); return m; });
    var map = function (mode, hex) { var o = old[mode]; for (var r in o) if (o[r] === hex.toLowerCase() && V.pal[mode][r]) return V.pal[mode][r]; return hex; };
    if (fm) {
      var cur = null, inTypo = false;
      var front = fm[1].split("\n").map(function (line) {
        if (/^\S/.test(line)) { inTypo = /^typography:/.test(line); cur = null; }
        if (inTypo && /^ {2}[a-z0-9-]+:\s*$/.test(line)) cur = line.trim().slice(0, -1);
        if (V.pal) { var c = line.match(/^( {2})([a-z-]+)(: ")(#[0-9a-fA-F]{3,8})(".*)$/); if (c) { var dk = c[2].indexOf("dark-") === 0, r = dk ? c[2].slice(5) : c[2], nv = V.pal[dk ? "dark" : "light"][r]; if (nv) return c[1] + c[2] + c[3] + nv + c[5]; } }
        if (V.font && inTypo && cur) { var f = line.match(/^( {4}fontFamily: ")([^"]+)(".*)$/); if (f) { var w = /^h[1-6]$/.test(cur) ? "heading" : /^(body|label|caption)/.test(cur) ? "body" : null; if (w) return f[1] + V.font[w] + f[3]; } }
        return line;
      }).join("\n");
      s = "---\n" + front + "\n---\n" + s.slice(fm[0].length);
    }
    var body = s.slice(fm ? s.indexOf("\n---\n", 4) + 5 : 0), head = s.slice(0, s.length - body.length);
    if (V.pal) {
      // Colors table: | `role` (`--color-role`) | use | `#LIGHT` | `#DARK` |
      body = body.replace(/^(\| `([a-z-]+)` \(`--color-[a-z-]+`\) \|[^|\n]*\| `)(#[0-9a-fA-F]{3,8})(` \| `)(#[0-9a-fA-F]{3,8})(` \|)$/gm, function (m, a, role, l, b, d, e) {
        return V.pal.light[role] ? a + V.pal.light[role].toUpperCase() + b + V.pal.dark[role].toUpperCase() + e : m;
      });
      // Measured contrast tables, recomputed
      var mode = "light";
      body = body.split("\n").map(function (line) {
        var hd = line.match(/^\| Pair \((light|dark)\)/); if (hd) { mode = hd[1]; return line; }
        var row = line.match(/^\| ([^|]+?) \| (#[0-9a-fA-F]{3,8}) on (#[0-9a-fA-F]{3,8}) \| [0-9.]+:1 \| ([0-9.]+):1 \| (Pass|Fail)[^|]*\|$/);
        if (!row) return line;
        var pr = PAIRS[row[1].toLowerCase()], P = V.pal[mode];
        var fg = pr && P[pr[0]] ? P[pr[0]] : map(mode, row[2]), bg = pr && P[pr[1]] ? P[pr[1]] : map(mode, row[3]), r = ratio(fg, bg);
        return "| " + row[1] + " | " + fg.toUpperCase() + " on " + bg.toUpperCase() + " | " + (Math.floor(r * 100) / 100).toFixed(2) + ":1 | " + row[4] + ":1 | " + (r >= +row[4] ? "Pass" : "Fail") + " |";
      }).join("\n");
    }
    if (V.font) body = body.replace(/^(- \*\*Headings:\*\* )([^(\n]+?)( \(|$)/m, "$1" + V.font.heading + "$3").replace(/^(- \*\*Body:\*\* )([^(\n]+?)( \(|$)/m, "$1" + V.font.body + "$3");
    // Tokens as CSS (```css block): same theme blocks as the HTML
    body = body.replace(/(```css\n)([\s\S]*?)(```)/g, function (m, a, b, c) { return a + rewriteCss(b, V) + c; });
    head = head.replace(/(\n---\n)$/, "$1");
    var cm = "<!-- " + note(V) + " -->\n";
    return /^(---\n[\s\S]*?\n---\n)/.test(head) ? head + cm + body : cm + head + body;
  }
  // Same tokens object the kit panel uses ({light, dark, heading, body}), for the variant.
  function tokens(t, V) {
    var c = function (o) { var r = {}; for (var k in o) r[k] = o[k]; return r; };
    var out = { light: c(t.light), dark: c(t.dark), heading: t.heading, body: t.body };
    if (V.pal) { ROLES.forEach(function (r) { if (out.light[r] || V.pal.light[r]) out.light[r] = V.pal.light[r]; if (Object.keys(t.dark).length) out.dark[r] = V.pal.dark[r]; }); }
    if (V.font) { out.heading = V.font.heading; out.body = V.font.body; }
    return out;
  }
  // The kit panel's "Copy CSS variables" / "Copy Tailwind colours" text for a tokens object (mirrors ui_kit.js cssVariables and
  // tailwindColours; tests/test_tpl_retheme.mjs checks they stay byte-identical).
  var KR = ["background", "surface", "border", "text", "muted", "primary", "on-primary", "accent"];
  function kitCss(t) {
    var fonts = [t.heading, t.body].filter(function (x, i, a) { return x && a.indexOf(x) === i; }), f = [];
    var vars = function (o) { return KR.filter(function (r) { return o[r]; }).map(function (r) { return "  --" + r + ": " + o[r] + ";"; }).join("\n"); };
    if (t.heading) f.push('  --font-heading: "' + t.heading + '", sans-serif;');
    if (t.body) f.push('  --font-body: "' + t.body + '", sans-serif;');
    var dark = vars(t.dark);
    var link = "https://fonts.googleapis.com/css2?" + fonts.map(function (n) { return "family=" + encodeURIComponent(n).replace(/%20/g, "+") + ":wght@400;600;700"; }).join("&") + "&display=swap";
    return (fonts.length ? '<link href="' + link + '" rel="stylesheet">\n' : "") + ":root {\n" + [vars(t.light)].concat(f).join("\n") + "\n}" + (dark ? "\n.dark {\n" + dark + "\n}" : "");
  }
  function kitTw(t) {
    var lines = KR.filter(function (r) { return t.light[r]; }).map(function (r) { return '  "' + r + '": "' + t.light[r] + '",'; })
      .concat(KR.filter(function (r) { return t.dark[r]; }).map(function (r) { return '  "dark-' + r + '": "' + t.dark[r] + '",'; }));
    var fonts = [t.heading && "  heading: ['\"" + t.heading + "\"', \"sans-serif\"],", t.body && "  body: ['\"" + t.body + "\"', \"sans-serif\"],"].filter(Boolean);
    return "theme: { extend: {\ncolors: {\n" + lines.join("\n") + "\n}," + (fonts.length ? "\nfontFamily: {\n" + fonts.join("\n") + "\n}," : "") + "\n} }";
  }
  return { short: short, ROLES: ROLES, KR: KR, kitCss: kitCss, kitTw: kitTw, ratio: ratio, roleOf: roleOf, rewriteCss: rewriteCss, rewriteHtml: rewriteHtml, rewriteMd: rewriteMd, overrideCss: overrideCss, fontsHref: fontsHref, label: label, tokens: tokens };
}
export const RT = RT_CORE();

// ---- Page parts (detail page of a website template; ui_screens.js uiItemPage) ------------------------------------------------
export const RT_PAGE_CSS = `.pvbar{display:flex;flex-wrap:wrap;align-items:center;gap:.35rem;margin:0 0 .5rem;min-height:2rem}.pvbar .pvdev{display:flex;gap:.35rem}
.pvbar .pop{margin-left:auto;font-size:.82rem;font-weight:600;text-decoration:none;padding:.25rem .2rem}.pvbar .pop:hover{text-decoration:underline}
.pvstage{position:relative;height:min(82vh,900px);border:1px solid var(--border);border-radius:12px;overflow:hidden;background:var(--surface)}
.detail.mobile .pvstage{height:min(82vh,844px)}
.pagebox .pvstage>.shotscroll{height:100%;max-height:none;overflow:auto;border-radius:0}.pvstage .shot{border:0;border-radius:0}
.pvstage iframe{position:absolute;top:0;left:0;border:0;transform-origin:0 0;opacity:0;transition:opacity .25s;background:#fff}
.pvstage iframe.on{opacity:1}.pvstage.live>.shotscroll{visibility:hidden}.pvstage[data-dev=phone] iframe,.pvstage[data-dev=tablet] iframe{box-shadow:0 0 0 1px var(--border)}
.pvbar .card__save{position:static;box-shadow:none}
.rt{margin:1rem 0 0;padding:14px 16px;border:1px solid var(--border);border-radius:12px;background:var(--surface)}
.rt .rth{display:flex;align-items:center;justify-content:space-between;gap:.5rem}.rt h2{font-size:1rem;margin:0}
.rt .rtn{color:var(--muted);font-size:.85rem;line-height:1.45;margin:.3rem 0 .75rem}
.rt .rtg{display:flex;flex-wrap:wrap;gap:.4rem;align-items:center;margin:0 0 .6rem}.rt .rtg>b{font-size:.75rem;color:var(--muted);min-width:3.6rem;font-weight:600}
.rt .chip{display:inline-flex;align-items:center;gap:.4rem}.rt .chip[aria-pressed=true]{background:var(--text);color:var(--bg);border-color:var(--text)}
.rt .chip i{display:inline-flex;width:2.4rem;height:.95rem;border-radius:4px;overflow:hidden;box-shadow:0 0 0 1px rgba(0,0,0,.15)}.rt .chip i s{flex:1}
.rt [data-rt-reset]{visibility:hidden}.rt.on [data-rt-reset]{visibility:visible}
.rt .rts{font-size:.8rem;color:var(--muted);margin:.1rem 0 0;min-height:1.2em}`;

// Hides the parts that need JS; with JS off the page is the screenshot + the original Open/Copy/Download links.
export const RT_NOSCRIPT = `<noscript><style>.pvdev,.rt{display:none!important}</style></noscript>`;

// Toolbar + stage around the screenshot. shotHtml = the existing <img class="shot"> (kept in the HTML: fallback, SEO, LCP).
export function previewHtml({ src, name, mobile, shotHtml, saveHtml, esc }) {
  const dev = mobile ? "phone" : "desktop";
  return `<div class="pvbar"><span class="pvdev" role="group" aria-label="${esc(RT_COPY.devices)}">${RT_DEVICES.map(([id, label, w]) =>
    `<button type="button" class="chip" data-pv-dev="${id}" data-w="${w}" aria-pressed="${id === dev}">${esc(label)}</button>`).join("")}</span>`
    + `<a class="pop" href="${esc(src)}" target="_blank" rel="noopener nofollow">${esc(RT_COPY.popout)}</a>${saveHtml}</div>`
    + `<div class="pvstage" data-pv="${esc(src)}" data-dev="${dev}" data-title="${esc("Live preview: " + name)}"><div class="shotscroll">${shotHtml}</div></div>`;
}

const stripes = (p) => [p.light.background, p.light.surface, p.light.primary, p.light.accent].map((c) => `<s style="background:${c}"></s>`).join("");
export function rethemePanel(esc) {
  return `<section class="rt" aria-labelledby="rt-h" data-nosnippet><div class="rth"><h2 id="rt-h">${esc(RT_COPY.title)}</h2><button type="button" class="chip" data-rt-reset>${esc(RT_COPY.reset)}</button></div>
<p class="rtn">${esc(RT_COPY.helper)}</p>
<div class="rtg" role="group" aria-label="${esc(RT_COPY.palettes)}"><b>${esc(RT_COPY.palettes)}</b><button type="button" class="chip" data-rt-pal="0" aria-pressed="true">${esc(RT_COPY.original)}</button>${RT_PALETTES.map((p, i) =>
    `<button type="button" class="chip" data-rt-pal="${i + 1}" aria-pressed="false"><i aria-hidden="true">${stripes(p)}</i>${esc(p.name)}</button>`).join("")}</div>
<div class="rtg" role="group" aria-label="${esc(RT_COPY.fonts)}"><b>${esc(RT_COPY.fonts)}</b><button type="button" class="chip" data-rt-font="0" aria-pressed="true">${esc(RT_COPY.original)}</button>${RT_FONTS.map((f, i) =>
    `<button type="button" class="chip" data-rt-font="${i + 1}" aria-pressed="false">${esc(f.heading + " + " + f.body)}</button>`).join("")}</div>
<p class="rts" aria-live="polite"></p></section>`;
}

// Client script: preview (lazy iframe, device toggle, fit-to-column, theme) + re-theming (panel, hash, exports, kit panel).
// cfg = { tokens } (the kit's parsed DESIGN.md tokens, or null when the template has none: preview only, no panel).
const DATA = JSON.stringify({ P: RT_PALETTES, F: RT_FONTS });
export function rtPageJs(cfg) {
  return `<script>(function(){var RT=(${RT_CORE.toString()})(),D=${DATA},T=${JSON.stringify(cfg.tokens || null).replace(/</g, "\\u003c")},MSG=${JSON.stringify(RT_COPY.status)};
var st=document.querySelector(".pvstage");if(!st)return;var bar=document.querySelector(".pvbar"),panel=document.querySelector(".rt"),f=null,ready=false,V={pal:null,font:null},pi=0,fi=0,raw={};
var track=function(a,x){try{if(window.gtag)gtag("event","tpl_preview",{action:a,value:x||""})}catch(e){}};
var W=function(){var b=bar.querySelector('[data-pv-dev][aria-pressed="true"]');return +(b?b.dataset.w:1280)};
function fit(){if(!f)return;var w=st.clientWidth,h=st.clientHeight,d=W(),s=Math.min(1,w/d);f.style.width=d+"px";f.style.height=Math.ceil(h/s)+"px";f.style.transform="scale("+s+")";f.style.left=Math.max(0,Math.round((w-d*s)/2))+"px"}
function doc(){try{return f&&f.contentDocument&&f.contentDocument.documentElement?f.contentDocument:null}catch(e){return null}}
function theme(){var d=doc();if(!d)return;var t="light";try{t=localStorage.getItem("mgd-ui-shot")||"light"}catch(e){}var b=document.querySelector('[data-ui-theme][aria-pressed="true"]');if(b)t=b.dataset.uiTheme;d.documentElement.setAttribute("data-theme",t==="dark"?"dark":"light")}
function paint(){var d=doc();if(!d)return;var h=d.head||d.documentElement,s=d.getElementById("mgd-rt"),l=d.getElementById("mgd-rt-font");
if(!V.pal&&!V.font){if(s)s.remove();if(l)l.remove();return}
if(V.font){if(!l){l=d.createElement("link");l.id="mgd-rt-font";l.rel="stylesheet";h.appendChild(l)}if(l.getAttribute("href")!==RT.fontsHref(V))l.setAttribute("href",RT.fontsHref(V))}else if(l)l.remove();
if(!s){s=d.createElement("style");s.id="mgd-rt"}h.appendChild(s);s.textContent=RT.overrideCss(V)}
function load(){if(f)return;f=document.createElement("iframe");f.setAttribute("sandbox","allow-same-origin");f.setAttribute("loading","lazy");f.setAttribute("referrerpolicy","no-referrer");f.title=st.dataset.title;
f.addEventListener("load",function(){if(!doc())return;ready=true;theme();paint();f.classList.add("on");st.classList.add("live")});f.src=st.dataset.pv;st.appendChild(f);fit()}
// after the page's own load (the screenshot stays the LCP), or 2.5 s at most, and only once the stage is within 300px of the viewport
var go=function(){if(go.d)return;go.d=1;if("IntersectionObserver" in window){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){io.disconnect();load()}})},{rootMargin:"300px 0px"});io.observe(st)}else load()};
if(document.readyState==="complete")go();else{window.addEventListener("load",go);setTimeout(go,2500)}
if(window.ResizeObserver)new ResizeObserver(fit).observe(st);else window.addEventListener("resize",fit);
bar.addEventListener("click",function(e){var b=e.target.closest("[data-pv-dev]");if(!b)return;bar.querySelectorAll("[data-pv-dev]").forEach(function(x){x.setAttribute("aria-pressed",String(x===b))});st.dataset.dev=b.dataset.pvDev;fit();track("device_"+b.dataset.pvDev)});
document.addEventListener("click",function(e){if(e.target.closest("[data-ui-theme]"))setTimeout(theme,0)});
if(!panel||!T)return;
var kit=document.querySelector(".kit"),kitOrig=null;
function kitSet(t){if(!kit)return;if(!kitOrig){kitOrig=[];kit.querySelectorAll("[data-kit-copy]").forEach(function(b){kitOrig.push([b,b.getAttribute("data-kit-copy"),b.innerHTML])})}
kitOrig.forEach(function(o){o[0].setAttribute("data-kit-copy",o[1]);o[0].innerHTML=o[2]});var n=kit.querySelector(".note:not(.cite)");if(n&&!n.dataset.orig)n.dataset.orig=n.innerHTML;if(n)n.innerHTML=n.dataset.orig;
if(!t)return;kit.querySelectorAll(".sws").forEach(function(g){var o=g.dataset.kitTheme==="dark"?t.dark:t.light;g.querySelectorAll(".sw").forEach(function(b){var r=b.querySelector("b").textContent,c=o[r];if(!c)return;b.setAttribute("data-kit-copy",c);b.title="Copy "+c;b.querySelector("i").style.background=c;b.querySelector("span").textContent=c})});
var cs=kit.querySelector('[data-act="copy_css"]'),tw=kit.querySelector('[data-act="copy_tailwind"]');if(cs)cs.setAttribute("data-kit-copy",RT.kitCss(t));if(tw)tw.setAttribute("data-kit-copy",RT.kitTw(t));
if(n&&V.font)n.innerHTML="Fonts: <b>"+(t.heading+" + "+t.body).replace(/[<&]/g,"")+"</b> (Google Fonts)"}
function get(k){if(raw[k])return Promise.resolve(raw[k]);var u=document.querySelector('[data-rt="'+k+'"]');return fetch(u.getAttribute(k==="md"&&u.hasAttribute("href")?"href":"data-copy")).then(function(r){if(!r.ok)throw 0;return r.text()}).then(function(s){raw[k]=s;return s})}
function set(p,ft,quiet){pi=p;fi=ft;V={pal:p?D.P[p-1]:null,font:ft?D.F[ft-1]:null};var on=!!(V.pal||V.font);
panel.querySelectorAll("[data-rt-pal]").forEach(function(b){b.setAttribute("aria-pressed",String(+b.dataset.rtPal===p))});panel.querySelectorAll("[data-rt-font]").forEach(function(b){b.setAttribute("aria-pressed",String(+b.dataset.rtFont===ft))});
panel.classList.toggle("on",on);panel.querySelector(".rts").textContent=on?MSG.replace("{v}",RT.short(V)):"";
if(on){get("html").catch(function(){});get("md").catch(function(){})}
try{history.replaceState(null,"",location.pathname+location.search+(on?"#"+[p?"palette="+p:"",ft?"fonts="+ft:""].filter(Boolean).join("&"):""))}catch(e){}
if(ready)paint();kitSet(on?RT.tokens(T,V):null);if(!quiet)track(on?"variant":"reset",RT.label(V))}
panel.addEventListener("click",function(e){var b=e.target.closest("[data-rt-pal],[data-rt-font],[data-rt-reset]");if(!b)return;
if(b.hasAttribute("data-rt-reset"))set(0,0);else if(b.hasAttribute("data-rt-pal"))set(+b.dataset.rtPal,fi);else set(pi,+b.dataset.rtFont)});
// Copy HTML / Copy DESIGN.md / Download DESIGN.md export the chosen variant (capture phase: runs before the page's generic copy handler)
window.addEventListener("click",function(e){var b=e.target.closest&&e.target.closest("[data-rt]");if(!b||(!V.pal&&!V.font))return;e.preventDefault();e.stopPropagation();
var k=b.dataset.rt,dl=b.hasAttribute("download"),t=b.textContent,done=function(m){if(dl)return;b.textContent=m;setTimeout(function(){b.textContent=t},1600)};
var out=function(s){return k==="html"?RT.rewriteHtml(s,V):RT.rewriteMd(s,V)};
if(dl){get(k).then(function(s){var a=document.createElement("a"),u=URL.createObjectURL(new Blob([out(s)],{type:"text/markdown"}));a.href=u;a.download="DESIGN.md";document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u)},4000)});track("download_md_variant",RT.label(V));return}
var w=raw[k]?navigator.clipboard.writeText(out(raw[k])):get(k).then(function(s){return navigator.clipboard.writeText(out(s))});
w.then(function(){done("Copied ✓")},function(){done("Copy failed")});track("copy_"+k+"_variant",RT.label(V))},true);
var hm=location.hash.match(/palette=(\\d+)/),hf=location.hash.match(/fonts=(\\d+)/),p0=hm?+hm[1]:0,f0=hf?+hf[1]:0;
if(p0>D.P.length)p0=0;if(f0>D.F.length)f0=0;if(p0||f0)set(p0,f0,true)})()</script>`;
}
