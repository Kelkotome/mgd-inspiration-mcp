"""JSON-RPC checks for the batch-48 MCP tools (31-Oct-2026) against a running Worker.
Local:  python3 tests/rpc48.py --base http://localhost:8799 --baseline <tools/list JSON captured from the deployed worker>
Live:   python3 tests/rpc48.py --base https://madegooddesigns.com
Checks: every new tool is listed and starts "Use when…"; every pre-existing tool keeps its name + inputSchema (backward
compatible); each new tool returns the expected content for real inputs; DESIGN.md output passes the official linter
($DESIGNMD_CLI or npx @google/design.md@0.4.0) and our lint_design_md agrees; DTCG JSON parses with $type/$value;
structuredContent only for 2025-06-18 clients; bad inputs give isError with a helpful message (never a crash).
UA is curl/8.4.0 (bot-flagged by the Worker, so test traffic stays out of MCP analytics)."""
import argparse, json, os, re, subprocess, sys, tempfile, urllib.request
ap = argparse.ArgumentParser(); ap.add_argument("--base", default="http://localhost:8799"); ap.add_argument("--baseline"); args = ap.parse_args()
URL = args.base.rstrip("/") + "/inspiration/mcp"
CLI = [os.environ["DESIGNMD_CLI"]] if os.environ.get("DESIGNMD_CLI") else ["npx", "-y", "@google/design.md@0.4.0"]
TMP = tempfile.mkdtemp(prefix="rpc48-")
ok = fail = 0
def check(name, cond, info=""):
    global ok, fail
    ok += bool(cond); fail += not cond
    print(("PASS " if cond else "FAIL ") + name + ("" if cond else " | " + str(info)[:400]))
def rpc(method, params=None, pv=None):
    h = {"Content-Type": "application/json", "Accept": "application/json, text/event-stream", "User-Agent": "curl/8.4.0"}
    if pv: h["MCP-Protocol-Version"] = pv
    req = urllib.request.Request(URL, data=json.dumps({"jsonrpc": "2.0", "id": 1, "method": method, "params": params or {}}).encode(), headers=h)
    with urllib.request.urlopen(req, timeout=120) as r: return json.loads(r.read())
def call(name, a, pv="2025-06-18"): return rpc("tools/call", {"name": name, "arguments": a}, pv).get("result", {})
def text(r): return "\n".join(c.get("text", "") for c in r.get("content", []) if c.get("type") == "text")
def block(t, lang):
    m = re.search(r"```" + lang + r"\n(.*?)\n```", t, re.S); return m.group(1) if m else None

NEW = ["generate_type_scale", "generate_color_scale", "check_contrast", "lint_design_md", "convert_color", "design_md_from_references",
       "generate_shadcn_theme", "export_design_tokens", "search_icons", "get_screen_sizes", "make_brand_board", "generate_slogans"]
tools = rpc("tools/list")["result"]["tools"]; by = {t["name"]: t for t in tools}
for n in NEW:
    check(f"tools/list has {n}", n in by)
    if n in by: check(f"{n} description starts 'Use when'", by[n]["description"].startswith("Use when"), by[n]["description"][:60])
check("no duplicate tool names", len(by) == len(tools))
if args.baseline:
    base = json.load(open(args.baseline)); base = base["result"]["tools"] if "result" in base else base
    for t in base:
        n = t["name"]
        check(f"backward compatible: {n} still listed", n in by)
        # structure must not change (names, types, enums, required); description wording may (ec42f27 reworded two)
        strip = lambda o: {k: strip(v) for k, v in o.items() if k != "description"} if isinstance(o, dict) else [strip(x) for x in o] if isinstance(o, list) else o
        if n in by: check(f"backward compatible: {n} inputSchema structure unchanged", strip(by[n]["inputSchema"]) == strip(t["inputSchema"]))
print(f"tools/list: {len(tools)} tools")

