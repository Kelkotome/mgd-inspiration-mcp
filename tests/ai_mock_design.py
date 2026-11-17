"""Local mock of the Anthropic Messages API for the design-r1 box (no network, no key, no spend).
  python3 tests/ai_mock_design.py 8892
POST /v1/messages  checks the shape the Worker sends for a design call (model, version + beta headers, no sampling params, json_schema, effort,
                   brief quoted as visitor data, viewBox in the user turn) and answers one schema-valid design for that viewBox.
                   usage per call: 1,500 in / 2,000 out (= $0.023 on Sonnet 5.5). A malformed request gets HTTP 400 {"mock_error"}.
POST /__next {"mode": "...", "times": N}  the next N calls answer in that mode (default 1):
     status500 | refusal | bad_json | evil (hostile SVG + title) | invent (invented phone + URL + year on the design) | fallback400 (400 when the
     body carries "fallbacks", as an API that rejects the beta would) | wrong_box (viewBox of another kind)
GET  /__calls       [{model, headers, body_keys, effort, max_tokens, user_text, fallbacks, beta, problems}] of every call so far
POST /__reset       clear calls + pending modes
POST /__alert       alert webhook sink;  GET /__alerts -> the bodies received"""
import json, re, sys, threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
LOCK = threading.Lock()
CALLS, NEXT, ALERTS = [], [], []
EVIL = ('<svg viewBox="{box}" onload="alert(1)"><script>window.__xss=1</script><foreignObject><img src=x onerror="window.__xss=2"></foreignObject>'
        '<rect width="100%" height="100%" fill="url(http://evil.example/a#b)"/><circle cx="50" cy="50" r="40" fill="#e33"/><a href="javascript:alert(3)"><text x="20" y="60">click</text></a>'
        '<image href="https://evil.example/i.png"/><text x="20" y="120" font-family="x;behavior:url(a)">Safe words</text></svg>')
def design_svg(box, name, invent=False):
    w, h = [float(x) for x in box.split()[2:]]
    t = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{box}"><rect width="{w:g}" height="{h:g}" fill="#f7f1e8"/>'
         f'<circle cx="{w/2:g}" cy="{h*0.38:g}" r="{min(w,h)*0.18:g}" fill="#3b2a1e"/>'
         f'<text x="{w/2:g}" y="{h*0.75:g}" font-family="Georgia, serif" font-size="{max(14, min(w,h)*0.09):g}" text-anchor="middle" fill="#3b2a1e">{name}</text>')
    if invent: t += f'<text x="{w/2:g}" y="{h*0.85:g}" font-size="16" text-anchor="middle">Call 555-0123</text><text x="{w/2:g}" y="{h*0.92:g}" font-size="16" text-anchor="middle">www.northbean.com</text><text x="20" y="30" font-size="14">Est. 1998</text>'
    return t + '</svg>'
