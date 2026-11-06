/* Medical practice website template (Marrowfield Medical, a fictional multi-doctor primary care practice). Task-first home page:
   status strip, nav, a "What do you need today?" task panel as the hero, today's hours with a which-door routing ladder, a filterable
   clinician directory (radio inputs + CSS, no JS), services by department, new patient steps beside a portal sign-in card, plans and
   payment wording, general health topics, accessibility and languages with a training/credentials slot, two locations and a contact form.
   General information only: no outcome claims, no drug names, no insurer names. Maps are inline SVG in fixed natural tones. */
const { ic, esc } = require("../lib");
const K = require("../sitekit");

const FILTERS = [["all", "All"], ["gp", "GP"], ["nurse", "Nurse"], ["women", "Women’s health"], ["child", "Children"], ["ltc", "Long-term conditions"]];

const CSS = `<style>
.md>.sk-sec{padding:44px 0}
.md-strip{background:var(--primary);color:var(--on-primary);font-size:13px;font-weight:500}
.md-strip .sk-wrap{display:flex;justify-content:space-between;gap:24px;align-items:center;min-height:38px;padding-block:7px}
.md-strip span{display:inline-flex;align-items:center;gap:8px}
.md-strip i{width:8px;height:8px;border-radius:50%;background:currentColor;flex:0 0 auto}
.md-hero{background:color-mix(in oklab,var(--primary) 8%,var(--bg));border-bottom:1px solid var(--border);padding:36px 0 26px}
.md-hhead{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);gap:48px;align-items:end;margin-bottom:22px}
.md-h1{font-size:calc(56px * var(--hs));line-height:1.04}
.md-tasks{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));overflow:hidden;padding:0}
.md-task{padding:22px 24px 18px;display:grid;gap:10px;align-content:start;border-right:1px solid var(--border);border-bottom:1px solid var(--border);position:relative}
.md-task:nth-child(3n){border-right:0}
.md-task:nth-last-child(-n+3){border-bottom:0}
.md-task:hover{background:color-mix(in oklab,var(--primary) 5%,var(--surface))}
.md-tt{display:flex;align-items:center;gap:12px}
.md-ico{width:40px;height:40px;flex:0 0 auto;border-radius:var(--radius);display:grid;place-items:center;background:color-mix(in oklab,var(--primary) 14%,var(--surface));color:color-mix(in oklab,var(--primary) 80%,var(--text))}
.md-task.urg .md-ico{background:color-mix(in oklab,var(--warning) 20%,var(--surface));color:color-mix(in oklab,var(--warning) 62%,var(--text))}
.md-task h2{font-size:calc(21px * var(--hs));line-height:1.2}
.md-task>p{font-size:14px;color:var(--muted)}
.md-dl{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;padding-top:12px;margin-top:2px;border-top:1px dashed var(--border);font-size:13px}
.md-dl dt{color:var(--muted);font-size:12px}
.md-dl dd{font-weight:600}
.md-note{display:flex;align-items:center;gap:10px;margin-top:14px;font-size:14px}
.md-note>span:first-child{color:var(--danger);display:grid;flex:0 0 auto}
.md-today{display:grid;grid-template-columns:minmax(0,.82fr) minmax(0,1.18fr);gap:56px;align-items:start}
.md-times{width:100%;border-collapse:collapse;font-size:14px;margin-top:20px}
.md-times th{font-size:12px;font-weight:600;text-align:left;color:var(--muted);padding:0 0 8px;border-bottom:2px solid var(--text)}
.md-times td{padding:11px 0;border-bottom:1px solid var(--border);vertical-align:top}
.md-times th:not(:first-child),.md-times td:not(:first-child){text-align:right;white-space:nowrap;padding-left:14px}
.md-ladder{display:grid;gap:0;border-top:1px solid var(--border)}
.md-rung{display:grid;grid-template-columns:6px minmax(0,1fr) minmax(0,1fr);gap:20px;padding:12px 0;border-bottom:1px solid var(--border);align-items:start}
.md-rung>i{align-self:stretch;border-radius:3px;background:var(--c)}
.md-rung b{display:block;font-size:15px}
.md-rung p{font-size:14px;color:var(--muted)}
.md-rung .act{font-size:14px;font-weight:600}
.md-rung .act a{display:block;font-weight:500;color:var(--muted)}
.md-fx{position:absolute;opacity:0;pointer-events:none}
.md-filter{position:relative}
.md-chips{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:22px}
.md-chips label{height:38px;padding:0 15px;display:inline-flex;align-items:center;white-space:nowrap;border:1px solid var(--border);border-radius:999px;font-size:14px;font-weight:500;background:var(--bg);cursor:pointer}
${FILTERS.map(([k]) => `#md-f-${k}:checked~.md-chips label[for=md-f-${k}]{background:var(--primary);border-color:var(--primary);color:var(--on-primary)}`).join("")}
${FILTERS.map(([k]) => `#md-f-${k}:focus-visible~.md-chips label[for=md-f-${k}]{outline:2px solid var(--text);outline-offset:2px}`).join("")}
${FILTERS.slice(1).map(([k]) => `#md-f-${k}:checked~.md-dir .md-c:not(.${k}){display:none}`).join("")}
.md-dir{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:48px;border-top:1px solid var(--border)}
.md-c{display:grid;grid-template-columns:52px minmax(0,1fr);gap:16px;padding:11px 0;border-bottom:1px solid var(--border);align-items:start}
.md-ava{width:52px;height:52px;border-radius:50%;display:grid;place-items:center;font:600 16px var(--font-b);background:color-mix(in oklab,var(--primary) 16%,var(--surface));color:color-mix(in oklab,var(--primary) 80%,var(--text))}
.md-c h3{font-size:calc(18px * var(--hs));line-height:1.2}
.md-c .role{font-size:13px;color:var(--muted)}
.md-c .int{font-size:14px;margin-top:4px}
.md-av{display:flex;align-items:flex-start;gap:8px;font-size:13px;color:var(--muted);margin-top:6px}
.md-av i{width:8px;height:8px;border-radius:50%;margin-top:6px;flex:0 0 auto;background:var(--success)}
.md-av.lim i{background:var(--warning)}
.md-dept{width:100%;border-collapse:collapse;font-size:14px}
.md-dept th{text-align:left;font-size:12px;font-weight:600;color:var(--muted);padding:0 24px 10px 0;border-bottom:2px solid var(--text)}
.md-dept td{padding:10px 24px 10px 0;border-bottom:1px solid var(--border);vertical-align:top}
.md-dept td:first-child{width:24%}
.md-dept td:last-child{width:19%;color:var(--muted);padding-right:0}
.md-dept h3{font-size:calc(18px * var(--hs));line-height:1.2}
.md-reg{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,.85fr);gap:64px;align-items:start}
.md-steps{list-style:none;display:grid;margin:18px 0 6px}
.md-steps li{display:grid;grid-template-columns:36px minmax(0,1fr);gap:16px;position:relative;padding-bottom:12px}
.md-steps li:not(:last-child)::before{content:"";position:absolute;left:17px;top:36px;bottom:0;width:2px;background:var(--border)}
.md-steps .num{width:36px;height:36px;border-radius:50%;display:grid;place-items:center;font-size:14px;background:var(--text);color:var(--bg)}
.md-steps b{display:block;font-size:16px}
.md-steps p{font-size:14px;color:var(--muted)}
.md-portal{padding:24px 26px;display:grid;gap:11px}
.md-portal h2{font-size:calc(26px * var(--hs))}
.md-portal ul{list-style:none;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px 14px;font-size:13px;color:var(--muted)}
.md-portal li{display:flex;gap:6px;align-items:center}
.md-pay dl{display:grid;border-top:1px solid var(--border);margin-top:16px}
.md-pay dl>div{padding:11px 0;border-bottom:1px solid var(--border)}
.md-pay dt{font-weight:600}
.md-pay dd{font-size:14px;color:var(--muted)}
.md-topics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:28px}
.md-topic{display:grid;gap:8px;align-content:start;padding-top:16px;border-top:3px solid var(--text)}
.md-topic .tag{font-size:12px;color:var(--muted)}
.md-topic h3{font-size:calc(20px * var(--hs));line-height:1.22}
.md-topic p{font-size:14px;color:var(--muted)}
.md-disc{font-size:13px;color:var(--muted);max-width:340px}
.md-acc{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:64px;align-items:start}
.md-acclist{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px 24px;margin-top:18px}
.md-acclist div{display:flex;gap:10px;font-size:14px}
.md-acclist div>span:first-child{color:color-mix(in oklab,var(--primary) 80%,var(--text));flex:0 0 auto}
.md-langs{display:flex;flex-wrap:wrap;gap:6px;margin-top:18px}
.md-langs span{font-size:13px;padding:3px 10px;border:1px solid var(--border);border-radius:var(--radius);background:var(--surface)}
.md-train{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.4fr) minmax(0,1fr);gap:32px;align-items:center;padding:22px 0;border-top:1px solid var(--border);margin-top:26px}
.md-train h3{font-size:calc(21px * var(--hs));line-height:1.2;margin-top:4px}
.md-cred{list-style:none;display:grid;gap:4px;font-size:14px}
.md-cred li{display:flex;gap:8px}
.md-cred li>span{color:var(--success);flex:0 0 auto}
.md-slot{border:1.5px dashed color-mix(in oklab,var(--text) 45%,var(--border));border-radius:var(--radius);padding:12px 14px;font-size:13px;font-weight:500;color:var(--muted)}
.md-where{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,.85fr);gap:48px;align-items:start}
.md-locs{display:grid;gap:18px;margin-top:18px}
.md-loc{display:grid;grid-template-columns:180px minmax(0,1fr);gap:22px;align-items:start}
.md-loc .sk-photo{aspect-ratio:4/3;border-radius:var(--radius)}
.md-loc h3{font-size:calc(20px * var(--hs));line-height:1.2}
.md-loc p{font-size:14px;color:var(--muted)}
.md-loc ul{list-style:none;font-size:14px;display:grid;gap:3px;margin-top:6px}
.md-loc li{display:flex;gap:8px;align-items:flex-start;color:var(--muted)}
.md-form{padding:26px;display:grid;gap:12px}
.md-form h2{font-size:calc(26px * var(--hs))}
.md-form .sk-g2{gap:12px}
@media (max-width:1024px){
  .md-hhead{gap:28px}
  .md-tasks{grid-template-columns:repeat(2,minmax(0,1fr))}
  .md-task:nth-child(3n){border-right:1px solid var(--border)}
  .md-task:nth-child(2n){border-right:0}
  .md-task:nth-last-child(-n+3){border-bottom:1px solid var(--border)}
  .md-task:nth-last-child(-n+2){border-bottom:0}
  .md-today,.md-reg,.md-where{grid-template-columns:minmax(0,1fr);gap:40px}
  .md-acc{gap:36px}
  .md-train{grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:18px 28px}
  .md-train>:first-child{grid-column:1/-1}
  .md-topics{grid-template-columns:repeat(2,minmax(0,1fr))}
  .md-dir{column-gap:28px}
}
@media (max-width:760px){
  .md>.sk-sec{padding:40px 0}
  .md-strip .sk-wrap{min-height:34px}
  .md-strip .sk-hide{display:none}
  .md-hero{padding:24px 0}
  .md-hhead{grid-template-columns:minmax(0,1fr);gap:8px;margin-bottom:16px}
  .md-hhead p{font-size:15px!important}
  .md-h1{font-size:calc(38px * var(--hs))}
  .md-tasks{grid-template-columns:minmax(0,1fr)}
  .md-task{padding:12px 14px;gap:2px;border-right:0!important;border-bottom:1px solid var(--border)!important}
  .md-task:last-child{border-bottom:0!important}
  .md-task>p,.md-dl dt{display:none}
  .md-task h2{font-size:calc(17px * var(--hs))}
  .md-ico{width:36px;height:36px}
  .md-dl{display:block;border:0;padding:0;margin:0 0 0 48px;font-size:12.5px;color:var(--muted)}
  .md-dl div{display:inline}
  .md-dl dd{display:inline;font-weight:500}
  .md-dl div+div::before{content:" · "}
  .md-tt{align-items:flex-start}
  .md-tt+p+.md-dl{margin-top:-14px}
  .md-note{align-items:flex-start}
  .md-today{gap:28px}
  .md-times{margin-top:12px;font-size:13px}
  .md-times th:not(:first-child),.md-times td:not(:first-child){white-space:normal;padding-left:10px}
  .md-rung{grid-template-columns:6px minmax(0,1fr);gap:4px 14px;padding:10px 0}
  .md-rung>i{grid-row:span 2}
  .md-rung:not(:first-child) p{display:none}
  .md-chips{flex-wrap:nowrap;overflow-x:auto;margin:0 -20px 14px;padding:0 20px 4px;scrollbar-width:none}
  .md-dir{border-top:0}
  .md-c{grid-template-columns:44px minmax(0,1fr);gap:12px;padding:16px;border:1px solid var(--border);border-radius:var(--radius);background:var(--bg)}
  .md-ava{width:44px;height:44px;font-size:14px}
  .md-dept,.md-dept tr,.md-dept td{display:block;width:100%!important}
  .md-dept thead{display:none}
  .md-dept tbody{display:flex;overflow-x:auto;gap:14px;scroll-snap-type:x mandatory;margin:0 -20px;padding:0 20px 6px;scrollbar-width:none;scroll-padding-inline:20px}
  .md-dept tr{flex:0 0 80%;scroll-snap-align:start;width:80%!important;padding:0 0 0 14px;border-left:3px solid var(--text)}
  .md-dept td{padding:0 0 6px;border:0}
  .md-reg{gap:28px}
  .md-steps p{font-size:13px}
  .md-portal{padding:20px}
  .md-portal>p{display:none}
  .md-acc,.md-where{grid-template-columns:minmax(0,1fr);gap:28px}
  .md-topics{gap:14px}
  .md-acclist{grid-template-columns:minmax(0,1fr);gap:8px}
  .md-acclist div:nth-child(n+5){display:none}
  .md-train{grid-template-columns:minmax(0,1fr);gap:12px;margin-top:24px}
  .md-loc{grid-template-columns:minmax(0,1fr);gap:4px}
  .md-loc .sk-photo{display:none}
  .md-form{padding:20px}
  .md-opt{display:none}
}
</style>`;

// Small street map, fixed natural tones (illustrative artwork).
const map = (id, label, road, side, park) => `<svg viewBox="0 0 420 315" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${label}">
<rect width="420" height="315" fill="#ece9e0"/><rect x="${park ? 250 : 20}" y="${park ? 26 : 180}" width="150" height="104" rx="10" fill="#cfdcbf"/>
<path d="M0 ${park ? 196 : 112}L420 ${park ? 168 : 146}" stroke="#fff" stroke-width="22"/><path d="M${park ? 170 : 262} 0L${park ? 208 : 236} 315" stroke="#fff" stroke-width="16"/><path d="M0 ${park ? 72 : 276}L420 ${park ? 44 : 256}" stroke="#fff" stroke-width="10"/>
<text x="18" y="${park ? 180 : 104}" font-family="sans-serif" font-size="15" fill="#6e6658">${road}</text><text x="${park ? 268 : 36}" y="${park ? 84 : 238}" font-family="sans-serif" font-size="14" fill="#5d6b4f">${side}</text>
<g transform="translate(${park ? 192 : 246} ${park ? 214 : 170})"><path d="M0 0c-15-19-24-32-24-45a24 24 0 0 1 48 0c0 13-9 26-24 45z" fill="#2f7f8a"/><circle cy="-45" r="9" fill="#fff"/></g></svg>`;

const TASKS = [
  ["calendar", "Book an appointment", "Choose a clinician and a time. See us in person, by phone or by video.", "2 minutes", "Confirmed straight away"],
  ["refresh", "Repeat prescription", "Tick the items on your repeat list and choose where to collect them.", "1 minute", "Ready in 2 working days"],
  ["doc", "Test results", "Sign in to see results once a clinician has read them, with a note on any next step.", "1 minute", "Often within 5 working days"],
  ["bolt", "Urgent same-day care", "Call from 8:00 AM or send the short form. A clinician reads each request and rings you back.", "3 minutes", "Call back the same day", "urg"],
  ["users", "Register as a new patient", "Complete the form online, show ID at the desk, then book a welcome check.", "10 minutes", "Confirmed in 3 working days"],
  ["chat", "Ask a question", "Send a message about anything that is not urgent. It goes to the right person in the team.", "2 minutes", "Reply by next working day"],
];
const LADDER = [
  ["--danger", "An emergency", "Anything that feels life threatening or cannot wait.", "In an emergency, call your local emergency number.", ""],
  ["--warning", "It needs a clinician today", "A new problem that should not wait for a routine appointment.", "Call (555) 014-2230 from 8:00 AM", "Or send an urgent request online"],
  ["--accent", "We are closed and it cannot wait", "Evenings after 6:30 PM, overnight, weekends and public holidays.", "After-hours doctor line (555) 014-2299", "A nurse answers and arranges next steps"],
  ["--success", "It can wait a few days", "Routine reviews, forms, referrals and questions about ongoing care.", "Book online or send a message", "Reply by the next working day"],
];
const TEAM = [
  ["NF", "Dr Ngozi Fairweather", "GP partner", "gp women", "Women’s health and menopause care", "Mon, Tue, Thu at Millbrook Road. Next routine visit Tuesday."],
  ["WT", "Wen Tolliver", "Practice nurse", "nurse ltc", "Asthma, diabetes and blood pressure reviews", "Daily at Millbrook Road. Bookable this week."],
  ["YP", "Dr Yusuf Penhallow", "GP partner", "gp ltc", "Diabetes and long-term heart conditions", "Mon to Wed at Tanner’s Row. Next routine visit Monday."],
  ["MO", "Marguerite Oyelaran", "Nurse practitioner", "nurse women", "Cervical screening and contraception", "Tue to Fri at Millbrook Road. Bookable this week."],
  ["IC", "Dr Ines Corvane", "GP", "gp child", "Children’s health and family care", "Wed to Fri at Millbrook Road. Booking about a week ahead.", "lim"],
  ["HB", "Hollis Brandvold", "Children’s nurse", "nurse child", "Baby checks and childhood immunisations", "Mon and Thu at Tanner’s Row. Bookable next week."],
  ["CT", "Dr Callum Thorsby", "GP", "gp", "Minor procedures and men’s health", "Tue and Fri at Tanner’s Row. Booking about two weeks ahead.", "lim"],
  ["AS", "Anneke Sowerby", "Clinical pharmacist", "ltc", "Reviews of repeat medicines", "Phone appointments, Mon to Thu. Bookable this week."],
];
const DEPTS = [
  ["General practice", "Routine and same-day consultations, home visits for housebound patients, talking through low mood or anxiety, referrals to hospital specialists, forms and fit notes.", "GPs, nurse practitioner"],
  ["Women’s health", "Cervical screening, contraception consultations, menopause clinic, antenatal and postnatal checks.", "Dr Fairweather, Marguerite"],
  ["Children and families", "Newborn and six-week baby checks, childhood immunisations, growth and development concerns.", "Dr Corvane, Hollis"],
  ["Long-term conditions", "Annual and six-monthly reviews for diabetes, asthma, COPD, high blood pressure and heart conditions.", "Wen, Anneke, Dr Penhallow"],
  ["Tests and minor procedures", "Blood tests, ECGs, spirometry, ear care, wound care and stitch removal, minor skin procedures.", "Nurses, Dr Thorsby"],
  ["Vaccines and travel", "Seasonal vaccine clinics, routine adult vaccines, travel health appointments.", "Practice nurses"],
];
const STEPS = [
  ["Check your address", "We register people living inside our practice area. Type your postcode in the form to see if you are covered."],
  ["Fill in the form", "About ten minutes online, or ask for a paper copy at either desk. Parents can register children on the same form."],
  ["Show ID at the desk", "Bring photo ID and proof of address. We then request your records from your previous practice."],
  ["Book a welcome check", "A short visit with a nurse to go through your history, current medicines and any upcoming reviews."],
];
const TOPICS = [
  ["Vaccines", "Seasonal vaccines: what to expect", "Who is usually invited, how clinics run, and how to rearrange if you are unwell on the day.", "3 min read"],
  ["Tests", "Preparing for a blood test", "Some tests ask you to fast and some do not. Your booking message says which applies to you.", "2 min read"],
  ["Long-term care", "Getting ready for your annual review", "What a review covers, and why it helps to write down your questions beforehand.", "3 min read"],
  ["Travel", "Planning ahead before you travel", "Why a travel health appointment is worth booking early, and what details to bring with you.", "2 min read"],
];
const ACCESS = [
  ["pin", "Step-free entry and accessible toilets at both sites"],
  ["eye", "Large print and easy-read letters on request"],
  ["bell", "Hearing loops at reception and in consulting rooms"],
  ["clock", "Longer appointments if you need more time"],
  ["lock", "A quiet room if the waiting area is too much"],
  ["users", "A chaperone for any examination, just ask"],
];

const web = (p, st) => K.page(st, `<div class="md-strip"><div class="sk-wrap"><span><i></i>Open today until 6:30 PM</span><span class="sk-hide">In an emergency, call your local emergency number.</span></div></div>
${K.nav(p, ["Appointments", "Clinicians", "Services", "New patients", "Locations"], "Book an appointment", "Patient portal")}
<main class="md">
<section class="md-hero" id="appointments"><div class="sk-wrap">
  <div class="md-hhead"><h1 class="sk-h1 md-h1">What do you need today?</h1><p class="muted" style="font-size:17px">Most things at ${esc(p.name)} can be started here, without waiting on the phone. Pick a task to see how it works and how long it takes.</p></div>
  <div class="card md-tasks" id="book-an-appointment">${TASKS.map(([i, t, d, take, back, c]) => `<a class="md-task ${c || ""}" href="#"><div class="md-tt"><span class="md-ico">${ic(i, 20)}</span><h2>${t}</h2></div><p>${d}</p><dl class="md-dl"><div><dt>Takes about</dt><dd>${take}</dd></div><div><dt>What happens next</dt><dd>${back}</dd></div></dl></a>`).join("")}</div>
  <p class="md-note"><span>${ic("bell", 18)}</span><span><b>In an emergency, call your local emergency number.</b> <span class="muted">Do not use online forms for anything that cannot wait.</span></span></p>
