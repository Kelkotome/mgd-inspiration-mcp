#!/usr/bin/env python3
"""Content gate for real estate template sets (7-Nov-2026). Shares GEN, REAL, DOMAIN and CLAIMS with tests/n13_lint.py, plus fair-housing wording,
real estate brands and portals, and the Realtor trademark. Percentages are allowed only inside fee and terms tables.
Usage: python3 tests/re_lint.py [niche ...]   Exit 1 on any failure."""
import glob, html, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, "..", "ui-screens", "out-hc")
sys.path.insert(0, os.path.join(HERE, "..", "ui-screens"))
src = open(os.path.join(HERE, "n13_lint.py"), encoding="utf-8").read(); ns = {}
for name in ("REAL", "CLAIMS", "GEN", "DOMAIN"): ns[name] = eval(re.search(rf'^{name} = (r".*")\s*$', src, re.M).group(1))
NICHES = ["real-estate", "apartment", "real-estate-agent", "property-management", "luxury-real-estate", "commercial-real-estate", "vacation-rental", "home-builder"]
RE_REAL = r"\b(Zillow|Redfin|Rightmove|Zoopla|Trulia|LoopNet|CoStar|MLS|Airbnb|Vrbo|Booking\.com|Expedia|Tripadvisor|Compass|Keller Williams|RE/?MAX|Sotheby'?s|Christie'?s|Coldwell Banker|Century 21|CBRE|JLL|Cushman|Colliers|Savills|Knight Frank|AppFolio|Buildium|NAR|HUD|RICS|Realtors?|REALTORS?)\b"
FAIR = r"\b(famil(y|ies)(?! room)|family[- ]friendly|perfect for|ideal for|singles?(?![- ]stor)|couples?|bachelors?|empty[- ]nesters?|young professionals?|students?|retirees?|mature|adults? only|no (kids|children)|exclusive|safe (neighbou?rhood|area|street)s?|quiet (residents?|tenants?|neighbours?)|walking distance|church(es)?|christian|able[- ]bodied|romantic)\b"
REVIEW = r"(five stars?|★|\breviews?:|\btestimonials?\b|\bwhat (our )?(clients|buyers|sellers|tenants|guests|owners) say\b|\bsuperhost\b)"
def text_of(path, drop_tables=False):
    s = open(path, encoding="utf-8").read(); body = s.split("<body>", 1)[-1]
    body = re.sub(r"<style.*?</style>|<svg.*?</svg>|<script.*?</script>", " ", body, flags=re.S)
    if drop_tables: body = re.sub(r"<table.*?</table>", " ", body, flags=re.S)
    return html.unescape(re.sub(r"<[^>]+>", " ", body)), s
fails = 0; want = sys.argv[1:] or NICHES
for d in sorted(glob.glob(os.path.join(OUT, "*-web-*"))):
    base = os.path.basename(d); n = next((x for x in sorted(want, key=len, reverse=True) if base.startswith(x + "-website-")), None)
    if not n: continue
    txt, raw = text_of(os.path.join(d, "index.html")); notab, _ = text_of(os.path.join(d, "index.html"), True); errs = []
    for name, rx, t, fl in [("general", ns["GEN"], txt, re.I), ("real-name", ns["REAL"], txt, 0), ("re-brand", RE_REAL, txt, 0), ("domain", ns["DOMAIN"], txt, re.I), ("claim", ns["CLAIMS"], notab, re.I), ("fair-housing", FAIR, txt, re.I), ("review", REVIEW, txt, re.I)]:
        for m in re.finditer(rx, t, flags=fl): errs.append(f"{name}: ...{t[max(0,m.start()-40):m.end()+30].strip()}...".replace("\n", " "))
    if re.search(r'<img|url\(http|src="http', re.sub(r"<link[^>]+>", "", raw)): errs.append("external image")
    if "@" in txt and not re.search(r"\.example\b", txt): errs.append("email not on .example")
    if re.search(r"\(\d{3}\) (?!01)", txt) or re.search(r"\((?!555)\d{3}\) \d{3}-", txt): errs.append("phone not in fictional (555) 01xx range")
    if "ictional" not in txt: errs.append("no fictional notice")
    if not re.search(r"sample content", txt, re.I): errs.append("no sample-content line")
    print(("FAIL " if errs else "ok   ") + base, f"({len(errs)})")
    for e in errs[:12]: print("   ", e)
    fails += bool(errs)
sys.exit(1 if fails else 0)
