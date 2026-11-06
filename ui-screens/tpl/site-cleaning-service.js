/* Cleaning service website template (Spruceway Cleaning, a fictional home and office cleaning company). Full responsive, quote-led home page:
   nav, tinted hero with a wide instant-quote card (home size, bathrooms, frequency, extras, filled estimate receipt), how it works,
   room-by-room checklist comparing standard, deep and move-out cleans, recurring plans, same-cleaner card with home notes,
   what we bring / what we need / what we leave out, keys and access, insurance, areas served, office note, reviews, FAQ, booking, footer.
   Reviews are fictional and allowed on this page. The kitchen scene is inline SVG in fixed natural tones. No JS: the estimate is a filled sample. */
const { ic, esc } = require("../lib");
const K = require("../sitekit");

const CSS = `<style>
.cl>.sk-sec{padding:64px 0}
.cl h2.sk-h2{font-size:calc(36px * var(--hs))}
.cl-hero{background:color-mix(in oklab,var(--primary) 11%,var(--bg));border-bottom:1px solid var(--border);padding:44px 0 56px}
.cl-htop{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);gap:56px;align-items:end;margin-bottom:28px}
.cl-htop h1{font-size:calc(54px * var(--hs));line-height:1.04}
.cl-htop>div{display:grid;gap:12px;justify-items:start}
.cl-htop p{color:var(--muted);font-size:16.5px}
.cl-marks{display:flex;flex-wrap:wrap;gap:6px 20px;font-size:13.5px;font-weight:500}
.cl-marks span{display:inline-flex;align-items:center;gap:6px}
.cl-marks .i{color:var(--success)}
.cl-quote{display:grid;grid-template-columns:minmax(0,1fr) 340px;padding:0;overflow:hidden;box-shadow:var(--shadow-lg)}
.cl-opts{padding:26px 28px;display:grid;grid-template-columns:minmax(0,1.6fr) minmax(0,1fr);gap:20px 32px;align-content:start}
.cl-opts h2{grid-column:1/-1;font-size:calc(21px * var(--hs));display:flex;justify-content:space-between;align-items:baseline;gap:12px}
.cl-opts h2 small{font:500 13px var(--font-b);color:var(--muted);letter-spacing:0}
.cl-grp{display:grid;gap:8px;align-content:start;border:0;min-width:0}
.cl-grp legend,.cl-grp>.cl-lab{font-weight:600;font-size:13px;margin-bottom:8px;padding:0}
.cl-grp>.cl-lab{margin-bottom:0}
.cl-wide{grid-column:1/-1}
.cl-chips{display:flex;flex-wrap:wrap;gap:6px}
.cl-chip{position:relative;min-height:38px;padding:0 13px;border:1px solid var(--border);border-radius:var(--radius);display:inline-flex;align-items:center;gap:6px;font-size:13.5px;font-weight:500;background:var(--bg);cursor:pointer}
.cl-chip input{position:absolute;opacity:0;width:1px;height:1px}
.cl-chip small{font:500 12px var(--font-b);color:var(--muted)}
.cl-chip:has(input:checked){background:var(--primary);border-color:var(--primary);color:var(--on-primary)}
.cl-chip:has(input:checked) small{color:inherit;opacity:.85}
.cl-chip:has(input:focus-visible){outline:2px solid var(--text);outline-offset:2px}
.cl-rcpt{background:var(--text);color:var(--bg);padding:26px;display:grid;gap:10px;align-content:start}
.cl-rcpt .cl-est{font-size:52px;letter-spacing:-.03em;line-height:1}
.cl-rcpt .cl-mu{color:color-mix(in oklab,var(--bg) 72%,var(--text));font-size:13px}
.cl-rcpt ul{list-style:none;display:grid;gap:6px;font-size:13.5px;padding:10px 0;border-block:1px dashed color-mix(in oklab,var(--bg) 35%,var(--text))}
.cl-rcpt li{display:flex;justify-content:space-between;gap:12px}
.cl-rcpt .btn{height:46px;font-size:15px}
.cl-rcpt .btn:not(.primary){background:transparent;color:var(--bg);border-color:color-mix(in oklab,var(--bg) 45%,var(--text))}
.cl-steps{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;list-style:none;counter-reset:cl}
.cl-steps li{counter-increment:cl;display:grid;grid-template-columns:34px minmax(0,1fr);gap:0 12px;align-content:start}
.cl-steps li::before{content:counter(cl);grid-row:span 2;width:34px;height:34px;border-radius:50%;display:grid;place-items:center;font:600 14px var(--font-b);background:color-mix(in oklab,var(--primary) 15%,var(--bg));color:color-mix(in oklab,var(--primary) 78%,var(--text))}
.cl-steps b{font-size:15px}
.cl-steps span{font-size:13.5px;color:var(--muted);line-height:1.45}
.cl-how{padding:34px 0!important;border-bottom:1px solid var(--border)}
.cl-plans-h{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin-bottom:22px}
.cl-tier{padding:16px 18px;display:grid;gap:3px;background:var(--bg)}
.cl-tier.sel{border-color:var(--primary);box-shadow:inset 0 0 0 1px var(--primary)}
.cl-tier .num{font-size:24px}
.cl-tier span{font-size:13px;color:var(--muted)}
.cl-tier b{font-size:15px}
.cl-rooms{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 40px;align-items:start}
.cl-tbl{width:100%;border-collapse:collapse;font-size:13.5px;margin-bottom:18px}
.cl-tbl caption{text-align:left;font-weight:700;font-size:15px;padding-bottom:6px;font-family:var(--font-h)}
.cl-tbl th{font:600 11.5px var(--font-b);color:var(--muted);text-align:center;padding:5px 0;width:62px;border-bottom:2px solid var(--text)}
.cl-tbl th:first-child{text-align:left;width:auto}
.cl-tbl td{padding:6px 0;border-bottom:1px solid var(--border);text-align:center;line-height:1.35}
.cl-tbl td:first-child{text-align:left;padding-right:10px}
.cl-y{display:inline-grid;place-items:center;width:20px;height:20px;border-radius:50%;background:color-mix(in oklab,var(--success) 16%,var(--bg));color:var(--success)}
.cl-n{color:color-mix(in oklab,var(--muted) 60%,transparent)}
.cl-add{font-size:11.5px;font-weight:600;color:var(--muted)}
.cl-note{font-size:13px;color:var(--muted)}
.cl-plans{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:18px}
.cl-plan{padding:22px;display:grid;gap:8px;align-content:start;position:relative}
.cl-plan.feat{background:var(--text);color:var(--bg);border-color:var(--text)}
.cl-plan .num{font-size:34px}
.cl-plan .num small{font:500 13px var(--font-b);letter-spacing:0;opacity:.75}
.cl-plan p{font-size:13.5px;color:var(--muted)}
.cl-plan.feat p{color:color-mix(in oklab,var(--bg) 74%,var(--text))}
.cl-plan .badge{justify-self:start}
.cl-terms{display:flex;flex-wrap:wrap;gap:8px 26px;margin-top:18px;font-size:13.5px;color:var(--muted)}
.cl-terms span{display:inline-flex;align-items:center;gap:7px}
.cl-same{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.05fr);gap:48px;align-items:center}
.cl-same .sk-photo{aspect-ratio:16/10}
.cl-copy{display:grid;gap:12px;justify-items:start}
.cl-copy p{color:var(--muted);font-size:15.5px}
.cl-notes{padding:22px;display:grid;gap:12px;margin-top:6px;width:100%}
.cl-who{display:flex;align-items:center;gap:12px}
.cl-who .avatar{width:44px;height:44px;font-size:14px}
.cl-notes ul{list-style:none;display:grid;gap:6px;font-size:13.5px}
.cl-notes li{display:grid;grid-template-columns:18px minmax(0,1fr);gap:8px}
.cl-notes li>span:first-child{color:var(--muted);padding-top:2px}
.cl-three{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}
.cl-three article{padding:22px;display:grid;gap:10px;align-content:start}
.cl-three ul{list-style:none;display:grid;gap:6px;font-size:13.5px}
.cl-three li{display:grid;grid-template-columns:18px minmax(0,1fr);gap:8px}
.cl-three li>span:first-child{padding-top:2px;color:var(--success)}
.cl-three article.cl-no li>span:first-child{color:var(--muted)}
.cl-keys{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,1fr);gap:32px;align-items:start}
.cl-keyg{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:16px}
.cl-keyg div{display:grid;grid-template-columns:36px minmax(0,1fr);gap:0 10px;padding:12px;border:1px solid var(--border);border-radius:var(--radius);background:var(--bg)}
.cl-keyg .cl-ico{grid-row:span 2;width:36px;height:36px;border-radius:var(--radius);display:grid;place-items:center;background:color-mix(in oklab,var(--primary) 13%,var(--bg));color:color-mix(in oklab,var(--primary) 78%,var(--text))}
.cl-keyg b{font-size:14px}.cl-keyg span:last-child{font-size:12.5px;color:var(--muted);line-height:1.4}
.cl-ins{padding:22px;display:grid;gap:9px}
.cl-ins p{font-size:13.5px;color:var(--muted)}
.cl-area{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,1fr);gap:32px;align-items:start}
.cl-pills{display:flex;flex-wrap:wrap;gap:7px;margin-top:14px}
.cl-pills span{height:32px;padding:0 12px;display:inline-flex;align-items:center;border:1px solid var(--border);border-radius:999px;font-size:13px;font-weight:500;background:var(--surface)}
.cl-office{padding:22px;display:grid;gap:9px;justify-items:start;background:color-mix(in oklab,var(--primary) 8%,var(--surface))}
.cl-office p{font-size:13.5px;color:var(--muted)}
.cl-revs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}
.cl-rev{padding:22px;display:grid;gap:10px;align-content:start}
.cl-rev p{font-size:14.5px}
.cl-stars{display:flex;gap:2px;color:color-mix(in oklab,var(--accent) 80%,var(--text))}
.cl-stars svg{fill:currentColor}
.cl-rev footer{font-size:13px;color:var(--muted)}
.cl-last{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:48px;align-items:start}
.cl-faq details{border-top:1px solid var(--border);padding:12px 0}
.cl-faq details:last-child{border-bottom:1px solid var(--border)}
.cl-faq summary{list-style:none;cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:14px;font-weight:600;font-size:14.5px}
.cl-faq summary::-webkit-details-marker{display:none}
.cl-faq summary .i{color:var(--muted)}
.cl-faq details[open] summary .i{transform:rotate(180deg)}
.cl-faq p{font-size:13.5px;color:var(--muted);margin-top:6px}
.cl-form{padding:26px;display:grid;gap:12px}
.cl-form .sk-g2{gap:12px}
@media (max-width:1024px){
  .cl-htop{gap:32px}
  .cl-quote{grid-template-columns:minmax(0,1fr) 280px}
  .cl-opts{padding:22px;gap:18px 20px}
  .cl-steps{grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}
  .cl-plans{grid-template-columns:repeat(2,minmax(0,1fr))}
  .cl-same,.cl-last{gap:32px}
  .cl-rooms{gap:0 24px}
  .cl-three{gap:14px}
}
@media (max-width:900px){
  .cl-quote{grid-template-columns:minmax(0,1fr)}
  .cl-rooms{grid-template-columns:minmax(0,1fr)}
}
@media (max-width:760px){
  .cl>.sk-sec{padding:42px 0}
  .cl h2.sk-h2{font-size:calc(29px * var(--hs))}
  .cl-hero{padding:24px 0 32px}
  .cl-htop{grid-template-columns:minmax(0,1fr);gap:12px;margin-bottom:18px}
  .cl-htop h1{font-size:calc(38px * var(--hs))}
  .cl-htop p{font-size:15px}
  .cl-marks{display:none}
  .cl-opts{grid-template-columns:minmax(0,1fr);padding:18px;gap:14px}
  .cl-opts h2 small{display:none}
  .cl-chip{padding:0 11px}
  .cl-rcpt{padding:20px}
  .cl-how{padding:28px 0!important}
  .cl-plans-h{grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}
  .cl-tier{padding:10px}
  .cl-tier .num{font-size:19px}
  .cl-tier b{font-size:13px}
  .cl-tier span{font-size:11.5px;line-height:1.3}
  .cl-tbl th{width:44px;font-size:11px}
  .cl-tbl td{font-size:13px}
  .cl-y{width:18px;height:18px}
  .cl-plan{padding:18px}
  .cl-terms{gap:6px;flex-direction:column}
  .cl-same,.cl-keys,.cl-area,.cl-last{grid-template-columns:minmax(0,1fr);gap:20px}
  .cl-same .sk-photo{display:none}
  .cl-three article{padding:18px}
  .cl-keyg{grid-template-columns:minmax(0,1fr)}
  .cl-rev{padding:18px}
  .cl-form{padding:18px}
  .cl-form .sk-g2{grid-template-columns:minmax(0,1fr)}
}
</style>`;

