/* Wedding website template (Noor & Callum — a fictional couple's wedding website). Full responsive home page:
   nav, centred hero with arched venue image, date and countdown, our-story timeline, weekend schedule, venue + travel + hotel block,
   wedding party, registry (generic funds), FAQ, RSVP form (attending, meal choice, dietary), footer.
   One HTML document rendered at 1440 (web) and 390 (mobile). "Photos" are inline SVG scenes in fixed natural tones. */
const { ic, esc } = require("../lib");
const K = require("../sitekit");

const CSS = `<style>
.wd-hero{padding-top:48px;padding-bottom:52px;text-align:center;display:grid;justify-items:center;gap:16px}
.wd-names{font-size:calc(84px * var(--hs));line-height:1;display:flex;flex-wrap:wrap;justify-content:center;align-items:baseline;gap:0 28px}
.wd-amp{font-style:italic;color:color-mix(in oklab,var(--primary) 82%,var(--text));font-size:.75em}
.wd-when{display:flex;flex-wrap:wrap;justify-content:center;gap:6px 22px;font-size:17px;color:var(--muted)}
.wd-when b{color:var(--text);font-weight:600}
.wd-arch{width:100%;max-width:880px;aspect-ratio:16/7;border-radius:440px 440px var(--radius-lg) var(--radius-lg)}
.wd-count{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;width:100%;max-width:520px}
.wd-count>div{padding:14px 8px;display:grid;gap:2px}
.wd-count .num{font-size:32px;line-height:1.1}
.wd-count span{font-size:12px;color:var(--muted);text-transform:uppercase;letter-spacing:.08em}
.wd-center{text-align:center;display:grid;justify-items:center;gap:12px;margin-bottom:34px}
.wd-center p{max-width:560px}
.wd-tl{position:relative;display:grid;gap:8px;max-width:960px;margin:0 auto}
.wd-tl::before{content:"";position:absolute;left:50%;top:0;bottom:0;width:2px;background:var(--border);transform:translateX(-1px)}
.wd-ev{display:grid;grid-template-columns:minmax(0,1fr) 56px minmax(0,1fr);align-items:center}
.wd-ev .wd-pin{width:14px;height:14px;border-radius:50%;background:var(--primary);border:3px solid var(--bg);justify-self:center;position:relative;z-index:1;box-shadow:0 0 0 2px var(--primary)}
.wd-ev .sk-photo{width:128px;height:88px;border-radius:var(--radius)}
.wd-ev .wd-txt{display:grid;gap:4px}
.wd-ev:nth-child(odd) .wd-txt{grid-column:1;text-align:right;justify-items:end}
.wd-ev:nth-child(odd) .sk-photo{grid-column:3;grid-row:1}
.wd-ev:nth-child(odd) .wd-pin{grid-column:2;grid-row:1}
.wd-ev:nth-child(even) .sk-photo{grid-column:1;grid-row:1;justify-self:end}
.wd-ev:nth-child(even) .wd-pin{grid-column:2;grid-row:1}
.wd-ev:nth-child(even) .wd-txt{grid-column:3;grid-row:1}
.wd-yr{font:600 13px var(--font-b);color:color-mix(in oklab,var(--primary) 82%,var(--text));letter-spacing:.06em}
.wd-days{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.35fr) minmax(0,1fr);gap:20px;align-items:start}
.wd-day{padding:26px;display:grid;gap:14px;align-content:start}
.wd-day.feat{background:var(--text);color:var(--bg);border-color:var(--text)}
.wd-day.feat .wd-soft{color:color-mix(in oklab,var(--bg) 72%,var(--text))}
.wd-slot{display:grid;grid-template-columns:72px minmax(0,1fr);gap:12px;padding-top:12px;border-top:1px solid color-mix(in oklab,currentColor 18%,transparent)}
.wd-slot .num{font-size:14px;font-weight:600}
.wd-soft{color:var(--muted);font-size:14px}
.wd-travel{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);gap:28px;align-items:stretch}
.wd-venue{padding:0;overflow:hidden;display:grid;grid-template-rows:minmax(0,1fr) auto}
.wd-venue .sk-photo{border-radius:0;min-height:260px}
.wd-venue>div:last-child{padding:22px 26px;display:flex;justify-content:space-between;gap:16px;align-items:center;flex-wrap:wrap}
.wd-ways{display:grid;gap:14px}
.wd-way{padding:20px 22px;display:grid;grid-template-columns:40px minmax(0,1fr);gap:14px;align-items:start}
.wd-ico{width:40px;height:40px;border-radius:50%;display:grid;place-items:center;background:color-mix(in oklab,var(--primary) 14%,var(--surface));color:color-mix(in oklab,var(--primary) 70%,var(--text))}
.wd-code{font:600 13px var(--font-b);padding:3px 8px;border:1px dashed var(--border);border-radius:var(--radius-sm);letter-spacing:.06em}
.wd-party{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:20px;text-align:center}
.wd-party figure{display:grid;gap:8px;justify-items:center}
.wd-party .sk-photo{width:96px;height:96px;border-radius:50%}
.wd-party b{display:block;font-size:15px}
.wd-reg{display:grid;grid-template-columns:minmax(0,1fr) repeat(3,minmax(0,1fr));gap:20px;align-items:stretch}
.wd-reg .card{padding:22px;display:grid;gap:8px;align-content:start}
.wd-bar{height:6px;border-radius:3px;background:color-mix(in oklab,var(--text) 10%,transparent);overflow:hidden;margin-top:4px}
.wd-bar i{display:block;height:100%;background:var(--primary)}
.wd-faq{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 48px}
.wd-faq details{border-bottom:1px solid var(--border);padding:16px 0}
.wd-faq summary{list-style:none;cursor:pointer;display:flex;justify-content:space-between;gap:12px;font-weight:600}
.wd-faq summary::-webkit-details-marker{display:none}
.wd-faq details p{color:var(--muted);font-size:14px;margin-top:8px}
.wd-rsvp{max-width:760px;margin:0 auto;padding:40px;display:grid;gap:18px}
.wd-rsvp .sk-g2{gap:14px}
.wd-opts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
.wd-opts.c3{grid-template-columns:repeat(3,minmax(0,1fr))}
.wd-opt{display:flex;gap:10px;align-items:center;padding:13px 14px;border:1px solid var(--border);border-radius:var(--radius);font-size:14px;font-weight:500;background:var(--bg)}
.wd-opt i{width:16px;height:16px;border-radius:50%;border:2px solid var(--border);flex:none}
.wd-opt.on{border-color:var(--primary);background:color-mix(in oklab,var(--primary) 8%,var(--bg))}
.wd-opt.on i{border:5px solid var(--primary)}
.wd-opt small{display:block;color:var(--muted);font-size:12px;font-weight:400}
@media (max-width:1024px){
  .wd-party{grid-template-columns:repeat(3,minmax(0,1fr))}
  .wd-reg{grid-template-columns:repeat(2,minmax(0,1fr))}
}
@media (max-width:760px){
  .wd-hero{padding-top:28px;padding-bottom:48px;gap:16px}
  .wd-names{font-size:calc(50px * var(--hs));gap:0 14px}
  .wd-when{font-size:15px;flex-direction:column;gap:2px}
  .wd-arch{aspect-ratio:4/3.4;border-radius:200px 200px var(--radius) var(--radius)}
  .wd-count{gap:8px}
  .wd-count>div{padding:10px 4px}
  .wd-count .num{font-size:24px}
  .wd-count span{font-size:10px;letter-spacing:.04em}
  .wd-center{margin-bottom:22px}
  .wd-tl::before{left:7px}
  .wd-tl{gap:18px}
  .wd-ev,.wd-ev:nth-child(n){grid-template-columns:16px minmax(0,1fr);gap:4px 16px;align-items:start}
  .wd-ev .wd-pin,.wd-ev:nth-child(n) .wd-pin{grid-column:1;grid-row:1;margin-top:4px}
  .wd-ev .wd-txt,.wd-ev:nth-child(n) .wd-txt{grid-column:2;grid-row:1;text-align:left;justify-items:start}
  .wd-ev .sk-photo,.wd-ev:nth-child(n) .sk-photo{display:none}
  .wd-days{grid-template-columns:minmax(0,1fr);gap:14px}
  .wd-day{padding:20px}
  .wd-day:not(.feat) .wd-slot:nth-of-type(n+3){display:none}
  .wd-travel{grid-template-columns:minmax(0,1fr);gap:14px}
  .wd-venue .sk-photo{min-height:0;aspect-ratio:16/10}
  .wd-way{padding:16px 18px}
  .wd-party{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;scroll-padding-inline:20px;gap:16px;margin:0 -20px;padding:0 20px 6px;scrollbar-width:none}
  .wd-party figure{flex:0 0 120px;scroll-snap-align:start}
  .wd-party .sk-photo{width:92px;height:92px}
  .wd-reg{grid-template-columns:minmax(0,1fr);gap:12px}
  .wd-reg .card{padding:18px}
  .wd-faq{grid-template-columns:minmax(0,1fr)}
  .wd-faq .wd-m-hide{display:none}
  .wd-rsvp{padding:22px}
  .wd-opts.c3{grid-template-columns:minmax(0,1fr)}
}
</style>`;

