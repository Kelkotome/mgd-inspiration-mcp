#!/usr/bin/env python3
"""Content gate for wedding and event template sets (9-Nov-2026, fifth industry). Shares GEN, REAL, DOMAIN and CLAIMS with tests/n13_lint.py, plus:
  brand      wedding, invitation, registry, gift, photo, flower, event-ticketing and social platforms, fashion and jewellery houses,
             camera makers, drinks brands and protected wine names (no real brands, platforms or venues)
  award      awards, "featured in", "as seen in", ratings, "best", "famous", "#1"
  review     testimonials, reviews, star ratings, "what couples say", "kind words"
  promise    "stress-free", "perfect day guaranteed", "never miss", "dream wedding" style promises
  legal      marriage law, licences, registrars and legal-ceremony wording. Allowed only in a sentence that tells the owner to check or add their own,
             or that itself says "sample"
  green      eco, sustainable, zero-waste, compostable, organic, locally grown and similar claims (same exception)
  credit     CPD points, accreditation and certificates (conferences; same exception)
  access     "fully accessible" / "wheelchair accessible" claims (same exception; "step-free" describes a sample venue and is fine)
  alcohol    promotions of excess (bottomless, unlimited drinks, happy hour)
Every page also needs: a fictional notice, a sample-content line, phones in the fictional (555) 01xx range, .example email, no external images.
Percentages are allowed only inside tables.
Usage: python3 tests/wd_lint.py [niche ...]   (WD_LINT_OUT=<dir> lints another output folder, for example the hand-built signature)
Exit 1 on any failure."""
import glob, html, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.environ.get("WD_LINT_OUT") or os.path.join(HERE, "..", "ui-screens", "out-hc")
src = open(os.path.join(HERE, "n13_lint.py"), encoding="utf-8").read(); ns = {}
for name in ("REAL", "CLAIMS", "GEN", "DOMAIN"): ns[name] = eval(re.search(rf'^{name} = (r".*")\s*$', src, re.M).group(1))
NICHES = ["wedding", "wedding-invitation", "wedding-planner", "wedding-venue", "wedding-photographer", "florist", "event-planner", "conference"]
BRAND = (r"\b(The Knot|Zola|Minted|WithJoy|Joy app|WeddingWire|Wedding ?Wire|Bridebook|Hitched|Brides magazine|Vogue|Martha Stewart|Paperless Post|Evite|Greenvelope|"
  r"Eventbrite|Ticket ?master|Ticket ?Tailor|Cvent|Hopin|Bizzabo|Whova|Zoom|Microsoft Teams|Webex|Canva|Etsy|Pinterest|Instagram|Facebook|TikTok|WhatsApp|YouTube|"
  r"Spotify|Amazon|John Lewis|Crate (&|and) Barrel|Williams[- ]Sonoma|Target|Tiffany|Cartier|Pandora|Vera Wang|David'?s Bridal|Pronovias|Jenny Packham|"
  r"Canon|Nikon|Sony|Fuji(film)?|Leica|Hasselblad|Adobe|Lightroom|Photoshop|Pixieset|ShootProof|Pic-?Time|Airbnb|Booking\.com|Expedia|Uber|Lyft|"
  r"Interflora|Teleflora|FTD|1-800-Flowers|Bloom (&|and) Wild|Ikea|IKEA|Champagne|Prosecco|Cava|Mo[eë]t|Veuve|Aperol|Guinness|Heineken|Coca[- ]Cola|"
  r"TED|TEDx|SXSW|Web Summit|Disney|Pixar|Marvel|Hilton|Marriott|Hyatt|Four Seasons|Ritz)\b")
