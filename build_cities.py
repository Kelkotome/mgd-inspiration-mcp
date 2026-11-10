#!/usr/bin/env python3
"""build_cities.py (10-Nov-2026, mcp-gaps-r1): the world city list behind make_star_map's `city` argument.

  python3 -I build_cities.py GEONAMES_DIR [OUT=src/cities_geonames.js]

The output is an ES module (`export default {...}`) rather than .json, so node tests can import it without an import attribute.

GEONAMES_DIR holds cities15000.txt, countryInfo.txt and admin1CodesASCII.txt from https://download.geonames.org/export/dump/
(GeoNames, CC BY 4.0, https://www.geonames.org/). Nothing is fetched here; download and unzip them first.

Kept: every city of 100,000+ people, every national capital (PPLC) and every first-level admin capital (PPLA) in cities15000.
Per city: name, lat/lon rounded to 3 decimals (about 100 m, far finer than a star map needs), country code, admin1 code (only where
a region name is shipped, see A1_COUNTRIES), IANA time zone (index into `tz`), population in thousands (picks the bigger of two
same-named cities), and alternate names for cities of 500,000+ and capitals or seats of government (Latin-script only, so "Cologne", "Wien", "Bombay", "Saigon" work).
Cities are written largest population first, so the first match is the bigger of two same-named cities. The Worker folds case and accents itself (src/cities.js), so names are shipped as GeoNames spells them.
"""
import json, os, re, sys, unicodedata

SRC = sys.argv[1]
OUT = sys.argv[2] if len(sys.argv) > 2 else os.path.join(os.path.dirname(os.path.abspath(__file__)), "src", "cities_geonames.js")
MIN_POP, ALT_POP = 100_000, 500_000
# Region names ("Portland, Oregon", "London, Ontario", "Perth, WA") only where people write them; elsewhere "City, Country" is enough.
A1_COUNTRIES = {"US", "CA", "AU", "GB", "IN", "BR", "MX", "DE", "ES", "IT", "CN", "NZ", "ZA", "IE"}
US_ABBR = dict(AL="Alabama", AK="Alaska", AZ="Arizona", AR="Arkansas", CA="California", CO="Colorado", CT="Connecticut", DE="Delaware",
               DC="District of Columbia", FL="Florida", GA="Georgia", HI="Hawaii", ID="Idaho", IL="Illinois", IN="Indiana", IA="Iowa", KS="Kansas",
               KY="Kentucky", LA="Louisiana", ME="Maine", MD="Maryland", MA="Massachusetts", MI="Michigan", MN="Minnesota", MS="Mississippi",
               MO="Missouri", MT="Montana", NE="Nebraska", NV="Nevada", NH="New Hampshire", NJ="New Jersey", NM="New Mexico", NY="New York",
               NC="North Carolina", ND="North Dakota", OH="Ohio", OK="Oklahoma", OR="Oregon", PA="Pennsylvania", RI="Rhode Island",
               SC="South Carolina", SD="South Dakota", TN="Tennessee", TX="Texas", UT="Utah", VT="Vermont", VA="Virginia", WA="Washington",
               WV="West Virginia", WI="Wisconsin", WY="Wyoming", PR="Puerto Rico")


def fold(s):
    s = unicodedata.normalize("NFKD", s.replace("ß", "ss").replace("æ", "ae").replace("Æ", "Ae").replace("ø", "o").replace("Ø", "O")
                              .replace("ł", "l").replace("Ł", "L").replace("đ", "d").replace("Đ", "D").replace("ı", "i"))
    return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9]+", " ", "".join(c for c in s if not unicodedata.combining(c)).lower())).strip()


def latin(s):
    return all(ord(c) < 0x250 or unicodedata.combining(c) or c in "ʻʼ’" for c in s)


