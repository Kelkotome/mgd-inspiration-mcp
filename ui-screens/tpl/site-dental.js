/* Dental practice website template (Fennick Dental — fictional family and cosmetic dental practice). Full responsive home page:
   nav, hero with "Book a visit" + next-available-slot card, services grid, new-patient steps, insurance & payment facts,
   dentists, office tour + amenities, hours/location/booking form, footer. No clinical outcome claims.
   Room/people "photos" are inline SVG in fixed natural tones. */
const { ic, esc } = require("../lib");
const K = require("../sitekit");

const CSS = `<style>
.dn-hero{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:56px;align-items:center;padding-top:64px;padding-bottom:80px}
.dn-visual{position:relative}
.dn-visual .sk-photo{aspect-ratio:1/1}
.dn-next{position:absolute;left:-36px;bottom:32px;width:300px;padding:20px;display:grid;gap:12px;box-shadow:var(--shadow-lg)}
.dn-next .dn-when{display:flex;align-items:center;gap:10px}
.dn-dot{width:10px;height:10px;border-radius:50%;background:var(--success);flex:0 0 auto}
.dn-chips{display:flex;flex-wrap:wrap;gap:6px}
.dn-chip{height:32px;padding:0 12px;border:1px solid var(--border);border-radius:var(--radius);display:inline-flex;align-items:center;font-size:13px;font-weight:600;background:var(--bg)}
.dn-chip.on{background:var(--primary);border-color:var(--primary);color:var(--on-primary)}
.dn-trust{display:flex;flex-wrap:wrap;gap:10px 24px;font-size:14px;color:var(--muted)}
.dn-trust span{display:inline-flex;align-items:center;gap:8px}
.dn-svc{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:0;border-top:1px solid var(--border);border-left:1px solid var(--border)}
.dn-svc article{padding:30px;border-right:1px solid var(--border);border-bottom:1px solid var(--border);display:grid;gap:10px;align-content:start;background:var(--bg)}
.dn-ico{width:44px;height:44px;border-radius:var(--radius);display:grid;place-items:center;background:color-mix(in oklab,var(--primary) 14%,var(--bg));color:color-mix(in oklab,var(--primary) 80%,var(--text))}
.dn-svc .dn-meta{display:flex;justify-content:space-between;font-size:13px;color:var(--muted);padding-top:8px;border-top:1px dashed var(--border)}
.dn-steps{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:24px;counter-reset:dn}
.dn-step{position:relative;padding-top:26px;border-top:3px solid var(--text);display:grid;gap:8px;align-content:start}
.dn-step .num{font-size:14px;color:var(--muted)}
.dn-pay{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.15fr);gap:48px;align-items:start}
.dn-facts{list-style:none;display:grid;gap:0}
.dn-facts li{display:grid;grid-template-columns:28px minmax(0,1fr);gap:12px;padding:16px 0;border-bottom:1px solid var(--border)}
.dn-facts li>span:first-child{color:var(--success);padding-top:2px}
.dn-fees{padding:0;overflow:hidden}
.dn-fees table{width:100%;border-collapse:collapse;font-size:14px}
.dn-fees th,.dn-fees td{text-align:left;padding:14px 22px;border-bottom:1px solid var(--border)}
.dn-fees th{font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);font-weight:600;background:var(--surface)}
.dn-fees td.num{text-align:right;white-space:nowrap}
.dn-fees tr:last-child td{border-bottom:0}
.dn-team{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:24px}
.dn-doc{display:grid;gap:12px;align-content:start}
.dn-doc .sk-photo{aspect-ratio:1/1}
.dn>.sk-sec{padding:80px 0}
.dn-doc p{font-size:14px}
.dn-tour{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);gap:20px}
.dn-tour .sk-photo{aspect-ratio:auto;min-height:220px}
.dn-tour .dn-big{grid-row:span 2;min-height:460px}
.dn-amen{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px 28px;margin-top:28px}
.dn-amen div{display:flex;gap:10px;align-items:flex-start;font-size:14px}
.dn-amen div>span:first-child{color:color-mix(in oklab,var(--primary) 80%,var(--text));flex:0 0 auto}
.dn-visit{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);gap:32px;align-items:start}
.dn-hours{width:100%;border-collapse:collapse;font-size:14px}
.dn-hours td{padding:10px 0;border-bottom:1px solid var(--border)}
.dn-hours td:last-child{text-align:right}
.dn-hours tr.today td{font-weight:700}
.dn-map{aspect-ratio:16/9;margin-top:20px}
.dn-form{padding:36px;display:grid;gap:16px}
.dn-form .sk-g2{gap:14px}
.dn-radio{display:flex;flex-wrap:wrap;gap:8px}
.dn-radio label{height:40px;padding:0 14px;border:1px solid var(--border);border-radius:var(--radius);display:inline-flex;align-items:center;gap:8px;font-size:14px;font-weight:500;background:var(--bg)}
.dn-radio label.on{border-color:var(--primary);box-shadow:inset 0 0 0 1px var(--primary)}
.dn-emerg{display:flex;align-items:center;justify-content:space-between;gap:24px;padding:22px 28px;margin-top:28px}
@media (max-width:1024px){.dn-next{left:16px}.dn-team{grid-template-columns:repeat(2,minmax(0,1fr))}.dn-steps{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:760px){
  .dn-hero{grid-template-columns:minmax(0,1fr);gap:24px;padding-top:24px;padding-bottom:48px}
  .dn-visual{order:-1}
  .dn-visual .sk-photo{aspect-ratio:4/3}
  .dn-next{position:relative;z-index:1;width:auto;left:auto;bottom:auto;margin-top:-40px;margin-inline:14px}
  .dn .sk-rail,.dn-svc{scroll-padding-inline:20px}
  .sk-foot li{overflow-wrap:anywhere}
  .dn-svc{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;margin:0 -20px;padding:0 20px;border:0;gap:12px;scrollbar-width:none}
  .dn-svc article{flex:0 0 78%;scroll-snap-align:start;border:1px solid var(--border);border-radius:var(--radius-lg)}
  .dn>.sk-sec{padding:52px 0}
  .dn-steps{grid-template-columns:repeat(2,minmax(0,1fr));gap:18px 14px}
  .dn-step p{font-size:13px!important}
  .dn-team>*{flex-basis:62%!important}
  .dn-map,.dn-fees>p{display:none}
  .dn-step{padding-top:16px}
  .dn-pay,.dn-visit{grid-template-columns:minmax(0,1fr);gap:28px}
  .dn-fees th,.dn-fees td{padding:12px 14px}
  .dn-team{display:flex}
  .dn-tour{grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:10px}
  .dn-tour .dn-big{grid-row:auto;grid-column:1/-1;min-height:200px}
  .dn-tour .sk-photo{min-height:130px}
  .dn-amen{grid-template-columns:minmax(0,1fr);gap:10px}
  .dn-form{padding:22px}
  .dn-emerg{flex-direction:column;align-items:flex-start;padding:20px}
}
</style>`;

