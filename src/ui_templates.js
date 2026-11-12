// Template hubs, WordPress theme pages, downloads, raw .md twins and the MCP direct answer (7-Nov-2026 healthcare pilot).
// All counts come from tpl_catalog.json (generated from the install-test results) and D1, never from typed numbers.
// R2: tpl/wordpress/<theme>/<version>/theme.zip, shot-1280.webp, shot-390.webp. No D1 table of its own.
import TPL_COPY from "./tpl_copy.json";
import { INDUSTRIES, PLATFORMS, NICHES, MIN_DESIGNS, nicheById, nicheOfPattern, liveDesigns, liveThemes, industryNiches, platformIndustries, catalogMeta, wpIndustryPath, wpNichePath, themePath, nestedPatternPath } from "./ui_tree.js";

// Approved by the user on 7-Nov-2026 (Option A: GPL for themes only, HTML templates keep their current terms). export.mjs writes the same sentence into each readme.
export const WP_LICENCE = "Theme code and patterns: GPL-2.0-or-later. Bundled fonts: SIL Open Font License 1.1. Illustrations: original, included under the same GPL terms.";
// Per industry. Healthcare's sentence is the approved 7-Nov-2026 text, unchanged. Real estate is new copy (option 1 of the options in deploy-bundle-2026-11-07/real-estate.md).
const DISCLOSES = {
  healthcare: "Names, people, addresses, phone numbers and timings in every template are fictional samples to replace. The templates are designs, not medical advice, and they do not make a site compliant with any health, privacy or advertising rule.",
  "real-estate": "Names, people, addresses, phone numbers, listings, prices and fees in every template are fictional samples to replace. The templates are designs, not legal or financial advice, and they do not make a site compliant with any fair housing, licensing or advertising rule.",
  // restaurant: new copy, option 1 of the options in deploy-bundle-2026-11-07/restaurant.md
  restaurant: "Names, people, addresses, phone numbers, dishes, menus, prices and opening hours in every template are fictional samples to replace. Dietary labels and allergen notes are labelled samples: check every dish with your kitchen. The templates are designs, not food safety or legal advice, and they do not make a site compliant with any allergen, food hygiene, licensing or advertising rule.",
  // weddings and events: new copy, option A of the options in deploy-bundle-2026-11-09/templates-r2.md
  wedding: "Names, couples, people, places, dates, prices and schedules in every template are fictional samples to replace. Licence, legal and venue details are left for you to add and check. The templates are designs, not legal or planning advice, and they do not make a site compliant with any marriage, licensing, consumer or advertising rule.",
};
const discloseFor = (ids) => [...new Set(ids)].map((i) => DISCLOSES[i]).filter(Boolean).join(" ");
const DISCLOSE_ALL = () => discloseFor(platformIndustries().map((i) => i.id));
const FORM_NOTE = "Forms are static sample markup. They do not send anything until you connect a form plugin.";

const zipUrl = (d, base) => `${base}/ui/download/wordpress/${d.theme.slug}.zip`;
const shot = (d, w, base) => `${base}/img/tpl/wordpress/${d.theme.slug}/${d.theme.version}/shot-${w}.webp`;
const R2_KEY = (d, f) => `tpl/wordpress/${d.theme.slug}/${d.theme.version}/${f}`;
const kb = (b) => `${Math.round(b / 1024)} KB`;
const count = (n, one, many) => `${n} ${n === 1 ? one : many || one + "s"}`;
const crumbNav = (h, base, list) => `<nav class="crumb" aria-label="Breadcrumb">${list.map(([t, u], i) => (u && i < list.length - 1 ? `<a href="${h.escHtml(base)}/ui${u ? "/" + h.escHtml(u) : ""}">${h.escHtml(t)}</a>` : h.escHtml(t))).join(" › ")}</nav>`;
export const crumbLd = (site, base, list) => ({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: list.map(([t, u], i) => ({ "@type": "ListItem", position: i + 1, name: t, item: `${site}${base}/ui${u ? "/" + u : ""}` })) });
const INDUSTRY_CRUMBS = (ind) => [["Templates", "website-templates"], [ind.label, ind.hub]];
export const nicheCrumbs = (n) => { const ind = INDUSTRIES[n.industry]; return [...INDUSTRY_CRUMBS(ind), [n.label, `${ind.hub}/${n.htmlSeg}`]]; };
const WP_CRUMBS = () => [["Templates", "website-templates"], ["WordPress", PLATFORMS.wordpress.hub]];
const wpIndCrumbs = (ind) => [...WP_CRUMBS(), [ind.label, wpIndustryPath(ind.id)]];
const wpNicheCrumbs = (n) => [...wpIndCrumbs(INDUSTRIES[n.industry]), [n.label, wpNichePath(n)]];
export const nicheCrumbHtml = (n, h, base) => crumbNav(h, base, nicheCrumbs(n));

const TEST_LINE = () => { const m = catalogMeta(); return m.wp ? `Each theme is a real zip installed and activated on WordPress ${m.wp} with PHP ${m.php} on ${m.tested}, then checked at 390, 768 and 1280 px for PHP errors, sideways scrolling and outside requests, and opened in the Site Editor with its block validator.` : ""; };
const totals = (niches, wp) => ({ niches: niches.length, designs: niches.reduce((a, n) => a + (wp ? liveThemes(n) : liveDesigns(n)).length, 0) });
const niceList = (a) => (a.length < 2 ? a.join("") : `${a.slice(0, -1).join(", ")} and ${a[a.length - 1]}`);
const LOCAL_CSS = `.tg{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1rem;margin:0 0 1.5rem}.tg .card .meta b{display:block}.facts{border-collapse:collapse;font-size:.9rem;margin:0 0 1.25rem;max-width:760px;width:100%}.facts th,.facts td{text-align:left;padding:.45rem .9rem .45rem 0;border-bottom:1px solid var(--border);vertical-align:top}.facts th{color:var(--muted);font-weight:600;width:34%}.facts td{overflow-wrap:anywhere}
.plain{max-width:75ch;line-height:1.6;padding-left:1.2rem}.plain li{margin:.3rem 0}.acts{display:flex;flex-wrap:wrap;gap:.5rem;margin:0 0 1.25rem}.shots{display:grid;grid-template-columns:minmax(0,3fr) minmax(0,1fr);gap:1rem;align-items:start;margin:0 0 1.5rem}.shots img{width:100%;height:auto;border:1px solid var(--border);border-radius:10px;display:block}h2.s{font-size:1.05rem;margin:2.25rem 0 .5rem}@media (max-width:640px){.shots{grid-template-columns:minmax(0,1fr)}}`;

