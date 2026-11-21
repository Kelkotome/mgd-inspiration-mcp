#!/usr/bin/env python3
"""Content gate for beauty, fitness and wellness template sets (21-Nov-2026, seventh industry; spec: docs/template-taxonomy.md
"Beauty, fitness and wellness tree"). Modelled on tests/hc_lint.py and tests/pf_lint.py; shares GEN, REAL, DOMAIN and CLAIMS with
tests/n13_lint.py, plus:
  health     health, medical and weight-loss claims: cure, detox, toxins, burn fat or calories, lose X kg, weight loss, slimming, treats,
             heals, healing, anti-ageing results, wrinkles, cellulite, relieves pain or stress, boosts immunity or metabolism, body transformation
  beforeafter  before/after pictures or wording
  promise    guarantees, "visible results", "results in N weeks", "promise(d) results"
  brand      product, salon, barber, nail, spa, makeup, gym, fitness-class, sportswear, equipment, fitness-app and booking-platform names,
             trademarked class formats (CrossFit, Zumba, Spinning, Les Mills, TRX) and teacher-registration bodies
  award      awards, "featured in", ratings, "best", "famous", "#1", "award-winning"
  review     reviews, testimonials, ratings, "what members say", "trusted by", "loved by"
  count      invented member, client or student counts and followers ("500+ members", "2,000 happy clients")
  price      every money amount is an obvious placeholder of zeros ("from $00"); the page says "sample price" somewhere
  pro        licensed, certified, accredited, registered, insured, qualified, "200-hour" teacher training and similar status. Allowed only in a
             sentence that tells the owner to add or check their own, or that itself says "sample"
  people     no photographs: no <img>, no external images, no picture/video embeds. People are drawn placeholders (initials, glyphs)
Every page also needs: a fictional notice, a sample-content line, phones in the fictional (555) 01xx range, .example email.
Percentages are allowed only inside tables (CLAIMS runs on the text outside tables).
Usage: python3 tests/bw_lint.py [niche ...]   (BW_LINT_OUT=<dir> lints another output folder; BW_LINT_SELFTEST=1 runs the forced-bad check)
Exit 1 on any failure."""
import glob, html, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.environ.get("BW_LINT_OUT") or os.path.join(HERE, "..", "ui-screens", "out-hc")
src = open(os.path.join(HERE, "n13_lint.py"), encoding="utf-8").read(); ns = {}
for name in ("REAL", "CLAIMS", "GEN", "DOMAIN"): ns[name] = eval(re.search(rf'^{name} = (r".*")\s*$', src, re.M).group(1))
NICHES = ["hair-salon", "barbershop", "nail-salon", "spa", "makeup-artist", "gym", "fitness", "yoga"]
HEALTH = (r"\b(cur(e[sd]?|ing)|detox\w*|toxins?|cleanse your|purif(y|ies|ying) (your )?(body|skin|blood)|burn(s|ing)? (fat|calories)|fat[- ]?(loss|burn\w*)|calories|"
  r"(lose|losing|lost|shed|drop) (\d+|weight|pounds|kilos|inches|a dress size|the weight)|\d+ ?(kg|kgs|lbs?|pounds|kilos) (lost|off|down)|weight[- ]loss|lose weight|slim(ming|mer|s)?\b|"
  r"inches off|tone up in|bikini body|beach body|body transformation|transform your body|get shredded|shred\w*|"
  r"treats\b|treat (your )?(acne|eczema|psoriasis|anxiety|depression|pain|insomnia|injur\w*|stress)|heal(s|ing|ed)?\b|therapeutic|clinical(ly)?|diagnos\w*|prescri\w*|rehabilitat\w*|"
  r"anti[- ]?(ag(e)?ing|wrinkle)|age[- ]defying|younger[- ]looking|look(s)? years younger|wrinkles?|cellulite|collagen boost\w*|rejuvenat\w*|"
  r"reliev(e[sd]?|ing)|relief|reduc(e[sd]?|ing) (stress|anxiety|pain|inflammation|swelling|tension)|boost(s|ing)? (your )?(immun\w*|metabolism|mood|energy levels)|immun(e|ity) system|metabolism|"
  r"lymphatic|drainage|realign\w*|posture correction|chakras?|energy healing|balanc(e|es|ing) (your )?hormones|hormon\w*)\b")
