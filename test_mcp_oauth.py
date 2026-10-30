#!/usr/bin/env python3
"""End-to-end test of the authenticated MCP endpoint (/inspiration/mcp/boards) + OAuth 2.1 AS,
against a LOCAL `wrangler dev --local` (DEV_LOGIN=1 stands in for Google).

  python3 test_mcp_oauth.py --base http://localhost:8797 [--baseline-file public_mcp_orig.json]
  python3 test_mcp_oauth.py --base http://localhost:8798 --snapshot-out public_mcp_orig.json

--snapshot-out = only record the public /mcp responses (run against the ORIGINAL worker).
--baseline-file = compare the new worker's public /mcp responses byte-for-byte with that record.
Requires seeded items aaaaaaaaaaa1 (design), aaaaaaaaaaa2 (annual-report), bbbbbbbbbbb1
(private item owned by another user) — run_local_tests.sh does all of this.
Never prints token values.
"""
import argparse, base64, hashlib, http.client, json, os, re, secrets, sys, urllib.parse

ap = argparse.ArgumentParser()
ap.add_argument("--base", default="http://localhost:8797")
ap.add_argument("--baseline-file", default=None)
ap.add_argument("--snapshot-out", default=None)
args = ap.parse_args()
ORIGIN = args.base.rstrip("/")
P = "/inspiration"
ISSUER = ORIGIN + P
RESOURCE = ISSUER + "/mcp/boards"
MCP_ME = P + "/mcp/boards"
UA = "mgd-oauth-test/1.0"

RESULTS = []
def check(name, cond, detail=""):
    RESULTS.append((name, bool(cond)))
    print(("PASS " if cond else "FAIL ") + name + ("" if cond or not detail else f"  -- {detail}"))
    return bool(cond)

def req(method, path, headers=None, body=None, origin=ORIGIN):
    u = urllib.parse.urlsplit(origin + path if path.startswith("/") else path)
    c = http.client.HTTPConnection(u.hostname, u.port or 80, timeout=30)
    h = {"User-Agent": UA, "Accept": "application/json, text/event-stream, text/html, */*"}
    h.update(headers or {})
    if isinstance(body, (dict, list)):
        body = json.dumps(body); h.setdefault("Content-Type", "application/json")
    elif isinstance(body, str) and "Content-Type" not in h:
        h["Content-Type"] = "application/x-www-form-urlencoded"
    c.request(method, urllib.parse.urlunsplit(("", "", u.path, u.query, "")), body=body, headers=h)
    r = c.getresponse(); data = r.read().decode("utf-8", "replace")
    hdrs = {}
    for k, v in r.getheaders():
        hdrs.setdefault(k.lower(), []).append(v)
    c.close()
    return r.status, hdrs, data

def hget(h, k): return (h.get(k.lower()) or [""])[0]
def form(d): return urllib.parse.urlencode(d)
def jl(s):
    try: return json.loads(s)
    except Exception: return None

def pkce():
    v = base64.urlsafe_b64encode(secrets.token_bytes(32)).rstrip(b"=").decode()
    ch = base64.urlsafe_b64encode(hashlib.sha256(v.encode()).digest()).rstrip(b"=").decode()
    return v, ch

def rpc(path, method, params=None, token=None, rid=1, origin=ORIGIN):
    h = {"MCP-Protocol-Version": "2025-06-18"}
    if token: h["Authorization"] = "Bearer " + token
    msg = {"jsonrpc": "2.0", "id": rid, "method": method}
    if params is not None: msg["params"] = params
    return req("POST", path, h, msg, origin=origin)

def call(token, tool, arguments=None):
    s, h, b = rpc(MCP_ME, "tools/call", {"name": tool, "arguments": arguments or {}}, token)
    j = jl(b) or {}
    res = j.get("result") or {}
    text = "".join(c.get("text", "") for c in res.get("content", []))
    return s, res, text

def dev_login(email, ret=None):
    q = {"email": email}
    if ret: q["return"] = ret
    s, h, _ = req("GET", P + "/auth/dev-login?" + form(q))
    cookie = None
    for sc in h.get("set-cookie", []):
        if sc.startswith("mgd_sess="): cookie = sc.split(";")[0]
    return s, hget(h, "location"), cookie

def register(redirect_uris, method="none", name="Test MCP Client"):
    return req("POST", P + "/oauth/register", body={"client_name": name, "redirect_uris": redirect_uris,
        "token_endpoint_auth_method": method, "grant_types": ["authorization_code", "refresh_token"], "response_types": ["code"]})

def authz_params(client_id, redirect, challenge, state="st-123", scope="boards:read boards:write", method="S256", resource=RESOURCE):
    p = {"response_type": "code", "client_id": client_id, "redirect_uri": redirect, "state": state,
         "code_challenge": challenge, "code_challenge_method": method, "scope": scope}
    if resource: p["resource"] = resource
    return p

def consent_form(html):
    return dict(re.findall(r'<input type="hidden" name="([^"]+)" value="([^"]*)">', html))

def unesc(s): return s.replace("&amp;", "&").replace("&quot;", '"').replace("&#39;", "'").replace("&lt;", "<").replace("&gt;", ">")

def get_code(cookie, client_id, redirect, challenge, scope="boards:read boards:write", state="st-123"):
    s, h, b = req("GET", P + "/oauth/authorize?" + form(authz_params(client_id, redirect, challenge, state, scope)), {"Cookie": cookie})
    if s != 200: return None, (s, b[:200])
    f = {k: unesc(v) for k, v in consent_form(b).items()}
    f["action"] = "approve"
    s, h, b = req("POST", P + "/oauth/authorize", {"Cookie": cookie, "Origin": ORIGIN}, form(f))
    loc = hget(h, "location")
    q = dict(urllib.parse.parse_qsl(urllib.parse.urlsplit(loc).query))
    return q.get("code"), (s, loc, q)

def exchange(client_id, code, verifier, redirect, extra=None, headers=None):
    d = {"grant_type": "authorization_code", "code": code, "code_verifier": verifier, "client_id": client_id, "redirect_uri": redirect, "resource": RESOURCE}
    d.update(extra or {})
    s, h, b = req("POST", P + "/oauth/token", headers or {}, form(d))
    return s, jl(b) or {}, h

def full_flow(cookie, client_id, redirect, scope="boards:read boards:write"):
    v, ch = pkce()
    code, _ = get_code(cookie, client_id, redirect, ch, scope)
    s, tok, _ = exchange(client_id, code, v, redirect)
    return tok if s == 200 else None

