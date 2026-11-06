/* Cardiology practice website template (Quillon Heart, fictional outpatient cardiology practice). Full responsive home page:
   emergency strip, nav, a hero that splits patients and referring clinicians into two paths, an A to Z index of what the practice
   sees, a tests and procedures table, first appointment guide, rapid access clinic explainer, a dark clinician band with the
   referral pathway, cardiologist profiles with a credentials slot, locations and a booking form. No outcome claims, no reviews.
   The clinician half of the page is always the inverted (feat) tone, so the two audiences can be told apart while scrolling. */
const { ic, esc } = require("../lib");
const K = require("../sitekit");

const CSS = `<style>
.qh>.sk-sec{padding:54px 0}
.qh-sos{background:var(--danger);color:var(--on-danger);font-size:14px;font-weight:500}
.qh-sos .sk-wrap{display:flex;align-items:center;gap:10px;padding-top:9px;padding-bottom:9px}
.qh-sos svg{flex:0 0 auto}
.qh-hero{padding:44px 0 52px}
.qh-top{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,1fr);gap:56px;align-items:end}
.qh-trace{overflow:hidden;height:56px;margin-top:6px}
.qh-trace svg{display:block;width:1104px;max-width:none;height:56px}
.qh-trace path{fill:none;stroke:var(--primary);stroke-width:2;stroke-linejoin:round;stroke-linecap:round}
.qh-doors{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px}
.qh-door{padding:28px 30px;display:grid;gap:14px;grid-template-rows:auto auto 1fr auto}
.qh h1,.qh h2{text-wrap:balance}
.qh-door h2{font-size:calc(28px * var(--hs));line-height:1.15}
.qh-door.feat{background:var(--text);color:var(--bg);border-color:var(--text)}
.qh-door.feat .sk-eyebrow{color:color-mix(in oklab,var(--bg) 74%,var(--text))}
.qh-door ul{list-style:none;display:grid}
.qh-door li a{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:0 12px;align-items:center;padding:9px 0;border-top:1px solid var(--border);font-weight:600}
.qh-door li a>svg{grid-row:span 2}
.qh-door li small{font-size:13px;font-weight:400;color:var(--muted);grid-column:1}
.qh-door.feat li a{border-color:color-mix(in oklab,var(--bg) 24%,var(--text))}
.qh-door.feat li small{color:color-mix(in oklab,var(--bg) 72%,var(--text))}
.qh-az{display:grid;grid-template-columns:repeat(26,minmax(0,1fr));border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;margin-bottom:28px}
.qh-az span,.qh-az a{height:38px;display:grid;place-items:center;font:600 13px var(--font-b);border-right:1px solid var(--border);color:color-mix(in oklab,var(--muted) 62%,var(--bg))}
.qh-az>:last-child{border-right:0}
.qh-az a{background:color-mix(in oklab,var(--primary) 12%,var(--bg));color:var(--text)}
.qh-index{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:0 36px}
.qh-entry{display:grid;grid-template-columns:28px minmax(0,1fr);gap:0 8px;padding:12px 0;border-top:1px solid var(--border)}
.qh-entry>b{font:600 calc(22px * var(--hs))/1.1 var(--font-h);color:color-mix(in oklab,var(--primary) 82%,var(--text))}
.qh-entry h3{font:600 16px/1.3 var(--font-b)}
.qh-entry p{font-size:14px;color:var(--muted);line-height:1.45}
.qh-entry small{display:block;margin-top:3px;font-size:12.5px;font-weight:500}
.qh-tests{background:var(--bg);border:1px solid var(--border);border-radius:var(--radius-lg);overflow:hidden}
.qh-tests table{width:100%;border-collapse:collapse;font-size:14px;line-height:1.45}
.qh-tests th,.qh-tests td{text-align:left;vertical-align:top;padding:11px 18px;border-bottom:1px solid var(--border)}
.qh-tests thead th{font:600 12px/1.3 var(--font-b);letter-spacing:.06em;text-transform:uppercase;color:var(--muted);background:var(--surface)}
.qh-tests tbody tr:last-child>*{border-bottom:0}
.qh-tests tbody th{font:600 15px/1.3 var(--font-b);width:22%}
.qh-tests tbody th small{display:block;font-weight:500;font-size:12.5px;color:var(--muted);margin-top:3px}
.qh-tests td:nth-child(3){width:14%;white-space:nowrap}
.qh-tests td:nth-child(2){width:32%}
.sk-head.qh-wide>div:first-child{max-width:none}
.qh-fixed{flex:0 0 340px}
.qh-note{display:flex;gap:10px;margin-top:14px;font-size:14px;color:var(--muted)}
.qh-note svg{flex:0 0 auto;margin-top:2px}
.qh-first{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);gap:56px;align-items:start}
.qh-bring{list-style:none;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 28px;margin-top:22px}
.qh-bring li{display:grid;grid-template-columns:22px minmax(0,1fr);gap:12px;padding:13px 0;border-top:1px solid var(--border);font-size:14px;line-height:1.45}
.qh-bring li>i{width:20px;height:20px;border:1.5px solid var(--text);border-radius:var(--radius-sm);margin-top:1px}
.qh-bring b{display:block;font-size:15px}
.qh-hour{padding:28px;display:grid;gap:16px}
.qh-bar{display:grid;grid-template-columns:1fr 2fr 1fr;gap:3px;height:44px}
.qh-bar i{display:block;border-radius:var(--radius-sm)}
.qh-bar i:nth-child(1){background:color-mix(in oklab,var(--primary) 34%,var(--surface))}
.qh-bar i:nth-child(2){background:var(--primary)}
.qh-bar i:nth-child(3){background:color-mix(in oklab,var(--primary) 58%,var(--surface))}
.qh-hourlist{display:grid;gap:12px;font-size:14px}
.qh-hourlist div{display:grid;grid-template-columns:64px minmax(0,1fr);gap:12px;line-height:1.45}
.qh-hourlist .num{font-size:14px;padding-top:1px}
.qh-rapid{display:grid;grid-template-columns:minmax(0,.8fr) minmax(0,1.6fr);gap:56px;align-items:start}
.qh-rapid-g{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px 36px}
.qh-rapid-g div{display:grid;gap:4px;padding-top:12px;border-top:2px solid var(--text);font-size:14px;line-height:1.5}
.qh-rapid-g b{font-size:15px}
.qh-rapid-g p{color:var(--muted)}
.qh-ref{background:var(--text);color:var(--bg);padding:58px 0}
.qh-ref .sk-eyebrow{color:color-mix(in oklab,var(--bg) 74%,var(--text))}
.qh-ref .sk-head p{color:color-mix(in oklab,var(--bg) 76%,var(--text))}
.qh-path{list-style:none;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:0;margin-bottom:30px;border-top:1px solid color-mix(in oklab,var(--bg) 30%,var(--text))}
.qh-path li{position:relative;padding:20px 28px 0 0;display:grid;gap:4px;font-size:14px;line-height:1.5}
.qh-path li::before{content:"";position:absolute;top:-6px;left:0;width:11px;height:11px;border-radius:50%;background:var(--bg)}
.qh-path b{font:600 calc(19px * var(--hs))/1.25 var(--font-h)}
.qh-path p,.qh-ref-col li,.qh-tri p{color:color-mix(in oklab,var(--bg) 76%,var(--text))}
.qh-ref-g{display:grid;grid-template-columns:minmax(0,2fr) minmax(0,1.08fr);gap:36px;align-items:start}
.qh-ref-two{display:grid;grid-template-columns:minmax(0,.8fr) minmax(0,1fr);gap:36px;align-items:start}
.qh-ref-col h3,.qh-tri h3{font:600 15px var(--font-b);margin-bottom:10px;color:var(--bg)}
.qh-ref-col ul{list-style:none;display:grid;gap:9px;font-size:14px;line-height:1.45}
.qh-ref-col li{display:grid;grid-template-columns:18px minmax(0,1fr);gap:8px}
.qh-tri>div{padding:13px 0;border-top:1px solid color-mix(in oklab,var(--bg) 26%,var(--text));font-size:14px;line-height:1.45;display:grid;gap:3px}
.qh-tri .qh-lv{display:flex;flex-wrap:wrap;justify-content:space-between;gap:2px 12px;font-weight:600;color:var(--bg)}
.qh-tri .qh-lv span{font-weight:500;color:color-mix(in oklab,var(--bg) 76%,var(--text));font-size:13px}
.qh-portal{padding:24px;display:grid;gap:12px;background:var(--surface);color:var(--text)}
.qh-portal h3{font:600 calc(19px * var(--hs))/1.2 var(--font-h);display:flex;gap:8px;align-items:center}
.qh-portal .sk-input{height:42px}
.qh-attach{display:flex;align-items:center;gap:8px;font-size:13px;padding:9px 12px;border:1px dashed var(--border);border-radius:var(--radius)}
.qh-commit{display:grid;gap:5px;max-width:420px;font-size:14px}
.qh-commit .num{display:flex;align-items:center;gap:8px;font-size:22px;margin-top:6px}
.qh-acute{display:flex;gap:10px;align-items:center;margin-top:24px;font-size:14px;color:color-mix(in oklab,var(--bg) 80%,var(--text))}
.qh-acute svg{flex:0 0 auto}
.qh-docs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 40px;border-top:1px solid var(--border)}
.qh-doc{display:grid;grid-template-columns:72px minmax(0,1fr);gap:18px;align-items:start;padding:18px 0;border-bottom:1px solid var(--border)}
.qh-face{width:72px;height:72px;border-radius:50%;overflow:hidden}
.qh-face svg{display:block;width:100%;height:100%}
.qh-doc p{font-size:14px;color:var(--muted);line-height:1.45}
.qh-doc .sk-h3{font-size:calc(19px * var(--hs))}
.qh-who{display:flex;flex-wrap:wrap;align-items:center;gap:2px 10px;margin-bottom:2px}
.qh-slot{margin-top:20px;padding:14px 18px;border:1.5px dashed var(--muted);border-radius:var(--radius);font-size:14px;color:var(--muted);display:flex;gap:10px;align-items:center}
.qh-slot svg{flex:0 0 auto}
.qh-visit{display:grid;grid-template-columns:minmax(0,.92fr) minmax(0,1.08fr);gap:40px;align-items:start}
.qh-loc{padding:18px 0;border-top:1px solid var(--border);display:grid;gap:6px;font-size:14px}
.qh-loc h3{font-size:calc(19px * var(--hs))}
.qh-loc p{color:var(--muted);line-height:1.5}
.qh-tags{display:flex;flex-wrap:wrap;gap:6px;margin-top:4px}
.qh-tags span{font-size:12.5px;font-weight:500;padding:3px 9px;border:1px solid var(--border);border-radius:var(--radius);background:var(--bg)}
.qh-form{padding:28px;display:grid;gap:12px}
.qh-form .sk-g2{gap:14px}
.qh-radio{display:flex;flex-wrap:wrap;gap:8px}
.qh-radio label{height:40px;padding:0 13px;border:1px solid var(--border);border-radius:var(--radius);display:inline-flex;align-items:center;gap:8px;font-size:14px;font-weight:500;background:var(--bg)}
.qh-radio label.on{border-color:var(--primary);box-shadow:inset 0 0 0 1px var(--primary)}
@media (max-width:1024px){
  .sk-navend .btn:not(.primary){display:none}
  .qh-top{grid-template-columns:minmax(0,1fr);gap:16px}
  .qh-ref-g{grid-template-columns:minmax(0,1fr)}
  .qh-first,.qh-rapid{gap:36px}
  .qh-rapid{grid-template-columns:minmax(0,1fr)}
}
@media (max-width:860px){
  .qh .sk-head{flex-direction:column;align-items:flex-start;gap:10px}
  .qh-fixed{flex:none}
  .qh-first,.qh-visit{grid-template-columns:minmax(0,1fr)}
  .qh-tests td:nth-child(3){white-space:normal}
}
@media (max-width:760px){
  .qh>.sk-sec,.qh-ref{padding:52px 0}
  .qh-sos{font-size:13px}
  .qh-sos .sk-wrap{align-items:flex-start}
  .qh-hero{padding:32px 0 44px}
  .qh-trace{height:44px;margin-top:6px}
  .qh-trace svg{height:44px;width:867px}
  .qh-doors{grid-template-columns:minmax(0,1fr);gap:14px}
  .qh-door{padding:22px}
  .qh-door li small{display:none}
  .qh-az{grid-template-columns:repeat(13,minmax(0,1fr));margin-bottom:18px}
  .qh-az span,.qh-az a{height:30px;font-size:12px}
  .qh-az>:nth-child(13){border-right:0}
  .qh-entry{padding:10px 0}
  .qh-entry p{font-size:13.5px}
  .qh-tests{background:none;border:0;border-radius:0;overflow:visible}
  .qh-tests table{display:block}
  .qh-tests thead{display:none}
  .qh-tests tbody{align-items:stretch}
  .qh-tests tr{display:block;background:var(--bg);border:1px solid var(--border);border-radius:var(--radius-lg);padding:6px 0}
  .qh-tests th,.qh-tests td{display:block;width:auto!important;border-bottom:0;padding:7px 18px;white-space:normal!important}
  .qh-tests tbody th{font-size:17px;padding-top:12px}
  .qh-tests td::before{content:attr(data-l);display:block;font:600 11px/1.5 var(--font-b);letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
  .qh-bring{grid-template-columns:minmax(0,1fr);margin-top:14px}
  .qh-bring li{padding:9px 0}
  .qh-bring .muted{display:none}
  .qh-hour{padding:22px}
  .qh-rapid{gap:20px}
  .qh-path{border-top:0;border-left:1px solid color-mix(in oklab,var(--bg) 30%,var(--text));grid-template-columns:minmax(0,1fr);margin-bottom:28px;margin-left:5px}
  .qh-path li{padding:0 0 18px 20px}
  .qh-path li:last-child{padding-bottom:0}
  .qh-path li::before{top:4px;left:-6px}
  .qh-ref-g{gap:22px}
  .qh-portal{padding:20px}
  .qh-commit .num{font-size:20px}
  .qh-path p{font-size:13.5px}
  .qh-docs{border-top:0}
  .qh-doc{grid-template-columns:minmax(0,1fr);gap:10px;padding:18px;border:1px solid var(--border);border-radius:var(--radius-lg);background:var(--surface)}
  .qh-slot{margin-top:14px}
  .qh-visit{gap:28px}
  .qh-form{padding:22px}
  .qh-form .sk-g2{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
  .qh-side{display:none}
  .qh-tags span:nth-child(n+4){display:none}
  .sk-foot-grid>:last-child{grid-column:1/-1}
  .qh-help{display:none}
}
</style>`;

