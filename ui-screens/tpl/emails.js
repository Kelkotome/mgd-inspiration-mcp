/* Transactional emails (5-Nov-2026 round, from real MCP queries: "check your email confirmation sent success receipt",
   "newsletter email template" — the library had no email at all).
   account-email (Fernway workspace): welcome, verify-email, magic-link, password-reset, invoice.
   order-email (Juniper Supply store): receipt, shipping-update.
   Unlike every other pattern these return a WHOLE email document (type "email"; gen.js uses it as-is), because the code must
   survive email clients: table layout (role="presentation"), inline styles with resolved hex colours (no CSS variables, no
   color-mix, no flex/grid), a 600px container that goes fluid under 620px, td-bgcolor "bulletproof" buttons, an MSO wrapper
   table for Outlook, hidden preheader text, alt text and real <h1>s. Dark mode: prefers-color-scheme + Outlook.com [data-ogsc]
   overrides on em-* classes, with the family's dark tokens. Web = desktop client width, mobile = 390px client; same HTML. */
const { esc } = require("../lib");

// ---- colour helpers (emails need resolved hex, so we mix in sRGB here instead of color-mix) ----
const hx = (h) => { h = h.replace("#", ""); if (h.length === 3) h = h.split("").map((c) => c + c).join(""); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)); };
const toHex = (a) => "#" + a.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
const mix = (a, b, pct) => { const A = hx(a), B = hx(b); return toHex(A.map((v, i) => v * pct / 100 + B[i] * (1 - pct / 100))); };
const STATUS = { light: { success: "#2b7a4b", warning: "#8a5a00", danger: "#b42318" }, dark: { success: "#6cc58f", warning: "#e2b65c", danger: "#f08a7e" } };

