#!/usr/bin/env python3
"""Upload generated UI screens (out/<slug>/) to the inspiration Worker as collection 'ui'.
Usage: python3 ingest.py [--base http://127.0.0.1:8787] [--only GLOB] [--dry]
Admin token: ../.admin_token. Dedup: source_url = https://madegooddesigns.com/inspiration/ui#<slug>; upsert=1 refreshes an existing screen in place (same id). Sends screen-dark.png as image_dark when present."""
import argparse, fnmatch, io, json, os, sys, urllib.request, uuid
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "out")

STYLE = {
    "minimal": "Minimal style: cool neutrals, Inter, 8px corners and soft shadows.",
    "editorial": "Editorial style: warm paper tones, Instrument Serif headlines with Inter body text and tabular figures, square corners.",
    "brutalist": "Brutalist style: high contrast, Space Grotesk, uppercase headings, thick black borders and hard offset shadows.",
    "luxury": "Luxury style: muted gold and olive, Cormorant Garamond headlines with Manrope, wide-tracked uppercase labels, no shadows.",
    "playful": "Playful style: vivid purple, Fredoka headings with Nunito, pill buttons, rounded cards and soft shadows.",
    "corporate": "Corporate style: IBM Plex Sans, a dark brand-coloured sidebar, 4px corners and subtle shadows.",
    "retro": "Retro style: warm cream, soft Fraunces headings with DM Sans, outlined cards and offset colour shadows.",
    "monochrome": "Monochrome style: pure greyscale, Geist, black primary actions and flat surfaces.",
}

def post(base, token, fields, files):
    b = uuid.uuid4().hex
    body = io.BytesIO()
    for k, v in fields.items():
        body.write(f'--{b}\r\nContent-Disposition: form-data; name="{k}"\r\n\r\n'.encode()); body.write(v.encode()); body.write(b"\r\n")
    for k, (fn, data, ct) in files.items():
        body.write(f'--{b}\r\nContent-Disposition: form-data; name="{k}"; filename="{fn}"\r\nContent-Type: {ct}\r\n\r\n'.encode()); body.write(data); body.write(b"\r\n")
    body.write(f"--{b}--\r\n".encode())
    req = urllib.request.Request(base.rstrip("/") + "/api/items", data=body.getvalue(), method="POST",
        headers={"Authorization": "Bearer " + token, "Content-Type": f"multipart/form-data; boundary={b}", "User-Agent": "curl/8.4.0", "Accept": "*/*"})
    with urllib.request.urlopen(req, timeout=120) as r:
        return json.loads(r.read())

def fields_for(slug, flow_tags):
    d = os.path.join(OUT, slug)
    m = json.load(open(os.path.join(d, "meta.json")))
    name, shows, elements = m["name"], m["shows"], m["elements"]
    kind = "section" if m["type"] == "section" else "screen"
    plat = ("website" if m["platform"] == "web" else "mobile website") if kind == "section" else ("web app" if m["platform"] == "web" else "mobile app")
    title = f"{name} — {m['platform']}, {m['style']} ({m['product']})"
    desc = (f"{name} {kind} for a {plat}, designed for {m['product']}, a fictional {m['category']} product. "
            f"Shows {shows}. {STYLE[m['style']]} Comes with the full HTML and a DESIGN.md with light and dark colour tokens.")
    roles = ["background", "surface", "border", "text", "muted", "primary", "on-primary", "accent"]
    tags = [m["pattern"], m["platform"], m["category"]] + [e for e in elements if e not in (m["pattern"], m["platform"])]
    tags += ([f"variant:{m['variant']}"] if m.get("variant") else []) + flow_tags.get(slug, [])
    def webp(fn):
        p = os.path.join(d, fn)
        if not os.path.isfile(p): return None
        buf = io.BytesIO(); Image.open(p).convert("RGB").save(buf, "WEBP", quality=84, method=6); return buf.getvalue()
    return {"collection": "ui", "skip_enrich": "1", "upsert": "1", "title": title, "description": desc, "style": m["style"],
            "themes": json.dumps([m["style"]]), "tags": json.dumps(tags), "palette": json.dumps([m["tokens"]["light"][r] for r in roles]),
            "category": m["pattern"], "country": m["platform"], "industry": m["category"], "company": m["product"], "designer": "Made Good Designs",
            "source_url": f"https://madegooddesigns.com/inspiration/ui#{slug}", "width": str(m["viewport"]["w"]), "height": str(m["viewport"]["h"]),
            "code_html": open(os.path.join(d, "index.html")).read(), "design_md": open(os.path.join(d, "DESIGN.md")).read()}, webp("screen.png"), webp("screen-dark.png")

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--base", default="https://madegooddesigns.com/inspiration")
    ap.add_argument("--only", default="*")
    ap.add_argument("--workers", type=int, default=4)
    ap.add_argument("--dry", action="store_true")
    a = ap.parse_args()
    token = open(os.path.join(HERE, "..", ".admin_token")).read().strip()
    slugs = sorted(d for d in os.listdir(OUT) if os.path.isfile(os.path.join(OUT, d, "meta.json")) and os.path.isfile(os.path.join(OUT, d, "screen.png")) and fnmatch.fnmatch(d, a.only))
    flow_tags = {}
    fp = os.path.join(OUT, "flows.json")
    for f in (json.load(open(fp)) if os.path.isfile(fp) else []):
        for n, sl in enumerate(f["steps"], 1):
            t = f"flow:{f['id']}:{n}"
            if t not in flow_tags.setdefault(sl, []): flow_tags[sl].append(t)
    def one(slug):
        fields, img, dark = fields_for(slug, flow_tags)
        if a.dry: return slug, "dry", f"{len(img)//1024}KB {fields['title']}"
        for attempt in range(3):
            try:
                files = {"image": (slug + ".webp", img, "image/webp")}
                if dark: files["image_dark"] = (slug + "-dark.webp", dark, "image/webp")
                r = post(a.base, token, fields, files)
                return slug, ("updated" if r.get("updated") else "added" if r.get("ok") else "dup" if r.get("duplicate") else "FAIL"), r.get("item", {}).get("id") or r
            except Exception as e:
                err = e
        return slug, "FAIL", err
    from concurrent.futures import ThreadPoolExecutor
    counts = {}
    with ThreadPoolExecutor(max_workers=a.workers) as ex:
        for slug, st, info in ex.map(one, slugs):
            counts[st] = counts.get(st, 0) + 1
            if st in ("FAIL", "dry") or len(slugs) <= 40: print(st, slug, info)
    print("done:", counts)
    sys.exit(1 if counts.get("FAIL") else 0)

if __name__ == "__main__":
    main()
