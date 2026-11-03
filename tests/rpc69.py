"""JSON-RPC checks for the batch-69 MCP tools (3-Nov-2026: ribbon banners, cross-stitch sizing, mockup print areas)
against a running Worker: make_ribbon_banner, calc_cross_stitch, get_mockup_print_area.
Local:  python3 tests/rpc69.py --base http://127.0.0.1:8895 --baseline-base http://127.0.0.1:8896   (8896 = the b68 commit, before b69)
Live:   python3 tests/rpc69.py --base https://madegooddesigns.com
Checks: new tools on /mcp and /mcp/all but NOT /mcp/core; callable directly, via /mcp/core (hidden-but-callable) and via run_design_tool;
browse_design_tools finds them with their exact schema + page; each starts "Use when", < 650 chars, ≤ 1.6 KB; every baseline tool unchanged;
sample outputs byte-identical vs baseline; real inputs re-derived from the formulas; bad inputs → isError; instructions < 1500 chars and
name the new tools while still naming every older one; /mcp/core list + instructions unchanged vs baseline. UA curl/8.4.0 (bot-flagged)."""
import argparse, json, math, re, urllib.request
ap = argparse.ArgumentParser(); ap.add_argument("--base", default="http://127.0.0.1:8885"); ap.add_argument("--baseline-base"); args = ap.parse_args()
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
def init(base, path="/inspiration/mcp"): return rpc(base, "initialize", {"protocolVersion": "2025-06-18", "capabilities": {}, "clientInfo": {"name": "rpc69", "version": "1"}}, path=path)["result"]
def text(r): return "\n".join(c.get("text", "") for c in r.get("content", []) if c.get("type") == "text")
near = lambda a, b, e=0.01: a is not None and abs(a - b) <= e
NEW = ["make_ribbon_banner", "calc_cross_stitch", "get_mockup_print_area"]
PAGES = {"make_ribbon_banner": "ribbon-banner", "calc_cross_stitch": "cross-stitch-pattern-maker", "get_mockup_print_area": "t-shirt-mockup"}
OLD = ["search_ui_screens", "get_ui_screen_code", "get_ui_flow", "search_design_inspiration", "search_museum_art", "search_annual_reports", "generate_website_color_palette",
       "generate_design_md", "generate_logo_concepts", "make_extruded_part", "make_box_template", "get_book_cover_size", "make_dieline", "lookup_character", "fix_typography",
       "get_sheet_metal_gauge", "calc_sheet_metal_bend", "make_cone_pattern", "make_living_hinge", "make_nutrition_label", "get_desk_ergonomics",
       "calc_quilt", "calc_fabric_yardage", "optimize_cut_list", "make_jigsaw_puzzle", "convert_drawing_scale",
       "get_logo_placement", "make_cd_case_template", "make_paper_piecing_template", "make_voronoi_pattern", "edit_svg_path", "calc_depth_of_field",
       "make_speech_bubble", "make_coat_of_arms", "make_jcard_template", "calc_field_of_view", "calc_exposure_value",
       "make_certificate_border", "calc_kitchen_work_triangle", "plan_square_foot_garden"]

ins = init(args.base).get("instructions", "")
check("instructions < 1500 chars", len(ins) < 1500, len(ins))
check("instructions first line still leads with 'BEFORE building or restyling UI'", "BEFORE building or restyling UI" in ins.split("\n")[0], ins[:160])
check("instructions name all 3 new tools", all(n in ins for n in NEW), [n for n in NEW if n not in ins])
check("instructions still name the older tools (incl. b63-b68)", all(n in ins for n in OLD), [n for n in OLD if n not in ins])
res, size = rpc(args.base, "tools/list", raw=True); tools = res["result"]["tools"]; by = {t["name"]: t for t in tools}
check("no duplicate tool names", len(by) == len(tools))
for n in NEW:
    d = by.get(n)
    check(f"{n}: listed, 'Use when', < 650 chars, ≤ 1.6 KB, readOnly", d and d["description"].startswith("Use when") and len(d["description"]) < 650 and len(json.dumps(d, ensure_ascii=False)) <= 1640 and d.get("annotations", {}).get("readOnlyHint"), n)
