# DEPLOY: templates r9, hotels and travel (25-Nov-2026), STAGED, NOT DEPLOYED

**Superseded for go-live (owner 25-Nov 18:07: ship r7 + r8 + r9 together): use `DEPLOY-tpl-r7-r8-r9.md`.** This file stays as the r9 reference (files, rebuild). Owner picked label C "Travel, tourism and stays" / "Travel, tourism and accommodation website templates" and notice A. The travel-website 301 and the Halcyon Quay / Driftmark follow-up ship later from branch `tpl-r9-trfix` (`DEPLOY-tpl-r9-trfix.md` there).

Branch `tpl-r9-travel` in `../mgd-inspiration-tpl-r9`, cut from `tpl-r8-automotive` (67ae531) with `tpl-r7-education` (3b6d37b) merged in (783e326). So r9 sits on top of r7 and r8: this branch's tree has the nine live industries plus education, automotive and hotels and travel. Industry 12 in build order.
Industry choice, demand figures, niches and the word rules: `docs/template-taxonomy.md`, section "Hotels and travel tree".
Owner decisions needed before go-live: keep hotels and travel as industry 12 and its 8 niches, and the copy options (label + disclosure) in `../docs_updates/lane-templates-2026-11-24.md`, "25-Nov r9" section.

**Counts: 49 designs (98 screens: web + mobile), 49 WordPress themes, 8 niches (6 designs each, the tour operator 7 with the class `timetable` layout used for tour departures).**

| Niche | Fictional name | Nested HTML segment | WordPress segment |
|---|---|---|---|
| Hotel | The Marrowby Hotel | hotel-website-template | hotel |
| Resort | Vellanthe Cove Resort | resort-website-template | resort |
| Bed and breakfast and guest house | Wrenbeck House | bed-and-breakfast-website-template | bed-and-breakfast |
| Hostel | Quillstead Hostel | hostel-website-template | hostel |
| Travel agency | Hollimere Travel | travel-agency-website-template | travel-agency |
| Tour operator | Tarnwick Tours | tour-operator-website-template | tour-operator |
| Campground and glamping | Fernhallow Campground | campground-website-template | campground |
| Tourism and destination | Visit Ardlowe Valley | tourism-website-template | tourism |

Hub `/inspiration/ui/travel-website-templates`, WordPress `/inspiration/ui/wordpress-themes/travel/`. The n12 hotel-website rows (Halcyon Quay) stay live as plain items and `/ui/hotel-website-template` 301s once to the nested hotel page. The n12 travel-website pattern (Driftmark Journeys) stays flat in this go-live (its 301 to the hub ships later with tpl-r9-trfix).

## Order (read first): r7, then r8, then r9

