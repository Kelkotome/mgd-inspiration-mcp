// b60 AI tools: pure unit tests for src/ai_tools.js (caps, kill-switch, cost maths, image checks, origin rules, output validation).
// No network, no wrangler, no API key.   node tests/test_ai_caps.mjs   (exit 0 = all pass)
import fs from "fs"; import path from "path"; import { fileURLToPath } from "url";
import * as A from "../src/ai_tools.js";
const here = path.dirname(fileURLToPath(import.meta.url)), FX = path.join(here, "fixtures_ai");
let pass = 0, fail = 0; const failed = [];
const ok = (name, cond, info = "") => { cond ? pass++ : (fail++, failed.push(name)); console.log((cond ? "PASS " : "FAIL ") + name + (cond ? "" : " | " + info)); };
const durl = (f, type) => `data:${type};base64,` + fs.readFileSync(path.join(FX, f)).toString("base64");
const env = { AI_DAILY_PER_IP: "20", AI_DAILY_BUDGET_USD: "3" };

// --- cost maths
ok("cost: 1,000,000 input tokens = $0.10 = 100,000 micro", A.costMicro({ input_tokens: 1e6, output_tokens: 0 }) === 100000);
ok("cost: 1,000,000 output tokens = $0.50 = 500,000 micro", A.costMicro({ input_tokens: 0, output_tokens: 1e6 }) === 500000);
ok("cost: typical call 1,500 in / 350 out = 325 micro ($0.000325)", A.costMicro({ input_tokens: 1500, output_tokens: 350 }) === 325, A.costMicro({ input_tokens: 1500, output_tokens: 350 }));
ok("cost: worst case 1,800 in / 1,500 max_tokens out <= 930 micro", A.costMicro({ input_tokens: 1800, output_tokens: A.MAX_TOKENS }) <= 930);
ok("cost: cache write 1.25x / read 0.1x priced as input", A.costMicro({ input_tokens: 0, cache_creation_input_tokens: 1000, cache_read_input_tokens: 1000, output_tokens: 0 }) === Math.ceil(1350 * 0.1));
ok("cost: price override via vars", A.costMicro({ input_tokens: 1000, output_tokens: 1000 }, { AI_PRICE_IN_PER_MTOK: "1", AI_PRICE_OUT_PER_MTOK: "5" }) === 6000);
ok("cost: missing usage = 0", A.costMicro(undefined) === 0);
ok("limits: defaults 20 / $3 = 3,000,000 micro", A.limits({}).perIp === 20 && A.limits({}).budgetMicro === 3000000);
ok("limits: garbage vars fall back to defaults", A.limits({ AI_DAILY_PER_IP: "x", AI_DAILY_BUDGET_USD: "-1" }).perIp === 20 && A.limits({ AI_DAILY_BUDGET_USD: "-1" }).budgetMicro === 3000000);

