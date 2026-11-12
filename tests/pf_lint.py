#!/usr/bin/env python3
"""Content gate for portfolio and creative studio template sets (13-Nov-2026, sixth industry). Shares GEN, REAL, DOMAIN and CLAIMS with tests/n13_lint.py, plus:
  brand      software, code, cloud, social, portfolio, stock, marketing and analytics platforms, camera makers, furniture and paint brands,
             design press and award schemes (no real brands, platforms or clients)
  award      awards, shortlists, "featured in", "as seen in", ratings, "best", "famous", "#1", "award-winning"
  review     testimonials, client or customer reviews ("code review" and "design review" are services), star ratings, "what clients say", "kind words", "trusted by", logo walls of clients
  metric     invented results and audience figures: follower or client counts, "ROI", traffic / sales / leads growth, "x times", conversion rates
  promise    guarantees, "rank first", "page one", "go viral", "skyrocket", "10x" style promises
  pro        professional status (registered or chartered architects, licensed designers, insured, accredited, certified, "member of").
             Allowed only in a sentence that tells the owner to add or check their own, or that itself says "sample"
Every page also needs: a fictional notice, a sample-content line, phones in the fictional (555) 01xx range, .example email, no external images.
Percentages are allowed only inside tables.
Usage: python3 tests/pf_lint.py [niche ...]   (PF_LINT_OUT=<dir> lints another output folder)
Exit 1 on any failure."""
import glob, html, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.environ.get("PF_LINT_OUT") or os.path.join(HERE, "..", "ui-screens", "out-hc")
src = open(os.path.join(HERE, "n13_lint.py"), encoding="utf-8").read(); ns = {}
for name in ("REAL", "CLAIMS", "GEN", "DOMAIN"): ns[name] = eval(re.search(rf'^{name} = (r".*")\s*$', src, re.M).group(1))
NICHES = ["personal-portfolio", "developer-portfolio", "graphic-designer", "photography", "interior-design", "architecture", "agency", "marketing-agency"]
BRAND = (r"\b(Meta|Instagram|Facebook|TikTok|LinkedIn|Twitter|YouTube|Vimeo|Pinterest|Snapchat|Threads|Behance|Dribbble|Figma|Sketch app|Adobe|Photoshop|Adobe Illustrator|InDesign|"
  r"Lightroom|After Effects|Premiere|Canva|Framer|Webflow|Squarespace|Wix|Shopify|Notion|Miro|Trello|Asana|Jira|React|Vue(\.js)?|Angular|Svelte|Next\.js|Node(\.js)?|"
  r"Python|JavaScript|TypeScript|Kotlin|Swift|Rust|Golang|PHP|Ruby on Rails|Django|Laravel|GitHub|GitLab|Bitbucket|Stack Overflow|Vercel|Netlify|Heroku|Docker|Kubernetes|"
  r"PostgreSQL|MySQL|MongoDB|Firebase|Supabase|Mailchimp|Klaviyo|Semrush|Ahrefs|Moz|Hootsuite|Buffer|Google Ads|Unsplash|Getty|Shutterstock|"
  r"Canon|Nikon|Sony|Fuji(film)?|Leica|Hasselblad|Pantone|IKEA|Ikea|Herman Miller|Vitra|Eames|Knoll|Farrow (&|and) Ball|Dulux|Benjamin Moore|Autodesk|AutoCAD|Revit|"
  r"SketchUp|Rhino|ArchiCAD|Houzz|ArchDaily|Dezeen|Wallpaper\*?|Cannes Lions|D&AD|Webby|Awwwards|Clutch|Forbes|Wired|Vogue|Apple|Samsung|Nike|Coca[- ]Cola)\b")
