"""JSON-RPC checks for the 31-Oct-2026 MCP work: spec-conformant DESIGN.md, routing instructions, "Use when…" descriptions,
next-step hints, structuredContent/outputSchema (2025-06-18 clients only), prompts, museum fan-out (Q6), empty-result edge caching.
Local:  python3 tests/rpc_designmd.py --base http://localhost:8796 --baseline live_tools.json
Live:   python3 tests/rpc_designmd.py --base https://madegooddesigns.com --live
--baseline: a tools/list JSON captured from the previous deploy; names + inputSchemas must be unchanged (clients cache tools/list).
The DESIGN.md outputs are linted with the official CLI ($DESIGNMD_CLI or npx @google/design.md@0.4.0).
UA is curl/8.4.0, which the Worker flags as a bot, so this traffic stays out of the MCP analytics."""
import argparse, json, os, re, subprocess, sys, tempfile, urllib.request
from concurrent.futures import ThreadPoolExecutor
ap = argparse.ArgumentParser(); ap.add_argument("--base", default="http://localhost:8796"); ap.add_argument("--baseline"); ap.add_argument("--live", action="store_true")
args = ap.parse_args()
URL = args.base.rstrip("/") + "/inspiration/mcp"
CLI = [os.environ["DESIGNMD_CLI"]] if os.environ.get("DESIGNMD_CLI") else ["npx", "-y", "@google/design.md@0.4.0"]
TMP = tempfile.mkdtemp(prefix="rpc-designmd-")
ok = fail = 0
def check(name, cond, info=""):
    global ok, fail
    ok += bool(cond); fail += not cond
    print(("PASS " if cond else "FAIL ") + name + ("" if cond else " | " + str(info)[:400]))

def rpc(method, params=None, pv=None, raw=False):
    h = {"Content-Type": "application/json", "Accept": "application/json, text/event-stream", "User-Agent": "curl/8.4.0"}
    if pv: h["MCP-Protocol-Version"] = pv
    req = urllib.request.Request(URL, data=json.dumps({"jsonrpc": "2.0", "id": 1, "method": method, "params": params or {}}).encode(), headers=h)
    with urllib.request.urlopen(req, timeout=90) as r:
        body = json.loads(r.read())
        return (body, dict(r.headers)) if raw else body
def call(name, a, pv=None):
    return rpc("tools/call", {"name": name, "arguments": a}, pv).get("result", {})
def text(r): return "\n".join(c.get("text", "") for c in r.get("content", []) if c.get("type") == "text")
def lint(md, tag):
    f = os.path.join(TMP, tag + ".md"); open(f, "w").write(md)
    p = subprocess.run(CLI + ["lint", f], capture_output=True, text=True)
    try: return json.loads(p.stdout), p.returncode
    except Exception: return None, p.returncode

# ---- initialize: routing instructions + prompts capability
init, hdr = rpc("initialize", {"protocolVersion": "2025-06-18", "capabilities": {}, "clientInfo": {"name": "rpc-designmd-test", "version": "1"}}, raw=True)
res = init["result"]; ins = res.get("instructions", "")
check("initialize: echoes protocol", res.get("protocolVersion") == "2025-06-18", res.get("protocolVersion"))
check("initialize: instructions route to the key tools", all(t in ins for t in ["search_ui_screens", "get_ui_screen_code", "get_ui_flow", "search_design_inspiration", "search_museum_art",
      "search_annual_reports", "generate_website_color_palette", "generate_design_md", "generate_logo_concepts"]), ins)
check("initialize: instructions short (< 1500 chars)", len(ins) < 1500, len(ins))
check("initialize: tools + prompts capabilities", "tools" in res["capabilities"] and "prompts" in res["capabilities"], res["capabilities"])
check("initialize: session id header", any(k.lower() == "mcp-session-id" for k in hdr), hdr)
old = rpc("initialize", {"protocolVersion": "2024-11-05", "capabilities": {}, "clientInfo": {"name": "old", "version": "1"}})["result"]
check("initialize: old protocol still echoed", old.get("protocolVersion") == "2024-11-05", old.get("protocolVersion"))

