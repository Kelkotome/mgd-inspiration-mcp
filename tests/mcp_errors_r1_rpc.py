"""mcp-errors-r1 (9-Nov-2026): replay tests/mcp_errors_r1_cases.json over JSON-RPC against a Worker.
Usage: python3 tests/mcp_errors_r1_rpc.py <base, e.g. http://127.0.0.1:8961/inspiration or https://madegooddesigns.com/inspiration> [--live-only]
Exits 1 on any failure. UA curl/8.4.0 (bot-flagged in mcp_events, and the site WAF needs it)."""
import json, os, sys, urllib.request
base = sys.argv[1].rstrip("/"); live_only = "--live-only" in sys.argv
cases = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "mcp_errors_r1_cases.json")))["cases"]
ok = bad = 0
for i, c in enumerate(cases):
    if live_only and not c.get("live"): continue
    body = json.dumps({"jsonrpc": "2.0", "id": i, "method": "tools/call", "params": {"name": c["tool"], "arguments": c["args"]}}).encode()
    try:
        req = urllib.request.Request(base + "/mcp", body, {"Content-Type": "application/json", "Accept": "application/json, text/event-stream", "User-Agent": "curl/8.4.0"})
        r = json.loads(urllib.request.urlopen(req, timeout=60).read())["result"]
    except Exception as e:
        r = {"isError": True, "content": [{"text": f"request failed: {e}"}]}
    text = "\n".join(x.get("text", "") for x in r.get("content", []))
    want = c.get("want_any") or [c["want"]]
    good = bool(r.get("isError")) == bool(c.get("err")) and any(w in text for w in want) and "failed:" not in text[:200] and not text.startswith("Error: ")
    ok += good; bad += not good
    print(("PASS " if good else "FAIL ") + c["tool"] + " " + json.dumps(c["args"])[:70] + ("" if good else f"\n   -> isError={r.get('isError')} {text[:300]!r}"))
print(f"{ok} passed, {bad} failed")
sys.exit(1 if bad else 0)
