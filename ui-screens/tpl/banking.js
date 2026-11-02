/* Banking + calls: bank-onboarding (bank family, Mintwell — a digital bank for freelancers and small businesses; variants
   welcome / verify-identity / account-ready) and voice-call (workspace family, Fernway — a 1:1 voice call in progress).
   "Now" is Tuesday 3 November 2026, mid-afternoon. All account numbers, sort codes and providers are fictional. */
const { ic, ICON, esc, sideNav, status } = require("../lib");

Object.assign(ICON, {
  "banking-pot": '<path d="M7 7h10M8 7l-1.5 3.5A6.5 6.5 0 0 0 12 20a6.5 6.5 0 0 0 5.5-9.5L16 7M9 4h6l-1 3h-4z"/><path d="M12 11.5v5M10.2 13.2c0-.9.8-1.5 1.8-1.5s1.8.5 1.8 1.3c0 1.7-3.6 1-3.6 2.7 0 .8.8 1.3 1.8 1.3s1.8-.6 1.8-1.5"/>',
  "banking-invoice": '<path d="M6 3h12v18l-2.5-1.5L13 21l-2.5-1.5L8 21l-2-1.5z"/><path d="M9 8h6M9 11.5h6M9 15h3.5"/>',
  "banking-id": '<rect x="2.5" y="5" width="19" height="14" rx="2"/><circle cx="8.5" cy="11" r="2.3"/><path d="M5 16.5c.6-1.8 2-2.7 3.5-2.7s2.9.9 3.5 2.7M14.5 10h4.5M14.5 13.5h3"/>',
  "banking-selfie": '<path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3"/><circle cx="12" cy="10" r="2.8"/><path d="M7.5 17c.9-2 2.6-3 4.5-3s3.6 1 4.5 3"/>',
  "banking-eyeoff": '<path d="M3 3l18 18M10.6 5.1A10.6 10.6 0 0 1 12 5c6.4 0 10 7 10 7a17.6 17.6 0 0 1-3.2 4.2M6.6 6.6C3.7 8.4 2 12 2 12s3.6 7 10 7a9.6 9.6 0 0 0 5.4-1.6M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
  "banking-bank": '<path d="M3 9.5L12 4l9 5.5M4.5 10v8M9.5 10v8M14.5 10v8M19.5 10v8M3 20h18"/>',
  "banking-copy": '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
  "banking-truck": '<path d="M2.5 6h11v10h-11zM13.5 9.5h4l3 3.5v3h-7"/><circle cx="6.5" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
  "banking-wallet": '<path d="M4 7h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a1 1 0 0 1-1-1V6a2 2 0 0 1 2-2h10v3"/><path d="M15 13.5h2.5"/>',
  "banking-nfc": '<path d="M8.5 8.5a5 5 0 0 1 0 7M12 6a8.5 8.5 0 0 1 0 12M15.5 3.5a12 12 0 0 1 0 17"/>',
  "banking-mic": '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/>',
  "banking-micoff": '<path d="M9 8.5V6a3 3 0 0 1 6 0v5.5M14.6 13.4A3 3 0 0 1 9 11.8M5.5 11a6.5 6.5 0 0 0 10.4 5.2M18.3 13a6.6 6.6 0 0 0 .2-2M12 17.5V21M4 4l16 16"/>',
  "banking-speaker": '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4.2 4.2 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11"/>',
  "banking-keypad": '<circle cx="6" cy="5" r="1.3"/><circle cx="12" cy="5" r="1.3"/><circle cx="18" cy="5" r="1.3"/><circle cx="6" cy="11" r="1.3"/><circle cx="12" cy="11" r="1.3"/><circle cx="18" cy="11" r="1.3"/><circle cx="6" cy="17" r="1.3"/><circle cx="12" cy="17" r="1.3"/><circle cx="18" cy="17" r="1.3"/><circle cx="12" cy="22" r=".9"/>',
  "banking-adduser": '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.5 3.4-5.5 6.5-5.5 1.6 0 3 .5 4.1 1.4M19 13v6M16 16h6"/>',
  "banking-hold": '<path d="M9 6v12M15 6v12"/>',
  "banking-hangup": '<path d="M3 14c5-4.6 13-4.6 18 0l-2.3 2.6-3.6-1.4.1-2.6a10.5 10.5 0 0 0-6.4 0l.1 2.6-3.6 1.4z"/>',
  "banking-cam": '<rect x="3" y="6.5" width="13" height="11" rx="2"/><path d="M16 10.5l5-3v9l-5-3z"/>',
  "banking-record": '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="3.5"/>',
  "banking-minimise": '<path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7"/>',
  "banking-handset": '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z"/>',
});
const I = (n, s = 18) => ic("banking-" + n, s);
const H = (st, px) => Math.round(px * st.hscale);
const TPL = {};

