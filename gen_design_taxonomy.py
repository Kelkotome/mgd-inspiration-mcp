"""Generate src/design_taxonomy.json — the ONE mapping of design tools → categories + designer roles (2-Nov-2026).
Covers every MCP tool (hand-curated below) and every madegooddesigns.com /tools/ page (keyword rules, "auto": true → review
before using it for public "Tools for <role>" hub pages). The Worker imports it for browse_design_tools; the site can reuse it.
Usage: python3 gen_design_taxonomy.py [--refresh]   (--refresh re-reads the live /tools/ hub, read-only GET, curl UA)"""
import json, os, re, sys, urllib.request
ROOT = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(ROOT, "src", "design_taxonomy.json")
CATEGORIES = {"typography": "Typography & lettering", "colour": "Colour", "ui": "UI, web & design systems", "brand": "Brand & logo",
  "print": "Print & packaging", "3d": "3D & industrial", "images": "Images, art & photo", "diagrams": "Diagrams & charts",
  "text": "Text & symbols", "everyday": "Everyday utilities"}
ROLES = {"brand": "Brand / identity designer", "graphic-print": "Graphic / print designer", "ui-ux-web": "UI/UX & web designer",
  "packaging": "Packaging designer", "industrial-product": "Industrial / product designer", "type-lettering": "Type designer / letterer",
  "illustration-pattern": "Illustrator / surface-pattern designer", "photo-image": "Photographer / image editor",
  "motion": "Motion designer", "marketing-content": "Marketer / content creator"}
CAT_ROLES = {"typography": ["type-lettering", "brand", "graphic-print"], "colour": ["brand", "ui-ux-web", "graphic-print", "illustration-pattern"],
  "ui": ["ui-ux-web"], "brand": ["brand", "marketing-content"], "print": ["graphic-print", "packaging"], "3d": ["industrial-product"],
  "images": ["photo-image", "illustration-pattern", "graphic-print"], "diagrams": ["marketing-content", "ui-ux-web"],
  "text": ["marketing-content", "type-lettering"], "everyday": ["marketing-content"]}
