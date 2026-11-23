#!/bin/bash
# Templates r5 local build after gen_hc + shoot/trim: distinct -> themes -> install test (Playground on :9400, scripts/pg) -> negatives -> catalog. Local only.
set -u; cd "$(dirname "$0")/.."; Z=${R5_ZIPS:-/private/tmp/claude-501/-Users-eugeneleow-Downloads-EtiennAubertBonn/b42554e5-5d05-4d3c-8438-417a1b99f394/scratchpad/r5/pgwd/zips}; N=construction,plumber,electrician,roofing,hvac,cleaning-service,landscaping,pest-control
node ui-screens/wp-export/layoutmap.mjs maps.json | tail -1 && python3 tests/hc_distinct.py maps.json > ui-screens/hc/distinct-cn-2026-11-23.json || exit 1
rm -f "$Z"/mgd-[a-z]*-*.zip; rm -rf ui-screens/out-wp; node ui-screens/wp-export/batch.mjs --only $N --zips "$Z" | tail -1 || exit 1
TMPDIR=/private/tmp/claude-501/-Users-eugeneleow-Downloads-EtiennAubertBonn/b42554e5-5d05-4d3c-8438-417a1b99f394/scratchpad/r5 zsh ui-screens/wp-export/negative.sh "$PWD/ui-screens/out-wp/mgd-plumber-dispatch" "$Z" | tail -1
SL=$(ls ui-screens/out-wp/*.zip | xargs -n1 basename | sed 's/\.zip$//')
node ui-screens/wp-export/installtest.mjs --base http://127.0.0.1:9400 --out ui-screens/out-wp/_r0.jsonl --shots ui-screens/out-wp/_wpshots $SL
node ui-screens/wp-export/installtest.mjs --base http://127.0.0.1:9400 --out ui-screens/out-wp/_neg.jsonl mgd-neg-block mgd-neg-overflow mgd-neg-external mgd-neg-php mgd-neg-layout
node ui-screens/wp-export/build_catalog.mjs ui-screens/hc/distinct-cn-2026-11-23.json src/tpl_catalog.json
echo R5_BUILD_DONE
