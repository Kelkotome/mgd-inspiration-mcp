/* Preschool website template (Puddlewick Preschool, a fictional play-based preschool for ages 2 to 5). Warm, handmade home page drawn
   with inline SVG cut-paper shapes: nav, a headline in the sky above a full-width illustrated village scene, "A day at ..." as a
   board-game track of twelve timed stops from arrival to pick-up, rooms by age behind three arched doors with ratios stated as the
   school's own policy, settling-in stepping stones, sessions + fees + term dates, a pinned weekly menu beside the allergy approach,
   staff rows with a dashed registration slot, safeguarding beside a pick-up card, parent notes, book-a-visit form, footer.
   No real curricula, inspectors or authorities. Artwork uses a fixed crayon palette (illustrative); all UI uses the tokens. */
const { ic } = require("../lib");
const K = require("../sitekit");

// fixed crayon palette for the artwork only
const C = { sky: "#BFDDE6", cream: "#F7ECD8", ochre: "#E6B04C", terra: "#D4714A", sage: "#9CC09A", moss: "#6F9E78", plum: "#86597A", ink: "#3A3632", water: "#8CC3D6", bark: "#8C6A4E", stone: "#CFC3AF" };

const CSS = `<style>
.pw{--pw-wob:calc(var(--radius-lg)*2.1) calc(var(--radius-lg)*.8) calc(var(--radius-lg)*1.9) calc(var(--radius-lg)*.9);--pw-tint:color-mix(in oklab,var(--accent) 11%,var(--bg))}
.pw>.sk-sec{padding:36px 0}
.pw .sk-h2{font-size:calc(38px * var(--hs))}
.pw .sk-head{margin-bottom:18px}
.pw .sk-head>div:first-child{max-width:760px}
.pw .sk-head>p{max-width:430px;color:var(--muted)}
.pw-wave{display:block;width:100%;height:16px;fill:var(--surface)}
.pw-wave.flip{transform:rotate(180deg)}
.pw-alt{background:var(--surface)}
/* hero: words in the sky, the village along the bottom */
.pw-hero{background:var(--pw-tint)}
.pw-top{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:40px;align-items:center;padding-top:56px;padding-bottom:14px}
.pw-top>div:first-child{display:grid;gap:18px;justify-items:start}
.pw-hero h1{font-size:calc(66px * var(--hs));line-height:1.12;max-width:860px}
.pw-hero h1 span{text-decoration:underline wavy color-mix(in oklab,var(--primary) 70%,var(--bg)) 3px;text-underline-offset:.1em;text-decoration-skip-ink:none}
.pw-facts{list-style:none;display:flex;flex-wrap:wrap;gap:6px 22px;font-size:14px;font-weight:600}
.pw-facts li{display:inline-flex;gap:7px;align-items:center}
.pw-facts span{color:color-mix(in oklab,var(--primary) 78%,var(--text));display:inline-grid}
.pw-stick{position:relative;width:196px;height:196px;transform:rotate(-7deg);flex:0 0 auto}
.pw-stick svg{position:absolute;inset:0;width:100%;height:100%}
.pw-stick p{position:absolute;inset:0;display:grid;place-content:center;text-align:center;padding:34px;color:${C.ink};font-weight:700;font-size:15px;line-height:1.3}
.pw-stick b{display:block;font:700 26px/1.1 var(--font-b)}
.pw-scene{display:block;line-height:0;height:256px;margin-top:-10px}
.pw-scene svg{display:block;width:100%;height:100%}
/* a day: board-game track */
.pw-board{position:relative}
.pw-track{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;overflow:visible}
.pw-track path{fill:none;stroke:color-mix(in oklab,var(--primary) 55%,var(--border));stroke-width:3;stroke-dasharray:3 9;stroke-linecap:round;vector-effect:non-scaling-stroke}
.pw-stops{list-style:none;position:relative;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));grid-auto-rows:168px;padding-inline:34px}
.pw-stop{padding-right:22px;display:grid;gap:3px;align-content:start;min-width:0}
.pw-sh{display:flex;align-items:center;gap:8px;height:44px;margin-bottom:5px}
.pw-t{display:inline-grid;place-items:center;height:30px;padding:0 11px;border-radius:999px;background:var(--primary);color:var(--on-primary);font:700 14px/1 var(--font-b);white-space:nowrap}
.pw-sh svg{width:44px;height:44px;flex:0 0 auto;border-radius:50%;box-shadow:0 0 0 5px var(--bg)}
.pw-stop b{font-size:16px;line-height:1.25}
.pw-stop p{font-size:13.5px;line-height:1.42;color:var(--muted)}
.pw-stop em{font-style:normal;font-size:12px;font-weight:700;color:color-mix(in oklab,var(--primary) 78%,var(--text))}
${[1, 2, 3, 4].map((n) => `.pw-stop:nth-child(${n}){grid-area:1/${n}}`).join("")}
${[5, 6, 7, 8].map((n) => `.pw-stop:nth-child(${n}){grid-area:2/${9 - n}}`).join("")}
${[9, 10, 11, 12].map((n) => `.pw-stop:nth-child(${n}){grid-area:3/${n - 8}}`).join("")}
/* rooms: three arched doors */
.pw-rooms{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:34px}
.pw-room{display:grid;gap:11px;align-content:start;min-width:0}
.pw-arch{position:relative;height:150px;border-radius:200px 200px var(--radius) var(--radius);overflow:hidden;border:3px solid color-mix(in oklab,var(--text) 78%,transparent)}
.pw-arch svg{display:block;width:100%;height:100%}
.pw-age{justify-self:start;font-size:12.5px;font-weight:700;padding:2px 10px;border:1px dashed color-mix(in oklab,var(--text) 45%,var(--border));border-radius:var(--radius)}
.pw-rh{display:flex;align-items:center;justify-content:space-between;gap:12px}
.pw-rh h3{font-size:calc(25px * var(--hs))}
.pw-ratio{display:grid;grid-template-columns:auto minmax(0,1fr);gap:12px;align-items:center;padding:9px 13px;border-radius:var(--pw-wob);background:color-mix(in oklab,var(--primary) 11%,var(--bg));font-size:13px;line-height:1.35}
.pw-ratio .num{font-size:24px;line-height:1;white-space:nowrap}
.pw-room ul{list-style:none;display:grid;gap:5px;font-size:14px;line-height:1.4}
.pw-room li{display:grid;grid-template-columns:12px minmax(0,1fr);gap:8px}
.pw-room li::before{content:"";width:8px;height:8px;margin-top:6px;border-radius:50% 45% 55% 40%;background:color-mix(in oklab,var(--primary) 70%,var(--bg))}
.pw-who{display:grid;grid-template-columns:44px minmax(0,1fr);gap:10px;align-items:center;font-size:13.5px;line-height:1.35;padding-top:9px;border-top:2px dotted var(--border)}
.pw-who svg,.pw-staff svg{border-radius:50%;display:block}
.pw-pol{margin-top:20px;font-size:13.5px;color:var(--muted);max-width:760px}
/* settling in: stepping stones */
.pw-stones{list-style:none;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:18px}
.pw-sto{display:grid;gap:5px;align-content:start;min-width:0}
.pw-rock{position:relative;width:104px;height:72px;margin-bottom:4px}
.pw-sto:nth-child(even) .pw-rock{margin-top:16px;margin-bottom:-12px}
.pw-rock svg{width:100%;height:100%;display:block}
.pw-rock span{position:absolute;inset:0;display:grid;place-items:center;color:${C.ink};font:700 22px var(--font-b)}
.pw-sto b{font-size:15.5px}
.pw-sto p{font-size:13.5px;line-height:1.42;color:var(--muted)}
/* fees */
.pw-fgrid{display:grid;grid-template-columns:minmax(0,1.42fr) minmax(0,1fr);gap:36px;align-items:start}
.pw-ft{padding:0;overflow:hidden}
.pw-ft table{width:100%;border-collapse:collapse;font-size:14px}
.pw-ft th,.pw-ft td{text-align:left;padding:13px 18px;border-bottom:1px solid var(--border)}
.pw-ft th{font-size:12.5px;font-weight:600;color:var(--muted);background:var(--surface);white-space:nowrap}
.pw-ft td small{display:block;color:var(--muted);font-size:12.5px}
.pw-ft .num,.pw-ft th.r{text-align:right}
.pw-ft td.num{font-size:16px;white-space:nowrap}
.pw-ft tr:last-child td{border-bottom:0}
.pw-ft p{padding:12px 18px;border-top:1px solid var(--border);font-size:13.5px;color:var(--muted)}
.pw-terms{display:grid;gap:9px}
.pw-terms h3{font:600 15px var(--font-b)}
.pw-term{display:grid;grid-template-columns:82px minmax(0,1fr);gap:10px;padding-bottom:8px;border-bottom:2px dotted var(--border);font-size:14px;line-height:1.4}
.pw-term small{display:block;color:var(--muted);font-size:12.5px}
/* meals */
.pw-mgrid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.08fr);gap:44px;align-items:center}
.pw-menu{position:relative;padding:26px 26px 20px;background:var(--bg);border:1px solid var(--border);border-radius:var(--radius);box-shadow:var(--shadow);transform:rotate(-1deg)}
.pw-menu::before{content:"";position:absolute;top:-11px;left:50%;width:96px;height:24px;margin-left:-48px;background:color-mix(in oklab,var(--primary) 30%,var(--bg));opacity:.85;transform:rotate(2deg)}
.pw-menu h3{font-size:calc(21px * var(--hs));margin-bottom:8px}
.pw-mrow{display:grid;grid-template-columns:48px minmax(0,1fr);gap:10px;padding:7px 0;border-top:1px dashed var(--border);font-size:14px;line-height:1.4}
.pw-mrow b{font-size:13px}
.pw-mlist{list-style:none;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px 26px;margin-top:18px}
.pw-mlist li{display:grid;gap:3px;font-size:13.5px;line-height:1.45;color:var(--muted)}
.pw-mlist b{color:var(--text);font-size:14.5px}
/* staff */
.pw-staff{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px 32px}
.pw-p{display:grid;grid-template-columns:68px minmax(0,1fr);gap:13px;align-items:center;min-width:0}
.pw-p b{display:block;font-size:15.5px;line-height:1.25}
.pw-p span{display:block;font-size:12.5px;font-weight:700;color:color-mix(in oklab,var(--primary) 78%,var(--text))}
.pw-p p{font-size:13.5px;line-height:1.38;color:var(--muted)}
.pw-slot{display:grid;align-content:center;gap:3px;padding:12px 15px;border:2px dashed color-mix(in oklab,var(--text) 40%,var(--border));border-radius:var(--radius);font-size:13.5px;line-height:1.4}
/* safeguarding */
.pw-safe{display:grid;grid-template-columns:minmax(0,1.12fr) minmax(0,1fr);gap:48px;align-items:center}
.pw-safe>div:first-child{display:grid;gap:12px;justify-items:start}
.pw-slist{list-style:none;display:grid;gap:9px;font-size:14px;line-height:1.45}
.pw-slist li{display:grid;grid-template-columns:20px minmax(0,1fr);gap:9px}
.pw-slist li>span{color:color-mix(in oklab,var(--primary) 78%,var(--text));margin-top:2px}
.pw-card{padding:0;overflow:hidden}
.pw-card h3{display:flex;justify-content:space-between;gap:12px;align-items:center;padding:13px 18px;border-bottom:1px solid var(--border);font:600 15px var(--font-b);background:color-mix(in oklab,var(--primary) 9%,var(--bg))}
.pw-card ul{list-style:none;padding:6px 18px}
.pw-card li{display:flex;justify-content:space-between;gap:12px;padding:8px 0;border-bottom:1px dashed var(--border);font-size:14px}
.pw-card li span{color:var(--muted);font-size:13px;text-align:right}
.pw-card li:last-child{border-bottom:0}
.pw-card p{padding:11px 18px 14px;border-top:1px solid var(--border);font-size:13.5px;line-height:1.45;color:var(--muted)}
/* parent notes */
.pw-notes{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:30px;padding-top:6px}
.pw-note{position:relative;margin:0;padding:24px 22px 18px;background:color-mix(in oklab,var(--accent) 13%,var(--bg));border-radius:var(--radius);box-shadow:var(--shadow-sm)}
.pw-note:nth-child(1){transform:rotate(-1.2deg)}
.pw-note:nth-child(2){transform:rotate(.8deg);background:color-mix(in oklab,var(--primary) 12%,var(--bg))}
.pw-note:nth-child(3){transform:rotate(-.5deg)}
.pw-note::before{content:"";position:absolute;top:-8px;left:50%;width:18px;height:18px;margin-left:-9px;border-radius:50%;background:${C.terra};box-shadow:inset -3px -3px 0 rgba(0,0,0,.14)}
.pw-note p{font-size:15px;line-height:1.5}
.pw-note figcaption{margin-top:9px;font-size:13px;font-weight:700}
/* visit */
.pw-book{display:grid;grid-template-columns:minmax(0,.84fr) minmax(0,1.16fr);gap:44px;align-items:center}
.pw-binfo{display:grid;gap:13px;justify-items:start}
.pw-binfo>p{color:var(--muted)}
.pw-bl{list-style:none;display:grid;gap:9px;font-size:14px}
.pw-bl li{display:flex;gap:10px;align-items:center}
.pw-bl span{color:color-mix(in oklab,var(--primary) 78%,var(--text));display:inline-grid}
.pw-form{padding:24px 28px;display:grid;gap:12px}
.pw-form textarea.sk-input{min-height:66px;padding-block:9px}
.pw~.sk-foot{padding:44px 0 30px}
.pw~.sk-foot .sk-foot-base{margin-top:30px;padding-top:18px}
.pw-form .sk-g2,.pw-form .pw-g3{gap:12px}
.pw-g3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr))}
.pw-radio{display:flex;flex-wrap:wrap;gap:7px}
.pw-radio label{height:38px;padding:0 12px;border:1px solid var(--border);border-radius:var(--radius);display:inline-flex;align-items:center;gap:7px;font-size:14px;font-weight:500;background:var(--bg)}
.pw-radio label.on{border-color:var(--primary);box-shadow:inset 0 0 0 1px var(--primary)}
@media (max-width:1024px){
  .pw-hero h1{font-size:calc(52px * var(--hs))}
  .pw-track{display:none}
  .pw-stops{grid-template-columns:repeat(3,minmax(0,1fr));grid-auto-rows:auto;gap:22px 8px;padding-inline:0}
  .pw-stop:nth-child(n){grid-area:auto}
  .pw-sh svg{box-shadow:none}
  .pw-rooms{gap:20px}
  .pw-stones{grid-template-columns:repeat(3,minmax(0,1fr))}
  .pw-sto:nth-child(even) .pw-rock{margin-top:0;margin-bottom:4px}
  .pw-fgrid,.pw-mgrid,.pw-safe,.pw-book{grid-template-columns:minmax(0,1fr);gap:28px}
  .pw-staff{grid-template-columns:repeat(2,minmax(0,1fr))}
  .pw-notes{gap:20px}
}
@media (max-width:760px){
  .pw>.sk-sec{padding:26px 0}
  .pw .sk-h2{font-size:calc(30px * var(--hs))}
  .pw .sk-head{gap:6px;margin-bottom:14px}
  .pw .sk-head>p{display:none}
  .pw-top{grid-template-columns:minmax(0,1fr);gap:16px;padding-top:30px}
  .pw-hero h1{font-size:calc(40px * var(--hs))}
  .pw-stick{display:none}
  .pw-scene{height:164px;margin-top:0}
  /* the track becomes a dotted line down the left, times beside it */
  .pw-stops{grid-template-columns:minmax(0,1fr);gap:0;padding-inline:0;background:radial-gradient(circle,color-mix(in oklab,var(--primary) 55%,var(--border)) 1.5px,transparent 2px) 27px 0/4px 9px repeat-y}
  .pw-stop{grid-template-columns:58px minmax(0,1fr);gap:0 12px;padding:0 0 9px}
  .pw-sh{grid-row:span 3;height:auto;margin:0;display:block}
  .pw-sh svg{display:none}
  .pw-t{height:24px;padding:0 6px;width:58px;font-size:12.5px}
  .pw-stop b{font-size:15px}
  .pw-stop p{font-size:13px;line-height:1.38}
  .pw-rooms{grid-template-columns:minmax(0,1fr);gap:22px}
  .pw-room{gap:8px}
  .pw-arch{height:96px;border-radius:170px 170px var(--radius) var(--radius)}
  .pw-stones{gap:12px!important}
  .pw-sto{flex-basis:60%!important}
  .pw-note{padding:18px 16px 14px;flex-basis:80%!important;margin-top:9px}
  .pw-note:nth-child(n){transform:none}
  .pw-note p{font-size:14px}
  .pw-ft th,.pw-ft td{padding:10px 12px}
  .pw-ft td.num{font-size:15px}
  .pw-ft p{padding:10px 12px}
  .pw-fx{display:none}
  .pw-terms>p{display:none}
  .pw-fgrid,.pw-mgrid,.pw-safe,.pw-book{gap:20px}
  .pw-mlist{grid-template-columns:minmax(0,1fr);gap:8px;margin-top:10px}
  .pw-mlist li:nth-child(4){display:none}
  .pw-menu{padding:20px 16px 10px;transform:none}
  .pw-mrow{padding:5px 0;font-size:13.5px}
  .pw-staff{grid-template-columns:minmax(0,1fr);gap:11px}
  .pw-p{grid-template-columns:52px minmax(0,1fr);gap:11px;align-items:start}
  .pw-p svg{width:52px;height:52px}
  .pw-slist li:nth-child(4),.pw-safe>div:first-child>p{display:none}
  .pw-bl{display:none}
  .pw-form{padding:18px}
  .pw-form .sk-g2{grid-template-columns:repeat(2,minmax(0,1fr))}
  .pw-g3{grid-template-columns:repeat(2,minmax(0,1fr))}
  .pw-g3>:last-child{grid-column:1/-1}
  .pw~.sk-foot .sk-foot-grid>:nth-child(3){display:none}
  .pw~.sk-foot .sk-foot-grid{grid-template-columns:minmax(0,.72fr) minmax(0,1.28fr)}
  .pw~.sk-foot{padding:36px 0 24px}
  .pw~.sk-foot .sk-foot-base{margin-top:24px}
}
</style>`;

