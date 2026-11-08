#!/usr/bin/env node
// mcp-gap-r2 (9-Nov-2026) unit tests: museum hint (artIntent / withMuseumHint), generic words in the library FTS tiers,
// query-side synonyms in the UI search. Run: node tests/test_gap_r2.mjs [real-queries.json]
// The optional JSON (distinct real queries [{tool,q}], read-only SELECT on mcp_calls) prints how many real queries trigger the hint.
import { readFileSync, existsSync } from "node:fs";
import { artIntent, withMuseumHint, MUSEUM_HINT_HEAD, uiIntent, ftsTiers, ftsCoverageSort, isGeneric, GENERIC_W } from "../src/search_extras.js";
import { synPhrases, synonymsOf, buildIndex, rankRows, parseQuery, SYN_W } from "../src/ui_search.js";

let pass = 0, fail = 0;
const t = (name, ok, got) => { if (ok) pass++; else fail++; console.log(`${ok ? "PASS" : "FAIL"} ${name}${ok ? "" : "  got: " + JSON.stringify(got)}`); };

// ---- (a) museum hint ------------------------------------------------------------------------------------------------------
for (const q of ["Greek vase", "ukiyo-e", "Bauhaus poster", "art nouveau poster", "attic amphora terracotta", "vienna secession poster typography",
  "roman fresco pompeii", "Hokusai wave", "fish woodblock print", "botanical illustration", "mughal album border floral", "art deco poster",
  "engraving cross-hatch portrait", "Klimt gold", "illuminated manuscript initials", "black-figure warrior"])
  t(`artIntent yes: ${q}`, !!artIntent(q), artIntent(q));
for (const q of ["art deco hotel website hero", "dashboard", "bold icon", "minimal poster", "jazz festival poster", "museum website template",
  "ancient greek restaurant landing page", "art deco logo", "museum identity typographic system", "sign painting lettering storefront blue",
  "renaissance brand guidelines", "bauhaus font", "retro futurism poster", "museum exhibition poster art gallery", "ukiyo-e app onboarding", ""])
  t(`artIntent no: ${q || "(empty)"}`, !artIntent(q), artIntent(q));

const res = (text) => ({ content: [{ type: "text", text }] });
let r = withMuseumHint("search_design_inspiration", "Greek vase", res("8 design-inspiration result(s) for \"Greek vase\"\n\nPalette from these references: #111 #eee"));
t("design: hint appended as the last line", r.content[0].text.endsWith('search_museum_art(query="Greek vase") searches public-domain museum works (paintings, prints, posters, vases, ornament; mostly made before the 1930s) with images and page links.') && r.content[0].text.includes("\n\n" + MUSEUM_HINT_HEAD), r.content[0].text);
r = withMuseumHint("search_design_inspiration", "Greek vase", r);
t("idempotent (one hint)", r.content[0].text.split(MUSEUM_HINT_HEAD).length === 2);
r = withMuseumHint("search_ui_screens", "ukiyo-e", res('No screen in the library matches "ukiyo-e" (nothing about: ukiyo)'));
t("UI zero answer gets the hint too, header kept", r.content[0].text.startsWith("No screen in the library matches") && r.content[0].text.includes('search_museum_art(query="ukiyo-e")'), r.content[0].text);
r = withMuseumHint("search_annual_reports", "Greek vase", res("x"));
t("other tools untouched", r.content[0].text === "x");
r = withMuseumHint("search_design_inspiration", "Greek vase", { isError: true, content: [{ type: "text", text: "busy" }] });
t("errors untouched", r.content[0].text === "busy");
r = withMuseumHint("search_design_inspiration", "Greek vase icons", res("x"));
t("icon query: icon hint leads, no museum hint", r.content[0].text === "x", r.content[0].text);
r = withMuseumHint("search_design_inspiration", 'vase "quoted"\nline', res("x"));
t("query quotes/newlines cleaned in the prefilled call", r.content[0].text.includes('search_museum_art(query="vase quoted line")'), r.content[0].text);
r = withMuseumHint("search_ui_screens", "Bauhaus poster", { content: [{ type: "text", text: "4 UI screen(s)" }, { type: "image", data: "" }, { type: "text", text: "tail" }] });
t("hint goes on the LAST text block", r.content[2].text.includes(MUSEUM_HINT_HEAD) && !r.content[0].text.includes(MUSEUM_HINT_HEAD));

// ---- (c) generic words in the library FTS tiers -----------------------------------------------------------------------------
const tiers = ftsTiers(["modern", "jazz", "poster"], null);
t("ftsTiers: phrase, all, core (non-generic AND), any/prefix over non-generic words only",
  tiers.map((x) => x.tier).join(",") === "phrase,all,core,any,prefix" && tiers[2].expr === '("jazz" AND "poster")' && tiers[3].expr === '("jazz" OR "poster")' && tiers[4].expr === '("jazz"* OR "poster"*)', tiers);
