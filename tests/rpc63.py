"""JSON-RPC checks for the batch-63 MCP tools (2-Nov-2026, making & production craft) against a running Worker:
get_sheet_metal_gauge, calc_sheet_metal_bend, make_cone_pattern, make_living_hinge, make_nutrition_label, get_desk_ergonomics.
Local:  python3 tests/rpc63.py --base http://127.0.0.1:8873 --baseline-base http://127.0.0.1:8874   (8874 = untouched copy of origin before b63)
Live:   python3 tests/rpc63.py --base https://madegooddesigns.com
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
def init(base, path="/inspiration/mcp"): return rpc(base, "initialize", {"protocolVersion": "2025-06-18", "capabilities": {}, "clientInfo": {"name": "rpc63", "version": "1"}}, path=path)["result"]
def text(r): return "\n".join(c.get("text", "") for c in r.get("content", []) if c.get("type") == "text")
near = lambda a, b, e=0.01: a is not None and abs(a - b) <= e
NEW = ["get_sheet_metal_gauge", "calc_sheet_metal_bend", "make_cone_pattern", "make_living_hinge", "make_nutrition_label", "get_desk_ergonomics"]
PAGES = {"get_sheet_metal_gauge": "sheet-metal-gauge-chart", "calc_sheet_metal_bend": "bend-allowance-calculator", "make_cone_pattern": "cone-template",
         "make_living_hinge": "living-hinge-generator", "make_nutrition_label": "nutrition-label-generator", "get_desk_ergonomics": "desk-height-calculator"}
OLD = ["search_ui_screens", "get_ui_screen_code", "get_ui_flow", "search_design_inspiration", "search_museum_art", "search_annual_reports", "generate_website_color_palette",
       "generate_design_md", "generate_logo_concepts", "make_extruded_part", "make_box_template", "get_book_cover_size", "make_dieline", "lookup_character", "fix_typography"]

ins = init(args.base).get("instructions", "")
check("instructions < 1500 chars", len(ins) < 1500, len(ins))
check("instructions first line still leads with 'BEFORE building or restyling UI'", "BEFORE building or restyling UI" in ins.split("\n")[0], ins[:160])
check("instructions name all 6 new tools", all(n in ins for n in NEW), [n for n in NEW if n not in ins])
check("instructions still name the older tools", all(n in ins for n in OLD), [n for n in OLD if n not in ins])
res, size = rpc(args.base, "tools/list", raw=True); tools = res["result"]["tools"]; by = {t["name"]: t for t in tools}
check("no duplicate tool names", len(by) == len(tools))
for n in NEW:
    d = by.get(n)
    check(f"{n}: listed, 'Use when', < 650 chars, ≤ 1.6 KB, readOnly", d and d["description"].startswith("Use when") and len(d["description"]) < 650 and len(json.dumps(d, ensure_ascii=False)) <= 1640 and d.get("annotations", {}).get("readOnlyHint"), d and (len(d["description"]), len(json.dumps(d, ensure_ascii=False))))
added = sum(len(json.dumps(by[n], ensure_ascii=False)) for n in NEW if n in by)
print(f"tools/list: {len(tools)} tools, {size:,} bytes; batch 63 adds {added:,} bytes")
check("batch 63 adds ≤ 9.6 KB to tools/list", added <= 9600, added)
allt = rpc(args.base, "tools/list", path="/inspiration/mcp/all")["result"]["tools"]
check("/mcp/all = /mcp (all six present)", allt == tools)
core = rpc(args.base, "tools/list", path="/inspiration/mcp/core")["result"]["tools"]; cnames = [t["name"] for t in core]
check("/mcp/core does NOT list the new tools (discoverable via browse → run)", not set(NEW) & set(cnames), cnames)
check("/mcp/core ends with browse_design_tools, run_design_tool", cnames[-2:] == ["browse_design_tools", "run_design_tool"], cnames[-3:])
cins = init(args.base, "/inspiration/mcp/core").get("instructions", "")
check("/mcp/core instructions < 1500 and don't name unlisted b63 tools", len(cins) < 1500 and not any(n in cins for n in NEW), len(cins))

if args.baseline_base:
    bres = rpc(args.baseline_base, "tools/list")["result"]["tools"]
    check(f"tool count = baseline + 6 ({len(bres)} + 6)", len(tools) == len(bres) + 6, len(tools))
    for t in bres: check(f"backward compatible: {t['name']}", by.get(t["name"]) == t, t["name"])
    check("tool order: baseline order preserved", [t["name"] for t in tools if t["name"] not in NEW] == [t["name"] for t in bres])
    bcore = rpc(args.baseline_base, "tools/list", path="/inspiration/mcp/core")["result"]["tools"]
    check("/mcp/core tools/list byte-identical to baseline", bcore == core, (len(bcore), len(core)))
    check("/mcp/core instructions identical to baseline", init(args.baseline_base, "/inspiration/mcp/core").get("instructions") == cins)
    for n, a in [("count_characters", {"text": "Hello — world"}), ("style_text_unicode", {"text": "Hi"}), ("convert_color", {"colors": ["#2563eb"]}),
                 ("get_screw_specs", {"size": "M3"}), ("get_book_cover_size", {"trim": "6x9", "pages": 300}), ("get_paper_sizes", {"query": "A4"}),
                 ("make_box_template", {"kind": "laser", "width": 80, "depth": 60, "height": 40}), ("lookup_character", {"query": "em dash"}),
                 ("fix_typography", {"text": "\"hi\" -- there..."}), ("make_dieline", {"length": 80, "width": 40, "height": 120, "format": "none"}), ("make_grid_paper", {"type": "graph"})]:
        old, new = call(n, a, base=args.baseline_base), call(n, a)
        check(f"unchanged output: {n}", text(old) == text(new) and old.get("structuredContent") == new.get("structuredContent"), (text(old)[:120], text(new)[:120]))

# ---- discovery
for n in NEW:
    q = {"get_sheet_metal_gauge": "sheet metal gauge thickness", "calc_sheet_metal_bend": "bend allowance k factor", "make_cone_pattern": "cone flat pattern template",
         "make_living_hinge": "living hinge laser", "make_nutrition_label": "nutrition facts label", "get_desk_ergonomics": "desk height ergonomics"}[n]
    bt = (call("browse_design_tools", {"query": q}, path="/inspiration/mcp/core").get("structuredContent") or {}).get("tools", [])
    hit = next((x for x in bt[:3] if x["name"] == n), None)
    check(f"browse '{q}' → {n} in top 3 with exact schema + page", hit and hit["input_schema"] == by[n]["inputSchema"] and hit.get("page_url") == f"https://madegooddesigns.com/tools/{PAGES[n]}/", [x["name"] for x in bt[:3]])

# ---- real inputs (re-derived)
r = call("get_sheet_metal_gauge", {"gauge": 16}); s = r.get("structuredContent") or {}
check("16 ga steel = 0.0598 in / 1.519 mm (2.5 lb/ft² ÷ 41.82)", s.get("inch") == 0.0598 and near(s.get("mm"), 1.519, 0.002), s)
check("gauge text links its page", "/tools/sheet-metal-gauge-chart/" in text(r), text(r)[-200:])
r = call("run_design_tool", {"name": "get_sheet_metal_gauge", "arguments": {"gauge": 16}}, path="/inspiration/mcp/core")
check("run_design_tool on /mcp/core = direct call", (r.get("structuredContent") or {}) == s, text(r)[:200])
r = call("get_sheet_metal_gauge", {"thickness": 1.5, "unit": "mm"}, path="/inspiration/mcp/core")
check("hidden on /mcp/core but still callable (nearest to 1.5 mm = 16 ga)", not r.get("isError") and (r.get("structuredContent") or {}).get("best", {}).get("gauge") == 16, text(r)[:200])
r = call("calc_sheet_metal_bend", {"thickness": 2, "radius": 2, "angle": 90, "k": 0.33, "flanges": [50, 30], "format": "svg"}); s = r.get("structuredContent") or {}
BA = math.pi / 180 * 90 * (2 + 0.33 * 2); BD = 2 * 4 - BA
check("bend T2 R2 90° K0.33: BA, BD, flat = 80 − BD", near(s.get("ba"), BA, 0.002) and near(s.get("bd"), BD, 0.002) and near(s.get("flat"), 80 - BD, 0.002), (s.get("ba"), s.get("bd"), s.get("flat")))
check("bend flat SVG true size in mm", re.search(r'width="[\d.]+mm"', s.get("svg", "")), s.get("svg", "")[:120])
r = call("make_cone_pattern", {"d1": 300, "d2": 150, "height": 200}); s = r.get("structuredContent") or {}
sl = math.hypot(200, 75); R1 = sl * 2
check("frustum 300/150 × 200: R1 = 427.2, R2 = 213.6, θ = 126.4°", near(s.get("R1"), R1, 0.05) and near(s.get("R2"), R1 / 2, 0.05) and near(s.get("theta"), 360 * 150 / R1, 0.05), (s.get("R1"), s.get("R2"), s.get("theta")))
r = call("make_cone_pattern", {"d1": 200, "d2": 0, "slant": 150, "format": "dxf"}); s = r.get("structuredContent") or {}
check("pointed cone DXF R12 with ARC", "AC1009" in s.get("dxf", "") and "ARC" in s.get("dxf", ""), s.get("type"))
r = call("make_living_hinge", {"format": "dxf"}); s = r.get("structuredContent") or {}
check("living hinge defaults → DXF on CUT layer, bend estimate", "CUT" in s.get("dxf", "") and s.get("max_angle", 0) > 0 and s.get("stats", {}).get("cuts", 0) > 0, (s.get("max_angle"), s.get("stats")))
r = call("make_nutrition_label", {"nutrients": {"Calories": 234, "Total Fat": 4.7, "sodium": 137, "iron": 8, "potassium": 240}, "serving_size": "2/3 cup"}); s = r.get("structuredContent") or {}
row = {x["key"]: x for x in s.get("rows", [])}
check("nutrition rounding: 234 → 230 kcal, fat 4.7 → 4.5g, sodium 137 → 135mg", row.get("calories", {}).get("declared") == "230" and row.get("fat", {}).get("declared") == "4.5g" and row.get("sodium", {}).get("declared") == "135mg", [row.get(k, {}).get("declared") for k in ("calories", "fat", "sodium")])
check("nutrition %DV: iron 45%, potassium 6%", row.get("iron", {}).get("dvText") == "45%" and row.get("potassium", {}).get("dvText") == "6%", [row.get(k, {}).get("dvText") for k in ("iron", "potassium")])
check("nutrition SVG + regulator caveat", "Nutrition Facts" in s.get("svg", "") and "confirm with your regulator" in text(r), text(r)[-300:])
r = call("get_desk_ergonomics", {"height": 175}); s = r.get("structuredContent") or {}
check("desk 175 cm: seat 44.8, sit desk 66.5, stand desk 109.6 (ANSUR II ratios)", near(s.get("sit", {}).get("seat"), 44.8, 0.11) and near(s.get("sit", {}).get("desk"), 66.5, 0.11) and near(s.get("stand", {}).get("desk"), 109.6, 0.11), s.get("sit"))
for n, a in [("get_sheet_metal_gauge", {}), ("calc_sheet_metal_bend", {"thickness": 0, "radius": 1}), ("make_cone_pattern", {"d1": 100, "d2": 50}),
             ("make_living_hinge", {"pitch": 0}), ("make_nutrition_label", {"nutrients": {"foo": 1}}), ("get_desk_ergonomics", {"height": 0})]:
    check(f"bad input → isError: {n}", call(n, a).get("isError"), a)
print(f"{ok} passed, {fail} failed"); raise SystemExit(1 if fail else 0)
