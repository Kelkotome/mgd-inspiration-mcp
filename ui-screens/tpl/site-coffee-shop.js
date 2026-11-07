/* Coffee shop / bakery-café website template (cafe family: Kiln & Crumb, a bakery-café with three neighbourhood locations).
   Full responsive home page: centred hero with order-ahead CTA and pickup pill over a wide counter scene, today's bakes
   with out-of-the-oven times, a coffee menu board with size prices, three locations with hours, wholesale & catering,
   story timeline, order-ahead / catering form, footer. "Photos" are inline SVG in fixed natural tones. */
const { ic, esc } = require("../lib");
const K = require("../sitekit");

const CSS = `<style>
.cf-hero{text-align:center;padding-top:56px;padding-bottom:0;display:grid;justify-items:center;gap:18px}
.cf-hero .sk-lede{margin:0 auto}
.cf-pill{display:inline-flex;align-items:center;gap:10px;padding:8px 16px 8px 10px;border-radius:999px;border:1px solid var(--border);background:var(--surface);font-size:14px}
.cf-pill i{width:10px;height:10px;border-radius:50%;background:var(--success);display:block}
.cf-banner{margin-top:36px;width:100%;aspect-ratio:1104/280;border-radius:var(--radius-lg) var(--radius-lg) 0 0}
.cf-strip{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));border:1px solid var(--border);border-top:0;border-radius:0 0 var(--radius-lg) var(--radius-lg);background:var(--bg);text-align:left}
.cf-strip>div{padding:20px 24px;display:flex;gap:14px;align-items:center}
.cf-strip>div+div{border-left:1px solid var(--border)}
.cf-strip .cf-ico{width:40px;height:40px;flex:none;border-radius:50%;display:grid;place-items:center;background:color-mix(in oklab,var(--primary) 14%,var(--surface))}
.cf-strip span{font-size:13px;color:var(--muted)}
.cf-bakes{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:20px}
.cf-bake{display:grid;gap:10px;align-content:start}
.cf-bake .sk-photo{aspect-ratio:5/4;border-radius:var(--radius)}
.cf-bake h3{font:600 15px/1.35 var(--font-b)}
.cf-bake .cf-out{display:flex;justify-content:space-between;font-size:13px;color:var(--muted)}
.cf-low{color:var(--text);font-weight:600}
.cf-board{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(0,1fr);gap:56px;align-items:start}
.cf-menu{padding:28px 36px}
.cf-mhead,.cf-mrow{display:grid;grid-template-columns:minmax(0,1fr) 64px 64px;gap:12px;align-items:baseline}
.cf-mhead{font:600 12px var(--font-b);letter-spacing:.08em;text-transform:uppercase;color:var(--muted);padding-bottom:10px;border-bottom:2px solid var(--text)}
.cf-mhead span,.cf-mrow .num{text-align:right}
.cf-mrow{padding:10px 0;border-bottom:1px dashed var(--border)}
.cf-mrow b{font-weight:600}
.cf-mrow p{font-size:13px;color:var(--muted)}
.cf-mrow .num{font-size:15px}
.cf-group{margin-top:22px;font:600 13px var(--font-b);color:color-mix(in oklab,var(--primary) 82%,var(--text))}
.cf-side{display:grid;gap:20px}
.cf-side .sk-photo{aspect-ratio:16/10}
.cf-beans{padding:24px;display:grid;gap:10px}
.cf-beans .sk-row{justify-content:space-between}
.cf-locs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px}
.cf-loc{padding:0;overflow:hidden;display:grid;grid-template-rows:auto 1fr}
.cf-loc>div:last-child .sk-row:last-child{align-self:end}
.cf-loc .sk-photo{aspect-ratio:2/1;border-radius:0}
.cf-loc>div:last-child{padding:22px 24px 24px;display:grid;gap:12px;grid-template-rows:auto auto auto 1fr}
.cf-hours{display:grid;grid-template-columns:auto 1fr;gap:4px 18px;font-size:14px}
.cf-hours dt{color:var(--muted)}
.cf-hours dd{text-align:right}
.cf-open{display:inline-flex;align-items:center;gap:6px;font-size:13px;font-weight:600}
.cf-open i{width:8px;height:8px;border-radius:50%;background:var(--success);display:block}
.cf-open.shut i{background:var(--muted)}
.cf-trade{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px}
.cf-tcard{padding:30px;display:grid;gap:14px;align-content:start}
.cf-tcard ul{list-style:none;display:grid;gap:8px;font-size:14px}
.cf-tcard li{display:flex;gap:10px;align-items:flex-start}
.cf-tcard li svg{flex:none;margin-top:3px}
.cf-story{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:64px;align-items:start}
.cf-time{list-style:none;display:grid;gap:0;border-left:2px solid var(--border);margin-left:6px}
.cf-time li{position:relative;padding:0 0 18px 26px;display:grid;gap:4px}
.cf-time li::before{content:"";position:absolute;left:-8px;top:4px;width:14px;height:14px;border-radius:50%;background:var(--bg);border:2px solid var(--text)}
.cf-time li:last-child{padding-bottom:0}
.cf-time .num{font-size:14px}
.cf-time p{color:var(--muted);font-size:14px}
.cf-order{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);gap:0;padding:0;overflow:hidden}
.cf-order-side{padding:44px;display:grid;gap:16px;align-content:start;background:var(--text);color:var(--bg)}
.cf-order-side p{opacity:.8}
.cf-order form{padding:44px;display:grid;gap:16px}
.cf-seg{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));border:1px solid var(--border);border-radius:var(--radius);overflow:hidden}
.cf-seg span{height:42px;display:grid;place-items:center;font-weight:600;font-size:14px}
.cf-seg span.on{background:var(--text);color:var(--bg)}
.cf-order .sk-g2{gap:14px}
@media (max-width:1024px){
  .cf-bakes{grid-template-columns:repeat(3,minmax(0,1fr))}
  .cf-locs{grid-template-columns:repeat(2,minmax(0,1fr))}
  .cf-board{gap:32px}
}
@media (max-width:760px){
  .cf-hero{padding-top:36px;gap:16px}
  .cf-banner{margin-top:16px;aspect-ratio:4/3}
  .cf-strip{grid-template-columns:minmax(0,1fr)}
  .cf-strip>div{padding:14px 18px}
  .cf-strip>div+div{border-left:0;border-top:1px solid var(--border)}
  .cf-bakes{grid-template-columns:none;scroll-padding-inline:20px}
  .cf-bakes>*{flex-basis:56%!important;min-width:0}
  .cf-bake .sk-row{flex-wrap:wrap!important;gap:2px 8px}
  .cf-board{grid-template-columns:minmax(0,1fr);gap:20px}
  .cf-menu{padding:22px 18px}
  .cf-mhead,.cf-mrow{grid-template-columns:minmax(0,1fr) 46px 46px;gap:8px}
  .cf-side .sk-photo{display:none}
  .cf-locs{grid-template-columns:none}
  .cf-loc .sk-photo{aspect-ratio:2/1}
  .cf-trade{grid-template-columns:minmax(0,1fr);gap:16px}
  .cf-tcard{padding:22px}
  .cf-story{grid-template-columns:minmax(0,1fr);gap:28px}
  .cf-order{grid-template-columns:minmax(0,1fr)}
  .cf-order-side,.cf-order form{padding:24px}
  .cf-order-side .cf-extra{display:none}
}
</style>`;