print(f"== target {ORIGIN}  (issuer {ISSUER})")

# ---------------------------------------------------------------- public /mcp (unchanged)
print("\n-- public /mcp backward compatibility")
PUBLIC_CALLS = [
    ("GET", None, None),
    ("POST", "initialize", {"protocolVersion": "2025-06-18", "capabilities": {}, "clientInfo": {"name": "t", "version": "1"}}),
    ("POST", "tools/list", {}),
    ("POST", "tools/call", {"name": "search_design_inspiration", "arguments": {"query": "serif"}}),
    ("POST", "tools/call", {"name": "list_inspiration_themes", "arguments": {}}),
    ("POST", "tools/call", {"name": "browse_inspiration_by_theme", "arguments": {"theme": "retro"}}),
    ("POST", "tools/call", {"name": "search_annual_reports", "arguments": {"query": "Acme"}}),
    ("POST", "ping", {}),
    ("POST", "nope/unknown", {}),
]
def public_snapshot(origin):
    out = []
    for m, meth, params in PUBLIC_CALLS:
        if m == "GET":
            s, h, b = req("GET", P + "/mcp", origin=origin)
        else:
            s, h, b = rpc(P + "/mcp", meth, params, origin=origin)
        out.append((s, hget(h, "content-type"), hget(h, "access-control-allow-origin"), b))
    s, h, b = req("POST", P + "/mcp", body=[{"jsonrpc": "2.0", "id": 1, "method": "ping"}, {"jsonrpc": "2.0", "method": "notifications/initialized"}], origin=origin)
    out.append((s, b))
    s, h, b = req("POST", P + "/mcp", body={"jsonrpc": "2.0", "method": "notifications/initialized"}, origin=origin)
    out.append((s, b))
    s, h, b = req("OPTIONS", P + "/mcp", origin=origin)
    out.append((s, hget(h, "access-control-allow-headers")))
    return out

snap = public_snapshot(ORIGIN)
if args.snapshot_out:
    json.dump(snap, open(args.snapshot_out, "w"), indent=1); print(f"wrote {len(snap)} public /mcp responses to {args.snapshot_out}"); sys.exit(0)
tl = jl(snap[2][3])["result"]["tools"]
PUBLIC = ["search_design_inspiration", "list_inspiration_themes", "browse_inspiration_by_theme", "search_annual_reports", "search_museum_art", "get_share_feedback", "generate_website_color_palette", "generate_design_md"]
TOOL_CORES = ["style_text_unicode", "make_word_search", "generate_data_matrix", "convert_text_case", "search_ui_screens"]  # spot-check: b43, b44, b45, UI screens
check("public /mcp: no auth needed, tools/list = the 8 core public tools first, then the tool cores", snap[2][0] == 200 and [t["name"] for t in tl][:8] == PUBLIC and all(n in [t["name"] for t in tl] for n in TOOL_CORES))
PUBLIC = [t["name"] for t in tl]
check("public /mcp: search returns curated item + cites madegooddesigns.com", "Retro serif poster" in snap[3][3] and "https://madegooddesigns.com/inspiration" in snap[3][3])
check("public /mcp: output does NOT gain item_id lines", "item_id" not in snap[3][3] and "item_id" not in snap[6][3])
check("public /mcp: private user item never returned", "Private user item" not in snap[3][3])
s, h, b = rpc(P + "/mcp", "tools/list", {}, token="garbage-token")
check("public /mcp: a stray Authorization header is ignored (no 401)", s == 200 and "search_design_inspiration" in b)
if args.baseline_file:
    base_snap = [tuple(x) for x in json.load(open(args.baseline_file))]
    snap = [tuple(x) for x in json.loads(json.dumps(snap))]
    diffs = [i for i, (a, b2) in enumerate(zip(snap, base_snap)) if a != b2]
    check(f"public /mcp: byte-identical to ORIGINAL worker across {len(snap)} requests", not diffs, f"differs at {diffs}: {[ (snap[i], base_snap[i]) for i in diffs][:1]}")

# ---------------------------------------------------------------- discovery
print("\n-- discovery")
s, h, b = req("GET", "/.well-known/oauth-protected-resource/inspiration/mcp/boards"); prm = jl(b) or {}
check("PRM (RFC 9728 path-inserted) served", s == 200 and prm.get("resource") == RESOURCE and prm.get("authorization_servers") == [ISSUER], b[:200])
s, h, b = req("GET", P + "/.well-known/oauth-protected-resource");
check("PRM (under /inspiration) served", s == 200 and (jl(b) or {}).get("resource") == RESOURCE)
s, h, b = req("GET", "/.well-known/oauth-authorization-server/inspiration"); asm = jl(b) or {}
check("AS metadata (RFC 8414 path-inserted) issuer matches", s == 200 and asm.get("issuer") == ISSUER, b[:200])
check("AS metadata: S256 only, code flow, DCR + revocation endpoints", asm.get("code_challenge_methods_supported") == ["S256"] and asm.get("response_types_supported") == ["code"]
      and asm.get("registration_endpoint") == ISSUER + "/oauth/register" and asm.get("revocation_endpoint") == ISSUER + "/oauth/revoke")
s, h, b = req("GET", P + "/.well-known/oauth-authorization-server")
check("AS metadata (path-appended fallback) served", s == 200 and (jl(b) or {}).get("issuer") == ISSUER)
s, h, b = req("GET", "/.well-known/oauth-authorization-server")
check("root /.well-known/oauth-authorization-server NOT claimed (left to WordPress)", s == 404)
s, h, b = req("GET", "/.well-known/oauth-authorization-server/inspiration", {"Origin": "https://claude.ai"})
check("well-known docs have CORS *", hget(h, "access-control-allow-origin") == "*")

# ---------------------------------------------------------------- 401 challenge
print("\n-- 401 challenge")
s, h, b = rpc(MCP_ME, "initialize", {"protocolVersion": "2025-06-18"})
www = hget(h, "www-authenticate")
check("/mcp/boards without token -> 401", s == 401)
m = re.search(r'resource_metadata="([^"]+)"', www)
check("401 carries WWW-Authenticate: Bearer resource_metadata=...", www.startswith("Bearer ") and m is not None, www)
if m:
    s2, _, b2 = req("GET", m.group(1))
    check("resource_metadata URL resolves to PRM", s2 == 200 and (jl(b2) or {}).get("resource") == RESOURCE)
