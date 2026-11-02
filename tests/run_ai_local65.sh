#!/bin/zsh
# b65: run_ai_local64.sh + the infographic/wireframe routes on a FOURTH fresh worker (:8866, own D1 .wrangler/ai-65): test_ai_b65.mjs + rpc_ai65.py.
# b64: run_ai_local64.sh + the svg/diagram routes on a THIRD fresh worker (:8865, own D1 .wrangler/ai-64): test_ai_b64.mjs + rpc_ai64.py.
# b63: run_ai_local.sh + the palette route on a SECOND fresh worker (:8864, own D1), and the b60 suite WITHOUT the tools/list identity
# checks (b63 adds MCP tools on purpose; rpc_ai63.py compares sample tool outputs + /api/feed with the baseline instead).
# Original notes — b60 AI tools: LOCAL end-to-end test. NEVER deploys, never touches remote D1, never calls the real Anthropic API.
#   zsh tests/run_ai_local.sh [BASELINE_REF]     (run from the repo root; BASELINE_REF default museum-collection-2026-10)
# 1. seeds two throwaway local D1s (.wrangler/ai-new, .wrangler/ai-base): schema + migrations + 2 items (+ migrate_ai_usage.sql on new)
# 2. starts tests/ai_mock_server.py (:8862), the NEW worker (:8861) with dummy key + Cloudflare's always-pass Turnstile TEST keys,
#    DEV_ALLOW_LOCAL=1, TURNSTILE_BYPASS_LOCAL=1 (offline; honoured only for localhost), AI_DAILY_BUDGET_USD=0.01, and the BASELINE
#    worker (:8863, git archive of BASELINE_REF) on its own D1
# (generate_website_color_palette is not compared: it picks a random harmony per call.)
# 3. node tests/test_ai_caps.mjs + python3 tests/rpc_ai.py --baseline-base (MCP tools/list, instructions, sample tool calls, /api/feed identical)
set -u
cd "$(dirname "$0")/.."
REF=${1:-museum-collection-2026-10}
rm -f wrangler.ai-test.jsonc
W=./node_modules/.bin/wrangler
TMP=$(mktemp -d)
NEWP=8861 MOCKP=8862 BASEP=8863 PALP=8864 B64P=8865 B65P=8866
python3 - <<'PY'
src = open("wrangler.jsonc").read(); i = src.index('"routes"'); j = src.index("]", i) + 1
open("wrangler.ai-test.jsonc", "w").write(src[:i] + '"routes": []' + src[j:])
PY
rm -rf .wrangler/ai-new .wrangler/ai-base .wrangler/ai-pal .wrangler/ai-64 .wrangler/ai-65
git archive "$REF" | tar -x -C $TMP || { echo "git archive $REF failed"; exit 1; }
python3 - "$TMP" <<'PY'
import sys; d = sys.argv[1]; src = open(d + "/wrangler.jsonc").read(); i = src.index('"routes"'); j = src.index("]", i) + 1
open(d + "/wrangler.ai-test.jsonc", "w").write(src[:i] + '"routes": []' + src[j:])
PY
ln -s "$PWD/node_modules" $TMP/node_modules
seed() {  # $1 = config, $2 = persist dir, $3 = repo dir
  local D1=("$W" d1 execute mgd-inspiration --local -c "$1" --persist-to "$2")
  for f in schema.sql migrate_mcp.sql migrate_subscribers.sql; do (cd $3 && "${D1[@]}" --file=./$f >/dev/null) || { echo "seed $f failed"; return 1; }; done
  (cd $3 && "${D1[@]}" --command "ALTER TABLE items ADD COLUMN hue REAL" >/dev/null 2>&1)
  for f in migrate_oauth.sql migrate_boards_v2.sql migrate_boards_canvas.sql migrate_mcp_events.sql migrate_annual.sql migrate_category.sql migrate_country.sql migrate_featured.sql migrate_srcurl.sql migrate_feedidx.sql; do
    [ -f $3/$f ] && (cd $3 && "${D1[@]}" --file=./$f >/dev/null 2>&1); done
  (cd $3 && "${D1[@]}" --command "INSERT INTO items (id,title,description,source_url,source_host,image_key,tags,themes,palette,status,created_at,collection) VALUES ('aaaaaaaaaaa1','Retro serif poster','A bold retro serif poster.','https://example.com/p1','example.com','items/aaaaaaaaaaa1.jpg','[\"serif\"]','[\"retro\"]','[\"#112233\"]','published',1700000000000,'design'),('aaaaaaaaaaa2','Swiss grid report','Grid cover.','https://archive.org/details/x','archive.org','annual/aaaaaaaaaaa2.jpg','[\"grid\"]','[\"swiss\"]','[\"#ff0000\"]','published',1700000001000,'design')" >/dev/null) || { echo "seed items failed"; return 1; }
}
seed wrangler.ai-test.jsonc "$PWD/.wrangler/ai-new" "$PWD" || exit 1
$W d1 execute mgd-inspiration --local -c wrangler.ai-test.jsonc --persist-to .wrangler/ai-new --file=./migrate_ai_usage.sql >/dev/null || { echo "migrate_ai_usage failed"; exit 1; }
seed wrangler.ai-test.jsonc "$PWD/.wrangler/ai-base" "$TMP" || exit 1
seed wrangler.ai-test.jsonc "$PWD/.wrangler/ai-pal" "$PWD" || exit 1
$W d1 execute mgd-inspiration --local -c wrangler.ai-test.jsonc --persist-to .wrangler/ai-pal --file=./migrate_ai_usage.sql >/dev/null || { echo "migrate_ai_usage (pal) failed"; exit 1; }
seed wrangler.ai-test.jsonc "$PWD/.wrangler/ai-64" "$PWD" || exit 1
$W d1 execute mgd-inspiration --local -c wrangler.ai-test.jsonc --persist-to .wrangler/ai-64 --file=./migrate_ai_usage.sql >/dev/null || { echo "migrate_ai_usage (64) failed"; exit 1; }
seed wrangler.ai-test.jsonc "$PWD/.wrangler/ai-65" "$PWD" || exit 1
$W d1 execute mgd-inspiration --local -c wrangler.ai-test.jsonc --persist-to .wrangler/ai-65 --file=./migrate_ai_usage.sql >/dev/null || { echo "migrate_ai_usage (65) failed"; exit 1; }

