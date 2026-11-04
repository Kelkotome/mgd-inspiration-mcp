/* Real estate website template (Harrow & Vale — fictional residential agency for buyers, sellers and renters). Full responsive
   home page: nav, hero with a buy/rent property search over a street photo, featured listings, neighbourhood guides (mosaic),
   market figures with a price chart, sell-with-us valuation form, agents, client notes, footer.
   Property "photos" are inline SVG in fixed natural tones. */
const { ic, esc } = require("../lib");
const K = require("../sitekit");

const CSS = `<style>
.hv-hero{padding-top:56px;padding-bottom:16px}
.hv-top{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);gap:56px;align-items:end;margin-bottom:36px}
.hv-proof{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px;padding-left:28px;border-left:1px solid var(--border)}
.hv-proof .num{font-size:28px;line-height:1.1}
.hv-proof span{display:block;color:var(--muted);font-size:13px}
.hv-shot{aspect-ratio:1200/400;border-radius:var(--radius-lg)}
.hv-search{position:relative;z-index:2;margin:-96px auto 0;width:calc(100% - 96px);max-width:1040px;padding:0;overflow:hidden;box-shadow:var(--shadow-lg)}
.hv-modes{display:flex;border-bottom:1px solid var(--border)}
.hv-mode{padding:14px 22px;font-weight:600;font-size:14px;color:var(--muted);border-bottom:2px solid transparent;margin-bottom:-1px}
.hv-mode.on{color:var(--text);border-bottom-color:var(--primary)}
.hv-fields{display:grid;grid-template-columns:minmax(0,1.6fr) repeat(3,minmax(0,1fr)) auto;gap:14px;align-items:end;padding:20px}
.hv-fields .sk-input{display:flex;align-items:center;gap:8px}
.hv-quick{display:flex;flex-wrap:wrap;gap:8px 18px;padding:0 20px 18px;font-size:13px;color:var(--muted)}
.hv-quick a{text-decoration:underline;text-underline-offset:3px}
.hv-chips{display:flex;flex-wrap:wrap;gap:8px}
.hv-chip{height:36px;padding:0 14px;border:1px solid var(--border);border-radius:999px;display:inline-flex;align-items:center;font-size:14px;font-weight:600;background:var(--bg)}
.hv-chip.on{background:var(--primary);color:var(--on-primary);border-color:var(--primary)}
.hv-list{padding:0;overflow:hidden;display:grid}
.hv-list .sk-photo{aspect-ratio:3/2;border-radius:0}
.hv-badges{position:absolute;left:12px;top:12px;display:flex;gap:6px;flex-wrap:wrap}
.hv-badges span{font:600 12px var(--font-b);padding:4px 9px;border-radius:var(--radius-sm);background:color-mix(in oklab,var(--bg) 90%,transparent);color:var(--text)}
.hv-badges span.hot{background:var(--primary);color:var(--on-primary)}
.hv-save{position:absolute;right:12px;top:12px;width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:color-mix(in oklab,var(--bg) 90%,transparent);color:var(--text)}
.hv-body{padding:18px 20px 20px;display:grid;gap:6px}
.hv-price{font-size:21px}
.hv-specs{display:flex;flex-wrap:wrap;gap:6px 16px;font-size:13px;color:var(--muted);padding-top:10px;margin-top:6px;border-top:1px solid var(--border)}
.hv-specs b{color:var(--text)}
.hv-hoods{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(0,1fr) minmax(0,1fr);grid-template-rows:auto auto;gap:20px}
.hv-hood{position:relative;padding:0;overflow:hidden;display:grid;grid-template-rows:minmax(0,1fr) auto}
.hv-hood .sk-photo{border-radius:0;aspect-ratio:21/9}
.hv-hood.big{grid-row:span 2}
.hv-hood.big .sk-photo{aspect-ratio:auto;min-height:220px}
.hv-hood>div:last-child{padding:16px 18px 18px;display:grid;gap:4px}
.hv-hood dl{display:flex;flex-wrap:wrap;gap:4px 16px;font-size:13px;color:var(--muted)}
.hv-hood dd{color:var(--text);font-weight:600;display:inline;margin-left:4px}
.hv-hood dt{display:inline}
.hv-market{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.15fr);gap:56px;align-items:center}
.hv-stats{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0;border-top:1px solid var(--border)}
.hv-stats>div{padding:20px 0;border-bottom:1px solid var(--border)}
.hv-stats>div:nth-child(odd){padding-right:20px;border-right:1px solid var(--border)}
.hv-stats>div:nth-child(even){padding-left:20px}
.hv-stats .num{font-size:32px;line-height:1.15}
.hv-stats small{display:block;font-size:13px;color:var(--muted)}
.hv-delta{font-size:13px;font-weight:600;color:color-mix(in oklab,var(--success) 70%,var(--text))}
.hv-chart{padding:24px}
.hv-chart svg{display:block;width:100%;height:auto}
.hv-sell{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:0;overflow:hidden;padding:0}
.hv-sell-l{padding:48px;display:grid;gap:18px;align-content:start;background:color-mix(in oklab,var(--primary) 10%,var(--surface));border-right:1px solid var(--border)}
.hv-steps{list-style:none;display:grid;gap:14px;counter-reset:s}
.hv-steps li{display:grid;grid-template-columns:34px minmax(0,1fr);gap:12px;align-items:start;counter-increment:s}
.hv-steps li::before{content:counter(s);width:34px;height:34px;border-radius:50%;display:grid;place-items:center;font-weight:700;font-size:14px;background:var(--bg);border:1px solid var(--border)}
.hv-steps b{display:block}
.hv-steps span{color:var(--muted);font-size:14px}
.hv-form{padding:44px;display:grid;gap:14px}
.hv-form .sk-g2{gap:14px}
.hv-agent{padding:0;overflow:hidden;text-align:left}
.hv-agent .sk-photo{aspect-ratio:4/3;border-radius:0}
.hv-agent>div:last-child{padding:16px 18px 18px;display:grid;gap:4px;font-size:14px}
.hv-agent .muted{font-size:13px}
.hv-agent .sk-row{gap:8px;margin-top:8px}
.hv-agent .btn{height:34px;font-size:13px;padding:0 12px}
.hv-note{padding:26px;display:grid;gap:14px;align-content:space-between}
.hv-note q{font-family:var(--font-h);font-size:calc(18px * var(--hs));line-height:1.45;quotes:"\\201C" "\\201D"}
.hv-note .stars{display:flex;gap:2px;color:var(--primary)}
@media (max-width:1024px){
  .hv-fields{grid-template-columns:repeat(2,minmax(0,1fr))}
  .hv-fields .btn{grid-column:1/-1}
  .hv-hoods{grid-template-columns:repeat(2,minmax(0,1fr))}
  .hv-hood.big{grid-row:auto;grid-column:1/-1}
}
@media (max-width:760px){
  .hv-hero{padding-top:28px;padding-bottom:12px}
  .hv-top{grid-template-columns:minmax(0,1fr);gap:22px;margin-bottom:22px}
  .hv-proof{padding-left:0;border-left:0;padding-top:16px;border-top:1px solid var(--border);gap:10px}
  .hv-proof .num{font-size:22px}
  .hv-shot{aspect-ratio:4/3}
  .hv-search{margin:-48px 10px 0;width:auto}
  .hv-mode{padding:12px 14px}
  .hv-fields{padding:16px;gap:12px}
  .hv-fields>div:first-child{grid-column:1/-1}
  .hv-quick{display:none}
  .hv-hoods{display:flex!important}
  .hv-hood.big .sk-photo{min-height:0;aspect-ratio:16/9}
  .hv-market{grid-template-columns:minmax(0,1fr);gap:24px}
  .hv-stats .num{font-size:24px}
  .hv-chart{padding:16px}
  .hv-sell{grid-template-columns:minmax(0,1fr)}
  .hv-sell-l{padding:24px;border-right:0;border-bottom:1px solid var(--border)}
  .hv-form{padding:24px}
  .hv-hide-m{display:none}
  .sk-rail{scroll-padding-inline:20px}
}
</style>`;

