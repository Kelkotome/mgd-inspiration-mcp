"""JSON-RPC checks for the batch-75 MCP tools (3-Nov-2026: mazes, dungeon maps) against a running Worker: make_maze, make_dungeon.
Local:  python3 tests/rpc75.py --base http://127.0.0.1:8895 --baseline-base http://127.0.0.1:8896   (8896 = the b73 commit, before b75)
Live:   python3 tests/rpc75.py --base https://madegooddesigns.com
Checks: new tools on /mcp and /mcp/all but NOT /mcp/core; callable directly, via /mcp/core (hidden-but-callable) and via run_design_tool;
browse_design_tools finds them with their exact schema + page; each starts "Use when", < 650 chars, ≤ 1.6 KB; every baseline tool unchanged;
sample outputs byte-identical vs baseline; real inputs re-derived (perfect maze: passages = cells − 1; room feet = squares × 5); bad inputs → isError;
instructions byte-identical to b73 (1,491 chars; the new tools did not fit and are reached via tools/list + browse_design_tools);
/mcp/core list + instructions unchanged vs baseline. UA curl/8.4.0 (bot-flagged)."""
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
def init(base, path="/inspiration/mcp"): return rpc(base, "initialize", {"protocolVersion": "2025-06-18", "capabilities": {}, "clientInfo": {"name": "rpc75", "version": "1"}}, path=path)["result"]
def text(r): return "\n".join(c.get("text", "") for c in r.get("content", []) if c.get("type") == "text")
near = lambda a, b, e=0.01: a is not None and abs(a - b) <= e
NEW = ["make_maze", "make_dungeon"]
PAGES = {"make_maze": "maze-generator", "make_dungeon": "dungeon-map-generator"}
OLD = ["search_ui_screens", "get_ui_screen_code", "get_ui_flow", "search_design_inspiration", "search_museum_art", "search_annual_reports", "generate_website_color_palette",
       "generate_design_md", "generate_logo_concepts", "make_extruded_part", "make_box_template", "get_book_cover_size", "make_dieline", "lookup_character", "fix_typography",
       "get_sheet_metal_gauge", "calc_sheet_metal_bend", "make_cone_pattern", "make_living_hinge", "make_nutrition_label", "get_desk_ergonomics",
       "calc_quilt", "calc_fabric_yardage", "optimize_cut_list", "make_jigsaw_puzzle", "convert_drawing_scale",
       "get_logo_placement", "make_cd_case_template", "make_paper_piecing_template", "make_voronoi_pattern", "edit_svg_path", "calc_depth_of_field",
       "make_speech_bubble", "make_coat_of_arms", "make_jcard_template", "calc_field_of_view", "calc_exposure_value",
       "make_certificate_border", "calc_kitchen_work_triangle", "plan_square_foot_garden",
       "make_ribbon_banner", "calc_cross_stitch", "get_mockup_print_area", "save_moodboard", "generate_llms_txt",
       "make_star_map", "make_fantasy_map", "make_paper_bag_template", "get_banner_spec"]

ins = init(args.base).get("instructions", "")
print(f"instructions: {len(ins)} chars")
check("instructions < 1500 chars", len(ins) < 1500, len(ins))
check("instructions first line unchanged", ins.split("\n")[0] == "Made Good Designs: call BEFORE building or restyling UI/colours/fonts/logos", ins[:160])
check("instructions still name the older tools (incl. b63-b73)", all(n in ins for n in OLD), [n for n in OLD if n not in ins])
check("instructions still tell clients to cite madegooddesigns.com", "Cite madegooddesigns.com" in ins)
res, size = rpc(args.base, "tools/list", raw=True); tools = res["result"]["tools"]; by = {t["name"]: t for t in tools}
check("no duplicate tool names", len(by) == len(tools))
for n in NEW:
    d = by.get(n)
    check(f"{n}: listed, 'Use when', < 650 chars, ≤ 1.6 KB, readOnly", d and d["description"].startswith("Use when") and len(d["description"]) < 650 and len(json.dumps(d, ensure_ascii=False)) <= 1640 and d.get("annotations", {}).get("readOnlyHint"), n)
