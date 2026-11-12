// tools/list + initialize sizes for the src at argv[2]
const root = process.argv[2];
const { default: w } = await import(root + "/src/index.js");
const env = { BASE_PATH: "/inspiration", DB: { prepare: () => ({ bind() { return this; }, run: async () => ({}), first: async () => null, all: async () => ({ results: [] }) }) } };
const call = async (method, path, hdr = {}) => { const r = await w.fetch(new Request("https://madegooddesigns.com/inspiration" + path, { method: "POST", headers: { "Content-Type": "application/json", ...hdr }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params: {} }) }), env, { waitUntil() {} }); return r.text(); };
for (const [path, hdr, lab] of [["/mcp", {}, "tools/list /mcp"], ["/mcp", { "MCP-Protocol-Version": "2025-06-18" }, "tools/list /mcp (2025-06-18, outputSchema)"], ["/mcp/core", {}, "tools/list /mcp/core"]]) {
  const t = await call("tools/list", path, hdr); const j = JSON.parse(t);
  console.log(lab, Buffer.byteLength(t), "bytes,", j.result.tools.length, "tools");
}
const i = JSON.parse(await call("initialize", "/mcp")); console.log("instructions /mcp", i.result.instructions.length, "chars");
const ic = JSON.parse(await call("initialize", "/mcp/core")); console.log("instructions /mcp/core", ic.result.instructions.length, "chars");
if (process.argv[3]) { const j = JSON.parse(await call("tools/list", "/mcp")); for (const n of process.argv[3].split(",")) { const x = j.result.tools.find((t) => t.name === n); console.log("\n### " + n + " (" + x.description.length + ")\n" + x.description); } }
