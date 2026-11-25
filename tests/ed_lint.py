#!/usr/bin/env python3
"""Content gate for education template sets (templates r7, 25-Nov-2026: tenth industry, staged). Modelled on tests/ps_lint.py; shares GEN, REAL,
DOMAIN and CLAIMS with tests/n13_lint.py (CLAIMS already bans percentages outside tables, guarantees, "proven", "#1" and invented counts), plus:
  brand       real schools and universities, exam boards and tests, curriculum and method trademarks, learning platforms and apps, tutoring and
              music/dance franchises, exam and grading bodies, inspectors and regulators, accreditors, ranking tables, review sites
  credential  accredited, licensed, registered, certified, qualified (teachers), inspected, rated (by an inspector), background-/DBS-checked,
              first-aid or CPR trained, ratio. Allowed only in a sentence that says "add your own" or "sample"
  outcome     guarantees, promises, grades/scores going up, pass rates, results, acceptance or admission rates, "get into", top marks, fluent in N,
              job guarantee or placement, "career-ready", scholarships won. Same allowance as credential
  safety      safest, completely/fully/100% safe, secure facility, nut-free/allergen-free, germ-free (policies are owner lines, not claims)
  award       awards, ratings, best, trusted, leading, top, expert(s), specialist(s), premier, outstanding, number one, world-class, prestigious, elite
  review      testimonials, reviews, star ratings, "what parents/students say", success stories
  stats       invented track records: "N years", "since 19xx/20xx", "over N", "thousands of", "N students/families/graduates/alumni"
Every page also needs: a fictional notice that says "general information" and "not ... advice", a sample-content line, $00 zero-placeholder
fees with "sample fees/prices/rates/tuition" wording, phones in the fictional (555) 01xx range, .example email, no external images or photos.
Usage: python3 tests/ed_lint.py [niche ...]   (ED_LINT_OUT=<dir> lints another output folder)
       python3 tests/ed_lint.py --readmes      (theme readmes in ui-screens/out-wp)
       ED_LINT_SELFTEST=1 python3 tests/ed_lint.py   (forced-bad sentences must all fail)
Exit 1 on any failure."""
import glob, html, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.environ.get("ED_LINT_OUT") or os.path.join(HERE, "..", "ui-screens", "out-hc")
src = open(os.path.join(HERE, "n13_lint.py"), encoding="utf-8").read(); ns = {}
for name in ("REAL", "CLAIMS", "GEN", "DOMAIN"): ns[name] = eval(re.search(rf'^{name} = (r".*")\s*$', src, re.M).group(1))
NICHES = ["school", "university", "preschool", "daycare", "tutoring", "online-course", "music-school", "dance-studio"]
BRAND = (r"\b(Harvard|Stanford|Oxford|Cambridge|Yale|Princeton|MIT|Eton|Juilliard|Berklee|Royal Academy|Royal College|Ivy League|Russell Group|"
  r"SAT|PSAT|ACT|GCSEs?|A[- ]levels?|IB|International Baccalaureate|AP|Advanced Placement|IGCSE|GRE|GMAT|LSAT|MCAT|IELTS|TOEFL|Cambridge English|Common Core|"
  r"ABRSM|Trinity College|RSL|Rockschool|LCM|RAD|ISTD|IDTA|Cecchetti|Vaganova|Suzuki|Kod[aá]ly|Orff|Montessori|Waldorf|Steiner|Reggio Emilia|HighScope|Forest School|"
  r"Coursera|Udemy|edX|Skillshare|Teachable|Thinkific|Kajabi|Podia|Moodle|Canvas|Blackboard|Google Classroom|Zoom|Microsoft Teams|Khan Academy|Duolingo|Babbel|Rosetta Stone|MasterClass|LinkedIn Learning|"
  r"Kumon|Sylvan|Mathnasium|Huntington|Kaplan|Princeton Review|Varsity Tutors|Wyzant|Tutor Doctor|Club Z|Bright Horizons|KinderCare|Goddard|Primrose|Tutor Time|La Petite|Busy Bees|Kiddie Academy|"
  r"Yamaha|School of Rock|Arthur Murray|Fred Astaire|Steinway|Fender|Gibson|Roland|"
  r"Ofsted|Estyn|ISI|NAEYC|NAFCC|ECERS|Head Start|Department of Education|DfE|Ministry of Education|WASC|Middle States|NEASC|Cognia|AdvancED|AACSB|ABET|QAA|TEF|"
  r"US News|U\.S\. News|QS|Times Higher Education|THE rankings|Niche\.com|GreatSchools|Care\.com|Winnie|Google Reviews?|Trustpilot|Yelp|BBB|Facebook|Instagram|TikTok|YouTube|WhatsApp)\b")
CRED = (r"\b(licen[cs]ed|licen[cs]es?|registered|certified|certificat\w*|chartered|accredit\w*|inspected|inspections?|graded|qualified|fully qualified|"
  r"background[- ]checked|background checks?|DBS|vetted|first[- ]aid (trained|certified)|CPR|ratios?|member of|degree[- ]holding|PhD|doctorate)\b")
