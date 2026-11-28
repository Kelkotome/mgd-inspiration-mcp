# typo-b19 MCP change set: deploy and rollback

Branch `typo-b19-mcp` (worktree `~/Downloads/EtiennAubertBonn/mgd-inspiration-typo-b19`), cut 29-Nov-2026 from **typo-b18-mcp at 578b883**
(B18 data, not yet deployed), so B19 data stacks on B18. Local commit only. Not pushed, nothing deployed; no D1, R2 or vars change.

**Do not deploy until fonts-b19 is published** (`livecheck_typo.py fonts-b19` 40/40) **and typo-b18-mcp is deployed** (typo_b18.log "mcp-b18: deployed").

## What changes (data only)
- `src/font_pairings.json`: **785 -> 810 guide fonts, 4,074 -> 4,199 pairs** (vs 578b883). Adds the 25 B19 pairing guides
  (deploy-bundle-2026-11-25/fonts-b19), each citing `https://madegooddesigns.com/<slug>/`. Lines only added.
  Built offline: `typo_publish/build_typo_mcp.py fonts-b19 <578b883 font_pairings.json> typo_publish/out/font_pairings.fonts-b19.json`.
- Fold-ins reach their parent by prefix (Bruno Ace SC, Micro 5 Charted).
- Vein pages (9 script hubs amharic/urdu/malayalam/telugu/khmer/bengali/marathi/turkish/kannada-font-pairings; 6 alternatives Benguiat, Bank Gothic, Century Schoolbook, Bickham Script, Kabel, VAG Rounded) are not included. No code change (asserted).

## Tests (local, 29-Nov)
- `tests/typo_b19.test.mjs`: ok, 1,520 assertions (BASE 578b883). Changed vs BASE: 25 new exact, 2 prefix to new guides, rest allowed zero/partner/similar shifts.
- `tests/fp_r2.test.mjs`: ok, 25,605 assertions, 810 fonts / 4,199 pairs. `tests/fp_partner.test.mjs`: ok. `tests/app_feed.test.mjs`: 41 ok.
- Expected failure: `tests/typo_b18.test.mjs` pins the B18 counts (same pattern as earlier batches).

## Deploy (after fonts-b19 publishes): `deploy-bundle-2026-11-09/mcp_b19_after.sh` in the background (waits for "b19: end" + 40/40 in typo_b19.log and "mcp-b18: deployed" in typo_b18.log; merge origin, abort on conflict, tests, ff push, rollback id to deploy-bundle-2026-11-25/typo_b19_prev_version, deploy, live check Comforter Brush).
## Rollback
`npx wrangler rollback $(cat ../deploy-bundle-2026-11-25/typo_b19_prev_version)`; locally `git revert -m 1 <merge sha>`.
