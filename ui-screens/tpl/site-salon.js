/* Hair & beauty salon website template (salon family: Studio Velour). Full responsive home page:
   nav with book button, asymmetric hero with next-available card, services & price list by category with durations,
   stylists with levels and from-prices, looks gallery mosaic, first-visit / consultation steps + patch-test facts,
   booking widget (service, stylist, date strip, time slots, summary), client reviews, footer.
   "Photos" are inline SVG portraits and salon scenes in fixed natural tones. */
const { ic, esc } = require("../lib");
const K = require("../sitekit");

const CSS = `<style>
.sv-hero{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,.85fr);gap:64px;align-items:end;padding-top:48px;padding-bottom:64px}
.sv-hero-copy{display:grid;gap:22px;justify-items:start;padding-bottom:24px}
.sv-hero-copy .sk-h1{font-size:calc(58px * var(--hs));line-height:1.02}
.sv-hero-art{position:relative}
.sv-hero-art .sk-photo{aspect-ratio:4/5}
.sv-next{position:absolute;left:-48px;bottom:32px;width:270px;padding:18px 20px;display:grid;gap:8px;box-shadow:var(--shadow-lg)}
.sv-next .sk-row{justify-content:space-between}
.sv-dot{width:8px;height:8px;border-radius:50%;background:var(--success);display:inline-block;margin-right:6px}
.sv-trust{display:flex;flex-wrap:wrap;gap:10px 28px;font-size:14px;color:var(--muted)}
.sv-trust b{color:var(--text)}
.sv-cats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:0;border:1px solid var(--border);border-radius:var(--radius-lg);overflow:hidden;background:var(--bg)}
.sv-cat{padding:24px 30px;display:grid;gap:4px;align-content:start}
.sv-cat+.sv-cat{border-left:1px solid var(--border)}
.sv-cat h3{display:flex;align-items:center;gap:10px;margin-bottom:10px}
.sv-cat h3 .sv-ico{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:color-mix(in oklab,var(--primary) 14%,var(--surface))}
.sv-svc{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:0 14px;padding:9px 0;border-bottom:1px solid var(--border)}
.sv-svc:last-child{border-bottom:0}
.sv-svc b{font-weight:600}
.sv-svc span{font-size:13px;color:var(--muted)}
.sv-svc .num{font-size:15px;text-align:right}
.sv-note{margin-top:20px;font-size:14px;color:var(--muted)}
.sv-team{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:24px}
.sv-pro{display:grid;gap:8px;align-content:start}
.sv-pro .sk-photo{aspect-ratio:4/5;border-radius:var(--radius-lg)}
.sv-pro .sk-row{justify-content:space-between}
.sv-pro p{font-size:14px;color:var(--muted)}
.sv-lvl{display:flex;gap:4px}
.sv-lvl i{width:18px;height:4px;border-radius:2px;background:color-mix(in oklab,var(--text) 14%,transparent);display:block}
.sv-lvl i.on{background:var(--text)}
.sv-looks{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));grid-template-rows:190px 190px;gap:16px}
.sv-looks .sk-photo{border-radius:var(--radius)}
.sv-looks .sk-photo:first-child{grid-row:span 2}
.sv-looks .sk-photo:nth-child(2){grid-column:span 2}
.sv-visit{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:56px;align-items:start}
.sv-steps{list-style:none;display:grid;gap:10px;counter-reset:sv}
.sv-steps li{display:grid;grid-template-columns:44px minmax(0,1fr);gap:16px;align-items:start;padding:14px 18px;counter-increment:sv}
.sv-steps li::before{content:counter(sv);width:44px;height:44px;border-radius:50%;display:grid;place-items:center;background:var(--text);color:var(--bg);font:600 16px var(--font-b)}
.sv-steps p{font-size:14px;color:var(--muted)}
.sv-faq{display:grid;gap:0;border-top:1px solid var(--border)}
.sv-faq details{border-bottom:1px solid var(--border);padding:16px 0}
.sv-faq summary{list-style:none;display:flex;justify-content:space-between;gap:16px;font-weight:600;cursor:pointer}
.sv-faq summary::-webkit-details-marker{display:none}
.sv-faq p{margin-top:10px;font-size:14px;color:var(--muted)}
.sv-book{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(0,1fr);gap:0;padding:0;overflow:hidden}
.sv-book form{padding:40px;display:grid;gap:20px}
.sv-book .sk-g2{gap:14px}
.sv-days{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:8px}
.sv-day{display:grid;justify-items:center;gap:2px;padding:10px 0;border:1px solid var(--border);border-radius:var(--radius);font-size:12px;color:var(--muted);background:var(--bg)}
.sv-day b{font:600 17px var(--font-b);color:var(--text)}
.sv-day.on{background:var(--text);border-color:var(--text);color:var(--bg)}
.sv-day.on b{color:var(--bg)}
.sv-day.off{opacity:.45}
.sv-slots{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px}
.sv-slot{height:40px;border-radius:var(--radius);border:1px solid var(--border);display:grid;place-items:center;font-weight:600;font-size:14px;background:var(--bg)}
.sv-slot.on{background:var(--primary);border-color:var(--primary);color:var(--on-primary)}
.sv-slot.off{color:var(--muted);text-decoration:line-through;opacity:.6}
.sv-sum{padding:40px;display:grid;gap:14px;align-content:start;background:var(--surface);border-left:1px solid var(--border)}
.sv-sum dl{display:grid;grid-template-columns:auto 1fr;gap:10px 16px;font-size:14px}
.sv-sum dt{color:var(--muted)}
.sv-sum dd{text-align:right;font-weight:600}
.sv-total{display:flex;justify-content:space-between;align-items:baseline;padding-top:14px;border-top:1px solid var(--border)}
.sv-revs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px}
.sv-rev{padding:26px;display:grid;gap:14px;align-content:start}
.sv-rev q{quotes:"\\201C" "\\201D";font-family:var(--font-h);font-size:calc(18px * var(--hs));line-height:1.45}
.sv-rev .sv-tag{font-size:13px;color:var(--muted)}
@media (max-width:1024px){
  .sv-team{grid-template-columns:repeat(2,minmax(0,1fr))}
  .sv-next{left:-24px}
}
@media (max-width:760px){
  .sv-hero{grid-template-columns:minmax(0,1fr);gap:24px;padding-top:24px;padding-bottom:52px}
  .sv-hero-copy{padding-bottom:0;gap:16px}
  .sv-hero-copy .sk-h1{font-size:calc(42px * var(--hs))}
  .sv-hero-art{order:-1}
  .sv-hero-art .sk-photo{aspect-ratio:5/4}
  .sv-next{position:relative;left:auto;bottom:auto;width:auto;margin:-40px 14px 0;box-shadow:var(--shadow)}
  .sv-cats{grid-template-columns:minmax(0,1fr)}
  .sv-cat{padding:20px 20px 8px}
  .sv-cat+.sv-cat{border-left:0;border-top:1px solid var(--border)}
  .sv-cat .sv-svc:nth-child(n+5){display:none}
  .sv-team{grid-template-columns:none}
  .sv-team>*{flex-basis:62%!important}
  .sv-team,.sv-revs{scroll-padding-inline:20px}
  .sv-looks{grid-template-columns:repeat(2,minmax(0,1fr));grid-template-rows:150px 150px 150px;gap:10px}
  .sv-looks .sk-photo:nth-child(2){grid-column:span 1}
  .sv-looks .sk-photo:nth-child(n+6){display:none}
  .sv-visit{grid-template-columns:minmax(0,1fr);gap:28px}
  .sv-steps li{grid-template-columns:36px minmax(0,1fr);padding:14px 16px;gap:12px}
  .sv-steps li::before{width:36px;height:36px;font-size:14px}
  .sv-book{grid-template-columns:minmax(0,1fr)}
  .sv-book form{padding:22px}
  .sv-days{grid-template-columns:repeat(7,minmax(0,1fr));gap:4px}
  .sv-day{padding:8px 0;font-size:11px}
  .sv-day b{font-size:15px}
  .sv-slots{grid-template-columns:repeat(3,minmax(0,1fr))}
  .sv-slot:nth-child(n+10){display:none}
  .sv-sum{padding:22px;border-left:0;border-top:1px solid var(--border)}
  .sv-revs{grid-template-columns:none}
}
</style>`;

