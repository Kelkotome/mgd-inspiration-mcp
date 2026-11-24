# DEPLOY: templates r7, education (25-Nov-2026), STAGED, NOT DEPLOYED

Branch `tpl-r7-education` in `../mgd-inspiration-tpl-r7` (from `c040b44`, the museum-collection-2026-10 head that is live as Worker 31576f02). Tenth industry.
Industry choice, demand figures, niches and the word rules: `docs/template-taxonomy.md`, section "Education tree".
Owner decisions needed before go-live: keep education as industry 10, and the copy options (label + disclosure) in `../docs_updates/lane-templates-2026-11-24.md`, 25-Nov section.

**Counts: 49 designs (98 screens: web + mobile), 49 WordPress themes, 8 niches (6 designs each, dance studio 7 with the class timetable).**

| Niche | Fictional name | Nested HTML segment | WordPress segment |
|---|---|---|---|
| School | Fennimarsh School | school-website-template | school |
| University and college | Halvercombe University | university-website-template | university |
| Preschool and kindergarten | Tottlemere Preschool | preschool-website-template | preschool |
| Daycare and childcare | Quillimore Daycare | daycare-website-template | daycare |
| Tutoring | Corrowmede Tutoring | tutoring-website-template | tutoring |
| Online course and e-learning | Larkthimble Courses | online-course-website-template | online-course |
| Music school | Brindlestave Music School | music-school-website-template | music-school |
| Dance studio | Fenlowry Dance Studio | dance-studio-website-template | dance-studio |

Hub `/inspiration/ui/education-website-templates`, WordPress `/inspiration/ui/wordpress-themes/education/`.
n12/n13 rows school-website (Alderbrook Academy) and preschool-website (Puddlewick Preschool) stay live as plain items, not cards; their flat URLs 301 once
(`/ui/education-website-template` → the nested school page).

## Files

Worker code (`src/`): `ui_tree.js`, `ui_seo.js`, `ui_search.js`, `ui_templates.js` (DISCLOSES, ALIASES, GENERAL, tplHint), `ui_screens.js` (6 new page patterns),
`ui_spec_phrases.js`, `ui_pattern_copy.json`, `tpl_copy.json`, `tpl_catalog.json` (build_catalog.mjs).
Build: `ui-screens/hc/content/*.js` (8), `ui-screens/lib.js` (8 families), `ui-screens/hc/engine.js` (8 motifs).
Tests: `ed_lint.py`, `ed_mcp.mjs`, `ed_live.py`, `ed_bundle.py`, `ind10_local_e2e.sh`, `r7_build.sh`, `ui_rank/cases_ed.txt`, hc_routes education block.

## Go-live order (lead rule: R2 first, D1 rows BEFORE the Worker deploy). Not run on 25-Nov.

Before starting, check no other writer or deploy is running:
`pgrep -fl '[w]rangler deploy|[r]un1[5-9][0-9]_brands|[p]ubseq_list|[i]ngest_staged|[i]ngest_museum|DEPLOY_r1|[e]nrich_until|[w]rapup'`

1. R2: `zsh ../deploy-bundle-2026-11-25/r2_up_r7.sh` (expect `DONE ok=<tsv lines> bad=0`); read one theme.zip back through the site after step 4 and hash it.
2. In `../mgd-inspiration`: `git pull --rebase` (wrap-ups commit there), then `git merge tpl-r7-education` (museum-collection-2026-10). Re-run
   `node --import ./tests/ui_rank/register.mjs tests/test_tpl_tree.mjs` there.
3. D1: `zsh ../deploy-bundle-2026-11-25/d1_apply_r7.sh` (one statement per line, 1 s apart; expect 98 lines `changes=1`).
4. `npx wrangler deployments list` (record the current version as rollback), `npx wrangler deploy`, then `git push origin museum-collection-2026-10` at once.
5. Purge: `python3 ../deploy-bundle-2026-11-25/cf_prefix_purge.py madegooddesigns.com/inspiration/ui madegooddesigns.com/inspiration/mcp`
6. Live checks (curl/8.4.0 UA), from `../mgd-inspiration-tpl-r7`:
   ```
   python3 tests/ed_live.py https://madegooddesigns.com/inspiration
   node tests/ed_mcp.mjs https://madegooddesigns.com/inspiration
   IND=education python3 tests/hc_routes.py https://madegooddesigns.com/inspiration
   python3 tests/hc_routes.py https://madegooddesigns.com/inspiration
   for I in real-estate restaurant wedding portfolio beauty-fitness construction professional-services; do IND=$I python3 tests/hc_routes.py https://madegooddesigns.com/inspiration; done
   zsh ../deploy-bundle-2026-11-25/guard_checks.sh
   ```

## Rollback

1. `npx wrangler rollback <recorded version id>`, purge `/inspiration/ui` and `/inspiration/mcp`.
2. Apply `../deploy-bundle-2026-11-25/tpl-r7-education-rollback.sql` (one UPDATE: status='removed' on exactly the 98 ids AND source_urls).
3. Revert the merge on museum-collection-2026-10 and push, so a wrap-up does not redeploy it. R2 objects can stay (unlinked).
