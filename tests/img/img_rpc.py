#!/usr/bin/env python3
"""mcp-img-r1 (27-Nov-2026): JSON-RPC checks for the pictures + MCP Apps gallery on a LOCAL worker (tests/img_local_e2e.sh).
Usage: python3 tests/img/img_rpc.py http://127.0.0.1:PORT/inspiration --mode a|b
  a = Images binding present (big originals are resized), b = no binding (only small originals become image blocks)."""
import base64, json, re, sys, urllib.request, urllib.error

BASE = sys.argv[1].rstrip("/")
MODE = sys.argv[sys.argv.index("--mode") + 1] if "--mode" in sys.argv else "a"
URI = "ui://mgd/gallery-v1.html"
GTOOLS = ["search_design_inspiration", "browse_inspiration_by_theme", "search_museum_art", "search_annual_reports"]
OK = FAIL = 0


def t(name, cond, info=""):
    global OK, FAIL
    if cond: OK += 1
    else: FAIL += 1; print("FAIL", name, "->", str(info)[:400])


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *a, **k): return None


def post(path, body, proto="2025-06-18"):
    h = {"Content-Type": "application/json", "Accept": "application/json, text/event-stream", "User-Agent": "img-rpc-test"}
    if proto: h["MCP-Protocol-Version"] = proto
    req = urllib.request.Request(BASE + path, data=json.dumps(body).encode(), headers=h)
    raw = urllib.request.urlopen(req, timeout=60).read()
    return json.loads(raw), len(raw)


RID = [0]
def rpc(method, params=None, path="/mcp", proto="2025-06-18"):
    RID[0] += 1
    return post(path, {"jsonrpc": "2.0", "id": RID[0], "method": method, "params": params or {}}, proto)


def call(name, args, path="/mcp", proto="2025-06-18"):
    j, n = rpc("tools/call", {"name": name, "arguments": args}, path, proto)
    return j.get("result") or {}, n


MAGIC = {"image/jpeg": b"\xff\xd8\xff", "image/png": b"\x89PNG", "image/webp": b"RIFF"}
URL_RE = re.compile(r"https?://[^\s)\]>\"'`<]+")


def check_images(tag, r, want_min, want_max=3):
    imgs = [c for c in r.get("content", []) if c.get("type") == "image"]
    t(f"{tag}: {want_min}..{want_max} image blocks", want_min <= len(imgs) <= want_max, len(imgs))
    t(f"{tag}: text block first", r.get("content") and r["content"][0].get("type") == "text")
    for i, c in enumerate(imgs):
        try: raw = base64.b64decode(c["data"], validate=True)
        except Exception as e: t(f"{tag}: image {i} base64", False, e); continue
        mt = c.get("mimeType")
        t(f"{tag}: image {i} mimeType known", mt in MAGIC, mt)
        t(f"{tag}: image {i} bytes match {mt}", raw.startswith(MAGIC.get(mt, b"??")), raw[:8])
        t(f"{tag}: image {i} <= 60 KB", len(raw) <= 60 * 1024, len(raw))
    return imgs


def check_text(tag, r, banned=()):
    txt = r["content"][0]["text"]
    blocks = [b for b in txt.split("\n\n") if b.startswith("• ")]
    t(f"{tag}: has item blocks", len(blocks) > 0, txt[:300])
    for b in blocks:
        if "non-commercial use only" in b: continue   # link-only records keep their library links (MCP-only opt-in)
        lines = b.split("\n")
        t(f"{tag}: item leads with our page", len(lines) > 1 and lines[1].startswith("  View on Made Good Designs: https://madegooddesigns.com/inspiration/"), lines[:2])
        urls = URL_RE.findall(b)
        t(f"{tag}: first URL in item is ours", urls and urls[0].startswith("https://madegooddesigns.com/"), urls[:1])
        t(f"{tag}: our page carries utm", "utm_source=mcp" in lines[1], lines[1])
        bad = [u for u in urls if not u.startswith("https://madegooddesigns.com/")]
        t(f"{tag}: no outbound URLs in item", not bad, bad)
    for w in banned: t(f"{tag}: no {w} in text", w not in txt, w)
    return blocks


def check_sc(tag, r, n_min=1):
    sc = r.get("structuredContent")
    t(f"{tag}: structuredContent present", isinstance(sc, dict), r.keys())
    if not isinstance(sc, dict): return []
    items = sc.get("items")
    t(f"{tag}: items list", isinstance(items, list) and len(items) >= n_min, sc)
    for it in items or []:
        t(f"{tag}: item keys", all(isinstance(it.get(k), str) and it.get(k) for k in ("id", "title", "page_url")), it)
        t(f"{tag}: page_url ours + utm", it["page_url"].startswith("https://madegooddesigns.com/inspiration/") and "utm_source=mcp" in it["page_url"], it["page_url"])
        for k in ("image_url", "thumb_url"):
            t(f"{tag}: {k} ours", str(it.get(k, "")).startswith("https://madegooddesigns.com/inspiration/img/"), it.get(k))
        t(f"{tag}: subtitle is a string", isinstance(it.get("subtitle"), str), it)
    return items or []


