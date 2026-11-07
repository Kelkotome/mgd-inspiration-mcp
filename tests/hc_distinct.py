#!/usr/bin/env python3
"""Page test, part one: are a niche's designs really different? Style and palette swaps must not count.
Two measures for every pair in a niche:
  tree   similarity of the tag tree of <body> (1.0 = same markup)
  layout Jaccard overlap of where content sits at 1280 px, from wp-export/layoutmap.mjs
A pair fails if the bodies match, or tree >= 0.90, or layout >= 0.60.
Calibration, 7-Nov-2026: re-skins of one design (same body, different style) score layout 0.640 to 0.936 and tree 1.0, and the control block below must keep
failing. An edge-map measure was tried first and dropped: a re-skin scored 0.075 against 0.068 for real pairs, so it could not tell them apart.
usage: hc_distinct.py <maps.json> > distinct.json"""
import sys, json, itertools, hashlib, difflib, collections, os
from html.parser import HTMLParser
maps = json.load(open(sys.argv[1]))
UI = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../ui-screens"); MAIN = os.path.abspath(os.path.join(UI, "../../mgd-inspiration/ui-screens/out"))
VOID = {"meta", "link", "br", "hr", "img", "input", "source", "area", "col", "wbr"}
class P(HTMLParser):
    def __init__(s): super().__init__(); s.seq = []; s.d = 0; s.on = False; s.svg = 0
    def handle_starttag(s, t, a):
        if t == "body": s.on = True; return
        if not s.on or t in ("style", "script"): return
        if s.svg or t == "svg":
            if t == "svg": s.svg += 1
            return
        if s.d <= 6: s.seq.append(f"{s.d}{t}")
        if t not in VOID: s.d += 1
    def handle_endtag(s, t):
        if t == "svg": s.svg = max(0, s.svg - 1); return
        if s.on and not s.svg and t not in VOID and t != "body": s.d = max(0, s.d - 1)
def tree(html): p = P(); p.feed(html); return p.seq
cells = lambda m: {(y, x) for y, r in enumerate(m["g"]) for x, c in enumerate(r) if c == "1"}
jac = lambda a, b: len(a & b) / len(a | b)
SIG = {"cardiology": "minimal", "medical": "editorial", "dental": "corporate", "dermatology": "luxury", "therapist": "retro", "physical-therapy": "brutalist", "veterinary": "playful", "pediatrics": "monochrome", "orthodontics": "corporate", "fertility": "luxury"}
def src(n, v):
    if v == "homepage": return f"{MAIN}/{n}-website-homepage-web-{SIG[n]}/index.html"
    d = [x for x in os.listdir(f"{UI}/out-hc") if x.startswith(f"{n}-website-{v}-web-")][0]; return f"{UI}/out-hc/{d}/index.html"
by = collections.defaultdict(list)
for k in maps:
    n, v = k.split("/", 1)
    if n != "control": by[n].append(v)
out = {}
for n, vs in sorted(by.items()):
    data = {}
    for v in vs:
        s = open(src(n, v)).read(); b = s[s.find("<body"):]; data[v] = (tree(s), hashlib.sha1(b.encode()).hexdigest(), cells(maps[f"{n}/{v}"]))
    fails = []; mt = ml = 0
    for a, b in itertools.combinations(vs, 2):
        t = difflib.SequenceMatcher(None, data[a][0], data[b][0], autojunk=False).ratio(); l = jac(data[a][2], data[b][2]); mt = max(mt, t); ml = max(ml, l)
        if data[a][1] == data[b][1] or t >= 0.90 or l >= 0.60: fails.append({"a": a, "b": b, "tree": round(t, 3), "layout": round(l, 3)})
    keep = list(vs)
    for f in fails:
        if f["a"] in keep and f["b"] in keep: keep.remove(f["b"])
    out[n] = {"designs": len(vs), "distinct": len(keep), "distinctIds": keep, "maxTreeSimilarity": round(mt, 3), "maxLayoutOverlap": round(ml, 3), "failedPairs": fails}
    print(f"{n:18} designs {len(vs)} distinct {len(keep)} maxTree {mt:.3f} maxLayout {ml:.3f}", file=sys.stderr)
ctl = [k for k in maps if k.startswith("control/")]
cc = {k: cells(maps[k]) for k in ctl}; seen = [jac(cc[a], cc[b]) for a, b in itertools.combinations(ctl[:4], 2)] + [jac(cc[ctl[4]], cc[ctl[5]])]
print(f"control re-skins layout {min(seen):.3f} to {max(seen):.3f}", file=sys.stderr)
if min(seen) < 0.60: print("CONTROL FAILED: a re-skin scored under the threshold", file=sys.stderr); sys.exit(1)
print(json.dumps(out, indent=1))
