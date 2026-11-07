// node --no-warnings tests/ui_spec.test.mjs: spec block (7-Nov-2026) extraction, phrase lint and rendering, against every
// template in ui-screens/out and ui-screens/out-hc (read only).
import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { extractSpec, parseSpecJson, parseDesignExtras, bestFor, specLines, specBlock, GOOGLE_FONTS, FONT_NOTE } from "../src/ui_spec.js";
import { STYLE_PHRASES, INDUSTRY_PHRASES, OVERRIDES, BANNED } from "../src/ui_spec_phrases.js";
import { parseDesignMd } from "../src/ui_kit.js";

const src = fs.readFileSync("src/ui_screens.js", "utf8");
const PAGES = JSON.parse(src.match(/UI_PAGE_PATTERNS = (\[.*?\]);/)[1]), STYLES = JSON.parse(src.match(/UI_STYLES = (\[.*?\]);/)[1]);
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
let checks = 0; const ok = (c, m) => { checks++; assert.ok(c, m); };

// 1. extraction on the law firm template (sections and breakpoints read by hand from its HTML)
const LAW = "ui-screens/out/law-firm-website-homepage-web-minimal";
const law = extractSpec(fs.readFileSync(`${LAW}/index.html`, "utf8"));
assert.deepEqual(law, { v: 1, sections: ["hero", "practice areas", "fees", "our lawyers", "insights", "book a consultation", "footer"], breakpoints: [1024, 960, 760], darkMedia: true }); checks++;
assert.deepEqual(extractSpec(`<section id="a-b"></section><section></section><section id="X1"></section><section id="a-b"></section><style>@media (min-width: 640px) and (max-width:1100px){}</style>`),
  { v: 1, sections: ["a b"], breakpoints: [1100, 640], darkMedia: false }); checks++;
assert.deepEqual(extractSpec(""), { v: 1, sections: [], breakpoints: [], darkMedia: false }); checks++;
assert.equal(parseSpecJson(JSON.stringify(law)).sections.length, 7); assert.equal(parseSpecJson("nope"), null); assert.equal(parseSpecJson('{"v":2,"sections":[],"breakpoints":[]}'), null); checks += 3;

// 2. every template: pages get ≥4 sections and ≥1 breakpoint; screens and emails get no sections; every DESIGN.md has the extras
const bad = [], counts = { page: 0, section: 0, screen: 0, email: 0 };
for (const out of ["ui-screens/out", "ui-screens/out-hc"]) for (const d of fs.readdirSync(out)) {
  const dir = path.join(out, d); if (!fs.existsSync(path.join(dir, "meta.json"))) continue;
  const m = JSON.parse(fs.readFileSync(path.join(dir, "meta.json"), "utf8")), s = extractSpec(fs.readFileSync(path.join(dir, "index.html"), "utf8"));
  const md = fs.readFileSync(path.join(dir, "DESIGN.md"), "utf8"), x = parseDesignExtras(md); counts[m.type] = (counts[m.type] || 0) + 1;
  if (m.type === "page" && (s.sections.length < 4 || !s.breakpoints.length)) bad.push(`${d}: ${s.sections.length} sections, ${s.breakpoints.length} breakpoints`);
  if ((m.type === "screen" || m.type === "email") && s.sections.length) bad.push(`${d}: ${m.type} with sections`);
  if (!x.mono) bad.push(`${d}: no code font`);
  if ((m.type === "page" || m.type === "section") && x.noScroll !== 320) bad.push(`${d}: no-scroll width ${x.noScroll}`);
  if (m.type === "page" && !bestFor(m.pattern, m.style)) bad.push(`${d}: no best-for phrase`);
  // rendered hex text must equal DESIGN.md exactly
  const t = parseDesignMd(md), html = specBlock({ tokens: t, extras: x, spec: s, pattern: m.pattern, style: m.style, isPage: m.type === "page", isSection: m.type !== "screen" && m.type !== "email", hasDarkImage: true, esc });
  if (!html.includes(FONT_NOTE)) bad.push(`${d}: no font licence note (a font missing from GOOGLE_FONTS?)`);
  for (const th of ["light", "dark"]) for (const r of ["background", "surface", "text", "muted", "primary", "accent"]) if (t[th][r] && !html.includes(`${r} <code>${t[th][r]}</code>`)) bad.push(`${d}: ${th} ${r} missing`);
  checks++;
}
assert.deepEqual(bad, []); ok(counts.page >= 700 && counts.screen > 1000, `counts ${JSON.stringify(counts)}`);
assert.deepEqual(parseDesignExtras(fs.readFileSync(`${LAW}/DESIGN.md`, "utf8")), { mono: "JetBrains Mono", noScroll: 320, maxWidth: 1200 }); checks++;
assert.deepEqual(parseDesignExtras("no front matter"), { mono: null, noScroll: null, maxWidth: null }); checks++;

