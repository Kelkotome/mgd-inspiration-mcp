"""JSON-RPC checks for the batch-79 MCP tools (3-Nov-2026: picture frame sizing, bottle / can / cup label wraps) against a running Worker: get_frame_size, calc_label_wrap.
Local:  python3 tests/rpc79.py --base http://127.0.0.1:8895 --baseline-base http://127.0.0.1:8896   (8896 = the b78 commit, before b79)
Live:   python3 tests/rpc79.py --base https://madegooddesigns.com
Checks: new tools on /mcp and /mcp/all but NOT /mcp/core; callable directly, via /mcp/core (hidden-but-callable) and via run_design_tool;
browse_design_tools finds them with their exact schema + page; each starts "Use when", < 650 chars, ≤ 1.6 KB; every baseline tool unchanged;
sample outputs byte-identical vs baseline; real inputs re-derived (frame = print + 2 mat; C = π d; cone sector radii and angle); bad inputs → isError;
instructions byte-identical to b78 (1,491 chars; the new tools did not fit and are reached via tools/list + browse_design_tools);
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
def init(base, path="/inspiration/mcp"): return rpc(base, "initialize", {"protocolVersion": "2025-06-18", "capabilities": {}, "clientInfo": {"name": "rpc79", "version": "1"}}, path=path)["result"]
def text(r): return "\n".join(c.get("text", "") for c in r.get("content", []) if c.get("type") == "text")
near = lambda a, b, e=0.01: a is not None and abs(a - b) <= e
NEW = ["get_frame_size", "calc_label_wrap"]
PAGES = {"get_frame_size": "frame-mockup", "calc_label_wrap": "bottle-mockup"}
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
print(f"tools/list: {len(tools)} tools, {size:,} bytes; batch 79 adds {added:,} bytes")
check("batch 79 adds ≤ 4.5 KB to tools/list", added <= 4500, added)
allt = rpc(args.base, "tools/list", path="/inspiration/mcp/all")["result"]["tools"]
check("/mcp/all = /mcp", allt == tools)
core = rpc(args.base, "tools/list", path="/inspiration/mcp/core")["result"]["tools"]; cnames = [t["name"] for t in core]
check("/mcp/core does NOT list the new tools", not set(NEW) & set(cnames), cnames)
check("/mcp/core ends with browse_design_tools, run_design_tool", cnames[-2:] == ["browse_design_tools", "run_design_tool"], cnames[-3:])
cins = init(args.base, "/inspiration/mcp/core").get("instructions", "")
check("/mcp/core instructions < 1500 and don't name unlisted b79 tools", len(cins) < 1500 and not any(n in cins for n in NEW), len(cins))

if args.baseline_base:
    bres = rpc(args.baseline_base, "tools/list")["result"]["tools"]
    check(f"tool count = baseline + 2 ({len(bres)} + 2 = 108)", len(tools) == len(bres) + 2 == 108, len(tools))
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
                 ("get_brochure_panels", {}), ("get_banner_spec", {"preset": "3x8"}), ("make_maze", {"seed": "abc"}), ("make_dungeon", {"seed": "a"}),
                 ("make_paper_airplane_template", {}), ("make_crown_template", {"style": "tiara", "text": "Mia"}),
                 ("get_sign_letter_height", {"distance": 40}), ("plan_sign_tiling", {"size": "24x36"}), ("make_sign", {"kind": "yard"}), ("get_mockup_print_area", {"product": "canvas"})]:
        old, new = call(n, a, base=args.baseline_base), call(n, a)
        check(f"unchanged output: {n} {json.dumps(a)[:60]}", text(old) == text(new) and old.get("structuredContent") == new.get("structuredContent") and old.get("isError") == new.get("isError"), (text(old)[:120], text(new)[:120]))
    check("baseline did not know calc_label_wrap (proves it is new)", call("calc_label_wrap", {}, base=args.baseline_base).get("isError"))

# ---- discovery
Q = {"get_frame_size": "picture frame size mat", "calc_label_wrap": "bottle label wrap"}
for n in NEW:
    bt = (call("browse_design_tools", {"query": Q[n]}, path="/inspiration/mcp/core").get("structuredContent") or {}).get("tools", [])
    hit = next((x for x in bt[:3] if x["name"] == n), None)
    check(f"browse '{Q[n]}' → {n} in top 3 with exact schema + page", hit and hit["input_schema"] == by[n]["inputSchema"] and hit.get("page_url") == f"https://madegooddesigns.com/tools/{PAGES[n]}/", [x["name"] for x in bt[:3]])

# ---- real inputs (re-derived)
PI = math.pi
r = call("get_frame_size", {}); s = r.get("structuredContent") or {}
check("16 × 20 print, 2 in mat, 1 in moulding: frame 20 × 24, opening 15.75 × 19.75, outside 21.5 × 25.5 in", s.get("frame_in") == [20, 24] and s.get("mat_opening_in") == [15.75, 19.75] and s.get("outer_in") == [21.5, 25.5], s)
r2 = call("run_design_tool", {"name": "get_frame_size", "arguments": {}}, path="/inspiration/mcp/core")
check("run_design_tool on /mcp/core = direct call (frame)", (r2.get("structuredContent") or {}) == s, text(r2)[:200])
s = call("get_frame_size", {"size": "a3", "mat": 3, "moulding": 2, "orientation": "landscape"}).get("structuredContent") or {}
w, h = 420 / 25.4, 297 / 25.4
check("A3 landscape, 3 in mat, 2 in moulding: frame = print + 6, outside = frame + 3.5", near(s.get("frame_in", [0])[0], w + 6) and near(s.get("frame_in", [0, 0])[1], h + 6) and near(s.get("outer_in", [0])[0], w + 6 + 3.5), s)
r = call("calc_label_wrap", {}, path="/inspiration/mcp/core"); s = r.get("structuredContent") or {}
check("hidden on /mcp/core but callable: wine bottle C = π × 75, label 45% of C", not r.get("isError") and near(s.get("circumference_mm"), PI * 75, 0.06) and near(s.get("label_mm", [0])[0], PI * 75 * 0.45, 0.06) and s.get("degrees") == 162, s)
check("apparent front width = d sin(π × 0.45)", near(s.get("front_apparent_width_mm"), 75 * math.sin(PI * 0.45), 0.06), s.get("front_apparent_width_mm"))
s = call("calc_label_wrap", {"container": "can", "type": "sleek12"}).get("structuredContent") or {}
check("sleek 12 oz can: full wrap = π × 58", near(s.get("label_mm", [0])[0], PI * 58, 0.06) and s.get("coverage_pct") == 100, s.get("label_mm"))
s = call("calc_label_wrap", {"container": "cup", "type": "paper12"}).get("structuredContent") or {}
sl = math.hypot(112, 15); Ro = sl * 45 / 15
sec = s.get("sector", {})
check("12 oz cup: outer = slant × R / (R − r), inner = outer − slant, angle = 360 R / outer", near(sec.get("outer_radius_mm"), Ro, 0.06) and near(sec.get("inner_radius_mm"), Ro - sl, 0.06) and near(sec.get("full_angle_deg"), 360 * 45 / Ro, 0.06) and near(sec.get("outer_arc_mm"), PI * 90, 0.06), sec)
check("same input → identical cup", (call("calc_label_wrap", {"container": "cup", "type": "paper12"}).get("structuredContent") or {}) == s)
for n, a in [("get_frame_size", {"size": "5x7"}), ("get_frame_size", {"mat": 9}), ("calc_label_wrap", {"container": "jar"}), ("calc_label_wrap", {"container": "cup", "rim": 50, "base": 80, "height": 90}), ("calc_label_wrap", {"coverage": 200})]:
    check(f"bad input → isError: {n} {a}", call(n, a).get("isError"), a)
print(f"{ok} passed, {fail} failed"); raise SystemExit(1 if fail else 0)