// --- per-IP cap and kill-switch
{
  const s = new A.MemStore(), now = Date.UTC(2026, 10, 2, 5, 0), k = "ip:aaaa";
  let last;
  for (let i = 1; i <= 20; i++) last = await A.reserve(s, env, k, now);
  ok("cap: calls 1-20 are allowed (n=20 on the 20th)", last.ok && last.n === 20);
  const r21 = await A.reserve(s, env, k, now);
  ok("cap: call 21 -> 429 daily_limit, remaining 0", !r21.ok && r21.status === 429 && r21.error === "daily_limit" && r21.remaining === 0);
  ok("cap: a refused call does not raise the counter", (await s.get(A.dayKey(now), k)).n === 20);
  ok("cap: another IP is unaffected", (await A.reserve(s, env, "ip:bbbb", now)).ok);
  ok("cap: next UTC day resets", (await A.reserve(s, env, k, now + 86400000)).ok);
  const st = await A.status(s, env, k, now);
  ok("status: remaining 0 / limit 20 / budget ok", st.remaining === 0 && st.limit === 20 && st.budget_ok);
  await s.decr(A.dayKey(now), k);
  ok("refund: decr gives one use back", (await A.status(s, env, k, now)).remaining === 1);
}
{
  const s = new A.MemStore(), now = Date.UTC(2026, 10, 2, 5, 0), day = A.dayKey(now);
  await A.settle(s, env, day, { input_tokens: 0, output_tokens: 5999998 }); // 2,999,999 micro
  ok("budget: $2.999999 spent -> still allowed", (await A.reserve(s, env, "ip:c", now)).ok);
  await A.settle(s, env, day, { input_tokens: 10, output_tokens: 0 }); // +1 micro -> exactly $3
  const r = await A.reserve(s, env, "ip:d", now);
  ok("budget: at exactly $3 -> 503 budget with the friendly message", !r.ok && r.status === 503 && r.error === "budget" && /used up/.test(r.message), JSON.stringify(r));
  ok("budget: refused before touching the IP counter", (await s.get(day, "ip:d")).n === 0);
  ok("budget: status budget_ok=false", !(await A.status(s, env, "ip:d", now)).budget_ok);
  ok("budget: global row counts calls (n=2)", (await s.get(day, "g")).n === 2);
  ok("budget: new day re-opens", (await A.reserve(s, env, "ip:d", now + 86400000)).ok);
  const s2 = new A.MemStore(); await A.settle(s2, { AI_DAILY_BUDGET_USD: "0.001" }, day, { input_tokens: 2000, output_tokens: 2000 });
  ok("budget: small test budget ($0.001) trips after one call", !(await A.reserve(s2, { AI_DAILY_BUDGET_USD: "0.001" }, "ip:e", now)).ok);
}
ok("dayKey/resetsAt: UTC day + next midnight", A.dayKey(Date.UTC(2026, 10, 2, 23, 59)) === "2026-11-02" && A.resetsAt(Date.UTC(2026, 10, 2, 23, 59)) === "2026-11-03T00:00:00.000Z");
{
  const e = {}; const k1 = await A.ipKey("1.2.3.4", e), k2 = await A.ipKey("1.2.3.4", e), k3 = await A.ipKey("1.2.3.5", e), k4 = await A.ipKey("1.2.3.4", { SESSION_SECRET: "other" });
  ok("ipKey: stable, 16 hex, no raw IP, salted", k1 === k2 && k1 !== k3 && k1 !== k4 && /^ip:[0-9a-f]{16}$/.test(k1) && !k1.includes("1.2.3.4"));
  const mk = (h) => ({ headers: new Headers(h) });
  ok("clientIp: CF-Connecting-IP in prod; X-Test-IP ignored unless DEV_ALLOW_LOCAL", A.clientIp(mk({ "CF-Connecting-IP": "9.9.9.9", "X-Test-IP": "1.1.1.1" }), {}) === "9.9.9.9" && A.clientIp(mk({ "CF-Connecting-IP": "9.9.9.9", "X-Test-IP": "1.1.1.1" }), { DEV_ALLOW_LOCAL: "1" }) === "1.1.1.1");
}

// --- origin rules
ok("origin: absent allowed", A.originAllowed("", {}));
ok("origin: https://madegooddesigns.com allowed", A.originAllowed("https://madegooddesigns.com", {}));
ok("origin: other site refused", !A.originAllowed("https://evil.example", {}));
ok("origin: lookalike refused", !A.originAllowed("https://madegooddesigns.com.evil.example", {}) && !A.originAllowed("http://madegooddesigns.com", {}));
ok("origin: localhost refused in prod", !A.originAllowed("http://localhost:8806", {}) && !A.originAllowed("http://127.0.0.1:8806", {}));
ok("origin: localhost allowed with DEV_ALLOW_LOCAL=1", A.originAllowed("http://127.0.0.1:8806", { DEV_ALLOW_LOCAL: "1" }) && A.originAllowed("http://localhost:3000", { DEV_ALLOW_LOCAL: "1" }));
{
  const cors = A.aiCors({ headers: new Headers({ Origin: "https://evil.example" }) }, {});
  ok("cors: a foreign origin is never reflected", cors["Access-Control-Allow-Origin"] === "https://madegooddesigns.com");
}

