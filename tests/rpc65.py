"""JSON-RPC checks for the batch-65 MCP tools (3-Nov-2026, garment logo placement, CD case print templates, EPP templates, Voronoi patterns,
SVG path editing, depth of field) against a running Worker: get_logo_placement, make_cd_case_template, make_paper_piecing_template,
make_voronoi_pattern, edit_svg_path, calc_depth_of_field.
Local:  python3 tests/rpc65.py --base http://127.0.0.1:8875 --baseline-base http://127.0.0.1:8876   (8876 = untouched copy of origin before b65)
Live:   python3 tests/rpc65.py --base https://madegooddesigns.com
Checks: new tools on /mcp and /mcp/all but NOT /mcp/core; callable directly, via /mcp/core (hidden-but-callable) and via run_design_tool;
browse_design_tools finds them with their exact schema + page; each starts "Use when", < 650 chars, ≤ 1.6 KB; every baseline tool unchanged;
sample outputs byte-identical vs baseline; real inputs re-derived from the formulas; bad inputs → isError; instructions < 1500 chars and
name the new tools while still naming the older ones; /mcp/core list + instructions unchanged vs baseline. UA curl/8.4.0 (bot-flagged)."""
import argparse, json, math, re, urllib.request
ap = argparse.ArgumentParser(); ap.add_argument("--base", default="http://127.0.0.1:8875"); ap.add_argument("--baseline-base"); args = ap.parse_args()
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
def init(base, path="/inspiration/mcp"): return rpc(base, "initialize", {"protocolVersion": "2025-06-18", "capabilities": {}, "clientInfo": {"name": "rpc65", "version": "1"}}, path=path)["result"]
def text(r): return "\n".join(c.get("text", "") for c in r.get("content", []) if c.get("type") == "text")
near = lambda a, b, e=0.01: a is not None and abs(a - b) <= e
NEW = ["get_logo_placement", "make_cd_case_template", "make_paper_piecing_template", "make_voronoi_pattern", "edit_svg_path", "calc_depth_of_field"]
PAGES = {"get_logo_placement": "shirt-logo-placement", "make_cd_case_template": "cd-case-template", "make_paper_piecing_template": "english-paper-piecing-templates",
         "make_voronoi_pattern": "voronoi-generator", "edit_svg_path": "svg-path-editor", "calc_depth_of_field": "depth-of-field-calculator"}
OLD = ["search_ui_screens", "get_ui_screen_code", "get_ui_flow", "search_design_inspiration", "search_museum_art", "search_annual_reports", "generate_website_color_palette",
       "generate_design_md", "generate_logo_concepts", "make_extruded_part", "make_box_template", "get_book_cover_size", "make_dieline", "lookup_character", "fix_typography",
       "get_sheet_metal_gauge", "calc_sheet_metal_bend", "make_cone_pattern", "make_living_hinge", "make_nutrition_label", "get_desk_ergonomics",
       "calc_quilt", "calc_fabric_yardage", "optimize_cut_list", "make_jigsaw_puzzle", "convert_drawing_scale"]

ins = init(args.base).get("instructions", "")
check("instructions < 1500 chars", len(ins) < 1500, len(ins))
check("instructions first line still leads with 'BEFORE building or restyling UI'", "BEFORE building or restyling UI" in ins.split("\n")[0], ins[:160])
check("instructions name all 6 new tools", all(n in ins for n in NEW), [n for n in NEW if n not in ins])
check("instructions still name the older tools (incl. b63 + b64)", all(n in ins for n in OLD), [n for n in OLD if n not in ins])
res, size = rpc(args.base, "tools/list", raw=True); tools = res["result"]["tools"]; by = {t["name"]: t for t in tools}
check("no duplicate tool names", len(by) == len(tools))
for n in NEW:
    d = by.get(n)
    check(f"{n}: listed, 'Use when', < 650 chars, ≤ 1.6 KB, readOnly", d and d["description"].startswith("Use when") and len(d["description"]) < 650 and len(json.dumps(d, ensure_ascii=False)) <= 1640 and d.get("annotations", {}).get("readOnlyHint"), n)
added = sum(len(json.dumps(by[n], ensure_ascii=False)) for n in NEW if n in by)
print(f"tools/list: {len(tools)} tools, {size:,} bytes; batch 65 adds {added:,} bytes")
check("batch 65 adds ≤ 9 KB to tools/list", added <= 9000, added)
allt = rpc(args.base, "tools/list", path="/inspiration/mcp/all")["result"]["tools"]
check("/mcp/all = /mcp", allt == tools)
core = rpc(args.base, "tools/list", path="/inspiration/mcp/core")["result"]["tools"]; cnames = [t["name"] for t in core]
check("/mcp/core does NOT list the new tools (discoverable via browse → run)", not set(NEW) & set(cnames), cnames)
check("/mcp/core ends with browse_design_tools, run_design_tool", cnames[-2:] == ["browse_design_tools", "run_design_tool"], cnames[-3:])
cins = init(args.base, "/inspiration/mcp/core").get("instructions", "")
check("/mcp/core instructions < 1500 and don't name unlisted b65 tools", len(cins) < 1500 and not any(n in cins for n in NEW), len(cins))

