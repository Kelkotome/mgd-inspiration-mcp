/* Physical therapy clinic website template (Kestrelgate Physio, fictional physio and sports rehab clinic). Full responsive home page:
   nav, a full-colour hero block with a runner, a "Where does it hurt?" front and back body map with hotspots that link to conditions
   by area, a stepped rehab timeline for a first course of care, a programmes bento, a no-referral note, a weekly class timetable,
   session prices beside what to wear, clinician cards with focus areas and a credentials slot, the clinic location and a booking form.
   Everything in the SVGs is coloured through theme variables. No outcome claims, no reviews, no recovery times. */
const { ic, esc } = require("../lib");
const K = require("../sitekit");

const CSS = `<style>
.kp>.sk-sec{padding:60px 0}
.kp h1,.kp h2{text-wrap:balance}
.kp-hero{padding:20px 20px 0}
.kp-block{position:relative;overflow:hidden;border-radius:var(--radius-lg);background:var(--primary);color:var(--on-primary);background-image:repeating-linear-gradient(115deg,transparent 0 46px,color-mix(in oklab,var(--on-primary) 7%,transparent) 46px 92px)}
.kp-block .sk-wrap{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);gap:24px;align-items:center;padding-top:60px;padding-bottom:40px}
.kp-block h1{font-size:calc(68px * var(--hs));line-height:1}
.kp-block .sk-eyebrow{color:var(--on-primary)}
.kp-block .sk-lede{color:color-mix(in oklab,var(--on-primary) 86%,var(--primary))}
.kp-run{display:block;width:100%;height:auto;max-height:380px}
.kp-run .a{stroke:var(--on-primary);fill:none;stroke-linecap:round;stroke-linejoin:round}
.kp-run circle{fill:var(--on-primary)}
.kp-run .s{stroke:color-mix(in oklab,var(--on-primary) 46%,var(--primary));fill:none;stroke-linecap:round;stroke-width:6}
.kp-inv{background:var(--on-primary)!important;color:var(--primary)!important;border-color:var(--on-primary)!important;box-shadow:none!important}
.kp-ghost{background:transparent!important;color:var(--on-primary)!important;border-color:color-mix(in oklab,var(--on-primary) 60%,var(--primary))!important;box-shadow:none!important}
.kp-facts{grid-column:1/-1;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px;padding-top:20px;margin-top:8px;border-top:1px solid color-mix(in oklab,var(--on-primary) 34%,var(--primary));font-size:14px}
.kp-facts .num{display:block;font-size:30px;margin-bottom:2px}
.kp-map{display:grid;grid-template-columns:minmax(0,.92fr) minmax(0,1.08fr);gap:48px;align-items:center}
.kp-body{display:block;width:100%;height:auto}
.kp-body .f{fill:color-mix(in oklab,var(--primary) 22%,var(--surface))}
.kp-body .l{stroke:color-mix(in oklab,var(--primary) 22%,var(--surface));fill:none;stroke-linecap:round}
.kp-body .sp{stroke:color-mix(in oklab,var(--primary) 46%,var(--surface));fill:none;stroke-linecap:round;stroke-width:2}
.kp-body .lead{stroke:var(--primary);stroke-width:1.5}
.kp-body .ring{fill:var(--primary);opacity:.22}
.kp-body .dot{fill:var(--primary)}
.kp-body .tag{fill:var(--primary);rx:var(--radius-sm)}
.kp-body text{font:700 15px var(--font-b);fill:var(--on-primary);text-anchor:middle}
.kp-body text.cap{font-size:13px;font-weight:600;fill:var(--muted)}
.kp-areas{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
.kp-area{padding:18px 20px;display:grid;gap:6px;align-content:start}
.kp-area:target{outline:2px solid var(--primary);outline-offset:2px}
.kp-area h3{display:flex;justify-content:space-between;align-items:center;font-size:calc(20px * var(--hs))}
.kp-area ul{list-style:none;display:grid;gap:3px;font-size:14px;line-height:1.4;color:var(--muted)}
.kp-stair{list-style:none;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px;align-items:end}
.kp-stair li{display:grid;gap:6px;align-content:start;padding:18px 16px;border-radius:var(--radius);color:var(--text)}
.kp-stair li:nth-child(1){min-height:214px;background:color-mix(in oklab,var(--primary) 10%,var(--bg))}
.kp-stair li:nth-child(2){min-height:246px;background:color-mix(in oklab,var(--primary) 16%,var(--bg))}
.kp-stair li:nth-child(3){min-height:280px;background:color-mix(in oklab,var(--primary) 23%,var(--bg))}
.kp-stair li:nth-child(4){min-height:312px;background:color-mix(in oklab,var(--primary) 30%,var(--bg))}
.kp-stair li:nth-child(5){min-height:344px;background:var(--primary);color:var(--on-primary)}
.kp-stair .num{font-size:13px;opacity:.75}
.kp-stair h3{font-size:calc(20px * var(--hs))}
.kp-stair p{font-size:14px;line-height:1.45}
.kp-stair small{font-size:12.5px;font-weight:600}
.kp-bento{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}
.kp-prog{padding:20px;display:grid;gap:6px;align-content:start}
.kp-prog h3{font-size:calc(20px * var(--hs))}
.kp-prog p{font-size:14px;line-height:1.45;color:var(--muted)}
.kp-ico{width:38px;height:38px;border-radius:var(--radius);display:grid;place-items:center;background:color-mix(in oklab,var(--primary) 14%,var(--bg));color:color-mix(in oklab,var(--primary) 80%,var(--text))}
.kp-prog.feat{grid-column:span 2;grid-row:span 2;background:var(--text);color:var(--bg);border-color:var(--text);padding:28px;gap:10px;align-content:space-between}
.kp-prog.feat p,.kp-prog.feat li{color:color-mix(in oklab,var(--bg) 78%,var(--text))}
.kp-prog.feat h3{font-size:calc(30px * var(--hs))}
.kp-prog.feat .kp-ico{background:color-mix(in oklab,var(--bg) 16%,var(--text));color:var(--bg)}
.kp-prog.feat ul{list-style:none;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px 18px;font-size:14px}
.kp-prog.feat li{display:flex;gap:8px;align-items:center}
.kp-noref{display:grid;grid-template-columns:44px minmax(0,1fr) auto;gap:18px;align-items:center;padding:18px 24px;margin-top:14px;border:1.5px solid var(--primary);border-radius:var(--radius-lg);background:color-mix(in oklab,var(--primary) 8%,var(--bg))}
.kp-noref p{font-size:14px;line-height:1.5;color:var(--muted)}
.kp-noref b{display:block;font-size:16px;color:var(--text)}
.kp-tt{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:10px}
.kp-day{display:grid;gap:8px;align-content:start}
.kp-day>b{font:600 13px var(--font-b);letter-spacing:.05em;text-transform:uppercase;padding-bottom:6px;border-bottom:2px solid var(--text)}
.kp-cls{padding:9px 10px;border-radius:var(--radius-sm);background:var(--surface);border:1px solid var(--border);border-left:4px solid var(--primary);display:grid;gap:1px;font-size:13px;line-height:1.3}
.kp-cls.b{border-left-color:var(--accent)}
.kp-cls .num{font-size:12.5px;color:var(--muted)}
.kp-fees{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);gap:48px;align-items:start}
.kp-table{width:100%;border-collapse:collapse;font-size:14px;margin-top:14px}
.kp-table th{font:600 12px var(--font-b);letter-spacing:.05em;text-transform:uppercase;color:var(--muted);text-align:left;padding:8px 0;border-bottom:2px solid var(--text)}
.kp-table td{padding:10px 0;border-bottom:1px solid var(--border)}
.kp-table td:nth-child(2){color:var(--muted);white-space:nowrap;padding:10px 14px}
.kp-table th:nth-child(2){padding:8px 14px}
.kp-table .num{text-align:right;white-space:nowrap;font-size:15px}
.kp-table th:last-child{text-align:right}
.kp-wear{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:14px}
.kp-wear div{padding:14px;display:grid;gap:3px;border:1px solid var(--border);border-radius:var(--radius);background:var(--bg);font-size:13.5px;line-height:1.4;color:var(--muted)}
.kp-wear b{color:var(--text);font-size:14.5px}
.kp-team{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
.kp-pro{display:grid;grid-template-columns:96px minmax(0,1fr);gap:18px;padding:16px;align-items:start}
.kp-pro .sk-photo{height:112px;border-radius:var(--radius)}
.kp-pro .sk-h3{font-size:calc(20px * var(--hs))}
.kp-pro p{font-size:14px;line-height:1.45;color:var(--muted)}
.kp-focus{display:flex;flex-wrap:wrap;gap:5px;margin:6px 0}
.kp-slot{margin-top:14px;padding:13px 18px;border:1.5px dashed var(--muted);border-radius:var(--radius);display:flex;gap:10px;align-items:center;font-size:14px;color:var(--muted)}
.kp-slot svg{flex:0 0 auto}
.kp-visit{display:grid;grid-template-columns:minmax(0,.94fr) minmax(0,1.06fr);gap:40px;align-items:start}
.kp-mapshot{height:190px;margin:16px 0}
.kp-hours{width:100%;border-collapse:collapse;font-size:14px}
.kp-hours td{padding:7px 0;border-bottom:1px solid var(--border)}
.kp-hours td:last-child{text-align:right}
.kp-sos{display:flex;gap:10px;margin-top:14px;font-size:14px;line-height:1.5;color:var(--muted)}
.kp-sos svg{flex:0 0 auto;margin-top:2px}
.kp-form{padding:28px;display:grid;gap:12px}
.kp-form .sk-g2{gap:12px}
.kp-pick{display:flex;flex-wrap:wrap;gap:6px}
.kp-pick label{height:38px;padding:0 12px;border:1px solid var(--border);border-radius:var(--radius);display:inline-flex;align-items:center;gap:6px;font-size:14px;font-weight:500;background:var(--bg)}
.kp-pick label.on{border-color:var(--primary);box-shadow:inset 0 0 0 1px var(--primary)}
@media (max-width:1024px){
  .sk-navend .btn:not(.primary){display:none}
  .kp-block h1{font-size:calc(58px * var(--hs))}
  .kp-map,.kp-fees{gap:28px}
  .kp-stair{grid-template-columns:repeat(3,minmax(0,1fr));align-items:stretch}
  .kp-stair li{min-height:0!important}
  .kp-tt{grid-template-columns:repeat(3,minmax(0,1fr))}
  .kp-bento{grid-template-columns:repeat(2,minmax(0,1fr))}
  .kp-team{grid-template-columns:minmax(0,1fr)}
}
@media (max-width:860px){
  .kp .sk-head{flex-direction:column;align-items:flex-start;gap:10px}
  .kp-map,.kp-fees,.kp-visit{grid-template-columns:minmax(0,1fr)}
  .kp-body{max-width:520px;margin:0 auto}
  .kp-noref{grid-template-columns:44px minmax(0,1fr)}
  .kp-noref .btn{grid-column:1/-1}
}
@media (max-width:760px){
  .kp>.sk-sec{padding:44px 0}
  .kp-hero{padding:12px 12px 0}
  .kp-block .sk-wrap{grid-template-columns:minmax(0,1fr);gap:18px;padding:30px 18px 22px}
  .kp-block h1{font-size:calc(46px * var(--hs))}
  .kp-run{max-width:210px;justify-self:end;margin-top:-6px}
  .kp-facts{gap:10px;font-size:12.5px;padding-top:14px;margin-top:0}
  .kp-facts{grid-template-columns:minmax(0,1fr) minmax(0,1.45fr) minmax(0,.9fr)}
  .kp-facts .num{font-size:18px;white-space:nowrap}
  .kp-body text{font-size:18px}
  .kp-body text.cap{font-size:15px}
  .kp-map{gap:18px}
  .kp-area{padding:16px 18px}
  .kp-stair{grid-template-columns:minmax(0,1fr);gap:6px}
  .kp-stair li:nth-child(1){margin-right:48px}
  .kp-stair li:nth-child(2){margin-right:36px}
  .kp-stair li:nth-child(3){margin-right:24px}
  .kp-stair li:nth-child(4){margin-right:12px}
  .kp-stair li{padding:13px 15px}
  .kp-bento{display:flex;grid-auto-rows:auto}
  .kp-prog,.kp-prog.feat{padding:20px;align-content:start}
  .kp-prog.feat ul{grid-template-columns:minmax(0,1fr)}
  .kp-noref{padding:16px 18px;gap:10px 14px}
  .kp-tt{display:flex}
  .kp-day{flex-basis:44%!important}
  .kp-wear{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
  .kp-wear div{padding:11px}
  .kp-team{display:flex}
  .kp-pro{grid-template-columns:64px minmax(0,1fr);gap:12px}
  .kp-pro .sk-photo{height:76px}
  .kp-pro>div:last-child>p:last-child{margin-left:-76px}
  .kp-visit{gap:26px}
  .kp-form{padding:22px}
  .kp-form .sk-g2{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
  .kp-mapshot{height:150px}
  .sk-foot-grid>:last-child{grid-column:1/-1}
}
</style>`;

