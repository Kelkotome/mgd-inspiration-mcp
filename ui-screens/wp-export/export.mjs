#!/usr/bin/env node
// MGD HTML to WordPress block theme exporter (7-Nov-2026).
// Input: one template document (index.html from ui-screens) plus its design identity. Output: an installable, activatable block theme:
// style.css, theme.json, functions.php, templates/, parts/, patterns/, styles/ (one per style preset, plus dark), assets/, screenshot.png, readme.txt.
// The page is rebuilt as real core blocks so a site owner can edit it in the Site Editor; anything with no core block (forms, icons) is a
// Custom HTML block and is counted in report.json. Nothing here reaches the network.
//
//   node export.mjs --html <index.html> --slug mgd-cardiology-atlas --name "MGD Cardiology Atlas" --family cardiology --style corporate \
//        --niche cardiology --desc "..." --out <dir> [--screenshot <png>] [--zip]
import fs from "node:fs"; import path from "node:path"; import crypto from "node:crypto"; import { execFileSync } from "node:child_process";
import { createRequire } from "node:module"; import { fileURLToPath } from "node:url"; import vm from "node:vm";
import { parse, serialize, serializeOuter, defaultTreeAdapter as TA } from "parse5";
import postcss from "postcss";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const UI = process.env.MGD_UI_DIR || path.join(HERE, "..");
const CORES = process.env.MGD_CORES_DIR || path.join(UI, "../../tool-gap-2026-10/newtools");
const require = createRequire(import.meta.url);
const lib = require(path.join(UI, "lib.js"));
const { STYLES, FAMILIES } = lib;

// Same seeded palette as gen.js, so a theme's colours match the screens of the same family and style.
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function hashStr(s) { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; }
const sandbox = { Math: Object.create(Math) }; sandbox.window = sandbox; vm.createContext(sandbox);
for (const f of ["color-roles-core.js", "design-md-core.js"]) vm.runInContext(fs.readFileSync(path.join(CORES, f), "utf8"), sandbox);
const R = sandbox.MGDRoles, DM = sandbox.MGDDesignMd; lib.setCore(DM);
export function palette(family, styleName) {
  const st = STYLES[styleName];
  sandbox.Math.random = mulberry32(hashStr(FAMILIES[family].name + styleName));
  const sd = R.seed({ mood: st.mood, harmony: st.harmony, hue: st.hue });
  const light = R.build(sd, "light").roles, dark = R.build(sd, "dark").roles;
  if (st.mono) for (const [t, g] of [[light, ["#ffffff", "#fafafa", "#e4e4e4", "#111111", "#666666", "#111111", "#ffffff", "#444444"]], [dark, ["#0a0a0a", "#161616", "#2c2c2c", "#f2f2f2", "#a0a0a0", "#f2f2f2", "#0a0a0a", "#c8c8c8"]]])
    R.ROLES.forEach((k, i) => { t[k] = g[i]; });
  return { light, dark };
}

// ---- block markup helpers ------------------------------------------------------------------------------------------------------
const attrsJson = (o) => { // same escaping as WordPress serialize_block_attributes()
  const k = Object.keys(o); if (!k.length) return "";
  return " " + JSON.stringify(o).replace(/--/g, "\\u002d\\u002d").replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026").replace(/\\"/g, "\\u0022") + " ";
};
const open = (n, a = {}) => `<!-- wp:${n}${attrsJson(a) || " "}-->`;
const close = (n) => `<!-- /wp:${n} -->`;
const single = (n, a = {}) => `<!-- wp:${n}${attrsJson(a) || " "}/-->`;
const escAttr = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

const INLINE = new Set(["a", "abbr", "b", "br", "cite", "code", "em", "i", "kbd", "mark", "s", "small", "span", "strong", "sub", "sup", "time", "u", "svg", "label", "q", "del", "ins"]);
const WRAPPER_ONLY = new Set(["nav", "aside", "section", "article", "header", "footer", "main", "figure", "dl", "ul", "ol", "li", "details", "address"]);
const isEl = (n) => !!n.tagName;
const isText = (n) => n.nodeName === "#text";
const attr = (n, k) => { const a = (n.attrs || []).find((x) => x.name === k); return a ? a.value : null; };
const classes = (n) => (attr(n, "class") || "").split(/\s+/).filter(Boolean);
const kids = (n) => (n.childNodes || []).filter((c) => (isEl(c) && !["style", "script"].includes(c.tagName)) || (isText(c) && c.value.trim()));
const FORMY = new Set(["form", "input", "select", "textarea"]);
const hasDesc = (n, f) => (n.childNodes || []).some((c) => isEl(c) && (f(c) || (c.tagName !== "svg" && hasDesc(c, f))));
const isInline = (n) => isText(n) || (isEl(n) && INLINE.has(n.tagName) && (n.tagName === "svg" || kids(n).every(isInline)));
const isBtn = (n) => isEl(n) && ((n.tagName === "a" && classes(n).includes("btn")) || n.tagName === "button");

