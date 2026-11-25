#!/bin/bash
# Restructure round (25-Nov-2026, flat URLs + visible hierarchy): local-only end-to-end for the template tree, all 12 industries incl. r7 education, r8 automotive, r9 travel
# (copied from r9 tr_local_e2e.sh; travel rows + theme files come from ../mgd-inspiration-tpl-r9, read only), then hc_routes.py per industry,
# rs_routes.py (no URL moves, category pages, crumbs, groups, sitemap) and the eleven MCP suites. Former header:
# Local-only end-to-end for the template tree, the nine live industries + education (r7) + automotive (r8) + travel and hotels (25-Nov-2026, templates r9, staged; from r8 au_local_e2e.sh):
# healthcare, real estate, restaurant, weddings and events, portfolios, beauty-fitness. wrangler dev --local on a throwaway D1 + R2, ingest to 127.0.0.1
# (this branch's out-hc = the 8 travel and hotel niches, 98 rows; education from ../mgd-inspiration-tpl-r7; automotive from ../mgd-inspiration-tpl-r8; professional services from ../mgd-inspiration-tpl-r6; construction from ../mgd-inspiration-tpl-r5; beauty-fitness from ../mgd-inspiration-tpl-r4; portfolios from ../mgd-inspiration-r4tpl; the other industries from their own worktrees, read only), R2 theme files into the throwaway
# bucket (every beauty-fitness file, a sample of the others), then tests/hc_routes.py per industry and the six MCP suites.
# Never touches live: no --remote, no routes, and the token is a dummy, so a wrong --base could not authenticate.
# Usage: bash tests/rs_local_e2e.sh   env: TR_PORT (default 8997), TR_INSP (default 9397), TRW (default ../mgd-inspiration-tpl-r9), TR_DUMP=<dir> writes the travel rows
#        (rows.json) and their R2 objects (r2/<key>) from the local D1/R2 after the tests, for the deploy SQL and manifest.
#        HC_KEEP=<file> keeps the server up until that file is deleted.
set -u
cd "$(dirname "$0")/.."; ROOT=$(pwd); W="$ROOT/node_modules/.bin/wrangler"; PORT=${TR_PORT:-8997}; INSP=${TR_INSP:-9397}; T=$(mktemp -d "${SCRATCH:-$ROOT}/rs-e2e.XXXXXX"); CFG="$ROOT/wrangler.rs.jsonc"; TRW="${TRW:-$ROOT/../mgd-inspiration-tpl-r9}"; TFW="${TFW:-$ROOT/../mgd-inspiration-tpl-r9fix}"
HCW="${HC_WORKTREE:-$ROOT/../mgd-inspiration-hc}"; REW="${RE_WORKTREE:-$ROOT/../mgd-inspiration-ind2}"; RSW="${RS_WORKTREE:-$ROOT/../mgd-inspiration-ind3}"; WDW="${WD_WORKTREE:-$ROOT/../mgd-inspiration-ind5}"; PFW="${PF_WORKTREE:-$ROOT/../mgd-inspiration-r4tpl}"; BWW="${BW_WORKTREE:-$ROOT/../mgd-inspiration-tpl-r4}"; CNW="${CN_WORKTREE:-$ROOT/../mgd-inspiration-tpl-r5}"; PSW="${PS_WORKTREE:-$ROOT/../mgd-inspiration-tpl-r6}"; EDW="${ED_WORKTREE:-$ROOT/../mgd-inspiration-tpl-r7}"; AUW="${AU_WORKTREE:-$ROOT/../mgd-inspiration-tpl-r8}"; MAIN="$ROOT/../mgd-inspiration/ui-screens/out"
python3 - <<'PY'
src = open("wrangler.jsonc").read(); i = src.index('"routes"'); j = src.index("]", i) + 1
open("wrangler.rs.jsonc", "w").write(src[:i] + '"routes": []' + src[j:])
PY
for p in $PORT $INSP; do lsof -ti tcp:$p -sTCP:LISTEN >/dev/null 2>&1 && { echo "refusing: port $p is in use by a process this script did not start"; rm -f "$CFG"; exit 2; }; done
[ -e .admin_token ] && { echo "refusing: .admin_token exists here"; exit 2; }; echo local-admin-test > .admin_token
cleanup() { [ -n "${DEVPID:-}" ] && { pkill -P "$DEVPID" 2>/dev/null; kill "$DEVPID" 2>/dev/null; sleep 1; lsof -ti tcp:$PORT -ti tcp:$INSP -sTCP:LISTEN 2>/dev/null | xargs kill 2>/dev/null; }; rm -f "$CFG" .admin_token; cp "$T/dev.log" "${SCRATCH:-$ROOT}/rs-last-dev.log" 2>/dev/null; rm -rf "$T"; }
trap cleanup EXIT
D1() { "$W" d1 execute mgd-inspiration --local -c "$CFG" --persist-to "$T/state" "$@" >>"$T/setup.log" 2>&1; }
D1 --file=./schema.sql || { tail -5 "$T/setup.log"; exit 1; }
D1 --command "ALTER TABLE items ADD COLUMN hue REAL" || true
for f in migrate_category migrate_country migrate_featured migrate_rights migrate_srcurl migrate_annual migrate_mcp migrate_mcp_events migrate_subscribers migrate_moodboards migrate_oauth migrate_boards_v2 migrate_boards_canvas migrate_feedidx migrate_ai_usage migrate_fts; do [ -f "$f.sql" ] && D1 --file=./$f.sql; done
BUCKET=mgd-inspiration-images
for R2DIR in "$TRW/ui-screens/out-wp/_r2" "$AUW/ui-screens/out-wp/_r2" "$EDW/ui-screens/out-wp/_r2" "$PSW/ui-screens/out-wp/_r2" "$CNW/ui-screens/out-wp/_r2" "$BWW/ui-screens/out-wp/_r2" "$PFW/ui-screens/out-wp/_r2" "$WDW/ui-screens/out-wp/_r2" "$RSW/ui-screens/out-wp/_r2" "$REW/ui-screens/out-wp/_r2" "$HCW/ui-screens/out-wp/_r2"; do LIM=${HC_R2_LIMIT:-30}; [ "$R2DIR" = "$TRW/ui-screens/out-wp/_r2" ] && LIM=100000   # every travel file, a sample of the others
if [ -d "$R2DIR/tpl" ]; then (cd "$R2DIR" && find tpl -type f | sort) | head -$LIM | while read -r f; do case "$f" in *.zip) ct=application/zip;; *) ct=image/webp;; esac; "$W" r2 object put "$BUCKET/$f" --file "$R2DIR/$f" --content-type "$ct" --local -c "$CFG" --persist-to "$T/state" >>"$T/setup.log" 2>&1; done; fi; done
"$W" dev --local -c "$CFG" --persist-to "$T/state" --port $PORT --inspector-port $INSP --var ADMIN_TOKEN:local-admin-test --var PUBLIC_ORIGIN:http://127.0.0.1:$PORT --show-interactive-dev-session=false > "$T/dev.log" 2>&1 &
DEVPID=$!
for i in $(seq 1 90); do curl -s -o /dev/null http://127.0.0.1:$PORT/inspiration/ui && break; sleep 1; done
curl -s -o /dev/null -w "worker %{http_code}\n" http://127.0.0.1:$PORT/inspiration/ui
RC=0; cd ui-screens; ING="python3 ingest.py --base http://127.0.0.1:$PORT/inspiration --workers ${TR_WORKERS:-1}"   # one ingest worker (low RAM)
$ING --out "$TRW/ui-screens/out-hc" | tail -1 || RC=1                                   # the 8 travel and hotel niches, 98 rows
for X in "$AUW" "$EDW" "$PSW" "$CNW" "$BWW" "$PFW" "$WDW" "$RSW" "$REW" "$HCW"; do $ING --out "$X/ui-screens/out-hc" | tail -1 || RC=1; done   # older industries, read only
# signatures as they are today: wedding from the wedding worktree, restaurant + coffee-shop from the restaurant worktree, real estate from ind2, healthcare from main
$ING --out "$WDW/ui-screens/out" --only "wedding-website-homepage-*" | tail -1
for n in restaurant coffee-shop; do $ING --out "$RSW/ui-screens/out" --only "$n-website-homepage-*" | tail -1; done
for n in cardiology medical dental dermatology therapist physical-therapy veterinary pediatrics orthodontics fertility real-estate apartment; do SRC="$MAIN"; case $n in real-estate|apartment) [ -d "$REW/ui-screens/out/$n-website-homepage-web-corporate" ] && SRC="$REW/ui-screens/out";; esac; $ING --out "$SRC" --only "$n-website-homepage-*" | tail -1; done
# the live n12 agency, architecture and gym homepages (not signatures here): they must stay plain items, not cards on the nested pages; salon stays flat
for n in agency architecture portfolio-home gym salon class-schedule construction cleaning-service hvac pest-control pro-directory law-firm financial-advisor school preschool course-dashboard; do $ING --out "$MAIN" --only "$n-*web-minimal*" | tail -1; done
# trfix (owner 25-Nov): the n12 hotel (Halcyon Quay) and travel (Driftmark) homepages as fixed in the trfix worktree out-trfix (read only), web + mobile minimal
[ -d "$TFW/ui-screens/out-trfix" ] && $ING --out "$TFW/ui-screens/out-trfix" --only "*-minimal" | tail -1 || RC=1
$ING --out "$MAIN" --only "chat-ai*-web-minimal*" | tail -1
cd ..
TR_LINT_HOMEPAGES=1 TR_LINT_OUT="$TFW/ui-screens/out-trfix" python3 tests/tr_lint.py | tail -1; TR_LINT_HOMEPAGES=1 TR_LINT_OUT="$TFW/ui-screens/out-trfix" python3 tests/tr_lint.py >/dev/null || { echo "FAIL trfix homepage lint"; RC=1; }
python3 tests/hc_routes.py http://127.0.0.1:$PORT/inspiration || RC=1
for I in real-estate restaurant wedding portfolio beauty-fitness construction professional-services education automotive travel; do IND=$I python3 tests/hc_routes.py http://127.0.0.1:$PORT/inspiration || RC=1; done
python3 tests/rs_routes.py http://127.0.0.1:$PORT/inspiration || RC=1
for t in hc re rs wd pf bw cn ps ed au tr; do node tests/${t}_mcp.mjs http://127.0.0.1:$PORT/inspiration || RC=1; done
[ $RC = 0 ] || tail -12 "$T/dev.log" | cut -c1-200
while [ -n "${HC_KEEP:-}" ] && [ -e "$HC_KEEP" ]; do sleep 2; done
exit $RC
