// Clean, keyword-matched URLs for MGD UI screen facets (5-Nov-2026).
// Pattern ids stay the internal key (D1 category, MCP, item URLs); pages live at /ui/<slug>, where the slug is the
// head term people search for (Google Ads Keyword Planner, worldwide, Nov-2026; rising-and-volume rule). Old URLs
// (/ui/<pattern-id> and /ui?pattern=|group=|platform=|style=) 301 to these. Secondary filters on top of a facet stay
// query params (?platform=, ?style=) with the canonical on the clean path. Slugs are flat (one namespace under /ui),
// so every slug must be unique and must not be another pattern's old id (checked at load, see assertSlugs).
// Volumes/trends behind each choice: n11 SEO-URL report (slug table).
// 7-Nov-2026: patterns placed in the template tree (ui_tree.js) get a nested path; patternSlug() returns it, so every link, canonical and
// sitemap entry follows, and the flat slug and old id each 301 straight to it. Patterns not in the tree stay flat.
import { nestedPatternPath, INDUSTRIES, PLATFORMS } from "./ui_tree.js";

// pattern id -> [slug, H1]. The H1 carries the searched phrase; the slug is that phrase without "design/examples".
export const PATTERN_SEO = {
  // 9-Nov-2026 gap round r2 (mcp-gap-r2): slugs chosen by hand (not checked in Keyword Planner).
  "payroll": ["payroll-ui", "Payroll UI examples"],
  "timesheet": ["timesheet-ui", "Timesheet UI examples"],
  "invoice-list": ["invoicing-ui", "Invoicing UI examples"],
  "first-run": ["onboarding-checklist-ui", "Onboarding checklist and first-run empty state UI examples"],
  "media-library": ["media-library-ui", "Media library and image picker UI examples"],
  "subscriptions-admin": ["subscription-management-ui", "Subscription management UI examples"],
  "upgrade-preview": ["upgrade-prompt-ui", "Upgrade prompt UI examples"],
  "plan-checkout": ["subscription-checkout-ui", "Subscription checkout UI examples"],
  "compact-header": ["compact-header-ui", "Compact header and app top bar UI examples"],
  "loyalty-card": ["loyalty-card-ui", "Loyalty stamp card and wallet pass UI examples"],
  // 8-Nov-2026 gap round (mcp-gap-r1): head terms chosen by hand (not yet checked in Keyword Planner).
  "music-home": ["music-app-ui", "Music app UI design examples"],
  "album-page": ["album-page-ui", "Album and artist page UI examples"],
  "play-queue": ["now-playing-screen", "Now playing screen and lyrics UI examples"],
  "story-viewer": ["stories-ui", "Stories UI design examples"],
  "photo-post": ["social-media-post-ui", "Social media post UI examples"],
  "post-composer": ["new-post-screen", "Create post screen UI examples (photo filters and caption)"],
  "barcode-scanner": ["barcode-scanner-ui", "Barcode scanner UI examples"],
  "skincare-routine": ["skincare-app-ui", "Skincare routine app UI examples"],
  "image-editor": ["image-editor-ui", "Image editor UI design examples"],
  "document-editor": ["document-editor-ui", "Document editor (rich text) UI examples"],
  "sales-pipeline": ["sales-pipeline-ui", "Sales pipeline (CRM kanban) UI examples"],
  "sprint-board": ["sprint-board-ui", "Sprint board and backlog UI examples"],
  "project-timeline": ["gantt-chart-ui", "Gantt chart and project timeline UI examples"],
  "approval-request": ["approval-request-ui", "Approval request UI examples"],
  "diff-viewer": ["diff-viewer-ui", "Diff viewer and compare versions UI examples"],
  "release-notes": ["release-notes-ui", "Release notes and what’s new UI examples"],
  "stock-count": ["stock-count-ui", "Stock count (stocktake) UI examples"],
  "purchase-order": ["purchase-order-ui", "Purchase order UI examples"],
  "subscription-billing": ["billing-page-ui", "Billing and subscription page UI examples"],
  "usage-pricing": ["tiered-pricing-ui", "Tiered and usage-based pricing UI examples"],
  "payment-methods": ["payment-method-ui", "Payment method and add card UI examples"],
  "habit-tracker": ["habit-tracker-ui", "Habit tracker app UI examples"],
  "language-lesson": ["gamified-lesson-ui", "Gamified lesson UI examples (language learning)"],
  "leaderboard": ["leaderboard-ui", "Leaderboard UI design examples"],
  "delete-confirm": ["delete-confirmation-modal", "Delete confirmation modal examples"],
  "celebration": ["success-celebration-ui", "Success celebration and achievement UI examples"],
  "integration-connect": ["connected-apps-ui", "Connected apps and integration settings UI examples"],
  "model-providers": ["ai-model-settings-ui", "AI model settings and API key UI examples"],
  "navigation-header": ["navbar", "Navbar design examples"],
  hero: ["hero-section", "Hero section design examples"],
  pricing: ["pricing-page", "Pricing page design examples"],
  login: ["login-page", "Login page design examples"],
  "sign-up": ["sign-up-page", "Sign up page design examples"],
  "forgot-password": ["reset-password-page", "Forgot and reset password page examples"],
  "two-factor": ["otp-ui", "OTP and two-factor verification UI examples"],
  dashboard: ["dashboard", "Dashboard design examples"],
  "data-table": ["data-table", "Data table design examples"],
  "analytics-charts": ["analytics-dashboard", "Analytics dashboard and chart UI examples"],
  footer: ["footer", "Website footer design examples"],
  faq: ["faq-section", "FAQ section design examples"],
  testimonials: ["testimonial-section", "Testimonial section design examples"],
  "feature-grid": ["features-section", "Features section design examples"],
  "bento-features": ["bento-grid", "Bento grid design examples"],
  "cta-banner": ["call-to-action", "Call to action (CTA) section examples"],
  "logo-cloud": ["logo-cloud", "Logo cloud section examples"],
  "stats-band": ["stats-section", "Stats section design examples"],
  "how-it-works": ["how-it-works-section", "How it works section examples"],
  "comparison-table": ["comparison-table", "Pricing comparison table examples"],
  "scored-comparison": ["scored-comparison-table", "Scored comparison table examples (with sources)"],
  "about-team": ["about-us-page", "About us page design examples"],
  careers: ["careers-page", "Careers page design examples"],
  "blog-index": ["blog-page", "Blog page design examples"],
  changelog: ["changelog", "Changelog page examples"],
  "contact-form": ["contact-form", "Contact form design examples"],
  "security-trust": ["trust-center", "Security and trust center page examples"],
  "integrations-grid": ["integrations-section", "Integrations section examples"],
  integrations: ["integrations-ui", "Integrations settings UI examples"],
  checkout: ["checkout-page", "Checkout page design examples"],
  cart: ["shopping-cart", "Shopping cart page design examples"],
  "product-detail": ["product-page", "Product page design examples"],
  "order-confirmation": ["order-confirmation-page", "Order confirmation page examples"],
  settings: ["settings-page", "Settings page UI examples"],
  profile: ["profile-page", "Profile page design examples"],
  "empty-state": ["empty-state", "Empty state design examples"],
  "error-404": ["404-page", "404 page design examples"],
  "loading-skeleton": ["skeleton-loading", "Skeleton loading screen examples"],
  "success-confirmation": ["success-page", "Success page design examples"],
  "onboarding-step": ["onboarding-screens", "Onboarding screen design examples"],
  "onboarding-carousel": ["onboarding-carousel", "Onboarding carousel examples"],
  welcome: ["welcome-screen", "Welcome screen design examples"],
  "permissions-request": ["permission-request", "Permission request screen examples"],
  home: ["app-home-screen", "App home screen design examples"],
  feed: ["social-media-feed", "Social media feed UI examples"],
  "list-view": ["list-view", "List view and to-do app UI examples"],
  "detail-view": ["detail-page", "Detail page design examples"],
  "kanban-board": ["kanban-board", "Kanban board UI design examples"],
  calendar: ["calendar-ui", "Calendar UI design examples"],
  "file-manager": ["file-manager-ui", "File manager UI examples"],
  "search-results": ["search-results-page", "Search results page examples"],
  "editor-toolbar": ["rich-text-editor", "Rich text editor UI examples"],
  "chat-ai-assistant": ["chatbot-ui", "AI chatbot UI design examples"],
  "chat-list": ["chat-list-ui", "Chat list UI examples"],
  "chat-thread": ["chat-ui", "Chat UI design examples"],
  "video-call": ["video-call-ui", "Video call UI examples"],
  "image-viewer": ["image-lightbox", "Image lightbox design examples"],
  "map-view": ["map-ui", "Map UI design examples"],
  "video-player": ["video-player-ui", "Video player UI examples"],
  "create-post": ["create-post-ui", "Create post UI examples"],
  "class-schedule": ["class-schedule", "Class schedule app UI examples"],
  "booking-details": ["booking-page", "Booking page design examples"],
  "booking-confirmed": ["booking-confirmation", "Booking confirmation screen examples"],
  "notifications-center": ["notifications-ui", "Notifications UI design examples"],
  "team-members": ["user-management-ui", "User and team management UI examples"],
  "roles-permissions": ["roles-and-permissions", "Roles and permissions UI examples"],
  "audit-log": ["audit-log", "Audit log UI examples"],
  "api-keys": ["api-keys-page", "API keys page design examples"],
  "billing-plans": ["billing-page", "Billing page design examples"],
  invoice: ["invoice-design", "Invoice design examples"],
  "paywall-upgrade": ["paywall", "Paywall design examples"],
  "cancel-subscription": ["cancel-subscription", "Cancel subscription page examples"],
  "ai-workspace": ["ai-interface", "AI interface design examples"],
  "ai-settings": ["ai-settings", "AI settings UI examples"],
  "version-history": ["version-history-ui", "Version history UI examples"],
  "approval-queue": ["approval-workflow", "Approval workflow UI examples"],
  "doctor-directory": ["doctor-directory", "Doctor directory app UI examples"],
  "telehealth-visit": ["telemedicine-app", "Telemedicine app UI examples"],
  "clinic-home": ["clinic-website", "Clinic website design examples"],
  "music-player": ["music-player-ui", "Music player UI design examples"],
  playlist: ["playlist-ui", "Playlist UI examples"],
  "portfolio-home": ["portfolio-website", "Portfolio website design examples"],
  "case-study": ["case-study-page", "Case study page design examples"],
  "security-dashboard": ["security-dashboard", "Security dashboard UI examples"],
  "project-tracker": ["project-management-dashboard", "Project management dashboard examples"],
  "course-dashboard": ["learning-dashboard", "Learning dashboard (LMS) UI examples"],
  "form-wizard": ["multi-step-form", "Multi-step form design examples"],
  "bank-onboarding": ["banking-app-onboarding", "Banking app onboarding UI examples"],
  "product-scan": ["barcode-scanner-app", "Barcode scanner app UI examples"],
  "split-view": ["split-view", "Split view (master-detail) UI examples"],
  "canvas-editor": ["canvas-editor", "Canvas and diagram editor UI examples"],
  "floor-plan": ["desk-booking-app", "Desk booking and floor plan UI examples"],
  "voice-call": ["call-screen", "Call screen UI examples"],
  "toast-snackbar": ["toast-snackbar", "Toast and snackbar UI examples"],
  "confirm-dialog": ["confirmation-modal", "Confirmation modal design examples"],
  "side-drawer": ["slide-out-panel", "Slide-out panel and side drawer examples"],
  "command-palette": ["command-palette", "Command palette UI examples"],
  "date-range-picker": ["date-range-picker", "Date range picker design examples"],
  "form-validation": ["form-validation", "Form validation error design examples"],
  "auth-error": ["login-error", "Login error screen examples"],
  "payment-declined": ["payment-failed", "Payment failed screen examples"],
  "pro-directory": ["home-services-app", "Home services app UI examples"],
  "service-booking": ["service-booking", "Service booking form examples"],
  "job-tracker": ["job-tracker", "Job tracker UI examples (pro on the way, job done)"],
  "account-email": ["transactional-email-templates", "Transactional email templates (welcome, verify, password reset)"],
  "order-email": ["order-confirmation-email", "Order confirmation and receipt email templates"],
  "shift-scheduler": ["shift-schedule", "Shift schedule UI examples"],
  "leave-calendar": ["leave-calendar", "Leave calendar UI examples"],
  "time-off-request": ["time-off-request-form", "Time-off request form examples"],
  "ops-dashboard": ["operations-dashboard", "Operations dashboard examples"],
  "inventory-stock": ["inventory-dashboard", "Inventory dashboard and stock UI examples"],
  "savings-goal": ["savings-goal-app", "Savings goal app UI examples"],
  // 5-Nov-2026 template round (n12): industry website templates (full responsive home pages). KP worldwide: "{industry} website template" is the head term.
  "restaurant-website": ["restaurant-website-template", "Casual dining website templates"],
  "agency-website": ["agency-website-template", "Agency website templates"],
  "architecture-website": ["architecture-website-template", "Architecture website templates"],
  "wedding-website": ["wedding-website-template", "Wedding website templates"],
  "ecommerce-website": ["ecommerce-website-template", "Ecommerce website templates"],
  "coffee-shop-website": ["coffee-shop-website-template", "Cafe and coffee shop website templates"],
  "salon-website": ["salon-website-template", "Salon website templates"],
  "real-estate-website": ["real-estate-website-template", "Real estate agency website templates"],
  "construction-website": ["construction-website-template", "Construction website templates"],
  "law-firm-website": ["law-firm-website-template", "Law firm website templates"],
  "dental-website": ["dental-website-template", "Dental website templates"],
  "gym-website": ["gym-website-template", "Gym website templates"],
  "school-website": ["education-website-template", "School and education website templates"],
  "nonprofit-website": ["nonprofit-website-template", "Nonprofit website templates"],
  "travel-website": ["travel-website-template", "Travel website templates"],
  "hotel-website": ["hotel-website-template", "Hotel website templates"],
  "saas-landing-page": ["saas-landing-page-template", "SaaS landing page templates"],
  "ai-website": ["ai-website-template", "AI website templates"],
  // 6-Nov-2026 template round (n13): niche and subspeciality landing pages. Volumes: docs/kp-n13/.
  "medical-website": ["medical-website-template", "Medical website templates"],
  "cardiology-website": ["cardiology-website-template", "Cardiology website templates"],
  "dermatology-website": ["dermatology-website-template", "Dermatology website templates"],
  "therapist-website": ["therapist-website-template", "Therapist website templates"],
  "physical-therapy-website": ["physical-therapy-website-template", "Physical therapy website templates"],
  "veterinary-website": ["veterinary-website-template", "Veterinary website templates"],
  "financial-advisor-website": ["financial-advisor-website-template", "Financial advisor website templates"],
  "cleaning-service-website": ["cleaning-service-website-template", "Cleaning service website templates"],
  "hvac-website": ["hvac-website-template", "HVAC website templates"],
  "cybersecurity-website": ["cybersecurity-website-template", "Cybersecurity website templates"],
  "crm-landing-page": ["crm-landing-page-template", "CRM landing page templates"],
  "coaching-website": ["coaching-website-template", "Coaching website templates"],
  "pest-control-website": ["pest-control-website-template", "Pest control website templates"],
  "solar-website": ["solar-website-template", "Solar website templates"],
  "ai-agent-website": ["ai-agent-website-template", "AI agent website templates"],
  "preschool-website": ["preschool-website-template", "Preschool website templates"],
  "apartment-website": ["apartment-website-template", "Apartment community website templates"],
  "pediatrics-website": ["pediatrics-website-template", "Pediatric website templates"],
  "orthodontics-website": ["orthodontics-website-template", "Orthodontics website templates"],
  "fertility-website": ["fertility-website-template", "Fertility clinic website templates"],
  // n13-end
  // 7-Nov-2026 healthcare pilot: new niches. These only ever live under the industry hub.
  "hospital-website": ["hospital-website-template", "Hospital website templates"],
  "mental-health-website": ["mental-health-website-template", "Mental health clinic website templates"],
  "optometry-website": ["optometry-website-template", "Optometry website templates"],
  "pharmacy-website": ["pharmacy-website-template", "Pharmacy website templates"],
  // 7-Nov-2026 real estate: new niches. These only ever live under the industry hub.
  "real-estate-agent-website": ["real-estate-agent-website-template", "Real estate agent website templates"],
  "property-management-website": ["property-management-website-template", "Property management website templates"],
  "luxury-real-estate-website": ["luxury-real-estate-website-template", "Luxury real estate website templates"],
  "commercial-real-estate-website": ["commercial-real-estate-website-template", "Commercial real estate website templates"],
  "vacation-rental-website": ["vacation-rental-website-template", "Vacation rental website templates"],
  "home-builder-website": ["home-builder-website-template", "Home builder website templates"],
  // 7-Nov-2026 restaurant: new niches. These only ever live under the industry hub.
  "bakery-website": ["bakery-website-template", "Bakery website templates"],
  "pizzeria-website": ["pizza-website-template", "Pizzeria website templates"],
  "bar-website": ["bar-website-template", "Bar and pub website templates"],
  "catering-website": ["catering-website-template", "Catering website templates"],
  "food-truck-website": ["food-truck-website-template", "Food truck website templates"],
  "fine-dining-website": ["fine-dining-website-template", "Fine dining website templates"],
  // UI components round 1 (7-Nov-2026; Keyword Planner "ui design" + "html css" + "examples", deploy-bundle-2026-11-07/components-audit.md)
  tabs: ["tabs-ui", "Tabs UI design examples"],
  cards: ["card-ui", "Card UI design examples"],
  pagination: ["pagination-ui", "Pagination UI design examples"],
  popover: ["popover-ui", "Popover UI design examples"],
  tooltip: ["tooltip-ui", "Tooltip UI design examples"],
  "dropdown-menu": ["dropdown-menu-ui", "Dropdown menu UI design examples"],
  accordion: ["accordion-ui", "Accordion UI design examples"],
  "radio-group": ["radio-button-ui", "Radio button UI design examples"],
  breadcrumbs: ["breadcrumbs-ui", "Breadcrumbs UI design examples"],
  "toggle-switch": ["toggle-switch-ui", "Toggle switch UI design examples"],
  stepper: ["stepper-ui", "Stepper UI design examples"],
  "sidebar-nav": ["sidebar-navigation-ui", "Sidebar navigation UI design examples"],
  spinner: ["loading-spinner", "Loading spinner examples (HTML and CSS)"],
};

