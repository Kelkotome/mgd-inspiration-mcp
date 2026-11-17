#!/bin/bash
# MCP r4 (13-Nov-2026): the real workerd runtime (wrangler dev --local, throwaway D1 + R2, no routes, nothing remote) on a few seeded
# museum + annual-report rows:
#   1. deploy-bundle-2026-11-09/r4-indexes.sql applied ONE statement per --command (as run_r4.sh does on live), the indexes listed,
#      the rollback SQL drops them all, re-applied
#   2. tests/r4_rpc.py --local: tools/list 112, Noto pairings, get_ui_flow fallback/errors, mixed-word search, facet pages 200 twice +
#      404s (served with the r4 indexes in place)
#   3. facet pages are the same before and after the indexes (Cache API bypassed with a query string the route ignores)
# Usage: bash tests/r4_local_e2e.sh   (env R4_PORT / R4_INSP, default 8973 / 9373; SCRATCH=<dir> for temp files)
set -u
cd "$(dirname "$0")/.."; ROOT=$(pwd); W="${WRANGLER:-$ROOT/node_modules/.bin/wrangler}"; PORT=${R4_PORT:-8973}; INSP=${R4_INSP:-9373}
T=$(mktemp -d "${SCRATCH:-$ROOT}/r4-e2e.XXXXXX"); CFG="$ROOT/wrangler.r4.jsonc"
python3 - <<'PY'
src = open("wrangler.jsonc").read(); i = src.index('"routes"'); j = src.index("]", i) + 1
open("wrangler.r4.jsonc", "w").write(src[:i] + '"routes": []' + src[j:])
PY
for p in $PORT $INSP; do lsof -ti tcp:$p -sTCP:LISTEN >/dev/null 2>&1 && { echo "refusing: port $p is in use by a process this script did not start"; rm -f "$CFG"; exit 2; }; done
cleanup() { [ -n "${DEVPID:-}" ] && { pkill -P "$DEVPID" 2>/dev/null; kill "$DEVPID" 2>/dev/null; sleep 1; lsof -ti tcp:$PORT -ti tcp:$INSP -sTCP:LISTEN 2>/dev/null | xargs kill 2>/dev/null; }; rm -f "$CFG"; cp "$T/dev.log" "${SCRATCH:-$ROOT}/r4-last-dev.log" 2>/dev/null; rm -rf "$T"; }
trap cleanup EXIT
D1() { "$W" d1 execute mgd-inspiration --local -c "$CFG" --persist-to "$T/state" "$@"; }
D1 --file=./schema.sql >>"$T/setup.log" 2>&1 || { tail -5 "$T/setup.log"; exit 1; }
D1 --command "ALTER TABLE items ADD COLUMN hue REAL" >>"$T/setup.log" 2>&1 || true
for f in migrate_category migrate_country migrate_featured migrate_rights migrate_srcurl migrate_annual migrate_mcp migrate_mcp_events migrate_mcp_events_err migrate_subscribers migrate_moodboards migrate_oauth migrate_boards_v2 migrate_boards_canvas migrate_feedidx migrate_ai_usage migrate_fts; do [ -f "$f.sql" ] && D1 --file=./$f.sql >>"$T/setup.log" 2>&1; done
D1 --command "INSERT INTO items (id,title,description,source_url,source_host,image_key,tags,themes,palette,status,created_at,collection,company,report_year,designer,industry,country,category,width,height,owner_id) VALUES
 ('aaaaaaaaaaa1','Federal Reserve Bank of Dallas 1926 Report to Stockholders','Annual report cover.','https://archive.org/details/x1','archive.org','annual/aaaaaaaaaaa1.jpg','[]','[]','[]','published',1700000001000,'annual-report','Federal Reserve Bank of Dallas',1926,NULL,'banking','United States',NULL,600,900,NULL),
 ('aaaaaaaaaaa2','Acme Transit 1972','Swiss grid cover.','https://archive.org/details/x2','archive.org','annual/aaaaaaaaaaa2.jpg','[]','[]','[]','published',1700000002000,'annual-report','Acme Transit',1972,'Paul Rand','transit','United States',NULL,640,880,NULL),
 ('bbbbbbbbbbb1','Vase with Lid','A covered vase.','https://museum.example/1','museum.example','museum/bbbbbbbbbbb1.jpg','[]','[]','[\"#112233\"]','published',1700000003000,'museum','The Metropolitan Museum of Art',1720,'Jan Brueghel the Elder','Vase','Greek','ceramics',1200,1500,NULL),
 ('bbbbbbbbbbb2','Second Vase','Another vase.','https://museum.example/2','museum.example','museum/bbbbbbbbbbb2.jpg','[]','[]','[]','published',1700000004000,'museum','The Metropolitan Museum of Art',1730,'Jan Brueghel the Elder','Vase','greek','ceramics',1000,800,NULL)" >>"$T/setup.log" 2>&1 || { echo "seed failed"; tail -5 "$T/setup.log"; exit 1; }
