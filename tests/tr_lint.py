#!/usr/bin/env python3
"""Content gate for travel and hotel template sets (templates r9, 25-Nov-2026: travel and hotels, staged). Modelled on tests/au_lint.py (r8); shares GEN,
REAL, DOMAIN and CLAIMS with tests/n13_lint.py (CLAIMS already bans percentages outside tables, guarantees, "proven", "#1", N stars and invented counts), plus:
  brand       real hotel groups and chains, resort and holiday-park chains, campground networks, online travel agencies and booking sites, metasearch,
              airlines, rail and cruise lines, tour and travel-agency chains, guidebooks, trade bodies and protection schemes (ABTA, ATOL, IATA, ASTA,
              CLIA...), star-rating and award schemes (Forbes, Michelin, AA rosettes...), eco labels (Green Key, Blue Flag...), tourism boards,
              review sites and social platforms, and well-known real destinations
  credential  licensed, registered, certified, accredited, bonded, insured, member of, protected/protection, graded, rated, accessible, wheelchair,
              step-free, adapted rooms, lifeguard, safe, safety, secure, security. Allowed only in a sentence that says "add your own" or "sample"
  policy      refunds, refundable, cancellation, cancel, deposit, non-refundable, pay later, instalments, travel insurance, financial protection,
              package holiday, visa, passport, vaccination, entry requirements, taxes and fees. Same allowance, or a pointer to official travel advice (booking and travel rules vary by place)
  outcome     guaranteed, best price/rate, lowest price, cheapest, price match, "book direct and save", "save up to", unbeatable, "no hidden fees",
              risk-free, worry-free, hassle-free, stress-free, peace of mind, once in a lifetime, unforgettable, transform. Same allowance
  safety      eco-friendly, environmentally friendly, sustainable, green, carbon neutral, zero waste, plastic-free,
              family-safe, crime-free (policies are owner lines, not claims)
  award       awards, rated, best, trusted, leading, top, luxury, world-class, five-star/5-star and other star grades, famous, iconic, renowned,
              premier, elite, expert(s), specialist(s), breathtaking, paradise, hidden gem, number one
  review      testimonials, reviews, star ratings, "what guests/travellers say", guest notes, success stories
  stats       invented track records: "N years", "since 19xx/20xx", "over N", "thousands of", "N guests/travellers/visitors/bookings"
  speed       24/7, 24-hour, round the clock, same-day, instant confirmation, "within N minutes/hours"
Every page also needs: a fictional notice that says "general information" and "not ... advice", a sample-content line, $00 zero-placeholder
prices with "sample prices/rates/fees" wording, phones in the fictional (555) 01xx range, .example email, no external images or photos.
Travel agency and tour operator pages must tell people to check official travel advice / entry requirements.
Usage: python3 tests/tr_lint.py [niche ...]   (TR_LINT_OUT=<dir> lints another output folder)
       python3 tests/tr_lint.py --readmes      (theme readmes in ui-screens/out-wp)
       TR_LINT_SELFTEST=1 python3 tests/tr_lint.py   (forced-bad sentences must all fail)
Exit 1 on any failure."""
import glob, html, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.environ.get("TR_LINT_OUT") or os.path.join(HERE, "..", "ui-screens", "out-hc")
src = open(os.path.join(HERE, "n13_lint.py"), encoding="utf-8").read(); ns = {}
for name in ("REAL", "CLAIMS", "GEN", "DOMAIN"): ns[name] = eval(re.search(rf'^{name} = (r".*")\s*$', src, re.M).group(1))
NICHES = ["hotel", "resort", "bed-and-breakfast", "hostel", "travel-agency", "tour-operator", "campground", "tourism"]
PATTERN = {}  # niche -> pattern stem, when it differs (none in r9)
BRAND = (r"\b(Marriott|Hilton|Hyatt|IHG|InterContinental|Holiday Inn|Crowne Plaza|Accor|Novotel|Ibis|Sofitel|Pullman|Fairmont|Raffles|Wyndham|Ramada|Days Inn|Best Western|Radisson|"
  r"Four Seasons|Ritz|Carlton|Shangri-La|Mandarin Oriental|Sheraton|Westin|St\.? Regis|W Hotels?|Aloft|Embassy Suites|DoubleTree|Waldorf|Kimpton|Hard Rock|"
  r"Premier Inn|Travelodge|Motel 6|Super 8|Choice Hotels|Comfort Inn|Quality Inn|La Quinta|Red Roof|Hostelling International|YHA|HI USA|Meininger|St Christopher'?s|Wombat'?s|"
  r"Club Med|Sandals|Center Parcs|Butlins|Parkdean|Disney|Six Flags|Atlantis|Banyan Tree|Six Senses|Anantara|One&Only|Belmond|Relais|Small Luxury Hotels|"
  r"KOA|Hipcamp|Pitchup|Glamping Hub|Camping and Caravanning Club|Caravan and Motorhome Club|Yellowstone|Yosemite|Grand Canyon|"
  r"Booking\.com|Expedia|Hotels\.com|Airbnb|Vrbo|HomeAway|Tripadvisor|TripAdvisor|Agoda|Trivago|Kayak|Skyscanner|Google Flights|Google Travel|Hostelworld|Hopper|Priceline|Orbitz|"
  r"Travelocity|Trip\.com|Ctrip|lastminute|Viator|GetYourGuide|Klook|Tiqets|Musement|Civitatis|"
  r"Emirates|United Airlines|American Airlines|British Airways|Ryanair|easyJet|Lufthansa|Qantas|Singapore Airlines|Air France|KLM|Qatar|Etihad|Southwest|JetBlue|Amtrak|Eurostar|Greyhound|FlixBus|"
  r"Royal Caribbean|Norwegian Cruise|Princess Cruises|Cunard|MSC|"
  r"TUI|Intrepid|G Adventures|Contiki|Trafalgar|Thomas Cook|Kuoni|Flight Centre|STA Travel|Trailfinders|Lonely Planet|Rick Steves|Fodor'?s|Frommer'?s|Rough Guides?|"
  r"ABTA|ATOL|IATA|ASTA|CLIA|USTOA|AITO|ACTA|TICO|UFTAA|WTTC|UNWTO|UNESCO|AAA|Forbes Travel Guide|Michelin|AA Rosettes?|Visit ?Britain|Visit ?England|VisitScotland|Tourism Australia|"
  r"Green Key|Blue Flag|Green Globe|EarthCheck|Travelife|B Corp|LEED|GSTC|"
  r"Google Reviews?|Google Maps|Trustpilot|Yelp|BBB|Facebook|Instagram|TikTok|YouTube|WhatsApp|Uber|Lyft|PayPal|Mastercard|American Express|Amex|Klarna|"
  r"Paris|London|Rome|Venice|Florence|Barcelona|Madrid|Lisbon|Amsterdam|Prague|Berlin|Vienna|Dubai|Bali|Phuket|Bangkok|Tokyo|Kyoto|Singapore|Sydney|Hawaii|Maui|Cancun|Maldives|"
  r"Santorini|Mykonos|Ibiza|Mallorca|Tuscany|Provence|Amalfi|Cornwall|Lake District|Cotswolds|Scotland|Ireland|Iceland|Norway|Switzerland|Alps|New York|Las Vegas|Orlando|Miami|"
  r"California|Florida|Caribbean|Mediterranean|Europe|Asia|Africa|Mexico|Canada|Japan|Italy|France|Spain|Greece|Thailand|Australia|New Zealand)\b")
