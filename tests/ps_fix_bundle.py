#!/usr/bin/env python3
"""Templates r6 follow-up (24-Nov-2026), same shape as tests/cn_fix_bundle.py (r5 follow-up). 44 live rows, data only (R2 + D1):
  32 rows: the two old n12/n13 professional homepages (law-firm-website Whitcombe Hale, financial-advisor-website Lindqvale; 8 styles x web + mobile)
           re-rendered with the 7-Nov fixes from 0cb779d and the r6 word rules (tests/ps_lint.py): fictional notice + general-information line,
           no client notes/testimonials, no admission years or staff counts, no attorney-advertising/prior-results lines, no promises,
           qualifications and licence/registration lines as "add your own", every fee $00 with "sample fees" wording.
  12 rows: the six r6 consulting designs (web + mobile), firm renamed Tarrowby Consulting -> Ostrevane Consulting (Tarrowby was close to a
           dissolved real UK company, Harrowby Consulting Ltd). Checked: the new HTML equals the live HTML with only the name changed.
Reads ui-screens/out-r6fix/ (GEN_OUT=out-r6fix node gen.js --only law-firm-website,financial-advisor-website) and ui-screens/out-hc-r6fix/
(HC_OUT=$PWD/out-hc-r6fix node gen_hc.js --only consulting), both shot + trimmed, and the CURRENT live values (read only: GET /api/item/<id>,
/ui/raw/<id>.html|.md, curl/8.4.0 UA). The WordPress consulting themes are NOT in this bundle (their zip hash is in the Worker's tpl_catalog.json).
Writes to ../deploy-bundle-2026-11-24/:
  tpl-r6fix-r2.tsv        key \\t path \\t sha256 \\t content-type (new versioned images; index.html, spec.json, DESIGN.md overwrite in place)
  tpl-r6fix.sql           one UPDATE per row (image_key, height, title, description, tags, palette, company) WHERE collection, id AND source_url; idempotent
  tpl-r6fix-rollback.sql  one UPDATE per row restoring the live values read now (old images stay in R2)
  ui-screens/out-r2-r6fix/ the R2 objects; ui-screens/out-r2-r6fix-rollback/ the live index.html, spec.json, DESIGN.md (R2 rollback)
Then applies forward, forward again, rollback to a temp copy of the live snapshot (r6 consulting rows inserted from tpl-r6-professional-rows.sql first).
usage: python3 tests/ps_fix_bundle.py [live.sqlite]"""
import hashlib, importlib.util, json, os, re, shutil, sqlite3, subprocess, sys, tempfile, time, urllib.request
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); UI = os.path.join(ROOT, "ui-screens")
SRC_N = os.path.join(UI, "out-r6fix"); SRC_C = os.path.join(UI, "out-hc-r6fix")
BUNDLE = os.path.join(ROOT, "..", "deploy-bundle-2026-11-24"); BASE = "https://madegooddesigns.com/inspiration"; os.makedirs(BUNDLE, exist_ok=True)
MARK = "<!-- Made Good Designs UI screen — original reference design, free to copy. Tokens: see DESIGN.md -->"
LIVE = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "..", "mgd-inspiration-r3", "tests", "r3", ".data", "live.sqlite")
OLD, NEW = "Tarrowby", "Ostrevane"
spec = importlib.util.spec_from_file_location("ingest", os.path.join(UI, "ingest.py")); ing = importlib.util.module_from_spec(spec); spec.loader.exec_module(ing)
def get(path, tries=5):
    for i in range(tries):
        try:
            req = urllib.request.Request(BASE + path + ("&" if "?" in path else "?") + f"cb={int(time.time())}", headers={"User-Agent": "curl/8.4.0", "Accept": "*/*"})
            with urllib.request.urlopen(req, timeout=60) as r: return r.read()
        except Exception:
            if i == tries - 1: raise
            time.sleep(2 * (i + 1))
snap = sqlite3.connect(f"file:{LIVE}?mode=ro", uri=True)
ids = {}
for p in ["law-firm-website", "financial-advisor-website"]:
    ids.update(dict(snap.execute("SELECT source_url, id FROM items WHERE collection='ui' AND status='published' AND source_url LIKE ?", (f"https://madegooddesigns.com/inspiration/ui#{p}-homepage-%",))))
R6ROWS = os.path.join(BUNDLE, "tpl-r6-professional-rows.sql"); r6ins = []
for l in open(R6ROWS):
    m = re.search(r"WHERE id = '([0-9a-f]+)' OR source_url = '(https://madegooddesigns.com/inspiration/ui#consulting-website-[^']+)'\);$", l.strip())
    if m: ids[m.group(2)] = m.group(1); r6ins.append(l)
