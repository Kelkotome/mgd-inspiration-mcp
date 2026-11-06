/* Pediatrics clinic website template (Wrenfold Children's Clinic, a fictional family pediatric practice). Parent-first, tired-parent-proof home page:
   the H1 is the question "Is your child sick today?", answered by a yes panel (same-day sick visit, nurse line, after hours) and a not-today panel;
   a growing well-child visit chart by age; first visit and new parent guide; a floor plan of the separate well and sick sides; parent portal on a phone;
   general reading; clinicians with interests; hours and a booking form with the child's name and age.
   Routing wording only: no symptom lists, vaccine names, doses or outcome claims. Illustrations are inline SVG. */
const { ic, esc } = require("../lib");
const K = require("../sitekit");

const CSS = `<style>
.pd>.sk-sec{padding:56px 0}
.pd .sk-head{margin-bottom:28px}
.pd .sk-head>div:first-child{max-width:720px}
.pd-hero{position:relative;background:color-mix(in oklab,var(--primary) 11%,var(--bg));border-bottom:1px solid var(--border);padding:30px 0 48px}
.pd-hero .sk-wrap{position:relative}
.pd-htop{display:flex;flex-wrap:wrap;align-items:center;gap:8px 22px}
.pd-open{display:inline-flex;align-items:center;gap:8px;font-size:14px;font-weight:600}
.pd-open i{width:10px;height:10px;border-radius:50%;background:var(--success);flex:0 0 auto}
.pd-h1{font-size:calc(66px * var(--hs));line-height:1.02;max-width:900px;margin:14px 0 8px}
.pd-sub{font-size:19px;color:var(--muted);max-width:760px}
.pd-wren{position:absolute;right:48px;top:4px;width:232px;height:auto}
.pd-doors{display:grid;grid-template-columns:minmax(0,2.5fr) minmax(0,1fr);gap:20px;margin-top:26px;align-items:stretch}
.pd-yes{background:var(--primary);color:var(--on-primary);border-radius:var(--radius-lg);padding:22px;display:grid;gap:16px}
.pd-dhead{display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 14px}
.pd-dhead h2{font-size:calc(30px * var(--hs));line-height:1.1}
.pd-dhead span{font-size:14px}
.pd-routes{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
.pd-route{padding:20px;display:flex;flex-direction:column;gap:10px;color:var(--text)}
.pd-route h3{font-size:calc(21px * var(--hs));line-height:1.18}
.pd-route p{font-size:14px;color:var(--muted)}
.pd-when{display:flex;gap:8px;align-items:flex-start;font-size:13px;font-weight:600}
.pd-when svg{flex:0 0 auto;margin-top:2px}
.pd-route .btn{margin-top:auto;height:46px;font-size:15px}
.pd-emg{display:flex;gap:10px;align-items:flex-start;font-size:15px;font-weight:500;padding:2px 4px}
.pd-emg svg{flex:0 0 auto;margin-top:3px}
.pd-no{padding:22px;display:flex;flex-direction:column;gap:6px}
.pd-no h2{font-size:calc(30px * var(--hs));line-height:1.1;margin-bottom:6px}
.pd-no a{display:grid;grid-template-columns:minmax(0,1fr) 18px;gap:10px;align-items:center;padding:14px 0;border-top:1px solid var(--border)}
.pd-no a b{display:block;font-size:15px;line-height:1.3}
.pd-no a span span{display:block;font-size:13px;color:var(--muted);line-height:1.35;margin-top:2px}
.pd-chart{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:0 14px}
.pd-wall{grid-column:1/-1;display:grid;grid-template-columns:subgrid;align-items:end;height:172px;border-bottom:3px solid var(--text);background:repeating-linear-gradient(to top,var(--border) 0 1px,transparent 1px 34px)}
.pd-wall svg{display:block;margin:0 auto;fill:color-mix(in oklab,var(--primary) 72%,var(--bg))}
.pd-wall svg .hd{fill:color-mix(in oklab,var(--primary) 92%,var(--text))}
.pd-stop{padding-top:16px;display:grid;gap:6px;align-content:start}
.pd-stop h3{font-size:calc(21px * var(--hs));line-height:1.15}
.pd-stop .num{font-size:12px;color:var(--muted)}
.pd-stop p{font-size:14px;line-height:1.45;color:var(--muted)}
.pd-always{display:flex;flex-wrap:wrap;align-items:center;gap:8px 24px;margin-top:26px;padding:14px 22px;border-radius:var(--radius);background:var(--surface);border:1px solid var(--border);font-size:14px}
.pd-always span{display:inline-flex;gap:8px;align-items:center}
.pd-always svg{color:color-mix(in oklab,var(--primary) 80%,var(--text));flex:0 0 auto}
.pd-guide{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);gap:56px;align-items:start}
.pd-weeks{display:grid;gap:0;margin-top:20px}
.pd-weeks article{display:grid;grid-template-columns:150px minmax(0,1fr);gap:18px;padding:14px 0;border-top:1px solid var(--border)}
.pd-weeks h3{font-size:calc(19px * var(--hs));line-height:1.2}
.pd-weeks p{font-size:15px;color:var(--muted)}
.pd-note{padding:26px;display:grid;grid-template-columns:minmax(0,1fr);gap:10px}
.pd-note h3{font-size:calc(24px * var(--hs));line-height:1.15}
.pd-note ul{list-style:none;display:grid}
.pd-note li{display:grid;grid-template-columns:22px minmax(0,1fr);gap:10px;padding:9px 0;border-bottom:1px dashed var(--border);font-size:15px}
.pd-box{width:18px;height:18px;margin-top:3px;border:2px solid var(--text);border-radius:var(--radius-sm)}
.pd-two{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,1fr);gap:56px;align-items:center}
.pd-plan{border:1px solid var(--border);border-radius:var(--radius-lg);overflow:hidden;background:var(--bg)}
.pd-plan svg{display:block;width:100%;height:auto}
.pd-plan .wall{fill:none;stroke:var(--text);stroke-width:4}
.pd-plan .room{fill:var(--surface);stroke:var(--border);stroke-width:2}
.pd-plan .well{fill:color-mix(in oklab,var(--primary) 18%,var(--surface))}
.pd-plan .sick{fill:color-mix(in oklab,var(--accent) 18%,var(--surface))}
.pd-plan .seat{fill:color-mix(in oklab,var(--text) 34%,var(--surface))}
.pd-plan .door{fill:var(--bg);stroke:var(--text);stroke-width:3}
.pd-plan text{font-family:var(--font-b);font-size:19px;font-weight:600;fill:var(--text)}
.pd-plan text.sm{font-size:15px;font-weight:500;fill:var(--muted)}
.pd-sides{display:grid;gap:18px;margin-top:22px}
.pd-sides div{display:grid;grid-template-columns:18px minmax(0,1fr);gap:12px}
.pd-sides i{width:18px;height:18px;margin-top:3px;border-radius:50%;background:color-mix(in oklab,var(--primary) 40%,var(--surface));border:2px solid var(--text)}
.pd-sides i.s{background:color-mix(in oklab,var(--accent) 45%,var(--surface))}
.pd-sides i.c{background:var(--bg)}
.pd-sides p{font-size:15px;color:var(--muted)}
.pd-portal{background:var(--text);color:var(--bg)}
.pd-portal .muted,.pd-portal li span{color:color-mix(in oklab,var(--bg) 74%,var(--text))}
.pd-portal .sk-eyebrow{color:color-mix(in oklab,var(--bg) 80%,var(--text))}
.pd-pgrid{display:grid;grid-template-columns:minmax(0,1fr) 330px;gap:72px;align-items:center}
.pd-plist{list-style:none;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px 32px;margin:20px 0 24px}
.pd-plist li{display:grid;gap:2px;align-content:start;font-size:14px}
.pd-plist b{font-size:15px}
.pd-phone{width:300px;margin:0 auto;border:8px solid color-mix(in oklab,var(--bg) 26%,var(--text));border-radius:36px;background:var(--bg);color:var(--text);padding:18px 14px 16px;display:grid;gap:10px;font-size:13px}
.pd-kid{display:flex;align-items:center;gap:10px}
.pd-kid>i{width:38px;height:38px;border-radius:50%;background:color-mix(in oklab,var(--primary) 26%,var(--surface));display:grid;place-items:center;font:600 15px var(--font-b);font-style:normal;flex:0 0 auto}
.pd-kid .muted{font-size:12px}
.pd-next{background:var(--primary);color:var(--on-primary);border-radius:var(--radius);padding:12px 14px;display:grid;gap:2px}
.pd-next .num{font-size:18px}
.pd-tile{display:grid;grid-template-columns:18px minmax(0,1fr) auto;gap:10px;align-items:center;padding:11px 12px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius)}
.pd-tile .badge{height:18px;padding:0 6px;font-size:10px;letter-spacing:0}
.pd-read{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.4fr);gap:44px}
.pd-lead{padding:30px;display:grid;gap:12px;align-content:space-between;background:color-mix(in oklab,var(--primary) 12%,var(--surface))}
.pd-lead h3{font-size:calc(30px * var(--hs));line-height:1.12}
.pd-tag{font-size:12px;font-weight:600;color:var(--muted)}
.pd-arts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 32px}
.pd-arts a{display:grid;gap:4px;padding:16px 0;border-top:1px solid var(--border)}
.pd-arts h3{font:600 16px/1.3 var(--font-b);letter-spacing:0}
.pd-docs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 44px}
.pd-doc{display:grid;grid-template-columns:76px minmax(0,1fr);gap:18px;padding:16px 0;border-top:1px solid var(--border)}
.pd-doc>svg{width:76px;height:76px;border-radius:50%}
.pd-doc h3{font-size:calc(20px * var(--hs));line-height:1.2}
.pd-doc .role{font-size:14px;color:var(--muted);margin-bottom:8px}
.pd-int{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px}
.pd-int span{font-size:12px;font-weight:600;padding:3px 9px;border-radius:999px;background:color-mix(in oklab,var(--primary) 12%,var(--surface))}
.pd-doc p{font-size:13.5px;color:var(--muted)}
.pd-slot{margin-top:24px;padding:14px 18px;border:2px dashed var(--border);border-radius:var(--radius);font-size:14px;font-weight:500;color:var(--muted);display:flex;gap:10px;align-items:center}
.pd-slot svg{flex:0 0 auto}
.pd-visit{display:grid;grid-template-columns:minmax(0,.85fr) minmax(0,1.15fr);gap:48px;align-items:start}
.pd-hours{width:100%;border-collapse:collapse;font-size:15px;margin-top:12px}
.pd-hours td{padding:8px 0;border-bottom:1px solid var(--border)}
.pd-hours td:last-child{text-align:right}
.pd-hours tr.today td{font-weight:700}
.pd-tip{margin-top:18px;padding:16px 18px;border-radius:var(--radius);background:color-mix(in oklab,var(--primary) 10%,var(--surface));font-size:14px}
.pd-form{padding:28px;display:grid;gap:13px}
.pd-form .sk-g2{gap:14px}
.pd-radio{display:flex;flex-wrap:wrap;gap:8px}
.pd-radio label{min-height:40px;padding:6px 14px;border:1px solid var(--border);border-radius:var(--radius);display:inline-flex;align-items:center;gap:8px;font-size:14px;font-weight:500;background:var(--bg)}
.pd-radio label.on{border-color:var(--primary);box-shadow:inset 0 0 0 1px var(--primary)}
@media (max-width:1180px){
  .sk-links a,.sk-nav .logo{white-space:nowrap}
  .sk-navend .btn:not(.primary){display:none}
}
@media (max-width:1024px){
  .pd-wren{display:none}
  .pd-doors{grid-template-columns:minmax(0,1fr)}
  .pd-no{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:0 20px}
  .pd-no h2{grid-column:1/-1}
  .pd-guide,.pd-two,.pd-read,.pd-pgrid{grid-template-columns:minmax(0,1fr);gap:36px}
  .pd-chart{grid-template-columns:repeat(4,minmax(0,1fr));gap:20px 14px}
  .pd-wall{display:none}
  .pd-docs{grid-template-columns:minmax(0,1fr)}
  .pd-visit{grid-template-columns:minmax(0,1fr)}
}
@media (max-width:760px){
  .pd>.sk-sec{padding:40px 0}
  .sk-foot-grid{grid-template-columns:minmax(0,1fr) minmax(0,1.25fr);gap:28px 16px}
  .sk-foot li{font-size:13.5px}
  .pd-hero{padding:18px 0 30px}
  .pd-h1{font-size:calc(46px * var(--hs));margin:10px 0 6px}
  .pd-sub{font-size:16px}
  .pd-route p,.pd-no a span span{display:none}
  .pd-no a{padding:10px 0}
  .pd-doors{margin-top:20px;gap:14px}
  .pd-yes{padding:14px;gap:12px}
  .pd-routes{grid-template-columns:minmax(0,1fr);gap:10px}
  .pd-route{padding:16px;gap:8px}
  .pd-no{display:flex;padding:16px}
  .pd-chart{grid-template-columns:repeat(2,minmax(0,1fr));gap:0 14px}
  .pd-stop{padding:10px 0 14px;border-top:3px solid var(--text);gap:3px}
  .pd-stop p{font-size:13px}
  .pd-stop:last-of-type{grid-column:1/-1}
  .pd-always{display:none}
  .pd-weeks article{grid-template-columns:minmax(0,1fr);gap:2px;padding:12px 0}
  .pd-weeks article:last-child,.pd-note>p{display:none}
  .pd-note{padding:20px}
  .pd-plist{gap:12px 14px;margin:16px 0 20px}
  .pd-plist li{font-size:13px}
  .pd-pgrid{gap:24px}
  .pd-tile:nth-of-type(n+5){display:none}
  .pd-lead{padding:22px}
  .pd-arts{grid-template-columns:minmax(0,1fr)}
  .pd-arts a:nth-child(n+4),.pd .sk-head>p{display:none}
  .pd-arts a{padding:12px 0}
  .pd .sk-head{margin-bottom:18px}
  .pd-read{gap:14px}
  .pd-docs{display:flex}
  .pd-doc{grid-template-columns:56px minmax(0,1fr);gap:14px;padding:16px;border:1px solid var(--border);border-radius:var(--radius-lg);background:var(--bg);align-self:stretch}
  .pd-doc>svg{width:56px;height:56px}
  .pd-slot{margin-top:14px}
  .pd-hours td{padding:6px 0;font-size:14px}
  .pd-form{padding:20px}
  .pd-form>p,.pd-form>.sk-g2:nth-of-type(n+3){display:none}
}
</style>`;

