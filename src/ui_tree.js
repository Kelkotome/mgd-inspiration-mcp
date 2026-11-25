// Template taxonomy and nested URLs (7-Nov-2026 healthcare pilot). Spec: docs/template-taxonomy.md.
// Four categories on every template: Platform (HTML, WordPress), Type (one-page, website, landing page), Industry, Sub-niche.
// Web and mobile are the Device filter, so "Platform" means what a template is delivered as.
//
//   Templates hub        /ui/website-templates                     (the websites facet page)
//   Top category         /ui/business-website-templates            (restructure round, 25-Nov-2026: a standalone page, not a URL parent)
//   Industry hub         /ui/healthcare-website-templates
//   Sub-niche            /ui/healthcare-website-templates/cardiology-website-template
//   Platform hub         /ui/wordpress-themes
//   Platform + industry  /ui/wordpress-themes/healthcare
//   Platform + sub-niche /ui/wordpress-themes/healthcare/cardiology
//   Platform item        /ui/wordpress-themes/healthcare/cardiology/<theme>
//
// Restructure round (25-Nov-2026, owner decision after the SEO-structure benchmark): FLAT URLs + visible hierarchy. No URL moves. The tree is the single
// data source for the hierarchy people and crawlers see: CATEGORIES (category -> industries, own standalone pages), INDUSTRIES (industry -> niches),
// INDUSTRIES[].groups (group -> niches: H2 sections on the hub, breadcrumbs, child-link and sibling strips). Paths never depend on categories or groups,
// so re-homing a niche in a group or an industry in a category costs no 301. New niches get flat slugs in the existing pattern.
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
    // Specialty groups (restructure round, 25-Nov-2026): display only, never in a URL. Every niche of an industry with groups sits in exactly one group.
    // A group's parent is the niche whose page carries the "more specific type" child-link module and which the breadcrumb links for the group
    // (Website templates > Health and wellness > Healthcare > Medical > Cardiology). A group without a parent shows as an H2 section on the hub only.
    // An empty group (nutrition, r14) appears once a niche in it is live. r14 healthcare depth adds: laboratory, plastic surgery, urgent care -> medical;
    // psychologist -> mental-health; chiropractor -> therapy-rehab; nutritionist, doula, home care -> nutrition-care.
    groups: [
      { id: "medical", label: "Medical", parent: "medical", niches: ["hospital", "cardiology", "dermatology", "pediatrics", "fertility"] },
      { id: "dental", label: "Dental", parent: "dental", niches: ["orthodontics"] },
      { id: "mental-health", label: "Mental health", niches: ["therapist", "mental-health"] },
      { id: "therapy-rehab", label: "Therapy and rehab", niches: ["physical-therapy"] },
      { id: "nutrition-care", label: "Nutrition, pregnancy and care", niches: [] },
      { id: "eye-care-pharmacy", label: "Eye care and pharmacy", niches: ["optometry", "pharmacy"] },
      { id: "animal-health", label: "Animal health", niches: ["veterinary"] },
    ],
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
  // 9-Nov-2026 fifth industry. Demand (Keyword Planner, worldwide, Oct-2026): "wedding website template" 8,100/mo (+21% YoY, the only rising head term
  // in the round), "wedding invitation website template" 1,300 (+153% YoY), "event website template" 720, florist 320, event planner 320,
  // "wedding wordpress theme" 390, "event wordpress theme" 480. hubFirst: the bare "wedding website template" is answered with the hub first.
  wedding: {
    id: "wedding", label: "Weddings and events", hub: "wedding-website-templates", seg: "wedding", h1: "Wedding and event website templates", hubFirst: true,
    niches: [
      ["wedding", "wedding-website", "Wedding website", "wedding-website-template", "wedding-website"],
      ["wedding-invitation", "wedding-invitation-website", "Wedding invitation", "wedding-invitation-website-template", "wedding-invitation"],
      ["wedding-planner", "wedding-planner-website", "Wedding planner", "wedding-planner-website-template", "wedding-planner"],
      ["wedding-venue", "wedding-venue-website", "Wedding venue", "wedding-venue-website-template", "wedding-venue"],
      ["wedding-photographer", "wedding-photographer-website", "Wedding photographer", "wedding-photographer-website-template", "wedding-photographer"],
      ["florist", "florist-website", "Florist", "florist-website-template", "florist"],
      ["event-planner", "event-planner-website", "Event planner", "event-planner-website-template", "event-planner"],
      ["conference", "conference-website", "Event and conference", "event-website-template", "event"],
    ],
    appPatterns: [],
  },
  // 13-Nov-2026 sixth industry (templates r3, option A: a new industry is the user's call). Demand (Keyword Planner, worldwide, 12-Nov-2026):
  // "portfolio website template" 18,100/mo (the hub), "personal portfolio website template" 2,400, "photography website template" 1,300,
  // "interior design website template" 1,000, "graphic designer portfolio template" 880, "developer portfolio template" 720 (+ "developer portfolio" 590),
  // "agency website template" 720, "architecture website template" 590, "marketing agency website template" 260. Artist and illustrator (260/210/70) dropped.
  // agency-website and architecture-website were flat n12 patterns; their hand-built n12 homepages are not in the catalog (invented metrics and
  // client quotes, approval item), so the nested pages show the six new designs only.
  portfolio: {
    id: "portfolio", label: "Portfolios and creative studios", hub: "portfolio-website-templates", seg: "portfolio", h1: "Portfolio and creative studio website templates", hubFirst: true,
    niches: [
      ["personal-portfolio", "personal-portfolio-website", "Personal portfolio", "personal-portfolio-website-template", "personal"],
      ["developer-portfolio", "developer-portfolio-website", "Developer portfolio", "developer-portfolio-template", "developer"],
      ["graphic-designer", "graphic-designer-website", "Graphic designer", "graphic-designer-portfolio-template", "graphic-designer"],
      ["photography", "photography-website", "Photography", "photography-website-template", "photography"],
      ["interior-design", "interior-design-website", "Interior design", "interior-design-website-template", "interior-design"],
      ["architecture", "architecture-website", "Architecture", "architecture-website-template", "architecture"],
      ["agency", "agency-website", "Creative agency", "agency-website-template", "agency"],
      ["marketing-agency", "marketing-agency-website", "Marketing agency", "marketing-agency-website-template", "marketing-agency"],
    ],
    appPatterns: ["portfolio-home", "case-study"],
  },
  // 21-Nov-2026 seventh industry (templates r4), approved by the user 21-Nov-2026 with all 8 niches. Demand (Keyword Planner, worldwide, 21-Nov-2026,
  // every term down 11-49 % YoY): hair salon 1,000, gym 880, fitness 390 + personal trainer 170, yoga 320, barber shop 260 + barbershop 140,
  // spa 260 + massage 90, makeup artist 140, nail salon 90. hubFirst: no niche is named like the industry ("beauty", "wellness" -> the hub).
  // gym-website was a flat n12 pattern; its hand-built Ironyard Gym homepage is not in the catalog (as agency/architecture in r3), so the nested
  // gym page shows the seven new designs. salon-website stays a flat n12 pattern (not a niche here).
  "beauty-fitness": {
    id: "beauty-fitness", label: "Beauty, fitness and wellness", hub: "beauty-fitness-website-templates", seg: "beauty-fitness", h1: "Beauty, fitness and wellness website templates", hubFirst: true,
    niches: [
      ["hair-salon", "hair-salon-website", "Hair salon", "hair-salon-website-template", "hair-salon"],
      ["barbershop", "barbershop-website", "Barbershop", "barber-shop-website-template", "barbershop"],
      ["nail-salon", "nail-salon-website", "Nail salon", "nail-salon-website-template", "nail-salon"],
      ["spa", "spa-website", "Spa and massage", "spa-website-template", "spa"],
      ["makeup-artist", "makeup-artist-website", "Makeup artist", "makeup-artist-website-template", "makeup-artist"],
      ["gym", "gym-website", "Gym", "gym-website-template", "gym"],
      ["fitness", "fitness-website", "Personal trainer and fitness", "fitness-website-template", "fitness"],
      ["yoga", "yoga-website", "Yoga studio", "yoga-website-template", "yoga"],
    ],
    appPatterns: ["class-schedule", "booking-details", "booking-confirmed"],
  },
  // 7-Nov-2026 fourth industry. Demand (Keyword Planner, worldwide, template terms): construction 1,900/mo, plumber 390, cleaning 320, landscaping 320,
  // electrician 320, roofing 260, HVAC 260, pest control 170; WordPress: construction 720, cleaning 210, plumbing 140. Runner-up: beauty salon and spa.
  // hubFirst: the bare "construction website template" is answered with the hub before the construction company niche.
  construction: {
    id: "construction", label: "Construction and home services", hub: "construction-website-templates", seg: "construction", h1: "Construction and home services website templates", hubFirst: true,
    niches: [
      ["construction", "construction-website", "Construction company", "construction-company-website-template", "construction-company"],
      ["plumber", "plumber-website", "Plumber", "plumber-website-template", "plumber"],
      ["electrician", "electrician-website", "Electrician", "electrician-website-template", "electrician"],
      ["roofing", "roofing-website", "Roofing", "roofing-website-template", "roofing"],
      ["hvac", "hvac-website", "HVAC", "hvac-website-template", "hvac"],
      ["cleaning-service", "cleaning-service-website", "Cleaning service", "cleaning-website-template", "cleaning"],
      ["landscaping", "landscaping-website", "Landscaping", "landscaping-website-template", "landscaping"],
      ["pest-control", "pest-control-website", "Pest control", "pest-control-website-template", "pest-control"],
    ],
    appPatterns: ["pro-directory"],
  },
  // 24-Nov-2026 ninth industry (templates r6). Demand (Keyword Planner, worldwide, 23-Nov-2026, template terms): lawyer/attorney 590, consulting 590,
  // law firm 390, accounting 320, insurance 260 + insurance agency 110, staffing 170 + recruitment 170, financial advisor 90, tax preparation 40
  // (tax website template 140, +362 % YoY on 6-Nov); WordPress: lawyer 480 (+78 % YoY), consulting 480, law firm 260, finance 170. hubFirst: no niche is
  // named like the industry ("professional services", "legal services" -> the hub). law-firm-website (n12, Whitcombe Hale) and financial-advisor-website
  // (n13) were flat patterns; their hand-built homepages are not signatures (as gym in r4, construction in r5), so they stay plain items.
  "professional-services": {
    id: "professional-services", label: "Legal and professional services", hub: "professional-services-website-templates", seg: "professional-services", h1: "Legal and professional services website templates", hubFirst: true,
    niches: [
      ["law-firm", "law-firm-website", "Law firm", "law-firm-website-template", "law-firm"],
      ["lawyer", "lawyer-website", "Lawyer and attorney", "lawyer-website-template", "lawyer"],
      ["accounting", "accounting-website", "Accounting firm", "accounting-website-template", "accounting"],
      ["tax-preparation", "tax-preparation-website", "Tax preparation", "tax-preparation-website-template", "tax-preparation"],
      ["financial-advisor", "financial-advisor-website", "Financial advisor", "financial-advisor-website-template", "financial-advisor"],
      ["insurance-agency", "insurance-agency-website", "Insurance agency", "insurance-website-template", "insurance"],
      ["consulting", "consulting-website", "Consulting firm", "consulting-website-template", "consulting"],
      ["staffing-agency", "staffing-agency-website", "Staffing and recruitment agency", "staffing-agency-website-template", "staffing-agency"],
    ],
    appPatterns: [],
  },
  // 25-Nov-2026 tenth industry (templates r7, STAGED, not deployed; lead's pick, owner to confirm). Demand (Keyword Planner, worldwide, 25-Nov-2026,
  // template terms): education 1,300 (school folds into it), university 320, e-learning 260 + online course 90 + course 140, daycare 170 = childcare 170,
  // tutoring 110, preschool 110 + kindergarten 90, dance studio 70; WordPress: education 720, LMS 390, university 170, kindergarten 110; "tutoring website"
  // 8,100, "online course website" 1,900, "daycare website" 590. Music school is the long-tail pick (music lessons website 90). hubFirst: no niche is named
  // like the industry ("education", "e-learning" -> the hub). school-website (n12, Alderbrook Academy) and preschool-website (n13, Puddlewick) were flat
  // patterns; their hand-built homepages are not signatures (as gym in r4, construction in r5, law firm in r6), so they stay plain items.
  education: {
    id: "education", label: "Education", hub: "education-website-templates", seg: "education", h1: "Education website templates", hubFirst: true,
    niches: [
      ["school", "school-website", "School", "school-website-template", "school"],
      ["university", "university-website", "University and college", "university-website-template", "university"],
      ["preschool", "preschool-website", "Preschool and kindergarten", "preschool-website-template", "preschool"],
      ["daycare", "daycare-website", "Daycare and childcare", "daycare-website-template", "daycare"],
      ["tutoring", "tutoring-website", "Tutoring", "tutoring-website-template", "tutoring"],
      ["online-course", "online-course-website", "Online course and e-learning", "online-course-website-template", "online-course"],
      ["music-school", "music-school-website", "Music school", "music-school-website-template", "music-school"],
      ["dance-studio", "dance-studio-website", "Dance studio", "dance-studio-website-template", "dance-studio"],
    ],
    appPatterns: ["course-dashboard"],
  },
  // 25-Nov-2026 automotive (templates r8, STAGED, not deployed; lead's pick, owner to confirm; built independent of r7 education, which is also staged).
  // Demand (Keyword Planner, worldwide, 25-Nov-2026): "automotive website template" 720 (= "car website template"), car rental 480, car dealership 390,
  // car detailing 260, auto repair 170, car wash 140; WordPress: car dealer 320, car rental 260, automotive 210, auto repair 90; "website" forms: car rental
  // website 8,100, dealership website 1,900, auto repair / car repair website 1,300, auto detailing 880, car wash 720, mechanic 720, body shop 390,
  // towing 210 (rising: +24 % YoY), tire shop 70. hubFirst: no niche is named like the industry ("automotive", "car website" -> the hub). No n12/n13 rows.
  automotive: {
    id: "automotive", label: "Automotive", hub: "automotive-website-templates", seg: "automotive", h1: "Automotive website templates", hubFirst: true,
    niches: [
      ["car-dealership", "car-dealership-website", "Car dealership", "car-dealership-website-template", "car-dealership"],
      ["auto-repair", "auto-repair-website", "Auto repair and mechanic", "auto-repair-website-template", "auto-repair"],
      ["car-detailing", "car-detailing-website", "Car detailing", "car-detailing-website-template", "car-detailing"],
      ["car-wash", "car-wash-website", "Car wash", "car-wash-website-template", "car-wash"],
      ["car-rental", "car-rental-website", "Car rental", "car-rental-website-template", "car-rental"],
      ["auto-body", "auto-body-website", "Auto body and collision repair", "auto-body-shop-website-template", "auto-body"],
      ["towing", "towing-website", "Towing and roadside help", "towing-website-template", "towing"],
      ["tire-shop", "tire-shop-website", "Tire shop", "tire-shop-website-template", "tire-shop"],
    ],
    appPatterns: [],
  },
  // 25-Nov-2026 travel and hotels (templates r9, STAGED, not deployed; lead's pick, owner to confirm; stacked on r7 education + r8 automotive).
  // Demand (Keyword Planner, worldwide, 25-Nov-2026, template terms): travel 1,900 (the hub, hubFirst), hotel 1,300, travel agency 480 (+ travel agent 170),
  // tourism 480, resort 210, tour 210, hotel booking 260, bed and breakfast 90, hostel 70; WordPress: travel 1,000, hotel 590, travel agency 390; "website"
  // forms: hotel website 18,100, tourism website 3,600, travel agency website 2,400, resort website 1,600 (+87 % YoY), bed and breakfast website 1,000,
  // hostel website 1,000, campground website 480, glamping website 260, tour operator website 110 (+59 % 3 mo). hubFirst: no niche is named like the
  // industry ("travel", "accommodation" -> the hub). hotel-website (n12, Halcyon Quay) and travel-website (n12, Driftmark Journeys, a tour operator) were
  // flat patterns. hotel-website is the hotel niche; its hand-built homepage is not a signature (as law firm in r6, school in r7), so it stays a plain item.
  // travel-website stays a flat n12 pattern (the build derives a niche's pattern as <niche>-website); its tour aliases moved to tour-operator-website.
  travel: {
    id: "travel", label: "Travel, tourism and stays", hub: "travel-website-templates", seg: "travel", h1: "Travel, tourism and accommodation website templates", hubFirst: true,
    niches: [
      ["hotel", "hotel-website", "Hotel", "hotel-website-template", "hotel"],
      ["resort", "resort-website", "Resort", "resort-website-template", "resort"],
      ["bed-and-breakfast", "bed-and-breakfast-website", "Bed and breakfast and guest house", "bed-and-breakfast-website-template", "bed-and-breakfast"],
      ["hostel", "hostel-website", "Hostel", "hostel-website-template", "hostel"],
      ["travel-agency", "travel-agency-website", "Travel agency", "travel-agency-website-template", "travel-agency"],
      ["tour-operator", "tour-operator-website", "Tour operator", "tour-operator-website-template", "tour-operator"],
      ["campground", "campground-website", "Campground and glamping", "campground-website-template", "campground"],
      ["tourism", "tourism-website", "Tourism and destination", "tourism-website-template", "tourism"],
    ],
    appPatterns: [],
  },
};

