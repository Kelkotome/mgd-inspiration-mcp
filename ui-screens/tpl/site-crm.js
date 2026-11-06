/* CRM landing page template (Pipeloom, a fictional sales CRM for small B2B teams). A single-goal page: every button is the same
   14-day trial. Nav, centred hero with an email form above a coded pipeline board, spreadsheet import with a CSV column-mapping
   mock and an afternoon timeline, a sales week told through follow-up reminders, shared inbox with call notes, forecast and an
   automation rule builder, spreadsheet vs CRM comparison beside migration help, per-seat pricing with a seat stepper, a customer
   quote, FAQ, final CTA, footer. No real products are named. Product UI is coded HTML drawn with tokens only. */
const { ic, esc } = require("../lib");
const K = require("../sitekit");

const CSS = `<style>
.cr>.sk-sec{padding:60px 0}
.cr>.sk-sec.sk-tight{padding:44px 0}
.cr .sk-h2{font-size:calc(36px * var(--hs))}
.cr .sk-head{margin-bottom:26px}
.cr .sk-head>div:first-child{max-width:720px;gap:8px}
.cr-hero{padding-top:56px;text-align:center;display:grid;grid-template-columns:minmax(0,1fr);justify-items:center;gap:16px}
.cr-hero h1{font-size:calc(58px * var(--hs));line-height:1.04;max-width:880px}
.cr-hero .sk-lede{max-width:620px}
.cr-sign{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;width:100%;max-width:520px;margin-top:6px;text-align:left}
.cr-sign .sk-input{height:48px}
.cr-micro{font-size:13.5px;color:var(--muted)}
.cr-bwrap{width:100%;min-width:0;margin-top:26px;text-align:left}
/* board */
.cr-board{padding:0;overflow:hidden;box-shadow:var(--shadow-lg)}
.cr-btop{display:flex;align-items:center;gap:12px;padding:12px 18px;border-bottom:1px solid var(--border);font-size:13px}
.cr-btop .cr-sum{margin-left:auto;color:var(--muted);white-space:nowrap}
.cr-fil{height:28px;padding:0 10px;border:1px solid var(--border);border-radius:var(--radius);display:inline-flex;align-items:center;gap:6px;font-weight:500;font-size:12.5px;background:var(--bg);white-space:nowrap}
.cr-cols{display:grid;grid-template-columns:repeat(5,minmax(200px,1fr));gap:10px;padding:14px;background:color-mix(in oklab,var(--primary) 5%,var(--bg));overflow-x:auto}
.cr-col{display:grid;gap:8px;align-content:start;min-width:0}
.cr-colh{display:flex;justify-content:space-between;gap:8px;padding:2px 4px;font-size:12.5px;font-weight:600}
.cr-colh span:last-child{color:var(--muted);font-weight:500}
.cr-prog{height:3px;border-radius:2px;background:color-mix(in oklab,var(--primary) 18%,var(--border));overflow:hidden}
.cr-prog i{display:block;height:100%;background:var(--primary)}
.cr-deal{padding:10px 11px;border:1px solid var(--border);border-radius:var(--radius);background:var(--surface);display:grid;gap:3px;font-size:12.5px;line-height:1.35}
.cr-deal.late{border-color:var(--danger)}
.cr-deal.won{border-color:color-mix(in oklab,var(--success) 50%,var(--border))}
.cr-deal b{font-size:13.5px}
.cr-deal .num{font-size:14.5px}
.cr-deal>div{display:flex;justify-content:space-between;align-items:center;gap:6px}
.cr-deal .avatar{width:22px;height:22px;font-size:9.5px;flex:0 0 auto}
.cr-next{color:var(--muted);display:inline-flex;align-items:center;gap:5px;min-width:0}
.cr-late{color:var(--danger);font-weight:600}
.cr-ok{color:var(--success);font-weight:600}
/* import */
.cr-imp{display:grid;grid-template-columns:minmax(0,.72fr) minmax(0,1.28fr);gap:52px;align-items:center}
.cr-day{list-style:none;display:grid;margin-top:16px;border-left:2px solid var(--border)}
.cr-day li{display:grid;grid-template-columns:62px minmax(0,1fr);gap:10px;padding:0 0 13px 16px;position:relative;font-size:14px;line-height:1.4}
.cr-day li::before{content:"";position:absolute;left:-6px;top:5px;width:10px;height:10px;border-radius:50%;background:var(--primary)}
.cr-day li:last-child{padding-bottom:0}
.cr-day time{font-size:12.5px;color:var(--muted);font-weight:600;padding-top:1px}
.cr-map{padding:0;overflow:hidden}
.cr-steps{display:flex;gap:18px;padding:12px 18px;border-bottom:1px solid var(--border);font-size:13px;color:var(--muted);flex-wrap:wrap}
.cr-steps span{display:inline-flex;align-items:center;gap:6px;white-space:nowrap}
.cr-steps i{font-style:normal;width:20px;height:20px;border-radius:50%;display:grid;place-items:center;font-size:11px;font-weight:700;border:1px solid var(--border)}
.cr-steps .on{color:var(--text);font-weight:600}
.cr-steps .on i{background:var(--primary);border-color:var(--primary);color:var(--on-primary)}
.cr-file{display:flex;align-items:center;gap:8px;padding:10px 18px;font-size:13px;background:color-mix(in oklab,var(--primary) 5%,var(--bg));border-bottom:1px solid var(--border)}
.cr-file span:last-child{margin-left:auto;color:var(--muted);white-space:nowrap}
.cr-mrow{display:grid;grid-template-columns:minmax(0,.8fr) minmax(0,1.1fr) 18px minmax(0,1fr) 108px;gap:10px;align-items:center;padding:7px 18px;border-bottom:1px solid var(--border);font-size:13px}
.cr-mrow.h{font:600 11.5px var(--font-b);letter-spacing:.05em;text-transform:uppercase;color:var(--muted)}
.cr-mrow em{font-style:normal;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cr-mrow select{height:32px;width:100%;min-width:0;border:1px solid var(--border);border-radius:var(--radius);background:var(--bg);color:var(--text);font:inherit;padding:0 6px}
.cr-mrow.warn select{border-color:var(--warning)}
.cr-st{display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:600;color:var(--success);white-space:nowrap}
.cr-st.w{color:color-mix(in oklab,var(--warning) 70%,var(--text))}
.cr-st.s{color:var(--muted)}
.cr-mfoot{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:12px 18px;font-size:13px}
/* week */
.cr-week{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:30px 36px}
.cr-w{display:grid;gap:7px;grid-template-rows:auto auto auto 1fr;grid-column:span 6}
.cr-w.n{grid-column:span 5}.cr-w.b{grid-column:span 7}
.cr-w small{font-size:12.5px;font-weight:600;color:color-mix(in oklab,var(--primary) 82%,var(--text))}
.cr-w h3{font-size:calc(21px * var(--hs))}
.cr-w>p{font-size:14px;color:var(--muted);line-height:1.5}
.cr-pane{display:grid;align-content:space-between;margin-top:6px;border:1px solid var(--border);border-radius:var(--radius-lg);background:var(--bg);overflow:hidden;font-size:13px}
.cr-task{display:grid;grid-template-columns:18px minmax(0,1fr) auto;gap:10px;align-items:center;padding:10px 14px;border-bottom:1px solid var(--border)}
.cr-task:last-child{border-bottom:0}
.cr-task>i{width:16px;height:16px;border:1.5px solid var(--muted);border-radius:var(--radius-sm)}
.cr-task span{color:var(--muted);font-size:12.5px;white-space:nowrap}
.cr-task span.cr-late{color:var(--danger)}
.cr-task div span{display:block;white-space:normal}
.cr-gap{padding:9px 14px;background:color-mix(in oklab,var(--warning) 13%,var(--bg));color:color-mix(in oklab,var(--warning) 45%,var(--text));font-weight:600;font-size:12.5px;display:flex;gap:8px;align-items:center}
.cr-rep{display:flex;align-items:center;gap:10px;padding:10px 14px;border-top:1px solid var(--border);font-size:12.5px;color:var(--muted)}
.cr-rep>span:first-child{flex:1;height:32px;display:flex;align-items:center;padding:0 10px;border:1px solid var(--border);border-radius:var(--radius);background:var(--surface);white-space:nowrap;overflow:hidden}
.cr-rep .btn{height:32px}
.cr-th{padding:11px 14px;display:grid;grid-template-columns:30px minmax(0,1fr);gap:10px;border-bottom:1px solid var(--border);line-height:1.45}
.cr-th .avatar{width:30px;height:30px}
.cr-th p{font-size:13px}
.cr-th span{font-size:12px;color:var(--muted)}
.cr-th.note{background:color-mix(in oklab,var(--warning) 9%,var(--bg))}
.cr-th.call .avatar{background:color-mix(in oklab,var(--success) 20%,var(--bg));color:color-mix(in oklab,var(--success) 70%,var(--text))}
.cr-fc{padding:14px;display:grid;gap:11px}
.cr-fr{display:grid;grid-template-columns:38px minmax(0,1fr) 70px;gap:10px;align-items:center;font-size:13px}
.cr-fr b{font-weight:600}
.cr-track{position:relative;height:22px;display:flex;gap:2px;border-radius:var(--radius-sm);background:color-mix(in oklab,var(--border) 45%,transparent)}
.cr-track i{display:block;height:100%}
.cr-track .a{background:var(--primary)}
.cr-track .b{background:color-mix(in oklab,var(--primary) 58%,var(--bg))}
.cr-track .c{background:color-mix(in oklab,var(--primary) 24%,var(--bg))}
.cr-track u{position:absolute;top:-3px;bottom:-3px;width:2px;background:var(--text)}
.cr-fr .num{font-size:13.5px;text-align:right}
.cr-lg{display:flex;flex-wrap:wrap;gap:6px 16px;padding:9px 14px;border-top:1px solid var(--border);font-size:12.5px;color:var(--muted)}
.cr-lg span{display:inline-flex;align-items:center;gap:6px}
.cr-lg i{width:10px;height:10px;border-radius:2px}
.cr-rule{padding:14px;display:grid;gap:8px}
.cr-rl{display:grid;grid-template-columns:44px minmax(0,1fr) minmax(0,1fr);gap:7px;align-items:center}
.cr-rl b{font-size:12px}
.cr-rl .cr-v{height:32px;padding:0 9px;border:1px solid var(--border);border-radius:var(--radius);background:var(--surface);display:flex;align-items:center;justify-content:space-between;gap:4px;font-size:12.5px;white-space:nowrap;overflow:hidden}
.cr-rfoot{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:9px 14px;border-top:1px solid var(--border);font-size:12.5px;color:var(--muted)}
.cr-tog{width:32px;height:18px;border-radius:999px;background:var(--success);position:relative;flex:0 0 auto}
.cr-tog::after{content:"";position:absolute;right:2px;top:2px;width:14px;height:14px;border-radius:50%;background:var(--bg)}
/* compare + migration */
.cr-vs{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(0,1fr);gap:44px;align-items:start}
.cr-tbl{width:100%;border-collapse:collapse;font-size:14px}
.cr-tbl th{text-align:left;font:600 13px var(--font-b);padding:0 14px 10px 0;border-bottom:2px solid var(--text)}
.cr-tbl td{padding:10px 14px 10px 0;border-bottom:1px solid var(--border);vertical-align:top;line-height:1.4}
.cr-tbl td:first-child{font-weight:500}
.cr-tbl td:nth-child(2){color:var(--muted)}
.cr-tbl td:last-child{padding-right:0}
.cr-mig{padding:24px;display:grid;gap:10px}
.cr-mig ol{list-style:none;display:grid;gap:9px;font-size:14px;line-height:1.4;margin-top:2px}
.cr-mig li{display:grid;grid-template-columns:22px minmax(0,1fr);gap:8px}
.cr-mig .num{font-size:14px;color:var(--muted)}
/* pricing */
.cr-seat{display:inline-flex;align-items:center;gap:10px;font-size:14px;white-space:nowrap}
.cr-step{display:inline-flex;align-items:center;border:1px solid var(--border);border-radius:var(--radius);background:var(--surface);overflow:hidden}
.cr-step span{width:34px;height:36px;display:grid;place-items:center}
.cr-step b{min-width:34px;text-align:center}
.cr-plans{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));padding:0;overflow:hidden}
.cr-plan{padding:24px;display:grid;gap:10px;align-content:start;border-left:1px solid var(--border)}
.cr-plan:first-child{border-left:0}
.cr-plan.on{background:color-mix(in oklab,var(--primary) 8%,var(--surface))}
.cr-plan h3{font-size:calc(21px * var(--hs));display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.cr-plan .num{font-size:34px}
.cr-plan .num small{font:500 13px var(--font-b);color:var(--muted);letter-spacing:0}
.cr-plan ul{list-style:none;display:grid;gap:6px;font-size:13.5px;line-height:1.4;margin-top:4px}
.cr-plan li{display:grid;grid-template-columns:16px minmax(0,1fr);gap:8px}
.cr-plan li .i{margin-top:3px;color:var(--success)}
.cr-tot{font-size:13px;color:var(--muted)}
.cr-pnote{margin-top:14px;font-size:13.5px;color:var(--muted)}
/* quote + faq */
.cr-q{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:48px;align-items:end}
.cr-q p{font-family:var(--font-h);font-weight:var(--hw);letter-spacing:var(--ls);font-size:calc(29px * var(--hs));line-height:1.2}
.cr-by{font-size:14px;line-height:1.4;white-space:nowrap;display:flex;gap:10px;align-items:center}
.cr-by .avatar{width:38px;height:38px}
.cr-faq{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 44px}
.cr-faq details{border-top:1px solid var(--border);padding:12px 0}
.cr-faq summary{list-style:none;cursor:pointer;font-weight:600;display:flex;justify-content:space-between;gap:12px;align-items:center}
.cr-faq summary::-webkit-details-marker{display:none}
.cr-faq p{margin-top:6px;font-size:14px;color:var(--muted);line-height:1.5}
.cr-end{background:var(--text);color:var(--bg);border-color:var(--text);padding:40px 44px;display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);gap:40px;align-items:center}
.cr-end p{opacity:.78;margin-top:8px}
.cr-end .cr-sign{margin:0}
.cr-end .cr-micro{color:inherit;opacity:.75;margin-top:8px}
@media (max-width:1024px){
  .cr-imp,.cr-vs{grid-template-columns:minmax(0,1fr);gap:32px}
  .cr-w,.cr-w.n,.cr-w.b{grid-column:span 12}
  .cr-q{grid-template-columns:minmax(0,1fr);gap:20px}
  .cr-end{grid-template-columns:minmax(0,1fr);gap:20px}
}
@media (max-width:760px){
  .cr>.sk-sec{padding:42px 0}
  .cr>.sk-sec.sk-tight{padding:32px 0}
  .cr-hero{padding-top:30px;gap:12px}
  .cr-hero h1{font-size:calc(38px * var(--hs))}
  .cr-sign{grid-template-columns:minmax(0,1fr)}
  .cr-sign .btn{width:100%}
  .cr-bwrap{margin-top:14px;margin-inline:-8px;width:auto;justify-self:stretch}
  .cr-btop{padding:10px 12px}
  .cr-btop .cr-fil{display:none}
  .cr-btop b{white-space:nowrap}
  .cr-cols{grid-template-columns:repeat(5,186px);padding:10px}
  .cr-deal:nth-of-type(n+3){display:none}
  .cr-day li{grid-template-columns:54px minmax(0,1fr);font-size:13.5px;padding-bottom:10px}
  .cr-steps{gap:6px 12px;padding:10px 12px;font-size:12.5px}
  .cr-steps span:not(.on) em{display:none}
  .cr-file{padding:9px 12px}
  .cr-mrow{grid-template-columns:minmax(0,.8fr) minmax(0,1.2fr);padding:6px 12px}
  .cr-mrow>em,.cr-mrow>.cr-ar,.cr-mrow>.cr-st{display:none}
  .cr-mrow.warn>.cr-st{display:inline-flex;grid-column:1/-1}
  .cr-mrow:nth-child(n+9){display:none}
  .cr-mfoot{padding:10px 12px}
  .cr-week{gap:30px}
  .cr-rl{grid-template-columns:40px minmax(0,1fr)}
  .cr-rl>.cr-v:nth-child(3){grid-column:2}
  .cr-fr{grid-template-columns:32px minmax(0,1fr) 60px;gap:8px}
  .cr-tbl{font-size:13px}
  .cr-tbl tr:nth-child(n+5){display:none}
  .cr-mig{padding:20px}
  .cr-seat{margin-top:4px}
  .cr-plans{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;gap:12px;margin:0 -20px;padding:0 20px 6px;background:none;border:0!important;box-shadow:none!important;border-radius:0!important;scrollbar-width:none}
  .cr-plan{flex:0 0 84%;scroll-snap-align:start;border:1px solid var(--border);border-radius:var(--radius-lg);background:var(--surface);padding:20px}
  .cr-plan:first-child{border-left:1px solid var(--border)}
  .cr-q p{font-size:calc(22px * var(--hs))}
  .cr-by{white-space:normal}
  .cr-faq{grid-template-columns:minmax(0,1fr)}
  .cr-faq details:nth-child(n+6){display:none}
  .cr-end{padding:26px 22px}
}
</style>`;