// ---- illustrative "photos" (fixed natural tones) ----------------------------------------------------------------
const heroShot = () => `<svg viewBox="0 0 600 600" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Bright treatment room with a dental chair beside a tall window"><defs>
<linearGradient id="dn-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eef1ee"/><stop offset="1" stop-color="#dde3df"/></linearGradient>
<linearGradient id="dn-win" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#cfe3ea"/><stop offset="1" stop-color="#a9cbd6"/></linearGradient></defs>
<rect width="600" height="600" fill="url(#dn-wall)"/><rect x="330" y="60" width="210" height="330" rx="6" fill="url(#dn-win)"/><path d="M435 60v330M330 225h210" stroke="#f6f7f5" stroke-width="8"/>
<circle cx="380" cy="300" r="48" fill="#8fb48a" opacity=".7"/><circle cx="470" cy="320" r="38" fill="#7aa275" opacity=".6"/>
<rect y="430" width="600" height="170" fill="#c9b9a2"/>${Array.from({ length: 5 }, (_, i) => `<path d="M0 ${452 + i * 34}h600" stroke="#b5a48c" stroke-width="2"/>`).join("")}
<path d="M120 420c0-40 30-60 70-60h90c26 0 40 14 54 34l30 46h-50l-24-34h-110z" fill="#5f8f99"/><rect x="110" y="410" width="250" height="36" rx="16" fill="#4f7c86"/>
<path d="M120 360c-10-50 0-110 20-140h40c-12 40-16 90-10 140z" fill="#5f8f99"/><rect x="215" y="446" width="22" height="70" fill="#9aa3a6"/><rect x="170" y="510" width="112" height="16" rx="8" fill="#868f92"/>
<path d="M250 120v110" stroke="#9aa3a6" stroke-width="6"/><path d="M250 120h-90" stroke="#9aa3a6" stroke-width="6"/><ellipse cx="160" cy="132" rx="40" ry="16" fill="#f3f2ec"/><ellipse cx="160" cy="138" rx="28" ry="8" fill="#fff6d8"/>
<rect x="40" y="250" width="70" height="120" rx="6" fill="#f3f2ec"/><rect x="48" y="262" width="54" height="22" rx="3" fill="#d9e2e3"/><rect x="48" y="292" width="54" height="22" rx="3" fill="#d9e2e3"/></svg>`;
const person = (id, skin, hair, coat) => `<svg viewBox="0 0 240 300" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Portrait of a dentist in a clinic coat"><defs><linearGradient id="dn-p${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e7ece9"/><stop offset="1" stop-color="#cfd8d4"/></linearGradient></defs>
<rect width="240" height="300" fill="url(#dn-p${id})"/><path d="M30 300c6-70 44-100 90-100s84 30 90 100z" fill="${coat}"/><path d="M104 206l16 40 16-40z" fill="#f4f4f0"/>
<rect x="106" y="160" width="28" height="44" fill="${skin}"/><ellipse cx="120" cy="128" rx="44" ry="52" fill="${skin}"/><path d="M76 120c0-40 22-62 46-62s46 18 44 62c-10-22-30-30-46-30s-34 8-44 30z" fill="${hair}"/></svg>`;
const room = (kind, id) => ({
  lounge: `<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Waiting lounge with a sofa, plants and a children’s corner"><rect width="400" height="300" fill="#e8e1d5"/><rect y="210" width="400" height="90" fill="#b89f80"/><rect x="40" y="150" width="200" height="70" rx="14" fill="#6f8f86"/><rect x="40" y="130" width="200" height="40" rx="14" fill="#7fa096"/><circle cx="310" cy="150" r="40" fill="#7d9c6c"/><rect x="300" y="180" width="20" height="40" fill="#8a6a4c"/><rect x="270" y="236" width="90" height="30" rx="6" fill="#e9c46a"/><rect x="60" y="40" width="80" height="60" fill="#f4efe6" stroke="#c7bba8" stroke-width="4"/><rect x="170" y="50" width="60" height="44" fill="#f4efe6" stroke="#c7bba8" stroke-width="4"/></svg>`,
  hygiene: `<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Hygiene room with a ceiling screen above the chair"><rect width="400" height="300" fill="#dfe7e8"/><rect x="130" y="30" width="140" height="80" rx="6" fill="#2c3e46"/><rect x="140" y="40" width="120" height="60" fill="#89b7c6"/><rect y="220" width="400" height="80" fill="#c6c9c4"/><path d="M80 220c0-30 20-44 50-44h120c24 0 34 10 46 26l14 18z" fill="#4f7c86"/><rect x="300" y="140" width="60" height="80" rx="6" fill="#f3f2ec"/></svg>`,
  desk: `<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Reception desk with a warm wood front"><rect width="400" height="300" fill="#efe9df"/><rect x="40" y="150" width="320" height="100" rx="8" fill="#a87b52"/><rect x="40" y="140" width="320" height="16" rx="4" fill="#d9cbb5"/>${[90, 130, 170, 210, 250, 290, 330].map((x) => `<path d="M${x} 160v86" stroke="#946a44" stroke-width="3"/>`).join("")}<rect x="250" y="104" width="60" height="38" rx="4" fill="#2f3b40"/><circle cx="100" cy="112" r="20" fill="#7d9c6c"/><rect y="250" width="400" height="50" fill="#cdbfa8"/></svg>`,
}[kind]);
const mapShot = () => `<svg viewBox="0 0 640 360" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Map of the practice on Quarry Road beside Elm Park"><rect width="640" height="360" fill="#ebe8df"/><rect x="380" y="40" width="200" height="140" rx="10" fill="#cfdcbf"/><text x="420" y="116" font-family="sans-serif" font-size="14" fill="#5d6b4f">Elm Park</text>
${[[0, 210, 640, 190], [300, 0, 330, 360], [0, 80, 640, 110]].map(([a, b, c, d]) => `<path d="M${a} ${b}L${c} ${d}" stroke="#ffffff" stroke-width="18"/>`).join("")}<text x="40" y="196" font-family="sans-serif" font-size="13" fill="#6e6658">Quarry Road</text>
<rect x="60" y="240" width="120" height="70" rx="6" fill="#dcd5c6"/><text x="74" y="282" font-family="sans-serif" font-size="12" fill="#6e6658">P  Free parking</text>
<g transform="translate(316 196)"><path d="M0 0c-14-18-22-30-22-42a22 22 0 0 1 44 0c0 12-8 24-22 42z" fill="#2f7f8a"/><circle cx="0" cy="-42" r="8" fill="#fff"/></g></svg>`;

