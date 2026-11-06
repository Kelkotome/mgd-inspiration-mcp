/* AI agent website template (Oarlock, fictional AI agents for customer support and back-office tasks). A product page built around
   one visible run: nav, split hero whose right half is a coded run log of one refund ticket (reads the ticket, looks up the order,
   drafts a refund, waits for a person, sends the reply), jobs it takes on with where each one stops, a guardrails panel (tool
   permission matrix, limits, always-ask list, audit trail), tools it connects to, human handoff note, a first-week staircase,
   evaluation by replaying past runs against a draft policy, pricing per resolved task, FAQ, try-it form, footer.
   No real models, companies or products, no accuracy or deflection figures. All product UI is coded HTML drawn with tokens only. */
const { ic } = require("../lib");
const K = require("../sitekit");

const CSS = `<style>
.oa{--oa-mono:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;--oa-gut:max(48px,calc((100vw - 1200px)/2 + 48px))}
.oa>.sk-sec{padding:44px 0}
.oa .sk-h2{font-size:calc(36px * var(--hs))}
.oa .sk-head{margin-bottom:22px}
.oa .sk-head>div:first-child{max-width:820px}
.oa-code{font:500 12px/1.5 var(--oa-mono);color:var(--muted)}
.oa-tick{display:inline-grid;place-items:center;flex:0 0 auto;color:color-mix(in oklab,var(--success) 72%,var(--text))}
/* hero: text left, the run log fills the whole right half edge to edge */
.oa-hero{display:grid;grid-template-columns:minmax(0,.84fr) minmax(0,1.16fr);border-bottom:1px solid var(--border)}
.oa-hl{padding:64px 52px 56px var(--oa-gut);display:grid;gap:20px;align-content:center;justify-items:start}
.oa-hl h1{font-size:calc(52px * var(--hs));line-height:1.04}
.oa-promise{list-style:none;display:grid;gap:8px;font-size:14px;margin-top:6px}
.oa-promise li{display:flex;gap:9px;align-items:center}
.oa-log{background:var(--surface);border-left:1px solid var(--border);padding:26px var(--oa-gut) 26px 36px;display:grid;gap:14px;align-content:center}
.oa-rhead{display:flex;flex-wrap:wrap;justify-content:space-between;gap:6px 16px;align-items:center}
.oa-rhead b{font:600 13px var(--oa-mono)}
.oa-tk{border:1px solid var(--border);border-radius:var(--radius);background:var(--bg);padding:12px 14px;font-size:14px;line-height:1.5}
.oa-tk .oa-code{display:block;margin-bottom:3px}
.oa-steps{list-style:none;display:grid}
.oa-step{position:relative;display:grid;grid-template-columns:26px minmax(0,1fr) auto;gap:0 12px;padding-bottom:12px}
.oa-step:last-child{padding-bottom:0}
.oa-step::before{content:"";position:absolute;left:12px;top:26px;bottom:0;width:2px;background:var(--border)}
.oa-step:last-child::before{display:none}
.oa-dot{width:26px;height:26px;border-radius:50%;display:grid;place-items:center;background:color-mix(in oklab,var(--success) 16%,var(--bg));color:color-mix(in oklab,var(--success) 72%,var(--text))}
.oa-step b{font-size:14px;line-height:26px}
.oa-dur{font:500 12px/26px var(--oa-mono);color:var(--muted);white-space:nowrap}
.oa-step p{grid-column:2/-1;font-size:13.5px;line-height:1.45;color:var(--muted)}
.oa-step .oa-code{grid-column:2/-1;overflow-wrap:anywhere}
.oa-step.wait .oa-dot{background:color-mix(in oklab,var(--warning) 22%,var(--bg));color:color-mix(in oklab,var(--warning) 62%,var(--text))}
.oa-step.wait .oa-dur{color:var(--text);font-weight:700}
.oa-appr{grid-column:2/-1;display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:6px 12px;margin-top:6px;padding:8px 12px;border:1px solid color-mix(in oklab,var(--warning) 50%,var(--border));border-radius:var(--radius);background:color-mix(in oklab,var(--warning) 9%,var(--bg));font-size:13px}
.oa-sum{display:flex;flex-wrap:wrap;gap:4px 18px;padding-top:12px;border-top:1px solid var(--border);font:500 12px var(--oa-mono);color:var(--muted)}
.oa-sum b{color:var(--text);font-weight:600}
/* jobs */
.oa-jobs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 56px}
.oa-jobs h3{padding-bottom:10px;border-bottom:2px solid var(--text);font-size:calc(19px * var(--hs))}
.oa-job{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,.8fr);gap:4px 20px;padding:10px 0;border-bottom:1px solid var(--border);font-size:14px}
.oa-job b{display:block;font-size:15px;margin-bottom:2px}
.oa-job p{color:var(--muted);line-height:1.45}
.oa-job small{font-size:13px;line-height:1.45;display:block}
.oa-job small i{font-style:normal;display:block;font:600 11px var(--oa-mono);color:var(--muted);margin-bottom:2px}
/* guardrails */
.oa-guard{padding:0;overflow:hidden}
.oa-gbar{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:8px 16px;padding:13px 22px;border-bottom:1px solid var(--border);background:var(--surface)}
.oa-gbar b{font-size:15px}
.oa-ggrid{display:grid;grid-template-columns:minmax(0,1.62fr) minmax(0,1fr)}
.oa-gmat{min-width:0;padding:6px 22px 14px}
.oa-mat{width:100%;border-collapse:collapse;font-size:14px}
.oa-mat th{text-align:left;font-size:12px;color:var(--muted);font-weight:600;padding:12px 10px 10px 0;border-bottom:1px solid var(--border)}
.oa-mat td{padding:11px 10px 11px 0;border-bottom:1px solid var(--border);vertical-align:middle}
.oa-mat tr:last-child td{border-bottom:0}
.oa-mat td:first-child{font-weight:600}
.oa-p{display:inline-flex;align-items:center;gap:6px;font-size:13px;line-height:1.3}
.oa-p.no{color:var(--muted)}
.oa-p.ask{font-weight:600}
.oa-p.ask>span{color:color-mix(in oklab,var(--warning) 62%,var(--text));display:inline-grid}
.oa-p.yes>span{color:color-mix(in oklab,var(--success) 72%,var(--text));display:inline-grid}
.oa-gside{min-width:0;border-left:1px solid var(--border);padding:16px 22px;display:grid;gap:18px;align-content:start}
.oa-gside h3{font:600 13px var(--font-b);margin-bottom:9px}
.oa-lim{display:grid;gap:11px}
.oa-lim div{display:grid;gap:4px;font-size:13px}
.oa-lim span{display:flex;justify-content:space-between;gap:10px}
.oa-lim span b{font:600 12px var(--oa-mono)}
.oa-lim i{display:block;height:6px;border-radius:999px;background:color-mix(in oklab,var(--text) 10%,var(--bg));overflow:hidden}
.oa-lim i::after{content:"";display:block;height:100%;width:var(--w);background:var(--primary)}
.oa-ask{display:flex;flex-wrap:wrap;gap:6px}
.oa-ask span{font-size:12.5px;padding:3px 9px;border:1px solid color-mix(in oklab,var(--warning) 45%,var(--border));border-radius:var(--radius);background:color-mix(in oklab,var(--warning) 8%,var(--bg))}
.oa-audit{border-top:1px solid var(--border);padding:12px 22px 14px;background:color-mix(in oklab,var(--surface) 55%,var(--bg))}
.oa-audit h3{display:flex;justify-content:space-between;gap:12px;font:600 13px var(--font-b);margin-bottom:6px}
.oa-audit h3 span{font-weight:400;color:var(--muted)}
.oa-aud{display:grid;grid-template-columns:76px minmax(0,180px) minmax(0,1fr) auto;gap:2px 16px;font:500 12px/1.7 var(--oa-mono);color:var(--muted)}
.oa-aud b{font-weight:600;color:var(--text)}
.oa-aud>:nth-child(4n){text-align:right}
/* connect + handoff share a two-column section */
.oa-two{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:56px;align-items:start}
.oa-two>div{display:grid;gap:14px;justify-items:start;min-width:0}
.oa-two>div>p{color:var(--muted)}
.oa-plugs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;width:100%;margin-top:4px}
.oa-plug{display:flex;gap:10px;align-items:center;padding:10px 12px;border:1px solid var(--border);border-radius:var(--radius);background:var(--bg);font-size:14px;font-weight:500;min-width:0}
.oa-plug>span{color:color-mix(in oklab,var(--primary) 78%,var(--text));display:inline-grid}
.oa-plug.more{border-style:dashed;color:var(--muted)}
.oa-ways{list-style:none;display:grid;gap:6px;font-size:14px;width:100%}
.oa-ways li{display:flex;gap:9px;align-items:center}
.oa-note{width:100%;padding:0;overflow:hidden}
.oa-note header{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:11px 16px;border-bottom:1px solid var(--border);background:var(--surface);font-size:13px}
.oa-note dl{display:grid;grid-template-columns:104px minmax(0,1fr);gap:8px 14px;padding:14px 16px;font-size:14px;line-height:1.45}
.oa-note dt{font:600 11px/1.9 var(--oa-mono);color:var(--muted)}
.oa-note footer{display:flex;flex-wrap:wrap;gap:8px;padding:0 16px 14px}
.oa-when{display:flex;flex-wrap:wrap;gap:6px}
.oa-when span{font-size:13px;padding:3px 10px;border:1px solid var(--border);border-radius:999px;background:var(--bg)}
/* first week: a staircase, each day the agent is allowed a little more */
.oa-week{list-style:none;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px;align-items:end}
.oa-day{display:grid;gap:6px;align-content:start;padding:14px;border:1px solid var(--border);border-radius:var(--radius);background:var(--surface);min-height:calc(132px + var(--n) * 20px);border-top:4px solid color-mix(in oklab,var(--primary) calc(30% + var(--n) * 17%),var(--border))}
.oa-day b{font-size:15px;line-height:1.3}
.oa-day p{font-size:13.5px;line-height:1.45;color:var(--muted)}
.oa-day .oa-code{font-size:11px;color:var(--text)}
/* replay */
.oa-rep{display:grid;grid-template-columns:minmax(0,.72fr) minmax(0,1.28fr);gap:44px;align-items:center}
.oa-rep>div:first-child{display:grid;gap:14px;justify-items:start}
.oa-rep>div:first-child>p{color:var(--muted)}
.oa-scrub{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:4px;width:100%}
.oa-scrub span{height:7px;border-radius:999px;background:color-mix(in oklab,var(--text) 12%,var(--bg))}
.oa-scrub span.on{background:var(--primary)}
.oa-diff{padding:0;overflow:hidden}
.oa-dbar{display:flex;flex-wrap:wrap;justify-content:space-between;gap:6px 14px;align-items:center;padding:12px 18px;border-bottom:1px solid var(--border);background:var(--surface);font-size:14px}
.oa-dt{width:100%;border-collapse:collapse;font-size:13.5px}
.oa-dt th{text-align:left;font-size:12px;font-weight:600;color:var(--muted);padding:9px 12px 9px 18px;border-bottom:1px solid var(--border)}
.oa-dt td{padding:10px 12px 10px 18px;border-bottom:1px solid var(--border);vertical-align:top;line-height:1.4}
.oa-dt td small{display:block;font:500 11px var(--oa-mono);color:var(--muted)}
.oa-dt tr:last-child td{border-bottom:0}
.oa-chg{display:inline-block;font-size:12px;font-weight:600;padding:1px 8px;border-radius:var(--radius);white-space:nowrap;border:1px solid var(--border);background:var(--bg)}
.oa-chg.w{border-color:color-mix(in oklab,var(--warning) 55%,var(--border));background:color-mix(in oklab,var(--warning) 12%,var(--bg))}
.oa-dfoot{padding:11px 18px;border-top:1px solid var(--border);font-size:13px;color:var(--muted)}
/* pricing */
.oa-price{display:grid;grid-template-columns:minmax(0,.86fr) minmax(0,1.14fr);gap:28px;align-items:stretch}
.oa-big{padding:28px;display:grid;gap:12px;align-content:start}
.oa-big .num{font-size:60px;line-height:1;letter-spacing:-.02em}
.oa-big ul{list-style:none;display:grid;gap:7px;font-size:14px}
.oa-big li{display:flex;gap:9px;align-items:flex-start}
.oa-pr{display:grid;gap:16px;align-content:start}
.oa-tiers{width:100%;border-collapse:collapse;font-size:14px}
.oa-tiers th,.oa-tiers td{padding:8px 0;border-bottom:1px solid var(--border);text-align:left}
.oa-tiers th{font-size:12px;color:var(--muted);font-weight:600}
.oa-tiers td:last-child,.oa-tiers th:last-child{text-align:right}
.oa-tiers .num{font-size:15px}
.oa-est{display:flex;flex-wrap:wrap;justify-content:space-between;gap:6px 16px;align-items:center;padding:12px 16px;border:1px dashed color-mix(in oklab,var(--primary) 50%,var(--border));border-radius:var(--radius);font-size:14px}
.oa-est .num{font-size:20px}
.oa-defs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px 28px;font-size:13.5px}
.oa-defs h3{font:600 13px var(--font-b);margin-bottom:4px}
.oa-defs p{color:var(--muted);line-height:1.45}
/* faq */
.oa-fq{display:grid;grid-template-columns:minmax(0,.62fr) minmax(0,1.38fr);gap:44px;align-items:start}
.oa-fq>div:first-child{display:grid;gap:12px}
.oa-faq{columns:2;column-gap:36px}
.oa-faq details{break-inside:avoid;border-top:1px solid var(--border);padding:11px 0}
.oa-faq summary{list-style:none;cursor:pointer;font-weight:600;display:flex;justify-content:space-between;gap:12px;align-items:center;font-size:14.5px}
.oa-faq summary::-webkit-details-marker{display:none}
.oa-faq p{margin-top:5px;font-size:13.5px;color:var(--muted);line-height:1.5}
/* try it */
.oa-try{display:grid;grid-template-columns:minmax(0,1.14fr) minmax(0,.86fr);gap:0;padding:0;overflow:hidden}
.oa-tform{padding:26px 30px;display:grid;gap:12px;min-width:0}
.oa-tform .oa-g3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
.oa-tback{min-width:0;padding:26px 30px;border-left:1px solid var(--border);background:var(--surface);display:grid;gap:12px;align-content:start}
.oa-tback ol{list-style:none;display:grid;gap:10px;font-size:14px}
.oa-tback li{display:grid;grid-template-columns:24px minmax(0,1fr);gap:9px}
.oa-tback li>span{width:24px;height:24px;border-radius:50%;display:grid;place-items:center;font:600 11px var(--oa-mono);background:var(--bg);border:1px solid var(--border)}
@media (max-width:1024px){
  .oa-hero{grid-template-columns:minmax(0,1fr)}
  .oa-hl{padding:48px 48px 36px}
  .oa-log{border-left:0;border-top:1px solid var(--border);padding:26px 48px}
  .oa-ggrid{grid-template-columns:minmax(0,1fr)}
  .oa-gside{border-left:0;border-top:1px solid var(--border);grid-template-columns:repeat(2,minmax(0,1fr))}
  .oa-two{gap:36px}
  .oa-week{grid-template-columns:repeat(3,minmax(0,1fr))}
  .oa-day{min-height:0}
  .oa-rep,.oa-fq,.oa-price{grid-template-columns:minmax(0,1fr)}
  .oa-faq{columns:1}
  .oa-jobs{gap:0 32px}
  .oa-try{grid-template-columns:minmax(0,1fr)}
  .oa-tback{border-left:0;border-top:1px solid var(--border)}
  .oa-job{grid-template-columns:minmax(0,1fr)}
}
@media (max-width:760px){
  .oa>.sk-sec{padding:30px 0}
  .oa~.sk-foot .sk-foot-grid>:nth-child(3){display:none}
  .oa~.sk-foot{padding:40px 0 28px}
  .oa~.sk-foot .sk-foot-base{margin-top:28px}
  .oa .sk-head{gap:8px;margin-bottom:16px}
  .oa .sk-head>p{display:none}
  .oa-hl{padding:26px 20px 22px;gap:14px}
  .oa-hl h1{font-size:calc(36px * var(--hs))}
  .oa-promise,.oa-step .oa-code{display:none}
  .oa-log{padding:18px 20px;gap:11px}
  .oa-step{padding-bottom:9px}
  .oa-jobs{gap:14px!important}
  .oa-jobs>div{flex-basis:84%}
  .oa-jobs .oa-job:nth-of-type(n+5){display:none}
  .oa-job{grid-template-columns:minmax(0,1fr);padding:8px 0}
  .oa-job small i{display:inline;margin-right:5px}
  .oa-gbar{padding:11px 14px}
  .oa-gmat{padding:0 14px 4px}
  .oa-mat thead{display:none}
  .oa-mat,.oa-mat tbody{display:block}
  .oa-mat tr{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:2px 10px;padding:9px 0;border-bottom:1px solid var(--border)}
  .oa-mat tr:nth-child(n+5){display:none}
  .oa-mat tr:nth-child(4){border-bottom:0}
  .oa-mat td{display:block;padding:0;border:0;font-size:13px}
  .oa-mat td:first-child{grid-column:1/-1;font-size:14px;margin-bottom:2px}
  .oa-mat td:nth-child(2){display:none}
  .oa-mat td[data-l]::before{content:attr(data-l);display:block;font-size:11px;color:var(--muted)}
  .oa-gside{grid-template-columns:minmax(0,1fr);padding:12px 14px;gap:14px}
  .oa-lim{gap:8px}.oa-lim div:nth-child(4){display:none}
  .oa-audit{padding:11px 14px}
  .oa-audit h3 span{display:none}
  .oa-aud{grid-template-columns:minmax(0,1fr) auto;line-height:1.5;gap:0 10px}
  .oa-aud>:nth-child(4n+3){grid-column:1/-1;margin-bottom:5px}
  .oa-aud>:nth-child(4n+4),.oa-aud>:nth-child(n+9){display:none}
  .oa-two{grid-template-columns:minmax(0,1fr);gap:32px}
  .oa-ways,.oa-when,#handoff>p{display:none}
  .oa-plug{padding:8px 10px;font-size:13px;gap:8px}
  .oa-plug:nth-child(n+7):not(.more){display:none}
  .oa-note dl{grid-template-columns:minmax(0,1fr);gap:0;padding:12px 14px}
  .oa-note dd{margin-bottom:6px}
  .oa-note footer{padding:0 14px 12px}
  .oa-week{gap:12px!important}
  .oa-day{min-height:0;flex-basis:68%!important}
  .oa-rep{gap:18px}
  .oa-rep .oa-g{display:none}
  .oa-dt tr:nth-child(n+4){display:none}
  .oa-dt th:nth-child(2),.oa-dt td:nth-child(2){display:none}
  .oa-dt th,.oa-dt td{padding-left:14px;padding-right:8px}
  .oa-dbar,.oa-dfoot{padding-inline:14px}
  .oa-dfoot{display:none}
  .oa-price{gap:18px}
  .oa-big{padding:20px;gap:9px}
  .oa-big .num{font-size:48px}
  .oa-big ul{display:none}
  .oa-defs{grid-template-columns:minmax(0,1fr);gap:10px}
  .oa-defs>div:nth-child(n+3){display:none}
  .oa-fq{gap:14px}
  .oa-faq details:nth-child(n+5){display:none}
  .oa-faq p{font-size:13px}
  .oa-try{grid-template-columns:minmax(0,1fr)}
  .oa-tform{padding:20px}
  .oa-tform .oa-g3{grid-template-columns:minmax(0,1fr)}
  .oa-where{display:none}
  .oa-tback{padding:18px 20px;border-left:0;border-top:1px solid var(--border)}
  .oa-tback ol,.oa-tback h3,.oa-tback .oa-tk{display:none}
}
</style>`;