// ---- illustrations -------------------------------------------------------------------------------------------------
// A small wren on a branch (the clinic's mascot), fixed natural tones.
const wren = () => `<svg class="pd-wren" viewBox="0 0 240 150" role="img" aria-label="A small wren with a cocked tail perched on a leafy branch"><path d="M6 128c60 8 150 2 228-20" fill="none" stroke="#7a5a3e" stroke-width="6" stroke-linecap="round"/><path d="M176 118c12-16 28-20 42-14-8 14-24 22-42 14zM58 134c-10 12-24 14-38 8 10-12 24-14 38-8z" fill="#7d9c6c"/>
<path d="M150 72 188 22c4-5 12-1 10 6l-20 58z" fill="#8a6443"/><path d="M162 60l14-18M170 70l14-20" stroke="#6b4b31" stroke-width="3" stroke-linecap="round"/>
<ellipse cx="118" cy="82" rx="54" ry="38" fill="#a67c55"/><path d="M78 96c12 22 56 26 80 2-18 8-58 10-80-2z" fill="#f0dfc3"/><path d="M104 72c20-8 42 0 54 16-20 6-46 2-54-16z" fill="#8a6443"/>
<circle cx="72" cy="62" r="24" fill="#a67c55"/><path d="M52 52c12-8 30-8 42 2" fill="none" stroke="#f0dfc3" stroke-width="4" stroke-linecap="round"/><circle cx="62" cy="62" r="3.6" fill="#2a1f17"/><path d="M50 60 28 66l24 6z" fill="#5c4630"/>
<path d="M108 118v12M128 118v12" stroke="#5c4630" stroke-width="4" stroke-linecap="round"/></svg>`;