GUAR = (r"\b(guarantee[sd]?|warrant(y|ies|ied)|promise[sd]?|grades? (go(es)? up|improve\w*|rise|jump)|improve (your|their) (grades?|scores?|marks)|better (grades|scores|marks)|higher (grades|scores|marks)|"
  r"pass rates?|results|acceptance rates?|admission rates?|get (you |them )?into|top marks|straight a'?s|fluent in|fluency in \d|job[- ](guarantee|placement|ready)|career[- ]ready|hired|placements?|scholarships? (won|awarded)|"
  r"risk[- ]free|worry[- ]free|peace of mind|transform\w*|unlock (your|their) (full )?potential)\b")
SAFETY = r"\b(safest|completely safe|fully safe|100 ?% safe|totally safe|secure facility|nut[- ]free|allergen[- ]free|allergy[- ]free|germ[- ]free|hygienic|sanitis\w+|sanitiz\w+)\b"
SPEED = r"(24 ?/ ?7|round[- ]the[- ]clock|around the clock|same[- ]day|within \d+ (minutes?|mins?|hours?)|in under \d+|\bfastest\b|\binstant(ly)?\b)"
AWARD = (r"\b(awards?|award[- ]winning|rated|ratings?|voted|trusted|leading|best(?! time)|top[- ]rated|top (quality|notch|class|choice|rated|school|university|tutors?|teachers?)|number one|#1|"
  r"five[- ]star|5[- ]star|famous|premier|elite|expert(s|ise)?|specialists?|speciali[sz]ing|renowned|world[- ]class|outstanding|excellent|excellence|prestigious|acclaimed|celebrated|gifted)\b")
REVIEW = r"(★|\breviews?\b|\btestimonials?\b|\bwhat (our )?(parents|students|families|learners|pupils|alumni|graduates|customers|people) say\b|\bstars?\b|\bhappy (parents|students|families)\b|\bsuccess stories\b|\bloved by\b)"
STATS = r"(\b\d+\+? years\b(?! old)|\bsince (19|20)\d\d\b|\bover \d|\bthousands of\b|\bhundreds of\b|\b\d[\d,]*\+? (students|pupils|families|graduates|alumni|learners|children|kids|parents|dancers|musicians|enrolments|enrollments)\b)"
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
        for name, rx in [("credential", CRED), ("outcome", GUAR)]:
            if re.search(rx, s, re.I) and not ALLOW.search(s): errs.append(f"{name} not labelled sample or add-your-own: {s[:150]}")
    return errs
if os.environ.get("ED_LINT_SELFTEST"):
    bad = ["All our teachers are fully qualified.", "Grades go up within a term.", "Rated outstanding by inspectors.", "Read what parents say about us.", "Over 500 students since 2004.",
           "Kumon-style worksheets.", "A completely safe, nut-free building.", "Our 1:4 ratio keeps groups small.", "Get into the university of your choice.", "Tuition $450 a term."]
    miss = [b for b in bad if not gate(b, [b], b) and not re.search(r"[$£€]\s?[1-9]", b)]
    print("selftest", "ok" if not miss else f"MISSED {miss}"); sys.exit(1 if miss else 0)
if sys.argv[1:2] == ["--readmes"]:  # theme readmes: the same gates (minus the sentence allowances, which the readme states itself), plus no other industry's wording
    OTHER = r"\b(medical|patients?|clinics?|fair housing|allergen\w*|dietary|kitchen's|food hygiene|building, electrical|legal, tax)\b"; bad = 0; n = 0
    for f in sorted(glob.glob(os.path.join(HERE, "..", "ui-screens", "out-wp", "*", "readme.txt"))):
        slug = os.path.basename(os.path.dirname(f))
        if not any(slug.startswith(f"mgd-{x}-") for x in NICHES): continue
        t = open(f, encoding="utf-8").read(); n += 1; errs = []
        for name, rx, fl in [("general", ns["GEN"], re.I), ("real-name", ns["REAL"], 0), ("brand", BRAND, 0), ("other-industry", OTHER, re.I), ("review", REVIEW, re.I)]:
            for m in re.finditer(rx, t, flags=fl): errs.append(f"{name}: ...{t[max(0,m.start()-40):m.end()+30].strip()}...".replace("\n", " "))
        if "not education, childcare or legal advice" not in t: errs.append("readme lacks the education Before-you-publish lines")
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
    if not re.search(r"sample (content|fees?|prices|rates|tuition|price guide)", txt, re.I): errs.append("no sample-content line")
    for m in re.finditer(r"[$£€]\s?\d[\d,.]*", txt):   # fees are zero placeholders (r4/r5/r6 rule)
        if re.sub(r"[$£€\s,.]", "", m.group(0)).strip("0"): errs.append(f"price not a zero placeholder: ...{txt[max(0,m.start()-30):m.end()+20].strip()}...")
    if re.search(r"[$£€]\s?\d", txt) and not re.search(r"\bsample (prices?|fees?|rates?|tuition|price guide)\b", txt, re.I): errs.append("prices shown but no 'sample fees' wording")
    if n in ("school", "preschool", "daycare", "tutoring", "music-school", "dance-studio") and not re.search(r"safeguarding|child protection|child safety", txt, re.I): errs.append("no add-your-own safeguarding line (children's niche)")
    print(("FAIL " if errs else "ok   ") + base, f"({len(errs)})")
    for e in errs[:14]: print("   ", e)
    fails += bool(errs)
if not seen: print("no pages found"); sys.exit(1)
sys.exit(1 if fails else 0)
