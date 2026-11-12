#!/usr/bin/env python3
"""Templates r3 deploy bundle from the local e2e dump (tests/ind6_local_e2e.sh with PF_DUMP=<dir>). Writes, one complete statement per line:
  ../deploy-bundle-2026-11-09/r4-templates-rows.sql      INSERT ... SELECT ... WHERE NOT EXISTS (id or source_url): idempotent, plain INSERT so the FTS
                                                        trigger indexes each row. Rows exactly as the Worker's POST /api/items built them locally.
  ../deploy-bundle-2026-11-09/r4-templates-rollback.sql  UPDATE status='removed' for exactly these ids + source_urls (nothing older)
  ../deploy-bundle-2026-11-09/r4-templates-r2.tsv        key \\t path (relative to the r4-tpl worktree root) \\t sha256 \\t content-type
The ui/ objects are copied from the dump into ui-screens/out-r2-r4/ (generated, gitignored); the theme objects are build_catalog.mjs's
ui-screens/out-wp/_r2/ (generated, gitignored). Then applies both SQL files to a temp COPY of the live snapshot (never the snapshot itself).
usage: python3 tests/pf_bundle.py <dump dir> [live.sqlite]"""
import hashlib, json, os, shutil, sqlite3, sys, tempfile
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); BUNDLE = os.path.join(ROOT, "..", "deploy-bundle-2026-11-09")
DUMP = sys.argv[1]; LIVE = sys.argv[2] if len(sys.argv) > 2 else os.path.join(ROOT, "..", "mgd-inspiration-r3", "tests", "r3", ".data", "live.sqlite")
rows = json.load(open(os.path.join(DUMP, "rows.json")))[0]["results"]
slugs = [l.strip() for l in open(os.path.join(DUMP, "slugs.txt")) if l.strip()]
assert len(rows) == len(slugs) == 96, (len(rows), len(slugs))
assert sorted(r["source_url"].split("#", 1)[1] for r in rows) == sorted(slugs)
live_cols = [c[1] for c in sqlite3.connect(f"file:{LIVE}?mode=ro", uri=True).execute("PRAGMA table_info(items)")]
cols = [c for c in rows[0] if c in live_cols]; missing = [c for c in rows[0] if c not in live_cols and rows[0][c] is not None]
assert not missing, f"local columns with values that live lacks: {missing}"
q = lambda v: "NULL" if v is None else str(v) if isinstance(v, (int, float)) and not isinstance(v, bool) else "'" + str(v).replace("'", "''") + "'"
out = ["-- templates r3 (portfolios and creative studios, 13-Nov-2026): 96 UI rows (48 designs x web + mobile), one statement per line.",
       "-- Idempotent: each INSERT is skipped when the id or the source_url already exists. Plain INSERT, so items_fts_ai indexes every row."]
for r in rows:
    s = f"INSERT INTO items ({', '.join(cols)}) SELECT {', '.join(q(r[c]) for c in cols)} WHERE NOT EXISTS (SELECT 1 FROM items WHERE id = {q(r['id'])} OR source_url = {q(r['source_url'])});"
    assert "\n" not in s and len(s.encode()) < 90_000, (r["id"], len(s.encode())); out.append(s)
open(os.path.join(BUNDLE, "r4-templates-rows.sql"), "w").write("\n".join(out) + "\n")
ids = ", ".join(q(r["id"]) for r in rows); urls = ", ".join(q(r["source_url"]) for r in rows)
rb = ["-- templates r3 rollback: hide exactly this round's 96 rows (id AND source_url must both match; the n12 agency/architecture rows and every older row are untouched).",
      f"UPDATE items SET status = 'removed' WHERE collection = 'ui' AND id IN ({ids}) AND source_url IN ({urls});"]
assert len(rb[1].encode()) < 90_000
open(os.path.join(BUNDLE, "r4-templates-rollback.sql"), "w").write("\n".join(rb) + "\n")
# R2 manifest
CT = {".webp": "image/webp", ".html": "text/html; charset=utf-8", ".json": "application/json", ".md": "text/markdown; charset=utf-8", ".zip": "application/zip"}
UIR2 = os.path.join(ROOT, "ui-screens", "out-r2-r4"); shutil.rmtree(UIR2, ignore_errors=True); man = []
sha = lambda p: hashlib.sha256(open(p, "rb").read()).hexdigest()
for k in [l.strip() for l in open(os.path.join(DUMP, "keys.txt")) if l.strip()]:
    src = os.path.join(DUMP, "r2", k); assert os.path.isfile(src) and os.path.getsize(src) > 0, f"missing R2 object {k}"
    dst = os.path.join(UIR2, k); os.makedirs(os.path.dirname(dst), exist_ok=True); shutil.copyfile(src, dst)
    man.append((k, os.path.relpath(dst, ROOT), sha(dst), CT[os.path.splitext(k)[1]]))
TP = os.path.join(ROOT, "ui-screens", "out-wp", "_r2")
for dp, _, fs in os.walk(os.path.join(TP, "tpl")):
    for f in sorted(fs): p = os.path.join(dp, f); man.append((os.path.relpath(p, TP), os.path.relpath(p, ROOT), sha(p), CT[os.path.splitext(f)[1]]))
man.sort(); open(os.path.join(BUNDLE, "r4-templates-r2.tsv"), "w").write("".join("\t".join(m) + "\n" for m in man))
# apply check on a temp copy of the live snapshot
tmp = tempfile.mkdtemp(dir=os.environ.get("SCRATCH")); db = os.path.join(tmp, "live-copy.sqlite"); shutil.copyfile(LIVE, db); c = sqlite3.connect(db)
before = c.execute("SELECT count(*) FROM items").fetchone()[0]; fts0 = c.execute("SELECT count(*) FROM items_fts").fetchone()[0]
def run(f):
    for l in open(os.path.join(BUNDLE, f)):
        if l.strip() and not l.startswith("--"): c.execute(l)
    c.commit()
run("r4-templates-rows.sql"); after = c.execute("SELECT count(*) FROM items").fetchone()[0]; fts1 = c.execute("SELECT count(*) FROM items_fts").fetchone()[0]
hit = c.execute("SELECT count(*) FROM items_fts WHERE items_fts MATCH 'Quellmarsh'").fetchone()[0]
run("r4-templates-rows.sql"); again = c.execute("SELECT count(*) FROM items").fetchone()[0]
run("r4-templates-rollback.sql"); removed = c.execute("SELECT count(*) FROM items WHERE status = 'removed' AND collection = 'ui'").fetchone()[0]
pub = c.execute("SELECT count(*) FROM items WHERE status = 'published'").fetchone()[0]; c.close(); shutil.rmtree(tmp)
print(f"rows {len(rows)}  statements {len(out) - 2}  live copy {before} -> {after} (+{after - before}), re-run {again} (+0), fts {fts0} -> {fts1}, fts 'Quellmarsh' hits {hit}, rollback hid {removed}, published back to {pub}")
print(f"R2 objects {len(man)} (ui {sum(1 for m in man if m[0].startswith('ui/'))}, tpl {sum(1 for m in man if m[0].startswith('tpl/'))}), bytes {sum(os.path.getsize(os.path.join(ROOT, m[1])) for m in man)}")
assert after - before == 96 and again == after and fts1 - fts0 == 96 and hit > 0 and removed == 96
print("OK")
