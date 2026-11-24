#!/usr/bin/env python3
"""Content gate for automotive template sets (templates r8, 25-Nov-2026: automotive, staged). Modelled on tests/ed_lint.py (r7); shares GEN, REAL,
DOMAIN and CLAIMS with tests/n13_lint.py (CLAIMS already bans percentages outside tables, guarantees, "proven", "#1" and invented counts), plus:
  brand       real car makers and model names, tyre, oil, parts, detailing-product and coating brands, dealer groups, repair, body, tyre, wash and
              rental chains, roadside clubs and insurers, valuation, history and listing sites, trade bodies and certification schemes,
              licensing and inspection authorities, review sites and social platforms
  credential  licensed, registered, certified, accredited, insured, bonded, approved (repairer/dealer), authorised/franchised dealer,
              factory-trained, OEM, inspected/inspection, MOT, emissions test, roadworthy. Allowed only in a sentence that says "add your own" or "sample"
  finance     finance, financing, credit, loan, APR, interest, lease, monthly payment, down payment, "per month", pre-approved, "buy here pay here".
              Same allowance (vehicle finance is regulated: the templates carry no finance offers)
  outcome     guarantees, warranties, lifetime, permanent, "like new", showroom/factory finish, scratch-proof, self-healing, increases resale value,
              save money, lowest/cheapest/best price, price match, top dollar, "no haggle", "pass first time". Same allowance
  safety      safest, completely/fully safe, safe to drive, eco-friendly, environmentally friendly, biodegradable, non-toxic, chemical-free,
              carbon neutral, water-saving claims (policies are owner lines, not claims)
  award       awards, ratings, best, trusted, leading, top, expert(s), specialist(s), premier, number one, world-class, elite, master technician
  review      testimonials, reviews, star ratings, "what drivers/customers say", success stories
  stats       invented track records: "N years", "since 19xx/20xx", "over N", "thousands of", "N cars/vehicles/customers/drivers"
Every page also needs: a fictional notice that says "general information" and "not ... advice", a sample-content line, $00 zero-placeholder
prices with "sample prices/rates/fees" wording, phones in the fictional (555) 01xx range, .example email, no external images or photos.
Usage: python3 tests/au_lint.py [niche ...]   (AU_LINT_OUT=<dir> lints another output folder)
       python3 tests/au_lint.py --readmes      (theme readmes in ui-screens/out-wp)
       AU_LINT_SELFTEST=1 python3 tests/au_lint.py   (forced-bad sentences must all fail)
Exit 1 on any failure."""
import glob, html, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.environ.get("AU_LINT_OUT") or os.path.join(HERE, "..", "ui-screens", "out-hc")
src = open(os.path.join(HERE, "n13_lint.py"), encoding="utf-8").read(); ns = {}
for name in ("REAL", "CLAIMS", "GEN", "DOMAIN"): ns[name] = eval(re.search(rf'^{name} = (r".*")\s*$', src, re.M).group(1))
NICHES = ["car-dealership", "auto-repair", "car-detailing", "car-wash", "car-rental", "auto-body", "towing", "tire-shop"]
BRAND = (r"\b(Toyota|Ford|Honda|BMW|Mercedes|Benz|Audi|Volkswagen|VW|Tesla|Nissan|Hyundai|Kia|Chevrolet|Chevy|GMC|General Motors|Jeep|Subaru|Mazda|Lexus|Porsche|Volvo|Jaguar|Land Rover|Range Rover|"
  r"Fiat|Peugeot|Renault|Citro[eë]n|Skoda|SEAT|Cupra|MINI|Dodge|Chrysler|Buick|Cadillac|Lincoln|Acura|Infiniti|Mitsubishi|Suzuki|Rivian|Lucid|Polestar|BYD|Ferrari|Lamborghini|Maserati|Bentley|"
  r"Rolls[- ]Royce|Aston Martin|McLaren|Alfa Romeo|Genesis|Vauxhall|Opel|Dacia|Harley|Ducati|Kawasaki|Yamaha|Camry|Corolla|Civic|Accord|Prius|Mustang|F-150|Silverado|Wrangler|Model [3SXY]|Golf|Polo|Qashqai|"
  r"Michelin|Bridgestone|Goodyear|Pirelli|Dunlop|Firestone|Hankook|Yokohama|Toyo Tires|Cooper Tires|BFGoodrich|Falken|Kumho|Nokian|Continental Tires|"
  r"Castrol|Mobil ?1|Valvoline|Pennzoil|Quaker State|Bosch|Denso|NGK|Brembo|Meguiar'?s|Chemical Guys|Turtle Wax|Armor ?All|3M|Ceramic Pro|Gtechniq|XPEL|Gyeon|Autoglym|Rain-X|WD-40|Snap-on|"
  r"Jiffy Lube|Midas|Meineke|Pep Boys|Monro|Kwik[- ]Fit|Halfords|AutoZone|NAPA|O'Reilly|Advance Auto|Discount Tire|Les Schwab|Tire Kingdom|National Tyres|Maaco|Caliber|Gerber|Service King|Crash Champions|"
  r"Mister Car Wash|Tommy'?s Express|Zips|Quick Quack|Take 5|Safelite|CarMax|Carvana|AutoNation|Vroom|Cazoo|Penske|Lithia|Hendrick|"
  r"Enterprise|Hertz|Avis|Budget Rent|Sixt|Alamo|National Car|Thrifty|Dollar Rent|Europcar|Turo|Zipcar|Getaround|U-Haul|"
  r"AAA|RAC|Green Flag|Allstate|Geico|GEICO|Progressive|State Farm|Liberty Mutual|Honk|Urgently|Agero|"
  r"ASE|I-CAR|IMI|NIADA|NADA|Kelley Blue Book|KBB|Edmunds|Carfax|CARFAX|AutoCheck|Cars\.com|CarGurus|Autotrader|AutoTrader|TrueCar|Copart|Manheim|"
  r"DMV|DVLA|DVSA|NHTSA|EPA|CARB|Euro NCAP|IIHS|J\.?D\.? Power|"
  r"Google Reviews?|Trustpilot|Yelp|BBB|Facebook|Instagram|TikTok|YouTube|WhatsApp|Uber|Lyft)\b")
