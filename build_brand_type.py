#!/usr/bin/env python3
"""Build the brand_type table for the get_brand_typeface MCP tool (5-Nov-2026).

Uses ONLY what Made Good Designs already publishes; nothing is guessed:
  1. the "What font does <Brand> use?" articles (local HTML in ../new-batch-*/, only slugs live in the post sitemaps):
     the Quick answer text (verbatim), whether it calls the lettering custom, typefaces it names, and the free
     Google Fonts it recommends as look-alikes;
  2. the "<Brand> Brand Guidelines" field guides (local HTML in ~/Downloads/mgd-pipeline/mgd-brandguide/, read only):
     the type register ("Open humanist sans") and the specimen font, flagged as a STAND-IN unless the guide says it is
     the brand's documented typeface;
  3. the D1 "<Brand> — Typeface" tiles (export: SELECT id, company, source_url, palette, industry, country FROM items
     WHERE style='type-specimen' AND title LIKE '% — Typeface' AND status='published' AND owner_id IS NULL AND collection='design').

Usage: python3 build_brand_type.py --tiles tiles.json --live live_slugs.txt --out brand_type.sql
Then:  npx wrangler d1 execute mgd-inspiration --remote --file=brand_type.sql   (heavy write: quiet window + deploy lock)
Brands published after the build still answer from their D1 tile (the tool falls back to items), just without font details.
"""
import argparse, glob, html, json, os, re, unicodedata

ROOT = os.path.dirname(os.path.abspath(__file__))
ap = argparse.ArgumentParser()
ap.add_argument("--tiles", required=True); ap.add_argument("--live", required=True); ap.add_argument("--out", required=True)
ap.add_argument("--articles", default=os.path.join(ROOT, "..", "new-batch-*"))
ap.add_argument("--guides", default=os.path.expanduser("~/Downloads/mgd-pipeline/mgd-brandguide"))
ap.add_argument("--families", default=os.path.join(ROOT, "..", "tool-gap-2026-10", "fontid", "families.json"))
args = ap.parse_args()

SITE = "https://madegooddesigns.com"
live = set(open(args.live).read().split())
GF = {x["family"]: x.get("category", "") for x in json.load(open(args.families))}
GF_L = {k.lower(): k for k in GF}
# Well-known commercial families, matched only when the article itself names them (never added from this list alone).
RETAIL = ["Helvetica Neue", "Helvetica", "Futura", "Gotham", "Frutiger", "Univers", "Avenir Next", "Avenir", "Gill Sans", "Trajan", "Franklin Gothic",
  "Cooper Black", "Garamond", "Adobe Caslon", "Caslon", "Bodoni", "Didot", "Optima", "Myriad", "Proxima Nova", "Brandon Grotesque", "Akzidenz-Grotesk",
  "DIN", "Eurostile", "Friz Quadrata", "Clarendon", "Rockwell", "Century Gothic", "Baskerville", "Times New Roman", "Arial", "ITC Avant Garde", "Avant Garde",
  "Kabel", "Benguiat", "Johnston", "Transport", "Circular", "SF Pro", "San Francisco", "Segoe UI", "Product Sans", "Google Sans", "Gilroy", "Neue Haas Grotesk",
  "Neue Haas Unica", "Graphik", "GT America", "GT Walsheim", "Founders Grotesk", "Sharp Sans", "Brown", "Akkurat", "Calibre", "Tiempos", "Publico",
  "Freight", "Sabon", "Minion", "Palatino", "Perpetua", "Copperplate Gothic", "Copperplate", "Engravers", "Bauer Bodoni", "Goudy", "Cheltenham", "Century",
  "Bookman", "Souvenir", "Peignot", "Broadway", "Bank Gothic", "Microgramma", "Serpentine", "Handel Gothic", "ITC Machine", "Impact", "Haettenschweiler",
  "Agency FB", "Trade Gothic", "News Gothic", "Interstate", "Meta", "FF Meta", "Fago", "Unit", "Officina", "Scala", "Thesis", "Rotis", "Syntax", "Bembo",
  "Plantin", "Times", "Georgia", "Verdana", "Tahoma", "Lucida", "Hoefler Text", "Mercury", "Knockout", "Sentinel", "Whitney", "Ideal Sans", "Chronicle",
  "Big Noodle Titling", "Bebas Kai", "Antique Olive", "Folio", "Grotesque", "Neuzeit", "Erbar", "Kabel", "VAG Rounded", "Arial Rounded", "Nuevo",
  "Instagram Sans", "Spotify Mix", "Netflix Sans", "Airbnb Cereal", "Uber Move", "Amazon Ember", "Samsung Sharp Sans", "Samsung One", "Toyota Type",
  "Nike Futura", "Coca-Cola Unity", "Shell Futura", "Vodafone Rg", "BBC Reith", "Nokia Pure", "Intel Clear", "Mark", "FF Mark", "Aktiv Grotesk",
  "Neue Helvetica", "Cachet", "Gill Sans Nova", "Futura PT", "Brandon Text", "Museo", "Museo Sans", "Lato"]  # Lato is GF; dropped below
