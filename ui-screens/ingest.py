#!/usr/bin/env python3
"""Upload generated UI screens (out/<slug>/) to the inspiration Worker as collection 'ui'.
Usage: python3 ingest.py [--base http://127.0.0.1:8787] [--only GLOB] [--dry]
Admin token: ../.admin_token. Dedup: source_url = https://madegooddesigns.com/inspiration/ui#<slug> (the Worker skips duplicates)."""
import argparse, fnmatch, io, json, os, sys, urllib.request, uuid
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "out")

# What each pattern shows (elements double as search tags).
PATTERN = {
    "dashboard": ("Analytics dashboard", "KPI cards, a revenue area chart, a weekly bar chart and a recent-customers table",
                  ["sidebar-nav", "top-nav", "search-bar", "card", "chart", "table", "badge", "avatar", "kpi"]),
    "billing-plans": ("Billing and plans settings", "the current plan summary, seat usage, a monthly/yearly toggle, plan cards and invoices",
                      ["sidebar-nav", "breadcrumbs", "plan-cards", "billing-toggle", "table", "badge", "progress", "settings"]),
    "login": ("Login / sign-in", "Google sign-in, email and password fields, a keep-me-signed-in checkbox and a testimonial panel",
              ["form", "input", "button", "checkbox", "social-login", "testimonial", "auth"]),
    "chat-ai-assistant": ("AI chat assistant", "a conversation history sidebar, user and assistant messages with cited sources, a typing indicator and a composer",
                          ["chat-bubbles", "sidebar-nav", "composer", "attachments", "typing-indicator", "badge", "ai"]),
    "empty-state": ("Empty state (inbox zero)", "an illustration, a friendly message, a primary 'New task' action and a secondary action",
                    ["empty-illustration", "sidebar-nav", "tabs", "search-bar", "button", "inbox"]),
    "pricing": ("Pricing section", "a header, a headline, three plan tiers with a highlighted most-popular plan and feature checklists",
                ["navigation-header", "plan-cards", "badge", "button", "checklist", "marketing", "landing-page"]),
}
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

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--base", default="https://madegooddesigns.com/inspiration")
    ap.add_argument("--only", default="*")
    ap.add_argument("--dry", action="store_true")
    a = ap.parse_args()
    token = open(os.path.join(HERE, "..", ".admin_token")).read().strip()
    slugs = sorted(d for d in os.listdir(OUT) if os.path.isfile(os.path.join(OUT, d, "meta.json")) and fnmatch.fnmatch(d, a.only))
    ok = dup = fail = 0
    for slug in slugs:
        d = os.path.join(OUT, slug)
        m = json.load(open(os.path.join(d, "meta.json")))
        name, shows, elements = PATTERN[m["pattern"]]
        plat = "web app" if m["platform"] == "web" else "mobile app"
        if m["type"] == "section":
            plat = "website" if m["platform"] == "web" else "mobile website"
        title = f"{name} — {m['platform']}, {m['style']} ({m['product']})"
        desc = (f"{name} {'section' if m['type'] == 'section' else 'screen'} for a {plat}, designed for {m['product']}, a fictional {m['category']} product. "
                f"Shows {shows}. {STYLE[m['style']]} Comes with the full HTML and a DESIGN.md with light and dark colour tokens.")
        roles = ["background", "surface", "border", "text", "muted", "primary", "on-primary", "accent"]
        palette = [m["tokens"]["light"][r] for r in roles]
        im = Image.open(os.path.join(d, "screen.png")).convert("RGB")
        buf = io.BytesIO(); im.save(buf, "WEBP", quality=84, method=6)
        fields = {"collection": "ui", "skip_enrich": "1", "title": title, "description": desc, "style": m["style"],
                  "themes": json.dumps([m["style"]]), "tags": json.dumps([m["pattern"], m["platform"], m["category"]] + elements),
                  "palette": json.dumps(palette), "category": m["pattern"], "country": m["platform"], "industry": m["category"],
                  "company": m["product"], "designer": "Made Good Designs",
                  "source_url": f"https://madegooddesigns.com/inspiration/ui#{slug}",
                  "width": str(m["viewport"]["w"]), "height": str(m["viewport"]["h"]),
                  "code_html": open(os.path.join(d, "index.html")).read(), "design_md": open(os.path.join(d, "DESIGN.md")).read()}
        if a.dry:
            print(slug, len(buf.getvalue()) // 1024, "KB", title); continue
        try:
            r = post(a.base, token, fields, {"image": (slug + ".webp", buf.getvalue(), "image/webp")})
            if r.get("duplicate"): dup += 1; print("dup ", slug)
            elif r.get("ok"): ok += 1; print("ok  ", slug, r["item"]["id"])
            else: fail += 1; print("FAIL", slug, r)
        except Exception as e:
            fail += 1; print("FAIL", slug, e)
    print(f"done: {ok} added, {dup} duplicates, {fail} failed")
    sys.exit(1 if fail else 0)

if __name__ == "__main__":
    main()
