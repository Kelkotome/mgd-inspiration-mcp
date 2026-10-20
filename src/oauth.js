// MGD Inspiration — OAuth 2.1 authorization server for the authenticated MCP endpoint.
//
// Implements the MCP Authorization spec (2025-06-18):
//   - RFC 9728 protected-resource metadata, RFC 8414 authorization-server metadata
//   - RFC 7591 dynamic client registration           POST {base}/oauth/register
//   - authorization code + PKCE (S256 only)          GET/POST {base}/oauth/authorize
//   - token endpoint (authorization_code, refresh)   POST {base}/oauth/token
//   - RFC 7009 revocation                            POST {base}/oauth/revoke
//   - RFC 8707 resource indicators (audience binding of every token)
//   - RFC 9207 `iss` on the authorization response
// User identity comes from the EXISTING Google login (auth.js session cookie).
// Storage is D1 (see migrate_oauth.sql). Only SHA-256 hashes of secrets/codes/tokens are stored.

import { getUser } from "./auth.js";

export const SCOPES = {
  "boards:read": "See your mood boards and the items saved on them",
  "boards:write": "Create mood boards and add or remove items on them",
};
const DEFAULT_SCOPE = "boards:read boards:write";
const ACCESS_TTL_S = 60 * 60;            // 1 hour
const REFRESH_TTL_S = 60 * 60 * 24 * 30; // 30 days (rotated on every use)
const CODE_TTL_MS = 5 * 60 * 1000;       // 5 minutes, single use
const CONSENT_TTL_MS = 10 * 60 * 1000;   // consent form CSRF token lifetime
const REG_LIMIT_PER_HOUR = 20;           // dynamic registrations per IP per hour

// ---- URLs -------------------------------------------------------------------
// Public origin = env.PUBLIC_ORIGIN (wrangler.jsonc var, "https://madegooddesigns.com"), else the
// request origin. A fixed value matters: `wrangler dev` rewrites request.url to the route host,
// and issuer/resource strings must be byte-stable for clients and audience checks.
// Local tests override it with `--var PUBLIC_ORIGIN:http://localhost:8797`.
export function publicOrigin(url, env) { return String((env && env.PUBLIC_ORIGIN) || url.origin).replace(/\/+$/, ""); }
export function oauthUrls(url, base, env) {
  const issuer = publicOrigin(url, env) + base;
  return {
    issuer,
    resource: `${issuer}/mcp/boards`,
    // Under the existing /inspiration* route, so it works even without the extra root routes.
    prm: `${issuer}/.well-known/oauth-protected-resource`,
    authorize: `${issuer}/oauth/authorize`,
    token: `${issuer}/oauth/token`,
    register: `${issuer}/oauth/register`,
    revoke: `${issuer}/oauth/revoke`,
    apps: `${issuer}/account/connected-apps`,
  };
}

// Which raw pathnames are well-known docs (checked BEFORE the base prefix is stripped).
//   RFC 8414 path-insertion:  /.well-known/oauth-authorization-server/inspiration
//   path-appended fallback:   /inspiration/.well-known/oauth-authorization-server
//   RFC 9728 path-insertion:  /.well-known/oauth-protected-resource/inspiration/mcp/boards
//   path-appended fallback:   /inspiration/.well-known/oauth-protected-resource[/mcp/boards]
export function wellKnownKind(pathname, base) {
  const p = pathname.replace(/\/+$/, "");
  const as = "/.well-known/oauth-authorization-server", pr = "/.well-known/oauth-protected-resource";
  if (p === as + base || p === base + as) return "as";
  if (p === pr + base + "/mcp/boards" || p === pr + base || p === base + pr || p === base + pr + "/mcp/boards") return "prm";
  return null;
}

export function oauthCors(extra) {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "authorization,content-type,mcp-protocol-version,mcp-session-id,accept",
    "Access-Control-Expose-Headers": "WWW-Authenticate,Mcp-Session-Id",
    "Access-Control-Max-Age": "86400",
    ...(extra || {}),
  };
}
function ojson(obj, status, extraHeaders) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store", "Pragma": "no-cache", ...oauthCors(), ...(extraHeaders || {}) },
  });
}
const oerr = (error, description, status, extra) => ojson({ error, error_description: description }, status || 400, extra);

