// /ui/website-templates hub features (owner-approved 28-Nov-2026): colour and heading-font filters with live counts, removable active-filter chips,
// curated rows (rules-based, deterministic) and "Best <use case> website templates" collection pages at flat /ui/<slug> URLs.
//
// Data: nothing new is stored. Both new facets come from columns the UI rows already carry, which are copies of the DESIGN.md tokens:
//   - items.palette = the DESIGN.md light-theme colour roles in ROLES order (background, surface, border, text, muted, primary, on-primary, accent),
//     written by ui-screens/ingest.py from the same tokens object that builds the DESIGN.md (checked live 28-Nov: primary/accent/background match).
//   - items.style picks the type pair: every generator (ui-screens/gen.js, gen_hc.js) takes headingFont/bodyFont from STYLES[style].hf/.bf in
//     ui-screens/lib.js, and the DESIGN.md typography block is built from those two (tests/test_hub_facets.mjs parses lib.js to keep STYLE_FONTS equal).
// So the facets are computed per request from the cached UI rows (uiAllRows), like the existing style/platform facets. No migration, no backfill.
//
// Imports only ui_tree / ui_templates / ui_seo (never ui_screens, which imports this file). ui_screens passes its helpers in `F`.
import { INDUSTRIES, nicheOfPattern, liveDesigns, homeCategory, categoryPath, nichePath, TEMPLATES_HUB } from "./ui_tree.js";
import { crumbLd, TEMPLATES_CRUMB, nicheCss } from "./ui_templates.js";
import COPY from "./tpl_collections.json"; // collection + row copy (user-facing; owner picks between the options in the hand-off)

// ---- Colour family -------------------------------------------------------------------------------------------------------------
// Rules (deterministic, documented for the owner):
//   1. Convert primary (role 6) to HSL. The accent (role 8) is NOT used: owner pick 28-Nov-2026, the filter is the main colour only.
//   2. Achromatic: saturation < 0.15, or lightness < 0.10, or lightness > 0.93 → "black" when lightness < 0.5, else "white".
//   3. Brown & gold: hue 15–50° and (saturation < 0.40, or lightness < 0.36, or lightness < 0.45 with saturation < 0.65) → "brown" (dark, dusty or bronze oranges and golds).
//   4. Otherwise by hue: red < 15° or ≥ 345°, orange 15–42°, yellow 42–70°, green 70–165°, teal 165–195°, blue 195–255°, purple 255–290°, pink 290–345°.
//   5. A template gets its primary's family (one hue family, or black/white), plus at most one background tone from rule 6.
//   6. Background (role 1) tone, by chroma (max − min channel, 0–1): "white" when lightness ≥ 0.90 and chroma ≤ 0.03 (near-neutral);
//      "pastel" when lightness ≥ 0.85 and chroma ≥ 0.04 (visibly tinted) and not a cream (hue 20–60°, which reads as warm white).
export const COLOURS = [["red", "Red", "#d33a3a"], ["orange", "Orange", "#ea7a1f"], ["yellow", "Yellow", "#e5bd1c"], ["green", "Green", "#3a9a48"],
  ["teal", "Teal", "#14968f"], ["blue", "Blue", "#2f6fd6"], ["purple", "Purple", "#7b4fd0"], ["pink", "Pink", "#d6478f"], ["brown", "Brown & gold", "#8a6235"],
  ["black", "Black", "#161616"], ["white", "White", "#ffffff"], ["pastel", "Pastel", "#f3d9ea"]];
