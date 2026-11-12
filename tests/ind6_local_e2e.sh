#!/bin/bash
# Local-only end-to-end for the template tree, all six industries' worth of sets (13-Nov-2026, templates r3: portfolios and creative studios):
# healthcare, real estate, restaurant, weddings and events, portfolios. wrangler dev --local on a throwaway D1 + R2, ingest to 127.0.0.1
# (this branch's out-hc = the 8 portfolio niches; the other industries from their own worktrees, read only), R2 theme files into the throwaway
# bucket (every portfolio file, a sample of the others), then tests/hc_routes.py per industry and the five MCP suites.
# Never touches live: no --remote, no routes, and the token is a dummy, so a wrong --base could not authenticate.
# Usage: bash tests/ind6_local_e2e.sh   env: PF_PORT (default 8981), PF_INSP (default 9381), PF_DUMP=<dir> writes the portfolio rows
#        (rows.json) and their R2 objects (r2/<key>) from the local D1/R2 after the tests, for the deploy SQL and manifest.
#        HC_KEEP=<file> keeps the server up until that file is deleted.
set -u
cd "$(dirname "$0")/.."; ROOT=$(pwd); W="$ROOT/node_modules/.bin/wrangler"; PORT=${PF_PORT:-8981}; INSP=${PF_INSP:-9381}; T=$(mktemp -d "${SCRATCH:-$ROOT}/ind6-e2e.XXXXXX"); CFG="$ROOT/wrangler.ind6.jsonc"
HCW="${HC_WORKTREE:-$ROOT/../mgd-inspiration-hc}"; REW="${RE_WORKTREE:-$ROOT/../mgd-inspiration-ind2}"; RSW="${RS_WORKTREE:-$ROOT/../mgd-inspiration-ind3}"; WDW="${WD_WORKTREE:-$ROOT/../mgd-inspiration-ind5}"; MAIN="$ROOT/../mgd-inspiration/ui-screens/out"
python3 - <<'PY'
src = open("wrangler.jsonc").read(); i = src.index('"routes"'); j = src.index("]", i) + 1
open("wrangler.ind6.jsonc", "w").write(src[:i] + '"routes": []' + src[j:])
PY
for p in $PORT $INSP; do lsof -ti tcp:$p -sTCP:LISTEN >/dev/null 2>&1 && { echo "refusing: port $p is in use by a process this script did not start"; rm -f "$CFG"; exit 2; }; done
[ -e .admin_token ] && { echo "refusing: .admin_token exists here"; exit 2; }; echo local-admin-test > .admin_token
cleanup() { [ -n "${DEVPID:-}" ] && { pkill -P "$DEVPID" 2>/dev/null; kill "$DEVPID" 2>/dev/null; sleep 1; lsof -ti tcp:$PORT -ti tcp:$INSP -sTCP:LISTEN 2>/dev/null | xargs kill 2>/dev/null; }; rm -f "$CFG" .admin_token; cp "$T/dev.log" "${SCRATCH:-$ROOT}/ind6-last-dev.log" 2>/dev/null; rm -rf "$T"; }
trap cleanup EXIT
D1() { "$W" d1 execute mgd-inspiration --local -c "$CFG" --persist-to "$T/state" "$@" >>"$T/setup.log" 2>&1; }
D1 --file=./schema.sql || { tail -5 "$T/setup.log"; exit 1; }
D1 --command "ALTER TABLE items ADD COLUMN hue REAL" || true
for f in migrate_category migrate_country migrate_featured migrate_rights migrate_srcurl migrate_annual migrate_mcp migrate_mcp_events migrate_subscribers migrate_moodboards migrate_oauth migrate_boards_v2 migrate_boards_canvas migrate_feedidx migrate_ai_usage migrate_fts; do [ -f "$f.sql" ] && D1 --file=./$f.sql; done
BUCKET=mgd-inspiration-images
for R2DIR in ui-screens/out-wp/_r2 "$WDW/ui-screens/out-wp/_r2" "$RSW/ui-screens/out-wp/_r2" "$REW/ui-screens/out-wp/_r2" "$HCW/ui-screens/out-wp/_r2"; do LIM=${HC_R2_LIMIT:-30}; [ "$R2DIR" = ui-screens/out-wp/_r2 ] && LIM=100000   # every portfolio file, a sample of the others
if [ -d "$R2DIR/tpl" ]; then (cd "$R2DIR" && find tpl -type f | sort) | head -$LIM | while read -r f; do case "$f" in *.zip) ct=application/zip;; *) ct=image/webp;; esac; "$W" r2 object put "$BUCKET/$f" --file "$R2DIR/$f" --content-type "$ct" --local -c "$CFG" --persist-to "$T/state" >>"$T/setup.log" 2>&1; done; fi; done
"$W" dev --local -c "$CFG" --persist-to "$T/state" --port $PORT --inspector-port $INSP --var ADMIN_TOKEN:local-admin-test --var PUBLIC_ORIGIN:http://127.0.0.1:$PORT --show-interactive-dev-session=false > "$T/dev.log" 2>&1 &
DEVPID=$!
for i in $(seq 1 90); do curl -s -o /dev/null http://127.0.0.1:$PORT/inspiration/ui && break; sleep 1; done
curl -s -o /dev/null -w "worker %{http_code}\n" http://127.0.0.1:$PORT/inspiration/ui
RC=0; cd ui-screens; ING="python3 ingest.py --base http://127.0.0.1:$PORT/inspiration --workers ${PF_WORKERS:-1}"   # one ingest worker (low RAM)
$ING --out out-hc | tail -1 || RC=1                                   # the 8 portfolio niches, 96 rows
for X in "$WDW" "$RSW" "$REW" "$HCW"; do $ING --out "$X/ui-screens/out-hc" | tail -1 || RC=1; done   # older industries, read only
# signatures as they are today: wedding from the wedding worktree, restaurant + coffee-shop from the restaurant worktree, real estate from ind2, healthcare from main
$ING --out "$WDW/ui-screens/out" --only "wedding-website-homepage-*" | tail -1
for n in restaurant coffee-shop; do $ING --out "$RSW/ui-screens/out" --only "$n-website-homepage-*" | tail -1; done
for n in cardiology medical dental dermatology therapist physical-therapy veterinary pediatrics orthodontics fertility real-estate apartment; do SRC="$MAIN"; case $n in real-estate|apartment) [ -d "$REW/ui-screens/out/$n-website-homepage-web-corporate" ] && SRC="$REW/ui-screens/out";; esac; $ING --out "$SRC" --only "$n-website-homepage-*" | tail -1; done
# the live n12 agency and architecture homepages (not signatures here): they must stay plain items, not cards on the nested pages
for n in agency architecture portfolio-home; do $ING --out "$MAIN" --only "$n-*web-minimal*" | tail -1; done
$ING --out "$MAIN" --only "chat-ai*-web-minimal*" | tail -1
cd ..
python3 tests/hc_routes.py http://127.0.0.1:$PORT/inspiration || RC=1
for I in real-estate restaurant wedding portfolio; do IND=$I python3 tests/hc_routes.py http://127.0.0.1:$PORT/inspiration || RC=1; done
for t in hc re rs wd pf; do node tests/${t}_mcp.mjs http://127.0.0.1:$PORT/inspiration || RC=1; done
if [ -n "${PF_DUMP:-}" ]; then   # rows + R2 objects for the deploy bundle, read from the throwaway state only
  mkdir -p "$PF_DUMP/r2"; ls ui-screens/out-hc > "$PF_DUMP/slugs.txt"
  python3 - "$PF_DUMP" <<'PY'
