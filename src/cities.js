// World city lookup for make_star_map (mcp-gaps-r1, 10-Nov-2026). Live failure 2026-11: 'Unknown city "Hamburg"' — the tool only knew
// the ~40 cities bundled with the /tools/star-map page (tools_core72.js CITIES). This adds 7,461 places from GeoNames (cities15000:
// every city of 100,000+ people, every national capital and every first-level admin capital), built by build_cities.py.
// Data: GeoNames, https://www.geonames.org/, CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/). Attribution is returned with
// every answer that used it (CITY_CREDIT).
// Matching: case-, accent- and punctuation-insensitive ("SAO PAULO", "São Paulo", "sao-paulo"), "St."/"Saint", Latin-script alternate
// names for cities of 1M+ ("Cologne", "Wien", "Bombay", "Saigon"), "City, Country", "City, Region" (US/CA/AU/GB/IN/BR/MX/DE/ES/IT/CN/
// NZ/ZA/IE regions, US state codes) and "City Country" without a comma. Of two same-named places the larger wins ("Portland" =
// Portland, Oregon) unless a qualifier says otherwise ("Portland, Maine"). A qualifier we recognise but that matches none of the
// candidates is a miss, never a silent swap ("Paris, Texas" is not Paris, France). A single-edit typo of a 7+ letter name is allowed.
import G from "./cities_geonames.js";
import { btLev } from "./search_extras.js";

export const CITY_CREDIT = "City location and time zone: GeoNames (geonames.org), CC BY 4.0.";
export const CITY_COUNT = G.cities.length;

const SPECIAL = { "ß": "ss", "æ": "ae", "Æ": "ae", "ø": "o", "Ø": "o", "ł": "l", "Ł": "l", "đ": "d", "Đ": "d", "ı": "i", "œ": "oe", "Œ": "oe" };
export function cityFold(s) {
  return String(s == null ? "" : s).replace(/[ßæÆøØłŁđĐıœŒ]/g, (c) => SPECIAL[c]).normalize("NFKD").replace(/\p{M}/gu, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, " ").trim()
    .replace(/\bst\b/g, "saint").replace(/\bste\b/g, "sainte").replace(/\bmt\b/g, "mount").replace(/\bft\b/g, "fort");
}

const COUNTRY_ALIAS = {
  usa: "US", us: "US", "u s": "US", "u s a": "US", america: "US", "united states of america": "US", "the united states": "US",
  uk: "GB", "u k": "GB", britain: "GB", "great britain": "GB", "the uk": "GB", england: "GB", scotland: "GB", wales: "GB", "northern ireland": "GB",
  uae: "AE", emirates: "AE", korea: "KR", "republic of korea": "KR", "czech republic": "CZ", holland: "NL", netherlands: "NL",
  "russian federation": "RU", turkiye: "TR", "viet nam": "VN", "cote d ivoire": "CI", burma: "MM", "dr congo": "CD", drc: "CD",
  "hong kong sar": "HK", macau: "MO", "cape verde": "CV", swaziland: "SZ", "macedonia": "MK", palestine: "PS",
  deutschland: "DE", espana: "ES", italia: "IT", brasil: "BR", schweiz: "CH", suisse: "CH", svizzera: "CH", osterreich: "AT",
  nederland: "NL", polska: "PL", sverige: "SE", norge: "NO", danmark: "DK", suomi: "FI", nippon: "JP", nihon: "JP", "mexico df": "MX",
};

