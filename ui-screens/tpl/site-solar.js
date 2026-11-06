/* Solar company website template (Sunrake Solar, a fictional home solar and battery installer). Full responsive, roof-led home page:
   nav, bright hero with a house and panel roofline along the bottom edge and a tall estimator card (postcode or ZIP, monthly bill, roof type, shading,
   clearly labelled sample estimate of system size and rough cost), panels/inverter/battery explained beside a coded roof diagram, Gantt-style installation
   timeline from survey to switch-on, buying vs financing table, warranties and aftercare, local installer crew roster, fictional reviews, FAQ, free assessment
   form, footer. No guaranteed savings or payback, an estimate is not a quote, no real manufacturers, subsidies or laws. The hero roofline is inline SVG in fixed
   natural tones; the roof diagram uses tokens so all 8 styles and dark mode recolour it. No JS: the estimate is a filled sample. */
const { ic, esc } = require("../lib");
const K = require("../sitekit");

const CSS = `<style>
.sr>.sk-sec{padding:48px 0}
.sr h2.sk-h2{font-size:calc(33px * var(--hs))}
.sr .sk-head{margin-bottom:22px}
.sr-hero{position:relative;overflow:hidden;background:linear-gradient(180deg,color-mix(in oklab,var(--accent) 20%,var(--bg)),color-mix(in oklab,var(--primary) 8%,var(--bg)));border-bottom:1px solid var(--border)}
.sr-sun{position:absolute;left:44%;top:-160px;width:360px;height:360px;border-radius:50%;background:radial-gradient(circle,color-mix(in oklab,var(--warning) 62%,transparent) 0 34%,color-mix(in oklab,var(--warning) 20%,transparent) 35% 58%,transparent 59%)}
.sr-scene{position:absolute;left:0;right:0;bottom:0;height:300px;z-index:0}
.sr-scene svg{display:block;width:100%;height:100%}
.sr-hgrid{position:relative;z-index:1;display:grid;grid-template-columns:minmax(0,1fr) 500px;gap:56px;align-items:start;padding-top:40px;padding-bottom:36px}
.sr-copy{display:grid;gap:16px;justify-items:start;padding-bottom:270px}
.sr-copy h1{font-size:calc(58px * var(--hs));line-height:1.03}
.sr-copy .sk-lede{color:color-mix(in oklab,var(--text) 78%,var(--bg));font-size:17px;max-width:520px}
.sr-est{padding:0;overflow:hidden;box-shadow:var(--shadow-lg);background:var(--bg)}
.sr-in{padding:18px 24px;display:grid;gap:11px}
.sr-in h2{font-size:calc(22px * var(--hs));line-height:1.2}
.sr-in .sk-g2{gap:12px}
.sr-grp{display:grid;gap:6px;border:0;min-width:0}
.sr-grp legend{font-weight:500;font-size:13px;margin-bottom:6px;padding:0}
.sr-chips{display:flex;flex-wrap:wrap;gap:6px}
.sr-chips label{position:relative;min-height:36px;padding:0 11px;border:1px solid var(--border);border-radius:var(--radius);display:inline-flex;align-items:center;font-size:13px;font-weight:500;background:var(--bg)}
.sr-chips input{position:absolute;opacity:0;width:1px;height:1px}
.sr-chips label.on{background:var(--primary);border-color:var(--primary);color:var(--on-primary)}
.sr-out{padding:18px 24px 20px;background:color-mix(in oklab,var(--primary) 9%,var(--surface));border-top:1px dashed var(--muted);display:grid;gap:10px}
.sr-otop{display:flex;justify-content:space-between;align-items:center;gap:10px;font-size:13px;color:var(--muted)}
.sr-figs{display:grid;grid-template-columns:minmax(0,.8fr) minmax(0,1.2fr);gap:16px}
.sr-figs div{display:grid;gap:0}
.sr-figs span{font-size:12.5px;color:var(--muted)}
.sr-figs .num{font-size:25px;line-height:1.2;white-space:nowrap}
.sr-small{font-size:12.5px;line-height:1.45;color:var(--muted)}
.sr-how{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);gap:44px;align-items:center}
.sr-diagram{padding:0;overflow:hidden;background:var(--surface)}
.sr-diagram svg{display:block;width:100%;height:auto}
.sr-diagram text{font-family:var(--font-b);font-size:15px;font-weight:600;fill:var(--text)}
.sr-diagram text.n{font-size:15px;font-weight:700;fill:var(--on-primary);text-anchor:middle}
.sr-d-sky{fill:color-mix(in oklab,var(--accent) 14%,var(--surface))}
.sr-d-wall{fill:var(--bg);stroke:var(--text);stroke-width:2.5}
.sr-d-roof{fill:color-mix(in oklab,var(--text) 14%,var(--surface));stroke:var(--text);stroke-width:2.5;stroke-linejoin:round}
.sr-d-panel{fill:var(--primary);stroke:var(--text);stroke-width:1.6}
.sr-d-box{fill:var(--surface);stroke:var(--text);stroke-width:2}
.sr-d-line{fill:none;stroke:var(--text);stroke-width:2}
.sr-d-flow{fill:none;stroke:var(--primary);stroke-width:3;stroke-dasharray:7 6}
.sr-d-sun{fill:var(--warning)}
.sr-d-ground{fill:color-mix(in oklab,var(--success) 30%,var(--surface))}
.sr-d-dot{fill:var(--primary)}
.sr-parts{list-style:none;display:grid;gap:0;margin-top:14px}
.sr-parts li{display:grid;grid-template-columns:30px minmax(0,1fr);gap:12px;padding:11px 0;border-top:1px solid var(--border)}
.sr-parts .sr-n{width:26px;height:26px;border-radius:50%;display:grid;place-items:center;background:var(--primary);color:var(--on-primary);font-size:13px;font-weight:700}
.sr-parts p{font-size:14px;color:var(--muted);line-height:1.5}
.sr-parts b{display:block;font-size:15.5px}
.sr-tl{padding:0;overflow:hidden}
.sr-trow{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,.8fr);border-top:1px solid var(--border)}
.sr-trow:first-child{border-top:0}
.sr-tl-txt{padding:10px 20px;display:grid;grid-template-columns:120px minmax(0,1fr);gap:14px;align-items:baseline}
.sr-tl-txt b{font-size:14.5px;line-height:1.3}
.sr-tl-txt small{display:block;font:500 12.5px var(--font-b);color:var(--muted)}
.sr-tl-txt p{font-size:13px;line-height:1.45;color:var(--muted)}
.sr-bar{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));align-items:center;position:relative;padding:0 16px;background-image:linear-gradient(90deg,var(--border) 1px,transparent 1px);background-size:calc((100% - 32px) / 12) 100%;background-position:16px 0;background-repeat:repeat-x;background-clip:content-box}
.sr-bar i{height:24px;border-radius:var(--radius);background:color-mix(in oklab,var(--primary) 78%,var(--bg));display:flex;align-items:center;padding:0 6px;font:600 11px var(--font-b);color:var(--on-primary);white-space:nowrap;min-width:0}
.sr-bar i.wait{background:repeating-linear-gradient(135deg,color-mix(in oklab,var(--warning) 62%,var(--bg)) 0 7px,color-mix(in oklab,var(--warning) 34%,var(--bg)) 7px 14px);color:var(--text)}
.sr-bar i.go{background:var(--success);color:var(--on-danger)}
.sr-weeks{background:var(--surface)}
.sr-weeks .sr-tl-txt{padding-block:9px;font-size:12px;color:var(--muted);font-weight:600;letter-spacing:.05em;text-transform:uppercase;display:block}
.sr-weeks .sr-bar{background-image:none}
.sr-weeks .sr-bar span{font-size:11.5px;color:var(--muted);font-weight:600}
.sr-fine{display:flex;justify-content:space-between;gap:24px;margin-top:14px;font-size:13.5px;color:var(--muted)}
.sr-money{display:grid;grid-template-columns:minmax(0,.8fr) minmax(0,1.2fr);gap:48px;align-items:start}
.sr-paytbl{padding:0;overflow:hidden}
.sr-paytbl table{width:100%;border-collapse:collapse;font-size:14px;table-layout:fixed}
.sr-paytbl th,.sr-paytbl td{padding:11px 18px;text-align:left;vertical-align:top;border-bottom:1px solid var(--border)}
.sr-paytbl thead th{background:var(--surface);font-size:calc(17px * var(--hs))}
.sr-paytbl thead th:first-child{width:26%}
.sr-paytbl tbody th{font-weight:600}
.sr-paytbl tbody tr:last-child>*{border-bottom:0}
.sr-care{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);gap:28px;align-items:stretch}
.sr-warr{list-style:none;display:grid;gap:0;margin-top:0}
.sr-warr li{display:grid;grid-template-columns:150px minmax(0,1fr) 90px;gap:14px;align-items:baseline;padding:10px 0;border-top:1px solid var(--border);font-size:14px}
.sr-warr li:last-child{border-bottom:1px solid var(--border)}
.sr-warr span{color:var(--muted)}
.sr-warr em{font-style:normal;font-size:12.5px;font-weight:600;text-align:right}
.sr-after{padding:24px;display:grid;gap:10px;align-content:start;background:var(--text);color:var(--bg);border-color:var(--text)}
.sr-after h3{font-size:calc(22px * var(--hs))}
.sr-after ul{list-style:none;display:grid;gap:8px;font-size:14px}
.sr-after li{display:grid;grid-template-columns:20px minmax(0,1fr);gap:8px}
.sr-after li svg{margin-top:3px}
.sr-crew{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.1fr);gap:48px;align-items:center}
.sr-crew .sk-photo{aspect-ratio:16/10}
.sr-roster{width:100%;border-collapse:collapse;font-size:14px;margin-top:14px}
.sr-roster th,.sr-roster td{text-align:left;padding:7px 12px 7px 0;border-bottom:1px solid var(--border);vertical-align:top}
.sr-roster th{font-weight:600;white-space:nowrap}
.sr-roster td{color:var(--muted)}
.sr-slot{margin-top:14px;padding:10px 14px;border:1px dashed var(--muted);border-radius:var(--radius);font-size:13px;color:var(--muted)}
.sr-revs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:0;border-block:1px solid var(--border)}
.sr-revs figure{padding:6px 28px;border-left:1px solid var(--border);display:grid;gap:10px;align-content:space-between}
.sr-revs figure:first-child{border-left:0;padding-left:0}
.sr-revs blockquote{font-size:15px;line-height:1.5}
.sr-revs figcaption{font-size:13px;color:var(--muted)}
.sr-qa{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 40px}
.sr-qa details{border-top:1px solid var(--border);padding:11px 0}
.sr-qa summary{cursor:pointer;font-weight:600;list-style:none;display:flex;justify-content:space-between;gap:12px}
.sr-qa summary::-webkit-details-marker{display:none}
.sr-qa summary svg{flex:0 0 auto;margin-top:4px;color:var(--muted)}
.sr-qa details[open] summary svg{transform:rotate(180deg)}
.sr-qa p{margin-top:6px;font-size:14px;color:var(--muted);line-height:1.5}
.sr-book{display:grid;grid-template-columns:minmax(0,.85fr) minmax(0,1.15fr);gap:52px;align-items:start}
.sr-check{list-style:none;display:grid;gap:8px;margin-top:16px;font-size:14px}
.sr-check li{display:grid;grid-template-columns:20px minmax(0,1fr);gap:8px}
.sr-check li svg{margin-top:3px;color:var(--success)}
.sr-form{padding:26px 28px;display:grid;gap:12px}
.sr-form .sk-g2{gap:12px}
@media (max-width:1024px){
  .sr-hgrid{grid-template-columns:minmax(0,1fr) 420px;gap:28px}
  .sr-copy h1{font-size:calc(46px * var(--hs))}
  .sr-figs .num{font-size:21px}
  .sr-how,.sr-money,.sr-crew,.sr-book{gap:32px}
  .sr-tl-txt{grid-template-columns:minmax(0,1fr);gap:0}
  .sr-warr li{grid-template-columns:130px minmax(0,1fr)}
  .sr-warr em{display:none}
  .sr-care{grid-template-columns:minmax(0,1fr)}
}
@media (max-width:960px){
  .sr-hgrid{grid-template-columns:minmax(0,1fr)}
  .sr-copy{padding-bottom:0}
  .sr-scene{position:relative;height:190px;margin-top:-20px}
  .sr-sun{left:auto;right:-90px}
  .sr-how,.sr-money,.sr-crew,.sr-book{grid-template-columns:minmax(0,1fr)}
}
@media (max-width:760px){
  .sr>.sk-sec{padding:36px 0}
  .sr h2.sk-h2{font-size:calc(28px * var(--hs))}
  .sr .sk-head{margin-bottom:18px;gap:8px}
  .sr-hgrid{padding-top:26px;padding-bottom:0;gap:20px}
  .sr-copy{gap:14px}
  .sr-copy h1{font-size:calc(38px * var(--hs))}
  .sr-scene{height:104px;margin-top:0}
  .sr-copy .sk-row .btn:last-child{display:none}
  .sr-in{padding:18px}.sr-out{padding:16px 18px}
  .sr-in .sk-g2,.sr-form .sk-g2{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
  .sr-figs{grid-template-columns:minmax(0,.62fr) minmax(0,1.38fr);gap:10px}
  .sr-figs .num{font-size:19px}
  .sr-sun{width:230px;height:230px;top:-70px;right:-60px}
  .sr-how{gap:20px}
  .sr-parts li{padding:9px 0}.sr-parts p{font-size:13.5px}
  .sr-trow{grid-template-columns:minmax(0,1fr)}
  .sr-weeks .sr-tl-txt{display:none}
  .sr-tl-txt{padding:10px 14px 4px}
  .sr-bar{padding:0 14px 10px;background-size:calc((100% - 28px) / 12) 100%;background-position:14px 0}
  .sr-bar i{height:20px;padding:0 6px;font-size:10.5px}
  .sr-weeks .sr-bar{padding:8px 14px}
  .sr-weeks .sr-bar span{font-size:10.5px}
  .sr-fine{flex-direction:column;gap:6px;font-size:13px}
  #timeline .sk-head p{display:none}
  .sr-money{gap:18px}
  .sr-money>div:first-child p:last-child{display:none}
  .sr-paytbl table,.sr-paytbl thead,.sr-paytbl tbody{display:block}
  .sr-paytbl tr{display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}
  .sr-paytbl thead th:first-child{display:none}
  .sr-paytbl th,.sr-paytbl td{padding:7px 12px;font-size:13px}
  .sr-paytbl thead th{font-size:calc(15px * var(--hs));padding:11px 12px}
  .sr-paytbl tbody th{grid-column:1/-1;padding-bottom:0;border-bottom:0;font-size:12px;color:var(--muted)}
  .sr-paytbl .sr-opt{display:none}
  .sr-warr li{grid-template-columns:minmax(0,1fr);gap:0;padding:8px 0}
  .sr-warr li b{font-size:14px}.sr-warr span{font-size:13.5px}
  .sr-after{padding:20px}
  .sr-after li:nth-child(4),.sr-after li:nth-child(5){display:none}
  .sr-crew{gap:18px}
  .sr-crew .sk-photo{display:none}
  .sr-roster tr:nth-child(n+4){display:none}
  .sr-revs{display:flex;border:0;margin:0 -20px}
  .sr-revs figure{padding:16px;border:1px solid var(--border);border-radius:var(--radius);background:var(--surface)}
  .sr-revs figure:first-child{border-left:1px solid var(--border);padding-left:16px}
  .sr-qa{grid-template-columns:minmax(0,1fr)}
  .sr-qa .sr-opt{display:none}
  .sr-qa p{font-size:13.5px}
  .sr-book{gap:20px}
  .sr-form{padding:18px;gap:10px}
  .sr-form>.sk-g2:last-of-type{display:none}
  .sr-form .sk-field:has(#sr-e){display:none}
  .sr-diagram text{font-size:17px}
  .sr-check li:nth-child(4){display:none}
}
</style>`;

