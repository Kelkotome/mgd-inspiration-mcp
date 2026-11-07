#!/bin/bash
# Local-only end-to-end for the template tree, healthcare + real estate (7-Nov-2026): wrangler dev --local on a throwaway D1 + R2, ingest to 127.0.0.1 (flat homepage sets + out-hc), R2 zips
# into the throwaway bucket, then tests/hc_routes.py. Never touches live: no --remote, no routes, and the token is a dummy, so a wrong --base could not authenticate.
# Usage: bash tests/hc_local_e2e.sh   (env HC_KEEP=<file> keeps the server up until that file is deleted)
set -u
cd "$(dirname "$0")/.."; ROOT=$(pwd); W="$ROOT/node_modules/.bin/wrangler"; PORT=${HC_PORT:-8874}; INSP=${HC_INSP:-9274}; T=$(mktemp -d "${SCRATCH:-$ROOT}/ind2-e2e.XXXXXX"); CFG="$ROOT/wrangler.ind2.jsonc"; HCW="${HC_WORKTREE:-$ROOT/../mgd-inspiration-hc}"; MAIN="$ROOT/../mgd-inspiration/ui-screens/out"
python3 - <<'PY'
src = open("wrangler.jsonc").read(); i = src.index('"routes"'); j = src.index("]", i) + 1
open("wrangler.ind2.jsonc", "w").write(src[:i] + '"routes": []' + src[j:])
PY
for p in $PORT $INSP; do lsof -ti tcp:$p -sTCP:LISTEN >/dev/null 2>&1 && { echo "refusing: port $p is in use by a process this script did not start"; rm -f "$CFG"; exit 2; }; done
[ -e .admin_token ] && { echo "refusing: .admin_token exists here"; exit 2; }; echo local-admin-test > .admin_token
cleanup() { [ -n "${DEVPID:-}" ] && { pkill -P "$DEVPID" 2>/dev/null; kill "$DEVPID" 2>/dev/null; sleep 1; lsof -ti tcp:$PORT -ti tcp:$INSP -sTCP:LISTEN 2>/dev/null | xargs kill 2>/dev/null; }; rm -f "$CFG" .admin_token; rm -rf "$T"; }  # ports are killed only if this script started the Worker (it refused to start on a busy port)
trap cleanup EXIT
D1() { "$W" d1 execute mgd-inspiration --local -c "$CFG" --persist-to "$T/state" "$@" >>"$T/setup.log" 2>&1; }
D1 --file=./schema.sql || { tail -5 "$T/setup.log"; exit 1; }
D1 --command "ALTER TABLE items ADD COLUMN hue REAL" || true
for f in migrate_category migrate_country migrate_featured migrate_rights migrate_srcurl migrate_annual migrate_mcp migrate_mcp_events migrate_subscribers migrate_moodboards migrate_oauth migrate_boards_v2 migrate_boards_canvas migrate_feedidx migrate_ai_usage; do [ -f "$f.sql" ] && D1 --file=./$f.sql; done
# theme files into the throwaway bucket, before the Worker starts
BUCKET=mgd-inspiration-images
for R2DIR in ui-screens/out-wp/_r2 "$HCW/ui-screens/out-wp/_r2"; do LIM=${HC_R2_LIMIT:-42}; [ "$R2DIR" = ui-screens/out-wp/_r2 ] && LIM=100000   # every real estate file, a healthcare sample
if [ -d "$R2DIR/tpl" ]; then (cd "$R2DIR" && find tpl -type f) | head -$LIM | while read -r f; do case "$f" in *.zip) ct=application/zip;; *) ct=image/webp;; esac; "$W" r2 object put "$BUCKET/$f" --file "$R2DIR/$f" --content-type "$ct" --local -c "$CFG" --persist-to "$T/state" >>"$T/setup.log" 2>&1; done; fi; done
"$W" dev --local -c "$CFG" --persist-to "$T/state" --port $PORT --inspector-port $INSP --var ADMIN_TOKEN:local-admin-test --var PUBLIC_ORIGIN:http://127.0.0.1:$PORT --show-interactive-dev-session=false > "$T/dev.log" 2>&1 &
DEVPID=$!
for i in $(seq 1 90); do curl -s -o /dev/null http://127.0.0.1:$PORT/inspiration/ui && break; sleep 1; done
curl -s -o /dev/null -w "worker %{http_code}\n" http://127.0.0.1:$PORT/inspiration/ui
RC=0; cd ui-screens
python3 ingest.py --base http://127.0.0.1:$PORT/inspiration --out out-hc --workers 4 | tail -1 || RC=1
python3 ingest.py --base http://127.0.0.1:$PORT/inspiration --out "$HCW/ui-screens/out-hc" --workers 4 | tail -1 || RC=1   # healthcare rows, read only
# existing homepage sets, as they are live today, so old URLs and sibling cards have rows: skip with HC_SKIP_MAIN=1
for n in cardiology medical dental dermatology therapist physical-therapy veterinary pediatrics orthodontics fertility real-estate apartment; do [ -z "${HC_SKIP_MAIN:-}" ] && python3 ingest.py --base http://127.0.0.1:$PORT/inspiration --out "$MAIN" --only "$n-website-homepage-*" --workers 4 | tail -1; done
python3 ingest.py --base http://127.0.0.1:$PORT/inspiration --out "$MAIN" --only "chat-ai*-web-minimal*" --workers 2 | tail -1
cd ..
python3 tests/hc_routes.py http://127.0.0.1:$PORT/inspiration || RC=1
IND=real-estate python3 tests/hc_routes.py http://127.0.0.1:$PORT/inspiration || RC=1
node tests/hc_mcp.mjs http://127.0.0.1:$PORT/inspiration || RC=1
node tests/re_mcp.mjs http://127.0.0.1:$PORT/inspiration || RC=1
[ $RC = 0 ] || tail -12 "$T/dev.log" | cut -c1-200
while [ -n "${HC_KEEP:-}" ] && [ -e "$HC_KEEP" ]; do sleep 2; done
exit $RC
