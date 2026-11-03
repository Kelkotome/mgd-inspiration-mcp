"""JSON-RPC checks for the batch-76 MCP tools (3-Nov-2026: paper airplane fold sheets, paper crowns) against a running Worker: make_paper_airplane_template, make_crown_template.
Local:  python3 tests/rpc76.py --base http://127.0.0.1:8895 --baseline-base http://127.0.0.1:8896   (8896 = the b75 commit, before b76)
Live:   python3 tests/rpc76.py --base https://madegooddesigns.com
Checks: new tools on /mcp and /mcp/all but NOT /mcp/core; callable directly, via /mcp/core (hidden-but-callable) and via run_design_tool;
browse_design_tools finds them with their exact schema + page; each starts "Use when", < 650 chars, ≤ 1.6 KB; every baseline tool unchanged;
sample outputs byte-identical vs baseline; real inputs re-derived (dart nose folds; band = head + overlap; pieces tile the band); bad inputs → isError;
instructions byte-identical to b75 (1,491 chars; the new tools did not fit and are reached via tools/list + browse_design_tools);
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
def init(base, path="/inspiration/mcp"): return rpc(base, "initialize", {"protocolVersion": "2025-06-18", "capabilities": {}, "clientInfo": {"name": "rpc76", "version": "1"}}, path=path)["result"]
def text(r): return "\n".join(c.get("text", "") for c in r.get("content", []) if c.get("type") == "text")
near = lambda a, b, e=0.01: a is not None and abs(a - b) <= e
NEW = ["make_paper_airplane_template", "make_crown_template"]
PAGES = {"make_paper_airplane_template": "paper-airplane-template", "make_crown_template": "paper-crown-template"}
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
print(f"tools/list: {len(tools)} tools, {size:,} bytes; batch 76 adds {added:,} bytes")
check("batch 76 adds ≤ 4 KB to tools/list", added <= 4000, added)
allt = rpc(args.base, "tools/list", path="/inspiration/mcp/all")["result"]["tools"]
check("/mcp/all = /mcp", allt == tools)
core = rpc(args.base, "tools/list", path="/inspiration/mcp/core")["result"]["tools"]; cnames = [t["name"] for t in core]
check("/mcp/core does NOT list the new tools", not set(NEW) & set(cnames), cnames)
check("/mcp/core ends with browse_design_tools, run_design_tool", cnames[-2:] == ["browse_design_tools", "run_design_tool"], cnames[-3:])
cins = init(args.base, "/inspiration/mcp/core").get("instructions", "")
check("/mcp/core instructions < 1500 and don't name unlisted b76 tools", len(cins) < 1500 and not any(n in cins for n in NEW), len(cins))

if args.baseline_base:
    bres = rpc(args.baseline_base, "tools/list")["result"]["tools"]
    check(f"tool count = baseline + 2 ({len(bres)} + 2 = 102)", len(tools) == len(bres) + 2 == 102, len(tools))
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
                 ("get_brochure_panels", {}), ("get_banner_spec", {"preset": "3x8"}), ("make_maze", {"seed": "abc"}), ("make_dungeon", {"seed": "a"})]:
        old, new = call(n, a, base=args.baseline_base), call(n, a)
        check(f"unchanged output: {n} {json.dumps(a)[:60]}", text(old) == text(new) and old.get("structuredContent") == new.get("structuredContent") and old.get("isError") == new.get("isError"), (text(old)[:120], text(new)[:120]))
    check("baseline did not know make_crown_template (proves it is new)", call("make_crown_template", {}, base=args.baseline_base).get("isError"))

# ---- discovery
Q = {"make_paper_airplane_template": "paper airplane", "make_crown_template": "paper crown"}
for n in NEW:
    bt = (call("browse_design_tools", {"query": Q[n]}, path="/inspiration/mcp/core").get("structuredContent") or {}).get("tools", [])
    hit = next((x for x in bt[:3] if x["name"] == n), None)
    check(f"browse '{Q[n]}' → {n} in top 3 with exact schema + page", hit and hit["input_schema"] == by[n]["inputSchema"] and hit.get("page_url") == f"https://madegooddesigns.com/tools/{PAGES[n]}/", [x["name"] for x in bt[:3]])

# ---- real inputs (re-derived)
W, H = 215.9, 279.4
r = call("make_paper_airplane_template", {}); s = r.get("structuredContent") or {}
cr = s.get("creases", [])
check("airplane default: dart on Letter 215.9 × 279.4 mm, true-size SVG ≤ 120 KB", s.get("design") == "dart" and s.get("sheet_mm") == [W, H] and s.get("svg", "").startswith("<svg") and 'width="215.9mm"' in s["svg"] and len(s["svg"]) <= 120 * 1024, s.get("sheet_mm"))
check("valley + mountain = crease segments, both present, steps 1..n", s.get("valley", 0) + s.get("mountain", 0) == len(cr) and s.get("valley") and s.get("mountain") and all(1 <= c["step"] <= len(s.get("steps", [])) for c in cr), (s.get("valley"), s.get("mountain")))
check("dart step 2: nose (W/2, 0) → side edge at y = W/2", any(c["step"] == 2 and any(near(q[0], W / 2, 0.05) and near(q[1], 0, 0.05) for q in (c["a"], c["b"])) and any(near(q[0], 0, 0.05) and near(q[1], W / 2, 0.05) for q in (c["a"], c["b"])) for c in cr))
check("dart step 3: side edge at y = (W/2)/tan 22.5°", any(c["step"] == 3 and any(near(q[0], 0, 0.1) and near(q[1], W / 2 / math.tan(math.pi / 8), 0.1) for q in (c["a"], c["b"])) for c in cr))
r2 = call("run_design_tool", {"name": "make_paper_airplane_template", "arguments": {}}, path="/inspiration/mcp/core")
check("run_design_tool on /mcp/core = direct call (airplane)", (r2.get("structuredContent") or {}) == s, text(r2)[:200])
for d, paper, w in [("glider", "a4", 210), ("nakamura", "letter", W)]:
    q = call("make_paper_airplane_template", {"design": d, "paper": paper}).get("structuredContent") or {}
    check(f"{d} on {paper}: {w} mm wide, more creases than the dart", q.get("design") == d and q.get("sheet_mm", [0])[0] == w and len(q.get("creases", [])) > len(cr), (q.get("sheet_mm"), len(q.get("creases", []))))
r = call("make_crown_template", {}, path="/inspiration/mcp/core"); s = r.get("structuredContent") or {}
pcs = s.get("pieces", [])
check("hidden on /mcp/core but callable: crown band = 570 + 25 = 595 mm, 8 points every 71.25 mm", not r.get("isError") and s.get("band_length_mm") == 595 and s.get("points") == 8 and near(s.get("point_spacing_mm"), 71.25), (s.get("band_length_mm"), s.get("points")))
check("pieces tile the band, 15 mm tabs on all but the last, one SVG per sheet", pcs and near(sum(p["to_mm"] - p["from_mm"] for p in pcs), 595, 0.05) and all(p["glue_tab_mm"] == (15 if i < len(pcs) - 1 else 0) for i, p in enumerate(pcs)) and len(s.get("svgs", [])) == s.get("sheets"), pcs)
s2 = call("make_crown_template", {"head_circumference": 22, "unit": "in", "overlap": 1}).get("structuredContent") or {}
check("inches: 22 in + 1 in = 584.2 mm band", near(s2.get("head_mm"), 558.8) and near(s2.get("band_length_mm"), 584.2), (s2.get("head_mm"), s2.get("band_length_mm")))
s3 = call("make_crown_template", {"style": "tiara", "text": "Mia", "paper": "a3"}).get("structuredContent") or {}
check("tiara on A3 with a name: fewer pieces, name in the SVG", 0 < len(s3.get("pieces", [])) <= len(pcs) and ">Mia</text>" in "".join(s3.get("svgs", [])), len(s3.get("pieces", [])))
check("same input → identical crown", (call("make_crown_template", {}).get("structuredContent") or {}) == s)
for n, a in [("make_paper_airplane_template", {"design": "jet"}), ("make_paper_airplane_template", {"color": "red"}), ("make_crown_template", {"head_circumference": 5}), ("make_crown_template", {"points": 1}), ("make_crown_template", {"band": 8, "height": 15})]:
    check(f"bad input → isError: {n} {a}", call(n, a).get("isError"), a)
print(f"{ok} passed, {fail} failed"); raise SystemExit(1 if fail else 0)
