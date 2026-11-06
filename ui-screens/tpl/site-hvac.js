/* HVAC company website template (Northdraft Heating & Cooling, a fictional local contractor). Full responsive, dispatch-led home page:
   24/7 emergency bar, nav, hero with dispatch board (ZIP check + today's arrival windows), "What's it doing?" symptom picker (CSS-only radio
   tabs, no JS) routing to repair, tune-up or replacement in a dispatcher's voice, before-you-call safe checks with gas safety line,
   repair/install/replace plus furnace, AC, heat pump and air quality services, all-makes band, maintenance plan table with visit
   checklists, financing wording, technician roster, reviews, booking, footer. Reviews are fictional. No brand names or logos. */
const { ic, esc } = require("../lib");
const K = require("../sitekit");

const CSS = `<style>
.hv-bar{background:var(--danger);color:var(--on-danger);font-size:14px}
.hv-bar .sk-wrap{display:flex;align-items:center;justify-content:space-between;gap:16px;min-height:44px;padding-block:6px}
.hv-bar b{font-weight:700}
.hv-bar a{display:inline-flex;align-items:center;gap:7px;font-weight:700;white-space:nowrap}
.hv-pulse{display:inline-block;width:9px;height:9px;border-radius:50%;background:var(--on-danger);margin-right:9px}
.hv>.sk-sec{padding:60px 0}
.hv h2.sk-h2{font-size:calc(36px * var(--hs))}
.hv-hero{padding:40px 0 48px;border-bottom:4px solid var(--text)}
.hv-htop{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(0,1fr);gap:48px;align-items:end;margin-bottom:26px}
.hv-htop h1{font-size:calc(60px * var(--hs));line-height:1.02}
.hv-htop>div{display:grid;gap:14px;justify-items:start}
.hv-htop p{color:var(--muted);font-size:16px}
.hv-board{display:grid;grid-template-columns:minmax(0,.8fr) minmax(0,1.5fr);border:2px solid var(--text);background:var(--surface)}
.hv-zip{padding:22px;display:grid;gap:12px;align-content:start;border-right:2px solid var(--text)}
.hv-zip h2,.hv-win h2{font:700 13px var(--font-b);letter-spacing:.06em;text-transform:uppercase}
.hv-zrow{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px}
.hv-zrow .btn{height:46px;padding:0 18px}
.hv-res{display:grid;grid-template-columns:20px minmax(0,1fr);gap:8px;font-size:14px;padding:10px 12px;background:color-mix(in oklab,var(--success) 12%,var(--bg));border-left:3px solid var(--success)}
.hv-res>span:first-child{color:var(--success);padding-top:1px}
.hv-area{font-size:13px;color:var(--muted)}
.hv-win{padding:22px;display:grid;gap:12px;align-content:start}
.hv-winh{display:flex;justify-content:space-between;align-items:baseline;gap:12px}
.hv-winh span{font-size:13px;color:var(--muted)}
.hv-slots{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px}
.hv-slot{border:1px solid var(--border);padding:11px 10px;display:grid;gap:3px;background:var(--bg);border-radius:var(--radius-sm)}
.hv-slot .num{font-size:15px}
.hv-slot span{font-size:12px;color:var(--muted);line-height:1.3}
.hv-slot.open{border-color:var(--text)}
.hv-slot.open span{color:var(--success);font-weight:600}
.hv-slot.few span{color:var(--warning);font-weight:600}
.hv-slot.full{opacity:.55}
.hv-slot.full .num{text-decoration:line-through}
.hv-winf{display:flex;flex-wrap:wrap;gap:6px 22px;font-size:13px;color:var(--muted)}
.hv-winf span{display:inline-flex;gap:6px;align-items:center}
.hv-pick{display:grid;grid-template-columns:330px minmax(0,1fr);gap:0;border:2px solid var(--text);background:var(--surface);position:relative}
.hv-r{position:absolute;opacity:0;width:1px;height:1px}
.hv-tabs{display:grid;grid-auto-rows:1fr;border-right:2px solid var(--text)}
.hv-tabs label{display:grid;grid-template-columns:34px minmax(0,1fr) 16px;gap:10px;align-items:center;padding:12px 16px;border-bottom:1px solid var(--border);cursor:pointer;font-weight:600;font-size:15px;background:var(--bg)}
.hv-tabs label:last-child{border-bottom:0}
.hv-tabs small{display:block;font:400 12.5px var(--font-b);color:var(--muted)}
.hv-tabs label>span:last-child{opacity:0}
.hv-ico{width:34px;height:34px;display:grid;place-items:center;border-radius:var(--radius-sm);background:color-mix(in oklab,var(--primary) 13%,var(--bg));color:color-mix(in oklab,var(--primary) 78%,var(--text))}
.hv-panels{display:grid;min-width:0}
.hv-p{display:none;padding:24px 28px;gap:12px;align-content:start}
#hv-s1:checked~.hv-tabs label[for=hv-s1],#hv-s2:checked~.hv-tabs label[for=hv-s2],#hv-s3:checked~.hv-tabs label[for=hv-s3],#hv-s4:checked~.hv-tabs label[for=hv-s4],#hv-s5:checked~.hv-tabs label[for=hv-s5],#hv-s6:checked~.hv-tabs label[for=hv-s6]{background:var(--text);color:var(--bg)}
#hv-s1:checked~.hv-tabs label[for=hv-s1] small,#hv-s2:checked~.hv-tabs label[for=hv-s2] small,#hv-s3:checked~.hv-tabs label[for=hv-s3] small,#hv-s4:checked~.hv-tabs label[for=hv-s4] small,#hv-s5:checked~.hv-tabs label[for=hv-s5] small,#hv-s6:checked~.hv-tabs label[for=hv-s6] small{color:inherit;opacity:.75}
#hv-s1:checked~.hv-tabs label[for=hv-s1]>span:last-child,#hv-s2:checked~.hv-tabs label[for=hv-s2]>span:last-child,#hv-s3:checked~.hv-tabs label[for=hv-s3]>span:last-child,#hv-s4:checked~.hv-tabs label[for=hv-s4]>span:last-child,#hv-s5:checked~.hv-tabs label[for=hv-s5]>span:last-child,#hv-s6:checked~.hv-tabs label[for=hv-s6]>span:last-child{opacity:1}
#hv-s1:checked~.hv-panels #hv-p1,#hv-s2:checked~.hv-panels #hv-p2,#hv-s3:checked~.hv-panels #hv-p3,#hv-s4:checked~.hv-panels #hv-p4,#hv-s5:checked~.hv-panels #hv-p5,#hv-s6:checked~.hv-panels #hv-p6{display:grid}
.hv-r:focus-visible~.hv-tabs{outline:2px solid var(--primary);outline-offset:2px}
.hv-from{display:flex;align-items:center;gap:8px;font-size:12.5px;font-weight:600;color:var(--muted);letter-spacing:.03em}
.hv-from .i{color:var(--success)}
.hv-say{font-size:calc(20px * var(--hs));line-height:1.3;font-family:var(--font-h);font-weight:var(--hw)}
.hv-ask{list-style:none;display:grid;gap:6px;font-size:14px}
.hv-ask li{display:grid;grid-template-columns:18px minmax(0,1fr);gap:8px}
.hv-ask li>span:first-child{padding-top:2px;color:color-mix(in oklab,var(--primary) 78%,var(--text))}
.hv-route{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));border:1px solid var(--border);margin-top:4px}
.hv-route div{padding:9px 12px;font-size:13px;border-right:1px solid var(--border);display:grid;gap:1px;color:var(--muted)}
.hv-route div:last-child{border-right:0}
.hv-route b{font-size:14px}
.hv-route .maybe{color:var(--text)}
.hv-route .on{background:color-mix(in oklab,var(--primary) 12%,var(--surface));color:var(--text);box-shadow:inset 0 3px 0 var(--primary)}
.hv-pfoot{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;margin-top:2px}
.hv-pfoot span{font-size:13.5px;color:var(--muted);flex:1 1 300px}
.hv-warn{padding:10px 12px;border-left:3px solid var(--danger);background:color-mix(in oklab,var(--danger) 10%,var(--bg));font-size:14px;font-weight:500}
.hv-before{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);gap:32px;align-items:stretch;margin-top:26px}
.hv-chk{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 28px;list-style:none;font-size:14px;margin-top:10px}
.hv-chk li{display:grid;grid-template-columns:20px minmax(0,1fr);gap:8px;padding:7px 0;border-top:1px solid var(--border);line-height:1.4}
.hv-box{width:15px;height:15px;border:2px solid var(--text);margin-top:3px;border-radius:2px}
.hv-gas{background:var(--danger);color:var(--on-danger);padding:20px 22px;display:grid;gap:8px;align-content:center}
.hv-gas h3{font-size:calc(21px * var(--hs));display:flex;gap:9px;align-items:center}
.hv-gas p{font-size:14.5px}
.hv-svc{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:0;border:2px solid var(--text);margin-bottom:18px}
.hv-svc article{padding:20px 22px;border-right:2px solid var(--text);display:grid;gap:7px;align-content:start;background:var(--surface)}
.hv-svc article:last-child{border-right:0}
.hv-svc p{font-size:14px;color:var(--muted)}
.hv-svc .hv-m{font-size:13px;font-weight:600;padding-top:7px;border-top:1px dashed var(--border)}
.hv-sys{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:24px}
.hv-sys article{display:grid;gap:7px;align-content:start;border-top:3px solid var(--text);padding-top:12px}
.hv-sys ul{list-style:none;display:grid;gap:3px;font-size:13.5px;color:var(--muted)}
.hv-makes{background:var(--text);color:var(--bg);padding:24px 0}
.hv-makes .sk-wrap{display:grid;grid-template-columns:auto minmax(0,1fr);gap:40px;align-items:center}
.hv-makes h2{font-size:calc(25px * var(--hs));white-space:nowrap}
.hv-makes p{font-size:14.5px;color:color-mix(in oklab,var(--bg) 78%,var(--text))}
.hv-mtbl{width:100%;border-collapse:collapse;font-size:14px;border:2px solid var(--text);background:var(--surface)}
.hv-mtbl th,.hv-mtbl td{padding:9px 16px;border-bottom:1px solid var(--border);text-align:center}
.hv-mtbl th:first-child,.hv-mtbl td:first-child{text-align:left}
.hv-mtbl thead th{font:700 15px var(--font-b);border-bottom:2px solid var(--text);vertical-align:bottom;padding-top:14px}
.hv-mtbl thead .num{display:block;font-size:24px;margin-top:2px}
.hv-mtbl thead small{font:400 12px var(--font-b);color:var(--muted)}
.hv-mtbl .sel{background:color-mix(in oklab,var(--primary) 9%,var(--surface))}
.hv-mtbl tr:last-child td{border-bottom:0}
.hv-mtbl .i{color:var(--success)}
.hv-mtbl .muted .i{color:var(--muted)}
.hv-visits{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:28px;margin-top:22px}
.hv-visits h3{display:flex;gap:8px;align-items:center;margin-bottom:8px}
.hv-visits ul{list-style:none;columns:2;column-gap:22px;font-size:13.5px}
.hv-visits li{padding:3px 0;break-inside:avoid;color:var(--muted);display:grid;grid-template-columns:16px minmax(0,1fr);gap:6px}
.hv-visits li>span:first-child{color:var(--text);padding-top:1px}
.hv-fin{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px 28px;padding:16px 20px;border:2px dashed var(--border);margin-top:22px}
.hv-fin div{flex:1 1 420px;font-size:14px;color:var(--muted)}
.hv-fin b{color:var(--text)}
.hv-crew{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}
.hv-tech{padding:18px;display:grid;gap:9px;align-content:start}
.hv-techt{display:grid;grid-template-columns:52px minmax(0,1fr);gap:12px;align-items:center}
.hv-av{width:52px;height:52px;border-radius:var(--radius);overflow:hidden}
.hv-av svg{display:block;width:100%;height:100%}
.hv-stat{display:flex;gap:7px;align-items:center;font-size:12.5px;font-weight:600;padding:6px 9px;background:var(--bg);border:1px solid var(--border)}
.hv-stat i{width:8px;height:8px;border-radius:50%;flex:none}
.hv-tech p{font-size:13.5px;color:var(--muted)}
.hv-revs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px;margin-top:20px}
.hv-rev{display:grid;gap:7px;align-content:start;border-left:3px solid var(--text);padding-left:16px}
.hv-rev p{font-size:14px}
.hv-rev footer{font-size:12.5px;color:var(--muted)}
.hv-stars{display:flex;gap:2px;color:color-mix(in oklab,var(--accent) 80%,var(--text))}
.hv-stars svg{fill:currentColor}
.hv-book{display:grid;grid-template-columns:minmax(0,.8fr) minmax(0,1.2fr);gap:48px;align-items:start}
.hv-book>div:first-child{display:grid;gap:12px;justify-items:start}
.hv-book>div:first-child p{color:var(--muted);font-size:15.5px}
.hv-fees{width:100%;border-collapse:collapse;font-size:14px}
.hv-fees td{padding:7px 0;border-bottom:1px solid var(--border)}
.hv-fees td:last-child{text-align:right;font-weight:600}
.hv-form{padding:24px;display:grid;gap:12px}
.hv-form .sk-g2{gap:12px}
.hv-opt{display:flex;flex-wrap:wrap;gap:6px}
.hv-opt label{height:38px;padding:0 12px;border:1px solid var(--border);display:inline-flex;align-items:center;gap:7px;font-size:13.5px;font-weight:600;background:var(--bg);cursor:pointer;border-radius:var(--radius-sm)}
.hv-opt label:has(input:checked){border-color:var(--text);box-shadow:inset 0 0 0 1px var(--text)}
.hv-opt input{accent-color:var(--primary)}
@media (max-width:1024px){
  .hv-htop{gap:28px}
  .hv-board{grid-template-columns:minmax(0,1fr)}
  .hv-zip{border-right:0;border-bottom:2px solid var(--text)}
  .hv-pick{grid-template-columns:260px minmax(0,1fr)}
  .hv-sys{grid-template-columns:repeat(2,minmax(0,1fr))}
  .hv-visits ul{columns:1}
  .hv-book{gap:32px}
}
@media (max-width:760px){
  .hv>.sk-sec{padding:40px 0}
  .hv h2.sk-h2{font-size:calc(29px * var(--hs))}
  .hv-bar{font-size:13px}
  .hv-bar .sk-wrap{min-height:40px}
  .hv-bar .hv-long{display:none}
  .hv-hero{padding:22px 0 30px}
  .hv-htop{grid-template-columns:minmax(0,1fr);gap:12px;margin-bottom:18px}
  .hv-htop h1{font-size:calc(40px * var(--hs))}
  .hv-htop p{font-size:15px}
  .hv-htop .sk-btn-lg{width:100%}
  .hv-zip,.hv-win{padding:16px}
  .hv-slots{grid-template-columns:repeat(2,minmax(0,1fr));gap:6px}
  .hv-slot{padding:8px 10px}
  .hv-slot.full{display:none}
  .hv-pick{grid-template-columns:minmax(0,1fr)}
  .hv-tabs{grid-template-columns:repeat(2,minmax(0,1fr));grid-auto-rows:auto;border-right:0;border-bottom:2px solid var(--text)}
  .hv-tabs label{grid-template-columns:minmax(0,1fr);padding:10px 12px;font-size:14px;border-right:1px solid var(--border);border-bottom:1px solid var(--border)}
  .hv-tabs .hv-ico,.hv-tabs label>span:last-child,.hv-tabs small{display:none}
  .hv-p{padding:18px 16px}
  .hv-say{font-size:calc(18px * var(--hs))}
  .hv-route div{padding:8px;font-size:12px}
  .hv-route b{font-size:13px}
  .hv-pfoot .btn{width:100%}
  .hv-before{grid-template-columns:minmax(0,1fr);gap:16px;margin-top:20px}
  .hv-chk{grid-template-columns:minmax(0,1fr)}
  .hv-gas{padding:16px 18px}
  .hv-svc{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;scroll-padding-inline:20px;margin:0 -20px 14px;padding:0 20px;border:0;gap:10px;scrollbar-width:none}
  .hv-svc article{flex:0 0 80%;scroll-snap-align:start;border:2px solid var(--text);padding:16px}
  .hv-svc article:last-child{border-right:2px solid var(--text)}
  .hv-sys{grid-template-columns:repeat(2,minmax(0,1fr));gap:18px 14px}
  .hv-makes .sk-wrap{grid-template-columns:minmax(0,1fr);gap:6px}
  .hv-makes h2{white-space:normal}
  .hv-mtbl{font-size:13px}
  .hv-mtbl th,.hv-mtbl td{padding:7px 6px}
  .hv-mtbl thead th{font-size:13px}
  .hv-mtbl td:not(:first-child){white-space:nowrap}
  .hv-mtbl thead .num{font-size:18px}
  .hv-mtbl thead small{display:none}
  .hv-visits{grid-template-columns:minmax(0,1fr);gap:18px;margin-top:18px}
  .hv-fin{padding:14px}
  .hv-book{grid-template-columns:minmax(0,1fr);gap:20px}
  .hv-form{padding:18px}
  .hv-form .sk-g2{grid-template-columns:minmax(0,1fr)}
}
</style>`;

