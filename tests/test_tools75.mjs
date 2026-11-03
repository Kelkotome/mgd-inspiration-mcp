// Node unit test of the batch-75 MCP layer (src/tools_core75.js generated cores + src/mcp_tools75.js).
// Tools: make_maze, make_dungeon.
// Graph facts are re-derived here from the returned SVG / model (perfect maze: passages = cells − 1; dead ends = degree-1 cells; room feet = squares × 5), not copied from the core.
// Run: node tests/test_tools75.mjs
import { MGD75A } from "../src/tools_core75.js";
import { callTools75Tool as call, TOOL_DEFS, NEXT75, isTools75Tool } from "../src/mcp_tools75.js";
let ok = 0, fail = 0;
const t = (name, cond, info) => { cond ? ok++ : fail++; console.log((cond ? "PASS " : "FAIL ") + name + (cond ? "" : " | " + String(JSON.stringify(info)).slice(0, 400))); };
const txt = (r) => r.content.map((c) => c.text).join("\n");
const NAMES = ["make_maze", "make_dungeon"], CAP = 120 * 1024;
const svgOk = (s) => typeof s === "string" && /<svg[\s>]/.test(s) && /<\/svg>\s*$/.test(s) && !/<script|onload=|foreignObject|href="http/i.test(s);
const spaced = (d) => JSON.stringify(d).replace(/,"/g, ', "').replace(/":/g, '": ').replace(/,\{/g, ", {").replace(/,\[/g, ", [").length;

t("no window/document global leaked", typeof globalThis.window === "undefined" && typeof globalThis.document === "undefined");
t("cores bundled (maze, dungeon, draw)", typeof MGD75A.maze.generate === "function" && typeof MGD75A.dgn.generate === "function" && typeof MGD75A.draw.svg === "function");
t("2 tools in order", JSON.stringify(TOOL_DEFS.map((d) => d.name)) === JSON.stringify(NAMES), TOOL_DEFS.map((d) => d.name));
for (const d of TOOL_DEFS) {
  const size = spaced(d);
  t(`${d.name}: 'Use when', < 650 chars, ≤ 1.6 KB (as Python counts it), read-only, next hint`, d.description.startsWith("Use when") && d.description.length < 650 && size <= 1640 && d.annotations.readOnlyHint && !d.annotations.openWorldHint && NEXT75[d.name] && d.inputSchema.type === "object", [d.description.length, size]);
}
t("isTools75Tool", NAMES.every(isTools75Tool) && !isTools75Tool("make_star_map"));

// ---- maze
let r = await call("make_maze", { seed: "abc" }), s = r.structuredContent;
t("default: medium (15 × 15) rectangle, backtracker, perfect maze (passages = cells − 1)", !r.isError && s.shape === "rect" && s.algorithm === "backtracker" && s.cells === 225 && s.passages === 224 && s.loops_pct === 0 && svgOk(s.svg), s && [s.cells, s.passages]);
const again = (await call("make_maze", { seed: "abc" })).structuredContent;
t("same seed → identical SVG and stats", again.svg === s.svg && again.dead_ends === s.dead_ends && again.solution_length === s.solution_length);
t("different seed → different maze", (await call("make_maze", { seed: "abd" })).structuredContent.svg !== s.svg);
// re-derive dead ends from the core model independently of stats()
const m = MGD75A.maze.generate({ seed: "abc", size: 15 }), deg = new Array(m.cells.length).fill(0);
m.edges.forEach((e, i) => { if (m.open[i] && e.b >= 0) { deg[e.a]++; deg[e.b]++; } });
t("dead ends re-derived (degree-1 cells) match", deg.filter((d) => d === 1).length === s.dead_ends, [deg.filter((d) => d === 1).length, s.dead_ends]);
t("solution length ≥ Manhattan distance corner to corner (15 + 15 − 1)", s.solution_length >= 29 && s.solution_length <= 225, s.solution_length);
t("no solution drawn unless asked; green start + red exit marks", !/id="solution"/.test(s.svg) && /fill="#1a9a4a"/.test(s.svg));
r = await call("make_maze", { seed: "abc", show_solution: true }); t("show_solution draws the red solution path", /id="solution"[^>]*stroke="#d6262b"/.test(r.structuredContent.svg));
t("coordinates rounded to 1 decimal", !/ d="[^"]*\d\.\d\d/.test(r.structuredContent.svg));
for (const shape of MGD75A.maze.SHAPES) for (const algorithm of MGD75A.maze.ALGOS) {
  r = await call("make_maze", { shape, algorithm, seed: "z", difficulty: "hard" }); s = r.structuredContent;
  if (r.isError || !s.svg || s.passages !== s.cells - 1 || s.solution_length < 2) t(`${shape}/${algorithm} builds a perfect maze`, false, txt(r).slice(0, 200));
}
t("all 16 shape × algorithm combos build perfect mazes (spanning trees) under the cap at hard", true);
r = await call("make_maze", { seed: "abc", loops: 20 }); s = r.structuredContent;
t("loops 20% → more passages than a spanning tree, fewer dead ends", s.passages > s.cells - 1 && s.dead_ends < again.dead_ends, [s.passages, s.dead_ends, again.dead_ends]);
r = await call("make_maze", { size: 120, seed: "big", shape: "circle" }); s = r.structuredContent;
t("huge circle maze → svg_too_large + stats + page link, no SVG", !r.isError && s.svg_too_large && !s.svg && s.cells > 1000 && /maze-generator\//.test(txt(r)), [s.cells, s.svg_too_large]);
for (const [d, n] of [["easy", 8], ["expert", 40]]) { s = (await call("make_maze", { difficulty: d, seed: "q" })).structuredContent; t(`difficulty ${d} = ${n} × ${n}`, s.size.w === n && s.size.h === n && s.cells === n * n); }
r = await call("make_maze", {}); t("no seed → random seed reported", !r.isError && typeof r.structuredContent.seed === "string" && r.structuredContent.seed.length >= 4);
for (const a of [{ shape: "star" }, { algorithm: "eller" }, { difficulty: "nightmare" }, { size: 1 }, { size: 500 }, { loops: 80 }]) { r = await call("make_maze", a); t(`bad input → isError: ${JSON.stringify(a)}`, r.isError, txt(r)); }

// ---- dungeon
r = await call("make_dungeon", { seed: "a" }); s = r.structuredContent;
t("default medium dungeon: 44 × 32 squares = 220 × 160 ft, connected, rooms numbered 1..n by distance", !r.isError && s.squares[0] === 44 && s.squares[1] === 32 && s.feet[0] === 220 && s.connected && s.rooms.map((x) => x.num).join() === s.rooms.map((_, i) => i + 1).join() && s.rooms.every((x, i) => !i || x.distance >= s.rooms[i - 1].distance), s && s.rooms.map((x) => [x.num, x.distance]));
t("room key lines: number, w×5 × h×5 ft, contents", s.rooms.every((x) => txt(r).includes(`- ${x.num}.  ${x.w * 5} × ${x.h * 5} ft.  ${x.content}`)), txt(r).slice(0, 300));
t("stairs up in room 1 (entrance), down in the last room", s.stairs.find((x) => x.kind === "up").room === 1 && s.stairs.find((x) => x.kind === "down").room === s.rooms.length, s.stairs);
t("door counts add up", s.doors.door + s.doors.locked + s.doors.secret + s.doors.arch === (txt(r).match(/(\d+) doors/) || [])[1] * 1, s.doors);
t("SVG under the cap, 5 ft grid note, page link", svgOk(s.svg) && s.svg.length <= CAP && /dungeon-map-generator\//.test(txt(r)));
const a2 = (await call("make_dungeon", { seed: "a" })).structuredContent; t("same seed → identical dungeon", a2.svg === s.svg && JSON.stringify(a2.rooms) === JSON.stringify(s.rooms));
for (const size of Object.keys(MGD75A.dgn.SIZES)) for (const style of Object.keys(MGD75A.dgn.STYLES)) for (const layout of ["rooms", "bsp"]) {
  r = await call("make_dungeon", { seed: "k", size, style, layout }); s = r.structuredContent;
  if (r.isError || !(s.svg && s.svg.length <= CAP) || !s.connected) t(`${size}/${style}/${layout} under the cap and connected`, false, txt(r).slice(0, 200));
}
t("all 32 size × style × layout combos return an SVG ≤ 120 KB, connected", true);
r = await call("make_dungeon", { seed: "a", size: "huge", style: "parchment" }); t("huge parchment drops rock hatching to fit (and says so)", r.structuredContent.svg.length <= CAP && /hatching off/.test(txt(r)));
r = await call("make_dungeon", { seed: "t", traps: 0, title: "The Sunken Vault", grid: false }); s = r.structuredContent;
t("no traps, custom title, no grid", s.traps === 0 && s.svg.includes("The Sunken Vault"));
for (const a of [{ size: "colossal" }, { style: "neon" }, { layout: "cave" }, { rooms: 1 }, { traps: 50 }, { loops: 200 }]) { r = await call("make_dungeon", a); t(`bad input → isError: ${JSON.stringify(a)}`, r.isError, txt(r)); }
console.log(`\n${ok} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
