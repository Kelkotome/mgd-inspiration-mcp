#!/usr/bin/env python3
"""Ironyard fix (22-Nov-2026, folded into templates r4): the n12 gym-website home page (16 live rows: 8 styles x web + mobile) re-rendered under the
beauty/fitness wording rules (tests/bw_lint.py): $00 sample prices, "Notes from the coaches" instead of member reviews, a fictional notice in the footer.
Reads the regenerated screens in ui-screens/out-ironyard/ (GEN_OUT=out-ironyard node gen.js --only gym-website; shoot.sh; trim.py) and the CURRENT live
values of the 16 rows (read only: GET /api/item/<id> and /ui/raw/<id>.html|.md on the public site, curl/8.4.0 UA). Writes, one statement per line:
  ../deploy-bundle-2026-11-21/tpl-r4-ironyard-r2.tsv       key \\t path \\t sha256 \\t content-type (new versioned images, so the year-long immutable cache
                                                         never serves the old picture; index.html and spec.json overwrite in place; DESIGN.md is unchanged and not uploaded)
  ../deploy-bundle-2026-11-21/tpl-r4-ironyard.sql          one UPDATE per row (image_key, height, description, tags), WHERE id AND source_url; idempotent
  ../deploy-bundle-2026-11-21/tpl-r4-ironyard-rollback.sql one UPDATE per row restoring the live values read now (old images are left in R2)
  ui-screens/out-r2-ironyard/  the R2 objects (generated, gitignored); ui-screens/out-r2-ironyard-rollback/ the live index.html + spec.json (R2 rollback)
Then applies forward, forward again, rollback to a temp copy of the live snapshot and checks the rows.
usage: python3 tests/ironyard_bundle.py [live.sqlite]"""
import hashlib, importlib.util, io, json, os, re, shutil, sqlite3, subprocess, sys, tempfile, time, urllib.request
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); UI = os.path.join(ROOT, "ui-screens"); SRC = os.path.join(UI, "out-ironyard")
BUNDLE = os.path.join(ROOT, "..", "deploy-bundle-2026-11-21"); BASE = "https://madegooddesigns.com/inspiration"
MARK = "<!-- Made Good Designs UI screen — original reference design, free to copy. Tokens: see DESIGN.md -->"
LIVE = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "..", "mgd-inspiration-r3", "tests", "r3", ".data", "live.sqlite")
spec = importlib.util.spec_from_file_location("ingest", os.path.join(UI, "ingest.py")); ing = importlib.util.module_from_spec(spec); spec.loader.exec_module(ing); ing.OUT = SRC
def get(path):
    req = urllib.request.Request(BASE + path, headers={"User-Agent": "curl/8.4.0", "Accept": "*/*"})
    with urllib.request.urlopen(req, timeout=60) as r: return r.read()
snap = sqlite3.connect(f"file:{LIVE}?mode=ro", uri=True)
ids = dict(snap.execute("SELECT source_url, id FROM items WHERE collection='ui' AND status='published' AND source_url LIKE 'https://madegooddesigns.com/inspiration/ui#gym-website-homepage-%'"))
slugs = sorted(d for d in os.listdir(SRC) if os.path.isfile(os.path.join(SRC, d, "screen.png")))
assert len(slugs) == 16 and len(ids) == 16, (len(slugs), len(ids))
q = lambda v: "NULL" if v is None else str(v) if isinstance(v, int) else "'" + str(v).replace("'", "''") + "'"
spec_js = "import { extractSpec } from '%s'; let s=''; process.stdin.on('data', d => s += d).on('end', () => process.stdout.write(JSON.stringify(extractSpec(s))));" % os.path.join(ROOT, "src", "ui_spec.js")
specj = lambda html: subprocess.run(["node", "--no-warnings", "--import", os.path.join(ROOT, "tests", "ui_rank", "register.mjs"), "--input-type=module", "-e", spec_js], input=html.encode(), capture_output=True, check=True).stdout
OUTR2 = os.path.join(UI, "out-r2-ironyard"); RBR2 = os.path.join(UI, "out-r2-ironyard-rollback")
for d in (OUTR2, RBR2): shutil.rmtree(d, ignore_errors=True)
def put(base, key, data):
    p = os.path.join(base, key); os.makedirs(os.path.dirname(p), exist_ok=True); open(p, "wb").write(data); return p
ver = os.environ.get("IRONYARD_VER") or ""
if not ver:  # same shape as putUiImages (Date.now() in base 36); one version for the whole set
    n, s = int(time.time() * 1000), ""
    while n: n, r = divmod(n, 36); s = "0123456789abcdefghijklmnopqrstuvwxyz"[r] + s
    ver = s