# Plain English words / places that are also font names: too ambiguous in prose ("Transport for London", "Georgia", "a circular badge").
AMBIG = {"Transport", "Brown", "Mark", "Unit", "Meta", "Times", "Century", "Folio", "Mercury", "Calibre", "Freight", "Interstate", "Grotesque",
  "Impact", "Georgia", "Thesis", "Scala", "Syntax", "Chronicle", "Sentinel", "Knockout", "Whitney", "Circular", "Broadway", "Serpentine",
  "Engravers", "Officina", "Nuevo", "Museo", "Ideal Sans", "Publico", "Tiempos", "Minion", "Lucida", "Fago", "Neuzeit", "Erbar", "Kabel", "Meta"}
RETAIL = [r for r in dict.fromkeys(RETAIL) if r not in GF and r not in AMBIG]
ALT_RE = re.compile(r"(?i)\b(alternative|alternatives|look-?alike|similar|close|closest|get you|gets you|reach for|stand-?in|approximat|substitut|try|swap|pair|instead|free fonts? like|free options?|lookalike|nearest|echo|evoke|capture)\b")
NEG_BEFORE = re.compile(r"(?i)\b(not|rather than|isn['’]t|instead of|never|no)\b[^.]{0,40}$")
CUSTOM_RE = re.compile(r"(?i)\b(custom|bespoke|proprietary|hand-?drawn|hand-?lettered|drawn lettering|one-off lettering|no downloadable|not (?:a|an) (?:single )?(?:installed |off-the-shelf |retail |downloadable )?(?:font|typeface|file)|not an off-the-shelf)\b")

