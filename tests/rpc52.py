"""JSON-RPC checks for the batch-52 MCP tools (1-Nov-2026, special characters & typography) against a running Worker.
Local:  python3 tests/rpc52.py --base http://127.0.0.1:8841 --baseline-base http://127.0.0.1:8842   (8842 = a b51-mcp tree)
Live:   python3 tests/rpc52.py --base https://madegooddesigns.com
Checks: the 2 new tools are listed, start "Use when…" and are small; every baseline tool keeps its name, inputSchema and description;
a sample of existing tools returns byte-identical output vs the baseline; real inputs; bad inputs → isError; instructions < 1500 chars
and route to the new tools; tools/list size growth. UA curl/8.4.0 (bot-flagged, out of analytics)."""
import argparse, json, urllib.request
ap = argparse.ArgumentParser(); ap.add_argument("--base", default="http://127.0.0.1:8841"); ap.add_argument("--baseline-base"); args = ap.parse_args()
ok = fail = 0
def check(name, cond, info=""):
    global ok, fail
    ok += bool(cond); fail += not cond
    print(("PASS " if cond else "FAIL ") + name + ("" if cond else " | " + str(info)[:400]))
def rpc(base, method, params=None, pv="2025-06-18", raw=False):
    h = {"Content-Type": "application/json", "Accept": "application/json, text/event-stream", "User-Agent": "curl/8.4.0", "MCP-Protocol-Version": pv}
    req = urllib.request.Request(base.rstrip("/") + "/inspiration/mcp", data=json.dumps({"jsonrpc": "2.0", "id": 1, "method": method, "params": params or {}}).encode(), headers=h)
    with urllib.request.urlopen(req, timeout=120) as r:
        b = r.read()
        return (json.loads(b), len(b)) if raw else json.loads(b)
def call(name, a, base=None): return rpc(base or args.base, "tools/call", {"name": name, "arguments": a}).get("result", {})
def text(r): return "\n".join(c.get("text", "") for c in r.get("content", []) if c.get("type") == "text")
strip = lambda o: {k: strip(v) for k, v in o.items() if k != "description"} if isinstance(o, dict) else [strip(x) for x in o] if isinstance(o, list) else o
NEW = ["lookup_character", "fix_typography"]
ins = rpc(args.base, "initialize", {"protocolVersion": "2025-06-18", "capabilities": {}, "clientInfo": {"name": "rpc52", "version": "1"}})["result"].get("instructions", "")
check("instructions < 1500 chars", len(ins) < 1500, len(ins))
check("instructions route to the b52 tools", all(n in ins for n in NEW), ins[-300:])
check("instructions still route to older tools", all(n in ins for n in ["search_ui_screens", "get_ui_screen_code", "get_ui_flow", "search_design_inspiration", "search_museum_art", "search_annual_reports", "generate_website_color_palette", "generate_design_md", "generate_logo_concepts", "make_extruded_part", "get_book_cover_size"]))
res, size = rpc(args.base, "tools/list", raw=True); tools = res["result"]["tools"]; by = {t["name"]: t for t in tools}
for n in NEW:
    check(f"tools/list has {n}", n in by)
    if n in by: check(f"{n} description starts 'Use when' and < 650 chars", by[n]["description"].startswith("Use when") and len(by[n]["description"]) < 650, len(by[n]["description"]))
check("no duplicate tool names", len(by) == len(tools))
added = sum(len(json.dumps(by[n])) for n in NEW if n in by)
print(f"tools/list: {len(tools)} tools, {size:,} bytes; the 2 new tools add {added:,} bytes")
check("2 new tools add < 4 KB to tools/list", added < 4096, added)
if args.baseline_base:
    bres, bsize = rpc(args.baseline_base, "tools/list", raw=True); base = bres["result"]["tools"]
    check(f"tool count = baseline + 2 ({len(base)} + 2)", len(tools) == len(base) + 2, len(tools))
    for t in base:
        n = t["name"]
        check(f"backward compatible: {n}", n in by and strip(t["inputSchema"]) == strip(by[n]["inputSchema"]) and t["description"] == by[n]["description"], n)
    for n, a in [("count_characters", {"text": "Hello — world"}), ("style_text_unicode", {"text": "Hi"}), ("convert_color", {"colors": ["#2563eb"]}),
                 ("get_screw_specs", {"size": "M3"}), ("get_book_cover_size", {"trim": "6x9", "pages": 300}), ("get_paper_sizes", {"query": "A4"})]:
        old, new = call(n, a, base=args.baseline_base), call(n, a)
        check(f"unchanged output: {n}", text(old) == text(new) and old.get("structuredContent") == new.get("structuredContent"), (text(old)[:120], text(new)[:120]))
r = call("lookup_character", {"query": "em dash"}); m = (r.get("structuredContent") or {}).get("matches", [{}])[0]
check("lookup em dash: U+2014, &mdash;, Option+Shift+-, Alt+0151", m.get("codepoint") == "U+2014" and m.get("html") == "&mdash;" and m.get("mac", [""])[0] == "Option+Shift+-" and m.get("windows_alt", [""])[0] == "Alt+0151", m)
check("lookup: next-step hint", "Next step:" in text(r))
r = call("lookup_character", {"query": "&deg;"}); check("lookup &deg; → °", "U+00B0" in text(r), text(r)[:200])
r = call("lookup_character", {"text": "x​y"}); check("inspect flags zero width space", "ZERO WIDTH SPACE" in text(r), text(r)[:300])
check("lookup: nothing → isError", call("lookup_character", {}).get("isError"))
r = call("fix_typography", {"text": "She said \"it's 6'2\" -- really...\""}); s = (r.get("structuredContent") or {}).get("text")
check("fix_typography en", s == "She said “it’s 6′2″—really…”", s)
r = call("fix_typography", {"text": "Il a dit \"oui\" !", "locale": "fr"}); s = (r.get("structuredContent") or {}).get("text", "")
check("fix_typography fr guillemets + no-break spaces", s == "Il a dit « oui » !", repr(s))
r = call("fix_typography", {"text": "a -- b \"c\" ...", "mode": "audit"}); check("audit: 3 issues", len((r.get("structuredContent") or {}).get("issues", [])) == 3, text(r))
check("fix_typography: no text → isError", call("fix_typography", {}).get("isError"))
print(f"{ok} passed, {fail} failed"); raise SystemExit(1 if fail else 0)
