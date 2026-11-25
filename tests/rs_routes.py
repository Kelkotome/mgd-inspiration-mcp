#!/usr/bin/env python3
"""Restructure round (25-Nov-2026, flat URLs + visible hierarchy) route guarantees, against a local (or the live) Worker:
- no URL moves: every tree path (hubs, niches, WordPress pages, theme pages) answers 200 directly, no redirect
- 6 live category pages (standalone, flat): 200, self-canonical (query filters canonicalise to the page), BreadcrumbList with the "Website templates" root,
  FAQPage, counted designs, links to every industry hub and niche in them, the benchmark modules; the not-yet-live one 404s
- the hub shows the category block and the "Website templates" crumb; industry hubs link their category; healthcare groups render as H2 sections;
  the Medical and Dental pages carry the child-link module; Cardiology's crumb reads ... Healthcare > Medical > Cardiology on its flat URL
- the sitemap lists the category pages and every tree path
usage: rs_routes.py http://127.0.0.1:8873/inspiration [--sample N]   (--sample: N theme pages only, for live spot checks)"""
import json, re, sys, os, subprocess, urllib.request, urllib.error, time
BASE = sys.argv[1].rstrip("/"); ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SAMPLE = int(sys.argv[sys.argv.index("--sample") + 1]) if "--sample" in sys.argv else 0
TREE = json.loads(subprocess.run(["node", "--import", f"{ROOT}/tests/ui_rank/register.mjs", f"{ROOT}/tests/tree_dump.mjs"], capture_output=True, text=True, check=True).stdout)
TN = {n["id"]: n for n in TREE["niches"]}; CATSEGS = {c["seg"] for c in TREE["categories"]}
class NoRedir(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *a): return None
op = urllib.request.build_opener(NoRedir)
def get(path):
    u = path if path.startswith("http") else BASE + path
    for i in range(5):
        try: r = op.open(urllib.request.Request(u, headers={"User-Agent": "curl/8.4.0", "Accept": "*/*"}), timeout=60); return r.status, dict(r.headers), r.read().decode("utf-8", "replace")
        except urllib.error.HTTPError as e: return e.code, dict(e.headers), e.read().decode("utf-8", "replace")
        except Exception:
            if i == 4: raise
            time.sleep(2 * (i + 1))
fails = checks = 0
def ck(ok, msg):
    global fails, checks; checks += 1
    if not ok: fails += 1; print("FAIL", msg)
