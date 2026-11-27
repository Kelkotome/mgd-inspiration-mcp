# typo-b14 MCP change set: deploy and rollback

Branch `typo-b14-mcp` (worktree `~/Downloads/EtiennAubertBonn/mgd-inspiration-typo-b14`), cut 28-Nov-2026 from
**origin/museum-collection-2026-10 at 18c5c8d** (B13 merge, deployed as Worker 4deb6297). Local commit only. Not pushed, nothing deployed; no D1, R2 or vars change.

**Do not deploy until fonts-b14 is published** (`livecheck_typo.py` all ok).

## What changes (data only)
- `src/font_pairings.json`: **585 -> 625 guide fonts, 3,074 -> 3,274 pairs** (vs 18c5c8d). Adds all 40 B14 pairing guides
  (deploy-bundle-2026-11-25/fonts-b14), each citing `https://madegooddesigns.com/<slug>/`. Lines only added.
  Built offline with `typo_publish/build_typo_mcp.py fonts-b14 <18c5c8d font_pairings.json> typo_publish/out/font_pairings.fonts-b14.json`.
- Nothing held: no B14 name contains a fontKey() stop word. Waiting for the Sunrise (B8) stays held (asserted).
- One intended supersession: **Matemasie** was answered at BASE by the Mate guide via prefix (a false fold, different family); it now answers with its own guide (listed in SUPERSEDED, so any other change of a BASE guide answer fails).
- Changes vs BASE: 39 new guides `exact` (+ Matemasie), 3 fold-in names reach their new parent by prefix (e.g. Libertinus Serif Display, Aref Ruqaa Ink);
  fold-ins with a different first name part (Libertinus Sans/Mono/Math/Keyboard, Inria Sans, Tiro Devanagari Hindi/Marathi, Yuji Boku/Mai, Kosugi) answer `similar`/`partner`, as Gentium Book Plus did in B13 (an alias would be a code change; not in this set).
- Vein pages (hubs webflow, framer, editorial; alternatives Brush Script, American Typewriter, Cambria) are not included. No code change (asserted).
- `tests/fp_partner.test.mjs` unchanged (Gowun Dodum is still a partner-only font; B14's Gowun Batang does not capture it).

## Tests (local, 28-Nov)
- `node --no-warnings tests/typo_b14.test.mjs`: ok, 1,635 assertions (BASE 18c5c8d).
- `tests/fp_r2.test.mjs`: ok 19,870 assertions, 625 fonts / 3,274 pairs. `tests/fp_partner.test.mjs`: ok.
- Expected failure: `tests/typo_b13.test.mjs` pins the B13 counts (same pattern as earlier batches).
- Not run: wrangler local e2e.

## Deploy (after the fonts-b14 publish; Worker deploys follow the current deploy rule)
```zsh
cd ~/Downloads/EtiennAubertBonn/mgd-inspiration
git fetch origin && git log --oneline HEAD..origin/museum-collection-2026-10   # merge anything listed first
git merge --no-ff typo-b14-mcp -m "Merge typo-b14-mcp: B14 font guides in get_font_pairing"
node --no-warnings tests/typo_b14.test.mjs && node --no-warnings tests/fp_r2.test.mjs && node --no-warnings tests/fp_partner.test.mjs
npx wrangler deployments status | grep -m1 -oE '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}' | tee ../deploy-bundle-2026-11-25/typo_b14_prev_version
npx wrangler deploy
git push origin museum-collection-2026-10
```

## Rollback
`npx wrangler rollback $(cat ../deploy-bundle-2026-11-25/typo_b14_prev_version)`; locally `git revert -m 1 <merge sha>`.
