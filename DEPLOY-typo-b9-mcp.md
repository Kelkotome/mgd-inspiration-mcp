# typo-b9 MCP change set: deploy and rollback

Branch `typo-b9-mcp` (worktree `~/Downloads/EtiennAubertBonn/mgd-inspiration-typo-b9`), cut 27-Nov-2026 from
**typo-b8-mcp at d2b24f1** (stacked on typo-b7-mcp 66af6fb and typo-b6-mcp 8c54472: merging this branch brings B6 + B7 + B8 + B9).
Local commit only. Nothing deployed; no D1, R2 or vars change.

**Do not deploy until fonts-b6, fonts-b7, fonts-b8 AND fonts-b9 are published** (`livecheck_typo.py` all ok for each).

## What changes (data only)
- `src/font_pairings.json`: **385 -> 425 guide fonts, 2,074 -> 2,274 pairs**. Adds all 40 B9 pairing guides
  (deploy-bundle-2026-11-25/fonts-b9), each citing `https://madegooddesigns.com/<slug>/`. Lines only added.
  Built offline with `typo_publish/build_typo_mcp.py fonts-b9 <b8 font_pairings.json> typo_publish/out/font_pairings.fonts-b9.json`.
- Nothing held: no B9 name contains a fontKey() stop word. Waiting for the Sunrise (B8) stays held (asserted).
- Intended supersessions (allowed by the test, listed for review):
  - Graduate, Ultra, Gloock, UnifrakturCook had curated entries (font_pairings_curated.js, page null); they now answer with their B9 guide.
  - Cairo, Heebo, Palanquin were answered as partners; now exact guides. Cairo Play and Palanquin Dark reach the new guides by prefix.
- Fold-ins: Londrina Outline / Shadow / Sketch have no alias entry (same as earlier batches' fold-ins).
- Vein pages (3 hubs, 3 alternatives) are not included. No code change (asserted by the test).

## Tests (local, 27-Nov)
- `node --no-warnings tests/typo_b9.test.mjs`: ok, 1,465 assertions.
- `tests/fp_r2.test.mjs`: ok 13,670 assertions, 425 fonts / 2,274 pairs. `tests/fp_partner.test.mjs`: ok.
- Expected failure: `tests/typo_b8.test.mjs` pins the B8 counts (385 fonts / 39 new keys), same pattern as earlier batches.
- Not run: wrangler local e2e.

## Deploy (after the four publishes; Worker deploys follow the current deploy rule)
```zsh
cd ~/Downloads/EtiennAubertBonn/mgd-inspiration
git fetch origin && git log --oneline HEAD..origin/museum-collection-2026-10   # merge anything listed first
git merge --no-ff typo-b9-mcp -m "Merge typo-b9-mcp: B6 + B7 + B8 + B9 font guides in get_font_pairing"
node --no-warnings tests/typo_b9.test.mjs && node --no-warnings tests/fp_r2.test.mjs && node --no-warnings tests/fp_partner.test.mjs
npx wrangler deployments status | grep -m1 -oE '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}' | tee ../deploy-bundle-2026-11-25/typo_b9_prev_version
npx wrangler deploy
git push origin museum-collection-2026-10
```
If only B6-B8 are live, deploy typo-b8-mcp instead (DEPLOY-typo-b8-mcp.md) and this branch later.

## Rollback
`npx wrangler rollback $(cat ../deploy-bundle-2026-11-25/typo_b9_prev_version)`; locally `git revert -m 1 <merge sha>`.
