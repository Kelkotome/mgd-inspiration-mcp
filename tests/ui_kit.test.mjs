// node tests/ui_kit.test.mjs: checks the "Build this with your AI" panel against every DESIGN.md in ui-screens/out
import fs from "node:fs"; import path from "node:path"; import assert from "node:assert";
import { parseDesignMd, cssVariables, tailwindColours, buildPrompt, uiKitPanel } from "../src/ui_kit.js";

const out = "ui-screens/out", gf = new Set(JSON.parse(fs.readFileSync("../mgd-kit/google_fonts_families.json", "utf8")).map((f) => f.family || f.name || f));
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
const ROLES = ["background", "surface", "border", "text", "muted", "primary", "on-primary", "accent"];
let n = 0; const bad = [], fonts = new Set(), notGf = new Set();
for (const d of fs.readdirSync(out)) {
  const f = path.join(out, d, "DESIGN.md"); if (!fs.existsSync(f)) continue;
  const t = parseDesignMd(fs.readFileSync(f, "utf8")); n++;
  if (!t || !ROLES.every((r) => t.light[r] && t.dark[r]) || !t.heading || !t.body) { bad.push(d); continue; }
  for (const x of [t.heading, t.body]) { fonts.add(x); if (!gf.has(x)) notGf.add(x); }
}
assert.ok(n > 2000); assert.deepEqual(bad, []);
const t = parseDesignMd(`---\nname: "X"\ncolors:\n  background: "#f5f9ff"\n  primary: "#005ab0"\n  dark-background: "#0b1017"\n  dark-primary: "#59a3ff"\ntypography:\n  h1:\n    fontSize: "3rem"\n    fontFamily: "Space Grotesk"\n  body-md:\n    fontFamily: "Inter"\n---\n# X\n`);
assert.deepEqual(t, { light: { background: "#f5f9ff", primary: "#005ab0" }, dark: { background: "#0b1017", primary: "#59a3ff" }, heading: "Space Grotesk", body: "Inter" });
assert.equal(parseDesignMd("no front matter"), null); assert.equal(parseDesignMd(null), null);
const css = cssVariables(t);
assert.ok(css.includes("family=Space+Grotesk:wght@400;600;700&family=Inter:wght@400;600;700&display=swap")); assert.ok(/:root \{[^}]*--background: #f5f9ff;[^}]*--font-heading: "Space Grotesk"/.test(css)); assert.ok(/\.dark \{\n {2}--background: #0b1017;/.test(css));
assert.equal(new Function(`return {${tailwindColours(t)}}`)().theme.extend.colors["dark-primary"], "#59a3ff");
assert.equal(buildPrompt("Dashboard screen", "https://x/a.md", "https://x/a.html"), "Rebuild this Dashboard screen for my project. Ask me which framework I'm using first. Follow the design tokens in the DESIGN.md: https://x/a.md. Use the HTML as the reference: https://x/a.html.");
const html = uiKitPanel({ tokens: t, what: "Dashboard screen", kind: "screen", name: `A "quoted" <name>`, pageUrl: "https://x/p", mdUrl: "https://x/a.md", codeUrl: "https://x/a.html", ref: "ui-dashboard", esc });
assert.ok(!html.includes(`"quoted"`)); assert.equal((html.match(/data-kit-theme=/g) || []).length, 2); assert.ok(html.includes("Build this with your AI"));
console.log(`${n} DESIGN.md parsed, ${fonts.size} fonts${notGf.size ? `, NOT on Google Fonts: ${[...notGf].join(", ")}` : ", all on Google Fonts"}. ok`);