// ---- illustrative pieces ----------------------------------------------------------------------------------------
const BEAT = "h14q7 -10 14 0h10l5 5l7 -40l8 48l6 -13h14q10 -14 20 0";
const trace = () => `<svg viewBox="0 0 1104 56" aria-hidden="true"><path d="M0 38${Array.from({ length: 6 }, () => `h86${BEAT}`).join("")}h86"/></svg>`;
const face = (id, skin, hair, coat, shape) => `<svg viewBox="0 0 120 120" role="img" aria-label="Portrait of a clinician"><defs><linearGradient id="qh-f${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e4eaea"/><stop offset="1" stop-color="#c8d4d6"/></linearGradient></defs>
<rect width="120" height="120" fill="url(#qh-f${id})"/><path d="M14 120c3-30 22-44 46-44s43 14 46 44z" fill="${coat}"/><path d="M50 78l10 18 10-18z" fill="#f4f4f0"/><rect x="51" y="62" width="18" height="20" fill="${skin}"/><ellipse cx="60" cy="50" rx="22" ry="26" fill="${skin}"/>${shape === "long" ? `<path d="M36 72c-6-34 6-52 24-52s30 18 24 52c-3-14-6-24-10-30-8 4-22 6-30 4-4 8-6 16-8 26z" fill="${hair}"/>` : `<path d="M38 46c0-20 11-30 23-30s23 9 22 30c-5-11-15-15-23-15s-17 4-22 15z" fill="${hair}"/>`}</svg>`;