added = sum(len(json.dumps(by[n], ensure_ascii=False)) for n in NEW if n in by)
print(f"tools/list: {len(tools)} tools, {size:,} bytes; batch 69 adds {added:,} bytes")
check("batch 69 adds ≤ 6 KB to tools/list", added <= 6000, added)
allt = rpc(args.base, "tools/list", path="/inspiration/mcp/all")["result"]["tools"]
check("/mcp/all = /mcp", allt == tools)
core = rpc(args.base, "tools/list", path="/inspiration/mcp/core")["result"]["tools"]; cnames = [t["name"] for t in core]
check("/mcp/core does NOT list the new tools (discoverable via browse → run)", not set(NEW) & set(cnames), cnames)
check("/mcp/core ends with browse_design_tools, run_design_tool", cnames[-2:] == ["browse_design_tools", "run_design_tool"], cnames[-3:])
cins = init(args.base, "/inspiration/mcp/core").get("instructions", "")
check("/mcp/core instructions < 1500 and don't name unlisted b69 tools", len(cins) < 1500 and not any(n in cins for n in NEW), len(cins))

if args.baseline_base:
    bres = rpc(args.baseline_base, "tools/list")["result"]["tools"]
    check(f"tool count = baseline + 3 ({len(bres)} + 3)", len(tools) == len(bres) + 3, len(tools))
    for t in bres: check(f"backward compatible: {t['name']}", by.get(t["name"]) == t, t["name"])
    check("tool order: baseline order preserved", [t["name"] for t in tools if t["name"] not in NEW] == [t["name"] for t in bres])
    bcore = rpc(args.baseline_base, "tools/list", path="/inspiration/mcp/core")["result"]["tools"]
    check("/mcp/core tools/list byte-identical to baseline", bcore == core, (len(bcore), len(core)))
    check("/mcp/core instructions identical to baseline", init(args.baseline_base, "/inspiration/mcp/core").get("instructions") == cins)
    bins = init(args.baseline_base).get("instructions", "")
    import re as _re
    nm = lambda x: set(_re.findall(r"\b[a-z]+(?:_[a-z0-9]+)+\b", x))
    check("instructions: every tool named in the baseline is still named", nm(bins) <= nm(ins), nm(bins) - nm(ins))
    for n, a in [("count_characters", {"text": "Hello — world"}), ("convert_color", {"colors": ["#2563eb"]}), ("get_screw_specs", {"size": "M3"}),
                 ("make_dieline", {"length": 80, "width": 40, "height": 120, "format": "none"}), ("get_sheet_metal_gauge", {"gauge": 16}),
                 ("calc_quilt", {"what": "size", "bed": "queen"}), ("make_jigsaw_puzzle", {"rows": 3, "cols": 4, "seed": 2, "format": "none"}),
                 ("convert_drawing_scale", {"value": "27'-6\"", "scale": "1/4\"=1'-0\""}),
                 ("make_cd_case_template", {"part": "tray"}), ("calc_depth_of_field", {"focal": 50, "aperture": 8, "distance": 3}),
                 ("make_jcard_template", {}), ("calc_exposure_value", {"aperture": 16, "shutter": "1/125", "iso": 100}),
                 ("make_certificate_border", {"style": "ornate"}), ("calc_kitchen_work_triangle", {"legs": [1.8, 2.1, 1.5]}), ("plan_square_foot_garden", {})]:
        old, new = call(n, a, base=args.baseline_base), call(n, a)
        check(f"unchanged output: {n}", text(old) == text(new) and old.get("structuredContent") == new.get("structuredContent"), (text(old)[:120], text(new)[:120]))

