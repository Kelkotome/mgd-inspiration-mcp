"""JSON-RPC checks for the batch-64 MCP tools (3-Nov-2026, quilting + fabric, cut lists, jigsaw cut files, drawing scales) against a running Worker:
calc_quilt, calc_fabric_yardage, optimize_cut_list, make_jigsaw_puzzle, convert_drawing_scale.
Local:  python3 tests/rpc64.py --base http://127.0.0.1:8873 --baseline-base http://127.0.0.1:8874   (8874 = untouched copy of origin before b64)
Live:   python3 tests/rpc64.py --base https://madegooddesigns.com
Checks: new tools on /mcp and /mcp/all but NOT /mcp/core; callable directly, via /mcp/core (hidden-but-callable) and via run_design_tool;
browse_design_tools finds them with their exact schema + page; each starts "Use when", < 650 chars, ≤ 1.6 KB; every baseline tool unchanged;
sample outputs byte-identical vs baseline; real inputs re-derived from the formulas; bad inputs → isError; instructions < 1500 chars and
name the new tools while still naming the older ones; /mcp/core list + instructions unchanged vs baseline. UA curl/8.4.0 (bot-flagged)."""
import argparse, json, math, re, urllib.request
ap = argparse.ArgumentParser(); ap.add_argument("--base", default="http://127.0.0.1:8873"); ap.add_argument("--baseline-base"); args = ap.parse_args()
ok = fail = 0
def check(name, cond, info=""):
    global ok, fail
    ok += bool(cond); fail += not cond
    print(("PASS " if cond else "FAIL ") + name + ("" if cond else " | " + str(info)[:400]))
def rpc(base, method, params=None, pv="2025-06-18", raw=False, path="/inspiration/mcp"):
    h = {"Content-Type": "application/json", "Accept": "application/json, text/event-stream", "User-Agent": "curl/8.4.0", "MCP-Protocol-Version": pv}
    req = urllib.request.Request(base.rstrip("/") + path, data=json.dumps({"jsonrpc": "2.0", "id": 1, "method": method, "params": params or {}}).encode(), headers=h)
    with urllib.request.urlopen(req, timeout=120) as r:
        b = r.read()
        return (json.loads(b), len(b)) if raw else json.loads(b)
def call(name, a, base=None, path="/inspiration/mcp"): return rpc(base or args.base, "tools/call", {"name": name, "arguments": a}, path=path).get("result", {})
def init(base, path="/inspiration/mcp"): return rpc(base, "initialize", {"protocolVersion": "2025-06-18", "capabilities": {}, "clientInfo": {"name": "rpc64", "version": "1"}}, path=path)["result"]
def text(r): return "\n".join(c.get("text", "") for c in r.get("content", []) if c.get("type") == "text")
near = lambda a, b, e=0.01: a is not None and abs(a - b) <= e
NEW = ["calc_quilt", "calc_fabric_yardage", "optimize_cut_list", "make_jigsaw_puzzle", "convert_drawing_scale"]
PAGES = {"calc_quilt": "quilt-calculator", "calc_fabric_yardage": "fabric-yardage-calculator", "optimize_cut_list": "cut-list-optimizer",
         "make_jigsaw_puzzle": "jigsaw-puzzle-generator", "convert_drawing_scale": "architectural-scale-calculator"}
OLD = ["search_ui_screens", "get_ui_screen_code", "get_ui_flow", "search_design_inspiration", "search_museum_art", "search_annual_reports", "generate_website_color_palette",
       "generate_design_md", "generate_logo_concepts", "make_extruded_part", "make_box_template", "get_book_cover_size", "make_dieline", "lookup_character", "fix_typography",
       "get_sheet_metal_gauge", "calc_sheet_metal_bend", "make_cone_pattern", "make_living_hinge", "make_nutrition_label", "get_desk_ergonomics"]

ins = init(args.base).get("instructions", "")
check("instructions < 1500 chars", len(ins) < 1500, len(ins))
check("instructions first line still leads with 'BEFORE building or restyling UI'", "BEFORE building or restyling UI" in ins.split("\n")[0], ins[:160])
check("instructions name all 5 new tools", all(n in ins for n in NEW), [n for n in NEW if n not in ins])
check("instructions still name the older tools (incl. b63)", all(n in ins for n in OLD), [n for n in OLD if n not in ins])
res, size = rpc(args.base, "tools/list", raw=True); tools = res["result"]["tools"]; by = {t["name"]: t for t in tools}
check("no duplicate tool names", len(by) == len(tools))
for n in NEW:
    d = by.get(n)
    check(f"{n}: listed, 'Use when', < 650 chars, ≤ 1.6 KB, readOnly", d and d["description"].startswith("Use when") and len(d["description"]) < 650 and len(json.dumps(d, ensure_ascii=False)) <= 1640 and d.get("annotations", {}).get("readOnlyHint"), d and (len(d["description"]), len(json.dumps(d, ensure_ascii=False))))
