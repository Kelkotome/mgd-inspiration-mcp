// Template taxonomy and nested URLs (7-Nov-2026 healthcare pilot). Spec: docs/template-taxonomy.md.
// Four categories on every template: Platform (HTML, WordPress), Type (one-page, website, landing page), Industry, Sub-niche.
// Web and mobile are the Device filter, so "Platform" means what a template is delivered as.
//
//   Industry hub         /ui/healthcare-website-templates
//   Sub-niche            /ui/healthcare-website-templates/cardiology-website-template
//   Platform hub         /ui/wordpress-themes
//   Platform + industry  /ui/wordpress-themes/healthcare
//   Platform + sub-niche /ui/wordpress-themes/healthcare/cardiology
//   Platform item        /ui/wordpress-themes/healthcare/cardiology/<theme>
//
// Moving an industry into this tree is a data change: add it to INDUSTRIES, generate its catalog entries, and every link, canonical,
// sitemap entry and MCP URL follows, with one-hop 301s from the flat URLs. A pattern not listed here stays flat.
import CATALOG from "./tpl_catalog.json";

export const MIN_DESIGNS = 6; // the page test: fewer distinct, tested designs and the page does not exist

export const PLATFORMS = {
  wordpress: { id: "wordpress", label: "WordPress", hub: "wordpress-themes", one: "theme", many: "themes", h1: "WordPress themes" },
};

// niches: [catalog id, pattern id, label, HTML path segment, platform path segment]
export const INDUSTRIES = {
  healthcare: {
    id: "healthcare", label: "Healthcare", hub: "healthcare-website-templates", seg: "healthcare", h1: "Healthcare website templates",
    niches: [
      ["medical", "medical-website", "Medical practice", "medical-website-template", "medical"],
      ["hospital", "hospital-website", "Hospital", "hospital-website-template", "hospital"],
      ["cardiology", "cardiology-website", "Cardiology", "cardiology-website-template", "cardiology"],
      ["dermatology", "dermatology-website", "Dermatology", "dermatology-website-template", "dermatology"],
      ["pediatrics", "pediatrics-website", "Pediatrics", "pediatrics-website-template", "pediatrics"],
      ["fertility", "fertility-website", "Fertility clinic", "fertility-website-template", "fertility"],
      ["dental", "dental-website", "Dental", "dental-website-template", "dental"],
      ["orthodontics", "orthodontics-website", "Orthodontics", "orthodontics-website-template", "orthodontics"],
      ["therapist", "therapist-website", "Therapist", "therapist-website-template", "therapist"],
      ["mental-health", "mental-health-website", "Mental health clinic", "mental-health-website-template", "mental-health"],
      ["physical-therapy", "physical-therapy-website", "Physical therapy", "physical-therapy-website-template", "physical-therapy"],
      ["optometry", "optometry-website", "Optometry", "optometry-website-template", "optometry"],
      ["pharmacy", "pharmacy-website", "Pharmacy", "pharmacy-website-template", "pharmacy"],
      ["veterinary", "veterinary-website", "Veterinary", "veterinary-website-template", "veterinary"],
    ],
    // app and portal screens, not page templates: linked from the hub, their URLs stay flat
    appPatterns: ["clinic-home", "doctor-directory", "telehealth-visit"],
  },
  // 7-Nov-2026 second industry. Demand: "real estate website template" 2,900/mo, "real estate wordpress theme" 1,600/mo (Keyword Planner, worldwide).
  "real-estate": {
    id: "real-estate", label: "Real estate", hub: "real-estate-website-templates", seg: "real-estate", h1: "Real estate website templates",
    niches: [
      ["real-estate", "real-estate-website", "Real estate agency", "real-estate-agency-website-template", "real-estate-agency"],
      ["real-estate-agent", "real-estate-agent-website", "Real estate agent", "real-estate-agent-website-template", "real-estate-agent"],
      ["apartment", "apartment-website", "Apartment community", "apartment-website-template", "apartment"],
      ["property-management", "property-management-website", "Property management", "property-management-website-template", "property-management"],
      ["luxury-real-estate", "luxury-real-estate-website", "Luxury real estate", "luxury-real-estate-website-template", "luxury"],
      ["commercial-real-estate", "commercial-real-estate-website", "Commercial real estate", "commercial-real-estate-website-template", "commercial"],
      ["vacation-rental", "vacation-rental-website", "Vacation rental", "vacation-rental-website-template", "vacation-rental"],
      ["home-builder", "home-builder-website", "Home builder", "home-builder-website-template", "home-builder"],
    ],
    appPatterns: [],
  },
  // 7-Nov-2026 third industry. Demand: "restaurant website template" 3,600/mo, "restaurant wordpress theme" 880/mo (Keyword Planner, worldwide).
  // hubFirst: the bare industry query ("restaurant website template") is answered with the hub before the restaurant-named niche.
  restaurant: {
    id: "restaurant", label: "Restaurant", hub: "restaurant-website-templates", seg: "restaurant", h1: "Restaurant website templates", hubFirst: true,
    niches: [
      ["restaurant", "restaurant-website", "Casual dining", "casual-dining-website-template", "casual-dining"],
      ["coffee-shop", "coffee-shop-website", "Cafe and coffee shop", "cafe-website-template", "cafe"],
      ["bakery", "bakery-website", "Bakery", "bakery-website-template", "bakery"],
      ["pizzeria", "pizzeria-website", "Pizzeria", "pizza-website-template", "pizzeria"],
      ["bar", "bar-website", "Bar and pub", "bar-website-template", "bar"],
      ["catering", "catering-website", "Catering", "catering-website-template", "catering"],
      ["food-truck", "food-truck-website", "Food truck", "food-truck-website-template", "food-truck"],
      ["fine-dining", "fine-dining-website", "Fine dining", "fine-dining-website-template", "fine-dining"],
    ],
    appPatterns: [],
  },
};

