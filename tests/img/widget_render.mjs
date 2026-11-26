// mcp-img-r1: render the MCP Apps gallery widget in headless Chrome with sample data (real madegooddesigns.com images) and check
// both host bridges:
//   1. MCP Apps: a fake host page iframes the widget, answers ui/initialize, sends ui/notifications/tool-result; a tap must send
//      ui/open-link with our page URL; the widget must report its size (ui/notifications/size-changed).
//   2. ChatGPT: window.openai.toolOutput renders and a tap calls window.openai.openExternal({href}).
// Screenshots: out/gallery.png (760 px wide), out/gallery-390.png (phone width), out/gallery-390-dark.png.
// Run: node tests/img/widget_render.mjs   (prints "N passed, M failed"; needs Google Chrome + puppeteer-core)
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
import { GALLERY_HTML } from "../../src/mcp_gallery.js";
const require = createRequire(import.meta.url);
const puppeteer = require(process.env.PUPPETEER || "/Users/eugeneleow/Downloads/EtiennAubertBonn/node_modules/puppeteer-core");
const CHROME = process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const OUT = new URL("../../out/", import.meta.url).pathname; mkdirSync(OUT, { recursive: true });
let ok = 0, fail = 0;
const t = (n, c, info) => { c ? ok++ : fail++; if (!c) console.log("FAIL " + n + " | " + String(info).slice(0, 300)); };

const S = "https://madegooddesigns.com/inspiration", U = "?utm_source=mcp&utm_medium=referral&utm_campaign=search_museum_art";
const it = (id, coll, key, title, subtitle, page) => ({ id, title, subtitle, collection: coll, page_url: page + U, image_url: `${S}/img/${key}`, thumb_url: `${S}/img/t/${key}` });
const SAMPLE = { title: "6 references for \"poster\". Source: Made Good Designs", site: S + "/", items: [
  it("ac7e784402a1", "museum", "museum/ac7e784402a1.jpg", "Zodiaque (\"La Plume\")", "Alphonse Marie Mucha, 1896 · Art Institute of Chicago", `${S}/museum/zodiaque-la-plume-1896-ac7e784402a1`),
  it("b26d995752f3", "museum", "museum/b26d995752f3.jpg", "The Seasons", "Alphonse Marie Mucha, 1897 · Art Institute of Chicago", `${S}/museum/the-seasons-1897-b26d995752f3`),
  it("e4cec953c2c9", "annual-report", "annual/e4cec953c2c9.jpg", "Chicago Transit Authority 1959", "Chicago Transit Authority (1959)", `${S}/annual-reports/chicago-transit-authority-1959-e4cec953c2c9`),
  it("98ffa5e27260", "design", "items/98ffa5e27260.jpg", "Textual Reflection", "sans-serif, poster, typography", `${S}/#i/98ffa5e27260`),
  it("58d410e02f74", "design", "items/58d410e02f74.jpg", "Typography Inspiration", "typography, branding, layout", `${S}/#i/58d410e02f74`),
  it("662fc2ae33c3", "design", "items/662fc2ae33c3.jpg", "California Poppy Poster", "serif, poster, layout", `${S}/#i/662fc2ae33c3`),
] };

// fake MCP Apps host (no SDK): JSON-RPC over postMessage
const HOST = (theme) => `<!doctype html><html><body style="margin:0;background:${theme === "dark" ? "#0b0b0b" : "#f0f0f0"}">
<iframe id="w" sandbox="allow-scripts allow-same-origin allow-popups" style="border:0;width:100%;height:600px;display:block"></iframe>
<script>
window.LOG = [];
const f = document.getElementById("w");
window.addEventListener("message", (ev) => {
  const m = ev.data; if (!m || m.jsonrpc !== "2.0") return; LOG.push(m);
  const reply = (result) => f.contentWindow.postMessage({ jsonrpc: "2.0", id: m.id, result }, "*");
  if (m.method === "ui/initialize") reply({ protocolVersion: "2026-01-26", hostInfo: { name: "fake-host", version: "1" }, hostCapabilities: { openLinks: {} },
    hostContext: { theme: ${JSON.stringify(theme)}, platform: "mobile", displayMode: "inline" } });
  if (m.method === "ui/notifications/initialized") {
    f.contentWindow.postMessage({ jsonrpc: "2.0", method: "ui/notifications/tool-input", params: { arguments: { query: "poster" } } }, "*");
    f.contentWindow.postMessage({ jsonrpc: "2.0", method: "ui/notifications/tool-result", params: { content: [{ type: "text", text: "…" }], structuredContent: ${JSON.stringify(SAMPLE)} } }, "*");
  }
  if (m.method === "ui/open-link") reply({});
  if (m.method === "ui/notifications/size-changed") f.style.height = m.params.height + "px";
});
f.srcdoc = ${JSON.stringify(GALLERY_HTML).replace(/<\//g, "<\\/")};
</script></body></html>`;

