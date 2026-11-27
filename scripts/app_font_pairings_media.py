import json, urllib.request, urllib.parse, sys, time
J = json.load(open("/Users/eugeneleow/Downloads/EtiennAubertBonn/mgd-inspiration-appfeed/src/font_pairings.json"))
H = {"User-Agent": "curl/8.4.0", "Accept": "*/*"}
def get(u):
    for a in range(3):
        try:
            return json.load(urllib.request.urlopen(urllib.request.Request(u, headers=H), timeout=60))
        except Exception as e:
            print("retry", e, file=sys.stderr); time.sleep(3)
    raise SystemExit("fail " + u)
slugs = {}
for k, v in J.items():
    s = v["page"].rstrip("/").rsplit("/", 1)[-1]
    slugs[s] = k
posts = {}
L = list(slugs)
for i in range(0, len(L), 50):
    q = urllib.parse.urlencode({"slug": ",".join(L[i:i+50]), "per_page": 100, "_fields": "slug,featured_media,date_gmt,title,link"})
    for p in get("https://madegooddesigns.com/wp-json/wp/v2/posts?" + q): posts[p["slug"]] = p
    print(i, len(posts), file=sys.stderr)
mids = sorted({p["featured_media"] for p in posts.values() if p.get("featured_media")})
media = {}
for i in range(0, len(mids), 100):
    q = urllib.parse.urlencode({"include": ",".join(map(str, mids[i:i+100])), "per_page": 100, "_fields": "id,source_url,media_details"})
    for m in get("https://madegooddesigns.com/wp-json/wp/v2/media?" + q):
        md = m.get("media_details") or {}
        sizes = md.get("sizes") or {}
        med = sizes.get("medium_large") or sizes.get("large") or {}
        media[m["id"]] = {"src": m["source_url"], "w": md.get("width"), "h": md.get("height"), "thumb": med.get("source_url"), "tw": med.get("width"), "th": med.get("height")}
    print("media", len(media), file=sys.stderr)
out = []
for s, k in slugs.items():
    p = posts.get(s)
    if not p: print("noposts", s, file=sys.stderr); continue
    m = media.get(p.get("featured_media"))
    out.append({"key": k, "slug": s, "date": p["date_gmt"], "title": p["title"]["rendered"], "page": J[k]["page"], "img": m})
json.dump(out, open("fp_media.json", "w"), indent=0)
print("done", len(out), sum(1 for o in out if o["img"]), file=sys.stderr)

# Step 2: write src/app_font_pairings.js (newest guide first; guides without a featured image left out).
import html as _html
HDR = """// GENERATED (app-collections-feed, 28-Nov-2026) from src/font_pairings.json + the guides' WordPress featured images
// (wp-json/wp/v2/posts?slug=… → featured_media → wp/v2/media). Newest guide first. Used only by the app feed's
// 'font-pairings' collection (src/app_feed.js): served from this file, so that collection costs 0 D1 rows.
// Regenerate after new font-pairing guides are published: python3 -I scripts/app_font_pairings_media.py (run from the repo root).
"""
rows = []
for x in out:
    m = x["img"]
    if not m or not m.get("src") or not x["page"].startswith("https://madegooddesigns.com/") or not m["src"].startswith("https://madegooddesigns.com/"): continue
    font, partners = J[x["key"]]["font"], []
    for p in J[x["key"]]["pairs"]:
        o2 = p["body"] if p["heading"] == font else p["heading"]
        if o2 != font and o2 not in partners: partners.append(o2)
    rows.append({"k": x["key"], "font": font, "title": _html.unescape(x["title"]), "page": x["page"], "img": m["src"], "w": m["w"], "h": m["h"],
                 "thumb": m.get("thumb"), "d": x["date"], "partners": partners[:4], "n": len(J[x["key"]]["pairs"])})
rows.sort(key=lambda r: (r["d"], r["k"]), reverse=True)
open("src/app_font_pairings.js", "w").write(HDR + "export const APP_FONT_PAIRINGS = " + json.dumps(rows, ensure_ascii=False, separators=(",", ":")) + ";\n")
print("wrote", len(rows), file=sys.stderr)