// ---- illustrative property & street "photos" (fixed natural tones) ------------------------------------------------
const SKY = [["#bcd7e6", "#eef3ea"], ["#f2c9a0", "#f6e7d2"], ["#a9c6d9", "#e3ecef"], ["#d8c8e0", "#f2ece6"]];
const tree = (x, y, s = 1, c = "#6f8f58") => `<rect x="${x - 3 * s}" y="${y}" width="${6 * s}" height="${34 * s}" fill="#5b4330"/><circle cx="${x}" cy="${y - 4 * s}" r="${24 * s}" fill="${c}"/><circle cx="${x + 12 * s}" cy="${y - 16 * s}" r="${16 * s}" fill="#86a56a"/>`;
const win = (x, y, w = 26, h = 30) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#f3e6c4"/><path d="M${x + w / 2} ${y}v${h}M${x} ${y + h / 2}h${w}" stroke="#ffffff" stroke-width="2"/>`;
const house = (kind, id, label) => {
  const [s1, s2] = SKY[id % SKY.length], g = `hv-sky-${id}`;
  const scene = {
    detached: `<rect x="110" y="120" width="180" height="110" fill="#e6d8c3"/><path d="M96 124L200 54l104 70z" fill="#6b4a3a"/><rect x="236" y="62" width="20" height="40" fill="#7d5b48"/>${win(130, 142)}${win(244, 142)}${win(130, 186)}${win(244, 186)}<rect x="186" y="170" width="30" height="60" fill="#3d5a6b"/><circle cx="210" cy="202" r="2.5" fill="#e3c27a"/>${tree(56, 178, 1.1)}${tree(346, 184, .9, "#5f7f4c")}`,
    townhouse: `${[0, 1, 2].map((i) => `<rect x="${60 + i * 96}" y="${92 - (i % 2) * 8}" width="96" height="${138 + (i % 2) * 8}" fill="${["#c98f6e", "#e3d6bf", "#a8b6a0"][i]}"/><path d="M${60 + i * 96} ${92 - (i % 2) * 8}h96" stroke="#4a3a30" stroke-width="6"/>${win(74 + i * 96, 110 - (i % 2) * 8, 24, 30)}${win(118 + i * 96, 110 - (i % 2) * 8, 24, 30)}${win(74 + i * 96, 156, 24, 30)}<rect x="${120 + i * 96}" y="186" width="24" height="44" fill="${["#2f4b5a", "#6b3a3a", "#3a4a32"][i]}"/>`).join("")}${tree(370, 190, .8)}`,
    apartment: `<rect x="118" y="40" width="164" height="190" fill="#d9d4c9"/>${[0, 1, 2, 3, 4].map((r) => [0, 1, 2, 3].map((c) => `<rect x="${130 + c * 38}" y="${52 + r * 34}" width="26" height="22" fill="${(r + c) % 3 ? "#bfd0d8" : "#f3e6c4"}"/>`).join("")).join("")}<rect x="118" y="214" width="164" height="16" fill="#8f8a80"/>${[0, 1, 2, 3].map((c) => `<path d="M${126 + c * 38} ${76 + 34 * 2}h34" stroke="#6f6a62" stroke-width="3"/>`).join("")}${tree(70, 186, 1)}${tree(332, 182, 1.05, "#5f7f4c")}`,
    cottage: `<rect x="126" y="132" width="150" height="98" fill="#efe6d2"/><path d="M112 138q90-96 178 0z" fill="#b48a4e"/><path d="M112 138q90-96 178 0" stroke="#8c6a3a" stroke-width="4" fill="none"/>${win(146, 154, 28, 28)}${win(228, 154, 28, 28)}<path d="M188 230v-50a13 13 0 0 1 26 0v50z" fill="#4f6b45"/>${[60, 90, 312, 340].map((x) => `<circle cx="${x}" cy="222" r="14" fill="#c46a7a"/><circle cx="${x + 8}" cy="214" r="9" fill="#e09aa6"/>`).join("")}${tree(352, 170, .9)}`,
    modern: `<rect x="80" y="110" width="140" height="120" fill="#ece9e2"/><rect x="200" y="140" width="130" height="90" fill="#5c5f63"/><rect x="72" y="100" width="156" height="12" fill="#3a3c3f"/><rect x="96" y="128" width="104" height="56" fill="#a9c4cf"/><rect x="220" y="160" width="90" height="70" fill="#d8b98a" opacity=".85"/><path d="M265 160v70" stroke="#5c5f63" stroke-width="3"/><rect x="0" y="226" width="400" height="6" fill="#bcae96"/>${tree(360, 186, .9)}`,
    flat: `<rect x="70" y="70" width="260" height="160" fill="#b9725a"/>${[0, 1, 2].map((r) => [0, 1, 2, 3, 4].map((c) => win(88 + c * 48, 86 + r * 46, 26, 30)).join("")).join("")}<rect x="186" y="190" width="28" height="40" fill="#2f3f4a"/><path d="M70 70h260" stroke="#6e3e2e" stroke-width="8"/>`,
  }[kind];
  return `<svg viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${esc(label)}"><defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${s1}"/><stop offset="1" stop-color="${s2}"/></linearGradient></defs>
<rect width="400" height="260" fill="url(#${g})"/><rect y="226" width="400" height="34" fill="#9bb07a"/><path d="M0 240h400" stroke="#c9c2b2" stroke-width="10"/>${scene}</svg>`;
};
const street = () => `<svg viewBox="0 0 1200 470" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Tree-lined residential street with terraced houses at dusk"><defs>
<linearGradient id="hv-dusk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fb8cf"/><stop offset=".7" stop-color="#f1d3b0"/><stop offset="1" stop-color="#f6e3c9"/></linearGradient></defs>
<rect width="1200" height="470" fill="url(#hv-dusk)"/><circle cx="980" cy="120" r="46" fill="#fbe7c2" opacity=".8"/>
${Array.from({ length: 9 }, (_, i) => { const x = 20 + i * 128, h = 200 + (i % 3) * 22, c = ["#c98f6e", "#e3d6bf", "#a8b6a0", "#d6b38c", "#b9725a", "#cfc6b4"][i % 6]; return `<rect x="${x}" y="${380 - h}" width="128" height="${h}" fill="${c}"/><path d="M${x - 4} ${380 - h}l68-40 68 40z" fill="#5f4638"/>${[0, 1].map((r) => `${win(x + 18, 400 - h + r * 70, 34, 42)}${win(x + 76, 400 - h + r * 70, 34, 42)}`).join("")}<rect x="${x + 50}" y="318" width="28" height="62" fill="${["#2f4b5a", "#6b3a3a", "#3a4a32"][i % 3]}"/>`; }).join("")}
<rect y="380" width="1200" height="90" fill="#8f8a80"/><rect y="378" width="1200" height="14" fill="#c9c2b2"/>${[60, 330, 600, 870, 1140].map((x) => tree(x, 330, 1.9, "#5f7f4c")).join("")}
<rect x="410" y="402" width="150" height="40" rx="12" fill="#3d5a6b"/><circle cx="440" cy="444" r="10" fill="#222"/><circle cx="530" cy="444" r="10" fill="#222"/></svg>`;
const face = (i, label) => {
  const skin = ["#e3b48f", "#a8714c", "#f1cfb2", "#7a4e33"][i % 4], hair = ["#3a2a20", "#1e1a18", "#a5643a", "#2b2522"][i % 4], bg = ["#cfdcd2", "#e8d9c4", "#d6dbe8", "#ead2cf"][i % 4];
  return `<svg viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${esc(label)}"><rect width="200" height="200" fill="${bg}"/><path d="M30 200c6-46 38-66 70-66s64 20 70 66z" fill="${["#3d5a6b", "#6b4a3a", "#4f6b45", "#5c5f63"][i % 4]}"/><rect x="88" y="112" width="24" height="26" fill="${skin}"/><ellipse cx="100" cy="88" rx="34" ry="40" fill="${skin}"/><path d="M64 84c0-34 22-48 38-48s36 12 36 46c-8-18-26-24-40-24s-28 10-34 26z" fill="${hair}"/>${i % 2 ? `<path d="M62 84c-4 30 2 54 10 62l4-40z" fill="${hair}"/><path d="M138 84c4 30-2 54-10 62l-4-40z" fill="${hair}"/>` : ""}</svg>`;
};
const chart = (rnd) => {
  const vals = [612, 618, 624, 631, 628, 640, 646, 652, 649, 661, 668, 674].map((v) => v + Math.round(rnd() * 6)), mn = 590, mx = 690, w = 560, h = 210;
  const pts = vals.map((v, i) => [24 + i * ((w - 40) / 11), 14 + (h - 44) * (1 - (v - mn) / (mx - mn))]);
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join("");
  const mo = ["N", "D", "J", "F", "M", "A", "M", "J", "J", "A", "S", "O"];
  return `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Line chart of median sale price rising from $612k to $674k over twelve months">
${[0, 1, 2, 3].map((r) => `<path d="M24 ${14 + r * ((h - 44) / 3)}H${w - 16}" stroke="var(--border)" stroke-width="1"/>`).join("")}
<path d="${line}L${pts[11][0]} ${h - 30}L24 ${h - 30}z" fill="color-mix(in oklab,var(--primary) 16%,transparent)"/><path d="${line}" fill="none" stroke="var(--primary)" stroke-width="3" stroke-linejoin="round"/>
<circle cx="${pts[11][0]}" cy="${pts[11][1]}" r="6" fill="var(--primary)" stroke="var(--bg)" stroke-width="3"/>
${mo.map((m, i) => `<text x="${pts[i][0]}" y="${h - 8}" text-anchor="middle" font-size="12" fill="var(--muted)" font-family="var(--font-b)">${m}</text>`).join("")}</svg>`;
};

