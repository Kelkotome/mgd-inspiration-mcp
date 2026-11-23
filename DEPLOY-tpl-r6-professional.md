# DEPLOY: templates r6, legal and professional services (24-Nov-2026)

Branch `tpl-r6-professional` in `../mgd-inspiration-tpl-r6` (from `9aa263b`, with `tpl-r5-fix` merged in). Ninth industry.
Industry choice, demand figures and the word rules: `docs/template-taxonomy.md`, section "Legal and professional services tree".

**Counts: 48 designs (96 screens: web + mobile), 48 WordPress themes, 8 niches, 6 designs each.**

| Niche | Nested HTML segment | WordPress segment |
|---|---|---|
| Law firm | law-firm-website-template | law-firm |
| Lawyer and attorney | lawyer-website-template | lawyer |
| Accounting firm | accounting-website-template | accounting |
| Tax preparation | tax-preparation-website-template | tax-preparation |
| Financial advisor | financial-advisor-website-template | financial-advisor |
| Insurance agency | insurance-website-template | insurance |
| Consulting firm | consulting-website-template | consulting |
| Staffing and recruitment agency | staffing-agency-website-template | staffing-agency |

Hub `/inspiration/ui/professional-services-website-templates`, WordPress `/inspiration/ui/wordpress-themes/professional-services/`.
n12/n13 rows law-firm-website (Whitcombe Hale) and financial-advisor-website (Lindqvale Planning) stay live plain items, not cards; their flat URLs 301 once.

## Files

Worker code (`src/`): `ui_tree.js`, `ui_seo.js`, `ui_search.js`, `ui_templates.js` (DISCLOSES, ALIASES, GENERAL, tplHint), `ui_screens.js`
(6 new page patterns), `ui_spec_phrases.js`, `ui_pattern_copy.json`, `tpl_copy.json`, `tpl_catalog.json` (build_catalog.mjs, 70 niches).
Build: `ui-screens/hc/content/*.js` (8), `ui-screens/lib.js` (8 families), `ui-screens/hc/engine.js` (8 motifs).
Tests: `ps_lint.py`, `ps_mcp.mjs`, `ps_live.py`, `ps_bundle.py`, `ind9_local_e2e.sh`, `r6_build.sh`, `ui_rank/cases_ps.txt`, hc_routes block.

## Local results

See the lane status file `../docs_updates/lane-templates-2026-11-24.md` for the numbers of this run (install test, e2e, ranking, bundle).

## Deploy order used (24-Nov, lead rule: D1 rows BEFORE the Worker deploy)

1. Bundle: `SCRATCH=<dir> PS_DUMP=<dir>/dump bash tests/ind9_local_e2e.sh`, then `python3 tests/ps_bundle.py <dir>/dump`
   → `../deploy-bundle-2026-11-24/tpl-r6-professional-{rows.sql,rollback.sql,r2.tsv}`.
2. R2: `zsh ../deploy-bundle-2026-11-24/r2_up_r6.sh` (expect bad=0).
3. Merge into museum-collection-2026-10 in `../mgd-inspiration` (pull first; wrap-up commits there).
4. D1: `zsh ../deploy-bundle-2026-11-24/d1_apply_r6.sh` (one statement per line, 1 s apart; expect 96 × changes≥1).
5. Record the current version, `npx wrangler deploy`, push museum-collection-2026-10 at once (cloud wrap-up deploys from origin).
6. Prefix purge `/inspiration/ui`, `/inspiration/mcp` (`python3 ../deploy-bundle-2026-11-24/cf_prefix_purge.py madegooddesigns.com/inspiration/ui madegooddesigns.com/inspiration/mcp`).
7. Live checks (curl/8.4.0 UA):
   ```
   python3 tests/ps_live.py https://madegooddesigns.com/inspiration
   node tests/ps_mcp.mjs https://madegooddesigns.com/inspiration
   python3 tests/hc_routes.py https://madegooddesigns.com/inspiration
   for I in real-estate restaurant wedding portfolio beauty-fitness construction professional-services; do IND=$I python3 tests/hc_routes.py https://madegooddesigns.com/inspiration; done
   zsh ../deploy-bundle-2026-11-24/guard_checks.sh   # Graduate curated pairings + Naruto franchise notice
   ```

## Rollback

1. `npx wrangler rollback <recorded version id>`, purge `/inspiration/ui` and `/inspiration/mcp`.
2. Apply `tpl-r6-professional-rollback.sql` one line at a time (UPDATE status='removed' on exactly the 96 ids AND source_urls).
3. Revert the merge on museum-collection-2026-10 and push, so the wrap-up does not redeploy it. R2 objects can stay (unlinked).

## Open questions for the owner

1. Keep legal and professional services as the ninth industry (lead's pick by demand; no queue was recorded)?
2. Copy: option A of the label and disclosure (status file lists B and C).
3. Fix the two old n12/n13 homepages (Whitcombe Hale, Lindqvale) to the r6 word rules in a follow-up UPDATE bundle, as done for construction tonight?
4. "Tarrowby Consulting" is close to a dissolved UK company name (Harrowby Consulting Ltd, 2019); rename if preferred.
