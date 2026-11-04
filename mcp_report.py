"""MCP analytics report (mcp_events + mcp_calls in D1). Usage: python3 mcp_report.py [days=7] [--include-bots]
History (all of mcp_calls since Aug, rebuilt estimates): python3 mcp_report.py --history [--rerun-zero]  → also saved to reports/
mcp_events started 29-Oct-2026 (connections, sessions, outcomes); mcp_calls has the per-call query text since Aug.
Bots/scanners (curl, undici, probes — incl. our own live tests) are excluded via the bot flag / UA."""
import subprocess, json, os, re, sys, time
os.chdir(os.path.dirname(os.path.abspath(__file__)))
ARGS = [a for a in sys.argv[1:] if not a.startswith("--")]
DAYS = int(ARGS[0]) if ARGS else 7
BOT = "bot>=0" if "--include-bots" in sys.argv else "bot=0"  # --include-bots: sanity-check the queries on test traffic
W = f"created_at > (strftime('%s','now')-{DAYS}*86400)*1000"
SG = "datetime(created_at/1000,'unixepoch','+8 hours')"
# Liveness probes / catalog crawlers that send a real clientInfo but never use tools (2-Nov-2026 audit): glimind SentinelOracle alone was
# 937 "connections" in 7 days. The Worker now bot-flags SentinelOracle/histor by UA; this also drops them (and older rows) by client name.
BOT_CLIENTS = "('glimind-probe','histor','catalog-health','mcpcost','probe','agentready-probe','agentservicedirectory.com','analytics-test')"
NOT_BOT_CLIENT = "" if "--include-bots" in sys.argv else (
    f" AND visitor NOT IN (SELECT visitor FROM mcp_events WHERE kind='initialize' AND client_name IN {BOT_CLIENTS} AND {W})")
EV = f"FROM mcp_events WHERE {BOT} AND {W}{NOT_BOT_CLIENT}"
CALLS_EX = "1=1" if "--include-bots" in sys.argv else "ip!='129.126.14.17' AND ua NOT LIKE 'curl/%'"


def sql(q, tries=4):
    # D1 over the API intermittently answers 7403 / network errors (the "first query errors" seen 1–2 Nov-2026): retry with backoff.
    for i in range(tries):
        p = subprocess.run(["npx", "wrangler", "d1", "execute", "mgd-inspiration", "--remote", "--json", "--command", q],
                           capture_output=True, text=True, env=dict(os.environ, CI="1", WRANGLER_SEND_METRICS="false"))
        # wrangler can print banners/warnings before or after the JSON ("Extra data" crash, 31-Oct-2026): decode just the JSON array.
        o = p.stdout; m = re.search(r"\[\s*\{", o)
        if m:
            try:
                d = json.JSONDecoder().raw_decode(o[m.start():])[0]
                if isinstance(d, list) and d and "results" in d[0]: return d[0]["results"]
            except ValueError: pass
            # an error object can also start with "[{" (KeyError 'results', 4-Nov-2026 night): fall through and retry
        err = (p.stderr or o).strip()
        if i == tries - 1 or "SQLITE_ERROR" in err or "no such" in err: sys.exit(err)  # real SQL errors: don't retry
        time.sleep(3 * (i + 1))


def table(title, rows):
    print(f"\n## {title}")
    if not rows: print("  (none)"); return
    keys = list(rows[0].keys())
    print("  " + " | ".join(keys))
    for r in rows: print("  " + " | ".join("" if r[k] is None else str(r[k]) for k in keys))


if "--history" in sys.argv:
    import mcp_history; mcp_history.run(sql, "--rerun-zero" in sys.argv); sys.exit()

print(f"# MCP report — last {DAYS} days (bots excluded)")
table("Totals", sql(f"SELECT SUM(kind='initialize') connections, COUNT(DISTINCT CASE WHEN kind='initialize' THEN visitor END) connecting_visitors, "
                    f"SUM(kind='call') calls, COUNT(DISTINCT CASE WHEN kind='call' THEN session_id END) sessions_with_calls, "
                    f"SUM(kind='call' AND ok=0) errors, SUM(zero=1) zero_results {EV}"))
