#!/usr/bin/env python3
"""build_font_pairings_curated.py (10-Nov-2026, mcp-gaps-r1): editorial pairings for 30 popular Google Fonts that had no pairing guide.

  python3 -I build_font_pairings_curated.py [GF_META_MIN_JSON] [OUT=src/font_pairings_curated.js]

GF_META_MIN_JSON defaults to deploy-bundle-2026-11-09/fonts-r2/src/gf_meta_min.json (every Google Fonts family with its category,
designers and fonts.google.com dateAdded, saved for fonts round 2).

Why: every font in the mcp_calls history now returns pairs (fonts r2 shipped all 10 of the 5-to-9-Nov zeros), so the next 30 came from
the Google Fonts popularity ranking, the same way round 2 chose its non-gap fonts: Latin-script, not Noto, no guide and no partner-only
answer today (live they return "0 results"), skipping novelty faces (Black Ops One, Share Tech, Smooch Sans, Changa One, Lobster Two,
Zeyada, Slabo 27px, Bungee) and width siblings of a font that has a guide (Barlow Semi Condensed, PT Sans Narrow, Saira Condensed).

Same pairing rules as the round-2 writer brief (fonts-r2/src/BRIEF.md), enforced below:
- every partner is an exact Google Fonts family name, never the font itself; widely used partners
- roles are honest: display, script and heading-only faces are the heading in all 5 rows; otherwise the font is the heading in at
  most 2 rows (the same shape the article parser keeps)
- each reason is one stand-alone sentence of 60 to 200 characters ending with a period, names the partner or its quality, no em or en
  dashes, none of the banned words, American spelling
- facts (category, designers, year) come only from google/fonts METADATA.pb and fonts.google.com metadata; a year only when
  METADATA.pb date_added and fonts.google.com dateAdded agree (Dosis 2019 vs 2012 and Faustina 2016 vs 2017 get none)
These have no MGD article yet, so `page` is null and the Worker says so and points to the pairing generator instead of a guide.
Groups use the round-2 builder's pair_group (fonts-r2/src/build_r2.py), keyed on the partner.
"""
import json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
GFM_PATH = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "..", "deploy-bundle-2026-11-09", "fonts-r2", "src", "gf_meta_min.json")
OUT = sys.argv[2] if len(sys.argv) > 2 else os.path.join(HERE, "src", "font_pairings_curated.js")
GFM = json.load(open(GFM_PATH))
GF = {k.lower(): k for k in GFM}

# font: [Google Fonts category, designers (METADATA.pb), year added or None (rule above)]
ABOUT = {
    "Roboto Flex": ["Sans Serif", ["Font Bureau", "David Berlow", "Santiago Orozco", "Irene Vlachou", "Ilya Ruderman", "Yury Ostromentsky", "Mikhail Strukov"], 2022],
    "Red Hat Display": ["Sans Serif", ["MCKL"], 2019],
    "Dosis": ["Sans Serif", ["Impallari Type"], None],
    "Exo 2": ["Sans Serif", ["Natanael Gama"], 2013],
    "Oxygen": ["Sans Serif", ["Vernon Adams"], 2012],
    "Epilogue": ["Sans Serif", ["Tyler Finck", "ETC"], 2020],
    "Faustina": ["Serif", ["Omnibus-Type"], None],
    "Pacifico": ["Handwriting", ["Vernon Adams", "Jacques Le Bailly", "Botjo Nikoltchev", "Ani Petrova"], 2011],
    "Hanken Grotesk": ["Sans Serif", ["Alfredo Marco Pradil", "Hanken Design Co."], 2022],
    "Arvo": ["Serif", ["Anton Koovit"], 2010],
    "Overpass": ["Sans Serif", ["Delve Withrington", "Dave Bailey", "Thomas Jockin"], 2016],
    "DM Mono": ["Monospace", ["Colophon Foundry"], 2020],
    "Lobster": ["Display", ["Impallari Type"], 2010],
    "Comfortaa": ["Display", ["Johan Aakerlund"], 2011],
    "Be Vietnam Pro": ["Sans Serif", ["Lâm Bảo", "Tony Le", "ViệtAnh Nguyễn"], 2021],
    "Abel": ["Sans Serif", ["MADType"], 2011],
    "Maven Pro": ["Sans Serif", ["Joe Prince"], 2011],
    "Shadows Into Light": ["Handwriting", ["Kimberly Geswein"], 2011],
    "Lilita One": ["Display", ["Juan Montoreano"], 2012],
    "Domine": ["Serif", ["Impallari Type"], 2012],
    "Asap": ["Sans Serif", ["Omnibus-Type"], 2012],
    "Questrial": ["Sans Serif", ["Joe Prince", "Laura Meseguer"], 2011],
    "Albert Sans": ["Sans Serif", ["Andreas Rasmussen"], 2022],
    "Marcellus": ["Serif", ["Astigmatic"], 2012],
    "Geologica": ["Sans Serif", ["Monokrom", "Sindre Bremnes", "Frode Helland"], 2023],
    "Onest": ["Sans Serif", ["Dmitri Voloshin", "Andrey Kudryavtsev"], 2023],
    "Archivo Narrow": ["Sans Serif", ["Omnibus-Type"], 2012],
    "Great Vibes": ["Handwriting", ["Robert Leuschke"], 2012],
    "Varela Round": ["Sans Serif", ["Joe Prince"], 2011],
    "League Spartan": ["Sans Serif", ["Matt Bailey", "Tyler Finck"], 2021],
}

