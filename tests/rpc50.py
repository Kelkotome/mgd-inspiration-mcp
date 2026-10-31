"""JSON-RPC checks for the batch-50 MCP tools (31-Oct-2026) against a running Worker.
Local:  python3 tests/rpc50.py --base http://localhost:8821 --baseline-base http://localhost:8822   (8822 = the b49 tree)
        or --baseline <tools/list JSON of the b49 tree (52 tools)>
Live:   python3 tests/rpc50.py --base https://madegooddesigns.com
Checks: the 2 new tools are listed and start "Use when…"; every baseline tool keeps its name and inputSchema structure
(no existing tool changes in b50); a sample of existing tools returns byte-identical text vs the baseline server;
real-input results with KDP-formula numbers; bad inputs give isError (never a crash); routing instructions < 1500 chars and
mention the new tools. UA curl/8.4.0 (bot-flagged, out of analytics)."""
import argparse, json, sys, urllib.request
ap = argparse.ArgumentParser(); ap.add_argument("--base", default="http://localhost:8821"); ap.add_argument("--baseline")
ap.add_argument("--baseline-base", help="a running b49 server: tools/list baseline + byte-identical outputs of existing tools"); args = ap.parse_args()
ok = fail = 0
def check(name, cond, info=""):
    global ok, fail
    ok += bool(cond); fail += not cond
    print(("PASS " if cond else "FAIL ") + name + ("" if cond else " | " + str(info)[:400]))
def rpc(base, method, params=None, pv="2025-06-18"):
    h = {"Content-Type": "application/json", "Accept": "application/json, text/event-stream", "User-Agent": "curl/8.4.0", "MCP-Protocol-Version": pv}
    req = urllib.request.Request(base.rstrip("/") + "/inspiration/mcp", data=json.dumps({"jsonrpc": "2.0", "id": 1, "method": method, "params": params or {}}).encode(), headers=h)
    with urllib.request.urlopen(req, timeout=120) as r: return json.loads(r.read())
def call(name, a, base=None): return rpc(base or args.base, "tools/call", {"name": name, "arguments": a}).get("result", {})
def text(r): return "\n".join(c.get("text", "") for c in r.get("content", []) if c.get("type") == "text")
strip = lambda o: {k: strip(v) for k, v in o.items() if k != "description"} if isinstance(o, dict) else [strip(x) for x in o] if isinstance(o, list) else o

NEW = ["get_book_cover_size", "make_affinity_diagram"]
init = rpc(args.base, "initialize", {"protocolVersion": "2025-06-18", "capabilities": {}, "clientInfo": {"name": "rpc50", "version": "1"}})["result"]
ins = init.get("instructions", "")
check("instructions < 1500 chars", len(ins) < 1500, len(ins))
check("instructions route to the b50 tools", all(n in ins for n in NEW), ins[-300:])
check("instructions still route to the b49 tools", all(n in ins for n in ["get_paper_sizes", "make_grid_paper", "make_storyboard", "generate_llms_txt"]))
tools = rpc(args.base, "tools/list")["result"]["tools"]; by = {t["name"]: t for t in tools}
for n in NEW:
    check(f"tools/list has {n}", n in by)
    if n in by: check(f"{n} description starts 'Use when'", by[n]["description"].startswith("Use when"), by[n]["description"][:60])
check("no duplicate tool names", len(by) == len(tools))
print(f"tools/list: {len(tools)} tools")
base = None
if args.baseline:
    base = json.load(open(args.baseline)); base = base["result"]["tools"] if "result" in base else base
elif args.baseline_base:
    base = rpc(args.baseline_base, "tools/list")["result"]["tools"]
if base is not None:
    check(f"tool count = baseline + 2 ({len(base)} + 2)", len(tools) == len(base) + 2, len(tools))
    for t in base:
        n = t["name"]
        check(f"backward compatible: {n} still listed", n in by)
        if n in by: check(f"backward compatible: {n} inputSchema + description unchanged", strip(t["inputSchema"]) == strip(by[n]["inputSchema"]) and t["description"] == by[n]["description"], n)
