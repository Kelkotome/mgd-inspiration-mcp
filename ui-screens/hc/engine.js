/* Layout engine for industry template sets (7-Nov-2026, healthcare pilot).
   A niche is one content file (hc/content/<niche>.js, schema in hc/README.md); a design is that content poured into one of six page
   layouts. The layouts differ in structure, not only in colour: page shell, navigation, hero, section order and the components used
   for the same information (cards, tables, ruled lists, tiles, bands, accordions). Each layout has a home style preset.
   Same rules as tpl/site-*.js: CSS variables only, no external images, no JS. Layout CSS is module-prefixed and uses container-free media queries. */
const { ic, esc } = require("../lib");
const K = require("../sitekit");

const GLYPH = {
  heart: '<path d="M32 54C14 41 6 32 6 22a13 13 0 0 1 26-3 13 13 0 0 1 26 3c0 10-8 19-26 32z"/><path d="M12 30h12l4-8 7 16 4-8h13"/>',
  tooth: '<path d="M32 12c-5-4-16-6-21 1-4 6-1 15 2 22 2 6 2 17 8 18 6 0 5-13 11-13s5 13 11 13c6-1 6-12 8-18 3-7 6-16 2-22-5-7-16-5-21-1z"/>',
  skin: '<path d="M6 24c9-5 17 4 26 0s17-5 26 0M6 36c9-5 17 4 26 0s17-5 26 0"/><path d="M32 8c5 6 7 9 7 12a7 7 0 0 1-14 0c0-3 2-6 7-12z"/><path d="M14 44v10M32 44v10M50 44v10"/>',
  talk: '<path d="M8 12h34v22H22l-9 9v-9H8z"/><path d="M46 22h10v20h-5v8l-8-8H28v-4"/>',
  spine: '<circle cx="32" cy="10" r="6"/><path d="M32 16v20M16 26l16-4 16 4M32 36l-12 20M32 36l12 20"/>',
  paw: '<ellipse cx="32" cy="42" rx="14" ry="12"/><circle cx="12" cy="30" r="6"/><circle cx="24" cy="16" r="6"/><circle cx="40" cy="16" r="6"/><circle cx="52" cy="30" r="6"/>',
  child: '<circle cx="32" cy="24" r="16"/><circle cx="14" cy="14" r="6"/><circle cx="50" cy="14" r="6"/><path d="M26 28c3 4 9 4 12 0M26 20h.01M38 20h.01M20 54c2-10 7-14 12-14s10 4 12 14"/>',
  smile: '<path d="M6 26c8 22 44 22 52 0-16 6-36 6-52 0z"/><path d="M16 30v7M26 32v9M38 32v9M48 30v7M12 34h40"/>',
  seed: '<path d="M32 58V30"/><path d="M32 34C32 20 22 12 8 12c0 14 10 22 24 22z"/><path d="M32 28c0-12 9-18 24-18 0 14-10 20-24 20z"/><path d="M20 58h24"/>',
  cross: '<path d="M24 8h16v16h16v16H40v16H24V40H8V24h16z"/>',
  hospital: '<path d="M8 56V22h16V8h16v14h16v34z"/><path d="M28 18h8M32 14v8M20 32h6M38 32h6M20 42h6M38 42h6M28 56V44h8v12"/>',
  pill: '<rect x="4" y="22" width="56" height="20" rx="10" transform="rotate(-35 32 32)"/><path d="M23 19l18 26"/>',
  eye: '<path d="M4 32c8-14 18-20 28-20s20 6 28 20c-8 14-18 20-28 20S12 46 4 32z"/><circle cx="32" cy="32" r="10"/><circle cx="32" cy="32" r="3"/>',
  mind: '<path d="M38 54v-9h8l3-11 5-3-5-8C47 13 39 8 30 8 18 8 9 17 9 28c0 7 3 12 8 16v10z"/><path d="M24 26c0-5 8-5 8 0 0 4-4 4-4 8M28 40h.01"/>',
  // real estate (7-Nov-2026, second industry)
  house: '<path d="M8 30L32 10l24 20"/><path d="M14 26v28h36V26"/><path d="M27 54V40h10v14M19 32h6v6h-6zM39 32h6v6h-6z"/>',
  flats: '<path d="M12 56V10h26v46M38 24h14v32"/><path d="M18 18h4M28 18h4M18 28h4M28 28h4M18 38h4M28 38h4M43 32h4M43 42h4M22 56v-8h6v8M6 56h52"/>',
  agent: '<path d="M6 30L24 16l18 14"/><path d="M11 27v25h26V27"/><path d="M20 52V41h8v11"/><circle cx="48" cy="22" r="6"/><path d="M38 52c1-9 5-14 10-14s9 5 10 14"/>',
  key: '<circle cx="20" cy="32" r="12"/><circle cx="20" cy="32" r="4"/><path d="M32 32h26M48 32v8M54 32v6"/>',
  frame: '<path d="M8 56h48M14 56V28L32 14l18 14v28"/><path d="M14 28h36M23 21v35M41 21v35M14 42h36M23 28l18 14M41 28L23 42"/>',
  villa: '<path d="M4 56h56M8 56V30h30v26M38 38h18v18"/><path d="M4 30h38M14 38h8v10h-8zM26 38h8v18M42 44h10v6H42z"/><path d="M8 22c8-6 16-6 24 0"/>',
  tower: '<path d="M20 56V8h24v48M10 56V26h10M44 34h10v22M4 56h56"/><path d="M26 16h12M26 24h12M26 32h12M26 40h12M28 56v-8h8v8"/>',
  cabin: '<path d="M6 54L32 10l26 44z"/><path d="M26 54V40h12v14M32 22v8M4 54h56"/><path d="M48 18v-8h5v16"/>',
};
const glyph = (c, size, sw = 2.2) => `<svg class="i" width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${GLYPH[c.motif]}</svg>`;
// Abstract illustration, drawn from the niche's glyph. Original artwork; a site owner swaps it for a real photo.
const scene = (c, w, h, label) => { const s = Math.min(w, h) * 0.62, k = s / 64, x = (w - s) / 2, y = (h - s) / 2;
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${esc(label || `Illustration for ${c.kind}`)}"><rect width="${w}" height="${h}" style="fill:color-mix(in oklab,var(--primary) 16%,var(--surface))"/><circle cx="${w * 0.82}" cy="${h * 0.2}" r="${h * 0.34}" style="fill:color-mix(in oklab,var(--accent) 24%,var(--surface))"/><circle cx="${w * 0.14}" cy="${h * 0.86}" r="${h * 0.42}" style="fill:color-mix(in oklab,var(--primary) 30%,var(--surface))"/><g transform="translate(${x} ${y}) scale(${k})" fill="none" style="stroke:color-mix(in oklab,var(--primary) 78%,var(--text))" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${GLYPH[c.motif]}</g></svg>`; };
const initials = (n) => n.replace(/^Dr\.?\s+/, "").split(/\s+/).map((x) => x[0]).slice(0, 2).join("");
const anchors = (c) => [[c.nav.services, "services"], [c.nav.process, "process"], [c.nav.team, "team"], [c.nav.faq, "faq"], [c.nav.visit, "visit"]];
const navLinks = (c, cls = "sk-links", extra = "") => `<nav class="${cls}${extra}" aria-label="Main">${anchors(c).map(([l, id]) => `<a href="#${id}">${esc(l)}</a>`).join("")}</nav>`;
const menu = (c) => `<details class="sk-menu"><summary aria-label="Open menu">${ic("menu", 20)}</summary><nav aria-label="Mobile">${anchors(c).map(([l, id]) => `<a href="#${id}">${esc(l)}</a>`).join("")}<a class="btn primary block" style="margin-top:12px" href="#visit">${esc(c.hero.cta)}</a></nav></details>`;
const phone = (c) => c.visit.locations[0].phone;
const faqItems = (c, cls = "") => c.faq.items.map((f) => `<details class="${cls}"><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("");
const contactForm = (c, cls = "") => `<form class="card ${cls}" aria-label="${esc(c.visit.formLabel || "Contact the practice")}"><h3 class="sk-h3">${esc(c.visit.formTitle)}</h3>
<div class="sk-field"><label for="f-name">Your name</label><input class="sk-input" id="f-name" name="name" type="text" autocomplete="name"></div>
<div class="sk-field"><label for="f-tel">Phone</label><input class="sk-input" id="f-tel" name="tel" type="tel" autocomplete="tel"></div>
<div class="sk-field"><label for="f-why">How can we help?</label><textarea class="sk-input" id="f-why" name="message" rows="3"></textarea></div>
<button class="btn primary block" type="submit">${esc(c.visit.formButton)}</button><p class="muted hc-formnote">${esc(c.visit.formNote)}</p></form>`;
const footerCols = (c) => [["Services", c.services.items.slice(0, 4).map((s) => s.t)], ["Visit", [c.visit.locations[0].n, c.visit.locations[0].addr, c.visit.locations[0].hours]], ["Contact", [phone(c), c.visit.email]]];
const foot = (p, c) => K.footer(p, c.footer.blurb, footerCols(c), c.footer.legal);
const notice = (c) => `<aside class="hc-notice"><div class="sk-wrap"><p>${esc(c.notice)}</p></div></aside>`;
const alert = (c, cls = "") => (c.alert ? `<div class="hc-alert ${cls}"><div class="sk-wrap"><p>${ic("bell", 15)}<span>${esc(c.alert)}</span></p></div></div>` : "");

const BASE = `<style>
.hc-alert{background:var(--danger);color:var(--on-danger);font-size:14px;font-weight:500}
.hc-alert .sk-wrap{padding-top:9px;padding-bottom:9px}
.hc-alert p{display:flex;gap:10px;align-items:center}
.hc-notice{border-top:1px solid var(--border);background:var(--surface);color:var(--muted);font-size:13px}
.hc-notice .sk-wrap{padding-top:16px;padding-bottom:16px}
.hc-formnote{font-size:12.5px}
details>summary{cursor:pointer;font-weight:600}
form.card{padding:28px;display:grid;gap:14px}
html{scroll-behavior:smooth}
section[id]{scroll-margin-top:24px}
@media (max-width:760px){form.card{padding:22px}}
</style>`;

// ---- atlas: split hero with a floating next-step card, card grids, classic practice home ------------------------------------------
const atlasCss = `<style>
.at-hero{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,1fr);gap:56px;align-items:center;padding-block:64px 72px}
.at-h1{font-size:calc(58px * var(--hs));line-height:1.04}
.at-vis{position:relative}
.at-vis .sk-photo{aspect-ratio:5/4}
.at-next{position:absolute;left:-28px;bottom:-24px;width:min(300px,90%);padding:18px 20px;display:grid;gap:4px;box-shadow:var(--shadow)}
.at-next b{font-size:15px}
.at-facts{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));border-block:1px solid var(--border)}
.at-facts>div{padding:22px 28px;border-right:1px solid var(--border)}
.at-facts>div:last-child{border-right:0}
.at-facts b{display:block;font-size:16px}
.at-svc{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:22px}
.at-svc article{padding:26px;display:grid;gap:10px;align-content:start}
.at-ico{width:42px;height:42px;display:grid;place-items:center;border-radius:var(--radius);background:color-mix(in oklab,var(--primary) 12%,var(--surface));color:color-mix(in oklab,var(--primary) 80%,var(--text))}
.at-steps{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:26px;counter-reset:s}
.at-steps article{display:grid;gap:8px;border-top:2px solid var(--primary);padding-top:16px;counter-increment:s}
.at-steps article::before{content:counter(s,decimal-leading-zero);font:600 13px var(--font-b);color:var(--muted)}
.at-duo{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(0,1fr);gap:44px;align-items:start}
.at-team{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px}
.at-team article{display:grid;grid-template-columns:52px minmax(0,1fr);gap:14px}
.at-team .avatar{width:52px;height:52px;font-size:15px}
.at-aud{padding:28px;display:grid;gap:12px;background:var(--text);color:var(--bg);border-color:var(--text)}
.at-aud ul{list-style:none;display:grid;gap:8px}
.at-aud .sk-eyebrow{color:inherit;opacity:.8}
.at-faq{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px 40px}
.at-faq details{border-bottom:1px solid var(--border);padding:14px 0}
.at-faq p{color:var(--muted);margin-top:8px}
.at-visit{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,420px);gap:48px;align-items:start}
.at-locs{display:grid;gap:18px;margin-top:22px}
.at-locs article{padding:20px;display:grid;gap:4px}
@media (max-width:1024px){.at-svc{grid-template-columns:repeat(2,minmax(0,1fr))}.at-steps{grid-template-columns:repeat(2,minmax(0,1fr))}.at-duo,.at-visit{grid-template-columns:minmax(0,1fr)}}
@media (max-width:760px){.at-hero{grid-template-columns:minmax(0,1fr);gap:28px;padding-block:32px 44px}.at-h1{font-size:calc(40px * var(--hs))}.at-next{position:static;width:auto;margin-top:12px}.at-facts,.at-svc,.at-steps,.at-team,.at-faq{grid-template-columns:minmax(0,1fr)}.at-facts>div{border-right:0;border-bottom:1px solid var(--border);padding:14px 0}.at-facts>div:last-child{border-bottom:0}}
</style>`;
const atlas = (p, st, c) => K.page(st, `${alert(c)}${K.nav(p, [], c.hero.cta, null).replace('<nav class="sk-links" aria-label="Main"></nav>', navLinks(c)).replace('href="#' + K.slug(c.hero.cta) + '"', 'href="#visit"')}
<main class="at">
<section class="sk-wrap at-hero"><div class="sk-stack"><span class="sk-eyebrow">${esc(c.hero.eyebrow)}</span><h1 class="at-h1">${esc(c.hero.h1)}</h1><p class="sk-lede">${esc(c.hero.lede)}</p><div class="sk-row"><a class="btn primary sk-btn-lg" href="#visit">${esc(c.hero.cta)}</a><a class="btn sk-btn-lg" href="#services">${esc(c.hero.alt)}</a></div></div>
<div class="at-vis"><div class="sk-photo">${scene(c, 640, 512)}</div><div class="card at-next"><span class="sk-eyebrow">${esc(c.visit.locations[0].n)}</span><b>${esc(c.visit.locations[0].hours)}</b><span class="muted">${esc(phone(c))}</span></div></div></section>
<section class="sk-wrap"><div class="at-facts">${c.facts.map((f) => `<div><b>${esc(f.t)}</b><span class="muted">${esc(f.d)}</span></div>`).join("")}</div></section>
<section class="sk-sec" id="services"><div class="sk-wrap"><div class="sk-head"><div><span class="sk-eyebrow">${esc(c.services.eyebrow)}</span><h2 class="sk-h2">${esc(c.services.h2)}</h2></div><p class="muted">${esc(c.services.lede)}</p></div><div class="at-svc">${c.services.items.map((s) => `<article class="card"><span class="at-ico">${ic(s.icon, 21)}</span><h3 class="sk-h3">${esc(s.t)}</h3><p class="muted">${esc(s.d)}</p></article>`).join("")}</div></div></section>
<section class="sk-sec sk-alt" id="process"><div class="sk-wrap"><div class="sk-head"><div><h2 class="sk-h2">${esc(c.process.h2)}</h2></div><p class="muted">${esc(c.process.lede)}</p></div><div class="at-steps">${c.process.steps.map((s) => `<article><h3 class="sk-h3">${esc(s.t)}</h3><p class="muted">${esc(s.d)}</p></article>`).join("")}</div></div></section>
<section class="sk-sec" id="team"><div class="sk-wrap at-duo"><div><div class="sk-head"><div><h2 class="sk-h2">${esc(c.team.h2)}</h2></div></div><div class="at-team">${c.team.people.map((m) => `<article><span class="avatar">${esc(initials(m.n))}</span><div><h3 class="sk-h3">${esc(m.n)}</h3><p class="muted">${esc(m.r)}</p><p>${esc(m.b)}</p></div></article>`).join("")}</div></div>
<aside class="card at-aud"><span class="sk-eyebrow">${esc(c.audience.eyebrow)}</span><h3 class="sk-h2">${esc(c.audience.h2)}</h3><p>${esc(c.audience.lede)}</p><ul>${c.audience.points.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></aside></div></section>
<section class="sk-sec sk-alt" id="faq"><div class="sk-wrap"><div class="sk-head"><div><h2 class="sk-h2">${esc(c.faq.h2)}</h2></div></div><div class="at-faq">${faqItems(c)}</div></div></section>
<section class="sk-sec" id="visit"><div class="sk-wrap at-visit"><div><h2 class="sk-h2">${esc(c.visit.h2)}</h2><p class="sk-lede">${esc(c.visit.lede)}</p><div class="at-locs">${c.visit.locations.map((l) => `<article class="card"><h3 class="sk-h3">${esc(l.n)}</h3><p>${esc(l.addr)}</p><p class="muted">${esc(l.hours)}</p><p>${esc(l.phone)}</p></article>`).join("")}</div></div>${contactForm(c)}</div></section>
</main>${notice(c)}${foot(p, c)}`, BASE + atlasCss);

// ---- folio: magazine layout. Centred masthead, type-led hero, numbered contents, ruled lists, no cards -------------------------------
const folioCss = `<style>
.fo-mast{border-bottom:3px double var(--text);padding:26px 0 0}
.fo-mast>.sk-wrap{display:grid;justify-items:center;gap:14px;height:auto}
.fo-mast .logo{font:var(--hw) calc(30px * var(--hs))/1.1 var(--font-h);letter-spacing:var(--ls)}
.fo-mast .logo b{display:none}
.fo-mast .sk-links{justify-content:center;flex-wrap:wrap;border-top:1px solid var(--border);padding:12px 0;width:100%;font-size:14px}
.fo-hero{text-align:center;padding-block:72px 44px;display:grid;justify-items:center;gap:20px}
.fo-h1{font-size:calc(82px * var(--hs));line-height:.98;max-width:980px}
.fo-hero .sk-lede{max-width:640px;text-align:center}
.fo-band{aspect-ratio:21/8;border-radius:0}
.fo-cap{font-size:13px;color:var(--muted);padding-top:10px}
.fo-toc{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,2.2fr);gap:56px;align-items:start}
.fo-toc ol{list-style:none;counter-reset:n}
.fo-toc li{counter-increment:n;display:grid;grid-template-columns:64px minmax(0,1fr) minmax(0,1.3fr);gap:18px;padding:20px 0;border-top:1px solid var(--border);align-items:baseline}
.fo-toc li::before{content:counter(n,decimal-leading-zero);font:var(--hw) calc(24px * var(--hs))/1 var(--font-h);color:var(--muted)}
.fo-toc li:last-child{border-bottom:1px solid var(--border)}
.fo-index{columns:3;column-gap:40px;list-style:none;font:var(--hw) calc(22px * var(--hs))/1.5 var(--font-h)}
.fo-pull{text-align:center;padding:84px 0;border-block:1px solid var(--border)}
.fo-pull p{font:var(--hw) calc(44px * var(--hs))/1.14 var(--font-h);max-width:880px;margin:0 auto}
.fo-steps{display:grid;gap:0}
.fo-steps article{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:48px;padding:30px 0;border-top:1px solid var(--border)}
.fo-steps article:nth-child(even) h3{order:2}
.fo-steps h3{font-size:calc(30px * var(--hs));line-height:1.1}
.fo-team{columns:2;column-gap:56px}
.fo-team article{break-inside:avoid;padding:18px 0;border-top:1px solid var(--border)}
.fo-qa{columns:2;column-gap:56px}
.fo-qa details{break-inside:avoid;padding:14px 0;border-top:1px solid var(--border)}
.fo-qa p{margin-top:8px;color:var(--muted)}
.fo-visit{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:40px}
.fo-visit h3{font-size:calc(24px * var(--hs))}
.fo-foot{text-align:center}
@media (max-width:960px){.fo-mast{padding-top:0;border-bottom-width:3px}.fo-mast>.sk-wrap{height:64px;grid-template-columns:minmax(0,1fr) auto;justify-items:start;align-items:center;gap:12px}.fo-mast .sk-menu{margin:0}.fo-mast .sk-menu[open]>nav{top:64px}}
@media (max-width:1024px){.fo-h1{font-size:calc(62px * var(--hs))}.fo-toc{grid-template-columns:minmax(0,1fr);gap:24px}.fo-index{columns:2}}
@media (max-width:760px){.fo-hero{padding-block:40px 24px}.fo-h1{font-size:calc(42px * var(--hs))}.fo-band{aspect-ratio:4/3}.fo-toc li{grid-template-columns:42px minmax(0,1fr)}.fo-toc li>p{grid-column:2}.fo-index{columns:1}.fo-pull{padding:48px 0}.fo-pull p{font-size:calc(30px * var(--hs))}.fo-steps article{grid-template-columns:minmax(0,1fr);gap:8px;padding:22px 0}.fo-steps article:nth-child(even) h3{order:0}.fo-team,.fo-qa{columns:1}.fo-visit{grid-template-columns:minmax(0,1fr);gap:24px}.fo-mast .logo{font-size:calc(24px * var(--hs))}}
</style>`;
const folio = (p, st, c) => K.page(st, `${alert(c)}<header class="sk-nav fo-mast"><div class="sk-wrap"><a class="logo" href="#"><b></b>${esc(p.name)}</a>${navLinks(c)}${menu(c)}</div></header>
<main class="fo">
<section class="sk-wrap fo-hero"><span class="sk-eyebrow">${esc(c.hero.eyebrow)}</span><h1 class="fo-h1">${esc(c.hero.h1)}</h1><p class="sk-lede">${esc(c.hero.lede)}</p><div class="sk-row"><a class="btn primary sk-btn-lg" href="#visit">${esc(c.hero.cta)}</a></div></section>
<section><div class="sk-photo fo-band">${scene(c, 1440, 548)}</div></section>
<section class="sk-sec" id="services"><div class="sk-wrap fo-toc"><div class="sk-stack"><span class="sk-eyebrow">${esc(c.services.eyebrow)}</span><h2 class="sk-h2">${esc(c.services.h2)}</h2><p class="muted">${esc(c.services.lede)}</p></div><ol>${c.services.items.map((s) => `<li><h3 class="sk-h3">${esc(s.t)}</h3><p class="muted">${esc(s.d)}</p></li>`).join("")}</ol></div></section>
<section class="sk-sec sk-alt"><div class="sk-wrap sk-stack"><h2 class="sk-h2">${esc(c.index.h2)}</h2><p class="muted">${esc(c.index.lede)}</p><ul class="fo-index">${c.index.items.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div></section>
<section class="fo-pull"><div class="sk-wrap"><p>${esc(c.statement)}</p></div></section>
<section class="sk-sec" id="process"><div class="sk-wrap"><div class="sk-head"><div><h2 class="sk-h2">${esc(c.process.h2)}</h2></div></div><div class="fo-steps">${c.process.steps.map((s) => `<article><h3>${esc(s.t)}</h3><p class="muted">${esc(s.d)}</p></article>`).join("")}</div></div></section>
<section class="sk-sec sk-alt" id="team"><div class="sk-wrap"><div class="sk-head"><div><h2 class="sk-h2">${esc(c.team.h2)}</h2></div><p class="muted">${esc(c.team.lede)}</p></div><div class="fo-team">${c.team.people.map((m) => `<article><h3 class="sk-h3">${esc(m.n)}</h3><p class="muted">${esc(m.r)}</p><p>${esc(m.b)}</p></article>`).join("")}</div></div></section>
<section class="sk-sec" id="faq"><div class="sk-wrap"><div class="sk-head"><div><h2 class="sk-h2">${esc(c.faq.h2)}</h2></div></div><div class="fo-qa">${faqItems(c)}</div></div></section>
<section class="sk-sec sk-alt" id="visit"><div class="sk-wrap"><div class="sk-head"><div><h2 class="sk-h2">${esc(c.visit.h2)}</h2></div><p class="muted">${esc(c.visit.lede)}</p></div><div class="fo-visit">${c.visit.locations.map((l) => `<div><h3>${esc(l.n)}</h3><p>${esc(l.addr)}</p><p class="muted">${esc(l.hours)}</p><p>${esc(l.phone)}</p></div>`).join("")}<div><h3>${esc(c.cta.h2)}</h3><p class="muted">${esc(c.cta.lede)}</p><p><a class="btn primary" href="#">${esc(c.hero.cta)}</a></p></div></div></div></section>
</main>${notice(c)}${foot(p, c)}`, BASE + folioCss);

// ---- ledger: information-first. Fixed sidebar with hours and phone; tables and timelines in the main column --------------------------
const ledgerCss = `<style>
.lg-shell{display:grid;grid-template-columns:292px minmax(0,1fr);align-items:start}
.lg-side{position:sticky;top:0;align-self:start;height:100vh;overflow:auto;border-right:1px solid var(--border);border-bottom:0;background:var(--surface);padding:26px 24px}
.lg-sidein{display:grid;gap:22px}
.lg-vert{display:grid;gap:2px;font-weight:500;color:var(--muted)}
.lg-vert a{padding:7px 0;border-bottom:1px solid var(--border)}
.lg-hours{display:grid;gap:4px;font-size:14px}
.lg-hours b{font-size:15px}
.lg-sidein .btn{width:100%;height:44px}
.lg-sec{padding:56px 52px;border-bottom:1px solid var(--border)}
.lg-hero{padding-top:72px}
.lg-h1{font-size:calc(50px * var(--hs));line-height:1.06;max-width:820px;margin:12px 0}
.lg-lede{font-size:18px;color:var(--muted);max-width:680px}
.lg-kv{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:0;margin-top:30px;border:1px solid var(--border);border-radius:var(--radius)}
.lg-kv>div{padding:16px 18px;border-right:1px solid var(--border)}
.lg-kv>div:last-child{border-right:0}
.lg-kv b{display:block}
.lg-t{width:100%;border-collapse:collapse;font-size:14.5px}
.lg-t th{text-align:left;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);padding:10px 14px 10px 0;border-bottom:1px solid var(--text)}
.lg-t td{padding:13px 14px 13px 0;border-bottom:1px solid var(--border);vertical-align:top}
.lg-sec h2{margin-bottom:8px}
.lg-sec>p.muted{max-width:680px;margin-bottom:20px}
.lg-cols{columns:3;column-gap:28px;list-style:none;font-size:14.5px}
.lg-cols li{padding:6px 0;border-bottom:1px dotted var(--border);break-inside:avoid}
.lg-line{list-style:none;display:grid;gap:0;border-left:2px solid var(--primary);margin-left:6px}
.lg-line li{padding:0 0 22px 24px;position:relative;display:grid;gap:4px}
.lg-line li::before{content:"";position:absolute;left:-7px;top:6px;width:12px;height:12px;border-radius:50%;background:var(--primary)}
.lg-people{display:grid;gap:0}
.lg-people article{display:grid;grid-template-columns:220px minmax(0,1fr);gap:20px;padding:14px 0;border-bottom:1px solid var(--border)}
.lg-qa details{padding:12px 0;border-bottom:1px solid var(--border)}
.lg-qa p{margin-top:6px;color:var(--muted)}
.lg-split{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,380px);gap:36px;align-items:start}
.lg-loc{display:grid;gap:2px;padding:12px 0;border-bottom:1px solid var(--border)}
@media (max-width:1100px){.lg-sec{padding:44px 32px}.lg-cols{columns:2}.lg-split{grid-template-columns:minmax(0,1fr)}.lg-shell{grid-template-columns:240px minmax(0,1fr)}.lg-kv{grid-template-columns:minmax(0,1fr)}.lg-kv>div{border-right:0;border-bottom:1px solid var(--border)}}
@media (max-width:960px){.lg-shell{grid-template-columns:minmax(0,1fr)}.lg-side{position:static;height:auto;border-right:0;border-bottom:1px solid var(--border);padding:16px 20px}.lg-sidein{display:flex;align-items:center;justify-content:space-between;gap:12px}.lg-hours,.lg-vert,.lg-sidein>.btn{display:none}.lg-side .sk-menu{display:block;margin:0}.lg-side .sk-menu[open]>nav{top:66px}}
@media (max-width:760px){.lg-sec{padding:36px 20px}.lg-hero{padding-top:36px}.lg-h1{font-size:calc(36px * var(--hs))}.lg-cols{columns:1}.lg-people article{grid-template-columns:minmax(0,1fr);gap:4px}.lg-t{font-size:13.5px}.lg-t th:nth-child(3),.lg-t td:nth-child(3){display:none}}
</style>`;
const ledger = (p, st, c) => K.page(st, `${alert(c)}<div class="lg-shell"><header class="sk-nav lg-side"><div class="lg-sidein"><a class="logo" href="#"><b></b>${esc(p.name)}</a>${navLinks(c, "lg-vert")}<div class="lg-hours"><b>${esc(c.visit.locations[0].hours)}</b><span class="muted">${esc(c.visit.locations[0].addr)}</span><span>${esc(phone(c))}</span></div><a class="btn primary" href="#visit">${esc(c.hero.cta)}</a>${menu(c)}</div></header>
<main class="lg">
<section class="lg-sec lg-hero"><span class="sk-eyebrow">${esc(c.hero.eyebrow)}</span><h1 class="lg-h1">${esc(c.hero.h1)}</h1><p class="lg-lede">${esc(c.hero.lede)}</p><div class="lg-kv">${c.facts.map((f) => `<div><b>${esc(f.t)}</b><span class="muted">${esc(f.d)}</span></div>`).join("")}</div></section>
<section class="lg-sec" id="services"><h2 class="sk-h2">${esc(c.services.h2)}</h2><p class="muted">${esc(c.services.lede)}</p><table class="lg-t"><thead><tr><th scope="col">Service</th><th scope="col">What it covers</th><th scope="col">Who it suits</th></tr></thead><tbody>${c.services.items.map((s) => `<tr><td><b>${esc(s.t)}</b></td><td>${esc(s.d)}</td><td>${esc(s.who)}</td></tr>`).join("")}</tbody></table></section>
<section class="lg-sec"><h2 class="sk-h2">${esc(c.index.h2)}</h2><p class="muted">${esc(c.index.lede)}</p><ul class="lg-cols">${c.index.items.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></section>
<section class="lg-sec" id="process"><h2 class="sk-h2">${esc(c.process.h2)}</h2><p class="muted">${esc(c.process.lede)}</p><ol class="lg-line">${c.process.steps.map((s) => `<li><b>${esc(s.t)}</b><span class="muted">${esc(s.d)}</span></li>`).join("")}</ol></section>
<section class="lg-sec"><h2 class="sk-h2">${esc(c.table.h2)}</h2><p class="muted">${esc(c.table.lede)}</p><table class="lg-t"><thead><tr>${c.table.cols.map((h) => `<th scope="col">${esc(h)}</th>`).join("")}</tr></thead><tbody>${c.table.rows.map((r) => `<tr>${r.map((x, i) => `<td>${i ? esc(x) : `<b>${esc(x)}</b>`}</td>`).join("")}</tr>`).join("")}</tbody></table>${c.table.note ? `<p class="muted" style="margin-top:12px;font-size:13px">${esc(c.table.note)}</p>` : ""}</section>
<section class="lg-sec" id="team"><h2 class="sk-h2">${esc(c.team.h2)}</h2><p class="muted">${esc(c.team.lede)}</p><div class="lg-people">${c.team.people.map((m) => `<article><div><b>${esc(m.n)}</b><p class="muted">${esc(m.r)}</p></div><p>${esc(m.b)}</p></article>`).join("")}</div></section>
<section class="lg-sec" id="faq"><h2 class="sk-h2">${esc(c.faq.h2)}</h2><div class="lg-qa">${faqItems(c)}</div></section>
<section class="lg-sec" id="visit"><div class="lg-split"><div><h2 class="sk-h2">${esc(c.visit.h2)}</h2><p class="muted">${esc(c.visit.lede)}</p>${c.visit.locations.map((l) => `<div class="lg-loc"><b>${esc(l.n)}</b><span>${esc(l.addr)}</span><span class="muted">${esc(l.hours)} · ${esc(l.phone)}</span></div>`).join("")}</div>${contactForm(c)}</div></section>
</main></div>${notice(c)}${foot(p, c)}`, BASE + ledgerCss);

// ---- bento: floating pill nav, tile mosaic for hero and services, rounded and friendly ---------------------------------------------------
const bentoCss = `<style>
.bn-bar{padding:14px 0 0;border-bottom:0;background:transparent}
.bn-bar>.sk-wrap{height:auto;padding-top:10px;padding-bottom:10px;background:var(--surface);border:1px solid var(--border);border-radius:999px;max-width:1152px;gap:24px;box-shadow:var(--shadow-sm)}
.bn-grid{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:16px}
.bn-t{border-radius:var(--radius-lg);padding:26px;background:var(--surface);border:1px solid var(--border);display:grid;gap:8px;align-content:start;min-width:0}
.bn-hero{grid-column:span 7;grid-row:span 2;background:color-mix(in oklab,var(--primary) 16%,var(--surface));padding:40px;align-content:center;gap:16px}
.bn-h1{font-size:calc(58px * var(--hs));line-height:1.03}
.bn-shot{grid-column:span 5;padding:0;overflow:hidden;min-height:230px}
.bn-shot .sk-photo{height:100%;border-radius:0}
.bn-open{grid-column:span 3;background:var(--text);color:var(--bg);border-color:var(--text)}
.bn-open .muted{color:inherit;opacity:.76}
.bn-call{grid-column:span 2;background:color-mix(in oklab,var(--accent) 22%,var(--surface))}
.bn-s1{grid-column:span 5}.bn-s2{grid-column:span 4}.bn-s3{grid-column:span 3}.bn-s4{grid-column:span 3}.bn-s5{grid-column:span 4}.bn-s6{grid-column:span 5}
.bn-tico{color:color-mix(in oklab,var(--primary) 80%,var(--text))}
.bn-sec{padding-top:64px}
.bn-rail{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px}
.bn-rail article{border-radius:var(--radius-lg);padding:24px;display:grid;gap:8px;align-content:start;background:color-mix(in oklab,var(--primary) 10%,var(--surface))}
.bn-rail article:nth-child(even){background:color-mix(in oklab,var(--accent) 16%,var(--surface))}
.bn-num{font:var(--hw) calc(38px * var(--hs))/1 var(--font-h);color:color-mix(in oklab,var(--primary) 80%,var(--text))}
.bn-pills{display:flex;flex-wrap:wrap;gap:8px;list-style:none}
.bn-pills li{padding:8px 14px;border-radius:999px;background:var(--surface);border:1px solid var(--border);font-weight:600;font-size:14px}
.bn-team{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px}
.bn-team article{display:grid;justify-items:center;text-align:center;gap:6px;padding:24px 18px}
.bn-team .avatar{width:72px;height:72px;font-size:20px}
.bn-qa{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
.bn-qa details{padding:18px 22px;border-radius:var(--radius-lg);background:var(--surface);border:1px solid var(--border)}
.bn-qa p{margin-top:8px;color:var(--muted)}
.bn-end{margin:64px 0;padding:44px;border-radius:calc(var(--radius-lg) * 2);background:var(--primary);color:var(--on-primary);display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,1fr);gap:32px;align-items:center}
.bn-end .btn{background:var(--bg);color:var(--text);border-color:var(--bg)}
.bn-loc{display:grid;gap:10px}
.bn-loc article{background:color-mix(in oklab,var(--on-primary) 12%,transparent);padding:16px 18px;border-radius:var(--radius-lg);display:grid;gap:2px}
@media (max-width:1024px){.bn-hero,.bn-shot{grid-column:span 12}.bn-shot{min-height:220px}.bn-open{grid-column:span 7}.bn-call{grid-column:span 5}.bn-s1,.bn-s2,.bn-s3,.bn-s4,.bn-s5,.bn-s6{grid-column:span 6}.bn-rail,.bn-team{grid-template-columns:repeat(2,minmax(0,1fr))}.bn-end{grid-template-columns:minmax(0,1fr)}}
@media (max-width:760px){.bn-bar>.sk-wrap{margin:0 12px;width:auto;padding-left:18px;padding-right:12px}.bn-hero{padding:26px}.bn-h1{font-size:calc(40px * var(--hs))}.bn-open,.bn-call,.bn-s1,.bn-s2,.bn-s3,.bn-s4,.bn-s5,.bn-s6{grid-column:span 12}.bn-rail,.bn-team,.bn-qa{grid-template-columns:minmax(0,1fr)}.bn-end{padding:26px;margin:44px 0}.bn-sec{padding-top:44px}}
</style>`;
const bento = (p, st, c) => K.page(st, `${alert(c)}<header class="sk-nav bn-bar"><div class="sk-wrap"><a class="logo" href="#"><b></b>${esc(p.name)}</a>${navLinks(c)}<div class="sk-navend"><a class="btn primary" href="#visit">${esc(c.hero.cta)}</a></div>${menu(c)}</div></header>
<main class="bn">
<section class="sk-wrap" style="padding-top:22px"><div class="bn-grid"><div class="bn-t bn-hero"><span class="sk-eyebrow">${esc(c.hero.eyebrow)}</span><h1 class="bn-h1">${esc(c.hero.h1)}</h1><p class="sk-lede">${esc(c.hero.lede)}</p><div class="sk-row"><a class="btn primary sk-btn-lg" href="#visit">${esc(c.hero.cta)}</a><a class="btn sk-btn-lg" href="#services">${esc(c.hero.alt)}</a></div></div>
<div class="bn-t bn-shot"><div class="sk-photo">${scene(c, 520, 300)}</div></div><div class="bn-t bn-open"><b>${esc(c.visit.locations[0].hours)}</b><span class="muted">${esc(c.visit.locations[0].n)}</span></div><div class="bn-t bn-call"><b>${esc(phone(c))}</b><span class="muted">${esc(c.nav.call || "Call us")}</span></div></div></section>
<section class="sk-wrap bn-sec" id="services"><div class="sk-head"><div><span class="sk-eyebrow">${esc(c.services.eyebrow)}</span><h2 class="sk-h2">${esc(c.services.h2)}</h2></div><p class="muted">${esc(c.services.lede)}</p></div><div class="bn-grid">${c.services.items.map((s, i) => `<article class="bn-t bn-s${i + 1}"><span class="bn-tico">${ic(s.icon, 26)}</span><h3 class="sk-h3">${esc(s.t)}</h3><p class="muted">${esc(s.d)}</p></article>`).join("")}</div></section>
<section class="sk-wrap bn-sec"><div class="sk-head"><div><h2 class="sk-h2">${esc(c.index.h2)}</h2></div><p class="muted">${esc(c.index.lede)}</p></div><ul class="bn-pills">${c.index.items.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></section>
<section class="sk-wrap bn-sec" id="process"><div class="sk-head"><div><h2 class="sk-h2">${esc(c.process.h2)}</h2></div><p class="muted">${esc(c.process.lede)}</p></div><div class="bn-rail">${c.process.steps.map((s, i) => `<article><span class="bn-num">${i + 1}</span><h3 class="sk-h3">${esc(s.t)}</h3><p class="muted">${esc(s.d)}</p></article>`).join("")}</div></section>
<section class="sk-wrap bn-sec" id="team"><div class="sk-head"><div><h2 class="sk-h2">${esc(c.team.h2)}</h2></div><p class="muted">${esc(c.team.lede)}</p></div><div class="bn-team">${c.team.people.map((m) => `<article class="card"><span class="avatar">${esc(initials(m.n))}</span><h3 class="sk-h3">${esc(m.n)}</h3><p class="muted">${esc(m.r)}</p></article>`).join("")}</div></section>
<section class="sk-wrap bn-sec" id="faq"><div class="sk-head"><div><h2 class="sk-h2">${esc(c.faq.h2)}</h2></div></div><div class="bn-qa">${faqItems(c)}</div></section>
<section class="sk-wrap" id="visit"><div class="bn-end"><div class="sk-stack"><h2 class="sk-h2">${esc(c.cta.h2)}</h2><p>${esc(c.cta.lede)}</p><a class="btn sk-btn-lg" href="#">${esc(c.hero.cta)}</a></div><div class="bn-loc">${c.visit.locations.map((l) => `<article><b>${esc(l.n)}</b><span>${esc(l.addr)}</span><span>${esc(l.hours)} · ${esc(l.phone)}</span></article>`).join("")}</div></div></section>
</main>${notice(c)}${foot(p, c)}`, BASE + bentoCss);

// ---- band: full-bleed colour bands, oversized headline, sticky section titles, inverted steps ---------------------------------------
const bandCss = `<style>
.bd-bar{background:var(--primary);color:var(--on-primary);border-bottom:0}
.bd-bar .sk-links{color:inherit;opacity:.92}
.bd-bar .logo b{background:var(--on-primary)}
.bd-bar .btn{background:var(--on-primary);color:var(--primary);border-color:var(--on-primary)}
.bd-hero{background:var(--primary);color:var(--on-primary);padding:56px 0 76px}
.bd-h1{font-size:calc(112px * var(--hs));line-height:.94;max-width:1100px;overflow-wrap:break-word}
.bd-hero .sk-eyebrow{color:inherit;opacity:.85}
.bd-sub{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:40px;align-items:end;margin-top:36px}
.bd-sub p{font-size:20px;max-width:640px}
.bd-hero .btn{background:var(--on-primary);color:var(--primary);border-color:var(--on-primary)}
.bd-two{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,2fr);gap:56px;align-items:start}
.bd-stick{position:sticky;top:24px;display:grid;gap:12px}
.bd-row{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.4fr);gap:28px;padding:24px 0;border-top:2px solid var(--text)}
.bd-row h3{font-size:calc(26px * var(--hs));line-height:1.12}
.bd-ink{background:var(--text);color:var(--bg)}
.bd-ink .muted{color:inherit;opacity:.74}
.bd-big{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:30px;margin-top:36px}
.bd-big b{display:block;font:var(--hw) calc(84px * var(--hs))/1 var(--font-h);margin-bottom:12px;color:var(--bg)}
.bd-tint{background:color-mix(in oklab,var(--accent) 22%,var(--bg))}
.bd-tags{display:flex;flex-wrap:wrap;gap:6px 22px;list-style:none;font:var(--hw) calc(30px * var(--hs))/1.3 var(--font-h);margin-top:22px}
.bd-people{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 44px}
.bd-people article{padding:20px 0;border-top:2px solid var(--text)}
.bd-qa details{padding:18px 0;border-top:2px solid var(--text)}
.bd-qa summary{font-size:18px}
.bd-qa p{margin-top:8px;max-width:640px}
.bd-go{background:var(--primary);color:var(--on-primary)}
.bd-go .sk-h2{font-size:calc(60px * var(--hs))}
.bd-go .btn{background:var(--on-primary);color:var(--primary);border-color:var(--on-primary)}
.bd-gogrid{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);gap:48px;align-items:start}
.bd-loc{padding:14px 0;border-top:1px solid color-mix(in oklab,var(--on-primary) 40%,transparent);display:grid;gap:2px}
@media (max-width:1024px){.bd-h1{font-size:calc(78px * var(--hs))}.bd-big{grid-template-columns:repeat(2,minmax(0,1fr))}.bd-two,.bd-gogrid{grid-template-columns:minmax(0,1fr);gap:28px}.bd-stick{position:static}}
@media (max-width:760px){.bd-hero{padding:30px 0 44px}.bd-h1{font-size:calc(41px * var(--hs))}.bd-sub{grid-template-columns:minmax(0,1fr);gap:20px;margin-top:22px}.bd-sub p{font-size:17px}.bd-row{grid-template-columns:minmax(0,1fr);gap:8px;padding:18px 0}.bd-big{grid-template-columns:minmax(0,1fr)}.bd-big b{font-size:calc(52px * var(--hs))}.bd-tags{font-size:calc(21px * var(--hs))}.bd-people{grid-template-columns:minmax(0,1fr)}.bd-go .sk-h2{font-size:calc(38px * var(--hs))}}
</style>`;
const band = (p, st, c) => K.page(st, `${alert(c)}${K.nav(p, [], c.hero.cta, null).replace('class="sk-nav"', 'class="sk-nav bd-bar"').replace('<nav class="sk-links" aria-label="Main"></nav>', navLinks(c)).replace('href="#' + K.slug(c.hero.cta) + '"', 'href="#visit"')}
<main class="bd">
<section class="bd-hero"><div class="sk-wrap"><span class="sk-eyebrow">${esc(c.hero.eyebrow)}</span><h1 class="bd-h1">${esc(c.hero.h1)}</h1><div class="bd-sub"><p>${esc(c.hero.lede)}</p><a class="btn sk-btn-lg" href="#visit">${esc(c.hero.cta)}</a></div></div></section>
<section class="sk-sec" id="services"><div class="sk-wrap bd-two"><div class="bd-stick"><span class="sk-eyebrow">${esc(c.services.eyebrow)}</span><h2 class="sk-h2">${esc(c.services.h2)}</h2><p class="muted">${esc(c.services.lede)}</p></div><div>${c.services.items.map((s) => `<article class="bd-row"><h3>${esc(s.t)}</h3><p>${esc(s.d)}</p></article>`).join("")}</div></div></section>
<section class="sk-sec bd-ink" id="process"><div class="sk-wrap"><h2 class="sk-h2">${esc(c.process.h2)}</h2><p class="muted">${esc(c.process.lede)}</p><div class="bd-big">${c.process.steps.map((s, i) => `<article><b>${i + 1}</b><h3 class="sk-h3">${esc(s.t)}</h3><p class="muted">${esc(s.d)}</p></article>`).join("")}</div></div></section>
<section class="sk-sec bd-tint"><div class="sk-wrap"><h2 class="sk-h2">${esc(c.index.h2)}</h2><p class="muted">${esc(c.index.lede)}</p><ul class="bd-tags">${c.index.items.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div></section>
<section class="sk-sec" id="team"><div class="sk-wrap bd-two"><div class="bd-stick"><h2 class="sk-h2">${esc(c.team.h2)}</h2><p class="muted">${esc(c.team.lede)}</p></div><div class="bd-people">${c.team.people.map((m) => `<article><h3 class="sk-h3">${esc(m.n)}</h3><p class="muted">${esc(m.r)}</p><p>${esc(m.b)}</p></article>`).join("")}</div></div></section>
<section class="sk-sec sk-alt" id="faq"><div class="sk-wrap bd-two"><div class="bd-stick"><h2 class="sk-h2">${esc(c.faq.h2)}</h2></div><div class="bd-qa">${faqItems(c)}</div></div></section>
<section class="sk-sec bd-go" id="visit"><div class="sk-wrap bd-gogrid"><div class="sk-stack"><h2 class="sk-h2">${esc(c.cta.h2)}</h2><p>${esc(c.cta.lede)}</p><a class="btn sk-btn-lg" href="#">${esc(c.hero.cta)}</a></div><div>${c.visit.locations.map((l) => `<div class="bd-loc"><b>${esc(l.n)}</b><span>${esc(l.addr)}</span><span>${esc(l.hours)} · ${esc(l.phone)}</span></div>`).join("")}</div></div></section>
</main>${notice(c)}${foot(p, c)}`, BASE + bandCss);

// ---- concierge: task-first. Three doors in the hero, services as an accordion beside an image, one quiet column ----------------------
const concCss = `<style>
.cc-top{border-bottom:1px solid var(--border)}
.cc-hero{text-align:center;padding-block:84px 44px;display:grid;justify-items:center;gap:18px}
.cc-h1{font-size:calc(66px * var(--hs));line-height:1.04;max-width:900px}
.cc-doors{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px;padding-bottom:76px}
.cc-door{padding:28px;display:grid;gap:10px;align-content:start;text-align:left;border-top:3px solid var(--primary)}
.cc-duo{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:56px;align-items:start}
.cc-duo .sk-photo{aspect-ratio:1/1;position:sticky;top:24px}
.cc-acc details{padding:18px 0;border-bottom:1px solid var(--border)}
.cc-acc summary{font:var(--hw) calc(22px * var(--hs))/1.2 var(--font-h)}
.cc-acc p{margin-top:10px;color:var(--muted)}
.cc-narrow{max-width:760px;margin:0 auto}
.cc-steps{list-style:none;counter-reset:s;display:grid;gap:26px;margin-top:28px}
.cc-steps li{counter-increment:s;display:grid;grid-template-columns:56px minmax(0,1fr);gap:18px}
.cc-steps li::before{content:counter(s);width:44px;height:44px;border-radius:50%;display:grid;place-items:center;border:1px solid var(--primary);color:color-mix(in oklab,var(--primary) 80%,var(--text));font:var(--hw) 18px/1 var(--font-h)}
.cc-steps b{display:block;font-size:17px}
.cc-table{width:100%;border-collapse:collapse;margin-top:22px}
.cc-table th,.cc-table td{text-align:left;padding:12px 16px 12px 0;border-bottom:1px solid var(--border);vertical-align:top}
.cc-table th{font-size:12px;color:var(--muted);letter-spacing:.06em;text-transform:uppercase}
.cc-people{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}
.cc-people article{padding:24px;display:grid;gap:6px}
.cc-end{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,420px);gap:48px;align-items:start}
.cc-loc{padding:14px 0;border-top:1px solid var(--border);display:grid;gap:2px}
@media (max-width:1024px){.cc-h1{font-size:calc(52px * var(--hs))}.cc-duo,.cc-end{grid-template-columns:minmax(0,1fr)}.cc-duo .sk-photo{position:static;aspect-ratio:16/9}}
@media (max-width:760px){.cc-hero{padding-block:40px 28px}.cc-h1{font-size:calc(38px * var(--hs))}.cc-doors{grid-template-columns:minmax(0,1fr);padding-bottom:44px}.cc-people{grid-template-columns:minmax(0,1fr)}.cc-table th:nth-child(3),.cc-table td:nth-child(3){display:none}}
</style>`;
const concierge = (p, st, c) => K.page(st, `${alert(c)}${K.nav(p, [], c.hero.cta, null).replace('class="sk-nav"', 'class="sk-nav cc-top"').replace('<nav class="sk-links" aria-label="Main"></nav>', navLinks(c)).replace('href="#' + K.slug(c.hero.cta) + '"', 'href="#visit"')}
<main class="cc">
<section class="sk-wrap cc-hero"><span class="sk-eyebrow">${esc(c.hero.eyebrow)}</span><h1 class="cc-h1">${esc(c.hero.h1)}</h1><p class="sk-lede">${esc(c.hero.lede)}</p></section>
<section class="sk-wrap cc-doors">${c.doors.map((d) => `<article class="card cc-door"><h2 class="sk-h3">${esc(d.t)}</h2><p class="muted">${esc(d.d)}</p><p><a class="btn" href="#${esc(d.to)}">${esc(d.cta)}</a></p></article>`).join("")}</section>
<section class="sk-sec sk-alt" id="services"><div class="sk-wrap cc-duo"><div class="sk-photo">${scene(c, 640, 640)}</div><div><span class="sk-eyebrow">${esc(c.services.eyebrow)}</span><h2 class="sk-h2">${esc(c.services.h2)}</h2><p class="muted">${esc(c.services.lede)}</p><div class="cc-acc">${c.services.items.map((s) => `<details><summary>${esc(s.t)}</summary><p>${esc(s.d)}</p></details>`).join("")}</div></div></div></section>
<section class="sk-sec" id="process"><div class="sk-wrap cc-narrow"><h2 class="sk-h2">${esc(c.process.h2)}</h2><p class="muted">${esc(c.process.lede)}</p><ol class="cc-steps">${c.process.steps.map((s) => `<li><span><b>${esc(s.t)}</b><span class="muted">${esc(s.d)}</span></span></li>`).join("")}</ol></div></section>
<section class="sk-sec sk-alt"><div class="sk-wrap cc-narrow"><h2 class="sk-h2">${esc(c.table.h2)}</h2><p class="muted">${esc(c.table.lede)}</p><table class="cc-table"><thead><tr>${c.table.cols.map((h) => `<th scope="col">${esc(h)}</th>`).join("")}</tr></thead><tbody>${c.table.rows.map((r) => `<tr>${r.map((x) => `<td>${esc(x)}</td>`).join("")}</tr>`).join("")}</tbody></table></div></section>
<section class="sk-sec" id="team"><div class="sk-wrap"><div class="sk-head"><div><h2 class="sk-h2">${esc(c.team.h2)}</h2></div><p class="muted">${esc(c.team.lede)}</p></div><div class="cc-people">${c.team.people.map((m) => `<article class="card"><h3 class="sk-h3">${esc(m.n)}</h3><p class="muted">${esc(m.r)}</p><p>${esc(m.b)}</p></article>`).join("")}</div></div></section>
<section class="sk-sec sk-alt" id="faq"><div class="sk-wrap cc-narrow"><h2 class="sk-h2">${esc(c.faq.h2)}</h2><div class="cc-acc">${faqItems(c)}</div></div></section>
<section class="sk-sec" id="visit"><div class="sk-wrap cc-end"><div><h2 class="sk-h2">${esc(c.visit.h2)}</h2><p class="muted">${esc(c.visit.lede)}</p>${c.visit.locations.map((l) => `<div class="cc-loc"><b>${esc(l.n)}</b><span>${esc(l.addr)}</span><span class="muted">${esc(l.hours)} · ${esc(l.phone)}</span></div>`).join("")}</div>${contactForm(c)}</div></section>
</main>${notice(c)}${foot(p, c)}`, BASE + concCss);


// ==== property layouts (7-Nov-2026, real estate). Unique to industries that sell or let places: they need c.listings and c.feature. ====
// Property "photos" are drawn buildings in theme tokens, so every style variation recolours them. Original artwork; owners swap in photos.
const MIX = (a, n, b = "var(--surface)") => `color-mix(in oklab,${a} ${n}%,${b})`;
const WALLS = [MIX("var(--accent)", 26), MIX("var(--primary)", 22), MIX("var(--accent)", 14, "var(--bg)")];
const prop = (kind, w, h, i, label) => {
  const wall = WALLS[i % 3], dark = MIX("var(--primary)", 72, "var(--text)"), glass = MIX("var(--bg)", 70, "var(--accent)"), tree = MIX("var(--primary)", 46), f = (c) => `style="fill:${c}"`;
  const win = (x, y, a = 30, b = 28) => `<rect x="${x}" y="${y}" width="${a}" height="${b}" ${f(glass)}/>`;
  const pine = (x, s = 1) => `<path d="M${x} ${210 - 90 * s}l${26 * s} ${70 * s}h${-52 * s}z" ${f(tree)}/><rect x="${x - 3}" y="${210 - 20 * s}" width="6" height="${20 * s}" ${f(dark)}/>`;
  const oak = (x, r = 26) => `<circle cx="${x}" cy="${206 - r * 1.6}" r="${r}" ${f(tree)}/><rect x="${x - 3}" y="${206 - r}" width="6" height="${r + 4}" ${f(dark)}/>`;
  const b = {
    house: `<rect x="110" y="110" width="180" height="100" ${f(wall)}/><path d="M92 114L200 48l108 66z" ${f(dark)}/><rect x="186" y="158" width="30" height="52" ${f(dark)}/>${win(128, 128, 38, 30)}${win(236, 128, 38, 30)}${oak(342)}`,
    townhouse: [0, 1, 2].map((k) => { const x = 74 + k * 84, y = [92, 76, 98][k]; return `<rect x="${x}" y="${y}" width="84" height="${210 - y}" ${f(WALLS[(i + k) % 3])}/><path d="M${x - 4} ${y + 2}L${x + 42} ${y - 30}L${x + 88} ${y + 2}z" ${f(dark)}/>${win(x + 14, y + 18, 22, 26)}${win(x + 48, y + 18, 22, 26)}<rect x="${x + 30}" y="168" width="24" height="42" ${f(dark)}/>`; }).join("") + oak(352, 22),
    flat: `<rect x="118" y="44" width="164" height="166" ${f(wall)}/><rect x="112" y="36" width="176" height="10" ${f(dark)}/>${[0, 1, 2, 3, 4].map((r) => [0, 1, 2, 3].map((k) => win(132 + k * 36, 58 + r * 26, 24, 16)).join("")).join("")}<rect x="186" y="186" width="28" height="24" ${f(dark)}/>${oak(70, 24)}${oak(336, 28)}`,
    tower: `<rect x="150" y="18" width="100" height="192" ${f(wall)}/>${Array.from({ length: 9 }, (_, r) => `<rect x="160" y="${30 + r * 19}" width="80" height="9" ${f(glass)}/>`).join("")}<rect x="86" y="132" width="64" height="78" ${f(WALLS[(i + 1) % 3])}/>${win(96, 146, 18, 14)}${win(122, 146, 18, 14)}${win(96, 172, 18, 14)}${win(122, 172, 18, 14)}<rect x="250" y="150" width="64" height="60" ${f(WALLS[(i + 2) % 3])}/><rect x="186" y="186" width="28" height="24" ${f(dark)}/>`,
    cabin: `<path d="M118 210L200 66l82 144z" ${f(wall)}/><path d="M110 212L200 54l90 158h-14L200 78l-76 134z" ${f(dark)}/><path d="M172 150l28-48 28 48z" ${f(glass)}/><rect x="188" y="170" width="24" height="40" ${f(dark)}/>${pine(64, 1.1)}${pine(338, .9)}`,
    villa: `<rect x="54" y="124" width="292" height="86" ${f(wall)}/><rect x="44" y="114" width="312" height="12" ${f(dark)}/><rect x="190" y="74" width="150" height="40" ${f(WALLS[(i + 1) % 3])}/><rect x="182" y="66" width="166" height="10" ${f(dark)}/>${win(70, 140, 100, 54)}${win(196, 84, 130, 22)}${win(250, 140, 80, 54)}<rect x="186" y="150" width="40" height="60" ${f(dark)}/><rect x="70" y="222" width="190" height="16" ${f(glass)}/>`,
    plot: `<rect x="96" y="96" width="208" height="114" style="fill:none;stroke:${dark};stroke-width:3;stroke-dasharray:10 8"/><path d="M84 100L200 40l116 60" style="fill:none;stroke:${dark};stroke-width:3;stroke-dasharray:10 8"/>${[96, 304].map((x) => `<rect x="${x - 3}" y="196" width="6" height="22" ${f(dark)}/>`).join("")}<rect x="326" y="128" width="54" height="36" ${f(wall)}/><rect x="350" y="164" width="6" height="46" ${f(dark)}/>${oak(50, 22)}`,
    shop: `<rect x="80" y="70" width="240" height="140" ${f(wall)}/><path d="M72 112h256l-12 22H84z" ${f(dark)}/>${[0, 1, 2, 3, 4, 5].map((k) => `<rect x="${92 + k * 38}" y="112" width="19" height="22" ${f(glass)}/>`).join("")}${win(96, 146, 130, 64)}<rect x="244" y="146" width="44" height="64" ${f(dark)}/><rect x="96" y="82" width="208" height="20" ${f(glass)}/>`,
  }[kind] || "";
  return `<svg width="${w}" height="${h}" viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${esc(label || "Illustration of a property")}"><rect width="400" height="260" style="fill:${MIX("var(--primary)", 12)}"/><circle cx="${[330, 70, 300][i % 3]}" cy="54" r="24" style="fill:${MIX("var(--accent)", 30)}"/><rect y="210" width="400" height="50" style="fill:${MIX("var(--primary)", 30)}"/>${b}</svg>`;
};
const PINS = [[118, 168], [330, 120], [228, 300], [86, 452], [372, 520], [250, 610]];
const mapSvg = (c, w, h) => `<svg width="${w}" height="${h}" viewBox="0 0 460 720" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${esc(`Illustrated map of the areas ${c.footer.blurb.split(" ")[0] ? "covered" : ""}`.trim())}"><rect width="460" height="720" style="fill:${MIX("var(--primary)", 8)}"/>
<path d="M-10 380C90 330 150 420 260 380S420 300 480 340V420C400 380 330 470 250 460S90 410-10 460z" style="fill:${MIX("var(--accent)", 30)}"/>
<circle cx="360" cy="190" r="70" style="fill:${MIX("var(--primary)", 22)}"/><circle cx="110" cy="610" r="80" style="fill:${MIX("var(--primary)", 22)}"/>
<g style="fill:none;stroke:var(--bg);stroke-width:14;stroke-linecap:round">${[60, 200, 330].map((x) => `<path d="M${x} -10V730"/>`).join("")}${[90, 250, 540, 660].map((y) => `<path d="M-10 ${y}H470"/>`).join("")}<path d="M-10 720L460 120"/></g>
${PINS.map(([x, y], i) => `<g><circle cx="${x}" cy="${y}" r="17" style="fill:var(--primary)"/><text x="${x}" y="${y + 6}" text-anchor="middle" style="fill:var(--on-primary);font:700 17px sans-serif">${i + 1}</text></g>`).join("")}</svg>`;
// A simple floor plan for the featured home: five rooms, two rows, labelled with their sizes.
const planSvg = (c, w, h) => { const R = c.feature.rooms, cell = [[20, 20, 190, 170], [210, 20, 150, 170], [360, 20, 160, 170], [20, 190, 290, 170], [310, 190, 210, 170]];
  return `<svg width="${w}" height="${h}" viewBox="0 0 540 380" role="img" aria-label="${esc(`Floor plan sketch of ${c.feature.t}`)}"><rect width="540" height="380" style="fill:${MIX("var(--primary)", 6, "var(--bg)")}"/>
${cell.map(([x, y, a, b], i) => `<rect x="${x}" y="${y}" width="${a}" height="${b}" style="fill:${i % 2 ? MIX("var(--accent)", 12, "var(--bg)") : MIX("var(--primary)", 10, "var(--bg)")};stroke:var(--text);stroke-width:4"/><text x="${x + 16}" y="${y + 34}" style="fill:var(--text);font:600 14px sans-serif">${esc(R[i][0])}</text><text x="${x + 16}" y="${y + 56}" style="fill:var(--text);opacity:.7;font:400 14px sans-serif">${esc(R[i][1])}</text>`).join("")}
<path d="M120 190h40M260 190h40M230 90v40M370 110v40M310 270v40" style="stroke:${MIX("var(--primary)", 6, "var(--bg)")};stroke-width:6"/></svg>`; };

