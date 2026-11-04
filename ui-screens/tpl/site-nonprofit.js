/* Nonprofit website template (Commonplate — fictional community food-sharing nonprofit). Full responsive home page:
   nav, hero with "Donate" + "Volunteer" and a photo collage, impact figures band (the org's own figures), programmes,
   how donations are used, volunteer shifts, upcoming events, a story, donation form (amount chips, monthly/one-off), footer
   with a registered-charity placeholder line. "Photos" are inline SVG in fixed natural tones. */
const { ic, esc } = require("../lib");
const K = require("../sitekit");

const CSS = `<style>
.np>.sk-sec{padding:80px 0}
.np-hero{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:64px;align-items:center;padding-top:64px;padding-bottom:80px}
.np-col{position:relative;height:480px}
.np-col .sk-photo{position:absolute}
.np-col .np-a{left:0;top:0;width:72%;height:76%}
.np-col .np-b{right:0;bottom:0;width:52%;height:52%;border:6px solid var(--bg)}
.np-hero h1{font-size:min(calc(56px * var(--hs)),68px)}
.np-tag{position:absolute;left:20px;bottom:calc(24% + 18px);padding:14px 16px;display:grid;gap:2px;max-width:220px;box-shadow:var(--shadow-lg)}
.np-tag .num{font-size:24px}
.np-band{background:var(--text);color:var(--bg);padding:56px 0}
.np-band .np-figs{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:32px}
.np-band .num{font-size:44px;display:block;line-height:1.1}
.np-band p{font-size:14px;color:color-mix(in oklab,var(--bg) 74%,var(--text))}
.np-band .np-src{margin-top:28px;font-size:12px;color:color-mix(in oklab,var(--bg) 62%,var(--text))}
.np-progs{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.1fr);gap:48px;align-items:stretch}
.np-plist{list-style:none;display:grid;gap:0;align-content:start}
.np-plist li{display:grid;grid-template-columns:44px minmax(0,1fr) auto;gap:16px;align-items:start;padding:20px 18px;border-bottom:1px solid var(--border);border-radius:var(--radius)}
.np-plist li.on{background:var(--surface);border:1px solid var(--border)}
.np-plist .np-i{width:44px;height:44px;border-radius:50%;display:grid;place-items:center;background:color-mix(in oklab,var(--primary) 14%,var(--bg));color:color-mix(in oklab,var(--primary) 80%,var(--text))}
.np-plist p{font-size:14px;color:var(--muted)}
.np-feature{padding:0;overflow:hidden;display:grid;grid-template-rows:auto 1fr}
.np-feature .sk-photo{aspect-ratio:16/9;border-radius:0}
.np-feature>div:last-child{padding:24px 28px;display:grid;gap:10px;align-content:start}
.np-use{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);gap:56px;align-items:start}
.np-bar{display:flex;height:56px;border-radius:var(--radius);overflow:hidden;margin:26px 0 22px;border:1px solid var(--border)}
.np-bar span{display:block;height:100%}
.np-legend{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px 28px}
.np-legend div{display:grid;grid-template-columns:14px minmax(0,1fr) auto;gap:10px;align-items:baseline;font-size:14px;padding-bottom:12px;border-bottom:1px solid var(--border)}
.np-legend i{width:14px;height:14px;border-radius:3px;transform:translateY(2px)}
.np-legend .num{font-size:15px}
.np-goes{padding:28px;display:grid;gap:14px}
.np-goes li{display:grid;grid-template-columns:72px minmax(0,1fr);gap:14px;align-items:baseline;padding-top:12px;border-top:1px solid var(--border)}
.np-goes ul{list-style:none;display:grid;gap:12px}
.np-goes .num{font-size:20px}
.np-shifts{display:grid;gap:0;border:1px solid var(--border);border-radius:var(--radius-lg);overflow:hidden;background:var(--bg)}
.np-shift{display:grid;grid-template-columns:120px minmax(0,1.4fr) minmax(0,1fr) 150px auto;gap:20px;align-items:center;padding:18px 24px;border-bottom:1px solid var(--border)}
.np-shift:last-child{border-bottom:0}
.np-shift .np-d b{display:block}
.np-shift .muted{font-size:13px}
.np-spots{display:grid;gap:6px;font-size:13px}
.np-spots>span:last-child{height:6px;border-radius:3px;background:var(--border);overflow:hidden}
.np-spots>span:last-child i{display:block;height:100%;background:var(--primary)}
.np-evs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px}
.np-ev{padding:24px;display:grid;grid-template-columns:64px minmax(0,1fr);gap:18px;align-items:start}
.np-cal{border-radius:var(--radius);background:color-mix(in oklab,var(--primary) 14%,var(--bg));text-align:center;padding:8px 0;color:var(--text)}
.np-cal span{display:block;font-size:11px;letter-spacing:.08em;text-transform:uppercase}
.np-cal b{font-size:24px;line-height:1.1}
.np-ev p{font-size:14px;color:var(--muted)}
.np-story{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.3fr);gap:0;padding:0;overflow:hidden}
.np-story .sk-photo{border-radius:0;min-height:100%}
.np-story>div:last-child{padding:48px;display:grid;gap:20px;align-content:center}
.np-story blockquote{font-family:var(--font-h);font-size:calc(26px * var(--hs));line-height:1.35}
.np-give{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.1fr);gap:56px;align-items:start}
.np-form{padding:36px;display:grid;gap:18px}
.np-seg{display:grid;grid-template-columns:1fr 1fr;padding:4px;border:1px solid var(--border);border-radius:var(--radius);background:var(--surface)}
.np-seg label{height:40px;display:flex;align-items:center;justify-content:center;font-weight:600;font-size:14px;border-radius:calc(var(--radius) - 2px);cursor:pointer}
.np-seg label.on{background:var(--bg);box-shadow:var(--shadow-sm);border:1px solid var(--border)}
.np-seg input,.np-amts input{position:absolute;opacity:0;pointer-events:none}
.np-amts{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}
.np-amts label{height:52px;border:1px solid var(--border);border-radius:var(--radius);display:grid;place-items:center;font-size:17px;background:var(--bg)}
.np-amts label.on{background:var(--primary);border-color:var(--primary);color:var(--on-primary)}
.np-impact{display:flex;gap:10px;align-items:flex-start;padding:12px 14px;border-radius:var(--radius);background:color-mix(in oklab,var(--success) 12%,var(--bg));font-size:14px}
.np-impact>span:first-child{color:color-mix(in oklab,var(--success) 80%,var(--text));flex:0 0 auto}
.np-form .sk-g2{gap:14px}
.np-trust{list-style:none;display:grid;gap:12px;margin-top:22px}
.np-trust li{display:flex;gap:10px;font-size:14px}
@media (max-width:1024px){.np-shift{grid-template-columns:100px minmax(0,1fr) 130px auto}.np-shift>.np-loc{display:none}}
@media (max-width:760px){
  .np>.sk-sec{padding:52px 0}
  .np .sk-rail{scroll-padding-inline:20px}
  .sk-foot li{overflow-wrap:anywhere}
  .np-hero{grid-template-columns:minmax(0,1fr);gap:28px;padding-top:24px;padding-bottom:52px}
  .np-col{order:-1;height:270px}
  .np-col .np-b{display:none}
  .np-col .np-a{width:100%;height:100%}
  .np-tag{left:12px;bottom:12px;padding:10px 12px}
  .np-hero h1{font-size:min(calc(38px * var(--hs)),46px)}
  .np-tag .num{font-size:20px}
  .np-band{padding:40px 0}
  .np-band .np-figs{grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:20px}
  .np-band .num{font-size:30px}
  .np-progs,.np-use,.np-give{grid-template-columns:minmax(0,1fr);gap:24px}
  .np-plist li{grid-template-columns:40px minmax(0,1fr);padding:14px 12px}
  .np-plist li>.badge{display:none}
  .np-plist .np-i{width:40px;height:40px}
  .np-feature{display:none}
  .np-bar{height:40px;margin:18px 0}
  .np-legend{grid-template-columns:minmax(0,1fr);gap:10px}
  .np-goes{padding:22px}
  .np-shift{grid-template-columns:minmax(0,1fr) auto;gap:8px 14px;padding:16px}
  .np-shift>.np-loc,.np-shift>.np-spots{display:none}
  .np-shift .np-d{grid-column:1/-1;display:flex;gap:8px;align-items:baseline}
  .np-shift:nth-child(n+4){display:none}
  .np-evs{display:flex}
  .np-ev{padding:20px;grid-template-columns:54px minmax(0,1fr);gap:14px}
  .np-story{grid-template-columns:minmax(0,1fr)}
  .np-story .sk-photo{aspect-ratio:16/10;min-height:0}
  .np-story>div:last-child{padding:24px}
  .np-story blockquote{font-size:min(calc(20px * var(--hs)),24px)}
  .np-form{padding:22px}
  .np-amts{grid-template-columns:repeat(4,minmax(0,1fr));gap:6px}
  .np-amts label{height:46px;font-size:15px}
  .np-trust{display:none}
}
</style>`;

