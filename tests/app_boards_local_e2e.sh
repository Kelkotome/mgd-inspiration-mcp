#!/bin/bash
# App board links Phase 1 (23-Nov-2026): the real workerd runtime (wrangler dev --local --test-scheduled, throwaway D1 + R2, no routes,
# nothing remote) on the r7 seed rows + 3 app-board rows (link-only, unpublished, private upload):
#   1. node unit suites: tests/test_text_filter.mjs, tests/test_app_boards.mjs
#   2. tests/app_boards_rpc.py: API, page, Markdown, MCP get_shared_board, caps, filter, rate limits, XSS, 404/410, expiry + cron
#   3. regression on the same Worker: tests/r7_rpc.py --local, fp6_rpc.py, fp5_rpc.py, r4_rpc.py --local, rpc_moodboard_discovery.py
# Usage: bash tests/app_boards_local_e2e.sh   (env AB_PORT / AB_INSP, default 8987 / 9387; SCRATCH=<dir> for temp files)
set -u
cd "$(dirname "$0")/.."; ROOT=$(pwd); W="${WRANGLER:-$ROOT/node_modules/.bin/wrangler}"; PORT=${AB_PORT:-8987}; INSP=${AB_INSP:-9387}
T=$(mktemp -d "${SCRATCH:-$ROOT}/ab-e2e.XXXXXX"); CFG="$ROOT/wrangler.ab.jsonc"
python3 - <<'PY'
src = open("wrangler.jsonc").read(); i = src.index('"routes"'); j = src.index("]", i) + 1
open("wrangler.ab.jsonc", "w").write(src[:i] + '"routes": []' + src[j:])
PY
for p in $PORT $INSP; do lsof -ti tcp:$p -sTCP:LISTEN >/dev/null 2>&1 && { echo "refusing: port $p is in use by a process this script did not start"; rm -f "$CFG"; exit 2; }; done
cleanup() { [ -n "${DEVPID:-}" ] && { pkill -P "$DEVPID" 2>/dev/null; kill "$DEVPID" 2>/dev/null; sleep 1; lsof -ti tcp:$PORT -ti tcp:$INSP -sTCP:LISTEN 2>/dev/null | xargs kill 2>/dev/null; }; rm -f "$CFG"; cp "$T/dev.log" "${SCRATCH:-$ROOT}/ab-last-dev.log" 2>/dev/null; rm -rf "$T"; }
trap cleanup EXIT
D1() { "$W" d1 execute mgd-inspiration --local -c "$CFG" --persist-to "$T/state" "$@"; }
D1 --file=./schema.sql >>"$T/setup.log" 2>&1 || { tail -5 "$T/setup.log"; exit 1; }
D1 --command "ALTER TABLE items ADD COLUMN hue REAL" >>"$T/setup.log" 2>&1 || true
for f in migrate_category migrate_country migrate_featured migrate_rights migrate_srcurl migrate_annual migrate_mcp migrate_mcp_events migrate_mcp_events_err migrate_subscribers migrate_moodboards migrate_oauth migrate_boards_v2 migrate_boards_canvas migrate_feedidx migrate_ai_usage migrate_fts migrate_app_boards; do [ -f "$f.sql" ] && D1 --file=./$f.sql >>"$T/setup.log" 2>&1; done
P='[\"#1F3A4D\",\"#C9A77C\",\"#F6F1E7\",\"#3E4A3D\"]'
D1 --command "INSERT INTO items (id,title,description,source_url,source_host,image_key,tags,themes,palette,status,created_at,collection,company,report_year,designer,industry,country,category,style,width,height,owner_id) VALUES
 ('c0000000000a','Interior with a Woman at a Piano','Quiet grey interior.','https://open.smk.dk/1','open.smk.dk','museum/c0000000000a.jpg','[]','[]','$P','published',1700000001000,'museum','Statens Museum for Kunst',1901,'Vilhelm Hammershøi','Painting','Danish','painting',NULL,1200,900,NULL),
 ('c0000000000b','Portrait of the Artist''s Wife','Portrait.','https://open.smk.dk/2','open.smk.dk','museum/c0000000000b.jpg','[]','[]','$P','published',1700000002000,'museum','Statens Museum for Kunst',1836,'Christen Købke','Painting','Danish','painting',NULL,1000,1200,NULL),
 ('c0000000000c','Bjørg — Brand Guidelines','Organic food brand guide.','https://madegooddesigns.com/bjorg-brand-guidelines/','madegooddesigns.com','items/c0000000000c.png','[\"bjørg\",\"brand guidelines\"]','[\"branding\",\"brand-cover\"]','$P','published',1700000003000,'design','Bjørg',NULL,NULL,'food',NULL,NULL,'brand-cover',1200,900,NULL),
 ('c0000000000d','Antonín Dvořák festival poster','A concert poster with bold serif type.','https://example.org/dvorak','example.org','items/c0000000000d.png','[\"poster\",\"music\"]','[\"retro\"]','$P','published',1700000004000,'design',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1000,1400,NULL),
 ('c0000000000e','Rodenbach — Brand Guidelines','Flemish red ale brand guide.','https://madegooddesigns.com/rodenbach-brand-guidelines/','madegooddesigns.com','items/c0000000000e.png','[\"rodenbach\",\"beer\"]','[\"branding\",\"brand-cover\"]','$P','published',1700000005000,'design','Rodenbach',NULL,NULL,'beverage',NULL,NULL,'brand-cover',1200,900,NULL),
 ('c0000000000f','Müller poster','Swiss grid poster after Josef Müller-Brockmann.','https://example.org/muller','example.org','items/c0000000000f.png','[\"swiss\",\"grid\"]','[\"swiss\"]','$P','published',1700000006000,'design',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1000,1400,NULL),
 ('c00000000010','Nike — Brand Guidelines','Sportswear brand guide.','https://madegooddesigns.com/nike-brand-guidelines/','madegooddesigns.com','items/c00000000010.png','[\"nike\",\"font\"]','[\"branding\",\"brand-cover\"]','$P','published',1700000007000,'design','Nike',NULL,NULL,'sportswear',NULL,NULL,'brand-cover',1200,900,NULL),
 ('c00000000011','Poppins font specimen poster','A geometric sans specimen.','https://example.org/poppins','example.org','items/c00000000011.png','[\"font\",\"specimen\"]','[\"minimal\"]','$P','published',1700000008000,'design',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1000,1400,NULL),
 ('c00000000012','Materials marketplace website mockup','Marketplace for building materials.','https://example.org/materials','example.org','items/c00000000012.png','[\"marketplace\",\"materials\"]','[\"minimal\"]','$P','published',1700000009000,'design',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1440,900,NULL),
 ('c00000000013','Warm colour palette poster','A warm colour palette study.','https://example.org/warm','example.org','items/c00000000013.png','[\"colour palette\",\"warm\"]','[\"retro\"]','$P','published',1700000010000,'design',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1000,1400,NULL),
 ('c00000000014','Søstrene Grene — Typeface','Brand typography specimen.','https://madegooddesigns.com/sostrene-grene-brand-guidelines/','madegooddesigns.com','items/c00000000014.png','[\"søstrene grene\"]','[\"type-specimen\"]','$P','published',1700000011000,'design','Søstrene Grene',NULL,NULL,'retail',NULL,NULL,'type-specimen',1200,900,NULL),
 ('c00000000015','Müller AG 1928','Annual report cover.','https://archive.org/details/m1','archive.org','annual/c00000000015.jpg','[]','[]','$P','published',1700000012000,'annual-report','Müller AG',1928,NULL,'manufacturing','Germany',NULL,NULL,600,900,NULL),
 ('c00000000016','Retro diner sign','Retro lettering.','https://example.org/retro','example.org','items/c00000000016.png','[\"lettering\"]','[\"retro\",\"vintage\"]','$P','published',1700000013000,'design',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1000,1000,NULL)" >>"$T/setup.log" 2>&1 || { echo "seed failed"; tail -5 "$T/setup.log"; exit 1; }