// The site's bot protection answers headless Chrome with 403, so the test fetches each real image once with a curl-style client and
// serves it to the browser by request interception; /img/t/ thumbnails are made the way the Worker makes them (320 px JPEG).
const sharp = require("/Users/eugeneleow/Downloads/EtiennAubertBonn/mgd-inspiration/node_modules/sharp");
const IMG = new Map();
for (const x of SAMPLE.items) {
  const r = await fetch(x.image_url, { headers: { "User-Agent": "curl/8.4.0", Accept: "*/*" } });
  const buf = Buffer.from(await r.arrayBuffer());
  t(`fetched ${x.id} (${r.status}, ${buf.length} B)`, r.ok && buf.length > 1000, r.status);
  IMG.set(x.image_url, { ct: "image/jpeg", body: buf });
  IMG.set(x.thumb_url, { ct: "image/jpeg", body: await sharp(buf).resize({ width: 320, height: 400, fit: "inside", withoutEnlargement: true }).jpeg({ quality: 72 }).toBuffer() });
}
const serve = async (page) => { await page.setRequestInterception(true); page.on("request", (rq) => { const v = IMG.get(rq.url());
  if (v) rq.respond({ status: 200, contentType: v.ct, body: v.body, headers: { "Access-Control-Allow-Origin": "*" } });
  else if (rq.url().startsWith("https://")) rq.respond({ status: 404, body: "" }); else rq.continue(); }); };
const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new", args: ["--no-sandbox"] });
const waitImgs = (frame) => frame.waitForFunction(() => { const im = [...document.images]; return im.length >= 6 && im.every((i) => i.complete && i.naturalWidth > 0); }, { timeout: 45000 });
try {
  for (const [w, file, theme] of [[760, "gallery.png", "light"], [390, "gallery-390.png", "light"], [390, "gallery-390-dark.png", "dark"]]) {
    const page = await browser.newPage();
    await page.setViewport({ width: w, height: 900, deviceScaleFactor: 2 }); await serve(page);
    await page.setContent(HOST(theme), { waitUntil: "load" });
    const fh = await page.waitForSelector("#w"); const frame = await fh.contentFrame();
    await frame.waitForSelector("a.card", { timeout: 15000 });
    try { await waitImgs(frame); t(`${w}/${theme}: all 6 thumbnails loaded`, true); } catch (e) { t(`${w}/${theme}: images loaded`, false, e.message + " " + JSON.stringify(await frame.evaluate(() => [...document.images].map((i) => [i.src.slice(-40), i.complete, i.naturalWidth])))); }
    const n = await frame.$$eval("a.card", (a) => a.length); t(`${w}/${theme}: 6 cards`, n === 6, n);
    const cols = await frame.evaluate(() => getComputedStyle(document.getElementById("g")).gridTemplateColumns.split(" ").length);
    t(`${w}/${theme}: columns (${cols})`, w <= 420 ? cols === 2 : cols >= 3, cols);
    const sw = await frame.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth); t(`${w}/${theme}: no horizontal scroll`, sw);
    await new Promise((r) => setTimeout(r, 300));
    const log = await page.evaluate(() => LOG.map((m) => ({ method: m.method, params: m.params })));
    t(`${w}/${theme}: ui/initialize sent first`, log[0] && log[0].method === "ui/initialize" && log[0].params.protocolVersion === "2026-01-26", JSON.stringify(log[0]));
    t(`${w}/${theme}: initialized notification`, log.some((m) => m.method === "ui/notifications/initialized"));
    t(`${w}/${theme}: size-changed reported`, log.some((m) => m.method === "ui/notifications/size-changed" && m.params.height > 200), JSON.stringify(log.filter((m) => m.method && m.method.includes("size"))));
    if (theme === "dark") t("dark theme applied from hostContext", await frame.evaluate(() => document.documentElement.getAttribute("data-theme") === "dark"));
    await fh.screenshot({ path: OUT + file });
    if (w === 390 && theme === "light") {
      await frame.click("a.card:nth-child(3)");
      await new Promise((r) => setTimeout(r, 300));
      const ol = (await page.evaluate(() => LOG)).filter((m) => m.method === "ui/open-link");
      t("tap -> ui/open-link with our page URL", ol.length === 1 && ol[0].params.url === SAMPLE.items[2].page_url, JSON.stringify(ol));
      t("tap did not navigate the iframe", (await frame.evaluate(() => location.href)) === "about:srcdoc");
    }
    await page.close();
  }
  // ChatGPT bridge (window.openai)
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 900 }); await serve(page);
  await page.evaluateOnNewDocument((data) => { window.__opened = []; window.openai = { toolOutput: data, theme: "light", openExternal: (o) => window.__opened.push(o.href), notifyIntrinsicHeight: (h) => { window.__h = h; } }; }, SAMPLE);
  await page.goto("data:text/html;charset=utf-8," + encodeURIComponent(GALLERY_HTML), { waitUntil: "load" });
  await page.waitForSelector("a.card");
  t("openai: 6 cards from toolOutput", (await page.$$eval("a.card", (a) => a.length)) === 6);
  await page.click("a.card:nth-child(1)");
  t("openai: tap -> openExternal({href})", JSON.stringify(await page.evaluate(() => window.__opened)) === JSON.stringify([SAMPLE.items[0].page_url]));
  // a non-madegooddesigns URL is never rendered or opened
  await page.evaluate(() => { window.openai.toolOutput = { items: [{ id: "x", title: "Evil", page_url: "https://evil.example/", image_url: "https://evil.example/a.jpg" }] }; window.dispatchEvent(new Event("openai:set_globals")); });
  t("foreign page/image URLs are dropped", (await page.$$eval("a.card", (a) => a.length)) === 0);
  await page.close();
} finally { await browser.close(); }
console.log(`screenshots: ${OUT}gallery.png ${OUT}gallery-390.png ${OUT}gallery-390-dark.png`);
console.log(`${ok} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