// Child silhouettes that grow from left to right against the height chart (coloured from the theme).
const FIG = [[66, 34], [72, 44], [60, 62], [52, 84], [52, 100], [54, 118], [58, 156]];
const kid = (i) => {
  const [w, h] = FIG[i];
  if (i < 2) { const s = i ? 1.15 : 1; return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" aria-hidden="true"><ellipse cx="${w / 2 + 8}" cy="${h - 12 * s}" rx="${24 * s}" ry="${12 * s}"/><circle class="hd" cx="${13 * s}" cy="${h - 14 * s}" r="${11 * s}"/></svg>`; }
  if (i === 2) return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" aria-hidden="true"><path d="M30 26c14 0 22 16 22 30 0 4-3 6-6 6H14c-3 0-6-2-6-6 0-14 8-30 22-30z"/><circle class="hd" cx="30" cy="16" r="15"/></svg>`;
  const r = 9 + i * 1.6, cx = w / 2, top = r * 2 + 2, bw = 12 + i * 2.6, legs = (h - top) * .42;
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" aria-hidden="true"><circle class="hd" cx="${cx}" cy="${r}" r="${r}"/><rect x="${cx - bw / 2}" y="${top}" width="${bw}" height="${h - top - legs + 4}" rx="${bw / 2.4}"/><rect x="${cx - bw / 2 + 1}" y="${h - legs}" width="${bw * .4}" height="${legs}" rx="4"/><rect x="${cx + bw / 2 - bw * .4 - 1}" y="${h - legs}" width="${bw * .4}" height="${legs}" rx="4"/><rect x="${cx - bw / 2 - 6}" y="${top + 2}" width="6" height="${(h - top) * .42}" rx="3"/><rect x="${cx + bw / 2}" y="${top + 2}" width="6" height="${(h - top) * .42}" rx="3"/></svg>`;
};

// Floor plan of the clinic, drawn from the theme colours so it works in every style and in dark mode.
const plan = () => `<svg viewBox="0 0 720 440" role="img" aria-label="Floor plan with the well side and its own entrance on the left, the sick side and its own entrance on the right, and exam rooms along the top">
<rect x="14" y="14" width="692" height="412" fill="none"/>
${[0, 1, 2, 3, 4, 5].map((i) => `<rect class="room" x="${16 + i * 115}" y="16" width="${i === 5 ? 113 : 115}" height="104"/><text class="sm" x="${73 + i * 115}" y="74" text-anchor="middle">Room ${i + 1}</text>`).join("")}
<rect class="room well" x="16" y="120" width="290" height="304"/><rect class="room sick" x="414" y="120" width="290" height="304"/><rect class="room" x="306" y="120" width="108" height="304"/>
<text x="42" y="164">Well side</text><text class="sm" x="42" y="188">Checkups and new babies</text>
<text x="440" y="164">Sick side</text><text class="sm" x="440" y="188">Same-day sick visits</text>
<text class="sm" x="360" y="256" text-anchor="middle">Nurse</text><text class="sm" x="360" y="276" text-anchor="middle">station</text>
${[0, 1, 2, 3, 4].map((i) => `<rect class="seat" x="${44 + i * 40}" y="${236}" width="28" height="28" rx="6"/><rect class="seat" x="${444 + i * 40}" y="236" width="28" height="28" rx="6"/>`).join("")}
<circle class="seat" cx="96" cy="326" r="32"/><text class="sm" x="96" y="378" text-anchor="middle">Play corner</text>
${[0, 1, 2].map((i) => `<rect class="seat" x="${444 + i * 72}" y="${306}" width="52" height="30" rx="8"/>`).join("")}
<text class="sm" x="520" y="370" text-anchor="middle">Quiet seats with space</text>
<rect class="door" x="190" y="412" width="74" height="20"/><text class="sm" x="227" y="402" text-anchor="middle">Well door</text>
<rect class="door" x="590" y="412" width="74" height="20"/><text class="sm" x="627" y="402" text-anchor="middle">Sick door</text>
<rect class="wall" x="14" y="14" width="692" height="412"/></svg>`;

const face = (id, skin, hair, top) => `<svg viewBox="0 0 76 76" role="img" aria-label="Portrait illustration of a clinician"><rect width="76" height="76" fill="#e6ece6"/><path d="M8 76c2-20 14-26 30-26s28 6 30 26z" fill="${top}"/><rect x="31" y="38" width="14" height="16" fill="${skin}"/><ellipse cx="38" cy="30" rx="15" ry="17" fill="${skin}"/><path d="M23 28c0-14 8-20 15-20s16 6 15 20c-4-7-10-9-15-9s-11 2-15 9z" fill="${hair}"/></svg>`;

// ---- content -------------------------------------------------------------------------------------------------------
const ROUTES = [
  ["calendar", "Same-day sick visit", "We keep time free every day for children who are unwell. You come in through the sick side door.", "Mon to Sat, slots open at 8:00 AM", "Book a sick visit", "primary", "#book-a-visit"],
  ["chat", "Nurse advice line", "Not sure whether to come in? A pediatric nurse will talk it through with you and tell you where to go next.", "Every day, 7:30 AM to 9:00 PM", "(555) 014-2231", "", "#"],
  ["clock", "After hours", "When we are closed, call the main number. The on-call clinician will route you to the right place.", "Nights, Sundays and holidays", "(555) 014-2230", "", "#"],
];
const NOT_TODAY = [["Book a checkup", "Well-child visits by age", "#checkups"], ["New baby on the way", "Meet us and plan the first visit", "#new-parents"], ["Forms and records", "School, camp and sports forms", "#portal"], ["Hours and directions", "27 Tallis Row, free parking", "#book-a-visit"]];
const STOPS = [
  ["Newborn", "45 min, within days of coming home", "A first weigh-in, a head-to-toe look, feeding and sleep questions, and plenty of time for yours."],
  ["2 months", "30 min", "Growth, a full look-over, how feeding is going, and any immunizations due."],
  ["6 months", "30 min", "Growth, how your baby moves and plays, and a talk about starting solid foods."],
  ["12 months", "30 min", "Growth, first steps and first words, any routine screening due at this age."],
  ["18 months", "30 min", "A short development questionnaire, language and play, and behavior questions."],
  ["2 years", "30 min", "Growth, talking and play, plus sleep, toilet training and daycare questions."],
  ["Then yearly", "30 min, once a year", "Growth, vision and hearing checks, school and sports forms. Teens get time alone with the clinician."],
];
const ALWAYS = [["check", "Height and weight on the growth chart"], ["chat", "Your questions first"], ["shield", "Immunizations explained before anything is given"], ["calendar", "Next visit booked before you leave"]];
const WEEKS = [
  ["Before the birth", "A free 20 minute meet-the-clinic visit. See both doors, meet a clinician, and ask how the first weeks work here."],
  ["The first days home", "Call us when you leave the hospital and we will find a first visit, usually within a few days. Use the well side door."],
  ["The first month", "We set up your parent portal and show you the nurse line, so you know who to call at any hour."],
  ["Switching clinics?", "Sign one transfer form and we will request your child’s records from the old clinic."],
];
const BRING = ["Hospital discharge papers", "Insurance card and photo ID", "Your child’s previous records, if any", "A spare diaper and a change of clothes", "The questions you wrote down at 3 AM"];
const PORTAL = [["Message the care team", "For things that can wait. We reply within one working day."], ["Book and change visits", "See open slots for each clinician."], ["Forms in one place", "School, camp, sports and daycare forms, ready to sign."], ["Records for every child", "Growth charts, visit notes and immunization records."], ["Two caregivers, one child", "Invite a partner, grandparent or sitter with limited access."], ["Teen logins", "From 13, teens can have a login of their own."]];
const ARTS = [["Clinic", "How our nurse line works", "3 min"], ["Visits", "Questions to write down before a checkup", "3 min"], ["Visits", "Helping a nervous child through a visit", "5 min"], ["Teens", "When teens start seeing us on their own", "4 min"], ["Forms", "Getting daycare and school forms done early", "2 min"], ["Families", "Sharing care between two homes", "4 min"]];
const DOCS = [
  ["1", "#c98f67", "#2a1c14", "#7f9fa8", "Dr Imani Thackwell", "Pediatrician", ["Newborns", "Feeding", "Twins"], "Specialist training in pediatrics. Speaks English and Swahili."],
  ["2", "#efc9a8", "#7b5230", "#a58fa8", "Dr Owen Varnholt", "Pediatrician", ["Teen health", "Sports forms", "Long-term conditions"], "Specialist training in pediatrics. Fellowship in adolescent medicine."],
  ["3", "#a8714c", "#17110d", "#88a487", "Renata Ibarrola", "Pediatric nurse practitioner", ["Sick visits", "School-age checkups"], "Advanced practice training in pediatric nursing. Speaks English and Spanish."],
  ["4", "#e0b08a", "#3f2c1e", "#c0a06e", "Callum Deverick", "Registered nurse, nurse line lead", ["Nurse line", "New parents"], "Training in pediatric nursing and telephone triage."],
];
const HOURS = [["Monday", "8:00 AM to 6:30 PM"], ["Tuesday", "8:00 AM to 6:30 PM", "today"], ["Wednesday", "8:00 AM to 6:30 PM"], ["Thursday", "8:00 AM to 7:30 PM"], ["Friday", "8:00 AM to 5:00 PM"], ["Saturday", "9:00 AM to 1:00 PM, sick visits only"], ["Sunday", "Closed, on-call clinician by phone"]];

const web = (p, st) => K.page(st, `${K.nav(p, ["Sick today", "Checkups", "New parents", "Portal", "Clinicians"], "Book a visit", "Call (555) 014-2230")}
<main class="pd">
<section class="pd-hero" id="sick-today"><div class="sk-wrap">
  ${wren()}
  <div class="pd-htop"><span class="sk-eyebrow">Pediatric clinic, birth to 18</span><span class="pd-open"><i></i>Open today until 6:30 PM</span></div>
  <h1 class="pd-h1">Is your child sick today?</h1>
  <p class="pd-sub">Start here. One question, then ${esc(p.name)} takes it from there.</p>
  <div class="pd-doors">
    <div class="pd-yes" aria-label="Yes, my child is sick today">
      <div class="pd-dhead"><h2>Yes, today</h2><span>Three ways to reach us. Pick whichever is easiest.</span></div>
      <div class="pd-routes">${ROUTES.map(([i, t, d, w, b, k, h]) => `<article class="card pd-route"><h3>${t}</h3><p>${d}</p><div class="pd-when">${ic(i, 15)}<span>${w}</span></div><a class="btn ${k}" href="${h}">${k ? "" : ic("phone", 15)}${b}</a></article>`).join("")}</div>
      <div class="pd-emg">${ic("bell", 17)}<span>Anything that feels life threatening or cannot wait? In an emergency, call your local emergency number.</span></div>
    </div>
    <div class="card pd-no"><h2>Not today</h2>${NOT_TODAY.map(([t, d, h]) => `<a href="${h}"><span><b>${t}</b><span>${d}</span></span>${ic("chevron", 16)}</a>`).join("")}</div>
  </div>
</div></section>

<section class="sk-sec" id="checkups"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">Well-child visits</span><h2 class="sk-h2">Checkups, age by age</h2></div><p class="muted" style="max-width:400px">What generally happens at each visit. Every child is different, so your clinician will shape the time around yours.</p></div>
  <div class="pd-chart"><div class="pd-wall" aria-hidden="true">${STOPS.map((_, i) => kid(i)).join("")}</div>
    ${STOPS.map(([a, l, d]) => `<article class="pd-stop"><h3>${a}</h3><span class="num">${l}</span><p>${d}</p></article>`).join("")}</div>
  <div class="pd-always"><b>At every checkup</b>${ALWAYS.map(([i, t]) => `<span>${ic(i, 16)}${t}</span>`).join("")}</div>
</div></section>

<section class="sk-sec sk-alt" id="new-parents"><div class="sk-wrap pd-guide">
  <div><span class="sk-eyebrow">First visit and new parents</span><h2 class="sk-h2" style="margin-top:12px">New here? You don’t need to have it all worked out</h2>
    <div class="pd-weeks">${WEEKS.map(([t, d]) => `<article><h3>${t}</h3><p>${d}</p></article>`).join("")}</div></div>
  <aside class="card pd-note"><h3>What to bring to the first visit</h3><ul>${BRING.map((b) => `<li><span class="pd-box"></span><span>${b}</span></li>`).join("")}</ul>
    <a class="btn sk-btn-lg" href="#">Download the guide ${ic("download", 16)}</a><p class="muted" style="font-size:13px">A short guide to how the clinic works, who to call, and when we are open.</p></aside>
</div></section>

<section class="sk-sec" id="two-sides"><div class="sk-wrap pd-two">
  <div class="pd-plan">${plan()}</div>
  <div><span class="sk-eyebrow">Our waiting areas</span><h2 class="sk-h2" style="margin-top:12px">Two sides, two doors</h2>
    <div class="pd-sides">
      <div><i></i><span><b>Well side</b><p>For checkups, new babies and form visits. It has its own door, play corner and chairs.</p></span></div>
      <div><i class="s"></i><span><b>Sick side</b><p>For same-day sick visits. Quieter, with more space between seats.</p></span></div>
      <div><i class="c"></i><span><b>Waiting in the car</b><p>Prefer not to sit inside? Text us from the parking lot and we will call you when your room is ready.</p></span></div>
    </div></div>
</div></section>

<section class="sk-sec pd-portal feat" id="portal"><div class="sk-wrap pd-pgrid">
  <div><span class="sk-eyebrow">Parent portal</span><h2 class="sk-h2" style="margin-top:12px">Everything for every child, in one login</h2>
    <ul class="pd-plist">${PORTAL.map(([t, d]) => `<li><b>${t}</b><span>${d}</span></li>`).join("")}</ul>
    <a class="btn primary sk-btn-lg" href="#">Sign in to the portal</a></div>
  <div class="pd-phone" aria-label="Parent portal on a phone">
    <div class="pd-kid"><i>M</i><div><b>Mina Arlowe, 4</b><div class="muted">Switch child</div></div></div>
    <div class="pd-next"><span style="font-size:12px">Next visit</span><span class="num">Tue 17 Nov, 3:30 PM</span><span style="font-size:12px">4 year checkup with Dr Thackwell</span></div>
    <div class="pd-tile">${ic("doc", 16)}<span>Preschool form ready</span><span class="badge">Sign</span></div>
    <div class="pd-tile">${ic("chat", 16)}<span>Message from Callum</span><span class="badge">New</span></div>
    <div class="pd-tile">${ic("chart", 16)}<span>Growth chart</span>${ic("chevron", 14)}</div>
    <div class="pd-tile">${ic("shield", 16)}<span>Immunization record</span>${ic("chevron", 14)}</div>
  </div>
</div></section>

<section class="sk-sec" id="reading"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">For parents</span><h2 class="sk-h2">Short reads for the nap window</h2></div><p class="muted" style="max-width:380px">General topics written by our team. They never replace a visit or a call to the nurse line.</p></div>
  <div class="pd-read">
    <a class="card pd-lead" href="#"><span class="pd-tag">New baby · 4 min</span><h3>What to expect at your baby’s first checkup</h3><span style="font-weight:600;display:inline-flex;gap:6px;align-items:center">Read the guide ${ic("arrow", 15)}</span></a>
    <div class="pd-arts">${ARTS.map(([g, t, m]) => `<a href="#"><span class="pd-tag">${g} · ${m}</span><h3>${t}</h3></a>`).join("")}</div>
  </div>
</div></section>

<section class="sk-sec sk-alt" id="clinicians"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">Clinicians</span><h2 class="sk-h2">Someone who knows your child</h2></div><p class="muted" style="max-width:380px">Well visits are booked with the same clinician where we can. Sick visits go to whoever is free first.</p></div>
  <div class="pd-docs sk-rail">${DOCS.map(([id, s, h, c, n, r, t, d]) => `<article class="pd-doc">${face(id, s, h, c)}<div><h3>${n}</h3><div class="role">${r}</div><div class="pd-int">${t.map((x) => `<span>${x}</span>`).join("")}</div><p>${d}</p></div></article>`).join("")}</div>
  <div class="pd-slot">${ic("plus", 16)}<span>Add your registration and accreditation details here</span></div>
</div></section>

<section class="sk-sec" id="book-a-visit"><div class="sk-wrap pd-visit">
  <div><span class="sk-eyebrow">Hours and booking</span><h2 class="sk-h2" style="margin-top:12px">27 Tallis Row</h2>
    <table class="pd-hours"><tbody>${HOURS.map(([d, h, c]) => `<tr class="${c || ""}"><td>${d}</td><td>${h}</td></tr>`).join("")}</tbody></table>
    <div class="pd-tip"><b>Sick today?</b> Phoning is quicker than this form. Call (555) 014-2230 from 8:00 AM.</div></div>
  <form class="card pd-form" aria-label="Book a visit">
    <h2 class="sk-h3" style="font-size:calc(26px * var(--hs))">Book a visit</h2>
    <p class="muted" style="font-size:14px">We will text you to confirm, usually within one working hour.</p>
    <div class="sk-g2"><div class="sk-field"><label for="pd-child">Child’s name</label><input class="sk-input" id="pd-child" value="Theo Arlowe"></div><div class="sk-field"><label for="pd-age">Child’s age</label><input class="sk-input" id="pd-age" value="18 months"></div></div>
    <div class="sk-field"><span style="font-weight:500;font-size:13px">Type of visit</span><div class="pd-radio"><label class="on"><input type="radio" name="pd-type" checked> Checkup</label><label><input type="radio" name="pd-type"> Sick visit</label><label><input type="radio" name="pd-type"> New baby</label><label><input type="radio" name="pd-type"> Forms</label></div></div>
    <div class="sk-g2"><div class="sk-field"><label for="pd-parent">Your name</label><input class="sk-input" id="pd-parent" value="Lin Arlowe"></div><div class="sk-field"><label for="pd-phone">Mobile</label><input class="sk-input" id="pd-phone" value="(555) 014-7719"></div></div>
    <div class="sk-g2"><div class="sk-field"><label for="pd-who">Clinician</label><select class="sk-input" id="pd-who"><option>Dr Imani Thackwell</option><option>Dr Owen Varnholt</option><option>Renata Ibarrola</option><option>First available</option></select></div><div class="sk-field"><label for="pd-when">Preferred time</label><input class="sk-input" id="pd-when" value="After school, Thu"></div></div>
    <button class="btn primary sk-btn-lg" type="button">Request this visit</button>
  </form>
</div></section>
</main>
${K.footer(p, "A family pediatric clinic on Tallis Row, for babies, children and teens. In an emergency, call your local emergency number.", [["Visit", ["27 Tallis Row", "Well side and sick side doors", "Free parking lot"]], ["Contact", ["(555) 014-2230", "Nurse line (555) 014-2231", "hello@wrenfold.example"]], ["Parents", ["Parent portal", "New parent guide", "Forms and records"]]], "Fictional practice created for this template. General information only, not medical advice.")}`, CSS);

module.exports = {
  "pediatrics-website": K.def("pediatrics", "Pediatrics website",
    "a parent-first pediatric clinic home page: navigation with call and book buttons, a hero whose headline asks is your child sick today, answered by a yes panel routing to same-day sick visits, the nurse advice line and after-hours care with an emergency line, beside a not-today panel, a well-child visit schedule by age on a height chart of growing children from newborn to yearly checkups, a first visit and new parent guide with a what-to-bring checklist, a floor plan of the separate well and sick waiting areas, a parent portal on a phone with feature list, short general reading for parents, clinicians with interests and a marked credentials slot, opening hours beside a booking form with the child’s name and age, and a footer",
    ["navigation-header", "hero", "route-panel", "same-day-booking", "nurse-line", "after-hours", "emergency-notice", "visit-schedule", "height-chart", "new-parent-guide", "checklist", "floor-plan", "patient-portal", "phone-mockup", "articles", "team", "credentials-slot", "opening-hours", "booking-form", "footer", "pediatrics"], web),
};
