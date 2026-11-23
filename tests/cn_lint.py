#!/usr/bin/env python3
"""Content gate for construction and home services template sets (7-Nov-2026, fourth industry). Shares GEN, REAL, DOMAIN and CLAIMS with
tests/n13_lint.py (CLAIMS already bans percentages outside tables, guarantees, "proven", "#1" and invented counts), plus:
  trade-brand  real trade brands, equipment and product makers, retailers, lead-gen and review platforms, trade bodies and schemes
  credential   licensed, insured, bonded, certified, accredited, vetted, registered, approved installer. Allowed only in a sentence that
               says "add your own" or "sample" (the footer line that tells the owner to add their own licence and insurance details)
  guarantee    guarantees, warranties, promises, "satisfaction", "no fix no fee". Same allowance as credential
  before-after before/after photos or claims of transformation
  speed        24/7, round the clock, same-day, "within N minutes/hours", fastest, instant, emergency response promises
  legal        building-code, compliance and permit claims ("to code", "compliant", "approved", "meets regulations"), DIY instructions
  chemical     "non-toxic", "pet safe", "child safe", "eco", "green", "natural", "organic", "chemical-free", "harmless"
  hygiene      germ, bacteria, disinfect, sanitise, "hospital grade", allergy and asthma claims
  pest-claim   kill rates, eradication, "never come back", permanent results
  award        awards, ratings, "best", "trusted", "leading", "top", "number one"
  review       testimonials, reviews, star ratings, "what our customers say"
  stats        invented track records: "N years", "since 19xx/20xx", "over N", "thousands of", "N jobs/homes/customers"
Every page also needs: a fictional notice, a sample-content line, a sample schedule note on project layouts, phones in the fictional
(555) 01xx range, .example email, no external images.
Usage: python3 tests/cn_lint.py [niche ...]   (CN_LINT_OUT=<dir> lints another output folder, for example the hand-built signatures)
       python3 tests/cn_lint.py --readmes      (theme readmes in ui-screens/out-wp)
Exit 1 on any failure."""
import glob, html, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.environ.get("CN_LINT_OUT") or os.path.join(HERE, "..", "ui-screens", "out-hc")
src = open(os.path.join(HERE, "n13_lint.py"), encoding="utf-8").read(); ns = {}
for name in ("REAL", "CLAIMS", "GEN", "DOMAIN"): ns[name] = eval(re.search(rf'^{name} = (r".*")\s*$', src, re.M).group(1))
NICHES = ["construction", "plumber", "electrician", "roofing", "hvac", "cleaning-service", "landscaping", "pest-control"]
TRADE = (r"\b(Home Depot|Lowe'?s|B&Q|Screwfix|Toolstation|Wickes|Travis Perkins|Jewson|Bunnings|Menards|Ace Hardware|Angi|Angie'?s List|HomeAdvisor|Thumbtack|"
  r"Houzz|Porch|Bark|Checkatrade|TrustATrader|MyBuilder|Rated People|Trustpilot|Yelp|Google Reviews?|BBB|Better Business Bureau|Nextdoor|TaskRabbit|Handy|"
  r"Rheem|Worcester|Bosch|Vaillant|Baxi|Ideal|Viessmann|Navien|Mitsubishi|Fujitsu|LG|Samsung|Panasonic|Hitachi|Goodman|York|Bryant|Ruud|Honeywell|Nest|Ecobee|Hive|"
  r"Kohler|Moen|Delta|Grohe|Hansgrohe|American Standard|Roca|Ideal Standard|Triton|Mira|Aqualisa|Wavin|"
  r"GAF|Owens Corning|CertainTeed|Marley|Redland|Velux|Fakro|Kingspan|Celotex|Rockwool|Tyvek|Trex|Hager|Schneider|Siemens|ABB|Eaton|Square D|Leviton|Lutron|"
  r"ChargePoint|Wallbox|Zappi|Pod Point|Enphase|SolarEdge|Kärcher|Karcher|Dyson|Henry|Vileda|Dettol|Lysol|Clorox|Domestos|Cif|Mr\.? Muscle|Method|Ecover|Zoflora|"
  r"Terminix|Orkin|Rentokil|Rollins|Truly Nolen|Ehrlich|Raid|Roundup|Bayer|Syngenta|BASF|Ortho|Marshalls|Bradstone|Stihl|Husqvarna|Hayter|Toro|John Deere|Flymo|"
  r"Gas Safe|NICEIC|NAPIT|Corgi|OFTEC|HETAS|TrustMark|FENSA|CSCS|CHAS|SafeContractor|Constructionline|NRCA|NARI|NAHB|ACCA|NATE|EPA|OSHA|NFPA|NEC|BPCA|NPMA|"
  r"BICSc|ISSA|BALI|APL|RHS|Energy Star|MCS|Which\?|Ofgem|HUD)\b")