const STEPS = [
  ["", "check", "Read the ticket", "09:14:02", "0.6s", "helpdesk.read", "Damaged on arrival, wants a refund. Photo attached, no order number given."],
  ["", "check", "Look up the order", "09:14:02", "1.2s", "orders.find", "Found by email. Order 88214, one kettle, $64.00, delivered 3 days ago."],
  ["", "check", "Draft the refund", "09:14:03", "1.4s", "policy.search, payments.draft", "Damaged items are refunded in full with no return. Draft for $64.00, no money moved."],
  ["wait", "clock", "Ask a person to approve", "09:14:05", "2m 41s", "approval.request", "Refunds over $25 need sign-off, so the run stops here and waits."],
  ["", "check", "Send the reply", "09:16:46", "0.9s", "payments.refund, helpdesk.reply", "Refund issued, reply sent, ticket closed."],
];
const JOBS = [
  ["Customer support", [
    ["Where is my order", "Checks tracking and replies with a real date.", "A parcel looks lost"],
    ["Refunds and returns", "Applies your returns policy and drafts the refund.", "The amount is over your limit"],
    ["Address and plan changes", "Updates the record and confirms with the customer.", "The order has already shipped"],
    ["Billing questions", "Finds invoices and explains a charge.", "Someone disputes a charge"],
  ]],
  ["Back office", [
    ["Invoice matching", "Matches supplier invoices to purchase orders.", "Totals differ from the order"],
    ["Supplier chasers", "Sends polite follow-ups on late deliveries.", "A supplier replies with a problem"],
    ["Record clean-up", "Finds duplicate customers and proposes merges.", "Two records have different owners"],
    ["Returns reconciliation", "Checks returned stock against refunds paid.", "A count does not add up"],
  ]],
];
const yes = (t) => `<span class="oa-p yes"><span>${ic("check", 14)}</span>${t}</span>`;
const no = (t = "No") => `<span class="oa-p no">${ic("minus", 14)}${t}</span>`;
const ask = (t) => `<span class="oa-p ask"><span>${ic("lock", 14)}</span>${t}</span>`;
const MATRIX = [
  ["Your helpdesk", yes("Tickets, history"), yes("Replies, tags"), no("None")],
  ["Your orders database", yes("Orders, tracking"), no(), no("None")],
  ["Your payments system", yes("Charges"), yes("Refund drafts"), ask("Over $25")],
  ["Your shipping system", yes("Parcels"), yes("Replacement labels"), ask("Always")],
  ["Your customer records", yes("Contact, plan"), yes("Address, notes"), ask("After dispatch")],
  ["Your knowledge base", yes("All articles"), no(), no("None")],
];
const LIMITS = [["Refund on one task", "$64 of $150", 43], ["Refunds today", "$412 of $1,000", 41], ["Actions in one run", "7 of 12", 58], ["Replies to one customer an hour", "1 of 3", 33]];
const AUDIT = [
  ["09:16:47", "Agent", "Sent reply, closed ticket 30817", "run 4182"],
  ["09:16:46", "Renata Oyelaran", "Approved refund of $64.00", "run 4182"],
  ["Mon 11:02", "Tobias Brandvold", "Raised refunds today from $800 to $1,000", "policy v13"],
];
const PLUGS = [["inbox", "Your helpdesk"], ["cart", "Your orders database"], ["card", "Your payments system"], ["send", "Your shipping system"], ["users", "Your customer records"], ["doc", "Your knowledge base"], ["mail", "Your shared inbox"], ["chat", "Your team chat"]];
const WEEK = [
  ["Day 1", "Connect, read-only", "Link your tools with read access. Nothing can be changed yet.", "can read"],
  ["Day 2", "Load your rules", "Add your policies and saved replies, and set the first limits.", "can read"],
  ["Day 3", "Replay old tickets", "It works through last month’s closed tickets. Your team marks each run.", "can draft"],
  ["Days 4 to 5", "Shadow live tickets", "It drafts on real tickets and your team decides what gets sent.", "can suggest"],
  ["Days 6 to 7", "One queue live", "One simple queue goes live, with every action behind approval.", "can act, with approval"],
];
const REPLAY = [
  ["Run 4182", "Kettle lid, refund $64", "Stopped for approval", "Stopped for approval", "Same", ""],
  ["Run 4097", "Mug set, refund $32", "Stopped for approval", "Refunded without asking", "Looser", "w"],
  ["Run 4110", "Late parcel, refund $38", "Stopped for approval", "Refunded without asking", "Looser", "w"],
  ["Run 4151", "Damaged lamp, reply", "Offered a replacement", "Offered a refund first", "Reply changed", "w"],
  ["Run 4033", "Address after dispatch", "Stopped for approval", "Stopped for approval", "Same", ""],
];
const FAQ = [
  ["What happens when it isn’t sure?", "It stops and hands the ticket to your team with a note on what it found and what it would do next. New queues start with every action behind approval."],
  ["What if a customer tries to talk it into something?", "Text in a ticket is treated as information, never as an instruction. Permissions sit outside the model, so a persuasive message can’t unlock a tool or raise a limit."],
  ["Which AI models do you use?", "Each step goes to a model that suits it, and the run log records which model and version did the work. You can pin a version per queue."],
  ["Is our data used to train anything?", "No. Tickets and run logs stay in your workspace, and you choose how long they are kept."],
  ["How do we switch it off?", "Anyone with admin rights can pause a queue or the whole workspace with one button. Open runs hand back to your team."],
  ["Who is responsible if it gets one wrong?", "You set what it may do, and everything it did is on the record. If a run broke your policy, we credit the task and help you trace why."],
  ["Does it replace our support team?", "It takes the repeat work. People keep the judgement calls, the upset customers and everything it isn’t allowed to do alone."],
];