import sys, os; d = sys.argv[1]; s = [l.strip() for l in open(f"{d}/slugs.txt") if l.strip()]
q = "SELECT * FROM items WHERE source_url IN (" + ",".join("'https://madegooddesigns.com/inspiration/ui#" + x + "'" for x in s) + ") ORDER BY source_url"
open(f"{d}/q.sql", "w").write(q)
PY
  "$W" d1 execute mgd-inspiration --local -c "$CFG" --persist-to "$T/state" --json --file "$PF_DUMP/q.sql" > "$PF_DUMP/rows.json" 2>>"$T/setup.log" || RC=1
  python3 - "$PF_DUMP" <<'PY' > "$PF_DUMP/keys.txt"
import json, sys; rows = json.load(open(sys.argv[1] + "/rows.json"))[0]["results"]
for r in rows:
    k = r["image_key"]; print(k); print(k[:-5] + "-dark.webp")
    for f in ("index.html", "spec.json", "DESIGN.md"): print(f"ui/{r['id']}/{f}")
PY
  while read -r k; do mkdir -p "$PF_DUMP/r2/$(dirname "$k")"; "$W" r2 object get "$BUCKET/$k" --file "$PF_DUMP/r2/$k" --local -c "$CFG" --persist-to "$T/state" >>"$T/setup.log" 2>&1 || echo "missing $k"; done < "$PF_DUMP/keys.txt"
fi
[ $RC = 0 ] || tail -12 "$T/dev.log" | cut -c1-200
while [ -n "${HC_KEEP:-}" ] && [ -e "$HC_KEEP" ]; do sleep 2; done
exit $RC
