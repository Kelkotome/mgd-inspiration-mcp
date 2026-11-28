# typo-b18 MCP change set: deploy and rollback

Branch `typo-b18-mcp` (worktree `~/Downloads/EtiennAubertBonn/mgd-inspiration-typo-b18`), cut 29-Nov-2026 from **typo-b17-mcp at 9b06b25**
(= origin/museum-collection-2026-10 after the B17 deploy, Worker ac60dd52), so B18 data stacks on B17. Local commit only. Not pushed, nothing deployed; no D1, R2 or vars change.

**Do not deploy until fonts-b18 is published** (`livecheck_typo.py fonts-b18` 46/46).

## What changes (data only)
- `src/font_pairings.json`: **745 -> 785 guide fonts, 3,874 -> 4,074 pairs** (vs 9b06b25). Adds all 40 B18 pairing guides
  (deploy-bundle-2026-11-25/fonts-b18), each citing `https://madegooddesigns.com/<slug>/`. Lines only added.
  Built offline: `typo_publish/build_typo_mcp.py fonts-b18 <9b06b25 font_pairings.json> typo_publish/out/font_pairings.fonts-b18.json`.
- Fold-ins reach their parent by prefix (Miltonian Tattoo, Blaka Hollow, Blaka Ink, IM Fell Double Pica SC, IM Fell Great Primer SC, Shippori Antique B1, Sixtyfour Convergence).
- Siblings keep their own guides (Red Hat Display/Text, IM Fell English/DW Pica, Libre Caslon Text, Dokdo).
- Vein pages (hubs vietnamese/persian/tamil-font-pairings; alternatives Monotype Corsiva, Lucida Handwriting, Agency FB) are not included. No code change (asserted).

## Tests (local, 29-Nov)
- `tests/typo_b18.test.mjs`: ok, 1,680 assertions (BASE 9b06b25). Changed vs BASE: 40 new exact, 7 prefix to new guides, rest allowed zero/partner/similar shifts.
- `tests/fp_r2.test.mjs`: ok, 24,830 assertions, 785 fonts / 4,074 pairs. `tests/fp_partner.test.mjs`: ok. `tests/app_feed.test.mjs`: 41 ok.
- Expected failure: `tests/typo_b17.test.mjs` pins the B17 counts (same pattern as earlier batches).

## Deploy (after fonts-b18 publishes): `deploy-bundle-2026-11-09/mcp_b18_after.sh` in the background (waits for "b18: end" + 46/46 in typo_b18.log and "mcp-b17: deployed" in typo_b17.log; merge origin, abort on conflict, tests, ff push, rollback id to deploy-bundle-2026-11-25/typo_b18_prev_version, deploy, live check Island Moments).
## Rollback
`npx wrangler rollback $(cat ../deploy-bundle-2026-11-25/typo_b18_prev_version)`; locally `git revert -m 1 <merge sha>`.
