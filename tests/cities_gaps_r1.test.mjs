// mcp-gaps-r1 (10-Nov-2026), make_star_map city lookup: live failure 'Unknown city "Hamburg"; pass lat and lon instead.'
// Reference coordinates below are typed in from public city-centre values (not read from the bundled data), tolerance 0.1°.
// Run: node tests/cities_gaps_r1.test.mjs
import { findCity, cityFold, CITY_COUNT, CITY_CREDIT } from "../src/cities.js";
import { callTools72Tool as call } from "../src/mcp_tools72.js";
let ok = 0, fail = 0;
const t = (name, cond, info) => { cond ? ok++ : fail++; if (!cond) console.log("FAIL " + name + " | " + String(JSON.stringify(info)).slice(0, 300)); };
const near = (a, b, e = 0.1) => Math.abs(a - b) <= e;

t("7,000+ places bundled", CITY_COUNT > 7000, CITY_COUNT);
t("fold: case, accents, punctuation, St.", cityFold("  SÃO-Paulo ") === "sao paulo" && cityFold("Zürich") === "zurich" && cityFold("St. Louis") === "saint louis" && cityFold("Kraków") === "krakow" && cityFold("Straße") === "strasse", [cityFold("  SÃO-Paulo "), cityFold("St. Louis")]);

// [query, want city (display starts with), lat, lon, IANA zone]
const CASES = [
  ["Hamburg", "Hamburg, Germany", 53.55, 9.99, "Europe/Berlin"],
  ["hamburg", "Hamburg, Germany", 53.55, 9.99, "Europe/Berlin"],
  ["HAMBURG, Germany", "Hamburg, Germany", 53.55, 9.99, "Europe/Berlin"],
  ["Hamburg Germany", "Hamburg, Germany", 53.55, 9.99, "Europe/Berlin"],
  ["Hamburg, DE", "Hamburg, Germany", 53.55, 9.99, "Europe/Berlin"],
  ["Hamburg, Deutschland", "Hamburg, Germany", 53.55, 9.99, "Europe/Berlin"],
  ["München", "Munich, Germany", 48.14, 11.58, "Europe/Berlin"],
  ["Cologne", "Köln, Germany", 50.94, 6.96, "Europe/Berlin"],
  ["Sao Paulo, Brazil", "São Paulo, Brazil", -23.55, -46.63, "America/Sao_Paulo"],
  ["reykjavik", "Reykjavík, Iceland", 64.15, -21.94, "Atlantic/Reykjavik"],
  ["Portland, OR", "Portland, Oregon, USA", 45.52, -122.68, "America/Los_Angeles"],
  ["Portland", "Portland, Oregon, USA", 45.52, -122.68, "America/Los_Angeles"],
  ["London, Ontario", "London, Ontario, Canada", 42.98, -81.25, "America/Toronto"],
  ["Cape Town", "Cape Town, South Africa", -33.92, 18.42, "Africa/Johannesburg"],
  ["Kiev", "Kyiv, Ukraine", 50.45, 30.52, "Europe/Kyiv"],
  ["St. Petersburg, Russia", "Saint Petersburg, Russia", 59.94, 30.31, "Europe/Moscow"],
  ["Bangalore", "Bengaluru, India", 12.97, 77.59, "Asia/Kolkata"],
  ["Saigon", "Ho Chi Minh City, Vietnam", 10.82, 106.63, "Asia/Ho_Chi_Minh"],
  ["Zurich", "Zürich, Switzerland", 47.37, 8.54, "Europe/Zurich"],
  ["Den Haag", "The Hague, The Netherlands", 52.08, 4.30, "Europe/Amsterdam"],
  ["Wellington, NZ", "Wellington, New Zealand", -41.29, 174.78, "Pacific/Auckland"],
  ["Honolulu, HI", "Honolulu, Hawaii, USA", 21.31, -157.86, "Pacific/Honolulu"],
  ["Ulaanbaatar", "Ulan Bator, Mongolia", 47.92, 106.92, "Asia/Ulaanbaatar"],
  ["Edinburgh, Scotland", "Edinburgh, United Kingdom", 55.95, -3.19, "Europe/London"],
  ["Los Angeles, CA", "Los Angeles, California, USA", 34.05, -118.24, "America/Los_Angeles"],
  ["Toronto, CA", "Toronto, Ontario, Canada", 43.65, -79.38, "America/Toronto"],
  ["Dubai, UAE", "Dubai, United Arab Emirates", 25.2, 55.27, "Asia/Dubai"],
  ["Hamburgh", "Hamburg, Germany", 53.55, 9.99, "Europe/Berlin"],
];
for (const [q, name, lat, lon, tz] of CASES) {
  const r = findCity(q);
  t(`city "${q}"`, r && r.name === name && near(r.lat, lat, 0.15) && near(r.lon, lon, 0.15) && r.tz === tz, r);
}
for (const q of ["Atlantis", "Narnia", "Paris, Texas", "Vienna, VA", "Zzyzx", "", null, "   ", "Hamburg, Mars"]) {
  const r = findCity(q);
  // "Hamburg, Mars": an unknown qualifier is ignored, so this one does resolve; the rest are misses
  t(`miss "${q}"`, q === "Hamburg, Mars" ? r && r.city === "Hamburg" : r === null, r);
}

