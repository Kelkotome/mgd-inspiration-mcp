#!/bin/bash
# Local-only end-to-end for a template round: wrangler dev --local on a throwaway D1 + R2, ingest.py to 127.0.0.1, then check every new
# pattern page, item page, raw .html/.md and the "Build this with your AI" panel. Never touches live: no --remote, no routes, and the
# token is a dummy swapped in for ../.admin_token (so a wrong --base could not authenticate), restored on exit.
# Usage: bash tests/n13_local_e2e.sh pattern [pattern...]
set -u
cd "$(dirname "$0")/.."; ROOT=$(pwd); W="$ROOT/node_modules/.bin/wrangler"; PORT=8871; T=$(mktemp -d); CFG="$ROOT/wrangler.n13.jsonc"
python3 - <<'PY'
src = open("wrangler.jsonc").read(); i = src.index('"routes"'); j = src.index("]", i) + 1
open("wrangler.n13.jsonc", "w").write(src[:i] + '"routes": []' + src[j:])
PY
TOK_LINK=$(readlink .admin_token); rm -f .admin_token; echo local-admin-test > .admin_token
cleanup() { [ -n "${NP:-}" ] && kill $NP 2>/dev/null; pkill -f "inspector-port 9271" 2>/dev/null; rm -f "$CFG" .admin_token; ln -s "$TOK_LINK" .admin_token; rm -rf "$T"; }
trap cleanup EXIT
D1() { "$W" d1 execute mgd-inspiration --local -c "$CFG" --persist-to "$T/state" "$@" >>"$T/setup.log" 2>&1; }
D1 --file=./schema.sql || { tail -5 "$T/setup.log"; exit 1; }
D1 --command "ALTER TABLE items ADD COLUMN hue REAL" || true
for f in migrate_category migrate_country migrate_featured migrate_rights migrate_srcurl migrate_annual migrate_mcp migrate_mcp_events migrate_subscribers migrate_moodboards migrate_oauth migrate_boards_v2 migrate_boards_canvas migrate_feedidx migrate_ai_usage migrate_mcp_cap; do [ -f $f.sql ] && D1 --file=./$f.sql || true; done
"$W" dev --local -c "$CFG" --persist-to "$T/state" --port $PORT --inspector-port 9271 --var ADMIN_TOKEN:local-admin-test --var PUBLIC_ORIGIN:http://127.0.0.1:$PORT --show-interactive-dev-session=false > "$T/dev.log" 2>&1 & NP=$!
for i in $(seq 1 90); do curl -s -o /dev/null http://127.0.0.1:$PORT/inspiration/ui && break; sleep 1; done
curl -s -o /dev/null -w "worker %{http_code}\n" http://127.0.0.1:$PORT/inspiration/ui
RC=0
cd ui-screens
for p in "$@"; do
  python3 ingest.py --base http://127.0.0.1:$PORT/inspiration --only "$p-*" --workers 3 | tail -1 || RC=1
done
cd ..
python3 tests/n13_local_check.py http://127.0.0.1:$PORT/inspiration "$@" || RC=1
[ $RC = 0 ] || tail -20 "$T/dev.log" | cut -c1-200
exit $RC