const kitchen = () => `<svg viewBox="0 0 640 400" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Bright clean kitchen with a window, a wiped counter and a bowl of lemons"><defs><linearGradient id="cl-w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6f4ec"/><stop offset="1" stop-color="#ece8db"/></linearGradient><linearGradient id="cl-s" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d7ecf2"/><stop offset="1" stop-color="#b4d7e2"/></linearGradient></defs>
<rect width="640" height="400" fill="url(#cl-w)"/><rect x="220" y="44" width="200" height="150" rx="4" fill="url(#cl-s)"/><path d="M320 44v150M220 118h200" stroke="#fbfaf5" stroke-width="7"/><rect x="214" y="190" width="212" height="8" fill="#e2dccb"/>
<path d="M0 0h170v90h-170z" fill="#dfe8df"/><path d="M0 90h170" stroke="#c6d3c7" stroke-width="3"/><path d="M57 0v90M114 0v90" stroke="#c6d3c7" stroke-width="3"/><path d="M470 0h170v90h-170z" fill="#dfe8df"/><path d="M470 90h170" stroke="#c6d3c7" stroke-width="3"/><path d="M527 0v90M584 0v90" stroke="#c6d3c7" stroke-width="3"/>
<rect y="226" width="640" height="16" fill="#f8f7f2"/><rect y="242" width="640" height="158" fill="#a9bfae"/>${[0, 160, 320, 480].map((x) => `<rect x="${x + 10}" y="254" width="140" height="134" rx="4" fill="#b6cabb"/><rect x="${x + 66}" y="266" width="28" height="4" rx="2" fill="#ece8db"/>`).join("")}
<ellipse cx="130" cy="222" rx="50" ry="10" fill="#e9e3d2"/><circle cx="112" cy="208" r="13" fill="#eccb4f"/><circle cx="134" cy="204" r="14" fill="#f0d45f"/><circle cx="152" cy="210" r="12" fill="#e6c243"/>
<path d="M332 226v-30c0-12 16-12 16 0" fill="none" stroke="#a8acad" stroke-width="5"/><rect x="480" y="176" width="26" height="50" rx="4" fill="#79a0a8"/><rect x="486" y="164" width="14" height="14" fill="#5f8790"/><path d="M540 226c-8-24-4-38 8-48 12 10 16 24 8 48z" fill="#7da06f"/><rect x="536" y="206" width="24" height="20" rx="3" fill="#e1d9c5"/></svg>`;

