# DEPLOY: templates r7 + r8 + r9 together (education, automotive, travel). STAGED, NOT DEPLOYED

Owner 25-Nov-2026 18:07: ship r7 + r8 + r9 in one go. Copy as decided: r7 label A / notice A (as built), r8 label A "Automotive" / notice A, r9 label C "Travel, tourism and stays" (hub H1 "Travel, tourism and accommodation website templates") / notice A. Owner 18:40: flat-page 301s are handled per industry later, so this go-live has NO new flat-page 301: `travel-website` stays a flat page, and r7's education 301s are exactly as built. The travel-website -> hub 301 and the Halcyon Quay / Driftmark homepage fix are a separate later step: branch `tpl-r9-trfix`, `DEPLOY-tpl-r9-trfix.md` there (after this go-live).

**Worker code: branch `tpl-r9-travel`** (worktree `../mgd-inspiration-tpl-r9`). It is r8 (`tpl-r8-automotive` 67ae531) + r7 (`tpl-r7-education` 3b6d37b, merged 783e326) + r9 + origin/museum-collection-2026-10 at b5dc912 (typo-b1 MCP and museum wave, merged 5ae879d) + owner copy C for the travel label and H1. Do not merge `tpl-r7-education` or `tpl-r8-automotive` separately: everything is in this branch. If r7 or r8 change before go-live, re-merge them here and rebuild the catalog (see DEPLOY-tpl-r9-travel.md).

Per-round detail stays in `DEPLOY-tpl-r7-education.md` (r7 worktree), `DEPLOY-tpl-r8-automotive.md` (r8 worktree) and `DEPLOY-tpl-r9-travel.md` (here).

## What goes live

| Part | D1 | R2 objects | Bundle (`../deploy-bundle-2026-11-25/`) | Upload script runs from |
|---|---|---|---|---|
| r7 education | 98 INSERTs (`changes=1` each) | 637 | `tpl-r7-education-{rows,rollback}.sql`, `-r2.tsv` | `../mgd-inspiration-tpl-r7` |
| r8 automotive | 98 INSERTs | 637 | `tpl-r8-automotive-*` | `../mgd-inspiration-tpl-r8` |
| r9 travel | 98 INSERTs | 637 | `tpl-r9-travel-*` | `../mgd-inspiration-tpl-r9` |

No id or R2 key is shared between r7, r8 and r9 (checked 25-Nov). The three worktrees must still exist when the upload scripts run (each tsv points at files inside its own worktree).

**Timing (from earlier uploads at -P8: r5 624 objects 2 m 50 s, r6 624 objects 3 m 20 s, edfix 160 objects 1 m 10 s):** R2 about 3 to 3.5 min per round, so **about 10 to 11 min for all 1,911 objects (about 340 MB), run one after the other; allow 15 to 20 min with retries.** D1 is one `wrangler d1 execute` per line with 1 s gaps, about 2.3 s a row: **about 11 to 12 min for the 294 INSERTs**. Worker deploy, purge and live checks take about 15 min. **Total about 40 min, plus 15 min of buffer.** Do not overlap with the 23:05 library chain's D1 writes: start by 21:45 at the latest, or after the chain ends.

## Go-live (lead rule: R2 first, D1 rows BEFORE the Worker deploy)

All commands assume `cd ~/Downloads/EtiennAubertBonn`. Use the curl/8.4.0 UA for every check.

0. **Pre-flight.**
   ```
   pgrep -fl '[w]rangler deploy|[r]un1[5-9][0-9]_brands|[p]ubseq_list|[i]ngest_staged|[i]ngest_museum|DEPLOY_r1|[e]nrich_until|[w]rapup'   # must print nothing
   git -C mgd-inspiration-tpl-r9 status --short    # clean (only ignored files)
   git -C mgd-inspiration-tpl-r9 log --oneline -1  # the sha in the lane note
   ```
1. **R2, in order** (each must end `DONE ok=<n> bad=0`; re-running one is safe):
   ```
   zsh deploy-bundle-2026-11-25/r2_up_r7.sh      # ok=637
   zsh deploy-bundle-2026-11-25/r2_up_r8.sh      # ok=637
   zsh deploy-bundle-2026-11-25/r2_up_r9.sh      # ok=637
   ```
