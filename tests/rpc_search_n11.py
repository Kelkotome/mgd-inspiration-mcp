"""JSON-RPC checks for the 5-Nov-2026 SEARCH changes against a running Worker:
(A) icon-intent hint on library searches, (B) get_brand_typeface, (C) library search (FTS5 when items_fts exists, LIKE otherwise).
Local:  python3 tests/rpc_search_n11.py --base http://127.0.0.1:8947
Live:   python3 tests/rpc_search_n11.py --base https://madegooddesigns.com      (UA curl/8.4.0 = excluded from stats)
--expect-fts asserts the FTS engine answered (fast multi-word search notes); without it the checks are engine-neutral."""
import argparse, json, time, urllib.request
ap = argparse.ArgumentParser(); ap.add_argument("--base", default="http://127.0.0.1:8947"); ap.add_argument("--expect-fts", action="store_true"); args = ap.parse_args()
ok = fail = 0
def check(name, cond, info=""):
    global ok, fail
    ok += bool(cond); fail += not cond
    print(("PASS " if cond else "FAIL ") + name + ("" if cond else " | " + str(info)[:500]))
def rpc(method, params=None, path="/inspiration/mcp"):
    h = {"Content-Type": "application/json", "Accept": "application/json, text/event-stream", "User-Agent": "curl/8.4.0", "MCP-Protocol-Version": "2025-06-18"}
    req = urllib.request.Request(args.base.rstrip("/") + path, data=json.dumps({"jsonrpc": "2.0", "id": 1, "method": method, "params": params or {}}).encode(), headers=h)
    with urllib.request.urlopen(req, timeout=120) as r: return json.loads(r.read())
def call(name, a, path="/inspiration/mcp"): return rpc("tools/call", {"name": name, "arguments": a}, path=path).get("result", {})
def text(r): return "\n".join(c.get("text", "") for c in r.get("content", []) if c.get("type") == "text")

# tools/list + instructions (/mcp and /mcp/core)
for path in ("/inspiration/mcp", "/inspiration/mcp/core"):
    tools = {t["name"]: t for t in rpc("tools/list", path=path)["result"]["tools"]}
    d = tools.get("get_brand_typeface")
    check(f"{path}: get_brand_typeface listed, 'Use when', < 1024 chars, readOnly", d and d["description"].startswith("Use when") and len(d["description"]) < 1024 and d["annotations"]["readOnlyHint"], d and len(d["description"]))
    ins = rpc("initialize", {"protocolVersion": "2025-06-18", "capabilities": {}, "clientInfo": {"name": "rpc_search_n11", "version": "1"}}, path=path)["result"].get("instructions", "")
    if path.endswith("/core"): check(f"{path}: instructions mention get_brand_typeface ({len(ins)} chars)", "get_brand_typeface" in ins, ins[:200])
    else: check(f"{path}: instructions stay < 1500 chars ({len(ins)}; get_brand_typeface did not fit, reached via tools/list)", len(ins) < 1500, len(ins))

# (B)
r = call("get_brand_typeface", {"brand": "Supreme typeface"}); t = text(r); sc = r.get("structuredContent") or {}
check("Supreme: named Futura, Jost look-alike, font + brand guide links", "Futura" in t and "Jost" in t and "madegooddesigns.com/supreme-font/" in t and "supreme-brand-guidelines" in t, t[:600])
check("Supreme: specimen tile image URL", "/inspiration/img/items/" in t, t[:600])
r = call("get_brand_typeface", {"brands": ["Rolex font", "Nikee", "London Underground", "Qwzxv Nonbrand"]}); t = text(r); sc = r.get("structuredContent") or {}
names = [b.get("brand") for b in sc.get("brands", [])]
check("batch: Rolex (custom) + fuzzy 'Nikee' + London Underground (Johnston); nonsense in not_found", "Rolex" in names and "London Underground" in names and any(n and n.lower().startswith("nike") for n in names) and sc.get("not_found") == ["Qwzxv Nonbrand"], (names, sc.get("not_found")))
check("Rolex verdict = custom lettering", "custom lettering" in t, t[:400])
check("Johnston named as commercial", "Johnston (commercial)" in t, t[:900])
r = call("get_brand_typeface", {"brand": "Akamai"}); t = text(r)
check("Akamai: guide's documented typeface flagged as the brand's (not a stand-in)", "Instrument Sans" in t and "names this as the brand's typeface" in t, t[:600])
r = call("get_brand_typeface", {"brand": "Qwzxv Nonbrand"}); t = text(r)
check("unknown brand → '0 results', not an error", not r.get("isError") and t.startswith("0 results"), t[:200])
r = call("get_brand_typeface", {}); check("no input → isError", r.get("isError") is True)
r = call("run_design_tool", {"name": "get_brand_typeface", "arguments": {"brand": "Rolex"}}); check("callable via run_design_tool", "Rolex" in text(r) and not r.get("isError"), text(r)[:200])
r = call("browse_design_tools", {"query": "brand font typeface"}); check("browse_design_tools finds it", "get_brand_typeface" in text(r), text(r)[:300])
if args.base.startswith("https://"):
    import re
    m = re.search(r"https://madegooddesigns\.com/inspiration/img/items/[0-9a-f]{12}\.png", text(call("get_brand_typeface", {"brand": "Supreme"})))
    if m:
        req = urllib.request.Request(m.group(0), method="GET", headers={"User-Agent": "curl/8.4.0", "Accept": "*/*"})
        with urllib.request.urlopen(req, timeout=30) as resp: check("tile image URL serves 200 image/png", resp.status == 200 and "image" in resp.headers.get("content-type", ""), resp.status)

