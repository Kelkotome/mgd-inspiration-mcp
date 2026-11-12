#!/bin/bash
# SEO r1 (12-Nov-2026): the real workerd runtime (wrangler dev --local, throwaway D1 + R2, no routes, nothing remote) on a few seeded
# museum + annual-report rows, checked over HTTP with curl:
#   1. HEAD = GET minus the body (status + headers) on pages, facets, items, sitemaps, redirects, 404s, the API and /mcp; also a HEAD
#      that is served from the edge cache (the GET before it filled it)
#   2. tag presence: twitter:card, og:title/description/url/image on listings, BreadcrumbList JSON-LD parses and matches the crumb,
#      <img> width/height
#   3. sitemaps: no duplicate <loc> (two cultures that slugify alike are seeded), the annual item URL = the page's canonical
#      (company-year-id; the seeded title differs from the company, which is what broke the old sitemap)
# Usage: bash tests/seo1_local_e2e.sh   (env SEO1_PORT / SEO1_INSP, default 8971 / 9371; SCRATCH=<dir> for temp files)
set -u
cd "$(dirname "$0")/.."; ROOT=$(pwd); W="${WRANGLER:-$ROOT/node_modules/.bin/wrangler}"; PORT=${SEO1_PORT:-8971}; INSP=${SEO1_INSP:-9371}
T=$(mktemp -d "${SCRATCH:-$ROOT}/seo1-e2e.XXXXXX"); CFG="$ROOT/wrangler.seo1.jsonc"
python3 - <<'PY'
src = open("wrangler.jsonc").read(); i = src.index('"routes"'); j = src.index("]", i) + 1
open("wrangler.seo1.jsonc", "w").write(src[:i] + '"routes": []' + src[j:])
PY
for p in $PORT $INSP; do lsof -ti tcp:$p -sTCP:LISTEN >/dev/null 2>&1 && { echo "refusing: port $p is in use by a process this script did not start"; rm -f "$CFG"; exit 2; }; done
cleanup() { [ -n "${DEVPID:-}" ] && { pkill -P "$DEVPID" 2>/dev/null; kill "$DEVPID" 2>/dev/null; sleep 1; lsof -ti tcp:$PORT -ti tcp:$INSP -sTCP:LISTEN 2>/dev/null | xargs kill 2>/dev/null; }; rm -f "$CFG"; cp "$T/dev.log" "${SCRATCH:-$ROOT}/seo1-last-dev.log" 2>/dev/null; rm -rf "$T"; }
trap cleanup EXIT
D1() { "$W" d1 execute mgd-inspiration --local -c "$CFG" --persist-to "$T/state" "$@"; }
D1 --file=./schema.sql >>"$T/setup.log" 2>&1 || { tail -5 "$T/setup.log"; exit 1; }
D1 --command "ALTER TABLE items ADD COLUMN hue REAL" >>"$T/setup.log" 2>&1 || true
for f in migrate_category migrate_country migrate_featured migrate_rights migrate_srcurl migrate_annual migrate_mcp migrate_mcp_events migrate_mcp_events_err migrate_subscribers migrate_moodboards migrate_oauth migrate_boards_v2 migrate_boards_canvas migrate_feedidx migrate_ai_usage migrate_fts; do [ -f "$f.sql" ] && D1 --file=./$f.sql >>"$T/setup.log" 2>&1; done
D1 --command "INSERT INTO items (id,title,description,source_url,source_host,image_key,tags,themes,palette,status,created_at,collection,company,report_year,designer,industry,country,category,width,height,owner_id) VALUES
 ('aaaaaaaaaaa1','Federal Reserve Bank of Dallas 1926 Report to Stockholders','Annual report cover.','https://archive.org/details/x1','archive.org','annual/aaaaaaaaaaa1.jpg','[]','[]','[]','published',1700000001000,'annual-report','Federal Reserve Bank of Dallas',1926,NULL,'banking','United States',NULL,600,900,NULL),
 ('aaaaaaaaaaa2','Acme Transit 1972','Swiss grid cover.','https://archive.org/details/x2','archive.org','annual/aaaaaaaaaaa2.jpg','[]','[]','[]','published',1700000002000,'annual-report','Acme Transit',1972,'Paul Rand','transit','United States',NULL,640,880,NULL),
 ('bbbbbbbbbbb1','Vase with Lid','A covered vase.','https://museum.example/1','museum.example','museum/bbbbbbbbbbb1.jpg','[]','[]','[\"#112233\"]','published',1700000003000,'museum','The Metropolitan Museum of Art',1720,'Jan Brueghel the Elder','Vase','Greek','ceramics',1200,1500,NULL),
 ('bbbbbbbbbbb2','Second Vase','Another vase.','https://museum.example/2','museum.example','museum/bbbbbbbbbbb2.jpg','[]','[]','[]','published',1700000004000,'museum','The Metropolitan Museum of Art',1730,'Jan Brueghel the Elder','Vase','greek','ceramics',1000,800,NULL)" >>"$T/setup.log" 2>&1 || { echo "seed failed"; tail -5 "$T/setup.log"; exit 1; }
