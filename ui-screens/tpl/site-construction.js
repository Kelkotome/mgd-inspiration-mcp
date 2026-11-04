/* Construction website template (Ironbark Builders — fictional general contractor for homes and small commercial builds).
   Full responsive home page: nav, hero with get-a-quote and a site photo, credentials bar, services, recent projects
   (featured + cards with scope/duration), process timeline, licensing/insurance facts with figures, quote request form, footer.
   Site and project "photos" are inline SVG in fixed natural tones. Licences/insurance are stated as plain facts, no real bodies. */
const { ic, esc } = require("../lib");
const K = require("../sitekit");

const CSS = `<style>
.ib-hero{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.15fr);gap:56px;align-items:center;padding-top:64px;padding-bottom:64px}
.ib-hero h1{max-width:560px}
.ib-visual{position:relative}
.ib-visual .sk-photo{aspect-ratio:6/5}
.ib-float{position:absolute;left:-28px;bottom:28px;display:grid;gap:4px;padding:16px 18px;min-width:220px;box-shadow:var(--shadow-lg)}
.ib-float .num{font-size:26px;line-height:1.1}
.ib-float small{color:var(--muted);font-size:13px}
.ib-bar{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));border-block:1px solid var(--border);background:var(--surface)}
.ib-bar>div{display:grid;grid-template-columns:36px minmax(0,1fr);gap:12px;align-items:center;padding:22px 24px;border-left:1px solid var(--border)}
.ib-bar>div:first-child{border-left:0;padding-left:0}
.ib-bar .ib-ic{width:36px;height:36px;border-radius:var(--radius);display:grid;place-items:center;background:color-mix(in oklab,var(--primary) 14%,var(--bg));color:color-mix(in oklab,var(--primary) 70%,var(--text))}
.ib-bar b{display:block;font-size:14px}
.ib-bar span{font-size:13px;color:var(--muted)}
.ib-bar-out{background:var(--surface);border-block:1px solid var(--border)}
.ib-bar-out .ib-bar{border:0;background:none}
.ib-svc{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:0;border-top:2px solid var(--text)}
.ib-svc article{padding:26px 24px 8px 0;display:grid;gap:10px;align-content:start}
.ib-svc article+article{padding-left:24px;border-left:1px solid var(--border)}
.ib-svc .ib-no{font:600 13px var(--font-b);color:var(--muted);letter-spacing:.06em}
.ib-svc ul{list-style:none;display:grid;gap:6px;font-size:14px;color:var(--muted)}
.ib-svc li{display:flex;gap:8px;align-items:flex-start}
.ib-svc li svg{flex:none;margin-top:4px;color:color-mix(in oklab,var(--primary) 70%,var(--text))}
.ib-svc .ib-from{font-size:13px;padding-top:10px;border-top:1px dashed var(--border)}
.ib-feat{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);padding:0;overflow:hidden;margin-bottom:24px}
.ib-feat .sk-photo{border-radius:0;aspect-ratio:auto;height:100%;min-height:380px}
.ib-feat>div:last-child{padding:36px;display:grid;gap:16px;align-content:start}
.ib-spec{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0;border-top:1px solid var(--border)}
.ib-spec>div{padding:12px 0;border-bottom:1px solid var(--border);font-size:14px}
.ib-spec dt{color:var(--muted);font-size:12px;text-transform:uppercase;letter-spacing:.06em}
.ib-spec dd{font-weight:600}
.ib-quote{font-family:var(--font-h);font-size:calc(17px * var(--hs));line-height:1.45;padding-left:16px;border-left:3px solid var(--primary)}
.ib-proj{padding:0;overflow:hidden}
.ib-proj .sk-photo{aspect-ratio:16/10;border-radius:0}
.ib-proj>div:last-child{padding:18px 20px 20px;display:grid;gap:6px}
.ib-meta{display:flex;flex-wrap:wrap;gap:6px 14px;font-size:13px;color:var(--muted)}
.ib-meta span{display:inline-flex;gap:6px;align-items:center}
.ib-steps{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:20px;list-style:none;position:relative}
.ib-steps::before{content:"";position:absolute;left:22px;right:22px;top:22px;height:2px;background:var(--border)}
.ib-steps li{position:relative;display:grid;gap:8px;align-content:start}
.ib-dot{width:46px;height:46px;border-radius:50%;display:grid;place-items:center;font-weight:700;background:var(--bg);border:2px solid var(--primary);color:var(--text)}
.ib-steps li:first-child .ib-dot{background:var(--primary);color:var(--on-primary)}
.ib-wk{font-size:12px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:color-mix(in oklab,var(--primary) 75%,var(--text))}
.ib-steps p{font-size:14px;color:var(--muted)}
.ib-cred{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);gap:56px;align-items:start}
.ib-table{width:100%;border-collapse:collapse;font-size:14px}
.ib-table th,.ib-table td{text-align:left;padding:13px 0;border-bottom:1px solid var(--border);vertical-align:top}
.ib-table th{font-weight:500;color:var(--muted);width:42%;padding-right:16px}
.ib-table td{font-weight:600}
.ib-figs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
.ib-figs>div{padding:24px;display:grid;gap:4px}
.ib-figs .num{font-size:38px;line-height:1.05}
.ib-figs span{font-size:13px;color:var(--muted)}
.ib-note{grid-column:1/-1;padding:24px;display:grid;gap:12px}
.ib-qwrap{display:grid;grid-template-columns:minmax(0,.8fr) minmax(0,1.2fr);gap:0;padding:0;overflow:hidden}
.ib-next{padding:40px;display:grid;gap:18px;align-content:start;border-right:1px solid var(--border);background:color-mix(in oklab,var(--primary) 8%,var(--surface))}
.ib-next ol{list-style:none;display:grid;gap:14px}
.ib-next li{display:grid;grid-template-columns:28px minmax(0,1fr);gap:10px;font-size:14px}
.ib-next li b{display:block;font-size:15px}
.ib-next li>span:first-child{font-weight:700;color:color-mix(in oklab,var(--primary) 75%,var(--text))}
.ib-next .ib-contact{display:grid;gap:8px;padding-top:16px;border-top:1px solid var(--border);font-size:14px}
.ib-next .ib-contact span{display:flex;gap:8px;align-items:center}
.ib-form{padding:40px;display:grid;gap:16px}
.ib-form .sk-g2{gap:14px}
.ib-types{display:flex;flex-wrap:wrap;gap:8px}
.ib-type{height:38px;padding:0 14px;border:1px solid var(--border);border-radius:var(--radius);display:inline-flex;align-items:center;gap:8px;font-size:14px;font-weight:600;background:var(--bg)}
.ib-type.on{border-color:var(--primary);background:color-mix(in oklab,var(--primary) 14%,var(--bg))}
.ib-type.on::before{content:"";width:8px;height:8px;border-radius:50%;background:var(--primary)}
.ib-drop{display:flex;gap:10px;align-items:center;padding:14px;border:1px dashed var(--border);border-radius:var(--radius);font-size:14px;color:var(--muted)}
@media (max-width:1024px){
  .ib-bar{grid-template-columns:repeat(2,minmax(0,1fr))}
  .ib-bar>div:nth-child(3){border-left:0;padding-left:0}
  .ib-svc{grid-template-columns:repeat(2,minmax(0,1fr))}
  .ib-float{left:16px}
}
@media (max-width:760px){
  .ib-hero{grid-template-columns:minmax(0,1fr);gap:28px;padding-top:24px;padding-bottom:40px}
  .ib-visual .sk-photo{aspect-ratio:4/3}
  .ib-float{left:12px;bottom:12px;min-width:0;padding:10px 14px}
  .ib-float .num{font-size:20px}
  .ib-bar>div{padding:16px 12px 16px 0;grid-template-columns:minmax(0,1fr);gap:8px}
  .ib-bar>div:nth-child(even){padding-left:14px}
  .ib-bar>div:nth-child(n+3){border-top:1px solid var(--border)}
  .ib-svc{grid-template-columns:repeat(2,minmax(0,1fr))}
  .ib-svc article,.ib-svc article+article{padding:16px 12px 16px 0;border-left:0;border-bottom:1px solid var(--border);gap:6px}
  .ib-svc article:nth-child(even){padding-left:14px;border-left:1px solid var(--border)}
  .ib-svc ul,.ib-svc p{display:none}
  .ib-svc .ib-from{border-top:0;padding-top:0;color:var(--muted)}
  .ib-feat .ib-quote,.ib-feat p.muted,.ib-contact,.ib-table tr:nth-child(n+5){display:none!important}
  .ib-steps li:nth-child(n+2) p{display:none}
  .ib-steps{gap:14px}
  .ib-feat{grid-template-columns:minmax(0,1fr)}
  .ib-feat .sk-photo{aspect-ratio:16/10;height:auto;min-height:0}
  .ib-feat>div:last-child{padding:22px}
  .ib-steps{grid-template-columns:minmax(0,1fr);gap:18px}
  .ib-steps::before{left:22px;right:auto;top:22px;bottom:22px;width:2px;height:auto}
  .ib-steps li{grid-template-columns:46px minmax(0,1fr);column-gap:14px}
  .ib-steps li>:not(.ib-dot){grid-column:2}
  .ib-steps .ib-dot{grid-row:span 3}
  .ib-cred{grid-template-columns:minmax(0,1fr);gap:28px}
  .ib-figs>div{padding:18px}
  .ib-figs .num{font-size:28px}
  .ib-qwrap{grid-template-columns:minmax(0,1fr)}
  .ib-next{padding:24px;border-right:0;border-bottom:1px solid var(--border)}
  .ib-form{padding:24px}
  .ib-hide-m{display:none}
  .sk-rail{scroll-padding-inline:20px}
}
</style>`;

