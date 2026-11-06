/* Pest control website template (Mothwell Pest Control, a fictional home and commercial pest company). Full responsive, field-guide home page:
   nav, title-page hero with a pinned moth plate and collector's tag, route facts strip, "What did you see?" specimen identifier (six line-drawn plates
   with signs, usual visit and starting price), what happens on a visit beside a filled sample visit report, one-off vs quarterly plan table with add-ons,
   how to prepare beside children-and-pets safety notes, commercial note beside route days by area, fictional reviews, booking form, footer.
   Specimens are inline SVG drawn with currentColor and tokens so all 8 styles and dark mode recolour them. No chemical or product names, no efficacy figures. */
const { ic, esc } = require("../lib");
const K = require("../sitekit");

const CSS = `<style>
.pc>.sk-sec{padding:44px 0}
.pc .sk-head{margin-bottom:24px}
.pc h2.sk-h2{font-size:calc(34px * var(--hs))}
.pc-run{display:flex;justify-content:space-between;gap:16px;padding:12px 0;border-bottom:1px solid var(--border);font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);font-weight:600}
.pc-title{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,1fr);gap:64px;align-items:center;padding:36px 0 40px}
.pc-title h1{font-size:calc(58px * var(--hs));line-height:1.02}
.pc-copy{display:grid;gap:20px;justify-items:start}
.pc-toc{list-style:none;width:100%;max-width:520px;display:grid;gap:0;margin-top:6px;font-size:14px}
.pc-toc li{display:flex;align-items:baseline;gap:8px;padding:5px 0}
.pc-toc i{flex:1;border-bottom:1px dotted var(--muted);transform:translateY(-3px);opacity:.6}
.pc-toc .num{font-size:13px;color:var(--muted)}
.pc-graph{background-color:var(--bg);background-image:linear-gradient(color-mix(in oklab,var(--border) 62%,transparent) 1px,transparent 1px),linear-gradient(90deg,color-mix(in oklab,var(--border) 62%,transparent) 1px,transparent 1px);background-size:18px 18px}
.pc-cover{padding:0;overflow:hidden;display:grid}
.pc-cover .pc-graph{padding:18px 18px 6px;color:var(--text)}
.pc-cover svg{display:block;width:100%;height:270px}
.pc-tag{display:grid;grid-template-columns:auto minmax(0,1fr);gap:3px 16px;padding:12px 20px;border-top:1px solid var(--border);font-size:13px}
.pc-tag dt{color:var(--muted)}.pc-tag dd{font-weight:500}
.pc-strip{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));border-block:1px solid var(--border);background:var(--surface)}
.pc-strip>div{padding:18px 24px;border-left:1px solid var(--border);display:grid;gap:2px;font-size:14px}
.pc-strip>div:first-child{border-left:0;padding-left:0}
.pc-strip b{font-size:15px}
.pc-strip span{color:var(--muted);font-size:13px}
.pc-specs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}
.pc-spec{padding:0;display:grid;grid-template-rows:auto 1fr;overflow:hidden}
.pc-plate{position:relative;height:142px;border-bottom:1px solid var(--border);color:var(--text);display:grid;place-items:center}
.pc-plate svg{height:112px;width:auto}
.pc-no{position:absolute;left:12px;top:10px;font-size:11.5px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
.pc-size{position:absolute;right:12px;top:10px;display:flex;align-items:center;gap:8px;justify-content:flex-end;font-size:11.5px;color:var(--muted)}
.pc-size i{width:42px;height:6px;border:1px solid var(--muted);border-top:0;background:repeating-linear-gradient(90deg,var(--muted) 0 1px,transparent 1px 7px)}
.pc-sbody{padding:14px 20px 14px;display:grid;gap:8px;align-content:start}
.pc-name{display:flex;align-items:baseline;justify-content:space-between;gap:10px}
.pc-name em{font-size:13px;color:var(--muted)}
.pc-signs{list-style:none;display:grid;gap:3px;font-size:13.5px;line-height:1.4}
.pc-signs li{display:grid;grid-template-columns:14px minmax(0,1fr);gap:8px}
.pc-signs li::before{content:"";width:6px;height:6px;margin-top:7px;border-radius:50%;background:var(--primary)}
.pc-usual{display:flex;justify-content:space-between;gap:12px;align-items:flex-end;padding-top:10px;margin-top:auto;border-top:1px dashed var(--border);font-size:13px}
.pc-usual b{display:block;font-weight:600}
.pc-usual span{color:var(--muted)}
.pc-usual .num{font-size:17px;white-space:nowrap;text-align:right}
.pc-usual small{display:block;font-size:11.5px;color:var(--muted);font-family:var(--font-b)}
.pc-else{display:flex;justify-content:space-between;align-items:center;gap:20px;margin-top:18px;font-size:14.5px}
.pc-log{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);gap:56px;align-items:start}
.pc-steps{list-style:none;display:grid;gap:0;margin-top:14px}
.pc-steps li{display:grid;grid-template-columns:44px minmax(0,1fr);gap:12px;padding:9px 0;border-top:1px solid var(--border)}
.pc-steps .num{font-size:24px;line-height:1.1;color:color-mix(in oklab,var(--primary) 80%,var(--text))}
.pc-steps p{font-size:14px;color:var(--muted)}
.pc-steps b{display:block;font-size:15.5px}
.pc-report{padding:0;overflow:hidden}
.pc-rhead{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:16px 22px;border-bottom:1px solid var(--border);background:var(--surface);font-size:13px}
.pc-rhead b{font-size:14.5px}
.pc-report dl{display:grid;grid-template-columns:104px minmax(0,1fr);font-size:13.5px}
.pc-report dt,.pc-report dd{padding:8px 0;border-bottom:1px solid var(--border)}
.pc-report dt{padding-left:22px;color:var(--muted)}
.pc-report dd{padding-right:22px}
.pc-rfoot{padding:13px 22px;font-size:13px;color:var(--muted);background:var(--surface)}
.pc-plans{padding:0;overflow:hidden}
.pc-plans table{width:100%;border-collapse:collapse;font-size:14px;table-layout:fixed}
.pc-plans th,.pc-plans td{padding:9px 22px;border-bottom:1px solid var(--border);text-align:left;vertical-align:top}
.pc-plans thead th{padding:14px 22px;vertical-align:bottom;background:var(--surface)}
.pc-plans thead th:first-child{width:28%;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
.pc-plans thead .num{display:block;font-size:28px;line-height:1.15;margin-top:2px}
.pc-plans thead small{display:block;font:500 13px var(--font-b);color:var(--muted)}
.pc-plans tbody th{font-weight:600}
.pc-plans td.pick,.pc-plans th.pick{background:color-mix(in oklab,var(--primary) 8%,var(--bg))}
.pc-plans thead th.pick{background:color-mix(in oklab,var(--primary) 15%,var(--bg))}
.pc-plans tbody tr:last-child>*{border-bottom:0}
.pc-yes{display:inline-flex;gap:6px;align-items:flex-start;color:var(--text)}
.pc-yes .i,.pc-yes svg{flex:0 0 auto;margin-top:3px;color:var(--success)}
.pc-no2{color:var(--muted)}
.pc-adds{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:0;margin-top:16px;border-block:1px solid var(--border)}
.pc-adds div{padding:10px 18px;border-left:1px solid var(--border);display:grid;gap:2px;font-size:13.5px}
.pc-adds div:first-child{border-left:0;padding-left:0}
.pc-adds .num{font-size:17px}
.pc-care{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,1fr);gap:28px;align-items:stretch}
.pc-prep{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px 32px;margin-top:16px}
.pc-prep h3{font-size:calc(17px * var(--hs));margin-bottom:6px}
.pc-prep ul{list-style:none;display:grid;gap:5px;font-size:13.5px;line-height:1.45;color:var(--muted)}
.pc-prep li{display:grid;grid-template-columns:18px minmax(0,1fr);gap:6px}
.pc-prep li svg{margin-top:3px;color:var(--success)}
.pc-safe{padding:24px 26px;background:var(--text);color:var(--bg);border-color:var(--text);display:grid;gap:12px;align-content:start}
.pc-safe h3{font-size:calc(24px * var(--hs))}
.pc-safe ul{list-style:none;display:grid;gap:8px;font-size:13.5px;line-height:1.45}
.pc-safe li{padding-top:8px;border-top:1px solid color-mix(in oklab,var(--bg) 24%,transparent)}
.pc-safe p{font-size:13px;opacity:.8}
.pc-duo{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:56px;align-items:start}
.pc-kinds{display:flex;flex-wrap:wrap;gap:6px;margin:12px 0 14px}
.pc-kinds span{padding:6px 12px;border:1px solid var(--border);border-radius:var(--radius);font-size:13px;font-weight:500;background:var(--bg)}
.pc-routes{width:100%;border-collapse:collapse;font-size:14px;margin-top:10px}
.pc-routes th,.pc-routes td{text-align:left;padding:7px 0;border-bottom:1px solid var(--border)}
.pc-routes th{font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);font-weight:600}
.pc-routes td:last-child,.pc-routes th:last-child{text-align:right}
.pc-notes{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:22px}
.pc-note{padding:20px 22px;display:grid;gap:10px;align-content:start}
.pc-note blockquote{font-size:14.5px;line-height:1.5}
.pc-note footer{font-size:13px;color:var(--muted);display:flex;justify-content:space-between;gap:10px;border-top:1px dashed var(--border);padding-top:10px}
.pc-book{display:grid;grid-template-columns:minmax(0,.8fr) minmax(0,1.2fr);gap:56px;align-items:start}
.pc-direct{list-style:none;display:grid;gap:0;margin-top:20px;font-size:14px}
.pc-direct li{display:grid;grid-template-columns:24px minmax(0,1fr);gap:12px;padding:10px 0;border-top:1px solid var(--border)}
.pc-direct li>span:first-child{color:color-mix(in oklab,var(--primary) 80%,var(--text))}
.pc-slot{margin-top:18px;padding:11px 14px;border:1px dashed var(--muted);border-radius:var(--radius);font-size:13px;color:var(--muted)}
.pc-form{padding:26px 28px;display:grid;gap:12px}
.pc-form .sk-g2{gap:14px}
.pc-where{display:flex;flex-wrap:wrap;gap:6px}
.pc-where label{position:relative;min-height:38px;padding:0 12px;border:1px solid var(--border);border-radius:var(--radius);display:inline-flex;align-items:center;font-size:13.5px;font-weight:500;background:var(--bg)}
.pc-where input{position:absolute;opacity:0;width:1px;height:1px}
.pc-where label.on{border-color:var(--primary);box-shadow:inset 0 0 0 1px var(--primary);background:color-mix(in oklab,var(--primary) 10%,var(--bg))}
@media (max-width:1024px){
  .pc-title{gap:36px}.pc-title h1{font-size:calc(52px * var(--hs))}
  .pc-specs{grid-template-columns:repeat(2,minmax(0,1fr))}
  .pc-log,.pc-duo,.pc-book{gap:36px}
  .pc-notes{grid-template-columns:repeat(2,minmax(0,1fr))}
  .pc-notes>:last-child{display:none}
  .pc-strip>div{padding:16px 16px}
  .pc-care{grid-template-columns:minmax(0,1fr)}
}
@media (max-width:760px){
  .pc>.sk-sec{padding:36px 0}
  .pc .sk-head{margin-bottom:18px;gap:8px}
  .pc h2.sk-h2{font-size:calc(29px * var(--hs))}
  .pc-run span:last-child{display:none}
  .pc-title{grid-template-columns:minmax(0,1fr);gap:18px;padding:20px 0 24px}
  .pc-cover svg{height:170px}
  .pc-tag dt:nth-of-type(n+2),.pc-tag dd:nth-of-type(n+2){display:none}
  .pc-title h1{font-size:calc(42px * var(--hs))}
  .pc-toc{display:none}
  .pc-strip{grid-template-columns:repeat(2,minmax(0,1fr))}
  .pc-strip>div:nth-child(n+3){display:none}
  .pc-strip>div{padding:13px 14px 13px 0;border-left:0}
  .pc-strip>div:nth-child(even){padding-left:14px;border-left:1px solid var(--border)}
  .pc-strip>div:nth-child(n+3){border-top:1px solid var(--border)}
  .pc-specs.sk-rail>*{flex-basis:84%}
  .pc-plate{height:130px}.pc-plate svg{height:100px}
  .pc-else{flex-direction:column;align-items:flex-start;gap:12px;font-size:14px}
  .pc-log,.pc-duo,.pc-book{grid-template-columns:minmax(0,1fr);gap:22px}
  .pc-report dt:nth-of-type(n+6),.pc-report dd:nth-of-type(n+6),.pc-report dt:nth-of-type(2),.pc-report dd:nth-of-type(2),.pc-rfoot{display:none}
  .pc-report dl{grid-template-columns:84px minmax(0,1fr)}
  .pc-report dt{padding-left:16px}.pc-report dd{padding-right:16px}
  .pc-rhead{padding:12px 16px}
  .pc-steps li{grid-template-columns:30px minmax(0,1fr);gap:8px;padding:9px 0}
  .pc-steps .num{font-size:20px}
  .pc-steps p{font-size:13.5px;line-height:1.45}
  #plans .sk-head p,.pc-kinds,#areas p.muted:last-child{display:none}
  .pc-plans table,.pc-plans thead,.pc-plans tbody{display:block}
  .pc-plans tr{display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}
  .pc-plans th,.pc-plans td{padding:8px 12px;font-size:13px}
  .pc-plans thead th{padding:12px}
  .pc-plans thead th:first-child{display:none}
  .pc-plans tbody th{grid-column:1/-1;padding-bottom:0;border-bottom:0;font-size:12px;color:var(--muted)}
  .pc-plans tbody td.pick{background:none}
  .pc-plans tbody td{border-left:0}
  .pc-plans thead .num{font-size:22px}
  .pc-size i{display:none}
  .pc-plans thead small{font-size:11.5px;line-height:1.3}
  .pc-plans .pc-opt{display:none}
  .pc-yes svg{display:none}
  .pc-adds{grid-template-columns:repeat(2,minmax(0,1fr))}
  .pc-adds div{padding:11px 12px 11px 0;border-left:0}
  .pc-adds div:nth-child(even){padding-left:12px;border-left:1px solid var(--border)}
  .pc-adds div:nth-child(n+3){border-top:1px solid var(--border)}
  .pc-prep{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;gap:12px;margin:14px -20px 0;padding:0 20px 4px;scrollbar-width:none}
  .pc-prep>div{flex:0 0 78%;scroll-snap-align:start;padding:14px 16px;border:1px solid var(--border);border-radius:var(--radius);background:var(--bg)}
  .pc-safe{padding:20px}
  .pc-notes{display:flex}.pc-notes>:last-child{display:grid}
  .pc-form{padding:18px;gap:10px}
  .pc-direct li:nth-child(3),.pc-form .sk-field:has(#pc-long){display:none}
  .pc-form>.sk-g2:first-of-type{grid-template-columns:minmax(0,1fr)}
  .pc-form .sk-g2{gap:10px}
  .pc-routes{font-size:13.5px}
}
</style>`;

