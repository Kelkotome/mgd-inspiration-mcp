#!/bin/bash
# mcp-img-r1 (27-Nov-2026): pictures + MCP Apps gallery on the real workerd runtime (wrangler dev --local, throwaway D1 + R2 under a
# temp dir, no routes, nothing remote). Two runs on separate state:
#   a) with the Images binding (miniflare's local Images, sharp): big originals become <= 60 KB JPEG thumbnails, stored to thumb/…
#   b) without it (binding removed from the config): only originals already <= 60 KB become image blocks; nothing fails
# Each run: tests/img/img_rpc.py (text leads with our page, no outbound museum URLs, <= 3 valid image blocks, structuredContent,
# resources/list + read, old clients still get text + images, cache repeat, thumbnail route).
# Usage: bash tests/img_local_e2e.sh   (env IMG_PORT / IMG_INSP, default 8981 / 9381; SCRATCH=<dir> for temp files)
set -u
cd "$(dirname "$0")/.."; ROOT=$(pwd); W="${WRANGLER:-$ROOT/node_modules/.bin/wrangler}"; PORT=${IMG_PORT:-8981}; INSP=${IMG_INSP:-9381}
T=$(mktemp -d "${SCRATCH:-${TMPDIR:-/tmp}}/img-e2e.XXXXXX")
python3 - "$T" <<'PY'
import re, sys
T = sys.argv[1]
src = open("wrangler.jsonc").read(); i = src.index('"routes"'); j = src.index("]", i) + 1
a = src[:i] + '"routes": []' + src[j:]
open(f"{T}/wrangler.a.jsonc", "w").write(a.replace('"main": "src/index.js"', f'"main": "{__import__("os").getcwd()}/src/index.js"'))
b = re.sub(r'"images":\s*\{[^}]*\},', "", a)
assert '"images"' not in b
open(f"{T}/wrangler.b.jsonc", "w").write(b.replace('"main": "src/index.js"', f'"main": "{__import__("os").getcwd()}/src/index.js"'))
PY
for p in $PORT $INSP; do lsof -ti tcp:$p -sTCP:LISTEN >/dev/null 2>&1 && { echo "refusing: port $p is in use"; exit 2; }; done
cleanup() { [ -n "${DEVPID:-}" ] && { pkill -P "$DEVPID" 2>/dev/null; kill "$DEVPID" 2>/dev/null; sleep 1; lsof -ti tcp:$PORT -ti tcp:$INSP -sTCP:LISTEN 2>/dev/null | xargs kill 2>/dev/null; }; DEVPID=; }
trap 'cleanup; cp "$T"/dev.*.log "${SCRATCH:-$ROOT}/" 2>/dev/null; rm -rf "$T"' EXIT
node tests/img/make_fixtures.mjs "$T/fx" > "$T/fx.log" 2>&1 || { cat "$T/fx.log"; exit 1; }