const CSS = `<style>
.bk-row{display:flex;align-items:center;gap:10px}
.bk-ell{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.bk-hd{display:flex;align-items:center;border-bottom:1px solid var(--border);background:var(--surface);flex:none}
.bk-ico{width:40px;height:40px;border-radius:var(--radius);display:grid;place-items:center;flex:none;background:color-mix(in oklab,var(--primary) 11%,var(--surface));color:color-mix(in oklab,var(--primary) 80%,var(--text))}
.bk-ok{width:22px;height:22px;border-radius:50%;display:grid;place-items:center;flex:none;background:color-mix(in oklab,var(--primary) 14%,var(--surface));color:color-mix(in oklab,var(--primary) 82%,var(--text))}
.bk-lbl{font:600 11px var(--font-b);text-transform:uppercase;letter-spacing:.06em;color:var(--muted)}
.bk-hr{height:1px;background:var(--border);flex:none}
.bk-prog{display:flex;gap:6px}
.bk-prog i{flex:1;height:4px;border-radius:9px;background:color-mix(in oklab,var(--text) 10%,var(--surface))}
.bk-prog i.on{background:var(--primary)}
.bk-prog i.half{background:linear-gradient(90deg,var(--primary) 50%,color-mix(in oklab,var(--text) 10%,var(--surface)) 50%)}
.bk-st{display:flex;gap:12px;align-items:center;font-size:14px;padding:9px 12px;border-radius:var(--radius)}
.bk-st .d{width:24px;height:24px;border-radius:50%;flex:none;display:grid;place-items:center;font:600 12px var(--font-b);border:1.5px solid var(--border);background:var(--surface);color:var(--muted)}
.bk-st .d.done{background:var(--primary);border-color:var(--primary);color:var(--on-primary)}
.bk-st .d.now{border:2px solid var(--primary);color:var(--primary)}
.bk-st.now{background:color-mix(in oklab,var(--primary) 9%,var(--surface));font-weight:600}
.bk-hint{font-size:12px;color:var(--muted)}
.bk-note{border-radius:var(--radius-lg);background:color-mix(in oklab,var(--primary) 6%,var(--surface));border:1px solid color-mix(in oklab,var(--primary) 20%,var(--border));padding:14px 16px;font-size:13px;line-height:1.5}
.bk-card{position:relative;overflow:hidden;border-radius:14px;color:var(--on-primary);background:linear-gradient(135deg,var(--primary),color-mix(in oklab,var(--primary) 62%,var(--accent)));box-shadow:var(--shadow-lg);font-family:var(--font-b)}
.bk-card .chip{width:36px;height:27px;border-radius:5px;background:linear-gradient(135deg,#e8d7a6,#b9a066);position:relative}
.bk-card .chip::after{content:"";position:absolute;inset:6px 0;border-top:1px solid rgba(0,0,0,.25);border-bottom:1px solid rgba(0,0,0,.25)}
.bk-copy{display:inline-flex;align-items:center;gap:5px;color:var(--primary);font-weight:500;font-size:13px}
.bk-tl{display:grid;gap:0}
.bk-tl>div{display:flex;gap:12px;font-size:13px;position:relative;padding-bottom:12px}
.bk-tl>div:not(:last-child)::before{content:"";position:absolute;left:8px;top:18px;bottom:0;width:2px;background:var(--border)}
.bk-tl>div.done:not(:last-child)::before{background:var(--primary)}
.bk-tl .d{width:18px;height:18px;border-radius:50%;flex:none;border:2px solid var(--border);background:var(--surface);margin-top:1px}
.bk-tl .done .d{background:var(--primary);border-color:var(--primary)}
.bk-tl .now .d{border-color:var(--primary)}
.bk-tog{width:36px;height:21px;border-radius:999px;background:var(--primary);position:relative;flex:none}
.bk-tog::after{content:"";position:absolute;right:2px;top:2px;width:17px;height:17px;border-radius:50%;background:var(--on-primary)}
.bk-tog.off{background:color-mix(in oklab,var(--text) 16%,var(--surface))}
.bk-tog.off::after{right:auto;left:2px;background:var(--surface)}
/* voice call stage (always dark) */
.vc-stage{background:var(--ink);color:var(--on-ink)}
.vc-dim{color:color-mix(in oklab,var(--on-ink) 66%,var(--ink))}
.vc-ctl{width:56px;height:56px;border-radius:999px;display:grid;place-items:center;flex:none;background:color-mix(in oklab,var(--on-ink) 13%,var(--ink));color:var(--on-ink);border:1px solid color-mix(in oklab,var(--on-ink) 16%,transparent)}
.vc-ctl.on{background:var(--on-ink);color:var(--ink)}
.vc-end{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:56px;padding:0 26px;border-radius:999px;background:color-mix(in oklab,var(--accent) 82%,var(--text));color:var(--bg);font:600 15px var(--font-b);white-space:nowrap;flex:none}
.vc-av{box-shadow:0 0 0 2px color-mix(in oklab,var(--on-ink) 22%,transparent);border-radius:50%;display:grid;place-items:center;font-family:var(--font-h);font-weight:var(--hw);color:var(--on-primary);background:linear-gradient(140deg,var(--primary),color-mix(in oklab,var(--primary) 55%,var(--accent)))}
.vc-ring{position:absolute;border-radius:50%;border:1.5px solid color-mix(in oklab,var(--primary) 50%,var(--ink))}
.vc-pill{display:inline-flex;align-items:center;gap:7px;height:30px;padding:0 12px;border-radius:999px;background:color-mix(in oklab,var(--on-ink) 11%,var(--ink));font:500 12.5px var(--font-b)}
.vc-sig{display:inline-flex;align-items:flex-end;gap:2px;height:13px}
.vc-sig i{width:3px;border-radius:1px;background:currentColor}
.vc-sig i.off{opacity:.3}
.vc-wave{display:flex;align-items:center;gap:3px;height:34px}
.vc-wave i{width:3px;border-radius:2px;background:color-mix(in oklab,var(--primary) 70%,var(--on-ink))}
.vc-kv{display:grid;grid-template-columns:22px 1fr;gap:10px 10px;font-size:13px;align-items:start}
.vc-kv .i{color:var(--muted);margin-top:1px}
.vc-msg{padding:8px 11px;border-radius:var(--radius-lg);background:color-mix(in oklab,var(--text) 6%,var(--surface));font-size:13px;line-height:1.45}
.vc-msg.me{background:color-mix(in oklab,var(--primary) 12%,var(--surface))}
.vc-file{display:flex;align-items:center;gap:10px;padding:8px 0;font-size:13px}
.vc-ft{width:32px;height:32px;border-radius:var(--radius-sm);display:grid;place-items:center;flex:none;font:700 9px var(--font-b);letter-spacing:.02em;background:color-mix(in oklab,var(--accent) 16%,var(--surface));color:color-mix(in oklab,var(--accent) 72%,var(--text))}
.vc-mini{display:flex;align-items:center;gap:10px;height:52px;padding:0 8px 0 10px;border-radius:999px;background:var(--ink);color:var(--on-ink);box-shadow:var(--shadow-lg)}
.vc-mini .b{width:36px;height:36px;border-radius:50%;display:grid;place-items:center;flex:none;background:color-mix(in oklab,var(--on-ink) 13%,var(--ink))}
.vc-mini .b.end{background:color-mix(in oklab,var(--accent) 82%,var(--text));color:var(--bg)}
</style>`;

// =============================================================================================
// bank-onboarding
const STEPS = ["Basic info", "Business details", "Tax info", "Verify identity", "Review and open"];
const logo = (p) => `<div class="logo" style="white-space:nowrap"><b></b>${esc(p.name)}<span class="muted" style="font-weight:500;font-size:12px;margin-left:2px">Business</span></div>`;
const check = (s = 12) => `<span class="bk-ok" style="width:${s + 10}px;height:${s + 10}px">${ic("check", s)}</span>`;
const prog = (done, half) => `<div class="bk-prog">${STEPS.map((_, i) => `<i class="${i < done ? "on" : i === done && half ? "half" : ""}"></i>`).join("")}</div>`;