// ---- specimens: line drawings in currentColor, one mirrored side + centre line, viewBox 200 x 140 ---------------------
const G = `fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"`;
const T = `fill="color-mix(in oklab,var(--primary) 26%,var(--surface))" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"`;
const D = `fill="color-mix(in oklab,var(--text) 78%,var(--primary))" stroke="currentColor" stroke-width="1.2"`;
const both = (s) => `${s}<g transform="translate(200 0) scale(-1 1)">${s}</g>`;
const svg = (label, inner) => `<svg viewBox="0 0 200 140" role="img" aria-label="${label}">${inner}</svg>`;
const SPECIMEN = {
  ant: svg("Line drawing of an ant seen from above", `<g ${G}>${both(`<path d="M107 53 L128 40 L147 25"/><path d="M108 62 L133 61 L157 72"/><path d="M106 71 L128 89 L146 118"/><path d="M106 21 L118 9 L138 13"/>`)}</g>
<ellipse cx="100" cy="30" rx="13" ry="12" ${T}/><ellipse cx="100" cy="58" rx="8.5" ry="15" ${T}/><circle cx="100" cy="78" r="3.6" ${T}/><ellipse cx="100" cy="104" rx="16" ry="22" ${D}/>`),
  roach: svg("Line drawing of a cockroach seen from above", `<g ${G}>${both(`<path d="M104 18 C120 0 150 2 182 22"/><path d="M121 64 L147 53 L171 59"/><path d="M123 84 L151 90 L177 77"/><path d="M118 105 L146 119 L170 137"/><path d="M147 53l2-5M151 90l3-5M146 119l4-3"/>`)}</g>
<ellipse cx="100" cy="23" rx="9" ry="6.5" ${T}/><path d="M80 58 Q70 92 84 124 Q100 136 116 124 Q130 92 120 58Z" ${D}/><path d="M78 42 Q100 20 122 42 Q127 54 120 59 L80 59 Q73 54 78 42Z" ${T}/><path d="M100 60V130" fill="none" stroke="var(--surface)" stroke-width="1.4"/>`),
  rodent: svg("Line drawing of a mouse seen from the side", `<path d="M40 96 C40 66 70 48 104 50 C128 52 140 62 152 74 L171 87 Q175 91 169 93 L150 99 C146 108 130 113 110 113 H60 C48 113 40 107 40 96Z" ${T}/><circle cx="136" cy="58" r="11" ${T}/><circle cx="137" cy="60" r="5.5" ${D}/><circle cx="154" cy="79" r="2.3" fill="currentColor"/>
<g ${G}><path d="M42 102 C18 108 12 128 40 130 C72 132 94 122 128 131"/><path d="M168 92l14-5M167 94l15 2M165 89l12-10"/><path d="M78 112 l-4 8 h12M124 112 l-3 8 h12"/></g>`),
  bedbug: svg("Line drawing of a bed bug seen from above", `<g ${G}>${both(`<path d="M104 31 L113 16 L124 19"/><path d="M122 54 L140 44 L150 48"/><path d="M132 82 L152 80 L164 90"/><path d="M128 106 L146 116 L154 130"/>`)}</g>
<ellipse cx="100" cy="92" rx="37" ry="34" ${D}/><path d="M78 47 Q100 39 122 47 Q130 53 122 60 H78 Q70 53 78 47Z" ${T}/><path d="M91 37 Q100 26 109 37 L111 45 H89Z" ${T}/><g fill="none" stroke="var(--surface)" stroke-width="1.4"><path d="M68 80 Q100 70 132 80"/><path d="M65 94 Q100 84 135 94"/><path d="M68 108 Q100 98 132 108"/></g>`),
  termite: svg("Line drawing of a worker termite seen from above", `<g ${G}>${both(`<path d="M112 62 L134 52 L148 56"/><path d="M114 72 L138 76 L152 88"/><path d="M112 84 L132 100 L140 118"/>`)}</g>
<g fill="currentColor">${both([[112, 26], [117, 20], [122, 15], [128, 12], [134, 10], [140, 9], [146, 9]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.9"/>`).join(""))}</g>
<ellipse cx="100" cy="102" rx="17" ry="31" ${T}/><g fill="none" stroke="currentColor" stroke-width="1.2"><path d="M84 92 Q100 98 116 92"/><path d="M83 104 Q100 110 117 104"/><path d="M85 116 Q100 122 115 116"/></g><ellipse cx="100" cy="66" rx="11" ry="9" ${T}/><rect x="87" y="24" width="26" height="31" rx="11" ${T}/><path d="M94 25 L96 15M106 25 L104 15" ${G}/>`),
  wasp: svg("Line drawing of a wasp seen from above with wings spread", `<g fill="color-mix(in oklab,var(--primary) 12%,transparent)" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round">${both(`<path d="M110 44 C136 28 172 34 180 46 C174 60 134 64 110 52Z"/><path d="M110 54 C132 58 156 68 156 80 C146 84 124 74 108 60Z"/>`)}</g>
