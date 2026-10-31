"""Add a batch's new MCP tools to /design-mcp-server/ (WP page 107901) and set the public tool count. Run ONLY after the
Worker for that batch is deployed and live-tested. Usage (from anywhere): python3 design_mcp_server_batch.py 48|49|50
Pattern: design_mcp_server_b45.py. Backs the page up to docs_updates/backup-107901-b<N>-<timestamp>.html first, appends the
list items after the last tool item of the public list, writes/updates the "The public server has N tools" sentence under the
"Available tools" heading, checks that every linked page returns 200, then purges Cloudflare. Idempotent per tool."""
import base64, json, re, subprocess, sys, time, urllib.request
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]
env = {}
for l in open(ROOT / ".env"):
    m = re.match(r"^([A-Z_]+)=(.*)$", l.strip())
    if m: env[m[1]] = m[2].strip().strip("\"'")
AUTH = "Basic " + base64.b64encode(f"{env['WP_USERNAME']}:{env['WP_APP_PASSWORD']}".encode()).decode()
URL = "https://madegooddesigns.com/wp-json/wp/v2/pages/107901"
T = "https://madegooddesigns.com/tools"
def req(url, data=None):
    r = urllib.request.Request(url, data=json.dumps(data).encode() if data else None, method="POST" if data else "GET",
                               headers={"Authorization": AUTH, "User-Agent": "curl/8.4.0", "Accept": "*/*", "Content-Type": "application/json"})
    return json.loads(urllib.request.urlopen(r, timeout=60).read())
def status(url):
    r = urllib.request.Request(url + f"?cb={int(time.time())}", headers={"User-Agent": "curl/8.4.0", "Accept": "*/*"})
    try: return urllib.request.urlopen(r, timeout=60).status
    except urllib.error.HTTPError as e: return e.code

BATCHES = {
    "48": (48, [
        ("generate_type_scale", "build a modular or fluid clamp() type scale with line heights and letter spacing, as CSS variables, a Tailwind v4 @theme block and design tokens", "type-scale-generator", "Type Scale Generator"),
        ("generate_color_scale", "turn one brand colour into an even 50–950 OKLCH shade ramp that keeps your exact colour, with contrast for every step", "tailwind-color-generator", "Tailwind Color Generator"),
        ("check_contrast", "check text and background colours against WCAG 2.2 and get the nearest passing colour that keeps the hue, or a full contrast matrix", "contrast-checker", "Contrast Checker"),
        ("convert_color", "convert any CSS colour between HEX, RGB, HSL, OKLCH, OKLab and Display P3, with gamut checks and CSS Color 4 gamut mapping", "hex-to-oklch", "HEX to OKLCH Converter"),
        ("generate_shadcn_theme", "generate a complete shadcn/ui theme (every colour variable for light and dark, in OKLCH) with failing contrast pairs fixed", "shadcn-theme-generator", "shadcn Theme Generator"),
        ("export_design_tokens", "convert a DESIGN.md, shadcn CSS or a palette into W3C design tokens, a Tailwind v4 theme, CSS, SCSS and Style Dictionary files", "design-tokens-generator", "Design Tokens Generator"),
        ("design_md_from_references", "pool the colours of library references into an accessible light and dark design system and a DESIGN.md in one step", "moodboard-maker", "Moodboard Maker"),
        ("lint_design_md", "check a DESIGN.md with the official linter rules (broken references, missing primary, contrast, section order) before an agent relies on it", "design-md-generator", "DESIGN.md Generator"),
        ("search_icons", "find real open-source icons (Lucide, Tabler, Heroicons, Phosphor) with the exact import line, inline SVG and licence — no invented icon names", "svg-icons", "SVG Icons library"),
        ("get_screen_sizes", "look up sourced device viewports, pixel ratios and safe areas for phones, tablets, laptops and TVs, with media-query exports", "screen-sizes", "Screen Sizes list"),
        ("make_brand_board", "lay out a one-page brand board SVG — logo, tagline, palette with HEX/RGB/CMYK, type specimen and UI samples — plus a brand.md", "brand-board-maker", "Brand Board Maker"),
        ("generate_slogans", "generate original slogan and tagline ideas by industry and tone, with well-known trademarked slogans filtered out", "slogan-generator", "Slogan Generator"),
    ]),
    "49": (52, [
        ("make_grid_paper", "make printable graph, dot-grid, isometric, hexagon, engineering or lined paper as a true-size SVG at Letter, A4 and other real paper sizes", "graph-paper", "Graph Paper Generator"),
        ("get_paper_sizes", "look up sourced ISO A/B, envelope, US, ANSI, Arch, JIS and photo paper sizes in mm, inches, points or pixels, with a CSS @page snippet", "paper-sizes", "Paper Sizes chart"),
        ("make_storyboard", "lay a shot list out as printable storyboard pages (2–9 frames per page, any aspect ratio) with shot size, camera move, duration and action", "storyboard-template", "Storyboard Template"),
        ("generate_llms_txt", "build or validate an llms.txt file for a website or docs site, following the llmstxt.org proposal", "llms-txt-generator", "llms.txt Generator"),
    ]),
    "50": (54, [
        ("get_book_cover_size", "work out a KDP paperback full-wrap cover size, spine width, safe zones and barcode box from trim size and page count, with an optional true-size SVG template", "kdp-cover-calculator", "KDP Cover Calculator"),
        ("make_affinity_diagram", "turn research notes, interview quotes or workshop stickies into an affinity diagram SVG, from groups you clustered or a deterministic keyword grouping", "affinity-diagram", "Affinity Diagram Maker"),
    ]),
}

