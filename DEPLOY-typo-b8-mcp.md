# typo-b8 MCP change set: deploy and rollback

Branch `typo-b8-mcp` (worktree `~/Downloads/EtiennAubertBonn/mgd-inspiration-typo-b8`), cut 27-Nov-2026 from
**typo-b7-mcp at 66af6fb** (stacked on typo-b6-mcp 8c54472: merging this branch brings B6 + B7 + B8). Local commit only.
Nothing deployed; no D1, R2 or vars change.

**Do not deploy until fonts-b6, fonts-b7 AND fonts-b8 are published** (`livecheck_typo.py` all ok for each).

## What changes (data only)
- `src/font_pairings.json`: **346 -> 385 guide fonts, 1,879 -> 2,074 pairs**. Adds 39 of the 40 B8 pairing guides
  (deploy-bundle-2026-11-25/fonts-b8), each citing `https://madegooddesigns.com/<slug>/`. Lines only added (2,074 added, 0 removed).
  Built offline with `typo_publish/build_typo_mcp.py` on a scratch copy of fonts-b8 whose plan marks Waiting for the Sunrise held.
- **Held out of the MCP data: Waiting for the Sunrise.** `fontKey()` strips the stop word "for" from every query, so the key
  "waitingforthesunrise" can never be reached (fp_r2 fails 9 query forms if it is included). The page still publishes with B8.
  Fix later in code (try the unstripped key before stripping stop words), then rebuild with the full plan.
- Intended supersession: "Antonio" used to prefix-match the Anton guide; it now answers with its own guide (listed in the test).
- Fold-ins reach the new guides by prefix: Mate SC, Oxygen Mono, Jersey 10 Charted (4 "new guide (prefix)" answers). Sigmar and
  Jersey 15/20/25 have no alias map entry (same as earlier batches).
- Vein pages (3 hubs, 3 alternatives) are not included. No code change (asserted by the test). B5 is still not in this data.

## Tests (local, 27-Nov)
- `node --no-warnings tests/typo_b8.test.mjs`: ok, 1,480 assertions.
- `tests/fp_r2.test.mjs`: ok 12,430 assertions, 385 fonts / 2,074 pairs. `tests/fp_partner.test.mjs`: ok.
- Expected failure: `tests/typo_b7.test.mjs` pins 346 fonts / 40 new keys (same pattern as earlier batches).
- Not run: wrangler local e2e.

## Deploy (after the three publishes; Worker deploys follow the current deploy rule)
```zsh
cd ~/Downloads/EtiennAubertBonn/mgd-inspiration
git fetch origin && git log --oneline HEAD..origin/museum-collection-2026-10   # merge anything listed first
git merge --no-ff typo-b8-mcp -m "Merge typo-b8-mcp: B6 + B7 + B8 font guides in get_font_pairing"
node --no-warnings tests/typo_b8.test.mjs && node --no-warnings tests/fp_r2.test.mjs && node --no-warnings tests/fp_partner.test.mjs
npx wrangler deployments status | grep -m1 -oE '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}' | tee ../deploy-bundle-2026-11-25/typo_b8_prev_version
npx wrangler deploy
git push origin museum-collection-2026-10
```
If only B6 + B7 are live, deploy typo-b7-mcp instead (DEPLOY-typo-b7-mcp.md) and this branch later.
## Rollback
`npx wrangler rollback $(cat ../deploy-bundle-2026-11-25/typo_b8_prev_version)`; locally `git revert -m 1 <merge sha>`.
