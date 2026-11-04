/* Restaurant website template (Olive & Ember — fictional wood-fired neighbourhood restaurant). Full responsive home page:
   nav, hero with reservation strip, menu highlights, story, private dining, guest notes, visit + booking form, footer.
   Pilot for the site kit: one HTML document rendered at 1440 (web) and 390 (mobile). Food "photos" are inline SVG in fixed natural tones. */
const { ic, esc } = require("../lib");
const K = require("../sitekit");

const CSS = `<style>
.re-hero{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.1fr);gap:56px;align-items:center;padding-top:72px;padding-bottom:88px}
.re-hero .sk-photo{aspect-ratio:5/4}
.re-strip{display:grid;grid-template-columns:repeat(3,minmax(0,1fr)) auto;gap:12px;align-items:end;padding:18px;margin-top:8px;width:100%}
.re-strip .sk-input{height:44px;display:flex;align-items:center}
.re-hours{display:flex;flex-wrap:wrap;gap:8px 22px;font-size:14px;color:var(--muted)}
.re-hours b{color:var(--text);font-weight:600}
.re-tabs{display:flex;gap:8px;flex-wrap:wrap}
.re-tab{height:38px;padding:0 16px;border-radius:999px;border:1px solid var(--border);display:inline-flex;align-items:center;font-weight:600;font-size:14px}
.re-tab.on{background:var(--text);color:var(--bg);border-color:var(--text)}
.re-menu{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 56px}
.re-dish{display:grid;grid-template-columns:72px minmax(0,1fr) auto;gap:18px;align-items:center;padding:20px 0;border-bottom:1px solid var(--border)}
.re-dish .sk-photo{width:72px;height:72px;border-radius:50%}
.re-dish h3{font-size:calc(19px * var(--hs))}
.re-dish p{color:var(--muted);font-size:14px}
.re-price{font-size:16px}
.re-tags{display:flex;gap:6px;margin-top:6px}
.re-story .sk-photo{aspect-ratio:4/5}
.re-facts{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px;width:100%;padding-top:20px;border-top:1px solid var(--border)}
.re-room .sk-photo{aspect-ratio:16/10;border-radius:var(--radius) var(--radius) 0 0}
.re-room{overflow:hidden;padding:0}
.re-room>div:last-child{padding:22px 24px 24px;display:grid;gap:8px}
.re-note{padding:28px;display:grid;gap:16px;align-content:start}
.re-note q{font-size:calc(19px * var(--hs));font-family:var(--font-h);line-height:1.4;quotes:"\\201C" "\\201D"}
.re-visit{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:0;overflow:hidden;padding:0}
.re-map{min-height:100%;aspect-ratio:auto;border-radius:0}
.re-form{padding:40px;display:grid;gap:16px}
.re-form .sk-g2{gap:14px}
.re-slots{display:flex;flex-wrap:wrap;gap:8px}
.re-slot{height:38px;padding:0 14px;border-radius:var(--radius);border:1px solid var(--border);display:inline-flex;align-items:center;font-weight:600;font-size:14px;background:var(--bg)}
.re-slot.on{background:var(--primary);border-color:var(--primary);color:var(--on-primary)}
.re-slot.off{color:var(--muted);text-decoration:line-through;opacity:.7}
.re-news{display:flex;justify-content:space-between;align-items:center;gap:32px;padding:40px}
.re-news form{display:flex;gap:10px;flex:0 1 460px}
@media (max-width:1024px){.re-menu{gap:0 32px}}
@media (max-width:760px){
  .re-hero{grid-template-columns:minmax(0,1fr);gap:28px;padding-top:24px;padding-bottom:56px}
  .re-hero .sk-photo{order:-1;aspect-ratio:4/3}
  .re-strip{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}
  .re-strip .btn{grid-column:1/-1}
  .re-menu{grid-template-columns:minmax(0,1fr)}
  .re-dish{grid-template-columns:56px minmax(0,1fr) auto;gap:14px}
  .re-dish .sk-photo{width:56px;height:56px}
  .re-story .sk-photo{aspect-ratio:4/3}
  .re-facts{grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
  .re-visit{grid-template-columns:minmax(0,1fr)}
  .re-map{aspect-ratio:4/3}
  .re-form{padding:24px}
  .re-news{flex-direction:column;align-items:stretch;padding:24px}
  .re-news form{flex-direction:column}
}
</style>`;

