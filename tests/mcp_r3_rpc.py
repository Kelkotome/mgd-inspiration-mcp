"""MCP r3 (12-Nov-2026): JSON-RPC checks against a Worker (the local e2e's wrangler dev, or live after the deploy).
Usage: python3 tests/mcp_r3_rpc.py <base, e.g. http://127.0.0.1:8991/inspiration or https://madegooddesigns.com/inspiration> [--local]
  - tools/list: 112 tools, ≤ +5 % bytes vs the base (tests/mcp_r3_base_tools.json), instructions < 1,500 chars and lead with when to use them
  - make_star_map: Hamburg, München, São Paulo, NYC, Koeln, Cologne resolve; lat/lon win over city; an unknown city is a clear error
  - design_md_from_references: the 5-Nov query is not an error; no arguments is an error with a message
  - cache consistency: the same call twice gives the same answer (search_ui_screens, list_ui_patterns, get_ui_flow, get_font_pairing,
    get_ui_screen_code both formats, list_inspiration_themes, browse_inspiration_by_theme); a repeat UI search is not slower than 1.5 s
Prints the number of tools/call requests it made ("calls: N") for the mcp_events check. UA curl/8.4.0 (bot-flagged; the site WAF needs it).
Exits 1 on any failure. Read-only tools only."""
import json, os, re, sys, time, urllib.request
base = sys.argv[1].rstrip("/"); local = "--local" in sys.argv
HERE = os.path.dirname(os.path.abspath(__file__))
B = json.load(open(os.path.join(HERE, "mcp_r3_base_tools.json")))
ok = bad = calls = 0
def post(method, params, path="/mcp"):
    body = json.dumps({"jsonrpc": "2.0", "id": 1, "method": method, "params": params}).encode()
    req = urllib.request.Request(base + path, body, {"Content-Type": "application/json", "Accept": "application/json, text/event-stream", "User-Agent": "curl/8.4.0"})
    raw = urllib.request.urlopen(req, timeout=90).read()
    return json.loads(raw), len(raw)
def call(name, args):
    global calls
    calls += 1; t0 = time.time()
    try: r = post("tools/call", {"name": name, "arguments": args})[0]["result"]
    except Exception as e: r = {"isError": True, "content": [{"type": "text", "text": f"request failed: {e}"}]}
    return r, "\n".join(x.get("text", "") for x in r.get("content", []) if x.get("type") == "text"), time.time() - t0
def check(name, cond, info=""):
    global ok, bad
    ok += bool(cond); bad += not cond
    print(("PASS " if cond else "FAIL ") + name + ("" if cond else f"\n   -> {str(info)[:300]}"))

tl, nbytes = post("tools/list", {})
tools = tl["result"]["tools"]
check("tools/list: 112 tools, same names as the base", len(tools) == 112 and [t["name"] for t in tools] == [t["name"] for t in B["tools"]], len(tools))
check(f"tools/list bytes within +5 % of the base ({B['bytes']['mcp']} → {nbytes})", nbytes <= B["bytes"]["mcp"] * 1.05, nbytes)
ins = post("initialize", {"protocolVersion": "2025-06-18", "capabilities": {}, "clientInfo": {"name": "mcp_r3_rpc", "version": "1"}})[0]["result"]["instructions"]
check(f"instructions < 1,500 chars ({len(ins)}), line 1 says when to use them", len(ins) < 1500 and "Use for ANY design" in ins.split("\n")[0] and "BEFORE building or restyling UI" in ins.split("\n")[0], ins[:200])

for city, place in [("Hamburg", "Hamburg, Germany"), ("München", "Munich, Germany"), ("São Paulo", "São Paulo, Brazil"), ("NYC", "New York City, New York, USA"),
                    ("Koeln", "Köln, Germany"), ("Cologne", "Köln, Germany"), ("Hamburg, Germany", "Hamburg, Germany")]:
    r, text, _ = call("make_star_map", {"city": city, "date": "2026-06-21", "time": "22:00", "mag_limit": 3})
    m = re.match(r"\*\*Star map: (.+?), \d{4}-\d{2}-\d{2} ", text)
    check(f"make_star_map city {city!r} → {place}", not r.get("isError") and m and m.group(1) == place, text[:160])
r, text, _ = call("make_star_map", {"city": "Hamburg", "lat": 10, "lon": 20, "date": "2026-06-21", "mag_limit": 3})
check("make_star_map: lat/lon win over city", not r.get("isError") and text.startswith("**Star map: 10°, 20°"), text[:120])
r, text, _ = call("make_star_map", {"city": "Atlantis", "date": "2026-06-21"})
check("make_star_map: unknown city is a clear error", r.get("isError") and 'Unknown city "Atlantis"' in text, text[:160])

r, text, _ = call("design_md_from_references", {"query": "Eco-Friendly AI Product Launch Visual"})
check("design_md_from_references 5-Nov query: not an error", not r.get("isError") and (text.startswith("Design system from") or text.startswith("0 results")), text[:160])
r, text, _ = call("design_md_from_references", {})
check("design_md_from_references with no arguments: an error with a message", r.get("isError") and text.startswith("Pass references"), text[:160])

def twice(name, args, label=None):
    r1, t1, s1 = call(name, args); r2, t2, s2 = call(name, args)
    check(f"same answer twice: {label or name} {json.dumps(args, ensure_ascii=False)[:60]} ({s1:.2f}s, {s2:.2f}s)", t1 == t2 and bool(r1.get("isError")) == bool(r2.get("isError")) and t1, (t1[:120], t2[:120]))
    return r1, t1, s2
r, text, s2 = twice("search_ui_screens", {"query": "dating app swipe"})
m = re.search(r"screen_id: ([0-9a-f]{12})", text)
check("search_ui_screens 'dating app swipe' leads with dating-swipe", re.search(r"(?:^\s+|· )pattern: dating-swipe", text, re.M) is not None, text[:200])
check(f"a repeat UI search answers in under 1.5 s ({s2:.2f}s)", s2 < 1.5, s2)
twice("search_ui_screens", {"query": "mobile dating swipe dark luxury"})
twice("list_ui_patterns", {}); twice("list_ui_patterns", {"kind": "flows"})
twice("get_ui_flow", {"flow": "find-a-date", "device": "mobile"})
twice("get_font_pairing", {"font": "Prata"}); twice("get_font_pairing", {"font": "Zzyzx Display"}, "get_font_pairing (zero)")
if m:
    twice("get_ui_screen_code", {"screen_id": m.group(1)}); twice("get_ui_screen_code", {"screen_id": m.group(1), "format": "copy"})
else: check("a screen_id to fetch", False, text[:200])
twice("list_inspiration_themes", {})
if not local: twice("browse_inspiration_by_theme", {"theme": "retro", "limit": 5})
print(f"calls: {calls}")
print(f"{ok} passed, {bad} failed")
sys.exit(1 if bad else 0)
