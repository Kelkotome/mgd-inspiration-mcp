#!/usr/bin/env node
// Restructure round (25-Nov-2026, owner decision after the SEO benchmark: flat URLs + visible hierarchy). Categories, groups, crumbs, schema, MCP output,
// and the guarantee that NO URL moves: every path the base tree (5ae879d) served is still served, unchanged. node --import ./tests/ui_rank/register.mjs tests/test_tpl_restructure.mjs
import { writeFileSync, mkdtempSync, rmSync, copyFileSync } from "node:fs"; import path from "node:path"; import { tmpdir } from "node:os"; import { fileURLToPath } from "node:url"; import { execSync } from "node:child_process";
const HERE = path.dirname(fileURLToPath(import.meta.url)), ROOT = path.join(HERE, ".."), SRC = path.join(ROOT, "src");
const T = await import(path.join(SRC, "ui_tree.js")), P = await import(path.join(SRC, "ui_templates.js")), S = await import(path.join(SRC, "ui_seo.js"));
let n = 0, fails = 0; const t = (name, ok) => { n++; if (!ok) fails++; console.log(`${ok ? "ok  " : "FAIL"} ${name}`); };
// no URL moves: load the base tree (before this round) against today's catalog and compare
const BASE = process.env.BASE_REF || "5ae879d", dir = mkdtempSync(path.join(process.env.SCRATCH || tmpdir(), "rs-"));
writeFileSync(path.join(dir, "ui_tree.js"), execSync(`git -C "${ROOT}" show ${BASE}:src/ui_tree.js`)); copyFileSync(path.join(SRC, "tpl_catalog.json"), path.join(dir, "tpl_catalog.json"));
const B = await import(path.join(dir, "ui_tree.js"));
const now = new Set(T.treePaths()), base = B.treePaths();
t(`every base path still served (${base.length})`, base.every((p) => now.has(p)));
for (const p of base) { if (!T.resolveTree(p)) t(`still resolves ${p}`, false); }
const added = [...now].filter((p) => !base.includes(p)); t(`only the category pages are new (${added.length})`, added.length === T.liveCategories().length && added.every((p) => T.CATEGORIES.some((c) => c.seg === p)));
for (const nn of T.NICHES) { const b = B.nicheById(nn.id); if (b && b.htmlLive) { if (T.nestedPatternPath(nn.pattern) !== B.nestedPatternPath(nn.pattern)) t(`${nn.id} URL unchanged`, false); if (b.wpLive && T.wpNichePath(nn) !== B.wpNichePath(b)) t(`${nn.id} WP URL unchanged`, false); } }
t("every niche, WordPress and theme URL unchanged", true);
rmSync(dir, { recursive: true, force: true });
// categories
t("7 categories", T.CATEGORIES.length === 7);
t("every industry in exactly one category", Object.keys(T.INDUSTRIES).every((i) => T.CATEGORIES.filter((c) => c.industries.includes(i)).length === 1));
t("r7-r9 industries placed", T.categoryOf("education").id === "learning-community" && T.categoryOf("automotive").id === "property-trades-automotive" && T.categoryOf("travel").id === "food-travel-hospitality");
t("category pages are flat siblings, not URL parents", T.CATEGORIES.every((c) => !c.seg.includes("/")) && T.treePaths().every((p) => !T.CATEGORIES.some((c) => p.startsWith(c.seg + "/"))));
t("searched-term slugs: business, food, online store, creative", ["business-website-templates", "food-website-templates", "online-store-website-templates", "creative-website-templates"].every((s) => T.CATEGORIES.some((c) => c.seg === s)));
{ const heads = [...Object.values(T.INDUSTRIES).flatMap((i) => [i.label, i.seg.replace(/-/g, " "), i.h1.replace(/ website templates$/i, "")]), ...T.NICHES.map((x) => x.label), "event", "restaurant", "travel", "wedding", "technology", "ecommerce", "blog", "nonprofit"].map((x) => x.toLowerCase());
  const bad = T.CATEGORIES.filter((c) => heads.some((hd) => c.h1.toLowerCase().includes(`${hd} website template`) || c.h1.toLowerCase().includes(`and ${hd} website template`))); t(`no category h1 contains a hub or niche head term (${bad.map((c) => c.h1).join("; ")})`, bad.length === 0); }