// ---- hero roofline (fixed natural tones, transparent sky so the section tint shows through) ---------------------------
const lerp = (a, b, t) => a + (b - a) * t;
const panels = () => {
  // roof plane: top edge (262,86)-(690,86), eave (150,204)-(790,204)
  const pt = (u, v) => [lerp(lerp(262, 690, u), lerp(150, 790, u), v), lerp(86, 204, v)];
  let s = "";
  for (let r = 0; r < 2; r++) for (let c = 0; c < 7; c++) {
    const u0 = 0.12 + c * 0.11, u1 = u0 + 0.1, v0 = 0.14 + r * 0.38, v1 = v0 + 0.34;
    const q = [pt(u0, v0), pt(u1, v0), pt(u1, v1), pt(u0, v1)].map((x) => x.map((n) => n.toFixed(1)).join(",")).join(" ");
    s += `<polygon points="${q}" fill="#22384f" stroke="#c6d3dd" stroke-width="1.6"/>`;
    const [a, b] = [pt((u0 + u1) / 2, v0), pt((u0 + u1) / 2, v1)];
    s += `<path d="M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}" stroke="#4d6b86" stroke-width="1"/>`;
  }
  return s;
};
const scene = () => `<svg viewBox="0 0 1440 300" preserveAspectRatio="xMinYMax slice" role="img" aria-label="A house with two rows of solar panels on its roof, with neighboring rooftops and trees">
<rect y="270" width="1440" height="30" fill="#8fae6d"/>
<g fill="#6f8f5a"><circle cx="62" cy="200" r="46"/><circle cx="104" cy="226" r="34"/></g><rect x="74" y="232" width="12" height="44" fill="#7a5a3f"/>
<polygon points="262,86 690,86 790,204 150,204" fill="#a4624b"/><path d="M262 86H690" stroke="#7f4736" stroke-width="5"/><rect x="600" y="52" width="40" height="46" fill="#94533f"/><rect x="594" y="46" width="52" height="9" fill="#7f4736"/>
${panels()}
<rect x="176" y="204" width="588" height="72" fill="#f2e7d6"/><path d="M142 206H798" stroke="#6d3c2d" stroke-width="7"/>
${[230, 340, 590, 680].map((x) => `<rect x="${x}" y="222" width="58" height="36" fill="#a9c8d6" stroke="#fff" stroke-width="3"/>`).join("")}<rect x="460" y="222" width="46" height="54" fill="#51708a"/><circle cx="498" cy="250" r="2.6" fill="#f1d27a"/>
<g><polygon points="900,150 1160,150 1210,214 850,214" fill="#7f8b93"/><rect x="876" y="214" width="310" height="60" fill="#e5ddcf"/></g>
<g><polygon points="1190,176 1420,176 1450,226 1160,226" fill="#a4624b"/><rect x="1176" y="226" width="264" height="48" fill="#f0e6d8"/></g></svg>`;

