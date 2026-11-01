"""Rebuilt MCP history from mcp_calls (tool, query, ip, ua, time per call since 23-Aug-2026), for the period before
mcp_events existed (29-Oct-2026). Estimates only: sessions = same IP+UA with no gap over 30 min; claude.ai calls come
from Anthropic's shared servers, so their 'sessions' merge different people and returning-visitor stats skip them.
Snapshot is written to reports/mcp_history_<date>.md with no raw IPs (visitors are salted hashes)."""
import re, time, json, hashlib, datetime, collections, urllib.request

OWN_IP = "129.126.14.17"
GAP = 30 * 60 * 1000
# Same as MCP_BOT_UA in src/index.js, plus uptime monitors / directory checkers that call the same 3 tools on a timer.
BOT = re.compile(r"^(curl/|undici|python-|Go-http-client|node-fetch|axios|okhttp|aiohttp|httpx|Wget|Java/|node$|mgd-selftest)"
                 r"|mcp-probe|MCPYP|evyAI|scanner|AMP-Server|amp-mcp-tester|Inspection", re.I)
SITE = "https://madegooddesigns.com/inspiration/mcp"


def client(ua):
    if not ua: return "unknown (logged before UA)"
    for name, rx in [("claude.ai", r"^Claude-User"), ("Claude Code", r"^claude-code"), ("Claude Desktop", r"\bClaude/\d"),
                     ("Cursor", r"^Cursor"), ("Codex", r"^codex"), ("ChatGPT", r"openai-mcp|ChatGPT"), ("VS Code", r"vscode|copilot"),
                     ("PowerShell script", r"PowerShell"), ("Browser", r"^Mozilla/")]:
        if re.search(rx, ua or "", re.I): return name
    return "other"


def sgt(ms): return datetime.datetime.utcfromtimestamp(ms / 1000 + 8 * 3600)


