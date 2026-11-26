// mcp-img-r1: unit checks for src/mcp_gallery.js (no Worker runtime): thumbnail fallbacks, errors and timeouts never fail a call,
// <= 3 image blocks, kill switch, item shape, resources/read. Run: node tests/test_mcp_gallery.mjs   (prints "N passed, M failed")
import * as G from "../src/mcp_gallery.js";
let ok = 0, fail = 0;
const t = (n, c, info) => { c ? ok++ : fail++; if (!c) console.log("FAIL " + n + " | " + String(info).slice(0, 300)); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const JPG = (n) => { const b = new Uint8Array(n); b.set([0xff, 0xd8, 0xff, 0xe0]); return b; };
const obj = (bytes, ct) => ({ arrayBuffer: async () => bytes.buffer.slice(0), text: async () => new TextDecoder().decode(bytes), httpMetadata: ct ? { contentType: ct } : {} });
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
  const thumbPuts = (bk) => bk.puts.filter((x) => !x[0].startsWith("thumb/_meta/"));
  t("binding: thumb stored to R2", thumbPuts(env.BUCKET).length === 1 && thumbPuts(env.BUCKET)[0][0] === "thumb/museum/b.jpg.jpg", JSON.stringify(env.BUCKET.puts));
  t("binding: transform counted in R2", env.BUCKET.puts.some((x) => x[0] === "thumb/_meta/transforms-" + G.monthKey() + ".json"), JSON.stringify(env.BUCKET.puts));
  const env2 = { BUCKET: bucket({ "museum/b2.jpg": { bytes: JPG(200000) } }), IMAGES: images(JPG(90000)) };
  t("binding: output still > 60 KB -> skipped", imgs(await G.addThumbBlocks(res(["museum/b2.jpg"]), env2, null)).length === 0);
  const env3 = { BUCKET: bucket({ "museum/b3.jpg": { bytes: JPG(200000) } }), IMAGES: images(JPG(30000)), MCP_THUMB_STORE: "0" };
  await G.addThumbBlocks(res(["museum/b3.jpg"]), env3, null);
  t("MCP_THUMB_STORE=0: no thumbnail written", thumbPuts(env3.BUCKET).length === 0, JSON.stringify(env3.BUCKET.puts));
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
// 7. monthly transform cap (R2 counter thumb/_meta/transforms-YYYY-MM.json)
{
  // a bucket whose put() really stores (counter read-modify-write)
  const store = (files = {}, opt = {}) => ({ files, async get(k) { if (opt.getThrows && /_meta/.test(k)) throw new Error("r2 down"); const f = files[k]; return f ? obj(f.bytes, f.ct) : null; },
    async put(k, v) { files[k] = { bytes: typeof v === "string" ? new TextEncoder().encode(v) : new Uint8Array(v) }; } });
  const counted = (bytes) => { const im = { calls: 0, input() { im.calls++; return { transform() { return { output: async () => ({ response: () => new Response(bytes) }) }; } }; } }; return im; };
  const month = G.monthKey(), ck = G.counterKey(month);
  const readC = (b, k = ck) => b.files[k] ? JSON.parse(new TextDecoder().decode(b.files[k].bytes)).count : 0;
  let uniq = 0;   // getThumb keeps a per-isolate memory of finished thumbnails, so every case uses fresh keys
  const big = (n) => { const p = "u" + (++uniq); return Object.fromEntries(Array.from({ length: n }, (_, i) => [`museum/${p}big${i}.jpg`, { bytes: JPG(200000) }])); };
  const keys = (b) => Object.keys(b.files).filter((k) => /big/.test(k));

  G._resetCapMemory();
  t("default cap 4900", G.monthlyCap({}) === 4900 && G.monthlyCap({ MCP_THUMB_MONTHLY_CAP: "" }) === 4900 && G.monthlyCap({ MCP_THUMB_MONTHLY_CAP: "abc" }) === 4900);
  t("env override", G.monthlyCap({ MCP_THUMB_MONTHLY_CAP: "10" }) === 10 && G.monthlyCap({ MCP_THUMB_MONTHLY_CAP: "0" }) === 0);

  // cap 2: two transforms, then none; small originals and stored thumbs keep working
  const b = store({ ...big(4), "annual/small.jpg": { bytes: JPG(30000) }, "thumb/items/s.png.jpg": { bytes: JPG(12000) }, "items/s.png": { bytes: JPG(300000) } });
  const im = counted(JPG(25000)), env = { BUCKET: b, IMAGES: im, MCP_THUMB_MONTHLY_CAP: "2" };
  const K = keys(b);
  const r1 = await G.addThumbBlocks(res([K[0], K[1]]), env, null);
  t("cap: first 2 transforms run", im.calls === 2 && imgs(r1).length === 2 && readC(b) === 2, `${im.calls} ${imgs(r1).length} ${readC(b)}`);
  const r2 = await G.addThumbBlocks(res([K[2], "annual/small.jpg", "items/s.png"]), env, null);
  t("cap reached: no transform called", im.calls === 2, im.calls);
  t("cap reached: small original + stored thumb still work, big gets none", imgs(r2).length === 2, imgs(r2).length);
  t("cap reached: counter not past the cap", readC(b) === 2, readC(b));
  const th = await G.serveThumb(K[3], env, null, "/inspiration");
  t("cap reached: /img/t/ redirects to the original", th.status === 302 && th.headers.get("Location").endsWith("/inspiration/img/" + K[3]) && im.calls === 2, th.status);

  // a counter left by other isolates (fresh memory) is honoured
  G._resetCapMemory();
  const b2 = store({ ...big(1), [ck]: { bytes: new TextEncoder().encode(JSON.stringify({ count: 4900 })) } }), im2 = counted(JPG(25000));
  await G.addThumbBlocks(res(keys(b2)), { BUCKET: b2, IMAGES: im2 }, null);
  t("stored count 4900 + default cap: no transform", im2.calls === 0 && keys(b2).length === 1, im2.calls);
  // control: the same setup with a lower stored count does transform
  G._resetCapMemory();
  const b2c = store({ ...big(1), [ck]: { bytes: new TextEncoder().encode(JSON.stringify({ count: 4899 })) } }), im2c = counted(JPG(25000));
  await G.addThumbBlocks(res(keys(b2c)), { BUCKET: b2c, IMAGES: im2c }, null);
  t("stored count 4899: one more transform, counter 4900", im2c.calls === 1 && readC(b2c) === 4900, `${im2c.calls} ${readC(b2c)}`);
  const st = await G.transformStats({ BUCKET: b2, IMAGES: im2 });
  t("transformStats read-only view", st.month === month && st.count === 4900 && st.cap === 4900 && st.capped === true && st.binding === true && st.key === ck, JSON.stringify(st));

  // failed transforms count too
  G._resetCapMemory();
  const b3 = store(big(1)); const im3 = { calls: 0, input() { im3.calls++; throw new Error("boom"); } };
  await G.addThumbBlocks(res(keys(b3)), { BUCKET: b3, IMAGES: im3 }, null);
  t("a failed transform attempt is counted", im3.calls === 1 && readC(b3) === 1, `${im3.calls} ${readC(b3)}`);

  // unreadable counter: fail closed
  G._resetCapMemory();
  const b4 = store(big(1), { getThrows: true }), im4 = counted(JPG(25000));
  await G.addThumbBlocks(res(keys(b4)), { BUCKET: b4, IMAGES: im4 }, null);
  t("counter unreadable: no transform", im4.calls === 0, im4.calls);

  // cap 0 = no transforms at all
  G._resetCapMemory();
  const im5 = counted(JPG(25000));
  const b5 = store(big(1)); await G.addThumbBlocks(res(keys(b5)), { BUCKET: b5, IMAGES: im5, MCP_THUMB_MONTHLY_CAP: "0" }, null);
  t("MCP_THUMB_MONTHLY_CAP=0: no transform", im5.calls === 0);

  // parallel reservations in one isolate: every increment lands (writes in order)
  G._resetCapMemory();
  const b7 = store({}), env7 = { BUCKET: b7, MCP_THUMB_MONTHLY_CAP: "5" };
  const got7 = await Promise.all(Array.from({ length: 8 }, () => G.reserveTransform(env7)));
  t("parallel: exactly 5 of 8 allowed, counter 5", got7.filter(Boolean).length === 5 && readC(b7) === 5, `${got7} ${readC(b7)}`);

  // month rollover (UTC): capped on 30 Nov 23:59, allowed again on 1 Dec 00:01 with a new counter object
  G._resetCapMemory();
  const b6 = store({}), env6 = { BUCKET: b6, MCP_THUMB_MONTHLY_CAP: "1" };
  const nov = Date.UTC(2026, 10, 30, 23, 59), dec = Date.UTC(2026, 11, 1, 0, 1);
  t("rollover: Nov first transform allowed", (await G.reserveTransform(env6, nov)) === true);
  t("rollover: Nov capped", (await G.reserveTransform(env6, nov)) === false);
  t("rollover: Dec allowed again", (await G.reserveTransform(env6, dec)) === true);
  t("rollover: separate counters", readC(b6, G.counterKey("2026-11")) === 1 && readC(b6, G.counterKey("2026-12")) === 1 && G.monthKey(dec) === "2026-12" && G.monthKey(nov) === "2026-11");
  // UTC, not local time: 1 Dec 00:30 UTC is still 30 Nov in New York
  t("month key is UTC", G.monthKey(Date.UTC(2026, 11, 1, 0, 30)) === "2026-12");
  G._resetCapMemory();
}
console.log(`${ok} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
