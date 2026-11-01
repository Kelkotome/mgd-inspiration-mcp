"""JSON-RPC checks for the 2-Nov-2026 MCP UX pass (docs/MCP-UX-AUDIT-2026-11-02.md) against a running Worker.
Local:  python3 tests/rpc_mcpux.py --base http://127.0.0.1:8861 --baseline-base http://127.0.0.1:8862   (8862 = untouched origin copy)
Live:   python3 tests/rpc_mcpux.py --base https://madegooddesigns.com
Checks (intended changes only):
  * instructions: lead with WHEN to call, < 1500 chars, still name every tool older batch tests require
  * tools/list (/mcp and /mcp/all): same 64 names in the same order as the baseline; inputSchemas identical except `items: {}` added
    where an array had none; descriptions identical except search_ui_screens (trimmed under 1024); annotations identical
  * schema hygiene: no array without items, every description <= 1024 chars, names match ^[a-zA-Z0-9_-]{1,64}$
  * /mcp/core: the 18 design tools, each byte-identical to its /mcp entry, < 35 KB, own instructions that only name core tools;
    tools/call of a tool NOT in the core list still works there (nothing is removed, only hidden from the list)
  * prompts: the 3 old prompts unchanged + `moodboard`
  * outputs: a sample of tools returns byte-identical text/structuredContent vs the baseline (incl. D1 search tools on a shared seed)
Prints tools/list byte sizes before/after. UA curl/8.4.0 (bot-flagged, out of analytics)."""
import argparse, json, re, urllib.request
ap = argparse.ArgumentParser(); ap.add_argument("--base", default="http://127.0.0.1:8861"); ap.add_argument("--baseline-base"); args = ap.parse_args()
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
def text(r): return "\n".join(c.get("text", "") for c in r.get("content", []) if c.get("type") == "text")
def init(base, path="/inspiration/mcp"): return rpc(base, "initialize", {"protocolVersion": "2025-06-18", "capabilities": {}, "clientInfo": {"name": "rpc-mcpux", "version": "1"}}, path=path)["result"]
def walk(s, fn, path="$"):
    if isinstance(s, dict):
        fn(s, path)
        for k, v in s.items():
            if isinstance(v, (dict, list)): walk(v, fn, path + "." + k)
    elif isinstance(s, list):
        for i, v in enumerate(s): walk(v, fn, f"{path}[{i}]")
CORE = ["search_ui_screens", "get_ui_screen_code", "get_ui_flow", "search_design_inspiration", "browse_inspiration_by_theme", "list_inspiration_themes",
        "search_museum_art", "search_annual_reports", "generate_website_color_palette", "generate_design_md", "design_md_from_references",
        "generate_logo_concepts", "generate_color_combinations", "check_contrast", "generate_shadcn_theme", "search_icons", "make_brand_board", "generate_type_scale"]
OLD_ROUTED = ["search_ui_screens", "get_ui_screen_code", "get_ui_flow", "search_design_inspiration", "search_museum_art", "search_annual_reports",
              "generate_website_color_palette", "generate_design_md", "generate_logo_concepts", "make_extruded_part", "make_box_template", "get_book_cover_size",
              "lookup_character", "fix_typography", "make_affinity_diagram", "get_paper_sizes", "make_grid_paper", "make_storyboard", "generate_llms_txt",
              "make_dieline", "analyze_3d_model", "get_print_clearance", "make_gear", "get_screw_specs", "get_hand_anthropometrics", "browse_inspiration_by_theme",
              "design_md_from_references", "generate_shadcn_theme", "generate_color_scale", "generate_type_scale", "export_design_tokens", "check_contrast",
              "lint_design_md", "convert_color", "search_icons", "get_screen_sizes", "generate_slogans", "make_brand_board", "generate_color_combinations"]

# ---- initialize
res = init(args.base); ins = res.get("instructions", "")
check("instructions < 1500 chars", len(ins) < 1500, len(ins))
check("instructions lead with when to call (BEFORE building UI / colours / fonts / logo)", "BEFORE building or restyling UI" in ins.split("\n")[0], ins[:300])
check("instructions still name every tool older tests route to", all(n in ins for n in OLD_ROUTED), [n for n in OLD_ROUTED if n not in ins])
check("capabilities: tools + prompts", "tools" in res["capabilities"] and "prompts" in res["capabilities"], res["capabilities"])

