"""Local mock of the Anthropic Messages API for the b60 AI tools (no network, no key, no spend).
  python3 tests/ai_mock_server.py 8862
POST /v1/messages  -> checks the request shape the Worker sends (headers, model, image block, json_schema, effort) and returns a canned
                      Messages response with fixed usage (1,500 in / 350 out) and schema-valid JSON for the mode (picked from the system prompt).
                      A malformed request gets HTTP 400 {"mock_error": [...]} so rpc_ai.py sees it as an upstream failure.
POST /__next {"status":500} | {"bad_json":true} | {"refusal":true}  -> the NEXT /v1/messages answer is that failure (one shot).
GET  /__last  -> {"count", "problems", "headers": {...without key value...}, "body_keys", "media_type", "has_image"} of the last call."""
import json, sys
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
NEXT, LAST, COUNT = {}, {}, [0]
OUT = {
    "describe": {"title": "Brick red square", "description": "A flat brick-red square fills the frame.", "subjects": ["square"], "colors": [{"name": "Brick red", "hex": "#c85028"}], "style": "flat colour field", "mood": "bold, warm", "text_in_image": ""},
    "alt": {"alt": "Flat brick-red square on a plain background", "long_description": "A single flat brick-red square fills the frame with no other detail.", "decorative": False},
    "prompt": {"prompt": "A flat brick-red square filling the frame, even studio lighting, minimal colour field", "negative_prompt": "text, watermark, noise", "tags": ["red", "square", "minimal"], "aspect_ratio": "4:3", "style_keywords": ["minimal", "flat"]},
}
def mode_of(system):
    return "alt" if "alternative text" in system else "prompt" if "text-to-image prompt" in system else "describe"
class H(BaseHTTPRequestHandler):
    def log_message(self, *a): pass
    def send(self, code, obj):
        b = json.dumps(obj).encode(); self.send_response(code); self.send_header("content-type", "application/json"); self.send_header("content-length", str(len(b))); self.end_headers(); self.wfile.write(b)
    def do_GET(self):
        if self.path == "/__last": return self.send(200, LAST)
        self.send(404, {})
    def do_POST(self):
        n = int(self.headers.get("content-length") or 0); raw = self.rfile.read(n)
        if self.path == "/__next": NEXT.clear(); NEXT.update(json.loads(raw or b"{}")); return self.send(200, {"ok": True})
        if self.path != "/v1/messages": return self.send(404, {})
        COUNT[0] += 1; p = []
        try: body = json.loads(raw)
        except Exception: body = {}; p.append("body not JSON")
        h = {k.lower(): v for k, v in self.headers.items()}
        if not h.get("x-api-key"): p.append("no x-api-key")
        if h.get("anthropic-version") != "2026-10-21": p.append("anthropic-version " + str(h.get("anthropic-version")))
        if "application/json" not in h.get("content-type", ""): p.append("content-type")
        if body.get("model") != "claude-haiku-5-5": p.append("model " + str(body.get("model")))
        if not isinstance(body.get("max_tokens"), int) or body["max_tokens"] > 2000: p.append("max_tokens")
        for k in ("temperature", "top_p", "top_k", "thinking"):
            if k in body: p.append("unexpected " + k)
        oc = body.get("output_config") or {}
        if oc.get("effort") != "low": p.append("effort")
        fmt = oc.get("format") or {}
        if fmt.get("type") != "json_schema" or not isinstance(fmt.get("schema"), dict): p.append("format")
        msgs = body.get("messages") or []; c = (msgs[0].get("content") if msgs else None) or []
        img = c[0] if c else {}
        src = img.get("source") or {}
        if img.get("type") != "image" or src.get("type") != "base64" or src.get("media_type") not in ("image/jpeg", "image/png", "image/webp") or len(src.get("data", "")) < 50: p.append("image block")
        if len(c) < 2 or c[1].get("type") != "text": p.append("text block")
        if not isinstance(body.get("system"), str) or "JSON" not in body.get("system", ""): p.append("system")
        LAST.clear(); LAST.update({"count": COUNT[0], "problems": p, "headers": {k: ("<set>" if k == "x-api-key" else v) for k, v in h.items() if k in ("x-api-key", "anthropic-version", "content-type")},
                                   "body_keys": sorted(body.keys()), "media_type": src.get("media_type"), "has_image": img.get("type") == "image", "mode": mode_of(body.get("system", ""))})
        if p: return self.send(400, {"type": "error", "error": {"type": "invalid_request_error", "message": "mock: " + "; ".join(p)}})
        nx = dict(NEXT); NEXT.clear()
        if nx.get("status"): return self.send(int(nx["status"]), {"type": "error", "error": {"type": "api_error", "message": "UPSTREAM-SECRET-TEXT do not leak"}})
        usage = {"input_tokens": 1500, "output_tokens": 350, "cache_creation_input_tokens": 0, "cache_read_input_tokens": 0}
        m = mode_of(body["system"])
        text = "{not valid json" if nx.get("bad_json") else json.dumps(OUT[m])
        stop = "refusal" if nx.get("refusal") else "end_turn"
        self.send(200, {"id": "msg_mock", "type": "message", "role": "assistant", "model": "claude-haiku-5-5", "stop_reason": stop,
                        "content": [{"type": "thinking", "thinking": "", "signature": "x"}, {"type": "text", "text": text}], "usage": usage})
if __name__ == "__main__":
    ThreadingHTTPServer(("127.0.0.1", int(sys.argv[1]) if len(sys.argv) > 1 else 8862), H).serve_forever()