python3 tests/ai_mock_server.py $MOCKP & MOCKPID=$!
$W dev --local -c wrangler.ai-test.jsonc --persist-to .wrangler/ai-new --port $NEWP --inspector-port 9361 --show-interactive-dev-session=false \
  --var ANTHROPIC_API_KEY:test-dummy-not-a-key --var ANTHROPIC_BASE_URL:http://127.0.0.1:$MOCKP \
  --var TURNSTILE_SECRET:1x0000000000000000000000000000000AA --var TURNSTILE_SITE_KEY:1x00000000000000000000AA \
  --var DEV_ALLOW_LOCAL:1 --var TURNSTILE_BYPASS_LOCAL:1 --var AI_DAILY_BUDGET_USD:0.01 --var AI_DAILY_PER_IP:20 > $TMP/new.log 2>&1 & NEWPID=$!
$W dev --local -c wrangler.ai-test.jsonc --persist-to .wrangler/ai-pal --port $PALP --inspector-port 9364 --show-interactive-dev-session=false \
  --var ANTHROPIC_API_KEY:test-dummy-not-a-key --var ANTHROPIC_BASE_URL:http://127.0.0.1:$MOCKP \
  --var TURNSTILE_SECRET:1x0000000000000000000000000000000AA --var TURNSTILE_SITE_KEY:1x00000000000000000000AA \
  --var DEV_ALLOW_LOCAL:1 --var TURNSTILE_BYPASS_LOCAL:1 --var AI_DAILY_BUDGET_USD:0.01 --var AI_DAILY_PER_IP:20 > $TMP/pal.log 2>&1 & PALPID=$!
