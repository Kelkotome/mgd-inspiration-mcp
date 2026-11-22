# Deploy: app board links, Phase 1 (branch `app-boards-p1`, 23-Nov-2026)

Built and tested locally only (wrangler dev --local, throwaway D1). Nothing deployed, no remote D1/R2 writes.

## What it adds

- `POST /inspiration/api/app-boards`: create (201 `{id, token, url}`) or full replace with id + token (200 `{id, url}`)
- `DELETE /inspiration/api/app-boards/<id>` with an `X-Edit-Token` header: 204
- `GET /inspiration/app-board/<id>`: unlisted noindex page (`?format=md` gives the Markdown brief), `POST …/report`
- `POST /inspiration/api/admin/app-board` `{id, disabled: 0|1}` (Bearer ADMIN_TOKEN)
- A public MCP tool, `get_shared_board {board_id}`, on `/mcp` and `/mcp/all`. It is listed after `FONT_PAIRING_TOOL`, giving 113 tools. It is not in `/mcp/core`, but it can be called there.
- Daily cron `17 3 * * *`: boards not viewed or edited for 365 days (`APP_BOARD_EXPIRY_DAYS`) are marked expired and their content is wiped. The rows are deleted 90 days later (`APP_BOARD_PURGE_AFTER_DAYS`). A board past the window already reads as expired (410) before the cron runs.

## Files changed

| File | Change |
|---|---|
| `src/app_boards.js` | new: API, validation, page, Markdown, MCP tool, admin, cron cleanup |
| `src/text_filter.js` | new: conservative word lists (adult, slurs, spam) + link/phone spam rules |
| `src/index.js` | import; `/api/app-boards*` route placed before the generic `/api/` OPTIONS; `/app-board/*` + admin routes; tool registered + dispatched; cron call; `APP_BOARD_H` helpers |
| `src/moodboards.js` | `resolve()` is now exported (no behaviour change) |
| `migrate_app_boards.sql` | new table `app_boards` + 2 indexes (additive) |
| `tests/test_text_filter.mjs`, `tests/test_app_boards.mjs` | new node unit suites |
| `tests/app_boards_rpc.py`, `tests/app_boards_local_e2e.sh` | new local end-to-end suite + runner |
| `tests/r7_rpc.py`, `tests/r4_rpc.py`, `tests/mcp_r3_rpc.py`, `tests/test_mcp_r3.mjs` | tool count 112 → 113 (`get_shared_board` last) |

## Why a new table and not `mcp_moodboards` + a kind column

- The items are typed (palette, colour, font, note). `save_moodboard` view and edit parse `mcp_moodboards.items` as library ids only, so mixing the two would need changes in the live MCP tool.
- The two need different columns: expiry (`last_seen`) and a per-board update counter (`upd_day`, `upd_count`). Moodboards never expire, and the owner wanted that kept.
- The caps differ (60 items here, 30 for moodboards).

## D1 cost (rows_read)

- **Page view, `?format=md` or MCP call:** 2 queries. The board by primary key reads 1 row. Its library items by primary key read up to 60 rows. A view more than a day after the last one also runs one `UPDATE last_seen`.
- **Hidden, expired or missing board:** 1 query.
- **Create:** a count on `idx_app_boards_ip` (up to 20 rows), the library check (up to 60 rows), and the insert.
- **Update:** board by primary key, the library check, and the update.
- **Cron:** both statements use `idx_app_boards_seen`, so they read only the rows they change.

## Migration (live). Run one statement per line and do not use `--file`.

```sh
npx wrangler d1 execute mgd-inspiration --remote --command "CREATE TABLE IF NOT EXISTS app_boards (id TEXT PRIMARY KEY, edit_hash TEXT NOT NULL, title TEXT NOT NULL, notes TEXT, items TEXT NOT NULL DEFAULT '[]', ip_hash TEXT, created_at INTEGER NOT NULL, updated_at INTEGER, last_seen INTEGER NOT NULL, upd_day INTEGER NOT NULL DEFAULT 0, upd_count INTEGER NOT NULL DEFAULT 0, reports INTEGER NOT NULL DEFAULT 0, disabled INTEGER NOT NULL DEFAULT 0)"
npx wrangler d1 execute mgd-inspiration --remote --command "CREATE INDEX IF NOT EXISTS idx_app_boards_ip ON app_boards(ip_hash, created_at)"
npx wrangler d1 execute mgd-inspiration --remote --command "CREATE INDEX IF NOT EXISTS idx_app_boards_seen ON app_boards(last_seen)"
```

## Deploy order

1. Run the migration above. It is additive, and the current Worker ignores the new table.
2. Merge `app-boards-p1` into `museum-collection-2026-10`, then run `npx wrangler deploy`.
   - If the Worker goes out before the migration, the API answers 503 "not available yet", the page returns 404 and the MCP tool returns isError. Nothing crashes.
3. Run the live checks below.
4. Only after that, ship the app build that calls the API.

## Rollback

```sh
npx wrangler rollback <previous version id>
```

Get the version id from `npx wrangler deployments list` before deploying. The table can stay because nothing else reads it. To remove it fully:

```sh
npx wrangler d1 execute mgd-inspiration --remote --command "DROP TABLE IF EXISTS app_boards"
```

That deletes every shared board, so only do it if no app build uses the feature yet.

## Live checks

These create one board, check it and delete it. Use `curl -A curl/8.4.0 -H 'Accept: */*'`, as below.

