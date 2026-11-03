#!/usr/bin/env bash
# Non-commercial LINK-ONLY annual reports (BSB/ÖNB, 3-Nov-2026): prove they never reach the website and are MCP opt-in only.
# Local only: throwaway D1 under a temp --persist-to dir, local `wrangler dev`; never touches remote D1, never deploys.
# Runs twice: (A) with migrate_rights.sql applied, (B) WITHOUT it (old schema = Worker deployed before the migration) to
# prove the code does not crash before the migration. Exit non-zero on any failure.
set -u
cd "$(dirname "$0")/.."
W=./node_modules/.bin/wrangler
PORT=${NC_PORT:-8911}; IPORT=${NC_IPORT:-9411}
CFG=.wrangler.nc-test.jsonc
python3 - "$CFG" <<'PY'
import sys
src = open("wrangler.jsonc").read()
i = src.index('"routes"'); j = src.index("]", i) + 1
open(sys.argv[1], "w").write(src[:i] + '"routes": []' + src[j:])
PY
RC=0; PID=
cleanup() { [ -n "$PID" ] && kill "$PID" 2>/dev/null; wait "$PID" 2>/dev/null; rm -f "$CFG"; [ -n "${TMP:-}" ] && rm -rf "$TMP"; }
trap cleanup EXIT
run_case() {  # $1 = with|without (migrate_rights.sql)
  local MODE=$1
  TMP=$(mktemp -d); local D1="$W d1 execute mgd-inspiration --local --persist-to $TMP -c $CFG"
  $D1 --file=./schema.sql >/dev/null 2>&1 || { echo "schema.sql failed"; return 1; }
  for f in migrate_mcp.sql migrate_subscribers.sql migrate_oauth.sql migrate_boards_v2.sql migrate_boards_canvas.sql migrate_mcp_events.sql migrate_moodboards.sql migrate_ai_usage.sql; do
    [ -f $f ] && $D1 --file=./$f >/dev/null 2>&1; done
  $D1 --command "ALTER TABLE items ADD COLUMN hue REAL" >/dev/null 2>&1
  $D1 --command "ALTER TABLE items ADD COLUMN featured_rank INTEGER" >/dev/null 2>&1
  if [ "$MODE" = with ]; then
    $D1 --file=./migrate_rights.sql >/dev/null 2>&1   # schema.sql may already carry the columns (fresh DB) — ignore duplicate-column errors
    $D1 --command "SELECT rights,rights_holder,hosting,image_url FROM items LIMIT 1" >/dev/null 2>&1 || { echo "FAIL rights columns missing"; return 1; }
  else
    # old schema: drop the new columns that schema.sql now declares
    for c in image_url hosting rights_holder rights; do $D1 --command "ALTER TABLE items DROP COLUMN $c" >/dev/null 2>&1; done
    $D1 --command "SELECT hosting FROM items LIMIT 1" >/dev/null 2>&1 && { echo "FAIL could not build old-schema DB"; return 1; }
  fi
  local COLS="id,title,description,source_url,source_host,image_key,tags,themes,palette,status,created_at,collection,company,report_year,designer,industry,country,owner_id"
  $D1 --command "INSERT INTO items ($COLS) VALUES
   ('aaaaaaaaaaa2','Pdtestco Railway 1888','Serif title cover.','https://archive.org/details/pdtest','archive.org','annual/aaaaaaaaaaa2.jpg','[\"serif\",\"zzcommon\"]','[\"vintage\"]','[\"#112233\"]','published',1700000001000,'annual-report','Pdtestco Railway',1888,'','transport & transit','Germany',NULL),
   ('cccccccccc01','Nctestbank Hypotheken 1899','Blackletter title cover.','https://www.digitale-sammlungen.de/view/bsb11111111','digitale-sammlungen.de','link/cccccccccc01','[\"blackletter\",\"zzcommon\"]','[\"vintage\"]','[\"#aa0000\"]','mcp-nc',1700000002000,'annual-report','Nctestbank Hypotheken',1899,'','banking & finance','Germany',NULL),
   ('cccccccccc02','Ncstagedwerke 1905','Staged cover.','https://onb.digital/result/ABO_TEST','onb.ac.at','link/cccccccccc02','[\"zzcommon\"]','[\"vintage\"]','[\"#00aa00\"]','staged-nc',1700000003000,'annual-report','Ncstagedwerke',1905,'','manufacturing','Austria',NULL),
   ('dddddddddd01','Optestlanz AG 1927','Framed serif cover.','https://www.deutsche-digitale-bibliothek.de/item/OPENTEST','deutsche-digitale-bibliothek.de','annual/dddddddddd01.jpg','[\"serif\",\"zzcommon\"]','[\"vintage\"]','[\"#c8a070\"]','$( [ $MODE = with ] && echo published || echo staged-open )',1700000004000,'annual-report','Optestlanz AG',1927,'','machinery','Germany',NULL)" >/dev/null || { echo "seed failed"; return 1; }
  if [ "$MODE" = with ]; then
    $D1 --command "UPDATE items SET rights='NoC-NC 1.0 (No Copyright – Non-Commercial Use Only)', rights_holder='Bayerische Staatsbibliothek', hosting='link', image_url='https://api.digitale-sammlungen.de/iiif/image/v2/bsb11111111_00005/full/full/0/default.jpg' WHERE id='cccccccccc01';
      UPDATE items SET rights='NoC-NC 1.0 (No Copyright – Non-Commercial Use Only)', rights_holder='Österreichische Nationalbibliothek', hosting='link', image_url='https://iiif.onb.ac.at/images/ABO/TEST/full/full/0/default.jpg' WHERE id='cccccccccc02';
      UPDATE items SET rights='CC BY 3.0 DE', rights_holder='MARCHIVUM Mannheim' WHERE id='dddddddddd01';" >/dev/null || return 1
  fi
  local LOG=$TMP/dev.log
  $W dev --local --persist-to $TMP -c $CFG --port $PORT --inspector-port $IPORT --show-interactive-dev-session=false > $LOG 2>&1 & PID=$!
  local up=0; for i in $(seq 1 60); do curl -s -o /dev/null "http://127.0.0.1:$PORT/inspiration/api/feed" && { up=1; break; }; sleep 1; done
  [ $up = 1 ] || { echo "dev server failed"; tail -20 $LOG; return 1; }
  python3 tests/test_nc_exclusion.py --base "http://127.0.0.1:$PORT" --mode $MODE; local r=$?
  kill $PID 2>/dev/null; wait $PID 2>/dev/null; PID=
  rm -rf "$TMP"; TMP=
  return $r
}
echo "== case A: migration applied"; run_case with || RC=1
echo "== case B: old schema (Worker deployed before migrate_rights.sql)"; run_case without || RC=1
[ $RC = 0 ] && echo "NC EXCLUSION: ALL PASSED" || echo "NC EXCLUSION: FAILED"
exit $RC