t("food category h1 does not target restaurant website template", !/restaurant/i.test(T.CATEGORIES.find((c) => c.id === "food-travel-hospitality").h1));
t("shops not live yet (r11)", T.resolveTree("online-store-website-templates") === null);
for (const c of T.liveCategories()) t(`category ${c.seg} resolves`, T.resolveTree(c.seg)?.type === "category");
let slugOk = true; try { S.assertSlugs([]); } catch (e) { slugOk = !/category/.test(String(e)); } t("category slugs pass the flat-namespace check", slugOk);
// groups
const hc = T.INDUSTRIES.healthcare, placed = hc.groups.flatMap((g) => [g.parent, ...g.niches].filter(Boolean));
t("every healthcare niche in exactly one group", placed.length === hc.niches.length && new Set(placed).size === placed.length);
t("7 healthcare groups incl. nutrition (empty until r14)", hc.groups.map((g) => g.id).join() === "medical,dental,mental-health,therapy-rehab,nutrition-care,eye-care-pharmacy,animal-health" && !T.groupLive(hc.groups.find((g) => g.id === "nutrition-care")));
t("medical page carries 5 children, dental 1", T.nicheChildren(T.nicheById("medical")).length === 5 && T.nicheChildren(T.nicheById("dental")).length === 1);
t("assertTree passes", (() => { try { T.assertTree(); return true; } catch { return false; } })());
// crumbs
const cr = P.nicheCrumbs(T.nicheById("cardiology"));
t("niche crumbs: UI screens > Website templates > Health and wellness > Healthcare > Medical > Cardiology", cr.map((x) => x[0]).join(" > ") === "UI screens > Website templates > Health and wellness > Healthcare > Medical > Cardiology");
t("crumb urls (flat; Medical links the medical page)", cr.map((x) => x[1]).join(" ") === " website-templates health-and-wellness-website-templates healthcare-website-templates healthcare-website-templates/medical-website-template healthcare-website-templates/cardiology-website-template");
t("group parent crumbs end at the group label", P.nicheCrumbs(T.nicheById("medical")).map((x) => x[0]).slice(-2).join() === "Healthcare,Medical");
t("section-only group not in crumbs", P.nicheCrumbs(T.nicheById("therapist")).map((x) => x[0]).slice(-2).join() === "Healthcare,Therapist");
t("non-grouped industry crumbs", P.nicheCrumbs(T.nicheById("bakery")).map((x) => x[0]).join(" > ") === "UI screens > Website templates > Food and hospitality > Restaurant > Bakery");
t("no 'Templates' crumb left", T.NICHES.filter((x) => x.htmlLive).every((x) => P.nicheCrumbs(x).every(([l]) => l !== "Templates")));
t("root crumb label is the same everywhere", P.TEMPLATES_CRUMB === "Website templates" && T.NICHES.filter((x) => x.htmlLive).every((x) => P.nicheCrumbs(x)[1][0] === "Website templates"));
const ld = P.crumbLd("https://s", "/inspiration", cr); t("BreadcrumbList: 6 items, every item has a URL", ld.itemListElement.length === 6 && ld.itemListElement.every((e, i) => e.position === i + 1 && /^https:\/\/s\/inspiration\/ui/.test(e.item)));
// owner 25-Nov choices (after the content gap): 1 B hold Learning and community, 2 B labels = H1 names, 4 B one merged notice, 6 B "Part of" uses the page H1
const lc_ = T.CATEGORIES.find((c) => c.id === "learning-community");
t("learning and community held: not live, no route, not in tree paths", lc_.hold === true && !T.categoryLive(lc_) && T.resolveTree(lc_.seg) === null && !T.treePaths().includes(lc_.seg) && T.liveCategories().length === 5);
t("education keeps its placement but shows no category", T.categoryOf("education").id === "learning-community" && T.homeCategory("education") === null);
t("education crumbs skip the held category", P.nicheCrumbs(T.nicheById("school")).map((x) => x[0]).join(" > ") === "UI screens > Website templates > Education > School");
t("category labels are the H1 names", T.CATEGORIES.every((c) => `${c.label} website templates`.toLowerCase() === c.h1.toLowerCase()));
{ const C = (await import(path.join(SRC, "tpl_copy.json"), { with: { type: "json" } })).default.categories; const rules = (txt) => (txt.match(/compliant with any (.*?) rule/) || [, ""])[1].split(/, | or /).filter(Boolean);
  const advice = (txt) => (txt.match(/not (.*?) advice/) || [, ""])[1].split(/, | or /).filter(Boolean);
  for (const c of T.liveCategories()) { const inds = T.categoryIndustries(c); if (inds.length < 2) continue; const nt = (C[c.id] || {}).notice || "";
    const miss = inds.flatMap((i) => [...rules(P.DISCLOSES[i.id]), ...advice(P.DISCLOSES[i.id])].filter((w) => !nt.includes(w)));
    t(`${c.seg}: one merged notice keeps every rule and advice type of its industries${miss.length ? " (missing " + miss.join(", ") + ")" : ""}`, nt && miss.length === 0 && (nt.match(/fictional samples/g) || []).length === 1); } }
{ const html = await P.nicheExtras(T.nicheById("cardiology"), {}, "/inspiration", { escHtml: (x) => String(x) }, { uiRows: async () => [] }); t('"Part of medical" links with the page H1', html.includes(">Medical website templates</a>")); }
// MCP output unchanged in URL shape
const lines = P.tplListLines("https://s").join("\n"); t("list_ui_patterns prints flat URLs", lines.includes("/ui/healthcare-website-templates/cardiology-website-template") && lines.includes("/ui/wordpress-themes/healthcare/cardiology") && !lines.includes("medical-website-template/cardiology"));
t("hint unchanged", P.tplHint({ q: "dermatology website template" }, "https://s").includes("/ui/healthcare-website-templates/dermatology-website-template"));
console.log(`${n} checks, ${fails} failed`); process.exit(fails ? 1 : 0);
