/* Gym website template (Ironyard Gym — fictional strength and conditioning gym with classes and coaching). Full responsive home page:
   nav, hero with "Book a free trial class" and a training-floor banner with facts, weekly class timetable grid, membership options,
   coaches, facility zones, a four-week beginner path, member notes, trial booking form, footer.
   No body-transformation or results claims. Gym "photos" are inline SVG in fixed natural tones. */
const { ic, esc } = require("../lib");
const K = require("../sitekit");

const CSS = `<style>
.gy-hero{padding-top:48px;padding-bottom:0}
.gy>.sk-sec{padding:64px 0}
.gy .sk-head{margin-bottom:32px}
.gy-top{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(0,1fr);gap:56px;align-items:end}
.gy-top h1{font-size:min(calc(70px * var(--hs)),80px);line-height:.98;text-transform:uppercase;letter-spacing:-.02em}
.gy-banner{position:relative;margin-top:44px;aspect-ratio:1104/400;border-radius:var(--radius-lg)}
.gy-facts{position:absolute;left:24px;right:24px;bottom:24px;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:0;padding:0;overflow:hidden}
.gy-facts>div{padding:18px 22px;border-right:1px solid var(--border)}
.gy-facts>div:last-child{border-right:0}
.gy-facts .num{font-size:26px;display:block}
.gy-tt{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:10px}
.gy-day{display:grid;gap:8px;align-content:start}
.gy-day>h3{font:700 13px var(--font-b);letter-spacing:.08em;text-transform:uppercase;padding:10px 12px;border-bottom:2px solid var(--text)}
.gy-day>h3 span{font-weight:500;color:var(--muted);letter-spacing:0;text-transform:none;margin-left:6px}
.gy-cls{padding:12px;border-radius:var(--radius);border:1px solid var(--border);background:var(--bg);display:grid;gap:2px;font-size:13px;border-left:4px solid var(--k)}
.gy-cls b{font-size:14px}
.gy-cls .gy-sp{display:flex;justify-content:space-between;color:var(--muted);font-size:12px}
.gy-cls.full{opacity:.62}
.gy-key{display:flex;flex-wrap:wrap;gap:8px 20px;font-size:13px;color:var(--muted);margin-top:22px}
.gy-key span{display:inline-flex;align-items:center;gap:8px}
.gy-key i{width:12px;height:12px;border-radius:3px;background:var(--k)}
.gy-plans{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px;align-items:stretch}
.gy-plan{padding:32px;display:grid;gap:18px;align-content:start}
.gy-plan ul{list-style:none;display:grid;gap:10px;font-size:14px}
.gy-plan li{display:flex;gap:10px;align-items:flex-start}
.gy-plan li>span:first-child{flex:0 0 auto;padding-top:2px}
.gy-plan .gy-price{display:flex;align-items:baseline;gap:6px}
.gy-plan.feat{background:var(--text);color:var(--bg);border-color:var(--text)}
.gy-plan.feat .muted{color:color-mix(in oklab,var(--bg) 72%,var(--text))}
.gy-coaches{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:20px}
.gy-coach{padding:0;overflow:hidden;display:grid}
.gy-coach .sk-photo{aspect-ratio:4/3;border-radius:0}
.gy-coach>div:last-child{padding:18px 20px 20px;display:grid;gap:6px}
.gy-coach p{font-size:13px}
.gy-zones{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:56px;align-items:center}
.gy-zones .sk-photo{aspect-ratio:4/3}
.gy-zl{list-style:none;display:grid;gap:0;counter-reset:z}
.gy-zl li{display:grid;grid-template-columns:52px minmax(0,1fr) auto;gap:16px;align-items:baseline;padding:12px 0;border-bottom:1px solid var(--border)}
.gy-zl li:first-child{border-top:1px solid var(--border)}
.gy-zl .num{font-size:14px;color:var(--muted)}
.gy-zl p{font-size:14px;color:var(--muted)}
.gy-path{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:0;border:1px solid var(--border);border-radius:var(--radius-lg);overflow:hidden;background:var(--bg)}
.gy-wk{padding:26px;border-right:1px solid var(--border);display:grid;gap:10px;align-content:start}
.gy-wk:last-child{border-right:0}
.gy-wk .badge{justify-self:start}
.gy-notes{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr) minmax(0,1fr);gap:24px}
.gy-note{padding:26px;display:grid;gap:14px;align-content:space-between}
.gy-note q{quotes:"\\201C" "\\201D";font-family:var(--font-h);font-size:min(calc(18px * var(--hs)),21px);line-height:1.4}
.gy-note.big q{font-size:min(calc(23px * var(--hs)),26px)}
.gy-trial{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.15fr);gap:0;padding:0;overflow:hidden}
.gy-trial>div:first-child{padding:36px;display:grid;gap:18px;align-content:start;background:color-mix(in oklab,var(--primary) 12%,var(--surface))}
.gy-trial form{padding:36px;display:grid;gap:16px}
.gy-trial .sk-g2{gap:14px}
.gy-pick{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
.gy-pick label{padding:10px 12px;border:1px solid var(--border);border-radius:var(--radius);display:grid;gap:2px;font-size:13px;background:var(--bg)}
.gy-pick label b{font-size:14px}
.gy-pick label.on{border-color:var(--primary);box-shadow:inset 0 0 0 1px var(--primary)}
.gy-pick input{position:absolute;opacity:0;pointer-events:none}
.gy-check{list-style:none;display:grid;gap:12px;font-size:14px}
.gy-check li{display:flex;gap:10px}
@media (max-width:1024px){.gy-tt{grid-template-columns:repeat(3,minmax(0,1fr))}.gy-coaches{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:760px){
  .gy>.sk-sec{padding:52px 0}
  .gy .sk-rail,.gy-tt{scroll-padding-inline:20px}
  .sk-foot li{overflow-wrap:anywhere}
  .gy-hero{padding-top:28px}
  .gy-top{grid-template-columns:minmax(0,1fr);gap:18px}
  .gy-top h1{font-size:min(calc(42px * var(--hs)),50px)}
  .gy-banner{aspect-ratio:auto;margin-top:28px;background:none;overflow:visible}
  .gy-banner>svg{aspect-ratio:4/3;height:auto;border-radius:var(--radius-lg)}
  .gy-facts{position:static;grid-template-columns:repeat(2,minmax(0,1fr));margin-top:12px}
  .gy-facts>div{padding:14px 16px;border-bottom:1px solid var(--border)}
  .gy-facts>div:nth-child(2n){border-right:0}
  .gy-facts .num{font-size:22px}
  .gy-tt{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;margin:0 -20px;padding:0 20px 6px;gap:12px;scrollbar-width:none}
  .gy-day{flex:0 0 58%;scroll-snap-align:start}
  .gy-plans{grid-template-columns:minmax(0,1fr);gap:16px}
  .gy-plan{padding:24px;gap:14px}
  .gy-plan.gy-mhide ul{display:none}
  .gy-coach>div:last-child{padding:14px 16px 16px}
  .gy-zones{grid-template-columns:minmax(0,1fr);gap:24px}
  .gy-zones .sk-photo{aspect-ratio:16/10}
  .gy-zl li{grid-template-columns:36px minmax(0,1fr);gap:10px;padding:12px 0}
  .gy-zl li>.badge{display:none}
  .gy-path{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}
  .gy-wk{padding:18px;border-bottom:1px solid var(--border)}
  .gy-wk:nth-child(2n){border-right:0}
  .gy-wk p{font-size:13px}
  .gy-notes{display:flex}
  .gy-note q,.gy-note.big q{font-size:min(calc(17px * var(--hs)),20px)}
  .gy-trial{grid-template-columns:minmax(0,1fr)}
  .gy-trial>div:first-child,.gy-trial form{padding:24px}
  .gy-trial .gy-check{display:none}
  .gy-pick{grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}
  .gy-pick label{padding:8px;font-size:12px}
  .gy-pick label b{font-size:13px}
}
</style>`;

