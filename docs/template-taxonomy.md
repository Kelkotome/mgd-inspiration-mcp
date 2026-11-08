# Template taxonomy and URLs

Applies to website templates under `/inspiration/ui/`. Healthcare is the pilot (7-Nov-2026). Code: `src/ui_tree.js` (tree and paths), `src/ui_templates.js` (pages, downloads, MCP answer), `src/tpl_catalog.json` (generated, never edited by hand).

## Four categories

| Category | Values | Where it shows |
|---|---|---|
| Platform | HTML, WordPress | Path: `/ui/wordpress-themes/...`. HTML is the default and has no path segment of its own |
| Type | one-page, website, landing page | Filter. A chip appears only when a page has more than one value |
| Industry | Healthcare, Real estate, Restaurant, Weddings and events | Path |
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

Theme slug: `mgd-<niche>-<layout>`. Layout ids: `signature` (the hand-built homepage, variant `homepage`), `atlas`, `folio`, `ledger`, `bento`, `band`, `concierge`, for property content `listing`, `showcase`, and for restaurant content `menu`, `reserve`.

R2 keys: `tpl/wordpress/<slug>/<version>/{theme.zip,shot-1280.webp,shot-390.webp}`. A new version means a new prefix, so caches and old links stay valid until the catalog changes.