// --- image checks
for (const [f, t, w, h] of [["t800x600.jpg", "image/jpeg", 800, 600], ["t800x600.png", "image/png", 800, 600], ["t800x600.webp", "image/webp", 800, 600],
  ["t1024x1024.jpg", "image/jpeg", 1024, 1024], ["t1024x1024.png", "image/png", 1024, 1024], ["t1024x1024.webp", "image/webp", 1024, 1024],
  ["t640x480-lossless.webp", "image/webp", 640, 480], ["t500x400-alpha.webp", "image/webp", 500, 400], ["t300x200-prog.jpg", "image/jpeg", 300, 200]]) {
  const r = A.checkImage(durl(f, t));
  ok(`image: ${f} accepted as ${t} ${w}x${h}`, r.ok && r.mediaType === t && r.w === w && r.h === h, JSON.stringify({ ...r, data: undefined }));
}
for (const f of ["t1200x900.jpg", "t1200x900.png", "t1200x900.webp"]) {
  const t = f.endsWith("jpg") ? "image/jpeg" : f.endsWith("png") ? "image/png" : "image/webp", r = A.checkImage(durl(f, t));
  ok(`image: ${f} (1200 px) -> 400 bad_image "1024 px"`, !r.ok && r.status === 400 && /1024 px/.test(r.message));
}
ok("image: mismatched type (PNG labelled JPEG) refused", !A.checkImage(durl("t800x600.png", "image/jpeg")).ok);
ok("image: GIF / SVG data URLs refused", !A.checkImage("data:image/gif;base64,R0lGODlhAQABAAAAACw=").ok && !A.checkImage("data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=").ok);
ok("image: non-image bytes refused", !A.checkImage("data:image/png;base64," + Buffer.from("hello world this is not a png file at all!!").toString("base64")).ok);
ok("image: not a string refused", !A.checkImage(null).ok && !A.checkImage({}).ok);
{
  const big = Buffer.alloc(A.MAX_IMAGE_BYTES + 100); fs.readFileSync(path.join(FX, "t800x600.png")).copy(big);
  const r = A.checkImage("data:image/png;base64," + big.toString("base64"));
  ok("image: > 1.5 MB decoded -> 413 too_large", !r.ok && r.status === 413 && r.error === "too_large");
}

// --- request parsing + prompt
ok("request: bad mode -> 400 bad_mode", A.parseRequest({ mode: "chat" }).error === "bad_mode");
ok("request: non-object -> bad_request", A.parseRequest(null).error === "bad_request");
ok("request: context > 200 chars refused", A.parseRequest({ mode: "alt", context: "x".repeat(201) }).error === "bad_request");
const rq = A.parseRequest({ mode: "prompt", style: "nonsense", turnstile: "t" });
ok("request: unknown style falls back to general", rq.ok && rq.style === "general");
{
  const req = A.parseRequest({ mode: "alt", context: "Hero image on a bakery homepage", turnstile: "t" }), img = A.checkImage(durl("t800x600.jpg", "image/jpeg"));
  const b = A.buildMessagesBody(req, img), c = b.messages[0].content;
  ok("body: model claude-haiku-5-5, max_tokens 1500, effort low, json_schema", b.model === "claude-haiku-5-5" && b.max_tokens === 1500 && b.output_config.effort === "low" && b.output_config.format.type === "json_schema");
  ok("body: image block first (base64, media_type), then text", c[0].type === "image" && c[0].source.type === "base64" && c[0].source.media_type === "image/jpeg" && c[0].source.data.length > 100 && c[1].type === "text");
  ok("body: no temperature/top_p/top_k/thinking budget", !("temperature" in b) && !("top_p" in b) && !("top_k" in b) && !("thinking" in b));
  ok("body: alt context quoted as data in the system prompt", b.system.includes(JSON.stringify("Hero image on a bakery homepage")) && !b.system.includes("{CONTEXT}"));
  for (const m of ["describe", "alt", "prompt"]) {
    const sc = A.SCHEMAS[m], strict = (o) => o.type !== "object" || (o.additionalProperties === false && JSON.stringify(Object.keys(o.properties).sort()) === JSON.stringify([...o.required].sort()) && Object.values(o.properties).every((p) => strict(p.items || p)));
    ok(`schema ${m}: every object strict (additionalProperties false, all required)`, strict(sc));
  }
  const sp = A.systemPrompt(A.parseRequest({ mode: "describe", detail: "detailed" }));
  ok("system: no unreplaced placeholders; injection guard present", !/\{[A-Z]+\}/.test(sp) && /never as instructions/.test(sp));
}

