/* Hotel website template (Halcyon Quay — fictional boutique harbourside hotel). Full responsive home page:
   nav, centred hero with a docked check-in/check-out/guests booking bar, rooms & suites list with from-rates,
   dining & bar, spa & amenities, the neighbourhood with walk times, offers & packages, guest notes,
   location and getting here, a front-desk questions form, footer. Harbour and room "photos" are inline SVG in fixed natural tones. */
const { ic, esc } = require("../lib");
const K = require("../sitekit");

const CSS = `<style>
.ho-hero{padding-top:56px;padding-bottom:64px;text-align:center}
.ho-hero h1{font-size:calc(54px * var(--hs));line-height:1.02;max-width:880px;margin:12px auto 14px}
.ho-hero .sk-lede{margin:0 auto 24px}
.ho-shot{aspect-ratio:1104/340;border-radius:var(--radius-lg) var(--radius-lg) 0 0}
.ho-bar{display:grid;grid-template-columns:repeat(3,minmax(0,1fr)) minmax(0,.9fr) auto;gap:0;align-items:stretch;text-align:left;padding:0;border-radius:0 0 var(--radius-lg) var(--radius-lg);overflow:hidden}
.ho-bar .sk-field{padding:16px 22px;border-right:1px solid var(--border);gap:2px}
.ho-bar .sk-field label{font-size:12px;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;font-weight:600}
.ho-bar .ho-v{font-weight:600;font-size:16px;display:flex;align-items:center;gap:8px;white-space:nowrap}
.ho-bar .btn{height:auto;border-radius:0;padding:0 34px;font-size:15px}
.ho-note{display:flex;justify-content:center;flex-wrap:wrap;gap:8px 24px;margin-top:18px;font-size:14px;color:var(--muted)}
.ho-note span{display:inline-flex;gap:6px;align-items:center}
.ho-rooms{display:grid;gap:0;border-top:1px solid var(--border)}
.ho-room{display:grid;grid-template-columns:170px minmax(0,1fr) 200px;gap:32px;align-items:center;padding:16px 0;border-bottom:1px solid var(--border)}
.ho-room .sk-photo{aspect-ratio:3/2;border-radius:var(--radius)}
.ho-room ul{list-style:none;display:flex;flex-wrap:wrap;gap:6px 18px;color:var(--muted);font-size:14px;margin-top:10px}
.ho-room li{display:inline-flex;gap:6px;align-items:center}
.ho-rate{text-align:right;display:grid;gap:8px;justify-items:end}
.ho-dine{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:28px}
.ho-venue{padding:0;overflow:hidden;display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr)}
.ho-venue .sk-photo{border-radius:0;min-height:100%}
.ho-venue>div:last-child{padding:24px 26px;display:grid;gap:10px;align-content:start}
.ho-hours{display:grid;grid-template-columns:auto 1fr;gap:4px 18px;font-size:14px;margin-top:4px}
.ho-hours dt{font-weight:600}.ho-hours dd{color:var(--muted)}
.ho-spa{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,2fr);gap:40px;align-items:stretch}
.ho-spa .sk-photo{min-height:220px}
.ho-amen{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px 28px;align-content:center}
.ho-amen>div{display:grid;grid-template-columns:40px minmax(0,1fr);gap:14px;align-items:start}
.ho-ic{width:40px;height:40px;border-radius:var(--radius);display:grid;place-items:center;background:color-mix(in oklab,var(--primary) 14%,var(--surface));color:color-mix(in oklab,var(--primary) 70%,var(--text))}
.ho-amen b{display:block;margin-bottom:2px}
.ho-amen p{color:var(--muted);font-size:14px}
.ho-hood{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);gap:48px;align-items:stretch}
.ho-map{min-height:260px;border-radius:var(--radius-lg)}
.ho-walks{list-style:none;display:grid;gap:0;counter-reset:w}
.ho-walks li{display:grid;grid-template-columns:30px minmax(0,1fr) auto;gap:14px;align-items:baseline;padding:13px 0;border-bottom:1px solid var(--border)}
.ho-walks li::before{counter-increment:w;content:counter(w);font:600 13px var(--font-b);color:var(--muted)}
.ho-walks p{color:var(--muted);font-size:14px}
.ho-offers{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px}
.ho-offer{display:grid;gap:12px;align-content:start}
.ho-offer.feat{background:var(--text);color:var(--bg);border-color:var(--text)}
.ho-offer.feat .muted{color:color-mix(in oklab,var(--bg) 72%,transparent)}
.ho-offer ul{list-style:none;display:grid;gap:6px;font-size:14px}
.ho-offer li{display:flex;gap:8px;align-items:center}
.ho-quotes{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);gap:28px}
.ho-big{padding:32px;display:grid;gap:20px;align-content:space-between}
.ho-big q{font-family:var(--font-h);font-size:calc(22px * var(--hs));line-height:1.3;quotes:"\\201C" "\\201D"}
.ho-small{display:grid;gap:20px}
.ho-small figure{padding:22px;display:grid;gap:12px}
.ho-small q{font-family:var(--font-h);font-size:calc(17px * var(--hs));line-height:1.45;quotes:"\\201C" "\\201D"}
.ho-stars{display:flex;gap:2px;color:color-mix(in oklab,var(--primary) 80%,var(--text))}
.ho-getrow{display:grid;grid-template-columns:minmax(0,1fr) repeat(3,minmax(0,1.2fr));gap:28px;margin-top:32px;padding-top:24px;border-top:1px solid var(--border);align-items:start}
.ho-getrow>div{display:grid;grid-template-columns:22px minmax(0,1fr);gap:10px;font-size:14px}
.ho-getrow b{display:block;font-size:15px}
.ho-getrow span.muted{display:block}
.ho-ask{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,.8fr) minmax(0,1fr) minmax(0,1.4fr) auto;gap:16px;align-items:end}
@media (max-width:1024px){
  .ho-room{grid-template-columns:220px minmax(0,1fr) 170px;gap:24px}
  .ho-bar{grid-template-columns:repeat(2,minmax(0,1fr))}
  .ho-amen{grid-template-columns:repeat(2,minmax(0,1fr))}
  .ho-getrow{grid-template-columns:repeat(2,minmax(0,1fr))}
  .ho-ask{grid-template-columns:repeat(2,minmax(0,1fr))}.ho-ask>:first-child,.ho-ask .ho-wide{grid-column:1/-1}
  .ho-bar .btn{grid-column:1/-1;height:54px}
}
@media (max-width:760px){
  .ho-hero{padding-top:28px;padding-bottom:48px;text-align:left}
  .ho-hero h1{font-size:calc(38px * var(--hs));margin:10px 0 12px}
  .ho-hero .sk-lede{margin:0 0 22px}
  .ho-shot{aspect-ratio:4/3}
  .ho-bar .sk-field{padding:12px 14px;border-bottom:1px solid var(--border)}
  .ho-bar .sk-field:nth-child(2n){border-right:0}
  .ho-bar .ho-v{font-size:15px}
  .ho-note{justify-content:flex-start;gap:6px 16px;font-size:13px}
  .ho-room{grid-template-columns:110px minmax(0,1fr);gap:16px;padding:18px 0;align-items:start}
  .ho-room ul,.ho-room .ho-desc{display:none}
  .ho-rate{grid-column:1/-1;display:flex;justify-content:space-between;align-items:center;text-align:left}
  .ho-dine{grid-template-columns:minmax(0,1fr);gap:20px}
  .ho-venue{grid-template-columns:minmax(0,1fr)}
  .ho-venue .sk-photo{aspect-ratio:5/2;min-height:0}
  .ho-venue .ho-desc{display:none}
  .ho-spa{grid-template-columns:minmax(0,1fr);gap:24px}
  .ho-spa .sk-photo{aspect-ratio:16/9;min-height:0}
  .ho-amen{grid-template-columns:minmax(0,1fr);gap:16px}
  .ho-amen>div:nth-child(n+5){display:none}
  .ho-hood{grid-template-columns:minmax(0,1fr);gap:20px}
  .ho-map{min-height:0;aspect-ratio:4/3}
  .ho-walks li{padding:12px 0}
  .ho-offers{display:flex;scroll-padding-inline:20px}
  .ho-quotes{grid-template-columns:minmax(0,1fr);gap:16px}
  .ho-big{padding:24px}
  .ho-big q{font-size:calc(21px * var(--hs))}
  .ho-small figure:last-child{display:none}
  .ho-getrow{grid-template-columns:minmax(0,1fr);gap:14px;margin-top:20px}
  .ho-ask{grid-template-columns:minmax(0,1fr);gap:12px}
}
</style>`;

