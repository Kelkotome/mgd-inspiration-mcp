/* Fertility clinic website template (Moonfern Fertility, a fictional outpatient fertility clinic). Very calm, written for people who may be exhausted, and
   inclusive of individuals and couples: a dusk hero with a quiet moon and fern, ways people arrive, the care pathway on a moon-phase line (including stopping
   or taking a break), a plain statement that the clinic does not promise outcomes, treatments in neutral words, a transparent cost guide with an honest
   not-included list, emotional support, team with a credentials slot, and a private first question form.
   No success rates, statistics, testimonials or baby imagery. No drug names or doses. Artwork is inline SVG drawn from the theme colours. */
const { ic, esc } = require("../lib");
const K = require("../sitekit");

const CSS = `<style>
.fe{--fe-soft:color-mix(in oklab,var(--primary) 7%,var(--bg))}
.fe>.sk-sec{padding:60px 0}
.fe .sk-head{margin-bottom:30px}
.fe .sk-head>div:first-child{max-width:720px}
.fe-narrow{max-width:640px}
.fe-hero{position:relative;overflow:hidden;background:linear-gradient(180deg,color-mix(in oklab,var(--primary) 24%,var(--bg)),var(--bg) 92%)}
.fe-hero .sk-wrap{position:relative;min-height:560px;padding-top:96px;padding-bottom:52px}
.fe-art{position:absolute;right:-30px;top:-8px;width:640px;height:auto;pointer-events:none}
.fe-art .moon{fill:color-mix(in oklab,var(--primary) 10%,var(--bg))}
.fe-art .halo{fill:color-mix(in oklab,var(--bg) 40%,transparent)}
.fe-art .line{fill:none;stroke:color-mix(in oklab,var(--primary) 62%,var(--text));stroke-width:2;stroke-linecap:round}
.fe-h1{font-size:calc(58px * var(--hs));line-height:1.08;max-width:640px}
.fe-hero .sk-lede{margin-top:20px;font-size:19px;line-height:1.6;max-width:540px}
.fe-cta{display:flex;flex-wrap:wrap;gap:12px 24px;align-items:center;margin-top:28px}
.fe-link{font-weight:600;display:inline-flex;align-items:center;gap:6px;font-size:15px}
.fe-rest{font-size:15px;line-height:1.6;color:var(--muted);max-width:480px;margin-top:26px;padding-left:18px;border-left:2px solid color-mix(in oklab,var(--primary) 45%,var(--bg))}
.fe-arrive{display:grid;grid-template-columns:minmax(0,.8fr) minmax(0,1.2fr);gap:64px;align-items:start}
.fe-list{list-style:none;display:grid}
.fe-list li{display:grid;grid-template-columns:210px minmax(0,1fr);gap:16px;align-items:baseline;padding:13px 0;border-top:1px solid var(--border);font-size:16px;font-weight:500}
.fe-list li:last-child{border-bottom:1px solid var(--border)}
.fe-list span{font-size:14.5px;font-weight:400;color:var(--muted)}
.fe-path{display:grid}
.fe-step{display:grid;grid-template-columns:64px minmax(0,1fr) minmax(0,1.3fr);gap:32px;padding-bottom:14px;position:relative}
.fe-step:not(:last-child)::before{content:"";position:absolute;left:31px;top:60px;bottom:6px;width:2px;background:var(--border)}
.fe-phase{display:block;width:60px;height:60px}
.fe-phase .bk{fill:color-mix(in oklab,var(--primary) 12%,var(--surface));stroke:color-mix(in oklab,var(--primary) 55%,var(--text));stroke-width:1.500}
.fe-phase .lt{fill:color-mix(in oklab,var(--primary) 60%,var(--bg))}
.fe-step h3{font-size:calc(25px * var(--hs));line-height:1.2;padding-top:14px}
.fe-step .sm{font-size:13.5px;color:var(--muted);margin-top:6px}
.fe-step p{font-size:16px;line-height:1.65;color:var(--muted);padding-top:15px}
.fe-promise{background:var(--fe-soft);border-block:1px solid var(--border);text-align:center}
.fe-promise .sk-wrap{display:grid;justify-items:center;gap:18px}
.fe-promise h2{font-size:calc(46px * var(--hs));line-height:1.12;max-width:780px}
.fe-promise p{font-size:17px;line-height:1.65;color:var(--muted);max-width:620px}
.fe-tx{display:grid;margin-top:8px}
.fe-tx article{display:grid;grid-template-columns:minmax(0,.75fr) minmax(0,1.5fr);gap:40px;padding:15px 0;border-top:1px solid var(--border);align-items:baseline}
.fe-tx article:last-child{border-bottom:1px solid var(--border)}
.fe-tx h3{font-size:calc(22px * var(--hs));line-height:1.2}
.fe-tx h3 small{display:block;font:500 13px/1.4 var(--font-b);letter-spacing:0;color:var(--muted);text-transform:none;margin-top:3px}
.fe-tx p{font-size:16px;line-height:1.6;color:var(--muted)}
.fe-cost{display:grid;grid-template-columns:minmax(0,1.75fr) minmax(0,1fr);gap:48px;align-items:start}
.fe-fees{padding:0;overflow:hidden}
.fe-fees table{width:100%;border-collapse:collapse;font-size:15px}
.fe-fees th,.fe-fees td{text-align:left;padding:12px 18px;border-bottom:1px solid var(--border);vertical-align:top}
.fe-fees th{font-size:12px;font-weight:600;letter-spacing:.04em;color:var(--muted);background:var(--fe-soft)}
.fe-fees td+td{font-size:13.5px;color:var(--muted)}
.fe-fees td:first-child{font-weight:500}
.fe-fees td.num,.fe-fees th:last-child{text-align:right;white-space:nowrap}
.fe-fees td.num{font-size:15px;color:var(--text)}
.fe-fees tr:last-child td{border-bottom:0}
.fe-fnote{padding:14px 22px;font-size:13px;color:var(--muted);border-top:1px solid var(--border)}
.fe-not h3{font-size:calc(25px * var(--hs));line-height:1.2;margin-bottom:10px}
.fe-not ul{list-style:none;display:grid}
.fe-not li{display:grid;grid-template-columns:18px minmax(0,1fr);gap:10px;padding:11px 0;border-bottom:1px solid var(--border);font-size:15px}
.fe-not li i{width:9px;height:2px;margin-top:11px;background:var(--muted)}
.fe-not p{margin-top:14px;font-size:14px;color:var(--muted)}
.fe-care{background:var(--fe-soft);border-block:1px solid var(--border)}
.fe-care .sk-wrap{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.1fr);gap:64px}
.fe-care h2{margin-top:12px}
.fe-care .lede{font-size:17px;line-height:1.65;color:var(--muted);margin-top:14px}
.fe-sup{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px 32px;align-content:start}
.fe-sup h3{font:600 16px/1.35 var(--font-b);letter-spacing:0}
.fe-sup p{font-size:15px;line-height:1.6;color:var(--muted)}
.fe-team{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:0 28px;margin-top:8px}
.fe-team article{padding:18px 0;border-top:1px solid var(--border)}
.fe-team h3{font-size:calc(21px * var(--hs));line-height:1.2}
.fe-team .r{font-size:14px;margin:2px 0 6px}
.fe-team p{font-size:14.5px;color:var(--muted)}
.fe-slot{margin-top:22px;padding:14px 18px;border:2px dashed var(--border);border-radius:var(--radius);font-size:14px;font-weight:500;color:var(--muted);display:flex;gap:10px;align-items:center}
.fe-slot svg{flex:0 0 auto}
.fe-ask{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);gap:64px;align-items:start}
.fe-ask h2{margin-top:12px}
.fe-ask .lede{font-size:17px;line-height:1.65;color:var(--muted);margin-top:14px}
.fe-facts{list-style:none;display:grid;gap:12px;margin-top:22px;font-size:15px}
.fe-facts li{display:grid;grid-template-columns:20px minmax(0,1fr);gap:10px}
.fe-facts svg{margin-top:3px;color:color-mix(in oklab,var(--primary) 70%,var(--text))}
.fe-form{padding:32px;display:grid;gap:14px}
.fe-form .sk-g2{gap:14px}
.fe-radio{display:flex;flex-wrap:wrap;gap:8px}
.fe-radio label{min-height:40px;padding:6px 14px;border:1px solid var(--border);border-radius:var(--radius);display:inline-flex;align-items:center;gap:8px;font-size:14px;font-weight:500;background:var(--bg)}
.fe-radio label.on{border-color:var(--primary);box-shadow:inset 0 0 0 1px var(--primary)}
.fe-small{font-size:13px;color:var(--muted)}
@media (max-width:1180px){.fe-art{width:520px}}
@media (max-width:1024px){
  .fe>.sk-sec{padding:72px 0}
  .fe-hero .sk-wrap{min-height:0;padding-top:72px}
  .fe-art{width:380px;right:-20px;top:-6px}
  .fe-h1{max-width:500px}
  .fe-hero .sk-lede{max-width:470px}
  .fe-arrive,.fe-cost,.fe-care .sk-wrap,.fe-ask{grid-template-columns:minmax(0,1fr);gap:36px}
  .fe-step{grid-template-columns:64px minmax(0,1fr);gap:0 24px}
  .fe-step p{grid-column:2;padding-top:8px}
  .fe-team{grid-template-columns:repeat(2,minmax(0,1fr))}
}
@media (max-width:760px){
  .fe>.sk-sec{padding:40px 0}
  .fe .sk-head>p{display:none}
  .fe .sk-head{margin-bottom:20px}
  .fe-hero .sk-wrap{padding-top:176px;padding-bottom:40px}
  .fe-art{width:190px;right:-14px;top:-8px}
  .fe-rest{margin-top:20px}
  .fe-h1{font-size:calc(38px * var(--hs));line-height:1.1}
  .fe-hero .sk-lede{font-size:16px;margin-top:14px}
  .fe-cta{margin-top:20px}
  .fe-list li{grid-template-columns:minmax(0,1fr);gap:0;padding:10px 0;font-size:16px}
  .fe-arrive{gap:20px}
  .fe-step{grid-template-columns:44px minmax(0,1fr);gap:0 14px;padding-bottom:22px}
  .fe-step:not(:last-child)::before{left:21px;top:46px}
  .fe-phase{width:44px;height:44px}
  .fe-step h3{font-size:calc(21px * var(--hs));padding-top:9px}
  .fe-step .sm{margin-top:2px;font-size:13px}
  .fe-step p{font-size:15px;line-height:1.55;padding-top:6px}
  .fe-promise h2{font-size:calc(31px * var(--hs))}
  .fe-promise p{font-size:15.5px}
  .fe-tx article{grid-template-columns:minmax(0,1fr);gap:4px;padding:14px 0}
  .fe-tx p{font-size:15px}
  .fe-fees th,.fe-fees td{padding:11px 14px}
  .fe-fees td{font-size:14px}
  .fe-fees th:nth-child(2),.fe-fees td:nth-child(2){display:none}
  .fe-fnote{padding:12px 14px}
  .fe-not li{padding:9px 0}
  .fe-sup{grid-template-columns:minmax(0,1fr);gap:14px}
  .fe-sup>div:last-child{display:none}
  .fe-team{display:flex;margin-top:0}
  .fe-team article{padding:16px;border:1px solid var(--border);border-radius:var(--radius-lg)}
  .fe-slot{margin-top:14px}
  .fe-form{padding:20px}
  .sk-foot-grid{grid-template-columns:minmax(0,1fr) minmax(0,1.25fr);gap:28px 16px}
  .sk-foot li{font-size:13.5px}
}
</style>`;

