# Writing UI screen templates (tpl/*.js)

Each module exports `{ "<pattern>": { family, name, shows, elements, web, mobile, type?, size?, variants? } }`.
Read `tpl/pilot.js` first: it is the quality bar (real-looking, dense, specific copy; no lorem ipsum).

## The function
`web(p, st, rnd)` / `mobile(p, st, rnd)` return the `<body>` inner HTML.
- `p` = family product: `p.name` (e.g. "Fernway"), `p.cat`, `p.desc`, `p.variant` (when the pattern has variants). ALWAYS use `p.name`, never hard-code a product name.
- `st` = style preset: use `st.hscale` to scale serif display headings (`font-size:${Math.round(28 * st.hscale)}px`). Numbers, prices, metrics, plan names: `class="num"` with a fixed px size (NOT `.h`).
- `rnd()` = seeded random 0..1 for chart data etc. Never use Math.random.
- Viewports: web 1440×900, mobile 390×844 (iPhone; start with `status()`; app screens usually end with `tabBar(...)`). Content must fit — no clipped text, no scrollbars, no big empty voids. Sections (`type: "section"`) may set `size: { web: [1440, H], mobile: [390, H] }` so short sections (footer, logo cloud) aren't padded with emptiness.

## Families (product + palette shared across a family, so flows look like one app)
workspace = Fernway (tasks, docs, files for small teams) · finance = Tallyfold (revenue analytics) · ai = Lumen Desk ·
commerce = Juniper Supply (home & kitchen store) · media = Fieldnote (travel photo community) · health = Steadyfit (habits & workouts) ·
marketing = Patchbay (API monitoring; website sections). Recurring people: Mara Okafor (admin), Teodora Ruiz, Sam Achebe, Lin Park, Jonah Weiss, Priya Nair.

## Building blocks (lib.js) — require("../lib")
`ic(name, size)` icons: home chart users gear card chat plus search inbox check send bell doc spark arrow menu back lock mail calendar folder image cart heart star filter more trash upload download edit eye clock globe phone play x chevron chevdown grid list tag shield key pin sun bolt bookmark share refresh link minus bold italic heading quote.
`esc(s)`, `sideNav(p, active, [[icon,label]...])`, `status()`, `tabBar(active, [[icon,label]...])` (4 items), `areaChart(rnd, w, h)`, `bars(rnd, n, h)`, `series(rnd,n,base,drift)`.
CSS classes (baseCss): `.shell` (sidebar grid) `.side` `.nav(.on)` `.grp` `.foot` `.main` `.top` `.search` `.page` `.ph` · `.card` `.btn` `.btn.primary` `.btn.block` `.badge` `.field` `.input(.filled)` `.avatar` `.logo` (with `<b></b>` mark) `.num` `.muted` `.h` · mobile: `.phone` `.status` `.mtop` `.mbody` `.tabs`.
Colours: ONLY CSS variables `--bg --surface --border --text --muted --primary --on-primary --accent` plus status colours `--danger --on-danger --success --warning` (meaning only: end call, delete/destructive, errors, critical severity, removed lines / success, added lines / warnings) (+ `color-mix(in oklab, …)`), radii `--radius-sm --radius --radius-lg`, shadows `--shadow-sm --shadow --shadow-lg`, fonts `--font-h --font-b`. Never hard-code UI colours (each of 8 styles recolours everything). Exception: illustrative "photos"/artwork (product shots, travel photos, avatars) may use fixed natural-tone gradients/SVG shapes — no external images, no emoji as imagery.
Inverted/dark cards: background `var(--text)`, colour `var(--bg)`, add class `feat` (monochrome then flips its primary button). Never put `var(--primary)` text/buttons on a `var(--text)` background without the `feat` class.
Local helpers/consts are fine; prefix any extra icons you add to `ICON` with your module name to avoid collisions. Do NOT edit lib.js, gen.js or other tpl files.