export function wellKnown(kind, url, base, env) {
  const u = oauthUrls(url, base, env);
  if (kind === "prm") {
    return ojson({
      resource: u.resource,
      authorization_servers: [u.issuer],
      scopes_supported: Object.keys(SCOPES),
      bearer_methods_supported: ["header"],
      resource_name: "MGD Inspiration — your mood boards",
      resource_documentation: `${u.issuer}/`,
    }, 200, { "Cache-Control": "public, max-age=3600" });
  }
  return ojson({
    issuer: u.issuer,
    authorization_endpoint: u.authorize,
    token_endpoint: u.token,
    registration_endpoint: u.register,
    revocation_endpoint: u.revoke,
    response_types_supported: ["code"],
    response_modes_supported: ["query"],
    grant_types_supported: ["authorization_code", "refresh_token"],
    code_challenge_methods_supported: ["S256"],
    token_endpoint_auth_methods_supported: ["none", "client_secret_post", "client_secret_basic"],
    revocation_endpoint_auth_methods_supported: ["none", "client_secret_post", "client_secret_basic"],
    scopes_supported: Object.keys(SCOPES),
    authorization_response_iss_parameter_supported: true,
    service_documentation: `${u.issuer}/`,
  }, 200, { "Cache-Control": "public, max-age=3600" });
}

// ---- crypto helpers -----------------------------------------------------------
const te = new TextEncoder();
function b64url(bytes) {
  let bin = ""; for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function randomToken(prefix, n = 32) { const b = new Uint8Array(n); crypto.getRandomValues(b); return prefix + b64url(b); }
async function sha256Bytes(s) { return new Uint8Array(await crypto.subtle.digest("SHA-256", te.encode(s))); }
async function sha256Hex(s) { return [...await sha256Bytes(s)].map((x) => x.toString(16).padStart(2, "0")).join(""); }
// Constant-time string compare (length leak only; both sides are fixed-length digests here).
export function safeEqual(a, b) {
  a = String(a || ""); b = String(b || "");
  if (a.length !== b.length) return false;
  let d = 0; for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}
async function hmac(secret, data) {
  const key = await crypto.subtle.importKey("raw", te.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return b64url(new Uint8Array(await crypto.subtle.sign("HMAC", key, te.encode(data))));
}
const genId = () => crypto.randomUUID().replace(/-/g, "").slice(0, 16);
const escHtml = (s) => (s == null ? "" : String(s)).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// ---- validation helpers --------------------------------------------------------
const BAD_SCHEMES = new Set(["javascript:", "data:", "file:", "vbscript:", "blob:", "about:", "ftp:", "ws:", "wss:"]);
function isLoopbackHost(h) { return h === "localhost" || h === "127.0.0.1" || h === "[::1]"; }
function validRedirectUri(s) {
  if (typeof s !== "string" || !s || s.length > 512 || /[\s\x00-\x1f\\]/.test(s)) return false;
  let u; try { u = new URL(s); } catch (_) { return false; }
  if (u.hash || s.includes("#")) return false;
  if (u.username || u.password) return false;
  if (BAD_SCHEMES.has(u.protocol)) return false;
  if (u.protocol === "https:") return true;
  if (u.protocol === "http:") return isLoopbackHost(u.hostname);              // RFC 8252 loopback for native apps
  return /^[a-z][a-z0-9+.-]*\.[a-z0-9+.-]+:$|^(cursor|vscode|vscode-insiders|windsurf|claude|zed):$/i.test(u.protocol); // private-use schemes (RFC 8252 §7.1)
}
function parseScope(s) {
  const list = String(s || "").split(/\s+/).filter(Boolean);
  return [...new Set(list)];
}
function normResource(r) { return String(r || "").replace(/\/+$/, ""); }

async function readForm(request) {
  const ct = request.headers.get("Content-Type") || "";
  if (ct.includes("application/json")) { const j = await request.json().catch(() => ({})); return new Map(Object.entries(j || {}).map(([k, v]) => [k, String(v)])); }
  const text = await request.text().catch(() => "");
  return new Map([...new URLSearchParams(text).entries()]);
}

// ---- client lookup / authentication ---------------------------------------------
async function getClient(env, clientId) {
  if (!clientId || clientId.length > 100) return null;
  const c = await env.DB.prepare("SELECT * FROM oauth_clients WHERE client_id=?").bind(clientId).first();
  if (!c) return null;
  try { c.redirect_uris = JSON.parse(c.redirect_uris || "[]"); } catch (_) { c.redirect_uris = []; }
  return c;
}
// Returns the authenticated client or null. Public clients authenticate by client_id alone (+PKCE).
async function authenticateClient(request, form, env) {
  let id = form.get("client_id") || "", secret = form.get("client_secret") || "";
  const h = request.headers.get("Authorization") || "";
  if (/^Basic /i.test(h)) {
    try {
      const dec = atob(h.slice(6).trim()); const i = dec.indexOf(":");
      if (i > 0) { id = decodeURIComponent(dec.slice(0, i)); secret = decodeURIComponent(dec.slice(i + 1)); }
    } catch (_) { return null; }
  }
  const c = await getClient(env, id);
  if (!c) return null;
  if (c.auth_method === "none") return c;
  if (!secret) return null; // confidential clients may use either Basic or client_secret_post
  return safeEqual(await sha256Hex(secret), c.client_secret_hash) ? c : null;
}

// ---- RFC 7591 dynamic client registration -----------------------------------------
export async function register(request, env) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return oerr("invalid_client_metadata", "JSON body required");
  const uris = body.redirect_uris;
  if (!Array.isArray(uris) || !uris.length || uris.length > 10) return oerr("invalid_redirect_uri", "redirect_uris must be a non-empty array (max 10)");
  for (const u of uris) if (!validRedirectUri(u)) return oerr("invalid_redirect_uri", "redirect_uri not allowed: must be https, http loopback, or a private-use scheme, with no fragment");
  const method = body.token_endpoint_auth_method || "client_secret_basic"; // RFC 7591 default
  if (!["none", "client_secret_post", "client_secret_basic"].includes(method)) return oerr("invalid_client_metadata", "unsupported token_endpoint_auth_method");
  const gt = body.grant_types || ["authorization_code"];
  if (!Array.isArray(gt) || gt.some((g) => !["authorization_code", "refresh_token"].includes(g))) return oerr("invalid_client_metadata", "unsupported grant_types");
  const rt = body.response_types || ["code"];
  if (!Array.isArray(rt) || rt.some((r) => r !== "code")) return oerr("invalid_client_metadata", "only response_type 'code' is supported");
  const name = String(body.client_name || "").replace(/[\x00-\x1f\x7f]/g, "").trim().slice(0, 100) || "Unnamed app";

  const ip = request.headers.get("CF-Connecting-IP") || "";
  const now = Date.now();
  if (ip) {
    const n = await env.DB.prepare("SELECT COUNT(*) n FROM oauth_clients WHERE created_ip=? AND created_at>?").bind(ip, now - 3600000).first();
    if (n && n.n >= REG_LIMIT_PER_HOUR) return oerr("too_many_requests", "registration rate limit exceeded; try again later", 429, { "Retry-After": "3600" });
  }
  const clientId = randomToken("mgdc_", 18);
  const secret = method === "none" ? null : randomToken("mgdcs_", 32);
  await env.DB.prepare("INSERT INTO oauth_clients (client_id,client_secret_hash,client_name,redirect_uris,auth_method,created_ip,created_at) VALUES (?,?,?,?,?,?,?)")
    .bind(clientId, secret ? await sha256Hex(secret) : null, name, JSON.stringify(uris), method, ip || null, now).run();
  const out = {
    client_id: clientId, client_id_issued_at: Math.floor(now / 1000),
    client_name: name, redirect_uris: uris, token_endpoint_auth_method: method,
    grant_types: ["authorization_code", "refresh_token"], response_types: ["code"],
    scope: DEFAULT_SCOPE,
  };
  if (secret) { out.client_secret = secret; out.client_secret_expires_at = 0; }
  return ojson(out, 201);
}

// ---- authorization endpoint ---------------------------------------------------------
function errorPage(title, msg, status) {
  return new Response(`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escHtml(title)}</title>
<style>body{font-family:system-ui,sans-serif;max-width:520px;margin:3rem auto;padding:0 1rem;color:#171717}</style>
<h1 style="font-size:1.2rem">${escHtml(title)}</h1><p>${escHtml(msg)}</p>`, {
    status: status || 400,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "X-Frame-Options": "DENY", "Content-Security-Policy": "frame-ancestors 'none'" },
  });
}
function redirectWith(redirectUri, params) {
  const u = new URL(redirectUri);
  for (const [k, v] of Object.entries(params)) if (v != null && v !== "") u.searchParams.set(k, v);
  return new Response(null, { status: 302, headers: { "Location": u.toString(), "Cache-Control": "no-store" } });
}

