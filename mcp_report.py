"""MCP analytics report (mcp_events + mcp_calls in D1). Usage: python3 mcp_report.py [days=7] [--include-bots]
mcp_events started 29-Oct-2026 (connections, sessions, outcomes); mcp_calls has the per-call query text since Aug.
Bots/scanners (curl, undici, probes — incl. our own live tests) are excluded via the bot flag / UA."""
import subprocess, json, os, sys
os.chdir(os.path.dirname(os.path.abspath(__file__)))
ARGS = [a for a in sys.argv[1:] if not a.startswith("--")]
DAYS = int(ARGS[0]) if ARGS else 7
BOT = "bot>=0" if "--include-bots" in sys.argv else "bot=0"  # --include-bots: sanity-check the queries on test traffic
W = f"created_at > (strftime('%s','now')-{DAYS}*86400)*1000"
SG = "datetime(created_at/1000,'unixepoch','+8 hours')"
EV = f"FROM mcp_events WHERE {BOT} AND {W}"
CALLS_EX = "1=1" if "--include-bots" in sys.argv else "ip!='129.126.14.17' AND ua NOT LIKE 'curl/%'"


def sql(q):
    p = subprocess.run(["npx", "wrangler", "d1", "execute", "mgd-inspiration", "--remote", "--json", "--command", q],
                       capture_output=True, text=True, env=dict(os.environ, CI="1", WRANGLER_SEND_METRICS="false"))
    o = p.stdout; i = o.find("[")
    if i < 0: sys.exit(p.stderr or o)
    return json.loads(o[i:])[0]["results"]


def table(title, rows):
    print(f"\n## {title}")
    if not rows: print("  (none)"); return
    keys = list(rows[0].keys())
    print("  " + " | ".join(keys))
    for r in rows: print("  " + " | ".join("" if r[k] is None else str(r[k]) for k in keys))


print(f"# MCP report — last {DAYS} days (bots excluded)")
table("Totals", sql(f"SELECT SUM(kind='initialize') connections, COUNT(DISTINCT CASE WHEN kind='initialize' THEN visitor END) connecting_visitors, "
                    f"SUM(kind='call') calls, COUNT(DISTINCT CASE WHEN kind='call' THEN session_id END) sessions_with_calls, "
                    f"SUM(kind='call' AND ok=0) errors, SUM(zero=1) zero_results {EV}"))
table("Connections by client app (from initialize)", sql(
    f"SELECT COALESCE(client_name,'?') client, COUNT(*) connections, COUNT(DISTINCT visitor) visitors, MAX(client_version) latest_version "
    f"{EV} AND kind='initialize' GROUP BY 1 ORDER BY 2 DESC LIMIT 15"))
table("Sessions: connected but never called a tool vs used", sql(
    f"SELECT i.client_name client, COUNT(*) sessions, SUM(c.n IS NULL) no_calls, ROUND(AVG(c.n),1) avg_calls, MAX(c.n) max_calls, ROUND(AVG(c.tools),1) avg_distinct_tools "
    f"FROM (SELECT session_id, client_name FROM mcp_events WHERE {BOT} AND {W} AND kind='initialize') i "
    f"LEFT JOIN (SELECT session_id, COUNT(*) n, COUNT(DISTINCT tool) tools FROM mcp_events WHERE kind='call' GROUP BY session_id) c USING(session_id) "
    f"GROUP BY 1 ORDER BY 2 DESC LIMIT 15"))
table("Calls by day (SGT)", sql(f"SELECT date({SG}) day, SUM(kind='initialize') connects, SUM(kind='call') calls, COUNT(DISTINCT session_id) sessions {EV} GROUP BY 1 ORDER BY 1"))
table("Tools: calls, errors, zero results, speed", sql(
    f"SELECT tool, COUNT(*) calls, SUM(ok=0) errors, SUM(zero=1) zero_results, CAST(AVG(ms) AS INT) avg_ms, MAX(ms) max_ms {EV} AND kind='call' GROUP BY tool ORDER BY 2 DESC"))
table("Common tool chains (consecutive calls in a session)", sql(
    f"SELECT a.tool || ' → ' || b.tool chain, COUNT(*) n FROM mcp_events a JOIN mcp_events b ON b.session_id=a.session_id AND b.kind='call' "
    f"AND b.created_at = (SELECT MIN(created_at) FROM mcp_events x WHERE x.session_id=a.session_id AND x.kind='call' AND x.created_at>a.created_at) "
    f"WHERE a.kind='call' AND a.{BOT} AND a.session_id IS NOT NULL AND a.{W} AND a.tool != b.tool GROUP BY 1 ORDER BY 2 DESC LIMIT 12"))
table("Returning visitors (desktop clients; claude.ai users can't be told apart)", sql(
    f"SELECT COUNT(*) visitors, SUM(days>1) returned_on_another_day, MAX(days) max_days FROM "
    f"(SELECT visitor, COUNT(DISTINCT date({SG})) days {EV} AND ua NOT LIKE 'Claude-User%' GROUP BY visitor)"))
table("Zero-result searches (content gaps for the library)", sql(
    f"SELECT {SG} t, tool, substr(query,1,70) query FROM mcp_calls WHERE {CALLS_EX} AND {W} AND query != '' AND EXISTS ("
    f"SELECT 1 FROM mcp_events e WHERE e.zero=1 AND e.{BOT} AND e.tool=mcp_calls.tool AND e.ua=mcp_calls.ua "
    f"AND e.created_at BETWEEN mcp_calls.created_at AND mcp_calls.created_at+15000) ORDER BY created_at DESC LIMIT 40"))
table("Countries (desktop clients; claude.ai shows Anthropic's servers)", sql(
    f"SELECT country, COUNT(DISTINCT visitor) visitors, COUNT(*) events {EV} AND ua NOT LIKE 'Claude-User%' GROUP BY 1 ORDER BY 2 DESC LIMIT 10"))
print("\nVisits from MCP answers: GA4 → Reports → Acquisition → Traffic acquisition, filter Session source = 'mcp' "
      "(campaign = tool, content = client app). Links are tagged since 29-Oct-2026.")
