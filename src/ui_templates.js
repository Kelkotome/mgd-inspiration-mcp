// Template hubs, WordPress theme pages, downloads, raw .md twins and the MCP direct answer (7-Nov-2026 healthcare pilot).
// All counts come from tpl_catalog.json (generated from the install-test results) and D1, never from typed numbers.
// R2: tpl/wordpress/<theme>/<version>/theme.zip, shot-1280.webp, shot-390.webp. No D1 table of its own.
import TPL_COPY from "./tpl_copy.json";
import { imgDims } from "./seo_pages.js"; // SEO r1: <img> width/height from the D1 row
import { INDUSTRIES, PLATFORMS, NICHES, MIN_DESIGNS, nicheById, nicheOfPattern, liveDesigns, liveThemes, industryNiches, platformIndustries, catalogMeta, wpIndustryPath, wpNichePath, themePath, nestedPatternPath,
  nichePath, industryGroups, groupOfNiche, groupParent, groupMembers, groupNiches, groupLive, nicheChildren, categoryOf, categoryIndustries, liveCategories, categoryPath, TEMPLATES_HUB } from "./ui_tree.js";

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
  // portfolios and creative studios: new copy, option A of the options in deploy-bundle-2026-11-09/r4-copy-templates.md
  // beauty, fitness and wellness (21-Nov-2026, templates r4)
  "beauty-fitness": "Names, people, places, services, classes, prices and times in every template are fictional samples to replace, and prices are zero placeholders. People are drawn placeholders, never photographs. The templates are designs, not medical or health advice, and they do not make a site compliant with any licensing, hygiene, consumer or advertising rule.",
  portfolio: "Names, people, projects, clients, places, prices and dates in every template are fictional samples to replace. Project pictures are drawn placeholders: replace them with your own work, and only show client work and results you have permission to share. The templates are designs, not legal advice, and they do not make a site compliant with any licensing, registration, consumer or advertising rule.",
  // construction (templates r5, 23-Nov-2026): option A of deploy-bundle-2026-11-07/construction.md plus the r4 zero-price rule (awaiting approval)
  construction: "Names, people, addresses, phone numbers, projects, prices, rates and arrival windows in every template are fictional samples to replace, and prices are zero placeholders. Licence, registration and insurance lines are left for the owner to fill in, and safety lines are general prompts. The templates are designs, not building, electrical, gas or safety advice, and they do not make a site compliant with any licensing, consumer or advertising rule.",
  // legal and professional services (templates r6, 24-Nov-2026): the r5 construction pattern with this industry's nouns; options in docs_updates/lane-templates-2026-11-24.md (awaiting approval)
  "professional-services": "Names, people, addresses, phone numbers, services, fees, rates and premiums in every template are fictional samples to replace, and fees are zero placeholders. Registration, licence and regulatory lines are left for the owner to fill in. The templates are designs, not legal, tax, accounting, insurance or financial advice, and they do not make a site compliant with any professional conduct, licensing, consumer or advertising rule.",
  // education (templates r7, 25-Nov-2026, STAGED): the r5/r6 pattern with this industry's nouns; options in docs_updates/lane-templates-2026-11-24.md (25-Nov section, awaiting approval)
  education: "Names, people, addresses, phone numbers, courses, classes, timetables, term dates and fees in every template are fictional samples to replace, and fees are zero placeholders. Accreditation, licence, inspection and safeguarding lines are left for the owner to fill in. The templates are designs, not education, childcare or legal advice, and they do not make a site compliant with any licensing, safeguarding, consumer or advertising rule.",
  // automotive (templates r8, 25-Nov-2026, STAGED): the r5 to r7 pattern with this industry's nouns; options in docs_updates/lane-templates-2026-11-24.md (25-Nov r8 section, awaiting approval)
  automotive: "Names, people, addresses, phone numbers, vehicles, services, prices, rates and opening hours in every template are fictional samples to replace, and prices are zero placeholders. Licence, registration, insurance, warranty and finance lines are left for the owner to fill in. The templates are designs, not mechanical, legal or financial advice, and they do not make a site compliant with any licensing, vehicle sale, consumer or advertising rule.",
  // travel and hotels (templates r9, 25-Nov-2026, STAGED): the r5 to r8 pattern with this industry's nouns; options in docs_updates/lane-templates-2026-11-24.md (25-Nov r9 section, awaiting approval)
  travel: "Names, people, addresses, phone numbers, places, rooms, tours, events, prices, rates, dates and opening hours in every template are fictional samples to replace, and prices are zero placeholders. Licence, registration, booking protection, grading, accessibility and insurance lines are left for the owner to fill in. The templates are designs, not travel, legal or financial advice, and they do not make a site compliant with any licensing, package travel, consumer, accessibility or advertising rule.",
};
const discloseFor = (ids) => [...new Set(ids)].map((i) => DISCLOSES[i]).filter(Boolean).join(" ");
const DISCLOSE_ALL = () => discloseFor(platformIndustries().map((i) => i.id));
const FORM_NOTE = "Forms are static sample markup. They do not send anything until you connect a form plugin.";

const zipUrl = (d, base) => `${base}/ui/download/wordpress/${d.theme.slug}.zip`;
const shot = (d, w, base) => `${base}/img/tpl/wordpress/${d.theme.slug}/${d.theme.version}/shot-${w}.webp`;
const R2_KEY = (d, f) => `tpl/wordpress/${d.theme.slug}/${d.theme.version}/${f}`;
const kb = (b) => `${Math.round(b / 1024)} KB`;
const count = (n, one, many) => `${n} ${n === 1 ? one : many || one + "s"}`;
const crumbNav = (h, base, list) => `<nav class="crumb" aria-label="Breadcrumb">${list.map(([t, u], i) => (u != null && i < list.length - 1 ? `<a href="${h.escHtml(base)}/ui${u ? "/" + h.escHtml(u) : ""}">${h.escHtml(t)}</a>` : h.escHtml(t))).join(" › ")}</nav>`;
export const crumbLd = (site, base, list) => ({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: list.map(([t, u], i) => ({ "@type": "ListItem", position: i + 1, name: t, item: `${site}${base}/ui${u ? "/" + u : ""}` })) });
// Breadcrumbs (restructure round, 25-Nov-2026): one root label everywhere, "Website templates", the same as the hub's own crumb (it used to read "Templates"
// here and "Free website templates" on the hub). HTML pages carry the top category and, inside a group with a parent, the group (linked to the parent's
// page): Website templates > Health and wellness > Healthcare > Medical > Cardiology. URLs stay flat; the crumb carries the hierarchy (the Framer model).
// A group crumb needs a live page to link to, so a group whose parent is below the page test is left out.
const groupHome = (g, wp) => { const p = g && groupParent(g); return p && (wp ? p.wpLive : p.htmlLive) ? p : null; };
export const TEMPLATES_CRUMB = "Website templates";
const ROOT_CRUMBS = () => [["UI screens", ""], [TEMPLATES_CRUMB, TEMPLATES_HUB]];
const categoryCrumbs = (c) => [...ROOT_CRUMBS(), [c.label, categoryPath(c)]];
// Knob (restructure round): false drops the top category from industry, group and niche breadcrumbs (and their BreadcrumbList); the category pages stay.
export const CRUMB_CATEGORY = true;
const INDUSTRY_CRUMBS = (ind) => { const c = CRUMB_CATEGORY ? categoryOf(ind.id) : null; return [...(c ? categoryCrumbs(c) : ROOT_CRUMBS()), [ind.label, ind.hub]]; };
export const nicheCrumbs = (n) => { const ind = INDUSTRIES[n.industry], g = groupOfNiche(n), p = groupHome(g); if (p) { const gc = [...INDUSTRY_CRUMBS(ind), [g.label, nichePath(p)]]; return p === n ? gc : [...gc, [n.label, nichePath(n)]]; } return [...INDUSTRY_CRUMBS(ind), [n.label, nichePath(n)]]; };
const WP_CRUMBS = () => [["UI screens", ""], [PLATFORMS.wordpress.h1, PLATFORMS.wordpress.hub]];
const wpIndCrumbs = (ind) => [...WP_CRUMBS(), [ind.label, wpIndustryPath(ind.id)]];
const wpNicheCrumbs = (n) => { const ind = INDUSTRIES[n.industry], g = groupOfNiche(n), p = groupHome(g, true); if (p) { const gc = [...wpIndCrumbs(ind), [g.label, wpNichePath(p)]]; return p === n ? gc : [...gc, [n.label, wpNichePath(n)]]; } return [...wpIndCrumbs(ind), [n.label, wpNichePath(n)]]; };
export const nicheCrumbHtml = (n, h, base) => crumbNav(h, base, nicheCrumbs(n));