// ---- illustrative food & room "photos" (fixed natural tones) ---------------------------------------------------
const TONES = { crust: "#c98a4b", char: "#5b3a24", tomato: "#c8442f", basil: "#4f7a3a", cream: "#f1e4c8", plate: "#f4efe6", rim: "#d9d0c1", wood: "#8a5a36", oil: "#d8b24a", beet: "#8e2f4a", citrus: "#e7a93b" };
const plate = (kind, id) => {
  const T = TONES, g = `re-g-${id}`;
  const food = {
    pizza: `<circle cx="100" cy="100" r="64" fill="${T.crust}"/><circle cx="100" cy="100" r="54" fill="${T.tomato}"/>${[[78, 82], [120, 90], [96, 124], [128, 122], [70, 116]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="10" fill="${T.cream}"/>`).join("")}${[[90, 98], [112, 112], [84, 134], [120, 74]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="7" ry="4" fill="${T.basil}" transform="rotate(30 ${x} ${y})"/>`).join("")}${[[60, 96], [138, 104], [100, 42]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4" fill="${T.char}" opacity=".7"/>`).join("")}`,
    burrata: `<circle cx="100" cy="100" r="40" fill="${T.cream}"/><path d="M78 92a24 18 0 0 1 44 0" fill="#fbf6ea"/>${[[52, 78], [150, 84], [140, 132], [62, 134], [100, 152]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${12 + (i % 2) * 3}" fill="${i % 2 ? T.citrus : T.tomato}"/>`).join("")}<path d="M60 110c30 14 52 12 82-6" stroke="${T.oil}" stroke-width="4" fill="none" stroke-linecap="round"/>`,
    beet: `${[[80, 86, 22], [118, 92, 18], [96, 124, 20], [128, 128, 14]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${T.beet}"/>`).join("")}<path d="M58 132c18-30 70-58 96-50" stroke="${T.cream}" stroke-width="10" fill="none" stroke-linecap="round" opacity=".85"/>${[[66, 70], [140, 70], [150, 112]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="9" ry="5" fill="${T.basil}"/>`).join("")}`,
    bread: `<ellipse cx="100" cy="100" rx="62" ry="40" fill="${T.crust}" transform="rotate(-18 100 100)"/>${[-30, -6, 18].map((d) => `<path d="M${88 + d} 76q12 22 0 48" stroke="${T.cream}" stroke-width="5" fill="none" stroke-linecap="round" transform="rotate(-18 100 100)"/>`).join("")}<circle cx="150" cy="146" r="16" fill="${T.oil}"/>`,
    fish: `<path d="M46 104c22-30 74-34 104-6 6-10 16-14 22-14-4 10-4 22 0 32-8 0-16-4-22-14-30 26-84 22-104 2z" fill="#d9a77a"/>${[70, 90, 110, 130].map((x) => `<path d="M${x} 90q6 14 0 28" stroke="${T.char}" stroke-width="3" fill="none" opacity=".55"/>`).join("")}<circle cx="64" cy="140" r="10" fill="${T.citrus}"/><circle cx="64" cy="140" r="6" fill="#f3cf72"/>${[[120, 140], [138, 146], [104, 150]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="8" ry="4" fill="${T.basil}"/>`).join("")}`,
    tart: `<circle cx="100" cy="100" r="52" fill="${T.crust}"/><circle cx="100" cy="100" r="44" fill="${T.citrus}"/>${Array.from({ length: 8 }, (_, i) => `<path d="M100 100L${100 + 44 * Math.cos(i * Math.PI / 4)} ${100 + 44 * Math.sin(i * Math.PI / 4)}" stroke="${T.crust}" stroke-width="2" opacity=".5"/>`).join("")}<ellipse cx="150" cy="148" rx="16" ry="10" fill="${T.cream}"/>`,
  }[kind];
  return `<svg viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${esc(kind)} dish"><defs><radialGradient id="${g}" cx=".4" cy=".35"><stop offset="0" stop-color="#6d4a32"/><stop offset="1" stop-color="#3a271b"/></radialGradient></defs>