CRED = r"\b(licen[cs]ed|licen[cs]es?|insured|insurance|bonded|certified|certificat\w*|accredit\w*|vetted|background[- ]checked|dbs[- ]checked|registered|approved (installer|contractor|engineer)s?|qualified|fully qualified)\b"
GUAR = r"\b(guarantee[sd]?|warrant(y|ies|ied)|promise[sd]?|satisfaction|no fix,? no fee|money[- ]back|risk[- ]free|worry[- ]free|peace of mind)\b"
BEFORE = r"\b(before[- ]and[- ]after|before ?/ ?after|before & after|transform(s|ed|ing|ation)?|like new|good as new)\b"
SPEED = r"(24 ?/ ?7|24 ?hours?|24-hour|round[- ]the[- ]clock|around the clock|same[- ]day|next[- ]day|within \d+ (minutes?|mins?|hours?)|in under \d+|\bfastest\b|\binstant(ly)?\b|\brapid response\b|\bany time, day or night\b)"
LEGAL = r"\b(to code|up to code|meets? (the )?(code|codes|regulations?|standards?)|code[- ]compliant|compliant|complian(ce|t)|complies|(council|city|building|planning)[- ]approved|regulations? (say|require)|the law (says|requires)|legally required|DIY|do it yourself|safe to|perfectly safe|completely safe|totally safe|100% safe|safely)\b"
CHEM = r"\b(non[- ]toxic|toxic|pet[- ]safe|child[- ]safe|kid[- ]safe|family[- ]safe|safe for (pets|children|kids|families|babies)|eco[- ]?\w*|green (products?|cleaning|treatments?)|natural (products?|cleaning|treatments?)|organic|chemical[- ]free|harmless|biodegradable|environmentally friendly|planet[- ]friendly)\b"
HYG = r"\b(germs?|germ[- ]free|bacteria|antibacterial|anti[- ]bacterial|disinfect\w*|sanitis\w*|sanitiz\w*|steriliz\w*|sterilis\w*|hospital[- ]grade|allerg\w*|asthma|viruses?|kills? \d+|99(\.9)?)\b"
PEST = r"\b(eradicat\w*|exterminat\w*|wipe out|never come back|gone for good|permanent(ly)?|kills? (all|every|100))\b"
AWARD = r"\b(awards?|award[- ]winning|rated|ratings?|voted|trusted|leading|best(?! time)|top[- ]rated|top (quality|notch|class|choice|rated)|number one|#1|five[- ]star|5[- ]star|famous|premier|expert(s)?|specialists? in)\b"
REVIEW = r"(★|\breviews?\b|\btestimonials?\b|\bwhat (our )?(customers|clients|homeowners|neighbours|neighbors) say\b|\bstars?\b|\bhappy customers\b)"
STATS = r"(\b\d+\+? years\b|\bsince (19|20)\d\d\b|\bover \d|\bthousands of\b|\bhundreds of\b|\b\d[\d,]*\+? (jobs|homes|customers|clients|projects|roofs|gardens|installs|families|households)\b(?! a\b))"
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
    for name, rx, tt, fl in [("general", ns["GEN"], t, re.I), ("real-name", ns["REAL"], t, 0), ("trade-brand", TRADE, t, 0), ("domain", ns["DOMAIN"], t, re.I), ("claim", ns["CLAIMS"], notab, re.I),
                             ("before-after", BEFORE, t, re.I), ("speed", SPEED, notab, re.I), ("legal", LEGAL, t, re.I), ("chemical", CHEM, t, re.I), ("hygiene", HYG, t, re.I),
                             ("pest-claim", PEST, t, re.I), ("award", AWARD, t, re.I), ("review", REVIEW, t, re.I), ("stats", STATS, notab, re.I)]:
        for m in re.finditer(rx, tt, flags=fl): errs.append(f"{name}: ...{tt[max(0,m.start()-40):m.end()+30].strip()}...".replace("\n", " "))
    for s in sents:
        for name, rx in [("credential", CRED), ("guarantee", GUAR)]:
            if re.search(rx, s, re.I) and not ALLOW.search(s): errs.append(f"{name} not labelled sample or add-your-own: {s[:150]}")
    return errs