const Y = `<span class="cl-y">${ic("check", 12)}</span>`;
const N = `<span class="cl-n" aria-label="Not included">${ic("minus", 14)}</span>`;
const A = (x) => `<span class="cl-add">${x}</span>`;
const mk = (v) => (v === 1 ? Y : v === 0 ? N : A(v));
const ROOMS = [
  ["Kitchen", [["Counters, sink and backsplash", 1, 1, 1], ["Stovetop and outside of appliances", 1, 1, 1], ["Inside the microwave", 1, 1, 1], ["Cabinet fronts and handles", 0, 1, 1], ["Inside the oven", "+$30", 1, 1], ["Inside the fridge", "+$30", "+$30", 1], ["Inside cabinets and drawers", 0, "+$45", 1]]],
  ["Bathrooms", [["Toilet, sink, tub and shower", 1, 1, 1], ["Mirrors and fixtures polished", 1, 1, 1], ["Soap scum and grout scrubbed", 0, 1, 1], ["Exhaust fan cover dusted", 0, 1, 1], ["Inside vanity and medicine cabinet", 0, 0, 1]]],
  ["Bedrooms and living areas", [["Dusting of reachable surfaces", 1, 1, 1], ["Beds made, linens changed if left out", 1, 1, 0], ["Carpets and rugs vacuumed", 1, 1, 1], ["Baseboards and door frames hand-wiped", 0, 1, 1], ["Window sills and tracks", 0, 1, 1], ["Ceiling fans and vents", 0, 1, 1], ["Inside closets and on shelves", 0, 0, 1]]],
  ["Whole home", [["Floors vacuumed and mopped", 1, 1, 1], ["Trash emptied and liners replaced", 1, 1, 1], ["Light switches and door handles", 1, 1, 1], ["Marks spot-cleaned from walls", 0, 1, 1], ["Interior window glass", "+$40", "+$40", 1]]],
];
const roomTable = ([room, rows]) => `<table class="cl-tbl"><caption>${room}</caption><thead><tr><th scope="col">Task</th><th scope="col">Standard</th><th scope="col">Deep</th><th scope="col">Move-out</th></tr></thead><tbody>${rows.map(([t, a, b, c]) => `<tr><td>${t}</td><td>${mk(a)}</td><td>${mk(b)}</td><td>${mk(c)}</td></tr>`).join("")}</tbody></table>`;