// ---- listing: search first. A search panel and area chips, then a split view: listing cards beside a sticky map with numbered pins ----
const listingCss = `<style>
.ls-bar>.sk-wrap{height:68px}
.ls-top{padding:44px 0 26px;border-bottom:1px solid var(--border)}
.ls-intro{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.05fr);gap:44px;align-items:end}
.ls-h1{font-size:calc(46px * var(--hs));line-height:1.06}
.ls-search{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(0,1fr) auto;gap:12px;align-items:end;padding:18px}
.ls-search .sk-field{min-width:0}
.ls-chips{display:flex;flex-wrap:wrap;gap:8px;list-style:none;margin-top:22px}
.ls-chips li{padding:7px 14px;border:1px solid var(--border);border-radius:999px;font-size:14px;font-weight:600;background:var(--surface)}
.ls-chips li:first-child{background:var(--primary);color:var(--on-primary);border-color:var(--primary)}
.ls-grid{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,1fr);gap:32px;align-items:start;padding-top:32px;padding-bottom:64px}
.ls-count{display:grid;gap:4px;margin-bottom:18px}
.ls-count b{font:var(--hw) calc(26px * var(--hs))/1.2 var(--font-h)}
.ls-list{display:grid;gap:16px}
.ls-item{position:relative;display:grid;grid-template-columns:220px minmax(0,1fr);padding:0;overflow:hidden}
.ls-th{border-radius:0;height:100%;min-height:170px}
.ls-body{padding:18px 20px;display:grid;gap:4px;align-content:start}
.ls-tag{justify-self:start;font-size:12px;font-weight:600;padding:3px 9px;border-radius:var(--radius-sm);background:color-mix(in oklab,var(--accent) 22%,var(--surface))}
.ls-price{font:var(--hw) calc(24px * var(--hs))/1.2 var(--font-h)}
.ls-specs{display:flex;flex-wrap:wrap;gap:4px 16px;list-style:none;font-size:13.5px;color:var(--muted);margin-top:6px;padding-top:8px;border-top:1px solid var(--border)}
.ls-pin{position:absolute;left:10px;top:10px;width:30px;height:30px;border-radius:50%;display:grid;place-items:center;background:var(--primary);color:var(--on-primary);font-weight:700;font-size:14px}
.ls-map{position:sticky;top:16px;display:grid;gap:8px}
.ls-mapbox{aspect-ratio:46/72}
.ls-mapnote{font-size:12.5px}
.ls-svc{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 48px}
.ls-svc article{display:grid;grid-template-columns:44px minmax(0,1fr);gap:4px 16px;padding:20px 0;border-top:1px solid var(--border)}
.ls-svc .ls-ico{grid-row:span 3;width:44px;height:44px;border-radius:50%;display:grid;place-items:center;background:color-mix(in oklab,var(--primary) 14%,var(--surface));color:color-mix(in oklab,var(--primary) 80%,var(--text))}
.ls-who{font-size:13px;color:var(--muted)}
.ls-track{list-style:none;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:24px;counter-reset:t;position:relative;margin-top:8px}
.ls-track li{counter-increment:t;display:grid;gap:8px;padding-top:58px;position:relative}
.ls-track li::before{content:counter(t);position:absolute;top:0;left:0;width:42px;height:42px;border-radius:50%;display:grid;place-items:center;background:var(--bg);border:2px solid var(--primary);font-weight:700;z-index:1}
.ls-track li::after{content:"";position:absolute;top:20px;left:42px;right:-24px;height:2px;background:var(--border)}
.ls-track li:last-child::after{display:none}
.ls-two{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.2fr);gap:40px;align-items:start}
.ls-aud{padding:28px;display:grid;gap:12px}
.ls-aud ul{list-style:none;display:grid;gap:8px}
.ls-aud li{padding-left:22px;position:relative}
.ls-aud li::before{content:"";position:absolute;left:0;top:.55em;width:10px;height:10px;border-radius:2px;background:var(--primary)}
.ls-t{width:100%;border-collapse:collapse;font-size:14.5px}
.ls-t th{text-align:left;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);padding:10px 12px 10px 0;border-bottom:2px solid var(--text)}
.ls-t td{padding:12px 12px 12px 0;border-bottom:1px solid var(--border);vertical-align:top}
.ls-team{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:18px}
.ls-team article{display:grid;grid-template-columns:48px minmax(0,1fr);gap:4px 12px;align-items:center}
.ls-team .avatar{width:48px;height:48px;font-size:14px;grid-row:span 2}
.ls-faq{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,2fr);gap:48px;align-items:start}
.ls-faq details{padding:16px 0;border-bottom:1px solid var(--border)}
.ls-faq p{margin-top:8px;color:var(--muted)}
.ls-visit{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,400px);gap:40px;align-items:start}
.ls-locs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;margin-top:20px}
.ls-locs article{padding:18px;display:grid;gap:4px}
@media (max-width:1024px){.ls-intro,.ls-two,.ls-visit,.ls-faq{grid-template-columns:minmax(0,1fr);gap:24px}.ls-grid{grid-template-columns:minmax(0,1fr)}.ls-map{position:static;order:-1}.ls-mapbox{aspect-ratio:16/7}.ls-team{grid-template-columns:repeat(2,minmax(0,1fr))}.ls-track{grid-template-columns:repeat(2,minmax(0,1fr))}.ls-track li::after{display:none}}
@media (max-width:760px){.ls-top{padding:28px 0 20px}.ls-h1{font-size:calc(34px * var(--hs))}.ls-search{grid-template-columns:minmax(0,1fr)}.ls-item{grid-template-columns:minmax(0,1fr)}.ls-th{min-height:0;aspect-ratio:16/10}.ls-svc,.ls-team,.ls-track,.ls-locs{grid-template-columns:minmax(0,1fr)}.ls-mapbox{aspect-ratio:4/3}}
</style>`;
const listing = (p, st, c) => K.page(st, `${alert(c)}<header class="sk-nav ls-bar"><div class="sk-wrap"><a class="logo" href="#"><b></b>${esc(p.name)}</a>${navLinks(c)}<div class="sk-navend"><a class="btn primary" href="#visit">${esc(c.hero.cta)}</a></div>${menu(c)}</div></header>
<main class="ls">
<section class="ls-top"><div class="sk-wrap ls-intro"><div class="sk-stack"><span class="sk-eyebrow">${esc(c.hero.eyebrow)}</span><h1 class="ls-h1">${esc(c.hero.h1)}</h1><p class="sk-lede">${esc(c.hero.lede)}</p></div>
<form class="card ls-search" aria-label="Search listings"><div class="sk-field"><label for="s-where">Where</label><input class="sk-input" id="s-where" name="where" type="text" placeholder="${esc(c.index.items[0])}"></div><div class="sk-field"><label for="s-type">Type</label><select class="sk-input" id="s-type" name="type"><option>Any</option>${[...new Set(c.listings.items.map((x) => x.specs[0]))].map((x) => `<option>${esc(x)}</option>`).join("")}</select></div><button class="btn primary" type="submit">${esc(c.hero.alt)}</button></form></div>
<div class="sk-wrap"><ul class="ls-chips">${c.index.items.slice(0, 8).map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div></section>
<section id="listings"><div class="sk-wrap ls-grid"><div><div class="ls-count"><span class="sk-eyebrow">${esc(c.listings.eyebrow)}</span><b>${esc(c.listings.h2)}</b><span class="muted">${esc(c.listings.lede)}</span></div><div class="ls-list">${c.listings.items.map((x, i) => `<article class="card ls-item"><div class="sk-photo ls-th">${prop(x.kind, 320, 240, i, `${x.t}, ${x.area}`)}</div><div class="ls-body"><span class="ls-tag">${esc(x.tag)}</span><b class="ls-price">${esc(x.price)}</b><h3 class="sk-h3">${esc(x.t)}</h3><p class="muted">${esc(x.area)}</p><ul class="ls-specs">${x.specs.map((s) => `<li>${esc(s)}</li>`).join("")}</ul></div><span class="ls-pin">${i + 1}</span></article>`).join("")}</div></div>
<aside class="ls-map"><div class="sk-photo ls-mapbox">${mapSvg(c, 460, 720)}</div><p class="muted ls-mapnote">The map is an illustration. Each pin matches a numbered listing.</p></aside></div></section>
<section class="sk-sec sk-alt" id="services"><div class="sk-wrap"><div class="sk-head"><div><span class="sk-eyebrow">${esc(c.services.eyebrow)}</span><h2 class="sk-h2">${esc(c.services.h2)}</h2></div><p class="muted">${esc(c.services.lede)}</p></div><div class="ls-svc">${c.services.items.map((s) => `<article><span class="ls-ico">${ic(s.icon, 20)}</span><h3 class="sk-h3">${esc(s.t)}</h3><p class="muted">${esc(s.d)}</p><p class="ls-who">Suits: ${esc(s.who)}</p></article>`).join("")}</div></div></section>
<section class="sk-sec" id="process"><div class="sk-wrap"><div class="sk-head"><div><h2 class="sk-h2">${esc(c.process.h2)}</h2></div><p class="muted">${esc(c.process.lede)}</p></div><ol class="ls-track">${c.process.steps.map((s) => `<li><b>${esc(s.t)}</b><span class="muted">${esc(s.d)}</span></li>`).join("")}</ol></div></section>
<section class="sk-sec sk-alt"><div class="sk-wrap ls-two"><aside class="card ls-aud"><span class="sk-eyebrow">${esc(c.audience.eyebrow)}</span><h2 class="sk-h2">${esc(c.audience.h2)}</h2><p class="muted">${esc(c.audience.lede)}</p><ul>${c.audience.points.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></aside><div><h2 class="sk-h2">${esc(c.table.h2)}</h2><p class="muted" style="margin:8px 0 16px">${esc(c.table.lede)}</p><table class="ls-t"><thead><tr>${c.table.cols.map((h) => `<th scope="col">${esc(h)}</th>`).join("")}</tr></thead><tbody>${c.table.rows.map((r) => `<tr>${r.map((x) => `<td>${esc(x)}</td>`).join("")}</tr>`).join("")}</tbody></table>${c.table.note ? `<p class="muted" style="margin-top:10px;font-size:13px">${esc(c.table.note)}</p>` : ""}</div></div></section>
<section class="sk-sec" id="team"><div class="sk-wrap"><div class="sk-head"><div><h2 class="sk-h2">${esc(c.team.h2)}</h2></div><p class="muted">${esc(c.team.lede)}</p></div><div class="ls-team">${c.team.people.map((m) => `<article><span class="avatar">${esc(initials(m.n))}</span><b>${esc(m.n)}</b><span class="muted">${esc(m.r)}</span></article>`).join("")}</div></div></section>
<section class="sk-sec sk-alt" id="faq"><div class="sk-wrap ls-faq"><div class="sk-stack"><h2 class="sk-h2">${esc(c.faq.h2)}</h2><p class="muted">${esc(c.statement)}</p></div><div>${faqItems(c)}</div></div></section>
<section class="sk-sec" id="visit"><div class="sk-wrap ls-visit"><div><h2 class="sk-h2">${esc(c.visit.h2)}</h2><p class="sk-lede">${esc(c.visit.lede)}</p><div class="ls-locs">${c.visit.locations.map((l) => `<article class="card"><b>${esc(l.n)}</b><span>${esc(l.addr)}</span><span class="muted">${esc(l.hours)}</span><span>${esc(l.phone)}</span></article>`).join("")}</div></div>${contactForm(c)}</div></section>
</main>${notice(c)}${foot(p, c)}`, BASE + listingCss);

