/* Architecture website template (Atelier Obra — fictional architecture and interiors practice). Full responsive home page:
   nav, editorial hero with a panoramic building image and project index, filterable projects (feature + index list),
   practice philosophy, five service stages from feasibility to handover, studio + recognition figures, project enquiry form, footer.
   One HTML document rendered at 1440 (web) and 390 (mobile). Building "photos" are inline SVG scenes in fixed natural tones. */
const { ic, esc } = require("../lib");
const K = require("../sitekit");

const CSS = `<style>
.ar-hero{padding-top:72px;padding-bottom:40px;display:grid;grid-template-columns:minmax(0,1.5fr) minmax(0,1fr);gap:64px;align-items:end}
.ar-hero h1{font-size:calc(64px * var(--hs));line-height:1.02}
.ar-pano{aspect-ratio:21/8;border-radius:var(--radius-lg)}
.ar-panometa{display:flex;justify-content:space-between;gap:24px;padding:16px 0 0;font-size:14px;color:var(--muted)}
.ar-panometa b{color:var(--text);font-weight:600}
.ar-filter{display:flex;gap:6px;flex-wrap:wrap;border:1px solid var(--border);padding:4px;border-radius:999px;background:var(--bg)}
.ar-chip{height:34px;padding:0 16px;border-radius:999px;display:inline-flex;align-items:center;font-weight:600;font-size:13px;color:var(--muted)}
.ar-chip.on{background:var(--text);color:var(--bg)}
.ar-proj{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,1fr);gap:48px;align-items:start}
.ar-feat{display:grid;gap:16px}
.ar-feat .sk-photo{aspect-ratio:4/3}
.ar-tagrow{display:flex;gap:8px;flex-wrap:wrap}
.ar-index{list-style:none;border-top:1px solid var(--text)}
.ar-index li{display:grid;grid-template-columns:34px minmax(0,1fr) auto;gap:16px;align-items:center;padding:16px 0;border-bottom:1px solid var(--border)}
.ar-index li.on{background:color-mix(in oklab,var(--primary) 8%,transparent);margin:0 -14px;padding:16px 14px;border-radius:var(--radius)}
.ar-index .sk-photo{display:none}
.ar-index h3{font-size:calc(18px * var(--hs))}
.ar-index small{display:block;color:var(--muted);font-size:13px}
.ar-yr{font-size:14px;color:var(--muted)}
.ar-onsite{padding:22px 24px;display:grid;gap:16px}
.ar-site{display:grid;gap:4px}
.ar-siterow{display:flex;justify-content:space-between;gap:12px;font-size:14px;flex-wrap:wrap}
.ar-bar{height:6px;border-radius:3px;background:color-mix(in oklab,var(--text) 10%,transparent);margin-top:6px;overflow:hidden}
.ar-bar i{display:block;height:100%;background:var(--primary)}
.ar-expect{padding:22px 24px;display:grid;gap:10px;width:100%}
.ar-expect div{display:flex;justify-content:space-between;gap:12px;font-size:14px;padding-bottom:10px;border-bottom:1px solid var(--border)}
.ar-expect div:last-child{border-bottom:0;padding-bottom:0}
.ar-no{font:600 13px var(--font-b);color:var(--muted)}
.ar-phil{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.4fr);gap:64px;align-items:start}
.ar-phil blockquote{font-family:var(--font-h);font-size:calc(34px * var(--hs));line-height:1.2}
.ar-princ{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:28px;margin-top:40px;padding-top:28px;border-top:1px solid var(--border)}
.ar-princ>div{display:grid;gap:8px;align-content:start}
.ar-stages{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));border:1px solid var(--border);border-radius:var(--radius-lg);overflow:hidden;background:var(--bg)}
.ar-stage{padding:26px 22px;display:grid;gap:10px;align-content:start}
.ar-stage+.ar-stage{border-left:1px solid var(--border)}
.ar-stage .num{font-size:30px;line-height:1;color:color-mix(in oklab,var(--primary) 82%,var(--text))}
.ar-stage ul{list-style:none;display:grid;gap:4px;font-size:13px;color:var(--muted);margin-top:4px}
.ar-dur{font-size:12px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.06em}
.ar-studio{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:56px;align-items:center}
.ar-studio .sk-photo{aspect-ratio:5/4}
.ar-figs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0;border-top:1px solid var(--border);width:100%}
.ar-figs>div{padding:18px 0;border-bottom:1px solid var(--border)}
.ar-figs>div:nth-child(odd){padding-right:20px;border-right:1px solid var(--border)}
.ar-figs>div:nth-child(even){padding-left:20px}
.ar-figs .num{font-size:34px;line-height:1.1}
.ar-enq{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);gap:56px;align-items:start}
.ar-form{padding:36px;display:grid;gap:16px}
.ar-form .sk-g2{gap:14px}
.ar-radios{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
.ar-radio{display:flex;gap:10px;align-items:center;padding:12px 14px;border:1px solid var(--border);border-radius:var(--radius);font-size:14px;font-weight:500;background:var(--bg)}
.ar-radio i{width:16px;height:16px;border-radius:50%;border:2px solid var(--border);flex:none}
.ar-radio.on{border-color:var(--primary)}
.ar-radio.on i{border:5px solid var(--primary)}
.ar-contact{display:grid;gap:14px;font-size:14px}
.ar-contact div{display:flex;gap:12px;align-items:flex-start}
.ar-contact svg{flex:none;margin-top:3px;color:var(--muted)}
@media (max-width:1024px){
  .ar-stages{grid-template-columns:repeat(3,minmax(0,1fr))}
  .ar-stage:nth-child(4){border-left:0}
  .ar-stage:nth-child(n+4){border-top:1px solid var(--border)}
}
@media (max-width:760px){
  .ar-hero{grid-template-columns:minmax(0,1fr);gap:18px;padding-top:32px;padding-bottom:24px}
  .ar-hero h1{font-size:calc(40px * var(--hs))}
  .ar-pano{aspect-ratio:4/3;border-radius:var(--radius)}
  .ar-panometa{flex-direction:column;gap:4px}
  .ar-proj{grid-template-columns:minmax(0,1fr);gap:24px}
  .ar-filter{border-radius:var(--radius)}
  .ar-index li{grid-template-columns:64px minmax(0,1fr);gap:14px;padding:12px 0}
  .ar-index li.on{margin:0;padding:12px 0;background:none}
  .ar-index .sk-photo{display:block;width:64px;height:64px;border-radius:var(--radius)}
  .ar-index .ar-no,.ar-yr{display:none}
  .ar-phil{grid-template-columns:minmax(0,1fr);gap:20px}
  .ar-phil blockquote{font-size:calc(25px * var(--hs))}
  .ar-princ{grid-template-columns:minmax(0,1fr);gap:16px;margin-top:20px}
  .ar-stages{grid-template-columns:minmax(0,1fr)}
  .ar-stage{padding:18px 20px;grid-template-columns:44px minmax(0,1fr);gap:4px 14px}
  .ar-stage>*:not(.num){grid-column:2}
  .ar-stage .num{grid-row:span 4;font-size:26px}
  .ar-stage+.ar-stage,.ar-stage:nth-child(n+4){border-left:0;border-top:1px solid var(--border)}
  .ar-stage ul{display:none}
  .ar-studio,.ar-enq{grid-template-columns:minmax(0,1fr);gap:24px}
  .ar-studio .sk-photo{aspect-ratio:16/10}
  .ar-form{padding:22px}
  .ar-radios{grid-template-columns:minmax(0,1fr)}
  .ar-expect{display:none}
}
</style>`;