added = sum(len(json.dumps(by[n], ensure_ascii=False)) for n in NEW if n in by)
print(f"tools/list: {len(tools)} tools, {size:,} bytes; batch 75 adds {added:,} bytes")
check("batch 75 adds ≤ 4 KB to tools/list", added <= 4000, added)
allt = rpc(args.base, "tools/list", path="/inspiration/mcp/all")["result"]["tools"]
check("/mcp/all = /mcp", allt == tools)
core = rpc(args.base, "tools/list", path="/inspiration/mcp/core")["result"]["tools"]; cnames = [t["name"] for t in core]
check("/mcp/core does NOT list the new tools", not set(NEW) & set(cnames), cnames)
check("/mcp/core ends with browse_design_tools, run_design_tool", cnames[-2:] == ["browse_design_tools", "run_design_tool"], cnames[-3:])
cins = init(args.base, "/inspiration/mcp/core").get("instructions", "")
check("/mcp/core instructions < 1500 and don't name unlisted b75 tools", len(cins) < 1500 and not any(n in cins for n in NEW), len(cins))

if args.baseline_base:
    bres = rpc(args.baseline_base, "tools/list")["result"]["tools"]
    check(f"tool count = baseline + 2 ({len(bres)} + 2 = 100)", len(tools) == len(bres) + 2 == 100, len(tools))
    for t in bres: check(f"backward compatible: {t['name']}", by.get(t["name"]) == t, t["name"])
    check("tool order: baseline order preserved", [t["name"] for t in tools if t["name"] not in NEW] == [t["name"] for t in bres])
    bcore = rpc(args.baseline_base, "tools/list", path="/inspiration/mcp/core")["result"]["tools"]
    check("/mcp/core tools/list byte-identical to baseline", bcore == core, (len(bcore), len(core)))
    check("/mcp/core instructions identical to baseline", init(args.baseline_base, "/inspiration/mcp/core").get("instructions") == cins)
    bins = init(args.baseline_base).get("instructions", "")
    check("/mcp instructions byte-identical to baseline (new tools not named: did not fit)", bins == ins, (len(bins), len(ins)))
    for n, a in [("count_characters", {"text": "Hello — world"}), ("convert_color", {"colors": ["#2563eb"]}), ("get_screw_specs", {"size": "M3"}),
                 ("make_dieline", {"length": 80, "width": 40, "height": 120, "format": "none"}), ("calc_quilt", {"what": "size", "bed": "queen"}),
                 ("make_jigsaw_puzzle", {"rows": 3, "cols": 4, "seed": 2, "format": "none"}), ("make_ribbon_banner", {"text": "Best in Show"}),
                 ("calc_cross_stitch", {"cols": 140, "rows": 100}), ("get_mockup_print_area", {"product": "mug"}), ("get_mockup_print_area", {"product": "canvas"}),
                 ("make_paper_bag_template", {}), ("make_fantasy_map", {"seed": "x"}), ("make_star_map", {"city": "Tokyo", "date": "2026-12-24", "time": "22:00"}),
                 ("get_brochure_panels", {}), ("get_banner_spec", {"preset": "3x8"})]:
        old, new = call(n, a, base=args.baseline_base), call(n, a)
        check(f"unchanged output: {n} {json.dumps(a)[:60]}", text(old) == text(new) and old.get("structuredContent") == new.get("structuredContent") and old.get("isError") == new.get("isError"), (text(old)[:120], text(new)[:120]))
    check("baseline did not know make_maze (proves it is new)", call("make_maze", {"seed": "a"}, base=args.baseline_base).get("isError"))

# ---- discovery
Q = {"make_maze": "maze", "make_dungeon": "dungeon map"}
for n in NEW:
    bt = (call("browse_design_tools", {"query": Q[n]}, path="/inspiration/mcp/core").get("structuredContent") or {}).get("tools", [])
    hit = next((x for x in bt[:3] if x["name"] == n), None)
    check(f"browse '{Q[n]}' → {n} in top 3 with exact schema + page", hit and hit["input_schema"] == by[n]["inputSchema"] and hit.get("page_url") == f"https://madegooddesigns.com/tools/{PAGES[n]}/", [x["name"] for x in bt[:3]])