```sh
U=https://madegooddesigns.com/inspiration
R=$(curl -s -A curl/8.4.0 -H 'Accept: */*' -H 'Content-Type: application/json' -X POST $U/api/app-boards \
  -d '{"title":"Deploy check","notes":"delete me","items":[{"kind":"palette","hexes":["#1F3A4D","#C9A77C"]},{"kind":"font","family":"Inter","weight":400,"licence":"SIL Open Font License 1.1"},{"kind":"note","text":"hello"}]}')
echo "$R"    # expect {"id":"…","token":"abt_…","url":"https://madegooddesigns.com/inspiration/app-board/…"}
ID=$(echo "$R" | python3 -c 'import json,sys;print(json.load(sys.stdin)["id"])'); TOK=$(echo "$R" | python3 -c 'import json,sys;print(json.load(sys.stdin)["token"])')
curl -s -o /dev/null -w '%{http_code}\n' -A curl/8.4.0 -H 'Accept: */*' $U/app-board/$ID                       # 200
curl -sI -A curl/8.4.0 -H 'Accept: */*' $U/app-board/$ID | grep -i x-robots-tag                                # noindex, nofollow
curl -s -A curl/8.4.0 -H 'Accept: */*' "$U/app-board/$ID?format=md" | head -12                                  # # Moodboard: Deploy check … ## Palette
curl -s -A curl/8.4.0 -H 'Accept: */*' -H 'Content-Type: application/json' -X POST $U/api/app-boards -d '{"title":"x","notes":"'$(printf 'n%.0s' {1..501})'","items":[]}'   # 400 field notes
curl -s -A curl/8.4.0 -H 'Accept: */*' -H 'Content-Type: application/json' -X POST $U/api/app-boards -d "{\"id\":\"$ID\",\"token\":\"abt_wrong\",\"title\":\"x\",\"items\":[]}" -w ' %{http_code}\n'   # 403
curl -s -A curl/8.4.0 -H 'Accept: */*' -H 'Content-Type: application/json' -H 'MCP-Protocol-Version: 2025-06-18' -X POST $U/mcp \
  -d "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/call\",\"params\":{\"name\":\"get_shared_board\",\"arguments\":{\"board_id\":\"$ID\"}}}" | head -c 400; echo
curl -s -o /dev/null -w '%{http_code}\n' -A curl/8.4.0 -H 'Accept: */*' -X DELETE -H "X-Edit-Token: $TOK" $U/api/app-boards/$ID   # 204
curl -s -o /dev/null -w '%{http_code}\n' -A curl/8.4.0 -H 'Accept: */*' $U/app-board/$ID                       # 404
```

Also check:

- `tools/list` on `/mcp` gives 113 tools: `python3 tests/r7_rpc.py https://madegooddesigns.com/inspiration` (its other checks are live-safe).
- Cloudflare: the `/inspiration` HTML cache rule already excludes `/inspiration`. The page sends `Cache-Control: no-store` anyway.

## Local tests (23-Nov-2026)

Run `bash tests/app_boards_local_e2e.sh`.

| Suite | Result |
|---|---|
| test_text_filter | 89/89 |
| test_app_boards | 59/59 |
| app_boards_rpc | 103 passed, 0 failed |
| r7_rpc | 33/33 |
| fp6_rpc | 18/18 |
| fp5_rpc | 14/14 |
| r4_rpc | 31/31 |
| rpc_moodboard_discovery | 48 passed, 5 failed |

- **rpc_moodboard_discovery:** the same 5 checks fail on the unchanged worker (51dc798) with the same small seed. They come from the seed (no UI rows, `get_font_pairing` in core, IP-less rate-limit counting), not from this change.
- **`tests/mcpux_local/run.sh 51dc798`:** its A/B checks assert the 2-Nov pre-UX baseline, so they already fail against any newer baseline. The only new difference is `get_shared_board` added. rpc45, rpc49–53, test_tools45–53 and rpc_designmd (same env-only fails as the baseline) pass. rpc48 fails on its schema-only seed (`featured_rank` missing).
- **`test_mcp_r3.mjs`:** 54/55, and the unchanged worker gets the same result. The one failure is the missing local D1 copy.

## Contract notes and deviations

- **Field names in 400s:** `body`, `title`, `notes`, `items`, and `items[N].kind|id|hexes|hexes[J]|source|mode|hex|family|weight|licence|sample|note|text`.
- **Error bodies:**
  - The filter answers exactly `{error: "text_not_allowed", field}`.
  - Other 400s add `code` (`too_long`, `count`, `format`, `type`, `enum`, `required`, `range`, `json`, `too_large`, `unknown_item`) and `limit` where one applies.
  - The `error` text states the limit, e.g. "notes must be 500 characters or fewer (it has 2000)".
- **Lengths:** too-long text is rejected, never truncated. Lengths count characters (code points) after whitespace and control-character cleanup.
- **Font licence:** free text up to 80 characters. The app sends the full name. O/A/U codes are also mapped. "SIL Open Font License 1.1", "Apache License 2.0" and "Ubuntu Font Licence 1.0" are shown as "free Google Font".
- **Hex colours:** any case is accepted. Hexes and mode are stored upper-case/normalised.
- **Statuses beyond the brief:**
  - 404 `{error:"not_found"}` for a missing board on update or delete.
  - 404 `{error:"expired"}` for an expired board on update or delete. The app treats this as gone.
  - 410 `{error:"board_unavailable"}` when updating a board hidden by reports or disabled by the admin.
  - 405 for wrong methods, and 503 if the table is missing.
- **Body over 32 KB:** returns 400 with field `body` (not 413), to keep the 400 `{error, field}` shape.
- **Create with a `token` but no `id`:** the token is ignored and a new board is created.
- **`url`:** always `${PUBLIC_ORIGIN}/inspiration/app-board/<id>`, which is `https://madegooddesigns.com/inspiration/app-board/<id>` with the live vars.
- **Reports:** work like moodboards: 3 reports hide a board, with no per-IP dedupe.
