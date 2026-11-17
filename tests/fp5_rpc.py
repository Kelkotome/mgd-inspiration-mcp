"""fonts r5 (17-Nov-2026): get_font_pairing over JSON-RPC against a Worker (local wrangler dev, or live after the owner's deploy).
Usage: python3 tests/fp5_rpc.py <base, e.g. http://127.0.0.1:8973/inspiration or https://madegooddesigns.com/inspiration>
  - Trajan, Trajan Pro, Trajan Pro 3 answer 5 pairings from trajan-font-pairings (exact / alias), Adobe Fonts licence note, serif CSS
    stack, About line that says it is not free; Trajan Sans stays "0 results"
  - Onest answers from onest-font-pairings (was the curated page-null entry), about 2023
  - Big Shoulders Display still answers from big-shoulders-font-pairings (alias)
  - fonts r4 regressions: Golos Text exact, Play similar, junk invalid, Gotham zero
UA curl/8.4.0 (the site WAF needs it; the Worker bot-flags curl, so these calls never count as users). Read-only. Exit 1 on any failure."""
import json, sys, urllib.request
base = sys.argv[1].rstrip("/")
ok = bad = 0
H = {"User-Agent": "curl/8.4.0", "Accept": "application/json, text/event-stream", "Content-Type": "application/json", "MCP-Protocol-Version": "2025-06-18"}


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


TP = "https://madegooddesigns.com/trajan-font-pairings/"
for q, how in [("Trajan", "exact"), ("Trajan Pro", "alias"), ("Trajan Pro 3", "alias"), ("trajan font pairing", "exact")]:
    r, t, s = call(q)
    check(f"{q}: 5 pairings from trajan-font-pairings ({how})", not r.get("isError") and s.get("font") == "Trajan" and s.get("match") == how
          and TP in t and len(s.get("pairs") or []) == 5 and all(p.get("heading") == "Trajan" for p in s["pairs"]), t[:200])
r, t, s = call("Trajan")
check("Trajan: About line says not free / Adobe / Cinzel, never 'free on Google Fonts'",
      "not free and not on Google Fonts" in t and "Carol Twombly" in t and "Cinzel" in t and "free on Google Fonts" not in t, t[:400])
check("Trajan: Adobe Fonts note + serif CSS stack on every pair",
      all("Adobe Fonts" in (p.get("note") or "") and '"trajan-pro-3", "Trajan Pro 3", serif' in p.get("css", "") for p in s.get("pairs") or [{}]), s.get("pairs"))
check("Trajan: Google Fonts link has only the partner", all("Trajan" not in (p.get("google_fonts_url") or "Trajan") for p in s.get("pairs") or [{}]), s.get("pairs"))
r, t, s = call("Trajan Sans"); check("Trajan Sans: still an honest 0 results", t.startswith("0 results"), t[:120])
r, t, s = call("Onest")
check("Onest: 5 pairings from onest-font-pairings (exact, not curated)", s.get("match") == "exact" and s.get("page") == "https://madegooddesigns.com/onest-font-pairings/"
      and not s.get("curated") and len(s.get("pairs") or []) == 5 and (s.get("about") or {}).get("added") == 2023, t[:200])
r, t, s = call("Big Shoulders Display")
check("Big Shoulders Display: alias to big-shoulders-font-pairings (unchanged)", s.get("match") == "alias" and s.get("page") == "https://madegooddesigns.com/big-shoulders-font-pairings/", t[:160])
r, t, s = call("Golos Text"); check("Golos Text: exact (fonts r4, unchanged)", s.get("match") == "exact" and "golos-text-font-pairings" in t, t[:120])
r, t, s = call("Play"); check("Play: similar (fonts r4, unchanged)", s.get("match") == "similar", t[:120])
r, t, s = call("python asyncio"); check("junk: invalid (fonts r4, unchanged)", s.get("match") == "invalid", t[:120])
r, t, s = call("Gotham"); check("Gotham: still 0 results", t.startswith("0 results"), t[:120])
print(f"{ok} passed, {bad} failed")
sys.exit(1 if bad else 0)
