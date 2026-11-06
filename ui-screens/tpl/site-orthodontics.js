/* Orthodontics website template (Wraybrook Orthodontics, a fictional orthodontic practice). Journey-led, playful but clinical home page:
   a hero set inside a coded dental arch (braces on one side, a clear tray on the other), a road-map treatment journey from free consult to retainers,
   separate paths for parents, teens and adults, a braces vs clear aligners comparison, what the first consultation includes as a 45 minute bar beside
   general treatment length ranges, a payment plan table with sample monthly figures, a loose wire or bracket routing ladder, the orthodontist profile
   and a booking form. No before and after, no brand names, no outcome claims. Teeth are inline SVG in fixed natural tones. */
const { ic, esc } = require("../lib");
const K = require("../sitekit");

const CSS = `<style>
.or>.sk-sec{padding:60px 0}
.or .sk-head{margin-bottom:32px}
.or .sk-head>div:first-child{max-width:720px}
.or-hero{overflow:hidden;border-bottom:1px solid var(--border);background:color-mix(in oklab,var(--accent) 7%,var(--bg))}
.or-hero .sk-wrap{position:relative;min-height:690px}
.or-arch{position:absolute;left:48px;top:18px;width:calc(100% - 96px);height:auto;display:block}
.or-el1{stroke:var(--primary)}.or-el2{stroke:var(--accent)}
.or-htext{position:relative;max-width:580px;margin:0 auto;padding:186px 0 40px;display:grid;gap:16px;justify-items:center;text-align:center}
.or-h1{font-size:calc(52px * var(--hs));line-height:1.04}
.or-htext .sk-lede{font-size:17px}
.or-key{display:flex;flex-wrap:wrap;justify-content:center;gap:6px 20px;font-size:13px;font-weight:600}
.or-key span{display:inline-flex;align-items:center;gap:7px}
.or-key i{width:12px;height:12px;border-radius:3px;background:#8f9aa3}
.or-key i.t{background:#a9dbe8;border:1px solid #6fb2c6}
.or-road{background:var(--primary);color:var(--on-primary)}
.or-road .sk-eyebrow{color:inherit}
.or-road .or-sub{opacity:.86;max-width:400px}
.or-wave{display:block;width:100%;height:auto;margin-bottom:10px}
.or-wave path{fill:none;stroke:var(--on-primary);stroke-width:4;stroke-dasharray:3 13;stroke-linecap:round}
.or-wave circle{fill:var(--on-primary)}
.or-wave text{fill:var(--primary);font:700 20px var(--font-b)}
.or-stops{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:20px}
.or-stop{display:grid;gap:8px;align-content:start;font-size:14px}
.or-n{display:none}
.or-stop h3{font-size:calc(23px * var(--hs));line-height:1.15}
.or-stop .num{font-size:13px;opacity:.9}
.or-stop p{line-height:1.5;opacity:.95}
.or-out{margin-top:4px;padding-top:10px;border-top:1px dashed color-mix(in oklab,var(--on-primary) 50%,transparent);font-weight:600;font-size:13px}
.or-paths{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:22px}
.or-path{padding:26px;display:flex;flex-direction:column;gap:10px}
.or-path h3{font-size:calc(25px * var(--hs));line-height:1.15}
.or-path>p{font-size:14.5px;color:var(--muted)}
.or-q{list-style:none;display:grid;gap:7px;padding-top:12px;margin-top:2px;border-top:1px solid var(--border);font-size:14px}
.or-q b{font-size:12px;letter-spacing:.04em;color:var(--muted)}
.or-q li{display:grid;grid-template-columns:18px minmax(0,1fr);gap:8px}
.or-q svg{margin-top:3px;color:color-mix(in oklab,var(--primary) 80%,var(--text))}
.or-swatch{display:flex;gap:6px;align-items:center;font-size:13px;color:var(--muted)}
.or-swatch i{width:18px;height:18px;border-radius:50%;border:4px solid var(--c);background:var(--surface)}
.or-path a{margin-top:auto;padding-top:8px;font-weight:600;display:inline-flex;gap:6px;align-items:center;font-size:14px}
.or-cmp{width:100%;border-collapse:collapse;table-layout:fixed}
.or-cmp th,.or-cmp td{padding:15px 22px;text-align:left;vertical-align:top;border-bottom:1px solid var(--border);font-size:14.5px}
.or-cmp thead th{padding:18px 22px;vertical-align:bottom}
.or-cmp thead h3{font-size:calc(25px * var(--hs));line-height:1.1;margin-top:10px}
.or-cmp th[scope=row]{width:18%;font:600 14px var(--font-b);letter-spacing:0;padding-left:0}
.or-cmp tbody tr:last-child>*{border-bottom:0}
.or-cmp td+td,.or-cmp thead th+th+th{border-left:1px solid var(--border)}
.or-cmp td{color:var(--muted)}
.or-cmp td b{display:block;color:var(--text);font-weight:600}
.or-row{display:block;width:100%;max-width:300px;height:auto}
.or-call{margin-top:18px;font-size:14px;color:var(--muted);display:flex;gap:10px;align-items:flex-start}
.or-call svg{flex:0 0 auto;margin-top:3px}
.or-two{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:64px;align-items:start}
.or-two h2{margin:12px 0 10px}
.or-bar{display:flex;gap:3px;margin:20px 0 6px;height:30px}
.or-bar span{display:grid;place-items:center;font:600 12px var(--font-b);border-radius:var(--radius-sm);background:color-mix(in oklab,var(--primary) var(--m),var(--surface));color:var(--text)}
.or-mins{display:flex;justify-content:space-between;font-size:12px;color:var(--muted);margin-bottom:12px}
.or-parts{list-style:none;display:grid}
.or-parts li{display:grid;grid-template-columns:58px minmax(0,1fr);gap:12px;padding:11px 0;border-bottom:1px solid var(--border);font-size:14.5px}
.or-parts .num{font-size:14px}
.or-parts span{color:var(--muted)}
.or-parts b{color:var(--text);display:block;font-weight:600}
.or-len{display:grid;gap:15px;margin-top:20px}
.or-lrow{display:grid;gap:5px}
.or-lhead{display:flex;justify-content:space-between;gap:12px;font-size:14px;font-weight:600}
.or-lhead span{font-weight:500;color:var(--muted);white-space:nowrap}
.or-ltrack{position:relative;height:16px;border-radius:999px;background:color-mix(in oklab,var(--text) 8%,var(--surface));overflow:hidden}
.or-ltrack i{position:absolute;top:0;bottom:0;border-radius:999px;background:var(--primary)}
.or-ltrack i.f{background:linear-gradient(90deg,var(--primary),color-mix(in oklab,var(--primary) 12%,var(--surface)))}
.or-axis{display:flex;justify-content:space-between;font-size:12px;color:var(--muted)}
.or-conf{margin-top:18px;padding:14px 16px;border-radius:var(--radius);background:color-mix(in oklab,var(--primary) 11%,var(--surface));font-size:14px;font-weight:500}
.or-pay{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(0,1fr);gap:44px;align-items:start}
.or-fees{padding:0;overflow:hidden}
.or-fees table{width:100%;border-collapse:collapse;font-size:14.5px}
.or-fees th,.or-fees td{padding:13px 20px;border-bottom:1px solid var(--border);text-align:right}
.or-fees th:first-child,.or-fees td:first-child{text-align:left}
.or-fees th{font-size:12px;letter-spacing:.04em;font-weight:600;color:var(--muted);background:color-mix(in oklab,var(--primary) 6%,var(--surface))}
.or-fees td.num{font-size:16px;white-space:nowrap}
.or-fees .sum td{background:color-mix(in oklab,var(--primary) 9%,var(--surface));font-weight:600}
.or-fees .or-fnote{font-size:13px;padding:13px 20px;border-top:1px solid var(--border)}
.or-fees tr:last-child td{border-bottom:0}
.or-inc{list-style:none;display:grid;gap:0;margin-top:6px}
.or-inc li{display:grid;grid-template-columns:24px minmax(0,1fr);gap:10px;padding:11px 0;border-bottom:1px solid var(--border);font-size:15px}
.or-inc svg{color:var(--success);margin-top:3px}
.or-help{background:color-mix(in oklab,var(--warning) 11%,var(--bg));border-block:1px solid var(--border)}
.or-help .sk-wrap{display:grid;grid-template-columns:minmax(0,.8fr) minmax(0,1.6fr);gap:40px;align-items:center}
.or-help h2{font-size:calc(32px * var(--hs));line-height:1.1}
.or-ladder{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
.or-ladder article{padding:18px;display:grid;gap:6px;align-content:start;font-size:14px}
.or-ladder b{font-size:15px}
.or-ladder p{color:var(--muted)}
.or-meet{display:grid;grid-template-columns:minmax(0,.95fr) minmax(0,1.05fr);gap:56px;align-items:start}
.or-prof{display:grid;gap:14px}
.or-phead{display:grid;grid-template-columns:132px minmax(0,1fr);gap:20px;align-items:center}
.or-phead .sk-photo{aspect-ratio:1/1;border-radius:50%}
.or-train{list-style:none;display:grid;gap:7px;font-size:14.5px}
.or-train li{display:flex;gap:10px;align-items:flex-start}
.or-train svg{flex:0 0 auto;margin-top:3px;color:color-mix(in oklab,var(--primary) 80%,var(--text))}
.or-slot{padding:13px 16px;border:2px dashed var(--border);border-radius:var(--radius);font-size:14px;font-weight:500;color:var(--muted);display:flex;gap:10px;align-items:center}
.or-slot svg{flex:0 0 auto}
.or-form{padding:30px;display:grid;gap:14px}
.or-form .sk-g2{gap:14px}
.or-radio{display:flex;flex-wrap:wrap;gap:8px}
.or-radio label{min-height:40px;padding:6px 14px;border:1px solid var(--border);border-radius:var(--radius);display:inline-flex;align-items:center;gap:8px;font-size:14px;font-weight:500;background:var(--bg)}
.or-radio label.on{border-color:var(--primary);box-shadow:inset 0 0 0 1px var(--primary)}
@media (max-width:1180px){
  .sk-links a,.sk-nav .logo{white-space:nowrap}
  .sk-navend .btn:not(.primary){display:none}
  .or-hero .sk-wrap{min-height:0;padding-top:24px}
  .or-arch{position:static;width:100%;max-width:520px;margin:0 auto}
  .or-htext{padding:20px 0 48px}
}
@media (max-width:1024px){
  .or-wave{display:none}
  .or-n{display:grid;place-items:center;width:34px;height:34px;border-radius:50%;background:var(--on-primary);color:var(--primary);font:700 15px var(--font-b)}
  .or-stops{grid-template-columns:repeat(2,minmax(0,1fr));gap:28px}
  .or-paths{grid-template-columns:minmax(0,1fr)}
  .or-two,.or-pay,.or-meet,.or-help .sk-wrap{grid-template-columns:minmax(0,1fr);gap:32px}
}
@media (max-width:760px){
  .or>.sk-sec{padding:40px 0}
  .sk-foot-grid{grid-template-columns:minmax(0,1fr) minmax(0,1.25fr);gap:28px 16px}
  .sk-foot li{font-size:13.5px}
  .or .sk-head{margin-bottom:20px}
  .or .sk-head>p{display:none}
  .or-hero .sk-wrap{padding-top:16px}
  .or-arch{max-width:300px}
  .or-htext{padding:14px 0 34px;gap:12px}
  .or-h1{font-size:calc(38px * var(--hs))}
  .or-htext .sk-lede{font-size:15.5px}
  .or-stops{grid-template-columns:minmax(0,1fr);gap:0;position:relative}
  .or-stop{grid-template-columns:34px minmax(0,1fr);gap:3px 14px;padding-bottom:14px}
  .or-out{display:none}
  .or-stop>:not(.or-n){grid-column:2}
  .or-stop .or-n{grid-row:1/3}
  .or-paths{display:flex;gap:14px}
  .or-path{padding:22px}
  .or-cmp,.or-cmp tbody,.or-cmp tr{display:block;width:100%}
  .or-cmp thead{display:block}
  .or-cmp thead tr{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
  .or-cmp thead th{display:block;padding:0 0 12px;border-bottom:2px solid var(--text)}
  .or-cmp thead th:first-child{display:none}
  .or-cmp thead th+th+th{border-left:0}
  .or-cmp thead h3{font-size:calc(19px * var(--hs))}
  .or-cmp tbody tr{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 10px;padding:12px 0;border-bottom:1px solid var(--border)}
  .or-cmp tbody tr:last-child{border-bottom:0}
  .or-cmp th[scope=row]{grid-column:1/-1;width:auto;padding:0 0 4px;border:0;display:block}
  .or-cmp td{display:block;padding:0;border:0;font-size:13px;line-height:1.45;overflow-wrap:anywhere}
  .or-cmp td+td{border-left:0}
  .or-two,.or-pay,.or-meet{gap:26px}
  .or-parts li{grid-template-columns:48px minmax(0,1fr);padding:8px 0}
  .or-parts .d{display:none}
  .or-fees th,.or-fees td{padding:11px 12px}
  .or-fees td.num{font-size:14px}
  .or-ladder{grid-template-columns:minmax(0,1fr);gap:10px}
  .or-ladder article{padding:15px}
  .or-phead{grid-template-columns:84px minmax(0,1fr);gap:14px}
  .or-form{padding:20px}
  .or-form>p,.or-form>.sk-g2:nth-of-type(n+3){display:none}
}
</style>`;

