"""App board links Phase 1 (23-Nov-2026): HTTP + MCP checks against a LOCAL worker (tests/app_boards_local_e2e.sh starts it with
APP_BOARD_DAILY_LIMIT=8, APP_BOARD_UPDATE_LIMIT=5, APP_BOARD_REPORT_LIMIT=3, ADMIN_TOKEN=local-admin-test, --test-scheduled, seeded items, migrate_app_boards.sql).
  python3 tests/app_boards_rpc.py http://127.0.0.1:8987   (env D1CMD = the `wrangler d1 execute … --local` prefix, for expiry checks)
Covers: create / update / delete, bad token, every cap, filter accept/reject, both rate limits, XSS in every text field, page + OG tags,
Markdown brief, get_shared_board MCP tool, 404/410 states, expiry on read + daily cron expiry/purge, last_seen bump. UA curl/8.4.0."""
import json, os, re, shlex, subprocess, sys, time, urllib.request, urllib.error
B = (sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:8987").rstrip("/"); I = B + "/inspiration"
D1CMD = os.environ.get("D1CMD", "")
ok = fail = 0
def check(name, cond, info=""):
    global ok, fail
    ok += bool(cond); fail += not cond
    print(("PASS " if cond else "FAIL ") + name + ("" if cond else " | " + str(info)[:500]))
def req(method, url, body=None, headers=None, raw=None):
    h = {"User-Agent": "curl/8.4.0", "Accept": "*/*", **(headers or {})}
    data = raw if raw is not None else (json.dumps(body).encode() if body is not None else None)
    if data is not None: h.setdefault("Content-Type", "application/json")
    r = urllib.request.Request(url, data=data, method=method, headers=h)
    try:
        with urllib.request.urlopen(r, timeout=60) as resp: return resp.status, dict(resp.headers), resp.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as e: return e.code, dict(e.headers), e.read().decode("utf-8", "replace")
def api(body, ip="10.0.0.1", raw=None):
    st, hd, t = req("POST", I + "/api/app-boards", body, {"CF-Connecting-IP": ip}, raw)
    try: j = json.loads(t) if t else None
    except Exception: j = {"_raw": t}
    return st, j or {}, hd
def delete(bid, tok=None):
    st, hd, t = req("DELETE", f"{I}/api/app-boards/{bid}", headers={"X-Edit-Token": tok} if tok else {})
    return st, (json.loads(t) if t else None)
def page(bid, q=""): return req("GET", f"{I}/app-board/{bid}{q}")
def rpc(method, params, path="/inspiration/mcp"):
    st, hd, t = req("POST", B + path, {"jsonrpc": "2.0", "id": 1, "method": method, "params": params},
                    {"Accept": "application/json, text/event-stream", "MCP-Protocol-Version": "2025-06-18"})
    return json.loads(t)
def mcp(args, path="/inspiration/mcp"): return rpc("tools/call", {"name": "get_shared_board", "arguments": args}, path).get("result", {})
def mtext(r): return "\n".join(c.get("text", "") for c in r.get("content", []) if c.get("type") == "text")
def d1(sql):
    out = subprocess.run(shlex.split(D1CMD) + ["--json", "--command", sql], capture_output=True, text=True)
    try: return json.loads(out.stdout)[0]["results"]
    except Exception: return {"err": out.stderr[-300:] + out.stdout[-300:]}
SITE = "https://madegooddesigns.com/inspiration/app-board/"
LIB_MUSEUM, LIB_DESIGN, LIB_ANNUAL, LIB_LINKONLY = "c0000000000a", "c0000000000d", "aaaaaaaaaaa2", "d00000000001"
LIB_OWNED, LIB_PENDING = "bbbbbbbbbbb9", "e00000000001"
X = '<script>alert(1)</script>"><img src=x onerror=alert(1)>'

# ---- create (every text field carries an XSS payload; a link-only item first so og:image must skip it)
board = {"title": "Wine bar " + X, "notes": "Warm & hand-lettered " + X + "\nSee https://a.example/x?y=1",
         "items": [{"kind": "library", "id": LIB_LINKONLY},
                   {"kind": "library", "id": LIB_MUSEUM.upper(), "note": "museum note " + X},
                   {"kind": "library", "id": LIB_DESIGN},
                   {"kind": "palette", "hexes": ["#ff0000", "#00ff00", "#0000FF"], "source": "wheel", "mode": "triadic", "note": "pal note " + X},
                   {"kind": "colour", "hex": "#abcdef", "note": "col note " + X},
                   {"kind": "font", "family": "Playfair " + X[:40], "weight": 700, "licence": "SIL Open Font License 1.1", "sample": "Sample " + X[:60], "note": "font note " + X},
                   {"kind": "note", "text": "Card one " + X + "\nsecond line https://b.example"}]}
st, j, hd = api(board)
check("create → 201 {id, token, url}", st == 201 and re.fullmatch(r"[a-z0-9]{14}", j.get("id", "")) and j.get("token", "").startswith("abt_") and set(j) == {"id", "token", "url"}, (st, j))
bid, tok = j.get("id"), j.get("token")
check("create: url is https://madegooddesigns.com/inspiration/app-board/<id>", j.get("url") == SITE + str(bid), j.get("url"))
check("create: CORS + no-store headers", hd.get("Cache-Control") == "no-store" and "Access-Control-Allow-Origin" in hd, hd)
st, hd, _ = req("OPTIONS", I + "/api/app-boards", headers={"Origin": "http://localhost:8081", "Access-Control-Request-Method": "POST"})
check("OPTIONS preflight allows X-Edit-Token + DELETE", st == 204 and "X-Edit-Token" in hd.get("Access-Control-Allow-Headers", "") and "DELETE" in hd.get("Access-Control-Allow-Methods", ""), (st, hd))

# ---- page
st, hd, html = page(bid)
check("page: 200 + robots noindex,nofollow (meta + header)", st == 200 and '<meta name="robots" content="noindex,nofollow">' in html and hd.get("X-Robots-Tag") == "noindex, nofollow", (st, hd.get("X-Robots-Tag")))
check("page: no raw <script> / <img onerror> from any field", "<script>alert" not in html and "<img src=x" not in html and "onerror=alert(1)>" not in html, re.findall(r".{40}alert.{40}", html)[:3])
for label in ["Wine bar", "museum note", "pal note", "col note", "font note", "Card one", "Warm &amp; hand-lettered"]:
    check(f"page: escaped text present ({label})", label in html and "&lt;script&gt;alert(1)&lt;/script&gt;" in html, label)
check("page: sample + family escaped", "Sample &lt;script&gt;" in html and "Playfair &lt;script&gt;" in html)
check("page: palette swatches show hex text", all(f"<code>{x}</code>" in html for x in ["#FF0000", "#00FF00", "#0000FF", "#ABCDEF"]))
check("page: palette source line", "Triadic harmony from the colour wheel" in html, re.findall(r"harmony.{0,40}", html))
check("page: font weight + licence + Google Fonts link nofollow", "Bold 700 · SIL Open Font License 1.1" in html and re.search(r'href="https://fonts\.google\.com/specimen/Playfair\+[^"]*" rel="nofollow noopener"', html), re.findall(r'fonts\.google[^>]*>', html))
check("page: URLs in text are plain text, never links", 'href="https://a.example' not in html and 'href="https://b.example' not in html and "https://a.example/x?y=1" in html)
check("page: library images with captions + source credit", html.count('class="pin"') == 3 and "Source:" in html and "public domain" in html and f'/img/museum/{LIB_MUSEUM}.jpg' in html, html.count('class="pin"'))
check("page: link-only library item shows no image", f"link/{LIB_LINKONLY}" not in html and "View on Made Good Designs" in html)
check("page: og:title/description/image (first hosted library image) + twitter card", 'property="og:title" content="Wine bar' in html and 'property="og:description"' in html
      and f'property="og:image" content="https://madegooddesigns.com/inspiration/img/museum/{LIB_MUSEUM}.jpg"' in html and 'name="twitter:card" content="summary_large_image"' in html
      and f'property="og:url" content="{SITE}{bid}"' in html, re.findall(r'<meta (?:property|name)="(?:og|twitter):[^>]*>', html))
check("page: report form + md alternate", f'action="/inspiration/app-board/{bid}/report"' in html and "Report this board" in html and "?format=md" in html)
check("page: edit token never on the page", tok not in html)
st, hd, _ = req("HEAD", f"{I}/app-board/{bid}")
check("page: HEAD → 200", st == 200, st)

# ---- Markdown brief
st, hd, md = page(bid, "?format=md")
check("md: 200 text/markdown, noindex", st == 200 and hd.get("Content-Type", "").startswith("text/markdown") and "noindex" in hd.get("X-Robots-Tag", ""), (st, hd.get("Content-Type")))
check("md: contextPack headings in order", md.startswith("# Moodboard: Wine bar") and 0 < md.index("## Notes") < md.index("## Palette") < md.index("## Fonts") < md.index("## Images"), md[:300])
check("md: palette + css variables + source", "- #FF0000\n- #00FF00\n- #0000FF\n- #ABCDEF" in md and "--color-4: #ABCDEF;" in md and "triadic harmony from the colour wheel" in md, md)
check("md: font line", "(Bold 700). SIL Open Font License 1.1, free Google Font. https://fonts.google.com/specimen/Playfair" in md, md)
check("md: images list with credit + MGD page link + note", re.search(r"- .+ \(.*public domain.*\): https://madegooddesigns\.com/inspiration/museum/\S+-" + LIB_MUSEUM, md) and "  Note: museum note" in md, md)
check("md: board link + note card", f"Board link: {SITE}{bid}" in md and "- Card one" in md)

# ---- MCP get_shared_board
tl = rpc("tools/list", {})["result"]["tools"]; names = [t["name"] for t in tl]
check("MCP tools/list: 113 tools, get_shared_board last, schema board_id", len(tl) == 113 and names[-1] == "get_shared_board" and tl[-1]["inputSchema"]["required"] == ["board_id"], (len(tl), names[-3:]))
r = mcp({"board_id": SITE + bid})
check("MCP get_shared_board(url) → the Markdown brief", not r.get("isError") and mtext(r).startswith("# Moodboard: Wine bar") and "## Palette" in mtext(r) and (r.get("structuredContent") or {}).get("board_id") == bid, mtext(r)[:300])
r2 = mcp({"board_id": bid.upper()})
check("MCP get_shared_board(bare id, any case) works", not r2.get("isError") and mtext(r2) == mtext(r))
check("MCP: no token in the answer", tok not in mtext(r))
check("MCP: bad id → isError with how to call", mcp({"board_id": "nope"}).get("isError") and "board_id" in mtext(mcp({"board_id": "nope"})))
check("MCP: unknown board → isError", mcp({"board_id": "zzzzzzzzzzzzzz"}).get("isError"))
core = [t["name"] for t in rpc("tools/list", {}, "/inspiration/mcp/core")["result"]["tools"]]
check("MCP /mcp/core: not listed but callable", "get_shared_board" not in core and not mcp({"board_id": bid}, "/inspiration/mcp/core").get("isError"))

# ---- update (full replace)
st, j, _ = api({"id": bid, "token": tok, "title": "Renamed", "notes": "", "items": [{"kind": "library", "id": LIB_ANNUAL}, {"kind": "colour", "hex": "#123456"}]})
check("update → 200 {id, url}", st == 200 and j == {"id": bid, "url": SITE + bid}, (st, j))
_, _, html2 = page(bid)
check("update: full replace (old items gone, new present)", "<h1>Renamed</h1>" in html2 and "#123456" in html2 and "#FF0000" not in html2 and html2.count('class="pin"') == 1 and "Acme Transit" in html2, html2[:200])
check("update: wrong token → 403 {error}", api({"id": bid, "token": "abt_wrong", "title": "x", "items": []})[0] == 403)
check("update: missing token → 403", api({"id": bid, "title": "x", "items": []})[0] == 403)
st, j, _ = api({"id": bid, "token": "abt_wrong", "title": "a" * 500, "items": []})
check("update: wrong token is checked before validation (403, not 400)", st == 403 and "field" not in j, (st, j))
check("update: unknown id → 404", api({"id": "zzzzzzzzzzzzzz", "token": tok, "title": "x", "items": []})[0] == 404)
st, j, _ = api({"id": bid, "token": tok, "title": "ok", "notes": "a" * 501, "items": []})
check("update: validation 400 with field + limit", st == 400 and j.get("field") == "notes" and "500" in j.get("error", ""), j)

# ---- caps + validation over HTTP
lib = lambda i: {"kind": "library", "id": i}
cases = [
  ("title 81", {"title": "a" * 81, "items": []}, "title"), ("notes 501", {"title": "t", "notes": "n" * 501, "items": []}, "notes"),
  ("notes 2000 (app cap)", {"title": "t", "notes": "n" * 2000, "items": []}, "notes"),
  ("61 items", {"title": "t", "items": [{"kind": "colour", "hex": "#000000"}] * 61}, "items"),
  ("item note 201", {"title": "t", "items": [{"kind": "colour", "hex": "#000000", "note": "a" * 201}]}, "items[0].note"),
  ("note card 501", {"title": "t", "items": [{"kind": "note", "text": "a" * 501}]}, "items[0].text"),
  ("sample 121", {"title": "t", "items": [{"kind": "font", "family": "Inter", "sample": "a" * 121}]}, "items[0].sample"),
  ("family 81", {"title": "t", "items": [{"kind": "font", "family": "a" * 81}]}, "items[0].family"),
  ("1 hex", {"title": "t", "items": [{"kind": "palette", "hexes": ["#000000"]}]}, "items[0].hexes"),
  ("13 hexes", {"title": "t", "items": [{"kind": "palette", "hexes": ["#000000"] * 13}]}, "items[0].hexes"),
  ("bad hex", {"title": "t", "items": [{"kind": "palette", "hexes": ["#000000", "#00000Z"]}]}, "items[0].hexes[1]"),
  ("external image URL (kind image)", {"title": "t", "items": [{"kind": "image", "url": "https://evil.example/a.jpg"}]}, "items[0].kind"),
  ("library id as external URL", {"title": "t", "items": [lib("https://evil.example/a.jpg")]}, "items[0].id"),
  ("unknown library id", {"title": "t", "items": [lib(LIB_DESIGN), lib("ffffffffffff")]}, "items[1].id"),
  ("someone's private upload", {"title": "t", "items": [lib(LIB_OWNED)]}, "items[0].id"),
  ("unpublished item", {"title": "t", "items": [lib(LIB_PENDING)]}, "items[0].id"),
]
for name, b, f in cases:
    st, j, _ = api(b, ip="10.0.9.9")
    check(f"cap/validation: {name} → 400 field {f}", st == 400 and j.get("field") == f, (st, j))
check("caps at the limit pass (title 80, notes 500, 60 items, 12 hexes, sample 120, family 80, notes 200/500)",
      api({"title": "a" * 80, "notes": "n" * 500, "items": [{"kind": "palette", "hexes": ["#000000"] * 12, "note": "a" * 200}, {"kind": "font", "family": "f" * 80, "sample": "s" * 120},
           {"kind": "note", "text": "a" * 500}] + [{"kind": "colour", "hex": "#000000"}] * 57}, ip="10.0.9.8")[0] == 201)
st, j, _ = api(None, ip="10.0.9.9", raw=json.dumps({"title": "t", "notes": "", "items": [{"kind": "note", "text": "a" * 400}] * 60, "pad": "p" * 9000}).encode())
check("body > 32 KB → 400 field body (limit stated)", st == 400 and j.get("field") == "body" and "32768" in j.get("error", ""), (st, j))
st, j, _ = api(None, ip="10.0.9.9", raw=b"{not json")
check("invalid JSON → 400 field body", st == 400 and j.get("field") == "body", (st, j))
for f, b in [("title", {"title": "Cheap VIAGRA", "items": []}), ("notes", {"title": "t", "notes": "join t.me/deals", "items": []}),
             ("items[0].note", {"title": "t", "items": [{"kind": "colour", "hex": "#000000", "note": "p0rn"}]}),
             ("items[0].text", {"title": "t", "items": [{"kind": "note", "text": "https://a.x https://b.x https://c.x"}]}),
             ("items[0].sample", {"title": "t", "items": [{"kind": "font", "family": "Inter", "sample": "you n1gger"}]}),
             ("items[0].family", {"title": "t", "items": [{"kind": "font", "family": "Hentai Sans"}]})]:
    st, j, _ = api(b, ip="10.0.9.9")
    check(f"filter rejects {f} → 400 text_not_allowed", st == 400 and j == {"error": "text_not_allowed", "field": f}, (st, j))
for f, b in [("title", {"title": "Pussy Riot", "items": []}), ("notes", {"title": "t", "notes": "follow my 0nlyfans", "items": []}),
             ("items[0].text", {"title": "t", "items": [{"kind": "note", "text": "N.S.F.W stuff"}]}), ("items[0].note", {"title": "t", "items": [{"kind": "colour", "hex": "#000000", "note": "sex video"}]})]:
    st, j, _ = api(b, ip="10.0.9.9")
    check(f"tightened filter rejects {f} → 400 text_not_allowed", st == 400 and j == {"error": "text_not_allowed", "field": f}, (st, j))
st, j, _ = api({"title": "Pornic sardines", "notes": "Magna cum laude certificate", "items": []}, ip="10.0.9.6")
check("allowlist: Pornic, cum laude accepted", st == 201, (st, j))
st, j, _ = api({"title": "Nude palette", "notes": "Sex Pistols poster, Moby Dick cover, https://a.example", "items": [{"kind": "note", "text": "Spice market"}]}, ip="10.0.9.7")
check("filter accepts design words (nude, Sex Pistols, Moby Dick, spice)", st == 201, (st, j))

# ---- update rate limit (APP_BOARD_UPDATE_LIMIT=5 locally; 200 live)
st, j, _ = api({"title": "rl", "items": []}, ip="10.0.8.1"); rid, rtok = j.get("id"), j.get("token")
codes = [api({"id": rid, "token": rtok, "title": f"rl {i}", "items": []})[0] for i in range(6)]
st, j, hd = api({"id": rid, "token": rtok, "title": "rl 7", "items": []})
check("update rate limit: 5 updates ok, 6th → 429 (+Retry-After), limit stated", codes[:5] == [200] * 5 and codes[5] == 429 and st == 429 and "Retry-After" in hd and "5" in j.get("error", ""), (codes, st, j))
check("update rate limit: the board itself still reads", page(rid)[0] == 200)

# ---- create rate limit (APP_BOARD_DAILY_LIMIT=8 locally; 20 live), per IP hash
codes = [api({"title": f"ip {i}", "items": []}, ip="10.0.7.7")[0] for i in range(9)]
check("create rate limit: 8 per IP ok, 9th → 429", codes == [201] * 8 + [429], codes)
check("create rate limit: another IP unaffected", api({"title": "other", "items": []}, ip="10.0.7.8")[0] == 201)

# ---- report → hidden (410); admin restore / disable
st, j, _ = api({"title": "to report", "items": [lib(LIB_DESIGN)]}, ip="10.0.6.1"); pid, ptok = j["id"], j["token"]
report = lambda bid_, ip: req("POST", f"{I}/app-board/{bid_}/report", raw=b"", headers={"CF-Connecting-IP": ip})
for _ in range(5): report(pid, "10.1.0.1")
check("same IP reporting 5 times counts once: still visible", page(pid)[0] == 200)
if D1CMD: check("same IP 5 times → reports = 1, one row", d1(f"SELECT reports FROM app_boards WHERE id='{pid}'") == [{"reports": 1}] and d1(f"SELECT COUNT(*) n FROM app_board_reports WHERE board_id='{pid}'") == [{"n": 1}])
report(pid, "10.1.0.2")
check("2 distinct IPs: still visible", page(pid)[0] == 200)
st, _, t = report(pid, "10.1.0.3")
check("report → thanks page", st == 200 and "reported" in t)
st, _, t = page(pid)
check("3 reports: friendly 410 page, noindex", st == 410 and "hidden pending review" in t and "noindex" in t, st)
check("hidden: md → 410", page(pid, "?format=md")[0] == 410)
check("hidden: MCP → isError", mcp({"board_id": pid}).get("isError"))
check("hidden: update → 410 board_unavailable", api({"id": pid, "token": ptok, "title": "x", "items": []}) [0:2] == (410, {"error": "board_unavailable"}))
adm = lambda b, tokn="local-admin-test": req("POST", I + "/api/admin/app-board", b, {"Authorization": "Bearer " + tokn})
check("admin: wrong token → 401", adm({"id": pid, "disabled": 0}, "nope")[0] == 401)
st, _, t = adm({"id": pid, "disabled": 0})
check("admin restore → 200, page back", st == 200 and json.loads(t)["reports"] == 0 and page(pid)[0] == 200, t)
check("admin disable → 410 page", adm({"id": pid, "disabled": 1})[0] == 200 and page(pid)[0] == 410)
check("report GET → 405", req("GET", f"{I}/app-board/{pid}/report")[0] == 405)
for ip in ["10.1.0.1", "10.1.0.2", "10.1.0.3"]: report(pid, ip)
if D1CMD: check("after admin restore: report rows cleared, so old reporters count again (3 rows)", d1(f"SELECT COUNT(*) n FROM app_board_reports WHERE board_id='{pid}'") == [{"n": 3}])
# per-IP daily report cap (APP_BOARD_REPORT_LIMIT=3 locally; 20 live): the 4th board this IP reports is not counted
cap_ids = [api({"title": f"cap {i}", "items": []}, ip="10.0.4.1")[1]["id"] for i in range(4)]
for c in cap_ids: report(c, "10.1.9.9")
if D1CMD:
    rs = [d1(f"SELECT reports FROM app_boards WHERE id='{c}'")[0]["reports"] for c in cap_ids]
    check("report cap per IP hash: 3 counted, the 4th (over the daily cap) ignored, thank-you page still shown", rs == [1, 1, 1, 0] and report(cap_ids[3], "10.1.9.9")[0] == 200, rs)
for ip in ["10.1.9.1", "10.1.9.2"]: report(cap_ids[3], ip)
check("a capped IP cannot help hide: 2 other IPs → still visible", page(cap_ids[3])[0] == 200)
report(cap_ids[3], "10.1.9.3")
check("3rd distinct counted IP hides it", page(cap_ids[3])[0] == 410)
check("report on an unknown board → thanks page, no row", report("zzzzzzzzzzzzzz", "10.1.8.1")[0] == 200 and (not D1CMD or d1("SELECT COUNT(*) n FROM app_board_reports WHERE board_id='zzzzzzzzzzzzzz'") == [{"n": 0}]))

# ---- delete
check("delete: no token → 403", delete(bid)[0] == 403)
check("delete: wrong token → 403", delete(bid, "abt_wrong")[0] == 403)
report(bid, "10.1.7.1")
check("delete: right token → 204 (no body)", delete(bid, tok) == (204, None))
if D1CMD: check("delete also removes the board's report rows", d1(f"SELECT COUNT(*) n FROM app_board_reports WHERE board_id='{bid}'") == [{"n": 0}])
st, _, t = page(bid)
check("deleted: page 404 friendly", st == 404 and "doesn’t exist" in t, st)
check("deleted: delete again → 404", delete(bid, tok)[0] == 404)
check("deleted: update → 404", api({"id": bid, "token": tok, "title": "x", "items": []})[0] == 404)
check("malformed id path → 404", page("abc")[0] == 404 and page("ABCDEFGHIJKLMN")[0] == 404)

# ---- expiry (needs D1CMD)
if D1CMD:
    DAY = 86400000; now = int(time.time() * 1000)
    st, j, _ = api({"title": "old board", "notes": "secret notes", "items": [lib(LIB_DESIGN)]}, ip="10.0.5.1"); eid, etok = j["id"], j["token"]
    st, j, _ = api({"title": "fresh board", "items": []}, ip="10.0.5.1"); fid, ftok = j["id"], j["token"]
    d1(f"UPDATE app_boards SET last_seen={now - 2 * DAY} WHERE id='{fid}'")
    page(fid); time.sleep(1)
    ls = d1(f"SELECT last_seen FROM app_boards WHERE id='{fid}'")
    check("last_seen: a view after >1 day bumps it to now", isinstance(ls, list) and ls and ls[0]["last_seen"] > now - 60000, ls)
    d1(f"UPDATE app_boards SET last_seen={now - 3600000} WHERE id='{fid}'"); page(fid); time.sleep(1)
    ls = d1(f"SELECT last_seen FROM app_boards WHERE id='{fid}'")
    check("last_seen: a view within a day writes nothing", isinstance(ls, list) and ls and ls[0]["last_seen"] == now - 3600000, ls)
    d1(f"UPDATE app_boards SET last_seen={now - 366 * DAY} WHERE id='{eid}'")
    st, _, t = page(eid)
    check("expired on read (366 days unseen): friendly 410, before any cron", st == 410 and "expired" in t and "12 months" in t, (st, t[:200]))
    check("expired: md → 410", page(eid, "?format=md")[0] == 410)
    check("expired: MCP → isError 'expired'", mcp({"board_id": eid}).get("isError") and "expired" in mtext(mcp({"board_id": eid})))
    check("expired: update → 404 {error: expired}", api({"id": eid, "token": etok, "title": "x", "items": []})[0:2] == (404, {"error": "expired"}))
    check("expired: a view does not revive it", page(eid)[0] == 410)
    d1(f"UPDATE app_boards SET last_seen={now - 365 * DAY + 3600000} WHERE id='{fid}'")
    st, _, t = req("GET", B + "/__scheduled?cron=17+3+*+*+*")
    time.sleep(2)
    row = d1(f"SELECT disabled, title, notes, items, edit_hash FROM app_boards WHERE id='{eid}'")
    check("cron: expired board marked 3 and content wiped (title, notes, items, edit hash)", isinstance(row, list) and row and row[0] == {"disabled": 3, "title": "", "notes": None, "items": "[]", "edit_hash": ""}, (st, row))
    check("cron: a board 1 hour short of 12 months is untouched", page(fid)[0] == 200)
    check("cron-expired: page 410, delete → 404", page(eid)[0] == 410 and delete(eid, etok)[0] == 404)
    d1(f"UPDATE app_boards SET last_seen={now - (365 + 91) * DAY} WHERE id='{eid}'")
    req("GET", B + "/__scheduled?cron=17+3+*+*+*"); time.sleep(2)
    check("cron: expired rows deleted 90 days later", d1(f"SELECT COUNT(*) n FROM app_boards WHERE id='{eid}'") == [{"n": 0}])
    check("raw edit tokens are never stored (only SHA-256)", d1(f"SELECT COUNT(*) n FROM app_boards WHERE edit_hash LIKE 'abt_%' OR items LIKE '%{ftok}%'") == [{"n": 0}])
else:
    print("SKIP expiry checks (no D1CMD)")

print(f"{ok} passed, {fail} failed")
sys.exit(1 if fail else 0)
