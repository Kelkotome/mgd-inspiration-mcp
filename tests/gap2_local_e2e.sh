#!/bin/bash
# mcp-gap-r2 (9-Nov-2026; copied from gap_local_e2e.sh): wrangler dev --local on a throwaway D1 + R2, ingest the r2 gap rows
# (ui-screens/out-gap2), seed 6 design rows (with the FTS index, as live) plus a few existing screens from the main checkout's out/ (read only) to 127.0.0.1, then tests/gap2_routes.mjs.
# Never touches live: no --remote, no routes, and the admin token is a dummy, so a wrong --base could not authenticate.
# Usage: bash tests/gap2_local_e2e.sh   (env GAP_PORT / GAP_INSP pick the ports, default 8927 / 9327; GAP_KEEP=<file> keeps it up until deleted)
set -u
cd "$(dirname "$0")/.."; ROOT=$(pwd); W="${WRANGLER:-$ROOT/node_modules/.bin/wrangler}"; PORT=${GAP_PORT:-8927}; INSP=${GAP_INSP:-9327}
T=$(mktemp -d "${SCRATCH:-$ROOT}/gap2-e2e.XXXXXX"); CFG="$ROOT/wrangler.gap2.jsonc"; MAIN="$ROOT/../mgd-inspiration/ui-screens/out"; GAP1="$ROOT/../mgd-inspiration-gap/ui-screens/out-gap"
python3 - <<'PY'
src = open("wrangler.jsonc").read(); i = src.index('"routes"'); j = src.index("]", i) + 1
open("wrangler.gap2.jsonc", "w").write(src[:i] + '"routes": []' + src[j:])
PY
for p in $PORT $INSP; do lsof -ti tcp:$p -sTCP:LISTEN >/dev/null 2>&1 && { echo "refusing: port $p is in use by a process this script did not start"; rm -f "$CFG"; exit 2; }; done
[ -e .admin_token ] && { echo "refusing: .admin_token exists here"; rm -f "$CFG"; exit 2; }; echo local-admin-test > .admin_token
cleanup() { [ -n "${DEVPID:-}" ] && { pkill -P "$DEVPID" 2>/dev/null; kill "$DEVPID" 2>/dev/null; sleep 1; lsof -ti tcp:$PORT -ti tcp:$INSP -sTCP:LISTEN 2>/dev/null | xargs kill 2>/dev/null; }; rm -f "$CFG" .admin_token; cp "$T/dev.log" "${SCRATCH:-$ROOT}/gap2-last-dev.log" 2>/dev/null; rm -rf "$T"; }
trap cleanup EXIT
D1() { "$W" d1 execute mgd-inspiration --local -c "$CFG" --persist-to "$T/state" "$@" >>"$T/setup.log" 2>&1; }
D1 --file=./schema.sql || { tail -5 "$T/setup.log"; exit 1; }
D1 --command "ALTER TABLE items ADD COLUMN hue REAL" || true
for f in migrate_category migrate_country migrate_featured migrate_rights migrate_srcurl migrate_annual migrate_mcp migrate_mcp_events migrate_subscribers migrate_moodboards migrate_oauth migrate_boards_v2 migrate_boards_canvas migrate_feedidx migrate_ai_usage; do [ -f "$f.sql" ] && D1 --file=./$f.sql; done
# FTS index (live since 5-Nov) + design / annual rows for the generic-word, museum-hint and annual-zero checks
D1 --file=./migrate_fts.sql || true
D1 --command "INSERT INTO items (id,title,description,image_key,tags,themes,palette,style,status,created_at,collection,category) VALUES
 ('g2d1','Jazz night poster','A jazz club poster with bold type.','items/g2d1.png','[\"poster\",\"jazz\",\"typography\"]','[]','[\"#111111\",\"#eeeeee\"]','poster','published',1,'design','print'),
 ('g2d2','Modern minimal brand identity','A modern minimal identity system.','items/g2d2.png','[\"modern\",\"minimal\",\"branding\"]','[\"minimal\"]','[\"#222222\",\"#fafafa\"]','branding','published',2,'design','branding'),
 ('g2d3','Clean modern minimal app kit','A clean modern minimal app interface kit.','items/g2d3.png','[\"modern\",\"minimal\",\"clean\",\"app\"]','[\"minimal\"]','[\"#333333\",\"#f5f5f5\"]','interface','published',3,'design','interface'),
 ('g2d4','Summer jazz festival poster','A festival poster with saxophone shapes.','items/g2d4.png','[\"poster\",\"jazz\",\"festival\"]','[]','[\"#aa3311\",\"#ffeecc\"]','poster','published',4,'design','print'),
 ('g2d5','Modern minimal poster grid','A modern minimal grid poster.','items/g2d5.png','[\"poster\",\"modern\",\"minimal\"]','[\"minimal\"]','[\"#000000\",\"#ffffff\"]','poster','published',5,'design','print'),
 ('g2d6','Minimal modern clean landing page','A clean minimal modern landing page.','items/g2d6.png','[\"modern\",\"minimal\",\"clean\",\"website\"]','[\"minimal\"]','[\"#444444\",\"#ffffff\"]','interface','published',6,'design','interface')" || { tail -5 "$T/setup.log"; exit 1; }
"$W" dev --local -c "$CFG" --persist-to "$T/state" --port $PORT --inspector-port $INSP --var ADMIN_TOKEN:local-admin-test --var PUBLIC_ORIGIN:http://127.0.0.1:$PORT --show-interactive-dev-session=false > "$T/dev.log" 2>&1 &
DEVPID=$!
for i in $(seq 1 90); do curl -s -o /dev/null http://127.0.0.1:$PORT/inspiration/ui && break; sleep 1; done
curl -s -o /dev/null -w "worker %{http_code}\n" http://127.0.0.1:$PORT/inspiration/ui
RC=0; cd ui-screens
python3 ingest.py --base http://127.0.0.1:$PORT/inspiration --out out-gap2 --workers ${GAP_WORKERS:-3} | tail -1 || RC=1
# existing rows the synonym / neighbour checks need (read only from other worktrees' out folders)
for g in "empty-state-*-minimal" "invoice-*-minimal" "navigation-header-*-minimal" "confirm-dialog-*-minimal" "paywall-upgrade-*-minimal" "billing-plans-*-minimal" "data-table-*-minimal"; do python3 ingest.py --base http://127.0.0.1:$PORT/inspiration --out "$MAIN" --only "$g" --workers 2 | tail -1; done
for g in "delete-confirm-*-minimal" "subscription-billing-*-minimal"; do python3 ingest.py --base http://127.0.0.1:$PORT/inspiration --out "$GAP1" --only "$g" --workers 2 | tail -1; done
cd ..
node tests/gap2_routes.mjs http://127.0.0.1:$PORT/inspiration || RC=1
[ $RC = 0 ] || tail -12 "$T/dev.log" | cut -c1-200
while [ -n "${GAP_KEEP:-}" ] && [ -e "$GAP_KEEP" ]; do sleep 2; done
exit $RC
