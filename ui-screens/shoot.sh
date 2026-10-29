#!/bin/bash
# Screenshot every out/<slug>/index.html at its viewport (2x) with Playwright's cached headless Chromium.
# Usage: ./shoot.sh [slug-glob]
cd "$(dirname "$0")"
CH=$(ls -d ~/Library/Caches/ms-playwright/chromium_headless_shell-*/*/chrome-headless-shell | tail -1)
for d in out/${1:-*}/; do
  s=$(basename "$d"); [ -f "$d/meta.json" ] || continue
  w=$(python3 -c "import json;print(json.load(open('$d/meta.json'))['viewport']['w'])")
  h=$(python3 -c "import json;print(json.load(open('$d/meta.json'))['viewport']['h'])")
  "$CH" --headless --hide-scrollbars --force-device-scale-factor=2 --window-size=$w,$h \
    --virtual-time-budget=6000 --screenshot="$PWD/$d/screen.png" "file://$PWD/$d/index.html" >/dev/null 2>&1 \
    && echo "ok $s" || echo "FAIL $s"
done