// ---- illustrative harbour & room "photos" (fixed natural tones) ------------------------------------------------
const harbour = (id, w = 1104, h = 460) => {
  const g = `ho-sky-${id}`, sea = `ho-sea-${id}`;
  const fronts = [["#d9c3a5", 70], ["#c98f6b", 54], ["#e6ddd0", 80], ["#9fb2b6", 62], ["#d7b07a", 72], ["#b9a08c", 58], ["#e9e1d3", 66], ["#c6a086", 76], ["#a9b9a4", 60], ["#dcc8ad", 70]];
  let x = 0;
  const houses = fronts.map(([c, hh], i) => { const bw = w / fronts.length, y = h * .58 - hh * (h / 460); const s = `<rect x="${x}" y="${y}" width="${bw + 1}" height="${h * .58 - y + 2}" fill="${c}"/><path d="M${x} ${y}l${bw / 2} -${18 * h / 460} ${bw / 2} ${18 * h / 460}z" fill="${c}" opacity=".85"/>${[0, 1].map((r) => [0, 1, 2].map((k) => `<rect x="${x + bw * (.18 + k * .26)}" y="${y + 12 + r * 22}" width="${bw * .14}" height="12" fill="#5d6b72" opacity=".55"/>`).join("")).join("")}`; x += bw; return s; }).join("");
  const boats = [[.18, "#f4efe6"], [.42, "#c8442f"], [.7, "#2f4c5c"]].map(([bx, c], i) => `<path d="M${w * bx} ${h * .74}h${w * .09}l-${w * .012} ${h * .04}h-${w * .066}z" fill="${c}"/><path d="M${w * (bx + .04)} ${h * .74}v-${h * (.12 + i * .02)}" stroke="#4a4a4a" stroke-width="2"/>`).join("");
  return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Harbour at dusk with painted townhouses and moored boats"><defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9b48d"/><stop offset="1" stop-color="#f7e2c9"/></linearGradient><linearGradient id="${sea}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5f8a99"/><stop offset="1" stop-color="#2f5566"/></linearGradient></defs>
<rect width="${w}" height="${h}" fill="url(#${g})"/><circle cx="${w * .82}" cy="${h * .2}" r="${h * .06}" fill="#fff1dc"/>${houses}<rect y="${h * .58}" width="${w}" height="${h * .05}" fill="#8f8577"/><rect y="${h * .63}" width="${w}" height="${h * .37}" fill="url(#${sea})"/>${[0.7, 0.8, 0.9].map((yy) => `<path d="M${w * .05} ${h * yy}h${w * .3}M${w * .5} ${h * (yy + .03)}h${w * .35}" stroke="#d9e6e8" stroke-width="2" opacity=".35"/>`).join("")}${boats}</svg>`;
};
const roomShot = (kind, id) => {
  const wall = { harbour: "#e8dccb", loft: "#d9d2c7", suite: "#cfd8d4", court: "#e4d6c2" }[kind];
  const bed = { harbour: "#f6f1e8", loft: "#efe7da", suite: "#f3efe7", court: "#f1e9dc" }[kind];
  const throwc = { harbour: "#4f6f7d", loft: "#a5603f", suite: "#3f5a4a", court: "#b48a4b" }[kind];
  const win = kind === "court" ? `<rect x="250" y="30" width="110" height="110" fill="#9fb59a"/><circle cx="300" cy="95" r="34" fill="#6f8a55"/>` : `<rect x="240" y="30" width="130" height="110" fill="#9cc2cf"/><rect x="240" y="96" width="130" height="44" fill="#4f7f8f"/><path d="M260 92h40" stroke="#fff" stroke-width="2" opacity=".6"/>`;
  return `<svg viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${esc(kind)} room with a made bed by the window"><rect width="400" height="260" fill="${wall}"/>${win}<rect x="236" y="26" width="138" height="118" fill="none" stroke="#f7f2ea" stroke-width="6"/><rect y="196" width="400" height="64" fill="#a98a6a"/>
<rect x="40" y="120" width="190" height="34" rx="6" fill="#7a5a40"/><rect x="34" y="150" width="210" height="62" rx="8" fill="${bed}"/><rect x="34" y="176" width="210" height="36" rx="6" fill="${throwc}"/><rect x="52" y="134" width="60" height="26" rx="10" fill="#fffdf8"/><rect x="120" y="134" width="60" height="26" rx="10" fill="#fffdf8"/>
<rect x="256" y="168" width="40" height="44" fill="#6b4c36"/><path d="M276 150v18" stroke="#3a2e24" stroke-width="3"/><path d="M262 134h28l-6 16h-16z" fill="#e7c98f"/>${kind === "suite" ? `<rect x="310" y="160" width="70" height="52" rx="8" fill="#8c9c8f"/>` : ""}</svg>`;
};
const venue = (kind) => kind === "bar"
  ? `<svg viewBox="0 0 560 315" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Low-lit bar counter with stools and shelves of bottles"><rect width="560" height="315" fill="#2d2420"/>${[40, 90, 140].map((y) => `<rect x="60" y="${y}" width="440" height="6" fill="#5a4334"/>${Array.from({ length: 11 }, (_, i) => `<rect x="${74 + i * 38}" y="${y - 30}" width="12" height="30" rx="3" fill="${["#6f8a55", "#b48a4b", "#8e2f4a", "#d9c3a5"][i % 4]}" opacity=".85"/>`).join("")}`).join("")}<rect y="196" width="560" height="30" fill="#7a5236"/><rect y="226" width="560" height="89" fill="#3a2c24"/>${[90, 200, 310, 420].map((x) => `<circle cx="${x}" cy="248" r="18" fill="#a5603f"/><rect x="${x - 3}" y="262" width="6" height="50" fill="#1d1612"/>`).join("")}${[150, 370].map((x) => `<ellipse cx="${x}" cy="190" rx="30" ry="6" fill="#f6c36d" opacity=".3"/><path d="M${x - 6} 172h12v18h-12z" fill="#e7d3a8" opacity=".8"/>`).join("")}</svg>`
  : `<svg viewBox="0 0 560 315" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Dining room with harbour windows and set tables"><rect width="560" height="315" fill="#e9dfd0"/>${[40, 200, 360].map((x) => `<rect x="${x}" y="30" width="140" height="140" fill="#8fb3c0"/><rect x="${x}" y="120" width="140" height="50" fill="#4f7f8f"/><rect x="${x}" y="30" width="140" height="140" fill="none" stroke="#f7f2ea" stroke-width="6"/>`).join("")}<rect y="200" width="560" height="115" fill="#b49a7c"/>${[110, 280, 450].map((x) => `<ellipse cx="${x}" cy="222" rx="66" ry="16" fill="#f8f4ec"/><rect x="${x - 4}" y="236" width="8" height="60" fill="#5a4334"/><circle cx="${x - 26}" cy="218" r="9" fill="#fff" stroke="#d9d0c1"/><circle cx="${x + 26}" cy="218" r="9" fill="#fff" stroke="#d9d0c1"/><path d="M${x} 196v16" stroke="#c9b48f" stroke-width="3"/>`).join("")}</svg>`;
const spaShot = () => `<svg viewBox="0 0 500 500" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Rooftop plunge pool with loungers facing the water"><defs><linearGradient id="ho-pool" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fc0c8"/><stop offset="1" stop-color="#3f8f9c"/></linearGradient></defs><rect width="500" height="500" fill="#f2dcc3"/><rect y="150" width="500" height="70" fill="#7aa3b2"/><path d="M0 150h500" stroke="#f9f1e4" stroke-width="3"/><rect y="220" width="500" height="280" fill="#d9c7ae"/><rect x="60" y="250" width="380" height="150" rx="10" fill="url(#ho-pool)"/>${[290, 330, 370].map((y) => `<path d="M90 ${y}q40-8 80 0t80 0 80 0 80 0" stroke="#d8f0f1" stroke-width="2" fill="none" opacity=".6"/>`).join("")}${[90, 210, 330].map((x) => `<rect x="${x}" y="420" width="90" height="22" rx="6" fill="#f7f2ea"/><rect x="${x + 64}" y="402" width="26" height="22" rx="6" fill="#efe7da"/>`).join("")}<circle cx="460" cy="300" r="26" fill="#6f8a55"/><rect x="455" y="320" width="10" height="40" fill="#8a6a4a"/></svg>`;
const mapShot = () => `<svg viewBox="0 0 560 460" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Map of the harbour quarter with the hotel and nearby places numbered"><rect width="560" height="460" fill="#ece6da"/><path d="M0 300C140 270 250 330 380 300S520 250 560 260V460H0z" fill="#b9d0d8"/>${[[0, 90, 560, 120], [150, 0, 190, 300], [0, 210, 560, 190], [400, 0, 370, 290]].map(([a, b, c, d]) => `<path d="M${a} ${b}L${c} ${d}" stroke="#fff" stroke-width="14"/>`).join("")}<rect x="30" y="20" width="100" height="60" rx="6" fill="#d7dfc4"/><rect x="220" y="120" width="130" height="64" rx="6" fill="#ddd5c5"/><rect x="430" y="30" width="110" height="50" rx="6" fill="#d7dfc4"/>
<text x="250" y="400" font-family="sans-serif" font-size="14" fill="#5d7480">Inner Harbour</text>${[[90, 150, "1"], [300, 100, "2"], [470, 160, "3"], [200, 250, "4"], [500, 240, "5"]].map(([x, y, n]) => `<g transform="translate(${x} ${y})"><circle r="13" fill="#2f4c5c"/><text y="5" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="#fff">${n}</text></g>`).join("")}<g transform="translate(300 262)"><path d="M0 0c-14-18-22-30-22-42a22 22 0 0 1 44 0c0 12-8 24-22 42z" fill="#c8442f"/><circle cx="0" cy="-42" r="8" fill="#fff"/></g></svg>`;

const ROOMS = [
  ["harbour", "Harbour King", "26 m²", "2 guests", "Floor-to-ceiling window over the moorings, king bed, rain shower.", "$245"],
  ["loft", "Sail Loft", "34 m²", "3 guests", "Under the old roof beams, freestanding bath, sofa bed for a third guest.", "$310"],
  ["suite", "Quay Suite", "48 m²", "4 guests", "Corner suite with a separate lounge, balcony and two harbour views.", "$465"],
];

const web = (p, st) => K.page(st, `${K.nav(p, ["Rooms", "Dining", "Spa", "Neighbourhood", "Offers"], "Book a stay", "Gift a stay")}
<main>
<section class="sk-wrap ho-hero" id="top">
  <span class="sk-eyebrow">36 rooms on the Inner Harbour</span>
  <h1>A quiet place to sleep on the harbour</h1>
  <p class="sk-lede">${esc(p.name)} has 36 rooms, a harbour-view dining room and a rooftop plunge pool, two minutes on foot from the ferry pier.</p>
  <div class="sk-photo ho-shot">${harbour("hero")}</div>
  <form class="card ho-bar" aria-label="Check availability" id="book-a-stay">
    <div class="sk-field"><label for="ho-in">Check-in</label><div class="ho-v" id="ho-in">${ic("calendar", 16)} Thu 12 Nov</div></div>
    <div class="sk-field"><label for="ho-out">Check-out</label><div class="ho-v" id="ho-out">${ic("calendar", 16)} Sun 15 Nov</div></div>
    <div class="sk-field"><label for="ho-g">Guests</label><div class="ho-v" id="ho-g">${ic("users", 16)} 2 adults, 1 room</div></div>
    <div class="sk-field"><label for="ho-c">Offer code</label><div class="ho-v muted" id="ho-c">${ic("tag", 16)} Optional</div></div>
    <button class="btn primary" type="button">Check availability</button>
  </form>
  <div class="ho-note"><span>${ic("check", 15)} Lowest rate when you book here</span><span>${ic("check", 15)} Free cancellation to 48 hours</span><span>${ic("clock", 15)} Check-in 3 PM, check-out 11 AM</span></div>
</section>

<section class="sk-sec sk-tight sk-alt" id="rooms"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">Rooms & suites</span><h2 class="sk-h2">Three rooms, one very good bed</h2></div><a class="btn sk-btn-lg" href="#">Compare all rooms ${ic("arrow", 16)}</a></div>
  <div class="ho-rooms">${ROOMS.map(([k, n, size, g, d, rate], i) => `<article class="ho-room"><div class="sk-photo">${roomShot(k, i)}</div>
    <div><h3 class="sk-h3" style="font-size:calc(24px * var(--hs))">${esc(n)}</h3><p class="muted ho-desc" style="margin-top:4px">${esc(d)}</p><ul><li>${ic("grid", 14)} ${size}</li><li>${ic("users", 14)} ${g}</li><li>${ic("sun", 14)} Harbour view</li></ul></div>
    <div class="ho-rate"><div><span class="muted" style="font-size:13px">From</span> <span class="num" style="font-size:26px">${rate}</span><div class="muted" style="font-size:12px">per night, breakfast included</div></div><a class="btn${i === 0 ? " primary" : ""}" href="#">Select dates</a></div></article>`).join("")}</div>
</div></section>

<section class="sk-sec sk-tight" id="dining"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">Dining & bar</span><h2 class="sk-h2">Eat by the harbour window</h2></div><p class="muted" style="max-width:420px">Both open to guests and neighbours. Hotel guests get first pick of window tables, just ask at check-in.</p></div>
  <div class="ho-dine">
    <article class="card ho-venue"><div class="sk-photo">${venue("dining")}</div><div><h3 class="sk-h3" style="font-size:calc(24px * var(--hs))">The Net Loft</h3><p class="muted ho-desc">Day-boat fish, a short list of grill plates and breakfast until 11. Set menu on Sunday evenings.</p>
      <dl class="ho-hours"><dt>Breakfast</dt><dd>7–11 AM daily</dd><dt>Dinner</dt><dd>6–10 PM, Wed–Sun</dd></dl></div></article>
    <article class="card ho-venue"><div class="sk-photo">${venue("bar")}</div><div><h3 class="sk-h3" style="font-size:calc(24px * var(--hs))">Ropewalk Bar</h3><p class="muted ho-desc">Twelve stools, a coal fire in winter and a drinks list built around the region’s small distillers.</p>
      <dl class="ho-hours"><dt>Bar</dt><dd>4 PM–midnight daily</dd><dt>Snacks</dt><dd>Until 10:30 PM</dd></dl></div></article>
  </div>
</div></section>

<section class="sk-sec sk-tight sk-alt" id="spa"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">Spa & amenities</span><h2 class="sk-h2">A small spa, done properly</h2></div><a class="btn sk-btn-lg" href="#">Book a treatment ${ic("arrow", 16)}</a></div>
  <div class="ho-spa"><div class="sk-photo">${spaShot()}<span class="sk-cap">Rooftop pool, heated year-round</span></div>
    <div class="ho-amen">${[["sun", "Rooftop plunge pool", "8 m, heated to 32°C, open 7 AM–9 PM."], ["clock", "Sauna & treatment room", "Book 60 or 90-minute massages at reception."], ["bolt", "Gym with harbour view", "Bikes, free weights and mats, open 24 hours."], ["globe", "Bikes to borrow", "Six town bikes with locks and a map, free."], ["key", "Late check-out", "Until 1 PM when we can, free for direct bookings."], ["heart", "Dogs welcome", "In courtyard rooms, with a bed and bowl, $25 a night."]].map(([i, t, d]) => `<div><span class="ho-ic">${ic(i, 18)}</span><div><b>${t}</b><p>${d}</p></div></div>`).join("")}</div></div>
</div></section>

<section class="sk-sec sk-tight" id="neighbourhood"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">The neighbourhood</span><h2 class="sk-h2">Everything on foot</h2></div><p class="muted" style="max-width:380px">Our location: the Inner Harbour quarter, one street back from the ferry pier.</p></div>
  <div class="ho-hood"><div class="sk-photo ho-map">${mapShot()}</div>
    <ol class="ho-walks">${[["Ferry pier", "Boats to the outer islands every 40 minutes in summer.", "2 min"], ["Saturday fish market", "On the quay from 6 AM, gone by 10.", "4 min"], ["Old Customs House gallery", "Free entry, local painters and a good café.", "7 min"], ["Lighthouse path", "A flat 3 km loop round the headland.", "9 min"]].map(([t, d, m]) => `<li><div><b>${t}</b><p>${d}</p></div><span class="num" style="font-size:15px">${m}</span></li>`).join("")}</ol>
  </div>
  <div class="ho-getrow"><h3 class="sk-h3">3 Ropewalk Quay, Inner Harbour</h3>${[["globe", "By train", "12 minutes on foot from Central, or a $9 taxi from the rank."], ["pin", "By car", "No parking at the hotel. The Harbour Street car park is 3 minutes away, $18 a day with our ticket."], ["phone", "Front desk, 24 hours", "(555) 016-7720 · stay@halcyonquay.example"]].map(([i, t, d]) => `<div><span class="muted">${ic(i, 18)}</span><div><b>${t}</b><span class="muted">${d}</span></div></div>`).join("")}</div>
</div></section>

<section class="sk-sec sk-tight sk-alt" id="offers"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">Offers & packages</span><h2 class="sk-h2">Stay a little longer</h2></div><span class="muted" style="font-size:14px">Rates for two guests, taxes included.</span></div>
  <div class="ho-offers sk-rail">${[["Three nights, pay for two", "Sun–Thu stays, November to March.", "From $490", ["Breakfast daily", "Late check-out", "Any room type"], ""], ["Harbour weekend", "Two nights with dinner on the Saturday.", "From $640", ["Three-course dinner for two", "Bottle of local wine", "Pool & sauna"], "feat"], ["Island day out", "One night plus ferry and a packed lunch.", "From $315", ["Return ferry tickets", "Picnic from the kitchen", "Bikes for the day"], ""]].map(([t, d, pr, li, c]) => `<article class="card sk-card ho-offer ${c}">${c ? `<span class="badge" style="justify-self:start">Most booked</span>` : ""}<h3 class="sk-h3" style="font-size:calc(22px * var(--hs))">${t}</h3><p class="muted">${d}</p><ul>${li.map((x) => `<li>${ic("check", 14)} ${x}</li>`).join("")}</ul><div class="num" style="font-size:24px;margin-top:6px">${pr}</div><a class="btn ${c ? "primary" : ""}" href="#">View dates</a></article>`).join("")}</div>
</div></section>

<section class="sk-sec sk-tight"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">Guest notes</span><h2 class="sk-h2">Guests, this year</h2></div></div>
  <div class="ho-quotes">
    <figure class="card ho-big"><div class="ho-stars" aria-label="5 out of 5">${Array.from({ length: 5 }, () => ic("star", 16)).join("")}</div><q>We asked for a quiet room and got the Sail Loft at the top of the building. Heard the rigging on the boats and nothing else. Breakfast by the window was our favourite hour of the trip.</q><figcaption class="sk-row" style="gap:10px"><span class="avatar">GH</span><span><b>Greta H.</b><br><span class="muted" style="font-size:13px">Three nights in October</span></span></figcaption></figure>
    <div class="ho-small">${[["The bar staff sent us to a fish place on the market we’d never have found. Small hotel, people who actually know the town.", "Daniel R.", "Harbour weekend"], ["Travelled with our dog and the courtyard room had a bed and towels ready. Easy check-in after a late ferry.", "Amira & Joe", "Courtyard Twin"]].map(([q, n, t]) => `<figure class="card"><q>${esc(q)}</q><figcaption class="muted" style="font-size:13px"><b style="color:var(--text)">${esc(n)}</b> · ${esc(t)}</figcaption></figure>`).join("")}</div>
  </div>
</div></section>

<section class="sk-sec sk-tight sk-alt" id="location"><div class="sk-wrap">
  <form class="ho-ask" aria-label="Ask the front desk">
    <div class="sk-stack" style="gap:6px"><h2 class="sk-h3" style="font-size:calc(24px * var(--hs))">Questions before you book?</h2><p class="muted" style="font-size:14px">The front desk replies within a few hours, day or night.</p></div>
    <div class="sk-field"><label for="ho-n">Name</label><input class="sk-input" id="ho-n" value="Sam Achebe"></div>
    <div class="sk-field"><label for="ho-e">Email</label><input class="sk-input" id="ho-e" value="sam.achebe@example.com"></div>
    <div class="sk-field ho-wide"><label for="ho-m">Question</label><input class="sk-input" id="ho-m" value="Arriving on the 11 PM ferry. Anything to eat that late?"></div>
    <button class="btn primary sk-btn-lg" type="button">Send</button>
  </form>
</div></section>
</main>
${K.footer(p, "A 36-room hotel in a converted sail warehouse on the Inner Harbour.", [["Stay", ["Rooms & suites", "Offers", "Gift a stay", "Groups & weddings"]], ["Eat & unwind", ["The Net Loft", "Ropewalk Bar", "Rooftop spa", "Opening hours"]], ["Hotel", ["Getting here", "Accessibility", "Sustainability", "Careers"]]])}`, CSS);

module.exports = {
  "hotel-website": K.def("hotel", "Hotel website",
    "a full boutique hotel home page: navigation with book-a-stay and gift buttons, a centred hero with a harbour scene and a docked check-in/check-out/guests/offer-code booking bar, a rooms and suites list with size, guests and from-rates, dining room and bar cards with opening hours, spa and amenities with an icon list, the neighbourhood with a numbered map and walk times, offers and packages cards, guest notes with a star rating, the location address with getting-here details, a front-desk questions form, and a footer",
    ["navigation-header", "hero", "booking-form", "date-picker", "room-list", "price-list", "opening-hours", "amenities", "icon-list", "map", "offer-cards", "pricing", "testimonials", "rating", "contact-form", "footer", "hotel", "hospitality"], web),
};