s, h, b = rpc(MCP_ME, "tools/list", {}, token="mgd_at_notarealtoken")
check("/mcp/boards with bogus token -> 401 error=invalid_token", s == 401 and 'error="invalid_token"' in hget(h, "www-authenticate"))
s, h, b = req("OPTIONS", MCP_ME, {"Origin": "https://claude.ai", "Access-Control-Request-Headers": "authorization,content-type"})
s2, h2, b2 = rpc(MCP_ME + "/", "tools/list", {})
check("trailing-slash /mcp/boards/ also challenges (not 404)", s2 == 401 and "resource_metadata=" in hget(h2, "www-authenticate"))
check("CORS preflight on /mcp/boards allows Authorization + exposes WWW-Authenticate", s == 204 and "authorization" in hget(h, "access-control-allow-headers").lower() and "WWW-Authenticate" in hget(h, "access-control-expose-headers"))

# ---------------------------------------------------------------- registration
print("\n-- dynamic client registration")
REDIR = "https://client.example/callback"
s, h, b = register([REDIR]); cl = jl(b) or {}
CID = cl.get("client_id")
check("register public client -> 201 + client_id, no secret", s == 201 and CID and "client_secret" not in cl, b[:200])
s, h, b = register(["http://localhost:33418/callback"], name="Loopback CLI")
check("register loopback http redirect allowed", s == 201)
for bad, label in [("javascript:alert(1)", "javascript:"), ("http://evil.example/cb", "non-loopback http"), ("https://client.example/cb#frag", "fragment"), ("data:text/html,x", "data:")]:
    s, h, b = register([bad])
    check(f"register rejects {label} redirect_uri", s == 400 and "invalid_redirect_uri" in b)
s, h, b = req("POST", P + "/oauth/register", body={"redirect_uris": [REDIR], "token_endpoint_auth_method": "client_secret_jwt"})
check("register rejects unsupported auth method", s == 400)
s, h, b = register([REDIR], method="client_secret_post", name="Confidential App"); conf = jl(b) or {}
check("register confidential client -> secret issued once", s == 201 and conf.get("client_secret", "").startswith("mgdcs_"))
s, h, b = register(["https://other.example/cb"], name="Other App"); OTHER = (jl(b) or {}).get("client_id")

# ---------------------------------------------------------------- authorize (login + consent)
print("\n-- authorize")
V1, C1 = pkce()
q = authz_params(CID, REDIR, C1)
s, h, b = req("GET", P + "/oauth/authorize?" + form(q))
loc = hget(h, "location")
check("authorize without session -> 302 to existing Google login with return=", s == 302 and loc.startswith(P + "/auth/google/login?return="), loc)
ret = dict(urllib.parse.parse_qsl(urllib.parse.urlsplit(loc).query)).get("return", "")
check("return= points back to /inspiration/oauth/authorize (same-origin path)", ret.startswith(P + "/oauth/authorize?"))
s, loc2, ALICE = dev_login("alice@example.com", ret)
check("dev login (stands in for Google) returns to the authorize URL", s == 302 and loc2 == ret and ALICE)
for evil in ["//evil.example/x", "/\\evil.example", "https://evil.example/"]:
    s, l, _ = dev_login("alice@example.com", evil)
    check(f"login return= open-redirect blocked ({evil!r})", l == P + "/", l)

s, h, b = req("GET", loc2, {"Cookie": ALICE})
check("consent screen rendered for signed-in user", s == 200 and "Test MCP Client" in b and "boards:write" in b and "client.example" in b)
check("consent screen anti-framing headers", hget(h, "x-frame-options") == "DENY" and "frame-ancestors 'none'" in hget(h, "content-security-policy"))
s, h, b = register([REDIR], name='<script>alert(1)</script>'); xss_id = (jl(b) or {}).get("client_id")
s, h, b = req("GET", P + "/oauth/authorize?" + form(authz_params(xss_id, REDIR, C1)), {"Cookie": ALICE})
check("client_name is HTML-escaped on consent", "<script>alert(1)</script>" not in b and "&lt;script&gt;" in b)

s, h, b = req("GET", loc2, {"Cookie": ALICE}); f = {k: unesc(v) for k, v in consent_form(b).items()}
f2 = dict(f, action="approve")
s, h, b = req("POST", P + "/oauth/authorize", {"Cookie": ALICE, "Origin": "https://evil.example"}, form(f2))
check("consent POST from foreign Origin rejected (CSRF)", s == 403 and not hget(h, "location"))
s, h, b = req("POST", P + "/oauth/authorize", {"Cookie": ALICE, "Origin": ORIGIN}, form(dict(f2, csrf="1.bad")))
check("consent POST with bad csrf token rejected", s == 400 and not hget(h, "location"))
s, h, b = req("POST", P + "/oauth/authorize", {"Cookie": ALICE, "Origin": ORIGIN}, form(dict(f2, scope="boards:read")))
check("consent POST with tampered params rejected (csrf binds the request)", s == 400)
s, h, b = req("POST", P + "/oauth/authorize", {"Cookie": ALICE, "Origin": ORIGIN}, form(dict(f2, redirect_uri="https://evil.example/cb")))
check("consent POST with swapped redirect_uri -> error page, no redirect", s == 400 and not hget(h, "location"))
_, _, BOB = dev_login("bob@example.com")
s, h, b = req("POST", P + "/oauth/authorize", {"Cookie": BOB, "Origin": ORIGIN}, form(f2))
check("consent POST replayed under another user's session rejected", s == 400)
s, h, b = req("POST", P + "/oauth/authorize", {"Cookie": ALICE, "Origin": ORIGIN}, form(dict(f, action="deny")))
lq = dict(urllib.parse.parse_qsl(urllib.parse.urlsplit(hget(h, "location")).query))
check("deny -> redirect with error=access_denied + state", s == 302 and lq.get("error") == "access_denied" and lq.get("state") == "st-123")
s, h, b = req("POST", P + "/oauth/authorize", {"Cookie": ALICE, "Origin": ORIGIN}, form(f2))
loc = hget(h, "location"); lq = dict(urllib.parse.parse_qsl(urllib.parse.urlsplit(loc).query))
CODE1 = lq.get("code")
check("approve -> 302 to exact redirect_uri with code + state passthrough + iss", s == 302 and loc.startswith(REDIR + "?") and CODE1 and lq.get("state") == "st-123" and lq.get("iss") == ISSUER)

