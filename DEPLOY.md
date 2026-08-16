# MGD Inspiration — deploy guide (Phase 0)

Serverless on your existing Cloudflare account: **Workers** (API + gallery + curation UI), **D1** (data), **R2** (images). No VPS. Cost ≈ $0–5/month.

Everything below is run from this folder:
```
cd "Made Good Designs/../mgd-inspiration"   # the mgd-inspiration/ directory
```
`npx wrangler …` uses the wrangler that's already installed. Steps marked **(interactive)** open a browser / prompt for input — in this Claude Code session you can run them yourself by typing `! <command>` so the output lands in the chat.

---

## 1. Log in to Cloudflare (interactive)
```
! npx wrangler login
```
Approve in the browser. (Uses whatever Cloudflare account owns madegooddesigns.com.)

## 2. Create the D1 database
```
npx wrangler d1 create mgd-inspiration
```
Copy the `database_id` it prints into **wrangler.jsonc** → replace `REPLACE_WITH_D1_DATABASE_ID`.

## 3. Create the R2 bucket
```
npx wrangler r2 bucket create mgd-inspiration-images
```

## 4. Create the tables (remote D1)
```
npx wrangler d1 execute mgd-inspiration --remote --file=./schema.sql
```

## 5. Set the secrets (interactive — never in git)
```
! npx wrangler secret put NVIDIA_API_KEY
```
Paste the `nvapi-…` key for the **primary** model (Llama **11B** — fast, ~5–8s).
```
! npx wrangler secret put NVIDIA_API_KEY_FALLBACK
```
Paste the `nvapi-…` key for the **fallback** model (Llama **90B**). (If one key works for both — NVIDIA keys are usually account-wide — you can skip this; the fallback reuses `NVIDIA_API_KEY`.)
```
! npx wrangler secret put ADMIN_TOKEN
```
Paste a long random string (gates `/add` curation, delete, and the CSV user export). Keep a copy.
```
! npx wrangler secret put SESSION_SECRET
```
Paste another long random string (signs login session cookies).
```
! npx wrangler secret put GOOGLE_CLIENT_ID
! npx wrangler secret put GOOGLE_CLIENT_SECRET
```
From the Google OAuth client you create in **step 5b** below.

### 5b. Create the Google sign-in credentials
Sign-in uses Google OAuth. One-time setup in the **Google Cloud Console** (console.cloud.google.com):
1. Create (or pick) a project → **APIs & Services → Credentials → Create Credentials → OAuth client ID**.
2. Application type: **Web application**.
3. **Authorized redirect URIs** — add both:
   - `https://<your-worker-or-domain>/auth/google/callback` (prod — e.g. `https://madegooddesigns.com/inspiration/auth/google/callback` if route-mounted, or the `…workers.dev` URL)
   - `http://localhost:8787/auth/google/callback` (local testing)
4. Copy the **Client ID** and **Client secret** → those are the two secrets in step 5 above.
5. (First time) configure the OAuth consent screen — External, add your email as a test user, scopes `openid email profile`.

Note: the redirect URI must EXACTLY match the deployed URL (including `/inspiration` if you route-mount). Update it in Google if you change the mount.

## 6. Deploy
```
npx wrangler deploy
```
You'll get a URL like `https://mgd-inspiration.<your-subdomain>.workers.dev`.

## 7. Smoke test
- Visit `…workers.dev/add` → paste your ADMIN_TOKEN → drop 2–3 typography/brand images, add a source URL → **Save**. Tags + description should come back from NVIDIA (empty = the key/model needs a look — see Troubleshooting).
- Visit `…workers.dev/` → the gallery shows what you added. Click a card → palette + HEX/RGB/OKLCH toggle, source as plain text.

---

## 8. Put it on the main domain at `/inspiration/` (the SEO-critical step)

**Option A — Cloudflare Route (recommended: everything on madegooddesigns.com, best SEO).**
1. In **wrangler.jsonc**, add a `vars` entry `"BASE_PATH": "/inspiration"`, then add a route and redeploy:
   ```jsonc
   "routes": [{ "pattern": "madegooddesigns.com/inspiration*", "zone_name": "madegooddesigns.com" }]
   ```
   ```
   npx wrangler deploy
   ```
2. Now `https://madegooddesigns.com/inspiration/` serves the gallery, `/inspiration/add` the curation UI, all on the main domain. The Worker route runs at the Cloudflare edge *before* WordPress, so it doesn't touch 20i.
   - Note: this path is served by the Worker, not WordPress — WordPress owns every other URL untouched.

**Option B — quickest (embed the gallery in a WordPress page).**
- Keep the Worker on its `…workers.dev` URL. Create a WP page at `/inspiration/`, add a Custom HTML block containing the contents of `src/ui/gallery.html` **with this line added before the `<script>`**:
  ```html
  <script>window.MGD_API_BASE = "https://mgd-inspiration.<your-subdomain>.workers.dev";</script>
  ```
  Images + data load cross-origin from the Worker (CORS is already allowed for madegooddesigns.com). Curation stays private on the workers.dev `/add`.

Option A is better for SEO (gallery + images on the main domain). Option B ships in 5 minutes.

---

## Local development
```
cp .dev.vars.example .dev.vars     # then fill in ADMIN_TOKEN (+ NVIDIA_API_KEY to test tagging)
npx wrangler d1 execute mgd-inspiration --local --file=./schema.sql
npx wrangler dev
```
Open http://localhost:8787/ (gallery) and /add (curation).

## Troubleshooting
- **Tags come back empty on save** → the NVIDIA call failed (item still saves). The save response includes `enrich_error`. Common causes: wrong `NVIDIA_MODEL` id (must be a *vision* model — set it in wrangler.jsonc `vars`), key not set, or the probe image exceeded the inline limit (the curation UI already downsizes to 672px, which stays under it). Swap `NVIDIA_MODEL` to a Qwen-VL id to compare.
- **429 from NVIDIA** → free tier is 40 req/min; curate in small batches or request the 200 RPM upgrade.
- **CORS error when embedded (Option B)** → confirm `ALLOWED_ORIGIN` in wrangler.jsonc is `https://madegooddesigns.com`.

## Built now
Gallery + curation + NVIDIA auto-tagging · **curated themes** (browse + SEO) · **Google sign-in** · **mood boards** (save/create/view) · **newsletter opt-in** + **admin CSV export** of signups & engagement (`/api/admin/export/users.csv`, Bearer ADMIN_TOKEN — opens in Excel).

## Still deferred
Actually *sending* the monthly newsletter (wire the opted-in export into Resend/Buttondown once there's demand), the MCP server, semantic "search by vibe" (Vectorize), shared/public boards, and programmatic SEO theme pages. All reuse this same Worker + D1 + R2 — no rework.

## Testing accounts locally without Google
Set `DEV_LOGIN="1"` in `.dev.vars`, then visit `http://localhost:8787/auth/dev-login?email=you@example.com` to get a session and try boards/saves. Never enable `DEV_LOGIN` in production.