# ---- tools/list: /mcp, /mcp/all, /mcp/core
sizes = {}
lst, sizes["new /mcp (2025-06-18)"] = rpc(args.base, "tools/list", raw=True); tools = lst["result"]["tools"]; by = {t["name"]: t for t in tools}
sizes["new /mcp (2024-11-05)"] = rpc(args.base, "tools/list", pv="2024-11-05", raw=True)[1]
allr = rpc(args.base, "tools/list", path="/inspiration/mcp/all")["result"]["tools"]
check("/mcp/all lists exactly what /mcp lists (default profile = all)", allr == tools, (len(allr), len(tools)))
bad = []
for t in tools:
    if not re.fullmatch(r"[a-zA-Z0-9_-]{1,64}", t["name"]): bad.append(("name", t["name"]))
    if len(t.get("description", "")) > 1024: bad.append(("desc>1024", t["name"], len(t["description"])))
    walk(t["inputSchema"], lambda s, p, n=t["name"]: bad.append(("array w/o items", n, p)) if s.get("type") == "array" and "items" not in s else None)
check("schema hygiene: names valid, descriptions <= 1024, every array has items", not bad, bad)
check("no duplicate tool names", len(by) == len(tools))
core_l, sizes["new /mcp/core (2025-06-18)"] = rpc(args.base, "tools/list", raw=True, path="/inspiration/mcp/core"); core = core_l["result"]["tools"]
sizes["new /mcp/core (2024-11-05)"] = rpc(args.base, "tools/list", pv="2024-11-05", raw=True, path="/inspiration/mcp/core")[1]
check("/mcp/core lists the 18 design tools in /mcp order", [t["name"] for t in core] == [n for n in by if n in CORE] and len(core) == 18, [t["name"] for t in core])
check("/mcp/core entries are byte-identical to their /mcp entries", all(t == by[t["name"]] for t in core))
check("/mcp/core tools/list < 35 KB", sizes["new /mcp/core (2025-06-18)"] < 35000, sizes["new /mcp/core (2025-06-18)"])
cins = init(args.base, "/inspiration/mcp/core").get("instructions", "")
named = set(re.findall(r"\b[a-z]+(?:_[a-z0-9]+)+\b", cins))
check("/mcp/core instructions < 1500 chars, lead with when to call, name only core tools", len(cins) < 1500 and "BEFORE" in cins.split("\n")[0] and named <= set(CORE) and len(named) >= 15, (len(cins), named - set(CORE)))
r = call("count_characters", {"text": "Hello world"}, path="/inspiration/mcp/core")
check("/mcp/core: a tool hidden from its list is still callable", not r.get("isError") and "11" in text(r), text(r)[:200])
r = call("search_ui_screens", {"query": "pricing"}, path="/inspiration/mcp/core")
check("/mcp/core: search_ui_screens works", not r.get("isError"), text(r)[:200])

# ---- prompts
pl = rpc(args.base, "prompts/list")["result"]["prompts"]
check("prompts/list: 3 old prompts + moodboard", [p["name"] for p in pl] == ["design-system-from-references", "brand-kit", "build-screen-from-reference", "moodboard"], [p["name"] for p in pl])
pg = rpc(args.base, "prompts/get", {"name": "moodboard", "arguments": {"topic": "a natural wine bar in Lisbon", "style": "art nouveau"}})["result"]
t0 = pg["messages"][0]["content"]["text"]
check("prompts/get moodboard: names the tools + topic + style", all(x in t0 for x in ["search_design_inspiration", "search_museum_art", "Lisbon", "art nouveau", "madegooddesigns.com"]), t0)
e = rpc(args.base, "prompts/get", {"name": "moodboard", "arguments": {}})
check("prompts/get moodboard: missing topic → JSON-RPC -32602", "error" in e and e["error"]["code"] == -32602, e)