const cat = (id) => (CATALOG.niches && CATALOG.niches[id]) || { designs: [] };
const distinct = (n) => n.designs.filter((d) => d.distinct);
const themed = (n) => distinct(n).filter((d) => d.theme);
export const NICHES = Object.values(INDUSTRIES).flatMap((ind) => ind.niches.map(([id, pattern, label, htmlSeg, seg]) => {
  const n = { id, pattern, label, htmlSeg, seg, industry: ind.id, ...cat(id) };
  n.designs = n.designs || []; n.htmlLive = distinct(n).length >= MIN_DESIGNS; n.wpLive = themed(n).length >= MIN_DESIGNS;
  return n;
}));
export const nicheById = (id) => NICHES.find((n) => n.id === id);
export const nicheOfPattern = (p) => NICHES.find((n) => n.pattern === p && n.htmlLive) || null;
export const nicheOfFlatSeg = (seg) => NICHES.find((n) => n.htmlSeg === seg && n.htmlLive) || null;
export const liveDesigns = (n) => distinct(n);
export const liveThemes = (n) => themed(n);
export const industryNiches = (ind, wp) => NICHES.filter((n) => n.industry === ind && (wp ? n.wpLive : n.htmlLive));
export const industryLive = (ind) => industryNiches(ind).length > 0;
export const platformIndustries = () => Object.values(INDUSTRIES).filter((i) => industryNiches(i.id, true).length);
export const catalogMeta = () => ({ wp: CATALOG.wp || null, php: CATALOG.php || null, tested: CATALOG.tested || null, licence: CATALOG.licence || null, version: CATALOG.version || null });

// paths are relative to /ui
export const nestedPatternPath = (p) => { const n = nicheOfPattern(p); return n ? `${INDUSTRIES[n.industry].hub}/${n.htmlSeg}` : null; };
export const wpHubPath = () => PLATFORMS.wordpress.hub;
export const wpIndustryPath = (ind) => `${PLATFORMS.wordpress.hub}/${INDUSTRIES[ind].seg}`;
export const wpNichePath = (n) => `${wpIndustryPath(n.industry)}/${n.seg}`;
export const themePath = (n, d) => `${wpNichePath(n)}/${d.theme.slug}`;

// What a path under /ui means, for paths of the tree only. Returns null for anything else, so existing routes are untouched.
export function resolveTree(rel) {
  const segs = rel.split("/");
  const ind = Object.values(INDUSTRIES).find((i) => i.hub === segs[0]);
  if (ind) {
    if (!industryLive(ind.id)) return null;
    if (segs.length === 1) return { type: "industry", ind };
    if (segs.length === 2) { const n = industryNiches(ind.id).find((x) => x.htmlSeg === segs[1]); return n ? { type: "niche", ind, n } : null; }
    return null;
  }
  if (segs[0] === PLATFORMS.wordpress.hub) {
    if (!platformIndustries().length) return null;
    if (segs.length === 1) return { type: "platform" };
    const i2 = Object.values(INDUSTRIES).find((i) => i.seg === segs[1]); if (!i2 || !industryNiches(i2.id, true).length) return null;
    if (segs.length === 2) return { type: "platform-industry", ind: i2 };
    const n = industryNiches(i2.id, true).find((x) => x.seg === segs[2]); if (!n) return null;
    if (segs.length === 3) return { type: "platform-niche", ind: i2, n };
    if (segs.length === 4) { const d = liveThemes(n).find((x) => x.theme.slug === segs[3]); return d ? { type: "theme", ind: i2, n, d } : null; }
  }
  return null;
}

// Every path the tree serves, for the sitemap and the guarantees below.
export function treePaths() {
  const out = [];
  for (const ind of Object.values(INDUSTRIES)) { if (!industryLive(ind.id)) continue; out.push(ind.hub); for (const n of industryNiches(ind.id)) out.push(`${ind.hub}/${n.htmlSeg}`); }
  if (platformIndustries().length) out.push(PLATFORMS.wordpress.hub);
  for (const ind of platformIndustries()) { out.push(wpIndustryPath(ind.id)); for (const n of industryNiches(ind.id, true)) { out.push(wpNichePath(n)); for (const d of liveThemes(n)) out.push(themePath(n, d)); } }
  return out;
}

// Fails the deploy (module load) on a gap: no duplicate or malformed path, no theme id collision, nothing live that fails the page test.
export function assertTree() {
  const seen = new Set(), ok = /^[a-z0-9]+(-[a-z0-9]+)*$/;
  for (const p of treePaths()) { if (seen.has(p)) throw new Error(`duplicate tree path ${p}`); seen.add(p); for (const s of p.split("/")) if (!ok.test(s) || /[0-9a-f]{12}$/.test(s)) throw new Error(`bad tree segment ${s} in ${p}`); if (!resolveTree(p)) throw new Error(`tree path ${p} does not resolve`); }
  const pats = new Set(), segs = new Set();
  for (const n of NICHES) { if (pats.has(n.pattern)) throw new Error(`pattern ${n.pattern} in two niches`); pats.add(n.pattern); const k = `${n.industry}/${n.seg}`; if (segs.has(k)) throw new Error(`duplicate niche segment ${k}`); segs.add(k); }
  for (const n of NICHES) for (const d of n.designs) if (d.theme && !d.theme.tested) throw new Error(`theme ${d.theme.slug} in the catalog without a passing install test`);
}