if args.baseline_base:
    for n, a in [("get_paper_sizes", {"query": "A4"}), ("make_grid_paper", {"type": "dot", "paper": "a4"}), ("convert_color", {"colors": ["#2563eb"]}),
                 ("make_storyboard", {"shots": ["Open", "Close"]}), ("count_characters", {"text": "Hello world"}), ("generate_upc_barcode", {"digits": "03600029145"})]:
        old, new = call(n, a, base=args.baseline_base), call(n, a)
        check(f"unchanged output: {n}", text(old) == text(new) and old.get("structuredContent") == new.get("structuredContent"), (text(old)[:120], text(new)[:120]))

# --- get_book_cover_size (KDP Help: full width = 0.125 + trim + pages × factor + trim + 0.125)
r = call("get_book_cover_size", {"trim": "6x9", "pages": 300, "paper": "white"}); t = text(r); sc = r.get("structuredContent") or {}
check("cover: 6x9 300pp white = 12.9256 × 9.25 in", not r.get("isError") and "12.9256 × 9.25" in t, t[:400])
check("cover: spine 0.6756 in", abs(sc.get("size", {}).get("spine", {}).get("in", 0) - 0.6756) < 1e-9, sc.get("size"))
check("cover: KDP Help sources + not affiliated", "kdp.amazon.com/en_US/help" in t and "Not affiliated with Amazon" in t)
check("cover: next-step hint", "Next step:" in t, t[-200:])
r = call("get_book_cover_size", {"trim": "5.5x8.5", "pages": 120, "paper": "cream", "svg": True}); sc = r.get("structuredContent") or {}
check("cover: 5.5x8.5 120pp cream spine 0.3 in", abs(sc.get("size", {}).get("spine", {}).get("in", 0) - 0.3) < 1e-9, sc.get("size"))
check("cover: svg template", (sc.get("svg") or "").startswith("<svg"))
r = call("get_book_cover_size", {"binding": "ebook"})
check("cover: ebook 1600 × 2560", "1600 × 2560" in text(r), text(r)[:200])
check("cover: 5000 pages → isError", call("get_book_cover_size", {"trim": "6x9", "pages": 5000}).get("isError"))
check("cover: no pages → isError", call("get_book_cover_size", {"trim": "6x9"}).get("isError"))
# --- make_affinity_diagram
r = call("make_affinity_diagram", {"title": "Interviews", "groups": [{"name": "Pricing", "notes": ["Too expensive", {"text": "Tiers unclear", "participant": "P3", "votes": 2}]}, {"name": "Speed", "notes": ["Export is slow"]}]})
sc = r.get("structuredContent") or {}
check("affinity: 3 notes / 2 groups / 2 votes", not r.get("isError") and sc.get("stats", {}).get("notes") == 3 and sc.get("stats", {}).get("groups") == 2 and sc.get("stats", {}).get("votes") == 2, sc.get("stats"))
check("affinity: SVG board", (sc.get("svg") or "").startswith("<svg"))
check("affinity: markdown + csv", "## Pricing" in sc.get("markdown", "") and sc.get("csv", "").count("\n") >= 3)
check("affinity: next-step hint", "Next step:" in text(r))
r = call("make_affinity_diagram", {"notes": "Checkout button hard to find\nCould not find checkout\nPrices unclear on mobile\nMobile prices confusing", "auto_group": True, "svg": False})
check("affinity: auto_group makes groups", (r.get("structuredContent") or {}).get("stats", {}).get("groups", 0) >= 2, text(r)[:300])
check("affinity: nothing → isError", call("make_affinity_diagram", {}).get("isError"))
print(f"{ok} passed, {fail} failed"); sys.exit(1 if fail else 0)
