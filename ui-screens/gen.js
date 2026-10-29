#!/usr/bin/env node
/* MGD UI screens generator. Original screens only (no real-app content).
   Pattern templates live in tpl/*.js (each exports { "<pattern>": { family, name, shows, elements, web, mobile, type?, size?, variants? } }).
   For each pattern × platform × style (× variant): out/<slug>/{index.html, DESIGN.md, meta.json}, plus out/manifest.json and out/flows.json.
   Colours come from color-roles-core.js and DESIGN.md from design-md-core.js, so screens, website tools and the MCP share one engine.
   Usage: node gen.js [--only pattern,pattern] [--styles minimal,editorial] [--platforms web,mobile] */
const fs = require("fs"), path = require("path"), vm = require("vm");
const lib = require("./lib");
const { STYLES, FAMILIES, esc, baseCss } = lib;

const ROOT = __dirname, CORES = path.join(ROOT, "../../tool-gap-2026-10/newtools");
const OUT = path.join(ROOT, "out");
const TAX = JSON.parse(fs.readFileSync(path.join(ROOT, "taxonomy.json"), "utf8"));

// Seeded Math.random so a given screen always renders the same colours and data.
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function hashStr(s) { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; }
const sandbox = { Math: Object.create(Math) };
sandbox.window = sandbox;
vm.createContext(sandbox);
for (const f of ["color-roles-core.js", "design-md-core.js"]) vm.runInContext(fs.readFileSync(path.join(CORES, f), "utf8"), sandbox);
const R = sandbox.MGDRoles, DM = sandbox.MGDDesignMd;
if (!R || !DM) throw new Error("cores did not load");
lib.setCore(DM);

// ---- Pattern registry from tpl/*.js ------------------------------------------------------------
const PATTERNS = {};
for (const f of fs.readdirSync(path.join(ROOT, "tpl")).filter((f) => f.endsWith(".js")).sort()) {
  const mod = require(path.join(ROOT, "tpl", f));
  for (const [k, d] of Object.entries(mod)) {
    if (PATTERNS[k]) throw new Error(`pattern ${k} defined twice (${f})`);
    if (!FAMILIES[d.family]) throw new Error(`pattern ${k}: unknown family ${d.family}`);
    PATTERNS[k] = { ...d, file: f };
  }
}

const VIEWPORT = { web: [1440, 900], mobile: [390, 844] };
function palette(family, styleName) {
  const st = STYLES[styleName];
  sandbox.Math.random = mulberry32(hashStr(FAMILIES[family].name + styleName)); // same family+style → same palette everywhere (flows stay consistent)
  const sd = R.seed({ mood: st.mood, harmony: st.harmony, hue: st.hue });
  const light = R.build(sd, "light").roles, dark = R.build(sd, "dark").roles;
  if (st.mono) for (const [t, g] of [[light, ["#ffffff", "#fafafa", "#e4e4e4", "#111111", "#666666", "#111111", "#ffffff", "#444444"]], [dark, ["#0a0a0a", "#161616", "#2c2c2c", "#f2f2f2", "#a0a0a0", "#f2f2f2", "#0a0a0a", "#c8c8c8"]]])
    R.ROLES.forEach((k, i) => { t[k] = g[i]; });
  return { light, dark };
}