<rect width="200" height="200" fill="url(#${g})"/><circle cx="100" cy="100" r="86" fill="${T.rim}"/><circle cx="100" cy="100" r="78" fill="${T.plate}"/>${food}</svg>`;
};
const heroShot = () => `<svg viewBox="0 0 600 480" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Wood-fired pizza on a table beside the oven"><defs>
<radialGradient id="re-fire" cx=".78" cy=".3" r=".6"><stop offset="0" stop-color="#f6b25a"/><stop offset=".4" stop-color="#b0532a"/><stop offset="1" stop-color="#2a1a12"/></radialGradient>
<linearGradient id="re-table" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a4d2e"/><stop offset="1" stop-color="#4b2f1d"/></linearGradient></defs>
<rect width="600" height="480" fill="url(#re-fire)"/><path d="M360 40h240v200H360z" fill="#3a271b" opacity=".35"/><path d="M380 210a110 110 0 0 1 220 0z" fill="#1c120c"/><path d="M412 210a78 78 0 0 1 156 0z" fill="#f08c3a" opacity=".85"/><path d="M440 210c10-40 30-40 44-14 10-30 34-30 44 14z" fill="#ffd27a"/>
<rect y="300" width="600" height="180" fill="url(#re-table)"/>${Array.from({ length: 6 }, (_, i) => `<path d="M0 ${318 + i * 28}h600" stroke="#3f2617" stroke-width="2" opacity=".35"/>`).join("")}
<ellipse cx="250" cy="352" rx="200" ry="70" fill="#2a1a12" opacity=".45"/><ellipse cx="240" cy="330" rx="190" ry="72" fill="${TONES.crust}"/><ellipse cx="240" cy="326" rx="168" ry="60" fill="${TONES.tomato}"/>
${[[170, 310], [250, 300], [320, 330], [210, 352], [290, 360], [150, 340]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="22" ry="12" fill="${TONES.cream}"/>`).join("")}${[[200, 322], [270, 340], [330, 306], [180, 360]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="12" ry="6" fill="${TONES.basil}" transform="rotate(25 ${x} ${y})"/>`).join("")}
<circle cx="520" cy="380" r="34" fill="#e9e2d4"/><circle cx="520" cy="380" r="24" fill="#8e2f4a" opacity=".85"/><rect x="60" y="250" width="30" height="80" rx="6" fill="#a7c4a0" opacity=".55"/></svg>`;
const room = (kind) => kind === "table"
  ? `<svg viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Long chef's table under pendant lights"><rect width="400" height="250" fill="#3b2a20"/><rect y="150" width="400" height="100" fill="#5a3b27"/><rect x="40" y="128" width="320" height="22" rx="4" fill="#9a6a41"/>${[80, 140, 200, 260, 320].map((x) => `<path d="M${x} 0v60" stroke="#1d140e" stroke-width="2"/><path d="M${x - 16} 60h32l-8 14h-16z" fill="#d9a65a"/><ellipse cx="${x}" cy="80" rx="26" ry="10" fill="#f6c36d" opacity=".25"/><rect x="${x - 10}" y="150" width="20" height="40" fill="#2d1f17"/>`).join("")}${[90, 150, 210, 270, 330].map((x) => `<circle cx="${x}" cy="124" r="7" fill="#efe6d6"/>`).join("")}</svg>`
  : kind === "garden"
    ? `<svg viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Courtyard with string lights and olive trees"><rect width="400" height="250" fill="#2f3a2c"/><path d="M0 40q100 40 200 0t200 0" stroke="#1c241a" fill="none"/>${Array.from({ length: 12 }, (_, i) => `<circle cx="${16 + i * 34}" cy="${48 + Math.sin(i) * 8}" r="4" fill="#ffd98a"/>`).join("")}${[60, 330].map((x) => `<rect x="${x - 5}" y="120" width="10" height="80" fill="#5b4330"/><circle cx="${x}" cy="110" r="44" fill="#6f8a55"/><circle cx="${x + 20}" cy="96" r="28" fill="#80995f"/>`).join("")}<rect y="196" width="400" height="54" fill="#8c7a62"/>${[150, 240].map((x) => `<ellipse cx="${x}" cy="196" rx="40" ry="10" fill="#e8dcc6"/><rect x="${x - 4}" y="196" width="8" height="34" fill="#3a2e24"/>`).join("")}</svg>`
    : `<svg viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Pizza class at the dough bench"><rect width="400" height="250" fill="#6b4a33"/><rect y="150" width="400" height="100" fill="#c9b48f"/>${[90, 200, 310].map((x) => `<circle cx="${x}" cy="170" r="34" fill="#f2e6cf"/><circle cx="${x}" cy="60" r="18" fill="#d6a27c"/><path d="M${x - 30} 150q30-70 60 0" fill="#efe9df"/>`).join("")}<circle cx="40" cy="214" r="14" fill="#e9dcc0" opacity=".8"/></svg>`;
