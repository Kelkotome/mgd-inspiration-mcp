// Ranking for search_ui_screens (pure JS, no Worker or D1 dependencies, so tests/ui_rank can run it in node).
// Built 3-Nov-2026 from the real MCP query log: the old SQL LIKE search had no stemming, no synonyms, no
// pattern boost and a created_at tiebreak, so "banking app onboarding" returned the canvas editor.
//
// Model: every query word is stemmed and weighted by rarity (IDF over the library). Each row scores the best
// field a word hits: pattern name/aliases > screen title > elements (tags) > product category > description.
// A fully matched multi-word alias ("doctor directory", "now playing") adds a bonus. Ties break on the
// canonical pattern order, then platform/style preference — never on created_at.

export const UI_STYLE_LIST = ["minimal", "editorial", "brutalist", "luxury", "playful", "corporate", "retro", "monochrome"];

// Curated aliases per pattern: the words people actually use for it. Matched after stemming.
export const PATTERN_ALIASES = {
  // 5-Nov-2026 template round (n12): industry website templates (full home pages)
  "restaurant-website": ["restaurant website", "restaurant", "restaurant landing page", "restaurant homepage", "bistro", "casual dining", "casual dining restaurant", "neighbourhood restaurant", "neighborhood restaurant", "menu and reservations", "table booking website", "webtemplate", "restaurant webtemplate"],
  "agency-website": ["agency website", "agency", "creative agency", "design agency", "digital agency", "design studio website", "marketing agency", "webtemplate", "agency webtemplate", "design agency webtemplate", "creative agency webtemplate"],
  "architecture-website": ["architecture website", "architect", "architects", "architecture firm", "architecture studio", "interior design website", "interiors", "webtemplate", "architecture webtemplate", "architect webtemplate"],
  "wedding-website": ["wedding website", "wedding", "weddings", "wedding site", "couple wedding website", "wedding rsvp", "rsvp", "wedding weekend", "webtemplate", "wedding webtemplate"],
  "ecommerce-website": ["ecommerce website", "ecommerce", "online store", "store homepage", "shop homepage", "storefront", "ecommerce homepage", "ecommerce landing page", "webtemplate", "ecommerce webtemplate", "online store webtemplate", "store webtemplate", "shop webtemplate"],
  "coffee-shop-website": ["coffee shop website", "coffee shop", "cafe", "café", "coffee", "coffee house", "espresso bar", "cafe website", "webtemplate", "coffee shop webtemplate", "cafe webtemplate"],
  "salon-website": ["salon website", "salon", "beauty salon", "hair salon", "hairdresser", "barber", "spa website", "webtemplate", "salon webtemplate", "beauty salon webtemplate", "hair salon webtemplate"],
  "real-estate-website": ["real estate website", "real estate", "real estate agency", "real estate brokerage", "property listings", "estate agent", "realty", "property website", "real estate landing page", "webtemplate", "real estate webtemplate", "property webtemplate"],
  "construction-website": ["construction website", "construction", "contractor", "builder", "builders", "construction company", "renovation", "webtemplate", "construction webtemplate", "contractor webtemplate", "builder webtemplate"],
  "law-firm-website": ["law firm website", "law firm", "lawyer", "lawyers", "attorney", "legal", "solicitor", "law office", "webtemplate", "law firm webtemplate", "lawyer webtemplate", "attorney webtemplate"],
  "dental-website": ["dental website", "dental", "dentist", "dental clinic", "dental practice", "webtemplate", "dental webtemplate", "dentist webtemplate"],
  "gym-website": ["gym website", "gym", "fitness studio", "crossfit", "personal trainer website", "fitness landing page", "gym landing page", "webtemplate", "gym webtemplate", "fitness webtemplate"],
  "school-website": ["school website", "school", "education website", "academy", "university website", "college website", "education landing page", "kindergarten", "webtemplate", "school webtemplate", "education webtemplate", "university webtemplate", "academy webtemplate"],
  "nonprofit-website": ["nonprofit website", "nonprofit", "non profit", "charity", "charity website", "ngo", "donation website", "foundation", "food bank", "webtemplate", "nonprofit webtemplate", "charity webtemplate"],
  "travel-website": ["travel website", "travel agency", "tour operator", "tours", "travel landing page", "tour company", "adventure travel", "webtemplate", "travel webtemplate", "tour webtemplate"],
  "hotel-website": ["hotel website", "hotel", "boutique hotel", "resort", "hotel landing page", "hotel homepage", "bed and breakfast", "webtemplate", "hotel webtemplate", "boutique hotel webtemplate"],
  "saas-landing-page": ["saas landing page", "saas website", "saas", "startup landing page", "software landing page", "product landing page", "b2b landing page", "webtemplate", "saas webtemplate", "startup webtemplate", "software webtemplate"],
  "ai-website": ["ai website", "ai landing page", "ai startup", "ai product website", "ai saas", "ai tool landing page", "webtemplate", "ai webtemplate", "ai startup webtemplate"],
  "pest-control-website": ["pest control website", "pest control", "exterminator", "exterminator website", "termite control", "rodent control", "bed bug treatment", "pest control company", "pest control landing page", "webtemplate", "pest control webtemplate", "exterminator webtemplate"],
  "solar-website": ["solar website", "solar", "solar company", "solar installer", "solar panel installer", "solar panels website", "solar energy website", "home battery installer", "solar landing page", "webtemplate", "solar webtemplate", "solar company webtemplate", "solar installer webtemplate"],
  "ai-agent-website": ["ai agent website", "ai agent", "ai agents", "ai agent landing page", "agent platform", "autonomous agent", "support agent saas", "ai agent startup", "webtemplate", "ai agent webtemplate", "ai agents webtemplate"],
  "preschool-website": ["preschool website", "preschool", "nursery", "nursery school", "nursery school webtemplate", "nursery webtemplate", "nursery website", "daycare website", "daycare", "childcare website", "childcare", "kindergarten website", "early years", "preschool landing page", "webtemplate", "preschool webtemplate", "daycare webtemplate", "childcare webtemplate"],
  "apartment-website": ["apartment website", "apartment community", "apartment complex website", "apartments for rent website", "multifamily website", "rental apartments", "leasing website", "apartment landing page", "webtemplate", "apartment webtemplate", "multifamily webtemplate"],
  "pediatrics-website": ["pediatric website", "pediatrics website", "pediatrics", "pediatrician", "pediatrician website", "paediatric website", "paediatrics", "children's clinic", "childrens clinic", "kids doctor", "pediatric clinic", "pediatric landing page", "webtemplate", "pediatric webtemplate", "pediatrics webtemplate", "pediatrician webtemplate"],
  "orthodontics-website": ["orthodontics website", "orthodontics", "orthodontist website", "orthodontist", "braces website", "clear aligners website", "braces", "orthodontic practice", "orthodontics landing page", "webtemplate", "orthodontics webtemplate", "orthodontist webtemplate", "braces webtemplate"],
  "fertility-website": ["fertility website", "fertility clinic", "fertility clinic website", "fertility", "ivf website", "ivf clinic", "ivf", "reproductive medicine", "egg freezing clinic", "fertility landing page", "webtemplate", "fertility webtemplate", "fertility clinic webtemplate", "ivf webtemplate"],
  "medical-website": ["medical website", "medical practice", "medical practice website", "primary care", "gp surgery", "family doctor", "family medicine", "doctor website", "doctors office", "healthcare website", "healthcare landing page", "medical landing page", "clinic website", "webtemplate", "medical webtemplate", "healthcare webtemplate", "doctor webtemplate", "clinic webtemplate", "primary care webtemplate"],
  "real-estate-agent-website": ["real estate agent website", "real estate agent", "realtor", "realtor website", "realtor webtemplate", "agent website", "solo agent", "independent agent", "real estate agent landing page", "realestateagentwebsite"],
  "property-management-website": ["property management website", "property management", "property manager", "property management company", "letting agent", "lettings", "rental management", "landlord services", "property management landing page"],
  "luxury-real-estate-website": ["luxury real estate website", "luxury real estate", "luxury homes", "luxury property", "high end real estate", "estates", "luxury realtor", "luxury real estate landing page"],
  "commercial-real-estate-website": ["commercial real estate website", "commercial real estate", "commercial property", "office space", "office leasing", "office space leasing", "office space to let", "office leasing website", "retail space", "industrial property", "warehouse space", "cre website"],
  "vacation-rental-website": ["vacation rental website", "vacation rental", "holiday rental", "holiday let", "holiday cottage", "short term rental", "short-term rental", "cabin rental", "direct booking website", "vacation rental landing page"],
  "bakery-website": ["bakery website", "bakery", "bakeries", "bakehouse", "patisserie", "cake shop", "bread shop", "bakery landing page", "bakery webtemplate"],
  "pizzeria-website": ["pizzeria website", "pizzeria", "pizza", "pizza shop", "pizza restaurant", "pizza place", "pizza website", "pizzeria landing page", "pizza webtemplate"],
  "bar-website": ["bar website", "pub website", "pub", "pubs", "tavern", "taproom", "taphouse", "cocktail bar", "wine bar", "brewpub", "bar and pub", "bar landing page", "bar webtemplate", "pub webtemplate"],
  "catering-website": ["catering website", "catering", "caterer", "caterers", "catering company", "event catering", "wedding catering", "catering landing page", "catering webtemplate"],
  "food-truck-website": ["food truck website", "food truck", "food trucks", "food van", "street food", "food cart", "mobile kitchen", "food truck landing page", "food truck webtemplate"],
  "fine-dining-website": ["fine dining website", "fine dining", "fine dining restaurant", "tasting menu", "tasting menu restaurant", "upscale restaurant", "fine dining landing page", "fine dining webtemplate"],
  "wedding-invitation-website": ["wedding invitation website", "wedding invitation", "wedding invitations", "digital wedding invitation", "online wedding invitation", "digital invitation", "e-invite", "save the date", "save the date website", "wedding invitation landing page", "wedding invitation webtemplate"],
  "wedding-planner-website": ["wedding planner website", "wedding planner", "wedding planners", "wedding planning", "wedding coordinator", "day-of coordinator", "wedding planner landing page", "wedding planner webtemplate"],
  "wedding-venue-website": ["wedding venue website", "wedding venue", "wedding venues", "barn venue", "event venue", "reception venue", "wedding barn", "wedding venue landing page", "wedding venue webtemplate"],
  "wedding-photographer-website": ["wedding photographer website", "wedding photographer", "wedding photographers", "wedding photography", "elopement photographer", "wedding photography website", "wedding photographer webtemplate"],
  "florist-website": ["florist website", "florist", "florists", "flower shop", "flower shop website", "floral studio", "wedding florist", "florist landing page", "florist webtemplate"],
  "event-planner-website": ["event planner website", "event planner", "event planners", "event planning", "event management", "party planner", "event organiser", "event organizer", "event planner landing page", "event planner webtemplate"],
  "conference-website": ["conference website", "conference", "conferences", "event website", "event site", "event landing page", "summit website", "summit", "conference landing page", "event webtemplate", "conference webtemplate"],
  "home-builder-website": ["home builder website", "home builder", "home builders", "new homes", "new home builder", "housebuilder", "new build homes", "custom home builder", "home builder landing page"],
  "hospital-website": ["hospital website", "hospital", "community hospital", "general hospital", "hospital site", "hospital landing page", "hospital website template", "hospitalwebsite", "healthcare system website"],
  "mental-health-website": ["mental health website", "mental health", "mental health clinic", "psychiatry", "psychiatrist", "psychiatry clinic", "psychiatrist website", "behavioral health", "behavioural health", "mental health clinic website", "mental health website template", "mentalhealthwebsite"],
  "optometry-website": ["optometry website", "optometry", "optometrist", "optometrist website", "optician", "opticians", "eye clinic", "eye clinic website", "eye care", "eyecare", "eye doctor", "optometry website template", "optometrywebsite"],
  "pharmacy-website": ["pharmacy website", "pharmacy", "pharmacist", "community pharmacy", "drugstore", "chemist", "pharmacy landing page", "pharmacy website template", "pharmacywebsite"],
  "cardiology-website": ["cardiology website", "cardiology", "cardiologist", "cardiologist website", "heart clinic", "heart center", "heart centre", "cardiac clinic", "cardiology practice", "cardiology landing page", "webtemplate", "cardiology webtemplate", "cardiologist webtemplate", "heart clinic webtemplate"],
  "dermatology-website": ["dermatology website", "dermatology", "dermatologist", "dermatologist website", "skin clinic", "skin clinic website", "dermatology clinic", "dermatology practice", "dermatology landing page", "webtemplate", "dermatology webtemplate", "dermatologist webtemplate", "skin clinic webtemplate"],
  "therapist-website": ["therapist website", "therapist", "therapy practice", "counselling website", "counseling website", "counsellor website", "counselor website", "psychologist website", "psychotherapist", "psychotherapy", "private practice", "mental health website", "mental health", "mental health landing page", "webtemplate", "therapist webtemplate", "therapy webtemplate", "counseling webtemplate", "counselling webtemplate", "psychologist webtemplate", "mental health webtemplate"],
  "physical-therapy-website": ["physical therapy website", "physical therapy", "physical therapist", "physiotherapy website", "physiotherapy", "physiotherapist", "physio website", "physio", "sports rehab", "rehab clinic", "physical therapy landing page", "webtemplate", "physical therapy webtemplate", "physiotherapy webtemplate", "physio webtemplate"],
  "veterinary-website": ["veterinary website", "veterinary", "veterinarian", "vet website", "vet clinic", "vet practice", "animal hospital", "animal clinic", "pet clinic", "veterinary landing page", "webtemplate", "veterinary webtemplate", "vet webtemplate", "animal hospital webtemplate"],
  "financial-advisor-website": ["financial advisor website", "financial advisor", "financial adviser", "financial planner", "financial planning website", "wealth manager", "wealth management website", "independent advisor", "financial advisor landing page", "webtemplate", "financial advisor webtemplate", "financial planner webtemplate", "wealth management webtemplate"],
  "cleaning-service-website": ["cleaning service website", "cleaning service", "cleaning company", "cleaning business", "cleaning website", "house cleaning", "home cleaning", "maid service", "office cleaning", "commercial cleaning", "janitorial", "cleaning service landing page", "webtemplate", "cleaning webtemplate", "cleaning service webtemplate", "cleaning company webtemplate", "house cleaning webtemplate"],
  "hvac-website": ["hvac website", "hvac", "hvac company", "heating and cooling", "heating and air", "air conditioning website", "ac repair", "furnace repair", "heat pump installer", "hvac contractor", "hvac landing page", "webtemplate", "hvac webtemplate", "heating webtemplate", "air conditioning webtemplate", "ac repair webtemplate"],
  "cybersecurity-website": ["cybersecurity website", "cybersecurity", "cyber security website", "cyber security", "security startup", "security company website", "cloud security website", "security saas", "cybersecurity landing page", "infosec", "webtemplate", "cybersecurity webtemplate", "cyber security webtemplate", "security webtemplate"],
  "crm-landing-page": ["crm landing page", "crm website", "crm", "sales crm", "crm software website", "crm saas", "sales software landing page", "webtemplate", "crm webtemplate", "sales crm webtemplate"],
  "coaching-website": ["coaching website", "coaching", "coach website", "life coach", "business coach", "executive coach", "leadership coach", "career coach", "coaching landing page", "webtemplate", "coaching webtemplate", "coach webtemplate", "life coach webtemplate", "business coach webtemplate"],
  "dashboard": ["dashboard", "kpi", "kpis", "overview", "admin dashboard", "analytics dashboard", "stat tiles", "summary cards", "home dashboard"],
  "data-table": ["data table", "table", "datagrid", "data grid", "spreadsheet", "rows", "records", "customers table", "row selection"],
  "analytics-charts": ["analytics", "analytics report", "charts", "chart", "graphs", "report", "reporting", "donut chart", "revenue chart", "metrics"],
  "login": ["login", "sign in", "log in", "signin", "email and password", "login with email", "sign in with email"],
  "sign-up": ["sign up", "signup", "register", "registration", "create account", "create an account"],
  "forgot-password": ["forgot password", "reset password", "password reset", "lost password"],
  "two-factor": ["two factor", "2fa", "mfa", "otp", "verification code", "one time code", "authenticator"],
  "welcome": ["welcome", "welcome screen", "welcome page", "members club", "community welcome", "get started", "carousel", "intro screen", "splash"],
  "onboarding-step": ["onboarding", "onboarding step", "choose your goal", "questionnaire", "setup step", "one question"],
  "permissions-request": ["permission", "permissions request", "notification permission", "allow notifications", "push permission"],
  "home": ["home", "home screen", "today", "habit", "habits", "daily", "checklist home", "fitness"],
  "feed": ["feed", "posts", "social feed", "photo feed", "community feed"],
  "list-view": ["list", "list view", "task list", "todo", "to do", "grouped list", "my tasks"],
  "detail-view": ["detail", "detail page", "record detail", "task detail", "item detail", "detail view"],
  "kanban-board": ["kanban", "kanban board", "board", "pipeline", "columns"],
  "calendar": ["calendar", "week view", "agenda", "schedule", "weekly calendar"],
  "file-manager": ["file manager", "files", "folders", "drive", "file browser", "downloads", "download queue", "uploads"],
  "search-results": ["search results", "search", "results", "search page"],
  "editor-toolbar": ["document editor", "text editor", "rich text", "editor", "toolbar", "writing", "docs editor"],
  "chat-ai-assistant": ["ai chat", "chat assistant", "chatbot", "ai assistant", "assistant", "copilot", "suggested prompts", "ai chat assistant"],
  "chat-list": ["chat list", "inbox", "conversations", "messages", "messaging", "chat inbox"],
  "chat-thread": ["chat thread", "channel", "thread", "chat", "team chat"],
  "video-call": ["video call", "video meeting", "meeting", "video conference", "call in progress"],
  "image-viewer": ["image viewer", "lightbox", "photo viewer", "gallery viewer", "fullscreen photo"],
  "map-view": ["map", "explore map", "map view", "location", "places"],
  "video-player": ["video player", "video", "watch", "player controls"],
  "create-post": ["create post", "new post", "compose", "composer", "upload photo", "post a photo"],
  "class-schedule": ["class schedule", "classes", "timetable", "schedule", "class"],
  "booking-details": ["booking", "book", "reservation", "booking details", "appointment booking", "book a class"],
  "booking-confirmed": ["booking confirmed", "booking confirmation", "reservation confirmed", "booked"],
  "product-detail": ["product detail", "product page", "pdp", "product", "shop", "store", "shopping", "ecommerce", "item page"],
  "cart": ["cart", "shopping cart", "basket", "bag"],
  "checkout": ["checkout", "payment", "pay", "shipping", "payment form"],
  "order-confirmation": ["order confirmation", "order confirmed", "order placed", "order"],
  "settings": ["settings", "preferences", "switches", "settings toggles", "settings toggle switches", "account settings", "settings list", "configuration", "settings panel"],
  "profile": ["profile", "member profile", "user profile", "account page", "profile header"],
  "notifications-center": ["notifications", "notification center", "notification", "alerts", "activity feed"],
  "team-members": ["team members", "members", "invite", "teammates", "users", "staff", "team"],
  "roles-permissions": ["roles", "permissions", "roles and permissions", "access control", "rbac"],
  "audit-log": ["audit log", "activity log", "log", "events log", "security log"],
  "api-keys": ["api keys", "api key", "tokens", "secret key", "developer keys"],
  "integrations": ["integrations", "connected apps", "connectors", "integrations settings", "apps"],
  "billing-plans": ["billing", "billing plans", "plans", "subscription", "usage", "current plan", "billing settings"],
  "invoice": ["invoice", "line items", "bill", "invoice detail", "payment status"],
  "paywall-upgrade": ["paywall", "upgrade", "upsell", "trial", "pro plan", "go premium"],
  "cancel-subscription": ["cancel subscription", "cancel", "churn", "retention offer", "unsubscribe"],
  "empty-state": ["empty state", "empty", "no data", "first run", "zero state", "inbox zero", "blank state"],
  "error-404": ["404", "not found", "error page", "page not found", "error"],
  "loading-skeleton": ["loading", "skeleton", "shimmer", "loading state", "skeleton loader"],
  "success-confirmation": ["success", "confirmation", "confirmed", "celebration", "completed", "done"],
  "ai-workspace": ["ai workspace", "generation", "generate", "ai generation", "prompt", "generator", "input panel", "ai tool"],
  "ai-settings": ["ai settings", "model settings", "assistant settings", "provider", "providers", "model", "models", "voice assistant", "ai model"],
  "version-history": ["version history", "versions", "version", "diff", "compare versions", "revision", "revisions", "before and after", "changes history"],
  "approval-queue": ["approval", "approve", "approval queue", "pending requests", "reject", "review queue", "requests", "approve reject"],
  "doctor-directory": ["doctor directory", "doctors", "doctor", "find a doctor", "medical team", "physicians", "care team", "doctor profile", "directory", "specialists"],
  "telehealth-visit": ["telehealth", "telemedicine", "video consultation", "video consult", "virtual visit", "virtual appointment", "waiting room", "visit summary", "consultation"],
  "clinic-home": ["clinic", "clinic homepage", "medical specialties", "patient homepage", "medical", "hospital portal", "patient portal home"],
  "music-player": ["music player", "now playing", "nowplaying", "audio player", "music", "player", "audio", "podcast player"],
  "playlist": ["playlist", "album", "track list", "tracklist", "tracks", "songs"],
  "portfolio-home": ["portfolio", "personal site", "work index", "personal portfolio", "selected work", "portfolio hero", "portfolio webtemplate", "personal webtemplate", "designer webtemplate", "resume webtemplate"],
  "case-study": ["case study", "case studies", "project write up"],
  "security-dashboard": ["security dashboard", "vulnerabilities", "vulnerability", "severity", "threats", "cve", "security"],
  "project-tracker": ["project tracker", "projects", "project", "project dashboard", "phases", "milestones", "progress ring", "project status"],
  "course-dashboard": ["course", "courses", "learning", "lms", "students", "student", "lessons", "school", "teacher", "education"],
  "form-wizard": ["form wizard", "wizard", "multi step form", "multistep form", "stepper form", "step form", "application form", "multi step"],
  "bank-onboarding": ["bank onboarding", "bank account", "open account", "open a bank account", "kyc", "identity verification", "fintech", "account setup", "bank", "money account"],
  "product-scan": ["scan", "scanner", "barcode", "camera scan", "ingredients", "skincare", "beauty", "scan result"],
  "split-view": ["master detail", "split view", "detail pane", "list and detail", "two pane", "split pane"],
  "canvas-editor": ["canvas", "flow diagram", "sitemap", "diagram", "whiteboard", "nodes", "flowchart", "inspector"],
  "floor-plan": ["floor plan", "office map", "desk booking", "room booking", "building map", "indoor map"],
  "voice-call": ["voice call", "phone call", "call in progress", "calling", "audio call", "call"],
  // home services (Handmere)
  "pro-directory": ["find a pro", "pro directory", "plumber", "plumbers", "electrician", "electricians", "cleaner", "cleaners", "handyman", "tradesperson", "tradesman", "contractor", "homeservices", "service provider", "service providers", "provider list", "home repair", "find a plumber", "local pros", "marketplace"],
  "service-booking": ["service booking", "book a service", "book a plumber", "book a pro", "arrival window", "time slot", "time slots", "appointment slot", "schedule a visit", "homeservices booking", "job request", "request a quote", "slot taken", "slot unavailable"],
  "job-tracker": ["job tracker", "order tracking", "track order", "live tracking", "on the way", "eta", "arrival time", "driver tracking", "courier tracking", "delivery tracking", "map tracking", "pro on the way", "job done", "rate and tip", "tip", "rate your pro", "service receipt"],
  // 5-Nov-2026 round (n11): transactional emails, staff scheduling + time off, multi-location ops, inventory, savings goal, skincare carousel
  "account-email": ["account email", "transactional email", "transactional emails", "email template", "email templates", "html email", "welcome email", "verify email", "verification email", "email verification", "confirm email", "confirm your email", "check your email", "email confirmation", "confirmation email", "email sent", "magic link", "magic link email", "sign in link", "passwordless", "password reset email", "reset password email", "invoice email", "billing email", "newsletter"],
  "order-email": ["order email", "receipt email", "order receipt", "receipt", "order confirmation email", "shipping update", "shipping email", "shipping notification", "shipping confirmation", "delivery update", "tracking email", "order shipped", "transactional email", "transactional emails", "email template"],
  "shift-scheduler": ["shift scheduler", "shift schedule", "shift scheduling", "shifts", "shift", "rota", "roster", "rostering", "staff schedule", "staff scheduling", "employee schedule", "work schedule", "weekly shifts", "open shifts", "schedule management", "workforce", "scheduling"],
  "leave-calendar": ["leave calendar", "time off calendar", "pto calendar", "holiday calendar", "absence calendar", "vacation calendar", "leave", "time off marks", "team availability", "who is off", "leave balance"],
  "time-off-request": ["time off request", "time off", "leave request", "request leave", "request time off", "pto request", "pto", "holiday request", "vacation request", "absence request", "approve leave", "leave approval", "time off approval", "annual leave", "approve time off"],
  "ops-dashboard": ["operations dashboard", "ops dashboard", "operations", "operational", "multi location", "multiple locations", "locations", "two locations", "store dashboard", "branches", "franchise", "restaurant dashboard", "cafe dashboard", "retail dashboard", "sales today", "store operations", "small business admin", "sales report"],
  "inventory-stock": ["inventory", "stock", "stock levels", "stock list", "low stock", "out of stock", "restock", "reorder", "receive stock", "receive delivery", "goods received", "purchase order", "par level", "warehouse", "stock alerts", "restock form"],
  "savings-goal": ["savings goal", "savings", "saving", "goal", "goals", "personal finance", "budget goal", "projection", "projection chart", "savings tracker", "emergency fund", "save money"],
  "onboarding-carousel": ["onboarding carousel", "carousel", "intro slides", "walkthrough", "onboarding slides", "welcome carousel", "intro carousel", "page dots", "skincare onboarding", "beauty onboarding"],
  // interaction states (3-Nov-2026 round 3)
  "toast-snackbar": ["toast", "snackbar", "toast notification", "undo", "undo toast", "toast with undo", "notification toast"],
  "confirm-dialog": ["confirm dialog", "confirmation dialog", "confirm delete", "delete confirmation", "destructive", "modal", "dialog", "are you sure", "type to confirm"],
  "side-drawer": ["drawer", "side drawer", "side panel", "slide over", "detail panel", "sheet", "bottom sheet"],
  "command-palette": ["command palette", "cmd k", "command menu", "quick switcher", "spotlight search", "command bar"],
  "date-range-picker": ["date range", "date range picker", "date picker", "range picker", "calendar picker", "datepicker"],
  "form-validation": ["validation", "form validation", "form errors", "inline errors", "error messages", "error state", "invalid", "error summary"],
  "auth-error": ["login error", "sign in error", "wrong password", "incorrect password", "account locked", "locked out", "code expired", "expired code", "auth error", "failed login"],
  "payment-declined": ["card declined", "payment declined", "payment failed", "payment error", "declined", "checkout error", "insufficient funds"],
  // website sections
  "hero": ["centered hero", "hero", "landing hero", "hero section", "above the fold", "landing page", "landing"],
  "navigation-header": ["navigation", "nav", "header", "navbar", "mega menu", "menu", "navigation header"],
  "feature-grid": ["features", "feature grid", "feature list", "benefits", "feature section"],
  "bento-features": ["bento", "bento grid", "bento features"],
  "how-it-works": ["how it works", "process steps", "steps", "process"],
  "logo-cloud": ["logo cloud", "logos", "trusted by", "customer logos", "logo wall"],
  "stats-band": ["stats band", "stats", "statistics", "numbers band", "metrics band"],
  "testimonials": ["testimonials", "testimonial", "reviews", "quotes", "customer stories", "social proof"],
  "pricing": ["pricing", "pricing plans", "price table", "pricing table", "packages", "tiers", "pricing section"],
  "comparison-table": ["comparison table", "comparison", "compare", "side by side", "versus"],
  "scored-comparison": ["scored comparison", "scorecard", "score", "scores", "scoring", "rating table", "ratings", "weighted", "weighted scores", "footnotes", "source footnotes", "sources", "product comparison", "comparison with scores", "methodology"],
  "integrations-grid": ["integrations directory", "integrations grid", "app directory", "app tiles", "marketplace"],
  "security-trust": ["security and trust", "trust", "compliance", "soc 2", "gdpr"],
  "faq": ["faq", "faqs", "questions", "faq accordion", "frequently asked"],
  "cta-banner": ["cta", "call to action", "cta banner", "signup banner"],
  "about-team": ["about", "about us", "team page", "our team", "team grid", "about page"],
  "careers": ["careers", "jobs", "open roles", "hiring", "job listings", "job board"],
  "blog-index": ["blog", "articles", "blog index", "news", "posts index"],
  "changelog": ["changelog", "release notes", "updates", "whats new", "timeline", "changelog timeline"],
  "contact-form": ["contact", "contact form", "enquiry", "inquiry", "contact sales", "get in touch"],
  "footer": ["footer", "site footer"],
  // UI components round 1 (7-Nov-2026). Bare component names belong here now: "toggle"/"switches" left settings, "stepper" left form-wizard,
  // "accordion" left faq and "loader" left loading-skeleton (each keeps its multi-word phrases, e.g. "faq accordion", "stepper form").
  "tabs": ["tabs", "tab component", "tabs component", "tab list", "tablist", "tab panel", "tab panels", "tabbed", "tabbed interface", "tabbed navigation", "tabs ui", "tabs design"],
  "cards": ["cards", "card component", "card ui", "card design", "product card", "product cards", "card grid", "card layout", "clickable card", "ecommerce card"],
  "pagination": ["pagination", "pager", "paging", "page numbers", "pagination component", "next previous", "page navigation", "numbered pages"],
  "popover": ["popover", "popovers", "popup panel", "pop up panel", "popover menu", "share popover", "flyout", "popover dialog"],
  "tooltip": ["tooltip", "tooltips", "tool tip", "hint bubble", "hover hint", "info tooltip", "hover text"],
  "dropdown-menu": ["dropdown", "dropdowns", "dropdown menu", "drop down menu", "menu button", "actions menu", "action menu", "kebab menu", "overflow menu", "more menu", "context menu", "options menu"],
  "accordion": ["accordion", "accordions", "collapsible", "collapsible sections", "expandable sections", "expand collapse", "disclosure", "accordion component"],
  "radio-group": ["radio", "radios", "radio button", "radio buttons", "radio group", "radio cards", "option cards", "choose one", "single choice", "radio input"],
  "breadcrumbs": ["breadcrumbs", "breadcrumb", "breadcrumb navigation", "breadcrumb trail", "crumbs", "page trail"],
  "toggle-switch": ["toggle", "toggles", "switch", "switches", "toggle switch", "toggle switches", "on off switch", "toggle button", "switch component"],
  "stepper": ["stepper", "steppers", "step indicator", "progress steps", "progress stepper", "step progress", "wizard steps", "step tracker", "steps component"],
  "sidebar-nav": ["sidebar", "sidebars", "side nav", "sidenav", "sidebar navigation", "sidebar nav", "sidebar menu", "side menu", "left nav", "left navigation", "vertical nav", "vertical navigation", "collapsible sidebar", "app sidebar"],
  "spinner": ["spinner", "spinners", "loader", "loaders", "loading spinner", "loading indicator", "busy indicator", "activity indicator", "busy button", "loading button", "css loader"],
  // 8-Nov-2026 gap round (mcp-gap-r1): words from the real queries that got only 1-2 screens on 7-Nov.
  "music-home": ["music home", "music app", "music app home", "music home screen", "music library", "your library", "recently played", "made for you", "music streaming", "listening home"],
  "album-page": ["album page", "artist page", "artist profile", "discography", "album tracks", "album track list", "album screen"],
  "play-queue": ["play queue", "up next", "queue", "lyrics", "synced lyrics", "now playing queue", "now playing lyrics", "player queue"],
  "story-viewer": ["stories", "story", "story viewer", "photo stories", "create story", "social stories", "stories bar"],
  "photo-post": ["photo post", "post detail", "comments", "comment thread", "post comments", "social post", "photo detail"],
  "post-composer": ["create photo post", "new photo post", "photo filters", "post caption", "caption", "post editor", "share photo"],
  "barcode-scanner": ["barcode scanner", "barcode scan", "scan barcode", "qr scanner", "scan history", "camera scanner", "viewfinder", "scan product"],
  "skincare-routine": ["skincare routine", "skincare app", "beauty routine", "routine", "product shelf", "my products", "skincare tracker", "skin care"],
  "image-editor": ["image editor", "photo editor", "image editing", "photo editing", "crop", "layers panel", "layers", "adjustments", "image canvas"],
  "document-editor": ["rich text editor", "rich text", "wysiwyg", "formatting toolbar", "slash menu", "slash commands", "document toolbar", "text formatting"],
  "sales-pipeline": ["sales pipeline", "pipeline board", "deal pipeline", "deals", "crm pipeline", "crm board", "kanban pipeline", "deal stages", "sales board"],
  "sprint-board": ["sprint board", "sprint", "scrum board", "backlog", "sprint planning", "task board", "agile board", "kanban columns", "full height columns"],
  "project-timeline": ["project timeline", "gantt", "gantt chart", "timeline view", "roadmap", "project phases", "phases board", "project tracker phases"],
  "approval-request": ["approval request", "purchase approval", "access request", "approve request", "approver", "approval chain", "expense approval", "approve or reject"],
  "diff-viewer": ["diff viewer", "diff", "compare versions", "side by side diff", "inline diff", "text diff", "redline", "track changes", "compare changes"],
  "release-notes": ["release notes", "whatsnew", "product updates", "changelog timeline", "version notes", "release timeline", "new features"],
  "stock-count": ["stock count", "stocktake", "stock take", "cycle count", "inventory count", "expected vs counted", "count variance", "variance", "counted"],
  "purchase-order": ["purchase order", "purchase orders", "restock", "reorder", "supplier order", "low stock reorder", "receive stock po"],
  "subscription-billing": ["subscription billing", "billing page", "billing overview", "current subscription", "change plan", "upgrade plan", "invoices list", "plan usage", "subscription settings"],
  "usage-pricing": ["tiered pricing", "quantity pricing", "volume pricing", "usage based pricing", "pricing tiers", "seat pricing", "per seat", "pricing calculator", "quantity tiers"],
  "payment-methods": ["payment methods", "payment method", "saved cards", "add card", "add a card", "card form", "credit card form", "billing card"],
  "habit-tracker": ["habit tracker", "habits", "habit", "daily habits", "streak", "streaks", "habit checklist", "streak calendar", "daily habit checklist"],
  "language-lesson": ["gamified lesson", "language lesson", "language learning", "lesson", "xp", "hearts", "lesson complete", "gamified learning", "gamification", "gamified"],
  "leaderboard": ["leaderboard", "ranking", "rankings", "league", "leagues", "top players", "friends streaks", "ranking table"],
  "delete-confirm": ["delete confirmation", "destructive confirm", "destructive confirm dialog", "delete dialog", "bulk delete", "delete modal", "delete project", "delete files"],
  "celebration": ["celebration", "celebrate", "confetti", "milestone", "achievement", "achievement unlocked", "milestone achieved", "badge earned", "success celebration"],
  "integration-connect": ["connect app", "connected apps", "integration settings", "integrations settings", "oauth consent", "app permissions", "connect integration", "authorize app", "disconnect"],
  "model-providers": ["model providers", "ai providers", "provider api keys", "model usage", "spend limits", "token usage", "ai model settings", "llm settings", "bring your own key"],
  // 9-Nov-2026 gap round r2 (mcp-gap-r2): real zero/weak queries (payroll, timesheet, invoices, empty state, billing admin, loyalty).
  "payroll": ["payroll", "pay run", "payroll dashboard", "payroll software", "run payroll", "approve payroll", "payslip", "pay slip", "pay stub", "paystub", "salary slip", "employee pay"],
  "timesheet": ["timesheet", "timesheets", "weekly timesheet", "time sheet", "clock in clock out", "time clock", "time tracking", "hours worked", "timesheet approval", "approve timesheets", "attendance"],
  "invoice-list": ["invoices", "invoice list", "invoices table", "invoicing app", "small business billing", "create invoice", "new invoice", "invoice generator", "invoice form", "overdue invoices", "invoices list", "bills list"],
  "first-run": ["first run", "first-run experience", "onboarding checklist", "getting started checklist", "setup checklist", "empty dashboard", "empty state first run", "blank slate", "no projects yet", "dashboard with onboarding checklist", "zero state", "new user empty state"],
  "media-library": ["media library", "image picker", "image picker modal", "media picker", "asset library", "file picker", "image gallery modal", "media library thumbnails grid", "insert image dialog", "delete confirmation with image preview", "delete images dialog", "select images grid"],
  "subscriptions-admin": ["subscription management", "admin subscriptions table", "subscribers table", "subscriptions list", "manage subscriptions admin", "subscription detail", "dunning", "failed payment retry", "past due subscriptions", "mrr table", "saas admin billing", "customer subscriptions", "subscribers list", "subscriber list"],
  "upgrade-preview": ["upgrade prompt", "premium upgrade", "locked feature", "upgrade banner", "upsell callout", "feature gating", "upgrade modal", "pro plan benefits", "free vs pro comparison", "start free trial prompt", "premium feature preview", "inline upgrade callout", "upsell banner", "premium feature"],
  "plan-checkout": ["subscription checkout", "saas checkout", "plan checkout", "upgrade checkout", "seats checkout", "free trial checkout", "start free trial", "trial card required", "annual billing toggle", "billing checkout dark", "order summary tax", "trial timeline"],
  "compact-header": ["compact header", "dark header", "logo badge", "compact logo badge dark header", "pill navigation", "pill nav header", "app top bar", "app header", "workspace switcher", "environment switcher", "top bar with breadcrumbs", "header with command k search"],
  "loyalty-card": ["loyalty card", "stamp card", "digital stamp card", "coffee stamp card", "loyalty program app", "rewards app", "punch card", "wallet pass", "loyalty wallet pass", "membership pass with qr code", "loyalty stamp card wallet pass on phone", "cafe rewards"],
  // 11-Nov-2026 MCP gaps r2: dating app set (real zeros "mobile dating swipe dark luxury", "dating app swipe"). Brand names are folded in SYN_PHRASES.
  "dating-swipe": ["dating app", "dating app ui", "dating swipe", "swipe cards", "swipe card stack", "swipeable cards", "swipe to like", "swipe left swipe right", "swipe right to like", "card stack", "profile card stack", "dating discover", "match screen", "mutual match", "new match screen", "you matched", "daily picks"],
  "dating-profile": ["dating profile", "dating app profile", "dating profile prompts", "profile prompts", "dating filters", "dating preferences", "discovery filters", "age range slider", "distance filter", "match preferences", "dating settings"],
  "dating-chat": ["dating chat", "dating app chat", "dating messages", "dating inbox", "new matches", "matches list", "match list", "matches and messages", "chat with a match", "date plan", "plan a date", "date proposal"],
  "dating-onboarding": ["dating onboarding", "dating app onboarding", "dating sign up", "dating app signup", "create dating profile", "dating profile setup", "add your photos", "photo upload grid", "upload profile photos"],
};
// Words that only point at a nearby pattern (used for suggestions when nothing matches, never as matches).
const HINTS = { homeservices: ["pro-directory", "service-booking", "booking-details", "class-schedule"], shoe: ["product-detail", "cart"], sneaker: ["product-detail", "cart"], shirt: ["product-detail"], dress: ["product-detail"],
  jacket: ["product-detail"], furniture: ["product-detail"], grocery: ["cart", "product-detail"], food: ["product-detail", "hero"],
  restaurant: ["booking-details", "hero"], plumber: ["pro-directory", "service-booking", "booking-details", "class-schedule"], cleaning: ["pro-directory", "service-booking", "booking-details"], salon: ["booking-details", "class-schedule"],
  hotel: ["booking-details", "map-view"], flight: ["booking-details", "checkout"], travel: ["map-view", "booking-details"], real: ["map-view", "detail-view"],
  estate: ["map-view", "detail-view"], property: ["map-view", "detail-view"], toast: ["success-confirmation", "notifications-center"], snackbar: ["success-confirmation", "notifications-center"],
  undo: ["success-confirmation"], modal: ["cancel-subscription", "paywall-upgrade"], dialog: ["cancel-subscription", "paywall-upgrade"], drawer: ["split-view", "detail-view"],
  range: ["calendar", "booking-details"], picker: ["calendar", "booking-details"], dropdown: ["settings", "navigation-header"], watch: ["home", "music-player"],
  weather: ["home", "dashboard"], recipe: ["detail-view", "feed"], donation: ["checkout", "hero"], charity: ["checkout", "hero"], crypto: ["dashboard", "bank-onboarding"],
  game: ["home", "feed"], quiz: ["onboarding-step", "form-wizard"], survey: ["form-wizard", "onboarding-step"], delivery: ["map-view", "order-confirmation"] };

