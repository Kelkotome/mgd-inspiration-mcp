// Best-for phrase table for website-template pages (spec block, 7-Nov-2026). Fixed, hand-written, reviewed as a whole:
// line = "Best for: {audience} {who} {style trait}. Not ideal for: {noun} {who} {opposite}."
// Describe look and content only: no numbers, no results claims, no superlatives (enforced by tests/ui_spec.test.mjs).
// DRAFT: the user still has to approve every phrase (deploy-bundle-2026-11-07/spec-block-phrases.md) before this goes live.

// style → [trait the template has, opposite need it does not serve]
export const STYLE_PHRASES = {
  minimal: ["a calm, plain look with plenty of space", "a bold, image-led brand look"],
  editorial: ["a magazine-like look led by type", "a compact layout with very little text"],
  brutalist: ["a bold, high-contrast look with hard edges", "a soft, gentle look"],
  luxury: ["a refined, quiet look", "bright colours and a busy, lively feel"],
  playful: ["a friendly, bright look", "a formal, reserved tone"],
  corporate: ["a structured, information-first look", "a loose, expressive look"],
  retro: ["a warm, nostalgic look", "a sleek, present-day look"],
  monochrome: ["a strict black-and-white look", "a colourful brand or colour-coded sections"],
};

// page pattern → [audience, short noun for "Not ideal for", verb form ("that wants" unless set)]
// Audiences follow each template's own DESIGN.md description, made general enough to fit similar businesses.
export const INDUSTRY_PHRASES = {
  "restaurant-website": ["a neighbourhood restaurant", "a restaurant"],
  "agency-website": ["an independent design studio", "a studio"],
  "architecture-website": ["an architecture or interiors practice", "a practice"],
  "wedding-website": ["a couple sharing their wedding plans", "a couple", "who want"],
  "ecommerce-website": ["an online store for home goods", "a store"],
  "coffee-shop-website": ["a café or coffee shop", "a café"],
  "salon-website": ["a hair and beauty salon", "a salon"],
  "real-estate-website": ["a residential real estate agency", "an agency"],
  "construction-website": ["a general contractor", "a contractor"],
  "law-firm-website": ["a family and small-business law firm", "a firm"],
  "dental-website": ["a family or cosmetic dental practice", "a practice"],
  "gym-website": ["a gym with classes and coaching", "a gym"],
  "school-website": ["an independent day school", "a school"],
  "nonprofit-website": ["a community nonprofit", "a nonprofit"],
  "travel-website": ["a small-group tour operator", "an operator"],
  "hotel-website": ["a boutique hotel", "a hotel"],
  "saas-landing-page": ["a software product for engineering teams", "a product"],
  "ai-website": ["an AI product for professional users", "a product"],
  "medical-website": ["a primary care practice", "a practice"],
  "cardiology-website": ["an outpatient cardiology practice", "a practice"],
  "dermatology-website": ["a medical or cosmetic dermatology clinic", "a clinic"],
  "therapist-website": ["a private counselling or therapy practice", "a practice"],
  "physical-therapy-website": ["a physical therapy or sports rehab clinic", "a clinic"],
  "veterinary-website": ["a neighbourhood veterinary practice", "a practice"],
  "financial-advisor-website": ["a fee-only financial planning firm", "a firm"],
  "cleaning-service-website": ["a home and office cleaning service", "a service"],
  "hvac-website": ["a local heating and cooling contractor", "a contractor"],
  "cybersecurity-website": ["a security product for engineering teams", "a product"],
  "crm-landing-page": ["a CRM for small business teams", "a product"],
  "coaching-website": ["a solo leadership or career coach", "a coach"],
  "pest-control-website": ["a local pest control company", "a company"],
  "solar-website": ["a residential solar installer", "an installer"],
  "ai-agent-website": ["an AI agent product for support teams", "a product"],
  "preschool-website": ["a play-based preschool", "a preschool"],
  "apartment-website": ["a rental apartment community", "a community"],
  "pediatrics-website": ["a family paediatric practice", "a practice"],
  "orthodontics-website": ["an orthodontic practice", "a practice"],
  "fertility-website": ["an outpatient fertility clinic", "a clinic"],
  "hospital-website": ["a community hospital", "a hospital"],
  "mental-health-website": ["an outpatient mental health clinic", "a clinic"],
  "optometry-website": ["an independent optometry practice", "a practice"],
  "pharmacy-website": ["an independent neighbourhood pharmacy", "a pharmacy"],
  "real-estate-agent-website": ["an independent real estate agent", "an agent"],
  "property-management-website": ["a residential property management company", "a company"],
  "luxury-real-estate-website": ["a boutique agency for high-value homes", "an agency"],
  "commercial-real-estate-website": ["a commercial property agency", "an agency"],
  "vacation-rental-website": ["a vacation rental host or agency", "a host"],
  "home-builder-website": ["a new-home builder", "a builder"],
  "bakery-website": ["a neighbourhood bakery", "a bakery"],
  "pizzeria-website": ["a pizzeria", "a pizzeria"],
  "bar-website": ["a neighbourhood bar", "a bar"],
  "catering-website": ["a catering company", "a caterer"],
  "food-truck-website": ["a food truck", "a food truck"],
  "fine-dining-website": ["a fine-dining restaurant", "a restaurant"],
};

// Hand-written exceptions where the default audience reads oddly with the style: "pattern|style" → [best, notIdeal]
export const OVERRIDES = {
  "law-firm-website|playful": ["a law firm with a younger or small-business client base that wants a friendly, bright look", "a firm that wants a formal, reserved tone"],
  "financial-advisor-website|playful": ["a planning firm with a younger client base that wants a friendly, bright look", "a firm that wants a formal, reserved tone"],
  "hospital-website|playful": ["a community hospital with a children's or family focus that wants a friendly, bright look", "a hospital that wants a formal, reserved tone"],
  "fine-dining-website|playful": ["a fine-dining restaurant with a relaxed, family-friendly side that wants a friendly, bright look", "a restaurant that wants a formal, reserved tone"],
};

// Banned in any phrase (the "Best for" label itself is fixed copy, not a phrase).
export const BANNED = /\d|%|\b(boost\w*|increas\w*|convert\w*|conversions?|rank\w*|seo|traffic|revenue|roi|leads?|grow\w*|more|less|better|best|most|least|top|leading|ultimate|perfect|proven|guarantee\w*|results?|award\w*|world-class|#1|number one|finest|greatest|fastest|easiest|cheapest|one|two|three|four|five|six|seven|eight|nine|ten|hundred|thousand|million)\b/i;
