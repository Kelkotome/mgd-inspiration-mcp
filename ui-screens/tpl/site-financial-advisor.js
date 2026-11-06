/* Financial advisor website template (Lindqvale Planning, a fictional fee-only planning firm). Full responsive home page set like a
   numbered planning document whose single job is booking an intro call: contents rail + statement hero, "Where are you right now?"
   by life stage, plain fee table, first 90 days, mock plan document, advisors with a credentials slot, how we are paid and conflicts
   of interest, FAQ, short intro-call form, footer. No return figures, no performance, no assets-under-management claims, no percentages. */
const { ic, esc } = require("../lib");
const K = require("../sitekit");

const CSS = `<style>
.fa-doc{display:grid;grid-template-columns:190px minmax(0,1fr);gap:64px}
.fa h2.sk-h2{font-size:calc(33px * var(--hs));line-height:1.12}
.fa-sec{padding:40px 0;border-top:1px solid var(--border)}
.fa-mark{display:grid;gap:6px;align-content:start;padding-top:6px}
.fa-mark .num{font-size:26px;color:color-mix(in oklab,var(--primary) 70%,var(--text));letter-spacing:-.02em}
.fa-mark span:last-child{font-size:13px;color:var(--muted);line-height:1.4}
.fa-intro{display:grid;gap:8px;max-width:760px;margin-bottom:26px}
.fa-intro p{color:var(--muted);font-size:16px}
.fa-hero{padding-top:46px;padding-bottom:38px}
.fa-toc{list-style:none;display:grid;gap:0;font-size:14px;align-content:start;padding-top:4px}
.fa-toc li{border-top:1px solid var(--border)}
.fa-toc li:last-child{border-bottom:1px solid var(--border)}
.fa-toc a{display:grid;grid-template-columns:22px minmax(0,1fr);gap:6px;padding:7px 0;color:var(--muted)}
.fa-toc a:hover{color:var(--text)}
.fa-toc b{font-weight:600;color:var(--text);font-variant-numeric:tabular-nums}
.fa-htext{display:grid;gap:18px;justify-items:start}
.fa-hero h1{max-width:880px;font-size:calc(47px * var(--hs));line-height:1.06}
.fa-hero .sk-lede{max-width:640px}
.fa-slots{display:flex;flex-wrap:wrap;align-items:center;gap:8px;font-size:14px;color:var(--muted)}
.fa-slots span{height:34px;display:inline-flex;align-items:center;padding:0 12px;border:1px solid var(--border);border-radius:var(--radius);color:var(--text);font-weight:500;font-size:13px;background:var(--surface)}
.fa-facts{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:0;margin-top:30px;border-top:2px solid var(--text)}
.fa-facts div{padding:16px 20px 0 0;display:grid;gap:4px;align-content:start}
.fa-facts b{font-size:15px}
.fa-facts span{font-size:13px;color:var(--muted);line-height:1.45}
.fa-stages{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:0 40px}
.fa-stage{padding:16px 0 18px;border-top:1px solid var(--border);display:grid;gap:8px;align-content:start}
.fa-stage header{display:flex;align-items:baseline;gap:10px;border:0!important}
.fa-stage header .num{font-size:13px;color:var(--muted)}
.fa-stage>p{font-size:14px;color:var(--muted)}
.fa-q{list-style:none;display:grid;gap:5px;font-size:14px}
.fa-q li{display:grid;grid-template-columns:14px minmax(0,1fr);gap:8px;line-height:1.45}
.fa-q li::before{content:"?";font-weight:600;color:color-mix(in oklab,var(--primary) 75%,var(--text))}
.fa-next{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:14px;margin-top:6px;padding:12px 20px;border-left:3px solid var(--primary);background:color-mix(in oklab,var(--primary) 7%,var(--bg))}
.fa-next a{font-weight:600;display:inline-flex;align-items:center;gap:6px;color:color-mix(in oklab,var(--primary) 78%,var(--text))}
.fa-table{width:100%;border-collapse:collapse;font-size:14px;border-top:2px solid var(--text)}
.fa-table th{font:600 12px var(--font-b);letter-spacing:.04em;text-align:left;color:var(--muted);padding:12px 18px 12px 0;border-bottom:1px solid var(--border);vertical-align:bottom}
.fa-table td{padding:13px 18px 13px 0;border-bottom:1px solid var(--border);vertical-align:top;line-height:1.5}
.fa-table td:last-child,.fa-table th:last-child{padding-right:0}
.fa-table td b{font-weight:600;font-size:15px;display:block}
.fa-table td.num{font-size:16px;white-space:nowrap;text-align:right;line-height:1.4}
.fa-table th:last-child{text-align:right}
.fa-table small{display:block;font:400 12.5px var(--font-b);color:var(--muted);letter-spacing:0}
.fa-feeg{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:48px;margin-top:24px}
.fa-feeg h3{margin-bottom:8px}
.fa-feeg ol,.fa-feeg ul{list-style:none;display:grid;gap:5px;font-size:14px}
.fa-feeg ol{counter-reset:fa}
.fa-feeg ol li{counter-increment:fa;display:grid;grid-template-columns:20px minmax(0,1fr);gap:8px}
.fa-feeg ol li::before{content:counter(fa);font-weight:600;color:var(--muted);font-variant-numeric:tabular-nums}
.fa-feeg ul li{display:grid;grid-template-columns:18px minmax(0,1fr);gap:8px}
.fa-feeg ul li>span:first-child{color:var(--muted);padding-top:2px}
.fa-time{list-style:none;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:0;position:relative;padding-top:34px}
.fa-time::before{content:"";position:absolute;left:0;right:0;top:11px;height:2px;background:var(--text)}
.fa-time li{position:relative;padding-right:24px;display:grid;gap:6px;align-content:start}
.fa-time li::before{content:"";position:absolute;left:0;top:-29px;width:12px;height:12px;border-radius:50%;background:var(--bg);border:2px solid var(--text)}
.fa-time li:first-child::before{background:var(--primary);border-color:var(--primary)}
.fa-time .num{font-size:13px;color:var(--muted)}
.fa-time p{font-size:14px;color:var(--muted)}
.fa-time em{font-style:normal;font-size:12.5px;padding-top:6px;border-top:1px dashed var(--border);color:var(--muted)}
.fa-sheets{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,1fr);gap:24px;align-items:stretch}
.fa-paper{background:var(--surface);border:1px solid var(--border);box-shadow:var(--shadow);padding:22px 26px;display:grid;gap:9px;align-content:start}
.fa-paper header{display:flex;justify-content:space-between;gap:12px;font-size:11.5px;color:var(--muted);padding-bottom:10px;border-bottom:1px solid var(--border)!important}
.fa-paper .fa-ptitle{font-size:calc(21px * var(--hs));line-height:1.2}
.fa-toc2{list-style:none;display:grid;gap:3px;font-size:13px}
.fa-toc2 li{display:grid;grid-template-columns:minmax(0,auto) minmax(12px,1fr) auto;gap:6px;align-items:baseline}
.fa-toc2 i{border-bottom:1px dotted color-mix(in oklab,var(--muted) 70%,transparent);height:1px;align-self:end;margin-bottom:5px}
.fa-acts{width:100%;border-collapse:collapse;font-size:12.5px}
.fa-acts th{font:600 11px var(--font-b);text-align:left;color:var(--muted);padding:0 8px 6px 0;border-bottom:1px solid var(--border)}
.fa-acts td{padding:7px 8px 7px 0;border-bottom:1px solid var(--border);vertical-align:top;line-height:1.4}
.fa-acts td:last-child,.fa-acts th:last-child{padding-right:0;white-space:nowrap}
.fa-keep{font-size:13px;color:var(--muted);margin-top:14px;display:flex;gap:8px;align-items:flex-start}
.fa-keep>span:first-child{flex:none;padding-top:2px}
.fa-adv{display:grid;grid-template-columns:76px minmax(0,1fr) minmax(0,1fr);gap:24px;padding:13px 0;border-top:1px solid var(--border);align-items:start}
.fa-advs{display:grid}
.fa-face{width:76px;height:76px;border-radius:50%;overflow:hidden;background:var(--surface)}
.fa-face svg{display:block;width:100%;height:100%}
.fa-adv p{font-size:13.5px;color:var(--muted);margin-top:3px;line-height:1.45}
.fa-adv ul{list-style:none;display:grid;gap:4px;font-size:13.5px}
.fa-adv li{display:grid;grid-template-columns:16px minmax(0,1fr);gap:8px}
.fa-adv li>span:first-child{color:color-mix(in oklab,var(--primary) 75%,var(--text));padding-top:2px}
.fa-slot{display:flex;align-items:center;gap:10px;padding:12px 16px;border:1.5px dashed color-mix(in oklab,var(--muted) 65%,transparent);border-radius:var(--radius);font-size:13.5px;color:var(--muted);margin-top:6px}
.fa-slot span{flex:none;display:grid}
.fa-paid{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);gap:44px;align-items:start}
.fa-paid>div:first-child{display:grid;gap:12px;font-size:15px}
.fa-paid>div:first-child p{color:var(--muted)}
.fa-coi{width:100%;border-collapse:collapse;font-size:14px;border-top:2px solid var(--text)}
.fa-coi th{font:600 12px var(--font-b);text-align:left;color:var(--muted);padding:12px 16px 12px 0;border-bottom:1px solid var(--border)}
.fa-coi td{padding:13px 16px 13px 0;border-bottom:1px solid var(--border);vertical-align:top;line-height:1.45}
.fa-coi td:first-child{width:42%;font-weight:500}
.fa-coi td:last-child,.fa-coi th:last-child{padding-right:0;color:var(--muted)}
.fa-faq{columns:2;column-gap:40px}
.fa-faq details{border-top:1px solid var(--border);padding:12px 0;break-inside:avoid}
.fa-faq summary{list-style:none;cursor:pointer;display:flex;justify-content:space-between;gap:16px;align-items:center;font-weight:600;font-size:14.5px}
.fa-faq summary::-webkit-details-marker{display:none}
.fa-faq summary .i{color:var(--muted)}
.fa-faq details[open] summary .i{transform:rotate(180deg)}
.fa-faq p{color:var(--muted);font-size:14px;margin-top:8px;max-width:680px}
.fa-book{background:var(--surface);border-top:1px solid var(--border);padding:48px 0}
.fa-bookg{display:grid;grid-template-columns:minmax(0,.85fr) minmax(0,1.15fr);gap:48px;align-items:start}
.fa-bookg>div:first-child{display:grid;gap:12px}
.fa-bookg>div:first-child p{color:var(--muted);font-size:15px}
.fa-expect{list-style:none;display:grid;gap:7px;font-size:14px;margin-top:6px}
.fa-expect li{display:grid;grid-template-columns:18px minmax(0,1fr);gap:8px}
.fa-expect li>span:first-child{color:var(--success);padding-top:2px}
.fa-form{display:grid;gap:12px;padding:24px;background:var(--bg)}
.fa-form .sk-g2{gap:14px}
.fa-form .sk-input{background:var(--bg)}
.fa-fine{font-size:12.5px;color:var(--muted)}
@media (max-width:1024px){
  .fa-doc{grid-template-columns:150px minmax(0,1fr);gap:36px}
  .fa-facts{grid-template-columns:repeat(2,minmax(0,1fr));row-gap:12px}
  .fa-paid{grid-template-columns:minmax(0,1fr);gap:28px}
  .fa-bookg{gap:32px}
}
@media (max-width:760px){
  .fa-doc{grid-template-columns:minmax(0,1fr);gap:10px}
  .fa h2.sk-h2{font-size:calc(28px * var(--hs))}
  .fa-sec{padding:32px 0}
  .fa-mark{display:flex;align-items:baseline;gap:8px;padding:0}
  .fa-mark .num{font-size:18px}
  .fa-hero{padding-top:26px;padding-bottom:30px}
  .fa-hero h1{font-size:calc(38px * var(--hs))}
  .fa-htext{gap:14px}
  .fa-toc,.fa-slots{display:none}
  .fa-facts{margin-top:22px;row-gap:8px}
  .fa-facts div{padding:10px 12px 0 0}
  .fa-intro{margin-bottom:16px}
  .fa-intro p{font-size:15px}
  .fa-stage{border:1px solid var(--border);border-radius:var(--radius);padding:16px}
  .fa-next{margin-top:14px;padding:12px 14px}
  .fa-table thead{display:none}
  .fa-table,.fa-table tbody,.fa-table tr,.fa-table td{display:block;width:100%}
  .fa-table tr{padding:12px 0;border-bottom:1px solid var(--border)}
  .fa-table td{padding:0 0 4px;border:0}
  .fa-table td.num{text-align:left;font-size:18px;padding-top:2px}
  .fa-table td.fa-how{color:var(--muted);font-size:13px}
  .fa-feeg{grid-template-columns:minmax(0,1fr);gap:18px;margin-top:18px}
  .fa-time{grid-template-columns:minmax(0,1fr);padding:0 0 0 24px;gap:14px}
  .fa-time::before{left:5px;right:auto;top:6px;bottom:6px;width:2px;height:auto}
  .fa-time li{padding-right:0;gap:3px}
  .fa-time li::before{left:-24px;top:4px}
  .fa-time em{display:none}
  .fa-sheets{grid-template-columns:minmax(0,1fr)}
  #fa-sheet2{display:none}
  .fa-paper{padding:18px}
  .fa-toc2 li{grid-template-columns:minmax(0,1fr) auto}
  .fa-toc2 i{display:none}
  .fa-advs{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;scroll-padding-inline:20px;gap:12px;margin:0 -20px;padding:0 20px 6px;scrollbar-width:none}
  .fa-adv{flex:0 0 84%;scroll-snap-align:start;grid-template-columns:56px minmax(0,1fr);gap:6px 12px;padding:16px;border:1px solid var(--border);border-radius:var(--radius);align-content:start}
  .fa-face{width:56px;height:56px}
  .fa-adv ul{grid-column:1/-1;margin-top:6px}
  .fa-paid>div:first-child p:last-child{display:none}
  .fa-coi,.fa-coi tbody,.fa-coi tr,.fa-coi td{display:block;width:100%!important}
  .fa-coi thead{display:none}
  .fa-coi tr{padding:10px 0;border-bottom:1px solid var(--border)}
  .fa-coi td{padding:0 0 3px;border:0}
  .fa-faq{columns:1}
  .fa-faq details:last-child{display:none}
  .fa-book{padding:36px 0}
  .fa-bookg{grid-template-columns:minmax(0,1fr);gap:20px}
  .fa-expect{display:none}
  .fa-form{padding:18px}
  .fa-form .sk-g2{grid-template-columns:minmax(0,1fr)}
}
</style>`;