export class Exporter {
  constructor(opts) {
    this.o = opts; this.css = []; this.inlineRules = new Map(); this.assets = new Map(); this.stats = { blocks: 0, html: 0, htmlWhy: {}, droppedAttrs: {} };
    this.btnClasses = new Set(); this.usedClasses = new Set(["sk", "btn", "wp-block-button", "wp-block-button__link", "wp-block-buttons", "mgd-inline", "mgd-stretch", "logo"]);
    this.inPattern = true; this.firstLink = null;
  }
  count(kind, why) { this.stats.blocks++; if (kind === "html") { this.stats.html++; this.stats.htmlWhy[why] = (this.stats.htmlWhy[why] || 0) + 1; } }
  dropped(a) { this.stats.droppedAttrs[a] = (this.stats.droppedAttrs[a] || 0) + 1; }
  // Class list for a block's wrapper, with any inline style turned into a generated class (blocks may not carry arbitrary style="").
  cls(n, extra = []) {
    const c = [...classes(n), ...extra]; c.forEach((x) => this.usedClasses.add(x));
    const st = attr(n, "style");
    if (st) { const id = "mgd-i-" + crypto.createHash("md5").update(st).digest("hex").slice(0, 7); this.inlineRules.set(id, st); c.push(id); this.usedClasses.add(id); }
    return c;
  }
  common(n, c, extra = {}) { // block attrs shared by group, heading, paragraph, list, table
    const a = { ...extra }; if (c.length) a.className = c.join(" ");
    const id = attr(n, "id"); if (id) a.anchor = id;
    const al = attr(n, "aria-label"); if (al) this.dropped("aria-label");
    for (const k of ["role", "aria-labelledby"]) if (attr(n, k)) this.dropped(k);
    return a;
  }
  idAttr(n) { const id = attr(n, "id"); return id ? ` id="${escAttr(id)}"` : ""; }
  html(n, why) { this.count("html", why); (function w(x, s) { classes(x).forEach((c) => s.add(c)); (x.childNodes || []).forEach((k) => isEl(k) && w(k, s)); })(n, this.usedClasses); return `${open("html")}\n${serializeOuter(n)}\n${close("html")}`; }
  inner(n) { (function w(x, s) { (x.childNodes || []).forEach((k) => { if (isEl(k)) { classes(k).forEach((c) => s.add(c)); w(k, s); } }); })(n, this.usedClasses); return serialize(n).trim(); }
  linked(s) { if (this.firstLink != null) { const h = this.firstLink; this.firstLink = null; return `<a href="${escAttr(h)}">${s}</a>`; } return s; }

