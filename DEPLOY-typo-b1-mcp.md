# typo-b1 MCP change set: deploy and rollback

Branch `typo-b1-mcp` (worktree `~/Downloads/EtiennAubertBonn/mgd-inspiration-typo-b1`), cut from `museum-collection-2026-10` at 70d41a9.
This is a local commit only. Nothing has been deployed and nothing has been written to D1 or R2.

## What changes
- **Data:** `src/font_pairings.json` goes from 106 to 146 guide fonts (679 to 879 pairs). It adds the 40 B1 pairing guides, each citing `https://madegooddesigns.com/<slug>/`.
  - Built offline by `deploy-bundle-2026-11-25/typo_publish/build_typo_mcp.py fonts-b1`, using the fonts r5 build_r5.py method.
  - The 106 existing entries are byte-identical.
  - The 10 vein articles are not included.
- **Fix: script wording in the similar-font fallback** (`src/font_pairing.js`). The script ("Devanagari", "Korean", ...) is named only when every suggested guide font shares it. Modak and Bagel Fat One now read "similar display fonts (...)".
- **Optional item, done: style variant to parent guide.** A trailing style word (Highlight, Inline, Outline, Stencil, Shadow, Shade, SC, Italic...) with no guide falls back to the parent family's guide before the partner and similar fallbacks (match `variant`).
  - Zilla Slab Highlight, Vollkorn SC, Patrick Hand SC and Noto Sans/Serif Display already reach the parent through the prefix step.
  - Sibling families stay separate: Syne Mono, Noto Sans Mono, Quattrocento Sans.
- **Fix: argument aliases** (`src/arg_alias.js`, applied in `mcpCallTool` and before `run_design_tool`'s schema check). A missing canonical argument is filled from a common alias. A sent argument is never overwritten. camelCase keys map to snake_case.
  - `get_ui_screen_code`: `id`/`screen`/`url`/`screenId` become `screen_id`.
  - `generate_color_scale`: `color`/`colour`/`hex` become `colors`. This now also passes `run_design_tool` validation.
  - `get_font_pairing`: `font_name`/`typeface`/`family`/`fontFamily` become `font`.
  - Search tools: `q`/`search`/`keyword` become `query`.
  - `check_contrast`: `fg`/`bg` become `foreground`/`background`.
  - Palette and theme tools: `color`/`primary_color` become `brand_color`.
  - `generate_logo_concepts` and `make_brand_board` accept `brand_name`/`name`. `get_brand_typeface` accepts `company`. `get_ui_flow` accepts `flow_id`.

## Tests (local, run 25-Nov)
- `node --no-warnings tests/typo_b1.test.mjs`: **ok, 2127 assertions**. It compares against BASE 70d41a9 and checks that every answer that cited an old guide is unchanged.
- `node --no-warnings tests/fp_r2.test.mjs`: ok, 5021 assertions, 146 fonts / 879 pairs. `fp_partner`: ok.
- `bash tests/typo_b1_local_e2e.sh` (wrangler dev --local, throwaway D1): **16 passed, 0 failed**.
- `bash tests/mcp_errors_local_e2e.sh`: all checks passed (45/45, twice).
- `wrangler deploy --dry-run`: bundles.
- **Expected failures:**
  - `fp_gaps_r1` and `fp_gaps_r2` fail only on (a) their stale "79 curated (got 85)" count, which also fails on BASE, and (b) curated fonts that B1 now gives real guides: Dosis, Pacifico, Vollkorn, Aleo, Quattrocento and others. That is intended, the same supersession as Onest in fonts r5.
  - `fp_r4`, `fp_r5` and `fp_r6` are pinned to older BASE commits and already fail on BASE ("changed since").

## Deploy: only AFTER B1 is live (the new data cites the 40 URLs)
```zsh
# 0. B1 published and every page 200
python3 ~/Downloads/EtiennAubertBonn/deploy-bundle-2026-11-25/typo_publish/livecheck_typo.py fonts-b1 --quiet   # must print 50/50 ok
# 1. merge into the deploy branch in the main checkout (keeps anything else committed there since 70d41a9)
cd ~/Downloads/EtiennAubertBonn/mgd-inspiration
git merge --no-ff typo-b1-mcp -m "Merge typo-b1-mcp: B1 font guides in get_font_pairing, script wording, style variants, argument aliases"
node --no-warnings tests/typo_b1.test.mjs && node --no-warnings tests/fp_r2.test.mjs
# 2. record the live version, then deploy
npx wrangler deployments status | grep -m1 -oE '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}' | tee /tmp/typo_b1_prev_version
npx wrangler deploy
# 3. live checks (16 JSON-RPC calls, read only)
sleep 20; python3 tests/typo_b1_rpc.py https://madegooddesigns.com/inspiration --live-only | tail -3
```
The deploy ships whatever else is committed on `museum-collection-2026-10` at that time. Check `git log origin/museum-collection-2026-10..HEAD` first. Owner-side, optional: upload `deploy-bundle-2026-11-25/typo_publish/out/pairings.fonts-b1.php` as `wp-content/mu-plugins/mgd-kit/pairings.php`. go_typo_publish.sh copies it into mgd-kit after a clean livecheck.

## Rollback
```zsh
cd ~/Downloads/EtiennAubertBonn/mgd-inspiration && npx wrangler rollback $(cat /tmp/typo_b1_prev_version)
```
This is code and bundled data only: no D1, R2 or vars change, so a rollback is complete. To undo the merge locally: `git revert -m 1 <merge sha>`.
