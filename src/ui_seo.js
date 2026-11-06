// Clean, keyword-matched URLs for MGD UI screen facets (5-Nov-2026).
// Pattern ids stay the internal key (D1 category, MCP, item URLs); pages live at /ui/<slug>, where the slug is the
// head term people search for (Google Ads Keyword Planner, worldwide, Nov-2026; rising-and-volume rule). Old URLs
// (/ui/<pattern-id> and /ui?pattern=|group=|platform=|style=) 301 to these. Secondary filters on top of a facet stay
// query params (?platform=, ?style=) with the canonical on the clean path. Slugs are flat (one namespace under /ui),
// so every slug must be unique and must not be another pattern's old id (checked at load, see assertSlugs).
// Volumes/trends behind each choice: n11 SEO-URL report (slug table).

// pattern id -> [slug, H1]. The H1 carries the searched phrase; the slug is that phrase without "design/examples".
export const PATTERN_SEO = {
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
  "restaurant-website": ["restaurant-website-template", "Restaurant website templates"],
  "agency-website": ["agency-website-template", "Agency website templates"],
  "architecture-website": ["architecture-website-template", "Architecture website templates"],
  "wedding-website": ["wedding-website-template", "Wedding website templates"],
  "ecommerce-website": ["ecommerce-website-template", "Ecommerce website templates"],
  "coffee-shop-website": ["coffee-shop-website-template", "Coffee shop website templates"],
  "salon-website": ["salon-website-template", "Salon website templates"],
  "real-estate-website": ["real-estate-website-template", "Real estate website templates"],
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
  // n13-end
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

export const patternSlug = (p) => (PATTERN_SEO[p] ? PATTERN_SEO[p][0] : p);
export const patternH1 = (p) => (PATTERN_SEO[p] ? PATTERN_SEO[p][1] : null);
const FACET_BY_SLUG = Object.fromEntries(FACET_SEO.map(([kind, value, slug, h1, title, intro]) => [slug, { kind, value, slug, h1, title, intro }]));
const FACET_SLUG = Object.fromEntries(FACET_SEO.map(([kind, value, slug]) => [`${kind}:${value}`, slug]));
export const facetSlug = (kind, value) => FACET_SLUG[`${kind}:${value}`] || null;
const PATTERN_BY_SLUG = Object.fromEntries(Object.entries(PATTERN_SEO).map(([p, [s]]) => [s, p]));

// What a /ui/<seg> path means: { type: "pattern", pattern } | { type: "facet", facet } | { type: "old", pattern } (301) | null
export function resolveUiSlug(seg, patterns) {
  if (PATTERN_BY_SLUG[seg] && patterns.includes(PATTERN_BY_SLUG[seg])) return { type: "pattern", pattern: PATTERN_BY_SLUG[seg] };
  if (FACET_BY_SLUG[seg]) return { type: "facet", facet: FACET_BY_SLUG[seg] };
  if (patterns.includes(seg)) return patternSlug(seg) === seg ? { type: "pattern", pattern: seg } : { type: "old", pattern: seg };
  return null;
}

// Clean URL for a filter state { pattern, group, platform, style }: the most specific facet is the path,
// the rest stay query params (pattern implies its group, so group is dropped under a pattern).
export function cleanUiUrl(f, base) {
  const q = new URLSearchParams();
  let seg = "";
  if (f.pattern) { seg = patternSlug(f.pattern); if (f.platform) q.set("platform", f.platform); if (f.style) q.set("style", f.style); }
  else if (f.group && facetSlug("group", f.group)) { seg = facetSlug("group", f.group); if (f.platform) q.set("platform", f.platform); if (f.style) q.set("style", f.style); }
  else if (f.platform && facetSlug("platform", f.platform)) { seg = facetSlug("platform", f.platform); if (f.style) q.set("style", f.style); }
  else if (f.style && facetSlug("style", f.style)) seg = facetSlug("style", f.style);
  const qs = q.toString();
  return `${base}/ui${seg ? "/" + seg : ""}${qs ? "?" + qs : ""}`;
}

// Slug maps for the in-page filter script (keeps chip hrefs and replaceState URLs identical to cleanUiUrl).
export const UI_SLUG_JS = () => JSON.stringify({ p: Object.fromEntries(Object.entries(PATTERN_SEO).map(([p, [s]]) => [p, s])), f: FACET_SLUG });

const RESERVED = new Set(["flows", "terms", "raw", "sitemap.xml"]);
export function assertSlugs(patterns) {
  const seen = new Map();
  const add = (s, who) => {
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(s) || RESERVED.has(s) || /[0-9a-f]{12}$/.test(s)) throw new Error(`bad UI slug ${s} (${who})`);
    if (seen.has(s)) throw new Error(`duplicate UI slug ${s}: ${seen.get(s)} and ${who}`);
    seen.set(s, who);
  };
  for (const [p, [s]] of Object.entries(PATTERN_SEO)) add(s, p);
  for (const [k, v, s] of FACET_SEO) add(s, `${k}:${v}`);
  // An old pattern id may only be reused as a slug by that same pattern (otherwise its 301 target would be ambiguous).
  for (const p of patterns) if (seen.has(p) && seen.get(p) !== p) throw new Error(`slug ${p} is the old id of pattern ${p} but belongs to ${seen.get(p)}`);
  for (const p of patterns) if (!PATTERN_SEO[p]) throw new Error(`pattern ${p} has no SEO slug`);
}
