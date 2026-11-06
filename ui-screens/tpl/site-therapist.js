/* Therapist website template (Thistlewick Counselling, a fictional small private practice). Quiet first-person home page, one reading
   column with a margin of side labels and almost no cards: greeting, "Is this the right place?" (what people come about, who it may not
   suit, where else to turn), how the work goes, what happens in a first session, fees and practical terms, confidentiality and its
   limits, who you would see with a credentials slot, FAQ, a very short enquiry form and a gentle crisis note.
   No promises of feeling better, no testimonials. The thistle drawing uses theme colours; the room scene uses fixed natural tones. */
const { ic, esc } = require("../lib");
const K = require("../sitekit");

const CSS = `<style>
.th{font-size:16.5px;line-height:1.66}
.th p+p{margin-top:14px}
.th-row{display:grid;grid-template-columns:200px minmax(0,740px);gap:64px;justify-content:start;padding:40px 0;border-top:1px solid var(--border)}
.th-row:first-child{border-top:0}
.th-side{font:500 14px/1.45 var(--font-b);color:var(--muted);position:relative}
.th-side b{display:block;font-weight:600;color:var(--text)}
.th-h2{font-size:calc(34px * var(--hs));line-height:1.14;margin-bottom:18px}
.th-lead{font-family:var(--font-h);font-weight:var(--hw);letter-spacing:var(--ls);font-size:calc(23px * var(--hs));line-height:1.36}
.th-hero{display:grid;grid-template-columns:minmax(0,800px) minmax(0,1fr);gap:40px;align-items:end;padding:52px 0 36px}
.th-h1{font-size:calc(54px * var(--hs));line-height:1.08;margin-bottom:22px}
.th-hero p{max-width:640px;font-size:19px;line-height:1.65}
.th-link{display:inline-flex;align-items:center;gap:8px;font-weight:600;border-bottom:1.5px solid currentColor;padding-bottom:1px}
.th-open{font-size:15px;color:var(--muted);margin-top:22px;display:flex;flex-wrap:wrap;gap:6px 22px;align-items:center}
.th-thistle{color:color-mix(in oklab,var(--primary) 75%,var(--text));justify-self:end;width:200px}
.th-thistle svg{display:block;width:100%;height:auto}
.th-room{height:172px;border-radius:var(--radius-lg);overflow:hidden}
.th-room svg{display:block;width:100%;height:100%}
.th-about{list-style:none;margin:16px 0 20px;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:36px}
.th-about li{padding:10px 0;border-top:1px solid var(--border)}
.th-about b{font-weight:600}
.th-not{margin-top:12px;padding-left:22px;border-left:2px solid var(--border)}
.th-not ul{margin:10px 0 14px 18px;display:grid;gap:6px}
.th-time{list-style:none;margin-top:18px;display:grid;gap:12px}
.th-time li{display:grid;grid-template-columns:128px minmax(0,1fr);gap:18px}
.th-time b{font-weight:600;font-size:15px;padding-top:2px}
.th-fees{width:100%;border-collapse:collapse;margin:6px 0 20px;font-size:16px}
.th-fees td{padding:11px 0;border-bottom:1px solid var(--border);vertical-align:baseline}
.th-fees td:nth-child(2){color:var(--muted);padding-left:18px}
.th-fees td.num{text-align:right;white-space:nowrap;font-size:17px;padding-left:18px}
.th-terms{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px 36px;margin-top:22px;font-size:15.5px;line-height:1.6}
.th-terms b{display:block;font-weight:600}
.th-terms span{color:var(--muted)}
.th-limit{margin:12px 0 14px 18px;display:grid;gap:6px}
.th-who{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px 40px}
.th-who .th-slot{grid-column:1/-1;justify-self:start;margin-top:0}
.th-who h3{font-size:calc(22px * var(--hs));line-height:1.25}
.th-who .r{font-size:14px;color:var(--muted);margin-bottom:6px}
.th-cred{font-size:15px;color:var(--muted);margin-top:6px}
.th-slot{display:inline-block;border:1.5px dashed color-mix(in oklab,var(--text) 45%,var(--border));border-radius:var(--radius);padding:9px 14px;font-size:14px;font-weight:500;color:var(--muted);margin-top:12px}
.th-faq details{border-top:1px solid var(--border);padding:12px 0}
.th-faq details:last-child{border-bottom:1px solid var(--border)}
.th-faq summary{list-style:none;cursor:pointer;display:flex;justify-content:space-between;gap:16px;font-weight:600;align-items:center}
.th-faq summary::-webkit-details-marker{display:none}
.th-faq summary .i{transition:transform .15s;color:var(--muted)}
.th-faq details[open] summary .i{transform:rotate(180deg)}
.th-faq details p{margin-top:8px;font-size:16px;color:var(--muted)}
.th-form{display:grid;gap:14px;margin-top:20px;max-width:520px}
.th-form .sk-input{background:var(--bg)}
.th-form textarea.sk-input{min-height:84px}
.th-next{font-size:15.5px;color:var(--muted);margin-top:14px;max-width:560px}
.th-crisis{display:grid;grid-template-columns:200px minmax(0,740px);gap:64px;padding:26px 0;border-block:1px solid var(--border);font-size:16px}
.th-crisis b{font-weight:600}
@media (max-width:1024px){
  .th-row,.th-crisis{grid-template-columns:150px minmax(0,1fr);gap:32px}
  .th-thistle{width:150px}
}
@media (max-width:760px){
  .th{font-size:16px;line-height:1.6}
  .th p+p{margin-top:12px}
  .th-hero{grid-template-columns:minmax(0,1fr);gap:0;padding:32px 0 26px}
  .th-thistle{display:none}
  .th-h1{font-size:calc(36px * var(--hs));margin-bottom:14px}
  .th-hero p{font-size:17px}
  .th-room{height:140px}
  .th-row,.th-crisis{grid-template-columns:minmax(0,1fr);gap:8px}
  .th-row{padding:30px 0}
  .th-about,.th-who{grid-template-columns:minmax(0,1fr)}
  .th-faq details:nth-child(6){display:none}
  .th-crisis{padding:18px 0;gap:2px}
  .th-side b{display:inline}
  .th-side span{display:none}
  .th-h2{font-size:calc(27px * var(--hs));margin-bottom:12px}
  .th-lead{font-size:calc(20px * var(--hs))}
  .th-about li{padding:8px 0}
  .th-time li{grid-template-columns:minmax(0,1fr);gap:0}
  .th-terms{grid-template-columns:minmax(0,1fr);gap:10px}
  .th-fees td:nth-child(2){display:none}
  .th-fees td{padding:9px 0}
  .th-opt{display:none}
}
</style>`;