  heading(n) {
    this.count(); const level = +n.tagName[1], c = this.cls(n), a = this.common(n, c); if (level !== 2) a.level = level;
    return `${open("heading", a)}\n<h${level}${this.idAttr(n)} class="${["wp-block-heading", ...c].join(" ")}">${this.linked(this.inner(n))}</h${level}>\n${close("heading")}`;
  }
  para(n, innerHtml, extra = []) {
    this.count(); const c = this.cls(n, extra), a = this.common(n, c);
    return `${open("paragraph", a)}\n<p${this.idAttr(n)}${c.length ? ` class="${c.join(" ")}"` : ""}>${this.linked(innerHtml)}</p>\n${close("paragraph")}`;
  }
  list(n) {
    this.count(); const tag = n.tagName, c = this.cls(n), a = this.common(n, c, tag === "ol" ? { ordered: true } : {});
    const items = kids(n).map((li) => { this.count(); const lc = this.cls(li), la = lc.length ? { className: lc.join(" ") } : {}; return `${open("list-item", la)}\n<li${lc.length ? ` class="${lc.join(" ")}"` : ""}>${this.inner(li)}</li>\n${close("list-item")}`; }).join("\n");
    return `${open("list", a)}\n<${tag}${this.idAttr(n)} class="${["wp-block-list", ...c].join(" ")}">${items}</${tag}>\n${close("list")}`;
  }
  table(n) {
    // core/table keeps only text, scope, colspan, rowspan and align on cells. Cells with classes, data-* or block children stay Custom HTML.
    const rows = []; const sections = [];
    for (const s of n.childNodes.filter(isEl)) { if (!["thead", "tbody", "tfoot"].includes(s.tagName)) return this.html(n, "table-structure"); sections.push(s); }
    for (const s of sections) for (const tr of s.childNodes.filter(isEl)) { if ((tr.attrs || []).length) return this.html(n, "table-row-attrs"); for (const td of tr.childNodes.filter(isEl)) { rows.push(td); if (!kids(td).every(isInline)) return this.html(n, "table-cell-blocks"); if ((td.attrs || []).some((a) => !["scope", "colspan", "rowspan"].includes(a.name))) return this.html(n, "table-cell-attrs"); } }
    this.count(); const c = this.cls(n), a = this.common(n, c);
    const body = sections.map((s) => `<${s.tagName}>${s.childNodes.filter(isEl).map((tr) => `<tr>${tr.childNodes.filter(isEl).map((td) => { const at = (td.attrs || []).map((x) => ` ${x.name}="${escAttr(x.value)}"`).join(""); return `<${td.tagName}${at}>${this.inner(td)}</${td.tagName}>`; }).join("")}</tr>`).join("")}</${s.tagName}>`).join("");
    return `${open("table", a)}\n<figure class="${["wp-block-table", ...c].join(" ")}"><table>${body}</table></figure>\n${close("table")}`;
  }
  buttonsInner(btns) {
    return btns.map((b) => {
      this.count(); const c = classes(b).filter((x) => x !== "btn"); c.forEach((x) => { this.btnClasses.add(x); this.usedClasses.add(x); });
      const st = attr(b, "style"); if (st) { const id = "mgd-i-" + crypto.createHash("md5").update(st).digest("hex").slice(0, 7); this.inlineRules.set(id, st); c.push(id); this.btnClasses.add(id); this.usedClasses.add(id); }
      const a = c.length ? { className: c.join(" ") } : {}; const href = attr(b, "href") || "#";
      return `${open("button", a)}\n<div class="${["wp-block-button", ...c].join(" ")}"><a class="wp-block-button__link wp-element-button" href="${escAttr(href)}">${this.inner(b)}</a></div>\n${close("button")}`;
    }).join("\n");
  }
  buttons(n, btns) {
    this.count(); const c = n ? this.cls(n) : [], a = n ? this.common(n, c) : {};
    return `${open("buttons", a)}\n<div class="${["wp-block-buttons", ...c].join(" ")}">${this.buttonsInner(btns)}</div>\n${close("buttons")}`;
  }
  details(n) {
    this.count(); const sum = n.childNodes.find((c) => c.tagName === "summary"); const rest = kids(n).filter((c) => c !== sum);
    if (!sum || !kids(sum).every(isInline)) return this.html(n, "details-complex");
    const c = this.cls(n), a = this.common(n, c, attr(n, "open") != null ? { showContent: true } : {});
    return `${open("details", a)}\n<details${this.idAttr(n)} class="${["wp-block-details", ...c].join(" ")}"${attr(n, "open") != null ? " open" : ""}><summary>${this.inner(sum)}</summary>${this.children(rest)}</details>\n${close("details")}`;
  }
  svg(n) {
    const vb = (attr(n, "viewbox") || attr(n, "viewBox") || "").split(/\s+/).map(Number), w = +attr(n, "width") || vb[2] || 0;
    const styled = classes(n).length || hasDesc(n, (x) => classes(x).length > 0);
    if (w >= 200 && !styled && this.inPattern) {
      const src = this.svgFile(n), id = "img-" + crypto.createHash("md5").update(src).digest("hex").slice(0, 10) + ".svg";
      this.assets.set(id, src); this.count();
      const alt = attr(n, "aria-label") || "", c = this.cls(n);
      return `${open("image", { sizeSlug: "full", ...(c.length ? { className: c.join(" ") } : {}) })}\n<figure class="${["wp-block-image", "size-full", ...c].join(" ")}"><img src="<?php echo esc_url( get_theme_file_uri( 'assets/img/${id}' ) ); ?>" alt="${escAttr(alt)}"/></figure>\n${close("image")}`;
    }
    return this.html(n, "icon-svg");
  }
  svgFile(n) { // the illustration as a standalone file: CSS variables resolve against the theme's default palette
    const s = serializeOuter(n).replace(/viewbox=/g, "viewBox=").replace(/preserveaspectratio=/g, "preserveAspectRatio=").replace(/lineargradient/g, "linearGradient").replace(/radialgradient/g, "radialGradient").replace(/stop-color/g, "stop-color").replace(/gradientunits/g, "gradientUnits").replace(/gradienttransform/g, "gradientTransform");
    const t = this.tokens, css = `<style>:root{--bg:${t.background};--surface:${t.surface};--border:${t.border};--text:${t.text};--muted:${t.muted};--primary:${t.primary};--on-primary:${t["on-primary"]};--accent:${t.accent}}</style>`;
    return s.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"').replace(/>/, ">" + css);
  }
  group(n, tag, inner, extra = []) {
    this.count(); const c = this.cls(n, extra), a = this.common(n, c, tag !== "div" ? { tagName: tag } : {});
    return `${open("group", a)}\n<${tag}${this.idAttr(n)} class="${["wp-block-group", ...c].join(" ")}">${inner}</${tag}>\n${close("group")}`;
  }
  // Children of a wrapper: consecutive inline nodes become one transparent paragraph, runs of buttons become core/buttons.
  children(list) {
    const out = []; let run = [];
    const flush = () => {
      if (!run.length) return;
      if (run.every(isBtn)) out.push(this.buttons(null, run));
      else { const h = run.map((x) => { if (isEl(x)) this.touch(x); return isText(x) ? escText(x.value) : serializeOuter(x); }).join("").trim(); if (h) { this.usedClasses.add("mgd-inline"); out.push(this.para({ attrs: [{ name: "class", value: "mgd-inline" }] }, h)); } }
      run = [];
    };
    for (const k of list) {
      if (isInline(k) && !(isEl(k) && k.tagName === "svg" && +(attr(k, "width") || 0) >= 200)) { run.push(k); continue; }
      if (isBtn(k)) { run.push(k); continue; }
      flush(); out.push(this.node(k));
    }
    flush(); return out.join("\n");
  }
  touch(n) { classes(n).forEach((c) => this.usedClasses.add(c)); (n.childNodes || []).forEach((k) => isEl(k) && this.touch(k)); }
  node(n) {
    if (isText(n)) return "";
    const t = n.tagName;
    if (["style", "script"].includes(t)) return "";
    if (t === "svg") return this.svg(n);
    if (FORMY.has(t) || hasDesc(n, (x) => FORMY.has(x.tagName))) { if (t === "form" || !hasDesc(n, (x) => x.tagName === "form") || true) { if (t !== "form" && hasDesc(n, (x) => x.tagName === "form")) return this.wrap(n); return this.html(n, "form"); } }
    if (/^h[1-6]$/.test(t)) { if (!kids(n).every(isInline)) return this.html(n, "heading-blocks"); return this.heading(n); }
    if (t === "p") { if (!kids(n).every(isInline)) return this.wrap(n); return this.para(n, this.inner(n)); }
    if ((t === "ul" || t === "ol") && kids(n).every((li) => li.tagName === "li" && kids(li).every(isInline))) return this.list(n);
    if (t === "table") return this.table(n);
    if (t === "details") return this.details(n);
    if (t === "a") { // a card-sized link: a real group whose first text carries the link, stretched over the card by CSS
      if (isBtn(n)) return this.buttons(null, [n]);
      if (!kids(n).every(isInline)) { this.firstLink = attr(n, "href") || "#"; const h = this.children(kids(n)); const r = this.group({ ...n, attrs: n.attrs.filter((a) => a.name !== "href") }, "div", h, ["mgd-stretch"]); this.firstLink = null; return r; }
      return this.para({ attrs: [] }, serializeOuter(n), ["mgd-inline"]);
    }
    if (isBtn(n)) return this.buttons(null, [n]);
    return this.wrap(n);
  }
  wrap(n) {
    const t = n.tagName, k = kids(n);
    if (k.length && k.every(isBtn)) return this.buttons(n, k);
    if (k.length && !textOf(n).trim() && !hasDesc(n, (x) => x.tagName === "a" || (x.tagName === "svg" && +(attr(x, "width") || 0) >= 200))) return this.html(n, "decoration");
    if (!WRAPPER_ONLY.has(t) && k.length && k.every(isInline) && !k.some(isBtn) && !k.some((x) => x.tagName === "svg" && +(attr(x, "width") || 0) >= 200)) return this.para(n, this.inner(n), ["mgd-d", ...(t === "div" ? [] : [`mgd-t-${t}`])]);
    return this.group(n, t, this.children(k));
  }
  navBlock(navEl) {
    const links = kids(navEl).filter((x) => x.tagName === "a");
    const inner = links.map((a) => { this.count(); return single("navigation-link", { label: kids(a).map((x) => (isText(x) ? x.value : "")).join("") || serialize(a), url: attr(a, "href") || "#", kind: "custom", isTopLevelLink: true }); }).join("\n");
    this.count(); const c = this.cls(navEl);
    return `${open("navigation", { overlayMenu: "mobile", icon: "menu", ...(c.length ? { className: c.join(" ") } : {}), layout: { type: "flex", orientation: navEl.__vertical ? "vertical" : "horizontal", justifyContent: "left" } })}\n${inner}\n${close("navigation")}`;
  }
  // Site header: logo text becomes site-title (the owner's own name), the link row a real Navigation block.
  headerPart(h) {
    const walk = (n) => {
      if (isEl(n) && n.tagName === "a" && classes(n).includes("logo")) { this.count(); return single("site-title", { level: 0, className: "logo" }); }
      if (isEl(n) && n.tagName === "div" && classes(n).includes("logo")) { this.count(); return single("site-title", { level: 0, className: "logo" }); }
      if (isEl(n) && n.tagName === "details" && classes(n).includes("sk-menu")) return "";
      if (isEl(n) && n.tagName === "nav" && kids(n).length && kids(n).every((x) => x.tagName === "a" && !isBtn(x))) { if (classes(n).includes("lg-vert")) n.__vertical = true; return this.navBlock(n); }
      if (isBtn(n)) return this.buttons(null, [n]);
      if (isEl(n) && kids(n).length && kids(n).every(isBtn)) return this.buttons(n, kids(n));
      if (isEl(n) && (hasDesc(n, (x) => x.tagName === "nav" || classes(x).includes("logo")))) return this.group(n, n.tagName, kids(n).map(walk).join("\n"));
      return this.node(n);
    };
    return walk(h);
  }
}
const escText = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// ---- CSS ---------------------------------------------------------------------------------------------------------------------------
const TOKEN_MAP = { "--bg": "background", "--surface": "surface", "--border": "border", "--text": "text", "--muted": "muted", "--primary": "primary", "--on-primary": "on-primary", "--accent": "accent", "--ink": "text", "--on-ink": "background", "--danger": "danger", "--on-danger": "on-danger", "--success": "success", "--warning": "warning" };
function rewriteBtn(sel, btnClasses) {
  let s = sel;
  // .btn compounds: other classes on the compound sit on the core/button wrapper, the look sits on its link
  s = s.replace(/((?:\.[\w-]+)*)\.btn(?![\w-])((?:\.[\w-]+)*)((?::[\w-]+(?:\([^)]*\))?)*)/g, (m, pre, post, ps) => `.wp-block-button${pre}${post}>.wp-block-button__link${ps}`);
  return s;
}
function buildCss(raw, ex) {
  const root = postcss.parse(raw);
  root.walkAtRules("media", (a) => { if (/prefers-color-scheme/.test(a.params)) a.remove(); });
  root.walkAtRules("import", (a) => a.remove());
  root.walkRules((r) => {
    const sels = r.selectors.filter((s) => !/\[data-theme|^:root/.test(s)).filter((s) => [...s.matchAll(/\.([\w-]+)/g)].every((m) => ex.usedClasses.has(m[1])));
    if (!sels.length) { r.remove(); return; }
    const out = [];
    for (const s of sels) { out.push(s); if (/\.btn(?![\w-])/.test(s)) out.push(rewriteBtn(s, ex.btnClasses)); for (const c of ex.btnClasses) if (s.includes("." + c) && !/\.btn(?![\w-])/.test(s)) out.push(s.replace(new RegExp(`\\.${c}(?![\\w-])`), `.wp-block-button.${c}>.wp-block-button__link`)); }
    const tagFix = (s) => s.replace(/(^|[\s>+~])div(?=[\s>+~:.\[]|$)/g, "$1:is(div,p.mgd-d)").replace(/(^|[\s>+~])(dt|dd|label|small|span|b)(?=[\s>+~:.\[]|$)/g, (m, a, t) => `${a}:is(${t},.mgd-t-${t})`).replace(/(^|[\s>+~])p(?=[\s>+~:.\[]|$)/g, "$1p:not(.mgd-d):not(.mgd-inline)");
    const fixed = out.map((s) => tagFix(s.replace(/\.logo b\b/, ".logo::before")));
    // a run of inline children sits in a display:contents paragraph, so a child selector needs a second form
    const viaInline = fixed.filter((s) => />/.test(s) && !/wp-block-button/.test(s)).map((s) => { const i = s.lastIndexOf(">"); return `${s.slice(0, i)}>.mgd-inline>${s.slice(i + 1)}`; });
    r.selectors = [...fixed, ...viaInline];
  });
  root.walkAtRules((a) => { if (a.nodes && !a.nodes.length) a.remove(); });
  return root.toString().replace(/\n{2,}/g, "\n");
}
const BODY_TOKENS = (hscale) => `body{${Object.entries(TOKEN_MAP).map(([k, v]) => `${k}:var(--wp--preset--color--${v});`).join("")}
--radius-sm:var(--wp--custom--radius--sm);--radius:var(--wp--custom--radius--md);--radius-lg:var(--wp--custom--radius--lg);--shadow-sm:var(--wp--custom--shadow--sm);--shadow:var(--wp--custom--shadow--md);--shadow-lg:var(--wp--custom--shadow--lg);
--font-h:var(--wp--preset--font-family--heading);--font-b:var(--wp--preset--font-family--body);--hw:var(--wp--custom--heading--weight);--ls:var(--wp--custom--heading--tracking);--hs:var(--wp--custom--heading--scale)}\n`;
// Block-theme glue. Collapse the nav below 960 px (core only collapses below 600 px, which is where the 768 px overflow bug would come back).
// Before the design's CSS, so its own rules win: core gives every table cell a full border
const RESET = `.wp-block-table td,.wp-block-table th{border:0}.wp-block-table thead{border-bottom:0}.wp-block-table tfoot{border-top:0}
`;
const GLUE = `
.wp-site-blocks{min-height:100vh}
.wp-block-template-part{display:contents}
header .wp-block-navigation{flex:none}
header .wp-block-site-title{min-width:0}
@media (max-width:560px){header .wp-block-buttons{display:none}}
.mgd-inline{display:contents}
.mgd-stretch{position:relative}
.mgd-stretch a::after{content:"";position:absolute;inset:0}
.wp-block-group,.wp-block-buttons{box-sizing:border-box}
.wp-block-buttons{display:flex;flex-wrap:wrap;gap:12px;align-items:center}
.wp-block-button{margin:0;padding:0;height:auto}
.wp-block-button.block,.wp-block-buttons:has(>.block){width:100%}
.wp-block-button.block>.wp-block-button__link{width:100%}
.wp-block-button>.wp-block-button__link{box-sizing:border-box;text-decoration:none;word-break:normal}
.wp-block-image{margin:0}.wp-block-image img{display:block;width:100%;height:auto}
.sk-photo .wp-block-image,.sk-photo .wp-block-image img{height:100%;object-fit:cover}
.wp-block-table{margin:0;overflow-x:auto}
.wp-block-site-title{margin:0}.wp-block-site-title a{color:inherit;text-decoration:none}
.logo::before{content:"";flex:none;width:22px;height:22px;border-radius:var(--radius-sm);background:var(--primary);display:inline-block}
.wp-block-details summary{cursor:pointer}
.wp-block-navigation{gap:24px}
.wp-block-navigation .wp-block-navigation-item__content{text-decoration:none}
.wp-block-navigation__responsive-container.is-menu-open{background:var(--bg);color:var(--text);padding:24px}
.wp-block-navigation__responsive-container-open,.wp-block-navigation__responsive-container-close{color:inherit}
@media (max-width:960px){
  .wp-block-navigation__responsive-container-open:not(.always-shown){display:flex}
  .wp-block-navigation__responsive-container:not(.hidden-by-default):not(.is-menu-open){display:none}
  .sk-navend{display:none}
  .sk-links{display:block;margin-left:auto}
}
/* posts, pages and archives */
.mgd-page{max-width:720px;margin:0 auto;padding:64px 24px}
.mgd-page .wp-block-post-content>*+*{margin-top:1em}
.mgd-page h1{font-size:calc(40px * var(--hs));margin-bottom:24px}
.mgd-page .wp-block-post-template{list-style:none;display:grid;gap:32px}
.mgd-page a{text-decoration:underline}
.mgd-page .wp-block-search__inside-wrapper{display:flex;gap:8px;margin-top:16px}
.mgd-page .wp-block-search__input{flex:1;height:44px;padding:0 12px;border:1px solid var(--border);border-radius:var(--radius);background:var(--surface);color:var(--text)}
.mgd-page .wp-block-search__button{height:44px;padding:0 16px;border:0;border-radius:var(--radius);background:var(--primary);color:var(--on-primary)}
`;

// ---- theme.json ---------------------------------------------------------------------------------------------------------------------
const FONT_FILES = { "Inter": ["inter", [400, 500, 600, 700]], "Instrument Serif": ["instrument-serif", [400]], "Space Grotesk": ["space-grotesk", [400, 500, 700]], "Cormorant Garamond": ["cormorant-garamond", [500, 600]], "Manrope": ["manrope", [400, 500, 600]], "Fredoka": ["fredoka", [500, 600]], "Nunito": ["nunito", [400, 600, 700]], "IBM Plex Sans": ["ibm-plex-sans", [400, 500, 600]], "Fraunces": ["fraunces", [600, 700]], "DM Sans": ["dm-sans", [400, 500, 700]], "Geist": ["geist", [400, 500, 600, 700]] };
const fontFamily = (name, slug, fallback) => { const [dir, ws] = FONT_FILES[name]; return { name: `${name}`, slug, fontFamily: `"${name}", ${fallback}`, fontFace: ws.map((w) => ({ fontFamily: name, fontStyle: "normal", fontWeight: String(w), fontDisplay: "swap", src: [`file:./assets/fonts/${dir}/${dir}-latin-${w}-normal.woff2`] })) }; };
const STATUS = { danger: "#b42318", "on-danger": "#ffffff", success: "#1a7f4b", warning: "#b54708" };
const COLOR_NAMES = [["background", "Background"], ["surface", "Surface"], ["border", "Border"], ["text", "Text"], ["muted", "Muted text"], ["primary", "Primary"], ["on-primary", "Text on primary"], ["accent", "Accent"]];
const paletteJson = (t) => [...COLOR_NAMES.map(([slug, name]) => ({ slug, name, color: t[slug] })), { slug: "danger", name: "Alert", color: STATUS.danger }, { slug: "on-danger", name: "Text on alert", color: STATUS["on-danger"] }, { slug: "success", name: "Success", color: STATUS.success }, { slug: "warning", name: "Warning", color: STATUS.warning }];
function custom(styleName) {
  const st = STYLES[styleName], r = parseInt(st.radius, 10), sh = DM.SHADOWS[st.shadows];
  return { radius: { sm: `${Math.round(r / 2)}px`, md: `${r}px`, lg: `${r * 2}px` }, shadow: { sm: sh[0], md: sh[1], lg: sh[2] }, heading: { weight: String(st.hw), tracking: st.ls, scale: String(st.hscale) } };
}
function fontsFor(styleName) {
  const st = STYLES[styleName];
  return [fontFamily(st.hf, "heading", "Georgia, serif"), st.bf === st.hf ? { ...fontFamily(st.bf, "body", "system-ui, sans-serif") } : fontFamily(st.bf, "body", "system-ui, sans-serif")];
}
function themeJson(family, styleName, tokens) {
  return { $schema: "https://schemas.wp.org/trunk/theme.json", version: 3,
    settings: { appearanceTools: true, useRootPaddingAwareAlignments: false, layout: { contentSize: "720px", wideSize: "1200px" },
      color: { defaultPalette: false, defaultGradients: false, defaultDuotone: false, palette: paletteJson(tokens) },
      typography: { defaultFontSizes: false, fluid: false, fontFamilies: fontsFor(styleName), fontSizes: [["small", "Small", "13px"], ["base", "Base", "15px"], ["large", "Large", "20px"], ["x-large", "Extra large", "28px"], ["xx-large", "Huge", "40px"]].map(([slug, name, size]) => ({ slug, name, size })) },
      spacing: { blockGap: null, units: ["px", "em", "rem", "%", "vw"] }, custom: custom(styleName) },
    styles: { color: { background: "var(--wp--preset--color--background)", text: "var(--wp--preset--color--text)" }, typography: { fontFamily: "var(--wp--preset--font-family--body)" },
      elements: { link: { color: { text: "inherit" }, typography: { textDecoration: "none" } }, heading: { typography: { fontFamily: "var(--wp--preset--font-family--heading)" } } } },
    templateParts: [{ name: "header", title: "Header", area: "header" }, { name: "footer", title: "Footer", area: "footer" }] };
}
function variationJson(family, styleName, dark) {
  const { light, dark: d } = palette(family, styleName), st = STYLES[styleName];
  return { $schema: "https://schemas.wp.org/trunk/theme.json", version: 3, title: `${styleName[0].toUpperCase()}${styleName.slice(1)}${dark ? " dark" : ""}`,
    settings: { color: { palette: paletteJson(dark ? d : light) }, typography: { fontFamilies: fontsFor(styleName) }, custom: custom(styleName) },
    styles: st.css ? { css: st.css.replace(/@media[^{]*\{[^}]*\{[^}]*\}\}/g, "").replace(/\.side[^{]*\{[^}]*\}/g, "") .replace(/`/g, "") } : {} };
}

const PHP_HEAD = (slug) => `<?php
/**
 * Theme functions. The theme is block-based, so this only loads the stylesheet and registers the pattern category.
 *
 * @package ${slug}
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_action(
	'wp_enqueue_scripts',
	function () {
		wp_enqueue_style( '${slug}', get_stylesheet_uri(), array(), wp_get_theme()->get( 'Version' ) );
	}
);

add_action(
	'after_setup_theme',
	function () {
		add_theme_support( 'editor-styles' );
		add_editor_style( 'style.css' );
	}
);

add_filter(
	'body_class',
	function ( $classes ) {
		$classes[] = 'sk';
		return $classes;
	}
);

add_action(
	'init',
	function () {
		register_block_pattern_category( '${slug}', array( 'label' => wp_get_theme()->get( 'Name' ) ) );
	}
);
`;

const walkFindAll = (n, f, out = []) => { for (const c of n.childNodes || []) { if (isEl(c)) { if (f(c)) out.push(c); walkFindAll(c, f, out); } } return out; };
const textOf = (n) => (isText(n) ? n.value : (n.childNodes || []).filter((c) => c.tagName !== "svg" && c.tagName !== "style").map(textOf).join(" "));
const SEC_FALLBACK = (i) => (i === 0 ? "Hero" : `Section ${i + 1}`);
const slugify = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);

// readme "Before you publish": per industry, from src/tpl_copy.json (industries.<id>.readme). A niche's industry comes from its content file
// (ui-screens/hc/content/<niche>.js "industry"); content files without one are healthcare, the first industry.
function beforePublish(niche) {
  let ind = "healthcare"; try { ind = require(path.join(HERE, "../hc/content", `${niche}.js`)).industry || "healthcare"; } catch (_) {}
  const lines = JSON.parse(fs.readFileSync(path.join(HERE, "../../src/tpl_copy.json"), "utf8")).industries?.[ind]?.readme;
  if (!Array.isArray(lines) || !lines.length) throw new Error(`no readme lines for industry ${ind} (niche ${niche}) in src/tpl_copy.json`);
  return lines;
}
export function exportTheme(o) {
  const doc = parse(fs.readFileSync(o.html, "utf8"));
  const html = doc.childNodes.find((c) => c.tagName === "html"), head = html.childNodes.find((c) => c.tagName === "head"), body = html.childNodes.find((c) => c.tagName === "body");
  const rawCss = walkFindAll(html, (n) => n.tagName === "style").map((s) => s.childNodes.map((c) => c.value).join("")).join("\n");
  const ex = new Exporter(o); ex.tokens = palette(o.family, o.style).light;
  // Root: <div class="sk"> holds the page. Top-level header and footer become template parts, each direct child of <main> a pattern.
  let root = body; const k0 = kids(body); if (k0.length === 1 && classes(k0[0]).includes("sk")) root = k0[0];
  const top = walkFindAll(root, (n) => n.tagName === "main")[0];
  const patterns = [];
  const headerEls = [], footerEls = [];
  const render = (node) => {
    // Rebuild the shell around <main>: anything before main (alert strips, the site header) goes to the header part, anything after to the footer part.
    return node;
  };
  const beforeMain = [], afterMain = []; let mainWrapper = null;
  const shell = kids(root);
  if (shell.includes(top)) { let seen = false; for (const k of shell) { if (k === top) { seen = true; continue; } (seen ? afterMain : beforeMain).push(k); } }
  else { // the page sits in a layout wrapper (sidebar shells): keep that wrapper in the template
    const w = shell.find((k) => k === top || hasDesc(k, (x) => x === top)); let seen = false;
    for (const k of shell) { if (k === w) { seen = true; continue; } (seen ? afterMain : beforeMain).push(k); } mainWrapper = w;
  }
  ex.inPattern = false;
  // In a sidebar shell the header part is a grid cell (template parts are display:contents), so a bar above the shell needs its own part
  const topMarkup = mainWrapper ? beforeMain.map((n) => ex.node(n)).join("\n") : "";
  const headerMarkup = [...(mainWrapper ? [] : beforeMain), ...(mainWrapper ? kids(mainWrapper).filter((k) => k !== top) : [])].map((n) => (n.tagName === "header" || hasDesc(n, (x) => x.tagName === "nav" || classes(x).includes("logo")) ? ex.headerPart(n) : ex.node(n))).join("\n");
  const footerMarkup = afterMain.map((n) => ex.node(n)).join("\n");
  ex.inPattern = true;
  const sections = kids(top); let idx = 0;
  for (const s of sections) {
    const h = walkFindAll(s, (n) => /^h[1-3]$/.test(n.tagName))[0];
    const title = (h ? textOf(h).replace(/\s+/g, " ").trim() : "") || SEC_FALLBACK(idx);
    let sl = slugify(title) || `section-${idx + 1}`; while (patterns.some((p) => p.slug === sl)) sl += "-2";
    const markup = ex.node(s);
    patterns.push({ slug: sl, title: idx === 0 ? `${title} (hero)` : title, markup }); idx++;
  }
  ex.usedClasses.add("sk");
  (function w(x) { classes(x).forEach((c) => ex.usedClasses.add(c)); })(top); if (mainWrapper) classes(mainWrapper).forEach((c) => ex.usedClasses.add(c));
  const css0 = buildCss(rawCss, ex);
  const inline = [...ex.inlineRules].map(([id, st]) => `.${id}.${id}{${st}}${ex.btnClasses.has(id) ? `.wp-block-button.${id}>.wp-block-button__link{${st}}` : ""}`).join("\n");
  const styleHeader = `/*
Theme Name: ${o.name}
Theme URI: ${o.themeUri || "https://madegooddesigns.com/inspiration/ui/wordpress-themes"}
Author: Made Good Designs
Author URI: https://madegooddesigns.com/
Description: ${o.desc}
Version: ${o.version || "1.0.0"}
Requires at least: 6.6
Tested up to: ${o.testedUpTo || "7.1"}
Requires PHP: 7.4
License: ${o.licence || "GPL-2.0-or-later"}
License URI: ${o.licenceUri || "https://www.gnu.org/licenses/gpl-2.0.html"}
Text Domain: ${o.slug}
Tags: full-site-editing, block-patterns, block-styles, one-column, wide-blocks, custom-colors, custom-logo, editor-style
*/
`;
  const dir = path.join(o.out, o.slug); fs.rmSync(dir, { recursive: true, force: true });
  for (const d of ["templates", "parts", "patterns", "styles", "assets/img", "assets/fonts"]) fs.mkdirSync(path.join(dir, d), { recursive: true });
  const w = (f, s) => fs.writeFileSync(path.join(dir, f), s);
  w("style.css", styleHeader + RESET + BODY_TOKENS() + css0 + "\n" + inline + "\n" + GLUE);
  const tj = themeJson(o.family, o.style, ex.tokens); if (topMarkup) tj.templateParts.unshift({ name: "top", title: "Top bar", area: "uncategorized" });
  w("theme.json", JSON.stringify(tj, null, "\t"));
  w("functions.php", PHP_HEAD(o.slug));
  if (topMarkup) w("parts/top.html", topMarkup + "\n");
  w("parts/header.html", headerMarkup + "\n"); w("parts/footer.html", footerMarkup + "\n");
  for (const p of patterns) w(`patterns/${p.slug}.php`, `<?php\n/**\n * Title: ${p.title.replace(/\*\//g, "").replace(/[\r\n]+/g, " ")}\n * Slug: ${o.slug}/${p.slug}\n * Categories: ${o.slug}\n * Viewport Width: 1280\n */\n?>\n${p.markup}\n`);
  const tp = (slug) => single("template-part", { slug, theme: o.slug, area: slug, tagName: "div" });
  const mainCls = ["wp-block-group", ...classes(top)]; const mainAttr = { tagName: "main", ...(classes(top).length ? { className: classes(top).join(" ") } : {}) };
  const mainBlock = `${open("group", mainAttr)}\n<main class="${mainCls.join(" ")}">\n${patterns.map((p) => single("pattern", { slug: `${o.slug}/${p.slug}` })).join("\n")}\n</main>\n${close("group")}`;
  const wrapShell = (inner) => mainWrapper ? `${topMarkup ? tp("top") + "\n" : ""}${open("group", { className: classes(mainWrapper).join(" ") })}\n<div class="wp-block-group ${classes(mainWrapper).join(" ")}">\n${tp("header")}\n${inner}\n</div>\n${close("group")}\n${tp("footer")}\n` : `${tp("header")}\n${inner}\n${tp("footer")}\n`;
  w("templates/front-page.html", wrapShell(mainBlock));
  const inner = (b) => wrapShell(`${open("group", { tagName: "main", className: "mgd-page" })}\n<main class="wp-block-group mgd-page">\n${b}\n</main>\n${close("group")}`);
  const postLoop = `${open("query", { queryId: 1, query: { perPage: 10, pages: 0, offset: 0, postType: "post", inherit: true } })}\n<div class="wp-block-query">${open("post-template")}\n${single("post-title", { isLink: true, level: 2 })}\n${single("post-date")}\n${single("post-excerpt")}\n${close("post-template")}\n${open("query-pagination")}\n${single("query-pagination-previous")}\n${single("query-pagination-next")}\n${close("query-pagination")}\n${open("query-no-results")}\n${open("paragraph")}\n<p>Nothing here yet.</p>\n${close("paragraph")}\n${close("query-no-results")}</div>\n${close("query")}`;
  w("templates/index.html", inner(`${single("query-title", { type: "archive", showPrefix: false })}\n${postLoop}`));
  w("templates/archive.html", inner(`${single("query-title", { type: "archive" })}\n${postLoop}`));
  w("templates/search.html", inner(`${single("query-title", { type: "search" })}\n${single("search", { label: "Search", buttonText: "Search", showLabel: false })}\n${postLoop}`));
  w("templates/single.html", inner(`${single("post-title", { level: 1 })}\n${single("post-date")}\n${single("post-content", { layout: { type: "default" } })}\n${single("post-terms", { term: "category" })}`));
  w("templates/page.html", inner(`${single("post-title", { level: 1 })}\n${single("post-content", { layout: { type: "default" } })}`));
  w("templates/404.html", inner(`${open("heading", { level: 1 })}\n<h1 class="wp-block-heading">Page not found</h1>\n${close("heading")}\n${open("paragraph")}\n<p>This page does not exist. Try a search.</p>\n${close("paragraph")}\n${single("search", { label: "Search", buttonText: "Search", showLabel: false })}`));
  for (const s of Object.keys(STYLES)) { if (s !== o.style) w(`styles/${s}.json`, JSON.stringify(variationJson(o.family, s, false), null, "\t")); }
  w("styles/dark.json", JSON.stringify({ ...variationJson(o.family, o.style, true), title: "Dark" }, null, "\t"));
  for (const [id, src] of ex.assets) w(`assets/img/${id}`, src);
  for (const [, [dirName, ws]] of Object.entries(FONT_FILES)) { const d2 = path.join(dir, "assets/fonts", dirName); fs.mkdirSync(d2, { recursive: true }); const from = path.join(o.fontsDir || path.join(HERE, "fonts"), dirName); fs.copyFileSync(path.join(from, "LICENSE"), path.join(d2, "LICENSE.txt")); for (const wt of ws) fs.copyFileSync(path.join(from, `${dirName}-latin-${wt}-normal.woff2`), path.join(d2, `${dirName}-latin-${wt}-normal.woff2`)); }
  if (o.screenshot && fs.existsSync(o.screenshot)) fs.copyFileSync(o.screenshot, path.join(dir, "screenshot.png"));
  w("readme.txt", readme(o, ex, patterns));
  const report = { slug: o.slug, name: o.name, family: o.family, style: o.style, patterns: patterns.map((p) => p.slug), blocks: ex.stats.blocks, htmlBlocks: ex.stats.html, htmlWhy: ex.stats.htmlWhy, droppedAttrs: ex.stats.droppedAttrs, images: ex.assets.size };
  fs.writeFileSync(path.join(o.out, `${o.slug}.report.json`), JSON.stringify(report, null, 1));
  if (o.zip) { const z = path.resolve(o.out, `${o.slug}.zip`); fs.rmSync(z, { force: true }); execFileSync("zip", ["-qrX", z, o.slug, "-x", "*.DS_Store"], { cwd: o.out }); report.zipBytes = fs.statSync(z).size; }
  return report;
}

function readme(o, ex, patterns) {
  const lic = o.licenceText || "Theme code and patterns: GPL-2.0-or-later. Bundled fonts: SIL Open Font License 1.1. Illustrations: original, included under the same GPL terms.";
  const fonts = Object.keys(FONT_FILES).join(", ");
  return `=== ${o.name} ===
Contributors: madegooddesigns
Requires at least: 6.6
Tested up to: ${o.testedUpTo || "7.1"}
Requires PHP: 7.4
License: ${o.licence || "GPL-2.0-or-later"}
License URI: ${o.licenceUri || "https://www.gnu.org/licenses/gpl-2.0.html"}

${o.desc}

== Install ==
1. In WordPress, go to Appearance, Themes, Add New Theme, Upload Theme.
2. Upload this zip and click Install Now, then Activate.
3. Go to Settings, General and set your Site Title. The header shows it.
4. Go to Appearance, Editor to change text, colours and fonts. Open Styles to switch between the included style variations.

== What is included ==
- ${patterns.length} page sections as block patterns (Appearance, Editor, Patterns, or the block inserter).
- Templates: front page, blog index, single post, page, archive, search, 404.
- Template parts: header and footer.
- Style variations: ${Object.keys(STYLES).filter((s) => s !== o.style).join(", ")} and dark.

== Before you publish ==
${beforePublish(o.niche).join("\n")}

== Licence ==
${lic}
Original theme code, patterns and illustrations: Made Good Designs.

== Resources ==
Fonts, bundled in assets/fonts, latin subset, from the Fontsource packages. All are under the SIL Open Font License 1.1, and each folder holds its licence file: ${fonts}.
Images: the illustrations in assets/img are original SVG drawings made for this theme. There are no third-party images.
Scripts: none. Menus use WordPress core.
`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const a = {}; const av = process.argv.slice(2);
  for (let i = 0; i < av.length; i++) { if (av[i].startsWith("--")) { const k = av[i].slice(2); if (i + 1 < av.length && !av[i + 1].startsWith("--")) a[k] = av[++i]; else a[k] = true; } }
  console.log(JSON.stringify(exportTheme(a), null, 1));
}
