#!/bin/bash
# typo-b1 (25-Nov-2026): wrangler dev --local on a throwaway D1 (copy of tests/mcp_errors_local_e2e.sh setup), then replay
#   tests/typo_b1_cases.json (B1 font guides, script wording, style variants, argument aliases) over JSON-RPC.
# Never touches live: no --remote, no routes. Usage: bash tests/typo_b1_local_e2e.sh  (env TB1_PORT / TB1_INSP, default 8971 / 9371; WRANGLER=path if no node_modules)
set -u
cd "$(dirname "$0")/.."; ROOT=$(pwd); W="${WRANGLER:-$ROOT/node_modules/.bin/wrangler}"; PORT=${TB1_PORT:-8971}; INSP=${TB1_INSP:-9371}
T=$(mktemp -d "${SCRATCH:-$ROOT}/tb1-e2e.XXXXXX"); CFG="$ROOT/wrangler.tb1.jsonc"
python3 - <<'PY'
src = open("wrangler.jsonc").read(); i = src.index('"routes"'); j = src.index("]", i) + 1
open("wrangler.tb1.jsonc", "w").write(src[:i] + '"routes": []' + src[j:])
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
RC=0
start_dev || exit 1
python3 tests/typo_b1_rpc.py http://127.0.0.1:$PORT/inspiration | tee "$T/r1" | grep -v '^PASS'; grep -q ' 0 failed$' "$T/r1" || RC=1
[ $RC = 0 ] && echo "typo-b1 local e2e: all checks passed" || echo "typo-b1 local e2e: FAILED"
exit $RC