// ---- illustrative training-floor "photos" (fixed natural tones) -------------------------------------------------
const floor = () => `<svg viewBox="0 0 1104 400" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Training floor with squat racks, kettlebells and a rowing machine under warehouse windows"><defs>
<linearGradient id="gy-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a4f52"/><stop offset="1" stop-color="#2f3336"/></linearGradient>
<linearGradient id="gy-light" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3e2b8" stop-opacity=".55"/><stop offset="1" stop-color="#f3e2b8" stop-opacity="0"/></linearGradient></defs>
<rect width="1104" height="400" fill="url(#gy-wall)"/>${[90, 330, 570, 810].map((x) => `<rect x="${x}" y="30" width="200" height="120" fill="#8fa3ad"/><path d="M${x + 100} 30v120M${x} 90h200" stroke="#3a3f42" stroke-width="6"/><path d="M${x - 30} 150h260l60 250H${x - 90}z" fill="url(#gy-light)"/>`).join("")}
<rect y="270" width="1104" height="130" fill="#3b3631"/>${Array.from({ length: 10 }, (_, i) => `<path d="M${i * 120} 270l-60 130" stroke="#2c2824" stroke-width="3"/>`).join("")}
${[180, 420].map((x) => `<rect x="${x}" y="120" width="12" height="160" fill="#1f2224"/><rect x="${x + 110}" y="120" width="12" height="160" fill="#1f2224"/><rect x="${x - 30}" y="176" width="200" height="8" rx="4" fill="#b8bcbe"/><rect x="${x - 40}" y="152" width="18" height="56" rx="4" fill="#202325"/><rect x="${x + 144}" y="152" width="18" height="56" rx="4" fill="#202325"/><rect x="${x - 22}" y="160" width="12" height="40" rx="3" fill="#b0453a"/><rect x="${x + 132}" y="160" width="12" height="40" rx="3" fill="#b0453a"/>`).join("")}
${[680, 720, 760, 800, 840].map((x, i) => `<circle cx="${x}" cy="${292 - i % 2 * 4}" r="${14 + i * 2}" fill="#1c1e20"/><path d="M${x - 8} ${272 - i * 2}a8 8 0 0 1 16 0" stroke="#1c1e20" stroke-width="5" fill="none"/>`).join("")}
<rect x="890" y="276" width="170" height="14" rx="6" fill="#6d4d34"/><circle cx="1040" cy="270" r="26" fill="#25282a"/><rect x="930" y="256" width="40" height="20" rx="4" fill="#25282a"/></svg>`;
const coach = (id, skin, hair, top) => `<svg viewBox="0 0 240 240" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Portrait of a coach in training kit"><defs><linearGradient id="gy-c${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5a6064"/><stop offset="1" stop-color="#3a3e41"/></linearGradient></defs>
<rect width="240" height="240" fill="url(#gy-c${id})"/><path d="M28 240c6-60 46-84 92-84s86 24 92 84z" fill="${top}"/><rect x="104" y="130" width="32" height="34" fill="${skin}"/><ellipse cx="120" cy="104" rx="40" ry="46" fill="${skin}"/><path d="M80 98c0-34 18-52 40-52s42 16 40 52c-8-18-24-24-40-24s-32 6-40 24z" fill="${hair}"/></svg>`;
const zoneShot = () => `<svg viewBox="0 0 500 400" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Turf sled track beside a row of lifting platforms"><rect width="500" height="400" fill="#3f4447"/><rect y="230" width="500" height="170" fill="#4f7a45"/>${[0, 1, 2, 3, 4].map((i) => `<path d="M0 ${250 + i * 34}h500" stroke="#f4f1e8" stroke-width="3" opacity=".7"/>`).join("")}<path d="M120 300h90l14-30h-118z" fill="#2a2d2f"/><rect x="140" y="254" width="10" height="20" fill="#9a9fa2"/><rect x="180" y="254" width="10" height="20" fill="#9a9fa2"/>
${[300, 400].map((x) => `<rect x="${x - 40}" y="180" width="90" height="56" fill="#8a6a4a"/><rect x="${x - 30}" y="188" width="70" height="40" fill="#a17c56"/>`).join("")}<rect x="40" y="40" width="160" height="110" fill="#8fa3ad"/><path d="M120 40v110M40 95h160" stroke="#2f3336" stroke-width="6"/><rect x="290" y="70" width="170" height="70" rx="4" fill="#2a2d2f"/><text x="304" y="112" font-family="sans-serif" font-size="22" font-weight="700" fill="#e9e3d3">ZONE 2</text></svg>`;