// A single thistle stem drawn with theme colours, so it follows every style and dark mode.
const tuft = (cx, cy, r, n) => Array.from({ length: n }, (_, i) => { const t = (-160 + (140 * i) / (n - 1)) * Math.PI / 180, j = i % 2 ? 1 : 0.8; return `M${cx} ${cy}L${(cx + Math.cos(t) * r * j).toFixed(1)} ${(cy + Math.sin(t) * r * j).toFixed(1)}`; }).join("");
const bulb = (cx, cy, s) => `<g transform="translate(${cx} ${cy}) scale(${s})"><path d="M-22 2C-26-14-20-28 0-30 20-28 26-14 22 2 14 16-14 16-22 2z" fill="color-mix(in oklab,currentColor 14%,transparent)"/><path d="M-20-12L4 12M-8-27L20 2M20-12L-4 12M8-27L-20 2"/></g>`;
const thistle = () => `<svg viewBox="0 0 200 300" role="img" aria-label="Line drawing of a thistle stem" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
<path d="M104 296C100 236 104 176 94 112"/><path d="M99 186c18-6 34-22 46-50"/>
<path d="${tuft(94, 70, 52, 15)}"/>${bulb(94, 96, 1)}
<path d="${tuft(146, 112, 32, 11)}"/>${bulb(146, 126, 0.66)}
<path d="M102 250c-12-2-18-8-24-16l2 12-14-8 4 12-16-4 8 10c14 6 28 6 40-6zM103 214c12-2 20-8 26-16l-1 12 14-8-4 12 16-4-8 10c-14 6-30 6-43-6z"/></svg>`;