// Validates an authorization request (from GET query or POSTed consent form).
// Returns { page } (render error, never redirect), { redirect } (error back to client), or { req }.
async function validateAuthRequest(p, env, urls) {
  const client = await getClient(env, p.get("client_id"));
  if (!client) return { page: errorPage("Unknown app", "This app is not registered (unknown client_id).", 400) };
  let redirectUri = p.get("redirect_uri");
  if (!redirectUri && client.redirect_uris.length === 1) redirectUri = client.redirect_uris[0];
  // Exact string match against a registered URI — never redirect anywhere else.
  if (!redirectUri || !client.redirect_uris.includes(redirectUri)) return { page: errorPage("Invalid redirect", "The redirect_uri does not exactly match one registered for this app.", 400) };
  const state = p.get("state") || "";
  const fail = (error, desc) => ({ redirect: redirectWith(redirectUri, { error, error_description: desc, state, iss: urls.issuer }) });
  if (state.length > 2048) return fail("invalid_request", "state too long");
  if (p.get("response_type") !== "code") return fail("unsupported_response_type", "only response_type=code is supported");
  const challenge = p.get("code_challenge") || "";
  const method = p.get("code_challenge_method") || "";
  if (!challenge) return fail("invalid_request", "PKCE code_challenge is required");
  if (method !== "S256") return fail("invalid_request", "code_challenge_method must be S256 (plain is not supported)");
  if (!/^[A-Za-z0-9_-]{43}$/.test(challenge)) return fail("invalid_request", "malformed code_challenge");
  const reqScopes = parseScope(p.get("scope"));
  if (reqScopes.some((s) => !SCOPES[s])) return fail("invalid_scope", "unknown scope requested");
  const scope = (reqScopes.length ? reqScopes : parseScope(DEFAULT_SCOPE)).join(" ");
  const resIn = p.get("resource");
  if (resIn && normResource(resIn) !== normResource(urls.resource)) return fail("invalid_target", `resource must be ${urls.resource}`);
  return { req: { client, redirectUri, state, challenge, scope, resource: urls.resource } };
}