added = sum(len(json.dumps(by[n], ensure_ascii=False)) for n in NEW if n in by)
print(f"tools/list: {len(tools)} tools, {size:,} bytes; batch 64 adds {added:,} bytes")
check("batch 64 adds ≤ 8 KB to tools/list", added <= 8000, added)
allt = rpc(args.base, "tools/list", path="/inspiration/mcp/all")["result"]["tools"]
check("/mcp/all = /mcp", allt == tools)
core = rpc(args.base, "tools/list", path="/inspiration/mcp/core")["result"]["tools"]; cnames = [t["name"] for t in core]
check("/mcp/core does NOT list the new tools (discoverable via browse → run)", not set(NEW) & set(cnames), cnames)
check("/mcp/core ends with browse_design_tools, run_design_tool", cnames[-2:] == ["browse_design_tools", "run_design_tool"], cnames[-3:])
cins = init(args.base, "/inspiration/mcp/core").get("instructions", "")
check("/mcp/core instructions < 1500 and don't name unlisted b64 tools", len(cins) < 1500 and not any(n in cins for n in NEW), len(cins))

if args.baseline_base:
    bres = rpc(args.baseline_base, "tools/list")["result"]["tools"]
    check(f"tool count = baseline + 5 ({len(bres)} + 5)", len(tools) == len(bres) + 5, len(tools))
    for t in bres: check(f"backward compatible: {t['name']}", by.get(t["name"]) == t, t["name"])
    check("tool order: baseline order preserved", [t["name"] for t in tools if t["name"] not in NEW] == [t["name"] for t in bres])
    bcore = rpc(args.baseline_base, "tools/list", path="/inspiration/mcp/core")["result"]["tools"]
    check("/mcp/core tools/list byte-identical to baseline", bcore == core, (len(bcore), len(core)))
    check("/mcp/core instructions identical to baseline", init(args.baseline_base, "/inspiration/mcp/core").get("instructions") == cins)
    for n, a in [("count_characters", {"text": "Hello — world"}), ("convert_color", {"colors": ["#2563eb"]}), ("get_screw_specs", {"size": "M3"}),
                 ("get_book_cover_size", {"trim": "6x9", "pages": 300}), ("make_box_template", {"kind": "laser", "width": 80, "depth": 60, "height": 40}),
                 ("make_dieline", {"length": 80, "width": 40, "height": 120, "format": "none"}), ("get_sheet_metal_gauge", {"gauge": 16}),
                 ("make_cone_pattern", {"d1": 300, "d2": 150, "height": 200, "format": "none"}), ("get_desk_ergonomics", {"height": 175})]:
        old, new = call(n, a, base=args.baseline_base), call(n, a)
        check(f"unchanged output: {n}", text(old) == text(new) and old.get("structuredContent") == new.get("structuredContent"), (text(old)[:120], text(new)[:120]))

# ---- discovery
Q = {"calc_quilt": "quilt size backing binding", "calc_fabric_yardage": "fabric yardage", "optimize_cut_list": "cut list plywood sheet",
     "make_jigsaw_puzzle": "jigsaw puzzle laser", "convert_drawing_scale": "architectural scale drawing"}
for n in NEW:
    bt = (call("browse_design_tools", {"query": Q[n]}, path="/inspiration/mcp/core").get("structuredContent") or {}).get("tools", [])
    hit = next((x for x in bt[:3] if x["name"] == n), None)
    check(f"browse '{Q[n]}' → {n} in top 3 with exact schema + page", hit and hit["input_schema"] == by[n]["inputSchema"] and hit.get("page_url") == f"https://madegooddesigns.com/tools/{PAGES[n]}/", [x["name"] for x in bt[:3]])