# MCP tools: (categories, page path, extra roles, roles to drop)
T = {
 "search_design_inspiration": (["typography", "brand"], "/inspiration/", ["packaging", "illustration-pattern"]),
 "browse_inspiration_by_theme": (["typography", "brand"], "/inspiration/", []), "list_inspiration_themes": (["typography"], "/inspiration/", []),
 "generate_type_scale": (["typography", "ui"], "/tools/type-scale-generator/", []), "fix_typography": (["typography", "text"], "/design-mcp-server/", []),
 "style_text_unicode": (["text"], "/tools/fancy-text-generator/", []), "lookup_character": (["text", "typography"], "/tools/unicode-characters/", []),
 "generate_website_color_palette": (["colour", "ui"], "/tools/website-color-palette-generator/", []),
 "generate_color_combinations": (["colour", "brand"], "/tools/color-combination-generator/", ["packaging"]),
 "check_contrast": (["colour", "ui"], "/tools/contrast-checker/", []), "convert_color": (["colour"], "/tools/color-converter/", []),
 "generate_color_scale": (["colour", "ui"], "/tools/tailwind-color-generator/", []), "make_color_swatches": (["colour"], "/tools/color-swatch-generator/", ["packaging"]),
 "search_ui_screens": (["ui"], "/inspiration/ui/", []), "get_ui_screen_code": (["ui"], "/inspiration/ui/", []), "get_ui_flow": (["ui"], "/inspiration/ui/flows", []),
 "generate_shadcn_theme": (["ui", "colour"], "/tools/shadcn-theme-generator/", []), "generate_design_md": (["ui"], "/tools/design-md-generator/", ["brand"]),
 "design_md_from_references": (["ui"], "/tools/design-md-generator/", ["brand"]), "lint_design_md": (["ui"], "/tools/design-md-generator/", []),
 "export_design_tokens": (["ui"], "/tools/design-tokens-generator/", []), "get_screen_sizes": (["ui", "images"], "/tools/screen-sizes/", ["motion", "marketing-content"]),
 "search_icons": (["ui"], "/tools/svg-icons/", ["illustration-pattern"]), "generate_llms_txt": (["ui"], "/tools/llms-txt-generator/", ["marketing-content"]),
 "generate_logo_concepts": (["brand"], "/tools/logo-maker/", []), "generate_slogans": (["brand", "text"], "/tools/slogan-generator/", []),
 "make_brand_board": (["brand", "colour"], "/tools/brand-guidelines-template/", []),
 "save_moodboard": (["brand", "images"], "/tools/moodboard-maker/", ["ui-ux-web", "packaging", "graphic-print"]),
 "generate_usernames": (["brand", "text"], "/tools/username-generator/", []),
 "get_paper_sizes": (["print"], "/tools/paper-sizes/", []), "make_grid_paper": (["print"], "/tools/graph-paper/", ["type-lettering", "illustration-pattern"]),
 "get_book_cover_size": (["print"], "/tools/kdp-cover-calculator/", ["marketing-content"]), "make_dieline": (["print"], "/tools/dieline-generator/", ["industrial-product"]),
 "passport_photo_size": (["images", "print"], "/tools/passport-photo-size/", []), "generate_upc_barcode": (["print"], "/tools/upc-generator/", []),
 "generate_data_matrix": (["print"], "/tools/data-matrix-generator/", ["industrial-product"]),
 "make_extruded_part": (["3d"], "/tools/svg-to-stl/", []), "analyze_3d_model": (["3d"], "/tools/stl-viewer/", []), "get_print_clearance": (["3d"], "/tools/3d-print-tolerance/", []),
 "make_box_template": (["3d", "print"], "/tools/box-template/", []), "make_gear": (["3d"], "/tools/gear-generator/", []), "get_screw_specs": (["3d"], "/tools/screw-size-chart/", []),
 "get_hand_anthropometrics": (["3d"], "/tools/hand-size-chart/", ["ui-ux-web"]),
 "search_museum_art": (["images"], "/inspiration/museum/", ["brand"]), "search_annual_reports": (["images", "print"], "/inspiration/annual-reports/", ["brand"]),
 "image_size_calculator": (["images"], "/tools/image-resizer/", ["marketing-content"]),
 "text_to_diagram": (["diagrams"], "/tools/flowchart-maker/", []), "make_graph": (["diagrams"], "/tools/graph-maker/", ["graphic-print"]),
 "make_pie_chart": (["diagrams"], "/tools/pie-chart-maker/", ["graphic-print"]), "make_venn_diagram": (["diagrams"], "/tools/venn-diagram-maker/", []),
 "make_org_chart": (["diagrams"], "/tools/org-chart-maker/", []), "text_to_timeline": (["diagrams"], "/tools/timeline-maker/", ["graphic-print"]),
 "schedule_gantt_chart": (["diagrams"], "/tools/gantt-chart-maker/", []), "make_storyboard": (["diagrams"], "/tools/storyboard-template/", ["motion"]),
 "make_affinity_diagram": (["diagrams"], "/tools/affinity-diagram/", []),
 "count_characters": (["text"], "/tools/character-counter/", []), "diff_text": (["text"], "/tools/diff-checker/", []), "convert_text_case": (["text"], "/tools/case-converter/", []),
 "convert_subtitles": (["text"], "/tools/subtitle-generator/", ["motion"]),
 "make_word_search": (["everyday"], "/tools/word-search-maker/", []), "make_crossword": (["everyday"], "/tools/crossword-maker/", []),
 "make_bingo_cards": (["everyday"], "/tools/bingo-card-generator/", []), "get_public_holidays": (["everyday"], "/tools/calendar-maker/", []),
 "make_weekly_schedule": (["everyday"], "/tools/schedule-maker/", []), "get_share_feedback": (["everyday", "ui"], "/tools/html-to-link/", []),
 # batch 63 (2-Nov-2026): sheet metal + fabrication, packaging nutrition panels, desk ergonomics
 "get_sheet_metal_gauge": (["3d"], "/tools/sheet-metal-gauge-chart/", []), "calc_sheet_metal_bend": (["3d"], "/tools/bend-allowance-calculator/", []),
 "make_cone_pattern": (["3d", "print"], "/tools/cone-template/", []), "make_living_hinge": (["3d"], "/tools/living-hinge-generator/", ["packaging"]),
 "make_nutrition_label": (["print"], "/tools/nutrition-label-generator/", ["brand"]), "get_desk_ergonomics": (["3d"], "/tools/desk-height-calculator/", ["ui-ux-web"]),
}
# /tools/ pages: first matching rule wins (slug regex → categories, roles)
RULES = [
 # batch 63 pages without an MCP tool (2-Nov-2026), ahead of the generic rules ("knitting-chart" is not a diagram)
 (r"^(notan-generator|low-poly-generator|topographic-map-generator|watercolor-effect|oil-painting-effect|mosaic-maker)$", ["images"], ["illustration-pattern", "photo-image"]),
 (r"^(stamp-maker|logo-mockup-generator)$", ["brand"], ["brand", "graphic-print"]),
 (r"^(knitting-chart-maker|circle-skirt-calculator)$", ["print"], ["illustration-pattern", "graphic-print"]),
 (r"stl|3mf|step|obj-|glb|3d-|gear|screw|tap-drill|enclosure|tolerance|hand-size|orthographic", ["3d"], ["industrial-product"]),
 (r"dieline|box|matchbox|pillow|label|upc|barcode|ean|isbn|data-matrix|qr", ["print"], ["packaging", "graphic-print"]),
 (r"font|typeface|letter|calligraph|cursive|fancy-text|handwrit|glyph|kerning|type-scale|text-to-font", ["typography"], ["type-lettering", "graphic-print"]),
 (r"color|colour|palette|hex|rgb|hsl|oklch|cmyk|pantone|swatch|gradient|contrast|tint|shade", ["colour"], ["brand", "ui-ux-web", "graphic-print", "illustration-pattern"]),
 (r"logo|brand|slogan|username|business-name|moodboard|business-card|letterhead", ["brand"], ["brand", "marketing-content"]),
 (r"css|html|svg|favicon|icon|tailwind|shadcn|design-md|token|screen-size|meta-tag|open-graph|json|flexbox|grid-generator|minif|llms|bento|px-to|rem", ["ui"], ["ui-ux-web"]),
 (r"video|gif|mp4|subtitle|animation|frame|storyboard|youtube|mov|webm", ["images"], ["motion", "marketing-content"]),
 (r"image|photo|jpg|png|webp|heic|crop|resize|upscal|background|passport|watermark|pixel|exif|instagram|facebook|twitter|linkedin|thumbnail|blur|risograph", ["images"], ["photo-image", "marketing-content"]),
 (r"pattern|seamless|spirograph|halftone|texture|mandala|pixel-art|isometric|perspective", ["images"], ["illustration-pattern"]),
 (r"paper|poster|flyer|brochure|book|kdp|bleed|print|pdf|booklet|bookmark|card|invitation|certificate|menu|calendar|planner|template", ["print"], ["graphic-print"]),
 (r"chart|graph|diagram|timeline|venn|gantt|org-|flowchart|mind-map|matrix|persona|affinity|journey|wireframe|sitemap", ["diagrams"], ["marketing-content", "ui-ux-web"]),
 (r"symbol|character|unicode|emoji|case|counter|text|word|line|quote|invisible|diff|roman|morse|braille|hiragana|katakana", ["text"], ["marketing-content", "type-lettering"]),
]
def main():
    slug_file = os.path.join(ROOT, "docs", "tool_page_slugs.txt")
    if "--refresh" in sys.argv or not os.path.exists(slug_file):
        req = urllib.request.Request("https://madegooddesigns.com/tools/", headers={"User-Agent": "curl/8.4.0", "Accept": "*/*"})
        html = urllib.request.urlopen(req, timeout=60).read().decode("utf-8", "replace")
        slugs = sorted(set(re.findall(r"madegooddesigns\.com/tools/([a-z0-9-]+)/", html)))
        open(slug_file, "w").write("\n".join(slugs) + "\n")
    slugs = open(slug_file).read().split()
    tools = {}
    for n, (cats, page, extra) in T.items():
        roles = []
        for c in cats:
            for r in CAT_ROLES[c]:
                if r not in roles: roles.append(r)
        for r in extra:
            if r not in roles: roles.append(r)
        tools[n] = {"categories": cats, "roles": roles, "page": "https://madegooddesigns.com" + page}
    used_pages = {v["page"].split("/tools/")[-1].strip("/") for v in tools.values() if "/tools/" in v["page"]}
    pages = {}
    for s in slugs:
        hit = next(((c, r) for rx, c, r in RULES if re.search(rx, s)), (["everyday"], ["marketing-content"]))
        pages[s] = {"categories": hit[0], "roles": hit[1], "auto": True, "mcp_tools": sorted(n for n, v in tools.items() if v["page"].endswith(f"/tools/{s}/"))}
    for s, pg in pages.items():  # pages backing MCP tools: curated = union of those tools' categories/roles
        if pg["mcp_tools"]:
            pg["auto"] = False
            pg["categories"] = sorted({c for n in pg["mcp_tools"] for c in tools[n]["categories"]})
            pg["roles"] = sorted({r for n in pg["mcp_tools"] for r in tools[n]["roles"]})
    missing = [s for s in used_pages if s not in pages]
    if missing: sys.exit(f"MCP tool pages not on the /tools/ hub: {missing}")
    out = {"version": "2026-11-02", "categories": CATEGORIES, "roles": ROLES, "tools": tools, "pages": pages}
    json.dump(out, open(OUT, "w"), indent=0, separators=(",", ":"))
    print(f"{len(tools)} MCP tools, {len(pages)} /tools/ pages → {OUT} ({os.path.getsize(OUT):,} bytes)")
main()