</div></section>

<section class="sk-sec" id="today"><div class="sk-wrap md-today">
  <div><span class="sk-eyebrow">Today, Friday 6 November</span><h2 class="sk-h2" style="margin-top:12px">Opening times</h2>
    <table class="md-times"><thead><tr><th></th><th>Millbrook Road</th><th>Tanner’s Row</th></tr></thead><tbody>${[["Doors", "8:00 AM to 6:30 PM", "8:30 AM to 5:00 PM"], ["Phone lines", "8:00 AM to 6:00 PM", "Shared line"], ["Blood tests", "8:00 to 11:00 AM", "8:30 to 10:30 AM"], ["Saturday", "9:00 AM to noon", "Closed"], ["Sunday, holidays", "Closed", "Closed"]].map(([a, b, c]) => `<tr><td><b>${a}</b></td><td>${b}</td><td>${c}</td></tr>`).join("")}</tbody></table><p class="muted" style="font-size:14px;margin-top:12px">Both sites close for staff training on the last Wednesday afternoon of each month. The after-hours line covers those times.</p></div>
  <div><span class="sk-eyebrow">Urgent care and after hours</span><h2 class="sk-h2" style="margin:12px 0 20px">Not sure where to turn?</h2>
    <div class="md-ladder">${LADDER.map(([c, t, d, act, sub]) => `<div class="md-rung" style="--c:var(${c})"><i></i><div><b>${t}</b><p>${d}</p></div><div class="act">${act}${sub ? `<a href="#">${sub}</a>` : ""}</div></div>`).join("")}</div></div>
