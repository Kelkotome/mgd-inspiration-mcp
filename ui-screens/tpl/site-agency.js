/* Agency website template (Quarry & Kite — fictional independent brand and digital design studio). Full responsive home page:
   nav, typographic hero with availability card and client list, filterable selected-work mosaic, services, process timeline,
   results figures + client notes (inverted band), studio/team, project enquiry form with budget and timeline chips, footer.
   One HTML document rendered at 1440 (web) and 390 (mobile). Project "photos" are inline SVG mock-ups in fixed natural tones. */
const { ic, esc } = require("../lib");
const K = require("../sitekit");

const CSS = `<style>
.ag-hero{padding-top:64px;padding-bottom:56px;display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:56px;align-items:end}
.ag-hero h1{font-size:calc(76px * var(--hs));line-height:.98;max-width:860px}
.ag-hero h1 em{font-style:normal;color:color-mix(in oklab,var(--primary) 82%,var(--text))}
.ag-disc{display:flex;flex-wrap:wrap;gap:8px}
.ag-avail{padding:24px;display:grid;gap:14px}
.ag-dot{width:9px;height:9px;border-radius:50%;background:var(--success);display:inline-block;margin-right:8px}
.ag-clients{border-block:1px solid var(--border)}
.ag-clients>.sk-wrap{display:flex;align-items:center;gap:40px;height:84px;overflow:hidden}
.ag-clients ul{list-style:none;display:flex;gap:40px;flex-wrap:nowrap;white-space:nowrap;font:600 17px var(--font-h);color:var(--muted)}
.ag-filter{display:flex;gap:8px;flex-wrap:wrap}
.ag-chip{height:36px;padding:0 14px;border-radius:999px;border:1px solid var(--border);display:inline-flex;align-items:center;font-weight:600;font-size:13px;background:var(--bg)}
.ag-chip.on{background:var(--text);color:var(--bg);border-color:var(--text)}
.ag-work{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:28px 24px}
.ag-tile{display:grid;gap:12px;align-content:start}
.ag-tile.w4{grid-column:span 4}.ag-tile.w2{grid-column:span 2}.ag-tile.w3{grid-column:span 3}
.ag-tile .sk-photo{aspect-ratio:16/9;border-radius:var(--radius)}
.ag-tile.w4 .sk-photo{aspect-ratio:2/1}
.ag-tile.w2b .sk-photo{height:auto;min-height:0;aspect-ratio:16/10}
.ag-tile.w2{grid-template-rows:minmax(0,1fr) auto}
.ag-tile.w2 .sk-photo{aspect-ratio:auto;height:auto;min-height:200px}
.ag-tile.w2b{grid-template-rows:auto auto}
.ag-meta{display:flex;justify-content:space-between;gap:16px;align-items:baseline}
.ag-meta h3{font-size:calc(19px * var(--hs))}
.ag-meta span{font-size:13px;color:var(--muted);white-space:nowrap}
.ag-svc{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));border-top:2px solid var(--text)}
.ag-svc>div{padding:28px 28px 8px 0;display:grid;gap:12px;align-content:start}
.ag-svc>div+div{padding-left:28px;border-left:1px solid var(--border)}
.ag-svc ul{list-style:none;display:grid;gap:8px;color:var(--muted);font-size:14px}
.ag-svc li{display:flex;gap:8px;align-items:center}
.ag-n{font:600 13px var(--font-b);color:var(--muted);letter-spacing:.06em}
.ag-steps{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:24px;position:relative}
.ag-step{display:grid;gap:10px;align-content:start;padding-top:28px;border-top:3px solid var(--border);position:relative}
.ag-step::before{content:"";position:absolute;top:-9px;left:0;width:15px;height:15px;border-radius:50%;background:var(--primary);border:3px solid var(--bg)}
.ag-step .num{font-size:13px;color:var(--muted)}
.ag-band{background:var(--text);color:var(--bg)}
.ag-band .ag-soft{color:color-mix(in oklab,var(--bg) 72%,var(--text))}
.ag-figs{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:24px;padding-bottom:40px;margin-bottom:40px;border-bottom:1px solid color-mix(in oklab,var(--bg) 25%,var(--text))}
.ag-figs .num{font-size:52px;line-height:1}
.ag-quotes{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:48px}
.ag-quotes q{font-family:var(--font-h);font-size:calc(22px * var(--hs));line-height:1.4;quotes:"\\201C" "\\201D"}
.ag-quotes figure{display:grid;gap:16px}
.ag-team{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:20px}
.ag-person{display:grid;gap:10px}
.ag-person .sk-photo{aspect-ratio:1/1;border-radius:var(--radius)}
.ag-person b{display:block}
.ag-studio{display:grid;grid-template-columns:minmax(0,.8fr) minmax(0,1.6fr);gap:56px;align-items:start}
.ag-enq{display:grid;grid-template-columns:minmax(0,.85fr) minmax(0,1.15fr);gap:56px;align-items:start}
.ag-next{list-style:none;display:grid;gap:18px;counter-reset:ag}
.ag-next li{display:grid;grid-template-columns:36px minmax(0,1fr);gap:14px;counter-increment:ag}
.ag-next li::before{content:counter(ag);width:36px;height:36px;border-radius:50%;border:1px solid var(--border);display:grid;place-items:center;font-weight:600;font-size:14px}
.ag-form{padding:36px;display:grid;gap:18px}
.ag-form .sk-g2{gap:14px}
.ag-chips{display:flex;flex-wrap:wrap;gap:8px}
.ag-pick{height:38px;padding:0 14px;border-radius:var(--radius);border:1px solid var(--border);display:inline-flex;align-items:center;font-weight:600;font-size:14px;background:var(--bg)}
.ag-pick.on{background:var(--primary);border-color:var(--primary);color:var(--on-primary)}
@media (max-width:1024px){
  .ag-hero{grid-template-columns:minmax(0,1fr) 280px;gap:32px}
  .ag-hero h1{font-size:calc(60px * var(--hs))}
  .ag-team{grid-template-columns:repeat(2,minmax(0,1fr))}
}
@media (max-width:760px){
  .ag-hero{grid-template-columns:minmax(0,1fr);gap:24px;padding-top:36px;padding-bottom:44px}
  .ag-hero h1{font-size:calc(42px * var(--hs))}
  .ag-clients>.sk-wrap{height:64px;gap:20px}
  .ag-clients ul{gap:24px;font-size:15px}
  .ag-clients .ag-lbl{display:none}
  .ag-work{display:flex;align-items:flex-start;overflow-x:auto;scroll-snap-type:x mandatory;scroll-padding-inline:20px;gap:14px;margin:0 -20px;padding:0 20px 6px;scrollbar-width:none}
  .ag-tile{flex:0 0 82%;scroll-snap-align:start}
  .ag-tile.w2 .sk-photo{height:auto;min-height:0;aspect-ratio:16/10}
  .ag-tile.w2{grid-template-rows:auto auto}
  .ag-meta{flex-direction:column;gap:2px}
  .ag-svc{grid-template-columns:minmax(0,1fr)}
  .ag-svc>div,.ag-svc>div+div{padding:20px 0;border-left:0;border-bottom:1px solid var(--border)}
  .ag-steps{grid-template-columns:minmax(0,1fr);gap:0;border-left:3px solid var(--border);margin-left:6px}
  .ag-step{border-top:0;padding:0 0 22px 22px}
  .ag-step::before{top:2px;left:-9px}
  .ag-figs{grid-template-columns:repeat(2,minmax(0,1fr));gap:24px 16px;padding-bottom:32px;margin-bottom:32px}
  .ag-figs .num{font-size:38px}
  .ag-quotes{grid-template-columns:minmax(0,1fr);gap:28px}
  .ag-quotes q{font-size:calc(19px * var(--hs))}
  .ag-studio,.ag-enq{grid-template-columns:minmax(0,1fr);gap:28px}
  .ag-team{grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
  .ag-form{padding:22px}
  .ag-hide-m{display:none}
}
</style>`;

