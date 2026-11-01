# b60 AI design tools: Worker endpoint (built 2-Nov-2026, NOT deployed)

Branch `b60-ai` (worktree `../mgd-inspiration-b60`). Code: `src/ai_tools.js` (+8 lines in `src/index.js`, 5 vars in `wrangler.jsonc`), table `migrate_ai_usage.sql`.
Front ends: `/tools/image-describer/` and `/tools/image-to-prompt/` (tool-gap-2026-10 batch 60, group e). They refuse to publish until `/api/ai/health` answers `ai:true` live.
User script: `scratchpad/deploy_b60_ai.sh` (refuses until the secrets and the site key below exist).

## Endpoints (base `https://madegooddesigns.com/inspiration`)
- `GET /api/ai/health` → `{ok, ai, model:"claude-haiku-5-5", limit, remaining, budget_ok, turnstile_sitekey, resets}`, `Cache-Control: no-store`. `ai` is true only when `ANTHROPIC_API_KEY` and `TURNSTILE_SECRET` exist and today's budget is not spent.
- `POST /api/ai/describe` `{mode: describe|alt|prompt, image: data URL, turnstile, detail?, context?, style?}` → `{ok, mode, result, remaining, limit, resets}`.
  Errors `{ok:false, error, message}`: 400 bad_request / bad_mode / bad_image, 413 too_large, 403 turnstile / origin, 429 daily_limit (`remaining:0, resets`), 503 budget / unavailable.

## Secrets and vars (set by the user; agents never run `secret put`)
```
cd ~/Downloads/EtiennAubertBonn/mgd-inspiration
./node_modules/.bin/wrangler secret put ANTHROPIC_API_KEY     # Console API key (spare credits), never client-side
./node_modules/.bin/wrangler secret put TURNSTILE_SECRET      # secret key of the Turnstile widget
```
Turnstile widget: Cloudflare dashboard → Turnstile → Add widget → hostname `madegooddesigns.com`, mode **Invisible** → copy the **site key** (public) and run the deploy script as `TURNSTILE_SITE_KEY=<site key> zsh deploy_b60_ai.sh` (it writes it into `wrangler.jsonc` vars and commits). Vars: `AI_DAILY_PER_IP` (20), `AI_DAILY_BUDGET_USD` (3), optional `AI_PRICE_IN_PER_MTOK` / `AI_PRICE_OUT_PER_MTOK`, `ANTHROPIC_BASE_URL` (tests only). `DEV_ALLOW_LOCAL` and `TURNSTILE_BYPASS_LOCAL` are local-test vars only; never set them in production (bypass is ignored unless the request host is localhost anyway).

Also set a **Console workspace spend limit** for the key's workspace (hard backstop above the Worker's $3/day).

## Model call
Raw `POST https://api.anthropic.com/v1/messages`, headers `x-api-key`, `anthropic-version: 2026-10-21`. Body: `model: claude-haiku-5-5`, `max_tokens: 1500`, fixed system prompt per mode, `output_config: {effort: "low", format: {type: "json_schema", schema}}` (strict schemas), one base64 image block + one text block. No temperature/top_p/top_k (400 on Haiku 5.5), no thinking budget (adaptive thinking is on by default; thinking tokens bill as output, hence max_tokens 1500 rather than 600). The output is re-validated and clipped server-side (alt ≤ 125 chars, hex normalised); a refusal, truncation or bad JSON returns 503 unavailable. Upstream text is never returned or logged (status code only).

## Cost and caps
Price used: Haiku 5.5 $0.10 in / $0.50 out per MTok (prompts ≤ 100K tokens; claude-api skill, cached 2026-10-06; same as the scope). A 1024 × 768 image ≈ 1,050 tokens + ~400 prompt tokens.
- Typical call (1,500 in / 350 out) = **$0.000325** (≈ $0.33 per 1,000 calls); worst case (1,800 in / 1,500 out cap) ≈ $0.00093.
- **20 calls per IP per UTC day**; **$3/day global kill-switch** (≈ 9,000 typical calls, ≥ 3,200 worst case), checked before every upstream call from the summed `usage` × price (micro-dollars in D1). Maximum spend ≈ $3/day ≈ $90/month.
- IP use is reserved atomically before the call (`INSERT … ON CONFLICT … RETURNING n`), refunded on upstream/network/parse failures; a completed call (incl. a refusal) counts. Validation and Turnstile failures never use a call.
- Image: JPEG/PNG/WebP data URL, magic bytes must match the declared type, ≤ 1.5 MB decoded, ≤ 1024 px long edge (read from the file header); body ≤ 2.2 MB.
- Origin: a present `Origin` must be `https://madegooddesigns.com`; CORS never reflects other origins.
- Privacy: the IP is stored only as a salted SHA-256 prefix (salt `AI_IP_SALT` or `SESSION_SECRET`); no image, prompt or output is stored. Counters older than 7 days are deleted by the existing daily cron.

## Tests
- `node tests/test_ai_caps.mjs`: 75 pure unit tests (cost maths, per-IP cap, kill-switch at exactly $3, day roll-over, refunds, IP hashing, origin/CORS rules, PNG/JPEG/progressive JPEG/WebP VP8/VP8L/VP8X header parsing, size limits, request body shape, strict schemas, output validation and repair).
- `zsh tests/run_ai_local.sh [BASELINE_REF]`: seeds two throwaway local D1s, starts `tests/ai_mock_server.py` (mock Messages API; checks the request shape), the new Worker and a baseline Worker (git archive of BASELINE_REF) with `wrangler dev --local`, then `tests/rpc_ai.py`: 45 checks (health, 3 modes, WebP/PNG, validation, 403s, 413s, upstream 500 not leaked, refunds, refusal, 21st call → 429, budget → 503 + health `ai:false`, kill-switch blocks before the upstream call, MCP tools/list + instructions + sample tool calls + /api/feed byte-identical to the baseline). Turnstile verification is bypassed offline (`TURNSTILE_BYPASS_LOCAL=1`, localhost only); a missing token is still refused.
- Live smoke (no spend; never sends a valid Turnstile token): `python3 tests/rpc_ai.py --live --base https://madegooddesigns.com`.

## Rollback
`./node_modules/.bin/wrangler rollback` (previous version), or `git revert` the merge commit and redeploy. The `ai_usage` table can stay (harmless). To switch the AI off without a deploy: `wrangler secret delete ANTHROPIC_API_KEY` (health → `ai:false`, the pages show "AI unavailable"), or set `AI_DAILY_BUDGET_USD` to 0.