# negative authorize requests
s, h, b = req("GET", P + "/oauth/authorize?" + form(authz_params(CID, "https://evil.example/callback", C1)), {"Cookie": ALICE})
check("bad redirect_uri -> 400 error page, NO redirect", s == 400 and not hget(h, "location"))
s, h, b = req("GET", P + "/oauth/authorize?" + form(authz_params(CID, REDIR + "/", C1)), {"Cookie": ALICE})
check("redirect_uri must match exactly (trailing slash rejected)", s == 400 and not hget(h, "location"))
s, h, b = req("GET", P + "/oauth/authorize?" + form(authz_params("mgdc_unknown", REDIR, C1)), {"Cookie": ALICE})
check("unknown client_id -> 400 error page, NO redirect", s == 400 and not hget(h, "location"))
def err_of(h): return dict(urllib.parse.parse_qsl(urllib.parse.urlsplit(hget(h, "location")).query))
s, h, b = req("GET", P + "/oauth/authorize?" + form(authz_params(CID, REDIR, V1, method="plain")), {"Cookie": ALICE})
check("PKCE method=plain rejected", s == 302 and err_of(h).get("error") == "invalid_request")
p = authz_params(CID, REDIR, C1); p.pop("code_challenge"); p.pop("code_challenge_method")
s, h, b = req("GET", P + "/oauth/authorize?" + form(p), {"Cookie": ALICE})
check("missing PKCE rejected", s == 302 and err_of(h).get("error") == "invalid_request")
s, h, b = req("GET", P + "/oauth/authorize?" + form(authz_params(CID, REDIR, C1, method="none")), {"Cookie": ALICE})
check("PKCE method=none rejected", s == 302 and err_of(h).get("error") == "invalid_request")
s, h, b = req("GET", P + "/oauth/authorize?" + form(authz_params(CID, REDIR, C1, resource="https://evil.example/mcp")), {"Cookie": ALICE})
check("foreign resource (RFC 8707) rejected", s == 302 and err_of(h).get("error") == "invalid_target")
s, h, b = req("GET", P + "/oauth/authorize?" + form(authz_params(CID, REDIR, C1, scope="admin")), {"Cookie": ALICE})
check("unknown scope rejected", s == 302 and err_of(h).get("error") == "invalid_scope")

# ---------------------------------------------------------------- token
print("\n-- token")
s, j, _ = exchange(CID, CODE1, pkce()[0], REDIR)
check("wrong PKCE verifier -> invalid_grant", s == 400 and j.get("error") == "invalid_grant")
s, j, _ = exchange(CID, CODE1, V1, REDIR)
check("code is burnt after a failed attempt (single use)", s == 400 and j.get("error") == "invalid_grant")

V2, C2 = pkce(); CODE2, _ = get_code(ALICE, CID, REDIR, C2)
s, j, _ = exchange(OTHER, CODE2, V2, "https://other.example/cb")
check("code redeemed by a different client -> invalid_grant", s == 400 and j.get("error") == "invalid_grant")

V3, C3 = pkce(); CODE3, _ = get_code(ALICE, CID, REDIR, C3)
s, j, _ = exchange(CID, CODE3, V3, "https://client.example/other")
check("token redirect_uri mismatch -> invalid_grant", s == 400 and j.get("error") == "invalid_grant")

V4, C4 = pkce(); CODE4, _ = get_code(ALICE, CID, REDIR, C4)
s, j, _ = exchange(CID, CODE4, V4, REDIR, {"resource": "https://evil.example/mcp"})
check("token request for a foreign resource -> invalid_target", s == 400 and j.get("error") == "invalid_target")

V5, C5 = pkce(); CODE5, _ = get_code(ALICE, CID, REDIR, C5)
s, tokA, h = exchange(CID, CODE5, V5, REDIR)
check("authorization_code + PKCE -> access + refresh tokens", s == 200 and tokA.get("token_type") == "Bearer" and tokA.get("expires_in") == 3600
      and tokA.get("access_token", "").startswith("mgd_at_") and tokA.get("refresh_token", "").startswith("mgd_rt_"))
check("token response is no-store", "no-store" in hget(h, "cache-control"))
s, j, _ = exchange(CID, CODE5, V5, REDIR)
check("reused code -> invalid_grant", s == 400 and j.get("error") == "invalid_grant")
s, h, b = rpc(MCP_ME, "tools/list", {}, tokA["access_token"])
check("code reuse revokes the tokens already issued from it", s == 401)

# confidential client auth
V6, C6 = pkce(); CODE6, _ = get_code(ALICE, conf["client_id"], REDIR, C6)
s, j, _ = exchange(conf["client_id"], CODE6, V6, REDIR)
check("confidential client without secret -> invalid_client 401", s == 401 and j.get("error") == "invalid_client")
V6, C6 = pkce(); CODE6, _ = get_code(ALICE, conf["client_id"], REDIR, C6)
basic = base64.b64encode(f'{conf["client_id"]}:{conf["client_secret"]}'.encode()).decode()
s, j, _ = exchange(conf["client_id"], CODE6, V6, REDIR, headers={"Authorization": "Basic " + basic})
check("confidential client with HTTP Basic secret -> tokens", s == 200 and j.get("access_token"))