// ---- artwork -------------------------------------------------------------------------------------------------
const wavePath = () => { let d = "M0 22V11"; for (let x = 0; x < 1440; x += 120) d += `q30 -11 60 0t60 0`; return `${d}V22z`; };
const wave = (flip) => `<svg class="pw-wave${flip ? " flip" : ""}" viewBox="0 0 1440 22" preserveAspectRatio="none" aria-hidden="true"><path d="${wavePath()}"/></svg>`;

const kid = (x, y, coat, hat, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-14 0 -9 -38h18l5 38z" fill="${coat}"/><circle cy="-48" r="11" fill="#E9C3A0"/><path d="M-12 -50a12 12 0 0 1 24 0z" fill="${hat}"/><path d="M-7 0v14M7 0v14" stroke="${C.ink}" stroke-width="4"/><rect x="-11" y="12" width="9" height="9" rx="2" fill="${C.ochre}"/><rect x="3" y="12" width="9" height="9" rx="2" fill="${C.ochre}"/></g>`;
const duck = (x, y, s = 1, f = 1) => `<g transform="translate(${x} ${y}) scale(${s * f} ${s})"><path d="M-20 0c0-12 14-16 26-12 2-10 18-12 20 0l9 3-9 3c-2 16-14 18-26 18S-20 8-20 0z" fill="${C.cream}"/><circle cx="17" cy="-12" r="1.8" fill="${C.ink}"/><path d="M26-11l9 3-9 3z" fill="${C.ochre}"/></g>`;
const cloud = (x, y, s = 1) => `<path transform="translate(${x} ${y}) scale(${s})" d="M0 26c-14 0-16-18-2-20 3-12 22-12 28-2 12-6 26 2 22 14 8 2 6 10-2 10z" fill="${C.cream}" opacity=".9"/>`;
const tree = (x, y, s = 1, g = C.moss) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-7 0h14l-3-52h-8z" fill="${C.bark}"/><circle cx="-20" cy="-66" r="30" fill="${g}"/><circle cx="20" cy="-70" r="32" fill="${g}"/><circle cy="-98" r="32" fill="${g}"/></g>`;

const scene = () => `<svg viewBox="0 44 1440 256" preserveAspectRatio="xMidYMax slice" role="img" aria-label="Cut-paper village: a small school house, a tree, a kite, ducks on a puddle and two children in wellies">
<circle cx="1200" cy="112" r="40" fill="${C.ochre}"/>${cloud(40, 104, 1.3)}${cloud(860, 66, 1.1)}${cloud(1330, 74, .9)}
<path d="M0 190C180 120 400 130 640 176S1100 120 1440 170V300H0z" fill="${C.sage}"/>
${tree(190, 226, 1)}${tree(1290, 214, .86)}
<path d="M0 240C240 190 500 262 760 232S1200 196 1440 236V300H0z" fill="${C.moss}"/>
<g transform="translate(600 112)"><rect x="10" y="58" width="196" height="106" fill="${C.cream}"/><path d="M-12 62 108 0l120 62z" fill="${C.terra}"/><rect x="152" y="12" width="20" height="34" fill="${C.bark}"/>
<path d="M88 164v-50a20 20 0 0 1 40 0v50z" fill="${C.plum}"/><circle cx="120" cy="134" r="3" fill="${C.ochre}"/>
<rect x="30" y="86" width="38" height="38" rx="3" fill="${C.sky}"/><path d="M49 86v38M30 105h38" stroke="${C.cream}" stroke-width="3"/><rect x="148" y="86" width="38" height="38" rx="3" fill="${C.sky}"/><path d="M167 86v38M148 105h38" stroke="${C.cream}" stroke-width="3"/>
<path d="M0 66q54 26 108 0t108 0" fill="none" stroke="${C.ink}" stroke-width="1.5"/>${[20, 56, 92, 128, 164, 196].map((x, i) => `<path d="M${x} ${70 + (i % 3) * 3}l8 14 8-14z" fill="${[C.ochre, C.plum, C.water][i % 3]}"/>`).join("")}</g>
<g stroke="${C.cream}" stroke-width="6">${Array.from({ length: 13 }, (_, i) => `<path d="M${870 + i * 22} 276v-30"/>`).join("")}</g><path d="M860 256h280" stroke="${C.cream}" stroke-width="5"/>
<path d="M1042 56l30 26-26 34-30-30z" fill="${C.terra}"/><path d="M1042 56l4 60M1016 86l56-4" stroke="${C.cream}" stroke-width="2"/><path d="M1046 116c-8 34 30 40 6 74s-82 28-96 58" fill="none" stroke="${C.ink}" stroke-width="1.5"/>
<ellipse cx="520" cy="270" rx="136" ry="20" fill="${C.water}"/><ellipse cx="520" cy="270" rx="92" ry="12" fill="none" stroke="${C.cream}" stroke-width="2" opacity=".7"/><ellipse cx="520" cy="270" rx="46" ry="6" fill="none" stroke="${C.cream}" stroke-width="2" opacity=".7"/>
${duck(450, 262, .8)}${duck(404, 268, .55)}${kid(562, 256, C.terra, C.plum)}${kid(926, 268, C.ochre, C.terra, .92)}
<g transform="translate(690 278)"><path d="M0 0v-24h12v14h12v10z" fill="${C.ochre}"/><path d="M30 0v-24h12v14h12v10z" fill="${C.terra}"/></g>
</svg>`;

const ICONS = {
  peg: `<path d="M9 13h30" stroke="${C.bark}" stroke-width="4" stroke-linecap="round"/><path d="M24 13 13 22v17h22V22z" fill="${C.terra}"/><path d="M24 13v26" stroke="${C.cream}" stroke-width="1.5"/>`,
  sun: `<circle cx="24" cy="24" r="9" fill="${C.ochre}"/>${[0, 45, 90, 135, 180, 225, 270, 315].map((a) => `<path transform="rotate(${a} 24 24)" d="M24 7v6" stroke="${C.ochre}" stroke-width="3" stroke-linecap="round"/>`).join("")}`,
  brush: `<path d="M34 9 19 26" stroke="${C.bark}" stroke-width="5" stroke-linecap="round"/><path d="M20 23c5 3 5 8 1 11-3 3-9 3-11 3 2-2 2-6 3-9 1-4 4-6 7-5z" fill="${C.plum}"/><circle cx="34" cy="33" r="4" fill="${C.water}"/>`,
  apple: `<path d="M24 16c-9-5-15 2-14 10 1 9 7 15 11 14 2 0 4 0 6 0 4 1 10-5 11-14 1-8-5-15-14-10z" fill="${C.terra}"/><path d="M24 16c0-4 3-7 7-7 0 4-3 7-7 7z" fill="${C.moss}"/>`,
  boots: `<path d="M12 12h9v18h8v7H12z" fill="${C.ochre}"/><path d="M27 12h8v18h6v7h-5l-9-6z" fill="${C.terra}"/>`,
  book: `<path d="M24 15c-5-4-10-4-15-3v23c5-1 10-1 15 3 5-4 10-4 15-3V12c-5-1-10-1-15 3z" fill="${C.water}"/><path d="M24 15v23" stroke="${C.cream}" stroke-width="2"/>`,
  plate: `<circle cx="24" cy="24" r="14" fill="#fff"/><circle cx="24" cy="24" r="9" fill="${C.sage}"/><circle cx="21" cy="23" r="3" fill="${C.terra}"/><circle cx="27" cy="26" r="2.5" fill="${C.ochre}"/>`,
  moon: `<path d="M31 9a16 16 0 1 0 8 23A14 14 0 0 1 31 9z" fill="${C.plum}"/><circle cx="35" cy="17" r="2" fill="${C.ochre}"/>`,
  seed: `<path d="M15 29h18l-3 11H18z" fill="${C.terra}"/><path d="M24 29V17" stroke="${C.moss}" stroke-width="3"/><path d="M24 20c-1-6-6-8-10-8 0 5 4 9 10 8zM24 17c1-5 5-7 9-7 0 5-4 8-9 7z" fill="${C.moss}"/>`,
  drum: `<path d="M11 21v13c0 4 26 4 26 0V21z" fill="${C.terra}"/><ellipse cx="24" cy="21" rx="13" ry="5" fill="#fff"/><path d="M15 8l9 12M34 8l-9 12" stroke="${C.bark}" stroke-width="2.5" stroke-linecap="round"/>`,
  pear: `<path d="M24 12c-4 0-5 4-6 8-2 5-6 7-6 12 0 6 6 8 12 8s12-2 12-8c0-5-4-7-6-12-1-4-2-8-6-8z" fill="${C.sage}"/><path d="M24 12c0-3 1-4 3-5" stroke="${C.bark}" stroke-width="2.5" stroke-linecap="round"/>`,
  door: `<path d="M13 40V20a11 11 0 0 1 22 0v20z" fill="${C.plum}"/><circle cx="30" cy="27" r="2" fill="${C.ochre}"/>`,
};
const ico = (k) => `<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="24" fill="${C.cream}"/>${ICONS[k]}</svg>`;

const ROOM_ART = {
  tadpoles: () => `<svg viewBox="0 0 360 172" preserveAspectRatio="xMidYMax slice" role="img" aria-label="Tadpoles swimming among pondweed"><rect width="360" height="172" fill="${C.water}"/><path d="M0 138q45-18 90 0t90 0 90 0 90 0v34H0z" fill="${C.sky}" opacity=".6"/>${[[92, 84, 12], [176, 58, -14], [258, 96, 20], [150, 118, 4], [226, 40, -20]].map(([x, y, r]) => `<g transform="translate(${x} ${y}) rotate(${r})"><ellipse rx="11" ry="9" fill="${C.ink}"/><path d="M-9 0c-14-8-20 8-34 0" fill="none" stroke="${C.ink}" stroke-width="4" stroke-linecap="round"/><circle cx="5" cy="-3" r="1.8" fill="#fff"/></g>`).join("")}<path d="M40 172c-8-40 10-50 0-84M62 172c6-30-8-40 4-62M312 172c8-34-10-44 2-76" fill="none" stroke="${C.moss}" stroke-width="6" stroke-linecap="round"/></svg>`,
  froglets: () => `<svg viewBox="0 0 360 172" preserveAspectRatio="xMidYMax slice" role="img" aria-label="A small frog on a lily pad"><rect width="360" height="172" fill="${C.sage}"/><ellipse cx="180" cy="150" rx="210" ry="38" fill="${C.water}"/><ellipse cx="180" cy="134" rx="84" ry="18" fill="${C.moss}"/><path d="M180 134 264 128l-60 18z" fill="${C.water}"/><g transform="translate(174 116)"><ellipse rx="34" ry="24" fill="#7FB069"/><circle cx="-16" cy="-22" r="10" fill="#7FB069"/><circle cx="16" cy="-22" r="10" fill="#7FB069"/><circle cx="-16" cy="-23" r="5" fill="#fff"/><circle cx="16" cy="-23" r="5" fill="#fff"/><circle cx="-15" cy="-23" r="2.4" fill="${C.ink}"/><circle cx="17" cy="-23" r="2.4" fill="${C.ink}"/><path d="M-14 -2q14 10 28 0" fill="none" stroke="${C.ink}" stroke-width="2.5" stroke-linecap="round"/></g><circle cx="70" cy="54" r="5" fill="${C.cream}"/><circle cx="298" cy="72" r="4" fill="${C.cream}"/></svg>`,
  wagtails: () => `<svg viewBox="0 0 360 172" preserveAspectRatio="xMidYMax slice" role="img" aria-label="A wagtail perched on a branch"><rect width="360" height="172" fill="${C.sky}"/><circle cx="288" cy="46" r="24" fill="${C.ochre}"/><path d="M0 134c80-20 150-8 220-20s100-6 140-16" fill="none" stroke="${C.bark}" stroke-width="10" stroke-linecap="round"/><g transform="translate(170 104)"><path d="M-40 -8C-20 -38 26 -36 34 -8 26 8-10 10-40-8z" fill="#fff"/><path d="M-34 -8C-20 -26 6 -30 18 -14-2 -4-22 -2-34-8z" fill="${C.ink}"/><path d="M-36 -8-96 -26l-2 8 62 18z" fill="${C.ink}"/><circle cx="26" cy="-22" r="13" fill="#fff"/><path d="M15 -30a13 13 0 0 1 24 3z" fill="${C.ink}"/><circle cx="30" cy="-23" r="2" fill="${C.ink}"/><path d="M38 -22l11 3-11 3z" fill="${C.ochre}"/><path d="M-6 8v12M8 7v12" stroke="${C.ink}" stroke-width="2.5"/></g><path d="M96 124c-8-14-2-22 6-24 4 10 2 18-6 24zM262 104c-4-14 4-20 12-22 2 10-2 18-12 22z" fill="${C.moss}"/></svg>`,
};
// paper-doll portrait: skin, hair, top, hair shape
const face = (skin, hair, top, kind, s = 68) => `<svg width="${s}" height="${s}" viewBox="0 0 68 68" role="img" aria-label="Illustrated portrait"><circle cx="34" cy="34" r="34" fill="${C.cream}"/><path d="M8 68c2-16 14-22 26-22s24 6 26 22z" fill="${top}"/>${kind === "long" ? `<path d="M15 44C10 18 22 10 34 10s24 8 19 34z" fill="${hair}"/>` : ""}${kind === "scarf" ? `<path d="M12 54C8 20 20 9 34 9s26 11 22 45c-6 5-38 5-44 0z" fill="${hair}"/>` : ""}<circle cx="34" cy="30" r="15" fill="${skin}"/>${kind === "bun" ? `<circle cx="34" cy="10" r="7" fill="${hair}"/>` : ""}<path d="M19 28c0-14 30-14 30 0-6-5-10-6-15-6s-10 1-15 6z" fill="${hair}"/><circle cx="28" cy="31" r="1.6" fill="${C.ink}"/><circle cx="40" cy="31" r="1.6" fill="${C.ink}"/><path d="M29 37q5 4 10 0" fill="none" stroke="${C.ink}" stroke-width="1.6" stroke-linecap="round"/></svg>`;
const rock = (i) => { const d = ["M8 40C4 18 32 6 58 8s44 16 40 36-34 24-56 20S12 58 8 40z", "M6 34C8 12 40 2 66 8s36 24 28 40-40 20-60 16S4 54 6 34z"][i % 2]; return `<svg viewBox="0 0 104 72" aria-hidden="true"><path d="${d}" fill="${C.stone}"/><path d="M26 22c10-8 28-10 40-6" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".55"/></svg>`; };
const burst = () => { let d = ""; const n = 16; for (let i = 0; i < n; i++) { const a0 = (i / n) * Math.PI * 2, a1 = ((i + 1) / n) * Math.PI * 2; const [x0, y0, x1, y1] = [100 + 88 * Math.cos(a0), 100 + 88 * Math.sin(a0), 100 + 88 * Math.cos(a1), 100 + 88 * Math.sin(a1)]; d += `${i ? "" : `M${x0.toFixed(1)} ${y0.toFixed(1)}`}A17 17 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`; } return `<svg viewBox="0 0 200 200" aria-hidden="true"><path d="${d}z" fill="${C.ochre}"/><circle cx="100" cy="100" r="74" fill="none" stroke="${C.cream}" stroke-width="2" stroke-dasharray="3 7" stroke-linecap="round"/></svg>`; };

const DAY = [
  ["8:00", "peg", "Doors open", "Coats on pegs, names on the board, and a goodbye that takes as long as it needs."],
  ["9:00", "sun", "Morning circle", "Who is here, what the sky is doing, and one song everyone knows."],
  ["9:20", "brush", "Play indoors", "Paint, blocks, water tray and home corner. Children choose, adults join in."],
  ["10:15", "apple", "Snack table", "Fruit and toast. Children pour their own water and clear their own cups."],
  ["10:45", "boots", "Garden in all weathers", "Mud kitchen, digging patch, and puddles when there are puddles."],
  ["11:45", "book", "Wash and story", "Everyone back in, hands washed, one story on the rug."],
  ["12:00", "plate", "Lunch", "Cooked here and eaten at small tables with an adult at each.", "Mornings go home at 12:30"],
  ["12:45", "moon", "Rest", "Twos nap on low beds. Older children rest with books and quiet music."],
  ["1:45", "seed", "Small groups", "Cooking, planting, mark-making and counting games in fours and fives."],
  ["2:45", "drum", "Music and moving", "Drums, scarves and a lot of stamping before the afternoon snack.", "School day ends at 3:00"],
  ["3:15", "pear", "Snack and garden", "A second snack, then outside until the light or the rain says otherwise."],
  ["4:15", "door", "Slow hour and pick-up", "Puzzles and being read to. You get a real handover until 5:30."],
];
const ROOMS = [
  ["tadpoles", "Tadpoles", "Age 2", "1 to 4", "One adult to four children, 12 children in the room", ["Water, sand, playdough and picture books", "Learning to pour, wash hands and find a coat", "One key person for nappies and naps"], face("#E9C3A0", "#6B4A2F", C.moss, "bun", 44), "Imelda Farrowby", "and two key people"],
  ["froglets", "Froglets", "Age 3", "1 to 6", "One adult to six children, 18 children in the room", ["Dressing up, block building and big paintings", "Taking turns and making first friendships", "Help with toilet training, at your child’s pace"], face("#B9825A", "#2E2A26", C.terra, "short", 44), "Hamid Quillen", "and two key people"],
  ["wagtails", "Wagtails", "Age 4 to 5", "1 to 8", "One adult to eight children, 24 children in the room", ["Longer projects the children choose themselves", "Letters, sounds and counting through games", "Practice for school: lunch trays, coats, listening"], face("#8A5A3C", C.plum, C.ochre, "scarf", 44), "Noor Penhallow", "and two key people"],
];
const STONES = [
  ["Hello at home", "Your child’s key person calls or visits and learns the names of their favourite things."],
  ["Stay and play", "You and your child spend an hour in the room together."],
  ["A short goodbye", "You leave for half an hour and stay close by."],
  ["A whole morning", "Your child stays through snack and garden time."],
  ["First full session", "We ring you at ten to say how it is going."],
];
const FEES = [["Mornings", "8:30 to 12:30, with lunch", "$96", "$138", "$215"], ["School day", "8:30 to 3:00", "$148", "$215", "$340"], ["Full day", "8:00 to 5:30", "$192", "$280", "$445"]];
const TERMS = [["Autumn", "1 Sep to 18 Dec", "Half term 26 to 30 Oct"], ["Spring", "5 Jan to 26 Mar", "Half term 15 to 19 Feb"], ["Summer", "12 Apr to 16 Jul", "Half term 31 May to 4 Jun"]];
const MENU = [["Mon", "Lentil and carrot soup, bread, pears"], ["Tue", "Fish pie, peas, stewed apple"], ["Wed", "Chickpea and spinach curry, rice, yoghurt"], ["Thu", "Roast chicken, potatoes, green beans, banana"], ["Fri", "Vegetable pasta bake, salad, melon"]];
const STAFF = [
  ["Bronwen Thackaby", "Director", "Degree in early childhood studies. Runs the school and still does Friday story time.", face("#E9C3A0", "#A9A29A", C.plum, "long")],
  ["Imelda Farrowby", "Tadpoles lead", "Early years diploma, with extra training in caring for under-threes.", face("#E9C3A0", "#6B4A2F", C.moss, "bun")],
  ["Hamid Quillen", "Froglets lead", "Early years diploma, with training in speech and language support.", face("#B9825A", "#2E2A26", C.terra, "short")],
  ["Noor Penhallow", "Wagtails lead", "Early years teaching qualification and outdoor learning training.", face("#8A5A3C", C.plum, C.ochre, "scarf")],
  ["Luis Marrable", "Cook", "Food hygiene and allergy awareness training. Knows every child’s plate.", face("#D9A97E", "#4A3A2C", C.water, "short")],
];
const SAFE = [
  "Everyone who works here has background checks and references before they start, and safeguarding training every year.",
  "A named safeguarding lead takes any worry about a child the same day and follows the local reporting process.",
  "Personal phones stay in the office. Photos are taken on school tablets only, with your permission.",
  "Doors stay locked. Visitors sign in and are never alone with children.",
];
const NOTES = [
  ["Theo cried at the door for a week. Imelda rang me at ten every morning to say he had stopped. By week three he ran in without looking back.", "Hana, Theo’s mum"],
  ["The handover is the best part. I actually know what she ate, how long she slept and who she played with.", "Sam, Mirela’s dad"],
  ["He comes home soaked and happy most days. Keep the spare clothes bag full, they mean it.", "Paula, Oskar’s grandmother"],
];

const render = (p, st) => {
  const short = p.name.split(" ")[0];
  return K.page(st, `${K.nav(p, ["A day here", "Rooms", "Fees", "Meals", "Staff"], "Book a visit", "(555) 014-7736")}
<main class="pw">
<section class="pw-hero" id="top">
  <div class="sk-wrap pw-top">
    <div>
      <span class="sk-eyebrow">Play-based preschool for ages 2 to 5</span>
      <h1 class="sk-h1">Wellies by the door, <span>paint on the sleeves.</span></h1>
      <p class="sk-lede">${p.name} is a small school where most of the day happens on the floor, in the garden, or up to the elbows in something.</p>
      <div class="sk-row"><a class="btn primary sk-btn-lg" href="#book-a-visit">Book a visit</a><a class="btn sk-btn-lg" href="#a-day-here">See a day here</a></div>
      <ul class="pw-facts">${[["users", "54 children"], ["clock", "Open 8:00 to 5:30"], ["sun", "Outside every day"], ["heart", "Cooked lunches"]].map(([i, t]) => `<li><span>${ic(i, 16)}</span>${t}</li>`).join("")}</ul>
    </div>
    <div class="pw-stick">${burst()}<p><span>Come and see</span><b>Tue and Thu</b><span>at 10:00</span></p></div>
  </div>
  <div class="pw-scene">${scene()}</div>
</section>

<section class="sk-sec" id="a-day-here"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">The shape of the day</span><h2 class="sk-h2">A day at ${short}</h2></div><p>The times are a guide, not a timetable. If everyone is deep in a mud kitchen, the story can wait ten minutes.</p></div>
  <div class="pw-board"><svg class="pw-track" viewBox="0 0 1000 504" preserveAspectRatio="none" aria-hidden="true"><path d="M30 22H940C1000 22 1000 190 940 190H62C2 190 2 358 62 358H960"/></svg>
  <ol class="pw-stops">${DAY.map(([t, i, h, x, tag]) => `<li class="pw-stop"><div class="pw-sh"><span class="pw-t">${t}</span>${ico(i)}</div><b>${h}</b><p>${x}</p>${tag ? `<em>${tag}</em>` : ""}</li>`).join("")}</ol></div>
</div></section>

${wave()}<section class="sk-sec pw-alt" id="rooms"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">Rooms by age</span><h2 class="sk-h2">Three rooms, one garden</h2></div><p>Children move up when they are ready, not on a birthday. Each child has a key person who knows them best.</p></div>
  <div class="pw-rooms">${ROOMS.map(([k, n, a, r, rt, l, f, who, w]) => `<article class="pw-room"><div class="pw-arch">${ROOM_ART[k]()}</div><div class="pw-rh"><h3>${n}</h3><span class="pw-age">${a}</span></div>
    <div class="pw-ratio"><b class="num">${r}</b><span>${rt}</span></div>
    <ul>${l.map((x) => `<li><span>${x}</span></li>`).join("")}</ul>
    <div class="pw-who">${f}<span><b>${who}</b> ${w}</span></div></article>`).join("")}</div>
  <p class="pw-pol">These ratios are our own policy, and at lunch and rest we add another adult to each room. Rules differ from place to place, so check what applies near you.</p>
</div></section>${wave(1)}

<section class="sk-sec" id="settling-in"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">Settling in</span><h2 class="sk-h2">One stepping stone at a time</h2></div><p>Most children take about two weeks and some take longer. Settling visits are free, and nobody is rushed across.</p></div>
  <ol class="pw-stones sk-rail">${STONES.map(([t, x], i) => `<li class="pw-sto"><div class="pw-rock">${rock(i)}<span>${i + 1}</span></div><b>${t}</b><p>${x}</p></li>`).join("")}</ol>
</div></section>

${wave()}<section class="sk-sec pw-alt" id="fees"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">Sessions, fees and term dates</span><h2 class="sk-h2">What it costs, plainly</h2></div></div>
  <div class="pw-fgrid">
    <div class="card pw-ft"><table><thead><tr><th>Session</th><th class="r">2 days</th><th class="r">3 days</th><th class="r">5 days</th></tr></thead><tbody>${FEES.map(([s, h, a, b, c]) => `<tr><td><b>${s}</b><small>${h}</small></td><td class="num">${a}</td><td class="num">${b}</td><td class="num">${c}</td></tr>`).join("")}</tbody></table>
      <p>Weekly fees, billed monthly, with meals, snacks, nappies and outdoor suits included. <span class="pw-fx">Term-time places run 38 weeks and all-year places run 48. There is a one-off $60 registration fee, and any funded hours you are entitled to come off your bill.</span></p></div>
    <div class="pw-terms"><h3>Term dates 2026 to 2027</h3>${TERMS.map(([t, d, h]) => `<div class="pw-term"><b>${t}</b><span>${d}<small>${h}</small></span></div>`).join("")}<p class="muted" style="font-size:13.5px">All-year places carry on through the holidays, closing for two weeks at midwinter and two training days.</p></div>
  </div>
</div></section>${wave(1)}

<section class="sk-sec" id="meals"><div class="sk-wrap pw-mgrid">
  <div class="pw-menu"><h3>This week’s lunches</h3>${MENU.map(([d, m]) => `<div class="pw-mrow"><b>${d}</b><span>${m}</span></div>`).join("")}</div>
  <div><span class="sk-eyebrow">Meals and allergies</span><h2 class="sk-h2" style="margin-top:12px">Cooked here, eaten together</h2>
    <ul class="pw-mlist">${[["Written allergy plans", "We write one with you before your child starts, and it goes up in the kitchen and their room."], ["A nut-free kitchen", "We don’t cook with nuts and ask families not to send them. We can’t promise a food is free of traces."], ["Other diets", "Vegetarian, halal and dairy-free lunches are cooked each day at no extra charge."], ["If something happens", "Staff follow your child’s plan, then phone you straight away."]].map(([h, t]) => `<li><b>${h}</b>${t}</li>`).join("")}</ul></div>
</div></section>

${wave()}<section class="sk-sec pw-alt" id="staff"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">The grown-ups</span><h2 class="sk-h2">Who looks after your child</h2></div><p>All our staff hold paediatric first aid training and spend at least one day a term on further training.</p></div>
  <div class="pw-staff">${STAFF.map(([n, r, t, f]) => `<div class="pw-p">${f}<div><span>${r}</span><b>${n}</b><p>${t}</p></div></div>`).join("")}
    <div class="pw-slot"><b>Add your registration and inspection details here</b><span class="muted">Your licence number and latest inspection report.</span></div></div>
</div></section>${wave(1)}

<section class="sk-sec" id="safeguarding"><div class="sk-wrap pw-safe">
  <div><span class="sk-eyebrow">Safeguarding and pick-up</span><h2 class="sk-h2">Keeping children safe, every day</h2>
    <ul class="pw-slist">${SAFE.map((t) => `<li><span>${ic("shield", 16)}</span>${t}</li>`).join("")}</ul>
    <p class="muted" style="font-size:13.5px">Our full policies are on the noticeboard, and we will send them to you whenever you ask.</p></div>
  <div class="card pw-card"><h3>Pick-up card <span class="badge">Theo, Froglets</span></h3>
    <ul>${[["Hana Tesmer", "Mum"], ["Jonas Tesmer", "Dad"], ["Ruth Tesmer", "Grandmother, photo on file"]].map(([a, b]) => `<li>${a}<span>${b}</span></li>`).join("")}</ul>
    <p>We only hand children to the adults on their card. If someone new is coming, call us by noon with your family password, and ask them to bring photo ID.</p></div>
</div></section>

${wave()}<section class="sk-sec pw-alt" id="parent-notes"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">From the parents’ board</span><h2 class="sk-h2">Notes left by the coat pegs</h2></div></div>
  <div class="pw-notes sk-rail">${NOTES.map(([t, w]) => `<figure class="pw-note"><p>${t}</p><figcaption>${w}</figcaption></figure>`).join("")}</div>
</div></section>${wave(1)}

<section class="sk-sec" id="book-a-visit"><div class="sk-wrap pw-book">
  <div class="pw-binfo"><span class="sk-eyebrow">Book a visit</span><h2 class="sk-h2">Come when the rooms are busy</h2>
    <p>Visits are on Tuesdays and Thursdays at 10:00 and take about 40 minutes. Bring your child, and wellies if it has rained. Places for twos go first, so tell us early.</p>
    <ul class="pw-bl">${[["pin", "12 Brambling Lane"], ["phone", "(555) 014-7736"], ["mail", "hello@puddlewick.example"], ["clock", "Monday to Friday, 8:00 to 5:30"]].map(([i, t]) => `<li><span>${ic(i, 16)}</span>${t}</li>`).join("")}</ul></div>
  <form class="card pw-form" aria-label="Book a visit">
    <div class="sk-g2"><div class="sk-field"><label for="pw-name">Your name</label><input class="sk-input" id="pw-name" value="Hana Tesmer"></div><div class="sk-field"><label for="pw-tel">Phone</label><input class="sk-input" id="pw-tel" value="(555) 014-2291"></div></div>
    <div class="pw-g3"><div class="sk-field"><label for="pw-child">Child’s first name</label><input class="sk-input" id="pw-child" value="Theo"></div>
    <div class="sk-field"><label for="pw-age">Child’s age</label><select class="sk-input" id="pw-age"><option>2 years</option><option selected>3 years</option><option>4 years</option><option>Under 2, joining the list</option></select></div>
    <div class="sk-field"><label for="pw-start">Preferred start</label><select class="sk-input" id="pw-start"><option selected>January 2027</option><option>April 2027</option><option>September 2027</option></select></div></div>
    <div class="sk-field"><span style="font-weight:500;font-size:13px">Session you’re thinking about</span><div class="pw-radio"><label><input type="radio" name="pw-s"> Mornings</label><label class="on"><input type="radio" name="pw-s" checked> School day</label><label><input type="radio" name="pw-s"> Full day</label></div></div>
    <div class="sk-field"><label for="pw-note">Anything we should know?</label><textarea class="sk-input" id="pw-note" rows="2">Theo is shy at first and has a dairy allergy.</textarea></div>
    <button class="btn primary sk-btn-lg" type="button" style="justify-self:start">Request a visit</button>
  </form>
</div></section>
</main>
${K.footer(p, "A small, play-based preschool for ages 2 to 5, outdoors every day.", [["Visit", ["12 Brambling Lane", "Tuesdays and Thursdays at 10:00", "Pram park by the gate"]], ["For families", ["Term dates", "This week’s menu", "Policies", "What to pack"]], ["Contact", ["(555) 014-7736", "hello@puddlewick.example"]]], "Fictional preschool created for this template. Names, fees and dates are sample content.")}`, CSS);
};

module.exports = {
  "preschool-website": K.def("preschool", "Preschool website",
    "a warm, handmade preschool home page illustrated with cut-paper svg shapes: navigation with phone and book-a-visit, a headline in the sky above a full-width village scene with a visit sticker, a day at the preschool as a board-game track of twelve timed stops from arrival to pick-up, rooms by age behind three arched doors with ratios stated as the school's own policy, what children do and who looks after them, five settling-in stepping stones, a weekly fees table by session with term dates, a pinned weekly menu beside allergy and diet notes, staff rows with early-years training and a dashed slot for registration and inspection details, safeguarding beside a pick-up card, pinned parent notes, a book-a-visit form with child's age and preferred start, footer",
    ["navigation-header", "illustrated-hero", "sticker-badge", "daily-timeline", "board-game-track", "rooms-by-age", "staff-ratio", "stepping-stones", "steps", "pricing-table", "term-dates", "weekly-menu", "allergy-notes", "team", "credentials-slot", "safeguarding", "pick-up-card", "sticky-notes", "testimonials", "booking-form", "footer", "preschool"], render),
};
