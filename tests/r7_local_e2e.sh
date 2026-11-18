#!/bin/bash
# MCP r7 (18-Nov-2026): the real workerd runtime (wrangler dev --local, throwaway D1 + R2, no routes, nothing remote) on a few seeded rows
# (FTS index built by migrate_fts.sql's triggers, as on live):
#   1. tests/r7_rpc.py --local: accent folding (Hammershoi/Hammershøi, Kobke, Bjorg, Muller, Dvorak, Rodenbach), get_ui_flow aliases and
#      suggestions, design_md plain text, barcode check digit, themes, intent hints
#   2. the earlier rounds' live suites on the same Worker: tests/fp6_rpc.py, tests/fp5_rpc.py, tests/r4_rpc.py --local
# Usage: bash tests/r7_local_e2e.sh   (env R7_PORT / R7_INSP, default 8977 / 9377; SCRATCH=<dir> for temp files)
set -u
cd "$(dirname "$0")/.."; ROOT=$(pwd); W="${WRANGLER:-$ROOT/node_modules/.bin/wrangler}"; PORT=${R7_PORT:-8977}; INSP=${R7_INSP:-9377}
T=$(mktemp -d "${SCRATCH:-$ROOT}/r7-e2e.XXXXXX"); CFG="$ROOT/wrangler.r7.jsonc"
python3 - <<'PY'
src = open("wrangler.jsonc").read(); i = src.index('"routes"'); j = src.index("]", i) + 1
open("wrangler.r7.jsonc", "w").write(src[:i] + '"routes": []' + src[j:])
PY
for p in $PORT $INSP; do lsof -ti tcp:$p -sTCP:LISTEN >/dev/null 2>&1 && { echo "refusing: port $p is in use by a process this script did not start"; rm -f "$CFG"; exit 2; }; done
cleanup() { [ -n "${DEVPID:-}" ] && { pkill -P "$DEVPID" 2>/dev/null; kill "$DEVPID" 2>/dev/null; sleep 1; lsof -ti tcp:$PORT -ti tcp:$INSP -sTCP:LISTEN 2>/dev/null | xargs kill 2>/dev/null; }; rm -f "$CFG"; cp "$T/dev.log" "${SCRATCH:-$ROOT}/r7-last-dev.log" 2>/dev/null; rm -rf "$T"; }
trap cleanup EXIT
D1() { "$W" d1 execute mgd-inspiration --local -c "$CFG" --persist-to "$T/state" "$@"; }
D1 --file=./schema.sql >>"$T/setup.log" 2>&1 || { tail -5 "$T/setup.log"; exit 1; }
D1 --command "ALTER TABLE items ADD COLUMN hue REAL" >>"$T/setup.log" 2>&1 || true
for f in migrate_category migrate_country migrate_featured migrate_rights migrate_srcurl migrate_annual migrate_mcp migrate_mcp_events migrate_mcp_events_err migrate_subscribers migrate_moodboards migrate_oauth migrate_boards_v2 migrate_boards_canvas migrate_feedidx migrate_ai_usage migrate_fts; do [ -f "$f.sql" ] && D1 --file=./$f.sql >>"$T/setup.log" 2>&1; done
P='[\"#1F3A4D\",\"#C9A77C\",\"#F6F1E7\",\"#3E4A3D\"]'
D1 --command "INSERT INTO items (id,title,description,source_url,source_host,image_key,tags,themes,palette,status,created_at,collection,company,report_year,designer,industry,country,category,style,width,height,owner_id) VALUES
 ('c0000000000a','Interior with a Woman at a Piano','Quiet grey interior.','https://open.smk.dk/1','open.smk.dk','museum/c0000000000a.jpg','[]','[]','$P','published',1700000001000,'museum','Statens Museum for Kunst',1901,'Vilhelm Hammershøi','Painting','Danish','painting',NULL,1200,900,NULL),
 ('c0000000000b','Portrait of the Artist''s Wife','Portrait.','https://open.smk.dk/2','open.smk.dk','museum/c0000000000b.jpg','[]','[]','$P','published',1700000002000,'museum','Statens Museum for Kunst',1836,'Christen Købke','Painting','Danish','painting',NULL,1000,1200,NULL),
 ('c0000000000c','Bjørg — Brand Guidelines','Organic food brand guide.','https://madegooddesigns.com/bjorg-brand-guidelines/','madegooddesigns.com','items/c0000000000c.png','[\"bjørg\",\"brand guidelines\"]','[\"branding\",\"brand-cover\"]','$P','published',1700000003000,'design','Bjørg',NULL,NULL,'food',NULL,NULL,'brand-cover',1200,900,NULL),
 ('c0000000000d','Antonín Dvořák festival poster','A concert poster with bold serif type.','https://example.org/dvorak','example.org','items/c0000000000d.png','[\"poster\",\"music\"]','[\"retro\"]','$P','published',1700000004000,'design',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1000,1400,NULL),
 ('c0000000000e','Rodenbach — Brand Guidelines','Flemish red ale brand guide.','https://madegooddesigns.com/rodenbach-brand-guidelines/','madegooddesigns.com','items/c0000000000e.png','[\"rodenbach\",\"beer\"]','[\"branding\",\"brand-cover\"]','$P','published',1700000005000,'design','Rodenbach',NULL,NULL,'beverage',NULL,NULL,'brand-cover',1200,900,NULL),
 ('c0000000000f','Müller poster','Swiss grid poster after Josef Müller-Brockmann.','https://example.org/muller','example.org','items/c0000000000f.png','[\"swiss\",\"grid\"]','[\"swiss\"]','$P','published',1700000006000,'design',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1000,1400,NULL),
 ('c00000000010','Nike — Brand Guidelines','Sportswear brand guide.','https://madegooddesigns.com/nike-brand-guidelines/','madegooddesigns.com','items/c00000000010.png','[\"nike\",\"font\"]','[\"branding\",\"brand-cover\"]','$P','published',1700000007000,'design','Nike',NULL,NULL,'sportswear',NULL,NULL,'brand-cover',1200,900,NULL),
 ('c00000000011','Poppins font specimen poster','A geometric sans specimen.','https://example.org/poppins','example.org','items/c00000000011.png','[\"font\",\"specimen\"]','[\"minimal\"]','$P','published',1700000008000,'design',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1000,1400,NULL),
 ('c00000000012','Materials marketplace website mockup','Marketplace for building materials.','https://example.org/materials','example.org','items/c00000000012.png','[\"marketplace\",\"materials\"]','[\"minimal\"]','$P','published',1700000009000,'design',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1440,900,NULL),
 ('c00000000013','Warm colour palette poster','A warm colour palette study.','https://example.org/warm','example.org','items/c00000000013.png','[\"colour palette\",\"warm\"]','[\"retro\"]','$P','published',1700000010000,'design',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1000,1400,NULL),
 ('c00000000014','Søstrene Grene — Typeface','Brand typography specimen.','https://madegooddesigns.com/sostrene-grene-brand-guidelines/','madegooddesigns.com','items/c00000000014.png','[\"søstrene grene\"]','[\"type-specimen\"]','$P','published',1700000011000,'design','Søstrene Grene',NULL,NULL,'retail',NULL,NULL,'type-specimen',1200,900,NULL),
 ('c00000000015','Müller AG 1928','Annual report cover.','https://archive.org/details/m1','archive.org','annual/c00000000015.jpg','[]','[]','$P','published',1700000012000,'annual-report','Müller AG',1928,NULL,'manufacturing','Germany',NULL,NULL,600,900,NULL),
 ('c00000000016','Retro diner sign','Retro lettering.','https://example.org/retro','example.org','items/c00000000016.png','[\"lettering\"]','[\"retro\",\"vintage\"]','$P','published',1700000013000,'design',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1000,1000,NULL)" >>"$T/setup.log" 2>&1 || { echo "seed failed"; tail -5 "$T/setup.log"; exit 1; }
