"""JSON-RPC checks for the batch-78 MCP tools (3-Nov-2026: sign letter height, sign tiling, printable signs) against a running Worker: get_sign_letter_height, plan_sign_tiling, make_sign.
Local:  python3 tests/rpc78.py --base http://127.0.0.1:8895 --baseline-base http://127.0.0.1:8896   (8896 = the b76 commit, before b78)
Live:   python3 tests/rpc78.py --base https://madegooddesigns.com
Checks: new tools on /mcp and /mcp/all but NOT /mcp/core; callable directly, via /mcp/core (hidden-but-callable) and via run_design_tool;
browse_design_tools finds them with their exact schema + page; each starts "Use when", < 650 chars, ≤ 1.6 KB; every baseline tool unchanged;
sample outputs byte-identical vs baseline; real inputs re-derived (10 / 30 ft per inch; tiles step by printable − overlap and cover the sign); bad inputs → isError;
instructions byte-identical to b76 (1,491 chars; the new tools did not fit and are reached via tools/list + browse_design_tools);
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
def init(base, path="/inspiration/mcp"): return rpc(base, "initialize", {"protocolVersion": "2025-06-18", "capabilities": {}, "clientInfo": {"name": "rpc78", "version": "1"}}, path=path)["result"]
def text(r): return "\n".join(c.get("text", "") for c in r.get("content", []) if c.get("type") == "text")
near = lambda a, b, e=0.01: a is not None and abs(a - b) <= e
NEW = ["get_sign_letter_height", "plan_sign_tiling", "make_sign"]
PAGES = {"get_sign_letter_height": "yard-sale-sign", "plan_sign_tiling": "sign-maker", "make_sign": "out-of-order-sign"}
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
print(f"tools/list: {len(tools)} tools, {size:,} bytes; batch 78 adds {added:,} bytes")
check("batch 78 adds ≤ 4.5 KB to tools/list", added <= 4500, added)
allt = rpc(args.base, "tools/list", path="/inspiration/mcp/all")["result"]["tools"]
check("/mcp/all = /mcp", allt == tools)
core = rpc(args.base, "tools/list", path="/inspiration/mcp/core")["result"]["tools"]; cnames = [t["name"] for t in core]
check("/mcp/core does NOT list the new tools", not set(NEW) & set(cnames), cnames)
check("/mcp/core ends with browse_design_tools, run_design_tool", cnames[-2:] == ["browse_design_tools", "run_design_tool"], cnames[-3:])
cins = init(args.base, "/inspiration/mcp/core").get("instructions", "")
check("/mcp/core instructions < 1500 and don't name unlisted b78 tools", len(cins) < 1500 and not any(n in cins for n in NEW), len(cins))

if args.baseline_base:
    bres = rpc(args.baseline_base, "tools/list")["result"]["tools"]
    check(f"tool count = baseline + 2 ({len(bres)} + 3 = 105)", len(tools) == len(bres) + 3 == 105, len(tools))
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
                 ("make_paper_airplane_template", {}), ("make_crown_template", {"style": "tiara", "text": "Mia"})]:
        old, new = call(n, a, base=args.baseline_base), call(n, a)
        check(f"unchanged output: {n} {json.dumps(a)[:60]}", text(old) == text(new) and old.get("structuredContent") == new.get("structuredContent") and old.get("isError") == new.get("isError"), (text(old)[:120], text(new)[:120]))
    check("baseline did not know make_sign (proves it is new)", call("make_sign", {}, base=args.baseline_base).get("isError"))

# ---- discovery
Q = {"get_sign_letter_height": "sign letter height", "plan_sign_tiling": "tile sign sheets", "make_sign": "out of order sign"}
for n in NEW:
    bt = (call("browse_design_tools", {"query": Q[n]}, path="/inspiration/mcp/core").get("structuredContent") or {}).get("tools", [])
    hit = next((x for x in bt[:3] if x["name"] == n), None)
    check(f"browse '{Q[n]}' → {n} in top 3 with exact schema + page", hit and hit["input_schema"] == by[n]["inputSchema"] and hit.get("page_url") == f"https://madegooddesigns.com/tools/{PAGES[n]}/", [x["name"] for x in bt[:3]])

# ---- real inputs (re-derived)
IN = 25.4
r = call("get_sign_letter_height", {"distance": 100}); s = r.get("structuredContent") or {}
check("100 ft → easy 10 in (10 ft per inch), minimum 3.33 in (30 ft per inch)", s.get("easy_cap_in") == 10 and s.get("min_cap_in") == 3.33 and s.get("recommended_size") is None, s)
rows = s.get("sizes", [])
check("sizes table: easy = cap_in × 10 ft, max = × 30 ft", len(rows) == 9 and all(abs(x["easy_ft"] - x["cap_mm"] / IN * 10) <= 0.6 and abs(x["max_ft"] - x["cap_mm"] / IN * 30) <= 0.6 for x in rows), rows[:2])
r2 = call("run_design_tool", {"name": "get_sign_letter_height", "arguments": {"distance": 100}}, path="/inspiration/mcp/core")
check("run_design_tool on /mcp/core = direct call (letter height)", (r2.get("structuredContent") or {}) == s, text(r2)[:200])
s = call("get_sign_letter_height", {"distance": 20}).get("structuredContent") or {}
i = next(k for k, x in enumerate(s.get("sizes", [])) if x["cap_in"] >= 2)
check("20 ft → 2 in, recommends the first size whose title is ≥ 2 in", s.get("easy_cap_in") == 2 and s.get("recommended_size") == s["sizes"][i]["size"], s.get("recommended_size"))
s = call("get_sign_letter_height", {"cap_height": 1}).get("structuredContent") or {}
check("1 in letters → easy 10 ft, max 30 ft", s.get("easy_ft") == 10 and s.get("max_ft") == 30, s)
r = call("plan_sign_tiling", {}, path="/inspiration/mcp/core"); s = r.get("structuredContent") or {}
t = s.get("tiles", [])
check("hidden on /mcp/core but callable: 18 × 24 in on Letter = 8 sheets (2 × 4), 12 mm overlap", not r.get("isError") and s.get("sheets") == 8 and s.get("cols") == 2 and s.get("rows") == 4 and s.get("overlap_mm") == 12, (s.get("sheets"), s.get("cols"), s.get("rows")))
pw, ph = s.get("printable_mm", [0, 0])
check("tiles step by printable − overlap and end exactly at the sign edge", t and all(near(x["crop_mm"]["x"], (x["col"] - 1) * (pw - 12), 0.15) and near(x["crop_mm"]["y"], (x["row"] - 1) * (ph - 12), 0.15) for x in t)
      and near(max(x["crop_mm"]["x"] + x["crop_mm"]["w"] for x in t), 18 * IN, 0.15) and near(max(x["crop_mm"]["y"] + x["crop_mm"]["h"] for x in t), 24 * IN, 0.15) and [n for row in s["grid"] for n in row] == list(range(1, 9)), t[:2])
s = call("plan_sign_tiling", {"size": "a1", "sheet": "a4"}).get("structuredContent") or {}
check("A1 on A4: sheets = cols × rows, crops within the printable area", s.get("sheets") == s.get("cols", 0) * s.get("rows", 0) and all(x["crop_mm"]["w"] <= s["printable_mm"][0] + 0.05 for x in s.get("tiles", [])), (s.get("sheets"), s.get("cols"), s.get("rows")))
r = call("make_sign", {}); s = r.get("structuredContent") or {}
check("make_sign default: out of order, Letter, 1 SVG with the title, ≤ 120 KB", s.get("kind") == "ooo" and s.get("pages") == 1 and ">OUT OF ORDER<" in s.get("svgs", [""])[0] and len(s["svgs"][0]) <= 120 * 1024, s.get("sheet_mm"))
s = call("make_sign", {"kind": "yard", "lines": ["YARD SALE", "SAT NOV 14", "8 AM – 1 PM", "12 Elm Rd"], "size": "18x24"}).get("structuredContent") or {}
check("yard 18 × 24 landscape with your lines; title height → 10 ft per inch", s.get("sheet_mm") == [609.6, 457.2] and ">12 Elm Rd<" in s.get("svgs", [""])[0] and s.get("easy_read_ft") == round(s.get("title_cap_mm", 0) / IN * 10), (s.get("sheet_mm"), s.get("easy_read_ft")))
s = call("make_sign", {"kind": "reserved", "preset": "wedding"}).get("structuredContent") or {}
check("reserved wedding: 2 tent pages (one per name)", s.get("pages") == 2 and s.get("layout") == "tent", s.get("pages"))
check("same input → identical sign", (call("make_sign", {"kind": "reserved", "preset": "wedding"}).get("structuredContent") or {}) == s)
# 9-Nov-2026 (mcp-errors-r1): no-argument and synonym inputs now get an answer, not an error (tests/mcp_errors_r1_rpc.py covers them)
for n, a in [("get_sign_letter_height", {"distance": -5}), ("plan_sign_tiling", {"size": "a0"}), ("make_sign", {"kind": "exit"}), ("make_sign", {"kind": "yard", "layout": "tent"})]:
    check(f"bad input → isError: {n} {a}", call(n, a).get("isError"), a)
print(f"{ok} passed, {fail} failed"); raise SystemExit(1 if fail else 0)