// Top categories (restructure round, 25-Nov-2026; owner decision: 7 standalone pages, not URL parents). One home per industry: an industry sits in exactly one
// category (assertTree). Order = display order. A category page exists once one of its industries is live, so "Shops and online stores" appears with r11.
// seg = the page URL under /ui (shares the flat slug namespace, checked in ui_seo assertSlugs). Named after a searched term where one exists (Keyword
// Planner, worldwide, 25-Nov-2026, "<x> website template": business 1,900, food 1,300, online store 880, technology / creative / events 720 each; health and
// wellness 0, property 140, community 260). h1 never targets a hub's or niche's own head term ("restaurant website template" is the Restaurant hub's,
// "travel website template" the Travel hub's, "automotive website template" the Automotive hub's, "technology website template" the r10 Technology hub's, "event website template" the conference niche's, "wedding website template" the Weddings hub's).
// Planned homes for the queued rounds (add the id in that round): r10 technology -> business-technology, r11 ecommerce -> shops, r12 blog ->
// creative-media-events, r15 nonprofit -> learning-community.
export const TEMPLATES_HUB = "website-templates";
export const CATEGORIES = [
  { id: "health-wellness", label: "Health and wellness", seg: "health-and-wellness-website-templates", h1: "Health and wellness website templates", industries: ["healthcare", "beauty-fitness"] },
  { id: "food-travel-hospitality", label: "Food, travel and hospitality", seg: "food-website-templates", h1: "Food and hospitality website templates", industries: ["restaurant", "travel"] },
  { id: "property-trades-automotive", label: "Property, trades and automotive", seg: "property-and-trades-website-templates", h1: "Property and trades website templates", industries: ["real-estate", "construction", "automotive"] },
  { id: "business-technology", label: "Business and technology", seg: "business-website-templates", h1: "Business website templates", industries: ["professional-services"] },
  { id: "shops", label: "Shops and online stores", seg: "online-store-website-templates", h1: "Online store website templates", industries: [] },
  { id: "creative-media-events", label: "Creative, media and events", seg: "creative-website-templates", h1: "Creative website templates", industries: ["portfolio", "wedding"] },
  { id: "learning-community", label: "Learning and community", seg: "learning-and-community-website-templates", h1: "Learning and community website templates", industries: ["education"] },
];