async function nicheImages(env, h, x, niches) {
  const ids = niches.map((n) => n.pattern); if (!ids.length) return {};
  const rows = await x.uiRows(env, (r) => ids.includes(r.category) && r.country === "web");   // MCP r3: cached UI rows, filtered in JS
  const out = {}; for (const r of rows) { const it = h.rowToItem(r, env); if (!out[it.pattern]) out[it.pattern] = it; } return out;
}
const nicheCard = (n, img, href, h, base, sub) => `<a class="card page" href="${h.escHtml(href)}">${img ? `<div class="th"><img loading="lazy" src="${h.escHtml(base + img)}" alt="${h.escHtml(n.label)} template"/></div>` : ""}<div class="meta"><b>${h.escHtml(n.label)}</b><span>${h.escHtml(sub)}</span></div></a>`;
const themeCard = (n, d, h, base) => `<a class="card page" data-style="${h.escHtml(d.style)}" href="${h.escHtml(base)}/ui/${h.escHtml(themePath(n, d))}"><div class="th"><img loading="lazy" src="${h.escHtml(shot(d, 1280, base))}" alt="${h.escHtml(d.theme.name)} theme, front page"/></div><div class="meta"><b>${h.escHtml(d.theme.name)}</b><span>${h.escHtml(d.about)}</span></div></a>`;
const mdAlt = (h, base, rel) => `<p class="lede" style="font-size:.85rem">Plain text for assistants: <a href="${h.escHtml(base)}/ui/${h.escHtml(rel)}.md">this page as Markdown</a>.</p>`;
const STYLE_FILTER_JS = `<script>(function(){var g=document.getElementById("tgrid"),c=document.getElementById("tcount");if(!g)return;var cs=[].slice.call(g.querySelectorAll(".card"));document.addEventListener("click",function(e){var b=e.target.closest("[data-tf]");if(!b)return;e.preventDefault();var v=b.dataset.tf,n=0;cs.forEach(function(k){var ok=!v||k.dataset.style===v;k.style.display=ok?"":"none";if(ok)n++});if(c)c.textContent=n+" of "+cs.length+" themes";document.querySelectorAll("[data-tf]").forEach(function(x){x.setAttribute("aria-pressed",String(x===b))});try{history.replaceState(null,"",v?"?style="+v:location.pathname)}catch(_){}})})();</script>`;
const styleChips = (designs, h) => { const s = [...new Set(designs.map((d) => d.style))]; return s.length < 2 ? "" : `<div class="filters"><div><b>Style</b><a class="chip" data-tf="" aria-pressed="true" href="?" rel="nofollow">All</a>${s.map((v) => `<a class="chip" data-tf="${h.escHtml(v)}" aria-pressed="false" href="?style=${h.escHtml(v)}" rel="nofollow">${h.escHtml(v[0].toUpperCase() + v.slice(1))}</a>`).join("")}</div></div>`; };

// /ui/<industry hub>
export async function industryPage(ind, env, base, h, x) {
  const site = x.siteOf(env), niches = industryNiches(ind.id), t = totals(niches), url = `${site}${base}/ui/${ind.hub}`, c = (TPL_COPY.industries || {})[ind.id] || {};
  const wp = industryNiches(ind.id, true), wt = totals(wp, true), img = await nicheImages(env, h, x, niches), crumbs = INDUSTRY_CRUMBS(ind);
  const desc = `${t.designs} free one-page ${ind.label.toLowerCase()} website templates across ${t.niches} sub-niches, each a distinct layout with HTML code and a DESIGN.md.`;
  const title = x.fitTitle(`${ind.h1} (${t.designs} free, with code) | MGD`, `${ind.h1} (${t.designs} free) | MGD`, `${ind.h1} | MGD`);
  const jsonld = [{ "@context": "https://schema.org", "@type": "CollectionPage", name: ind.h1, url, description: desc, publisher: x.MGD_ORG(site), ...x.licenceLd(site, base), hasPart: niches.map((n) => ({ "@type": "CollectionPage", name: `${n.label} website templates`, url: `${site}${base}/ui/${ind.hub}/${n.htmlSeg}` })) }, crumbLd(site, base, crumbs)];
  const app = (ind.appPatterns || []).map((p) => `<a href="${h.escHtml(base)}/ui/${h.escHtml(x.patternSlug(p))}">${h.escHtml(x.label(p))}</a>`).join(" · ");
  const body = x.head(h, { title, desc, canonical: url, image: Object.values(img)[0] ? site + base + Object.values(img)[0].image : null, jsonld, css: LOCAL_CSS, md: `${url}.md` })
  + `${h.backLink(base, "/ui", "All UI screens")}${crumbNav(h, base, crumbs)}<h1>${h.escHtml(ind.h1)}</h1>
<p class="lede">${h.escHtml(desc)} ${h.escHtml(c.intro || "")}</p>
<h2 class="s">Sub-niches</h2><div class="tg">${niches.map((n) => nicheCard(n, img[n.pattern] && img[n.pattern].image, `${base}/ui/${ind.hub}/${n.htmlSeg}`, h, base, `${count(liveDesigns(n).length, "design")}`)).join("")}</div>
${wp.length ? `<h2 class="s">Also for WordPress</h2><p class="lede" style="margin:0"><a href="${h.escHtml(base)}/ui/${h.escHtml(wpIndustryPath(ind.id))}"><b>${h.escHtml(ind.label)} WordPress themes</b></a>: ${wt.designs} block themes across ${wt.niches} sub-niches, each installed and tested.</p>` : ""}
${app ? `<h2 class="s">App and portal screens</h2><p class="lede" style="margin:0">${app}</p>` : ""}
<h2 class="s">What each sub-niche covers</h2><ul class="plain">${niches.map((n) => `<li><b>${h.escHtml(n.label)}.</b> ${h.escHtml(((TPL_COPY.niches || {})[n.id] || {}).intro || "")}</li>`).join("")}</ul>
<h2 class="s">What every template includes</h2><ul class="plain"><li>A full, responsive one-page home page written for that sub-niche.</li><li>HTML code and a DESIGN.md of colour, type and spacing tokens, in light and dark.</li><li>Original inline illustrations. No stock photos and no third-party images.</li></ul>
<h2 class="s">Before you use one</h2><p class="lede">${h.escHtml(discloseFor([ind.id]))}</p>${mdAlt(h, base, ind.hub)}${x.MCP_NOTE(base)}${x.RIGHTS}</div>${h.saveWidget(base)}</body></html>`;
  return x.page(h, body);
}

