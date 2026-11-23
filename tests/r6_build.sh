#!/bin/bash
# Templates r6 local build after gen_hc + shoot/trim + distinct + batch (themes): install test (Playground on :9400) -> negatives -> catalog. Local only.
set -u; cd "$(dirname "$0")/.."; Z=${R6_ZIPS:-/private/tmp/claude-501/-Users-eugeneleow-Downloads-EtiennAubertBonn/a3712ba7-c926-4096-92f6-0b6f94a50530/scratchpad/r6/pgwd/zips}
[ -d "$Z/mgd-neg-block" ] || ls "$Z"/mgd-neg-*.zip >/dev/null 2>&1 && echo "negatives already built" || TMPDIR=${R6_TMP:-/private/tmp/claude-501/-Users-eugeneleow-Downloads-EtiennAubertBonn/a3712ba7-c926-4096-92f6-0b6f94a50530/scratchpad/r6} zsh ui-screens/wp-export/negative.sh "$PWD/ui-screens/out-wp/mgd-lawyer-concierge" "$Z" | tail -1
SL=$(ls ui-screens/out-wp/*.zip | xargs -n1 basename | sed 's/\.zip$//')
node ui-screens/wp-export/installtest.mjs --base http://127.0.0.1:9400 --out ui-screens/out-wp/_r0.jsonl --shots ui-screens/out-wp/_wpshots $SL
node ui-screens/wp-export/installtest.mjs --base http://127.0.0.1:9400 --out ui-screens/out-wp/_neg.jsonl mgd-neg-block mgd-neg-overflow mgd-neg-external mgd-neg-php mgd-neg-layout
node ui-screens/wp-export/build_catalog.mjs ui-screens/hc/distinct-ps-2026-11-24.json src/tpl_catalog.json
echo R6_BUILD_DONE