BEFORE_AFTER = r"\b(before[- ]and[- ]after|before ?(/|&) ?after|before (and|&) after (photos?|pictures?|shots?|images?))\b"
PROMISE = r"\b(guarantee\w*|visible results|results in \d+|instant results|(promise[sd]?|promising) (results|you)|risk[- ]free|life[- ]changing|miracle|flawless results|perfect results)\b"
BRAND = (r"\b(Peloton|Strava|Fitbit|Garmin|Apple Watch|Apple|WHOOP|Oura|MyFitnessPal|ClassPass|Mindbody|Glofox|Treatwell|Fresha|Booksy|Vagaro|StyleSeat|"
  r"Zumba|CrossFit|Crossfit|Jazzercise|Spinning|Les Mills|BodyPump|BODYPUMP|TRX|SoulCycle|Orangetheory|F45|Equinox|Planet Fitness|Anytime Fitness|Gold'?s Gym|24 Hour Fitness|PureGym|Barry'?s|"
  r"Bikram|Iyengar|Yoga Alliance|RYT|E-RYT|NASM|ISSA|ACE|CIMSPA|REPs|"
  r"Lululemon|Alo|Manduka|Liforme|Nike|Adidas|Under Armour|Gymshark|Reebok|Puma|Technogym|Life Fitness|Rogue|Concept2|Theragun|Hypervolt|Hydrafacial|HydraFacial|Microneedling|"
  r"L'Or[eé]al|Loreal|Redken|Wella|Schwarzkopf|K[eé]rastase|Olaplex|Aveda|Dyson|GHD|ghd|Moroccanoil|Paul Mitchell|Toni (&|and) Guy|Sassoon|Aesop|Kiehl'?s|"
  r"OPI|Essie|CND|Shellac|Gelish|Sally Hansen|Bio Sculpture|MAC|M·A·C|Sephora|Ulta|Fenty|Charlotte Tilbury|NARS|Bobbi Brown|Est[eé]e Lauder|Clinique|Dior|Chanel|Huda|Anastasia|"
  r"Glossier|Urban Decay|Too Faced|Elemis|Dermalogica|Clarins|Decl[eé]or|Six Senses|Aman|Banyan Tree|"
  r"Gillette|Wahl|Andis|BaByliss|Babyliss|Oster|American Crew|Truefitt|Murdock|Baxter of California|Reuzel|Layrite|Uppercut|Brylcreem|"
  r"Instagram|Facebook|TikTok|YouTube|Pinterest|WhatsApp|Snapchat|Google|Yelp|Tripadvisor|Groupon|Vogue|Allure|Elle|Harper'?s Bazaar|Cosmopolitan|Men'?s Health|Women'?s Health)\b")
AWARD = r"\b(awards?|award[- ]winning|shortlist\w*|featured in|as seen (in|on)|voted|rated|ratings?|famous|renowned|legendary|best (\w+ )?(in|around|of)\b|the best\b|#1|number one|top[- ]rated|five[- ]star|5[- ]star|world[- ]class|industry[- ]leading|celebrity)"
REVIEW = r"(★|\b(client|customer|guest|member|google|glowing|verified|5[- ]star|five[- ]star|read (our|the)|leave (us )?a) reviews?\b|\breviews?\b|\btestimonials?\b|\bwhat (our )?(clients|customers|members|guests|students|people|brides) (say|said)\b|\bkind words\b|\b(trusted|loved) by\b|\bhappy (clients|customers|members)\b|\bstars?\b)"
COUNT = r"\b\d[\d,.]*\s?(k|m)?\+? (happy |loyal |active |regular )?(members|clients|customers|students|followers|subscribers|guests served|haircuts|cuts done|brides|people trained|transformations)\b"
PRO = r"\b(licen[cs]ed|licen[cs]es?|certif\w*|accredit\w*|registered|insured|insurance|qualified|qualifications?|diplomas?|\d{3}[- ]hours?|level [234] )\b"
OK_SENT = r"\b(sample|check|add your own|your own|before you publish)\b"
MONEY = r"[$£€]\s?\d[\d,.]*"
BLOCK = re.compile(r"</?(p|li|td|th|h[1-6]|summary|div|section|article|aside|header|footer|nav|ul|ol|table|tr|form|label|button|option|legend|span|b|time|figcaption|dt|dd)\b[^>]*>", re.I)
def texts(s):
    body = s.split("<body>", 1)[-1]
    body = re.sub(r"<style.*?</style>|<svg.*?</svg>|<script.*?</script>", " ", body, flags=re.S)
    plain = html.unescape(re.sub(r"<[^>]+>", " ", body))
    notab = html.unescape(re.sub(r"<[^>]+>", " ", re.sub(r"<table.*?</table>", " ", body, flags=re.S)))
    chunks = [html.unescape(re.sub(r"<[^>]+>", " ", c)).strip() for c in BLOCK.split(body)]
    sentences = [x for c in chunks if c for x in re.split(r"(?<=[.!?])\s+", re.sub(r"\s+", " ", c)) if x.strip()]
    return plain, notab, sentences, body
