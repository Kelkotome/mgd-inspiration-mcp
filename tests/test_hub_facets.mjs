// Website-templates hub features (28-Nov-2026): colour + heading-font facets derived from the DESIGN.md tokens (palette/style columns), filter UX
// (counts, active chips, result count, live summary count), curated rows and the "Best <use case> website templates" collection pages.
// Unit checks need nothing; page checks render the real Worker against the local read-only D1 copy (tests/r3/.data/live.sqlite).
// Run: node --no-warnings --import=./tests/r3/register.mjs tests/test_hub_facets.mjs
import { readFileSync, existsSync } from "node:fs";
import { openDb, makeEnv, cacheShim, DATA } from "./r3/env.mjs";
const shim = cacheShim(); globalThis.caches = shim;
const { default: worker } = await import("../src/index.js");
const H = await import("../src/ui_hub.js"), U = await import("../src/ui_screens.js");
let ok = 0, fail = 0;
const t = (name, cond, info) => { cond ? ok++ : fail++; console.log((cond ? "ok   " : "FAIL ") + name + (cond || info == null ? "" : " | " + String(info).slice(0, 400))); };

// ---- derivation rules ----
t("hexToHsl: #ff0000 = 0°, 1, .5", (() => { const c = H.hexToHsl("#ff0000"); return c.h === 0 && c.s === 1 && c.l === 0.5; })());
t("hexToHsl: 3-digit and bad input", H.hexToHsl("#0f0").h === 120 && H.hexToHsl("nope") === null);
const fam = { "#d33a3a": "red", "#ea7a1f": "orange", "#e5bd1c": "yellow", "#3a9a48": "green", "#14968f": "teal", "#2f6fd6": "blue", "#7b4fd0": "purple", "#d6478f": "pink",
  "#9a793e": "brown", "#5a3a1a": "brown", "#111111": "black", "#777777": "black", "#fafafa": "white", "#b73642": "red", "#338440": "green" };
const famBad = Object.entries(fam).filter(([hx, f]) => H.hueFamily(hx) !== f).map(([hx, f]) => `${hx}→${H.hueFamily(hx)} (want ${f})`);
t("hueFamily: hue bands, brown & gold, achromatic", famBad.length === 0, famBad);
t("bgTone: neutral white, tinted pastel, cream is neither", H.bgTone("#ffffff") === "white" && H.bgTone("#f5f8fb") === "white" && H.bgTone("#fbeef6") === "pastel" && H.bgTone("#fff7ec") === null);
t("colourFamilies: primary, chromatic accent, bg tone; JSON string or array", H.colourFamilies('["#fff7ec","#ffffff","#e6d4be","#241705","#71604a","#b73642","#ffffff","#338440"]').join() === "red,green"
  && H.colourFamilies(["#ffffff", "#fafafa", "#e4e4e4", "#111111", "#666666", "#111111", "#ffffff", "#444444"]).join() === "black,white" && H.colourFamilies("[]").length === 0);
