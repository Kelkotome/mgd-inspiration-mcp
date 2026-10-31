"""JSON-RPC checks for the batch-49 MCP tools (31-Oct-2026) against a running Worker.
Local:  python3 tests/rpc49.py --base http://localhost:8811 --baseline <tools/list JSON of the b48 tree (48 tools)>
Live:   python3 tests/rpc49.py --base https://madegooddesigns.com
Checks: the 4 new tools are listed, start "Use when…"; every baseline tool keeps its name and inputSchema structure — except
convert_color, which may only ADD optional properties (old properties, enums and required unchanged); real-input results;
convert_color without the new params returns exactly the same text as the baseline server (--baseline-base); bad inputs give
isError (never a crash); routing instructions < 1500 chars and mention the new tools. UA curl/8.4.0 (bot-flagged, out of analytics)."""
import argparse, json, re, sys, urllib.request
ap = argparse.ArgumentParser(); ap.add_argument("--base", default="http://localhost:8811"); ap.add_argument("--baseline")
ap.add_argument("--baseline-base", help="a running b48 server to compare convert_color output byte-for-byte"); args = ap.parse_args()
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

NEW = ["get_paper_sizes", "make_grid_paper", "make_storyboard", "generate_llms_txt"]
init = rpc(args.base, "initialize", {"protocolVersion": "2025-06-18", "capabilities": {}, "clientInfo": {"name": "rpc49", "version": "1"}})["result"]
ins = init.get("instructions", "")
check("instructions < 1500 chars", len(ins) < 1500, len(ins))
check("instructions route to the b49 tools", all(n in ins for n in NEW), ins[-300:])
tools = rpc(args.base, "tools/list")["result"]["tools"]; by = {t["name"]: t for t in tools}
for n in NEW:
    check(f"tools/list has {n}", n in by)
    if n in by: check(f"{n} description starts 'Use when'", by[n]["description"].startswith("Use when"), by[n]["description"][:60])
check("no duplicate tool names", len(by) == len(tools))
print(f"tools/list: {len(tools)} tools")
if args.baseline:
    base = json.load(open(args.baseline)); base = base["result"]["tools"] if "result" in base else base
    check(f"tool count = baseline + 4 ({len(base)} + 4)", len(tools) == len(base) + 4, len(tools))
    for t in base:
        n = t["name"]
        check(f"backward compatible: {n} still listed", n in by)
        if n not in by: continue
        old, new = strip(t["inputSchema"]), strip(by[n]["inputSchema"])
        if n == "convert_color":
            op, np_ = old.get("properties", {}), new.get("properties", {})
            check("convert_color: old properties unchanged", all(np_.get(k) == v for k, v in op.items()))
            check("convert_color: only optional properties added", set(np_) - set(op) == {"alpha", "flatten_on", "nearest_name"} and old.get("required") == new.get("required"), sorted(set(np_) - set(op)))
        else:
            check(f"backward compatible: {n} inputSchema structure unchanged", old == new)

# --- get_paper_sizes
r = call("get_paper_sizes", {"query": "A4", "dpi": 300}); t = text(r)
check("paper: A4 210 × 297 mm, 2480 × 3508 px @300", not r.get("isError") and "210 × 297 mm" in t and "2480 × 3508 px" in t, t[:300])
check("paper: CSS @page", "size: 210mm 297mm" in t)
check("paper: source URL", "http" in t.split("Source:")[-1] if "Source:" in t else False, t[-300:])
r = call("get_paper_sizes", {"query": "letter", "compare_with": "a4"})
check("paper: compare letter vs a4", (r.get("structuredContent") or {}).get("compare") is not None, text(r)[-300:])
check("paper: unknown size → isError", call("get_paper_sizes", {"query": "qqqzz"}).get("isError"))
# --- make_grid_paper
r = call("make_grid_paper", {"type": "isometric", "paper": "a4", "spacing": 10}); sc = r.get("structuredContent") or {}
check("grid: isometric A4 SVG 210mm × 297mm", 'width="210mm" height="297mm"' in sc.get("svg", ""), sc.get("svg", "")[:200])
check("grid: links to isometric page", "/tools/isometric-graph-paper/" in text(r))
r = call("make_grid_paper", {"type": "lined", "paper": "letter", "rule": "wide"}); sc = r.get("structuredContent") or {}
check("grid: wide rule 11/32 in = 24.75 pt", abs(sc.get("meta", {}).get("spacingPt", 0) - 24.75) < 0.01, sc.get("meta"))
# --- make_storyboard
r = call("make_storyboard", {"title": "Spot", "aspect": "9:16", "per_page": 4, "paper": "a4", "shots": [{"shot_type": "WS", "duration": 3, "action": "Open on beach"}, {"shot_type": "CU", "duration": 2, "dialogue": "Hi"}, {"shot_type": "MS", "camera": "pan", "duration": 5}, "Logo", "End card"]})
sc = r.get("structuredContent") or {}
check("storyboard: 5 shots → 2 SVG pages at 4/page", len(sc.get("shots", [])) == 5 and len(sc.get("svg_pages", [])) == 2, (len(sc.get("shots", [])), len(sc.get("svg_pages", []))))
check("storyboard: total 10 s", sc.get("total_seconds") == 10, sc.get("total_seconds"))
check("storyboard: markdown table", "|" in sc.get("markdown", ""))
check("storyboard: no shots → isError", call("make_storyboard", {"shots": []}).get("isError"))
# --- generate_llms_txt
r = call("generate_llms_txt", {"title": "Acme", "summary": "Acme makes rockets.", "sections": [{"name": "Docs", "links": [{"title": "API", "url": "https://acme.dev/api.md", "notes": "REST"}]}]})
sc = r.get("structuredContent") or {}
check("llms: build starts with H1 + 0 errors", sc.get("llms_txt", "").startswith("# Acme\n") and sc.get("report", {}).get("errors") == 0, text(r)[:300])
r = call("generate_llms_txt", {"lint": "# A\n# B\n## Docs\n- not a link\n"})
check("llms: lint finds errors", (r.get("structuredContent") or {}).get("report", {}).get("errors", 0) >= 1, text(r)[:400])
check("llms: nothing → isError", call("generate_llms_txt", {}).get("isError"))
# --- convert_color extension
r = call("convert_color", {"colors": ["rgba(37,99,235,0.5)"], "alpha": True, "flatten_on": "#ffffff", "nearest_name": True}); t = text(r)
check("convert_color: flatten = #92b1f5", "`#92b1f5`" in t, t[-400:])
check("convert_color: #2563eb80 + nearest royalblue", "#2563eb80" in t and "royalblue" in t)
plain = call("convert_color", {"colors": ["#2563eb", "oklch(70% 0.25 150)", "rebeccapurple"]})
check("convert_color: no extension text without new params", not re.search(r"HEX8|flattened|nearest CSS name", text(plain)))
if args.baseline_base:
    old = call("convert_color", {"colors": ["#2563eb", "oklch(70% 0.25 150)", "rebeccapurple"]}, base=args.baseline_base)
    check("convert_color: byte-identical to the b48 server without new params", text(old) == text(plain) and old.get("structuredContent") == plain.get("structuredContent"))
print(f"{ok} passed, {fail} failed"); sys.exit(1 if fail else 0)
