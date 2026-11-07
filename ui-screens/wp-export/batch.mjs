// Export every theme to out-wp/, screenshot first. usage: node batch.mjs [--only cardiology,dental] [--slugs a,b] [--zips dir]
import fs from "node:fs"; import os from "node:os"; import path from "node:path"; import { chromium } from "playwright-core";
import { designs, OUT_WP } from "./themes.mjs"; import { exportTheme } from "./export.mjs";
const arg = (k) => { const i = process.argv.indexOf(k); return i > -1 ? process.argv[i + 1] : null; };
const only = arg("--only")?.split(","), slugs = arg("--slugs")?.split(","), zips = arg("--zips");
const cache = path.join(os.homedir(), "Library/Caches/ms-playwright"); const chr = fs.readdirSync(cache).find((d) => /^chromium-\d/.test(d));
const exe = path.join(cache, chr, fs.readdirSync(path.join(cache, chr)).find((d) => d.startsWith("chrome")), "Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing");
const list = designs().filter((d) => !d.noTheme && (!only || only.includes(d.niche)) && (!slugs || slugs.includes(d.slug)));
fs.mkdirSync(OUT_WP, { recursive: true }); const shots = path.join(OUT_WP, "_shots"); fs.mkdirSync(shots, { recursive: true });
const b = await chromium.launch({ executablePath: exe }); const summary = [];
for (const d of list) {
  if (!fs.existsSync(d.html)) { console.log("NO SOURCE", d.slug, d.html); continue; }
  const png = path.join(shots, `${d.slug}.png`); const p = await b.newPage({ viewport: { width: 1200, height: 900 } });
  await p.goto("file://" + d.html, { waitUntil: "load" }); await p.waitForTimeout(150); await p.screenshot({ path: png }); await p.close();
  const desc = `A block theme for ${d.niche.replace(/-/g, " ")} sites: ${d.about}. All names and details are fictional samples to replace.`;
  const r = exportTheme({ html: d.html, slug: d.slug, name: d.name, family: d.family, style: d.style, desc, out: OUT_WP, zip: true, niche: d.niche, screenshot: png, version: "1.0.0" });
  fs.writeFileSync(path.join(OUT_WP, `${d.slug}.design.json`), JSON.stringify(d, null, 1));
  summary.push(r); console.log(d.slug, "blocks", r.blocks, "html", r.htmlBlocks, JSON.stringify(r.htmlWhy), "patterns", r.patterns.length, "zip", r.zipBytes);
  if (zips) fs.copyFileSync(path.join(OUT_WP, `${d.slug}.zip`), path.join(zips, `${d.slug}.zip`));
}
await b.close(); console.log(`${summary.length} themes exported`);