# KPIs (2-Nov-2026, docs/MCP-UX-AUDIT-2026-11-02.md). Visitor = salted hash of IP+UA, so claude.ai (Anthropic server IPs) under-counts people.
table("KPIs by client: activation = visitors who called ≥1 tool / visitors who connected (via=proxy: Claude-User UA = Anthropic egress IPs, so 1 visitor ≠ 1 person)", sql(
    f"SELECT COALESCE(i.client_name,'?') client, i.via, COUNT(DISTINCT i.visitor) connected, COUNT(DISTINCT c.visitor) activated, "
    f"ROUND(100.0*COUNT(DISTINCT c.visitor)/COUNT(DISTINCT i.visitor),1) activation_pct, SUM(c.n) calls, ROUND(1.0*SUM(c.n)/MAX(COUNT(DISTINCT c.visitor),1),1) calls_per_active "
    f"FROM (SELECT DISTINCT visitor, client_name, CASE WHEN ua LIKE 'Claude-User%' THEN 'proxy' ELSE 'direct' END via {EV} AND kind='initialize') i "
    f"LEFT JOIN (SELECT visitor, COUNT(*) n {EV} AND kind='call' GROUP BY visitor) c USING(visitor) "
    f"GROUP BY 1,2 HAVING connected >= 3 ORDER BY 3 DESC LIMIT 14"))
table("Retention: callers who called again on a later day (D7-style, within the window)", sql(
    f"SELECT COUNT(*) callers, SUM(days>1) called_on_2plus_days, ROUND(100.0*SUM(days>1)/MAX(COUNT(*),1),1) pct "
    f"FROM (SELECT visitor, COUNT(DISTINCT date({SG})) days {EV} AND kind='call' GROUP BY visitor)"))
table("Prompts (slash commands) used", sql(f"SELECT kind, COALESCE(tool,'') prompt, COUNT(*) n {EV} AND kind IN ('prompt','prompts_list') GROUP BY 1,2 ORDER BY 3 DESC"))
table("Endpoint profile (public = /mcp all tools, public-core = /mcp/core)", sql(f"SELECT endpoint, SUM(kind='initialize') connects, SUM(kind='call') calls {EV} GROUP BY 1"))
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
# mcp_calls (query text) and mcp_events (zero flag) are separate rows, matched by tool+UA+time. When several calls of one tool
# fire together (claude.ai fan-out), only `zero_events` of the `parallel` calls returned 0 — those rows are ambiguous, not all empty
# (the 30-Oct "5 museum searches all returned 0" was 1 real zero, Bauhaus, smeared over 5 parallel calls).
table("Zero-result searches (content gaps; parallel>zero_events = ambiguous, only some of those calls were empty)", sql(
    f"SELECT {SG} t, tool, substr(query,1,70) query, "
    f"(SELECT COUNT(*) FROM mcp_calls c2 WHERE c2.tool=mcp_calls.tool AND c2.ua=mcp_calls.ua AND ABS(c2.created_at-mcp_calls.created_at)<=3000) parallel, "
    f"(SELECT COUNT(*) FROM mcp_events e WHERE e.zero=1 AND e.{BOT} AND e.tool=mcp_calls.tool AND e.ua=mcp_calls.ua "
    f"AND e.created_at BETWEEN mcp_calls.created_at AND mcp_calls.created_at+15000) zero_events "
    f"FROM mcp_calls WHERE {CALLS_EX} AND {W} AND query != '' AND EXISTS ("
    f"SELECT 1 FROM mcp_events e WHERE e.zero=1 AND e.{BOT} AND e.tool=mcp_calls.tool AND e.ua=mcp_calls.ua "
    f"AND e.created_at BETWEEN mcp_calls.created_at AND mcp_calls.created_at+15000) ORDER BY created_at DESC LIMIT 40"))
table("What people searched for (all queries)", sql(
    f"SELECT {SG} t, tool, substr(query,1,90) query, CASE WHEN ua LIKE 'Claude-User%' THEN 'claude.ai' ELSE substr(ua,1,20) END app "
    f"FROM mcp_calls WHERE {CALLS_EX} AND {W} AND query != '' AND ua NOT LIKE 'AMP-Server%' AND ua NOT LIKE 'undici%' AND ua NOT LIKE 'Go-http%' "
    f"AND ua NOT LIKE 'python-%' ORDER BY created_at DESC LIMIT 200"))
table("Countries (desktop clients; claude.ai shows Anthropic's servers)", sql(
    f"SELECT country, COUNT(DISTINCT visitor) visitors, COUNT(*) events {EV} AND ua NOT LIKE 'Claude-User%' GROUP BY 1 ORDER BY 2 DESC LIMIT 10"))
print("\nVisits from MCP answers: GA4 → Reports → Acquisition → Traffic acquisition, filter Session source = 'mcp' "
      "(campaign = tool, content = client app). Links are tagged since 29-Oct-2026.")
