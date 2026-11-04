/* Law firm website template (Whitcombe Hale — fictional law firm for families and small businesses). Full responsive home
   page: nav, hero with book-a-consultation and a first-call availability panel, office photo band, practice areas, how we
   work and fees (fixed fee vs hourly), attorneys, insights list, client notes, consultation request form, footer with a
   generic attorney-advertising disclaimer. No outcome promises. "Photos" are inline SVG in fixed natural tones. */
const { ic, esc } = require("../lib");
const K = require("../sitekit");

const CSS = `<style>
.wh-hero{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(0,1fr);gap:64px;align-items:end;padding-top:60px;padding-bottom:44px}
.wh-hero h1{max-width:640px}
.wh-panel{padding:28px;display:grid;gap:16px}
.wh-panel h2{font-size:calc(22px * var(--hs))}
.wh-slots{display:grid;gap:8px}
.wh-slot{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:11px 14px;border:1px solid var(--border);border-radius:var(--radius);font-size:14px;background:var(--bg)}
.wh-slot b{font-weight:600}
.wh-slot.on{border-color:var(--primary);box-shadow:inset 3px 0 0 var(--primary)}
.wh-band{aspect-ratio:1200/280;border-radius:var(--radius-lg)}
.wh-areas{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 56px;border-top:1px solid var(--border)}
.wh-area{display:grid;grid-template-columns:44px minmax(0,1fr) auto;gap:16px;align-items:start;padding:18px 0;border-bottom:1px solid var(--border)}
.wh-area .wh-n{font:600 13px var(--font-b);color:var(--muted);padding-top:4px}
.wh-area p{color:var(--muted);font-size:14px;margin-top:4px}
.wh-area .wh-go{width:36px;height:36px;border-radius:50%;border:1px solid var(--border);display:grid;place-items:center}
.wh-fees{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px}
.wh-fee{padding:30px;display:grid;gap:14px;align-content:start}
.wh-fee .num{font-size:30px;line-height:1.1}
.wh-fee ul{list-style:none;display:grid;gap:8px;font-size:14px;color:var(--muted);padding-top:14px;border-top:1px solid var(--border)}
.wh-fee li{display:flex;gap:8px}
.wh-fee li svg{flex:none;margin-top:4px}
.wh-fee.mid{border-color:var(--primary);box-shadow:var(--shadow)}
.wh-plain{display:flex;gap:14px;align-items:flex-start;margin-top:28px;padding:18px 22px;border-left:3px solid var(--primary);background:var(--bg);font-size:15px}
.wh-team{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:24px}
.wh-att{display:grid;gap:10px;align-content:start}
.wh-att .sk-photo{aspect-ratio:1/1}
.wh-att small{color:var(--muted);font-size:13px;display:block}
.wh-att .wh-tags{display:flex;flex-wrap:wrap;gap:6px}
.wh-ins{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.25fr);gap:48px;align-items:start}
.wh-lead{padding:0;overflow:hidden}
.wh-lead .sk-photo{aspect-ratio:2/1;border-radius:0}
.wh-lead>div:last-child{padding:24px;display:grid;gap:10px}
.wh-rows{display:grid;border-top:1px solid var(--border)}
.wh-row{display:grid;grid-template-columns:104px minmax(0,1fr) auto;gap:20px;align-items:baseline;padding:18px 0;border-bottom:1px solid var(--border)}
.wh-row time,.wh-row .wh-rt{font-size:13px;color:var(--muted)}
.wh-row h3{font-size:calc(18px * var(--hs));line-height:1.3}
.wh-row .wh-cat{display:block;font:600 11px var(--font-b);letter-spacing:.08em;text-transform:uppercase;color:color-mix(in oklab,var(--primary) 78%,var(--text));margin-bottom:4px}
.wh-notes{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px}
.wh-note{padding:32px;display:grid;gap:18px}
.wh-note q{font-family:var(--font-h);font-size:calc(19px * var(--hs));line-height:1.4;quotes:"\\201C" "\\201D"}
.wh-consult{display:grid;grid-template-columns:minmax(0,.85fr) minmax(0,1.15fr);gap:64px;align-items:start}
.wh-info{display:grid;gap:18px;align-content:start}
.wh-info dl{display:grid;gap:14px;font-size:14px;width:100%}
.wh-info dl>div{display:grid;grid-template-columns:24px minmax(0,1fr);gap:10px}
.wh-info dt{color:var(--muted)}
.wh-info dd b{display:block;font-weight:600}
.wh-warn{font-size:13px;color:var(--muted);padding:14px 16px;border:1px solid var(--border);border-radius:var(--radius);background:var(--surface)}
.wh-form{padding:36px;display:grid;gap:16px}
.wh-form .sk-g2{gap:14px}
.wh-radios{display:flex;flex-wrap:wrap;gap:8px 18px;font-size:14px}
.wh-radios span{display:inline-flex;align-items:center;gap:8px}
.wh-radios i{width:16px;height:16px;border-radius:50%;border:1.5px solid var(--muted);display:inline-block}
.wh-radios i.on{border:5px solid var(--primary)}
.wh-check{display:grid;grid-template-columns:18px minmax(0,1fr);gap:10px;font-size:13px;color:var(--muted);align-items:start}
.wh-check i{width:18px;height:18px;border-radius:var(--radius-sm);background:var(--primary);color:var(--on-primary);display:grid;place-items:center;margin-top:1px}
.wh-disc{font-size:12px;color:var(--muted);line-height:1.55;padding-top:20px;margin-top:20px;border-top:1px solid var(--border)}
@media (max-width:1024px){
  .wh-team{grid-template-columns:repeat(2,minmax(0,1fr))}
  .wh-areas{gap:0 32px}
}
@media (max-width:760px){
  .wh-hero{grid-template-columns:minmax(0,1fr);gap:28px;padding-top:28px;padding-bottom:36px}
  .wh-panel{padding:20px}
  .wh-band{aspect-ratio:2/1}
  .wh-lead .sk-photo,.wh-info dl,.wh-fee p{display:none}
  .wh-fees{grid-template-columns:minmax(0,1fr);gap:12px}
  .wh-fee{display:flex;justify-content:space-between;align-items:baseline;gap:12px;padding:18px 20px}
  .wh-fee .num{font-size:22px}
  .wh-areas{grid-template-columns:minmax(0,1fr)}
  .wh-area{grid-template-columns:32px minmax(0,1fr) auto;gap:12px;padding:16px 0}
  .wh-area p{display:none}
  .wh-fee{padding:22px}
  .wh-fee ul{display:none}
  .wh-team{display:flex!important}
  .wh-att .sk-photo{aspect-ratio:1/1}
  .wh-ins{grid-template-columns:minmax(0,1fr);gap:24px}
  .wh-row{grid-template-columns:minmax(0,1fr);gap:4px;padding:14px 0}
  .wh-row .wh-rt{display:none}
  .wh-notes{display:flex!important}
  .wh-note{padding:22px}
  .wh-note q{font-size:calc(18px * var(--hs))}
  .wh-consult{grid-template-columns:minmax(0,1fr);gap:28px}
  .wh-form{padding:22px}
  .wh-hide-m{display:none!important}
  .sk-rail{scroll-padding-inline:20px}
}
</style>`;

