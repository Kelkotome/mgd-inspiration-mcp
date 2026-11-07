// Applies each style variation of an installed, active theme through the REST API, as the Site Editor does, and checks the front page.
// usage: node variationtest.mjs --base http://127.0.0.1:9400 --out out.jsonl --shots dir slug [slug...]
import fs from "node:fs"; import os from "node:os"; import path from "node:path"; import { chromium } from "playwright-core";
const args = process.argv.slice(2); const opt = (k, d) => { const i = args.indexOf(k); if (i < 0) return d; const v = args[i + 1]; args.splice(i, 2); return v; };
const BASE = opt("--base", "http://127.0.0.1:9400"), OUT = opt("--out", "variations.jsonl"), SHOTS = opt("--shots", null);
const cache = path.join(os.homedir(), "Library/Caches/ms-playwright"); const chr = fs.readdirSync(cache).find((d) => /^chromium-\d/.test(d));
const exe = path.join(cache, chr, fs.readdirSync(path.join(cache, chr)).find((d) => d.startsWith("chrome")), "Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing");
const b = await chromium.launch({ executablePath: exe }); const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
const get = async (q) => { const p = await ctx.newPage(); const r = await p.goto(`${BASE}/?${q}`, { timeout: 120000 }); const t = await r.text(); await p.close(); return JSON.parse(t); };
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
for (const slug of args) {
  await get(`mgdt=install&zip=${slug}.zip`); await get(`mgdt=activate&slug=${slug}`); const ed = await ctx.newPage();
  await ed.goto(`${BASE}/wp-admin/site-editor.php`, { timeout: 180000 }); await ed.waitForFunction(() => window.wp?.apiFetch && window.wp?.data, null, { timeout: 120000 });
  const vars = await ed.evaluate(async (slug) => { const base = await wp.apiFetch({ path: `/wp/v2/global-styles/themes/${slug}?context=edit` }).catch(() => null); const v = await wp.apiFetch({ path: `/wp/v2/global-styles/themes/${slug}/variations` }); const id = await wp.data.resolveSelect("core").__experimentalGetCurrentGlobalStylesId(); return { id, v: v.map((x) => ({ title: x.title, styles: x.styles, settings: x.settings })) }; }, slug);
  const res = { slug, n: vars.v.length, runs: [], fails: [] }; const seen = new Set();
  for (const x of vars.v) {
    await ed.evaluate(async ({ id, x }) => { await wp.apiFetch({ path: `/wp/v2/global-styles/${id}`, method: "POST", data: { styles: x.styles || {}, settings: x.settings || {} } }); }, { id: vars.id, x });
    const row = { title: x.title };
    for (const w of [390, 1280]) { const p = await ctx.newPage(); await p.setViewportSize({ width: w, height: 900 }); const failed = new Set(), ext = new Set(); p.on("requestfailed", (q) => failed.add(q.url())); p.on("request", (q) => { const u = new URL(q.url()); if (!["127.0.0.1", "localhost"].includes(u.hostname) && u.protocol.startsWith("http")) ext.add(u.href); });
      await p.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 120000 }); await p.evaluate(() => document.fonts.ready);
      const i = await p.evaluate(() => { const cs = getComputedStyle(document.body), h = document.querySelector("h1"); return { sw: document.documentElement.scrollWidth, W: document.documentElement.clientWidth, bg: cs.backgroundColor, text: cs.color, font: h ? getComputedStyle(h).fontFamily : "", fontsOk: [...document.fonts].filter((f) => f.status === "error").length }; });
      Object.assign(row, { bg: i.bg, font: i.font.split(",")[0] }); if (i.sw > i.W + 1) res.fails.push(`${x.title} ${w}: sideways scroll`); if (failed.size) res.fails.push(`${x.title} ${w}: failed ${[...failed][0]}`); if (ext.size) res.fails.push(`${x.title} ${w}: external ${[...ext][0]}`); if (i.fontsOk) res.fails.push(`${x.title} ${w}: font failed`);
      if (SHOTS) await p.screenshot({ path: path.join(SHOTS, `${slug}-${x.title.replace(/\W+/g, "-")}-${w}.png`) }); await p.close(); }
    seen.add(`${row.bg}|${row.font}`); res.runs.push(row);
  }
  res.distinctLooks = seen.size; if (seen.size < vars.v.length - 1) res.fails.push(`only ${seen.size} distinct looks from ${vars.v.length} variations`);
  await ed.close(); fs.appendFileSync(OUT, JSON.stringify(res) + "\n"); console.log(res.fails.length ? "FAIL" : "PASS", slug, `${res.n} variations, ${seen.size} looks`, res.fails.slice(0, 4).join(" ; "));
}
await b.close();
