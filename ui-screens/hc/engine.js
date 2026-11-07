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

const LAYOUTS = {
  atlas: { fn: atlas, style: "corporate", name: "Atlas", about: "split hero with a next-step card, card grids and a contact form" },
  folio: { fn: folio, style: "editorial", name: "Folio", about: "magazine layout: centred masthead, large type, numbered contents, ruled lists, no cards" },
  ledger: { fn: ledger, style: "minimal", name: "Ledger", about: "information first: fixed sidebar with hours and phone, tables and a timeline in the main column" },
  bento: { fn: bento, style: "playful", name: "Bento", about: "tile mosaic for the hero and services, floating pill navigation, rounded and friendly" },
  band: { fn: band, style: "retro", name: "Band", about: "full-width colour bands, an oversized headline, sticky section titles, large numbered steps" },
  concierge: { fn: concierge, style: "luxury", name: "Concierge", about: "task first: three doors in the hero, services as an accordion, one quiet column" },
};
module.exports = { LAYOUTS, GLYPH };
