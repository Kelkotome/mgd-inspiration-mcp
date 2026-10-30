#!/usr/bin/env python3
"""Build a LOCAL test DB for tests/rpc_designmd.py from a READ-ONLY sample of the live D1 (no remote writes).
Writes into $STATE_DIR (default /tmp/mgd-designmd-test): schema.sql, seed.sql, wrangler.jsonc (routes removed), live_tools.json."""
import json, os, re, subprocess, urllib.request
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
D = os.environ.get("STATE_DIR", "/tmp/mgd-designmd-test"); os.makedirs(D, exist_ok=True)
def q(sql):
    p = subprocess.run(["npx", "wrangler", "d1", "execute", "mgd-inspiration", "--remote", "--json", "--command", sql], cwd=ROOT, capture_output=True, text=True, env=dict(os.environ, CI="1"))
    m = re.search(r"\[\s*\{", p.stdout); return json.JSONDecoder().raw_decode(p.stdout[m.start():])[0][0]["results"]
# exact live schema (tables + indexes)
sch = q("SELECT sql FROM sqlite_master WHERE sql IS NOT NULL AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_%'")
open(os.path.join(D, "schema.sql"), "w").write(";\n".join(x["sql"] for x in sch if not x["sql"].startswith("CREATE VIRTUAL")) + ";\n")
rows = []
for coll, n in (("museum", 900), ("design", 400), ("annual-report", 150), ("ui", 300)):
    for off in range(0, n, 150):
        rows += q(f"SELECT * FROM items WHERE collection='{coll}' AND status='published' AND owner_id IS NULL ORDER BY featured_rank IS NULL, featured_rank, created_at DESC LIMIT 150 OFFSET {off}")
rows += q("SELECT * FROM items WHERE collection='museum' AND status='published' AND (designer LIKE '%Mucha%' OR designer LIKE '%Klimt%' OR title LIKE '%Klimt%' OR designer LIKE '%Hiroshige%' OR category IN ('art-deco','art-nouveau')) LIMIT 160")
rows += q("SELECT * FROM items WHERE collection='design' AND status='published' AND owner_id IS NULL AND (title LIKE '%serif%' OR tags LIKE '%serif%') LIMIT 60")
rows += q("SELECT * FROM items WHERE collection='annual-report' AND status='published' AND designer LIKE '%Paul Rand%' LIMIT 10")
rows += q("SELECT * FROM items WHERE collection='ui' AND status='published' AND (tags LIKE '%flow:%' OR title LIKE '%illing%') LIMIT 200")
lit = lambda v: "NULL" if v is None else repr(v) if isinstance(v, (int, float)) else "'" + str(v).replace("'", "''") + "'"
seen, out = set(), []
for r in rows:
    if r["id"] in seen: continue
    seen.add(r["id"]); ks = list(r.keys()); out.append(f"INSERT INTO items ({','.join(ks)}) VALUES ({','.join(lit(r[k]) for k in ks)});")
open(os.path.join(D, "seed.sql"), "w").write("\n".join(out) + "\n")
s = open(os.path.join(ROOT, "wrangler.jsonc")).read(); i = s.index('"routes"'); j = s.index("]", i) + 1
open(os.path.join(D, "wrangler.jsonc"), "w").write((s[:i] + '"routes": []' + s[j:]).replace('"main": "src/index.js"', f'"main": "{ROOT}/src/index.js"'))
# baseline tools/list from the CURRENTLY DEPLOYED worker (read-only POST; curl UA = bot-flagged, excluded from analytics)
req = urllib.request.Request("https://madegooddesigns.com/inspiration/mcp", data=b'{"jsonrpc":"2.0","id":1,"method":"tools/list"}',
                             headers={"Content-Type": "application/json", "Accept": "*/*", "User-Agent": "curl/8.4.0"})
if not os.path.exists(os.path.join(D, "live_tools.json")):
    open(os.path.join(D, "live_tools.json"), "wb").write(urllib.request.urlopen(req, timeout=60).read())
print(len(out), "rows →", D)