// ---- illustrative bakery & café "photos" (fixed natural tones) -----------------------------------------------------
const T = { crust: "#c68a4a", dark: "#8a5428", butter: "#efd08c", cream: "#f4ead6", choc: "#4a2c1d", berry: "#9c2f4a", wood: "#a0703f", plate: "#efe9de", sage: "#a7b89a", cup: "#f2eee7" };
const bake = (kind, id) => {
  const art = {
    croissant: `<path d="M40 120c10-40 110-40 120 0-12 10-30 14-60 14s-48-4-60-14z" fill="${T.crust}"/>${[60, 80, 100, 120, 140].map((x) => `<path d="M${x} 92q${x < 100 ? 6 : -6} 18 0 38" stroke="${T.dark}" stroke-width="3" fill="none" opacity=".6"/>`).join("")}<path d="M52 108c20-22 76-22 96 0" stroke="${T.butter}" stroke-width="4" fill="none" opacity=".8"/>`,
    bun: `<circle cx="100" cy="108" r="46" fill="${T.crust}"/><path d="M70 98c16-16 46-16 60 0M66 116c22-12 50-12 70 2" stroke="${T.cream}" stroke-width="7" fill="none" stroke-linecap="round"/><circle cx="100" cy="108" r="10" fill="${T.dark}" opacity=".6"/>`,
    loaf: `<ellipse cx="100" cy="112" rx="66" ry="38" fill="${T.dark}"/><ellipse cx="100" cy="106" rx="60" ry="30" fill="${T.crust}"/>${[-24, 0, 24].map((d) => `<path d="M${84 + d} 86q14 18 0 40" stroke="${T.cream}" stroke-width="5" fill="none" stroke-linecap="round"/>`).join("")}`,
    cookie: `<circle cx="96" cy="108" r="46" fill="${T.butter}"/><circle cx="96" cy="108" r="46" fill="${T.crust}" opacity=".45"/>${[[78, 92], [110, 96], [92, 124], [120, 122], [72, 116]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="${T.choc}"/>`).join("")}`,
    tart: `<circle cx="100" cy="108" r="46" fill="${T.crust}"/><circle cx="100" cy="108" r="38" fill="${T.cream}"/>${[[86, 98], [112, 100], [98, 120], [120, 120], [80, 120]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="9" fill="${T.berry}"/>`).join("")}`,
  }[kind];
  return `<svg viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${esc(kind)} on a plate"><defs><linearGradient id="cf-b-${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e7d6bd"/><stop offset="1" stop-color="#cdb393"/></linearGradient></defs><rect width="200" height="200" fill="url(#cf-b-${id})"/><ellipse cx="100" cy="128" rx="84" ry="46" fill="${T.plate}"/><ellipse cx="100" cy="124" rx="72" ry="38" fill="#f7f3ec"/>${art}</svg>`;
};
const counter = () => `<svg viewBox="0 0 1104 400" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Café counter with a pastry case, espresso machine and pendant lights"><defs>
<linearGradient id="cf-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9c6a8"/><stop offset="1" stop-color="#c4a984"/></linearGradient></defs>
<rect width="1104" height="400" fill="url(#cf-wall)"/>${[180, 480, 820].map((x) => `<path d="M${x} 0v70" stroke="#3b2a1e" stroke-width="2"/><path d="M${x - 26} 70h52l-10 22h-32z" fill="#2f4a3f"/><ellipse cx="${x}" cy="110" rx="60" ry="18" fill="#ffe3a6" opacity=".3"/>`).join("")}
<rect x="620" y="96" width="420" height="120" rx="6" fill="#2f4a3f"/><text x="644" y="132" font-family="sans-serif" font-size="18" fill="#f3ead8" font-weight="700">TODAY</text>${[0, 1, 2, 3].map((i) => `<rect x="644" y="${148 + i * 14}" width="${200 - i * 24}" height="6" rx="3" fill="#f3ead8" opacity=".55"/><rect x="${960 - i * 6}" y="${148 + i * 14}" width="40" height="6" rx="3" fill="#f3ead8" opacity=".55"/>`).join("")}
<rect y="250" width="1104" height="150" fill="#7a5130"/><rect y="244" width="1104" height="14" fill="#5d3d24"/>
<rect x="70" y="170" width="420" height="80" rx="6" fill="#e9f0ee" opacity=".55"/><rect x="70" y="210" width="420" height="4" fill="#ffffff" opacity=".7"/>${[[110, 196, "croissant"], [190, 198, "bun"], [270, 196, "croissant"], [350, 198, "cookie"], [430, 196, "bun"], [130, 236, "cookie"], [220, 236, "tart"], [310, 236, "loaf"], [400, 236, "tart"]].map(([x, y, k]) => k === "croissant" ? `<path d="M${x - 26} ${y + 6}c6-22 46-22 52 0-14 6-38 6-52 0z" fill="${T.crust}"/>` : k === "bun" ? `<circle cx="${x}" cy="${y}" r="16" fill="${T.crust}"/><path d="M${x - 9} ${y - 2}q9-8 18 0" stroke="${T.cream}" stroke-width="3" fill="none"/>` : k === "cookie" ? `<circle cx="${x}" cy="${y}" r="15" fill="#c79a5c"/><circle cx="${x - 4}" cy="${y - 3}" r="3" fill="${T.choc}"/><circle cx="${x + 5}" cy="${y + 4}" r="3" fill="${T.choc}"/>` : k === "tart" ? `<circle cx="${x}" cy="${y}" r="16" fill="${T.crust}"/><circle cx="${x}" cy="${y}" r="11" fill="${T.berry}"/>` : `<ellipse cx="${x}" cy="${y}" rx="28" ry="14" fill="${T.dark}"/>`).join("")}
<rect x="610" y="176" width="220" height="74" rx="10" fill="#b9bdbf"/><rect x="624" y="188" width="192" height="22" rx="5" fill="#8d9294"/><rect x="660" y="214" width="14" height="22" fill="#4a4a4a"/><rect x="766" y="214" width="14" height="22" fill="#4a4a4a"/><path d="M652 236h30v10h-30zM758 236h30v10h-30z" fill="${T.cup}"/>
${[[900, 214], [940, 222], [980, 214]].map(([x, y]) => `<path d="M${x - 16} ${y}h32l-4 32h-24z" fill="${T.cup}"/><rect x="${x - 16}" y="${y + 10}" width="32" height="8" fill="#a0703f"/>`).join("")}
<rect x="0" y="300" width="1104" height="3" fill="#5d3d24" opacity=".5"/></svg>`;
const scene = (kind, id) => {
  if (kind === "pour") return `<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Barista pouring latte art into a cup"><rect width="400" height="300" fill="#5a3b26"/><rect y="200" width="400" height="100" fill="#3f291b"/><ellipse cx="200" cy="208" rx="96" ry="18" fill="#2c1c12" opacity=".6"/><path d="M120 150h160l-14 62c-4 12-40 16-66 16s-62-4-66-16z" fill="${T.cup}"/><ellipse cx="200" cy="150" rx="80" ry="16" fill="#9a6a3f"/><path d="M200 140c-14 4-22 10-14 14 8 3 22 1 28-6s-4-10-14-8z" fill="#f2e6d0"/><path d="M280 162c30 0 30 34 0 34" stroke="${T.cup}" stroke-width="10" fill="none"/><path d="M226 30l-30 40v60" stroke="#c9c2b8" stroke-width="22" stroke-linecap="round" fill="none"/><path d="M200 124v20" stroke="#efe2cb" stroke-width="5"/></svg>`;
  const street = { mill: ["#c9b08a", "#7a8f6a", "#2f4a3f"], dock: ["#b9c3c8", "#8a6a4a", "#6b3a2a"], park: ["#d7c3a6", "#97a989", "#3a4a5e"] }[kind];
  return `<svg viewBox="0 0 400 225" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${esc(kind)} café shopfront"><rect width="400" height="225" fill="${street[0]}"/><rect y="186" width="400" height="39" fill="#8f877c"/><rect x="70" y="40" width="260" height="146" fill="${street[2]}"/><rect x="92" y="78" width="98" height="108" fill="#f4e3be" opacity=".85"/><rect x="210" y="78" width="98" height="80" fill="#f4e3be" opacity=".85"/><rect x="226" y="120" width="38" height="66" fill="#2a1d14"/><path d="M60 40h280l-14 26H74z" fill="${street[1]}"/>${[0, 1, 2, 3, 4, 5, 6].map((i) => `<path d="M${84 + i * 40} 40l-4 26" stroke="#f3ead8" stroke-width="6" opacity=".5"/>`).join("")}<rect x="124" y="50" width="152" height="10" rx="2" fill="#f3ead8" opacity=".2"/><circle cx="${id % 2 ? 40 : 360}" cy="150" r="30" fill="${street[1]}"/><rect x="${id % 2 ? 37 : 357}" y="150" width="6" height="36" fill="#5b4330"/><rect x="104" y="170" width="20" height="16" fill="#5b4330"/></svg>`;
};

