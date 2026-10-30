// Node unit test of src/tools_core48.js (the generated Worker module) — the same cores the batch-48 pages use.
// Run: node tests/test_tools48.mjs   (prints "N passed, M failed", exits 1 on failure)
import { MGDTypeScale, MGDColorScale, MGDContrast, MGDOklch, MGDTokens, MGDMoodboard, MGDBrand, MGDSlogan, MGDIcons, MGDScreens } from "../src/tools_core48.js";
import { MGDRoles } from "../src/design_core.js";
import { lint } from "../src/designmd_lint.js";
let ok = 0, fail = 0;
const t = (name, cond, info) => { cond ? ok++ : fail++; console.log((cond ? "PASS " : "FAIL ") + name + (cond ? "" : " | " + JSON.stringify(info).slice(0, 300))); };
t("no window global leaked", typeof globalThis.window === "undefined");
const s = MGDTypeScale.scale({ base_px: 16, ratio: 1.25 });
t("type scale base 16 → lg 20px", s.steps.find((x) => x.name === "lg").px === 20, s.steps);
t("color scale keeps #2563eb", MGDColorScale.ramp("#2563eb").some((x) => x.hex === "#2563eb"));
t("contrast #767676/#fff = 4.54", MGDContrast.check("#767676", "#fff").ratio === 4.54);
t("oklch white", MGDOklch.convert("#ffffff").css.oklch.startsWith("oklch(100%"), MGDOklch.convert("#ffffff").css);
const th = MGDTokens.shadcnTheme({ primary: "#e11d48" });
t("shadcn: 0 fails + sidebar-ring var", th.fails === 0 && "sidebar-ring" in th.light, th.fails);
const ex = MGDTokens.exportTokens(MGDTokens.buildModel({ colors: { brand: "#2563eb" } }), ["dtcg"]);
t("tokens: DTCG JSON parses", !!JSON.parse(typeof ex.dtcg === "string" ? ex.dtcg : JSON.stringify(ex.dtcg)).color);
const d1 = MGDMoodboard.designFromColors({ palettes: [["#8a6230", "#3f2a1b", "#c7b9ab"]] }, MGDRoles), d2 = MGDMoodboard.designFromColors({ palettes: [["#8a6230", "#3f2a1b", "#c7b9ab"]] }, MGDRoles);
t("moodboard design deterministic", d1.query === d2.query);
t("moodboard: warm refs → warm background (tint follows primary hue)", MGDRoles.lch(d1.light.background).h > 30 && MGDRoles.lch(d1.light.background).h < 110, MGDRoles.lch(d1.light.background));
t("moodboard: all light pairs pass", MGDRoles.checks(d1.light).every((c) => c.pass));
t("brand board SVG", MGDBrand.boardSvg({ name: "X", colors: [{ hex: "#123456" }, { hex: "#fedcba" }], fonts: { heading: "Inter", body: "Inter" } }).startsWith("<svg"));
const sl = MGDSlogan.generate({ brand: "Acme", keywords: ["tools"], count: 40, seed: 3 });
t("slogans unique + none blocked", new Set(sl.map((x) => x.text)).size === sl.length && !sl.some((x) => MGDSlogan.isBlocked(x.text)));
t("icons import name", MGDIcons.importName("lucide", "arrow-right", "react").import === 'import { ArrowRight } from "lucide-react";');
t("screens has sourced iPhone rows", MGDScreens.query({ q: "iphone" }).every((d) => d.source && d.source.length));
const bad = lint("---\nversion: alpha\nname: x\ncolors:\n  primary: \"#777777\"\ncomponents:\n  button:\n    backgroundColor: \"{colors.nope}\"\n---\n# x\n");
t("lint bundle flags broken ref", bad.summary.errors >= 1, bad.summary);
console.log(`${ok} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
