// Text filter for user-written text on shared app boards (app boards Phase 1, 23-Nov-2026; tests/test_text_filter.mjs).
// Whole words only, case-insensitive, accents folded, light leetspeak (0→o 1→i 3→e 4→a 5→s 7→t @→a $→s !→i), stretched letters
// ("pornnn", "xxxx") and spelled-out letters ("p o r n", "n.s.f.w") folded too.
// It blocks (a) sexual slang, porn / adult-site terms and explicit sexual phrases, (b) slurs, (c) obvious spam (many links, phone-number
// adverts, pill spam). Owner rule (23-Nov-2026): no adult content and no abuse. Still allowed: "nude" (a design colour name), plain "sex"
// unless in an explicit phrase ("Sex Pistols poster"), naked, sexy, Moby Dick, cocktail, "a chink of light", hardcore (punk), fetish
// (anthropology), vibrator (machinery), "magna cum laude", XXXL, general swearing.
// ALLOW lists whole words/phrases removed before matching (Pornic is a French town; "cum laude" is Latin on diplomas).
// A word ending in * matches as a prefix (porn* → porno, pornhub, pornography). Phrases match with any run of spaces between words.
// URLs are allowed (stored and later shown as plain text, never as links); only 3+ links in one field count as spam.

const ALLOW = ["pornic", "magna cum laude", "summa cum laude", "cum laude"];
const ADULT = [
  "porn*", "pron", "porno*", "xxx", "nsfw", "hentai", "onlyfans", "onlyfan", "only fans", "fansly", "pussy*", "pussies", "cunt*", "slut*", "whore*",
  "horny", "cum", "cumshot*", "jizz*", "erotic*", "boobs", "boobies", "titties", "blowjob*", "handjob*", "rimjob*", "creampie*", "gangbang*",
  "bukkake", "deepthroat*", "threesome*", "incest*", "milf", "milfs", "dildo*", "fleshlight*", "camgirl*", "camboy*", "camsex",
  "cybersex", "phonesex", "sexting", "sexcam*", "xvideos", "xhamster", "redtube", "youporn", "brazzers", "chaturbate", "bdsm", "pedophil*",
  "paedophil*", "escort service*", "escort agency", "orgasm*", "masturbat*", "jerk off", "jack off", "fuck me", "suck my", "lick my",
  "sex chat*", "sex cam*", "sex video*", "sex tape*", "sex toy*", "sex shop*", "sex pic*", "sex photo*", "sex dating", "phone sex", "live sex",
  "free sex", "hot sex", "anal sex", "oral sex", "send nudes", "nude pic*", "nude photo*", "nude girl*", "nude selfie*",
  "naked girl*", "naked pic*", "naked photo*", "strip club*", "fetish sex",
];
const SLURS = [
  "nigger*", "nigga*", "niggaz", "gook", "gooks", "spic", "spics", "kike*", "wetback*", "raghead*", "towelhead*", "sandnigger*",
  "faggot*", "fagot*", "tranny", "trannies", "retard", "retards", "retarded", "paki", "pakis", "beaner", "beaners", "coons", "jungle bunny",
  "porch monkey*", "zipperhead*", "golliwog*", "shemale*",
];
const SPAM = ["viagra", "cialis", "payday loan*", "buy followers", "casino bonus*", "crypto giveaway*", "whatsapp me", "telegram me"];

const LEET = { "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "@": "a", "$": "s", "!": "i" };

// Lower-case, fold accents, map leetspeak, every non-letter → one space (so "P0RN!" → "porni", "n.i.g" stays split: conservative).
export function normalise(s) {
  return String(s == null ? "" : s).normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/[0134578@$!]/g, (c) => LEET[c] || c).replace(/[^a-z]+/g, " ").trim();
}

function compile(list) {
  const parts = list.map((w) => {
    const pre = w.endsWith("*"), body = (pre ? w.slice(0, -1) : w).split(" ").map((x) => x.replace(/[^a-z]/g, "")).join(" +");
    return body + (pre ? "[a-z]*" : "");
  });
  return new RegExp(`(?:^| )(?:${parts.join("|")})(?= |$)`);
}
const RE = { adult: compile(ADULT), slur: compile(SLURS), spam: compile(SPAM), allow: new RegExp(`(?:^| )(?:${ALLOW.map((w) => w.replace(/ /g, " +")).join("|")})(?= |$)`, "g") };
// Stretched spellings of the main porn terms ("pooorn", "xxxx", "nnsfw").
const STRETCH = /(?:^| )(?:x{3,}|p+o+r+n+[a-z]*|n+s+f+w+|p+u+s+s+y+|h+e+n+t+a+i+)(?= |$)/;
// The forms a text is checked in: as written; runs of 3+ same letters cut to 2 ("pussyyy" → "pussyy"); single letters joined ("p o r n" → "porn").
function forms(n) {
  const a = n.replace(RE.allow, " ").replace(/ +/g, " ").trim();
  const b = a.replace(/([a-z])\1{2,}/g, "$1$1");
  const c = a.replace(/(?:^| )((?:[a-z] ){2,}[a-z])(?= |$)/g, (m, g) => " " + g.replace(/ /g, "")).trim();
  return [...new Set([a, b, c])];
}

const URL_RE = /(?:https?:\/\/|www\.)[^\s]+/gi;
// A phone number: 9–15 digits with optional +, spaces, dots, dashes or brackets between them (hex colours have letters, years are 4 digits).
const PHONE_RE = /(?:\+|\b)\d(?:[\s().-]{0,2}\d){8,14}\b/g;
const CONTACT_RE = /\b(?:call|whatsapp|whats app|telegram|wechat|text me|sms|dm me|contact|hotline|wa\.me|t\.me)\b/i;

// → null when the text is fine, else the reason ("adult" | "slur" | "spam"). Never throws.
export function textProblem(s) {
  const raw = String(s == null ? "" : s);
  if (!raw.trim()) return null;
  const fs = forms(normalise(raw));
  if (fs.some((n) => RE.slur.test(n))) return "slur";
  if (fs.some((n) => RE.adult.test(n) || STRETCH.test(n))) return "adult";
  if (fs.some((n) => RE.spam.test(n))) return "spam";
  if ((raw.match(URL_RE) || []).length >= 3) return "spam";
  const phones = raw.match(PHONE_RE) || [];
  if (phones.length >= 2 || (phones.length === 1 && CONTACT_RE.test(raw))) return "spam";
  if (/\b(?:wa\.me|t\.me)\/\S+/i.test(raw)) return "spam";
  return null;
}

export const FILTER_LISTS = { ADULT, SLURS, SPAM, ALLOW };
