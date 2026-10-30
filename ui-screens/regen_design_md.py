#!/usr/bin/env python3
"""Regenerate the UI screens' DESIGN.md files (R2: ui/<id>/DESIGN.md) in the spec-conformant format (DESIGN.md alpha, 31-Oct-2026).
Only R2 objects change: D1 rows, screenshots and index.html are untouched (so ingest.py's image-versioning path isn't needed).

Steps (run from ui-screens/):
  python3 regen_design_md.py gen                  # node gen.js --md-only  → out/<slug>/DESIGN.md (local only; old local copies backed up first)
  python3 regen_design_md.py check                # local: colours == meta.json tokens, every file lints 0 errors / 0 warnings (official linter)
  python3 regen_design_md.py backup  [--remote]   # READ-ONLY: download the current ui/<id>/DESIGN.md for every live screen → backup dir
  python3 regen_design_md.py upload  [--remote|--local PERSIST_DIR] [--limit N] [--dry]
  python3 regen_design_md.py verify               # live: GET /inspiration/ui/raw/<id>.md?v=… for a sample, front matter present + lints
  python3 regen_design_md.py rollback [--remote|--local PERSIST_DIR]   # re-upload every backed-up file listed in the upload log
slug → id comes from D1 (read-only): items.source_url = https://madegooddesigns.com/inspiration/ui#<slug>.
Logs: regen_logs/<date>/{map.json, backup/<id>.md, upload.jsonl, purge_urls.txt}. Needs: npx wrangler (logged in), and the design.md CLI
($DESIGNMD_LIB = path to node_modules/@google/design.md, or it is installed into regen_logs/node_modules on first use)."""
import json, os, re, subprocess, sys, time, shutil
from concurrent.futures import ThreadPoolExecutor

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE); OUT = os.path.join(HERE, "out")
LOGS = os.path.join(HERE, "regen_logs", os.environ.get("REGEN_DATE", "2026-10-31"))
BUCKET = "mgd-inspiration-images"
SITE = "https://madegooddesigns.com/inspiration"
ARGS = sys.argv[1:]
def opt(k, d=None):
    return ARGS[ARGS.index(k) + 1] if k in ARGS and ARGS.index(k) + 1 < len(ARGS) else d
os.makedirs(LOGS, exist_ok=True)


def wrangler(args, check=True):
    p = subprocess.run(["npx", "wrangler"] + args, cwd=ROOT, capture_output=True, text=True, env=dict(os.environ, CI="1", WRANGLER_SEND_METRICS="false"))
    if check and p.returncode != 0: raise RuntimeError((p.stderr or p.stdout)[-400:])
    return p


def d1(sql, where):
    p = wrangler(["d1", "execute", "mgd-inspiration", "--json", "--command", sql] + where)
    m = re.search(r"\[\s*\{", p.stdout)
    return json.JSONDecoder().raw_decode(p.stdout[m.start():])[0][0]["results"] if m else []


def target():
    if "--local" in ARGS: return ["--local", "--persist-to", opt("--local")]
    if "--remote" in ARGS: return ["--remote"]
    sys.exit("pass --remote or --local PERSIST_DIR")


def id_map(where):
    rows = d1("SELECT id, source_url FROM items WHERE collection='ui' AND status='published'", where)
    m = {r["source_url"].split("#", 1)[1]: r["id"] for r in rows if "#" in (r["source_url"] or "")}
    json.dump(m, open(os.path.join(LOGS, "map.json"), "w"), indent=0)
    return m


def linter():
    lib = os.environ.get("DESIGNMD_LIB") or os.path.join(LOGS, "..", "node_modules", "@google", "design.md")
    if not os.path.isdir(lib):
        subprocess.run(["npm", "i", "--prefix", os.path.join(LOGS, ".."), "@google/design.md@0.4.0"], check=True, capture_output=True)
    return lib


