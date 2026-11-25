#!/bin/bash
# Templates r9 (travel and hotels, staged) local build after gen_hc + shoot/trim + distinct + batch (themes): install test (Playground on :9400) -> negatives -> catalog. Local only.
# Playground: NODE_OPTIONS=--dns-result-order=ipv4first wp-playground-cli server --port=9400 --wp=7.1.4 --php=8.3 --login --mount=<zips>:/zips --mount=<dir with mgdt-harness.php>:/wordpress/wp-content/mu-plugins
set -u; cd "$(dirname "$0")/.."; Z=${R9_ZIPS:?set R9_ZIPS to the zips dir mounted at /zips}
ls "$Z"/mgd-neg-*.zip >/dev/null 2>&1 && echo "negatives already built" || TMPDIR=${R9_TMP:-$(dirname "$Z")} zsh ui-screens/wp-export/negative.sh "$PWD/ui-screens/out-wp/mgd-tourism-ledger" "$Z" | tail -1
SL=$(ls ui-screens/out-wp/*.zip | xargs -n1 basename | sed 's/\.zip$//')
node ui-screens/wp-export/installtest.mjs --base http://127.0.0.1:9400 --out ui-screens/out-wp/_r0.jsonl --shots ui-screens/out-wp/_wpshots $SL
node ui-screens/wp-export/installtest.mjs --base http://127.0.0.1:9400 --out ui-screens/out-wp/_neg.jsonl mgd-neg-block mgd-neg-overflow mgd-neg-external mgd-neg-php mgd-neg-layout
node ui-screens/wp-export/build_catalog.mjs ui-screens/hc/distinct-tr-2026-11-25.json src/tpl_catalog.json
echo R9_BUILD_DONE