# ---- discovery
Q = {"make_ribbon_banner": "ribbon banner", "calc_cross_stitch": "cross stitch", "get_mockup_print_area": "t-shirt print area"}
for n in NEW:
    bt = (call("browse_design_tools", {"query": Q[n]}, path="/inspiration/mcp/core").get("structuredContent") or {}).get("tools", [])
    hit = next((x for x in bt[:3] if x["name"] == n), None)
    check(f"browse '{Q[n]}' → {n} in top 3 with exact schema + page", hit and hit["input_schema"] == by[n]["inputSchema"] and hit.get("page_url") == f"https://madegooddesigns.com/tools/{PAGES[n]}/", [x["name"] for x in bt[:3]])

# ---- real inputs (re-derived: stitches ÷ count, inches × dpi, mm ÷ 25.4)
r = call("make_ribbon_banner", {"text": "Best in Show"}); s = r.get("structuredContent") or {}
check("ribbon: folded + notch by default, SVG with the text on a path, fits", s.get("shape") == "folded" and s.get("end") == "notch" and s.get("svg", "").startswith("<svg") and "Best in Show" in s.get("svg", "") and (s.get("text_fit") or [{}])[0].get("fits") is True, s.get("text_fit"))
r2 = call("run_design_tool", {"name": "make_ribbon_banner", "arguments": {"text": "Best in Show"}}, path="/inspiration/mcp/core")
check("run_design_tool on /mcp/core = direct call", (r2.get("structuredContent") or {}) == s, text(r2)[:200])
r = call("make_ribbon_banner", {"shape": "double", "text": "A", "text2": "B", "end": "point"}); s = r.get("structuredContent") or {}
check("double ribbon → two text fits", len(s.get("text_fit") or []) == 2 and s.get("end") == "point", s.get("text_fit"))
r = call("calc_cross_stitch", {"cols": 140, "rows": 100}, path="/inspiration/mcp/core"); s = r.get("structuredContent") or {}
check("hidden on /mcp/core but callable: 140 × 100 on 14-count = 10 × 7.14 in", not r.get("isError") and near((s.get("finished_in") or [0])[0], 10) and near((s.get("finished_in") or [0, 0])[1], 100 / 14), s.get("finished_in"))
r = call("calc_cross_stitch", {"width": 20, "height": 25, "unit": "cm", "fabric": "ev32"}); s = r.get("structuredContent") or {}
check("20 × 25 cm on 32-count over 2 (16 spi) = 126 × 157", s.get("cols") == round(20 / 2.54 * 16) and s.get("rows") == round(25 / 2.54 * 16), (s.get("cols"), s.get("rows")))
r = call("get_mockup_print_area", {"product": "mug", "size": "11"}); a0 = ((r.get("structuredContent") or {}).get("areas") or [{}])[0]
check("11 oz mug wrap 219.6 × 85 mm → 2594 × 1004 px at 300 dpi", a0.get("px") == [round(219.6 / 25.4 * 300), round(85 / 25.4 * 300)], a0.get("px"))
r = call("get_mockup_print_area", {"product": "tshirt", "area": "full", "dpi": 150}); a0 = ((r.get("structuredContent") or {}).get("areas") or [{}])[0]
check("t-shirt full front 12 × 16 in at 150 dpi = 1800 × 2400 px", a0.get("in") == [12, 16] and a0.get("px") == [1800, 2400], a0)
r = call("get_mockup_print_area", {"product": "billboard", "size": "bulletin"}); a0 = ((r.get("structuredContent") or {}).get("areas") or [{}])[0]
check("bulletin 48 × 14 ft", a0.get("ft") == [48, 14] and "billboard-mockup/" in text(r), a0)
for n, a in [("make_ribbon_banner", {"shape": "zigzag"}), ("calc_cross_stitch", {}), ("get_mockup_print_area", {"product": "jersey"})]:   # b73 made "cap" a valid product
    check(f"bad input → isError: {n}", call(n, a).get("isError"), a)
print(f"{ok} passed, {fail} failed"); raise SystemExit(1 if fail else 0)