// Small head-and-shoulders portrait, fixed natural tones (illustrative).
const face = (id, skin, hair, coat, label) => `<svg viewBox="0 0 120 120" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${label}"><defs><linearGradient id="fa-f${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e4e6df"/><stop offset="1" stop-color="#cdd2c8"/></linearGradient></defs>
<rect width="120" height="120" fill="url(#fa-f${id})"/><path d="M14 120c3-30 22-44 46-44s43 14 46 44z" fill="${coat}"/><path d="M52 80l8 16 8-16z" fill="#f2f0ea"/><rect x="52" y="62" width="16" height="22" fill="${skin}"/><ellipse cx="60" cy="48" rx="23" ry="27" fill="${skin}"/><path d="M36 46c0-22 12-32 25-32s24 10 23 32c-5-11-15-16-24-16s-19 5-24 16z" fill="${hair}"/></svg>`;

const mark = (n, label) => `<div class="fa-mark"><span class="num">${n}</span><span>${label}</span></div>`;

const STAGES = [
  ["Building", "First proper salary, some debt, a lot of choices.", ["Which comes first: the debt, the emergency fund or the retirement plan at work?", "How much of each pay rise should we keep for later?", "Is now the time to buy, or to keep renting and save?"]],
  ["Family and home", "Two incomes or one, a mortgage, people who depend on you.", ["How much life and disability cover does the household need?", "Could we keep the house on one income?", "How do we save for education without giving up retirement?"]],
  ["Business owner", "The company is your income and your biggest asset.", ["How should I pay myself: salary, distributions or a mix?", "Which retirement plan suits a small company?", "Who buys me out, and on what terms, if I stop?"]],
  ["Approaching retirement", "Ten years out or less, and the date is starting to feel real.", ["When can we stop, and what does that look like month by month?", "When should we claim our state pension?", "How do we cover health costs before public cover starts?"]],
  ["In retirement", "The paycheck has stopped. Now the money has to do the work.", ["How much can we spend each year without worrying?", "Which accounts do we draw from first, and how does that affect tax?", "What happens if one of us needs long-term care?"]],
  ["After a loss or a sale", "A death, a divorce, an inheritance or the sale of a business.", ["What has to be decided now, and what can safely wait?", "Where should the money sit while we think?", "Can I afford to stay in the house, and what is owed in tax this year?"]],
];

