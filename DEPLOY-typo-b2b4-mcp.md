# typo-b2b4 MCP change set: deploy and rollback

Branch `typo-b2b4-mcp` (worktree `~/Downloads/EtiennAubertBonn/mgd-inspiration-typo-b2b4`), cut 26-Nov-2026 from the local
`museum-collection-2026-10` HEAD **ba04652** (tonight's templates restructure; it was not on origin yet).
⚠ At cut time origin had one commit the local branch lacks: **4158fc3** "Museum guides: link wave-2026-11-25-P" (src/index.js +
src/ui/museum.html, 3 lines). Merge origin before deploying (step 1), or the deploy drops it (the 25-Nov typo-b1 lesson).
Local commit only. Nothing deployed; no D1, R2 or vars change.

## What changes (data only)
- `src/font_pairings.json`: **146 → 266 guide fonts, 879 → 1,479 pairs**. Adds the 120 B2, B3 and B4 pairing guides (40 each), each citing
  `https://madegooddesigns.com/<slug>/`. All 120 URLs are in mgd-kit/site_urls.json (B2 48/48, B3 50/50, B4 50/50 livechecks on 25-Nov).
  - Built offline, chained: `python3 -I deploy-bundle-2026-11-25/typo_publish/build_typo_mcp.py fonts-b2 <base> fp2.json`, then fonts-b3 on fp2, fonts-b4 on fp3.
  - The 146 existing entries are byte-identical: the new file is the old file with lines only added (test section 0).
  - Vein articles (glossary, vs, best-of, alternatives) are not included. The 2 held B2 vs pages are veins, so nothing is held from the data.
- No code change: font_pairing.js, curated, gf_meta, arg_alias are identical to ba04652 (the test asserts it).
- Effects: "Baloo" now reaches the Baloo 2 guide (was a similar-font answer); fold-ins reach their parent guide (Bungee Shade/Inline/Outline,
  Alegreya SC, IM Fell English SC, Bowlby One SC, Alegreya Sans SC). Cormorant Infant and Lobster Two used to fold into the Cormorant / Lobster
  guides by prefix and now answer with their own guides (the one intended supersession). Modak and Bagel Fat One still get the neutral
  "similar display fonts" answer (guides drafted in fonts-b5).
- Kit panel (owner, optional): `deploy-bundle-2026-11-25/typo_publish/out/pairings.fonts-b2b4.php` = the live B1 pairings.php + 120 pages
  (277 KB). Upload as `wp-content/mu-plugins/mgd-kit/pairings.php`, copy into `mgd-kit/mu-plugin/mgd-kit/pairings.php`, purge CF.

## Tests (local, 26-Nov)
- `node --no-warnings tests/typo_b2b4.test.mjs`: **ok, 2,665 assertions** (BASE ba04652; every BASE answer that cited a guide unchanged apart
  from the 2 listed supersessions; 120 × 4 query forms exact; why lines, GF partners, about blocks).
- `node --no-warnings tests/fp_r2.test.mjs`: ok, 8,741 assertions, 266 fonts / 1,479 pairs. `tests/fp_partner.test.mjs`: ok (partner case moved
  from Crimson Text, which now has a B2 guide, to Hind).
- `bash tests/typo_b2b4_local_e2e.sh` (wrangler dev --local, throwaway D1): **24 passed, 0 failed**. `bash tests/typo_b1_local_e2e.sh`: 16/0.
- `bash tests/mcp_errors_local_e2e.sh`: all checks passed. `node tests/test_mcp_errors_r1.mjs`: 50/0.
- `npx wrangler deploy --dry-run`: bundles.
- **Expected failures:** `typo_b1.test.mjs` (pins 146 fonts and flags curated fonts that now have real guides), `fp_gaps_r1/r2` (stale
  "79 curated" count, also fails on BASE, plus curated fonts superseded by B2-B4 guides, e.g. Red Hat Display), `fp_r4/r5/r6` (pinned to older
  BASE commits, already fail on BASE).
- Not changed, noted: the query form "fonts that go with <Font>" is not stripped by font_pairing.js (returns no match; "what goes with" works).
  It is a Secondary Keyword on every guide, so a small follow-up in font_pairing.js is worth doing.

## Deploy (Worker deploys follow the current deploy rule; no library writes running)
```zsh
cd ~/Downloads/EtiennAubertBonn/mgd-inspiration
# 1. fetch and compare with origin IMMEDIATELY before deploying
git fetch origin && git status -sb | head -1
git log --oneline HEAD..origin/museum-collection-2026-10      # anything listed must be merged first (4158fc3 at cut time)
git merge --no-edit origin/museum-collection-2026-10            # only if step above listed commits
git merge --no-ff typo-b2b4-mcp -m "Merge typo-b2b4-mcp: B2-B4 font guides in get_font_pairing"
node --no-warnings tests/typo_b2b4.test.mjs && node --no-warnings tests/fp_r2.test.mjs && node --no-warnings tests/fp_partner.test.mjs
git log --oneline origin/museum-collection-2026-10..HEAD       # review exactly what ships (includes the restructure if still undeployed)
# 2. record the live version, then deploy
npx wrangler deployments status | grep -m1 -oE '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}' | tee ../deploy-bundle-2026-11-25/typo_b2b4_prev_version
npx wrangler deploy
# 3. live checks (24 read-only JSON-RPC calls), then push
sleep 20; python3 tests/typo_b2b4_rpc.py https://madegooddesigns.com/inspiration --live-only | tail -3
git push origin museum-collection-2026-10
```
If the templates restructure (ba04652) has not been deployed yet when this ships, this deploy ships it too. Either deploy the restructure
first through its own gap script, or ship together and also run the DEPLOY-tpl-restructure.md step 5 live checks.

## Rollback
```zsh
cd ~/Downloads/EtiennAubertBonn/mgd-inspiration && npx wrangler rollback $(cat ../deploy-bundle-2026-11-25/typo_b2b4_prev_version)
```
Bundled data only, so a Worker rollback is complete. Undo locally: `git revert -m 1 <merge sha>`. Kit panel: restore
`typo_publish/out/pairings.fonts-b1.php` as pairings.php.