const DAYS = [["Mon", "9 Nov", [["6:15", "Strength foundations", "Lift", "4 left"], ["12:10", "Lunch conditioning", "Cond", "Full"], ["18:30", "Barbell club", "Lift", "6 left"]]],
  ["Tue", "10 Nov", [["6:15", "Engine intervals", "Cond", "3 left"], ["17:30", "Mobility & core", "Mob", "9 left"], ["19:00", "Kettlebell complex", "Cond", "5 left"]]],
  ["Wed", "11 Nov", [["6:15", "Strength foundations", "Lift", "2 left"], ["12:10", "Lunch conditioning", "Cond", "7 left"], ["18:30", "Intro to lifting", "Intro", "4 left"]]],
  ["Thu", "12 Nov", [["6:15", "Engine intervals", "Cond", "Full"], ["17:30", "Mobility & core", "Mob", "11 left"], ["19:00", "Barbell club", "Lift", "3 left"]]],
  ["Fri", "13 Nov", [["6:15", "Push / pull", "Lift", "5 left"], ["12:10", "Lunch conditioning", "Cond", "8 left"], ["17:30", "Open gym hour", "Mob", "Drop in"]]],
  ["Sat", "14 Nov", [["8:00", "Team sled day", "Cond", "6 left"], ["9:30", "Intro to lifting", "Intro", "Full"], ["11:00", "Mobility & core", "Mob", "12 left"]]]];
