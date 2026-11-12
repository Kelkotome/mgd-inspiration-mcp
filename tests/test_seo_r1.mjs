// SEO r1 (12-Nov-2026): runs the Worker's fetch() in Node on the local copy of live D1 (tests/r3/.data/live.sqlite, see mcp-r3.md),
// next to the base tree (tests/seo1/.base/src = git archive d374ad8 src, the live Worker 3c1d58fb), and checks:
//   A  HEAD = GET minus the body (status + every header) on every route kind; the base answered 404 to HEAD
//   B  head tags: twitter:card on every indexable page (large image when there is an og:image), og:title / og:description / og:url /
//      og:image on the museum + annual-report listings, every ld+json block parses, BreadcrumbList = the visible crumb
//   C  nothing else changed: new page minus the og/twitter tags, the breadcrumb block and <img> width/height == base page minus the same
//   D  <img> of museum / annual / UI rows carry width + height (all such rows have them in D1)
//   E  sitemaps: no duplicate <loc>; every annual-report + museum item URL is the canonical its page prints (all items rendered)
//   F  D1: every page and sitemap runs the same SQL statements as the base (no new query)
// Run: node --no-warnings --import=./tests/r3/register.mjs tests/test_seo_r1.mjs   (prints "N passed, M failed"; SEO1_FULL=0 samples E)
import { openDb, makeEnv, cacheShim } from "./r3/env.mjs";
import { existsSync } from "node:fs";
const BASE = new URL("./seo1/.base/src/index.js", import.meta.url);
if (!existsSync(BASE)) { console.log("no base tree: mkdir -p tests/seo1/.base && git archive d374ad8 src | tar -x -C tests/seo1/.base"); process.exit(2); }
const shim = cacheShim(); globalThis.caches = shim;
const { default: NEW } = await import("../src/index.js");
const { default: OLD } = await import(BASE.href);
const db = openDb();
const E = makeEnv(db, { version: "seo1" });
let ok = 0, fail = 0;
const t = (name, cond, info) => { cond ? ok++ : fail++; if (!cond || process.env.VERBOSE) console.log((cond ? "PASS " : "FAIL ") + name + (cond ? "" : " | " + String(info).slice(0, 400))); };
const clearPages = () => shim.store.clear();   // pages and the shared-data cache: base and new each fill their own module memory once
const SITE = "https://madegooddesigns.com", B = "/inspiration";
async function req(w, path, method = "GET") {
  clearPages();
  const s0 = E.dbStats.sql.length;
  const r = await w.fetch(new Request(SITE + B + path, { method, headers: { "User-Agent": "seo1-test", Accept: "*/*" } }), E.env, { waitUntil() {}, passThroughOnException() {} });
  const body = await r.text();
  // the one intended SQL change: the annual sitemap also reads `collection` (so rowToItem builds the canonical company-year-id path)
  return { status: r.status, headers: [...r.headers.entries()].sort().map((x) => x.join(": ")).join("\n"), body, sql: E.dbStats.sql.slice(s0).map((q) => q.replace("image_key,collection FROM", "image_key FROM").slice(0, 140)) };
}
const locs = (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(/&amp;/g, "&"));
const rel = (u) => u.replace(SITE + B, "");
let seed = 1112; const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);
const pick = (a, n) => a.map((x) => [rnd(), x]).sort((p, q) => p[0] - q[0]).slice(0, n).map((x) => x[1]);
const dupes = (a) => a.length - new Set(a).size;

// ---------- sitemaps (base vs new) ----------
const sm = {};
for (const s of ["/museum/sitemap.xml", "/annual-reports/sitemap.xml", "/ui/sitemap.xml"]) {
  const o = await req(OLD, s), n = await req(NEW, s);
  sm[s] = { old: locs(o.body), neu: locs(n.body), o, n };
  t(`${s}: 200 + urlset`, n.status === 200 && /<urlset/.test(n.body), n.status);
  t(`${s}: no duplicate <loc> (base had ${dupes(sm[s].old)})`, dupes(sm[s].neu) === 0, dupes(sm[s].neu));
  t(`${s}: same set of URLs as base for facets/hubs (dedupe only)`, (() => { const a = new Set(sm[s].old.filter((u) => !/[0-9a-f]{12}$/.test(u))), b = new Set(sm[s].neu.filter((u) => !/[0-9a-f]{12}$/.test(u))); return a.size === b.size && [...a].every((u) => b.has(u)); })(), "facet set differs");
  t(`${s}: same D1 statements as base`, JSON.stringify(o.sql) === JSON.stringify(n.sql), `${o.sql.join(" | ")} vs ${n.sql.join(" | ")}`);
}
console.log(`sitemap entries base -> new: museum ${sm["/museum/sitemap.xml"].old.length} -> ${sm["/museum/sitemap.xml"].neu.length}, annual ${sm["/annual-reports/sitemap.xml"].old.length} -> ${sm["/annual-reports/sitemap.xml"].neu.length}, ui ${sm["/ui/sitemap.xml"].old.length} -> ${sm["/ui/sitemap.xml"].neu.length}`);
t("/ui/sitemap.xml unchanged byte for byte", sm["/ui/sitemap.xml"].o.body === sm["/ui/sitemap.xml"].n.body, "ui sitemap changed");

