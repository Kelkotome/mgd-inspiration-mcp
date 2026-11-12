// Writes tests/mcp_r3_base_tools.json from a source tree (the base = fdf92f8, the live Worker 9a4267d5): tool names, a hash of each
// inputSchema, each description's length, tools/list byte sizes and the instructions' lengths. Usage: node … snapshot_base.mjs <root>
import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
const root = process.argv[2];
const { default: w } = await import(root + "/src/index.js");
const env = { BASE_PATH: "/inspiration", DB: { prepare: () => ({ bind() { return this; }, run: async () => ({}), first: async () => null, all: async () => ({ results: [] }) }) } };
const call = async (method, path, hdr = {}) => (await w.fetch(new Request("https://madegooddesigns.com/inspiration" + path, { method: "POST", headers: { "Content-Type": "application/json", ...hdr }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params: {} }) }), env, { waitUntil() {} })).text();
const tl = await call("tools/list", "/mcp"), tls = await call("tools/list", "/mcp", { "MCP-Protocol-Version": "2025-06-18" }), tlc = await call("tools/list", "/mcp/core");
const tools = JSON.parse(tl).result.tools;
const out = { source: root, bytes: { mcp: Buffer.byteLength(tl), mcp_structured: Buffer.byteLength(tls), core: Buffer.byteLength(tlc) },
  instructions: { mcp: JSON.parse(await call("initialize", "/mcp")).result.instructions.length, core: JSON.parse(await call("initialize", "/mcp/core")).result.instructions.length },
  tools: tools.map((t) => ({ name: t.name, schema: createHash("sha256").update(JSON.stringify(t.inputSchema)).digest("hex").slice(0, 16), desc_len: t.description.length })) };
writeFileSync(new URL("../mcp_r3_base_tools.json", import.meta.url), JSON.stringify(out, null, 1));
console.log(out.bytes, out.instructions, out.tools.length);
