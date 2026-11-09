#!/bin/bash
# mcp-errors-r1 (9-Nov-2026): wrangler dev --local on a throwaway D1, then
#   1. WITHOUT migrate_mcp_events_err.sql: replay tests/mcp_errors_r1_cases.json, and check mcp_events still gets every call (old insert)
#   2. WITH the migration (fresh Worker process): replay again, and check failed calls carry err = "class: message"
# Never touches live: no --remote, no routes. Usage: bash tests/mcp_errors_local_e2e.sh  (env ERR_PORT / ERR_INSP, default 8961 / 9361)
set -u
cd "$(dirname "$0")/.."; ROOT=$(pwd); W="${WRANGLER:-$ROOT/node_modules/.bin/wrangler}"; PORT=${ERR_PORT:-8961}; INSP=${ERR_INSP:-9361}
T=$(mktemp -d "${SCRATCH:-$ROOT}/err-e2e.XXXXXX"); CFG="$ROOT/wrangler.err.jsonc"
python3 - <<'PY'
src = open("wrangler.jsonc").read(); i = src.index('"routes"'); j = src.index("]", i) + 1
open("wrangler.err.jsonc", "w").write(src[:i] + '"routes": []' + src[j:])
PY
for p in $PORT $INSP; do lsof -ti tcp:$p -sTCP:LISTEN >/dev/null 2>&1 && { echo "refusing: port $p is in use by a process this script did not start"; rm -f "$CFG"; exit 2; }; done
stop_dev() { [ -n "${DEVPID:-}" ] && { pkill -P "$DEVPID" 2>/dev/null; kill "$DEVPID" 2>/dev/null; sleep 1; lsof -ti tcp:$PORT -ti tcp:$INSP -sTCP:LISTEN 2>/dev/null | xargs kill 2>/dev/null; DEVPID=; }; }
cleanup() { stop_dev; rm -f "$CFG"; rm -rf "$T"; }
trap cleanup EXIT
D1() { "$W" d1 execute mgd-inspiration --local -c "$CFG" --persist-to "$T/state" "$@"; }
D1 --file=./schema.sql >>"$T/setup.log" 2>&1 || { tail -5 "$T/setup.log"; exit 1; }
for f in migrate_category migrate_country migrate_featured migrate_rights migrate_srcurl migrate_annual migrate_mcp migrate_mcp_events migrate_subscribers migrate_moodboards migrate_oauth migrate_boards_v2 migrate_boards_canvas migrate_feedidx migrate_ai_usage migrate_fts; do [ -f "$f.sql" ] && D1 --file=./$f.sql >>"$T/setup.log" 2>&1; done
D1 --command "INSERT INTO items (id,title,description,image_key,tags,themes,palette,style,status,created_at,collection,category) VALUES
 ('e1e1e1e1e1e1','Eco-friendly packaging','Recycled kraft packaging for a product launch.','items/e1.png','[\"eco\",\"packaging\",\"launch\"]','[]','[\"#2f4a3a\",\"#efede6\",\"#a9b39a\"]','packaging','published',1,'design','branding'),
 ('e2e2e2e2e2e2','Product launch poster','A bold poster for a product launch.','items/e2.png','[\"poster\",\"product\",\"launch\"]','[]','[\"#111111\",\"#f5f3ee\",\"#2855ff\"]','poster','published',2,'design','print')" >>"$T/setup.log" 2>&1 || { tail -5 "$T/setup.log"; exit 1; }
start_dev() {
  "$W" dev --local -c "$CFG" --persist-to "$T/state" --port $PORT --inspector-port $INSP --var ADMIN_TOKEN:local-admin-test --show-interactive-dev-session=false > "$T/dev.log" 2>&1 &
  DEVPID=$!; for i in $(seq 1 90); do curl -s -o /dev/null http://127.0.0.1:$PORT/inspiration/ui && return 0; sleep 1; done; echo "dev server did not start"; tail -20 "$T/dev.log"; return 1
}
q() { D1 --json --command "$1" 2>/dev/null | python3 -c "import json,sys; print(json.load(sys.stdin)[0]['results'][0]['n'])"; }
RC=0; N=$(python3 -c "import json; print(len(json.load(open('tests/mcp_errors_r1_cases.json'))['cases']))")
echo "-- 1/2 before migrate_mcp_events_err.sql"
start_dev || exit 1
python3 tests/mcp_errors_r1_rpc.py http://127.0.0.1:$PORT/inspiration | tail -1 | tee "$T/r1" ; grep -q ' 0 failed$' "$T/r1" || RC=1
n=$(q "SELECT COUNT(*) n FROM mcp_events WHERE kind='call'"); [ "$n" = "$N" ] && echo "PASS mcp_events rows without the err column: $n" || { echo "FAIL mcp_events rows: $n, want $N"; RC=1; }
stop_dev
echo "-- 2/2 after migrate_mcp_events_err.sql"
D1 --file=./migrate_mcp_events_err.sql >>"$T/setup.log" 2>&1 || { echo "FAIL migration"; RC=1; }
start_dev || exit 1
python3 tests/mcp_errors_r1_rpc.py http://127.0.0.1:$PORT/inspiration | tail -1 | tee "$T/r2"; grep -q ' 0 failed$' "$T/r2" || RC=1
E=$(python3 -c "import json; print(sum(1 for c in json.load(open('tests/mcp_errors_r1_cases.json'))['cases'] if c.get('err')))")
n=$(q "SELECT COUNT(*) n FROM mcp_events WHERE kind='call' AND ok=0 AND err LIKE '%: %' AND created_at > (SELECT MAX(created_at) FROM mcp_events) - 600000 AND rowid > $N")
[ "$n" = "$E" ] && echo "PASS failed calls carry err: $n" || { echo "FAIL failed calls with err: $n, want $E"; RC=1; }
n=$(q "SELECT COUNT(*) n FROM mcp_events WHERE kind='call' AND ok=1 AND err IS NOT NULL"); [ "$n" = 0 ] && echo "PASS no err on successful calls" || { echo "FAIL err on $n successful calls"; RC=1; }
n=$(q "SELECT COUNT(*) n FROM mcp_events WHERE tool='make_word_search' AND err LIKE 'bad\_args: %' ESCAPE '\\'"); [ "$n" -ge 1 ] && echo "PASS unknown-argument call classed bad_args" || { echo "FAIL bad_args class"; RC=1; }
n=$(q "SELECT COUNT(*) n FROM mcp_calls WHERE tool='get_banner_spec' AND query LIKE '{%width%'"); [ "$n" -ge 1 ] && echo "PASS arguments logged as JSON when no query key" || { echo "FAIL args JSON in mcp_calls"; RC=1; }
n=$(q "SELECT COUNT(*) n FROM mcp_events WHERE tool='design_md_from_references' AND zero=1 AND ok=1"); [ "$n" -ge 1 ] && echo "PASS design_md zero is a zero, not an error" || { echo "FAIL design_md zero"; RC=1; }
[ $RC = 0 ] && echo "mcp-errors local e2e: all checks passed" || echo "mcp-errors local e2e: FAILED"
exit $RC
