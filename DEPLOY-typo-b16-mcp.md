# typo-b16 MCP change set: deploy and rollback

Branch `typo-b16-mcp` (worktree `~/Downloads/EtiennAubertBonn/mgd-inspiration-typo-b16`), cut 28-Nov-2026 from
**origin/museum-collection-2026-10 at 3a91597**, then **typo-b15-mcp (916ca8a) merged in (4598e94)** so B16 data stacks on B15
(both batches append to src/font_pairings.json; a branch without B15 would conflict at deploy). Local commits only. Not pushed, nothing deployed; no D1, R2 or vars change.

**Do not deploy until fonts-b16 is published** (`livecheck_typo.py fonts-b16` 46/46). Because B15 is an ancestor, deploying this
branch also ships the B15 data if mcp_b15_after.sh has not run yet; that is only OK when fonts-b15 is live (46/46); b16_1130.sh refuses
to publish B16 unless it is.

## What changes (data only)
- `src/font_pairings.json`: **665 -> 705 guide fonts, 3,474 -> 3,674 pairs** (vs 4598e94). Adds all 40 B16 pairing guides
  (deploy-bundle-2026-11-25/fonts-b16), each citing `https://madegooddesigns.com/<slug>/`. Lines only added.
  Built offline: `typo_publish/build_typo_mcp.py fonts-b16 <4598e94 font_pairings.json> typo_publish/out/font_pairings.fonts-b16.json`.
- Nothing held; no supersession. Changes vs BASE: 40 new guides exact, 11 fold-ins reach their parent by prefix (Redaction 10-100,
  Redacted Script, Libre Barcode 39 Extended/Text, 128 Text, Macondo Swash Caps, Hanalei Fill, Alike Angular), the rest partner/zero shifts allowed by the test.
- Vein pages (hubs chinese/hindi/thai-font-pairings; alternatives Trebuchet MS, Consolas, Algerian) are not included. No code change (asserted).

## Tests (local, 28-Nov)
- `tests/typo_b16.test.mjs`: ok, 1,589 assertions (BASE 4598e94).
- `tests/fp_r2.test.mjs`: ok, 22,350 assertions, 705 fonts / 3,674 pairs. `tests/fp_partner.test.mjs`: ok. `tests/app_feed.mjs`: 41 ok.
- Expected failure: `tests/typo_b15.test.mjs` pins the B15 counts (same pattern as earlier batches).

## Deploy (after fonts-b16 publishes): `deploy-bundle-2026-11-09/mcp_b16_after.sh` (merge origin, abort on conflict, tests, ff push, rollback id to deploy-bundle-2026-11-25/typo_b16_prev_version, deploy, live check Redaction).
## Rollback
`npx wrangler rollback $(cat ../deploy-bundle-2026-11-25/typo_b16_prev_version)`; locally `git revert -m 1 <merge sha>`.