CT = {".webp": "image/webp", ".html": "text/html; charset=utf-8", ".json": "application/json", ".md": "text/markdown; charset=utf-8"}
man, fwd, rb, same_as_snapshot = [], [], [], []
for slug in slugs:
    url = f"https://madegooddesigns.com/inspiration/ui#{slug}"; iid = ids[url]
    live = json.loads(get(f"/api/item/{iid}"))["item"]
    assert live["id"] == iid and live["image"].startswith("/img/ui/"), live
    old_key = live["image"][len("/img/"):]
    row = snap.execute("SELECT image_key, height, description, tags FROM items WHERE id=?", (iid,)).fetchone()
    live_tags = live["tags"]; same_as_snapshot.append(row == (live["image"][5:], live["height"], live["description"], json.dumps(live_tags, separators=(",", ":"))))
    fields, img, dark = ing.fields_for(slug, {})
    assert fields["source_url"] == url and dark
    new_tags = [t for t in live_tags if t != "testimonials"]; assert "testimonials" in live_tags and len(new_tags) == len(live_tags) - 1
    key = f"ui/{iid}-{ver}.webp"
    html = fields["code_html"]; md = fields["design_md"]
    for k, data in [(key, img), (key.replace(".webp", "-dark.webp"), dark), (f"ui/{iid}/index.html", html.encode()), (f"ui/{iid}/spec.json", specj(html))]:
        p = put(OUTR2, k, data); man.append((k, os.path.relpath(p, ROOT), hashlib.sha256(data).hexdigest(), CT[os.path.splitext(k)[1]]))
    # /ui/raw adds a credit comment at serve time (withCredit in src/ui_screens.js); undo it so these are the stored R2 objects
    old_html = re.sub(r"<!--\n  UI by Made Good Designs.*?-->", MARK, get(f"/ui/raw/{iid}.html").decode(), count=1, flags=re.S)
    old_md = re.sub(r"^(---\n.*?\n---\n)<!-- UI by Made Good Designs[^\n]*-->\n\n", r"\1", get(f"/ui/raw/{iid}.md").decode(), count=1, flags=re.S)
    assert MARK in old_html and "UI by Made Good Designs" not in old_html and "UI by Made Good Designs" not in old_md, iid
    assert old_md == md, f"DESIGN.md changed for {slug}"  # only the page changed; DESIGN.md stays as it is in R2 (not in the manifest)
    put(RBR2, f"ui/{iid}/index.html", old_html.encode()); put(RBR2, f"ui/{iid}/spec.json", specj(old_html))
    where = f"WHERE collection = 'ui' AND id = {q(iid)} AND source_url = {q(url)}"
    fwd.append(f"UPDATE items SET image_key = {q(key)}, height = {int(fields['height'])}, description = {q(fields['description'])}, tags = {q(json.dumps(new_tags, separators=(',', ':')))} {where};")
    rb.append(f"UPDATE items SET image_key = {q(old_key)}, height = {int(live['height'])}, description = {q(live['description'])}, tags = {q(json.dumps(live_tags, separators=(',', ':')))} {where};")
    # the description must change only where the page changed
    assert live["description"].replace("monthly prices", "sample $00 monthly prices").replace("member notes,", "notes from the coaches with first-class tips,") == fields["description"], slug
man.sort()
open(os.path.join(BUNDLE, "tpl-r4-ironyard-r2.tsv"), "w").write("".join("\t".join(m) + "\n" for m in man))
open(os.path.join(BUNDLE, "tpl-r4-ironyard.sql"), "w").write("-- Ironyard fix (22-Nov-2026): n12 gym-website, 16 rows: new image keys + heights, description and tags (no 'testimonials'). One UPDATE per line; idempotent.\n" + "\n".join(fwd) + "\n")
open(os.path.join(BUNDLE, "tpl-r4-ironyard-rollback.sql"), "w").write("-- Ironyard fix rollback: restore the live image_key, height, description and tags read on " + time.strftime("%d-%b-%Y") + ". Old images were never deleted.\n" + "\n".join(rb) + "\n")
tmp = tempfile.mkdtemp(); db = os.path.join(tmp, "c.sqlite"); shutil.copyfile(LIVE, db); c = sqlite3.connect(db)
cols = "image_key, height, description, tags"; sel = lambda: c.execute(f"SELECT id, {cols} FROM items WHERE id IN ({','.join(q(i) for i in ids.values())}) ORDER BY id").fetchall()
def run(f):
    for l in open(os.path.join(BUNDLE, f)):
        if l.strip() and not l.startswith("--"): assert c.execute(l).rowcount == 1, l[:120]
    c.commit()
n0 = c.execute("SELECT count(*) FROM items").fetchone()[0]
run("tpl-r4-ironyard.sql"); a = sel(); run("tpl-r4-ironyard.sql"); b = sel()
fts = c.execute("SELECT count(*) FROM items_fts WHERE items_fts MATCH '\"notes from the coaches\"'").fetchone()[0]
fts_t = c.execute("SELECT count(*) FROM items i WHERE i.id IN (%s) AND i.tags LIKE '%%testimonials%%'" % ",".join(q(i) for i in ids.values())).fetchone()[0]
run("tpl-r4-ironyard-rollback.sql"); r = sel(); n1 = c.execute("SELECT count(*) FROM items").fetchone()[0]; c.close(); shutil.rmtree(tmp)
assert a == b and n0 == n1 and fts >= 16 and fts_t == 0 and all(x[1].endswith(f"-{ver}.webp") for x in a)
print(f"version {ver}; R2 objects {len(man)} ({sum(os.path.getsize(os.path.join(ROOT, m[1])) for m in man)} bytes); forward {len(fwd)} UPDATEs, re-run identical, fts phrase hits {fts}, "
      f"testimonials tags left {fts_t}; rollback {len(rb)} UPDATEs restore {sum(1 for x in r if not x[1].endswith(ver + '.webp'))}/16; row count unchanged {n0}")
print(f"live rows equal to the 12-Nov snapshot: {sum(same_as_snapshot)}/16")
print("OK")