// Resolved palette for one theme: what the inline styles (light) and the dark overrides use.
const lum = (h) => { const [r, g, b] = hx(h).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
function pal(t, dark) {
  const s = STATUS[dark ? "dark" : "light"];
  // Email convention: the message card is the lighter of background/surface, the client canvas the darker one.
  const [cv, cd] = lum(t.background) >= lum(t.surface) ? [t.surface, t.background] : [t.background, t.surface];
  return { bg: cv, card: cd, border: t.border, text: t.text, muted: t.muted, primary: t.primary, onp: t["on-primary"], accent: t.accent,
    tint: mix(t.primary, cd, dark ? 16 : 8), tint2: mix(t.accent, cd, dark ? 18 : 12), rule: mix(t.border, cd, 70), success: s.success, warning: s.warning, danger: s.danger,
    link: dark ? mix(t.primary, t.text, 60) : t.primary };
}

// Style traits that change email markup (fonts with fallbacks, borders, button case).
function traits(st, style) {
  const serifH = /Serif|Garamond|Fraunces/.test(st.hf);
  return { hf: `'${st.hf}',${serifH ? "Georgia,'Times New Roman',serif" : "Arial,Helvetica,sans-serif"}`, bf: `'${st.bf}',Arial,Helvetica,sans-serif`, hw: st.hw,
    hscale: st.hscale, r: Math.min(parseInt(st.radius, 10), 12), heavy: style === "brutalist" || style === "retro", upper: style === "luxury" || style === "brutalist",
    track: style === "luxury" ? "0.14em" : style === "brutalist" ? "0.04em" : "0", hUpper: style === "brutalist", style };
}

// Bulletproof button: the td carries the colour (Outlook paints it), the link carries the padding.
const button = (T, P, label, href, ghost) => `<table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse:separate"><tr>
<td class="${ghost ? "em-card em-bd" : "em-btn"}" align="center" bgcolor="${ghost ? P.card : P.primary}" style="border-radius:${T.style === "playful" ? 999 : T.r}px;${ghost ? `border:${T.heavy ? 2 : 1}px solid ${T.heavy ? P.text : P.border};` : T.heavy ? `border:2px solid ${P.text};` : ""}">
<a class="${ghost ? "em-text" : "em-btnt"}" href="${href}" target="_blank" style="display:inline-block;padding:${ghost ? "11px 20px" : "14px 28px"};font-family:${T.bf};font-size:${T.upper ? 13 : 15}px;font-weight:700;line-height:20px;letter-spacing:${T.upper ? "0.08em" : "0"};${T.upper ? "text-transform:uppercase;" : ""}color:${ghost ? P.text : P.onp};text-decoration:none;border-radius:${T.style === "playful" ? 999 : T.r}px">${label}</a></td></tr></table>`;

const preheader = (txt) => `<div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all">${esc(txt)}${"&#847;&zwnj;&nbsp;".repeat(30)}</div>`;

// Whole document. `inner` = rows (<tr>…</tr>) inside the white card; brand row above and footer below are shared.
function doc(p, st, { title, pre, inner, footer }) {
  const style = p.style, T = traits(st, style), L = pal(p.tokens.light, false), D = pal(p.tokens.dark, true);
  const darkRules = (pre2) => `${pre2} .em-bg{background:${D.bg}!important}${pre2} .em-card{background:${D.card}!important}${pre2} .em-bd{border-color:${D.border}!important}${pre2} .em-rule{border-color:${D.rule}!important}
${pre2} .em-text{color:${D.text}!important}${pre2} .em-muted{color:${D.muted}!important}${pre2} .em-link{color:${D.link}!important}${pre2} .em-btn{background:${D.primary}!important;border-color:${D.primary}!important}${pre2} .em-btnt{color:${D.onp}!important}
${pre2} .em-tint{background:${D.tint}!important}${pre2} .em-tint2{background:${D.tint2}!important}${pre2} .em-mark{background:${D.primary}!important}${pre2} .em-ok{color:${D.success}!important}${pre2} .em-warn{color:${D.warning}!important}${pre2} .em-dot-on{background:${D.primary}!important}${pre2} .em-dot-off{background:${D.border}!important}`;
  const css = `body{margin:0!important;padding:0!important;width:100%!important;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}
table,td{border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt}img{border:0;outline:none;text-decoration:none;display:block;-ms-interpolation-mode:bicubic}
a[x-apple-data-detectors]{color:inherit!important;text-decoration:none!important}u+#body a{color:inherit;text-decoration:none}
@media only screen and (max-width:620px){.em-wrap{width:100%!important;max-width:100%!important}.em-px{padding-left:22px!important;padding-right:22px!important}.em-out{padding:16px 10px!important}
.em-stack{display:block!important;width:100%!important;box-sizing:border-box}.em-stack-gap{padding:0 0 12px 0!important}.em-h1{font-size:${Math.round(26 * T.hscale)}px!important;line-height:1.2!important}.em-hide-sm{display:none!important}.em-full table{width:100%!important}}
@media (prefers-color-scheme:dark){${darkRules("")}}
${darkRules("[data-ogsc]")}
${darkRules("[data-ogsb]")}`;
  const bd = T.heavy ? `2px solid ${L.text}` : `1px solid ${L.border}`;
  const fontsHref = `https://fonts.googleapis.com/css2?family=${st.fonts}&display=swap`;
  return `<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="x-apple-disable-message-reformatting"><meta name="format-detection" content="telephone=no,address=no,email=no,date=no">
<meta name="color-scheme" content="light dark"><meta name="supported-color-schemes" content="light dark">
<title>${esc(title)}</title>
<!-- Made Good Designs UI screen — original transactional email template, free to copy. Table layout + inline styles for email clients; tokens: see DESIGN.md -->
<!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:AllowPNG/><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
<!--[if !mso]><!--><link href="${fontsHref}" rel="stylesheet"><!--<![endif]-->
<style>${css}</style>
</head>
<body id="body" class="em-bg" style="margin:0;padding:0;background:${L.bg};word-spacing:normal">
${preheader(pre)}
<div role="article" aria-roledescription="email" aria-label="${esc(title)}" lang="en">
<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" class="em-bg" bgcolor="${L.bg}" style="background:${L.bg}"><tr><td align="center" class="em-out" style="padding:36px 16px">
<!--[if mso]><table role="presentation" width="600" border="0" cellpadding="0" cellspacing="0"><tr><td><![endif]-->
<table role="presentation" class="em-wrap" width="600" border="0" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px">
<tr><td style="padding:0 4px 18px 4px"><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr>
<td class="em-mark" width="24" height="24" bgcolor="${L.primary}" style="width:24px;height:24px;border-radius:${Math.round(T.r / 2)}px;font-size:0;line-height:0">&nbsp;</td>
<td class="em-text" style="padding-left:10px;font-family:${T.bf};font-size:17px;font-weight:700;color:${L.text};letter-spacing:-0.01em">${esc(p.name)}</td></tr></table></td></tr>
<tr><td><table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" class="em-card em-bd" bgcolor="${L.card}" style="border-collapse:separate;background:${L.card};border:${bd};border-radius:${T.r * 1.5}px">${inner(T, L)}</table></td></tr>
<tr><td class="em-px" style="padding:22px 28px 0 28px;font-family:${T.bf};font-size:12px;line-height:19px;color:${L.muted}"><span class="em-muted">${footer}</span></td></tr>
</table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr></table></div>
</body></html>`;
}

// ---- shared rows ----
const H1 = (T, L, txt) => `<tr><td class="em-px" style="padding:36px 40px 0 40px"><h1 class="em-h1 em-text" style="margin:0;font-family:${T.hf};font-size:${Math.round(30 * T.hscale)}px;line-height:1.18;font-weight:${T.hw};color:${L.text};${T.hUpper ? "text-transform:uppercase;letter-spacing:-0.01em;" : ""}">${txt}</h1></td></tr>`;
const P = (T, L, txt, pad = "14px 40px 0 40px", size = 16, muted) => `<tr><td class="em-px ${muted ? "em-muted" : "em-text"}" style="padding:${pad};font-family:${T.bf};font-size:${size}px;line-height:${Math.round(size * 1.55)}px;color:${muted ? L.muted : L.text}">${txt}</td></tr>`;
const BTN = (T, L, label, href, pad = "26px 40px 0 40px") => `<tr><td class="em-px" style="padding:${pad}">${button(T, L, label, href)}</td></tr>`;
const RULE = (T, L, pad = "28px 40px 0 40px") => `<tr><td class="em-px" style="padding:${pad}"><table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0"><tr><td class="em-rule" style="border-top:1px solid ${L.rule};font-size:0;line-height:0;height:1px">&nbsp;</td></tr></table></td></tr>`;
const LABEL = (T, L, txt) => `<span class="em-muted" style="font-family:${T.bf};font-size:11px;line-height:16px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${L.muted}">${txt}</span>`;
const fallback = (T, L, url) => P(T, L, `Button not working? Paste this link into your browser:<br><a class="em-link" href="${url}" style="color:${L.link};text-decoration:underline;word-break:break-all">${url}</a>`, "22px 40px 0 40px", 13, true);
// key/value rows in a tinted box (request details, totals)
const kv = (T, L, rows, opts = {}) => `<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0">${rows.map(([k, v, b], i) =>
  `<tr><td class="${b ? "em-text" : "em-muted"}" style="padding:${i ? 7 : 0}px 0 0 0;font-family:${T.bf};font-size:${b ? 15 : 14}px;line-height:20px;color:${b ? L.text : L.muted};${b ? "font-weight:700;" : ""}">${k}</td>
<td class="em-text" align="right" style="padding:${i ? 7 : 0}px 0 0 12px;font-family:${T.bf};font-size:${b ? (opts.big ? 20 : 15) : 14}px;line-height:20px;color:${L.text};font-weight:${b ? 700 : 500};font-variant-numeric:tabular-nums;white-space:nowrap">${v}</td></tr>`).join("")}</table>`;
const box = (T, L, inner, pad = "24px 40px 0 40px", tint = true) => `<tr><td class="em-px" style="padding:${pad}"><table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0"><tr>
<td class="${tint ? "em-tint" : "em-card em-bd"}" bgcolor="${tint ? L.tint : L.card}" style="padding:18px 20px;border-radius:${T.r}px;${tint ? "" : `border:1px solid ${L.border};`}">${inner}</td></tr></table></td></tr>`;
const requestDetails = (T, L, what) => box(T, L, `${LABEL(T, L, what)}<div style="height:8px;line-height:8px;font-size:0">&nbsp;</div>${kv(T, L, [["When", "Wed 4 Nov 2026, 09:41 SGT"], ["Device", "Safari on macOS"], ["Near", "Singapore (approximate)"]])}`);

// ---- account-email (Fernway) ----
const FW_FOOT = (p, why) => `${why}<br><a class="em-muted" href="https://example.com/help" style="color:inherit;text-decoration:underline">Help centre</a> &nbsp;·&nbsp; <a class="em-muted" href="https://example.com/settings/notifications" style="color:inherit;text-decoration:underline">Email settings</a><br>${esc(p.name)} · 18 Ferry Lane, #04-02, Singapore 049320`;
const step = (T, L, n, title, sub, done) => `<tr><td class="em-px" style="padding:14px 40px 0 40px"><table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0"><tr>
<td width="34" valign="top" style="width:34px"><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="${done ? "em-btn" : "em-tint"}" width="28" height="28" align="center" bgcolor="${done ? L.primary : L.tint}" style="width:28px;height:28px;border-radius:14px;font-family:${T.bf};font-size:13px;font-weight:700;color:${done ? L.onp : L.text}"><span class="${done ? "em-btnt" : "em-text"}">${done ? "&#10003;" : n}</span></td></tr></table></td>
<td valign="top" style="padding-left:12px"><div class="em-text" style="font-family:${T.bf};font-size:15px;line-height:22px;font-weight:700;color:${L.text}">${title}</div><div class="em-muted" style="font-family:${T.bf};font-size:14px;line-height:21px;color:${L.muted}">${sub}</div></td></tr></table></td></tr>`;

const ACCOUNT = {
  welcome: (p) => ({ title: `Welcome to ${p.name}, Mara`, pre: "Your workspace Kestrel Studio is ready. Three quick steps to get your team going.",
    footer: FW_FOOT(p, "You’re getting this because you created a Fernway workspace with mara@kestrelstudio.co."),
    inner: (T, L) => H1(T, L, "Welcome to Fernway, Mara") + P(T, L, "Your workspace <b>Kestrel Studio</b> is ready. Most teams are up and running in about ten minutes — here’s where to start.") +
      step(T, L, 1, "Create your workspace", "Done. You’re the admin of Kestrel Studio.", true) + step(T, L, 2, "Start your first project", "Pick a template (client launch, content calendar or sprint) or start blank.") +
      step(T, L, 3, "Invite your team", "Add up to 5 teammates free. They’ll get an email like this one.") + step(T, L, 4, "Connect your calendar", "Due dates show up next to your meetings.") +
      BTN(T, L, "Open your workspace", "https://example.com/w/kestrel-studio") + RULE(T, L) +
      P(T, L, `<b>Need a hand?</b> Reply to this email and a real person on our team will answer, usually within a working day. Or read the <a class="em-link" href="https://example.com/guide" style="color:${L.link}">10-minute setup guide</a>.`, "22px 40px 36px 40px", 14, true) }),
  "verify-email": (p) => ({ title: "Confirm your email address", pre: "Confirm mara@kestrelstudio.co to finish creating your Fernway account. Code: 418 207",
    footer: FW_FOOT(p, "You’re getting this because someone signed up for Fernway with this address. If it wasn’t you, you can ignore it."),
    inner: (T, L) => H1(T, L, "Confirm your email address") + P(T, L, "Tap the button to confirm <b>mara@kestrelstudio.co</b> and finish setting up your Fernway account.") +
      BTN(T, L, "Verify email address", "https://example.com/verify?t=8f2c41") +
      box(T, L, `${LABEL(T, L, "Or enter this code")}<div class="em-text" style="padding-top:6px;font-family:${T.bf};font-size:32px;line-height:40px;font-weight:700;letter-spacing:0.22em;color:${L.text};font-variant-numeric:tabular-nums">418 207</div><div class="em-muted" style="font-family:${T.bf};font-size:13px;line-height:19px;color:${L.muted}">The link and code expire in 24 hours.</div>`, "26px 40px 0 40px") +
      fallback(T, L, "https://example.com/verify?t=8f2c41") +
      P(T, L, "Didn’t sign up? Ignore this email and nothing will happen — the account is deleted if it isn’t confirmed.", "16px 40px 36px 40px", 13, true) }),
  "magic-link": (p) => ({ title: `Your ${p.name} sign-in link`, pre: "Tap to sign in to Fernway. The link works once and expires in 15 minutes.",
    footer: FW_FOOT(p, "You’re getting this because a sign-in link was requested for mara@kestrelstudio.co."),
    inner: (T, L) => H1(T, L, "Sign in to Fernway") + P(T, L, "Here’s the sign-in link you asked for. It works once and expires in <b>15 minutes</b>.") +
      BTN(T, L, "Sign in as mara@kestrelstudio.co", "https://example.com/auth/link?t=c71e09") + requestDetails(T, L, "Requested from") +
      P(T, L, `Didn’t ask for this? Someone may have typed your address by mistake. You can ignore this email, or <a class="em-link" href="https://example.com/security" style="color:${L.link}">review your account security</a>.`, "22px 40px 0 40px", 14, true) +
      fallback(T, L, "https://example.com/auth/link?t=c71e09").replace("22px 40px 0 40px", "14px 40px 36px 40px") }),
  "password-reset": (p) => ({ title: "Reset your password", pre: "Use this link within 60 minutes to choose a new Fernway password.",
    footer: FW_FOOT(p, "You’re getting this because a password reset was requested for your Fernway account."),
    inner: (T, L) => H1(T, L, "Reset your password") + P(T, L, "We got a request to reset the password for <b>mara@kestrelstudio.co</b>. Choose a new one with the button below. The link expires in <b>60 minutes</b>.") +
      BTN(T, L, "Choose a new password", "https://example.com/reset?t=5a90d3") + requestDetails(T, L, "Request details") +
      P(T, L, "If you didn’t ask for a reset, you can ignore this email — your password stays the same. Resetting signs you out on every other device.", "22px 40px 0 40px", 14, true) +
      fallback(T, L, "https://example.com/reset?t=5a90d3").replace("22px 40px 0 40px", "14px 40px 36px 40px") }),
  invoice: (p) => ({ title: `${p.name} invoice INV-2026-0118`, pre: "Paid: $113.36 for Kestrel Studio, Team plan, November 2026.",
    footer: FW_FOOT(p, "You’re getting this because you’re a billing admin for Kestrel Studio."),
    inner: (T, L) => H1(T, L, "Thanks — your invoice is paid") + P(T, L, "Here’s the November invoice for <b>Kestrel Studio</b>. No action needed; the PDF is attached for your records.") +
      `<tr><td class="em-px" style="padding:24px 40px 0 40px"><table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0"><tr>
<td class="em-stack em-stack-gap" width="50%" valign="top" style="padding-right:12px">${LABEL(T, L, "Invoice")}<div class="em-text" style="font-family:${T.bf};font-size:15px;line-height:22px;font-weight:700;color:${L.text};padding-top:4px">INV-2026-0118</div><div class="em-muted" style="font-family:${T.bf};font-size:14px;line-height:21px;color:${L.muted}">Issued 1 Nov 2026</div></td>
<td class="em-stack" width="50%" valign="top">${LABEL(T, L, "Status")}<div class="em-ok" style="font-family:${T.bf};font-size:15px;line-height:22px;font-weight:700;color:${L.success};padding-top:4px">&#10003; Paid 1 Nov 2026</div><div class="em-muted" style="font-family:${T.bf};font-size:14px;line-height:21px;color:${L.muted}">Visa ending 4242</div></td></tr></table></td></tr>` +
      `<tr><td class="em-px" style="padding:22px 40px 0 40px"><table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0">
<tr><th align="left" class="em-muted em-rule" style="padding:0 0 8px 0;border-bottom:1px solid ${L.rule};font-family:${T.bf};font-size:12px;font-weight:700;color:${L.muted};letter-spacing:0.06em;text-transform:uppercase">Description</th><th align="right" class="em-muted em-rule em-hide-sm" style="padding:0 0 8px 8px;border-bottom:1px solid ${L.rule};font-family:${T.bf};font-size:12px;font-weight:700;color:${L.muted};letter-spacing:0.06em;text-transform:uppercase">Qty</th><th align="right" class="em-muted em-rule" style="padding:0 0 8px 8px;border-bottom:1px solid ${L.rule};font-family:${T.bf};font-size:12px;font-weight:700;color:${L.muted};letter-spacing:0.06em;text-transform:uppercase">Amount</th></tr>
${[["Team plan · 1–30 Nov 2026", "8 seats × $12.00", "8", "$96.00"], ["Extra storage · 100 GB", "Add-on", "1", "$8.00"]].map(([d, s, q, a]) => `<tr><td class="em-rule" style="padding:12px 0;border-bottom:1px solid ${L.rule}"><div class="em-text" style="font-family:${T.bf};font-size:15px;line-height:21px;color:${L.text};font-weight:600">${d}</div><div class="em-muted" style="font-family:${T.bf};font-size:13px;line-height:19px;color:${L.muted}">${s}</div></td><td align="right" class="em-text em-rule em-hide-sm" style="padding:12px 0 12px 8px;border-bottom:1px solid ${L.rule};font-family:${T.bf};font-size:15px;color:${L.text};font-variant-numeric:tabular-nums">${q}</td><td align="right" class="em-text em-rule" style="padding:12px 0 12px 8px;border-bottom:1px solid ${L.rule};font-family:${T.bf};font-size:15px;color:${L.text};font-variant-numeric:tabular-nums;white-space:nowrap">${a}</td></tr>`).join("")}
</table></td></tr>` +
      box(T, L, kv(T, L, [["Subtotal", "$104.00"], ["GST (9%)", "$9.36"], ["Total paid", "$113.36", true]], { big: true }), "16px 40px 0 40px") +
      `<tr><td class="em-px" style="padding:26px 40px 0 40px"><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td style="padding-right:10px">${button(T, L, "Download PDF", "https://example.com/billing/INV-2026-0118.pdf")}</td><td>${button(T, L, "Billing settings", "https://example.com/billing", true)}</td></tr></table></td></tr>` +
      P(T, L, "Questions about a charge? Reply to this email with the invoice number and our billing team will help.", "22px 40px 36px 40px", 13, true) }),
};

// ---- order-email (Juniper Supply) ----
const JS_ITEMS = [["Stoneware pour-over set", "Sand · 1", "$48.00", "#cdb89a"], ["Linen tea towels, set of 3", "Oat · 2", "$36.00", "#d8d2c4"], ["Walnut serving board", "Large · 1", "$64.00", "#8a6248"]];
const JS_FOOT = (p) => `Order JS-48213 · placed Wed 4 Nov 2026<br><a class="em-muted" href="https://example.com/help/returns" style="color:inherit;text-decoration:underline">Returns (30 days)</a> &nbsp;·&nbsp; <a class="em-muted" href="https://example.com/help" style="color:inherit;text-decoration:underline">Contact us</a><br>${esc(p.name)} · 7 Kiln Street, Singapore 059380`;
const itemRows = (T, L, items) => `<tr><td class="em-px" style="padding:20px 40px 0 40px"><table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0">${items.map(([n, v, a, c], i) =>
  `<tr><td width="64" valign="top" style="width:64px;padding:${i ? 14 : 0}px 0 0 0"><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td width="64" height="64" bgcolor="${c}" style="width:64px;height:64px;border-radius:${T.r}px;font-size:0;line-height:0" role="img" aria-label="${esc(n)} product photo">&nbsp;</td></tr></table></td>
<td valign="middle" style="padding:${i ? 14 : 0}px 0 0 14px"><div class="em-text" style="font-family:${T.bf};font-size:15px;line-height:21px;font-weight:600;color:${L.text}">${n}</div><div class="em-muted" style="font-family:${T.bf};font-size:13px;line-height:19px;color:${L.muted}">${v}</div></td>
<td align="right" valign="middle" class="em-text" style="padding:${i ? 14 : 0}px 0 0 8px;font-family:${T.bf};font-size:15px;color:${L.text};font-variant-numeric:tabular-nums;white-space:nowrap">${a}</td></tr>`).join("")}</table></td></tr>`;
const addressCols = (T, L) => `<tr><td class="em-px" style="padding:24px 40px 0 40px"><table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0"><tr>
<td class="em-stack em-stack-gap" width="50%" valign="top" style="padding-right:12px">${LABEL(T, L, "Shipping to")}<div class="em-text" style="padding-top:6px;font-family:${T.bf};font-size:14px;line-height:21px;color:${L.text}">Priya Nair<br>2 Harbour Road, Flat 4<br>Dockside, Singapore 098631</div></td>
<td class="em-stack" width="50%" valign="top">${LABEL(T, L, "Paid with")}<div class="em-text" style="padding-top:6px;font-family:${T.bf};font-size:14px;line-height:21px;color:${L.text}">Visa ending 4242<br><span class="em-muted" style="color:${L.muted}">Charged Wed 4 Nov 2026</span></div></td></tr></table></td></tr>`;
const tracker = (T, L, cur) => {
  const stages = ["Ordered", "Packed", "Shipped", "Out for delivery", "Delivered"];
  return `<tr><td class="em-px" style="padding:26px 40px 0 40px"><table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0"><tr>${stages.map((s, i) =>
    `<td width="20%" valign="top" style="padding-right:${i < 4 ? 4 : 0}px"><table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0"><tr><td class="${i <= cur ? "em-dot-on" : "em-dot-off"}" height="6" bgcolor="${i <= cur ? L.primary : L.border}" style="height:6px;font-size:0;line-height:0;border-radius:3px">&nbsp;</td></tr></table>
<div class="${i <= cur ? "em-text" : "em-muted"}" style="padding-top:8px;font-family:${T.bf};font-size:12px;line-height:16px;font-weight:${i === cur ? 700 : 500};color:${i <= cur ? L.text : L.muted}">${s}</div></td>`).join("")}</tr></table></td></tr>`;
};

const ORDER = {
  receipt: (p) => ({ title: "Order JS-48213 confirmed — your receipt", pre: "Thanks, Priya. 4 items, $161.32 paid. Arrives Thu 12 – Sat 14 Nov.",
    footer: JS_FOOT(p),
    inner: (T, L) => H1(T, L, "Thanks, Priya — your order’s in") + P(T, L, "We’re packing it now and will email tracking as soon as it ships. Estimated delivery: <b>Thu 12 – Sat 14 Nov</b>.") +
      box(T, L, kv(T, L, [["Order number", "JS-48213", true], ["Placed", "Wed 4 Nov 2026, 14:06"]]), "22px 40px 0 40px") +
      itemRows(T, L, JS_ITEMS) + RULE(T, L, "20px 40px 0 40px") +
      `<tr><td class="em-px" style="padding:16px 40px 0 40px">${kv(T, L, [["Subtotal", "$148.00"], ["Shipping", "Free"], ["GST (9%)", "$13.32"], ["Total", "$161.32", true]], { big: true })}</td></tr>` +
      addressCols(T, L) + BTN(T, L, "View your order", "https://example.com/orders/JS-48213", "28px 40px 0 40px") +
      P(T, L, "Need to change something? You can edit the address or cancel until the order ships, usually within 24 hours.", "20px 40px 36px 40px", 13, true) }),
  "shipping-update": (p) => ({ title: "Your Juniper Supply order is on its way", pre: "Order JS-48213 shipped with Parcelway. Arriving Thu 12 Nov by 6 pm.",
    footer: JS_FOOT(p),
    inner: (T, L) => H1(T, L, "Your order is on its way") + P(T, L, "Good news, Priya — order <b>JS-48213</b> left our warehouse this morning and is with Parcelway.") +
      tracker(T, L, 2) +
      box(T, L, `<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0"><tr><td class="em-stack em-stack-gap" valign="top" style="padding-right:12px">${LABEL(T, L, "Arriving")}<div class="em-text" style="padding-top:4px;font-family:${T.hf};font-size:${Math.round(24 * T.hscale)}px;line-height:1.2;font-weight:${T.hw};color:${L.text}">Thu 12 Nov, by 6 pm</div></td>
<td class="em-stack" valign="top" align="left" style="width:46%">${LABEL(T, L, "Parcelway tracking")}<div class="em-text" style="padding-top:4px;font-family:${T.bf};font-size:15px;line-height:22px;font-weight:700;color:${L.text};letter-spacing:0.04em;font-variant-numeric:tabular-nums">PW 7730 4419 21</div></td></tr></table>`, "24px 40px 0 40px") +
      BTN(T, L, "Track your package", "https://example.com/track/PW773044192", "24px 40px 0 40px") +
      P(T, L, "<b>In this parcel</b>", "26px 40px 0 40px", 15) + itemRows(T, L, JS_ITEMS).replace("padding:20px 40px 0 40px", "padding:12px 40px 0 40px") + RULE(T, L, "22px 40px 0 40px") +
      P(T, L, "Not home? Parcelway leaves parcels with building security or at the nearest locker, and texts you a pickup code. You can also choose a safe place from the tracking page.", "18px 40px 36px 40px", 13, true) }),
};

const email = (map) => (p, st) => doc(p, st, map[p.variant](p));
const elements = ["email", "table-layout", "button", "preheader", "dark-mode"];
module.exports = {
  "account-email": { family: "workspace", type: "email", name: "Account email",
    shows: "a transactional account email (table-based, inline-styled HTML for email clients) with a headline, a bulletproof call-to-action button, a fallback link, request details and a footer",
    elements, size: { web: [760, 1300], mobile: [390, 1500] },
    variants: {
      welcome: { name: "Welcome email", shows: "a welcome email for a new workspace admin with a getting-started checklist (one step done), an open-workspace button and a reply-for-help note" },
      "verify-email": { name: "Verify email address email", shows: "an email-verification email with a verify button, a 6-digit code alternative, a 24-hour expiry and a plain fallback link" },
      "magic-link": { name: "Magic link sign-in email", shows: "a passwordless sign-in (magic link) email with a one-time sign-in button, 15-minute expiry, the device, time and approximate location of the request, and a security link" },
      "password-reset": { name: "Password reset email", shows: "a password reset email with a choose-new-password button, a 60-minute expiry, request details and an ignore-if-not-you note" },
      invoice: { name: "Invoice email (paid)", shows: "a paid subscription invoice email with invoice number, paid status, a line-item table with seats and an add-on, subtotal, GST and total, and download-PDF and billing buttons" },
    },
    web: email(ACCOUNT), mobile: email(ACCOUNT) },
  "order-email": { family: "commerce", type: "email", name: "Order email",
    shows: "a transactional order email for an online store (table-based, inline-styled HTML for email clients) with order number, product rows with thumbnails, totals, address and a call-to-action button",
    elements: [...elements, "receipt"], size: { web: [760, 1400], mobile: [390, 1700] },
    variants: {
      receipt: { name: "Order receipt email", shows: "an order confirmation receipt email with order number, three product rows with thumbnails and prices, subtotal, shipping, tax and total, shipping address, payment method and a view-order button" },
      "shipping-update": { name: "Shipping update email", shows: "a shipping notification email with a five-stage delivery tracker (ordered, packed, shipped, out for delivery, delivered), arrival date, carrier tracking number, a track-package button and the parcel contents" },
    },
    web: email(ORDER), mobile: email(ORDER) },
};