function consentMac(env, uid, r, exp) {
  return hmac(env.SESSION_SECRET, ["consent", uid, r.client.client_id, r.redirectUri, r.challenge, r.scope, r.resource, r.state, exp].join("|"));
}

export async function authorize(request, url, env, base) {
  const urls = oauthUrls(url, base, env);
  if (!env.SESSION_SECRET) return errorPage("Not configured", "Sign-in is not configured on this server.", 500);
  const isPost = request.method === "POST";
  let p;
  if (isPost) {
    // CSRF: same-origin form only (Origin/Sec-Fetch-Site checks) + HMAC token bound to user + request.
    const origin = request.headers.get("Origin");
    if (origin && origin !== publicOrigin(url, env)) return errorPage("Forbidden", "Cross-site form submission rejected.", 403);
    const sfs = request.headers.get("Sec-Fetch-Site");
    if (sfs && sfs !== "same-origin" && sfs !== "none") return errorPage("Forbidden", "Cross-site form submission rejected.", 403);
    p = await readForm(request);
  } else {
    p = url.searchParams;
  }
  const v = await validateAuthRequest(p, env, urls);
  if (v.page) return v.page;
  if (v.redirect) return v.redirect;
  const r = v.req;

  const user = await getUser(request, env);
  if (!user) {
    if (isPost) return errorPage("Signed out", "Your session expired. Start the connection again from your app.", 401);
    // Send through the EXISTING Google login, then come straight back here.
    const ret = url.pathname + url.search;
    return new Response(null, { status: 302, headers: { "Location": `${base}/auth/google/login?return=${encodeURIComponent(ret)}`, "Cache-Control": "no-store" } });
  }

  if (isPost) {
    const [expStr, mac] = String(p.get("csrf") || "").split(".");
    const exp = parseInt(expStr, 10);
    if (!exp || exp < Date.now() || !mac || !safeEqual(mac, await consentMac(env, user.id, r, exp)))
      return errorPage("Expired", "This consent form expired or was tampered with. Start the connection again from your app.", 400);
    if (p.get("action") !== "approve") return redirectWith(r.redirectUri, { error: "access_denied", error_description: "The user denied access", state: r.state, iss: urls.issuer });
    const code = randomToken("mgd_ac_", 32);
    const now = Date.now();
    await env.DB.prepare("INSERT INTO oauth_codes (code_hash,client_id,user_id,redirect_uri,code_challenge,scope,resource,expires_at,created_at) VALUES (?,?,?,?,?,?,?,?,?)")
      .bind(await sha256Hex(code), r.client.client_id, user.id, r.redirectUri, r.challenge, r.scope, r.resource, now + CODE_TTL_MS, now).run();
    return redirectWith(r.redirectUri, { code, state: r.state, iss: urls.issuer });
  }

  // ---- consent screen ----
  const exp = Date.now() + CONSENT_TTL_MS;
  const csrf = `${exp}.${await consentMac(env, user.id, r, exp)}`;
  let redirHost = r.redirectUri; try { const ru = new URL(r.redirectUri); redirHost = ru.host ? `${ru.protocol}//${ru.host}` : ru.protocol; } catch (_) {}
  const hidden = { response_type: "code", client_id: r.client.client_id, redirect_uri: r.redirectUri, state: r.state, code_challenge: r.challenge, code_challenge_method: "S256", scope: r.scope, resource: r.resource, csrf };
  const scopeList = r.scope.split(" ").map((s) => `<li><strong>${escHtml(s)}</strong> — ${escHtml(SCOPES[s])}</li>`).join("");
  const switchUrl = `${base}/auth/google/login?return=${encodeURIComponent(url.pathname + url.search)}`;
  const page = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Connect an app — MGD Inspiration</title>
<style>:root{--bg:#fafafa;--surface:#fff;--border:#e5e5e5;--text:#171717;--muted:#737373}
@media(prefers-color-scheme:dark){:root{--bg:#0f0f0f;--surface:#171717;--border:#262626;--text:#fafafa;--muted:#a3a3a3}}
body{margin:0;background:var(--bg);color:var(--text);font-family:system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif}
.card{max-width:460px;margin:3rem auto;background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:1.5rem}
h1{font-size:1.15rem;margin:0 0 .75rem}p,li{line-height:1.5;font-size:.95rem}.muted{color:var(--muted);font-size:.85rem}
ul{padding-left:1.1rem}.row{display:flex;gap:.6rem;margin-top:1.25rem}
button{font:inherit;font-weight:600;padding:.6rem 1rem;border-radius:8px;border:1px solid var(--text);cursor:pointer;flex:1}
.ok{background:var(--text);color:var(--bg)}.no{background:transparent;color:var(--text)}code{font-size:.85em;word-break:break-all}</style></head>
<body><div class="card">
<h1>Allow “${escHtml(r.client.client_name)}” to access your MGD Inspiration boards?</h1>
<p class="muted">Signed in as ${escHtml(user.email || user.name || "you")} · <a href="${escHtml(switchUrl)}">use a different account</a></p>
<p>This app will be able to:</p><ul>${scopeList}</ul>
<p class="muted">The app name is provided by the app itself and is not verified. After you choose, you will be sent to <code>${escHtml(redirHost)}</code>. You can disconnect it any time at <a href="${escHtml(base)}/account/connected-apps">Connected apps</a>.</p>
<form method="post" action="${escHtml(base)}/oauth/authorize">
${Object.entries(hidden).map(([k, val]) => `<input type="hidden" name="${escHtml(k)}" value="${escHtml(val)}">`).join("\n")}
<div class="row"><button class="no" type="submit" name="action" value="deny">Deny</button><button class="ok" type="submit" name="action" value="approve">Allow</button></div>
</form></div></body></html>`;
  return new Response(page, {
    headers: {
      "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store",
      "X-Frame-Options": "DENY", "Content-Security-Policy": "frame-ancestors 'none'; default-src 'none'; style-src 'unsafe-inline'; img-src 'self'",
      "Referrer-Policy": "no-referrer",
    },
  });
}

// ---- token endpoint -------------------------------------------------------------------
async function issueTokens(env, g) {
  const now = Date.now();
  const access = randomToken("mgd_at_", 32), refresh = randomToken("mgd_rt_", 32);
  const ins = "INSERT INTO oauth_tokens (token_hash,kind,grant_id,client_id,user_id,scope,resource,expires_at,created_at) VALUES (?,?,?,?,?,?,?,?,?)";
  await env.DB.batch([
    env.DB.prepare(ins).bind(await sha256Hex(access), "access", g.grant_id, g.client_id, g.user_id, g.scope, g.resource, now + ACCESS_TTL_S * 1000, now),
    env.DB.prepare(ins).bind(await sha256Hex(refresh), "refresh", g.grant_id, g.client_id, g.user_id, g.scope, g.resource, now + REFRESH_TTL_S * 1000, now),
  ]);
  return { access_token: access, token_type: "Bearer", expires_in: ACCESS_TTL_S, refresh_token: refresh, scope: g.scope };
}
async function revokeGrant(env, grantId, reason) {
  if (!grantId) return;
  const now = Date.now();
  await env.DB.batch([
    env.DB.prepare("UPDATE oauth_grants SET revoked_at=? WHERE id=? AND revoked_at IS NULL").bind(now, grantId),
    env.DB.prepare("UPDATE oauth_tokens SET revoked_at=?, revoked_reason=? WHERE grant_id=? AND revoked_at IS NULL").bind(now, reason || "revoked", grantId),
  ]);
}
// Opportunistic housekeeping (~5% of token calls): drop long-dead codes/tokens.
function maybeCleanup(env, ctx) {
  if (Math.random() > 0.05) return;
  const now = Date.now();
  const p = env.DB.batch([
    env.DB.prepare("DELETE FROM oauth_codes WHERE expires_at < ?").bind(now - 86400000),
    env.DB.prepare("DELETE FROM oauth_tokens WHERE expires_at < ?").bind(now - 7 * 86400000),
  ]).catch(() => {});
  if (ctx && ctx.waitUntil) ctx.waitUntil(p);
}

export async function token(request, url, env, base, ctx) {
  const urls = oauthUrls(url, base, env);
  const form = await readForm(request);
  const client = await authenticateClient(request, form, env);
  if (!client) return oerr("invalid_client", "client authentication failed", 401);
  const grantType = form.get("grant_type");
  const resIn = form.get("resource");
  if (resIn && normResource(resIn) !== normResource(urls.resource)) return oerr("invalid_target", `resource must be ${urls.resource}`);
  maybeCleanup(env, ctx);

  if (grantType === "authorization_code") {
    const code = form.get("code") || "", verifier = form.get("code_verifier") || "";
    if (!code) return oerr("invalid_request", "code is required");
    if (!/^[A-Za-z0-9\-._~]{43,128}$/.test(verifier)) return oerr("invalid_grant", "a valid PKCE code_verifier is required");
    const codeHash = await sha256Hex(code);
    const now = Date.now();
    // Atomic single-use claim: the code is burnt on the FIRST redemption attempt, success or not.
    const claim = await env.DB.prepare("UPDATE oauth_codes SET used_at=? WHERE code_hash=? AND used_at IS NULL").bind(now, codeHash).run();
    const row = await env.DB.prepare("SELECT * FROM oauth_codes WHERE code_hash=?").bind(codeHash).first();
    if (!row) return oerr("invalid_grant", "unknown authorization code");
    if (!claim.meta || claim.meta.changes !== 1) {
      // Replay: revoke everything issued from this code (RFC 6749 §10.5 / OAuth 2.1 §4.1.3).
      await revokeGrant(env, row.grant_id, "reuse");
      return oerr("invalid_grant", "authorization code already used");
    }
    if (row.expires_at < now) return oerr("invalid_grant", "authorization code expired");
    if (row.client_id !== client.client_id) return oerr("invalid_grant", "code was issued to another client");
    const ru = form.get("redirect_uri");
    if (ru && ru !== row.redirect_uri) return oerr("invalid_grant", "redirect_uri mismatch");
    const computed = b64url(await sha256Bytes(verifier));
    if (!safeEqual(computed, row.code_challenge)) return oerr("invalid_grant", "PKCE verification failed");
    const user = await env.DB.prepare("SELECT id FROM users WHERE id=?").bind(row.user_id).first();
    if (!user) return oerr("invalid_grant", "user no longer exists");
    const grantId = genId();
    await env.DB.batch([
      env.DB.prepare("INSERT INTO oauth_grants (id,user_id,client_id,scope,resource,created_at,last_used_at) VALUES (?,?,?,?,?,?,?)")
        .bind(grantId, row.user_id, row.client_id, row.scope, row.resource, now, now),
      env.DB.prepare("UPDATE oauth_codes SET grant_id=? WHERE code_hash=?").bind(grantId, codeHash),
    ]);
    return ojson(await issueTokens(env, { grant_id: grantId, client_id: row.client_id, user_id: row.user_id, scope: row.scope, resource: row.resource }));
  }

  if (grantType === "refresh_token") {
    const rt = form.get("refresh_token") || "";
    if (!rt) return oerr("invalid_request", "refresh_token is required");
    const h = await sha256Hex(rt);
    const t = await env.DB.prepare(
      "SELECT t.*, g.revoked_at AS grant_revoked, g.scope AS grant_scope FROM oauth_tokens t JOIN oauth_grants g ON g.id=t.grant_id WHERE t.token_hash=? AND t.kind='refresh'"
    ).bind(h).first();
    if (!t) return oerr("invalid_grant", "unknown refresh token");
    if (t.client_id !== client.client_id) return oerr("invalid_grant", "refresh token was issued to another client");
    if (t.revoked_at || t.grant_revoked) {
      // A rotated-out refresh token being replayed = likely theft: kill the whole grant.
      if (t.revoked_reason === "rotated") await revokeGrant(env, t.grant_id, "reuse");
      return oerr("invalid_grant", "refresh token revoked");
    }
    const now = Date.now();
    if (t.expires_at < now) return oerr("invalid_grant", "refresh token expired");
    let scope = t.scope;
    const sIn = parseScope(form.get("scope"));
    if (sIn.length) {
      const have = new Set(parseScope(t.grant_scope));
      if (sIn.some((s) => !have.has(s))) return oerr("invalid_scope", "requested scope exceeds the original grant");
      scope = sIn.join(" ");
    }
    const rot = await env.DB.prepare("UPDATE oauth_tokens SET revoked_at=?, revoked_reason='rotated' WHERE token_hash=? AND revoked_at IS NULL").bind(now, h).run();
    if (!rot.meta || rot.meta.changes !== 1) { await revokeGrant(env, t.grant_id, "reuse"); return oerr("invalid_grant", "refresh token already used"); }
    await env.DB.prepare("UPDATE oauth_grants SET last_used_at=? WHERE id=?").bind(now, t.grant_id).run();
    return ojson(await issueTokens(env, { grant_id: t.grant_id, client_id: t.client_id, user_id: t.user_id, scope, resource: t.resource }));
  }

  return oerr("unsupported_grant_type", "grant_type must be authorization_code or refresh_token");
}

// ---- RFC 7009 revocation ---------------------------------------------------------------
export async function revoke(request, env) {
  const form = await readForm(request);
  const client = await authenticateClient(request, form, env);
  if (!client) return oerr("invalid_client", "client authentication failed", 401);
  const tok = form.get("token") || "";
  if (tok) {
    const t = await env.DB.prepare("SELECT kind,grant_id,client_id FROM oauth_tokens WHERE token_hash=?").bind(await sha256Hex(tok)).first();
    if (t && t.client_id === client.client_id) {
      if (t.kind === "refresh") await revokeGrant(env, t.grant_id, "revoked"); // refresh => whole grant
      else await env.DB.prepare("UPDATE oauth_tokens SET revoked_at=?, revoked_reason='revoked' WHERE token_hash=? AND revoked_at IS NULL").bind(Date.now(), await sha256Hex(tok)).run();
    }
  }
  return new Response(null, { status: 200, headers: { "Cache-Control": "no-store", ...oauthCors() } }); // always 200 (RFC 7009 §2.2)
}

// ---- protected-resource side: bearer validation ------------------------------------------
// Returns { ok:true, user_id, client_id, client_name, scopes:Set, grant_id } or { ok:false, error, desc }.
export async function verifyBearer(request, env, url, base, ctx) {
  const h = request.headers.get("Authorization") || "";
  const m = /^Bearer\s+([A-Za-z0-9\-._~+/]+=*)\s*$/i.exec(h);
  if (!m) return { ok: false, error: null };
  const t = await env.DB.prepare(
    `SELECT t.user_id,t.client_id,t.scope,t.resource,t.expires_at,t.revoked_at,t.grant_id,
            g.revoked_at AS grant_revoked, g.last_used_at, c.client_name
       FROM oauth_tokens t JOIN oauth_grants g ON g.id=t.grant_id LEFT JOIN oauth_clients c ON c.client_id=t.client_id
      WHERE t.token_hash=? AND t.kind='access'`
  ).bind(await sha256Hex(m[1])).first();
  const now = Date.now();
  if (!t || t.revoked_at || t.grant_revoked || t.expires_at < now) return { ok: false, error: "invalid_token", desc: "The access token is invalid, expired or revoked" };
  // RFC 8707 audience binding: a token minted for another resource is not valid here.
  if (normResource(t.resource) !== normResource(oauthUrls(url, base, env).resource)) return { ok: false, error: "invalid_token", desc: "The access token was issued for a different resource" };
  // Cheap "last used" bookkeeping — at most one write per grant per 10 minutes.
  if (!t.last_used_at || now - t.last_used_at > 600000) {
    const p = env.DB.prepare("UPDATE oauth_grants SET last_used_at=? WHERE id=?").bind(now, t.grant_id).run().catch(() => {});
    if (ctx && ctx.waitUntil) ctx.waitUntil(p);
  }
  return { ok: true, user_id: t.user_id, client_id: t.client_id, client_name: t.client_name || "", scopes: new Set(parseScope(t.scope)), grant_id: t.grant_id };
}

export function challengeHeader(url, base, env, error, desc, scope) {
  let v = `Bearer realm="mgd-inspiration", resource_metadata="${oauthUrls(url, base, env).prm}"`;
  if (scope) v += `, scope="${scope}"`;
  if (error) v += `, error="${error}"`;
  if (desc) v += `, error_description="${String(desc).replace(/["\\]/g, "")}"`;
  return v;
}