// 3. phrase lint: full coverage, no orphans, no numbers / results claims / superlatives, plain length
const lines = [];
for (const p of PAGES) for (const st of STYLES) {
  const b = bestFor(p, st); ok(b, `no phrase for ${p} × ${st}`);
  for (const [lab, s] of [["Best for", b.best], ["Not ideal for", b.notIdeal]]) {
    const line = `${lab}: ${s[0].toUpperCase()}${s.slice(1)}.`; lines.push(line);
    ok(!BANNED.test(s), `banned word in "${s}"`); ok(line.length <= 140, `too long (${line.length}): ${line}`);
    ok(/^(a|an) /.test(s), `should start with a/an: ${s}`); ok(!/\s{2}|[.!?]$/.test(s), `spacing or end punctuation: ${s}`);
  }
}
for (const k of Object.keys(INDUSTRY_PHRASES)) ok(PAGES.includes(k), `orphan industry phrase ${k}`);
for (const k of Object.keys(STYLE_PHRASES)) ok(STYLES.includes(k), `orphan style phrase ${k}`);
for (const k of Object.keys(OVERRIDES)) { const [p, st] = k.split("|"); ok(PAGES.includes(p) && STYLES.includes(st), `orphan override ${k}`); }
for (const w of ["boost conversions", "rank higher", "the best", "3 sections", "50%", "proven", "more bookings", "seo-friendly"]) ok(BANNED.test(w), `lint misses "${w}"`);
for (const w of ["a calm, plain look", "a neighbourhood bakery", "an outpatient fertility clinic"]) ok(!BANNED.test(w), `lint too strict on "${w}"`);
assert.equal(new Set(lines).size > 400, true); checks++;

// 4. rendering: lines appear only when their data exists
const md = fs.readFileSync(`${LAW}/DESIGN.md`, "utf8"), tok = parseDesignMd(md), ext = parseDesignExtras(md);
const lab = (o) => specLines({ esc, hasDarkImage: true, pattern: "law-firm-website", style: "minimal", isPage: true, isSection: true, ...o }).map((l) => l[0]);
assert.deepEqual(lab({ tokens: tok, extras: ext, spec: law }), ["Colours (light)", "Colours (dark)", "Fonts", "Sections", "Light and dark", "Responsive", "Best for", "Not ideal for"]); checks++;
assert.deepEqual(lab({ tokens: tok, extras: ext, spec: null }), ["Colours (light)", "Colours (dark)", "Fonts", "Light and dark", "Responsive", "Best for", "Not ideal for"]); checks++; // no spec.json: no Sections
assert.deepEqual(lab({ tokens: null, extras: null, spec: null, hasDarkImage: false }), ["Best for", "Not ideal for"]); checks++;
assert.deepEqual(lab({ tokens: tok, extras: ext, spec: law, isPage: false, isSection: false, pattern: "dashboard" }), ["Colours (light)", "Colours (dark)", "Fonts", "Light and dark", "Responsive"]); checks++; // screen: breakpoints only if its HTML has them
assert.deepEqual(lab({ tokens: tok, extras: ext, spec: { v: 1, sections: [], breakpoints: [], darkMedia: true }, isPage: false, isSection: false, pattern: "dashboard" }), ["Colours (light)", "Colours (dark)", "Fonts", "Light and dark"]); checks++;
const L = Object.fromEntries(specLines({ tokens: tok, extras: ext, spec: law, esc, hasDarkImage: true, pattern: "law-firm-website", style: "minimal", isPage: true, isSection: true }));
assert.equal(L.Fonts, "Inter (headings and body), JetBrains Mono (code) · Google Fonts, under their own licences");
// 5. licence note: only when every font in the line is a Google Font; the list itself must be on Google Fonts
const gf = new Set(JSON.parse(fs.readFileSync("../mgd-kit/google_fonts_families.json", "utf8")).map((f) => f.family || f.name || f));
for (const n of GOOGLE_FONTS) ok(gf.has(n), `${n} is not on Google Fonts`);
const fontsOf = (t, x) => Object.fromEntries(specLines({ tokens: { light: {}, dark: {}, ...t }, extras: x, spec: null, esc, pattern: "dashboard", style: "minimal", isPage: false, isSection: false, hasDarkImage: false })).Fonts;
assert.equal(fontsOf({ heading: "Fraunces", body: "Inter" }, { mono: "JetBrains Mono" }), `Fraunces (headings), Inter (body), JetBrains Mono (code) · ${FONT_NOTE}`);
assert.equal(fontsOf({ heading: "Helvetica Neue", body: "Inter" }, { mono: "JetBrains Mono" }), "Helvetica Neue (headings), Inter (body), JetBrains Mono (code)"); // one non-Google font: no note
assert.equal(fontsOf({ heading: "Inter", body: "Inter" }, { mono: "SF Mono" }), "Inter (headings and body), SF Mono (code)");
assert.equal(fontsOf({ heading: null, body: "Inter" }, { mono: null }), `Inter (body) · ${FONT_NOTE}`); checks += 4;
assert.equal(L.Sections, "hero, practice areas, fees, our lawyers, insights, book a consultation, footer");
assert.equal(L["Light and dark"], "Both included; follows the system setting");
assert.equal(L.Responsive, "One HTML file, layout changes at 1024px, 960px and 760px; no horizontal scroll at 320px");
assert.equal(L["Best for"], "A family and small-business law firm that wants a calm, plain look with plenty of space.");
assert.equal(L["Not ideal for"], "A firm that wants a bold, image-led brand look."); checks += 6;
assert.equal(specBlock({ esc, tokens: null, extras: null, spec: null, pattern: "dashboard", style: "minimal", isPage: false, isSection: false, hasDarkImage: false }), ""); checks++;
const blk = specBlock({ esc, tokens: tok, extras: ext, spec: law, pattern: "law-firm-website", style: "minimal", isPage: true, isSection: true, hasDarkImage: true });
ok(/^<section class="spec" aria-labelledby="spec-h"><h2 id="spec-h">Spec<\/h2><dl>(<dt>[^<]+<\/dt><dd>.*?<\/dd>){8}<\/dl><\/section>$/.test(blk), "block shape");
ok(!/<script/i.test(blk), "no script"); ok(blk.length < 2048, `block weight ${blk.length} bytes`);
console.log(`${checks} checks, ${counts.page} pages, ${counts.section} sections, ${counts.screen} screens, ${counts.email} emails, ${lines.length} best-for lines. ok`);
