"""JSON-RPC checks for the batch-51 MCP tools (1-Nov-2026, industrial design & 3D printing) against a running Worker.
Local:  python3 tests/rpc51.py --base http://localhost:8831 --baseline-base http://localhost:8832   (8832 = the b50-mcp tree)
Live:   python3 tests/rpc51.py --base https://madegooddesigns.com
Checks: the 7 new tools are listed and start "Use when…"; every baseline tool keeps its name, inputSchema and description;
a sample of existing tools returns byte-identical output vs the baseline server; real-input results (mm sizes, watertight
files that parse back, cited data); bad inputs give isError (never a crash); routing instructions < 1500 chars and mention
the new tools. UA curl/8.4.0 (bot-flagged, out of analytics)."""
import argparse, base64, json, struct, sys, urllib.request
ap = argparse.ArgumentParser(); ap.add_argument("--base", default="http://localhost:8831")
ap.add_argument("--baseline-base", help="a running b50 server: tools/list baseline + byte-identical outputs of existing tools"); args = ap.parse_args()
ok = fail = 0
def check(name, cond, info=""):
    global ok, fail
    ok += bool(cond); fail += not cond
    print(("PASS " if cond else "FAIL ") + name + ("" if cond else " | " + str(info)[:400]))
def rpc(base, method, params=None, pv="2025-06-18"):
    h = {"Content-Type": "application/json", "Accept": "application/json, text/event-stream", "User-Agent": "curl/8.4.0", "MCP-Protocol-Version": pv}
    req = urllib.request.Request(base.rstrip("/") + "/inspiration/mcp", data=json.dumps({"jsonrpc": "2.0", "id": 1, "method": method, "params": params or {}}).encode(), headers=h)
    with urllib.request.urlopen(req, timeout=120) as r: return json.loads(r.read())
def call(name, a, base=None): return rpc(base or args.base, "tools/call", {"name": name, "arguments": a}).get("result", {})
def text(r): return "\n".join(c.get("text", "") for c in r.get("content", []) if c.get("type") == "text")
strip = lambda o: {k: strip(v) for k, v in o.items() if k != "description"} if isinstance(o, dict) else [strip(x) for x in o] if isinstance(o, list) else o
def stl_check(b):
    """Independent binary-STL parser: triangle count matches size, every undirected edge used exactly twice."""
    n = struct.unpack_from("<I", b, 80)[0]
    if len(b) != 84 + 50 * n: return False, "size"
    key = lambda v: tuple(round(c, 5) for c in v); edges = {}; mx = [-1e9] * 3; mn = [1e9] * 3
    for i in range(n):
        f = struct.unpack_from("<12f", b, 84 + 50 * i); vs = [key(f[3:6]), key(f[6:9]), key(f[9:12])]
        for v in vs:
            for k in range(3): mx[k] = max(mx[k], v[k]); mn[k] = min(mn[k], v[k])
        for a, c in ((0, 1), (1, 2), (2, 0)):
            e = tuple(sorted((vs[a], vs[c]))); edges[e] = edges.get(e, 0) + 1
    return all(c == 2 for c in edges.values()), [round(mx[k] - mn[k], 3) for k in range(3)]

NEW = ["make_extruded_part", "analyze_3d_model", "get_print_clearance", "make_box_template", "make_gear", "get_screw_specs", "get_hand_anthropometrics"]
init = rpc(args.base, "initialize", {"protocolVersion": "2025-06-18", "capabilities": {}, "clientInfo": {"name": "rpc51", "version": "1"}})["result"]
ins = init.get("instructions", "")
check("instructions < 1500 chars", len(ins) < 1500, len(ins))
check("instructions route to the b51 tools", all(n in ins for n in NEW), ins[-400:])
check("instructions still route to older tools", all(n in ins for n in ["search_ui_screens", "generate_design_md", "get_book_cover_size", "make_affinity_diagram", "get_paper_sizes"]))
tools = rpc(args.base, "tools/list")["result"]["tools"]; by = {t["name"]: t for t in tools}
for n in NEW:
    check(f"tools/list has {n}", n in by)
    if n in by: check(f"{n} description starts 'Use when'", by[n]["description"].startswith("Use when"), by[n]["description"][:60])
