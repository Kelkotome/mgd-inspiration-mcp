/* Coaching website template (Tallowmere Coaching, a fictional one-person leadership and career coaching practice). A typographic
   personal-brand home page: oversized statement headline, illustrated portrait with intro and a marked slot for credentials, who it
   is for, "Is coaching what you need?" comparing coaching, mentoring, therapy and consulting with a clear not-therapy statement,
   a three-stage engagement map carrying the packages and prices, the method beside a sample session outline, discovery call booking
   with a mock calendar, sample client notes, essays beside a newsletter sign-up, FAQ, footer. No income, promotion or results claims. */
const { ic, esc } = require("../lib");
const K = require("../sitekit");

const CSS = `<style>
.co>.sk-sec{padding:52px 0}
.co>.sk-sec.sk-tight{padding:42px 0}
.co .sk-h2{font-size:calc(38px * var(--hs))}
.co .sk-head{margin-bottom:28px}
.co .sk-head>div:first-child{max-width:760px;gap:8px}
.co-hero{padding-top:44px;padding-bottom:56px}
.co-byline{display:flex;justify-content:space-between;gap:16px;padding-bottom:12px;border-bottom:2px solid var(--text);font-size:14px;font-weight:600}
.co-byline span:last-child{color:var(--muted);font-weight:500}
.co-hero h1{font-size:calc(82px * var(--hs));line-height:1;margin:26px 0 34px;max-width:1040px}
.co-intro{display:grid;grid-template-columns:300px minmax(0,1fr) 270px;gap:44px;align-items:end}
.co-port{aspect-ratio:4/5;border-radius:var(--radius-lg);overflow:hidden}
.co-port svg{display:block;width:100%;height:100%}
.co-bio{display:grid;gap:12px;font-size:17px;line-height:1.55}
.co-slot{display:inline-block;padding:7px 12px;border:1.5px dashed var(--muted);border-radius:var(--radius);font-size:13px;color:var(--muted)}
.co-next{padding:20px;display:grid;gap:10px;font-size:14px}
.co-next .btn{width:100%}
.co-who{display:grid;grid-template-columns:minmax(0,.7fr) minmax(0,1.5fr);gap:56px;align-items:start}
.co-list{list-style:none;counter-reset:co;border-top:1px solid var(--border)}
.co-list li{counter-increment:co;display:grid;grid-template-columns:44px minmax(0,1fr);gap:8px;padding:9px 0;border-bottom:1px solid var(--border);font-family:var(--font-h);font-weight:var(--hw);letter-spacing:var(--ls);font-size:calc(21px * var(--hs));line-height:1.25}
.co-list li::before{content:counter(co,decimal-leading-zero);font:600 13px/1.9 var(--font-b);letter-spacing:0;color:var(--muted)}
/* comparison */
.co-cmp{display:grid;grid-template-columns:138px repeat(4,minmax(0,1fr));grid-template-rows:repeat(6,auto);border-top:2px solid var(--text)}
.co-c{display:grid;grid-row:span 6;grid-template-rows:subgrid}
.co-c>*{padding:9px 16px;border-bottom:1px solid var(--border);font-size:14px;line-height:1.42}
.co-c>h3{font-size:calc(22px * var(--hs));padding-top:14px;padding-bottom:14px}
.co-c small{display:none}
.co-lab>*{padding-left:0;font-weight:600;font-size:13px;color:var(--muted)}
.co-c.me{background:var(--bg);box-shadow:inset 0 0 0 2px var(--primary)}
.co-c.me>*{border-bottom-color:color-mix(in oklab,var(--primary) 26%,var(--border))}
.co-state{margin-top:26px;display:grid;grid-template-columns:44px minmax(0,1fr);gap:16px;padding:20px 24px;border-left:4px solid var(--danger);background:color-mix(in oklab,var(--danger) 7%,var(--bg));border-radius:0 var(--radius) var(--radius) 0}
.co-state .i{color:var(--danger);margin-top:2px}
.co-state b{display:block;font-family:var(--font-h);font-weight:var(--hw);letter-spacing:var(--ls);font-size:calc(23px * var(--hs));line-height:1.2;margin-bottom:6px}
.co-state p{font-size:15px;line-height:1.5}
/* map */
.co-map{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.45fr) minmax(0,1.8fr);gap:0}
.co-s{display:grid;gap:9px;align-content:start;padding-right:30px}
.co-s:last-child{padding-right:0}
.co-tr{position:relative;height:30px;margin-right:-30px;margin-bottom:6px}
.co-s:last-child .co-tr{margin-right:0}
.co-tr::before{content:"";position:absolute;left:0;right:0;top:9px;height:6px;background:color-mix(in oklab,var(--primary) var(--w),var(--border))}
.co-tr i{position:absolute;left:0;top:3px;width:18px;height:18px;border-radius:50%;background:var(--bg);border:4px solid var(--primary)}
.co-tr em{position:absolute;right:30px;top:-12px;font-style:normal;font-size:12px;color:var(--muted);font-weight:600}
.co-s:last-child .co-tr em{right:0}
.co-s small{font-size:12.5px;font-weight:600;color:color-mix(in oklab,var(--primary) 82%,var(--text))}
.co-s h3{font-size:calc(30px * var(--hs));line-height:1.1}
.co-pk{display:flex;align-items:baseline;justify-content:space-between;gap:12px;padding:9px 0;border-block:1px solid var(--border);font-size:14px;font-weight:600}
.co-pk .num{font-size:22px}
.co-s>p{font-size:14.5px;color:var(--muted);line-height:1.5}
.co-s ul{list-style:none;display:grid;gap:5px;font-size:14px;line-height:1.4}
.co-s li{display:grid;grid-template-columns:16px minmax(0,1fr);gap:8px}
.co-s li .i{margin-top:3px;color:color-mix(in oklab,var(--primary) 80%,var(--text))}
.co-fund{display:flex;gap:12px;align-items:flex-start;margin-top:24px;padding-top:16px;border-top:1px solid var(--border);font-size:14px;color:var(--muted)}
.co-fund .i{margin-top:3px;color:var(--text)}
/* method + session */
.co-how{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.1fr);gap:56px;align-items:start}
.co-method{display:grid;gap:0;margin-top:16px}
.co-method div{display:grid;grid-template-columns:96px minmax(0,1fr);gap:12px;padding:11px 0;border-top:1px solid var(--border);align-items:baseline}
.co-method b{font-family:var(--font-h);font-weight:var(--hw);font-size:calc(22px * var(--hs));letter-spacing:var(--ls);line-height:1.1}
.co-method p{font-size:14.5px;color:var(--muted);line-height:1.45}
.co-sess{padding:24px}
.co-sess>p{font-size:13.5px;color:var(--muted);margin:4px 0 12px}
.co-sess ol{list-style:none}
.co-sess li{display:grid;grid-template-columns:52px minmax(0,1fr);gap:10px;padding:8px 0;border-top:1px solid var(--border);font-size:14px;line-height:1.42}
.co-sess .num{font-size:13.5px;color:var(--muted);padding-top:1px}
/* booking */
.co-book{display:grid;grid-template-columns:minmax(0,.8fr) minmax(0,1fr) minmax(0,1fr);gap:0;padding:0;overflow:hidden}
.co-book>div{padding:28px;display:grid;gap:12px;align-content:start;border-left:1px solid var(--border)}
.co-book>div:first-child{border-left:0}
.co-cal{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:3px;text-align:center;font-size:13px}
.co-cal span{height:36px;display:grid;place-items:center;border-radius:var(--radius);color:color-mix(in oklab,var(--muted) 60%,transparent)}
.co-cal .dw{height:24px;font-size:11.5px;font-weight:600;color:var(--muted)}
.co-cal .av{color:var(--text);font-weight:600;background:color-mix(in oklab,var(--primary) 12%,var(--bg))}
.co-cal .sel{background:var(--primary);color:var(--on-primary);font-weight:700}
.co-mon{display:flex;justify-content:space-between;align-items:center;font-weight:600}
.co-mon span{display:inline-flex;gap:10px;color:var(--muted)}
.co-slots{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}
.co-slots span{height:38px;display:grid;place-items:center;border:1px solid var(--border);border-radius:var(--radius);font-size:13.5px;font-weight:600;background:var(--bg)}
.co-slots .on{border-color:var(--primary);box-shadow:inset 0 0 0 1px var(--primary)}
.co-book .sk-input{height:42px;background:var(--bg)}
.co-points{list-style:none;display:grid;gap:7px;font-size:14px}
.co-points li{display:grid;grid-template-columns:16px minmax(0,1fr);gap:8px}
.co-points .i{margin-top:3px;color:var(--success)}
/* notes */
.co-notes{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:36px}
.co-note{display:grid;gap:12px;align-content:space-between;padding-left:18px;border-left:2px solid var(--primary)}
.co-note p{font-family:var(--font-h);font-weight:var(--hw);letter-spacing:var(--ls);font-size:calc(21px * var(--hs));line-height:1.28}
.co-note figcaption{font-size:13px;color:var(--muted)}
/* essays + letter */
.co-read{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(0,1fr);gap:48px;align-items:stretch}
.co-es{list-style:none;margin-top:14px;border-top:2px solid var(--text)}
.co-es li{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:16px;align-items:baseline;padding:12px 0;border-bottom:1px solid var(--border)}
.co-es b{font-family:var(--font-h);font-weight:var(--hw);letter-spacing:var(--ls);font-size:calc(21px * var(--hs));line-height:1.2}
.co-es span{font-size:12.5px;color:var(--muted);white-space:nowrap}
.co-let{padding:30px;display:grid;gap:12px;align-content:center;border-radius:var(--radius-lg);background:var(--primary);color:var(--on-primary)}
.co-let h2{font-size:calc(30px * var(--hs));line-height:1.12}
.co-let p{font-size:14.5px;opacity:.9;line-height:1.5}
.co-let label{font-size:13px;font-weight:500}
.co-let .sk-input{color:var(--text)}
.co-let small{font-size:12.5px;opacity:.85}
.co-faq{display:grid;grid-template-columns:minmax(0,.6fr) minmax(0,1.4fr);gap:48px;align-items:start}
.co-faq details{border-top:1px solid var(--border);padding:11px 0}
.co-faq details:last-child{border-bottom:1px solid var(--border)}
.co-faq summary{list-style:none;cursor:pointer;font-weight:600;display:flex;justify-content:space-between;gap:12px;align-items:center}
.co-faq summary::-webkit-details-marker{display:none}
.co-faq details p{margin-top:6px;font-size:14px;color:var(--muted);line-height:1.5}
@media (max-width:1024px){
  .co-hero h1{font-size:calc(64px * var(--hs))}
  .co-intro{grid-template-columns:240px minmax(0,1fr);gap:28px}
  .co-next{grid-column:1/-1}
  .co-who,.co-how,.co-read,.co-faq{grid-template-columns:minmax(0,1fr);gap:28px}
  .co-cmp{grid-template-columns:96px repeat(4,minmax(0,1fr))}
  .co-c>*{padding-inline:10px;font-size:13px}
  .co-book{grid-template-columns:repeat(2,minmax(0,1fr))}
  .co-book>div:first-child{grid-column:1/-1;border-bottom:1px solid var(--border)}
  .co-book>div:nth-child(2){border-left:0}
  .co-notes{gap:20px}
  .co-map{grid-template-columns:minmax(0,1fr)}
  .co-s{padding:0 0 24px}
  .co-tr{margin-right:0}
  .co-tr em{right:0}
}
@media (max-width:760px){
  .co>.sk-sec{padding:38px 0}
  .co>.sk-sec.sk-tight{padding:32px 0}
  .co .sk-head p,.co-bio>p.muted,.co-next p{display:none}
  .co .sk-h2{font-size:calc(31px * var(--hs))}
  .co-hero{padding-top:20px;padding-bottom:40px}
  .co-byline{font-size:12.5px;padding-bottom:8px}
  .co-hero h1{font-size:calc(46px * var(--hs));margin:16px 0 22px}
  .co-intro{grid-template-columns:minmax(0,1fr);gap:18px}
  .co-port{aspect-ratio:1/1}
  .co-next{grid-column:auto}
  .co-bio{font-size:16px}
  .co-list li{grid-template-columns:32px minmax(0,1fr);font-size:calc(18.5px * var(--hs));padding:10px 0}
  .co-list li:nth-child(n+5){display:none}
  .co-cmp{border-top:0;grid-template-rows:none}
  .co-c.co-lab{display:none}
  .co-c{display:block;padding:18px;border:1px solid var(--border);border-radius:var(--radius-lg);background:var(--bg)}
  .co-c>*{padding:7px 0;font-size:14px}
  .co-c>h3{padding-top:0;font-size:calc(24px * var(--hs))}
  .co-c>div:last-child{border-bottom:0;padding-bottom:0}
  .co-c small{display:block;font-size:11.5px;font-weight:600;color:var(--muted)}
  .co-state{grid-template-columns:minmax(0,1fr);gap:6px;padding:16px 18px}
  .co-state p{font-size:14.5px}
  .co-tr{height:24px;margin-bottom:2px}
  .co-tr::before{top:7px}.co-tr i{top:1px}
  .co-tr em{top:-10px}
  .co-s{padding:12px 0 0;gap:7px}
  .co-s h3{font-size:calc(26px * var(--hs))}
  .co-s>p{font-size:14px}
  .co-method div{grid-template-columns:76px minmax(0,1fr)}
  .co-sess{padding:18px}
  .co-sess li:nth-child(2),.co-sess li:nth-child(4){display:none}
  .co-book{display:block}
  .co-book>div{padding:20px;border-left:0;border-top:1px solid var(--border)}
  .co-book>div:first-child{border-top:0;border-bottom:0}
  .co-points{display:none}
  .co-cal span{height:34px}
  .co-note{padding-left:14px}
  .co-note p{font-size:calc(19px * var(--hs))}
  .co-es li{grid-template-columns:minmax(0,1fr);gap:2px;padding:9px 0}
  .co-es b{font-size:calc(19px * var(--hs))}
  .co-es li:nth-child(n+4){display:none}
  .co-let{padding:22px}
  .co-faq details:nth-child(n+6){display:none}
  .co-faq details:nth-child(5){border-bottom:1px solid var(--border)}
}
</style>`;

