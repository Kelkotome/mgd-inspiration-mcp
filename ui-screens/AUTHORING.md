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
Colours: ONLY CSS variables `--bg --surface --border --text --muted --primary --on-primary --accent` (+ `color-mix(in oklab, …)`), radii `--radius-sm --radius --radius-lg`, shadows `--shadow-sm --shadow --shadow-lg`, fonts `--font-h --font-b`. Never hard-code UI colours (each of 8 styles recolours everything). Exception: illustrative "photos"/artwork (product shots, travel photos, avatars) may use fixed natural-tone gradients/SVG shapes — no external images, no emoji as imagery.
Inverted/dark cards: background `var(--text)`, colour `var(--bg)`, add class `feat` (monochrome then flips its primary button). Never put `var(--primary)` text/buttons on a `var(--text)` background without the `feat` class.
Local helpers/consts are fine; prefix any extra icons you add to `ICON` with your module name to avoid collisions. Do NOT edit lib.js, gen.js or other tpl files.

## Variants
`variants: { "password-reset": { name: "Password reset confirmation", shows: "…" }, … }` → one screen per variant; read `p.variant` in the template.

## Check your work (required)
```
node gen.js --only a,b,c            # all 8 styles × web+mobile
./shoot.sh 'a-*'                    # screenshots (2x) — run per pattern
python3 sheet.py 'a-*' /tmp/x.png   # contact sheet → open it with the Read tool and LOOK
```
Look at every pattern in at least minimal, editorial, brutalist, playful, monochrome, on web AND mobile, then open 2–3 full-size screen.png files. Fix: clipping/overflow, text wrapping badly, unreadable contrast, empty voids, things that look broken in brutalist (thick borders) or luxury (uppercase buttons) or editorial (serif headings).