# ---- real inputs (re-derived)
r = call("make_maze", {"seed": "abc"}); s = r.get("structuredContent") or {}
check("maze default: 15 × 15 = 225 cells, perfect (passages = cells − 1), SVG ≤ 120 KB", s.get("cells") == 225 and s.get("passages") == 224 and s.get("svg", "").lstrip().startswith("<?xml") and len(s["svg"]) <= 120 * 1024, (s.get("cells"), s.get("passages")))
r2 = call("run_design_tool", {"name": "make_maze", "arguments": {"seed": "abc"}}, path="/inspiration/mcp/core")
check("run_design_tool on /mcp/core = direct call (maze)", (r2.get("structuredContent") or {}) == s, text(r2)[:200])
for shape in ["circle", "hex", "triangle"]:
    s = call("make_maze", {"seed": "z", "shape": shape, "difficulty": "hard", "show_solution": True}).get("structuredContent") or {}
    check(f"maze {shape} hard: perfect, solution drawn, ≤ 120 KB", s.get("passages") == s.get("cells", 0) - 1 and 'id="solution"' in s.get("svg", "") and len(s.get("svg", "")) <= 120 * 1024, (s.get("cells"), s.get("passages")))
s = call("make_maze", {"seed": "abc", "loops": 20}).get("structuredContent") or {}
check("maze loops 20%: passages > cells − 1", s.get("passages", 0) > s.get("cells", 0) - 1, (s.get("cells"), s.get("passages")))
r = call("make_maze", {"size": 120, "seed": "big", "shape": "circle"}); s = r.get("structuredContent") or {}
check("huge circle maze → svg_too_large + stats + page link", s.get("svg_too_large") and "svg" not in s and "/tools/maze-generator/" in text(r), s.get("cells"))
r = call("make_dungeon", {"seed": "a"}, path="/inspiration/mcp/core"); s = r.get("structuredContent") or {}
check("hidden on /mcp/core but callable: dungeon 44 × 32 squares = 220 × 160 ft, connected, ≤ 120 KB", not r.get("isError") and s.get("squares") == [44, 32] and s.get("feet") == [220, 160] and s.get("connected") and len(s.get("svg", "")) <= 120 * 1024, (s.get("squares"), s.get("feet")))
rooms = s.get("rooms", [])
check("rooms numbered 1..n by distance, key gives w×5 × h×5 ft", [x["num"] for x in rooms] == list(range(1, len(rooms) + 1)) and all(x["ft"] == [x["w"] * 5, x["h"] * 5] for x in rooms) and all(f"{x['num']}.  {x['w'] * 5} × {x['h'] * 5} ft." in text(r) for x in rooms), [x["num"] for x in rooms])
check("stairs up in room 1, down in the last room", any(x["kind"] == "up" and x["room"] == 1 for x in s.get("stairs", [])) and any(x["kind"] == "down" and x["room"] == len(rooms) for x in s.get("stairs", [])), s.get("stairs"))
again = call("make_dungeon", {"seed": "a"}).get("structuredContent") or {}
check("same seed → identical dungeon", again.get("svg") == s.get("svg") and again.get("rooms") == s.get("rooms"))
s = call("make_dungeon", {"seed": "a", "size": "huge", "style": "parchment"}).get("structuredContent") or {}
check("huge parchment dungeon fits under 120 KB", len(s.get("svg", "")) <= 120 * 1024 and not s.get("svg_too_large"), len(s.get("svg", "")))
for n, a in [("make_maze", {"shape": "star"}), ("make_maze", {"size": 500}), ("make_dungeon", {"size": "colossal"}), ("make_dungeon", {"traps": 50})]:
    check(f"bad input → isError: {n} {a}", call(n, a).get("isError"), a)
print(f"{ok} passed, {fail} failed"); raise SystemExit(1 if fail else 0)