const portrait = (name) => `<svg viewBox="0 0 360 450" preserveAspectRatio="xMidYMin slice" role="img" aria-label="Illustrated portrait of ${esc(name)}, a woman with a silver bob and round glasses, wearing a dark jacket">
<rect width="360" height="450" fill="#e7dccb"/><path d="M36 450V196a144 144 0 0 1 288 0v254z" fill="#c78a5e"/><circle cx="290" cy="74" r="24" fill="#eec983"/>
<path d="M90 196c-8-82 38-132 94-132s102 46 94 134c-3 34-6 60-16 86l-156 2c-10-26-14-54-16-90z" fill="#77746f"/>
<path d="M34 450c4-82 44-118 110-132l36 26 36-26c66 14 106 50 110 132z" fill="#2c464b"/>
<path d="M146 316l34 64 34-64-34 28z" fill="#f4ecdf"/>
<path d="M146 316l-22 12 26 96 30-44zM214 316l22 12-26 96-30-44z" fill="#385960"/>
<path d="M152 252v62c0 14 13 30 28 30s28-16 28-30v-62z" fill="#b57d5e"/>
<path d="M116 176c0-54 28-84 66-84s64 30 64 84c0 58-30 104-64 104s-66-46-66-104z" fill="#d09a78"/>
<path d="M182 92c38 0 64 30 64 84 0 58-30 104-64 104 22-26 30-60 30-104 0-34-10-62-30-84z" fill="#bd8767"/>
<path d="M108 208c-4-68 26-122 76-122 30 0 52 16 64 44-30 8-62 2-86-14-6 22-24 34-36 48-6 12-12 28-18 44z" fill="#a5a29c"/>
<path d="M246 130c6 22 8 52 2 80l14-4c4-30 0-58-16-76z" fill="#8d8a85"/>
<circle cx="151" cy="188" r="21" fill="#fff" fill-opacity=".14" stroke="#262626" stroke-width="3.5"/><circle cx="213" cy="188" r="21" fill="#fff" fill-opacity=".14" stroke="#262626" stroke-width="3.5"/><path d="M172 185c5-3 15-3 20 0" fill="none" stroke="#262626" stroke-width="3.5"/>
<path d="M139 164c7-5 17-5 24-2M201 162c7-3 17-3 24 2" fill="none" stroke="#5e5a55" stroke-width="4" stroke-linecap="round"/>
<circle cx="152" cy="190" r="3.4" fill="#2b2622"/><circle cx="212" cy="190" r="3.4" fill="#2b2622"/>
<path d="M184 198c-2 12-6 20-6 25 0 4 5 5 10 4" fill="none" stroke="#a5694f" stroke-width="3" stroke-linecap="round"/>
<path d="M160 245c12 10 32 10 44-1" fill="none" stroke="#8a4438" stroke-width="4" stroke-linecap="round"/></svg>`;