# the r4 e2e's rows too, so tests/r4_rpc.py's facet-page checks have their museum / annual-report pages
D1 --command "INSERT INTO items (id,title,description,source_url,source_host,image_key,tags,themes,palette,status,created_at,collection,company,report_year,designer,industry,country,category,width,height,owner_id) VALUES
 ('aaaaaaaaaaa1','Federal Reserve Bank of Dallas 1926 Report to Stockholders','Annual report cover.','https://archive.org/details/x1','archive.org','annual/aaaaaaaaaaa1.jpg','[]','[]','[]','published',1700000001000,'annual-report','Federal Reserve Bank of Dallas',1926,NULL,'banking','United States',NULL,600,900,NULL),
 ('aaaaaaaaaaa2','Acme Transit 1972','Swiss grid cover.','https://archive.org/details/x2','archive.org','annual/aaaaaaaaaaa2.jpg','[]','[]','[]','published',1700000002000,'annual-report','Acme Transit',1972,'Paul Rand','transit','United States',NULL,640,880,NULL),
 ('bbbbbbbbbbb1','Vase with Lid','A covered vase.','https://museum.example/1','museum.example','museum/bbbbbbbbbbb1.jpg','[]','[]','[\"#112233\"]','published',1700000003000,'museum','The Metropolitan Museum of Art',1720,'Jan Brueghel the Elder','Vase','Greek','ceramics',1200,1500,NULL),
 ('bbbbbbbbbbb2','Second Vase','Another vase.','https://museum.example/2','museum.example','museum/bbbbbbbbbbb2.jpg','[]','[]','[]','published',1700000004000,'museum','The Metropolitan Museum of Art',1730,'Jan Brueghel the Elder','Vase','greek','ceramics',1000,800,NULL)" >>"$T/setup.log" 2>&1 || { echo "seed (r4 rows) failed"; tail -5 "$T/setup.log"; exit 1; }