</div></section>

<section class="sk-sec sk-alt" id="clinicians"><div class="sk-wrap">
  <div class="sk-head" style="margin-bottom:24px"><div><span class="sk-eyebrow">Clinician directory</span><h2 class="sk-h2">Find the right person to see</h2></div><p class="muted" style="max-width:380px">You can ask for anyone here. For a follow-up, seeing the same clinician usually makes things simpler.</p></div>
  <div class="md-filter">${FILTERS.map(([k, l], i) => `<input class="md-fx" type="radio" name="md-f" id="md-f-${k}" aria-label="Show ${l}"${i ? "" : " checked"}>`).join("")}
    <div class="md-chips" role="group" aria-label="Filter clinicians">${FILTERS.map(([k, l]) => `<label for="md-f-${k}">${l}</label>`).join("")}</div>
    <div class="md-dir sk-rail">${TEAM.map(([a, n, r, f, int, av, lim]) => `<article class="md-c ${f}"><span class="md-ava">${a}</span><div><h3>${n}</h3><div class="role">${r}</div><div class="int">${int}</div><div class="md-av ${lim || ""}"><i></i><span>${av}</span></div></div></article>`).join("")}</div>
  </div>
</div></section>

<section class="sk-sec" id="services"><div class="sk-wrap">
  <div class="sk-head" style="margin-bottom:22px"><div><span class="sk-eyebrow">Services by department</span><h2 class="sk-h2">What we look after here</h2></div><p class="muted" style="max-width:380px">If you need something we do not offer, we refer you and explain what happens next.</p></div>
  <table class="md-dept"><thead><tr><th>Department</th><th>What it includes</th><th>Who you will usually see</th></tr></thead><tbody>${DEPTS.map(([d, s, w]) => `<tr><td><h3>${d}</h3></td><td>${s}</td><td>${w}</td></tr>`).join("")}</tbody></table>