const TEST_LINE = () => { const m = catalogMeta(); return m.wp ? `Each theme is a real zip installed and activated on WordPress ${m.wp} with PHP ${m.php} on ${m.tested}, then checked at 390, 768 and 1280 px for PHP errors, sideways scrolling and outside requests, and opened in the Site Editor with its block validator.` : ""; };
const totals = (niches, wp) => ({ niches: niches.length, designs: niches.reduce((a, n) => a + (wp ? liveThemes(n) : liveDesigns(n)).length, 0) });
const niceList = (a) => (a.length < 2 ? a.join("") : `${a.slice(0, -1).join(", ")} and ${a[a.length - 1]}`);
const LOCAL_CSS = `.tg{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1rem;margin:0 0 1.5rem}.tg .card .meta b{display:block}.facts{border-collapse:collapse;font-size:.9rem;margin:0 0 1.25rem;max-width:760px;width:100%}.facts th,.facts td{text-align:left;padding:.45rem .9rem .45rem 0;border-bottom:1px solid var(--border);vertical-align:top}.facts th{color:var(--muted);font-weight:600;width:34%}.facts td{overflow-wrap:anywhere}.facts.cols th{width:auto}
.plain{max-width:75ch;line-height:1.6;padding-left:1.2rem}.plain li{margin:.3rem 0}.acts{display:flex;flex-wrap:wrap;gap:.5rem;margin:0 0 1.25rem}.shots{display:grid;grid-template-columns:minmax(0,3fr) minmax(0,1fr);gap:1rem;align-items:start;margin:0 0 1.5rem}.shots img{width:100%;height:auto;border:1px solid var(--border);border-radius:10px;display:block}h2.s{font-size:1.05rem;margin:2.25rem 0 .5rem}@media (max-width:640px){.shots{grid-template-columns:minmax(0,1fr)}}`;

async function nicheImages(env, h, x, niches) {
  const ids = niches.map((n) => n.pattern); if (!ids.length) return {};
  const rows = await x.uiRows(env, (r) => ids.includes(r.category) && r.country === "web");   // MCP r3: cached UI rows, filtered in JS
  const out = {}; for (const r of rows) { const it = h.rowToItem(r, env); if (!out[it.pattern]) out[it.pattern] = it; } return out;
}
const nicheCard = (n, im, href, h, base, sub) => `<a class="card page" href="${h.escHtml(href)}">${im && im.image ? `<div class="th"><img loading="lazy"${imgDims(im)} src="${h.escHtml(base + im.image)}" alt="${h.escHtml(n.label)} template"/></div>` : ""}<div class="meta"><b>${h.escHtml(n.label)}</b><span>${h.escHtml(sub)}</span></div></a>`;
const themeCard = (n, d, h, base) => `<a class="card page" data-style="${h.escHtml(d.style)}" href="${h.escHtml(base)}/ui/${h.escHtml(themePath(n, d))}"><div class="th"><img loading="lazy" src="${h.escHtml(shot(d, 1280, base))}" alt="${h.escHtml(d.theme.name)} theme, front page"/></div><div class="meta"><b>${h.escHtml(d.theme.name)}</b><span>${h.escHtml(d.about)}</span></div></a>`;
const mdAlt = (h, base, rel) => `<p class="lede" style="font-size:.85rem">Plain text for assistants: <a href="${h.escHtml(base)}/ui/${h.escHtml(rel)}.md">this page as Markdown</a>.</p>`;
const STYLE_FILTER_JS = `<script>(function(){var g=document.getElementById("tgrid"),c=document.getElementById("tcount");if(!g)return;var cs=[].slice.call(g.querySelectorAll(".card"));document.addEventListener("click",function(e){var b=e.target.closest("[data-tf]");if(!b)return;e.preventDefault();var v=b.dataset.tf,n=0;cs.forEach(function(k){var ok=!v||k.dataset.style===v;k.style.display=ok?"":"none";if(ok)n++});if(c)c.textContent=n+" of "+cs.length+" themes";document.querySelectorAll("[data-tf]").forEach(function(x){x.setAttribute("aria-pressed",String(x===b))});try{history.replaceState(null,"",v?"?style="+v:location.pathname)}catch(_){}})})();</script>`;
const styleChips = (designs, h) => { const s = [...new Set(designs.map((d) => d.style))]; return s.length < 2 ? "" : `<div class="filters"><div><b>Style</b><a class="chip" data-tf="" aria-pressed="true" href="?" rel="nofollow">All</a>${s.map((v) => `<a class="chip" data-tf="${h.escHtml(v)}" aria-pressed="false" href="?style=${h.escHtml(v)}" rel="nofollow">${h.escHtml(v[0].toUpperCase() + v.slice(1))}</a>`).join("")}</div></div>`; };

const lk = (h, base, rel, text) => `<a href="${h.escHtml(base)}/ui/${h.escHtml(rel)}">${h.escHtml(text)}</a>`;
const lc = (t) => t.charAt(0).toLowerCase() + t.slice(1);
const faqHtml = (h, faq) => (faq.length ? `<h2 class="s">Questions</h2><div class="faq">${faq.map(([q, a]) => `<h3 style="font-size:.95rem;margin:1rem 0 .25rem">${h.escHtml(q)}</h3><p class="lede" style="margin:0">${h.escHtml(a)}</p>`).join("")}</div>` : "");
const faqLd = (faq) => ({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) });
// The niche grid of an industry hub: under one "Sub-niches" heading, or under its group headings when the industry has groups (healthcare).
function nicheGrid(ind, niches, img, h, base, wp) {
  const card = (n) => nicheCard(n, img[n.pattern], `${base}/ui/${wp ? wpNichePath(n) : nichePath(n)}`, h, base, wp ? count(liveThemes(n).length, "theme") : count(liveDesigns(n).length, "design"));
  const gs = industryGroups(ind.id).filter((g) => groupLive(g, wp));
  if (!gs.length) return `${wp ? "" : `<h2 class="s">Sub-niches</h2>`}<div class="tg">${niches.map(card).join("")}</div>`;
  return gs.map((g) => { const ns = groupNiches(g, wp); return `<h2 class="s" id="${h.escHtml(g.id)}">${h.escHtml(g.label)}</h2><p class="lede" style="margin:0 0 .6rem">${h.escHtml(`${count(ns.length, "sub-niche")}, ${totals(ns, wp).designs} ${wp ? "themes" : "designs"}`)}</p><div class="tg">${ns.map(card).join("")}</div>`; }).join("");
}