# (heading, body, why). The page font is one of the two.
PAIRS = {
    "Roboto Flex": [
        ("Roboto Flex", "Roboto Serif", "Roboto Serif shares the proportions of the Roboto family, so long reading text sits comfortably under Roboto Flex headings."),
        ("Roboto Flex", "Merriweather", "Merriweather is a sturdy screen serif that gives articles a bookish texture below heavy or condensed Roboto Flex headings."),
        ("Playfair Display", "Roboto Flex", "Playfair Display brings high-contrast headlines, and the optical size axis of Roboto Flex keeps the body text calm and readable."),
        ("Montserrat", "Roboto Flex", "Montserrat's wide geometric capitals contrast with the narrower, neutral Roboto Flex body text on product and landing pages."),
        ("Space Grotesk", "Roboto Flex", "Space Grotesk adds quirky, technical headings while Roboto Flex keeps interface labels and paragraphs neutral and clear."),
    ],
    "Red Hat Display": [
        ("Red Hat Display", "Red Hat Text", "Red Hat Text is the text-size companion to Red Hat Display, with looser spacing and sturdier shapes for small body copy."),
        ("Red Hat Display", "Inter", "Inter's neutral, tall x-height body text lets the friendly geometric shapes of Red Hat Display carry the headlines."),
        ("Red Hat Display", "Source Serif 4", "Source Serif 4 adds a crisp, readable serif body that contrasts cleanly with the open geometry of Red Hat Display."),
        ("Red Hat Display", "IBM Plex Sans", "IBM Plex Sans gives an engineered, slightly technical body text that suits Red Hat Display headings on docs and product sites."),
        ("Red Hat Display", "Lora", "Lora's soft, calligraphic serif text warms up pages headed in the clean, open letterforms of Red Hat Display."),
    ],
    "Dosis": [
        ("Dosis", "Open Sans", "Open Sans gives a wide, neutral reading texture that balances the narrow, rounded capitals of Dosis headings."),
        ("Dosis", "Lato", "Lato's warm, semi-rounded body text matches the soft terminals of Dosis without repeating its narrow width."),
        ("Dosis", "Merriweather", "Merriweather is a solid screen serif that adds contrast and weight below light, rounded Dosis headlines."),
        ("Dosis", "Nunito Sans", "Nunito Sans keeps the friendly mood of rounded Dosis headings in body text while staying plain enough for long paragraphs."),
        ("Dosis", "Roboto", "Roboto provides a compact, neutral body text that lets airy, rounded Dosis headings stand out on dashboards and apps."),
    ],
    "Exo 2": [
        ("Exo 2", "Roboto", "Roboto's neutral grotesque body text calms the angular, futuristic shapes of Exo 2 headings on tech and gaming sites."),
        ("Exo 2", "Open Sans", "Open Sans adds a wide, friendly reading texture that softens the sharp, machined corners of Exo 2 headlines."),
        ("Exo 2", "Source Sans 3", "Source Sans 3 is a clear humanist body face that keeps long copy readable under squared-off Exo 2 headings."),
        ("Exo 2", "Titillium Web", "Titillium Web shares the technical, squared feel of Exo 2 at text sizes, giving engineering pages one consistent voice."),
        ("Exo 2", "Lato", "Lato's rounded, warm body text balances the cool sci-fi geometry of Exo 2 titles on esports and software pages."),
    ],
    "Oxygen": [
        ("Oxygen", "Lora", "Lora's flowing serif body text gives warmth to pages headed in the plain, screen-tuned letterforms of Oxygen."),
        ("Oxygen", "Source Serif 4", "Source Serif 4 offers a crisp text serif that adds editorial contrast below simple, even Oxygen headings."),
        ("Montserrat", "Oxygen", "Montserrat's bold geometric headlines sit well over Oxygen, whose open, slightly squared letters read clearly in body text."),
        ("Playfair Display", "Oxygen", "Playfair Display adds elegant, high-contrast headings while Oxygen keeps the supporting text clean and screen friendly."),
        ("Raleway", "Oxygen", "Raleway's thin, stylish display weights pair with the sturdier Oxygen body text on clean portfolio and agency pages."),
    ],
    "Epilogue": [
        ("Epilogue", "Source Serif 4", "Source Serif 4 gives a sharp, readable serif body under heavy Epilogue headlines in editorial and magazine layouts."),
        ("Epilogue", "Lora", "Lora's soft, calligraphic serif text balances the bold, tightly drawn shapes of Epilogue headings."),
        ("Fraunces", "Epilogue", "Fraunces adds a soft, characterful serif headline while the plain grotesque of Epilogue keeps body text even and modern."),
        ("Playfair Display", "Epilogue", "Playfair Display brings classic high-contrast headings, and Epilogue supplies a crisp, contemporary body text below them."),
        ("Space Grotesk", "Epilogue", "Space Grotesk's quirky details work in headings while the calmer grotesque forms of Epilogue carry the paragraphs."),
    ],
    "Faustina": [
        ("Faustina", "Work Sans", "Work Sans is a plain grotesque that keeps captions and interface text tidy beside Faustina headings on news and magazine sites."),
        ("Faustina", "Source Sans 3", "Source Sans 3 gives a neutral, humanist sans for secondary text that does not compete with editorial Faustina headlines."),
        ("Montserrat", "Faustina", "Montserrat's geometric headlines give a modern frame to Faustina, an editorial serif made for books, newspapers and magazines."),
        ("Libre Franklin", "Faustina", "Libre Franklin adds a confident, news-style sans headline above the calm, readable Faustina body text."),
        ("Playfair Display", "Faustina", "Playfair Display brings high-contrast display headings while the sturdier Faustina text serif carries long articles."),
    ],
    "Pacifico": [
        ("Pacifico", "Open Sans", "Open Sans is a neutral, highly readable body font that lets the bold brush script of Pacifico headings stand out."),
        ("Pacifico", "Lato", "Lato's warm, rounded body text keeps the relaxed, surf-inspired mood of Pacifico logos and headings."),
        ("Pacifico", "Montserrat", "Montserrat's clean geometric body and subheads give structure to menus and posters headed in Pacifico."),
        ("Pacifico", "Nunito", "Nunito's rounded terminals echo the soft strokes of Pacifico, so cafe and kids' brand pages feel consistent."),
        ("Pacifico", "Roboto", "Roboto gives a plain, compact body text, so Pacifico can stay reserved for a logo or one short headline."),
    ],
    "Hanken Grotesk": [
        ("Hanken Grotesk", "Source Serif 4", "Source Serif 4 is a crisp text serif that adds an editorial voice below clean Hanken Grotesk headings."),
        ("Hanken Grotesk", "Lora", "Lora's warm, calligraphic serif body text softens the neutral grotesque shapes of Hanken Grotesk headlines."),
        ("Fraunces", "Hanken Grotesk", "Fraunces brings soft, characterful serif headings while Hanken Grotesk keeps interface and body text neutral."),
        ("Playfair Display", "Hanken Grotesk", "Playfair Display adds high-contrast elegance to headlines, and Hanken Grotesk gives a modern, readable body below."),
        ("Bricolage Grotesque", "Hanken Grotesk", "Bricolage Grotesque gives expressive headlines while Hanken Grotesk supplies a quieter grotesque for long text."),
    ],
    "Arvo": [
        ("Arvo", "Open Sans", "Open Sans gives a wide, neutral body text that balances the sturdy, geometric slab serifs of Arvo headings."),
        ("Arvo", "Lato", "Lato's warm, semi-rounded sans softens the near-monolinear slab shapes of Arvo for friendly blogs and recipe sites."),
        ("Arvo", "Source Sans 3", "Source Sans 3 keeps long body copy clear and humanist under bold, geometric Arvo headlines."),
        ("Arvo", "Roboto", "Roboto's compact grotesque body text sits neatly under Arvo headings on dashboards and documentation pages."),
        ("Arvo", "Merriweather Sans", "Merriweather Sans gives a sturdy, screen-friendly body text with the same solid color as Arvo headings."),
    ],
    "Overpass": [
        ("Overpass", "Source Serif 4", "Source Serif 4 adds a readable text serif below Overpass headings, whose letters are based on U.S. highway signs."),
        ("Overpass", "Merriweather", "Merriweather's sturdy serif body gives contrast and warmth to the clear, signage-style shapes of Overpass headlines."),
        ("Montserrat", "Overpass", "Montserrat's wide geometric headings pair with Overpass, a clear sans tuned for small sizes that reads well in body text."),
        ("Roboto Slab", "Overpass", "Roboto Slab gives firm slab serif headings while Overpass keeps the body text open and easy to scan."),
        ("Oswald", "Overpass", "Oswald's tall, condensed headlines contrast with the wider, plainer Overpass body text on transport and civic sites."),
    ],
    "DM Mono": [
        ("DM Mono", "DM Sans", "DM Mono was loosely based on DM Sans, so its technical headings and labels sit naturally above DM Sans body text."),
        ("DM Mono", "Inter", "Inter's neutral, legible screen sans lets short DM Mono headlines and labels carry the technical tone on developer sites."),
        ("Space Grotesk", "DM Mono", "Space Grotesk headings add geometric character while DM Mono sets code samples, specs and labels in technical docs."),
        ("DM Serif Display", "DM Mono", "DM Serif Display gives bold, high-contrast headlines, and DM Mono adds a typewritten feel to captions and short text."),
        ("Fraunces", "DM Mono", "Fraunces brings soft serif headlines to studio and portfolio sites while DM Mono handles metadata, dates and captions."),
    ],
    "Lobster": [
        ("Lobster", "Open Sans", "Open Sans gives a neutral, readable body text that lets the bold, connected script of Lobster headings take the lead."),
        ("Lobster", "Lato", "Lato's warm, rounded sans keeps body text friendly beneath retro Lobster titles on menus and event pages."),
        ("Lobster", "Cabin", "Cabin's humanist shapes have a slightly vintage feel that suits the retro signage look of Lobster headings."),
        ("Lobster", "Roboto", "Roboto gives a compact, plain body text, so Lobster can stay reserved for one logo or short headline."),
        ("Lobster", "Montserrat", "Montserrat's clean geometric body and subheads add structure to posters and flyers headed in Lobster."),
    ],
    "Comfortaa": [
        ("Comfortaa", "Open Sans", "Open Sans gives a neutral, readable body text that keeps the rounded, geometric Comfortaa headings feeling light."),
        ("Comfortaa", "Nunito", "Nunito's rounded terminals echo the soft geometry of Comfortaa in body text for kids, wellness and app brands."),
        ("Comfortaa", "Lato", "Lato's warm, semi-rounded sans matches the friendly mood of Comfortaa titles while reading well at small sizes."),
        ("Comfortaa", "Roboto", "Roboto adds a compact, neutral body text that balances the wide, circular letters of Comfortaa headlines."),
        ("Comfortaa", "Merriweather", "Merriweather is a sturdy screen serif that adds contrast and substance below soft, rounded Comfortaa headings."),
    ],
    "Be Vietnam Pro": [
        ("Be Vietnam Pro", "Lora", "Lora's flowing serif body text adds warmth below the clean, neo-grotesque shapes of Be Vietnam Pro headings."),
        ("Be Vietnam Pro", "Source Serif 4", "Source Serif 4 gives an editorial text serif that contrasts with bold Be Vietnam Pro headlines on blogs and news sites."),
        ("Playfair Display", "Be Vietnam Pro", "Playfair Display brings classic high-contrast headings while Be Vietnam Pro keeps body text crisp and modern."),
        ("Fraunces", "Be Vietnam Pro", "Fraunces adds soft, characterful serif headlines above the even, highly readable Be Vietnam Pro body text."),
        ("Montserrat", "Be Vietnam Pro", "Montserrat's wide geometric capitals contrast with the more neutral Be Vietnam Pro body text on startup and product pages."),
    ],
    "Abel": [
        ("Abel", "Open Sans", "Open Sans gives a wide, comfortable body text that balances the narrow, flat-sided letters of Abel headings."),
        ("Abel", "Lato", "Lato's warm, rounded forms soften the angled terminals and condensed shapes of Abel headlines."),
        ("Abel", "Merriweather", "Merriweather is a sturdy serif that adds contrast and reading comfort below light, condensed Abel titles."),
        ("Abel", "Roboto", "Roboto gives a neutral, compact body text that suits the clean, newspaper-headline style of Abel."),
        ("Abel", "Source Sans 3", "Source Sans 3 is a clear humanist body face that keeps long copy readable under tall, narrow Abel headings."),
    ],
    "Maven Pro": [
        ("Maven Pro", "Lora", "Lora's calligraphic serif text adds warmth below the flowing, rounded curves of Maven Pro headings."),
        ("Maven Pro", "Open Sans", "Open Sans gives a plain, wide body text, so the distinctive curves of Maven Pro stay in the headlines."),
        ("Playfair Display", "Maven Pro", "Playfair Display adds high-contrast serif headings while Maven Pro keeps the body text modern and legible."),
        ("Montserrat", "Maven Pro", "Montserrat's bold geometric headlines sit well over Maven Pro, whose flowing rhythm reads smoothly in body text."),
        ("Roboto Slab", "Maven Pro", "Roboto Slab gives firm slab serif headings that contrast with the soft, flowing Maven Pro body text."),
    ],
    "Shadows Into Light": [
        ("Shadows Into Light", "Open Sans", "Open Sans keeps body text neutral and readable, so handwritten Shadows Into Light headings feel like personal notes."),
        ("Shadows Into Light", "Lato", "Lato's warm, rounded sans suits the neat, casual handwriting of Shadows Into Light titles on blogs and invitations."),
        ("Shadows Into Light", "Roboto", "Roboto gives a compact, plain body text, so Shadows Into Light can stay reserved for short accents and headings."),
        ("Shadows Into Light", "Montserrat", "Montserrat's clean geometric body and subheads add structure around informal Shadows Into Light headlines."),
        ("Shadows Into Light", "Merriweather", "Merriweather's sturdy serif body text balances the light, hand-drawn strokes of Shadows Into Light headings."),
    ],
    "Lilita One": [
        ("Lilita One", "Open Sans", "Open Sans gives a light, neutral body text that balances the fat, slightly condensed shapes of Lilita One headlines."),
        ("Lilita One", "Nunito", "Nunito's rounded terminals match the soft, friendly details of Lilita One for games, kids and snack brands."),
        ("Lilita One", "Lato", "Lato's warm sans keeps body copy readable under bold Lilita One titles on posters and event pages."),
        ("Lilita One", "Roboto", "Roboto adds a compact, plain body text, so heavy Lilita One headings carry all the personality."),
        ("Lilita One", "Source Sans 3", "Source Sans 3 is a clear humanist body face that keeps long copy calm below loud Lilita One headlines."),
    ],
    "Domine": [
        ("Domine", "Open Sans", "Open Sans gives a neutral sans for captions and interface text beside bold Domine headings on news sites."),
        ("Domine", "Roboto", "Roboto adds a compact grotesque for navigation and labels that does not compete with sturdy Domine headlines."),
        ("Montserrat", "Domine", "Montserrat's geometric headlines give a modern frame to Domine, a serif built for comfortable body text on screens."),
        ("Raleway", "Domine", "Raleway's elegant, thin display weights contrast with the solid, readable Domine body text in magazine layouts."),
        ("Oswald", "Domine", "Oswald's tall, condensed headlines pair with the friendly Domine text serif on newspaper and blog front pages."),
    ],
    "Asap": [
        ("Asap", "Merriweather", "Merriweather's sturdy serif body text adds contrast beneath Asap headings with their subtle rounded corners."),
        ("Asap", "Lora", "Lora's flowing serif text warms up pages headed in the compact, contemporary shapes of Asap."),
        ("Playfair Display", "Asap", "Playfair Display brings high-contrast headlines while Asap keeps body text clean and steady on screens."),
        ("Montserrat", "Asap", "Montserrat's wide geometric headings contrast with the narrower Asap body text in apps and product pages."),
        ("Roboto Slab", "Asap", "Roboto Slab gives firm slab serif headings that suit the practical, screen-first Asap body text."),
    ],
    "Questrial": [
        ("Questrial", "Lora", "Lora's calligraphic serif body text adds warmth below the clean, full-circle curves of Questrial headings."),
        ("Questrial", "Merriweather", "Merriweather is a sturdy screen serif that gives weight and contrast under light, single-weight Questrial titles."),
        ("Playfair Display", "Questrial", "Playfair Display adds elegant, high-contrast headings while Questrial keeps body text simple and modern."),
        ("Montserrat", "Questrial", "Montserrat supplies bold geometric headlines, which suits Questrial since it ships in a single regular weight for body text."),
        ("Libre Baskerville", "Questrial", "Libre Baskerville brings classic serif headings that contrast with the Swiss-influenced Questrial body text."),
    ],
    "Albert Sans": [
        ("Albert Sans", "Lora", "Lora's flowing serif text adds warmth below Albert Sans headings, a geometric sans inspired by Scandinavian design."),
        ("Albert Sans", "Source Serif 4", "Source Serif 4 gives a crisp editorial body text that contrasts with the clean geometry of Albert Sans headlines."),
        ("Fraunces", "Albert Sans", "Fraunces brings soft, characterful serif headings while Albert Sans keeps the body text calm and modern."),
        ("Playfair Display", "Albert Sans", "Playfair Display adds high-contrast serif headlines above the even, readable Albert Sans body text."),
        ("DM Serif Display", "Albert Sans", "DM Serif Display gives bold display headings that pair with Albert Sans on clean portfolio and interior design sites."),
    ],
    "Marcellus": [
        ("Marcellus", "Lato", "Lato's warm, clean sans keeps body text readable under elegant, Roman-inspired Marcellus headings."),
        ("Marcellus", "Open Sans", "Open Sans gives a neutral reading texture that lets the flared, inscriptional capitals of Marcellus stand out."),
        ("Marcellus", "Montserrat", "Montserrat's geometric body and subheads add a modern frame around classical Marcellus titles for spas and hotels."),
        ("Marcellus", "Raleway", "Raleway's thin, refined weights match the elegant mood of Marcellus headings on wedding and beauty sites."),
        ("Marcellus", "Lora", "Lora's flowing serif body text suits the classical, flared Marcellus headlines on editorial and literary pages."),
    ],
    "Geologica": [
        ("Geologica", "Source Serif 4", "Source Serif 4 adds a crisp text serif below Geologica headings, whose wide stance and large apertures stay clear."),
        ("Geologica", "Lora", "Lora's warm, calligraphic serif text gives contrast below the wide, constructed letterforms of Geologica headings."),
        ("Fraunces", "Geologica", "Fraunces brings soft, characterful serif headlines while Geologica, a serious text face, carries the body copy."),
        ("Playfair Display", "Geologica", "Playfair Display adds high-contrast headings above the even color and generous spacing of Geologica body text."),
        ("Space Grotesk", "Geologica", "Space Grotesk gives quirky technical headings that suit the rational, constructed Geologica body text."),
    ],
    "Onest": [
        ("Onest", "Lora", "Lora's warm serif body text adds contrast below the clean, modern Onest headings on blogs and newsletters."),
        ("Onest", "Source Serif 4", "Source Serif 4 gives a crisp editorial body text under simple, friendly Onest headlines."),
        ("Fraunces", "Onest", "Fraunces brings soft, characterful serif headings while Onest keeps interface and body text neutral."),
        ("Playfair Display", "Onest", "Playfair Display adds high-contrast serif headlines above the plain, readable Onest body text."),
        ("Unbounded", "Onest", "Unbounded's wide, rounded display headlines pair with the quieter Onest body text on startup and product pages."),
    ],
    "Archivo Narrow": [
        ("Archivo Narrow", "Archivo", "Archivo comes from the same Omnibus-Type family, so Archivo Narrow headings sit naturally above Archivo body text."),
        ("Archivo Narrow", "Merriweather", "Merriweather's sturdy serif body text balances tall, compact Archivo Narrow headlines on news pages."),
        ("Playfair Display", "Archivo Narrow", "Playfair Display gives elegant headlines while Archivo Narrow fits captions, tables and sidebars into tight space."),
        ("Oswald", "Archivo Narrow", "Oswald's bold condensed headings pair with the lighter Archivo Narrow text in sports and data-heavy layouts."),
        ("Roboto Slab", "Archivo Narrow", "Roboto Slab adds firm slab serif headings above compact Archivo Narrow text in dashboards and reports."),
    ],
    "Great Vibes": [
        ("Great Vibes", "Lato", "Lato's clean, warm sans keeps details readable under flowing Great Vibes names on wedding invitations."),
        ("Great Vibes", "Montserrat", "Montserrat's geometric capitals give a modern contrast to the formal, connected lowercase of Great Vibes."),
        ("Great Vibes", "Cormorant Garamond", "Cormorant Garamond's elegant serif text suits the flowing Great Vibes script on invitations and menus."),
        ("Great Vibes", "Raleway", "Raleway's thin, refined weights match the elegant mood of Great Vibes headings on beauty and wedding sites."),
        ("Great Vibes", "Open Sans", "Open Sans gives a neutral, readable body text, so ornate Great Vibes script stays limited to names and short titles."),
    ],
    "Varela Round": [
        ("Varela Round", "Lora", "Lora's flowing serif text adds contrast and warmth below the soft, rounded Varela Round headings."),
        ("Varela Round", "Open Sans", "Open Sans gives a neutral body text that keeps the friendly, rounded Varela Round headlines in focus."),
        ("Montserrat", "Varela Round", "Montserrat's bold geometric headings pair with Varela Round, whose single rounded weight reads gently in body text."),
        ("Playfair Display", "Varela Round", "Playfair Display brings elegant, high-contrast headlines above the soft, approachable Varela Round body text."),
        ("Fredoka", "Varela Round", "Fredoka's chunky, rounded headings share the friendly mood of Varela Round for kids, education and app brands."),
    ],
    "League Spartan": [
        ("League Spartan", "Libre Baskerville", "Libre Baskerville gives a classic, readable serif body text that contrasts with bold geometric League Spartan headings."),
        ("League Spartan", "Lora", "Lora's flowing serif text softens the strict geometry of heavy League Spartan headlines."),
        ("League Spartan", "Open Sans", "Open Sans gives a neutral, humanist body text that balances the circular forms of League Spartan titles."),
        ("League Spartan", "Source Serif 4", "Source Serif 4 adds an editorial serif body under League Spartan, which is based on early American geometric sans serifs."),
        ("League Spartan", "Work Sans", "Work Sans is a plain grotesque body face that keeps pages calm beneath bold League Spartan headlines."),
    ],
}

