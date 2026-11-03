"""Assertions for tests/test_nc_exclusion.sh (local Worker only)."""
import argparse, json, sys, urllib.request, urllib.error
ap = argparse.ArgumentParser(); ap.add_argument("--base", required=True); ap.add_argument("--mode", default="with")
A = ap.parse_args(); B = A.base.rstrip("/") + "/inspiration"
PD, NC, ST = "aaaaaaaaaaa2", "cccccccccc01", "cccccccccc02"
NCWORDS = [NC, ST, "Nctestbank", "Ncstagedwerke", "nctestbank", "ncstagedwerke"]
fails = 0
def ok(cond, msg):
    global fails
    print(("PASS " if cond else "FAIL ") + msg)
    if not cond: fails += 1
def get(path):
    req = urllib.request.Request(B + path, headers={"User-Agent": "curl/8.4.0", "Accept": "*/*"})
    try:
        r = urllib.request.urlopen(req, timeout=60); return r.status, r.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as e: return e.code, e.read().decode("utf-8", "replace")
def clean(body): return not any(w in body for w in NCWORDS)
def mcp(args):
    msg = {"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "search_annual_reports", "arguments": args}}
    req = urllib.request.Request(B + "/mcp", data=json.dumps(msg).encode(), headers={"Content-Type": "application/json", "Accept": "application/json, text/event-stream", "User-Agent": "curl/8.4.0", "MCP-Protocol-Version": "2025-06-18"})
    d = json.loads(urllib.request.urlopen(req, timeout=60).read())
    r = d["result"]; return r, "\n".join(c.get("text", "") for c in r["content"])

# website feeds / facets / search / sitemap / HTML
for q in ["", "?collection=annual-report", "?collection=annual-report&offset=0", "?collection=annual-report&offset=0&sort=year_asc",
          "?collection=annual-report&country=Germany", "?collection=annual-report&decade=1890", "?collection=annual-report&century=1800&offset=0",
          "?collection=design", "?collection=museum"]:
    s, b = get("/api/feed" + q); ok(s == 200 and clean(b), f"/api/feed{q} {s} excludes NC rows")
s, b = get("/api/feed?collection=annual-report"); ok(PD in b, "/api/feed annual still lists the PD row")
s, b = get("/api/annual-facets"); ok(s == 200 and "Austria" not in b and "banking" not in b and "manufacturing" not in b, f"/api/annual-facets {s} has no NC-only facet values")
s, b = get("/api/categories?collection=annual-report"); ok(s == 200, f"/api/categories {s}")
for q in ["zzcommon", "Nctestbank", "Ncstagedwerke"]:
    s, b = get(f"/api/search?collection=annual-report&q={q}"); ok(s == 200 and clean(b), f"/api/search q={q} excludes NC rows")
s, b = get("/api/search?collection=annual-report&q=zzcommon"); ok(PD in b, "/api/search still finds the PD row")
for i in (NC, ST):
    s, b = get(f"/api/item/{i}"); ok(s == 404, f"/api/item/{i} -> {s} (want 404)")
    s, b = get(f"/annual-reports/x-1899-{i}"); ok(s == 404, f"/annual-reports/<slug>-{i} HTML -> {s} (want 404)")
s, b = get(f"/api/item/{PD}"); ok(s == 200 and PD in b, f"/api/item/PD -> {s}")
s, b = get(f"/annual-reports/pdtestco-railway-1888-{PD}"); ok(s == 200 and "Pdtestco" in b, f"/annual-reports PD item HTML -> {s}")
s, b = get("/annual-reports/sitemap.xml"); ok(s == 200 and clean(b) and PD in b, f"/annual-reports/sitemap.xml {s} excludes NC, has PD")
s, b = get("/sitemap_index.xml"); ok(s == 200, f"/sitemap_index.xml {s}")
s, b = get("/annual-reports/index"); ok(s == 200 and clean(b) and "Pdtestco" in b, f"/annual-reports/index {s} excludes NC")
for kind, v in [("company", "nctestbank-hypotheken"), ("company", "ncstagedwerke"), ("country", "austria"), ("industry", "banking-and-finance"), ("industry", "manufacturing")]:
    s, b = get(f"/annual-reports/{kind}/{v}"); ok(s == 404, f"/annual-reports/{kind}/{v} -> {s} (want 404)")
s, b = get("/annual-reports/country/germany"); ok(s == 200 and clean(b) and "Pdtestco" in b, f"/annual-reports/country/germany {s} excludes NC")
s, b = get(f"/img/link/{NC}"); ok(s == 404, f"/img/link/<nc> -> {s} (nothing in R2)")

# MCP
r, t = mcp({"query": "zzcommon"})
ok(not r.get("isError") and PD in t or "Pdtestco" in t, "MCP default returns the PD row")
ok(clean(t) and "Licence:" not in t, "MCP default excludes both NC rows")
r, t = mcp({"query": "zzcommon", "include_noncommercial": False}); ok(clean(t), "MCP include_noncommercial=false excludes NC rows")
r, t = mcp({"query": "Nctestbank"}); ok(t.startswith("0 annual-report result") and NC not in t and "Licence" not in t, "MCP default company query returns 0 (NC row excluded)")
r, t = mcp({"query": "zzcommon", "include_noncommercial": True})
ok(not r.get("isError"), "MCP include_noncommercial=true ok")
ok("Nctestbank Hypotheken" in t, "MCP opt-in returns the mcp-nc row")
ok("Ncstagedwerke" not in t, "MCP opt-in does NOT return the staged-nc row")
ok("Pdtestco" in t, "MCP opt-in still returns the PD row")
blk = [x for x in t.split("\n\n") if "Nctestbank" in x]; blk = blk[0] if blk else ""
ok("annual-reports/" not in blk and "/img/" not in blk, "NC block has no MGD page/img link")
ok("https://www.digitale-sammlungen.de/view/bsb11111111" in blk, "NC block has the library source page")
if A.mode == "with":
    ok("Licence: NoC-NC 1.0 (No Copyright – Non-Commercial Use Only) — non-commercial use only — Bayerische Staatsbibliothek" in blk, "NC block shows exact licence + holder")
    ok("image: https://api.digitale-sammlungen.de/iiif/" in blk, "NC block image = library IIIF URL")
else:
    ok("Licence: CC BY-NC — non-commercial use only — " in blk, "NC block (old schema) still shows a licence line")
pdblk = [x for x in t.split("\n\n") if "Pdtestco" in x]; pdblk = pdblk[0] if pdblk else ""
ok("page (cite this): " in pdblk and "/img/annual/" in pdblk and "Licence" not in pdblk, "PD block unchanged (MGD page + img)")
# open-licence (CC BY) row: with migration = published WITH attribution; old schema = still staged-open (hidden)
OP = "dddddddddd01"
s, b = get(f"/annual-reports/optestlanz-ag-1927-{OP}")
if A.mode == "with":
    ok(s == 200, f"open-licence item page -> {s}")
    ok('href="https://creativecommons.org/licenses/by/3.0/de/" rel="nofollow noopener" target="_blank">CC BY 3.0 DE</a>' in b, "item page: licence name + URL link (nofollow noopener)")
    ok('href="https://www.deutsche-digitale-bibliothek.de/item/OPENTEST" rel="nofollow noopener" target="_blank">source record' in b, "item page: source-record link (nofollow noopener)")
    ok("MARCHIVUM Mannheim" in b, "item page: library name")
    s, b = get(f"/annual-reports/pdtestco-railway-1888-{PD}"); ok('class="attrib"' not in b and "nofollow" not in b, "PD item page has no attribution block / outbound links")
    s, b = get("/api/feed?collection=annual-report"); ok(OP in b and "CC BY 3.0 DE" in b, "feed lists the open row with its licence")
    r, t = mcp({"query": "Optestlanz"})
    ok("licence: CC BY 3.0 DE (https://creativecommons.org/licenses/by/3.0/de/) — MARCHIVUM Mannheim; attribution required" in t, "MCP default: open row with licence + URL + holder")
    ok("source record: https://www.deutsche-digitale-bibliothek.de/item/OPENTEST" in t, "MCP: source record link")
else:
    ok(s == 404, f"open-licence row staged (old schema) -> {s} (want 404)")
    s, b = get("/api/feed?collection=annual-report"); ok(OP not in b, "staged-open row not in feed")
    r, t = mcp({"query": "Optestlanz"}); ok(OP not in t and t.startswith("0 annual-report"), "staged-open row not in MCP")
print(f"{'ALL OK' if not fails else str(fails)+' FAILED'} ({A.mode})")
sys.exit(1 if fails else 0)