// ---- illustrative site & project "photos" (fixed natural tones) --------------------------------------------------
const W = { sky1: "#b7cfe0", sky2: "#eef1ea", timber: "#c9955d", timberD: "#9b6b3c", steel: "#6d7378", dirt: "#a68a6a", conc: "#c8c4bb", hiviz: "#e8a43a", glass: "#a9c4cf", brick: "#b5694f", plaster: "#ece6da", green: "#6f8f58" };
const siteShot = () => `<svg viewBox="0 0 600 500" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Timber-framed two-storey house under construction with scaffolding and a crane"><defs>
<linearGradient id="ib-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${W.sky1}"/><stop offset="1" stop-color="${W.sky2}"/></linearGradient></defs>
<rect width="600" height="500" fill="url(#ib-sky)"/>
<path d="M470 40v330M470 52h-230M470 52l40 30h-40" stroke="${W.hiviz}" stroke-width="8" fill="none"/>${Array.from({ length: 10 }, (_, i) => `<path d="M${466} ${60 + i * 30}l8 30M${474} ${60 + i * 30}l-8 30" stroke="#b98228" stroke-width="2"/>`).join("")}<path d="M300 52v70" stroke="#3a3c3f" stroke-width="2"/><rect x="282" y="122" width="36" height="16" fill="${W.timber}"/>
<rect y="380" width="600" height="120" fill="${W.dirt}"/><rect x="90" y="368" width="380" height="18" fill="${W.conc}"/>
<path d="M110 368V220h340v148" fill="none" stroke="${W.timber}" stroke-width="10"/>${[150, 190, 230, 270, 310, 350, 390, 430].map((x) => `<path d="M${x} 368V220" stroke="${W.timber}" stroke-width="6"/>`).join("")}<path d="M110 294h340" stroke="${W.timberD}" stroke-width="8"/>
<path d="M96 222L280 120l184 102" fill="none" stroke="${W.timberD}" stroke-width="10"/>${[140, 180, 220, 260, 300, 340, 380, 420].map((x) => `<path d="M${x} 220L${x < 280 ? x + (280 - x) * .25 : x - (x - 280) * .25} ${220 - (x < 280 ? (x - 96) : (464 - x)) * .55}" stroke="${W.timber}" stroke-width="5"/>`).join("")}
${[60, 500].map((x) => `<path d="M${x} 380V200M${x + 26} 380V200" stroke="${W.steel}" stroke-width="5"/>${[220, 270, 320, 370].map((y) => `<path d="M${x - 6} ${y}h38" stroke="${W.steel}" stroke-width="5"/>`).join("")}<path d="M${x} 240l26 50M${x + 26} 290l-26 50" stroke="${W.steel}" stroke-width="3"/>`).join("")}
<rect x="40" y="420" width="120" height="30" rx="4" fill="${W.timber}"/><path d="M40 428h120M40 438h120" stroke="${W.timberD}" stroke-width="2"/><rect x="420" y="410" width="110" height="44" rx="6" fill="${W.hiviz}"/><circle cx="440" cy="458" r="12" fill="#2b2b2b"/><circle cx="510" cy="458" r="12" fill="#2b2b2b"/>
<circle cx="250" cy="318" r="12" fill="#e0b48c"/><path d="M238 312a12 10 0 0 1 24 0z" fill="#f2d24a"/><rect x="238" y="330" width="24" height="38" rx="5" fill="${W.hiviz}"/></svg>`;
const proj = (kind, id) => {
  const g = `ib-p-${id}`;
  const s = {
    newbuild: [`New two-storey family home with timber cladding`, `<rect x="70" y="80" width="200" height="140" fill="#d7c2a2"/>${Array.from({ length: 12 }, (_, i) => `<path d="M${76 + i * 16} 80v140" stroke="#b89c78" stroke-width="2"/>`).join("")}<path d="M60 84l110-56 110 56z" fill="#4a4d52"/><rect x="270" y="130" width="90" height="90" fill="#ece6da"/><rect x="266" y="124" width="98" height="8" fill="#4a4d52"/><rect x="96" y="106" width="60" height="46" fill="${W.glass}"/><rect x="186" y="106" width="60" height="46" fill="${W.glass}"/><rect x="286" y="150" width="58" height="70" fill="${W.glass}"/><rect x="120" y="168" width="34" height="52" fill="#3d5a6b"/>`],
    extension: [`Rear glass-box kitchen extension onto a brick house`, `<rect x="50" y="50" width="190" height="170" fill="${W.brick}"/>${Array.from({ length: 16 }, (_, i) => `<path d="M50 ${58 + i * 10}h190" stroke="#9c5843" stroke-width="1.5"/>`).join("")}<path d="M40 54l105-40 105 40z" fill="#5f4638"/><rect x="74" y="76" width="44" height="50" fill="#f3e6c4"/><rect x="172" y="76" width="44" height="50" fill="#f3e6c4"/><rect x="200" y="132" width="170" height="88" fill="${W.glass}" opacity=".9"/><path d="M200 132h170M256 132v88M313 132v88" stroke="#3a3c3f" stroke-width="5"/><rect x="196" y="126" width="178" height="8" fill="#3a3c3f"/><rect x="230" y="186" width="80" height="12" fill="#e8dfcf"/>`],
    reno: [`Renovated kitchen with timber cabinets and an island`, `<rect width="400" height="250" fill="#ece6da"/><rect y="190" width="400" height="60" fill="#b89c78"/><rect x="30" y="40" width="340" height="60" fill="#8fa48a"/>${[30, 115, 200, 285].map((x) => `<rect x="${x + 4}" y="44" width="77" height="52" fill="#9db098"/>`).join("")}<rect x="30" y="122" width="340" height="68" fill="#7f9578"/><rect x="30" y="116" width="340" height="8" fill="#f4f1ea"/><rect x="110" y="160" width="180" height="56" fill="#c9955d"/><rect x="104" y="152" width="192" height="10" fill="#f4f1ea"/>${[150, 200, 250].map((x) => `<path d="M${x} 0v20" stroke="#3a3c3f" stroke-width="2"/><path d="M${x - 12} 20h24l-6 14h-12z" fill="#e3c27a"/>`).join("")}`],
    fitout: [`Café fit-out with a long counter and pendant lights`, `<rect width="400" height="250" fill="#3f4a45"/><rect y="180" width="400" height="70" fill="#a68a6a"/><rect x="40" y="130" width="250" height="56" fill="#d7c2a2"/><rect x="34" y="124" width="262" height="10" fill="#efe9df"/>${[70, 130, 190, 250].map((x) => `<path d="M${x} 0v50" stroke="#1d2421" stroke-width="2"/><circle cx="${x}" cy="58" r="10" fill="#f6c36d"/><rect x="${x - 8}" y="186" width="16" height="40" fill="#2d3330"/>`).join("")}<rect x="310" y="40" width="70" height="140" fill="#5c6b63"/>${[60, 100, 140].map((y) => `<path d="M314 ${y}h62" stroke="#c9b48f" stroke-width="4"/>`).join("")}<circle cx="340" cy="210" r="18" fill="${W.green}"/>`],
    office: [`Small office refit with glazed meeting room`, `<rect width="400" height="250" fill="#e3e4e0"/><rect y="196" width="400" height="54" fill="#9a9c98"/><rect x="40" y="50" width="190" height="146" fill="${W.glass}" opacity=".6"/><path d="M40 50h190v146H40zM135 50v146" stroke="#4a4d52" stroke-width="4" fill="none"/><rect x="70" y="140" width="130" height="10" fill="#c9955d"/>${[260, 320].map((x) => `<rect x="${x}" y="150" width="50" height="8" fill="#c9955d"/><rect x="${x + 16}" y="122" width="22" height="28" fill="#3a3c3f"/>`).join("")}<circle cx="370" cy="90" r="22" fill="${W.green}"/><rect x="364" y="110" width="12" height="40" fill="#7d5b48"/>`],
  }[kind];
  return `<svg viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${esc(s[0])}"><defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${W.sky1}"/><stop offset="1" stop-color="${W.sky2}"/></linearGradient></defs><rect width="400" height="250" fill="url(#${g})"/><rect y="220" width="400" height="30" fill="#9bb07a"/>${s[1]}</svg>`;
};

