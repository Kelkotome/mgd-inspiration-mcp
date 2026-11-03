"""JSON-RPC checks for the batch-72 MCP tools (3-Nov-2026: star map posters, fantasy maps, paper bag dielines)
against a running Worker: make_star_map, make_fantasy_map, make_paper_bag_template.
Local:  python3 tests/rpc72.py --base http://127.0.0.1:8895 --baseline-base http://127.0.0.1:8896   (8896 = the b69 commit, before b72)
Live:   python3 tests/rpc72.py --base https://madegooddesigns.com
Checks: new tools on /mcp and /mcp/all but NOT /mcp/core; callable directly, via /mcp/core (hidden-but-callable) and via run_design_tool;
browse_design_tools finds them with their exact schema + page; each starts "Use when", < 650 chars, ≤ 1.6 KB; every baseline tool unchanged;
sample outputs byte-identical vs baseline; real inputs re-derived (Meeus GMST, 2W + 2G + flap, grid px); bad inputs → isError; instructions < 1500 chars and
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
def init(base, path="/inspiration/mcp"): return rpc(base, "initialize", {"protocolVersion": "2025-06-18", "capabilities": {}, "clientInfo": {"name": "rpc72", "version": "1"}}, path=path)["result"]
def text(r): return "\n".join(c.get("text", "") for c in r.get("content", []) if c.get("type") == "text")
near = lambda a, b, e=0.01: a is not None and abs(a - b) <= e
NEW = ["make_star_map", "make_fantasy_map", "make_paper_bag_template"]
PAGES = {"make_star_map": "star-map", "make_fantasy_map": "fantasy-map-generator", "make_paper_bag_template": "paper-bag-template"}
OLD = ["search_ui_screens", "get_ui_screen_code", "get_ui_flow", "search_design_inspiration", "search_museum_art", "search_annual_reports", "generate_website_color_palette",
       "generate_design_md", "generate_logo_concepts", "make_extruded_part", "make_box_template", "get_book_cover_size", "make_dieline", "lookup_character", "fix_typography",
       "get_sheet_metal_gauge", "calc_sheet_metal_bend", "make_cone_pattern", "make_living_hinge", "make_nutrition_label", "get_desk_ergonomics",
       "calc_quilt", "calc_fabric_yardage", "optimize_cut_list", "make_jigsaw_puzzle", "convert_drawing_scale",
       "get_logo_placement", "make_cd_case_template", "make_paper_piecing_template", "make_voronoi_pattern", "edit_svg_path", "calc_depth_of_field",
       "make_speech_bubble", "make_coat_of_arms", "make_jcard_template", "calc_field_of_view", "calc_exposure_value",
       "make_certificate_border", "calc_kitchen_work_triangle", "plan_square_foot_garden",
       "make_ribbon_banner", "calc_cross_stitch", "get_mockup_print_area", "save_moodboard", "generate_llms_txt"]

ins = init(args.base).get("instructions", "")
check("instructions < 1500 chars", len(ins) < 1500, len(ins))
check("instructions first line still leads with 'BEFORE building or restyling UI'", "BEFORE building or restyling UI" in ins.split("\n")[0], ins[:160])
check("instructions name all 3 new tools", all(n in ins for n in NEW), [n for n in NEW if n not in ins])
check("instructions still name the older tools (incl. b63-b69)", all(n in ins for n in OLD), [n for n in OLD if n not in ins])
res, size = rpc(args.base, "tools/list", raw=True); tools = res["result"]["tools"]; by = {t["name"]: t for t in tools}
check("no duplicate tool names", len(by) == len(tools))
for n in NEW:
    d = by.get(n)
    check(f"{n}: listed, 'Use when', < 650 chars, ≤ 1.6 KB, readOnly", d and d["description"].startswith("Use when") and len(d["description"]) < 650 and len(json.dumps(d, ensure_ascii=False)) <= 1640 and d.get("annotations", {}).get("readOnlyHint"), n)
added = sum(len(json.dumps(by[n], ensure_ascii=False)) for n in NEW if n in by)
print(f"tools/list: {len(tools)} tools, {size:,} bytes; batch 72 adds {added:,} bytes")
check("batch 72 adds ≤ 6 KB to tools/list", added <= 6000, added)
allt = rpc(args.base, "tools/list", path="/inspiration/mcp/all")["result"]["tools"]
check("/mcp/all = /mcp", allt == tools)
core = rpc(args.base, "tools/list", path="/inspiration/mcp/core")["result"]["tools"]; cnames = [t["name"] for t in core]
check("/mcp/core does NOT list the new tools (discoverable via browse → run)", not set(NEW) & set(cnames), cnames)
check("/mcp/core ends with browse_design_tools, run_design_tool", cnames[-2:] == ["browse_design_tools", "run_design_tool"], cnames[-3:])
cins = init(args.base, "/inspiration/mcp/core").get("instructions", "")
check("/mcp/core instructions < 1500 and don't name unlisted b72 tools", len(cins) < 1500 and not any(n in cins for n in NEW), len(cins))

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
                 ("make_certificate_border", {"style": "ornate"}), ("calc_kitchen_work_triangle", {"legs": [1.8, 2.1, 1.5]}), ("plan_square_foot_garden", {}),
                 ("make_ribbon_banner", {"text": "Best in Show"}), ("calc_cross_stitch", {"cols": 140, "rows": 100}), ("get_mockup_print_area", {"product": "mug"})]:
        old, new = call(n, a, base=args.baseline_base), call(n, a)
        check(f"unchanged output: {n}", text(old) == text(new) and old.get("structuredContent") == new.get("structuredContent"), (text(old)[:120], text(new)[:120]))

# ---- discovery
Q = {"make_star_map": "star map", "make_fantasy_map": "fantasy map", "make_paper_bag_template": "paper bag template"}
for n in NEW:
    bt = (call("browse_design_tools", {"query": Q[n]}, path="/inspiration/mcp/core").get("structuredContent") or {}).get("tools", [])
    hit = next((x for x in bt[:3] if x["name"] == n), None)
    check(f"browse '{Q[n]}' → {n} in top 3 with exact schema + page", hit and hit["input_schema"] == by[n]["inputSchema"] and hit.get("page_url") == f"https://madegooddesigns.com/tools/{PAGES[n]}/", [x["name"] for x in bt[:3]])

# ---- real inputs (re-derived: Meeus GMST + longitude, alt = asin(sin d sin f + cos d cos f cos H), 2W + 2G + flap, cell distance / (across / width))
D2R = math.pi / 180
def gmst(iso):
    import datetime
    dt = datetime.datetime.fromisoformat(iso.replace("Z", "+00:00")); J = dt.timestamp() / 86400 + 2440587.5; T = (J - 2451545) / 36525
    return (280.46061837 + 360.98564736629 * (J - 2451545) + 0.000387933 * T * T - T ** 3 / 38710000) % 360
r = call("make_star_map", {"city": "Tokyo", "date": "2026-12-24", "time": "22:00"}); s = r.get("structuredContent") or {}
check("star map Tokyo 22:00 JST = 13:00 UTC, LST = GMST + 139.6503° E", s.get("utc") == "2026-12-24T13:00:00.000Z" and near(s.get("local_sidereal_time_hours", 0) * 15, (gmst(s.get("utc", "2026-01-01T00:00:00Z")) + 139.6503) % 360, 0.002), (s.get("utc"), s.get("local_sidereal_time_hours")))
sir = next((b for b in s.get("bright_stars", []) if b["name"] == "Sirius"), None)
a_sir = math.asin(math.sin(-16.7161 * D2R) * math.sin(35.6762 * D2R) + math.cos(-16.7161 * D2R) * math.cos(35.6762 * D2R) * math.cos((s.get("local_sidereal_time_hours", 0) * 15 - 101.2871) * D2R)) / D2R
check("Sirius altitude re-derived (±0.06°)", sir and near(sir["alt"], a_sir, 0.06), (sir, a_sir))
check("star map SVG ≤ 120 KB at the MCP default magnitude 4.5, one circle per star", s.get("mag_limit") == 4.5 and s.get("svg", "").startswith("<svg") and len(s["svg"]) <= 120 * 1024 and s["svg"].count("<circle ") == s.get("visible_stars"), len(s.get("svg", "")))
r2 = call("run_design_tool", {"name": "make_star_map", "arguments": {"city": "Tokyo", "date": "2026-12-24", "time": "22:00"}}, path="/inspiration/mcp/core")
check("run_design_tool on /mcp/core = direct call", (r2.get("structuredContent") or {}) == s, text(r2)[:200])
r = call("make_star_map", {"lat": 51.5074, "lon": -0.1278, "tz": "Europe/London", "date": "2026-02-14", "time": "21:30", "mag_limit": 6}); s = r.get("structuredContent") or {}
check("magnitude 6 over the cap → sky facts + page link, no SVG", s.get("svg_too_large") and "svg" not in s and s.get("visible_stars", 0) > 2300 and "/tools/star-map/" in text(r), (s.get("visible_stars"), s.get("svg_too_large")))
r = call("make_fantasy_map", {"seed": "x", "grid": "hex", "across": 300, "grid_cell": 6}, path="/inspiration/mcp/core"); s = r.get("structuredContent") or {}
check("hidden on /mcp/core but callable: fantasy map, hex 6 mi over 300 mi / 1500 px = 30 px", not r.get("isError") and (s.get("grid") or {}).get("kind") == "hex" and near((s.get("grid") or {}).get("cell_px", 0), 30) and len(s.get("svg", "")) <= 120 * 1024, s.get("grid"))
again = call("make_fantasy_map", {"seed": "x", "grid": "hex", "across": 300, "grid_cell": 6}).get("structuredContent") or {}
check("same seed → identical fantasy map", again.get("svg") == s.get("svg") and again.get("towns") == s.get("towns"))
r = call("make_paper_bag_template", {}); s = r.get("structuredContent") or {}
check("paper bag 160 × 80 × 220: net 2·160 + 2·80 + 15 = 495 × (30 + 220 + 60) = 310 mm, 8 hole marks", (s.get("net") or {}) == {"w": 495, "h": 310} and len(s.get("holes", [])) == 8 and 'width="495mm"' in s.get("svg", ""), s.get("net"))
r = call("make_paper_bag_template", {"width": 4, "gusset": 2.5, "height": 6, "unit": "in"}); s = r.get("structuredContent") or {}
check("paper bag in inches: net width = 13 in + 15 mm flap", near((s.get("net") or {}).get("w", 0), 13 + 15 / 25.4, 0.01), s.get("net"))
for n, a in [("make_star_map", {"date": "2026-06-21"}), ("make_fantasy_map", {"shape": "donut"}), ("make_paper_bag_template", {"width": 5})]:
    check(f"bad input → isError: {n}", call(n, a).get("isError"), a)
print(f"{ok} passed, {fail} failed"); raise SystemExit(1 if fail else 0)