// /ui/<industry hub>
export async function industryPage(ind, env, base, h, x) {
  const site = x.siteOf(env), niches = industryNiches(ind.id), t = totals(niches), url = `${site}${base}/ui/${ind.hub}`, c = (TPL_COPY.industries || {})[ind.id] || {};
  const wp = industryNiches(ind.id, true), wt = totals(wp, true), img = await nicheImages(env, h, x, niches), crumbs = INDUSTRY_CRUMBS(ind), cat = categoryOf(ind.id);
  const desc = `${t.designs} free one-page ${ind.label.toLowerCase()} website templates across ${t.niches} sub-niches, each a distinct layout with HTML code and a DESIGN.md.`;
  const title = x.fitTitle(`${ind.h1} (${t.designs} free, with code) | MGD`, `${ind.h1} (${t.designs} free) | MGD`, `${ind.h1} | MGD`);
  const jsonld = [{ "@context": "https://schema.org", "@type": "CollectionPage", name: ind.h1, url, description: desc, publisher: x.MGD_ORG(site), ...x.licenceLd(site, base), ...(cat ? { isPartOf: { "@type": "CollectionPage", name: `${cat.label} website templates`, url: `${site}${base}/ui/${categoryPath(cat)}` } } : {}), hasPart: niches.map((n) => ({ "@type": "CollectionPage", name: `${n.label} website templates`, url: `${site}${base}/ui/${nichePath(n)}` })) }, crumbLd(site, base, crumbs)];
  const app = (ind.appPatterns || []).map((p) => `<a href="${h.escHtml(base)}/ui/${h.escHtml(x.patternSlug(p))}">${h.escHtml(x.label(p))}</a>`).join(" · ");
  const sibs = cat ? categoryIndustries(cat).filter((i) => i !== ind) : [];
  const body = x.head(h, { title, desc, canonical: url, image: Object.values(img)[0] ? site + base + Object.values(img)[0].image : null, jsonld, css: LOCAL_CSS, md: `${url}.md` })
  + `${h.backLink(base, "/ui", "All UI screens")}${crumbNav(h, base, crumbs)}<h1>${h.escHtml(ind.h1)}</h1>
<p class="lede">${h.escHtml(desc)} ${h.escHtml(c.intro || "")}</p>
${nicheGrid(ind, niches, img, h, base, false)}
${wp.length ? `<h2 class="s">Also for WordPress</h2><p class="lede" style="margin:0"><a href="${h.escHtml(base)}/ui/${h.escHtml(wpIndustryPath(ind.id))}"><b>${h.escHtml(ind.label)} WordPress themes</b></a>: ${wt.designs} block themes across ${wt.niches} sub-niches, each installed and tested.</p>` : ""}
${app ? `<h2 class="s">App and portal screens</h2><p class="lede" style="margin:0">${app}</p>` : ""}
<h2 class="s">What each sub-niche covers</h2><ul class="plain">${niches.map((n) => `<li><b>${h.escHtml(n.label)}.</b> ${h.escHtml(((TPL_COPY.niches || {})[n.id] || {}).intro || "")}</li>`).join("")}</ul>
<h2 class="s">What every template includes</h2><ul class="plain"><li>A full, responsive one-page home page written for that sub-niche.</li><li>HTML code and a DESIGN.md of colour, type and spacing tokens, in light and dark.</li><li>Original inline illustrations. No stock photos and no third-party images.</li></ul>
${cat ? `<p class="lede"><b>Part of ${h.escHtml(lc(cat.label))}:</b> ${lk(h, base, categoryPath(cat), `${cat.label} website templates`)}${sibs.length ? `, with ${sibs.map((i) => lk(h, base, i.hub, i.label)).join(" · ")}` : ""}. <a href="${h.escHtml(base)}/ui/${TEMPLATES_HUB}">All website templates</a>.</p>` : ""}
${BUILD_FALLBACK(h, base, `kind of ${lc(ind.label)} site`)}
<h2 class="s">Before you use one</h2><p class="lede">${h.escHtml(discloseFor([ind.id]))}</p>${mdAlt(h, base, ind.hub)}${x.MCP_NOTE(base)}${x.RIGHTS}</div>${h.saveWidget(base)}</body></html>`;
  return x.page(h, body);
}

// Facts for a top category, all counted from the catalog (never typed): designs, sub-niches, WordPress themes per industry.
function categoryFacts(c) {
  const inds = categoryIndustries(c).map((i) => { const ns = industryNiches(i.id), wp = industryNiches(i.id, true); return { i, ns, t: totals(ns), wp, wt: totals(wp, true) }; });
  return { inds, designs: inds.reduce((a, r) => a + r.t.designs, 0), niches: inds.reduce((a, r) => a + r.t.niches, 0), themes: inds.reduce((a, r) => a + r.wt.designs, 0), wpNiches: inds.reduce((a, r) => a + r.wt.niches, 0) };
}
function categoryFaq(c, f, u) {
  const cc = (TPL_COPY.categories || {})[c.id] || {}, L = lc(c.label);
  const out = [[`How many free ${L} website templates are there?`, `${f.designs} one-page designs across ${f.niches} sub-niches in ${count(f.inds.length, "industry", "industries")}: ${niceList(f.inds.map((r) => `${r.i.label} (${count(r.t.designs, "design")}, ${count(r.t.niches, "sub-niche")})`))}. Each design is a distinct layout, and a sub-niche page only exists once it has at least ${MIN_DESIGNS}.`]];
  const wpi = f.inds.filter((r) => r.wp.length);
  out.push([`Are the ${L} templates also WordPress themes?`, wpi.length ? `Yes, ${f.themes} of them are installable WordPress block themes across ${f.wpNiches} sub-niches: ${niceList(wpi.map((r) => `${r.i.label} (${u(wpIndustryPath(r.i.id))})`))}. ${TEST_LINE()}`.trim() : "Not yet. They come as HTML with a DESIGN.md."]);
  out.push([`Can I use them for a client or commercial site?`, `Yes. The HTML templates are free to use and adapt in any project, including commercial ones, with no credit needed in your product. WordPress themes: ${WP_LICENCE}`]);
  for (const qa of cc.faq || []) if (Array.isArray(qa) && qa[0] && qa[1]) out.push(qa);
  out.push([`Do the templates make a site compliant?`, discloseFor(f.inds.map((r) => r.i.id))]);
  return out;
}

// /ui/website-templates/<category>: the industries in a top category, with counts, representative screens, how-to-choose guidance and questions.
// "Can't find it?" fallback (benchmark module; MGD's version of an AI-builder CTA): the MCP server builds from the nearest design.
const BUILD_FALLBACK = (h, base, what) => `<h2 class="s">Can't find your ${h.escHtml(what)}?</h2><p class="lede">Build it with your AI from the nearest design: the free <a href="https://madegooddesigns.com/design-mcp-server/">Made Good Designs MCP server</a> gives Claude, Cursor or ChatGPT every template here with its HTML and DESIGN.md, for example <code>search_ui_screens(query="cardiology website template")</code>. Or browse <a href="${h.escHtml(base)}/ui/${TEMPLATES_HUB}">all website templates</a>.</p>`;
// Template cards labelled with their niche (benchmark module): the first WordPress theme of a niche, with its own screenshot; HTML niche card otherwise.
const labelledCard = (n, im, h, base) => { const d = liveThemes(n)[0]; return d ? `<a class="card page" href="${h.escHtml(base)}/ui/${h.escHtml(nichePath(n))}"><div class="th"><img loading="lazy" src="${h.escHtml(shot(d, 1280, base))}" alt="${h.escHtml(`${d.theme.name}, a ${lc(n.label)} template`)}"/></div><div class="meta"><b>${h.escHtml(`${d.theme.name} (${n.label})`)}</b><span>${h.escHtml(`${d.layoutName || "Layout"}: ${d.about}. ${count(liveDesigns(n).length, "design")} in this set.`)}</span></div></a>` : nicheCard(n, im, `${base}/ui/${nichePath(n)}`, h, base, count(liveDesigns(n).length, "design")); };

