#!/usr/bin/env node
// mcp-gaps-r2 (11-Nov-2026) unit tests for the dating app set: registration (patterns, labels, slugs, copy, aliases, taxonomy, flow,
// element inventory), query folding of dating-app brand names, and the templates themselves (no brand names, no external images,
// tokens only outside the illustrated photos). Ranking lives in tests/ui_rank/cases_gaps_r2.txt.
// Run: node --no-warnings --import=./tests/ui_rank/register.mjs tests/test_gaps_r2.mjs
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { createRequire } from "node:module";
import { UI_SCREEN_PATTERNS, UI_PATTERNS } from "../src/ui_screens.js";
import { PATTERN_SEO } from "../src/ui_seo.js";
import { PATTERN_ALIASES, synPhrases, words } from "../src/ui_search.js";
const require = createRequire(import.meta.url);
let pass = 0, fail = 0;
const t = (name, ok, got) => { if (ok) pass++; else fail++; if (!ok || process.argv.includes("--verbose")) console.log(`${ok ? "PASS" : "FAIL"} ${name}${ok ? "" : "  got: " + JSON.stringify(got)}`); };
const NEW = ["dating-swipe", "dating-profile", "dating-chat", "dating-onboarding"];
const VARS = { "dating-swipe": ["card-stack", "mutual-match"], "dating-profile": ["full-profile", "discovery-filters"], "dating-chat": ["matches-list", "date-thread"], "dating-onboarding": ["about-you", "add-photos"] };
const BRAND = /tinder|bumble|hinge|badoo|okcupid|grindr|happn|feeld|super ?like|it[’']s a match/i;

// ---- registration
const COPY = JSON.parse(readFileSync("src/ui_pattern_copy.json", "utf8")), TAX = JSON.parse(readFileSync("ui-screens/taxonomy.json", "utf8"));
const SRC = readFileSync("src/ui_screens.js", "utf8");
for (const p of NEW) {
  t(`${p} in UI_SCREEN_PATTERNS`, UI_SCREEN_PATTERNS.includes(p) && UI_PATTERNS.includes(p));
  t(`${p} SEO slug + H1`, Array.isArray(PATTERN_SEO[p]) && /^dating-[a-z-]+-ui$|^dating-app-ui$/.test(PATTERN_SEO[p][0]) && /UI examples/.test(PATTERN_SEO[p][1]), PATTERN_SEO[p]);
  const c = COPY[p];
  t(`${p} copy: intro, 4 tips, 2 FAQ`, c && c.intro.length > 200 && c.tips.length === 4 && c.faq.length === 2 && c.faq.every((f) => f[0].endsWith("?") && f[1].length > 60), c);
  t(`${p} copy names no real app`, !BRAND.test(JSON.stringify(c)));
  t(`${p} copy: no em/en dashes`, !/[—–]/.test(JSON.stringify(c)));
  t(`${p} aliases (≥8)`, (PATTERN_ALIASES[p] || []).length >= 8 && !PATTERN_ALIASES[p].some((a) => BRAND.test(a)), PATTERN_ALIASES[p]);
  t(`${p} label`, SRC.includes(`"${p}": "Dating`));
  t(`${p} in taxonomy dating group + family`, TAX.screen_patterns.dating.includes(p) && TAX.families.dating.includes(p));
  for (const v of VARS[p]) t(`${p}/${v} label`, SRC.includes(`"${v}": "`));
}
t("aliases are not shared between dating patterns", new Set(NEW.flatMap((p) => PATTERN_ALIASES[p])).size === NEW.flatMap((p) => PATTERN_ALIASES[p]).length);
const fl = TAX.flows["find-a-date"];
t("flow find-a-date: 5 steps over the 4 patterns", fl && fl.steps.length === 5 && fl.steps.every((s) => VARS[s.split(":")[0]] && VARS[s.split(":")[0]].includes(s.split(":")[1])), fl);
t("taxonomy categories has dating", TAX.categories.includes("dating"));

// element inventory: 16 new keys, every older key byte-identical to the base commit
const EL = JSON.parse(readFileSync("src/ui_elements.json", "utf8"));
const BASE = JSON.parse(execSync("git show 0ae403f:src/ui_elements.json", { maxBuffer: 1 << 26 }).toString());
const newKeys = Object.keys(EL).filter((k) => !(k in BASE));
t("ui_elements: 16 new keys, all dating", newKeys.length === 16 && newKeys.every((k) => k.startsWith("dating-")), newKeys);
t("ui_elements: older keys unchanged", Object.keys(BASE).every((k) => JSON.stringify(EL[k]) === JSON.stringify(BASE[k])));
t("ui_elements: swipe card stack lists swipe-cards and card-stack, no chart", ["web", "mobile"].every((pl) => { const e = EL[`dating-swipe|card-stack|${pl}`].elements; return e.includes("swipe-cards") && e.includes("card-stack") && !e.includes("chart"); }));

// ---- query folding (query side only)
const fold = (q) => words(synPhrases(q)).join(" ");
for (const [q, want] of [["tinder-like swipe cards", "dating app swipe swipe cards"], ["tinder clone", "dating app swipe"], ["Tinder", "dating app swipe"],
  ["bumble style app", "dating app app"], ["hinge-like profile prompts", "dating app profile prompts"], ["swipe left or right", "swipe"],
  ["swipe right to like", "swipe to like"], ["it's a match screen", "mutual match screen"], ["It’s a match", "mutual match"]])
  t(`fold "${q}" → "${want}"`, fold(q) === want, fold(q));
for (const q of ["matchmaking dashboard", "hinged door product page", "hari raya promo banner", "raya restaurant", "swipe gallery", "match score table"])
  t(`no fold for "${q}"`, !/dating/.test(fold(q)), fold(q));

// ---- the templates themselves
const tpl = require("../ui-screens/tpl/dating.js");
const lib = require("../ui-screens/lib.js");
t("family dating = Duskwell", lib.FAMILIES.dating && lib.FAMILIES.dating.name === "Duskwell");
const srcT = readFileSync("ui-screens/tpl/dating.js", "utf8");
const code = srcT.replace(/\/\*[^]*?\*\//g, "");
t("template code names no real dating app", !BRAND.test(code), (code.match(BRAND) || [])[0]);
t("no external images or <img>", !/<img\b|url\(\s*["']?https?:/i.test(code));
// hard-coded hex colours only inside the illustrated photos (SCENES, PEOPLE, portrait) and the photo placeholder background
const hex = [...code.matchAll(/#[0-9a-fA-F]{3,6}\b/g)].map((m) => code.slice(code.lastIndexOf("\n", m.index) + 1, m.index));
t("hex colours only in photo illustration code", hex.every((l) => /^\s+\[|^\s+[a-z]+: \{ n:|HAIR|<path d="M108|<circle cx=|\.dt-ph\{|const PEOPLE|fill="#fff"|stroke="#000"|^  (short|short2|long|curly|bun):/.test(l)), hex.filter((l) => !/^\s+\[|^\s+[a-z]+: \{ n:/.test(l)).slice(0, 4));
for (const p of NEW) {
  const d = tpl[p];
  t(`${p}: family dating, 2 variants, shows + elements`, d && d.family === "dating" && Object.keys(d.variants).join() === VARS[p].join() && d.shows.length > 60 && d.elements.length >= 12);
  t(`${p}: says it is not modelled on a real app`, /not modelled on any real dating app/.test(d.shows));
  for (const v of VARS[p]) for (const pl of ["web", "mobile"]) {
    const html = d[pl]({ ...lib.FAMILIES.dating, variant: v }, lib.STYLES.luxury, () => 0.5);
    t(`${p}/${v}/${pl}: renders, no brand names, no undefined`, html.length > 3000 && !BRAND.test(html) && !/undefined|NaN|\[object/.test(html), html.slice(0, 120));
  }
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