// ---- artwork ----------------------------------------------------------------------------------------------------
const runner = () => `<svg class="kp-run" viewBox="0 0 440 400" role="img" aria-label="Pictogram of a person running"><path class="s" d="M14 150h74M40 206h60M6 262h52M60 318h46"/><circle cx="302" cy="62" r="36"/>
<path class="a" stroke-width="42" d="M272 132L226 232"/><path class="a" stroke-width="30" d="M226 236L316 262L334 362"/><path class="a" stroke-width="30" d="M226 236L176 322L84 306"/><path class="a" stroke-width="24" d="M272 136L348 184L402 142"/><path class="a" stroke-width="24" d="M268 136L190 150L150 214"/></svg>`;

// One mannequin built from capsules, drawn at x = 0..200. `back` adds a spine and shoulder blades.
const figure = (back) => `<ellipse class="f" cx="100" cy="36" rx="24" ry="29"/><path class="l" stroke-width="20" d="M100 60v28"/><path class="f" d="M60 92Q100 76 140 92L132 180Q130 206 136 232H64Q70 206 68 180Z"/>
<path class="l" stroke-width="21" d="M62 102L42 172"/><path class="l" stroke-width="17" d="M42 172L33 240"/><path class="l" stroke-width="21" d="M138 102L158 172"/><path class="l" stroke-width="17" d="M158 172L167 240"/>
<path class="l" stroke-width="33" d="M82 238L78 332"/><path class="l" stroke-width="25" d="M78 332L76 422"/><path class="l" stroke-width="15" d="M76 432L${back ? 80 : 60} 438"/><path class="l" stroke-width="33" d="M118 238L122 332"/><path class="l" stroke-width="25" d="M122 332L124 422"/><path class="l" stroke-width="15" d="M124 432L${back ? 120 : 140} 438"/>
${back ? `<path class="sp" stroke-dasharray="2 8" d="M100 92V222"/><path class="sp" d="M76 112q8 22 16 6M124 112q-8 22-16 6"/>` : `<path class="sp" d="M84 112q16 8 32 0"/><path class="sp" d="M70 340q8 6 16 0M114 340q8 6 16 0"/>`}`;
// [label, id, tag x, tag y, spot x, spot y]: tags sit in the side gutters with a leader line to the spot.
const SPOTS = [["Shoulder", "shoulder", 0, 82, 158, 112], ["Hip", "hip", 0, 222, 182, 252], ["Knee", "knee", 0, 322, 176, 342], ["Ankle", "ankle", 0, 416, 176, 428], ["Neck", "neck", 450, 56, 400, 80], ["Back", "back", 450, 182, 400, 200]];
const bodyMap = () => `<svg class="kp-body" viewBox="0 0 540 480" role="img" aria-label="Front and back body map with hotspots for neck, shoulder, back, hip, knee and ankle"><g transform="translate(100 18)">${figure(false)}</g><g transform="translate(300 18)">${figure(true)}</g>
<text class="cap" x="200" y="478">Front</text><text class="cap" x="400" y="478">Back</text>
${SPOTS.map(([t, id, x, y, sx, sy]) => `<a href="#kp-${id}" aria-label="${t}"><path class="lead" d="M${x === 0 ? 86 : 450} ${y + 14}L${sx} ${sy}"/><circle class="ring" cx="${sx}" cy="${sy}" r="15"/><circle class="dot" cx="${sx}" cy="${sy}" r="6"/><rect class="tag" x="${x}" y="${y}" width="${x === 0 ? 86 : 90}" height="29"/><text x="${x + (x === 0 ? 43 : 45)}" y="${y + 20}">${t}</text></a>`).join("")}</svg>`;

