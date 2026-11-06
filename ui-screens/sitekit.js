/* Site kit for full-length website templates (type "page", 5-Nov-2026 template round).
   One responsive document per pattern: the same HTML is rendered at 1440 px (web shot) and 390 px (mobile shot),
   so web() and mobile() should return the same markup (use page(p, st, rnd, body) below). Layout lives in classes
   with media queries (inline styles cannot respond to the viewport); keep inline styles for one-off colour/spacing.
   Colours: only the lib.js CSS variables. Headings scale with the style via --hs (st.hscale). No external images:
   "photos" are inline SVG scenes in fixed natural tones (allowed for illustrative imagery).
   Usage in tpl/<file>.js:
     const { ic, esc } = require("../lib");
     const K = require("../sitekit");
     const web = (p, st, rnd) => K.page(st, `${K.nav(p, ["Menu", "Visit", "Private dining"], "Book a table")}…${K.footer(p, cols)}`, CSS);
     module.exports = { "restaurant-website": K.def("restaurant", "Restaurant website", "…", [...elements], web) }; */
const { ic, esc } = require("./lib");

const CSS = (st) => `<style>
:root{--hs:${st.hscale}}
html,body{height:auto;min-height:100%}
body{font-size:15px;line-height:1.6}
img,svg{max-width:100%}
a{color:inherit;text-decoration:none}
.sk-wrap{width:100%;max-width:1200px;margin:0 auto;padding:0 48px}
.sk-sec{padding:96px 0}
.sk-sec.sk-tight{padding:64px 0}
.sk-alt{background:var(--surface);border-block:1px solid var(--border)}
.sk-eyebrow{display:inline-block;font:600 12px/1.4 var(--font-b);letter-spacing:.09em;text-transform:uppercase;color:color-mix(in oklab,var(--primary) 82%,var(--text))}
.sk-h1{font-size:calc(60px * var(--hs));line-height:1.03}
.sk-h2{font-size:calc(40px * var(--hs));line-height:1.08}
.sk-h3{font-size:calc(20px * var(--hs));line-height:1.25}
.sk-lede{font-size:18px;color:var(--muted);max-width:580px}
.sk-stack{display:grid;gap:18px;justify-items:start;align-content:start}
.sk-row{display:flex;flex-wrap:wrap;align-items:center;gap:12px}
.sk-g2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:32px}
.sk-g3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:28px}
.sk-g4{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:24px}
.sk-split{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,1fr);gap:64px;align-items:center}
.sk-head{display:flex;justify-content:space-between;align-items:flex-end;gap:24px;margin-bottom:44px}
.sk-head>div:first-child{display:grid;gap:12px;max-width:640px}
.sk-btn-lg{height:48px;padding:0 22px;font-size:15px}
.sk-card{padding:28px}
.sk-photo{position:relative;overflow:hidden;border-radius:var(--radius-lg);background:color-mix(in oklab,var(--primary) 14%,var(--surface))}
.sk-photo>svg{display:block;width:100%;height:100%}
.sk-cap{position:absolute;left:14px;bottom:14px;font:600 12px var(--font-b);padding:5px 10px;border-radius:var(--radius);background:color-mix(in oklab,var(--bg) 88%,transparent);color:var(--text)}
/* nav: links + CTA on wide screens, a no-JS <details> menu on phones */
.sk-nav{border-bottom:1px solid var(--border);background:var(--bg)}
.sk-nav>.sk-wrap{display:flex;align-items:center;gap:32px;height:76px}
.sk-links{display:flex;gap:28px;font-weight:500;color:var(--muted)}
.sk-links a:hover{color:var(--text)}
.sk-navend{margin-left:auto;display:flex;align-items:center;gap:12px}
.sk-menu{display:none;margin-left:auto}
.sk-menu summary{list-style:none;cursor:pointer;width:42px;height:42px;display:grid;place-items:center;border:1px solid var(--border);border-radius:var(--radius)}
.sk-menu summary::-webkit-details-marker{display:none}
.sk-menu[open]>nav{position:absolute;left:0;right:0;top:76px;z-index:5;background:var(--bg);border-bottom:1px solid var(--border);padding:12px 20px 20px;display:grid;gap:4px}
.sk-menu nav a{padding:10px 0;font-weight:500;border-bottom:1px solid var(--border)}
.sk-nav{position:relative}
/* footer */
.sk-foot{border-top:1px solid var(--border);padding:64px 0 40px;font-size:14px}
.sk-foot-grid{display:grid;grid-template-columns:minmax(0,1.6fr) repeat(3,minmax(0,1fr));gap:40px}
.sk-foot h4{font:600 13px var(--font-b);margin-bottom:12px}
.sk-foot ul{list-style:none;display:grid;gap:8px;color:var(--muted)}.sk-foot li{overflow-wrap:anywhere}
.sk-foot-base{display:flex;flex-wrap:wrap;justify-content:space-between;gap:12px;margin-top:48px;padding-top:24px;border-top:1px solid var(--border);color:var(--muted);font-size:13px}
.sk-field{display:grid;gap:6px}.sk-field label{font-weight:500;font-size:13px}
.sk-input{width:100%;height:46px;border:1px solid var(--border);border-radius:var(--radius);background:var(--surface);padding:0 14px;color:var(--text);font:inherit;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
textarea.sk-input{height:auto;min-height:110px;padding:12px 14px;white-space:normal}
@media (max-width:1024px){
  .sk-g4{grid-template-columns:repeat(2,minmax(0,1fr))}
  .sk-g3{grid-template-columns:repeat(2,minmax(0,1fr))}
  .sk-split{gap:40px}
  .sk-links{gap:20px}
}
/* tablets: the link row plus two nav buttons overflowed at 768 px, so the phone menu takes over below 960 px */
@media (max-width:960px){
  .sk-links,.sk-navend{display:none}
  .sk-menu{display:block}
}
@media (max-width:760px){
  body{font-size:15px}
  .sk-wrap{padding:0 20px}
  .sk-sec{padding:64px 0}.sk-sec.sk-tight{padding:44px 0}
  .sk-h1{font-size:calc(40px * var(--hs))}
  .sk-h2{font-size:calc(30px * var(--hs))}
  .sk-lede{font-size:16px}
  .sk-g2,.sk-g3,.sk-g4,.sk-split{grid-template-columns:minmax(0,1fr);gap:20px}
  .sk-head{flex-direction:column;align-items:flex-start;margin-bottom:28px}
  .sk-nav>.sk-wrap{height:64px;gap:12px}
  .sk-links,.sk-navend{display:none}
  .sk-menu{display:block}
  .sk-menu[open]>nav{top:64px}
  .sk-foot-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:28px}
  .sk-foot-grid>:first-child{grid-column:1/-1}
  .sk-card{padding:22px}
  /* .sk-rail: a grid on wide screens, a swipeable scroll-snap row on phones (keeps long pages short) */
  .sk-rail{display:flex!important;overflow-x:auto;scroll-snap-type:x mandatory;scroll-padding-inline:20px;gap:14px!important;align-items:flex-start;margin:0 -20px;padding:0 20px 6px;scrollbar-width:none}
  .sk-rail>*{flex:0 0 82%;scroll-snap-align:start}
  .sk-btn-lg{height:46px}
}
</style>`;