<g ${G}>${both(`<path d="M105 16 L114 6 L128 8"/><path d="M108 58 L122 74 L132 72"/><path d="M107 62 L118 88 L130 94"/>`)}</g>
<ellipse cx="100" cy="24" rx="11" ry="9" ${T}/><ellipse cx="100" cy="47" rx="11" ry="14" ${T}/><path d="M100 61 L100 66" ${G}/><ellipse cx="100" cy="97" rx="13" ry="31" ${T}/><g fill="color-mix(in oklab,var(--text) 78%,var(--primary))"><path d="M88 80 Q100 87 112 80 L112.8 89 Q100 96 87.2 89Z"/><path d="M87 98 Q100 105 113 98 L112 107 Q100 114 88 107Z"/><path d="M91 116 Q100 121 109 116 L104 125 Q100 128 96 125Z"/></g>`),
};
const moth = () => {
  const wing = `<path d="M210 132 C172 66 92 34 26 50 C22 98 50 158 112 178 C152 188 192 172 210 156Z" fill="color-mix(in oklab,var(--primary) 30%,var(--surface))" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
<path d="M207 160 C176 180 132 190 106 210 C104 256 150 292 184 270 C200 250 206 214 209 182Z" fill="color-mix(in oklab,var(--primary) 16%,var(--surface))" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
<g fill="none" stroke="currentColor" stroke-width="1"><path d="M206 138 C160 96 100 72 40 62"/><path d="M204 144 C156 118 96 108 38 92"/><path d="M204 150 C160 142 112 142 58 132"/><path d="M204 154 C168 160 128 166 92 168"/><path d="M205 176 C176 198 146 214 124 236"/><path d="M206 186 C186 212 170 240 164 266"/></g>
<circle cx="104" cy="120" r="19" fill="var(--surface)" stroke="currentColor" stroke-width="1.6"/><circle cx="104" cy="120" r="10" fill="color-mix(in oklab,var(--text) 80%,var(--primary))"/><circle cx="160" cy="232" r="11" fill="var(--surface)" stroke="currentColor" stroke-width="1.4"/><circle cx="160" cy="232" r="5" fill="color-mix(in oklab,var(--text) 80%,var(--primary))"/>`;
  const ant = `<path d="M214 118 C226 78 244 58 278 44" fill="none" stroke="currentColor" stroke-width="1.8"/>${Array.from({ length: 9 }, (_, i) => { const t = 0.15 + i * 0.09, x = 214 + 64 * t, y = 118 - 74 * Math.pow(t, 0.75); return `<path d="M${x.toFixed(1)} ${y.toFixed(1)}l-9 -8M${x.toFixed(1)} ${y.toFixed(1)}l10 5" fill="none" stroke="currentColor" stroke-width="1"/>`; }).join("")}`;
  return `<svg viewBox="0 0 420 320" role="img" aria-label="Line drawing of a moth pinned to a specimen board, wings spread"><g>${wing}${ant}<g transform="translate(420 0) scale(-1 1)">${wing}${ant}</g></g>