// ---- illustrative "photos" (fixed natural tones) -------------------------------------------------------------------
const heroShot = () => `<svg viewBox="0 0 880 440" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Stone barn venue among hills at golden hour with string lights"><defs>
<linearGradient id="wd-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8c9a7"/><stop offset=".6" stop-color="#f3dcb8"/><stop offset="1" stop-color="#f7e7c9"/></linearGradient>
<radialGradient id="wd-sun" cx=".72" cy=".55" r=".3"><stop offset="0" stop-color="#fff3d1"/><stop offset="1" stop-color="#fff3d1" stop-opacity="0"/></radialGradient></defs>
<rect width="880" height="440" fill="url(#wd-sky)"/><rect width="880" height="440" fill="url(#wd-sun)"/>
<path d="M0 270C150 210 300 240 440 220S720 180 880 230V440H0z" fill="#b9a77e"/><path d="M0 320C200 280 380 310 560 290S800 270 880 300V440H0z" fill="#93975f"/>
<path d="M290 330V230l110-60 110 60v100z" fill="#cbb79a"/><path d="M280 236l120-70 120 70" stroke="#6e5a48" stroke-width="10" fill="none" stroke-linejoin="round"/><path d="M366 330v-62a34 34 0 0 1 68 0v62z" fill="#f5d896"/>
<rect x="510" y="262" width="150" height="68" fill="#bca78a"/><path d="M504 266l83-34 83 34" stroke="#6e5a48" stroke-width="8" fill="none"/>${[532, 572, 612].map((x) => `<rect x="${x}" y="282" width="22" height="30" fill="#f5d896"/>`).join("")}
<path d="M120 300q170 -60 340 -20t340 0" stroke="#4d4033" stroke-width="1.5" fill="none"/>${Array.from({ length: 18 }, (_, i) => { const x = 140 + i * 38; return `<circle cx="${x}" cy="${282 - Math.sin(i / 2.7) * 16}" r="4" fill="#ffe7a3"/>`; }).join("")}
${[[110, 300, 56], [770, 290, 64], [200, 330, 34]].map(([x, y, r]) => `<rect x="${x - 4}" y="${y}" width="8" height="80" fill="#5a4a38"/><circle cx="${x}" cy="${y - 6}" r="${r}" fill="#6f7d4b"/>`).join("")}
<rect y="380" width="880" height="60" fill="#7c8450"/>${Array.from({ length: 10 }, (_, i) => `<circle cx="${60 + i * 86}" cy="${392 + (i % 3) * 8}" r="5" fill="${i % 2 ? "#f4f0e6" : "#e9b7b0"}"/>`).join("")}</svg>`;
const STORY_SCENES = {
  cafe: [`Two coffee cups on a café table`, `<rect width="300" height="220" fill="#c9a98a"/><rect y="130" width="300" height="90" fill="#8a6447"/>${[100, 190].map((x) => `<ellipse cx="${x}" cy="140" rx="34" ry="9" fill="#efe9df"/><path d="M${x - 22} 112h44l-6 28h-32z" fill="#f4f0e8"/><ellipse cx="${x}" cy="112" rx="22" ry="6" fill="#6b4a33"/>`).join("")}<rect x="20" y="20" width="80" height="70" fill="#e8d6bd"/>`],
  hike: [`Mountain ridge at sunrise`, `<rect width="300" height="220" fill="#f1cfa6"/><circle cx="210" cy="90" r="28" fill="#fbe7b8"/><path d="M0 170l70-80 50 50 60-90 120 120v50H0z" fill="#7d8a6a"/><path d="M0 200l90-50 80 40 130-50v80H0z" fill="#5d6b4c"/>`],
  flat: [`Window with plants in a first flat`, `<rect width="300" height="220" fill="#e4dccd"/><rect x="70" y="30" width="160" height="130" fill="#b7cad4"/><path d="M150 30v130M70 95h160" stroke="#8a7d6c" stroke-width="6"/><rect y="160" width="300" height="60" fill="#c3a888"/>${[[60, "#6f8a55"], [240, "#80995f"]].map(([x, c]) => `<rect x="${x - 16}" y="140" width="32" height="26" fill="#b4664a"/><circle cx="${x}" cy="126" r="22" fill="${c}"/>`).join("")}`],
  beach: [`Rocky beach at dusk where they got engaged`, `<rect width="300" height="220" fill="#e7b9a2"/><rect y="110" width="300" height="50" fill="#8fb1bd"/><rect y="160" width="300" height="60" fill="#e3cfae"/><path d="M190 160c10-40 40-50 70-40l40 40z" fill="#6e6458"/><circle cx="90" cy="88" r="20" fill="#fbe2b8"/>`],
};
const story = (k) => `<svg viewBox="0 0 300 220" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${esc(STORY_SCENES[k][0])}">${STORY_SCENES[k][1]}</svg>`;
const mapShot = () => `<svg viewBox="0 0 600 300" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Map of Larkfield Barn near Hollow Vale village and the station"><rect width="600" height="300" fill="#e7e3d4"/>
<path d="M0 220C140 190 260 250 400 210S560 170 600 180V300H0z" fill="#cdd9bf"/><path d="M0 90L600 140M200 0L260 300M420 0q-30 150 40 300" stroke="#ffffff" stroke-width="12" fill="none"/>
<path d="M40 40L560 260" stroke="#b9b2a1" stroke-width="4" stroke-dasharray="14 8"/><rect x="90" y="40" width="70" height="40" rx="5" fill="#d9d2c2"/><text x="96" y="30" font-family="sans-serif" font-size="13" fill="#6e6658">Hollow Vale</text>
<text x="470" y="236" font-family="sans-serif" font-size="13" fill="#6e6658">Station</text><circle cx="500" cy="246" r="6" fill="#6e6658"/>
<g transform="translate(330 150)"><path d="M0 0c-14-18-22-30-22-42a22 22 0 0 1 44 0c0 12-8 24-22 42z" fill="#b5483c"/><circle cx="0" cy="-42" r="8" fill="#fff"/></g></svg>`;
const SKIN = ["#c89a7a", "#8d5b3e", "#e3bd9c", "#5e3b2a", "#d1a27f", "#a26a48"], HAIR = ["#2b1d16", "#1a1a1a", "#7a4a2a", "#3b2a20", "#c4914f", "#1a1a1a"];
const face = (i, name) => `<svg viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Portrait of ${esc(name)}"><rect width="200" height="200" fill="${["#e8d5c8", "#d5dccb", "#dcd2e0", "#d0dbe2", "#eadcc6", "#d9d3c8"][i]}"/>
<path d="M36 200c6-44 32-64 64-64s58 20 64 64z" fill="${["#b5483c", "#3f4b5a", "#7d6a9a", "#2f4a3a", "#c49a3c", "#4a4a4a"][i]}"/><rect x="88" y="114" width="24" height="26" fill="${SKIN[i]}"/><ellipse cx="100" cy="88" rx="32" ry="38" fill="${SKIN[i]}"/>
<path d="M66 86c0-30 16-46 34-46s36 14 36 ${i % 2 ? 40 : 34}c-14-10-32-14-52-12-8 4-14 12-18 ${i % 2 ? 24 : 18}z" fill="${HAIR[i]}"/>${i % 3 === 0 ? `<path d="M64 84c-6 40 0 60 10 72l8-58z" fill="${HAIR[i]}"/><path d="M136 84c6 40 0 60-10 72l-8-58z" fill="${HAIR[i]}"/>` : ""}</svg>`;

