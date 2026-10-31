// Regression (31-Oct-2026): boards' DESIGN.md / palette neutrals must follow the board's primary hue,
// never the random-harmony accent hue (warm boards were getting blue-tinted backgrounds).
// Run: node tests/test_board_tint.mjs  (exit 0 = pass)
import { boardRolesFromWeights } from "../src/board_design.js";
import { MGDRoles } from "../src/design_core.js";
let fail = 0, n = 0;
const hd = (a, b) => { const d = Math.abs(a - b) % 360; return Math.min(d, 360 - d); };
const BOARDS = {
  terracotta_blue: { "#c4622d": 30, "#e0a458": 12, "#2b59c3": 10, "#f3e9dc": 8 },
  mustard_teal: { "#d4a017": 30, "#1b7f79": 12, "#fff8e7": 6 },
  red_only: { "#c0392b": 20 },
  navy_orange: { "#1f3a93": 30, "#f39c12": 15 },
};
for (const [name, w] of Object.entries(BOARDS)) {
  for (let i = 0; i < 300; i++) {
    const r = boardRolesFromWeights(w); n++;
    const ph = MGDRoles.lch(r.primary).h;
    if (hd(r.sd.tintH, ph) > 0.01) { fail++; if (fail < 5) console.log("FAIL", name, "tintH", r.sd.tintH.toFixed(1), "primary hue", ph.toFixed(1)); }
  }
}
// background stays on the warm side for the terracotta board (real hex check, low chroma tolerated)
for (let i = 0; i < 100; i++) {
  const r = boardRolesFromWeights(BOARDS.terracotta_blue); n++;
  const o = MGDRoles.lch(r.light.roles.background);
  if (o.c > 0.004 && hd(o.h, MGDRoles.lch(r.primary).h) > 40) { fail++; console.log("FAIL warm bg", r.light.roles.background); }
}
// empty board still works (no primary → seed decides)
const e = boardRolesFromWeights({}); n++;
if (e.primary !== null || !e.light.roles.background) { fail++; console.log("FAIL empty board"); }
console.log(`${n - fail}/${n} passed`);
process.exit(fail ? 1 : 0);