"$W" dev --local -c "$CFG" --persist-to "$T/state" --port $PORT --inspector-port $INSP --show-interactive-dev-session=false > "$T/dev.log" 2>&1 &
DEVPID=$!; up=0; for i in $(seq 1 90); do curl -s -o /dev/null http://127.0.0.1:$PORT/inspiration/museum && { up=1; break; }; sleep 1; done
[ $up = 1 ] || { echo "dev server did not start"; tail -20 "$T/dev.log"; exit 1; }
L=http://127.0.0.1:$PORT/inspiration
python3 - "$L" "$T" <<'PY'
import json, re, subprocess, sys, html
L, T = sys.argv[1], sys.argv[2]
ok = fail = 0
def t(name, cond, info=""):
    global ok, fail
    if cond: ok += 1
    else: fail += 1
    print(("PASS " if cond else "FAIL ") + name + ("" if cond else " | " + str(info)[:300]))
def curl(path, head=False):
    hf = f"{T}/h"; bf = f"{T}/b"
    # -I prints the header block as its output: keep only -D's copy and take the body size from curl itself
    args = ["curl", "-s", "-A", "curl/8.4.0", "-H", "Accept: */*", "-D", hf, "-o", "/dev/null" if head else bf, "-w", "%{size_download}"]
    args += ["-I"] if head else []
    n = int(subprocess.run(args + [L + path], check=False, capture_output=True, text=True).stdout or 0)
    lines = open(hf, encoding="latin-1").read().split("\r\n")
    status = int(lines[0].split()[1]) if lines and lines[0] else 0
    hdrs = sorted(l.lower() for l in lines[1:] if l and not re.match(r"(?i)^(date|cf-ray|content-length|transfer-encoding|connection|keep-alive):", l))
    return status, hdrs, (b"x" * n if head else open(bf, "rb").read())
paths = ["/museum", "/annual-reports", "/", "/ui", "/museum/index", "/annual-reports/index", "/museum/culture/greek", "/museum/artist/jan-brueghel-the-elder",
         "/museum/type/vase", "/annual-reports/company/federal-reserve-bank-of-dallas", "/annual-reports/country/united-states",
         "/museum/vase-with-lid-1720-bbbbbbbbbbb1", "/annual-reports/federal-reserve-bank-of-dallas-1926-aaaaaaaaaaa1",
         "/annual-reports/federal-reserve-bank-of-dallas-1926-report-to-stockholders-aaaaaaaaaaa1",
         "/museum/sitemap.xml", "/annual-reports/sitemap.xml", "/ui/sitemap.xml", "/sitemap_index.xml", "/museum/", "/no-such-page",
         "/museum/nothing-000000000000", "/api/feed?limit=2", "/mcp", "/img/museum/none.jpg", "/a7f3c9e14b8d4a2f9c6e1d0b3a5f8e2c.txt"]
same, bad = 0, []
for p in paths:
    g = curl(p); h = curl(p, head=True)
    if g[0] == h[0] and g[1] == h[1] and h[2] == b"": same += 1
    else: bad.append(f"{p}: GET {g[0]} HEAD {h[0]} body {len(h[2])} {'' if g[1] == h[1] else set(g[1]) ^ set(h[1])}")