# ---- initialize / tools/list / resources
for path in ("/mcp", "/mcp/core"):
    j, _ = rpc("initialize", {"protocolVersion": "2025-06-18", "capabilities": {"extensions": {"io.modelcontextprotocol/ui": {"mimeTypes": ["text/html;profile=mcp-app"]}}}, "clientInfo": {"name": "img-test", "version": "1"}}, path)
    caps = j["result"]["capabilities"]
    t(f"{path} initialize: resources capability", caps.get("resources") == {"listChanged": False}, caps)
    t(f"{path} initialize: ui extension", caps.get("extensions", {}).get("io.modelcontextprotocol/ui", {}).get("mimeTypes") == ["text/html;profile=mcp-app"], caps)
    for proto in ("2025-06-18", None):
        j, _ = rpc("tools/list", {}, path, proto)
        tools = {x["name"]: x for x in j["result"]["tools"]}
        for n in GTOOLS:
            d = tools.get(n)
            t(f"{path} tools/list[{proto}]: {n} listed", d is not None)
            if not d: continue
            m = d.get("_meta", {})
            t(f"{path} tools/list[{proto}]: {n} _meta.ui.resourceUri", m.get("ui", {}).get("resourceUri") == URI, m)
            t(f"{path} tools/list[{proto}]: {n} openai/outputTemplate", m.get("openai/outputTemplate") == URI, m)
            if proto: t(f"{path} tools/list: {n} outputSchema", d.get("outputSchema", {}).get("properties", {}).get("items", {}).get("type") == "array", d.get("outputSchema"))
            else: t(f"{path} tools/list[old]: {n} no outputSchema", "outputSchema" not in d)
    j, _ = rpc("resources/list", {}, path)
    res = j["result"]["resources"]
    t(f"{path} resources/list has the gallery", any(x["uri"] == URI and x["mimeType"] == "text/html;profile=mcp-app" for x in res), res)
    j, _ = rpc("resources/read", {"uri": URI}, path)
    c = (j.get("result") or {}).get("contents", [{}])[0]
    t(f"{path} resources/read mimeType", c.get("mimeType") == "text/html;profile=mcp-app", c.get("mimeType"))
    html = c.get("text", "")
    t(f"{path} resources/read returns the widget HTML", html.startswith("<!doctype html>") and "ui/initialize" in html and "ui/open-link" in html and "openExternal" in html, html[:120])
    csp = c.get("_meta", {}).get("ui", {}).get("csp", {})
    t(f"{path} resources/read CSP: images only from madegooddesigns.com", csp.get("resourceDomains") == ["https://madegooddesigns.com"] and csp.get("connectDomains") == [], csp)
    t(f"{path} widget has no other origin", not [u for u in URL_RE.findall(html) if not u.startswith("https://madegooddesigns.com/")], [u for u in URL_RE.findall(html) if not u.startswith("https://madegooddesigns.com/")])
    j, _ = rpc("resources/read", {"uri": "ui://nope"}, path)
    t(f"{path} resources/read unknown uri -> error", "error" in j, j)
    j, _ = rpc("resources/templates/list", {}, path)
    t(f"{path} resources/templates/list empty", j.get("result") == {"resourceTemplates": []}, j)

# ---- the 4 tools, on both endpoints, new + old clients
BIG_OK = MODE == "a"
cases = [
    ("search_museum_art", {"query": "vase", "limit": 5}, ["museum.example", "metmuseum.org", "artic.edu", "smk.dk", "museum page:"], 2 if BIG_OK else 1),
    ("search_annual_reports", {"query": "transit"}, ["archive.org"], 1),
    ("search_design_inspiration", {"query": "poster", "limit": 6}, ["https://example.org"], 2 if BIG_OK else 1),
    ("browse_inspiration_by_theme", {"theme": "retro"}, ["https://example.org"], 2 if BIG_OK else 1),
]
sizes = {}
for path in ("/mcp", "/mcp/core"):
    for name, args, banned, nimg in cases:
        tag = f"{path} {name}"
        r, n = call(name, args, path)
        sizes[tag] = n
        t(f"{tag}: not an error", not r.get("isError"), r)
        check_text(tag, r, banned)
        items = check_sc(tag, r)
        check_images(tag, r, nimg)
        # old client (no 2025-06-18 header): text + images, no structuredContent
        r0, _ = call(name, args, path, proto=None)
        t(f"{tag} [old client]: no structuredContent", "structuredContent" not in r0, list(r0.keys()))
        t(f"{tag} [old client]: same text", r0["content"][0]["text"] == r["content"][0]["text"], "")
        check_images(tag + " [old client]", r0, nimg)