<ellipse cx="210" cy="176" rx="12" ry="62" fill="color-mix(in oklab,var(--text) 80%,var(--primary))" stroke="currentColor" stroke-width="1.6"/><g fill="none" stroke="var(--surface)" stroke-width="1.3"><path d="M199 170 Q210 176 221 170"/><path d="M199 186 Q210 192 221 186"/><path d="M201 202 Q210 208 219 202"/></g><ellipse cx="210" cy="122" rx="10" ry="9" fill="color-mix(in oklab,var(--text) 80%,var(--primary))"/>
<path d="M210 146 V132" stroke="var(--surface)" stroke-width="2.4"/><circle cx="210" cy="146" r="4.5" fill="var(--surface)" stroke="currentColor" stroke-width="1.6"/></svg>`;
};

const SPECIES = [
  ["ant", "Ants", "Formicidae", "2 to 12 mm", ["Trails along baseboards, countertops or paving", "Small piles of fine soil at cracks and slabs", "Winged ants in one spot on a warm day"], "One visit, follow-up at 14 days", "$185"],
  ["roach", "Cockroaches", "Blattodea", "12 to 40 mm", ["Droppings like ground pepper in cupboards", "Brown egg cases in hinges and corners", "A musty, oily smell and sightings at night"], "Two visits, two weeks apart", "$240"],
  ["rodent", "Rats and mice", "Muridae", "7 to 25 cm", ["Dark droppings along walls and in attics", "Gnawed packaging, wiring or baseboards", "Scratching in ceilings after dark"], "Survey, proofing, 2 to 3 checks", "$260"],
  ["bedbug", "Bed bugs", "Cimicidae", "4 to 5 mm", ["Rust-colored spots along mattress seams", "Pale shed skins near the headboard", "Bites alone do not confirm them, we look for the insect"], "Inspection first, then a priced plan", "$120"],
  ["termite", "Termites", "Isoptera", "4 to 10 mm", ["Mud tubes on foundations or inside walls", "Timber that sounds hollow when tapped", "Discarded wings on sills after a swarm"], "Full inspection, written report", "$95"],
  ["wasp", "Wasps", "Vespidae", "10 to 20 mm", ["A steady flight line to one gap in the eaves", "Papery nest in an attic, shed or hedge", "Several wasps indoors at one window"], "Same or next day, one visit", "$140"],
];
const STEPS = [
  ["Inspect before anything else", "Your technician walks the rooms you flagged and the outside of the building, and lifts what needs lifting."],
  ["Name the pest and the way in", "Gaps at pipes, door sweeps, damp timber, trash, food left out. Most repeat problems start here."],
  ["Agree the plan and the price", "You hear what we found, the options and what they cost. Nothing starts until you say so."],
  ["Treat and proof", "Targeted treatment where the pest lives, traps or sealed stations where needed, and small gaps filled on the day."],
  ["Leave a written report", "What we found, what we did, which rooms to keep clear and for how long, and when we are back."],
];
const ROWS = [
  ["Visits", "1 visit and 1 follow-up within 14 days", "4 scheduled visits a year, one each season"],
  ["Common pests", "The one pest you booked for", "Ants, cockroaches, spiders, silverfish, earwigs, small wasp nests"],
  ["Indoors", "Affected rooms", "Whole home on visit one, then wherever needed", "pc-opt"],
  ["Outside", "-", "Foundation line, eaves and entry points at every visit"],
  ["Rodents", "Quoted separately", "Outdoor monitoring stations checked each visit"],
  ["Call-backs", "Free until the follow-up", "Free at any time while on the plan"],
  ["Written report", "yes", "yes", "pc-opt"],
  ["Cancelling", "Nothing to cancel", "Stop before your next visit, no fee"],
];
const ADDS = [["Rodent proofing", "from $240"], ["Termite inspection", "$95"], ["Wasp nest removal", "$140"], ["Bed bug inspection", "$120"]];
const PREP = [
  ["Ants and cockroaches", ["Clear countertops and the cupboard under the sink", "Pull the trash can and pet bowls away from walls", "Do not spray beforehand, it scatters them"]],
  ["Bed bugs", ["Leave the room as it is until we have looked", "Do not move bedding or furniture to other rooms", "Keep any bites or marks photos for the technician"]],
  ["Rats and mice", ["Store food and pet food in sealed tubs", "Leave droppings for us to see, then wear gloves to clean", "Make the attic hatch and under-stairs easy to reach"]],
  ["Wasps", ["Keep windows near the nest closed", "Do not block the entrance, they find another way in", "Note where you see them flying and at what time"]],
];
const SAFE = [
  "We ask who lives in the home before we start, including children, pets and anyone with breathing problems.",
  "We treat only where the pest is, and use traps, baits in locked stations or physical proofing where those will do the job.",
  "Your technician tells you which rooms to keep children and pets out of, and for how long. Your report repeats it.",
  "Tell us about fish tanks, birds and reptiles when you book. They need more care than cats and dogs.",
  "Ask for the information sheet on anything we plan to use, before we use it.",
];
const ROUTES = [["Alderton and Brackley Heath", "Mon, Thu"], ["Cobham Rise", "Tue"], ["Dunmere and Elmsford", "Tue, Fri"], ["Fenwick Park", "Wed"], ["Greyholt and Hartsfield", "Wed, Sat"]];
const NOTES = [
  ["Ants", "Three other visits never found the nest. Rosa traced the trail to a cracked slab by the back door, filled it and showed me what to watch for.", "Hannah V., Alderton"],
  ["Rats", "He spent longer outside than in. Found the gap behind the boiler flue and sealed it. Nothing in the attic since the last check in spring.", "Tobias L., Greyholt"],
  ["Wasps", "Called at nine, nest gone by mid afternoon. The note told us exactly when the kids could use the back bedroom again.", "Marisol P., Dunmere"],
];

const yes = (t) => `<span class="pc-yes">${ic("check", 15)}<span>${t}</span></span>`;
const cell = (v) => (v === "yes" ? yes("Included") : v === "-" ? `<span class="pc-no2">Not included</span>` : esc(v));

const web = (p, st) => K.page(st, `${K.nav(p, ["What did you see", "Plans", "On a visit", "Safety", "Areas"], "Book a visit", "Call (555) 014-2230")}
<main class="pc">
<section class="sk-wrap" id="top">
  <div class="pc-run"><span>A field guide to the pests in your home</span><span>Harrow Vale edition, 2026</span></div>
  <div class="pc-title">
    <div class="pc-copy">
      <h1 class="sk-h1">Name the pest first. Then we treat it.</h1>
      <p class="sk-lede">${esc(p.name)} starts every job with an inspection: what it is, how it got in and what will keep it out. Local technicians for homes and businesses, with a written report after every visit.</p>
      <div class="sk-row"><a class="btn primary sk-btn-lg" href="#what-did-you-see">Identify your pest</a><a class="btn sk-btn-lg" href="#book-a-visit">Book a visit</a></div>
      <ol class="pc-toc">${[["What did you see?", "Plates 1 to 6"], ["One-off or quarterly", "Prices"]].map(([a, b]) => `<li><span>${a}</span><i></i><span class="num">${b}</span></li>`).join("")}</ol>
    </div>
    <figure class="card pc-cover"><div class="pc-graph">${moth()}</div>
      <dl class="pc-tag"><dt>Plate 0</dt><dd>Moth, shown much larger than life</dd><dt>Found in</dt><dd>Wool coats, back of a wardrobe, Cedar Row</dd><dt>Way in</dt><dd>A second-hand rug, not the window</dd></dl></figure>
  </div>