# ---------------------------------------------------------------- authenticated MCP tools
print("\n-- authenticated MCP tools (alice)")
tok = full_flow(ALICE, CID, REDIR); AT = tok["access_token"]; RT = tok["refresh_token"]
s, h, b = rpc(MCP_ME, "initialize", {"protocolVersion": "2025-06-18", "capabilities": {}, "clientInfo": {"name": "t", "version": "1"}}, AT)
check("initialize with token", s == 200 and (jl(b) or {}).get("result", {}).get("protocolVersion") == "2025-06-18")
s, h, b = rpc(MCP_ME, "tools/list", {}, AT)
names = [t["name"] for t in (jl(b) or {}).get("result", {}).get("tools", [])]
check("tools/list = 8 board tools + every public tool", names == ["list_my_boards", "get_board", "create_board", "save_to_board", "update_board", "add_to_board_canvas", "board_design_system", "remove_from_board"] + PUBLIC, names)
check("tool defs do not leak internal 'scope' field", '"scope"' not in b)
s, res, t = call(AT, "search_design_inspiration", {"query": "serif"})
check("public search via /mcp/boards includes item_id + madegooddesigns.com", "item_id: aaaaaaaaaaa1" in t and "https://madegooddesigns.com/inspiration" in t)
s, res, t = call(AT, "create_board", {"name": "Alice Retro Board", "user_id": "someoneelse1"})
mb = re.search(r"board_id: ([0-9a-f]+)", t); BID = mb.group(1) if mb else None
check("create_board -> board id", s == 200 and BID and not res.get("isError"), t)
s, res, t = call(AT, "save_to_board", {"board_id": BID, "item_id": "aaaaaaaaaaa1"})
check("save_to_board (design item)", "Saved to" in t and not res.get("isError"), t)
s, res, t = call(AT, "save_to_board", {"board_id": BID, "item_id": "aaaaaaaaaaa1"})
check("save_to_board again is idempotent", "Already on" in t and not res.get("isError"))
s, res, t = call(AT, "save_to_board", {"board_id": BID, "item_id": "aaaaaaaaaaa2"})
check("save_to_board (annual report)", "Saved to" in t)
s, res, t = call(AT, "save_to_board", {"board_id": BID, "item_id": "bbbbbbbbbbb1"})
check("cannot save ANOTHER user's private item", res.get("isError") and "No inspiration item" in t)
s, res, t = call(AT, "save_to_board", {"board_id": BID, "item_id": "doesnotexist"})
check("save unknown item -> isError", res.get("isError"))
s, res, t = call(AT, "get_board", {"board_id": BID})
check("get_board lists items with title/description/palette/tags", "Retro serif poster" in t and "palette: #112233 #ffcc00" in t and "tags: serif, poster" in t and "A bold retro serif poster." in t)
check("get_board cites madegooddesigns.com page + image URLs", re.search(r"page \(cite this\): https://madegooddesigns\.com/inspiration/\S*#i/aaaaaaaaaaa1", t)  # UTM tags are inserted before the #
      and "https://madegooddesigns.com/inspiration/annual-reports/acme-transit-1972-aaaaaaaaaaa2" in t and "image: https://madegooddesigns.com/inspiration/img/items/aaaaaaaaaaa1.jpg" in t, t[:900])
check("get_board does not expose curated source_url (no-link policy)", "https://example.com/p1" not in t and "source: example.com" in t)
s, res, t = call(AT, "list_my_boards")
check("list_my_boards shows the board with count", "Alice Retro Board" in t and f"board_id: {BID}" in t and "items: 2" in t)
s, res, t = call(AT, "remove_from_board", {"board_id": BID, "item_id": "aaaaaaaaaaa2"})
check("remove_from_board", "Removed item aaaaaaaaaaa2" in t)
s, res, t = call(AT, "get_board", {"board_id": BID})
check("removed item gone from get_board", "acme-transit" not in t and "Retro serif poster" in t)
s, res, t = call(AT, "get_board", {"board_id": "nope"})
check("get_board unknown id -> isError", res.get("isError"))

print("\n-- boards v2: groups, descriptions, notes, sharing (MCP + web + public page)")
s, res, t = call(AT, "create_board", {"name": "Client X", "group": "work", "description": "Fintech refresh moodboard"})
mw = re.search(r"board_id: ([0-9a-f]+)", t); WID = mw.group(1) if mw else None
check("create_board with group (case-normalised to Work)", WID and "in Work" in t, t)
s, res, t = call(AT, "save_to_board", {"board_id": WID, "item_id": "aaaaaaaaaaa1", "note": "colour direction for hero"})
check("save_to_board with note", "Saved to" in t and "note: colour direction for hero" in t, t)
s, res, t = call(AT, "save_to_board", {"board_id": WID, "item_id": "aaaaaaaaaaa1", "note": "updated note"})
check("save again with note updates it", "Updated the note on" in t, t)
s, res, t = call(AT, "get_board", {"board_id": WID})
check("get_board shows group, description, note, private", "in Work" in t and "Description: Fintech refresh moodboard" in t and "your note: updated note" in t and "Private." in t, t[:400])
s, res, t = call(AT, "list_my_boards")
check("list_my_boards groups boards (## Work, ## Ungrouped)", "## Work" in t and "## Ungrouped" in t and t.index("Client X") > t.index("## Work"), t[:300])
s, res, t = call(AT, "update_board", {"board_id": WID, "shared": True, "name": "Client X — fintech"})
msh = re.search(r"(https://madegooddesigns\.com/inspiration/b/([a-z0-9]{10}))", t); SHARE = msh.group(2) if msh else None
check("update_board shared:true returns link + renames", SHARE and 'Board "Client X — fintech"' in t, t)
s, h, b = req("GET", P + f"/b/{SHARE}", {})
check("public board page renders name, note, noindex", s == 200 and "Client X — fintech" in b and "updated note" in b and "noindex" in b and "Retro serif poster" in b, (s, b[:200]))
check("public page has no outbound source_url (no-link policy) and no owner email", "https://example.com/p1" not in b and "alice@" not in b)
s, h, b = req("GET", P + f"/b/zzzzzzzzzz", {})
check("unknown share id -> 404", s == 404)
s, res, t = call(AT, "update_board", {"board_id": WID, "shared": False})
check("update_board shared:false -> private", "private (not shared)" in t, t)
s, h, b = req("GET", P + f"/b/{SHARE}", {})
check("old share link stops working", s == 404)
s, res, t = call(AT, "update_board", {"board_id": WID, "group": ""})
check("update_board group:'' removes group", "group: none" in t, t)
# web (cookie) API
J = {"Cookie": ALICE, "Content-Type": "application/json", "Origin": ORIGIN}
s, h, b = req("POST", P + "/api/boards", J, json.dumps({"name": "Trips", "group": "Personal", "description": "x" * 500}))
jb = jl(b) or {}; TID = (jb.get("board") or {}).get("id")
check("web create board with group; description capped at 300", s == 200 and jb["board"]["group"] == "Personal" and len(jb["board"]["description"]) == 300)
s, h, b = req("POST", P + f"/api/boards/{TID}/saves", J, json.dumps({"item_id": "aaaaaaaaaaa2"}))
s, h, b = req("PATCH", P + f"/api/boards/{TID}/saves/aaaaaaaaaaa2", J, json.dumps({"note": "  love the grid  "}))
check("web set pin note (trimmed)", s == 200 and (jl(b) or {}).get("note") == "love the grid", b)
s, h, b = req("PATCH", P + f"/api/boards/{TID}", J, json.dumps({"cover_item_id": "aaaaaaaaaaa2", "shared": True}))
jb = jl(b) or {}
check("web set cover + share", s == 200 and jb["board"]["cover_item_id"] == "aaaaaaaaaaa2" and jb["board"]["share_url"] and jb["board"]["cover"].endswith("aaaaaaaaaaa2.jpg"), b[:300])
s, h, b = req("PATCH", P + f"/api/boards/{TID}", J, json.dumps({"cover_item_id": "aaaaaaaaaaa1"}))
check("cover must be an item on the board (ignored otherwise)", (jl(b) or {})["board"]["cover_item_id"] == "aaaaaaaaaaa2")
s, h, b = req("GET", P + "/api/boards", {"Cookie": ALICE})
bl = (jl(b) or {}).get("boards", [])
check("web list returns groups, share_url, descriptions", any(x["group"] == "Personal" and x["share_url"] for x in bl) and (jl(b) or {}).get("groups") == ["Work", "Interests", "Personal"], (s, b[:600]))
s, h, b = req("GET", P + f"/api/boards/{TID}", {"Cookie": ALICE})
check("web get board returns notes", s == 200 and '"note":"love the grid"' in b)
s, h, b = req("PATCH", P + f"/api/boards/{TID}/saves/notonboard", J, json.dumps({"note": "x"}))
check("note on item not on board -> 404", s == 404)
s, h, b = req("PATCH", P + f"/api/boards/{TID}", {"Content-Type": "application/json"}, json.dumps({"name": "hijack"}))
check("PATCH board without session -> 401", s == 401)