// ---- illustrative office, article and portrait "photos" (fixed natural tones) -------------------------------------
const books = (x, y, w, seed) => { let out = "", cx = x; const cols = ["#7a3b34", "#2f4b5a", "#5f6b3a", "#b08a4a", "#3d3530", "#8c6a55", "#43584f"]; let i = seed; while (cx < x + w - 6) { const bw = 7 + (i * 7) % 9, bh = 40 + (i * 13) % 18; out += `<rect x="${cx}" y="${y - bh}" width="${bw}" height="${bh}" fill="${cols[i % cols.length]}"/>`; cx += bw + 1; i++; } return out; };
const office = () => `<svg viewBox="0 0 1200 330" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Meeting room with bookshelves, a long table and tall windows"><defs>
<linearGradient id="wh-win" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c9dbe3"/><stop offset="1" stop-color="#eef2ee"/></linearGradient></defs>
<rect width="1200" height="330" fill="#e7ddcc"/><rect y="250" width="1200" height="80" fill="#9b7a58"/>${Array.from({ length: 12 }, (_, i) => `<path d="M${i * 100} 250l-40 80" stroke="#8a6b4c" stroke-width="2"/>`).join("")}
<rect x="40" y="20" width="420" height="230" fill="#6b4a36"/>${[0, 1, 2, 3].map((r) => `<rect x="52" y="${30 + r * 55}" width="396" height="48" fill="#4a3426"/>${books(56, 78 + r * 55, 388, r * 5 + 1)}`).join("")}
${[560, 720, 880].map((x) => `<rect x="${x}" y="30" width="130" height="200" fill="url(#wh-win)"/><path d="M${x + 65} 30v200M${x} 130h130" stroke="#f5f1ea" stroke-width="6"/><rect x="${x - 6}" y="226" width="142" height="8" fill="#f5f1ea"/>`).join("")}
<circle cx="1080" cy="120" r="44" fill="#6f8f58"/><circle cx="1100" cy="96" r="30" fill="#86a56a"/><rect x="1064" y="160" width="36" height="70" fill="#a7744f"/>
<rect x="420" y="214" width="520" height="16" rx="4" fill="#5a3b27"/>${[460, 900].map((x) => `<rect x="${x}" y="230" width="12" height="70" fill="#4a3022"/>`).join("")}${[480, 590, 700, 810].map((x) => `<rect x="${x}" y="186" width="60" height="70" rx="10" fill="#2f3d4a"/>`).join("")}
<rect x="540" y="204" width="44" height="10" fill="#efe9df"/><rect x="740" y="206" width="30" height="8" fill="#efe9df"/><circle cx="660" cy="208" r="6" fill="#efe9df"/></svg>`;
const article = () => `<svg viewBox="0 0 400 225" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Desk with a signed document, a pen and a cup of coffee"><rect width="400" height="225" fill="#8a6b4c"/>${Array.from({ length: 8 }, (_, i) => `<path d="M0 ${14 + i * 30}q200 ${i % 2 ? 10 : -10} 400 0" stroke="#7a5d42" stroke-width="2" fill="none"/>`).join("")}
<rect x="96" y="30" width="170" height="210" fill="#f7f3ea" transform="rotate(-6 180 130)"/>${Array.from({ length: 8 }, (_, i) => `<path d="M120 ${66 + i * 16}h${i === 7 ? 70 : 120}" stroke="#bdb5a6" stroke-width="4" transform="rotate(-6 180 130)"/>`).join("")}<path d="M128 196q14-16 24 0t24-4" stroke="#2f4b5a" stroke-width="3" fill="none" transform="rotate(-6 180 130)"/>
<rect x="250" y="150" width="110" height="10" rx="5" fill="#2b2b2b" transform="rotate(-28 300 155)"/><circle cx="330" cy="62" r="34" fill="#efe9df"/><circle cx="330" cy="62" r="25" fill="#5b3a24"/></svg>`;
const portrait = (i, label) => {
  const skin = ["#f1cfb2", "#8a5a3c", "#d9a57e", "#5e3b28"][i % 4], hair = ["#6b4a36", "#1e1a18", "#c9c3ba", "#2b2522"][i % 4], bg = ["#d9d2c4", "#cfd6d9", "#e1d6c8", "#d4d9cc"][i % 4], suit = ["#2f3d4a", "#4a3426", "#3a3c3f", "#43584f"][i % 4];
  return `<svg viewBox="0 0 200 250" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${esc(label)}"><rect width="200" height="250" fill="${bg}"/>${books(0, 70, 200, i * 3)}<rect y="70" width="200" height="6" fill="#6b4a36" opacity=".6"/>
<path d="M24 250c6-58 40-84 76-84s70 26 76 84z" fill="${suit}"/><path d="M86 168l14 40 14-40z" fill="#f4f1ea"/><rect x="88" y="138" width="24" height="32" fill="${skin}"/><ellipse cx="100" cy="112" rx="34" ry="41" fill="${skin}"/>
<path d="M64 108c0-36 22-50 38-50s34 12 34 48c-6-16-22-26-38-26s-28 10-34 28z" fill="${hair}"/>${i % 2 ? `<path d="M64 106c-6 32 0 56 10 66l2-46z" fill="${hair}"/><path d="M136 106c6 32 0 56-10 66l-2-46z" fill="${hair}"/>` : ""}</svg>`;
};