// "<category> WordPress themes" section (content gap 25-Nov: "business wordpress theme" 1,300/mo and the other "<category> wordpress theme" terms have
// no page of their own; page 1 for theme terms asks what the theme includes and what needs a plugin). Counts come from the catalog.
const wpH1 = (h1) => h1.replace(/website templates$/i, "WordPress themes");
function wpSection(c, f, h, base, h1) {
  const wpi = f.inds.filter((r) => r.wp.length); if (!f.themes || !wpi.length) return "";
  return `<h2 class="s" id="wordpress">${h.escHtml(wpH1(h1))}</h2><p class="lede">${h.escHtml(`${f.themes} of these designs are also free WordPress block themes, across ${f.wpNiches} sub-niches:`)} ${wpi.map((r) => `${lk(h, base, wpIndustryPath(r.i.id), `${r.i.label} WordPress themes`)} (${r.wt.designs})`).join(" · ")}. ${h.escHtml(TEST_LINE())}</p><p class="lede">${h.escHtml("Each theme is an installable zip with editable blocks, style variations and the same sample copy. Booking, ordering, payments, listing search and form handling are not built in: add the plugin or service you already use.")}</p>`;
}

// /ui/<category seg>: a standalone page (not a URL parent) for a top category: counted industries and designs, a child-link module, niche-labelled
// cards, which sections each kind of site needs, how to choose, questions (FAQPage), and the build-with-your-AI fallback. Copy in tpl_copy.json "categories".
export async function categoryPage(c, env, base, h, x) {
  const site = x.siteOf(env), f = categoryFacts(c), rel = categoryPath(c), url = `${site}${base}/ui/${rel}`, cc = (TPL_COPY.categories || {})[c.id] || {}, crumbs = categoryCrumbs(c);
  const h1 = c.h1 || `${c.label} website templates`, u = (r) => `${site}${base}/ui/${r}`;
  const reps = f.inds.flatMap((r) => r.ns.slice(0, 4)), img = await nicheImages(env, h, x, reps);
  const desc = `${f.designs} free one-page website templates for ${niceList(f.inds.map((r) => r.i.label.toLowerCase()))}, across ${f.niches} sub-niches. Each is a distinct layout with HTML code and a DESIGN.md${f.themes ? `, and ${f.themes} are also WordPress themes` : ""}.`;
  const faq = categoryFaq(c, f, u);
  const jsonld = [{ "@context": "https://schema.org", "@type": "CollectionPage", name: h1, url, description: desc, publisher: x.MGD_ORG(site), ...x.licenceLd(site, base), isPartOf: { "@type": "CollectionPage", name: "Free website templates", url: u(TEMPLATES_HUB) }, hasPart: f.inds.map((r) => ({ "@type": "CollectionPage", name: r.i.h1, url: u(r.i.hub) })),
    mainEntity: { "@type": "ItemList", numberOfItems: f.niches, itemListElement: f.inds.flatMap((r) => r.ns).map((n, i) => ({ "@type": "ListItem", position: i + 1, name: `${n.label} website templates`, url: u(nichePath(n)) })) } }, crumbLd(site, base, crumbs), faqLd(faq)];
  const others = liveCategories().filter((o) => o !== c);
  const body = x.head(h, { title: x.fitTitle(`${h1} (${f.designs} free, with code) | MGD`, `${h1} (${f.designs} free) | MGD`, `${h1} | MGD`), desc, canonical: url, image: Object.values(img)[0] ? site + base + Object.values(img)[0].image : null, jsonld, css: LOCAL_CSS, md: `${url}.md` })
  + `${h.backLink(base, `/ui/${TEMPLATES_HUB}`, "All website templates")}${crumbNav(h, base, crumbs)}<h1>${h.escHtml(h1)}</h1>
<p class="lede">${h.escHtml(desc)} ${h.escHtml(cc.intro || "")}</p>
<table class="facts cols"><thead><tr><th scope="col">Industry</th><th scope="col">Sub-niches</th><th scope="col">Designs</th><th scope="col">WordPress themes</th></tr></thead><tbody>${f.inds.map((r) => `<tr><td>${lk(h, base, r.i.hub, r.i.label)}</td><td>${r.t.niches}</td><td>${r.t.designs}</td><td>${r.wt.designs ? lk(h, base, wpIndustryPath(r.i.id), String(r.wt.designs)) : "0"}</td></tr>`).join("")}</tbody></table>
<h2 class="s">Looking for a more specific type?</h2><ul class="plain">${f.inds.map((r) => `<li><b>${lk(h, base, r.i.hub, r.i.label)}:</b> ${(industryGroups(r.i.id).some((g) => groupLive(g)) ? industryGroups(r.i.id).filter((g) => groupLive(g)).map((g) => `${h.escHtml(g.label)} (${groupNiches(g).map((n) => lk(h, base, nichePath(n), n.label)).join(", ")})`) : r.ns.map((n) => lk(h, base, nichePath(n), n.label))).join(" · ")}</li>`).join("")}</ul>
${f.inds.map((r) => `<h2 class="s">${lk(h, base, r.i.hub, r.i.h1)}</h2><p class="lede" style="margin:0 0 .6rem">${h.escHtml(`${count(r.t.designs, "design")} across ${count(r.t.niches, "sub-niche")}. ${((TPL_COPY.industries || {})[r.i.id] || {}).intro || ""}`)}</p><div class="tg">${r.ns.slice(0, 4).map((n) => labelledCard(n, img[n.pattern], h, base)).join("")}</div>`).join("")}
${wpSection(c, f, h, base, h1)}
<h2 class="s">Which sections each kind of site needs</h2><ul class="plain">${f.inds.flatMap((r) => r.ns).map((n) => `<li><b>${lk(h, base, nichePath(n), n.label)}.</b> ${h.escHtml(((TPL_COPY.niches || {})[n.id] || {}).intro || "")}</li>`).join("")}</ul>
${(cc.choose || []).length ? `<h2 class="s">How to choose</h2><ul class="plain">${cc.choose.map((t) => `<li>${h.escHtml(t)}</li>`).join("")}</ul>` : ""}
<h2 class="s">What every template includes</h2><ul class="plain"><li>A full, responsive one-page home page written for its sub-niche.</li><li>HTML code and a DESIGN.md of colour, type and spacing tokens, in light and dark.</li><li>Original inline illustrations. No stock photos and no third-party images.</li></ul>
${faqHtml(h, faq)}
${BUILD_FALLBACK(h, base, "kind of site")}
${others.length ? `<h2 class="s">Other categories</h2><p class="lede">${others.map((o) => lk(h, base, categoryPath(o), o.label)).join(" · ")} · <a href="${h.escHtml(base)}/ui/${TEMPLATES_HUB}">All website templates</a></p>` : ""}${mdAlt(h, base, rel)}${x.MCP_NOTE(base)}${x.RIGHTS}</div>${h.saveWidget(base)}</body></html>`;
  return x.page(h, body);
}

// The hub's "By category" block (on /ui/website-templates): every live category with its industries and counts.
export function categoryBlock(base, h) {
  const cs = liveCategories(); if (!cs.length) return "";
  return `<h2 style="font-size:1.05rem;margin:1rem 0 .5rem">By category</h2><ul class="lede" style="padding-left:1.1rem;margin:0 0 1.25rem">${cs.map((c) => { const f = categoryFacts(c); return `<li><a href="${h.escHtml(base)}/ui/${h.escHtml(categoryPath(c))}"><b>${h.escHtml(c.label)}</b></a> (${f.designs} designs): ${f.inds.map((r) => `<a href="${h.escHtml(base)}/ui/${h.escHtml(r.i.hub)}">${h.escHtml(r.i.label)}</a> ${r.t.designs}`).join(" · ")}</li>`; }).join("")}</ul>`;
}

