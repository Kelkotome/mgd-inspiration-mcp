#!/usr/bin/env node
/* Industry template sets: niche content × page layouts (healthcare pilot, 7-Nov-2026). Writes to ui-screens/out-hc/<slug>/, never to out/.
   Each design is one responsive document, rendered in its layout's home style. meta.json matches gen.js so ingest.py --out out-hc works.
   Usage: node gen_hc.js [--only cardiology,dental] [--layouts atlas,band] */
const fs = require("fs"), path = require("path"), vm = require("vm");
const lib = require("./lib"); const { STYLES, FAMILIES, esc, baseCss } = lib;
const ROOT = __dirname, CORES = process.env.MGD_CORES_DIR || path.join(ROOT, "../../tool-gap-2026-10/newtools"), OUT = process.env.HC_OUT || path.join(ROOT, "out-hc");
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function hashStr(s) { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; }
const sandbox = { Math: Object.create(Math) }; sandbox.window = sandbox; vm.createContext(sandbox);
for (const f of ["color-roles-core.js", "design-md-core.js"]) vm.runInContext(fs.readFileSync(path.join(CORES, f), "utf8"), sandbox);
const R = sandbox.MGDRoles, DM = sandbox.MGDDesignMd; lib.setCore(DM);
const { LAYOUTS } = require("./hc/engine");
const palette = (family, styleName) => { const st = STYLES[styleName]; sandbox.Math.random = mulberry32(hashStr(FAMILIES[family].name + styleName)); const sd = R.seed({ mood: st.mood, harmony: st.harmony, hue: st.hue }); return { light: R.build(sd, "light").roles, dark: R.build(sd, "dark").roles }; };
const arg = (k) => { const i = process.argv.indexOf(k); return i > -1 ? process.argv[i + 1].split(",") : null; };
const onlyN = arg("--only"), onlyL = arg("--layouts"), CHECK = process.argv.includes("--check");
const niches = fs.readdirSync(path.join(ROOT, "hc/content")).filter((f) => f.endsWith(".js")).map((f) => require(`./hc/content/${f}`)).filter((c) => !onlyN || onlyN.includes(c.niche));
// Schema gate: a missing field would print "undefined" into a page.
function need(c) {
  const miss = []; const req = (ok, k) => { if (!ok) miss.push(k); };
  for (const k of ["niche", "pattern", "family", "kind", "motif", "nav", "hero", "facts", "doors", "services", "index", "process", "table", "team", "audience", "statement", "faq", "visit", "cta", "footer", "notice"]) req(c[k], k);
  if (miss.length) throw new Error(`${c.niche}: missing ${miss.join(", ")}`);
  for (const k of ["services", "process", "team", "faq", "visit", "cta", "hero", "call"]) if (k !== "cta" && k !== "hero") req(k in c.nav || k === "call" && 1, "nav." + k);
  for (const k of ["eyebrow", "h1", "lede", "cta", "alt"]) req(c.hero[k], "hero." + k);
  req(c.facts.length === 3, "facts=3"); req(c.doors.length === 3, "doors=3"); req(c.services.items.length === 6, "services=6"); req(c.index.items.length >= 10 && c.index.items.length <= 14, "index 10-14"); req(c.process.steps.length === 4, "steps=4");
  req(c.table.cols.length === 3 && c.table.rows.length === 5 && c.table.rows.every((r) => r.length === 3), "table 3x5"); req(c.team.people.length === 4, "people=4"); req(c.faq.items.length === 6, "faq=6"); req(c.visit.locations.length === 2, "locations=2");
  for (const s of c.services.items) { req(s.icon && s.t && s.d && s.who, "service fields"); req(lib.ICON[s.icon], `icon ${s.icon}`); }
  req(c.hero.h1.length <= 46, "hero.h1 <=46 chars"); req(/\.example$/.test(c.visit.email), "email .example"); if (!CHECK) req(require("./hc/engine").GLYPH[c.motif], "motif");
  // property layouts (listing, showcase) need listings and a featured home: real estate content only
  const KINDS = ["house", "townhouse", "flat", "tower", "cabin", "villa", "plot", "shop"];
  if ((c.layouts || []).some((l) => l === "listing" || l === "showcase")) {
    req(c.listings && c.listings.h2 && c.listings.eyebrow && c.listings.lede && c.listings.items && c.listings.items.length === 6, "listings: eyebrow, h2, lede, 6 items");
    for (const x of (c.listings && c.listings.items) || []) { req(x.t && x.area && x.price && x.tag, "listing fields"); req(KINDS.includes(x.kind), `listing kind ${x.kind}`); req(Array.isArray(x.specs) && x.specs.length === 3, "listing specs=3"); }
    req(c.feature && c.feature.eyebrow && c.feature.t && c.feature.lede && c.feature.price && c.feature.rooms && c.feature.rooms.length === 5 && c.feature.rooms.every((r) => r.length === 2), "feature: eyebrow, t, lede, price, 5 rooms");
  }
  // restaurant layouts (menu, reserve) need a menu, booking details and dish drawings: restaurant content only
  const ART = ["plate", "bowl", "pizza", "loaf", "cup", "glass", "cake", "tray"];
  if ((c.layouts || []).some((l) => l === "menu" || l === "reserve")) {
    const m = c.menu || {}; req(m.eyebrow && m.h2 && m.lede && m.board && m.note && /sample/i.test(m.note), "menu: eyebrow, h2, lede, board, note (says sample)");
    req(Array.isArray(m.sections) && m.sections.length === 3 && m.sections.every((s) => s.t && s.items && s.items.length === 4 && s.items.every((x) => x.n && x.d && x.p && Array.isArray(x.tags))), "menu: 3 sections of 4 items { n, d, p, tags }");
    req(Array.isArray(m.keys) && m.keys.length >= 2 && m.keys.length <= 5, "menu.keys 2-5");
    const codes = new Set((m.keys || []).map((k) => k[0])); for (const s of m.sections || []) for (const x of s.items || []) for (const t of x.tags || []) req(codes.has(t), `menu tag ${t} not in keys`);
    const b = c.booking || {}; req(b.h2 && b.date && b.note && Array.isArray(b.sizes) && b.sizes.length >= 3 && Array.isArray(b.slots) && b.slots.length === 6 && Array.isArray(b.hours) && b.hours.length === 4, "booking: h2, date, note, sizes>=3, 6 slots, 4 hours rows");
    req(Array.isArray(c.art) && c.art.length === 3 && c.art.every((a) => ART.includes(a)), "art: 3 dish kinds");
  }
  // wedding and event layouts (invite, programme) need an occasion, a reply form, a programme and venue drawings: weddings and events content only
  const WART = ["barn", "arch", "table", "hall", "bouquet", "marquee", "camera", "cake"];
  if ((c.layouts || []).some((l) => l === "invite" || l === "programme")) {
    const o = c.occasion || {}; req(Array.isArray(o.title) && o.title.length >= 1 && o.title.length <= 3 && o.date && o.place && o.time && o.timelineH2 && o.timelineLede, "occasion: title (1-3 lines), date, place, time, timelineH2, timelineLede");
    req(Array.isArray(o.timeline) && o.timeline.length >= 5 && o.timeline.length <= 7 && o.timeline.every((r) => r.length === 3 && r.every(Boolean)), "occasion.timeline: 5-7 of [time, title, detail]");
    const r = c.reply || {}; req(r.h2 && r.lede && r.choicesLabel && r.selectLabel && r.askLabel && r.button && r.note && Array.isArray(r.choices) && r.choices.length >= 2 && r.choices.length <= 4 && Array.isArray(r.options) && r.options.length >= 3 && r.options.length <= 6, "reply: h2, lede, choicesLabel, 2-4 choices, selectLabel, 3-6 options, askLabel, button, note");
    const g = c.programme || {}; req(g.h2 && g.lede && g.note && /sample/i.test(g.note) && g.mapH2 && g.mapLede && g.mapNote && Array.isArray(g.spots) && g.spots.length === 6, "programme: h2, lede, note (says sample), mapH2, mapLede, mapNote, 6 spots");
    req(Array.isArray(g.days) && g.days.length >= 2 && g.days.length <= 3 && g.days.every((d) => d.t && d.sub && Array.isArray(d.slots) && d.slots.length >= 3 && d.slots.length <= 5 && d.slots.every((x) => x.length === 3 && x.every(Boolean))), "programme.days: 2-3 of { t, sub, 3-5 slots [time, title, where] }");
    req(Array.isArray(c.art) && c.art.length === 3 && c.art.every((a) => WART.includes(a)), "art: 3 event drawings");
  }
  for (const [k, n] of [["visit.fields", c.visit.fields], ["footer.cols", c.footer.cols], ["services.cols", c.services.cols]]) if (n) req(Array.isArray(n) && n.length === 3 && n.every(Boolean), `${k}: 3 labels`);
  if (/—/.test(JSON.stringify(c))) miss.push("em dash");
  if (miss.length) throw new Error(`${c.niche}: ${miss.join(", ")}`);
}
if (CHECK) { for (const c of niches) { need(c); console.log("ok", c.niche); } process.exit(0); }
let n = 0;
for (const c of niches) {
  need(c);
  const fam = FAMILIES[c.family]; if (!fam) throw new Error("unknown family " + c.family);
  const set = c.layouts || ["atlas", "folio", "ledger", "bento", "band"];
  for (const lid of set.filter((l) => !onlyL || onlyL.includes(l))) {
    const L = LAYOUTS[lid], st = STYLES[L.style], { light, dark } = palette(c.family, L.style), p = { ...fam, family: c.family, variant: lid };
    const body = L.fn(p, st, c);
    const md = DM.build({ name: fam.name, description: fam.desc, productType: "Website", personality: st.personality, light, darkColors: dark, dark: true, headingFont: st.hf, bodyFont: st.bf, radius: st.radius, shadows: st.shadows, motion: "subtle", density: "comfortable", components: ["buttons", "forms", "cards", "nav", "tables", "badges"] });
    for (const platform of ["web", "mobile"]) {
      const slug = `${c.pattern}-${lid}-${platform}-${L.style}`, dir = path.join(OUT, slug); fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, "index.html"), `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(fam.name)} — ${L.name} layout (${platform}, ${L.style}) · MGD UI screens</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=${st.fonts}&display=swap" rel="stylesheet">
<!-- Made Good Designs UI screen — original reference design, free to copy. Tokens: see DESIGN.md -->
<style>${baseCss(light, st, dark)}${st.css || ""}</style></head><body>${body}</body></html>`);
      fs.writeFileSync(path.join(dir, "DESIGN.md"), md);
      const name = `${fam.cat === c.niche ? c.niche[0].toUpperCase() + c.niche.slice(1).replace(/-/g, " ") : fam.name} website, ${L.name} layout`, shows = `a full home page for ${c.kind}: ${L.about}`;
      fs.writeFileSync(path.join(dir, "meta.json"), JSON.stringify({ slug, type: "page", pattern: c.pattern, variant: lid, platform, style: L.style, family: c.family, category: fam.cat, product: fam.name, name, shows,
        elements: ["website-template", "landing-page", "responsive", "faq", "navigation-header", "footer"], viewport: { w: platform === "web" ? 1440 : 390, h: platform === "web" ? (LAYOUTS[lid].webH || 6400) : (LAYOUTS[lid].mobileH || (LAYOUTS[lid].needs === "listings" ? 11200 : 8400)) } /* property layouts run to ~10,700 px on a phone; 8400 cut off the footer and its fictional notice */, tokens: { light, dark }, fonts: { heading: st.hf, body: st.bf }, layout: lid, niche: c.niche }, null, 2));
      n++;
    }
  }
}
console.log(`built ${n} screens in ${OUT}`);
