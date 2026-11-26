# thumbs-r1: stored-only thumbnails for the phone app (deploy and rollback)

Branch `thumbs-r1` (from `origin/museum-collection-2026-10` = live Worker `0992abce`, mcp-img-r1 + monthly cap). Not deployed.

## What changes

- `GET /inspiration/img/t/<image_key>?src=app` (the app's contract) is **stored-only**:
  - R2 `thumb/<image_key>.jpg` exists (and is <= 60 KB) -> `200 image/jpeg`, `Cache-Control: public, max-age=31536000, immutable`
    (the edge-cache wrapper then sets `public, s-maxage=2592000, max-age=2592000`, same as today), `X-MGD-Thumb: stored`.
  - otherwise -> `302` to `/inspiration/img/<image_key>`, `Cache-Control: public, max-age=600`, `X-MGD-Thumb: none`.
    302s are never put in the colo cache, so the grid upgrades within ~10 minutes of the thumbnail being uploaded.
  - It never calls the Images binding, never reads or writes `thumb/_meta/transforms-YYYY-MM.json`, never reads the original.
  - Accepts `items|museum|annual|ui/…` keys (ui/ is new, app mode only); anything else -> 404.
- `GET /inspiration/img/t/<image_key>` without `src=app` (MCP widget) is unchanged: stored thumb, else a counted transform,
  else 302.
- Files: `src/mcp_gallery.js` (`serveStoredThumb`, `okAppKey`, `isAppThumb`, `serveThumb(…, opts)`), `src/index.js` (route passes
  `{ storedOnly: isAppThumb(url) }`), `tests/test_mcp_gallery.mjs` (+27 checks), `tests/img_local_e2e.sh` (app-mode checks in
  all 3 runs), `scripts/thumbs_backfill.py`, `scripts/thumbs_round.sh`.

## Tests (local, before deploy)

```bash
cd ~/Downloads/EtiennAubertBonn/mgd-inspiration-thumbs
node tests/test_mcp_gallery.mjs          # 63 passed, 0 failed
bash tests/img_local_e2e.sh              # 3 runs, "all checks passed" (app mode: 12 checks + "no transform counted, nothing written")
```

## Deploy

```bash
cd ~/Downloads/EtiennAubertBonn/mgd-inspiration-thumbs
npx wrangler deployments list | head      # note the CURRENT version id (expected 0992abce…) for rollback
npx wrangler deploy
```

## Verify after deploy (no transforms are triggered by these)

```bash
UA='curl/8.4.0'
# a pilot key that has a stored thumb -> 200 image/jpeg, X-MGD-Thumb: stored
curl -sI -A $UA -H 'Accept: */*' 'https://madegooddesigns.com/inspiration/img/t/museum/e73c95d5863d.jpg?src=app' | grep -iE '^HTTP|content-type|x-mgd-thumb|cache-control'
# a key that does not exist -> 302, Cache-Control: public, max-age=600, X-MGD-Thumb: none
curl -sI -A $UA -H 'Accept: */*' 'https://madegooddesigns.com/inspiration/img/t/items/zz-thumbs-r1-probe-000000.png?src=app' | grep -iE '^HTTP|location|x-mgd-thumb|cache-control'
# counter unchanged (count was 12 on 27-Nov 05:36 SGT, before and after the pilot)
npx wrangler r2 object get mgd-inspiration-images/thumb/_meta/transforms-$(date -u +%Y-%m).json --remote --pipe; echo
```
(`curl -I` sends HEAD; the route is GET-only, so if HEAD 404s use `curl -s -o /dev/null -D - …` instead.)

## Rollback

```bash
npx wrangler rollback <version id noted above>    # 0992abce…
```
The R2 thumbnails stay (harmless; the old route serves them too). Without stored-only mode, `?src=app` falls back to the old
behaviour (counted transforms), so tell the app agent to stop sending `src=app` traffic, or ship the app only after this deploy.

**Important for the app agent:** until this is deployed, `?src=app` is ignored by the live Worker, so app requests for keys
without a stored thumb DO trigger counted transforms. Keep the app off live traffic until the deploy.

## Backfill (thumbnails for the whole library)

`scripts/thumbs_backfill.py`, state in `~/.mgd-thumbs/` (keys cache `keys.json`, `done.txt`, `failed.tsv`, `run.log`, `STOP`).

- Keys: one D1 query (`status='published'`, ~109k rows read) was run on 27-Nov and cached; reruns read nothing from D1.
  108,940 keys match the route: design PNG 69,668, Unsplash 12,051, museum 10,913, annual 10,908, ui 5,390, design JPG 10.
  (32 `user/…` uploads are not covered by the route and are skipped.)
- Thumbs: same as the Worker (fit 320x400, no enlarging, white background, JPEG q72; 240/q55 fallback; > 60 KB skipped).
  ui/ screens: 320 px wide, top-cropped at 1600 px (240/1200 fallback) so tall full-page shots are not 15 px slivers.
- Source: public site `/inspiration/img/<key>` (UA curl/8.4.0, 4 workers, <= 6 req/s, global back-off on 429/403).
  R2 S3 credentials do not exist (no `R2_ACCESS_KEY_ID` etc. in `.env` / `.dev.vars`), so uploads use
  `wrangler r2 bulk put --remote` (OAuth), throttled to 900 objects per rolling 5 min (account API limit 1,200 / 5 min, so
  deploys, purges and wrangler D1 calls keep ~300 / 5 min).
- Projection: **~10 h** (upload-bound at 3/s; downloads alone ~6 h at ~5/s). Storage **~1.0 GB** (avg ~9.2 KB/thumb),
  ~109k R2 Class A writes + ~109k Worker requests and R2 reads for the originals.
- Faster option: create an R2 API token (dashboard -> R2 -> Manage API tokens, Object Read & Write on `mgd-inspiration-images`),
  put `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` in `~/Downloads/EtiennAubertBonn/.env`, `pip install boto3`,
  then add `--concurrency 16`: originals come from R2 directly and uploads go over S3 (no API limit), est. 1–2 h.
  (S3 mode is written but untested, no credentials to test with; try `--limit 20` first.)

Full run (quiet window: no library ingest, no WP publishing; Mac on for ~10 h, e.g. 23:00–06:00 + resume next window):
```bash
cd ~/Downloads/EtiennAubertBonn/mgd-inspiration-thumbs
caffeinate -i python3 scripts/thumbs_backfill.py 2>&1 | tee -a ~/.mgd-thumbs/full.out
# stop cleanly: touch ~/.mgd-thumbs/STOP   (rm it to resume; done keys are skipped)
# after this deploy, add --check-remote to also skip keys whose thumb is already live (Worker-made ones)
```

## Future library rounds

`scripts/thumbs_round.sh [YYYY-MM-DD]` = `thumbs_backfill.py --since <day>`: one indexed D1 query (rows read ~ new items,
e.g. 442 for 26-Nov), then thumbs for that round's new items only. Hook it into each `lib_rNNN*.sh` round script after `hyg`
(dedupe hygiene + purge), i.e. after `ingest_staged.py --go` / `ingest_museum.py` has merged, outside publisher windows:
```bash
bash /Users/eugeneleow/Downloads/EtiennAubertBonn/mgd-inspiration-thumbs/scripts/thumbs_round.sh "$(date -u +%Y-%m-%d)"
```
The live ingest scripts were not changed. Items removed by hygiene after the thumbs were made only leave an orphan ~10 KB object.
Until a round's thumbs exist, the app gets the 302 to the original (no transform).