</div></section>

<section class="sk-sec sk-alt" id="new-patients"><div class="sk-wrap md-reg">
  <div><span class="sk-eyebrow">New patients</span><h2 class="sk-h2" style="margin-top:12px">Registering with us, in four steps</h2>
    <ol class="md-steps">${STEPS.map(([t, d], i) => `<li><span class="num">${i + 1}</span><div><b>${t}</b><p>${d}</p></div></li>`).join("")}</ol>
    <a class="btn primary" style="height:42px" href="#">Start registration ${ic("arrow", 16)}</a></div>
  <form class="card md-portal" id="patient-portal" aria-label="Patient portal sign-in"><span class="sk-eyebrow">Patient portal</span><h2>Sign in</h2>
    <ul>${["Book and cancel", "Order repeats", "See test results", "Message the team"].map((t) => `<li>${ic("check", 14)}${t}</li>`).join("")}</ul>
    <div class="sk-field"><label for="md-user">Email or patient number</label><input class="sk-input" id="md-user" value="teodora.ruiz@mail.example"></div>
    <div class="sk-field"><label for="md-pass">Password</label><input class="sk-input" id="md-pass" type="password" value="sample-only"></div>
    <button class="btn primary block" type="button">Sign in securely ${ic("lock", 14)}</button>
    <p class="muted" style="font-size:13px">First time here? <a href="#" style="text-decoration:underline">Set up access</a> with the code from your welcome letter. Parents and carers can ask for linked access.</p></form>