// ---- showcase: one home first. Full-width drawing with an overlaid intro card, a fact strip, a floor plan, a listing mosaic, a dark close ----
const showcaseCss = `<style>
.sc-bar{background:var(--text);color:var(--bg);border-bottom:0}
.sc-bar .sk-links{color:inherit;opacity:.85}
.sc-bar .logo b{background:var(--bg)}
.sc-bar .btn{background:var(--bg);color:var(--text);border-color:var(--bg)}
.sc-bar .sk-menu summary{border-color:color-mix(in oklab,var(--bg) 40%,transparent)}
.sc-hero{display:grid}
.sc-hero>*{grid-area:1/1}
.sc-img{border-radius:0;aspect-ratio:1440/640}
.sc-over{align-self:end;padding-bottom:40px;display:flex;justify-content:flex-start;position:relative;z-index:1}
.sc-card{max-width:560px;padding:32px;display:grid;gap:14px;box-shadow:var(--shadow-lg)}
.sc-h1{font-size:calc(50px * var(--hs));line-height:1.04}
.sc-strip{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:32px;padding-top:40px;padding-bottom:40px}
.sc-strip>div{display:grid;gap:6px;border-left:3px solid var(--primary);padding-left:18px}
.sc-strip b{font:var(--hw) calc(22px * var(--hs))/1.2 var(--font-h)}
.sc-feat{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);gap:52px;align-items:center}
.sc-plan{border:1px solid var(--border);border-radius:var(--radius-lg);overflow:hidden;background:var(--bg)}
.sc-plan>svg{display:block;width:100%;height:auto}
.sc-price{font:var(--hw) calc(32px * var(--hs))/1.1 var(--font-h);color:color-mix(in oklab,var(--primary) 80%,var(--text))}
.sc-rooms{width:100%;border-collapse:collapse;margin:8px 0 18px}
.sc-rooms th,.sc-rooms td{text-align:left;padding:10px 0;border-bottom:1px solid var(--border)}
.sc-rooms th{font-weight:600}
.sc-rooms td{color:var(--muted);text-align:right}
.sc-mosaic{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));grid-auto-rows:220px;gap:14px}
.sc-tile{position:relative;overflow:hidden;border-radius:var(--radius-lg);display:grid}
.sc-tile>*{grid-area:1/1}
.sc-tile .sk-photo{border-radius:0;height:100%}
.sc-tile:first-child{grid-column:span 2;grid-row:span 2}
.sc-tile:nth-child(6){grid-column:span 4}
.sc-cap{position:relative;z-index:1;align-self:end;margin:12px;padding:12px 14px;border-radius:var(--radius);background:color-mix(in oklab,var(--bg) 90%,transparent);display:grid;gap:2px;font-size:13.5px}
.sc-cap b{font-size:16px}
.sc-quote{padding:88px 0;text-align:center}
.sc-quote p{font:var(--hw) calc(38px * var(--hs))/1.18 var(--font-h);max-width:900px;margin:0 auto}
.sc-svc{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:36px 40px;counter-reset:v}
.sc-svc article{counter-increment:v;display:grid;gap:8px;align-content:start}
.sc-svc article::before{content:counter(v,decimal-leading-zero);font:var(--hw) calc(44px * var(--hs))/1 var(--font-h);color:color-mix(in oklab,var(--primary) 70%,var(--text))}
.sc-time{list-style:none;position:relative;display:grid;gap:28px;max-width:900px;margin:0 auto}
.sc-time::before{content:"";position:absolute;left:50%;top:0;bottom:0;width:2px;background:var(--border)}
.sc-time li{width:calc(50% - 36px);display:grid;gap:6px;position:relative;padding:20px 22px;background:var(--bg);border:1px solid var(--border);border-radius:var(--radius-lg)}
.sc-time li:nth-child(even){margin-left:auto}
.sc-team{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:20px}
.sc-team article{display:grid;gap:6px}
.sc-team .avatar{width:100%;height:auto;aspect-ratio:4/5;border-radius:var(--radius-lg);font:var(--hw) calc(40px * var(--hs))/1 var(--font-h)}
.sc-faq{max-width:780px;margin:0 auto}
.sc-faq details{padding:16px 0;border-bottom:1px solid var(--border)}
.sc-faq summary{font-size:17px}
.sc-faq p{margin-top:8px;color:var(--muted)}
.sc-end{background:var(--text);color:var(--bg);padding:84px 0}
.sc-end .muted{color:inherit;opacity:.75}
.sc-end .btn{background:var(--bg);color:var(--text);border-color:var(--bg)}
.sc-endgrid{display:grid;grid-template-columns:minmax(0,1.2fr) repeat(2,minmax(0,1fr));gap:40px;align-items:start}
.sc-loc{display:grid;gap:4px;padding-top:14px;border-top:1px solid color-mix(in oklab,var(--bg) 35%,transparent)}
@media (max-width:1024px){.sc-feat,.sc-endgrid{grid-template-columns:minmax(0,1fr);gap:32px}.sc-svc{grid-template-columns:repeat(2,minmax(0,1fr))}.sc-team{grid-template-columns:repeat(2,minmax(0,1fr))}.sc-mosaic{grid-template-columns:repeat(2,minmax(0,1fr))}.sc-tile:nth-child(6){grid-column:span 2}}
@media (max-width:760px){.sc-hero{display:block}.sc-img{aspect-ratio:4/3}.sc-over{padding:0;margin-top:-28px}.sc-card{padding:22px;max-width:none;margin:0}.sc-h1{font-size:calc(34px * var(--hs))}.sc-strip,.sc-svc{grid-template-columns:minmax(0,1fr);gap:18px}.sc-mosaic{grid-template-columns:minmax(0,1fr);grid-auto-rows:240px}.sc-tile:first-child,.sc-tile:nth-child(6){grid-column:span 1;grid-row:span 1}.sc-quote{padding:52px 0}.sc-quote p{font-size:calc(26px * var(--hs))}.sc-time::before{left:8px}.sc-time li,.sc-time li:nth-child(even){width:auto;margin-left:28px}.sc-team{grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.sc-end{padding:52px 0}}
</style>`;
const showcase = (p, st, c) => { const hero = c.listings.items.find((x) => ["villa", "house", "cabin", "tower", "flat"].includes(x.kind)) || c.listings.items[0];
  return K.page(st, `${alert(c)}${K.nav(p, [], c.hero.cta, null).replace('class="sk-nav"', 'class="sk-nav sc-bar"').replace('<nav class="sk-links" aria-label="Main"></nav>', navLinks(c)).replace('href="#' + K.slug(c.hero.cta) + '"', 'href="#visit"')}
<main class="sc">
<section class="sc-hero"><div class="sk-photo sc-img">${prop(hero.kind, 1440, 640, 1, `${hero.t}, ${hero.area}`)}</div><div class="sk-wrap sc-over"><div class="card sc-card"><span class="sk-eyebrow">${esc(c.hero.eyebrow)}</span><h1 class="sc-h1">${esc(c.hero.h1)}</h1><p class="muted">${esc(c.hero.lede)}</p><div class="sk-row"><a class="btn primary sk-btn-lg" href="#visit">${esc(c.hero.cta)}</a><a class="btn sk-btn-lg" href="#listings">${esc(c.hero.alt)}</a></div></div></div></section>
<section class="sk-wrap sc-strip">${c.facts.map((f) => `<div><b>${esc(f.t)}</b><span class="muted">${esc(f.d)}</span></div>`).join("")}</section>
<section class="sk-sec sk-alt" id="feature"><div class="sk-wrap sc-feat"><div class="sc-plan">${planSvg(c, 540, 380)}</div><div class="sk-stack"><span class="sk-eyebrow">${esc(c.feature.eyebrow)}</span><h2 class="sk-h2">${esc(c.feature.t)}</h2><p class="sc-price">${esc(c.feature.price)}</p><p class="muted">${esc(c.feature.lede)}</p><table class="sc-rooms"><tbody>${c.feature.rooms.map(([a, b]) => `<tr><th scope="row">${esc(a)}</th><td>${esc(b)}</td></tr>`).join("")}</tbody></table><a class="btn primary" href="#visit">${esc(c.hero.cta)}</a></div></div></section>
<section class="sk-sec" id="listings"><div class="sk-wrap"><div class="sk-head"><div><span class="sk-eyebrow">${esc(c.listings.eyebrow)}</span><h2 class="sk-h2">${esc(c.listings.h2)}</h2></div><p class="muted">${esc(c.listings.lede)}</p></div><div class="sc-mosaic">${c.listings.items.map((x, i) => `<article class="sc-tile"><div class="sk-photo">${prop(x.kind, i === 0 ? 720 : 400, i === 0 ? 460 : 260, i + 2, `${x.t}, ${x.area}`)}</div><div class="sc-cap"><b>${esc(x.price)}</b><span>${esc(x.t)}, ${esc(x.area)}</span><span class="muted">${esc(x.specs.join(" · "))} · ${esc(x.tag)}</span></div></article>`).join("")}</div></div></section>
<section class="sc-quote sk-alt"><div class="sk-wrap"><p>${esc(c.statement)}</p></div></section>
<section class="sk-sec" id="services"><div class="sk-wrap"><div class="sk-head"><div><span class="sk-eyebrow">${esc(c.services.eyebrow)}</span><h2 class="sk-h2">${esc(c.services.h2)}</h2></div><p class="muted">${esc(c.services.lede)}</p></div><div class="sc-svc">${c.services.items.map((s) => `<article><h3 class="sk-h3">${esc(s.t)}</h3><p class="muted">${esc(s.d)}</p></article>`).join("")}</div></div></section>
<section class="sk-sec sk-alt" id="process"><div class="sk-wrap"><div class="sk-head"><div><h2 class="sk-h2">${esc(c.process.h2)}</h2></div><p class="muted">${esc(c.process.lede)}</p></div><ol class="sc-time">${c.process.steps.map((s) => `<li><b>${esc(s.t)}</b><span class="muted">${esc(s.d)}</span></li>`).join("")}</ol></div></section>
<section class="sk-sec" id="team"><div class="sk-wrap"><div class="sk-head"><div><h2 class="sk-h2">${esc(c.team.h2)}</h2></div><p class="muted">${esc(c.team.lede)}</p></div><div class="sc-team">${c.team.people.map((m) => `<article><span class="avatar">${esc(initials(m.n))}</span><h3 class="sk-h3">${esc(m.n)}</h3><p class="muted">${esc(m.r)}</p></article>`).join("")}</div></div></section>
<section class="sk-sec sk-alt" id="faq"><div class="sk-wrap sc-faq"><h2 class="sk-h2">${esc(c.faq.h2)}</h2>${faqItems(c)}</div></section>
<section class="sc-end" id="visit"><div class="sk-wrap sc-endgrid"><div class="sk-stack"><h2 class="sk-h2">${esc(c.cta.h2)}</h2><p class="muted">${esc(c.cta.lede)}</p><a class="btn sk-btn-lg" href="#">${esc(c.hero.cta)}</a></div>${c.visit.locations.map((l) => `<div class="sc-loc"><b>${esc(l.n)}</b><span>${esc(l.addr)}</span><span class="muted">${esc(l.hours)}</span><span>${esc(l.phone)}</span></div>`).join("")}</div></section>
</main>${notice(c)}${foot(p, c)}`, BASE + showcaseCss); };