const BAKES = [["croissant", "Butter croissant", "4.20", "Out at 7:00", "28 left"], ["bun", "Cardamom knot", "4.80", "Out at 7:30", "Only 6 left"], ["loaf", "Country sourdough", "8.50", "Out at 8:00", "14 left"], ["cookie", "Brown-butter cookie", "3.60", "Out at 10:00", "40 left"], ["tart", "Rhubarb & custard tart", "5.40", "Out at 11:00", "Only 4 left"]];
const MENU = [["Espresso", [["Espresso", "House blend, chocolate & plum", "3.20", ""], ["Flat white", "Double shot, textured milk", "4.10", "4.60"], ["Cappuccino", "Cocoa on request", "4.10", "4.60"], ["Oat latte", "No extra charge for oat or soy", "4.40", "4.90"]]],
  ["Filter & other", [["Batch brew", "Rotating single origin, free refill", "3.40", "3.90"], ["Pour-over", "Ask what’s on the grinder today", "5.20", ""], ["Chai", "Our own spice mix, steeped in milk", "4.30", "4.80"]]]];
const LOCS = [["mill", "Mill Street", "28 Mill Street, by the clock tower", "Seats 40 · Bakery on site", [["Mon–Fri", "7:00–17:00"], ["Sat–Sun", "8:00–16:00"]], "Open until 17:00", ""],
  ["dock", "Dockside", "4 Harbour Arcade, Unit 2", "Seats 18 · Takeaway window", [["Mon–Fri", "6:30–15:00"], ["Sat", "8:00–14:00"], ["Sun", "Closed"]], "Open until 15:00", ""],
  ["park", "Parkside", "61 Elm Row, opposite the park gates", "Seats 26 · Dogs welcome", [["Tue–Sun", "8:00–16:00"], ["Mon", "Closed"]], "Closed today, opens Tue 8:00", "shut"]];

