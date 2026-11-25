# DEPLOY: website-templates restructure (25-Nov-2026), STAGED, NOT DEPLOYED

Branch `tpl-restructure` in `../mgd-inspiration-tpl-restructure`, cut from `tpl-r9-travel` 5ae879d (r7 education + r8 automotive + r9 travel stacked), with `tpl-r9-travel` dd2cb3e (the r7+r8+r9 go-live, live 20:10 25-Nov, Worker c4ebfd00) and `tpl-r9-trfix` d9034c3 (travel-website 301 to the hub + Halcyon Quay/Driftmark rows) merged in. Base for go-live: **origin/museum-collection-2026-10 after the trfix deploy**.
Owner decision (25-Nov, after `docs_updates/template-seo-structure-benchmark-2026-11-25.md`): **flat URLs + visible hierarchy**. No URL moves and no new 301s in this round.
**Code only.** No D1 rows, no R2 objects, no catalog change: everything comes from `src/ui_tree.js` (CATEGORIES, INDUSTRIES[].groups) and `src/tpl_copy.json` ("categories", "groups").

## Ships AFTER the r7 + r8 + r9 go-live AND the tpl-r9-trfix deploy

This branch contains r7, r8, r9 and trfix code. Order:
1. r7 + r8 + r9 live per `DEPLOY-tpl-r7-r8-r9.md` (done 20:10 25-Nov, Worker c4ebfd00).
2. trfix live per `DEPLOY-tpl-r9-trfix.md` (coordinator, ~21:15 25-Nov): its D1 UPDATEs and R2 objects must be live first, because this branch carries the trfix code (travel-website 301s to the hub; Halcyon Quay / Driftmark rows).
3. If tpl-r9-travel or tpl-r9-trfix moved past dd2cb3e / d9034c3, `git merge` them here again (keep both sides), re-run the tests below.
4. Then this branch.

## What changes

- **7 top categories, standalone pages (not URL parents), 6 live:**

  | Category | URL `/inspiration/ui/...` | H1 |
  |---|---|---|
  | Health and wellness | `health-and-wellness-website-templates` | Health and wellness website templates |
  | Food, travel and hospitality | `food-website-templates` | Food and hospitality website templates |
  | Property, trades and automotive | `property-and-trades-website-templates` | Property and trades website templates |
  | Business and technology | `business-website-templates` | Business website templates |
  | Creative, media and events | `creative-website-templates` | Creative website templates |
  | Learning and community | `learning-and-community-website-templates` | Learning and community website templates |
  | Shops and online stores | `online-store-website-templates` | (404 until r11 ecommerce) |

  Content is generated from the tree (counts computed, never typed): industry table, "Looking for a more specific type?" child-link module, niche-labelled template cards (theme name + niche), "Which sections each kind of site needs", how to choose, FAQ (FAQPage), "Can't find your kind of site? Build it with your AI" (MCP) fallback, other categories. CollectionPage + ItemList + BreadcrumbList.
- **Hierarchy without new paths.** Breadcrumbs, visible and in BreadcrumbList, use one root label, "Website templates" (it was "Templates" on industry and niche pages and "Free website templates" on the hub). HTML: `UI screens › Website templates › Health and wellness › Healthcare › Medical › Cardiology`, on the unchanged flat URL `/ui/healthcare-website-templates/cardiology-website-template`. WordPress: `UI screens › WordPress themes › Healthcare › Medical › Cardiology › <theme>`.
- The healthcare hub (HTML and WordPress) groups its niches under H2 sections: Medical, Dental, Mental health, Therapy and rehab, Eye care and pharmacy, Animal health. Nutrition, pregnancy and care stays hidden until r14 adds its niches.
- The Medical and Dental pages carry a "Looking for a more specific medical / dental type?" module. Member pages get a "Part of medical" strip with their siblings. Every niche page gets a "More <industry> templates" strip. Industry hubs get a "Part of <category>" link and the build-with-your-AI fallback. The hub `/ui/website-templates` gets a "By category" block.
- Filters stay query parameters, and their canonical is the unfiltered page (unchanged; now tested on category pages too). No template page is paginated: the gallery uses "Show more" on one URL.
- Each category page also has a "<Category> WordPress themes" section and one sub-type FAQ (content gap 25-Nov, `docs_updates/template-content-gap-2026-11-25.md`).
- Sitemap: + the 6 category URLs. Every other URL is unchanged by this branch. (The flat travel page leaves the sitemap and 301s to the hub through trfix, which is already live by then.)
- Not in this round: the other flat-page 301s (education, salon, clinic, portfolio-website...). They ship in each industry's fix bundle.