AWARD = r"\b(awards?|award[- ]winning|featured in|as seen (in|on)|published in|voted|rated|ratings?|famous|renowned|legendary|best (\w+ )?(in|around|of)\b|the best\b|#1|number one|top[- ]rated|five[- ]star|5[- ]star)"
REVIEW = r"(★|\breviews?\b|\btestimonials?\b|\bwhat (our )?(couples|guests|clients|customers|brides|grooms|attendees|delegates) (say|said)\b|\bkind words\b|\blove notes\b|\bstars?\b)"
PROMISE = r"\b(stress[- ]free|worry[- ]free|hassle[- ]free|flawless|perfect day|dream wedding|never miss|nothing will go wrong|once[- ]in[- ]a[- ]lifetime)\b"
LEGAL = r"\b(legal(ly)?|law|licen[cs](e|es|ed)|registrar|register office|registry office|notice of marriage|marriage certificate|celebrant licen[cs]e|officiant licen[cs]e)\b"
GREEN = r"\b(eco|eco[- ]friendly|sustainab\w*|zero[- ]waste|compostable|biodegradable|carbon[- ](neutral|negative)|net[- ]zero|organic|locally grown|plastic[- ]free|foam[- ]free|green credentials)\b"
CREDIT = r"\b(cpd|ceu|accredit\w*|certif\w*)\b"
ACCESS = r"\b(fully accessible|wheelchair[- ]accessible|accessible to all)\b"
ALCOHOL = r"\b(bottomless|unlimited (drinks|wine|beer|cocktails|bar)|all[- ]you[- ]can[- ]drink|free[- ]flowing|happy hour|two[- ]for[- ]one|2[- ]for[- ]1|shots? for)\b"
OK_SENT = r"\b(sample|check|add your own|ask (us|the venue|your)|confirm with|before you publish)\b"
BLOCK = re.compile(r"</?(p|li|td|th|h[1-6]|summary|div|section|article|aside|header|footer|nav|ul|ol|table|tr|form|label|button|option|legend|span|b|time|figcaption)\b[^>]*>", re.I)
def texts(path):
    s = open(path, encoding="utf-8").read(); body = s.split("<body>", 1)[-1]
    body = re.sub(r"<style.*?</style>|<svg.*?</svg>|<script.*?</script>", " ", body, flags=re.S)
    plain = html.unescape(re.sub(r"<[^>]+>", " ", body))
    notab = html.unescape(re.sub(r"<[^>]+>", " ", re.sub(r"<table.*?</table>", " ", body, flags=re.S)))
    chunks = [html.unescape(re.sub(r"<[^>]+>", " ", c)).strip() for c in BLOCK.split(body)]
    sentences = [x for c in chunks if c for x in re.split(r"(?<=[.!?])\s+", re.sub(r"\s+", " ", c)) if x.strip()]
    return plain, notab, sentences, s, body
fails = 0; want = sys.argv[1:] or NICHES; seen = 0
for d in sorted(glob.glob(os.path.join(OUT, "*-web-*"))):
    base = os.path.basename(d); n = next((x for x in sorted(want, key=len, reverse=True) if base.startswith(x + "-website-")), None)
    if not n: continue
    seen += 1; txt, notab, sents, raw, body = texts(os.path.join(d, "index.html")); errs = []
    for name, rx, t, fl in [("general", ns["GEN"], txt, re.I), ("real-name", ns["REAL"], txt, 0), ("brand", BRAND, txt, 0), ("domain", ns["DOMAIN"], txt, re.I), ("claim", ns["CLAIMS"], notab, re.I),
                            ("award", AWARD, txt, re.I), ("review", REVIEW, txt, re.I), ("promise", PROMISE, txt, re.I), ("alcohol", ALCOHOL, txt, re.I)]:
        for m in re.finditer(rx, t, flags=fl): errs.append(f"{name}: ...{t[max(0,m.start()-40):m.end()+30].strip()}...".replace("\n", " "))
    for s in sents:
        for name, rx in (("legal", LEGAL), ("green", GREEN), ("credit", CREDIT), ("access", ACCESS)):
            if re.search(rx, s, re.I) and not re.search(OK_SENT, s, re.I): errs.append(f"{name} wording not labelled sample or check-your-own: {s[:140]}")
    if re.search(r'<img|url\(http|src="http', re.sub(r"<link[^>]+>", "", raw)): errs.append("external image")
    if "@" in txt and not re.search(r"\.example\b", txt): errs.append("email not on .example")
    for m in re.finditer(r"[\w.+-]+@[\w-]+(\.[\w-]+)+", txt):
        if not m.group(0).endswith(".example"): errs.append(f"email not on .example: {m.group(0)}")
    if re.search(r"\(\d{3}\) (?!01)", txt) or re.search(r"\((?!555)\d{3}\) \d{3}-", txt): errs.append("phone not in fictional (555) 01xx range")
    if "ictional" not in txt: errs.append("no fictional notice")
    if not re.search(r"sample (content|schedule|plan|programme|prices)", txt, re.I): errs.append("no sample-content line")
    print(("FAIL " if errs else "ok   ") + base, f"({len(errs)})")
    for e in errs[:12]: print("   ", e)
    fails += bool(errs)
if not seen: print("no pages found"); sys.exit(1)
sys.exit(1 if fails else 0)