const person = (id, skin, hair, shape) => `<svg viewBox="0 0 240 280" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Portrait of a physiotherapist in a clinic polo shirt"><rect width="240" height="280" style="fill:color-mix(in oklab,var(--primary) 20%,var(--surface))"/><path d="M26 280c6-68 46-92 94-92s88 24 94 92z" style="fill:var(--primary)"/><rect x="104" y="150" width="32" height="50" fill="${skin}"/><ellipse cx="120" cy="116" rx="44" ry="52" fill="${skin}"/>${shape === "long" ? `<path d="M72 150c-14-66 12-100 48-100s62 34 48 100c-6-26-12-46-20-58-16 8-44 12-60 8-8 16-12 30-16 50z" fill="${hair}"/>` : `<path d="M76 108c0-40 22-62 46-62s46 18 44 62c-10-22-30-30-46-30s-34 8-44 30z" fill="${hair}"/>`}</svg>`;
const mapShot = () => `<svg viewBox="0 0 640 240" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Map of the clinic on Brannock Yard, beside the station"><rect width="640" height="240" fill="#ebe8df"/><rect x="430" y="20" width="180" height="90" rx="8" fill="#cfdcbf"/><text x="470" y="72" font-family="sans-serif" font-size="13" fill="#5d6b4f">Tolver Park</text>${[[0, 150, 640, 130], [260, 0, 300, 240], [0, 50, 640, 70]].map(([a, b, c, d]) => `<path d="M${a} ${b}L${c} ${d}" stroke="#fff" stroke-width="16"/>`).join("")}<text x="70" y="136" font-family="sans-serif" font-size="12" fill="#6e6658">Brannock Yard</text><rect x="60" y="170" width="150" height="46" rx="6" fill="#dcd5c6"/><text x="80" y="198" font-family="sans-serif" font-size="12" fill="#6e6658">Station car park</text><g transform="translate(286 136)"><path d="M0 0c-13-17-20-28-20-39a20 20 0 0 1 40 0c0 11-7 22-20 39z" fill="#c8552e"/><circle cy="-39" r="7" fill="#fff"/></g></svg>`;