def lint_files(files):
    """Lint many files in ONE node process with the official linter API. Returns {file: summary}."""
    lib = linter()
    js = ("import {lint} from %s;import fs from 'fs';const out={};for(const f of JSON.parse(fs.readFileSync(process.env.LINT_LIST,'utf8'))){"
          "const r=lint(fs.readFileSync(f,'utf8'));out[f]={e:r.summary.errors,w:r.summary.warnings,f:r.findings.filter(x=>x.severity!=='info').slice(0,3)}}"
          "process.stdout.write(JSON.stringify(out))") % json.dumps("file://" + os.path.join(os.path.abspath(lib), "dist", "linter", "index.js"))
    lst = os.path.join(LOGS, "lint_list.json"); json.dump(files, open(lst, "w"))
    p = subprocess.run(["node", "--input-type=module", "-e", js], capture_output=True, text=True, cwd=os.path.join(LOGS, ".."), env=dict(os.environ, LINT_LIST=lst))
    if p.returncode: sys.exit("linter failed: " + p.stderr[-500:])
    return json.loads(p.stdout)


def slugs():
    return sorted(d for d in os.listdir(OUT) if os.path.isfile(os.path.join(OUT, d, "meta.json")) and os.path.isfile(os.path.join(OUT, d, "screen.png")))


cmd = ARGS[0] if ARGS else "help"
if cmd == "gen":
    bk = os.path.join(LOGS, "local_out_backup")
    if not os.path.isdir(bk):
        for s in slugs():
            f = os.path.join(OUT, s, "DESIGN.md")
            if os.path.isfile(f): os.makedirs(os.path.join(bk, s), exist_ok=True); shutil.copy2(f, os.path.join(bk, s, "DESIGN.md"))
    p = subprocess.run(["node", "gen.js", "--md-only"], cwd=HERE, capture_output=True, text=True)
    print(p.stdout.strip(), p.stderr.strip()[-300:]); sys.exit(p.returncode)

elif cmd == "check":
    bad, files = 0, []
    for s in slugs():
        md = open(os.path.join(OUT, s, "DESIGN.md")).read(); meta = json.load(open(os.path.join(OUT, s, "meta.json")))
        files.append(os.path.join(OUT, s, "DESIGN.md"))
        if not md.startswith("---\nversion: alpha\n"): bad += 1; print("no front matter", s); continue
        for k, v in meta["tokens"]["light"].items():
            if f'\n  {k}: "{v.lower()}"' not in md: bad += 1; print("colour mismatch", s, k, v); break
        for k, v in meta["tokens"]["dark"].items():
            if f'\n  dark-{k}: "{v.lower()}"' not in md: bad += 1; print("dark colour mismatch", s, k, v); break
    res = lint_files(files)
    lint_bad = {f: r for f, r in res.items() if r["e"] or r["w"]}
    for f, r in list(lint_bad.items())[:10]: print("lint", os.path.basename(os.path.dirname(f)), r)
    print(f"check: {len(files)} files, {bad} token problems, {len(lint_bad)} with lint errors/warnings "
          f"(errors {sum(r['e'] for r in res.values())}, warnings {sum(r['w'] for r in res.values())})")
    sys.exit(1 if bad or lint_bad else 0)

elif cmd == "backup":
    where = target(); m = id_map(where); d = os.path.join(LOGS, "backup"); os.makedirs(d, exist_ok=True)
    def one(item):
        slug, i = item; f = os.path.join(d, i + ".md")
        if os.path.isfile(f) and os.path.getsize(f) > 0: return "have"
        for _ in range(3):
            p = wrangler(["r2", "object", "get", f"{BUCKET}/ui/{i}/DESIGN.md", "--file", f] + where, check=False)
            if p.returncode == 0 and os.path.isfile(f) and os.path.getsize(f) > 0: return "ok"
            time.sleep(2)
        return "FAIL"
    with ThreadPoolExecutor(8) as ex: res = list(ex.map(one, m.items()))
    print("backup:", {k: res.count(k) for k in set(res)}, "→", d); sys.exit(1 if "FAIL" in res else 0)