// E: every item URL in the new annual + museum sitemaps = the canonical its page prints (and the base's mismatches, for the record)
const FULL = process.env.SEO1_FULL !== "0";
for (const s of ["/annual-reports/sitemap.xml", "/museum/sitemap.xml"]) {
  const items = sm[s].neu.filter((u) => /[0-9a-f]{12}$/.test(u)), oldItems = new Map(sm[s].old.filter((u) => /[0-9a-f]{12}$/.test(u)).map((u) => [u.slice(-12), u]));
  const check = FULL ? items : pick(items, 400);
  let same = 0, oldSame = 0; const bad = [];
  for (const u of check) {
    const r = await req(NEW, rel(u));
    const c = (r.body.match(/<link rel="canonical" href="([^"]+)"/) || [])[1];
    if (r.status === 200 && c === u) same++; else bad.push(`${u} -> ${r.status} ${c}`);
    if (oldItems.get(u.slice(-12)) === c) oldSame++;
  }
  t(`${s}: ${same}/${check.length} item URLs equal their page's canonical (base sitemap: ${check.length - oldSame} did not)`, same === check.length, bad.slice(0, 5).join(" ; "));
}

// ---------- pages ----------
const mus = sm["/museum/sitemap.xml"].neu.map(rel), ann = sm["/annual-reports/sitemap.xml"].neu.map(rel), ui = sm["/ui/sitemap.xml"].neu.map(rel);
const isItem = (p) => /[0-9a-f]{12}$/.test(p);
const facets = (list, kinds) => kinds.flatMap((k) => pick(list.filter((p) => p.split("/")[2] === k && !isItem(p)), 4));
const pages = [...new Set([
  "/", "/museum", "/annual-reports", "/museum/index", "/annual-reports/index", "/ui", "/ui/flows",
  // the audit's 22 listing pages without og:title / og:image (museum artist/culture/theme/type, annual company/country)
  "/museum/theme/chinese-art", "/museum/artist/sylvia-dezon", "/museum/artist/yosa-buson-japanese-1716-1783", "/museum/artist/gillius-brakel", "/museum/culture/greek",
  "/museum/artist/philips-lasson", "/museum/type/vase", "/museum/artist/john-wilkes", "/museum/artist/brewster-and-co", "/museum/artist/jan-brueghel-the-elder",
  "/museum/artist/lorenzo-tiepolo", "/museum/culture/china-suzhou-qing-dynasty-1644-1911", "/annual-reports/country/italy", "/annual-reports/company/lebensversicherungs-gesellschaft-ph-nix",
  "/annual-reports/company/drummond-mccall-inc", "/annual-reports/company/heritage-group-inc", "/annual-reports/company/companhia-estrada-de-ferro-sorocabana",
  "/annual-reports/company/stoewer-werke-ag-vorm-gebr-der-stoewer", "/annual-reports/company/sterreichische-eisenbahn-verkehrs-anstalt", "/annual-reports/company/federal-pacific-electric-company",
  // the two UI template pages whose cards had no width/height
  "/ui/real-estate-website-templates/home-builder-website-template", "/ui/wedding-website-templates/event-website-template",
  ...facets(mus, ["artist", "culture", "theme", "type", "museum"]), ...facets(ann, ["company", "country", "designer", "industry"]),
  ...pick(mus.filter(isItem), 25), ...pick(ann.filter(isItem), 25), ...pick(ui.filter((p) => !isItem(p)), 40), ...pick(ui.filter(isItem), 25),
])];
const strip = (s) => s.replace(/<meta (?:property|name)="(?:og:[a-z_:]+|twitter:card)" content="[^"]*"\/?>/g, "")
  .replace(/<script type="application\/ld\+json">\{"@context":"https:\/\/schema\.org","@type":"BreadcrumbList"[^<]*<\/script>/g, "")
  .replace(/ width="\d+" height="\d+"/g, "");
const count = (s, re) => (s.match(re) || []).length;
let n200 = 0, nCrumb = 0, nDims = 0, nImg = 0;
const why = { tags: [], diff: [], ld: [], crumb: [], dims: [], sql: [], head: [] };
for (const p of pages) {
  const o = await req(OLD, p), n = await req(NEW, p);
  if (o.status !== n.status) { why.diff.push(`${p} status ${o.status}/${n.status}`); continue; }
  if (JSON.stringify(o.sql) !== JSON.stringify(n.sql)) why.sql.push(`${p}: ${o.sql.length} vs ${n.sql.length}`);
  if (n.status !== 200 || !/text\/html/.test(n.headers)) continue;
  n200++;
  const h = n.body.slice(0, n.body.indexOf("</head>"));
  if (strip(o.body) !== strip(n.body)) { const a = strip(o.body), b = strip(n.body); let i = 0; while (a[i] === b[i]) i++; why.diff.push(`${p} @${i}: …${a.slice(i - 40, i + 60)}… vs …${b.slice(i - 40, i + 60)}…`); }
  const indexable = /<link rel="canonical"/.test(h);
  if (indexable) {
    const img = /<meta property="og:image"/.test(h);
    const tw = h.match(/<meta name="twitter:card" content="([^"]+)"/g) || [];
    if (tw.length !== 1 || !tw[0].includes(img ? "summary_large_image" : '"summary"')) why.tags.push(`${p} twitter:card ${tw.join(",") || "none"} (og:image ${img})`);
    for (const k of ["og:title", "og:description", "og:url"]) if (count(h, new RegExp(`<meta property="${k}"`, "g")) !== 1) why.tags.push(`${p} ${k} x${count(h, new RegExp(`<meta property="${k}"`, "g"))}`);
    if (count(h, /<meta property="og:image"/g) > 1) why.tags.push(`${p} og:image twice`);
    if (/\/(museum|annual-reports)\/(artist|culture|theme|type|museum|company|country|designer|industry)\//.test(p) && /<img\b/.test(n.body) && !img) why.tags.push(`${p} listing without og:image`);
    // og:title/og:description filled from the page's own <title> / meta description
    if (!/<meta property="og:title"/.test(o.body)) {
      const title = (h.match(/<title>([^<]*)<\/title>/) || [])[1], ogt = (h.match(/<meta property="og:title" content="([^"]*)"/) || [])[1];
      if (title !== ogt) why.tags.push(`${p} og:title "${ogt}" != <title> "${title}"`);
      const d = (h.match(/<meta name="description" content="([^"]*)"/) || [])[1], ogd = (h.match(/<meta property="og:description" content="([^"]*)"/) || [])[1];
      if (d !== ogd) why.tags.push(`${p} og:description != meta description`);
      const fi = (n.body.slice(n.body.indexOf("</head>")).match(/<img\b[^>]*?\ssrc="([^"]+)"/) || [])[1], ogi = (h.match(/<meta property="og:image" content="([^"]*)"/) || [])[1];
      if (fi && ogi !== SITE + fi) why.tags.push(`${p} og:image ${ogi} != first item image ${fi}`);
    }
  }
  // every ld+json parses; BreadcrumbList = the visible crumb
  const lds = [...n.body.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  let crumbs = null;
  for (const s of lds) { try { const j = JSON.parse(s); for (const x of [j].flat()) if (x && x["@type"] === "BreadcrumbList") crumbs = x; } catch (e) { why.ld.push(`${p}: ${e.message}`); } }
  const nav = n.body.match(/<nav class="crumb"[^>]*>([\s\S]*?)<\/nav>/);
  if (nav && indexable) {
    if (!crumbs) why.crumb.push(`${p}: crumb nav but no BreadcrumbList`);
    else {
      nCrumb++;
      const L = crumbs.itemListElement || [];
      const vis = nav[1].split(" › ").map((x) => x.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\s+/g, " ").trim());
      const okL = L.length >= 2 && L.every((e, i) => e["@type"] === "ListItem" && e.position === i + 1 && /^https:\/\/madegooddesigns\.com\/inspiration/.test(e.item) && typeof e.name === "string" && e.name);
      const sameNames = !/"BreadcrumbList"/.test(o.body) ? JSON.stringify(L.map((e) => e.name)) === JSON.stringify(vis) : true;
      const lastIsPage = !/"BreadcrumbList"/.test(o.body) ? L[L.length - 1].item === (h.match(/<link rel="canonical" href="([^"]+)"/) || [])[1].replace(/&amp;/g, "&") : true;
      if (!okL || !sameNames || !lastIsPage) why.crumb.push(`${p}: ${JSON.stringify(L).slice(0, 200)} vs ${JSON.stringify(vis)}`);
    }
  }
  // D: images of museum / annual / UI rows carry width + height
  for (const m of n.body.matchAll(/<img\b[^>]*>/g)) {
    if (!/src="\/inspiration\/img\/(?!tpl\/)/.test(m[0])) continue;
    nImg++; if (/ width="\d+" height="\d+"/.test(m[0])) nDims++; else why.dims.push(`${p}: ${m[0].slice(0, 120)}`);
  }
}
t(`B twitter:card / og tags on ${n200} pages`, !why.tags.length, why.tags.slice(0, 6).join(" ; "));
t(`B every ld+json block parses`, !why.ld.length, why.ld.slice(0, 4).join(" ; "));
t(`B BreadcrumbList on ${nCrumb} pages with a visible crumb, names + order = the crumb, last item = canonical`, !why.crumb.length && nCrumb > 50, why.crumb.slice(0, 4).join(" ; "));
t(`C ${pages.length} pages: same status as base and identical HTML apart from the added tags + width/height`, !why.diff.length, why.diff.slice(0, 4).join(" ; "));
t(`D ${nDims}/${nImg} row images carry width + height`, !why.dims.length, why.dims.slice(0, 4).join(" ; "));
t(`F every page runs the same D1 statements as base`, !why.sql.length, why.sql.slice(0, 4).join(" ; "));

// ---------- A: HEAD = GET minus the body ----------
const headPaths = [...new Set(["/", "/museum", "/annual-reports", "/ui", "/museum/index", "/annual-reports/index", "/museum/sitemap.xml", "/annual-reports/sitemap.xml",
  "/ui/sitemap.xml", "/sitemap_index.xml", "/museum/", "/ui/", "/annual-reports/company/", "/no-such-page", "/museum/no-such-work-000000000000", "/annual-reports/x-000000000000",
  "/api/feed?limit=2", "/api/categories", "/mcp", "/a7f3c9e14b8d4a2f9c6e1d0b3a5f8e2c.txt", "/img/museum/does-not-exist.jpg", "/ui/terms", "/ui/flows", "/save", "/add",
  ...pick(pages.slice(7), 30)])];
let same = 0, base404 = 0; const hb = [];
for (const p of headPaths) {
  const g = await req(NEW, p), hd = await req(NEW, p, "HEAD"), ob = await req(OLD, p, "HEAD");
  if (g.status === hd.status && g.headers === hd.headers && hd.body === "") same++; else hb.push(`${p}: GET ${g.status} HEAD ${hd.status} body ${hd.body.length}${g.headers === hd.headers ? "" : " headers differ"}`);
  if (ob.status === 404 && g.status !== 404) base404++;
}
t(`A ${same}/${headPaths.length} routes: HEAD has GET's status + headers and no body (base: ${base404} of them answered 404 to HEAD)`, same === headPaths.length, hb.slice(0, 5).join(" ; "));
// the daily cron moved out of the default-export object literal (fetch now wraps route()); it must run the same statements
const cron = async (w) => { const q = []; const st = (sql) => ({ bind: () => ({ run: async () => { q.push(sql); return {}; } }), run: async () => { q.push(sql); return {}; } });
  const p = []; await w.scheduled({}, { DB: { prepare: st } }, { waitUntil: (x) => p.push(x) }); await Promise.allSettled(p); return q.join(" | "); };
const cOld = await cron(OLD), cNew = await cron(NEW);
t("scheduled() runs the same cron statements as base", typeof NEW.scheduled === "function" && cOld === cNew && cNew.includes("DELETE FROM mcp_calls"), `${cOld} vs ${cNew}`);
console.log(`${ok} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
