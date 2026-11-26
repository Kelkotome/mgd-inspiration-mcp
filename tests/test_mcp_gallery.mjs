// mcp-img-r1: unit checks for src/mcp_gallery.js (no Worker runtime): thumbnail fallbacks, errors and timeouts never fail a call,
// <= 3 image blocks, kill switch, item shape, resources/read. Run: node tests/test_mcp_gallery.mjs   (prints "N passed, M failed")
import * as G from "../src/mcp_gallery.js";
let ok = 0, fail = 0;
const t = (n, c, info) => { c ? ok++ : fail++; if (!c) console.log("FAIL " + n + " | " + String(info).slice(0, 300)); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const JPG = (n) => { const b = new Uint8Array(n); b.set([0xff, 0xd8, 0xff, 0xe0]); return b; };
const obj = (bytes, ct) => ({ arrayBuffer: async () => bytes.buffer.slice(0), httpMetadata: ct ? { contentType: ct } : {} });
function bucket(files, opt = {}) {
  const puts = [];
  return { puts, async get(k) { if (opt.slow) await sleep(opt.slow); if (opt.throws) throw new Error("r2 down"); const f = files[k]; return f ? obj(f.bytes, f.ct) : null; },
    async put(k, v) { puts.push([k, v.byteLength]); } };
}
const images = (outBytes, opt = {}) => ({ input() { if (opt.throws) throw new Error("images quota"); return { transform() { return { output: async () => ({ response: () => new Response(outBytes) }) }; } }; } });
const res = (keys) => ({ content: [{ type: "text", text: "x" }], structuredContent: { items: keys.map((k, i) => ({ id: "i" + i, title: "t", page_url: "https://madegooddesigns.com/inspiration/#i/i" + i, image_url: "https://madegooddesigns.com/inspiration/img/" + k })) } });
const imgs = (r) => r.content.filter((c) => c.type === "image");

// 1. small originals are used as-is; big ones skipped without a binding
{
  const env = { BUCKET: bucket({ "museum/a.jpg": { bytes: JPG(20000), ct: "image/jpeg" }, "museum/b.jpg": { bytes: JPG(200000) }, "items/c.png": { bytes: JPG(1000), ct: "image/png" }, "items/d.png": { bytes: JPG(1000) } }) };
  const r = await G.addThumbBlocks(res(["museum/a.jpg", "museum/b.jpg", "items/c.png", "items/d.png"]), env, null);
  t("no binding: small used, big skipped, only top 3 considered", imgs(r).length === 2, imgs(r).length);
  t("no binding: mime from R2 metadata", imgs(r)[1] && imgs(r)[1].mimeType === "image/png", imgs(r)[1] && imgs(r)[1].mimeType);
  t("valid base64", Buffer.from(imgs(r)[0].data, "base64").length === 20000);
}
// 2. binding resizes big ones and stores thumb/… (deferred); oversized output -> second pass, then skip
{
  const env = { BUCKET: bucket({ "museum/b.jpg": { bytes: JPG(200000) } }), IMAGES: images(JPG(30000)) };
  const deferred = []; const r = await G.addThumbBlocks(res(["museum/b.jpg"]), env, (p) => deferred.push(p));
  await Promise.all(deferred);
  t("binding: resized image block", imgs(r).length === 1 && imgs(r)[0].mimeType === "image/jpeg");
  t("binding: thumb stored to R2", env.BUCKET.puts.length === 1 && env.BUCKET.puts[0][0] === "thumb/museum/b.jpg.jpg", JSON.stringify(env.BUCKET.puts));
  const env2 = { BUCKET: bucket({ "museum/b2.jpg": { bytes: JPG(200000) } }), IMAGES: images(JPG(90000)) };
  t("binding: output still > 60 KB -> skipped", imgs(await G.addThumbBlocks(res(["museum/b2.jpg"]), env2, null)).length === 0);
  const env3 = { BUCKET: bucket({ "museum/b3.jpg": { bytes: JPG(200000) } }), IMAGES: images(JPG(30000)), MCP_THUMB_STORE: "0" };
  await G.addThumbBlocks(res(["museum/b3.jpg"]), env3, null);
  t("MCP_THUMB_STORE=0: nothing written", env3.BUCKET.puts.length === 0);
}
// 3. stored thumbnail wins (no Images call)
{
  let called = 0;
  const env = { BUCKET: bucket({ "thumb/items/e.png.jpg": { bytes: JPG(15000) }, "items/e.png": { bytes: JPG(300000) } }), IMAGES: { input() { called++; throw new Error("x"); } } };
  const r = await G.addThumbBlocks(res(["items/e.png"]), env, null);
  t("stored thumb used, no resize", imgs(r).length === 1 && called === 0 && imgs(r)[0].mimeType === "image/jpeg");
}
// 4. errors and timeouts never fail the call
{
  const r = await G.addThumbBlocks(res(["museum/x1.jpg"]), { BUCKET: bucket({}, { throws: true }) }, null);
  t("R2 error -> no image, text kept", imgs(r).length === 0 && r.content[0].text === "x");
  const env = { BUCKET: bucket({ "museum/f.jpg": { bytes: JPG(200000) } }), IMAGES: images(null, { throws: true }) };
  t("Images error -> big skipped", imgs(await G.addThumbBlocks(res(["museum/f.jpg"]), env, null)).length === 0);
  const t0 = Date.now();
  const r2 = await G.addThumbBlocks(res(["museum/slow1.jpg"]), { BUCKET: bucket({ "museum/slow1.jpg": { bytes: JPG(100) } }, { slow: 4000 }) }, null);
  t("slow R2 -> gives up within the budget", Date.now() - t0 < 3200 && imgs(r2).length === 0, Date.now() - t0);
  t("bad key ignored", imgs(await G.addThumbBlocks(res(["../etc/passwd"]), { BUCKET: bucket({ "../etc/passwd": { bytes: JPG(10) } }) }, null)).length === 0);
  t("isError result untouched", (await G.addThumbBlocks({ isError: true, content: [{ type: "text", text: "e" }] }, {}, null)).content.length === 1);
  t("MCP_THUMBS=0 kill switch", imgs(await G.addThumbBlocks(res(["museum/a.jpg"]), { MCP_THUMBS: "0", BUCKET: bucket({ "museum/a.jpg": { bytes: JPG(100) } }) }, null)).length === 0);
}
// 5. item shape
{
  const site = "https://madegooddesigns.com/inspiration";
  const m = G.galleryItem({ id: "abc", title: "Vase", image: "/img/museum/abc.jpg", collection: "museum", artist: "A. Artist", year: 1720, museum: "The Met", license: "CC0", source: "The Met" }, site + "/museum/vase-1720-abc", site, false);
  t("museum item", m.subtitle === "A. Artist, 1720 · The Met" && m.thumb_url === site + "/img/t/museum/abc.jpg" && m.image_url === site + "/img/museum/abc.jpg" && m.licence === "CC0", JSON.stringify(m));
  t("link-only -> null", G.galleryItem({ id: "x" }, null, site, true) === null);
}
// 6. resources
{
  const l = G.galleryRpc("resources/list"); t("resources/list", l.resources[0].uri === G.GALLERY_URI && l.resources[0].mimeType === "text/html;profile=mcp-app");
  const r = G.galleryRpc("resources/read", { uri: G.GALLERY_URI }); t("resources/read html", r.contents[0].text === G.GALLERY_HTML && r.contents[0]._meta.ui.csp.resourceDomains[0] === "https://madegooddesigns.com");
  t("resources/read unknown -> error", G.galleryRpc("resources/read", { uri: "ui://x" }).error.code === -32002);
  t("other methods not handled", G.galleryRpc("tools/list") === undefined);
  t("widget HTML < 12 KB", G.GALLERY_HTML.length < 12000, G.GALLERY_HTML.length);
}
console.log(`${ok} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