const mapShot = () => `<svg viewBox="0 0 600 560" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Map showing the restaurant near Mill Lane and the canal"><rect width="600" height="560" fill="#e9e4d8"/>
<path d="M0 380C120 340 220 420 340 380S520 300 600 330V560H0z" fill="#b9cfd6"/>${[[0, 120, 600, 160], [180, 0, 220, 560], [0, 250, 600, 230], [420, 0, 380, 560]].map(([a, b, c, d]) => `<path d="M${a} ${b}L${c} ${d}" stroke="#ffffff" stroke-width="16"/>`).join("")}
<rect x="40" y="20" width="110" height="80" rx="6" fill="#d7dfc4"/><rect x="250" y="150" width="140" height="70" rx="6" fill="#d9d2c2"/><rect x="450" y="40" width="120" height="70" rx="6" fill="#d7dfc4"/>
<text x="210" y="112" font-family="sans-serif" font-size="14" fill="#6e6658" transform="rotate(-86 210 112)">Mill Lane</text><text x="300" y="470" font-family="sans-serif" font-size="14" fill="#5d7480">Wharf Canal</text>
<g transform="translate(300 236)"><path d="M0 0c-14-18-22-30-22-42a22 22 0 0 1 44 0c0 12-8 24-22 42z" fill="#c8442f"/><circle cx="0" cy="-42" r="8" fill="#fff"/></g></svg>`;

const DISHES = {
  "From the oven": [["pizza", "Ember margherita", "San Marzano tomato, fior di latte, basil, olive oil", "16", ["Vegetarian"]],
    ["bread", "Fire-blistered focaccia", "Rosemary, flaky salt, whipped garlic butter", "8", ["Vegan option"]],
    ["fish", "Whole roasted bream", "Charred lemon, salsa verde, fennel", "29", ["Gluten-free"]]],
  "Small plates": [["burrata", "Burrata & heritage tomatoes", "Smoked chilli oil, grilled sourdough", "14", ["Vegetarian"]],
    ["beet", "Coal-roasted beetroot", "Whipped feta, pickled shallot, dill", "11", ["Vegetarian"]],
    ["tart", "Burnt honey tart", "Crème fraîche, orange zest", "9", []]],
};

