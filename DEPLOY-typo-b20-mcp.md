# typo-b20 MCP change set: deploy and rollback

Branch `typo-b20-mcp` (worktree `~/Downloads/EtiennAubertBonn/mgd-inspiration-typo-b20`), cut 29-Nov-2026 (night) from **typo-b19-mcp at 9750580**
(B19 data, not yet deployed), so B20 stacks on B19 (and B18). Local commit only. Not pushed, nothing deployed; no D1, R2 or vars change.

**Do not deploy until fonts-b20 is published** (`livecheck_typo.py fonts-b20` 34/34) **and typo-b19-mcp is deployed** (typo_b19.log "mcp-b19: deployed").

## What changes
B20 has no single-font pairing guides (7 script hubs + 27 free-alternatives pages), so `font_pairings.json` is unchanged. Instead:
- `src/font_alternatives.js` (new, generated): 82 published free-alternatives pages from the typography batches B3-B20 (46 B3-B17, already live
  29-Nov; 3 B18, 6 B19, 27 B20), each = paid font, page, Google Fonts look-alikes (the page's table, in order), a few aliases.
  Built by `deploy-bundle-2026-11-25/fonts-b20/src/build_mcp_alts.py src/font_alternatives.js` (read-only on the batches).
- `src/font_pairing.js`: get_font_pairing for a commercial / system font with no guide of its own (not a Google Fonts family) that has an
  alternatives page now answers `match: "alternatives"`: the look-alikes + page to cite, plus published pairings borrowed from the
  look-alikes' own guides (round robin, like the similar-font fallback). Runs before the fuzzy step. Partner-only fonts keep the partner
  answer with the look-alikes added (`alternatives_page`, `lookalikes`). Guide answers never change (Georgia: own guide; Sofia Pro: BASE prefix
  to the Sofia guide). Matching: name / alias, or the name plus or minus vendor and edition words (ITC Kabel, OCR A Extended, Bauhaus 93).
- Changed vs BASE (all Google families + every guide/partner font + the 82 names): 68 zero -> alternatives, 2 fuzzy -> alternatives
  (Kabel, Playbill: BASE stretched them to an unrelated guide), 11 partner -> partner + look-alikes. Nothing else.

## Tests (local, 29-Nov)
- `tests/typo_b20.test.mjs`: ok, 1,656 assertions (BASE 9750580; also re-runs build_mcp_alts.py and requires an identical file).
- `tests/fp_r2.test.mjs`: ok, 25,605 assertions. `tests/fp_partner.test.mjs`: ok. `tests/app_feed.test.mjs`: 41 ok.
- Expected failure: `tests/typo_b19.test.mjs` pins font_pairing.js to its BASE (same pattern as earlier batches).

## Deploy (after fonts-b20 publishes): `deploy-bundle-2026-11-09/mcp_b20_after.sh` in the background (waits for "b20: end" + 34/34 in typo_b20.log
and "mcp-b19: deployed" in typo_b19.log; merge origin, abort on conflict, tests, ff push, rollback id to deploy-bundle-2026-11-25/typo_b20_prev_version,
deploy, live check: get_font_pairing Microgramma -> microgramma-font-alternatives).
## Rollback
`npx wrangler rollback $(cat ../deploy-bundle-2026-11-25/typo_b20_prev_version)`; locally `git revert -m 1 <merge sha>`.
