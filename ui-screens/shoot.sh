#!/bin/bash
# Screenshot out/<slug>/index.html at its viewport (2x) with Playwright's cached headless Chromium, 6 in parallel.
# Usage: ./shoot.sh [slug-glob]
cd "$(dirname "$0")"
export CH=$(ls -d ~/Library/Caches/ms-playwright/chromium_headless_shell-*/*/chrome-headless-shell | tail -1)
one() {
  d="out/$1"; read w h < <(python3 -c "import json;v=json.load(open('$d/meta.json'))['viewport'];print(v['w'],v['h'])")
  "$CH" --headless --hide-scrollbars --force-device-scale-factor=2 --window-size=$w,$h --user-data-dir="$(mktemp -d)" \
    --virtual-time-budget=6000 --screenshot="$PWD/$d/screen.png" "file://$PWD/$d/index.html" >/dev/null 2>&1 && echo "ok $1" || echo "FAIL $1"
}
export -f one
for d in out/${1:-*}/; do [ -f "$d/meta.json" ] && basename "$d"; done | xargs -P 6 -I{} bash -c 'one {}'