const deal = ([n, v, c, nx, who, cls]) => `<article class="cr-deal ${cls || ""}"><b>${n}</b><div><span class="num">${v}</span><span class="avatar">${who}</span></div><span class="muted">${c}</span>${cls === "late" ? `<span class="cr-late">${nx}</span>` : cls === "won" ? `<span class="cr-ok">${nx}</span>` : `<span class="cr-next">${ic("clock", 12)}${nx}</span>`}</article>`;
const STAGES = [
  ["New lead", "6 · $31,400", 20, [["Harlow Freight", "$8,400", "Dee Marchetti", "Intro call Thu", "TR"], ["Tessel Joinery", "$5,200", "Owen Lacy", "Send pricing today", "SA"], ["Ambry Coffee Co-op", "$3,600", "Rosa Kettering", "Reply to enquiry", "LP"]]],
  ["Qualified", "4 · $46,000", 40, [["Ostrey Labels", "$12,000", "Mina Castellan", "Book demo", "SA"], ["Peverell Plumbing", "$9,800", "Jude Amoako", "Confirm budget", "TR"], ["Greywater Tools", "$7,500", "Sana Whitlow", "Find decision maker", "LP"]]],
  ["Demo booked", "3 · $38,500", 60, [["Bracken & Vale", "$18,000", "Tomas Hyde", "Demo Thu 2:30 PM", "TR"], ["Northgate Signs", "$11,500", "Ama Ferrow", "Demo Fri 10:00 AM", "SA"]]],
  ["Proposal sent", "3 · $52,800", 80, [["Linden Cold Storage", "$24,000", "Rafael Stroud", "Follow-up 2 days late", "SA", "late"], ["Quillon Print", "$16,800", "Bea Tamsin", "Awaiting sign-off", "LP"]]],
  ["Won in November", "5 · $64,250", 100, [["Marrow & Sons", "$21,000", "Hugh Marrow", "Signed 3 Nov", "TR", "won"], ["Fennimore Tiles", "$13,250", "Isla Dunmore", "Signed 2 Nov", "LP", "won"]]],
];
const MAP = [
  ["Company", "Harlow Freight", "Company name"],
  ["Contact", "Dee Marchetti", "Contact name"],
  ["Email", "dee@harlowfreight.example", "Contact email"],
  ["Deal size", "8400", "Deal value"],
  ["Where we are", "Sent quote", "Deal stage", "w"],
  ["Next step", "Call Thurs", "Next task"],
  ["Notes 2", "Blank in most rows", "Don’t import", "s"],
];
const st = (s) => s === "w" ? `<span class="cr-st w">${ic("bell", 12)} 6 labels to match</span>` : s === "s" ? `<span class="cr-st s">${ic("minus", 12)} Skipped</span>` : `<span class="cr-st">${ic("check", 12)} Matched</span>`;
const fc = ([m, a, b, c, t, val]) => `<div class="cr-fr"><b>${m}</b><div class="cr-track"><i class="a" style="width:${a}%"></i><i class="b" style="width:${b}%"></i><i class="c" style="width:${c}%"></i><u style="left:${t}%"></u></div><span class="num">${val}</span></div>`;
const rv = (t) => `<span class="cr-v">${t}${ic("chevdown", 12)}</span>`;
const FAQ = [
  ["My spreadsheet is a mess. Will it still import?", "Yes. Blank rows, mixed date formats and five spellings of the same stage are all normal. The importer flags what it cannot read, and nothing goes in until you approve it."],
  ["Can I bring data over from another CRM?", "If it can export to CSV, we can bring it in, including notes and deal history. On Team and Business plans we will do it for you."],
  ["Who counts as a seat?", "Anyone who edits deals. People who only need to look, like a founder or an accountant, get free read-only seats."],
  ["Does it work with my email and calendar?", "It connects to standard work mailboxes and calendars. Emails to and from a contact land on the deal without forwarding anything."],
  ["Can I get my data out again?", "Any time, as CSV, with no ticket to raise and no fee. Your deals are yours."],
  ["What happens when the trial ends?", "Nothing is charged, because we never asked for a card. Your account stays read-only for 30 days so you can export or decide."],
];

