# typo-b15 MCP change set: deploy and rollback

Branch `typo-b15-mcp` (worktree `~/Downloads/EtiennAubertBonn/mgd-inspiration-typo-b15`), cut 28-Nov-2026 from
**origin/museum-collection-2026-10 at aae423e** (app feed fix, deployed as Worker 516a3637). Local commit only. Not pushed, nothing deployed; no D1, R2 or vars change.

**Do not deploy until fonts-b15 is published** (`livecheck_typo.py` all ok).

## What changes (data only)
- `src/font_pairings.json`: **625 -> 665 guide fonts, 3,274 -> 3,474 pairs** (vs aae423e). Adds all 40 B15 pairing guides
  (deploy-bundle-2026-11-25/fonts-b15), each citing `https://madegooddesigns.com/<slug>/`. Lines only added.
  Built offline with `typo_publish/build_typo_mcp.py fonts-b15 <aae423e font_pairings.json> typo_publish/out/font_pairings.fonts-b15.json`.
- Nothing held; no supersession of any BASE answer (SUPERSEDED empty). Changes vs BASE: 40 new guides exact, 1 fold-in reaches its parent by prefix; the rest are similar/partner shifts allowed by the test.
- Vein pages (hubs japanese/korean/arabic-font-pairings; alternatives Clarendon, Tahoma, Jokerman) are not included. No code change (asserted).

## Tests (local, 28-Nov)
- `node --no-warnings tests/typo_b15.test.mjs`: ok, 1,621 assertions (BASE aae423e).
- `tests/fp_r2.test.mjs`: ok (see commit), 665 fonts / 3,474 pairs. `tests/fp_partner.test.mjs`: ok.
- Expected failure: `tests/typo_b14.test.mjs` pins the B14 counts (same pattern as earlier batches).
- Not run: wrangler local e2e.

## Deploy (after the fonts-b15 publish; Worker deploys follow the current deploy rule)
```zsh
cd ~/Downloads/EtiennAubertBonn/mgd-inspiration
git fetch origin && git log --oneline HEAD..origin/museum-collection-2026-10   # merge anything listed first
git merge --no-ff typo-b15-mcp -m "Merge typo-b15-mcp: B15 font guides in get_font_pairing"
node --no-warnings tests/typo_b15.test.mjs && node --no-warnings tests/fp_r2.test.mjs && node --no-warnings tests/fp_partner.test.mjs
npx wrangler deployments status | grep -m1 -oE '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}' | tee ../deploy-bundle-2026-11-25/typo_b15_prev_version
npx wrangler deploy
git push origin museum-collection-2026-10
```

## Rollback
`npx wrangler rollback $(cat ../deploy-bundle-2026-11-25/typo_b15_prev_version)`; locally `git revert -m 1 <merge sha>`.
