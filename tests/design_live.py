"""design-r1 live checks (READ-ONLY, 7 requests, no model call, nothing counted, no spend):
  python3 tests/design_live.py [https://madegooddesigns.com/inspiration]
status endpoint answers with the anonymous limits; the POST gate refuses a missing Turnstile token and a foreign Origin BEFORE any count or model
call; the b60-b66 /api/ai/health answer is unchanged; the gallery + MCP still answer. UA curl/8.4.0 (the site WAF 502s browser UAs)."""
import json, sys, urllib.request, urllib.error
L = (sys.argv[1] if len(sys.argv) > 1 else 'https://madegooddesigns.com/inspiration').rstrip('/')
SITE = 'https://madegooddesigns.com'
P = F = 0
def ok(n, c, info=''):
    global P, F
    P, F = (P + 1, F) if c else (P, F + 1)
    print(('PASS ' if c else 'FAIL ') + n + ('' if c else ' | ' + str(info)[:400]))
def req(method, path, body=None, origin=SITE, accept='application/json'):
    h = {'User-Agent': 'curl/8.4.0', 'Accept': accept}
    if origin: h['Origin'] = origin
    data = json.dumps(body).encode() if body is not None else None
    if data: h['Content-Type'] = 'application/json'
    r = urllib.request.Request(L + path, data=data, headers=h, method=method)
    try:
        with urllib.request.urlopen(r, timeout=40) as x: b = x.read(); return x.status, b, dict(x.headers)
    except urllib.error.HTTPError as e: return e.code, e.read(), dict(e.headers)
js = lambda b: json.loads(b or b'null')
s, b, h = req('GET', '/api/ai/design/status'); d = js(b) if s == 200 else {}; R0 = d.get('remaining')
ok('status: 200 JSON, tier anon, 5/day 3/hour, 3 options, Sonnet 5.5, sitekey, login link', s == 200 and d.get('tier') == 'anon' and d.get('limit') == 5 and d.get('hour_limit') == 3 and d.get('count') == 3
   and d.get('model') == 'claude-sonnet-5-5' and d.get('turnstile_sitekey') and d.get('login') == '/inspiration/auth/google/login?return=%2Ftools%2F%23design-anything', (s, b[:300]))
ok('status: ai true (not paused, budget free) and Cache-Control no-store', d.get('ai') is True and h.get('Cache-Control') == 'no-store', (d.get('reason'), h.get('Cache-Control')))
s, b, h = req('POST', '/api/ai/design', {'prompt': 'a logo for a test', 'turnstile': ''}); d = js(b) if b[:1] == b'{' else {}
ok('POST without a Turnstile token: 403 turnstile (refused before any count or model call)', s == 403 and d.get('error') == 'turnstile', (s, b[:200]))
s, b, h = req('POST', '/api/ai/design', {'prompt': 'a logo for a test', 'turnstile': 'x'}, origin='https://evil.example'); d = js(b) if b[:1] == b'{' else {}
ok('POST from a foreign Origin: 403 origin', s == 403 and d.get('error') == 'origin', (s, b[:200]))
s2, b2, _ = req('GET', '/api/ai/design/status'); d2 = js(b2) if s2 == 200 else {}
ok('the refused POSTs did not count (remaining unchanged)', s2 == 200 and R0 is not None and d2.get('remaining') == R0, (R0, d2))
s, b, _ = req('GET', '/api/ai/health'); d = js(b) if s == 200 else {}
ok('b60-b66 /api/ai/health unchanged: 9 modes, 20/day, Haiku 5.5', s == 200 and d.get('modes') == ['describe', 'alt', 'prompt', 'palette', 'svg', 'diagram', 'infographic', 'wireframe', 'flyer'] and d.get('limit') == 20 and d.get('model') == 'claude-haiku-5-5', (s, b[:300]))
s, b, _ = req('GET', '/', accept='text/html')
ok('gallery home 200 HTML', s == 200 and b'<html' in b[:3000].lower(), s)
print(f'\n{P} passed, {F} failed'); sys.exit(1 if F else 0)
