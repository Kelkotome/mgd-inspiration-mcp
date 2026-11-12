#!/bin/bash
# MCP r3 (12-Nov-2026): wrangler dev --local on a throwaway D1 + R2 (the real workerd runtime: Cache API, ctx.waitUntil, version_metadata),
# ingest the 128 dating screens (ui-screens/out-gaps2), then:
#   1. tests/mcp_r3_rpc.py --local: tools/list 112 / size / instructions, star-map cities, design_md errors, same answer twice for every cached tool
#   2. mcp_events and mcp_calls got every call although they are now written after the answer (ctx.waitUntil); no failed call has an empty err
#   3. the r2 replay (tests/gaps_r2_rpc.py) and the r1 replay (tests/gaps_r1_rpc.py) still pass
# Never touches live: no --remote, no routes, and the admin token is a dummy.
# Usage: bash tests/r3_local_e2e.sh   (env R3_PORT / R3_INSP, default 8991 / 9391; SCRATCH=<dir> for temp files)
set -u
cd "$(dirname "$0")/.."; ROOT=$(pwd); W="${WRANGLER:-$ROOT/node_modules/.bin/wrangler}"; PORT=${R3_PORT:-8991}; INSP=${R3_INSP:-9391}
T=$(mktemp -d "${SCRATCH:-$ROOT}/r3-e2e.XXXXXX"); CFG="$ROOT/wrangler.r3.jsonc"; MAIN="$ROOT/../mgd-inspiration/ui-screens/out"
[ -d ui-screens/out-gaps2 ] && [ "$(ls -d ui-screens/out-gaps2/*/ | wc -l | tr -d ' ')" = 128 ] || { echo "ui-screens/out-gaps2 must hold the 128 screens (cd ui-screens && GEN_OUT=out-gaps2 node gen.js --only dating-swipe,dating-profile,dating-chat,dating-onboarding && SHOOT_OUT=out-gaps2 ./shoot.sh 'dating-*')"; exit 2; }
python3 - <<'PY'
src = open("wrangler.jsonc").read(); i = src.index('"routes"'); j = src.index("]", i) + 1
open("wrangler.r3.jsonc", "w").write(src[:i] + '"routes": []' + src[j:])
PY
for p in $PORT $INSP; do lsof -ti tcp:$p -sTCP:LISTEN >/dev/null 2>&1 && { echo "refusing: port $p is in use by a process this script did not start"; rm -f "$CFG"; exit 2; }; done
[ -e .admin_token ] && { echo "refusing: .admin_token exists here"; rm -f "$CFG"; exit 2; }; echo local-admin-test > .admin_token
cleanup() { [ -n "${DEVPID:-}" ] && { pkill -P "$DEVPID" 2>/dev/null; kill "$DEVPID" 2>/dev/null; sleep 1; lsof -ti tcp:$PORT -ti tcp:$INSP -sTCP:LISTEN 2>/dev/null | xargs kill 2>/dev/null; }; rm -f "$CFG" .admin_token; cp "$T/dev.log" "${SCRATCH:-$ROOT}/r3-last-dev.log" 2>/dev/null; rm -rf "$T"; }
trap cleanup EXIT
D1() { "$W" d1 execute mgd-inspiration --local -c "$CFG" --persist-to "$T/state" "$@"; }
D1 --file=./schema.sql >>"$T/setup.log" 2>&1 || { tail -5 "$T/setup.log"; exit 1; }
D1 --command "ALTER TABLE items ADD COLUMN hue REAL" >>"$T/setup.log" 2>&1 || true
for f in migrate_category migrate_country migrate_featured migrate_rights migrate_srcurl migrate_annual migrate_mcp migrate_mcp_events migrate_mcp_events_err migrate_subscribers migrate_moodboards migrate_oauth migrate_boards_v2 migrate_boards_canvas migrate_feedidx migrate_ai_usage migrate_fts; do [ -f "$f.sql" ] && D1 --file=./$f.sql >>"$T/setup.log" 2>&1; done
"$W" dev --local -c "$CFG" --persist-to "$T/state" --port $PORT --inspector-port $INSP --var ADMIN_TOKEN:local-admin-test --var PUBLIC_ORIGIN:http://127.0.0.1:$PORT --show-interactive-dev-session=false > "$T/dev.log" 2>&1 &
DEVPID=$!; up=0; for i in $(seq 1 90); do curl -s -o /dev/null http://127.0.0.1:$PORT/inspiration/ui && { up=1; break; }; sleep 1; done
[ $up = 1 ] || { echo "dev server did not start"; tail -20 "$T/dev.log"; exit 1; }
q() { D1 --json --command "$1" 2>/dev/null | python3 -c "import json,sys; print(json.load(sys.stdin)[0]['results'][0]['n'])"; }
RC=0; cd ui-screens
r=$(python3 ingest.py --base http://127.0.0.1:$PORT/inspiration --out out-gaps2 --workers ${GAPS2_WORKERS:-3} | tail -1); echo "ingest dating: $r"; [ "$r" = "done: {'added': 128}" ] || RC=1
cd ..
D1 --command "DELETE FROM mcp_events" >>"$T/setup.log" 2>&1
python3 tests/mcp_r3_rpc.py http://127.0.0.1:$PORT/inspiration --local | tee "$T/r3" | grep -E '^FAIL|-> '; echo "mcp_r3_rpc: $(tail -1 "$T/r3")"; grep -q ' 0 failed$' "$T/r3" || RC=1
N=$(grep -oE '^calls: [0-9]+' "$T/r3" | grep -oE '[0-9]+'); sleep 2
n=$(q "SELECT COUNT(*) n FROM mcp_events WHERE kind='call'"); [ "$n" = "$N" ] && echo "PASS mcp_events has every call (written after the answer): $n" || { echo "FAIL mcp_events calls: $n, want $N"; RC=1; }
n=$(q "SELECT COUNT(*) n FROM mcp_calls"); [ "$n" -ge 1 ] && echo "PASS mcp_calls rows written after the answer: $n" || { echo "FAIL mcp_calls rows: $n"; RC=1; }
n=$(q "SELECT COUNT(*) n FROM mcp_events WHERE kind='call' AND ok=0 AND (err IS NULL OR TRIM(err)='' OR err NOT LIKE '%: %')"); [ "$n" = 0 ] && echo "PASS every failed call has 'class: message' in mcp_events.err" || { echo "FAIL failed calls without an err: $n"; RC=1; }
python3 tests/gaps_r2_rpc.py http://127.0.0.1:$PORT/inspiration > "$T/r2" 2>&1; grep -E '^FAIL' "$T/r2" | head -5; echo "gaps_r2_rpc (round 2 replay): $(tail -1 "$T/r2")"; grep -q ' 0 failed$' "$T/r2" || RC=1
python3 tests/gaps_r1_rpc.py http://127.0.0.1:$PORT/inspiration > "$T/r1" 2>&1; grep -E '^FAIL' "$T/r1" | head -5; echo "gaps_r1_rpc (round 1 replay): $(tail -1 "$T/r1")"; grep -q ' 0 failed$' "$T/r1" || RC=1
[ $RC = 0 ] || tail -12 "$T/dev.log" | cut -c1-200
[ $RC = 0 ] && echo "mcp-r3 local e2e: all checks passed" || echo "mcp-r3 local e2e: FAILED"
exit $RC