// ---- content ----------------------------------------------------------------------------------------------------
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const INDEX = [
  ["A", "Atrial fibrillation", "An irregular heart rhythm, new or long-standing.", "ECG, Holter monitor"],
  ["B", "Blackouts and fainting", "Losing consciousness, or feeling close to it.", "ECG, Holter monitor"],
  ["B", "Breathlessness", "Getting short of breath more easily than you used to.", "ECG, echocardiogram"],
  ["C", "Chest discomfort", "Tightness or pressure, with activity or at rest.", "ECG, stress test"],
  ["F", "Family history reviews", "Close relatives with heart conditions at a young age.", "ECG, echocardiogram"],
  ["H", "Heart failure", "Ongoing care when the heart is not pumping as it should.", "Echocardiogram"],
  ["H", "Heart murmurs", "A sound heard at a routine check that needs a closer look.", "Echocardiogram"],
  ["H", "Heart valve conditions", "Narrowed or leaking valves, reviewed over time.", "Echocardiogram"],
  ["H", "High blood pressure", "Including readings that are hard to bring under control.", "Ambulatory blood pressure"],
  ["P", "Palpitations", "A racing, fluttering or pounding heartbeat, or skipped beats.", "Holter monitor"],
  ["P", "Pre-operative heart checks", "A review before planned surgery, at your surgeon’s request.", "ECG, echocardiogram"],
  ["R", "Risk reviews", "Blood pressure, cholesterol and family history together.", "ECG, bloods review"],
];
const ACTIVE = new Set(INDEX.map((e) => e[0]));
const entry = ([l, t, d, s], i) => `<article class="qh-entry"${INDEX.findIndex((e) => e[0] === l) === i ? ` id="qh-${l.toLowerCase()}"` : ""}><b>${i % 4 === 0 || INDEX[i - 1][0] !== l ? l : ""}</b><div><h3>${t}</h3><p>${d}</p><small>Often starts with: ${s}</small></div></article>`;

