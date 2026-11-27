# typo-b13 MCP change set: deploy and rollback

Branch `typo-b13-mcp` (worktree `~/Downloads/EtiennAubertBonn/mgd-inspiration-typo-b13`), cut 28-Nov-2026 from
**origin/museum-collection-2026-10 at 0a9c60a** (B11 + B12 merge, deployed). Local commit only. Not pushed, nothing deployed; no D1, R2 or vars change.

**Do not deploy until fonts-b13 is published** (`livecheck_typo.py` all ok).

## What changes (data only)
- `src/font_pairings.json`: **545 -> 585 guide fonts, 2,874 -> 3,074 pairs** (vs 0a9c60a). Adds all 40 B13 pairing guides
  (deploy-bundle-2026-11-25/fonts-b13), each citing `https://madegooddesigns.com/<slug>/`. Lines only added.
  Built offline with `typo_publish/build_typo_mcp.py fonts-b13 <0a9c60a font_pairings.json> typo_publish/out/font_pairings.fonts-b13.json`.
- Nothing held: no B13 name contains a fontKey() stop word. Waiting for the Sunrise (B8) stays held (asserted).
- No guide answer is superseded. Changes vs BASE: 40 new guides answer `exact`; 8 fold-in names now reach their new parent guide by prefix
  (Shippori Mincho B1, Diplomata SC, Ysabeau Infant/Office/SC, Nanum Gothic Coding, Reem Kufi Fun/Ink); Gentium Book Plus still answers `similar` (no prefix match);
  the rest are `similar`/`partner` lists gaining the new guides.
- `tests/fp_partner.test.mjs`: Reem Kufi now has its own guide, so the partner case moves to Gowun Dodum (partner on 6 guides, no guide).
- Vein pages (hubs adobe-express, wordpress, halloween; alternatives Bookman, Goudy Old Style, Perpetua) are not included. No code change (asserted).

## Tests (local, 28-Nov)
- `node --no-warnings tests/typo_b13.test.mjs`: ok, 1,599 assertions (BASE 0a9c60a).
- `tests/fp_r2.test.mjs`: ok 18,630 assertions, 585 fonts / 3,074 pairs. `tests/fp_partner.test.mjs`: ok (6 pairs, Gowun Dodum).
- Expected failure: `tests/typo_b12.test.mjs` pins the B12 counts/changes (same pattern as earlier batches).
- Already failing at the base (not caused by this change): fp_r4, fp_r5, fp_r6, fp_gaps_r1, fp_gaps_r2, typo_b11 (pinned to older commits).
- Not run: wrangler local e2e.

## Deploy (after the fonts-b13 publish; Worker deploys follow the current deploy rule)
```zsh
cd ~/Downloads/EtiennAubertBonn/mgd-inspiration
git fetch origin && git log --oneline HEAD..origin/museum-collection-2026-10   # merge anything listed first
git merge --no-ff typo-b13-mcp -m "Merge typo-b13-mcp: B13 font guides in get_font_pairing"
node --no-warnings tests/typo_b13.test.mjs && node --no-warnings tests/fp_r2.test.mjs && node --no-warnings tests/fp_partner.test.mjs
npx wrangler deployments status | grep -m1 -oE '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}' | tee ../deploy-bundle-2026-11-25/typo_b13_prev_version
npx wrangler deploy
git push origin museum-collection-2026-10
```

## Rollback
`npx wrangler rollback $(cat ../deploy-bundle-2026-11-25/typo_b13_prev_version)`; locally `git revert -m 1 <merge sha>`.