// Gallery facets (group / platform / style) rendered by the gallery page with that facet applied server-side.
// [kind, value, slug, H1, title, intro]
export const FACET_SEO = [
  ["group", "sections", "website-sections", "Website section templates", "Website section templates with HTML code (free) | MGD",
    "Landing-page and website sections — heroes, navbars, features, pricing, testimonials, FAQs, CTAs and footers — as original designs you can copy."],
  ["group", "signin", "authentication-ui", "Login, sign-up and onboarding UI examples", "Authentication UI: login, sign-up and onboarding | MGD",
    "Login, sign-up, password reset, two-factor and onboarding screens for web and mobile apps."],
  ["group", "dashboards", "dashboards-and-home-screens", "Dashboard and app home screen examples", "Dashboard and app home screen examples | MGD",
    "App home screens and dashboards: analytics, projects, security, learning and operations."],
  ["group", "data", "lists-tables-and-forms", "List, table and form UI examples", "List, table and form UI examples with code | MGD",
    "Data tables, list and detail views, kanban boards, calendars, search results and multi-step forms."],
  ["group", "shopping", "ecommerce-ui", "Ecommerce UI design examples", "Ecommerce UI design examples with code | MGD",
    "Product pages, carts, checkouts, order confirmations, billing, paywalls and invoices."],
  ["group", "account", "admin-panel-ui", "Admin panel and account settings UI examples", "Admin panel and settings UI examples | MGD",
    "Settings, profiles, team members, roles and permissions, audit logs, API keys and integrations."],
  ["group", "messages", "messaging-and-media-ui", "Messaging, chat and media app UI examples", "Messaging, chat and media app UI examples | MGD",
    "Chat lists and threads, video and voice calls, feeds, music and video players and image viewers."],
  ["group", "tools", "ai-and-productivity-ui", "AI and productivity tool UI examples", "AI and productivity tool UI examples | MGD",
    "AI chat and workspaces, editors, file managers, version history, approvals and canvas tools."],
  ["group", "industries", "industry-app-ui", "Healthcare, booking and home-services app UI examples", "Healthcare, booking and services app UI | MGD",
    "Screens for clinics and telehealth, class and service booking, home-services pros and portfolios."],
  ["group", "states", "ui-states", "UI states: empty, error, loading and success", "UI states: empty, error, loading and success | MGD",
    "Empty states, 404s, skeleton loading, success screens, toasts, dialogs and form errors."],
  ["group", "emails", "email-templates", "Free HTML email templates", "Free HTML email templates (transactional) | MGD",
    "Table-based, inline-styled transactional emails — welcome, verify email, magic link, password reset, invoice, receipt and shipping — with dark-mode overrides."],
  ["group", "websites", "website-templates", "Free website templates", "Free website templates with HTML code, by industry | MGD",
    "Complete, responsive one-page website templates by industry — restaurants, agencies, weddings, stores, salons, real estate, builders, law firms, dentists, gyms, schools, nonprofits, travel, hotels, SaaS and AI."],
  ["group", "operations", "hr-and-operations-ui", "HR and operations app UI examples", "HR and operations app UI: shifts, leave, stock | MGD",
    "Shift schedulers, leave calendars, time-off requests, inventory and multi-location operations dashboards."],
  ["group", "components", "ui-components", "Free UI components with HTML and CSS", "Free UI components with HTML, CSS and JS code | MGD",
    "Accessible building blocks — tabs, cards, pagination, popovers, tooltips, dropdown menus, accordions, radio buttons, breadcrumbs, toggle switches, steppers, sidebars and loading spinners — each with a live demo, every state drawn, keyboard support and ARIA, in light and dark."],
  ["platform", "mobile", "mobile-app-ui", "Mobile app UI design examples", "Mobile app UI design examples with code (free) | MGD",
    "App screens designed for phones, from sign-in and onboarding to feeds, chat, checkout and settings."],
  ["platform", "web", "web-ui", "Web UI design examples", "Web UI design examples with HTML code (free) | MGD",
    "Web app screens and website sections for desktop browsers, from dashboards and tables to landing pages."],
  ["style", "minimal", "minimal-ui", "Minimal UI design examples", "Minimal UI design examples with code (free) | MGD",
    "Quiet, minimal interfaces: generous white space, one accent colour and clear type."],
  ["style", "editorial", "editorial-web-design", "Editorial web design examples", "Editorial web design examples with code (free) | MGD",
    "Magazine-style layouts with serif headlines, strong hierarchy and rules."],
  ["style", "brutalist", "brutalist-web-design", "Brutalist web design examples", "Brutalist web design examples with code (free) | MGD",
    "Raw, high-contrast brutalist and neo-brutalist screens with thick borders and hard shadows."],
  ["style", "luxury", "luxury-website-design", "Luxury website design examples", "Luxury website design examples with code (free) | MGD",
    "Dark, refined luxury interfaces with fine type, gold accents and slow rhythm."],
  ["style", "playful", "playful-ui", "Playful UI design examples", "Playful UI design examples with code (free) | MGD",
    "Bright, rounded and friendly interfaces with bold colour and soft shapes."],
  ["style", "corporate", "corporate-website-design", "Corporate website design examples", "Corporate website design examples with code | MGD",
    "Clean, trustworthy corporate and SaaS interfaces in a calm blue palette."],
  ["style", "retro", "retro-ui", "Retro UI design examples", "Retro UI design examples with code (free) | MGD",
    "Retro interfaces with warm paper tones, pixel-era details and chunky type."],
  ["style", "monochrome", "monochrome-ui", "Monochrome UI design examples", "Monochrome UI design examples with code (free) | MGD",
    "Black-and-white monochrome interfaces built on contrast and type alone."],
];

