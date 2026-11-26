# typo-b6 MCP change set: deploy and rollback

Branch `typo-b6-mcp` (worktree `~/Downloads/EtiennAubertBonn/mgd-inspiration-typo-b6`), cut 26-Nov-2026 from
**origin/museum-collection-2026-10 at 5f12444**. Local commit only. Nothing deployed; no D1, R2 or vars change.

**Do not deploy until fonts-b6 is published** (every page cited here must be live first: `livecheck_typo.py fonts-b6`).

## What changes (data only)
- `src/font_pairings.json`: **266 -> 306 guide fonts, 1,479 -> 1,679 pairs**. Adds the 40 B6 pairing guides
  (deploy-bundle-2026-11-25/fonts-b6, plan rows without "held"), each citing `https://madegooddesigns.com/<slug>/`.
  Built offline: `python3 -I deploy-bundle-2026-11-25/typo_publish/build_typo_mcp.py fonts-b6 src/font_pairings.json out.json`.
  The diff only adds lines (2,138 added, 0 removed); every existing entry is byte-identical (test section 0).
- Vein pages (4 pairings-by-style hubs, 2 alternatives) are not included.
- No code change: font_pairing.js, curated, gf_meta, arg_alias are identical to 5f12444 (asserted by the test).
- tests/fp_partner.test.mjs: Hind now has a guide, so the partner case moves to Reem Kufi.
- **B5 is NOT in this data.** If a B5 MCP branch is built later, both append after the same last entry, so rebuild B6 on top of the
  B5 file (same command, base = B5's font_pairings.json) instead of a text merge.

## Tests (local, 26-Nov)
- `node --no-warnings tests/typo_b6.test.mjs`: ok, 2,089 assertions (40 guides x 4 query forms exact; why lines, GF partners, about blocks;
  siblings IBM Plex Sans / Red Hat Display / Funnel Display keep their own guides; every BASE answer that cited a guide unchanged).
- `tests/fp_r2.test.mjs`: ok 9,981 assertions, 306 fonts / 1,679 pairs. `tests/fp_partner.test.mjs`: ok.
- Expected failure: `tests/typo_b2b4.test.mjs` pins 266 fonts / 120 new keys (same pattern as typo_b1 after B2-B4).
- Not run: wrangler local e2e (no wrangler process was started).

## Deploy (after the B6 publish; Worker deploys follow the current deploy rule)
```zsh
cd ~/Downloads/EtiennAubertBonn/mgd-inspiration
git fetch origin && git log --oneline HEAD..origin/museum-collection-2026-10   # merge anything listed first
git merge --no-ff typo-b6-mcp -m "Merge typo-b6-mcp: B6 font guides in get_font_pairing"
node --no-warnings tests/typo_b6.test.mjs && node --no-warnings tests/fp_r2.test.mjs && node --no-warnings tests/fp_partner.test.mjs
npx wrangler deployments status | grep -m1 -oE '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}' | tee ../deploy-bundle-2026-11-25/typo_b6_prev_version
npx wrangler deploy
git push origin museum-collection-2026-10
```
## Rollback
`npx wrangler rollback $(cat ../deploy-bundle-2026-11-25/typo_b6_prev_version)`; locally `git revert -m 1 <merge sha>`.