// ---- illustrations -------------------------------------------------------------------------------------------------
const TOOTH_D = "M12 2.500c-1.800 0-2.900 1-4.800 1C5.400 3.500 3.700 2.800 2.800 4.400 1.500 6.700 3 10 3.600 13c.5 2.500.7 8.500 3 8.500 2.100 0 1.800-6 5.400-6s3.300 6 5.400 6c2.300 0 2.500-6 3-8.500.6-3 2.100-6.300.8-8.600-.9-1.600-2.600-.9-4.400-.9-1.900 0-3-1-4.800-1z";
const tooth = (s) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" aria-hidden="true"><path d="${TOOTH_D}" fill="currentColor"/></svg>`;

// The hero arch: teeth walked along an ellipse by arc length, brackets and wire on the left half, a clear tray over the right half.
const archSvg = () => {
  const W = 1104, cx = W / 2, A = 486, B = 470, top = 62, n = 20, pts = [];
  for (let t = -95; t <= 95; t += .25) { const r = t * Math.PI / 180; pts.push([cx + A * Math.sin(r), top + B * (1 - Math.cos(r))]); }
  const cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const L = cum[cum.length - 1], tw = L / n - 7, f = (v) => v.toFixed(1);
  const at = (d) => { const i = Math.max(1, Math.min(pts.length - 2, cum.findIndex((c) => c >= d))); return { x: pts[i][0], y: pts[i][1], r: Math.atan2(pts[i + 1][1] - pts[i - 1][1], pts[i + 1][0] - pts[i - 1][0]) * 180 / Math.PI }; };
  const line = (a, b) => "M" + pts.slice(a, b).filter((_, i) => i % 6 === 0).map(([x, y]) => `${f(x)} ${f(y)}`).join("L");
  const mid = Math.floor(pts.length / 2);
  const ts = Array.from({ length: n }, (_, i) => at(L * (i + .5) / n));
  const tr = (t) => `transform="translate(${f(t.x)} ${f(t.y)}) rotate(${f(t.r)})"`;
  return `<svg class="or-arch" viewBox="0 0 ${W} 650" role="img" aria-label="A top-down arch of twenty teeth, with brackets and a wire on the left side and a clear aligner tray over the right side">
<path d="${line(0, pts.length)}" fill="none" stroke="#efb7ae" stroke-width="124" stroke-linecap="round"/><path d="${line(0, pts.length)}" fill="none" stroke="#e6a59c" stroke-width="124" stroke-linecap="round" stroke-dasharray="1 40" opacity=".35"/>
${ts.map((t) => `<rect ${tr(t)} x="${f(-tw / 2)}" y="-45" width="${f(tw)}" height="90" rx="30" fill="#fbf7ee" stroke="#dacfba" stroke-width="3"/>`).join("")}
<path d="${line(0, mid + 4)}" fill="none" stroke="#7d8790" stroke-width="5"/>
${ts.slice(0, n / 2).map((t, i) => `<g ${tr(t)}><rect x="-17" y="-17" width="34" height="34" rx="9" fill="none" class="or-el${i % 2 + 1}" stroke-width="6"/><rect x="-11" y="-11" width="22" height="22" rx="4" fill="#9aa4ab"/></g>`).join("")}
<path d="${line(mid - 3, pts.length)}" fill="none" stroke="#6fb2c6" stroke-width="104" stroke-linecap="round" opacity=".55"/><path d="${line(mid - 3, pts.length)}" fill="none" stroke="#eaf8fb" stroke-width="97" stroke-linecap="round" opacity=".5"/></svg>`;
};

