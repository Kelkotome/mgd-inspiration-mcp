# typo-b12 MCP change set: deploy and rollback

Branch `typo-b12-mcp` (worktree `~/Downloads/EtiennAubertBonn/mgd-inspiration-typo-b12`), cut 27-Nov-2026 from
**typo-b11-mcp at f872a06** (stacked: typo-b11-mcp is itself local, cut from origin 9ac372b; neither is pushed). Merge/deploy typo-b11-mcp first, or merge this branch alone (it contains f872a06).
Local commit only. Not pushed, nothing deployed; no D1, R2 or vars change.

**Do not deploy until fonts-b11 AND fonts-b12 are published** (`livecheck_typo.py` all ok).

## What changes (data only)
- `src/font_pairings.json`: **505 -> 545 guide fonts, 2,674 -> 2,874 pairs** (vs f872a06). Adds all 40 B12 pairing guides
  (deploy-bundle-2026-11-25/fonts-b12), each citing `https://madegooddesigns.com/<slug>/`. Lines only added.
  Built offline with `typo_publish/build_typo_mcp.py fonts-b12 <f872a06 font_pairings.json> typo_publish/out/font_pairings.fonts-b12.json`.
- Nothing held: no B12 name contains a fontKey() stop word. Waiting for the Sunrise (B8) stays held (asserted).
- No curated or guide answer is superseded. Before: 38 fonts answered `similar`, Manjari had no answer, and Kreon had a curated answer with no page (font_pairings_curated.js); all 40 now answer `exact` with their guide page.
  Four fold-in names (Bona Nova SC, Overlock SC, Bellota Text, Birthstone Bounce) now reach the new parent guide by prefix; BioRhyme Expanded still answers `similar` (no prefix match).
- Vein pages (3 hubs: wix, shopify, monospace; 3 alternatives: Bogart, Palatino, Tiempos) are not included. No code change (asserted).

## Tests (local, 27-Nov)
- `node --no-warnings tests/typo_b12.test.mjs`: ok, 1,567 assertions (BASE f872a06).
- `tests/fp_r2.test.mjs`: ok 17,390 assertions, 545 fonts / 2,874 pairs. `tests/fp_partner.test.mjs`: ok.
- Expected failure: `tests/typo_b11.test.mjs` pins the B11 counts/changes (same pattern as earlier batches).
- Already failing at the base (since 9ac372b) (not caused by this change): fp_r4, fp_r5, fp_r6, fp_gaps_r1, fp_gaps_r2 (pinned to older commits).
- Not run: wrangler local e2e.

## Deploy (after the fonts-b12 publish; Worker deploys follow the current deploy rule)
```zsh
cd ~/Downloads/EtiennAubertBonn/mgd-inspiration
git fetch origin && git log --oneline HEAD..origin/museum-collection-2026-10   # merge anything listed first
git merge --no-ff typo-b12-mcp -m "Merge typo-b11-mcp + typo-b12-mcp: B11 + B12 font guides in get_font_pairing"
node --no-warnings tests/typo_b12.test.mjs && node --no-warnings tests/fp_r2.test.mjs && node --no-warnings tests/fp_partner.test.mjs
npx wrangler deployments status | grep -m1 -oE '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}' | tee ../deploy-bundle-2026-11-25/typo_b12_prev_version
npx wrangler deploy
git push origin museum-collection-2026-10
```

## Rollback
`npx wrangler rollback $(cat ../deploy-bundle-2026-11-25/typo_b12_prev_version)`; locally `git revert -m 1 <merge sha>`.