</div></section>

<section class="sk-sec sk-alt" id="health-topics"><div class="sk-wrap">
  <div class="sk-head" style="margin-bottom:24px"><div><span class="sk-eyebrow">Health topics</span><h2 class="sk-h2">Good to know</h2></div><p class="md-disc">General information. Your own clinician can tell you what applies to you.</p></div>
  <div class="md-topics sk-rail">${TOPICS.map(([g, t, d, m]) => `<a class="md-topic" href="#"><span class="tag">${g} · ${m}</span><h3>${t}</h3><p>${d}</p></a>`).join("")}</div>
</div></section>

<section class="sk-sec" id="access"><div class="sk-wrap"><div class="md-acc">
  <div><span class="sk-eyebrow">Accessibility and languages</span><h2 class="sk-h2" style="margin-top:12px">Tell us what would make a visit easier</h2>
    <div class="md-acclist">${ACCESS.map(([i, t]) => `<div><span>${ic(i, 18)}</span><span>${t}</span></div>`).join("")}</div>
    <div class="md-langs">${["Spanish", "Polish", "Arabic", "Urdu", "Mandarin", "Portuguese", "Sign language"].map((l) => `<span>${l}</span>`).join("")}</div>
    <p class="muted" style="font-size:13px;margin-top:8px">Interpreters are free. Ask when you book.</p></div>
  <div class="md-pay" id="plans"><span class="sk-eyebrow">Plans and payment</span><h2 class="sk-h2" style="margin-top:12px">Costs, explained before your visit</h2>
    <dl>${[["With a health plan", "We work with most major health plans and send the claim for you. Plans change often, so call the desk and we will check yours."], ["Paying for yourself", "Ask for a written estimate first. We bill after your visit and you can pay online, by card or at the desk."], ["If cost is a worry", "Talk to our patient services team in confidence. Payment plans and help with forms are available."]].map(([t, d]) => `<div><dt>${t}</dt><dd>${d}</dd></div>`).join("")}</dl></div></div>
  <div class="md-train"><div><span class="sk-eyebrow">Training and registration</span><h3>Who looks after you</h3></div>
    <ul class="md-cred">${["Specialist training in general practice", "Advanced clinical training for nurse practitioners", "Regular clinical audit and peer review"].map((t) => `<li><span>${ic("check", 16)}</span>${t}</li>`).join("")}</ul>
    <div class="md-slot">Add your registration and accreditation details here</div></div>