# (A)
r = call("search_design_inspiration", {"query": "bold icon", "limit": 3}); t = text(r)
check("'bold icon' → leads with search_icons hint, keeps library results", t.startswith('Looking for UI icons? search_icons(query="bold")') and "design-inspiration result(s)" in t, t[:300])
r = call("search_design_inspiration", {"query": "settings icons", "limit": 3}); t = text(r)
check("'settings icons' → hint with cleaned query", 'search_icons(query="settings")' in t, t[:200])
r = call("search_design_inspiration", {"query": "serif wordmark", "limit": 3}); t = text(r)
check("'serif wordmark' → no hint", not t.startswith("Looking for UI icons"), t[:120])
r = call("search_museum_art", {"query": "religious icon painting", "limit": 3}); t = text(r)
check("museum 'religious icon painting' → no hint (an icon artwork, not a UI icon)", not t.startswith("Looking for UI icons"), t[:120])

# (C) search behaviour (engine-neutral unless --expect-fts)
def timed(name, a):
    t0 = time.time(); r = call(name, a); return r, (time.time() - t0) * 1000
r, ms = timed("search_museum_art", {"query": "Klimt gold", "limit": 5}); t = text(r)
check(f"'Klimt gold' museum: Klimt works on top ({ms:.0f} ms)", t.count("Klimt") >= 2 and not r.get("isError"), t[:400])
r, ms = timed("search_design_inspiration", {"query": "greek typography", "limit": 5}); t = text(r)
check(f"'greek typography': first hit is Greek ({ms:.0f} ms)", "\n• Greek" in t, t[:300])
r, ms = timed("search_design_inspiration", {"query": "med", "limit": 5}); t = text(r)
check(f"'med' does not match inside words like 'Named' ({ms:.0f} ms)", "Named" not in t.split("\n\n")[1] if "\n\n" in t else True, t[:300])
r, ms = timed("search_annual_reports", {"query": "transit authority modernist grid", "limit": 5}); t = text(r)
check(f"annual reports multi-word: transit authority on top ({ms:.0f} ms)", "Transit" in t and not r.get("isError"), t[:300])
r = call("search_museum_art", {"query": "Bauhaus"}); t = text(r)
check("museum 'Bauhaus' still answers 0 with the sibling hint", "No matches" in t and "search_design_inspiration" in t, t[:300])
r = call("search_design_inspiration", {"query": "Café Crème poster"}); check("diacritics / non-ASCII query does not error", not r.get("isError"), text(r)[:200])
r = call("search_design_inspiration", {"query": "\"unbalanced (quotes* AND OR NEAR"}); check("FTS syntax characters in the query do not error", not r.get("isError"), text(r)[:200])
r = call("search_design_inspiration", {"query": "日本 ポスター"}); check("CJK query does not error", not r.get("isError"), text(r)[:200])
if args.expect_fts:
    r = call("search_design_inspiration", {"query": "rolex typeface"}); t = text(r)
    check("FTS engine answered (tiered note)", "match all of" in t or "matching all of" in t, t[:200])
print(f"{ok} passed, {fail} failed"); raise SystemExit(1 if fail else 0)