src = {}
for base in (SRC_N, SRC_C):
    for d in os.listdir(base):
        if os.path.isfile(os.path.join(base, d, "screen.png")): src[d] = base
slugs = sorted(src)
assert len(slugs) == 44 and len(ids) == 44 and len(r6ins) == 12 and sorted(u.split("#", 1)[1] for u in ids) == slugs, (len(slugs), len(ids), len(r6ins))
q = lambda v: "NULL" if v is None else str(v) if isinstance(v, int) else "'" + str(v).replace("'", "''") + "'"
J = lambda v: json.dumps(v, separators=(",", ":"), ensure_ascii=False)
spec_js = "import { extractSpec } from '%s'; let s=''; process.stdin.on('data', d => s += d).on('end', () => process.stdout.write(JSON.stringify(extractSpec(s))));" % os.path.join(ROOT, "src", "ui_spec.js")
specj = lambda html: subprocess.run(["node", "--no-warnings", "--import", os.path.join(ROOT, "tests", "ui_rank", "register.mjs"), "--input-type=module", "-e", spec_js], input=html.encode(), capture_output=True, check=True).stdout
OUTR2 = os.path.join(UI, "out-r2-r6fix"); RBR2 = os.path.join(UI, "out-r2-r6fix-rollback")
for d in (OUTR2, RBR2): shutil.rmtree(d, ignore_errors=True)
def put(base, key, data):
    p = os.path.join(base, key); os.makedirs(os.path.dirname(p), exist_ok=True); open(p, "wb").write(data); return p
ver = os.environ.get("R6FIX_VER") or ""
if not ver:
    n, s = int(time.time() * 1000), ""
    while n: n, r = divmod(n, 36); s = "0123456789abcdefghijklmnopqrstuvwxyz"[r] + s
    ver = s
CT = {".webp": "image/webp", ".html": "text/html; charset=utf-8", ".json": "application/json", ".md": "text/markdown; charset=utf-8"}
BAD = re.compile(r"Tarrowby|testimonial|client notes|what (our )?(customers|clients) say|★|attorney advertising|prior results|admitted (19|20)\d\d|all \d+ staff|licensed|regulated by", re.I)
man, fwd, rb, same = [], [], [], 0
for slug in slugs:
    url = f"https://madegooddesigns.com/inspiration/ui#{slug}"; iid = ids[url]; ing.OUT = src[slug]
    live = json.loads(get(f"/api/item/{iid}"))["item"]
    assert live["id"] == iid and live["image"].startswith("/img/ui/"), live
    old_key = live["image"][len("/img/"):]
    fields, img, dark = ing.fields_for(slug, {})
    assert fields["source_url"] == url and img and dark
    html = fields["code_html"]; md = fields["design_md"]
    assert not BAD.search(re.sub(r"<style.*?</style>", "", html, flags=re.S)), f"{slug}: old wording left: {BAD.search(re.sub(r'<style.*?</style>', '', html, flags=re.S)).group(0)}"
    assert not BAD.search(md) and not BAD.search(fields["title"] + fields["description"] + fields["company"]), f"{slug}: old wording in md/fields"
    assert not re.search(r"[$£€]\s?0*[1-9]", html), f"{slug}: non-zero price"
    new = {"title": fields["title"], "description": fields["description"], "tags": J(json.loads(fields["tags"])), "palette": J(json.loads(fields["palette"])), "company": fields["company"], "height": int(fields["height"])}
    old = {"title": live["title"], "description": live["description"], "tags": J(live["tags"]), "palette": J(live["palette"]), "company": live["product"], "height": int(live["height"])}
    key = f"ui/{iid}-{ver}.webp"
    for k, data in [(key, img), (key.replace(".webp", "-dark.webp"), dark), (f"ui/{iid}/index.html", html.encode()), (f"ui/{iid}/spec.json", specj(html)), (f"ui/{iid}/DESIGN.md", md.encode())]:
        p = put(OUTR2, k, data); man.append((k, os.path.relpath(p, ROOT), hashlib.sha256(data).hexdigest(), CT[os.path.splitext(k)[1]]))
    old_html = re.sub(r"<!--\n  UI by Made Good Designs.*?-->", MARK, get(f"/ui/raw/{iid}.html").decode(), count=1, flags=re.S)
    old_md = re.sub(r"^(---\n.*?\n---\n)<!-- UI by Made Good Designs[^\n]*-->\n\n", r"\1", get(f"/ui/raw/{iid}.md").decode(), count=1, flags=re.S)
    assert MARK in old_html and "UI by Made Good Designs" not in old_html and "UI by Made Good Designs" not in old_md, iid
    if slug.startswith("consulting-"):  # rename only: everything else must be byte-identical to live
        lo = lambda t: t.replace(OLD, NEW).replace(OLD.lower(), NEW.lower())
        assert lo(old_html) == html, f"{slug}: consulting HTML differs from live beyond the rename"
        assert lo(old["title"]) == new["title"] and lo(old["description"]) == new["description"] and lo(old["company"]) == new["company"] and old["tags"] == new["tags"], f"{slug}: fields differ beyond the rename"
        same += 1
    put(RBR2, f"ui/{iid}/index.html", old_html.encode()); put(RBR2, f"ui/{iid}/spec.json", specj(old_html)); put(RBR2, f"ui/{iid}/DESIGN.md", old_md.encode())
    where = f"WHERE collection = 'ui' AND id = {q(iid)} AND source_url = {q(url)}"
    setp = lambda v, k: ", ".join(f"{c} = {q(v[c])}" for c in ["title", "description", "tags", "palette", "company", "height"]) + f", image_key = {q(k)}"
    fwd.append(f"UPDATE items SET {setp(new, key)} {where};"); rb.append(f"UPDATE items SET {setp(old, old_key)} {where};")