# --- copied from fonts-r2/src/build_r2.py (pair_group, itself from mgd-kit/build_sitewide.py) so groups match the guides
SERIFS = re.compile(r'serif(?! ?sans)|garamond|baskerville|bodoni|caslon|georgia|lora|merriweather|playfair|cormorant|fraunces|'
                    r'slab|crimson|libre caslon|spectral|newsreader|domine|bitter|cardo|vollkorn|alegreya(?! sans)|times|cambria|proza', re.I)
DISPLAY = re.compile(r'abril|bebas|archivo black|oswald|anton|lobster|pacifico|dancing|great vibes|alfa slab|fjalla|league gothic', re.I)


def pair_group(partner):
    cat = (GFM.get(GF.get(partner.lower(), ''), {}) or {}).get('category')
    if cat == 'Monospace':
        return 'Monospace Pairings'
    if cat == 'Handwriting':
        return 'Script Pairings'
    return 'Display Pairings' if DISPLAY.search(partner) else 'Serif Pairings' if SERIFS.search(partner) and not re.search(r'\bsans\b', partner, re.I) else 'Sans-Serif Pairings'
# --- end copy

BANNED = re.compile(r"delve|elevate|seamless|game-changer|unleash|tapestry|digital landscape|[—–]", re.I)
HEADING_ONLY = {"Display", "Handwriting"}