// Symptom glyphs the shared icon set lacks (stroke follows currentColor).
const G = (d, n = 18) => `<svg class="i" width="${n}" height="${n}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const GLYPH = {
  flame: '<path d="M12 3c1 3.5 5.5 6 5.5 11a5.5 5.5 0 0 1-11 0c0-2.2 1-3.8 2.3-5 .3 1.6 1.1 2.5 2.2 3C10.7 9 10.8 6 12 3z"/>',
  snow: '<path d="M12 3v18M4.2 7.5l15.6 9M19.8 7.5l-15.6 9M9.5 4.5 12 7l2.5-2.5M9.5 19.5 12 17l2.5 2.5"/>',
  noise: '<path d="M4 10v4M8 7v10M12 4v16M16 8v8M20 11v2"/>',
  drop: '<path d="M12 3s6.5 6.7 6.5 11.2a6.5 6.5 0 0 1-13 0C5.5 9.7 12 3 12 3z"/>',
  bill: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2zM9.5 8h5M9.5 12h5"/>',
  smell: '<path d="M8 20c-2-3 2-5 0-8s2-5 0-8M16 20c-2-3 2-5 0-8s2-5 0-8"/>',
  alert: '<path d="M12 4 2.8 20h18.4zM12 10v5M12 17.5v.1"/>',
};
const SYMPTOMS = [
  { id: 1, g: "flame", t: "No heat", d: "Cold air or nothing at all", route: [["on","Most likely, today"],["","Not for this one"],["maybe","If the heat exchanger is cracked"]], say: "Okay, let’s get you warm. Three quick things before I roll a truck.",
    ask: ["Is the thermostat on Heat and set above room temperature?", "Is the switch by the furnace on? It looks like a light switch.", "When did you last change the filter? A packed filter can shut a furnace down."],
    next: "Still nothing? You go on today’s board. Tell me if there’s a baby, an older person or anyone unwell at home, and I’ll move you up.", cta: "Get on today’s board" },
  { id: 2, g: "snow", t: "No cooling", d: "Running, but the air is warm", route: [["on","Most likely, often today"],["maybe","If it’s only a dirty coil"],["maybe","If it’s leaking old refrigerant"]], say: "Got it. Go look at the outdoor unit for me. Is the fan turning?",
    ask: ["Fan spinning, air warm: often a capacitor, contactor or low refrigerant.", "Ice on the copper line or indoor coil: turn cooling off and set the fan to On. We can’t test a frozen coil.", "Nothing moving outside: check the breaker once. If it trips again, leave it off."],
    next: "Most of these are a same-day repair, and most of the parts are on the truck.", cta: "Book a repair" },
  { id: 3, g: "noise", t: "Strange noise", d: "Banging, squealing, rattling", route: [["on","This week, unless it’s a boom"],["maybe","If it’s only a loose panel"],["maybe","If a worn motor is on an old unit"]], say: "Tell me what it sounds like. The sound usually tells me who to send.",
    ask: ["Boom when the burners light: turn it off and call me now.", "Metal scraping or grinding: turn it off. That’s a blower or a fan hitting something.", "Squeal or hum: a motor or a capacitor on its way out. It can wait a day.", "Rattle: often a loose panel. It can wait for a tune-up."],
    next: "If it’s still running and only annoying, I’ll give you a window this week instead of an emergency rate.", cta: "Book a repair" },
  { id: 4, g: "drop", t: "Water leak", d: "Puddle by the indoor unit", route: [["on","Usually today"],["maybe","A drain flush stops repeats"],["maybe","If the pan or coil has rusted through"]], say: "Turn the system off at the thermostat, then put down a towel or a pan.",
    ask: ["In cooling season, it’s most often a plugged condensate drain or a full pan.", "A furnace can leak too, on high-efficiency models with their own drain.", "If water is near an outlet or wiring, stay clear and switch off the breaker from the panel."],
    next: "Drain clears are quick, so I can usually fit you in today. Every tune-up flushes the drain, which stops most of these.", cta: "Book a repair" },
  { id: 5, g: "bill", t: "High bills", d: "Costs up, comfort down", route: [["","Only if we find a fault"],["on","Start here"],["maybe","Past 15 years, and repair is over half the cost of new"]], say: "If your usage hasn’t changed, I’d start with a tune-up, not a repair.",
    ask: ["A dirty coil or filter makes the system run longer for the same comfort.", "We measure airflow and temperature split, so you get numbers rather than a guess.", "Rooms that never reach temperature may point to leaky ducts."],
    next: "No rush on this one. Pick a window that suits you.", cta: "Book a tune-up" },
  { id: 6, g: "smell", t: "Smell", d: "Gas, burning or musty", route: [["on","Once the home is safe"],["maybe","For musty or damp smells"],["maybe","If the heat exchanger has failed"]], say: "First question, and it matters: does it smell like rotten eggs?",
    warn: "Rotten eggs or gas: stop reading. Leave the building now, and from outside call your gas utility or your local emergency number.",
    ask: ["Burning plastic or hot wiring: turn the system off at the breaker and call me.", "Dusty smell at first heat of the year: normal for an hour. If it stays, call.", "Musty or damp: usually the drain pan or ducts. A tune-up will find it."],
    next: "Once the gas utility has cleared the house, call me and we’ll find the cause and test the system.", cta: "Call dispatch" },
];
const ROUTES = ["Repair", "Tune-up", "Replacement"];
const panel = (s) => `<div class="hv-p" id="hv-p${s.id}"><div class="hv-from">${ic("phone", 14)} DISPATCH, ON THE LINE</div><p class="hv-say">“${s.say}”</p>${s.warn ? `<div class="hv-warn">${s.warn}</div>` : ""}
<ul class="hv-ask">${s.ask.map((a) => `<li><span>${ic("arrow", 14)}</span><span>${a}</span></li>`).join("")}</ul>
<div class="hv-route" aria-label="Where this usually goes">${ROUTES.map((a, i) => `<div class="${s.route[i][0]}"><b>${a}</b><span>${s.route[i][1]}</span></div>`).join("")}</div>
<div class="hv-pfoot"><span>${s.next}</span><a class="btn primary sk-btn-lg" href="#${s.id === 6 ? "top" : "book"}">${s.cta}</a></div></div>`;

const SLOTS = [["8 to 10 AM", "Full", "full"], ["10 AM to 12", "1 truck left", "few"], ["12 to 2 PM", "Open", "open"], ["2 to 4 PM", "Open", "open"], ["4 to 6 PM", "2 trucks left", "few"]];

const CHECKS = ["Thermostat is on the right mode, with fresh batteries", "Filter isn’t clogged. Swap it if you can’t see light through it", "Breaker hasn’t tripped. Reset once only; if it trips again, leave it", "Furnace switch is on (it looks like a light switch)", "Vents and returns aren’t blocked by furniture", "Outdoor unit is clear of snow, leaves and covers"];

const JOBS = [
  ["Repair", "Flat-rate pricing by the job, quoted before we start. Common parts are on the truck, so most repairs finish on the first visit.", "Diagnostic $89, credited if you go ahead"],
  ["Install", "New systems, additions and finished basements. We do a room-by-room load calculation and check the ductwork before sizing anything.", "Free written proposal"],
  ["Replace", "Same-week swap-outs. You get good, better and top options on paper, with the running costs and warranty for each.", "Free second opinion on any quote"],
];
const SYSTEMS = [
  ["Furnaces", ["Gas and electric furnaces", "Ignition and flame sensors", "Blower motors", "Heat exchanger checks"]],
  ["Air conditioning", ["Central AC", "Capacitors and contactors", "Refrigerant leaks", "Coil cleaning and drain lines"]],
  ["Heat pumps", ["Ducted and ductless", "Defrost and reversing valves", "Cold-climate systems", "Backup heat strips"]],
  ["Air quality", ["Media filters and air cleaners", "Whole-home humidifiers", "Duct sealing and cleaning", "Fresh air ventilation"]],
];

const yes = ic("check", 16);
const no = `<span class="muted">${ic("minus", 14)}</span>`;
const PLAN_ROWS = [["Tune-ups each year", "1", "2", "2"], ["Systems covered", "1", "1", "Up to 2"], ["Priority on the dispatch board", no, yes, yes], ["Repair discount", no, "$50 off", "$100 off"], ["After-hours call-out fee", "$149", "$75", "Waived"], ["Filters supplied at each visit", no, no, yes]];
const COOL = ["Clean the outdoor coil", "Check refrigerant pressures", "Test capacitor and contactor", "Measure temperature split", "Flush the condensate drain", "Check airflow and filter"];
const HEAT = ["Inspect the heat exchanger", "Test safety and limit switches", "Clean burners and flame sensor", "Check gas pressure and combustion", "Test for carbon monoxide", "Check blower and belts"];

const skinFace = (id, s, h, c) => `<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Portrait of a technician in a work shirt"><rect width="100" height="100" fill="#d7dcd8"/><path d="M8 100c3-24 20-34 42-34s39 10 42 34z" fill="${c}"/><rect x="42" y="52" width="16" height="20" fill="${s}"/><ellipse cx="50" cy="40" rx="20" ry="23" fill="${s}"/><path d="M29 36c1-20 11-27 21-27s20 7 21 27c-12-8-30-8-42 0z" fill="${h}"/><path d="M26 37c10-7 38-7 48 0l4 3H24z" fill="#3b4a55"/></svg>`;
const CREW = [
  ["1", "#c9956e", "#22201e", "#3f5a6b", "Ruben Tallis", "Lead service tech, Truck 7", "On a no-heat call, Millbrook. Free about 11:40", "warning", "Gas furnaces and heat pumps. Eleven winters on the road."],
  ["2", "#efc7a6", "#7a4d2c", "#3f5a6b", "Dana Wyckley", "Service tech, Truck 12", "Heading to Cooper Flats. Arrives 10:15", "success", "AC diagnostics and refrigerant leak repair."],
  ["3", "#8c5b3e", "#141211", "#3f5a6b", "Kofi Brandvold", "Install lead, Truck 3", "On an install, Eastmere, until 3:00", "warning", "Replacements, ductwork and load calculations."],
];
const STAR = Array.from({ length: 5 }, () => ic("star", 14)).join("");
const REVIEWS = [
  ["Called at 6 AM with no heat and two kids at home. The dispatcher walked me through the filter and the switch, then got Ruben here by 9:30.", "Marta V.", "No heat, Millbrook"],
  ["They told me not to replace the AC yet. A $180 capacitor and contactor job, and it’s been cold all summer.", "Glen H.", "AC repair, Eastmere"],
  ["Three options on paper, no pressure, and the crew put down floor runners and took the old furnace away.", "Asha P.", "Furnace replacement, Harlow Park"],
];