</div></section>

<section class="sk-sec sk-alt" id="locations"><div class="sk-wrap md-where">
  <div><span class="sk-eyebrow">Locations</span><h2 class="sk-h2" style="margin-top:12px">Two sites, one set of records</h2>
    <div class="md-locs">
      <article class="md-loc"><div class="sk-photo">${map("a", "Street map showing the practice on Millbrook Road beside Hazel Park", "Millbrook Road", "Hazel Park", true)}</div><div><h3>Millbrook Road</h3><p>41 Millbrook Road. Main site, with the nurses’ clinic and blood test room.</p><ul><li>${ic("clock", 14)}Mon to Fri 8:00 AM to 6:30 PM, Sat 9:00 AM to noon</li><li>${ic("pin", 14)}Parking behind the building</li></ul></div></article>
      <article class="md-loc"><div class="sk-photo">${map("b", "Street map showing the practice on Tanner’s Row near Weir Green", "Tanner’s Row", "Weir Green", false)}</div><div><h3>Tanner’s Row</h3><p>7 Tanner’s Row. Smaller and quieter, with a children’s clinic twice a week.</p><ul><li>${ic("clock", 14)}Mon to Fri 8:30 AM to 5:00 PM</li><li>${ic("pin", 14)}Bus stop outside, street parking</li></ul></div></article>
    </div></div>
  <form class="card md-form" id="contact" aria-label="Contact the practice"><h2>Contact us</h2><p class="muted" style="font-size:14px">Call (555) 014-2230 or email hello@marrowfieldmedical.example. This form is for non-urgent questions and is read within one working day.</p>
    <div class="sk-g2"><div class="sk-field"><label for="md-name">Your name</label><input class="sk-input" id="md-name" value="Sam Achebe"></div><div class="sk-field"><label for="md-dob">Date of birth</label><input class="sk-input" id="md-dob" value="14 March 1986"></div></div>
    <div class="sk-field md-opt"><label for="md-about">What is it about?</label><select class="sk-input" id="md-about"><option>Appointments</option><option>Prescriptions</option><option>Forms and letters</option></select></div>
    <div class="sk-field"><label for="md-msg">Your message</label><textarea class="sk-input" id="md-msg" rows="2">Can I move my review to the Tanner’s Row site next month?</textarea></div>
    <button class="btn primary sk-btn-lg" type="button">Send message</button></form>
