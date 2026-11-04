/* AI startup website template (Lumen Desk — fictional AI research assistant for analysts). Full responsive home page:
   nav, centred hero with a prompt-box demo and a cited answer, use cases, how it cites sources (answer + source excerpts),
   security & data-handling facts, workflow steps, pricing, FAQ, waitlist sign-up, footer. No model-vendor or certification
   claims. Product UI is drawn with tokens only. */
const { ic, esc } = require("../lib");
const K = require("../sitekit");

const CSS = `<style>
.ai-hero{padding-top:60px;padding-bottom:64px;display:grid;justify-items:center;text-align:center;gap:20px}
.ai-hero h1{font-size:calc(62px * var(--hs));line-height:1.02;max-width:900px}
.ai-hero .sk-lede{margin:0 auto}
.ai-demo{width:100%;max-width:920px;margin-top:20px;padding:0;overflow:hidden;text-align:left;box-shadow:var(--shadow-lg)}
.ai-prompt{display:flex;gap:12px;align-items:flex-start;padding:18px 20px;border-bottom:1px solid var(--border)}
.ai-prompt textarea{flex:1;border:0;background:transparent;resize:none;font:inherit;font-size:16px;color:var(--text);min-height:48px;line-height:1.5;outline:none}
.ai-prompt label{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
.ai-chips{display:flex;flex-wrap:wrap;gap:8px;padding:12px 20px;border-bottom:1px solid var(--border);font-size:13px}
.ai-chip{display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 12px;border:1px solid var(--border);border-radius:999px;background:var(--bg);color:var(--muted);font-weight:500}
.ai-chip.on{color:var(--text);border-color:color-mix(in oklab,var(--primary) 55%,var(--border));background:color-mix(in oklab,var(--primary) 10%,var(--bg))}
.ai-ans{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(0,1fr);gap:0}
.ai-ans>div{padding:20px 22px}
.ai-ans>div+div{border-left:1px solid var(--border);background:color-mix(in oklab,var(--surface) 60%,var(--bg))}
.ai-ans p{font-size:15px;line-height:1.65}
.ai-ref{display:inline-grid;place-items:center;min-width:20px;height:18px;padding:0 5px;margin:0 2px;border-radius:5px;font:600 11px var(--font-b);vertical-align:2px;background:color-mix(in oklab,var(--primary) 16%,var(--surface));color:color-mix(in oklab,var(--primary) 70%,var(--text))}
.ai-src{display:grid;grid-template-columns:24px minmax(0,1fr);gap:10px;padding:10px 0;border-bottom:1px solid var(--border);font-size:13px}
.ai-src:last-child{border-bottom:0}
.ai-src b{display:block;font-size:13.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ai-uses{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:0;border-top:2px solid var(--text)}
.ai-use{padding:24px 24px 4px 0;display:grid;gap:10px;align-content:start}
.ai-use+.ai-use{padding-left:24px;border-left:1px solid var(--border)}
.ai-use .ai-q{font-size:13.5px;padding:10px 12px;border-radius:var(--radius);background:var(--surface);border:1px solid var(--border);font-style:italic}
.ai-cite{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:56px;align-items:center}
.ai-doc{padding:0;overflow:hidden}
.ai-doc-top{display:flex;gap:10px;align-items:center;padding:12px 18px;border-bottom:1px solid var(--border);font-size:13px}
.ai-doc-b{padding:20px 22px;display:grid;gap:10px;font-size:14px;color:var(--muted);line-height:1.7}
.ai-doc-b mark{background:color-mix(in oklab,var(--warning) 30%,var(--surface));color:var(--text);padding:1px 2px;border-radius:3px}
.ai-doc-foot{display:flex;justify-content:space-between;gap:10px;padding:12px 18px;border-top:1px solid var(--border);font-size:12.5px;color:var(--muted)}
.ai-rules{list-style:none;display:grid;gap:14px;width:100%}
.ai-rules li{display:grid;grid-template-columns:32px minmax(0,1fr);gap:14px;align-items:start}
.ai-rules .ai-ic{width:32px;height:32px;border-radius:var(--radius);display:grid;place-items:center;background:color-mix(in oklab,var(--primary) 14%,var(--surface));color:color-mix(in oklab,var(--primary) 75%,var(--text))}
.ai-rules p{color:var(--muted);font-size:14.5px}
.ai-sec{padding:40px 44px;display:grid;grid-template-columns:minmax(0,.8fr) minmax(0,1.6fr);gap:48px;background:var(--text);color:var(--bg);border-color:var(--text)}
.ai-sec .ai-sub{color:color-mix(in oklab,var(--bg) 70%,transparent)}
.ai-facts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0}
.ai-facts>div{padding:15px 20px;border-top:1px solid color-mix(in oklab,var(--bg) 22%,transparent);display:grid;gap:4px}
.ai-facts>div:nth-child(odd){padding-left:0;padding-right:28px}
.ai-facts>div:nth-child(even){border-left:1px solid color-mix(in oklab,var(--bg) 22%,transparent);padding-left:28px}
.ai-facts b{font-size:15.5px}
.ai-facts span{font-size:14px;color:color-mix(in oklab,var(--bg) 70%,transparent)}
.ai-flow{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;align-items:stretch}
.ai-fstep{padding:22px;display:grid;gap:10px;align-content:start;position:relative}
.ai-fstep .ai-k{font:600 12px var(--font-b);letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
.ai-fstep .ai-out{margin-top:6px;padding:10px 12px;border-radius:var(--radius);border:1px dashed var(--border);font-size:13px;color:var(--muted);display:flex;gap:8px;align-items:center}
.ai-plans{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:0;padding:0;overflow:hidden}
.ai-plan{padding:30px;display:grid;gap:14px;align-content:start}
.ai-plan+.ai-plan{border-left:1px solid var(--border)}
.ai-plan.pop{background:color-mix(in oklab,var(--primary) 7%,var(--surface))}
.ai-plan ul{list-style:none;display:grid;gap:8px;font-size:14px}
.ai-plan li{display:flex;gap:8px;align-items:flex-start}
.ai-plan li .i{flex:none;margin-top:3px}
.ai-faq{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:32px 40px}
.ai-faq>div{display:grid;gap:8px;align-content:start;padding-top:18px;border-top:1px solid var(--border)}
.ai-faq h3{font-size:calc(17px * var(--hs));line-height:1.35}
.ai-faq p{color:var(--muted);font-size:14.5px}
.ai-wait{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:48px;align-items:center;padding:44px}
.ai-wait form{display:grid;gap:14px}
.ai-wait .sk-g2{gap:14px}
.ai-queue{display:flex;align-items:center;gap:12px;font-size:14px;color:var(--muted)}
.ai-queue .avs{display:flex}
.ai-queue .avatar{width:30px;height:30px;font-size:11px;border:2px solid var(--surface)}
.ai-queue .avatar+.avatar{margin-left:-8px}
@media (max-width:1024px){
  .ai-uses{grid-template-columns:repeat(2,minmax(0,1fr))}
  .ai-use:nth-child(3){padding-left:0;border-left:0}
  .ai-flow{grid-template-columns:repeat(2,minmax(0,1fr))}
  .ai-faq{grid-template-columns:repeat(2,minmax(0,1fr))}
  .ai-sec{grid-template-columns:minmax(0,1fr)}
}
@media (max-width:760px){
  .ai-hero{padding-top:32px;padding-bottom:52px;text-align:left;justify-items:start;gap:16px}
  .ai-hero h1{font-size:calc(38px * var(--hs))}
  .ai-hero .sk-row{width:100%}
  .ai-demo{margin-top:8px}
  .ai-prompt{padding:14px}
  .ai-prompt textarea{font-size:15px;min-height:68px}
  .ai-chips{padding:10px 14px}
  .ai-chip:nth-child(n+3){display:none}
  .ai-ans{grid-template-columns:minmax(0,1fr)}
  .ai-ans>div{padding:16px}
  .ai-ans>div+div{border-left:0;border-top:1px solid var(--border)}
  .ai-src:nth-child(n+4){display:none}
  .ai-uses{grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:0 16px}
  .ai-use,.ai-use+.ai-use,.ai-use:nth-child(3){padding:16px 0;border-left:0;border-bottom:1px solid var(--border);gap:6px}
  .ai-use p{font-size:13.5px!important}
  .ai-use .ai-q{display:none}
  .ai-cite{grid-template-columns:minmax(0,1fr);gap:24px}
  .ai-rules li:nth-child(n+4){display:none}
  .ai-sec{padding:26px 22px;gap:20px}
  .ai-facts{grid-template-columns:minmax(0,1fr)}
  .ai-facts>div,.ai-facts>div:nth-child(odd),.ai-facts>div:nth-child(even){padding:14px 0;border-left:0}
  .ai-facts>div:nth-child(n+5){display:none}
  .ai-flow{display:flex;scroll-padding-inline:20px}
  .ai-plans{grid-template-columns:minmax(0,1fr)}
  .ai-plan{padding:22px}
  .ai-plan+.ai-plan{border-left:0;border-top:1px solid var(--border)}
  .ai-plan ul li:nth-child(n+3){display:none}
  .ai-faq{grid-template-columns:minmax(0,1fr);gap:18px}
  .ai-faq>div:nth-child(n+4){display:none}
  .ai-doc-b p:nth-child(3){display:none}
  .ai-hero .sk-row .btn{flex:1}
  .ai-wait{grid-template-columns:minmax(0,1fr);padding:24px;gap:22px}
}
</style>`;