const web = (p, st) => K.page(st, `${K.nav(p, ["Menu", "Our story", "Private dining", "Visit"], "Book a table", "Order pickup")}
<main>
<section class="sk-wrap re-hero" id="top">
  <div class="sk-stack" style="gap:22px">
    <span class="sk-eyebrow">Wood-fired kitchen · Mill Lane</span>
    <h1 class="sk-h1">Slow dough, a hot oven and a table for everyone</h1>
    <p class="sk-lede">${esc(p.name)} cooks seasonal plates over oak and olive wood. Long-fermented pizza, vegetables from two farms up the valley, and a short list of natural wines.</p>
    <form class="card re-strip" aria-label="Find a table" id="book-a-table">
      <div class="sk-field"><label>Date</label><div class="sk-input">Fri 13 Nov</div></div>
      <div class="sk-field"><label>Time</label><div class="sk-input">7:30 PM</div></div>
      <div class="sk-field"><label>Guests</label><div class="sk-input">2 people</div></div>
      <button class="btn primary sk-btn-lg" type="button">Find a table</button>
    </form>
    <div class="re-hours"><span><b>Tue–Thu</b> 5–10 PM</span><span><b>Fri–Sat</b> 12–11 PM</span><span><b>Sun</b> 12–8 PM</span><span>Closed Monday</span></div>
  </div>
  <div class="sk-photo">${heroShot()}<span class="sk-cap">Ember margherita, out of the oven in 90 seconds</span></div>
</section>

<section class="sk-sec sk-alt" id="menu"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">This week’s menu</span><h2 class="sk-h2">Cooked over fire, plated simply</h2></div>
    <div class="re-tabs" role="tablist"><span class="re-tab on" role="tab" aria-selected="true">Dinner</span><span class="re-tab" role="tab">Weekend lunch</span><span class="re-tab" role="tab">Drinks</span></div></div>
  <div class="re-menu">${Object.entries(DISHES).map(([grp, ds]) => `<div><h3 class="sk-h3" style="padding-bottom:8px;border-bottom:2px solid var(--text)">${esc(grp)}</h3>${ds.map(([k, n, d, pr, tags], i) => `<div class="re-dish"><div class="sk-photo">${plate(k, grp.length + i)}</div><div><h3>${esc(n)}</h3><p>${esc(d)}</p>${tags.length ? `<div class="re-tags">${tags.map((t) => `<span class="badge">${esc(t)}</span>`).join("")}</div>` : ""}</div><span class="num re-price">$${pr}</span></div>`).join("")}</div>`).join("")}</div>
  <div class="sk-row" style="margin-top:36px"><a class="btn primary sk-btn-lg" href="#">See the full menu</a><span class="muted" style="font-size:14px">Allergies? Tell your server, every dish is made to order.</span></div>
</div></section>

<section class="sk-sec re-story" id="our-story"><div class="sk-wrap sk-split">
  <div class="sk-photo">${room("class")}<span class="sk-cap">Saturday dough class</span></div>
  <div class="sk-stack" style="gap:20px"><span class="sk-eyebrow">Our story</span><h2 class="sk-h2">Started with one oven and a 48-hour dough</h2>
    <p class="muted" style="font-size:17px">Chef Lucía Ferro and Daniel Osei opened in an old bakery on Mill Lane in 2019 and kept the brick oven that came with it. The dough still rests for two days, the menu still changes with what the farms bring on Tuesday.</p>
    <p class="muted" style="font-size:17px">Most of the room is walk-in. We hold a third of the tables for neighbours who just turn up.</p>
    <div class="re-facts">${[["48 h", "dough rest"], ["2", "partner farms"], ["60", "seats inside"]].map(([v, l]) => `<div><div class="num" style="font-size:30px">${v}</div><div class="muted" style="font-size:13px">${l}</div></div>`).join("")}</div>
  </div>
</div></section>

<section class="sk-sec sk-alt" id="private-dining"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">Private dining & events</span><h2 class="sk-h2">Rooms for birthdays, teams and long lunches</h2></div><a class="btn sk-btn-lg" href="#">Send an enquiry ${ic("arrow", 16)}</a></div>
  <div class="sk-g3 sk-rail">${[["table", "The chef’s table", "Up to 12 guests beside the oven, with a set menu cooked in front of you."], ["garden", "The courtyard", "Up to 40 standing under the olive trees, May to September."], ["class", "Dough class", "Two hours at the bench, then lunch. Saturdays, eight places."]].map(([k, t, d]) => `<article class="card re-room"><div class="sk-photo">${room(k)}</div><div><h3 class="sk-h3">${t}</h3><p class="muted">${d}</p></div></article>`).join("")}</div>
</div></section>

<section class="sk-sec"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">Guest notes</span><h2 class="sk-h2">What regulars order</h2></div></div>
  <div class="sk-g3 sk-rail">${[["The focaccia arrives first and disappears first. We book the chef’s table every anniversary now.", "Hana & Joel", "Regulars since 2021"], ["Ask for the bream if it’s on. Staff remembered my nut allergy on the second visit.", "Marcus T.", "Weeknight regular"], ["Took the dough class with my dad. We still argue about whose crust was better.", "Priya N.", "Saturday class"]].map(([q, n, r]) => `<figure class="card re-note"><q>${esc(q)}</q><figcaption class="sk-row" style="gap:10px"><span class="avatar" style="width:36px;height:36px">${n.split(/[ &]+/).map((w) => w[0]).join("").slice(0, 2)}</span><span><b>${esc(n)}</b><br><span class="muted" style="font-size:13px">${esc(r)}</span></span></figcaption></figure>`).join("")}</div>
</div></section>

<section class="sk-sec sk-tight" id="visit"><div class="sk-wrap">
  <div class="card re-visit"><div class="sk-photo re-map">${mapShot()}</div>
  <form class="re-form" aria-label="Reserve a table">
    <span class="sk-eyebrow">Visit</span><h2 class="sk-h2" style="font-size:calc(32px * var(--hs))">14 Mill Lane, by the canal</h2>
    <p class="muted">Five minutes from Wharf Street station. Step-free entrance and an accessible restroom.</p>
    <div class="sk-g2"><div class="sk-field"><label for="re-name">Name</label><input class="sk-input" id="re-name" value="Teodora Ruiz"></div><div class="sk-field"><label for="re-guests">Guests</label><select class="sk-input" id="re-guests"><option>2 people</option><option>4 people</option></select></div></div>
    <div class="sk-field"><label>Friday 13 November</label><div class="re-slots">${[["6:00", "off"], ["6:30", ""], ["7:00", ""], ["7:30", "on"], ["8:00", ""], ["8:45", "off"], ["9:15", ""]].map(([t, c]) => `<span class="re-slot ${c}">${t}</span>`).join("")}</div></div>
    <button class="btn primary sk-btn-lg" type="button">Reserve 7:30 PM for 2</button>
    <p class="muted" style="font-size:13px">Groups of 7+ book through private dining. We hold tables for 15 minutes.</p>
  </form></div>
</div></section>

<section class="sk-sec sk-tight"><div class="sk-wrap"><div class="card re-news"><div class="sk-stack" style="gap:6px"><h2 class="sk-h3" style="font-size:calc(24px * var(--hs))">New menu every season</h2><p class="muted">One email when the menu changes. Four a year, no more.</p></div>
<form><input class="sk-input" placeholder="you@example.com" aria-label="Email address"><button class="btn primary sk-btn-lg" type="button">Subscribe</button></form></div></div></section>
</main>
${K.footer(p, "Wood-fired cooking on Mill Lane since 2019.", [["Visit", ["14 Mill Lane", "Tue–Sun from 5 PM", "Weekend lunch from noon"]], ["Contact", ["(555) 014-2290", "hello@oliveandember.example", "Private dining enquiries"]], ["Follow", ["Instagram", "Newsletter", "Gift cards"]]])}`, CSS);

module.exports = {
  "restaurant-website": K.def("restaurant", "Restaurant website",
    "a full restaurant home page: navigation with book-a-table and pickup, a wood-fired hero with a date/time/guests reservation strip and opening hours, a tabbed menu with dishes, prices and dietary tags, the restaurant story with figures, private dining and events cards, guest notes, a map with address and a time-slot reservation form, a newsletter sign-up and a footer",
    ["navigation-header", "hero", "booking-form", "menu", "tabs", "price-list", "dietary-tags", "story", "event-cards", "testimonials", "map", "time-slots", "newsletter", "footer", "restaurant"], web),
};