elif cmd == "upload":
    where = target(); m = id_map(where); dry = "--dry" in ARGS; lim = int(opt("--limit", "0") or 0)
    todo = [(s, m[s]) for s in slugs() if s in m]
    missing = [s for s in slugs() if s not in m]
    if lim: todo = todo[:lim]
    if "--remote" in ARGS and not dry:
        bk = os.path.join(LOGS, "backup"); nob = [i for _, i in todo if not os.path.isfile(os.path.join(bk, i + ".md"))]
        if nob: sys.exit(f"{len(nob)} screens have no backup yet — run `backup --remote` first")
    print(f"upload: {len(todo)} screens ({len(missing)} local slugs not live: {missing[:5]}){' [dry]' if dry else ''}")
    if dry: sys.exit(0)
    log = open(os.path.join(LOGS, "upload.jsonl"), "a")
    def one(item):
        slug, i = item
        for _ in range(3):
            p = wrangler(["r2", "object", "put", f"{BUCKET}/ui/{i}/DESIGN.md", "--file", os.path.join(OUT, slug, "DESIGN.md"),
                          "--content-type", "text/markdown; charset=utf-8"] + where, check=False)
            if p.returncode == 0: return slug, i, "ok"
            time.sleep(2)
        return slug, i, "FAIL"
    res = []
    with ThreadPoolExecutor(8) as ex:
        for slug, i, st in ex.map(one, todo):
            res.append(st); log.write(json.dumps({"t": time.time(), "slug": slug, "id": i, "status": st, "target": where[0]}) + "\n"); log.flush()
    open(os.path.join(LOGS, "purge_urls.txt"), "w").write("".join(f"{SITE}/ui/raw/{i}.md\n" for _, i in todo))
    print("upload:", {k: res.count(k) for k in set(res)}, "log:", os.path.join(LOGS, "upload.jsonl")); sys.exit(1 if "FAIL" in res else 0)

elif cmd == "verify":
    import urllib.request
    m = json.load(open(os.path.join(LOGS, "map.json"))); sample = list(m.values())[:: max(1, len(m) // 12)]
    files, bad = [], 0
    for i in sample:
        req = urllib.request.Request(f"{opt('--base', SITE)}/ui/raw/{i}.md?v={int(time.time())}", headers={"User-Agent": "curl/8.4.0", "Accept": "*/*"})
        t = urllib.request.urlopen(req, timeout=30).read().decode()
        f = os.path.join(LOGS, f"verify_{i}.md"); open(f, "w").write(t); files.append(f)
        if not t.startswith("---\nversion: alpha\n") or "UI by Made Good Designs" not in t: bad += 1; print("bad", i, t[:80])
    res = lint_files(files); lb = [f for f, r in res.items() if r["e"] or r["w"]]
    print(f"verify: {len(files)} live files, {bad} without front matter/credit, {len(lb)} not lint-clean"); sys.exit(1 if bad or lb else 0)

elif cmd == "rollback":
    where = target(); bk = os.path.join(LOGS, "backup")
    ids = sorted({json.loads(l)["id"] for l in open(os.path.join(LOGS, "upload.jsonl")) if json.loads(l)["status"] == "ok"})
    def one(i):
        p = wrangler(["r2", "object", "put", f"{BUCKET}/ui/{i}/DESIGN.md", "--file", os.path.join(bk, i + ".md"), "--content-type", "text/markdown; charset=utf-8"] + where, check=False)
        return "ok" if p.returncode == 0 else "FAIL"
    with ThreadPoolExecutor(8) as ex: res = list(ex.map(one, ids))
    print("rollback:", {k: res.count(k) for k in set(res)}); sys.exit(1 if "FAIL" in res else 0)
else:
    print(__doc__)
