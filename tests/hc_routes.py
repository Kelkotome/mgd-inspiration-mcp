#!/usr/bin/env python3
"""Route guarantees for the template tree, against a local Worker. Every old URL reaches its nested page in exactly one 301; nested pages return 200 with a
self-canonical, BreadcrumbList and no flat healthcare link; filters canonicalise to the page they filter; the sitemap lists nested URLs only; unlisted patterns stay flat.
usage: hc_routes.py http://127.0.0.1:8873/inspiration"""
import json, re, sys, urllib.request, urllib.error, os
BASE = sys.argv[1].rstrip("/"); ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
cat = json.load(open(f"{ROOT}/src/tpl_catalog.json")); tree = open(f"{ROOT}/src/ui_tree.js").read(); seo = open(f"{ROOT}/src/ui_seo.js").read()
# IND=real-estate tests the second industry (7-Nov-2026); default healthcare. The niche rows are read from that industry's block in ui_tree.js.
IND = os.environ.get("IND", "healthcare"); blk = (tree.split(f'"{IND}": {{', 1) if f'"{IND}": {{' in tree else tree.split(f"{IND}: {{", 1))[1].split("appPatterns", 1)[0]
NICHES = re.findall(r'\["([a-z-]+)", "([a-z-]+-website)", "[^"]+", "([a-z-]+-website-template)", "([a-z-]+)"\]', blk); HUB = f"{IND}-website-templates"; WP = "wordpress-themes"; ISEG = IND
class NoRedir(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *a): return None
op = urllib.request.build_opener(NoRedir)
def get(path):
    u = path if path.startswith("http") else BASE + path
    try: r = op.open(urllib.request.Request(u, headers={"User-Agent": "curl/8.4.0", "Accept": "*/*"}), timeout=60); return r.status, dict(r.headers), r.read()
    except urllib.error.HTTPError as e: return e.code, dict(e.headers), e.read()
fails = 0; checks = 0
def ck(ok, msg):
    global fails, checks; checks += 1
    if not ok: fails += 1; print("FAIL", msg)
def text(path): s, h, b = get(path); return s, h, b.decode("utf-8", "replace")
def one_hop(old, want):
    s, h, _ = get(old); ck(s == 301, f"{old}: status {s}"); loc = h.get("Location") or h.get("location") or ""
    p = loc.split("/inspiration", 1)[-1]; ck(p == want, f"{old}: went to {p}, want {want}")
    s2, h2, _ = get(loc.replace("https://madegooddesigns.com/inspiration", BASE)); ck(s2 == 200, f"{old}: target {p} status {s2}")
