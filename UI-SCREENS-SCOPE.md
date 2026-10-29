# Gap 1 scope: app & website UI screens (Mobbin-inspired) — draft 30-Oct-2026

## Why
- Real MCP searches (24 Aug–29 Oct): ~11 of 225 searches asked for UI directly — "billing settings dashboard data table SaaS",
  "AI meeting notes chat assistant product", "app interface editor toolbar", "dark editorial SaaS landing page with oversized
  serif type", "monochrome brutalist website UI", "minimal image viewer toolbar", "dashboard", "user interface".
- They come from Cursor / Claude Code / claude.ai users who are building apps — the heaviest repeat users. Their other calls
  (generate_design_md, generate_website_color_palette) are UI-adjacent too.
- Today these searches return brand guides, candy wrappers and elevator buttons. Library has ~68 UI-ish items total.

## What Mobbin does (structure to learn from, not content to copy)
- Browse by platform (iOS / Android / Web), by app, by category (finance, productivity, AI…).
- Screen patterns (login, onboarding, pricing, dashboard, settings, checkout, empty state, search, profile…).
- UI elements (nav bar, tab bar, modal, table, toast, date picker…).
- Flows: ordered screen sequences (sign-up, checkout, cancel subscription).
- Paid; screenshots of real commercial apps.

## MGD angle (what makes ours worth using)
Free, and built for coding assistants: each screen comes with **copyable code + design tokens**, not just a picture.
An agent asking "billing settings with a data table, editorial serif" gets an image to look at AND HTML/Tailwind + a DESIGN.md
it can build from. Mobbin can't hand out code for other companies' apps.