CRED = (r"\b(licen[cs]ed|licen[cs]es?|registered|certified|certificat\w*|accredit\w*|insured|bonded|approved (repairers?|dealers?|garages?|shops?)|authori[sz]ed (dealers?|repairers?|service)|"
  r"franchised?( dealers?)?|factory[- ]trained|OEM|manufacturer[- ]approved|dealer[- ]approved|inspected|inspections?|MOT|smog (checks?|tests?)|emissions? (tests?|checks?)|roadworthy|roadworthiness|member of)\b")
FINANCE = (r"\b(financ(e|es|ed|ing)|credit|loans?|APR|interest|leas(e|es|ed|ing)|monthly payments?|down payments?|per month|pre-?approv\w*|buy here pay here|"
  r"no credit check|bad credit|instalments?|installments?|repayments?)\b")
GUAR = (r"\b(guarantee[sd]?|warrant(y|ies|ied)|lifetime|permanent(ly)?|like new|good as new|showroom (finish|condition|shine)|factory finish|scratch[- ]proof|self[- ]healing|"
  r"(increase|boost|protect)s? (your )?resale|resale value|save (you )?money|lowest (prices?|rates?)|cheapest|best (price|deal|rate)s?|price match\w*|top dollar|no[- ]haggle|"
  r"pass(es)? first time|risk[- ]free|worry[- ]free|hassle[- ]free|peace of mind|stress[- ]free|transform\w*)\b")
SAFETY = (r"\b(safest|completely safe|fully safe|100 ?% safe|totally safe|safe to drive|eco[- ]friendly|environmentally friendly|planet[- ]friendly|biodegradable|non[- ]toxic|chemical[- ]free|"
  r"carbon[- ]neutral|zero[- ]emissions?|water[- ]saving|saves? water|green (clean|wash))\b")