# ---- real inputs (re-derived)
yd = lambda inch: math.ceil(inch / 36 * 8 - 1e-9) / 8
r = call("calc_quilt", {"what": "size", "bed": "queen"}); s = r.get("structuredContent") or {}
check("queen: 60 + 2·12 = 84 wide, 80 + 12 + 10 = 102 long", s.get("width") == 84 and s.get("length") == 102, (s.get("width"), s.get("length")))
r = call("run_design_tool", {"name": "calc_quilt", "arguments": {"what": "size", "bed": "queen"}}, path="/inspiration/mcp/core")
check("run_design_tool on /mcp/core = direct call", (r.get("structuredContent") or {}) == s, text(r)[:200])
r = call("calc_quilt", {"what": "binding", "width": 60, "length": 72}, path="/inspiration/mcp/core"); s = r.get("structuredContent") or {}
bl = 2 * 132 + 10; st = math.ceil(bl / 39.5)
check(f"hidden on /mcp/core but callable: binding {bl} in, {st} strips, {yd(st * 2.5)} yd", not r.get("isError") and s.get("length") == bl and s.get("strips") == st and s.get("yards") == yd(st * 2.5), (s.get("length"), s.get("strips"), s.get("yards")))
r = call("calc_quilt", {"cols": 5, "rows": 6, "block": 12, "sashing": 2, "borders": [3, 5]}); s = r.get("structuredContent") or {}
check("block plan 88 × 102 with a cutting table and page link", s.get("size", {}).get("width") == 88 and s.get("size", {}).get("length") == 102 and "| Item | Cut | Buy |" in text(r) and "/tools/quilt-calculator/" in text(r), s.get("size"))
r = call("calc_fabric_yardage", {"width": 54, "pieces": [{"w": 20, "h": 30, "qty": 4}]}); s = r.get("structuredContent") or {}
check("4 × 20×30 on 54 in: 60 in → 1 3/4 yd", near(s.get("exact"), 60) and s.get("yards") == 1.75, (s.get("exact"), s.get("yards")))
r = call("optimize_cut_list", {"mode": "linear", "stocks": [{"len": 2400}], "parts": [{"len": 700, "qty": 5, "name": "Rail"}]}); s = r.get("structuredContent") or {}
check("linear 5 × 700 from 2400 bars (3 mm kerf): 2 bars, util 72.92%", s.get("summary", {}).get("bars") == 2 and near(s.get("summary", {}).get("util"), 3500 / 4800 * 100), s.get("summary"))
r = call("optimize_cut_list", {"stocks": [{"w": 2440, "h": 1220}], "parts": [{"w": 600, "h": 300, "qty": 10}], "format": "svg"}); s = r.get("structuredContent") or {}
check("sheet: 10 shelves placed, util = 1.8 m² / sheets × 2.9768 m², SVG", s.get("summary", {}).get("placed") == 10 and near(s.get("summary", {}).get("util"), 10 * 600 * 300 / (s.get("summary", {}).get("sheets", 1) * 2440 * 1220) * 100) and (s.get("svgs") or [""])[0].startswith("<svg"), s.get("summary"))
r = call("make_jigsaw_puzzle", {"rows": 4, "cols": 6, "width": 300, "height": 200, "seed": 7}); s = r.get("structuredContent") or {}
check("jigsaw 4 × 6 on 300 × 200: 24 pieces of 50 mm, true-size SVG", s.get("pieces") == 24 and near(s.get("cell_w"), 50) and 'width="300mm"' in s.get("svg", ""), (s.get("pieces"), s.get("cell_w")))
r2 = call("make_jigsaw_puzzle", {"rows": 4, "cols": 6, "width": 300, "height": 200, "seed": 7})
check("same seed → identical cut file", (r2.get("structuredContent") or {}).get("svg") == s.get("svg"))
r = call("convert_drawing_scale", {"value": "27'-6\"", "scale": "1/4\"=1'-0\""}); s = r.get("structuredContent") or {}
check("27'-6\" at 1/4\" = 1'-0\" (1:48) = 6.875 in", s.get("ratio") == 48 and near(s.get("out"), 6.875), s)
r = call("convert_drawing_scale", {"real": "10 m", "drawing": "200 mm"}); s = r.get("structuredContent") or {}
check("find scale 10 m / 200 mm = 1:50", near(s.get("ratio"), 50) and s.get("nearest", [{}])[0].get("label") == "1:50", s.get("nearest", [])[:2])
for n, a in [("calc_quilt", {}), ("calc_fabric_yardage", {"width": 42, "pieces": []}), ("optimize_cut_list", {"parts": [{"w": 1, "h": 1}]}),
             ("make_jigsaw_puzzle", {"rows": 1, "cols": 5}), ("convert_drawing_scale", {"value": "3 m", "scale": "zz"})]:
    check(f"bad input → isError: {n}", call(n, a).get("isError"), a)
print(f"{ok} passed, {fail} failed"); raise SystemExit(1 if fail else 0)
