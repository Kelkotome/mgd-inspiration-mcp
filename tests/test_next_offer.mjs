// Node unit tests for src/next_offer.js (5-Nov-2026): palette merge, skip rules, offer text.
// Run: node tests/test_next_offer.mjs   (prints "N passed, M failed", exits 1 on failure)
import { mergePalette, offerSkip, buildOffer, contrast, toOklab, fromOklab, normHex, OFFER_HEAD, pickFonts } from "../src/next_offer.js";
let ok = 0, fail = 0;
const t = (name, cond, info) => { cond ? ok++ : fail++; console.log((cond ? "PASS " : "FAIL ") + name + (cond ? "" : " | " + JSON.stringify(info).slice(0, 400))); };
const HEX = /^#[0-9A-F]{6}$/;
const L = (h) => toOklab(h.toLowerCase())[0];

// colour maths
for (const h of ["#000000", "#ffffff", "#1f2a44", "#e8dcc4", "#b5532e", "#2563eb"]) t(`OKLab round trip ${h}`, fromOklab(toOklab(h)) === h, fromOklab(toOklab(h)));
t("contrast black/white = 21", Math.abs(contrast("#000000", "#ffffff") - 21) < 1e-9);
t("normHex", normHex("ABC") === "#aabbcc" && normHex("#1F2A44") === "#1f2a44" && normHex("nope") === null);

// realistic palettes (5 results)
const pals = [
  ["#1f2a44", "#e8dcc4", "#b5532e", "#c9a227", "#2f4f4f"],
  ["#202b46", "#efe6d2", "#b0502c", "#7a8c6e"],
  ["#0e0e0e", "#d4af37", "#f5f0e6", "#8c2f39"],
  ["#2b3a55", "#e6d8bf", "#c75b39"],
  ["#3c3c3c", "#f2ede3", "#4a6fa5", "#b5532e"],
];
const m = mergePalette(pals);
t("merge returns 5–6 valid hexes", m && m.palette.length >= 5 && m.palette.length <= 6 && m.palette.every((h) => HEX.test(h)), m);
t("ordered dark → light", m && m.palette.every((h, i, a) => i === 0 || L(a[i - 1]) <= L(h) + 1e-9), m && m.palette.map(L));
t("first = dark, last = light", m && m.palette[0] === m.dark && m.palette[m.palette.length - 1] === m.light, m);
t("dark/light contrast >= 4.5", m && contrast(m.dark, m.light) >= 4.5, m && contrast(m.dark, m.light));
t("accent is a palette colour and chromatic", m && m.palette.includes(m.accent) && Math.hypot(...toOklab(m.accent.toLowerCase()).slice(1)) >= 0.04, m);
t("similar colours merged (#1f2a44 ~ #202b46 ~ #2b3a55 not all kept)", m && m.palette.filter((h) => ["#1F2A44", "#202B46", "#2B3A55"].includes(h)).length <= 1, m);
t("deterministic", JSON.stringify(mergePalette(pals)) === JSON.stringify(m));
t("uses real swatches when contrast already passes", m && m.palette.every((h) => pals.flat().map((x) => x.toUpperCase()).includes(h)), m);

// low-contrast input: mid-tones only → adjusted until 4.5
const mid = mergePalette([["#888888", "#999999", "#7a8c6e"], ["#8a8a8a", "#a0a0a0", "#6b7f99"]]);
t("mid-tone palette still gets dark/light >= 4.5", mid && contrast(mid.dark, mid.light) >= 4.5 && mid.palette.every((h) => HEX.test(h)), mid);
const pastel = mergePalette([["#f7d6e0", "#f2b5d4", "#eff7f6"], ["#b2f7ef", "#7bdff2", "#f7d6e0"]]);
t("pastel palette dark/light >= 4.5", pastel && contrast(pastel.dark, pastel.light) >= 4.5, pastel);
t("one colour → null", mergePalette([["#123456"]]) === null && mergePalette([]) === null && mergePalette(null) === null);
t("grey-only palette: accent falls back to a palette colour", (() => { const g = mergePalette([["#111111", "#eeeeee", "#777777"]]); return g && g.palette.includes(g.accent); })());
t("junk entries ignored", (() => { const g = mergePalette([["#111111", "zzz", null, "#eeeeee", "#c0392b"]]); return g && g.palette.every((h) => HEX.test(h)); })());