# the r4 e2e's rows too, so tests/r4_rpc.py's facet-page checks have their museum / annual-report pages
D1 --command "INSERT INTO items (id,title,description,source_url,source_host,image_key,tags,themes,palette,status,created_at,collection,company,report_year,designer,industry,country,category,width,height,owner_id) VALUES
 ('aaaaaaaaaaa1','Federal Reserve Bank of Dallas 1926 Report to Stockholders','Annual report cover.','https://archive.org/details/x1','archive.org','annual/aaaaaaaaaaa1.jpg','[]','[]','[]','published',1700000001000,'annual-report','Federal Reserve Bank of Dallas',1926,NULL,'banking','United States',NULL,600,900,NULL),
 ('aaaaaaaaaaa2','Acme Transit 1972','Swiss grid cover.','https://archive.org/details/x2','archive.org','annual/aaaaaaaaaaa2.jpg','[]','[]','[]','published',1700000002000,'annual-report','Acme Transit',1972,'Paul Rand','transit','United States',NULL,640,880,NULL),
 ('bbbbbbbbbbb1','Vase with Lid','A covered vase.','https://museum.example/1','museum.example','museum/bbbbbbbbbbb1.jpg','[]','[]','[\"#112233\"]','published',1700000003000,'museum','The Metropolitan Museum of Art',1720,'Jan Brueghel the Elder','Vase','Greek','ceramics',1200,1500,NULL),
 ('bbbbbbbbbbb2','Second Vase','Another vase.','https://museum.example/2','museum.example','museum/bbbbbbbbbbb2.jpg','[]','[]','[]','published',1700000004000,'museum','The Metropolitan Museum of Art',1730,'Jan Brueghel the Elder','Vase','greek','ceramics',1000,800,NULL)" >>"$T/setup.log" 2>&1 || { echo "seed (r4 rows) failed"; tail -5 "$T/setup.log"; exit 1; }