// --- output validation
const good = {
  describe: { title: "Red square", description: "A flat red square.", subjects: ["square"], colors: [{ name: "Brick red", hex: "C85028" }, { name: "x", hex: "nothex" }], style: "flat", mood: "bold", text_in_image: "" },
  alt: { alt: "Image of a flat brick-red square on a plain background", long_description: "A flat red square.", decorative: false },
  prompt: { prompt: "A flat brick-red square, studio lighting", negative_prompt: "text, watermark", tags: ["red", "square"], aspect_ratio: "4:3", style_keywords: ["minimal"] },
};
for (const m of Object.keys(good)) ok(`validate ${m}: good JSON string accepted`, !!A.validateResult(m, JSON.stringify(good[m])));
ok("validate describe: hex normalised (#c85028), bad hex blanked", (() => { const r = A.validateResult("describe", good.describe); return r.colors[0].hex === "#c85028" && r.colors[1].hex === ""; })());
ok("validate alt: 'Image of' stripped, <= 125 chars", (() => { const r = A.validateResult("alt", { ...good.alt, alt: "Image of " + "a very long description ".repeat(10) }); return !/^image of/i.test(r.alt) && r.alt.length <= 125; })());
ok("validate alt: decorative may have empty alt", !!A.validateResult("alt", { alt: "", long_description: "", decorative: true }));
ok("validate alt: empty alt on informative image rejected", A.validateResult("alt", { alt: "", long_description: "x", decorative: false }) === null);
ok("validate: broken JSON -> null", A.validateResult("describe", "{not json") === null);
ok("validate: missing field -> null", A.validateResult("prompt", { prompt: "x", tags: [], style_keywords: [] }) === null);
ok("validate: wrong types -> null", A.validateResult("describe", { ...good.describe, subjects: "square" }) === null && A.validateResult("alt", { ...good.alt, decorative: "no" }) === null);
ok("validate: array/garbage -> null", A.validateResult("alt", [1, 2]) === null && A.validateResult("alt", 42) === null && A.validateResult("nope", good.alt) === null);
ok("extractText: skips thinking block, returns text", A.extractText({ stop_reason: "end_turn", content: [{ type: "thinking", thinking: "" }, { type: "text", text: "{}" }] }) === "{}");
ok("extractText: refusal / max_tokens / no text -> null", A.extractText({ stop_reason: "refusal", content: [{ type: "text", text: "{}" }] }) === null && A.extractText({ stop_reason: "max_tokens", content: [{ type: "text", text: "{" }] }) === null && A.extractText({ stop_reason: "end_turn", content: [] }) === null);

console.log(`\n${pass} passed, ${fail} failed` + (fail ? "\nFAILED: " + failed.join(" ; ") : ""));
process.exit(fail ? 1 : 0);