</section>
<section class="pc-strip-wrap" aria-label="Today"><div class="sk-wrap" style="padding-block:0"><div class="pc-strip">
  <div><b>Next route visit</b><span>Tomorrow, 8 to 10 AM</span></div><div><b>Wasp nests</b><span>Same or next day</span></div><div><b>Mon to Sat, 7 AM to 7 PM</b><span>A person answers the phone</span></div><div><b>Photo ID by text</b><span>(555) 014-2231, free</span></div>
</div></div></section>

<section class="sk-sec" id="what-did-you-see"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">Identifier</span><h2 class="sk-h2">What did you see?</h2></div><p class="muted" style="max-width:400px">Match what you found to a plate. The signs are what our technicians look for first, and the visit is what the job usually takes.</p></div>
  <div class="pc-specs sk-rail">${SPECIES.map(([k, n, l, s, signs, v, from], i) => `<article class="card pc-spec"><div class="pc-plate pc-graph"><span class="pc-no">Plate ${i + 1}</span>${SPECIMEN[k]}<span class="pc-size"><i></i>Real size ${s}</span></div>
    <div class="pc-sbody"><div class="pc-name"><h3 class="sk-h3">${n}</h3><em>${l}</em></div><ul class="pc-signs">${signs.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
    <div class="pc-usual"><div><span>Usual visit</span><b>${v}</b></div><div class="num">${from}<small>from</small></div></div></div></article>`).join("")}</div>
  <div class="pc-else"><span><b>Not on these plates?</b> <span class="muted">We also handle fleas, clothes moths, silverfish, spiders, mosquitoes and birds under the eaves.</span></span><a class="btn" href="#book-a-visit">Text us a photo ${ic("arrow", 15)}</a></div>