// A short row of front teeth used at the head of the comparison table.
const toothRow = (kind) => `<svg class="or-row" viewBox="0 0 300 88" role="img" aria-label="Row of six front teeth with ${kind === "braces" ? "brackets and a wire" : "a clear aligner tray over them"}"><rect width="300" height="30" rx="12" fill="#efb7ae"/>
${[0, 1, 2, 3, 4, 5].map((i) => `<path d="M${6 + i * 48} 14h44c2 0 4 2 4 4l-3 50c0 8-8 14-22 14s-22-6-22-14l-3-50c0-2 2-4 4-4z" fill="#fbf7ee" stroke="#dacfba" stroke-width="2.500"/>`).join("")}
${kind === "braces" ? `<path d="M6 50h288" stroke="#7d8790" stroke-width="3"/>${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="${19 + i * 48}" y="39" width="22" height="22" rx="6" fill="none" class="or-el${i % 2 + 1}" stroke-width="4"/><rect x="${23 + i * 48}" y="43" width="14" height="14" rx="3" fill="#9aa4ab"/>`).join("")}` : `<path d="M2 12h296l-3 60c-1 8-8 14-16 14H21c-8 0-15-6-16-14z" fill="#a9dbe8" fill-opacity=".35" stroke="#6fb2c6" stroke-width="2.500"/>`}</svg>`;

const portrait = () => `<svg viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Portrait illustration of the orthodontist in a clinic top"><rect width="200" height="200" fill="#dbe5e3"/><path d="M26 200c4-48 34-66 74-66s70 18 74 66z" fill="#5f8f99"/><path d="M84 138l16 30 16-30z" fill="#f4f4f0"/><rect x="86" y="106" width="28" height="36" fill="#c9966f"/><ellipse cx="100" cy="82" rx="36" ry="42" fill="#c9966f"/><path d="M62 88c-4-44 18-60 40-60s42 16 36 60c-4-22-22-34-38-34s-34 12-38 34z" fill="#2c211a"/></svg>`;