# --- type scale
r = call("generate_type_scale", {"base_px": 16, "ratio": "major-third", "fluid": True, "min_vw": 375, "max_vw": 1280})
t = text(r)
check("type scale: fluid clamp()", not r.get("isError") and "clamp(" in t and "@theme" in t, t[:200])
dt = block(t, "json")
check("type scale: DTCG parses with $type/$value", dt and '"$type"' in dt and '"$value"' in dt and json.loads(dt) is not None)
check("type scale: structuredContent steps", len((r.get("structuredContent") or {}).get("steps", [])) == 9)
check("type scale: bad ratio is a clean error", call("generate_type_scale", {"ratio": "huge"}).get("isError"))
# --- colour scale
r = call("generate_color_scale", {"colors": {"brand": "#2563eb"}, "formats": ["tailwind_v4", "dtcg"]}); t = text(r)
check("color scale: --color-brand-500 oklch", "--color-brand-500: oklch(" in t, t[:300])
check("color scale: exact input kept", "#2563eb" in t)
steps = (r.get("structuredContent") or {}).get("palettes", [{}])[0].get("steps", [])
check("color scale: 11 steps", len(steps) == 11, len(steps))
check("color scale: bad colour is a clean error", call("generate_color_scale", {"colors": "notacolour"}).get("isError"))
# --- contrast
r = call("check_contrast", {"foreground": "#767676", "background": "#ffffff"}); t = text(r)
check("contrast: #767676 on white = 4.54:1 AA pass", "4.54:1" in t and r["structuredContent"]["aa_normal"] is True, t[:200])
r = call("check_contrast", {"foreground": "#999999", "background": "#ffffff"}); t = text(r)
fx = (r.get("structuredContent") or {}).get("fix") or {}
check("contrast: failing pair gets a passing same-hue fix", fx.get("ok") and fx.get("ratio", 0) >= 4.5, fx)
r = call("check_contrast", {"colors": ["#000000", "#ffffff", "#2563eb", "#e11d48"]})
check("contrast: matrix of 4 = 6 pairs", (r.get("structuredContent") or {}).get("summary", {}).get("total") == 6, r.get("structuredContent"))
check("contrast: nothing to check is a clean error", call("check_contrast", {}).get("isError"))
# --- convert colour
r = call("convert_color", {"colors": ["#2563eb", "oklch(70% 0.25 150)", "nope"]}); t = text(r)
cs = (r.get("structuredContent") or {}).get("colors", [])
check("convert: hex → oklch", "oklch(" in t and cs and cs[0].get("hex") == "#2563eb", t[:200])
check("convert: out-of-sRGB oklch flagged + mapped", len(cs) > 1 and cs[1].get("in_srgb") is False and cs[1].get("in_p3") is True)
check("convert: invalid colour reported inline", len(cs) > 2 and "error" in cs[2])
# --- shadcn
r = call("generate_shadcn_theme", {"brand_color": "#e11d48", "output": "all"}); t = text(r)
need = ["--background", "--foreground", "--card", "--popover-foreground", "--primary", "--primary-foreground", "--secondary", "--muted-foreground", "--accent",
        "--destructive", "--border", "--input", "--ring", "--chart-1", "--chart-5", "--sidebar", "--sidebar-primary-foreground", "--sidebar-ring", "--radius"]
missing = [v for v in need if v + ":" not in t]
check("shadcn: full variable set", not missing, missing)
check("shadcn: .dark + @theme inline + v3 HSL + registry", ".dark" in t and "@theme inline" in t and "hsl(" in t.lower() or "registry:theme" in t, t[:100])
check("shadcn: 0 failing contrast pairs", (r.get("structuredContent") or {}).get("contrast_failures") == 0, (r.get("structuredContent") or {}).get("contrast_failures"))
check("shadcn: bad brand colour is a clean error", call("generate_shadcn_theme", {"brand_color": "zzz"}).get("isError"))
pal = call("generate_website_color_palette", {"brand_color": "#0f766e"}).get("structuredContent") or {}
r = call("generate_shadcn_theme", {"colors": {"light": pal.get("light"), "dark": pal.get("dark")}})
check("shadcn: chains from generate_website_color_palette roles", not r.get("isError") and "--primary:" in text(r), text(r)[:200])
# --- design tokens
r = call("export_design_tokens", {"colors": {"brand": "#2563eb", "accent": "#e11d48"}, "formats": ["dtcg", "tailwind", "css"]}); t = text(r)
dt = block(t, "json")
try: tree = json.loads(dt); good = "color" in tree
except Exception as e: good = False
check("tokens: DTCG JSON parses with color group", good, (dt or "")[:200])
check("tokens: DTCG colour value object (colorSpace/components)", dt and '"colorSpace"' in dt and '"components"' in dt)
check("tokens: Tailwind v4 @theme", "@theme" in t)
md = text(call("generate_design_md", {"project_name": "Tokens test", "brand_color": "#7c3aed"})).split("\n\nSave this")[0]
r = call("export_design_tokens", {"source": md, "formats": ["dtcg"]})
check("tokens: imports a DESIGN.md (chain from generate_design_md)", not r.get("isError") and (r.get("structuredContent") or {}).get("count", 0) > 8, text(r)[:200])
check("tokens: nothing to export is a clean error", call("export_design_tokens", {}).get("isError"))
# --- DESIGN.md from references (+ official lint)
r = call("design_md_from_references", {"query": "serif", "project_name": "Folio", "description": "A reading app"}); t = text(r)
dm = (r.get("structuredContent") or {}).get("design_md") or ""
check("refs→DESIGN.md: cites references + returns DESIGN.md", "Design system from" in t and dm.startswith("---"), t[:300])
check("refs→DESIGN.md: structured refs + palette", len((r.get("structuredContent") or {}).get("references", [])) >= 3)
if dm:
    f = os.path.join(TMP, "refs.md"); open(f, "w").write(dm)
    p = subprocess.run(CLI + ["lint", f], capture_output=True, text=True)
    try: rep = json.loads(p.stdout); errs = rep.get("summary", {}).get("errors", 99)
    except Exception: rep, errs = p.stdout[:300], 99
    check("refs→DESIGN.md: official linter 0 errors", errs == 0, rep)
    lr = call("lint_design_md", {"design_md": dm})
    check("lint_design_md agrees with the official CLI (0 errors)", (lr.get("structuredContent") or {}).get("summary", {}).get("errors") == 0, text(lr)[:300])