// ---- illustrative "photos" (fixed natural tones) ----------------------------------------------------------------
const SC = {
  crates: ["Volunteers sorting crates of fresh produce on a long table", `<rect width="600" height="420" fill="#e8e0d0"/><rect y="250" width="600" height="170" fill="#b08c66"/><rect x="0" y="232" width="600" height="22" fill="#8a6748"/>${[[40, "#d9603b"], [170, "#7da04f"], [300, "#e7b23d"], [430, "#c9472f"]].map(([x, c]) => `<rect x="${x}" y="170" width="120" height="66" fill="#c9a27a"/><path d="M${x} 190h120M${x} 210h120" stroke="#a5805a" stroke-width="3"/>${[0, 1, 2, 3, 4].map((i) => `<circle cx="${x + 14 + i * 23}" cy="166" r="13" fill="${c}"/>`).join("")}`).join("")}${[120, 360].map((x, i) => `<circle cx="${x}" cy="86" r="26" fill="${i ? "#8d5a3b" : "#e3b48e"}"/><path d="M${x - 44} 232c0-60 18-110 44-110s44 50 44 110z" fill="${i ? "#3f6f8a" : "#d1823f"}"/>`).join("")}`],
  kitchen: ["Community kitchen with large pots and a serving hatch", `<rect width="600" height="420" fill="#dfe5e2"/><rect y="270" width="600" height="150" fill="#9aa3a6"/><rect x="40" y="200" width="520" height="74" fill="#c7ccce"/>${[110, 260, 410].map((x) => `<rect x="${x}" y="140" width="100" height="64" rx="6" fill="#7c858a"/><rect x="${x - 6}" y="134" width="112" height="12" rx="4" fill="#5d666b"/><path d="M${x + 30} 120q10-20 0-34M${x + 60} 120q10-20 0-34" stroke="#ffffff" stroke-width="4" fill="none" opacity=".7"/>`).join("")}<rect x="60" y="30" width="200" height="70" fill="#f3e7c9"/><rect x="340" y="30" width="200" height="70" fill="#f3e7c9"/>`],
  van: ["A delivery van being loaded with food boxes", `<rect width="600" height="420" fill="#cfe0e8"/><rect y="300" width="600" height="120" fill="#8f9396"/><rect x="120" y="150" width="300" height="150" rx="10" fill="#f2f0ea"/><path d="M420 190h70l50 50v60H420z" fill="#e4e1d8"/><rect x="440" y="200" width="44" height="34" fill="#9dc0cf"/><circle cx="190" cy="304" r="28" fill="#2c2f31"/><circle cx="470" cy="304" r="28" fill="#2c2f31"/><rect x="150" y="200" width="160" height="14" fill="#6f9a4e"/>${[[40, 250], [40, 214], [76, 250]].map(([x, y]) => `<rect x="${x}" y="${y}" width="34" height="34" fill="#c9a27a"/>`).join("")}`],
  table: ["People sharing a meal at a long community table", `<rect width="600" height="420" fill="#efe3cf"/>${Array.from({ length: 10 }, (_, i) => `<circle cx="${30 + i * 60}" cy="40" r="5" fill="#f3c86a"/>`).join("")}<path d="M0 34q150 24 300 0t300 0" stroke="#7a6a58" fill="none"/>${[90, 200, 310, 420, 530].map((x, i) => `<circle cx="${x}" cy="170" r="24" fill="${["#e3b48e", "#8d5a3b", "#c48b62", "#f0c7a4", "#6b4430"][i]}"/><path d="M${x - 36} 270c0-50 14-76 36-76s36 26 36 76z" fill="${["#b24a3a", "#3f6f8a", "#6f9a4e", "#7a5a9a", "#d1823f"][i]}"/>`).join("")}<rect x="20" y="262" width="560" height="30" fill="#9a6a41"/>${[110, 250, 390, 520].map((x) => `<ellipse cx="${x}" cy="258" rx="34" ry="9" fill="#f6f1e6"/>`).join("")}<rect y="292" width="600" height="128" fill="#c2a581"/>`],
};
const scene = (k) => `<svg viewBox="0 0 600 420" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${esc(SC[k][0])}">${SC[k][1]}</svg>`;
const USE = [["Food buying & rescue", 46, "var(--primary)"], ["Kitchen & meals", 24, "var(--accent)"], ["Delivery & transport", 14, "color-mix(in oklab,var(--primary) 50%,var(--accent))"], ["Volunteer support", 9, "color-mix(in oklab,var(--success) 70%,var(--text))"], ["Running costs", 7, "color-mix(in oklab,var(--muted) 70%,var(--bg))"]];

const web = (p, st) => K.page(st, `${K.nav(p, ["What we do", "Where money goes", "Volunteer", "Events", "Stories"], "Donate", "Volunteer")}
<main class="np">
<section class="sk-wrap np-hero" id="top">
  <div class="sk-stack" style="gap:22px">
    <span class="sk-eyebrow">Community food sharing · since 2017</span>
    <h1 class="sk-h1">Good food shouldn’t go to waste, and nobody should go without it</h1>
    <p class="sk-lede">${esc(p.name)} collects surplus food from shops, farms and bakeries and shares it through pantries, hot meals and home deliveries across the borough.</p>
    <div class="sk-row"><a class="btn primary sk-btn-lg" href="#donate">${ic("heart", 16)} Donate</a><a class="btn sk-btn-lg" href="#volunteer">Volunteer with us</a></div>
    <p class="muted" style="font-size:14px">Need food this week? <a href="#" style="text-decoration:underline">Find your nearest pantry</a>, no referral needed.</p>
  </div>
  <div class="np-col"><div class="sk-photo np-a">${scene("crates")}</div><div class="sk-photo np-b">${scene("table")}</div>
    <div class="card np-tag"><span class="num">1,240</span><span class="muted" style="font-size:13px">meals shared last week</span></div></div>
</section>

<section class="np-band feat" aria-label="Our impact"><div class="sk-wrap">
  <div class="np-figs">${[["412 t", "of surplus food rescued from 86 local donors"], ["58,300", "meals served at our three community kitchens"], ["2,900", "households on our weekly pantry and delivery lists"], ["640", "regular volunteers giving about 1,900 hours a month"]].map(([v, l]) => `<div><span class="num">${v}</span><p>${l}</p></div>`).join("")}</div>
  <p class="np-src">Our own figures for the year to March 2026, from the annual report.</p>
</div></section>

<section class="sk-sec" id="what-we-do"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">What we do</span><h2 class="sk-h2">Four programmes, one kitchen table</h2></div></div>
  <div class="np-progs">
    <ul class="np-plist">${[["cart", "Community pantries", "Three pantries open five days a week. Choose your own groceries, no forms.", "3 sites", "on"], ["users", "Shared meals", "Hot lunches Tuesday to Saturday, cooked by volunteers from rescued food.", "5 days"], ["send", "Home deliveries", "Weekly boxes for people who can’t get out, driven by volunteers.", "410 homes"], ["spark", "Cooking skills", "Six-week courses on cooking well on a budget, with a take-home kit.", "Termly"]].map(([i, t, d, b, c]) => `<li class="${c || ""}"><span class="np-i">${ic(i, 18)}</span><div><h3 class="sk-h3">${t}</h3><p>${d}</p></div><span class="badge">${b}</span></li>`).join("")}</ul>
    <article class="card np-feature"><div class="sk-photo">${scene("kitchen")}<span class="sk-cap">Hollins Road pantry and kitchen</span></div><div><h3 class="sk-h3">Community pantries</h3><p class="muted">Open Monday to Friday, 10 AM to 4 PM at Hollins Road, Mill Street and the Eastfield community centre. Anyone can come. We ask for a first name so we can learn what people need.</p><a class="btn" style="justify-self:start" href="#">Pantry times and addresses ${ic("arrow", 14)}</a></div></article>
  </div>
</div></section>

<section class="sk-sec sk-alt" id="where-money-goes"><div class="sk-wrap np-use">
  <div><span class="sk-eyebrow">Where money goes</span><h2 class="sk-h2" style="margin-top:12px">How every $1 you give is used</h2>
    <div class="np-bar" role="img" aria-label="Spending breakdown bar">${USE.map(([, v, c]) => `<span style="width:${v}%;background:${c}"></span>`).join("")}</div>
    <div class="np-legend">${USE.map(([t, v, c]) => `<div><i style="background:${c}"></i><span>${t}</span><span class="num">${v}¢</span></div>`).join("")}</div></div>
  <aside class="card np-goes"><h3 class="sk-h3">What a gift can do</h3><ul>${[["$15", "Buys fresh milk and eggs for a pantry morning"], ["$40", "Fuels a delivery round to 18 homes"], ["$120", "Pays for a six-week cooking course place"]].map(([v, t]) => `<li><span class="num">${v}</span><span class="muted">${t}</span></li>`).join("")}</ul><p class="muted" style="font-size:13px">Breakdown from our 2025–26 accounts. Full accounts are on the reports page.</p></aside>
</div></section>

<section class="sk-sec" id="volunteer"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">Volunteer</span><h2 class="sk-h2">Open shifts this week</h2></div><a class="btn sk-btn-lg" href="#">See all 34 shifts ${ic("arrow", 16)}</a></div>
  <div class="np-shifts">${[["Mon 9 Nov", "7:30–10:00", "Morning food collection", "Drive or ride along to 6 donor shops", "Depot, Canal Yard", 3, 8], ["Tue 10 Nov", "10:00–14:00", "Kitchen crew", "Prep and cook the community lunch", "Hollins Road", 2, 6], ["Wed 11 Nov", "13:00–16:00", "Pantry host", "Welcome visitors and restock shelves", "Mill Street", 4, 5], ["Thu 12 Nov", "17:30–20:00", "Sorting evening", "Sort tomorrow’s produce into boxes", "Depot, Canal Yard", 7, 12], ["Sat 14 Nov", "9:00–12:00", "Delivery driver", "Drop weekly boxes to 18 homes, car needed", "Eastfield", 1, 4]].map(([d, t, r, desc, loc, left, of]) => `<div class="np-shift"><div class="np-d"><b>${d}</b><span class="muted">${t}</span></div><div><b>${r}</b><div class="muted">${desc}</div></div><div class="np-loc muted">${ic("pin", 14)} ${loc}</div><div class="np-spots"><span>${left} of ${of} spots left</span><span><i style="width:${Math.round(100 - left / of * 100)}%"></i></span></div><a class="btn" href="#">Sign up</a></div>`).join("")}</div>
</div></section>

<section class="sk-sec sk-alt" id="events"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">Events</span><h2 class="sk-h2">Come along</h2></div><a class="btn sk-btn-lg" href="#">All events</a></div>
  <div class="np-evs sk-rail">${[["Nov", "15", "Harvest soup lunch", "Hollins Road · 12–3 PM. Pay what you can, all proceeds to the kitchens."], ["Nov", "28", "Volunteer welcome evening", "Canal Yard depot · 6 PM. A tour, a safety talk and dinner."], ["Dec", "12", "Winter food drive", "Six collection points across the borough · 10 AM–4 PM."]].map(([m, d, t, s]) => `<article class="card np-ev"><div class="np-cal"><span>${m}</span><b class="num">${d}</b></div><div><h3 class="sk-h3">${t}</h3><p>${s}</p></div></article>`).join("")}</div>
</div></section>

<section class="sk-sec" id="stories"><div class="sk-wrap"><div class="card np-story">
  <div class="sk-photo">${scene("table")}</div>
  <div><span class="sk-eyebrow">Stories</span><blockquote>“I came for the pantry after my hours were cut. Now I run the Thursday sorting evening. It’s the same food either way, it just feels like ours.”</blockquote>
    <div class="sk-row" style="gap:12px"><span class="avatar" style="width:40px;height:40px">DA</span><span><b>Delia A.</b><br><span class="muted" style="font-size:13px">Volunteer shift lead, Eastfield</span></span></div>
    <a class="btn" style="justify-self:start" href="#">Read more stories ${ic("arrow", 14)}</a></div>
</div></div></section>

<section class="sk-sec sk-alt" id="donate"><div class="sk-wrap np-give">
  <div><span class="sk-eyebrow">Donate</span><h2 class="sk-h2" style="margin:12px 0 14px">Keep the kitchens cooking this winter</h2>
    <p class="muted" style="font-size:17px">Monthly gifts let us plan ahead: buying in bulk, booking vans and keeping pantries open on the same days every week.</p>
    <ul class="np-trust">${[["lock", "Secure payment, card or bank transfer"], ["refresh", "Change or cancel a monthly gift any time"], ["doc", "A receipt for your records, emailed straight away"]].map(([i, t]) => `<li>${ic(i, 16)}<span>${t}</span></li>`).join("")}</ul></div>
  <form class="card np-form" aria-label="Make a donation">
    <div class="np-seg" role="radiogroup" aria-label="Frequency"><label class="on"><input type="radio" name="np-f" checked>Monthly</label><label><input type="radio" name="np-f">One-off</label></div>
    <div class="sk-field"><span style="font-weight:500;font-size:13px">Amount</span><div class="np-amts">${[["$10", ""], ["$25", "on"], ["$50", ""], ["$100", ""]].map(([a, c]) => `<label class="num ${c}"><input type="radio" name="np-a"${c ? " checked" : ""}>${a}</label>`).join("")}</div></div>
    <div class="sk-field"><label for="np-other">Other amount</label><input class="sk-input" id="np-other" placeholder="$ Enter an amount"></div>
    <div class="np-impact"><span>${ic("check", 16)}</span><span>$25 a month covers fresh fruit for a pantry morning, every month.</span></div>
    <div class="sk-g2"><div class="sk-field"><label for="np-name">Full name</label><input class="sk-input" id="np-name" value="Jonah Weiss"></div><div class="sk-field"><label for="np-email">Email</label><input class="sk-input" id="np-email" value="jonah@mail.example"></div></div>
    <button class="btn primary sk-btn-lg" type="button">${ic("heart", 16)} Give $25 monthly</button>
  </form>
</div></section>
</main>
${K.footer(p, "Rescuing surplus food and sharing it with neighbours, since 2017.", [["Find food", ["Pantry times", "Shared meals", "Request a delivery"]], ["Get involved", ["Volunteer", "Donate food", "Corporate partners"]], ["Contact", ["Canal Yard, Unit 7", "(555) 019-3300", "hello@commonplate.example"]]], `© 2026 ${p.name}. Registered charity no. 0000000 (placeholder).`)}`, CSS);

module.exports = {
  "nonprofit-website": K.def("nonprofit", "Nonprofit website",
    "a full nonprofit home page: navigation with donate and volunteer buttons, a hero with a photo collage and a meals-shared figure, an impact figures band stated as the organisation’s own figures, four programmes beside a featured programme card, a how-donations-are-used breakdown bar with legend and gift examples, a volunteer shift list with spots left, upcoming event cards, a volunteer story, a donation form with monthly/one-off toggle and amount chips, and a footer with a registered-charity placeholder line",
    ["navigation-header", "hero", "stats", "impact", "features-list", "cards", "breakdown-chart", "volunteer-shifts", "list", "events", "testimonial", "donation-form", "segmented-control", "amount-chips", "footer", "nonprofit", "charity"], web),
};