// ---- plain-words diagram (tokens so it recolours) --------------------------------------------------------------------
const num = (x, y, n) => `<circle class="sr-d-dot" cx="${x}" cy="${y}" r="15"/><text class="n" x="${x}" y="${y + 5}">${n}</text>`;
const diagram = () => {
  const pnls = Array.from({ length: 4 }, (_, i) => { const x0 = 150 + i * 54, y0 = 168 - i * 36; return `<polygon class="sr-d-panel" points="${x0},${y0} ${x0 + 48},${y0 - 32} ${x0 + 55},${y0 - 22} ${x0 + 7},${y0 + 10}"/>`; }).join("");
  return `<svg viewBox="0 0 720 470" role="img" aria-label="Cross-section of a house: panels on the roof feed an inverter, then a battery and the main electrical panel, then the meter and the grid">
<rect class="sr-d-sky" width="720" height="470"/><rect class="sr-d-ground" y="420" width="720" height="50"/>
<circle class="sr-d-sun" cx="74" cy="66" r="34"/><g class="sr-d-line"><path d="M74 16v-8M124 66h8M24 66h-8M110 30l6-6M38 30l-6-6M110 102l6 6"/></g><path class="sr-d-flow" d="M112 92L178 118"/>
<polygon class="sr-d-roof" points="96,216 340,52 584,216"/><rect class="sr-d-wall" x="130" y="216" width="420" height="204"/><path class="sr-d-line" d="M130 320H550M340 216V320"/>
${pnls}
<path class="sr-d-flow" d="M250 150V246H214"/>
<rect class="sr-d-box" x="156" y="232" width="58" height="66" rx="4"/><text class="l" x="224" y="290">Inverter</text>
<path class="sr-d-flow" d="M185 298V344"/>
<rect class="sr-d-box" x="152" y="344" width="96" height="62" rx="4"/><path class="sr-d-line" d="M166 362h68M166 376h68M166 390h68"/><text class="l" x="258" y="382">Battery (optional)</text>
<path class="sr-d-flow" d="M214 266H404"/>
<rect class="sr-d-box" x="404" y="236" width="56" height="70" rx="4"/><path class="sr-d-line" d="M416 252h32M416 266h32M416 280h32"/><text class="l" x="392" y="232">Main panel</text>
<path class="sr-d-flow" d="M460 266H576"/>
<rect class="sr-d-box" x="552" y="244" width="30" height="42" rx="3"/><text class="l" x="482" y="350">Meter</text><path class="sr-d-line" d="M567 286V342H530"/>
<path class="sr-d-flow" d="M582 262H640V126H664"/>
<path class="sr-d-line" d="M660 420L672 104M688 420L676 104M656 134H696M662 112H690M664 206L686 262M684 206L666 262"/><text class="l" x="612" y="92">The grid</text>
${num(214, 86, 1)}${num(136, 264, 2)}${num(136, 376, 3)}${num(432, 322, 4)}${num(640, 196, 5)}</svg>`;
};
const crewShot = () => `<svg viewBox="0 0 640 400" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Two installers in harnesses fitting a panel on a tiled roof on a clear morning">
<defs><linearGradient id="sr-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bcdcee"/><stop offset="1" stop-color="#eaf3f2"/></linearGradient></defs><rect width="640" height="400" fill="url(#sr-sky)"/><circle cx="96" cy="88" r="42" fill="#f6d36b"/>
<polygon points="0,400 0,250 640,110 640,400" fill="#a4624b"/>${Array.from({ length: 9 }, (_, i) => `<path d="M0 ${280 + i * 32}L640 ${140 + i * 32}" stroke="#8d5240" stroke-width="2"/>`).join("")}
<polygon points="250,250 420,212 448,278 278,318" fill="#22384f" stroke="#c6d3dd" stroke-width="3"/><path d="M306 238l28 66M362 226l28 66M264 284l170-38" stroke="#4d6b86" stroke-width="2"/>
<g><path d="M178 182c18-6 38 0 44 22l10 58-58 12-12-62c-2-14 4-26 16-30z" fill="#e58b3c"/><path d="M176 212l54 46M224 208l-52 54" stroke="#3b4a54" stroke-width="5"/><circle cx="192" cy="154" r="24" fill="#c98f66"/><path d="M166 150c2-20 16-30 28-30s26 10 26 30z" fill="#f4f1e8"/><path d="M226 216l44 18" stroke="#e58b3c" stroke-width="15" stroke-linecap="round"/><path d="M186 272l-16 64M222 266l10 64" stroke="#3b4a54" stroke-width="18" stroke-linecap="round"/></g>
<g><path d="M484 128c16-6 34 0 40 20l10 50-54 12-10-54c-2-14 2-24 14-28z" fill="#3f7fa2"/><circle cx="496" cy="102" r="22" fill="#8d5a3b"/><path d="M472 98c2-18 14-26 26-26s24 8 24 26z" fill="#f6d36b"/><path d="M482 150l-46 54" stroke="#3f7fa2" stroke-width="14" stroke-linecap="round"/><path d="M492 206l-8 60M524 196l14 56" stroke="#3b4a54" stroke-width="17" stroke-linecap="round"/></g></svg>`;

