"""JSON-RPC checks for the batch-53 MCP tool make_dieline (1-Nov-2026, packaging dielines) against a running Worker.
Local:  python3 tests/rpc53.py --base http://127.0.0.1:8851 --baseline-base http://127.0.0.1:8852   (8852 = untouched copy of origin before b53)
Live:   python3 tests/rpc53.py --base https://madegooddesigns.com
Checks: the new tool is listed, starts "Use when…" and is small; every baseline tool keeps its name, inputSchema and description;
a sample of existing tools returns byte-identical output vs the baseline; real inputs (panel maths, SVG/DXF true size); bad inputs → isError;
instructions < 1500 chars and route to make_dieline; tools/list size growth. UA curl/8.4.0 (bot-flagged, out of analytics)."""
import argparse, json, re, urllib.request
ap = argparse.ArgumentParser(); ap.add_argument("--base", default="http://127.0.0.1:8851"); ap.add_argument("--baseline-base"); args = ap.parse_args()
ok = fail = 0
def check(name, cond, info=""):
    global ok, fail
    ok += bool(cond); fail += not cond
    print(("PASS " if cond else "FAIL ") + name + ("" if cond else " | " + str(info)[:400]))
def rpc(base, method, params=None, pv="2025-06-18", raw=False):
    h = {"Content-Type": "application/json", "Accept": "application/json, text/event-stream", "User-Agent": "curl/8.4.0", "MCP-Protocol-Version": pv}
    req = urllib.request.Request(base.rstrip("/") + "/inspiration/mcp", data=json.dumps({"jsonrpc": "2.0", "id": 1, "method": method, "params": params or {}}).encode(), headers=h)
    with urllib.request.urlopen(req, timeout=120) as r:
        b = r.read()
        return (json.loads(b), len(b)) if raw else json.loads(b)
def call(name, a, base=None): return rpc(base or args.base, "tools/call", {"name": name, "arguments": a}).get("result", {})
def text(r): return "\n".join(c.get("text", "") for c in r.get("content", []) if c.get("type") == "text")
strip = lambda o: {k: strip(v) for k, v in o.items() if k != "description"} if isinstance(o, dict) else [strip(x) for x in o] if isinstance(o, list) else o
NEW = ["make_dieline"]
ins = rpc(args.base, "initialize", {"protocolVersion": "2025-06-18", "capabilities": {}, "clientInfo": {"name": "rpc53", "version": "1"}})["result"].get("instructions", "")
check("instructions < 1500 chars", len(ins) < 1500, len(ins))
check("instructions route to make_dieline", all(n in ins for n in NEW), ins[-400:])
check("instructions still route to older tools", all(n in ins for n in ["search_ui_screens", "get_ui_screen_code", "get_ui_flow", "search_design_inspiration", "search_museum_art", "search_annual_reports", "generate_website_color_palette", "generate_design_md", "generate_logo_concepts", "make_extruded_part", "make_box_template", "get_book_cover_size", "lookup_character", "fix_typography"]))
res, size = rpc(args.base, "tools/list", raw=True); tools = res["result"]["tools"]; by = {t["name"]: t for t in tools}
for n in NEW:
    check(f"tools/list has {n}", n in by)
    if n in by: check(f"{n} description starts 'Use when' and < 650 chars", by[n]["description"].startswith("Use when") and len(by[n]["description"]) < 650, len(by[n]["description"]))
