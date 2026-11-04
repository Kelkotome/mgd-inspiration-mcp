/* SaaS landing page template (Patchbay — fictional API monitoring for small engineering teams; same product world as
   tpl/sections-a/b/c.js). Full responsive home page: nav, hero with a live monitor dashboard, logo-free social proof in
   team-size figures, bento feature grid, how it works with a config snippet, integrations list (generic names), pricing
   tiers with a billing toggle, FAQ, closing sign-up CTA, footer. Product UI is drawn with tokens only. */
const { ic, esc } = require("../lib");
const K = require("../sitekit");

const CSS = `<style>
.sa-hero{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);gap:56px;align-items:center;padding-top:72px;padding-bottom:80px}
.sa-hero h1{font-size:calc(58px * var(--hs));line-height:1.03}
.sa-pill{display:inline-flex;align-items:center;gap:8px;padding:5px 12px 5px 6px;border:1px solid var(--border);border-radius:999px;font-size:13px;font-weight:500;background:var(--surface)}
.sa-pill .badge{font-size:11px}
.sa-signup{display:flex;gap:10px;width:100%;max-width:500px}
.sa-signup .sk-field{flex:1}
.sa-signup label{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
.sa-ui{padding:0;overflow:hidden;box-shadow:var(--shadow-lg)}
.sa-ui-top{display:flex;align-items:center;gap:10px;padding:14px 18px;border-bottom:1px solid var(--border)}
.sa-dot{width:8px;height:8px;border-radius:50%;background:var(--success);flex:none}
.sa-dot.warn{background:var(--warning)}.sa-dot.bad{background:var(--danger)}
.sa-kpis{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));border-bottom:1px solid var(--border)}
.sa-kpis>div{padding:14px 18px;display:grid;gap:2px}
.sa-kpis>div+div{border-left:1px solid var(--border)}
.sa-kpis span{font-size:12px;color:var(--muted)}
.sa-mon{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,1.6fr) 64px;gap:14px;align-items:center;padding:12px 18px;border-bottom:1px solid var(--border);font-size:13.5px}
.sa-mon:last-child{border-bottom:0}
.sa-mon b{font-weight:600;display:flex;gap:8px;align-items:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sa-bars{display:flex;gap:2px;height:22px;align-items:stretch}
.sa-bars i{flex:1;border-radius:2px;background:color-mix(in oklab,var(--success) 75%,var(--surface))}
.sa-bars i.w{background:var(--warning)}.sa-bars i.d{background:var(--danger)}
.sa-ms{text-align:right;font-size:13px}
.sa-alert{display:flex;gap:10px;align-items:center;padding:12px 18px;background:color-mix(in oklab,var(--warning) 14%,var(--surface));font-size:13px;border-top:1px solid var(--border)}
.sa-proof{display:grid;grid-template-columns:minmax(0,1.1fr) repeat(4,minmax(0,1fr));gap:0;align-items:stretch}
.sa-proof>div{padding:4px 28px;display:grid;gap:4px;align-content:start}
.sa-proof>div+div{border-left:1px solid var(--border)}
.sa-proof>div:first-child{padding-left:0}
.sa-proof .num{font-size:34px}
.sa-bento{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));grid-auto-rows:minmax(0,auto);gap:20px}
.sa-tile{padding:26px;display:grid;gap:10px;align-content:start}
.sa-tile.wide{grid-column:span 2}
.sa-tile .sa-ic{width:38px;height:38px;border-radius:var(--radius);display:grid;place-items:center;background:color-mix(in oklab,var(--primary) 14%,var(--surface));color:color-mix(in oklab,var(--primary) 75%,var(--text))}
.sa-map{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:8px;margin-top:8px}
.sa-map>div{padding:10px;border:1px solid var(--border);border-radius:var(--radius);font-size:12px;display:grid;gap:2px;background:var(--bg)}
.sa-oncall{display:grid;gap:6px;margin-top:6px}
.sa-oncall>div{display:grid;grid-template-columns:30px minmax(0,1fr) auto;gap:10px;align-items:center;font-size:13px}
.sa-oncall .avatar{width:28px;height:28px;font-size:11px}
.sa-how{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.1fr);gap:56px;align-items:start}
.sa-steps{display:grid;gap:0}
.sa-step{display:grid;grid-template-columns:44px minmax(0,1fr);gap:16px;padding:20px 0;border-bottom:1px solid var(--border)}
.sa-step:first-child{padding-top:0}
.sa-n{width:36px;height:36px;border-radius:50%;border:1px solid var(--border);display:grid;place-items:center;font-weight:600;font-size:14px;background:var(--bg)}
.sa-step.on .sa-n{background:var(--primary);border-color:var(--primary);color:var(--on-primary)}
.sa-code{padding:0;overflow:hidden;font-family:ui-monospace,Menlo,monospace;font-size:13px;line-height:1.75}
.sa-code-top{display:flex;gap:16px;padding:12px 18px;border-bottom:1px solid var(--border);font-family:var(--font-b);font-size:13px;color:var(--muted)}
.sa-code-top b{color:var(--text);font-weight:600}
.sa-code pre{margin:0;padding:18px;white-space:pre-wrap;word-break:break-word;color:var(--text)}
.sa-code .k{color:color-mix(in oklab,var(--primary) 78%,var(--text))}
.sa-code .c{color:var(--muted)}
.sa-ints{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}
.sa-int{display:grid;grid-template-columns:38px minmax(0,1fr);gap:12px;align-items:center;padding:14px 16px}
.sa-int .sa-ic{width:38px;height:38px;border-radius:var(--radius);display:grid;place-items:center;border:1px solid var(--border);background:var(--bg)}
.sa-int b{display:block;font-size:14.5px}
.sa-int span{font-size:12.5px;color:var(--muted)}
.sa-toggle{display:inline-flex;padding:4px;border:1px solid var(--border);border-radius:999px;background:var(--surface);font-size:14px;font-weight:600}
.sa-toggle span{padding:7px 16px;border-radius:999px}
.sa-toggle span.on{background:var(--text);color:var(--bg)}
.sa-plans{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px;align-items:stretch}
.sa-plan{padding:28px;display:grid;gap:14px;align-content:start}
.sa-plan.pop{border-color:var(--primary);box-shadow:0 0 0 1px var(--primary),var(--shadow)}
.sa-plan ul{list-style:none;display:grid;gap:8px;font-size:14px;padding-top:14px;border-top:1px solid var(--border)}
.sa-plan li{display:flex;gap:8px;align-items:flex-start}
.sa-plan li .i{flex:none;margin-top:3px;color:color-mix(in oklab,var(--success) 80%,var(--text))}
.sa-faq{display:grid;grid-template-columns:minmax(0,.8fr) minmax(0,1.2fr);gap:64px;align-items:start}
.sa-faq details{border-bottom:1px solid var(--border);padding:16px 0}
.sa-faq details:first-child{border-top:1px solid var(--border)}
.sa-faq summary{list-style:none;display:flex;justify-content:space-between;gap:16px;font-weight:600;cursor:pointer}
.sa-faq summary::-webkit-details-marker{display:none}
.sa-faq details p{color:var(--muted);margin-top:10px;font-size:14.5px}
.sa-cta{padding:56px;display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);gap:48px;align-items:center;background:var(--text);color:var(--bg);border-color:var(--text)}
.sa-cta .sa-sub{color:color-mix(in oklab,var(--bg) 72%,transparent)}
.sa-cta form{display:grid;gap:12px}
.sa-cta label{font-size:13px;font-weight:500}
.sa-cta .sk-input{background:color-mix(in oklab,var(--bg) 10%,var(--text));border-color:color-mix(in oklab,var(--bg) 30%,transparent);color:var(--bg)}
@media (max-width:1024px){
  .sa-proof{grid-template-columns:repeat(2,minmax(0,1fr));gap:20px}
  .sa-proof>div{padding:0}.sa-proof>div+div{border-left:0}
  .sa-proof>div:first-child{grid-column:1/-1}
  .sa-ints{grid-template-columns:repeat(3,minmax(0,1fr))}
  .sa-map{grid-template-columns:repeat(3,minmax(0,1fr))}
}
@media (max-width:760px){
  .sa-hero{grid-template-columns:minmax(0,1fr);gap:32px;padding-top:32px;padding-bottom:52px}
  .sa-hero h1{font-size:calc(38px * var(--hs))}
  .sa-signup{flex-direction:column}
  .sa-mon{grid-template-columns:minmax(0,1fr) 92px 54px;gap:10px;padding:11px 14px;font-size:13px}
  .sa-mon:nth-child(n+7){display:none}
  .sa-ui-top .badge,.sa-reg{display:none!important}
  .sa-bars i:nth-child(-n+14){display:none}
  .sa-kpis>div{padding:12px 14px}
  .sa-ui-top{padding:12px 14px}
  .sa-proof .num{font-size:28px}
  .sa-bento{grid-template-columns:minmax(0,1fr);gap:14px}
  .sa-tile.wide{grid-column:auto}
  .sa-tile{padding:22px}
  .sa-tile.sa-m-hide{display:none}
  .sa-how{grid-template-columns:minmax(0,1fr);gap:28px}
  .sa-code{font-size:12px}
  .sa-ints{grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:10px}
  .sa-int{grid-template-columns:minmax(0,1fr);gap:8px;padding:12px}
  .sa-int span{display:none}
  .sa-int:nth-child(n+9){display:none}
  .sa-plans{display:flex;scroll-padding-inline:20px}
  .sa-faq{grid-template-columns:minmax(0,1fr);gap:20px}
  .sa-faq details:nth-child(n+5){display:none}
  .sa-cta{grid-template-columns:minmax(0,1fr);padding:28px 22px;gap:24px}
}
</style>`;