man.sort()
open(os.path.join(BUNDLE, "tpl-r6fix-r2.tsv"), "w").write("".join("\t".join(m) + "\n" for m in man))
open(os.path.join(BUNDLE, "tpl-r6fix.sql"), "w").write("-- r6 follow-up (24-Nov-2026): law-firm + financial-advisor n12/n13 homepages (32 rows, r6 word rules) and r6 consulting (12 rows, Tarrowby -> Ostrevane): new image keys, title/description/tags/palette/company/height. One UPDATE per line; idempotent.\n" + "\n".join(fwd) + "\n")
open(os.path.join(BUNDLE, "tpl-r6fix-rollback.sql"), "w").write("-- r6 follow-up rollback: restore the live values read on " + time.strftime("%d-%b-%Y %H:%M") + ". Old images were never deleted; R2 rollback files in ui-screens/out-r2-r6fix-rollback/.\n" + "\n".join(rb) + "\n")
tmp = tempfile.mkdtemp(); db = os.path.join(tmp, "c.sqlite"); shutil.copyfile(LIVE, db); c = sqlite3.connect(db)
for l in r6ins: c.execute(l)
c.commit()
cols = "title, description, tags, palette, company, height, image_key"; sel = lambda: c.execute(f"SELECT id, {cols} FROM items WHERE id IN ({','.join(q(i) for i in ids.values())}) ORDER BY id").fetchall()
before = sel()
def run(f):
    for l in open(os.path.join(BUNDLE, f)):
        if l.strip() and not l.startswith("--"): assert c.execute(l).rowcount == 1, l[:120]
    c.commit()
n0 = c.execute("SELECT count(*) FROM items").fetchone()[0]
run("tpl-r6fix.sql"); a = sel(); run("tpl-r6fix.sql"); b = sel()
left = c.execute("SELECT count(*) FROM items WHERE id IN (%s) AND (title LIKE '%%Tarrowby%%' OR company LIKE '%%Tarrowby%%' OR description LIKE '%%Tarrowby%%' OR tags LIKE '%%testimonials%%')" % ",".join(q(i) for i in ids.values())).fetchone()[0]
fts = c.execute("SELECT count(*) FROM items_fts WHERE items_fts MATCH 'Ostrevane'").fetchone()[0]
run("tpl-r6fix-rollback.sql"); r = sel(); n1 = c.execute("SELECT count(*) FROM items").fetchone()[0]; c.close(); shutil.rmtree(tmp)
assert a == b and n0 == n1 and left == 0 and fts >= 1 and all(x[7].endswith(f"-{ver}.webp") for x in a), (a == b, n0, n1, left, fts)
print(f"version {ver}; R2 objects {len(man)} ({sum(os.path.getsize(os.path.join(ROOT, m[1])) for m in man)} bytes); forward {len(fwd)} UPDATEs, re-run identical, "
      f"consulting rename-only checks {same}/12, Tarrowby/testimonials left {left}, fts Ostrevane hits {fts}; rollback {len(rb)} UPDATEs restore {sum(1 for x in r if not x[7].endswith(ver + '.webp'))}/44; row count unchanged {n0}")
print("OK")
