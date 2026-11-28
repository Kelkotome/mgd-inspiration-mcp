// Website-template detail pages: live preview + device toggle and "Try it with" re-theming (owner, 28-Nov-2026; src/ui_retheme.js).
// Unit checks on the re-theming core against two real templates (tests/fixtures_retheme: a web page and a mobile one with the extra
// ":root[...] .side" blocks), WCAG AA of every palette, the font pairs against font_pairings.json, and the rendered detail page from the
// real Worker on an in-memory D1 (no local D1 copy needed).
// Optional coverage sweep: RT_SAMPLE=<dir of <id>.html + <id>.md> also re-themes every template in that folder and prints coverage.
// Run: node --no-warnings --import=./tests/r3/register.mjs tests/test_tpl_retheme.mjs
import { DatabaseSync } from "node:sqlite";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { makeEnv, cacheShim } from "./r3/env.mjs";
globalThis.caches = cacheShim();
const { default: worker } = await import("../src/index.js");
const M = await import("../src/ui_retheme.js"), K = await import("../src/ui_kit.js"), L = await import("../src/designmd_lint.js"), G = await import("../src/gf_meta.js");
const FP = JSON.parse(readFileSync(new URL("../src/font_pairings.json", import.meta.url)));
let ok = 0, fail = 0;
const t = (name, cond, info) => { cond ? ok++ : fail++; console.log((cond ? "ok   " : "FAIL ") + name + (cond || info == null ? "" : " | " + String(info).slice(0, 400))); };
const RT = M.RT, FX = new URL("./fixtures_retheme/", import.meta.url).pathname;
const fx = (id, k) => readFileSync(FX + id + "." + k, "utf8");

// ---- palettes: WCAG AA (body text 4.5:1 on background AND surface, muted too; labels on fills 4.5:1; primary/accent 3:1)
const NEED = [["text", "background", 4.5], ["text", "surface", 4.5], ["muted", "background", 4.5], ["muted", "surface", 4.5], ["on-primary", "primary", 4.5],
  ["primary", "background", 3], ["accent", "surface", 3], ["on-accent", "accent", 4.5]];