const SRC = [["doc", "Q3 2026 earnings call transcript", "p. 14 · uploaded by you"], ["chart", "Segment revenue, FY2024–26", "Your workbook · tab 2"], ["globe", "Regulator filing, 12 Aug 2026", "Public filing · section 7.2"], ["doc", "Analyst notes: cold-chain logistics", "Team folder · 3 Oct"]];

const web = (p, st) => K.page(st, `${K.nav(p, ["Use cases", "How it cites", "Security", "Pricing", "FAQ"], "Join the waitlist", "Sign in")}
<main>
<section class="sk-wrap ai-hero" id="top">
  <span class="sk-eyebrow">Research assistant for analysts</span>
  <h1>Ask your documents. Get answers you can check.</h1>
  <p class="sk-lede">${esc(p.name)} reads your filings, transcripts and spreadsheets, answers in plain language, and links every sentence to the page it came from.</p>
  <div class="sk-row" style="justify-content:center"><a class="btn primary sk-btn-lg" href="#join-the-waitlist">Join the waitlist</a><a class="btn sk-btn-lg" href="#how-it-cites">${ic("play", 15)} See a cited answer</a></div>
  <div class="card ai-demo">
    <form class="ai-prompt" aria-label="Ask ${esc(p.name)}"><span class="muted" style="margin-top:3px">${ic("spark", 20)}</span><label for="ai-q">Your question</label><textarea id="ai-q" rows="2">What drove the cold-chain margin drop last quarter, and will it last?</textarea><button class="btn primary" type="button" aria-label="Ask">${ic("send", 16)}</button></form>
    <div class="ai-chips"><span class="ai-chip on">${ic("folder", 14)} Cold-chain coverage · 38 files</span><span class="ai-chip">${ic("filter", 14)} Last 12 months</span><span class="ai-chip">${ic("doc", 14)} Cite every sentence</span></div>
    <div class="ai-ans" role="img" aria-label="A cited answer with numbered references and a source list">
      <div><p>Segment margin fell from 14.2% to 11.8%, mostly from higher diesel and refrigerant costs that were not passed on in fixed-price contracts<span class="ai-ref">1</span><span class="ai-ref">2</span>. Management expects about half of contracts to reprice by March<span class="ai-ref">1</span>, but the August filing lists two large contracts fixed until 2028<span class="ai-ref">3</span>.</p>
        <p class="muted" style="font-size:13px;margin-top:10px;display:flex;gap:6px;align-items:center">${ic("eye", 14)} 3 sources · 1 point of disagreement flagged</p></div>
      <div>${SRC.map(([i, t, m], n) => `<div class="ai-src"><span class="ai-ref" style="margin:0">${n + 1}</span><div><b>${t}</b><span class="muted">${m}</span></div></div>`).join("")}</div>
    </div>
  </div>
</section>

<section class="sk-sec sk-tight sk-alt" id="use-cases"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">Use cases</span><h2 class="sk-h2">The questions analysts ask every week</h2></div></div>
  <div class="ai-uses">${[["chart", "Earnings season", "Compare what was said on this call with the last four, and what changed.", "“Where did guidance language soften since Q1?”"], ["doc", "Due diligence", "Read a data room and list risks with the page each one sits on.", "“Which contracts have change-of-control clauses?”"], ["globe", "Policy & filings", "Track rule changes and pull out the parts that affect your coverage.", "“What does the new reporting rule change for mid-size lenders?”"], ["grid", "Spreadsheets", "Ask about your own models and get the cell range behind the number.", "“Which assumption moves 2027 EBITDA the most?”"]].map(([i, t, d, q]) => `<div class="ai-use"><span class="muted">${ic(i, 22)}</span><h3 class="sk-h3">${t}</h3><p class="muted" style="font-size:14.5px">${d}</p><div class="ai-q">${q}</div></div>`).join("")}</div>
</div></section>

<section class="sk-sec" id="how-it-cites"><div class="sk-wrap ai-cite">
  <div class="sk-stack" style="gap:20px"><span class="sk-eyebrow">How it cites sources</span><h2 class="sk-h2">Every sentence points to a page you can open</h2>
    <ul class="ai-rules">${[["link", "Sentence-level references", "Each claim carries a number. Click it and the source opens at the exact passage."], ["eye", "Highlights, not summaries", "You see the original wording next to the answer, so paraphrase drift is easy to spot."], ["bell", "Disagreements flagged", "When two sources conflict, the answer says so instead of picking one."], ["x", "No source, no claim", "If nothing in your files supports a statement, it says it couldn’t find it."]].map(([i, t, d]) => `<li><span class="ai-ic">${ic(i, 16)}</span><div><b>${t}</b><p>${d}</p></div></li>`).join("")}</ul></div>
  <div class="card ai-doc" role="img" aria-label="Source document open at the highlighted passage for reference 1">
    <div class="ai-doc-top"><span class="ai-ref" style="margin:0">1</span><b>Q3 2026 earnings call transcript</b><span class="muted" style="margin-left:auto">p. 14 of 31</span></div>
    <div class="ai-doc-b"><p>…on the cost side, the quarter was harder than we planned. Fuel and refrigerant together were up roughly a fifth year on year, and <mark>most of our cold-chain book is on fixed-price terms, so we carried that cost rather than passing it through.</mark></p>
      <p>Looking ahead, <mark>we expect around half of those contracts to come up for repricing by the end of March</mark>, and we’re already in those conversations with customers…</p>
      <p>Operator: Our next question comes from the line of…</p></div>
    <div class="ai-doc-foot"><span>Speaker: Chief Financial Officer</span><span>${ic("check", 13)} Matches answer sentences 1 and 2</span></div>
  </div>
</div></section>

<section class="sk-sec sk-tight" id="security"><div class="sk-wrap"><div class="card feat ai-sec">
  <div class="sk-stack" style="gap:14px"><span class="sk-eyebrow" style="color:inherit;opacity:.75">Security & data handling</span><h2 class="sk-h2">Your files stay your files</h2><p class="ai-sub">Plain facts about what happens to what you upload. The full data-handling document is in the trust centre.</p></div>
  <div class="ai-facts">${[["Not used for training", "Your documents and questions are never used to train or tune any model."], ["Deleted when you delete", "Removing a file removes it and its index within 24 hours, backups within 30 days."], ["Encrypted in transit and at rest", "TLS on every connection, and stored files are encrypted with per-workspace keys."], ["Choose your region", "Keep workspace data in the EU or US. It isn’t copied between regions."], ["Permissions follow folders", "Answers only draw on files the person asking can already open."], ["Full activity log", "Every question, answer and file opened is logged for admins to export."]].map(([t, d]) => `<div><b>${t}</b><span>${d}</span></div>`).join("")}</div>
</div></div></section>

<section class="sk-sec sk-tight sk-alt"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">Workflow</span><h2 class="sk-h2">From PDFs to a draft note</h2></div><p class="muted" style="max-width:400px">Most teams set up a workspace in an afternoon. Nothing to install, files upload from the browser or a shared drive.</p></div>
  <div class="ai-flow sk-rail">${[["Step 1", "folder", "Add your sources", "Filings, transcripts, decks, spreadsheets and your own notes, up to 2 GB per workspace.", "38 files indexed"], ["Step 2", "search", "Ask in plain words", "Follow up as you would with a colleague. It keeps the thread’s context.", "6 questions in this thread"], ["Step 3", "eye", "Check the evidence", "Open any reference, accept or reject it, and mark answers as reviewed.", "11 of 12 references accepted"], ["Step 4", "doc", "Export a draft", "Send cited answers to a note with footnotes intact, ready for your edits.", "Draft note · 2 pages"]].map(([k, i, t, d, o]) => `<article class="card ai-fstep"><span class="ai-k">${k}</span><span class="muted">${ic(i, 20)}</span><h3 class="sk-h3">${t}</h3><p class="muted" style="font-size:14px">${d}</p><div class="ai-out">${ic("check", 14)} ${o}</div></article>`).join("")}</div>
</div></section>

<section class="sk-sec sk-tight" id="pricing"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">Pricing</span><h2 class="sk-h2">Early-access pricing, fixed for a year</h2></div><span class="muted" style="font-size:14px">Per user, billed monthly. Prices in USD.</span></div>
  <div class="card ai-plans">${[["Solo", "$29", "One analyst, one workspace", ["500 questions a month", "2 GB of sources", "Export to notes"], "Join the waitlist", ""], ["Team", "$59", "Shared folders and reviews", ["Unlimited questions", "20 GB shared sources", "Review and sign-off", "Admin activity log"], "Join the waitlist", "pop"], ["Firm", "Let’s talk", "Larger teams with their own rules", ["Region choice and data retention rules", "Single sign-on", "Dedicated onboarding"], "Contact us", ""]].map(([n, pr, d, f, cta, c]) => `<div class="ai-plan ${c}"><div class="sk-row" style="justify-content:space-between"><h3 class="sk-h3">${n}</h3>${c ? `<span class="badge">Most teams</span>` : ""}</div><div><span class="num" style="font-size:34px">${pr}</span>${pr.startsWith("$") ? `<span class="muted"> / user / month</span>` : ""}</div><p class="muted" style="font-size:14px">${d}</p><ul>${f.map((x) => `<li>${ic("check", 15)}<span>${x}</span></li>`).join("")}</ul><a class="btn ${c ? "primary" : ""} block" href="#">${cta}</a></div>`).join("")}</div>
</div></section>

<section class="sk-sec sk-tight sk-alt" id="faq"><div class="sk-wrap">
  <div class="sk-head"><div><span class="sk-eyebrow">FAQ</span><h2 class="sk-h2">Before you join</h2></div></div>
  <div class="ai-faq">${[["Can it make things up?", "It can be wrong, which is why every sentence links to a source. If no file supports a claim, it says so rather than guessing."], ["What files can I add?", "PDF, Word, slides, spreadsheets, plain text and web pages you save. Scanned PDFs are read with text recognition."], ["Does it browse the web?", "Only if you turn it on for a workspace, and web sources are labelled separately from your files."], ["Who can see my questions?", "You, and workspace admins through the activity log. Nobody at " + esc(p.name) + " reads them unless you ask for support."], ["How long is the waitlist?", "We’re adding about 200 teams a week, in the order people joined. Most wait two to three weeks."], ["Can I try it before paying?", "Yes. Every new workspace gets 14 days on Team with no card required."]].map(([q, a]) => `<div><h3>${q}</h3><p>${a}</p></div>`).join("")}</div>
</div></section>

<section class="sk-sec sk-tight" id="join-the-waitlist"><div class="sk-wrap"><div class="card ai-wait">
  <div class="sk-stack" style="gap:14px"><span class="sk-eyebrow">Waitlist</span><h2 class="sk-h2">Get early access</h2><p class="muted">Tell us a little about your work and we’ll set up a workspace with sample filings so you can try it on day one.</p>
    <div class="ai-queue"><span class="avs">${["TR", "JW", "PN"].map((a) => `<span class="avatar">${a}</span>`).join("")}</span>1,860 analysts joined this month</div></div>
  <form aria-label="Join the waitlist">
    <div class="sk-g2"><div class="sk-field"><label for="ai-n">Name</label><input class="sk-input" id="ai-n" value="Priya Nair"></div><div class="sk-field"><label for="ai-e">Work email</label><input class="sk-input" id="ai-e" value="priya@firm.example"></div></div>
    <div class="sk-g2"><div class="sk-field"><label for="ai-r">Your role</label><select class="sk-input" id="ai-r"><option>Equity research analyst</option></select></div><div class="sk-field"><label for="ai-t">Team size</label><select class="sk-input" id="ai-t"><option>6–20 people</option></select></div></div>
    <button class="btn primary sk-btn-lg" type="button">Join the waitlist</button>
    <p class="muted" style="font-size:13px">One email when your workspace is ready. No newsletter unless you ask.</p>
  </form>
</div></div></section>
</main>
${K.footer(p, "A research assistant that answers from your documents and shows its sources.", [["Product", ["Use cases", "How it cites", "Pricing", "Changelog"]], ["Trust", ["Security", "Data handling", "Subprocessors", "Responsible use"]], ["Company", ["About", "Careers", "Press kit", "Contact"]]])}`, CSS);

module.exports = {
  "ai-website": K.def("ai", "AI website",
    "a full AI startup home page for a research assistant: navigation with sign in and join the waitlist, a centred hero with a prompt-box demo, source filter chips and a cited answer with numbered references and a source list, use-case columns with example questions, how it cites sources beside a source document with highlighted passages, a dark security and data-handling facts panel, four workflow step cards, three pricing plans, an FAQ grid, a waitlist sign-up form and a footer",
    ["navigation-header", "hero", "prompt-box", "chat", "citations", "source-list", "use-cases", "feature-list", "document-viewer", "highlight", "security", "steps", "pricing", "faq", "waitlist", "signup-form", "footer", "ai", "ai-startup"], web),
};