CRED = (r"\b(licen[cs]ed|licen[cs]es?|registered|registration|certified|certificat\w*|accredit\w*|insured|insurance|bonded|member of|members? of the|protected|protection|graded|grading|"
  r"safe|safest|safety|secure|security|accessib\w*|wheelchair|step[- ]free|adapted rooms?|lifeguards?|hygiene (ratings?|scores?)|food safety)\b")
POLICY = (r"\b(refunds?|refundable|non[- ]refundable|cancel(s|led|ling|lation|lations)?|deposits?|pay later|instalments?|installments?|travel insurance|financial protection|"
  r"package (holidays?|travel|trips?)|visas?|passports?|vaccinations?|entry requirements?|taxes and fees|resort fees?|tourist tax(es)?|city tax(es)?)\b")
GUAR = (r"\b(guarantee[sd]?|best (prices?|rates?|deals?|value)|lowest (prices?|rates?)|cheapest|price match\w*|book direct and save|save up to|unbeatable|no hidden (fees|costs|charges)|"
  r"risk[- ]free|worry[- ]free|hassle[- ]free|stress[- ]free|peace of mind|once[- ]in[- ]a[- ]lifetime|unforgettable|transform\w*|perfect (getaway|holiday|stay|escape))\b")
SAFETY = (r"\b(eco[- ]friendly|environmentally friendly|planet[- ]friendly|sustainab\w*|green (hotel|stay|travel|certified)|carbon[- ]neutral|"
  r"net[- ]zero|zero[- ]waste|plastic[- ]free|family[- ]safe|crime[- ]free|responsible travel)\b")
