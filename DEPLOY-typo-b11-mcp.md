# typo-b11 MCP change set: deploy and rollback

Branch `typo-b11-mcp` (worktree `~/Downloads/EtiennAubertBonn/mgd-inspiration-typo-b11`), cut 27-Nov-2026 from
**origin/museum-collection-2026-10 at 9ac372b** (already contains B6 to B10, merged and deployed 27-Nov as Worker 0a03d374).
Local commit only. Not pushed, nothing deployed; no D1, R2 or vars change.

**Do not deploy until fonts-b11 is published** (`livecheck_typo.py` all ok).

## What changes (data only)
- `src/font_pairings.json`: **465 -> 505 guide fonts, 2,474 -> 2,674 pairs**. Adds all 40 B11 pairing guides
  (deploy-bundle-2026-11-25/fonts-b11), each citing `https://madegooddesigns.com/<slug>/`. Lines only added.
  Built offline with `typo_publish/build_typo_mcp.py fonts-b11 <9ac372b font_pairings.json> typo_publish/out/font_pairings.fonts-b11.json`.
- Nothing held: no B11 name contains a fontKey() stop word. Waiting for the Sunrise (B8) stays held (asserted).
- No curated or guide answer is superseded. Before: 39 fonts answered `similar`, Caladea answered `partner`; all 40 now answer `exact`.
  Two fold-in names (Afacad Flux, Sedgwick Ave Display) now reach the new parent guide by prefix.
- Vein pages (3 hubs: squarespace, figma, google-slides; 3 alternatives: Omnes, Degular, P22 Underground) are not included. No code change (asserted).

## Tests (local, 27-Nov)
- `node --no-warnings tests/typo_b11.test.mjs`: ok, 1,546 assertions.
- `tests/fp_r2.test.mjs`: ok 16,150 assertions, 505 fonts / 2,674 pairs. `tests/fp_partner.test.mjs`: ok.
- Expected failure: `tests/typo_b10.test.mjs` pins the B10 counts/changes (same pattern as earlier batches).
- Already failing at the base 9ac372b (not caused by this change): fp_r4, fp_r5, fp_r6, fp_gaps_r1, fp_gaps_r2 (pinned to older commits).
- Not run: wrangler local e2e.

## Deploy (after the fonts-b11 publish; Worker deploys follow the current deploy rule)
```zsh
cd ~/Downloads/EtiennAubertBonn/mgd-inspiration
git fetch origin && git log --oneline HEAD..origin/museum-collection-2026-10   # merge anything listed first
git merge --no-ff typo-b11-mcp -m "Merge typo-b11-mcp: B11 font guides in get_font_pairing"
node --no-warnings tests/typo_b11.test.mjs && node --no-warnings tests/fp_r2.test.mjs && node --no-warnings tests/fp_partner.test.mjs
npx wrangler deployments status | grep -m1 -oE '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}' | tee ../deploy-bundle-2026-11-25/typo_b11_prev_version
npx wrangler deploy
git push origin museum-collection-2026-10
```

## Rollback
`npx wrangler rollback $(cat ../deploy-bundle-2026-11-25/typo_b11_prev_version)`; locally `git revert -m 1 <merge sha>`.