def run(sql, rerun_zero=False):
    rows = sql(f"SELECT tool, query, created_at, COALESCE(ip,'') ip, COALESCE(ua,'') ua FROM mcp_calls "
               f"WHERE COALESCE(ip,'')!='{OWN_IP}' ORDER BY created_at")
    real = [r for r in rows if not BOT.search(r["ua"])]
    for r in real: r["client"] = client(r["ua"]); r["vis"] = hashlib.sha256(f"hist|{r['ip']}|{r['ua']}".encode()).hexdigest()[:12]
    out = []
    p = out.append
    first, last = sgt(rows[0]["created_at"]), sgt(rows[-1]["created_at"])
    p(f"# MCP history (rebuilt from mcp_calls) — {first:%d %b %Y} to {last:%d %b %Y %H:%M} SGT")
    p(f"Snapshot taken {datetime.datetime.now():%d %b %Y %H:%M}. {len(rows)} logged calls; {len(rows)-len(real)} were bots, monitors or scanners "
      f"(excluded); {len(real)} from real clients. My own IP excluded throughout.\n")

    def tbl(title, head, data, note=""):
        p(f"\n## {title}" + (f"\n{note}" if note else ""))
        if not data: p("(none)"); return
        p("| " + " | ".join(head) + " |"); p("|" + "---|" * len(head))
        for d in data: p("| " + " | ".join(str(x) for x in d) + " |")

    # sessions
    sess, cur = [], {}
    for r in real:
        k = (r["ip"], r["ua"]); s = cur.get(k)
        if s and r["created_at"] - s["end"] <= GAP and r["ip"]:
            s["calls"].append(r); s["end"] = r["created_at"]
        else:
            s = cur[k] = {"client": r["client"], "vis": r["vis"], "start": r["created_at"], "end": r["created_at"], "calls": [r]}; sess.append(s)

    by_c = collections.defaultdict(lambda: {"calls": 0, "sess": 0, "vis": set(), "first": None})
    for s in sess:
        c = by_c[s["client"]]; c["calls"] += len(s["calls"]); c["sess"] += 1; c["vis"].add(s["vis"])
        c["first"] = c["first"] or sgt(s["start"]).strftime("%d %b")
    tbl("Usage by client app", ["client", "calls", "est. sessions", "calls/session", "IP+UA visitors", "first seen"],
        [(k, v["calls"], v["sess"], round(v["calls"] / v["sess"], 1), v["vis"] and len(v["vis"]) if k != "claude.ai" else "n/a (shared IPs)", v["first"])
         for k, v in sorted(by_c.items(), key=lambda x: -x[1]["calls"])])

    wk = collections.OrderedDict()
    for r in real:
        d = sgt(r["created_at"]); w = (d - datetime.timedelta(days=d.weekday())).strftime("%d %b")
        wk.setdefault(w, collections.Counter())[r["client"]] += 1
    cl = [k for k, _ in sorted(by_c.items(), key=lambda x: -x[1]["calls"])]
    tbl("Calls per week (week starting Monday, SGT)", ["week"] + cl + ["total"], [[w] + [c[x] for x in cl] + [sum(c.values())] for w, c in wk.items()])

    desk = collections.defaultdict(set)
    for r in real:
        if r["client"] != "claude.ai" and r["ip"]: desk[(r["client"], r["vis"])].add(sgt(r["created_at"]).date())
    rc = collections.defaultdict(lambda: [0, 0, 0])
    for (c, _), days in desk.items(): x = rc[c]; x[0] += 1; x[1] += len(days) > 1; x[2] = max(x[2], len(days))
    tbl("Returning visitors (desktop clients only; same IP + app version on another day)", ["client", "visitors", "came back another day", "most days"],
        [(c, *v) for c, v in sorted(rc.items(), key=lambda x: -x[1][0])],
        "Undercounts: an app update or a new IP looks like a new visitor.")

    tools = collections.Counter(r["tool"] for r in real)
    tbl("Tools", ["tool", "calls", "sessions using it"],
        [(t, n, sum(any(c["tool"] == t for c in s["calls"]) for s in sess)) for t, n in tools.most_common()])

    chains = collections.Counter()
    for s in sess:
        for a, b in zip(s["calls"], s["calls"][1:]):
            if a["tool"] != b["tool"]: chains[f"{a['tool']} → {b['tool']}"] += 1
    tbl("Common tool chains (consecutive calls within an estimated session)", ["chain", "n"], chains.most_common(12))

    lens = collections.Counter(min(len(s["calls"]), 10) for s in sess)
    tbl("Session length (calls per estimated session)", ["calls", "sessions"], [("10+" if k == 10 else k, lens[k]) for k in sorted(lens)])

    qs = collections.Counter((r["tool"], (r["query"] or "").strip().lower()) for r in real if (r["query"] or "").strip())
    tbl("Top queries", ["tool", "query", "times"], [(t, q[:70].replace("|", "/"), n) for (t, q), n in qs.most_common(30)])

    if rerun_zero:
        zeros, done = [], 0
        for (t, q), n in qs.items():
            if not t.startswith("search_"): continue
            body = json.dumps({"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": t, "arguments": {"query": q}}}).encode()
            req = urllib.request.Request(SITE, data=body, headers={"content-type": "application/json", "accept": "application/json, text/event-stream",
                                                                    "user-agent": "curl/8.4.0"})  # bot UA → excluded from both tables
            try:
                txt = json.loads(urllib.request.urlopen(req, timeout=60).read())["result"]["content"][0]["text"]
            except Exception as e:
                txt = f"ERR {e}"
            done += 1
            if re.match(r"0 [^\n]*result|No matches —", txt): zeros.append((t, q[:70].replace("|", "/"), n))
            time.sleep(0.4)
        tbl(f"Past searches that STILL return nothing today ({len(zeros)} of {done} distinct searches re-run)", ["tool", "query", "times asked"],
            sorted(zeros, key=lambda z: -z[2]), "Re-run against today's library; old theme/year filters weren't logged, so they're dropped.")

    p("\n## Can't be rebuilt\nClient-reported app names/versions, connections without tool calls, errors, latency, country, and site visits "
      "from MCP answers (UTM tags start 29-Oct-2026). Use `python3 mcp_report.py 7` for those from 29-Oct on.")
    text = "\n".join(out); print(text)
    import os; os.makedirs("reports", exist_ok=True)
    fn = f"reports/mcp_history_{datetime.date.today()}.md"; open(fn, "w").write(text + "\n"); print(f"\nSaved {fn}")