const web = (p, st) => K.page(st, `<div class="hv-bar"><div class="sk-wrap"><span><span class="hv-pulse"></span><b>24/7 emergency service.</b><span class="hv-long"> A dispatcher answers, day and night, including holidays.</span></span><a href="#top">${ic("phone", 15)} (555) 019-4470</a></div></div>
${K.nav(p, ["Services", "Maintenance plans", "Our techs", "Service area"], "Book service", "Call dispatch")}
<main class="hv" id="top">
<section class="hv-hero" id="service-area"><div class="sk-wrap">
  <div class="hv-htop">
    <div><span class="sk-eyebrow">Heating, cooling and air quality repair</span><h1>No heat? No cooling? We’ve got a truck for that today.</h1></div>
    <div><p>${esc(p.name)} runs its own dispatch desk. Tell us what the system is doing and we’ll tell you what happens next, what it costs and when we’ll be there.</p><div class="sk-row"><a class="btn primary sk-btn-lg" href="#whats-it-doing">What’s it doing?</a><a class="btn sk-btn-lg" href="#book">${ic("calendar", 16)} Book service</a></div></div>
  </div>
  <div class="hv-board">
    <form class="hv-zip" aria-label="Check your service area"><h2>Are you in our area?</h2>
      <div class="sk-field"><label for="hv-z">ZIP code</label><div class="hv-zrow"><input class="sk-input" id="hv-z" value="00142" inputmode="numeric"><button class="btn primary" type="button">Check</button></div></div>
      <div class="hv-res"><span>${ic("check", 16)}</span><span><b>Yes, Zone 2 (Cooper Flats).</b> Truck 12 is 20 minutes from you.</span></div>
      <p class="hv-area">We cover Millbrook, Eastmere, Cooper Flats, Harlow Park, Stonebridge and Linden Hill.</p>
    </form>
    <div class="hv-win"><div class="hv-winh"><h2>Today’s arrival windows</h2><span>Fri 6 Nov. Updated 9:42 AM</span></div>
      <div class="hv-slots">${SLOTS.map(([t, s, c]) => `<div class="hv-slot ${c}"><div class="num">${t}</div><span>${s}</span></div>`).join("")}</div>
      <div class="hv-winf"><span>${ic("bolt", 14)} No-heat calls go to the next open truck</span><span>${ic("clock", 14)} We text a 30-minute heads-up</span><span>${ic("phone", 14)} After 6 PM, call dispatch</span></div></div>
  </div>
</div></section>

<section class="sk-sec" id="whats-it-doing"><div class="sk-wrap">
  <div class="sk-head" style="margin-bottom:22px"><div><span class="sk-eyebrow">Start here</span><h2 class="sk-h2">What’s it doing?</h2></div><p class="muted" style="max-width:420px;font-size:14px">Pick the closest match. This is what our dispatcher would ask you on the phone, and where the call usually goes.</p></div>
  <div class="hv-pick">
    ${SYMPTOMS.map((s, i) => `<input class="hv-r" type="radio" name="hv-sym" id="hv-s${s.id}"${i === 0 ? " checked" : ""} aria-label="${s.t}">`).join("")}
    <div class="hv-tabs">${SYMPTOMS.map((s) => `<label for="hv-s${s.id}"><span class="hv-ico">${G(GLYPH[s.g])}</span><span>${s.t}<small>${s.d}</small></span><span>${ic("chevron", 16)}</span></label>`).join("")}</div>
    <div class="hv-panels">${SYMPTOMS.map(panel).join("")}</div>
  </div>
  <div class="hv-before">
    <div><h3 class="sk-h3">Before you call: safe checks only</h3><ul class="hv-chk">${CHECKS.map((c) => `<li><span class="hv-box"></span><span>${c}</span></li>`).join("")}</ul><p class="muted" style="font-size:13px;margin-top:8px">Please leave panels on, and don’t touch wiring, gas lines or the pilot assembly. That part’s on us.</p></div>
    <aside class="hv-gas" aria-label="Gas safety"><h3>${G(GLYPH.alert, 20)} Smell gas?</h3><p>Leave the building now. Don’t use light switches or phones inside. From outside, call your gas utility or your local emergency number.</p><p>Carbon monoxide alarm sounding? Get everyone outside and call your local emergency number.</p></aside>
  </div>
</div></section>

<section class="sk-sec sk-alt" id="services"><div class="sk-wrap">
  <div class="sk-head" style="margin-bottom:22px"><div><span class="sk-eyebrow">Services</span><h2 class="sk-h2">Repair it, replace it or put in new</h2></div></div>
  <div class="hv-svc">${JOBS.map(([a, b, c]) => `<article><h3 class="sk-h3">${a}</h3><p>${b}</p><div class="hv-m">${c}</div></article>`).join("")}</div>
  <div class="hv-sys">${SYSTEMS.map(([a, l]) => `<article><h3 class="sk-h3">${a}</h3><ul>${l.map((x) => `<li>${x}</li>`).join("")}</ul></article>`).join("")}</div>
</div></section>
<section class="hv-makes" aria-label="All makes"><div class="sk-wrap"><h2>We service all makes</h2><p>Any brand, any age, whoever installed it. Our techs aren’t tied to one manufacturer, so a repair quote is just a repair quote.</p></div></section>

<section class="sk-sec" id="maintenance-plans"><div class="sk-wrap">
  <div class="sk-head" style="margin-bottom:22px"><div><span class="sk-eyebrow">Maintenance plans</span><h2 class="sk-h2">Fix it in the shoulder season, not in the cold snap</h2></div></div>
  <table class="hv-mtbl"><thead><tr><th scope="col">Plan</th><th scope="col">One tune-up<span class="num">$139</span><small>single visit</small></th><th scope="col" class="sel">Home<span class="num">$16</span><small>a month</small></th><th scope="col">Home Plus<span class="num">$26</span><small>a month</small></th></tr></thead><tbody>${PLAN_ROWS.map(([t, a, b, c]) => `<tr><td>${t}</td><td>${a}</td><td class="sel">${b}</td><td>${c}</td></tr>`).join("")}</tbody></table>
  <div class="hv-visits">
    <div><h3 class="sk-h3">${ic("sun", 18)} Spring cooling visit</h3><ul>${COOL.map((x) => `<li><span>${ic("check", 13)}</span><span>${x}</span></li>`).join("")}</ul></div>
    <div><h3 class="sk-h3">${ic("bolt", 18)} Fall heating visit</h3><ul>${HEAT.map((x) => `<li><span>${ic("check", 13)}</span><span>${x}</span></li>`).join("")}</ul></div>
  </div>
  <div class="hv-fin"><div><b>Financing on replacements.</b> Monthly payment options are available on approved credit. Rate and term depend on the lender, and we show the full cost on your proposal before you sign.</div><a class="btn" href="#book">Ask about financing</a></div>
</div></section>

<section class="sk-sec sk-alt" id="our-techs"><div class="sk-wrap">
  <div class="sk-head" style="margin-bottom:22px"><div><span class="sk-eyebrow">Our techs</span><h2 class="sk-h2">Who’s out on the road today</h2></div><p class="muted" style="max-width:380px;font-size:14px">All employees, background-checked and licensed. You get the tech’s name and photo by text before they arrive.</p></div>
  <div class="hv-crew sk-rail">${CREW.map(([id, s, h, c, n, r, st2, col, d]) => `<article class="card hv-tech"><div class="hv-techt"><div class="hv-av">${skinFace(id, s, h, c)}</div><div><h3 class="sk-h3">${n}</h3><div class="muted" style="font-size:13px">${r}</div></div></div><div class="hv-stat"><i style="background:var(--${col})"></i>${st2}</div><p>${d}</p></article>`).join("")}</div>
</div></section>

<section class="sk-sec" id="reviews" style="padding-top:48px;padding-bottom:48px"><div class="sk-wrap">
  <div class="sk-head" style="margin-bottom:0"><div><span class="sk-eyebrow">Reviews</span><h2 class="sk-h2">What the neighbors say</h2></div></div>
  <div class="hv-revs sk-rail">${REVIEWS.map(([q, n, m]) => `<article class="hv-rev"><div class="hv-stars" aria-label="5 out of 5">${STAR}</div><p>${q}</p><footer><b style="color:var(--text)">${n}</b> · ${m}</footer></article>`).join("")}</div>
</div></section>

<section class="sk-sec sk-alt" id="book"><div class="sk-wrap hv-book">
  <div><span class="sk-eyebrow">Book service</span><h2 class="sk-h2">Get on the board</h2><p>Give us the address and the problem. We’ll confirm your window by text, usually within 15 minutes.</p>
    <table class="hv-fees"><tbody>${[["Diagnostic visit", "$89"], ["After-hours call-out", "$149"], ["Tune-up", "$139"], ["Replacement quote", "Free"]].map(([a, b]) => `<tr><td>${a}</td><td class="num">${b}</td></tr>`).join("")}</tbody></table></div>
  <form class="card hv-form" aria-label="Book service">
    <div class="sk-field"><span style="font-weight:500;font-size:13px">What’s it doing?</span><div class="hv-opt">${SYMPTOMS.map((s, i) => `<label><input type="radio" name="hv-b"${i === 0 ? " checked" : ""}> ${s.t}</label>`).join("")}</div></div>
    <div class="sk-g2"><div class="sk-field"><label for="hv-sys">System</label><select class="sk-input" id="hv-sys"><option>Gas furnace</option><option>Central AC</option><option>Heat pump</option><option>Not sure</option></select></div><div class="sk-field"><label for="hv-w">Arrival window</label><select class="sk-input" id="hv-w"><option>Today, 12 to 2 PM</option><option>Today, 2 to 4 PM</option><option>Today, 4 to 6 PM</option></select></div></div>
    <div class="sk-g2"><div class="sk-field"><label for="hv-n">Name</label><input class="sk-input" id="hv-n" value="Marta Vasek"></div><div class="sk-field"><label for="hv-t">Mobile</label><input class="sk-input" id="hv-t" value="(555) 019-2256"></div></div>
    <div class="sk-field"><label for="hv-a">Service address</label><input class="sk-input" id="hv-a" value="218 Ironbark Road, Millbrook 00142"></div>
    <button class="btn primary sk-btn-lg" type="button">Book 12 to 2 PM</button>
  </form>
</div></section>
</main>
${K.footer(p, "Local heating, cooling and air quality repair, with a dispatcher on the line 24 hours a day.", [["Services", ["Furnace repair", "AC repair", "Heat pumps", "Air quality"]], ["Dispatch", ["(555) 019-4470", "hello@northdraft.example", "Open 24 hours"]], ["Company", ["75 Foundry Road", "License no. 000-0000", "Financing"]]])}`, CSS);

module.exports = {
  "hvac-website": K.def("hvac", "HVAC company website",
    "a full heating and cooling contractor home page led by dispatch: a 24/7 emergency bar, navigation with call and book buttons, a hero with a ZIP code service area check and a board of today’s arrival windows, a what’s-it-doing symptom picker for no heat, no cooling, strange noise, water leak, high bills and smell that answers like a dispatcher and routes to repair, tune-up or replacement, a before-you-call checklist with a gas safety warning, repair, install and replace options, furnace, AC, heat pump and air quality services, a we-service-all-makes band, a maintenance plan table with spring and fall visit checklists, financing wording, a technician roster with live status, customer reviews, a booking form with fees and a footer",
    ["emergency-bar", "navigation-header", "hero", "zip-check", "time-slots", "symptom-picker", "tabs", "checklist", "safety-warning", "services", "pricing-table", "financing", "team", "status", "testimonials", "booking-form", "footer", "hvac"], web),
};