const webHdr = (p, st, done, label, right) => `<header class="bk-hd" style="height:66px;padding:0 40px;gap:24px">${logo(p)}
<div style="flex:1;max-width:560px;margin:0 auto;display:grid;gap:7px"><div style="display:flex;justify-content:space-between;font-size:12px"><span style="font-weight:600">${label}</span><span class="muted">${done >= STEPS.length ? "All steps complete" : `Step ${Math.min(done + 1, 5)} of 5 · about ${Math.max(1, 5 - done)} min left`}</span></div>${prog(done, done < 5)}</div>
<div class="bk-row" style="gap:16px;font-size:13px">${right}</div></header>`;

const PROPS = [
  ["card", "£0 monthly fee, free UK transfers", "No minimum balance. Free Faster Payments and Direct Debits; 0.4% on card spending abroad, nothing hidden."],
  ["banking-invoice", "Invoices that chase themselves", "Send branded invoices in two taps. When the client pays, Mintwell matches the payment and marks it paid."],
  ["banking-pot", "Tax pots that fill as you earn", "Pick a rate (most freelancers choose 20–25%) and we set it aside from every payment for Self Assessment or VAT."],
];
const NEED = [
  ["banking-id", "Photo ID", "Passport, UK driving licence or national ID card"],
  ["home", "Your home address", "Where you’ve lived for the last 3 years"],
  ["clock", "About 5 minutes", "You can save and finish later on any device"],
  ["banking-bank", "Business details (if you have them)", "Companies House number for limited companies"],
];

const preview = (compact) => `<div class="card" style="padding:${compact ? "12px 14px" : "16px 18px"};display:grid;gap:${compact ? 8 : 10}px;box-shadow:var(--shadow)">
<div class="bk-row" style="gap:10px"><span class="bk-ok" style="width:${compact ? 28 : 32}px;height:${compact ? 28 : 32}px">${ic("arrow", compact ? 14 : 16)}</span><div style="flex:1;min-width:0"><div style="font-weight:600;font-size:${compact ? 13 : 14}px" class="bk-ell">Ostrava Labs paid INV-0042</div><div class="muted bk-ell" style="font-size:12px">${compact ? "Just now · auto-matched" : "Just now · matched automatically"}</div></div><span class="num" style="font-size:${compact ? 15 : 17}px">+£1,250.00</span></div>
<div class="bk-row" style="gap:10px;padding:${compact ? "8px 10px" : "10px 12px"};border-radius:var(--radius);background:color-mix(in oklab,var(--primary) 8%,var(--surface))"><span style="color:color-mix(in oklab,var(--primary) 80%,var(--text));display:inline-flex">${I("pot", compact ? 16 : 18)}</span><span style="flex:1;font-size:${compact ? 12 : 13}px"><b style="font-weight:600">£275.00</b> moved to Tax pot (22%)</span>${compact ? "" : `<span class="num muted" style="font-size:12px">£3,412.80 saved</span>`}</div></div>`;
const welcomeWeb = (p, st) => `${webHdr(p, st, 0, "Before you start", `<span class="muted">Already a customer?</span><span class="btn">Log in</span>`)}
<div style="flex:1;min-height:0;display:grid;grid-template-columns:minmax(0,1.15fr) 440px;gap:56px;max-width:1180px;width:100%;margin:0 auto;padding:28px 40px;align-content:center;align-items:start">
<div style="display:grid;gap:22px;align-content:start">
<span class="badge" style="justify-self:start;gap:6px">${ic("users", 12)}For freelancers, sole traders and limited companies</span>
<h1 style="font-size:${H(st, 40)}px;max-width:620px">The business account that sets tax aside for you</h1>
<p class="muted" style="font-size:16px;max-width:560px;margin-top:-6px">Open a ${esc(p.name)} account in minutes, invoice clients from the same app and never be surprised by a tax bill again.</p>
<div style="display:grid;gap:16px;margin-top:4px">${PROPS.map(([i, t, d]) => `<div style="display:flex;gap:14px;align-items:flex-start"><span class="bk-ico">${ic(i, 20)}</span><div><div style="font-weight:600;font-size:15px">${t}</div><div class="muted" style="font-size:13px;margin-top:3px;line-height:1.5">${d}</div></div></div>`).join("")}</div>
<div style="max-width:560px">${preview(false)}</div>
<div class="bk-row" style="gap:28px;margin-top:6px">${[["62,400", "freelancers bank with us"], ["4.8 / 5", "from 11,900 app reviews"], ["£85k", "eligible deposits protected"]].map(([a, b]) => `<div><div class="num" style="font-size:22px">${a}</div><div class="muted" style="font-size:12px">${b}</div></div>`).join(`<span style="width:1px;height:34px;background:var(--border)"></span>`)}</div>
</div>
<div class="card" style="padding:28px;display:grid;gap:18px;align-content:start;box-shadow:var(--shadow)">
<div><div class="bk-lbl">What you’ll need</div><div class="h" style="font-size:${H(st, 22)}px;margin-top:6px">Open your account in about 5 minutes</div></div>
<div style="display:grid;gap:14px">${NEED.map(([i, t, d]) => `<div style="display:flex;gap:12px;align-items:flex-start"><span class="bk-ico" style="width:36px;height:36px">${ic(i, 18)}</span><div style="flex:1;min-width:0"><div style="font-weight:600;font-size:14px">${t}</div><div class="muted" style="font-size:12.5px">${d}</div></div>${check(11)}</div>`).join("")}</div>
<div class="bk-hr"></div>
<div style="display:grid;gap:10px"><span class="btn primary block" style="height:46px;font-size:14px">Open account ${ic("arrow", 16)}</span><span class="btn block" style="height:46px;font-size:14px">I already have an account</span></div>
<div class="muted" style="font-size:12px;line-height:1.5;display:flex;gap:8px">${ic("lock", 14)}<span>No credit check to open. We’ll never ask for your card PIN or online banking password.</span></div>
</div></div>`;