const SERVICES = [
  ["home", "New builds", "Single and two-storey homes on your land, from slab to handover.", ["Design and engineering coordinated", "Council approvals managed", "Fixed-price contract"], "Typical build: 7–10 months"],
  ["plus", "Extensions", "Ground-floor and second-storey additions that tie into the existing house.", ["Structural steel and underpinning", "Matching brick or new cladding", "Stay-at-home staging where possible"], "Typical build: 3–5 months"],
  ["refresh", "Renovations", "Kitchens, bathrooms, layout changes and whole-house refurbishments.", ["Strip-out and rewiring", "Waterproofing and tiling", "Joinery by our own shop"], "Typical build: 6–14 weeks"],
  ["grid", "Commercial fit-outs", "Cafés, clinics, shops and offices up to around 600 m².", ["After-hours work for open sites", "Services and compliance sign-off", "Staged handover"], "Typical build: 4–12 weeks"],
];
const PROJECTS = [
  ["extension", "Kellerman Street extension", "Rear kitchen and living extension, structural steel, bi-fold glazing", "14 weeks", "Northgate"],
  ["fitout", "Grain & Co café", "Commercial fit-out: counter, kitchen extraction, seating for 40", "6 weeks", "Market Square"],
  ["reno", "Fairlie Road kitchen", "Kitchen and laundry renovation with a new island and pantry", "8 weeks", "Southwood"],
];
const STEPS = [["Week 0", "Site visit", "We walk the site with you, measure up and talk budget honestly. Free, about an hour."],
  ["Weeks 1–3", "Fixed quote", "Itemised pricing, a schedule and allowances listed line by line."],
  ["Weeks 3–8", "Design & approvals", "We coordinate the architect, engineer and permit applications."],
  ["Build", "On site", "One site lead, a weekly update with photos, and a shared defects list."],
  ["Handover", "Keys & aftercare", "Final walkthrough, manuals and warranties, a 90-day check-in visit."]];