D1 --command "INSERT INTO items (id,title,description,source_url,source_host,image_key,tags,themes,palette,status,created_at,collection,width,height,owner_id) VALUES
 ('d00000000001','Licensed scan (link only)','x','https://lib.example/1','lib.example','link/d00000000001.jpg','[]','[]','[]','published',1700000020000,'design',800,600,NULL),
 ('e00000000001','Pending item','x','https://p.example/1','p.example','items/e00000000001.jpg','[]','[]','[]','pending',1700000021000,'design',800,600,NULL),
 ('bbbbbbbbbbb9','Private user item','x','https://private.example/','private.example','user/u/bbbbbbbbbbb9.jpg','[]','[]','[]','published',1700000022000,'design',800,600,'someoneelse1')" >>"$T/setup.log" 2>&1 || { echo "seed (app-board rows) failed"; tail -5 "$T/setup.log"; exit 1; }
"$W" dev --local -c "$CFG" --persist-to "$T/state" --port $PORT --inspector-port $INSP --test-scheduled --var APP_BOARD_DAILY_LIMIT:8 --var APP_BOARD_UPDATE_LIMIT:5 --var ADMIN_TOKEN:local-admin-test --var MOODBOARD_DAILY_LIMIT:6 --show-interactive-dev-session=false > "$T/dev.log" 2>&1 &
DEVPID=$!; up=0; for i in $(seq 1 90); do curl -s -o /dev/null http://127.0.0.1:$PORT/inspiration/mcp && { up=1; break; }; sleep 1; done
[ $up = 1 ] || { echo "dev server did not start"; tail -20 "$T/dev.log"; exit 1; }
L=http://127.0.0.1:$PORT/inspiration
RC=0
for u in test_text_filter test_app_boards; do node --experimental-default-type=module tests/$u.mjs > "$T/$u" 2>&1; grep '^FAIL' "$T/$u"; echo "$u: $(tail -1 "$T/$u")"; grep -q '^\([0-9]*\)/\1 passed$' "$T/$u" || RC=1; done
D1CMD="$W d1 execute mgd-inspiration --local -c $CFG --persist-to $T/state" python3 tests/app_boards_rpc.py "http://127.0.0.1:$PORT" > "$T/ab" 2>&1; grep -E '^FAIL|^SKIP' "$T/ab"; echo "app_boards_rpc: $(tail -1 "$T/ab")"; grep -q ' 0 failed$' "$T/ab" || RC=1
python3 tests/r7_rpc.py "$L" --local > "$T/r7" 2>&1; grep -E '^FAIL' "$T/r7"; echo "r7_rpc: $(tail -1 "$T/r7")"; grep -q ' 0 failed$' "$T/r7" || RC=1
python3 tests/fp6_rpc.py "$L" > "$T/fp6" 2>&1; grep -E '^FAIL' "$T/fp6"; echo "fp6_rpc: $(tail -1 "$T/fp6")"; grep -q ' 0 failed$' "$T/fp6" || RC=1
python3 tests/fp5_rpc.py "$L" > "$T/fp5" 2>&1; grep -E '^FAIL' "$T/fp5"; echo "fp5_rpc: $(tail -1 "$T/fp5")"; grep -q ' 0 failed$' "$T/fp5" || RC=1
python3 tests/r4_rpc.py "$L" --local > "$T/r4" 2>&1; grep -E '^FAIL' "$T/r4"; echo "r4_rpc: $(tail -1 "$T/r4")"; grep -q ' 0 failed$' "$T/r4" || RC=1
# rpc_moodboard_discovery: 5 checks fail on this small seed with the UNCHANGED worker too (51dc798, same seed, run 23-Nov-2026: no UI rows,
# design rows without MGD pages, core list now has get_font_pairing, create rate limit counts IP-less local calls); pass = no OTHER failure.
MB_KNOWN='^FAIL (search hint now mentions save_moodboard|page: links each item back to its MGD page|a UI screen_id is available|rate limit: create #7|core list = popular tools)'
python3 tests/rpc_moodboard_discovery.py --base "http://127.0.0.1:$PORT" > "$T/mb" 2>&1
NEW=$(grep '^FAIL' "$T/mb" | grep -Ev "$MB_KNOWN"); echo "rpc_moodboard_discovery: $(tail -1 "$T/mb") ($(grep -Ec "$MB_KNOWN" "$T/mb") known seed-only fails, same as the unchanged worker)"
[ -z "$NEW" ] || { echo "$NEW"; RC=1; }
[ $RC = 0 ] || tail -12 "$T/dev.log" | cut -c1-200
[ $RC = 0 ] && echo "app-boards local e2e: all checks passed" || echo "app-boards local e2e: FAILED"
exit $RC