print("\n-- board canvas (Release 2)")
BT = full_flow(BOB, CID, REDIR)["access_token"]
s, h, b = req("GET", P + f"/api/boards/{TID}", {"Cookie": ALICE})
jb = jl(b) or {}
check("get board returns empty canvas + rev 0", jb.get("canvas") == [] and jb.get("canvas_rev") == 0)
CV = [{"id": "pin1", "t": "pin", "item": "aaaaaaaaaaa2", "x": 10.6, "y": 20, "w": 240, "h": 180, "z": 1},
      {"id": "pin2", "t": "pin", "item": "bbbbbbbbbbb1", "x": 0, "y": 0, "w": 240, "h": 180, "z": 2},          # not on board -> dropped
      {"id": "n1", "t": "note", "x": 300, "y": 0, "w": 9999, "h": 160, "z": 3, "text": "<b>hi</b> there", "color": "javascript:alert(1)"},
      {"id": "s1", "t": "swatch", "x": 0, "y": 300, "w": 120, "h": 120, "z": 4, "color": "#0F766E", "onclick": "x"},
      {"id": "t1", "t": "type", "x": 0, "y": 450, "w": 560, "h": 120, "z": 5, "text": "Headline", "font": "Playfair Display'; x:url(evil)", "size": 999},
      {"id": "x1", "t": "script", "x": 0, "y": 0, "w": 10, "h": 10, "z": 0}]
s, h, b = req("PUT", P + f"/api/boards/{TID}/canvas", J, json.dumps({"canvas": CV, "rev": 0}))
jb = jl(b) or {}; cv = jb.get("canvas") or []
ids = [e["id"] for e in cv]
check("PUT canvas -> rev 1, sanitised", s == 200 and jb.get("rev") == 1 and ids == ["pin1", "n1", "s1", "t1"], (s, b[:300]))
n1 = next(e for e in cv if e["id"] == "n1"); t1 = next(e for e in cv if e["id"] == "t1"); s1 = next(e for e in cv if e["id"] == "s1")
check("sanitiser: clamps size, default colour for bad note colour, hex lower-cased, unknown keys dropped",
      n1["w"] == 4000 and n1["color"] == "#fff6b3" and s1["color"] == "#0f766e" and "onclick" not in s1 and cv[0]["x"] == 11, cv)
check("sanitiser: font stripped to safe characters, size clamped to 240", t1["font"] == "Playfair Display xurlevil" and t1["size"] == 240, t1)
s, h, b = req("PUT", P + f"/api/boards/{TID}/canvas", J, json.dumps({"canvas": [], "rev": 0}))
check("stale rev -> 409 with current canvas", s == 409 and (jl(b) or {}).get("rev") == 1 and len((jl(b) or {}).get("canvas") or []) == 4, (s, b[:200]))
s, h, b = req("PUT", P + f"/api/boards/{TID}/canvas", J, json.dumps({"canvas": [{"t": "note", "x": i, "y": 0, "w": 100, "h": 100, "z": 0, "text": "x" * 1000} for i in range(400)], "rev": 1}))
check("oversize canvas -> 413", s == 413, (s, b[:120]))
s, h, b = req("PUT", P + f"/api/boards/{TID}/canvas", {"Cookie": BOB, "Content-Type": "application/json", "Origin": ORIGIN}, json.dumps({"canvas": [], "rev": 1}))
check("bob cannot write alice's canvas", s == 404)
s, h, b = req("PUT", P + f"/api/boards/{TID}/canvas", {"Content-Type": "application/json"}, json.dumps({"canvas": [], "rev": 1}))
check("canvas PUT without session -> 401", s == 401)
s, res, t = call(AT, "add_to_board_canvas", {"board_id": TID, "type": "swatches", "colors": ["#112233", "nothex", "#FFCC00"]})
check("MCP add_to_board_canvas swatches (invalid colours skipped)", "Added 2 swatches" in t and not res.get("isError"), t)
s, res, t = call(AT, "add_to_board_canvas", {"board_id": TID, "type": "note", "text": "Client prefers warmer tones"})
check("MCP add note", "Added a note" in t, t)
s, res, t = call(AT, "get_board", {"board_id": TID})
check("get_board summarises canvas (notes, swatches, type)", "Canvas (free-form layout)" in t and "note: Client prefers warmer tones" in t and "#112233 #ffcc00" in t and 'type sample: "Headline" in Playfair Display' in t, t[:600])
s, h, b = req("GET", P + f"/api/boards/{TID}", {"Cookie": ALICE})
jb = jl(b) or {}
check("MCP write bumped rev and placed new elements below existing", jb.get("canvas_rev") == 3 and min(e["y"] for e in jb["canvas"] if e["t"] == "swatch" and e["color"] == "#112233") >= 570, jb.get("canvas_rev"))
s, res, t = call(BT, "add_to_board_canvas", {"board_id": TID, "type": "note", "text": "pwned"})
check("bob cannot add to alice's canvas via MCP", res.get("isError"))
s, res, t = call(AT, "add_to_board_canvas", {"board_id": TID, "type": "swatches", "colors": []})
check("swatches with no valid colours -> isError", res.get("isError"))
SH = (jl(req("GET", P + "/api/boards", {"Cookie": ALICE})[2]) or {})
tb_share = next(x for x in SH["boards"] if x["id"] == TID)["share_url"].rsplit("/", 1)[1]
s, h, b = req("GET", P + f"/b/{tb_share}", {})
check("public page renders canvas layout + type font link + grid toggle", s == 200 and 'class="cv"' in b and "Client prefers warmer tones" in b and "fonts.googleapis.com" in b and "view=grid" in b and "javascript:" not in b and "evil)" not in b, b[:200])
s, h, b = req("GET", P + f"/b/{tb_share}?view=grid", {})
check("public ?view=grid shows the grid", s == 200 and 'class="grid"' in b and 'class="cv"' not in b)
s, h, b = req("GET", P + "/assets/board-canvas.js", {})
check("canvas editor asset served as JS", s == 200 and "MGDCanvas" in b and "javascript" in h.get("content-type", [""])[0], h.get("content-type"))