// skip rules
t("icon query skipped", offerSkip("search_design_inspiration", "bold icon") === "icon" && offerSkip("search_museum_art", "settings icons") === "icon");
t("UI tools skipped", offerSkip("search_ui_screens", "calm wellness") === "tool" && offerSkip("get_ui_screen_code", "x") === "tool");
for (const q of ["dashboard component tailwind", "pricing table React", "hero page section", "login screen", "css gradient button", "shadcn card"])
  t(`coding query skipped: "${q}"`, offerSkip("search_design_inspiration", q) === "coding", offerSkip("search_design_inspiration", q));
for (const q of ["calm gentle branding wellness coach", "swiss typography", "Art Deco poster", "Klimt gold", "railway annual report", "app icon", "screenprint poster", "iconic poster"])
  t(`style query shown: "${q}"`, offerSkip("search_design_inspiration", q) === null, offerSkip("search_design_inspiration", q));

// offer text
const items = pals.map((p, i) => ({ id: "a1b2c3d4e5f" + i, palette: p, tags: i === 0 ? ["art deco", "poster"] : [], themes: [] }));
const o = buildOffer("search_design_inspiration", "Art Deco poster", items);
t("offer: palette line + head + 3 options", o && o.text.startsWith("Palette from these references: #") && o.text.includes(OFFER_HEAD) && o.text.split("\n").length === 5, o && o.text);
t("offer: palette call uses the accent", o && o.text.includes(`generate_website_color_palette(brand_color="${o.accent}")`), o && o.text);
t("offer: type pairing prefilled (Art Deco → Poiret One / Josefin Sans)", o && o.text.includes('heading_font="Poiret One", body_font="Josefin Sans"') && o.text.includes('design_md_from_references(references=["a1b2c3d4e5f0"'), o && o.text);
t("offer: moodboard with ids + title", o && o.text.includes('save_moodboard(items=["a1b2c3d4e5f0",') && o.text.includes('title="Art Deco poster")'), o && o.text);
t("offer: ≤ 700 chars", o && o.text.length <= 700, o && o.text.length);
const o2 = buildOffer("search_design_inspiration", "bright \"zesty\" branding", items.map((x) => ({ ...x, tags: [] })));
t("offer: no font hit → no font params, quotes stripped from title", o2 && !o2.text.includes("heading_font") && o2.text.includes('title="bright zesty branding"'), o2 && o2.text);
t("offer: zero results → null", buildOffer("search_design_inspiration", "Art Deco poster", []) === null);
t("offer: icon → null", buildOffer("search_design_inspiration", "bold icon", items) === null);
t("offer: coding → null", buildOffer("search_design_inspiration", "dashboard component tailwind", items) === null);
t("offer: UI tool → null", buildOffer("search_ui_screens", "Art Deco poster", items) === null);
t("offer: no palettes → null", buildOffer("search_museum_art", "Klimt gold", items.map((x) => ({ ...x, palette: [] }))) === null);
t("offer: bad ids dropped", buildOffer("search_museum_art", "Klimt", [{ id: "nothex", palette: pals[0] }]) === null);
t("pickFonts calm wellness → Lora / Nunito Sans (query wins over tags)", JSON.stringify(buildOffer("search_design_inspiration", "calm gentle branding wellness coach", items.map((x) => ({ ...x, tags: ["playful"] }))).fonts) === JSON.stringify(["Lora", "Nunito Sans"]));
t("pickFonts swiss", JSON.stringify(pickFonts("swiss typography")) === JSON.stringify(["Inter Tight", "Inter"]));

console.log(`${ok} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