const MONITORS = [["POST /v1/payments", "ok", 142], ["GET /v1/orders", "ok", 88], ["auth.api /token", "warn", 412], ["GET /v1/search", "ok", 121], ["webhooks.out", "ok", 64], ["GraphQL /graphql", "ok", 176]];
const bars = (rnd, state) => Array.from({ length: 30 }, (_, i) => { const r = rnd(); const c = state === "warn" && i > 26 ? "w" : r > .97 ? "d" : r > .93 ? "w" : ""; return `<i class="${c}"></i>`; }).join("");

const FAQS = [
  ["How often are endpoints checked?", "Every 30 seconds on Team and Scale, every 5 minutes on Hobby. Each check runs from at least three regions and we only alert when two agree, so one flaky hop never pages anyone."],
  ["Can it check APIs behind authentication?", "Yes. Add headers, bearer tokens or a client-credentials step. Secrets are encrypted and never shown again after saving."],
  ["What counts as a monitor?", "One URL or one multi-step check, tested from every region you pick. Regions don’t multiply the count."],
  ["Do you store response bodies?", "Only the first 4 KB of a failing response, kept for 30 days so you can see what broke."],
  ["Can we host the status page on our domain?", "On Team and Scale. Point a CNAME at us and certificates renew automatically."],
  ["What happens if we go over the limit?", "Nothing stops. We email the account owner and you can upgrade or pause monitors within 14 days."],
];