const web = (p, s) => K.page(s, `${K.nav(p, ["Import", "Features", "Pricing", "FAQ"], "Start free trial", "Log in")}
<main class="cr">
<section class="sk-wrap cr-hero" id="top">
  <span class="sk-eyebrow">For small B2B sales teams</span>
  <h1>Your pipeline has outgrown the spreadsheet</h1>
  <p class="sk-lede">${esc(p.name)} turns your sales tracker into a board the whole team can see, with a next step on every deal. Move over this afternoon and stop losing deals to a forgotten follow-up.</p>
  <form class="cr-sign" aria-label="Start your 14-day trial" id="start-free-trial"><div class="sk-field"><label for="cr-mail">Work email</label><input class="sk-input" id="cr-mail" value="teodora@harlowfreight.example"></div><button class="btn primary sk-btn-lg" type="button" style="align-self:end">Start your 14-day trial</button></form>
  <p class="cr-micro">No card needed. We will help you move your data for free.</p>
  <div class="cr-bwrap"><div class="card cr-board" aria-label="${esc(p.name)} pipeline board with five stages, deal cards, values, owners and next steps">
    <div class="cr-btop"><b>New business</b><span class="cr-fil">All reps ${ic("chevdown", 12)}</span><span class="cr-fil">${ic("filter", 12)} This quarter</span><span class="cr-sum">$232,950 across 21 deals</span></div>
    <div class="cr-cols">${STAGES.map(([n, t, pc, ds]) => `<div class="cr-col"><div class="cr-colh"><span>${n}</span><span>${t}</span></div><div class="cr-prog"><i style="width:${pc}%"></i></div>${ds.map(deal).join("")}</div>`).join("")}</div>
  </div></div>
</section>

<section class="sk-sec" id="import"><div class="sk-wrap cr-imp">
  <div><span class="sk-eyebrow">Import</span><h2 class="sk-h2" style="margin-top:10px">From spreadsheet to pipeline in an afternoon</h2>
    <ol class="cr-day">${[["1:00 PM", "Export your sheet as a CSV and drop it in."], ["1:10 PM", "Check the column matches. We guess most of them."], ["1:45 PM", "Merge duplicates and tidy your stage labels."], ["2:30 PM", "Invite the team and hand out open deals."], ["3:30 PM", "Everyone works from one pipeline."]].map(([t, d]) => `<li><time>${t}</time><span>${d}</span></li>`).join("")}</ol></div>
  <div class="card cr-map" aria-label="Column mapping step of the CSV import">
    <div class="cr-steps">${["Upload", "Match columns", "Review", "Import"].map((t, i) => `<span class="${i === 1 ? "on" : ""}"><i>${i + 1}</i><em style="font-style:normal">${t}</em></span>`).join("")}</div>
    <div class="cr-file">${ic("doc", 14)}<b>sales-tracker-final-v3.csv</b><span>1,284 rows</span></div>
    <div class="cr-mrow h"><span>Your column</span><em>Sample</em><span class="cr-ar"></span><span>${esc(p.name)} field</span><span class="cr-st s" style="visibility:hidden">Status</span></div>
    ${MAP.map(([c, v, f, s], i) => `<div class="cr-mrow ${s === "w" ? "warn" : ""}"><b style="font-weight:600">${c}</b><em>${v}</em><span class="cr-ar">${ic("arrow", 13)}</span><select aria-label="Field for ${c}" id="cr-f${i}"><option>${f}</option></select>${st(s)}</div>`).join("")}
    <div class="cr-mfoot"><span class="muted">14 likely duplicates, matched on email</span><span class="btn primary">Review import</span></div>
  </div>
</div></section>

<section class="sk-sec sk-alt" id="features"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">A sales week</span><h2 class="sk-h2">Everything a tracker makes you remember, handled</h2></div></div>
  <div class="cr-week">
    <div class="cr-w n"><small>Monday, 8:40 AM</small><h3>Follow-up reminders</h3><p>Open the day to one list of who to call. Any deal with no next step gets flagged.</p>
      <div class="cr-pane">${[["Call Rafael at Linden Cold Storage", "Proposal sent", "2 days late"], ["Send pricing to Tessel Joinery", "New lead", "Today"], ["Confirm demo with Tomas Hyde", "Demo booked", "Today"], ["Check in with Peverell Plumbing", "Qualified", "Tomorrow"]].map(([t, d, w], i) => `<div class="cr-task"><i></i><div><b style="font-weight:600">${t}</b><span>${d}</span></div><span class="${i ? "" : "cr-late"}">${w}</span></div>`).join("")}<div class="cr-gap">${ic("bell", 13)} 3 deals have no next step</div></div></div>
    <div class="cr-w b"><small>Tuesday, 11:15 AM</small><h3>Shared inbox and call notes</h3><p>Emails, calls and notes sit on the deal, so anyone can pick it up. When a rep is out, nothing is stuck in their inbox.</p>
      <div class="cr-pane"><div><div class="cr-th"><span class="avatar">RS</span><div><b>Rafael Stroud</b> <span>Email, 10:52 AM</span><p>The board meets on the 20th. Can you split the setup fee across two invoices?</p></div></div>
        <div class="cr-th call"><span class="avatar">${ic("phone", 14)}</span><div><b>Call with Rafael, 12 min</b> <span>Logged by Sam Achebe</span><p>Wants 8 seats, not 6. Budget sign-off is the blocker. Send revised quote before the 18th.</p></div></div>
        <div class="cr-th note"><span class="avatar">TR</span><div><b>Teodora Ruiz</b> <span>Team note, 11:04 AM</span><p>Sam, I can split the fee. Assigning the reply to you.</p></div></div></div><div class="cr-rep"><span>Reply as Sam Achebe</span><span class="btn">${ic("send", 13)} Send</span></div></div></div>
    <div class="cr-w b"><small>Friday, 4:00 PM</small><h3>Forecast view</h3><p>No more rebuilding a pivot table for the Friday call. Deals roll up by close month and are weighted by stage.</p>
      <div class="cr-pane"><div class="cr-fc">${[["Nov", 40, 24, 14, 80, "$124k"], ["Dec", 0, 44, 22, 86, "$105k"], ["Jan", 0, 14, 36, 86, "$80k"]].map(fc).join("")}</div><div class="cr-lg"><span><i style="background:var(--primary)"></i>Won</span><span><i style="background:color-mix(in oklab,var(--primary) 58%,var(--bg))"></i>Commit</span><span><i style="background:color-mix(in oklab,var(--primary) 24%,var(--bg))"></i>Best case</span><span><i style="background:var(--text);width:2px"></i>Target</span></div></div></div>
    <div class="cr-w n"><small>All week</small><h3>Simple automation</h3><p>If you can describe it in a sentence, you can build the rule. No consultant needed.</p>
      <div class="cr-pane"><div class="cr-rule"><div class="cr-rl"><b>When</b>${rv("Deal moves to")}${rv("Proposal sent")}</div><div class="cr-rl"><b>If</b>${rv("Value is over")}${rv("$5,000")}</div><div class="cr-rl"><b>Then</b>${rv("Create task")}${rv("Follow up in 3 days")}</div></div><div class="cr-rfoot"><span>Ran 46 times this month</span><span class="cr-tog" role="img" aria-label="Rule on"></span></div></div></div>
  </div>
</div></section>

<section class="sk-sec" id="compare"><div class="sk-wrap cr-vs">
  <div><span class="sk-eyebrow">Spreadsheet vs ${esc(p.name)}</span><h2 class="sk-h2" style="margin:10px 0 18px">Sheets are great. Until they run your sales.</h2>
    <table class="cr-tbl"><thead><tr><th>When</th><th>Spreadsheet</th><th>${esc(p.name)}</th></tr></thead><tbody>
    ${[["Two people edit a deal", "Last save wins", "Both changes kept, with history"], ["A deal goes quiet", "Found at month end", "Flagged after 7 days"], ["A rep leaves", "Their notes leave too", "Emails and calls stay on the deal"], ["The boss wants a forecast", "Someone rebuilds the sheet", "Live, by month and stage"], ["You are out on a call", "Pinch and scroll", "Mobile board, log it in seconds"], ["You count the cost", "Free, until a deal slips", "From $15 a seat"]].map(([a, b, c]) => `<tr><td>${a}</td><td>${b}</td><td>${c}</td></tr>`).join("")}</tbody></table></div>
  <aside class="card cr-mig"><span class="sk-eyebrow">Migration help</span><h3 class="sk-h3" style="font-size:calc(23px * var(--hs))">Rather not do it yourself? We will.</h3><p class="muted" style="font-size:14px">Free on Team and Business plans.</p>
    <ol>${["Send us your sheet or old CRM export.", "A real person maps columns and cleans duplicates.", "You check a sample before anything goes live.", "We walk your team through it on a 30-minute call."].map((t, i) => `<li><span class="num">${i + 1}</span><span>${t}</span></li>`).join("")}</ol>
    <p class="muted" style="font-size:13.5px">Usually done within two working days. Your old sheet stays untouched.</p></aside>
</div></section>

<section class="sk-sec sk-alt" id="pricing"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">Pricing</span><h2 class="sk-h2">One price per seat. Read-only seats are free.</h2></div>
    <div class="cr-seat"><span>Seats</span><span class="cr-step"><span>${ic("minus", 14)}</span><b>5</b><span>${ic("plus", 14)}</span></span></div></div>
  <div class="card cr-plans">${[["Starter", "$15", "$75", "For a founder and a first rep.", ["One pipeline", "Follow-up reminders", "CSV import", "Call notes and mobile app"]], ["Team", "$29", "$145", "For teams of 3 to 20 reps.", ["Unlimited pipelines", "Shared inbox", "Forecast view", "25 automation rules", "Free migration"], "on"], ["Business", "$49", "$245", "For teams with a sales manager.", ["Unlimited automation rules", "Roles and permissions", "Change history", "Single sign-on", "Priority support"]]].map(([n, pr, tot, d, fs, on]) => `<article class="cr-plan ${on || ""}"><h3>${n}${on ? `<span class="badge">Most teams pick this</span>` : ""}</h3><div class="num">${pr}<small> per seat, per month</small></div><p class="cr-tot">${tot} a month for 5 seats, billed yearly</p><p class="muted" style="font-size:14px">${d}</p><ul>${fs.map((f) => `<li>${ic("check", 14)}<span>${f}</span></li>`).join("")}</ul><a class="btn ${on ? "primary" : ""} block" href="#start-free-trial" style="margin-top:8px">Start your 14-day trial</a></article>`).join("")}</div>
</div></section>

<section class="sk-sec sk-tight"><div class="sk-wrap"><figure class="cr-q"><p>“We moved 1,900 rows on a Friday after lunch. On Monday nobody asked me where a deal was, and I had forgotten what that felt like.”</p><figcaption class="cr-by"><span class="avatar">NF</span><span><b>Nadia Ferrant</b><br><span class="muted">Sales Lead, Corbel Packaging</span></span></figcaption></figure></div></section>

<section class="sk-sec sk-alt sk-tight" id="faq"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">FAQ</span><h2 class="sk-h2">Questions from people leaving spreadsheets</h2></div></div>
  <div class="cr-faq">${FAQ.map(([q, a], i) => `<details ${i < 2 ? "open" : ""}><summary>${q}${ic("chevdown", 16)}</summary><p>${a}</p></details>`).join("")}</div>
</div></section>

<section class="sk-sec sk-tight"><div class="sk-wrap"><div class="card feat cr-end">
  <div><h2 class="sk-h2">Give your deals a next step</h2><p>Bring your sheet. We will have you on the board by this afternoon.</p></div>
  <div><form class="cr-sign" aria-label="Start your 14-day trial"><div class="sk-field"><label for="cr-mail2">Work email</label><input class="sk-input" id="cr-mail2" value="you@company.example"></div><button class="btn primary sk-btn-lg" type="button" style="align-self:end">Start your 14-day trial</button></form><p class="cr-micro">No card needed. Free help moving your data.</p></div>
</div></div></section>
</main>
${K.footer(p, "A sales CRM for small B2B teams who have outgrown their spreadsheet.", [["Product", ["Pipeline board", "Import", "Forecast", "Automation"]], ["Help", ["Migration help", "Guides", "System status", "Export your data"]], ["Company", ["About", "Security", "hello@pipeloom.example", "(555) 014-6172"]]], `© 2026 ${p.name}. Fictional company created for this template.`)}`, CSS);

module.exports = {
  "crm-landing-page": K.def("crmsite", "CRM landing page",
    "a single-goal sales CRM landing page: navigation with log in and start free trial, a centred hero with an email form above a pipeline board with five stages, deal cards, values, owners and a late follow-up, a spreadsheet import section with an afternoon timeline and a CSV column-mapping mock, a sales week showing follow-up reminders, a shared inbox with call notes, a forecast view and an automation rule builder, a spreadsheet versus CRM comparison table beside migration help, three per-seat pricing plans with a seat stepper, a customer quote, an FAQ accordion, a dark closing sign-up and a footer",
    ["navigation-header", "hero", "signup-form", "product-mockup", "kanban-board", "pipeline", "deal-cards", "csv-import", "column-mapping", "timeline", "task-list", "shared-inbox", "forecast-chart", "rule-builder", "comparison-table", "pricing", "stepper", "testimonial", "faq", "accordion", "cta-banner", "footer", "crm"], web),
};
