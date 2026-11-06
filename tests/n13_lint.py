#!/usr/bin/env python3
"""Content + layout gate for n13 page templates. Reads ui-screens/out/<pattern>-homepage-*/index.html (rendered text, no <style>/<svg>).
Usage: python3 tests/n13_lint.py [pattern ...]   (default: every n13 pattern with output). Exit 1 on any failure."""
import glob, html, json, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, "..", "ui-screens", "out")
HEALTH = ["medical-website","cardiology-website","dermatology-website","therapist-website","physical-therapy-website","veterinary-website","pediatrics-website","orthodontics-website","fertility-website"]
FINANCE = ["financial-advisor-website"]
OTHER = ["cleaning-service-website","hvac-website","cybersecurity-website","crm-landing-page","coaching-website","pest-control-website","solar-website","ai-agent-website","preschool-website","apartment-website"]
ALL = HEALTH + FINANCE + OTHER
# real brands / bodies / programmes that must not appear in any fictional page
REAL = r"\b(Invisalign|Botox|Dysport|Juvederm|Medicare|Medicaid|NHS|Bupa|Aetna|Cigna|Humana|Kaiser|BlueCross|Blue Cross|Mayo Clinic|Cleveland Clinic|Johns Hopkins|Harvard|Stanford|Oxford|Cambridge|Yale|AHA|ACC|FDA|CQC|JCI|Joint Commission|AAD|ADA|AAO|HCPC|BACP|APA|CFP|CFA|FINRA|SEC|FCA|SOC ?2|ISO ?27001|HIPAA|GDPR|Salesforce|HubSpot|Slack|Gmail|Google|Microsoft|AWS|Azure|Okta|Datadog|Carrier|Trane|Lennox|Daikin|Tesla|Powerwall|ChatGPT|OpenAI|Anthropic|Claude|Stripe|Zapier|Shopify)\b"
CLAIMS = r"(\d+\s?%|\b(cure[sd]?|guarantee[sd]?|proven|miracle|risk[- ]free|painless|pain[- ]free|permanent(ly)? (results?|fix)|success rate|survival rate|best in|#1|no\.? ?1\b|top[- ]rated|award[- ]winning|board[- ]certified|accredited by|certified by|voted|patients? (treated|served|helped)|clinically proven|world[- ]class|leading (expert|specialist)|\d[\d,]* (\+ )?(patients|clients|cases|procedures|reviews)|\d(\.\d)? ?(stars?|/ ?5)|we won|verdicts?|settlements?|recovered \$)\b)"
FIN = r"(\b(guaranteed returns?|beat the market|outperform\w*|\d+\s?% (returns?|a year|annual))\b|\b(AUM|assets under management)\b)"
ADVICE = r"\b(you should (take|stop|start|increase|reduce)|take \d+ ?mg|\d+ ?mg\b|dose|dosage)\b"
GEN = r"(lorem ipsum|\bTODO\b|FIXME|\bundefined\b|\[object|(?-i:\bNaN\b)|\bnull\b|—)"
DOMAIN = r"\b[a-z0-9-]+\.(com|org|net|co|io)\b"
def text_of(path):
    s = open(path, encoding="utf-8").read()
    body = s.split("<body>", 1)[-1]
    body = re.sub(r"<style.*?</style>|<svg.*?</svg>|<script.*?</script>", " ", body, flags=re.S)
    return html.unescape(re.sub(r"<[^>]+>", " ", body)), s
fails = 0
pats = sys.argv[1:] or [p for p in ALL if glob.glob(os.path.join(OUT, p + "-homepage-web-minimal"))]
for p in pats:
    dirs = sorted(glob.glob(os.path.join(OUT, p + "-homepage-*")))
    errs = []
    if len(dirs) != 16: errs.append(f"{len(dirs)} screens, want 16")
    txt, raw = text_of(os.path.join(dirs[0], "index.html"))
    pats_ = [("general", GEN), ("real-name", REAL), ("domain", DOMAIN)]
    if p in HEALTH: pats_ += [("claim", CLAIMS), ("advice", ADVICE)]
    if p in FINANCE: pats_ += [("claim", CLAIMS), ("fin", FIN)]
    for name, rx in pats_:
        for m in re.finditer(rx, txt, flags=0 if name in ("real-name",) else re.I):
            errs.append(f"{name}: …{txt[max(0,m.start()-40):m.end()+30].strip()}…".replace("\n"," "))
    if re.search(r'<img|url\(http|src="http', re.sub(r"<link[^>]+>", "", raw)): errs.append("external image")
    if re.search(r"\.example\b", txt) is None and "@" in txt: errs.append("email not on .example")
    if re.search(r"\(\d{3}\) (?!01)", txt): errs.append("phone not in fictional (555) 01xx range")
    if p in HEALTH + FINANCE and "ictional" not in txt: errs.append("no fictional/sample notice in page")
    if p in HEALTH and not re.search(r"not (medical|veterinary|clinical) advice|general information", txt, re.I): errs.append("no not-medical-advice line")
    for d in dirs:
        m = json.load(open(os.path.join(d, "meta.json")))
        cap = 5600 if m["platform"] == "web" else 8000
        if m["viewport"]["h"] >= cap: errs.append(f"clipped at cap: {os.path.basename(d)}")
        if not os.path.exists(os.path.join(d, "screen-dark.png")): errs.append(f"no dark shot: {os.path.basename(d)}")
    print(("FAIL " if errs else "ok   ") + p, f"({len(errs)})")
    for e in errs[:25]: print("   ", e)
    fails += bool(errs)
sys.exit(1 if fails else 0)
