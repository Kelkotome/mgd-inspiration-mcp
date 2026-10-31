// Pure colour step of boardDesign (no D1/env) — kept separate so tests/test_board_tint.mjs can run it in Node.
// w = {hex: weight}. Returns {colors, primary, mood, sd, light, dark}.
// Mirrors tool-gap-2026-10/newtools/moodboard-core.js designFromColors (keep in sync).
import { MGDRoles } from "./design_core.js";

export function boardRolesFromWeights(w) {
  const colors = Object.keys(w).map((hex) => ({ hex, weight: w[hex], o: MGDRoles.lch(hex) })).sort((a, b) => b.weight - a.weight);
  const score = (c) => c.weight * Math.min(1, c.o.c / 0.08) * (c.o.l > 0.25 && c.o.l < 0.85 ? 1 : 0.35);
  const ranked = colors.slice().sort((a, b) => score(b) - score(a));
  const primary = ranked.length && score(ranked[0]) > 0 ? ranked[0].hex : null;
  let accentHue = null;
  if (primary) {
    const ph = MGDRoles.lch(primary).h;
    const alt = ranked.find((c) => c.o.c > 0.05 && Math.min(Math.abs(c.o.h - ph), 360 - Math.abs(c.o.h - ph)) > 40);
    if (alt) accentHue = alt.o.h;
  }
  const avgC = colors.length ? colors.slice(0, 8).reduce((m, c) => m + c.o.c, 0) / Math.min(8, colors.length) : 0.1;
  const mood = !primary ? "clean" : avgC < 0.05 ? "muted" : "clean";
  const sd = MGDRoles.seed({ mood, brand: primary });
  if (accentHue != null) { sd.ha = accentHue; sd.harmony = "board"; }
  // Neutrals (background/surface/text/muted/border) follow the board's primary hue. seed() picks tintH
  // from hp OR a random-harmony accent hue (30% of the time) before the board-accent override above, so
  // a warm board could get a blue-tinted background. Fixed 31-Oct-2026 (regression: tests/test_board_tint.mjs).
  if (primary) sd.tintH = sd.hp;
  return { colors, primary, mood, sd, light: MGDRoles.build(sd, "light"), dark: MGDRoles.build(sd, "dark") };
}
