#!/usr/bin/env python3
"""UI components round 1: are the 8 styles of each component really different, and does dark differ from light?
The styles share one markup on purpose (it is the same component), so this measures what a style is allowed to change:
  pixels   mean grey-level difference of the web screenshots (480 px wide, common height) measured only where either shot has ink
           (pixels that differ from the page background); whole-page means were diluted by white space and could not be calibrated
  knobs    the style knobs (--c-bw, --c-line, --c-r, --c-sh, --c-tt, --c-fw, --c-ring …) that change shape, not colour: at least 2 must differ
A pair fails if pixels < MIN_PX or fewer than 2 knobs differ. Light vs dark must differ by at least MIN_PX too.
Calibration (7-Nov-2026): the same file shot twice scores 0.0; real style pairs measured 23 to 95 on the first run, so MIN_PX = 15.
usage: python3 tests/comp_distinct.py [out-comp dir]   → prints a table, exits 1 on any failure"""
import sys, os, re, itertools, json
from PIL import Image, ImageChops, ImageStat
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), "../ui-screens/out-comp")
STYLES = ["minimal", "editorial", "brutalist", "luxury", "playful", "corporate", "retro", "monochrome"]
MIN_PX = 15.0
comps = sorted({json.load(open(os.path.join(OUT, d, "meta.json")))["pattern"] for d in os.listdir(OUT) if os.path.isfile(os.path.join(OUT, d, "meta.json"))})
def img(p): im = Image.open(p).convert("RGB"); return im.resize((480, round(im.height * 480 / im.width)))
def ink(im): return ImageChops.difference(im, Image.new("RGB", im.size, im.getpixel((2, 2)))).convert("L").point(lambda v: 255 if v > 24 else 0)
def diff(a, b):
    h = min(a.height, b.height); a, b = a.crop((0, 0, 480, h)), b.crop((0, 0, 480, h))
    return ImageStat.Stat(ImageChops.difference(a, b).convert("L"), mask=ImageChops.lighter(ink(a), ink(b))).mean[0]
def knobs(t): return dict(re.findall(r"--c-([a-z]+):([^;]+);", t))
def css(p): return re.search(r'<style id="mgd-tokens">([\s\S]*?)</style>[\s\S]*?<style id="mgd-component-css">([\s\S]*?)</style>', open(p).read())
fails = 0
print(f"{'component':16} {'min pair':>9} {'(closest pair)':28} {'mean':>6} {'light/dark min':>15} {'min knobs':>10}")
for c in comps:
    ims = {s: img(os.path.join(OUT, f"{c}-web-{s}", "screen.png")) for s in STYLES}
    cs = {s: css(os.path.join(OUT, f"{c}-web-{s}", "index.html")) for s in STYLES}
    pairs = []
    for a, b in itertools.combinations(STYLES, 2):
        d = diff(ims[a], ims[b]); ka, kb = knobs(cs[a].group(1)), knobs(cs[b].group(1)); nk = sum(ka[k] != kb.get(k) for k in ka)
        pairs.append((d, a, b, nk))
        if d < MIN_PX or nk < 2: fails += 1; print(f"FAIL {c} {a}/{b}: pixels {d:.1f}, {nk} knobs differ")
    ld = min(diff(ims[s], img(os.path.join(OUT, f"{c}-web-{s}", "screen-dark.png"))) for s in STYLES)
    if ld < MIN_PX: fails += 1; print(f"FAIL {c} light/dark: {ld:.1f}")
    mn = min(pairs)
    print(f"{c:16} {mn[0]:9.1f} {mn[1] + '/' + mn[2]:28} {sum(p[0] for p in pairs) / len(pairs):6.1f} {ld:15.1f} {min(p[3] for p in pairs):10}")
print(f"{len(comps)} components, {len(comps) * 28} style pairs, {fails} failed (min {MIN_PX})")
sys.exit(1 if fails else 0)