// ---- content ----------------------------------------------------------------------------------------------------
const AREAS = [
  ["neck", "Neck", ["Desk-related stiffness", "Whiplash-type strains", "Headaches linked to the neck"]],
  ["shoulder", "Shoulder", ["Rotator cuff problems", "Frozen shoulder", "After a dislocation"]],
  ["back", "Back", ["Low back pain", "Sciatica-type leg symptoms", "Disc-related problems"]],
  ["hip", "Hip", ["Groin strains", "Hip osteoarthritis", "Gluteal tendon pain"]],
  ["knee", "Knee", ["Runner’s knee", "Ligament and meniscus injuries", "Knee osteoarthritis"]],
  ["ankle", "Ankle", ["Sprains", "Achilles tendon pain", "Heel and arch pain"]],
];
const STAIR = [
  ["1", "Assessment", "First visit, 45 min", "Your history, movement tests and a clear explanation of what we found."],
  ["2", "Plan", "Same visit", "Goals in your words, from lifting a toddler to a Sunday run, and how often to come in."],
  ["3", "Hands-on and exercise sessions", "Often weekly to begin", "Manual therapy where it helps, and guided exercise that moves on as you do."],
  ["4", "Home programme", "Between visits", "A short set of exercises with video reminders, changed as you go."],
  ["5", "Return to activity", "As agreed with your physio", "Practice for your sport, job or daily routine, then a final review and a plan to keep going."],
];
const PROGRAMMES = [
  ["bolt", "Sports injuries", "Muscle strains, sprains and tendon problems, with testing before you go back to training."],
  ["shield", "Back care", "One-to-one assessment and exercise, with a class to carry on with."],
  ["heart", "Pelvic health", "Private one-to-one care for bladder symptoms, pelvic pain, and antenatal and postnatal needs."],
  ["play", "Running assessment", "Treadmill video analysis, strength tests and a training load plan."],
];
const TIMETABLE = [
  ["Mon", [["7:00 AM", "Back care circuit"], ["6:30 PM", "Strength basics", "b"]]],
  ["Tue", [["12:30 PM", "Rehab Pilates", "b"]]],
  ["Wed", [["7:00 AM", "Runner strength"], ["6:30 PM", "Back care circuit"]]],
  ["Thu", [["12:30 PM", "Balance and mobility", "b"]]],
  ["Fri", [["7:00 AM", "Strength basics", "b"]]],
  ["Sat", [["9:00 AM", "Rehab Pilates", "b"], ["10:15 AM", "Runner strength"]]],
];
const PRICES = [["First assessment", "45 min", "$95"], ["Follow-up session", "30 min", "$68"], ["Extended session", "45 min", "$88"], ["Pelvic health assessment", "60 min", "$120"], ["Running assessment", "60 min", "$130"], ["Small group class", "45 min", "$18"]];
const WEAR = [["Knee, hip or ankle", "Shorts, so we can see the joint move."], ["Neck, shoulder or back", "A vest top or sports top."], ["Running assessment", "The shoes you run in, and a spare pair."], ["After surgery", "Your surgeon’s notes and rehab protocol."]];
const TEAM = [
  ["1", "#d9a77f", "#2d2018", "short", "Jonas Ferreby", "Clinic lead", ["Post-surgery", "Knee", "Shoulder"], "Degree in physiotherapy. Postgraduate training in sports rehabilitation."],
  ["2", "#8d5a3b", "#151210", "long", "Tola Brennick", "Physiotherapist", ["Pelvic health", "Back care"], "Degree in physiotherapy. Further training in pelvic health."],
  ["3", "#f0c7a4", "#a8743e", "long", "Saskia Holm-Rae", "Physiotherapist", ["Running", "Ankle", "Hip"], "Degree in physiotherapy. Further training in running gait analysis."],
  ["4", "#c48b62", "#1f1a17", "short", "Dev Marlowe", "Physiotherapist", ["Neck", "Desk workers"], "Degree in physiotherapy. Further training in manual therapy."],
];