const LISTINGS = [
  ["townhouse", "$685,000", "27 Larch Row, Eastbrook", 3, 2, "1,640", ["New"], "Freehold · garden · 6 min to Eastbrook station"],
  ["detached", "$1,120,000", "4 Copper Beech Close, Hollins Park", 4, 3, "2,410", ["Open house Sat 11–12"], "Double garage · south-facing plot · loft studio"],
  ["apartment", "$2,450 / mo", "Unit 9C, 18 Canal Quay, Riverside", 2, 2, "980", ["For rent", "Pets OK"], "Available 1 Dec · 12-month lease · lift and bike store"],
  ["cottage", "$540,000", "Rose Cottage, Mill End, Ashby Vale", 2, 1, "1,120", ["Price reduced"], "Original beams · wood stove · walk to the green"],
  ["modern", "$949,000", "11 Quarry Lane, Westhill", 4, 3, "2,180", ["New"], "Built 2022 · heat pump · solar · EV charger"],
  ["flat", "$1,980 / mo", "Flat 2, 6 Foundry Street, Old Town", 1, 1, "640", ["For rent"], "Furnished · bills optional · ground-floor patio"],
];
const HOODS = [
  ["townhouse", "Eastbrook", "Victorian terraces, Saturday market and the fastest train into the city.", [["Median", "$712k"], ["Rent", "$2.3k/mo"], ["To centre", "14 min"]]],
  ["cottage", "Ashby Vale", "Village green, two primary schools, footpaths to the reservoir.", [["Median", "$498k"], ["To centre", "38 min"]]],
  ["apartment", "Riverside", "Converted warehouses and new builds along the canal.", [["Median", "$455k"], ["Rent", "$2.1k/mo"]]],
  ["modern", "Westhill", "Larger plots and newer homes near the ridge trail.", [["Median", "$890k"], ["Schools", "4 nearby"]]],
  ["detached", "Hollins Park", "Quiet closes around the park and tennis club.", [["Median", "$1.04m"], ["Schools", "3 nearby"]]],
];
const AGENTS = [["Rosa Delgado", "Sales · Eastbrook & Old Town", "64 homes sold in 2025"], ["Callum Reid", "Sales · Westhill & Hollins Park", "Valuations lead"], ["Amara Nwosu", "Lettings & property management", "212 tenancies managed"], ["Yusuf Karim", "New homes & first-time buyers", "Speaks Turkish and Arabic"]];

