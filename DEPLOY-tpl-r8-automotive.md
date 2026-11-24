# DEPLOY: templates r8, automotive (25-Nov-2026), STAGED, NOT DEPLOYED

Branch `tpl-r8-automotive` in `../mgd-inspiration-tpl-r8` (from `70d41a9`, the museum-collection-2026-10 head after the tpl-edfix merge). Industry 11 in build order.
It is built **independent of r7 education** (`tpl-r7-education`, 3b6d37b, also staged and not merged): this branch's tree has the nine live industries plus automotive.
Industry choice, demand figures, niches and the word rules: `docs/template-taxonomy.md`, section "Automotive tree".
Owner decisions needed before go-live: keep automotive as industry 11 and its 8 niches, and the copy options (label + disclosure) in `../docs_updates/lane-templates-2026-11-24.md`, "25-Nov r8" section.

**Counts: 49 designs (98 screens: web + mobile), 49 WordPress themes, 8 niches (6 designs each, towing 7 with the trades `dispatch` layout).**

| Niche | Fictional name | Nested HTML segment | WordPress segment |
|---|---|---|---|
| Car dealership | Harrowdene Motors | car-dealership-website-template | car-dealership |
| Auto repair and mechanic | Kettlewick Auto Repair | auto-repair-website-template | auto-repair |
| Car detailing | Marlowmere Detailing | car-detailing-website-template | car-detailing |
| Car wash | Pellowby Car Wash | car-wash-website-template | car-wash |
| Car rental | Tavistrand Car Rental | car-rental-website-template | car-rental |
| Auto body and collision repair | Copperhythe Body Shop | auto-body-shop-website-template | auto-body |
| Towing and roadside help | Dunmarrow Towing | towing-website-template | towing |
| Tire shop | Rimbleford Tires | tire-shop-website-template | tire-shop |

Hub `/inspiration/ui/automotive-website-templates`, WordPress `/inspiration/ui/wordpress-themes/automotive/`. No n12/n13 rows exist for this industry, so there is nothing to re-home; the flat pattern URLs (`/ui/<pattern>`) 301 once to the nested pages.

## Order with r7 (read first)

r7 and r8 edit the same lines in `src/` (both append after professional services) and both regenerate `src/tpl_catalog.json`. Recommended: **r7 goes live first**, then
rebase this branch on the merged head (`git rebase museum-collection-2026-10` in this worktree), keep both blocks in each conflict, and rebuild the catalog with both distinct files:
`node ui-screens/wp-export/build_catalog.mjs <r7 distinct + r8 distinct merged> src/tpl_catalog.json` (or merge the `niches` maps of the two catalogs: older niches are byte-identical in both).
Then re-run `node --import ./tests/ui_rank/register.mjs tests/test_tpl_tree.mjs` and the e2e (`tests/au_local_e2e.sh`, add `ed` to its MCP loop and `education` to its IND loop).
The D1 rows, R2 objects and theme zips of r8 do not depend on r7 (no shared ids or keys), so the bundle below stays valid after the rebase.
If the owner wants r8 first, the same applies the other way round to r7.

## Files

Worker code (`src/`): `ui_tree.js` (INDUSTRIES.automotive), `ui_seo.js`, `ui_search.js`, `ui_templates.js` (DISCLOSES, ALIASES, GENERAL, tplHint), `ui_screens.js` (8 new page patterns),
`ui_spec_phrases.js`, `ui_pattern_copy.json`, `tpl_copy.json`, `tpl_catalog.json` (build_catalog.mjs).
Build: `ui-screens/hc/content/*.js` (8), `ui-screens/lib.js` (8 families), `ui-screens/hc/engine.js` (8 motifs), `ui-screens/hc/distinct-au-2026-11-25.json`.
Tests: `au_lint.py`, `au_mcp.mjs`, `au_live.py`, `au_bundle.py`, `au_local_e2e.sh`, `r8_build.sh`, `ui_rank/cases_au.txt`.

