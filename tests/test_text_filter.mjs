// App boards Phase 1 (23-Nov-2026): src/text_filter.js — conservative whole-word filter for shared board text.
// Run: node --experimental-default-type=module tests/test_text_filter.mjs  (exit 0 = pass)
import { textProblem, normalise, FILTER_LISTS } from "../src/text_filter.js";
let n = 0, fail = 0;
const t = (name, cond, info) => { n++; if (!cond) { fail++; console.log("FAIL", name, info === undefined ? "" : JSON.stringify(info)); } else console.log("PASS", name); };

// ---- must be ACCEPTED (design talk that a naive filter would refuse)
const OK = [
  "", "   ", "Warm nude palette for a skincare brand", "Naked Cosmetics packaging", "Sexy serif headlines", "Sex Pistols poster, 1977",
  "Moby Dick cover by Rockwell Kent", "Philip K. Dick paperbacks", "Cocktail bar menu", "a chink of light in the logo",
  "Scunthorpe United crest", "Essex county council rebrand", "Middlesex University", "Spice market signage", "Spicy ramen branding",
  "Pakistan International Airlines livery", "Raccoon mascot", "Raccoons on the zine cover", "Therapist practice website",
  "Milfoil green #4A6B3A", "Assassin's Creed title type", "Classic grotesk, Helvetica Neue", "Retardant-coated paper stock",
  "Ford Escort brochure 1981", "Grape escorts? no", "Cumulus cloud blues", "Arsenal FC badge", "Titian red", "Shitake mushroom packaging",
  "Porsche 911 typography", "Pornic harbour posters", "PORNIC sardine tins", // Pornic (French town) passes via the whole-word ALLOW list
  "Visit https://madegooddesigns.com/inspiration/ for more", "See https://a.example and https://b.example",
  "Call it 'Sunrise': #FF8800 #FFD000", "Order of 1200 x 900 px, 300 dpi", "Pantone 186 C, CMYK 0 100 81 4",
  "Hex #112233 #445566 #778899 #AABBCC", "Kerning 0.05em, 2026-11-23 version", "Fuck yeah typography (swearing is allowed)",
  "Hammershøi greys", "Ølfabrikken label", "Café Noir lettering", "Text me when the print is ready",
];
OK.push("Magna cum laude diploma layout", "Summa Cum Laude certificate", "Hardcore punk gig poster", "XXXL tee size chart", "Sex education leaflet",
  "Nude lipstick packaging", "Nudes and blush tones", "Industrial vibrator manual", "Fetish figure, Kongo, 19th century", "Erotes fresco", "Sussex downs");
for (const s of OK) t(`accept: ${s.slice(0, 50)}`, textProblem(s) === null, textProblem(s));

// ---- must be REJECTED
const BAD = [
  ["Free PORN here", "adult"], ["pornhub style logo", "adult"], ["p0rn", "adult"], ["P.O.R.N", "adult"], ["p o r n", "adult"], ["pooorrrn", "adult"], ["xxxx", "adult"], ["n.s.f.w", "adult"],
  ["xxx videos", "adult"], ["NSFW moodboard", "adult"], ["hentai art", "adult"], ["bl0wj0b", "adult"], ["MILF", "adult"],
  ["my onlyfans", "adult"], ["escort service in town", "adult"], ["Escort  Service", "adult"], ["sex chat now", "adult"], ["anal sex", "adult"],
  ["masturbation", "adult"], ["Pornic porn", "adult"],
  ["Pussy Riot protest posters", "adult"], ["pussyyy", "adult"], ["pu55y", "adult"], ["Only Fans link", "adult"], ["0nlyfans", "adult"], ["HENTAI", "adult"],
  ["cunt", "adult"], ["sluts", "adult"], ["whore", "adult"], ["so horny", "adult"], ["cum inside", "adult"], ["jizz", "adult"], ["erotic photos", "adult"],
  ["big boobs", "adult"], ["sex video", "adult"], ["Sex tape leaked", "adult"], ["live sex now", "adult"], ["sex toys shop", "adult"], ["send nudes", "adult"],
  ["nude pics", "adult"], ["naked girls", "adult"], ["fuck me", "adult"], ["suck my", "adult"], ["sexting", "adult"], ["threesome", "adult"],
  ["strip club logo", "adult"], ["pr0n", "adult"], ["Sex Pistols xxx", "adult"], ["nude palette, porn", "adult"],
  ["you n1gger", "slur"], ["NIGGA", "slur"], ["f@ggot", "slur"], ["faggots", "slur"], ["kike", "slur"], ["wetbacks", "slur"], ["tranny", "slur"],
  ["what a retard", "slur"], ["sp1c", "slur"], ["raghead", "slur"], ["Nigger", "slur"], ["n i g g e r", "slur"],
  ["Cheap viagra", "spam"], ["cialis online", "spam"], ["Payday loans fast", "spam"], ["buy followers today", "spam"],
  ["https://a.example https://b.example https://c.example", "spam"], ["www.a.com www.b.com www.c.com", "spam"],
  ["Call +65 9123 4567 now", "spam"], ["WhatsApp 91234567 89", "spam"], ["+1 (415) 555-0134 or +1 (415) 555-0199", "spam"],
  ["chat at wa.me/6591234567", "spam"], ["join t.me/cheapdeals", "spam"],
];
for (const [s, why] of BAD) t(`${why ? "reject" : "accept (conservative)"}: ${s}`, textProblem(s) === why, textProblem(s));

// ---- mechanics
t("normalise: leetspeak + accents + punctuation", normalise("Pörn  N1GG3R, $p1c") === "porn nigger spic", normalise("Pörn  N1GG3R, $p1c"));
t("whole words only: 'spice' ≠ 'spic', 'pakistan' ≠ 'paki'", textProblem("spice") === null && textProblem("pakistan") === null);
t("case-insensitive", textProblem("ViAgRa") === "spam");
t("never throws on non-strings", textProblem(null) === null && textProblem(undefined) === null && textProblem(12345) === null && textProblem({}) === null);
t("lists are non-empty and lower-case", ["ADULT", "SLURS", "SPAM", "ALLOW"].every((k) => FILTER_LISTS[k].length > 2 && FILTER_LISTS[k].every((w) => w === w.toLowerCase())));
t("plain sex allowed; sex + explicit term rejected", textProblem("Sex Pistols") === null && textProblem("sex chat") === "adult");
t("one phone number alone is fine (a studio's number in a note)", textProblem("Studio: +44 20 7946 0958") === null);
t("2 URLs fine, 3 = spam", textProblem("https://a.x https://b.x") === null && textProblem("https://a.x https://b.x http://c.x") === "spam");

console.log(`${n - fail}/${n} passed`);
process.exit(fail ? 1 : 0);