const web = (p, st, rnd) => K.page(st, `${K.nav(p, ["Buy", "Rent", "Sell", "Neighbourhoods", "Agents"], "Book a valuation", "Saved homes")}
<main>
<section class="sk-wrap hv-hero" id="top">
  <div class="hv-top">
    <div class="sk-stack" style="gap:16px"><span class="sk-eyebrow">Homes to buy & rent across five neighbourhoods</span>
      <h1 class="sk-h1">Find the street you’ll want to come home to</h1>
      <p class="sk-lede">${esc(p.name)} lists, lets and sells homes from Old Town terraces to new builds on the ridge. Local agents, honest asking prices and viewings that fit around work.</p></div>
    <div class="hv-proof">${[["148", "homes listed today"], ["31 days", "average time to offer"], ["9", "local agents"]].map(([v, l]) => `<div><div class="num">${v}</div><span>${l}</span></div>`).join("")}</div>
  </div>
  <div class="sk-photo hv-shot">${street()}</div>
  <form class="card hv-search" aria-label="Search properties">
    <div class="hv-modes" role="tablist"><span class="hv-mode on" role="tab" aria-selected="true">Buy</span><span class="hv-mode" role="tab">Rent</span><span class="hv-mode" role="tab">Sold prices</span></div>
    <div class="hv-fields">
      <div class="sk-field"><label for="hv-loc">Location</label><div class="sk-input" id="hv-loc">${ic("pin", 16)} Eastbrook, within 1 mile</div></div>
      <div class="sk-field"><label>Min price</label><div class="sk-input">$400,000</div></div>
      <div class="sk-field"><label>Max price</label><div class="sk-input">$750,000</div></div>
      <div class="sk-field"><label>Bedrooms</label><div class="sk-input">2+ beds</div></div>
      <button class="btn primary sk-btn-lg" type="button">${ic("search", 16)} Search 38 homes</button>
    </div>
    <div class="hv-quick"><span>Popular:</span><a href="#">Gardens in Eastbrook</a><a href="#">Under $500k</a><a href="#">Pet-friendly rentals</a><a href="#">New builds</a><a href="#">Open houses this weekend</a></div>
  </form>
</section>

<section class="sk-sec sk-tight" id="buy"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">Featured listings</span><h2 class="sk-h2">New this week</h2></div>
    <div class="hv-chips"><span class="hv-chip on">All</span><span class="hv-chip">For sale</span><span class="hv-chip">To rent</span><span class="hv-chip">Open house</span></div></div>
  <div class="sk-g4 sk-rail">${LISTINGS.slice(0, 4).map(([k, pr, addr, bd, ba, sq, badges, note], i) => `<article class="card hv-list"><div class="sk-photo">${house(k, i, `${addr} exterior`)}<div class="hv-badges">${badges.map((b, j) => `<span class="${j === 0 && i % 2 === 0 ? "hot" : ""}">${esc(b)}</span>`).join("")}</div><span class="hv-save" aria-label="Save home">${ic("heart", 16)}</span></div>
    <div class="hv-body"><div class="num hv-price">${pr}</div><h3 class="sk-h3" style="font-size:calc(17px * var(--hs))">${esc(addr)}</h3><p class="muted" style="font-size:13px">${esc(note)}</p>
    <div class="hv-specs"><span><b>${bd}</b> beds</span><span><b>${ba}</b> bath${ba > 1 ? "s" : ""}</span><span><b>${sq}</b> sq ft</span></div></div></article>`).join("")}</div>
  <div class="sk-row" style="margin-top:32px"><a class="btn primary sk-btn-lg" href="#">View all 148 homes</a><a class="btn sk-btn-lg" href="#">${ic("pin", 16)} Search on a map</a></div>
</div></section>

<section class="sk-sec sk-alt sk-tight" id="neighbourhoods"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">Neighbourhood guides</span><h2 class="sk-h2">Know the area before the viewing</h2></div><p class="muted hv-hide-m" style="max-width:360px">Schools, commute times, parks and what homes actually sold for, written by the agents who work each patch.</p></div>
  <div class="hv-hoods sk-rail">${HOODS.map(([k, n, d, facts], i) => `<a class="card hv-hood${i === 0 ? " big" : ""}" href="#"><div class="sk-photo">${house(k, i + 10, `Homes in ${n}`)}</div><div><h3 class="sk-h3">${esc(n)}</h3><p class="muted" style="font-size:14px">${esc(d)}</p><dl>${facts.map(([a, b]) => `<div><dt>${a}</dt><dd>${b}</dd></div>`).join("")}</dl></div></a>`).join("")}</div>
</div></section>

<section class="sk-sec sk-tight"><div class="sk-wrap hv-market">
  <div class="sk-stack" style="gap:18px"><span class="sk-eyebrow">Local market · October 2026</span><h2 class="sk-h2">What’s happening with prices</h2>
    <p class="muted">Figures from our own sales and lettings across the five neighbourhoods we cover, updated on the first of each month.</p>
    <div class="hv-stats" style="width:100%">${[["$674k", "Median sale price", "+4.1% on last year"], ["31", "Days to accepted offer", "6 fewer than spring"], ["98.2%", "Sale price vs asking", "Across 86 sales"], ["$2,240", "Median monthly rent", "+2.6% on last year"]].map(([v, l, d]) => `<div><div class="num">${v}</div><small>${l}</small><span class="hv-delta">${d}</span></div>`).join("")}</div>
  </div>
  <figure class="card hv-chart"><figcaption class="sk-row" style="justify-content:space-between;margin-bottom:12px"><b>Median sale price, last 12 months</b><span class="badge">All property types</span></figcaption>${chart(rnd)}</figure>
</div></section>

<section class="sk-sec sk-tight" id="sell"><div class="sk-wrap">
  <div class="card hv-sell">
    <div class="hv-sell-l"><span class="sk-eyebrow">Sell with us</span><h2 class="sk-h2">What’s your home worth?</h2>
      <p class="muted">Book a free, no-obligation valuation. An agent who sells on your street visits, walks you through recent comparable sales and gives you a written price range within 48 hours.</p>
      <ol class="hv-steps"><li><div><b>Visit in 45 minutes</b><span>Weekdays, evenings or Saturday mornings.</span></div></li><li><div><b>Written valuation</b><span>Comparable sales, a suggested asking price and a marketing plan.</span></div></li><li><div><b>Photos and floor plan</b><span>Included with every sale listing, booked within a week.</span></div></li></ol>
    </div>
    <form class="hv-form" aria-label="Request a valuation" id="book-a-valuation">
      <h3 class="sk-h3">Request a valuation</h3>
      <div class="sk-field"><label for="hv-addr">Property address</label><input class="sk-input" id="hv-addr" value="27 Linden Avenue, Eastbrook"></div>
      <div class="sk-g2"><div class="sk-field"><label for="hv-type">Property type</label><select class="sk-input" id="hv-type"><option>Terraced house</option><option>Semi-detached</option><option>Detached</option><option>Apartment</option></select></div><div class="sk-field"><label for="hv-beds">Bedrooms</label><select class="sk-input" id="hv-beds"><option>3</option><option>2</option><option>4+</option></select></div></div>
      <div class="sk-g2"><div class="sk-field"><label for="hv-when">Thinking of selling</label><select class="sk-input" id="hv-when"><option>In the next 3 months</option><option>3–6 months</option><option>Just curious</option></select></div><div class="sk-field"><label for="hv-ph">Phone</label><input class="sk-input" id="hv-ph" value="(555) 018-4471"></div></div>
      <div class="sk-field"><label for="hv-em">Email</label><input class="sk-input" id="hv-em" placeholder="you@example.com"></div>
      <button class="btn primary sk-btn-lg" type="button">Book my free valuation</button>
      <p class="muted" style="font-size:13px">We’ll call within one working day to arrange a time. No mailing lists unless you ask.</p>
    </form>
  </div>
</div></section>

<section class="sk-sec sk-tight" id="agents"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">Our agents</span><h2 class="sk-h2">People who know the streets</h2></div><a class="btn sk-btn-lg hv-hide-m" href="#">Meet the whole team ${ic("arrow", 16)}</a></div>
  <div class="sk-g4 sk-rail">${AGENTS.map(([n, r, f], i) => `<article class="card hv-agent"><div class="sk-photo">${face(i, `Portrait of ${n}`)}</div><div><h3 class="sk-h3" style="font-size:calc(18px * var(--hs))">${esc(n)}</h3><span class="muted">${esc(r)}</span><span>${esc(f)}</span><div class="sk-row"><a class="btn" href="#">${ic("phone", 14)} Call</a><a class="btn" href="#">${ic("mail", 14)} Email</a></div></div></article>`).join("")}</div>
</div></section>

<section class="sk-sec sk-alt sk-tight"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">Client notes</span><h2 class="sk-h2">From recent movers</h2></div></div>
  <div class="sk-g3 sk-rail">${[["Rosa priced our terrace from the three sales on our road, not a guess. We had four viewings the first Saturday.", "Helen M.", "Sold in Eastbrook"], ["As first-time buyers we had a hundred questions. Yusuf answered every one and came to the survey with us.", "Tom & Ade", "Bought in Riverside"], ["Amara’s team handles the boiler service and inspections, and the rent arrives on the 1st. That’s all I wanted.", "Grace L.", "Landlord, two flats"]].map(([q, n, r]) => `<figure class="card hv-note"><div class="stars" aria-label="5 out of 5">${ic("star", 15).repeat(5)}</div><q>${esc(q)}</q><figcaption><b>${esc(n)}</b> · <span class="muted" style="font-size:13px">${esc(r)}</span></figcaption></figure>`).join("")}</div>
</div></section>
</main>
${K.footer(p, "Residential sales, lettings and property management across Eastbrook, Riverside, Old Town, Westhill and Ashby Vale.", [["Offices", ["22 Station Parade, Eastbrook", "Mon–Fri 9–6, Sat 9–4", "Viewings 7 days"]], ["Contact", ["(555) 018-4400", "hello@harrowvale.example", "lettings@harrowvale.example"]], ["Explore", ["Buy", "Rent", "Sold prices", "Landlord services"]]])}`, CSS);

module.exports = {
  "real-estate-website": K.def("realestate", "Real estate website",
    "a full real estate agency home page: navigation with saved homes and book-a-valuation, a hero with a street photo and a buy/rent/sold-prices property search (location, price range, bedrooms) with popular searches and agency figures, featured listing cards with price, address, beds/baths/sq ft and badges like New, Open house and For rent, a neighbourhood guide mosaic with median prices and commute times, local market figures with a 12-month median price chart, a sell-with-us valuation section with steps and a request form, agent cards with call and email, client notes and a footer",
    ["navigation-header", "hero", "search-form", "tabs", "property-listings", "cards", "badges", "neighbourhood-guides", "stats", "chart", "valuation-form", "steps", "team", "testimonials", "footer", "real-estate"], web),
};