// ---- illustrative portraits & salon scenes (fixed natural tones) ---------------------------------------------------
const SKIN = ["#e9c4a4", "#c98f6b", "#8d5b3e", "#f0d3b8", "#a86f4c"];
const HAIR = { copper: "#b5562e", espresso: "#2e2018", honey: "#c99a55", ash: "#b9b2a6", plum: "#5c2e3f", black: "#1d1a19", rose: "#c98a86" };
const portrait = (id, skin, hair, style, bg, label, wide) => {
  const g = `sv-p-${id}`, h = HAIR[hair];
  const back = { long: `<path d="M50 96c0-60 100-60 100 0v104H50z" fill="${h}"/>`, bob: `<path d="M52 92c0-54 96-54 96 0v52c-10 6-20 8-30 6H82c-10 2-20 0-30-6z" fill="${h}"/>`, curls: `${[[64, 70], [100, 56], [136, 70], [56, 104], [144, 104], [62, 136], [138, 136]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="24" fill="${h}"/>`).join("")}`, crop: ``, bun: `<circle cx="100" cy="40" r="20" fill="${h}"/>` }[style];
  const front = { long: `<path d="M64 82c8-30 64-36 76 4-20-10-50-14-76-4z" fill="${h}"/>`, bob: `<path d="M60 84c10-28 70-30 80 2-24-6-52-8-80-2z" fill="${h}"/>`, curls: `<path d="M66 78c10-22 58-24 70 0-20-6-48-6-70 0z" fill="${h}"/>`, crop: `<path d="M66 80c4-30 64-34 70 0-18-8-48-8-70 0z" fill="${h}"/>`, bun: `<path d="M64 82c8-30 66-32 74 0-22-8-50-8-74 0z" fill="${h}"/>` }[style];
  return `<svg viewBox="${wide ? "-110 0 420 250" : "0 0 200 250"}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${esc(label)}"><defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${bg[0]}"/><stop offset="1" stop-color="${bg[1]}"/></linearGradient></defs>
