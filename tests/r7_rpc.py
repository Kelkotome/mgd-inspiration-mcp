"""MCP r7 (18-Nov-2026): JSON-RPC checks against a Worker (tests/r7_local_e2e.sh's wrangler dev with seeded rows, or live after the deploy).
Usage: python3 tests/r7_rpc.py <base, e.g. http://127.0.0.1:8977/inspiration or https://madegooddesigns.com/inspiration> [--local]
  - tools/list: 113 tools (112 + get_shared_board, app boards 23-Nov-2026), same names; instructions within 1,500 characters
  - accent folding: Hammershoi = Hammershøi (live: the 8 SMK works), Kobke = Købke, Bjorg = Bjørg, Muller = Müller, Dvorak = Dvořák, Rodenbach
  - get_ui_flow: onboarding -> sign-up; aliases; a typo names the closest flow + search_ui_screens; gibberish stays the error
  - design_md_from_references with plain-text references; barcode check digit message
  - list_inspiration_themes answers (timed twice); intent hints fire / stay quiet
UA curl/8.4.0 (the site WAF needs it). Read-only (each call logs one mcp_calls + mcp_events row, as any call does). Exits 1 on any failure."""
import json, re, sys, time, urllib.request
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
def check(name, cond, info=""):
    global ok, bad
    ok += bool(cond); bad += not cond
    print(("PASS " if cond else "FAIL ") + name + ("" if cond else f"\n   -> {str(info)[:300]}"))
ids = lambda t: list(dict.fromkeys(re.findall(r"\b[0-9a-f]{12}\b", t)))
first = lambda t: t.split("\n")[0]

tools = post("tools/list", {})["result"]["tools"]
check(f"tools/list: 113 tools ({len(tools)})", len(tools) == 113, len(tools))  # +get_shared_board (app boards, 23-Nov-2026)
names = {t["name"] for t in tools}
check("tools/list: the r7 tools are all there", {"search_museum_art", "search_design_inspiration", "search_annual_reports", "get_ui_flow", "design_md_from_references",
      "generate_upc_barcode", "list_inspiration_themes", "get_font_pairing", "get_brand_typeface", "generate_website_color_palette"} <= names)
ins = post("initialize", {"protocolVersion": "2025-06-18", "capabilities": {}, "clientInfo": {"name": "r7-check", "version": "1"}})["result"].get("instructions", "")
check(f"instructions within 1,500 characters ({len(ins)})", 0 < len(ins) <= 1500, len(ins))

# accent folding
def same(tool, a, b, need=1):
    ra, ta = call(tool, {"query": a}); rb, tb = call(tool, {"query": b})
    check(f"{tool}: {a!r} = {b!r} ({len(ids(ta))} results)", not ra.get("isError") and not rb.get("isError") and ids(ta) == ids(tb) and len(ids(ta)) >= need, first(ta) + " || " + first(tb))
same("search_museum_art", "Hammershoi", "Hammershøi", 1 if local else 8)
same("search_museum_art", "Kobke", "Købke")
same("search_design_inspiration", "Bjorg", "Bjørg")
same("search_design_inspiration", "Muller", "Müller")
same("search_annual_reports", "Muller", "Müller", 1 if local else 0)
same("search_design_inspiration", "Dvorak", "Dvořák", 1 if local else 0)
r, t = call("search_design_inspiration", {"query": "Rodenbach"}); check("search_design_inspiration 'Rodenbach' answers (no error)", not r.get("isError") and (not local or len(ids(t)) >= 1), first(t))
r, t = call("get_brand_typeface", {"brand": "Sostrene Grene"}); check("get_brand_typeface 'Sostrene Grene' -> Søstrene Grene", not r.get("isError") and "Søstrene Grene" in t, first(t))

# get_ui_flow
r, t = call("get_ui_flow", {"flow": "onboarding"}); check("get_ui_flow 'onboarding' -> sign-up, no error", not r.get("isError") and ("→ sign-up" in t or "The sign-up flow" in t), first(t))
for f, want in [("2fa", "login-2fa"), ("forgot password", "password-reset"), ("purchase", "checkout"), ("cancel", "cancel-subscription"), ("invite", "invite-teammate"), ("pricing", "upgrade-plan")]:
    r, t = call("get_ui_flow", {"flow": f}); check(f"get_ui_flow {f!r} -> {want}", not r.get("isError") and (f"→ {want}" in t or f"The {want} flow" in t), first(t))
r, t = call("get_ui_flow", {"flow": "onbording"})
check("get_ui_flow typo: error naming the closest flow + a search_ui_screens call", r.get("isError") and t.startswith('No flow matches "onbording". Closest flow: sign-up') and 'search_ui_screens(query="onbording")' in t, first(t))
r, t = call("get_ui_flow", {"flow": "qwxz plorbt vrrmk"}); check("get_ui_flow gibberish stays the error", r.get("isError") and t.startswith("No flow matches"), first(t))
for f in ["checkout", "invite-teammate"]:
    r, t = call("get_ui_flow", {"flow": f}); check(f"get_ui_flow {f!r} answers (no error)", not r.get("isError") and t, first(t))

# forgiving inputs
r, t = call("design_md_from_references", {"references": "Materials Marketplace"})
check("design_md_from_references plain text: searched instead of the old error", not r.get("isError") and (t.startswith("The references you passed were plain text") or t.startswith("0 results")) and not t.startswith("Pass references"), first(t))
r, t = call("generate_upc_barcode", {"number": "036000291453"})
check("generate_upc_barcode wrong check digit: error + corrected code named", r.get("isError") and "Check digit should be 2" in t and 'number="036000291452"' in t and "not changed" in t, t[:200])
r, t = call("generate_upc_barcode", {"number": "036000291452"}); check("generate_upc_barcode correct code: barcode", not r.get("isError") and t.startswith("UPCA 036000291452"), first(t))

# themes (timed)
t0 = time.time(); r, t = call("list_inspiration_themes", {}); a = time.time() - t0
t0 = time.time(); r2, t2 = call("list_inspiration_themes", {}); b = time.time() - t0
check(f"list_inspiration_themes answers, same twice ({a*1000:.0f} ms, then {b*1000:.0f} ms)", not r.get("isError") and "- retro: " in t and t == t2, first(t))

# intent hints
for tool, q, head in [("search_design_inspiration", "Poppins font", 'Looking for font pairings? get_font_pairing(font="Poppins")'),
                      ("search_design_inspiration", "warm colour palette", 'Need a website colour palette? generate_website_color_palette(style="warm")'),
                      ("search_design_inspiration", "Nike font", 'Looking for a brand\'s typeface? get_brand_typeface(brand="Nike")')]:
    r, t = call(tool, {"query": q}); check(f"hint: {q!r} leads with {head.split('?')[1].strip()[:45]}", not r.get("isError") and t.startswith(head) and "Palette from these references" not in t, first(t))
for tool, q in [("search_design_inspiration", "iconic"), ("search_design_inspiration", "brand new"), ("search_design_inspiration", "Fontaine poster"), ("search_museum_art", "palette knife painting")]:
    r, t = call(tool, {"query": q}); check(f"no hint: {q!r}", not r.get("isError") and not re.match(r"Looking for font pairings\?|Looking for a brand's typeface\?|Need a website colour palette\?", t), first(t))

print(f"{ok} passed, {bad} failed")
sys.exit(1 if bad else 0)