SPEED = r"(24 ?/ ?7|24[- ]hours?|round[- ]the[- ]clock|around the clock|same[- ]day|within \d+ (minutes?|mins?|hours?)|in under \d+|\binstant(ly)?\b|\bfastest\b|\bquickest\b)"
AWARD = (r"\b(awards?|award[- ]winning|rated|ratings?|voted|trusted|leading|best(?! time)|top[- ]rated|top (quality|notch|class|choice|rated|hotel|resort|destination|attraction)|number one|#1|"
  r"(one|two|three|four|five|1|2|3|4|5)[- ]stars?|luxur(y|ious)|famous|iconic|renowned|premier|elite|expert(s|ise)?|specialists?|speciali[sz]ing|world[- ]class|outstanding|excellent|"
  r"excellence|prestigious|acclaimed|breathtaking|paradise|hidden gems?|stunning|spectacular|exclusive)\b")
REVIEW = r"(★|\breviews?\b|\btestimonials?\b|\bwhat (our )?(guests|travell?ers|customers|clients|visitors|campers|people) say\b|\bguest notes?\b|\btravell?er notes?\b|\bstars?\b|\bhappy (guests|customers|travell?ers|campers)\b|\bsuccess stories\b|\bloved by\b)"
STATS = (r"(\b\d+\+? years\b(?! old)|\bsince (19|20)\d\d\b|\bover \d|\bthousands of\b|\bhundreds of\b|\bmillions of\b|"
  r"\b\d[\d,]*\+? (guests|travell?ers|customers|clients|visitors|campers|bookings|trips booked|tours run|served|happy|repeat)\b)")
ALLOW = re.compile(r"\b(add your own|sample)\b", re.I)
ALLOW_POLICY = re.compile(r"\b(add your own|sample|official (travel advice|sources?|government))\b", re.I)
BLOCK = re.compile(r"</?(p|li|td|th|h[1-6]|summary|div|section|article|aside|header|footer|nav|ul|ol|table|tr|form|label|button|option|legend|span|b|figcaption|time)\b[^>]*>", re.I)
def texts(path):
    s = open(path, encoding="utf-8").read(); body = s.split("<body>", 1)[-1]
    body = re.sub(r"<style.*?</style>|<svg.*?</svg>|<script.*?</script>", " ", body, flags=re.S)
    body = body.replace("Privacy · Terms · Accessibility", "Privacy · Terms")   # the shared sitekit footer link row (every industry): a link label, not an accessibility claim
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
        for name, rx, fl, al in [("credential", CRED, re.I, ALLOW), ("policy", POLICY, re.I, ALLOW_POLICY), ("outcome", GUAR, re.I, ALLOW)]:
            if re.search(rx, s, fl) and not al.search(s): errs.append(f"{name} not labelled sample or add-your-own: {s[:150]}")
    return errs
if os.environ.get("TR_LINT_SELFTEST"):
    bad = ["Rated five-star by Forbes.", "Book direct and get our best rate, guaranteed.", "Read what guests say about us.", "Over 20,000 travellers since 2004.",
           "Listed on Booking.com and Airbnb.", "An eco-friendly, sustainable resort.", "ABTA and ATOL protected holidays.", "Free cancellation on every room.", "Instant confirmation, 24/7 reception.",
           "Rooms from $89 a night.", "Fully wheelchair accessible rooms.", "A safe and secure hostel.", "Day trips to Tuscany and Florence.", "Our travel experts plan unforgettable honeymoons.",
           "A luxury stay in paradise.", "Pay a deposit to hold your room.", "No visa needed for most travellers."]
    miss = [b for b in bad if not gate(b, [b], b) and not re.search(r"[$£€]\s?[1-9]", b)]
    print("selftest", "ok" if not miss else f"MISSED {miss}", f"({len(bad)} forced-bad)"); sys.exit(1 if miss else 0)