SPEED = r"(24 ?/ ?7|24 hours a day|round[- ]the[- ]clock|around the clock|same[- ]day|within \d+ (minutes?|mins?|hours?)|in under \d+|\bfastest\b|\binstant(ly)?\b|\bquickest\b)"
AWARD = (r"\b(awards?|award[- ]winning|rated|ratings?|voted|trusted|leading|best(?! time)|top[- ]rated|top (quality|notch|class|choice|rated|garage|shop|dealer|mechanics?|technicians?)|number one|#1|"
  r"five[- ]star|5[- ]star|famous|premier|elite|expert(s|ise)?|specialists?|speciali[sz]ing|renowned|world[- ]class|outstanding|excellent|excellence|prestigious|acclaimed|master (technicians?|mechanics?))\b")
REVIEW = r"(★|\breviews?\b|\btestimonials?\b|\bwhat (our )?(drivers|customers|clients|owners|people|buyers|renters) say\b|\bstars?\b|\bhappy (customers|drivers|clients)\b|\bsuccess stories\b|\bloved by\b)"
STATS = (r"(\b\d+\+? years\b(?! old)|\bsince (19|20)\d\d\b|\bover \d|\bthousands of\b|\bhundreds of\b|"
  r"\b\d[\d,]*\+? (cars|vehicles|customers|drivers|clients|owners|buyers|renters|tows|jobs|repairs|washes|details|tyres|tires|sold|served|happy)\b)")
ALLOW = re.compile(r"\b(add your own|sample)\b", re.I)
BLOCK = re.compile(r"</?(p|li|td|th|h[1-6]|summary|div|section|article|aside|header|footer|nav|ul|ol|table|tr|form|label|button|option|legend|span|b|figcaption)\b[^>]*>", re.I)
def texts(path):
    s = open(path, encoding="utf-8").read(); body = s.split("<body>", 1)[-1]
    body = re.sub(r"<style.*?</style>|<svg.*?</svg>|<script.*?</script>", " ", body, flags=re.S)
    plain = html.unescape(re.sub(r"<[^>]+>", " ", body))
    notab = html.unescape(re.sub(r"<[^>]+>", " ", re.sub(r"<table.*?</table>", " ", body, flags=re.S)))
    chunks = [html.unescape(re.sub(r"<[^>]+>", " ", c)).strip() for c in BLOCK.split(body)]
    sentences = [x for c in chunks if c for x in re.split(r"(?<=[.!?])\s+", re.sub(r"\s+", " ", c)) if x.strip()]
    return plain, notab, sentences, s, body
def gate(t, sents, notab):
    errs = []
    for name, rx, tt, fl in [("general", ns["GEN"], t, re.I), ("real-name", ns["REAL"], t, 0), ("brand", BRAND, t, 0), ("domain", ns["DOMAIN"], t, re.I), ("claim", ns["CLAIMS"], notab, re.I),
                             ("speed", SPEED, notab, re.I), ("safety", SAFETY, t, re.I), ("award", AWARD, t, re.I), ("review", REVIEW, t, re.I), ("stats", STATS, notab, re.I)]:
        for m in re.finditer(rx, tt, flags=fl): errs.append(f"{name}: ...{tt[max(0,m.start()-40):m.end()+30].strip()}...".replace("\n", " "))
    for s in sents:
        for name, rx, fl in [("credential", CRED, re.I), ("finance", FINANCE, re.I), ("outcome", GUAR, re.I)]:
            if re.search(rx, s, fl) and not ALLOW.search(s): errs.append(f"{name} not labelled sample or add-your-own: {s[:150]}")
    return errs
if os.environ.get("AU_LINT_SELFTEST"):
    bad = ["All our mechanics are ASE certified.", "Every repair comes with a lifetime warranty.", "Rated the best garage in town.", "Read what drivers say about us.", "Over 5,000 cars serviced since 2004.",
           "Genuine Toyota parts fitted.", "Our ceramic coating is eco-friendly and scratch-proof.", "Finance from 3.9 APR, bad credit welcome.", "Towing within 30 minutes, 24/7.", "Oil change $49.",
           "We match any price and pay top dollar for your trade-in.", "A licensed MOT and inspection station.", "Low monthly payments on every car.", "Finance available on every car."]
    miss = [b for b in bad if not gate(b, [b], b) and not re.search(r"[$£€]\s?[1-9]", b)]
    print("selftest", "ok" if not miss else f"MISSED {miss}"); sys.exit(1 if miss else 0)
