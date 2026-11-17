#!/bin/zsh
# design-r1: LOCAL end-to-end test of the "Design anything" box (POST /api/ai/design + GET /api/ai/design/status).
# NEVER deploys, never touches remote D1, never calls the real Anthropic API (tests/ai_mock_design.py answers instead).
#   zsh tests/design_local_e2e.sh [HUB_TG_DIR]     (run from the repo root; HUB_TG_DIR = EtiennAubertBonn/tool-gap-2026-10 for the browser suites)
# 1. unit tests (test_design + the b60-b66 AI suites + fonts r5/r4/r2/gaps; fp5_rpc.py on the local Worker after suite a)  2. HTTP suites a-d (rpc_design.py), each on a FRESH throwaway D1 with its own vars
# 3. browser suites (design-box/test_design_box.js: the boxed hub preview in Chrome -> same-origin proxy -> this Worker): main, paused, budget, limit
# Ports: mock 8985, worker 8986 (inspector 9396), browser proxy 8987. Dummy key, Cloudflare always-pass Turnstile TEST keys, DEV_ALLOW_LOCAL=1,
# TURNSTILE_BYPASS_LOCAL=1, DEV_LOGIN=1 + a throwaway SESSION_SECRET (dev-login stands in for Google).
set -u
cd "$(dirname "$0")/.."
TG=${1:-/Users/eugeneleow/Downloads/EtiennAubertBonn/tool-gap-2026-10}
W=./node_modules/.bin/wrangler
TMP=$(mktemp -d)
MOCKP=8985 NEWP=8986
python3 - <<'PY'
src = open("wrangler.jsonc").read(); i = src.index('"routes"'); j = src.index("]", i) + 1
open("wrangler.design-test.jsonc", "w").write(src[:i] + '"routes": []' + src[j:])
PY
seed() {  # $1 = persist dir
  local D1=("$W" d1 execute mgd-inspiration --local -c wrangler.design-test.jsonc --persist-to "$1")
  rm -rf "$1"
  for f in schema.sql migrate_mcp.sql migrate_subscribers.sql; do "${D1[@]}" --file=./$f >/dev/null || { echo "seed $f failed"; return 1; }; done
  "${D1[@]}" --command "ALTER TABLE items ADD COLUMN hue REAL" >/dev/null 2>&1
  for f in migrate_oauth.sql migrate_boards_v2.sql migrate_boards_canvas.sql migrate_mcp_events.sql migrate_annual.sql migrate_category.sql migrate_country.sql migrate_featured.sql migrate_srcurl.sql migrate_feedidx.sql; do
    [ -f $f ] && "${D1[@]}" --file=./$f >/dev/null 2>&1; done
  "${D1[@]}" --file=./migrate_ai_usage.sql >/dev/null || { echo "migrate_ai_usage failed"; return 1; }
}
NEWPID=""
start_new() {  # $1 = persist dir (fresh), rest = extra --var NAME:VALUE pairs
  local dir=$1; shift
  [ -n "$NEWPID" ] && { kill $NEWPID 2>/dev/null; pkill -f "inspector-port 9396" 2>/dev/null; sleep 2; }
  seed "$dir" || return 1
  $W dev --local -c wrangler.design-test.jsonc --persist-to "$dir" --port $NEWP --inspector-port 9396 --show-interactive-dev-session=false \
    --var ANTHROPIC_API_KEY:test-dummy-not-a-key --var ANTHROPIC_BASE_URL:http://127.0.0.1:$MOCKP \
    --var TURNSTILE_SECRET:1x0000000000000000000000000000000AA --var TURNSTILE_SITE_KEY:1x00000000000000000000AA \
    --var DEV_ALLOW_LOCAL:1 --var TURNSTILE_BYPASS_LOCAL:1 --var DEV_LOGIN:1 --var SESSION_SECRET:local-test-session-secret-0123456789 \
    --var AI_DAILY_BUDGET_USD:0.01 --var AI_DAILY_PER_IP:20 "$@" >> $TMP/new.log 2>&1 &
  NEWPID=$!
  for i in {1..90}; do curl -s -o /dev/null http://127.0.0.1:$NEWP/inspiration/mcp && return 0; sleep 1; done
  echo "worker did not start"; return 1
}
python3 tests/ai_mock_design.py $MOCKP & MOCKPID=$!
trap 'kill $MOCKPID $NEWPID 2>/dev/null; pkill -f "inspector-port 9396" 2>/dev/null; rm -f wrangler.design-test.jsonc; true' EXIT
RC=0
for t in test_design test_ai_caps test_ai_palette63 test_ai_b64 test_ai_b65 test_ai_b66; do node tests/$t.mjs > $TMP/$t.txt 2>&1 || RC=1; echo "$t: $(tail -1 $TMP/$t.txt)"; done
# fonts r5 (8290427) + fonts r6 ship in the same deploy: their unit suites here, fp5_rpc.py / fp6_rpc.py against the local Worker in suite a
for t in fp_r6 fp_r5 fp_r4 fp_r2 fp_gaps_r1 fp_gaps_r2; do node --no-warnings tests/$t.test.mjs > $TMP/$t.txt 2>&1 || { RC=1; echo "FAIL $t"; }; echo "$t: $(tail -1 $TMP/$t.txt)"; done
B=http://127.0.0.1:$NEWP M=http://127.0.0.1:$MOCKP
suite() {  # $1 = label, $2 = suite letter / browser scenario, $3 = kind (rpc|ui), rest = --var pairs
  local label=$1 s=$2 kind=$3; shift 3
  start_new "$PWD/.wrangler/design-$label" "$@" || { RC=1; return; }
  if [ $kind = rpc ]; then python3 tests/rpc_design.py --base $B --mock $M --suite $s > $TMP/$label.txt 2>&1 || RC=1
  else node $TG/design-box/test_design_box.js --scenario=$s --api=$B --mock=$M > $TMP/$label.txt 2>&1 || RC=1; fi
  grep "^FAIL" $TMP/$label.txt | head -12
  echo "$label: $(tail -1 $TMP/$label.txt)"
}
suite rpc-a a rpc
python3 tests/fp5_rpc.py $B/inspiration > $TMP/fp5.txt 2>&1 || RC=1; grep "^FAIL" $TMP/fp5.txt | head; echo "fp5_rpc (local Worker): $(tail -1 $TMP/fp5.txt)"
python3 tests/fp6_rpc.py $B/inspiration > $TMP/fp6.txt 2>&1 || RC=1; grep "^FAIL" $TMP/fp6.txt | head; echo "fp6_rpc (local Worker): $(tail -1 $TMP/fp6.txt)"   # fonts r6 (18-Nov)
suite rpc-b b rpc --var AI_DESIGN_ANON_PER_HOUR:10
suite rpc-c c rpc --var AI_DESIGN_BUDGET_USD:0.30 --var AI_DESIGN_HARD_CEILING_USD:0.45 --var AI_DESIGN_ALERT_WEBHOOK:http://127.0.0.1:$MOCKP/__alert
suite rpc-d d rpc --var AI_DESIGN_KILL:1
if [ -f $TG/design-box/test_design_box.js ]; then
  (cd $TG && python3 design-box/build_design_box.py >/dev/null && python3 design-box/make_box_preview.py >/dev/null) || { echo "preview build failed"; RC=1; }
  suite ui-main main ui
  suite ui-paused paused ui --var AI_DESIGN_KILL:1
  suite ui-budget budget ui --var AI_DESIGN_BUDGET_USD:0.05
  suite ui-limit limit ui --var AI_DESIGN_ANON_PER_HOUR:10
fi
grep -q "test-dummy-not-a-key" $TMP/new.log && { echo "FAIL: API key value appears in the dev log"; RC=1; }
grep -q "UPSTREAM-SECRET-TEXT" $TMP/*.txt && { echo "FAIL: upstream error text reached a client"; RC=1; }
grep -c "AI_DESIGN_ALERT" $TMP/new.log | sed 's/^/AI_DESIGN_ALERT log lines: /'
[ $RC = 0 ] && echo "=== design_local_e2e: ALL PASS" || { echo "=== design_local_e2e: FAILED (logs: $TMP)"; tail -30 $TMP/new.log; }
exit $RC
