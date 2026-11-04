/* School website template (Alderbrook Academy — fictional independent day school for ages 4 to 18). Full responsive home page:
   nav, centred hero with "Book a visit" / "Apply" and a three-photo campus strip, school stages, admissions timeline + key dates,
   academics & co-curricular, campus life mosaic, news & events, open day registration form, footer.
   Campus "photos" are inline SVG in fixed natural tones. */
const { ic, esc } = require("../lib");
const K = require("../sitekit");

const CSS = `<style>
.sc>.sk-sec{padding:80px 0}
.sc-hero{padding-top:72px;padding-bottom:72px;text-align:center}
.sc-hero .sk-stack{justify-items:center;max-width:820px;margin:0 auto}
.sc-hero .sk-lede{max-width:640px}
.sc-strip{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.5fr) minmax(0,1fr);gap:16px;margin-top:48px;align-items:end}
.sc-strip .sk-photo{aspect-ratio:4/3}
.sc-strip .sc-mid{aspect-ratio:16/10}
.sc-note{display:inline-flex;align-items:center;gap:10px;padding:8px 14px;border:1px solid var(--border);border-radius:999px;font-size:14px;background:var(--surface)}
.sc-note b{font-weight:600}
.sc-stages{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px}
.sc-stage{padding:0;overflow:hidden;display:grid;align-content:start}
.sc-stage>header{padding:24px 28px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:baseline;gap:12px;background:color-mix(in oklab,var(--primary) var(--t),var(--surface))}
.sc-stage>header .num{font-size:28px}
.sc-stage>div{padding:22px 28px 28px;display:grid;gap:12px}
.sc-stage ul{list-style:none;display:grid;gap:8px;font-size:14px}
.sc-stage li{display:flex;gap:10px}
.sc-stage li>span:first-child{color:color-mix(in oklab,var(--primary) 80%,var(--text));flex:0 0 auto}
.sc-adm{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(0,1fr);gap:40px;align-items:start}
.sc-tl{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:20px;position:relative;padding-top:34px}
.sc-tl::before{content:"";position:absolute;left:8px;right:8px;top:9px;height:2px;background:var(--border)}
.sc-tl>div{position:relative;display:grid;gap:6px;align-content:start}
.sc-tl>div::before{content:"";position:absolute;left:0;top:-32px;width:18px;height:18px;border-radius:50%;background:var(--bg);border:3px solid var(--primary)}
.sc-tl>div.done::before{background:var(--primary)}
.sc-tl .num{font-size:13px;color:var(--muted)}
.sc-tl p{font-size:14px;color:var(--muted)}
.sc-fees{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin-top:40px}
.sc-fees>div{padding:18px 20px;display:grid;gap:4px}
.sc-fees .num{font-size:22px}
.sc-dates{padding:26px;display:grid;gap:0}
.sc-dates h3{margin-bottom:8px}
.sc-date{display:grid;grid-template-columns:62px minmax(0,1fr);gap:14px;align-items:center;padding:12px 0;border-top:1px solid var(--border)}
.sc-cal{border:1px solid var(--border);border-radius:var(--radius);text-align:center;padding:4px 0;background:var(--bg)}
.sc-cal span{display:block;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
.sc-cal b{font-size:20px;line-height:1.1}
.sc-acad{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:56px;align-items:start}
.sc-subj{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 28px}
.sc-subj dl{padding:16px 0;border-bottom:1px solid var(--border)}
.sc-subj dt{font-weight:600}
.sc-subj dd{font-size:14px;color:var(--muted)}
.sc-chips{display:flex;flex-wrap:wrap;gap:8px;margin:18px 0 26px}
.sc-chip{height:36px;padding:0 14px;border:1px solid var(--border);border-radius:999px;display:inline-flex;align-items:center;gap:8px;font-size:14px;font-weight:500;background:var(--bg)}
.sc-figs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;padding-top:22px;border-top:1px solid var(--border)}
.sc-figs .num{font-size:30px;display:block}
.sc-life{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));grid-template-rows:200px 200px;gap:14px}
.sc-life .sk-photo{aspect-ratio:auto}
.sc-life .sc-a{grid-column:span 2;grid-row:span 2}
.sc-life .sc-b{grid-column:span 2}
.sc-news{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(0,1fr);gap:40px;align-items:start}
.sc-posts{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,1fr);gap:24px}
.sc-post{display:grid;gap:10px;align-content:start}
.sc-post .sk-photo{aspect-ratio:16/10}
.sc-post.sm{grid-template-columns:110px minmax(0,1fr);gap:14px;align-items:start;padding-bottom:16px;border-bottom:1px solid var(--border)}
.sc-post.sm .sk-photo{aspect-ratio:1/1}
.sc-post .muted{font-size:13px}
.sc-ev{list-style:none;display:grid;gap:0}
.sc-ev li{display:grid;grid-template-columns:62px minmax(0,1fr);gap:14px;padding:14px 0;border-bottom:1px solid var(--border);align-items:center}
.sc-ev li:first-child{border-top:1px solid var(--border)}
.sc-open{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.2fr);gap:56px;align-items:start}
.sc-form{padding:36px;display:grid;gap:16px}
.sc-form .sk-g2{gap:14px}
.sc-opt{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
.sc-opt label{border:1px solid var(--border);border-radius:var(--radius);padding:10px 12px;display:grid;gap:2px;font-size:13px;background:var(--bg)}
.sc-opt label b{font-size:14px}
.sc-opt label.on{border-color:var(--primary);box-shadow:inset 0 0 0 1px var(--primary)}
.sc-opt input{position:absolute;opacity:0;pointer-events:none}
.sc-check{display:flex;gap:10px;align-items:flex-start;font-size:14px}
.sc-faq{display:grid;gap:0;margin-top:24px}
.sc-faq details{border-top:1px solid var(--border);padding:14px 0}
.sc-faq summary{font-weight:600;cursor:pointer;list-style:none;display:flex;justify-content:space-between;gap:12px}
.sc-faq summary::-webkit-details-marker{display:none}
.sc-faq p{color:var(--muted);font-size:14px;margin-top:8px}
@media (max-width:1024px){.sc-stages{grid-template-columns:minmax(0,1fr)}.sc-life{grid-template-rows:160px 160px}}
@media (max-width:760px){
  .sc>.sk-sec{padding:52px 0}
  .sc .sk-rail{scroll-padding-inline:20px}
  .sk-foot li{overflow-wrap:anywhere}
  .sc-hero{padding-top:32px;padding-bottom:48px}
  .sc-strip{grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:10px;margin-top:32px}
  .sc-strip .sc-mid{grid-column:1/-1;order:-1;aspect-ratio:16/10}
  .sc-stages{display:flex}
  .sc-stage>header,.sc-stage>div{padding-inline:20px}
  .sc-adm,.sc-acad,.sc-news,.sc-open{grid-template-columns:minmax(0,1fr);gap:28px}
  .sc-tl{grid-template-columns:minmax(0,1fr);gap:18px;padding-top:0;padding-left:34px}
  .sc-tl::before{left:8px;right:auto;top:6px;bottom:6px;width:2px;height:auto}
  .sc-tl>div::before{left:-34px;top:2px}
  .sc-subj{grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:0 16px}
  .sc-subj dl{padding:12px 0}
  .sc-figs .num{font-size:24px}
  .sc-life{grid-template-columns:minmax(0,1fr) minmax(0,1fr);grid-template-rows:180px 110px;gap:10px}
  .sc-life .sc-a{grid-column:1/-1;grid-row:auto}
  .sc-life .sc-b{display:none}
  .sc-posts{grid-template-columns:minmax(0,1fr);gap:16px}
  .sc-posts>.sc-post:not(.sm) .sk-photo{aspect-ratio:16/9}
  .sc-post.sm{grid-template-columns:84px minmax(0,1fr)}
  .sc-form{padding:22px}
  .sc-opt label{padding:8px;font-size:12px}
  .sc-opt label b{font-size:13px}
  .sc-faq details:nth-child(n+3){display:none}
  .sc-hero h1{font-size:min(calc(38px * var(--hs)),46px)}
  .sc-posts>.sc-post:not(.sm) .sk-photo{display:none}
  .sc-ev li:nth-child(n+4){display:none}
  .sc-fees{grid-template-columns:minmax(0,1fr);gap:10px;margin-top:24px}
  .sc-fees>div:nth-child(n+2){display:none}
}
</style>`;