r7, r8 and r9 edit the same lines in `src/` and each regenerates `src/tpl_catalog.json`. This branch already contains r7 and r8, so the simplest order is:
1. r7 live (DEPLOY-tpl-r7-education.md), 2. r8 rebased and live (DEPLOY-tpl-r8-automotive.md), 3. this branch.
If r7 or r8 change before they go live (copy, names, a rebase), re-merge them here (`git merge tpl-r7-education tpl-r8-automotive` or rebase this branch's own commit onto the new r8 head), keep every block in each conflict, and rebuild the catalog niches map (older niches are byte-identical in all three catalogs; build_catalog.mjs keeps niches it does not build).
The D1 rows, R2 keys and theme zips of r9 share no id or key with r7 or r8, so the r9 bundle stays valid after a rebase.
**Shortcut:** merging `tpl-r9-travel` alone ships r7 + r8 + r9 code in one deploy; then all three bundles' R2 and D1 steps must run first (r7, r8, r9 R2; then r7, r8, r9 rows), and the r7/r8 live checks run too. Only with the owner's go for all three.

## Files

Worker code (`src/`): `ui_tree.js` (INDUSTRIES.travel), `ui_seo.js`, `ui_search.js` (new aliases; "resort" and "bed and breakfast" moved off hotel-website, "travel agency" and the tour words moved off travel-website), `ui_templates.js` (DISCLOSES.travel, ALIASES, GENERAL.travel, tplHint), `ui_screens.js` (7 new page patterns), `ui_spec_phrases.js`, `ui_pattern_copy.json` (7 new entries, hotel-website rewritten for the new designs), `tpl_copy.json`, `tpl_catalog.json` (build_catalog.mjs).
Build: `ui-screens/hc/content/*.js` (8), `ui-screens/lib.js` (8 families), `ui-screens/hc/engine.js` (8 motifs), `ui-screens/hc/distinct-tr-2026-11-25.json`.
Tests: `tr_lint.py`, `tr_mcp.mjs`, `tr_live.py`, `tr_bundle.py`, `tr_local_e2e.sh`, `r9_build.sh`, `ui_rank/cases_tr.txt`, `hc_routes.py` (travel block), `ui_rank/cases_n12.txt` ("tour operator website" now also accepts tour-operator-website).

## Go-live order (lead rule: R2 first, D1 rows BEFORE the Worker deploy). Not run on 25-Nov.

Before starting, check no other writer or deploy is running:
`pgrep -fl '[w]rangler deploy|[r]un1[5-9][0-9]_brands|[p]ubseq_list|[i]ngest_staged|[i]ngest_museum|DEPLOY_r1|[e]nrich_until|[w]rapup'`

1. R2: `zsh ../deploy-bundle-2026-11-25/r2_up_r9.sh` (expect `DONE ok=<tsv lines> bad=0`); read one theme.zip back through the site after step 4 and hash it.
2. In `../mgd-inspiration`: `git pull --rebase` (wrap-ups commit there), then `git merge tpl-r9-travel` (museum-collection-2026-10; after r7 and r8, see above). Re-run
   `node --import ./tests/ui_rank/register.mjs tests/test_tpl_tree.mjs` there.
3. D1: `zsh ../deploy-bundle-2026-11-25/d1_apply_r9.sh` (one statement per line, 1 s apart; expect 98 lines `changes=1`).
4. `npx wrangler deployments list` (record the current version as rollback), `npx wrangler deploy`, then `git push origin museum-collection-2026-10` at once.
5. Purge: `python3 ../deploy-bundle-2026-11-25/cf_prefix_purge.py madegooddesigns.com/inspiration/ui madegooddesigns.com/inspiration/mcp`
6. Live checks (curl/8.4.0 UA), from `../mgd-inspiration-tpl-r9`:
   ```
   python3 tests/tr_live.py https://madegooddesigns.com/inspiration
   node tests/tr_mcp.mjs https://madegooddesigns.com/inspiration
   IND=travel python3 tests/hc_routes.py https://madegooddesigns.com/inspiration
   python3 tests/hc_routes.py https://madegooddesigns.com/inspiration
   for I in real-estate restaurant wedding portfolio beauty-fitness construction professional-services education automotive; do IND=$I python3 tests/hc_routes.py https://madegooddesigns.com/inspiration; done
   for t in ed au; do node tests/${t}_mcp.mjs https://madegooddesigns.com/inspiration; done
   zsh ../deploy-bundle-2026-11-25/guard_checks.sh
   ```

## Rollback

1. `npx wrangler rollback <recorded version id>`, purge `/inspiration/ui` and `/inspiration/mcp`.
2. Apply `../deploy-bundle-2026-11-25/tpl-r9-travel-rollback.sql` (one UPDATE: status='removed' on exactly the 98 ids AND source_urls).
3. Revert the merge on museum-collection-2026-10 (`git revert -m 1 <merge sha>`) and push, so a wrap-up does not redeploy it. R2 objects can stay (unlinked).
   If r7/r8 went live in the same merge (shortcut above), the rollback version also removes them: apply their rollback SQL too, or redeploy the r8 head instead.

## Rebuild from scratch (local only)

`node ui-screens/gen_hc.js --only hotel,resort,bed-and-breakfast,hostel,travel-agency,tour-operator,campground,tourism`, `python3 tests/tr_lint.py`,
`SHOOT_OUT=out-hc ui-screens/shoot.sh; SHOOT_OUT=out-hc python3 ui-screens/trim.py`, `node ui-screens/wp-export/layoutmap.mjs maps.json`,
`python3 tests/hc_distinct.py maps.json > ui-screens/hc/distinct-tr-2026-11-25.json`, `node ui-screens/wp-export/batch.mjs --zips <zips>`, start the Playground
(`NODE_OPTIONS=--dns-result-order=ipv4first wp-playground-cli server --port=9400 --wp=7.1.4 --php=8.3 --login --mount=<zips>:/zips --mount=<dir with mgdt-harness.php>:/wordpress/wp-content/mu-plugins`;
CLI 3.1.62), then `R9_ZIPS=<zips> bash tests/r9_build.sh`, then
`SCRATCH=<dir> TR_DUMP=<dir>/dump bash tests/tr_local_e2e.sh` and `python3 tests/tr_bundle.py <dir>/dump`.
`ui-screens/wp-export/node_modules` is a symlink to the r6 worktree's (gitignored), as in r8.
