/* Veterinary practice website template (Bramblecote Vets, a fictional neighbourhood practice). Warm illustrated home page: a hillside
   panorama of patients, a "Who's your patient?" picker (radio inputs + CSS, no JS) with typical services per animal, urgent and
   out-of-hours routing, a services list with appointment lengths, a wellness plan comparison table with monthly prices, a new pet
   checklist beside what to bring, a noticeboard of vets and nurses with their own pets, a repeat prescription request and a booking
   form with hours and a map. General information only: no outcome claims, no drug names. Animals and scenes are inline SVG in fixed natural tones. */
const { ic, esc } = require("../lib");
const K = require("../sitekit");

const SPECIES = ["dog", "cat", "rabbit", "small"];

const CSS = `<style>
.vt>.sk-sec{padding:46px 0}
.vt-hero{text-align:center;padding-top:40px}
.vt-hero .sk-wrap{display:grid;justify-items:center;gap:16px}
.vt-h1{font-size:calc(58px * var(--hs));line-height:1.05;max-width:860px}
.vt-hero .sk-lede{max-width:620px}
.vt-pano{height:292px;margin-top:16px;overflow:hidden;border-bottom:1px solid var(--border)}
.vt-pano svg{display:block;width:100%;height:100%}
.vt-fx{position:absolute;opacity:0;pointer-events:none}
.vt-pick{position:relative}
.vt-tabs{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;margin-bottom:18px}
.vt-tabs label{display:flex;align-items:center;gap:14px;padding:12px 18px 12px 12px;cursor:pointer;background:var(--surface);border:2px solid var(--border);border-radius:var(--radius-lg)}
.vt-tok{width:72px;height:72px;flex:0 0 auto;border-radius:50%;background:color-mix(in oklab,var(--accent) 16%,var(--bg));overflow:hidden;display:block}
.vt-tok svg{display:block;width:100%;height:100%}
.vt-tabs b{display:block;font:var(--hw) calc(19px * var(--hs))/1.15 var(--font-h);letter-spacing:var(--ls)}
.vt-tabs small{display:block;font-size:13px;color:var(--muted);line-height:1.3;margin-top:2px}
${SPECIES.map((k) => `#vt-${k}:checked~.vt-tabs label[for=vt-${k}]{border-color:var(--primary);background:color-mix(in oklab,var(--primary) 10%,var(--surface))}#vt-${k}:focus-visible~.vt-tabs label[for=vt-${k}]{outline:2px solid var(--text);outline-offset:2px}#vt-${k}:checked~.vt-panels .vt-p-${k}{display:grid}`).join("")}
.vt-p{display:none;grid-template-columns:minmax(0,.8fr) minmax(0,1.3fr) minmax(0,.8fr);gap:40px;padding:32px;align-items:start}
.vt-p h3{font-size:calc(28px * var(--hs));line-height:1.15;margin-bottom:8px}
.vt-p p{font-size:15px;color:var(--muted)}
.vt-p ul{list-style:none;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px 22px;font-size:14px}
.vt-p li{display:flex;gap:8px;align-items:flex-start}
.vt-p li>span{color:var(--success);flex:0 0 auto;display:grid;padding-top:3px}
.vt-sub{font:600 12px var(--font-b);letter-spacing:.07em;text-transform:uppercase;color:var(--muted);display:block;margin-bottom:10px}
.vt-tip{padding-left:18px;border-left:3px solid var(--accent);display:grid;gap:12px;justify-items:start}
.vt-tip p{color:var(--text);font-size:14px}
.vt-urgent{background:color-mix(in oklab,var(--danger) 9%,var(--bg));border-block:1px solid color-mix(in oklab,var(--danger) 30%,var(--border));padding:30px 0}
.vt-urgent .sk-wrap{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr) auto;gap:40px;align-items:center}
.vt-urgent h2{font-size:calc(25px * var(--hs));line-height:1.2}
.vt-urgent ul{list-style:none;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:3px 16px;font-size:14px;color:var(--muted)}
.vt-calls{display:grid;gap:8px}
.vt-calls .btn{justify-content:flex-start}
.vt-menu{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:4px 64px}
.vt-item{padding:12px 0;display:grid;gap:4px;border-bottom:1px solid var(--border)}
.vt-line{display:flex;align-items:baseline;gap:10px}
.vt-line h3{font-size:calc(21px * var(--hs));line-height:1.2}
.vt-line i{flex:1;border-bottom:2px dotted color-mix(in oklab,var(--text) 30%,var(--border));transform:translateY(-3px);min-width:20px}
.vt-line span{font-size:14px;font-weight:600;white-space:nowrap}
.vt-item p{font-size:14px;color:var(--muted);max-width:480px}
.vt-planwrap{position:relative}
.vt-peek{display:block;width:78px;height:84px;margin-top:6px}
.vt-peek svg{display:block;width:100%;height:100%}
.vt-plan{padding:0;overflow:hidden}
.vt-plan table{width:100%;border-collapse:collapse;font-size:14px;table-layout:fixed}
.vt-plan th,.vt-plan td{padding:8px 18px;border-bottom:1px solid var(--border);text-align:center;vertical-align:middle}
.vt-plan th:first-child,.vt-plan td:first-child{text-align:left;width:31%}
.vt-plan thead th{background:color-mix(in oklab,var(--primary) 8%,var(--surface));padding:14px 18px;vertical-align:top;font-weight:500}
.vt-plan thead b{display:block;font:var(--hw) calc(20px * var(--hs))/1.15 var(--font-h);letter-spacing:var(--ls)}
.vt-plan thead small{display:block;color:var(--muted);font-size:13px;margin-top:2px}
.vt-plan .num{font-size:30px;display:block;margin-top:8px}
.vt-plan .num em{font:500 13px var(--font-b);color:var(--muted);letter-spacing:0;margin-left:2px}
.vt-plan td .i{color:var(--success)}
.vt-plan td.no{color:var(--muted)}
.vt-plan tfoot td{border-bottom:0;padding:10px 18px}
.vt-short{display:none}
.vt-fine{font-size:13px;color:var(--muted);margin-top:14px;max-width:760px}
.vt-new{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,.85fr);gap:56px;align-items:start}
.vt-check{padding:12px 26px;display:grid;gap:0;margin-top:16px}
.vt-check label{display:grid;grid-template-columns:22px minmax(0,1fr);gap:12px;padding:8px 0;border-bottom:1px dashed var(--border);font-size:15px;line-height:1.4;align-items:start}
.vt-check label:last-child{border-bottom:0}
.vt-check input{width:18px;height:18px;margin-top:1px;accent-color:var(--primary)}
.vt-check small{display:block;color:var(--muted);font-size:13px}
.vt-bring{list-style:none;display:grid;gap:13px;margin-top:20px}
.vt-bring li{display:grid;grid-template-columns:38px minmax(0,1fr);gap:12px;font-size:15px;line-height:1.4;align-items:center}
.vt-ico{width:38px;height:38px;border-radius:50%;display:grid;place-items:center;background:color-mix(in oklab,var(--accent) 16%,var(--bg));color:color-mix(in oklab,var(--accent) 65%,var(--text))}
.vt-board{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:24px}
.vt-note{padding:18px 20px 16px;display:grid;gap:6px;align-content:start;background:var(--bg)}
.vt-note:nth-child(odd){transform:rotate(-1deg)}
.vt-note:nth-child(even){transform:rotate(.8deg)}
.vt-note .vt-tok{width:84px;height:84px;margin-bottom:4px}
.vt-note h3{font-size:calc(19px * var(--hs));line-height:1.2}
.vt-note .r{font-size:13px;font-weight:600;color:color-mix(in oklab,var(--primary) 80%,var(--text))}
.vt-note p{font-size:14px;color:var(--muted)}
.vt-cred{display:flex;flex-wrap:wrap;gap:12px 24px;align-items:center;margin-top:20px;font-size:14px;color:var(--muted)}
.vt-slot{border:1.5px dashed color-mix(in oklab,var(--text) 45%,var(--border));border-radius:var(--radius);padding:9px 14px;font-size:13px;font-weight:500;color:var(--muted)}
.vt-rx{display:grid;grid-template-columns:minmax(0,.8fr) minmax(0,1.2fr);gap:48px;align-items:center}
.vt-rxf{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;padding:22px}
.vt-book{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,.9fr);gap:44px;align-items:start}
.vt-form{padding:24px 26px;display:grid;gap:11px}
.vt-form h2{font-size:calc(30px * var(--hs));line-height:1.15}
.vt-form .sk-g3{gap:12px}
.vt-form .sk-g2{gap:12px}
.vt-hours{width:100%;border-collapse:collapse;font-size:14px;margin-top:12px}
.vt-hours td{padding:8px 0;border-bottom:1px solid var(--border)}
.vt-hours td:last-child{text-align:right}
.vt-hours tr.today td{font-weight:700}
.vt-map{aspect-ratio:16/9;margin-top:16px}
@media (max-width:1024px){
  .vt-tabs{gap:10px}
  .vt-tabs label{flex-direction:column;text-align:center;padding:12px 8px;gap:8px}
  .vt-p{grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:24px}
  .vt-p>:first-child{grid-column:1/-1}
  .vt-urgent .sk-wrap{grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:20px}
  .vt-urgent h2{grid-column:1/-1}
  .vt-menu{column-gap:36px}
  .vt-board{grid-template-columns:repeat(2,minmax(0,1fr))}
  .vt-new,.vt-rx,.vt-book{gap:32px}
}
@media (max-width:760px){
  .vt>.sk-sec{padding:36px 0}
  .vt-hero{padding-top:30px}
  .vt-hero .sk-wrap{gap:12px}
  .vt-h1{font-size:calc(38px * var(--hs))}
  .vt-pano{height:206px;margin-top:12px}
  .vt-tabs{gap:6px;margin-bottom:12px}
  .vt-tabs label{padding:8px 2px 10px;gap:5px;border-width:2px}
  .vt-tok{width:58px;height:58px}
  .vt-tabs b{font-size:calc(14px * var(--hs))}
  .vt-tabs small{display:none}
  .vt-p{grid-template-columns:minmax(0,1fr);gap:14px;padding:18px}
  .vt-p ul{gap:7px 12px;font-size:13.5px}
  .vt-p>:first-child{grid-column:auto}
  .vt-urgent{padding:26px 0}
  .vt-urgent .sk-wrap{grid-template-columns:minmax(0,1fr);gap:12px}
  .vt-urgent h2{font-size:calc(22px * var(--hs))}
  .vt-menu{grid-template-columns:minmax(0,1fr);gap:0}
  .vt-item{padding:9px 0}
  .vt-item p{display:none}
  .vt-line h3{font-size:calc(19px * var(--hs))}
  .vt-peek{display:none}
  .vt-plan table{font-size:12.5px}
  .vt-plan th,.vt-plan td{padding:9px 5px}
  .vt-plan th:first-child,.vt-plan td:first-child{width:34%;padding-left:12px}
  .vt-plan thead th{padding:12px 4px}
  .vt-plan thead b{font-size:calc(14px * var(--hs))}
  .vt-plan thead small,.vt-long{display:none}
  .vt-short{display:inline}
  .vt-plan .num{font-size:21px;margin-top:4px}
  .vt-plan .num em{display:block;margin:0;font-size:11px}
  .vt-plan tfoot td{padding:10px 5px}
  .vt-plan tfoot .btn{padding:0 6px;font-size:12px;width:100%;height:34px}
  .vt-new,.vt-rx,.vt-book{grid-template-columns:minmax(0,1fr);gap:28px}
  .vt-check{padding:10px 18px;margin-top:14px}
  .vt-check label:nth-last-child(-n+2){display:none}
  .vt-check label:nth-last-child(3){border-bottom:0}
  .vt-bring{gap:9px;margin-top:14px}
  .vt-note{transform:none!important;padding:18px}
  .vt-note .vt-tok{width:72px;height:72px}
  .vt-rxf{grid-template-columns:minmax(0,1fr);padding:18px}
  .vt-rxf .vt-opt+div label{display:none}
  .vt-form{padding:20px}
  .vt-opt{display:none}
  .vt-map{aspect-ratio:16/9}
}
</style>`;

// ---- illustrated animals, fixed natural tones. Each sits on y=0 with x centred, so it can be placed with a transform. ----------
const dog = (fur = "#c98f56", ear = "#8f5e34", pale = "#efd9b6", col = "#b5523f") => `<path d="M-44 0c-7-52 4-94 44-94s51 42 44 94z" fill="${fur}"/><ellipse cy="-50" rx="23" ry="35" fill="${pale}"/><ellipse cx="-17" cy="-5" rx="15" ry="9" fill="${pale}"/><ellipse cx="17" cy="-5" rx="15" ry="9" fill="${pale}"/>
<path d="M-27-96c15 9 39 9 54 0" fill="none" stroke="${col}" stroke-width="8" stroke-linecap="round"/><circle cy="-84" r="6" fill="#e6c25a"/>
<ellipse cy="-132" rx="39" ry="37" fill="${fur}"/><path d="M-32-158c-22 0-32 32-22 56 14 5 22-10 25-28z" fill="${ear}"/><path d="M32-158c22 0 32 32 22 56-14 5-22-10-25-28z" fill="${ear}"/><ellipse cy="-116" rx="21" ry="16" fill="${pale}"/><ellipse cy="-125" rx="8" ry="5.5" fill="#3b2a20"/><circle cx="-15" cy="-141" r="4.5" fill="#2b1f18"/><circle cx="15" cy="-141" r="4.5" fill="#2b1f18"/><path d="M0-119v9M-9-109c4 5 14 5 18 0" fill="none" stroke="#3b2a20" stroke-width="2.4" stroke-linecap="round"/>`;
const cat = (fur = "#8f9490", stripe = "#676c69", pale = "#f1ece1") => `<path d="M30-7c32 6 44-20 32-46" fill="none" stroke="${fur}" stroke-width="13" stroke-linecap="round"/><path d="M-33 0c-8-38 0-80 33-80s41 42 33 80z" fill="${fur}"/><ellipse cy="-40" rx="15" ry="27" fill="${pale}"/><ellipse cx="-13" cy="-5" rx="12" ry="7" fill="${pale}"/><ellipse cx="13" cy="-5" rx="12" ry="7" fill="${pale}"/>
<path d="M-31-112l2-37 26 17zM31-112l-2-37-26 17z" fill="${fur}"/><path d="M-25-120l1-19 13 9zM25-120l-1-19-13 9z" fill="#e0aeA2"/><ellipse cy="-103" rx="34" ry="29" fill="${fur}"/><path d="M-5-131l1 12M5-131l-1 12M0-133v13" stroke="${stripe}" stroke-width="3" stroke-linecap="round"/><path d="M-33-104l11 2M-31-94l10-1M33-104l-11 2M31-94l-10-1" stroke="${stripe}" stroke-width="3" stroke-linecap="round"/>
<ellipse cy="-90" rx="13" ry="9" fill="${pale}"/><ellipse cx="-13" cy="-106" rx="4.5" ry="5" fill="#2f3a25"/><ellipse cx="13" cy="-106" rx="4.5" ry="5" fill="#2f3a25"/><path d="M-4-96h8l-4 5z" fill="#c9786f"/><path d="M-16-92l-20-3M-16-88l-20 3M16-92l20-3M16-88l20 3" stroke="#6e6a62" stroke-width="1.2"/>`;
const rabbit = (fur = "#b49c80", pale = "#efe6d6", ear = "#e3b7a8") => `<ellipse cy="-42" rx="36" ry="44" fill="${fur}"/><ellipse cy="-34" rx="19" ry="27" fill="${pale}"/><ellipse cx="-20" cy="-6" rx="17" ry="8" fill="${pale}"/><ellipse cx="20" cy="-6" rx="17" ry="8" fill="${pale}"/>
<ellipse cx="-16" cy="-146" rx="12" ry="42" fill="${fur}" transform="rotate(-9 -16 -146)"/><ellipse cx="16" cy="-146" rx="12" ry="42" fill="${fur}" transform="rotate(9 16 -146)"/><ellipse cx="-16" cy="-146" rx="6" ry="31" fill="${ear}" transform="rotate(-9 -16 -146)"/><ellipse cx="16" cy="-146" rx="6" ry="31" fill="${ear}" transform="rotate(9 16 -146)"/>
<ellipse cy="-92" rx="30" ry="28" fill="${fur}"/><ellipse cy="-81" rx="14" ry="11" fill="${pale}"/><circle cx="-14" cy="-98" r="4.5" fill="#2b1f18"/><circle cx="14" cy="-98" r="4.5" fill="#2b1f18"/><path d="M-4-88h8l-4 5zM0-83v5" fill="#c9786f" stroke="#a7675f" stroke-width="1"/>`;
const small = () => `<ellipse cy="-34" rx="58" ry="36" fill="#d9a86e"/><path d="M6-68c26-4 50 10 52 34 0 18-14 30-30 33-22-6-34-38-22-67z" fill="#f3ead9"/><path d="M26-44c14-2 24 8 24 20-8 10-22 8-30 0z" fill="#7a5235"/>
<ellipse cx="-34" cy="-46" rx="30" ry="26" fill="#d9a86e"/><ellipse cx="-14" cy="-70" rx="9" ry="7" fill="#b98550"/><ellipse cx="-54" cy="-70" rx="9" ry="7" fill="#b98550"/><ellipse cx="-34" cy="-34" rx="14" ry="10" fill="#f3ead9"/><circle cx="-46" cy="-52" r="4.5" fill="#2b1f18"/><circle cx="-22" cy="-52" r="4.5" fill="#2b1f18"/><ellipse cx="-34" cy="-40" rx="3.5" ry="2.5" fill="#a7675f"/><ellipse cx="-26" cy="-3" rx="10" ry="5" fill="#f3ead9"/><ellipse cx="22" cy="-3" rx="10" ry="5" fill="#f3ead9"/>`;
const ANIMAL = { dog, cat, rabbit, small };
// One animal in a round token. box: [x, y, w, h] viewBox tuned so each face sits nicely in the circle.
const BOX = { dog: "-82 -188 164 196", cat: "-82 -160 164 180", rabbit: "-82 -186 164 196", small: "-82 -118 164 136" };
const tok = (k, label, ...colours) => `<span class="vt-tok"><svg viewBox="${BOX[k]}" preserveAspectRatio="xMidYMax slice" role="img" aria-label="${label}">${ANIMAL[k](...colours)}</svg></span>`;

const hedge = (x, y, n) => Array.from({ length: n }, (_, i) => `<circle cx="${x + i * 38}" cy="${y + (i % 2) * 8}" r="30" fill="${i % 3 ? "#6c8c58" : "#5d7e4e"}"/><circle cx="${x + i * 38 - 8}" cy="${y - 8 + (i % 3) * 6}" r="3.5" fill="#55304c"/><circle cx="${x + i * 38 + 10}" cy="${y + 4}" r="3" fill="#7b4a68"/>`).join("");
const panorama = () => `<svg viewBox="0 0 1440 330" preserveAspectRatio="xMidYMax slice" role="img" aria-label="A dog, a cat, a rabbit and a guinea pig sitting together on a green hillside, with a cottage practice and a bramble hedge behind them">
<defs><linearGradient id="vt-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfe2e4"/><stop offset="1" stop-color="#f6ecd8"/></linearGradient></defs>
<rect width="1440" height="330" fill="url(#vt-sky)"/><circle cx="1240" cy="76" r="44" fill="#f4d48c"/><path d="M180 66c10-16 32-16 40-4 14-6 28 2 28 14h-84c-2-6 6-12 16-10zM640 44c8-12 26-12 32-2 12-4 22 2 22 12h-68c-2-6 4-10 14-10z" fill="#fbf6ec"/>
<path d="M0 190c160-70 330-80 520-40s340 40 500-10 300-40 420 10v180H0z" fill="#b6c99c"/><path d="M0 230c200-50 380-40 600-10s420 10 840-20v130H0z" fill="#9db985"/>
<g transform="translate(1110 118)"><rect y="48" width="168" height="92" fill="#efe3cf"/><path d="M-16 52L84-6l100 58z" fill="#a8593f"/><rect x="134" y="-4" width="20" height="34" fill="#8f7a64"/><rect x="66" y="84" width="36" height="56" rx="18" fill="#6e7f62"/><rect x="18" y="72" width="34" height="32" fill="#bcd2d6"/><rect x="118" y="72" width="34" height="32" fill="#bcd2d6"/><path d="M35 72v32M18 88h34M135 72v32M118 88h34" stroke="#efe3cf" stroke-width="3"/><circle cx="84" cy="30" r="11" fill="#efe3cf"/></g>
<rect x="222" y="120" width="14" height="110" fill="#7c5f45"/><circle cx="229" cy="96" r="58" fill="#83a36a"/><circle cx="190" cy="118" r="38" fill="#769a60"/><circle cx="268" cy="120" r="40" fill="#769a60"/>
${hedge(-10, 226, 13)}${hedge(1020, 244, 12)}
<path d="M0 270c260-34 500-30 760-20s460 0 680-22v102H0z" fill="#7fa068"/><path d="M0 306c300-22 720-24 1440-10v34H0z" fill="#6f915a"/>
${[[110, 300], [1290, 286], [330, 312], [1160, 310], [1000, 318]].map(([x, y]) => `<g transform="translate(${x} ${y})"><path d="M0 0v-14" stroke="#4f6f42" stroke-width="2"/><circle cy="-17" r="4" fill="#f6efe0"/><circle cy="-17" r="1.6" fill="#e3b955"/></g>`).join("")}
<g transform="translate(528 308) scale(1.02)">${dog()}</g><g transform="translate(660 312) scale(1.0)">${cat()}</g><g transform="translate(786 312) scale(.92)">${rabbit()}</g><g transform="translate(908 314) scale(.82)">${small()}</g></svg>`;