// ---- connected apps (user-facing) -------------------------------------------------------------
async function listGrants(env, uid) {
  const rows = await env.DB.prepare(
    `SELECT g.id,g.client_id,g.scope,g.created_at,g.last_used_at,c.client_name,c.redirect_uris
       FROM oauth_grants g LEFT JOIN oauth_clients c ON c.client_id=g.client_id
      WHERE g.user_id=? AND g.revoked_at IS NULL
        AND EXISTS (SELECT 1 FROM oauth_tokens t WHERE t.grant_id=g.id AND t.kind='refresh' AND t.revoked_at IS NULL AND t.expires_at > ?)
      ORDER BY g.created_at DESC LIMIT 100`
  ).bind(uid, Date.now()).all();
  return (rows.results || []).map((r) => {
    let host = ""; try { host = new URL(JSON.parse(r.redirect_uris || "[]")[0]).host; } catch (_) {}
    return { id: r.id, client_name: r.client_name || "Unnamed app", redirect_host: host, scope: r.scope,
      connected_at: new Date(r.created_at).toISOString(), last_used_at: r.last_used_at ? new Date(r.last_used_at).toISOString() : null };
  });
}
async function revokeUserGrant(env, uid, grantId) {
  const g = await env.DB.prepare("SELECT id FROM oauth_grants WHERE id=? AND user_id=?").bind(grantId, uid).first();
  if (!g) return false;
  await revokeGrant(env, g.id, "revoked");
  return true;
}
const appsMac = (env, uid, exp) => hmac(env.SESSION_SECRET, `apps|${uid}|${exp}`);