</div></section>

<section class="sk-sec sk-alt" id="on-a-visit"><div class="sk-wrap pc-log">
  <div><span class="sk-eyebrow">On a visit</span><h2 class="sk-h2" style="margin-top:12px">What happens when we arrive</h2>
    <ol class="pc-steps">${STEPS.map(([t, d], i) => `<li><span class="num">${i + 1}</span><div><b>${t}</b><p>${d}</p></div></li>`).join("")}</ol></div>
  <article class="card pc-report" aria-label="Sample visit report"><div class="pc-rhead"><b>Visit report, sample</b><span class="badge">Ref 20418</span></div>
    <dl><dt>Address</dt><dd>12 Cedar Row, Alderton</dd><dt>Technician</dt><dd>Rosa Tenby, Tue 3 Nov, 8:40 AM</dd><dt>Found</dt><dd>Mice. Fresh droppings under the sink and behind the stove</dd><dt>Way in</dt><dd>Gap around the waste pipe, wide enough for a pencil</dd><dt>Done</dt><dd>Gap sealed with wire mesh and filler. 4 traps set in closed boxes</dd><dt>Keep clear</dt><dd>Under-sink cupboard, children and pets, until our next check</dd><dt>You can help</dt><dd>Move dry pet food into a sealed tub</dd><dt>Next visit</dt><dd>Tue 17 Nov, 8 to 10 AM</dd></dl>
    <div class="pc-rfoot">Every report lists any treatment used, where it went and what to do next.</div></article>
