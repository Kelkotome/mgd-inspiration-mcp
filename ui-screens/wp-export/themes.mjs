// Every WordPress theme to build, derived from the design lists, never typed by hand.
// Signature = the hand-authored n12/n13 homepage for the niche. The other designs come from gen_hc.js (ui-screens/out-hc).
// A theme enters the catalog only after it passes installtest.mjs.
import fs from "node:fs"; import path from "node:path"; import { fileURLToPath } from "node:url";
const HERE = path.dirname(fileURLToPath(import.meta.url));
export const UI = path.join(HERE, "..");
export const OUT_HC = process.env.HC_OUT || path.join(UI, "out-hc");
export const OUT_MAIN = process.env.UI_OUT || path.join(UI, "../../mgd-inspiration/ui-screens/out"); // read only; out/ is not in a fresh worktree
export const OUT_WP = process.env.WP_OUT || path.join(UI, "out-wp");
// niche id -> [pattern, family key, home style of the hand-authored design]
export const SIGNATURE = { cardiology: ["cardiology-website", "cardiology", "minimal"], medical: ["medical-website", "medical", "editorial"], dental: ["dental-website", "dental", "corporate"], dermatology: ["dermatology-website", "dermatology", "luxury"], therapist: ["therapist-website", "therapist", "retro"], "physical-therapy": ["physical-therapy-website", "physio", "brutalist"], veterinary: ["veterinary-website", "vet", "playful"], pediatrics: ["pediatrics-website", "pediatrics", "monochrome"], orthodontics: ["orthodontics-website", "ortho", "corporate"], fertility: ["fertility-website", "fertility", "luxury"] };
const title = (s) => s.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
export function designs() {
  const out = []; const metas = fs.readdirSync(OUT_HC).filter((d) => d.includes("-web-")).map((d) => ({ dir: d, ...JSON.parse(fs.readFileSync(path.join(OUT_HC, d, "meta.json"), "utf8")) }));
  const niches = fs.readdirSync(path.join(UI, "hc/content")).filter((f) => f.endsWith(".js")).map((f) => f.slice(0, -3));
  for (const n of niches) {
    const c = metas.filter((m) => m.pattern === `${n}-website`);
    if (SIGNATURE[n]) { const [pat, fam, st] = SIGNATURE[n]; out.push({ niche: n, layout: "signature", variant: "homepage", style: st, family: fam, html: path.join(OUT_MAIN, `${pat}-homepage-web-${st}`, "index.html"), slug: `mgd-${n}-signature`, name: `MGD ${title(n)} Signature`, about: "the layout built for this niche alone", product: c[0].product }); }
    for (const m of c) out.push({ niche: n, layout: m.variant, variant: m.variant, style: m.style, family: m.family, html: path.join(OUT_HC, m.dir, "index.html"), slug: `mgd-${n}-${m.variant}`, name: `MGD ${title(n)} ${title(m.variant)}`, about: m.shows.split(": ").slice(1).join(": "), product: m.product });
  }
  return out;
}