# ---- tools/list: backward compatible; descriptions; outputSchema only for 2025-06-18 clients
tools = rpc("tools/list")["result"]["tools"]; names = [t["name"] for t in tools]
check("tools/list: 36 tools", len(tools) == 36, len(tools))
if args.baseline:
    base = {t["name"]: t for t in json.load(open(args.baseline))["result"]["tools"]}
    check("tools/list: same tool names as baseline", set(base) == set(names), set(base) ^ set(names))
    diff = [t["name"] for t in tools if t["name"] in base and json.dumps(t["inputSchema"], sort_keys=True) != json.dumps(base[t["name"]]["inputSchema"], sort_keys=True)]
    # Only the museum theme *description* text changed (bauhaus example removed); types/enums/required must be identical.
    def strip(s): return json.loads(json.dumps(s), object_hook=lambda d: {k: v for k, v in d.items() if k != "description"})
    hard = [t["name"] for t in tools if t["name"] in base and json.dumps(strip(t["inputSchema"]), sort_keys=True) != json.dumps(strip(base[t["name"]]["inputSchema"]), sort_keys=True)]
    check("tools/list: inputSchemas unchanged apart from description text", not hard, hard)
    check("tools/list: only search_museum_art + search_annual_reports schema text changed", set(diff) <= {"search_museum_art", "search_annual_reports"}, diff)
bad = [t["name"] for t in tools if not t["description"].startswith("Use when") and not t["description"].startswith("Use after")]
check("tools/list: every description starts with 'Use when…/Use after…'", not bad, bad)
check("tools/list: no 'bauhaus' example anywhere", "bauhaus" not in json.dumps(tools).lower())
check("tools/list: no outputSchema for old clients", not any("outputSchema" in t for t in tools))
tools2 = rpc("tools/list", pv="2025-06-18")["result"]["tools"]
withos = sorted(t["name"] for t in tools2 if "outputSchema" in t)
check("tools/list (2025-06-18): outputSchema on the two generators", withos == ["generate_design_md", "generate_website_color_palette"], withos)

# ---- generate_design_md: Cursor-style args (unchanged schema) → plain Markdown text, spec front matter, lints clean
cases = {"cursor-style": {"project_name": "Luma Laser Room", "description": "laser hair removal studio booking site", "brand_color": "#7c3aed", "personality": ["Premium", "Calm"]},
         "minimal-args": {},
         "explicit-light-only": {"project_name": "Ledger", "colors": {"light": {"primary": "#0f766e", "background": "#ffffff"}}, "include_dark": False, "radius": "full", "components": ["buttons", "cards"], "dos": ["Keep tables dense"], "donts": []},
         "fonts-and-scale": {"project_name": "Atlas", "heading_font": "Playfair Display", "body_font": "Source Sans 3", "base_size": 18, "scale_ratio": 1.333, "spacing_unit": 8, "density": "compact", "shadows": "none", "motion": "expressive", "style": "warm"}}
for tag, a in cases.items():
    r = call("generate_design_md", a)
    md = r.get("content", [{}])[0].get("text", "")
    check(f"generate_design_md[{tag}]: no error, text content", not r.get("isError") and r["content"][0]["type"] == "text", text(r)[:200])
    check(f"generate_design_md[{tag}]: spec front matter + canonical sections", md.startswith("---\nversion: alpha\n") and "\n## Overview\n" in md and "\n## Colors\n" in md and not re.search(r"^## \d", md, re.M), md[:120])
    check(f"generate_design_md[{tag}]: no structuredContent for old clients", "structuredContent" not in r)
    rep, code = lint(md, "dm-" + tag)
    check(f"generate_design_md[{tag}]: official lint 0 errors / 0 warnings", rep and code == 0 and rep["summary"]["errors"] == 0 and rep["summary"]["warnings"] == 0, rep and rep["findings"][:3])
    if rep: print(f"   lint {tag}: {rep['summary']} — {[f['message'] for f in rep['findings'] if f['rule'] == 'token-summary']}")
    check(f"generate_design_md[{tag}]: note mentions lint/export + next step", len(r["content"]) == 2 and "npx @google/design.md lint" in r["content"][1]["text"] and "Next step:" in r["content"][1]["text"], r["content"][-1]["text"][:200])
r = call("generate_design_md", cases["cursor-style"], pv="2025-06-18"); sc = r.get("structuredContent") or {}
check("generate_design_md (2025-06-18): structuredContent tokens + same markdown", sc.get("design_md") == r["content"][0]["text"] and sc.get("tokens", {}).get("colors", {}).get("primary") and sc["tokens"]["version"] == "alpha" and "edit_url" in sc, list(sc))
check("generate_design_md: brand colour kept as primary", (sc.get("tokens", {}).get("colors", {}).get("primary") or "").lower() == "#7c3aed", sc.get("tokens", {}).get("colors", {}).get("primary"))
r = call("generate_design_md", {"brand_color": "nothex"}, pv="2025-06-18")
check("generate_design_md: bad hex → isError, no structuredContent", r.get("isError") and "structuredContent" not in r, r)