const verifyWeb = (p, st) => `${webHdr(p, st, 3, "Verify identity", `<span class="muted bk-row" style="gap:6px">${ic("lock", 14)}Progress saved</span><span class="btn">Save and exit</span>`)}
<div style="flex:1;min-height:0;display:grid;grid-template-columns:240px minmax(0,1fr) 300px;gap:36px;max-width:1260px;width:100%;margin:0 auto;padding:24px 40px;align-content:center">
<nav style="display:grid;gap:4px;align-content:start"><div class="bk-lbl" style="padding:0 12px 8px">Your application</div>
${STEPS.map((s, i) => `<div class="bk-st${i === 3 ? " now" : ""}"><span class="d${i < 3 ? " done" : i === 3 ? " now" : ""}">${i < 3 ? ic("check", 13) : i + 1}</span><div style="min-width:0"><div>${s}</div><div class="muted" style="font-size:12px;font-weight:400">${["Lin Park · lin@parkstudio.co", "Sole trader · Illustration", "UTR ending 4471", "About 2 minutes", "Check and confirm"][i]}</div></div></div>`).join("")}
<div class="card" style="padding:14px;margin-top:14px;display:grid;gap:6px;font-size:12.5px"><div style="font-weight:600" class="bk-row">${ic("chat", 15)}Need a hand?</div><div class="muted">Our UK team replies in about 4 minutes, 8 AM – 10 PM.</div></div></nav>
<main style="display:grid;gap:18px;align-content:start">
<div><div class="bk-lbl">Step 4 of 5</div><h1 style="font-size:${H(st, 30)}px;margin-top:6px">Confirm who you are</h1><p class="muted" style="margin-top:6px;max-width:560px">Enter your details exactly as they appear on your photo ID. Then we’ll ask you to scan the ID and take a quick selfie.</p></div>
<div class="card" style="padding:24px;display:grid;gap:18px">
<div class="field"><label>Full legal name</label><div class="input filled">Lin Seo-yeon Park</div><span class="bk-hint">Include any middle names. Not your trading name.</span></div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
<div class="field"><label>Date of birth</label><div style="display:grid;grid-template-columns:64px 64px 1fr;gap:8px"><div class="input filled" style="justify-content:center">14</div><div class="input filled" style="justify-content:center">06</div><div class="input filled">1991</div></div></div>
<div class="field"><label style="display:flex;justify-content:space-between">National Insurance number <span class="muted" style="font-weight:400;font-size:12px">Last 4 shown</span></label><div class="input filled" style="justify-content:space-between"><span class="num" style="font-size:14px;letter-spacing:.12em">•• •• •• 47 C</span><span class="muted bk-row" style="gap:5px;font-size:12px">${I("eyeoff", 16)}Show</span></div></div></div>
<div class="field"><label>Home address</label><div style="display:grid;grid-template-columns:1fr 140px;gap:8px"><div class="input filled">Flat 3, 21 Ropewalk Lane</div><div class="input filled">BS1 6QT</div></div><div class="input filled">Bristol, United Kingdom</div></div>
<div class="bk-row" style="font-size:13px;justify-content:space-between"><span>I’ve lived at this address for 3 years or more</span><span class="bk-tog"></span></div>
<div class="bk-hr"></div>
<div style="display:grid;gap:8px"><span style="font-weight:500;font-size:13px">ID you can use in the next step</span><div class="bk-row" style="gap:8px;flex-wrap:wrap">${["Passport", "UK driving licence", "EU national ID card", "Biometric residence permit"].map((t, i) => `<span class="badge" style="height:28px;padding:0 12px;gap:6px;font-size:12px${i ? ";background:color-mix(in oklab,var(--text) 5%,var(--surface));color:var(--text)" : ""}">${I("id", 13)}${t}</span>`).join("")}</div></div>
</div>
<div class="bk-row" style="gap:12px"><span class="btn" style="height:46px">${ic("back", 16)}Back</span><span class="btn primary" style="height:46px;padding:0 22px;font-size:14px">${I("selfie", 17)}Verify with ID + selfie</span><span class="muted" style="font-size:12px;margin-left:6px">Takes about 2 minutes on your phone or webcam</span></div>
</main>
<aside style="display:grid;gap:14px;align-content:start">
<div class="bk-note" style="display:grid;gap:10px"><div class="bk-row" style="gap:8px;font-weight:600">${ic("shield", 17)}Why we ask for this</div>
<div>UK law requires every bank to confirm who its customers are before opening an account. It stops people opening accounts in your name.</div>
<div>We check your details once against your ID. We don’t run a credit check and it won’t affect your credit score.</div></div>
<div class="card" style="padding:16px;display:grid;gap:12px;font-size:13px"><div style="font-weight:600" class="bk-row">${ic("lock", 16)}How your data is protected</div>
${[["Encrypted in transit and at rest (AES-256)"], ["ID images deleted 30 days after approval"], ["Never sold or shared for marketing"]].map(([t]) => `<div class="bk-row" style="gap:9px;align-items:flex-start">${check(10)}<span>${t}</span></div>`).join("")}</div>
<div class="card" style="padding:16px;display:grid;gap:10px;font-size:13px"><div style="font-weight:600">What happens next</div>
<div class="bk-row" style="gap:10px"><span class="bk-ico" style="width:32px;height:32px">${I("id", 16)}</span><span>Photograph the front of your ID</span></div><div class="bk-row" style="gap:10px"><span class="bk-ico" style="width:32px;height:32px">${I("selfie", 16)}</span><span>Take a short selfie video</span></div></div>
<div class="muted bk-row" style="gap:8px;font-size:12px;justify-content:center">${ic("shield", 14)}Identity checks powered by <b style="font-weight:700;color:var(--text)">Veriloom</b></div>
</aside></div>`;

