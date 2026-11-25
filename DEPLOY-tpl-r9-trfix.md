# DEPLOY: travel fix bundle (travel-website 301 to the hub + Halcyon Quay / Driftmark homepages). STAGED, NOT DEPLOYED. AFTER the r7+r8+r9 go-live

Owner 25-Nov-2026 18:40: flat-page 301s are handled per industry, after the combined go-live. This bundle is that step for travel, together with the homepage fix approved at 18:07.

Branch `tpl-r9-trfix` (worktree `../mgd-inspiration-tpl-r9fix`) = `tpl-r9-travel` (the go-live head) + one commit. Ship it only after `DEPLOY-tpl-r7-r8-r9.md` (in `../mgd-inspiration-tpl-r9`) is live and checked. If tpl-r9-travel moves before then, rebase this commit onto it.

## What it changes

1. **Worker (code), 301:** `src/ui_tree.js` adds `hubPatterns: ["travel-website"]` to INDUSTRIES.travel. `nestedPatternPath()` then returns the hub for that pattern. The result: `/ui/travel-website-template`, `/ui/travel-website` (old id) and their trailing-slash and `?pattern=` forms 301 once to `/ui/travel-website-templates` (query kept); item breadcrumbs, canonicals, the UI index and the sitemap point at the hub; the sitemap lists the hub once and the flat URL not at all. The pattern stays flat if the travel hub ever drops below the page test. `assertTree` fails the deploy if a hub pattern is also a niche pattern.
2. **Data (D1 + R2), homepages:** the 32 live n12 rows `hotel-website-homepage-*` (Halcyon Quay) and `travel-website-homepage-*` (Driftmark Journeys), 16 each (8 styles, web + mobile), get the r9 word rules:
   - Hotel: fictional notice with a general-information / not-advice line; $00 sample rates (were $245 to $640, plus $25, $9 and $18); guest notes and star rating removed; no lowest-rate, free-cancellation or 24-hour lines; accessibility and sustainability footer links removed. Licence, registration, grading, accessibility, insurance and booking, deposit and cancellation terms become add-your-own.
   - Travel: no real countries or regions; $00 sample prices (were $2,140 to $3,920, plus $300 and $40); no invented counts, percentages or years; traveller notes removed; deposit, change and protection terms become add-your-own; an official travel advice line added.
   Sources: `ui-screens/tpl/site-hotel.js` and `site-travel.js`. `tests/tr_fix_bundle.py` builds the bundle.

| Bundle (`../deploy-bundle-2026-11-25/`) | |
|---|---|
| `tpl-trfix.sql` | 32 UPDATEs (image_key, height, title, description, tags, palette, company) WHERE collection + id + source_url; idempotent |
| `tpl-trfix-rollback.sql` | 32 UPDATEs back to the live values read 25-Nov (the same as the 12-Nov snapshot) |
| `tpl-trfix-r2.tsv` | 160 objects, 21.4 MB, version `mwvyuimy` (new versioned images, plus index.html, spec.json and DESIGN.md overwritten in place); files in this worktree's `ui-screens/out-r2-trfix/` (gitignored, sha-checked on upload) |
| `trfix-rollback-r2/` + `r2_rollback_trfix.sh` | the 96 live text files from before the fix |
| `r2_up_trfix.sh`, `r2_one_trfix.sh`, `d1_apply_trfix.sh` | upload and apply scripts |

**Timing:** R2 about 1 min (edfix: 160 objects in 1 m 10 s); D1 about 1.5 min; deploy, purge and checks about 10 min. Keep it clear of the library chain's D1 writes.

## Go-live (after the combined go-live; R2 first, D1 before the Worker)