# ---- vs baseline
if args.baseline_base:
    bl, sizes["baseline /mcp (2025-06-18)"] = rpc(args.baseline_base, "tools/list", raw=True); base = bl["result"]["tools"]
    sizes["baseline /mcp (2024-11-05)"] = rpc(args.baseline_base, "tools/list", pv="2024-11-05", raw=True)[1]
    check("same tool names in the same order as baseline", [t["name"] for t in base] == [t["name"] for t in tools], set(t["name"] for t in base) ^ set(by))
    def add_items(s):
        s = json.loads(json.dumps(s)); walk(s, lambda d, p: d.setdefault("items", {}) if d.get("type") == "array" and "items" not in d else None); return s
    changed_schema = [t["name"] for t in base if add_items(t["inputSchema"]) != by[t["name"]]["inputSchema"]]
    check("inputSchemas identical to baseline apart from `items: {}` on item-less arrays", not changed_schema, changed_schema)
    fixed = [t["name"] for t in base if t["inputSchema"] != by[t["name"]]["inputSchema"]]
    print(f"   schema fix touched: {fixed}")
    changed_desc = [t["name"] for t in base if t["description"] != by[t["name"]]["description"]]
    check("descriptions identical except search_ui_screens", changed_desc == ["search_ui_screens"], changed_desc)
    check("annotations / outputSchema identical", all(t.get("annotations") == by[t["name"]].get("annotations") and t.get("outputSchema") == by[t["name"]].get("outputSchema") for t in base))
    bpl = rpc(args.baseline_base, "prompts/list")["result"]["prompts"]
    check("old prompts byte-identical", pl[:3] == bpl, (pl[:3], bpl))
    for n, a in [("count_characters", {"text": "Hello — world"}), ("style_text_unicode", {"text": "Hi"}), ("convert_color", {"colors": ["#2563eb"]}),
                 ("generate_logo_concepts", {"name": "Luma"}),
                 ("check_contrast", {"colors": ["#111111", "#ffffff"]}), ("make_extruded_part", {"polygons": [[[0, 0], [20, 0], [20, 10], [0, 10]]], "thickness_mm": 3, "format": "none"}),
                 ("make_dieline", {"length": 80, "width": 40, "height": 120}), ("search_design_inspiration", {"query": "serif poster"}),
                 ("search_museum_art", {"query": "Mucha"}), ("search_ui_screens", {"query": "billing settings"}), ("list_inspiration_themes", {}),
                 ("search_annual_reports", {"query": "Paul Rand"}), ("search_design_inspiration", {"query": "zzqxnothing"})]:
        old, new = call(n, a, base=args.baseline_base), call(n, a)
        check(f"unchanged output: {n} {json.dumps(a)[:40]}", text(old) == text(new) and old.get("structuredContent") == new.get("structuredContent") and old.get("isError") == new.get("isError"),
              (text(old)[:160], text(new)[:160]))
    a1, a2 = call("list_inspiration_themes", {}), call("list_inspiration_themes", {})
    check("list_inspiration_themes: memoised second call == first == baseline", text(a1) == text(a2) == text(call("list_inspiration_themes", {}, base=args.baseline_base)))
    # generate_website_color_palette is random by design (design_core.js jitter) → compare shape, not bytes
    old, new = call("generate_website_color_palette", {"brand_color": "#2563eb", "harmony": "monochromatic"}, base=args.baseline_base), call("generate_website_color_palette", {"brand_color": "#2563eb", "harmony": "monochromatic"})
    check("palette: same first line + same structuredContent keys as baseline", text(old).split("\n")[0] == text(new).split("\n")[0] and set(old.get("structuredContent") or {}) == set(new.get("structuredContent") or {}), (text(old)[:100], text(new)[:100]))
    bins = init(args.baseline_base).get("instructions", "")
    print(f"   instructions: {len(bins)} → {len(ins)} chars (core profile {len(cins)})")
for k, v in sizes.items(): print(f"   tools/list bytes {k}: {v:,}")
print(f"{ok} passed, {fail} failed"); raise SystemExit(1 if fail else 0)