let IDX = null;
function index() {
  if (IDX) return IDX;
  const names = new Map(), countries = new Map(), regions = new Map(), primary = [];
  const add = (m, k, v) => { if (!k) return; if (!m.has(k)) m.set(k, []); if (!m.get(k).includes(v)) m.get(k).push(v); };
  G.cities.forEach((c, i) => {
    const k = cityFold(c[0]); add(names, k, i); primary.push(k);
    // "Biel/Bienne", "Bruxelles - Brussel": every part of a multi-name is a name too
    if (/[\/-]/.test(c[0])) for (const p of c[0].split(/\s*[\/]\s*|\s+-\s+/)) add(names, cityFold(p), i);
    if (c[6]) for (const a of c[6].split("|")) add(names, cityFold(a), i);
  });
  for (const [cc, n] of Object.entries(G.countries)) { add(countries, cityFold(n), cc); add(countries, cc.toLowerCase(), cc); add(countries, cityFold(n.replace(/^the /i, "")), cc); }
  for (const [k, cc] of Object.entries(COUNTRY_ALIAS)) add(countries, k, cc);
  for (const [k, n] of Object.entries(G.admin1)) add(regions, cityFold(n), k);
  for (const [ab, n] of Object.entries(G.us_abbr)) { const key = Object.keys(G.admin1).find((k) => k.startsWith("US.") && G.admin1[k] === n); if (key) add(regions, ab.toLowerCase(), key); }
  // GB home nations as regions too ("Edinburgh, Scotland" filters to GB.SCT; the country alias above keeps "Leeds, England" working)
  IDX = { names, countries, regions, primary };
  return IDX;
}

// A qualifier ("Germany", "OR", "Ontario", "CA") → the set of country codes and region keys it can mean, or null when unknown.
function qualifier(q) {
  const { countries, regions } = index(), k = cityFold(q);
  const cc = countries.get(k) || [], rg = regions.get(k) || [];
  return cc.length || rg.length ? { cc, rg } : null;
}
const passes = (c, quals) => quals.every((q) => q.cc.includes(c[3]) || q.rg.includes(c[3] + "." + c[4]));

function candidates(name) {
  const { names } = index(), k = cityFold(name);
  if (!k) return [];
  for (const v of [k, k.replace(/^the /, ""), k + " city", k.replace(/ city$/, "")]) { const hit = names.get(v); if (hit) return hit; }
  return [];
}

function display(c) {
  const country = c[3] === "US" ? "USA" : G.countries[c[3]] || c[3];
  const region = ["US", "CA", "AU"].includes(c[3]) && c[4] && G.admin1[c[3] + "." + c[4]];
  return [c[0], region && region !== c[0] ? region : null, country].filter(Boolean).join(", ");
}
const out = (i, how) => { const c = G.cities[i]; return { name: display(c), city: c[0], lat: c[1], lon: c[2], tz: G.tz[c[5]], country: c[3], match: how }; };

function pick(name, quals, how) {
  const hits = candidates(name).filter((i) => passes(G.cities[i], quals)).sort((a, b) => a - b);  // index order = population order
  return hits.length ? out(hits[0], how) : null;
}

export function findCity(raw) {
  const s = String(raw == null ? "" : raw).trim().slice(0, 120);
  if (!cityFold(s)) return null;
  const parts = s.split(/\s*[,;]\s*/).filter(Boolean);
  const name = parts[0], quals = [];
  let unknownQual = false;
  for (const p of parts.slice(1)) { const q = qualifier(p); if (q) quals.push(q); else unknownQual = true; }
  let r = pick(name, quals, unknownQual ? "name" : "exact");
  if (r || (quals.length && candidates(name).length)) return r;  // a recognised qualifier that rules out every candidate is a miss
  if (parts.length === 1) {
    // "Hamburg Germany", "Portland Oregon", "Sao Paulo Brazil": split trailing words off as a qualifier
    const w = cityFold(s).split(" ");
    for (let n = Math.min(3, w.length - 1); n >= 1; n--) {
      const q = qualifier(w.slice(-n).join(" "));
      if (!q) continue;
      r = pick(w.slice(0, -n).join(" "), [q], "exact");
      if (r) return r;
    }
  }
  // one-edit typo of a long name ("Hamburgh", "Johanesburg"), largest city first
  const k = cityFold(name);
  if (k.length >= 7) {
    const { primary } = index();
    for (let i = 0; i < primary.length; i++) {
      if (Math.abs(primary[i].length - k.length) <= 1 && btLev(k, primary[i], 1) <= 1 && passes(G.cities[i], quals)) return out(i, "fuzzy");
    }
  }
  return null;
}