</div></section>

<section class="sk-sec" id="plans"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">Plans and prices</span><h2 class="sk-h2">One-off visit or quarterly plan</h2></div><p class="muted" style="max-width:400px">A one-off suits a single problem. A quarterly plan suits older homes, homes near woodland or water, and anyone tired of calling us every summer.</p></div>
  <div class="card pc-plans"><table><thead><tr><th scope="col">What is covered</th><th scope="col"><span class="sk-h3 h">One-off</span><span class="num">$185</span><small>per job, ant or spider rate</small></th><th scope="col" class="pick"><span class="sk-h3 h">Quarterly plan</span><span class="num">$72</span><small>per visit, $288 a year</small></th></tr></thead>
  <tbody>${ROWS.map(([h, a, b, c]) => `<tr${c ? ` class="${c}"` : ""}><th scope="row">${h}</th><td>${cell(a)}</td><td class="pick">${cell(b)}</td></tr>`).join("")}</tbody></table></div>
  <div class="pc-adds" aria-label="Priced separately">${ADDS.map(([a, b]) => `<div><span class="muted">${a}</span><span class="num">${b}</span></div>`).join("")}</div>
</div></section>

<section class="sk-sec sk-alt" id="safety"><div class="sk-wrap pc-care">
  <div><span class="sk-eyebrow">Before we arrive</span><h2 class="sk-h2" style="margin-top:12px">How to prepare</h2>
    <div class="pc-prep">${PREP.map(([h, l]) => `<div><h3>${h}</h3><ul>${l.map((x) => `<li>${ic("check", 14)}<span>${esc(x)}</span></li>`).join("")}</ul></div>`).join("")}</div></div>
  <aside class="card feat pc-safe"><h3 class="h">Children and pets</h3><ul>${SAFE.map((x) => `<li>${esc(x)}</li>`).join("")}</ul><p>If a child or pet needs medical care, call your doctor or vet and show them your visit report.</p></aside>
</div></section>

<section class="sk-sec" id="areas"><div class="sk-wrap pc-duo">
  <div><span class="sk-eyebrow">Commercial</span><h2 class="sk-h2" style="margin-top:12px">Running a kitchen, shop or warehouse?</h2>
    <p class="muted" style="margin-top:12px">Scheduled visits outside trading hours, unmarked vans on request, and a site logbook with trap maps and reports, ready when a food safety inspector asks to see it.</p>
    <div class="pc-kinds">${["Restaurants and cafes", "Food production", "Offices", "Shops", "Warehouses", "Property managers", "Schools and care homes"].map((x) => `<span>${x}</span>`).join("")}</div>
    <a class="btn sk-btn-lg" href="#book-a-visit">Ask for a site survey</a></div>
  <div><span class="sk-eyebrow">Service areas</span><h2 class="sk-h2" style="margin-top:12px">Where our routes run</h2>
    <table class="pc-routes"><thead><tr><th scope="col">Area</th><th scope="col">Route days</th></tr></thead><tbody>${ROUTES.map(([a, d]) => `<tr><td>${a}</td><td>${d}</td></tr>`).join("")}</tbody></table>
    <p class="muted" style="font-size:13.5px;margin-top:12px">Further out? We can usually add you to a route within the week.</p></div>
