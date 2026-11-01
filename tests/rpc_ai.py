"""b60 AI tools: HTTP checks against a running Worker.
Local (wrangler dev with tests/run_ai_local.sh vars + tests/ai_mock_server.py; NO real API call, NO spend):
  python3 tests/rpc_ai.py --base http://127.0.0.1:8861 --mock http://127.0.0.1:8862 [--baseline-base http://127.0.0.1:8863]
  expects AI_DAILY_PER_IP=20 and AI_DAILY_BUDGET_USD=0.01 (mock usage 1,500 in / 350 out = 325 micro-dollars per call).
Live smoke (no spend: never sends a valid Turnstile token):
  python3 tests/rpc_ai.py --live --base https://madegooddesigns.com
Exit 0 = all pass. UA curl/8.4.0."""
import argparse, base64, json, os, sys, urllib.request, urllib.error
ap = argparse.ArgumentParser(); ap.add_argument("--base", default="http://127.0.0.1:8861"); ap.add_argument("--mock"); ap.add_argument("--baseline-base"); ap.add_argument("--live", action="store_true")
args = ap.parse_args()
FX = os.path.join(os.path.dirname(os.path.abspath(__file__)), "fixtures_ai")
ok = fail = 0
def check(name, cond, info=""):
    global ok, fail
    ok += bool(cond); fail += not cond
    print(("PASS " if cond else "FAIL ") + name + ("" if cond else " | " + str(info)[:400]))
LOCAL_ORIGIN = "http://127.0.0.1:8806"
def req(path, body=None, method=None, origin=LOCAL_ORIGIN, ip=None, base=None, raw=None):
    h = {"User-Agent": "curl/8.4.0", "Accept": "*/*"}
    if origin: h["Origin"] = origin
    if ip: h["X-Test-IP"] = ip
    data = raw if raw is not None else (json.dumps(body).encode() if body is not None else None)
    if data is not None: h["Content-Type"] = "application/json"
    r = urllib.request.Request((base or args.base).rstrip("/") + "/inspiration" + path, data=data, headers=h, method=method or ("POST" if data is not None else "GET"))
    try:
        with urllib.request.urlopen(r, timeout=60) as resp: b = resp.read(); return resp.status, dict(resp.headers), b
    except urllib.error.HTTPError as e: return e.code, dict(e.headers), e.read()
def J(b):
    try: return json.loads(b)
    except Exception: return {}
def durl(f):
    t = "image/jpeg" if f.endswith(".jpg") else "image/png" if f.endswith(".png") else "image/webp"
    return f"data:{t};base64," + base64.b64encode(open(os.path.join(FX, f), "rb").read()).decode()
def mock(path, body=None):
    r = urllib.request.Request(args.mock + path, data=json.dumps(body).encode() if body is not None else None, headers={"Content-Type": "application/json"})
    return json.loads(urllib.request.urlopen(r, timeout=10).read())
IMG = durl("t800x600.jpg")
def describe(ip, mode="describe", origin=LOCAL_ORIGIN, **kw):
    b = {"mode": mode, "image": kw.pop("image", IMG), "turnstile": kw.pop("turnstile", "XXXX.DUMMY.TOKEN.XXXX")}; b.update(kw)
    s, h, body = req("/api/ai/describe", b, ip=ip, origin=origin); return s, h, J(body), body

if args.live:
    s, h, b = req("/api/ai/health", origin="https://madegooddesigns.com"); d = J(b)
    check("live health 200 JSON", s == 200 and d.get("ok") is True, (s, b[:200]))
    check("live health ai:true, model claude-haiku-5-5, limit 20", d.get("ai") is True and d.get("model") == "claude-haiku-5-5" and d.get("limit") == 20, d)
    check("live health has a Turnstile site key and resets", bool(d.get("turnstile_sitekey")) and str(d.get("resets", "")).endswith("T00:00:00.000Z"), d)
    check("live health Cache-Control no-store", "no-store" in {k.lower(): v for k, v in h.items()}.get("cache-control", ""), h)
    s, h, b = req("/api/ai/describe", {"mode": "describe", "image": IMG}, origin="https://madegooddesigns.com"); d = J(b)
    check("live POST without Turnstile token -> 403 turnstile (no model call)", s == 403 and d.get("error") == "turnstile", (s, b[:200]))
    s, h, b = req("/api/ai/describe", {"mode": "describe", "image": IMG, "turnstile": "x"}, origin="https://evil.example"); d = J(b)
    check("live POST from a foreign origin -> 403 origin", s == 403 and d.get("error") == "origin", (s, b[:200]))
    s, h, b = req("/api/ai/health", origin="http://localhost:8806"); d = J(b)
    check("live: localhost origin refused (DEV_ALLOW_LOCAL off)", s == 403 and d.get("error") == "origin", (s, b[:200]))
    print(f"\n{ok} passed, {fail} failed"); sys.exit(1 if fail else 0)

