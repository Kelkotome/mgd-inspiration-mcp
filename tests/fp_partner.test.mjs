// node --experimental-json-modules style: loads font_pairing.js with its JSON import inlined
import fs from "node:fs"; import path from "node:path"; import assert from "node:assert"; import { pathToFileURL } from "node:url";
const src = path.resolve("src"), tmp = path.join(src, "_fp_test.mjs");
const code = fs.readFileSync(path.join(src, "font_pairing.js"), "utf8").replace('import PAIRINGS from "./font_pairings.json";',
  'const PAIRINGS = ' + fs.readFileSync(path.join(src, "font_pairings.json"), "utf8") + ";");
fs.writeFileSync(tmp, code);
try {
  const { fontPairing } = await import(pathToFileURL(tmp));
  const t = (x) => x.content[0].text;
  const n = fontPairing({ font: "Crimson Text" });
  assert.equal(n.structuredContent.match, "partner"); assert.ok(n.structuredContent.pairs.length > 0);
  assert.ok(n.structuredContent.pairs.every((p) => /Crimson Text/.test(p.heading + p.body) && p.page.startsWith("https://madegooddesigns.com/")));
  assert.ok(/No dedicated pairing guide/.test(t(n)));
  assert.equal(fontPairing({ font: "Crimson Text font pairing", limit: 1 }).structuredContent.pairs.length, 1);
  assert.equal(fontPairing({ font: "Oswald" }).structuredContent.match, "exact");
  assert.equal(fontPairing({ font: "Nunito Sans" }).structuredContent.font, "Nunito Sans"); // round 2: own guide, no longer Nunito
  assert.equal(fontPairing({ font: "Poppins font pairing" }).structuredContent.match, "exact");
  assert.ok(/^0 results/.test(t(fontPairing({ font: "Zzyzx Display" }))));
  console.log("ok", n.structuredContent.pairs.length, "pairs\n" + t(n).slice(0, 300));
} finally { fs.unlinkSync(tmp); }
