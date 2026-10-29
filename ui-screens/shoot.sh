#!/bin/bash
# Screenshot out/<slug>/index.html at its viewport (2x) with Playwright's cached headless Chromium, 6 in parallel.
# Writes screen.png (light) and screen-dark.png (dark; the HTML switches on prefers-color-scheme). Set THEMES=light to skip dark.
# Usage: ./shoot.sh [slug-glob]
cd "$(dirname "$0")"
export CH=$(ls -d ~/Library/Caches/ms-playwright/chromium_headless_shell-*/*/chrome-headless-shell | tail -1) THEMES=${THEMES:-light dark}
one() {
  d="out/$1"; read w h < <(python3 -c "import json;v=json.load(open('$d/meta.json'))['viewport'];print(v['w'],v['h'])")
  for t in $THEMES; do
    [ $t = dark ] && pcs=0 out=screen-dark.png || { pcs=1; out=screen.png; }
    "$CH" --headless --hide-scrollbars --force-device-scale-factor=2 --window-size=$w,$h --user-data-dir="$(mktemp -d)" --blink-settings=preferredColorScheme=$pcs \
      --virtual-time-budget=6000 --screenshot="$PWD/$d/$out" "file://$PWD/$d/index.html" >/dev/null 2>&1 || { echo "FAIL $1 $t"; return; }
  done; echo "ok $1"
}
export -f one
for d in out/${1:-*}/; do [ -f "$d/meta.json" ] && basename "$d"; done | xargs -P 6 -I{} bash -c 'one {}'