const mapShot = () => `<svg viewBox="0 0 640 320" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Map of the practice on Orchard Rise, with a car park and a path from Hazel Common">
<rect width="640" height="320" fill="#ece6d6"/><path d="M0 40c120-30 220-20 300 20S420 150 640 110v-110H0z" fill="#cbdab4"/><text x="60" y="44" font-family="sans-serif" font-size="14" fill="#5d6b4f">Hazel Common</text>
<path d="M0 214c180-24 380-20 640 12" fill="none" stroke="#fff" stroke-width="22"/><text x="36" y="196" font-family="sans-serif" font-size="13" fill="#6e6658">Orchard Rise</text><path d="M430 0c-10 80-18 150-16 320" fill="none" stroke="#fff" stroke-width="13"/>
<rect x="470" y="238" width="120" height="62" rx="6" fill="#dcd5c6"/><text x="484" y="274" font-family="sans-serif" font-size="12" fill="#6e6658">P  Car park</text>
<path d="M172 40c40 60 90 90 120 130" fill="none" stroke="#a8593f" stroke-width="3" stroke-dasharray="2 9" stroke-linecap="round"/>
<g transform="translate(300 196)"><path d="M0 0c-15-19-24-32-24-45a24 24 0 0 1 48 0c0 13-9 26-24 45z" fill="#a8593f"/><circle cy="-45" r="9" fill="#fff"/></g></svg>`;

