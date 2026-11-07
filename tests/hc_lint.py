#!/usr/bin/env python3
"""Content gate for healthcare template sets. Same rules as tests/n13_lint.py (health list), run on ui-screens/out-hc and on the hand-made health pages.
Usage: python3 tests/hc_lint.py [niche ...]   Exit 1 on any failure."""
import glob, html, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, "..", "ui-screens", "out-hc")
src = open(os.path.join(HERE, "n13_lint.py"), encoding="utf-8").read()
ns = {}
for name in ("REAL", "CLAIMS", "ADVICE", "GEN", "DOMAIN"):
    ns[name] = re.search(rf'^{name} = (r".*")\s*$', src, re.M).group(1); ns[name] = eval(ns[name])
REVIEW = r"(five stars?|★|\breviews?:|\btestimonials?\b|\bpatients? (say|said)\b|\bwhat (our )?(patients|clients|families|owners) say\b)"
def text_of(path):
    s = open(path, encoding="utf-8").read(); body = s.split("<body>", 1)[-1]
    body = re.sub(r"<style.*?</style>|<svg.*?</svg>|<script.*?</script>", " ", body, flags=re.S)
    return html.unescape(re.sub(r"<[^>]+>", " ", body)), s
fails = 0; dirs = sorted(glob.glob(os.path.join(OUT, "*-web-*")))
want = sys.argv[1:]
for d in dirs:
    base = os.path.basename(d)
    if want and not any(base.startswith(w + "-website") for w in want): continue
    txt, raw = text_of(os.path.join(d, "index.html")); errs = []
    for name, rx in [("general", ns["GEN"]), ("real-name", ns["REAL"]), ("domain", ns["DOMAIN"]), ("claim", ns["CLAIMS"]), ("advice", ns["ADVICE"]), ("review", REVIEW)]:
        for m in re.finditer(rx, txt, flags=0 if name == "real-name" else re.I):
            errs.append(f"{name}: ...{txt[max(0,m.start()-40):m.end()+30].strip()}...".replace("\n", " "))
    if re.search(r'<img|url\(http|src="http', re.sub(r"<link[^>]+>", "", raw)): errs.append("external image")
    if re.search(r"\.example\b", txt) is None and "@" in txt: errs.append("email not on .example")
    if re.search(r"\(\d{3}\) (?!01)", txt): errs.append("phone not in fictional (555) 01xx range")
    if "ictional" not in txt: errs.append("no fictional notice")
    if not re.search(r"not (medical|veterinary|clinical) advice|general information", txt, re.I): errs.append("no not-medical-advice line")
    print(("FAIL " if errs else "ok   ") + base, f"({len(errs)})")
    for e in errs[:12]: print("   ", e)
    fails += bool(errs)
sys.exit(1 if fails else 0)