// ---- illustrative campus "photos" (fixed natural tones) --------------------------------------------------------
const SCENES = {
  hall: ["Red-brick main hall with a clock tower and lawn", `<rect width="600" height="380" fill="#bcd3df"/><rect y="270" width="600" height="110" fill="#79a05e"/><rect x="120" y="120" width="360" height="160" fill="#a5523a"/><path d="M110 124l190-70 190 70z" fill="#5d3a2c"/><rect x="268" y="20" width="64" height="110" fill="#a5523a"/><path d="M262 24l38-24 38 24z" fill="#5d3a2c"/><circle cx="300" cy="66" r="18" fill="#f3ead8"/><path d="M300 66v-12M300 66l8 6" stroke="#3a2a22" stroke-width="3"/>${[150, 200, 250, 330, 380, 430].map((x) => `<rect x="${x}" y="160" width="26" height="40" fill="#e9e1cc"/><rect x="${x}" y="220" width="26" height="40" fill="#e9e1cc"/>`).join("")}<rect x="280" y="210" width="40" height="70" fill="#4a2f24"/><circle cx="60" cy="230" r="54" fill="#5f8a4a"/><circle cx="545" cy="240" r="44" fill="#6c9654"/>`],
  lab: ["Science lab with benches and a window", `<rect width="600" height="380" fill="#e6ebe8"/><rect x="380" y="40" width="180" height="150" fill="#b6d2dc"/><path d="M470 40v150M380 115h180" stroke="#f4f6f4" stroke-width="6"/><rect y="250" width="600" height="130" fill="#c6c0b2"/><rect x="40" y="200" width="320" height="24" fill="#3f4a4f"/><rect x="60" y="224" width="16" height="70" fill="#59656b"/><rect x="324" y="224" width="16" height="70" fill="#59656b"/><path d="M110 200v-40h12v40z" fill="#9fc6d2"/><circle cx="170" cy="186" r="16" fill="#cfe3c6"/><rect x="164" y="150" width="12" height="24" fill="#cfe3c6"/><rect x="230" y="160" width="40" height="40" rx="4" fill="#f1d38a" opacity=".8"/>`],
  field: ["Playing field with goalposts and a running track", `<rect width="600" height="380" fill="#c4dbe6"/><rect y="170" width="600" height="210" fill="#6f9a4e"/><ellipse cx="300" cy="300" rx="320" ry="90" fill="none" stroke="#c96a4a" stroke-width="22"/><path d="M0 230h600" stroke="#f2f0e6" stroke-width="3" opacity=".7"/><path d="M90 230v-70h80v70" stroke="#f4f4f0" stroke-width="6" fill="none"/><circle cx="420" cy="140" r="42" fill="#517a3d"/><circle cx="500" cy="150" r="34" fill="#5b8644"/>`],
  library: ["Library with tall shelves and reading tables", `<rect width="600" height="380" fill="#6b4a33"/>${[0, 1, 2, 3].map((r) => [...Array(14)].map((_, i) => `<rect x="${30 + i * 40}" y="${30 + r * 56}" width="${14 + (i * 7 + r * 3) % 14}" height="44" fill="${["#b8573e", "#486b7a", "#d9b15a", "#6f8a55", "#e7dcc6"][(i + r) % 5]}"/>`).join("")).join("")}${[0, 1, 2, 3].map((r) => `<rect x="20" y="${74 + r * 56}" width="560" height="8" fill="#4a3022"/>`).join("")}<rect y="270" width="600" height="110" fill="#8a6a4c"/><rect x="120" y="290" width="360" height="18" fill="#c49a6c"/>`],
  music: ["Music room with a piano and music stands", `<rect width="600" height="380" fill="#e9dfcf"/><rect y="260" width="600" height="120" fill="#a98563"/><path d="M80 260v-110h220l40 60v50z" fill="#1e1a18"/><rect x="90" y="210" width="210" height="14" fill="#f4f1ea"/>${[...Array(14)].map((_, i) => `<rect x="${94 + i * 15}" y="210" width="7" height="8" fill="#1e1a18"/>`).join("")}${[400, 480].map((x) => `<path d="M${x} 260v-90M${x - 26} 170h52l-8 26h-36z" stroke="#3a3330" stroke-width="5" fill="#3a3330"/>`).join("")}`],
  art: ["Art studio with easels and paintings on the wall", `<rect width="600" height="380" fill="#f0ebe2"/>${[[60, 50, "#d9765a"], [190, 70, "#5c8fa6"], [320, 46, "#e3b748"], [450, 66, "#7a9a5e"]].map(([x, y, c]) => `<rect x="${x}" y="${y}" width="96" height="76" fill="${c}"/><rect x="${x + 16}" y="${y + 14}" width="40" height="30" fill="#f5efe3" opacity=".6"/>`).join("")}<rect y="270" width="600" height="110" fill="#c2ad8c"/><path d="M200 300l40-140 40 140M240 160v140" stroke="#7a5a3c" stroke-width="7" fill="none"/><rect x="204" y="170" width="72" height="56" fill="#f6f1e6"/><circle cx="240" cy="198" r="16" fill="#d9765a"/>`],
};
const scene = (k) => `<svg viewBox="0 0 600 380" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${esc(SCENES[k][0])}">${SCENES[k][1]}</svg>`;
const cal = (m, d) => `<div class="sc-cal"><span>${m}</span><b class="num">${d}</b></div>`;

const web = (p, st) => K.page(st, `${K.nav(p, ["About", "Admissions", "Academics", "Campus life", "News"], "Apply", "Book a visit")}
<main class="sc">
<section class="sk-wrap sc-hero" id="top">
  <div class="sk-stack" style="gap:22px">
    <span class="sc-note">${ic("calendar", 16)} <b>Open morning Sat 21 Nov</b> <span class="muted">· places left</span></span>
    <h1 class="sk-h1">A day school where every child is known by name</h1>
    <p class="sk-lede">${esc(p.name)} teaches boys and girls from age 4 to 18 on one leafy campus. Small classes, a broad curriculum and a short walk from Northgate station.</p>
    <div class="sk-row" style="justify-content:center"><a class="btn primary sk-btn-lg" href="#open-day">Book a visit</a><a class="btn sk-btn-lg" href="#admissions">Apply for 2027 ${ic("arrow", 16)}</a></div>
  </div>
  <div class="sc-strip"><div class="sk-photo">${scene("lab")}<span class="sk-cap">Senior science lab</span></div><div class="sk-photo sc-mid">${scene("hall")}</div><div class="sk-photo">${scene("field")}<span class="sk-cap">Lower field</span></div></div>
</section>

<section class="sk-sec sk-alt" id="about"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">Our school</span><h2 class="sk-h2">Three stages, one campus</h2></div><p class="muted" style="max-width:380px">Children move up through the school without changing site, so siblings share a drop-off and a school day.</p></div>
  <div class="sc-stages sk-rail">${[["Primary", "4–11", "Reception to Year 6", "8%", ["Classes of 18, with a teaching assistant to age 7", "Daily reading, outdoor learning on Fridays", "French and music from Reception"]],
    ["Middle", "11–14", "Years 7 to 9", "16%", ["A form tutor who stays with the group for three years", "Separate sciences in specialist labs", "Two languages from Year 7"]],
    ["Senior", "14–18", "Years 10 to 13", "24%", ["24 GCSE and 22 A level subjects offered", "A personal tutor for university and career plans", "Extended project and study periods in Sixth Form"]]].map(([n, a, y, t, items]) => `<article class="card sc-stage"><header style="--t:${t}"><div><h3 class="sk-h3">${n}</h3><span class="muted" style="font-size:13px">${y}</span></div><span class="num">${a}</span></header><div><ul>${items.map((x) => `<li><span>${ic("check", 16)}</span><span>${x}</span></li>`).join("")}</ul><a class="btn" style="justify-self:start" href="#">Explore ${n.toLowerCase()} ${ic("chevron", 14)}</a></div></article>`).join("")}</div>
</div></section>

<section class="sk-sec" id="admissions"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">Admissions · entry September 2027</span><h2 class="sk-h2">How to join us</h2></div><a class="btn sk-btn-lg" href="#">Fees and bursaries</a></div>
  <div class="sc-adm">
    <div><div class="sc-tl">${[["Step 1 · now", "Visit", "Come to an open morning or book a weekday tour with the admissions team.", "done"], ["Step 2 · by 15 Jan", "Register", "Complete the online form. Registration closes 15 January 2027.", ""], ["Step 3 · Feb", "Taster day", "Your child spends a day in class. Older pupils also sit a short assessment.", ""], ["Step 4 · March", "Offer", "Offers are sent in early March, with four weeks to accept.", ""]].map(([s, t, d, c]) => `<div class="${c}"><span class="num">${s}</span><h3 class="sk-h3">${t}</h3><p>${d}</p></div>`).join("")}</div>
    <div class="sc-fees">${[["Day fees from", "$6,450 a term", "Primary. Senior school from $8,120"], ["Bursaries", "Up to 100%", "Means-tested, reviewed yearly"], ["Sibling discount", "10%", "For the second child onwards"]].map(([l, v, d]) => `<div class="card"><span class="muted" style="font-size:13px">${l}</span><span class="num">${v}</span><span class="muted" style="font-size:13px">${d}</span></div>`).join("")}</div></div>
    <aside class="card sc-dates" aria-label="Key dates"><h3 class="sk-h3">Key dates</h3>${[["Nov", "21", "Open morning", "9:30 AM – 12:30 PM, all stages"], ["Dec", "03", "Sixth Form evening", "6:00 – 8:00 PM, Main Hall"], ["Jan", "15", "Registration closes", "For September 2027 entry"], ["Feb", "06", "Taster day", "Years 3, 7 and 12"]].map(([m, d, t, s]) => `<div class="sc-date">${cal(m, d)}<div><b>${t}</b><div class="muted" style="font-size:13px">${s}</div></div></div>`).join("")}</aside>
  </div>
</div></section>

<section class="sk-sec sk-alt" id="academics"><div class="sk-wrap sc-acad">
  <div><span class="sk-eyebrow">Academics</span><h2 class="sk-h2" style="margin:12px 0 18px">Broad first, then deep</h2>
    <div class="sc-subj">${[["English & languages", "English, French, Spanish, Mandarin, Latin"], ["Mathematics", "Maths, further maths, statistics"], ["Sciences", "Biology, chemistry, physics, computing"], ["Humanities", "History, geography, economics, RS"], ["Creative arts", "Art, design technology, drama, music"], ["Sport & health", "PE, dance, outdoor education"]].map(([t, d]) => `<dl><dt>${t}</dt><dd>${d}</dd></dl>`).join("")}</div></div>
  <div><span class="sk-eyebrow">Co-curricular</span><h2 class="sk-h2" style="margin:12px 0 4px">After the bell</h2>
    <p class="muted">Clubs run 3:45–5:00 PM daily and are included in fees, except instrument lessons.</p>
    <div class="sc-chips">${[["star", "Orchestra"], ["globe", "Model UN"], ["bolt", "Robotics"], ["heart", "Community service"], ["users", "Debating"], ["sun", "Outdoor expeditions"], ["play", "Drama productions"], ["pin", "Rowing"], ["edit", "School newspaper"], ["spark", "Chess"]].map(([i, t]) => `<span class="sc-chip">${ic(i, 15)} ${t}</span>`).join("")}</div>
    <div class="sc-figs">${[["60+", "clubs each week"], ["14", "sports teams"], ["3", "productions a year"]].map(([v, l]) => `<div><span class="num">${v}</span><span class="muted" style="font-size:13px">${l}</span></div>`).join("")}</div></div>
</div></section>

<section class="sk-sec" id="campus-life"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">Campus life</span><h2 class="sk-h2">Twenty acres on the edge of town</h2></div><a class="btn sk-btn-lg" href="#">Take the virtual tour ${ic("play", 14)}</a></div>
  <div class="sc-life"><div class="sk-photo sc-a">${scene("library")}<span class="sk-cap">The Whitlow Library, open until 6 PM</span></div><div class="sk-photo sc-b">${scene("field")}<span class="sk-cap">Lower field and track</span></div><div class="sk-photo">${scene("music")}<span class="sk-cap">Music school</span></div><div class="sk-photo">${scene("art")}<span class="sk-cap">Art studios</span></div></div>
</div></section>

<section class="sk-sec sk-alt" id="news"><div class="sk-wrap sc-news">
  <div><div class="sk-head" style="margin-bottom:24px"><div><span class="sk-eyebrow">News</span><h2 class="sk-h2">From around the school</h2></div></div>
    <div class="sc-posts"><article class="sc-post"><div class="sk-photo">${scene("art")}</div><span class="muted">4 November · Arts</span><h3 class="sk-h3">Year 9 sculpture show opens in the gallery corridor</h3><p class="muted" style="font-size:14px">Forty pieces made from reclaimed wood and wire, on show until the end of term.</p></article>
      <div style="display:grid;gap:16px;align-content:start">${[["lab", "29 October · Science", "Sixth Formers build a weather station for the roof"], ["field", "22 October · Sport", "Under-13 hockey reach the county final"], ["music", "15 October · Music", "Autumn concert tickets now on sale"]].map(([k, m, t]) => `<article class="sc-post sm"><div class="sk-photo">${scene(k)}</div><div><span class="muted">${m}</span><h3 style="font-size:15px;font-family:var(--font-b);font-weight:600;line-height:1.35">${t}</h3></div></article>`).join("")}</div></div></div>
  <div><h3 class="sk-h3" style="margin-bottom:14px">Upcoming events</h3><ul class="sc-ev">${[["Nov", "12", "Remembrance assembly", "Whole school · 9:00 AM"], ["Nov", "19", "Autumn concert", "Main Hall · 7:00 PM"], ["Nov", "21", "Open morning", "All stages · 9:30 AM"], ["Nov", "26", "Parents’ evening, Year 8", "Online · 4:30–7:30 PM"], ["Dec", "10", "Carol service", "St Anne’s Church · 6:30 PM"]].map(([m, d, t, s]) => `<li>${cal(m, d)}<div><b>${t}</b><div class="muted" style="font-size:13px">${s}</div></div></li>`).join("")}</ul><a class="btn block" style="margin-top:18px" href="#">Full school calendar</a></div>
</div></section>

<section class="sk-sec" id="open-day"><div class="sk-wrap sc-open">
  <div><span class="sk-eyebrow">Open day</span><h2 class="sk-h2" style="margin:12px 0 14px">Come and see a normal school day</h2>
    <p class="muted" style="font-size:17px">Pupils lead the tours. You’ll see lessons in progress, meet the head and the heads of each stage, and stay for lunch in the dining hall.</p>
    <div class="sc-faq">${[["Can my child come too?", "Yes, children are welcome on every tour and can join a short taster lesson."], ["Is there parking?", "Visitor parking is signed from the Elm Avenue gate. Northgate station is a 6-minute walk."], ["Can’t make these dates?", "Book a private weekday tour with the admissions team on (555) 013-6620."]].map(([q, a], i) => `<details${i === 0 ? " open" : ""}><summary>${q}<span>${ic("chevdown", 16)}</span></summary><p>${a}</p></details>`).join("")}</div></div>
  <form class="card sc-form" aria-label="Register for an open day">
    <h2 class="sk-h3" style="font-size:calc(26px * var(--hs))">Register for a visit</h2>
    <div class="sk-field"><span style="font-weight:500;font-size:13px">Choose a date</span><div class="sc-opt">${[["Sat 21 Nov", "Open morning", "on"], ["Thu 3 Dec", "Sixth Form evening", ""], ["Weekday", "Private tour", ""]].map(([d, t, c]) => `<label class="${c}"><input type="radio" name="sc-date"${c ? " checked" : ""}><b>${d}</b><span class="muted">${t}</span></label>`).join("")}</div></div>
    <div class="sk-g2"><div class="sk-field"><label for="sc-parent">Parent or guardian</label><input class="sk-input" id="sc-parent" value="Lin Park"></div><div class="sk-field"><label for="sc-email">Email</label><input class="sk-input" id="sc-email" value="lin.park@mail.example"></div></div>
    <div class="sk-g2"><div class="sk-field"><label for="sc-child">Child’s first name</label><input class="sk-input" id="sc-child" value="Juno"></div><div class="sk-field"><label for="sc-entry">Entry year</label><select class="sk-input" id="sc-entry"><option>Year 7 · Sept 2027</option><option>Reception · Sept 2027</option><option>Year 12 · Sept 2027</option></select></div></div>
    <div class="sk-field"><label for="sc-guests">Number attending</label><select class="sk-input" id="sc-guests"><option>2 adults, 1 child</option><option>1 adult, 1 child</option></select></div>
    <label class="sc-check"><input type="checkbox" checked> <span>Send me the prospectus and fees sheet by email</span></label>
    <button class="btn primary sk-btn-lg" type="button">Book my place on 21 Nov</button>
  </form>
</div></section>
</main>
${K.footer(p, "An independent co-educational day school for ages 4 to 18.", [["Visit", ["Elm Avenue, Northgate", "Main gate open 7:30 AM", "Six minutes from Northgate station"]], ["Contact", ["Reception (555) 013-6600", "Admissions (555) 013-6620", "admissions@alderbrook.example"]], ["Parents", ["Term dates", "Lunch menus", "Parent portal"]]], `© 2026 ${p.name}. Registered charity no. 000000 (placeholder).`)}`, CSS);

module.exports = {
  "school-website": K.def("school", "School website",
    "a full independent school home page: navigation with book-a-visit and apply buttons, a centred hero with an open-morning note and a three-photo campus strip, primary, middle and senior stage cards with age ranges, an admissions timeline beside a key-dates card, academic subject areas beside co-curricular club chips and figures, a campus life photo mosaic, news posts with an upcoming events list, an open day FAQ beside a visit registration form with date picker, and a footer",
    ["navigation-header", "hero", "gallery", "cards", "timeline", "steps", "key-dates", "calendar", "features-list", "chips", "stats", "news", "blog-cards", "events", "faq", "registration-form", "footer", "school", "education"], web),
};