const AREAS = [["Family law", "Separation, parenting arrangements, property settlements and prenuptial agreements.", "Fixed fee options"],
  ["Wills & estates", "Wills, powers of attorney, guardianship and estate administration.", "Wills from $450"],
  ["Property & conveyancing", "Buying, selling, leases and first-home purchases.", "Fixed fee"],
  ["Business formation", "Company set-up, shareholder agreements, partnership deeds.", "Packages from $1,200"],
  ["Employment", "Contracts, workplace policies and advice for small employers and staff.", "Hourly or fixed"],
  ["Disputes & mediation", "Contract disputes, debt recovery and mediation before court.", "Hourly, estimates in writing"]];
const ATTS = [["Eleanor Whitcombe", "Founding partner", "Admitted 2004", ["Family law", "Mediation"]], ["Daniel Hale", "Partner", "Admitted 2009", ["Business", "Employment"]], ["Ana Sorensen", "Senior associate", "Admitted 2014", ["Wills & estates"]], ["Kwame Mensah", "Associate", "Admitted 2019", ["Property", "French"]]];
const POSTS = [["28 Oct 2026", "Wills & estates", "What happens if you die without a will: a plain-English walk-through", "6 min"],
  ["14 Oct 2026", "Business", "Shareholder agreements for two-founder companies: the five clauses to discuss first", "8 min"],
  ["30 Sep 2026", "Family law", "Parenting plans versus court orders: how they differ", "5 min"],
  ["11 Sep 2026", "Employment", "Hiring your first employee: contracts, records and leave basics", "7 min"]];

