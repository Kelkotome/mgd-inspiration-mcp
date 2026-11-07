// Install test: real zip through Theme_Upgrader, activation, PHP log, front page at 390/768/1280, request log, Site Editor block validity.
// usage: node installtest.mjs --base http://127.0.0.1:9400 --out results.jsonl slug [slug...]   (zips are read from the mounted /zips)
import fs from "node:fs"; import os from "node:os"; import path from "node:path"; import { fileURLToPath } from "node:url"; import { chromium } from "playwright-core"; import { mapFn, bestOverlap } from "./layoutfn.mjs";
const HERE = path.dirname(fileURLToPath(import.meta.url)), WP_OUT = process.env.WP_OUT || path.join(HERE, "../out-wp"), FIDELITY = 0.70; // WordPress render against the source page, see below
const args = process.argv.slice(2); const opt = (k, d) => { const i = args.indexOf(k); if (i < 0) return d; const v = args[i + 1]; args.splice(i, 2); return v; };
const BASE = opt("--base", "http://127.0.0.1:9400"), OUT = opt("--out", "results.jsonl"), SHOTS = opt("--shots", null), SKIP_ED = (() => { const i = args.indexOf("--no-editor"); if (i < 0) return false; args.splice(i, 1); return true; })();
const cache = path.join(os.homedir(), "Library/Caches/ms-playwright"); const chr = fs.readdirSync(cache).find((d) => /^chromium-\d/.test(d));
const exe = path.join(cache, chr, fs.readdirSync(path.join(cache, chr)).find((d) => d.startsWith("chrome")), "Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing");
const b = await chromium.launch({ executablePath: exe, headless: true });
const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
const api = async (q) => { const p = await ctx.newPage(); const r = await p.goto(`${BASE}/?${q}`, { timeout: 120000 }); const t = await r.text(); await p.close(); try { return JSON.parse(t); } catch { return { ok: false, err: "bad json: " + t.slice(0, 300) }; } };
const overflow = () => { const W = document.documentElement.clientWidth, sw = document.documentElement.scrollWidth, off = [];
  for (const el of document.querySelectorAll("body *")) { if (el.closest("svg") || el.closest("details:not([open])")) continue; if (el.closest(".wp-block-navigation__responsive-container:not(.is-menu-open)")) continue; let clip = false; for (let a = el.parentElement; a; a = a.parentElement) { const o = getComputedStyle(a).overflowX; if (o === "auto" || o === "scroll" || o === "hidden") { clip = true; break; } } if (clip) continue;
    const r = el.getBoundingClientRect(); if (r.width && (r.right > W + 1 || r.left < -1)) off.push(el.tagName + "." + String(el.className).slice(0, 40)); }
  return { W, sw, off: off.slice(0, 4), h: document.documentElement.scrollHeight }; };