def text(h): return html.unescape(re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", h))).strip()
def norm(s):
    s = unicodedata.normalize("NFKD", str(s)).encode("ascii", "ignore").decode().lower().replace("&", " and ")
    s = re.sub(r"[^a-z0-9]+", " ", s).strip()
    s = re.sub(r"^the ", "", s)
    return s.replace(" ", "")
def sentences(t): return [x.strip() for x in re.split(r"(?<=[.!?])\s+(?=[A-Z“\"(])", t) if x.strip()]
VOCAB_RE = None
def names_in(sent, vocab):
    """Font names in a sentence, longest match first ("Futura PT" over "Futura"); skips "Futura-style" / "Helvetica-like"."""
    global VOCAB_RE
    if VOCAB_RE is None:
        VOCAB_RE = re.compile(r"(?<![\w-])(" + "|".join(re.escape(n) for n in sorted(vocab, key=len, reverse=True)) + r")(?![\w-])")
    out = []
    for m in VOCAB_RE.finditer(sent):
        if re.match(r"[- ]?(style|like|inspired|esque|ish)\b", sent[m.end():m.end() + 10], re.I): continue
        if m.group(1) not in out: out.append(m.group(1))
    return out

# ---- 1. font articles
fonts = {}
for f in sorted(glob.glob(os.path.join(args.articles, "*-font.html")) + glob.glob(os.path.join(args.articles, "_published", "*-font.html"))):
    s = open(f, errors="replace").read()
    m = re.search(r"Slug:\s*(\S+)", s); slug = m.group(1) if m else re.sub(r"^\d+-", "", os.path.basename(f))[:-5]
    if slug not in live or slug in fonts: continue
    m = re.search(r"Quick answer\s*</(?:strong|b|p|h\d|span|div)>(.*?)</(?:div|p)>", s, re.S | re.I) or re.search(r"Quick answer(.*?)</div>", s, re.S | re.I)
    if not m: continue
    qa = text(m.group(1))
    if len(qa) < 40: continue
    t = re.search(r"Title Tag:\s*(.+)", s); title = t.group(1).strip() if t else ""
    bm = re.match(r"(?i)what (?:font|fonts|typeface) (?:does|do|is) (?:the )?(.+?) (?:use|uses|using|logo)\b", title)
    brand = bm.group(1).strip() if bm else re.sub(r"-font$", "", slug).replace("-", " ").title()
    named, alts = [], []
    for sent in sentences(qa):
        is_alt = bool(ALT_RE.search(sent))
        for n in names_in(sent, list(GF) + RETAIL):
            lic = "free (Google Fonts)" if n in GF else "commercial"
            if is_alt:
                if n in GF and n not in [a["name"] for a in alts]: alts.append({"name": n, "category": GF[n]})
            else:
                pre = sent[:sent.find(n)]
                if NEG_BEFORE.search(pre): continue
                if n not in [x["name"] for x in named]: named.append({"name": n, "licence": lic})
    custom = bool(CUSTOM_RE.search(qa))
    # a Google font named outside an "alternative" sentence on a custom-lettering page is usually still a look-alike
    if custom:
        for x in list(named):
            if x["licence"].startswith("free") and x["name"] not in [a["name"] for a in alts]:
                alts.append({"name": x["name"], "category": GF.get(x["name"], "")}); named.remove(x)
            elif x["licence"].startswith("free"): named.remove(x)
    kind = "custom" if custom and not named else "named" if named and not custom else "mixed" if named else ""
    summ = " ".join(sentences(qa)[:3])[:600]
    fonts[slug] = {"brand": brand, "key": norm(brand), "slug_key": norm(re.sub(r"-font$", "", slug)), "font_url": f"{SITE}/{slug}/",
                   "summary": summ, "kind": kind, "named": named[:4], "alts": alts[:5]}

# ---- 2. brand guides (specimen block)
guides = {}
for f in glob.glob(os.path.join(args.guides, "*-brand-guidelines.html")):
    slug = os.path.basename(f)[:-5]
    if slug not in live: continue
    s = open(f, errors="replace").read()
    m = re.search(r'class="specimen">(.*?)</div>\s*</div>', s, re.S)
    if not m: continue
    sp = text(m.group(1))
    note = re.search(r"\((Specimen set in [^)]*)\)", sp)
    if not note: continue
    nt = note.group(1)
    fm = re.match(r"Specimen set in (.+?)(?:,| from | \(|;|$)", nt)
    spec_font = fm.group(1).strip() if fm else ""
    stand_in = bool(re.search(r"(?i)stand-?in", nt))
    lead = sp.split("(Specimen set in")[0].replace("Aa", "", 1).strip()
    reg = re.search(r"\)\s*([^·()]+?) · the register", sp)
    guides[slug] = {"style": (reg.group(1).strip() if reg else "")[:80], "spec_font": spec_font[:60], "spec_brand": 0 if stand_in else 1,
                    "spec_note": (lead + " (" + nt + ")")[:400]}

# ---- 3. tiles + merge
tiles = json.load(open(args.tiles))
tiles = tiles[0]["results"] if isinstance(tiles, list) and tiles and "results" in tiles[0] else tiles
by_key = {}
for fs in fonts.values():
    for k in {fs["key"], fs["slug_key"]}:
        by_key.setdefault(k, fs)
rows, used = [], set()
for t in tiles:
    gslug = re.sub(r"^https://madegooddesigns\.com/|/?#.*$|/$", "", t["source_url"] or "")
    k = norm(t["company"] or "")
    fs = by_key.get(k) or by_key.get(norm(re.sub(r"-brand-guidelines$", "", gslug)))
    if fs: used.add(fs["font_url"])
    g = guides.get(gslug, {})
    rows.append({"key": k, "brand": t["company"], "font": fs, "guide_url": f"{SITE}/{gslug}/" if gslug else None, "g": g, "tile_id": t["id"],
                 "palette": t["palette"] or "[]", "industry": t.get("industry"), "alias": norm(re.sub(r"-brand-guidelines$", "", gslug))})
for fs in fonts.values():
    if fs["font_url"] in used: continue
    rows.append({"key": fs["key"], "brand": fs["brand"], "font": fs, "guide_url": None, "g": {}, "tile_id": None, "palette": "[]", "industry": None, "alias": fs["slug_key"]})

def q(v):
    if v is None: return "NULL"
    if isinstance(v, int): return str(v)
    return "'" + str(v).replace("'", "''") + "'"
with open(args.out, "w") as o:
    o.write("DROP TABLE IF EXISTS brand_type;\n")
    o.write("CREATE TABLE brand_type (key TEXT NOT NULL, alias TEXT, brand TEXT NOT NULL, font_url TEXT, summary TEXT, kind TEXT, named TEXT, alts TEXT, "
            "guide_url TEXT, style TEXT, spec_font TEXT, spec_brand INTEGER, spec_note TEXT, tile_id TEXT, palette TEXT, industry TEXT);\n")
    for i in range(0, len(rows), 200):
        vals = []
        for r in rows[i:i + 200]:
            fs, g = r["font"] or {}, r["g"]
            vals.append("(" + ",".join(q(x) for x in [r["key"], r["alias"], r["brand"], fs.get("font_url"), fs.get("summary"), fs.get("kind"),
                json.dumps(fs.get("named") or [], ensure_ascii=False), json.dumps(fs.get("alts") or [], ensure_ascii=False), r["guide_url"],
                g.get("style"), g.get("spec_font"), g.get("spec_brand"), g.get("spec_note"), r["tile_id"], r["palette"], r["industry"]]) + ")")
        o.write("INSERT INTO brand_type VALUES " + ",\n".join(vals) + ";\n")
    o.write("CREATE INDEX idx_brand_type_key ON brand_type(key);\nCREATE INDEX idx_brand_type_alias ON brand_type(alias);\n")
st = {"rows": len(rows), "font_articles": len(fonts), "guides_parsed": len(guides), "tiles": len(tiles),
      "with_font": sum(1 for r in rows if r["font"]), "with_guide_style": sum(1 for r in rows if r["g"]),
      "kinds": {k: sum(1 for f in fonts.values() if f["kind"] == k) for k in ("custom", "named", "mixed", "")}}
print(json.dumps(st))