// ---- artwork -------------------------------------------------------------------------------------------------------
// A pale moon behind a line-drawn fern, in the theme's colours.
const frond = (n) => { // leaflets stepped along a gently curving stem
  let s = `<path class="line" d="M300 620C318 500 352 400 420 300"/>`;
  for (let i = 1; i <= n; i++) {
    const t = i / (n + 1), u = 1 - t;
    const x = u * u * u * 300 + 3 * u * u * t * 318 + 3 * u * t * t * 352 + t * t * t * 420, y = u * u * u * 620 + 3 * u * u * t * 500 + 3 * u * t * t * 400 + t * t * t * 300, l = 70 * (1 - t * .78);
    s += `<path class="line" d="M${x.toFixed(1)} ${y.toFixed(1)}q${(-l * .55).toFixed(1)} ${(-l * .1).toFixed(1)} ${(-l).toFixed(1)} ${(-l * .5).toFixed(1)}"/><path class="line" d="M${x.toFixed(1)} ${y.toFixed(1)}q${(l * .6).toFixed(1)} ${(l * .02).toFixed(1)} ${(l * 1.05).toFixed(1)} ${(-l * .22).toFixed(1)}"/>`;
  }
  return s;
};
const art = () => `<svg class="fe-art" viewBox="0 0 640 640" aria-hidden="true"><circle class="halo" cx="380" cy="230" r="210"/><circle class="moon" cx="380" cy="230" r="160"/>${frond(11)}</svg>`;