const render = (p, st) => K.page(st, `${K.nav(p, ["The run", "Guardrails", "Replay", "Pricing"], "Try it", "Sign in")}
<main class="oa">
<section class="oa-hero" id="top">
  <div class="oa-hl">
    <span class="sk-eyebrow">AI agents for support and back-office work</span>
    <h1 class="sk-h1">It does the work. You keep the last word.</h1>
    <p class="sk-lede">${p.name} agents take on tickets and routine tasks inside the tools you already use. Every run is written down step by step, and anything that moves money stops for a person.</p>
    <div class="sk-row"><a class="btn primary sk-btn-lg" href="#try-it">Try it on a ticket</a><a class="btn sk-btn-lg" href="#guardrails">See the guardrails</a></div>
    <ul class="oa-promise">${["Read-only until you say otherwise", "Live on one queue in the first week", "Pay per resolved task, not per seat"].map((t) => `<li><span class="oa-tick">${ic("check", 16)}</span>${t}</li>`).join("")}</ul>
  </div>
  <div class="oa-log" id="the-run" aria-label="Example run log">
    <div class="oa-rhead"><b>run 4182 · ticket 30817</b><span class="badge" style="color:var(--success)">Resolved</span></div>
    <div class="oa-tk"><span class="oa-code">Dana Whitlock, via your helpdesk</span>“The lid on my kettle arrived cracked. Photo attached. Can I get my money back?”</div>
    <ol class="oa-steps">${STEPS.map(([c, i, t, at, d, tool, txt]) => `<li class="oa-step ${c}"><span class="oa-dot">${ic(i, 14)}</span><b>${t}</b><span class="oa-dur">${d}</span><span class="oa-code">${at} ${tool}</span><p>${txt}</p>${c === "wait" ? `<div class="oa-appr"><span>Renata Oyelaran approved from the team queue</span><span class="oa-code">$64.00</span></div>` : ""}</li>`).join("")}</ol>
    <div class="oa-sum"><span><b>5</b> steps</span><span><b>7</b> tool calls</span><span><b>1</b> approval</span><span><b>2m 45s</b> total</span></div>
  </div>
</section>

<section class="sk-sec" id="use-cases"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">What it takes on</span><h2 class="sk-h2">Repeat work, with a clear place to stop</h2></div></div>
  <div class="oa-jobs sk-rail">${JOBS.map(([h, rows]) => `<div><h3>${h}</h3>${rows.map(([t, d, s]) => `<div class="oa-job"><div><b>${t}</b><p>${d}</p></div><small><i>stops when</i>${s}</small></div>`).join("")}</div>`).join("")}</div>
</div></section>

<section class="sk-sec sk-alt" id="guardrails"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">Guardrails</span><h2 class="sk-h2">Permissions live outside the model</h2></div><p class="muted" style="max-width:420px">The agent can only reach the tools a policy gives it. Rules are checked on every call, however the request is worded.</p></div>
  <div class="card oa-guard">
    <div class="oa-gbar"><b>Support queue policy</b><span class="oa-code">v13, published Monday by Tobias Brandvold</span></div>
    <div class="oa-ggrid">
      <div class="oa-gmat"><table class="oa-mat"><thead><tr><th>Tool</th><th>Can read</th><th>Can write</th><th>Needs approval</th></tr></thead><tbody>${MATRIX.map(([t, r, w, a]) => `<tr><td>${t}</td><td data-l="Read">${r}</td><td data-l="Write">${w}</td><td data-l="Approval">${a}</td></tr>`).join("")}</tbody></table></div>
      <div class="oa-gside">
        <div><h3>Spend and action limits, run 4182</h3><div class="oa-lim">${LIMITS.map(([t, v, w]) => `<div><span>${t}<b>${v}</b></span><i style="--w:${w}%"></i></div>`).join("")}</div></div>
        <div><h3>Always needs a person</h3><div class="oa-ask">${["Closing an account", "Messages to many customers", "Changing bank details", "Any mention of legal action"].map((t) => `<span>${t}</span>`).join("")}</div></div>
      </div>
    </div>
    <div class="oa-audit"><h3>Audit trail <span>Every call, every approval, every policy change. Export any time.</span></h3><div class="oa-aud">${AUDIT.map(([a, b, c, d]) => `<span>${a}</span><b>${b}</b><span>${c}</span><span>${d}</span>`).join("")}</div></div>
  </div>
</div></section>

<section class="sk-sec" id="connect"><div class="sk-wrap oa-two">
  <div>
    <span class="sk-eyebrow">Connecting tools</span><h2 class="sk-h2">It works where your team works</h2>
    <p>No new inbox and no migration. The agent signs in to your tools with its own account, so its work shows up beside everyone else’s.</p>
    <div class="oa-plugs">${PLUGS.map(([i, t]) => `<div class="oa-plug"><span>${ic(i, 17)}</span>${t}</div>`).join("")}<div class="oa-plug more" style="grid-column:1/-1"><span>${ic("link", 17)}</span>Anything else with an API or a webhook</div></div>
    <ul class="oa-ways">${["Its own login, scoped to what the policy allows", "Keys you can revoke from your side at any time"].map((t) => `<li><span class="oa-tick">${ic("key", 15)}</span>${t}</li>`).join("")}</ul>
  </div>
  <div id="handoff">
    <span class="sk-eyebrow">Human handoff</span><h2 class="sk-h2">When it stops, it hands over properly</h2>
    <p>Your team never starts from a blank ticket. The customer is told a person has it, and the note arrives with the work already done.</p>
    <div class="oa-when">${["Customer asks for a person", "Not covered by policy", "Upset customer", "Low confidence"].map((t) => `<span>${t}</span>`).join("")}</div>
    <div class="card oa-note">
      <header><b>Handoff, ticket 30902</b><span class="oa-code">run 4190</span></header>
      <dl><dt>why i stopped</dt><dd>The customer mentions going to their bank about this charge.</dd>
      <dt>what i found</dt><dd>Order 88560, two parcels. One delivered, one still in transit.</dd>
      <dt>what i did</dt><dd>Nothing sent except “a colleague will reply today”.</dd>
      <dt>i would suggest</dt><dd>Confirm the second parcel’s date, then offer to refund it.</dd></dl>
      <footer><a class="btn primary" href="#">Take ticket</a><a class="btn" href="#">Send back to agent</a></footer>
    </div>
  </div>
</div></section>

<section class="sk-sec sk-alt" id="first-week"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">The first week</span><h2 class="sk-h2">Trust goes up one step at a time</h2></div><p class="muted" style="max-width:380px">You stay on each step until you are happy with the runs. Most teams loosen approvals over the following weeks.</p></div>
  <ol class="oa-week sk-rail">${WEEK.map(([d, t, x, c], i) => `<li class="oa-day" style="--n:${i}"><span class="oa-code">${d}</span><b>${t}</b><p>${x}</p><span class="oa-code">${c}</span></li>`).join("")}</ol>
</div></section>

<section class="sk-sec" id="replay"><div class="sk-wrap oa-rep">
  <div>
    <span class="sk-eyebrow">Evaluation and replay</span><h2 class="sk-h2">Test a change on last month first</h2>
    <p>Open any past run, step through it, and re-run it from any step. Before a policy goes live, replay real tickets against it and read what would have changed. Replays never touch your live tools.</p>
    <div class="oa-scrub" aria-label="Replay at step 3 of 5"><span class="on"></span><span class="on"></span><span class="on"></span><span></span><span></span></div>
    <span class="oa-code">run 4182, step 3 of 5: draft the refund</span>
    <p class="oa-g" style="font-size:14px">Your team marks runs as good, wrong or needs a rewrite. Wrong ones join a test set that every future change has to pass.</p>
  </div>
  <div class="card oa-diff">
    <div class="oa-dbar"><b>Draft v14: refunds without approval up to $40</b><span class="oa-code">200 past runs replayed</span></div>
    <table class="oa-dt"><thead><tr><th>Run</th><th>Live, v13</th><th>Draft, v14</th><th>Result</th></tr></thead><tbody>${REPLAY.map(([r, t, a, b, c, w]) => `<tr><td>${t}<small>${r}</small></td><td>${a}</td><td>${b}</td><td><span class="oa-chg ${w}">${c}</span></td></tr>`).join("")}</tbody></table>
    <div class="oa-dfoot">Showing 5 of 200. Filter by what changed, then publish, edit or throw the draft away.</div>
  </div>
</div></section>

<section class="sk-sec sk-alt" id="pricing"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">Pricing</span><h2 class="sk-h2">You pay when a task gets finished</h2></div></div>
  <div class="oa-price">
    <div class="card oa-big"><div class="muted" style="font-weight:600;font-size:14px">From</div><div class="num">$1.20</div><p class="muted">per resolved task, with no seat fees and no setup fee.</p>
      <ul>${["Unlimited team seats and approvers", "Every tool connection included", "Full run logs and replay", "First 100 resolved tasks free"].map((t) => `<li><span class="oa-tick">${ic("check", 16)}</span>${t}</li>`).join("")}</ul>
      <a class="btn primary block sk-btn-lg" style="margin-top:6px" href="#try-it">Try it on a ticket</a></div>
    <div class="oa-pr">
      <table class="oa-tiers"><thead><tr><th>Resolved tasks a month</th><th>Price per task</th></tr></thead><tbody>${[["First 1,000", "$1.20"], ["1,001 to 5,000", "$0.95"], ["Over 5,000", "$0.75"]].map(([a, b]) => `<tr><td>${a}</td><td class="num">${b}</td></tr>`).join("")}</tbody></table>
      <div class="oa-est"><span>Example: 1,500 resolved tasks in a month</span><span class="num">$1,675</span></div>
      <div class="oa-defs">
        <div><h3>What counts as resolved</h3><p>The task is finished and the ticket stays closed for 72 hours. If it reopens, the charge comes off.</p></div>
        <div><h3>What you never pay for</h3><p>Handoffs to your team, failed runs, shadow drafts and replays.</p></div>
        <div><h3>Monthly cap</h3><p>Set a ceiling. When it is reached, new tickets go straight to your team.</p></div>
        <div><h3>Leaving</h3><p>Monthly billing, cancel any time, and take your run logs with you.</p></div>
      </div>
    </div>
  </div>
</div></section>

<section class="sk-sec" id="faq"><div class="sk-wrap oa-fq">
  <div><span class="sk-eyebrow">FAQ</span><h2 class="sk-h2">What teams ask before switching it on</h2></div>
  <div class="oa-faq">${FAQ.map(([q, a], i) => `<details ${i < 3 ? "open" : ""}><summary>${q}${ic("chevdown", 15)}</summary><p>${a}</p></details>`).join("")}</div>
</div></section>

<section class="sk-sec sk-alt" id="try-it"><div class="sk-wrap"><div class="card oa-try">
  <form class="oa-tform" aria-label="Try it on a ticket">
    <span class="sk-eyebrow">Try it</span><h2 class="sk-h2">Send us one real ticket</h2>
    <div class="sk-field"><label for="oa-tk">Paste a ticket, with personal details removed</label><textarea class="sk-input" id="oa-tk" rows="3">My order came with the wrong size. I need the medium by Friday for a wedding. Can you swap it or do I have to send it back first?</textarea></div>
    <div class="oa-g3"><div class="sk-field"><label for="oa-em">Work email</label><input class="sk-input" id="oa-em" type="email" value="renata@shop.example"></div>
    <div class="sk-field"><label for="oa-vol">Tickets a month</label><select class="sk-input" id="oa-vol"><option>Under 500</option><option selected>500 to 2,000</option><option>2,000 to 10,000</option><option>Over 10,000</option></select></div>
    <div class="sk-field oa-where"><label for="oa-where">Tickets live in</label><select class="sk-input" id="oa-where"><option selected>A helpdesk</option><option>A shared inbox</option><option>A chat widget</option><option>Something we built</option></select></div></div>
    <button class="btn primary sk-btn-lg" type="button" style="justify-self:start">Run this ticket</button>
  </form>
  <div class="oa-tback"><h3 class="sk-h3">What comes back</h3>
    <ol>${["A full run log, like the one at the top of this page", "The reply it would have sent, and where it would have stopped", "A short list of what we would need to connect"].map((t, i) => `<li><span>${i + 1}</span>${t}</li>`).join("")}</ol>
    <div class="oa-tk"><span class="oa-code">for the ticket on the left</span>It would check stock, offer a swap for the medium, and stop before printing a return label.</div>
    <p class="muted" style="font-size:13.5px">It runs in a sandbox with nothing connected, so nothing reaches your customer. We reply within one working day.</p></div>
</div></div></section>
</main>
${K.footer(p, "AI agents for support and back-office tasks, with every step on the record.", [["Product", ["Run log", "Guardrails", "Replay", "Pricing"]], ["Resources", ["Setup guide", "Policy examples", "Security overview", "Changelog"]], ["Contact", ["41 Tiller Yard", "(555) 014-6620", "hello@oarlock.example"]]], `Fictional company created for this template. Names, prices and run data are sample content.`)}`, CSS);

module.exports = {
  "ai-agent-website": K.def("agentsite", "AI agent website",
    "an ai agent product page built around one visible run: navigation with try-it button, a split hero whose right half is a coded run log of one refund ticket with steps, tools, durations and a human approval, a jobs index for support and back-office work with where each one stops, a guardrails panel with a tool permission matrix, spend and action limits, an always-needs-a-person list and an audit trail, connecting your tools beside a human handoff note, a five-step first-week staircase, evaluation by replaying past runs against a draft policy, pricing per resolved task with volume tiers and what counts as resolved, faq, a try-it form with a pasted ticket, footer",
    ["navigation-header", "split-hero", "agent-log", "activity-timeline", "use-cases", "permissions-matrix", "spend-limits", "audit-log", "integrations", "handoff-note", "setup-timeline", "replay-diff", "usage-pricing", "faq", "demo-form", "footer", "ai-agent"], render),
};
