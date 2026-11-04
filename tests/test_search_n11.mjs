// Node unit tests for src/search_extras.js (5-Nov-2026): (A) icon-intent hint, (B) get_brand_typeface helpers, (C) FTS query building.
// Run: node tests/test_search_n11.mjs   (prints "N passed, M failed", exits 1 on failure)
import { iconIntent, withIconHint, BRAND_TYPEFACE_TOOL, btClean, btKey, btLev, btInputs, btFormat, brandTypeface,
  ftsWords, ftsTiers, ftsQualify, ftsSearch, FTS_COLS } from "../src/search_extras.js";
let ok = 0, fail = 0;
const t = (name, cond, info) => { cond ? ok++ : fail++; console.log((cond ? "PASS " : "FAIL ") + name + (cond ? "" : " | " + JSON.stringify(info).slice(0, 300))); };

// (A)
const yes = { "bold icon": "bold", "settings icon": "settings", "trash icons": "trash", "icon for delete": "delete", "arrow right icon svg": "arrow right", "shopping cart glyph": "shopping cart" };
for (const [q, want] of Object.entries(yes)) t(`iconIntent("${q}") = "${want}"`, iconIntent(q) === want, iconIntent(q));
for (const q of ["app icon", "iconic poster", "logo icon", "religious icon painting", "fashion icon", "serif wordmark", "icons", "a very long descriptive query about an icon in a painting scene"])
  t(`iconIntent("${q}") = null`, iconIntent(q) === null, iconIntent(q));
const base = () => ({ content: [{ type: "text", text: "3 design-inspiration result(s) for \"bold icon\". Source: …" }] });
const fakeIcons = async (a) => ({ content: [{ type: "text", text: "x" }], structuredContent: { icons: [{ set: "lucide", name: a.query, license: "ISC", import: `import { Bold } from "lucide-react";` }] } });
let r = await withIconHint("bold icon", base(), fakeIcons);
t("hint leads, results kept", r.content[0].text.startsWith("Looking for UI icons? search_icons(query=\"bold\")") && r.content[0].text.includes("3 design-inspiration result(s)") && r.content[0].text.includes("lucide/bold"), r.content[0].text);
r = await withIconHint("bold icon", base(), async () => { throw new Error("cdn down"); });
t("icon fetch error → hint only, results kept", r.content[0].text.includes("Call search_icons(query=\"bold\")") && r.content[0].text.includes("result(s)"), r.content[0].text);
r = await withIconHint("serif poster", base(), fakeIcons);
t("non-icon query untouched", r.content[0].text === base().content[0].text);
const slow = () => new Promise((res) => setTimeout(() => res(null), 4000));
const t0 = Date.now(); r = await withIconHint("bold icon", base(), slow);
t("slow icon data capped at ~2.5 s", Date.now() - t0 < 3200 && r.content[0].text.includes("result(s)"), Date.now() - t0);

// (B)
t("tool description < 1024 chars and starts 'Use when'", BRAND_TYPEFACE_TOOL.description.length < 1024 && BRAND_TYPEFACE_TOOL.description.startsWith("Use when"), BRAND_TYPEFACE_TOOL.description.length);
t("btClean strips font words", btClean("Rolex typeface") === "Rolex" && btClean("What font does Nike use?") === "Nike" && btClean("Coca-Cola brand font") === "Coca-Cola" && btClean("McDonald's logo font") === "McDonald", [btClean("Rolex typeface"), btClean("What font does Nike use?"), btClean("McDonald's logo font")]);
t("btKey folds case/accents/punctuation/the", btKey("Nestlé") === "nestle" && btKey("The North Face") === "northface" && btKey("H&M") === "handm" && btKey("Coca-Cola") === "cocacola");
t("btLev", btLev("supreme", "suprem", 2) === 1 && btLev("rolex", "rolax", 1) === 1 && btLev("rolex", "nike", 1) > 1);
const inp = btInputs({ brands: ["Rolex typeface", "Supreme font", "rolex"], brand: "Nike, Spotify" });
t("btInputs: list + comma string, dedupe by key, max 10", inp.map((x) => x.key).join(",") === "rolex,supreme,nike,spotify", inp);
t("btInputs caps at 10", btInputs({ brands: Array.from({ length: 14 }, (_, i) => "Brand" + i) }).length === 10);
const row = { brand: "Supreme", kind: "named", named: '[{"name":"Futura","licence":"commercial"}]', alts: '[{"name":"Jost","category":"Sans Serif"}]',
  summary: "The Supreme box logo is set in Futura Bold Oblique.", font_url: "https://madegooddesigns.com/supreme-font/", guide_url: "https://madegooddesigns.com/supreme-brand-guidelines/",
  style: "Bold oblique sans", spec_font: "Archivo", spec_brand: 0, tile_id: "abc123abc123", palette: '["#ED1C24","#FFFFFF"]' };
