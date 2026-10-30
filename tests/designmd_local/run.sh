#!/bin/bash
# Local-only: seed a throwaway D1/R2 from a read-only sample of live, run wrangler dev on :8796, run tests/rpc_designmd.py.
# Never deploys, never writes remote. Usage: bash tests/designmd_local/run.sh   (STATE_DIR to reuse a seed; DESIGNMD_CLI optional)
set -u
cd "$(dirname "$0")/../.."; ROOT=$(pwd); export STATE_DIR="${STATE_DIR:-/tmp/mgd-designmd-test}"; S="$STATE_DIR"
[ -f "$S/seed.sql" ] || python3 tests/designmd_local/seed.py || exit 1
rm -rf "$S/state"
D1() { npx wrangler d1 execute mgd-inspiration --local -c "$S/wrangler.jsonc" --persist-to "$S/state" "$@" >/dev/null 2>>"$S/setup.err"; }
D1 --file="$S/schema.sql" && D1 --file="$S/seed.sql" || { tail -5 "$S/setup.err"; exit 1; }
# R2: the regenerated DESIGN.md for every seeded UI screen (needs ui-screens/out from `regen_design_md.py gen`)
(cd ui-screens && REGEN_DATE=localtest python3 regen_design_md.py upload --local "$S/state" | tail -1) || exit 1
npx wrangler dev --local -c "$S/wrangler.jsonc" --persist-to "$S/state" --port 8796 --inspector-port 9246 --show-interactive-dev-session=false > "$S/dev.log" 2>&1 & PID=$!
trap 'kill $PID 2>/dev/null; wait $PID 2>/dev/null' EXIT
for i in $(seq 1 60); do curl -s -o /dev/null http://localhost:8796/inspiration/mcp && break; sleep 1; done
python3 tests/rpc_designmd.py --base http://localhost:8796 --baseline "$S/live_tools.json"