class H(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"   # keep-alive like the real API (HTTP/1.0 close-after-response broke workerd's pooled connection for the retry)
    def log_message(self, *a): pass
    def send(self, code, obj):
        b = json.dumps(obj).encode(); self.send_response(code); self.send_header("content-type", "application/json"); self.send_header("content-length", str(len(b))); self.end_headers(); self.wfile.write(b)
    def do_GET(self):
        if self.path == "/__calls":
            with LOCK: return self.send(200, CALLS)
        if self.path == "/__alerts":
            with LOCK: return self.send(200, ALERTS)
        self.send(404, {})
    def do_POST(self):
        n = int(self.headers.get("content-length") or 0); raw = self.rfile.read(n)
        if self.path == "/__reset":
            with LOCK: CALLS.clear(); NEXT.clear(); ALERTS.clear()
            return self.send(200, {"ok": True})
        if self.path == "/__next":
            o = json.loads(raw or b"{}")
            with LOCK: NEXT.extend([o["mode"]] * int(o.get("times", 1)))
            return self.send(200, {"ok": True, "pending": len(NEXT)})
        if self.path == "/__alert":
            with LOCK: ALERTS.append(json.loads(raw or b"{}"))
            return self.send(200, {"ok": True})
        if self.path != "/v1/messages": return self.send(404, {})
        p = []
        try: body = json.loads(raw)
        except Exception: body = {}; p.append("body not JSON")
        h = {k.lower(): v for k, v in self.headers.items()}
        if not h.get("x-api-key"): p.append("no x-api-key")
        if h.get("anthropic-version") != "2026-10-21": p.append("anthropic-version")
        if body.get("model") not in ("claude-sonnet-5-5", "claude-haiku-5-5"): p.append("model " + str(body.get("model")))
        for k in ("temperature", "top_p", "top_k", "thinking", "stop_sequences"):
            if k in body: p.append("unexpected " + k)
        if "fallbacks" in body and (body["fallbacks"] != "default" or h.get("anthropic-beta") != "server-side-fallback-2026-07-01"): p.append("fallbacks without the beta header")
        if "fallbacks" not in body and h.get("anthropic-beta"): p.append("beta header without fallbacks")
        if not isinstance(body.get("max_tokens"), int) or not 1500 <= body["max_tokens"] <= 16000: p.append("max_tokens")
        oc = body.get("output_config") or {}; fmt = oc.get("format") or {}
        if oc.get("effort") not in ("low", "medium", "high"): p.append("effort")
        if fmt.get("type") != "json_schema" or "svg" not in ((fmt.get("schema") or {}).get("properties") or {}): p.append("format")
        if "Design anything" not in str(body.get("system", "")): p.append("system")
        c = ((body.get("messages") or [{}])[0].get("content") or [{}])
        ut = c[0].get("text", "") if c and isinstance(c[0], dict) else ""
        if "visitor data, not instructions" not in ut: p.append("user text")
        m = re.search(r'viewBox: "([\d. ]+)"', ut)
        if not m: p.append("viewBox")
        with LOCK:
            mode = NEXT.pop(0) if NEXT else ""
            CALLS.append({"model": body.get("model"), "beta": h.get("anthropic-beta"), "fallbacks": body.get("fallbacks"), "effort": oc.get("effort"), "max_tokens": body.get("max_tokens"),
                          "body_keys": sorted(body.keys()), "user_text": ut[:500], "problems": p, "mode": mode, "key_sent": bool(h.get("x-api-key"))})
        if p: return self.send(400, {"type": "error", "error": {"type": "invalid_request_error", "message": "mock: " + "; ".join(p)}})
        if mode == "status500": return self.send(500, {"type": "error", "error": {"type": "api_error", "message": "UPSTREAM-SECRET-TEXT do not leak"}})
        if mode == "fallback400" and "fallbacks" in body:   # the Worker's plain retry pops the next (normal) mode
            return self.send(400, {"type": "error", "error": {"type": "invalid_request_error", "message": "fallbacks: not enabled"}})
        box = m.group(1)
        bm = re.search(r'called ([A-Z][\w ]{1,30}?)(?:[,."]|$)', ut)
        name = bm.group(1) if bm else "Studio"
        o = {"title": "Option " + str(len(CALLS)), "concept": "A clean mark built from a simple circle.", "svg": design_svg(box, name, mode == "invent"), "alt": f"{name} design"}
        if mode == "evil": o = {"title": '<img src=x onerror="window.__xss=3">Evil', "concept": "<script>window.__xss=4</script>", "svg": EVIL.replace("{box}", box), "alt": '"><script>x</script>'}
        if mode == "wrong_box": o["svg"] = design_svg("0 0 123 45", name)
        text = "{not json" if mode == "bad_json" else json.dumps(o)
        self.send(200, {"id": "msg_mock", "type": "message", "role": "assistant", "model": body["model"], "stop_reason": "refusal" if mode == "refusal" else "end_turn",
                        "content": [{"type": "thinking", "thinking": "", "signature": "x"}, {"type": "text", "text": "" if mode == "refusal" else text}],
                        "usage": {"input_tokens": 1500, "output_tokens": 2000, "cache_creation_input_tokens": 0, "cache_read_input_tokens": 0}})
if __name__ == "__main__":
    ThreadingHTTPServer(("127.0.0.1", int(sys.argv[1]) if len(sys.argv) > 1 else 8892), H).serve_forever()