const f = btFormat(row, "https://madegooddesigns.com/inspiration");
t("btFormat: verdict, named, alts, stand-in flagged, tile + both links", /verdict: a named typeface/.test(f.text) && /Futura \(commercial\)/.test(f.text) && /Jost \(sans serif\)/.test(f.text) &&
  /NOT the brand's own font/.test(f.text) && f.data.tile_image === "https://madegooddesigns.com/inspiration/img/items/abc123abc123.png" && f.data.font_guide_url && f.data.brand_guide_url, f.text);
t("btFormat never invents: no font facts → says so", /not in our data yet/.test(btFormat({ brand: "X", named: "[]", alts: "[]", palette: "[]", guide_url: "u" }, "s").text));
// brandTypeface against a fake D1
const table = [row, { ...row, brand: "Rolex", key: "rolex", kind: "custom", named: "[]", summary: "Rolex does not use an off-the-shelf font.", font_url: "https://madegooddesigns.com/rolex-font/", guide_url: null, tile_id: null }];
table[0].key = "supreme";
const fakeEnv = { DB: { prepare(sql) { return { bind(...b) { return { all: async () => {
  if (/FROM brand_type WHERE key=\? OR alias=\?/.test(sql)) return { results: table.filter((x) => x.key === b[0]) };
  if (/FROM brand_type WHERE key LIKE \? ORDER BY/.test(sql)) return { results: table.filter((x) => x.key.startsWith(b[0].slice(0, -1))) };
  if (/FROM brand_type WHERE key LIKE \? AND length/.test(sql)) return { results: table.filter((x) => x.key.startsWith(b[0].slice(0, -1))) };
  if (/FROM items WHERE style='type-specimen'/.test(sql)) return { results: b[0].startsWith("Newbrand") ? [{ id: "fff000fff000", company: "Newbrand", source_url: "https://madegooddesigns.com/newbrand-brand-guidelines/#type", palette: "[]", image_key: "items/fff000fff000.png" }] : [] };
  return { results: [] }; } }; } }; } } };
r = await brandTypeface({ brands: ["Supreme typeface", "rolax", "Newbrand font", "Nosuchbrand"] }, fakeEnv, "https://madegooddesigns.com/inspiration");
const sc = r.structuredContent;
t("batch call: exact + fuzzy + tile fallback + not_found", sc.brands.map((x) => x.brand + ":" + x.match).join(",") === "Supreme:exact,Rolex:fuzzy,Newbrand:tile" && sc.not_found[0] === "Nosuchbrand", sc);
t("fuzzy match is labelled", /closest match for "rolax"/.test(r.content[0].text), r.content[0].text);
r = await brandTypeface({ brand: "Nosuchbrand" }, fakeEnv, "s");
t("zero → '0 results' (counted by mcpZero), not an error", !r.isError && /^0 results/.test(r.content[0].text), r.content[0].text);
r = await brandTypeface({}, fakeEnv, "s");
t("no input → isError", r.isError === true);

// (C)
const STOP = new Set(["the", "and", "design", "inspiration"]);
t("ftsWords: lowercase, accents folded, stop words out, dedupe", ftsWords("Café CRÈME poster design posters", STOP).join(" ") === "cafe creme poster posters", ftsWords("Café CRÈME poster design posters", STOP));
t("ftsWords keeps 2-letter tokens (UI, 3D, AI)", ftsWords("3D ui", STOP).join(" ") === "3d ui");
const tiers = ftsTiers(["klimt", "gold"], ["title", "tags"]);
t("ftsTiers: phrase → all → any → prefix, with column filter", tiers.map((x) => x.tier).join(",") === "phrase,all,any,prefix" && tiers[1].expr === '{title tags} : ("klimt" AND "gold")' && tiers[3].expr === '{title tags} : ("klimt"* OR "gold"*)', tiers);
t("ftsTiers single word: all + prefix only", ftsTiers(["poster"], null).map((x) => x.tier).join(",") === "all,prefix");
t("ftsQualify", ftsQualify("status=? AND owner_id IS NULL AND collection=? AND themes LIKE ?") === "items.status=? AND items.owner_id IS NULL AND items.collection=? AND items.themes LIKE ?");
t("FTS covers every column the library searches use", ["title", "description", "tags", "themes", "company", "designer", "industry"].every((c) => FTS_COLS.includes(c)));
// fallbacks: no table, unsupported column, SQL error, zero hits → null (caller runs the LIKE search)
const envNo = { DB: { prepare: () => ({ first: async () => null, bind: () => ({ all: async () => ({ results: [] }) }) }) } };
t("no items_fts → null", (await ftsSearch(envNo, "status=?", ["published"], ["title"], "poster", "created_at DESC", 8, STOP)) === null);
t("unsupported column → null", (await ftsSearch(envNo, "status=?", ["published"], ["source_host"], "poster", "created_at DESC", 8, STOP)) === null);
t("kill switch SEARCH_FTS=0 → null", (await ftsSearch({ ...envNo, SEARCH_FTS: "0" }, "status=?", [], ["title"], "poster", "created_at DESC", 8, STOP)) === null);
console.log(`${ok} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