// ---- content -------------------------------------------------------------------------------------------------------
const STOPS = [
  ["Free consult", "45 min, no charge", "Meet the orthodontist, talk about what you would like to change, and hear whether treatment makes sense now.", "Leave with: go, wait or no need"],
  ["Records and scan", "30 min", "A 3D mouth scan, photos and X-rays give the orthodontist what they need to plan.", "Leave with: full records on file"],
  ["Your plan", "20 min", "We walk through the options on screen, how long each may take, and what it costs.", "Leave with: a written plan and quote"],
  ["Active treatment", "A visit every 6 to 12 weeks", "Braces go on or aligners start. Regular visits to adjust, check and hand over what comes next.", "Leave with: your next date booked"],
  ["Retainers", "Long term", "Retainers are worn after active treatment. We review them with you over the first year.", "Leave with: retainers and a review plan"],
];
const PATHS = [
  ["For parents of children", "Your child", "Many orthodontists like a first look at around age 7, while baby and adult teeth are both there. Often the answer is to wait, and we will say so.",
    ["Is it too early?", "Will any teeth need to come out?", "Do you talk to our family dentist?"], "Book a check for my child", ""],
  ["For teens", "You, at school", "Early and after-school visits, and help working treatment around sports, music and exams. Parents are welcome, and so is coming on your own.",
    ["Can I still play my instrument?", "What can’t I eat with braces?", "Can I choose my colors?"], "Book a consult", `<div class="or-swatch">${["--primary", "--accent", "--success", "--warning"].map((c) => `<i style="--c:var(${c})"></i>`).join("")}<span>New elastic colors each visit</span></div>`],
  ["For adults", "You, at any stage", "A first orthodontic visit, or teeth that moved after braces years ago. We check with your dentist that gums and dental work are ready first.",
    ["Am I too old for this?", "Will people notice at work?", "What about crowns and bridges?"], "Book an adult consult", ""],
];
const CMP = [
  ["Appearance", "Small brackets on the teeth, joined by a wire. Metal or tooth-colored, with colored elastics if you like.", "Thin clear trays that fit over the teeth. Small tooth-colored attachments are sometimes added."],
  ["Removable or not", "Fixed. They stay on until the orthodontist takes them off.", "Removable. Out to eat and brush, then back in for most of the day."],
  ["Cleaning", "Brushing around brackets and flossing under the wire. We show you how and give you a small brush kit.", "Brushing and flossing as usual, plus cleaning the trays the way we show you."],
  ["Visits", "An adjustment visit about every 6 to 10 weeks.", "A check about every 8 to 12 weeks. You change trays at home between visits."],
  ["Typical uses", "Used across a wide range of bites, and often for children and teens.", "Often used for teens and adults who can keep trays in as planned. Not every bite suits them."],
];
const CONSULT = [["0 min", "Hello and your goals", "What you would like to change, and any dental history."], ["10 min", "A look at teeth and bite", "The orthodontist checks your teeth, bite and jaw."], ["25 min", "Options and rough timing", "Braces, aligners, or waiting, in plain words."], ["40 min", "Questions and next steps", "No pressure to decide on the day."]];
const LEN = [["Early treatment for younger children", "6 to 12 months", 6, 12], ["Braces", "12 to 30 months", 12, 30], ["Clear aligners", "6 to 24 months", 6, 24]];
const PAY = [["Sample fee", "$4,800", "$5,400"], ["Start payment", "$600", "$600"], ["12 months", "$350 / mo", "$400 / mo"], ["24 months", "$175 / mo", "$200 / mo"], ["30 months", "$140 / mo", "$160 / mo"]];
const INC = ["All planned visits during active treatment", "Repairs for loose brackets or wires", "One set of retainers", "Retainer reviews for the first year", "No interest on in-house plans"];
const LADDER = [
  ["During opening hours", "Call (555) 013-3070. We will tell you whether it can wait for your next visit or needs a repair slot, often the same week."],
  ["When we are closed", "Leave a message or send a photo through the patient portal. We reply the next working morning."],
  ["If it cannot wait", "Anything that feels life threatening or cannot wait: in an emergency, call your local emergency number."],
];

