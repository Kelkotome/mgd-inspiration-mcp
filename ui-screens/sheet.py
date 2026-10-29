#!/usr/bin/env python3
"""Contact sheet of rendered screens. Usage: python3 sheet.py '<slug-glob>' out.png [width-per-web-shot]
Web shots are scaled to W (default 560), mobile shots to W*0.42; wraps 3 web / 7 mobile per row."""
import glob, sys
from PIL import Image
pat, out = sys.argv[1], sys.argv[2]
W = int(sys.argv[3]) if len(sys.argv) > 3 else 560
files = sorted(glob.glob(f"out/{pat}/screen.png"))
if not files: sys.exit("no matches")
ims = []
for f in files:
    im = Image.open(f).convert("RGB"); w = W if "-web-" in f else int(W * 0.42)
    ims.append(im.resize((w, int(im.height * w / im.width))))
rows, row, x, maxw = [], [], 0, W * 3 + 20
for im in ims:
    if row and x + im.width > maxw: rows.append(row); row, x = [], 0
    row.append(im); x += im.width + 10
rows.append(row)
H = sum(max(i.height for i in r) + 10 for r in rows)
S = Image.new("RGB", (maxw, H), "#777"); y = 0
for r in rows:
    x = 0
    for im in r: S.paste(im, (x, y)); x += im.width + 10
    y += max(i.height for i in r) + 10
S.save(out); print(out, S.size, len(files), "screens")
