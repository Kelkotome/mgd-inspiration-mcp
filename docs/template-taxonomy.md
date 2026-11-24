# Template taxonomy and URLs

Applies to website templates under `/inspiration/ui/`. Healthcare is the pilot (7-Nov-2026). Code: `src/ui_tree.js` (tree and paths), `src/ui_templates.js` (pages, downloads, MCP answer), `src/tpl_catalog.json` (generated, never edited by hand).

## Four categories

| Category | Values | Where it shows |
|---|---|---|
| Platform | HTML, WordPress | Path: `/ui/wordpress-themes/...`. HTML is the default and has no path segment of its own |
| Type | one-page, website, landing page | Filter. A chip appears only when a page has more than one value |
| Industry | Healthcare, Real estate, Restaurant, Weddings and events, Portfolios and creative studios, Beauty, fitness and wellness, Construction and home services, Legal and professional services, Education (r7, staged) | Path |
| Sub-niche | Cardiology, Dental... | Path, under its industry |

Web and mobile are the **Device** filter, renamed so that Platform is free. The database column stays `country`, and `?platform=web|mobile` still works.

## URLs

| Page | Path under `/inspiration/ui/` |
|---|---|
| Industry hub | `healthcare-website-templates` |
| Sub-niche | `healthcare-website-templates/cardiology-website-template` |
| Platform hub | `wordpress-themes` |
| Platform + industry | `wordpress-themes/healthcare` |
| Platform + sub-niche | `wordpress-themes/healthcare/cardiology` |
| Platform item | `wordpress-themes/healthcare/cardiology/mgd-cardiology-atlas` |
| Raw Markdown | any of the above plus `.md` |
| Theme download | `download/wordpress/mgd-cardiology-atlas.zip` |
| Playground blueprint | `download/wordpress/mgd-cardiology-atlas.blueprint.json` |

HTML item URLs do not change: `/ui/<slug>-<12 hex>`. Theme items are nested because they have their own zip, demo and install steps. Style, type, device and sparse combinations stay filters on these pages and canonicalise to the page they filter. They never become paths.

Non-healthcare patterns stay flat. Old flat URLs for a moved pattern 301 to the nested path in one hop, including with a trailing slash and from `/ui?pattern=`.

## The page test

A sub-niche page exists only with at least `MIN_DESIGNS` (6) distinct designs with real code and copy written for that niche. A WordPress page needs 6 distinct themes that passed the install test. Search volume sets build order only.

**Distinct** means a different layout. Palette and font swaps of one layout are style variations of one design, so they do not count. Web and mobile of one page are not two designs. `tests/hc_distinct.py` decides it: bodies must differ, tag tree similarity under 0.90, layout overlap under 0.60. Re-skins of one design score 0.640 to 0.936 on layout, and the script stops if a re-skin control falls under the threshold.

The gate is in the data: `resolveTree` and `nestedPatternPath` only see niches that pass, so a niche below 6 stays on its flat URL and gets no page.

## Healthcare tree

Healthcare is the industry parent. Sub-niches sit flat under it, so `medical` is general practice, not a parent of the others.

| Sub-niche | id | Pattern | HTML segment | WordPress segment |
|---|---|---|---|---|
| Medical practice | medical | medical-website | medical-website-template | medical |
| Hospital | hospital | hospital-website | hospital-website-template | hospital |
| Cardiology | cardiology | cardiology-website | cardiology-website-template | cardiology |
| Dermatology | dermatology | dermatology-website | dermatology-website-template | dermatology |
| Pediatrics | pediatrics | pediatrics-website | pediatrics-website-template | pediatrics |
| Fertility clinic | fertility | fertility-website | fertility-website-template | fertility |
| Dental | dental | dental-website | dental-website-template | dental |
| Orthodontics | orthodontics | orthodontics-website | orthodontics-website-template | orthodontics |
| Therapist | therapist | therapist-website | therapist-website-template | therapist |
| Mental health clinic | mental-health | mental-health-website | mental-health-website-template | mental-health |
| Physical therapy | physical-therapy | physical-therapy-website | physical-therapy-website-template | physical-therapy |
| Optometry | optometry | optometry-website | optometry-website-template | optometry |
| Pharmacy | pharmacy | pharmacy-website | pharmacy-website-template | pharmacy |
| Veterinary | veterinary | veterinary-website | veterinary-website-template | veterinary |

`clinic-home`, `doctor-directory` and `telehealth-visit` are app and portal screens, not page templates. They stay flat, and the hub links to them.

## Real estate tree (7-Nov-2026, second industry)

