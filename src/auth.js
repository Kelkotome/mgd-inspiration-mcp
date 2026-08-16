// MGD Inspiration — auth: Google OAuth 2.0 + signed session cookie.
// Session cookie "mgd_sess" = base64url(JSON{uid,exp}).HMAC-SHA256(payload, SESSION_SECRET).

const SESSION_COOKIE = "mgd_sess";
const STATE_COOKIE = "mgd_oauth_state";
const RETURN_COOKIE = "mgd_return";
const safePath = (p) => (typeof p === "string" && /^\/[^/]/.test(p)) ? p : null; // same-origin path, no "//"
const SESSION_TTL = 60 * 60 * 24 * 30; // 30 days (seconds)

// ---- base64url + HMAC ------------------------------------------------------
const enc = (s) => new TextEncoder().encode(s);
function b64urlFromBytes(bytes) {
  let bin = ""; for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
const b64url = (str) => b64urlFromBytes(enc(str));
function b64urlDecode(s) {
  s = s.replace(/-/g, "+").replace(/_/g, "/"); while (s.length % 4) s += "=";
  return atob(s);
}
async function hmac(secret, data) {
  const key = await crypto.subtle.importKey("raw", enc(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc(data));
  return b64urlFromBytes(new Uint8Array(sig));
}

async function signSession(uid, secret) {
  const payload = b64url(JSON.stringify({ uid, exp: Math.floor(Date.now() / 1000) + SESSION_TTL }));
  const sig = await hmac(secret, payload);
  return `${payload}.${sig}`;
}
async function verifySession(token, secret) {
  if (!token || token.indexOf(".") < 0) return null;
  const [payload, sig] = token.split(".");
  if ((await hmac(secret, payload)) !== sig) return null;
  try {
    const obj = JSON.parse(b64urlDecode(payload));
    if (!obj.uid || !obj.exp || obj.exp < Math.floor(Date.now() / 1000)) return null;
    return obj.uid;
  } catch (_) { return null; }
}

// ---- cookies ---------------------------------------------------------------
function parseCookies(request) {
  const h = request.headers.get("Cookie") || "";
  const out = {};
  h.split(";").forEach((p) => { const i = p.indexOf("="); if (i > 0) out[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim()); });
  return out;
}
function cookie(name, value, { maxAge, secure, httpOnly = true } = {}) {
  let c = `${name}=${encodeURIComponent(value)}; Path=/; SameSite=Lax`;
  if (httpOnly) c += "; HttpOnly";
  if (secure) c += "; Secure";
  if (maxAge != null) c += `; Max-Age=${maxAge}`;
  return c;
}
const isSecure = (url) => url.protocol === "https:";

// ---- current user ----------------------------------------------------------
export async function getUser(request, env) {
  if (!env.SESSION_SECRET) return null;
  const uid = await verifySession(parseCookies(request)[SESSION_COOKIE], env.SESSION_SECRET);
  if (!uid) return null;
  const u = await env.DB.prepare("SELECT id,email,name,picture,newsletter_opt_in FROM users WHERE id=?").bind(uid).first();
  return u || null;
}

async function upsertUser(env, profile) {
  const now = Date.now();
  const existing = await env.DB.prepare("SELECT id FROM users WHERE google_sub=? OR email=?").bind(profile.sub, profile.email).first();
  if (existing) {
    await env.DB.prepare("UPDATE users SET name=?,picture=?,last_active_at=? WHERE id=?")
      .bind(profile.name || null, profile.picture || null, now, existing.id).run();
    return existing.id;
  }
  const id = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
  await env.DB.prepare("INSERT INTO users (id,google_sub,email,name,picture,newsletter_opt_in,created_at,last_active_at) VALUES (?,?,?,?,?,0,?,?)")
    .bind(id, profile.sub, profile.email || null, profile.name || null, profile.picture || null, now, now).run();
  return id;
}

// ---- Google OAuth ----------------------------------------------------------
function redirectUri(url, base) { return `${url.origin}${base}/auth/google/callback`; }

export async function googleLogin(request, url, env, base) {
  if (!env.GOOGLE_CLIENT_ID) return new Response("Google OAuth not configured", { status: 500 });
  const state = crypto.randomUUID();
  const ret = safePath(url.searchParams.get("return"));
  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri(url, base),
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "online",
    prompt: "select_account",
  });
  const headers = new Headers({ "Location": `https://accounts.google.com/o/oauth2/v2/auth?${params}` });
  headers.append("Set-Cookie", cookie(STATE_COOKIE, state, { maxAge: 600, secure: isSecure(url) }));
  if (ret) headers.append("Set-Cookie", cookie(RETURN_COOKIE, ret, { maxAge: 600, secure: isSecure(url) }));
  return new Response(null, { status: 302, headers });
}

export async function googleCallback(request, url, env, base) {
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const savedState = parseCookies(request)[STATE_COOKIE];
  if (!code || !state || state !== savedState) return new Response("OAuth state mismatch", { status: 400 });

  // exchange code for tokens
  const tokRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code, client_id: env.GOOGLE_CLIENT_ID, client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri(url, base), grant_type: "authorization_code",
    }),
  });
  if (!tokRes.ok) return new Response(`token exchange failed: ${(await tokRes.text()).slice(0, 200)}`, { status: 502 });
  const tok = await tokRes.json();

  // fetch profile
  const uiRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { "Authorization": `Bearer ${tok.access_token}` },
  });
  if (!uiRes.ok) return new Response("userinfo failed", { status: 502 });
  const p = await uiRes.json(); // { sub, email, name, picture }

  const uid = await upsertUser(env, p);
  const sess = await signSession(uid, env.SESSION_SECRET);
  // Each cookie MUST be its own Set-Cookie header — never comma-joined.
  const dest = safePath(parseCookies(request)[RETURN_COOKIE]) || `${base}/`;
  const headers = new Headers({ "Location": dest, "Cache-Control": "no-store" });
  headers.append("Set-Cookie", cookie(SESSION_COOKIE, sess, { maxAge: SESSION_TTL, secure: isSecure(url) }));
  headers.append("Set-Cookie", cookie(STATE_COOKIE, "", { maxAge: 0, secure: isSecure(url) }));
  headers.append("Set-Cookie", cookie(RETURN_COOKIE, "", { maxAge: 0, secure: isSecure(url) }));
  return new Response(null, { status: 302, headers });
}

export function logout(url, base) {
  return new Response(null, {
    status: 302,
    headers: { "Location": `${base}/`, "Set-Cookie": cookie(SESSION_COOKIE, "", { maxAge: 0, secure: isSecure(url) }) },
  });
}

// Local-only shortcut so boards can be tested without real Google creds.
// Never active in production (guarded by env.DEV_LOGIN === "1").
export async function devLogin(request, url, env, base) {
  if (env.DEV_LOGIN !== "1") return new Response("not found", { status: 404 });
  const email = url.searchParams.get("email") || "dev@example.com";
  const uid = await upsertUser(env, { sub: "dev-" + email, email, name: url.searchParams.get("name") || "Dev User", picture: "" });
  const sess = await signSession(uid, env.SESSION_SECRET);
  return new Response(null, {
    status: 302,
    headers: { "Location": `${base}/`, "Set-Cookie": cookie(SESSION_COOKIE, sess, { maxAge: SESSION_TTL, secure: isSecure(url) }) },
  });
}