def main(b):
    total, items = BATCHES[b]
    for n, d, slug, label in items:
        s = status(f"{T}/{slug}/"); assert s == 200, f"{slug} returned {s}"
    raw = req(URL + "?context=edit&_fields=content")["content"]["raw"]
    todo = [i for i in items if f"<strong>{i[0]}</strong>" not in raw]
    count_re = re.compile(r"The public server has \d+ tools")
    if not todo and f"The public server has {total} tools" in raw: raise SystemExit("already up to date — nothing to do")
    bk = Path(__file__).with_name(f"backup-107901-b{b}-{time.strftime('%Y%m%d-%H%M%S')}.html"); bk.write_text(raw); print("backup", bk)
    new = raw
    if todo:
        last = list(re.finditer(r"<li><strong>[a-z_]+</strong>.*?</li>\n<!-- /wp:list-item -->", new.split('<h2 class="wp-block-heading">Available tools</h2>')[1].split("<!-- /wp:list -->")[0]))[-1]
        anchor = new.index(last.group(0)) + len(last.group(0))
        add = "".join(f'\n\n<!-- wp:list-item -->\n<li><strong>{n}</strong> — {d} — from our <a href="{T}/{slug}/">{label}</a>.</li>\n<!-- /wp:list-item -->' for n, d, slug, label in todo)
        new = new[:anchor] + add + new[anchor:]
    sentence = f"The public server has {total} tools"
    if count_re.search(new): new = count_re.sub(sentence, new, count=1)
    else:
        h = '<h2 class="wp-block-heading">Available tools</h2>\n<!-- /wp:heading -->'
        assert new.count(h) == 1, "Available tools heading not found"
        new = new.replace(h, h + f"\n\n<!-- wp:paragraph -->\n<p>{sentence}, all free and read-only, no key needed:</p>\n<!-- /wp:paragraph -->", 1)
    req(URL, {"content": new})
    check = req(URL + "?context=edit&_fields=content")["content"]["raw"]
    assert all(f"<strong>{i[0]}</strong>" in check for i in items) and sentence in check, "update did not stick"
    n_listed = len(re.findall(r"<li><strong>[a-z_]+</strong>", check.split('<h2 class="wp-block-heading">Available tools</h2>')[1].split("<!-- /wp:list -->")[0]))
    print(f"page updated: +{len(todo)} tools; public list now has {n_listed} items; sentence says {total}")
    subprocess.run(["python3", str(ROOT / ".claude-tools/cf_purge.py"), "https://madegooddesigns.com/design-mcp-server/"], check=False)

if __name__ == "__main__":
    main(sys.argv[1])