# ---------------------------------------------------------------- local
s, h, b = req("/api/ai/health", ip="10.0.0.1"); d = J(b); hl = {k.lower(): v for k, v in h.items()}
check("health 200 + contract fields", s == 200 and all(k in d for k in ("ok", "ai", "model", "limit", "remaining", "budget_ok", "turnstile_sitekey", "resets")), (s, d))
check("health ai:true, model, limit 20, remaining 20, test site key", d.get("ai") is True and d.get("model") == "claude-haiku-5-5" and d.get("limit") == 20 and d.get("remaining") == 20 and d.get("turnstile_sitekey") == "1x00000000000000000000AA", d)
check("health no-store + CORS reflects the allowed local origin", "no-store" in hl.get("cache-control", "") and hl.get("access-control-allow-origin") == LOCAL_ORIGIN, hl)
s, h, b = req("/api/ai/describe", method="OPTIONS"); hl = {k.lower(): v for k, v in h.items()}
check("OPTIONS preflight 204 with POST allowed", s == 204 and "POST" in hl.get("access-control-allow-methods", ""), (s, hl))
s, h, b = req("/api/ai/health", origin="https://evil.example"); check("foreign origin -> 403 origin", s == 403 and J(b).get("error") == "origin", (s, b[:200]))

for mode in ("describe", "alt", "prompt"):
    s, h, d, raw = describe("10.0.0.1", mode, **({"context": "Hero image on a bakery homepage"} if mode == "alt" else {"style": "illustration"} if mode == "prompt" else {"detail": "detailed"}))
    r = d.get("result") or {}
    want = {"describe": ["title", "description", "subjects", "colors", "style", "mood", "text_in_image"], "alt": ["alt", "long_description", "decorative"], "prompt": ["prompt", "negative_prompt", "tags", "aspect_ratio", "style_keywords"]}[mode]
    check(f"{mode}: 200 ok with the contract result fields", s == 200 and d.get("ok") is True and d.get("mode") == mode and all(k in r for k in want), (s, raw[:300]))
    last = mock("/__last")
    check(f"{mode}: upstream request shape OK (mock: no problems, image block, key set, version 2026-10-21)", not last["problems"] and last["has_image"] and last["headers"].get("x-api-key") == "<set>" and last["headers"].get("anthropic-version") == "2026-10-21" and last["mode"] == mode, last)
check("remaining counts down (17 after 3 calls)", d.get("remaining") == 17 and d.get("limit") == 20 and d.get("resets", "").endswith("T00:00:00.000Z"), d)
s, h, d, raw = describe("10.0.0.1", image=durl("t1024x1024.png")); check("PNG 1024x1024 accepted", s == 200, (s, raw[:200]))
s, h, d, raw = describe("10.0.0.1", image=durl("t500x400-alpha.webp")); check("WebP (VP8X) accepted, media_type passed through", s == 200 and mock("/__last")["media_type"] == "image/webp", (s, raw[:200]))

# validation (no IP use consumed)
n0 = mock("/__last")["count"]
s, h, d, raw = describe("10.0.0.1", image=durl("t1200x900.jpg")); check("1200 px image -> 400 bad_image (resize)", s == 400 and d.get("error") == "bad_image" and "1024" in d.get("message", ""), (s, raw[:200]))
s, h, d, raw = describe("10.0.0.1", image="data:image/gif;base64,R0lGODlhAQABAAAAACw="); check("GIF -> 400 bad_image", s == 400 and d.get("error") == "bad_image", (s, raw[:200]))
s, h, d, raw = describe("10.0.0.1", mode="chat"); check("bad mode -> 400 bad_mode", s == 400 and d.get("error") == "bad_mode", (s, raw[:200]))
s, h, b = req("/api/ai/describe", raw=b"{nope", ip="10.0.0.1"); check("non-JSON body -> 400 bad_request", s == 400 and J(b).get("error") == "bad_request", (s, b[:200]))
big = "data:image/png;base64," + base64.b64encode(open(os.path.join(FX, "t800x600.png"), "rb").read() + b"\0" * 1700000).decode()
s, h, d, raw = describe("10.0.0.1", image=big); check("> 1.5 MB image -> 413 too_large", s == 413 and d.get("error") == "too_large", (s, raw[:200]))
s, h, b = req("/api/ai/describe", raw=b'{"mode":"describe","image":"' + b"A" * 2400000 + b'"}', ip="10.0.0.1"); check("> 2.2 MB body -> 413 too_large", s == 413 and J(b).get("error") == "too_large", (s, b[:200]))
s, h, d, raw = describe("10.0.0.1", turnstile=""); check("missing Turnstile token -> 403 turnstile", s == 403 and d.get("error") == "turnstile", (s, raw[:200]))
s, h, d, raw = describe("10.0.0.1", origin="https://evil.example"); check("POST from foreign origin -> 403 origin", s == 403 and d.get("error") == "origin", (s, raw[:200]))
check("validation failures never reached the model", mock("/__last")["count"] == n0, mock("/__last")["count"])
s, h, b = req("/api/ai/health", ip="10.0.0.1"); check("validation failures did not use the IP's quota (remaining 15)", J(b).get("remaining") == 15, J(b))