Hub `real-estate-website-templates`, WordPress segment `real-estate`. Chosen on demand ("real estate website template" 2,900/mo, "real estate wordpress theme" 1,600/mo, landing page 260, HTML 170; runner-up restaurant) and fit (two hand-built n12/n13 homepages already live: Harrow & Vale and Cinderyard Residences).

| Sub-niche | id | Pattern | HTML segment | WordPress segment | Layouts |
|---|---|---|---|---|---|
| Real estate agency | real-estate | real-estate-website | real-estate-agency-website-template | real-estate-agency | signature (HTML only), listing, showcase, atlas, ledger, band, folio |
| Real estate agent | real-estate-agent | real-estate-agent-website | real-estate-agent-website-template | real-estate-agent | listing, showcase, folio, bento, concierge, atlas |
| Apartment community | apartment | apartment-website | apartment-website-template | apartment | signature, listing, showcase, folio, bento, concierge |
| Property management | property-management | property-management-website | property-management-website-template | property-management | listing, showcase, ledger, concierge, band, atlas |
| Luxury real estate | luxury-real-estate | luxury-real-estate-website | luxury-real-estate-website-template | luxury | listing, showcase, folio, concierge, ledger, band |
| Commercial real estate | commercial-real-estate | commercial-real-estate-website | commercial-real-estate-website-template | commercial | listing, showcase, ledger, atlas, folio, bento |
| Vacation rental | vacation-rental | vacation-rental-website | vacation-rental-website-template | vacation-rental | listing, showcase, bento, folio, band, concierge |
| Home builder | home-builder | home-builder-website | home-builder-website-template | home-builder | listing, showcase, atlas, band, bento, ledger |

**Property layouts.** `listing` (search panel, area chips, listing cards beside a sticky map with numbered pins) and `showcase` (full-width drawing with an intro card, floor plan with room sizes, listing mosaic, dark close) exist only for content with `listings` and `feature` (schema in `ui-screens/hc/README.md`). Each real estate niche has both, so 2 of its 6 layouts are not shared with healthcare. The other 4 are shared across industries, as before.

**Signature without a theme.** The hand-built Harrow & Vale homepage has invented client notes, sales counts and no fictional notice, so it is shown as an HTML design but is not exported as a theme. The agency page has 7 HTML designs and 6 themes.

**Words.** No page uses "Realtor" (a trademark); search aliases still map "realtor" to the agent niche. Copy follows fair-housing wording (homes and services, never ideal residents), checked by `tests/re_lint.py`.

## Restaurant tree (7-Nov-2026, third industry)

Hub `restaurant-website-templates`, WordPress segment `restaurant`. Chosen as the runner-up to real estate: "restaurant website template" 3,600/mo, "restaurant wordpress theme" 880/mo (Keyword Planner, worldwide). Sub-niche volumes (template / WordPress theme): cafe 590 + coffee shop 320 / 90 + 110, bakery 390 / 210, catering 260 / 70, pizza 210 / 70, bar 110 / 30, food truck 50 / 10, fine dining 0 (kept for fit: it is the clearest reservations-led niche). Two hand-built n12 homepages were already live: Olive & Ember (restaurant) and Kiln & Crumb (coffee shop).

| Sub-niche | id | Pattern | HTML segment | WordPress segment | Layouts |
|---|---|---|---|---|---|
| Casual dining | restaurant | restaurant-website | casual-dining-website-template | casual-dining | signature (HTML only), menu, reserve, atlas, folio, bento, band |
| Cafe and coffee shop | coffee-shop | coffee-shop-website | cafe-website-template | cafe | signature (HTML only), menu, reserve, bento, folio, ledger, concierge |
| Bakery | bakery | bakery-website | bakery-website-template | bakery | menu, reserve, bento, folio, atlas, band |
| Pizzeria | pizzeria | pizzeria-website | pizza-website-template | pizzeria | menu, reserve, band, bento, atlas, ledger |
| Bar and pub | bar | bar-website | bar-website-template | bar | menu, reserve, band, folio, concierge, ledger |
| Catering | catering | catering-website | catering-website-template | catering | menu, reserve, atlas, ledger, concierge, folio |
| Food truck | food-truck | food-truck-website | food-truck-website-template | food-truck | menu, reserve, bento, band, atlas, ledger |
| Fine dining | fine-dining | fine-dining-website | fine-dining-website-template | fine-dining | menu, reserve, concierge, folio, ledger, atlas |