const FEES = [
  ["Financial plan", "One-off", "Discovery, the full written plan, the plan meeting and the 90-day review.", "Flat fee, agreed in writing before work starts. Half on signing, half when you receive the plan.", "$3,200 to $6,800"],
  ["Ongoing retainer", "After the plan", "Yearly plan update, a tax-season check-in, a mid-year review, and calls or email when something changes.", "Monthly, billed in arrears. Stop with 30 days’ notice.", "$240 to $520 / mo"],
  ["Hourly advice", "One question", "A second opinion, a job offer, a pension choice or a mortgage decision. No plan needed.", "Billed in 15-minute steps, two-hour minimum, with a written note of what we said.", "$280 / hour"],
];

const TIME = [
  ["Day 0", "Intro call", "Thirty minutes. You tell us what prompted the call, we explain how we work and whether we are a fit.", "Free, no paperwork"],
  ["Weeks 1 to 2", "Discovery meeting", "Ninety minutes on goals, family and work. We send a secure list first: recent payslips, tax returns, statements, policies and wills.", "You get your fee quote after this"],
  ["Weeks 4 to 6", "The written plan", "We walk you through it page by page, explain the trade-offs, and agree an action list with names and dates.", "The plan is yours to keep"],
  ["Day 90", "Review", "What got done, what got stuck and what changed. Then you choose: carry on with a retainer, or take the plan and go.", "Included in the plan fee"],
];