if args.baseline_base:
    bres = rpc(args.baseline_base, "tools/list")["result"]["tools"]
    check(f"tool count = baseline + 6 ({len(bres)} + 6)", len(tools) == len(bres) + 6, len(tools))
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
                 ("convert_drawing_scale", {"value": "27'-6\"", "scale": "1/4\"=1'-0\""})]:
        old, new = call(n, a, base=args.baseline_base), call(n, a)
        check(f"unchanged output: {n}", text(old) == text(new) and old.get("structuredContent") == new.get("structuredContent"), (text(old)[:120], text(new)[:120]))

# ---- discovery
Q = {"get_logo_placement": "logo placement shirt", "make_cd_case_template": "cd case template", "make_paper_piecing_template": "english paper piecing hexagon",
     "make_voronoi_pattern": "voronoi pattern", "edit_svg_path": "svg path", "calc_depth_of_field": "depth of field"}
for n in NEW:
    bt = (call("browse_design_tools", {"query": Q[n]}, path="/inspiration/mcp/core").get("structuredContent") or {}).get("tools", [])
    hit = next((x for x in bt[:3] if x["name"] == n), None)
    check(f"browse '{Q[n]}' → {n} in top 3 with exact schema + page", hit and hit["input_schema"] == by[n]["inputSchema"] and hit.get("page_url") == f"https://madegooddesigns.com/tools/{PAGES[n]}/", [x["name"] for x in bt[:3]])

# ---- real inputs (re-derived from specs / formulas)
r = call("make_cd_case_template", {"part": "tray"}); s = r.get("structuredContent") or {}
check("tray card 150 × 118 mm, spines 6.5 + back 137 + 6.5, true-size SVG (156 mm with bleed)", s.get("trim_w") == 150 and s.get("trim_h") == 118 and [p.get("w") for p in s.get("panels", [])] == [6.5, 137, 6.5] and 'width="156mm"' in s.get("svg", ""), (s.get("trim_w"), s.get("panels")))
r = call("run_design_tool", {"name": "make_cd_case_template", "arguments": {"part": "tray"}}, path="/inspiration/mcp/core")
check("run_design_tool on /mcp/core = direct call", (r.get("structuredContent") or {}) == s, text(r)[:200])
r = call("make_paper_piecing_template", {"shape": "hexagon", "side": 1, "format": "none"}, path="/inspiration/mcp/core"); s = r.get("structuredContent") or {}
check("hidden on /mcp/core but callable: 1 in hexagon flat-to-flat √3, area 3√3/2", not r.get("isError") and near(s.get("flat_to_flat"), math.sqrt(3), 1e-3) and near(s.get("area"), 1.5 * math.sqrt(3), 1e-3), s)
r = call("get_logo_placement", {"size": "L", "location": "left-chest", "aspect": 2}); s = r.get("structuredContent") or {}
check("left chest L: rec 3-5 in wide, 2:1 fit inside rec, says 'typical'", 3 <= (s.get("rec") or {}).get("w", 0) <= 5 and near((s.get("fit") or {}).get("w", 0) / max(1e-9, (s.get("fit") or {}).get("h", 1)), 2, 0.02) and "ypical" in text(r), s.get("rec"))
r = call("make_voronoi_pattern", {"width": 200, "height": 100, "cells": 40, "seed": 7}); s = r.get("structuredContent") or {}
check("Voronoi 40 cells on 200 × 100: mean area 500, SVG", (s.get("stats") or {}).get("cells") == 40 and near((s.get("stats") or {}).get("meanArea"), 500, 1) and s.get("svg", "").startswith("<svg"), s.get("stats"))
check("same seed → identical SVG", (call("make_voronoi_pattern", {"width": 200, "height": 100, "cells": 40, "seed": 7}).get("structuredContent") or {}).get("svg") == s.get("svg"))
r = call("edit_svg_path", {"d": "M0 50 A50 50 0 1 0 100 50 A50 50 0 1 0 0 50 Z"}); s = r.get("structuredContent") or {}
check("circle r=50: bbox 100 × 100, length 2π·50", near((s.get("bbox") or {}).get("width"), 100, 1e-3) and near(s.get("length"), 2 * math.pi * 50, 1e-3), s)
r = call("edit_svg_path", {"d": "M10 10 h20 v20 h-20 z", "op": "transform", "translate": [5, -5]}); s = r.get("structuredContent") or {}
check("translate (5,-5): bbox x 15, y 5", near((s.get("bbox") or {}).get("x"), 15) and near((s.get("bbox") or {}).get("y"), 5), s.get("bbox"))
f, N, sd, c = 50, 8, 3000, 0.03; H = f * f / (N * c) + f
r = call("calc_depth_of_field", {"focal": 50, "aperture": 8, "distance": 3, "coc": 0.03}); s = r.get("structuredContent") or {}
check("DOF 50 mm f/8 3 m CoC 0.03 = thin-lens near/far/H", near(s.get("near"), sd * (H - f) / (H + sd - 2 * f) / 1000, 0.002) and near(s.get("far"), sd * (H - f) / (H - sd) / 1000, 0.002) and near(s.get("hyperfocal"), H / 1000, 0.002), s)
for n, a in [("get_logo_placement", {"garment": "tank", "location": "hood"}), ("make_voronoi_pattern", {"cells": 99999}), ("edit_svg_path", {"d": "M10 10 Q"}),
             ("calc_depth_of_field", {"focal": 50}), ("edit_svg_path", {})]:
    check(f"bad input → isError: {n}", call(n, a).get("isError"), a)
print(f"{ok} passed, {fail} failed"); raise SystemExit(1 if fail else 0)
