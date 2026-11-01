"""JSON-RPC checks for no-login moodboards (save_moodboard + /inspiration/board/<id>) and progressive tool discovery
(browse_design_tools + run_design_tool on /mcp/core). 2-Nov-2026.
Local:  python3 tests/rpc_moodboard_discovery.py --base http://127.0.0.1:8861   (worker run with MOODBOARD_DAILY_LIMIT=6, ADMIN_TOKEN=local-admin-test)
Live smoke (creates ONE board, views it, deletes it with its token): python3 tests/rpc_moodboard_discovery.py --base https://madegooddesigns.com --live
UA curl/8.4.0 (bot-flagged, out of analytics)."""
import argparse, json, re, urllib.request, urllib.error
ap = argparse.ArgumentParser(); ap.add_argument("--base", default="http://127.0.0.1:8861"); ap.add_argument("--live", action="store_true"); ap.add_argument("--rate-limit", type=int, default=6)
args = ap.parse_args(); B = args.base.rstrip("/")
ok = fail = 0
def check(name, cond, info=""):
    global ok, fail
    ok += bool(cond); fail += not cond
    print(("PASS " if cond else "FAIL ") + name + ("" if cond else " | " + str(info)[:500]))
def rpc(method, params=None, path="/inspiration/mcp/core", pv="2025-06-18"):
    h = {"Content-Type": "application/json", "Accept": "application/json, text/event-stream", "User-Agent": "curl/8.4.0", "MCP-Protocol-Version": pv}
    req = urllib.request.Request(B + path, data=json.dumps({"jsonrpc": "2.0", "id": 1, "method": method, "params": params or {}}).encode(), headers=h)
    with urllib.request.urlopen(req, timeout=120) as r: return json.loads(r.read())
def call(name, a, path="/inspiration/mcp/core"): return rpc("tools/call", {"name": name, "arguments": a}, path).get("result", {})
def text(r): return "\n".join(c.get("text", "") for c in r.get("content", []) if c.get("type") == "text")
def get(url, method="GET"):
    req = urllib.request.Request(url, method=method, headers={"User-Agent": "curl/8.4.0", "Accept": "*/*"}, data=b"" if method == "POST" else None)
    try:
        with urllib.request.urlopen(req, timeout=60) as r: return r.status, dict(r.headers), r.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as e: return e.code, dict(e.headers), e.read().decode("utf-8", "replace")
def local_url(u): return re.sub(r"^https://madegooddesigns\.com", B, u) if not args.live else u

# ---- references from real search results (image URLs, exactly as an agent sees them)
s1 = text(call("search_design_inspiration", {"query": "serif poster", "limit": 4}))
s2 = text(call("search_museum_art", {"query": "Mucha", "limit": 3}))
imgs = re.findall(r"image: (https://madegooddesigns\.com/inspiration/img/\S+)", s1 + "\n" + s2)
pages = re.findall(r"page \(cite this\): (https://madegooddesigns\.com/\S+)", s2)
check("search results give image URLs to save", len(imgs) >= 4, len(imgs))
check("search hint now mentions save_moodboard", "save_moodboard" in s1, s1[-300:])

# ---- create
xss = '<script>alert(1)</script> Wine bar & "co"'
r = call("save_moodboard", {"items": imgs[:3] + pages[:1] + ["https://example.com/nope.jpg", "zzzzzzzzzzzz"], "title": xss, "notes": "Warm, <b>hand-lettered</b>\nsecond line",
                            "item_notes": {imgs[0]: "love the <i>serif</i>"}})
sc = r.get("structuredContent") or {}; t = text(r)
check("create: share URL + edit token + items", not r.get("isError") and re.search(r"/inspiration/board/[a-z0-9]{14}$", sc.get("share_url", "")) and str(sc.get("edit_token", "")).startswith("mbt_") and len(sc.get("items", [])) >= 3, t[:400])
check("create: unknown refs reported as skipped", len(sc.get("skipped", [])) == 2, sc.get("skipped"))
check("create: dedupes museum image + page of the same item", len(sc.get("items", [])) == len(set(sc.get("items", []))), sc.get("items"))
bid, tok, share = sc.get("board_id"), sc.get("edit_token"), sc.get("share_url", "")
check("create: token shown once in text with how to edit", tok and tok in t and "board_id" in t, t[:300])