// Inserted into the sub-niche page (uiPatternPage): the distinct designs first, the style and device screens below them as filters.
export function nicheDesignsBlock(n, items, base, h, itemPath) {
  const ds = liveDesigns(n);
  const cards = ds.map((d) => { const it = items.find((i) => (i.variant || "homepage") === d.variant && i.style === d.style && i.platform === "web"); if (!it) return ""; return `<a class="card page" href="${h.escHtml(itemPath(it, base))}"><div class="th"><img loading="lazy" src="${h.escHtml(base + it.image)}" alt="${h.escHtml(`${n.label} template, ${d.layoutName} layout`)}"/></div><div class="meta"><b>${h.escHtml(d.layoutName)}</b><span>${h.escHtml(d.about)}</span></div></a>`; }).join("");
  return `<h2 class="s">${h.escHtml(`${ds.length} distinct designs`)}</h2><div class="tg">${cards}</div>${n.wpLive ? `<p class="lede"><b>Also for WordPress:</b> <a href="${h.escHtml(base)}/ui/${h.escHtml(wpNichePath(n))}">${h.escHtml(`${n.label} WordPress themes`)}</a>, ${liveThemes(n).length} block themes you can install and edit.</p>` : ""}`;
}
export const nicheCss = LOCAL_CSS;

// Link from an HTML item page to the same design as a WordPress theme
export function itemSibling(it, base, h) {
  const n = nicheOfPattern(it.pattern); if (!n) return "";
  const d = liveThemes(n).find((x) => (x.variant || "homepage") === (it.variant || "homepage")); if (!d) return "";
  return `<p class="lede"><b>Also for WordPress:</b> <a href="${h.escHtml(base)}/ui/${h.escHtml(themePath(n, d))}">${h.escHtml(d.theme.name)}</a>, the same layout as an installable block theme.</p>`;
}

// /ui/wordpress-themes
export async function platformPage(env, base, h, x) {
  const site = x.siteOf(env), pl = PLATFORMS.wordpress, inds = platformIndustries(), niches = inds.flatMap((i) => industryNiches(i.id, true)), t = totals(niches, true), url = `${site}${base}/ui/${pl.hub}`, crumbs = WP_CRUMBS();
  const desc = `${t.designs} free WordPress block themes for ${niceList(inds.map((i) => i.label.toLowerCase()))}, across ${t.niches} sub-niches. Each one is an installable zip with editable blocks, tested on real WordPress.`;
  const jsonld = [{ "@context": "https://schema.org", "@type": "CollectionPage", name: "WordPress themes", url, description: desc, publisher: x.MGD_ORG(site) }, crumbLd(site, base, crumbs)];
  const body = x.head(h, { title: x.fitTitle(`Free WordPress block themes (${t.designs}, tested) | MGD`, `Free WordPress block themes | MGD`), desc, canonical: url, jsonld, css: LOCAL_CSS, md: `${url}.md` })
  + `${h.backLink(base, "/ui", "All UI screens")}${crumbNav(h, base, crumbs)}<h1>${h.escHtml(pl.h1)}</h1><p class="lede">${h.escHtml(desc)} ${h.escHtml(TEST_LINE())}</p>
${inds.map((i) => `<h2 class="s"><a href="${h.escHtml(base)}/ui/${h.escHtml(wpIndustryPath(i.id))}">${h.escHtml(i.label)}</a></h2><p class="lede" style="margin:0">${industryNiches(i.id, true).map((n) => `<a href="${h.escHtml(base)}/ui/${h.escHtml(wpNichePath(n))}">${h.escHtml(n.label)}</a>`).join(" · ")}</p>`).join("")}
<h2 class="s">Licence</h2><p class="lede">${h.escHtml(WP_LICENCE)}</p><h2 class="s">Before you use one</h2><p class="lede">${h.escHtml(DISCLOSE_ALL())} ${h.escHtml(FORM_NOTE)}</p>${mdAlt(h, base, pl.hub)}${x.MCP_NOTE(base)}</div>${h.saveWidget(base)}</body></html>`;
  return x.page(h, body);
}