const cat = (id) => (CATALOG.niches && CATALOG.niches[id]) || { designs: [] };
const distinct = (n) => n.designs.filter((d) => d.distinct);
const themed = (n) => distinct(n).filter((d) => d.theme);
const GROUP_OF = {}; // niche id -> { g, parent: true|false }
for (const ind of Object.values(INDUSTRIES)) for (const g of ind.groups || []) { if (g.parent) GROUP_OF[g.parent] = { g, parent: true }; for (const id of g.niches) GROUP_OF[id] = { g, parent: false }; }
export const NICHES = Object.values(INDUSTRIES).flatMap((ind) => ind.niches.map(([id, pattern, label, htmlSeg, seg]) => {
  const n = { id, pattern, label, htmlSeg, seg, industry: ind.id, ...cat(id) };
  n.designs = n.designs || []; n.htmlLive = distinct(n).length >= MIN_DESIGNS; n.wpLive = themed(n).length >= MIN_DESIGNS;
  const go = GROUP_OF[id]; n.group = go ? go.g.id : null; n.under = go && !go.parent && go.g.parent ? go.g.parent : null; // under = the group parent niche (display only)
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

// groups (display only)
export const industryGroups = (ind) => INDUSTRIES[ind].groups || [];
export const groupOfNiche = (n) => (n.group ? industryGroups(n.industry).find((g) => g.id === n.group) : null);
export const groupParent = (g) => (g.parent ? nicheById(g.parent) : null);
const liveFlag = (n, wp) => !!n && (wp ? n.wpLive : n.htmlLive);
export const groupMembers = (g, wp) => g.niches.map(nicheById).filter((n) => liveFlag(n, wp));
export const groupNiches = (g, wp) => [groupParent(g), ...g.niches.map(nicheById)].filter((n) => liveFlag(n, wp)); // parent first
export const groupLive = (g, wp) => groupNiches(g, wp).length > 0;
// the "more specific type" children shown on a group parent's page
export const nicheChildren = (n, wp) => { const go = GROUP_OF[n.id]; return go && go.parent ? groupMembers(go.g, wp) : []; };

// categories
export const categoryOf = (ind) => CATEGORIES.find((c) => c.industries.includes(ind)) || null;
export const categoryIndustries = (c) => c.industries.map((i) => INDUSTRIES[i]).filter((i) => i && industryLive(i.id));
export const categoryLive = (c) => categoryIndustries(c).length > 0;
export const liveCategories = () => CATEGORIES.filter(categoryLive);
export const categoryPath = (c) => c.seg;

// paths are relative to /ui; flat: never depend on category or group
export const nichePath = (n) => `${INDUSTRIES[n.industry].hub}/${n.htmlSeg}`;
export const nestedPatternPath = (p) => { const n = nicheOfPattern(p); return n ? nichePath(n) : null; };
export const wpHubPath = () => PLATFORMS.wordpress.hub;
export const wpIndustryPath = (ind) => `${PLATFORMS.wordpress.hub}/${INDUSTRIES[ind].seg}`;
export const wpNichePath = (n) => `${wpIndustryPath(n.industry)}/${n.seg}`;
export const themePath = (n, d) => `${wpNichePath(n)}/${d.theme.slug}`;

// What a path under /ui means, for paths of the tree only. Returns null for anything else, so existing routes are untouched.
export function resolveTree(rel) {
  const segs = rel.split("/");
  if (segs.length === 1) { const c = CATEGORIES.find((x) => x.seg === segs[0]); if (c) return categoryLive(c) ? { type: "category", c } : null; }
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
  for (const c of liveCategories()) out.push(categoryPath(c));
  for (const ind of Object.values(INDUSTRIES)) { if (!industryLive(ind.id)) continue; out.push(ind.hub); for (const n of industryNiches(ind.id)) out.push(nichePath(n)); }
  if (platformIndustries().length) out.push(PLATFORMS.wordpress.hub);
  for (const ind of platformIndustries()) { out.push(wpIndustryPath(ind.id)); for (const n of industryNiches(ind.id, true)) { out.push(wpNichePath(n)); for (const d of liveThemes(n)) out.push(themePath(n, d)); } }
  return out;
}

// Fails the deploy (module load) on a gap: no duplicate or malformed path, no theme id collision, nothing live that fails the page test,
// one home per industry (category) and per niche (group).
export function assertTree() {
  const seen = new Set(), ok = /^[a-z0-9]+(-[a-z0-9]+)*$/;
  for (const p of treePaths()) { if (seen.has(p)) throw new Error(`duplicate tree path ${p}`); seen.add(p); for (const s of p.split("/")) if (!ok.test(s) || /[0-9a-f]{12}$/.test(s)) throw new Error(`bad tree segment ${s} in ${p}`); if (!resolveTree(p)) throw new Error(`tree path ${p} does not resolve`); }
  const pats = new Set(), segs = new Set();
  for (const n of NICHES) { if (pats.has(n.pattern)) throw new Error(`pattern ${n.pattern} in two niches`); pats.add(n.pattern); const k = `${n.industry}/${n.seg}`; if (segs.has(k)) throw new Error(`duplicate niche segment ${k}`); segs.add(k); }
  for (const n of NICHES) for (const d of n.designs) if (d.theme && !d.theme.tested) throw new Error(`theme ${d.theme.slug} in the catalog without a passing install test`);
  const cs = new Set(), homes = {};
  for (const c of CATEGORIES) { if (!ok.test(c.seg) || cs.has(c.seg) || Object.values(INDUSTRIES).some((i) => i.hub === c.seg) || c.seg === TEMPLATES_HUB) throw new Error(`bad or duplicate category segment ${c.seg}`); cs.add(c.seg); for (const i of c.industries) { if (!INDUSTRIES[i]) throw new Error(`category ${c.id} lists unknown industry ${i}`); if (homes[i]) throw new Error(`industry ${i} in two categories`); homes[i] = c.id; } }
  for (const i of Object.keys(INDUSTRIES)) if (!homes[i]) throw new Error(`industry ${i} has no category`);
  for (const ind of Object.values(INDUSTRIES)) {
    const gs = ind.groups || []; if (!gs.length) continue;
    const ids = ind.niches.map((x) => x[0]), placed = {}, gids = new Set();
    for (const g of gs) { if (gids.has(g.id)) throw new Error(`duplicate group ${g.id}`); gids.add(g.id); for (const id of [g.parent, ...g.niches].filter(Boolean)) { if (!ids.includes(id)) throw new Error(`group ${g.id} lists ${id}, not a ${ind.id} niche`); if (placed[id]) throw new Error(`niche ${id} in two groups`); placed[id] = g.id; } }
    for (const id of ids) if (!placed[id]) throw new Error(`niche ${id} has no group in ${ind.id}`);
  }
}