rows = [l.rstrip("\n").split("\t") for l in open(os.path.join(SRC, "cities15000.txt"), encoding="utf-8")]
countries = {}
for l in open(os.path.join(SRC, "countryInfo.txt"), encoding="utf-8"):
    if l.startswith("#"):
        continue
    f = l.rstrip("\n").split("\t")
    countries[f[0]] = f[4]
admin1 = {}
for l in open(os.path.join(SRC, "admin1CodesASCII.txt"), encoding="utf-8"):
    k, name, ascii_, _ = l.rstrip("\n").split("\t")
    admin1[k] = name

primary = {fold(p) for r in rows for n in (r[1], r[2]) for p in [n] + n.split("/")}  # an alternate never shadows a real city's own name
keep = [r for r in rows if int(r[14] or 0) >= MIN_POP or r[7] in ("PPLC", "PPLA")]
keep.sort(key=lambda r: -int(r[14] or 0))
tzs = sorted({r[17] for r in keep})
tzi = {t: i for i, t in enumerate(tzs)}
cities, a1_used = [], {}
for r in keep:
    name, lat, lon, cc, a1, tz, pop = r[1], float(r[4]), float(r[5]), r[8], r[10], r[17], int(r[14] or 0)
    a1k = f"{cc}.{a1}"
    reg = a1 if cc in A1_COUNTRIES and a1k in admin1 else ""
    if reg:
        a1_used[a1k] = admin1[a1k]
    alts = []
    if pop >= ALT_POP or r[7] in ("PPLC", "PPLG"):
        seen = {fold(name)}
        for a in r[3].split(","):
            a = a.strip()
            fa = fold(a)
            # Latin script, 3+ letters, no digits, not an airport / postal code (all caps), not a near-copy of the name
            # and written as a proper name (capital first, no apostrophe transliterations like "Ch'eng-tu" or "(Chongqing Shi)")
            if (not a or not latin(a) or len(fa) < 3 or len(a) > 28 or re.search(r"[\d'()ʼ’ʻ]", a) or (a.isupper() and len(a) <= 4)
                    or not a[0].isupper() or fa in seen or len(fa) < 4 or fa in primary):
                continue
            seen.add(fa)
            alts.append(a)
    cities.append([name, round(lat, 3), round(lon, 3), cc, reg, tzi[tz], "|".join(alts)])

# Two different places with the same folded alternate name: keep it only on the bigger one (list is sorted by population).
owner = {}
for c in cities:
    owner.setdefault(fold(c[0]), c)
for c in cities:
    if c[6]:
        kept = [a for a in c[6].split("|") if owner.setdefault(fold(a), c) is c]
        c[6] = "|".join(kept)
for c in cities:
    if not c[6]:
        c.pop()

data = {
    "source": "GeoNames cities15000 + countryInfo + admin1CodesASCII (https://www.geonames.org/, CC BY 4.0), downloaded 10-Nov-2026; "
              f"cities of {MIN_POP:,}+ people plus national and first-level admin capitals",
    "licence": "CC BY 4.0, https://creativecommons.org/licenses/by/4.0/ ; attribution: GeoNames (geonames.org)",
    "fields": ["name", "lat", "lon", "country", "admin1", "tz_index", "alt_names|..."],
    "order": "largest population first (the resolver takes the first match)",
    "tz": tzs,
    "countries": {k: countries[k] for k in sorted({c[3] for c in cities})},
    "admin1": dict(sorted(a1_used.items())),
    "us_abbr": US_ABBR,
    "cities": cities,
}
with open(OUT, "w", encoding="utf-8") as fh:
    fh.write("// GENERATED by build_cities.py from GeoNames (https://www.geonames.org/, CC BY 4.0). Do not edit by hand.\n")
    fh.write("export default " + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";\n")
print(f"{len(cities)} cities, {sum(1 for c in cities if len(c) > 6)} with alternates, {len(tzs)} zones, {len(data['admin1'])} regions, "
      f"{os.path.getsize(OUT):,} bytes -> {OUT}")
