"""mcp-gaps-r1 (10-Nov-2026): replay tests/gaps_r1_cases.json over JSON-RPC against a Worker.
Usage: python3 tests/gaps_r1_rpc.py <base, e.g. http://127.0.0.1:8971/inspiration or https://madegooddesigns.com/inspiration>
Exits 1 on any failure. UA curl/8.4.0 (bot-flagged in mcp_events, and the site WAF needs it). Read-only tools only."""
import json, os, re, sys, urllib.request
base = sys.argv[1].rstrip("/")
cases = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "gaps_r1_cases.json"), encoding="utf-8"))["cases"]
ok = bad = 0
for i, c in enumerate(cases):
    body = json.dumps({"jsonrpc": "2.0", "id": i, "method": "tools/call", "params": {"name": c["tool"], "arguments": c["args"]}}).encode()
    try:
        req = urllib.request.Request(base + "/mcp", body, {"Content-Type": "application/json", "Accept": "application/json, text/event-stream", "User-Agent": "curl/8.4.0"})
        r = json.loads(urllib.request.urlopen(req, timeout=60).read())["result"]
    except Exception as e:
        r = {"isError": True, "content": [{"text": f"request failed: {e}"}]}
    text = "\n".join(x.get("text", "") for x in r.get("content", []))
    # structuredContent is not part of the tools/call answer here, so read the text: "N pairing(s) for …", "**Star map: <place>, YYYY-"
    m = re.match(r"(\d+) pairing\(s\) for ", text); npairs = int(m.group(1)) if m else 0
    m = re.match(r"\*\*Star map: (.+?), \d{4}-\d{2}-\d{2} ", text); place = m.group(1) if m else None
    why = []
    if bool(r.get("isError")) != bool(c.get("err")): why.append(f"isError={r.get('isError')}")
    if c.get("want_re") and not re.search(c["want_re"], text): why.append("text does not match " + c["want_re"])
    if c.get("not_re") and re.search(c["not_re"], text): why.append("text matches " + c["not_re"])
    if c.get("min_pairs") and npairs < c["min_pairs"]: why.append(f"{npairs} pairs")
    if c.get("place"):
        if place != c["place"]: why.append(f"place {place!r}")
        # the star-map page's own ~60 cities answer first and unchanged (no credit); the rest come from GeoNames and carry its credit
        if c.get("legacy") == ("GeoNames (geonames.org), CC BY 4.0" in text): why.append("GeoNames credit " + ("on a legacy city" if c.get("legacy") else "missing"))
    good = not why
    ok += good; bad += not good
    print(("PASS " if good else "FAIL ") + c["tool"] + " " + json.dumps(c["args"], ensure_ascii=False)[:70] + ("" if good else f"\n   -> {'; '.join(why)} | {text[:240]!r}"))
print(f"{ok} passed, {bad} failed")
sys.exit(1 if bad else 0)