check("no duplicate tool names", len(by) == len(tools))
added = sum(len(json.dumps(by[n], ensure_ascii=False)) for n in NEW if n in by)
print(f"tools/list: {len(tools)} tools, {size:,} bytes; make_dieline adds {added:,} bytes")
check("make_dieline adds ≤ 1.6 KB to tools/list", added <= 1640, added)
if args.baseline_base:
    bres, bsize = rpc(args.baseline_base, "tools/list", raw=True); base = bres["result"]["tools"]
    check(f"tool count = baseline + 1 ({len(base)} + 1)", len(tools) == len(base) + 1, len(tools))
    for t in base:
        n = t["name"]
        check(f"backward compatible: {n}", n in by and t == by[n], n)
    bins = rpc(args.baseline_base, "initialize", {"protocolVersion": "2025-06-18", "capabilities": {}, "clientInfo": {"name": "rpc53", "version": "1"}})["result"].get("instructions", "")
    check("instructions: only change is ', make_dieline' on the Print line", ins == bins.replace("get_book_cover_size.", "get_book_cover_size, make_dieline.", 1), (len(bins), len(ins)))
    for n, a in [("count_characters", {"text": "Hello — world"}), ("style_text_unicode", {"text": "Hi"}), ("convert_color", {"colors": ["#2563eb"]}),
                 ("get_screw_specs", {"size": "M3"}), ("get_book_cover_size", {"trim": "6x9", "pages": 300}), ("get_paper_sizes", {"query": "A4"}),
                 ("make_box_template", {"kind": "laser", "width": 80, "depth": 60, "height": 40}), ("lookup_character", {"query": "em dash"}), ("fix_typography", {"text": "\"hi\" -- there..."}),
                 ("make_grid_paper", {"type": "graph"})]:
        old, new = call(n, a, base=args.baseline_base), call(n, a)
        check(f"unchanged output: {n}", text(old) == text(new) and old.get("structuredContent") == new.get("structuredContent"), (text(old)[:120], text(new)[:120]))
r = call("make_dieline", {"length": 80, "width": 40, "height": 120}); s = r.get("structuredContent") or {}
check("default RTE 80×40×120 mm in 16 pt: crease 80.41 × 40.41 × 120.41", s.get("structure") == "rte" and s.get("dims", {}).get("crease") == [80.41, 40.41, 120.41], s.get("dims"))
m = re.search(r'width="([\d.]+)mm" height="([\d.]+)mm"', s.get("svg", ""))
check("SVG true size = flat + 2 × (3 mm bleed + 3 mm margin)", m and abs(float(m.group(1)) - (s["flat"][0] + 12)) < 0.01 and abs(float(m.group(2)) - (s["flat"][1] + 12)) < 0.01, m and m.groups())
check("text: panels, fold check, sheets, page link, next step", all(x in text(r) for x in ["Panels (w × h)", "Fold check passed", "fits", "/tools/dieline-generator/", "100%", "Next step:"]), text(r)[:500])
r = call("make_dieline", {"structure": "rsc", "length": 12, "width": 9, "height": 6, "unit": "in", "format": "dxf"}); s = r.get("structuredContent") or {}
check("RSC 12×9×6 in: B-flute default, FEFCO 0201, DXF layers", s.get("board_mm") == 3.2 and s.get("ref") == "FEFCO 0201" and all(l in s.get("dxf", "") for l in ["AC1009", "CUT", "CREASE", "BLEED"]), (s.get("board_mm"), s.get("ref")))
r = call("make_dieline", {"structure": "pillow", "length": 6, "width": 3, "height": 0.5, "unit": "in", "format": "none"})
check("pillow 3 × 6 in, curve 0.5 in, no file", not r.get("isError") and "end curves 0.5 in deep" in text(r) and "svg" not in (r.get("structuredContent") or {}), text(r)[:300])
r = call("make_dieline", {"structure": "lidbase", "length": 100, "width": 100, "height": 50, "format": "none"}); check("lid + base: lid line", "Lid (separate net)" in text(r), text(r)[:300])
check("bad size → isError", call("make_dieline", {"length": 0, "width": 2, "height": 3}).get("isError"))
check("unknown board → isError", call("make_dieline", {"length": 80, "width": 40, "height": 120, "board": "zz"}).get("isError"))
check("unknown structure → isError", call("make_dieline", {"structure": "pizza", "length": 80, "width": 40, "height": 120}).get("isError"))
print(f"{ok} passed, {fail} failed"); raise SystemExit(1 if fail else 0)
