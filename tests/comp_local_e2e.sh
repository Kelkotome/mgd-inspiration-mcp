#!/bin/bash
# UI components round 1, local-only end-to-end (7-Nov-2026): wrangler dev --local on a throwaway D1 + R2, ingest the 208 component rows
# (ui-screens/out-comp) plus a few existing screens from the main checkout's out/ (read only) to 127.0.0.1, then tests/comp_routes.mjs.
# Never touches live: no --remote, no routes, and the admin token is a dummy, so a wrong --base could not authenticate.
# Usage: bash tests/comp_local_e2e.sh   (env COMP_PORT / COMP_INSP pick the ports, default 8911 / 9311; COMP_KEEP=<file> keeps it up until deleted)
set -u
cd "$(dirname "$0")/.."; ROOT=$(pwd); W="$ROOT/node_modules/.bin/wrangler"; PORT=${COMP_PORT:-8911}; INSP=${COMP_INSP:-9311}
T=$(mktemp -d "${SCRATCH:-$ROOT}/comp-e2e.XXXXXX"); CFG="$ROOT/wrangler.comp.jsonc"; MAIN="$ROOT/../mgd-inspiration/ui-screens/out"
python3 - <<'PY'
src = open("wrangler.jsonc").read(); i = src.index('"routes"'); j = src.index("]", i) + 1
open("wrangler.comp.jsonc", "w").write(src[:i] + '"routes": []' + src[j:])
PY
for p in $PORT $INSP; do lsof -ti tcp:$p -sTCP:LISTEN >/dev/null 2>&1 && { echo "refusing: port $p is in use by a process this script did not start"; rm -f "$CFG"; exit 2; }; done
[ -e .admin_token ] && { echo "refusing: .admin_token exists here"; rm -f "$CFG"; exit 2; }; echo local-admin-test > .admin_token
cleanup() { [ -n "${DEVPID:-}" ] && { pkill -P "$DEVPID" 2>/dev/null; kill "$DEVPID" 2>/dev/null; sleep 1; lsof -ti tcp:$PORT -ti tcp:$INSP -sTCP:LISTEN 2>/dev/null | xargs kill 2>/dev/null; }; rm -f "$CFG" .admin_token; cp "$T/dev.log" "${SCRATCH:-$ROOT}/comp-last-dev.log" 2>/dev/null; rm -rf "$T"; }
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
python3 ingest.py --base http://127.0.0.1:$PORT/inspiration --out out-comp --workers ${COMP_WORKERS:-2} | tail -1 || RC=1
for g in "faq-*-minimal" "settings-*-minimal" "chat-ai*-web-minimal*"; do python3 ingest.py --base http://127.0.0.1:$PORT/inspiration --out "$MAIN" --only "$g" --workers 2 | tail -1; done   # existing rows, read only
cd ..
node tests/comp_routes.mjs http://127.0.0.1:$PORT/inspiration || RC=1
[ $RC = 0 ] || tail -12 "$T/dev.log" | cut -c1-200
while [ -n "${COMP_KEEP:-}" ] && [ -e "$COMP_KEEP" ]; do sleep 2; done
exit $RC