</div></section>
</main>
${K.footer(p, "Primary care for all ages, at Millbrook Road and Tanner’s Row.", [["Find us", ["41 Millbrook Road", "7 Tanner’s Row", "Practice area map"]], ["Contact", ["(555) 014-2230", "After hours (555) 014-2299", "hello@marrowfieldmedical.example"]], ["Patients", ["Patient portal", "Register with us", "Practice policies", "Feedback and complaints"]]], "Fictional practice created for this template. General information only, not medical advice.")}`, CSS);

module.exports = {
  "medical-website": K.def("medical", "Medical practice website",
    "a task-first primary care practice home page: an opening-status strip, navigation with patient portal and booking buttons, a what-do-you-need-today hero panel of six tasks each with how it works and how long it takes, today’s opening times beside an urgent and after-hours routing ladder, a clinician directory with working filter chips and availability wording, services by department in a table, new patient registration steps beside a patient portal sign-in card, plans and payment wording, general health topic articles, accessibility and languages with a training and registration slot, two locations with street maps, a contact form and a footer",
    ["navigation-header", "status-strip", "task-panel", "opening-hours", "urgent-care-routing", "directory", "filter-chips", "services-table", "steps", "login-card", "patient-portal", "payment-info", "articles", "accessibility", "credentials", "locations", "map", "contact-form", "footer", "medical"], web),
};