// JSON API (session cookie): GET /api/me/connected-apps, DELETE /api/me/connected-apps/:id
export async function connectedAppsApi(request, env, grantId) {
  const user = await getUser(request, env);
  const hdr = { "Content-Type": "application/json", "Cache-Control": "no-store" };
  if (!user) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: hdr });
  if (request.method === "DELETE" && grantId) {
    // Lax session cookie isn't sent on cross-site DELETE; also require same-origin when the browser says so.
    const sfs = request.headers.get("Sec-Fetch-Site");
    if (sfs && sfs !== "same-origin" && sfs !== "none") return new Response(JSON.stringify({ error: "forbidden" }), { status: 403, headers: hdr });
    const ok = await revokeUserGrant(env, user.id, grantId);
    return new Response(JSON.stringify({ ok }), { status: ok ? 200 : 404, headers: hdr });
  }
  return new Response(JSON.stringify({ apps: await listGrants(env, user.id) }), { headers: hdr });
}

// HTML page: GET /account/connected-apps ; POST /account/connected-apps/revoke (form + CSRF)
export async function connectedAppsPage(request, url, env, base) {
  const user = await getUser(request, env);
  if (!user) return new Response(null, { status: 302, headers: { "Location": `${base}/auth/google/login?return=${encodeURIComponent(base + "/account/connected-apps")}` } });
  let notice = "";
  if (request.method === "POST") {
    const origin = request.headers.get("Origin");
    if (origin && origin !== publicOrigin(url, env)) return errorPage("Forbidden", "Cross-site form submission rejected.", 403);
    const f = await readForm(request);
    const [expStr, mac] = String(f.get("csrf") || "").split(".");
    const exp = parseInt(expStr, 10);
    if (!exp || exp < Date.now() || !mac || !safeEqual(mac, await appsMac(env, user.id, exp))) return errorPage("Expired", "The page expired — reload and try again.", 400);
    notice = (await revokeUserGrant(env, user.id, f.get("grant_id") || "")) ? "Disconnected." : "Not found.";
  }
  const apps = await listGrants(env, user.id);
  const exp = Date.now() + 3600000;
  const csrf = `${exp}.${await appsMac(env, user.id, exp)}`;
  const rows = apps.length ? apps.map((a) => `<li><div><strong>${escHtml(a.client_name)}</strong> <span class="muted">${escHtml(a.redirect_host)}</span><br>
<span class="muted">${escHtml(a.scope)} · connected ${escHtml(a.connected_at.slice(0, 10))}${a.last_used_at ? " · last used " + escHtml(a.last_used_at.slice(0, 10)) : ""}</span></div>
<form method="post" action="${escHtml(base)}/account/connected-apps/revoke"><input type="hidden" name="csrf" value="${escHtml(csrf)}"><input type="hidden" name="grant_id" value="${escHtml(a.id)}"><button type="submit">Disconnect</button></form></li>`).join("")
    : `<li class="muted">No apps are connected to your account.</li>`;
  const page = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Connected apps — MGD Inspiration</title>
<style>:root{--bg:#fafafa;--surface:#fff;--border:#e5e5e5;--text:#171717;--muted:#737373}
@media(prefers-color-scheme:dark){:root{--bg:#0f0f0f;--surface:#171717;--border:#262626;--text:#fafafa;--muted:#a3a3a3}}
body{margin:0;background:var(--bg);color:var(--text);font-family:system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif}
.wrap{max-width:560px;margin:2.5rem auto;padding:0 1rem}h1{font-size:1.2rem}ul{list-style:none;padding:0}
li{display:flex;justify-content:space-between;gap:1rem;align-items:center;background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:.8rem 1rem;margin:.5rem 0}
.muted{color:var(--muted);font-size:.85rem}button{font:inherit;padding:.4rem .8rem;border-radius:8px;border:1px solid var(--text);background:transparent;color:var(--text);cursor:pointer}</style></head>
<body><div class="wrap"><h1>Connected apps</h1><p class="muted">AI assistants and other apps you have allowed to use your MGD Inspiration boards (signed in as ${escHtml(user.email || user.name || "you")}).</p>
${notice ? `<p><strong>${escHtml(notice)}</strong></p>` : ""}<ul>${rows}</ul><p><a href="${escHtml(base)}/">← Back to the gallery</a></p></div></body></html>`;
  return new Response(page, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "X-Frame-Options": "DENY", "Content-Security-Policy": "frame-ancestors 'none'" } });
}