const PANELS = {
  dog: ["Dogs and puppies", "From first vaccinations to slower walks in later life, we get to know your dog over the years.", ["Puppy vaccination course", "Yearly booster and health check", "Kennel cough vaccination", "Microchipping", "Flea, tick and worm protection", "Neutering", "Dental checks and cleaning", "Mobility checks for older dogs"], "Nervous dog? Wait in the car or the garden and we will fetch you when the room is ready.", "Book for your dog"],
  cat: ["Cats and kittens", "Cats dislike travel and strange smells, so we keep visits short, calm and well away from barking.", ["Kitten vaccination course", "Yearly booster and health check", "Microchipping", "Neutering from around four months", "Flea and worm protection", "Dental checks", "Senior cat clinics", "Blood pressure and urine checks"], "Quiet cat-only waiting times on weekday mornings. Please bring your cat in a secure carrier.", "Book for your cat"],
  rabbit: ["Rabbits", "Rabbits are prey animals and hide illness well, so regular checks are especially useful for them.", ["Yearly vaccinations", "Health check and weigh-in", "Teeth checks", "Neutering", "Nail clipping", "Diet and hay guidance", "Flystrike checks in warm months", "Bonding guidance for pairs"], "If your rabbit stops eating or passing droppings, call us the same day. Bring their bonded friend along too.", "Book for your rabbit"],
  small: ["Small pets", "Guinea pigs, hamsters, rats, gerbils and ferrets all get the same unhurried attention as bigger patients.", ["Health check and weigh-in", "Teeth and nail checks", "Skin and mite checks", "Ferret vaccinations", "Neutering for some species", "Housing and diet guidance", "Anaesthetics adapted to size", "Referral for birds and reptiles"], "Bring them in their usual carrier with a little bedding from home, and a note of what they eat.", "Book for your small pet"],
};
const SERVICES = [
  ["Consultations", "20 minutes", "A nose-to-tail check, plenty of time for your questions, and clear options with costs."],
  ["Vaccinations", "15 minutes", "First courses and yearly boosters, with a health check at every visit."],
  ["Neutering", "Day patient", "A pre-op check, drop-off in the morning and collection the same afternoon."],
  ["Dental care", "Day patient", "Free nurse checks, then scaling and extractions under anaesthetic when needed."],
  ["Surgery", "Day or overnight", "Routine and soft-tissue surgery in our own theatre, with a nurse monitoring your pet."],
  ["Nutrition", "30 minutes", "Weight clinics and diet plans with a nurse, for any life stage."],
];
const PLAN = [
  ["Yearly vaccinations", "First course", "Boosters", "Boosters"],
  ["Health checks a year", "3 visits", "2 visits", "2 visits"],
  ["Flea and worm protection", 1, 1, 1],
  ["Nurse clinics: weight, nails, teeth", 1, 1, 1],
  ["Microchip", 1, 0, 0],
  ["Neutering discount", "$30 off", 0, 0],
  ["Dental cleaning discount", 0, "$30 off", "$30 off"],
  ["Yearly blood and urine screen", 0, 0, 1],
];
const CHECK = [
  ["Register with a vet", "Ideally in the first week, even if your pet seems well.", 1],
  ["Book a first health check", "We go through vaccinations and answer your questions.", 1],
  ["Plan vaccinations", "We explain the first course and when your pet can go out."],
  ["Get a microchip, keep details current", "We can do this at the first or second visit."],
  ["Set up flea and worm protection", "Ask a nurse which product suits your pet’s age and weight."],
  ["Look into pet insurance early", "Compare what is covered before anything happens."],
  ["Talk about neutering", "We will discuss timing for your pet at the second check."],
];
const BRING = [
  ["doc", "Vaccination card and any records from a previous vet"],
  ["image", "A photo or video of the problem, especially a limp or a cough"],
  ["list", "A note of what they eat, and when"],
  ["shield", "Any current medicines, in their packaging"],
  ["lock", "Cats and small pets in a secure carrier, dogs on a lead"],
];
const TEAM = [
  ["dog", "Dr Bea Thackwell", "Veterinary surgeon, clinical lead", "Soft-tissue surgery and older dogs. Lives with Pickle, a lurcher with strong opinions about the sofa.", "A lurcher called Pickle", "#8d8a84", "#5d5a55", "#e6e0d4", "#4f7c86"],
  ["cat", "Dr Tomasz Oakenby", "Veterinary surgeon", "Cat medicine and dentistry. Shares a flat with Marmalade, who has never once used the scratching post.", "A ginger cat called Marmalade", "#d9924a", "#b06c2c", "#f7ead6"],
  ["rabbit", "Imani Rushbrook", "Head veterinary nurse", "Runs our rabbit, weight and new pet clinics. Keeps a bonded pair called Dill and Fennel.", "A white rabbit called Dill", "#e7dfd2", "#f7f2e8", "#e3b7a8"],
  ["small", "Cai Ellery", "Veterinary nurse", "Anaesthesia monitoring and small pets. Has three guinea pigs and a very large hay bill.", "A guinea pig"],
];
const HOURS = [["Monday to Thursday", "8:00 AM to 7:00 PM"], ["Friday", "8:00 AM to 6:00 PM", "today"], ["Saturday", "9:00 AM to 1:00 PM"], ["Sunday", "Out-of-hours line only"]];

