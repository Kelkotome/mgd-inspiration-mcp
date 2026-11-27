# DEPLOY: app-collections-feed (28-Nov-2026)

GET /inspiration/api/feed gains collection=website-templates | ui-screens | brand-guides | font-pairings (also col=) for the
MGD app's Inspiration chips. Code: src/app_feed.js (+ generated src/app_font_pairings.js), wired at the top of feed() in
src/index.js. Read-only; no migration (uses existing idx_items_feed / idx_items_category). Full notes, D1 cost per page,
copy options and the app side: mgd-app/HANDOFF-app-collections.md in the parent repo (branch app-boards-p1).

1. node --no-warnings tests/app_feed.test.mjs   (41 checks)
2. merge into the deploy branch after the other session's uncommitted index.js / next_offer.js work; npx wrangler deploy (user)
3. curl -A curl/8.4.0 -H 'Accept: */*' 'https://madegooddesigns.com/inspiration/api/feed?collection=website-templates&limit=2'
   → items with "kind":"template"; repeat for ui-screens, brand-guides, font-pairings; collection=design unchanged.
4. Then the app build (old app builds never request these collections).
Rollback: wrangler rollback to the previous version; nothing else depends on it.
