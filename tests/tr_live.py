#!/usr/bin/env python3
"""Templates r9 (travel and hotels, staged 25-Nov-2026) live checks. Read only: GET/HEAD on public pages and the theme zips, no MCP call, no D1 access.
Usage: python3 tests/tr_live.py https://madegooddesigns.com/inspiration
  1. hub /ui/travel-website-templates and /ui/wordpress-themes/travel: 200, self-canonical, BreadcrumbList, all 8 niches linked
  2. every nested HTML page: 200, self-canonical, one card per catalog design (6, tour operator 7), link to its WordPress page; the .md twin answers
  3. every WordPress niche page: 200, one card per theme (6 or 7)
  4. flat URLs (pattern ids and the SEO slugs) reach the nested page in one 301
  5. every theme zip: 200 application/zip, sha256 = src/tpl_catalog.json (49); one shot-1280 per niche is image/webp
Prints "N passed, M failed"; exit 1 on any failure."""
import hashlib, json, os, re, sys, urllib.request, urllib.error
L = sys.argv[1].rstrip("/"); ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UA = {"User-Agent": "curl/8.4.0", "Accept": "*/*"}; ok = fail = 0
cat = json.load(open(f"{ROOT}/src/tpl_catalog.json")); tree = open(f"{ROOT}/src/ui_tree.js").read()
blk = tree.split('  travel: {', 1)[1].split("appPatterns", 1)[0]
NICHES = re.findall(r'\["([a-z-]+)", "([a-z-]+-website)", "[^"]+", "([a-z-]+-template)", "([a-z-]+)"\]', blk); HUB = "travel-website-templates"
def t(name, cond, info=""):
    global ok, fail
    ok += bool(cond); fail += (not cond); print(("PASS " if cond else "FAIL ") + name + ("" if cond else " | " + str(info)[:300]))
class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *a, **k): return None
OPENER = urllib.request.build_opener(NoRedirect)
def fetch(url, method="GET"):
    url = url if url.startswith("http") else L + url
    for i in range(3):
        try: r = OPENER.open(urllib.request.Request(url, headers=UA, method=method), timeout=90); return r.status, {k.lower(): v for k, v in r.headers.items()}, r.read()
        except urllib.error.HTTPError as e: return e.code, {k.lower(): v for k, v in e.headers.items()}, e.read()
        except Exception as e:
            if i == 2: return 0, {}, str(e).encode()
canon = lambda b, p: re.search(r'rel="canonical" href="[^"]*' + re.escape(p) + '"', b) is not None
t("8 niches in the tree", len(NICHES) == 8, NICHES)
s, h, b = fetch(f"/ui/{HUB}"); b = b.decode("utf-8", "replace")
t("hub 200", s == 200, s); t("hub canonical", canon(b, f"/ui/{HUB}")); t("hub crumbs", '"BreadcrumbList"' in b); t("hub h1 (copy C)", "Travel, tourism and accommodation website templates" in b)
for nid, pat, seg, wseg in NICHES: t(f"hub links {seg}", f"/ui/{HUB}/{seg}" in b)
s, h, b = fetch("/ui/wordpress-themes/travel"); b = b.decode("utf-8", "replace"); t("WordPress industry page 200", s == 200, s)
for nid, pat, seg, wseg in NICHES: t(f"WordPress industry page links {wseg}", f"/ui/wordpress-themes/travel/{wseg}" in b)
for nid, pat, seg, wseg in NICHES:
    n = cat["niches"][nid]; ds = [d for d in n["designs"] if d["distinct"]]; th = [d for d in ds if d.get("theme")]; nest = f"/ui/{HUB}/{seg}"
    s, h, b = fetch(nest); b = b.decode("utf-8", "replace")
    t(f"{nest} 200", s == 200, s); t(f"{nest} canonical", canon(b, nest)); t(f"{nest} links WordPress", f"/ui/wordpress-themes/travel/{wseg}" in b)
    g = b.split("distinct designs", 1)[-1].split("Every screen", 1)[0]; t(f"{nest} {len(ds)} design cards", len(re.findall(r'class="card page"', g)) == len(ds) >= 6, len(re.findall(r'class="card page"', g)))
    s, h, mb = fetch(nest + ".md"); t(f"{nest}.md", s == 200 and "text/markdown" in h.get("content-type", ""), (s, h.get("content-type")))
    wp = f"/ui/wordpress-themes/travel/{wseg}"; s, h, wb = fetch(wp); wb = wb.decode("utf-8", "replace")
    t(f"{wp} 200", s == 200, s); t(f"{wp} {len(th)} theme cards", len(re.findall(r'class="card page" data-style', wb)) == len(th) >= 6, len(re.findall(r'class="card page" data-style', wb)))
    for old in [f"/ui/{pat}", f"/ui/{seg}"]:
        if old == nest: continue
        s, h, _ = fetch(old); loc = h.get("location", ""); t(f"{old} one 301 to {nest}", s == 301 and loc.split("/inspiration", 1)[-1] == nest, (s, loc))
    for i, d in enumerate(th):
        z = d["theme"]; s, h, zb = fetch(f"/ui/download/wordpress/{z['slug']}.zip")
        t(f"zip {z['slug']} sha256", s == 200 and hashlib.sha256(zb).hexdigest() == z["sha256"], (s, h.get("content-type"), len(zb)))
        if i == 0: s, h, _ = fetch(f"/img/tpl/wordpress/{z['slug']}/{z['version']}/shot-1280.webp", "HEAD"); t(f"shot {z['slug']}", s == 200 and "image/webp" in h.get("content-type", ""), (s, h.get("content-type")))
# owner 25-Nov: the flat travel-website page now 301s to the hub in one hop
for old in ["/ui/travel-website-template", "/ui/travel-website", "/ui/travel-website-template/"]:
    s, h, _ = fetch(old); loc = h.get("location", ""); t(f"{old} one 301 to the hub", s == 301 and loc.split("/inspiration", 1)[-1] == f"/ui/{HUB}", (s, loc))
# owner 25-Nov follow-up (tests/tr_fix_bundle.py, after d1_apply_trfix.sh): the n12 Halcyon Quay and Driftmark homepages carry the r9 notice, $00 prices, no old wording.
# TRFIX_IDS=<id,id,...> (default: the web-minimal ids read from the bundle SQL)
_sql = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "deploy-bundle-2026-11-25", "tpl-trfix.sql")
_ids = (os.environ.get("TRFIX_IDS") or "").split(",") if os.environ.get("TRFIX_IDS") else (re.findall(r"id = '([0-9a-f]{12})' AND source_url = 'https://madegooddesigns.com/inspiration/ui#(?:hotel|travel)-website-homepage-web-minimal'", open(_sql).read()) if os.path.exists(_sql) else [])
for iid in [x for x in _ids if x]:
    s, h, rb = fetch(f"/ui/raw/{iid}.html"); rb = rb.decode("utf-8", "replace")
    t(f"trfix {iid} notice + $00", s == 200 and "Fictional" in rb and "not travel, legal or financial advice" in rb and not re.search(r"[$£€]\s?0*[1-9]", rb), s)
    t(f"trfix {iid} no old wording", not re.search(r"Guest notes|Traveller notes|Lowest rate|Norway|Morocco|Dolomites|since 2012|78%", rb))
print(f"{ok} passed, {fail} failed"); sys.exit(1 if fail else 0)