errors = []
out = {}
for font, rows in PAIRS.items():
    cat, designers, year = ABOUT[font]
    gfm = GFM.get(font)
    if not gfm:
        errors.append(f"{font}: not a Google Fonts family")
        continue
    if gfm["category"] != cat:
        errors.append(f"{font}: category {cat} != {gfm['category']}")
    if year is not None and (gfm.get("dateAdded") or "")[:4] != str(year):
        errors.append(f"{font}: year {year} != fonts.google.com {gfm.get('dateAdded')}")
    if len(rows) != 5:
        errors.append(f"{font}: {len(rows)} rows, want 5")
    heads = sum(1 for h, b, w in rows if h == font)
    if not (heads == 5 or heads <= 2):
        errors.append(f"{font}: heading in {heads} rows (want all 5 or at most 2)")
    if cat in HEADING_ONLY and heads != 5:
        errors.append(f"{font}: {cat} face must be the heading in every row")
    partners = []
    pairs = []
    for h, b, w in rows:
        if font not in (h, b) or h == b:
            errors.append(f"{font}: row {h} + {b} does not name the font once")
        partner = b if h == font else h
        partners.append(partner)
        if partner not in GFM:
            errors.append(f"{font}: partner {partner!r} is not an exact Google Fonts family name")
        if not (60 <= len(w) <= 200) or not w.endswith(".") or BANNED.search(w):
            errors.append(f"{font}: reason fails length / period / banned words: {w!r} ({len(w)})")
        if partner.split()[0].lower() not in w.lower() and font.split()[0].lower() not in w.lower():
            errors.append(f"{font}: reason names neither font: {w!r}")
        pairs.append({"heading": h, "body": b, "group": pair_group(partner), "why": w, "heading_gf": True, "body_gf": True})
    if len(set(partners)) != len(partners):
        errors.append(f"{font}: duplicate partner")
    out[font.lower()] = {"font": font, "page": None, "curated": True,
                         "about": {"category": cat, "designers": designers, "added": year}, "pairs": pairs}

if errors:
    sys.exit("\n".join(errors))

# Every Google Fonts family name, so the lookup can tell "Play" (a real family with no guide) from a partial "Play…" for Playfair Display.
families = sorted(GFM)
with open(OUT, "w", encoding="utf-8") as fh:
    fh.write("// GENERATED by build_font_pairings_curated.py (mcp-gaps-r1, 10-Nov-2026). Do not edit by hand.\n"
             "// Editorial pairings for 30 popular Google Fonts without an MGD guide yet (page: null); facts from google/fonts METADATA.pb.\n")
    fh.write("export const CURATED = " + json.dumps(out, ensure_ascii=False, separators=(",", ":")) + ";\n")
    fh.write("export const GF_FAMILIES = " + json.dumps("|".join(families), ensure_ascii=False) + ".split(\"|\");\n")
print(f"{len(out)} fonts, {sum(len(v['pairs']) for v in out.values())} pairs, {len(families)} Google Fonts names, "
      f"{os.path.getsize(OUT):,} bytes -> {OUT}")