// fonts = ui-screens/lib.js STYLES hf/bf (the DESIGN.md typography tokens are built from them)
{ const lib = readFileSync(new URL("../ui-screens/lib.js", import.meta.url), "utf8"), got = {};
  for (const m of lib.matchAll(/^\s*([a-z]+): \{[^\n]*?hf: "([^"]+)", bf: "([^"]+)"/gm)) got[m[1]] = [m[2], m[3]];
  t(`STYLE_FONTS equals ui-screens/lib.js STYLES (${Object.keys(got).length} styles)`, JSON.stringify(got) === JSON.stringify(H.STYLE_FONTS) && U.UI_STYLES.every((s) => H.STYLE_FONTS[s]), JSON.stringify(got)); }
t("font pairing guide links are internal root paths", Object.values(H.FONT_GUIDES).every((u) => /^\/[a-z0-9-]+-font-pairings?\/$/.test(u)));
t("fontSlug", H.fontSlug("IBM Plex Sans") === "ibm-plex-sans" && H.fontSlug("Instrument Serif") === "instrument-serif");
t("diversePick is deterministic and caps groups", (() => { const L = Array.from({ length: 30 }, (_, i) => ({ id: "x" + i, g: "g" + (i % 3), variant: "v" + (i % 4), style: "s" + (i % 5) }));
  const a = H.diversePick(L, (x) => x.g, 10, 2), b = H.diversePick(L, (x) => x.g, 10, 2); return a.length === 6 && a.map((x) => x.id).join() === b.map((x) => x.id).join(); })());
t("collection slugs: 10, unique, *-website-templates", H.COLLECTIONS.length === 10 && new Set(H.COLLECTIONS.map((c) => c.slug)).size === 10 && H.COLLECTIONS.every((c) => /-website-templates$/.test(c.slug)));
t("collection H1 patterns a/b/c", H.collectionH1(H.COLLECTIONS[0], 24, "a") === "Best handyman website templates" && H.collectionH1(H.COLLECTIONS[0], 24, "b") === "Best website templates for a handyman business" && H.collectionH1(H.COLLECTIONS[0], 24, "c") === "24 free handyman website templates");

if (!existsSync(DATA)) { console.log(`(no local D1 copy at ${DATA}: page checks skipped)`); console.log(`${ok} passed, ${fail} failed`); process.exit(fail ? 1 : 0); }
const db = openDb(), E = makeEnv(db, { version: "hub-facets-1" });
const get = async (path) => { for (const k of [...shim.store.keys()]) if (!k.includes("/_cache/")) shim.store.delete(k); const r = await worker.fetch(new Request("https://madegooddesigns.com/inspiration" + path, { headers: { "User-Agent": "curl/8.4.0" } }), E.env, { waitUntil() {}, passThroughOnException() {} }); return { status: r.status, body: await r.text() }; };
const webRows = db.prepare("SELECT * FROM items WHERE collection='ui' AND status='published' AND owner_id IS NULL AND country='web'").all().filter((r) => U.UI_PAGE_PATTERNS.includes(r.category));

// ---- hub ----
const hub = await get("/ui/website-templates"), html = hub.body;
t("hub 200", hub.status === 200, hub.status);
t(`result count = desktop templates (${webRows.length}), not desktop + phone`, html.includes(`id="count" data-word="template" style="margin:0 0 .5rem">Showing ${webRows.length} templates</p>`), (html.match(/id="count"[^<]*/) || [])[0]);
t("summary shows the live count + an active-filter badge", html.includes(`<span id="fcount">${webRows.length} templates</span>`) && html.includes('id="fbadge" hidden'));
t("meta description and ItemList count the desktop templates", html.includes(`content="${webRows.length} free website templates across`) && html.includes(`"numberOfItems":${webRows.length}`));
const cards = [...html.matchAll(/<a class="card (web|mobile) page"[^>]*data-style="([a-z]+)" data-colour="([a-z ]*)" data-font="([a-z0-9-]+)">/g)];
t(`every template card carries colour + font (${cards.length})`, cards.length === webRows.length * 2 && cards.every((m) => m[3].length && H.fontSlug(H.STYLE_FONTS[m[2]][0]) === m[4]), cards.length);
t("phone cards hidden without JS (desktop is the default)", html.includes('<div class="grid hubg" id="grid">') && html.includes("#grid.hubg .card.mobile{display:none}"));
// colour counts = derivation over the desktop rows
const want = {}; for (const r of webRows) for (const f of H.colourFamilies(r.palette)) want[f] = (want[f] || 0) + 1;
const wantShown = Object.fromEntries(Object.entries(want).filter(([, n]) => n >= H.COLOUR_MIN));
const got = Object.fromEntries([...html.matchAll(/data-f="colour" data-v="([a-z]+)"[^>]*><i [^>]*><\/i>[^<]*<span class="n">(\d+)<\/span>/g)].map((m) => [m[1], +m[2]]));
t(`colour swatch counts match the derivation (${Object.keys(got).length} families shown, ≥ ${H.COLOUR_MIN} each)`, JSON.stringify(Object.entries(wantShown).sort()) === JSON.stringify(Object.entries(got).sort()), JSON.stringify({ want, got }));
const wantF = {}; for (const r of webRows) { const f = H.STYLE_FONTS[r.style][0]; wantF[H.fontSlug(f)] = (wantF[H.fontSlug(f)] || 0) + 1; }
const gotF = Object.fromEntries([...html.matchAll(/data-f="font" data-v="([a-z0-9-]+)"[^>]*>[^<]*<span class="n">(\d+)<\/span>/g)].map((m) => [m[1], +m[2]]));
t(`heading-font chip counts match (${Object.keys(gotF).length} fonts)`, JSON.stringify(Object.entries(wantF).sort()) === JSON.stringify(Object.entries(gotF).sort()), JSON.stringify({ wantF, gotF }));
const fhrefs = [...html.matchAll(/class="chip(?: sw)?" data-f="(colour|font|style|platform)" data-v="([^"]*)" href="([^"]+)"/g)].map((m) => [m[1], m[2], m[3].replace(/&amp;/g, "&")]);
const RESERVED = /[?&](name|p|page|s|m|w|cat|tag|author|year|order|orderby|type|feed|preview|title|term|taxonomy|paged|post_type|attachment)=/;
const badHref = fhrefs.filter(([k, v, u]) => RESERVED.test(u) || /[<>"'(){}]/.test(u) || (v && k !== "platform" && !u.includes(`${k === "platform" ? "device" : k}=${v}`)) || !u.startsWith("/inspiration/ui/website-templates"));
t(`filter chip hrefs: ?device/style/colour/font with slug values, never WP-reserved (${fhrefs.length})`, fhrefs.length > 30 && badHref.length === 0, JSON.stringify(badHref.slice(0, 3)));
t("filter chips with a query are rel=nofollow", [...html.matchAll(/<a class="chip(?: sw)?" data-f="(?:colour|font)" data-v="[a-z0-9-]+" href="[^"]+\?[^"]*" ([^>]*)>/g)].every((m) => m[1].startsWith('rel="nofollow"')));
t("font pairing guides linked internally", [...html.matchAll(/<p class="fguide">(.*?)<\/p>/g)].length === 1 && Object.entries(H.FONT_GUIDES).filter(([f]) => wantF[H.fontSlug(f)]).every(([, u]) => html.includes(`href="${u}"`)));
t("active-filter bar + Clear all logic + fold opener in the hub script", html.includes('<div class="active" id="active" hidden></div>') && html.includes("Clear all") && html.includes('document.querySelector(".filters .ffold")') && html.includes("fd.open=true"));
// curated rows
const rows = [...html.matchAll(/<section class="crow" aria-label="([^"]+)">(.*?)<\/section>/g)];
t(`curated rows: ${rows.map((r) => r[1]).join(", ")}`, rows.length === 4 && rows.every((r) => (r[2].match(/class="rc"/g) || []).length >= 4));
t("curated rows link only to template pages", rows.every((r) => [...r[2].matchAll(/href="([^"]+)"/g)].every((m) => m[1].startsWith("/inspiration/ui/"))));
t("dark row shows dark screenshots", /aria-label="Dark mode picks">.*?-dark\.webp/.test(html));
const hub2 = await get("/ui/website-templates");
t("hub is deterministic (two renders identical)", hub2.body === html);
const strip = (html.match(/<nav class="cstrip"[^>]*>(.*?)<\/nav>/) || [])[1] || "";
t("collections strip links every collection", H.COLLECTIONS.every((c) => strip.includes(`href="/inspiration/ui/${c.slug}"`)));

// ---- collections ----
const titles = new Set(), canons = new Set(), h1s = new Set(), dist = [];
for (const c of H.COLLECTIONS) {
  const r = await get(`/ui/${c.slug}`), b = r.body;
  if (r.status !== 200) { t(`${c.slug} renders`, false, r.status); continue; }
  const n = (b.match(/<a class="card page"/g) || []).length, title = (b.match(/<title>([^<]+)/) || [])[1], canon = (b.match(/<link rel="canonical" href="([^"]+)"/) || [])[1], h1 = (b.match(/<h1>([^<]+)/) || [])[1], desc = (b.match(/<meta name="description" content="([^"]+)"/) || [])[1] || "";
  titles.add(title); canons.add(canon); h1s.add(h1); dist.push(`${c.slug}:${n}`);
  const faq = (b.match(/"@type":"Question"/g) || []).length, hrefs = [...b.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
  const outbound = hrefs.filter((u) => /^https?:/.test(u) && !u.startsWith("https://madegooddesigns.com/"));
  t(`${c.slug}: ${n} templates, self-canonical, title ≤ 60, desc ≤ 155, FAQ ${faq}`, n >= H.COLLECTION_MIN && n <= H.COLLECTION_MAX && canon === `https://madegooddesigns.com/inspiration/ui/${c.slug}` && title.length <= 60 && desc.length > 60 && desc.length <= 155 && faq >= 3 && faq <= 6, { n, title, canon, dl: desc.length });
  t(`${c.slug}: links sub-niche, category and hub pages; no outbound links`, hrefs.some((u) => /^\/inspiration\/ui\/[a-z-]+-website-templates\/[a-z-]+$/.test(u)) && hrefs.includes("/inspiration/ui/website-templates") && outbound.length === 0, outbound.join(" "));
  t(`${c.slug}: BreadcrumbList + CollectionPage ItemList of ${n}`, b.includes('"@type":"BreadcrumbList"') && b.includes(`"numberOfItems":${n}`));
  t(`${c.slug}: H1 has no brand names`, !/wix|squarespace|shopify|wordpress|webflow|framer|canva/i.test(h1));
}
t("collection titles, canonicals and H1s are unique", titles.size === H.COLLECTIONS.length && canons.size === H.COLLECTIONS.length && h1s.size === H.COLLECTIONS.length);
console.log("  picks: " + dist.join(" "));
const sm = await get("/ui/sitemap.xml");
t("sitemap lists every live collection", H.COLLECTIONS.every((c) => sm.body.includes(`<loc>https://madegooddesigns.com/inspiration/ui/${c.slug}</loc>`)));
t("unknown *-website-templates slug is not a collection page", (await get("/ui/zzz-website-templates")).status === 404);
t("other UI pages keep FILTER_JS (no hub script)", !(await get("/ui/website-sections")).body.includes('id="fcount"'));
console.log("  colour distribution (desktop templates): " + JSON.stringify(want));
console.log("  heading fonts: " + JSON.stringify(wantF));
console.log(`${ok} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
