#!/usr/bin/env python3
"""Content gate for legal and professional services template sets (templates r6, 24-Nov-2026). Shares GEN, REAL, DOMAIN and CLAIMS with
tests/n13_lint.py (CLAIMS already bans percentages outside tables, guarantees, "proven", "#1" and invented counts), plus:
  firm-brand   real firms, networks, platforms, software, directories, ranking guides, insurers, fund houses, regulators, professional bodies and designations
  credential   licensed, registered, certified, chartered, accredited, admitted, board-certified, regulated, fiduciary, CPA, CFP, CFA, EA, member of ...
               Allowed only in a sentence that says "add your own" or "sample"
  outcome      guarantees, promises, wins, verdicts, settlements, results, "we fight", maximum or biggest refund, "save you", returns, beat the market,
               no win no fee, risk-free. Same allowance as credential
  speed        24/7, same-day, "within N hours", instant, fastest
  award        awards, ratings, best, trusted, leading, top, expert(s), specialist(s), premier, number one
  review       testimonials, reviews, star ratings, "what our clients say", client stories, case results
  stats        invented track records: "N years", "since 19xx/20xx", "over N", "thousands of", "N clients/cases/returns/placements"
Every page also needs: a fictional notice that says "general information" and "not ... advice", a sample-content line, $00 zero-placeholder
fees with "sample fees/prices/rates" wording, phones in the fictional (555) 01xx range, .example email, no external images.
Usage: python3 tests/ps_lint.py [niche ...]   (PS_LINT_OUT=<dir> lints another output folder)
       python3 tests/ps_lint.py --readmes      (theme readmes in ui-screens/out-wp)
Exit 1 on any failure."""
import glob, html, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.environ.get("PS_LINT_OUT") or os.path.join(HERE, "..", "ui-screens", "out-hc")
src = open(os.path.join(HERE, "n13_lint.py"), encoding="utf-8").read(); ns = {}
for name in ("REAL", "CLAIMS", "GEN", "DOMAIN"): ns[name] = eval(re.search(rf'^{name} = (r".*")\s*$', src, re.M).group(1))
NICHES = ["law-firm", "lawyer", "accounting", "tax-preparation", "financial-advisor", "insurance-agency", "consulting", "staffing-agency"]
TRADE = (r"\b(Deloitte|PwC|PricewaterhouseCoopers|EY|Ernst & Young|KPMG|Grant Thornton|BDO|RSM|Baker Tilly|McKinsey|BCG|Boston Consulting|Bain|Accenture|Gartner|"
  r"H&R Block|TurboTax|Jackson Hewitt|Liberty Tax|Intuit|QuickBooks|Xero|Sage|FreshBooks|Wave|Gusto|ADP|Paychex|Expensify|Stripe|PayPal|"
  r"Avvo|Martindale|Super Lawyers|Best Lawyers|Chambers|Legal 500|Justia|FindLaw|Nolo|LegalZoom|Rocket Lawyer|Clio|LexisNexis|Westlaw|DocuSign|"
  r"LinkedIn|Indeed|Glassdoor|ZipRecruiter|Monster|CareerBuilder|Reed|Robert Half|Adecco|Randstad|Manpower|ManpowerGroup|Hays|Kelly Services|Michael Page|Upwork|Fiverr|"
  r"Allstate|State Farm|Geico|GEICO|Progressive|Farmers|Nationwide|Liberty Mutual|Aviva|Allianz|AXA|Lloyd'?s|Zurich|Chubb|MetLife|Prudential|Aflac|Hiscox|Lemonade|"
  r"Vanguard|Fidelity|Schwab|Charles Schwab|Morningstar|BlackRock|Betterment|Wealthfront|Robinhood|Edward Jones|Merrill|Morgan Stanley|Goldman|JPMorgan|"
  r"IRS|HMRC|CRA|ATO|SEC|FINRA|FCA|CFPB|NAIC|ABA|SRA|Law Society|Bar Council|AICPA|ICAEW|ACCA|CIMA|CIPD|SHRM|NAPFA|CFP Board|"
  r"Google Reviews?|Trustpilot|Yelp|BBB|Better Business Bureau|Clutch|Forbes|Fortune|Inc\.|Bloomberg|Which\?)\b")