<rect x="-110" width="420" height="250" fill="url(#${g})"/>${back}<path d="M40 250c4-44 30-62 60-62s56 18 60 62z" fill="${bg[2]}"/><rect x="88" y="150" width="24" height="36" fill="${skin}"/><ellipse cx="100" cy="112" rx="36" ry="44" fill="${skin}"/>${front}
<ellipse cx="86" cy="114" rx="3.5" ry="2.5" fill="#2a1d17"/><ellipse cx="114" cy="114" rx="3.5" ry="2.5" fill="#2a1d17"/><path d="M92 136q8 5 16 0" stroke="#8a4b3e" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`;
};
const heroScene = () => `<svg viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Client with glossy copper waves in front of a round salon mirror"><defs>
<radialGradient id="sv-glow" cx=".5" cy=".38" r=".6"><stop offset="0" stop-color="#f3e2d3"/><stop offset="1" stop-color="#c9a99a"/></radialGradient></defs>
<rect width="400" height="500" fill="url(#sv-glow)"/><circle cx="200" cy="200" r="150" fill="#e8d6c6" stroke="#b8936a" stroke-width="8"/><circle cx="200" cy="200" r="140" fill="#efe3d7" opacity=".7"/>
<rect x="40" y="420" width="320" height="80" fill="#6e4b45"/><rect x="300" y="360" width="60" height="60" rx="8" fill="#d9c0aa"/><rect x="314" y="330" width="12" height="34" rx="4" fill="#3e2b29"/><rect x="332" y="320" width="14" height="44" rx="4" fill="#b98a6e"/>
<path d="M110 220c-10-110 190-110 180 0 6 60-6 130-20 170H130c-14-40-26-110-20-170z" fill="#a94f2a"/>${[0, 1, 2, 3].map((i) => `<path d="M${124 + i * 4} ${240 + i * 36}q22 -16 44 0t44 0t44 0" stroke="#d17a45" stroke-width="5" fill="none" opacity=".7"/>`).join("")}
<path d="M120 500c6-70 40-96 80-96s74 26 80 96z" fill="#2f2a33"/><rect x="184" y="300" width="32" height="56" fill="#e2b896"/><ellipse cx="200" cy="246" rx="52" ry="64" fill="#e2b896"/><path d="M146 214c14-52 96-60 112 4-34-18-74-22-112-4z" fill="#a94f2a"/>
<ellipse cx="180" cy="250" rx="5" ry="3.5" fill="#2a1d17"/><ellipse cx="220" cy="250" rx="5" ry="3.5" fill="#2a1d17"/><path d="M188 284q12 7 24 0" stroke="#8a4b3e" stroke-width="4" fill="none" stroke-linecap="round"/></svg>`;
const look = (id, kind, wide) => {
  const L = {
    balayage: [3, "honey", "long", ["#e6d3c2", "#cbb3a0", "#efe7dc"], "Honey balayage on long layers"],
    bob: [0, "espresso", "bob", ["#d5dcd6", "#b6c2ba", "#3b4a44"], "Sharp chin-length bob"],
    curls: [2, "black", "curls", ["#e9d6c4", "#d2b49a", "#c77b5a"], "Defined natural curls"],
    copper: [4, "copper", "long", ["#dcd2cc", "#bfb0a8", "#5c3a3a"], "Copper gloss refresh"],
    silver: [1, "ash", "crop", ["#d6d9df", "#b5bac4", "#2c2f3a"], "Soft silver pixie"],
    rose: [3, "rose", "bun", ["#efdcd7", "#d8b9b1", "#7a5560"], "Rose-gold updo"],
  }[kind];
  return portrait(`l${id}`, SKIN[L[0]], L[1], L[2], L[3], L[4], wide);
};

const SERVICES = [
  ["edit", "Cut & style", [["Signature cut & blow-dry", "60 min", "from $78"], ["Restyle consultation & cut", "75 min", "from $96"], ["Fringe or neckline tidy", "15 min", "$18"], ["Blow-dry & finish", "45 min", "$52"], ["Children’s cut, under 12", "30 min", "$34"]]],
  ["spark", "Colour", [["Root colour", "90 min", "from $88"], ["Full head highlights", "150 min", "from $168"], ["Hand-painted balayage", "180 min", "from $210"], ["Gloss & tone", "45 min", "$62"], ["Colour correction", "By consultation", "quote"]]],
  ["heart", "Treatments & beauty", [["Bond-repair treatment", "30 min", "$45"], ["Scalp massage & mask", "40 min", "$58"], ["Brow shape & tint", "30 min", "$36"], ["Lash lift & tint", "50 min", "$68"], ["Bridal hair trial", "90 min", "$120"]]],
];
const TEAM = [[1, "espresso", "bob", ["#dfd2c6", "#c7b3a3", "#38302d"], "Noor A.", "Creative director", 4, "Cuts & restyles", "from $110"], [3, "honey", "long", ["#e8dccd", "#d1bda7", "#7a5a4a"], "Celine D.", "Senior colourist", 3, "Balayage & blondes", "from $96"], [2, "black", "curls", ["#e0d6cc", "#c8b8a8", "#4b3b5a"], "Tomás R.", "Stylist", 2, "Curly & textured hair", "from $78"], [0, "plum", "crop", ["#e4d9d3", "#cdbcb2", "#3d4a55"], "Imogen K.", "Junior stylist", 1, "Blow-dries & up-dos", "from $58"]];

const web = (p, st) => K.page(st, `${K.nav(p, ["Services", "Stylists", "Looks", "First visit", "Gift cards"], "Book an appointment")}
<main>
<section class="sk-wrap sv-hero" id="top">
  <div class="sv-hero-copy"><span class="sk-eyebrow">Hair & beauty salon · Linden Square</span>
    <h1 class="sk-h1">Colour, cuts and care that grow out well</h1>
    <p class="sk-lede">${esc(p.name)} is a twelve-chair salon where every appointment starts with a proper consultation. We plan colour around how your hair will look in eight weeks, not just today.</p>
    <div class="sk-row"><a class="btn primary sk-btn-lg" href="#book-an-appointment">Book an appointment</a><a class="btn sk-btn-lg" href="#services">See prices</a></div>
    <div class="sv-trust"><span><b>Tue–Sat</b> 9 AM–8 PM</span><span><b>Sun</b> 10 AM–4 PM</span><span>Free 15-minute colour consultations</span></div>
  </div>
  <div class="sv-hero-art"><div class="sk-photo">${heroScene()}</div>
    <div class="card sv-next"><div class="sk-row"><b><span class="sv-dot"></span>Next available</b><span class="muted" style="font-size:13px">Today</span></div><span style="font-size:14px">Cut & blow-dry with Tomás at <b>4:15 PM</b></span><a class="btn primary block" href="#book-an-appointment">Hold this time</a></div></div>
