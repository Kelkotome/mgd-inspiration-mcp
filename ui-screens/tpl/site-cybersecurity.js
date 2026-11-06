/* Cybersecurity website template (Wardline, a fictional cloud security monitoring product for engineering teams).
   Technical, product-first home page: nav, hero headline over a full-width attack path console with severity badges,
   a coverage map across cloud accounts, identities, containers, secrets and exposed services, one finding traced from
   detection to verified fix, alert routing beside audit evidence, agentless deployment steps with the read-only role,
   how the product secures itself, pricing by asset, customer quotes, demo request form, footer.
   No real clouds, tools or standards are named. Product UI is coded HTML drawn with tokens only. */
const { ic, esc } = require("../lib");
const K = require("../sitekit");

const CSS = `<style>
.sc>.sk-sec{padding:52px 0}
.sc>.sk-sec.sk-tight{padding:44px 0}
.sc .sk-h2{font-size:calc(35px * var(--hs))}
.sc .sk-head{margin-bottom:24px}
.sc .sk-head>div:first-child{max-width:720px;gap:8px}
.sc-mono{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:.92em;letter-spacing:-.01em;overflow-wrap:anywhere}
.sc-hero{padding-top:48px;padding-bottom:0}
.sc-hhead{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,1fr);gap:56px;align-items:end;margin-bottom:40px}
.sc-hhead h1{font-size:calc(52px * var(--hs));line-height:1.04}
.sc-note{display:flex;flex-wrap:wrap;gap:6px 18px;font-size:13.5px;color:var(--muted)}
.sc-note span{display:inline-flex;align-items:center;gap:6px}
.sc-note .i{color:var(--success)}
/* console */
.sc-con{overflow:hidden;padding:0;box-shadow:var(--shadow-lg)}
.sc-bar{display:flex;align-items:center;gap:12px;padding:12px 20px;border-bottom:1px solid var(--border);font-size:13px}
.sc-bar .sc-end{margin-left:auto;color:var(--muted);display:flex;gap:16px}
.sc-live{width:8px;height:8px;border-radius:50%;background:var(--success);flex:0 0 auto}
.sc-path{display:grid;grid-template-columns:repeat(4,minmax(0,1fr) 22px) minmax(0,1fr);gap:6px;align-items:stretch;padding:20px;background:color-mix(in oklab,var(--primary) 5%,var(--bg));border-bottom:1px solid var(--border)}
.sc-node{display:grid;gap:3px;align-content:start;padding:11px 12px;border:1px solid var(--border);border-radius:var(--radius);background:var(--surface);min-width:0}
.sc-node small{font-size:11px;color:var(--muted);font-weight:600;letter-spacing:.04em;text-transform:uppercase}
.sc-node b{font-size:13.5px;line-height:1.3}
.sc-node em{font-style:normal;font-size:12.5px;color:var(--muted);line-height:1.35}
.sc-node.hot{border-color:var(--warning)}
.sc-node.tgt{border-color:var(--danger);box-shadow:inset 0 0 0 1px var(--danger)}
.sc-arr{display:grid;place-items:center;color:var(--muted)}
.sc-low{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(0,1fr)}
.sc-q{list-style:none}
.sc-q li{display:grid;grid-template-columns:78px minmax(0,1fr) auto;gap:10px;align-items:center;padding:12px 20px;border-bottom:1px solid var(--border);font-size:13.5px}
.sc-q li:last-child{border-bottom:0}
.sc-q li.on{background:color-mix(in oklab,var(--danger) 7%,var(--surface))}
.sc-q .badge{justify-self:start}
.sc-q b{display:block;font-weight:600;line-height:1.3}
.sc-q .sc-mono{color:var(--muted);font-size:12px}
.sc-q time{font-size:12.5px;color:var(--muted);white-space:nowrap}
.sc-why{padding:18px 20px;border-left:1px solid var(--border);display:grid;gap:10px;align-content:start;font-size:13.5px}
.sc-why ul{list-style:none;display:grid;gap:5px}
.sc-why li{display:flex;gap:8px;align-items:center}
.sc-why li .i{color:var(--danger)}
.sc-fix{padding:10px 12px;border-radius:var(--radius);background:color-mix(in oklab,var(--success) 10%,var(--bg));border:1px solid color-mix(in oklab,var(--success) 34%,var(--border))}
/* coverage map */
.sc-legend{display:flex;gap:16px;font-size:13px;color:var(--muted)}
.sc-legend span{display:inline-flex;align-items:center;gap:6px}
.sc-d{width:9px;height:9px;flex:0 0 auto;border-radius:2px;margin-top:6px}
.sc-legend .sc-d{margin-top:0}
.sc-d.c{background:var(--danger)}.sc-d.h{background:var(--warning)}.sc-d.m{background:color-mix(in oklab,var(--accent) 70%,var(--surface))}
.sc-map{display:grid;border-top:2px solid var(--text)}
.sc-area{display:grid;grid-template-columns:230px minmax(0,1fr);gap:24px;padding:13px 0;border-bottom:1px solid var(--border)}
.sc-ah{display:grid;grid-template-columns:36px minmax(0,1fr);gap:0 10px;align-content:start}
.sc-ico{grid-row:span 2;width:36px;height:36px;border-radius:var(--radius);display:grid;place-items:center;background:color-mix(in oklab,var(--primary) 13%,var(--bg));color:color-mix(in oklab,var(--primary) 78%,var(--text))}
.sc-ah h3{font-size:calc(18px * var(--hs));line-height:1.2}
.sc-ah p{font-size:12.5px;line-height:1.4}
.sc-area ul{list-style:none;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}
.sc-area li{display:grid;grid-template-columns:9px minmax(0,1fr);gap:9px;font-size:13.5px;line-height:1.4;align-content:start}
.sc-area li .sc-mono{display:block;color:var(--muted);font-size:12px;margin-top:2px}
/* trace */
.sc-trace{list-style:none;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:0}
.sc-trace li{position:relative;padding:24px 22px 0 0;display:grid;gap:5px;align-content:start;border-top:2px solid var(--border);font-size:14px}
.sc-trace li::before{content:"";position:absolute;top:-7px;left:0;width:12px;height:12px;border-radius:50%;background:var(--primary)}
.sc-trace li:last-child::before{background:var(--success)}
.sc-trace time{font-size:12.5px;color:var(--muted)}
.sc-trace b{font-size:15px}
.sc-trace p{color:var(--muted);line-height:1.45;font-size:13.5px}
.sc-trace span{font-size:12.5px;font-weight:600}
.sc-exits{display:grid;grid-template-columns:auto repeat(3,minmax(0,1fr));gap:28px;align-items:start;margin-top:26px;padding-top:18px;border-top:1px solid var(--border);font-size:14px}
.sc-exits>b{max-width:130px;line-height:1.3}
.sc-exits p{color:var(--muted);font-size:13.5px;line-height:1.45}
/* alerts + evidence */
.sc-duo{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:48px}
.sc-duo>div{display:grid;gap:12px;align-content:start}
.sc-panel{padding:0;overflow:hidden;margin-top:8px}
.sc-rules{width:100%;border-collapse:collapse;font-size:13.5px}
.sc-rules th{font:600 11.5px var(--font-b);letter-spacing:.05em;text-transform:uppercase;color:var(--muted);text-align:left;padding:11px 16px;border-bottom:1px solid var(--border)}
.sc-rules td{padding:11px 16px;border-bottom:1px solid var(--border);vertical-align:middle}
.sc-rules tr:last-child td{border-bottom:0}
.sc-rules td:last-child{white-space:nowrap;color:var(--muted);text-align:right}
.sc-rules th:last-child{text-align:right}
.sc-msg{display:grid;grid-template-columns:30px minmax(0,1fr);gap:10px;padding:14px 16px;border-top:1px solid var(--border);background:color-mix(in oklab,var(--primary) 4%,var(--bg));font-size:13.5px;line-height:1.45}
.sc-msg .logo{align-items:flex-start}
.sc-msg .logo b{width:28px;height:28px}
.sc-msg .btn{height:30px;font-size:12px;padding:0 10px}
.sc-ev{list-style:none}
.sc-ev li{display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:14px;align-items:center;padding:11px 16px;border-bottom:1px solid var(--border);font-size:13.5px}
.sc-ev li span{color:var(--muted);font-size:12.5px;white-space:nowrap}
.sc-ev li .i{color:var(--success)}
.sc-pack{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:14px 16px;background:color-mix(in oklab,var(--primary) 4%,var(--bg));font-size:13.5px}
/* deploy */
.sc-dep{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:56px;align-items:center}
.sc-steps{list-style:none;display:grid;gap:0;margin-top:16px}
.sc-steps li{display:grid;grid-template-columns:34px minmax(0,1fr) auto;gap:12px;padding:9px 0;border-bottom:1px solid var(--border);align-items:baseline}
.sc-steps .num{font-size:15px;color:var(--muted)}
.sc-steps span:last-child{font-size:12.5px;color:var(--muted);white-space:nowrap}
.sc-steps p{font-size:13.5px;color:var(--muted);line-height:1.45}
.sc-code{padding:0;overflow:hidden}
.sc-code>div{display:flex;justify-content:space-between;gap:12px;padding:11px 18px;border-bottom:1px solid var(--border);font-size:13px}
.sc-code pre{padding:16px 18px;font:13px/1.65 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;overflow-x:auto;color:var(--text)}
.sc-code .y{color:color-mix(in oklab,var(--success) 72%,var(--text))}
.sc-code .n{color:color-mix(in oklab,var(--danger) 78%,var(--text))}
.sc-code .k{color:var(--muted)}
/* own security */
.sc-own{padding:36px 40px;display:grid;grid-template-columns:minmax(0,1fr);gap:24px;background:var(--text);color:var(--bg);border-color:var(--text)}
.sc-own .sk-eyebrow{color:inherit;opacity:.75}
.sc-own p{opacity:.78;font-size:14px;line-height:1.5}
.sc-ohead{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,1fr);gap:40px;align-items:end}
.sc-ohead .sk-row{margin-top:10px}
.sc-own h2{margin-top:8px}
.sc-oi{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px 32px;padding-top:20px;border-top:1px solid color-mix(in oklab,var(--bg) 22%,transparent)}
.sc-oi b{display:flex;align-items:center;gap:8px;margin-bottom:4px}
/* pricing */
.sc-price{display:grid;grid-template-columns:minmax(0,.85fr) minmax(0,1.4fr);gap:56px;align-items:start}
.sc-count{list-style:none;display:grid;gap:7px;margin-top:6px;font-size:14px}
.sc-count li{display:flex;gap:9px;align-items:flex-start}
.sc-count .i{color:color-mix(in oklab,var(--primary) 78%,var(--text));margin-top:3px}
.sc-plans{padding:0;overflow:hidden}
.sc-calc{display:grid;gap:8px;padding:18px 22px;border-bottom:1px solid var(--border);font-size:14px}
.sc-calc>div{display:flex;justify-content:space-between;gap:12px;align-items:baseline}
.sc-calc input{width:100%;accent-color:var(--primary);height:20px}
.sc-plan{display:grid;grid-template-columns:minmax(0,.8fr) minmax(0,1.6fr) 130px;gap:18px;align-items:center;padding:15px 22px;border-bottom:1px solid var(--border)}
.sc-plan:last-child{border-bottom:0}
.sc-plan.on{background:color-mix(in oklab,var(--primary) 8%,var(--surface))}
.sc-plan h3{font-size:calc(19px * var(--hs))}
.sc-plan p{font-size:13.5px;color:var(--muted);line-height:1.45}
.sc-plan .num{font-size:22px;text-align:right}
.sc-plan .num small{display:block;font:500 12px var(--font-b);color:var(--muted);letter-spacing:0;margin-top:3px}
/* quotes */
.sc-quotes{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(0,1fr) minmax(0,1fr);gap:24px}
.sc-quote{padding:22px;display:grid;gap:14px;align-content:space-between}
.sc-quote p{font-size:15px;line-height:1.5}
.sc-quote:first-child p{font-family:var(--font-h);font-size:calc(20px * var(--hs));line-height:1.28;letter-spacing:var(--ls)}
.sc-by{display:flex;gap:10px;align-items:center;font-size:13px;line-height:1.35}
.sc-by .avatar{width:34px;height:34px;flex:0 0 auto}
/* demo */
.sc-demo{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.15fr);gap:56px;align-items:center}
.sc-agenda{list-style:none;display:grid;gap:0;margin-top:18px}
.sc-agenda li{display:grid;grid-template-columns:64px minmax(0,1fr);gap:12px;padding:11px 0;border-top:1px solid var(--border);font-size:14px}
.sc-form{padding:26px 28px;display:grid;gap:12px}
.sc-form .sk-g2{gap:14px}
@media (max-width:1024px){
  .sc-hhead{grid-template-columns:minmax(0,1fr);gap:20px}
  .sc-path{grid-template-columns:repeat(2,minmax(0,1fr) 22px) minmax(0,1fr)}
  .sc-path>.sc-arr:nth-of-type(3){display:none}
  .sc-area{grid-template-columns:minmax(0,1fr);gap:12px}
  .sc-trace{grid-template-columns:repeat(3,minmax(0,1fr));row-gap:28px}
  .sc-exits{grid-template-columns:repeat(3,minmax(0,1fr))}.sc-exits>b{grid-column:1/-1;max-width:none}
  .sc-duo,.sc-dep,.sc-price,.sc-demo{grid-template-columns:minmax(0,1fr);gap:36px}
  .sc-own{grid-template-columns:minmax(0,1fr);gap:28px}
  .sc-quotes{grid-template-columns:repeat(2,minmax(0,1fr))}.sc-quotes>:first-child{grid-column:1/-1}
}
@media (max-width:760px){
  .sc>.sk-sec{padding:40px 0}
  .sc>.sk-sec.sk-tight{padding:32px 0}
  .sc-hero{padding-top:28px}
  .sc-note{display:none}
  .sc-hhead{margin-bottom:26px}
  .sc-hhead h1{font-size:calc(38px * var(--hs))}
  .sc-bar{padding:11px 14px;gap:9px}
  .sc-bar .badge{white-space:nowrap}
  .sc-bar .sc-end span:not(:last-child){display:none}
  .sc-bar .sc-end{font-size:12px;white-space:nowrap}
  .sc-path{grid-template-columns:minmax(0,1fr);gap:0;padding:12px}
  .sc-node{padding:7px 10px;grid-template-columns:minmax(0,1fr) auto;gap:0 8px}
  .sc-node small{grid-column:2;grid-row:1;align-self:center;font-size:10px}
  .sc-node em{grid-column:1/-1;font-size:12px}
  .sc-path>.sc-arr:nth-of-type(3){display:grid}
  .sc-arr{height:16px;transform:rotate(90deg)}
  .sc-low{grid-template-columns:minmax(0,1fr)}
  .sc-q li{grid-template-columns:76px minmax(0,1fr);padding:10px 14px}
  .sc-q time,.sc-q li:nth-child(n+3){display:none}
  .sc-why{border-left:0;border-top:1px solid var(--border);padding:14px}
  .sc-why>b,.sc-why>ul{display:none}
  .sc .sk-head p{display:none}
  .sc-legend{flex-wrap:wrap}
  .sc-map{border-top:0}
  .sc-area{flex:0 0 84%;padding:18px;border:1px solid var(--border);border-radius:var(--radius-lg);background:var(--surface)}
  .sc-area ul{grid-template-columns:minmax(0,1fr);gap:11px}
  .sc-trace{padding-top:8px}
  .sc-trace li{padding:18px 0 0}
  .sc-exits{grid-template-columns:minmax(0,1fr);gap:6px;margin-top:16px;padding-top:14px}
  .sc-exits p{font-size:13px}
  .sc-exits>div{display:grid;grid-template-columns:96px minmax(0,1fr);gap:8px;font-size:13px}
  .sc-duo{gap:32px}
  .sc-duo>div>p{display:none}
  .sc-rules th,.sc-rules td{padding:10px 12px}
  .sc-ev li{grid-template-columns:minmax(0,1fr) auto;padding:10px 14px}
  .sc-ev li span{display:none}
  .sc-pack{flex-direction:column;align-items:flex-start}
  .sc-steps li{grid-template-columns:28px minmax(0,1fr) auto}
  .sc-steps p{display:none}
  .sc-steps li{padding:7px 0}
  .sc-code pre{font-size:12px;padding:12px 14px}
  .sc-own{padding:24px 20px;gap:18px}
  .sc-ohead{grid-template-columns:minmax(0,1fr);gap:10px}
  .sc-oi{grid-template-columns:minmax(0,1fr);gap:12px;padding-top:16px}
  .sc-oi>div:nth-child(n+4){display:none}
  .sc-plan{grid-template-columns:minmax(0,1fr) auto;gap:6px 14px;padding:16px}
  .sc-plan p{grid-column:1/-1;grid-row:2}
  .sc-calc{padding:14px 16px}
  .sc-count,.sc-cnt{display:none}
  .sc-quote:first-child p{font-size:calc(19px * var(--hs))}
  .sc-agenda{display:none}
  .sc-form>.sk-field:has(textarea){display:none}
  .sc-form{padding:22px}
}
</style>`;

