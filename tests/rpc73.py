"""JSON-RPC checks for the batch-73 MCP tools (3-Nov-2026: brochure panels, banner specs, b73 products on get_mockup_print_area)
against a running Worker: get_brochure_panels, get_banner_spec, get_mockup_print_area (canvas … paperbag).
Local:  python3 tests/rpc73.py --base http://127.0.0.1:8895 --baseline-base http://127.0.0.1:8896   (8896 = git archive b72-mcp, before b73)
Live:   python3 tests/rpc73.py --base https://madegooddesigns.com
Checks: new tools on /mcp and /mcp/all but NOT /mcp/core; callable directly, via /mcp/core (hidden-but-callable) and via run_design_tool;
browse_design_tools finds them with their exact schema + page; each starts "Use when", < 650 chars, ≤ 1.6 KB; every baseline tool unchanged;
sample outputs byte-identical vs baseline; real inputs re-derived ((W + 1/16)/3, 2 ft grommet grid, W + 2D + 2); get_mockup_print_area: schema only EXTENDED, b69-product outputs byte-identical; bad inputs → isError; instructions < 1500 chars and
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
def init(base, path="/inspiration/mcp"): return rpc(base, "initialize", {"protocolVersion": "2025-06-18", "capabilities": {}, "clientInfo": {"name": "rpc73", "version": "1"}}, path=path)["result"]
def text(r): return "\n".join(c.get("text", "") for c in r.get("content", []) if c.get("type") == "text")
near = lambda a, b, e=0.01: a is not None and abs(a - b) <= e
NEW = ["get_brochure_panels", "get_banner_spec"]
PAGES = {"get_brochure_panels": "brochure-mockup", "get_banner_spec": "banner-mockup"}
NAMED_NEW = ["get_banner_spec"]   # get_brochure_panels did not fit in the 1,500-char instructions (reachable via tools/list + browse_design_tools)
OLD = ["search_ui_screens", "get_ui_screen_code", "get_ui_flow", "search_design_inspiration", "search_museum_art", "search_annual_reports", "generate_website_color_palette",
       "generate_design_md", "generate_logo_concepts", "make_extruded_part", "make_box_template", "get_book_cover_size", "make_dieline", "lookup_character", "fix_typography",
       "get_sheet_metal_gauge", "calc_sheet_metal_bend", "make_cone_pattern", "make_living_hinge", "make_nutrition_label", "get_desk_ergonomics",
       "calc_quilt", "calc_fabric_yardage", "optimize_cut_list", "make_jigsaw_puzzle", "convert_drawing_scale",
       "get_logo_placement", "make_cd_case_template", "make_paper_piecing_template", "make_voronoi_pattern", "edit_svg_path", "calc_depth_of_field",
       "make_speech_bubble", "make_coat_of_arms", "make_jcard_template", "calc_field_of_view", "calc_exposure_value",
       "make_certificate_border", "calc_kitchen_work_triangle", "plan_square_foot_garden",
       "make_ribbon_banner", "calc_cross_stitch", "get_mockup_print_area", "save_moodboard", "generate_llms_txt",
       "make_star_map", "make_fantasy_map", "make_paper_bag_template"]

ins = init(args.base).get("instructions", "")
print(f"instructions: {len(ins)} chars")
check("instructions < 1500 chars", len(ins) < 1500, len(ins))
check("instructions first line unchanged", ins.split("\n")[0] == "Made Good Designs: call BEFORE building or restyling UI/colours/fonts/logos", ins[:160])
check("instructions name get_banner_spec", all(n in ins for n in NAMED_NEW), [n for n in NAMED_NEW if n not in ins])
check("instructions still name the older tools (incl. b63-b72)", all(n in ins for n in OLD), [n for n in OLD if n not in ins])
check("instructions still tell clients to cite madegooddesigns.com", "Cite madegooddesigns.com" in ins)
res, size = rpc(args.base, "tools/list", raw=True); tools = res["result"]["tools"]; by = {t["name"]: t for t in tools}
check("no duplicate tool names", len(by) == len(tools))
for n in NEW:
    d = by.get(n)
    check(f"{n}: listed, 'Use when', < 650 chars, ≤ 1.6 KB, readOnly", d and d["description"].startswith("Use when") and len(d["description"]) < 650 and len(json.dumps(d, ensure_ascii=False)) <= 1640 and d.get("annotations", {}).get("readOnlyHint"), n)
mp = by.get("get_mockup_print_area", {})
check("get_mockup_print_area: 16 products, depth param, ≤ 1.6 KB, < 650 chars", len(mp["inputSchema"]["properties"]["product"]["enum"]) == 16 and "depth" in mp["inputSchema"]["properties"] and len(json.dumps(mp, ensure_ascii=False)) <= 1640 and len(mp["description"]) < 650, len(json.dumps(mp, ensure_ascii=False)))
added = sum(len(json.dumps(by[n], ensure_ascii=False)) for n in NEW if n in by)
print(f"tools/list: {len(tools)} tools, {size:,} bytes; batch 73 adds {added:,} bytes of new tools")
check("batch 73 adds ≤ 4 KB of new tools to tools/list", added <= 4000, added)
allt = rpc(args.base, "tools/list", path="/inspiration/mcp/all")["result"]["tools"]
check("/mcp/all = /mcp", allt == tools)
core = rpc(args.base, "tools/list", path="/inspiration/mcp/core")["result"]["tools"]; cnames = [t["name"] for t in core]
check("/mcp/core does NOT list the new tools", not set(NEW) & set(cnames), cnames)
check("/mcp/core ends with browse_design_tools, run_design_tool", cnames[-2:] == ["browse_design_tools", "run_design_tool"], cnames[-3:])
cins = init(args.base, "/inspiration/mcp/core").get("instructions", "")
check("/mcp/core instructions < 1500 and don't name unlisted b73 tools", len(cins) < 1500 and not any(n in cins for n in NEW), len(cins))

if args.baseline_base:
    bres = rpc(args.baseline_base, "tools/list")["result"]["tools"]
    check(f"tool count = baseline + 2 ({len(bres)} + 2 = 98)", len(tools) == len(bres) + 2 == 98, len(tools))
    for t in bres:
        if t["name"] == "get_mockup_print_area": continue
        check(f"backward compatible: {t['name']}", by.get(t["name"]) == t, t["name"])
    bm = next(t for t in bres if t["name"] == "get_mockup_print_area"); bp, np_ = bm["inputSchema"]["properties"], mp["inputSchema"]["properties"]
    check("get_mockup_print_area schema only EXTENDED: old enum is a prefix, old params kept, required unchanged, annotations unchanged",
          np_["product"]["enum"][:len(bp["product"]["enum"])] == bp["product"]["enum"] and set(bp) <= set(np_) and all(np_[k]["type"] == bp[k]["type"] for k in bp)
          and np_["style"] == bp["style"] and np_["dpi"] == bp["dpi"] and mp["inputSchema"].get("required") == bm["inputSchema"].get("required") and mp.get("annotations") == bm.get("annotations")
          and mp["description"].startswith(bm["description"].rstrip(".")), (bp.keys(), np_.keys()))
    check("tool order: baseline order preserved", [t["name"] for t in tools if t["name"] not in NEW] == [t["name"] for t in bres])
    bcore = rpc(args.baseline_base, "tools/list", path="/inspiration/mcp/core")["result"]["tools"]
    check("/mcp/core tools/list byte-identical to baseline", bcore == core, (len(bcore), len(core)))
    check("/mcp/core instructions identical to baseline", init(args.baseline_base, "/inspiration/mcp/core").get("instructions") == cins)
    bins = init(args.baseline_base).get("instructions", "")
    nm = lambda x: set(re.findall(r"\b[a-z]+(?:_[a-z0-9]+)+\b", x))
    check("instructions: every tool named in the baseline is still named", nm(bins) <= nm(ins), nm(bins) - nm(ins))
    MP = "get_mockup_print_area"
    for n, a in [(MP, {"product": "mug"}), (MP, {"product": "mug", "size": "15", "dpi": 200}), (MP, {"product": "tshirt"}), (MP, {"product": "tshirt", "area": "pocket", "dpi": 150}),
                 (MP, {"product": "hoodie"}), (MP, {"product": "tote", "style": "wide"}), (MP, {"product": "poster"}), (MP, {"product": "poster", "size": "a3", "dpi": 600}),
                 (MP, {"product": "billboard"}), (MP, {"product": "billboard", "size": "bulletin", "dpi": 72}), (MP, {"product": "tshirt", "area": "nope"}), (MP, {"product": "nope"}), (MP, {}),
                 ("count_characters", {"text": "Hello — world"}), ("convert_color", {"colors": ["#2563eb"]}), ("get_screw_specs", {"size": "M3"}),
                 ("make_dieline", {"length": 80, "width": 40, "height": 120, "format": "none"}), ("calc_quilt", {"what": "size", "bed": "queen"}),
                 ("make_ribbon_banner", {"text": "Best in Show"}), ("calc_cross_stitch", {"cols": 140, "rows": 100}),
                 ("make_paper_bag_template", {}), ("make_fantasy_map", {"seed": "x"}), ("make_star_map", {"city": "Tokyo", "date": "2026-12-24", "time": "22:00"})]:
        old, new = call(n, a, base=args.baseline_base), call(n, a)
        check(f"unchanged output: {n} {json.dumps(a)[:60]}", text(old) == text(new) and old.get("structuredContent") == new.get("structuredContent") and old.get("isError") == new.get("isError"), (text(old)[:120], text(new)[:120]))
    # the b73 products were errors before b73
    check("baseline rejected canvas (proves the new products are new)", call(MP, {"product": "canvas"}, base=args.baseline_base).get("isError"))

# ---- discovery
Q = {"get_brochure_panels": "brochure panel widths", "get_banner_spec": "banner grommets"}
for n in NEW:
    bt = (call("browse_design_tools", {"query": Q[n]}, path="/inspiration/mcp/core").get("structuredContent") or {}).get("tools", [])
    hit = next((x for x in bt[:3] if x["name"] == n), None)
    check(f"browse '{Q[n]}' → {n} in top 3 with exact schema + page", hit and hit["input_schema"] == by[n]["inputSchema"] and hit.get("page_url") == f"https://madegooddesigns.com/tools/{PAGES[n]}/", [x["name"] for x in bt[:3]])

# ---- real inputs (re-derived)
r = call("get_brochure_panels", {}); s = r.get("structuredContent") or {}
big = (11 + 1 / 16) / 3
check("brochure letter roll: outside (W+1/16)/3 − 1/16, (W+1/16)/3 ×2; cover panel 3; 3375 × 2625 px", s.get("outside", {}).get("panels") == [round(big - 1 / 16, 4), round(big, 4), round(big, 4)] and s.get("cover_panel") == 3 and s.get("sheet_px") == [3375, 2625], s.get("outside"))
r2 = call("run_design_tool", {"name": "get_brochure_panels", "arguments": {}}, path="/inspiration/mcp/core")
check("run_design_tool on /mcp/core = direct call (brochure)", (r2.get("structuredContent") or {}) == s, text(r2)[:200])
s = call("get_brochure_panels", {"paper": "a4"}).get("structuredContent") or {}
check("brochure A4 roll: 97 / 100 / 100 mm", s.get("outside", {}).get("panels") == [97, 100, 100], s.get("outside"))
r = call("get_banner_spec", {"preset": "3x8"}); s = r.get("structuredContent") or {}
nx, ny = round(96 / 24) + 1, round(36 / 24) + 1
check("banner 3 × 8 ft: grommets 2·nx + 2·(ny−2) = 12, px 14400 × 5400 at 150", (s.get("grommets") or {}).get("total") == 2 * nx + 2 * (ny - 2) == 12 and s.get("px", {}).get("150") == [14400, 5400] and len(s["grommets"]["positions_in"]) == 12, s.get("grommets"))
r = call("get_mockup_print_area", {"product": "canvas", "size": "16x20"}); s = r.get("structuredContent") or {}
check("print area canvas 16 × 20 gallery: wrap 16 + 2·1.5 + 2 = 21 × 25 in, page link", (s.get("areas") or [{}])[0].get("wrap_artwork_in") == [21, 25] and s.get("page") == "https://madegooddesigns.com/tools/canvas-mockup/", s)
r2 = call("run_design_tool", {"name": "get_mockup_print_area", "arguments": {"product": "polo", "area": "left"}}, path="/inspiration/mcp/core")
check("run_design_tool validates the extended enum: polo left chest 1200 × 1200 px", not r2.get("isError") and ((r2.get("structuredContent") or {}).get("areas") or [{}])[0].get("px") == [1200, 1200], text(r2)[:200])
for p in ["canvas", "magazine", "flyer", "brochure", "notebook", "polo", "cap", "sticker", "banner", "paperbag"]:
    r = call("get_mockup_print_area", {"product": p}); check(f"print area {p}: answers with areas + page", not r.get("isError") and len((r.get("structuredContent") or {}).get("areas", [])) >= 2 and "-mockup/" in (r.get("structuredContent") or {}).get("page", ""), text(r)[:150])
for n, a in [("get_brochure_panels", {"fold": "gate"}), ("get_brochure_panels", {"paper": "b5"}), ("get_banner_spec", {"preset": "huge"}), ("get_banner_spec", {"width": 300, "height": 1}),
             ("get_mockup_print_area", {"product": "canvas", "dpi": 5})]:  # 9-Nov-2026 (mcp-errors-r1): {} / unknown size or area now answer (mcp_errors_r1_rpc.py)
    check(f"bad input → isError: {n} {json.dumps(a)}", call(n, a).get("isError"), a)
print(f"{ok} passed, {fail} failed"); raise SystemExit(1 if fail else 0)