</section>

<section class="sk-sec sk-tight sk-alt" id="services"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">Services & prices</span><h2 class="sk-h2">Clear prices, honest timings</h2></div><span class="muted" style="font-size:14px;max-width:340px">Prices start at stylist level; senior and director rates are shown at booking.</span></div>
  <div class="sv-cats">${SERVICES.map(([icn, cat, rows]) => `<div class="sv-cat"><h3 class="sk-h3"><span class="sv-ico">${ic(icn, 16)}</span>${cat}</h3>${rows.map(([n, d, pr]) => `<div class="sv-svc"><b>${esc(n)}</b><span class="num">${pr}</span><span>${d}</span></div>`).join("")}</div>`).join("")}</div>
  <p class="sv-note">All colour services need a patch test at least 48 hours before. It takes five minutes and is free.</p>
</div></section>

<section class="sk-sec sk-tight" id="stylists"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">Stylists</span><h2 class="sk-h2">Choose your stylist</h2></div><a class="btn" href="#">Meet the whole team ${ic("arrow", 16)}</a></div>
  <div class="sv-team sk-rail">${TEAM.map(([sk, h, s, bg, n, role, lvl, spec, from], i) => `<article class="sv-pro"><div class="sk-photo">${portrait(`t${i}`, SKIN[sk], h, s, bg, `Portrait of ${n}`)}</div><div class="sk-row"><h3 class="sk-h3">${n}</h3><span class="sv-lvl" aria-label="Level ${lvl} of 4">${[1, 2, 3, 4].map((k) => `<i class="${k <= lvl ? "on" : ""}"></i>`).join("")}</span></div><p><b style="color:var(--text)">${role}</b> · ${spec}</p><p>Cut & style <span class="num" style="color:var(--text)">${from}</span></p></article>`).join("")}</div>