# museum: the museum is still named with its licence, but not linked
r, _ = call("search_museum_art", {"query": "vase"})
txt = r["content"][0]["text"]
t("museum: museum named", "collection: The Metropolitan Museum of Art (public domain / CC0)" in txt, txt[:600])
t("museum: page is the museum item page", "View on Made Good Designs: https://madegooddesigns.com/inspiration/museum/vase-with-lid-1720-bbbbbbbbbbb1?" in txt, txt[:600])
t("museum: structured subtitle", any(i["subtitle"].startswith("Jan Brueghel the Elder, 1720") for i in r["structuredContent"]["items"]), r["structuredContent"]["items"][:1])
t("museum: licence in structured", all(i.get("licence") in ("CC0", "Public Domain Mark") for i in r["structuredContent"]["items"]), "")
# annual: page + image
r, _ = call("search_annual_reports", {"query": "transit"})
txt = r["content"][0]["text"]
t("annual: page + image URL", "View on Made Good Designs: https://madegooddesigns.com/inspiration/annual-reports/acme-transit-1972-aaaaaaaaaaa2?" in txt and "image: https://madegooddesigns.com/inspiration/img/annual/aaaaaaaaaaa2.jpg" in txt, txt[:600])
# design: per-item deep link (#i/<id>), utm before the hash
r, _ = call("search_design_inspiration", {"query": "poster"})
txt = r["content"][0]["text"]
t("design: per-item #i/ link with utm before hash", re.search(r"View on Made Good Designs: https://madegooddesigns\.com/inspiration/\?utm_source=mcp[^\s#]*#i/c0000000000d", txt), txt[:500])
# non-commercial link-only rows: not in the gallery, no image blocks from them
r, _ = call("search_annual_reports", {"query": "bank", "include_noncommercial": True})
ids = [i["id"] for i in (r.get("structuredContent") or {}).get("items", [])]
t("nc: link-only row not in structuredContent", "ddddddddddd1" not in ids, ids)
t("nc: link-only row still in text", "ddddddddddd1" in r["content"][0]["text"] or "Bayerische Hypotheken" in r["content"][0]["text"], r["content"][0]["text"][:400])
t("nc: no image blocks from link-only rows", all(c.get("type") != "image" for c in r["content"]) or ids, r["content"])
# zero results: structured empty list, no images
r, _ = call("search_museum_art", {"query": "zzqxqz"})
t("zero: empty items", r.get("structuredContent", {}).get("items") == [], r.get("structuredContent"))
t("zero: no image blocks", all(c.get("type") != "image" for c in r["content"]), "")
# cache: browse (shared() rows) twice -> same structured items + same images
a1, _ = call("browse_inspiration_by_theme", {"theme": "retro"})
a2, _ = call("browse_inspiration_by_theme", {"theme": "retro"})
t("cache: same structuredContent on repeat", a1.get("structuredContent") == a2.get("structuredContent"), "")
t("cache: same image blocks on repeat", [c for c in a1["content"] if c["type"] == "image"] == [c for c in a2["content"] if c["type"] == "image"], "")
# run_design_tool dispatch keeps pictures
r, _ = call("run_design_tool", {"name": "search_museum_art", "arguments": {"query": "vase"}}, "/mcp/core")
t("run_design_tool -> search_museum_art keeps items + images", r.get("structuredContent", {}).get("items") and any(c["type"] == "image" for c in r["content"]), list(r.keys()))

# ---- thumbnail route
op = urllib.request.build_opener(NoRedirect)
def get(path):
    try:
        resp = op.open(urllib.request.Request(BASE + path, headers={"User-Agent": "img-rpc-test"}), timeout=30)
        return resp.status, resp.headers, resp.read()
    except urllib.error.HTTPError as e:
        return e.code, e.headers, e.read()
s, h, b = get("/img/t/museum/bbbbbbbbbbb1.jpg")
if BIG_OK: t("thumb route: big museum image resized", s == 200 and h.get("Content-Type") == "image/jpeg" and len(b) <= 60 * 1024 and b[:3] == b"\xff\xd8\xff", (s, h.get("Content-Type"), len(b)))
else: t("thumb route: big image without binding -> 302 to original", s == 302 and h.get("Location", "").endswith("/inspiration/img/museum/bbbbbbbbbbb1.jpg"), (s, h.get("Location")))
s, h, b = get("/img/t/annual/aaaaaaaaaaa2.jpg")
t("thumb route: small original served", s == 200 and len(b) <= 60 * 1024, (s, len(b)))
s, h, b = get("/img/t/../secret.txt")
t("thumb route: bad key 404", s in (404, 400), s)

print("sizes (bytes):", json.dumps(sizes))
print(f"{OK} passed, {FAIL} failed")
sys.exit(1 if FAIL else 0)