for (const slug of args) {
  const res = { slug, t: new Date().toISOString(), fails: [] }; const fail = (m) => res.fails.push(m);
  try {
    await api("mgdt=log&clear=1");
    const ins = await api(`mgdt=install&zip=${slug}.zip`); res.install = ins.ok; if (!ins.ok) fail("install: " + (ins.err || JSON.stringify(ins.msg)));
    const ac = await api(`mgdt=activate&slug=${slug}`); res.activate = ac.ok; res.block = ac.block; res.wp = ac.ver; res.php = ac.php; if (!ac.ok) fail("activate: " + ac.err); if (!ac.block) fail("not a block theme");
    const dj = path.join(WP_OUT, `${slug}.design.json`), design = fs.existsSync(dj) ? JSON.parse(fs.readFileSync(dj, "utf8")) : null; // negative controls have none
    if (design?.product) await api(`mgdt=title&v=${encodeURIComponent(design.product)}`); // what a site owner does in step 3, so the header reads as designed
    const srcMap = {}; if (design) for (const w of [390, 1280]) { const pg = await ctx.newPage(); await pg.setViewportSize({ width: w, height: 900 }); await pg.goto("file://" + design.html, { waitUntil: "load" }); await pg.waitForTimeout(150); srcMap[w] = await pg.evaluate(mapFn); await pg.close(); }
    res.viewports = {};
    for (const w of [390, 768, 1280]) {
      const pg = await ctx.newPage(); await pg.setViewportSize({ width: w, height: 900 }); const ext = new Set(), errs = [], failed = new Set();
      pg.on("request", (q) => { const u = new URL(q.url()); if (!["127.0.0.1", "localhost"].includes(u.hostname) && u.protocol.startsWith("http")) ext.add(u.href); });
      pg.on("requestfailed", (q) => failed.add(q.url())); pg.on("pageerror", (e) => errs.push(String(e))); pg.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
      const r = await pg.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 120000 }); const o = await pg.evaluate(overflow);
      res.viewports[w] = { status: r.status(), ...o, ext: [...ext], errs: errs.slice(0, 3), failed: [...failed].slice(0, 3) };
      if (r.status() !== 200) fail(`${w}: HTTP ${r.status()}`); if (o.sw > o.W + 1) fail(`${w}: sideways scroll ${o.sw}>${o.W}`); if (o.off.length) fail(`${w}: overflow ${o.off.join(",")}`);
      if (ext.size) fail(`${w}: external ${[...ext].join(" ")}`); if (errs.length) fail(`${w}: console ${errs[0].slice(0, 160)}`); if (failed.size) fail(`${w}: failed request ${[...failed][0]}`);
      const fatal = await pg.evaluate(() => document.body.innerText.includes("critical error") || !document.querySelector(".wp-site-blocks")); if (fatal) fail(`${w}: critical error or no site blocks`);
      if (SHOTS) { fs.mkdirSync(SHOTS, { recursive: true }); await pg.screenshot({ path: path.join(SHOTS, `${slug}-${w}.png`), fullPage: true }); }
      // Fidelity: a page can load with no overflow and still be wrong (a sidebar shell once collapsed into a narrow column), so content must sit where the source puts it
      if (srcMap[w]) { const m = await pg.evaluate(mapFn); const f = bestOverlap(srcMap[w], m); res.viewports[w].fidelity = +f.toFixed(3); res.viewports[w].hRatio = +(m.h / srcMap[w].h).toFixed(3); if (f < FIDELITY) fail(`${w}: layout differs from the source, overlap ${f.toFixed(2)}`); }
      // Menu: desktop shows links; below 960 px the core overlay menu must actually open. n12's 768 px bug was a nav that stayed inline and overflowed.
      res.viewports[w].nav = await pg.evaluate(() => { const c = document.querySelector("header .wp-block-navigation, .wp-block-navigation"); if (!c) return { none: true }; const open = document.querySelector(".wp-block-navigation__responsive-container-open"), vis = open && getComputedStyle(open).display !== "none"; return { toggle: !!vis, links: [...c.querySelectorAll("a.wp-block-navigation-item__content")].filter((a) => a.offsetParent !== null).length }; });
      if (res.viewports[w].nav.none) fail(`${w}: no navigation block`);
      else if (w < 960 && !res.viewports[w].nav.toggle) fail(`${w}: no menu button`);
      else if (w >= 960 && res.viewports[w].nav.links < 3) fail(`${w}: menu links not visible`);
      if (w < 960 && res.viewports[w].nav.toggle) { await pg.click(".wp-block-navigation__responsive-container-open"); await pg.waitForTimeout(350); const op = await pg.evaluate(() => { const m = document.querySelector(".wp-block-navigation__responsive-container.is-menu-open"); return !!m && [...m.querySelectorAll("a")].filter((a) => a.getBoundingClientRect().width > 0).length; }); res.viewports[w].menuOpen = op; if (!op) fail(`${w}: menu did not open`); }
      await pg.close();
    }
    for (const p of ["?p=1", "?s=test", "?p=99999"]) { const pg = await ctx.newPage(); const r = await pg.goto(`${BASE}/${p}`, { timeout: 120000 }); const ok = await pg.evaluate(() => !!document.querySelector(".wp-site-blocks")); if (!ok) fail(`inner page ${p}: no site blocks`); await pg.close(); }
    if (!SKIP_ED) {
      const pg = await ctx.newPage(); const errs = []; pg.on("pageerror", (e) => errs.push(String(e)));
      await pg.goto(`${BASE}/wp-admin/site-editor.php?p=%2Fwp_template%2F${encodeURIComponent(slug + "//front-page")}&canvas=edit`, { timeout: 180000 });
      await pg.waitForFunction(() => window.wp?.data?.select("core/block-editor")?.getBlockCount() > 0, null, { timeout: 120000 });
      await pg.waitForTimeout(2500);
      res.editor = await pg.evaluate(async (slug) => {
        const bad = [], walk = (bs, src) => { for (const x of bs) { if (!x.isValid) bad.push({ src, name: x.name, issues: (x.validationIssues || []).map((i) => i.args ? String(i.args[0]).replace(/%s/g, "").slice(0, 80) + " " + i.args.slice(1).map((a) => String(typeof a === "object" ? JSON.stringify(a) : a).slice(0, 90)).join(" | ") : "").slice(0, 2), html: (x.originalContent || "").slice(0, 120) }); walk(x.innerBlocks || [], src); } };
        const live = wp.data.select("core/block-editor"); const ids = live.getClientIdsWithDescendants(); const blocks = ids.map((i) => live.getBlock(i)).filter(Boolean);
        for (const x of blocks) if (!x.isValid) bad.push({ src: "live", name: x.name, html: (x.originalContent || "").slice(0, 120) });
        const pats = await wp.apiFetch({ path: "/wp/v2/block-patterns/patterns" }); let n = 0;
        for (const p of pats.filter((p) => p.name.startsWith(slug + "/"))) { n++; walk(wp.blocks.parse(p.content), p.name); }
        for (const part of ["top", "header", "footer"]) { const t = await wp.apiFetch({ path: `/wp/v2/template-parts/${slug}//${part}?context=edit` }).catch((e) => { if (part === "top") return null; throw e; }); if (!t) continue; walk(wp.blocks.parse(t.content.raw), part); }
        for (const tn of ["front-page", "index", "single", "page", "archive", "search", "404"]) { const t = await wp.apiFetch({ path: `/wp/v2/templates/${slug}//${tn}?context=edit` }); walk(wp.blocks.parse(t.content.raw), tn); }
        const styles = await wp.apiFetch({ path: `/wp/v2/global-styles/themes/${slug}/variations` }).catch(() => []);
        const missing = wp.data.select("core/blocks").getBlockTypes().length;
        return { liveBlocks: ids.length, patterns: n, invalid: bad.length, bad: bad.slice(0, 6), variations: styles.length, title: document.title, missingTypes: blocks.filter((x) => x.name === "core/missing").length };
      }, slug);
      if (!res.editor.liveBlocks) fail("editor: no blocks"); if (res.editor.invalid) fail(`editor: ${res.editor.invalid} invalid blocks`); if (errs.length) fail("editor js: " + errs[0].slice(0, 160));
      if (SHOTS) await pg.screenshot({ path: path.join(SHOTS, `${slug}-editor.png`) });
      await pg.close();
    }
    const lg = await api("mgdt=log"); res.phpLog = (lg.log || "").split("\n").filter((l) => /PHP (Warning|Fatal|Parse|Notice|Deprecated)/.test(l)).slice(0, 6);
    if (res.phpLog.length) fail("php: " + res.phpLog[0].slice(0, 200));
  } catch (e) { fail("harness: " + String(e).slice(0, 300)); }
  res.pass = !res.fails.length; fs.appendFileSync(OUT, JSON.stringify(res) + "\n");
  console.log((res.pass ? "PASS " : "FAIL ") + slug, res.editor ? `blocks ${res.editor.liveBlocks} patterns ${res.editor.patterns} vars ${res.editor.variations}` : "", res.fails.slice(0, 6).join(" ; "));
}
await b.close();