const web = (p, st) => K.page(st, `${K.nav(p, ["Journey", "Who we see", "Compare", "Costs", "Loose wire?"], "Book a free consult", "Call (555) 013-3070")}
<main class="or">
<section class="or-hero" id="top"><div class="sk-wrap">
  ${archSvg()}
  <div class="or-htext">
    <span class="sk-eyebrow">Children, teens and adults</span>
    <h1 class="or-h1">Braces or aligners? Let’s take a look.</h1>
    <p class="sk-lede">${esc(p.name)} starts everyone with a free consult, then maps out each step from your first scan to your last retainer check.</p>
    <div class="sk-row" style="justify-content:center"><a class="btn primary sk-btn-lg" href="#book-a-free-consult">Book a free consult</a><a class="btn sk-btn-lg" href="#journey">See the journey</a></div>
    <div class="or-key"><span><i></i>Braces, left</span><span><i class="t"></i>Clear tray, right</span></div>
  </div>
</div></section>

<section class="sk-sec or-road" id="journey"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">The treatment journey</span><h2 class="sk-h2">Five stops, from hello to retainers</h2></div><p class="or-sub">You always know where you are, what comes next, and who to ask.</p></div>
  <svg class="or-wave" viewBox="0 0 1104 110" aria-hidden="true"><path d="M26 30C110 30 170 80 251 80S390 30 476 30 620 80 701 80 840 30 926 30 1040 60 1104 60"/>${[[26, 30], [251, 80], [476, 30], [701, 80], [926, 30]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="24"/><text x="${x}" y="${y + 7}" text-anchor="middle">${i + 1}</text>`).join("")}</svg>
  <div class="or-stops">${STOPS.map(([t, w, d, o], i) => `<article class="or-stop"><span class="or-n">${i + 1}</span><h3>${t}</h3><span class="num">${w}</span><p>${d}</p><div class="or-out">${o}</div></article>`).join("")}</div>
