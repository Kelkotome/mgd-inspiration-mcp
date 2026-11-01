#!/bin/bash
# Local-only A/B for the MCP UX pass: NEW worker (this tree) vs BASELINE worker (a git archive of origin), each on its OWN copy of
# the same seeded local D1, then tests/rpc_mcpux.py + the older batch suites. Never deploys, never touches remote.
# Usage: bash tests/mcpux_local/run.sh [BASELINE_REF=origin/museum-collection-2026-10]
# Seed: reuses $SEED_DIR/{schema.sql,seed.sql} (default /tmp/mgd-designmd-test, built by tests/designmd_local/seed.py from a
# read-only sample of live D1); falls back to schema.sql + migrations with no rows.
set -u
cd "$(dirname "$0")/../.."; ROOT=$(pwd)
REF="${1:-origin/museum-collection-2026-10}"; SEED_DIR="${SEED_DIR:-/tmp/mgd-designmd-test}"
T=$(mktemp -d); W="$ROOT/node_modules/.bin/wrangler"; PORT=8861 BPORT=8862; RC=0
mkdir -p "$T/base" && git archive "$REF" | tar -x -C "$T/base" || { echo "cannot archive $REF"; exit 1; }
ln -s "$ROOT/node_modules" "$T/base/node_modules"
mkcfg() { python3 - "$1" "$2" <<'PY'
import sys; src = open(sys.argv[1]).read(); i = src.index('"routes"'); j = src.index("]", i) + 1
open(sys.argv[2], "w").write(src[:i] + '"routes": []' + src[j:])
PY
}
mkcfg wrangler.jsonc "$ROOT/wrangler.mcpux.jsonc"; mkcfg "$T/base/wrangler.jsonc" "$T/base/wrangler.mcpux.jsonc"
D1() { "$W" d1 execute mgd-inspiration --local -c "$ROOT/wrangler.mcpux.jsonc" --persist-to "$T/state" "$@" >/dev/null 2>>"$T/setup.err"; }
if [ -f "$SEED_DIR/seed.sql" ]; then D1 --file="$SEED_DIR/schema.sql" && D1 --file="$SEED_DIR/seed.sql" || { tail -5 "$T/setup.err"; exit 1; }
else for f in schema.sql migrate_mcp.sql migrate_mcp_events.sql migrate_subscribers.sql; do D1 --file="./$f" || true; done; fi
# (No local R2 seed: the 2 get_ui_screen_code DESIGN.md checks in rpc_designmd fail identically on both workers; compared below.)
D1 --file=./migrate_moodboards.sql || { echo "migrate_moodboards.sql failed"; tail -3 "$T/setup.err"; exit 1; }
cp -R "$T/state" "$T/state_base"
"$W" dev --local -c "$ROOT/wrangler.mcpux.jsonc" --persist-to "$T/state" --port $PORT --inspector-port 9261 --var MOODBOARD_DAILY_LIMIT:${MOODBOARD_DAILY_LIMIT:-6} --var ADMIN_TOKEN:local-admin-test --show-interactive-dev-session=false > "$T/new.log" 2>&1 & NP=$!
(cd "$T/base" && "$W" dev --local -c wrangler.mcpux.jsonc --persist-to "$T/state_base" --port $BPORT --inspector-port 9262 --show-interactive-dev-session=false > "$T/base.log" 2>&1) & BP=$!
trap 'kill $NP $BP 2>/dev/null; pkill -f "inspector-port 926[12]" 2>/dev/null; rm -f "$ROOT/wrangler.mcpux.jsonc"' EXIT
for i in $(seq 1 90); do curl -s -o /dev/null http://127.0.0.1:$PORT/inspiration/mcp && curl -s -o /dev/null http://127.0.0.1:$BPORT/inspiration/mcp && break; sleep 1; done
for P in $PORT $BPORT; do curl -s -o /dev/null http://127.0.0.1:$P/inspiration/mcp || { echo "worker on :$P did not start:"; grep -i error "$T/new.log" "$T/base.log" | head -5; exit 1; }; done
echo "== rpc_mcpux (new vs baseline)"; python3 tests/rpc_mcpux.py --base http://127.0.0.1:$PORT --baseline-base http://127.0.0.1:$BPORT || RC=1
echo "== moodboards + progressive discovery"; python3 tests/rpc_moodboard_discovery.py --base http://127.0.0.1:$PORT || RC=1
echo "== older suites against the NEW worker (no baseline mode: their baseline checks assert the pre-UX instructions text)"
for t in rpc45 rpc48 rpc49 rpc50 rpc51 rpc52 rpc53; do
  python3 tests/$t.py --base http://127.0.0.1:$PORT > "$T/$t.out" 2>&1 && echo "PASS $t ($(tail -1 "$T/$t.out"))" || { echo "FAIL $t ($(tail -1 "$T/$t.out"))"; grep "^FAIL" "$T/$t.out" | head -5; RC=1; }
done
python3 tests/rpc_designmd.py --base http://127.0.0.1:$PORT > "$T/designmd.out" 2>&1; python3 tests/rpc_designmd.py --base http://127.0.0.1:$BPORT > "$T/designmd_base.out" 2>&1
# pass = every FAIL on the new worker also fails on the baseline (environmental: no local R2), and the new worker has no extra FAILs
grep "^FAIL" "$T/designmd.out" | cut -d'|' -f1 | sort > "$T/f_new"; grep "^FAIL" "$T/designmd_base.out" | cut -d'|' -f1 | grep -v "prompts/list" | sort > "$T/f_base"
EXTRA=$(comm -23 "$T/f_new" "$T/f_base")
[ -z "$EXTRA" ] && echo "PASS rpc_designmd ($(tail -1 "$T/designmd.out" | cut -c1-40); baseline: $(tail -1 "$T/designmd_base.out" | cut -c1-40); same env-only FAILs: $(wc -l < "$T/f_new" | tr -d ' '))" || { echo "FAIL rpc_designmd — new failures vs baseline:"; echo "$EXTRA"; RC=1; }
echo "== node unit suites"
for n in 45 48 49 50 51 52 53; do node --experimental-default-type=module tests/test_tools$n.mjs > "$T/u$n.out" 2>&1 && echo "PASS test_tools$n ($(tail -1 "$T/u$n.out"))" || { echo "FAIL test_tools$n ($(tail -1 "$T/u$n.out"))"; RC=1; }; done
echo "logs: $T"; [ $RC = 0 ] && echo "ALL MCP UX LOCAL TESTS PASSED" || echo "MCP UX LOCAL TESTS FAILED"; exit $RC