AWARD = r"\b(awards?|award[- ]winning|shortlist\w*|featured in|as seen (in|on)|published in|voted|rated|ratings?|famous|renowned|legendary|best (\w+ )?(in|around|of)\b|the best\b|#1|number one|top[- ]rated|five[- ]star|5[- ]star|world[- ]class|industry[- ]leading)"
REVIEW = r"(★|\b(client|customer|guest|user|google|glowing|verified|5[- ]star|five[- ]star|read (our|the)|leave (us )?a) reviews?\b|\btestimonials?\b|\bwhat (our )?(clients|customers|people|brands|partners|employers|students) (say|said)\b|\bkind words\b|\btrusted by\b|\b(our|recent|selected) clients include\b|\bstars?\b)"
METRIC = (r"\b(\d[\d,.]*\s?(k|m)?\+? (followers|subscribers|clients|brands|downloads|users|visitors|likes|views|leads|sign[- ]ups)|roi|return on investment|"
  r"(increase[ds]?|grew|growth in|boost(ed|s)?|doubled|tripled|lifted|drove) (their |the |its )?(traffic|sales|leads|revenue|conversions|bookings|followers|engagement|sign[- ]ups)|"
  r"conversion rates?|\d+(\.\d+)? ?x (more|faster|growth)|\d+x\b)")
PROMISE = r"\b(guarantee\w*|rank (first|#?1|on page one)|page one of|first page of|go viral|viral|skyrocket\w*|explode your|10x|overnight success|instant results)\b"
PRO = r"\b(registered architects?|chartered|licensed (architects?|designers?|engineers?|photographers?)|fully insured|insured|accredit\w*|certif\w*|member of)\b"
OK_SENT = r"\b(sample|check|add your own|before you publish)\b"
BLOCK = re.compile(r"</?(p|li|td|th|h[1-6]|summary|div|section|article|aside|header|footer|nav|ul|ol|table|tr|form|label|button|option|legend|span|b|time|figcaption|dt|dd)\b[^>]*>", re.I)
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
    if not n or (n == "agency" and base.startswith("marketing-agency-")): continue
    seen += 1; txt, notab, sents, raw, body = texts(os.path.join(d, "index.html")); errs = []
    for name, rx, t, fl in [("general", ns["GEN"], txt, re.I), ("real-name", ns["REAL"], txt, 0), ("brand", BRAND, txt, 0), ("domain", ns["DOMAIN"], txt, re.I), ("claim", ns["CLAIMS"], notab, re.I),
                            ("award", AWARD, txt, re.I), ("review", REVIEW, txt, re.I), ("metric", METRIC, notab, re.I), ("promise", PROMISE, txt, re.I)]:
        for m in re.finditer(rx, t, flags=fl): errs.append(f"{name}: ...{t[max(0,m.start()-40):m.end()+30].strip()}...".replace("\n", " "))
    for s in sents:
        if re.search(PRO, s, re.I) and not re.search(OK_SENT, s, re.I): errs.append(f"pro-status wording not labelled sample or add-your-own: {s[:140]}")
    if re.search(r'<img|url\(http|src="http', re.sub(r"<link[^>]+>", "", raw)): errs.append("external image")
    if "@" in txt and not re.search(r"\.example\b", txt): errs.append("email not on .example")
    for m in re.finditer(r"[\w.+-]+@[\w-]+(\.[\w-]+)+", txt):
        if not m.group(0).endswith(".example"): errs.append(f"email not on .example: {m.group(0)}")
    if re.search(r"\(\d{3}\) (?!01)", txt) or re.search(r"\((?!555)\d{3}\) \d{3}-", txt): errs.append("phone not in fictional (555) 01xx range")
    if "ictional" not in txt: errs.append("no fictional notice")
    if not re.search(r"sample (content|projects?|story|case study|project story)", txt, re.I): errs.append("no sample-content line")
    print(("FAIL " if errs else "ok   ") + base, f"({len(errs)})")
    for e in errs[:12]: print("   ", e)
    fails += bool(errs)
if not seen: print("no pages found"); sys.exit(1)
print(f"{seen - fails}/{seen} pages pass")
sys.exit(1 if fails else 0)