const CONTENTS = [["Summary and next steps", "3"], ["Your goals, in your words", "5"], ["Net worth and cash flow", "7"], ["Tax position and options", "11"], ["Retirement projection, assumptions shown", "15"], ["Investments: what you hold and what it costs", "20"], ["Insurance and protection review", "25"], ["Estate documents checklist", "28"], ["Education funding", "30"], ["Action list: who does what, by when", "33"]];
const ACTIONS = [["Update beneficiaries on the workplace plan", "Dana", "20 Nov"], ["Send policy schedule to the broker for a cover review", "Theo", "28 Nov"], ["Book a will review with your attorney", "Both", "12 Dec"], ["Move the emergency fund to a separate account", "Dana", "15 Dec"], ["Check payroll withholding with your accountant", "Planner", "9 Jan"], ["Open the separate education account", "Theo", "16 Jan"], ["Day 90 review meeting", "All", "21 Jan"]];

const ADVISORS = [
  ["1", "#d8a884", "#4a3324", "#3f4d52", "Portrait of a planner in a dark jacket", "Marit Ostrand", "Lead planner", "Works mainly with families and people approaching retirement. Started her career in a bank’s lending team.", ["Postgraduate diploma in financial planning", "Professional planning designation", "Retirement income specialist training"]],
  ["2", "#a97350", "#1e1916", "#5d6650", "Portrait of a planner in an olive jacket", "Daniel Okoye-Fenn", "Planner, business owners", "Former tax accountant. Handles owner pay, company retirement plans and business sales.", ["Degree in accounting and finance", "Professional tax qualification", "Business succession planning training"]],
  ["3", "#efc9a8", "#8a5a34", "#6c5a4a", "Portrait of a planner in a brown jacket", "Joelle Harrowgate", "Planner, life transitions", "Works with people after a bereavement, a divorce or an inheritance, at whatever pace they need.", ["Diploma in financial planning", "Divorce financial analysis training", "Estate and trust planning training"]],
];

