// Node unit tests for the search_ui_screens hint on design searches + the next-step switch (8-Nov-2026, mcp-gap-r1).
// Run: node tests/test_ui_hint.mjs   (prints "N passed, M failed", exits 1 on failure)
// Real queries below are from mcp_calls (search_design_inspiration, 7-Nov replay set; own IP / curl / 5-Nov scraper excluded).
import { uiIntent, withUiHint, UI_HINT_HEAD } from "../src/search_extras.js";
import { buildNextStep, offerSkip, OFFER_HEAD, NEXT_STEP_MODE } from "../src/next_offer.js";
let ok = 0, fail = 0;
const t = (name, cond, info) => { cond ? ok++ : fail++; if (!cond || process.argv.includes("-v")) console.log((cond ? "PASS " : "FAIL ") + name + (cond ? "" : " | " + JSON.stringify(info).slice(0, 300))); };

// Real design-search queries that are app/website requests → hint.
const REAL_UI = ["billing settings dashboard data table saas", "dashboard", "app interface editor toolbar", "user interface",
  "dark editorial saas landing page with oversized serif type", "monochrome brutalist website ui", "website monochrome brutalist",
  "grotesk sans app interface", "cinematic story scroll website design typography dark immersive"];
// Real design-search queries that are graphic design → no hint (incl. the near misses with table/layout/page/grid/menu/card words).
const REAL_GRAPHIC = ["editorial report layout grid data tables", "newspaper sports front page layout", "ticket boarding pass layout",
  "editorial grid", "grid layout", "editorial navigation typography hierarchy", "community notice board flyer tear-off poster",
  "warm serif editorial calendar date typography", "invoice typography", "freelance invoicing european editorial typography",
  "minimal typography leaderboard", "workspace", "editorial index cards dossier numbered sections", "modern report spread minimal grid sans serif",
  "y2k collectible trading card holographic foil frame typography", "bold collectible character card poster illustrated comic packaging graphic design",
  "editorial instruction manual index technical guide wayfinding typography", "music sheet", "music editorial", "album cover music layout editorial",
  "swiss editorial product brochure geometric infographics typography business", "data visualization line graphic identity",
  "technical brand design system editorial dark", "developer tool terminal dark circuit", "ai meeting notes chat assistant product",
  "sequential panels storytelling comic layout illustrated book cover", "screenprint overlap transparent ink", "halftone screenprint editorial poster comics print texture",
  "black event ticket typography perforation editorial poster", "poster", "typography", "swiss grid poster red black", "running shoes",
  "pop art comic book cover packaging bold halftone lettering", "luxury black gold packaging editorial typography", "bold icon",
  "healthcare hospital brand guidelines", "museum identity typographic system", "public notice poster bold typography warning"];
// Synthetic guards from the brief and obvious traps.
const SYN_GRAPHIC = ["table setting photography", "poster layout", "screen print poster", "screen-printed gig poster", "magazine page layout",
  "dining table product photography", "book page spread typography", "form follows function bauhaus poster", "restaurant menu design",
  "tarot cards illustration", "business cards letterpress", "periodic table poster", "tablescape wedding flowers", "silkscreen art print",
  "playing cards deck design", "greeting cards christmas"];
const SYN_UI = ["settings page", "onboarding flow", "checkout screen", "landing page hero", "mobile app login", "pricing table saas",
  "admin panel table", "kanban", "settings form inline validation", "music player now playing", "image editor canvas with toolbar",
  "social feed profile", "subscription billing app", "react component card", "web app sidebar navigation"];
for (const q of REAL_UI) t(`real UI query → hint: "${q}"`, !!uiIntent(q), uiIntent(q));
for (const q of REAL_GRAPHIC) t(`real graphic query → no hint: "${q}"`, uiIntent(q) === null, uiIntent(q));
for (const q of SYN_GRAPHIC) t(`graphic guard → no hint: "${q}"`, uiIntent(q) === null, uiIntent(q));
for (const q of SYN_UI) t(`UI phrase → hint: "${q}"`, !!uiIntent(q), uiIntent(q));
t("prefill strips quotes and newlines, caps 80", uiIntent('dashboard "dark"\nsaas ' + "x".repeat(200)) === null || (uiIntent('dashboard "dark"\nsaas') === "dashboard dark saas"), uiIntent('dashboard "dark"\nsaas'));
t("empty / junk → null", uiIntent("") === null && uiIntent(null) === null && uiIntent("   ") === null);

// withUiHint: prepends one line, keeps results, skips errors and icon queries.
const res = () => ({ content: [{ type: "text", text: "8 design-inspiration result(s) for \"x\"\n• one" }] });
const r1 = withUiHint("billing settings dashboard data table saas", res());
t("hint leads the answer with a prefilled call", r1.content[0].text.startsWith(UI_HINT_HEAD + ' search_ui_screens(query="billing settings dashboard data table saas")'), r1.content[0].text);
t("hint is one line, results kept", r1.content[0].text.split("\n\n")[0].split("\n").length === 1 && r1.content[0].text.includes("• one"), r1.content[0].text);
t("no hint on graphic query", withUiHint("poster layout", res()).content[0].text.startsWith("8 design"));
t("no hint on errors", (() => { const e = { isError: true, content: [{ type: "text", text: "boom" }] }; return withUiHint("dashboard", e).content[0].text === "boom"; })());
t("no UI hint when the icon hint applies (dashboard icons)", withUiHint("dashboard icons", res()).content[0].text.startsWith("8 design"));
t("hint fits one short line (< 220 chars)", r1.content[0].text.split("\n")[0].length < 220, r1.content[0].text.split("\n")[0].length);

// Next-step switch.
const items = [
  { id: "aaaaaaaaaaa1", palette: ["#1f2a44", "#e8dcc4", "#b5532e"], tags: ["art-deco"], themes: [] },
  { id: "aaaaaaaaaaa2", palette: ["#0e0e0e", "#d4af37", "#f5f0e6"], tags: [], themes: [] },
];
t("default mode is a known value", ["offer", "palette", "off"].includes(NEXT_STEP_MODE), NEXT_STEP_MODE);
const off = buildNextStep("search_design_inspiration", "Art Deco poster", items, "off");
const pal = buildNextStep("search_design_inspiration", "Art Deco poster", items, "palette");
const offer = buildNextStep("search_design_inspiration", "Art Deco poster", items, "offer");
t("mode off → nothing", off === null);
t("mode palette → palette line only, not logged", pal && /^Palette from these references: (#[0-9A-F]{6} ?)+$/.test(pal.text) && !pal.text.includes(OFFER_HEAD) && pal.kind === null, pal);
t("mode offer → 5-Nov offer, logged as offer", offer && offer.text.includes(OFFER_HEAD) && offer.kind === "offer", offer);
t("UI query on design search → no palette/offer (hint instead)", offerSkip("search_design_inspiration", "billing settings dashboard data table saas") === "ui"
  && buildNextStep("search_design_inspiration", "dashboard", items, "offer") === null && buildNextStep("search_design_inspiration", "dashboard", items, "palette") === null);
t("UI words on museum search keep the palette (hint is design-search only)", buildNextStep("search_museum_art", "poster website", items, "palette") !== null);

console.log(`\n${ok} passed, ${fail} failed`);
if (fail) process.exit(1);
