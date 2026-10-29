#!/usr/bin/env python3
"""Trim empty space below website sections so every style ends with the same padding.
Run after shoot.sh. Crops screen.png and screen-dark.png to the same height and updates meta.json viewport.h
(ingest reads it). Screens (type "screen") are never touched. Usage: python3 trim.py [slug-glob]"""
import glob, json, os, sys
from PIL import Image

PAD = {"web": 72, "mobile": 48}  # CSS px of space kept below the last content
SCALE = 2                        # shoot.sh renders at 2x

def content_bottom(path):
    im = Image.open(path).convert("RGB"); w, h = im.size; px = im.load()
    bg = px[w // 2, h - 2]; step = max(1, w // 120)
    for y in range(h - 1, 0, -1):
        if any(sum(abs(a - b) for a, b in zip(px[x, y], bg)) > 18 for x in range(0, w, step)):
            return y + 1
    return h

n = 0
for mp in sorted(glob.glob(f"out/{sys.argv[1] if len(sys.argv) > 1 else '*'}/meta.json")):
    d = os.path.dirname(mp); m = json.load(open(mp))
    if m["type"] != "section": continue
    shots = [p for p in (f"{d}/screen.png", f"{d}/screen-dark.png") if os.path.exists(p)]
    if not shots: continue
    h = Image.open(shots[0]).height
    new_h = min(h, max(content_bottom(p) for p in shots) + PAD[m["platform"]] * SCALE)
    new_h -= new_h % SCALE
    if h - new_h < 24 * SCALE: new_h = h  # already tight (or trimmed on an earlier run)
    else:
        for p in shots:
            im = Image.open(p); im.crop((0, 0, im.width, new_h)).save(p)
    if m["viewport"]["h"] == new_h // SCALE: continue
    m["viewport"]["h"] = new_h // SCALE  # gen.js rewrites meta.json, so always re-sync it to the image
    json.dump(m, open(mp, "w"), indent=2); n += 1
print(f"trimmed {n} sections")
