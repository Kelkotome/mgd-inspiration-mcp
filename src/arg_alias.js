// typo-b1 (25-Nov-2026): common argument aliases for the most-used MCP tools. Callers often send the obvious synonym instead of the
// schema name (get_ui_screen_code {"id": ...}, generate_color_scale {"color": ...}, get_font_pairing {"font_name": ...}) and got an
// error or a usage list. Before a tool runs (and before run_design_tool's schema check), a missing or empty canonical argument is filled
// from the first alias present. Nothing is removed and an argument the caller did send is never overwritten. camelCase keys
// (screenId, brandColor, fontFamily) also map to the schema's snake_case name when the tool has that property.
// Pure (no env, no D1): tests/typo_b1.test.mjs imports it directly.
const Q = ["q", "search", "keyword", "keywords", "term", "search_query", "prompt"];
const BRAND_COLOR = ["color", "colour", "hex", "primary", "primary_color", "brand_colour", "base_color", "main_color"];
export const ARG_ALIASES = {
  get_ui_screen_code: { screen_id: ["id", "screen", "screen_url", "url", "item_id", "page", "page_url"] },
  get_ui_flow: { flow: ["flow_id", "id", "name", "query"] },
  search_ui_screens: { query: Q },
  search_design_inspiration: { query: Q },
  search_museum_art: { query: Q },
  search_annual_reports: { query: [...Q, "company"] },
  search_icons: { query: [...Q, "icon", "name"] },
  browse_inspiration_by_theme: { theme: ["theme_id", "slug", "name", "query"] },
  generate_color_scale: { colors: ["color", "colour", "colours", "hex", "brand_color", "base_color"] },
  generate_website_color_palette: { brand_color: BRAND_COLOR },
  generate_shadcn_theme: { brand_color: BRAND_COLOR },
  generate_design_md: { brand_color: BRAND_COLOR, project_name: ["name", "brand", "brand_name", "project"] },
  generate_color_combinations: { base_color: ["color", "colour", "hex", "brand_color"] },
  check_contrast: { foreground: ["fg", "text_color", "foreground_color", "fg_color", "text"], background: ["bg", "background_color", "bg_color"] },
  generate_logo_concepts: { name: ["brand_name", "brand", "company", "company_name", "business_name"] },
  make_brand_board: { brand_name: ["name", "brand", "company", "company_name"] },
  get_brand_typeface: { brand: ["brand_name", "company", "company_name", "name", "query"] },
  get_font_pairing: { font: ["font_name", "typeface", "family", "font_family", "name", "query"] },
};
const empty = (v) => v == null || v === "" || (Array.isArray(v) && !v.length);
const snake = (k) => k.replace(/[A-Z]/g, (m) => "_" + m.toLowerCase());

export function normalizeArgs(name, a, props) {
  if (!a || typeof a !== "object" || Array.isArray(a)) return a;
  let out = a;
  const set = (k, v) => { if (out === a) out = { ...a }; out[k] = v; };
  if (props) for (const k of Object.keys(a)) {
    const s = snake(k);
    if (s !== k && s in props && !(k in props) && empty(out[s]) && !empty(a[k])) set(s, a[k]);
  }
  const map = ARG_ALIASES[name];
  if (map) {
    const byS = {}; for (const k of Object.keys(a)) if (!(snake(k) in byS) || k === snake(k)) byS[snake(k)] = k;   // fontFamily -> font_family
    for (const [canon, alts] of Object.entries(map)) {
      if (!empty(out[canon])) continue;
      const hit = alts.map((k) => byS[k]).find((k) => k !== undefined && !empty(out[k]) && !(props && k in props));
      if (hit) set(canon, out[hit]);
    }
  }
  return out;
}
