#!/usr/bin/env node
// Backfill ui/<id>/spec.json (spec block, 7-Nov-2026) for UI items ingested before ingest started writing it.
// DRY RUN by default: nothing is written unless --apply is passed.
//
//   node ui-screens/backfill_spec.mjs --dir ui-screens/out                       local only: extract from out/<slug>/index.html, print a summary
//   node ui-screens/backfill_spec.mjs --base http://127.0.0.1:8899/inspiration   dry run through the Worker's admin route (reads R2 HTML, writes nothing)
//   node ui-screens/backfill_spec.mjs --base https://madegooddesigns.com/inspiration --apply   (USER ONLY, after the deploy) writes spec.json to R2
//
// flags: --limit 50 (items per request, max 100), --force (rewrite existing spec.json), --sleep 300 (ms between requests)
// Admin token: ../.admin_token (same as ingest.py). Requests use UA curl/8.4.0 (the site WAF blocks Mozilla UAs).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { extractSpec } from "../src/ui_spec.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2), flag = (k) => args.includes(k);
const val = (k, d) => { const i = args.indexOf(k); return i >= 0 && args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : d; };
const apply = flag("--apply"), dir = val("--dir"), base = val("--base");

function summary(rows) {
  const pages = rows.filter((r) => r.sections > 0), noBp = rows.filter((r) => !r.breakpoints || !r.breakpoints.length);
  console.log(`${rows.length} items: ${pages.length} with named sections, ${rows.length - noBp.length} with breakpoints, ${rows.filter((r) => r.darkMedia).length} with a prefers-color-scheme dark rule`);
}

if (dir) {
  if (apply) { console.error("--apply is not supported with --dir (local mode only prints)"); process.exit(2); }
  const rows = [];
  for (const d of fs.readdirSync(dir).sort()) {
    const f = path.join(dir, d, "index.html"); if (!fs.existsSync(f)) continue;
    const s = extractSpec(fs.readFileSync(f, "utf8"));
    rows.push({ slug: d, sections: s.sections.length, breakpoints: s.breakpoints, darkMedia: s.darkMedia });
    if (flag("--verbose")) console.log(d, JSON.stringify(s));
  }
  summary(rows);
} else if (base) {
  const token = fs.readFileSync(path.join(HERE, "..", ".admin_token"), "utf8").trim();
  const limit = val("--limit", "50"), sleep = +val("--sleep", "300");
  let after = "", all = [], n = 0;
  console.log(`${apply ? "APPLY" : "DRY RUN"} against ${base}`);
  for (;;) {
    const u = `${base.replace(/\/$/, "")}/api/admin/ui-spec-backfill?limit=${limit}&after=${encodeURIComponent(after)}${apply ? "&apply=1" : ""}${flag("--force") ? "&force=1" : ""}`;
    const r = await fetch(u, { method: "POST", headers: { Authorization: `Bearer ${token}`, "User-Agent": "curl/8.4.0", Accept: "*/*" } });
    if (!r.ok) { console.error(`HTTP ${r.status}: ${(await r.text()).slice(0, 200)}`); process.exit(1); }
    const j = await r.json(); all = all.concat(j.results); n++;
    if (flag("--verbose")) for (const x of j.results) console.log(JSON.stringify(x));
    if (!j.next) break; after = j.next; if (sleep) await new Promise((res) => setTimeout(res, sleep));
  }
  const wrote = all.filter((x) => x.wrote || x.would_write), skipped = all.filter((x) => x.skipped), missing = all.filter((x) => x.missing);
  console.log(`${n} requests; ${apply ? "wrote" : "would write"} ${wrote.length}, skipped ${skipped.length} (already have spec.json), missing HTML ${missing.length}${missing.length ? ": " + missing.map((x) => x.id).join(" ") : ""}`);
  summary(wrote);
} else { console.error("usage: --dir <out folder> | --base <worker base> [--apply]"); process.exit(2); }