From `~/Downloads/EtiennAubertBonn`:
0. Pre-flight: run the same `pgrep` as in the combined file (it must print nothing), and confirm the r7+r8+r9 live checks passed.
1. `zsh deploy-bundle-2026-11-25/r2_up_trfix.sh` (expect `DONE ok=160 bad=0`).
2. `cd mgd-inspiration && git pull --rebase && git merge --no-edit tpl-r9-trfix && node --import ./tests/ui_rank/register.mjs tests/test_tpl_tree.mjs` (expect 27 checks, 0 failed). `cd ..`
3. `zsh deploy-bundle-2026-11-25/d1_apply_trfix.sh` (expect 32 lines `changes=5`, as edfix).
4. In `mgd-inspiration`:
   - `git fetch origin && git log --oneline HEAD..origin/museum-collection-2026-10`. If anything is listed, run `git merge --no-edit origin/museum-collection-2026-10` and re-run test_tpl_tree.
   - `npx wrangler deployments list | head` and record the id as ROLLBACK_ID (the go-live version).
   - `npx wrangler deploy && git push origin museum-collection-2026-10`.
5. `python3 deploy-bundle-2026-11-25/cf_prefix_purge.py madegooddesigns.com/inspiration/ui madegooddesigns.com/inspiration/mcp madegooddesigns.com/inspiration/api/item`
6. Live checks from `mgd-inspiration-tpl-r9fix` (curl/8.4.0):
   ```
   L=https://madegooddesigns.com/inspiration
   python3 tests/tr_live.py $L                  # + travel-website one 301 to the hub, the 2 web-minimal trfix pages ($00, notice, no old wording)
   IND=travel python3 tests/hc_routes.py $L     # + 6 one-hop 301s to the hub, sitemap lists the hub once and no flat travel URL
   python3 tests/hc_routes.py $L; node tests/tr_mcp.mjs $L
   zsh ../deploy-bundle-2026-11-25/guard_checks.sh
   ```
   By hand: for a few trfix ids, check the new image key `/img/ui/<id>-mwvyuimy.webp` returns 200, and the item page shows the notice.

## Rollback (either part on its own, or both)

- **301 only:**
  1. `cd mgd-inspiration && npx wrangler rollback <ROLLBACK_ID>`.
  2. `git revert -m 1 <merge sha>` and push.
  3. Purge `/inspiration/ui` and `/inspiration/mcp`.
  The homepage data can stay as it is.
- **Homepages only:**
  1. `SQL=tpl-trfix-rollback.sql zsh deploy-bundle-2026-11-25/d1_apply_trfix.sh` (32 lines).
  2. `zsh deploy-bundle-2026-11-25/r2_rollback_trfix.sh` (96 files). The old images were never deleted.
  3. Purge `/inspiration/ui`, `/inspiration/mcp` and `/inspiration/api/item`.
- **Both:** do both of the above. The go-live (r7+r8+r9) is not affected.

## Verified locally (25-Nov)

- `TR_LINT_HOMEPAGES=1 TR_LINT_OUT=ui-screens/out-trfix python3 tests/tr_lint.py`: 32/32 web + mobile. The r9 designs still pass (49/49 and 49/49 readmes; selftest 17/17).
- `tests/tr_fix_bundle.py` on a copy of the 12-Nov snapshot:
  - forward 32;
  - a re-run gives identical rows;
  - 0 rows with old wording left;
  - rollback restores 32/32, equal to before;
  - the row count is unchanged.
- Full local e2e (`tests/tr_local_e2e.sh`) on exactly this code (r9 + hubPatterns + the out-trfix homepages ingested): RC=0, every hc_routes sweep and MCP suite 0 failed (travel sweep 1,314 checks, including the 301s and the sitemap), 145 zips hash-checked. The r9 rows are byte-identical to the staged r9 bundle.
- Unit: test_tpl_tree 27/0 (3 new hub-pattern checks), test_ui_hint 93/0, test_next_offer 51/0. Ranking suites are the same as on tpl-r9-travel.

**Later restructure (owner: real nested URLs such as /ui/.../healthcare/medical/cardiology, own pages for 7 top categories):** `hubPatterns` is per industry data. Because `patternSlug()` reads it through `nestedPatternPath()`, a later path change moves the redirect target with it, so this adds no extra route to undo. One caution: an old pattern that maps to a hub (not to a niche) needs its target re-pointed if hubs move under a top category. Both `hubOfPattern` and `assertTree` are the single place to change that.