const PARTS = [
  ["Panels", "Turn daylight into direct current (DC). They need light, not heat, and the output rises and falls through the day."],
  ["Inverter", "Changes DC into the alternating current (AC) your sockets use. One unit on a wall, or a small one behind each panel if part of the roof gets shade."],
  ["Battery, if you want one", "Stores spare daytime power for the evening. Optional, and easy to add later if we plan for it now."],
  ["Main panel", "Your home uses solar power first, then tops up from the grid when it needs more."],
  ["Meter and grid", "Spare power can flow out to the grid. At night, and on dull days, you draw from it as usual."],
];
const TL = [
  ["Roof survey", "We measure the roof, check the rafters and look at your main panel.", 1, 2, "Week 1"],
  ["System design", "Panel layout, shading check and a written quote for you to approve.", 2, 3, "Week 2"],
  ["Permits", "We file the building or electrical permit with your local authority.", 3, 6, "Weeks 3 to 5", "wait"],
  ["Grid approval", "Your utility reviews the design. Often the slowest part, and we chase it.", 3, 9, "Weeks 3 to 8", "wait"],
  ["Install", "Scaffold or roof anchors, rails, panels and wiring. Usually one to three days.", 9, 10, "Week 9"],
  ["Inspection", "A local inspector checks the finished work, where your area asks for it.", 10, 11, "Week 10"],
  ["Switch-on", "Your utility gives the go-ahead, we commission it and set up monitoring.", 11, 13, "Week 11 on", "go"],
];
const PAY = [
  ["You pay", "The full price, usually in stages", "A deposit, or nothing upfront, then monthly"],
  ["Who owns it", "You, from the day it is paid for", "You, once the lender's terms allow it"],
  ["Extra cost", "None beyond the quote", "Interest and any lender fees"],
  ["Rate and term", "Not relevant", "Set by the lender after a credit check", "sr-opt"],
  ["Local incentives", "Vary by area. We will tell you what we know", "Same, but check how the loan treats them", "sr-opt"],
  ["Ask before signing", "What is due at each stage?", "Total repaid, early repayment terms, and what happens if you sell the home"],
];
const WARR = [
  ["Panel product", "Faults in the panel itself, such as failed connections or frame defects.", "Manufacturer"],
  ["Panel performance", "A stated share of output over the years, as panels slowly age.", "Manufacturer"],
  ["Inverter", "Usually a shorter term than panels, since it works hardest. Often extendable.", "Manufacturer"],
  ["Battery", "Stated capacity over a set number of years or charge cycles.", "Manufacturer"],
  ["Workmanship", "Our roof fixings, flashing, cabling and anything else we did on site.", "Us"],
];
const ROSTER = [["Dara Pellow", "Lead installer", "Runs the roof crew, talks you through day one"], ["Noor Hallam", "Electrician", "Fits the inverter, battery and connections"], ["Luis Ferrant", "Roofer", "Handles flashing and anything under the panels"], ["Bea Tanaway", "Project coordinator", "Files permits, chases the utility, sends Friday updates"]];
const REVS = [
  ["They found two cracked tiles on the survey and fixed them before a single rail went up. Nobody had asked them to look.", "Hollis M., Brackley"],
  ["Grid approval took seven weeks. Bea sent an update every Friday, even when the update was that nothing had moved.", "Anneke S., Cobham Rise"],
  ["The crew were off the roof in two days and the driveway was cleaner than they found it. The app was set up before they left.", "Ravi D., Elmsford"],
];
const FAQ = [
  ["Do panels work on cloudy days?", "Yes, at lower output. Panels respond to daylight, so a bright overcast day still produces power and a heavy, dark one produces much less. Our design uses local sunlight records, not a best-case day.", 1],
  ["Is my roof in good enough condition?", "We check at the survey. Panels stay up for decades, so if the covering is near the end of its life it usually makes sense to replace it first. We will tell you plainly and show you photos.", 1],
  ["What happens in a power cut?", "A standard system switches itself off so it cannot send power to lines that crews are repairing. To keep circuits running you need a battery set up for backup, and we choose which circuits together.", 1],
  ["Do I need a battery?", "Not to go solar. A battery suits homes that use most of their power in the evening or want backup. If you are unsure, we can make the system ready for one later.", 1],
  ["Will the panels damage my roof?", "Fixings go into the rafters, and every penetration is flashed and sealed. If you need to re-roof later, we can take panels down and put them back for a set price.", 0, "sr-opt"],
  ["What if I move house?", "An owned system stays with the home and we can transfer the workmanship cover to the new owner. If you financed it, check your lender's terms first.", 0, "sr-opt"],
];