$W dev --local -c wrangler.ai-test.jsonc --persist-to .wrangler/ai-64 --port $B64P --inspector-port 9365 --show-interactive-dev-session=false \
  --var ANTHROPIC_API_KEY:test-dummy-not-a-key --var ANTHROPIC_BASE_URL:http://127.0.0.1:$MOCKP \
  --var TURNSTILE_SECRET:1x0000000000000000000000000000000AA --var TURNSTILE_SITE_KEY:1x00000000000000000000AA \
  --var DEV_ALLOW_LOCAL:1 --var TURNSTILE_BYPASS_LOCAL:1 --var AI_DAILY_BUDGET_USD:0.01 --var AI_DAILY_PER_IP:20 > $TMP/b64.log 2>&1 & B64PID=$!
$W dev --local -c wrangler.ai-test.jsonc --persist-to .wrangler/ai-65 --port $B65P --inspector-port 9366 --show-interactive-dev-session=false \
  --var ANTHROPIC_API_KEY:test-dummy-not-a-key --var ANTHROPIC_BASE_URL:http://127.0.0.1:$MOCKP \
  --var TURNSTILE_SECRET:1x0000000000000000000000000000000AA --var TURNSTILE_SITE_KEY:1x00000000000000000000AA \
  --var DEV_ALLOW_LOCAL:1 --var TURNSTILE_BYPASS_LOCAL:1 --var AI_DAILY_BUDGET_USD:0.01 --var AI_DAILY_PER_IP:20 > $TMP/b65.log 2>&1 & B65PID=$!
(cd $TMP && ./node_modules/.bin/wrangler dev --local -c wrangler.ai-test.jsonc --persist-to "$OLDPWD/.wrangler/ai-base" --port $BASEP --inspector-port 9363 --show-interactive-dev-session=false > $TMP/base.log 2>&1) & BASEPID=$!
trap 'kill $MOCKPID $NEWPID $BASEPID $PALPID $B64PID $B65PID 2>/dev/null; pkill -f "inspector-port 936[13456]" 2>/dev/null; true' EXIT
for i in {1..90}; do curl -s -o /dev/null http://127.0.0.1:$NEWP/inspiration/mcp && curl -s -o /dev/null http://127.0.0.1:$BASEP/inspiration/mcp && curl -s -o /dev/null http://127.0.0.1:$PALP/inspiration/mcp && curl -s -o /dev/null http://127.0.0.1:$B64P/inspiration/mcp && curl -s -o /dev/null http://127.0.0.1:$B65P/inspiration/mcp && break; sleep 1; done
RC=0
node tests/test_ai_caps.mjs 2>/dev/null | tail -1; node tests/test_ai_caps.mjs >/dev/null 2>&1 || RC=1
node tests/test_ai_palette63.mjs 2>/dev/null | tail -1; node tests/test_ai_palette63.mjs >/dev/null 2>&1 || RC=1
python3 tests/rpc_ai.py --base http://127.0.0.1:$NEWP --mock http://127.0.0.1:$MOCKP || RC=1
python3 tests/rpc_ai63.py --base http://127.0.0.1:$PALP --mock http://127.0.0.1:$MOCKP --baseline-base http://127.0.0.1:$BASEP || RC=1
node tests/test_ai_b64.mjs 2>/dev/null | tail -1; node tests/test_ai_b64.mjs >/dev/null 2>&1 || RC=1
python3 tests/rpc_ai64.py --base http://127.0.0.1:$B64P --mock http://127.0.0.1:$MOCKP || RC=1
node tests/test_ai_b65.mjs 2>/dev/null | tail -1; node tests/test_ai_b65.mjs >/dev/null 2>&1 || RC=1
python3 tests/rpc_ai65.py --base http://127.0.0.1:$B65P --mock http://127.0.0.1:$MOCKP || RC=1
grep -q "test-dummy-not-a-key" $TMP/new.log $TMP/pal.log $TMP/b64.log $TMP/b65.log && { echo "FAIL: API key value appears in the dev log"; RC=1; }
[ $RC = 0 ] && echo "=== run_ai_local65: ALL PASS" || { echo "=== run_ai_local65: FAILED (logs: $TMP)"; tail -30 $TMP/new.log; }
exit $RC