export const flatSlug = (p) => (PATTERN_SEO[p] ? PATTERN_SEO[p][0] : p);
export const patternSlug = (p) => nestedPatternPath(p) || flatSlug(p);
export const patternH1 = (p) => (PATTERN_SEO[p] ? PATTERN_SEO[p][1] : null);
const FACET_BY_SLUG = Object.fromEntries(FACET_SEO.map(([kind, value, slug, h1, title, intro]) => [slug, { kind, value, slug, h1, title, intro }]));
const FACET_SLUG = Object.fromEntries(FACET_SEO.map(([kind, value, slug]) => [`${kind}:${value}`, slug]));
export const facetSlug = (kind, value) => FACET_SLUG[`${kind}:${value}`] || null;
const PATTERN_BY_SLUG = Object.fromEntries(Object.entries(PATTERN_SEO).map(([p, [s]]) => [s, p]));

// What a /ui/<seg> path means: { type: "pattern", pattern } | { type: "facet", facet } | { type: "old", pattern } (301) | null
export function resolveUiSlug(seg, patterns) {
  if (PATTERN_BY_SLUG[seg] && patterns.includes(PATTERN_BY_SLUG[seg])) { const p = PATTERN_BY_SLUG[seg]; return patternSlug(p) === seg ? { type: "pattern", pattern: p } : { type: "old", pattern: p }; } // nested now: the flat slug 301s
  if (FACET_BY_SLUG[seg]) return { type: "facet", facet: FACET_BY_SLUG[seg] };
  if (patterns.includes(seg)) return patternSlug(seg) === seg ? { type: "pattern", pattern: seg } : { type: "old", pattern: seg };
  return null;
}

