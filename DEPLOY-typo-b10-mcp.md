# typo-b10 MCP change set: deploy and rollback

Branch `typo-b10-mcp` (worktree `~/Downloads/EtiennAubertBonn/mgd-inspiration-typo-b10`), cut 27-Nov-2026 from
**typo-b9-mcp at ae7fc3f** (stacked on typo-b8-mcp d2b24f1, typo-b7-mcp 66af6fb and typo-b6-mcp 8c54472: merging this branch brings B6 + B7 + B8 + B9 + B10).
Local commit only. Nothing deployed; no D1, R2 or vars change.

**Do not deploy until fonts-b6 through fonts-b10 are all published** (`livecheck_typo.py` all ok for each).

## What changes (data only)
- `src/font_pairings.json`: **425 -> 465 guide fonts, 2,274 -> 2,474 pairs**. Adds all 40 B10 pairing guides
  (deploy-bundle-2026-11-25/fonts-b10), each citing `https://madegooddesigns.com/<slug>/`. Lines only added.
  Built offline with `typo_publish/build_typo_mcp.py fonts-b10 <b9 font_pairings.json> typo_publish/out/font_pairings.fonts-b10.json`.
- Nothing held: no B10 name contains a fontKey() stop word. Waiting for the Sunrise (B8) stays held (asserted).
- No curated or guide answer is superseded: before this change, 39 of the 40 fonts answered `similar` and Do Hyeon answered `partner`; all now answer `exact` with their guide.
  Three fold-in names (e.g. Almendra SC / Almendra Display, Cascadia Mono) now reach a new guide by prefix.
- Vein pages (3 hubs, 3 alternatives) are not included. No code change (asserted by the test).

## Tests (local, 27-Nov)
- `node --no-warnings tests/typo_b10.test.mjs`: ok, 1,483 assertions.
- `tests/fp_r2.test.mjs`: ok 14,910 assertions, 465 fonts / 2,474 pairs. `tests/fp_partner.test.mjs`: ok.
- Expected failure: `tests/typo_b9.test.mjs` pins the B9 counts (425 fonts / 40 new keys), same pattern as earlier batches.
- Not run: wrangler local e2e.

## Deploy (after the five publishes; Worker deploys follow the current deploy rule)
```zsh
cd ~/Downloads/EtiennAubertBonn/mgd-inspiration
git fetch origin && git log --oneline HEAD..origin/museum-collection-2026-10   # merge anything listed first
git merge --no-ff typo-b10-mcp -m "Merge typo-b10-mcp: B6 + B7 + B8 + B9 + B10 font guides in get_font_pairing"
node --no-warnings tests/typo_b10.test.mjs && node --no-warnings tests/fp_r2.test.mjs && node --no-warnings tests/fp_partner.test.mjs
npx wrangler deployments status | grep -m1 -oE '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}' | tee ../deploy-bundle-2026-11-25/typo_b10_prev_version
npx wrangler deploy
git push origin museum-collection-2026-10
```
If only B6-B9 are live, deploy typo-b9-mcp instead (DEPLOY-typo-b9-mcp.md) and this branch later.

## Rollback
`npx wrangler rollback $(cat ../deploy-bundle-2026-11-25/typo_b10_prev_version)`; locally `git revert -m 1 <merge sha>`.