const web = (p, st) => K.page(st, `${K.nav(p, ["Your pet", "Services", "Wellness plans", "New pets", "Our team"], "Book an appointment", "Call (555) 016-7700")}
<main class="vt">
<section class="vt-hero" id="top"><div class="sk-wrap"><span class="sk-eyebrow">Your neighbourhood vets on Orchard Rise</span>
  <h1 class="sk-h1 vt-h1">Unhurried care for dogs, cats, rabbits and small pets</h1>
  <p class="sk-lede">${esc(p.name)} is a small team of vets and nurses who take time over every appointment and explain your options and costs before anything happens.</p>
  <div class="sk-row" style="justify-content:center"><a class="btn primary sk-btn-lg" href="#book-an-appointment">Book an appointment</a><a class="btn sk-btn-lg" href="#wellness-plans">See wellness plans</a></div></div>
  <div class="vt-pano">${panorama()}</div>
</section>

<section class="sk-sec" id="your-pet"><div class="sk-wrap">
  <div class="sk-head" style="margin-bottom:24px"><div><span class="sk-eyebrow">Pick an animal</span><h2 class="sk-h2">Who’s your patient?</h2></div><p class="muted" style="max-width:380px">Each animal has different needs. Choose yours to see what we usually do for them.</p></div>
  <div class="vt-pick">${SPECIES.map((k, i) => `<input class="vt-fx" type="radio" name="vt-pet" id="vt-${k}" aria-label="${PANELS[k][0]}"${i ? "" : " checked"}>`).join("")}
    <div class="vt-tabs">${[["dog", "Dog", "Puppies to seniors"], ["cat", "Cat", "Indoor and outdoor"], ["rabbit", "Rabbit", "House and hutch"], ["small", "Small pets", "Guinea pigs and more"]].map(([k, t, s]) => `<label for="vt-${k}">${tok(k, t)}<span><b>${t}</b><small>${s}</small></span></label>`).join("")}</div>
    <div class="vt-panels">${SPECIES.map((k) => { const [t, d, list, tip, cta] = PANELS[k]; return `<article class="card vt-p vt-p-${k}"><div><h3>${t}</h3><p>${d}</p></div><div><span class="vt-sub">Typical services</span><ul>${list.map((x) => `<li><span>${ic("check", 14)}</span>${x}</li>`).join("")}</ul></div><div class="vt-tip"><p>${tip}</p><a class="btn primary" style="height:42px" href="#book-an-appointment">${cta}</a></div></article>`; }).join("")}</div>
  </div>
</div></section>

<section class="vt-urgent" id="urgent" aria-label="Urgent and out-of-hours care"><div class="sk-wrap">
  <h2>If your pet is in immediate danger, call us or your nearest out-of-hours vet.</h2>
  <div><span class="vt-sub">Not sure if it can wait?</span><p class="muted" style="font-size:14px">Call and tell us what you are seeing. We will say where to go and what to bring. Out of hours, the night line reaches the vet on call.</p></div>
  <div class="vt-calls"><a class="btn primary" style="height:44px" href="#">${ic("phone", 16)} Day (555) 016-7700</a><a class="btn" style="height:44px" href="#">${ic("clock", 16)} Night (555) 016-7711</a></div>
</div></section>

<section class="sk-sec" id="services"><div class="sk-wrap">
  <div class="sk-head" style="margin-bottom:18px"><div><span class="sk-eyebrow">Services</span><h2 class="sk-h2">What happens here</h2></div><p class="muted" style="max-width:380px">Times are a guide. We never rush a nervous patient, and prices are always agreed first.</p></div>
  <div class="vt-menu">${SERVICES.map(([t, l, d]) => `<article class="vt-item"><div class="vt-line"><h3>${t}</h3><i></i><span>${l}</span></div><p>${d}</p></article>`).join("")}</div>
</div></section>

<section class="sk-sec sk-alt" id="wellness-plans"><div class="sk-wrap">
  <div class="sk-head" style="margin-bottom:22px"><div><span class="sk-eyebrow">Wellness plans</span><h2 class="sk-h2">Spread the cost of routine care</h2></div><p class="muted" style="max-width:360px">For dogs and cats. One monthly payment covers the routine visits your pet needs through the year.</p></div>
  <div class="card vt-plan"><table><thead><tr><th scope="col">What’s included<span class="vt-peek" aria-hidden="true"><svg viewBox="-70 -152 150 160" preserveAspectRatio="xMinYMax meet">${cat("#d9924a", "#b06c2c", "#f7ead6")}</svg></span></th>${[["Puppies and kittens", "Young", "Up to 12 months", "$24"], ["Adult", "Adult", "1 to 7 years", "$18"], ["Senior", "Senior", "8 years and over", "$28"]].map(([l, sh, a, m]) => `<th scope="col"><b><span class="vt-long">${l}</span><span class="vt-short">${sh}</span></b><small>${a}</small><span class="num">${m}<em>/month</em></span></th>`).join("")}</tr></thead>
    <tbody>${PLAN.map((r) => `<tr><td>${r[0]}</td>${r.slice(1).map((c) => (c === 1 ? `<td>${ic("check", 16)}<span class="vt-fx">Included</span></td>` : c === 0 ? `<td class="no">–</td>` : `<td>${c}</td>`)).join("")}</tr>`).join("")}</tbody>
    <tfoot><tr><td></td>${["Join", "Join", "Join"].map(() => `<td><a class="btn" href="#book-an-appointment">Join</a></td>`).join("")}</tr></tfoot></table></div>
  <p class="vt-fine">Plans run for 12 months and renew unless you tell us otherwise. A wellness plan is not pet insurance and does not cover illness or accidents. Young pets move to the adult plan at 12 months. Ask us about rabbit plans.</p>
</div></section>

<section class="sk-sec" id="new-pets"><div class="sk-wrap vt-new">
  <div><span class="sk-eyebrow">New pets</span><h2 class="sk-h2" style="margin-top:12px">New pet checklist</h2>
    <form class="card vt-check" aria-label="New pet checklist">${CHECK.map(([t, d, on]) => `<label><input type="checkbox"${on ? " checked" : ""}><span>${t}<small>${d}</small></span></label>`).join("")}</form></div>
  <div><span class="sk-eyebrow">Coming to see us</span><h2 class="sk-h2" style="margin-top:12px">What to bring</h2>
    <ul class="vt-bring">${BRING.map(([i, t]) => `<li><span class="vt-ico">${ic(i, 18)}</span><span>${t}</span></li>`).join("")}</ul>
    <p class="muted" style="margin-top:18px;font-size:14px">Moving from another practice? We can request your pet’s records for you.</p></div>
</div></section>

<section class="sk-sec sk-alt" id="our-team"><div class="sk-wrap">
  <div class="sk-head" style="margin-bottom:28px"><div><span class="sk-eyebrow">Our team</span><h2 class="sk-h2">Vets, nurses and their own animals</h2></div></div>
  <div class="vt-board sk-rail">${TEAM.map(([k, n, r, d, label, ...c]) => `<article class="card vt-note">${tok(k, label, ...c)}<h3>${n}</h3><div class="r">${r}</div><p>${d}</p></article>`).join("")}</div>
  <div class="vt-cred"><span>Training: veterinary degree, further training in small animal surgery and dentistry, veterinary nursing qualifications.</span><span class="vt-slot">Add your registration and accreditation details here</span></div>
</div></section>

<section class="sk-sec" id="repeat-prescriptions"><div class="sk-wrap vt-rx">
  <div class="sk-stack" style="gap:10px"><span class="sk-eyebrow">Repeat prescriptions</span><h2 class="sk-h2">Running low?</h2><p class="muted">Request at least 48 hours before you run out. A vet needs to have seen your pet in the last six months, so we may ask you to book a quick check first.</p></div>
  <form class="card vt-rxf" aria-label="Repeat prescription request">
    <div class="sk-field"><label for="vt-rxpet">Pet’s name</label><input class="sk-input" id="vt-rxpet" value="Biscuit"></div>
    <div class="sk-field"><label for="vt-rxmed">Medicine, as on the label</label><input class="sk-input" id="vt-rxmed" value="Daily joint tablets"></div>
    <div class="sk-field vt-opt"><label for="vt-rxway">Collection</label><select class="sk-input" id="vt-rxway"><option>Collect from reception</option><option>Written prescription</option></select></div>
    <div class="sk-field"><label>&nbsp;</label><button class="btn primary" style="height:46px" type="button">Send request</button></div>
  </form>
</div></section>

<section class="sk-sec sk-alt" id="book-an-appointment"><div class="sk-wrap vt-book">
  <form class="card vt-form" aria-label="Book an appointment"><h2>Book an appointment</h2><p class="muted" style="font-size:14px">Tell us about your pet and we will text you a time, usually within two working hours.</p>
    <div class="sk-g3"><div class="sk-field"><label for="vt-pet">Pet’s name</label><input class="sk-input" id="vt-pet" value="Biscuit"></div><div class="sk-field"><label for="vt-sp">Species</label><select class="sk-input" id="vt-sp"><option>Dog</option><option>Cat</option><option>Rabbit</option><option>Small pet</option></select></div><div class="sk-field"><label for="vt-age">Age</label><input class="sk-input" id="vt-age" value="9 years"></div></div>
    <div class="sk-g2"><div class="sk-field"><label for="vt-own">Your name</label><input class="sk-input" id="vt-own" value="Jonah Weiss"></div><div class="sk-field"><label for="vt-tel">Mobile</label><input class="sk-input" id="vt-tel" value="(555) 016-2284"></div></div>
    <div class="sk-g2 vt-opt"><div class="sk-field"><label for="vt-type">Visit type</label><select class="sk-input" id="vt-type"><option>Consultation</option><option>Vaccination</option><option>Nurse clinic</option></select></div><div class="sk-field"><label for="vt-day">Preferred day</label><input class="sk-input" id="vt-day" value="Mon 9 Nov, morning"></div></div>
    <div class="sk-field"><label for="vt-why">What’s the reason for the visit?</label><textarea class="sk-input" id="vt-why" rows="2">Stiff getting up in the mornings, and due a booster.</textarea></div>
    <button class="btn primary sk-btn-lg" type="button">Request appointment</button></form>
  <div><span class="sk-eyebrow">Opening hours</span><h2 class="sk-h3" style="font-size:calc(28px * var(--hs));margin-top:10px">12 Orchard Rise</h2>
    <table class="vt-hours"><tbody>${HOURS.map(([d, h, c]) => `<tr class="${c || ""}"><td>${d}</td><td>${h}</td></tr>`).join("")}</tbody></table>
    <div class="sk-photo vt-map">${mapShot()}</div></div>
</div></section>
</main>
${K.footer(p, "Neighbourhood vets for dogs, cats, rabbits and small pets.", [["Visit", ["12 Orchard Rise", "Car park beside the practice", "Dog-free cat waiting area"]], ["Contact", ["(555) 016-7700", "Out of hours (555) 016-7711", "hello@bramblecotevets.example"]], ["Your pet", ["Wellness plans", "Repeat prescriptions", "New pet checklist"]]], "Fictional practice created for this template. General information only, not veterinary advice.")}`, CSS);

module.exports = {
  "veterinary-website": K.def("vet", "Veterinary practice website",
    "a warm illustrated veterinary practice home page: navigation with call and booking buttons, a centred hero above a hillside panorama of a dog, cat, rabbit and guinea pig, a who’s-your-patient picker with working animal tabs and typical services for each, an urgent and out-of-hours call band, a services list with dotted leaders and appointment lengths, a wellness plan comparison table with monthly prices for puppies and kittens, adult and senior pets, a new pet checklist beside what to bring, a noticeboard of vets and nurses with their own pets and a training slot, a repeat prescription request form, a booking form with pet name, species and age beside opening hours and a map, and a footer",
    ["navigation-header", "hero", "illustration", "animal-picker", "tabs", "urgent-banner", "services", "comparison-table", "pricing-table", "checklist", "what-to-bring", "team", "credentials", "prescription-form", "booking-form", "opening-hours", "map", "footer", "veterinary"], web),
};
