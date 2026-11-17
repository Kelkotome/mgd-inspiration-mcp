"""fonts r6 (18-Nov-2026): get_font_pairing over JSON-RPC against a Worker (local wrangler dev, or live after the owner's deploy).
Usage: python3 tests/fp6_rpc.py <base, e.g. http://127.0.0.1:8973/inspiration or https://madegooddesigns.com/inspiration>
  - Garamond / Baskerville / Caslon / Bodoni / Georgia: own guide, About line, serif family stack, availability note naming the free
    Google Fonts revival (EB Garamond, Libre Baskerville, Libre Caslon Text, Bodoni Moda) or "system font" (Georgia); no
    "licence or self-host it" for them
  - Futura + Bodoni [Display Pairings]: Bodoni falls back to serif (was sans-serif); Georgia + Arial: both system-font notes
  - fonts r5 regressions: Trajan Adobe note unchanged; Futura keeps "licence or self-host it"
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


R6 = {"Garamond": ('"Garamond", "EB Garamond", "Georgia", serif', "EB Garamond", "Claude Garamond"),
      "Baskerville": ('"Baskerville", "Libre Baskerville", "Georgia", serif', "Libre Baskerville", "John Baskerville"),
      "Caslon": ('"Adobe Caslon Pro", "Libre Caslon Text", "Georgia", serif', "Libre Caslon Text", "William Caslon"),
      "Bodoni": ('"Bodoni 72", "Bodoni Moda", "Georgia", serif', "Bodoni Moda", "Giambattista Bodoni"),
      "Georgia": ('"Georgia", serif', "preinstalled on Windows and macOS", "Matthew Carter")}
for font, (stack, named, who) in R6.items():
    r, t, s = call(font, limit=20)
    pairs = s.get("pairs") or []
    check(f"{font}: own guide, About line ({who}), never 'free on Google Fonts'", not r.get("isError") and s.get("font") == font and s.get("match") == "exact"
          and f"-font-pairing" in (s.get("page") or "") and f"About: {font} is" in t and who in t and "free on Google Fonts" not in t, t[:300])
    mine = [p for p in pairs if font in (p.get("heading"), p.get("body"))]
    check(f"{font}: serif stack on all {len(mine)} rows", mine and all(stack in p.get("css", "") for p in mine), [p.get("css") for p in mine][:2])
    check(f"{font}: note names {named}, no 'self-host' for {font}", all(f"{font} (" in (p.get("note") or "") and named in p["note"]
          and f"{font} (licence or self-host it)" not in p["note"] for p in mine), [p.get("note") for p in mine][:2])
r, t, s = call("Futura", group="display", limit=20)
fb = [p for p in s.get("pairs") or [] if p.get("body") == "Bodoni"]
check("Futura + Bodoni [Display]: Bodoni serif (was sans-serif); Futura keeps 'licence or self-host it'",
      fb and fb[0]["css"].endswith('body { font-family: "Bodoni 72", "Bodoni Moda", "Georgia", serif; }') and "Futura (licence or self-host it)" in fb[0].get("note", ""), fb[:1])
r, t, s = call("Georgia", limit=20)
ga = [p for p in s.get("pairs") or [] if p.get("body") == "Arial"]
check("Georgia + Arial: both system-font notes", ga and ga[0].get("note", "").count("system font preinstalled on Windows and macOS") == 2, ga[:1])
r, t, s = call("Trajan")
check("Trajan: Adobe Fonts note + serif stack (fonts r5, unchanged)", all("Adobe Fonts" in (p.get("note") or "") and '"trajan-pro-3", "Trajan Pro 3", serif' in p.get("css", "") for p in s.get("pairs") or [{}]), t[:200])
print(f"{ok} passed, {bad} failed")
sys.exit(1 if bad else 0)