const KIND = { Lift: "var(--primary)", Cond: "var(--accent)", Mob: "color-mix(in oklab,var(--success) 70%,var(--text))", Intro: "color-mix(in oklab,var(--warning) 80%,var(--text))" };

const web = (p, st) => K.page(st, `${K.nav(p, ["Timetable", "Membership", "Coaches", "The gym", "Start here"], "Book a free trial class", "Member log in")}
<main class="gy">
<section class="sk-wrap gy-hero" id="top">
  <div class="gy-top">
    <div class="sk-stack" style="gap:18px"><span class="sk-eyebrow">Strength & conditioning · Foundry Street</span><h1>Train with a plan, a coach and a crew</h1></div>
    <div class="sk-stack" style="gap:20px"><p class="sk-lede">${esc(p.name)} runs coached classes every day, open gym from 5:30 AM, and a four-week start for people who’ve never touched a barbell.</p>
      <div class="sk-row"><a class="btn primary sk-btn-lg" href="#book-a-free-trial-class">Book a free trial class</a><a class="btn sk-btn-lg" href="#timetable">See the timetable</a></div></div>
  </div>
  <div class="sk-photo gy-banner">${floor()}
    <div class="card gy-facts">${[["42", "coached classes a week"], ["5:30 AM", "open gym, every weekday"], ["14", "max per class"], ["1,100 m²", "training floor and turf"]].map(([v, l]) => `<div><span class="num">${v}</span><span class="muted" style="font-size:13px">${l}</span></div>`).join("")}</div></div>
</section>

<section class="sk-sec" id="timetable"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">This week · 9–14 November</span><h2 class="sk-h2">Class timetable</h2></div><div class="sk-row"><a class="btn" href="#">${ic("calendar", 16)} Add to calendar</a><a class="btn" href="#">Next week ${ic("chevron", 14)}</a></div></div>
  <div class="gy-tt">${DAYS.map(([d, date, cls]) => `<div class="gy-day"><h3>${d}<span>${date}</span></h3>${cls.map(([t, n, k, sp]) => `<div class="gy-cls${sp === "Full" ? " full" : ""}" style="--k:${KIND[k]}"><span class="num" style="font-size:13px">${t}</span><b>${n}</b><span class="gy-sp"><span>${k === "Mob" ? "40 min" : k === "Intro" ? "60 min" : "50 min"}</span><span>${sp}</span></span></div>`).join("")}</div>`).join("")}</div>
  <div class="gy-key">${[["Lift", "Strength & barbell"], ["Cond", "Conditioning"], ["Mob", "Mobility & open"], ["Intro", "Beginner sessions"]].map(([k, l]) => `<span style="--k:${KIND[k]}"><i></i>${l}</span>`).join("")}<span>${ic("clock", 14)} Booking opens 7 days ahead · cancel up to 2 hours before</span></div>
</div></section>

<section class="sk-sec sk-alt" id="membership"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">Membership</span><h2 class="sk-h2">Pick how often you’ll train</h2></div><p class="muted" style="max-width:340px">No joining fee. Pause up to 8 weeks a year. Cancel with 30 days’ notice.</p></div>
  <div class="gy-plans">${[["Open gym", "$49", "Train on your own schedule", ["Open gym 5:30 AM – 10 PM", "Program card refreshed monthly", "One coach check-in per quarter"], "", "Choose open gym"],
    ["Unlimited", "$119", "Classes plus open gym", ["Every class on the timetable", "Open gym 5:30 AM – 10 PM", "Quarterly goal session with a coach", "Bring a friend free once a month"], "feat", "Choose unlimited"],
    ["Coached 1:1", "$260", "Four private sessions a month", ["A plan written around you", "Four 1:1 sessions with your coach", "Open gym included", "Weekly check-in by message"], "gy-mhide", "Book a consult"]].map(([n, pr, sub, items, c, cta]) => `<article class="card gy-plan ${c}"><div><div class="sk-row" style="justify-content:space-between"><h3 class="sk-h3">${n}</h3>${c === "feat" ? `<span class="badge">Most chosen</span>` : ""}</div><p class="muted" style="font-size:14px">${sub}</p></div>
      <div class="gy-price"><span class="num" style="font-size:40px">${pr}</span><span class="muted">/ month</span></div>
      <ul>${items.map((t) => `<li><span>${ic("check", 16)}</span><span>${t}</span></li>`).join("")}</ul><a class="btn ${c === "feat" ? "primary" : ""} block sk-btn-lg" href="#">${cta}</a></article>`).join("")}</div>
</div></section>

<section class="sk-sec" id="coaches"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">Coaches</span><h2 class="sk-h2">Who’ll coach you</h2></div><a class="btn sk-btn-lg" href="#">Meet the full team ${ic("arrow", 16)}</a></div>
  <div class="gy-coaches sk-rail">${[["1", "#c48b62", "#1f1a17", "#b0453a", "Dana Kowalski", "Head coach", "Runs barbell club and writes the monthly program."], ["2", "#8d5a3b", "#151210", "#2f5d7a", "Elijah Mensah", "Conditioning", "Engine intervals, sled day and the rower leaderboard."], ["3", "#f0c7a4", "#6b4a2e", "#4f7a45", "Rosa Lindqvist", "Mobility", "Mobility & core, plus return-to-training sessions."], ["4", "#d9a77f", "#2a211b", "#5a4a7a", "Kenji Arai", "Beginner lead", "Teaches every Intro to lifting class and the four-week start."]].map(([id, s, h, t, n, r, d]) => `<article class="card gy-coach"><div class="sk-photo">${coach(id, s, h, t)}</div><div><span class="badge" style="justify-self:start">${r}</span><h3 class="sk-h3">${n}</h3><p class="muted">${d}</p></div></article>`).join("")}</div>
</div></section>

<section class="sk-sec sk-alt" id="the-gym"><div class="sk-wrap gy-zones">
  <div class="sk-photo">${zoneShot()}<span class="sk-cap">Zone 2: turf track and platforms</span></div>
  <div><span class="sk-eyebrow">The gym</span><h2 class="sk-h2" style="margin:12px 0 20px">Five zones, one warehouse</h2>
    <ol class="gy-zl">${[["Z1", "Lifting floor", "8 racks, 8 platforms, calibrated plates.", "Lift"], ["Z2", "Turf track", "30 m of turf for sleds, carries and sprints.", "Cond"], ["Z3", "Engine room", "Rowers, bikes and ski machines in a row.", "Cond"], ["Z4", "Mobility studio", "Mats, bands and a quiet corner away from the music.", "Mob"], ["Z5", "Changing rooms", "Showers, lockers, towel service on Unlimited.", ""]].map(([n, t, d, b]) => `<li><span class="num">${n}</span><div><b>${t}</b><p>${d}</p></div>${b ? `<span class="badge">${b === "Lift" ? "Strength" : b === "Cond" ? "Conditioning" : "Mobility"}</span>` : `<span></span>`}</li>`).join("")}</ol></div>
</div></section>

<section class="sk-sec" id="start-here"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">Start here</span><h2 class="sk-h2">New to lifting? Your first month</h2></div><p class="muted" style="max-width:360px">Small groups of six, Wednesdays and Saturdays. Included with any membership for your first month.</p></div>
  <div class="gy-path">${[["Week 1", "Move well", "Squat, hinge, push and pull with a broomstick before a barbell."], ["Week 2", "Load it", "First barbell work and how to pick a starting weight."], ["Week 3", "Conditioning", "Pacing on the rower and bike, and what a hard session should feel like."], ["Week 4", "Join a class", "Your coach books you into two regular classes and stays nearby."]].map(([w, t, d]) => `<div class="gy-wk"><span class="badge">${w}</span><h3 class="sk-h3">${t}</h3><p class="muted" style="font-size:14px">${d}</p></div>`).join("")}</div>
</div></section>

<section class="sk-sec sk-alt"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">Member notes</span><h2 class="sk-h2">What members say</h2></div></div>
  <div class="gy-notes sk-rail">${[["big", "I was nervous walking in. Kenji had me squatting a broomstick in front of a mirror and nobody looked twice. Two years on, the 6:15 crew is the best part of my week.", "Laila M.", "6:15 AM regular"], ["", "The timetable actually fits a shift pattern. I book lunch conditioning on my phone between meetings.", "Owen R.", "Unlimited member"], ["", "Coaches fix your form without making a show of it. Saturday sled day is loud in the best way.", "Grace T.", "Member since 2024"]].map(([c, q, n, r]) => `<figure class="card gy-note ${c}"><q>${esc(q)}</q><figcaption class="sk-row" style="gap:10px"><span class="avatar" style="width:36px;height:36px">${n[0]}${n.split(" ")[1][0]}</span><span><b>${n}</b><br><span class="muted" style="font-size:13px">${r}</span></span></figcaption></figure>`).join("")}</div>
</div></section>

<section class="sk-sec" id="book-a-free-trial-class"><div class="sk-wrap"><div class="card gy-trial">
  <div><span class="sk-eyebrow">Free trial</span><h2 class="sk-h2">Try one class on us</h2><p class="muted">Turn up ten minutes early. A coach will show you around, check how you’re moving and scale the session to suit you.</p>
    <ul class="gy-check">${["Bring trainers, water and a towel", "Tell us about any injuries before you start", "No sales pitch at the end, promise"].map((t) => `<li>${ic("check", 16)}<span>${t}</span></li>`).join("")}</ul></div>
  <form aria-label="Book a free trial class">
    <div class="sk-g2"><div class="sk-field"><label for="gy-name">Name</label><input class="sk-input" id="gy-name" value="Sam Achebe"></div><div class="sk-field"><label for="gy-email">Email</label><input class="sk-input" id="gy-email" value="sam@mail.example"></div></div>
    <div class="sk-field"><span style="font-weight:500;font-size:13px">Pick a class</span><div class="gy-pick">${[["Wed 18:30", "Intro to lifting", "on"], ["Tue 17:30", "Mobility & core", ""], ["Sat 8:00", "Team sled day", ""]].map(([t, n, c], i) => `<label class="${c}"><input type="radio" name="gy-cls"${c ? " checked" : ""}><b>${t}</b><span class="muted">${n}</span></label>`).join("")}</div></div>
    <div class="sk-g2"><div class="sk-field"><label for="gy-exp">Training experience</label><select class="sk-input" id="gy-exp"><option>New to strength training</option><option>Some experience</option><option>Lift regularly</option></select></div><div class="sk-field"><label for="gy-phone">Mobile (optional)</label><input class="sk-input" id="gy-phone" value="(555) 014-8820"></div></div>
    <div class="sk-field"><label for="gy-note">Injuries or anything we should know</label><textarea class="sk-input" id="gy-note" rows="2">Old knee niggle, fine for most things.</textarea></div>
    <button class="btn primary sk-btn-lg" type="button">Book Wed 18:30 trial</button>
  </form>
</div></div></section>
</main>
${K.footer(p, "Coached strength and conditioning on Foundry Street. Open gym from 5:30 AM.", [["Visit", ["21 Foundry Street, Unit 4", "Bike racks and street parking", "Mon–Fri 5:30 AM – 10 PM"]], ["Contact", ["(555) 014-7700", "coach@ironyard.example", "Front desk staffed 7 AM – 8 PM"]], ["Members", ["Book a class", "Pause or freeze", "House rules"]]])}`, CSS);

module.exports = {
  "gym-website": K.def("gym", "Gym website",
    "a full gym home page: navigation with a free-trial button and member log-in, an uppercase hero with a training-floor banner and four facility facts, a six-day class timetable grid with class types, times and spaces left, three membership plans with monthly prices and a featured plan, coach cards, five facility zones beside a turf photo, a four-week beginner path, member notes, a free trial booking form with class picker and a footer",
    ["navigation-header", "hero", "stats", "timetable", "schedule", "pricing", "pricing-cards", "team", "features-list", "steps", "testimonials", "booking-form", "footer", "gym", "fitness"], web),
};