CRED = r"\b(licen[cs]ed|licen[cs]es?|registered|certified|certificat\w*|chartered|accredit\w*|admitted|board[- ]certified|regulated|authori[sz]ed|fiduciar\w*|CPA|CPAs|CFP|CFA|EA|enrolled agents?|insured|bonded|qualified|fully qualified|member of)\b"
GUAR = r"\b(guarantee[sd]?|warrant(y|ies|ied)|promise[sd]?|we (win|fight)|win(s|ning)? (your|the) case|won|verdicts?|settlements?|case results|maximum refund|biggest refund|bigger refund|save you|returns? on|beat(s|ing)? the market|outperform\w*|no win,? no fee|risk[- ]free|worry[- ]free|peace of mind|aggressive(ly)?)\b"
SPEED = r"(24 ?/ ?7|24 ?hours?|24-hour|round[- ]the[- ]clock|around the clock|same[- ]day|within \d+ (minutes?|mins?|hours?)|in under \d+|\bfastest\b|\binstant(ly)?\b|\bany time, day or night\b)"
AWARD = r"\b(awards?|award[- ]winning|rated|ratings?|voted|trusted|leading|best(?! time)|top[- ]rated|top (quality|notch|class|choice|rated|firm|lawyers?|advisors?)|number one|#1|five[- ]star|5[- ]star|famous|premier|elite|expert(s|ise)?|specialists?|speciali[sz]ing|renowned|world[- ]class)\b"
REVIEW = r"(★|\breviews?\b|\btestimonials?\b|\bwhat (our )?(customers|clients|people) say\b|\bstars?\b|\bhappy (customers|clients)\b|\bclient stories\b|\bsuccess stories\b)"
STATS = r"(\b\d+\+? years\b|\bsince (19|20)\d\d\b|\bover \d|\bthousands of\b|\bhundreds of\b|\b\d[\d,]*\+? (clients|cases|returns|matters|businesses|families|placements|candidates|policies|households|companies|firms)\b(?! a\b))"
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
    for name, rx, tt, fl in [("general", ns["GEN"], t, re.I), ("real-name", ns["REAL"], t, 0), ("firm-brand", TRADE, t, 0), ("domain", ns["DOMAIN"], t, re.I), ("claim", ns["CLAIMS"], notab, re.I),
                             ("speed", SPEED, notab, re.I), ("award", AWARD, t, re.I), ("review", REVIEW, t, re.I), ("stats", STATS, notab, re.I)]:
        for m in re.finditer(rx, tt, flags=fl): errs.append(f"{name}: ...{tt[max(0,m.start()-40):m.end()+30].strip()}...".replace("\n", " "))
    for s in sents:
        for name, rx in [("credential", CRED), ("outcome", GUAR)]:
            if re.search(rx, s, re.I) and not ALLOW.search(s): errs.append(f"{name} not labelled sample or add-your-own: {s[:150]}")
    return errs
if sys.argv[1:2] == ["--readmes"]:  # theme readmes: the same gates (minus the sentence allowances, which the readme states itself), plus no other industry's wording
    OTHER = r"\b(medical|patients?|clinics?|fair housing|allergen\w*|dietary|kitchen's|food hygiene|building, electrical)\b"; bad = 0; n = 0
    for f in sorted(glob.glob(os.path.join(HERE, "..", "ui-screens", "out-wp", "*", "readme.txt"))):
        slug = os.path.basename(os.path.dirname(f))
        if not any(slug.startswith(f"mgd-{x}-") for x in NICHES): continue
        t = open(f, encoding="utf-8").read(); n += 1; errs = []
        for name, rx, fl in [("general", ns["GEN"], re.I), ("real-name", ns["REAL"], 0), ("firm-brand", TRADE, 0), ("other-industry", OTHER, re.I), ("review", REVIEW, re.I)]:
            for m in re.finditer(rx, t, flags=fl): errs.append(f"{name}: ...{t[max(0,m.start()-40):m.end()+30].strip()}...".replace("\n", " "))
        if "not legal, tax, accounting, insurance or financial advice" not in t: errs.append("readme lacks the professional services Before-you-publish lines")
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
    if not re.search(r"general information", txt, re.I) or not re.search(r"not [a-z, ]*advice", txt, re.I): errs.append("notice lacks 'general information' and 'not ... advice'")
    if not re.search(r"sample (content|fees?|prices|rates|price guide)", txt, re.I): errs.append("no sample-content line")
    for m in re.finditer(r"[$£€]\s?\d[\d,.]*", txt):   # prices and fees are zero placeholders, as the r4/r5 rule
        if re.sub(r"[$£€\s,.]", "", m.group(0)).strip("0"): errs.append(f"price not a zero placeholder: ...{txt[max(0,m.start()-30):m.end()+20].strip()}...")
    if re.search(r"[$£€]\s?\d", txt) and not re.search(r"\bsample (prices?|fees?|rates?|price guide)\b", txt, re.I): errs.append("prices shown but no 'sample price' wording")
    print(("FAIL " if errs else "ok   ") + base, f"({len(errs)})")
    for e in errs[:14]: print("   ", e)
    fails += bool(errs)
if not seen: print("no pages found"); sys.exit(1)
sys.exit(1 if fails else 0)