// The consulting room, fixed natural tones: two chairs turned towards each other, low lamp, long window, bookcase.
const roomScene = () => `<svg viewBox="0 0 1200 230" preserveAspectRatio="xMidYMax slice" role="img" aria-label="A quiet room with two armchairs, a low table and a long window">
<defs><linearGradient id="th-w" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d9e4dc"/><stop offset="1" stop-color="#bcd0c6"/></linearGradient></defs>
<rect width="1200" height="230" fill="#e9e2d6"/><rect y="186" width="1200" height="44" fill="#c8b69c"/>
<rect x="60" y="24" width="300" height="124" rx="4" fill="url(#th-w)"/><path d="M160 24v124M260 24v124" stroke="#f4efe6" stroke-width="7"/><path d="M60 148c50-24 100-34 160-22s100 10 140-6v28z" fill="#9db59c"/><rect x="46" y="148" width="328" height="10" fill="#d8ccba"/>
<rect x="555" y="30" width="90" height="118" fill="#d7c9b1"/><rect x="567" y="44" width="66" height="44" fill="#a9b7a4"/><rect x="567" y="98" width="66" height="36" fill="#c59d7c"/>
<g><path d="M410 188v-52c0-22 14-36 34-36h24c16 0 26 12 26 28v18h22c12 0 20 8 20 20v22z" fill="#7e8f83"/><rect x="410" y="184" width="8" height="20" fill="#5d4c3b"/><rect x="516" y="184" width="8" height="20" fill="#5d4c3b"/></g>
<g><path d="M790 188v-52c0-22-14-36-34-36h-24c-16 0-26 12-26 28v18h-22c-12 0-20 8-20 20v22z" fill="#b08866"/><rect x="782" y="184" width="8" height="20" fill="#5d4c3b"/><rect x="676" y="184" width="8" height="20" fill="#5d4c3b"/></g>
<ellipse cx="600" cy="180" rx="50" ry="9" fill="#a68a6b"/><rect x="596" y="182" width="8" height="24" fill="#5d4c3b"/><rect x="578" y="166" width="42" height="8" rx="2" fill="#efe9dc"/>
<path d="M880 186v-92" stroke="#6b5a48" stroke-width="5"/><path d="M856 96l10-38h28l10 38z" fill="#efe0bd"/><ellipse cx="880" cy="190" rx="22" ry="5" fill="#6b5a48"/>
<rect x="960" y="40" width="190" height="150" fill="#a68a6b"/>${[52, 100, 148].map((y, r) => `<rect x="970" y="${y}" width="170" height="36" fill="#7d6650"/>${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => `<rect x="${974 + i * 16}" y="${y + 6 + ((i + r) % 3) * 3}" width="12" height="${30 - ((i + r) % 3) * 3}" fill="${["#c59d7c", "#9db59c", "#e0d3bd", "#b4705a"][(i + r * 2) % 4]}"/>`).join("")}`).join("")}</svg>`;

const COMES = [
  ["Anxiety", "the worry that follows you to bed, or the feeling of always bracing for something."],
  ["Low mood", "when things have gone flat, or you cannot quite remember what you used to enjoy."],
  ["Grief", "after a death, and also after losses other people may not see as losses."],
  ["Relationships", "the same argument again, a marriage changing, or loneliness inside a family."],
  ["Burnout", "being worn down by work or caring, and no longer sure how to stop."],
  ["Big life changes", "a move, a diagnosis, a child leaving home, retiring, or a separation."],
];
const NOTFOR = [
  "you need support at short notice or between sessions, as we see people once a week by appointment",
  "you are seeking a formal diagnosis, a medication review or a report for a court",
  "you are under 18, as we work with adults only",
  "you would be better served by a team, for example for an eating disorder or heavy drinking or drug use",
];
const SESSION = [
  ["Before we meet", "I send a short note with directions or a video link, and a one-page agreement to read. There is nothing to prepare."],
  ["The first minutes", "I will explain confidentiality, then ask what brought you here. You can start wherever you like, or tell me you do not know where to start."],
  ["Most of the hour", "You talk and I listen, with a few questions so I can understand the shape of things. I may ask a little about your health, your family and what you have tried before."],
  ["The last ten minutes", "We talk about how it felt and whether it makes sense to carry on. You do not need to decide in the room."],
  ["Afterwards", "If you would like to continue, we agree a regular weekly time. If not, I am glad to suggest other places to try."],
];
const FEES = [
  ["Individual session", "50 minutes", "$90"],
  ["Couples session", "75 minutes", "$130"],
  ["First session", "50 minutes, same fee", "$90"],
  ["Sliding-scale places", "50 minutes", "$40 to $70"],
];
const TERMS = [
  ["Sliding-scale places", "We keep a few places each week for people on a low income, students and carers. Just ask, no paperwork needed."],
  ["Cancellation", "Free with 48 hours’ notice. After that the full fee applies, and I will always try to offer another time that week."],
  ["Online or in person", "In person at Larkhill Terrace on weekdays, or by video from anywhere private. You can switch between the two."],
  ["Paying", "By bank transfer or card after each session. I can provide receipts if you claim from a health plan."],
];
const FAQ = [
  ["How many sessions will I need?", "I do not know yet, and I would be wary of anyone who said they did. Some people come for six or eight weeks, others for much longer. We review how it is going together every so often, and you can stop whenever you choose.", true],
  ["What if I do not know what to say?", "That is very common, and it is fine. Silence is allowed here too. I will help us find a place to begin."],
  ["Do I need a referral?", "No. You can get in touch yourself. Some people are pointed here by their family doctor, and that is fine too."],
  ["What is the difference between counselling and psychotherapy?", "The two words overlap a great deal. In practice, counselling often focuses on something specific, and psychotherapy may go more slowly and further back. We will talk about which fits."],
  ["Will you tell my family doctor?", "Not without talking to you first, except in the situations described under confidentiality above."],
  ["Can I bring my partner to some sessions?", "If you are seeing me individually, I would usually suggest a separate couples therapist. Rafi sees couples and can talk this through with you."],
];

