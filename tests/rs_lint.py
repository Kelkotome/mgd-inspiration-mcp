#!/usr/bin/env python3
"""Content gate for restaurant template sets (7-Nov-2026, third industry). Shares GEN, REAL, DOMAIN and CLAIMS with tests/n13_lint.py, plus:
  food-brand   real chains, delivery and booking platforms, guides, drinks brands and protected food names (no real menus or brands)
  award        awards, ratings, "best", "famous", "authentic"
  hygiene      hygiene ratings, inspections, certification
  diet         dietary, allergen and free-from claims. Allowed only inside the engine's sample dietary key (an <aside> whose text says
               "Sample") or in a sentence that itself says "sample". Dietary codes on dishes (V, VG, GFA) are fine: the key explains them.
  health       health claims about food
  alcohol      promotions of excess (bottomless, unlimited, happy hour)
  review       testimonials and star ratings
Every page also needs: a fictional notice, a sample-content line, the sample dietary key sentence where a menu with codes is shown,
phones in the fictional (555) 01xx range, .example email, no external images. Percentages are allowed only inside tables.
Usage: python3 tests/rs_lint.py [niche ...]   (RS_LINT_OUT=<dir> lints another output folder, for example the hand-built signatures)
Exit 1 on any failure."""
import glob, html, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.environ.get("RS_LINT_OUT") or os.path.join(HERE, "..", "ui-screens", "out-hc")
sys.path.insert(0, os.path.join(HERE, "..", "ui-screens"))
src = open(os.path.join(HERE, "n13_lint.py"), encoding="utf-8").read(); ns = {}
for name in ("REAL", "CLAIMS", "GEN", "DOMAIN"): ns[name] = eval(re.search(rf'^{name} = (r".*")\s*$', src, re.M).group(1))
NICHES = ["restaurant", "coffee-shop", "bakery", "pizzeria", "bar", "catering", "food-truck", "fine-dining"]
FOOD_BRAND = (r"\b(McDonald'?s|Starbucks|Domino'?s|Pizza Hut|Papa John'?s|KFC|Subway|Burger King|Wendy'?s|Taco Bell|Chipotle|Nando'?s|Costa|Pret|Greggs|Dunkin'?|"
  r"Krispy Kreme|Tim Hortons|Shake Shack|Five Guys|Wagamama|Itsu|Wetherspoons?|Michelin|Zagat|Yelp|OpenTable|Resy|Tock|SevenRooms|TheFork|Deliveroo|Uber ?Eats|"
  r"DoorDash|Grubhub|Just Eat|Postmates|Toast|Square|Tripadvisor|Coca[- ]Cola|Coke|Pepsi|Nutella|Aperol|Guinness|Heineken|Peroni|Stella Artois|Budweiser|Corona|"
  r"Mo[eë]t|Hennessy|Jameson|Absolut|Smirnoff|Bacardi|Nespresso|Illy|Lavazza|KitKat|Oreo|Hershey'?s?|Cadbury|Heinz|Tabasco|Le Cordon Bleu|"
  r"Champagne|Prosecco|Cava|Parmigiano|Parmesan|Grana Padano|Prosciutto di Parma|Parma ham|Roquefort|Gorgonzola|Feta|Stilton|Manchego|Camembert|Cognac|Scotch|"
  r"Bourbon|Tequila|Mezcal|San Marzano|Kobe|Wagyu|Neapolitan|Napoletana)\b")