const sev = (s) => s === "c" ? `<span class="badge" style="background:var(--danger);color:var(--on-danger)">Critical</span>`
  : s === "h" ? `<span class="badge" style="background:color-mix(in oklab,var(--warning) 26%,var(--surface));color:color-mix(in oklab,var(--warning) 52%,var(--text))">High</span>`
  : `<span class="badge">Medium</span>`;

const NODES = [
  ["Entry", "Internet", "Any source address"],
  ["Hop 1", "lb-public-02", "Port 8443 open to all", ""],
  ["Hop 2", "payments-api", "Critical flaw in image, fix in 2.4.1", "hot"],
  ["Hop 3", "role/payments-task", "Can assume role/ops-admin", "hot"],
  ["Target", "customers-prod", "Database tagged customer data", "tgt"],
];
const QUEUE = [
  ["c", "Internet path to customer database", "payments-api → customers-prod", "2 h", "on"],
  ["c", "Live signing key in commit history", "payments-api @ 9f3c1a2", "5 h"],
  ["h", "Admin role unused for 94 days", "role/svc-reporting", "3 d"],
  ["h", "Container running privileged with host mount", "worker-batch-7f", "6 d"],
];
const AREAS = [
  ["globe", "Cloud accounts", "Network rules, storage policies, logging state", [
    ["c", "Firewall rule lets any address reach the database port", "net/prod-core"],
    ["h", "Audit logging switched off in a staging account", "acct/staging-2"],
    ["m", "Database snapshot shared with an outside account", "snap/prod-db-0931"]]],
  ["key", "Identities", "Users, roles, service accounts, trust links", [
    ["c", "Service account holds wildcard admin on all resources", "sa/etl-runner"],
    ["h", "Deploy role can be assumed from any account in the org", "role/ci-deploy"],
    ["m", "Console user with no second factor, last login 3 days ago", "user/d.marsh"]]],
  ["grid", "Containers", "Images, registries, running workloads", [
    ["c", "Base image has a known exploited flaw, patched build exists", "registry/api-base:3.2"],
    ["h", "Workload runs as root with the host network", "worker-batch-7f"],
    ["m", "Production deploy pulled by mutable latest tag", "deploy/checkout-web"]]],
  ["lock", "Secrets", "Repositories, build logs, environment settings", [
    ["c", "Live signing key committed and still valid", "payments-api @ 9f3c1a2"],
    ["h", "Database password stored as a plain environment variable", "svc/invoice-worker"],
    ["m", "Access token printed in a build log", "pipeline job 4471"]]],
  ["eye", "Exposed services", "Public addresses, open ports, certificates", [
    ["c", "Admin dashboard on port 8080 answers with no login", "ops-panel.prod.internal"],
    ["h", "Forgotten staging host still on a public address", "stg-old-3"],
    ["m", "Certificate expires in 6 days", "api-eu.prod.internal"]]],
];
const TRACE = [
  ["09:14", "Detected", "A scan finds a signing key in a commit on payments-api.", "Automatic"],
  ["09:15", "Ranked", "The key is live and reaches production, so it goes to the top. Matches in 3 repositories merge into one finding.", "Automatic"],
  ["09:16", "Routed", "The code owner file names the Payments squad, and the on-call engineer is paged.", "Priya Nair"],
  ["11:40", "Fixed", "Key rotated and the old one revoked. The pull request links back to the finding.", "Priya Nair"],
  ["11:52", "Verified", "The next scan confirms the old key is dead and closes the finding with proof attached.", "Automatic"],
];
const QUOTES = [
  ["The first scan turned up a deploy key we had signed off as rotated in the spring. Nobody was careless. There were just too many places to look.", "Hanne Vosloo", "Head of Platform, Brightquay Freight", "HV"],
  ["We went from a spreadsheet of 2,000 findings to eleven paths that mattered. My team fixes those.", "Tobias Renwick", "Staff Engineer, Larkmoor Health Tech", "TR"],
  ["Our auditor asked for access reviews and logging proof. I sent a link instead of spending a week on screenshots.", "Adaeze Corban", "Security Lead, Fenwright Pay", "AC"],
];