seed() { # $1 = a|b
  local CFG="$T/wrangler.$1.jsonc" ST="$T/state.$1"
  D1() { "$W" d1 execute mgd-inspiration --local -c "$CFG" --persist-to "$ST" "$@"; }
  D1 --file=./schema.sql >>"$T/setup.log" 2>&1 || { tail -5 "$T/setup.log"; return 1; }
  D1 --command "ALTER TABLE items ADD COLUMN hue REAL" >>"$T/setup.log" 2>&1 || true
  for f in migrate_category migrate_country migrate_featured migrate_rights migrate_srcurl migrate_annual migrate_mcp migrate_mcp_events migrate_mcp_events_err migrate_subscribers migrate_moodboards migrate_oauth migrate_boards_v2 migrate_boards_canvas migrate_feedidx migrate_ai_usage migrate_fts; do [ -f "$f.sql" ] && D1 --file=./$f.sql >>"$T/setup.log" 2>&1; done
  P='[\"#1F3A4D\",\"#C9A77C\",\"#F6F1E7\",\"#3E4A3D\"]'
  D1 --command "INSERT INTO items (id,title,description,source_url,source_host,image_key,tags,themes,palette,status,created_at,collection,company,report_year,designer,industry,country,category,width,height,owner_id) VALUES
   ('aaaaaaaaaaa2','Acme Transit 1972','Swiss grid cover for a transit authority.','https://archive.org/details/x2','archive.org','annual/aaaaaaaaaaa2.jpg','[\"grid\"]','[\"corporate\"]','$P','published',1700000002000,'annual-report','Acme Transit',1972,'Paul Rand','transit','United States',NULL,300,400,NULL),
   ('aaaaaaaaaaa3','Metro Transit 1965','Bold transit report.','https://archive.org/details/x3','archive.org','annual/aaaaaaaaaaa3.jpg','[\"bold\"]','[\"corporate\"]','$P','published',1700000003000,'annual-report','Metro Transit',1965,NULL,'transit','Canada',NULL,900,1200,NULL),
   ('bbbbbbbbbbb1','Vase with Lid','A covered vase with painted flowers.','https://www.metmuseum.org/art/collection/search/1','metmuseum.org','museum/bbbbbbbbbbb1.jpg','[\"vase\"]','[]','$P','published',1700000003000,'museum','The Metropolitan Museum of Art',1720,'Jan Brueghel the Elder','Vase','Greek','ceramics',900,1200,NULL),
   ('bbbbbbbbbbb2','Second Vase','Another vase.','https://museum.example/2','museum.example','museum/bbbbbbbbbbb2.jpg','[\"vase\"]','[]','$P','published',1700000004000,'museum','Statens Museum for Kunst',1730,NULL,'Vase','Danish','ceramics',300,400,NULL),
   ('c0000000000d','Festival poster','A concert poster with bold serif type.','https://example.org/d','example.org','items/c0000000000d.png','[\"poster\",\"music\"]','[\"retro\"]','$P','published',1700000004000,'design',NULL,NULL,NULL,NULL,NULL,NULL,800,1000,NULL),
   ('c0000000000f','Swiss grid poster','Swiss grid poster.','https://example.org/f','example.org','items/c0000000000f.png','[\"poster\",\"grid\"]','[\"retro\"]','$P','published',1700000006000,'design',NULL,NULL,NULL,NULL,NULL,NULL,240,300,NULL),
   ('c00000000016','Retro diner sign poster','Retro lettering poster.','https://example.org/r','example.org','items/c00000000016.png','[\"lettering\",\"poster\"]','[\"retro\",\"vintage\"]','$P','published',1700000013000,'design',NULL,NULL,NULL,NULL,NULL,NULL,800,1000,NULL)" >>"$T/setup.log" 2>&1 || { echo "seed failed"; tail -5 "$T/setup.log"; return 1; }
  # a non-commercial link-only annual report (MCP-only opt-in): must stay out of the gallery
  D1 --command "INSERT INTO items (id,title,description,source_url,source_host,image_key,tags,themes,palette,status,created_at,collection,company,report_year,industry,country,width,height,owner_id,hosting,image_url,rights,rights_holder) VALUES
   ('ddddddddddd1','Bayerische Hypotheken-Bank 1912','Bank report.','https://digipress.example/1','digipress.example','link/ddddddddddd1','[\"bank\"]','[]','[]','mcp-nc',1700000020000,'annual-report','Bayerische Hypotheken-Bank',1912,'bank','Germany',600,900,NULL,'link','https://digipress.example/1.jpg','CC BY-NC-SA 4.0','Bavarian State Library')" >>"$T/setup.log" 2>&1 || echo "note: link-only row not seeded (schema has no hosting/rights columns)"
  R2() { "$W" r2 object put "mgd-inspiration-images/$1" --local -c "$CFG" --persist-to "$ST" --file "$2" >>"$T/setup.log" 2>&1; }
  R2 annual/aaaaaaaaaaa2.jpg "$T/fx/annual_small.jpg" && R2 annual/aaaaaaaaaaa3.jpg "$T/fx/museum_big.jpg" && R2 museum/bbbbbbbbbbb1.jpg "$T/fx/museum_big.jpg" &&
  R2 museum/bbbbbbbbbbb2.jpg "$T/fx/annual_small.jpg" && R2 items/c0000000000d.png "$T/fx/design_a.png" && R2 items/c0000000000f.png "$T/fx/design_b.png" &&
  R2 items/c00000000016.png "$T/fx/design_a.png" || { echo "r2 seed failed"; tail -5 "$T/setup.log"; return 1; }
}

RC=0
for M in a b; do
  echo "-- run $M ($([ $M = a ] && echo 'Images binding' || echo 'no Images binding'))"
  seed $M || exit 1
  "$W" dev --local -c "$T/wrangler.$M.jsonc" --persist-to "$T/state.$M" --port $PORT --inspector-port $INSP --show-interactive-dev-session=false > "$T/dev.$M.log" 2>&1 &
  DEVPID=$!; up=0; for i in $(seq 1 90); do curl -s -o /dev/null http://127.0.0.1:$PORT/inspiration/mcp && { up=1; break; }; sleep 1; done
  [ $up = 1 ] || { echo "dev server did not start"; tail -20 "$T/dev.$M.log"; exit 1; }
  python3 tests/img/img_rpc.py http://127.0.0.1:$PORT/inspiration --mode $M > "$T/rpc.$M" 2>&1; grep -E '^FAIL|^sizes' "$T/rpc.$M"; echo "img_rpc ($M): $(tail -1 "$T/rpc.$M")"; grep -q ' 0 failed$' "$T/rpc.$M" || RC=1
  if [ $M = a ]; then  # the resized thumbnail was stored back to R2 (local)
    "$W" r2 object get "mgd-inspiration-images/thumb/museum/bbbbbbbbbbb1.jpg.jpg" --local -c "$T/wrangler.a.jsonc" --persist-to "$T/state.a" --file "$T/thumb.jpg" >/dev/null 2>&1
    sz=$(wc -c < "$T/thumb.jpg" 2>/dev/null || echo 0); [ "$sz" -gt 0 ] && [ "$sz" -le 61440 ] && echo "PASS thumb stored to R2 thumb/ ($sz bytes)" || { echo "FAIL thumb not stored to R2 ($sz)"; RC=1; }
  fi
  cleanup
done
[ $RC = 0 ] && echo "mcp-img-r1 local e2e: all checks passed" || echo "mcp-img-r1 local e2e: FAILED"
exit $RC