const web = (p, st) => {
  const [a, b] = p.name.split(/\s*&\s*/);
  return K.page(st, `${K.nav(p, ["Our story", "Schedule", "Travel", "Registry", "FAQ"], "RSVP")}
<main>
<section class="sk-wrap wd-hero" id="top">
  <span class="sk-eyebrow">We’re getting married</span>
  <h1 class="wd-names"><span>${esc(a)}</span><span class="wd-amp">&amp;</span><span>${esc(b || "")}</span></h1>
  <div class="wd-when"><span><b>Saturday 12 June 2027</b></span><span>Larkfield Barn, Hollow Vale</span><span>Ceremony at 2:00 PM</span></div>
  <div class="sk-photo wd-arch">${heroShot()}</div>
  <div class="wd-count" aria-label="Countdown to the wedding">${[["219", "Days"], ["14", "Hours"], ["32", "Minutes"], ["08", "Seconds"]].map(([v, l]) => `<div class="card"><div class="num">${v}</div><span>${l}</span></div>`).join("")}</div>
  <div class="sk-row" style="justify-content:center"><a class="btn primary sk-btn-lg" href="#rsvp">RSVP by 1 April</a><a class="btn sk-btn-lg" href="#schedule">See the weekend</a></div>
</section>

<section class="sk-sec sk-tight sk-alt" id="our-story"><div class="sk-wrap">
  <div class="wd-center"><span class="sk-eyebrow">Our story</span><h2 class="sk-h2">Eight years, one very long queue for coffee</h2></div>
  <div class="wd-tl">${[["2019", "cafe", "We met in a queue", "The café on Brook Street ran out of oat milk. Callum gave Noor the last one and we talked until closing."], ["2021", "hike", "First trip together", "Four days walking the coast path. One blister each and a lot of sandwiches."], ["2023", "flat", "A flat with a balcony", "Twelve plants, one cat called Biscuit and a sofa that took three people to get up the stairs."], ["2026", "beach", "The question", "On the rocks at Gull Point at sunset. Noor said yes before Callum finished the sentence."]].map(([y, k, t, d]) => `<div class="wd-ev"><div class="wd-txt"><span class="wd-yr">${y}</span><h3 class="sk-h3">${t}</h3><p class="wd-soft" style="max-width:400px">${d}</p></div><span class="wd-pin"></span><div class="sk-photo">${story(k)}</div></div>`).join("")}</div>
</div></section>

<section class="sk-sec sk-tight" id="schedule"><div class="sk-wrap">
  <div class="wd-center"><span class="sk-eyebrow">The weekend</span><h2 class="sk-h2">Three days in Hollow Vale</h2><p class="muted">Join us for as much as you can. Saturday is the main event; Friday and Sunday are relaxed and optional.</p></div>
  <div class="wd-days">
    <article class="card wd-day"><span class="sk-eyebrow">Friday 11 June</span><h3 class="sk-h3">Welcome drinks</h3>${[["7:00 PM", "Drinks at The Plough", "Main Street, Hollow Vale. Casual."], ["9:30 PM", "Last orders", "Taxis from the green."]].map(([t, n, d]) => `<div class="wd-slot"><span class="num">${t}</span><div><b>${n}</b><div class="wd-soft">${d}</div></div></div>`).join("")}</article>
    <article class="card wd-day feat"><span class="sk-eyebrow wd-soft">Saturday 12 June</span><h3 class="sk-h3" style="font-size:calc(26px * var(--hs))">The wedding day</h3>${[["1:30 PM", "Guests arrive", "Shuttle from the Hollow Vale Inn at 1:00"], ["2:00 PM", "Ceremony", "In the orchard, weather permitting"], ["3:00 PM", "Drinks & lawn games", "Canapés on the terrace"], ["5:30 PM", "Dinner & speeches", "Long tables in the barn"], ["8:00 PM", "First dance, then dancing", "Carriages at midnight"]].map(([t, n, d]) => `<div class="wd-slot"><span class="num">${t}</span><div><b>${n}</b><div class="wd-soft">${d}</div></div></div>`).join("")}</article>
    <article class="card wd-day"><span class="sk-eyebrow">Sunday 13 June</span><h3 class="sk-h3">Recovery brunch</h3>${[["11:00 AM", "Brunch at the barn", "Bacon rolls, pastries, strong coffee."], ["1:00 PM", "Goodbyes", "Last shuttle to the station at 1:30."]].map(([t, n, d]) => `<div class="wd-slot"><span class="num">${t}</span><div><b>${n}</b><div class="wd-soft">${d}</div></div></div>`).join("")}</article>
  </div>
</div></section>

<section class="sk-sec sk-tight sk-alt" id="travel"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">Venue & travel</span><h2 class="sk-h2">Getting to Larkfield Barn</h2></div><p class="muted" style="max-width:380px">The barn is a mile outside Hollow Vale. We’ve booked shuttles from the village and the station so nobody needs to drive.</p></div>
  <div class="wd-travel">
    <div class="card wd-venue"><div class="sk-photo">${mapShot()}</div><div><div><b>Larkfield Barn</b><div class="wd-soft">Lark Lane, Hollow Vale · step-free throughout</div></div><a class="btn" href="#">Open in maps ${ic("arrow", 15)}</a></div></div>
    <div class="wd-ways">
      <div class="card wd-way"><span class="wd-ico">${ic("pin", 18)}</span><div><b>By train</b><p class="wd-soft">Hollow Vale station, 2 hours from the city. Shuttles meet the 12:10 and 12:40 arrivals on Saturday.</p></div></div>
      <div class="card wd-way"><span class="wd-ico">${ic("globe", 18)}</span><div><b>By car</b><p class="wd-soft">Free parking for 60 cars in the paddock. Leave your car overnight and collect it by Sunday noon.</p></div></div>
      <div class="card wd-way"><span class="wd-ico">${ic("home", 18)}</span><div><b>Hotel block at the Hollow Vale Inn</b><p class="wd-soft">22 rooms held at $145 a night until 15 March. Quote <span class="wd-code">${esc((a + (b || "")).toUpperCase().replace(/[^A-Z]/g, ""))}27</span> when you book.</p></div></div>
    </div>
  </div>
</div></section>

<section class="sk-sec sk-tight"><div class="sk-wrap">
  <div class="wd-center"><span class="sk-eyebrow">Wedding party</span><h2 class="sk-h2">The people standing with us</h2></div>
  <div class="wd-party">${[["Layla H.", "Maid of honour"], ["Ewan M.", "Best man"], ["Sofia R.", "Bridesmaid"], ["Daniel O.", "Groomsman"], ["Hana K.", "Bridesmaid"], ["Theo B.", "Ring bearer"]].map(([n, r], i) => `<figure><div class="sk-photo">${face(i, n)}</div><figcaption><b>${esc(n)}</b><span class="wd-soft">${esc(r)}</span></figcaption></figure>`).join("")}</div>
</div></section>

<section class="sk-sec sk-tight sk-alt" id="registry"><div class="sk-wrap wd-reg">
  <div class="sk-stack" style="gap:12px"><span class="sk-eyebrow">Registry</span><h2 class="sk-h2" style="font-size:calc(32px * var(--hs))">Your being there is the gift</h2><p class="wd-soft">If you’d like to give something, here are three things we’re saving for.</p></div>
  ${[["Honeymoon fund", "Ten days on a slow train through the mountains.", 64], ["Garden fund", "A bench, a lemon tree and a lot of soil for the balcony.", 38], ["A cause we love", "Gifts here go to our local food bank.", 51]].map(([t, d, pc]) => `<div class="card"><b>${t}</b><p class="wd-soft">${d}</p><div class="wd-bar" role="img" aria-label="${pc}% of goal"><i style="width:${pc}%"></i></div><span class="wd-soft" style="font-size:12px">${pc}% of goal</span><a href="#" style="font-weight:600;font-size:14px;display:inline-flex;gap:6px;align-items:center;margin-top:4px">Contribute ${ic("arrow", 14)}</a></div>`).join("")}
</div></section>

<section class="sk-sec sk-tight" id="faq"><div class="sk-wrap">
  <div class="wd-center"><span class="sk-eyebrow">FAQ</span><h2 class="sk-h2">Good questions, answered</h2></div>
  <div class="wd-faq">${[["What should I wear?", "Garden formal. Think summer suits and dresses; the ceremony is on grass, so leave the stilettos at home.", 1], ["Are children invited?", "We love your kids, but the day is adults only. Babies in arms are welcome.", 1], ["Is there parking?", "Yes, free parking in the paddock for 60 cars. Shuttles run from the Inn and the station.", 0], ["Can I bring a plus-one?", "If your invitation says “and guest”, absolutely. Add their name in the RSVP.", 0], ["What if it rains?", "The ceremony moves into the barn. Bring a light jacket for the evening either way.", 0], ["When should I RSVP?", "By 1 April 2027 please, so we can confirm numbers with the caterers.", 0]].map(([q, ans, open], i) => `<details${open ? " open" : ""}${i === 5 ? ' class="wd-m-hide"' : ""}><summary>${esc(q)}${ic(open ? "minus" : "plus", 16)}</summary><p>${esc(ans)}</p></details>`).join("")}</div>
</div></section>

<section class="sk-sec sk-tight sk-alt" id="rsvp"><div class="sk-wrap">
  <div class="wd-center"><span class="sk-eyebrow">RSVP</span><h2 class="sk-h2">Will you join us?</h2><p class="muted">Please reply by 1 April 2027. One form per invitation.</p></div>
  <form class="card wd-rsvp" aria-label="RSVP">
    <div class="sk-g2"><div class="sk-field"><label for="wd-name">Full name</label><input class="sk-input" id="wd-name" value="Priya Nair"></div><div class="sk-field"><label for="wd-mail">Email</label><input class="sk-input" id="wd-mail" value="priya.nair@example.com"></div></div>
    <div class="sk-field"><label>Will you be attending?</label><div class="wd-opts"><span class="wd-opt on"><i></i>Joyfully accepts</span><span class="wd-opt"><i></i>Regretfully declines</span></div></div>
    <div class="sk-g2"><div class="sk-field"><label for="wd-guest">Guest name (if invited)</label><input class="sk-input" id="wd-guest" value="Sam Achebe"></div><div class="sk-field"><label for="wd-fri">Friday welcome drinks</label><select class="sk-input" id="wd-fri"><option>Yes, both of us</option><option>No, Saturday only</option></select></div></div>
    <div class="sk-field"><label>Dinner choice</label><div class="wd-opts c3">${[["Slow-roast lamb", "Salsa verde, new potatoes", 1], ["Hake & mussels", "Saffron broth", 0], ["Wild mushroom risotto", "Vegetarian, vegan option", 0]].map(([t, d, on]) => `<span class="wd-opt${on ? " on" : ""}"><i></i><span>${t}<small>${d}</small></span></span>`).join("")}</div></div>
    <div class="sk-field"><label for="wd-diet">Dietary needs or allergies</label><input class="sk-input" id="wd-diet" value="Sam is allergic to tree nuts"></div>
    <div class="sk-row" style="justify-content:space-between"><span class="wd-soft">Questions? rsvp@ourday.example</span><button class="btn primary sk-btn-lg" type="button">Send RSVP</button></div>
  </form>
</div></section>
</main>
${K.footer(p, "Saturday 12 June 2027 · Larkfield Barn, Hollow Vale. We can’t wait to celebrate with you.", [["The day", ["Ceremony 2:00 PM", "Dinner 5:30 PM", "Carriages midnight"]], ["Contact", ["rsvp@ourday.example", "Layla: (555) 012-8841", "Ewan: (555) 012-3307"]], ["Plan", ["Travel & hotels", "Registry", "FAQ"]]], `Made with love by ${p.name}, 2027.`)}`, CSS);
};

module.exports = {
  "wedding-website": K.def("wedding", "Wedding website",
    "a full wedding website home page: navigation with an RSVP button, a centred hero with the couple’s names, date and venue, an arched venue image, a countdown and RSVP call to action, an our-story timeline, a three-day weekend schedule with the wedding-day running order, venue map with train, car and hotel-block travel details, the wedding party, a registry of three funds with progress, an FAQ on dress code, children and parking, an RSVP form with attendance, guest, welcome-drinks and dinner choices and dietary needs, and a footer",
    ["navigation-header", "hero", "countdown", "timeline", "story", "schedule", "event-cards", "map", "travel", "hotel-block", "team", "registry", "progress-bar", "faq", "accordion", "rsvp-form", "radio-group", "footer", "wedding"], web),
};
