#!/bin/bash
# Puts every theme zip and screenshot in R2 under tpl/wordpress/. NOT RUN during the build: part of the deploy, see deploy-bundle-2026-11-07/healthcare.md. Writes to the live bucket.
# Run from the worktree root after build_catalog.mjs. Requires --yes-live, so it cannot run by accident. Set DRY=1 to print the commands.
[ "$1" = "--yes-live" ] || [ -n "$DRY" ] || { echo "refusing: pass --yes-live, or DRY=1 to preview"; exit 2; }
cd "$(dirname "$0")/../.."; BUCKET=$(python3 -c "import re;print(re.search(r'\"bucket_name\"\s*:\s*\"([^\"]+)\"',open('wrangler.jsonc').read()).group(1))"); R=ui-screens/out-wp/_r2; n=0
cd "$R" && find tpl -type f | sort | while read -r f; do case "$f" in *.zip) ct=application/zip;; *) ct=image/webp;; esac
  cmd=(npx wrangler r2 object put "$BUCKET/$f" --file "$R/$f" --content-type "$ct" --remote)
  if [ -n "$DRY" ]; then echo "${cmd[*]}"; else (cd ../../.. && "${cmd[@]}" >/dev/null) || { echo "FAILED $f"; exit 1; }; fi
  n=$((n+1)); done || { echo "upload stopped: not every file reached R2"; exit 1; }; echo done   # the loop runs in a pipe subshell, so its exit 1 must be passed on (7-Nov-2026: a failed put used to print done and exit 0)