const LAYOUTS = {
  atlas: { fn: atlas, style: "corporate", name: "Atlas", about: "split hero with a next-step card, card grids and a contact form" },
  folio: { fn: folio, style: "editorial", name: "Folio", about: "magazine layout: centred masthead, large type, numbered contents, ruled lists, no cards" },
  ledger: { fn: ledger, style: "minimal", name: "Ledger", about: "information first: fixed sidebar with hours and phone, tables and a timeline in the main column" },
  bento: { fn: bento, style: "playful", name: "Bento", about: "tile mosaic for the hero and services, floating pill navigation, rounded and friendly" },
  band: { fn: band, style: "retro", name: "Band", about: "full-width colour bands, an oversized headline, sticky section titles, large numbered steps" },
  concierge: { fn: concierge, style: "luxury", name: "Concierge", about: "task first: three doors in the hero, services as an accordion, one quiet column" },
  // property layouts: only for content with listings and a featured home (real estate)
  listing: { fn: listing, style: "monochrome", name: "Listing", about: "search first: a search panel and area chips, listing cards beside a sticky map with numbered pins", needs: "listings" },
  showcase: { fn: showcase, style: "brutalist", name: "Showcase", about: "one home first: a full-width drawing with an intro card, a floor plan with room sizes, a listing mosaic and a dark close", needs: "listings" },
};
module.exports = { LAYOUTS, GLYPH, prop };