const cardVis = (w, compact) => {
  const h = Math.round(w * 0.63), tiny = compact === "tiny";
  if (tiny) return `<div class="bk-card" style="width:${w}px;height:${h}px;padding:10px 12px;display:flex;flex-direction:column;justify-content:space-between;flex:none"><div style="display:flex;justify-content:space-between;font-weight:700;font-size:11px"><span>Mintwell</span>${I("nfc", 14)}</div><span class="chip" style="width:24px;height:18px"></span><div style="display:flex;justify-content:space-between;align-items:flex-end"><span class="num" style="font-size:11px;letter-spacing:.1em">•••• 4419</span><b style="font-size:9px">VISA</b></div></div>`;
  return `<div class="bk-card" style="width:${w}px;height:${h}px;padding:${compact ? 16 : 22}px;display:flex;flex-direction:column;justify-content:space-between;flex:none">
<svg style="position:absolute;right:-${Math.round(w * 0.22)}px;top:-${Math.round(w * 0.3)}px;opacity:.16" width="${Math.round(w * 0.9)}" height="${Math.round(w * 0.9)}" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width=".8">${Array.from({ length: 6 }, (_, i) => `<circle cx="50" cy="50" r="${10 + i * 8}"/>`).join("")}</svg>
<div style="display:flex;justify-content:space-between;align-items:flex-start;position:relative"><div style="font-weight:700;font-size:${compact ? 14 : 16}px;display:flex;gap:7px;align-items:center"><span style="width:16px;height:16px;border-radius:4px;background:currentColor;opacity:.9"></span>Mintwell</div><span style="font-size:11px;font-weight:600;opacity:.85;letter-spacing:.06em">BUSINESS</span></div>
<div style="display:flex;align-items:center;gap:12px;position:relative"><span class="chip"></span>${I("nfc", 20)}</div>
<div style="display:flex;justify-content:space-between;align-items:flex-end;position:relative"><div><div class="num" style="font-size:${compact ? 14 : 16}px;letter-spacing:.14em">•••• 4419</div><div style="font-size:${compact ? 10 : 11}px;font-weight:600;letter-spacing:.08em;margin-top:4px;opacity:.9">LIN PARK · PARK STUDIO</div></div><div style="text-align:right;font-size:10px;opacity:.85;line-height:1.3">DEBIT<br><b style="font-size:12px">VISA</b></div></div></div>`;
};
const NEXT = [
  ["plus", "Add money", "Bank transfer or card top-up. Your account is ready to receive client payments now."],
  ["banking-pot", "Set up your tax pot", "We suggest 22% for your income band. Change it any time."],
  ["users", "Invite your accountant", "Read-only access to transactions, receipts and exports."],
];
const readyWeb = (p, st) => `${webHdr(p, st, 5, "Account open", `<span class="btn">${ic("download", 15)}Account confirmation PDF</span>`)}
<div style="flex:1;min-height:0;max-width:1140px;width:100%;margin:0 auto;padding:24px 40px;display:grid;gap:26px;align-content:center">
<div class="bk-row" style="gap:18px"><span style="width:60px;height:60px;border-radius:50%;display:grid;place-items:center;background:var(--primary);color:var(--on-primary);flex:none">${ic("check", 30)}</span><div><h1 style="font-size:${H(st, 32)}px">You’re all set, Lin. Your account is open.</h1><p class="muted" style="margin-top:4px">Approved at 3:12 PM on Tue 3 Nov. Share these details with clients to get paid into ${esc(p.name)}.</p></div></div>
<div style="display:grid;grid-template-columns:minmax(0,1fr) 420px;gap:22px">
<div class="card" style="padding:22px;display:grid;gap:16px;align-content:start">
<div style="display:flex;justify-content:space-between;align-items:center"><div><div class="bk-lbl">Account details</div><div style="font-weight:600;font-size:16px;margin-top:4px">Park Studio · Business current account</div></div><span class="badge">${ic("check", 11)} Active</span></div>
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px">${[["Account name", "Lin Park t/a Park Studio", ""], ["Sort code", "04-••-62", "num"], ["Account number", "•••• 3817", "num"]].map(([l, v, c]) => `<div style="padding:14px;border-radius:var(--radius);background:color-mix(in oklab,var(--text) 4%,var(--surface));border:1px solid var(--border);display:grid;gap:6px;min-width:0"><span class="muted" style="font-size:12px">${l}</span><span class="${c}${c ? " bk-ell" : ""}" style="font-size:${c ? 18 : 14}px;font-weight:600${c ? ";letter-spacing:.06em" : ""}">${v}</span><span class="bk-copy">${I("copy", 14)}Copy</span></div>`).join("")}</div>
<div class="bk-row" style="gap:10px;font-size:13px"><span class="btn">${ic("eye", 15)}Reveal full details</span><span class="btn">${ic("share", 15)}Share with a client</span><span class="muted" style="margin-left:auto">IBAN available for EU clients</span></div>
<div class="bk-hr"></div>
<div class="bk-row" style="gap:12px;padding:12px 14px;border-radius:var(--radius);border:1px dashed var(--border);font-size:13px"><span class="bk-ico" style="width:34px;height:34px">${ic("refresh", 16)}</span><div style="flex:1;min-width:0"><div style="font-weight:600">Switch from your old bank</div><div class="muted">We move your payments and Direct Debits in 7 working days.</div></div><span class="bk-copy">Start ${ic("arrow", 14)}</span></div>
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px">${[["Balance", "£0.00"], ["Tax pot", "Not set up"], ["Monthly fee", "£0"]].map(([a, b], i) => `<div><div class="muted" style="font-size:12px">${a}</div><div class="${i === 1 ? "" : "num"}" style="font-size:${i === 1 ? 14 : 20}px;font-weight:600;margin-top:2px">${b}</div></div>`).join("")}</div></div>
<div class="card" style="padding:22px;display:grid;gap:16px;align-content:start">
<div style="display:flex;justify-content:space-between;align-items:center"><div style="font-weight:600;font-size:15px" class="bk-row">${I("truck", 18)}Your card is on the way</div><span class="muted" style="font-size:12px">Royal Mail · 1st class</span></div>
<div style="display:flex;gap:18px;align-items:center">${cardVis(236, true)}
<div class="bk-tl" style="flex:1"><div class="done"><span class="d"></span><div><b style="font-weight:600">Ordered</b><div class="muted" style="font-size:12px">Today</div></div></div><div class="now"><span class="d"></span><div><b style="font-weight:600">Dispatched</b><div class="muted" style="font-size:12px">Thu 5 Nov</div></div></div><div><span class="d"></span><div><b style="font-weight:600">Arrives by</b><div class="muted" style="font-size:12px">Mon 9 Nov</div></div></div></div></div>
<div class="bk-row" style="gap:10px"><span class="btn primary" style="flex:1">${I("wallet", 15)}Add virtual card to wallet</span><span class="btn">Freeze</span></div></div></div>
<div><div class="h" style="font-size:${H(st, 18)}px;margin-bottom:12px">Next steps</div>
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px">${NEXT.map(([i, t, d], n) => `<div class="card" style="padding:20px;display:grid;gap:10px;align-content:start"><div style="display:flex;justify-content:space-between;align-items:center"><span class="bk-ico">${ic(i, 20)}</span><span class="muted" style="font-size:12px">${["1 min", "2 min", "1 min"][n]}</span></div><div style="font-weight:600;font-size:15px">${t}</div><div class="muted" style="font-size:13px;line-height:1.5">${d}</div><span class="bk-copy" style="font-size:13.5px">${["Add money", "Create tax pot", "Send invite"][n]} ${ic("arrow", 14)}</span></div>`).join("")}</div></div>
</div>`;

TPL["bank-onboarding/web"] = (p, st) => {
  const v = p.variant || "welcome";
  const body = v === "verify-identity" ? verifyWeb(p, st) : v === "account-ready" ? readyWeb(p, st) : welcomeWeb(p, st);
  return `${CSS}<div style="height:100%;display:flex;flex-direction:column;background:color-mix(in oklab,var(--text) 2%,var(--bg))">${body}</div>`;
};