# ---- palette → design_md chain via the next-step hint
r = call("generate_website_color_palette", {"brand_color": "#e11d48", "style": "vibrant"}, pv="2025-06-18"); t = text(r); sc = r.get("structuredContent") or {}
m = re.search(r"generate_design_md with colors=(\{.*?\}\}) ", t)
check("palette: next-step hint carries colors JSON", bool(m), t[-400:])
check("palette (2025-06-18): structuredContent light/dark/contrast", sc.get("light", {}).get("primary") and len(sc.get("contrast", [])) == 14 and sc.get("palette_url", "").startswith("https://madegooddesigns.com/tools/"), list(sc))
if m:
    cols = json.loads(m.group(1)); r2 = call("generate_design_md", {"project_name": "Chain", "colors": cols}); md = r2["content"][0]["text"]
    check("palette → design_md: exact colours carried", f'\n  primary: "{cols["light"]["primary"].lower()}"' in md and f'\n  dark-primary: "{cols["dark"]["primary"].lower()}"' in md, md[:400])
    rep, code = lint(md, "chain"); check("palette → design_md: lints clean", rep and rep["summary"]["errors"] == 0 and rep["summary"]["warnings"] == 0, rep and rep["findings"][:3])
r = call("generate_website_color_palette", {"brand_color": "#e11d48"})
check("palette (old client): no structuredContent", "structuredContent" not in r and "Next step:" in text(r))

# ---- Q6: concurrent museum fan-out (the exact 30-Oct queries), 3 rounds
Q = ["Mucha poster woman", "Klimt gold", "art deco poster", "woodblock portrait actor", "Bauhaus"]
counts = []
for rnd in range(3):
    with ThreadPoolExecutor(5) as ex: rs = list(ex.map(lambda q: call("search_museum_art", {"query": q, "limit": 3}), Q))
    counts.append([int(re.match(r"(\d+) museum", text(x)).group(1)) if re.match(r"(\d+) museum", text(x)) else -1 for x in rs])
    check(f"museum fan-out round {rnd + 1}: no errors", not any(x.get("isError") for x in rs), [text(x)[:120] for x in rs if x.get("isError")])
print("   museum fan-out counts per round", dict(zip(Q, zip(*counts))))
check("museum fan-out: Mucha/Klimt/art deco/woodblock all non-empty, every round", all(c[i] > 0 for c in counts for i in range(4)), counts)
check("museum fan-out: identical results each round (no transient empties)", all(c == counts[0] for c in counts), counts)
bz = text(call("search_museum_art", {"query": "Bauhaus"}))
check("museum 'Bauhaus' true zero → sibling suggestion, no next-step hint", bz.startswith("0 ") and "search_design_inspiration" in bz and "Next step:" not in bz, bz[:300])
r = call("search_museum_art", {"query": "poster", "theme": "bauhaus"}); t = text(r)
check("museum theme 'bauhaus' (unknown) searched as text, not filtered to nothing", not r.get("isError") and "not a museum theme" in t, t[:200])
r = call("search_museum_art", {"query": "poster", "theme": "art-nouveau"}); t = text(r)
check("museum theme 'art-nouveau' still filters", not r.get("isError") and " in theme art-nouveau" in t and not t.startswith("0 ") and "Next step:" in t, t[:200])

# ---- multibyte queries: D1 LIKE limit is ~50 bytes, so CJK/accented queries used to raise "pattern too complex" errors
for n in ["search_museum_art", "search_design_inspiration", "search_ui_screens", "search_annual_reports"]:
    bad = [q for q in ["浮世絵の美人画と役者絵の木版画ポスター浮世絵の美人画と役者", "Ünïcödé àccéntéd pöster désign týpögraphy"] if call(n, {"query": q}).get("isError")]
    check(f"{n}: long multibyte queries don't error", not bad, bad)