# ---- page
st, hd, html = get(local_url(share))
check("page: 200, noindex (meta + header)", st == 200 and 'name="robots" content="noindex' in html and "noindex" in hd.get("X-Robots-Tag", hd.get("x-robots-tag", "")), (st, hd))
check("page: title/notes/item note HTML-escaped", "<script>alert(1)" not in html and "&lt;script&gt;" in html and "&lt;b&gt;hand-lettered" in html and "&lt;i&gt;serif" in html, html[:600])
check("page: links each item back to its MGD page + source line", html.count('class="pin"') == len(sc.get("items", [])) and "Source:" in html and "/museum/" in html, html.count('class="pin"'))
check("page: footer links to /design-mcp-server/ + report button", "https://madegooddesigns.com/design-mcp-server/" in html and "Report this board" in html)
check("page: edit token never on the page", tok not in html)

# ---- view via tool (no token)
v = call("save_moodboard", {"board_id": bid})
check("view: board_id alone lists items, no token", not v.get("isError") and (v.get("structuredContent") or {}).get("items") == sc.get("items") and "mbt_" not in text(v), text(v)[:200])

# ---- edit: reject without / with wrong token
e1 = call("save_moodboard", {"board_id": bid, "add_items": [imgs[3]]})
e2 = call("save_moodboard", {"board_id": bid, "edit_token": "mbt_wrongwrongwrongwrongwrongwrong", "title": "pwned"})
check("edit without token → isError", e1.get("isError") and "edit_token" in text(e1), text(e1))
check("edit with wrong token → isError, title unchanged", e2.get("isError") and "pwned" not in get(local_url(share))[2])
# ---- edit with token
e3 = call("save_moodboard", {"board_id": bid, "edit_token": tok, "add_items": [imgs[3]], "remove_items": [imgs[1]], "title": "Wine bar refs"})
items3 = (e3.get("structuredContent") or {}).get("items", [])
check("edit with token: add + remove + retitle", not e3.get("isError") and len(items3) == len(sc["items"]) and imgs[1].split("/")[-1][:12] not in items3 and "Wine bar refs" in get(local_url(share))[2], text(e3)[:300])

scr = re.search(r"screen_id: ([0-9a-f]{12})", text(call("search_ui_screens", {"query": "billing settings"})))
check("a UI screen_id is available for get_ui_screen_code", bool(scr))
if scr:
    u = call("save_moodboard", {"items": [scr.group(1)], "title": "UI refs"}) if args.live is False else {}
    if not args.live:
        check("save_moodboard accepts a screen_id; page links the /ui/ page", not u.get("isError") and "/inspiration/ui/" in get(local_url(u["structuredContent"]["share_url"]))[2], text(u)[:200])