</div></section>

<section class="sk-sec" id="who-we-see"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">Who we see</span><h2 class="sk-h2">Three different starting points</h2></div><p class="muted" style="max-width:380px">The questions change with age, so the first conversation does too.</p></div>
  <div class="or-paths sk-rail">${PATHS.map(([b, t, d, q, c, x]) => `<article class="card or-path"><span class="sk-eyebrow">${b}</span><h3>${t}</h3><p>${d}</p>${x}<ul class="or-q"><b>Questions we hear</b>${q.map((v) => `<li>${tooth(14)}<span>${v}</span></li>`).join("")}</ul><a href="#book-a-free-consult">${c} ${ic("arrow", 15)}</a></article>`).join("")}</div>
</div></section>

<section class="sk-sec sk-alt" id="compare"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">Compare</span><h2 class="sk-h2">Braces and clear aligners, side by side</h2></div></div>
  <table class="or-cmp"><thead><tr><th></th><th scope="col">${toothRow("braces")}<h3>Braces</h3></th><th scope="col">${toothRow("trays")}<h3>Clear aligners</h3></th></tr></thead>
  <tbody>${CMP.map(([r, a, b]) => `<tr><th scope="row">${r}</th><td>${a}</td><td>${b}</td></tr>`).join("")}</tbody></table>
  <p class="or-call">${ic("eye", 16)}<span>Which one suits a bite is a clinical decision. The orthodontist will talk through both at your consult.</span></p>