const web = (p, st) => K.page(st, `${K.nav(p, ["Services", "Projects", "Process", "About"], "Get a quote", "(555) 017-3300")}
<main>
<section class="sk-wrap ib-hero" id="top">
  <div class="sk-stack" style="gap:22px">
    <span class="sk-eyebrow">General contractor · Homes & small commercial</span>
    <h1 class="sk-h1">Solid builds, plain pricing, one crew from slab to keys</h1>
    <p class="sk-lede">${esc(p.name)} builds new homes, extensions, renovations and fit-outs with our own carpenters and a small crew of trusted trades. One fixed quote, one site lead, no surprises buried in the fine print.</p>
    <div class="sk-row"><a class="btn primary sk-btn-lg" href="#get-a-quote">Get a quote ${ic("arrow", 16)}</a><a class="btn sk-btn-lg" href="#projects">See recent projects</a></div>
    <p class="muted ib-hide-m" style="font-size:14px">${ic("clock", 14)} Site visits within 7 days · we reply to every enquiry by the next working day</p>
  </div>
  <div class="ib-visual"><div class="sk-photo">${siteShot()}</div>
    <div class="card ib-float"><small>Now on site</small><div class="num">Week 11 of 30</div><small>Two-storey home, Ridgeview Drive</small></div></div>
</section>

<div class="ib-bar-out"><div class="sk-wrap"><div class="ib-bar">${[["shield", "Licensed builder", "Licence no. GC-48213"], ["check", "Fully insured", "$10m public liability"], ["doc", "Fixed-price contracts", "Variations agreed in writing"], ["key", "Structural warranty", "10 years on new builds"]].map(([i, t, d]) => `<div><span class="ib-ic">${ic(i, 18)}</span><div><b>${t}</b><span>${d}</span></div></div>`).join("")}</div></div></div>

<section class="sk-sec" id="services"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">What we build</span><h2 class="sk-h2">Four kinds of work, one crew</h2></div><p class="muted ib-hide-m" style="max-width:380px">Each job has one site lead from ${esc(p.name)}, start to finish. We use our own carpenters for framing and joinery and the same electricians and plumbers we’ve worked with for years.</p></div>
  <div class="ib-svc">${SERVICES.map(([i, t, d, list, from], n) => `<article><span class="ib-no">0${n + 1}</span><h3 class="sk-h3">${t}</h3><p class="muted" style="font-size:14px">${d}</p><ul>${list.map((x) => `<li>${ic("check", 14)}<span>${x}</span></li>`).join("")}</ul><span class="ib-from"><b>${from}</b></span></article>`).join("")}</div>
</div></section>

<section class="sk-sec sk-alt" id="projects"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">Recent projects</span><h2 class="sk-h2">What we finished this year</h2></div><a class="btn sk-btn-lg ib-hide-m" href="#">All 46 projects ${ic("arrow", 16)}</a></div>
  <article class="card ib-feat"><div class="sk-photo">${proj("newbuild", 0)}</div>
    <div><span class="badge" style="justify-self:start">New build · Completed Sept 2026</span><h3 class="sk-h3" style="font-size:calc(26px * var(--hs))">Ashgrove Lane family home</h3>
      <p class="muted">Four-bedroom, two-storey home on a sloping block, with a stepped slab, cedar cladding and a north-facing living wing.</p>
      <dl class="ib-spec">${[["Scope", "Slab to handover"], ["Duration", "38 weeks"], ["Floor area", "248 m²"], ["Location", "Ashgrove"]].map(([a, b]) => `<div><dt>${a}</dt><dd>${b}</dd></div>`).join("")}</dl>
      <p class="ib-quote">“Weekly photos every Friday meant we always knew where things stood, even from two hours away.” <span class="muted" style="font-family:var(--font-b);font-size:13px">Nadia & Sean K.</span></p></div></article>
  <div class="sk-g3 sk-rail">${PROJECTS.map(([k, t, d, dur, loc], i) => `<article class="card ib-proj"><div class="sk-photo">${proj(k, i + 1)}</div><div><h3 class="sk-h3" style="font-size:calc(18px * var(--hs))">${t}</h3><p class="muted" style="font-size:14px">${d}</p><div class="ib-meta"><span>${ic("clock", 13)} ${dur}</span><span>${ic("pin", 13)} ${loc}</span></div></div></article>`).join("")}</div>
</div></section>

<section class="sk-sec" id="process"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">How a job runs</span><h2 class="sk-h2">From first visit to the keys</h2></div></div>
  <ol class="ib-steps">${STEPS.map(([w, t, d], i) => `<li><span class="ib-dot">${i + 1}</span><span class="ib-wk">${w}</span><h3 class="sk-h3" style="font-size:calc(18px * var(--hs))">${t}</h3><p>${d}</p></li>`).join("")}</ol>
</div></section>

<section class="sk-sec sk-alt sk-tight" id="about"><div class="sk-wrap ib-cred">
  <div class="sk-stack" style="gap:16px"><span class="sk-eyebrow">Licensing & insurance</span><h2 class="sk-h2">The paperwork, up front</h2>
    <p class="muted ib-hide-m">Copies of every certificate below come with your quote. Ask for them at the site visit too.</p>
    <table class="ib-table"><tbody>${[["Builder licence", "GC-48213, unrestricted residential and commercial"], ["Public liability", "$10,000,000 per occurrence"], ["Contract works insurance", "Full replacement value, every job"], ["Home warranty cover", "Provided on residential work over $20,000"], ["Workers’ compensation", "All employed staff"], ["Site safety", "Written site plan and induction for every project"]].map(([a, b]) => `<tr><th scope="row">${a}</th><td>${b}</td></tr>`).join("")}</tbody></table>
  </div>
  <div class="ib-figs">${[["17", "years building in the region"], ["212", "projects completed since 2009"], ["14", "carpenters and apprentices employed"], ["46", "projects in the last 12 months"]].map(([v, l]) => `<div class="card"><div class="num">${v}</div><span>${l}</span></div>`).join("")}
    <figure class="card ib-note"><p class="ib-quote">“They sent the insurance certificates with the quote before I’d even asked. The fit-out ran around our opening hours for six weeks.”</p><figcaption class="muted" style="font-size:13px"><b style="color:var(--text)">Owen R.</b> · Café owner, Market Square</figcaption></figure></div>
</div></section>

<section class="sk-sec" id="get-a-quote"><div class="sk-wrap">
  <div class="card ib-qwrap">
    <div class="ib-next"><span class="sk-eyebrow">Request a quote</span><h2 class="sk-h2">Tell us about the job</h2>
      <ol>${[["Call back within a day", "We’ll ask a few questions and book a site visit."], ["Free site visit", "Measure-up and an honest talk about budget."], ["Written quote in 2–3 weeks", "Itemised, fixed-price, valid for 60 days."]].map(([t, d], i) => `<li><span>0${i + 1}</span><span><b>${t}</b><span class="muted">${d}</span></span></li>`).join("")}</ol>
      <div class="ib-contact"><span>${ic("phone", 15)} (555) 017-3300 · Mon–Fri 7–5</span><span>${ic("mail", 15)} quotes@ironbark.example</span><span>${ic("pin", 15)} Yard: 9 Sawmill Road, Northgate</span></div></div>
    <form class="ib-form" aria-label="Quote request">
      <div class="sk-field"><label>Project type</label><div class="ib-types" role="radiogroup">${[["New build", 0], ["Extension", 1], ["Renovation", 0], ["Commercial fit-out", 0], ["Something else", 0]].map(([t, on]) => `<span class="ib-type${on ? " on" : ""}" role="radio" aria-checked="${on ? "true" : "false"}">${t}</span>`).join("")}</div></div>
      <div class="sk-g2"><div class="sk-field"><label for="ib-budget">Budget range</label><select class="sk-input" id="ib-budget"><option>$150k–$300k</option><option>Under $50k</option><option>$50k–$150k</option><option>$300k+</option></select></div><div class="sk-field"><label for="ib-start">Ideal start date</label><input class="sk-input" id="ib-start" type="text" value="March 2027"></div></div>
      <div class="sk-g2"><div class="sk-field"><label for="ib-pc">Site postcode</label><input class="sk-input" id="ib-pc" value="4051"></div><div class="sk-field"><label for="ib-name">Your name</label><input class="sk-input" id="ib-name" value="Lin Park"></div></div>
      <div class="sk-g2"><div class="sk-field"><label for="ib-em">Email</label><input class="sk-input" id="ib-em" placeholder="you@example.com"></div><div class="sk-field"><label for="ib-ph">Phone</label><input class="sk-input" id="ib-ph" placeholder="(555) 000-0000"></div></div>
      <div class="sk-field"><label for="ib-desc">Describe the work</label><textarea class="sk-input" id="ib-desc">Single-storey rear extension, about 30 m², new kitchen and a second bathroom. We have concept drawings from an architect.</textarea></div>
      <div class="ib-drop">${ic("upload", 18)} Attach drawings or photos (PDF, JPG, up to 20 MB)</div>
      <button class="btn primary sk-btn-lg" type="button">Send my quote request</button>
    </form>
  </div>
</div></section>
</main>
${K.footer(p, "Homes, extensions, renovations and small commercial builds. Family-run since 2009.", [["Visit the yard", ["9 Sawmill Road, Northgate", "Mon–Fri 7 AM–5 PM", "Sat by appointment"]], ["Contact", ["(555) 017-3300", "quotes@ironbark.example", "Careers & apprenticeships"]], ["Work", ["New builds", "Extensions", "Renovations", "Commercial fit-outs"]]], `© 2026 ${p.name}. Builder licence GC-48213.`)}`, CSS);

module.exports = {
  "construction-website": K.def("construction", "Construction company website",
    "a full general contractor home page: navigation with phone number and get-a-quote, a hero with a construction-site photo, quote and projects buttons and a now-on-site progress card, a credentials bar (licence, insurance, fixed-price contracts, structural warranty), four numbered services with inclusions and typical build times, recent projects with a featured build (scope, duration, floor area, client quote) and project cards with duration and location, a five-step process timeline, a licensing and insurance table with company figures, a quote request form (project type, budget range, start date, postcode, contact details, description, file attachment) beside what-happens-next steps and contact details, and a footer",
    ["navigation-header", "hero", "trust-bar", "services", "project-gallery", "case-study", "testimonials", "timeline", "process-steps", "table", "stats", "quote-form", "file-upload", "footer", "construction"], web),
};