const TESTS = [
  ["ECG", "Electrocardiogram", "Records the heart’s electrical activity through small stickers on the chest, arms and legs.", "10 minutes", "No special preparation. A top that opens at the front helps."],
  ["Echocardiogram", "Heart ultrasound", "Uses ultrasound to look at the heart’s structure and movement.", "30 to 45 minutes", "Eat and drink as normal. A gown is provided."],
  ["Exercise stress test", "Treadmill test", "Records your ECG and blood pressure as you walk at a rising pace.", "45 to 60 minutes", "Comfortable shoes and clothes. Your letter covers food, drink and medicines."],
  ["Holter monitor", "24 hour to 7 day recorder", "A small recorder worn at home that tracks heart rhythm through daily life.", "15 minute fitting", "A loose top. Keep the short diary we give you, then return the recorder."],
  ["Ambulatory blood pressure", "24 hour monitor", "A cuff worn for a day and night that takes regular readings.", "15 minute fitting", "A loose sleeve. Go about a normal day and note when you sleep and wake."],
  ["Cardiac CT", "By referral, at a partner imaging centre", "A scan that builds detailed pictures of the heart and its arteries.", "About 1 hour", "The imaging centre sends instructions on food, drink and caffeine."],
];

const BRING = [
  ["Your referral letter", "If you have one. You can still book without it."],
  ["A list of current medicines", "Or bring the boxes, including anything you buy yourself."],
  ["Past test results", "ECGs, scans or letters from other hospitals."],
  ["Home readings", "Blood pressure notes or pulse recordings, if you keep them."],
  ["Notes on your symptoms", "When they happen, how long they last, what you were doing."],
  ["Someone to come with you", "Welcome in the room, and useful for a second pair of ears."],
];