# ---- other changed tools: hints + sibling suggestions
t = text(call("search_design_inspiration", {"query": "serif", "limit": 2})); check("search_design_inspiration: results + next-step hint", not t.startswith("0 ") and t.rstrip().endswith("then generate_design_md."), t[-200:])
t = text(call("search_design_inspiration", {"query": "zzqxflarbnothing"})); check("search_design_inspiration zero: sibling hint, no next step", t.startswith("0 ") and "search_museum_art" in t and "Next step:" not in t, t)
t = text(call("browse_inspiration_by_theme", {"theme": "retro", "limit": 2})); check("browse_inspiration_by_theme: ok", "item(s) in theme" in t, t[:200])
t = text(call("list_inspiration_themes", {})); check("list_inspiration_themes: ok", "retro:" in t, t[:200])
t = text(call("search_annual_reports", {"query": "Paul Rand", "limit": 2})) if args.live else text(call("search_annual_reports", {"query": "annual report", "limit": 2})); check("search_annual_reports: ok + hint", "annual-report result" in t and ("Next step:" in t or t.startswith("0 ")) and (not args.live or ("Paul Rand" in t and "closest matches" not in t)), t[:300])
r = call("search_ui_screens", {"query": "billing settings", "limit": 3}); t = text(r)
check("search_ui_screens: results + next-step hint", not t.startswith("0 ") and "Next step: get_ui_screen_code" in t, t[:300])
sid = re.search(r"screen_id: ([0-9a-f]{12})", t)
if sid:
    r = call("get_ui_screen_code", {"screen_id": sid.group(1), "format": "design_md"}); t = text(r)
    md = t.split("## DESIGN.md\n\n", 1)[-1].split("\n\nNext step:")[0]
    check("get_ui_screen_code: regenerated DESIGN.md has front matter, credit after it", md.startswith("---\nversion: alpha\n") and re.search(r"\n---\n<!-- UI by Made Good Designs", md), md[:150])
    rep, code = lint(md, "ui-" + sid.group(1)); check("get_ui_screen_code: served DESIGN.md (with credit) lints clean", rep and rep["summary"]["errors"] == 0 and rep["summary"]["warnings"] == 0, rep and rep["findings"][:3])
    check("get_ui_screen_code: next-step hint", "Next step:" in t)
fl = re.search(r"flows: ([a-z0-9-]+) step", text(call("search_ui_screens", {"query": "sign up", "limit": 12})))
if fl:
    t = text(call("get_ui_flow", {"flow": fl.group(1)})); check("get_ui_flow: ok + hint", "steps" in t and "Next step:" in t or "isn't available" in t, t[:200])
t = text(call("generate_logo_concepts", {"name": "Luma Laser Room", "count": 2})); check("generate_logo_concepts: next-step hint", "Next step: generate_color_combinations" in t, t[-200:])
t = text(call("generate_color_combinations", {"base_color": "#7c3aed", "how_many": 2})); check("generate_color_combinations: next-step hint", "Next step: generate_website_color_palette" in t, t[-200:])
t = text(call("make_word_search", {"words": ["alpha", "beta", "gamma"]})); check("utility tool unaffected (make_word_search, no hint)", "Next step" not in t and len(t) > 50, t[:200])

# ---- prompts
pl = rpc("prompts/list")["result"]["prompts"]
check("prompts/list: 3 prompts with arguments", sorted(p["name"] for p in pl) == ["brand-kit", "build-screen-from-reference", "design-system-from-references"] and all(p["arguments"] for p in pl), pl)
pg = rpc("prompts/get", {"name": "design-system-from-references", "arguments": {"product": "a yoga booking app", "style": "warm editorial"}})["result"]
check("prompts/get: user message naming the tool chain", pg["messages"][0]["role"] == "user" and "generate_design_md" in pg["messages"][0]["content"]["text"] and "yoga" in pg["messages"][0]["content"]["text"], pg)
e = rpc("prompts/get", {"name": "brand-kit", "arguments": {}})
check("prompts/get: missing required arg → JSON-RPC error", "error" in e and e["error"]["code"] == -32602, e)

# ---- empty results are never edge-cached (REST API that sits behind the edge cache)
def get(path):
    req = urllib.request.Request(args.base.rstrip("/") + "/inspiration" + path, headers={"User-Agent": "curl/8.4.0", "Accept": "*/*"})
    with urllib.request.urlopen(req, timeout=60) as r: return json.loads(r.read()), dict(r.headers)
b, h = get("/api/search?q=zzqxflarbnothing"); cc = {k.lower(): v for k, v in h.items()}.get("cache-control", "")
check("/api/search empty → not edge-cached (no s-maxage, no internal header)", not b["items"] and "s-maxage" not in cc and not any(k.lower() == "x-mgd-no-edge-cache" for k in h), (cc, h))
b, h = get("/api/search?q=serif"); cc = {k.lower(): v for k, v in h.items()}.get("cache-control", "")
check("/api/search non-empty → still edge-cached", b["items"] and "s-maxage" in cc, cc)

print(f"\n{ok} passed, {fail} failed (DESIGN.md files in {TMP})"); sys.exit(1 if fail else 0)