const CONFLICTS = [
  ["A retainer pays us to keep you as a client, even in a quiet year.", "We tell you when you could safely stop, and the retainer has no exit fee."],
  ["We may own the same funds we suggest to you.", "We keep a written record of personal holdings and tell you before making the recommendation."],
  ["We refer clients to attorneys, accountants and insurance brokers.", "We take no referral payment and give you at least two names where we can."],
];

const FAQ = [
  ["Do you hold my money?", "No. Your accounts stay in your name at the provider of your choice. We give written recommendations, and you decide whether to act on them.", true],
  ["Is there a minimum amount to work with you?", "No. Our fees are based on the work involved, not on what you have, so there is no minimum balance or income."],
  ["Can you promise how my investments will do?", "No, and nobody can. Plans use stated assumptions that you can read and question, and we update them each year."],
  ["We already have an accountant and an attorney. Is that a problem?", "Not at all. With your permission we work alongside them, and we can join a meeting so that everyone is reading the same plan."],
  ["What if we only want one question answered?", "Use hourly advice. There is no plan, no retainer and no pressure to take either. You get a short written note afterwards."],
  ["Do we have to meet in person?", "No. Most meetings are by video. Our office on Tamarind Court is open for anyone who prefers to sit across a table."],
];

const web = (p, st) => K.page(st, `${K.nav(p, ["Your situation", "Fees", "First 90 days", "Advisors", "Questions"], "Book an intro call")}
<main class="fa">
<section class="sk-wrap fa-hero"><div class="fa-doc">
  <nav aria-label="On this page"><ol class="fa-toc">${[["1", "Your situation", "your-situation"], ["2", "Fees", "fees"], ["3", "First 90 days", "first-90-days"], ["4", "What you receive", "what-you-receive"], ["5", "Advisors", "advisors"], ["6", "How we are paid", "how-we-are-paid"], ["7", "Questions", "questions"], ["8", "Intro call", "book-an-intro-call"]].map(([n, t, h]) => `<li><a href="#${h}"><b>${n}</b><span>${t}</span></a></li>`).join("")}</ol></nav>
  <div>
    <div class="fa-htext">
      <span class="sk-eyebrow">Fee-only financial planning</span>
      <h1 class="sk-h1">A written plan for your money, from people who sell no products</h1>
      <p class="sk-lede">${esc(p.name)} helps households and business owners make decisions about work, tax, property, retirement and family. You pay a flat fee you can see before we start. Nobody here earns commission.</p>
      <div class="sk-row"><a class="btn primary sk-btn-lg" href="#book-an-intro-call">Book an intro call</a><a class="btn sk-btn-lg" href="#fees">See the fees</a></div>
      <div class="fa-slots">Next calls <span>Tue 10 Nov, 9:30 AM</span><span>Wed 11 Nov, 4:00 PM</span><span>Fri 13 Nov, 12:15 PM</span></div>
    </div>
    <div class="fa-facts">${[["Paid only by you", "No commission or referral money from anyone."], ["Priced by the work", "Not by how much you have."], ["A plan in writing", "Delivered within six weeks of discovery."], ["No minimum", "No balance or income threshold."]].map(([a, b]) => `<div><b>${a}</b><span>${b}</span></div>`).join("")}</div>
  </div>
</div></section>

<section class="fa-sec" id="your-situation"><div class="sk-wrap">
  <div class="fa-doc">${mark("1", "Your situation")}<div class="fa-intro"><h2 class="sk-h2">Where are you right now?</h2><p>Most people call because something has changed. Find the stage closest to yours. These are the questions we usually start with.</p></div></div>
  <div>
    <div class="fa-stages sk-rail">${STAGES.map(([t, d, qs], i) => `<article class="fa-stage"><header><span class="num">${"ABCDEF"[i]}</span><h3 class="sk-h3">${t}</h3></header><p>${d}</p><ul class="fa-q">${qs.map((q) => `<li>${q}</li>`).join("")}</ul></article>`).join("")}</div>
    <div class="fa-next"><span>Recognize your questions? Bring them to a free 30-minute call.</span><a href="#book-an-intro-call">Book an intro call ${ic("arrow", 16)}</a></div>
  </div>
</div></section>

<section class="fa-sec" id="fees"><div class="sk-wrap fa-doc">${mark("2", "Fees")}
  <div>
    <div class="fa-intro"><h2 class="sk-h2">What it costs</h2><p>Three ways to work with us. You will have a fixed quote in writing before you commit to anything.</p></div>
    <table class="fa-table"><thead><tr><th style="width:21%">Service</th><th style="width:33%">What it covers</th><th>How it is charged</th><th>Fee</th></tr></thead><tbody>${FEES.map(([t, sub, what, how, fee]) => `<tr><td><b>${t}</b><small>${sub}</small></td><td>${what}</td><td class="fa-how">${how}</td><td class="num">${fee}</td></tr>`).join("")}</tbody></table>
    <div class="fa-feeg">
      <div><h3 class="sk-h3">How the fee is worked out</h3><ol>${["How many income sources, employers or businesses are involved", "Whether property, trusts or an estate need reviewing", "Whether two households or two countries are involved", "How much tax work the plan needs"].map((x) => `<li>${x}</li>`).join("")}</ol></div>
      <div><h3 class="sk-h3">What we do not charge</h3><ul>${["The intro call", "Commission or sales charges on any product", "A percentage of your investments", "Referral fees, either way", "Exit fees when you leave"].map((x) => `<li><span>${ic("x", 14)}</span><span>${x}</span></li>`).join("")}</ul></div>
    </div>
  </div>
</div></section>

<section class="fa-sec" id="first-90-days"><div class="sk-wrap fa-doc">${mark("3", "First 90 days")}
  <div>
    <div class="fa-intro"><h2 class="sk-h2">How the first 90 days work</h2></div>
    <ol class="fa-time">${TIME.map(([d, t, b, n]) => `<li><span class="num">${d}</span><h3 class="sk-h3">${t}</h3><p>${b}</p><em>${n}</em></li>`).join("")}</ol>
  </div>
</div></section>

<section class="fa-sec" id="what-you-receive"><div class="sk-wrap">
  <div class="fa-doc">${mark("4", "What you receive")}<div class="fa-intro"><h2 class="sk-h2">A plan you can read at the kitchen table</h2><p>Your plan runs to about 35 pages in plain English, and ends with a list of who does what.</p></div></div>
  <div>
    <div class="fa-sheets">
      <article class="fa-paper" aria-label="Sample plan contents page"><header><span>Financial plan</span><span>Page 2</span></header><div class="fa-ptitle h">Prepared for Dana and Theo Marrow</div><div class="muted" style="font-size:12.5px">Sample plan, October 2026</div><ol class="fa-toc2">${CONTENTS.map(([t, n], i) => `<li><span>${i + 1}. ${t}</span><i></i><span class="num" style="font-size:12.5px">${n}</span></li>`).join("")}</ol></article>
      <article class="fa-paper" aria-label="Sample action list page" id="fa-sheet2"><header><span>Action list</span><span>Page 33</span></header><table class="fa-acts"><thead><tr><th>Action</th><th>Who</th><th>By</th></tr></thead><tbody>${ACTIONS.map(([a, w, b]) => `<tr><td>${a}</td><td>${w}</td><td>${b}</td></tr>`).join("")}</tbody></table><p class="muted" style="font-size:12.5px;align-self:end">Each action names one person and one date, so nothing sits with “someone”.</p></article>
    </div>
    <p class="fa-keep"><span>${ic("doc", 15)}</span><span>The plan belongs to you. Take it to another advisor, your accountant or nobody at all.</span></p>
  </div>
</div></section>

<section class="fa-sec" id="advisors"><div class="sk-wrap fa-doc">${mark("5", "Advisors")}
  <div>
    <div class="fa-intro" style="margin-bottom:22px"><h2 class="sk-h2">Who you would be talking to</h2><p>You speak to a planner from the first call. There is no sales team.</p></div>
    <div class="fa-advs">${ADVISORS.map(([id, s, h, c, lbl, n, r, d, q]) => `<article class="fa-adv"><div class="fa-face">${face(id, s, h, c, lbl)}</div><div><h3 class="sk-h3">${n}</h3><div class="muted" style="font-size:13px;font-weight:500">${r}</div><p>${d}</p></div><ul aria-label="Training">${q.map((x) => `<li><span>${ic("check", 14)}</span><span>${x}</span></li>`).join("")}</ul></article>`).join("")}</div>
    <div class="fa-slot"><span>${ic("edit", 16)}</span>Add your license, registration and professional credentials here</div>
  </div>
</div></section>

<section class="fa-sec" id="how-we-are-paid"><div class="sk-wrap fa-doc">${mark("6", "How we are paid")}
  <div>
    <div class="fa-intro" style="margin-bottom:22px"><h2 class="sk-h2">How we are paid, and our conflicts of interest</h2></div>
    <div class="fa-paid">
      <div><p>Your fee is the only money we receive. We are fee-only: no commission, no trail payments, no gifts or trips from product providers.</p><p>That does not remove every conflict of interest. No firm can. So we name the ones we have and write down how we handle them.</p><p>Costs charged by others, such as fund or platform charges, are set by those providers. We show them in your plan.</p></div>
      <table class="fa-coi"><thead><tr><th>Where a conflict can arise</th><th>What we do about it</th></tr></thead><tbody>${CONFLICTS.map(([a, b]) => `<tr><td>${a}</td><td>${b}</td></tr>`).join("")}</tbody></table>
    </div>
  </div>
</div></section>

<section class="fa-sec" id="questions"><div class="sk-wrap fa-doc">${mark("7", "Questions")}
  <div>
    <div class="fa-intro" style="margin-bottom:18px"><h2 class="sk-h2">Questions people ask first</h2></div>
    <div class="fa-faq">${FAQ.map(([q, a, o]) => `<details${o ? " open" : ""}><summary>${q}${ic("chevdown", 18)}</summary><p>${a}</p></details>`).join("")}</div>
  </div>
</div></section>

<section class="fa-book" id="book-an-intro-call"><div class="sk-wrap fa-bookg">
  <div><span class="sk-eyebrow">8. Intro call</span><h2 class="sk-h2">Book a free 30-minute call</h2><p>Talk to a planner about what has changed and whether we are the right firm for you.</p>
    <ul class="fa-expect">${["Free, with no obligation to go further", "By phone or video, your choice", "No documents needed yet", "We will tell you if we are not the right fit"].map((x) => `<li><span>${ic("check", 15)}</span><span>${x}</span></li>`).join("")}</ul></div>
  <form class="card fa-form" aria-label="Book an intro call">
    <div class="sk-g2"><div class="sk-field"><label for="fa-name">Your name</label><input class="sk-input" id="fa-name" value="Dana Marrow"></div><div class="sk-field"><label for="fa-mail">Email</label><input class="sk-input" id="fa-mail" value="dana@marrowhome.example"></div></div>
    <div class="sk-g2"><div class="sk-field"><label for="fa-stage">Where are you right now?</label><select class="sk-input" id="fa-stage">${STAGES.map(([t], i) => `<option${i === 3 ? " selected" : ""}>${t}</option>`).join("")}</select></div><div class="sk-field"><label for="fa-time">Preferred time</label><select class="sk-input" id="fa-time"><option>Tue 10 Nov, 9:30 AM</option><option>Wed 11 Nov, 4:00 PM</option><option>Fri 13 Nov, 12:15 PM</option></select></div></div>
    <div class="sk-field"><label for="fa-note">What prompted you to get in touch?</label><textarea class="sk-input" id="fa-note" rows="2" style="min-height:76px">Theo may retire in three years and we are not sure whether we can afford it.</textarea></div>
    <button class="btn primary sk-btn-lg" type="button">Request this call</button>
    <p class="fa-fine">Please do not send account numbers here. We confirm by email within one working day.</p>
  </form>
</div></section>
</main>
${K.footer(p, "Fee-only financial planning for households and business owners, with a flat fee you can see before we start.", [["Office", ["6 Tamarind Court, Suite 2", "Mon to Fri, 9:00 AM to 5:30 PM", "Evening calls by arrangement"]], ["Contact", ["(555) 014-2230", "hello@lindqvale.example", "Client documents: secure portal"]], ["Firm", ["Fee schedule", "Conflicts of interest policy", "Privacy notice"]]], "Fictional firm created for this template. General information only, not financial advice.")}`, CSS);

module.exports = {
  "financial-advisor-website": K.def("advisor", "Financial advisor website",
    "a full fee-only financial planner home page set like a numbered document: navigation with a book-an-intro-call button, a statement hero with an on-this-page contents rail, next call times and a four-fact strip, a where-are-you-right-now section with six life stages and their planning questions, a plain fee table for flat plan fee, monthly retainer and hourly advice with how the fee is worked out and what is not charged, a first-90-days timeline, a mock plan document with a contents page and action list, advisors with generic training and a credentials slot, how we are paid with a conflicts of interest table, an FAQ, a short intro-call form and a footer",
    ["navigation-header", "hero", "table-of-contents", "life-stage-index", "planning-questions", "fee-table", "timeline", "document-preview", "team", "credentials-slot", "conflicts-table", "faq", "booking-form", "footer", "financial-advisor"], web),
};