const mTop = (left, mid, right) => `<div class="mtop" style="gap:12px">${left}<div style="flex:1;min-width:0;text-align:center;font-weight:600;font-size:14px">${mid}</div>${right}</div>`;
TPL["bank-onboarding/mobile"] = (p, st) => {
  const v = p.variant || "welcome";
  let inner;
  if (v === "verify-identity") {
    inner = `${mTop(ic("back", 22), "Verify identity", `<span class="muted" style="font-size:13px">Save</span>`)}
<div style="padding:0 20px 4px;display:grid;gap:7px;flex:none">${prog(3, true)}<div style="display:flex;justify-content:space-between;font-size:12px"><span class="muted bk-row" style="gap:5px"><span class="bk-ok" style="width:16px;height:16px">${ic("check", 10)}</span>Basic info · Business · Tax info</span><span style="font-weight:600">Step 4 of 5</span></div></div>
<div class="mbody" style="gap:13px;padding-top:12px">
<div><h1 style="font-size:${H(st, 24)}px">Confirm who you are</h1><p class="muted" style="font-size:13px;margin-top:4px">Enter details exactly as they appear on your photo ID.</p></div>
<div class="field"><label>Full legal name</label><div class="input filled">Lin Seo-yeon Park</div></div>
<div class="field"><label>Date of birth</label><div style="display:grid;grid-template-columns:60px 60px 1fr;gap:8px"><div class="input filled" style="justify-content:center">14</div><div class="input filled" style="justify-content:center">06</div><div class="input filled">1991</div></div></div>
<div class="field"><label>National Insurance number</label><div class="input filled" style="justify-content:space-between"><span class="num" style="font-size:14px;letter-spacing:.12em">•• •• •• 47 C</span><span class="muted">${I("eyeoff", 18)}</span></div></div>
<div class="field"><label>Home address</label><div class="input filled" style="justify-content:space-between"><span class="bk-ell">Flat 3, 21 Ropewalk Lane, Bristol</span><span class="muted" style="font-size:12px;flex:none">BS1 6QT</span></div></div>
<div class="bk-row" style="font-size:13px;justify-content:space-between;margin-top:-2px"><span>Lived here 3 years or more</span><span class="bk-tog"></span></div>
<div class="bk-note" style="display:flex;gap:10px;padding:12px 14px;font-size:12.5px">${ic("shield", 18)}<div><b style="font-weight:600">Why we need this:</b> UK law requires us to confirm who you are. No credit check. Your data is encrypted and ID images are deleted 30 days after approval.</div></div>
</div>
<div style="flex:none;padding:12px 20px 28px;display:grid;gap:10px;border-top:1px solid var(--border);background:var(--surface)"><span class="btn primary block" style="height:48px;font-size:14px">${I("selfie", 17)}Verify with ID + selfie</span><div class="muted bk-row" style="gap:6px;font-size:11.5px;justify-content:center">${ic("lock", 12)}Identity checks powered by <b style="font-weight:700;color:var(--text)">Veriloom</b></div></div>`;
  } else if (v === "account-ready") {
    inner = `${mTop(`<span style="width:22px"></span>`, "", ic("x", 22))}
<div class="mbody" style="gap:14px;padding-top:0">
<div style="display:grid;justify-items:center;text-align:center;gap:8px"><span style="width:52px;height:52px;border-radius:50%;display:grid;place-items:center;background:var(--primary);color:var(--on-primary)">${ic("check", 26)}</span><h1 style="font-size:${H(st, 24)}px">Your account is open</h1><p class="muted" style="font-size:13px;margin-top:-4px">Park Studio · approved 3:12 PM today</p></div>
<div class="card" style="padding:14px 16px;display:grid;gap:10px">
${[["Sort code", "04-••-62"], ["Account number", "•••• 3817"]].map(([l, val]) => `<div style="display:flex;justify-content:space-between;align-items:center"><div><div class="muted" style="font-size:12px">${l}</div><div class="num" style="font-size:18px;letter-spacing:.06em">${val}</div></div><span class="bk-copy">${I("copy", 15)}Copy</span></div>`).join(`<div class="bk-hr"></div>`)}
<span class="btn block" style="height:38px">${ic("share", 15)}Share details</span></div>
<div class="card" style="padding:14px 16px;display:flex;gap:14px;align-items:center">${cardVis(132, "tiny")}<div style="min-width:0"><div style="font-weight:600;font-size:14px">Card on the way</div><div class="muted" style="font-size:12px;margin-top:2px">Arrives by Mon 9 Nov. Use the virtual card today.</div><span class="bk-copy" style="margin-top:6px">${I("wallet", 14)}Add to wallet</span></div></div>
<div style="font-weight:600">Next steps</div>
<div class="card">${NEXT.map(([i, t, d], n) => `<div style="display:flex;gap:12px;align-items:center;padding:11px 14px;${n ? "border-top:1px solid var(--border)" : ""}"><span class="bk-ico" style="width:34px;height:34px">${ic(i, 17)}</span><div style="flex:1;min-width:0"><div style="font-weight:600;font-size:13.5px">${t}</div><div class="muted bk-ell" style="font-size:12px">${["Transfer or card top-up", "Suggested 22% of income", "Read-only access"][n]}</div></div>${ic("chevron", 16)}</div>`).join("")}</div>
</div>
<div style="flex:none;padding:10px 20px 28px"><span class="btn primary block" style="height:48px;font-size:14px">Go to my account</span></div>`;
  } else {
    inner = `${mTop(logo(p), "", `<span style="color:var(--primary);font-weight:600;font-size:13px">Log in</span>`).replace('<div style="flex:1;min-width:0;text-align:center;font-weight:600;font-size:14px"></div>', '<div style="flex:1"></div>')}
<div class="mbody" style="gap:12px;padding-top:8px">
<span class="badge" style="justify-self:start;align-self:flex-start">For freelancers and small businesses</span>
<h1 style="font-size:${H(st, 26)}px">The business account that sets tax aside for you</h1>
<div style="display:grid;gap:12px">${PROPS.map(([i, t, d]) => `<div style="display:flex;gap:12px;align-items:center"><span class="bk-ico" style="width:36px;height:36px">${ic(i, 18)}</span><div style="min-width:0;flex:1"><div style="font-weight:600;font-size:14px" class="bk-ell">${t}</div><div class="muted bk-ell" style="font-size:12.5px">${["No minimum balance, free UK transfers", "Auto-matched when clients pay", "20–25% set aside from every payment"][PROPS.findIndex((x) => x[1] === t)]}</div></div></div>`).join("")}</div>
${preview(true)}
<div class="card" style="padding:14px 16px;display:grid;gap:10px"><div class="bk-lbl">What you’ll need</div>
${NEED.slice(0, 3).map(([i, t, d]) => `<div class="bk-row" style="gap:10px;font-size:13px">${check(10)}<div style="min-width:0"><b style="font-weight:600">${t}</b> <span class="muted">· ${["passport or licence", "last 3 years", "save and finish later"][NEED.findIndex((n) => n[1] === t)]}</span></div></div>`).join("")}</div>
</div>
<div style="flex:none;padding:10px 20px 28px;display:grid;gap:10px"><span class="btn primary block" style="height:48px;font-size:14px">Open account</span><span class="btn block" style="height:48px;font-size:14px">I already have an account</span><div class="muted" style="font-size:11.5px;text-align:center">No credit check · eligible deposits protected up to £85,000</div></div>`;
  }
  return `${CSS}<div class="phone">${status()}${inner}</div>`;
};

