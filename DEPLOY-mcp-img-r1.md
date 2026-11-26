# mcp-img-r1: pictures in chat + MCP Apps gallery (deploy and rollback)

Branch `mcp-img-r1` (worktree `~/Downloads/EtiennAubertBonn/mgd-inspiration-mcp-img`), cut from `origin/museum-collection-2026-10` at 5f12444.
Local commit only. Nothing deployed, nothing written to remote D1 or R2.

## What changes (search_design_inspiration, browse_inspiration_by_theme, search_museum_art, search_annual_reports; /mcp, /mcp/core, /mcp/all, /mcp/boards)
- **Text:** every public item's second line is `View on Made Good Designs: <page>?utm_…`. Pages: museum `/inspiration/museum/<slug>-<year>-<id>`,
  annual report `/inspiration/annual-reports/<slug>-<year>-<id>`, design item `/inspiration/#i/<id>` (the gallery's deep link; utm goes before the hash).
  The old `page (cite this):` line is replaced by it. The museum's own `museum page: <url>` line is removed; the museum is still named
  (`collection: <museum> (public domain / CC0)`). `image:` lines stay (annual reports included). Link-only non-commercial records (MCP opt-in) are unchanged.
- **Image blocks:** up to 3 MCP `image` blocks (base64, `image/jpeg` or the original's type, each ≤ 60 KB) after the text, for the top 3 items.
  Source order: R2 `thumb/<image_key>.jpg` → Cloudflare Images binding resizes the R2 original (320 px, q72; then 240 px, q55) and stores it to
  `thumb/…` → the original if already ≤ 60 KB → skipped. 2.5 s budget for all three; errors and timeouts only drop that picture.
- **structuredContent** `{ title, site, items: [{ id, title, subtitle, image_url, thumb_url, page_url, collection, source, licence?, width, height }] }`
  (+ `outputSchema` in tools/list), only for clients sending `MCP-Protocol-Version >= 2025-06-18` (same rule as the existing structured tools).
- **MCP Apps:** resource `ui://mgd/gallery-v1.html` (`text/html;profile=mcp-app`, SEP-1865 spec 2026-01-26) via `resources/list` / `resources/read`;
  tools carry `_meta.ui.resourceUri` (+ deprecated `_meta["ui/resourceUri"]` and `_meta["openai/outputTemplate"]`). Resource `_meta.ui.csp`
  `{ resourceDomains: ["https://madegooddesigns.com"], connectDomains: [] }` (+ legacy `openai/widgetCSP`). `initialize` adds
  `capabilities.resources` and `capabilities.extensions["io.modelcontextprotocol/ui"]`.
- **New route** `GET /inspiration/img/t/<image_key>`: the thumbnail (colo-cached 30 days), else 302 to the original.
- **wrangler.jsonc:** `"images": { "binding": "IMAGES" }`.
- **Monthly transform cap (owner OK 27-Nov, hard cap 5,000 per UTC calendar month):** every attempted Images transform (success or
  failure) is counted in R2 `thumb/_meta/transforms-YYYY-MM.json` (read-modify-write, no D1) before the call. New transforms stop at
  `MCP_THUMB_MONTHLY_CAP` (default **4900**, a 100-transform margin for races between isolates; reservations inside one isolate are
  serialised). The counter is also remembered per isolate, so a capped isolate stops reading R2. Once capped: stored thumbnails and
  originals ≤ 60 KB still work, other items get no picture, `/img/t/` redirects to the original. An unreadable counter = no transform.
  The count resets with the new month's object (UTC). A log line `mcp-thumbs: monthly transform cap reached (n/cap, YYYY-MM)` is printed once per isolate.
- **Read the count:** `curl -s -A curl/8.4.0 -H "Authorization: Bearer $ADMIN_TOKEN" https://madegooddesigns.com/inspiration/api/admin/thumb-transforms`
  → `{ month, count, cap, capped, binding, key }` (admin-only, one R2 read, no D1). Or open the R2 object in the dashboard.
- No new D1 queries. Kill switches (vars): `MCP_THUMBS="0"` (no image blocks), `MCP_THUMB_STORE="0"` (no thumbnail writes; the counter is still written), `MCP_THUMB_MONTHLY_CAP="0"` (no transforms at all).

## Before deploying
1. Cloudflare bot protection challenges browser requests to `/inspiration/img/*` from some IPs (`cf-mitigated: challenge` seen 27-Nov for
   headless Chrome). A challenged `<img>` inside a chat app's sandboxed iframe cannot be solved, so the gallery would show blank tiles.
   Add a WAF custom rule **Skip** (or a Configuration Rule turning off Bot Fight / security level) for
   `http.request.uri.path starts_with "/inspiration/img/"`. Images are static and public, so this is low-risk.
2. Cloudflare Images must be available on the account (free plan: 5,000 unique transformations / month; each item is resized once, then
   served from R2 `thumb/…`; the code stops at 4,900 attempts a month, see above). If you would rather not, delete the `"images"` block: image blocks then come only from originals ≤ 60 KB
   (most annual reports, few museum or design images) and the gallery falls back to full-size images.

## Deploy
```
cd ~/Downloads/EtiennAubertBonn/mgd-inspiration-mcp-img
git log --oneline -3                  # the mcp-img-r1 commit on top of 5f12444
npx wrangler deployments list | head  # note the CURRENT version id (for rollback)
npx wrangler deploy
```
Smoke test (curl UA per the WAF note):
```
curl -s -A curl/8.4.0 -H 'Content-Type: application/json' -H 'Accept: application/json, text/event-stream' -H 'MCP-Protocol-Version: 2025-06-18' \
  https://madegooddesigns.com/inspiration/mcp/core -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"search_museum_art","arguments":{"query":"mucha poster","limit":3}}}' \
  | python3 -c "import sys,json;r=json.load(sys.stdin)['result'];print(r['content'][0]['text'][:600]);print([c['type'] for c in r['content']]);print(len(r['structuredContent']['items']))"
curl -s -o /dev/null -w '%{http_code} %{content_type} %{size_download}\n' -A curl/8.4.0 https://madegooddesigns.com/inspiration/img/t/museum/ac7e784402a1.jpg
```
Expect: text with `View on Made Good Designs:` and no `artic.edu`; `['text','image','image','image']`; 3 items; thumbnail `200 image/jpeg` under 61440 bytes.
Then connect the server in Claude (web + phone) and ChatGPT (developer mode) and run "show me Mucha posters".

## Rollback
```
npx wrangler rollback <version id noted above>
```
Code-free switches without a redeploy of new code: set `MCP_THUMBS=0` in the dashboard (Workers → mgd-inspiration → Settings → Variables).
R2 `thumb/` objects are harmless if left; to remove: list and delete the `thumb/` prefix in the R2 dashboard.

## Tests (local, 27-Nov)
- `bash tests/img_local_e2e.sh` (wrangler dev --local, throwaway D1 + R2; run a with the Images binding, run b without, run c with the binding and `MCP_THUMB_MONTHLY_CAP=0`): **495 + 423 + 423 passed, 0 failed**; resized thumbnail stored to local R2; counter object (a: 7) and `/api/admin/thumb-transforms` checked in all three (401 without the token).
- `node tests/test_mcp_gallery.mjs`: 41 passed (fallbacks, R2/Images errors, timeout budget, kill switches, item shape, resources; monthly cap: reached then no transform, /img/t/ redirect when capped, stored count from other isolates honoured, failed attempts counted, unreadable counter fails closed, cap 0, env override, UTC month rollover, parallel reservations).
- `node tests/img/widget_render.mjs`: 33 passed (fake MCP Apps host: ui/initialize → tool-result → render, tap → ui/open-link, size-changed, dark theme; ChatGPT window.openai path; foreign URLs dropped). Screenshots in `out/`.
- `bash tests/test_nc_exclusion.sh`: all passed (assertion updated to the new lead line). `bash tests/r7_local_e2e.sh`: same result as the base commit (1 known failure, `get_font_pairing 'Noto Sans Thai'`, also fails on 5f12444).
- Node suites unchanged vs base: test_next_offer, test_ui_hint, test_ip_notice, test_search_n11, test_text_filter, test_mcp_errors_r1, test_app_boards, test_tools80, test_design.
- `wrangler deploy --dry-run`: bundles (bindings DB, BUCKET, IMAGES).
- Expected difference: `run_local_tests.sh` diffs public /mcp answers byte-for-byte against the main checkout, so the 4 library tools differ by design.
