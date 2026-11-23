// 23-Nov-2026: copyrighted-franchise notice for search_design_inspiration.
// A query that names a franchise (Dota 2, Warhammer, Naruto, Disney…) cannot be answered with that franchise's artwork: it is
// owned by its publisher and is not in the library. Instead of an empty list, the search runs on an ORIGINAL look-alike genre
// (grimdark fantasy / gritty horror for dark game worlds; anime or cartoon style for anime and cartoons) and the answer leads with
// one short line saying so and offering the alternative. Pure (no D1), never throws.
const W_ = (alt) => new RegExp(`(^|[^\\p{L}\\p{N}])(${alt})($|[^\\p{L}\\p{N}])`, "iu");
const DARK = W_([
  "dota ?2?", "warhammer(?: 40,?000| 40k| age of sigmar)?", "40k", "age of sigmar", "league of legends", "diablo(?: ?(?:2|3|4|iv))?", "world of warcraft", "warcraft", "starcraft",
  "elden ring", "dark souls", "bloodborne", "witcher", "skyrim", "path of exile", "magic the gathering", "mtg", "dungeons (?:and|&) dragons", "d&d",
  "lord of the rings", "game of thrones", "resident evil", "silent hill", "castlevania", "doom", "hollow knight",
].join("|"));
const ANIME = W_([
  "naruto", "one piece", "dragon ?ball(?: z)?", "attack on titan", "demon slayer", "my hero academia", "jujutsu kaisen", "sailor moon", "evangelion",
  "bleach", "death note", "hunter x hunter", "one punch man", "spy x family", "chainsaw man", "studio ghibli", "ghibli", "totoro", "pok[eé]mon",
  "pikachu", "sword art online", "tokyo ghoul", "fullmetal alchemist", "steins;?gate", "cowboy bebop", "akira", "gundam", "hello kitty", "sanrio",
].join("|"));
const CARTOON = W_([
  "disney", "pixar", "simpsons", "spongebob", "looney tunes", "bugs bunny", "mickey mouse", "rick and morty", "adventure time", "south park",
  "family guy", "scooby[- ]?doo", "tom and jerry", "marvel", "dc comics", "batman", "superman", "spider-?man", "avengers", "star wars", "mario", "zelda",
  "minecraft", "fortnite", "roblox", "sonic the hedgehog", "peppa pig", "bluey", "paw patrol", "frozen", "lego",
].join("|"));
const KINDS = [
  { re: DARK, name: "dark fantasy and gaming worlds", alt: "grimdark fantasy gritty horror dark", pool: "alt-grimdark", label: "a gritty horror / grimdark fantasy look" },
  { re: ANIME, name: "anime and manga", alt: "anime manga cel shaded illustration", pool: "alt-anime", label: "original anime and manga-style work" },
  { re: CARTOON, name: "cartoons, comics and games", alt: "cartoon character illustration playful mascot", pool: "alt-cartoon", label: "original cartoon and character illustration" },
];
// 23-Nov-2026: curated look-alike pools (tags alt-grimdark / alt-anime / alt-cartoon, hand-picked public-domain + generic items in D1).
// A franchise answer is drawn from its pool first (museum + design rows); the loose phrase search `alt` is only the backup.
// Per-franchise bias inside a pool: a word that narrows the pool (kept only if it still leaves >= 3 items).
export const IP_BIAS = [[/ghibli|totoro/i, "landscape"], [/disney|pixar|mickey|frozen/i, "children"]];
export const ipBias = (franchise) => { for (const [re, w] of IP_BIAS) if (re.test(franchise)) return w; return ""; };
// Stable per-franchise rotation: ORDER BY (rowid * K) % 1009, so Naruto and Ghibli (same pool) do not return the identical top 5.
export function ipOrder(key) { let h = 7; for (const c of String(key || "").toLowerCase()) h = (h * 31 + c.charCodeAt(0)) % 100003; return `(rowid * ${(h * 2 + 1) % 99991}) % 1009, id`; }
// Generic style queries with no franchise ("grimdark fantasy", "dark fantasy art", "anime style", "cartoon style") draw from the same pools, no notice.
const STYLE = [[/(^|[^\p{L}])(grimdark|dark fantasy|gritty horror|horror fantasy)($|[^\p{L}])/iu, "alt-grimdark"], [/(^|[^\p{L}])anime[- ]?style|manga[- ]?style($|[^\p{L}])/iu, "alt-anime"], [/(^|[^\p{L}])(vintage|retro|classic)?[ -]?cartoon[- ]?(style|illustration|characters?)($|[^\p{L}])/iu, "alt-cartoon"]];
export function ipStylePool(q) { try { const s = String(q || ""); for (const [re, pool] of STYLE) if (re.test(s)) return pool; } catch (_) {} return null; }
export const IP_NOTICE_HEAD = "Copyright note:";
export function ipFranchise(q) {
  try {
    const s = String(q || "");
    for (const k of KINDS) { const m = k.re.exec(s); if (m) return { franchise: m[2].trim(), kind: k }; }
  } catch (_) { /* never break a search */ }
  return null;
}
export function ipNoticeText(ip) {
  const f = ip.franchise.replace(/\b\w/g, (c) => c.toUpperCase());
  return `${IP_NOTICE_HEAD} ${f} artwork is copyrighted by its owner, so we can't show it here. Showing similar-mood alternatives instead (${ip.kind.label}), not that franchise's own art. ` +
    `Say if you'd rather see another direction, such as a different genre or palette.`;
}
export function withIpNotice(ip, result) {
  try {
    if (!ip || !result || result.isError || !Array.isArray(result.content)) return result;
    const first = result.content.find((c) => c && c.type === "text" && typeof c.text === "string");
    if (!first || first.text.includes(IP_NOTICE_HEAD)) return result;
    first.text = ipNoticeText(ip) + "\n\n" + first.text;
  } catch (_) { /* a notice must never break a search answer */ }
  return result;
}