**Restaurant layouts.** `menu` (hours strip, a specials board in the hero, sticky menu-section tabs, a three-column priced menu with dotted leaders, a sample dietary key) and `reserve` (a dining-room drawing beside a booking panel with time slots, a course-by-course menu column, a booking-policy table, a band for groups, an hours table in a dark close) exist only for content with `menu`, `booking` and `art` (schema in `ui-screens/hc/README.md`). Every restaurant niche has both, so 2 of its 6 layouts are not shared with the other industries.

**hubFirst.** The bare query "restaurant website template" is answered with the hub, then the casual dining set, because "restaurant" names the whole industry (`hubFirst` on the industry in `src/ui_tree.js`, used by the MCP hint).

**Signatures without a theme.** Olive & Ember and Kiln & Crumb are fixed in this branch (fictional notice, Olive & Ember's guest notes removed, dietary labels marked as samples, two protected food names replaced). They stay HTML designs only (`NO_THEME`) until the fix is approved and shipped.

**Words.** No real chains, platforms, guides or drinks brands, no protected food names, no awards, ratings, reviews, hygiene or certification claims, no health claims, no promotions of excess. Dietary and allergen wording appears only as codes explained by a sample key, or in a sentence that says "sample". Checked by `tests/rs_lint.py`. Theme readmes carry a restaurant "Before you publish" section (`BEFORE` in `ui-screens/wp-export/export.mjs`).

## Weddings and events tree (9-Nov-2026, fifth industry)

Hub `wedding-website-templates`, WordPress segment `wedding`. Chosen on demand after restaurant (construction is on hold): "wedding website template" 5,400/mo, "wedding invitation website" 2,400/mo, "event website template" 140/mo, "florist website template" 90/mo, "wedding planner website template" and "event planner website template" 70/mo each, "wedding wordpress theme" 50/mo, "wedding photographer website template" 50/mo, "conference website template" 40/mo, "wedding venue website template" 20/mo (Keyword Planner, worldwide, 9-Nov-2026). The venue niche is kept for fit: it is the clearest site-plan-led niche. One hand-built n12 homepage was already live: Noor & Callum (wedding website), fixed in this branch and kept HTML only.

| Sub-niche | id | Pattern | HTML segment | WordPress segment | Layouts |
|---|---|---|---|---|---|
| Wedding website (couple) | wedding | wedding-website | wedding-website-template | wedding-website | signature (HTML only), invite, programme, folio, bento, concierge, band |
| Wedding invitation | wedding-invitation | wedding-invitation-website | wedding-invitation-website-template | wedding-invitation | invite, programme, concierge, folio, bento, ledger |
| Wedding planner | wedding-planner | wedding-planner-website | wedding-planner-website-template | wedding-planner | invite, programme, atlas, folio, ledger, concierge |
| Wedding venue | wedding-venue | wedding-venue-website | wedding-venue-website-template | wedding-venue | invite, programme, band, folio, concierge, atlas |
| Wedding photographer | wedding-photographer | wedding-photographer-website | wedding-photographer-website-template | wedding-photographer | invite, programme, folio, bento, band, atlas |
| Florist | florist | florist-website | florist-website-template | florist | invite, programme, bento, band, folio, concierge |
| Event planner | event-planner | event-planner-website | event-planner-website-template | event-planner | programme, invite, atlas, ledger, bento, band |
| Event and conference | conference | conference-website | event-website-template | event | programme, invite, ledger, atlas, band, bento |

**Wedding layouts.** `invite` (a stationery-style hero with names, date and place, an order-of-the-day timeline, drawings, an RSVP or enquiry form with choice chips) and `programme` (a day-by-day schedule in tabs, a numbered site plan with six pins, a reply form) exist only for content with `occasion`, `reply`, `programme` and `art` (schema in `ui-screens/hc/README.md`). Every wedding niche has both. Shared layouts take the `reply` form in place of the contact form, and couples' sites rename fields and footer columns through optional labels; other industries render byte-identical.

**hubFirst.** "wedding website template" is answered with the hub, then the couple's set.

**Words.** No real wedding platforms, registries, magazines, venues, fashion or camera brands, no awards, reviews or ratings, no "stress-free" or "perfect day" promises, no promotions of excess. Licence, legal-ceremony, green, accessibility and CPD wording appears only in a sentence that says "sample" or tells the owner to check or add their own. Checked by `tests/wd_lint.py`. Theme readmes carry the wedding "Before you publish" section (`industries.wedding` in `src/tpl_copy.json`).

## Portfolios and creative studios tree (13-Nov-2026, sixth industry, option A: awaiting the user's decision)

Hub `portfolio-website-templates`, WordPress segment `portfolio`. Demand (Keyword Planner, worldwide, 12-Nov-2026): "portfolio website template" 18,100/mo (the hub, hubFirst), "personal portfolio website template" 2,400, "photography website template" 1,300, "interior design website template" 1,000, "graphic designer portfolio template" 880, "developer portfolio template" 720 (plus "developer portfolio" 590), "agency website template" 720, "architecture website template" 590, "marketing agency website template" 260. Artist and illustrator portfolios (260 / 210 / 70) were dropped. A new industry is the user's call (architecture memory, 7-Nov-2026); this branch builds it as a proposal.

| Sub-niche | id | Pattern | HTML segment | WordPress segment | Layouts |
|---|---|---|---|---|---|
| Personal portfolio | personal-portfolio | personal-portfolio-website | personal-portfolio-website-template | personal | work, index, folio, bento, band, concierge |
| Developer portfolio | developer-portfolio | developer-portfolio-website | developer-portfolio-template | developer | index, work, ledger, bento, atlas, band |
| Graphic designer | graphic-designer | graphic-designer-website | graphic-designer-portfolio-template | graphic-designer | work, index, folio, band, bento, concierge |
| Photography | photography | photography-website | photography-website-template | photography | work, index, folio, concierge, band, atlas |
| Interior design | interior-design | interior-design-website | interior-design-website-template | interior-design | work, index, concierge, folio, atlas, bento |
| Architecture | architecture | architecture-website (n12) | architecture-website-template | architecture | index, work, ledger, folio, atlas, band |
| Creative agency | agency | agency-website (n12) | agency-website-template | agency | work, index, bento, band, atlas, ledger |
| Marketing agency | marketing-agency | marketing-agency-website | marketing-agency-website-template | marketing-agency | work, index, atlas, ledger, bento, concierge |

**n12 homepages.** agency-website (Quarry & Kite) and architecture-website (Atelier Obra) were flat n12 patterns with one hand-built homepage each. Those pages carry invented metrics, ratings and client quotes, so they are not signatures here (not in `SIGNATURE`, not in the catalog): the nested pages show the six new designs, the n12 rows stay live as plain items until a fix is approved. The flat URLs keep their slugs, which equal the nested segments, and 301 once.

**Portfolio layouts.** `work` (brutalist: a type-led hero over a ruled availability strip, project cards with a no-JS discipline filter, one case study told in steps) and `index` (monochrome: the name set large as a masthead, a numbered project index that opens row by row with the same filter, then CV, services and contact in columns) exist only for content with `work`, `caseStudy`, `cv` and `art`. Project pictures are drawn placeholders (`pfArt`), never photographs.

**hubFirst.** No niche is named like the industry, so tplHint answers any "portfolio" template query that names no niche with the hub (`GENERAL.portfolio`). `portfolio-home` and `case-study` stay flat app patterns, listed as the hub's app patterns.

**Words.** No real software, social, portfolio, stock or marketing platforms, camera, furniture or paint brands, design press or award schemes, no awards, shortlists, reviews, testimonials or "trusted by", no invented metrics (followers, ROI, traffic or sales growth), no guarantees or "rank first" promises. Professional status (registered, chartered, licensed, insured, accredited) appears only in a sentence that says "add your own" or "sample". Checked by `tests/pf_lint.py`.

## Beauty, fitness and wellness tree (21-Nov-2026, seventh industry: APPROVED by the user 21-Nov-2026 ~21:40, all 8 niches)

Owner picked the industry 21-Nov-2026 (~3.1K/mo combined). Hub `beauty-fitness-website-templates`, WordPress segment `beauty-fitness`, hubFirst (no niche is named like the industry; "beauty website template" 170, "wellness website template" 210 and "salon/spa/gym wordpress theme" answered by the hub or niche). Demand (Keyword Planner, worldwide, 21-Nov-2026, every term down 11–49 % YoY): hair salon 1,000 (beauty salon 1,000 is the same close variant), gym 880, fitness 390 + personal trainer 170, yoga 320 (+15 % 3 mo), barber shop 260 + barbershop 140, spa 260 + massage 90, makeup artist 140, nail salon 90. Dropped: tattoo 140 (−48 %, imagery rules), martial arts / dance / pilates / crossfit / esthetician (≤90, −48 % to −85 %).

| Sub-niche | id | Pattern | HTML segment | WordPress segment | Layouts (built 21-Nov-2026, templates r4) |
|---|---|---|---|---|---|
| Hair salon | hair-salon | hair-salon-website | hair-salon-website-template | hair-salon | concierge, bento, folio, band, atlas, ledger |
| Barbershop | barbershop | barbershop-website | barber-shop-website-template | barbershop | band, bento, ledger, atlas, folio, concierge |
| Nail salon | nail-salon | nail-salon-website | nail-salon-website-template | nail-salon | bento, concierge, folio, band, atlas, ledger |
| Spa and massage | spa | spa-website | spa-website-template | spa | concierge, folio, ledger, bento, band, atlas |
| Makeup artist | makeup-artist | makeup-artist-website | makeup-artist-website-template | makeup-artist | folio, concierge, bento, band, atlas, ledger |
| Gym | gym | gym-website (n12) | gym-website-template | gym | timetable, band, bento, atlas, folio, ledger, concierge |
| Personal trainer and fitness | fitness | fitness-website | fitness-website-template | fitness | timetable, atlas, bento, band, folio, ledger, concierge |
| Yoga studio | yoga | yoga-website | yoga-website-template | yoga | timetable, folio, concierge, bento, band, ledger, atlas |

Layouts: six per niche from the existing set (booking-first `concierge`, `band`, `bento`, `folio`, `atlas`, `ledger`) plus one new layout if review shows a gap (a class/timetable layout for gym, fitness and yoga).

**Timetable layout (built).** Review showed the gap: a gym, trainer or yoga site is read for its week of classes, and the shared layouts only have a 3-column table. `timetable` (monochrome) is a dark hero with today's classes, a weekly timetable in day columns with a no-JS class-type filter (radio chips and `:has()`, as the portfolio filter), three passes with zero-placeholder prices, a first-visit guide, coaches as initials and a contact form. It needs `classes` and `passes` (schema in `ui-screens/hc/README.md`). Gym, fitness and yoga have 7 designs; the five beauty niches have 6. 51 designs, 51 themes, 102 screens.

**n12 rows.** gym-website was a flat n12 pattern (Ironyard Gym). Its hand-built homepage is not a signature and not in the catalog (as agency and architecture in r3), so the nested gym page shows the seven new designs and the flat URL 301s once (the slug equals the nested segment). salon-website (Studio Velour) stays a flat n12 pattern: its "hair salon", "hairdresser", "barber" and "spa website" aliases moved to the new niches. Same pipeline as portfolios: content files in `ui-screens/hc/content/`, `INDUSTRIES` row in `src/ui_tree.js`, `PATTERN_SEO` / `UI_COPY` / aliases, WordPress themes, catalog, MCP answer.

**Words (lint, `tests/bw_lint.py`, modelled on hc_lint).** No health, medical or weight-loss claims ("cure", "detox", "burn fat", "lose X kg", "treats", "heals", "anti-ageing results"), no before/after pictures, no guarantees, no real brands (product, salon, gym or fitness-app names), no reviews, testimonials, ratings, "trusted by" or invented member counts; prices only as obvious samples ("from $00" placeholders or "sample price"); licences or certifications only in "add your own" sentences. People shown as drawn placeholders, never photographs.

## Construction and home services tree (templates r5, 23-Nov-2026: eighth industry, PROPOSAL awaiting the owner; first built 7-Nov-2026 and held, now rebased on r4)

Hub `construction-website-templates`, WordPress segment `construction`. Chosen on demand among the industries not yet built (Keyword Planner, worldwide, 7-Nov): "construction website template" 1,900/mo, plumber 390, cleaning 320, landscaping 320, electrician 320, roofing 260, HVAC 260, pest control 170 (about 4,300 a month of template searches across the trades), and WordPress theme searches for construction 720, cleaning 210, plumbing 140. Runner-up: beauty salon and spa (about 2,550). Four hand-built homepages were already live: the builder (n12), Spruceway Cleaning, Northdraft Heating & Cooling and Mothwell Pest Control (n13). Handyman (210, falling 57% a year) and solar (flat) are left out.

| Sub-niche | id | Pattern | HTML segment | WordPress segment | Layouts |
|---|---|---|---|---|---|
| Construction company | construction | construction-website | construction-company-website-template | construction-company | project, dispatch, atlas, folio, ledger, concierge |
| Plumber | plumber | plumber-website | plumber-website-template | plumber | dispatch, project, bento, band, ledger, atlas |
| Electrician | electrician | electrician-website | electrician-website-template | electrician | dispatch, project, atlas, ledger, bento, folio |
| Roofing | roofing | roofing-website | roofing-website-template | roofing | project, dispatch, band, folio, atlas, concierge |
| HVAC | hvac | hvac-website | hvac-website-template | hvac | dispatch, project, ledger, bento, band, concierge |
| Cleaning service | cleaning-service | cleaning-service-website | cleaning-website-template | cleaning | dispatch, project, bento, concierge, folio, band |
| Landscaping | landscaping | landscaping-website | landscaping-website-template | landscaping | project, dispatch, folio, band, bento, concierge |
| Pest control | pest-control | pest-control-website | pest-control-website-template | pest-control | dispatch, project, ledger, atlas, bento, band |

**Trades layouts.** `dispatch` (a call strip, a visit-request panel with job chips, a postcode field and four arrival windows, a drawn service-area map with coverage rings, a job list, process steps beside a sample rates table, crew cards) and `project` (a drawn job in the hero, project filter chips and six project cards with time on site, a stage-by-stage Gantt schedule labelled as a sample, a quote form beside a price guide, a dark close) exist only for content with `quote`, `projects` and `schedule` (schema in `ui-screens/hc/README.md`). Every construction niche has both. Job drawings (`job()` in `ui-screens/hc/engine.js`) are SVG in the theme's colours, so there are no photos and no before/after images.

**hubFirst.** "construction website template" is answered with the hub first; "construction company", "builder" and "general contractor" go straight to the company set (`HUB_SKIP` in `src/ui_templates.js`). "Home builder" stays a real estate niche, and "website builder", "page builder" and "form builder" never match.

**n12/n13 rows.** construction-website, cleaning-service-website, hvac-website and pest-control-website were flat n12/n13 patterns with one hand-built homepage each. Those pages carry testimonials, invented figures and licence or warranty claims, so (as gym in r4 and agency/architecture in r3) they are not signatures and not in the catalog: the nested pages show the six new designs, the old rows stay live as plain items, and the flat URLs 301 once. Fixed versions of the four pages (fictional notice, no testimonials, "add your own" licence lines, builder renamed Ironbark to Stoneharrow) exist in commit 0cb779d (`ui-screens/tpl/site-*.js`) and are NOT in this round: they need an UPDATE bundle like the r4 Ironyard fix and the owner's approval.

**Words.** No trade brands, platforms, trade bodies or certification schemes, no licence, registration, insurance, warranty or guarantee claims unless the sentence tells the owner to add their own or says "sample", no response-time promises outside tables, no before/after, no "safe for children and pets", "non-toxic", germ or allergy claims, no reviews, ratings, awards or invented figures. Safety lines (gas, electrical, carbon monoxide) are general prompts to call the emergency number. Checked by `tests/cn_lint.py` (pages, `CN_LINT_OUT` for signatures, `--readmes` for theme readmes). Readmes say the theme is "not building, electrical, gas or safety advice".

## Legal and professional services tree (templates r6, 24-Nov-2026: ninth industry)

Hub `professional-services-website-templates`, WordPress segment `professional-services`, hubFirst (no niche is named like the industry; "professional services", "legal services", "financial services" get the hub). There was no recorded industry queue after construction, so the lead chose by demand among local-business industries not yet built (Keyword Planner, worldwide, 23-Nov-2026, template terms): lawyer/attorney 590, consulting 590, law firm 390, accounting 320, insurance 260 + insurance agency 110, staffing 170 + recruitment 170, notary 110, financial advisor 90, bookkeeping 90, tax preparation 40 (but "tax website template" 140, +362 % YoY on 6-Nov), about 2,650 a month in all; WordPress theme searches: lawyer 480 (+78 % YoY, the only rising head), consulting 480, law firm 260, finance 170. Runners-up: education (education 1,300, university 390, daycare 170, tutoring 140, preschool 110, about 2,300 but one head term) and automotive (720 + car dealership 480 + car detailing 320 + auto repair 170, about 1,700). Notary and bookkeeping are aliases (bookkeeping → accounting), not niches.

| Sub-niche | id | Pattern | HTML segment | WordPress segment | Layouts |
|---|---|---|---|---|---|
| Law firm | law-firm | law-firm-website (n12) | law-firm-website-template | law-firm | ledger, concierge, atlas, folio, band, bento |
| Lawyer and attorney | lawyer | lawyer-website | lawyer-website-template | lawyer | concierge, folio, ledger, band, bento, atlas |
| Accounting firm | accounting | accounting-website | accounting-website-template | accounting | ledger, bento, atlas, concierge, folio, band |
| Tax preparation | tax-preparation | tax-preparation-website | tax-preparation-website-template | tax-preparation | bento, ledger, concierge, band, atlas, folio |
| Financial advisor | financial-advisor | financial-advisor-website (n13) | financial-advisor-website-template | financial-advisor | folio, concierge, ledger, atlas, bento, band |
| Insurance agency | insurance-agency | insurance-agency-website | insurance-website-template | insurance | atlas, bento, ledger, concierge, band, folio |
| Consulting firm | consulting | consulting-website | consulting-website-template | consulting | folio, atlas, band, ledger, bento, concierge |
| Staffing and recruitment agency | staffing-agency | staffing-agency-website | staffing-agency-website-template | staffing-agency | band, bento, atlas, concierge, ledger, folio |

**Layouts.** Six shared layouts per niche, no new layout: every professional site is read for services, how a first meeting works, fees and people, which the shared set already covers (ledger's fee table, concierge's booking-first hero). 48 designs, 96 screens, 48 themes. New motifs: scales, pillar, calculator, receipt, growth, umbrella, briefcase, badge.

**n12/n13 rows.** law-firm-website (Whitcombe Hale, n12) and financial-advisor-website (Lindqvale Planning, n13) were flat patterns with one hand-built homepage each. As gym in r4 and construction in r5, they are not signatures and not in the catalog: the nested pages show the six new designs, the old rows stay live as plain items and the flat URLs 301 once. "lawyer", "attorney", "solicitor" and "law office" aliases moved from law-firm-website to lawyer-website.

**Words (lint, `tests/ps_lint.py`).** No real firms, networks, software, directories, ranking guides, insurers, fund houses, regulators, tax authorities, professional bodies or designations (CPA, CFP, CFA, EA, chartered); credential words (licensed, registered, certified, admitted, regulated, fiduciary, insured, qualified, member of) only in a sentence that says "add your own" or "sample"; no outcome promises (guarantees, wins, verdicts, settlements, case results, bigger refunds, returns, beat the market, no win no fee, risk-free); no awards, ratings, "best", "trusted", "expert", "specialist"; no reviews, testimonials or client stories; no invented track records; fees only as `$00` placeholders with "sample fees" wording; every page has a fictional notice that says "general information" and "not ... advice". Theme readmes say the theme is "not legal, tax, accounting, insurance or financial advice".

## Education tree (templates r7, 25-Nov-2026: tenth industry, STAGED, not deployed)

Hub `education-website-templates`, WordPress segment `education`, hubFirst (no niche is named like the industry; "education", "e-learning", "teaching" get the hub). The industry is the lead's pick (owner to confirm), the runner-up recorded in r6 and independent of the open question on legal and professional services. Demand (Keyword Planner, worldwide, 25-Nov-2026, template terms): education 1,300 ("school website template" folds into it), university 320, e-learning 260 + course 140 + online course 90, daycare 170 = childcare 170, tutoring 110, preschool 110 + kindergarten 90, academy 90, dance studio 70; WordPress: education 720, LMS 390, university 170, kindergarten 110; "website" forms: tutoring website 8,100, online course website 1,900, daycare website 590, dance studio website 260. Music school is the long-tail pick (music lessons website 90); language and driving schools returned no volume.

| Sub-niche | id | Pattern | HTML segment | WordPress segment | Layouts |
|---|---|---|---|---|---|
| School | school | school-website (n12) | school-website-template | school | concierge, atlas, bento, ledger, band, folio |
| University and college | university | university-website | university-website-template | university | folio, band, atlas, ledger, concierge, bento |
| Preschool and kindergarten | preschool | preschool-website (n13) | preschool-website-template | preschool | bento, concierge, atlas, band, folio, ledger |
| Daycare and childcare | daycare | daycare-website | daycare-website-template | daycare | concierge, band, ledger, folio, bento, atlas |
| Tutoring | tutoring | tutoring-website | tutoring-website-template | tutoring | ledger, concierge, bento, atlas, folio, band |
| Online course and e-learning | online-course | online-course-website | online-course-website-template | online-course | band, folio, atlas, concierge, ledger, bento |
| Music school | music-school | music-school-website | music-school-website-template | music-school | folio, ledger, concierge, atlas, band, bento |
| Dance studio | dance-studio | dance-studio-website | dance-studio-website-template | dance-studio | timetable, band, atlas, bento, concierge, ledger, folio |

**Layouts.** Six shared layouts per niche, plus the r4 class timetable for the dance studio (a week of classes by style, term passes at $00): 49 designs, 98 screens, 49 themes. New motifs: schoolhouse, mortarboard, blocks, kite, pencil, laptop, note, dancer. The course-dashboard app screen is linked from the hub (appPatterns).

**n12/n13 rows.** school-website (Alderbrook Academy, n12) and preschool-website (Puddlewick Preschool, n13) were flat patterns with one hand-built homepage each. As in r4 to r6 they are not signatures and not in the catalog: the nested pages show the new designs, the old rows stay live as plain items and the flat URLs 301 once (education-website-template, the n12 slug, goes to the school page). "university/college website" search aliases moved from school-website to university-website, "daycare/childcare" from preschool-website to daycare-website. The old homepages were not re-linted to the r7 word rules (follow-up item).

**Words (lint, `tests/ed_lint.py`).** No real schools, universities, exam boards or tests (SAT, GCSE, A-level, IB, ABRSM, RAD...), curriculum or method names (Montessori, Waldorf, Reggio Emilia, Suzuki...), learning platforms, tutoring or childcare chains, inspectors, regulators, accreditors, rankings or review sites; credential words (accredited, licensed, registered, certified, qualified, inspected, background- or DBS-checked, ratios) only in a sentence that says "add your own" or "sample"; no outcomes (grades or scores going up, results, pass or acceptance rates, "get into", job placement, fluency, "unlock potential", "transform"); no safety claims (safest, fully safe, nut-free, hygienic); no awards, "best", "outstanding", "excellence", "expert", "specialist", "prestigious"; no testimonials or reviews; no invented counts or track records. Every page: fictional notice with "general information" and "not ... advice", a sample-content line, $00 fees with "sample fees" wording, (555) 01xx phones, .example email, no photos; children's niches (school, preschool, daycare, tutoring, music, dance) also carry an add-your-own safeguarding line. Readmes: `python3 tests/ed_lint.py --readmes`.

## Adding an industry

1. Add a family per niche to `ui-screens/lib.js`, and a motif to `GLYPH` in `ui-screens/hc/engine.js` if needed.
2. Write one content file per niche in `ui-screens/hc/content/`, using the schema in `ui-screens/hc/README.md`. `gen_hc.js` rejects a file that breaks it. The folder name is historical: the engine has no healthcare code in it.
3. Add the industry to `INDUSTRIES` in `src/ui_tree.js`. Its niche rows are the whole URL decision: no route code changes.
4. Add `PATTERN_SEO`, `UI_COPY` and `PATTERN_ALIASES` entries for new patterns, and `ALIASES` in `src/ui_templates.js` for the MCP answer. `assertSlugs` fails the module on a gap.
5. Add the niche's lint rules if it is a regulated field. `tests/hc_lint.py` shows the shape.
6. Run the pipeline below. Niches that reach 6 go nested on their own, and their flat URLs start to 301.

## Pipeline

```
node ui-screens/gen_hc.js                                   # designs to ui-screens/out-hc
python3 tests/hc_lint.py                                    # copy lint
SHOOT_OUT=out-hc ui-screens/shoot.sh; SHOOT_OUT=out-hc python3 ui-screens/trim.py
node ui-screens/wp-export/layoutmap.mjs maps.json
python3 tests/hc_distinct.py maps.json > distinct.json      # page test, part one
node ui-screens/wp-export/batch.mjs --zips <zips>           # themes to ui-screens/out-wp
node ui-screens/wp-export/installtest.mjs --base <wp> --out ui-screens/out-wp/_r0.jsonl --shots ui-screens/out-wp/_wpshots <slugs>
node ui-screens/wp-export/build_catalog.mjs distinct.json src/tpl_catalog.json   # page test, part two
```

`build_catalog.mjs` is the only way into the catalog, and it only admits a theme with a passing result. `assertTree` fails the module if a theme has no passing test, if a path is duplicated or malformed, or if a segment could be mistaken for an item id.

## WordPress themes

`ui-screens/wp-export/export.mjs` converts a template's HTML into a block theme: `theme.json`, templates, header and footer parts, one pattern per section, eight style variations plus dark, bundled fonts, `readme.txt`, `screenshot.png`. Real blocks are used wherever a block can hold the markup. Custom HTML is kept for forms, plus some decoration and tables with cell attributes, and each theme's report counts them. The header uses `core/navigation`, which collapses to an overlay menu under 960 px. Text-only sections and layouts are real groups, so they edit in the Site Editor.

Theme slug: `mgd-<niche>-<layout>`. Layout ids: `signature` (the hand-built homepage, variant `homepage`), `atlas`, `folio`, `ledger`, `bento`, `band`, `concierge`, for property content `listing`, `showcase`, and for restaurant content `menu`, `reserve`, for wedding content `invite`, `programme`, for portfolio content `work`, `index`, and for gym, fitness and yoga content `timetable`, and for trades content `dispatch`, `project`.

R2 keys: `tpl/wordpress/<slug>/<version>/{theme.zip,shot-1280.webp,shot-390.webp}`. A new version means a new prefix, so caches and old links stay valid until the catalog changes.