if sys.argv[1:2] == ["--readmes"]:  # theme readmes: the same gates (minus the sentence allowances, which the readme states itself), plus no other industry's wording
    OTHER = r"\b(medical|patients?|clinics?|fair housing|allergen\w*|dietary|kitchen's|food hygiene|building, electrical|legal, tax|childcare|safeguarding|mechanical)\b"; bad = 0; n = 0
    for f in sorted(glob.glob(os.path.join(HERE, "..", "ui-screens", "out-wp", "*", "readme.txt"))):
        slug = os.path.basename(os.path.dirname(f))
        if not any(slug.startswith(f"mgd-{x}-") for x in NICHES): continue
        t = open(f, encoding="utf-8").read(); n += 1; errs = []
        for name, rx, fl in [("general", ns["GEN"], re.I), ("real-name", ns["REAL"], 0), ("brand", BRAND, 0), ("other-industry", OTHER, re.I), ("review", REVIEW, re.I)]:
            for m in re.finditer(rx, t, flags=fl): errs.append(f"{name}: ...{t[max(0,m.start()-40):m.end()+30].strip()}...".replace("\n", " "))
        if "not travel, legal or financial advice" not in t: errs.append("readme lacks the travel Before-you-publish lines")
        print(("FAIL " if errs else "ok   ") + slug, f"({len(errs)})"); [print("   ", e) for e in errs[:8]]; bad += bool(errs)
    print(f"{n} readmes, {bad} failed"); sys.exit(1 if bad or not n else 0)
fails = 0; want = sys.argv[1:] or NICHES; seen = 0
for d in sorted(glob.glob(os.path.join(OUT, "*-web-*"))):
    base = os.path.basename(d); n = next((x for x in sorted(want, key=len, reverse=True) if base.startswith(PATTERN.get(x, x) + "-website-")), None)
    if not n or "-homepage-" in base: continue   # the n12 hand-built homepages (Halcyon Quay, Driftmark Journeys) are not this round's designs
    seen += 1; txt, notab, sents, raw, body = texts(os.path.join(d, "index.html")); errs = gate(txt, sents, notab)
    if re.search(r'<img|<video|<iframe|url\(http|src="http', re.sub(r"<link[^>]+>", "", raw)): errs.append("external image or embed")
    if "@" in txt and not re.search(r"\.example\b", txt): errs.append("email not on .example")
    if re.search(r"\(\d{3}\) (?!01)", txt) or re.search(r"\((?!555)\d{3}\) \d{3}-", txt): errs.append("phone not in fictional (555) 01xx range")
    if "ictional" not in txt: errs.append("no fictional notice")
    if not re.search(r"general information", txt, re.I) or not re.search(r"not [a-z, ]*advice", txt, re.I): errs.append("notice lacks 'general information' and 'not ... advice'")
    if not re.search(r"sample (content|fees?|prices|rates|price guide)", txt, re.I): errs.append("no sample-content line")
    for m in re.finditer(r"[$£€]\s?\d[\d,.]*", txt):   # prices are zero placeholders (r4 to r8 rule)
        if re.sub(r"[$£€\s,.]", "", m.group(0)).strip("0"): errs.append(f"price not a zero placeholder: ...{txt[max(0,m.start()-30):m.end()+20].strip()}...")
    if re.search(r"[$£€]\s?\d", txt) and not re.search(r"\bsample (prices?|fees?|rates?|price guide)\b", txt, re.I): errs.append("prices shown but no 'sample prices' wording")
    if n in ("travel-agency", "tour-operator") and not re.search(r"official travel advice", txt, re.I): errs.append("page lacks the check-official-travel-advice line")
    print(("FAIL " if errs else "ok   ") + base, f"({len(errs)})")
    for e in errs[:14]: print("   ", e)
    fails += bool(errs)
if not seen: print("no pages found"); sys.exit(1)
sys.exit(1 if fails else 0)