AWARD = r"\b(awards?|award[- ]winning|michelin|starred|voted|rated|ratings?|famous|world[- ]famous|legendary|authentic|best (\w+ )?(in|around|of)\b|the best\b|#1|number one|top[- ]rated|five[- ]star|5[- ]star)"
HYGIENE = r"\b(hygiene|food safety|inspect\w*|inspection|grade a|health (code|department|rating|inspector)|certif\w*|accredit\w*|scores? on the doors|haccp|licensed kitchen)\b"
DIET = r"\b(gluten[- ]free|nut[- ]free|peanut[- ]free|dairy[- ]free|egg[- ]free|allergen[- ]free|free[- ]from|coeliac|celiac|safe for|halal|kosher|organic|fair[- ]?trade|free[- ]range|grass[- ]fed|non[- ]gmo|sugar[- ]free|low[- ]calorie|low[- ]fat|keto|paleo|vegan|vegetarian|plant[- ]based|made without gluten)\b"
HEALTH = r"\b(healthy|healthier|superfoods?|boosts?|immun\w*|detox\w*|cleanse|nutritionist|good for (you|your)|guilt[- ]free|wellness|antioxidants?|probiotic\w*)\b"
ALCOHOL = r"\b(bottomless|unlimited (drinks|refills|wine|beer|cocktails)|all[- ]you[- ]can[- ]drink|happy hour|two[- ]for[- ]one|2[- ]for[- ]1|shots? for)\b"
REVIEW = r"(★|\breviews?\b|\btestimonials?\b|\bwhat (our )?(guests|diners|customers|clients|regulars|couples) say\b|\bguest notes\b|\bstars?\b)"
SAMPLE_KEY = "Sample labels. Before you publish, check every dish's allergens with your kitchen and follow the allergen rules where you trade."
BLOCK = re.compile(r"</?(p|li|td|th|h[1-6]|summary|div|section|article|aside|header|footer|nav|ul|ol|table|tr|form|label|button|option|legend|span class=\"rv-slot[^\"]*\"|b|figcaption)\b[^>]*>", re.I)
def texts(path):
    s = open(path, encoding="utf-8").read(); body = s.split("<body>", 1)[-1]
    body = re.sub(r"<style.*?</style>|<svg.*?</svg>|<script.*?</script>", " ", body, flags=re.S)
    plain = html.unescape(re.sub(r"<[^>]+>", " ", body))
    notab = html.unescape(re.sub(r"<[^>]+>", " ", re.sub(r"<table.*?</table>", " ", body, flags=re.S)))
    # the engine's sample dietary key: an <aside> that says Sample. Its words are labelled samples by construction.
    keyless = re.sub(r"<aside[^>]*>(?:(?!</aside>).)*?Sample(?:(?!</aside>).)*?</aside>", " ", body, flags=re.S)
    chunks = [html.unescape(re.sub(r"<[^>]+>", " ", c)).strip() for c in BLOCK.split(keyless)]
    sentences = [x for c in chunks if c for x in re.split(r"(?<=[.!?])\s+", re.sub(r"\s+", " ", c)) if x.strip()]
    return plain, notab, sentences, s, body
fails = 0; want = sys.argv[1:] or NICHES; seen = 0
for d in sorted(glob.glob(os.path.join(OUT, "*-web-*"))):
    base = os.path.basename(d); n = next((x for x in sorted(want, key=len, reverse=True) if base.startswith(x + "-website-")), None)
    if not n: continue
    seen += 1; txt, notab, sents, raw, body = texts(os.path.join(d, "index.html")); errs = []
    for name, rx, t, fl in [("general", ns["GEN"], txt, re.I), ("real-name", ns["REAL"], txt, 0), ("food-brand", FOOD_BRAND, txt, re.I), ("domain", ns["DOMAIN"], txt, re.I), ("claim", ns["CLAIMS"], notab, re.I),
                            ("award", AWARD, txt, re.I), ("hygiene", HYGIENE, txt, re.I), ("health", HEALTH, txt, re.I), ("alcohol", ALCOHOL, txt, re.I), ("review", REVIEW, txt, re.I)]:
        for m in re.finditer(rx, t, flags=fl): errs.append(f"{name}: ...{t[max(0,m.start()-40):m.end()+30].strip()}...".replace("\n", " "))
    for s in sents:
        if re.search(DIET, s, re.I) and not re.search(r"\bsample\b", s, re.I): errs.append(f"diet claim not labelled sample: {s[:140]}")
    if re.search(r'<img|url\(http|src="http', re.sub(r"<link[^>]+>", "", raw)): errs.append("external image")
    if "@" in txt and not re.search(r"\.example\b", txt): errs.append("email not on .example")
    if re.search(r"\(\d{3}\) (?!01)", txt) or re.search(r"\((?!555)\d{3}\) \d{3}-", txt): errs.append("phone not in fictional (555) 01xx range")
    if "ictional" not in txt: errs.append("no fictional notice")
    if not re.search(r"sample (content|menu)", txt, re.I): errs.append("no sample-content line")
    if re.search(r'class="badge"', body) and ("-menu-" in base or "-reserve-" in base) and SAMPLE_KEY not in html.unescape(txt): errs.append("menu with dietary codes but no sample dietary key")
    print(("FAIL " if errs else "ok   ") + base, f"({len(errs)})")
    for e in errs[:12]: print("   ", e)
    fails += bool(errs)
if not seen: print("no pages found"); sys.exit(1)
sys.exit(1 if fails else 0)