const web = (p, st) => K.page(st, `${K.nav(p, ["Is this the right place?", "First session", "Fees", "Questions"], "Get in touch")}
<main class="th"><div class="sk-wrap">
<section class="th-hero" id="top">
  <div><h1 class="sk-h1 th-h1">You don’t have to have the right words before you get in touch.</h1>
    <p>I’m Nell Averill, a counsellor and psychotherapist. ${esc(p.name)} is a small private practice: me, my colleague Rafi, and two quiet rooms above a bookbinder’s on Larkhill Terrace. We see adults, one person or one couple at a time.</p>
    <div class="th-open"><a class="th-link" href="#get-in-touch">Get in touch ${ic("arrow", 15)}</a><span>Currently offering weekday and early evening times</span></div></div>
  <div class="th-thistle">${thistle()}</div>
</section>
<div class="sk-photo th-room">${roomScene()}</div>

<section class="th-row" id="is-this-the-right-place" style="border-top:0">
  <div class="th-side"><b>Is this the right place?</b><span>It is a fair question, and worth asking before you spend any money.</span></div>
  <div><h2 class="sk-h2 th-h2">Most people arrive unsure whether their problem is “bad enough”. It is enough.</h2>
    <p>You don’t need a diagnosis or a crisis to come here. These are some of the things people often come about:</p>
    <ul class="th-about">${COMES.map(([t, d]) => `<li><b>${t}:</b> ${d}</li>`).join("")}</ul>
    <p>Sometimes it is none of these, only a sense that something isn’t right. That is a perfectly good reason too.</p>
    <h3 class="sk-h3" style="margin-top:28px">Who this may not be right for</h3>
    <div class="th-not"><p>I would rather tell you this now than a month from now. We may not be the right fit if:</p>
      <ul>${NOTFOR.map((t) => `<li>${t}</li>`).join("")}</ul>
      <p>If that sounds like you, you have not done anything wrong by reading this far. Your family doctor can talk through local services, and if you write to me anyway I will do my best to point you towards someone who may be a better fit.</p></div></div>
</section>

<section class="th-row" id="how-the-work-goes">
  <div class="th-side"><b>How the work goes</b><span>In plain words.</span></div>
  <div><p class="th-lead">We meet at the same time each week, for fifty minutes. You bring whatever is on your mind, and we try to understand it together.</p>
    <p style="margin-top:16px">I won’t give you a list of instructions, and I won’t tell you what to do with your life. I listen closely, I notice patterns, and sometimes I will gently ask about something you passed over quickly. My training draws on person-centred and psychodynamic ways of working, and I use some cognitive behavioural ideas when they seem useful.</p>
    <p>This kind of work can be uncomfortable at times, and I can’t promise how you will feel or by when. What I can offer is steady attention, honesty, and a place where you don’t have to look after anybody else.</p></div>
</section>

<section class="th-row" id="first-session">
  <div class="th-side"><b>Your first session</b><span>It is a chance to see how it feels. You are not signing up for anything.</span></div>
  <div><h2 class="sk-h2 th-h2">What happens in a first session</h2>
    <ol class="th-time" style="list-style:none">${SESSION.map(([t, d]) => `<li><b>${t}</b><span>${d}</span></li>`).join("")}</ol></div>
</section>

<section class="th-row" id="fees">
  <div class="th-side"><b>Fees and practical things</b><span>All of it, with nothing held back for the phone call.</span></div>
  <div><h2 class="sk-h2 th-h2">What it costs</h2>
    <table class="th-fees"><tbody>${FEES.map(([a, b, c]) => `<tr><td>${a}</td><td>${b}</td><td class="num">${c}</td></tr>`).join("")}</tbody></table>
    <div class="th-terms">${TERMS.map(([t, d]) => `<div><b>${t}</b><span>${d}</span></div>`).join("")}</div></div>
</section>

<section class="th-row" id="confidentiality">
  <div class="th-side"><b>Confidentiality</b><span>And its limits.</span></div>
  <div><p>What you tell us stays between us. We keep brief notes, stored securely, and we don’t confirm to anybody that you come here. There are a small number of situations where we may need to speak to someone else:</p>
    <ul class="th-limit"><li>if we are seriously worried about your safety or someone else’s</li><li>if a child or vulnerable adult may be at risk of harm</li><li>if the law requires it, for example a court order</li></ul>
    <p>Wherever possible we would talk to you first. Like all therapists, we also discuss our work with a clinical supervisor, without using your name.</p></div>
</section>

<section class="th-row" id="who-you-would-see">
  <div class="th-side"><b>Who you would see</b><span>Two of us. Tell me if you would prefer one or the other.</span></div>
  <div class="th-who">
    <div><h3>Nell Averill</h3><div class="r">Counsellor and psychotherapist, founder</div><p>I came to this work after a first career in teaching. I see individuals, mostly around grief, burnout and long stretches of low mood.</p>
      <p class="th-cred">Training: postgraduate diploma in counselling and psychotherapy, supervised clinical placements, further training in bereavement.</p></div>
    <div><h3>Rafi Belhaven</h3><div class="r">Associate psychotherapist</div><p>Rafi sees individuals and couples on Tuesdays and Thursdays, including evenings. He is often a good fit for relationship difficulties and big life changes.</p>
      <p class="th-cred">Training: postgraduate training in psychotherapy, further training in couples work.</p></div>
    <div class="th-slot">Add your registration and accreditation details here</div>
  </div>
</section>

<section class="th-row th-faq" id="questions">
  <div class="th-side"><b>Questions people ask</b></div>
  <div>${FAQ.map(([q, a, o]) => `<details${o ? " open" : ""}><summary>${q}${ic("chevdown", 16)}</summary><p>${a}</p></details>`).join("")}</div>
</section>

<section class="th-row" id="get-in-touch">
  <div class="th-side"><b>Get in touch</b><span>Only a few lines are needed. You can tell me more when we speak.</span></div>
  <div><h2 class="sk-h2 th-h2">Send a short note</h2>
    <form class="th-form" aria-label="Enquiry form">
      <div class="sk-g2" style="gap:14px"><div class="sk-field"><label for="th-name">Your first name</label><input class="sk-input" id="th-name" value="Lin"></div><div class="sk-field"><label for="th-mail">Email or phone</label><input class="sk-input" id="th-mail" value="lin@mail.example"></div></div>
      <div class="sk-field"><label for="th-why">Anything you would like to say (optional)</label><textarea class="sk-input" id="th-why" rows="2">I lost my dad in the spring and I think it might be time to talk to someone.</textarea></div>
      <div><button class="btn primary sk-btn-lg" type="button">Send</button></div></form>
    <p class="th-next"><b>What happens next:</b> I read every message myself and reply within two working days. I will suggest a short phone call, at no cost, so you can ask anything you like before deciding. You can also call (555) 016-3140 or write to hello@thistlewick.example.</p></div>
</section>

<section class="th-crisis" aria-label="If you need help now"><div class="th-side"><b>If you need help now</b></div><div><p>I can’t respond quickly to messages, so please don’t wait for me. <b>If you are in immediate danger, call your local emergency number.</b> If you are struggling and need to talk to someone today, your family doctor or a local crisis line can help.</p></div></section>
<div style="height:56px"></div>
</div></main>
${K.footer(p, "A small counselling and psychotherapy practice for adults.", [["Visit", ["2 Larkhill Terrace, first floor", "Stairs only, so online sessions are always available"]], ["Contact", ["(555) 016-3140", "hello@thistlewick.example", "Replies within two working days"]], ["Practical", ["Fees", "Confidentiality", "Privacy notice"]]], "Fictional practice created for this template. General information only, not medical advice.")}`, CSS);

module.exports = {
  "therapist-website": K.def("therapist", "Therapist website",
    "a quiet first-person private practice home page with almost no cards: navigation, a text-led greeting with a line-drawn thistle, a wide illustration of the consulting room, an is-this-the-right-place section listing what people often come about and who the practice may not suit with a route to other support, how the work goes in plain words, a first-session explainer as a written timeline, transparent fees with sliding-scale places, session length, cancellation and online or in-person terms, confidentiality and its limits, the practitioner and associate with a training and registration slot, an FAQ, a very short enquiry form that says what happens next, a gentle crisis note and a footer",
    ["navigation-header", "hero", "text-led", "long-form-text", "side-labels", "illustration", "fit-check", "process-timeline", "pricing-table", "sliding-scale", "policy", "confidentiality", "team", "credentials", "faq", "enquiry-form", "crisis-note", "footer", "therapist"], web),
};
