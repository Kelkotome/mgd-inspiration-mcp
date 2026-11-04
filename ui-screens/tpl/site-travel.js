/* Travel website template (Driftmark Journeys — fictional small-group tour operator). Full responsive home page:
   nav, panoramic hero with an overlapping trip-search panel, featured trips with days/group/price/difficulty,
   destination mosaic, how a trip works timeline, responsible-travel facts, traveller notes, enquiry + brochure form, footer.
   Landscapes are inline SVG scenes in fixed natural tones. */
const { ic, esc } = require("../lib");
const K = require("../sitekit");

const CSS = `<style>
.tr-hero{position:relative;padding-top:28px;padding-bottom:72px}
.tr-pano{aspect-ratio:1104/500;border-radius:var(--radius-lg)}
.tr-panel{position:relative;margin:-150px 40px 0;padding:36px 40px;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.15fr);gap:40px;align-items:end;background:var(--bg)}
.tr-panel h1{font-size:calc(48px * var(--hs));line-height:1.04}
.tr-search{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
.tr-search .btn{grid-column:1/-1}
.tr-search .sk-input{display:flex;align-items:center;justify-content:space-between;gap:8px}
.tr-pills{display:flex;flex-wrap:wrap;gap:8px 20px;font-size:14px;color:var(--muted)}
.tr-pills span{display:inline-flex;align-items:center;gap:6px}
.tr-trips{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:28px}
.tr-trip{padding:0;overflow:hidden;display:flex;flex-direction:column}
.tr-trip .sk-photo{aspect-ratio:3/2;border-radius:0}
.tr-trip-b{padding:22px 24px 24px;display:grid;gap:12px;flex:1}
.tr-meta{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));border-block:1px solid var(--border);padding:12px 0;font-size:13px}
.tr-meta div+div{border-left:1px solid var(--border);padding-left:12px}
.tr-meta b{display:block;font-size:15px}
.tr-diff{display:inline-flex;gap:3px;vertical-align:middle;margin-left:6px}
.tr-diff i{width:14px;height:6px;border-radius:2px;background:var(--border)}
.tr-diff i.on{background:var(--primary)}
.tr-price{display:flex;justify-content:space-between;align-items:end;gap:12px;margin-top:auto}
.tr-mosaic{display:grid;grid-template-columns:1.4fr 1fr 1fr;grid-template-rows:200px 200px;gap:16px}
.tr-mosaic .sk-photo{border-radius:var(--radius-lg)}
.tr-mosaic .sk-photo:first-child{grid-row:span 2}
.tr-dest{position:absolute;left:14px;bottom:14px;right:14px;display:flex;justify-content:space-between;align-items:center;gap:8px;padding:10px 14px;border-radius:var(--radius);background:color-mix(in oklab,var(--bg) 90%,transparent);color:var(--text);font-size:13px}
.tr-dest b{font-size:15px}
.tr-steps{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:0;counter-reset:st}
.tr-step{position:relative;padding:28px 24px 0 0;border-top:2px solid var(--text);display:grid;gap:10px;align-content:start}
.tr-step::before{counter-increment:st;content:counter(st,decimal-leading-zero);position:absolute;top:-15px;left:0;background:var(--bg);padding-right:10px;font:600 13px var(--font-b);color:var(--muted)}
.tr-step .sk-h3{font-size:calc(20px * var(--hs))}
.tr-resp{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);gap:64px;align-items:start}
.tr-facts{display:grid;gap:0}
.tr-fact{display:grid;grid-template-columns:110px minmax(0,1fr);gap:20px;padding:14px 0;border-bottom:1px solid var(--border);align-items:baseline}
.tr-fact .num{font-size:28px}
.tr-notes{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px}
.tr-note{padding:26px;display:grid;gap:14px;align-content:start}
.tr-note q{font-family:var(--font-h);font-size:calc(18px * var(--hs));line-height:1.42;quotes:"\\201C" "\\201D"}
.tr-note .badge{justify-self:start}
.tr-enq{display:grid;grid-template-columns:minmax(0,.85fr) minmax(0,1.15fr);gap:0;padding:0;overflow:hidden}
.tr-enq-side{padding:40px;display:grid;gap:18px;align-content:start;background:color-mix(in oklab,var(--primary) 10%,var(--surface));border-right:1px solid var(--border)}
.tr-enq form{padding:40px;display:grid;gap:16px}
.tr-enq .sk-g2{gap:14px}
.tr-check{display:flex;gap:10px;align-items:center;font-size:14px}
.tr-box{width:18px;height:18px;border:1px solid var(--border);border-radius:4px;display:grid;place-items:center;flex:none;background:var(--bg)}
.tr-box.on{background:var(--primary);border-color:var(--primary);color:var(--on-primary)}
.tr-call{display:flex;gap:12px;align-items:center;font-size:14px}
.tr-call .avatar{width:40px;height:40px}
@media (max-width:1024px){
  .tr-panel{grid-template-columns:minmax(0,1fr);margin:-110px 24px 0}
  .tr-trips{gap:20px}
}
@media (max-width:760px){
  .tr-hero{padding-top:0;padding-bottom:48px}
  .tr-hero>.sk-wrap{padding:0}
  .tr-pano{aspect-ratio:4/3;border-radius:0}
  .tr-panel{margin:-48px 16px 0;padding:24px 20px;gap:20px}
  .tr-panel h1{font-size:calc(34px * var(--hs))}
  .tr-search{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}
  .tr-search .sk-field:first-child{grid-column:1/-1}
  .tr-trips{display:flex}
  .tr-trips,.tr-notes{scroll-padding-inline:20px}
  .tr-mosaic{grid-template-columns:minmax(0,1fr) minmax(0,1fr);grid-template-rows:200px 150px 150px}
  .tr-mosaic .sk-photo:first-child{grid-row:auto;grid-column:1/-1}
  .tr-mosaic .sk-photo:nth-child(n+6){display:none}
  .tr-dest{left:8px;right:8px;bottom:8px;padding:7px 10px;font-size:12px}
  .tr-dest>span:last-child{display:none}
  .tr-steps{grid-template-columns:minmax(0,1fr);gap:28px}
  .tr-step{padding:22px 0 0}
  .tr-resp{grid-template-columns:minmax(0,1fr);gap:24px}
  .tr-fact{grid-template-columns:84px minmax(0,1fr);gap:14px;padding:14px 0}
  .tr-fact .num{font-size:22px}
  .tr-notes{display:flex}
  .tr-enq{grid-template-columns:minmax(0,1fr)}
  .tr-enq-side{padding:24px;border-right:0;border-bottom:1px solid var(--border)}
  .tr-enq-side .tr-hide{display:none}
  .tr-enq form{padding:24px}
}
</style>`;

