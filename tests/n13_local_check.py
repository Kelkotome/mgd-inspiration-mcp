#!/usr/bin/env python3
"""Checks a local Worker after ingest: pattern pages, cards, item pages, raw html/md, kit panel. Usage: n13_local_check.py BASE pattern..."""
import json, re, sys, urllib.request
BASE, pats = sys.argv[1].rstrip("/"), sys.argv[2:]
seo = open("src/ui_seo.js").read()
def get(u):
    r = urllib.request.Request(u, headers={"User-Agent": "curl/8.4.0", "Accept": "*/*"})
    with urllib.request.urlopen(r, timeout=60) as x: return x.status, x.read().decode("utf-8", "replace")
fails = 0
def check(ok, msg):
    global fails
    if not ok: fails += 1; print("FAIL", msg)
for p in pats:
    slug, h1 = re.search(r'"%s": \["([^"]+)", "([^"]+)"\]' % re.escape(p), seo).groups()
    st, h = get(f"{BASE}/ui/{slug}")
    check(st == 200, f"{slug} status {st}")
    cards = re.findall(r'class="card (web|mobile) page"[^>]*href="([^"]+)"|href="([^"]+)"[^>]*class="card (web|mobile) page"', h)
    links = re.findall(r'<a class="card (?:web|mobile) page" href="([^"]+)"', h)
    check(len(links) == 16, f"{slug} cards {len(links)}")
    check(f"<h1>{h1}" in h or h1 in re.sub(r"<[^>]+>", "", (re.search(r"<h1.*?</h1>", h, re.S) or [""])[0] if re.search(r"<h1.*?</h1>", h, re.S) else ""), f"{slug} h1")
    t = re.search(r"<title>(.*?)</title>", h, re.S); check(t and "16 free" in t[1], f"{slug} title {t and t[1]}")
    print(p, "|", t and t[1])
    if not links: continue
    for rel in (links[0], links[-1]):
        u = rel if rel.startswith("http") else "http://127.0.0.1:" + BASE.split(":")[2].split("/")[0] + rel
        st, it = get(u)
        check(st == 200, f"item {u} {st}")
        check('class="kit"' in it or 'class="kit ' in it, f"kit panel missing {u}")
        m = re.search(r'/ui/raw/([0-9a-f]+)\.md', it)
        check(bool(m), f"no raw md link {u}")
        if m:
            st, md = get(f"{BASE}/ui/raw/{m[1]}.md"); check(st == 200 and md.startswith("---") and "colors:" in md, f"raw md {m[1]}")
            st, code = get(f"{BASE}/ui/raw/{m[1]}.html"); check(st == 200 and "<!doctype html>" in code.lower(), f"raw html {m[1]}")
print(f"local check: {len(pats)} patterns, {fails} failures")
sys.exit(1 if fails else 0)