// Clean URL for a filter state { pattern, group, platform, style }: the most specific facet is the path,
// the rest stay query params (pattern implies its group, so group is dropped under a pattern).
export function cleanUiUrl(f, base) {
  const q = new URLSearchParams();
  let seg = "";
  if (f.pattern) { seg = patternSlug(f.pattern); if (f.platform) q.set("device", f.platform); if (f.style) q.set("style", f.style); }
  else if (f.group && facetSlug("group", f.group)) { seg = facetSlug("group", f.group); if (f.platform) q.set("device", f.platform); if (f.style) q.set("style", f.style); }
  else if (f.platform && facetSlug("platform", f.platform)) { seg = facetSlug("platform", f.platform); if (f.style) q.set("style", f.style); }
  else if (f.style && facetSlug("style", f.style)) seg = facetSlug("style", f.style);
  const qs = q.toString();
  return `${base}/ui${seg ? "/" + seg : ""}${qs ? "?" + qs : ""}`;
}

// Slug maps for the in-page filter script (keeps chip hrefs and replaceState URLs identical to cleanUiUrl).
export const UI_SLUG_JS = () => JSON.stringify({ p: Object.fromEntries(Object.keys(PATTERN_SEO).map((p) => [p, patternSlug(p)])), f: FACET_SLUG });