## Variants
`variants: { "password-reset": { name: "Password reset confirmation", shows: "…" }, … }` → one screen per variant; read `p.variant` in the template.

## Check your work (required)
```
node gen.js --only a,b,c            # all 8 styles × web+mobile
./shoot.sh 'a-*'                    # screenshots (2x) — run per pattern
python3 sheet.py 'a-*' /tmp/x.png   # contact sheet → open it with the Read tool and LOOK
python3 sheet.py 'a-*' /tmp/xd.png 560 --dark   # same in DARK mode (every screen ships light + dark)
```
Look at every pattern in at least minimal, editorial, brutalist, playful, monochrome, on web AND mobile, then open 2–3 full-size screen.png files. Check the dark sheet too: anything hard-coded light (white panels, light text on light) is a bug — colours must come from the tokens so dark mode works. Fix: clipping/overflow, text wrapping badly, unreadable contrast, empty voids, things that look broken in brutalist (thick borders) or luxury (uppercase buttons) or editorial (serif headings).

## After adding or changing patterns (MCP search)
- `node elements.js` rebuilds `src/ui_elements.json` (element + layout inventory parsed from `out/*/index.html` plus each template's `elements`); it powers the `elements` filter of `search_ui_screens`. Commit it with the templates; it ships on the next Worker deploy (no D1 change).
- Add words people use for a new pattern to `PATTERN_ALIASES` in `src/ui_search.js`, add a line to `tests/ui_rank/cases.txt`, and run `node --import ./tests/ui_rank/register.mjs tests/ui_rank/run.mjs` (refresh the row dump with `--refresh` after ingest).

## Website templates (type "page", 5-Nov-2026)
Full-length, responsive industry home pages live in `tpl/site-*.js` and use `sitekit.js` (read it and `tpl/site-restaurant.js` first).
One HTML document per pattern, returned for BOTH web and mobile (`K.def(...)`): shot at 1440 and 390, so layout lives in a module-prefixed
`<style>` with media queries (760 / 1024 px), not inline styles. `size` caps are 5600 (web) / 8000 (mobile) CSS px; run `trim.py` after
`shoot.sh` and check `meta.json` viewport.h — a value equal to the cap means the page is clipped. Variants are page types (`homepage` first;
about / pricing / contact / 404 per industry slot in as more variants). Every new page pattern needs: a family in lib.js, an entry in
`src/ui_screens.js` UI_PAGE_PATTERNS, a slug + H1 in `src/ui_seo.js`, copy in `src/ui_pattern_copy.json`, aliases (incl. "<industry> webtemplate")
in `src/ui_search.js`, and a line in `tests/ui_rank/cases_n12.txt`.

## Niche landing pages (n13, 6-Nov-2026)
Search note: a full page names every section, so `buildIndex` counts page templates at 0.1 in document frequency. Without that, 20 more page templates wore down words like "hero" and pushed the real hero pattern off the top. Tags on a page must not read like a design request (attack-path and audience-paths both matched "two paths"; run-log matched "running").
Same system as the website templates, one level deeper. Each niche gets its own section order and at least two sections that only make sense for that field; it is never another template with the words swapped.
Healthcare and finance pages: no outcome claims, percentages, patient counts, ratings, testimonials, drug names or doses, and no named certifying bodies. Credentials use generic kinds of training plus one dashed "add your details" slot, and the footer legal line says the practice is fictional and the page is general information only.
Gates: `python3 tests/n13_lint.py <pattern>` (content) and `PW_DIR=<dir with playwright-core> node tests/n13_overflow.mjs <pattern>` (no sideways scroll at 390, 768, 1024, 1440). `bash tests/n13_local_e2e.sh <pattern>` ingests into a throwaway local Worker and checks pattern pages, raw files and the "Build this with your AI" panel; it never touches live. In zsh pass patterns as an array, or `$A` stays one word.