// Below the designs on a sub-niche page: a group parent lists its specialties; a member links back to its group; every niche links to the rest of its industry.
export async function nicheExtras(n, env, base, h, x) {
  const ind = INDUSTRIES[n.industry], g = groupOfNiche(n), kids = nicheChildren(n), out = [];
  if (kids.length) {
    const img = await nicheImages(env, h, x, kids), gc = (TPL_COPY.groups || {})[g.id] || {};
    out.push(`<h2 class="s" id="specialties">${h.escHtml(`Looking for a more specific ${lc(g.label)} type?`)}</h2><p class="lede" style="margin:0 0 .6rem">${h.escHtml(`${count(kids.length, "specialty", "specialties")}, ${totals(kids).designs} designs. ${gc.intro || ""}`)}</p><div class="tg">${kids.map((k) => nicheCard(k, img[k.pattern], `${base}/ui/${nichePath(k)}`, h, base, count(liveDesigns(k).length, "design"))).join("")}</div>`);
  }
  if (n.under && g) { const p = nicheById(n.under), sibs = groupMembers(g).filter((k) => k !== n); out.push(`<p class="lede"><b>Part of ${h.escHtml(lc(g.label))}:</b> ${p.htmlLive ? lk(h, base, nichePath(p), `${p.label} website templates`) : lk(h, base, ind.hub + "#" + g.id, `${g.label} on the ${lc(ind.label)} hub`)}${sibs.length ? `. Other ${h.escHtml(lc(g.label))} specialties: ${sibs.map((k) => lk(h, base, nichePath(k), k.label)).join(" · ")}` : ""}.</p>`); }
  const near = new Set([n, ...kids, ...(n.under && g ? groupNiches(g) : [])]), more = industryNiches(ind.id).filter((k) => !near.has(k));
  if (more.length) out.push(`<p class="lede"><b>More ${h.escHtml(lc(ind.label))} templates:</b> ${more.map((k) => lk(h, base, nichePath(k), k.label)).join(" · ")}. ${lk(h, base, ind.hub, `All ${lc(ind.label)} templates`)}.</p>`);
  return out.join("\n");
}

