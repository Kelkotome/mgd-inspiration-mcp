// Text filter for user-written text on shared app boards (app boards Phase 1, 23-Nov-2026; tests/test_text_filter.mjs).
// Conservative on purpose: whole words only, case-insensitive, accents folded, light leetspeak (0→o 1→i 3→e 4→a 5→s 7→t @→a $→s !→i).
// It blocks (a) explicit sexual / adult-site terms, (b) slurs, (c) obvious spam (many links, phone-number adverts, pill spam).
// Words that are ordinary in design talk are NOT listed even when they can be rude elsewhere (nude(s), naked, sexy, sex, cock, dick, dyke,
// fag, pussy, chink, milfoil, escorts — "nude palette", "Moby Dick", "Sex Pistols poster", "Pussy Riot", "a chink of light"); general
// swearing is not blocked either (only sexual / adult-site terms), so a designer's note is never refused for a colour name or a title.
// A word ending in * matches as a prefix (porn* → porno, pornhub, pornography). Phrases match with any run of spaces between words.
// URLs are allowed (stored and later shown as plain text, never as links); only 3+ links in one field count as spam.

const ADULT = [
  "porn*", "xxx", "nsfw", "hentai", "blowjob*", "handjob*", "cumshot*", "creampie*", "gangbang*", "bukkake", "deepthroat*",
  "milf", "milfs", "dildo*", "fleshlight*", "camgirl*", "camboy*", "sexcam*", "onlyfans", "xvideos", "xhamster", "redtube", "youporn",
  "brazzers", "chaturbate", "escort service*", "escort agency", "sex chat*", "sex cam*", "anal sex", "orgasm*", "masturbat*",
  "titties", "boobies", "jerk off", "jack off", "rimjob*", "bdsm", "fetish porn",
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
  return String(s == null ? "" : s).normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase()
    .replace(/[0134578@$!]/g, (c) => LEET[c] || c).replace(/[^a-z]+/g, " ").trim();
}

function compile(list) {
  const parts = list.map((w) => {
    const pre = w.endsWith("*"), body = (pre ? w.slice(0, -1) : w).split(" ").map((x) => x.replace(/[^a-z]/g, "")).join(" +");
    return body + (pre ? "[a-z]*" : "");
  });
  return new RegExp(`(?:^| )(?:${parts.join("|")})(?= |$)`);
}
const RE = { adult: compile(ADULT), slur: compile(SLURS), spam: compile(SPAM) };

const URL_RE = /(?:https?:\/\/|www\.)[^\s]+/gi;
// A phone number: 9–15 digits with optional +, spaces, dots, dashes or brackets between them (hex colours have letters, years are 4 digits).
const PHONE_RE = /(?:\+|\b)\d(?:[\s().-]{0,2}\d){8,14}\b/g;
const CONTACT_RE = /\b(?:call|whatsapp|whats app|telegram|wechat|text me|sms|dm me|contact|hotline|wa\.me|t\.me)\b/i;

// → null when the text is fine, else the reason ("adult" | "slur" | "spam"). Never throws.
export function textProblem(s) {
  const raw = String(s == null ? "" : s);
  if (!raw.trim()) return null;
  const n = normalise(raw);
  if (RE.slur.test(n)) return "slur";
  if (RE.adult.test(n)) return "adult";
  if (RE.spam.test(n)) return "spam";
  if ((raw.match(URL_RE) || []).length >= 3) return "spam";
  const phones = raw.match(PHONE_RE) || [];
  if (phones.length >= 2 || (phones.length === 1 && CONTACT_RE.test(raw))) return "spam";
  if (/\b(?:wa\.me|t\.me)\/\S+/i.test(raw)) return "spam";
  return null;
}

export const FILTER_LISTS = { ADULT, SLURS, SPAM };