if sys.argv[1:2] == ["--readmes"]:  # theme readmes: the same gates (minus the sentence allowances, which the readme states itself), plus no other industry's wording
    OTHER = r"\b(medical|patients?|clinics?|fair housing|allergen\w*|dietary|kitchen's|food hygiene|building, electrical|legal, tax|childcare|safeguarding)\b"; bad = 0; n = 0
    for f in sorted(glob.glob(os.path.join(HERE, "..", "ui-screens", "out-wp", "*", "readme.txt"))):
        slug = os.path.basename(os.path.dirname(f))
        if not any(slug.startswith(f"mgd-{x}-") for x in NICHES): continue
        t = open(f, encoding="utf-8").read(); n += 1; errs = []
        for name, rx, fl in [("general", ns["GEN"], re.I), ("real-name", ns["REAL"], 0), ("brand", BRAND, 0), ("other-industry", OTHER, re.I), ("review", REVIEW, re.I)]:
            for m in re.finditer(rx, t, flags=fl): errs.append(f"{name}: ...{t[max(0,m.start()-40):m.end()+30].strip()}...".replace("\n", " "))
        if "not mechanical, legal or financial advice" not in t: errs.append("readme lacks the automotive Before-you-publish lines")
        print(("FAIL " if errs else "ok   ") + slug, f"({len(errs)})"); [print("   ", e) for e in errs[:8]]; bad += bool(errs)
    print(f"{n} readmes, {bad} failed"); sys.exit(1 if bad or not n else 0)
fails = 0; want = sys.argv[1:] or NICHES; seen = 0
for d in sorted(glob.glob(os.path.join(OUT, "*-web-*"))):
    base = os.path.basename(d); n = next((x for x in sorted(want, key=len, reverse=True) if base.startswith(x + "-website-")), None)
    if not n: continue
    seen += 1; txt, notab, sents, raw, body = texts(os.path.join(d, "index.html")); errs = gate(txt, sents, notab)
    if re.search(r'<img|<video|<iframe|url\(http|src="http', re.sub(r"<link[^>]+>", "", raw)): errs.append("external image or embed")
    if "@" in txt and not re.search(r"\.example\b", txt): errs.append("email not on .example")
    if re.search(r"\(\d{3}\) (?!01)", txt) or re.search(r"\((?!555)\d{3}\) \d{3}-", txt): errs.append("phone not in fictional (555) 01xx range")
    if "ictional" not in txt: errs.append("no fictional notice")
    if not re.search(r"general information", txt, re.I) or not re.search(r"not [a-z, ]*advice", txt, re.I): errs.append("notice lacks 'general information' and 'not ... advice'")
    if not re.search(r"sample (content|fees?|prices|rates|price guide)", txt, re.I): errs.append("no sample-content line")
    for m in re.finditer(r"[$£€]\s?\d[\d,.]*", txt):   # prices are zero placeholders (r4 to r7 rule)
        if re.sub(r"[$£€\s,.]", "", m.group(0)).strip("0"): errs.append(f"price not a zero placeholder: ...{txt[max(0,m.start()-30):m.end()+20].strip()}...")
    if re.search(r"[$£€]\s?\d", txt) and not re.search(r"\bsample (prices?|fees?|rates?|price guide)\b", txt, re.I): errs.append("prices shown but no 'sample prices' wording")
    if n == "towing" and not re.search(r"emergency number", txt, re.I): errs.append("towing page lacks the call-the-emergency-number line")
    print(("FAIL " if errs else "ok   ") + base, f"({len(errs)})")
    for e in errs[:14]: print("   ", e)
    fails += bool(errs)
if not seen: print("no pages found"); sys.exit(1)
sys.exit(1 if fails else 0)