const web = (p, st) => K.page(st, `${K.nav(p, ["How solar works", "Timeline", "Buying", "Warranties", "FAQ"], "Free assessment", "Call (555) 016-3390")}
<main class="sr">
<section class="sr-hero" id="top"><span class="sr-sun"></span>
  <div class="sr-scene">${scene()}</div>
  <div class="sk-wrap sr-hgrid">
    <div class="sr-copy"><span class="sk-eyebrow">Home solar and batteries</span>
      <h1 class="sk-h1">Your roof is already out in the sun</h1>
      <p class="sk-lede">${esc(p.name)} designs and fits home solar with our own local crew. Start with a rough estimate, then we come out, measure up and give you a real quote.</p>
      <div class="sk-row"><a class="btn primary sk-btn-lg" href="#free-assessment">Book a free assessment</a><a class="btn sk-btn-lg" href="#how-solar-works">How it works</a></div></div>
    <form class="card sr-est" aria-label="Rough solar estimate">
      <div class="sr-in"><h2 class="h">Get a rough estimate</h2>
        <div class="sk-g2"><div class="sk-field"><label for="sr-zip">Postcode or ZIP</label><input class="sk-input" id="sr-zip" value="04127"></div><div class="sk-field"><label for="sr-bill">Monthly power bill</label><input class="sk-input" id="sr-bill" value="$180"></div></div>
        <fieldset class="sr-grp"><legend>Roof type</legend><div class="sr-chips"><label class="on"><input type="radio" name="sr-roof" checked> Pitched tile</label><label><input type="radio" name="sr-roof"> Shingle</label><label><input type="radio" name="sr-roof"> Metal</label><label><input type="radio" name="sr-roof"> Flat</label></div></fieldset>
        <fieldset class="sr-grp"><legend>Shade on the roof</legend><div class="sr-chips"><label><input type="radio" name="sr-shade"> None</label><label class="on"><input type="radio" name="sr-shade" checked> Some, in the morning</label><label><input type="radio" name="sr-shade"> Most of the day</label></div></fieldset></div>
      <div class="sr-out"><div class="sr-otop"><span class="badge">Sample estimate</span><span>For these sample answers</span></div>
        <div class="sr-figs"><div><span>System size</span><b class="num">6.4 kW</b><span>About 16 panels</span></div><div><span>Rough cost before any incentives</span><b class="num">$15,000 to $19,000</b><span>Battery extra, from about $9,000</span></div></div>
        <p class="sr-small">An estimate is not a quote. Real figures depend on your roof, your wiring and local rules, and we cannot promise savings or a payback date.</p>
        <button class="btn primary block" type="button">Book a survey for a real quote</button></div>
    </form>
  </div>
</section>

<section class="sk-sec" id="how-solar-works"><div class="sk-wrap sr-how">
  <div class="card sr-diagram">${diagram()}</div>
  <div><span class="sk-eyebrow">How solar works</span><h2 class="sk-h2" style="margin-top:10px">Five parts, in plain words</h2>
    <ol class="sr-parts">${PARTS.map(([t, d], i) => `<li><span class="sr-n">${i + 1}</span><div><b>${t}</b><p>${d}</p></div></li>`).join("")}</ol></div>
</div></section>

<section class="sk-sec sk-alt" id="timeline"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">Timeline</span><h2 class="sk-h2">From survey to switch-on, about eleven weeks</h2></div><p class="muted" style="max-width:360px">The work on your roof takes days. Most of the wait is paperwork, and we handle all of it.</p></div>
  <div class="card sr-tl"><div class="sr-trow sr-weeks"><div class="sr-tl-txt">Stage</div><div class="sr-bar">${Array.from({ length: 12 }, (_, i) => `<span>${i + 1}</span>`).join("")}</div></div>
  ${TL.map(([t, d, a, b, l, c]) => `<div class="sr-trow"><div class="sr-tl-txt"><b>${t}<small>${l}</small></b><p>${d}</p></div><div class="sr-bar"><i class="${c || ""}" style="grid-column:${a}/${b}"></i></div></div>`).join("")}</div>
  <div class="sr-fine"><span>A typical home in our area. Yours may run shorter or longer, depending on your local authority and utility.</span><span>Striped bars are waiting on others.</span></div>
</div></section>

<section class="sk-sec" id="buying"><div class="sk-wrap sr-money">
  <div><span class="sk-eyebrow">Buying</span><h2 class="sk-h2" style="margin-top:10px">Pay outright or finance it</h2>
    <p class="muted" style="margin-top:12px">Both get you the same system and the same crew. The right answer depends on your cash, your plans for the house and the loan on offer, so read the terms and ask questions.</p>
    <p class="muted" style="margin-top:10px">We do not sell leases, because we want the system to be yours.</p></div>
  <div class="card sr-paytbl"><table><thead><tr><th scope="col" class="muted" style="font-size:12px">Compare</th><th scope="col" class="h">Buy outright</th><th scope="col" class="h">Finance with a loan</th></tr></thead><tbody>${PAY.map(([h, a, b, c]) => `<tr${c ? ` class="${c}"` : ""}><th scope="row">${h}</th><td>${a}</td><td>${b}</td></tr>`).join("")}</tbody></table></div>
</div></section>

<section class="sk-sec sk-alt" id="warranties"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">Warranties and aftercare</span><h2 class="sk-h2">What is covered, and who you call</h2></div></div>
  <div class="sr-care"><ul class="sr-warr">${WARR.map(([a, b, c]) => `<li><b>${a}</b><span>${b}</span><em>${c}</em></li>`).join("")}</ul>
  <aside class="card feat sr-after"><h3 class="h">You call us first</h3><ul>${["We handle any manufacturer claim on your behalf", "Monitoring app shows what the system produces each day", "We get in touch if a panel or inverter stops reporting", "Optional yearly check of fixings, wiring and output", "Panels taken down and refitted if you re-roof"].map((x) => `<li>${ic("check", 15)}<span>${x}</span></li>`).join("")}</ul><p style="font-size:13px;opacity:.8">Terms vary by product. Your quote lists each warranty and its length.</p></aside></div>
</div></section>

<section class="sk-sec" id="crew"><div class="sk-wrap sr-crew">
  <div class="sk-photo">${crewShot()}<span class="sk-cap">Roof crew, Brackley</span></div>
  <div><span class="sk-eyebrow">Local crew</span><h2 class="sk-h2" style="margin-top:10px">Our own people on your roof</h2>
    <table class="sr-roster"><tbody>${ROSTER.map(([n, r, d]) => `<tr><th scope="row">${n}<br><span class="muted" style="font-weight:400;font-size:13px">${r}</span></th><td>${d}</td></tr>`).join("")}</tbody></table>
    <div class="sr-slot">Add your electrical license and insurance details here</div></div>
</div></section>

<section class="sk-sec sk-alt" id="reviews" style="padding-block:44px"><div class="sk-wrap">
  <div class="sr-revs sk-rail">${REVS.map(([q, w]) => `<figure><blockquote>${esc(q)}</blockquote><figcaption>${w}</figcaption></figure>`).join("")}</div>
</div></section>

<section class="sk-sec" id="faq"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">FAQ</span><h2 class="sk-h2">What people ask us on the driveway</h2></div></div>
  <div class="sr-qa">${FAQ.map(([q, a, o, c]) => `<details${o ? " open" : ""}${c ? ` class="${c}"` : ""}><summary>${q}${ic("chevdown", 16)}</summary><p>${a}</p></details>`).join("")}</div>
</div></section>

<section class="sk-sec sk-alt" id="free-assessment"><div class="sk-wrap sr-book">
  <div><span class="sk-eyebrow">Free assessment</span><h2 class="sk-h2" style="margin-top:10px">Book a free home assessment</h2>
    <p class="muted" style="margin-top:10px">About 45 minutes at your home, with no charge and no obligation.</p>
    <ul class="sr-check">${["We look at the roof, shading and main panel", "Bring your last twelve months of power bills if you can", "You get a written quote within a week", "Prefer to start remotely? Send roof photos and a bill"].map((x) => `<li>${ic("check", 15)}<span>${x}</span></li>`).join("")}</ul></div>
  <form class="card sr-form" aria-label="Book a free assessment">
    <div class="sk-g2"><div class="sk-field"><label for="sr-n">Full name</label><input class="sk-input" id="sr-n" value="Marta Lindqvist"></div><div class="sk-field"><label for="sr-t">Phone</label><input class="sk-input" id="sr-t" value="(555) 017-5512"></div></div>
    <div class="sk-field"><label for="sr-e">Email</label><input class="sk-input" id="sr-e" value="marta@sample.example"></div>
    <div class="sk-field"><label for="sr-a">Home address</label><input class="sk-input" id="sr-a" value="26 Harrier Close, Brackley"></div>
    <div class="sk-g2"><div class="sk-field"><label for="sr-age">Roof age, years</label><select class="sk-input" id="sr-age"><option>Under 10</option><option>10 to 20</option><option>Over 20</option><option>Not sure</option></select></div><div class="sk-field"><label for="sr-b">Add a battery?</label><select class="sk-input" id="sr-b"><option>Maybe</option><option>Yes</option><option>No</option></select></div></div>
    <div class="sk-g2"><div class="sk-field"><label for="sr-own">Do you own the home?</label><select class="sk-input" id="sr-own"><option>Yes</option><option>No, I rent</option></select></div><div class="sk-field"><label for="sr-w">Best time</label><select class="sk-input" id="sr-w"><option>Weekday morning</option><option>Weekday afternoon</option><option>Saturday</option></select></div></div>
    <button class="btn primary sk-btn-lg" type="button">Request my assessment</button>
  </form>
</div></section>
</main>
${K.footer(p, "Home solar and batteries, designed and fitted by a local crew.", [["Solar", ["How solar works", "Batteries", "Timeline", "Warranties"]], ["Company", ["Our crew", "Service area", "Reviews", "Aftercare login"]], ["Contact", ["(555) 016-3390", "hello@sunrake.example", "7 Foundry Lane, Brackley"]]], `Fictional company created for this template. Sample figures only. © 2026 ${p.name}.`)}`, CSS);

module.exports = {
  "solar-website": K.def("solar", "Solar company website",
    "a full solar installer home page: navigation with call and free assessment buttons, a bright hero with a house and panel roofline and an estimator card with postcode, monthly bill, roof type and shading plus a labelled sample estimate of system size and rough cost, five system parts explained in plain words beside a roof diagram, a gantt-style installation timeline from survey through permits and grid approval to install and switch-on, a buying versus financing table, warranties and aftercare, a local installer crew roster, customer reviews, an faq on cloudy days, roof condition and power cuts, a free assessment form and a footer",
    ["navigation-header", "hero", "estimator", "calculator-card", "diagram", "timeline", "gantt", "comparison-table", "warranty", "crew-roster", "reviews", "faq", "lead-form", "footer", "solar"], web),
};
