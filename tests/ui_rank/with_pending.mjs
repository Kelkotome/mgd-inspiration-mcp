#!/usr/bin/env node
// Prints the cached live row dump + rows synthesised from ui-screens/out/<slug>/meta.json for patterns not ingested yet
// (same title/description/tags as ingest.py builds), so ranking for new patterns can be tested before ingest.
// usage: node tests/ui_rank/with_pending.mjs [pattern,pattern] > rows.json
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
const HERE = path.dirname(fileURLToPath(import.meta.url)), OUTS = (process.env.UI_OUTS || path.join(HERE, "../../ui-screens/out")).split(":"); // colon list, so out-hc can sit beside out
const rows = JSON.parse(readFileSync(path.join(HERE, ".cache/rows.json"), "utf8"));
const have = new Set(rows.map((r) => r.category));
const want = process.argv[2] ? new Set(process.argv[2].split(",")) : null;
const STYLE = (s) => `${s[0].toUpperCase() + s.slice(1)} style: (synthetic).`;
for (const OUT of OUTS) for (const slug of readdirSync(OUT)) {
  const f = path.join(OUT, slug, "meta.json"); if (!existsSync(f)) continue;
  const m = JSON.parse(readFileSync(f, "utf8"));
  if (have.has(m.pattern) || (want && !want.has(m.pattern))) continue;
  const kind = m.type === "section" ? "section" : m.type === "component" ? "UI component" : "screen", plat = m.platform === "web" ? "web app" : "mobile app";
  const tags = [m.pattern, m.platform, m.category, ...m.elements.filter((e) => e !== m.pattern && e !== m.platform), ...(m.variant ? [`variant:${m.variant}`] : [])];
  rows.push({ id: createHash("md5").update(slug).digest("hex").slice(0, 12), title: `${m.name}${m.type === "component" ? " component" : ""} — ${m.platform}, ${m.style} (${m.product})`,
    description: `${m.name} ${kind} for a ${plat}, designed for ${m.product}, a fictional ${m.category} product. Shows ${m.shows}. ${STYLE(m.style)} Comes with the full HTML and a DESIGN.md with light and dark colour tokens.`,
    tags: JSON.stringify(tags), category: m.pattern, style: m.style, industry: m.category, country: m.platform, company: m.product,
    image_key: `ui/${slug}.webp`, palette: "[]", width: m.viewport.w, height: m.viewport.h, created_at: 0, collection: "ui", status: "published", owner_id: null });
}
process.stdout.write(JSON.stringify(rows));