</div></section>

<section class="sk-sec sk-tight sk-alt" id="looks"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">Looks from the chair</span><h2 class="sk-h2">Recent work</h2></div><span class="muted" style="font-size:14px">Shared with each client’s permission.</span></div>
  <div class="sv-looks">${["balayage", "bob", "curls", "copper", "silver", "rose"].map((k, i) => `<div class="sk-photo">${look(i, k, i === 1)}<span class="sk-cap">${{ balayage: "Balayage · Celine", bob: "Bob · Noor", curls: "Curl cut · Tomás", copper: "Gloss · Celine", silver: "Pixie · Noor", rose: "Updo · Imogen" }[k]}</span></div>`).join("")}</div>
</div></section>

<section class="sk-sec sk-tight" id="first-visit"><div class="sk-wrap sv-visit">
  <div class="sk-stack" style="gap:20px"><span class="sk-eyebrow">Your first visit</span><h2 class="sk-h2">What to expect</h2>
    <ol class="sv-steps" style="width:100%">${[["Consultation", "15 minutes with your stylist to talk about routine, history and the look you want. Photos help."], ["Patch & strand test", "For colour, we test 48 hours ahead so there are no surprises on the day."], ["Your appointment", "Wash, service and finish, with the products we used written down for you."], ["Two-week check-in", "Not quite right? Come back within 14 days and we adjust it at no charge."]].map(([t, d]) => `<li class="card"><div><b>${t}</b><p>${d}</p></div></li>`).join("")}</ol></div>
  <div class="sk-stack" style="gap:18px"><h3 class="sk-h3" style="font-size:calc(24px * var(--hs))">Good to know</h3>
    <div class="sv-faq" style="width:100%">${[["How far ahead should I book?", "Weekday daytime slots are usually free within a week. Saturdays fill about three weeks out.", true], ["What is your cancellation policy?", "Free up to 24 hours before. Later than that, we charge 50% of the service.", false], ["Do you work with textured and curly hair?", "Yes, Tomás and Noor specialise in dry curl cuts and coil definition.", false], ["Is the salon accessible?", "Step-free entrance, a height-adjustable wash basin and an accessible restroom.", false]].map(([q, a, o]) => `<details${o ? " open" : ""}><summary>${q}${ic("chevdown", 16)}</summary><p>${a}</p></details>`).join("")}</div></div>
</div></section>

