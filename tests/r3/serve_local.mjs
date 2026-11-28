// Local preview: serve the Worker in Node against tests/r3/.data/live.sqlite on 127.0.0.1:PORT (default 8788). Images proxy to the live site.
// Run: node --no-warnings --import=./tests/r3/register.mjs tests/r3/serve_local.mjs [port]
import http from "node:http";
import { openDb, makeEnv } from "./env.mjs";
globalThis.caches = { default: { async match() {}, async put() {}, async delete() { return false; } } }; // no edge cache: always render fresh (the test shim replays bodies as JSON)
const { default: worker } = await import("../../src/index.js");
const E = makeEnv(openDb(), { version: "local-preview" });
const port = +(process.argv[2] || 8788);
http.createServer(async (req, res) => {
  try {
    if (/^\/inspiration\/img\//.test(req.url)) { res.writeHead(302, { Location: "https://madegooddesigns.com" + req.url }); return res.end(); }
    const r = await worker.fetch(new Request("https://madegooddesigns.com" + req.url, { headers: { "User-Agent": "curl/8.4.0" }, redirect: "manual" }), E.env, { waitUntil() {}, passThroughOnException() {} });
    const h = {}; r.headers.forEach((v, k) => { h[k] = k === "location" ? v.replace("https://madegooddesigns.com", "") : v; });
    res.writeHead(r.status, h); res.end(Buffer.from(await r.arrayBuffer()));
  } catch (e) { res.writeHead(500); res.end(String(e.stack)); }
}).listen(port, "127.0.0.1", () => console.log("http://127.0.0.1:" + port + "/inspiration/ui/website-templates"));