## Go-live order (lead rule: R2 first, D1 rows BEFORE the Worker deploy). Not run on 25-Nov.

Before starting, check no other writer or deploy is running:
`pgrep -fl '[w]rangler deploy|[r]un1[5-9][0-9]_brands|[p]ubseq_list|[i]ngest_staged|[i]ngest_museum|DEPLOY_r1|[e]nrich_until|[w]rapup'`

1. R2: `zsh ../deploy-bundle-2026-11-25/r2_up_r8.sh` (expect `DONE ok=<tsv lines> bad=0`); read one theme.zip back through the site after step 4 and hash it.
2. In `../mgd-inspiration`: `git pull --rebase` (wrap-ups commit there), then `git merge tpl-r8-automotive` (museum-collection-2026-10; after r7, see above). Re-run
   `node --import ./tests/ui_rank/register.mjs tests/test_tpl_tree.mjs` there.
3. D1: `zsh ../deploy-bundle-2026-11-25/d1_apply_r8.sh` (one statement per line, 1 s apart; expect 98 lines `changes=1`).
4. `npx wrangler deployments list` (record the current version as rollback), `npx wrangler deploy`, then `git push origin museum-collection-2026-10` at once.
5. Purge: `python3 ../deploy-bundle-2026-11-25/cf_prefix_purge.py madegooddesigns.com/inspiration/ui madegooddesigns.com/inspiration/mcp`
6. Live checks (curl/8.4.0 UA), from `../mgd-inspiration-tpl-r8`:
   ```
   python3 tests/au_live.py https://madegooddesigns.com/inspiration
   node tests/au_mcp.mjs https://madegooddesigns.com/inspiration
   IND=automotive python3 tests/hc_routes.py https://madegooddesigns.com/inspiration
   python3 tests/hc_routes.py https://madegooddesigns.com/inspiration
   for I in real-estate restaurant wedding portfolio beauty-fitness construction professional-services; do IND=$I python3 tests/hc_routes.py https://madegooddesigns.com/inspiration; done
   zsh ../deploy-bundle-2026-11-25/guard_checks.sh
   ```
   (If r7 is live too, also `IND=education ...` and `node ../mgd-inspiration-tpl-r7/tests/ed_mcp.mjs ...`.)

## Rollback

1. `npx wrangler rollback <recorded version id>`, purge `/inspiration/ui` and `/inspiration/mcp`.
2. Apply `../deploy-bundle-2026-11-25/tpl-r8-automotive-rollback.sql` (one UPDATE: status='removed' on exactly the 98 ids AND source_urls).
3. Revert the merge on museum-collection-2026-10 and push, so a wrap-up does not redeploy it. R2 objects can stay (unlinked).

## Rebuild from scratch (local only)

`node ui-screens/gen_hc.js --only car-dealership,auto-repair,car-detailing,car-wash,car-rental,auto-body,towing,tire-shop`, `python3 tests/au_lint.py`,
`SHOOT_OUT=out-hc ui-screens/shoot.sh; SHOOT_OUT=out-hc python3 ui-screens/trim.py`, `node ui-screens/wp-export/layoutmap.mjs maps.json`,
`python3 tests/hc_distinct.py maps.json > ui-screens/hc/distinct-au-2026-11-25.json`, `node ui-screens/wp-export/batch.mjs --zips <zips>`, start the Playground
(`NODE_OPTIONS=--dns-result-order=ipv4first wp-playground-cli server --port=9400 --wp=7.1.4 --php=8.3 --login --mount=<zips>:/zips --mount=<dir with mgdt-harness.php>:/wordpress/wp-content/mu-plugins`;
on 25-Nov the 3.1.52 CLI failed with "fetch failed", 3.1.62 worked), then `R8_ZIPS=<zips> bash tests/r8_build.sh`, then
`SCRATCH=<dir> AU_DUMP=<dir>/dump bash tests/au_local_e2e.sh` and `python3 tests/au_bundle.py <dir>/dump`.