const web = (p, st) => K.page(st, `${K.nav(p, ["Today’s bakes", "Coffee", "Locations", "Catering", "Our story"], "Order ahead")}
<main>
<section class="sk-wrap cf-hero" id="top">
  <span class="cf-pill"><i></i>Mill Street pickup ready in about 10 minutes</span>
  <h1 class="sk-h1" style="max-width:820px;text-wrap:balance">Baked before sunrise, poured all day</h1>
  <p class="sk-lede">${esc(p.name)} bakes everything at our Mill Street kitchen from 4 AM and bikes it to three cafés across town. Order ahead and skip the queue.</p>
  <div class="sk-row" style="justify-content:center"><a class="btn primary sk-btn-lg" href="#order-ahead">Order ahead for pickup</a><a class="btn sk-btn-lg" href="#locations">Find a café</a></div>
  <div class="sk-photo cf-banner">${counter()}</div>
  <div class="cf-strip" style="width:100%;margin-top:-22px">${[["clock", "Open from 6:30 AM", "Dockside, weekdays"], ["bolt", "Order ahead", "Ready in 10–15 minutes"], ["pin", "Three cafés", "Mill Street, Dockside, Parkside"]].map(([i, a, b]) => `<div><span class="cf-ico">${ic(i, 18)}</span><div><b>${a}</b><br><span>${b}</span></div></div>`).join("")}</div>
</section>

<section class="sk-sec sk-tight" id="today-s-bakes"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">Today’s bakes · Thursday</span><h2 class="sk-h2">Out of the oven this morning</h2></div><a class="btn" href="#">Full bakery list ${ic("arrow", 16)}</a></div>
  <div class="cf-bakes sk-rail">${BAKES.map(([k, n, pr, out, left], i) => `<article class="cf-bake"><div class="sk-photo">${bake(k, i)}</div><div class="sk-row" style="justify-content:space-between;flex-wrap:nowrap;align-items:baseline"><h3>${esc(n)}</h3><span class="num" style="font-size:15px">$${pr}</span></div><div class="cf-out"><span>${out}</span><span class="${left.startsWith("Only") ? "cf-low" : ""}">${left}</span></div></article>`).join("")}</div>
</div></section>

<section class="sk-sec sk-alt" id="coffee"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">Coffee menu</span><h2 class="sk-h2">Roasted fortnightly, two streets away</h2></div></div>
  <div class="cf-board">
    <div class="card cf-menu"><div class="cf-mhead"><span style="text-align:left">Drink</span><span>8 oz</span><span>12 oz</span></div>
      ${MENU.map(([g, rows]) => `<div class="cf-group">${g}</div>${rows.map(([n, d, a, b]) => `<div class="cf-mrow"><div><b>${esc(n)}</b><p>${esc(d)}</p></div><span class="num">${a}</span><span class="num">${b || "–"}</span></div>`).join("")}`).join("")}
    </div>
    <div class="cf-side"><div class="sk-photo">${scene("pour", 0)}<span class="sk-cap">Flat white, Mill Street</span></div>
      <div class="card cf-beans"><span class="sk-eyebrow">On the grinder</span><h3 class="sk-h3">Huila, Colombia · washed</h3><p class="muted" style="font-size:14px">Red apple, panela, a long cocoa finish. 250 g bags to take home.</p><div class="sk-row"><span class="num" style="font-size:20px">$14.50</span><a class="btn" href="#">Add beans to order</a></div></div>
    </div>
  </div>
</div></section>

<section class="sk-sec sk-tight" id="locations"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">Locations</span><h2 class="sk-h2">Three cafés, one bakery</h2></div><span class="muted" style="font-size:14px">Same menu at all three. Bread runs out first at Dockside.</span></div>
  <div class="cf-locs sk-rail">${LOCS.map(([k, n, a, f, hrs, open, cls], i) => `<article class="card cf-loc"><div class="sk-photo">${scene(k, i)}</div><div><div class="sk-row" style="justify-content:space-between"><h3 class="sk-h3">${n}</h3><span class="cf-open ${cls}"><i></i>${open}</span></div><p class="muted" style="font-size:14px">${a}<br>${f}</p><dl class="cf-hours">${hrs.map(([d, h]) => `<dt>${d}</dt><dd>${h}</dd>`).join("")}</dl><div class="sk-row"><a class="btn primary" href="#order-ahead">Order here</a><a class="btn" href="#">Directions</a></div></div></article>`).join("")}</div>
</div></section>

<section class="sk-sec sk-tight sk-alt" id="catering"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">Wholesale & catering</span><h2 class="sk-h2">Bread for your shop, pastries for your meeting</h2></div></div>
  <div class="cf-trade">
    <div class="card cf-tcard"><span class="sk-eyebrow">For offices & events</span><h3 class="sk-h3" style="font-size:calc(24px * var(--hs))">Catering boxes</h3><p class="muted">Mixed pastry boxes, sandwich platters and coffee urns, delivered by 8:30 AM. Order by 2 PM the day before.</p>
      <ul>${["Pastry box for 12 from $48", "Coffee urn, 40 cups, from $65 with cups and milk", "Allergen labels on every box (sample: check each bake with your kitchen)"].map((x) => `<li>${ic("check", 16)}<span>${x}</span></li>`).join("")}</ul><a class="btn primary" href="#order-ahead" style="justify-self:start">Plan a catering order</a></div>
    <div class="card cf-tcard"><span class="sk-eyebrow">For cafés & grocers</span><h3 class="sk-h3" style="font-size:calc(24px * var(--hs))">Wholesale bread & beans</h3><p class="muted">Daily loaves and weekly coffee for 30 local cafés and shops. Delivery six days a week within the ring road.</p>
      <ul>${["Minimum order $60 a drop", "Barista training with your first coffee order", "Price list sent within one working day"].map((x) => `<li>${ic("check", 16)}<span>${x}</span></li>`).join("")}</ul><a class="btn" href="#" style="justify-self:start">Request the wholesale list</a></div>
  </div>
</div></section>

<section class="sk-sec sk-tight" id="our-story"><div class="sk-wrap cf-story">
  <div class="sk-stack" style="gap:20px"><span class="sk-eyebrow">Our story</span><h2 class="sk-h2">One oven, a borrowed bike and a lot of butter</h2>
    <p class="muted" style="font-size:17px">We started selling croissants from a market table and still laminate every batch by hand. The coffee came later, when the queue for bread got long enough that people wanted something to hold.</p>
    <div class="sk-row" style="gap:28px;padding-top:8px">${[["4 AM", "first bake"], ["3", "cafés"], ["30", "wholesale partners"]].map(([v, l]) => `<div><div class="num" style="font-size:28px">${v}</div><div class="muted" style="font-size:13px">${l}</div></div>`).join("")}</div></div>
  <ol class="cf-time">${[["2017", "A market table", "Forty croissants on Saturdays, sold out by ten."], ["2019", "Mill Street opens", "The bakery kitchen and our first café, with the oven in full view."], ["2022", "Dockside window", "Takeaway only, for the early shift at the harbour."], ["2025", "Parkside", "Our biggest terrace and the only one with a dog water bowl."], ["Today", "52 people", "Bakers, baristas and two delivery riders, all paid a living wage."]].map(([y, t, d]) => `<li><span class="num">${y}</span><b>${t}</b><p>${d}</p></li>`).join("")}</ol>
</div></section>

<section class="sk-sec sk-tight" id="order-ahead"><div class="sk-wrap"><div class="card cf-order">
  <div class="cf-order-side feat"><span class="sk-eyebrow" style="color:inherit;opacity:.8">Order ahead</span><h2 class="sk-h2">Skip the queue</h2><p>Pay now, pick up from the shelf by the door. We text you when it’s ready.</p>
    <div class="cf-extra" style="display:grid;gap:10px;font-size:14px;opacity:.85">${["Pickup from 6:30 AM", "Catering needs 24 hours notice", "Questions: orders@kilnandcrumb.example"].map((x) => `<span class="sk-row" style="gap:8px">${ic("check", 14)}${x}</span>`).join("")}</div></div>
  <form aria-label="Order ahead or catering request">
    <div class="cf-seg" role="tablist"><span class="on" role="tab" aria-selected="true">Pickup today</span><span role="tab">Catering</span></div>
    <div class="sk-g2"><div class="sk-field"><label for="cf-loc">Café</label><select class="sk-input" id="cf-loc"><option>Mill Street</option><option>Dockside</option><option>Parkside</option></select></div>
      <div class="sk-field"><label for="cf-time">Pickup time</label><select class="sk-input" id="cf-time"><option>8:15 AM</option><option>8:30 AM</option></select></div></div>
    <div class="sk-field"><label for="cf-items">Your order</label><textarea class="sk-input" id="cf-items" style="min-height:72px">2 × flat white (oat), 1 × cardamom knot, 1 × country sourdough</textarea></div>
    <div class="sk-g2"><div class="sk-field"><label for="cf-name">Name</label><input class="sk-input" id="cf-name" value="Lin Park"></div><div class="sk-field"><label for="cf-phone">Mobile for the ready text</label><input class="sk-input" id="cf-phone" value="(555) 017-3308"></div></div>
    <button class="btn primary sk-btn-lg" type="button">Continue to payment · $20.10</button>
  </form>
</div></div></section>
</main>
${K.footer(p, "A bakery-café baking at Mill Street since 2019.", [["Cafés", ["Mill Street", "Dockside", "Parkside"]], ["Order", ["Order ahead", "Catering", "Wholesale", "Gift cards"]], ["Contact", ["hello@kilnandcrumb.example", "(555) 017-2200", "Jobs", "Instagram"]]], "Fictional bakery-café created for this template. Bakes, prices and opening hours are sample content. © 2026 Kiln & Crumb.")}`, CSS);

module.exports = {
  "coffee-shop-website": K.def("cafe", "Coffee shop website",
    "a full bakery-café home page: navigation with an order-ahead button, a centred hero with a pickup-time pill, order-ahead and find-a-café buttons over a wide counter scene and a quick-facts strip, today’s bakes with prices, out-of-the-oven times and stock left, a coffee menu board with two size prices and the current single origin, three locations with open status, hours and directions, wholesale and catering offers, the story as a timeline, an order-ahead / catering form with café, pickup time and order fields, and a footer",
    ["navigation-header", "hero", "order-ahead", "product-cards", "menu", "price-list", "locations", "opening-hours", "catering", "wholesale", "timeline", "story", "order-form", "tabs", "footer", "coffee-shop", "cafe", "bakery"], web),
};