</div></section>

<section class="sk-sec sk-alt" id="reviews"><div class="sk-wrap">
  <div class="sk-head" style="margin-bottom:28px"><div><span class="sk-eyebrow">Field notes</span><h2 class="sk-h2">From our customers</h2></div></div>
  <div class="pc-notes sk-rail">${NOTES.map(([k, q, w]) => `<article class="card pc-note"><span class="badge" style="justify-self:start">${k}</span><blockquote>${esc(q)}</blockquote><footer><span>${w}</span></footer></article>`).join("")}</div>
</div></section>

<section class="sk-sec" id="book-a-visit"><div class="sk-wrap pc-book">
  <div><span class="sk-eyebrow">Book</span><h2 class="sk-h2" style="margin-top:12px">Tell us what you found</h2>
    <p class="muted" style="margin-top:10px">We reply within two working hours with a visit window and a starting price.</p>
    <ul class="pc-direct"><li><span>${ic("phone", 18)}</span><span><b>(555) 014-2230</b><br><span class="muted">Mon to Sat, 7 AM to 7 PM</span></span></li><li><span>${ic("image", 18)}</span><span><b>Text a photo to (555) 014-2231</b><br><span class="muted">Free identification, usually within the hour</span></span></li><li><span>${ic("pin", 18)}</span><span><b>41 Tanner's Row, Alderton</b><br><span class="muted">Depot and office</span></span></li></ul>
    <div class="pc-slot">Add your pest control license number and insurance details here</div></div>
  <form class="card pc-form" aria-label="Book a visit">
    <div class="sk-g2"><div class="sk-field"><label for="pc-pest">What did you see?</label><select class="sk-input" id="pc-pest"><option>Rats or mice</option><option>Ants</option><option>Cockroaches</option><option>Bed bugs</option><option>Termites</option><option>Wasps</option><option>Not sure</option></select></div>
    <div class="sk-field"><label for="pc-long">How long has it been going on?</label><select class="sk-input" id="pc-long"><option>About two weeks</option><option>Just today</option><option>A few months</option></select></div></div>
    <div class="sk-field"><span style="font-weight:500;font-size:13px">Where did you see it?</span><div class="pc-where"><label><input type="radio" name="pc-where"> Kitchen</label><label class="on"><input type="radio" name="pc-where" checked> Attic or ceiling</label><label><input type="radio" name="pc-where"> Bedroom</label><label><input type="radio" name="pc-where"> Bathroom</label><label><input type="radio" name="pc-where"> Garage</label><label><input type="radio" name="pc-where"> Outside</label></div></div>
    <div class="sk-g2"><div class="sk-field"><label for="pc-name">Your name</label><input class="sk-input" id="pc-name" value="Elena Marchetti"></div><div class="sk-field"><label for="pc-phone">Mobile</label><input class="sk-input" id="pc-phone" value="(555) 017-4406"></div></div>
    <div class="sk-g2"><div class="sk-field"><label for="pc-addr">Address</label><input class="sk-input" id="pc-addr" value="8 Orchard Rise, Dunmere"></div><div class="sk-field"><label for="pc-win">Preferred window</label><select class="sk-input" id="pc-win"><option>Tue morning, 8 to 12</option><option>Tue afternoon, 12 to 4</option><option>Earliest available</option></select></div></div>
    <div class="sk-field"><label for="pc-note">Children, pets or anything else we should know?</label><textarea class="sk-input" id="pc-note" rows="2" style="min-height:76px">One dog and a toddler. Scratching above the back bedroom at night.</textarea></div>
    <button class="btn primary sk-btn-lg" type="button">Request a visit</button>
  </form>
</div></section>
</main>
${K.footer(p, "Local pest control for homes and businesses, starting with an inspection and ending with a written report.", [["Pests", ["Ants and cockroaches", "Rats and mice", "Bed bugs", "Termites and wasps"]], ["Services", ["One-off visits", "Quarterly plans", "Rodent proofing", "Commercial contracts"]], ["Contact", ["(555) 014-2230", "hello@mothwell.example", "41 Tanner's Row, Alderton"]]], `Fictional company created for this template. © 2026 ${p.name}.`)}`, CSS);

module.exports = {
  "pest-control-website": K.def("pest", "Pest control website",
    "a full pest control home page in a field-guide style: navigation with book and call buttons, a title-page hero with a pinned moth specimen plate, collector's tag and contents list, a route facts strip, a what-did-you-see identifier of six illustrated specimen cards with signs to look for, usual visit and starting price, what happens on a visit beside a filled sample visit report, a one-off versus quarterly plan table with add-on prices, how to prepare by pest beside children and pets safety notes, a commercial note beside service area route days, customer reviews, a booking form with pest type and where you saw it, and a footer",
    ["navigation-header", "hero", "specimen-cards", "pest-identifier", "illustration", "steps", "visit-report", "comparison-table", "pricing-table", "checklist", "safety-notes", "service-areas", "reviews", "booking-form", "footer", "pest-control"], web),
};
