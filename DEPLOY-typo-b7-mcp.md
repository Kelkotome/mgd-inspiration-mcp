# typo-b7 MCP change set: deploy and rollback

Branch `typo-b7-mcp` (worktree `~/Downloads/EtiennAubertBonn/mgd-inspiration-typo-b7`), cut 26-Nov-2026 from
**typo-b6-mcp at 8c54472** (stacked: merge typo-b6-mcp first, or merge this branch, which contains it). Local commit only.
Nothing deployed; no D1, R2 or vars change.

**Do not deploy until fonts-b6 AND fonts-b7 are published** (`livecheck_typo.py fonts-b6` and `livecheck_typo.py fonts-b7` all ok).

## What changes (data only)
- `src/font_pairings.json`: **306 -> 346 guide fonts, 1,679 -> 1,879 pairs**. Adds the 40 B7 pairing guides
  (deploy-bundle-2026-11-25/fonts-b7, plan rows without "held"), each citing `https://madegooddesigns.com/<slug>/`.
  Built offline: `python3 -I deploy-bundle-2026-11-25/typo_publish/build_typo_mcp.py fonts-b7 src/font_pairings.json out.json`.
  The diff only adds lines (2,125 added, 0 removed); every existing entry is byte-identical (test section 0).
- Vein pages (5 pairings-by-style hubs, 3 alternatives) are not included.
- No code change (asserted by the test). Prefix fold-ins now reach the new guides: Castoro Titling, Sansita Swashed, Alumni Sans SC /
  Pinstripe / Inline One / Collegiate One, Tiny5 Duo, Merienda One. Reddit Sans Condensed and the Special Gothic Condensed/Expanded One
  styles still answer "similar" (no alias map entry; same as earlier batches).
- **B5 is NOT in this data** (same note as typo-b6). If a B5 branch is built, rebuild B6 then B7 on top with the same command.

## Tests (local, 26-Nov)
- `node --no-warnings tests/typo_b7.test.mjs`: ok, 1,432 assertions (40 guides x 4 query forms exact; why lines, GF partners, about blocks;
  every BASE answer that cited a guide unchanged).
- `tests/fp_r2.test.mjs`: ok 11,221 assertions, 346 fonts / 1,879 pairs. `tests/fp_partner.test.mjs`: ok.
- Expected failure: `tests/typo_b6.test.mjs` pins 306 fonts / 40 new keys (same pattern as earlier batches).
- fp_gaps_r1 / fp_r4 / fp_r5 also fail on the BASE commit 8c54472 (pre-existing, unrelated).
- Not run: wrangler local e2e (no wrangler process was started).

## Deploy (after both publishes; Worker deploys follow the current deploy rule)
```zsh
cd ~/Downloads/EtiennAubertBonn/mgd-inspiration
git fetch origin && git log --oneline HEAD..origin/museum-collection-2026-10   # merge anything listed first
git merge --no-ff typo-b7-mcp -m "Merge typo-b7-mcp: B6 + B7 font guides in get_font_pairing"
node --no-warnings tests/typo_b7.test.mjs && node --no-warnings tests/fp_r2.test.mjs && node --no-warnings tests/fp_partner.test.mjs
npx wrangler deployments status | grep -m1 -oE '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}' | tee ../deploy-bundle-2026-11-25/typo_b7_prev_version
npx wrangler deploy
git push origin museum-collection-2026-10
```
## Rollback
`npx wrangler rollback $(cat ../deploy-bundle-2026-11-25/typo_b7_prev_version)`; locally `git revert -m 1 <merge sha>`.
