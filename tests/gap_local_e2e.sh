#!/bin/bash
# mcp-gap-r1 gap round, local-only end-to-end (8-Nov-2026; copied from comp_local_e2e.sh): wrangler dev --local on a throwaway D1 + R2, ingest the 896 gap rows
# (ui-screens/out-gap) plus a few existing screens from the main checkout's out/ (read only) to 127.0.0.1, then tests/gap_routes.mjs.
# Never touches live: no --remote, no routes, and the admin token is a dummy, so a wrong --base could not authenticate.
# Usage: bash tests/comp_local_e2e.sh   (env GAP_PORT / GAP_INSP pick the ports, default 8911 / 9311; GAP_KEEP=<file> keeps it up until deleted)
set -u
cd "$(dirname "$0")/.."; ROOT=$(pwd); W="${WRANGLER:-$ROOT/node_modules/.bin/wrangler}"; PORT=${GAP_PORT:-8917}; INSP=${GAP_INSP:-9317}
T=$(mktemp -d "${SCRATCH:-$ROOT}/gap-e2e.XXXXXX"); CFG="$ROOT/wrangler.gap.jsonc"; MAIN="$ROOT/../mgd-inspiration-ind3/ui-screens/out"
python3 - <<'PY'
src = open("wrangler.jsonc").read(); i = src.index('"routes"'); j = src.index("]", i) + 1
open("wrangler.gap.jsonc", "w").write(src[:i] + '"routes": []' + src[j:])
PY
for p in $PORT $INSP; do lsof -ti tcp:$p -sTCP:LISTEN >/dev/null 2>&1 && { echo "refusing: port $p is in use by a process this script did not start"; rm -f "$CFG"; exit 2; }; done
[ -e .admin_token ] && { echo "refusing: .admin_token exists here"; rm -f "$CFG"; exit 2; }; echo local-admin-test > .admin_token
cleanup() { [ -n "${DEVPID:-}" ] && { pkill -P "$DEVPID" 2>/dev/null; kill "$DEVPID" 2>/dev/null; sleep 1; lsof -ti tcp:$PORT -ti tcp:$INSP -sTCP:LISTEN 2>/dev/null | xargs kill 2>/dev/null; }; rm -f "$CFG" .admin_token; cp "$T/dev.log" "${SCRATCH:-$ROOT}/gap-last-dev.log" 2>/dev/null; rm -rf "$T"; }
trap cleanup EXIT
D1() { "$W" d1 execute mgd-inspiration --local -c "$CFG" --persist-to "$T/state" "$@" >>"$T/setup.log" 2>&1; }
D1 --file=./schema.sql || { tail -5 "$T/setup.log"; exit 1; }
D1 --command "ALTER TABLE items ADD COLUMN hue REAL" || true
for f in migrate_category migrate_country migrate_featured migrate_rights migrate_srcurl migrate_annual migrate_mcp migrate_mcp_events migrate_subscribers migrate_moodboards migrate_oauth migrate_boards_v2 migrate_boards_canvas migrate_feedidx migrate_ai_usage; do [ -f "$f.sql" ] && D1 --file=./$f.sql; done
"$W" dev --local -c "$CFG" --persist-to "$T/state" --port $PORT --inspector-port $INSP --var ADMIN_TOKEN:local-admin-test --var PUBLIC_ORIGIN:http://127.0.0.1:$PORT --show-interactive-dev-session=false > "$T/dev.log" 2>&1 &
DEVPID=$!
for i in $(seq 1 90); do curl -s -o /dev/null http://127.0.0.1:$PORT/inspiration/ui && break; sleep 1; done
curl -s -o /dev/null -w "worker %{http_code}\n" http://127.0.0.1:$PORT/inspiration/ui
RC=0; cd ui-screens
python3 ingest.py --base http://127.0.0.1:$PORT/inspiration --out out-gap --workers ${GAP_WORKERS:-3} | tail -1 || RC=1
for g in "music-player-*-minimal" "kanban-board-*-minimal" "confirm-dialog-*-minimal" "approval-queue-*-minimal"; do python3 ingest.py --base http://127.0.0.1:$PORT/inspiration --out "$MAIN" --only "$g" --workers 2 | tail -1; done   # existing rows, read only
cd ..
node tests/gap_routes.mjs http://127.0.0.1:$PORT/inspiration || RC=1
[ $RC = 0 ] || tail -12 "$T/dev.log" | cut -c1-200
while [ -n "${GAP_KEEP:-}" ] && [ -e "$GAP_KEEP" ]; do sleep 2; done
exit $RC