// =============================================================================================
// voice-call (workspace / Fernway)
const NAV = [["inbox", "Inbox"], ["chat", "Messages"], ["banking-handset", "Calls"], ["check", "My tasks"], ["grid", "Projects"], ["doc", "Docs"], ["folder", "Files"], ["users", "Team"]];
const sig = (n = 3) => `<span class="vc-sig">${[5, 8, 11, 13].map((h, i) => `<i class="${i < n ? "" : "off"}" style="height:${h}px"></i>`).join("")}</span>`;
const wave = (rnd, n, max = 30) => `<div class="vc-wave">${Array.from({ length: n }, (_, i) => { const e = Math.sin((i / (n - 1)) * Math.PI); return `<i style="height:${Math.max(4, Math.round((0.25 + rnd() * 0.75) * e * max))}px"></i>`; }).join("")}</div>`;
const bigAv = (size) => `<div style="position:relative;width:${size}px;height:${size}px;display:grid;place-items:center">
<span class="vc-ring" style="inset:-${Math.round(size * 0.16)}px;opacity:.55"></span><span class="vc-ring" style="inset:-${Math.round(size * 0.32)}px;opacity:.25"></span>
<div class="vc-av" style="width:${size}px;height:${size}px;font-size:${Math.round(size * 0.36)}px">TR</div>
<span style="position:absolute;right:${Math.round(size * 0.04)}px;bottom:${Math.round(size * 0.04)}px;width:${Math.round(size * 0.16)}px;height:${Math.round(size * 0.16)}px;border-radius:50%;background:var(--primary);box-shadow:0 0 0 4px var(--ink)"></span></div>`;
const vctl = (icon, label, cls = "") => `<div style="display:grid;justify-items:center;gap:7px"><span class="vc-ctl ${cls}">${icon}</span><span class="vc-dim" style="font-size:12px;font-weight:500">${label}</span></div>`;

TPL["voice-call/web"] = (p, st, rnd) => `${CSS}<div class="shell">${sideNav(p, "Calls", NAV.map(([i, l]) => [i, l]))}<main class="main" style="flex-direction:row">
<section class="vc-stage" style="flex:1;min-width:0;display:flex;flex-direction:column;position:relative">
<div style="height:64px;flex:none;display:flex;align-items:center;gap:12px;padding:0 24px;border-bottom:1px solid color-mix(in oklab,var(--on-ink) 12%,transparent)">
<span class="vc-pill"><span style="width:8px;height:8px;border-radius:50%;background:var(--primary)"></span>Voice call · <span class="num" style="font-size:13px">12:47</span></span>
<span class="vc-pill">${ic("lock", 13)}End-to-end encrypted</span>
<span class="vc-pill" style="margin-left:auto">${sig(4)}Excellent · HD audio · 38 ms</span>
<span class="vc-pill">${I("minimise", 14)}Mini player</span></div>
<div style="flex:1;min-height:0;display:grid;place-items:center;align-content:center;gap:0;text-align:center;padding:20px">
${bigAv(176)}
<div class="h" style="font-size:${H(st, 34)}px;margin-top:56px">Teodora Ruiz</div>
<div class="vc-dim" style="font-size:15px;margin-top:4px">Studio lead, Palo Verde Co. · Madrid</div>
<div class="num" style="font-size:44px;margin-top:18px">12:47</div>
<div style="margin-top:14px;display:flex;align-items:center;gap:12px"><span class="vc-dim" style="font-size:12px;width:120px;text-align:right">Teodora is speaking</span>${wave(rnd, 28)}<span style="width:120px"></span></div>
</div>
<div style="flex:none;padding:18px 24px 28px;display:flex;align-items:flex-end;gap:12px;border-top:1px solid color-mix(in oklab,var(--on-ink) 12%,transparent)">
<div style="flex:1;font-size:12.5px" class="vc-dim"><div style="font-weight:600;color:var(--on-ink);font-size:13px">Harbor pilot pricing</div>Linked to task · Due Fri 6 Nov</div>
<div class="bk-row" style="gap:16px;align-items:flex-start">${vctl(I("micoff", 22), "Unmute", "on")}${vctl(I("speaker", 22), "Speaker")}${vctl(I("keypad", 22), "Keypad")}${vctl(I("adduser", 22), "Add person")}${vctl(I("hold", 22), "Hold")}${vctl(I("cam", 22), "Video")}${vctl(ic("more", 22), "More")}</div>
<div style="flex:1;display:flex;justify-content:flex-end;padding-bottom:22px"><span class="vc-end">${I("hangup", 20)}End call</span></div></div>
</section>
<aside style="width:372px;flex:none;border-left:1px solid var(--border);background:var(--surface);display:flex;flex-direction:column;min-height:0">
<div style="padding:20px 20px 16px;display:flex;gap:14px;align-items:center;border-bottom:1px solid var(--border)"><div class="vc-av" style="width:52px;height:52px;font-size:19px;flex:none">TR</div><div style="min-width:0;flex:1"><div style="font-weight:600;font-size:16px">Teodora Ruiz</div><div class="muted bk-ell" style="font-size:12.5px">Studio lead · Palo Verde Co. · Guest</div></div><span class="btn" style="width:36px;padding:0">${ic("more", 16)}</span></div>
<div style="padding:14px 20px;border-bottom:1px solid var(--border)"><div class="vc-kv">
${ic("mail", 16)}<span class="bk-ell">teodora@paloverde.co</span>
${ic("clock", 16)}<span>10:15 PM in Madrid <span class="muted">· 6 h ahead of you</span></span>
${ic("folder", 16)}<span>Harbor launch · 3 shared projects</span></div></div>
<div style="padding:14px 20px 6px;border-bottom:1px solid var(--border)"><div style="display:flex;justify-content:space-between;align-items:center"><span style="font-weight:600;font-size:13px">Shared files</span><span class="muted" style="font-size:12px">See all 14</span></div>
${[["PDF", "Harbor pilot pricing v4.pdf", "Mara Okafor · 2 h ago"], ["FIG", "Banner options B", "Lin Park · yesterday"], ["XLS", "Pilot usage, Oct.xlsx", "Teodora Ruiz · Mon"]].map(([t, n, m]) => `<div class="vc-file"><span class="vc-ft">${t}</span><div style="min-width:0;flex:1"><div class="bk-ell" style="font-weight:500">${n}</div><div class="muted" style="font-size:11.5px">${m}</div></div>${ic("download", 15)}</div>`).join("")}</div>
<div style="padding:14px 20px;border-bottom:1px solid var(--border);display:grid;gap:8px"><div style="display:flex;justify-content:space-between;align-items:center"><span style="font-weight:600;font-size:13px">Recent messages</span><span class="muted" style="font-size:12px">Open chat</span></div>
<div class="vc-msg"><b style="font-weight:600">Teodora</b> <span class="muted" style="font-size:11px">3:58 PM</span><br>Can we do 10 minutes on the annual price before I sign off?</div>
<div class="vc-msg me"><b style="font-weight:600">You</b> <span class="muted" style="font-size:11px">4:01 PM</span><br>Calling you now, I’ll have the pilot numbers up.</div></div>
<div style="padding:14px 20px;flex:1;min-height:0;display:flex;flex-direction:column;gap:8px"><div style="display:flex;justify-content:space-between;align-items:center"><span style="font-weight:600;font-size:13px">Call notes</span><span class="muted" style="font-size:11.5px">Saved · visible to you</span></div>
<div style="flex:1;min-height:0;border:1px solid var(--border);border-radius:var(--radius);padding:10px 12px;font-size:13px;line-height:1.55;overflow:hidden">• Palo Verde wants annual Growth at <b>$24/seat</b>, 18 seats<br>• Needs invoice by 15 Nov for their budget<br>• Asked for SSO in Q1 — check with Jonah<span style="display:inline-block;width:1.5px;height:15px;background:var(--primary);vertical-align:-3px;margin-left:1px"></span></div>
<div class="bk-row" style="gap:8px"><span class="btn" style="flex:1">${ic("check", 15)}Create task</span><span class="btn" style="flex:1">${ic("share", 15)}Share notes</span></div></div>
</aside></main></div>`;

