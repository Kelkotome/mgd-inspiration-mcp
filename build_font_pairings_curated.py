#!/usr/bin/env python3
"""build_font_pairings_curated.py (10-Nov-2026, mcp-gaps-r1; extended 11-Nov-2026, mcp-gaps-r2): editorial pairings for 67 Google Fonts
that had no pairing guide. r1 added 30; mcp-gaps-r2 (11-Nov-2026) added 37: the 7 real-user zeros of 10-11 Nov (Forum, Prata,
Bellefair, Tenor Sans, Gilda Display, Libre Caslon Text, Italiana) + 30 popular display/serif families (see the r2 note below).

  python3 -I build_font_pairings_curated.py [GF_META_MIN_JSON] [OUT=src/font_pairings_curated.js]

GF_META_MIN_JSON defaults to deploy-bundle-2026-11-09/fonts-r2/src/gf_meta_min.json (every Google Fonts family with its category,
designers and fonts.google.com dateAdded, saved for fonts round 2).

Why: every font in the mcp_calls history now returns pairs (fonts r2 shipped all 10 of the 5-to-9-Nov zeros), so the next 30 came from
the Google Fonts popularity ranking, the same way round 2 chose its non-gap fonts: Latin-script, not Noto, no guide and no partner-only
answer today (live they return "0 results"), skipping novelty faces (Black Ops One, Share Tech, Smooch Sans, Changa One, Lobster Two,
Zeyada, Slabo 27px, Bungee) and width siblings of a font that has a guide (Barlow Semi Condensed, PT Sans Narrow, Saira Condensed).
r2: the 30 popular ones are display + serif families from the same ranking that answered "0 results" (Latin, not Noto), skipping
novelty faces (Black Ops One, Bungee, Kablammo), non-Latin-first families, and fonts that already get a partner-only answer
(Spectral, Crimson Pro) so their cited answers stay. "Play" stays without an entry: it is the guard probe that must stay "0 results".

Same pairing rules as the round-2 writer brief (fonts-r2/src/BRIEF.md), enforced below:
- every partner is an exact Google Fonts family name, never the font itself; widely used partners
- roles are honest: display, script and heading-only faces are the heading in all 5 rows; otherwise the font is the heading in at
  most 2 rows (the same shape the article parser keeps)
- each reason is one stand-alone sentence of 60 to 200 characters ending with a period, names the partner or its quality, no em or en
  dashes, none of the banned words, American spelling
- facts (category, designers, year) come only from google/fonts METADATA.pb and fonts.google.com metadata; a year only when
  METADATA.pb date_added and fonts.google.com dateAdded agree (Dosis 2019 vs 2012, Faustina 2016 vs 2017, Libre Caslon Text 2020 vs
  2013 get none)
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
    # --- mcp-gaps-r2 (11-Nov-2026): 7 real-user zeros of 10-11 Nov, then 30 popular display/serif families. Designers from
    # google/fonts METADATA.pb; Libre Caslon Text has no year (METADATA.pb date_added 2020 vs fonts.google.com 2013).
    "Forum": ["Display", ["Denis Masharov"], 2011],
    "Prata": ["Serif", ["Cyreal"], 2011],
    "Bellefair": ["Serif", ["Nick Shinn", "Liron Lavi Turkenic"], 2017],
    "Tenor Sans": ["Sans Serif", ["Denis Masharov"], 2011],
    "Gilda Display": ["Serif", ["Eduardo Tunni"], 2012],
    "Libre Caslon Text": ["Serif", ["Pablo Impallari"], None],
    "Italiana": ["Sans Serif", ["Santiago Orozco"], 2012],
    "Titan One": ["Display", ["Rodrigo Fuenzalida"], 2012],
    "Fugaz One": ["Display", ["LatinoType"], 2011],
    "Sanchez": ["Serif", ["Daniel Hernandez"], 2012],
    "Righteous": ["Display", ["Astigmatic"], 2011],
    "Vollkorn": ["Serif", ["Friedrich Althausen"], 2010],
    "Cardo": ["Serif", ["David Perry"], 2011],
    "Arapey": ["Serif", ["Eduardo Tunni"], 2011],
    "Bree Serif": ["Serif", ["TypeTogether"], 2011],
    "DM Serif Text": ["Serif", ["Colophon Foundry"], 2019],
    "Alegreya": ["Serif", ["Juan Pablo del Peral", "HT Fonts"], 2011],
    "Gelasio": ["Serif", ["Eben Sorkin"], 2019],
    "Aleo": ["Serif", ["Alessio Laiso"], 2018],
    "Libre Caslon Display": ["Serif", ["Impallari Type"], 2017],
    "Patua One": ["Display", ["LatinoType"], 2011],
    "STIX Two Text": ["Serif", ["Tiro Typeworks", "Ross Mills", "John Hudson", "Paul Hanslow"], 2021],
    "Quattrocento": ["Serif", ["Impallari Type"], 2012],
    "Gabarito": ["Display", ["Naipe Foundry", "Leandro Assis", "Álvaro Franca", "Felipe Casaprima"], 2023],
    "Playball": ["Display", ["Robert Leuschke"], 2011],
    "Ultra": ["Serif", ["Astigmatic"], 2011],
    "Sorts Mill Goudy": ["Serif", ["Barry Schwartz"], 2011],
    "Concert One": ["Display", ["Johan Kallas", "Mihkel Virkus"], 2011],
    "Limelight": ["Display", ["Nicole Fally", "Sorkin Type"], 2011],
    "Kreon": ["Serif", ["Julia Petretta"], 2011],
    "Cantata One": ["Serif", ["Joana Correia"], 2012],
    "Frank Ruhl Libre": ["Serif", ["Yanek Iontef"], 2016],
    "Calistoga": ["Display", ["Yvonne Schüttler", "Sorkin Type", "Eben Sorkin"], 2019],
    "Hepta Slab": ["Serif", ["Mike LaGattuta"], 2018],
    "Petrona": ["Serif", ["Ringo R. Seeber"], 2020],
    "Gloock": ["Serif", ["Duarte Pinto"], 2023],
    "Baskervville": ["Serif", ["ANRT"], 2019],
    # --- end mcp-gaps-r2
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
    # --- mcp-gaps-r2 (11-Nov-2026): the 7 real-user zeros (wedding / luxury use where honest), then 30 popular display/serif families
    "Forum": [
        ("Forum", "Lato", "Lato's warm, even body text sits quietly under Forum, whose Roman inscriptional capitals suit wedding invitations and menus."),
        ("Forum", "Montserrat", "Montserrat gives a clean geometric body text whose wide forms balance the classical Roman proportions of Forum headings."),
        ("Forum", "EB Garamond", "EB Garamond is a readable old-style text serif that keeps the classical tone of Forum headings on formal stationery and menus."),
        ("Forum", "Open Sans", "Open Sans keeps dates, venues and RSVP details plain and legible below the stately, classical capitals of Forum."),
        ("Forum", "Raleway", "Raleway's light, airy weights set captions and navigation in a modern tone beside the Roman capitals of Forum titles."),
    ],
    "Prata": [
        ("Prata", "Lato", "Lato's soft, rounded body text tempers the sharp contrast and teardrop terminals of Prata headlines on boutique and wedding sites."),
        ("Prata", "Montserrat", "Montserrat's geometric body copy gives a clean modern frame to Prata, a high-contrast Didone style serif made for display sizes."),
        ("Prata", "Open Sans", "Open Sans is a neutral, readable body face that lets the fashion-magazine contrast of Prata headings carry the luxury feel."),
        ("Prata", "Raleway", "Raleway's thin, elegant sans weights suit captions and menus beside Prata headings in beauty, jewelry and bridal branding."),
        ("Prata", "Source Sans 3", "Source Sans 3 adds a calm humanist text face that stays readable at small sizes under the crisp hairlines of Prata."),
    ],
    "Bellefair": [
        ("Bellefair", "Montserrat", "Montserrat's sturdy geometric body text contrasts with the fine hairlines of Bellefair, a refined high-contrast serif for titles."),
        ("Bellefair", "Lato", "Lato keeps paragraphs warm and even while the slender, high-contrast letters of Bellefair give wedding pages a formal title line."),
        ("Bellefair", "Raleway", "Raleway's light, wide sans weights echo the airy elegance of Bellefair on invitations, menus and boutique hotel sites."),
        ("Bellefair", "Open Sans", "Open Sans supplies neutral, legible body text so the delicate Bellefair headings stay the focal point of the page."),
        ("Bellefair", "Josefin Sans", "Josefin Sans adds vintage geometric small text that suits the classic, refined tone of Bellefair headings on stationery."),
    ],
    "Tenor Sans": [
        ("Tenor Sans", "Cormorant Garamond", "Cormorant Garamond sets graceful serif text below Tenor Sans headings in spaced capitals, a common look for luxury brands."),
        ("Tenor Sans", "Lora", "Lora's calligraphic serif paragraphs add warmth beneath Tenor Sans headings, whose classical proportions read well in capitals."),
        ("Playfair Display", "Tenor Sans", "Playfair Display brings high-contrast headings, and the open, classically proportioned Tenor Sans keeps body text light and clear."),
        ("Cinzel", "Tenor Sans", "Cinzel's Roman inscriptional capitals make formal wedding headings, with Tenor Sans as a clean, elegant body text below them."),
        ("Great Vibes", "Tenor Sans", "Great Vibes adds a flowing script for names and titles, while Tenor Sans sets dates and details in a crisp, elegant sans."),
    ],
    "Gilda Display": [
        ("Gilda Display", "Lato", "Lato's warm, rounded body text softens the sharp contrast of Gilda Display headings on wedding and event pages."),
        ("Gilda Display", "Montserrat", "Montserrat adds a clean geometric body text that keeps the high-contrast Gilda Display titles feeling modern rather than fussy."),
        ("Gilda Display", "Raleway", "Raleway's light, stylish sans weights match the refined, delicate hairlines of Gilda Display on boutique and bridal sites."),
        ("Gilda Display", "Work Sans", "Work Sans is a plain grotesque for body and interface text that lets the elegant Gilda Display headings take the spotlight."),
        ("Gilda Display", "Karla", "Karla's slightly quirky grotesque body text gives a relaxed contrast to the formal, high-contrast letters of Gilda Display."),
    ],
    "Libre Caslon Text": [
        ("Libre Caslon Display", "Libre Caslon Text", "Libre Caslon Display is the high-contrast headline companion of Libre Caslon Text, drawn by the same designers for large sizes."),
        ("Playfair Display", "Libre Caslon Text", "Playfair Display gives sharp, high-contrast titles above Libre Caslon Text, a Caslon revival drawn for comfortable reading on screens."),
        ("Great Vibes", "Libre Caslon Text", "Great Vibes sets couple names in a formal script, and Libre Caslon Text carries the invitation wording in a classic, readable serif."),
        ("Libre Caslon Text", "Montserrat", "Montserrat's clean geometric sans handles captions, buttons and labels beside traditional Libre Caslon Text headings."),
        ("Libre Caslon Text", "Lato", "Lato gives a friendly, neutral sans for interface text so Libre Caslon Text can lead with its classic eighteenth-century character."),
    ],
    "Italiana": [
        ("Italiana", "Lato", "Lato's warm, sturdy body text balances the thin, high-contrast strokes of Italiana titles on fashion and wedding pages."),
        ("Italiana", "Montserrat", "Montserrat gives a solid geometric body text so the delicate, calligraphic Italiana headings read as the elegant accent."),
        ("Italiana", "Cormorant Garamond", "Cormorant Garamond adds an elegant serif text that matches the refined, hairline style of Italiana on bridal and beauty sites."),
        ("Italiana", "Open Sans", "Open Sans keeps details and long copy neutral and legible, since the light, single-weight Italiana works best at large sizes."),
        ("Italiana", "Nunito Sans", "Nunito Sans offers a soft, readable sans for paragraphs that complements the slender, graceful letterforms of Italiana."),
    ],
    "Titan One": [
        ("Titan One", "Open Sans", "Open Sans is a neutral, readable body text that lets the chunky, rounded letters of Titan One headlines do all the shouting."),
        ("Titan One", "Nunito", "Nunito's rounded terminals echo the soft, heavy shapes of Titan One, which suits playful brands, games and kids' products."),
        ("Titan One", "Roboto", "Roboto's compact grotesque body text calms pages headed in the bold, bubbly Titan One display face."),
        ("Titan One", "Poppins", "Poppins adds clean geometric body copy that keeps the friendly weight of Titan One titles from overwhelming the layout."),
        ("Titan One", "Lato", "Lato's warm, semi-rounded text matches the cheerful mood of Titan One headings without competing with their heavy strokes."),
    ],
    "Fugaz One": [
        ("Fugaz One", "Roboto", "Roboto's neutral body text balances the fast, slanted strokes of Fugaz One headings on sports and motoring pages."),
        ("Fugaz One", "Open Sans", "Open Sans gives an upright, readable text that contrasts with the heavy italic motion of Fugaz One titles."),
        ("Fugaz One", "Barlow", "Barlow's slightly rounded, road-sign style sans suits the speed and energy of Fugaz One headlines on racing and fitness sites."),
        ("Fugaz One", "Montserrat", "Montserrat's wide geometric body text steadies the forward-leaning, bold Fugaz One display lettering."),
        ("Fugaz One", "Source Sans 3", "Source Sans 3 is a clear humanist body face that keeps long copy calm under energetic, italic Fugaz One headings."),
    ],
    "Sanchez": [
        ("Sanchez", "Open Sans", "Open Sans gives a wide, friendly body text that sits comfortably under the clean, geometric slab serifs of Sanchez headings."),
        ("Sanchez", "Lato", "Lato's warm, rounded sans balances the sturdy slab shapes of Sanchez on blogs, recipes and small business sites."),
        ("Sanchez", "Work Sans", "Work Sans is a plain grotesque body face that lets the slab serifs of Sanchez headings carry the personality."),
        ("Sanchez", "Raleway", "Raleway's light, elegant sans weights add contrast to the solid, even strokes of Sanchez titles."),
        ("Sanchez", "Roboto", "Roboto supplies a compact, neutral body text for apps and dashboards that use Sanchez for friendly slab serif headings."),
    ],
    "Righteous": [
        ("Righteous", "Lato", "Lato's warm body text tones down the bold, Art Deco inspired geometry of Righteous headings on music and event pages."),
        ("Righteous", "Roboto", "Roboto is a neutral grotesque for body text that keeps pages calm under the rounded, retro letters of Righteous."),
        ("Righteous", "Poppins", "Poppins shares the geometric construction of Righteous at text sizes, giving posters and landing pages one consistent voice."),
        ("Righteous", "Open Sans", "Open Sans provides wide, readable paragraphs so the distinctive Righteous display shapes stay in headlines and logos."),
        ("Righteous", "Nunito", "Nunito's rounded terminals echo the soft curves of Righteous, a friendly match for gaming, food and entertainment brands."),
    ],
    "Vollkorn": [
        ("Montserrat", "Vollkorn", "Montserrat's geometric headlines give a modern frame to Vollkorn, a dark, sturdy text serif that reads well in long articles."),
        ("Playfair Display", "Vollkorn", "Playfair Display adds high-contrast display titles while the calmer, robust Vollkorn carries body text in books and blogs."),
        ("Oswald", "Vollkorn", "Oswald's condensed, bold headings contrast with the dark, robust serif texture of Vollkorn in editorial layouts."),
        ("Raleway", "Vollkorn", "Raleway's slim, stylish headings sit lightly over the dense, readable paragraphs of Vollkorn on portfolio and essay pages."),
        ("Vollkorn", "Source Sans 3", "Source Sans 3 is a clean humanist sans for captions and interface text beside bold Vollkorn headings, which have plenty of weight."),
    ],
    "Cardo": [
        ("Cinzel", "Cardo", "Cinzel's inscriptional capitals suit titles above Cardo, an old-style serif drawn for scholarly texts and classical languages."),
        ("Playfair Display", "Cardo", "Playfair Display brings sharp, high-contrast headings over the soft, bookish Renaissance texture of Cardo body text."),
        ("Montserrat", "Cardo", "Montserrat's clean geometric headings give a contemporary contrast to the traditional old-style forms of Cardo paragraphs."),
        ("Josefin Sans", "Cardo", "Josefin Sans adds elegant, vintage geometric headings that suit the literary, classical tone of Cardo body text."),
        ("Cardo", "Lato", "Lato gives a neutral, friendly sans for captions and menus beside Cardo headings on museum, academic and poetry sites."),
    ],
    "Arapey": [
        ("Arapey", "Lato", "Lato's warm body text balances the soft, Bodoni inspired contrast of Arapey headings on wedding and lifestyle pages."),
        ("Arapey", "Montserrat", "Montserrat gives a clean geometric body text that keeps the graceful, high-contrast Arapey titles feeling current."),
        ("Arapey", "Open Sans", "Open Sans is a neutral, readable body face that lets the elegant italic and roman of Arapey stand out in headings."),
        ("Arapey", "Raleway", "Raleway's light, airy sans weights match the refined, romantic feel of Arapey on invitations and boutique sites."),
        ("Arapey", "Source Sans 3", "Source Sans 3 adds a calm humanist text face that stays readable under the delicate, Bodoni style details of Arapey."),
    ],
    "Bree Serif": [
        ("Bree Serif", "Open Sans", "Open Sans keeps body text neutral and readable under the friendly, upright italic flavor of Bree Serif headings."),
        ("Bree Serif", "Lato", "Lato's warm, rounded sans complements the soft slab serifs of Bree Serif on blogs, education and children's sites."),
        ("Bree Serif", "Roboto", "Roboto gives compact, clean body text that lets the cheerful slab shapes of Bree Serif lead the page."),
        ("Bree Serif", "Source Sans 3", "Source Sans 3 is a clear humanist body face that keeps long copy calm beside chunky, approachable Bree Serif titles."),
        ("Bree Serif", "Nunito", "Nunito's rounded terminals match the friendly, informal tone of Bree Serif headings for food, family and community brands."),
    ],
    "DM Serif Text": [
        ("DM Serif Text", "DM Sans", "DM Sans is the low-contrast sans from the same DM family, so it sits naturally under DM Serif Text in subheads and body copy."),
        ("DM Serif Text", "Inter", "Inter's neutral, tall x-height body text contrasts cleanly with the sturdy, high-contrast strokes of DM Serif Text headings."),
        ("DM Serif Text", "Lato", "Lato's warm sans paragraphs soften pages that use DM Serif Text for confident editorial headings and pull quotes."),
        ("DM Serif Text", "Work Sans", "Work Sans gives a plain grotesque body text that keeps the classic transitional shapes of DM Serif Text in focus."),
        ("DM Serif Text", "Open Sans", "Open Sans is a wide, readable body face that balances the heavier, bookish weight of DM Serif Text titles."),
    ],
    "Alegreya": [
        ("Alegreya Sans", "Alegreya", "Alegreya Sans is the humanist sans companion of Alegreya with the same calligraphic rhythm, so headings and text feel related."),
        ("Playfair Display", "Alegreya", "Playfair Display adds high-contrast titles above Alegreya, a lively calligraphic serif designed for long literary texts."),
        ("Montserrat", "Alegreya", "Montserrat's geometric headings give a modern contrast to the dynamic, pen-shaped strokes of Alegreya body text."),
        ("Work Sans", "Alegreya", "Work Sans gives plain, sturdy headings and labels that let the expressive Alegreya text serif carry the reading."),
        ("Alegreya", "Lato", "Lato gives captions and interface text a neutral sans beside Alegreya headings, whose dynamic strokes add character."),
    ],
    "Gelasio": [
        ("Montserrat", "Gelasio", "Montserrat's geometric headings sit over Gelasio, a free serif metric-compatible with Georgia, so it reads like familiar body text."),
        ("Playfair Display", "Gelasio", "Playfair Display adds high-contrast titles while the sturdy, screen-friendly Gelasio keeps long articles readable."),
        ("Poppins", "Gelasio", "Poppins gives bold, clean geometric headings that contrast well with the traditional serif texture of Gelasio body text."),
        ("Inter", "Gelasio", "Inter suits headings and interface text on product blogs where Gelasio carries the long-form paragraphs."),
        ("Gelasio", "Open Sans", "Open Sans handles captions, forms and navigation beside Gelasio headings, a combination that stays neutral and clear."),
    ],
    "Aleo": [
        ("Aleo", "Lato", "Lato is the natural match: Aleo was designed as a slab serif companion to Lato, so the two share proportions and warmth."),
        ("Aleo", "Open Sans", "Open Sans gives neutral, readable body text below the soft, semi-rounded slab serifs of Aleo headings."),
        ("Aleo", "Roboto", "Roboto's compact grotesque body text keeps apps and dashboards clean under contemporary Aleo slab serif titles."),
        ("Aleo", "Source Sans 3", "Source Sans 3 is a clear humanist sans that keeps long copy calm beside the friendly, rounded slabs of Aleo."),
        ("Aleo", "Montserrat", "Montserrat's wide geometric body text contrasts with the slightly narrower, warm slab forms of Aleo headings."),
    ],
    "Libre Caslon Display": [
        ("Libre Caslon Display", "Libre Caslon Text", "Libre Caslon Text is the readable companion of Libre Caslon Display, drawn for body sizes with lower contrast and sturdier serifs."),
        ("Libre Caslon Display", "Lato", "Lato's warm sans body text balances the sharp, high-contrast Caslon shapes of Libre Caslon Display headlines."),
        ("Libre Caslon Display", "Montserrat", "Montserrat adds clean geometric paragraphs that make classic Libre Caslon Display titles feel modern on luxury and editorial sites."),
        ("Libre Caslon Display", "Raleway", "Raleway's light, refined sans weights suit captions beside the delicate hairlines of Libre Caslon Display on wedding pages."),
        ("Libre Caslon Display", "Source Sans 3", "Source Sans 3 is a calm humanist text face that keeps body copy readable under elegant Libre Caslon Display headings."),
    ],
    "Patua One": [
        ("Patua One", "Open Sans", "Open Sans keeps body text neutral and legible under the heavy, soft-cornered slab serifs of Patua One headlines."),
        ("Patua One", "Lato", "Lato's warm, rounded sans matches the friendly mood of Patua One titles on food, travel and community sites."),
        ("Patua One", "Roboto", "Roboto supplies compact, clean body copy that lets the chunky Patua One display slab carry the branding."),
        ("Patua One", "Cabin", "Cabin's humanist sans body text has a relaxed warmth that suits the rounded, approachable slabs of Patua One."),
        ("Patua One", "Nunito", "Nunito's rounded terminals echo the soft details of Patua One headings for playful, informal brands."),
    ],
    "STIX Two Text": [
        ("Source Sans 3", "STIX Two Text", "Source Sans 3 gives clear humanist headings over STIX Two Text, a Times style serif made for scientific and technical publishing."),
        ("Inter", "STIX Two Text", "Inter's neutral sans headings and labels pair with the traditional, compact STIX Two Text body in research and documentation."),
        ("IBM Plex Sans", "STIX Two Text", "IBM Plex Sans adds engineered, technical headings that suit STIX Two Text papers, journals and math-heavy pages."),
        ("Montserrat", "STIX Two Text", "Montserrat's wide geometric headings contrast with the narrow, economical letters of STIX Two Text in long articles."),
        ("Libre Franklin", "STIX Two Text", "Libre Franklin gives confident, newsy sans headings above STIX Two Text, a pairing that recalls classic journal layouts."),
    ],
    "Quattrocento": [
        ("Quattrocento", "Quattrocento Sans", "Quattrocento Sans is the sans companion of Quattrocento by the same designers, so captions and text share its classic proportions."),
        ("Quattrocento", "Lato", "Lato's warm body text balances the wide, classical letters of Quattrocento headings on wedding and portfolio pages."),
        ("Quattrocento", "Open Sans", "Open Sans keeps paragraphs neutral and readable below Quattrocento, an elegant serif inspired by early Italian printing."),
        ("Quattrocento", "Raleway", "Raleway's light, refined sans weights suit menus and captions beside the formal, generous shapes of Quattrocento titles."),
        ("Quattrocento", "Source Sans 3", "Source Sans 3 adds a calm humanist text face that does not compete with the classical Quattrocento headings above it."),
    ],
    "Gabarito": [
        ("Gabarito", "Inter", "Inter's neutral, tall x-height body text keeps product pages calm under the bold, geometric shapes of Gabarito headings."),
        ("Gabarito", "Source Serif 4", "Source Serif 4 adds a crisp, readable serif body that contrasts with the round geometric forms of Gabarito titles."),
        ("Gabarito", "DM Sans", "DM Sans is a low-contrast geometric text face that shares the friendly construction of Gabarito at body sizes."),
        ("Gabarito", "Lora", "Lora's soft, calligraphic serif paragraphs warm up pages headed in the confident, heavy weights of Gabarito."),
        ("Gabarito", "Open Sans", "Open Sans gives a wide, neutral reading texture that lets punchy Gabarito headlines lead startup and app sites."),
    ],
    "Playball": [
        ("Playball", "Open Sans", "Open Sans keeps body text plain and readable under Playball, a lively script that recalls vintage sports lettering."),
        ("Playball", "Lato", "Lato's warm, rounded sans suits the cheerful, looping Playball script on cafe, bakery and party pages."),
        ("Playball", "Montserrat", "Montserrat's clean geometric body text contrasts with the flowing, slanted letters of Playball headings and logos."),
        ("Playball", "Roboto", "Roboto supplies neutral, compact paragraphs so the retro Playball script stays a headline and logo accent."),
        ("Playball", "Raleway", "Raleway's light, stylish sans weights pair with the swashy Playball script on invitations and event flyers."),
    ],
    "Ultra": [
        ("Ultra", "Open Sans", "Open Sans gives neutral, readable body text under Ultra, an extremely heavy serif with tiny counters made for big headlines."),
        ("Ultra", "Lato", "Lato's warm sans paragraphs balance the black, poster-style weight of Ultra titles on restaurant and event pages."),
        ("Ultra", "Roboto", "Roboto's compact grotesque body text keeps pages tidy beneath loud, high-impact Ultra headings."),
        ("Ultra", "Source Sans 3", "Source Sans 3 is a light, humanist body face that leaves room for the dense, chunky serifs of Ultra in headlines."),
        ("Ultra", "Montserrat", "Montserrat's clean geometric text contrasts with the fat, poster-style feel of Ultra display lettering."),
    ],
    "Sorts Mill Goudy": [
        ("Playfair Display", "Sorts Mill Goudy", "Playfair Display adds high-contrast titles above Sorts Mill Goudy, a revival of Goudy Oldstyle with warm, bookish text."),
        ("Cinzel", "Sorts Mill Goudy", "Cinzel's classical capitals make formal headings over the old-style Sorts Mill Goudy body text on invitations and books."),
        ("Montserrat", "Sorts Mill Goudy", "Montserrat's geometric headings give a modern contrast to the soft, traditional Goudy shapes of Sorts Mill Goudy."),
        ("Josefin Sans", "Sorts Mill Goudy", "Josefin Sans adds vintage geometric headings that suit the early twentieth-century character of Sorts Mill Goudy."),
        ("Sorts Mill Goudy", "Lato", "Lato gives a neutral, friendly sans for captions and menus beside Sorts Mill Goudy headings on literary sites."),
    ],
    "Concert One": [
        ("Concert One", "Open Sans", "Open Sans keeps body text wide and readable under the bold, rounded letters of Concert One headlines."),
        ("Concert One", "Roboto", "Roboto's compact grotesque body text calms pages headed in the friendly, heavy Concert One display face."),
        ("Concert One", "Lato", "Lato's warm sans matches the cheerful tone of Concert One titles on kids, games and event pages."),
        ("Concert One", "Nunito", "Nunito's rounded terminals echo the soft geometric shapes of Concert One for playful, approachable brands."),
        ("Concert One", "Source Sans 3", "Source Sans 3 is a clear humanist text face that keeps long copy calm below chunky Concert One headings."),
    ],
    "Limelight": [
        ("Limelight", "Lato", "Lato's warm, even body text balances the high-contrast, Art Deco glamour of Limelight headings on event and cocktail pages."),
        ("Limelight", "Montserrat", "Montserrat's geometric body text shares the 1920s and 1930s mood of Limelight while staying readable at small sizes."),
        ("Limelight", "Raleway", "Raleway's slim, elegant sans weights suit the theatrical, Art Deco style of Limelight on Gatsby themed invitations."),
        ("Limelight", "Open Sans", "Open Sans keeps paragraphs neutral and legible so the bold, stylized Limelight lettering stays in titles and logos."),
        ("Limelight", "Poppins", "Poppins adds clean geometric body copy that frames the dramatic contrast of Limelight headlines on posters and menus."),
    ],
    "Kreon": [
        ("Kreon", "Open Sans", "Open Sans gives neutral, wide body text that sits well under the simple, rounded slab serifs of Kreon headings."),
        ("Kreon", "Lato", "Lato's warm sans complements the friendly, light-footed slabs of Kreon on blogs, magazines and recipe sites."),
        ("Kreon", "Roboto", "Roboto supplies compact, clean paragraphs for apps and docs that use Kreon for approachable slab serif titles."),
        ("Kreon", "Source Sans 3", "Source Sans 3 is a clear humanist body face that keeps long copy readable beside the soft slabs of Kreon headings."),
        ("Kreon", "Nunito Sans", "Nunito Sans offers a soft, plain sans for body text that matches the relaxed, rounded tone of Kreon."),
    ],
    "Cantata One": [
        ("Cantata One", "Lato", "Lato's warm body text balances the wide, high-contrast letters of Cantata One headings on restaurant and event pages."),
        ("Cantata One", "Open Sans", "Open Sans keeps paragraphs neutral and readable so the bold Cantata One display serif can lead the page."),
        ("Cantata One", "Montserrat", "Montserrat's geometric sans body text gives a modern contrast to the classic, high-contrast shapes of Cantata One."),
        ("Cantata One", "Raleway", "Raleway's light, elegant sans suits captions and menus beside the generous, formal Cantata One titles."),
        ("Cantata One", "Source Sans 3", "Source Sans 3 adds a calm humanist text face that stays clear at small sizes under Cantata One headlines."),
    ],
    "Frank Ruhl Libre": [
        ("Montserrat", "Frank Ruhl Libre", "Montserrat's geometric headings give a modern frame to Frank Ruhl Libre, a sturdy text serif with matching Hebrew letters."),
        ("Playfair Display", "Frank Ruhl Libre", "Playfair Display adds sharp, high-contrast titles while the solid, readable Frank Ruhl Libre carries long articles."),
        ("Oswald", "Frank Ruhl Libre", "Oswald's condensed, bold headlines contrast with the traditional, newspaper-like texture of Frank Ruhl Libre body text."),
        ("Frank Ruhl Libre", "Open Sans", "Open Sans gives a neutral sans for captions and interface text beside bold Frank Ruhl Libre headings on news sites."),
        ("Frank Ruhl Libre", "Heebo", "Heebo is a clean sans with Hebrew and Latin, so it suits bilingual pages where Frank Ruhl Libre sets the headings."),
    ],
    "Calistoga": [
        ("Calistoga", "Inter", "Inter's neutral, tall x-height body text balances the soft, chunky letters of Calistoga headlines on product pages."),
        ("Calistoga", "Open Sans", "Open Sans keeps body copy wide and readable under the friendly, heavy Calistoga display face."),
        ("Calistoga", "Lato", "Lato's warm sans matches the retro, approachable feel of Calistoga titles on cafe, bakery and lifestyle brands."),
        ("Calistoga", "DM Sans", "DM Sans is a low-contrast geometric text face that keeps pages clean below the bold, rounded shapes of Calistoga."),
        ("Calistoga", "Nunito", "Nunito's rounded terminals echo the soft curves of Calistoga for playful, cheerful branding and packaging."),
    ],
    "Hepta Slab": [
        ("Hepta Slab", "Open Sans", "Open Sans gives neutral, readable body text under Hepta Slab headings, whose weight axis runs from hairline to heavy."),
        ("Hepta Slab", "Inter", "Inter's tall x-height body text keeps interfaces calm beneath bold Hepta Slab titles on product and docs sites."),
        ("Hepta Slab", "Lato", "Lato's warm, rounded sans balances the crisp, square slab serifs of Hepta Slab in editorial layouts."),
        ("Hepta Slab", "Roboto", "Roboto supplies compact, neutral paragraphs that let the strong slab structure of Hepta Slab carry the headlines."),
        ("Hepta Slab", "Source Sans 3", "Source Sans 3 is a clear humanist body face that contrasts with the mechanical, even slabs of Hepta Slab headings."),
    ],
    "Petrona": [
        ("Montserrat", "Petrona", "Montserrat's geometric headings sit over Petrona, a versatile text serif with a wide weight range for long reading."),
        ("Playfair Display", "Petrona", "Playfair Display brings high-contrast titles while the calmer, sturdy Petrona keeps body text even in articles and books."),
        ("Inter", "Petrona", "Inter's neutral sans headings and labels pair with Petrona paragraphs on blogs and product docs that want a warmer read."),
        ("Raleway", "Petrona", "Raleway's slim, stylish headings sit lightly above the dense, readable serif texture of Petrona body text."),
        ("Petrona", "Work Sans", "Work Sans is a plain grotesque for captions and interface text beside bold Petrona headings in editorial layouts."),
    ],
    "Gloock": [
        ("Gloock", "Inter", "Inter's neutral, tall x-height body text balances the dramatic contrast of Gloock headlines on modern editorial sites."),
        ("Gloock", "DM Sans", "DM Sans gives clean, low-contrast geometric paragraphs that let the sharp, heavy Gloock serif carry the page."),
        ("Gloock", "Lato", "Lato's warm sans body text softens the bold, high-contrast letters of Gloock on fashion, food and lifestyle pages."),
        ("Gloock", "Work Sans", "Work Sans is a plain grotesque that keeps body and interface text quiet under striking Gloock headings."),
        ("Gloock", "Source Serif 4", "Source Serif 4 is a readable text serif that keeps a classic, bookish tone below the display contrast of Gloock."),
    ],
    "Baskervville": [
        ("Playfair Display", "Baskervville", "Playfair Display adds high-contrast titles above Baskervville, a Baskerville revival with crisp transitional text."),
        ("Montserrat", "Baskervville", "Montserrat's geometric headings give a modern contrast to the classic, refined serif texture of Baskervville paragraphs."),
        ("Cinzel", "Baskervville", "Cinzel's inscriptional capitals make formal headings over Baskervville body text on invitations and literary sites."),
        ("Great Vibes", "Baskervville", "Great Vibes sets names in a formal script while Baskervville carries the invitation wording in a classic, readable serif."),
        ("Baskervville", "Lato", "Lato gives a neutral, friendly sans for captions and menus beside Baskervville headings in books and editorial design."),
    ],
    # --- end mcp-gaps-r2
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
    fh.write("// GENERATED by build_font_pairings_curated.py (mcp-gaps-r1, 10-Nov-2026; mcp-gaps-r2, 11-Nov-2026). Do not edit by hand.\n"
             "// Editorial pairings for 67 Google Fonts without an MGD guide yet (page: null): r1 added 30; mcp-gaps-r2 added 37\n"
             "// (7 real zeros from 10-11 Nov + 30 popular display/serif). Facts from google/fonts METADATA.pb.\n")
    fh.write("export const CURATED = " + json.dumps(out, ensure_ascii=False, separators=(",", ":")) + ";\n")
    fh.write("export const GF_FAMILIES = " + json.dumps("|".join(families), ensure_ascii=False) + ".split(\"|\");\n")
print(f"{len(out)} fonts, {sum(len(v['pairs']) for v in out.values())} pairs, {len(families)} Google Fonts names, "
      f"{os.path.getsize(OUT):,} bytes -> {OUT}")