// Inserted into the sub-niche page (uiPatternPage): the distinct designs first, the style and device screens below them as filters.
export function nicheDesignsBlock(n, items, base, h, itemPath) {
  const ds = liveDesigns(n);
  const cards = ds.map((d) => { const it = items.find((i) => (i.variant || "homepage") === d.variant && i.style === d.style && i.platform === "web"); if (!it) return ""; return `<a class="card page" href="${h.escHtml(itemPath(it, base))}"><div class="th"><img loading="lazy"${imgDims(it)} src="${h.escHtml(base + it.image)}" alt="${h.escHtml(`${n.label} template, ${d.layoutName} layout`)}"/></div><div class="meta"><b>${h.escHtml(d.layoutName)}</b><span>${h.escHtml(d.about)}</span></div></a>`; }).join("");
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
${nicheGrid(ind, niches, img, h, base, true)}
<p class="lede"><b>Also as HTML:</b> <a href="${h.escHtml(base)}/ui/${h.escHtml(ind.hub)}">${h.escHtml(ind.h1)}</a>.</p>
<h2 class="s">Licence</h2><p class="lede">${h.escHtml(WP_LICENCE)}</p><h2 class="s">Before you use one</h2><p class="lede">${h.escHtml(discloseFor([ind.id]))} ${h.escHtml(FORM_NOTE)}</p>${mdAlt(h, base, rel)}${x.MCP_NOTE(base)}</div>${h.saveWidget(base)}</body></html>`;
  return x.page(h, body);
}

// a group parent's WordPress page lists its specialties; a member links back to its group
const wpKids = (n, h, base) => { const kids = nicheChildren(n, true), g = groupOfNiche(n); if (kids.length) return `<p class="lede"><b>${h.escHtml(g.label)} specialties:</b> ${kids.map((k) => lk(h, base, wpNichePath(k), `${k.label} WordPress themes`)).join(" · ")}.</p>`; if (n.under && g) return `<p class="lede"><b>Part of ${h.escHtml(lc(g.label))}:</b> ${(groupHome(g, true) ? lk(h, base, wpNichePath(groupHome(g, true)), `${groupHome(g, true).label} WordPress themes`) : lk(h, base, wpIndustryPath(n.industry), `${INDUSTRIES[n.industry].label} WordPress themes`))}.</p>`; return ""; };
// /ui/wordpress-themes/<industry>/<niche>; ?style= filters in place, the canonical stays on the path
export async function platformNichePage(n, env, base, h, x) {
  const site = x.siteOf(env), ind = INDUSTRIES[n.industry], ds = liveThemes(n), rel = wpNichePath(n), url = `${site}${base}/ui/${rel}`, crumbs = wpNicheCrumbs(n), c = (TPL_COPY.niches || {})[n.id] || {};
  const h1 = `${n.label} WordPress themes`, desc = `${ds.length} free ${n.label.toLowerCase()} WordPress block themes, each a distinct layout with editable blocks, style variations and copy written for ${n.label.toLowerCase()}.`;
  const jsonld = [{ "@context": "https://schema.org", "@type": "CollectionPage", name: h1, url, description: desc, publisher: x.MGD_ORG(site), mainEntity: { "@type": "ItemList", numberOfItems: ds.length, itemListElement: ds.map((d, i) => ({ "@type": "ListItem", position: i + 1, name: d.theme.name, url: `${site}${base}/ui/${themePath(n, d)}` })) } }, crumbLd(site, base, crumbs)];
  const body = x.head(h, { title: x.fitTitle(`${h1} (${ds.length} free, tested) | MGD`, `${h1} (${ds.length} free) | MGD`, `${h1} | MGD`), desc, canonical: url, image: site + shot(ds[0], 1280, base), jsonld, css: LOCAL_CSS, md: `${url}.md` })
  + `${h.backLink(base, "/ui", "All UI screens")}${crumbNav(h, base, crumbs)}<h1>${h.escHtml(h1)}</h1><p class="lede">${h.escHtml(desc)} ${h.escHtml(c.intro || "")}</p>${styleChips(ds, h)}<p class="lede" id="tcount">${ds.length} themes</p><div class="tg" id="tgrid">${ds.map((d) => themeCard(n, d, h, base)).join("")}</div>
<p class="lede"><b>Also as HTML:</b> <a href="${h.escHtml(base)}/ui/${h.escHtml(nichePath(n))}">${h.escHtml(n.label)} website templates</a>. <b>More in ${h.escHtml(ind.label)}:</b> <a href="${h.escHtml(base)}/ui/${h.escHtml(wpIndustryPath(ind.id))}">${h.escHtml(ind.label)} WordPress themes</a>.</p>${wpKids(n, h, base)}
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
  const nLine = (n) => `- [${n.label}](${u(nichePath(n))}): ${liveDesigns(n).length} designs. ${(TPL_COPY.niches[n.id] || {}).intro || ""}`;
  if (hit.type === "category") { const c = hit.c, f = categoryFacts(c), cc = (TPL_COPY.categories || {})[c.id] || {}; return { rel: categoryPath(c), md: `# ${c.h1 || c.label + " website templates"}\n\n${f.designs} free one-page designs across ${f.niches} sub-niches, each a distinct layout with HTML code and a DESIGN.md. ${cc.intro || ""}\n\n${f.inds.map((r) => `## ${r.i.label} (${u(r.i.hub)})\n${r.t.designs} designs across ${r.t.niches} sub-niches${r.wt.designs ? `; ${r.wt.designs} WordPress themes at ${u(wpIndustryPath(r.i.id))}` : ""}.\n${r.ns.map(nLine).join("\n")}`).join("\n\n")}\n\n${(cc.choose || []).length ? `## How to choose\n${cc.choose.map((x) => `- ${x}`).join("\n")}\n\n` : ""}## Questions\n${categoryFaq(c, f, u).map(([q, a]) => `**${q}** ${a}`).join("\n\n")}\n\nAll website templates: ${u(TEMPLATES_HUB)}\n` }; }
  if (hit.type === "industry") { const ns = industryNiches(hit.ind.id), t = totals(ns), gs = industryGroups(hit.ind.id).filter((g) => groupLive(g)), cat = categoryOf(hit.ind.id); return { rel: hit.ind.hub, md: `# ${hit.ind.h1}\n\n${t.designs} free one-page templates across ${t.niches} sub-niches, each a distinct layout with HTML code and a DESIGN.md.\n\n${gs.length ? gs.map((g) => `## ${g.label}\n${groupNiches(g).map(nLine).join("\n")}`).join("\n\n") : `## Sub-niches\n${ns.map(nLine).join("\n")}`}\n\nWordPress themes: ${u(wpIndustryPath(hit.ind.id))}\n${cat ? `Category: ${cat.label} ${u(categoryPath(cat))}\n` : ""}\n${DISCLOSE}\n` }; }
  if (hit.type === "niche") { const n = hit.n, ind = hit.ind, rel = nichePath(n), kids = nicheChildren(n), g = groupOfNiche(n); return { rel, md: `# ${n.label} website templates\n\n${liveDesigns(n).length} distinct one-page designs with HTML code and a DESIGN.md.\n\n${liveDesigns(n).map((d) => `- **${d.layoutName}**: ${d.about}`).join("\n")}\n\n${kids.length ? `## ${g.label} specialties\n${kids.map(nLine).join("\n")}\n\n` : ""}${n.under && g && groupHome(g) ? `Group: ${g.label} ${u(nichePath(groupHome(g)))}\n` : ""}${n.wpLive ? `WordPress themes: ${u(wpNichePath(n))}\n\n` : ""}Hub: ${u(ind.hub)}\n\n${DISCLOSE}\n` }; }
  if (hit.type === "platform") { const inds = platformIndustries(), ns = inds.flatMap((i) => industryNiches(i.id, true)), t = totals(ns, true); return { rel: PLATFORMS.wordpress.hub, md: `# WordPress themes\n\n${t.designs} free block themes across ${t.niches} sub-niches. ${TEST_LINE()}\n\n${inds.map((i) => `## ${i.label}\n${industryNiches(i.id, true).map((n) => `- [${n.label}](${u(wpNichePath(n))}): ${liveThemes(n).length} themes`).join("\n")}`).join("\n\n")}\n\n${std}\n` }; }
  if (hit.type === "platform-industry") { const ns = industryNiches(hit.ind.id, true), t = totals(ns, true); return { rel: wpIndustryPath(hit.ind.id), md: `# ${hit.ind.label} WordPress themes\n\n${t.designs} free block themes across ${t.niches} sub-niches. ${TEST_LINE()}\n\n${ns.map((n) => `- [${n.label}](${u(wpNichePath(n))}): ${liveThemes(n).length} themes`).join("\n")}\n\n${std}\n` }; }
  if (hit.type === "platform-niche") { const n = hit.n; return { rel: wpNichePath(n), md: `# ${n.label} WordPress themes\n\n${liveThemes(n).length} free block themes, each a distinct layout. ${(TPL_COPY.niches[n.id] || {}).intro || ""} ${TEST_LINE()}\n\n${liveThemes(n).map((d) => themeLine(n, d)).join("\n")}\n\n${n.services && n.services.length ? `Sample services: ${niceList(n.services)}.\n\n` : ""}Also as HTML: ${u(nichePath(n))}\n\n${std}\n` }; }
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
  ["orthodontics", /\b(orthodont\w*|braces)\b/], ["dental", /\b(dental|dentists?|dentistry)\b/], ["cardiology", /\b(cardiolog\w*|heart (clinic|doctor|practice))\b/], ["dermatology", /\b(dermatolog\w*|skin clinic)\b/], ["pediatrics", /\b(p(a)?ediatric\w*|children'?s (clinic|doctor))\b/], ["fertility", /\b(fertility|ivf)\b/], ["optometry", /\b(optometr\w*|opticians?|eye (clinic|care|doctor)|eyecare)\b/], ["pharmacy", /\b(pharmac\w*|drugstore|chemist)\b/], ["hospital", /\bhospitals?\b/], ["medical", /\b(medical (practice|clinic|office|center|centre)|primary care|family (doctor|practice)|gp (practice|surgery)|doctors?( office)?|medical)\b/],
  // construction and home services (7-Nov-2026). After real estate, so "home builder" stays a real estate niche; "website builder" and "page builder" never match.
  ["pest-control", /\b(pest control\w*|exterminators?|rodent control|bed bugs?)\b/], ["cleaning-service", /\b(cleaning (services?|compan(y|ies)|business(es)?)|cleaners|house cleaning|home cleaning|office cleaning|maid services?|janitorial)\b/],
  ["landscaping", /\b(landscap(ing|ers?)|lawn care|garden design(ers?)?|gardeners?|gardening services?)\b/], ["roofing", /\b(roof(ing|ers?)|roof repairs?)\b/], ["electrician", /\b(electricians?|electrical (contractors?|compan(y|ies)|services))\b/],
  ["hvac", /\b(hvac|heating and (cooling|air)|air conditioning|ac repair|furnaces?|heat pumps?)\b/], ["plumber", /\b(plumb(ers?|ing))\b/],
  ["construction", /\b(construction( compan(y|ies)| firms?)?|(general|building) contractors?|building compan(y|ies)|renovations?)\b|\b(?:construction|building|local|general) builders?\b/],
  // portfolios and creative studios (13-Nov-2026), last so every older niche keeps its match ("estate agency", "wedding photographer", "travel agency" stay where they were).
  // No niche matches the bare word "portfolio": that query gets the hub line (GENERAL.portfolio in tplHint).
  ["developer-portfolio", /\b((web |software |front[- ]?end |full[- ]?stack )?developers?|programmers?|software engineers?|coders?) (portfolios?|websites?|sites?)\b/], ["marketing-agency", /\b((digital |content |seo )?marketing (agenc(y|ies)|firms?|consultanc(y|ies)|compan(y|ies))|seo agenc(y|ies))\b/],
  ["graphic-designer", /\b(graphic design\w*|brand designers?|illustrators?|designer portfolios?)\b/], ["photography", /\b(photograph\w*|photo studios?)\b/], ["interior-design", /\b(interior (design\w*|decorat\w*)|interiors)\b/],
  ["architecture", /\b(architects?|architectural|architecture (firms?|practices?|studios?|websites?|templates?|portfolios?))\b/], ["agency", /\b((creative|design|digital|branding|brand|advertising) agenc(y|ies)|design studios?|(?<!(travel|insurance|staffing|recruitment|estate|real estate|marketing|seo|employment|modelling|modeling|talent|news) )agenc(y|ies))\b/],
  ["personal-portfolio", /\b(personal (portfolios?|websites?|sites?)|freelancer?s? (portfolios?|websites?)|one[- ]person portfolios?)\b/],
  // beauty, fitness and wellness (21-Nov-2026), last so every older niche keeps its match. "makeup artist portfolio" stays here (makeup-artist precedes nothing that
  // matches it). The bare words "beauty", "wellness", "salon" get the hub line (GENERAL["beauty-fitness"] in tplHint); "salon website" alone is the flat n12 salon pattern.
  ["makeup-artist", /\b(make[- ]?up artists?|mua|bridal make[- ]?up)\b/], ["nail-salon", /\b(nail (salons?|bars?|studios?|technicians?|art)|manicur\w*|pedicur\w*)\b/], ["barbershop", /\b(barber ?shops?|barbers?)\b/],
  ["hair-salon", /\b(hair (salons?|studios?|stylists?|dressers?)|hairdressers?|hairstylists?)\b/], ["spa", /\b((day |wellness |massage )?spas?|massage( studios?| therapists?)?)\b/],
  ["yoga", /\b(yoga( studios?| teachers?| instructors?| classes)?)\b/], ["fitness", /\b(personal trainers?|fitness (trainers?|coach(es|ing)?|studios?|instructors?)|online (fitness )?coaching|fitness)\b/], ["gym", /\b(gyms?|strength gyms?|crossfit)\b/],
  // legal and professional services (24-Nov-2026, templates r6), last so every older niche keeps its match ("marketing consultancy" stays marketing-agency,
  // "creative agency" stays agency). The bare words "professional services", "legal services", "financial services" get the hub line (GENERAL["professional-services"]).
  ["law-firm", /\b(law (firms?|practices?)|legal (firms?|practices?)|solicitors' firms?)\b/], ["lawyer", /\b(lawyers?|attorneys?|solicitors?|law offices?|barristers?|advocates?)\b/],
  ["tax-preparation", /\b(tax (prep(arers?|aration)?|offices?|returns?|services?|websites?|advisers?|advisors?)|tax[- ]prep)\b/], ["accounting", /\b(accounting( firms?| practices?)?|accountants?|bookkeep(ing|ers?)|payroll services?)\b/],
  ["financial-advisor", /\b(financial (advis[eo]rs?|planners?|planning)|wealth (managers?|management)|independent advis[eo]rs?)\b/], ["insurance-agency", /\b(insurance( agenc(y|ies)| agents?| brokers?| brokerages?)?)\b/],
  ["consulting", /\b(consult(ing|ancy|ancies|ants?)( firms?)?|management consult\w*|business consultants?)\b/], ["staffing-agency", /\b(staffing( agenc(y|ies))?|recruit(ment|ers?|ing)( agenc(y|ies))?|employment agenc(y|ies)|temp agenc(y|ies))\b/],
  // education (25-Nov-2026, templates r7, staged), last so every older niche keeps its match ("yoga classes" stays yoga, "fitness coaching" stays fitness).
  // The bare words "education", "e-learning", "learning" get the hub line (GENERAL.education); "school website" is the school niche.
  ["preschool", /\b(pre-?schools?|pre-?k|kindergartens?|nursery schools?|nurser(y|ies)|early years)\b/], ["daycare", /\b(day ?cares?|child ?care|after[- ]school (care|clubs?)|creches?|crèches?)\b/],
  ["university", /\b(universit(y|ies)|colleges?|higher education|campus(es)?)\b/], ["music-school", /\b(music (schools?|lessons?|teachers?|academ(y|ies)|tuition)|(piano|guitar|violin|singing|voice|drum) (lessons?|teachers?))\b/],
  ["dance-studio", /\b(dance (studios?|schools?|classes|academ(y|ies)|teachers?|lessons?)|ballet (schools?|studios?|classes))\b/], ["tutoring", /\b(tutor(s|ing)?|tuition (centres?|centers?)|learning centres?|learning centers?)\b/],
  ["online-course", /\b(online (courses?|schools?|academ(y|ies)|classes)|e-?learning|course (creators?|websites?|sales pages?|platforms?)|lms)\b/], ["school", /\b(schools?|academ(y|ies)|primary|secondary|high schools?|k-?12)\b/],
  // automotive (25-Nov-2026, templates r8, staged), last so every older niche keeps its match. Most specific first: "auto body repair" is a body shop, "car wash and
  // detailing" a car wash, "mobile mechanic" auto repair. The bare words "automotive", "car", "vehicle" get the hub line (GENERAL.automotive).
  ["towing", /\b(tow(ing| trucks?| compan(y|ies)| services?| operators?)|roadside (assistance|help|recovery)|breakdown (recovery|services?)|vehicle recovery|wreckers?)\b/],
  ["auto-body", /\b((auto ?)?body ?shops?|auto body|collision (repair|cent(er|re)s?|shops?)|panel beat\w*|dent repair|car body repair)\b/],
  ["tire-shop", /\b(tires?|tyres?|tire (shops?|cent(er|re)s?|stores?)|tyre (shops?|fitters?|fitting|cent(er|re)s?)|wheel alignment)\b/],
  ["car-wash", /\b(car ?wash(es)?|auto wash(es)?|hand wash(es)?|wash (bays?|clubs?))\b/],
  ["car-detailing", /\b((car |auto |mobile )?detailing|(car |auto |mobile )detailers?|ceramic coatings?|paint correction|car valet(ing)?)\b/],
  ["car-rental", /\b(car (rentals?|hire)|(van|vehicle|auto) (rentals?|hire)|rent[- ]a[- ]car|rental cars?)\b/],
  ["auto-repair", /\b(auto (repair|shops?|mechanics?|service|garages?)|car (repairs?|service|servicing|mechanics?|garages?)|(mobile )?mechanics?|garages?|motor repairs?)\b/],
  ["car-dealership", /\b(car (dealers?|dealerships?|lots?|sales|showrooms?)|(auto|motor|vehicle|used car) (dealers?|dealerships?|sales)|dealerships?|used cars?|pre-?owned cars?|car yards?)\b/],
  // travel and hotels (25-Nov-2026, templates r9, staged), last so every older niche keeps its match ("spa resort" stays a spa, "holiday cottage" and "cabin
  // rentals" stay vacation rental, "wedding venue" stays a venue). Most specific first: "hostel" before "hotel", "travel agent" before "tours". The bare
  // words "travel", "tourism industry", "accommodation" get the hub line (GENERAL.travel).
  ["hostel", /\b(hostels?|backpackers?|bunk ?houses?|dorm beds?)\b/],
  ["bed-and-breakfast", /\b(bed (and|&) breakfasts?|b ?& ?bs?|bnbs?|guest ?houses?|country inns?|inns?)\b/],
  ["campground", /\b(camp ?grounds?|camp ?sites?|camping( sites?| parks?| grounds?)?|glamping|caravan (parks?|sites?)|rv (parks?|resorts?)|holiday parks?)\b/],
  ["resort", /\b(resorts?)\b/],
  ["travel-agency", /\b(travel (agenc(y|ies)|agents?|consultants?|advis[eo]rs?|planners?)|holiday (agenc(y|ies)|planners?)|trip planners?|honeymoon planners?)\b/],
  ["tourism", /\b(tourism( boards?| offices?| sites?| websites?)?|destination (sites?|websites?|marketing|guides?)|visitor (cent(er|re)s?|guides?|information)|tourist (boards?|information|offices?))\b/],
  ["tour-operator", /\b(tour (operators?|compan(y|ies)|guides?|websites?|bookings?)|tours|guided (tours?|walks?)|walking tours?|food tours?|boat trips?|day trips?|adventure travel|excursions?)\b/],
  ["hotel", /\b(hotels?|motels?|lodges?)\b/]];
const OTHER_PLATFORMS = /\b(shopify|magento|joomla|wix|squarespace|webflow|drupal|woocommerce|ghost)\b/;
export function tplAnswer({ q, platform }, site) {
  const s = String(q || "").toLowerCase(), base = "", u = (rel) => `${site}/ui/${rel}`, m = catalogMeta();
  const nicheId = (ALIASES.find(([, rx]) => rx.test(s)) || [])[0], n = nicheId ? nicheById(nicheId) : null;
  const general = Object.values(GENERAL).some((rx) => rx.test(s)), other = (s.match(OTHER_PLATFORMS) || [])[1];
  // "theme" alone is ambiguous ("theme switcher", "dark theme"): it means WordPress only next to a niche, and never next to app or dashboard words.
  const named = platform === "wordpress" || /\b(word ?press|wp theme|block theme|gutenberg|full site editing)\b/.test(s);
  const wpIntent = named || (n && /\bthemes?\b/.test(s.replace(/\b(dark|light|night)\s+themes?\b/g, " ")) && !/\b(app|apps|mobile|dashboard|portal|screen|screens|switch\w*|toggle)\b/.test(s));
  if (other) { const name = other[0].toUpperCase() + other.slice(1); return `${name}: Made Good Designs has no ${name} templates. Templates come as HTML and as WordPress block themes.${n && n.htmlLive ? ` For ${n.label.toLowerCase()}: HTML ${u(nichePath(n))}${n.wpLive ? `, WordPress ${u(wpNichePath(n))}` : ""}.` : ""}`; }
  if (wpIntent) {
    if (n && n.wpLive) { const ds = liveThemes(n); return indLine(n, s, u) + `${n.label} WordPress themes: ${ds.length} free block themes, each a distinct layout, all installed and tested on WordPress ${m.wp} with PHP ${m.php} (${m.tested}). Listing: ${u(wpNichePath(n))}\n\n${ds.map((d, i) => `${i + 1}. ${d.theme.name}: ${d.about}. Default style ${d.style}, ${d.theme.variations} style variations.\n   page (cite this): ${u(themePath(n, d))}\n   download: ${site}/ui/download/wordpress/${d.theme.slug}.zip`).join("\n")}\n\nInstall: Appearance, Themes, Add New Theme, Upload Theme, then Activate. Licence: ${WP_LICENCE} ${discloseFor([n.industry])} ${FORM_NOTE} Same designs as HTML: ${u(nichePath(n))}`; }
    if (n) return `No ${n.label.toLowerCase()} WordPress theme yet.${n.htmlLive ? ` The HTML templates are here: ${u(nichePath(n))}.` : ""} All WordPress themes: ${u(PLATFORMS.wordpress.hub)}`;
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
const GENERAL = { healthcare: /\b(health ?care|medical|clinics?)\b/, "real-estate": /\b(real estate|realty|propert(y|ies))\b/, restaurant: /\b(restaurants?|food and drink|hospitality|food business(es)?)\b/, wedding: /\b(weddings?( and events?)?|wedding industry|bridal)\b/, portfolio: /\b(portfolios?|creative studios?)\b/, "beauty-fitness": /\b(beauty( salons?)?|wellness|salons?|health and beauty|beauty and (fitness|wellness)|hair and beauty)\b/, "professional-services": /\b(professional services?|professional firms?|legal services?|financial services?|legal and (professional|financial)|business services)\b/, construction: /\b(construction|home services?|tradespeople|tradesmen|trade business(es)?|trades website)\b/, automotive: /\b(automotive|cars?|vehicles?|auto (industry|business(es)?)|motor (trade|industry))\b/, education: /\b(education(al)?|e-?learning|learning (websites?|platforms?)|edtech|teaching)\b/, travel: /\b(travel( and (tourism|hospitality|hotels?))?|tourism industry|travel industry|hospitality and travel|accommodation|lodging|holiday (business(es)?|compan(y|ies)))\b/ };
// hubFirst industries: words that ask for the niche itself, not the whole industry
const HUB_SKIP = { restaurant: /\b(casual dining|bistros?|brasseries?|neighbou?rhood)\b/, construction: /\b(compan(y|ies)|firms?|general contractors?|builders?)\b/ };
export function tplHint({ q }, site) {
  const s = String(q || "").toLowerCase(); if (!/\b(templates?|website|landing page|homepage|home page)\b/.test(s)) return "";
  const id = (ALIASES.find(([, rx]) => rx.test(s)) || [])[0], n = id ? nicheById(id) : null, u = (rel) => `${site}/ui/${rel}`;
  if (n && n.htmlLive && INDUSTRIES[n.industry].hubFirst && n.id === n.industry && !(HUB_SKIP[n.industry] && HUB_SKIP[n.industry].test(s))) { const i = INDUSTRIES[n.industry], ns = industryNiches(i.id); return `${i.label} template hub: ${totals(ns).designs} designs across ${ns.length} sub-niches at ${u(i.hub)}. ${n.label}: ${liveDesigns(n).length} distinct designs at ${u(nichePath(n))}${n.wpLive ? `, also as WordPress themes at ${u(wpNichePath(n))}` : ""}.`; }
  if (n && n.htmlLive) return `${n.label} template set: ${liveDesigns(n).length} distinct designs at ${u(nichePath(n))}${n.wpLive ? `, also as WordPress themes at ${u(wpNichePath(n))}` : ""}.`;
  if (/\b(health ?care|medical)\b/.test(s)) { const i = INDUSTRIES.healthcare, ns = industryNiches("healthcare"); if (ns.length) return `Healthcare template hub: ${totals(ns).designs} designs across ${ns.length} sub-niches at ${u(i.hub)}.`; }
  if (GENERAL["real-estate"].test(s)) { const i = INDUSTRIES["real-estate"], ns = industryNiches("real-estate"); if (ns.length) return `Real estate template hub: ${totals(ns).designs} designs across ${ns.length} sub-niches at ${u(i.hub)}.`; }
  // portfolio (13-Nov-2026): no niche is named like the industry, so the bare "portfolio website template" gets the hub here (hubFirst).
  // beauty, fitness and wellness (21-Nov-2026): no niche is named like the industry, so "beauty", "wellness" or a bare "salon website template" gets the hub (hubFirst).
  if (GENERAL["beauty-fitness"].test(s) && !id) { const i = INDUSTRIES["beauty-fitness"], ns = industryNiches("beauty-fitness"); if (ns.length) return `${i.label} template hub: ${totals(ns).designs} designs across ${ns.length} sub-niches at ${u(i.hub)}.`; }
  if (GENERAL.portfolio.test(s)) { const i = INDUSTRIES.portfolio, ns = industryNiches("portfolio"); if (ns.length) return `${i.label} template hub: ${totals(ns).designs} designs across ${ns.length} sub-niches at ${u(i.hub)}.`; }
  // legal and professional services (24-Nov-2026): no niche is named like the industry, so "professional services" or "legal services" gets the hub (hubFirst).
  if (GENERAL["professional-services"].test(s) && !id) { const i = INDUSTRIES["professional-services"], ns = industryNiches("professional-services"); if (ns.length) return `${i.label} template hub: ${totals(ns).designs} designs across ${ns.length} sub-niches at ${u(i.hub)}.`; }
  // education (25-Nov-2026, staged): no niche is named like the industry, so "education website template" or "e-learning" gets the hub (hubFirst).
  if (GENERAL.education.test(s) && !id) { const i = INDUSTRIES.education, ns = industryNiches("education"); if (ns.length) return `${i.label} template hub: ${totals(ns).designs} designs across ${ns.length} sub-niches at ${u(i.hub)}.`; }
  // automotive (25-Nov-2026, staged): no niche is named like the industry, so "automotive website template" or "car website template" gets the hub (hubFirst).
  if (GENERAL.automotive.test(s) && !id) { const i = INDUSTRIES.automotive, ns = industryNiches("automotive"); if (ns.length) return `${i.label} template hub: ${totals(ns).designs} designs across ${ns.length} sub-niches at ${u(i.hub)}.`; }
  // travel and hotels (25-Nov-2026, staged): no niche is named like the industry, so "travel website template" or "accommodation" gets the hub (hubFirst).
  if (GENERAL.travel.test(s) && !id) { const i = INDUSTRIES.travel, ns = industryNiches("travel"); if (ns.length) return `${i.label} template hub: ${totals(ns).designs} designs across ${ns.length} sub-niches at ${u(i.hub)}.`; }
  if (GENERAL.construction.test(s)) { const i = INDUSTRIES.construction, ns = industryNiches("construction"); if (ns.length) return `${i.label} template hub: ${totals(ns).designs} designs across ${ns.length} sub-niches at ${u(i.hub)}.`; }
  return "";
}
export function tplListLines(site) {
  const out = []; const u = (rel) => `${site}/ui/${rel}`;
  for (const ind of Object.values(INDUSTRIES)) { const ns = industryNiches(ind.id); if (!ns.length) continue; const wp = industryNiches(ind.id, true); out.push("", `TEMPLATE TREE, ${ind.label.toUpperCase()} (HTML hub ${u(ind.hub)}${wp.length ? `; WordPress ${u(wpIndustryPath(ind.id))}` : ""}):`, ...ns.map((n) => `  ${n.id} — ${n.label}${n.group && (industryGroups(ind.id).length) ? ` [${groupOfNiche(n).label}]` : ""}: ${liveDesigns(n).length} designs ${u(nichePath(n))}${n.wpLive ? `; ${liveThemes(n).length} WordPress themes ${u(wpNichePath(n))}` : ""}`)); }
  return out;
}
export const industryLinks = (base, h) => Object.values(INDUSTRIES).filter((i) => industryNiches(i.id).length).map((i) => `<a href="${h.escHtml(base)}/ui/${h.escHtml(i.hub)}"><b>${h.escHtml(i.h1)}</b></a>`).join(" · ");
