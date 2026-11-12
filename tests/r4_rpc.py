"""MCP r4 (13-Nov-2026): JSON-RPC + page checks against a Worker (the local e2e's wrangler dev, or live after the deploy).
Usage: python3 tests/r4_rpc.py <base, e.g. http://127.0.0.1:8973/inspiration or https://madegooddesigns.com/inspiration> [--local]
  - tools/list: 112 tools
  - get_font_pairing: the 12 Noto families answer 5 pairings; CJK aliases resolve; other-script Noto names stay honest zeros
  - get_ui_flow: real flow ids answer as before; a multi-word description answers with the closest screens (live; locally only when
    UI rows exist, else it must stay the old error); gibberish stays the error
  - search_ui_screens "employee directory" leads with team-members (live only: needs the UI rows)
  - search_design_inspiration: a query mixing dominant and rare words answers, no error
  - facet pages: museum/annual facets 200 twice with the same body, unknown slug 404
UA curl/8.4.0 (the site WAF needs it). Read-only. Exits 1 on any failure."""
import json, re, sys, time, urllib.request, urllib.error
base = sys.argv[1].rstrip("/"); local = "--local" in sys.argv
ok = bad = 0
H = {"User-Agent": "curl/8.4.0", "Accept": "*/*"}
def post(method, params):
    body = json.dumps({"jsonrpc": "2.0", "id": 1, "method": method, "params": params}).encode()
    req = urllib.request.Request(base + "/mcp", body, {**H, "Content-Type": "application/json", "Accept": "application/json, text/event-stream"})
    return json.loads(urllib.request.urlopen(req, timeout=90).read())
def call(name, args):
    try: r = post("tools/call", {"name": name, "arguments": args})["result"]
    except Exception as e: r = {"isError": True, "content": [{"type": "text", "text": f"request failed: {e}"}]}
    return r, "\n".join(x.get("text", "") for x in r.get("content", []) if x.get("type") == "text")
def get(path):
    try:
        with urllib.request.urlopen(urllib.request.Request(base + path, headers=H), timeout=60) as r: return r.status, r.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as e: return e.code, ""
def check(name, cond, info=""):
    global ok, bad
    ok += bool(cond); bad += not cond
    print(("PASS " if cond else "FAIL ") + name + ("" if cond else f"\n   -> {str(info)[:300]}"))

tools = post("tools/list", {})["result"]["tools"]
check(f"tools/list: 112 tools ({len(tools)})", len(tools) == 112, len(tools))

for f in ["Noto Sans", "Noto Serif", "Noto Sans SC", "Noto Serif SC", "Noto Sans TC", "Noto Serif TC", "Noto Sans JP", "Noto Serif JP", "Noto Sans KR", "Noto Serif KR", "Noto Sans Arabic", "Noto Sans Devanagari"]:
    r, t = call("get_font_pairing", {"font": f})
    check(f"get_font_pairing {f!r}: 5 pairings", not r.get("isError") and t.startswith(f"5 pairing(s) for {f}."), t[:120])
for q, want in [("Noto Sans CJK SC", "Noto Sans SC"), ("Noto Serif CJK JP", "Noto Serif JP"), ("Noto Sans Simplified Chinese", "Noto Sans SC")]:
    r, t = call("get_font_pairing", {"font": q}); check(f"get_font_pairing {q!r} -> {want}", t.startswith(f"5 pairing(s) for {want}"), t[:120])
for q in ["Noto Sans Thai", "Noto Sans Hebrew", "Noto Color Emoji"]:
    r, t = call("get_font_pairing", {"font": q}); check(f"get_font_pairing {q!r} stays an honest zero", t.startswith("0 results"), t[:120])

for f in ["checkout", "sign up", "password reset"]:
    r, t = call("get_ui_flow", {"flow": f}); check(f"get_ui_flow {f!r} answers (no error)", not r.get("isError") and t, t[:120])
r, t = call("get_ui_flow", {"flow": "employee directory browse and view team hierarchy", "device": "web", "style": "corporate"})
fallback = t.startswith('No step-by-step flow matches "employee directory browse and view team hierarchy"') and "screen_id: " in t and not r.get("isError")
if local: check("get_ui_flow description: the closest screens, or (no UI rows locally) the old error", fallback or (r.get("isError") and t.startswith("No flow matches")), t[:200])
else: check("get_ui_flow description (12-Nov call): the closest screens, flow list first, no error", fallback and "call get_ui_flow with one of these ids:" in t, t[:200])
r, t = call("get_ui_flow", {"flow": "qwxz plorbt vrrmk"}); check("get_ui_flow gibberish stays the error", r.get("isError") and t.startswith("No flow matches"), t[:120])
if not local:
    r, t = call("search_ui_screens", {"query": "employee directory", "limit": 3})
    m = re.search(r"pattern: ([a-z0-9-]+)", t); check("search_ui_screens 'employee directory' leads with team-members", m and m.group(1) == "team-members", t[:200])

t0 = time.time(); r, t = call("search_design_inspiration", {"query": "editorial typography poster greek vase red black", "limit": 8}); s = time.time() - t0
check(f"search_design_inspiration mixed dominant + rare words: answers ({s:.2f}s)", not r.get("isError") and t, t[:160])

pages = ["/museum/culture/greek", "/museum/artist/jan-brueghel-the-elder", "/annual-reports/company/federal-reserve-bank-of-dallas", "/annual-reports/country/united-states"] if local else \
        ["/annual-reports/country/united-states", "/museum/culture/japanese", "/annual-reports/industry/banking"]
for p in pages:
    a, b = get(p), get(p)
    check(f"{p}: 200 twice, same body", a[0] == b[0] == 200 and a[1] == b[1] and "<title>" in a[1], (a[0], b[0], len(a[1]), len(b[1])))
for p in ["/museum/culture/no-such-culture-zz", "/annual-reports/company/no-such-company-zz"]:
    check(f"{p}: 404", get(p)[0] == 404)
print(f"{ok} passed, {bad} failed")
sys.exit(1 if bad else 0)