// /ui/wordpress-themes/<industry>
export async function platformIndustryPage(ind, env, base, h, x) {
  const site = x.siteOf(env), niches = industryNiches(ind.id, true), t = totals(niches, true), rel = wpIndustryPath(ind.id), url = `${site}${base}/ui/${rel}`, crumbs = wpIndCrumbs(ind), img = await nicheImages(env, h, x, niches);
  const h1 = `${ind.label} WordPress themes`, desc = `${t.designs} free ${ind.label.toLowerCase()} WordPress block themes across ${t.niches} sub-niches. Each theme is an installable zip with editable blocks and style variations.`;
  const jsonld = [{ "@context": "https://schema.org", "@type": "CollectionPage", name: h1, url, description: desc, publisher: x.MGD_ORG(site), hasPart: niches.map((n) => ({ "@type": "CollectionPage", name: `${n.label} WordPress themes`, url: `${site}${base}/ui/${wpNichePath(n)}` })) }, crumbLd(site, base, crumbs)];
  const body = x.head(h, { title: x.fitTitle(`${h1} (${t.designs} free, tested) | MGD`, `${h1} (${t.designs} free) | MGD`, `${h1} | MGD`), desc, canonical: url, jsonld, css: LOCAL_CSS, md: `${url}.md` })
  + `${h.backLink(base, "/ui", "All UI screens")}${crumbNav(h, base, crumbs)}<h1>${h.escHtml(h1)}</h1><p class="lede">${h.escHtml(desc)} ${h.escHtml(TEST_LINE())}</p>
<div class="tg">${niches.map((n) => nicheCard(n, img[n.pattern] && img[n.pattern].image, `${base}/ui/${wpNichePath(n)}`, h, base, `${count(liveThemes(n).length, "theme")}`)).join("")}</div>
<p class="lede"><b>Also as HTML:</b> <a href="${h.escHtml(base)}/ui/${h.escHtml(ind.hub)}">${h.escHtml(ind.h1)}</a>.</p>
<h2 class="s">Licence</h2><p class="lede">${h.escHtml(WP_LICENCE)}</p><h2 class="s">Before you use one</h2><p class="lede">${h.escHtml(discloseFor([ind.id]))} ${h.escHtml(FORM_NOTE)}</p>${mdAlt(h, base, rel)}${x.MCP_NOTE(base)}</div>${h.saveWidget(base)}</body></html>`;
  return x.page(h, body);
}

// /ui/wordpress-themes/<industry>/<niche>; ?style= filters in place, the canonical stays on the path
export async function platformNichePage(n, env, base, h, x) {
  const site = x.siteOf(env), ind = INDUSTRIES[n.industry], ds = liveThemes(n), rel = wpNichePath(n), url = `${site}${base}/ui/${rel}`, crumbs = wpNicheCrumbs(n), c = (TPL_COPY.niches || {})[n.id] || {};
  const h1 = `${n.label} WordPress themes`, desc = `${ds.length} free ${n.label.toLowerCase()} WordPress block themes, each a distinct layout with editable blocks, style variations and copy written for ${n.label.toLowerCase()}.`;
  const jsonld = [{ "@context": "https://schema.org", "@type": "CollectionPage", name: h1, url, description: desc, publisher: x.MGD_ORG(site), mainEntity: { "@type": "ItemList", numberOfItems: ds.length, itemListElement: ds.map((d, i) => ({ "@type": "ListItem", position: i + 1, name: d.theme.name, url: `${site}${base}/ui/${themePath(n, d)}` })) } }, crumbLd(site, base, crumbs)];
  const body = x.head(h, { title: x.fitTitle(`${h1} (${ds.length} free, tested) | MGD`, `${h1} (${ds.length} free) | MGD`, `${h1} | MGD`), desc, canonical: url, image: site + shot(ds[0], 1280, base), jsonld, css: LOCAL_CSS, md: `${url}.md` })
  + `${h.backLink(base, "/ui", "All UI screens")}${crumbNav(h, base, crumbs)}<h1>${h.escHtml(h1)}</h1><p class="lede">${h.escHtml(desc)} ${h.escHtml(c.intro || "")}</p>${styleChips(ds, h)}<p class="lede" id="tcount">${ds.length} themes</p><div class="tg" id="tgrid">${ds.map((d) => themeCard(n, d, h, base)).join("")}</div>
<p class="lede"><b>Also as HTML:</b> <a href="${h.escHtml(base)}/ui/${h.escHtml(ind.hub)}/${h.escHtml(n.htmlSeg)}">${h.escHtml(n.label)} website templates</a>. <b>More in ${h.escHtml(ind.label)}:</b> <a href="${h.escHtml(base)}/ui/${h.escHtml(wpIndustryPath(ind.id))}">${h.escHtml(ind.label)} WordPress themes</a>.</p>
${n.services && n.services.length ? `<h2 class="s">Written for ${h.escHtml(n.label.toLowerCase())}</h2><p class="lede">Sample services in every theme: ${h.escHtml(niceList(n.services))}.</p>` : ""}<h2 class="s">What each theme includes</h2><ul class="plain"><li>Templates for the front page, blog, posts, pages, archives, search and 404, with a header and footer part.</li><li>Every section as a block pattern you can insert elsewhere.</li><li>Eight style variations in Appearance, Editor, Styles.</li><li>Bundled fonts, so nothing loads from a font service.</li></ul>
<h2 class="s">How they were tested</h2><p class="lede">${h.escHtml(TEST_LINE())}</p><h2 class="s">Licence</h2><p class="lede">${h.escHtml(WP_LICENCE)}</p><h2 class="s">Before you use one</h2><p class="lede">${h.escHtml(discloseFor([n.industry]))} ${h.escHtml(FORM_NOTE)}</p>${mdAlt(h, base, rel)}${x.MCP_NOTE(base)}</div>${STYLE_FILTER_JS}${h.saveWidget(base)}</body></html>`;
  return x.page(h, body);
}