</div></section>

<section class="sk-sec" id="consult"><div class="sk-wrap or-two">
  <div><span class="sk-eyebrow">The first consultation</span><h2 class="sk-h2">What 45 free minutes includes</h2>
    <div class="or-bar" role="img" aria-label="A bar split into 10, 15, 15 and 5 minute parts">${[[10, "22%", "10"], [15, "38%", "15"], [15, "54%", "15"], [5, "30%", "5"]].map(([g, m, l]) => `<span style="flex:${g} 1 0;--m:${m}">${l}</span>`).join("")}</div>
    <ul class="or-parts">${CONSULT.map(([m, t, d]) => `<li><span class="num">${m}</span><span><b>${t}</b><span class="d">${d}</span></span></li>`).join("")}</ul></div>
  <div><span class="sk-eyebrow">How long it usually takes</span><h2 class="sk-h2">General ranges, not a promise</h2>
    <div class="or-len">${LEN.map(([t, r, a, b]) => `<div class="or-lrow"><div class="or-lhead">${t}<span>${r}</span></div><div class="or-ltrack"><i style="left:${(a / 36 * 100).toFixed(1)}%;width:${((b - a) / 36 * 100).toFixed(1)}%"></i></div></div>`).join("")}
      <div class="or-lrow"><div class="or-lhead">Retainers<span>After active treatment, long term</span></div><div class="or-ltrack"><i class="f" style="left:0;width:100%"></i></div></div>
      <div class="or-axis"><span>0</span><span>12 months</span><span>24 months</span><span>36 months</span></div></div>
    <p class="or-conf">Every mouth is different. The orthodontist confirms your plan and timing at consultation.</p></div>
</div></section>

<section class="sk-sec sk-alt" id="costs"><div class="sk-wrap or-pay">
  <div class="card or-fees"><table><thead><tr><th>Sample payment plans</th><th>Braces</th><th>Clear aligners</th></tr></thead><tbody>${PAY.map(([t, a, b], i) => `<tr class="${i === 0 ? "sum" : ""}"><td>${t}</td><td class="num">${a}</td><td class="num">${b}</td></tr>`).join("")}</tbody></table><p class="muted or-fnote">Sample figures only. Your written quote follows your records visit.</p></div>
  <div><span class="sk-eyebrow">Costs and payment plans</span><h2 class="sk-h2" style="margin:12px 0 8px">Spread it out, month by month</h2>
    <ul class="or-inc">${INC.map((t) => `<li>${ic("check", 17)}<span>${t}</span></li>`).join("")}</ul></div>
</div></section>

<section class="sk-sec sk-tight or-help" id="loose-wire"><div class="sk-wrap">
  <div><span class="sk-eyebrow">Loose wire or bracket?</span><h2 style="margin-top:10px">It happens. Here’s who to call</h2></div>
  <div class="or-ladder">${LADDER.map(([t, d]) => `<article class="card"><b>${t}</b><p>${d}</p></article>`).join("")}</div>
</div></section>

