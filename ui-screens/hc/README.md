# Industry template sets: content schema

A niche is one file, `hc/content/<niche>.js`. `node gen_hc.js --only <niche>` pours it into page layouts and writes `out-hc/`. `gen_hc.js` rejects a file that breaks the counts below. `python3 ../tests/hc_lint.py <niche>` is the content gate. `hc/content/cardiology.js` is the reference.

| Field | Shape |
|---|---|
| niche, pattern, family, kind, motif | ids. `kind` reads after "a full home page for": "an outpatient cardiology practice". `motif` is a key of GLYPH in `hc/engine.js`. |
| layouts | optional. New niches with no hand-made template list all six: `["atlas","folio","ledger","bento","band","concierge"]` |
| alert | one safety line, or omit it. Health: when to call the emergency number. |
| nav | labels: services, process, team, faq, visit, call |
| hero | eyebrow, h1 (46 characters or fewer), lede, cta, alt |
| facts | exactly 3 of { t, d } |
| doors | exactly 3 of { t, d, cta, to }, `to` is services, process, team, faq or visit |
| services | eyebrow, h2, lede, items: exactly 6 of { icon, t, d, who }. `icon` is a name from the list in AUTHORING.md. `who` fills a table cell. |
| index | h2, lede, items: 10 to 14 short strings (conditions, products, services) |
| process | h2, lede, steps: exactly 4 of { t, d } |
| table | h2, lede, cols (3), rows (5 rows of 3 cells), note |
| team | h2, lede, people: exactly 4 of { n, r, b } |
| audience | eyebrow, h2, lede, points: 3 or 4 strings. A second audience: referrers, parents, carers. |
| statement | one sentence, shown large. Plain and factual. |
| faq | h2, items: exactly 6 of { q, a } |
| visit | h2, lede, email (`.example` domain), formTitle, formButton, formNote, locations: exactly 2 of { n, addr, hours, phone } |
| cta | h2, lede |
| footer | blurb, legal |
| listings | property layouts only (`listing`, `showcase`): eyebrow, h2, lede, optional search { where, hint, type, options }, items: exactly 6 of { kind, t, area, price, specs (3 strings), tag }. `kind` is house, townhouse, flat, tower, cabin, villa, plot or shop. |
| feature | property layouts only: eyebrow, t, lede, price, rooms: exactly 5 of [name, size]. |
| menu | restaurant layouts only (`menu`, `reserve`): eyebrow, h2, lede, board (specials board title), note (must say "sample"), keys: 2 to 5 of [code, meaning], sections: exactly 3 of { t, items: exactly 4 of { n, d, p, tags } }. Every tag must be a key code. |
| booking | restaurant layouts only: h2 (title over the hours), date, note, sizes (3 or more), slots: exactly 6 of [time, "" or "full"], hours: exactly 4 of [days, times], optional sizeLabel and slotsLabel. |
| art | restaurant layouts only: exactly 3 dish drawings from plate, bowl, pizza, loaf, cup, glass, cake, tray. |
| occasion | wedding and event layouts only (`invite`, `programme`): title (1 to 3 lines), date, place, time, timelineH2, timelineLede, timeline: 5 to 7 of [time, title, detail]. |
| reply | wedding and event layouts only: h2, lede, choicesLabel, choices (2 to 4), selectLabel, options (3 to 6), askLabel, button, note. When present, the shared layouts use this RSVP or enquiry form in place of the contact form. |
| programme | wedding and event layouts only: h2, lede, note (must say "sample"), mapH2, mapLede, mapNote, spots: exactly 6 (numbered pins on the site plan), days: 2 or 3 of { t, sub, slots: 3 to 5 of [time, title, where] }. |
| art (weddings) | exactly 3 drawings from barn, arch, table, hall, bouquet, marquee, camera, cake. |
| optional labels | visit.fields, footer.cols and services.cols: exactly 3 strings each, to rename the form fields, footer column titles and ledger table headers (a couple's site is not a business). |
| notice | names the business as fictional, and for health says "general information" and "not medical advice" |

Add a new industry by adding a family to `lib.js`, a motif to `GLYPH`, and content files. No layout code changes.