// /ui/wordpress-themes/<industry>/<niche>/<theme>: its own zip, demo shots and install steps
export async function themePage(n, d, env, base, h, x) {
  const site = x.siteOf(env), ind = INDUSTRIES[n.industry], t = d.theme, rel = themePath(n, d), url = `${site}${base}/ui/${rel}`, crumbs = [...wpNicheCrumbs(n), [t.name, rel]], m = catalogMeta();
  const blueprint = `${site}${base}/ui/download/wordpress/${t.slug}.blueprint.json`, play = `https://playground.wordpress.net/?blueprint-url=${encodeURIComponent(blueprint)}`;
  const row = (await x.uiRows(env, (r) => r.category != null && r.category === n.pattern && r.country === "web" && r.style != null && r.style === d.style)).map((r) => h.rowToItem(r, env)).find((i) => (i.variant || "homepage") === d.variant);
  const desc = `${t.name} is a free ${n.label.toLowerCase()} WordPress block theme: ${d.about}. ${count(t.patterns, "block pattern")}, ${t.variations} style variations, ${kb(t.zipBytes)} zip.`;
  const jsonld = [{ "@context": "https://schema.org", "@type": "SoftwareSourceCode", name: t.name, url, description: desc, codeRepository: url, programmingLanguage: "PHP, HTML, CSS", runtimePlatform: `WordPress ${t.requiresWp}+`, version: t.version, author: x.MGD_ORG(site), license: "https://www.gnu.org/licenses/gpl-2.0.html" }, crumbLd(site, base, crumbs)];
  const facts = [["Sub-niche", n.label], ["Layout", `${d.layoutName}: ${d.about}`], ["Default style", d.style], ["Style variations", String(t.variations)], ["Block patterns", String(t.patterns)], ["Blocks on the front page", `${t.blocks}, of which ${t.htmlBlocks} ${t.htmlBlocks === 1 ? "is" : "are"} Custom HTML (forms and small decoration)`], ["Requires", `WordPress ${t.requiresWp} or later, PHP 7.4 or later`], ["Tested on", `WordPress ${m.wp}, PHP ${m.php}, ${m.tested}`], ["Download", `${kb(t.zipBytes)} zip`], ["SHA-256", t.sha256]];
  const body = x.head(h, { title: x.fitTitle(`${t.name}: free ${n.label.toLowerCase()} WordPress theme | MGD`, `${t.name}: free WordPress theme | MGD`, `${t.name} | MGD`), desc, canonical: url, image: site + shot(d, 1280, base), jsonld, css: LOCAL_CSS, md: `${url}.md` })
  + `${h.backLink(base, `/ui/${wpNichePath(n)}`, `${n.label} themes`)}${crumbNav(h, base, crumbs)}<h1>${h.escHtml(t.name)}</h1><p class="lede">${h.escHtml(desc)}</p>
<div class="acts"><a class="btn dark" href="${h.escHtml(zipUrl(d, base))}">Download the theme</a><a class="btn" rel="nofollow" href="${h.escHtml(play)}">Try it in WordPress Playground</a>${row ? `<a class="btn" href="${h.escHtml(x.uiItemPath(row, base))}">Also as HTML</a>` : ""}</div>
<div class="shots"><img loading="lazy" src="${h.escHtml(shot(d, 1280, base))}" alt="${h.escHtml(t.name)} front page at 1280 px, rendered by WordPress"/><img loading="lazy" src="${h.escHtml(shot(d, 390, base))}" alt="${h.escHtml(t.name)} front page at 390 px, rendered by WordPress"/></div>
<table class="facts"><tbody>${facts.map(([k, v]) => `<tr><th scope="row">${h.escHtml(k)}</th><td>${h.escHtml(v)}</td></tr>`).join("")}</tbody></table>
<h2 class="s">Install</h2><ol class="plain"><li>In WordPress, go to Appearance, Themes, Add New Theme, Upload Theme.</li><li>Upload the zip, click Install Now, then Activate.</li><li>Set your Site Title in Settings, General. The header shows it.</li><li>Edit text, colours and fonts in Appearance, Editor.</li></ol>
<h2 class="s">Licence</h2><p class="lede">${h.escHtml(WP_LICENCE)}</p><h2 class="s">Before you use it</h2><p class="lede">${h.escHtml(discloseFor([n.industry]))} ${h.escHtml(FORM_NOTE)}</p>
<h2 class="s">Other ${h.escHtml(n.label.toLowerCase())} themes</h2><p class="lede">${liveThemes(n).filter((o) => o !== d).map((o) => `<a href="${h.escHtml(base)}/ui/${h.escHtml(themePath(n, o))}">${h.escHtml(o.theme.name)}</a>`).join(" · ")}</p>${mdAlt(h, base, rel)}${x.MCP_NOTE(base)}</div>${h.saveWidget(base)}</body></html>`;
  return x.page(h, body);
}

