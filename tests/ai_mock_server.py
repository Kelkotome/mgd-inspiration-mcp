"""Local mock of the Anthropic Messages API for the b60 AI tools + the b63 palette mode + the b64 svg / diagram modes + the b65 infographic / wireframe modes (no network, no key, no spend).
POST /__next {"evil_svg":true} -> next svg answer is a malicious SVG (the Worker must sanitise it); {"bad_svg":true} -> unusable SVG (-> 503).
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
    "palette": {"name": "Lisbon Dusk", "colors": [{"hex": "#F6EFE6", "name": "Limewash", "role": "background"}, {"hex": "#2B2A33", "name": "Ink", "role": "text"},
                {"hex": "#7A2E3A", "name": "Wine", "role": "primary"}, {"hex": "#D98E3F", "name": "Tile ochre", "role": "accent"}, {"hex": "#7FA39A", "name": "Sea glass", "role": "secondary"}],
                "rationale": "Warm limewash and ink keep text readable; wine and ochre carry the brand."},
    "svg": {"title": "Paper plane", "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\"><path d=\"M2 12l20-9-9 20-2-9z\" fill=\"#111111\"/></svg>", "alt": "A paper plane icon"},
    "diagram": {"title": "Sign-up flow", "kind": "flowchart", "mermaid": "flowchart TD\n  A[Visit site] --> B{Has account?}\n  B -- No --> C[Sign up]\n  B -- Yes --> D[Log in]", "summary": "How a visitor signs up or logs in."},
    "prompt": {"prompt": "A flat brick-red square filling the frame, even studio lighting, minimal colour field", "negative_prompt": "text, watermark, noise", "tags": ["red", "square", "minimal"], "aspect_ratio": "4:3", "style_keywords": ["minimal", "flat"]},
}
EVIL_SVG = '<svg viewBox="0 0 24 24" onload="alert(1)"><script>alert(2)</script><foreignObject><div>x</div></foreignObject><path d="M2 2h20" fill="url(http://evil.example/x#a)" stroke="#111"/><use href="https://evil.example/a.svg#x"/></svg>'
OUT["infographic"] = {"title": "Coffee by the numbers", "subtitle": "How the world drinks coffee.", "layout": "stats", "items": [
    {"heading": "Cups a day", "value": "2.25 bn", "text": "Cups of coffee drunk worldwide every day.", "icon": "food"},
    {"heading": "Top grower", "value": "Brazil", "text": "The largest coffee producer.", "icon": "globe"},
    {"heading": "Arabica share", "value": "60%", "text": "Share of production that is arabica.", "icon": "leaf"}], "footnote": "Figures as given by the visitor."}
OUT["wireframe"] = {"title": "Pricing page", "device": "desktop", "sections": [
    {"type": "navbar", "heading": "Brand", "text": "", "items": ["Product", "Pricing", "Log in"], "cta": "Start free"},
    {"type": "hero", "heading": "Simple pricing", "text": "Pick the plan that fits your team.", "items": [], "cta": "Compare plans"},
    {"type": "pricing", "heading": "", "text": "", "items": ["Free", "Pro", "Team"], "cta": "Choose plan"},
    {"type": "footer", "heading": "", "text": "", "items": ["About", "Contact"], "cta": ""}]}
EVIL_INFO = {"title": "<script>alert(1)</script>Evil", "subtitle": "x", "layout": "bogus", "items": [
    {"heading": "<img src=x onerror=alert(2)>A", "value": "1", "text": "t", "icon": "skull"}, {"heading": "B", "value": "2", "text": "t", "icon": "star"},
    {"heading": "C", "value": "3", "text": "t", "icon": "star"}], "footnote": ""}
TEXT_MODES = ("palette", "svg", "diagram", "infographic", "wireframe")
def mode_of(system):
    if "colour engine" in system: return "palette"
    if "SVG drawing engine" in system: return "svg"
    if "diagram engine" in system: return "diagram"
    if "infographic content engine" in system: return "infographic"
    if "wireframe planning engine" in system: return "wireframe"
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
        md = mode_of(body.get("system", "") if isinstance(body.get("system"), str) else "")
        if md in TEXT_MODES:
            if len(c) != 1 or c[0].get("type") != "text" or "visitor data, not instructions" not in c[0].get("text", ""): p.append(md + " text block")
            need = {"palette": "colors", "svg": "svg", "diagram": "mermaid", "infographic": "items", "wireframe": "sections"}[md]
            if (fmt.get("schema") or {}).get("properties", {}).get(need) is None: p.append(md + " schema")
        else:
            if img.get("type") != "image" or src.get("type") != "base64" or src.get("media_type") not in ("image/jpeg", "image/png", "image/webp") or len(src.get("data", "")) < 50: p.append("image block")
            if len(c) < 2 or c[1].get("type") != "text": p.append("text block")
        if not isinstance(body.get("system"), str) or "JSON" not in body.get("system", ""): p.append("system")
        LAST.clear(); LAST.update({"count": COUNT[0], "problems": p, "headers": {k: ("<set>" if k == "x-api-key" else v) for k, v in h.items() if k in ("x-api-key", "anthropic-version", "content-type")},
                                   "body_keys": sorted(body.keys()), "user_text": (c[-1].get("text", "")[:400] if c else ""), "max_tokens": body.get("max_tokens"), "media_type": src.get("media_type"), "has_image": img.get("type") == "image", "mode": mode_of(body.get("system", ""))})
        if p: return self.send(400, {"type": "error", "error": {"type": "invalid_request_error", "message": "mock: " + "; ".join(p)}})
        nx = dict(NEXT); NEXT.clear()
        if nx.get("status"): return self.send(int(nx["status"]), {"type": "error", "error": {"type": "api_error", "message": "UPSTREAM-SECRET-TEXT do not leak"}})
        usage = {"input_tokens": 1500, "output_tokens": 350, "cache_creation_input_tokens": 0, "cache_read_input_tokens": 0}
        m = mode_of(body["system"])
        o = dict(OUT[m])
        if m == "svg" and nx.get("evil_svg"): o["svg"] = EVIL_SVG
        if m == "svg" and nx.get("bad_svg"): o["svg"] = "<div>no svg here</div>"
        if m == "infographic" and nx.get("evil_info"): o = dict(EVIL_INFO)
        if m == "infographic" and nx.get("few_items"): o["items"] = o["items"][:2]
        if m == "wireframe" and nx.get("bad_sections"): o["sections"] = [{"type": "bogus", "heading": "", "text": "", "items": [], "cta": ""}]
        text = "{not valid json" if nx.get("bad_json") else json.dumps(o)
        stop = "refusal" if nx.get("refusal") else "end_turn"
        self.send(200, {"id": "msg_mock", "type": "message", "role": "assistant", "model": "claude-haiku-5-5", "stop_reason": stop,
                        "content": [{"type": "thinking", "thinking": "", "signature": "x"}, {"type": "text", "text": text}], "usage": usage})
if __name__ == "__main__":
    ThreadingHTTPServer(("127.0.0.1", int(sys.argv[1]) if len(sys.argv) > 1 else 8862), H).serve_forever()