const web = (p, st) => K.page(st, `${K.nav(p, ["Where it hurts", "Your rehab", "Programmes", "Classes", "Prices"], "Book now", "Call (555) 019-2640")}
<main class="kp">
<div class="kp-hero" id="top"><div class="kp-block"><div class="sk-wrap">
  <div class="sk-stack" style="gap:18px"><span class="sk-eyebrow">Physio and sports rehab · Brannock Yard</span>
    <h1>Let’s make a plan for that knee</h1>
    <p class="sk-lede">${esc(p.name)} is hands-on treatment and exercise rehab for sports injuries, sore backs, life after surgery and everything in between.</p>
    <div class="sk-row"><a class="btn sk-btn-lg kp-inv" href="#book-now">Book an assessment</a><a class="btn sk-btn-lg kp-ghost" href="#where-it-hurts">Show us where it hurts</a></div></div>
  ${runner()}
  <div class="kp-facts"><div><span class="num">45 min</span>for a first assessment</div><div><span class="num">7 AM to 8 PM</span>Monday to Thursday</div><div><span class="num">2 min</span>walk from the station</div></div>
</div></div></div>

<section class="sk-sec" id="where-it-hurts"><div class="sk-wrap">
  <div class="sk-head" style="margin-bottom:24px"><div><span class="sk-eyebrow">Start here</span><h2 class="sk-h2">Where does it hurt?</h2></div><p class="muted" style="max-width:380px">Pick an area to see what we often help people with. Not on the list? We look at the whole person, so book anyway.</p></div>
  <div class="kp-map"><div>${bodyMap()}</div>
    <div class="kp-areas sk-rail">${AREAS.map(([id, t, list]) => `<a class="card kp-area" id="kp-${id}" href="#book-now"><h3>${t}${ic("arrow", 18)}</h3><ul>${list.map((x) => `<li>${x}</li>`).join("")}</ul></a>`).join("")}</div></div>
</div></section>

<section class="sk-sec sk-alt" id="your-rehab"><div class="sk-wrap">
  <div class="sk-head" style="margin-bottom:24px"><div><span class="sk-eyebrow">Your rehab</span><h2 class="sk-h2">A first course of care, step by step</h2></div><p class="muted" style="max-width:360px">Everyone’s path is different. Your physio will talk you through what to expect and adjust it as you go.</p></div>
  <ol class="kp-stair">${STAIR.map(([n, t, w, d]) => `<li><span class="num">Step ${n}</span><h3>${t}</h3><small>${w}</small><p>${d}</p></li>`).join("")}</ol>
</div></section>

<section class="sk-sec" id="programmes"><div class="sk-wrap">
  <div class="sk-head" style="margin-bottom:24px"><div><span class="sk-eyebrow">Programmes</span><h2 class="sk-h2">Pick the one that sounds like you</h2></div></div>
  <div class="kp-bento sk-rail">
    <article class="card feat kp-prog"><div style="display:grid;gap:10px"><span class="kp-ico">${ic("refresh", 20)}</span><h3>Post-surgery rehab</h3><p>Structured rehab that follows your surgeon’s protocol, from the first weeks at home to getting back to normal activity.</p><p>Bring your surgeon’s protocol and discharge notes to your first visit.</p></div>
      <ul>${["Knee and hip replacement", "Ligament reconstruction", "Shoulder repair", "Spinal surgery", "Fracture fixation", "Foot and ankle surgery"].map((t) => `<li>${ic("check", 15)}${t}</li>`).join("")}</ul></article>
    ${PROGRAMMES.map(([i, t, d]) => `<article class="card kp-prog"><span class="kp-ico">${ic(i, 20)}</span><h3>${t}</h3><p>${d}</p></article>`).join("")}
  </div>
  <aside class="kp-noref"><span class="kp-ico">${ic("doc", 20)}</span><p><b>No referral needed, in most cases</b>You can usually book with a physio directly. Some insurance plans ask for a doctor’s referral first, so check your policy before you come.</p><a class="btn sk-btn-lg" href="#book-now">Book directly</a></aside>
</div></section>

<section class="sk-sec sk-alt" id="classes"><div class="sk-wrap">
  <div class="sk-head" style="margin-bottom:22px"><div><span class="sk-eyebrow">Classes</span><h2 class="sk-h2">This week in the rehab gym</h2></div><p class="muted" style="max-width:360px">Small groups of up to eight, led by a physio. We’ll check a class suits you at your assessment.</p></div>
  <div class="kp-tt sk-rail">${TIMETABLE.map(([d, list]) => `<div class="kp-day"><b>${d}</b>${list.map(([t, n, c]) => `<div class="kp-cls ${c || ""}"><span class="num">${t}</span>${n}</div>`).join("")}</div>`).join("")}</div>
</div></section>

<section class="sk-sec" id="prices"><div class="sk-wrap kp-fees">
  <div><span class="sk-eyebrow">Prices</span><h2 class="sk-h2" style="margin-top:12px">Session length and self-pay prices</h2>
    <table class="kp-table"><thead><tr><th>Session</th><th>Length</th><th>Price</th></tr></thead><tbody>${PRICES.map(([t, l, v]) => `<tr><td>${t}</td><td>${l}</td><td class="num">${v}</td></tr>`).join("")}</tbody></table></div>
  <div><span class="sk-eyebrow">What to wear</span><h2 class="sk-h2" style="margin-top:12px">Come ready to move</h2>
    <div class="kp-wear">${WEAR.map(([t, d]) => `<div><b>${t}</b>${d}</div>`).join("")}</div></div>
</div></section>

<section class="sk-sec sk-alt" id="clinicians"><div class="sk-wrap">
  <div class="sk-head" style="margin-bottom:22px"><div><span class="sk-eyebrow">Clinicians</span><h2 class="sk-h2">Who’ll be working with you</h2></div></div>
  <div class="kp-team sk-rail">${TEAM.map(([id, s, h, sh, n, r, f, d]) => `<article class="card kp-pro"><div class="sk-photo">${person(id, s, h, sh)}</div><div><h3 class="sk-h3">${n}</h3><p>${r}</p><div class="kp-focus">${f.map((x) => `<span class="badge">${x}</span>`).join("")}</div><p>${d}</p></div></article>`).join("")}</div>
  <div class="kp-slot">${ic("edit", 16)} Add your registration and accreditation details here</div>
</div></section>

<section class="sk-sec" id="book-now"><div class="sk-wrap kp-visit">
  <div><span class="sk-eyebrow">Find the clinic</span><h2 class="sk-h2" style="margin-top:12px">Unit 3, Brannock Yard</h2>
    <div class="sk-photo kp-mapshot">${mapShot()}</div>
    <table class="kp-hours"><tbody>${[["Monday to Thursday", "7:00 AM to 8:00 PM"], ["Friday", "7:00 AM to 5:00 PM"], ["Saturday", "8:30 AM to 1:00 PM"]].map(([d, h]) => `<tr><td>${d}</td><td>${h}</td></tr>`).join("")}</tbody></table>
    <p class="kp-sos">${ic("bell", 16)}<span>We’re an outpatient clinic, not an urgent care service. In an emergency, call your local emergency number.</span></p></div>
  <form class="card kp-form" aria-label="Book an assessment">
    <h2 class="sk-h3" style="font-size:calc(26px * var(--hs))">Book an assessment</h2>
    <div class="sk-field"><span style="font-weight:500;font-size:13px">Where does it hurt?</span><div class="kp-pick">${["Neck", "Shoulder", "Back", "Hip", "Knee", "Ankle", "Other"].map((a) => `<label class="${a === "Knee" ? "on" : ""}"><input type="radio" name="kp-area"${a === "Knee" ? " checked" : ""}> ${a}</label>`).join("")}</div></div>
    <div class="sk-g2"><div class="sk-field"><label for="kp-name">Full name</label><input class="sk-input" id="kp-name" value="Ellis Tamworthy"></div><div class="sk-field"><label for="kp-phone">Mobile</label><input class="sk-input" id="kp-phone" value="(555) 017-8842"></div></div>
    <div class="sk-g2"><div class="sk-field"><label for="kp-prog">Programme</label><select class="sk-input" id="kp-prog"><option>Not sure yet</option><option>Post-surgery rehab</option><option>Sports injuries</option><option>Back care</option><option>Pelvic health</option><option>Running assessment</option></select></div><div class="sk-field"><label for="kp-when">Preferred time</label><input class="sk-input" id="kp-when" value="Early mornings"></div></div>
    <div class="sk-field"><label for="kp-note">What would you like to get back to?</label><textarea class="sk-input" id="kp-note" rows="2" style="min-height:74px">Five-a-side on Thursdays, and stairs without thinking about it.</textarea></div>
    <button class="btn primary sk-btn-lg" type="button">Request appointment</button>
  </form>
</div></section>
</main>
${K.footer(p, "Hands-on physio and exercise rehab at Brannock Yard, two minutes from the station.", [["Clinic", ["Programmes", "Classes", "Prices"]], ["Care", ["Post-surgery rehab", "Sports injuries", "Pelvic health"]], ["Contact", ["Unit 3, Brannock Yard", "(555) 019-2640", "hello@kestrelgate.example"]]], "Fictional practice created for this template. General information only, not medical advice.")}`, CSS);

module.exports = {
  "physical-therapy-website": K.def("physio", "Physical therapy clinic website",
    "a full physical therapy clinic home page: navigation with a call button, a full colour hero block with a running figure and three practical facts, a where does it hurt section with a front and back body map whose labelled hotspots link to conditions by area, a stepped rehab timeline for a first course of care from assessment to return to activity, a programmes bento with post-surgery rehab, sports injuries, back care, pelvic health and running assessment, a no-referral-needed note, a weekly class timetable, session length and self-pay prices beside what to wear, clinician cards with focus areas and a credentials slot, the clinic location with hours and an emergency note, a booking form that asks where it hurts, and a footer",
    ["navigation-header", "color-block-hero", "body-map", "interactive-diagram", "timeline", "staircase-steps", "bento-grid", "notice", "class-timetable", "pricing-table", "tips", "team-cards", "credentials-slot", "map", "opening-hours", "booking-form", "footer", "physical-therapy"], web),
};