<section class="sk-sec sk-tight sk-alt" id="book-an-appointment"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">Online booking</span><h2 class="sk-h2">Book an appointment</h2></div><span class="muted" style="font-size:14px">Or call (555) 016-4420</span></div>
  <div class="card sv-book">
    <form aria-label="Book an appointment">
      <div class="sk-g2"><div class="sk-field"><label for="sv-svc">Service</label><select class="sk-input" id="sv-svc"><option>Hand-painted balayage · 180 min</option><option>Signature cut & blow-dry</option></select></div>
        <div class="sk-field"><label for="sv-pro">Stylist</label><select class="sk-input" id="sv-pro"><option>Celine D. · Senior colourist</option><option>Any available stylist</option></select></div></div>
      <div class="sk-field"><label>November 2026</label><div class="sv-days">${[["Mon", "16", "off"], ["Tue", "17", ""], ["Wed", "18", "on"], ["Thu", "19", ""], ["Fri", "20", ""], ["Sat", "21", "off"], ["Sun", "22", ""]].map(([d, n, c]) => `<span class="sv-day ${c}">${d}<b>${n}</b></span>`).join("")}</div></div>
      <div class="sk-field"><label>Wednesday 18 November · Celine D.</label><div class="sv-slots">${[["9:00", "off"], ["10:30", ""], ["11:15", "on"], ["12:00", "off"], ["1:30", ""], ["2:15", ""], ["3:00", "off"], ["4:30", ""], ["5:15", ""], ["6:00", ""]].map(([t, c]) => `<span class="sv-slot ${c}">${t}</span>`).join("")}</div></div>
      <div class="sk-field"><label for="sv-notes">Anything we should know?</label><input class="sk-input" id="sv-notes" value="Box dye on the ends last spring, want it softer and lighter"></div>
    </form>
    <aside class="sv-sum"><span class="sk-eyebrow">Your booking</span><h3 class="sk-h3">Hand-painted balayage</h3>
      <dl><dt>Stylist</dt><dd>Celine D.</dd><dt>When</dt><dd>Wed 18 Nov, 11:15 AM</dd><dt>Length</dt><dd>About 3 hours</dd><dt>Patch test</dt><dd>Mon 16 Nov or earlier</dd></dl>
      <div class="sv-total"><span class="muted">From</span><span class="num" style="font-size:28px">$240</span></div>
      <button class="btn primary sk-btn-lg block" type="button">Confirm booking</button>
      <p class="muted" style="font-size:13px">No deposit for appointments under $300. Free changes up to 24 hours before.</p></aside>
  </div>
</div></section>

<section class="sk-sec sk-tight"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">Client notes</span><h2 class="sk-h2">From the chair</h2></div><span class="muted" style="font-size:14px">4.9 average from 1,380 reviews after each appointment</span></div>
  <div class="sv-revs sk-rail">${[["Celine talked me out of going platinum in one go. Three sessions later it’s exactly what I wanted and my hair still feels like hair.", "Abena O.", "Balayage with Celine"], ["First salon where someone cut my curls dry and actually knew what they were doing. Booked my next one before I left.", "Jonah W.", "Curl cut with Tomás"], ["Booked a blow-dry before a wedding at 9 AM on a Saturday. On time, calm, and it lasted the whole night.", "Freya L.", "Blow-dry with Imogen"]].map(([q, n, t]) => `<figure class="card sv-rev"><span>${ic("star", 14).repeat(5)}</span><q>${esc(q)}</q><figcaption><b>${n}</b><br><span class="sv-tag">${t}</span></figcaption></figure>`).join("")}</div>
</div></section>
</main>
${K.footer(p, "A hair and beauty salon on Linden Square, open six days a week.", [["Visit", ["9 Linden Square, first floor", "Tue–Sat 9 AM–8 PM", "Sun 10 AM–4 PM"]], ["Salon", ["Services & prices", "Stylists", "Gift cards", "Careers"]], ["Contact", ["(555) 016-4420", "hello@studiovelour.example", "Instagram"]]])}`, CSS);

module.exports = {
  "salon-website": K.def("salon", "Salon website",
    "a full hair and beauty salon home page: navigation with a book-an-appointment button, a hero with opening hours, a consultation note and a next-available appointment card over a portrait, a services and price list in three categories (cut & style, colour, treatments & beauty) with durations and from-prices, stylists with portraits, experience levels, specialities and from-prices, a looks gallery mosaic, first-visit steps with an FAQ accordion, an online booking widget with service and stylist selects, a date strip, time slots and a booking summary, client reviews and a footer",
    ["navigation-header", "hero", "price-list", "services", "team", "levels", "gallery", "steps", "faq", "accordion", "booking-form", "date-picker", "time-slots", "summary", "testimonials", "footer", "salon", "hair-salon", "beauty"], web),
};
