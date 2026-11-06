/* Apartment community website template (Cinderyard Residences, a fictional rental building). Full responsive, leasing-led home page:
   nav with resident login, hero with a coded building elevation where lit windows are the homes in the availability table, no-JS floor plan browser
   (radio inputs + :checked) with four coded SVG floor plans, availability table, amenities as a level-by-level building section, neighborhood map and walking times,
   how to apply in steps with fees and a pet policy, tour scheduler (in person or virtual) with sample slots, resident login band, FAQ, leasing office hours, footer.
   Fair housing style wording: describes homes and the building, never ideal residents. Drawings use tokens so all 8 styles and dark mode recolour them. */
const { ic, esc } = require("../lib");
const K = require("../sitekit");

const CSS = `<style>
.ap>.sk-sec{padding:42px 0}
.ap h2.sk-h2{font-size:calc(34px * var(--hs))}
.ap .sk-head{margin-bottom:22px}
.ap-hero{padding-top:36px;padding-bottom:0}
.ap-htop{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,1fr);gap:56px;align-items:end;margin-bottom:26px}
.ap-htop h1{font-size:calc(56px * var(--hs));line-height:1.02}
.ap-htop .sk-lede{font-size:16px;margin-bottom:14px}
.ap-draw{position:relative;display:grid;padding:0;overflow:hidden;background:color-mix(in oklab,var(--primary) 7%,var(--surface))}
.ap-draw svg{display:block;width:100%;height:auto}
.ap-e-b{fill:var(--bg);stroke:var(--text);stroke-width:2}
.ap-e-t{fill:none;stroke:var(--text);stroke-width:1.2}
.ap-e-th{fill:none;stroke:var(--text);stroke-width:2.5}
.ap-e-win{fill:color-mix(in oklab,var(--text) 8%,var(--bg));stroke:var(--text);stroke-width:1}
.ap-e-lit{fill:var(--primary);stroke:var(--text);stroke-width:1.2}
.ap-e-tree{fill:color-mix(in oklab,var(--success) 26%,var(--surface));stroke:var(--text);stroke-width:1.2}
.ap-e-g{fill:color-mix(in oklab,var(--text) 10%,var(--surface))}
.ap-draw text{font:600 12px var(--font-b);fill:var(--muted)}
.ap-blk{order:-1;display:flex;justify-content:space-between;align-items:center;gap:16px;padding:8px 20px;background:var(--bg);border-bottom:1px solid var(--border);font-size:12.5px;line-height:1.4}
.ap-blk b{font-size:13px}
.ap-key{display:inline-flex;align-items:center;gap:7px;color:var(--muted)}
.ap-key i{width:18px;height:11px;background:var(--primary);border:1px solid var(--text);flex:0 0 auto}
.ap-stats{order:1;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));border-top:1px solid var(--border);background:var(--bg)}
.ap-stats div{padding:14px 20px;border-left:1px solid var(--border);display:grid;gap:0}
.ap-stats div:first-child{border-left:0}
.ap-stats .num{font-size:21px;line-height:1.25}
.ap-stats span{font-size:13px;color:var(--muted)}
.ap-fp{position:relative}
.ap-fp>input{position:absolute;opacity:0;width:1px;height:1px;left:0;top:0}
.ap-tabs{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:14px}
.ap-tab{cursor:pointer;padding:12px 16px;border:1px solid var(--border);border-radius:var(--radius);background:var(--bg);display:grid;gap:0;font-size:13px;color:var(--muted)}
.ap-tab b{font-size:15px;color:var(--text)}
.ap-tab .num{font-size:17px;color:var(--text)}
.ap-tab span.ap-av{color:var(--success);font-weight:600;color:color-mix(in oklab,var(--success) 80%,var(--text))}
${[1, 2, 3, 4].map((n) => `#ap-p${n}:checked~.ap-tabs label[for=ap-p${n}]{border-color:var(--primary);box-shadow:inset 0 0 0 2px var(--primary);background:color-mix(in oklab,var(--primary) 9%,var(--bg))}
#ap-p${n}:focus-visible~.ap-tabs label[for=ap-p${n}]{outline:2px solid var(--text);outline-offset:2px}
#ap-p${n}:checked~.ap-panels .ap-pn${n}{display:grid}`).join("\n")}
.ap-panel{display:none;grid-template-columns:minmax(0,1.5fr) minmax(0,1fr);gap:0;padding:0;overflow:hidden}
.ap-plan{padding:14px 18px;background:var(--bg);border-right:1px solid var(--border)}
.ap-plan svg{display:block;width:100%;height:auto;max-height:364px}
.ap-w{fill:none;stroke:var(--text);stroke-width:7;stroke-linecap:square;stroke-linejoin:miter}
.ap-gap{fill:none;stroke:var(--bg);stroke-width:9}
.ap-th{fill:none;stroke:var(--text);stroke-width:1.2}
.ap-win{fill:none;stroke:var(--primary);stroke-width:4}
.ap-f{fill:color-mix(in oklab,var(--text) 5%,var(--bg));stroke:var(--muted);stroke-width:1.2}
.ap-c{fill:color-mix(in oklab,var(--primary) 16%,var(--bg));stroke:var(--muted);stroke-width:1.2}
.ap-bal{fill:none;stroke:var(--muted);stroke-width:1.5;stroke-dasharray:6 5}
.ap-l{font:600 14px var(--font-b);fill:var(--text);text-anchor:middle}
.ap-d{font:400 12px var(--font-b);fill:var(--muted);text-anchor:middle}
.ap-spec{padding:20px 24px;display:grid;gap:12px;align-content:start}
.ap-spec dl{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px 16px}
.ap-spec dt{font-size:12.5px;color:var(--muted)}
.ap-spec dd{font-size:15px;font-weight:600}
.ap-spec dd.num{font-size:19px}
.ap-spec ul{list-style:none;display:grid;gap:5px;font-size:14px;padding-top:10px;border-top:1px solid var(--border)}
.ap-spec li{display:grid;grid-template-columns:18px minmax(0,1fr);gap:6px}
.ap-spec li svg{margin-top:4px;color:var(--success)}
.ap-tblc{padding:0;overflow:hidden}
.ap-tbl{width:100%;border-collapse:collapse;font-size:14px}
.ap-tbl th,.ap-tbl td{text-align:left;padding:6px 20px;border-bottom:1px solid var(--border);white-space:nowrap}
.ap-tbl thead th{font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);font-weight:600;background:var(--surface);padding-block:10px}
.ap-tbl tbody tr:last-child>*{border-bottom:0}
.ap-tbl tbody th{font-weight:700;font-variant-numeric:tabular-nums}
.ap-tbl .r{text-align:right}
.ap-tbl .ap-now{font-weight:600;color:color-mix(in oklab,var(--success) 80%,var(--text))}
.ap-tbl a{font-weight:600;font-size:13px;color:color-mix(in oklab,var(--primary) 82%,var(--text));text-decoration:underline;text-underline-offset:3px}
.ap-tn{color:var(--muted);font-size:13px}
.ap-sect{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(0,1fr);gap:28px;align-items:stretch}
.ap-levels{display:grid;border:2px solid var(--text);border-radius:var(--radius-sm);overflow:hidden;background:var(--bg)}
.ap-lv{display:grid;grid-template-columns:128px minmax(0,1fr);border-top:1px solid var(--border)}
.ap-lv:first-child{border-top:0}
.ap-lv>b{padding:12px 14px;font-size:13.5px;background:color-mix(in oklab,var(--primary) 10%,var(--bg));border-right:1px solid var(--border)}
.ap-lv>b small{display:block;font-size:12px;font-weight:500;color:var(--muted)}
.ap-lv>p{padding:12px 16px;font-size:14px;line-height:1.5}
.ap-in{padding:22px 24px;display:grid;gap:10px;align-content:start}
.ap-in h3{font-size:calc(19px * var(--hs))}
.ap-in ul{list-style:none;display:grid;gap:6px;font-size:14px}
.ap-in li{display:grid;grid-template-columns:18px minmax(0,1fr);gap:6px}
.ap-in li svg{margin-top:4px;color:var(--success)}
.ap-area{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);gap:40px;align-items:center}
.ap-map{padding:0;overflow:hidden;background:var(--surface)}
.ap-map svg{display:block;width:100%;height:auto}
.ap-m-land{fill:color-mix(in oklab,var(--text) 5%,var(--surface))}
.ap-m-road{fill:none;stroke:var(--bg);stroke-width:13}
.ap-m-rail{fill:none;stroke:var(--text);stroke-width:2.5;stroke-dasharray:10 6}
.ap-m-park{fill:color-mix(in oklab,var(--success) 26%,var(--surface))}
.ap-m-water{fill:color-mix(in oklab,var(--accent) 30%,var(--surface))}
.ap-m-pin{fill:var(--primary);stroke:var(--bg);stroke-width:2}
.ap-map text{font:600 13px var(--font-b);fill:var(--muted)}
.ap-map text.n{font-size:13px;font-weight:700;fill:var(--on-primary);text-anchor:middle}
.ap-map text.home{font-size:13.5px;font-weight:700;fill:var(--text)}
.ap-m-home{fill:var(--text)}
.ap-walk{list-style:none;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 28px;margin-top:12px}
.ap-walk li{display:grid;grid-template-columns:24px minmax(0,1fr) auto;gap:8px;align-items:baseline;padding:8px 0;border-top:1px solid var(--border);font-size:14px}
.ap-walk i{font-style:normal;width:22px;height:22px;border-radius:50%;display:grid;place-items:center;font-size:12px;font-weight:700;background:var(--primary);color:var(--on-primary)}
.ap-walk .num{font-size:13.5px;color:var(--muted);white-space:nowrap}
.ap-steps{list-style:none;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:18px;margin-bottom:18px}
.ap-steps li{padding-top:12px;border-top:3px solid var(--text);display:grid;gap:3px;align-content:start;font-size:13.5px;line-height:1.45;color:var(--muted)}
.ap-steps b{color:var(--text);font-size:15px}
.ap-steps .num{font-size:13px;color:var(--muted)}
.ap-money{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);gap:24px;align-items:stretch}
.ap-fees{padding:0;overflow:hidden}
.ap-fees table{width:100%;border-collapse:collapse;font-size:14px}
.ap-fees th,.ap-fees td{text-align:left;padding:6.5px 20px;border-bottom:1px solid var(--border)}
.ap-fees thead th{background:var(--surface);font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);font-weight:600}
.ap-fees td{font-weight:400}
.ap-fees td.num{text-align:right;white-space:nowrap;font-size:14.5px}
.ap-fees tbody th{font-weight:500}
.ap-fees tbody tr:last-child>*{border-bottom:0}
.ap-pet{padding:20px 24px;display:grid;gap:8px;align-content:start}
.ap-pet h3{font-size:calc(19px * var(--hs))}
.ap-pet ul{list-style:none;display:grid;gap:5px;font-size:14px}
.ap-pet li{display:flex;justify-content:space-between;gap:12px;padding-bottom:5px;border-bottom:1px solid var(--border)}
.ap-pet li span:last-child{font-weight:600;white-space:nowrap}
.ap-pet p{font-size:13px;line-height:1.45;color:var(--muted)}
.ap-tour{display:grid;grid-template-columns:minmax(0,.75fr) minmax(0,1.25fr);gap:48px;align-items:start}
.ap-form{padding:20px 24px;display:grid;gap:10px}
.ap-form .sk-g2,.ap-form .sk-g3{gap:12px}
.ap-chips{display:flex;flex-wrap:wrap;gap:6px}
.ap-chips label{position:relative;min-height:38px;padding:0 12px;border:1px solid var(--border);border-radius:var(--radius);display:inline-flex;align-items:center;gap:6px;font-size:13.5px;font-weight:500;background:var(--bg)}
.ap-chips input{position:absolute;opacity:0;width:1px;height:1px}
.ap-chips label.on{background:var(--primary);border-color:var(--primary);color:var(--on-primary)}
.ap-chips label.off{color:var(--muted);text-decoration:line-through;background:var(--surface)}
.ap-lab{font-weight:500;font-size:13px;margin-bottom:6px;display:block}
.ap-bring{list-style:none;display:grid;gap:7px;font-size:14px;margin-top:14px}
.ap-bring li{display:grid;grid-template-columns:20px minmax(0,1fr);gap:8px}
.ap-bring li svg{margin-top:3px;color:color-mix(in oklab,var(--primary) 80%,var(--text))}
.ap-res{background:var(--text);color:var(--bg);padding:22px 0}
.ap-res>div{display:flex;align-items:center;justify-content:space-between;gap:24px}
.ap-res h2{font-size:calc(22px * var(--hs))}
.ap-res p{font-size:14px;opacity:.82}
.ap-res .btn{flex:0 0 auto}
.ap-qa{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 40px}
.ap-qa details{border-top:1px solid var(--border);padding:10px 0}
.ap-qa summary{cursor:pointer;font-weight:600;list-style:none;display:flex;justify-content:space-between;gap:12px}
.ap-qa summary::-webkit-details-marker{display:none}
.ap-qa summary svg{flex:0 0 auto;margin-top:4px;color:var(--muted)}
.ap-qa details[open] summary svg{transform:rotate(180deg)}
.ap-qa p{margin-top:5px;font-size:14px;color:var(--muted);line-height:1.5}
.ap-office{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.1fr) minmax(0,.9fr);gap:40px;align-items:start}
.ap-hours{width:100%;border-collapse:collapse;font-size:14px}
.ap-hours td{padding:5px 0;border-bottom:1px solid var(--border)}
.ap-hours td:last-child{text-align:right}
.ap-contact{list-style:none;display:grid;gap:8px;font-size:14px;margin-top:12px}
.ap-contact li{display:grid;grid-template-columns:22px minmax(0,1fr);gap:8px;overflow-wrap:anywhere}
.ap-contact li svg{margin-top:3px;color:color-mix(in oklab,var(--primary) 80%,var(--text))}
@media (max-width:1024px){
  .ap-htop{gap:32px}.ap-htop h1{font-size:calc(46px * var(--hs))}
  .ap-tabs{grid-template-columns:repeat(2,minmax(0,1fr))}
  .ap-panel{grid-template-columns:minmax(0,1fr)}
  .ap-plan{border-right:0;border-bottom:1px solid var(--border)}
  .ap-tbl th,.ap-tbl td{padding-inline:12px}
  .ap-sect,.ap-area,.ap-tour{gap:24px}
  .ap-steps{grid-template-columns:repeat(3,minmax(0,1fr))}
  .ap-office{grid-template-columns:repeat(2,minmax(0,1fr));gap:28px}
  .ap-office>:first-child{grid-column:1/-1}
}
@media (max-width:760px){
  .ap>.sk-sec{padding:32px 0}
  .ap h2.sk-h2{font-size:calc(28px * var(--hs))}
  .ap .sk-head{margin-bottom:16px;gap:8px}
  .ap-hero{padding-top:22px}
  .ap-htop{grid-template-columns:minmax(0,1fr);gap:12px;margin-bottom:16px}
  .ap-htop h1{font-size:calc(40px * var(--hs))}
  .ap-draw svg{height:250px}
  .ap-blk{padding:8px 14px}
  .ap-blk b{display:none}
  .ap-stats{grid-template-columns:repeat(2,minmax(0,1fr))}
  .ap-stats div{padding:10px 14px;border-left:0}
  .ap-stats div:nth-child(even){border-left:1px solid var(--border)}
  .ap-stats div:nth-child(n+3){border-top:1px solid var(--border)}
  .ap-stats .num{font-size:18px}
  .ap-stats div:nth-child(n+3){display:none}
  .ap-tabs{gap:8px}
  .ap-tab{padding:9px 12px}
  .ap-tab .ap-sz{display:none}
  .ap-plan{padding:10px}
  .ap-l{font-size:19px}.ap-d{display:none}
  .ap-spec{padding:16px}
  .ap-spec ul,.ap-spec .btn:last-child{display:none}
  .ap-tblc{margin:0 -20px;border-left:0!important;border-right:0!important;border-radius:0;box-shadow:none!important}
  .ap-tbl{font-size:13px}
  .ap-tbl th,.ap-tbl td{padding:6.5px 6px}
  .ap-tbl th:first-child,.ap-tbl td:first-child{padding-left:20px}
  .ap-tbl th:last-child,.ap-tbl td:last-child{padding-right:20px}
  .ap-tbl .ap-sm{display:none}
  .ap-tbl thead th{font-size:11px;letter-spacing:.02em}
  .ap-tn{font-size:12px}
  .ap-sect,.ap-area,.ap-tour,.ap-money{grid-template-columns:minmax(0,1fr);gap:16px}
  .ap-lv{grid-template-columns:minmax(0,1fr)}
  .ap-lv>b{padding:8px 14px;border-right:0;border-bottom:1px solid var(--border)}
  .ap-lv>b small{display:inline;margin-left:6px}
  .ap-lv>p{padding:9px 14px;font-size:13.5px}
  .ap-in{padding:18px}
  .ap-in li:nth-child(n+5){display:none}
  .ap-walk{grid-template-columns:minmax(0,1fr)}
  .ap-walk li:nth-child(n+6){display:none}
  .ap-steps{grid-template-columns:minmax(0,1fr);gap:0;margin-bottom:18px}
  .ap-steps li{grid-template-columns:24px minmax(0,1fr);gap:2px 8px;padding:9px 0;border-top:1px solid var(--border)}
  .ap-steps li b{grid-column:2}.ap-steps li span:last-child{grid-column:2}
  .ap-steps .num{grid-row:1}
  .ap-fees th,.ap-fees td{padding:6px 14px}
  .ap-fees tr:nth-child(n+5){display:none}
  .ap-pet{padding:16px}
  .ap-form{padding:18px;gap:10px}
  .ap-form .sk-g2{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
  .ap-form .ap-m-hide{display:none}
  .ap-bring{display:none}
  .ap-res>div{flex-direction:column;align-items:flex-start;gap:12px}
  .ap-qa{grid-template-columns:minmax(0,1fr)}
  .ap-qa .ap-opt{display:none}
  .ap-office{grid-template-columns:minmax(0,1fr);gap:14px}
  .ap-office p{display:none}
}
</style>`;

// ---- data: the availability table drives the plan counts and the lit windows on the hero elevation ---------------------
const PLANS = [
  { id: 1, key: "Ember", kind: "Studio", beds: "Studio, 1 bath", sqft: "485 sq ft", from: "$1,640", notes: ["Sleeping area with room for a queen bed", "Walk-in closet by the bath", "Kitchenette with full-size appliances"] },
  { id: 2, key: "Hearth", kind: "1 bedroom", beds: "1 bed, 1 bath", sqft: "690 sq ft", from: "$2,060", notes: ["Private balcony off the living room", "Walk-in closet off the bedroom", "In-home washer and dryer"] },
  { id: 3, key: "Kiln", kind: "2 bedroom", beds: "2 bed, 2 bath", sqft: "985 sq ft", from: "$2,780", notes: ["Bedrooms at opposite ends of the home", "Primary bedroom with its own bath", "Open kitchen with room for a table"] },
  { id: 4, key: "Foundry", kind: "3 bedroom", beds: "3 bed, 2 bath", sqft: "1,240 sq ft", from: "$3,520", notes: ["Corner home with windows on two sides", "Wide balcony along the living room", "Dedicated storage locker included"] },
];
const AVAIL = [
  ["203", 2, "Ember", "Studio", "485", "$1,640", "Now"], ["508", 5, "Ember", "Studio", "485", "$1,715", "Dec 1"], ["704", 7, "Ember", "Studio", "502", "$1,790", "Dec 15"],
  ["206", 2, "Hearth", "1 bed", "690", "$2,060", "Now"], ["310", 3, "Hearth", "1 bed", "690", "$2,095", "Now"], ["402", 4, "Hearth", "1 bed", "712", "$2,130", "Dec 1"], ["507", 5, "Hearth", "1 bed", "690", "$2,165", "Dec 1"], ["601", 6, "Hearth", "1 bed", "712", "$2,210", "Dec 15"], ["709", 7, "Hearth", "1 bed", "690", "$2,285", "Jan 1"],
  ["305", 3, "Kiln", "2 bed", "985", "$2,780", "Dec 1"], ["409", 4, "Kiln", "2 bed", "985", "$2,825", "Dec 15"], ["604", 6, "Kiln", "2 bed", "1,010", "$2,910", "Jan 1"], ["702", 7, "Kiln", "2 bed", "1,010", "$2,980", "Jan 15"],
  ["605", 6, "Foundry", "3 bed", "1,240", "$3,520", "Feb 1"],
];
const count = (key) => AVAIL.filter((u) => u[2] === key).length;

// ---- hero elevation ---------------------------------------------------------------------------------------------------
const elevation = () => {
  const lit = new Set(AVAIL.map((u) => u[0]));
  const yOf = (f) => 60 + (7 - f) * 46, xOf = (c) => 172 + (c - 1) * 86;
  let w = "";
  for (let f = 7; f >= 2; f--) for (let c = 1; c <= 10; c++) {
    const id = `${f}${String(c).padStart(2, "0")}`, x = xOf(c), y = yOf(f), on = lit.has(id);
    w += `<rect class="${on ? "ap-e-lit" : "ap-e-win"}" x="${x}" y="${y + 6}" width="60" height="31"/><path class="ap-e-t" d="M${x + 30} ${y + 6}v31"/>`;
    if ([3, 4, 7, 8].includes(c)) w += `<path class="ap-e-t" d="M${x - 6} ${y + 37}h72M${x - 6} ${y + 28}h72M${x - 6} ${y + 28}v9M${x + 66} ${y + 28}v9"/>`;
  }
  const floors = [7, 6, 5, 4, 3, 2].map((f) => `<path class="ap-e-t" d="M150 ${yOf(f)}H1052"/><text x="112" y="${yOf(f) + 27}">L${f}</text><path class="ap-e-t" d="M136 ${yOf(f) + 23}h10"/>`).join("");
  const shop = [0, 1, 2, 3, 4, 5].map((i) => { const x = i < 3 ? 170 + i * 94 : 700 + (i - 3) * 116; const wd = i < 3 ? 84 : 104; return `<rect class="ap-e-win" x="${x}" y="344" width="${wd}" height="52"/><path class="ap-e-t" d="M${x + wd / 2} 344v52"/>`; }).join("");
  const tree = (x, y, r) => `<path class="ap-e-t" d="M${x} ${y}v${396 - y}"/><circle class="ap-e-tree" cx="${x}" cy="${y - r / 2}" r="${r}"/>`;
  return `<svg viewBox="0 0 1200 430" preserveAspectRatio="xMidYMax slice" role="img" aria-label="Street elevation of a seven-story apartment building. Lit windows mark the homes available now.">
<rect class="ap-e-g" y="396" width="1200" height="34"/>${tree(66, 330, 34)}${tree(1132, 322, 38)}
<rect class="ap-e-b" x="150" y="60" width="902" height="336"/><rect class="ap-e-b" x="150" y="26" width="110" height="34"/><path class="ap-e-th" d="M820 60V34H1010V60M850 34V60M885 34V60M920 34V60M955 34V60M990 34V60"/><circle class="ap-e-tree" cx="790" cy="46" r="13"/>
${floors}${w}
<path class="ap-e-th" d="M150 336H1052"/>${shop}<rect class="ap-e-b" x="462" y="344" width="226" height="52"/><path class="ap-e-th" d="M446 344H704"/><rect class="ap-e-win" x="524" y="350" width="102" height="46"/><path class="ap-e-t" d="M575 350v46"/>
<path class="ap-e-th" d="M0 396H1200"/><text x="84" y="420">Cinder Street</text><path class="ap-e-t" d="M1040 416h100M1040 412v8M1090 412v8M1140 412v8"/><text x="1000" y="420">50 ft</text></svg>`;
};

// ---- coded floor plans ------------------------------------------------------------------------------------------------
const W = (d) => `<path class="ap-w" d="${d}"/>`;
const door = (x, y, l, axis, sa, ss) => {
  const h = axis === "h", ex = h ? x + l * sa : x, ey = h ? y : y + l * sa, lx = h ? x : x + l * ss, ly = h ? y + l * ss : y;
  const sweep = h ? (sa * ss > 0 ? 0 : 1) : (sa * ss > 0 ? 1 : 0);
  return `<path class="ap-gap" d="M${x} ${y}L${ex} ${ey}"/><path class="ap-th" d="M${x} ${y}L${lx} ${ly}A${l} ${l} 0 0 ${sweep} ${ex} ${ey}"/>`;
};
const win = (x1, y1, x2, y2) => `<path class="ap-gap" d="M${x1} ${y1}L${x2} ${y2}"/><path class="ap-win" d="M${x1} ${y1}L${x2} ${y2}"/>`;
const slide = (x1, x2, y) => `<path class="ap-gap" d="M${x1} ${y}H${x2}"/><path class="ap-th" d="M${x1} ${y - 2}H${(x1 + x2) / 2 + 6}M${(x1 + x2) / 2 - 6} ${y + 2}H${x2}"/>`;
const bed = (x, y, w, h) => `<rect class="ap-f" x="${x}" y="${y}" width="${w}" height="${h}" rx="3"/><rect class="ap-f" x="${x + 8}" y="${y + 7}" width="${w / 2 - 12}" height="24" rx="3"/><rect class="ap-f" x="${x + w / 2 + 4}" y="${y + 7}" width="${w / 2 - 12}" height="24" rx="3"/><path class="ap-th" d="M${x} ${y + 40}H${x + w}"/>`;
const sofa = (x, y, w, h) => `<rect class="ap-f" x="${x}" y="${y}" width="${w}" height="${h}" rx="5"/><path class="ap-th" d="M${x + 5} ${y + 13}H${x + w - 5}"/>`;
const tbl = (x, y, r) => `<circle class="ap-f" cx="${x}" cy="${y}" r="${r}"/>`;
const tub = (x, y, w, h) => `<rect class="ap-f" x="${x}" y="${y}" width="${w}" height="${h}" rx="4"/><rect class="ap-f" x="${x + 6}" y="${y + 6}" width="${w - 12}" height="${h - 12}" rx="10"/>`;
const wc = (x, y) => `<rect class="ap-f" x="${x}" y="${y}" width="24" height="9"/><ellipse class="ap-f" cx="${x + 12}" cy="${y + 21}" rx="10" ry="12"/>`;
const basin = (x, y) => `<rect class="ap-c" x="${x}" y="${y}" width="42" height="24"/><ellipse class="ap-f" cx="${x + 21}" cy="${y + 12}" rx="13" ry="7"/>`;
const hob = (x, y) => `<rect class="ap-f" x="${x}" y="${y}" width="42" height="36"/>${[[10, 10], [30, 10], [10, 26], [30, 26]].map(([a, b]) => `<circle class="ap-th" cx="${x + a}" cy="${y + b}" r="5"/>`).join("")}`;
const sinkK = (x, y) => `<rect class="ap-f" x="${x}" y="${y}" width="46" height="28" rx="3"/>`;
const L = (x, y, n, d) => `<text class="ap-l" x="${x}" y="${y}">${n}</text>${d ? `<text class="ap-d" x="${x}" y="${y + 16}">${d}</text>` : ""}`;
const svgPlan = (h, name, inner) => `<svg viewBox="0 0 640 ${h}" role="img" aria-label="Floor plan of the ${name}">${inner}</svg>`;
const PLAN_SVG = {
  1: svgPlan(400, "Ember studio", `<rect class="ap-c" x="34" y="312" width="216" height="54"/>${hob(70, 322)}${sinkK(150, 324)}<rect class="ap-f" x="254" y="312" width="52" height="54"/>
${tub(38, 38, 146, 56)}${wc(46, 126)}${basin(90, 138)}${bed(446, 38, 134, 150)}${sofa(330, 318, 160, 46)}${tbl(548, 322, 24)}
${W("M30 30H610V370H30Z")}${W("M190 30V170H30")}${W("M300 30V110H190")}
${door(190, 160, 46, "v", -1, -1)}${slide(204, 288, 110)}${door(30, 196, 46, "v", 1, 1)}${win(610, 60, 610, 180)}${win(610, 220, 610, 340)}
${L(245, 72, "Closet")}${L(140, 298, "Kitchen")}${L(346, 214, "Living and sleeping", "24 ft x 15 ft")}${L(112, 112, "Bath")}`),
  2: svgPlan(420, "Hearth one bedroom", `<rect class="ap-c" x="34" y="34" width="192" height="52"/><rect class="ap-c" x="34" y="86" width="52" height="118"/>${hob(100, 42)}${sinkK(40, 130)}<rect class="ap-f" x="172" y="34" width="54" height="52"/>
${tub(236, 36, 138, 52)}${wc(250, 112)}${basin(320, 122)}${bed(456, 36, 136, 134)}${sofa(474, 238, 130, 48)}${tbl(120, 285, 28)}
${W("M30 30H610V340H30Z")}${W("M380 30V230H610")}${W("M230 30V230H380")}${W("M230 150H380")}
${door(230, 94, 44, "v", 1, 1)}${door(380, 168, 44, "v", 1, -1)}${door(420, 230, 46, "h", 1, -1)}${door(30, 248, 46, "v", 1, 1)}${win(610, 60, 610, 200)}${win(320, 340, 590, 340)}
<rect class="ap-bal" x="306" y="344" width="304" height="58"/>
${L(150, 150, "Kitchen", "11 ft x 12 ft")}${L(305, 194, "Closet")}${L(305, 104, "Bath")}${L(516, 196, "Bedroom", "13 ft x 12 ft")}${L(330, 286, "Living and dining", "22 ft x 11 ft")}${L(458, 378, "Balcony")}`),
  3: svgPlan(420, "Kiln two bedroom", `<rect class="ap-c" x="34" y="292" width="172" height="44"/>${hob(44, 296)}${sinkK(120, 302)}<rect class="ap-c" x="74" y="232" width="100" height="26"/>
${bed(46, 36, 122, 112)}${tub(216, 36, 78, 46)}${wc(218, 98)}${tub(306, 36, 108, 40)}${wc(308, 92)}${basin(336, 100)}${bed(462, 36, 134, 126)}${sofa(450, 224, 146, 46)}${tbl(300, 290, 26)}
${W("M30 30H610V340H30Z")}${W("M30 190H420")}${W("M210 30V190")}${W("M300 30V190")}${W("M420 30V210H610")}${W("M300 130H420")}
${door(148, 190, 44, "h", 1, -1)}${door(228, 190, 44, "h", 1, -1)}${door(420, 74, 40, "v", 1, -1)}${door(420, 140, 40, "v", 1, -1)}${door(444, 210, 44, "h", 1, -1)}${door(30, 196, 44, "v", 1, 1)}${win(60, 30, 180, 30)}${win(610, 60, 610, 180)}${win(350, 340, 590, 340)}
<rect class="ap-bal" x="336" y="344" width="274" height="58"/>
${L(92, 176, "Bedroom 2")}${L(270, 118, "Bath")}${L(350, 166, "Closet")}${L(556, 190, "Primary")}${L(120, 216, "Kitchen")}${L(350, 240, "Living and dining", "24 ft x 13 ft")}${L(474, 378, "Balcony")}`),
  4: svgPlan(420, "Foundry three bedroom", `<rect class="ap-c" x="24" y="302" width="176" height="44"/>${hob(34, 306)}${sinkK(116, 312)}
${bed(38, 28, 112, 106)}${tub(176, 26, 68, 42)}${wc(198, 92)}${bed(268, 28, 112, 106)}${tub(406, 26, 78, 38)}${wc(410, 72)}${bed(506, 28, 104, 126)}${sofa(460, 262, 140, 46)}${tbl(300, 300, 28)}
${W("M20 20H620V350H20Z")}${W("M20 180H490")}${W("M170 20V180")}${W("M250 20V180")}${W("M400 20V180")}${W("M400 110H490")}${W("M490 20V200H620")}
${door(124, 180, 40, "h", 1, -1)}${door(188, 180, 38, "h", 1, -1)}${door(350, 180, 40, "h", 1, -1)}${door(490, 68, 34, "v", 1, -1)}${door(490, 126, 36, "v", 1, -1)}${door(500, 200, 40, "h", 1, -1)}${door(20, 192, 44, "v", 1, 1)}
${win(40, 20, 150, 20)}${win(270, 20, 380, 20)}${win(620, 50, 620, 170)}${win(380, 350, 600, 350)}
<rect class="ap-bal" x="366" y="354" width="254" height="52"/>
${L(72, 164, "Bedroom 2")}${L(302, 164, "Bedroom 3")}${L(210, 138, "Bath")}${L(426, 150, "Closet")}${L(582, 186, "Primary")}${L(110, 232, "Kitchen")}${L(340, 232, "Living and dining", "26 ft x 15 ft")}${L(492, 386, "Balcony")}`),
};

const mapShot = () => `<svg viewBox="0 0 640 400" role="img" aria-label="Neighborhood map with the building on Cinder Street, numbered places nearby, the river and the rail line">
<rect class="ap-m-land" width="640" height="400"/><path class="ap-m-water" d="M0 330C120 300 230 344 360 330S560 300 640 322V400H0Z"/><rect class="ap-m-park" x="372" y="44" width="176" height="120" rx="8"/>
<g><path class="ap-m-road" d="M0 190H640"/><path class="ap-m-road" d="M0 82H640"/><path class="ap-m-road" d="M0 278H640"/><path class="ap-m-road" d="M130 0V320"/><path class="ap-m-road" d="M340 0V320"/><path class="ap-m-road" d="M580 0V320"/></g>
<path class="ap-m-rail" d="M0 30C180 30 420 240 640 240"/>
<text x="16" y="182">Cinder Street</text><text x="400" y="108">Millrace Park</text><text x="26" y="364">River Ashe</text><text x="526" y="268">Harbour Line</text>
<rect class="ap-m-home" x="204" y="148" width="34" height="34" rx="3"/><text class="home" x="196" y="140" text-anchor="middle">You are here</text>
${[[330, 190, 1], [430, 214, 2], [130, 142, 3], [230, 278, 4], [392, 82, 5], [130, 82, 6], [340, 278, 7], [68, 278, 8]].map(([x, y, n]) => `<circle class="ap-m-pin" cx="${x}" cy="${y}" r="13"/><text class="n" x="${x}" y="${y + 5}">${n}</text>`).join("")}</svg>`;

const LEVELS = [
  ["Roof", "Level 8", "Terrace with shaded tables, gas grills, a dog run and raised garden beds you can sign up for"],
  ["Levels 2 to 7", "Homes", "Elevators to every floor, a trash and recycling room on each level, and parcel notices by text"],
  ["Ground", "Level 1", "Lobby with staffed hours, parcel lockers, cold storage for grocery deliveries, a shared workroom and a fitness room"],
  ["Basement", "Level 0", "Garage parking at $165 a month, car charging bays, secure bike room with a repair stand, and storage lockers"],
];
const WALK = [["Tram stop, Cinder Street", "2 min"], ["Harbour Line station", "7 min"], ["Grocery store", "3 min"], ["Pharmacy", "5 min"], ["Millrace Park", "4 min"], ["Bakery and cafes", "4 min"], ["Public library", "6 min"], ["River path", "6 min"]];
const STEPS = [
  ["Choose a home", "Tour in person or by video, then tell us which unit you want."],
  ["Apply online", "About 15 minutes for each adult on the lease. $45 application fee each."],
  ["We review", "Income and rental history, against the same written criteria for every applicant. Usually two business days."],
  ["Hold the home", "A $250 holding deposit takes it off the market. It goes toward your first month."],
  ["Sign and move in", "Sign the lease, show proof of renters insurance and book the freight elevator."],
];
const FEES = [["Application fee, each adult", "$45"], ["Holding deposit, credited at move-in", "$250"], ["Security deposit", "$800 to one month"], ["First month's rent, prorated", "Your rent"], ["Water, sewer and trash", "$65 a month"], ["Electricity and internet", "In your name"]];
const FAQ = [
  ["What income do I need to qualify?", "Monthly household income of about 2.5 times the rent. If you are short of that, we accept a guarantor or a larger deposit. All applicants are held to the same written criteria.", 1],
  ["How long are the leases?", "Twelve months as standard, with terms from 6 to 18 months at a different rent. Rents in the table are for 12 months.", 1],
  ["Which utilities are included?", "A flat $65 a month covers water, sewer and trash. Electricity and internet are in your name. Every home is wired for the two local internet providers.", 1],
  ["Is parking included?", "No. Garage spaces are $165 a month and subject to availability. Bike room access is free.", 1, "ap-opt"],
  ["Are any homes accessible?", "Every floor is step-free from the street, and a set of homes has wider doors and roll-in showers. Tell us about any accommodation you need and we will work through it with you.", 0, "ap-opt"],
  ["Can I end my lease early?", "Yes, with 60 days' notice and a set fee of one month's rent. Your lease spells this out.", 0, "ap-opt"],
];

const web = (p, st) => K.page(st, `${K.nav(p, ["Floor plans", "Availability", "Amenities", "Neighborhood", "Apply"], "Book a tour", "Resident login")}
<main class="ap">
<section class="sk-wrap ap-hero" id="top">
  <div class="ap-htop"><div class="sk-stack" style="gap:10px"><span class="sk-eyebrow">Now leasing, 300 Cinder Street</span><h1 class="sk-h1">14 homes open now on Cinder Street</h1></div>
    <div><p class="sk-lede">${esc(p.name)} is a seven-story rental building of studios and one to three bedroom homes, seven minutes on foot from the Harbour Line.</p><div class="sk-row"><a class="btn primary sk-btn-lg" href="#availability">See availability</a><a class="btn sk-btn-lg" href="#book-a-tour">Book a tour</a></div></div></div>
  <div class="card ap-draw">${elevation()}
    <div class="ap-blk"><b>North elevation</b><span class="ap-key"><i></i>Lit windows are homes open now</span></div>
    <div class="ap-stats"><div><span class="num">From $1,640</span><span>Studios, per month</span></div><div><span class="num">From $2,060</span><span>One bedrooms</span></div><div><span class="num">Now to Feb 1</span><span>Move-in dates</span></div><div><span class="num">Today</span><span>Tours at 11:30, 2:00, 4:30</span></div></div></div>
</section>

<section class="sk-sec" id="floor-plans"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">Floor plans</span><h2 class="sk-h2">Four layouts, from 485 to 1,240 sq ft</h2></div><p class="muted" style="max-width:340px">Pick a layout to see the plan. Sizes are typical, and each home varies slightly.</p></div>
  <div class="ap-fp">${PLANS.map((x) => `<input type="radio" name="ap-plan" id="ap-p${x.id}" aria-label="${x.kind}"${x.id === 2 ? " checked" : ""}>`).join("")}
    <div class="ap-tabs">${PLANS.map((x) => `<label class="ap-tab" for="ap-p${x.id}"><b>${x.kind}</b><span class="ap-sz">${x.key}, ${x.sqft}</span><span class="num">From ${x.from}</span><span class="ap-av">${count(x.key)} available</span></label>`).join("")}</div>
    <div class="ap-panels">${PLANS.map((x) => `<article class="card ap-panel ap-pn${x.id}"><div class="ap-plan">${PLAN_SVG[x.id]}</div><div class="ap-spec"><h3 class="sk-h3">The ${x.key}</h3><dl><div><dt>Layout</dt><dd>${x.beds}</dd></div><div><dt>Size</dt><dd>${x.sqft}</dd></div><div><dt>Rent from</dt><dd class="num">${x.from}</dd></div><div><dt>Available</dt><dd>${count(x.key)} home${count(x.key) > 1 ? "s" : ""}</dd></div></dl><ul>${x.notes.map((n) => `<li>${ic("check", 14)}<span>${n}</span></li>`).join("")}</ul><div class="sk-row"><a class="btn primary" href="#availability">See open homes</a><a class="btn" href="#">Download plan ${ic("download", 14)}</a></div></div></article>`).join("")}</div>
  </div>
</div></section>

<section class="sk-sec sk-alt" id="availability"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">Availability</span><h2 class="sk-h2">Every home open right now</h2></div><p class="muted" style="max-width:340px">Updated each morning. Rents are for a 12-month lease and change with the move-in date.</p></div>
  <div class="card ap-tblc"><table class="ap-tbl"><thead><tr><th scope="col">Unit</th><th scope="col">Floor</th><th scope="col">Floor plan</th><th scope="col" class="ap-sm">Size</th><th scope="col">Rent</th><th scope="col">Move-in</th><th scope="col" class="ap-sm r">Next step</th></tr></thead>
  <tbody>${AVAIL.map(([u, f, k, t, s, r, m]) => `<tr><th scope="row">${u}</th><td>${f}</td><td>${k} <span class="ap-tn">${t}</span></td><td class="ap-sm">${s} sq ft</td><td class="num">${r}</td><td${m === "Now" ? ` class="ap-now"` : ""}>${m}</td><td class="ap-sm r"><a href="#book-a-tour">Tour this home</a></td></tr>`).join("")}</tbody></table></div>
</div></section>

<section class="sk-sec" id="amenities"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">Amenities</span><h2 class="sk-h2">The building, level by level</h2></div></div>
  <div class="ap-sect"><div class="ap-levels">${LEVELS.map(([a, b, c]) => `<div class="ap-lv"><b>${a}<small>${b}</small></b><p>${c}</p></div>`).join("")}</div>
    <aside class="card ap-in"><h3 class="h">In every home</h3><ul>${["In-home washer and dryer", "Dishwasher and gas range", "Central heating and cooling", "Wide-plank flooring throughout", "Floor-to-ceiling windows", "Keyless entry and video intercom"].map((x) => `<li>${ic("check", 14)}<span>${x}</span></li>`).join("")}</ul></aside></div>
</div></section>

<section class="sk-sec sk-alt" id="neighborhood"><div class="sk-wrap ap-area">
  <div class="card ap-map">${mapShot()}</div>
  <div><span class="sk-eyebrow">Neighborhood</span><h2 class="sk-h2" style="margin-top:10px">What is nearby, on foot</h2>
    <ol class="ap-walk">${WALK.map(([n, t], i) => `<li><i>${i + 1}</i><span>${n}</span><span class="num">${t}</span></li>`).join("")}</ol>
    <p class="muted" style="font-size:13.5px;margin-top:10px">Walking times are estimates from the front door. Step-free routes on request.</p></div>
</div></section>

<section class="sk-sec" id="apply"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">Apply</span><h2 class="sk-h2">How to apply, and what it costs</h2></div></div>
  <ol class="ap-steps">${STEPS.map(([t, d], i) => `<li><span class="num">${i + 1}</span><b>${t}</b><span>${d}</span></li>`).join("")}</ol>
  <div class="ap-money"><div class="card ap-fees"><table><thead><tr><th scope="col">Fee</th><th scope="col" style="text-align:right">Amount</th></tr></thead><tbody>${FEES.map(([a, b]) => `<tr><th scope="row">${a}</th><td class="num">${b}</td></tr>`).join("")}</tbody></table></div>
    <aside class="card ap-pet" id="pets"><h3 class="h">Pet policy</h3><ul>${[["Cats and dogs", "Up to 2 per home"], ["One-time pet fee", "$300"], ["Monthly pet rent", "$35 per pet"], ["Dog run", "On the roof"]].map(([a, b]) => `<li><span>${a}</span><span>${b}</span></li>`).join("")}</ul><p>Assistance animals are not pets, so these fees and limits do not apply to them. Ask the leasing team how to send a request.</p></aside></div>
</div></section>

<section class="sk-sec sk-alt" id="book-a-tour"><div class="sk-wrap ap-tour">
  <div><span class="sk-eyebrow">Tours</span><h2 class="sk-h2" style="margin-top:10px">See it in person or by video</h2>
    <p class="muted" style="margin-top:10px">Tours take about 30 minutes, with a look at a model home, the open unit you picked and the shared spaces.</p>
    <ul class="ap-bring">${[["pin", "In person: meet us in the lobby, photo ID at the desk"], ["play", "Virtual: a leasing agent walks through on a video call"], ["clock", "Running late? Text (555) 013-7740 and we will move you"]].map(([i, t]) => `<li>${ic(i, 15)}<span>${t}</span></li>`).join("")}</ul></div>
  <form class="card ap-form" aria-label="Book a tour">
    <div><span class="ap-lab">Tour type</span><div class="ap-chips"><label class="on"><input type="radio" name="ap-t" checked> ${ic("pin", 14)} In person</label><label><input type="radio" name="ap-t"> ${ic("play", 14)} Virtual</label></div></div>
    <div><span class="ap-lab">Day</span><div class="ap-chips">${[["Tue 10", 0], ["Wed 11", 1], ["Thu 12", 0], ["Fri 13", 0], ["Sat 14", 0]].map(([d, on]) => `<label class="${on ? "on" : ""}"><input type="radio" name="ap-d"${on ? " checked" : ""}> ${d}</label>`).join("")}</div></div>
    <div><span class="ap-lab">Sample time slots, Wed Nov 11</span><div class="ap-chips">${[["10:00", "off"], ["11:30", ""], ["1:00", "off"], ["2:30", "on"], ["4:00", ""], ["5:30", ""]].map(([t, c]) => `<label class="${c}"><input type="radio" name="ap-s"${c === "on" ? " checked" : ""}${c === "off" ? " disabled" : ""}> ${t}</label>`).join("")}</div></div>
    <div class="sk-g2"><div class="sk-field"><label for="ap-n">Full name</label><input class="sk-input" id="ap-n" value="Jordan Ellery"></div><div class="sk-field"><label for="ap-e">Email</label><input class="sk-input" id="ap-e" value="jordan@sample.example"></div></div>
    <div class="sk-g2 ap-m-hide"><div class="sk-field"><label for="ap-f">Interested in</label><select class="sk-input" id="ap-f"><option>Hearth, 1 bedroom</option><option>Ember, studio</option><option>Kiln, 2 bedroom</option><option>Foundry, 3 bedroom</option></select></div><div class="sk-field"><label for="ap-m">Hoped-for move-in</label><input class="sk-input" id="ap-m" value="December 1"></div></div>
    <button class="btn primary sk-btn-lg" type="button">Confirm my tour</button>
  </form>
</div></section>

<section class="ap-res feat" aria-label="Residents"><div class="sk-wrap"><div><h2 class="h">Already live here?</h2><p>Pay rent, send a maintenance request, check parcels or renew your lease.</p></div><a class="btn primary" href="#">Resident login ${ic("arrow", 15)}</a></div></section>

<section class="sk-sec" id="faq"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">FAQ</span><h2 class="sk-h2">What people ask the leasing office</h2></div></div>
  <div class="ap-qa">${FAQ.map(([q, a, o, c]) => `<details${o ? " open" : ""}${c ? ` class="${c}"` : ""}><summary>${q}${ic("chevdown", 16)}</summary><p>${a}</p></details>`).join("")}</div>
</div></section>

<section class="sk-sec sk-alt" id="leasing-office" style="padding-block:32px"><div class="sk-wrap ap-office">
  <div><span class="sk-eyebrow">Leasing office</span><h2 class="sk-h2" style="margin-top:8px">Come by, or call ahead</h2><p class="muted" style="margin-top:8px;font-size:14px">The office is in the lobby. Walk-ins are welcome, and booked tours go first.</p></div>
  <table class="ap-hours" aria-label="Leasing office hours"><tbody>${[["Monday to Friday", "9:00 AM to 6:00 PM"], ["Saturday", "10:00 AM to 5:00 PM"], ["Sunday", "12:00 to 4:00 PM"], ["Maintenance line", "24 hours"]].map(([a, b]) => `<tr><td>${a}</td><td>${b}</td></tr>`).join("")}</tbody></table>
  <ul class="ap-contact" style="margin-top:0">${[["pin", "300 Cinder Street, Eastmarch"], ["phone", "(555) 013-7740"], ["mail", "hello@cinderyard.example"]].map(([i, t]) => `<li>${ic(i, 15)}<span>${t}</span></li>`).join("")}</ul>
</div></section>
</main>
${K.footer(p, "Studios and one to three bedroom rental homes at 300 Cinder Street.", [["Homes", ["Floor plans", "Availability", "Pet policy", "How to apply"]], ["Residents", ["Resident login", "Pay rent", "Maintenance request", "Renew your lease"]], ["Fair housing", ["Equal housing opportunity", "Accessibility requests", "Screening criteria"]]], `Fictional community created for this template. Rents and availability are samples. © 2026 ${p.name}.`)}`, CSS);

module.exports = {
  "apartment-website": K.def("apartment", "Apartment community website",
    "a full apartment community home page: navigation with resident login and book a tour, a leasing hero with a building elevation where lit windows mark open homes and a stats strip, a floor plan browser with studio, one, two and three bedroom tabs showing coded floor plans, size, price from and available count, an availability table listing unit, floor, floor plan, rent and move-in date, amenities shown level by level with in-home features, a neighborhood map with walking times, how to apply in steps with a fee table and pet policy, a tour scheduler for in person or virtual visits with sample time slots, a resident login band, an faq, leasing office hours and a footer",
    ["navigation-header", "hero", "building-elevation", "floor-plans", "tabs", "availability-table", "amenities", "map", "walking-times", "steps", "fee-table", "pet-policy", "tour-scheduler", "time-slots", "login-link", "faq", "opening-hours", "footer", "apartment"], web),
};
