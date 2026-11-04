# FTS5 library search: apply in a quiet window (runbook, 5-Nov-2026)

The code has been live since Worker 94742446 / b4c2539f (commit 5a1a7f6). It stays dormant until `items_fts` exists.
`ftsSearch()` in `src/search_extras.js` checks `sqlite_master` once every 10 min per isolate. If the table is missing, a query errors,
or a search gets 0 FTS hits, the call runs the old LIKE search. Kill switch: Worker var `SEARCH_FTS=0`.

## What it does
- `items_fts`: an external-content FTS5 table over `items` (title, company, designer, tags, themes, industry, country, category,
  description). Tokenizer `porter unicode61 remove_diacritics 2`, `prefix='2 3'`, bm25 column weights 10/8/6/5/3/3/2/2/1.
- Search tiers: exact phrase → all words → any word (re-ranked by how many query words a row has, then bm25) → word
  prefixes (only when nothing matched whole words). Museum: the 48 featured works get a small boost.
- Triggers `items_fts_ai/ad/au`. The update trigger fires only when an indexed text column changes, so status, featured_on
  and palette updates don't re-index.

## Pre-checks (all must hold)
1. `pgrep -fl "qnight|pubseq|run_round|_r58_chain|_r59|seed|wrapup"` returns nothing, and the Unsplash and annual-reports agents
   are idle (their insert windows end around 12:00 SGT). The TAGS agent's bulk tag UPDATE is either finished or paused. If it runs
   after the migration, that is fine: the triggers re-index each updated row.
2. Take the deploy lock: `mkdir …/scratchpad/n11/deploy.lock` and write the owner and time into it.
3. Note the live Worker version (`npx wrangler deployments list | tail -5`). No Worker deploy is needed for this step.
4. Backup: `npx wrangler d1 time-travel info mgd-inspiration` and note the bookmark. D1 Time Travel can restore to it.

## Apply (~1 min)
```
cd ~/Downloads/EtiennAubertBonn/mgd-inspiration
npx wrangler d1 execute mgd-inspiration --remote -y --command "$(cat migrate_fts.sql)"
```
Do not use `--file`: remote `--file` runs as an import, which takes the DB offline while it runs. Use `--command` with the file's
text, or run the statements one at a time. The order is table → triggers → `rebuild`. Because `rebuild` re-reads every row, a row
inserted in between is neither lost nor doubled. Locally, `rebuild` takes 0.9 s over 80,880 real rows; expect a few seconds on D1.
If `rebuild` fails with a timeout or "too large", fall back to a chunked backfill, but only inside the quiet window:
DROP the 3 triggers, run `INSERT INTO items_fts(items_fts) VALUES('delete-all')`, then for each rowid range
`INSERT INTO items_fts(rowid,title,company,designer,tags,themes,industry,country,category,description) SELECT rowid,title,company,designer,tags,themes,industry,country,category,description FROM items WHERE rowid BETWEEN ? AND ?`
(10k per step), and finally re-create the triggers.

## Verify
```
npx wrangler d1 execute mgd-inspiration --remote --command "INSERT INTO items_fts(items_fts) VALUES('integrity-check')"
npx wrangler d1 execute mgd-inspiration --remote --command "SELECT (SELECT COUNT(*) FROM items) a, (SELECT COUNT(*) FROM items_fts) b"
# live insert/update/delete probe (a test row, removed at the end)
npx wrangler d1 execute mgd-inspiration --remote --command "INSERT INTO items (id,title,description,image_key,tags,status,created_at,collection) VALUES ('zzfts0000001','Zyzzogeton probe','fts trigger probe','items/none.jpg','[\"zyzzogeton\"]','removed',1,'design'); SELECT COUNT(*) FROM items_fts WHERE items_fts MATCH 'zyzzogeton'; UPDATE items SET title='Quuxbarian probe' WHERE id='zzfts0000001'; SELECT COUNT(*) FROM items_fts WHERE items_fts MATCH 'quuxbarian OR zyzzogeton'; DELETE FROM items WHERE id='zzfts0000001'; SELECT COUNT(*) FROM items_fts WHERE items_fts MATCH 'quuxbarian OR zyzzogeton'"
# expect 1, 1, 0 (status 'removed' keeps the probe out of every public search)
python3 tests/rpc_search_n11.py --base https://madegooddesigns.com --expect-fts     # isolates pick the index up within 10 min
python3 tests/rpc_mcpux.py --base https://madegooddesigns.com
```
Then remove the lock.

## Rollback
1. `npx wrangler d1 execute mgd-inspiration --remote --command "$(cat rollback_fts.sql)"` drops the 3 triggers first, then `items_fts`.
   The Worker falls back to LIKE by itself, at once on errors and within 10 min otherwise.
2. Code rollback if wanted: `npx wrangler rollback c21d3afe-0e8d-43e9-bea3-68a559a745cc`. That is the pre-SEARCH version; it also drops
   the icon hint and get_brand_typeface. Remember that the 00:15 and 12:15 wrapups redeploy origin HEAD.

## Gotcha
`wrangler d1 export` of the whole DB fails once a virtual table exists ("cannot export databases with virtual tables (like FTS5)").
Export per table instead (`--table=items`), drop and re-create items_fts around a full export, or use D1 Time Travel.

## Replay result (local copy of all 80,880 live rows, 165 real mcp_calls queries)
Relevance proxy = the share of query words found in each top-3 result's title, tags, credits and description.
| | LIKE (live) | FTS5 |
|---|---|---|
| better / same / worse (top-3 vs LIKE) | – | 78 / 80 / 7 |
| mean top-3 relevance | 0.504 | 0.598 |
| median latency (local workerd) | 222 ms | 17 ms |
| p90 latency | 341 ms | 42 ms |
| zero-result queries | 2 | 2 (same 2) |
Scripts: scratchpad/n11/search/replay.py and compare.py. The comparison rows are in compare_rows.json.