const STOP = new Set(["the", "and", "for", "with", "from", "that", "this", "are", "some", "any", "of", "to", "in", "on", "an", "or", "by", "at", "as", "is", "it", "its",
  "my", "our", "your", "me", "we", "us", "up", "per", "via", "into", "like", "also", "each", "all", "one", "who", "what", "show", "need", "want", "give",
  "app", "apps", "application", "screen", "screens", "page", "pages", "ui", "ux", "view", "design", "designs", "designed", "layout", "layouts", "interface",
  "template", "templates", "component", "components", "example", "examples", "inspiration", "idea", "ideas", "reference", "references", "mockup", "website", "site", "web",
  "mobile", "ios", "iphone", "android", "desktop", "tablet", "responsive", "style", "styled", "theme", "themed", "mode", "light", "dark", "night",
  // tone words: describe a look, not a screen (styles are their own filter)
  "clean", "modern", "simple", "beautiful", "nice", "premium", "warm", "friendly", "calm", "soft", "rounded", "big", "large", "small", "clear", "readable",
  "accessible", "accessibility", "distinctive", "professional", "trustworthy", "human", "centered", "centred", "easy", "browse", "sleek", "elegant", "bold", "colourful", "colorful", "cute",
  "fun", "serious", "oriented", "focused", "compact", "dense", "full", "height", "high", "quality", "best", "good", "great", "new", "blue", "green",
  "red", "purple", "orange", "black", "white", "pink", "yellow", "grey", "gray", "vibrant", "pastel", "neutral", "subtle", "exclusive", "decorative", "graphics",
  "hierarchy", "minimalist", "contemporary", "trendy", "polished", "pretty", "lovely", "creative", "unique", "stunning", "awesome", "fresh", "sophisticated"]);