"$W" dev --local -c "$CFG" --persist-to "$T/state" --port $PORT --inspector-port $INSP --show-interactive-dev-session=false > "$T/dev.log" 2>&1 &
DEVPID=$!; up=0; for i in $(seq 1 90); do curl -s -o /dev/null http://127.0.0.1:$PORT/inspiration/museum && { up=1; break; }; sleep 1; done
[ $up = 1 ] || { echo "dev server did not start"; tail -20 "$T/dev.log"; exit 1; }
L=http://127.0.0.1:$PORT/inspiration
RC=0; BUNDLE="$ROOT/../deploy-bundle-2026-11-09"
FP="/museum/culture/greek /museum/artist/jan-brueghel-the-elder /annual-reports/company/federal-reserve-bank-of-dallas /annual-reports/country/united-states /annual-reports/designer/paul-rand"
snap() { for p in $FP; do curl -s -A curl/8.4.0 -H 'Accept: */*' "$L$p?r4e2e=$1" | shasum | cut -c1-12; done | tr '\n' ' '; }
before=$(snap a)
stmts() { grep -vE '^\s*(--|$)' "$1" | tr '\n' ' ' | tr ';' '\n' | sed 's/^ *//' | grep -v '^$'; }
nidx() { D1 --json --command "SELECT COUNT(*) n FROM sqlite_master WHERE type='index' AND name LIKE 'idx_r4_%'" 2>/dev/null | python3 -c "import json,sys; print(json.load(sys.stdin)[0]['results'][0]['n'])"; }
apply() { local n=0; while IFS= read -r s; do D1 --command "$s;" >>"$T/setup.log" 2>&1 || { echo "FAIL statement: $s"; RC=1; }; n=$((n+1)); done < <(stmts "$1"); echo $n; }
n=$(apply "$BUNDLE/r4-indexes.sql"); k=$(nidx); [ "$n" = 9 ] && [ "$k" = 9 ] && echo "PASS 1 r4-indexes.sql: $n statements one per --command, $k idx_r4_* indexes" || { echo "FAIL 1 indexes: $n statements, $k indexes"; RC=1; }
n=$(apply "$BUNDLE/r4-indexes-rollback.sql"); k=$(nidx); [ "$n" = 9 ] && [ "$k" = 0 ] && echo "PASS 1 r4-indexes-rollback.sql drops all ($n statements)" || { echo "FAIL 1 rollback: $n statements, $k left"; RC=1; }
n=$(apply "$BUNDLE/r4-indexes.sql"); k=$(nidx); [ "$k" = 9 ] && echo "PASS 1 re-applied (IF NOT EXISTS, idempotent): $k" || { echo "FAIL 1 re-apply: $k"; RC=1; }
after=$(snap b)
[ "$before" = "$after" ] && echo "PASS 3 facet pages identical before/after the indexes: $after" || { echo "FAIL 3 facet pages changed: $before vs $after"; RC=1; }
python3 tests/r4_rpc.py "$L" --local > "$T/rpc" 2>&1; grep -E '^FAIL|-> ' "$T/rpc"; echo "r4_rpc: $(tail -1 "$T/rpc")"; grep -q ' 0 failed$' "$T/rpc" || RC=1
python3 tests/fp4_rpc.py "$L" > "$T/fp4" 2>&1; grep -E '^FAIL|-> ' "$T/fp4"; echo "fp4_rpc: $(tail -1 "$T/fp4")"; grep -q ' 0 failed$' "$T/fp4" || RC=1   # fonts r4 (16-Nov)
python3 tests/fp5_rpc.py "$L" > "$T/fp5" 2>&1; grep -E '^FAIL|-> ' "$T/fp5"; echo "fp5_rpc: $(tail -1 "$T/fp5")"; grep -q ' 0 failed$' "$T/fp5" || RC=1   # fonts r5 (17-Nov)
[ $RC = 0 ] || tail -12 "$T/dev.log" | cut -c1-200
[ $RC = 0 ] && echo "mcp-r4 local e2e: all checks passed" || echo "mcp-r4 local e2e: FAILED"
exit $RC