// ---- illustrative landscape "photos" (fixed natural tones) -----------------------------------------------------
const SC = {
  fjord: { sky: ["#a9c4d8", "#e6eef2"], hills: ["#5d7487", "#3e5466", "#2a3b47"], water: "#4a6d82" },
  dunes: { sky: ["#e9b679", "#f6e2c2"], hills: ["#d39a5a", "#b9783f", "#8f5a2e"], water: null },
  alps: { sky: ["#8fb3d1", "#dfeaf2"], hills: ["#9aa7b3", "#6b7d6a", "#3f5a40"], water: null },
  coast: { sky: ["#f0c49b", "#fbe8d4"], hills: ["#8a9a6a", "#6a7b4f", "#4a5a38"], water: "#3f7f94" },
  forest: { sky: ["#b9cbb4", "#e8efe2"], hills: ["#6f8a63", "#4c6a45", "#2f4a2e"], water: null },
  terraces: { sky: ["#c6d6c0", "#eef2e4"], hills: ["#9bb26a", "#7d9a4e", "#5b7a38"], water: null },
};
const scene = (kind, id, label, w = 600, h = 400) => {
  const s = SC[kind], g = `tr-${kind}-${id}`;
  const ridge = (y, amp, seed) => { let d = `M0 ${h}L0 ${y}`; for (let x = 0; x <= w; x += w / 8) d += `L${x} ${y - amp * Math.abs(Math.sin((x + seed) / 61))}`; return `${d}L${w} ${h}z`; };
  const extra = {
    fjord: `<path d="M0 ${h * .72}h${w}v${h * .28}H0z" fill="${s.water}"/><path d="M${w * .2} ${h * .8}h${w * .5}" stroke="#d7e4ea" stroke-width="2" opacity=".6"/><path d="M${w * .58} ${h * .76}l26 0-6 8h-16z" fill="#c8442f"/>`,
    dunes: `<circle cx="${w * .78}" cy="${h * .24}" r="${h * .08}" fill="#fff3d6"/>${[0, 1, 2].map((i) => `<path d="M${w * (.2 + i * .1)} ${h * .74}q6-10 12 0" stroke="#5b3a24" stroke-width="3" fill="none"/>`).join("")}`,
    alps: `<path d="M${w * .3} ${h * .46}l${w * .12}-${h * .3} ${w * .12} ${h * .3}z" fill="#eef2f5"/><path d="M${w * .58} ${h * .5}l${w * .1}-${h * .24} ${w * .1} ${h * .24}z" fill="#e4eaee"/>`,
    coast: `<path d="M0 ${h * .7}C${w * .3} ${h * .62} ${w * .6} ${h * .78} ${w} ${h * .66}V${h}H0z" fill="${s.water}"/><circle cx="${w * .2}" cy="${h * .22}" r="${h * .07}" fill="#fff0db"/><path d="M${w * .7} ${h * .6}h60" stroke="#f6f0e4" stroke-width="3" opacity=".7"/>`,
    forest: Array.from({ length: 9 }, (_, i) => { const x = 30 + i * (w / 9), y = h * (.62 + (i % 3) * .05); return `<path d="M${x} ${y - 70}l26 70h-52z" fill="#2a4229"/><rect x="${x - 3}" y="${y}" width="6" height="14" fill="#3a2e24"/>`; }).join(""),
    terraces: Array.from({ length: 5 }, (_, i) => `<path d="M0 ${h * (.55 + i * .09)}C${w * .3} ${h * (.5 + i * .09)} ${w * .7} ${h * (.6 + i * .09)} ${w} ${h * (.52 + i * .09)}" stroke="#cfe0a6" stroke-width="3" fill="none" opacity=".7"/>`).join(""),
  }[kind];
  return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${esc(label)}"><defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${s.sky[0]}"/><stop offset="1" stop-color="${s.sky[1]}"/></linearGradient></defs>
<rect width="${w}" height="${h}" fill="url(#${g})"/><path d="${ridge(h * .5, h * .2, 13)}" fill="${s.hills[0]}"/><path d="${ridge(h * .62, h * .14, 47)}" fill="${s.hills[1]}"/>${kind === "fjord" || kind === "coast" ? "" : `<path d="${ridge(h * .78, h * .1, 89)}" fill="${s.hills[2]}"/>`}${extra}</svg>`;
};

const TRIPS = [
  ["fjord", "Fjords by sea kayak", "Western Norway", "9", "8–12", "$3,480", 3, "Paddle 10–14 km a day between farm guesthouses. No kayak experience needed, a day of training first.", "Jun–Aug"],
  ["dunes", "Desert camps of the south", "Morocco", "8", "6–10", "$2,140", 2, "Camel-assisted walks of 3–4 hours, two nights in a fixed camp, a cooking day in a village kitchen.", "Oct–Apr"],
  ["alps", "Hut to hut, the high route", "Austria & Italy", "11", "8–12", "$3,920", 4, "6–8 hours on foot each day with up to 1,100 m of climbing. Luggage meets you every second night.", "Jul–Sep"],
];
const DESTS = [["coast", "The Adriatic coast", "14 trips", "Walking & island hops"], ["terraces", "Northern Vietnam", "6 trips", "Rice terraces"], ["forest", "Patagonian forests", "5 trips", "Trekking"], ["alps", "The Dolomites", "8 trips", "Huts"], ["fjord", "Iceland’s east", "4 trips", "Coast"]];
const diff = (n) => `<span class="tr-diff" aria-label="Difficulty ${n} of 5">${[1, 2, 3, 4, 5].map((i) => `<i class="${i <= n ? "on" : ""}"></i>`).join("")}</span>`;

const web = (p, st) => K.page(st, `${K.nav(p, ["Trips", "Destinations", "How it works", "Travel lightly"], "Enquire", "Get the brochure")}
<main>
<section class="tr-hero" id="top"><div class="sk-wrap">
  <div class="sk-photo tr-pano">${scene("fjord", "hero", "Sea kayaks on a calm fjord below steep green mountains", 1104, 500)}</div>
  <div class="card tr-panel">
    <div class="sk-stack" style="gap:16px"><span class="sk-eyebrow">Small groups · 12 travellers max</span>
      <h1>Small groups, slow routes, leaders who live there</h1>
      <p class="muted" style="font-size:16px">${esc(p.name)} runs 46 trips in 19 countries with local leaders who live where you’re going.</p></div>
    <div class="sk-stack" style="gap:14px;justify-items:stretch">
      <form class="tr-search" aria-label="Find a trip">
        <div class="sk-field"><label for="tr-where">Destination</label><div class="sk-input" id="tr-where">Anywhere in Europe ${ic("chevdown", 16)}</div></div>
        <div class="sk-field"><label for="tr-when">Month</label><div class="sk-input" id="tr-when">June 2027 ${ic("calendar", 16)}</div></div>
        <div class="sk-field"><label for="tr-who">Travellers</label><div class="sk-input" id="tr-who">2 adults ${ic("users", 16)}</div></div>
        <button class="btn primary sk-btn-lg" type="button">${ic("search", 16)} Show 18 trips</button>
      </form>
      <div class="tr-pills"><span>${ic("check", 15)} Free changes up to 60 days out</span><span>${ic("check", 15)} Deposit from $300</span><span>${ic("check", 15)} Solo rooms on most dates</span></div>
    </div>
  </div>
</div></section>

<section class="sk-sec sk-alt" id="trips"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">Featured trips · 2027 dates open</span><h2 class="sk-h2">Three trips with spaces this summer</h2></div><a class="btn sk-btn-lg" href="#">All 46 trips ${ic("arrow", 16)}</a></div>
  <div class="tr-trips sk-rail">${TRIPS.map(([k, t, where, days, grp, price, d, blurb, season], i) => `<article class="card tr-trip"><div class="sk-photo">${scene(k, `t${i}`, `${t}, ${where}`)}<span class="sk-cap">${esc(season)}</span></div>
    <div class="tr-trip-b"><div class="muted" style="font-size:13px;display:flex;align-items:center;gap:6px">${ic("pin", 14)} ${esc(where)}</div><h3 class="sk-h3">${esc(t)}</h3><p class="muted" style="font-size:14px">${esc(blurb)}</p>
    <div class="tr-meta"><div><b class="num">${days}</b>days</div><div><b class="num">${grp}</b>people</div><div><b>Level</b>${diff(d)}</div></div>
    <div class="tr-price"><div><span class="muted" style="font-size:13px">From</span><div class="num" style="font-size:24px">${price}</div><span class="muted" style="font-size:12px">per person, twin share</span></div><a class="btn" href="#">View dates</a></div></div></article>`).join("")}</div>
</div></section>

<section class="sk-sec" id="destinations"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">Destinations</span><h2 class="sk-h2">Where our leaders call home</h2></div><p class="muted" style="max-width:400px">Every destination has a leader who lives within a day’s travel of the route and plans it with us each winter.</p></div>
  <div class="tr-mosaic">${DESTS.map(([k, n, c, tag], i) => `<a class="sk-photo" href="#">${scene(k, `d${i}`, n, 500, 400)}<span class="tr-dest"><span><b>${esc(n)}</b><br>${esc(c)}</span><span class="badge">${esc(tag)}</span></span></a>`).join("")}</div>
</div></section>

<section class="sk-sec sk-tight sk-alt" id="how-it-works"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">How a trip works</span><h2 class="sk-h2">From first question to the last dinner together</h2></div></div>
  <div class="tr-steps">${[["Ask us anything", "Tell us the trip and dates. A planner who has done the route replies within one working day."], ["Hold your place", "A $300 deposit holds your spot for 14 days while you sort flights and leave."], ["Get ready", "Six weeks out you get a kit list, a training plan for the level and a video call with your leader."], ["Travel together", "Meet the group at the start hotel. Meals, transfers, guides and luggage moves are covered."]].map(([t, d]) => `<div class="tr-step"><h3 class="sk-h3">${t}</h3><p class="muted" style="font-size:14px">${d}</p></div>`).join("")}</div>
</div></section>

<section class="sk-sec" id="travel-lightly"><div class="sk-wrap tr-resp">
  <div class="sk-stack" style="gap:18px"><span class="sk-eyebrow">Travel lightly</span><h2 class="sk-h2">How we run trips, in plain numbers</h2>
    <p class="muted" style="font-size:16px">We publish these each January for the year before. They are counts, not promises, and some years they go the wrong way.</p>
    <div class="sk-photo" style="aspect-ratio:2/1;width:100%">${scene("terraces", "resp", "Terraced fields on a hillside with a footpath")}</div></div>
  <div class="tr-facts">${[["12", "Maximum group size on every departure, so we fit in family guesthouses rather than large hotels."], ["78%", "of nights in 2025 were in locally owned places to stay, up from 71% the year before."], ["31", "trips reachable by train from a major European hub. We list the rail route on each trip page."], ["$40", "per traveller goes to a project picked by the local leader, shown on your final invoice."], ["2", "trips paused in 2025 after leaders told us visitor numbers on the route had grown too fast."]].map(([n, t]) => `<div class="tr-fact"><span class="num">${n}</span><p class="muted">${t}</p></div>`).join("")}</div>
</div></section>

<section class="sk-sec sk-tight sk-alt"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">Traveller notes</span><h2 class="sk-h2">Written after the trip, not before</h2></div></div>
  <div class="tr-notes sk-rail">${[["I booked the fjords trip on my own and was worried about the paddling. The training day settled that, and by day three I was the one asking for the longer crossing.", "Ellen M.", "Fjords by sea kayak, 2025"], ["Our leader Youssef had us cooking tagine with his aunt. That afternoon is what we still talk about at home.", "Raj & Simone K.", "Desert camps, 2025"], ["Level 4 means it. Hard days, very good huts, and the luggage transfer made it doable at 61.", "Tomasz W.", "Hut to hut, 2024"]].map(([q, n, t]) => `<figure class="card tr-note"><span class="badge">${esc(t)}</span><q>${esc(q)}</q><figcaption class="sk-row" style="gap:10px"><span class="avatar" style="width:34px;height:34px">${n.split(/[ &]+/).map((w) => w[0]).join("").slice(0, 2)}</span><b>${esc(n)}</b></figcaption></figure>`).join("")}</div>
</div></section>

<section class="sk-sec sk-tight" id="enquire"><div class="sk-wrap">
  <div class="card tr-enq">
    <div class="tr-enq-side"><span class="sk-eyebrow">Plan with a person</span><h2 class="sk-h2" style="font-size:calc(32px * var(--hs))">Ask about a trip or get the 2027 brochure</h2>
      <p class="muted">84 pages of routes, day-by-day plans and honest difficulty notes. Posted free or sent as a PDF.</p>
      <div class="tr-call tr-hide"><span class="avatar">AN</span><span><b>Talk to Anya</b><br><span class="muted">Trip planner · Mon–Fri 9–6</span></span></div>
      <div class="muted tr-hide" style="font-size:14px;display:grid;gap:6px"><span style="display:flex;gap:8px;align-items:center">${ic("phone", 15)} (555) 018-4410</span><span style="display:flex;gap:8px;align-items:center">${ic("mail", 15)} plan@driftmark.example</span></div></div>
    <form aria-label="Trip enquiry">
      <div class="sk-g2"><div class="sk-field"><label for="tr-n">Full name</label><input class="sk-input" id="tr-n" value="Lin Park"></div><div class="sk-field"><label for="tr-e">Email</label><input class="sk-input" id="tr-e" value="lin.park@example.com"></div></div>
      <div class="sk-g2"><div class="sk-field"><label for="tr-t">Trip</label><select class="sk-input" id="tr-t"><option>Hut to hut, the high route</option></select></div><div class="sk-field"><label for="tr-d">Preferred month</label><select class="sk-input" id="tr-d"><option>August 2027</option></select></div></div>
      <div class="sk-field"><label for="tr-q">Your question</label><textarea class="sk-input" id="tr-q">Two of us, fairly fit hillwalkers. Is level 4 realistic without via ferrata experience?</textarea></div>
      <div class="tr-check"><span class="tr-box on">${ic("check", 12)}</span>Post me the printed brochure as well</div>
      <div class="sk-row"><button class="btn primary sk-btn-lg" type="button">Send enquiry</button><span class="muted" style="font-size:13px">Reply within one working day.</span></div>
    </form>
  </div>
</div></section>
</main>
${K.footer(p, "Small-group walking, paddling and food trips with local leaders, since 2012.", [["Trips", ["Walking & trekking", "Paddling", "Food & culture", "Private departures"]], ["Plan", ["Dates & prices", "Booking conditions", "Travel insurance", "Brochure"]], ["Company", ["Our leaders", "Travel lightly report", "Careers", "Contact"]]], `© 2026 ${p.name}. Prices per person, twin share.`)}`, CSS);

module.exports = {
  "travel-website": K.def("travel", "Travel website",
    "a full small-group tour operator home page: navigation with enquire and brochure buttons, a panoramic landscape hero with an overlapping destination/month/travellers trip search, featured trip cards with days, group size, difficulty level and from-price, a destination mosaic, a four-step how-a-trip-works timeline, responsible-travel facts in plain numbers, traveller notes, an enquiry and brochure request form and a footer",
    ["navigation-header", "hero", "search-form", "trip-cards", "price-list", "difficulty-rating", "destination-grid", "gallery", "steps", "timeline", "stats", "testimonials", "contact-form", "footer", "travel", "tour-operator"], web),
};