const t1 = ftsTiers(["minimal", "poster"], ["title"]);
t("ftsTiers: one core word → core1, no any tier", t1.map((x) => x.tier).join(",") === "phrase,all,core1,prefix" && t1[2].expr === '{title} : ("poster")', t1);
const t2 = ftsTiers(["minimal", "modern"], null);
t("ftsTiers: only generic words behave as before", t2.map((x) => x.tier).join(",") === "phrase,all,any,prefix", t2);
const t3 = ftsTiers(["klimt", "gold"], ["title", "tags"]);
t("ftsTiers: no generic word → unchanged (n11 shape)", t3.map((x) => x.tier).join(",") === "phrase,all,any,prefix" && t3[1].expr === '{title tags} : ("klimt" AND "gold")', t3);
t("isGeneric", isGeneric("Modern") && isGeneric("ui") && isGeneric("template") && !isGeneric("poster") && GENERIC_W < 0.5);
const rows = [{ id: "a", title: "Modern clean minimal app", tags: "" }, { id: "b", title: "Jazz poster", tags: "" }];
t("coverage sort: one real word beats three generic ones", ftsCoverageSort(rows, ["modern", "clean", "minimal", "jazz"], ["title", "tags"], false)[0].id === "b");

// ---- (b) synonyms (query side) -----------------------------------------------------------------------------------------------
const sp = [["zero state", "empty state"], ["blank slate for new users", "empty state for new users"], ["first-time user experience", "first run experience"], ["first launch", "first run"],
  ["pay stub", "payslip"], ["employee payslips", "employee payslip"], ["pay run review", "payroll review"], ["time tracking", "timesheet"],
  ["weekly time sheet", "weekly timesheet"], ["clock in and clock out", "timesheet"], ["dark nav bar", "dark navbar"], ["top bar", "navbar"],
  ["pop-up", "popup"], ["image lightbox", "image lightbox"], ["salary", "salary"]];
for (const [a, b] of sp) t(`synPhrases: ${a} → ${b}`, synPhrases(a) === b, synPhrases(a));
t("synonymsOf: dialog ↔ modal", synonymsOf("dialog").includes("modal") && synonymsOf("modal").includes("dialog"));
t("synonymsOf: salary → payroll", synonymsOf("salary").includes("payroll"));
t("synonymsOf: invoice ↔ bill ↔ receipt", synonymsOf("bills").includes("invoic") && synonymsOf("receipt").includes("bill"), synonymsOf("bills"));
t("synonymsOf: unknown word → []", synonymsOf("kanban").length === 0);

// A tiny index: rows have the canonical words only, so every hit below comes from a synonym.
const R = (id, category, title, tags) => ({ id, category, title: `${title} — web, minimal (X)`, description: `${title} screen. Shows ${title.toLowerCase()}. Minimal style: x.`, tags: JSON.stringify(tags), country: "web", style: "minimal", industry: "x", company: "X" });
const idx = buildIndex([R("p1", "payroll", "Pay run review", ["payroll", "table"]), R("t1", "timesheet", "Weekly timesheet", ["timesheet", "grid"]),
  R("d1", "confirm-dialog", "Confirm delete modal", ["modal", "button"]), R("n1", "navigation-header", "Navigation header", ["navbar", "menu"]),
  R("e1", "empty-state", "Empty state inbox zero", ["empty-illustration"]), R("i1", "invoice", "Invoice detail", ["invoice", "table"]),
  R("b1", "calendar", "Upcoming bills calendar", ["bill", "calendar"])], ["payroll", "timesheet", "confirm-dialog", "navigation-header", "empty-state", "invoice", "calendar"], null);
const top = (q) => { const x = rankRows(q, idx); return x.ranked[0] && x.ranked[0].text > 0 ? x.ranked[0].r.category : null; };
t("rank: salary → payroll", top("salary") === "payroll", top("salary"));
t("rank: pay stub → payroll", top("pay stub") === "payroll", top("pay stub"));
t("rank: time tracking → timesheet", top("time tracking") === "timesheet", top("time tracking"));
t("rank: delete dialog → confirm-dialog", top("delete dialog") === "confirm-dialog", top("delete dialog"));
t("rank: zero state → empty-state", top("zero state") === "empty-state", top("zero state"));
t("rank: nav bar → navigation-header", top("nav bar") === "navigation-header", top("nav bar"));
t("rank: receipt → invoice", top("receipt") === "invoice", top("receipt"));
t("rank: the user's own word beats a synonym (bills → the bills calendar, not invoice)", top("upcoming bills") === "calendar", top("upcoming bills"));
const pq = parseQuery("salary", idx);
t("parseQuery: unknown word with synonyms is known, not typo-corrected", pq.terms[0].t === "salary" && pq.terms[0].df > 0 && !pq.terms[0].fuzzy && pq.terms[0].alts.includes("payroll"), pq.terms);
t("SYN_W < 1 (a direct hit always outranks a synonym hit)", SYN_W < 1);

// ---- real-log trigger counts (information) -----------------------------------------------------------------------------------
const f = process.argv[2];
if (f && existsSync(f)) {
  const d = JSON.parse(readFileSync(f, "utf8"));
  for (const tool of ["search_design_inspiration", "search_ui_screens", "search_museum_art"]) {
    const qs = d.filter((x) => x.tool === tool).map((x) => x.q), hit = qs.filter((q) => artIntent(q) && !(tool === "search_design_inspiration" && uiIntent(q)));
    console.log(`info: museum hint on real ${tool} queries: ${hit.length}/${qs.length}${tool !== "search_museum_art" && hit.length ? " → " + hit.join(" | ") : ""}`);
  }
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