print("\n-- board -> design system (Release 3)")
s, h, b = req("GET", P + f"/api/boards/{TID}/design", {"Cookie": ALICE})
jd = jl(b) or {}
check("design API: primary taken from the board's chosen swatch", s == 200 and jd.get("primary") == "#0f766e" and jd["light"]["primary"] == "#0f766e", (s, b[:300]))
check("design API: board colours ranked, fonts from type sample, light+dark roles", [c["hex"] for c in jd["colors"]][:1] == ["#0f766e"] and jd["fonts"]["heading"] == "Playfair Display xurlevil" and len(jd["dark"]) == 8)
check("design API: tool links carry scheme + board name", "/tools/website-color-palette-generator/?l=" in jd["palette_url"] and "&project=Trips" in jd["design_md_url"] and "&desc=" in jd["design_md_url"])
s, h, b = req("GET", P + f"/api/boards/{TID}/design", {"Cookie": BOB})
check("bob cannot read alice's board design", s == 404)
s, h, b = req("GET", P + f"/api/boards/{TID}/design", {})
check("design API without session -> 401", s == 401)
s, res, t = call(AT, "board_design_system", {"board_id": TID})
c = res.get("content") or []
check("MCP board_design_system returns palette + full DESIGN.md", len(c) == 2 and "Primary picked from the board: #0f766e" in c[0]["text"] and c[1]["text"].startswith("---\nversion: alpha\nname: \"Trips\"") and "\n# DESIGN.md — Trips\n" in c[1]["text"] and "**Fail**" not in c[1]["text"], c[0]["text"][:200] if c else t)
s, res, t = call(AT, "board_design_system", {"board_id": TID, "include_design_md": False})
check("include_design_md:false -> palette only", len(res.get("content") or []) == 1)
s, res, t = call(AT, "create_board", {"name": "Empty one"}); EID = re.search(r"board_id: ([0-9a-f]+)", t).group(1)
s, res, t = call(AT, "board_design_system", {"board_id": EID})
check("empty board -> helpful message, not an error", "has no colours yet" in t and not res.get("isError"), t)
s, res, t = call(BT, "board_design_system", {"board_id": TID})
check("bob cannot run design system on alice's board", res.get("isError"))
s, h, b = req("GET", P + "/save?url=https%3A%2F%2Fexample.com%2Fp&img=https%3A%2F%2Fexample.com%2Fi.jpg&title=Hi", {})
check("save popup page served, noindex", s == 200 and 'id="form"' in b and "noindex" in b and "MGD_API_BASE" in b)

print("\n-- ownership isolation (bob vs alice's board)")
_, _, BOB = dev_login("bob@example.com")
tb = full_flow(BOB, CID, REDIR); BT = tb["access_token"]
s, res, t = call(BT, "get_board", {"board_id": BID})
check("bob cannot read alice's board", res.get("isError") and "Retro serif poster" not in t)
s, res, t = call(BT, "save_to_board", {"board_id": BID, "item_id": "aaaaaaaaaaa2"})
check("bob cannot save to alice's board", res.get("isError"))
s, res, t = call(BT, "remove_from_board", {"board_id": BID, "item_id": "aaaaaaaaaaa1"})
check("bob cannot remove from alice's board", res.get("isError"))
s, res, t = call(BT, "list_my_boards", {"user_id": "ignored"})
check("bob's list_my_boards excludes alice's board", "Alice Retro Board" not in t)
s, res, t = call(AT, "get_board", {"board_id": BID})
check("alice's board untouched after bob's attempts", "Retro serif poster" in t and "acme-transit" not in t)
s, res, t = call(BT, "update_board", {"board_id": WID, "shared": True, "name": "pwned"})
check("bob cannot update/share alice's board via MCP", res.get("isError") and "pwned" not in t)
s, h, b = req("PATCH", P + f"/api/boards/{TID}", {"Cookie": BOB, "Content-Type": "application/json", "Origin": ORIGIN}, json.dumps({"name": "pwned", "shared": False}))
check("bob cannot PATCH alice's board via web", s == 404)
s, h, b = req("PATCH", P + f"/api/boards/{TID}/saves/aaaaaaaaaaa2", {"Cookie": BOB, "Content-Type": "application/json", "Origin": ORIGIN}, json.dumps({"note": "pwned"}))
check("bob cannot edit alice's pin note", s == 404)
s, h, b = req("GET", P + f"/api/boards/{TID}", {"Cookie": ALICE})
check("alice's board name + note intact after bob", '"name":"Trips"' in b.replace(" ", "") and "pwned" not in b)
s, h, b = req("GET", P + f"/api/boards/{BID}", {"Cookie": ALICE})
check("cookie board API sees the MCP-created board (same data)", s == 200 and "aaaaaaaaaaa1" in b)
s, h, b = req("POST", P + f"/api/boards/{BID}/saves", {"Cookie": ALICE, "Content-Type": "application/json", "Origin": ORIGIN}, json.dumps({"item_id": "bbbbbbbbbbb1"}))
check("cookie API cannot save ANOTHER user's private item", s == 400 and "bad_item" in b, (s, b[:200]))
s, h, b = req("GET", P + f"/api/boards/{BID}", {"Cookie": ALICE})
check("other user's private item still not on alice's board", "bbbbbbbbbbb1" not in b)