const PLANS = [
  ["Weekly", "$130", "Busy homes, pets and small children. Same day, same time.", 0],
  ["Every 2 weeks", "$140", "What most households pick. Keeps on top of floors and bathrooms.", 1],
  ["Every 4 weeks", "$160", "A monthly reset. Visits run longer, so the price is a little higher.", 0],
  ["One-time", "$185", "A single standard clean, for guests, a party or a catch-up.", 0],
];

const STAR = Array.from({ length: 5 }, () => ic("star", 15)).join("");
const REVIEWS = [
  ["Marisol came back the second visit already knowing which rug can’t get wet. We have not had to explain anything twice.", "Hannah R.", "Every 2 weeks, Alder Heights"],
  ["Our move-out clean got the full deposit back. The inside of the oven looked better than the day we moved in.", "Tobias K.", "Move-out clean, Eastmere"],
  ["I work from home, so I was wary. They arrive in the window, work quietly and text when they leave. The dog now waits at the door for them.", "Nia O.", "Weekly, Millbrook"],
];

const FAQ = [
  ["Do I need to be home?", "No. Most customers are out. See keys and access above for how we get in.", true],
  ["Why is the first visit a deep clean?", "Recurring visits keep a home at a level. If a home hasn’t had a professional clean in the past two months, the first visit brings it to that level."],
  ["What if I need to cancel or skip?", "Skip or move a visit free with 48 hours’ notice. Later than that, a $40 late cancellation fee applies."],
  ["What if something was missed?", "Tell us within 24 hours and we’ll return to redo that area at no charge."],
  ["Do I tip the cleaner?", "It is never expected. If you would like to, leave cash with a note, or ask us to add it to your invoice."],
  ["Is the price fixed?", "The estimate is based on what you tell us. If a home is very different from the description, we call you before starting."],
];

