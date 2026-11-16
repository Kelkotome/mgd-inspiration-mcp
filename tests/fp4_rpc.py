"""fonts r4 (16-Nov-2026): get_font_pairing over JSON-RPC against a Worker (local wrangler dev, or live after the deploy).
Usage: python3 tests/fp4_rpc.py <base, e.g. http://127.0.0.1:8977/inspiration or https://madegooddesigns.com/inspiration>
  - the 11 zero fonts of 9-16 Nov answer 5 pairings from their own *-font-pairings guide (structuredContent.match exact)
  - a Google Font with no guide (Play, Martian Mono, Noto Kufi Arabic) answers "No dedicated guide ... similar ..." (match similar)
  - junk ("python asyncio", "") gets the short validation message (match invalid), no font list, not an error
  - Poppins / Montserrat exact, Crimson Pro partner, Noto Sans Thai + Gotham still "0 results"
UA curl/8.4.0 (the site WAF needs it; the Worker bot-flags curl, so these calls never count as users). Read-only. Exit 1 on any failure.
No D1: get_font_pairing is a lookup over bundled JSON (the logging writes are the Worker's usual deferred inserts)."""
import json, sys, urllib.request
base = sys.argv[1].rstrip("/")
ok = bad = 0
H = {"User-Agent": "curl/8.4.0", "Accept": "application/json, text/event-stream", "Content-Type": "application/json", "MCP-Protocol-Version": "2025-06-18"}  # structuredContent


def call(font, **kw):
    body = json.dumps({"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "get_font_pairing", "arguments": {"font": font, **kw}}}).encode()
    try:
        r = json.loads(urllib.request.urlopen(urllib.request.Request(base + "/mcp", body, H), timeout=60).read())["result"]
    except Exception as e:
        r = {"isError": True, "content": [{"type": "text", "text": f"request failed: {e}"}]}
    return r, (r.get("content") or [{}])[0].get("text", ""), r.get("structuredContent") or {}


def check(name, cond, info=""):
    global ok, bad
    ok += bool(cond); bad += not cond
    print(("PASS " if cond else "FAIL ") + name + ("" if cond else f"\n   -> {str(info)[:300]}"))


ELEVEN = {"Golos Text": "golos-text", "Vazirmatn": "vazirmatn", "Noto Sans SC": "noto-sans-sc", "Noto Serif SC": "noto-serif-sc", "Estedad": "estedad",
          "Forum": "forum", "Prata": "prata", "Bellefair": "bellefair", "Tenor Sans": "tenor-sans", "Gilda Display": "gilda-display", "Italiana": "italiana"}
for f, slug in ELEVEN.items():
    r, t, s = call(f)
    page = f"https://madegooddesigns.com/{slug}-font-pairings/"   # answers may append utm parameters
    check(f"{f}: 5 pairings from {slug}-font-pairings", not r.get("isError") and t.startswith(f"5 pairing(s) for {f}.") and page in t
          and s.get("match") == "exact" and len(s.get("pairs") or []) == 5, t[:160])
for f, cat in [("Play", "sans-serif"), ("Martian Mono", "monospace"), ("Noto Kufi Arabic", "Arabic-script sans-serif")]:
    r, t, s = call(f)
    check(f"{f}: similar {cat} fonts", not r.get("isError") and t.startswith(f"No dedicated guide for {f} yet; these are published pairings for similar {cat} fonts")
          and s.get("match") == "similar" and s.get("pairs") and all(p.get("page") for p in s["pairs"]) and "Playfair" not in t.split("\n")[0], t[:200])
for q in ["python asyncio", ""]:
    r, t, s = call(q)
    check(f"junk {q!r}: short validation", not r.get("isError") and s.get("match") == "invalid" and len(t) < 200 and "pairing guides" not in t, t[:160])
for f in ["Poppins", "Montserrat"]:
    r, t, s = call(f)
    check(f"{f}: exact, own guide (unchanged)", s.get("match") == "exact" and t.startswith("6 pairing(s) for " + f) if f == "Poppins" else s.get("match") == "exact", t[:120])
r, t, s = call("Crimson Pro"); check("Crimson Pro: partner answer (unchanged)", s.get("match") == "partner" and t.startswith("No dedicated pairing guide for Crimson Pro yet"), t[:120])
for q in ["Noto Sans Thai", "Gotham"]:
    r, t, s = call(q); check(f"{q}: still an honest 0 results", t.startswith("0 results"), t[:120])
print(f"{ok} passed, {bad} failed")
sys.exit(1 if bad else 0)
