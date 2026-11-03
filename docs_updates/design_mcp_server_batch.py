"""Add a batch's new MCP tools to /design-mcp-server/ (WP page 107901) and set the public tool count. Run ONLY after the
Worker for that batch is deployed and live-tested. Usage (from anywhere): python3 design_mcp_server_batch.py 48|49|50|51|52|53|63
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
    "51": (61, [
        ("make_extruded_part", "extrude an SVG path, a polygon with holes or simple shapes to a thickness in mm and get a watertight STL, 3MF or faceted STEP, with size, volume and a minimum-wall check", "svg-to-stl", "SVG to STL Converter"),
        ("analyze_3d_model", "read an STL, OBJ or 3MF file for its real size, volume, triangle count, shells and watertight check, plus an estimated filament weight and print cost", "stl-viewer", "STL Viewer"),
        ("get_print_clearance", "look up the clearance to design in for pins, lids, sliding joints and press fits on FDM, resin, SLS or MJF printers, with cited sources and hole and pin sizes", "3d-print-tolerance", "3D Print Tolerance calculator"),
        ("make_box_template", "make a finger-jointed laser-cut box (SVG or DXF, kerf-compensated) or a 3D-printable project enclosure with a lid, screw posts and cut-outs", "box-generator", "Box Generator"),
        ("make_gear", "design an involute spur gear or gear pair from module or diametral pitch, with all dimensions and contact ratio, as SVG, DXF, STL, 3MF or STEP", "gear-generator", "Gear Generator"),
        ("get_screw_specs", "look up sourced ISO metric and UNC/UNF thread data: pitch, minor diameter, tap drill, clearance holes, nut and socket-head sizes, and 3D-printing guidance", "screw-size-chart", "Screw Size Chart"),
        ("get_hand_anthropometrics", "get hand measurements in mm (length, breadth, circumference, grip) as 1st–99th percentiles by sex from the public ANSUR II survey, for sizing handles and grips", "hand-size-chart", "Hand Size Chart"),
    ]),
    "52": (63, [
        ("lookup_character", "identify or find any special character (em dash, degree, ©, accents, Greek, math, currency) and get its name, code point, HTML entity, LaTeX and how to type it on Mac, Windows, Linux and Word", "unicode-characters", "Unicode Character Lookup"),
        ("fix_typography", "turn straight quotes, double hyphens, three dots and number ranges into proper typographic quotes, dashes, ellipses and primes (or straighten them back), leaving code and URLs untouched", "em-dash", "Em Dash tool"),
    ]),
    "53": (64, [
        ("make_dieline", "draw a packaging dieline (tuck-end carton, FEFCO 0201 shipping box, tray, lid and base, sleeve, matchbox, pillow box) from inside dimensions and board thickness, with every panel size, the flat size and a true-size SVG or DXF with cut, crease and bleed layers", "dieline-generator", "Dieline Generator"),
    ]),
    "63": (71, [   # 71 = tools/list on /mcp and /mcp/all after b63 (65 incl. save_moodboard + 6), checked on a local Worker 2-Nov
        ("get_sheet_metal_gauge", "look up sheet metal gauge thickness in inches and mm for steel, galvanized, stainless, aluminium, copper and brass, find the nearest gauge to a measured thickness, and get sheet weight", "sheet-metal-gauge-chart", "Sheet Metal Gauge Chart"),
        ("calc_sheet_metal_bend", "work out bend allowance, bend deduction, outside setback and the flat blank length for one or more bends from thickness, inside radius, angle and K-factor, with a true-size flat pattern as SVG or DXF", "bend-allowance-calculator", "Bend Allowance Calculator"),
        ("make_cone_pattern", "unroll a cone or truncated cone (frustum) into a flat pattern from diameters and height or slant, with radii and sweep angle, seam allowance, optional segments and a true-size SVG or DXF", "cone-template", "Cone Template"),
        ("make_living_hinge", "generate a laser-cut living hinge (straight, staggered, lattice or wave) for plywood, MDF, acrylic and more, with a bend estimate and a kerf-aware SVG or DXF", "living-hinge-generator", "Living Hinge Generator"),
        ("make_nutrition_label", "build a US-style Nutrition Facts panel (standard, tabular, linear or simplified) with FDA rounding and %DV applied, as a true-size SVG, to check against your regulator", "nutrition-label-generator", "Nutrition Label Generator"),
        ("get_desk_ergonomics", "estimate seated and standing desk height, chair seat height and monitor position from body height or measured elbow height, using ANSUR II body ratios and OSHA workstation guidance", "desk-height-calculator", "Desk Height Calculator"),
    ]),
    "64": (76, [   # 76 = tools/list on /mcp and /mcp/all after b64 (71 + 5), checked on a local Worker 2-Nov
        ("calc_quilt", "plan a quilt from a bed size or from blocks, sashing and borders: finished size, a cutting list with fabric to buy in yards and metres, backing panels and seam direction, binding strips and batting", "quilt-calculator", "Quilt Calculator"),
        ("calc_fabric_yardage", "work out how much fabric to buy for a list of cut pieces on a given bolt width, allowing for nap or one-way prints, pattern repeat, seam allowance and shrinkage, with an SVG cutting layout", "fabric-yardage-calculator", "Fabric Yardage Calculator"),
        ("optimize_cut_list", "nest parts onto plywood or MDF sheets (guillotine cuts a table or track saw can make) or onto lumber and bar lengths, with saw kerf, edge trim and grain lock, returning sheets needed, utilisation, a CSV cut list and SVG layouts", "cut-list-optimizer", "Cut List Optimizer"),
        ("make_jigsaw_puzzle", "generate a jigsaw puzzle cut file for a laser or CNC: rows by columns of classic interlocking pieces at a board size, seeded so the same seed gives the same puzzle, as a true-size SVG or DXF", "jigsaw-puzzle-generator", "Jigsaw Puzzle Generator"),
        ("convert_drawing_scale", "convert between real size and a scale drawing with architect, engineer or metric scales (feet-inches accepted), re-scale a drawing, or find the scale from a known length", "architectural-scale-calculator", "Architectural Scale Calculator"),
    ]),
    "65": (82, [   # 82 = tools/list on /mcp and /mcp/all after b65 (76 + 6), checked on a local Worker 2-Nov
        ("get_logo_placement", "get typical recommended and maximum logo print sizes on tees, long sleeves, polos, hoodies, crewnecks and tanks (left chest, centre chest, full front, back collar, full back, sleeve, hood) by garment size, with how far below the collar seam and from the centre line, and the largest box that fits your logo", "shirt-logo-placement", "Shirt Logo Placement guide"),
        ("make_cd_case_template", "make a print template for a CD jewel case insert, booklet, tray card with spines, disc label, slim case, DVD case or card wallet, with trim, bleed and safe area as a true-size SVG", "cd-case-template", "CD Case Template"),
        ("make_paper_piecing_template", "draw English paper piecing templates (hexagon, half-hexagon, 60° and 45° diamonds, elongated hexagon, triangle, kite, pentagon, octagon, square) by side length, with the fabric outline and seam allowance, how many fit on a Letter or A4 sheet and a true-size SVG", "english-paper-piecing-templates", "English Paper Piecing Templates"),
        ("make_voronoi_pattern", "generate a seeded Voronoi cell pattern in a rectangle or circle, with Lloyd relaxation, as filled cells, edges, stained glass or a laser-cut lattice with a minimum web width, as SVG or DXF", "voronoi-generator", "Voronoi Generator"),
        ("edit_svg_path", "inspect and edit an SVG path d attribute: exact bounding box, length and viewBox, normalize, convert to absolute or relative commands, round, or translate, scale, rotate, flip and skew it into the coordinates", "svg-path-editor", "SVG Path Editor"),
        ("calc_depth_of_field", "work out near and far limits of acceptable sharpness, total depth of field and hyperfocal distance from focal length, f-number, focus distance and sensor size (full frame to phone) or your own circle of confusion", "depth-of-field-calculator", "Depth of Field Calculator"),
    ]),
    "66": (87, [   # 87 = tools/list on /mcp and /mcp/all after b66 (82 + 5), checked on a local Worker 3-Nov
        ("make_speech_bubble", "draw a comic speech, thought, shout, whisper, cloud or rectangular caption bubble with one or more tails pointed at any spot, text wrapped and fitted inside, as a clean SVG and path", "speech-bubble-maker", "Speech Bubble Maker"),
        ("make_coat_of_arms", "build a heraldic shield from a field division, ordinary and charges in proper tinctures, with the written blazon, a rule-of-tincture check and an SVG (a design, not a grant of arms)", "coat-of-arms-maker", "Coat of Arms Maker"),
        ("make_jcard_template", "make a cassette J-card insert print template (standard 3-panel, extended 4-5 panel, O-card and shell label sizes) with fold lines, spine, trim, bleed and safe area as a true-size SVG", "cassette-j-card-template", "Cassette J-Card Template"),
        ("calc_field_of_view", "work out a lens's horizontal, vertical and diagonal angle of view and the frame width and height at a distance for any sensor size and focal length, or the focal length needed to frame a subject", "field-of-view-calculator", "Field of View Calculator"),
        ("calc_exposure_value", "calculate exposure value (EV and EV100) from aperture, shutter speed and ISO, solve for the missing setting, list equivalent exposures and work out ND filter shutter times", "exposure-value-calculator", "Exposure Value Calculator"),
    ]),
    "68": (90, [   # 90 = tools/list on /mcp and /mcp/all after b68 (87 + 3), checked on a local Worker 3-Nov
        ("make_certificate_border", "make a print-ready certificate, award or diploma border (guilloche, rosette corners, ornate rules, art deco and more) at exact Letter, A4, A5 or Legal size, with the blank writing area and seal position in mm", "certificate-border", "Certificate Border"),
        ("calc_kitchen_work_triangle", "check a kitchen's sink, cooktop and fridge work triangle from leg lengths or positions (with islands) against the NKBA guideline, plus the work-aisle width", "kitchen-planner", "Kitchen Planner"),
        ("plan_square_foot_garden", "split a raised bed into square-foot (or 30 cm) squares and work out plants per square and plant counts for each crop you assign", "garden-planner", "Garden Planner"),
    ]),
    "69": (93, [   # 93 = tools/list on /mcp and /mcp/all after b69 (90 + 3), checked on a local Worker 3-Nov
        ("make_ribbon_banner", "make a ribbon or scroll banner SVG (flat, folded, arched, wavy or double, with notched, pointed, straight or slanted ends) with the text set along the ribbon and fitted", "ribbon-banner", "Ribbon Banner"),
        ("calc_cross_stitch", "work out a cross-stitch design's finished size on any Aida or evenweave count, the fabric to cut, strands and skeins, or the stitch count for a finished size", "cross-stitch-pattern-maker", "Cross Stitch Pattern Maker"),
        ("get_mockup_print_area", "get the usual print area for t-shirts, hoodies, tote bags, 11 and 15 oz mug wraps, posters and billboards in inches, cm and pixels at your dpi", "t-shirt-mockup", "T-Shirt Mockup"),
    ]),
    "72": (96, [   # 96 = tools/list on /mcp and /mcp/all after b72 (93 + 3), checked on a local Worker 3-Nov
        ("make_star_map", "make a custom star map poster of the real night sky for a date, time and place, with constellations, the Moon in its phase, the bright stars that were up, and a vector SVG", "star-map", "Star Map"),
        ("make_fantasy_map", "generate a seeded fantasy map (island, continent, archipelago or coast) with mountains, forests, rivers, towns, roads and invented names, in parchment, ink, atlas or treasure style, with a square or hex grid", "fantasy-map-generator", "Fantasy Map Generator"),
        ("make_paper_bag_template", "make a true-size gusseted paper bag dieline from width, gusset and height: flat net, glue flap, bottom flaps and overlap, printable panels, handle holes and sheets needed", "paper-bag-template", "Paper Bag Template"),
    ]),
    "73": (98, [   # 98 = tools/list on /mcp and /mcp/all after b73 (96 + 2), checked on a local Worker 3-Nov; get_mockup_print_area also gained the 10 b73 products
        ("get_brochure_panels", "get the panel widths for a roll (C) fold or Z fold tri-fold or a bi-fold on Letter, Legal, Tabloid, A4 or A3: outside and inside spreads, fold lines, the front-cover panel and the flat file size in pixels", "brochure-mockup", "Brochure Mockup"),
        ("get_banner_spec", "get a banner's size in in/ft/cm, aspect ratio, artwork pixels at 100 and 150 dpi and the grommet count and positions, for vinyl presets, 33 × 81 in roll-ups, pole banners or any custom size", "banner-mockup", "Banner Mockup"),
    ]),
    "75": (100, [   # 100 = tools/list on /mcp and /mcp/all after b75 (98 + 2), checked on a local Worker 3-Nov
        ("make_maze", "make a seeded maze (rectangle, circle, hexagon or triangle; backtracker, Prim, Kruskal or Wilson) by size or difficulty, with optional loops and the solution path, as an SVG with dead-end and solution stats", "maze-generator", "Maze Generator"),
        ("make_dungeon", "generate a seeded dungeon map with rooms, corridors, doors (locked, secret, archway), stairs, traps and a 5 ft grid, rooms numbered by distance, with a room key, as an SVG", "dungeon-map-generator", "Dungeon Map Generator"),
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