// ---- illustrative building "photos" (fixed natural tones) ----------------------------------------------------------
const SKY = { dusk: ["#e9c9a8", "#b9c3cf"], day: ["#cfdbe4", "#eef0ea"], grey: ["#d4d6d4", "#e9e7e1"] };
const sky = (id, [a, b]) => `<defs><linearGradient id="ar-sky-${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${b}"/><stop offset="1" stop-color="${a}"/></linearGradient></defs>`;
const SCENES = {
  house: ["Concrete and timber house on a sloping site", "dusk", (id) => `<rect width="800" height="500" fill="url(#ar-sky-${id})"/>
<path d="M0 380C200 340 420 360 800 320V500H0z" fill="#8a9a6e"/><path d="M0 420C260 400 520 410 800 380V500H0z" fill="#6f7f57"/>
<rect x="190" y="200" width="430" height="70" fill="#c9c4bb"/><rect x="250" y="270" width="320" height="110" fill="#a5794f"/>
${[270, 330, 390, 450, 510].map((x) => `<rect x="${x}" y="286" width="44" height="80" fill="#f2d79a" opacity=".85"/>`).join("")}<rect x="190" y="200" width="430" height="10" fill="#e0dcd4"/>
<rect x="560" y="236" width="140" height="144" fill="#b7b1a6"/><rect x="580" y="260" width="100" height="56" fill="#3d4650"/><path d="M120 380h560" stroke="#57603f" stroke-width="6"/>
${[[90, 300, 46], [720, 290, 52], [150, 330, 30]].map(([x, y, r]) => `<rect x="${x - 3}" y="${y}" width="6" height="${90}" fill="#4f4434"/><circle cx="${x}" cy="${y}" r="${r}" fill="#5f7346"/>`).join("")}`],
  gallery: ["Gallery with a sawtooth roof and a public courtyard", "day", (id) => `<rect width="800" height="500" fill="url(#ar-sky-${id})"/>
<rect y="380" width="800" height="120" fill="#d8d2c4"/>${Array.from({ length: 12 }, (_, i) => `<path d="M${0 + i * 70} 380h70" stroke="#c6bfaf" stroke-width="2"/>`).join("")}
<path d="M120 180${Array.from({ length: 6 }, (_, i) => `l45 -50v50l45 0`).join("")}V380H120z" fill="#ece8df"/><rect x="120" y="180" width="540" height="200" fill="#e6e1d6"/>
${Array.from({ length: 6 }, (_, i) => `<path d="M${165 + i * 90} 130v50" stroke="#9eb2be" stroke-width="10"/>`).join("")}<rect x="250" y="280" width="200" height="100" fill="#4a5560"/><rect x="262" y="292" width="176" height="88" fill="#7d93a3" opacity=".7"/>
<rect x="520" y="230" width="90" height="40" fill="#b9b3a7"/>${[[90, 70], [700, 90]].map(([x, h]) => `<rect x="${x - 3}" y="${380 - h}" width="6" height="${h}" fill="#5e5242"/><circle cx="${x}" cy="${380 - h}" r="34" fill="#87986a"/>`).join("")}
${[330, 360, 560].map((x, i) => `<circle cx="${x}" cy="${392 + i * 6}" r="7" fill="#3f3a35"/><rect x="${x - 6}" y="${398 + i * 6}" width="12" height="26" rx="5" fill="${["#9a5b3c", "#3d5a73", "#7b6a4f"][i]}"/>`).join("")}`],
  office: ["Workplace building with a timber frame and planted terraces", "grey", (id) => `<rect width="800" height="500" fill="url(#ar-sky-${id})"/>
<rect x="220" y="90" width="360" height="330" fill="#cbb08a"/>${Array.from({ length: 5 }, (_, r) => Array.from({ length: 6 }, (_, c) => `<rect x="${232 + c * 58}" y="${102 + r * 64}" width="48" height="52" fill="#56697a" opacity=".82"/>`).join("")).join("")}
${[154, 218, 282].map((y) => `<rect x="214" y="${y}" width="372" height="8" fill="#9c7f5a"/><path d="M220 ${y}q20-16 40 0t40 0 40 0 40 0 40 0 40 0 40 0 40 0 40 0" fill="#6f8a55"/>`).join("")}
<rect y="420" width="800" height="80" fill="#a9a59c"/><rect x="0" y="230" width="160" height="190" fill="#b9b8b2"/><rect x="640" y="200" width="160" height="220" fill="#c3c1ba"/>`],
  interior: ["Living room with a timber ceiling and garden window", "day", (id) => `<rect width="800" height="500" fill="#e7dfd2"/>
<rect x="0" y="0" width="800" height="70" fill="#b98b5e"/>${Array.from({ length: 16 }, (_, i) => `<path d="M${i * 52} 0v70" stroke="#a37850" stroke-width="3"/>`).join("")}
<rect x="430" y="110" width="320" height="250" fill="#9cb38a"/><path d="M430 300c80-60 200-70 320-30v90H430z" fill="#7b9468"/><path d="M590 110v250M430 230h320" stroke="#5e5242" stroke-width="6"/>
<rect y="360" width="800" height="140" fill="#cdb894"/><rect x="70" y="300" width="300" height="70" rx="10" fill="#8a7d6c"/><rect x="70" y="270" width="300" height="40" rx="10" fill="#a19483"/>
<rect x="200" y="390" width="170" height="20" rx="4" fill="#5e5242"/><circle cx="560" cy="420" r="30" fill="#e8e1d4"/><rect x="40" y="120" width="6" height="150" fill="#3f3a35"/><path d="M20 120h46l-10 26H30z" fill="#e2c07c"/>`],
  library: ["Neighbourhood library with a brick arcade", "dusk", (id) => `<rect width="800" height="500" fill="url(#ar-sky-${id})"/>
<rect x="140" y="150" width="520" height="250" fill="#b4664a"/>${Array.from({ length: 5 }, (_, i) => `<path d="M${170 + i * 100} 400v-120a40 40 0 0 1 80 0v120z" fill="#f2d79a" opacity=".9"/>`).join("")}
${Array.from({ length: 9 }, (_, i) => `<path d="M140 ${170 + i * 12}h520" stroke="#9c5640" stroke-width="1.5" opacity=".6"/>`).join("")}<rect x="130" y="140" width="540" height="14" fill="#8e4c37"/><rect y="400" width="800" height="100" fill="#c9bfae"/>`],
  studio: ["Studio with models on a long table", "day", (id) => `<rect width="800" height="640" fill="#e5e0d7"/><rect x="460" y="40" width="300" height="300" fill="#c9d6dc"/><path d="M610 40v300M460 190h300" stroke="#7b7266" stroke-width="8"/>
<rect y="420" width="800" height="220" fill="#b59b78"/><rect x="60" y="380" width="680" height="24" fill="#d9cdb8"/><rect x="90" y="404" width="10" height="150" fill="#6c5a45"/><rect x="700" y="404" width="10" height="150" fill="#6c5a45"/>
<rect x="140" y="300" width="120" height="80" fill="#f4f0e8"/><rect x="160" y="268" width="80" height="32" fill="#ebe5da"/><rect x="300" y="330" width="80" height="50" fill="#d3b68e"/><path d="M420 380l50-90 50 90z" fill="#f4f0e8"/>
${[[560, 280], [640, 300]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="24" fill="${["#c89a7a", "#6e4a34"][i]}"/><rect x="${x - 30}" y="${y + 22}" width="60" height="80" rx="20" fill="${["#3d5a73", "#7b6a4f"][i]}"/>`).join("")}
<rect x="40" y="80" width="6" height="200" fill="#3f3a35"/><rect x="70" y="120" width="140" height="100" fill="#f4f0e8"/><path d="M84 200l40-50 30 30 20-20 22 40z" fill="#c9bfae"/>`],
};
const shot = (kind, id, vb = "0 0 800 500") => { const [label, s, fn] = SCENES[kind]; return `<svg viewBox="${vb}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${esc(label)}">${sky(`${kind}${id}`, SKY[s])}${fn(`${kind}${id}`)}</svg>`; };

const PROJECTS = [
  ["01", "house", "Hillside House", "Residential", "Ridgeback Valley", "2026"],
  ["02", "gallery", "Saltworks Gallery", "Cultural", "Harbour Quarter", "2025"],
  ["03", "office", "Timber Yard Offices", "Workplace", "Canal Basin", "2025"],
  ["04", "library", "Fenwick Street Library", "Cultural", "Fenwick", "2024"],
  ["05", "interior", "Orchard Flat", "Interiors", "Old Town", "2024"],
];
const STAGES = [["1", "Feasibility", "2–4 weeks", "Site visit, brief and what the budget can realistically buy.", ["Site & planning review", "Massing options", "Cost range"]],
  ["2", "Concept", "4–6 weeks", "Two or three directions, drawn and modelled, narrowed to one.", ["Sketch models", "Concept drawings", "Initial cost plan"]],
  ["3", "Planning", "8–14 weeks", "Detailed design and the planning application, with consultants.", ["Planning drawings", "Design statement", "Neighbour liaison"]],
  ["4", "Technical", "6–10 weeks", "Construction drawings, specification and builder tender.", ["Tender package", "Builder shortlist", "Contract set-up"]],
  ["5", "Build & handover", "Project length", "Site visits through construction, then snagging and a one-year review.", ["Fortnightly site visits", "Valuations", "12-month review"]]];

const web = (p, st) => K.page(st, `${K.nav(p, ["Projects", "Practice", "Services", "Studio"], "Start a conversation")}
<main>
<section class="sk-wrap" id="top">
  <div class="ar-hero">
    <div class="sk-stack" style="gap:20px"><span class="sk-eyebrow">Architecture & interiors · since 2011</span><h1>Buildings shaped by their site, light and the people who use them</h1></div>
    <div class="sk-stack" style="gap:18px"><p class="muted" style="font-size:17px">${esc(p.name)} designs homes, cultural buildings and workplaces, from the first site visit to the last snag. Eighteen architects and interior designers in one studio.</p>
      <div class="sk-row"><a class="btn primary sk-btn-lg" href="#start-a-conversation">Discuss a project</a><a class="btn sk-btn-lg" href="#projects">View projects</a></div></div>
  </div>
  <div class="sk-photo ar-pano">${shot("house", "h")}</div>
  <div class="ar-panometa"><span><b>Hillside House</b> · a family home cut into a south-facing slope</span><span>Residential · Ridgeback Valley · Completed 2026</span></div>
</section>

<section class="sk-sec" id="projects"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">Projects</span><h2 class="sk-h2">Recent work</h2></div>
    <div class="ar-filter" role="tablist" aria-label="Filter projects">${["All", "Residential", "Cultural", "Workplace", "Interiors"].map((t, i) => `<span class="ar-chip${i ? "" : " on"}" role="tab" aria-selected="${!i}">${t}</span>`).join("")}</div></div>
  <div class="ar-proj">
    <article class="ar-feat"><div class="sk-photo">${shot("gallery", "f")}<span class="sk-cap">Courtyard entrance, Saltworks Gallery</span></div>
      <div class="ar-tagrow"><span class="badge">Cultural</span><span class="badge">1,850 m²</span><span class="badge">Retained structure</span></div>
      <h3 class="sk-h3" style="font-size:calc(26px * var(--hs))">Saltworks Gallery</h3>
      <p class="muted">A disused salt store turned into four top-lit galleries and a public courtyard. The original brick walls stay, a new sawtooth roof brings north light into every room.</p>
      <a href="#" style="font-weight:600;display:inline-flex;gap:6px;align-items:center">Read the project ${ic("arrow", 15)}</a></article>
    <div class="sk-stack" style="gap:28px;justify-items:stretch"><ol class="ar-index">${PROJECTS.map(([n, k, t, ty, loc, y], i) => `<li class="${i === 1 ? "on" : ""}"><span class="ar-no">${n}</span><div class="sk-photo">${shot(k, `i${i}`)}</div><div><h3>${esc(t)}</h3><small>${ty} · ${esc(loc)}</small></div><span class="ar-yr num">${y}</span></li>`).join("")}
      <li style="border-bottom:0"><span></span><a href="#" style="font-weight:600;display:inline-flex;gap:6px;align-items:center">All 64 projects ${ic("arrow", 15)}</a></li></ol>
      <div class="card ar-onsite"><span class="sk-eyebrow">On site now</span>${[["Quay Street Housing", "42 homes around a shared garden", "Complete spring 2027", 62], ["Marlow Primary School", "Four classrooms and a timber hall", "Complete autumn 2027", 28]].map(([t, d, w, pc]) => `<div class="ar-site"><div class="ar-siterow"><b>${t}</b><span class="muted">${w}</span></div><span class="muted" style="font-size:13px">${d}</span><div class="ar-bar" role="img" aria-label="${pc}% built"><i style="width:${pc}%"></i></div></div>`).join("")}</div></div>
  </div>
</div></section>

<section class="sk-sec sk-alt" id="practice"><div class="sk-wrap">
  <div class="ar-phil"><div class="sk-stack" style="gap:12px"><span class="sk-eyebrow">The practice</span><h2 class="sk-h2">How we think about a building</h2></div>
    <blockquote>“Start with the site. Keep what is already there if it still works. Spend the budget where people touch the building every day.”</blockquote></div>
  <div class="ar-princ">${[["Site first", "We walk the site at different times of day before drawing anything, and the plan follows the light and the slope."], ["Reuse before rebuild", "More than half our projects keep an existing structure. It is usually cheaper and always lower in embodied carbon."], ["Details people touch", "Handles, stairs, window seats. The parts you use every day get the most drawing time."]].map(([t, d]) => `<div><h3 class="sk-h3">${t}</h3><p class="muted" style="font-size:14px">${d}</p></div>`).join("")}</div>
</div></section>

<section class="sk-sec" id="services"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">Services</span><h2 class="sk-h2">From feasibility to handover</h2></div><p class="muted" style="max-width:380px">Appoint us for one stage or the whole project. Fees are quoted per stage, so you can pause after planning.</p></div>
  <div class="ar-stages">${STAGES.map(([n, t, d, x, li]) => `<div class="ar-stage"><span class="num">${n}</span><span class="ar-dur">${d}</span><h3 class="sk-h3">${t}</h3><p class="muted" style="font-size:14px">${x}</p><ul>${li.map((l) => `<li>— ${l}</li>`).join("")}</ul></div>`).join("")}</div>
</div></section>

<section class="sk-sec sk-alt" id="studio"><div class="sk-wrap ar-studio">
  <div class="sk-photo">${shot("studio", "s", "0 0 800 640")}<span class="sk-cap">Model table, Ropewalk studio</span></div>
  <div class="sk-stack" style="gap:20px"><span class="sk-eyebrow">Studio & recognition</span><h2 class="sk-h2">A working studio in an old rope factory</h2>
    <p class="muted">Founded by Marta Ibáñez and Kwame Asante in 2011. Every project is led by a director and run by the same architect from first sketch to handover.</p>
    <div class="ar-figs">${[["64", "completed buildings"], ["23", "projects published in design journals"], ["18", "architects & interior designers"], ["58%", "of projects reuse an existing structure"]].map(([v, l]) => `<div><div class="num">${v}</div><div class="muted" style="font-size:13px">${l}</div></div>`).join("")}</div>
    <a class="btn" href="#">Meet the team</a></div>
</div></section>

<section class="sk-sec" id="start-a-conversation"><div class="sk-wrap ar-enq">
  <div class="sk-stack" style="gap:20px"><span class="sk-eyebrow">Start a conversation</span><h2 class="sk-h2">Tell us about your site</h2>
    <p class="muted">An address and a rough idea is enough. We reply within three working days and the first site visit is free within 40 miles of the studio.</p>
    <div class="ar-contact">
      <div>${ic("pin", 16)}<span><b>Ropewalk Studios</b><br><span class="muted">3 Cordage Yard, Harbour Quarter</span></span></div>
      <div>${ic("mail", 16)}<span>studio@obra.example</span></div>
      <div>${ic("phone", 16)}<span>(555) 019-6630 · Mon–Fri 9–6</span></div></div>
    <div class="card ar-expect"><b style="font-size:15px">What to expect</b>${[["First site visit", "Free within 40 miles"], ["Fee proposal", "Within 10 working days"], ["Typical fees", "9–13% of build cost"]].map(([a, b]) => `<div><span class="muted">${a}</span><b>${b}</b></div>`).join("")}</div></div>
  <form class="card ar-form" aria-label="Project enquiry">
    <div class="sk-g2"><div class="sk-field"><label for="ar-name">Name</label><input class="sk-input" id="ar-name" value="Jonah Weiss"></div><div class="sk-field"><label for="ar-mail">Email</label><input class="sk-input" id="ar-mail" value="jonah.weiss@example.com"></div></div>
    <div class="sk-g2"><div class="sk-field"><label for="ar-type">Project type</label><select class="sk-input" id="ar-type"><option>House extension</option><option>New house</option></select></div><div class="sk-field"><label for="ar-site">Site location</label><input class="sk-input" id="ar-site" value="Ridgeback Valley"></div></div>
    <div class="sk-field"><label>Where are you now?</label><div class="ar-radios">${[["Just an idea", 0], ["Own the site", 1], ["Have planning", 0]].map(([t, on]) => `<span class="ar-radio${on ? " on" : ""}"><i></i>${t}</span>`).join("")}</div></div>
    <div class="sk-field"><label for="ar-bud">Construction budget</label><select class="sk-input" id="ar-bud"><option>$250k – $500k</option><option>$500k – $1m</option></select></div>
    <div class="sk-field"><label for="ar-msg">About the project</label><textarea class="sk-input" id="ar-msg">A 1930s house on a steep plot. We’d like a kitchen and living space opening onto the garden, and a studio at the bottom of the slope.</textarea></div>
    <button class="btn primary sk-btn-lg" type="button">Send enquiry</button>
  </form>
</div></section>
</main>
${K.footer(p, "Architecture and interiors from Ropewalk Studios since 2011.", [["Studio", ["3 Cordage Yard", "Harbour Quarter", "Visits by appointment"]], ["Contact", ["studio@obra.example", "(555) 019-6630", "Careers"]], ["Practice", ["Projects", "Journal", "Newsletter"]]])}`, CSS);

module.exports = {
  "architecture-website": K.def("architecture", "Architecture website",
    "a full architecture practice home page: navigation with a start-a-conversation button, an editorial hero with a panoramic building image and project caption, a filterable projects section with a featured project and a numbered project index (residential, cultural, workplace, interiors), the practice philosophy with a pull quote and three principles, five service stages from feasibility to build and handover, the studio with recognition figures, a project enquiry form with project type, site, stage and budget, and a footer",
    ["navigation-header", "hero", "portfolio", "filter-chips", "project-list", "featured-project", "philosophy", "pull-quote", "services", "process-steps", "stats", "studio", "contact-form", "enquiry-form", "radio-group", "footer", "architecture"], web),
};
