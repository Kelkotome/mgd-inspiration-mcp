#!/bin/zsh
# b66: LOCAL end-to-end test of every AI route (b60 describe/alt/prompt, b63 palette, b64 svg/diagram, b65 infographic/wireframe, b66 flyer).
# NEVER deploys, never touches remote D1, never calls the real Anthropic API (tests/ai_mock_server.py answers instead).
#   zsh tests/run_ai_local66.sh [BASELINE_REF]     (run from the repo root; BASELINE_REF default museum-collection-2026-10, e.g. ce5a49a)
# Unlike run_ai_local65.sh (six workers at once on 8861-8866), this uses only two wrangler ports: the NEW worker on :8887 (inspector 9387) is
# restarted on a FRESH throwaway D1 for each HTTP suite (each suite expects 20 uses left), and the BASELINE worker (git archive of BASELINE_REF)
# runs on :8888 (inspector 9388) for rpc_ai63's baseline comparison. Mock API on :8889. All dev vars as in run_ai_local65.sh
# (dummy key, Cloudflare always-pass Turnstile TEST keys, DEV_ALLOW_LOCAL=1, TURNSTILE_BYPASS_LOCAL=1, AI_DAILY_BUDGET_USD=0.01, AI_DAILY_PER_IP=20).
set -u
cd "$(dirname "$0")/.."
REF=${1:-museum-collection-2026-10}
W=./node_modules/.bin/wrangler
TMP=$(mktemp -d)
NEWP=8887 BASEP=8888 MOCKP=8889
python3 - <<'PY'
src = open("wrangler.jsonc").read(); i = src.index('"routes"'); j = src.index("]", i) + 1
open("wrangler.ai-test.jsonc", "w").write(src[:i] + '"routes": []' + src[j:])
PY
git archive "$REF" | tar -x -C $TMP || { echo "git archive $REF failed"; exit 1; }
python3 - "$TMP" <<'PY'
import sys; d = sys.argv[1]; src = open(d + "/wrangler.jsonc").read(); i = src.index('"routes"'); j = src.index("]", i) + 1
open(d + "/wrangler.ai-test.jsonc", "w").write(src[:i] + '"routes": []' + src[j:])
PY
ln -s "$PWD/node_modules" $TMP/node_modules
seed() {  # $1 = persist dir, $2 = repo dir, $3 = 1 to add ai_usage
  local D1=("$W" d1 execute mgd-inspiration --local -c wrangler.ai-test.jsonc --persist-to "$1")
  rm -rf "$1"
  for f in schema.sql migrate_mcp.sql migrate_subscribers.sql; do (cd $2 && "${D1[@]}" --file=./$f >/dev/null) || { echo "seed $f failed"; return 1; }; done
  (cd $2 && "${D1[@]}" --command "ALTER TABLE items ADD COLUMN hue REAL" >/dev/null 2>&1)
  for f in migrate_oauth.sql migrate_boards_v2.sql migrate_boards_canvas.sql migrate_mcp_events.sql migrate_annual.sql migrate_category.sql migrate_country.sql migrate_featured.sql migrate_srcurl.sql migrate_feedidx.sql; do
    [ -f $2/$f ] && (cd $2 && "${D1[@]}" --file=./$f >/dev/null 2>&1); done
  (cd $2 && "${D1[@]}" --command "INSERT INTO items (id,title,description,source_url,source_host,image_key,tags,themes,palette,status,created_at,collection) VALUES ('aaaaaaaaaaa1','Retro serif poster','A bold retro serif poster.','https://example.com/p1','example.com','items/aaaaaaaaaaa1.jpg','[\"serif\"]','[\"retro\"]','[\"#112233\"]','published',1700000000000,'design'),('aaaaaaaaaaa2','Swiss grid report','Grid cover.','https://archive.org/details/x','archive.org','annual/aaaaaaaaaaa2.jpg','[\"grid\"]','[\"swiss\"]','[\"#ff0000\"]','published',1700000001000,'design')" >/dev/null) || { echo "seed items failed"; return 1; }
  [ "${3:-0}" = 1 ] && { (cd $2 && "${D1[@]}" --file=./migrate_ai_usage.sql >/dev/null) || { echo "migrate_ai_usage failed"; return 1; }; }
  return 0
}
NEWPID=""
start_new() {  # $1 = persist dir (fresh)
  [ -n "$NEWPID" ] && { kill $NEWPID 2>/dev/null; pkill -f "inspector-port 9387" 2>/dev/null; sleep 2; }
  seed "$1" "$PWD" 1 || return 1
  $W dev --local -c wrangler.ai-test.jsonc --persist-to "$1" --port $NEWP --inspector-port 9387 --show-interactive-dev-session=false \
    --var ANTHROPIC_API_KEY:test-dummy-not-a-key --var ANTHROPIC_BASE_URL:http://127.0.0.1:$MOCKP \
    --var TURNSTILE_SECRET:1x0000000000000000000000000000000AA --var TURNSTILE_SITE_KEY:1x00000000000000000000AA \
    --var DEV_ALLOW_LOCAL:1 --var TURNSTILE_BYPASS_LOCAL:1 --var AI_DAILY_BUDGET_USD:0.01 --var AI_DAILY_PER_IP:20 >> $TMP/new.log 2>&1 &
  NEWPID=$!
  for i in {1..90}; do curl -s -o /dev/null http://127.0.0.1:$NEWP/inspiration/mcp && return 0; sleep 1; done
  echo "new worker did not start"; return 1
}
seed "$PWD/.wrangler/ai66-base" "$TMP" 0 || exit 1
python3 tests/ai_mock_server.py $MOCKP & MOCKPID=$!
(cd $TMP && ./node_modules/.bin/wrangler dev --local -c wrangler.ai-test.jsonc --persist-to "$OLDPWD/.wrangler/ai66-base" --port $BASEP --inspector-port 9388 --show-interactive-dev-session=false > $TMP/base.log 2>&1) & BASEPID=$!
trap 'kill $MOCKPID $BASEPID $NEWPID 2>/dev/null; pkill -f "inspector-port 938[78]" 2>/dev/null; rm -f wrangler.ai-test.jsonc; true' EXIT
for i in {1..90}; do curl -s -o /dev/null http://127.0.0.1:$BASEP/inspiration/mcp && break; sleep 1; done
RC=0
for t in test_ai_caps test_ai_palette63 test_ai_b64 test_ai_b65 test_ai_b66; do node tests/$t.mjs 2>/dev/null | tail -1 | sed "s/^/$t: /"; node tests/$t.mjs >/dev/null 2>&1 || RC=1; done
B=http://127.0.0.1:$NEWP M=http://127.0.0.1:$MOCKP
suite() {  # $1 = label, $2 = fresh D1 dir, rest = python suite + args
  local label=$1 dir=$2; shift 2
  start_new "$dir" || { RC=1; return; }
  python3 "$@" > $TMP/$label.txt 2>&1 || { RC=1; grep -v "^PASS" $TMP/$label.txt | tail -15; }
  echo "$label: $(tail -1 $TMP/$label.txt)"
}
suite rpc_ai_b60 "$PWD/.wrangler/ai66-a" tests/rpc_ai.py --base $B --mock $M
suite rpc_ai63 "$PWD/.wrangler/ai66-b" tests/rpc_ai63.py --base $B --mock $M --baseline-base http://127.0.0.1:$BASEP
suite rpc_ai64 "$PWD/.wrangler/ai66-c" tests/rpc_ai64.py --base $B --mock $M
suite rpc_ai65 "$PWD/.wrangler/ai66-d" tests/rpc_ai65.py --base $B --mock $M
suite rpc_ai66 "$PWD/.wrangler/ai66-e" tests/rpc_ai66.py --base $B --mock $M
grep -q "test-dummy-not-a-key" $TMP/new.log && { echo "FAIL: API key value appears in the dev log"; RC=1; }
[ $RC = 0 ] && echo "=== run_ai_local66: ALL PASS" || { echo "=== run_ai_local66: FAILED (logs: $TMP)"; tail -30 $TMP/new.log; }
exit $RC