# upstream failures: 503 unavailable, nothing leaked, use refunded
mock("/__next", {"status": 500}); s, h, d, raw = describe("10.0.0.1")
check("upstream 500 -> 503 unavailable", s == 503 and d.get("error") == "unavailable", (s, raw[:200]))
check("upstream error text is not leaked", b"UPSTREAM-SECRET" not in raw and b"mock" not in raw, raw[:300])
mock("/__next", {"bad_json": True}); s, h, d, raw = describe("10.0.0.1"); check("unparseable model output -> 503 unavailable", s == 503 and d.get("error") == "unavailable", (s, raw[:200]))
s, h, b = req("/api/ai/health", ip="10.0.0.1"); check("upstream/parse failures refunded the IP use (still 15)", J(b).get("remaining") == 15, J(b))
mock("/__next", {"refusal": True}); s, h, d, raw = describe("10.0.0.1"); check("model refusal -> 503 unavailable (counts as a use)", s == 503 and d.get("error") == "unavailable", (s, raw[:200]))
s, h, b = req("/api/ai/health", ip="10.0.0.1"); check("refusal consumed one use (14)", J(b).get("remaining") == 14, J(b))

# per-IP cap: 14 more successes, then 429   (calls so far billed: 5 ok + bad_json + refusal = 7 x 325 = 2,275 micro)
codes = [describe("10.0.0.1")[0] for _ in range(14)]
check("calls up to 20 succeed", all(c == 200 for c in codes), codes)
s, h, d, raw = describe("10.0.0.1"); check("21st call -> 429 daily_limit, remaining 0, resets", s == 429 and d.get("error") == "daily_limit" and d.get("remaining") == 0 and d.get("resets"), (s, raw[:200]))
s, h, b = req("/api/ai/health", ip="10.0.0.1"); check("health remaining 0 for that IP, another IP still 20", J(b).get("remaining") == 0 and J(req("/api/ai/health", ip="10.0.0.2")[2]).get("remaining") == 20, J(b))

# global kill-switch: budget $0.01 = 10,000 micro; spent 21 x 325 = 6,825 -> 10 more calls reach 10,075
codes = [describe("10.0.0.%d" % (3 + i // 5))[0] for i in range(10)]
check("calls from other IPs succeed until the budget is reached", all(c == 200 for c in codes), codes)
s, h, d, raw = describe("10.0.0.9"); check("budget reached -> 503 budget with the friendly message", s == 503 and d.get("error") == "budget" and "used up" in d.get("message", ""), (s, raw[:200]))
n1 = mock("/__last")["count"]; describe("10.0.0.10"); check("kill-switch blocks BEFORE the upstream call", mock("/__last")["count"] == n1)
s, h, b = req("/api/ai/health", ip="10.0.0.11"); d = J(b); check("health ai:false, budget_ok:false after the kill-switch", d.get("ai") is False and d.get("budget_ok") is False, d)

# existing routes unaffected
s, h, b = req("/api/feed?limit=2", origin=None); check("/api/feed still 200 JSON", s == 200 and "items" in J(b), (s, b[:200]))
def rpc(base, method, params=None):
    r = urllib.request.Request(base.rstrip("/") + "/inspiration/mcp", data=json.dumps({"jsonrpc": "2.0", "id": 1, "method": method, "params": params or {}}).encode(),
        headers={"Content-Type": "application/json", "Accept": "application/json, text/event-stream", "User-Agent": "curl/8.4.0", "MCP-Protocol-Version": "2025-06-18"})
    return urllib.request.urlopen(r, timeout=120).read()
tl = rpc(args.base, "tools/list"); nt = len(json.loads(tl)["result"]["tools"])
check("MCP tools/list still answers (no new MCP tools in b60)", nt >= 60, nt)
if args.baseline_base:
    btl = rpc(args.baseline_base, "tools/list")
    check(f"MCP tools/list byte-identical to the baseline ({nt} tools, {len(tl):,} bytes)", tl == btl, (len(tl), len(btl)))
    ini = lambda b: json.loads(rpc(b, "initialize", {"protocolVersion": "2025-06-18", "capabilities": {}, "clientInfo": {"name": "rpc_ai", "version": "1"}}))["result"]
    check("MCP initialize instructions identical to the baseline", ini(args.base).get("instructions") == ini(args.baseline_base).get("instructions"))
    for name, a in [("count_characters", {"text": "Made Good Designs b60 AI tools"}), ("diff_text", {"a": "alpha beta", "b": "alpha gamma"}), ("convert_text_case", {"text": "Made Good Designs", "case": "snake"})]:
        x, y = rpc(args.base, "tools/call", {"name": name, "arguments": a}), rpc(args.baseline_base, "tools/call", {"name": name, "arguments": a})
        check(f"MCP {name} output identical to the baseline", x == y, (x[:200], y[:200]))
    s1, _, f1 = req("/api/feed?limit=3", origin=None); s2, _, f2 = req("/api/feed?limit=3", origin=None, base=args.baseline_base)
    check("/api/feed identical to the baseline", s1 == s2 == 200 and f1 == f2, (s1, s2))
print(f"\n{ok} passed, {fail} failed"); sys.exit(1 if fail else 0)