const web = (p, st) => K.page(st, `${K.nav(p, ["Coverage", "Triage", "Evidence", "Pricing", "Security"], "Request a demo", "Log in")}
<main class="sc">
<section class="sk-wrap sc-hero" id="top">
  <div class="sc-hhead">
    <div class="sk-stack" style="gap:14px"><span class="sk-eyebrow">Cloud security monitoring for engineering teams</span>
      <h1>Find the way into your cloud before anyone else does</h1></div>
    <div class="sk-stack" style="gap:16px"><p class="sk-lede" style="font-size:17px">${esc(p.name)} reads your cloud accounts, identities, containers, secrets and exposed services, then shows which findings chain together into a real attack path. Your engineers get a short list to fix, not a long list to argue about.</p>
      <div class="sk-row"><a class="btn primary sk-btn-lg" href="#request-a-demo">Request a demo</a><a class="btn sk-btn-lg" href="#deployment">${ic("doc", 16)} See a sample report</a></div>
      <div class="sc-note"><span>${ic("check", 14)} Read-only role</span><span>${ic("check", 14)} No agents</span><span>${ic("check", 14)} First findings in about an hour</span></div></div>
  </div>
  <div class="card sc-con" role="img" aria-label="${esc(p.name)} console showing an attack path from the internet through a container and a role to a customer database, above a ranked findings queue">
    <div class="sc-bar"><span class="sc-live"></span><b>Attack paths</b><span class="badge" style="background:var(--danger);color:var(--on-danger)">2 critical</span><div class="sc-end"><span>Production, 3 accounts</span><span>1,204 assets</span><span>Scanned 14 min ago</span></div></div>
    <div class="sc-path">${NODES.map(([h, t, d, c], i) => `${i ? `<span class="sc-arr">${ic("arrow", 16)}</span>` : ""}<div class="sc-node ${c || ""}"><small>${h}</small><b class="sc-mono">${t}</b><em>${d}</em></div>`).join("")}</div>
    <div class="sc-low">
      <ul class="sc-q">${QUEUE.map(([s, t, a, age, on]) => `<li class="${on || ""}">${sev(s)}<div><b>${t}</b><span class="sc-mono">${a}</span></div><time>${age}</time></li>`).join("")}</ul>
      <div class="sc-why"><b>Why this ranks first</b><ul>${["Reachable from the internet", "Exploit code is public", "Ends at customer data"].map((t) => `<li>${ic("check", 14)}${t}</li>`).join("")}</ul>
        <div class="sc-fix"><b>Smallest fix.</b> Remove assume-role from <span class="sc-mono">role/payments-task</span>. One change breaks the whole path.</div>
        <div class="sk-row" style="justify-content:space-between"><span class="muted" style="font-size:12.5px">Owner: Platform squad</span><span class="btn primary" style="height:32px">Open ticket</span></div></div>
    </div>
  </div>
</section>

<section class="sk-sec" id="coverage"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">What we look at</span><h2 class="sk-h2">Five places attackers start, read together</h2><p class="muted">Most breaches are a chain of small things. A finding on its own tells you little, so ${esc(p.name)} joins all five areas into one graph.</p></div>
    <div class="sc-legend"><span><i class="sc-d c"></i>Critical</span><span><i class="sc-d h"></i>High</span><span><i class="sc-d m"></i>Medium</span></div></div>
  <div class="sc-map sk-rail">${AREAS.map(([i, n, d, fs]) => `<article class="sc-area"><div class="sc-ah"><span class="sc-ico">${ic(i, 18)}</span><h3>${n}</h3><p class="muted">${d}</p></div><ul>${fs.map(([s, t, a]) => `<li><i class="sc-d ${s}"></i><span>${t}<span class="sc-mono">${a}</span></span></li>`).join("")}</ul></article>`).join("")}</div>
</div></section>

<section class="sk-sec sk-alt" id="triage"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">Triage</span><h2 class="sk-h2">One finding, from first scan to closed</h2></div><p class="muted" style="max-width:360px">A real trail from a Tuesday morning. Every step is logged, so nobody has to ask who picked it up.</p></div>
  <ol class="sc-trace sk-rail">${TRACE.map(([t, h, d, w]) => `<li><time class="sc-mono">${t}</time><b>${h}</b><p>${d}</p><span>${w}</span></li>`).join("")}</ol>
  <div class="sc-exits"><b>Three ways out of the queue</b>${[["Fixed", "Closed only when a rescan confirms it."], ["Accepted risk", "Needs an owner, a reason and an expiry date, then it comes back."], ["False positive", "The reason is recorded and teaches the ranking for your setup."]].map(([h, d]) => `<div><b>${h}</b><p>${d}</p></div>`).join("")}</div>
</div></section>

<section class="sk-sec" id="evidence"><div class="sk-wrap sc-duo">
  <div><span class="sk-eyebrow">Alerts</span><h2 class="sk-h2">Wakes people up only when it should</h2><p class="muted">You set the rules once. Severity plus reachability decides who hears about it and how.</p>
    <div class="card sc-panel"><table class="sc-rules"><thead><tr><th>When</th><th>Goes to</th><th>Timing</th></tr></thead><tbody>
      ${[["c", "On-call pager", "Now"], ["h", "Owning team’s ticket queue", "Same day"], ["m", "Team chat digest", "Mondays"]].map(([s, g, w]) => `<tr><td>${sev(s)}</td><td>${g}</td><td>${w}</td></tr>`).join("")}</tbody></table>
      <div class="sc-msg"><div class="logo"><b></b></div><div><b>${esc(p.name)}</b> <span class="muted" style="font-size:12px">09:15</span><br>Live signing key in <span class="sc-mono">payments-api</span>. Reaches production. Owner: Payments squad.<div class="sk-row" style="gap:6px;margin-top:8px"><span class="btn primary">Open finding</span><span class="btn">Acknowledge</span></div></div></div></div></div>
  <div><span class="sk-eyebrow">Audit evidence</span><h2 class="sk-h2">Evidence for common security frameworks</h2><p class="muted">Each scan saves dated proof of how things were configured, so the audit request is a download and not a project.</p>
    <div class="card sc-panel"><ul class="sc-ev">${[["Access reviews", "412 identities"], ["Logging enabled", "All 3 accounts"], ["Encryption at rest", "86 data stores"], ["Vulnerability handling", "Fix times by severity"]].map(([t, d]) => `<li><b style="font-weight:500">${t}</b><span>${d}</span>${ic("check", 15)}</li>`).join("")}</ul>
      <div class="sc-pack"><div><b>Evidence pack, July to September</b><div class="muted" style="font-size:12.5px">Dated records, ready for your auditor</div></div><span class="btn">${ic("download", 14)} Export</span></div></div></div>
</div></section>

<section class="sk-sec sk-alt" id="deployment"><div class="sk-wrap sc-dep">
  <div><span class="sk-eyebrow">Deployment</span><h2 class="sk-h2" style="margin-top:12px">Agentless. One read-only role per account.</h2>
    <ol class="sc-steps">${[["Add the role", "Run our template in each account. It creates one read-only role.", "5 min"], ["Connect it", "Paste the role ID into the console. No host changes, no sidecars.", "2 min"], ["Let it scan", "The first scan maps assets and finds attack paths.", "About 1 h"], ["Choose where alerts go", "Point critical findings at your pager and the rest at your ticket queue.", "10 min"]].map(([h, d, t], i) => `<li><span class="num">${i + 1}</span><div><b>${h}</b><p>${d}</p></div><span>${t}</span></li>`).join("")}</ol></div>
  <div class="card sc-code"><div><b>What the role can and cannot do</b><span class="muted sc-mono">read-only</span></div>
<pre><span class="k">role:</span> ${esc(p.name.toLowerCase())}-reader
<span class="k">allow:</span>
<span class="y">  - "*:list"
  - "*:describe"
  - "*:get-config"</span>
<span class="k">deny:</span>
<span class="n">  - "*:write"
  - "*:delete"
  - "storage:read-object"
  - "database:read-rows"</span></pre></div>
</div></section>

<section class="sk-sec sk-tight" id="security"><div class="sk-wrap"><div class="card feat sc-own">
  <div class="sc-ohead"><div><span class="sk-eyebrow">Our own security</span><h2 class="sk-h2">You are trusting us with a map of your cloud</h2></div><div><p>So here is how we look after it. Ask for the full security pack and we will send it under NDA.</p><div class="sk-row"><a class="btn" href="#">${ic("lock", 14)} Request the security pack</a></div></div></div>
  <div class="sc-oi">${[["We never see your data", "The role cannot read stored objects or database rows. We keep configuration metadata only."], ["Short-lived access", "Each scan uses credentials that expire within 15 minutes. No standing keys."], ["Separated by customer", "Your findings sit in their own store with their own encryption key."], ["Removal is yours", "Delete the role and our access ends at once. Metadata is erased within 30 days."], ["Tested from outside", "An independent firm tests the product every year, and we share the summary."], ["Report a flaw", "security@wardline.example. A person replies within one working day."]].map(([h, d]) => `<div><b>${h}</b><p>${d}</p></div>`).join("")}</div>
</div></div></section>

<section class="sk-sec" id="pricing"><div class="sk-wrap sc-price">
  <div class="sk-stack" style="gap:12px"><span class="sk-eyebrow">Pricing</span><h2 class="sk-h2">Priced by asset, not by engineer</h2><p class="muted">Add everyone who needs a login. You pay for what we watch.</p>
    <b class="sc-cnt" style="margin-top:6px">What counts as an asset</b>
    <ul class="sc-count">${["A virtual machine or running workload", "A container image in use", "A storage bucket or database", "A public address or load balancer"].map((t) => `<li>${ic("check", 14)}<span>${t}</span></li>`).join("")}</ul>
    <p class="muted sc-cnt" style="font-size:13.5px">Identities and secrets are not counted.</p></div>
  <div class="card sc-plans">
    <div class="sc-calc"><div><label for="sc-assets"><b>Assets you run</b></label><b class="num" style="font-size:18px">1,200</b></div><input type="range" id="sc-assets" min="100" max="5000" step="100" value="1200" aria-label="Assets you run"></div>
    ${[["Starter", "Up to 500 assets. All five areas, weekly scans, email alerts.", "$490", "per month"], ["Growth", "Up to 2,500 assets. Daily scans, attack paths, pager and ticket routing, evidence packs.", "$1,450", "per month", "on"], ["Scale", "Over 2,500 assets. Hourly scans, single sign-on, a named security engineer.", "Talk to us", "annual contract"]].map(([n, d, pr, u, on]) => `<div class="sc-plan ${on || ""}"><div><h3>${n}</h3>${on ? `<span class="badge" style="margin-top:6px">Fits 1,200 assets</span>` : ""}</div><p>${d}</p><div class="num">${pr}<small>${u}</small></div></div>`).join("")}
  </div>
</div></section>

<section class="sk-sec sk-alt sk-tight" id="customers"><div class="sk-wrap"><div class="sc-quotes sk-rail">${QUOTES.map(([q, n, r, i]) => `<figure class="card sc-quote"><p>“${q}”</p><figcaption class="sc-by"><span class="avatar">${i}</span><span><b>${n}</b><br><span class="muted">${r}</span></span></figcaption></figure>`).join("")}</div></div></section>

<section class="sk-sec" id="request-a-demo"><div class="sk-wrap sc-demo">
  <div><span class="sk-eyebrow">Request a demo</span><h2 class="sk-h2" style="margin-top:12px">Thirty minutes with an engineer, not a script</h2>
    <ol class="sc-agenda">${[["10 min", "We walk through a live attack path in a sample environment."], ["10 min", "Your questions on the read-only role, data handling and rollout."], ["10 min", "We work out together whether it fits your setup. If it does not, we will say so."]].map(([t, d]) => `<li><b class="num" style="font-size:14px">${t}</b><span class="muted">${d}</span></li>`).join("")}</ol></div>
  <form class="card sc-form" aria-label="Request a demo">
    <div class="sk-g2"><div class="sk-field"><label for="sc-name">Full name</label><input class="sk-input" id="sc-name" value="Lin Park"></div><div class="sk-field"><label for="sc-mail">Work email</label><input class="sk-input" id="sc-mail" value="lin@northcove.example"></div></div>
    <div class="sk-g2"><div class="sk-field"><label for="sc-accts">Cloud accounts</label><select class="sk-input" id="sc-accts"><option>4 to 10</option><option>1 to 3</option><option>11 to 50</option><option>More than 50</option></select></div><div class="sk-field"><label for="sc-why">Main reason</label><select class="sk-input" id="sc-why"><option>Upcoming audit</option><option>Too many findings today</option><option>Customer security review</option><option>Recent incident</option></select></div></div>
    <div class="sk-field"><label for="sc-note">Anything we should prepare?</label><textarea class="sk-input" id="sc-note" rows="2">We run most workloads in containers across two regions.</textarea></div>
    <button class="btn primary sk-btn-lg" type="button">Request a demo</button>
    <p class="muted" style="font-size:13px">We reply within one working day. Prefer to talk? (555) 014-2230</p>
  </form>
</div></section>
</main>
${K.footer(p, "Cloud security monitoring for engineering teams. Read-only, agentless and built around attack paths.", [["Product", ["Coverage", "Attack paths", "Audit evidence", "Pricing"]], ["Trust", ["Security overview", "Report a flaw", "System status", "Subprocessors"]], ["Company", ["About", "Careers", "hello@wardline.example", "(555) 014-2230"]]], `© 2026 ${p.name}. Fictional company created for this template.`)}`, CSS);

module.exports = {
  "cybersecurity-website": K.def("secsite", "Cybersecurity website",
    "a full cybersecurity product home page: navigation with log in and request a demo, a hero headline above a full-width console with an attack path from the internet to a customer database, a ranked findings queue with critical, high and medium severity badges and the smallest fix, a coverage map of example findings across cloud accounts, identities, containers, secrets and exposed services, one finding traced from detection to verified fix, alert routing rules with a sample chat alert beside dated audit evidence, agentless deployment steps with a read-only role definition, a dark section on how the product secures itself, pricing by asset with an asset slider, fictional customer quotes, a demo request form and a footer",
    ["navigation-header", "hero", "product-mockup", "attack-graph", "findings-table", "severity-badges", "coverage-map", "timeline", "alert-rules", "audit-evidence", "steps", "code-block", "security-section", "pricing-table", "slider", "testimonials", "contact-form", "footer", "cybersecurity"], web),
};
