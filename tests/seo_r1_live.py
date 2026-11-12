#!/usr/bin/env python3
"""SEO r1 live checks (read only: GET/HEAD on public pages, no MCP tool call, no D1 access).
Usage: python3 tests/seo_r1_live.py https://madegooddesigns.com/inspiration
  1. HEAD = GET status (+ Content-Type, Cache-Control) on pages, facets, items, sitemaps, a redirect and a 404
  2. twitter:card, og:title/og:description/og:url (+ og:image where the page has row images), every ld+json parses,
     BreadcrumbList = the visible crumb, row <img> carry width/height
  3. museum + annual sitemaps: no duplicate <loc>; 15 annual + 10 museum items: sitemap URL = the page's canonical
Prints "N passed, M failed"; exit 1 on any failure."""
import html, json, random, re, sys, time, urllib.request, urllib.error

L = sys.argv[1].rstrip("/")
UA = {"User-Agent": "curl/8.4.0", "Accept": "*/*"}
ok = fail = 0
def t(name, cond, info=""):
    global ok, fail
    ok += bool(cond); fail += (not cond)
    print(("PASS " if cond else "FAIL ") + name + ("" if cond else " | " + str(info)[:300]))

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *a, **k): return None
OPENER = urllib.request.build_opener(NoRedirect)
def fetch(url, method="GET"):
    for i in range(3):
        try:
            r = OPENER.open(urllib.request.Request(url, headers=UA, method=method), timeout=60)
            return r.status, {k.lower(): v for k, v in r.headers.items()}, r.read()
        except urllib.error.HTTPError as e:
            return e.code, {k.lower(): v for k, v in e.headers.items()}, e.read()
        except Exception as e:
            if i == 2: return 0, {}, str(e).encode()
            time.sleep(3)

locs = lambda b: [html.unescape(x) for x in re.findall(r"<loc>([^<]+)</loc>", b.decode("utf-8", "replace"))]
sm = {p: locs(fetch(L + p)[2]) for p in ("/museum/sitemap.xml", "/annual-reports/sitemap.xml")}
for p, u in sm.items():
    t(f"3 {p}: {len(u)} <loc>, no duplicates", len(u) > 1000 and len(u) == len(set(u)), len(u) - len(set(u)))
au = items_a = [x for x in sm["/annual-reports/sitemap.xml"] if re.search(r"[0-9a-f]{12}$", x)]
t("3 annual sitemap: no item URL ending '--<id>' (57 before r1: title slug, no year) and the canonical company-year-id form",
  not [x for x in au if re.search(r"--[0-9a-f]{12}$", x)] and L + "/annual-reports/federal-reserve-bank-of-dallas-1926-6174e1fc705c" in au,
  [x for x in au if re.search(r"--[0-9a-f]{12}$", x)][:3])
rnd = random.Random(int(time.time()) // 86400)
items = {p: [x for x in u if re.search(r"[0-9a-f]{12}$", x)] for p, u in sm.items()}
fac = {p: [x for x in u if not re.search(r"[0-9a-f]{12}$", x) and x.count("/") >= 6] for p, u in sm.items()}
an = rnd.sample(items["/annual-reports/sitemap.xml"], 15); mu = rnd.sample(items["/museum/sitemap.xml"], 10)
bad = []
for u in an + mu:
    s, _, b = fetch(u)
    c = re.search(r'<link rel="canonical" href="([^"]+)"', b.decode("utf-8", "replace"))
    if s != 200 or not c or html.unescape(c.group(1)) != u: bad.append(f"{u} -> {s} {c and c.group(1)}")
t(f"3 {len(an) + len(mu)} sitemap item URLs = their page's canonical", not bad, "; ".join(bad[:3]))

pages = ["/ui", "/ui/flows", "/museum/index", "/annual-reports/index", "/museum/theme/chinese-art", "/museum/culture/greek", "/annual-reports/country/italy",
         "/ui/real-estate-website-templates/home-builder-website-template"] + [x.replace(L, "") for x in rnd.sample(fac["/museum/sitemap.xml"], 3) + rnd.sample(fac["/annual-reports/sitemap.xml"], 3) + an[:3] + mu[:3]]
heads = pages + ["/museum", "/annual-reports", "/museum/sitemap.xml", "/annual-reports/sitemap.xml", "/ui/sitemap.xml", "/sitemap_index.xml", "/museum/", "/no-such-page-seo1"]
hb = []
for p in heads:
    g = fetch(L + p); h = fetch(L + p, "HEAD")
    if g[0] != h[0] or h[2] or any(g[1].get(k) != h[1].get(k) for k in ("content-type", "location")): hb.append(f"{p}: GET {g[0]} HEAD {h[0]} body {len(h[2])}")
t(f"1 HEAD = GET (status, Content-Type, Location, no body) on {len(heads)} URLs", not hb, "; ".join(hb[:4]))

why = []
for p in pages:
    s, _, b = fetch(L + p); b = b.decode("utf-8", "replace")
    if s != 200 or "</head>" not in b: why.append(f"{p}: {s}"); continue
    hd = b[:b.index("</head>")]
    img = '<meta property="og:image"' in hd
    tw = re.findall(r'<meta name="twitter:card" content="([^"]+)"', hd)
    if tw != (["summary_large_image"] if img else ["summary"]): why.append(f"{p}: twitter:card {tw}")
    for k in ("og:title", "og:description", "og:url"):
        if hd.count(f'<meta property="{k}"') != 1: why.append(f"{p}: {k} x{hd.count(chr(60) + 'meta property=' + chr(34) + k)}")
    rows = [m for m in re.findall(r"<img\b[^>]*>", b) if re.search(r'src="/inspiration/img/(?!tpl/)', m)]
    if rows and not img: why.append(f"{p}: row images but no og:image")
    if any(not re.search(r' width="\d+" height="\d+"', m) for m in rows): why.append(f"{p}: img without width/height")
    crumbs = None
    for x in re.findall(r'<script type="application/ld\+json">(.*?)</script>', b, re.S):
        try:
            for y in (lambda j: j if isinstance(j, list) else [j])(json.loads(x)):
                if isinstance(y, dict) and y.get("@type") == "BreadcrumbList": crumbs = y
        except Exception as e: why.append(f"{p}: ld+json {e}")
    nav = re.search(r'<nav class="crumb"[^>]*>(.*?)</nav>', b, re.S)
    if nav:
        vis = [html.unescape(re.sub(r"<[^>]+>", "", x)).strip() for x in nav.group(1).split(" › ")]
        if not crumbs or len(crumbs.get("itemListElement", [])) != len(vis): why.append(f"{p}: BreadcrumbList {crumbs and [e.get('name') for e in crumbs['itemListElement']]} vs crumb {vis}")
t(f"2 tags on {len(pages)} pages (twitter:card, og:*, ld+json, BreadcrumbList, img width/height)", not why, "; ".join(why[:4]))
print(f"{ok} passed, {fail} failed")
sys.exit(1 if fail else 0)
