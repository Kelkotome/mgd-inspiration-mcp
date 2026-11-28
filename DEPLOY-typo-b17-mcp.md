# typo-b17 MCP change set: deploy and rollback

Branch `typo-b17-mcp` (worktree `~/Downloads/EtiennAubertBonn/mgd-inspiration-typo-b17`), cut 28-Nov-2026 from **typo-b16-mcp at ee78b58**
(which is origin 3a91597 + typo-b15-mcp + B16 data), so B17 data stacks on B16 and B15. Local commit only. Not pushed, nothing deployed; no D1, R2 or vars change.

**Do not deploy until fonts-b17 is published** (`livecheck_typo.py fonts-b17` 46/46) **and typo-b16-mcp has been deployed** (mcp_b16_after.sh).
Deploying this branch earlier would also ship the B16 (and B15) data.

## What changes (data only)
- `src/font_pairings.json`: **705 -> 745 guide fonts, 3,674 -> 3,874 pairs** (vs ee78b58). Adds all 40 B17 pairing guides
  (deploy-bundle-2026-11-25/fonts-b17), each citing `https://madegooddesigns.com/<slug>/`. Lines only added.
  Built offline: `typo_publish/build_typo_mcp.py fonts-b17 <ee78b58 font_pairings.json> typo_publish/out/font_pairings.fonts-b17.json`.
- Fold-ins reach their parent by prefix (Ribeye Marrow, Fascinate Inline, Elsie Swash Caps, Jacques Francois Shadow, the 11 Bitcount Single/Ink/Grid/Prop families).
- Vein pages (hubs greek/hebrew/cyrillic-font-pairings; alternatives Broadway, Segoe Script, Chiller) are not included. No code change (asserted).

## Tests (local, 28-Nov)
- `tests/typo_b17.test.mjs`: ok, 1,630 assertions (BASE ee78b58). Changed vs BASE: 40 new exact, 14 prefix + 1 variant to new guides, rest allowed zero/partner/similar shifts.
- `tests/fp_r2.test.mjs`: ok, 23,590 assertions, 745 fonts / 3,874 pairs. `tests/fp_partner.test.mjs`: ok. `tests/app_feed.mjs`: 41 ok.
- Expected failure: `tests/typo_b16.test.mjs` pins the B16 counts (same pattern as earlier batches).

## Deploy (after fonts-b17 publishes): `deploy-bundle-2026-11-09/mcp_b17_after.sh` (waits for "b17: end" + 46/46 + "mcp-b16: deployed"; merge origin, abort on conflict, tests, ff push, rollback id to deploy-bundle-2026-11-25/typo_b17_prev_version, deploy, live check Ribeye).
## Rollback
`npx wrangler rollback $(cat ../deploy-bundle-2026-11-25/typo_b17_prev_version)`; locally `git revert -m 1 <merge sha>`.