const web = (p, st, rnd) => K.page(st, `${K.nav(p, ["Product", "How it works", "Integrations", "Pricing", "Docs"], "Start free", "Log in")}
<main>
<section class="sk-wrap sa-hero" id="top">
  <div class="sk-stack" style="gap:22px">
    <span class="sa-pill"><span class="badge">New</span> Multi-step checks for checkout flows ${ic("arrow", 14)}</span>
    <h1>Know your API is down before your customers do</h1>
    <p class="sk-lede">${esc(p.name)} checks every endpoint from six regions every 30 seconds, pages whoever is on call, and keeps your status page in step with reality.</p>
    <form class="sa-signup" aria-label="Start free" id="start-free"><div class="sk-field"><label for="sa-mail">Work email</label><input class="sk-input" id="sa-mail" placeholder="you@company.example"></div><button class="btn primary sk-btn-lg" type="button">Start free</button></form>
    <p class="muted" style="font-size:13.5px">Free for 5 monitors. No card, no agent to install.</p>
  </div>
  <div class="card sa-ui" role="img" aria-label="${esc(p.name)} dashboard showing six API monitors with uptime bars and response times">
    <div class="sa-ui-top"><b>Production APIs</b><span class="badge">6 monitors</span><span class="muted sa-reg" style="margin-left:auto;font-size:12.5px;display:flex;gap:6px;align-items:center">${ic("globe", 14)} 6 regions · 30 s</span></div>
    <div class="sa-kpis"><div><span>Uptime, 30 days</span><b class="num" style="font-size:22px">99.982%</b></div><div><span>Median response</span><b class="num" style="font-size:22px">118 ms</b></div><div><span>Open incidents</span><b class="num" style="font-size:22px">1</b></div></div>
    ${MONITORS.map(([n, s, ms]) => `<div class="sa-mon"><b><span class="sa-dot ${s === "warn" ? "warn" : ""}"></span>${n}</b><div class="sa-bars">${bars(rnd, s)}</div><span class="num sa-ms">${ms} ms</span></div>`).join("")}
    <div class="sa-alert">${ic("bell", 15)}<span><b>auth.api /token</b> slower than 400 ms from 3 regions · Sam Achebe paged 2 min ago</span></div>
  </div>
</section>

<section class="sk-sec sk-tight sk-alt"><div class="sk-wrap sa-proof">
  <div><b style="font-size:17px">Built for teams of 3 to 50 engineers</b><span class="muted" style="font-size:14px">Figures from accounts active in October 2026.</span></div>
  ${[["2,400+", "teams monitoring"], ["11", "median engineers per team"], ["4 min", "median time to acknowledge"], ["38%", "fewer pages after alert grouping"]].map(([n, l]) => `<div><span class="num">${n}</span><span class="muted" style="font-size:14px">${l}</span></div>`).join("")}
</div></section>

<section class="sk-sec" id="product"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">Product</span><h2 class="sk-h2">One tool for checks, alerts and the status page</h2></div><p class="muted" style="max-width:400px">No dashboards to build. Paste a URL, choose who gets paged, and the rest is set up for you.</p></div>
  <div class="sa-bento">
    <article class="card sa-tile wide"><span class="sa-ic">${ic("globe", 18)}</span><h3 class="sk-h3">Checks from six regions</h3><p class="muted">HTTP, TCP and GraphQL checks with assertions on status, body and headers. Alerts only fire when two regions agree.</p>
      <div class="sa-map">${[["Frankfurt", "96 ms"], ["Virginia", "104 ms"], ["Oregon", "131 ms"], ["São Paulo", "188 ms"], ["Mumbai", "212 ms"], ["Sydney", "246 ms"]].map(([r, m]) => `<div><span class="muted">${r}</span><b class="num" style="font-size:14px">${m}</b></div>`).join("")}</div></article>
    <article class="card sa-tile"><span class="sa-ic">${ic("users", 18)}</span><h3 class="sk-h3">On-call that follows the rota</h3><p class="muted">Weekly rotations, overrides and escalation after 5 minutes.</p>
      <div class="sa-oncall">${[["SA", "Sam Achebe", "Now"], ["LP", "Lin Park", "From Mon"]].map(([a, n, w]) => `<div><span class="avatar">${a}</span><span>${n}</span><span class="badge">${w}</span></div>`).join("")}</div></article>
    <article class="card sa-tile"><span class="sa-ic">${ic("doc", 18)}</span><h3 class="sk-h3">A status page that updates itself</h3><p class="muted">Incidents open and close from your monitors. Subscribers get email when it matters.</p></article>
    <article class="card sa-tile sa-m-hide"><span class="sa-ic">${ic("link", 18)}</span><h3 class="sk-h3">Multi-step checks</h3><p class="muted">Log in, create an order, refund it. Up to 8 steps with values passed between requests.</p></article>
    <article class="card sa-tile sa-m-hide"><span class="sa-ic">${ic("lock", 18)}</span><h3 class="sk-h3">Certificates and domains</h3><p class="muted">Warnings 21 days before a TLS certificate or domain expires.</p></article>
  </div>
</div></section>

<section class="sk-sec sk-alt" id="how-it-works"><div class="sk-wrap sa-how">
  <div class="sk-stack" style="gap:18px;justify-items:stretch"><span class="sk-eyebrow">How it works</span><h2 class="sk-h2">From URL to first alert in about two minutes</h2>
    <div class="sa-steps">${[["Add an endpoint", "Paste a URL or import your OpenAPI file. We suggest checks for every route."], ["Pick who gets paged", "Choose a rota or a person, and the channels: chat, pager, SMS or email."], ["Keep it in your repo", "Export monitors as a config file and review changes in pull requests like any other code."]].map(([t, d], i) => `<div class="sa-step ${i === 0 ? "on" : ""}"><span class="sa-n">${i + 1}</span><div><h3 class="sk-h3" style="font-size:calc(18px * var(--hs))">${t}</h3><p class="muted" style="font-size:14.5px">${d}</p></div></div>`).join("")}</div></div>
  <div class="card sa-code" role="img" aria-label="Monitor configuration file"><div class="sa-code-top"><b>monitors.yml</b><span>checks/</span><span style="margin-left:auto">${ic("check", 14)} Synced 1 min ago</span></div>
<pre><span class="c"># Payments API, checked from three regions</span>
<span class="k">monitor</span>: payments-create
  <span class="k">request</span>: POST https://api.example.com/v1/payments
  <span class="k">every</span>: 30s
  <span class="k">regions</span>: [frankfurt, virginia, sydney]
  <span class="k">assert</span>:
    - status == 201
    - body.id exists
    - latency &lt; 400ms
  <span class="k">alert</span>:
    <span class="k">rota</span>: backend-on-call
    <span class="k">after</span>: 2 regions fail
    <span class="k">channels</span>: [chat, pager]</pre></div>
</div></section>

<section class="sk-sec sk-tight" id="integrations"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">Integrations</span><h2 class="sk-h2">Alerts go where your team already looks</h2></div><a class="btn sk-btn-lg" href="#">Read the docs ${ic("arrow", 16)}</a></div>
  <div class="sa-ints">${[["chat", "Team chat", "Acknowledge from the channel"], ["phone", "Pager & SMS", "Calls after 5 min unanswered"], ["mail", "Email", "Digest or per-incident"], ["bolt", "Webhooks", "Signed JSON payloads"], ["edit", "Issue tracker", "Open a ticket per incident"], ["calendar", "Calendar", "Rota as a shared calendar"], ["download", "Metrics export", "Prometheus-format endpoint"], ["key", "Single sign-on", "SAML and SCIM on Scale"]].map(([i, t, d]) => `<div class="card sa-int"><span class="sa-ic">${ic(i, 18)}</span><div><b>${t}</b><span>${d}</span></div></div>`).join("")}</div>
</div></section>

<section class="sk-sec sk-alt" id="pricing"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">Pricing</span><h2 class="sk-h2">Priced per monitor, not per seat</h2></div><div class="sa-toggle" role="tablist"><span class="on" role="tab" aria-selected="true">Monthly</span><span role="tab">Yearly, 2 months free</span></div></div>
  <div class="sa-plans sk-rail">${[["Hobby", "$0", "For side projects", ["5 monitors, 5-minute checks", "Email alerts", "1 public status page"], "Start free", ""], ["Team", "$49", "For teams on call", ["50 monitors, 30-second checks", "On-call rotas and escalation", "3 status pages on your domain", "1 year of history"], "Start 14-day trial", "pop"], ["Scale", "$199", "For multi-region APIs", ["250 monitors, multi-step checks", "SSO, SCIM and audit log", "Unlimited status pages", "2 years of history"], "Talk to us", ""]].map(([n, pr, d, f, cta, c]) => `<article class="card sa-plan ${c}"><div class="sk-row" style="justify-content:space-between"><h3 class="sk-h3">${n}</h3>${c ? `<span class="badge">Most popular</span>` : ""}</div><div><span class="num" style="font-size:38px">${pr}</span><span class="muted"> / month</span></div><p class="muted" style="font-size:14px">${d}</p><a class="btn ${c ? "primary" : ""} block" href="#">${cta}</a><ul>${f.map((x) => `<li>${ic("check", 15)}<span>${x}</span></li>`).join("")}</ul></article>`).join("")}</div>
</div></section>

<section class="sk-sec sk-tight" id="docs"><div class="sk-wrap sa-faq">
  <div class="sk-stack" style="gap:14px"><span class="sk-eyebrow">FAQ</span><h2 class="sk-h2">Questions teams ask before switching</h2><p class="muted">Billing, security and data retention are covered in the docs. Or email support@patchbay.example and an engineer replies.</p></div>
  <div>${FAQS.map(([q, a], i) => `<details ${i === 0 ? "open" : ""}><summary>${esc(q)}<span class="muted">${ic(i === 0 ? "minus" : "plus", 18)}</span></summary><p>${esc(a)}</p></details>`).join("")}</div>
</div></section>

<section class="sk-sec sk-tight"><div class="sk-wrap"><div class="card feat sa-cta">
  <div class="sk-stack" style="gap:12px"><h2 class="sk-h2">Stop hearing about outages from customers</h2><p class="sa-sub" style="font-size:16px">Add your first endpoint in two minutes. Checks start from six regions straight away.</p></div>
  <form aria-label="Create an account"><label for="sa-cta-mail">Work email</label><input class="sk-input" id="sa-cta-mail" value="lin.park@company.example"><button class="btn primary sk-btn-lg" type="button">Create free account</button><span class="sa-sub" style="font-size:13px">5 monitors free, forever. Upgrade when you need more.</span></form>
</div></div></section>
</main>
${K.footer(p, "API monitoring, on-call and status pages for small engineering teams.", [["Product", ["Checks", "On-call", "Status pages", "Changelog"]], ["Developers", ["Docs", "API reference", "Config files", "System status"]], ["Company", ["About", "Security", "Careers", "Contact"]]])}`, CSS);

module.exports = {
  "saas-landing-page": K.def("marketing", "SaaS landing page",
    "a full SaaS landing page for an API monitoring product: navigation with log in and start free, a hero with an email sign-up and a live dashboard of monitors with uptime bars, response times and an alert, a social-proof band of team-size figures, a bento feature grid with regions and an on-call rota, how it works steps beside a config file, an integrations grid of alert channels, three pricing tiers with a monthly/yearly toggle, an FAQ accordion, a dark sign-up CTA and a footer",
    ["navigation-header", "hero", "signup-form", "dashboard", "status-bars", "stats", "social-proof", "feature-grid", "bento-grid", "steps", "code-block", "integrations", "pricing", "toggle", "faq", "accordion", "cta-banner", "footer", "saas", "developer-tools"], web),
};
