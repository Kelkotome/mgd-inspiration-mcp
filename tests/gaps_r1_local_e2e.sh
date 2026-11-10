#!/bin/bash
# mcp-gaps-r1 (10-Nov-2026): wrangler dev --local on a throwaway D1, then replay tests/gaps_r1_cases.json (get_font_pairing for the 10
# zero fonts + the 30 curated fonts + guards; make_star_map for Hamburg and 16 more cities + an unknown one) and check mcp_events
# logged every call with no zero flag on the font calls. Never touches live: no --remote, no routes.
# Usage: bash tests/gaps_r1_local_e2e.sh   (env GAPS_PORT / GAPS_INSP, default 8971 / 9371)
set -u
cd "$(dirname "$0")/.."; ROOT=$(pwd); W="${WRANGLER:-$ROOT/node_modules/.bin/wrangler}"; PORT=${GAPS_PORT:-8971}; INSP=${GAPS_INSP:-9371}
T=$(mktemp -d "${SCRATCH:-$ROOT}/gaps-e2e.XXXXXX"); CFG="$ROOT/wrangler.gaps.jsonc"
python3 - <<'PY'
src = open("wrangler.jsonc").read(); i = src.index('"routes"'); j = src.index("]", i) + 1
open("wrangler.gaps.jsonc", "w").write(src[:i] + '"routes": []' + src[j:])
PY
for p in $PORT $INSP; do lsof -ti tcp:$p -sTCP:LISTEN >/dev/null 2>&1 && { echo "refusing: port $p is in use by a process this script did not start"; rm -f "$CFG"; exit 2; }; done
stop_dev() { [ -n "${DEVPID:-}" ] && { pkill -P "$DEVPID" 2>/dev/null; kill "$DEVPID" 2>/dev/null; sleep 1; lsof -ti tcp:$PORT -ti tcp:$INSP -sTCP:LISTEN 2>/dev/null | xargs kill 2>/dev/null; DEVPID=; }; }
cleanup() { stop_dev; rm -f "$CFG"; rm -rf "$T"; }
trap cleanup EXIT
D1() { "$W" d1 execute mgd-inspiration --local -c "$CFG" --persist-to "$T/state" "$@"; }
D1 --file=./schema.sql >>"$T/setup.log" 2>&1 || { tail -5 "$T/setup.log"; exit 1; }
for f in migrate_category migrate_country migrate_featured migrate_rights migrate_srcurl migrate_annual migrate_mcp migrate_mcp_events migrate_mcp_events_err migrate_subscribers migrate_moodboards migrate_oauth migrate_boards_v2 migrate_boards_canvas migrate_feedidx migrate_ai_usage migrate_fts; do [ -f "$f.sql" ] && D1 --file=./$f.sql >>"$T/setup.log" 2>&1; done
"$W" dev --local -c "$CFG" --persist-to "$T/state" --port $PORT --inspector-port $INSP --var ADMIN_TOKEN:local-admin-test --show-interactive-dev-session=false > "$T/dev.log" 2>&1 &
DEVPID=$!; up=0; for i in $(seq 1 90); do curl -s -o /dev/null http://127.0.0.1:$PORT/inspiration/ui && { up=1; break; }; sleep 1; done
[ $up = 1 ] || { echo "dev server did not start"; tail -20 "$T/dev.log"; exit 1; }
q() { D1 --json --command "$1" 2>/dev/null | python3 -c "import json,sys; print(json.load(sys.stdin)[0]['results'][0]['n'])"; }
RC=0; N=$(python3 -c "import json; print(len(json.load(open('tests/gaps_r1_cases.json'))['cases']))")
python3 tests/gaps_r1_rpc.py http://127.0.0.1:$PORT/inspiration | tee "$T/r" | grep -E '^FAIL|-> ' ; tail -1 "$T/r"; grep -q ' 0 failed$' "$T/r" || RC=1
sleep 2
n=$(q "SELECT COUNT(*) n FROM mcp_events WHERE kind='call'"); [ "$n" = "$N" ] && echo "PASS mcp_events has every call: $n" || { echo "FAIL mcp_events calls: $n, want $N"; RC=1; }
n=$(q "SELECT COUNT(*) n FROM mcp_events WHERE kind='call' AND tool='get_font_pairing' AND zero=1"); [ "$n" = 1 ] && echo "PASS only the 'Play' guard call is a font zero" || { echo "FAIL font zero rows: $n, want 1 (Play)"; RC=1; }
n=$(q "SELECT COUNT(*) n FROM mcp_events WHERE kind='call' AND tool='make_star_map' AND ok=0"); [ "$n" = 1 ] && echo "PASS only Atlantis failed among star maps" || { echo "FAIL star map failures: $n, want 1"; RC=1; }
# the older star-map RPC suites, against the same local Worker (no baseline server: their baseline comparisons are skipped)
for t in rpc72 rpc75 rpc76; do python3 tests/$t.py --base http://127.0.0.1:$PORT > "$T/$t" 2>&1; r=$?; echo "$t: $(grep -v '^\s*$' "$T/$t" | tail -1)"; [ $r = 0 ] || { grep -E '^FAIL' "$T/$t" | head -5; RC=1; }; done
[ $RC = 0 ] && echo "mcp-gaps-r1 local e2e: all checks passed" || echo "mcp-gaps-r1 local e2e: FAILED"
exit $RC