const RESERVED = new Set(["flows", "terms", "raw", "sitemap.xml", "download", "tpl"]);
export function assertSlugs(patterns) {
  const seen = new Map();
  const add = (s, who) => {
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(s) || RESERVED.has(s) || /[0-9a-f]{12}$/.test(s)) throw new Error(`bad UI slug ${s} (${who})`);
    if (seen.has(s)) throw new Error(`duplicate UI slug ${s}: ${seen.get(s)} and ${who}`);
    seen.set(s, who);
  };
  for (const [p, [s]] of Object.entries(PATTERN_SEO)) add(s, p);
  for (const [k, v, s] of FACET_SEO) add(s, `${k}:${v}`);
  for (const i of Object.values(INDUSTRIES)) add(i.hub, `industry:${i.id}`); // hubs share the flat namespace
  for (const pl of Object.values(PLATFORMS)) add(pl.hub, `platform:${pl.id}`);
  // An old pattern id may only be reused as a slug by that same pattern (otherwise its 301 target would be ambiguous).
  for (const p of patterns) if (seen.has(p) && seen.get(p) !== p) throw new Error(`slug ${p} is the old id of pattern ${p} but belongs to ${seen.get(p)}`);
  for (const p of patterns) if (!PATTERN_SEO[p]) throw new Error(`pattern ${p} has no SEO slug`);
}