if not args.live:
    # ---- limits
    many = [f"https://madegooddesigns.com/inspiration/img/items/{i:012x}.jpg" for i in range(31)]
    check("limit: > 30 items on create → isError", call("save_moodboard", {"items": many, "title": "x"}).get("isError"))
    long = call("save_moodboard", {"items": imgs[:1], "title": "T" * 300, "notes": "N" * 2000})
    ls = long.get("structuredContent") or {}
    check("limit: title cut to 80 chars", len(ls.get("title", "")) == 80, len(ls.get("title", "")))
    check("no items → isError with guidance", call("save_moodboard", {"title": "empty"}).get("isError"))
    check("only unknown items → isError", call("save_moodboard", {"items": ["zzzzzzzzzzzz"], "title": "x"}).get("isError"))
    # rate limit: 2 boards created so far (+ failures don't count) → fill to the limit, then the next create fails
    made = 3
    while made < args.rate_limit:
        made += 0 if call("save_moodboard", {"items": imgs[:1], "title": f"rl{made}"}).get("isError") else 1
    rl = call("save_moodboard", {"items": imgs[:1], "title": "one too many"})
    check(f"rate limit: create #{args.rate_limit + 1} from one IP in 24 h → isError", rl.get("isError") and "limit" in text(rl).lower(), text(rl))
    check("rate limit: editing an existing board still works", not call("save_moodboard", {"board_id": bid, "edit_token": tok, "notes": "still editable"}).get("isError"))
    # ---- report → hidden after 3; admin restore
    lb = ls.get("board_id")
    for _ in range(3): get(f"{B}/inspiration/board/{lb}/report", "POST")
    check("3 reports hide the board (410)", get(f"{B}/inspiration/board/{lb}")[0] == 410)
    req = urllib.request.Request(f"{B}/inspiration/api/admin/moodboard", data=json.dumps({"id": lb, "disabled": 0}).encode(),
                                 headers={"Content-Type": "application/json", "Authorization": "Bearer local-admin-test", "User-Agent": "curl/8.4.0"})
    check("admin restore → page back", json.loads(urllib.request.urlopen(req).read()).get("disabled") == 0 and get(f"{B}/inspiration/board/{lb}")[0] == 200)
    check("admin without token → 401", get(f"{B}/inspiration/api/admin/moodboard", "POST")[0] == 401)
    check("unknown board → 404", get(f"{B}/inspiration/board/aaaaaaaaaaaaaa")[0] == 404)

# ---- delete with token
d = call("save_moodboard", {"board_id": bid, "edit_token": tok, "delete": True})
check("delete with token → page 404", not d.get("isError") and get(local_url(share))[0] == 404, text(d))

# ---- progressive discovery (/mcp/core)
tl = rpc("tools/list")["result"]["tools"]; names = [t["name"] for t in tl]
check("core list = popular tools + save_moodboard + browse/run", names[-2:] == ["browse_design_tools", "run_design_tool"] and "save_moodboard" in names and 18 <= len(names) <= 22, names)
alltl = {t["name"]: t for t in rpc("tools/list", path="/inspiration/mcp/all")["result"]["tools"]}
check("/mcp/all keeps the full list (no meta-tools) incl. save_moodboard", "save_moodboard" in alltl and "run_design_tool" not in alltl and len(alltl) >= 65, len(alltl))
m = call("browse_design_tools", {})
msc = m.get("structuredContent") or {}
check("browse menu: 10 roles + 10 categories with counts", len(msc.get("roles", {})) == 10 and len(msc.get("categories", {})) == 10 and msc.get("total", 0) >= 65, msc)
b = call("browse_design_tools", {"query": "dieline packaging box"}); bt = (b.get("structuredContent") or {}).get("tools", [])
check("browse query 'dieline' → make_dieline first, with its exact input schema + page", bt and bt[0]["name"] == "make_dieline" and bt[0]["input_schema"] == alltl["make_dieline"]["inputSchema"] and bt[0]["page_url"] == "https://madegooddesigns.com/tools/dieline-generator/", bt[:1])
b = call("browse_design_tools", {"role": "industrial-product"}); bt = (b.get("structuredContent") or {}).get("tools", [])
check("browse role=industrial-product → the 3D tools, schemas identical to tools/list", {"make_gear", "get_screw_specs", "make_extruded_part"} <= {x["name"] for x in bt} and all(x["input_schema"] == alltl[x["name"]]["inputSchema"] for x in bt), [x["name"] for x in bt])
b = call("browse_design_tools", {"category": "diagrams", "role": "motion"}); bt = (b.get("structuredContent") or {}).get("tools", [])
check("browse category+role intersect (diagrams ∩ motion → make_storyboard)", [x["name"] for x in bt] == ["make_storyboard"], [x["name"] for x in bt])
check("browse bad role → isError listing roles", call("browse_design_tools", {"role": "astronaut"}).get("isError"))

