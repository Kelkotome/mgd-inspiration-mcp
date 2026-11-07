"""MCP search gap check (7-Nov-2026): replays every distinct real search query (mcp_calls, own IP / curl / 5-Nov scraper excluded)
against the live server and classifies each answer from its header line: zero, partial ("no item matches every word" / "unmatched:"),
thin (1-2 results) or ok. Replays use UA curl/8.4.0, so they are excluded from MCP stats. Takes ~15 min for ~1,000 queries.
Usage: python3 -u mcp_gap_replay.py [out.json]   → prints counts per tool, zero/thin queries and the most common unmatched UI words."""
import json, os, re, subprocess, sys, time, collections, urllib.request, concurrent.futures as cf
os.chdir(os.path.dirname(os.path.abspath(__file__)))


def sql(q):  # read-only D1 query via wrangler (importing mcp_report would run the whole report)
    p = subprocess.run(["npx", "wrangler", "d1", "execute", "mgd-inspiration", "--remote", "--json", "--command", q],
                       capture_output=True, text=True, env=dict(os.environ, CI="1", WRANGLER_SEND_METRICS="false"))
    m = re.search(r"\[\s*\{", p.stdout)
    if not m: sys.exit(p.stderr or p.stdout)
    return json.JSONDecoder().raw_decode(p.stdout[m.start():])[0][0]["results"]

OUT = sys.argv[1] if len(sys.argv) > 1 else "reports/mcp_gap_replay.json"
ARG = {"search_design_inspiration": "query", "search_ui_screens": "query", "search_icons": "query", "search_museum_art": "query",
       "search_annual_reports": "query", "get_font_pairing": "font", "get_brand_typeface": "brand", "generate_logo_concepts": "name"}
SCRAPER = "2409:40d4:40cf:3d67%"  # 5-Nov bulk copier (clients test / cloner)
Q = sql("SELECT tool, lower(trim(query)) q, COUNT(*) n, COUNT(DISTINCT ip||ua) people FROM mcp_calls WHERE COALESCE(ip,'')!='129.126.14.17' "
        f"AND ua NOT LIKE 'curl/%' AND COALESCE(query,'')!='' AND COALESCE(ip,'') NOT LIKE '{SCRAPER}' AND tool IN ({','.join(repr(t) for t in ARG)}) GROUP BY 1,2")


def call(r):
    body = json.dumps({"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": r["tool"], "arguments": {ARG[r["tool"]]: r["q"]}}}).encode()
    req = urllib.request.Request("https://madegooddesigns.com/inspiration/mcp", body,
                                 {"User-Agent": "curl/8.4.0", "Accept": "application/json, text/event-stream", "Content-Type": "application/json"})
    last = ""
    for i in range(3):
        try:
            res = json.load(urllib.request.urlopen(req, timeout=60))["result"]; t = res["content"][0]["text"]
            return {**r, "head": t.split("\n")[0][:400], "titles": re.findall(r"^• (.+)$", t, re.M)[:4], "err": bool(res.get("isError"))}
        except Exception as e:
            last = str(e); time.sleep(3 * (i + 1))
    return {**r, "head": "FAILED " + last, "titles": [], "err": True}


def cls(r):
    h = r["head"]; m = re.match(r"(\d+) ", h); n = int(m.group(1)) if m else None
    if r["err"]: return "error"
    if n == 0 or "0 results" in h[:20]: return "zero"
    if re.search(r"no (item|screen) matches every|closest match|unmatched", h): return "partial"
    return "thin" if n is not None and n <= 2 else "ok"


out = []
with cf.ThreadPoolExecutor(3) as ex:
    for i, x in enumerate(ex.map(call, Q)):
        x["c"] = cls(x); out.append(x)
        if i % 100 == 0: print(i, "/", len(Q), flush=True)
json.dump(out, open(OUT, "w"), indent=0)
by = collections.defaultdict(collections.Counter)
for r in out: by[r["tool"]][r["c"]] += 1
print("\n## Result quality per tool"); [print(f"  {t}: {dict(c)}") for t, c in by.items()]
print("\n## Zero / thin (excluding icons)")
for r in out:
    if r["c"] in ("zero", "thin", "error") and r["tool"] != "search_icons": print(f"  {r['c']:5} {r['tool']:26} {r['q'][:80]}")
w = collections.Counter()
for r in out:
    m = re.search(r"unmatched: ([^)]+)\)", r["head"])
    if m: w.update(x.strip() for x in m.group(1).split(","))
print("\n## Most common unmatched words in UI searches\n  ", w.most_common(40))
print(f"\nSaved {OUT}")