canon = lambda b, p: re.search(r'rel="canonical" href="[^"]*' + re.escape(p) + '"', b)
# 1. no URL moves
paths = [p for p in TREE["paths"] if p not in CATSEGS]
themes = [p for p in paths if p.count("/") == 3 and p.startswith("wordpress-themes/")]; rest = [p for p in paths if p not in themes]
if SAMPLE: themes = themes[:: max(1, len(themes) // SAMPLE)][:SAMPLE]
for p in rest + themes:
    s, h, b = get("/ui/" + p); ck(s == 200, f"/ui/{p} status {s} (must stay put, no redirect)")
# 2. categories
cats = [c for c in TREE["categories"] if c["live"]]; ck(len(cats) == 6, f"6 live categories, got {len(cats)}")
for c in TREE["categories"]:
    p = "/ui/" + c["seg"]; s, h, b = get(p)
    if not c["live"]: ck(s == 404, f"{p} not live yet should be 404, got {s}"); continue
    ck(s == 200, f"{p} {s}"); ck(canon(b, p), f"{p} canonical")
    s2, _, b2 = get(p + "?style=minimal&device=web"); ck(s2 == 200 and canon(b2, p), f"{p} query filter canonicalises to the page")
    ck('"BreadcrumbList"' in b and '"Website templates"' in b, f"{p} BreadcrumbList with Website templates"); ck('"FAQPage"' in b and '"ItemList"' in b, f"{p} FAQPage + ItemList")
    ck(f"<h1>{c['h1']}</h1>" in b, f"{p} h1 {c['h1']}"); ck(f"{c['designs']} free one-page website templates" in b, f"{p} counted designs {c['designs']}")
    for iid in c["industries"]:
        ind = next(i for i in TREE["industries"] if i["id"] == iid); ck(f'/ui/{ind["hub"]}"' in b, f"{p} links hub {ind['hub']}")
        for n in TREE["niches"]:
            if n["industry"] == iid and n["htmlLive"]: ck(f'/ui/{n["nest"]}"' in b, f"{p} links {n['nest']}")
    for mod in ["Looking for a more specific type?", "Which sections each kind of site needs", "How to choose", "Questions", "Can't find your"]: ck(mod in b, f"{p} module {mod}")
    ck(re.search(r"<b>MGD [^<]+ \([^)]+\)</b>", b), f"{p} niche-labelled template cards")
    s, h, m = get(p + ".md"); ck(s == 200 and "text/markdown" in h.get("Content-Type", "") and c["h1"] in m, f"{p}.md")
# 3. hub, industry hubs, groups, crumbs
s, h, b = get("/ui/website-templates"); ck(s == 200 and "By category" in b, "hub category block"); ck('UI screens</a> › Website templates</nav>' in b, "hub crumb reads Website templates")
for c in cats: ck(f'/ui/{c["seg"]}"' in b, f"hub links {c['seg']}")
for ind in TREE["industries"]:
    if not ind["live"]: continue
    s, h, b = get("/ui/" + ind["hub"]); ck(s == 200, f"{ind['hub']} {s}")
    ck("Templates</a> ›" not in b and ">Website templates</a>" in b, f"{ind['hub']} crumb root label"); cat = next(c for c in TREE["categories"] if c["id"] == ind["category"]); ck(f'/ui/{cat["seg"]}"' in b, f"{ind['hub']} links its category")
    ck('"BreadcrumbList"' in b and f'"{cat["label"]}"' in b, f"{ind['hub']} BreadcrumbList carries {cat['label']}")
s, h, b = get("/ui/healthcare-website-templates"); live = [g["id"] for g in next(i for i in TREE["industries"] if i["id"] == "healthcare")["groups"] if g["live"]]
ck(all(f'id="{g}"' in b for g in live) and 'id="nutrition-care"' not in b, f"healthcare grid grouped under {live}")
s, h, b = get("/ui/wordpress-themes/healthcare"); ck(s == 200 and 'id="medical"' in b, "WordPress healthcare grouped")
for parent in ["medical", "dental"]:
    n = TN[parent]; s, h, b = get("/ui/" + n["nest"]); ck(s == 200 and 'id="specialties"' in b and "Looking for a more specific" in b, f"{parent} child-link module")
    for k in n["children"]: ck(f'/ui/{TN[k]["nest"]}"' in b, f"{parent} links {k}")
    s, h, b = get("/ui/" + n["wp"]); ck(all(f'/ui/{TN[k]["wp"]}"' in b for k in n["children"]), f"{parent} WordPress page lists specialty themes")
s, h, b = get("/ui/" + TN["cardiology"]["nest"]); flat = b.replace(" ", "")
ck('"name":"Medical"' in flat and '"name":"Healthandwellness"' in flat, "cardiology BreadcrumbList has Health and wellness and Medical")
ck("Medical</a> › Cardiology</nav>" in b, "cardiology visible crumb ends Medical › Cardiology"); ck("Part of medical" in b and f'/ui/{TN["hospital"]["nest"]}"' in b, "cardiology sibling strip")
s, h, b = get("/ui/" + TN["cardiology"]["wp"] + "/" + TN["cardiology"]["themes"][0]); ck(s == 200 and '"name":"WordPressthemes"' in b.replace(" ", "") and '"name":"Medical"' in b.replace(" ", ""), "theme crumbs: UI screens › WordPress themes › Healthcare › Medical › Cardiology › theme")
# 4. sitemap
s, h, b = get("/ui/sitemap.xml"); urls = re.findall(r"<loc>([^<]+)</loc>", b); sp = {u.split("/inspiration", 1)[-1] for u in urls}
ck(len(urls) == len(sp), "sitemap duplicates")
for p in TREE["paths"]: ck("/ui/" + p in sp, f"sitemap misses {p}")
for bad in ["/ui/online-store-website-templates", "/ui/website-templates/health-and-wellness", "/ui/healthcare-website-templates/medical-website-template/cardiology-website-template", "/ui/business-website-templates/x"]:
    s, _, _ = get(bad); ck(s == 404, f"{bad} should be 404, got {s}")
print(f"{checks} checks, {fails} failed"); sys.exit(1 if fails else 0)