const SERVICES = [
  ["check", "Check-ups & X-rays", "A full exam, digital X-rays when due, and a plain-language summary of what we saw.", "45 min", "Every 6–12 months"],
  ["spark", "Hygiene & cleaning", "Scale and polish with a hygienist, plus home-care tips for brushing and flossing.", "40 min", "Every 6 months"],
  ["shield", "Fillings & repairs", "Tooth-coloured fillings, crowns and onlays, explained with costs before we start.", "30–90 min", "As needed"],
  ["sun", "Whitening", "In-chair or take-home trays, after a check that whitening suits your teeth.", "60 min", "Consult first"],
  ["grid", "Clear aligners", "A scan, a treatment plan you can see on screen, and check-ins every 6–8 weeks.", "Consult 30 min", "Adults & teens"],
  ["bolt", "Emergency visits", "Same-day slots held each morning for broken teeth, swelling or a lost filling.", "Same day", "Call before 10 AM"],
];
const TEAM = [["1", "#d9a77f", "#3b2a20", "#f4f6f4", "Dr Amara Fennick", "Principal dentist", "General and family dentistry. Speaks English and Igbo."],
  ["2", "#c48b62", "#1f1a17", "#e8f0f1", "Dr Tomás Reyes", "Dentist", "Fillings, crowns and clear aligner planning."],
  ["3", "#f0c7a4", "#a8743e", "#f4f6f4", "Hollie Brandt", "Dental hygienist", "Cleanings, gum health and nervous-patient visits."],
  ["4", "#8d5a3b", "#151210", "#e8f0f1", "Kwame Asante", "Practice manager", "Your go-to for booking, plans and paperwork."]];

