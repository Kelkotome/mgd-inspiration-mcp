"""MCP r4 (13-Nov-2026): D1 rows read per museum/annual facet page view, base (live code, seo r1) vs r4, measured with SQLite scan
statistics (sqlite3 CLI `.scanstats on`: rows visited per loop) on the local copy of live D1. Calibration: the base museum artist item
query visits 8,933 rows here; D1 insights (12/13-Nov) reports 8,954 rows read per run of the same query live.
  base page view  = SELECT DISTINCT <col> (whole collection) + the item query (whole collection via idx_items_feed)
  r4 page view    = the item query only (the slug map is cached 1 h per isolate + Cache API), on a copy with r4-indexes.sql applied
  r4 cold         = once per isolate per hour per facet column: the SELECT DISTINCT (unchanged cost, no longer per view)
Usage: python3 tests/r4_reads.py   (needs tests/r3/.data/live.sqlite and tests/r4/.data/live_idx.sqlite, which tests/test_r4.mjs writes)
Prints one line per facet kind and a total; exits 1 if any r4 item query does not use its r4 index or the mean r4 view is not < 1/5 of base."""
import os, random, re, sqlite3, subprocess, sys, statistics as st
HERE = os.path.dirname(os.path.abspath(__file__))
LIVE, IDX = os.path.join(HERE, "r3/.data/live.sqlite"), os.path.join(HERE, "r4/.data/live_idx.sqlite")
for f in (LIVE, IDX): assert os.path.getsize(f) > 0, f"missing {f} (run tests/test_r4.mjs first)"
MUS = {"artist": "designer", "museum": "company", "type": "industry", "culture": "country", "theme": "category"}
ANN = {"designer": "designer", "company": "company", "industry": "industry", "country": "country"}
ORD_B = {"museum": "featured_rank IS NULL, featured_rank, report_year, title LIMIT 400", "annual-report": "report_year, company"}
ORD_N = {"museum": "featured_rank IS NULL, featured_rank, report_year, title, owner_id, created_at DESC, rowid LIMIT 400",
         "annual-report": "report_year, company, owner_id, created_at DESC, rowid"}
q = lambda s: "'" + str(s).replace("'", "''") + "'"
def visited(db, sqls):
    """rows visited by the scans/searches of each statement (the top-level loops over items, as D1 counts rows read)"""
    script = ".scanstats on\n.mode list\n" + "".join(f"SELECT COUNT(*) FROM ({s});\n" for s in sqls)
    out = subprocess.run(["sqlite3", db], input=script, capture_output=True, text=True, check=True).stdout
    res, cur = [], None
    for line in out.splitlines():
        if re.match(r"^\d+$", line.strip()):
            if cur is not None: res.append(cur)
            cur = {"rows": 0, "plan": []}
        m = re.search(r"(SCAN|SEARCH) items\b(.*?)\s+\(loops=\d+ rows=(\d+)\)", line)
        if m and cur is not None: cur["rows"] += int(m.group(3)); cur["plan"].append(m.group(2).strip())
    if cur is not None: res.append(cur)
    assert len(res) == len(sqls), (len(res), len(sqls), out[:400])
    return res
con = sqlite3.connect(LIVE); random.seed(13)
ok, lines, tb, tn, bad = True, [], 0, 0, []
for coll, kinds in (("museum", MUS), ("annual-report", ANN)):
    for kind, col in kinds.items():
        vals = [r[0] for r in con.execute(f"SELECT DISTINCT {col} FROM items WHERE status='published' AND collection='{coll}' AND {col} IS NOT NULL AND {col}<>''")]
        sample = random.sample(vals, min(40, len(vals)))
        dist = f"SELECT DISTINCT {col} AS v FROM items WHERE status='published' AND collection='{coll}' AND {col} IS NOT NULL AND {col}<>''"
        base_sql = [dist] + [f"SELECT * FROM items WHERE status='published' AND collection='{coll}' AND {col}={q(v)} ORDER BY {ORD_B[coll]}" for v in sample]
        new_sql = [dist] + [f"SELECT * FROM items WHERE status='published' AND collection='{coll}' AND {col}={q(v)} ORDER BY {ORD_N[coll]}" for v in sample]
        b, n = visited(LIVE, base_sql), visited(IDX, new_sql)
        bd, nd = b[0]["rows"], n[0]["rows"]
        bv = [bd + x["rows"] for x in b[1:]]                    # base: DISTINCT + item query on every view
        nv = [x["rows"] for x in n[1:]]                          # r4 warm: item query only
        for x in n[1:]:
            if not any(p.startswith("USING") and "idx_r4_" in p for p in x["plan"]): bad.append(f"{coll}/{kind}: {x['plan']}")
        tb += sum(bv); tn += sum(nv)
        lines.append(f"{coll:13} {kind:9} {len(sample):3} pages: base {st.mean(bv):7.0f} rows/view (max {max(bv)}), r4 {st.mean(nv):6.1f} rows/view "
                     f"(max {max(nv)}), r4 cold map load {nd} rows once per isolate-hour")
print("\n".join(lines))
print(f"total over the sample: base {tb:,} rows, r4 {tn:,} rows ({tb / max(tn, 1):.0f}x fewer per warm view)")
if bad: print("FAIL r4 item queries without their r4 index:", bad[:4]); ok = False
if not tn * 5 < tb: print("FAIL r4 is not < 1/5 of base"); ok = False
print("r4 reads: PASS" if ok else "r4 reads: FAIL")
sys.exit(0 if ok else 1)
