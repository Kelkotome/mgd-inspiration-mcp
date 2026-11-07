# Template taxonomy and URLs

Applies to website templates under `/inspiration/ui/`. Healthcare is the pilot (7-Nov-2026). Code: `src/ui_tree.js` (tree and paths), `src/ui_templates.js` (pages, downloads, MCP answer), `src/tpl_catalog.json` (generated, never edited by hand).

## Four categories

| Category | Values | Where it shows |
|---|---|---|
| Platform | HTML, WordPress | Path: `/ui/wordpress-themes/...`. HTML is the default and has no path segment of its own |
| Type | one-page, website, landing page | Filter. A chip appears only when a page has more than one value |
| Industry | Healthcare | Path |
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

Theme slug: `mgd-<niche>-<layout>`. Layout ids: `signature` (the hand-built homepage, variant `homepage`), `atlas`, `folio`, `ledger`, `bento`, `band`, `concierge`.

R2 keys: `tpl/wordpress/<slug>/<version>/{theme.zip,shot-1280.webp,shot-390.webp}`. A new version means a new prefix, so caches and old links stay valid until the catalog changes.