print("\n-- scopes")
tr = full_flow(ALICE, CID, REDIR, scope="boards:read"); RTK = tr["access_token"]
s, h, b = rpc(MCP_ME, "tools/list", {}, RTK)
names = [t["name"] for t in (jl(b) or {}).get("result", {}).get("tools", [])]
check("boards:read token lists only read tools (+public)", "list_my_boards" in names and "create_board" not in names and "save_to_board" not in names)
s, h, b = rpc(MCP_ME, "tools/call", {"name": "create_board", "arguments": {"name": "x"}}, RTK)
check("write tool with read-only token -> 403 insufficient_scope", s == 403 and 'error="insufficient_scope"' in hget(h, "www-authenticate"))
s, res, t = call(RTK, "list_my_boards")
check("read-only token can list boards", "Alice Retro Board" in t)

# ---------------------------------------------------------------- refresh + rotation
print("\n-- refresh")
s, h, b = req("POST", P + "/oauth/token", body=form({"grant_type": "refresh_token", "refresh_token": RT, "client_id": CID, "resource": RESOURCE})); r1 = jl(b) or {}
check("refresh_token grant -> new access + rotated refresh", s == 200 and r1.get("access_token") and r1.get("refresh_token") and r1["refresh_token"] != RT)
s, res, t = call(r1["access_token"], "list_my_boards")
check("refreshed access token works", "Alice Retro Board" in t)
s, h, b = req("POST", P + "/oauth/token", body=form({"grant_type": "refresh_token", "refresh_token": RT, "client_id": OTHER}))
check("refresh by a different client -> invalid_grant", s == 400)
s, h, b = req("POST", P + "/oauth/token", body=form({"grant_type": "refresh_token", "refresh_token": r1["refresh_token"], "client_id": CID, "scope": "boards:read boards:admin"}))
check("refresh cannot widen scope", s == 400 and "invalid_scope" in b)
s, h, b = req("POST", P + "/oauth/token", body=form({"grant_type": "refresh_token", "refresh_token": RT, "client_id": CID}))
check("replayed (rotated-out) refresh token -> invalid_grant", s == 400 and "invalid_grant" in b)
s, h, b = rpc(MCP_ME, "tools/list", {}, r1["access_token"])
check("refresh-token replay revokes the whole grant (new access now 401)", s == 401)

# ---------------------------------------------------------------- revoke
print("\n-- revoke")
tv = full_flow(ALICE, CID, REDIR)
s, h, b = req("POST", P + "/oauth/revoke", body=form({"token": tv["access_token"], "client_id": CID, "token_type_hint": "access_token"}))
check("revoke access token -> 200", s == 200)
s, h, b = rpc(MCP_ME, "tools/list", {}, tv["access_token"])
check("revoked access token -> 401 invalid_token", s == 401 and 'error="invalid_token"' in hget(h, "www-authenticate"))
s, h, b = req("POST", P + "/oauth/revoke", body=form({"token": tv["refresh_token"], "client_id": CID}))
s, h, b = req("POST", P + "/oauth/token", body=form({"grant_type": "refresh_token", "refresh_token": tv["refresh_token"], "client_id": CID}))
check("revoked refresh token cannot be used", s == 400 and "invalid_grant" in b)
s, h, b = req("POST", P + "/oauth/revoke", body=form({"token": "mgd_at_unknown", "client_id": CID}))
check("revoking an unknown token still 200 (RFC 7009)", s == 200)

print("\n-- connected apps (user-facing revoke)")
tc = full_flow(ALICE, CID, REDIR)
s, h, b = req("GET", P + "/api/me/connected-apps", {"Cookie": ALICE}); apps = (jl(b) or {}).get("apps", [])
check("connected-apps API lists alice's live grants", s == 200 and any(a["client_name"] == "Test MCP Client" for a in apps))
check("connected-apps API never returns tokens", "mgd_at_" not in b and "mgd_rt_" not in b)
s, h, b = req("GET", P + "/account/connected-apps", {"Cookie": ALICE})
check("connected-apps HTML page renders with Disconnect", s == 200 and "Disconnect" in b and "Test MCP Client" in b)
s, h, b = req("GET", P + "/account/connected-apps")
check("connected-apps page without session -> login redirect", s == 302 and "/auth/google/login" in hget(h, "location"))
gids = [a["id"] for a in apps]
s, h, b = req("DELETE", P + f"/api/me/connected-apps/{gids[0]}", {"Cookie": BOB})
check("bob cannot revoke alice's grant", s == 404)
for g in gids:
    req("DELETE", P + f"/api/me/connected-apps/{g}", {"Cookie": ALICE})
s, h, b = rpc(MCP_ME, "tools/list", {}, tc["access_token"])
check("after user disconnects the app -> 401", s == 401)
s, h, b = req("GET", P + "/api/me/connected-apps", {"Cookie": ALICE})
check("disconnected apps no longer listed", (jl(b) or {}).get("apps") == [])
# HTML form revoke path (+CSRF)
tf = full_flow(ALICE, CID, REDIR)
s, h, b = req("GET", P + "/account/connected-apps", {"Cookie": ALICE})
fm = dict(re.findall(r'<input type="hidden" name="([^"]+)" value="([^"]*)">', b))
s, h, b2 = req("POST", P + "/account/connected-apps/revoke", {"Cookie": ALICE, "Origin": "https://evil.example"}, form(fm))
check("connected-apps form POST from foreign origin rejected", s == 403)
s, h, b2 = req("POST", P + "/account/connected-apps/revoke", {"Cookie": ALICE, "Origin": ORIGIN}, form({k: unesc(v) for k, v in fm.items()}))
s3, _, _ = rpc(MCP_ME, "tools/list", {}, tf["access_token"])
check("connected-apps form Disconnect works (CSRF token)", s == 200 and "Disconnected." in b2 and s3 == 401)

print("\n-- final 401")
s, h, b = rpc(MCP_ME, "tools/list", {}, AT)
check("old/revoked tokens -> 401 with resource_metadata challenge", s == 401 and "resource_metadata=" in hget(h, "www-authenticate"))

# raw tokens -> run_local_tests.sh greps the dev log + local D1 to prove tokens are never stored/logged
with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".test_tokens"), "w") as fh:
    for t_ in [AT, RT, BT, RTK, tok.get("refresh_token", "")]:
        fh.write(t_ + "\n")  # raw tokens for a grep-absence check; file deleted by the runner

passed = sum(1 for _, ok in RESULTS if ok); failed = [n for n, ok in RESULTS if not ok]
print(f"\n== {passed}/{len(RESULTS)} passed" + (f"; FAILED: {failed}" if failed else ""))
sys.exit(1 if failed else 0)