function buildOne(pattern, platform, styleName, variant) {
  const d = PATTERNS[pattern], st = STYLES[styleName], fam = FAMILIES[d.family], tpl = d[platform];
  if (!tpl) return null;
  const vname = variant ? (d.variants[variant] || {}).name || variant : null;
  const p = { ...fam, family: d.family, variant: variant || null };
  const slug = `${pattern}${variant ? "-" + variant : ""}-${platform}-${styleName}`, rnd = mulberry32(hashStr(slug));
  const { light, dark } = palette(d.family, styleName);
  const md = DM.build({ name: fam.name, description: fam.desc, productType: fam.type[platform], personality: st.personality,
    light, darkColors: dark, dark: true, headingFont: st.hf, bodyFont: st.bf, radius: st.radius, shadows: st.shadows, motion: "subtle",
    density: platform === "web" ? "comfortable" : "spacious", components: ["buttons", "forms", "cards", "nav", "tables", "badges"],
    dos: st.numRule ? DM.DEFAULT_DO + "\nUse the heading serif only for page titles and marketing headlines. Set metrics, prices, plan names and table figures in the body sans with `font-variant-numeric: tabular-nums`." : undefined });
  const [w, h] = (d.size && d.size[platform]) || VIEWPORT[platform];
  const body = tpl(p, st, rnd);
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=${platform === "web" ? "device-width" : w},initial-scale=1">
<title>${esc(fam.name)} — ${(vname || pattern).replace(/-/g, " ")} (${platform}, ${styleName}) · MGD UI screens</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=${st.fonts}&display=swap" rel="stylesheet">
<!-- Made Good Designs UI screen — original reference design, free to copy. Tokens: see DESIGN.md -->
<style>${baseCss(light, st)}${st.css || ""}</style></head><body>${body}</body></html>`;
  const dir = path.join(OUT, slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), html);
  fs.writeFileSync(path.join(dir, "DESIGN.md"), md);
  const v = variant ? d.variants[variant] : null;
  const meta = { slug, type: d.type || "screen", pattern, variant: variant || null, platform, style: styleName, family: d.family, category: fam.cat, product: fam.name,
    name: v && v.name ? v.name : d.name, shows: v && v.shows ? v.shows : d.shows, elements: d.elements,
    viewport: { w, h }, tokens: { light, dark }, fonts: { heading: st.hf, body: st.bf } };
  fs.writeFileSync(path.join(dir, "meta.json"), JSON.stringify(meta, null, 2));
  return meta;
}

const arg = (k) => { const i = process.argv.indexOf(k); return i > -1 ? process.argv[i + 1].split(",") : null; };
const pats = arg("--only") || Object.keys(PATTERNS), styles = arg("--styles") || Object.keys(STYLES), plats = arg("--platforms") || ["web", "mobile"];
let n = 0;
for (const pa of pats) {
  if (!PATTERNS[pa]) { console.error("unknown pattern", pa); process.exitCode = 1; continue; }
  const vars = PATTERNS[pa].variants ? Object.keys(PATTERNS[pa].variants) : [null];
  for (const pl of plats) for (const s of styles) for (const v of vars) if (buildOne(pa, pl, s, v)) n++;
}
// Manifest covers everything in out/ (partial runs keep the rest).
const all = fs.readdirSync(OUT).filter((d) => fs.existsSync(path.join(OUT, d, "meta.json")) && PATTERNS[JSON.parse(fs.readFileSync(path.join(OUT, d, "meta.json"))).pattern])
  .map((d) => { const { tokens, ...m } = JSON.parse(fs.readFileSync(path.join(OUT, d, "meta.json"))); return m; });
fs.writeFileSync(path.join(OUT, "manifest.json"), JSON.stringify(all, null, 2));
// Flows: ordered steps ("pattern" or "pattern:variant"), resolved per platform × style to slugs that exist.
const have = new Set(all.map((m) => m.slug)), flows = [];
for (const [id, f] of Object.entries(TAX.flows || {})) for (const pl of ["web", "mobile"]) for (const s of Object.keys(STYLES)) {
  const steps = f.steps.map((st) => { const [pa, v] = st.split(":"); return `${pa}${v ? "-" + v : ""}-${pl}-${s}`; });
  if (steps.every((x) => have.has(x))) flows.push({ id, name: f.name, platform: pl, style: s, steps });
}
fs.writeFileSync(path.join(OUT, "flows.json"), JSON.stringify(flows, null, 2));
console.log(`built ${n} screens; manifest ${all.length}; flows ${flows.length} → ${OUT}`);