TPL["voice-call/mobile"] = (p, st, rnd) => `${CSS}<div class="phone vc-stage">${status()}
<div class="mtop" style="gap:12px;padding-top:8px">${ic("chevdown", 24)}<div style="flex:1;text-align:center;display:grid;justify-items:center;gap:2px"><span style="font-size:12px;font-weight:600">${esc(p.name)} call</span><span class="vc-dim bk-row" style="gap:5px;font-size:11.5px">${ic("lock", 11)}End-to-end encrypted</span></div>${I("adduser", 22)}</div>
<div style="flex:1;min-height:0;display:flex;flex-direction:column;align-items:center;text-align:center;padding:30px 24px 0">
${bigAv(116)}
<div class="h" style="font-size:${H(st, 30)}px;margin-top:40px">Teodora Ruiz</div>
<div class="vc-dim" style="font-size:14px;margin-top:2px">Studio lead · Palo Verde Co.</div>
<div class="num" style="font-size:22px;margin-top:8px">12:47</div>
<span class="vc-pill" style="margin-top:10px">${sig(4)}Excellent connection</span>
<div style="margin-top:12px">${wave(rnd, 22, 24)}</div>
<div style="margin-top:auto;margin-bottom:16px;width:100%;padding:12px 14px;border-radius:var(--radius-lg);background:color-mix(in oklab,var(--on-ink) 9%,var(--ink));display:flex;gap:12px;align-items:center;text-align:left">${ic("doc", 18)}<div style="flex:1;min-width:0"><div style="font-weight:600;font-size:13px">Call notes · 3 points</div><div class="vc-dim bk-ell" style="font-size:12px">Annual Growth at $24/seat, 18 seats…</div></div>${ic("chevron", 16)}</div>
</div>
<div style="flex:none;padding:18px 22px 30px;border-radius:24px 24px 0 0;background:color-mix(in oklab,var(--on-ink) 8%,var(--ink));display:grid;gap:14px">
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px 0">${vctl(I("micoff", 24), "Unmute", "on")}${vctl(I("keypad", 24), "Keypad")}${vctl(I("speaker", 24), "Speaker")}${vctl(I("adduser", 24), "Add")}${vctl(I("hold", 24), "Hold")}${vctl(I("cam", 24), "Video")}</div>
<div style="display:flex;justify-content:center"><span class="vc-end" style="width:68px;height:68px;padding:0">${I("hangup", 28)}</span></div></div></div>`;

// =============================================================================================
module.exports = {
  "bank-onboarding": {
    family: "bank", name: "Bank account onboarding", shows: "a digital business bank account-opening flow: a welcome screen with value props and a what-you'll-need checklist, an identity verification step, and the account-ready success screen",
    elements: ["onboarding", "progress-steps", "value-props", "checklist", "form", "masked-input", "trust-badge", "success-state", "bank-card", "next-steps", "fintech"],
    web: TPL["bank-onboarding/web"], mobile: TPL["bank-onboarding/mobile"],
    variants: {
      welcome: { name: "Bank account opening welcome", shows: "a fintech account-opening welcome with value props (fee-free account, invoicing, tax pots), a what-you'll-need checklist (photo ID, address, about 5 minutes), social proof and open-account / already-have-an-account buttons" },
      "verify-identity": { name: "Bank identity verification (KYC) step", shows: "a numbered application step list with completed steps checked and identity verification current, legal name, date of birth, a masked national ID with a show/hide toggle, home address, a plain-language why-we-ask and data-encryption note, a verify-with-ID-and-selfie button and a powered-by trust line" },
      "account-ready": { name: "Bank account ready (success)", shows: "an account-opened success state with partly masked sort code and account number and copy actions, a debit card visual with delivery tracking, and next steps: add money, set up a tax pot and invite your accountant" },
    },
  },
  "voice-call": {
    family: "workspace", name: "Voice call in progress", shows: "a one-to-one voice call with a large contact avatar, name and role, call timer, connection quality and a speaking waveform, mute, speaker, keypad, add person, hold and video controls with a prominent end-call button, and a contact details panel with email, local time, shared files, recent messages and call notes",
    elements: ["call-controls", "avatar", "timer", "connection-quality", "waveform", "end-call", "contact-details", "file-list", "chat-messages", "notes", "sidebar-nav"],
    web: TPL["voice-call/web"], mobile: TPL["voice-call/mobile"],
  },
};