t(f"1 HEAD = GET minus the body on {same}/{len(paths)} routes (workerd)", same == len(paths), "; ".join(bad[:4]))
# a HEAD answered from the edge cache: the GET above filled it; a second HEAD must match the cached GET
g = curl("/museum/culture/greek"); h = curl("/museum/culture/greek", head=True)
t("1 HEAD on an edge-cached page = the cached GET", g[0] == h[0] == 200 and g[1] == h[1] and h[2] == b"", (g[0], h[0], set(g[1]) ^ set(h[1])))
statuses = {p: curl(p)[0] for p in paths}
t("1 the seeded pages answer 200 (the UI routes need UI rows; none are seeded)", all(statuses[p] == 200 for p in paths[:14] if p != "/ui"), {p: s for p, s in statuses.items() if s != 200})
# 2. tags
for p in ["/museum/culture/greek", "/museum/artist/jan-brueghel-the-elder", "/annual-reports/company/federal-reserve-bank-of-dallas", "/museum/index", "/annual-reports/index",
          "/museum/vase-with-lid-1720-bbbbbbbbbbb1", "/annual-reports/federal-reserve-bank-of-dallas-1926-aaaaaaaaaaa1"]:
    s, _, b = curl(p); b = b.decode(); hd = b[:b.index("</head>")]
    has_img = '<meta property="og:image"' in hd
    tw = re.findall(r'<meta name="twitter:card" content="([^"]+)"', hd)
    t(f"2 {p}: twitter:card {tw}", tw == (["summary_large_image"] if has_img else ["summary"]), tw)
    t(f"2 {p}: og:title/og:description/og:url once each", all(hd.count(f'<meta property="{k}"') == 1 for k in ("og:title", "og:description", "og:url")), hd[:300])
    if "/index" not in p: t(f"2 {p}: og:image = first item image", has_img and re.search(r'<meta property="og:image" content="http://127\.0\.0\.1:\d+/inspiration/img/', hd) is None and "/inspiration/img/" in hd, hd)
    lds = re.findall(r'<script type="application/ld\+json">(.*?)</script>', b, re.S)
    crumbs = None
    try:
        for x in lds:
            for y in (lambda j: j if isinstance(j, list) else [j])(json.loads(x)):
                if y.get("@type") == "BreadcrumbList": crumbs = y
        parsed = True
    except Exception as e:
        parsed = False
    t(f"2 {p}: every ld+json parses", parsed, lds)
    nav = re.search(r'<nav class="crumb"[^>]*>(.*?)</nav>', b, re.S)
    vis = [html.unescape(re.sub(r"<[^>]+>", "", x)).strip() for x in nav.group(1).split(" › ")] if nav else []
    names = [e["name"] for e in (crumbs or {}).get("itemListElement", [])]
    t(f"2 {p}: BreadcrumbList = visible crumb {vis}", crumbs is not None and names == vis and [e["position"] for e in crumbs["itemListElement"]] == list(range(1, len(vis) + 1)), names)
    imgs = [m for m in re.findall(r"<img\b[^>]*>", b) if "/inspiration/img/" in m]
    t(f"2 {p}: {len(imgs)} row images with width + height", all(re.search(r' width="\d+" height="\d+"', m) for m in imgs), imgs[:2])
# 3. sitemaps
for p in ["/museum/sitemap.xml", "/annual-reports/sitemap.xml"]:
    locs = re.findall(r"<loc>([^<]+)</loc>", curl(p)[2].decode())
    t(f"3 {p}: {len(locs)} <loc>, no duplicates", len(locs) == len(set(locs)) and len(locs) > 3, locs)
locs = re.findall(r"<loc>([^<]+)</loc>", curl("/annual-reports/sitemap.xml")[2].decode())
it = [u for u in locs if u.endswith("aaaaaaaaaaa1")]
can = re.search(r'<link rel="canonical" href="([^"]+)"', curl("/annual-reports/federal-reserve-bank-of-dallas-1926-report-to-stockholders-aaaaaaaaaaa1")[2].decode())
t(f"3 annual sitemap item URL {it} = the page's canonical", len(it) == 1 and can and it[0] == html.unescape(can.group(1)) and it[0].endswith("/federal-reserve-bank-of-dallas-1926-aaaaaaaaaaa1"), (it, can and can.group(1)))
print(f"{ok} passed, {fail} failed")
sys.exit(1 if fail else 0)
PY
RC=$?
[ $RC = 0 ] || tail -12 "$T/dev.log" | cut -c1-200
[ $RC = 0 ] && echo "seo-r1 local e2e: all checks passed" || echo "seo-r1 local e2e: FAILED"
exit $RC