// Moon phases for the pathway. k: how far the lit shape reaches across the disc, from a thin crescent (.15) to full (1).
const phase = (k, id) => { const r = 24, c = 30, a = (1 - 2 * k) * r;
  const d = k >= 1 ? "" : `<path class="lt" d="M${c} ${c - r}A${r} ${r} 0 0 1 ${c} ${c + r}A${Math.abs(a).toFixed(1)} ${r} 0 0 ${k > .5 ? 1 : 0} ${c} ${c - r}z"/>`;
  return `<svg class="fe-phase" viewBox="0 0 60 60" role="img" aria-label="Moon phase, step ${id}"><circle class="bk" cx="${c}" cy="${c}" r="${r}"/>${k >= 1 ? `<circle class="lt" cx="${c}" cy="${c}" r="${r}"/>` : d}</svg>`; };

// ---- content -------------------------------------------------------------------------------------------------------
const ARRIVE = [
  ["On your own", "Thinking about parenthood or freezing eggs or sperm by yourself."],
  ["With a partner", "Any couple, any genders. Whoever you are together."],
  ["After treatment elsewhere", "Bring what you have and we will read it with you."],
  ["After a loss", "You can tell us as much or as little as you like."],
  ["Not sure yet", "You may only want information. That is enough of a reason."],
];
const PATH = [
  [.15, "A first conversation", "45 minutes, by video or in person", "You talk with a fertility nurse about where you are and what you would like to know. Nothing is decided and nothing is booked unless you ask."],
  [.35, "Tests for you, or both of you", "Usually one or two short visits", "Blood tests, a scan or a semen analysis, depending on your situation. We explain what each one is for before you agree to it."],
  [.5, "A plan together", "A long appointment with your doctor", "We go through your results in plain words and set out the options, including doing nothing for now. You can take it home and think."],
  [.75, "A treatment cycle", "A few weeks, with visits along the way", "If you choose treatment, one nurse stays your main contact. You get a written calendar, and you can ask to change pace."],
  [1, "What comes next", "Whatever that turns out to be", "Another cycle, a change of plan, a pause, or stopping. Stopping is a real option, and taking a break is too. We will talk it through and support you either way."],
];
const TX = [
  ["Fertility assessment", "For one person or two", "A review of your history with tests chosen for you, so that you and your doctor can talk through what is known."],
  ["Monitored cycles", "Following your own cycle", "Scans and blood tests track your cycle, so you can see when ovulation is likely."],
  ["IUI", "Intrauterine insemination", "Prepared sperm is placed in the uterus through a thin tube, around the time of ovulation."],
  ["IVF", "In vitro fertilization", "Eggs are collected and combined with sperm in the lab. An embryo may then be placed in the uterus."],
  ["Egg and sperm freezing", "For keeping options open", "Eggs or sperm are collected, frozen and stored for possible use later."],
];
const FEES = [
  ["First conversation", "With a fertility nurse", "No charge"],
  ["Assessment, one person", "Consult, tests and results visit", "$420"],
  ["Assessment, two people", "As above, for both of you", "$680"],
  ["Monitored cycle", "Scans and bloods for one cycle", "$760"],
  ["IUI cycle", "Monitoring, sperm preparation, procedure", "$1,350"],
  ["IVF cycle", "Monitoring, collection, lab work, one transfer", "$8,900"],
  ["Egg freezing cycle", "Monitoring, collection, freezing", "$6,400"],
  ["Sperm freezing", "Analysis, freezing, first year of storage", "$540"],
];
const NOT = ["Medicines, which vary by person and plan", "Sedation fees for egg collection", "Storage after the first year", "Further frozen embryo transfers", "Donor sperm, eggs or embryos", "Extra tests your doctor may suggest"];
const SUP = [
  ["A counselor who is not part of your treatment", "Two sessions come with every treatment plan. You can come alone or together, before, during or after."],
  ["Time to think", "No one will ask you to decide in the room. Every plan goes home with you in writing."],
  ["A quieter waiting room", "No baby photos on the walls, and a separate side room if you would prefer to wait there."],
  ["Words we try to avoid", "Tell us what to call you, your partner and your experience, and we will use those words."],
];
const TEAM = [
  ["Dr Leila Marchwood", "Fertility doctor", "Specialist training in obstetrics and gynecology, with further training in reproductive medicine."],
  ["Dr Tobias Ennerly", "Fertility doctor", "Specialist training in reproductive medicine. Sees people on their own and couples of all kinds."],
  ["Sana Holloway-Reyes", "Lead fertility nurse", "Registered nurse with further training in fertility care. Your first point of contact."],
  ["Marit Oyelaran", "Counselor", "Trained in counseling, with a focus on fertility and loss. Works separately from the medical team."],
];

