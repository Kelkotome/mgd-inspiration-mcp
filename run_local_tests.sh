#!/usr/bin/env bash
# Local-only test runner for the /mcp/boards OAuth build. NEVER deploys, never touches remote D1.
#  1. (re)builds a throwaway local D1 under ./.wrangler/state (schema + migrations + 3 seed items)
#  2. runs the ORIGINAL worker (./test_baseline/src = untouched copy of the deployed src) with
#     `wrangler dev --local` on :8798 and records its public /mcp responses, then stops it
#  3. runs the NEW worker on :8797 (same local D1) and test_mcp_oauth.py against it
#     (full OAuth flow + negatives + public /mcp byte-for-byte diff vs step 2)
#  4. greps the dev logs + local D1 for raw token values (must be absent), stops both servers by PID
set -u
cd "$(dirname "$0")"
ORIG="${ORIG_DIR:-$HOME/Downloads/EtiennAubertBonn/mgd-inspiration}"
D1="npx wrangler d1 execute mgd-inspiration --local"

rm -rf .wrangler/state test_baseline
mkdir -p test_baseline && cp -R "$ORIG/src" test_baseline/src
# Test configs WITHOUT "routes": with routes present, `wrangler dev` rewrites Host/Origin to the
# route host (madegooddesigns.com), which would defeat the consent-form Origin check locally.
python3 - <<'PY'
import re
src = open("wrangler.jsonc").read()
i = src.index('"routes"'); j = src.index("]", i) + 1
cfg = src[:i] + '"routes": []' + src[j:]
open("wrangler.test.jsonc", "w").write(cfg)
open("wrangler.baseline.jsonc", "w").write(cfg.replace('"main": "src/index.js"', '"main": "test_baseline/src/index.js"'))
PY

for f in schema.sql migrate_mcp.sql migrate_subscribers.sql; do $D1 --file=./$f >/dev/null || { echo "schema $f failed"; exit 1; }; done
$D1 --command "ALTER TABLE items ADD COLUMN hue REAL" >/dev/null   # live column not in schema.sql (schema drift)
$D1 --file=./migrate_oauth.sql >/dev/null || { echo "migrate_oauth.sql failed"; exit 1; }
$D1 --file=./migrate_boards_v2.sql >/dev/null || { echo "migrate_boards_v2.sql failed"; exit 1; }
$D1 --file=./migrate_boards_canvas.sql >/dev/null || { echo "migrate_boards_canvas.sql failed"; exit 1; }
$D1 --command "INSERT INTO items (id,title,description,source_url,source_host,image_key,tags,themes,palette,status,created_at,collection,company,report_year,designer,industry,owner_id) VALUES
 ('aaaaaaaaaaa1','Retro serif poster','A bold retro serif poster.','https://example.com/p1','example.com','items/aaaaaaaaaaa1.jpg','[\"serif\",\"poster\"]','[\"retro\"]','[\"#112233\",\"#ffcc00\"]','published',1700000000000,'design',NULL,NULL,NULL,NULL,NULL),
 ('aaaaaaaaaaa2','Swiss grid report','Modernist grid cover.','https://archive.org/details/x','archive.org','annual/aaaaaaaaaaa2.jpg','[\"grid\"]','[\"swiss\"]','[\"#ff0000\"]','published',1700000001000,'annual-report','Acme Transit',1972,'Paul Rand','transit',NULL),
 ('bbbbbbbbbbb1','Private user item','x','https://private.example/','private.example','user/u/bbbbbbbbbbb1.jpg','[]','[]','[]','published',1700000002000,'design',NULL,NULL,NULL,NULL,'someoneelse1')" >/dev/null || exit 1

# workerd can't share the local SQLite between two live servers -> run them one after the other.
# (Ports 8797/8798, not the default 8787, which other local projects may already use.)
start_dev() { npx wrangler dev --local "$@" --show-interactive-dev-session=false > "$LOG" 2>&1 & PID=$!
  for i in $(seq 1 60); do curl -s -o /dev/null "http://localhost:$PORT/inspiration/mcp" && return 0; sleep 1; done; echo "dev server failed"; tail -20 "$LOG"; return 1; }
stop_dev() { kill "$PID" 2>/dev/null; wait "$PID" 2>/dev/null; PID=; }
trap 'stop_dev; rm -f .test_tokens' EXIT

echo "-- recording ORIGINAL worker's public /mcp responses"
PORT=8798 LOG=dev_orig.log; start_dev -c wrangler.baseline.jsonc --port 8798 --inspector-port 9241 || exit 1
python3 test_mcp_oauth.py --base http://localhost:8798 --snapshot-out public_mcp_orig.json || exit 1
stop_dev

echo "-- testing NEW worker"
PORT=8797 LOG=dev_new.log; start_dev -c wrangler.test.jsonc --port 8797 --inspector-port 9242 --var PUBLIC_ORIGIN:http://localhost:8797 || exit 1
python3 test_mcp_oauth.py --base http://localhost:8797 --baseline-file public_mcp_orig.json
RC=$?
echo; echo "-- batch-45 tool cores (Node unit + JSON-RPC)"
node --experimental-default-type=module tests/test_tools45.mjs 2>/dev/null | tail -1 | grep -q " 0 failed" && echo "PASS tests/test_tools45.mjs" || { echo "FAIL tests/test_tools45.mjs"; RC=1; }
python3 tests/rpc45.py --base http://localhost:8797 || RC=1

echo; echo "-- secrecy checks"
LEAK=0
if [ -f .test_tokens ]; then
  while read -r t; do
    [ -z "$t" ] && continue
    if grep -qF "$t" dev_new.log dev_orig.log; then echo "FAIL token found in dev log"; LEAK=1; fi
    if grep -rqaF "$t" .wrangler/state; then echo "FAIL raw token found in local D1/state"; LEAK=1; fi
  done < .test_tokens
  [ $LEAK = 0 ] && echo "PASS no raw access/refresh token in dev logs or local D1 (only SHA-256 hashes stored)"
fi
$D1 --json --command "SELECT COUNT(*) AS n, SUM(user_id IS NOT NULL) AS with_user FROM mcp_calls" 2>/dev/null | python3 -c 'import json,sys; r=json.load(sys.stdin)[0]["results"][0]; ok=r["with_user"] and r["n"]>r["with_user"]; print(("PASS" if ok else "FAIL")+" mcp_calls logged: %s rows, %s attributed to a user (/mcp/boards), rest anonymous (/mcp)" % (r["n"], r["with_user"])); sys.exit(0 if ok else 1)' || LEAK=1
[ $RC = 0 ] && [ $LEAK = 0 ] && echo "ALL TESTS PASSED" || { echo "TESTS FAILED"; exit 1; }