const ROWS = ["You want", "The focus", "Who has the answers", "Who offers it", "Ask for it when"];
const CMP = [
  ["Coaching", ["Someone to think with", "Your work now and what you do next", "Mostly you. I ask, you decide", "A trained coach", "You are capable but stuck on a decision or a pattern"], "me"],
  ["Mentoring", ["Someone who has done it", "Their path and what they learned", "Mostly the mentor", "A more senior person in your field", "You want to see how a career works from the inside"]],
  ["Therapy", ["Support with your mental health", "Wellbeing, feelings, often your past", "You and a clinician, working it through", "A licensed mental health professional", "Low mood, anxiety, grief or trauma are getting in the way"]],
  ["Consulting", ["An expert to solve it", "A defined business problem", "The consultant", "A specialist in that subject", "You need a plan or a deliverable by a date"]],
];
const STAGES = [
  ["Stage 1", "Get clear", "Single session", "$340", "One knotty question, 90 focused minutes.", ["A written summary within a day", "Good for a decision on a deadline"], "Week 1", "38%"],
  ["Stage 2", "Try things", "3-month programme", "$2,450", "Most people start here. You test new habits on real work and we adjust as you go.", ["6 sessions, 60 minutes, every two weeks", "Short messages between sessions", "A goals conversation at the start"], "Month 3", "65%"],
  ["Stage 3", "Make it stick", "6-month partnership", "$4,400", "For a role change or a long stretch of change, when you want someone alongside you for all of it.", ["12 sessions, 60 minutes", "Feedback interviews with up to 5 colleagues", "A written review at the close"], "Month 6", "100%"],
];
const AVAIL = [10, 11, 12, 17, 18, 19, 24, 26], SEL = 10;
const FAQ = [
  ["Is what I say confidential?", "Yes, with limits I explain at the start. The only exceptions are a serious risk of harm or a legal duty to disclose. I keep brief notes, and you can read them."],
  ["My employer is paying. What do they get to know?", "We agree goals together in a three-way meeting at the start. After that they hear that sessions happened, and anything further comes from you."],
  ["How will I know if it is working?", "We name what you want to be different at the start and review it every few sessions. I cannot promise an outcome. I can promise close attention and honesty."],
  ["Online or in person?", "Mostly by video. I also see people in person on Mondays at my room on Ropewalk Yard."],
  ["What if we are not a good fit?", "Tell me, or I will tell you. Unused sessions are refunded, and I will suggest someone else if I can."],
  ["Do you write CVs or prepare people for interviews?", "I do not write CVs. We can work on how you talk about your work, and what you want next."],
];