<section class="sk-sec" id="book-a-free-consult"><div class="sk-wrap or-meet">
  <div class="or-prof"><span class="sk-eyebrow">Your orthodontist</span>
    <div class="or-phead"><div class="sk-photo">${portrait()}</div><div><h2 class="sk-h2" style="font-size:calc(30px * var(--hs))">Dr Hana Tellwright</h2><div class="muted">Orthodontist, sees every patient at each stage</div></div></div>
    <p class="muted">Hana plans every treatment herself. Her patients range from first-look seven year olds to adults coming back after braces years ago.</p>
    <ul class="or-train"><li>${ic("check", 16)}Dental degree and general practice experience</li><li>${ic("check", 16)}Specialist training in orthodontics</li><li>${ic("check", 16)}Further training in growing children’s bites</li></ul>
    <div class="or-slot">${ic("plus", 16)}<span>Add your registration and accreditation details here</span></div>
    <p class="muted" style="font-size:14px">Mon to Thu 8:00 AM to 6:00 PM, Fri 8:00 AM to 2:00 PM, first Saturday of each month.</p></div>
  <form class="card or-form" aria-label="Book a free consult">
    <h2 class="sk-h3" style="font-size:calc(26px * var(--hs))">Book a free consult</h2>
    <p class="muted" style="font-size:14px">No referral needed. We will call to confirm a time.</p>
    <div class="sk-field"><span style="font-weight:500;font-size:13px">This is for</span><div class="or-radio"><label class="on"><input type="radio" name="or-who" checked> My child</label><label><input type="radio" name="or-who"> My teen</label><label><input type="radio" name="or-who"> Me</label></div></div>
    <div class="sk-g2"><div class="sk-field"><label for="or-name">Patient’s name</label><input class="sk-input" id="or-name" value="Sam Achebe"></div><div class="sk-field"><label for="or-age">Patient’s age</label><input class="sk-input" id="or-age" value="11"></div></div>
    <div class="sk-g2"><div class="sk-field"><label for="or-contact">Your name</label><input class="sk-input" id="or-contact" value="Priya Achebe"></div><div class="sk-field"><label for="or-phone">Mobile</label><input class="sk-input" id="or-phone" value="(555) 013-6652"></div></div>
    <div class="sk-g2"><div class="sk-field"><label for="or-int">Interested in</label><select class="sk-input" id="or-int"><option>Not sure yet</option><option>Braces</option><option>Clear aligners</option><option>A second opinion</option></select></div><div class="sk-field"><label for="or-den">Family dentist, if any</label><input class="sk-input" id="or-den" value="Dr Ansel Kirrin"></div></div>
    <button class="btn primary sk-btn-lg" type="button">Request my consult</button>
  </form>
</div></section>
</main>
${K.footer(p, "Orthodontic care for children, teens and adults on Beckwith Lane. In an emergency, call your local emergency number.", [["Visit", ["62 Beckwith Lane", "Parking behind the practice", "Step-free entrance"]], ["Contact", ["(555) 013-3070", "hello@wraybrook.example", "Patient portal"]], ["Treatment", ["Braces", "Clear aligners", "Retainers"]]], "Fictional practice created for this template. General information only, not medical advice.")}`, CSS);

module.exports = {
  "orthodontics-website": K.def("ortho", "Orthodontics website",
    "a journey-led orthodontic practice home page: navigation with call and book buttons, a centred hero set inside a coded top-down dental arch with brackets on one side and a clear tray on the other, a treatment journey map as a dotted road from free consult through records and scan, plan and active treatment to retainers, separate paths for parents of children, teens and adults with the questions each asks, a braces vs clear aligners comparison table with tooth row illustrations across appearance, removable or not, cleaning, visits and typical uses, what the first consultation includes as a 45 minute bar beside general treatment length ranges, a payment plan table with sample monthly figures and what is included, a loose wire or bracket routing ladder, the orthodontist profile with a marked credentials slot beside a booking form, and a footer",
    ["navigation-header", "hero", "svg-illustration", "journey-map", "timeline", "audience-routes", "faq-list", "comparison-table", "time-bar", "range-chart", "payment-plans", "pricing-table", "emergency-notice", "profile", "credentials-slot", "booking-form", "footer", "orthodontics"], web),
};
