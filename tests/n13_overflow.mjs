// 390 px check: every n13 screen must not scroll sideways, and no element outside a swipe rail may poke past the viewport.
// usage: node tests/n13_overflow.mjs <pattern> [pattern...]   (reads ui-screens/out/<pattern>-homepage-mobile-*/index.html)
import { createRequire } from "node:module"; import { existsSync, readdirSync } from "node:fs"; import path from "node:path"; import os from "node:os"; import { fileURLToPath } from "node:url";
const require = createRequire((process.env.PW_DIR || process.cwd()) + "/");
const HERE = path.dirname(fileURLToPath(import.meta.url)), OUT = path.join(HERE, "../ui-screens/out");
let pw; for (const c of [HERE + "/../node_modules/playwright", HERE + "/../node_modules/playwright-core", "playwright", "playwright-core"]) { try { pw = require(c); break; } catch {} }
if (!pw) { console.error("playwright not found"); process.exit(2); }
const cache = path.join(os.homedir(), "Library/Caches/ms-playwright"), shell = readdirSync(cache).find((d) => d.startsWith("chromium_headless_shell"));
const exe = (() => { const r = path.join(cache, shell); const sub = readdirSync(r).find((d) => d.startsWith("chrome")); return path.join(r, sub, "chrome-headless-shell"); })();
const b = await pw.chromium.launch({ executablePath: exe }); let bad = 0, n = 0;
for (const p of process.argv.slice(2)) for (const w of [390, 1440, 1024, 768]) {
  const page = await b.newPage({ viewport: { width: w, height: 844 } });
  const dirs = w === 1440 || w === 1024 || w === 768 ? readdirSync(OUT).filter((d) => d.startsWith(p + "-homepage-web-")) : readdirSync(OUT).filter((d) => d.startsWith(p + "-homepage-mobile-"));
  for (const d of dirs) {
    n++; await page.goto("file://" + path.join(OUT, d, "index.html")); await page.waitForTimeout(60);
    const r = await page.evaluate(() => { const W = document.documentElement.clientWidth, sw = document.documentElement.scrollWidth, off = [];
      for (const el of document.querySelectorAll("body *")) { if (el.closest("svg") || el.closest("details:not([open])")) continue; let inRail = false; for (let a = el.parentElement; a; a = a.parentElement) { const o = getComputedStyle(a).overflowX; if (o === "auto" || o === "scroll" || o === "hidden") { inRail = true; break; } } if (inRail) continue;
        const b = el.getBoundingClientRect(); if (b.width && (b.right > W + 1 || b.left < -1)) off.push(el.tagName + "." + String(el.className).slice(0, 30)); }
      return { W, sw, off: off.slice(0, 4) }; });
    if (r.sw > r.W + 1 || r.off.length) { bad++; console.log("FAIL", w, d, r); }
  }
  await page.close();
}
await b.close(); console.log(`${n} renders checked, ${bad} with sideways overflow`); process.exit(bad ? 1 : 0);