USED = [("search_design_inspiration", {"query": "serif poster"}), ("search_ui_screens", {"query": "billing settings"}), ("browse_inspiration_by_theme", {"theme": "retro", "limit": 3}),
        ("search_museum_art", {"query": "Mucha"}), ("search_annual_reports", {"query": "Paul Rand"}), ("list_inspiration_themes", {}),
        ("generate_design_md", {"project_name": "Acme", "brand_color": "#2563eb", "style": "clean"}), ("generate_logo_concepts", {"name": "Luma", "seed": 7}),
        ("generate_color_combinations", {"base_color": "#2563eb", "harmony": "triadic"}), ("get_ui_flow", {"flow": "checkout"}), ("check_contrast", {"colors": ["#111111", "#ffffff"]}),
        ("get_share_feedback", {"link": "https://example.com/not-a-share-link"})]
if scr: USED.append(("get_ui_screen_code", {"screen_id": scr.group(1), "format": "design_md"}))
for n, a in USED:
    direct, via = call(n, a, "/inspiration/mcp/all"), call("run_design_tool", {"name": n, "arguments": a})
    if json.dumps(direct, sort_keys=True) != json.dumps(call(n, a, "/inspiration/mcp/all"), sort_keys=True):
        # random by design (palette jitter): two direct calls differ too → compare shape
        check(f"run_design_tool same shape as direct (tool is random by design): {n}", set(direct.get("structuredContent") or {}) == set(via.get("structuredContent") or {})
              and text(direct).split("\n")[0][:40] == text(via).split("\n")[0][:40] and bool(direct.get("isError")) == bool(via.get("isError")), (text(direct)[:120], text(via)[:120]))
    else:
        check(f"run_design_tool byte-identical to direct: {n}", json.dumps(direct, sort_keys=True) == json.dumps(via, sort_keys=True), (text(direct)[:150], text(via)[:150]))
pd, pv = call("generate_website_color_palette", {"brand_color": "#2563eb"}, "/inspiration/mcp/all"), call("run_design_tool", {"name": "generate_website_color_palette", "arguments": {"brand_color": "#2563eb"}})
check("run_design_tool: generate_website_color_palette (random by design) same shape", set(pd.get("structuredContent", {})) == set(pv.get("structuredContent", {})) and text(pd).split("(")[0] == text(pv).split("(")[0])
r = call("run_design_tool", {"name": "make_dieline", "arguments": {"length": 80, "width": 40, "height": 120}})
check("run_design_tool runs an UNLISTED tool (make_dieline) on /mcp/core", not r.get("isError") and "/tools/dieline-generator/" in text(r), text(r)[:200])
r = call("run_design_tool", {"name": "count_characters", "arguments": {"text": "Hello world"}})
check("dispatched result cites madegooddesigns.com", "https://madegooddesigns.com/" in text(r), text(r)[-200:])
check("run_design_tool: unknown name → isError", call("run_design_tool", {"name": "rm_rf"}).get("isError"))
e = call("run_design_tool", {"name": "make_dieline", "arguments": {"length": "abc", "width": 40}})
check("run_design_tool: bad args → isError naming the problem + schema", e.get("isError") and "'length' should be number" in text(e) and "missing required argument 'height'" in text(e) and "input schema" in text(e), text(e)[:300])
e = call("run_design_tool", {"name": "browse_inspiration_by_theme", "arguments": {"theme": "cyberpunk"}})
check("run_design_tool: enum violation → isError", e.get("isError") and "one of" in text(e), text(e)[:200])
check("run_design_tool: numeric strings accepted like a direct call", not call("run_design_tool", {"name": "make_dieline", "arguments": {"length": "80", "width": 40, "height": 120}}).get("isError"))
print(f"{ok} passed, {fail} failed"); raise SystemExit(1 if fail else 0)