if sys.argv[1:2] == ["--readmes"]:  # theme readmes: the same gates (minus the sentence allowances, which the readme states itself), plus no other industry's wording
    OTHER = r"\b(medical|health\w*|patients?|clinics?|fair housing|allergen\w*|dietary|kitchen's|food hygiene)\b"; bad = 0; n = 0
    for f in sorted(glob.glob(os.path.join(HERE, "..", "ui-screens", "out-wp", "*", "readme.txt"))):
        slug = os.path.basename(os.path.dirname(f))
        if not any(slug.startswith(f"mgd-{x}-") for x in NICHES): continue
        t = open(f, encoding="utf-8").read(); n += 1; errs = []
        for name, rx, fl in [("general", ns["GEN"], re.I), ("real-name", ns["REAL"], 0), ("trade-brand", TRADE, 0), ("other-industry", OTHER, re.I), ("review", REVIEW, re.I), ("before-after", BEFORE, re.I), ("chemical", CHEM, re.I)]:
            for m in re.finditer(rx, t, flags=fl): errs.append(f"{name}: ...{t[max(0,m.start()-40):m.end()+30].strip()}...".replace("\n", " "))
        if "not building, electrical, gas or safety advice" not in t: errs.append("readme lacks the construction Before-you-publish lines")
        print(("FAIL " if errs else "ok   ") + slug, f"({len(errs)})"); [print("   ", e) for e in errs[:8]]; bad += bool(errs)
    print(f"{n} readmes, {bad} failed"); sys.exit(1 if bad or not n else 0)
fails = 0; want = sys.argv[1:] or NICHES; seen = 0
for d in sorted(glob.glob(os.path.join(OUT, "*-web-*"))):
    base = os.path.basename(d); n = next((x for x in sorted(want, key=len, reverse=True) if base.startswith(x + "-website-")), None)
    if not n: continue
    seen += 1; txt, notab, sents, raw, body = texts(os.path.join(d, "index.html")); errs = gate(txt, sents, notab)
    if re.search(r'<img|url\(http|src="http', re.sub(r"<link[^>]+>", "", raw)): errs.append("external image")
    if "@" in txt and not re.search(r"\.example\b", txt): errs.append("email not on .example")
    if re.search(r"\(\d{3}\) (?!01)", txt) or re.search(r"\((?!555)\d{3}\) \d{3}-", txt): errs.append("phone not in fictional (555) 01xx range")
    if "ictional" not in txt: errs.append("no fictional notice")
    if not re.search(r"sample (content|area|schedule|prices|rates|price guide|projects|jobs)", txt, re.I): errs.append("no sample-content line")
    for m in re.finditer(r"[$£€]\s?\d[\d,.]*", txt):   # templates r5 (23-Nov-2026): prices are zero placeholders, as the r4 beauty/fitness rule
        if re.sub(r"[$£€\s,.]", "", m.group(0)).strip("0"): errs.append(f"price not a zero placeholder: ...{txt[max(0,m.start()-30):m.end()+20].strip()}...")
    if re.search(r"[$£€]\s?\d", txt) and not re.search(r"\bsample (prices?|rates?|price guide)\b", txt, re.I): errs.append("prices shown but no 'sample price' wording")
    if "-project-" in base and "Sample schedule" not in txt: errs.append("project layout without the sample schedule note")
    print(("FAIL " if errs else "ok   ") + base, f"({len(errs)})")
    for e in errs[:14]: print("   ", e)
    fails += bool(errs)
if not seen: print("no pages found"); sys.exit(1)
sys.exit(1 if fails else 0)
