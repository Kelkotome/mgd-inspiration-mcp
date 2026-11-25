#!/usr/bin/env node
// The template tree as JSON for the Python route tests (restructure round, 25-Nov-2026): node --import ./tests/ui_rank/register.mjs tests/tree_dump.mjs
import path from "node:path"; import { fileURLToPath } from "node:url";
const T = await import(path.join(path.dirname(fileURLToPath(import.meta.url)), "../src/ui_tree.js"));
const niches = T.NICHES.map((n) => ({ id: n.id, pattern: n.pattern, label: n.label, industry: n.industry, group: n.group, under: n.under, htmlLive: n.htmlLive, wpLive: n.wpLive, nest: T.nichePath(n), wp: T.wpNichePath(n), designs: T.liveDesigns(n).length, themes: T.liveThemes(n).map((d) => d.theme.slug), children: T.nicheChildren(n).map((k) => k.id) }));
const industries = Object.values(T.INDUSTRIES).map((i) => ({ id: i.id, label: i.label, hub: i.hub, live: T.industryLive(i.id), category: (T.homeCategory(i.id) || {}).id || null, groups: (i.groups || []).map((g) => ({ id: g.id, label: g.label, parent: g.parent || null, live: T.groupLive(g) })) }));
const categories = T.CATEGORIES.map((c) => ({ id: c.id, label: c.label, h1: c.h1, seg: c.seg, live: T.categoryLive(c), industries: T.categoryIndustries(c).map((i) => i.id), designs: T.categoryIndustries(c).reduce((a, i) => a + T.industryNiches(i.id).reduce((b, n) => b + T.liveDesigns(n).length, 0), 0) }));
process.stdout.write(JSON.stringify({ niches, industries, categories, paths: T.treePaths() }));
