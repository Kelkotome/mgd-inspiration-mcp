// src/tpl_catalog.json from what actually happened: distinct.json (tests/hc_distinct.py) and the install-test results. Nothing is typed by hand.
// A design appears only if it is distinct; a theme only if its zip passed every check. Also writes out-wp/_r2/ (zip + webp shots) for upload_r2.sh.
// usage: node build_catalog.mjs <distinct.json> <catalog.json>
// Merge: niches this out-hc does not build (another industry, built in its own worktree) are kept from the existing catalog as they are, hashes included.
import fs from "node:fs"; import path from "node:path"; import crypto from "node:crypto"; import { execFileSync } from "node:child_process"; import { createRequire } from "node:module";
import { designs, OUT_WP, UI } from "./themes.mjs";
const require = createRequire(import.meta.url); const { LAYOUTS } = require(path.join(UI, "hc/engine.js"));
const [dj, out] = process.argv.slice(2); const distinct = JSON.parse(fs.readFileSync(dj, "utf8"));
const res = {}; for (const f of fs.readdirSync(OUT_WP).filter((x) => /^_r\d+\.jsonl$/.test(x))) for (const l of fs.readFileSync(path.join(OUT_WP, f), "utf8").trim().split("\n")) { const r = JSON.parse(l); res[r.slug] = r; } // last run wins
const prev = fs.existsSync(out) ? JSON.parse(fs.readFileSync(out, "utf8")) : { niches: {} }; const niches = {}, seen = { pass: [], fail: [], untested: [] }; const R2 = path.join(OUT_WP, "_r2"); fs.rmSync(R2, { recursive: true, force: true }); // only this worktree's themes; healthcare's _r2 lives in mgd-inspiration-hc
const VERSION = "1.0.0"; let wp = null, php = null, tested = null;
for (const d of designs()) {
  const n = (niches[d.niche] ||= { designs: [], services: [] }), dd = distinct[d.niche]; if (!dd) throw new Error("no distinct result for " + d.niche);
  const r = res[d.slug], rep = JSON.parse(fs.readFileSync(path.join(OUT_WP, `${d.slug}.report.json`), "utf8")), zip = path.join(OUT_WP, `${d.slug}.zip`);
  const entry = { variant: d.variant, layout: d.layout, layoutName: d.layout === "signature" ? "Signature" : LAYOUTS[d.layout].name, about: d.layout === "signature" ? "the layout built for this niche alone" : d.about, style: d.style, distinct: dd.distinctIds.includes(d.variant) };
  if (!r) seen.untested.push(d.slug); else if (!r.pass) seen.fail.push(`${d.slug}: ${r.fails.slice(0, 2).join(" ; ")}`);
  if (r?.pass) {
    seen.pass.push(d.slug); wp = r.wp; php = r.php; tested = r.t.slice(0, 10); const buf = fs.readFileSync(zip);
    entry.theme = { slug: d.slug, name: d.name, site: d.product, version: VERSION, zipBytes: buf.length, sha256: crypto.createHash("sha256").update(buf).digest("hex"), patterns: r.editor.patterns, blocks: rep.blocks, htmlBlocks: rep.htmlBlocks, variations: r.editor.variations, requiresWp: "6.6", tested: true };
    const dir = path.join(R2, `tpl/wordpress/${d.slug}/${VERSION}`); fs.mkdirSync(dir, { recursive: true }); fs.copyFileSync(zip, path.join(dir, "theme.zip"));
    for (const w of [1280, 390]) execFileSync("python3", ["-c", "import sys;from PIL import Image;im=Image.open(sys.argv[1]).convert('RGB');w,h=im.size;c=int(w*2.2);im=im.crop((0,0,w,min(h,c)));t=min(w,1000);im.resize((t,int(im.height*t/w))).save(sys.argv[2],'WEBP',quality=78,method=6)", path.join(OUT_WP, "_wpshots", `${d.slug}-${w}.png`), path.join(dir, `shot-${w}.webp`)]);
  }
  n.designs.push(entry);
}
// the niche's own service names, for factual, quotable page copy
for (const id of Object.keys(niches)) niches[id].services = require(path.join(UI, `hc/content/${id}.js`)).services.items.map((s) => s.t);
const built = new Set(Object.keys(niches)); for (const [id, n] of Object.entries(prev.niches || {})) if (!built.has(id)) niches[id] = n; // kept from the previous catalog
fs.writeFileSync(out, JSON.stringify({ wp, php, tested, version: VERSION, licence: "GPL-2.0-or-later", niches }, null, 0) + "\n");
console.log("kept from previous catalog:", Object.keys(prev.niches || {}).filter((id) => !built.has(id)).join(", ") || "none");
console.log(`themes pass ${seen.pass.length} fail ${seen.fail.length} untested ${seen.untested.length}`); for (const f of seen.fail) console.log("FAIL", f); for (const f of seen.untested) console.log("UNTESTED", f);
for (const [id, n] of Object.entries(niches)) console.log(id.padEnd(18), "distinct", n.designs.filter((d) => d.distinct).length, "themes", n.designs.filter((d) => d.distinct && d.theme).length);