const STYLE_WORDS = { minimal: "minimal", minimalist: "minimal", clean: "minimal", editorial: "editorial", magazine: "editorial", brutalist: "brutalist", brutal: "brutalist",
  luxury: "luxury", premium: "luxury", elegant: "luxury", playful: "playful", fun: "playful", friendly: "playful", cute: "playful", corporate: "corporate", enterprise: "corporate",
  business: "corporate", retro: "retro", vintage: "retro", monochrome: "monochrome", mono: "monochrome", grayscale: "monochrome", greyscale: "monochrome" };
const PLATFORM_WORDS = { mobile: "mobile", ios: "mobile", iphone: "mobile", android: "mobile", web: "web", desktop: "web", website: "web", browser: "web" };

// Multi-word phrases folded into one token before splitting (applied to queries and documents alike).
const PHRASES = [[/\bpay[\s-]?runs?\b/g, "payrun"], [/\bfirst[\s-]runs?\b/g, "firstrun"], // 9-Nov (r2): "running shoes" must not stem into "pay run" / "first run"
  [/\bsign[\s-]?in\b/g, "login"], [/\blog[\s-]?in\b/g, "login"], [/\bsign[\s-]?up\b/g, "signup"], [/\bto[\s-]do\b/g, "todo"],
  [/\be[\s-]commerce\b/g, "ecommerce"], [/\bnow[\s-]playing\b/g, "nowplaying"], [/\bwhat'?s new\b/g, "whatsnew changelog"], [/\bcheck[\s-]out\b/g, "checkout"],
  [/\bmulti[\s-]step\b/g, "multistep"], [/\bmaster[\s-]detail\b/g, "masterdetail"], [/\bwork[\s-]?flow\b/g, "workflow"], [/\b2[\s-]?fa\b/g, "2fa"],
  [/\bone[\s-]time\b/g, "onetime"], [/\bset[\s-]?up\b/g, "setup"], [/\bdrop[\s-]?down\b/g, "dropdown"], [/\bfaq'?s\b/g, "faq"], [/\b(e-?mail)\b/g, "email"],
  [/\bhome[\s-]services?\b/g, "homeservices"], [/\bluxury (?:real[\s-]estate|homes?|propert(?:y|ies)|realtors?)\b/g, "luxuryestate"], [/\b(?:custom )?home[\s-]?builders?\b/g, "homebuilder"], [/\bnew[\s-](?:build )?homes?\b/g, "homebuilder"], [/\breal[\s-]estate agents?\b|\brealtors?\b/g, "realtoragent"], [/\b(?:websites?|landing[\s-]pages?|home[\s-]?pages?|site)(?:\s+(?:templates?|designs?|themes?))?(?=\s*$|\s+(?:templates?|designs?|themes?|with|for|that|in|html|code|free)\b)/g, "webtemplate"], [/\b(?:website|landing page|html) templates?\b/g, "webtemplate"], [/\bcolou?rs?\b/g, "colour"], [/\bkpis?\b/g, "kpi"]];
// Synonyms (9-Nov-2026, mcp-gap-r2). QUERY side only: rows, document frequencies and every pattern alias stay exactly as they
// were, so the change can only add matches for words the library did not use. Real zeros on 7-Nov: "payroll", "timesheet" (x2),
// "empty state" variants. (1) Multi-word variants are rewritten to the word our screens use ("zero state" → "empty state",
// "pay stub" → "payslip", "time tracking" → "timesheet"). (2) Single words get alternates (SYN_GROUPS): a row without the word
// itself but with an alternate counts it at SYN_W of the field weight, so a row that has the user's own word always wins.
export const SYN_PHRASES = [
  [/\b(?:zero|blank|no[\s-]data|nothing[\s-]yet)[\s-]states?\b|\bblank[\s-]slates?\b/g, "empty state"],
  [/\bfirst[\s-]time[\s-](?:use|user|users|experience)\b|\bfirst[\s-]launch\b/g, "first run"],
  [/\bpay[\s-]?stubs?\b|\bpay[\s-]?slips?\b|\bpay[\s-]?checks?\b|\bpay[\s-]?cheques?\b|\bwage[\s-]?slips?\b|\bsalary[\s-]slips?\b|\bearnings[\s-]statements?\b/g, "payslip"],
  [/\bpay[\s-]?runs?\b|\bpay[\s-]?rolls?\b|\bsalary[\s-]runs?\b/g, "payroll"],
  [/\btime[\s-]?sheets?\b|\btime[\s-]?cards?\b|\btime[\s-]track(?:ing|er)\b|\bclock[\s-]?ins?(?:[\s-](?:and|\/)[\s-]?clock[\s-]?outs?)?\b|\bhours[\s-]logged\b|\bhours[\s-]log\b/g, "timesheet"],
  [/\bnav[\s-]?bars?\b|\bnavigation[\s-]bars?\b|\btop[\s-]?bars?\b|\bapp[\s-]?bars?\b|\bmenu[\s-]?bars?\b|\bheader[\s-]bars?\b/g, "navbar"],
  // 11-Nov-2026 MCP gaps r2: dating app brand names in a query mean "a dating app like that" (none of our screens copy one).
  [/\btinder(?:[\s-]*(?:like|style|esque|type|clone|inspired))?\b/g, "dating app swipe"],
  [/\b(?:bumble|hinge|badoo|okcupid|grindr|feeld|happn)(?:[\s-]*(?:like|style|esque|type|clone|inspired))?\b/g, "dating app"],
  [/\bswipe[\s-]?(?:left|right)(?:[\s-]+(?:or|and|\/)[\s-]*(?:left|right))?\b/g, "swipe"], [/\bit['’]?s a match\b/g, "mutual match"],
  [/\bpop[\s-]ups?\b/g, "popup"], [/\blight[\s-]?box(?:es)?\b/g, "lightbox"],
];
export const SYN_GROUPS = [
  ["payroll", "payslip", "salary", "salaries", "wage", "wages", "paystub", "paycheck"],
  ["timesheet", "timecard"],
  ["invoice", "bill", "receipt"],
  ["modal", "dialog", "popup", "lightbox", "overlay"],
  ["navbar", "navigation", "nav", "header", "menubar"],
  ["settings", "preferences"],
  ["delete", "remove"],
  ["loyalty", "rewards"],
];
export const SYN_W = 0.8;
const IRREG = { children: "child", people: "person", men: "man", women: "woman", analyses: "analysis", statuses: "status", buses: "bus", menus: "menu" };

export function stem(w) {
  if (IRREG[w]) return IRREG[w];
  if (w.length <= 3 || /\d/.test(w)) return w;
  let s = w, cut = false;
  if (s.endsWith("ies") && s.length > 4) s = s.slice(0, -3) + "y";
  else if (s.endsWith("sses")) s = s.slice(0, -2);
  else if (/(ch|sh|x|zz)es$/.test(s)) s = s.slice(0, -2);
  else if (s.endsWith("s") && !/(ss|us|is|os)$/.test(s)) s = s.slice(0, -1);
  if (s.endsWith("ing") && s.length - 3 >= 4) { s = s.slice(0, -3); cut = true; }
  else if (s.endsWith("ed") && s.length - 2 >= 4) { s = s.slice(0, -2); cut = true; }
  if (cut && /([b-df-hj-np-tv-z])\1$/.test(s) && !/(ll|ss|zz)$/.test(s)) s = s.slice(0, -1); // running → run, but keep "scroll"
  if (s.length > 3 && s.endsWith("e")) s = s.slice(0, -1); // price/pricing → pric, share/shared → shar
  return s;
}
const norm = (s) => { let t = String(s || "").toLowerCase().replace(/[’']/g, "'"); for (const [re, to] of PHRASES) t = t.replace(re, to); return t; };
export function words(s) { return norm(s).split(/[^\p{L}\p{N}]+/u).filter((w) => w.length > 1 || /\d/.test(w)); }
export function tokens(s, keepStop) { return words(s).filter((w) => keepStop || !STOP.has(w)).map(stem); }
const SYN = new Map(); // stem → [alternate stems]
for (const g of SYN_GROUPS) { const st = [...new Set(g.map(stem))]; for (const t of st) SYN.set(t, [...new Set([...(SYN.get(t) || []), ...st.filter((x) => x !== t)])]); }
export function synPhrases(q) { let t = String(q || "").toLowerCase(); for (const [re, to] of SYN_PHRASES) t = t.replace(re, to); return t; }
export function synonymsOf(w) { return SYN.get(stem(String(w || "").toLowerCase())) || []; }

// Character trigrams, for typo tolerance ("dashbord", "kanbam") and free-text pattern names.
const grams = (w) => { const s = ` ${w} `, g = new Set(); for (let i = 0; i < s.length - 2; i++) g.add(s.slice(i, i + 3)); return g; };
const jacc = (a, b) => { let n = 0; for (const x of a) if (b.has(x)) n++; return n / (a.size + b.size - n || 1); };

const W = { pattern: 3, title: 2, tags: 1.5, industry: 1.2, desc: 0.6 };

// Build once per row set (the Worker caches it per isolate).
export function buildIndex(rows, patternOrder, elMap) {
  const order = new Map((patternOrder || []).map((p, i) => [p, i]));
  const pat = {}; // pattern → { tok:Set, aliases:[[tokens]], label }
  const patOf = (p) => pat[p] || (pat[p] = { tok: new Set(), all: new Set(), aliases: [] });
  for (const p of new Set([...(patternOrder || []), ...Object.keys(PATTERN_ALIASES)])) {
    const P = patOf(p);
    for (const a of [p.replace(/-/g, " "), ...(PATTERN_ALIASES[p] || [])]) {
      const t = tokens(a); if (!t.length) continue;
      P.aliases.push(t);
      if (t.length === 1) P.tok.add(t[0]); // multi-word aliases only count when fully matched (aliasBonus): "first run" must not claim "running"
      t.forEach((x) => P.all.add(x));
    }
  }
  const docs = rows.map((r) => {
    const tags = parseArr(r.tags);
    const title = String(r.title || "").replace(/\s+—\s+[^—]*$/, ""); // drop " — web, playful (Fernway)"
    const d = String(r.description || "");
    const shows = (d.match(/Shows ([^]*?)\.\s+[A-Z][\w-]* style:/) || d.match(/Shows ([^]*?)\.\s/) || [])[1] || "";
    const first = d.split(/\.\s/)[0] || "";
    const variant = (tags.find((t) => t.startsWith("variant:")) || "").slice(8);
    // Element inventory: the row's own tags + the HTML-derived inventory (src/ui_elements.json, built by ui-screens/elements.js).
    const inv = (elMap && elMap[`${r.category}|${variant}|${r.country}`]) || null;
    const elTags = [...new Set([...tags.filter((t) => !/^(flow|variant):/.test(t) && t !== r.country && t !== r.category && t !== r.industry), ...((inv && inv.elements) || [])])];
    const f = { pattern: patOf(r.category || "").tok, title: new Set(tokens(title + " " + variant.replace(/-/g, " "))),
      tags: new Set(elTags.flatMap((t) => tokens(t.replace(/-/g, " ")))),
      industry: new Set(tokens(`${r.industry || ""} ${r.company || ""}`)), desc: new Set(tokens(first + " " + shows)) };
    const steps = tags.filter((t) => /^flow:[a-z0-9-]+:\d+$/.test(t)).map((t) => +t.split(":")[2]);
    patOf(r.category || "").n = (patOf(r.category || "").n || 0) + 1;
    return { r, f, variant, els: new Set(elTags), layout: inv ? inv.layout : null, density: inv ? inv.density : null, step: steps.length ? Math.min(...steps) : 0, pattern: r.category, ord: order.has(r.category) ? order.get(r.category) : 999 };
  });
  const df = new Map();
  for (const d of docs) { const seen = new Set(patOf(d.pattern || "").all); for (const k in d.f) for (const t of d.f[k]) seen.add(t); const w = d.els.has("website-template") ? 0.1 : 1; /* a full page names every section, so page templates must not wear down words like "hero" */ for (const t of seen) df.set(t, (df.get(t) || 0) + w); }
  const vocab = [...df.keys()].filter((t) => t.length >= 4 && !/\d/.test(t)).map((t) => [t, grams(t)]);
  return { docs, df, N: Math.max(1, docs.length), pat, vocab, order };
}
function parseArr(s) { if (Array.isArray(s)) return s; try { const v = JSON.parse(s || "[]"); return Array.isArray(v) ? v : []; } catch (_) { return []; } }

// Parse a free-text query into weighted terms + soft preferences.
export function parseQuery(q, idx) {
  const raw = words(synPhrases(q));
  const prefs = { style: null, platform: null };
  for (const w of raw) { if (!prefs.style && STYLE_WORDS[w] && UI_STYLE_LIST.includes(STYLE_WORDS[w]) && /^(minimal|minimalist|editorial|brutalist|brutal|luxury|playful|corporate|retro|monochrome|vintage|magazine)$/.test(w)) prefs.style = STYLE_WORDS[w];
    if (!prefs.platform && PLATFORM_WORDS[w]) prefs.platform = PLATFORM_WORDS[w]; }
  const styleNames = new Set(["minimal", "minimalist", "editorial", "brutalist", "brutal", "luxury", "playful", "corporate", "retro", "monochrome", "vintage", "magazine", "mono", "grayscale", "greyscale"]);
  const seen = new Set(), terms = [];
  const maxIdf = Math.log(1 + idx.N);
  for (const w of raw) {
    if (STOP.has(w) || styleNames.has(w)) continue;
    let t = stem(w), fuzzy = false;
    if (seen.has(t)) continue;
    const alts = (SYN.get(t) || []).filter((a) => idx.df.has(a) && !seen.has(a));
    if (!idx.df.has(t) && !alts.length && t.length >= 4 && !/\d/.test(t)) { // typo tolerance: nearest vocabulary word by trigrams
      const g = grams(t); let best = null, bs = 0;
      for (const [v, vg] of idx.vocab) { const s = jacc(g, vg); if (s > bs) { bs = s; best = v; } }
      if (best && bs >= 0.5 && !seen.has(best)) { t = best; fuzzy = true; }
    }
    seen.add(t);
    // with alternates, rarity is that of the word itself when the library has it, else of its most common alternate
    const d = idx.df.get(t) || (alts.length ? Math.max(...alts.map((a) => idx.df.get(a))) : 0);
    terms.push({ w, t, df: d, idf: d ? Math.log(1 + idx.N / d) : maxIdf, fuzzy, alts });
  }
  return { terms, prefs, raw };
}

// Score every row; return them ranked with match info. opts: { platform, style, pattern } hard filters (already resolved).
export function rankRows(q, idx, opts = {}) {
  const pq = parseQuery(q, idx);
  const terms = pq.terms, known = terms.filter((x) => x.df);
  const prefPlatform = opts.platform || pq.prefs.platform, prefStyle = opts.style || pq.prefs.style;
  const total = terms.reduce((s, x) => s + x.idf, 0) || 1;
  // Alias bonus per pattern: fully matched multi-word aliases (strong evidence of intent).
  const tset = new Set(known.map((x) => x.t)), idfOf = new Map(known.map((x) => [x.t, x.idf * (x.fuzzy ? 0.7 : 1)]));
  for (const x of known) for (const a of x.alts || []) if (!tset.has(a)) { tset.add(a); idfOf.set(a, x.idf * SYN_W); } // "delete dialog" completes the alias "delete modal"
  const aliasBonus = {};
  for (const [p, P] of Object.entries(idx.pat)) {
    let b = 0;
    for (const a of P.aliases) if (a.length > 1 && a.every((t) => tset.has(t))) b = Math.max(b, a.reduce((s, t) => s + idfOf.get(t), 0) * 2.5);
    if (b) aliasBonus[p] = b;
  }
  const out = [];
  for (const d of idx.docs) {
    const r = d.r;
    if (opts.elements && opts.elements.length && !opts.elements.every((e) => elHas(d, e))) continue;
    if (opts.platform && r.country !== opts.platform) continue;
    if (opts.style && r.style !== opts.style) continue;
    if (opts.pattern && r.category !== opts.pattern) continue;
    let score = 0, matched = 0, hitW = 0, strong = !!aliasBonus[d.pattern]; const hit = [];
    for (const x of known) {
      let fw = 0;
      for (const k in W) if (W[k] > fw && d.f[k].has(x.t)) fw = W[k];
      if (!fw && x.alts && x.alts.length) for (const k in W) if (W[k] * SYN_W > fw && x.alts.some((a) => d.f[k].has(a))) fw = W[k] * SYN_W;
      if (fw) { const iw = idfOf.get(x.t); score += iw * fw; matched += x.idf; hitW += x.idf * Math.min(1, fw / W.tags); hit.push(x.w); if (fw >= W.tags) strong = true; }
    }
    score += aliasBonus[d.pattern] || 0;
    // Soft preferences: a small nudge (never enough to beat a better text match) + a deterministic order.
    const pref = (prefPlatform && r.country === prefPlatform ? 0.3 : 0) + (prefStyle && r.style === prefStyle ? 0.2 : 0);
    score *= 0.6 + 0.4 * (hitW / total); // rows covering more of the query win close calls
    out.push({ d, r, score: score + pref, text: score, cover: matched / total, hit, strong });
  }
  const si = (s) => { const i = UI_STYLE_LIST.indexOf(s); return i < 0 ? 99 : i; };
  out.sort((a, b) => b.score - a.score || a.d.ord - b.d.ord || a.d.step - b.d.step || String(a.d.variant).localeCompare(String(b.d.variant))
    || (a.r.country === b.r.country ? 0 : a.r.country === "web" ? -1 : 1) || si(a.r.style) - si(b.r.style) || String(a.r.id).localeCompare(String(b.r.id)));
  const best = out[0];
  const unmatched = terms.filter((x) => !(best && best.hit.includes(x.w))).map((x) => x.w);
  let tier = "none";
  if (!terms.length) tier = "all";
  // Honesty: a result needs a hit on the pattern, title or elements; description-only hits count only when they cover most of the query.
  else if (best && best.text > 0) tier = best.strong ? (best.cover >= 0.5 ? "good" : "partial") : best.cover >= 0.6 ? "partial" : "none";
  return { ranked: out, terms, prefs: pq.prefs, tier, unmatched, suggestions: tier === "none" || tier === "partial" ? suggest(pq, idx, out) : [] };
}

// Closest patterns for an honest "no match" answer: patterns the matched words point at, then hint words, then trigram similarity.
function suggest(pq, idx, ranked) {
  const s = new Map();
  const add = (p, v) => { if (idx.pat[p] && idx.pat[p].n) s.set(p, (s.get(p) || 0) + v); };
  for (const x of ranked.slice(0, 40)) if (x.text > 0) add(x.r.category, x.text / 10);
  for (const w of pq.raw) { const h = HINTS[w] || HINTS[w.replace(/s$/, "")] || HINTS[stem(w)]; if (h) h.forEach((p, i) => add(p, 3 - i)); }
  for (const x of pq.terms) {
    if (x.t.length < 5) continue;
    const g = grams(x.t);
    for (const [p, P] of Object.entries(idx.pat)) { let m = 0; for (const t of P.all) m = Math.max(m, jacc(g, grams(t))); if (m >= 0.45) add(p, m); }
  }
  return [...s.entries()].sort((a, b) => b[1] - a[1] || (idx.order.get(a[0]) ?? 999) - (idx.order.get(b[0]) ?? 999)).map(([p]) => p).slice(0, 5);
}

// Free-text pattern / flow names → canonical id ("doctor directory", "Doctors", "kanban" → kanban-board). Returns { id, how } or null.
export function resolveName(input, ids, aliases) {
  const raw = String(input || "").trim().toLowerCase();
  if (!raw) return null;
  const slug = raw.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  if (ids.includes(slug)) return { id: slug, how: "exact" };
  const qt = tokens(raw.replace(/-/g, " "), true);
  if (!qt.length) return null;
  const key = qt.join(" ");
  // whole-name or alias equality
  for (const id of ids) { const names = [id.replace(/-/g, " "), ...((aliases && aliases[id]) || [])]; if (names.some((n) => tokens(n, true).join(" ") === key)) return { id, how: "alias" }; }
  // best token overlap, then trigram similarity of the whole string
  let best = null, bs = 0;
  const g = grams(slug.replace(/-/g, " "));
  for (const id of ids) {
    const names = [id.replace(/-/g, " "), ...((aliases && aliases[id]) || [])];
    for (const n of names) {
      const nt = tokens(n, true); const ov = qt.filter((t) => nt.includes(t)).length / Math.max(qt.length, nt.length);
      const sc = Math.max(ov, jacc(g, grams(n)) * 0.9);
      if (sc > bs) { bs = sc; best = id; }
    }
  }
  return bs >= 0.5 ? { id: best, how: "fuzzy" } : null;
}

// Free-text style / platform → canonical value (null if unknown). "minimalist" → minimal, "premium" → luxury, "iPhone" → mobile.
export function resolveStyle(v) {
  const w = String(v || "").trim().toLowerCase(); if (!w) return null;
  if (UI_STYLE_LIST.includes(w)) return w;
  if (STYLE_WORDS[w]) return STYLE_WORDS[w];
  const r = resolveName(w, UI_STYLE_LIST, null); return r ? r.id : null;
}
export function resolvePlatform(v) {
  const w = String(v || "").trim().toLowerCase(); if (!w) return null;
  if (PLATFORM_WORDS[w]) return PLATFORM_WORDS[w];
  if (/^(phone|app|native|mobile[\s-]?app|ios[\s-]?app)$/.test(w)) return "mobile";
  if (/^(webapp|web[\s-]?app|saas|laptop)$/.test(w)) return "web";
  return null;
}

// ---- Elements filter -------------------------------------------------------------------------
// Words people use for a component → canonical element names in the inventory (any of them satisfies the element).
export const ELEMENT_ALIASES = {
  "checkbox": ["checkbox", "checkboxes", "row selection", "row checkboxes", "select rows", "tick box"],
  "toggle": ["toggle", "toggles", "toggle switch", "switch", "switches"],
  "progress-ring": ["progress ring", "progress circle", "circular progress", "ring", "radial progress", "donut progress", "progress-rings"],
  "progress": ["progress bar", "progress", "progress-bar", "meter", "usage meter", "storage-meter", "usage-meter", "capacity-bar"],
  "avatar-stack": ["avatar stack", "avatars", "team avatars", "facepile", "avatar group", "collaborators"],
  "sparkline": ["sparkline", "sparklines", "mini chart", "trend line"],
  "chart": ["chart", "charts", "graph", "line-chart", "bar-chart", "donut-chart", "area chart", "heatmap"],
  "table": ["table", "data table", "grid", "rows"],
  "badge": ["badge", "badges", "status chip", "status chips", "status badge", "status-pill", "pill", "severity-badge", "tag"],
  "chips": ["chips", "filter chips", "filter-chips", "tags", "chip"],
  "toast": ["toast", "snackbar", "toast notification"],
  "modal": ["modal", "dialog", "popup", "overlay"],
  "drawer": ["drawer", "side panel", "side-panel", "slide over", "details-panel", "detail-panel", "inspector-panel", "properties-panel"],
  "bottom-sheet": ["bottom sheet", "sheet"],
  "date-picker": ["date picker", "date range", "date-range", "calendar picker", "day-picker", "mini-month"],
  "stepper": ["stepper", "steps", "progress-steps", "status-steps", "wizard steps", "step indicator"],
  "tabs": ["tabs", "segmented control", "segmented-control", "tab"],
  "tab-bar": ["tab bar", "bottom nav", "bottom navigation", "tabbar"],
  "sidebar-nav": ["sidebar", "side nav", "sidebar navigation", "left nav"],
  "search-bar": ["search bar", "search", "search field", "search input"],
  "pagination": ["pagination", "pager"],
  "breadcrumbs": ["breadcrumbs", "breadcrumb"],
  "kpi-tiles": ["kpi tiles", "stat tiles", "stat cards", "kpi cards", "metrics cards", "summary cards", "kpi", "stats"],
  "empty-illustration": ["empty state", "illustration"],
  "timeline": ["timeline", "activity feed", "activity-feed", "history"],
  "checklist": ["checklist", "onboarding checklist", "todo list"],
  "dropdown": ["dropdown", "select", "menu", "combobox"],
  "form": ["form", "inputs", "input", "fields", "text field"],
  "avatar": ["avatar", "profile photo"],
  "star-rating": ["rating", "stars", "star rating", "reviews"],
  "accordion": ["accordion", "collapsible", "faq"],
  "code-block": ["code block", "code", "code-snippet", "snippet"],
  "map": ["map", "map-pins", "pins"],
  "chat-bubbles": ["chat bubbles", "messages", "chat-messages", "message bubbles"],
  "upload-dropzone": ["dropzone", "file upload", "upload", "drag and drop"],
  "plan-cards": ["plan cards", "pricing cards", "plans"],
  "bulk-actions": ["bulk actions", "bulk action bar", "batch actions"],
  "video-tiles": ["video tiles", "participants grid"],
};
const elKey = (s) => tokens(String(s).replace(/-/g, " "), true).join(" ");
// Resolve one requested element to the set of inventory names that satisfy it (null if unknown).
export function resolveElement(input, idx) {
  const k = elKey(input); if (!k) return null;
  const vocab = idx.elVocab || (idx.elVocab = (() => { const v = new Set(); for (const d of idx.docs) for (const e of d.els) v.add(e); return v; })());
  const out = new Set();
  for (const [canon, al] of Object.entries(ELEMENT_ALIASES)) if (elKey(canon) === k || al.some((a) => elKey(a) === k)) { out.add(canon); al.forEach((a) => vocab.has(a) && out.add(a)); }
  for (const v of vocab) if (elKey(v) === k) out.add(v);
  if (!out.size) { const r = resolveName(input, [...vocab], null); if (r) out.add(r.id); }
  return out.size ? { input: String(input), names: [...out] } : null;
}
export function elHas(d, e) { return e.names.some((n) => d.els.has(n)); }