t(`${M.RT_PALETTES.length} palettes (6-10), unique ids and names`, M.RT_PALETTES.length >= 6 && M.RT_PALETTES.length <= 10 && new Set(M.RT_PALETTES.map((p) => p.id)).size === M.RT_PALETTES.length && new Set(M.RT_PALETTES.map((p) => p.name)).size === M.RT_PALETTES.length);
{ const bad = [];
  for (const p of M.RT_PALETTES) for (const mode of ["light", "dark"]) {
    if (RT.ROLES.some((r) => !/^#[0-9a-f]{6}$/.test(p[mode][r] || ""))) bad.push(`${p.id}/${mode}: missing role`);
    for (const [a, b, n] of NEED) { const r = RT.ratio(p[mode][a], p[mode][b]); if (r < n) bad.push(`${p.id}/${mode} ${a} on ${b} ${r.toFixed(2)} < ${n}`); }
  }
  t("every palette passes WCAG AA in light and dark (8 pairs each)", bad.length === 0, bad.join("; ")); }
t("contrast function matches the generator's table (#131A23 on #F5F8FD = 16.44:1, #FFFFFF on #0766C4 = 5.67:1)", RT.ratio("#131a23", "#f5f8fd").toFixed(2) === "16.44" && RT.ratio("#ffffff", "#0766c4").toFixed(2) === "5.67", [RT.ratio("#131a23", "#f5f8fd"), RT.ratio("#ffffff", "#0766c4")]);

// ---- font pairs: 3-5, each one of our pairings with both faces on Google Fonts
const gf = new Set(G.GF_META.split("\n").map((l) => l.split("|")[0]));
t(`${M.RT_FONTS.length} font pairings (3-5)`, M.RT_FONTS.length >= 3 && M.RT_FONTS.length <= 5);
for (const f of M.RT_FONTS) {
  const inData = Object.values(FP).some((e) => (e.pairs || []).some((p) => p.heading === f.heading && p.body === f.body && p.heading_gf && p.body_gf));
  t(`pairing ${f.heading} + ${f.body}: in font_pairings.json (both Google Fonts) and in GF_META`, inData && gf.has(f.heading) && gf.has(f.body));
  t(`pairing ${f.heading} + ${f.body}: css2 query names both families`, f.q.includes("family=" + f.heading.replace(/ /g, "+") + ":") && f.q.includes("family=" + f.body.replace(/ /g, "+") + ":"));
}

// ---- core on real templates
const vars = (css) => Object.fromEntries([...css.matchAll(/--([a-z0-9-]+):([^;}]+)/g)].map((m) => [m[1], m[2].trim()]));
const blocks = (html) => { const css = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join("\n"); return [...css.matchAll(/(:root[^{]*)\{([^}]*)\}/g)].map((m) => [m[1].trim(), m[2]]); };
const NAMES = { bg: "background", surface: "surface", border: "border", text: "text", muted: "muted", primary: "primary", "on-primary": "on-primary", accent: "accent" };
for (const id of ["610fc366b158", "8243e08bec9a"]) {
  const html = fx(id, "html"), md = fx(id, "md"), tok = K.parseDesignMd(md);
  // the premise: the template's theme variables equal the DESIGN.md roles (light block 0, dark block 2), --ink/--on-ink = text/bg inverted in dark
  const b0 = blocks(html), L0 = vars(b0[0][1]), D0 = vars(b0[2][1]);
  t(`${id}: template vars = DESIGN.md roles (light + dark)`, Object.entries(NAMES).every(([v, r]) => L0[v] === tok.light[r] && D0[v] === tok.dark[r]) && L0.ink === tok.light.text && L0["on-ink"] === tok.light.background && D0.ink === tok.dark.background && D0["on-ink"] === tok.dark.text);
  t(`${id}: no variant = unchanged`, RT.rewriteHtml(html, { pal: null, font: null }) === html && RT.rewriteMd(md, { pal: null, font: null }) === md);
  M.RT_PALETTES.forEach((P, pi) => {
    const F = M.RT_FONTS[pi % M.RT_FONTS.length], V = { pal: P, font: F };
    const h2 = RT.rewriteHtml(html, V), b = blocks(h2), Lv = vars(b[0][1]), Dm = vars(b[1][1]), Dv = vars(b[2][1]);
    const okL = Object.entries(NAMES).every(([v, r]) => Lv[v] === P.light[r]) && Lv.ink === P.light.text && Lv["on-ink"] === P.light.background;
    const okD = [Dm, Dv].every((D) => Object.entries(NAMES).every(([v, r]) => D[v] === P.dark[r]) && D.ink === P.dark.background && D["on-ink"] === P.dark.text);
    const keep = ["danger", "on-danger", "success", "warning", "radius", "shadow", "hw", "ls"].every((k) => Lv[k] === L0[k]) && b.slice(3).every((x, i) => x[1] === b0[3 + i][1]);
    const fonts = Lv["font-h"] === `"${F.heading}",${F.h.replace(/, /g, ",")}` && Lv["font-b"] === `"${F.body}",${F.b.replace(/, /g, ",")}`;
    const link = h2.includes(`href="https://fonts.googleapis.com/css2?${F.q.replace(/&/g, "&amp;")}&amp;display=swap"`) && (h2.match(/fonts\.googleapis\.com\/css2/g) || []).length === 1;
    const sameLen = h2.split("\n").length === html.split("\n").length && h2.replace(/<!-- Variant:[^>]*-->/, "").length - html.length < 400;
    if (pi < 3 || !(okL && okD && keep && fonts && link && sameLen)) t(`${id} html ${P.id} + ${F.id}: light ${okL}, dark (media + data-theme) ${okD}, other vars/blocks kept ${keep}, fonts ${fonts}, one fonts link ${link}, lines kept ${sameLen}`, okL && okD && keep && fonts && link && sameLen);
    const m2 = RT.rewriteMd(md, V), t2 = K.parseDesignMd(m2);
    const fm = RT.ROLES.every((r) => !tok.light[r] || (t2.light[r] === P.light[r] && t2.dark[r] === P.dark[r])) && t2.heading === F.heading && t2.body === F.body;
    const codeKept = /code:\n {4}fontFamily: "JetBrains Mono"/.test(m2) === /code:\n {4}fontFamily: "JetBrains Mono"/.test(md);
    const rows = [...m2.matchAll(/^\| ([^|]+?) \| (#[0-9A-F]{6}) on (#[0-9A-F]{6}) \| ([0-9.]+):1 \| ([0-9.]+):1 \| (Pass|Fail) \|$/gm)];
    const rowsOk = rows.length === [...md.matchAll(/^\| [^|]+? \| #[0-9A-Fa-f]{6} on #[0-9A-Fa-f]{6} \|/gm)].length && rows.every((r) => Math.abs(+r[4] - RT.ratio(r[2], r[3])) < 0.011 && (r[6] === "Pass") === (RT.ratio(r[2], r[3]) >= +r[5]));
    const table = m2.includes(`| \`primary\` (\`--color-primary\`) |`) && m2.includes("`" + P.light.primary.toUpperCase() + "` | `" + P.dark.primary.toUpperCase() + "` |");
    const css = m2.includes(`  --color-primary: ${P.light.primary};`) && m2.includes(`    --color-primary: ${P.dark.primary};`) && m2.includes(`  --font-heading: "${F.heading}", ${F.h};`);
    const prose = m2.includes(`- **Headings:** ${F.heading}`) && m2.includes(`- **Body:** ${F.body}`);
    const oldLeft = [tok.light.primary, tok.dark.primary, tok.light.background].filter((hx) => !Object.values(P.light).concat(Object.values(P.dark)).includes(hx)).filter((hx) => m2.toLowerCase().includes(hx));
    const e0 = L.lint(md).findings.filter((f) => f.severity === "error").length, e2 = L.lint(m2).findings.filter((f) => f.severity === "error").length;
    const good = fm && codeKept && rowsOk && table && css && prose && oldLeft.length === 0 && e2 <= e0;
    if (pi < 3 || !good) t(`${id} md ${P.id} + ${F.id}: front matter ${fm}, code font kept ${codeKept}, contrast rows recomputed ${rowsOk} (${rows.length}), colour table ${table}, css block ${css}, prose ${prose}, old hex left ${oldLeft.join(",") || "none"}, lint errors ${e0}->${e2}`, good);
  });
  // fonts only / palette only
  const fo = RT.rewriteHtml(html, { pal: null, font: M.RT_FONTS[2] }), po = RT.rewriteHtml(html, { pal: M.RT_PALETTES[4], font: null });
  t(`${id}: fonts-only keeps colours, palette-only keeps fonts + link`, vars(blocks(fo)[0][1]).bg === L0.bg && vars(blocks(po)[0][1])["font-h"] === L0["font-h"] && po.includes(html.match(/<link href="https:\/\/fonts\.googleapis\.com\/css2[^"]*"/)[0]));
  // kit panel strings: the inlined copies equal ui_kit.js, for the original and a variant
  const tv = RT.tokens(tok, { pal: M.RT_PALETTES[6], font: M.RT_FONTS[3] });
  t(`${id}: kitCss/kitTw === ui_kit cssVariables/tailwindColours (original + variant)`, RT.kitCss(tok) === K.cssVariables(tok) && RT.kitTw(tok) === K.tailwindColours(tok) && RT.kitCss(tv) === K.cssVariables(tv) && RT.kitTw(tv) === K.tailwindColours(tv) && tv.light.primary === M.RT_PALETTES[6].light.primary && tv.heading === M.RT_FONTS[3].heading);
}
{ const V = { pal: M.RT_PALETTES[0], font: M.RT_FONTS[0] }, o = RT.overrideCss(V);
  t("overrideCss: same three theme selectors, every role var, fonts in the light block only", /^:root\{[^}]*--bg:#[0-9a-f]{6};[^}]*--on-ink:[^}]*--font-h:"Playfair Display"[^}]*\}@media \(prefers-color-scheme:dark\)\{:root:not\(\[data-theme="light"\]\)\{[^}]*\}\}:root\[data-theme="dark"\]\{[^}]*\}$/.test(o) && (o.match(/--font-h/g) || []).length === 1, o.slice(0, 300));
  t("overrideCss: fonts only = one :root block", RT.overrideCss({ pal: null, font: M.RT_FONTS[1] }) === `:root{--font-h:"Poppins",system-ui,sans-serif;--font-b:"Inter",system-ui,sans-serif}`, RT.overrideCss({ pal: null, font: M.RT_FONTS[1] })); }
t("RT_CORE is self-contained (stringified copy behaves the same)", (() => { const C = new Function("return (" + M.RT_CORE.toString() + ")()")(); const V = { pal: M.RT_PALETTES[3], font: M.RT_FONTS[4] }, h = fx("610fc366b158", "html"), m = fx("610fc366b158", "md"); return C.rewriteHtml(h, V) === RT.rewriteHtml(h, V) && C.rewriteMd(m, V) === RT.rewriteMd(m, V); })());
t("page script parses", (() => { try { new Function(M.rtPageJs({ tokens: K.parseDesignMd(fx("610fc366b158", "md")) }).replace(/^<script>|<\/script>$/g, "")); return true; } catch (e) { return false; } })());

// ---- rendered detail pages (real Worker, in-memory D1, R2 shim serving the fixtures)
const db = new DatabaseSync(":memory:");
db.exec(`CREATE TABLE items (id TEXT PRIMARY KEY, title TEXT, description TEXT, source_url TEXT, source_host TEXT, image_key TEXT NOT NULL, width INTEGER, height INTEGER,
  tags TEXT DEFAULT '[]', themes TEXT DEFAULT '[]', palette TEXT DEFAULT '[]', style TEXT, status TEXT NOT NULL DEFAULT 'published', created_at INTEGER NOT NULL,
  owner_id TEXT, collection TEXT DEFAULT 'design', company TEXT, report_year INTEGER, designer TEXT, industry TEXT, country TEXT, hue REAL, category TEXT, image_url TEXT,
  photographer_url TEXT, featured_on TEXT, unsplash_id TEXT, daily_query TEXT, featured_rank INTEGER, rights TEXT, rights_holder TEXT, hosting TEXT);`);
const ins = db.prepare("INSERT INTO items (id,title,image_key,width,height,style,created_at,collection,country,category,tags) VALUES (?,?,?,?,?,?,?,?,?,?,?)");
ins.run("610fc366b158", "Restaurant", "ui/610fc366b158-mw6ajice.webp", 1440, 6000, "minimal", 1, "ui", "web", "restaurant-website", '["variant:homepage"]');
ins.run("8243e08bec9a", "Wedding invite", "ui/8243e08bec9a-k.webp", 390, 3000, "luxury", 1, "ui", "mobile", "wedding-invitation-website", "[]");
ins.run("00000000000a", "No tokens", "ui/00000000000a-k.webp", 1440, 4000, "minimal", 1, "ui", "web", "bakery-website", "[]");
ins.run("00000000000b", "Login", "ui/00000000000b-k.webp", 1440, 900, "minimal", 1, "ui", "web", "login", "[]");
const E = makeEnv(db, { version: "retheme-1" });
E.env.BUCKET.get = async (key) => { const m = String(key).match(/^ui\/([0-9a-f]{12})\/(index\.html|DESIGN\.md)$/); if (!m) return null;
  const f = FX + m[1] + (m[2] === "index.html" ? ".html" : ".md"); const body = existsSync(f) ? readFileSync(f, "utf8") : m[2] === "index.html" ? "<!doctype html><html><head></head><body>x</body></html>" : null;
  return body == null ? null : { text: async () => body, arrayBuffer: async () => new TextEncoder().encode(body).buffer }; };
const get = async (path) => { const r = await worker.fetch(new Request("https://madegooddesigns.com/inspiration" + path, { headers: { "User-Agent": "curl/8.4.0" } }), E.env, { waitUntil() {}, passThroughOnException() {} }); return { status: r.status, body: await r.text() }; };
const B = "/inspiration";
{ const { status, body } = await get("/ui/restaurant-website-homepage-web-minimal-610fc366b158");
  t("web template page renders 200", status === 200, status);
  const left = body.slice(body.indexOf('<div class="detail'), body.indexOf("<h1>"));
  t("screenshot <img> stays in the HTML (src, alt, width/height, fetchpriority) inside the stage", /<div class="pvstage" data-pv="\/inspiration\/ui\/raw\/610fc366b158\.html" data-dev="desktop" data-title="Live preview: [^"]+"><div class="shotscroll"><img class="shot" fetchpriority="high" width="1440" height="6000" src="\/inspiration\/img\/ui\/610fc366b158-mw6ajice\.webp"[^>]* alt="[^"]+"\/><\/div><\/div>/.test(left), left.slice(0, 600));
  t("no iframe in the server HTML (created by JS near the viewport)", !/<iframe/i.test(body));
  t("device toggle: Desktop/Tablet/Phone = 1280/768/390, Desktop pressed; Pop out = the live HTML in a new tab", /data-pv-dev="desktop" data-w="1280" aria-pressed="true">Desktop<\/button><button type="button" class="chip" data-pv-dev="tablet" data-w="768" aria-pressed="false">Tablet<\/button><button type="button" class="chip" data-pv-dev="phone" data-w="390" aria-pressed="false">Phone<\/button>/.test(left) && left.includes(`<a class="pop" href="${B}/ui/raw/610fc366b158.html" target="_blank" rel="noopener nofollow">`));
  t("save button moved into the toolbar (not over the preview)", /<div class="pvbar">[\s\S]*<button class="card__save" data-id="610fc366b158"[^>]*>[^<]*<\/button><\/div><div class="pvstage"/.test(left));
  t("noscript hides the JS-only parts", left.includes("<noscript><style>.pvdev,.rt{display:none!important}</style></noscript>"));
  const panel = body.slice(body.indexOf('<details class="rt"'), body.indexOf("</details>", body.indexOf('<details class="rt"')) + 10);
  t(`"${M.RT_COPY.title}" panel: title, helper, Original + ${M.RT_PALETTES.length} palettes, Original + ${M.RT_FONTS.length} font pairs, reset, live status`, M.RT_COPY.title === "Make it yours" && panel.includes(`<h2 id="rt-h">${M.RT_COPY.title}<span class="rta" aria-hidden="true">▸</span></h2>`) && panel.includes(M.RT_COPY.helper.replace(/&/g, "&amp;")) && (panel.match(/data-rt-pal="/g) || []).length === M.RT_PALETTES.length + 1 && (panel.match(/data-rt-font="/g) || []).length === M.RT_FONTS.length + 1 && panel.includes("data-rt-reset") && panel.includes('aria-live="polite"'));
  t("panel is a <details> closed in the HTML (phones), opened before paint above 720px by the script right after it", /^<details class="rt" data-nosnippet><summary class="rth">/.test(panel) && body.includes('</details><script>(function(d){if(matchMedia("(min-width:721px)").matches)d.open=true})(document.currentScript.previousElementSibling)</script>'));
  t("phone CSS: arrow + pointer only at ≤720px; reset hidden while folded", body.includes("@media(max-width:720px){.rt .rth{cursor:pointer}") && body.includes(".rt:not([open]) [data-rt-reset]{display:none}"));
  t("panel sits under the preview in the left column, before the H1", body.indexOf('<details class="rt"') > body.indexOf('class="pvstage"') && body.indexOf('<details class="rt"') < body.indexOf("<h1>"));
  t("Copy HTML / Copy DESIGN.md / Download DESIGN.md carry data-rt (originals stay the no-JS target)", body.includes(`<button class="btn" data-copy="${B}/ui/raw/610fc366b158.html" data-rt="html">Copy HTML</button>`) && body.includes(`<button class="btn" data-copy="${B}/ui/raw/610fc366b158.md" data-rt="md">Copy DESIGN.md</button>`) && body.includes(`<a class="btn" href="${B}/ui/raw/610fc366b158.md" download="DESIGN.md" rel="nofollow" data-rt="md">`));
  const js = (body.match(/<script>\(function\(\)\{var RT=[\s\S]*?<\/script>/) || [""])[0];
  t("page script: sandbox allow-same-origin only (never allow-scripts), lazy, no-referrer, IntersectionObserver, hash not query", js.includes('setAttribute("sandbox","allow-same-origin")') && !js.includes("allow-scripts") && js.includes('"loading","lazy"') && js.includes("IntersectionObserver") && js.includes("location.hash") && !js.includes("location.search+(on?\"?"));
  t("page script embeds this template's tokens and the copy text, updates the Spec block, keeps the panel open when wide", js.includes('"primary":"#0766c4"') && js.includes(JSON.stringify(M.RT_COPY.status)) && js.includes("specSet(on?RT.tokens(T,V):null)") && js.includes("/^Colours [(](light|dark)[)]$/") && js.includes('matchMedia("(min-width:721px)")'));
  t("Spec block has the colour swatches the script rewrites", /<dt>Colours \(light\)<\/dt><dd><span class="sc"><i style="background:#[0-9a-f]{6}" aria-hidden="true"><\/i>background <code>#[0-9a-f]{6}<\/code>/.test(body));
  t("no new outbound links (hrefs off-site) on the page beyond the existing AI/fonts ones", ![...body.matchAll(/href="(https?:[^"]+)"/g)].map((m) => m[1]).some((u) => !/^https:\/\/(madegooddesigns\.com|claude\.ai|chatgpt\.com|gemini\.google\.com|www\.perplexity\.ai|copilot\.microsoft\.com|grok\.com|chat\.mistral\.ai|chat\.deepseek\.com|fonts\.googleapis\.com|www\.googletagmanager\.com)/.test(u)));
  const kb = Buffer.byteLength(js) / 1024; t(`page script weight ${kb.toFixed(1)} KB (< 26 KB raw)`, kb < 26, kb); }
{ const { body } = await get("/ui/t-8243e08bec9a");
  t("mobile template: preview defaults to Phone", body.includes('data-dev="phone"') && /data-pv-dev="phone" data-w="390" aria-pressed="true"/.test(body)); }
{ const { status, body } = await get("/ui/t-00000000000a");
  t("template without DESIGN.md: preview, no panel, no data-rt panel script tokens", status === 200 && body.includes('class="pvstage"') && !body.includes('<details class="rt"') && body.includes("T=null")); }
{ const { body } = await get("/ui/t-00000000000b");
  t("non-template screen (login): unchanged layout (no preview/panel/data-rt)", !body.includes("pvstage") && !body.includes('<details class="rt"') && !body.includes("data-rt=") && /<div style="position:relative"><button class="card__save"/.test(body)); }
{ const r = await get("/ui/raw/610fc366b158.html"); t("live HTML route unchanged (noscript, 200)", r.status === 200 && r.body.includes("<style>:root{")); }

// ---- optional coverage sweep over a folder of downloaded templates
if (process.env.RT_SAMPLE) {
  const dir = process.env.RT_SAMPLE.replace(/\/$/, "") + "/", ids = readdirSync(dir).filter((f) => f.endsWith(".html")).map((f) => f.slice(0, 12)).filter((id) => existsSync(dir + id + ".md"));
  let clean = 0, art = 0, inlineSw = 0, scripts = 0; const bad = [];
  for (const id of ids) {
    const html = readFileSync(dir + id + ".html", "utf8"), md = readFileSync(dir + id + ".md", "utf8"), tok = K.parseDesignMd(md), b0 = blocks(html);
    if (/<script/i.test(html)) scripts++;
    const L0 = vars(b0[0][1]), D0 = vars((b0[2] || ["", ""])[1]);
    const match = tok && Object.entries(NAMES).every(([v, r]) => L0[v] === tok.light[r] && D0[v] === tok.dark[r]);
    const css = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join("\n");
    const allowed = new Set(b0.slice(0, 3).flatMap((b) => b[1].match(/#[0-9a-fA-F]{3,8}\b/g) || []));
    const hard = (css.match(/#[0-9a-fA-F]{3,8}\b/g) || []).filter((h) => !allowed.has(h)).length + (css.replace(/:root[^{]*\{[^}]*\}/g, "").match(/(?:rgb|hsl|oklch)a?\([^)]*\)/g) || []).filter((c) => !/rgb\(0 0 0 \//.test(c)).length;
    const V = { pal: M.RT_PALETTES[ids.indexOf(id) % 10], font: M.RT_FONTS[ids.indexOf(id) % 5] }, h2 = RT.rewriteHtml(html, V), Lv = vars(blocks(h2)[0][1]);
    const swapped = Object.entries(NAMES).every(([v, r]) => Lv[v] === V.pal.light[r]) && Lv["font-h"].startsWith(`"${V.font.heading}"`);
    if (match && hard === 0 && swapped) clean++; else bad.push(`${id}:${match ? "" : "vars≠md "}${hard ? hard + " hard-coded " : ""}${swapped ? "" : "not swapped"}`);
    if (/(fill|stop-color)="#[0-9a-fA-F]{3,8}"/.test(html)) art++;
    if (/style="[^"]*#[0-9a-fA-F]{3,8}/.test(html)) inlineSw++;
  }
  console.log(`coverage: ${clean}/${ids.length} re-theme cleanly (all UI colour roles + fonts are variables equal to DESIGN.md, no hard-coded colours in CSS); ${art} have fixed-colour SVG illustrations (artwork, like photos); ${inlineSw} have inline-style colour content; ${scripts} contain <script>`);
  if (bad.length) console.log("  not clean: " + bad.join(" | "));
  t(`coverage sweep: ${ids.length} templates, none with <script>`, scripts === 0);
}
console.log(`${ok} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
