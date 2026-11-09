// mcp-errors-r1 (9-Nov-2026): unit tests for the stateless tools in tests/mcp_errors_r1_cases.json (no Worker, no D1), routed the
// way src/index.js routes them (b73 mockup products before b69). design_md_from_references and the usage hint are covered by the
// JSON-RPC replay (tests/mcp_errors_r1_rpc.py) in tests/mcp_errors_local_e2e.sh.
// Run: node --no-warnings tests/test_mcp_errors_r1.mjs   (prints "N passed, M failed", exits 1 on failure)
import { readFileSync } from "node:fs";
import { callTools48Tool } from "../src/mcp_tools48.js";
import { callTools50Tool } from "../src/mcp_tools50.js";
import { callTools51Tool } from "../src/mcp_tools51.js";
import { callTools63Tool } from "../src/mcp_tools63.js";
import { callTools69Tool } from "../src/mcp_tools69.js";
import { callTools73Tool, isMockup73Call } from "../src/mcp_tools73.js";
import { callTools78Tool } from "../src/mcp_tools78.js";

const ROUTE = {
  check_contrast: callTools48Tool, get_book_cover_size: callTools50Tool, get_screw_specs: callTools51Tool,
  get_sheet_metal_gauge: callTools63Tool, get_desk_ergonomics: callTools63Tool, get_banner_spec: callTools73Tool, get_sign_letter_height: callTools78Tool,
  get_mockup_print_area: (n, a) => (isMockup73Call(n, a) ? callTools73Tool(n, a) : callTools69Tool(n, a)),
};
const { cases } = JSON.parse(readFileSync(new URL("./mcp_errors_r1_cases.json", import.meta.url)));
let ok = 0, fail = 0;
const t = (name, cond, info) => { cond ? ok++ : fail++; console.log((cond ? "PASS " : "FAIL ") + name + (cond ? "" : " | " + String(info).slice(0, 300))); };
for (const c of cases) {
  const f = ROUTE[c.tool]; if (!f) continue;
  let r;
  try { r = await f(c.tool, JSON.parse(JSON.stringify(c.args))); } catch (e) { t(`${c.tool} ${JSON.stringify(c.args)}`, false, "threw " + e.message); continue; }
  const text = (r.content || []).map((x) => x.text || "").join("\n"), want = c.want_any || [c.want];
  t(`${c.tool} ${JSON.stringify(c.args).slice(0, 70)}`, !!r.isError === !!c.err && want.some((w) => text.includes(w)) && !/ failed: /.test(text.slice(0, 200)), `isError=${r.isError} ${text.slice(0, 200)}`);
}
// the caller's object is not changed (handlers copy before normalising)
const a = { product: "T-shirt", area: "front" }; await ROUTE.get_mockup_print_area("get_mockup_print_area", a);
t("args not mutated", a.product === "T-shirt" && a.area === "front", JSON.stringify(a));
// every no-argument call of the 7 tools that failed on 5-Nov is now an ordinary answer with structured content
for (const n of ["get_mockup_print_area", "get_sign_letter_height", "get_sheet_metal_gauge", "get_screw_specs", "get_book_cover_size", "get_desk_ergonomics", "get_banner_spec"]) {
  const r = await ROUTE[n](n, {}); t(`${n} {} has structuredContent`, !r.isError && r.structuredContent && typeof r.structuredContent === "object", JSON.stringify(r).slice(0, 200));
}
console.log(`${ok} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