const web = (p, st) => {
  const who = `Ruth ${p.name.split(" ")[0]}`;
  return K.page(st, `${K.nav(p, ["Is coaching right?", "Packages", "Method", "Essays"], "Book a free call")}
<main class="co">
<section class="sk-wrap co-hero" id="top">
  <div class="co-byline"><span>${esc(who)}</span><span>Leadership and career coach</span></div>
  <h1>You don’t need more advice. You need room to think.</h1>
  <div class="co-intro">
    <div class="co-port">${portrait(who)}</div>
    <div class="co-bio"><p>I work with managers and senior specialists who are good at their jobs and quietly unsure what comes next. I spent nineteen years running operations teams before I trained as a coach, so I know what a Tuesday feels like.</p><p class="muted" style="font-size:15px">One person, a small practice, no team of associates. You will always work with me.</p><span class="co-slot">Add your coaching qualification and membership details here</span></div>
    <aside class="card co-next"><b>Free 20-minute call</b><p class="muted">We talk about what is going on and whether coaching is the right kind of help. No pitch.</p><a class="btn primary sk-btn-lg" href="#book-a-free-call">Book a free call</a><span class="muted" style="font-size:13px">Three places open for January.</span></aside>
  </div>
</section>

<section class="sk-sec sk-alt"><div class="sk-wrap co-who">
  <div class="sk-stack" style="gap:10px"><span class="sk-eyebrow">Who it’s for</span><h2 class="sk-h2">You might recognise yourself here</h2><p class="muted">If you want someone to tell you what to do, I am probably the wrong person.</p></div>
  <ol class="co-list">${["You now lead people who were your peers last year.", "You are a strong specialist, unsure management is what you want.", "You run a team, and your calendar runs you.", "You have been told to be “more strategic”, and nobody will say what that means.", "You are deciding whether to stay or go, and want to do it on purpose.", "You are coming back after redundancy, illness or a career break."].map((t) => `<li>${t}</li>`).join("")}</ol>
</div></section>

<section class="sk-sec" id="is-coaching-right"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">Before you book</span><h2 class="sk-h2">Is coaching what you need?</h2><p class="muted">People often arrive needing something else. These four get mixed up all the time, and each is good at different things.</p></div></div>
  <div class="co-cmp sk-rail">
    <div class="co-c co-lab"><span></span>${ROWS.map((r) => `<div>${r}</div>`).join("")}</div>
    ${CMP.map(([n, cells, me]) => `<article class="co-c ${me || ""}"><h3>${n}</h3>${cells.map((c, i) => `<div><small>${ROWS[i]}</small>${c}</div>`).join("")}</article>`).join("")}
  </div>
  <div class="co-state"><span>${ic("shield", 26)}</span><div><b>Coaching is not therapy.</b><p>I am not a therapist or a clinician, and I do not diagnose or treat mental health conditions. If what is on your mind is affecting your health or safety, please speak to a doctor or a licensed therapist first. If it comes up in our work, I will say so and we will pause. In an emergency, call your local emergency number.</p></div></div>
</div></section>

<section class="sk-sec sk-alt" id="packages"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">Working together</span><h2 class="sk-h2">Three stages. Stop at any of them.</h2></div></div>
  <div class="co-map sk-rail">${STAGES.map(([s, n, pk, pr, d, ls, end, w]) => `<article class="co-s"><div class="co-tr" style="--w:${w}"><i></i><em>${end}</em></div><small>${s}</small><h3>${n}</h3><div class="co-pk"><span>${pk}</span><span class="num">${pr}</span></div><p>${d}</p><ul>${ls.map((l) => `<li>${ic("check", 14)}<span>${l}</span></li>`).join("")}</ul></article>`).join("")}</div>
  <p class="co-fund">${ic("users", 16)}<span><b style="color:var(--text)">If your employer is paying,</b> we agree goals in a three-way meeting, then what you say in sessions stays between us. Prices exclude tax. Monthly payment is fine.</span></p>
</div></section>

<section class="sk-sec" id="method"><div class="sk-wrap co-how">
  <div><span class="sk-eyebrow">The method</span><h2 class="sk-h2" style="margin-top:10px">Slow down, then do one thing</h2>
    <div class="co-method">${[["Notice", "What actually happened this fortnight, not the story about it."], ["Name", "The real question under the one you came in with."], ["Try", "One small experiment on live work, before our next session."], ["Review", "What changed, what didn’t, and what that tells you."]].map(([h, d]) => `<div><b>${h}</b><p>${d}</p></div>`).join("")}</div></div>
  <div class="card co-sess"><h3 class="sk-h3" style="font-size:calc(23px * var(--hs))">A sample session, 60 minutes</h3><p>Example: a new director who keeps rewriting her team’s work.</p>
    <ol>${[["0:00", "Arrive. A minute of quiet, then what is here today."], ["0:05", "Last time. What you tried, and what surprised you."], ["0:15", "Today’s question. “My team isn’t stepping up” becomes something we can work on."], ["0:30", "Look closer. What you are assuming, and what the rewriting protects."], ["0:45", "Options. You name three. I push on the one you skipped."], ["0:55", "Commit. One experiment, small enough to actually do."]].map(([t, d]) => `<li><span class="num">${t}</span><span>${d}</span></li>`).join("")}</ol></div>
</div></section>

<section class="sk-sec sk-alt" id="book-a-free-call"><div class="sk-wrap">
  <form class="card co-book" aria-label="Book a free discovery call">
    <div><span class="sk-eyebrow">Discovery call</span><h2 class="sk-h2" style="font-size:calc(34px * var(--hs))">Twenty minutes, free, no pitch</h2><ul class="co-points">${["We talk about what is going on", "I tell you honestly if I can help", "If coaching is not it, I will say what might be"].map((t) => `<li>${ic("check", 14)}<span>${t}</span></li>`).join("")}</ul></div>
    <div><div class="co-mon"><b>November 2026</b><span>${ic("back", 15)}${ic("chevron", 15)}</span></div>
      <div class="co-cal" aria-label="Calendar for November 2026">${["M", "T", "W", "T", "F", "S", "S"].map((d) => `<span class="dw">${d}</span>`).join("")}${"<span></span>".repeat(6)}${Array.from({ length: 30 }, (_, i) => i + 1).map((d) => `<span class="${d === SEL ? "sel" : AVAIL.includes(d) ? "av" : ""}">${d}</span>`).join("")}</div></div>
    <div><b>Tue 10 Nov</b><div class="co-slots">${["9:30 AM", "11:00 AM", "2:00 PM", "4:30 PM"].map((t, i) => `<span class="${i === 1 ? "on" : ""}">${t}</span>`).join("")}</div>
      <div class="sk-field"><label for="co-name">Your name</label><input class="sk-input" id="co-name" value="Priya Nair"></div>
      <div class="sk-field"><label for="co-mail">Email</label><input class="sk-input" id="co-mail" value="priya@brightwell.example"></div>
      <button class="btn primary sk-btn-lg" type="button">Book Tue 10 Nov, 11:00 AM</button></div>
  </form>
</div></section>

<section class="sk-sec sk-tight" id="client-notes"><div class="sk-wrap">
  <div class="sk-head" style="margin-bottom:22px"><div><span class="sk-eyebrow">Client notes</span><p class="muted" style="font-size:14px">Sample notes for this template, written to show the tone. Names and roles are invented.</p></div></div>
  <div class="co-notes sk-rail">${[["I came in wanting a script for a hard conversation and left with a better question to ask myself.", "Director of operations"], ["What helped was being asked things nobody at work asks. Not whether I was right, but what I was protecting.", "Head of product"], ["I still don’t know if I’m staying. But I know what I would need to see, and I stopped rehearsing my exit in the shower.", "Principal engineer"]].map(([q, r]) => `<figure class="co-note"><p>“${q}”</p><figcaption>${r}</figcaption></figure>`).join("")}</div>
</div></section>

<section class="sk-sec sk-alt sk-tight" id="essays"><div class="sk-wrap co-read">
  <div><span class="sk-eyebrow">Essays</span><ol class="co-es">${[["The first ninety days nobody warns you about", "12 Oct · 6 min"], ["What “be more strategic” usually means", "21 Sep · 5 min"], ["How to stop rewriting your team’s work", "30 Aug · 7 min"], ["Staying is a decision too", "2 Aug · 4 min"]].map(([t, d]) => `<li><b>${t}</b><span>${d}</span></li>`).join("")}</ol></div>
  <form class="co-let" aria-label="Newsletter sign-up"><h2>One letter a month</h2><p>One idea on leading people and on deciding what you want next. Sent the last Friday of the month.</p><div class="sk-field"><label for="co-news">Email</label><input class="sk-input" id="co-news" value="you@work.example"></div><button class="btn sk-btn-lg" type="button">Send me the letter</button><small>Unsubscribe in one click.</small></form>
</div></section>

<section class="sk-sec sk-tight" id="faq"><div class="sk-wrap co-faq">
  <div class="sk-stack" style="gap:10px"><span class="sk-eyebrow">FAQ</span><h2 class="sk-h2">Fair questions</h2><p class="muted">Anything else? hello@tallowmere.example</p></div>
  <div>${FAQ.map(([q, a], i) => `<details ${i < 1 ? "open" : ""}><summary>${q}${ic("chevdown", 16)}</summary><p>${a}</p></details>`).join("")}</div>
</div></section>
</main>
${K.footer(p, "Leadership and career coaching with one coach, by video or on Ropewalk Yard.", [["Work together", ["Single session", "3-month programme", "6-month partnership", "Employer-funded coaching"]], ["Read", ["Essays", "Monthly letter", "Is coaching what you need?"]], ["Contact", ["9 Ropewalk Yard", "(555) 014-3386", "hello@tallowmere.example"]]], `© 2026 ${p.name}. Fictional practice created for this template. Coaching is not therapy.`)}`, CSS);
};

module.exports = {
  "coaching-website": K.def("coach", "Coaching website",
    "a typographic personal-brand coaching home page: navigation with a book-a-free-call button, an oversized statement headline, an illustrated portrait with a short bio, a marked credentials slot and a free-call card, a numbered who-it-is-for list, an is-coaching-what-you-need comparison of coaching, mentoring, therapy and consulting with a clear coaching-is-not-therapy statement, a three-stage engagement map with single session, 3-month and 6-month packages and prices, the method beside a sample session outline, discovery call booking with a mock calendar and time slots, sample client notes, essays beside a newsletter sign-up, an FAQ accordion and a footer",
    ["navigation-header", "hero", "portrait-illustration", "personal-brand", "numbered-list", "comparison-table", "callout", "timeline", "pricing", "packages", "steps", "agenda", "booking-form", "calendar", "time-slots", "testimonials", "blog-list", "newsletter-signup", "faq", "accordion", "footer", "coaching"], web),
};