hits = []
for nid, pat, htmlSeg, seg in NICHES:
    nest = f"/ui/{HUB}/{htmlSeg}"; n = cat["niches"][nid]; live = len([d for d in n["designs"] if d["distinct"]]) >= 6
    ck(live, f"{nid} below the page test"); hits.append(nest)
    fs = re.search(rf'"{pat}": \["([a-z0-9-]+)"', seo); flat = fs.group(1) if fs else None   # the flat keyword URL live today (PATTERN_SEO), for example restaurant-website-template
    for old, want in ([(f"/ui/{flat}", nest), (f"/ui/{flat}/", nest)] if flat and flat != htmlSeg else []) + [(f"/ui/{htmlSeg}", nest), (f"/ui/{pat}", nest), (f"/ui/{htmlSeg}/", nest), (f"/ui/{pat}/", nest), (f"{nest}/", nest), (f"/ui?pattern={pat}", nest), (f"/ui/{htmlSeg}?style=minimal", nest + "?style=minimal"), (f"/ui?pattern={pat}&platform=web&style=luxury", nest + "?device=web&style=luxury")]:
        one_hop(old, want)
    s, h, b = text(nest); ck(s == 200, f"{nest} {s}"); ck(f'rel="canonical" href="{BASE}{nest}"' in b or f'href="{BASE}{nest}" rel="canonical"' in b or re.search(r'rel="canonical" href="[^"]*' + re.escape(nest) + '"', b), f"{nest} canonical"); ck('"BreadcrumbList"' in b, f"{nest} crumbs")
    ck(f"/ui/{WP}/{ISEG}/{seg}" in b, f"{nest} cross-link to WordPress"); ck("distinct designs" in b, f"{nest} designs block"); g = b.split("distinct designs", 1)[-1].split("Every screen", 1)[0]; ck(len(re.findall(r'class="card page"', g)) == len([d for d in n["designs"] if d["distinct"]]), f"{nest} shows every design")
    # filters stay on the page and canonicalise to it
    s, h, b = text(nest + "?style=minimal&device=web"); ck(s == 200 and re.search(r'rel="canonical" href="[^"]*' + re.escape(nest) + '"', b), f"{nest} filter canonical")
    s, h, b = text(f"{nest}.md"); ck(s == 200 and "text/markdown" in h.get("Content-Type", "") and nest in h.get("Link", ""), f"{nest}.md"); ck(f"/ui/{WP}/{ISEG}/{seg}" in b, f"{nest}.md nested link")
    wp = f"/ui/{WP}/{ISEG}/{seg}"; s, h, b = text(wp); ck(s == 200, f"{wp} {s}"); ck(re.search(r'rel="canonical" href="[^"]*' + re.escape(wp) + '"', b), f"{wp} canonical"); ck('"BreadcrumbList"' in b, f"{wp} crumbs"); ck(nest in b, f"{wp} back to HTML")
    ck(len(re.findall(r'class="card page" data-style', b)) == len([d for d in n["designs"] if d.get("theme")]), f"{wp} theme cards")
    s, h, b = text(wp + "?style=minimal"); ck(s == 200 and re.search(r'rel="canonical" href="[^"]*' + re.escape(wp) + '"', b), f"{wp} filter canonical")
    s, h, m = text(wp + ".md"); ck(s == 200 and "download/wordpress" in m, f"{wp}.md")
    for d in n["designs"]:
        if not d.get("theme"): continue
        t = d["theme"]["slug"]; ip = f"{wp}/{t}"; s, h, b = text(ip); ck(s == 200, f"{ip} {s}"); ck(f"/ui/download/wordpress/{t}.zip" in b, f"{ip} download link"); ck("Upload Theme" in b, f"{ip} install steps"); ck('"SoftwareSourceCode"' in b, f"{ip} ld")
        s, h, m = text(ip + ".md"); ck(s == 200 and t in m, f"{ip}.md")
        s, h, bp = text(f"/ui/download/wordpress/{t}.blueprint.json"); ck(s == 200 and any(x["step"] == "installTheme" for x in json.loads(bp)["steps"]), f"{t} blueprint")
for p in [f"/ui/{HUB}", f"/ui/{WP}", f"/ui/{WP}/{ISEG}", "/ui", "/ui/website-templates"]:
    s, h, b = text(p); ck(s == 200, f"{p} {s}")
    for nid, pat, htmlSeg, seg in NICHES:
        ck(f'/ui/{htmlSeg}"' not in b, f"{p} has flat link to {htmlSeg}")
s, h, b = text(f"/ui/{HUB}"); ck('"BreadcrumbList"' in b and all(nest in b for nest in hits), "hub links every niche")
for x in ["clinic-home", "doctor-directory", "telehealth-visit"]: pass
# downloads: the throwaway bucket holds a sample of the files; every one present must match the catalog hash, and its screenshots must serve
import hashlib
got = 0
for nid, n in cat["niches"].items():
    for d in n["designs"]:
        th = d.get("theme")
        if not th: continue
        s, h, b = get(f"/ui/download/wordpress/{th['slug']}.zip")
        if s == 200:
            got += 1; ck(hashlib.sha256(b).hexdigest() == th["sha256"], f"{th['slug']} zip hash"); ck(h.get("Content-Type") == "application/zip", f"{th['slug']} zip type"); ck(f"{th['slug']}.zip" in h.get("Content-Disposition", ""), f"{th['slug']} filename")
            s2, h2, _ = get(f"/img/tpl/wordpress/{th['slug']}/{th['version']}/shot-1280.webp"); ck(s2 == 200 and h2.get("Content-Type") == "image/webp", f"{th['slug']} screenshot {s2} {h2.get('Content-Type')}")