const web = (p, st) => K.page(st, `${K.nav(p, ["Practice areas", "Fees", "Our lawyers", "Insights", "Contact"], "Book a consultation")}
<main>
<section class="sk-wrap wh-hero" id="top">
  <div class="sk-stack" style="gap:22px">
    <span class="sk-eyebrow">Law firm for families & small businesses</span>
    <h1 class="sk-h1">Clear legal advice for the moments that matter at home and at work</h1>
    <p class="sk-lede">${esc(p.name)} helps people write wills, separate fairly, buy property and set up businesses. We explain your options in plain language and tell you what it will cost before we start.</p>
    <div class="sk-row"><a class="btn primary sk-btn-lg" href="#book-a-consultation">Book a consultation</a><a class="btn sk-btn-lg" href="#fees">How our fees work</a></div>
  </div>
  <aside class="card wh-panel" aria-label="First call availability">
    <span class="badge" style="justify-self:start;display:inline-flex;align-items:center;gap:6px">${ic("clock", 13)} Free 20-minute first call</span>
    <h2>Next available this week</h2>
    <div class="wh-slots">${[["Thu 12 Nov", "10:30 AM · phone", 0], ["Thu 12 Nov", "3:00 PM · video", 1], ["Fri 13 Nov", "9:00 AM · in person", 0]].map(([d, t, on]) => `<div class="wh-slot${on ? " on" : ""}"><b>${d}</b><span class="muted">${t}</span></div>`).join("")}</div>
    <a class="btn primary block" href="#book-a-consultation">Choose a time</a>
    <p class="muted" style="font-size:13px">Or call ${ic("phone", 13)} (555) 016-7720, Mon–Fri 8:30–5:30</p>
  </aside>
</section>
<div class="sk-wrap"><div class="sk-photo wh-band">${office()}<span class="sk-cap">Our meeting room on Chancery Walk</span></div></div>

<section class="sk-sec sk-tight" id="practice-areas"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">Practice areas</span><h2 class="sk-h2">What we can help with</h2></div><p class="muted wh-hide-m" style="max-width:380px">If your matter sits outside these areas, we’ll say so on the first call and suggest where to look.</p></div>
  <div class="wh-areas">${AREAS.map(([t, d, f], i) => `<a class="wh-area" href="#"><span class="wh-n">0${i + 1}</span><div><h3 class="sk-h3">${t}</h3><p>${d}</p><span class="badge" style="margin-top:8px">${f}</span></div><span class="wh-go">${ic("arrow", 15)}</span></a>`).join("")}</div>
</div></section>

<section class="sk-sec sk-alt sk-tight" id="fees"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">How we work & fees</span><h2 class="sk-h2">You’ll know the cost before we begin</h2></div></div>
  <div class="wh-fees">${[["First call", "Free", "20 minutes by phone, video or in person to understand your situation and whether we’re the right fit.", ["No obligation", "Conflict check before details", "Written next steps by email"], ""],
    ["Fixed fee", "From $450", "For defined work: wills, conveyancing, company set-up, uncontested separations. One price, agreed in writing.", ["Scope listed line by line", "Pay in two instalments", "No charge for routine calls"], " mid"],
    ["Hourly", "$290 / hour", "For disputes and matters where the work can’t be predicted. Billed in 6-minute units with a written estimate.", ["Monthly itemised invoices", "We tell you at 80% of estimate", "Junior rates where suitable"], ""]].map(([t, pr, d, list, c]) => `<article class="card wh-fee${c}"><h3 class="sk-h3">${t}</h3><div class="num">${pr}</div><p class="muted" style="font-size:14px">${d}</p><ul>${list.map((x) => `<li>${ic("check", 14)}<span>${x}</span></li>`).join("")}</ul></article>`).join("")}</div>
  <p class="wh-plain">${ic("shield", 18)}<span>We can’t promise how a matter will end. We do promise to explain each step, answer emails within one working day, and never bill you for work you didn’t agree to.</span></p>
</div></section>

<section class="sk-sec sk-tight" id="our-lawyers"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">Our lawyers</span><h2 class="sk-h2">A small team you’ll actually speak to</h2></div><a class="btn sk-btn-lg wh-hide-m" href="#">All 9 staff ${ic("arrow", 16)}</a></div>
  <div class="wh-team sk-rail">${ATTS.map(([n, r, a, tags], i) => `<article class="wh-att"><div class="sk-photo">${portrait(i, `Portrait of ${n}`)}</div><div><h3 class="sk-h3">${esc(n)}</h3><small>${r} · ${a}</small></div><div class="wh-tags">${tags.map((t) => `<span class="badge">${t}</span>`).join("")}</div></article>`).join("")}</div>
</div></section>

<section class="sk-sec sk-alt sk-tight" id="insights"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">Insights</span><h2 class="sk-h2">Plain-English guides</h2></div><a class="btn sk-btn-lg wh-hide-m" href="#">All articles ${ic("arrow", 16)}</a></div>
  <div class="wh-ins">
    <article class="card wh-lead"><div class="sk-photo">${article()}</div><div><span class="badge" style="justify-self:start">Guide · Wills & estates</span><h3 class="sk-h3" style="font-size:calc(22px * var(--hs))">Your first will: a checklist before the appointment</h3><p class="muted" style="font-size:14px">Assets, guardians, executors and the questions people usually forget. Bring this list and your appointment takes half the time.</p></div></article>
    <div class="wh-rows">${POSTS.map(([d, c, t, rt]) => `<a class="wh-row" href="#"><time>${d}</time><div><span class="wh-cat">${c}</span><h3>${t}</h3></div><span class="wh-rt">${rt} read</span></a>`).join("")}</div>
  </div>
</div></section>

<section class="sk-sec sk-tight"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">Client notes</span><h2 class="sk-h2">What working with us is like</h2></div></div>
  <div class="wh-notes sk-rail">${[["Eleanor explained every option for our parenting plan without pushing us toward any of them. The fixed fee meant one less thing to worry about.", "Jo B.", "Family law client"], ["We set up our company and shareholder agreement in three weeks. Daniel’s notes on each clause were the clearest thing I read all year.", "Ravi & Ines", "Café owners"]].map(([q, n, r]) => `<figure class="card wh-note"><q>${esc(q)}</q><figcaption><b>${esc(n)}</b> · <span class="muted" style="font-size:13px">${esc(r)}</span></figcaption></figure>`).join("")}</div>
</div></section>

<section class="sk-sec sk-alt sk-tight" id="book-a-consultation"><div class="sk-wrap wh-consult">
  <div class="wh-info"><span class="sk-eyebrow">Book a consultation</span><h2 class="sk-h2">Tell us briefly what’s happening</h2>
    <p class="muted">A lawyer reads every request and replies within one working day to arrange your free first call.</p>
    <dl>${[["pin", "Office", "Level 2, 18 Chancery Walk", "Step-free access, parking behind the building"], ["clock", "Hours", "Mon–Fri 8:30 AM–5:30 PM", "Evening video calls by arrangement"], ["mail", "Email", "hello@whitcombehale.example", "Please don’t email documents yet"]].map(([i, a, b, c]) => `<div><dt>${ic(i, 16)}</dt><dd><b>${b}</b><span class="muted">${c}</span></dd></div>`).join("")}</dl>
    <p class="wh-warn">Please keep details brief until we’ve run a conflict check. We’ll ask for documents once we confirm we can act for you.</p>
  </div>
  <form class="card wh-form" aria-label="Consultation request">
    <div class="sk-g2"><div class="sk-field"><label for="wh-name">Full name</label><input class="sk-input" id="wh-name" value="Priya Nair"></div><div class="sk-field"><label for="wh-matter">Type of matter</label><select class="sk-input" id="wh-matter"><option>Wills & estates</option><option>Family law</option><option>Property</option><option>Business</option><option>Employment</option><option>Dispute</option></select></div></div>
    <div class="sk-g2"><div class="sk-field"><label for="wh-em">Email</label><input class="sk-input" id="wh-em" placeholder="you@example.com"></div><div class="sk-field"><label for="wh-ph">Phone</label><input class="sk-input" id="wh-ph" placeholder="(555) 000-0000"></div></div>
    <div class="sk-field"><label>Preferred first call</label><div class="wh-radios" role="radiogroup"><span><i></i>Phone</span><span><i class="on"></i>Video</span><span><i></i>In person</span></div></div>
    <div class="sk-field"><label for="wh-desc">A few lines about your matter</label><textarea class="sk-input" id="wh-desc">We’d like to update our wills after our second child and name guardians. We also own a rental flat jointly.</textarea></div>
    <div class="wh-check"><i>${ic("check", 12)}</i><span>I understand that sending this form does not create an attorney–client relationship and that I shouldn’t include confidential information yet.</span></div>
    <button class="btn primary sk-btn-lg" type="button">Request my free first call</button>
  </form>
</div></section>
</main>
${K.footer(p, "Advice for families and small businesses on wills, family law, property, business and employment matters.", [["Office", ["Level 2, 18 Chancery Walk", "Mon–Fri 8:30–5:30", "(555) 016-7720"]], ["Practice areas", ["Family law", "Wills & estates", "Property", "Business & employment"]], ["Firm", ["Our lawyers", "Fees", "Insights", "Complaints procedure"]]], `© 2026 ${p.name}. Attorney advertising.`)}
<div class="sk-wrap"><p class="wh-disc" style="margin-top:0;border-top:0;padding:0 0 40px">This website is attorney advertising and provides general information only, not legal advice. Contacting ${esc(p.name)} or using this site does not create an attorney–client relationship. Prior results do not guarantee a similar outcome. Please do not send confidential information until we have confirmed in writing that we can act for you.</p></div>`, CSS);

module.exports = {
  "law-firm-website": K.def("lawfirm", "Law firm website",
    "a full law firm home page: navigation with book-a-consultation, a hero with consultation and fees buttons beside a free-first-call availability panel with time slots, an office photo band, six numbered practice areas with fee badges, a how-we-work and fees section comparing a free first call, fixed fee and hourly billing with a plain no-outcome-promise note, lawyer profiles with admission year and focus tags, an insights section with a featured guide and a dated article list, client notes, a consultation request form (name, matter type, contact details, preferred call type, description, no-relationship acknowledgement) beside office details and a conflict-check note, and a footer with an attorney-advertising disclaimer",
    ["navigation-header", "hero", "booking-panel", "time-slots", "practice-areas", "pricing", "fee-comparison", "team", "blog-list", "articles", "testimonials", "contact-form", "radio-group", "checkbox", "disclaimer", "footer", "law-firm"], web),
};