imgs = re.findall(r"https://madegooddesigns.com/inspiration/img/\S+", t)[:3]
r = call("design_md_from_references", {"references": [u + "?utm_source=x" for u in imgs]})
check("refs→DESIGN.md: accepts image URLs with query strings", not r.get("isError") and f"from {len(imgs)} reference" in text(r), text(r)[:200])
check("refs→DESIGN.md: no input is a clean error", call("design_md_from_references", {}).get("isError"))
bad = call("lint_design_md", {"design_md": "---\nversion: alpha\nname: x\ncolors:\n  primary: \"#777777\"\ncomponents:\n  button:\n    backgroundColor: \"{colors.nope}\"\n---\n# x\n"})
check("lint_design_md: flags a broken reference", (bad.get("structuredContent") or {}).get("summary", {}).get("errors", 0) >= 1, text(bad)[:300])
# --- icons
r = call("search_icons", {"query": "delete", "framework": "react"}); t = text(r)
ic = (r.get("structuredContent") or {}).get("icons", [])
check("icons: 'delete' finds trash icons with import lines", ic and any("trash" in i["name"] for i in ic) and all(i.get("import") or i.get("note") for i in ic), t[:300])
check("icons: lucide import line", 'from "lucide-react"' in t)
svg = block(t, "svg")
check("icons: inline SVG", svg and svg.startswith("<svg") and "viewBox" in svg)
r = call("search_icons", {"query": "settings", "sets": ["heroicons"], "framework": "vue"})
check("icons: heroicons vue import", "@heroicons/vue" in text(r), text(r)[:200])
check("icons: empty query is a clean error", call("search_icons", {"query": ""}).get("isError"))
# --- screens
r = call("get_screen_sizes", {"query": "iphone 17", "export": "tailwind"}); t = text(r)
dv = (r.get("structuredContent") or {}).get("devices", [])
check("screens: iPhone 17 rows with 402 × 874 viewport + sources", any(d.get("viewport") == [402, 874] and d.get("source") for d in dv), dv[:2])
check("screens: Tailwind --breakpoint export", "--breakpoint-" in t)
check("screens: type filter", all(d["type"] == "tablet" for d in (call("get_screen_sizes", {"type": "tablet"}).get("structuredContent") or {}).get("devices", [])))
# --- brand board + slogans (batch 48d)
if "make_brand_board" in by:
    r = call("make_brand_board", {"brand_name": "Northwind Tea", "colors": ["#14532d", "#f59e0b", "#fef3c7"], "heading_font": "Fraunces", "body_font": "Inter", "tagline": "Steeped in the north"}); t = text(r)
    svg = block(t, "svg") or (r.get("structuredContent") or {}).get("svg", "")
    check("brand board: SVG with the brand name", svg.startswith("<svg") and "Northwind Tea" in svg, t[:200])
    import xml.dom.minidom
    try: xml.dom.minidom.parseString(svg); xok = True
    except Exception as e: xok = str(e)
    check("brand board: SVG is valid XML", xok is True, xok)
    check("brand board: no colours is a clean error or default", not call("make_brand_board", {}).get("content") is None)
if "generate_slogans" in by:
    r = call("generate_slogans", {"brand": "Northwind Tea", "keywords": ["tea", "calm"], "industry": "food", "count": 30, "seed": 7}); t = text(r)
    sl = (r.get("structuredContent") or {}).get("slogans", [])
    check("slogans: 30 unique", len(sl) == 30 and len({s["text"] for s in sl}) == 30, len(sl))
    r2 = call("generate_slogans", {"brand": "Northwind Tea", "keywords": ["tea", "calm"], "industry": "food", "count": 30, "seed": 7})
    check("slogans: seeded = deterministic", [s["text"] for s in sl] == [s["text"] for s in (r2.get("structuredContent") or {}).get("slogans", [])])
    check("slogans: no famous slogans", not any(s["text"].lower().strip(".!") in ("just do it", "think different", "i'm lovin' it") for s in sl))
# --- protocol shape: older clients see no structuredContent
r = call("check_contrast", {"foreground": "#000", "background": "#fff"}, pv=None)
check("pre-2025-06-18 clients get no structuredContent", "structuredContent" not in r)
r = call("generate_color_scale", {"colors": "#2563eb"})
check("next-step hint appended", "Next step:" in text(r))
print(f"{ok} passed, {fail} failed"); sys.exit(1 if fail else 0)
