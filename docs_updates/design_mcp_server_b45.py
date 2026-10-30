"""Add the 6 batch-45 MCP tools to /design-mcp-server/ (WP page 107901). Run ONLY after the Worker is deployed.
Backs the page up to docs_updates/backup-107901-<timestamp>.html first, appends the list items after make_pie_chart,
then purges Cloudflare. Idempotent (skips if generate_data_matrix is already listed). Run from mgd-inspiration/."""
import base64, json, re, subprocess, time, urllib.request
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]
env = {}
for l in open(ROOT / ".env"):
    m = re.match(r"^([A-Z_]+)=(.*)$", l.strip())
    if m: env[m[1]] = m[2].strip().strip("\"'")
AUTH = "Basic " + base64.b64encode(f"{env['WP_USERNAME']}:{env['WP_APP_PASSWORD']}".encode()).decode()
URL = "https://madegooddesigns.com/wp-json/wp/v2/pages/107901"
def req(url, data=None):
    r = urllib.request.Request(url, data=json.dumps(data).encode() if data else None, method="POST" if data else "GET",
                               headers={"Authorization": AUTH, "User-Agent": "curl/8.4.0", "Accept": "*/*", "Content-Type": "application/json"})
    return json.loads(urllib.request.urlopen(r, timeout=60).read())
T = "https://madegooddesigns.com/tools"
ITEMS = [
    ("generate_data_matrix", "create a Data Matrix barcode SVG from text, a URL or GS1 data, with every Application Identifier and check digit validated first", "data-matrix-generator", "Data Matrix Generator"),
    ("make_color_swatches", "turn any list of colours into a swatch sheet SVG with HEX, RGB, CMYK and contrast values, plus CSS, Tailwind, .ase, .aco, .gpl and Procreate palette files", "color-swatch-generator", "Color Swatch Generator"),
    ("make_graph", "draw a line, bar, stacked, area, scatter or histogram graph SVG from CSV data, with an optional trendline and R²", "graph-maker", "Graph Maker"),
    ("convert_subtitles", "convert, shift and re-wrap subtitles between SRT, WebVTT, plain text and CSV", "video-to-text", "Video to Text tool"),
    ("image_size_calculator", "work out resize dimensions, crop or padding for pixels, percentages, print sizes at any DPI and 41 platform presets", "image-resizer", "Image Resizer"),
    ("convert_text_case", "change text to lower, UPPER, Sentence, Title, camelCase, snake_case and more while keeping acronyms and brand names as written", "lowercase-converter", "Lowercase Converter"),
]
raw = req(URL + "?context=edit&_fields=content")["content"]["raw"]
if "generate_data_matrix" in raw: raise SystemExit("already listed — nothing to do")
bk = Path(__file__).with_name(f"backup-107901-{time.strftime('%Y%m%d-%H%M%S')}.html"); bk.write_text(raw); print("backup", bk)
anchor = re.search(r"<li><strong>make_pie_chart</strong>.*?</li>\n<!-- /wp:list-item -->", raw)
assert anchor, "make_pie_chart item not found"
add = "".join(f'\n\n<!-- wp:list-item -->\n<li><strong>{n}</strong> — {d} — from our <a href="{T}/{slug}/">{label}</a>.</li>\n<!-- /wp:list-item -->' for n, d, slug, label in ITEMS)
new = raw[: anchor.end()] + add + raw[anchor.end():]
req(URL, {"content": new})
check = req(URL + "?context=edit&_fields=content")["content"]["raw"]
assert all(i[0] in check for i in ITEMS), "update did not stick"
print("page updated: +", len(ITEMS), "tools")
subprocess.run(["python3", str(ROOT / ".claude-tools/cf_purge.py"), "https://madegooddesigns.com/design-mcp-server/"], check=False)