const web = (p, st) => K.page(st, `${K.nav(p, ["What’s included", "Plans", "How we work", "Areas", "FAQ"], "Book a clean", "(555) 016-3380")}
<main class="cl">
<section class="cl-hero" id="quote"><div class="sk-wrap">
  <div class="cl-htop">
    <div><span class="sk-eyebrow">House cleaning · Weekly, deep and move-out</span><h1>Your price in 30 seconds. Your Thursday back.</h1></div>
    <div><p>${esc(p.name)} cleans homes and small offices with the same cleaner each visit. No call-backs and no walkthrough needed to get a price.</p><div class="cl-marks"><span>${ic("check", 15)} No contract</span><span>${ic("check", 15)} Supplies included</span><span>${ic("check", 15)} 24-hour redo</span></div></div>
  </div>
  <div class="card cl-quote">
    <form class="cl-opts" aria-label="Instant quote">
      <h2>Tell us about your home <small>Takes about 30 seconds</small></h2>
      <div class="cl-grp"><span class="cl-lab" id="cl-l1">Home size</span><div class="cl-chips" role="radiogroup" aria-labelledby="cl-l1">${["Studio", "1 bed", "2 bed", "3 bed", "4+ bed"].map((x, i) => `<label class="cl-chip"><input type="radio" name="cl-size"${i === 2 ? " checked" : ""}>${x}</label>`).join("")}</div></div>
      <div class="cl-grp"><span class="cl-lab" id="cl-l2">Bathrooms</span><div class="cl-chips" role="radiogroup" aria-labelledby="cl-l2">${["1", "1.5", "2", "2.5", "3+"].map((x, i) => `<label class="cl-chip"><input type="radio" name="cl-bath"${i === 2 ? " checked" : ""}>${x}</label>`).join("")}</div></div>
      <div class="cl-grp cl-wide"><span class="cl-lab" id="cl-l3">How often?</span><div class="cl-chips" role="radiogroup" aria-labelledby="cl-l3">${[["One-time", "$185"], ["Weekly", "$130"], ["Every 2 weeks", "$140"], ["Every 4 weeks", "$160"]].map(([x, v], i) => `<label class="cl-chip"><input type="radio" name="cl-freq"${i === 2 ? " checked" : ""}>${x} <small>${v}</small></label>`).join("")}</div></div>
      <div class="cl-grp cl-wide"><span class="cl-lab">Extras for this visit</span><div class="cl-chips">${[["Inside oven", "$30", 1], ["Inside fridge", "$30", 0], ["Interior windows", "$40", 0], ["Inside cabinets", "$45", 0], ["Load of laundry", "$25", 0], ["Pet hair", "$20", 1]].map(([x, v, on]) => `<label class="cl-chip"><input type="checkbox"${on ? " checked" : ""}>${x} <small>+${v}</small></label>`).join("")}</div></div>
    </form>
    <aside class="cl-rcpt feat" aria-label="Your estimate">
      <span class="cl-mu">Your estimate</span>
      <div class="num cl-est">$190</div>
      <span class="cl-mu">for your first visit</span>
      <ul><li><span>2 bed, 2 bath, every 2 weeks</span><span>$140</span></li><li><span>Inside oven</span><span>+$30</span></li><li><span>Pet hair</span><span>+$20</span></li></ul>
      <span class="cl-mu">2 cleaners, about 2 hours. Later visits from $140.</span>
      <span class="cl-mu">No professional clean in the past two months? Your first visit is a $260 deep clean.</span>
      <a class="btn primary block" href="#book-a-clean">Book this clean</a>
    </aside>
  </div>
</div></section>

<section class="sk-sec cl-how" aria-label="How it works"><div class="sk-wrap"><ol class="cl-steps sk-rail">${[["Get a price", "Answer four questions above. No home visit."], ["Pick a day", "Choose a day and a two-hour arrival window."], ["We clean", "We text when we’re on the way and when we finish."], ["Check it", "Not right? Tell us within 24 hours and we redo it."]].map(([a, b]) => `<li><b>${a}</b><span>${b}</span></li>`).join("")}</ol></div></section>

<section class="sk-sec" id="what-s-included"><div class="sk-wrap">
  <div class="sk-head" style="margin-bottom:24px"><div><span class="sk-eyebrow">What’s included</span><h2 class="sk-h2">Room by room, what each clean covers</h2></div><p class="muted" style="max-width:340px;font-size:14px">Add-ons show their price. A dash means it isn’t part of that clean.</p></div>
  <div class="cl-plans-h">${[["Standard", "$185", "2 to 3 hours. Keeps a tidy home clean."], ["Deep", "$260", "4 to 5 hours. First visits, spring cleans."], ["Move-out", "$340", "5 to 6 hours. Empty homes, end of lease."]].map(([a, b, c], i) => `<div class="card cl-tier${i === 1 ? " sel" : ""}"><b>${a}</b><div class="num">${b}</div><span>${c}</span></div>`).join("")}</div>
  <div class="cl-rooms sk-rail">${[ROOMS[0], ROOMS[2], ROOMS[1], ROOMS[3]].map((r) => `<div>${roomTable(r)}</div>`).join("")}</div>
  <p class="cl-note">Prices shown for a 2 bed, 2 bath home. Your quote above uses your own home size.</p>
</div></section>

<section class="sk-sec sk-alt" id="plans"><div class="sk-wrap">
  <div class="sk-head" style="margin-bottom:24px"><div><span class="sk-eyebrow">Recurring plans</span><h2 class="sk-h2">The more often, the less each visit costs</h2></div></div>
  <div class="cl-plans sk-rail">${PLANS.map(([n, v, d, f]) => `<article class="card cl-plan${f ? " feat" : ""}">${f ? `<span class="badge">Most homes</span>` : ""}<h3 class="sk-h3">${n}</h3><div class="num">${v}<small> / visit</small></div><p>${d}</p></article>`).join("")}</div>
  <div class="cl-terms"><span>${ic("calendar", 15)} Skip or move a visit with 48 hours’ notice</span><span>${ic("x", 15)} Cancel any time, no contract</span><span>${ic("spark", 15)} Deep clean first if the home needs it</span></div>
</div></section>

<section class="sk-sec" id="how-we-work"><div class="sk-wrap cl-same">
  <div class="cl-copy"><span class="sk-eyebrow">Same cleaner, each visit</span><h2 class="sk-h2">One person who knows your home</h2><p>You get a regular cleaner or pair, not whoever is free that day. Your notes stay on file, so nobody has to ask twice. If they’re away, we tell you the day before and send a named stand-in, or you can move the visit.</p>
    <div class="card cl-notes"><div class="cl-who"><span class="avatar">MB</span><div><b>Marisol Benat</b><div class="muted" style="font-size:13px">Your cleaner · Every other Thursday, 9 to 11 AM</div></div></div>
      <ul aria-label="Home notes">${[["Biscuit the dog stays in the back room. He’s friendly."], ["Oak floors in the hall: damp mop only."], ["Fragrance-free products in the main bathroom."]].map(([x]) => `<li><span>${ic("doc", 14)}</span><span>${x}</span></li>`).join("")}</ul></div></div>
  <div class="sk-photo">${kitchen()}<span class="sk-cap">Thursday, 11:02 AM. All done.</span></div>
</div></section>

<section class="sk-sec sk-alt" style="padding-top:56px;padding-bottom:56px"><div class="sk-wrap"><div class="cl-three sk-rail">
  <article class="card"><h3 class="sk-h3">What we bring</h3><ul>${["Vacuum with a fine-dust filter", "Mops, microfiber cloths, caddy", "All cleaning products", "Fragrance-free or pet-safe products on request"].map((x) => `<li><span>${ic("check", 14)}</span><span>${x}</span></li>`).join("")}</ul></article>
  <article class="card"><h3 class="sk-h3">What we need from you</h3><ul>${["Clutter picked up so we can reach surfaces", "Hot water and power on", "Pets in a safe spot, if they’re nervous", "Special products for stone or antiques, if you use them"].map((x) => `<li><span>${ic("check", 14)}</span><span>${x}</span></li>`).join("")}</ul></article>
  <article class="card cl-no"><h3 class="sk-h3">What we leave alone</h3><ul>${["Mold, pest droppings or biohazards", "Furniture over 30 lb", "Outside windows and anything above a step stool", "Dishes piled up from the week, unless you add it"].map((x) => `<li><span>${ic("x", 14)}</span><span>${x}</span></li>`).join("")}</ul></article>
</div></div></section>

<section class="sk-sec" style="padding-bottom:28px"><div class="sk-wrap cl-keys">
  <div><span class="sk-eyebrow">Keys and access</span><h2 class="sk-h2" style="margin-top:8px">However you’d like to let us in</h2>
    <div class="cl-keyg">${[["home", "You’re home", "We ring when we arrive."], ["lock", "Door code", "Stored encrypted. Change it any time."], ["key", "Lockbox", "Your box, your code."], ["tag", "Key on file", "Coded tag, never your address."]].map(([i, a, b]) => `<div><span class="cl-ico">${ic(i, 18)}</span><b>${a}</b><span>${b}</span></div>`).join("")}</div></div>
  <aside class="card cl-ins"><span style="color:var(--success)">${ic("shield", 20)}</span><h3 class="sk-h3">Insured, and our own employees</h3><p>Every cleaner is our employee, background-checked and trained by us. We carry liability insurance and bonding, and we can send a certificate for your building manager on request. If something gets broken, tell us and we’ll put it right.</p></aside>
</div></section>

<section class="sk-sec" id="areas" style="padding-top:28px"><div class="sk-wrap cl-area">
  <div><span class="sk-eyebrow">Areas served</span><h2 class="sk-h2" style="margin-top:8px">Where we clean</h2>
    <div class="cl-pills">${["Alder Heights", "Eastmere", "Millbrook", "Cooper Flats", "Harlow Park", "Stonebridge", "West Tamsin", "Fairhaven Row", "Old Quarry", "Linden Hill"].map((x) => `<span>${x}</span>`).join("")}</div></div>
  <aside class="card cl-office"><h3 class="sk-h3">Cleaning an office?</h3><p>We clean small offices, studios and shops after hours, one to five nights a week, with a fixed monthly price after a short walkthrough.</p><a class="btn" href="#book-a-clean">Ask for an office quote ${ic("arrow", 15)}</a></aside>
</div></section>

<section class="sk-sec sk-alt" id="reviews"><div class="sk-wrap">
  <div class="sk-head" style="margin-bottom:24px"><div><span class="sk-eyebrow">Customer reviews</span><h2 class="sk-h2">What people tell us</h2></div></div>
  <div class="cl-revs sk-rail">${REVIEWS.map(([q, n, m]) => `<article class="card cl-rev"><div class="cl-stars" aria-label="5 out of 5">${STAR}</div><p>${q}</p><footer><b style="color:var(--text)">${n}</b> · ${m}</footer></article>`).join("")}</div>
</div></section>

<section class="sk-sec" id="faq"><div class="sk-wrap cl-last">
  <div><span class="sk-eyebrow">FAQ</span><h2 class="sk-h2" style="margin:8px 0 16px">Good to know</h2><div class="cl-faq">${FAQ.map(([q, a, o]) => `<details${o ? " open" : ""}><summary>${q}${ic("chevdown", 18)}</summary><p>${a}</p></details>`).join("")}</div></div>
  <form class="card cl-form" aria-label="Book a clean" id="book-a-clean">
    <h2 class="sk-h3" style="font-size:calc(25px * var(--hs))">Book a clean</h2>
    <div class="sk-g2"><div class="sk-field"><label for="cl-name">Name</label><input class="sk-input" id="cl-name" value="Hannah Reisz"></div><div class="sk-field"><label for="cl-tel">Mobile</label><input class="sk-input" id="cl-tel" value="(555) 016-7714"></div></div>
    <div class="sk-field"><label for="cl-adr">Address</label><input class="sk-input" id="cl-adr" value="41 Larkspur Lane, Alder Heights"></div>
    <div class="sk-g2"><div class="sk-field"><label for="cl-svc">Clean</label><select class="sk-input" id="cl-svc"><option>Every 2 weeks</option><option>Weekly</option><option>Deep clean</option><option>Move-out clean</option></select></div><div class="sk-field"><label for="cl-day">First visit</label><select class="sk-input" id="cl-day"><option>Thu 12 Nov, 9 to 11 AM</option><option>Fri 13 Nov, 1 to 3 PM</option></select></div></div>
    <div class="sk-field"><label for="cl-acc">How do we get in?</label><select class="sk-input" id="cl-acc"><option>Door code</option><option>I’ll be home</option><option>Lockbox</option></select></div>
    <button class="btn primary sk-btn-lg" type="button">Book for $190</button>
    <p class="cl-note">No payment now. We charge your card after the clean.</p>
  </form>
</div></section>
</main>
${K.footer(p, "Home and small office cleaning, with the same cleaner each visit and a price you can see before you book.", [["Services", ["Recurring house cleaning", "Deep cleaning", "Move-in and move-out", "Office cleaning"]], ["Contact", ["(555) 016-3380", "hello@spruceway.example", "Mon to Sat, 8 AM to 6 PM"]], ["Company", ["2 Fennel Yard", "Join the team", "Gift a clean"]]])}`, CSS);

module.exports = {
  "cleaning-service-website": K.def("cleaning", "Cleaning service website",
    "a full house cleaning company home page led by its quote: navigation with a phone number and book button, a tinted hero with a wide instant quote card for home size, bathrooms, frequency and extras beside a filled estimate receipt, four how-it-works steps, a room-by-room checklist comparing standard, deep and move-out cleans with add-on prices, four recurring plan prices with skip and cancel terms, a same-cleaner section with a saved home notes card and a kitchen illustration, what we bring, what we need and what we leave alone, keys and access options with an insurance note, areas served pills with an office cleaning note, customer reviews, an FAQ beside a booking form and a footer",
    ["navigation-header", "hero", "instant-quote", "price-estimate", "chips", "steps", "comparison-table", "checklist", "pricing-cards", "home-notes", "access-options", "insurance", "service-area", "testimonials", "faq", "booking-form", "footer", "cleaning-service"], web),
};