check("no duplicate tool names", len(by) == len(tools))
print(f"tools/list: {len(tools)} tools")
if args.baseline_base:
    base = rpc(args.baseline_base, "tools/list")["result"]["tools"]
    check(f"tool count = baseline + 7 ({len(base)} + 7)", len(tools) == len(base) + 7, len(tools))
    for t in base:
        n = t["name"]
        check(f"backward compatible: {n}", n in by and strip(t["inputSchema"]) == strip(by[n]["inputSchema"]) and t["description"] == by[n]["description"], n)
    for n, a in [("get_book_cover_size", {"trim": "6x9", "pages": 300}), ("get_paper_sizes", {"query": "A4"}), ("convert_color", {"colors": ["#2563eb"]}),
                 ("count_characters", {"text": "Hello world"}), ("generate_upc_barcode", {"digits": "03600029145"}), ("make_affinity_diagram", {"notes": "a\nb", "svg": False})]:
        old, new = call(n, a, base=args.baseline_base), call(n, a)
        check(f"unchanged output: {n}", text(old) == text(new) and old.get("structuredContent") == new.get("structuredContent"), (text(old)[:120], text(new)[:120]))

# --- make_extruded_part
r = call("make_extruded_part", {"polygons": [[[0, 0], [100, 0], [100, 14], [0, 14]]], "thickness_mm": 4, "holes": [{"x": 10, "y": 7, "d": 4}], "loops": [{"x": 60, "y": 24, "d_inner": 20, "wall": 3}], "format": "stl_base64"})
sc = r.get("structuredContent") or {}
w, dims = stl_check(base64.b64decode(sc.get("file", {}).get("base64", ""))) if sc.get("file", {}).get("base64") else (False, None)
check("extruded handle + loop + hole: binary STL is closed (independent parser), 4 mm thick", not r.get("isError") and w and dims and abs(dims[2] - 4) < 1e-3, (dims, text(r)[:200]))
check("extruded: next-step hint", "Next step:" in text(r))
r = call("make_extruded_part", {"svg": '<svg xmlns="http://www.w3.org/2000/svg" width="40mm" height="20mm" viewBox="0 0 40 20"><rect width="40" height="20"/></svg>', "thickness_mm": 3, "format": "none"})
sc = r.get("structuredContent") or {}
check("extruded from SVG markup (mm): 40 × 20 × 3", not r.get("isError") and sc.get("dims_mm", {}).get("w") == 40 and sc.get("dims_mm", {}).get("h") == 20, sc.get("dims_mm"))
check("extruded: nothing → isError", call("make_extruded_part", {}).get("isError"))
# --- analyze_3d_model (cube from make_extruded_part)
cube = call("make_extruded_part", {"polygons": [[[0, 0], [20, 0], [20, 20], [0, 20]]], "thickness_mm": 20, "format": "stl_ascii"})["structuredContent"]["file"]["stl"]
r = call("analyze_3d_model", {"model_text": cube, "material": "pla", "price_per_kg": 25})
check("analyze cube: 20 × 20 × 20 mm, 8 cm³, watertight, PLA estimate", all(s in text(r) for s in ["20 × 20 × 20 mm", "volume 8 cm³", "watertight and manifold", "PLA"]), text(r)[:400])
check("analyze: garbage → isError", call("analyze_3d_model", {"model_text": "hello"}).get("isError"))
# --- get_print_clearance
r = call("get_print_clearance", {"process": "fdm", "fit": "sliding", "nominal_mm": 5}); sc = r.get("structuredContent") or {}
check("clearance fdm sliding 5 mm: hole > pin = 5, cited", sc.get("pin_mm") == 5 and sc.get("hole_mm", 0) > 5 and "Sources:" in text(r), text(r)[:300])
# --- get_screw_specs
r = call("get_screw_specs", {"size": "M3"})
check("screw M3: pitch 0.5, tap drill 2.5, sources", not r.get("isError") and "0.5" in text(r) and "2.5" in text(r) and "Sources:" in text(r), text(r)[:300])
check("screw: nonsense → isError", call("get_screw_specs", {"size": "M7.3"}).get("isError"))
# --- get_hand_anthropometrics
r = call("get_hand_anthropometrics", {"measure": "handlength", "value": 190, "sex": "male"})
check("hand 190 mm male: percentile first, ANSUR II cited", not r.get("isError") and text(r).startswith("**") and "ANSUR" in text(r), text(r)[:300])
check("hand: unknown measure → isError", call("get_hand_anthropometrics", {"measure": "noselength"}).get("isError"))
# --- make_box_template
r = call("make_box_template", {"width": 100, "depth": 60, "height": 40, "thickness": 3}); sc = r.get("structuredContent") or {}
check("laser box: 6 panels, bottom 100.2 × 60.2 (kerf), SVG", len(sc.get("panels", [])) == 6 and any(p["name"] == "Bottom" and abs(p["w"] - 100.2) < 1e-6 and abs(p["h"] - 60.2) < 1e-6 for p in sc.get("panels", [])) and "<svg" in sc.get("svg", ""), sc.get("panels"))
r = call("make_box_template", {"kind": "enclosure", "length": 60, "width": 40, "height": 20, "format": "stl_base64"}); sc = r.get("structuredContent") or {}
w, dims = stl_check(base64.b64decode(sc["base64"])) if sc.get("base64") else (False, None)
check("enclosure STL (box + lid): closed, outer 64 × 44 mm", w and sc.get("dims", {}).get("outer") == [64, 44, 22], (dims, sc.get("dims")))
check("box: too small → isError", call("make_box_template", {"width": 10, "depth": 10, "height": 10, "thickness": 5}).get("isError"))
# --- make_gear
r = call("make_gear", {"module": 2, "teeth": 20, "teeth2": 40}); sc = r.get("structuredContent") or {}
check("gear pair m2 20:40: centre 60, ratio 2", sc.get("dims", {}).get("centreDistance") == 60 and sc.get("dims", {}).get("ratio") == 2, sc.get("dims"))
r = call("make_gear", {"module": 2, "teeth": 20, "bore": 6, "thickness": 8, "format": "stl_base64"}); sc = r.get("structuredContent") or {}
w, dims = stl_check(base64.b64decode(sc["base64"])) if sc.get("base64") else (False, None)
check("gear STL: closed, 44 mm tip, 8 mm thick", w and dims and abs(dims[0] - 44) < 0.05 and abs(dims[2] - 8) < 1e-3, dims)
# --- STEP (faceted AP214) output
import re as _re
def step_ok(s, solids):
    ids = set(_re.findall(r"^#(\d+)=", s, _re.M))
    return s.startswith("ISO-10303-21;") and "AUTOMOTIVE_DESIGN" in s and ".MILLI.,.METRE." in s and all(i in ids for i in _re.findall(r"#(\d+)", s)) and s.count("MANIFOLD_SOLID_BREP(") == solids
r = call("make_extruded_part", {"polygons": [[[0, 0], [60, 0], [60, 15], [0, 15]]], "thickness_mm": 3, "format": "step"}); f = (r.get("structuredContent") or {}).get("file", {})
check("extruded bar → STEP: 1 solid, 6 faces, refs intact", step_ok(f.get("step", ""), 1) and f.get("step_stats", {}).get("faces") == 6, f.get("step_stats"))
r = call("make_box_template", {"kind": "enclosure", "length": 60, "width": 40, "height": 20, "format": "step"}); sc = r.get("structuredContent") or {}
check("enclosure → STEP: Box + Lid solids", step_ok(sc.get("step", ""), 2), sc.get("too_big") or sc.get("step_stats"))
check("gear: bore through root → isError", call("make_gear", {"module": 1, "teeth": 12, "bore": 20}).get("isError"))
check("unknown arg types don't crash", "result" in rpc(args.base, "tools/call", {"name": "make_gear", "arguments": {"teeth": "lots", "module": None}}))
print(f"{ok} passed, {fail} failed"); sys.exit(1 if fail else 0)