// Raw Markdown twins, for assistants. Same facts as the page; the canonical stays on the page.
export function treeMd(hit, site, base) {
  const u = (rel) => `${site}${base}/ui/${rel}`, m = catalogMeta();
  const indOf = hit.ind ? [hit.ind.id] : hit.n ? [hit.n.industry] : platformIndustries().map((i) => i.id), DISCLOSE = discloseFor(indOf);
  const std = `Licence: ${WP_LICENCE}\n\n${DISCLOSE} ${FORM_NOTE}`;
  const themeLine = (n, d) => `- **${d.theme.name}**: ${d.about}. Page: ${u(themePath(n, d))} Download: ${site}${zipUrl(d, base)}`;
  if (hit.type === "industry") { const ns = industryNiches(hit.ind.id), t = totals(ns); return { rel: hit.ind.hub, md: `# ${hit.ind.h1}\n\n${t.designs} free one-page templates across ${t.niches} sub-niches, each a distinct layout with HTML code and a DESIGN.md.\n\n## Sub-niches\n${ns.map((n) => `- [${n.label}](${u(`${hit.ind.hub}/${n.htmlSeg}`)}): ${liveDesigns(n).length} designs. ${(TPL_COPY.niches[n.id] || {}).intro || ""}`).join("\n")}\n\nWordPress themes: ${u(wpIndustryPath(hit.ind.id))}\n\n${DISCLOSE}\n` }; }
  if (hit.type === "niche") { const n = hit.n, ind = hit.ind, rel = `${ind.hub}/${n.htmlSeg}`; return { rel, md: `# ${n.label} website templates\n\n${liveDesigns(n).length} distinct one-page designs with HTML code and a DESIGN.md.\n\n${liveDesigns(n).map((d) => `- **${d.layoutName}**: ${d.about}`).join("\n")}\n\n${n.wpLive ? `WordPress themes: ${u(wpNichePath(n))}\n\n` : ""}Hub: ${u(ind.hub)}\n\n${DISCLOSE}\n` }; }
  if (hit.type === "platform") { const inds = platformIndustries(), ns = inds.flatMap((i) => industryNiches(i.id, true)), t = totals(ns, true); return { rel: PLATFORMS.wordpress.hub, md: `# WordPress themes\n\n${t.designs} free block themes across ${t.niches} sub-niches. ${TEST_LINE()}\n\n${inds.map((i) => `## ${i.label}\n${industryNiches(i.id, true).map((n) => `- [${n.label}](${u(wpNichePath(n))}): ${liveThemes(n).length} themes`).join("\n")}`).join("\n\n")}\n\n${std}\n` }; }
  if (hit.type === "platform-industry") { const ns = industryNiches(hit.ind.id, true), t = totals(ns, true); return { rel: wpIndustryPath(hit.ind.id), md: `# ${hit.ind.label} WordPress themes\n\n${t.designs} free block themes across ${t.niches} sub-niches. ${TEST_LINE()}\n\n${ns.map((n) => `- [${n.label}](${u(wpNichePath(n))}): ${liveThemes(n).length} themes`).join("\n")}\n\n${std}\n` }; }
  if (hit.type === "platform-niche") { const n = hit.n; return { rel: wpNichePath(n), md: `# ${n.label} WordPress themes\n\n${liveThemes(n).length} free block themes, each a distinct layout. ${(TPL_COPY.niches[n.id] || {}).intro || ""} ${TEST_LINE()}\n\n${liveThemes(n).map((d) => themeLine(n, d)).join("\n")}\n\n${n.services && n.services.length ? `Sample services: ${niceList(n.services)}.\n\n` : ""}Also as HTML: ${u(`${hit.ind.hub}/${n.htmlSeg}`)}\n\n${std}\n` }; }
  const { n, d } = hit, t = d.theme; return { rel: themePath(n, d), md: `# ${t.name}\n\nA free ${n.label.toLowerCase()} WordPress block theme: ${d.about}.\n\n- Download: ${site}${zipUrl(d, base)}\n- Zip size: ${kb(t.zipBytes)}, SHA-256 ${t.sha256}\n- Version: ${t.version}\n- Block patterns: ${t.patterns}\n- Style variations: ${t.variations}\n- Requires: WordPress ${t.requiresWp}+, PHP 7.4+\n- Tested on: WordPress ${m.wp}, PHP ${m.php}, ${m.tested}\n\n## Install\n1. Appearance, Themes, Add New Theme, Upload Theme.\n2. Upload the zip, Install Now, Activate.\n3. Set your Site Title in Settings, General.\n4. Edit in Appearance, Editor.\n\n${std}\n` };
}

export async function themeDownload(slug, kind, env, site, base) {
  const n = NICHES.find((x) => liveThemes(x).some((d) => d.theme.slug === slug)); if (!n) return null;
  const d = liveThemes(n).find((x) => x.theme.slug === slug);
  if (kind === "blueprint.json") return new Response(JSON.stringify({ landingPage: "/", preferredVersions: { php: "8.3", wp: "latest" }, steps: [{ step: "setSiteOptions", options: { blogname: d.theme.site || d.theme.name } }, { step: "installTheme", themeData: { resource: "url", url: `${site}${base}/ui/download/wordpress/${slug}.zip` }, options: { activate: true } }] }, null, 1), { headers: { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*", "Cache-Control": "public, max-age=3600", "X-Robots-Tag": "noindex" } });
  const obj = await env.BUCKET.get(R2_KEY(d, "theme.zip"));
  if (!obj) return new Response("not found", { status: 404 });
  return new Response(obj.body, { headers: { "Content-Type": "application/zip", "Content-Disposition": `attachment; filename="${slug}.zip"`, "Cache-Control": "public, max-age=86400", "Access-Control-Allow-Origin": "*", "X-Robots-Tag": "noindex", ETag: obj.httpEtag } });
}

// ---- MCP ----------------------------------------------------------------------------------------------------------------------------
// Most specific phrase first: "animal hospital" before "hospital", "mental health" before "medical".
// restaurant (7-Nov-2026). "bar" never matches a UI bar (navigation bar, progress bar, search bar, tab bar ...).
const BAR_UI = "(?<!\\b(?:nav|navigation|progress|search|side|tab|app|status|tool|menu|top|bottom|title|scroll|action|snack|command|address|filter|button|loading|sticky|header|footer|info|announcement|cookie|chocolate|salad|candy|granola|protein)[- ]?)";
const ALIASES = [["fine-dining", /\b(fine[- ]dining|tasting[- ]menus?|upscale restaurants?)\b/], ["food-truck", /\b(food (trucks?|vans?|carts?)|street food|mobile kitchen)\b/], ["catering", /\b(cater(ing|ers?)|event food)\b/],
  ["pizzeria", /\b(pizz(a|as|eria|erias)|pizza (shops?|places?))\b/], ["bakery", /\b(baker(y|ies)|bakehouse|patisseries?|cake shops?|bread shops?)\b/], ["coffee-shop", /\b(coffee (shops?|house)|coffeehouse|caf(e|é)s?|espresso bar)\b/],
  ["bar", new RegExp(`\\b(${BAR_UI}bars?|pubs?|taverns?|taprooms?|taphouses?|brewpubs?|gastropubs?)\\b`)], ["restaurant", /\b(restaurants?|bistros?|brasseries?|eater(y|ies)|casual dining|trattorias?)\b/],
  // weddings and events (9-Nov-2026), after catering so "wedding catering" stays a caterer. Most specific first; the couple's site ("wedding") last.
  ["wedding-invitation", /\b(wedding invit\w*|digital (wedding )?invit\w*|online (wedding )?invit\w*|e-?invites?|save[- ]the[- ]dates?)\b/], ["wedding-planner", /\b(wedding (planners?|planning|coordinators?|coordination)|day[- ]of coordinators?)\b/],
  ["wedding-venue", /\b(wedding (venues?|barns?)|event venues?|reception venues?|barn venues?)\b/], ["wedding-photographer", /\b(wedding photograph\w*|elopement photograph\w*)\b/],
  ["florist", /\b(florists?|flower (shops?|studios?)|floral (studios?|design\w*))\b/], ["event-planner", /\b(event (planners?|planning|management|organi[sz]ers?)|party planners?)\b/],
  ["conference", /\b(conferences?|summits?|symposi(um|a)|event (websites?|sites?|landing pages?|wordpress themes?))\b/], ["wedding", /\b(weddings?|elopements?)\b/],
  ["vacation-rental", /\b(vacation rentals?|holiday (lets?|rentals?|cottages?|homes?)|short[- ]term rentals?|cabin rentals?|direct booking)\b/], ["property-management", /\b(property manage\w*|letting agents?|lettings|rental management|landlord services)\b/],
  ["commercial-real-estate", /\b(commercial (real estate|property|properties)|office (space|leasing)|retail space|industrial (units?|property)|warehouse space)\b/], ["luxury-real-estate", /\b(luxury (real estate|homes?|propert\w*|realtors?)|high[- ]end (real estate|homes?))\b/], ["home-builder", /\b(home ?builders?|house ?builders?|new[- ]homes?|new[- ]build)\b/],
  ["real-estate-agent", /\b(real estate agents?|realtors?|independent agents?|solo agents?)\b/], ["apartment", /\b(apartments?|multifamily|apartment (complex|community)|leasing office)\b/], ["real-estate", /\b(real estate|realty|estate agents?|estate agency|property (listings?|websites?)|brokerage)\b/],
  ["veterinary", /\b(veterinar\w*|vets?|animal (hospital|clinic)|pet clinic)\b/], ["mental-health", /\b(mental health|psychiatr\w*|behavioural health|behavioral health)\b/], ["therapist", /\b(therapists?|counsell?(ors?|ing)|psychotherapist|psychologists?)\b/], ["physical-therapy", /\b(physical therapy|physical therapist|physio\w*|sports rehab|rehab clinic)\b/],
  ["orthodontics", /\b(orthodont\w*|braces)\b/], ["dental", /\b(dental|dentists?|dentistry)\b/], ["cardiology", /\b(cardiolog\w*|heart (clinic|doctor|practice))\b/], ["dermatology", /\b(dermatolog\w*|skin clinic)\b/], ["pediatrics", /\b(p(a)?ediatric\w*|children'?s (clinic|doctor))\b/], ["fertility", /\b(fertility|ivf)\b/], ["optometry", /\b(optometr\w*|opticians?|eye (clinic|care|doctor)|eyecare)\b/], ["pharmacy", /\b(pharmac\w*|drugstore|chemist)\b/], ["hospital", /\bhospitals?\b/], ["medical", /\b(medical (practice|clinic|office|center|centre)|primary care|family (doctor|practice)|gp (practice|surgery)|doctors?( office)?|medical)\b/]];
const OTHER_PLATFORMS = /\b(shopify|magento|joomla|wix|squarespace|webflow|drupal|woocommerce|ghost)\b/;
export function tplAnswer({ q, platform }, site) {
  const s = String(q || "").toLowerCase(), base = "", u = (rel) => `${site}/ui/${rel}`, m = catalogMeta();
  const nicheId = (ALIASES.find(([, rx]) => rx.test(s)) || [])[0], n = nicheId ? nicheById(nicheId) : null;
  const general = Object.values(GENERAL).some((rx) => rx.test(s)), other = (s.match(OTHER_PLATFORMS) || [])[1];
  // "theme" alone is ambiguous ("theme switcher", "dark theme"): it means WordPress only next to a niche, and never next to app or dashboard words.
  const named = platform === "wordpress" || /\b(word ?press|wp theme|block theme|gutenberg|full site editing)\b/.test(s);
  const wpIntent = named || (n && /\bthemes?\b/.test(s.replace(/\b(dark|light|night)\s+themes?\b/g, " ")) && !/\b(app|apps|mobile|dashboard|portal|screen|screens|switch\w*|toggle)\b/.test(s));
  if (other) { const name = other[0].toUpperCase() + other.slice(1); return `${name}: Made Good Designs has no ${name} templates. Templates come as HTML and as WordPress block themes.${n && n.htmlLive ? ` For ${n.label.toLowerCase()}: HTML ${u(`${INDUSTRIES[n.industry].hub}/${n.htmlSeg}`)}${n.wpLive ? `, WordPress ${u(wpNichePath(n))}` : ""}.` : ""}`; }
  if (wpIntent) {
    if (n && n.wpLive) { const ds = liveThemes(n); return indLine(n, s, u) + `${n.label} WordPress themes: ${ds.length} free block themes, each a distinct layout, all installed and tested on WordPress ${m.wp} with PHP ${m.php} (${m.tested}). Listing: ${u(wpNichePath(n))}\n\n${ds.map((d, i) => `${i + 1}. ${d.theme.name}: ${d.about}. Default style ${d.style}, ${d.theme.variations} style variations.\n   page (cite this): ${u(themePath(n, d))}\n   download: ${site}/ui/download/wordpress/${d.theme.slug}.zip`).join("\n")}\n\nInstall: Appearance, Themes, Add New Theme, Upload Theme, then Activate. Licence: ${WP_LICENCE} ${discloseFor([n.industry])} ${FORM_NOTE} Same designs as HTML: ${u(`${INDUSTRIES[n.industry].hub}/${n.htmlSeg}`)}`; }
    if (n) return `No ${n.label.toLowerCase()} WordPress theme yet.${n.htmlLive ? ` The HTML templates are here: ${u(`${INDUSTRIES[n.industry].hub}/${n.htmlSeg}`)}.` : ""} All WordPress themes: ${u(PLATFORMS.wordpress.hub)}`;
    const inds = platformIndustries(); if (!inds.length) return null;
    const rest = s.replace(/\b(word ?press|wp|themes?|free|block|website|websites|site|sites|templates?|for|a|an|the|me|my|find|show|best|good|gutenberg|full|editor|editing)\b/g, " ").replace(/[^a-z]+/g, " ").trim();
    if (general || !rest) return `WordPress themes: ${inds.map((i) => { const ns = industryNiches(i.id, true), t = totals(ns, true); return `${t.designs} ${i.label.toLowerCase()} block themes across ${t.niches} sub-niches (${ns.map((x) => `${x.label.toLowerCase()} ${u(wpNichePath(x))}`).join(", ")})`; }).join("; ")}. All tested on WordPress ${m.wp}. Hub: ${u(PLATFORMS.wordpress.hub)}. Licence: ${WP_LICENCE}`;
    return `No WordPress theme for "${rest}" yet. WordPress themes exist for ${inds.map((i) => i.label.toLowerCase()).join(", ")} only: ${u(PLATFORMS.wordpress.hub)}. HTML templates by industry: ${u("website-templates")}`;
  }
  return null;
}
// A niche named like its industry (real-estate) also answers the bare industry query ("real estate wordpress themes"):
// lead with the whole industry's WordPress set, then the niche's themes.
function indLine(n, s, u) {
  if (n.id !== n.industry || !GENERAL[n.industry] || /\b(agency|agencies|estate agents?|brokerage)\b/.test(s)) return "";
  const ns = industryNiches(n.industry, true), t = totals(ns, true); if (ns.length < 2) return "";
  return `${INDUSTRIES[n.industry].label} WordPress themes: ${t.designs} ${INDUSTRIES[n.industry].label.toLowerCase()} block themes across ${t.niches} sub-niches at ${u(wpIndustryPath(n.industry))}. The ${n.label.toLowerCase()} set:\n\n`;
}
// One line added above normal results when a query names a template sub-niche, so the nested page gets cited.
// Industry words, for the hub hint and the general WordPress answer.
const GENERAL = { healthcare: /\b(health ?care|medical|clinics?)\b/, "real-estate": /\b(real estate|realty|propert(y|ies))\b/, restaurant: /\b(restaurants?|food and drink|hospitality|food business(es)?)\b/, wedding: /\b(weddings?( and events?)?|wedding industry|bridal)\b/ };
export function tplHint({ q }, site) {
  const s = String(q || "").toLowerCase(); if (!/\b(templates?|website|landing page|homepage|home page)\b/.test(s)) return "";
  const id = (ALIASES.find(([, rx]) => rx.test(s)) || [])[0], n = id ? nicheById(id) : null, u = (rel) => `${site}/ui/${rel}`;
  if (n && n.htmlLive && INDUSTRIES[n.industry].hubFirst && n.id === n.industry && !/\b(casual dining|bistros?|brasseries?|neighbou?rhood)\b/.test(s)) { const i = INDUSTRIES[n.industry], ns = industryNiches(i.id); return `${i.label} template hub: ${totals(ns).designs} designs across ${ns.length} sub-niches at ${u(i.hub)}. ${n.label}: ${liveDesigns(n).length} distinct designs at ${u(`${i.hub}/${n.htmlSeg}`)}${n.wpLive ? `, also as WordPress themes at ${u(wpNichePath(n))}` : ""}.`; }
  if (n && n.htmlLive) return `${n.label} template set: ${liveDesigns(n).length} distinct designs at ${u(`${INDUSTRIES[n.industry].hub}/${n.htmlSeg}`)}${n.wpLive ? `, also as WordPress themes at ${u(wpNichePath(n))}` : ""}.`;
  if (/\b(health ?care|medical)\b/.test(s)) { const i = INDUSTRIES.healthcare, ns = industryNiches("healthcare"); if (ns.length) return `Healthcare template hub: ${totals(ns).designs} designs across ${ns.length} sub-niches at ${u(i.hub)}.`; }
  if (GENERAL["real-estate"].test(s)) { const i = INDUSTRIES["real-estate"], ns = industryNiches("real-estate"); if (ns.length) return `Real estate template hub: ${totals(ns).designs} designs across ${ns.length} sub-niches at ${u(i.hub)}.`; }
  return "";
}
export function tplListLines(site) {
  const out = []; const u = (rel) => `${site}/ui/${rel}`;
  for (const ind of Object.values(INDUSTRIES)) { const ns = industryNiches(ind.id); if (!ns.length) continue; const wp = industryNiches(ind.id, true); out.push("", `TEMPLATE TREE, ${ind.label.toUpperCase()} (HTML hub ${u(ind.hub)}${wp.length ? `; WordPress ${u(wpIndustryPath(ind.id))}` : ""}):`, ...ns.map((n) => `  ${n.id} — ${n.label}: ${liveDesigns(n).length} designs ${u(`${ind.hub}/${n.htmlSeg}`)}${n.wpLive ? `; ${liveThemes(n).length} WordPress themes ${u(wpNichePath(n))}` : ""}`)); }
  return out;
}
export const industryLinks = (base, h) => Object.values(INDUSTRIES).filter((i) => industryNiches(i.id).length).map((i) => `<a href="${h.escHtml(base)}/ui/${h.escHtml(i.hub)}"><b>${h.escHtml(i.h1)}</b></a>`).join(" · ");