// End to end through the MCP layer
const sm = async (args) => call("make_star_map", { date: "2026-06-21", time: "22:00", ...args });
let r = await sm({ city: "Hamburg" }), s = r.structuredContent;
t("make_star_map Hamburg: no error", !r.isError, r.content && r.content[0].text.slice(0, 200));
t("Hamburg: place, CEST = UTC+2, 20:00 UTC", s && s.place === "Hamburg, Germany" && s.utc_offset_hours === 2 && s.utc === "2026-06-21T20:00:00.000Z" && near(s.lat, 53.55) && near(s.lon, 9.99), s && [s.place, s.utc_offset_hours, s.utc]);
t("Hamburg: GeoNames credit in text and structuredContent", r.content[0].text.includes(CITY_CREDIT) && /GeoNames/.test(s.city_source) && s.city_match === "exact", s && s.city_source);
r = await sm({ city: "Hamburg", tz: "UTC" }); s = r.structuredContent;
t("explicit tz wins over the city zone", !r.isError && s.utc_offset_hours === 0, s && s.utc_offset_hours);
r = await sm({ city: "Hamburg", place: "Our first flat" }); s = r.structuredContent;
t("explicit place wins", !r.isError && /Our first flat/.test(s.svg || ""), s && s.place);
r = await sm({ city: "Portland, OR", date: "2026-12-24" }); s = r.structuredContent;
t("Portland, OR in December = UTC-8", !r.isError && s.utc_offset_hours === -8 && s.place === "Portland, Oregon, USA", s && [s.utc_offset_hours, s.place]);
r = await sm({ city: "Wellington, NZ" }); s = r.structuredContent;
t("Wellington in June = UTC+12 (NZST)", !r.isError && s.utc_offset_hours === 12, s && s.utc_offset_hours);
r = await sm({ city: "Hamburgh" });
t("typo answer says it is the closest match", !r.isError && /Closest city name match for "Hamburgh"/.test(r.content[0].text), r.content[0].text.slice(0, 300));
// the page's own list is still first: same names and zones as before
r = await sm({ city: "Tokyo" }); s = r.structuredContent;
t("legacy Tokyo unchanged (no GeoNames credit)", !r.isError && s.place === "Tokyo, Japan" && s.utc_offset_hours === 9 && !s.city_source && !r.content[0].text.includes("GeoNames"), s && s.place);
r = await sm({ city: "Washington, DC" }); s = r.structuredContent;
t("legacy Washington, DC unchanged", !r.isError && s.place === "Washington, DC, USA", s && s.place);
r = await sm({ city: "Atlantis" });
t("unknown city is still an error and says what is known", r.isError && /Unknown city "Atlantis"; pass lat and lon instead\. Cities of 100,000\+ people/.test(r.content[0].text), r.content[0].text);
r = await sm({ city: "Hamburg", lat: 1.3, lon: 103.8 }); s = r.structuredContent;
t("lat/lon given with a city: lat/lon win (as before)", !r.isError && near(s.lat, 1.3, 0.001) && s.place === null, s && [s.lat, s.place]);

console.log(`${ok} passed, ${fail} failed`);
if (fail) process.exit(1);
