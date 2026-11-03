/* Error steps for flows (3-Nov-2026): the real login, two-factor and checkout screens re-rendered with their failure state
   (wrong password, account locked, expired code, card declined) injected into the same markup, so a flow can show the
   unhappy path in the same product and design system. Errors use --danger with an icon AND text (never colour alone). */
const { ic } = require("../lib");
const PILOT = require("./pilot"), AUTH = require("./auth"), APPS = require("./apps");

const alertBox = (title, body, action) => `<div role="alert" style="display:flex;gap:10px;align-items:flex-start;padding:12px 14px;border-radius:var(--radius);border:1px solid color-mix(in oklab,var(--danger) 45%,var(--border));background:color-mix(in oklab,var(--danger) 8%,var(--surface));font-size:13px;text-align:left">
<span style="color:var(--danger);display:inline-flex;margin-top:1px">${ic("x", 16)}</span><div style="flex:1"><div style="font-weight:600;color:var(--danger)">${title}</div><div style="margin-top:2px">${body}</div>${action ? `<div style="margin-top:6px;color:var(--primary);font-weight:600">${action}</div>` : ""}</div></div>`;
const ERR_FIELD = "border-color:var(--danger);box-shadow:0 0 0 3px color-mix(in oklab,var(--danger) 16%,transparent);";
const fieldErr = (t) => `<div style="display:flex;gap:6px;align-items:center;color:var(--danger);font-size:12px;font-weight:500;margin-top:6px">${ic("x", 13)}${t}</div>`;
// Insert `add` right after the first occurrence of `after` (throws if the anchor moved, so a template change can't silently drop the error).
function inject(html, after, add) { const i = html.indexOf(after); if (i < 0) throw new Error("flow-errors: anchor not found: " + after.slice(0, 40)); return html.slice(0, i + after.length) + add + html.slice(i + after.length); }
// Mark the first `.input` after `label` as invalid and put a message under it.
function badInput(html, label, msg) {
  const i = html.indexOf(label); if (i < 0) throw new Error("flow-errors: label not found: " + label);
  const j = html.indexOf('<div class="input filled" style="', i); if (j < 0) throw new Error("flow-errors: input not found after " + label);
  const k = j + '<div class="input filled" style="'.length;
  let out = html.slice(0, k) + ERR_FIELD + html.slice(k);
  if (msg) { const end = out.indexOf("</div>", out.indexOf(">", k)) + 6; out = out.slice(0, end) + fieldErr(msg) + out.slice(end); }
  return out;
}

const LOGIN_HEAD = "Sign in to pick up where your team left off.</p></div>";
const TPL = {};
TPL["auth-error"] = {
  family: "workspace", name: "Sign-in error",
  shows: "the sign-in or two-factor screen after a failed attempt, with an error alert and the field at fault marked",
  elements: ["form", "input", "alert", "inline-errors", "auth", "button", "validation"],
  variants: {
    "wrong-password": { name: "Sign-in error: wrong password", shows: "the sign-in screen after a wrong password: an alert with the attempts left before a temporary lock, the password field marked with an icon and message, and the Forgot? link kept close" },
    "account-locked": { name: "Sign-in error: account locked", shows: "the sign-in screen after too many attempts: an alert that sign-in is paused for 15 minutes with a countdown, why it happened, and a reset-password action" },
    "code-expired": { name: "Two-factor error: code expired", shows: "the two-factor screen after an expired code: an alert explaining the code timed out, the code boxes marked, and a resend action" },
  },
  web: (p, st, rnd) => render(p, st, rnd, "web"),
  mobile: (p, st, rnd) => render(p, st, rnd, "mobile"),
};
function render(p, st, rnd, plat) {
  if (p.variant === "code-expired") {
    let h = AUTH["two-factor"][plat](p, st, rnd);
    const head = plat === "web" ? "Two-step verification</h1>" : "Enter your code</h1>";
    const i = h.indexOf(head); const pEnd = h.indexOf("</p>", i) + 4;
    h = h.slice(0, pEnd) + `<div style="margin-top:12px">${plat === "web" ? alertBox("That code has expired", "Codes last 30 seconds. Enter the newest code from your authenticator app.", "Resend code") : alertBox("That code has expired", "Enter the newest code from your app.")}</div>` + h.slice(pEnd);
    // mobile: make room for the alert above the keypad by dropping the trust-this-device row
    if (plat === "mobile") h = h.replace(/<label(?:(?!<\/label>)[^])*?Trust this device(?:(?!<\/label>)[^])*?<\/label>/, "");
    return h;
  }
  let h = PILOT["login"][plat](p, st, rnd);
  if (p.variant === "account-locked") {
    h = inject(h, LOGIN_HEAD, alertBox("Sign-in paused for 15 minutes", "5 incorrect passwords for mara@juniperbakery.co. Try again at 10:42, or reset your password now.", "Reset password →"));
    return badInput(h, "Password <span", null);
  }
  h = inject(h, LOGIN_HEAD, alertBox("Incorrect email or password", "Check your password and try again. 2 attempts left before sign-in pauses for 15 minutes."));
  return badInput(h, "Password <span", "Incorrect password");
}

TPL["payment-declined"] = {
  family: "commerce", name: "Checkout: card declined",
  shows: "the checkout after a declined card: an error alert in the payment section saying why and what to do, the card field marked with an icon and message, other payment options kept visible, and the Pay button ready to retry",
  elements: ["form", "payment-form", "alert", "inline-errors", "order-summary", "express-pay", "checkout", "validation"],
  // web: the alert needs ~70px, so the name-on-card field (prefilled, not at fault) is dropped to keep Pay on screen
  web: (p, st, rnd) => declined(APPS["checkout"].web(p, st, rnd).replace(/<div class="field"(?:(?!<div class="field")[^])*?Name on card<\/label><div class="input filled"[^>]*>[^<]*<\/div><\/div>/, "")),
  mobile: (p, st, rnd) => declined(APPS["checkout"].mobile(p, st, rnd)),
};
function declined(h) {
  const i = h.indexOf("Card number</label>"); if (i < 0) throw new Error("flow-errors: checkout card field moved");
  const fieldStart = h.lastIndexOf('<div class="field"', i);
  h = h.slice(0, fieldStart) + `<div style="margin-bottom:10px">${alertBox("Your card was declined", "The bank declined the card ending 4242 (insufficient funds). Nothing was charged. Use another card or pay in 4 instalments.")}</div>` + h.slice(fieldStart);
  return badInput(h, "Card number</label>", "Declined by your bank");
}

module.exports = TPL;
