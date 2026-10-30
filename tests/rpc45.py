"""JSON-RPC check of the batch-45 MCP tools against a running Worker.
Local:  python3 tests/rpc45.py --base http://localhost:8797
Live:   python3 tests/rpc45.py --base https://madegooddesigns.com"""
import argparse, json, sys, urllib.request
ap = argparse.ArgumentParser(); ap.add_argument("--base", default="http://localhost:8797"); args = ap.parse_args()
URL = args.base.rstrip("/") + "/inspiration/mcp"
def rpc(method, params=None, i=[0]):
    i[0] += 1
    req = urllib.request.Request(URL, data=json.dumps({"jsonrpc": "2.0", "id": i[0], "method": method, "params": params or {}}).encode(),
                                 headers={"Content-Type": "application/json", "Accept": "application/json, text/event-stream", "User-Agent": "curl/8.4.0"})
    with urllib.request.urlopen(req, timeout=60) as r: return json.loads(r.read())
NEW = {"generate_data_matrix": {"data": "(01)09506000134352(17)271231(10)ABC123"},
       "make_color_swatches": {"colors": "#264653 #2a9d8f #e9c46a", "formats": ["css", "ase"]},
       "make_graph": {"data": "Month,Sales\nJan,120\nFeb,150\nMar,170", "type": "bar"},
       "convert_subtitles": {"text": "1\n00:00:01,000 --> 00:00:02,000\nHi.\n", "to": "vtt"},
       "image_size_calculator": {"source_width": 4000, "source_height": 3000, "preset": "yt-thumb"},
       "convert_text_case": {"text": "hello NASA world", "case": "title", "keep_acronyms": True}}
EXPECT = {"generate_data_matrix": "GS1 Data Matrix", "make_color_swatches": "3 colours", "make_graph": "bar graph", "convert_subtitles": "WEBVTT",
          "image_size_calculator": "output 1280 × 720 px", "convert_text_case": "Hello NASA World"}
ok = fail = 0
names = {t["name"] for t in rpc("tools/list")["result"]["tools"]}
for n in NEW:
    good = n in names; ok += good; fail += not good; print(("PASS" if good else "FAIL"), "tools/list has", n)
for n, a in NEW.items():
    r = rpc("tools/call", {"name": n, "arguments": a}).get("result", {})
    t = "\n".join(c.get("text", "") for c in r.get("content", []))
    good = not r.get("isError") and EXPECT[n] in t; ok += good; fail += not good
    print(("PASS" if good else "FAIL"), "call", n, "" if good else t[:300])
print(f"{ok} passed, {fail} failed (tools/list: {len(names)} tools)"); sys.exit(1 if fail else 0)