"$W" dev --local -c "$CFG" --persist-to "$T/state" --port $PORT --inspector-port $INSP --show-interactive-dev-session=false > "$T/dev.log" 2>&1 &
DEVPID=$!; up=0; for i in $(seq 1 90); do curl -s -o /dev/null http://127.0.0.1:$PORT/inspiration/mcp && { up=1; break; }; sleep 1; done
[ $up = 1 ] || { echo "dev server did not start"; tail -20 "$T/dev.log"; exit 1; }
L=http://127.0.0.1:$PORT/inspiration
RC=0
n=$(D1 --json --command "SELECT COUNT(*) n FROM items_fts WHERE items_fts MATCH 'hammershøi'" 2>/dev/null | python3 -c "import json,sys; print(json.load(sys.stdin)[0]['results'][0]['n'])")
[ "$n" = 1 ] && echo "PASS FTS index has the seeded rows (hammershøi: $n)" || { echo "FAIL FTS index: hammershøi -> $n"; RC=1; }
python3 tests/r7_rpc.py "$L" --local > "$T/r7" 2>&1; grep -E '^FAIL|-> ' "$T/r7"; echo "r7_rpc: $(tail -1 "$T/r7")"; grep -q ' 0 failed$' "$T/r7" || RC=1
python3 tests/fp6_rpc.py "$L" > "$T/fp6" 2>&1; grep -E '^FAIL|-> ' "$T/fp6"; echo "fp6_rpc: $(tail -1 "$T/fp6")"; grep -q ' 0 failed$' "$T/fp6" || RC=1
python3 tests/fp5_rpc.py "$L" > "$T/fp5" 2>&1; grep -E '^FAIL|-> ' "$T/fp5"; echo "fp5_rpc: $(tail -1 "$T/fp5")"; grep -q ' 0 failed$' "$T/fp5" || RC=1
python3 tests/r4_rpc.py "$L" --local > "$T/r4" 2>&1; grep -E '^FAIL|-> ' "$T/r4"; echo "r4_rpc: $(tail -1 "$T/r4")"; grep -q ' 0 failed$' "$T/r4" || RC=1
[ $RC = 0 ] || tail -12 "$T/dev.log" | cut -c1-200
[ $RC = 0 ] && echo "mcp-r7 local e2e: all checks passed" || echo "mcp-r7 local e2e: FAILED"
exit $RC
