"""JSON-RPC checks for the batch-66 MCP tools (3-Nov-2026: speech bubbles, coats of arms, cassette J-card templates, field of view,
exposure value) against a running Worker: make_speech_bubble, make_coat_of_arms, make_jcard_template, calc_field_of_view, calc_exposure_value.
Local:  python3 tests/rpc66.py --base http://127.0.0.1:8885 --baseline-base http://127.0.0.1:8886   (8886 = untouched copy of origin before b66)
Live:   python3 tests/rpc66.py --base https://madegooddesigns.com
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
def init(base, path="/inspiration/mcp"): return rpc(base, "initialize", {"protocolVersion": "2025-06-18", "capabilities": {}, "clientInfo": {"name": "rpc66", "version": "1"}}, path=path)["result"]
def text(r): return "\n".join(c.get("text", "") for c in r.get("content", []) if c.get("type") == "text")
near = lambda a, b, e=0.01: a is not None and abs(a - b) <= e
NEW = ["make_speech_bubble", "make_coat_of_arms", "make_jcard_template", "calc_field_of_view", "calc_exposure_value"]
PAGES = {"make_speech_bubble": "speech-bubble-maker", "make_coat_of_arms": "coat-of-arms-maker", "make_jcard_template": "cassette-j-card-template",
         "calc_field_of_view": "field-of-view-calculator", "calc_exposure_value": "exposure-value-calculator"}
OLD = ["search_ui_screens", "get_ui_screen_code", "get_ui_flow", "search_design_inspiration", "search_museum_art", "search_annual_reports", "generate_website_color_palette",
       "generate_design_md", "generate_logo_concepts", "make_extruded_part", "make_box_template", "get_book_cover_size", "make_dieline", "lookup_character", "fix_typography",
       "get_sheet_metal_gauge", "calc_sheet_metal_bend", "make_cone_pattern", "make_living_hinge", "make_nutrition_label", "get_desk_ergonomics",
       "calc_quilt", "calc_fabric_yardage", "optimize_cut_list", "make_jigsaw_puzzle", "convert_drawing_scale",
       "get_logo_placement", "make_cd_case_template", "make_paper_piecing_template", "make_voronoi_pattern", "edit_svg_path", "calc_depth_of_field"]

ins = init(args.base).get("instructions", "")
check("instructions < 1500 chars", len(ins) < 1500, len(ins))
check("instructions first line still leads with 'BEFORE building or restyling UI'", "BEFORE building or restyling UI" in ins.split("\n")[0], ins[:160])
check("instructions name all 5 new tools", all(n in ins for n in NEW), [n for n in NEW if n not in ins])
check("instructions still name the older tools (incl. b63-b65)", all(n in ins for n in OLD), [n for n in OLD if n not in ins])
res, size = rpc(args.base, "tools/list", raw=True); tools = res["result"]["tools"]; by = {t["name"]: t for t in tools}
check("no duplicate tool names", len(by) == len(tools))
for n in NEW:
    d = by.get(n)
    check(f"{n}: listed, 'Use when', < 650 chars, ≤ 1.6 KB, readOnly", d and d["description"].startswith("Use when") and len(d["description"]) < 650 and len(json.dumps(d, ensure_ascii=False)) <= 1640 and d.get("annotations", {}).get("readOnlyHint"), n)
added = sum(len(json.dumps(by[n], ensure_ascii=False)) for n in NEW if n in by)
print(f"tools/list: {len(tools)} tools, {size:,} bytes; batch 66 adds {added:,} bytes")
check("batch 66 adds ≤ 9 KB to tools/list", added <= 9000, added)
allt = rpc(args.base, "tools/list", path="/inspiration/mcp/all")["result"]["tools"]
check("/mcp/all = /mcp", allt == tools)
core = rpc(args.base, "tools/list", path="/inspiration/mcp/core")["result"]["tools"]; cnames = [t["name"] for t in core]
check("/mcp/core does NOT list the new tools (discoverable via browse → run)", not set(NEW) & set(cnames), cnames)
check("/mcp/core ends with browse_design_tools, run_design_tool", cnames[-2:] == ["browse_design_tools", "run_design_tool"], cnames[-3:])
cins = init(args.base, "/inspiration/mcp/core").get("instructions", "")
check("/mcp/core instructions < 1500 and don't name unlisted b66 tools", len(cins) < 1500 and not any(n in cins for n in NEW), len(cins))

if args.baseline_base:
    bres = rpc(args.baseline_base, "tools/list")["result"]["tools"]
    check(f"tool count = baseline + 5 ({len(bres)} + 5)", len(tools) == len(bres) + 5, len(tools))
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
                 ("make_cd_case_template", {"part": "tray"}), ("calc_depth_of_field", {"focal": 50, "aperture": 8, "distance": 3})]:
        old, new = call(n, a, base=args.baseline_base), call(n, a)
        check(f"unchanged output: {n}", text(old) == text(new) and old.get("structuredContent") == new.get("structuredContent"), (text(old)[:120], text(new)[:120]))

# ---- discovery
Q = {"make_speech_bubble": "speech bubble", "make_coat_of_arms": "coat of arms", "make_jcard_template": "cassette j-card template",
     "calc_field_of_view": "field of view", "calc_exposure_value": "exposure value"}
for n in NEW:
    bt = (call("browse_design_tools", {"query": Q[n]}, path="/inspiration/mcp/core").get("structuredContent") or {}).get("tools", [])
    hit = next((x for x in bt[:3] if x["name"] == n), None)
    check(f"browse '{Q[n]}' → {n} in top 3 with exact schema + page", hit and hit["input_schema"] == by[n]["inputSchema"] and hit.get("page_url") == f"https://madegooddesigns.com/tools/{PAGES[n]}/", [x["name"] for x in bt[:3]])

# ---- real inputs (re-derived from formulas / published sizes)
deg = lambda x: x * 180 / math.pi
r = call("make_jcard_template", {}); s = r.get("structuredContent") or {}
check("J-card 4 1/8 × 4 in = 104.775 × 101.6 mm trim, 110.775 mm wide with bleed, true-size SVG", near((s.get("size") or {}).get("trimW"), 104.775, 1e-3) and near((s.get("size") or {}).get("trimH"), 101.6, 1e-3) and 'width="110.775mm"' in s.get("svg", ""), s.get("size"))
r2 = call("run_design_tool", {"name": "make_jcard_template", "arguments": {}}, path="/inspiration/mcp/core")
check("run_design_tool on /mcp/core = direct call", (r2.get("structuredContent") or {}) == s, text(r2)[:200])
r = call("calc_field_of_view", {"focal": 50, "distance": 3}, path="/inspiration/mcp/core"); s = r.get("structuredContent") or {}
check("hidden on /mcp/core but callable: 50 mm FF = 2·atan(18/50) h, frames 2.16 m at 3 m", not r.get("isError") and near((s.get("angle") or {}).get("h"), deg(2 * math.atan(18 / 50))) and near((s.get("frame") or {}).get("w"), 2.16), s.get("angle"))
r = call("calc_exposure_value", {"aperture": 16, "shutter": "1/125", "iso": 100}); s = r.get("structuredContent") or {}
check("f/16 1/125 ISO 100 → EV100 log2(256·125)", near(s.get("ev100"), math.log2(256 * 125)), s.get("ev100"))
r = call("calc_exposure_value", {"op": "nd", "shutter": "1/60", "factor": 1000}); s = r.get("structuredContent") or {}
check("ND1000 on 1/60 s → 16.67 s", near(s.get("newShutter"), 1000 / 60, 0.01), s.get("newShutter"))
r = call("make_coat_of_arms", {"division": "per-pale", "tinctures": ["azure", "or"], "ordinary": "chevron", "ordinary_tincture": "gules", "charge": "mullet", "charge_count": 3, "charge_tincture": "argent"}); s = r.get("structuredContent") or {}
check("blazon Per pale Azure and Or, a chevron Gules between three mullets Argent + SVG", s.get("blazon") == "Per pale Azure and Or, a chevron Gules between three mullets Argent" and s.get("svg", "").startswith("<svg"), s.get("blazon"))
r = call("make_coat_of_arms", {"tinctures": ["gules"], "ordinary": "fess", "ordinary_tincture": "azure", "format": "none"}); s = r.get("structuredContent") or {}
check("colour on colour flagged by the rule of tincture", (s.get("tincture_rule") or {}).get("ok") is False, s.get("tincture_rule"))
r = call("make_speech_bubble", {"width": 300, "height": 160, "tail": [60, 240], "text": "Hi!"}); s = r.get("structuredContent") or {}
check("speech bubble 300 × 160 with tail tip (60, 240), SVG", (s.get("body") or {}).get("w") == 300 and (s.get("tails") or [{}])[0].get("tip") == [60, 240] and s.get("svg", "").startswith("<svg"), s.get("tails"))
check("same input → identical bubble SVG", (call("make_speech_bubble", {"width": 300, "height": 160, "tail": [60, 240], "text": "Hi!"}).get("structuredContent") or {}).get("svg") == s.get("svg"))
for n, a in [("make_speech_bubble", {"shape": "heart"}), ("make_coat_of_arms", {"tinctures": ["pink"]}), ("make_jcard_template", {"bleed": 50}),
             ("calc_field_of_view", {}), ("calc_exposure_value", {"aperture": 8})]:
    check(f"bad input → isError: {n}", call(n, a).get("isError"), a)
print(f"{ok} passed, {fail} failed"); raise SystemExit(1 if fail else 0)