const web = (p, st) => K.page(st, `${K.nav(p, ["Your care", "Treatments", "Costs", "Support", "Our team"], "Ask a private question")}
<main class="fe">
<section class="fe-hero" id="top">${art()}<div class="sk-wrap">
  <div class="fe-htext"><span class="sk-eyebrow">A fertility clinic for individuals and couples</span>
    <h1 class="fe-h1" style="margin-top:14px">You can start with one quiet question</h1>
    <p class="sk-lede">${esc(p.name)} is here for people at every point of this, including those who are tired of it. We will go at a pace that suits you.</p>
    <div class="fe-cta"><a class="btn primary sk-btn-lg" href="#ask-a-private-question">Ask a private question</a><a class="fe-link" href="#your-care">How care works here ${ic("arrow", 15)}</a></div>
    <p class="fe-rest">You do not have to decide anything today, and you do not need a referral to talk to us.</p></div>
</div></section>

<section class="sk-sec" id="arrive"><div class="sk-wrap fe-arrive">
  <div><span class="sk-eyebrow">Wherever you are starting from</span><h2 class="sk-h2" style="margin-top:12px">People come to us in many ways</h2></div>
  <ul class="fe-list">${ARRIVE.map(([t, d]) => `<li>${t}<span>${d}</span></li>`).join("")}</ul>
</div></section>

<section class="sk-sec sk-tight" id="your-care" style="padding-top:0"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">Your care</span><h2 class="sk-h2">One step at a time, and you can stop at any of them</h2></div></div>
  <div class="fe-path">${PATH.map(([k, t, w, d], i) => `<article class="fe-step">${phase(k, i + 1)}<div><h3>${t}</h3><div class="sm">${w}</div></div><p>${d}</p></article>`).join("")}</div>
</div></section>

<section class="sk-sec fe-promise" id="honest"><div class="sk-wrap">
  <span class="sk-eyebrow">Plainly</span>
  <h2>We do not promise outcomes</h2>
  <p>Fertility care does not work the same way for everyone, and your options depend on you. We will tell you what we know, what we do not know, and when it may be time to talk about something different.</p>
</div></section>

<section class="sk-sec" id="treatments"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">Treatments</span><h2 class="sk-h2">What we offer, in plain words</h2></div><p class="muted" style="max-width:320px">Not everything here suits everyone. Your doctor will talk through what may apply to you.</p></div>
  <div class="fe-tx">${TX.map(([t, s, d]) => `<article><h3>${t}<small>${s}</small></h3><p>${d}</p></article>`).join("")}</div>
</div></section>

<section class="sk-sec sk-alt" id="costs"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">Cost guide</span><h2 class="sk-h2">What it costs, and what that leaves out</h2></div><p class="muted" style="max-width:320px">Money is part of this. You will get a written estimate before anything starts.</p></div>
  <div class="fe-cost">
    <div class="card fe-fees"><table><thead><tr><th>Sample prices</th><th>What it covers</th><th>Price</th></tr></thead><tbody>${FEES.map(([t, d, v]) => `<tr><td>${t}</td><td>${d}</td><td class="num">${v}</td></tr>`).join("")}</tbody></table><p class="fe-fnote">Sample prices per cycle or visit, for this template only.</p></div>
    <div class="fe-not"><h3>What is not included</h3><ul>${NOT.map((n) => `<li><i></i><span>${n}</span></li>`).join("")}</ul><p>If a cycle stops early, we will explain what you pay and what we refund before you begin.</p></div>
  </div>
</div></section>

<section class="sk-sec fe-care" id="support"><div class="sk-wrap">
  <div><span class="sk-eyebrow">Support</span><h2 class="sk-h2">This can be a lot to carry</h2>
    <p class="lede">Emotional support is part of care here, not an extra you have to ask for. It is there for you and for anyone going through this with you.</p>
    <a class="fe-link" style="margin-top:18px" href="#ask-a-private-question">Talk to our counselor ${ic("arrow", 15)}</a></div>
  <div class="fe-sup">${SUP.map(([t, d]) => `<div><h3>${t}</h3><p>${d}</p></div>`).join("")}</div>
</div></section>

<section class="sk-sec" id="our-team"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">Our team</span><h2 class="sk-h2">The people you would meet</h2></div></div>
  <div class="fe-team sk-rail">${TEAM.map(([n, r, d]) => `<article><h3>${n}</h3><div class="r">${r}</div><p>${d}</p></article>`).join("")}</div>
  <div class="fe-slot">${ic("plus", 16)}<span>Add your registration and accreditation details here</span></div>
</div></section>

<section class="sk-sec sk-alt" id="ask-a-private-question"><div class="sk-wrap fe-ask">
  <div><span class="sk-eyebrow">Your first question</span><h2 class="sk-h2">Ask us anything, privately</h2>
    <p class="lede">It does not have to be a clear question. A few words is fine.</p>
    <ul class="fe-facts"><li>${ic("lock", 16)}<span>Only our fertility nurses read it</span></li><li>${ic("clock", 16)}<span>A reply within two working days</span></li><li>${ic("mail", 16)}<span>No mailing list, no follow-up calls unless you ask</span></li></ul>
    <p class="fe-small" style="margin-top:22px">This form is not for urgent questions. In an emergency, call your local emergency number.</p></div>
  <form class="card fe-form" aria-label="Ask a private first question">
    <div class="sk-g2"><div class="sk-field"><label for="fe-name">What should we call you?</label><input class="sk-input" id="fe-name" value="Teodora"></div><div class="sk-field"><label for="fe-mail">Email</label><input class="sk-input" id="fe-mail" value="teodora@mail.example"></div></div>
    <div class="sk-field"><span style="font-weight:500;font-size:13px">This is for</span><div class="fe-radio"><label class="on"><input type="radio" name="fe-who" checked> Just me</label><label><input type="radio" name="fe-who"> Me and a partner</label><label><input type="radio" name="fe-who"> I would rather not say</label></div></div>
    <div class="sk-field"><label for="fe-q">Your question</label><textarea class="sk-input" id="fe-q" rows="3">I am not sure where to start. Can I talk to someone before I decide about any tests?</textarea></div>
    <div class="sk-field"><label for="fe-reply">How should we reply?</label><select class="sk-input" id="fe-reply"><option>By email only</option><option>By phone, no voicemail</option><option>By phone, voicemail is fine</option></select></div>
    <button class="btn primary sk-btn-lg" type="button">Send privately</button>
  </form>
</div></section>
</main>
${K.footer(p, "An outpatient fertility clinic for individuals and couples. In an emergency, call your local emergency number.", [["Visit", ["9 Alderwick Court", "Side entrance available", "Step-free access"]], ["Contact", ["(555) 016-5540", "hello@moonfern.example", "Mon to Fri, 8:00 AM to 5:00 PM"]], ["Your care", ["How care works", "Cost guide", "Counseling"]]], "Fictional practice created for this template. General information only, not medical advice.")}`, CSS);

module.exports = {
  "fertility-website": K.def("fertility", "Fertility clinic website",
    "a very calm fertility clinic home page for individuals and couples: navigation with a private question button, a dusk hero with a pale moon and line-drawn fern and a note that nothing has to be decided today, a list of the ways people arrive, the care pathway on a moon phase line from first conversation through tests, a plan together and a treatment cycle to what comes next including stopping or taking a break, a plain statement that the clinic does not promise outcomes, treatments in neutral plain words, a transparent cost guide table with sample prices beside an honest what is not included list, emotional support and counseling, the team with a marked credentials slot, a private first question form, and a footer",
    ["navigation-header", "hero", "svg-illustration", "audience-list", "care-pathway", "timeline", "statement", "treatment-list", "pricing-table", "not-included-list", "support", "team", "credentials-slot", "contact-form", "footer", "fertility"], web),
};