const web = (p, st) => K.page(st, `${K.nav(p, ["Services", "New patients", "Fees & insurance", "Our team", "Visit"], "Book a visit", "Call (555) 018-4410")}
<main class="dn">
<section class="sk-wrap dn-hero" id="top">
  <div class="sk-stack" style="gap:22px">
    <span class="sk-eyebrow">Family & cosmetic dentistry · Quarry Road</span>
    <h1 class="sk-h1">Unhurried dental care for the whole family</h1>
    <p class="sk-lede">${esc(p.name)} sees children, adults and grandparents in one calm practice. Longer appointments, prices shown before treatment, and evening hours twice a week.</p>
    <div class="sk-row"><a class="btn primary sk-btn-lg" href="#book-a-visit">Book a visit</a><a class="btn sk-btn-lg" href="#new-patients">New patient guide</a></div>
    <div class="dn-trust"><span>${ic("clock", 16)} Evenings Tue & Thu</span><span>${ic("users", 16)} Children from age 1</span><span>${ic("pin", 16)} Free parking on site</span></div>
  </div>
  <div class="dn-visual"><div class="sk-photo">${heroShot()}</div>
    <div class="card dn-next" aria-label="Next available appointment"><div class="dn-when"><span class="dn-dot"></span><b style="font-size:14px">Next available check-up</b></div>
      <div><div class="num" style="font-size:22px">Tue 10 Nov</div><div class="muted" style="font-size:13px">with Dr Amara Fennick</div></div>
      <div class="dn-chips"><span class="dn-chip">8:30</span><span class="dn-chip on">11:15</span><span class="dn-chip">4:40</span><span class="dn-chip">6:20</span></div>
      <a class="btn primary block" href="#book-a-visit">Hold 11:15 AM</a></div></div>
</section>

<section class="sk-sec sk-alt" id="services"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">Services</span><h2 class="sk-h2">Everyday care and the occasional fix</h2></div><p class="muted" style="max-width:360px">Every visit starts with a conversation. We explain options and costs, then you decide.</p></div>
  <div class="dn-svc">${SERVICES.map(([i, t, d, len, freq]) => `<article><span class="dn-ico">${ic(i, 20)}</span><h3 class="sk-h3">${t}</h3><p class="muted" style="font-size:14px">${d}</p><div class="dn-meta"><span>${len}</span><span>${freq}</span></div></article>`).join("")}</div>
</div></section>

<section class="sk-sec" id="new-patients"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">New patients</span><h2 class="sk-h2">Your first visit, step by step</h2></div><a class="btn sk-btn-lg" href="#">Download the forms ${ic("download", 16)}</a></div>
  <div class="dn-steps">${[["01", "Book online or call", "Pick a time that suits you. Families can book back-to-back slots."], ["02", "Fill in two short forms", "Medical history and contact details, online or on paper at the desk."], ["03", "Exam and a chat", "60 minutes for a first visit: exam, X-rays if needed, and your questions."], ["04", "A written plan", "Any treatment we suggest comes with a printed estimate to take home."]].map(([n, t, d]) => `<div class="dn-step"><span class="num">${n}</span><h3 class="sk-h3">${t}</h3><p class="muted" style="font-size:14px">${d}</p></div>`).join("")}</div>
</div></section>

<section class="sk-sec sk-alt" id="fees-insurance"><div class="sk-wrap dn-pay">
  <div><span class="sk-eyebrow">Fees & insurance</span><h2 class="sk-h2" style="margin:12px 0 8px">Clear prices, no surprises</h2>
    <ul class="dn-facts">${["We accept most PPO dental plans and file the claim for you.", "No insurance? Our in-house membership covers two check-ups and cleanings a year.", "Payment plans for treatment over $500, spread over 3–12 months.", "Cards, contactless and HSA/FSA cards accepted at the desk.", "A written estimate before any treatment, every time."].map((f) => `<li><span>${ic("check", 18)}</span><span>${esc(f)}</span></li>`).join("")}</ul></div>
  <div class="card dn-fees"><table><thead><tr><th>Self-pay guide prices</th><th style="text-align:right">From</th></tr></thead><tbody>${[["New patient exam & X-rays", "$95"], ["Hygiene visit", "$85"], ["Tooth-coloured filling", "$140"], ["Take-home whitening trays", "$320"], ["Clear aligners (full course)", "$3,400"], ["Membership, per month", "$29"]].map(([t, v]) => `<tr><td>${t}</td><td class="num">${v}</td></tr>`).join("")}</tbody></table>
    <p class="muted" style="font-size:13px;padding:14px 22px;border-top:1px solid var(--border)">Guide prices for 2026. Your estimate depends on what we find at the exam.</p></div>
</div></section>

<section class="sk-sec" id="our-team"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">Our team</span><h2 class="sk-h2">The people you’ll see</h2></div></div>
  <div class="dn-team sk-rail">${TEAM.map(([id, s, h, c, n, r, d]) => `<article class="dn-doc"><div class="sk-photo">${person(id, s, h, c)}</div><div><h3 class="sk-h3">${n}</h3><div class="badge" style="margin:6px 0 8px">${r}</div><p class="muted">${d}</p></div></article>`).join("")}</div>
</div></section>

<section class="sk-sec sk-alt" id="tour"><div class="sk-wrap sk-split" style="align-items:start">
  <div class="dn-tour"><div class="sk-photo dn-big">${room("lounge")}<span class="sk-cap">Waiting lounge & kids’ corner</span></div><div class="sk-photo">${room("hygiene")}<span class="sk-cap">Hygiene room</span></div><div class="sk-photo">${room("desk")}<span class="sk-cap">Reception</span></div></div>
  <div><span class="sk-eyebrow">Office tour</span><h2 class="sk-h2" style="margin:12px 0 14px">A practice that doesn’t feel like one</h2>
    <p class="muted" style="font-size:17px">Daylight in every treatment room, a ceiling screen to watch during cleanings, and a quiet room if the waiting area feels like too much.</p>
    <div class="dn-amen">${[["eye", "Ceiling screens in every chair"], ["users", "Children’s corner with books"], ["lock", "Quiet room on request"], ["pin", "Step-free entry and lift"], ["globe", "Free guest Wi-Fi"], ["phone", "Text reminders 48 h before"]].map(([i, t]) => `<div><span>${ic(i, 18)}</span><span>${t}</span></div>`).join("")}</div></div>
</div></section>

<section class="sk-sec" id="visit"><div class="sk-wrap dn-visit">
  <div><span class="sk-eyebrow">Hours & location</span><h2 class="sk-h2" style="margin:12px 0 18px">88 Quarry Road</h2>
    <table class="dn-hours"><tbody>${[["Monday", "8:00 AM – 5:00 PM"], ["Tuesday", "8:00 AM – 7:30 PM", "today"], ["Wednesday", "8:00 AM – 5:00 PM"], ["Thursday", "10:00 AM – 7:30 PM"], ["Friday", "8:00 AM – 3:00 PM"], ["Saturday", "9:00 AM – 1:00 PM (alternate weeks)"], ["Sunday", "Closed"]].map(([d, h, c]) => `<tr class="${c || ""}"><td>${d}</td><td>${h}</td></tr>`).join("")}</tbody></table>
    <div class="sk-photo dn-map">${mapShot()}</div></div>
  <form class="card dn-form" aria-label="Book a visit" id="book-a-visit">
    <h2 class="sk-h3" style="font-size:calc(26px * var(--hs))">Book a visit</h2>
    <p class="muted" style="font-size:14px">We’ll confirm by text within one working hour.</p>
    <div class="sk-field"><span style="font-weight:500;font-size:13px">I’m booking for</span><div class="dn-radio"><label class="on"><input type="radio" name="dn-who" checked> Myself</label><label><input type="radio" name="dn-who"> My child</label><label><input type="radio" name="dn-who"> Family (2+)</label></div></div>
    <div class="sk-g2"><div class="sk-field"><label for="dn-name">Full name</label><input class="sk-input" id="dn-name" value="Priya Nair"></div><div class="sk-field"><label for="dn-phone">Mobile</label><input class="sk-input" id="dn-phone" value="(555) 017-2283"></div></div>
    <div class="sk-g2"><div class="sk-field"><label for="dn-type">Visit type</label><select class="sk-input" id="dn-type"><option>New patient exam</option><option>Hygiene</option><option>Emergency</option></select></div><div class="sk-field"><label for="dn-date">Preferred day</label><input class="sk-input" id="dn-date" value="Tue 10 Nov, morning"></div></div>
    <div class="sk-field"><label for="dn-note">Anything we should know?</label><textarea class="sk-input" id="dn-note" rows="3">Nervous about X-rays, prefer the quiet room.</textarea></div>
    <button class="btn primary sk-btn-lg" type="button">Request appointment</button>
  </form>
</div>
<div class="sk-wrap"><div class="card dn-emerg"><div><b>Dental emergency?</b> <span class="muted">Call (555) 018-4410 before 10 AM for a same-day slot. Out of hours, follow the recorded message.</span></div><a class="btn sk-btn-lg" href="#">${ic("phone", 16)} Call the practice</a></div></div>
</section>
</main>
${K.footer(p, "Family and cosmetic dentistry on Quarry Road, with evening hours twice a week.", [["Visit", ["88 Quarry Road", "Free parking behind the building", "Step-free entrance"]], ["Contact", ["(555) 018-4410", "hello@fennickdental.example", "Text us: (555) 018-4411"]], ["Patients", ["New patient forms", "Membership plan", "Fees & insurance"]]])}`, CSS);

module.exports = {
  "dental-website": K.def("dental", "Dental practice website",
    "a full dental practice home page: navigation with book-a-visit and call buttons, a hero with a treatment-room photo and a next-available-appointment card with time chips, a six-service grid with visit length and frequency, four new-patient steps, insurance and payment facts beside a self-pay guide price table, dentist and team portraits, an office tour gallery with amenities, opening hours with a map and a booking form, an emergency call strip and a footer",
    ["navigation-header", "hero", "appointment-card", "time-slots", "services", "steps", "pricing-table", "insurance", "team", "gallery", "amenities", "opening-hours", "map", "booking-form", "footer", "dental"], web),
};
