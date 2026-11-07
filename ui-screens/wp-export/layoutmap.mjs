// Layout fingerprint for tests/hc_distinct.py: where content boxes sit at 1280 px, on a 40-column grid with 40 px rows. Colour barely moves it.
// usage: node layoutmap.mjs out.json [html paths...]   (no paths = every theme source plus a re-skin control pair)
import fs from "node:fs"; import os from "node:os"; import path from "node:path"; import { chromium } from "playwright-core"; import { designs, OUT_MAIN } from "./themes.mjs"; import { mapFn } from "./layoutfn.mjs";
const [out, ...extra] = process.argv.slice(2);
const cache = path.join(os.homedir(), "Library/Caches/ms-playwright"); const chr = fs.readdirSync(cache).find((d) => /^chromium-\d/.test(d));
const exe = path.join(cache, chr, fs.readdirSync(path.join(cache, chr)).find((d) => d.startsWith("chrome")), "Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing");
const list = designs().map((d) => [`${d.niche}/${d.variant}`, d.html]);
for (const s of ["minimal", "luxury", "brutalist", "playful"]) list.push([`control/cardiology-${s}`, path.join(OUT_MAIN, `cardiology-website-homepage-web-${s}`, "index.html")]);
for (const s of ["corporate", "retro"]) list.push([`control/dental-${s}`, path.join(OUT_MAIN, `dental-website-homepage-web-${s}`, "index.html")]);
const b = await chromium.launch({ executablePath: exe }); const res = {};
for (const [id, html] of list) {
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } }); await p.goto("file://" + html, { waitUntil: "load" }); await p.waitForTimeout(80);
  res[id] = await p.evaluate(mapFn);
  await p.close();
}
await b.close(); fs.writeFileSync(out, JSON.stringify(res)); console.log(Object.keys(res).length, "maps");