2. **Merge into the deploy checkout** (`mgd-inspiration`, branch museum-collection-2026-10):
   ```
   cd mgd-inspiration && git pull --rebase && git merge --no-edit tpl-r9-travel
   node --import ./tests/ui_rank/register.mjs tests/test_tpl_tree.mjs   # 24 checks, 0 failed
   node --import ./tests/ui_rank/register.mjs tests/test_ui_hint.mjs     # 93 passed, 0 failed
   cd ..
   ```
3. **D1, in order** (one statement per line, 1 s apart):
   ```
   zsh deploy-bundle-2026-11-25/d1_apply_r7.sh      # 98 lines changes=1
   zsh deploy-bundle-2026-11-25/d1_apply_r8.sh      # 98 lines changes=1
   zsh deploy-bundle-2026-11-25/d1_apply_r9.sh      # 98 lines changes=1
   ```
   Any `FAIL` line: re-run that script. The INSERTs are idempotent.
4. **Re-check origin right before the deploy** (25-Nov: a deploy nearly dropped a commit pushed from elsewhere):
   ```
   cd mgd-inspiration && git fetch origin
   git log --oneline HEAD..origin/museum-collection-2026-10    # anything listed: merge it now
   git merge --no-edit origin/museum-collection-2026-10        # only if the line above listed commits
   node --import ./tests/ui_rank/register.mjs tests/test_tpl_tree.mjs   # again after any merge
   git log --oneline origin/museum-collection-2026-10..HEAD | head      # what this deploy adds
   ```
5. **Worker deploy and push:**
   ```
   npx wrangler deployments list | head -20   # record the current version id = ROLLBACK_ID
   npx wrangler deploy
   git push origin museum-collection-2026-10
   cd ..
   ```
6. **Purge:**
   ```
   python3 deploy-bundle-2026-11-25/cf_prefix_purge.py madegooddesigns.com/inspiration/ui madegooddesigns.com/inspiration/mcp
   ```
7. **Live checks**, all from `mgd-inspiration-tpl-r9`, which has every round's tests:
   ```
   cd mgd-inspiration-tpl-r9; L=https://madegooddesigns.com/inspiration
   python3 tests/ed_live.py $L; python3 tests/au_live.py $L; python3 tests/tr_live.py $L    # hubs (tr_live: the copy C H1), niches, one-hop flat-niche 301s, zips hash-checked
   for t in ed au tr; do node tests/${t}_mcp.mjs $L; done
   python3 tests/hc_routes.py $L
   for I in real-estate restaurant wedding portfolio beauty-fitness construction professional-services education automotive travel; do IND=$I python3 tests/hc_routes.py $L; done
   for t in hc re rs wd pf bw cn ps; do node tests/${t}_mcp.mjs $L; done                    # older industries unchanged
   node --import ./tests/ui_rank/register.mjs tests/ui_rank/run.mjs --live $L/mcp --cases cases_tr.txt   # 17/17
   zsh ../deploy-bundle-2026-11-25/guard_checks.sh
   ```
   Also spot-check by hand: `/inspiration/ui/travel-website-templates` shows the new H1, and `/inspiration/ui/travel-website-template` still returns 200 (flat; it moves later with tpl-r9-trfix).

## Rollback (one section for all parts)

Do the parts that went out, in reverse order:
1. **Worker:** `cd mgd-inspiration && npx wrangler rollback <ROLLBACK_ID>`. This takes the r7, r8 and r9 code off together.
2. **D1 rows** (each rollback file is one statement):
   ```
   for f in tpl-r9-travel-rollback.sql tpl-r8-automotive-rollback.sql tpl-r7-education-rollback.sql; do
     npx wrangler d1 execute mgd-inspiration --remote --command "$(grep -v '^--' ../deploy-bundle-2026-11-25/$f | grep .)"; done   # status='removed' on exactly 98 ids AND source_urls each
   ```
3. **R2:** nothing to undo. The r7/r8/r9 objects can stay, since nothing links to them once the rows are removed.
4. **Git:** `git revert -m 1 <merge sha of tpl-r9-travel>` on museum-collection-2026-10 and push, so a wrap-up deploy does not bring it back.
5. **Purge** the same prefixes as step 6.
If tpl-r9-trfix has also gone out by then, roll that back first (its own DEPLOY file).

## Verified locally before staging (25-Nov)

- Full local e2e on this branch head (`SCRATCH=<dir> bash tests/tr_local_e2e.sh`): r7, r8 and r9 rows plus the live n12 homepages on one throwaway Worker. See the lane note for the counts.
- Unit tests: test_tpl_tree 24/0, test_ui_hint 93/0, test_next_offer 51/0. Ranking suites are identical to the r7/r8 base.