const COLOUR_IDS = COLOURS.map((c) => c[0]);
export function hexToHsl(hex) {
  let x = String(hex || "").trim().replace(/^#/, ""); if (/^[0-9a-f]{3}$/i.test(x)) x = x.replace(/./g, "$&$&"); if (!/^[0-9a-f]{6}$/i.test(x)) return null;
  const n = parseInt(x, 16), r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
  let h = 0, s = 0; if (d) { s = d / (1 - Math.abs(2 * l - 1)); h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h = (h * 60 + 360) % 360; }
  return { h, s, l };
}
export function hueFamily(hex) {
  const c = hexToHsl(hex); if (!c) return null; const { h, s, l } = c;
  if (s < 0.15 || l < 0.1 || l > 0.93) return l < 0.5 ? "black" : "white";
  if (h >= 15 && h < 50 && (s < 0.4 || l < 0.36 || (l < 0.45 && s < 0.65))) return "brown";
  if (h < 15 || h >= 345) return "red"; if (h < 42) return "orange"; if (h < 70) return "yellow"; if (h < 165) return "green"; if (h < 195) return "teal"; if (h < 255) return "blue"; if (h < 290) return "purple"; return "pink";
}
export function bgTone(hex) {
  const c = hexToHsl(hex); if (!c) return null;
  const chroma = c.s * (1 - Math.abs(2 * c.l - 1)); // HSL saturation blows up near white; chroma (max − min channel) does not
  if (c.l >= 0.9 && chroma <= 0.03) return "white";
  if (c.l >= 0.85 && chroma >= 0.04 && !(c.h >= 20 && c.h < 60)) return "pastel";
  return null;
}
// palette: the D1 JSON string or the parsed array (rowToItem). Returns [primary family, background tone?].
export function colourFamilies(palette) {
  let p = palette; if (typeof p === "string") { try { p = JSON.parse(p); } catch (_) { p = []; } } if (!Array.isArray(p) || p.length < 8) return [];
  const out = [], add = (f) => { if (f && !out.includes(f)) out.push(f); };
  add(hueFamily(p[5])); add(bgTone(p[0])); // main (primary) colour only: owner pick 28-Nov (the accent is not a facet)
  return out;
}

// ---- Fonts ---------------------------------------------------------------------------------------------------------------------
// Heading and body font per style, the same pairs as STYLES in ui-screens/lib.js (the DESIGN.md typography tokens come from them).
export const STYLE_FONTS = { minimal: ["Inter", "Inter"], editorial: ["Instrument Serif", "Inter"], brutalist: ["Space Grotesk", "Space Grotesk"],
  luxury: ["Cormorant Garamond", "Manrope"], playful: ["Fredoka", "Nunito"], corporate: ["IBM Plex Sans", "IBM Plex Sans"], retro: ["Fraunces", "DM Sans"], monochrome: ["Geist", "Geist"] };
// Our font pairing guides (WordPress, same origin). Every URL checked live 28-Nov-2026 with curl/8.4.0: 200, no redirect. Inter and Space Grotesk use the
// singular "-font-pairing" slug; Manrope has no guide (404), so it gets no link. Add a font here only after checking its page.
export const FONT_GUIDES = { "Inter": "/inter-font-pairing/", "Instrument Serif": "/instrument-serif-font-pairings/", "Space Grotesk": "/space-grotesk-font-pairing/",
  "Cormorant Garamond": "/cormorant-garamond-font-pairings/", "Fredoka": "/fredoka-font-pairings/", "IBM Plex Sans": "/ibm-plex-sans-font-pairings/",
  "Fraunces": "/fraunces-font-pairings/", "Geist": "/geist-font-pairings/", "Nunito": "/nunito-font-pairings/", "DM Sans": "/dm-sans-font-pairings/" };
export const fontSlug = (f) => String(f || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export const fontsOf = (style) => { const f = STYLE_FONTS[style]; return f ? { heading: f[0], body: f[1] } : { heading: null, body: null }; };
export const FONTS_TOP = 15; // font chips shown before "more"
export const COLOUR_MIN = 12; // a colour swatch shows once this many desktop templates have it (28-Nov: Pastel has 6, so it is hidden until more exist)

// ---- Template rows -------------------------------------------------------------------------------------------------------------
// F = { pagePatterns, fields(row) → uiFields, itemPath(it, base), label(id) } from ui_screens.
const variantOf = (r, F) => F.fields(r).variant || "homepage";
export function tplEnrich(r, F) {
  const pattern = r.category, n = nicheOfPattern(pattern), variant = variantOf(r, F), ff = F.fields(r);
  const d = n ? liveDesigns(n).find((x) => (x.variant || "homepage") === variant && x.style === r.style) : null;
  const pal = typeof r.palette === "string" ? r.palette : JSON.stringify(r.palette || []);
  return { r, id: r.id, pattern, variant, style: r.style, niche: n, industry: n ? n.industry : null, design: d || null, distinct: !!d,
    colours: colourFamilies(pal), font: fontsOf(r.style), created: +r.created_at || 0, image: `/img/${r.image_key}`, image_dark: ff.image_dark, width: r.width, height: r.height,
    path: (base) => F.itemPath({ id: r.id, ...ff, style: r.style }, base) };
}
// The "design set" used by rows and collections: the web screen of every catalogued distinct design (what the sub-niche pages show) plus the web
// screens of the flat template patterns that have no sub-niche (SaaS, AI, ecommerce…). Older non-distinct style variants inside a niche are left out.
export function tplDesigns(rows, F) {
  return rows.filter((r) => r.country === "web" && F.pagePatterns.includes(r.category)).map((r) => tplEnrich(r, F)).filter((t) => t.distinct || !t.niche);
}
const keyIndustry = (t) => t.industry || t.pattern;
const keyNiche = (t) => (t.niche ? t.niche.id : t.pattern);
const byNewest = (a, b) => b.created - a.created || (a.id < b.id ? -1 : 1);
const rank = (list, v) => { const i = list.indexOf(v); return i < 0 ? list.length : i; };
// Round-robin over groups (first appearance order), at most perKey from each group, n in all. perKey may be a function of the key.
export function roundRobin(list, keyFn, n, perKey = 1) {
  const groups = new Map(); for (const t of list) { const k = keyFn(t); if (!groups.has(k)) groups.set(k, []); groups.get(k).push(t); }
  const cap = (k) => (typeof perKey === "function" ? perKey(k) : perKey), out = [];
  for (let round = 0; out.length < n; round++) { let took = false; for (const [k, g] of groups) { if (round < cap(k) && g[round]) { out.push(g[round]); took = true; if (out.length >= n) break; } } if (!took) break; }
  return out;
}
// Diverse pick (rows and collections): repeatedly take the earliest item in the rule's order whose sub-niche/industry group (keyFn), layout and
// style have been used least so far (group weighs most), never more than perKey from a group. Deterministic: same list in, same picks out.
export function diversePick(list, keyFn, n, perKey = 1) {
  const cap = (k) => (typeof perKey === "function" ? perKey(k) : perKey), used = new Map(), bump = (k) => used.set(k, (used.get(k) || 0) + 1), u = (k) => used.get(k) || 0;
  const left = list.slice(), out = [];
  while (out.length < n && left.length) {
    let best = -1, bestScore = Infinity;
    for (let i = 0; i < left.length; i++) { const t = left[i], g = keyFn(t); if (u("g:" + g) >= cap(g)) continue; const sc = u("g:" + g) * 100 + u("v:" + t.variant) * 10 + u("s:" + t.style) * 10; if (sc < bestScore) { bestScore = sc; best = i; if (!sc) break; } }
    if (best < 0) break; const t = left.splice(best, 1)[0]; out.push(t); bump("g:" + keyFn(t)); bump("v:" + t.variant); bump("s:" + t.style);
  }
  return out;
}
const vividOnDark = (t) => { let p = t.r.palette; try { p = typeof p === "string" ? JSON.parse(p) : p; } catch (_) { p = []; } const c = hexToHsl((p || [])[5]); return c ? c.s * (1 - Math.abs(c.l - 0.5) * 2) : 0; };
const byDarkScore = (a, b) => vividOnDark(b) - vividOnDark(a) || (a.id < b.id ? -1 : 1);

// ---- Curated rows on the hub ---------------------------------------------------------------------------------------------------
// Rules (all deterministic; ties broken by id):
//   (each row then takes a diverse pick, see diversePick: spread over groups first, then over layouts and styles)
//   new:      designs added in the 7 days before the newest design (not "now", so a cached page and the tests agree), newest first, one per sub-niche, 12.
//   dark:     designs with a dark screenshot, most vivid primary first (saturation × closeness to mid lightness), one per industry per round, 10; dark shots.
//   bold:     band, folio or index layouts (oversized headlines, large type, name as masthead) in brutalist, editorial, retro or monochrome, newest first, one per industry, 12.
//   starters: the general-purpose layouts (atlas: split hero, card grids, contact form; ledger: hours sidebar; concierge: three doors), atlas first, one per industry, 12.
const DAY = 864e5;
export const ROW_RULES = {
  new: (D) => { const top = Math.max(0, ...D.map((t) => t.created)); return diversePick(D.filter((t) => t.created >= top - 7 * DAY).sort(byNewest), keyNiche, 12, 1); },
  dark: (D) => diversePick(D.filter((t) => t.image_dark).sort(byDarkScore), keyIndustry, 10, 1),
  bold: (D) => diversePick(D.filter((t) => ["band", "folio", "index"].includes(t.variant) && ["brutalist", "editorial", "retro", "monochrome"].includes(t.style)).sort(byNewest), keyIndustry, 12, 1),
  starters: (D) => diversePick(D.filter((t) => ["atlas", "ledger", "concierge"].includes(t.variant)).sort(V(["atlas", "ledger", "concierge"])), keyIndustry, 12, 1),
};
export const ROW_ORDER = ["new", "dark", "bold", "starters"];
const ROW_MIN = 4;
const e2 = (h) => h.escHtml;
const thumb = (base, image) => `${base}/img/t/${String(image || "").replace(/^\/img\//, "")}?src=app`;
const nicheShort = (t, F) => (t.niche ? t.niche.label : F.label(t.pattern)).replace(/ website$/i, "").replace(/ landing page$/i, "");
const layoutName = (t, F) => (t.design && t.design.layoutName) || F.label(t.variant);
const cap1 = (s) => String(s || "").charAt(0).toUpperCase() + String(s || "").slice(1);
function rowCard(t, base, h, F, dark) {
  const e = e2(h), src = dark ? base + t.image_dark : thumb(base, t.image);
  return `<a class="rc" href="${e(t.path(base))}"><span class="ri${dark ? " dk" : ""}"><img loading="lazy" decoding="async" width="320" height="200" src="${e(src)}" alt=""/></span><span class="rl">${e(nicheShort(t, F))} · ${e(layoutName(t, F))}</span><span class="rs">${e(cap1(t.style))}${dark ? " · dark" : ""}</span></a>`;
}
export function curatedRows(D, base, h, F) {
  const e = e2(h), R = COPY.rows || {};
  return ROW_ORDER.map((k) => {
    const picks = ROW_RULES[k](D); if (picks.length < ROW_MIN) return "";
    const c = R[k] || {}, see = c.see && COLLECTION_BY_SLUG[c.see] && collectionPicks(COLLECTION_BY_SLUG[c.see], D).length >= COLLECTION_MIN ? `<a class="rsee" href="${e(base)}/ui/${e(c.see)}">${e(c.seeLabel || "See all")}</a>` : "";
    return `<section class="crow" aria-label="${e(c.title)}"><div class="rh"><h2>${e(c.title)}</h2>${see}</div><p class="rd">${e(c.sub || "")}</p><div class="rr">${picks.map((t) => rowCard(t, base, h, F, k === "dark")).join("")}</div></section>`;
  }).join("");
}
// Crawlable strip of the live collections (hub + collection pages).
export function collectionsStrip(D, base, h, except) {
  const e = e2(h), live = COLLECTIONS.filter((c) => c !== except && collectionPicks(c, D).length >= COLLECTION_MIN);
  return live.length ? `<nav class="cstrip" aria-label="Template collections"><b>${e(COPY.stripTitle || "Best templates for")}</b>${live.map((c) => `<a class="chip" href="${e(base)}/ui/${e(c.slug)}">${e(c.label)}</a>`).join("")}</nav>` : "";
}

// ---- Hub filters ---------------------------------------------------------------------------------------------------------------
// Card data attributes for the in-page filter: colour families (space separated) and the heading font slug.
export const hubCardAttrs = (it, h) => ` data-colour="${e2(h)(colourFamilies(it.palette).join(" "))}" data-font="${e2(h)(fontSlug(fontsOf(it.style).heading))}"`;
// URL params on the hub (secondary filters, like ?device= and ?style=): ?colour=<family>&font=<font-slug>. Never WP-reserved names; values are [a-z-] slugs.
export const HUB_PARAMS = { platform: "device", style: "style", colour: "colour", font: "font" };
export function hubHref(base, s) {
  const q = new URLSearchParams(); if (s.platform && s.platform !== "web") q.set("device", s.platform);
  for (const k of ["style", "colour", "font"]) if (s[k]) q.set(k, s[k]);
  const qs = q.toString(); return `${base}/ui/${TEMPLATES_HUB}${qs ? "?" + qs : ""}`;
}
// Colour swatches + heading-font chips (with counts over the desktop templates), for the hub's "Filters" fold.
export function hubFacetRows(webItems, base, h) {
  const e = e2(h), cc = {}, fc = {}, body = {};
  for (const it of webItems) { for (const f of colourFamilies(it.palette)) cc[f] = (cc[f] || 0) + 1; const fo = fontsOf(it.style); if (fo.heading) { fc[fo.heading] = (fc[fo.heading] || 0) + 1; body[fo.heading] = fo.body; } }
  const chip = (k, v, inner, n, extra = "") => `<a class="chip${k === "colour" ? " sw" : ""}" data-f="${k}" data-v="${e(v)}" href="${e(hubHref(base, { [k]: v }))}" rel="nofollow" aria-pressed="false"${extra}>${inner}<span class="n">${n}</span></a>`;
  const colours = COLOURS.filter(([id]) => (cc[id] || 0) >= COLOUR_MIN).map(([id, lab, hex]) => chip("colour", id, `<i style="background:${hex}"></i>${e(lab)}`, cc[id])).join("");
  const fonts = Object.keys(fc).sort((a, b) => fc[b] - fc[a] || a.localeCompare(b));
  const fchip = (f) => chip("font", fontSlug(f), e(f), fc[f], ` title="${e(`${f} headings${body[f] && body[f] !== f ? `, ${body[f]} body text` : ", same font for body text"}`)}"`);
  const top = fonts.slice(0, FONTS_TOP), rest = fonts.slice(FONTS_TOP);
  const guides = fonts.filter((f) => FONT_GUIDES[f]).map((f) => `<a href="${e(FONT_GUIDES[f])}">${e(f)}</a>`).join(" · ");
  return `<div class="crow-f"><b title="The main (primary) colour of the template">Colour</b>${chip("colour", "", "All", webItems.length).replace(' rel="nofollow" aria-pressed="false"', ' aria-pressed="true"')}${colours}</div>`
    + `<div><b>Heading font</b>${chip("font", "", "All", webItems.length).replace(' rel="nofollow" aria-pressed="false"', ' aria-pressed="true"')}${top.map(fchip).join("")}${rest.length ? `<span class="fmore" hidden>${rest.map(fchip).join("")}</span><button type="button" class="chip" data-more>+${rest.length} more</button>` : ""}</div>`
    + (guides ? `<p class="fguide">Font pairing guides: ${guides}</p>` : "");
}
// Active filters (removable chips) + "Clear all" + the live result count, between the fold and the grid.
export const hubActiveBar = (n) => `<div class="active" id="active" hidden></div><p class="lede" id="count" data-word="template" style="margin:0 0 .5rem">Showing ${n} templates</p>`;
// Labels the script shows on active chips (filled from the page's own chips, so nothing is duplicated here).
export const HUB_JS = (base, page) => `<script>
(function(){var B=${JSON.stringify(base)},PAGE=${page || 48},shown=PAGE,P=${JSON.stringify(HUB_PARAMS)},K=["platform","style","colour","font"],D={platform:"web",style:"",colour:"",font:""},f={},
grid=document.getElementById("grid"),cards=[].slice.call(grid.querySelectorAll(".card")),cnt=document.getElementById("count"),more=document.getElementById("more"),act=document.getElementById("active"),
fd=document.querySelector(".filters .ffold"),fb=document.getElementById("fbadge"),fc=document.getElementById("fcount"),NAMES={platform:"Preview",style:"Style",colour:"Colour",font:"Heading font"};
grid.classList.remove("hubg");K.forEach(function(k){f[k]=D[k]});
function chipsOf(k){return [].slice.call(document.querySelectorAll('.filters .chip[data-f="'+k+'"]'))}
function valid(k,v){return chipsOf(k).some(function(b){return b.dataset.v===v})}
try{var q=new URLSearchParams(location.search);K.forEach(function(k){var v=(q.get(P[k])||(k==="platform"?q.get("platform"):"")||"").toLowerCase().replace(/[^a-z0-9-]/g,"");if(v&&valid(k,v))f[k]=v})}catch(e){}
function has(c,k,v){if(!v)return true;if(k==="colour")return(" "+(c.dataset.colour||"")+" ").indexOf(" "+v+" ")>=0;return c.dataset[k]===v}
function ok(c,s,skip){for(var i=0;i<K.length;i++){var k=K[i];if(k!==skip&&!has(c,k,s[k]))return false}return true}
function url(s){var u=new URLSearchParams();if(s.platform&&s.platform!=="web")u.set(P.platform,s.platform);["style","colour","font"].forEach(function(k){if(s[k])u.set(P[k],s[k])});u=u.toString();return B+"/ui/website-templates"+(u?"?"+u:"")}
function next(b){var s={};K.forEach(function(k){s[k]=f[k]});var k=b.dataset.f,v=b.dataset.v;s[k]=(k!=="platform"&&f[k]===v)?"":v;if(k==="platform"&&!v)s[k]="web";return s}
function label(k,v){var b=chipsOf(k).filter(function(x){return x.dataset.v===v})[0];if(!b)return v;var c=b.cloneNode(true),n=c.querySelector(".n");if(n)n.remove();return c.textContent.trim()}
function nActive(){var n=0;K.forEach(function(k){if(f[k]!==D[k])n++});return n}
function apply(){var n=0;cards.forEach(function(c){var m=ok(c,f);if(m)n++;c.style.display=m&&n<=shown?"block":"none"});
var w=n===1?"template":"templates";cnt.textContent="Showing "+n+" "+w;if(fc)fc.textContent=n+" "+w;var a=nActive();if(fb){fb.textContent=a?String(a):"";fb.hidden=!a}
if(more)more.hidden=n<=shown;if(fd&&a)fd.open=true;
document.querySelectorAll(".filters .chip[data-f]").forEach(function(b){var k=b.dataset.f;if(K.indexOf(k)<0)return;var v=b.dataset.v,on=k==="platform"?f[k]===v:f[k]===v;b.setAttribute("aria-pressed",String(on));
var s={};K.forEach(function(x){s[x]=f[x]});s[k]=v||(k==="platform"?"web":"");var m=0;cards.forEach(function(c){if(ok(c,s))m++});var sp=b.querySelector(".n");if(sp)sp.textContent=m;b.classList.toggle("z",!m&&!on);
b.setAttribute("href",url(next(b)))});
var h="";K.forEach(function(k){if(f[k]!==D[k])h+='<button type="button" class="chip on" data-clear="'+k+'">'+NAMES[k]+": "+label(k,f[k]).replace(/[<>&"]/g,"")+' <span aria-hidden="true">&times;</span><span class="vh"> (remove)</span></button>'});
if(h)h+='<button type="button" class="clr" data-clear="all">Clear all</button>';act.innerHTML=h;act.hidden=!h}
function set(s){f=s;shown=PAGE;apply();try{history.replaceState(null,"",url(f))}catch(e){}}
if(more)more.addEventListener("click",function(){shown+=PAGE*2;apply()});
document.querySelector(".filters").addEventListener("click",function(e){var m=e.target.closest("[data-more]");if(m){var r=m.previousElementSibling;if(r)r.hidden=false;m.remove();return}
var b=e.target.closest(".chip[data-f]");if(!b||K.indexOf(b.dataset.f)<0||e.metaKey||e.ctrlKey||e.shiftKey||e.button)return;e.preventDefault();set(next(b))});
act.addEventListener("click",function(e){var b=e.target.closest("[data-clear]");if(!b)return;var s={};K.forEach(function(k){s[k]=f[k]});if(b.dataset.clear==="all")K.forEach(function(k){s[k]=D[k]});else s[b.dataset.clear]=D[b.dataset.clear];set(s)});
apply()})();
</script>`;
export const HUB_CSS = `.filters .chip .n{margin-left:.3rem;color:var(--muted);font-size:.7rem}.filters .chip[aria-pressed=true] .n{color:inherit;opacity:.75}.filters .chip.z{opacity:.45}
.filters .chip.sw{display:inline-flex;align-items:center;gap:.3rem}.filters .chip.sw i{width:.85rem;height:.85rem;border-radius:50%;border:1px solid rgba(0,0,0,.18);display:inline-block}
.filters .fguide{margin:.1rem 0 0;font-size:.76rem;color:var(--muted);line-height:1.5}.filters .fguide a{color:var(--text)}
.filters .ffold>summary .fb{display:inline-flex;align-items:center;justify-content:center;min-width:1.15rem;height:1.15rem;padding:0 .3rem;border-radius:999px;background:var(--text);color:var(--bg);font-size:.68rem}
.filters .ffold>summary .fct{font-weight:400;color:var(--muted)}
.active{display:flex;flex-wrap:wrap;gap:.35rem;align-items:center;margin:-.6rem 0 .6rem}.active[hidden]{display:none}.active .chip.on{background:var(--text);color:var(--bg);border-color:var(--text)}
.active .clr{background:none;border:0;font:600 .78rem var(--font);text-decoration:underline;cursor:pointer;color:var(--text);padding:.25rem .3rem}
.vh{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
#grid.hubg .card.mobile{display:none}
.crow{margin:0 0 1.25rem;min-width:0}.crow .rh{display:flex;align-items:baseline;justify-content:space-between;gap:1rem}.crow h2{font-size:1rem;margin:0;letter-spacing:-.01em}
.crow .rsee{font-size:.8rem;white-space:nowrap}.crow .rd{font-size:.8rem;color:var(--muted);margin:.15rem 0 .5rem}
.rr{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(180px,220px);gap:.75rem;overflow-x:auto;padding:0 0 .5rem;scroll-snap-type:x proximity;overscroll-behavior-x:contain}
.rc{display:block;text-decoration:none;scroll-snap-align:start;min-width:0}.rc .ri{display:block;aspect-ratio:16/10;background:#ececec;border:1px solid var(--border);border-radius:8px;overflow:hidden}
.rc .ri.dk{background:#141414}.rc img{display:block;width:100%;height:100%;object-fit:cover;object-position:top}.rc:hover .ri{border-color:var(--text)}
.rc .rl{display:block;font-size:.78rem;line-height:1.3;margin-top:.35rem;overflow-wrap:anywhere}.rc .rs{display:block;font-size:.7rem;color:var(--muted)}
.cstrip{display:flex;flex-wrap:wrap;gap:.35rem;align-items:center;margin:0 0 1.25rem}.cstrip b{font-size:.75rem;color:var(--muted);font-weight:600;margin-right:.25rem}
@media(max-width:620px){.rr{grid-auto-columns:minmax(150px,46%)}}`;
// The fold's summary: "Filters", a badge with the number of active filters, and the live result count.
export const hubSummary = (n) => `<summary>Filters <span class="fb" id="fbadge" hidden></span> <span class="fct">· <span id="fcount">${n} templates</span></span></summary>`;

// ---- Collections ---------------------------------------------------------------------------------------------------------------
// "Best <use case> website templates" at /ui/<slug> (flat, like the category pages). Picks are rules over the design set (no hand lists),
// round-robin so one sub-niche never fills the page; a collection with fewer than COLLECTION_MIN picks is not a page (404, not in the sitemap).
export const COLLECTION_MIN = 8, COLLECTION_MAX = 24;
const V = (list) => (a, b) => rank(list, a.variant) - rank(list, b.variant) || byNewest(a, b);
const S = (list) => (a, b) => rank(list, a.style) - rank(list, b.style) || byNewest(a, b);
const nicheIs = (ids) => (t) => !!t.niche && ids.includes(t.niche.id);
const RULES = {
  handyman: { keep: (t) => t.industry === "construction", sort: V(["dispatch", "project", "atlas", "ledger", "band", "bento", "folio", "concierge"]), key: keyNiche, per: 3,
    order: ["plumber", "electrician", "hvac", "roofing", "construction", "landscaping", "cleaning-service", "pest-control"] },
  personal: { keep: (t) => nicheIs(["personal-portfolio", "developer-portfolio", "graphic-designer", "photography"])(t) || t.pattern === "coaching-website", sort: V(["index", "work", "folio", "band", "bento", "atlas"]), key: keyNiche, per: 4, max: 20 },
  "one-page": { keep: () => true, sort: V(["band", "atlas", "bento", "folio"]), key: keyIndustry, per: 2 },
  simple: { keep: (t) => ["minimal", "monochrome"].includes(t.style), sort: V(["concierge", "atlas", "folio", "ledger", "bento", "band"]), key: keyIndustry, per: 2 },
  professional: { keep: (t) => ["corporate", "minimal", "editorial"].includes(t.style) && (["professional-services", "healthcare", "real-estate"].includes(t.industry) || ["cybersecurity-website", "crm-landing-page", "saas-landing-page"].includes(t.pattern)),
    sort: V(["ledger", "atlas", "concierge", "folio"]), key: keyNiche, per: 1 },
  modern: { keep: (t) => ["bento", "band", "work", "showcase", "timetable", "index"].includes(t.variant) || (!t.niche && ["minimal", "brutalist", "monochrome", "playful"].includes(t.style)), sort: byNewest, key: keyIndustry, per: 2 },
  booking: { keep: (t) => ["reserve", "timetable", "dispatch"].includes(t.variant) || (t.variant === "concierge" && ["healthcare", "beauty-fitness", "travel", "automotive"].includes(t.industry)),
    sort: V(["reserve", "timetable", "dispatch", "concierge"]), key: keyNiche, per: 1 },
  "small-business": { keep: nicheIs(["bakery", "coffee-shop", "florist", "barbershop", "nail-salon", "hair-salon", "auto-repair", "car-wash", "tire-shop", "cleaning-service", "landscaping", "accounting", "tax-preparation", "insurance-agency", "pizzeria", "food-truck", "tutoring", "pest-control", "plumber", "car-detailing"]),
    sort: V(["atlas", "ledger", "concierge", "bento", "band", "folio"]), key: keyNiche, per: 1 },
  "home-bakery": { keep: nicheIs(["bakery", "coffee-shop", "catering", "food-truck"]), sort: S(["retro", "playful", "editorial", "luxury", "minimal", "corporate", "brutalist", "monochrome"]), key: keyNiche, per: (k) => (k === "bakery" ? 10 : 3), max: 18,
    order: ["bakery", "coffee-shop", "catering", "food-truck"] },
  dark: { keep: (t) => !!t.image_dark, sort: byDarkScore, key: keyIndustry, per: 2, dark: true },
};
export const COLLECTIONS = (COPY.collections || []).map((c) => ({ ...c, rule: RULES[c.id] })).filter((c) => c.rule);
export const COLLECTION_BY_SLUG = Object.fromEntries(COLLECTIONS.map((c) => [c.slug, c]));
export function collectionPicks(c, D) {
  const R = c.rule; let list = D.filter(R.keep).sort(R.sort);
  if (R.order) list = list.slice().sort((a, b) => rank(R.order, keyNiche(a)) - rank(R.order, keyNiche(b))); // stable: keeps the rule's order inside a niche
  return diversePick(list, R.key, R.max || COLLECTION_MAX, R.per);
}
// Fails the module load if a collection slug would shadow an existing /ui/<seg> page (pattern, facet, category, industry hub, flat niche segment).
export function assertCollections(taken) {
  const seen = new Set();
  for (const c of COLLECTIONS) {
    if (!/^[a-z0-9-]+-website-templates$/.test(c.slug)) throw new Error(`collection slug ${c.slug} must end in -website-templates`);
    if (seen.has(c.slug) || taken(c.slug)) throw new Error(`collection slug ${c.slug} collides with an existing /ui page`); seen.add(c.slug);
    if (/\b(?:wix|squarespace|shopify|wordpress|webflow|framer|canva)\b/i.test(`${c.h1 || ""} ${c.title || ""} ${c.label}`)) throw new Error(`brand name in collection ${c.slug} title/H1`);
  }
}
// H1 pattern (owner picks; see the hand-off): "a" = Best {kw} website templates (recommended), "b" = Best website templates for {forWhom}, "c" = {n} free {kw} website templates.
export const COLLECTION_H1 = "a";
export const collectionH1 = (c, n, pattern = COLLECTION_H1) => c.h1 || (pattern === "b" ? `Best website templates for ${c.forWhom}` : pattern === "c" ? `${n} free ${c.kw} website templates` : `Best ${c.kw} website templates`);
const fill = (s, n) => String(s || "").replace(/\{n\}/g, String(n));
const faqHtml = (h, faq) => (faq.length ? `<h2 class="s">Questions</h2><div class="faq">${faq.map(([q, a]) => `<h3 style="font-size:.95rem;margin:1rem 0 .25rem">${h.escHtml(q)}</h3><p class="lede" style="margin:0">${h.escHtml(a)}</p>`).join("")}</div>` : "");
const faqLd = (faq) => ({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) });
const COMMON_FAQ = ["Can I use these templates for a client or commercial site?", "Yes. Every template is an original design by Made Good Designs, free to use and adapt in any project, including commercial ones, with no credit needed in your product. Names, prices and copy are fictional samples to replace."];
export async function collectionPage(c, env, base, h, x, F) {
  const site = x.siteOf(env), rows = await x.uiRows(env), D = tplDesigns(rows, F), picks = collectionPicks(c, D);
  if (picks.length < COLLECTION_MIN) return new Response("not found", { status: 404, headers: { "Content-Type": "text/plain" } });
  const n = picks.length, e = h.escHtml, rel = c.slug, url = `${site}${base}/ui/${rel}`, h1 = collectionH1(c, n);
  const crumbs = [["UI screens", ""], [TEMPLATES_CRUMB, TEMPLATES_HUB], [h1, rel]];
  const desc = fill(c.desc, n);
  const faq = [...(c.faq || []).map(([q, a]) => [fill(q, n), fill(a, n)]), COMMON_FAQ];
  const niches = [...new Map(picks.filter((t) => t.niche).map((t) => [t.niche.id, t.niche])).values()];
  const cats = [...new Map(niches.map((nn) => homeCategory(nn.industry)).filter(Boolean).map((cc) => [cc.seg, cc])).values()];
  const inds = [...new Map(niches.map((nn) => INDUSTRIES[nn.industry]).filter(Boolean).map((i) => [i.id, i])).values()];
  const flat = [...new Set(picks.filter((t) => !t.niche).map((t) => t.pattern))];
  const img = (t) => (c.rule.dark && t.image_dark ? t.image_dark : t.image);
  const cards = picks.map((t) => `<a class="card page" href="${e(t.path(base))}"><div class="th"${c.rule.dark ? ' style="background:#141414"' : ""}><img loading="lazy"${t.width && t.height ? ` width="${+t.width}" height="${+t.height}"` : ""} src="${e(base + img(t))}" alt="${e(`${nicheShort(t, F)} website template, ${layoutName(t, F)} layout, ${t.style} style${c.rule.dark ? ", dark mode" : ""}`)}"/></div><div class="meta"><b>${e(`${nicheShort(t, F)} · ${layoutName(t, F)}`)}</b><span>${e(`${cap1(t.style)} · ${t.font.heading} headings · ${(COLOURS.find((k) => k[0] === t.colours[0]) || [, t.colours[0] || ""])[1]}`)}</span></div></a>`).join("");
  const jsonld = [{ "@context": "https://schema.org", "@type": "CollectionPage", name: h1, url, description: desc, publisher: x.MGD_ORG(site), ...x.licenceLd(site, base),
    isPartOf: { "@type": "CollectionPage", name: "Free website templates", url: `${site}${base}/ui/${TEMPLATES_HUB}` },
    mainEntity: { "@type": "ItemList", numberOfItems: n, itemListElement: picks.map((t, i) => ({ "@type": "ListItem", position: i + 1, url: site + t.path(base) })) } }, crumbLd(site, base, crumbs), faqLd(faq)];
  const lk = (r, text) => `<a href="${e(base)}/ui/${e(r)}">${e(text)}</a>`;
  const crumbHtml = `<nav class="crumb" aria-label="Breadcrumb">${crumbs.map(([t, u], i) => (i < crumbs.length - 1 ? `<a href="${e(base)}/ui${u ? "/" + e(u) : ""}">${e(t)}</a>` : e(t))).join(" › ")}</nav>`;
  const body = x.head(h, { title: x.fitTitle(`${h1} (${n} free, with code) | MGD`, `${h1} (${n} free) | MGD`, `${h1} | MGD`), desc, canonical: url, image: site + base + picks[0].image, jsonld, css: nicheCss + HUB_CSS })
  + `${h.backLink(base, `/ui/${TEMPLATES_HUB}`, "All website templates")}${crumbHtml}<h1>${e(h1)}</h1>
<p class="lede">${e(fill(c.intro, n))}</p>
<div class="tg">${cards}</div>
${(c.lookFor || []).length ? `<h2 class="s">${e(c.lookForTitle || "What to look for")}</h2><ul class="plain">${c.lookFor.map((t) => `<li>${e(fill(t, n))}</li>`).join("")}</ul>` : ""}
<h2 class="s">What every template includes</h2><ul class="plain"><li>A full, responsive one-page site written for its sub-niche, with a phone layout.</li><li>HTML code and a DESIGN.md of colour, type and spacing tokens, in light and dark.</li><li>Original inline illustrations. No stock photos and no third-party images.</li></ul>
${faqHtml(h, faq)}
<h2 class="s">Browse by sub-niche</h2><p class="lede">${[...niches.map((nn) => lk(nichePath(nn), `${nn.label} templates`)), ...flat.map((p) => lk(F.slug(p), F.h1(p) || F.label(p)))].join(" · ")}</p>
${cats.length || inds.length ? `<p class="lede"><b>Categories:</b> ${[...cats.map((cc) => lk(categoryPath(cc), cc.label)), ...inds.map((i) => lk(i.hub, i.h1))].join(" · ")} · ${lk(TEMPLATES_HUB, "All website templates")}</p>` : ""}
${collectionsStrip(D, base, h, c)}${x.MCP_NOTE(base)}${x.RIGHTS}</div>${h.saveWidget(base)}</body></html>`;
  return x.page(h, body);
}
export async function liveCollectionSlugs(rows, F) { const D = tplDesigns(rows, F); return COLLECTIONS.filter((c) => collectionPicks(c, D).length >= COLLECTION_MIN).map((c) => c.slug); }
export { COLOUR_IDS };