ck(got >= 1, "no zip served from the local bucket"); print("zips served and hash-checked:", got)
for bad in [f"/ui/{HUB}/nope-website-template", f"/ui/{WP}/{ISEG}/nope", f"/ui/{WP}/retail", f"/ui/{WP}/{ISEG}/{NICHES[0][3]}/nope", f"/ui/{HUB}.md/x", "/ui/download/wordpress/nope.zip"]:
    s, _, _ = get(bad); ck(s == 404, f"{bad} should be 404, got {s}")
s, h, b = text("/ui/sitemap.xml"); urls = re.findall(r"<loc>([^<]+)</loc>", b); ck(len(urls) == len(set(urls)), "sitemap duplicates")
paths = [u.split("/inspiration", 1)[-1] for u in urls]
for nest in hits: ck(nest in paths, f"sitemap misses {nest}")
for nid, pat, htmlSeg, seg in NICHES: ck(f"/ui/{htmlSeg}" not in paths, f"sitemap has flat {htmlSeg}"); ck(f"/ui/{WP}/{ISEG}/{seg}" in paths, f"sitemap misses WP {seg}")
s, h, b = text("/ui/chatbot-ui"); ck(s == 200, "flat pattern still flat")
s, h, b = text("/ui/chat-ai-assistant"); ck(s == 301, "old flat id still one hop")
s, h, b = text("/ui/chat-ai-assistant/"); ck(s == 301 and (h.get("Location") or "").endswith("/ui/chatbot-ui"), "old flat id with slash one hop")
# item URLs do not move
IT = NICHES[0]; s, h, b = text(f"/ui/{HUB}/{IT[2]}"); items = re.findall(r'href="[^"]*(/ui/' + IT[1] + r'-[a-z-]+-[0-9a-f]{12})"', b); ck(bool(items), "item link on niche page")
LAY = re.compile(r"-website-(atlas|folio|ledger|bento|band|concierge|listing|showcase|menu|reserve)-"); gen = [x for x in items if LAY.search(x)]; sig = [x for x in items if not LAY.search(x)]  # signature rows have no layout segment
if gen: s, _, ib = text(gen[0]); ck(s == 200 and f"{HUB}/{IT[2]}" in ib, "item page links nested pattern"); ck("Also for WordPress" in ib, f"item page sibling ({gen[0]})")
# a signature with no theme (themes.mjs NO_THEME: real-estate) must not claim a WordPress sibling
if sig and IND in ("real-estate", "restaurant"): s, _, ib = text(sig[0]); ck(s == 200 and "Also for WordPress" not in ib, "signature item has no WordPress sibling")
# the live Harrow & Vale page, fixed 7-Nov-2026: fictional notice, no invented testimonials or sales counts
if sig and IND == "real-estate":
    s, _, rb = text(f"/ui/raw/{sig[0][-12:]}.html"); ck(s == 200 and "Fictional agency created for this template" in rb, "agency signature carries the fictional notice")
    ck(not re.search(r"Helen M\.|homes sold in 2025|tenancies managed|From recent movers|on last year", rb), "agency signature has no invented testimonials or figures")
# the live Olive & Ember page (casual dining, the first restaurant niche), fixed in this branch: fictional notice, guest notes and the nut-allergy quote removed
if sig and IND == "restaurant":
    s, _, rb = text(f"/ui/raw/{sig[0][-12:]}.html"); ck(s == 200 and "Fictional restaurant created for this template" in rb, "restaurant signature carries the fictional notice")
    ck(not re.search(r"Guest notes|What regulars order|San Marzano|[Ff]eta\b", rb), "restaurant signature has no guest notes or protected food names")
print(f"{checks} checks, {fails} failed"); sys.exit(1 if fails else 0)