// Whole page: kit CSS + the module's own CSS (a <style> string) + body.
const page = (st, body, css = "") => `${CSS(st)}${css}<div class="sk">${body}</div>`;

const slug = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
// links: ["Menu", "Visit", …]; cta: primary button label; extra: optional secondary button label.
const nav = (p, links, cta, extra) => `<header class="sk-nav"><div class="sk-wrap"><a class="logo" href="#"><b></b>${esc(p.name)}</a>
<nav class="sk-links" aria-label="Main">${links.map((l) => `<a href="#${slug(l)}">${esc(l)}</a>`).join("")}</nav>
<div class="sk-navend">${extra ? `<a class="btn" href="#">${esc(extra)}</a>` : ""}<a class="btn primary" href="#${slug(cta)}">${esc(cta)}</a></div>
<details class="sk-menu"><summary aria-label="Open menu">${ic("menu", 20)}</summary><nav aria-label="Mobile">${links.map((l) => `<a href="#${slug(l)}">${esc(l)}</a>`).join("")}<a class="btn primary block" style="margin-top:12px" href="#${slug(cta)}">${esc(cta)}</a></nav></details>
</div></header>`;

// cols: [["Visit", ["14 Mill Lane", "…"]], …] (three columns); blurb: short line under the logo; legal: bottom-left line.
const footer = (p, blurb, cols, legal) => `<footer class="sk-foot"><div class="sk-wrap"><div class="sk-foot-grid">
<div style="display:grid;gap:12px;align-content:start;max-width:340px"><div class="logo"><b></b>${esc(p.name)}</div><p class="muted">${esc(blurb)}</p></div>
${cols.map(([h, items]) => `<div><h4>${esc(h)}</h4><ul>${items.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>`).join("")}
</div><div class="sk-foot-base"><span>${esc(legal || `© 2026 ${p.name}. All rights reserved.`)}</span><span>Privacy · Terms · Accessibility</span></div></div></footer>`;

// Pattern definition. One variant ("homepage") so later page types (about, pricing, contact…) slot in as variants.
const def = (family, name, shows, elements, fn, extra = {}) => ({
  family, type: "page", name, shows, elements: [...elements, "website-template", "landing-page", "responsive"],
  size: { web: [1440, 5600], mobile: [390, 8000] },
  variants: { homepage: { name: `${name} home page`, shows } },
  web: fn, mobile: fn, ...extra,
});

module.exports = { page, nav, footer, def, slug, KIT_CSS: CSS };