const TEAM = [
  ["1", "#c58c63", "#241a14", "#2f4a57", "long", "Dr Anneke Varrow", "Consultant cardiologist", "Imaging", "Specialist training in cardiology. Fellowship in echocardiography.", "Mon, Wed and Thu at Tamsin Row"],
  ["2", "#e3b692", "#5a4030", "#3d4f5c", "short", "Dr Rafael Ostrand", "Consultant cardiologist", "Rhythm", "Specialist training in cardiology. Fellowship in heart rhythm care.", "Tue and Fri at Tamsin Row"],
  ["3", "#8f5c3d", "#171210", "#35505a", "long", "Dr Meera Thackwell", "Consultant cardiologist", "Heart failure", "Specialist training in cardiology. Advanced training in heart failure care.", "Mon and Thu at Orrel Gate"],
  ["4", "#efc6a5", "#a0733f", "#54707a", "short", "Lena Dorvall", "Lead cardiac physiologist", "Tests and monitoring", "Degree in cardiac physiology. Further training in echocardiography.", "Runs the test suite, Mon to Sat"],
];

const web = (p, st) => K.page(st, `<div class="qh-sos" role="note"><div class="sk-wrap">${ic("bell", 16)}<span>Chest pain, severe breathlessness or collapse? In an emergency, call your local emergency number.</span></div></div>
${K.nav(p, ["What we see", "Tests", "Refer a patient", "Cardiologists", "Locations"], "Book an appointment", "Clinician line")}
<main class="qh">
<section class="qh-hero" id="top"><div class="sk-wrap">
  <div class="qh-top">
    <div class="sk-stack" style="gap:14px"><span class="sk-eyebrow">Outpatient cardiology · Tamsin Row and Orrel Gate</span><h1 class="sk-h1">One heart team, two ways in</h1></div>
    <p class="sk-lede">${esc(p.name)} is an outpatient cardiology practice. Patients can book directly. GPs and other clinicians can refer through a pathway that a cardiologist reads every working day.</p>
  </div>
  <div class="qh-trace">${trace()}</div>
  <div class="qh-doors">
    <article class="card qh-door"><span class="sk-eyebrow">I’m a patient</span><h2>Book a visit, or find out what to expect</h2>
      <ul>${[["What we see", "Symptoms and conditions, A to Z", "#what-we-see"], ["Tests and procedures", "What each one involves and how to prepare", "#tests"], ["Your first appointment", "What to bring and how the hour goes", "#first-visit"]].map(([t, d, h]) => `<li><a href="${h}"><span>${t}</span>${ic("chevron", 16)}<small>${d}</small></a></li>`).join("")}</ul>
      <div class="sk-row"><a class="btn primary sk-btn-lg" href="#book-an-appointment">Book an appointment</a><a class="btn sk-btn-lg" href="#">${ic("phone", 16)} (555) 014-2230</a></div></article>
    <article class="card feat qh-door"><span class="sk-eyebrow">I’m a referring clinician</span><h2>Send a referral, or talk to the duty cardiologist</h2>
      <ul>${[["Referral pathway", "What to send and how we triage it", "#refer-a-patient"], ["Rapid access clinic", "For new symptoms that need a prompt look", "#rapid-access"], ["Clinician line", "Weekdays 8:00 AM to 6:00 PM", "#refer-a-patient"]].map(([t, d, h]) => `<li><a href="${h}"><span>${t}</span>${ic("chevron", 16)}<small>${d}</small></a></li>`).join("")}</ul>
      <div class="sk-row"><a class="btn primary sk-btn-lg" href="#refer-a-patient">Refer a patient</a><a class="btn sk-btn-lg" href="#">${ic("phone", 16)} (555) 014-2290</a></div></article>
  </div>
</div></section>

<section class="sk-sec sk-alt" id="what-we-see"><div class="sk-wrap">
  <div class="sk-head qh-wide" style="margin-bottom:28px"><div><span class="sk-eyebrow">What we see</span><h2 class="sk-h2">Conditions and symptoms, A to Z</h2></div><p class="muted qh-side qh-fixed" style="max-width:340px">Not sure which one fits? Describe what you’ve noticed on the booking form and we’ll match you to the right clinic.</p></div>
  <nav class="qh-az" aria-label="Jump to a letter">${LETTERS.map((l) => (ACTIVE.has(l) ? `<a href="#qh-${l.toLowerCase()}">${l}</a>` : `<span>${l}</span>`)).join("")}</nav>
  <div class="qh-index sk-rail">${[0, 4, 8].map((n) => `<div>${INDEX.slice(n, n + 4).map((e, i) => entry(e, n + i)).join("")}</div>`).join("")}</div>
</div></section>

<section class="sk-sec" id="tests"><div class="sk-wrap">
  <div class="sk-head qh-wide" style="margin-bottom:24px"><div><span class="sk-eyebrow">Tests and procedures</span><h2 class="sk-h2">What each test is, and how to get ready</h2></div></div>
  <div class="qh-tests"><table><thead><tr><th scope="col">Test</th><th scope="col">What it is</th><th scope="col">How long</th><th scope="col">Getting ready</th></tr></thead>
    <tbody class="sk-rail">${TESTS.map(([t, a, w, l, g]) => `<tr><th scope="row">${t}<small>${a}</small></th><td data-l="What it is">${w}</td><td data-l="How long">${l}</td><td data-l="Getting ready">${g}</td></tr>`).join("")}</tbody></table></div>
  <p class="qh-note">${ic("doc", 16)}<span>This is a general guide. Your appointment letter has the instructions for your own test, including anything about your usual medicines. If the two differ, follow the letter.</span></p>
</div></section>

<section class="sk-sec sk-alt" id="first-visit"><div class="sk-wrap qh-first">
  <div><span class="sk-eyebrow">Your first appointment</span><h2 class="sk-h2" style="margin-top:12px">What to bring</h2>
    <ul class="qh-bring">${BRING.map(([t, d]) => `<li><i aria-hidden="true"></i><span><b>${t}</b><span class="muted">${d}</span></span></li>`).join("")}</ul></div>
  <aside class="card qh-hour" aria-label="How a first appointment is usually spent"><h3 class="sk-h3">How the hour usually goes</h3>
    <div class="qh-bar" aria-hidden="true"><i></i><i></i><i></i></div>
    <div class="qh-hourlist"><div><span class="num">15 min</span><span>Check-in, blood pressure and an ECG with a physiologist.</span></div><div><span class="num">30 min</span><span>Time with your cardiologist to go through your history, an examination and your questions.</span></div><div><span class="num">15 min</span><span>Next steps, booking any tests, and a letter sent to your usual doctor.</span></div></div></aside>
</div></section>

<section class="sk-sec" id="rapid-access"><div class="sk-wrap qh-rapid">
  <div class="sk-stack" style="gap:10px"><span class="badge">By clinician referral</span><h2 class="sk-h2">The rapid access clinic</h2><p class="muted">A clinic for people whose doctor would like them seen promptly for new symptoms, with tests and a cardiologist in one visit.</p></div>
  <div class="qh-rapid-g sk-rail">
    <div><b>Who it’s for</b><p>People with recent symptoms such as exertional chest discomfort, referred by a GP or another clinician.</p></div>
    <div><b>What happens on the day</b><p>An ECG, blood pressure, an assessment with a cardiologist and any tests that can be done in the same visit.</p></div>
    <div><b>How long to allow</b><p>Plan for a morning or an afternoon. You’ll leave knowing what happens next, and your doctor gets a letter.</p></div>
    <div><b>What it is not</b><p>An emergency service. If symptoms are severe or happening now, call your local emergency number.</p></div>
  </div>
</div></section>

<section class="qh-ref feat" id="refer-a-patient"><div class="sk-wrap">
  <div class="sk-head" style="margin-bottom:34px"><div><span class="sk-eyebrow">For GPs and referring clinicians</span><h2 class="sk-h2">Refer a patient</h2></div><div class="qh-commit"><p>Our commitment: every referral is read by the duty cardiologist, and we aim to confirm the triage decision to you within one working day.</p><div class="num">${ic("phone", 18)} (555) 014-2290</div><p>Clinician line, weekdays 8:00 AM to 6:00 PM</p></div></div>
  <ol class="qh-path">
    <li><b>You send</b><p>Through the secure portal, with your clinical question and any recent results.</p></li>
    <li><b>We triage</b><p>The duty cardiologist reads the referral and sets its priority, or replies with written advice.</p></li>
    <li><b>We reply, then book</b><p>You hear the outcome from us. We contact your patient directly with a date.</p></li>
  </ol>
  <div class="qh-ref-g"><div class="qh-ref-two sk-rail">
    <div class="qh-ref-col"><h3>What to send</h3><ul>${["Your clinical question, in a line or two", "Recent ECG, if you have one", "Blood results and any imaging", "Current medicines and allergies", "Relevant history and frailty", "Language, access or capacity needs"].map((t) => `<li>${ic("check", 16)}<span>${t}</span></li>`).join("")}</ul></div>
    <div class="qh-tri"><h3>How urgent referrals are triaged</h3>
      <div><span class="qh-lv">Rapid access <span>Next rapid access clinic</span></span><p>New symptoms that need a prompt look.</p></div>
      <div><span class="qh-lv">Urgent <span>Offered within two weeks</span></span><p>A worsening known condition, or a result of concern.</p></div>
      <div><span class="qh-lv">Routine <span>Next routine clinic</span></span><p>Stable symptoms, risk and family history reviews.</p></div>
      <div><span class="qh-lv">Advice only <span>Written reply</span></span><p>You keep care, and we answer your question.</p></div></div>
    </div><form class="card qh-portal" aria-label="Secure referral"><h3>${ic("lock", 18)} Secure referral portal</h3>
      <div class="sk-field"><label for="qh-rname">Referring clinician</label><input class="sk-input" id="qh-rname" value="Dr Tobias Wrenfield, Ashgrove Road Surgery"></div>
      <div class="sk-field"><label for="qh-rpri">Priority you’re requesting</label><select class="sk-input" id="qh-rpri"><option>Rapid access</option><option>Urgent</option><option>Routine</option><option>Advice only</option></select></div>
      <div class="qh-attach">${ic("upload", 16)} Referral letter and ECG attached</div>
      <button class="btn primary sk-btn-lg" type="button">Continue to the portal</button></form>
  </div>
  <p class="qh-acute">${ic("bell", 16)}<span>If your patient is acutely unwell, please send them to emergency care instead of using the portal.</span></p>
</div></section>

<section class="sk-sec" id="cardiologists"><div class="sk-wrap">
  <div class="sk-head" style="margin-bottom:28px"><div><span class="sk-eyebrow">Our cardiologists</span><h2 class="sk-h2">Who you’ll see</h2></div><p class="muted qh-side" style="max-width:360px">You’ll be matched to the cardiologist whose interest fits your symptoms, or you can ask for someone by name.</p></div>
  <div class="qh-docs sk-rail">${TEAM.map(([id, s, h, c, sh, n, r, sub, tr, cl]) => `<article class="qh-doc"><div class="qh-face">${face(id, s, h, c, sh)}</div><div><div class="qh-who"><h3 class="sk-h3">${n}</h3><span class="badge">${sub}</span></div><p>${r}. ${tr}</p><p>${cl}</p></div></article>`).join("")}</div>
  <div class="qh-slot">${ic("edit", 16)} Add your registration and accreditation details here</div>
</div></section>

<section class="sk-sec sk-alt" id="locations"><div class="sk-wrap qh-visit">
  <div><span class="sk-eyebrow">Locations</span><h2 class="sk-h2" style="margin:12px 0 20px">Where to find us</h2>
    <div class="qh-loc"><h3>Tamsin Row</h3><p>41 Tamsin Row. Mon to Fri 8:00 AM to 6:00 PM, Sat 8:30 AM to 12:30 PM.</p><div class="qh-tags"><span>All on-site tests</span><span>Rapid access clinic</span><span>Step-free</span><span>Parking behind the building</span></div></div>
    <div class="qh-loc"><h3>Orrel Gate</h3><p>7 Orrel Gate, above the health centre. Mon and Thu 9:00 AM to 5:00 PM.</p><div class="qh-tags"><span>Consultations</span><span>ECG and monitors</span><span>Lift access</span><span>Near the bus station</span></div></div>
    <div class="qh-loc qh-help"><h3>Need help getting here?</h3><p>Call (555) 014-2230 to talk through transport, access or an interpreter.</p></div></div>
  <form class="card qh-form" aria-label="Book an appointment" id="book-an-appointment">
    <h2 class="sk-h3" style="font-size:calc(26px * var(--hs))">Book an appointment</h2>
    <p class="muted" style="font-size:14px">We’ll call within one working day to confirm. This form is not monitored for urgent symptoms.</p>
    <div class="sk-g2"><div class="sk-field"><label for="qh-name">Full name</label><input class="sk-input" id="qh-name" value="Marisol Hendry"></div><div class="sk-field"><label for="qh-phone">Mobile</label><input class="sk-input" id="qh-phone" value="(555) 017-3346"></div></div>
    <div class="sk-g2"><div class="sk-field"><label for="qh-why">Reason for visit</label><select class="sk-input" id="qh-why"><option>Palpitations</option><option>Chest discomfort</option><option>Breathlessness</option><option>High blood pressure</option><option>Family history review</option><option>Something else</option></select></div><div class="sk-field"><label for="qh-site">Location</label><select class="sk-input" id="qh-site"><option>Tamsin Row</option><option>Orrel Gate</option><option>Either</option></select></div></div>
    <div class="sk-field"><span style="font-weight:500;font-size:13px">Do you have a referral letter?</span><div class="qh-radio"><label class="on"><input type="radio" name="qh-ref" checked> Yes</label><label><input type="radio" name="qh-ref"> No</label><label><input type="radio" name="qh-ref"> On its way</label></div></div>
    <div class="sk-field"><label for="qh-doc">Referring doctor</label><input class="sk-input" id="qh-doc" value="Dr Tobias Wrenfield, Ashgrove Road Surgery"></div>
    <button class="btn primary sk-btn-lg" type="button">Request appointment</button>
  </form>
</div></section>
</main>
${K.footer(p, "Outpatient cardiology for patients and referring clinicians, at Tamsin Row and Orrel Gate.", [["Patients", ["What we see", "Tests and procedures", "Your first appointment"]], ["Clinicians", ["Referral pathway", "Rapid access clinic", "Clinician line (555) 014-2290"]], ["Contact", ["41 Tamsin Row", "(555) 014-2230", "hello@quillonheart.example"]]], "Fictional practice created for this template. General information only, not medical advice.")}`, CSS);

module.exports = {
  "cardiology-website": K.def("cardiology", "Cardiology practice website",
    "a full cardiology practice home page: an emergency strip, navigation with a clinician line and booking button, a hero that splits patients and referring clinicians into two paths under a heart trace line, an a to z index of conditions and symptoms with a letter bar, a tests and procedures table with duration and preparation, a what to bring checklist beside a breakdown of the first appointment, a rapid access clinic explainer, a dark clinician band with the referral pathway, triage levels, a secure referral card and clinician phone line, cardiologist profiles with sub-interests and a credentials slot, two locations with a booking form that asks for reason for visit and referring doctor, and a footer",
    ["emergency-banner", "navigation-header", "audience-split-hero", "alphabetical-index", "comparison-table", "checklist", "time-breakdown", "explainer", "referral-pathway", "triage-levels", "secure-form", "team-list", "credentials-slot", "locations", "booking-form", "footer", "cardiology"], web),
};