## Tests (local, 25-Nov)

```
R=./tests/ui_rank/register.mjs
node --import $R tests/test_tpl_tree.mjs          # unchanged suite
node --import $R tests/test_tpl_restructure.mjs   # every base (5ae879d) path still served, categories, groups, crumbs, schema, MCP URLs
node tests/test_ui_hint.mjs; node tests/test_next_offer.mjs
for c in tests/ui_rank/cases*.txt; do node --import $R tests/ui_rank/run.mjs --cases $(basename $c); done   # identical to base
bash tests/rs_local_e2e.sh   # wrangler dev --local: all 12 industries + trfix rows (out-trfix lint), hc_routes x11 (travel: one-hop 301 + sitemap), rs_routes, 11 MCP suites
```

## Go-live (not run)

Before starting: `pgrep -fl '[w]rangler deploy|[r]un1[5-9][0-9]_brands|[p]ubseq_list|[i]ngest_staged|[i]ngest_museum|DEPLOY_r1|[e]nrich_until|[w]rapup'` must print nothing.

1. In `../mgd-inspiration` (branch museum-collection-2026-10):
   ```
   git fetch origin && git status          # clean
   git pull --rebase                       # wrap-ups commit there
   git merge tpl-restructure               # keep both sides in any conflict
   node --import ./tests/ui_rank/register.mjs tests/test_tpl_tree.mjs && node --import ./tests/ui_rank/register.mjs tests/test_tpl_restructure.mjs
   ```
2. Right before deploying, compare with the remote again:
   `git fetch origin && git rev-list --left-right --count origin/museum-collection-2026-10...HEAD` (left must be 0; otherwise `git pull --rebase`, re-run the two unit tests, repeat).
3. `npx wrangler deployments list` (record the current version id as ROLLBACK), then `npx wrangler deploy`, then `git push origin museum-collection-2026-10` straight away.
4. Purge Cloudflare for the template paths. Hubs and niche pages are edge-cached for 30 minutes with the old crumbs. The 7-day HTML rule excludes /inspiration, but purge anyway:
   `python3 ../deploy-bundle-2026-11-25/cf_prefix_purge.py madegooddesigns.com/inspiration/ui madegooddesigns.com/inspiration/mcp`
5. Live checks (curl/8.4.0 UA), from this worktree:
   ```
   python3 tests/rs_routes.py https://madegooddesigns.com/inspiration --sample 12
   python3 tests/hc_routes.py https://madegooddesigns.com/inspiration
   for I in real-estate restaurant wedding portfolio beauty-fitness construction professional-services education automotive travel; do IND=$I python3 tests/hc_routes.py https://madegooddesigns.com/inspiration; done
   node tests/hc_mcp.mjs https://madegooddesigns.com/inspiration
   for s in health-and-wellness food property-and-trades business creative learning-and-community; do curl -s -o /dev/null -w "$s %{http_code}\n" -A curl/8.4.0 https://madegooddesigns.com/inspiration/ui/$s-website-templates; done
   zsh ../deploy-bundle-2026-11-25/guard_checks.sh
   ```

## Rollback

- `npx wrangler rollback <ROLLBACK id>`, then the purge from step 4. The 6 category URLs then 404 again and the crumbs go back to the old labels; no other URL is affected.
- **No D1 or R2 change is needed** (none was made). Revert the merge in `../mgd-inspiration` and push, so the next deploy does not ship it again.

## After go-live

- Resubmit `https://madegooddesigns.com/inspiration/ui/sitemap.xml` in Google Search Console and Bing Webmaster Tools. This is the owner's step, because the GSC token is read-only and currently expired. The sitemap now lists the 6 category URLs (the 7th, online-store, joins with r11).
- Optional: an IndexNow ping for the 6 category URLs.