## Sourcing options (the key decision)
| Option | Realism | Rights risk | Effort | Notes |
|---|---|---|---|---|
| A. MGD-original reference screens (generated HTML → screenshots) | medium-high if well designed | none (ours) | medium | unlimited, consistent taxonomy, ships code + tokens; reuses design-md-core.js |
| B. Open-source app UIs (screens of MIT/Apache apps, e.g. self-hosted tools, OSS dashboards) | high | low-medium (code licence ≠ screenshot/trademark; use own captures, plain-text credit) | medium | real products; limited variety of categories |
| C. CC-BY UI kits (Figma Community etc.) | medium | low if licence checked per file | high (Figma API, per-file licence) | attribution required |
| D. Screenshots of real commercial apps/sites (Mobbin's model) | highest | HIGH (copyright/ToS; MGD is ad-funded) | low | not recommended |

Recommendation: **A first, B second**, skip D.

## MVP
- New collection `ui` (D1 items) with fields: platform (web/mobile), pattern, elements[], category, style, flow_id + step, code (HTML), tokens (DESIGN.md).
- ~25 patterns × ~8 styles ≈ 200 screens. Patterns seeded from the real queries: dashboard + data table, billing/settings,
  pricing, landing hero (editorial serif / brutalist / minimal), login/sign-up, onboarding, empty state, chat/AI assistant,
  editor toolbar, image viewer, invoice, notifications, search results, profile, checkout, 404…
- Styles = the gallery's existing themes (minimal, editorial, brutalist, luxury, playful, corporate, retro, monochrome).
- MCP tool `search_ui_screens(query, platform?, pattern?, style?)` → image + page link + code/tokens; `get_ui_flow(flow)`.
- Gallery page /inspiration/ui with pattern/style filters.

## DECIDED 30-Oct-2026 (Eugene)
- Sourcing: **MGD-original only** (option A). No real-app screenshots.
- Platforms: **web + mobile** from the start.

## Build plan
1. Taxonomy: ~25 patterns × platform (web, mobile) × ~8 styles. Optionally cross-check pattern names against Mobbin's
   (Mobbin MCP is not connected to this Claude Code session yet).
2. Pilot: 6 patterns × 2 platforms × 2 styles = 24 screens → Eugene reviews the quality bar before scaling.
3. Generator: HTML templates + style tokens from design-md-core.js → Playwright screenshots (web 1440×900, mobile 390×844)
   → R2 + D1 (collection 'ui') with code + DESIGN.md attached; vision-enrich for description/tags.
4. Scale to ~400 screens (25 patterns × 2 platforms × 8 styles), plus ~10 multi-step flows (sign-up, checkout, cancel plan).
5. MCP: search_ui_screens + get_ui_flow; gallery page /inspiration/ui with platform/pattern/style filters.

## Open questions for Eugene
1. Use the Mobbin MCP to pull their pattern/category taxonomy (connect it to this Claude Code session: `claude mcp add …`)?

## 30-Oct-2026: Mobbin MCP probe → taxonomy v1 (ui-screens/taxonomy.json)
Mobbin MCP connected and probed (3 calls: screens, flows, sections). What it actually exposes:
- **3 content types**: app screens (platform ios|web), multi-step **flows**, and **website sections** (hero/pricing/footer… — marketing sites kept separate from app screens).
- Screen results carry only id, app_name, platform, image, link — **no pattern/element/category tags**. Flows add a name + "actions" (e.g. "Canceling Subscription", "Giving Feedback").
- Search is natural-language only (no pattern filter). → Their taxonomy can't be pulled in bulk, and doesn't need to be.
- **MGD edge confirmed:** return structured tags (pattern, elements, style, category, flow step) + HTML + DESIGN.md per result.
Taxonomy v1 = 3 types × 2 platforms; 37 screen patterns in 9 groups, 14 website sections, 26 elements, 10 flows, 10 categories, 8 styles.
Pilot unchanged (24 screens), but `pricing` is a **section**, not an app screen.

## 30-Oct-2026: PILOT BUILT (24 screens) — awaiting Eugene's quality review
- `ui-screens/gen.js` (Node, no deps): loads color-roles-core.js + design-md-core.js in a vm sandbox with a seeded Math.random
  (same product+style → same palette on web and mobile), so screens, website tools and MCP share one design engine.
  Writes out/<pattern>-<platform>-<style>/{index.html, DESIGN.md, meta.json} + out/manifest.json.
- `ui-screens/shoot.sh`: screenshots at 2x via Playwright's cached chrome-headless-shell (no playwright module needed);
  web 1440×900, mobile 390×844.
- `ui-screens/review.html`: local contact page. Styles: minimal (Inter, r8, cool) and editorial (Instrument Serif + Inter, r2, warm).
- Fictional products per pattern (Tallyfold, Quillstack, Harbourline, Lumen Desk, Fernway, Patchbay); all copy original.
- Next after review: more styles (6 left) + patterns, then R2/D1 'ui' collection, MCP search_ui_screens, /inspiration/ui.

## 30-Oct-2026: pilot APPROVED by Eugene ("good base") → scaled to 8 styles = 96 screens
- Editorial fix: serif only for titles/headlines; metrics/prices/plan names in body sans `.num` with tabular-nums (rule also written into editorial+luxury DESIGN.md "Do").
- Added styles brutalist, luxury, playful, corporate, retro, monochrome (per-style `css` overrides in STYLES; monochrome forces a grey role ramp).
- Fixed: monochrome featured pricing card had black-on-black primary button (`.feat` flip).
- `node gen.js --all && ./shoot.sh` rebuilds everything; review.html grouped by style.

## 30-Oct-2026: LIVE — 96 screens at /inspiration/ui (Worker e5cfc06c)
- src/ui_screens.js: gallery /ui (client filter chips, ?platform/pattern/style), item pages /ui/<pattern>-<platform>-<style>-<id>,
  raw code /ui/raw/<id>.html|.md (noindex, CORS *), /ui/sitemap.xml; MCP search_ui_screens + get_ui_screen_code.
- Items table, collection='ui', NO migration: category=pattern, country=platform, industry=product category, company=product, style, palette=light roles.
  R2: ui/<id>.webp + ui/<id>/index.html + ui/<id>/DESIGN.md. addItem now accepts description/tags/code_html/design_md + webp.
- Ingest: `python3 ui-screens/ingest.py` (dedup by source_url …/ui#<slug>); prod deploy must be run by Eugene (classifier blocks wrangler deploy).
- TODO: list the 2 tools on /design-mcp-server/ (#107901); add /ui/sitemap.xml to sitemap index; more patterns + flows.