def lint(raw):
    txt, notab, sents, body = texts(raw); errs = []
    for name, rx, t, fl in [("general", ns["GEN"], txt, re.I), ("real-name", ns["REAL"], txt, 0), ("brand", BRAND, txt, 0), ("domain", ns["DOMAIN"], txt, re.I), ("claim", ns["CLAIMS"], notab, re.I),
                            ("health", HEALTH, txt, re.I), ("before-after", BEFORE_AFTER, txt, re.I), ("promise", PROMISE, txt, re.I), ("award", AWARD, txt, re.I), ("review", REVIEW, txt, re.I), ("count", COUNT, txt, re.I)]:
        for m in re.finditer(rx, t, flags=fl): errs.append(f"{name}: ...{t[max(0,m.start()-40):m.end()+30].strip()}...".replace("\n", " "))
    for m in re.finditer(MONEY, txt):
        if re.sub(r"[$£€\s,.]", "", m.group(0)).strip("0"): errs.append(f"price not a zero placeholder: ...{txt[max(0,m.start()-30):m.end()+20].strip()}...")
    if re.search(MONEY, txt) and not re.search(r"\bsample prices?\b", txt, re.I): errs.append("prices shown but no 'sample price' wording")
    for s in sents:
        if re.search(PRO, s, re.I) and not re.search(OK_SENT, s, re.I): errs.append(f"pro-status wording not labelled sample or add-your-own: {s[:140]}")
    if re.search(r"<img\b|<picture\b|<video\b|<iframe\b|url\(http|src=\"http", re.sub(r"<link[^>]+>", "", raw)): errs.append("photograph or external media")
    if "@" in txt and not re.search(r"\.example\b", txt): errs.append("email not on .example")
    for m in re.finditer(r"[\w.+-]+@[\w-]+(\.[\w-]+)+", txt):
        if not m.group(0).endswith(".example"): errs.append(f"email not on .example: {m.group(0)}")
    if re.search(r"\(\d{3}\) (?!01)", txt) or re.search(r"\((?!555)\d{3}\) \d{3}-", txt): errs.append("phone not in fictional (555) 01xx range")
    if "ictional" not in txt: errs.append("no fictional notice")
    if not re.search(r"sample (content|timetable|schedule|prices?|menu|week)", txt, re.I): errs.append("no sample-content line")
    return errs
if os.environ.get("BW_LINT_SELFTEST"):
    bad = ('<body><p>Lose 5 kg in 30 days with our detox wrap, guaranteed. Before and after photos. 500+ happy members. Haircut $45. '
           'Our certified coaches. Rated five stars by clients. Book on Instagram. Call (212) 555-0100.</p><img src="https://x.example/a.jpg"></body>')
    e = lint(bad); kinds = sorted({x.split(":")[0] for x in e}); print("selftest kinds:", ", ".join(kinds))
    need = {"health", "promise", "before-after", "count", "price not a zero placeholder", "pro-status wording not labelled sample or add-your-own", "award", "brand", "photograph or external media", "no fictional notice", "review"}
    missing = need - set(kinds); print("selftest", "FAIL missing " + ", ".join(sorted(missing)) if missing else "ok"); sys.exit(1 if missing else 0)
fails = 0; want = sys.argv[1:] or NICHES; seen = 0
for d in sorted(glob.glob(os.path.join(OUT, "*-web-*"))):
    base = os.path.basename(d); n = next((x for x in sorted(want, key=len, reverse=True) if base.startswith(x + "-website-")), None)
    if not n: continue
    seen += 1; errs = lint(open(os.path.join(d, "index.html"), encoding="utf-8").read())
    print(("FAIL " if errs else "ok   ") + base, f"({len(errs)})")
    for e in errs[:12]: print("   ", e)
    fails += bool(errs)
if not seen: print("no pages found"); sys.exit(1)
print(f"{seen - fails}/{seen} pages pass")
sys.exit(1 if fails else 0)