// ---- illustrative project mock-ups (fixed tones) ------------------------------------------------------------------
const art = (kind, id) => {
  const g = `ag-g-${id}`;
  const scenes = {
    identity: [`Stationery and cards for a bakery identity`, `<rect width="400" height="250" fill="url(#${g})"/><defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e9d8bf"/><stop offset="1" stop-color="#d5bc98"/></linearGradient></defs>
<rect x="64" y="52" width="170" height="220" rx="3" fill="#fbf7f0" transform="rotate(-8 150 160)"/><rect x="200" y="70" width="140" height="84" rx="4" fill="#2f4a3a" transform="rotate(6 270 112)"/><rect x="214" y="150" width="140" height="84" rx="4" fill="#f6efe2" transform="rotate(-4 284 192)"/>
<circle cx="268" cy="112" r="18" fill="#e9c07a" transform="rotate(6 270 112)"/><text x="98" y="110" font-family="Georgia,serif" font-size="26" fill="#2f4a3a" transform="rotate(-8 150 160)">Crumb</text><path d="M98 126h90M98 140h70M98 154h80" stroke="#c9b79c" stroke-width="5" transform="rotate(-8 150 160)"/>`],
    app: [`Banking app screens on two phones`, `<defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b8c9d9"/><stop offset="1" stop-color="#8ea6bd"/></linearGradient></defs><rect width="400" height="250" fill="url(#${g})"/>
${[[118, 30, -6], [222, 46, 5]].map(([x, y, r], i) => `<g transform="rotate(${r} ${x + 46} ${y + 100})"><rect x="${x}" y="${y}" width="92" height="196" rx="16" fill="#1d2430"/><rect x="${x + 6}" y="${y + 8}" width="80" height="180" rx="11" fill="${i ? "#f3f1ec" : "#fefcf8"}"/><rect x="${x + 14}" y="${y + 24}" width="64" height="40" rx="7" fill="${i ? "#e2735a" : "#2d5b8a"}"/>${[78, 96, 114, 132].map((d) => `<rect x="${x + 14}" y="${y + d}" width="${40 + (d % 3) * 8}" height="8" rx="4" fill="#cfd4db"/>`).join("")}<rect x="${x + 14}" y="${y + 158}" width="64" height="18" rx="9" fill="${i ? "#2d5b8a" : "#e2735a"}"/></g>`).join("")}`],
    packaging: [`Cans and a carton for a soft drinks range`, `<rect width="400" height="250" fill="#e6b9a0"/><rect y="196" width="400" height="54" fill="#d19d82"/>
${[["#e94f37", 70], ["#f2c14e", 150], ["#3f8f6b", 230]].map(([c, x]) => `<rect x="${x}" y="80" width="62" height="120" rx="10" fill="${c}"/><rect x="${x}" y="80" width="62" height="10" rx="5" fill="#c8c8c8"/><circle cx="${x + 31}" cy="140" r="17" fill="#fdf6ea"/><rect x="${x + 12}" y="170" width="38" height="6" rx="3" fill="#fdf6ea" opacity=".8"/>`).join("")}
<rect x="306" y="96" width="70" height="104" fill="#fdf6ea"/><path d="M306 96l14-18h42l14 18z" fill="#efe3cf"/><circle cx="341" cy="146" r="16" fill="#e94f37"/>`],
    poster: [`Festival posters on a wall`, `<rect width="400" height="250" fill="#3a3a3a"/>${[[40, "#f2c14e", "#1f1f1f"], [150, "#e94f37", "#fdf6ea"], [260, "#7fb7be", "#1f1f1f"]].map(([x, b, f], i) => `<rect x="${x}" y="30" width="100" height="150" fill="${b}"/><circle cx="${x + 50 + (i - 1) * 14}" cy="${80 + i * 8}" r="${26 + i * 4}" fill="${f}" opacity=".9"/><rect x="${x + 12}" y="140" width="62" height="10" fill="${f}"/><rect x="${x + 12}" y="156" width="40" height="6" fill="${f}" opacity=".7"/>`).join("")}<rect y="200" width="400" height="50" fill="#2a2a2a"/>`],
    signage: [`Wayfinding signs in a library atrium`, `<rect width="400" height="250" fill="#d9d4cb"/><rect y="180" width="400" height="70" fill="#b9b0a2"/><rect x="0" y="0" width="400" height="34" fill="#c7c0b4"/>
<rect x="150" y="34" width="6" height="52" fill="#5b5b5b"/><rect x="244" y="34" width="6" height="52" fill="#5b5b5b"/><rect x="110" y="84" width="180" height="70" rx="4" fill="#1f3d5c"/><text x="128" y="114" font-family="sans-serif" font-weight="700" font-size="20" fill="#fdf6ea">Reading rooms</text><path d="M128 132h30l-8-7M158 132l-8 7" stroke="#f2c14e" stroke-width="4" fill="none"/><text x="172" y="138" font-family="sans-serif" font-size="13" fill="#c9d6e3">Level 2 · 4</text>
<rect x="30" y="120" width="34" height="60" fill="#8a7a66"/><rect x="336" y="110" width="40" height="70" fill="#8a7a66"/>`],
    web: [`Responsive website for a ceramics studio`, `<rect width="400" height="250" fill="#cfd8c4"/><rect x="40" y="28" width="320" height="200" rx="8" fill="#fbf8f2"/><rect x="40" y="28" width="320" height="22" rx="8" fill="#e8e2d6"/>${[54, 66, 78].map((x) => `<circle cx="${x}" cy="39" r="4" fill="#c7bfb0"/>`).join("")}
<rect x="58" y="66" width="130" height="14" rx="3" fill="#3a3a2e"/><rect x="58" y="88" width="100" height="8" rx="4" fill="#b8b0a2"/><rect x="58" y="104" width="60" height="18" rx="9" fill="#9a5b3c"/><rect x="210" y="62" width="132" height="92" rx="6" fill="#e4c9ad"/><ellipse cx="276" cy="124" rx="28" ry="24" fill="#9a5b3c"/><rect x="262" y="88" width="28" height="16" rx="3" fill="#9a5b3c"/>
${[58, 160, 262].map((x) => `<rect x="${x}" y="168" width="82" height="46" rx="5" fill="#ece5d8"/>`).join("")}`],
  };
  const [label, body] = scenes[kind];
  return `<svg viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${esc(label)}">${body}</svg>`;
};
const SKIN = ["#c89a7a", "#8d5b3e", "#e3bd9c", "#5e3b2a"], HAIR = ["#2b1d16", "#1a1a1a", "#7a4a2a", "#3b2a20"], BACK = ["#d9cfc2", "#c4d0c8", "#d6c7d0", "#cbd3dc"];
const face = (i, name) => `<svg viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Portrait of ${esc(name)}"><rect width="200" height="200" fill="${BACK[i]}"/>
<path d="M30 200c6-46 34-66 70-66s64 20 70 66z" fill="${["#3f4b5a", "#a2553a", "#2f4a3a", "#d6a64a"][i]}"/><rect x="88" y="112" width="24" height="28" fill="${SKIN[i]}"/><ellipse cx="100" cy="86" rx="34" ry="40" fill="${SKIN[i]}"/>
<path d="M64 ${i % 2 ? 84 : 78}c0-30 18-46 36-46s38 14 38 ${i % 2 ? 40 : 34}c-14-12-34-16-56-14-8 4-14 12-18 ${i % 2 ? 26 : 18}z" fill="${HAIR[i]}"/>${i === 2 ? `<path d="M62 80c-6 40 0 64 10 76l8-60z" fill="${HAIR[i]}"/><path d="M138 80c6 40 0 64-10 76l-8-60z" fill="${HAIR[i]}"/>` : ""}</svg>`;

const WORK = [
  ["w4", "identity", "Crumb & Co. bakeries", "Identity, packaging", "2026"],
  ["w2", "app", "Ledgerly", "Mobile app, design system", "2026"],
  ["w2 w2b", "packaging", "Fizz Parade soft drinks", "Packaging", "2025"],
  ["w2 w2b", "signage", "Eastbrook Library", "Wayfinding", "2025"],
  ["w2 w2b", "poster", "Northside Sound", "Campaign, motion", "2024"],
];
const SERVICES = [
  ["01", "Brand identity", "Names, logos, type and colour that hold up on a sign, a screen and a 16 px favicon.", ["Strategy & naming", "Logo and type system", "Brand guidelines"]],
  ["02", "Digital product", "Websites and apps designed and built with your team, from first flow to launch.", ["UX research & flows", "UI and design systems", "Front-end build"]],
  ["03", "Campaign & content", "Launches, packaging and motion that carry the identity into the world.", ["Packaging", "Campaign art direction", "Motion & social"]],
];
const STEPS = [["Weeks 1–2", "Discover", "Workshops with your team, customer interviews and an audit of what you already have."], ["Weeks 3–5", "Define", "One clear direction, tested in rough form before anything gets polished."], ["Weeks 6–10", "Design", "The identity or product designed in full, reviewed with you every Thursday."], ["Weeks 11–12", "Deliver", "Files, guidelines and code handed over, plus a 30-day check-in after launch."]];
const TEAM = [["Ama Lindqvist", "Creative director"], ["Rafael Moreno", "Design lead, digital"], ["Saoirse Kaur", "Brand designer"], ["Tomás Weber", "Front-end developer"]];

const web = (p, st) => K.page(st, `${K.nav(p, ["Work", "Services", "Process", "Studio"], "Start a project")}
<main>
<section class="sk-wrap ag-hero" id="top">
  <div class="sk-stack" style="gap:24px">
    <span class="sk-eyebrow">Independent brand & digital studio · 14 people</span>
    <h1>We design brands people <em>remember</em> and products they keep using</h1>
    <p class="sk-lede">${esc(p.name)} works with founders, cultural institutions and growing companies on identity, websites and apps. Small senior team, one project lead from first call to launch.</p>
    <div class="sk-row"><a class="btn primary sk-btn-lg" href="#start-a-project">Start a project ${ic("arrow", 16)}</a><a class="btn sk-btn-lg" href="#work">See selected work</a></div>
  </div>
  <aside class="card ag-avail" aria-label="Studio availability">
    <span style="font-weight:600;font-size:14px"><span class="ag-dot"></span>Booking projects from January 2027</span>
    <p class="muted" style="font-size:14px">Two slots left for Q1. Most projects run 10–14 weeks.</p>
    <div class="ag-disc">${["Identity", "Websites", "Apps", "Packaging", "Motion"].map((d) => `<span class="badge">${d}</span>`).join("")}</div>
    <a href="#start-a-project" style="font-weight:600;font-size:14px;display:inline-flex;gap:6px;align-items:center">Check a start date ${ic("arrow", 14)}</a>
  </aside>
</section>
<div class="ag-clients" aria-label="Recent clients"><div class="sk-wrap"><span class="muted ag-lbl" style="font-size:13px;white-space:nowrap">Recent clients</span>
  <ul>${["Crumb & Co.", "Ledgerly", "Eastbrook Library", "Kilnhouse", "Fizz Parade", "Northside Sound", "Halden Trust"].map((c) => `<li>${esc(c)}</li>`).join("")}</ul></div></div>

<section class="sk-sec" id="work"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">Selected work</span><h2 class="sk-h2">Recent projects, start to finish</h2></div>
    <div class="ag-filter ag-hide-m" role="tablist" aria-label="Filter work">${["All", "Identity", "Digital", "Packaging", "Campaign"].map((t, i) => `<span class="ag-chip${i ? "" : " on"}" role="tab" aria-selected="${!i}">${t}</span>`).join("")}</div></div>
  <div class="ag-work">${WORK.map(([w, k, c, d, y], i) => `<a class="ag-tile ${w}" href="#"><div class="sk-photo">${art(k, i)}</div><div class="ag-meta"><h3>${esc(c)}</h3><span>${esc(d)} · ${y}</span></div></a>`).join("")}</div>
  <div class="sk-row" style="margin-top:36px"><a class="btn sk-btn-lg" href="#">All 42 case studies ${ic("arrow", 16)}</a></div>
</div></section>

<section class="sk-sec sk-alt" id="services"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">Services</span><h2 class="sk-h2">Three things, done properly</h2></div><p class="muted" style="max-width:380px">Most clients start with one and come back for another. Fixed-fee proposals after a free 45-minute call.</p></div>
  <div class="ag-svc">${SERVICES.map(([n, t, d, li]) => `<div><span class="ag-n">${n}</span><h3 class="sk-h3" style="font-size:calc(24px * var(--hs))">${t}</h3><p class="muted">${d}</p><ul>${li.map((x) => `<li>${ic("check", 15)}${x}</li>`).join("")}</ul></div>`).join("")}</div>
</div></section>

<section class="sk-sec sk-tight" id="process"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">How a project runs</span><h2 class="sk-h2">Twelve weeks, four stages, no surprises</h2></div></div>
  <div class="ag-steps">${STEPS.map(([w, t, d]) => `<div class="ag-step"><span class="num">${w}</span><h3 class="sk-h3">${t}</h3><p class="muted" style="font-size:14px">${d}</p></div>`).join("")}</div>
</div></section>

<section class="sk-sec ag-band feat" aria-labelledby="ag-res"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow ag-soft">Results</span><h2 class="sk-h2" id="ag-res">What changed after launch</h2></div></div>
  <div class="ag-figs">${[["+38%", "online orders in the first quarter after the Crumb & Co. rebrand"], ["4.7", "average app store rating for Ledgerly, up from 3.9"], ["2.1×", "festival pre-sales for Northside Sound year on year"], ["7 of 10", "clients come back for a second project"]].map(([v, l]) => `<div><div class="num">${v}</div><p class="ag-soft" style="font-size:14px;margin-top:10px">${l}</p></div>`).join("")}</div>
  <div class="ag-quotes">${[["They asked better questions about our customers than we did. The new identity finally looks like the bakeries feel.", "Ines R.", "Co-founder, Crumb & Co."], ["Rafael’s team sat in our stand-ups for three months. The design system is still the thing new engineers thank us for.", "Dev P.", "Head of product, Ledgerly"]].map(([q, n, r]) => `<figure><q>${esc(q)}</q><figcaption><b>${esc(n)}</b> <span class="ag-soft" style="font-size:14px">· ${esc(r)}</span></figcaption></figure>`).join("")}</div>
</div></section>

<section class="sk-sec sk-tight" id="studio"><div class="sk-wrap ag-studio">
  <div class="sk-stack" style="gap:18px"><span class="sk-eyebrow">The studio</span><h2 class="sk-h2">Fourteen people in a converted print works</h2>
    <p class="muted">Designers, writers and developers in one room on Tanner Street. Every project has a senior lead and the same faces in every meeting.</p>
    <div class="sk-row" style="gap:28px">${[["14", "people"], ["9", "years open"], ["3", "languages"]].map(([v, l]) => `<div><div class="num" style="font-size:28px">${v}</div><div class="muted" style="font-size:13px">${l}</div></div>`).join("")}</div>
    <a class="btn" href="#">We’re hiring a motion designer</a></div>
  <div class="ag-team">${TEAM.map(([n, r], i) => `<div class="ag-person"><div class="sk-photo">${face(i, n)}</div><div><b>${esc(n)}</b><span class="muted" style="font-size:13px">${esc(r)}</span></div></div>`).join("")}</div>
</div></section>

<section class="sk-sec sk-alt" id="start-a-project"><div class="sk-wrap ag-enq">
  <div class="sk-stack" style="gap:20px"><span class="sk-eyebrow">Start a project</span><h2 class="sk-h2">Tell us what you’re making</h2>
    <p class="muted">A short brief is plenty. Ama or Rafael replies within two working days.</p>
    <ol class="ag-next">${[["A 45-minute call", "We talk through goals, audience and timing. No pitch deck."], ["A written proposal", "Scope, team, weekly plan and a fixed fee within a week."], ["Kick-off", "A half-day workshop at the studio or on a video call."]].map(([t, d]) => `<li><div><b>${t}</b><p class="muted" style="font-size:14px">${d}</p></div></li>`).join("")}</ol>
    <p class="muted" style="font-size:14px">Prefer email? <b style="color:var(--text)">hello@qandk.example</b></p></div>
  <form class="card ag-form" aria-label="Project enquiry">
    <div class="sk-g2"><div class="sk-field"><label for="ag-name">Your name</label><input class="sk-input" id="ag-name" value="Priya Nair"></div><div class="sk-field"><label for="ag-mail">Email</label><input class="sk-input" id="ag-mail" value="priya@harbourfield.example"></div></div>
    <div class="sk-g2"><div class="sk-field"><label for="ag-co">Company or organisation</label><input class="sk-input" id="ag-co" value="Harbourfield Rowing Club"></div><div class="sk-field"><label for="ag-when">Ideal launch</label><select class="sk-input" id="ag-when"><option>Spring 2027</option><option>Summer 2027</option></select></div></div>
    <div class="sk-field"><label>What do you need?</label><div class="ag-chips">${[["Brand identity", 1], ["Website", 1], ["App", 0], ["Packaging", 0], ["Not sure yet", 0]].map(([t, on]) => `<span class="ag-pick${on ? " on" : ""}">${t}</span>`).join("")}</div></div>
    <div class="sk-field"><label>Budget range</label><div class="ag-chips">${[["Under $25k", 0], ["$25–50k", 1], ["$50–100k", 0], ["$100k+", 0]].map(([t, on]) => `<span class="ag-pick${on ? " on" : ""}">${t}</span>`).join("")}</div></div>
    <div class="sk-field"><label for="ag-brief">Brief</label><textarea class="sk-input" id="ag-brief">We’re a 120-year-old club opening to new members. We need a refreshed crest, a website with membership sign-up and kit for race days.</textarea></div>
    <button class="btn primary sk-btn-lg" type="button">Send enquiry</button>
  </form>
</div></section>
</main>
${K.footer(p, "Independent brand and digital design studio on Tanner Street since 2017.", [["Studio", ["Unit 4, 22 Tanner Street", "Mon–Fri 9:30–6", "Visits by appointment"]], ["Contact", ["hello@qandk.example", "(555) 017-4410", "New business enquiries"]], ["Elsewhere", ["Journal", "Careers", "Newsletter"]]])}`, CSS);

module.exports = {
  "agency-website": K.def("agency", "Agency website",
    "a full design agency home page: navigation with a start-a-project button, a typographic hero with an availability card and discipline tags, a recent-clients strip, a filterable selected-work mosaic with client, discipline and year, three numbered services with deliverables, a four-stage process timeline, an inverted results band with figures and client notes, the studio and team portraits, a project enquiry form with service, budget range and launch-date choices, and a footer",
    ["navigation-header", "hero", "client-list", "portfolio-grid", "filter-chips", "case-studies", "services", "process-timeline", "stats", "testimonials", "team", "contact-form", "enquiry-form", "budget-chips", "footer", "agency"], web),
};
