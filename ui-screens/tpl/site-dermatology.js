/* Dermatology clinic website template (Sorrel Lane Dermatology, fictional medical and cosmetic clinic). Full responsive home page:
   nav, a centred hero over a contour-line pattern, the clinic's two sides as parallel price columns (a CSS-only radio switch on phones),
   conditions as paint-chip texture swatches, the skin check journey with a dermatoscope diagram, procedures with a patch testing week,
   a photo-first enquiry card with a privacy note, clinician bios with a credentials slot, how to prepare, booking.
   No skin photos, no before and after, no brand names, no outcome claims: all imagery is abstract and themed through CSS variables. */
const { ic, esc } = require("../lib");
const K = require("../sitekit");

const CSS = `<style>
.sl>.sk-sec{padding:60px 0}
.sl h1,.sl h2{text-wrap:balance}
.sl-hero{position:relative;overflow:hidden;text-align:center;padding:64px 0 56px}
.sl-hero>svg{position:absolute;inset:0;width:100%;height:100%;max-width:none}
.sl-hero path{fill:none;stroke:color-mix(in oklab,var(--primary) 26%,var(--bg));stroke-width:1.2}
.sl-hero .sk-wrap{position:relative;display:grid;justify-items:center;gap:16px}
.sl-hero h1{max-width:860px}
.sl-hero .sk-lede{max-width:620px}
.sl-hero .sk-eyebrow,.sl-hero h1,.sl-hero .sk-lede{background:color-mix(in oklab,var(--bg) 78%,transparent);box-shadow:0 0 22px 14px color-mix(in oklab,var(--bg) 78%,transparent)}
.sl-routes{display:flex;flex-wrap:wrap;justify-content:center;gap:10px;margin-top:4px}
.sl-spine{width:1px;height:44px;margin:0 auto;background:var(--text)}
.sl-radio{position:absolute;width:1px;height:1px;opacity:0}
.sl-switch{display:none}
.sl-sides{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));border:1px solid var(--border);border-radius:var(--radius-lg);overflow:hidden;background:var(--surface)}
.sl-col{padding:36px 36px 30px;display:grid;gap:14px;align-content:start}
.sl-col+.sl-col{border-left:1px solid var(--border);background:color-mix(in oklab,var(--accent) 7%,var(--surface))}
.sl-col h2{font-size:calc(32px * var(--hs));line-height:1.12}
.sl-col>p{font-size:15px;color:var(--muted);min-height:72px}
.sl-rows{list-style:none;display:grid}
.sl-rows li{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:2px 20px;padding:12px 0;border-top:1px solid var(--border)}
.sl-rows b{font-size:15px}
.sl-rows .num{font-size:15px;text-align:right;white-space:nowrap}
.sl-rows small{grid-column:1/-1;font-size:13.5px;line-height:1.45;color:var(--muted);min-height:39px}
.sl-foot{font-size:13px;color:var(--muted);padding-top:12px;border-top:1px solid var(--border)}
.sk-head.sl-wide>div:first-child{max-width:none}
.sl-chips{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:14px}
.sl-chip{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;display:grid;grid-template-rows:auto 1fr}
.sl-sw{display:block;width:100%;height:150px;max-width:none}
.sl-chip>div{padding:12px 13px 14px;display:grid;gap:4px;align-content:start;border-top:1px solid var(--border)}
.sl-chip h3{font:600 15px/1.25 var(--font-b)}
.sl-chip p{font-size:13px;line-height:1.45;color:var(--muted)}
.sl-b{fill:color-mix(in oklab,var(--primary) 13%,var(--surface))}
.sl-m{fill:color-mix(in oklab,var(--primary) 52%,var(--surface))}
.sl-l{fill:none;stroke:color-mix(in oklab,var(--primary) 52%,var(--surface));stroke-width:1.6}
.sl-a{fill:color-mix(in oklab,var(--accent) 42%,var(--surface))}
.sl-jour{display:grid;grid-template-columns:minmax(0,.82fr) minmax(0,1.18fr);gap:56px;align-items:start}
.sl-scope{padding:24px;display:grid;gap:14px}
.sl-scope svg{display:block;width:100%;height:auto}
.sl-steps{list-style:none;display:grid}
.sl-steps li{display:grid;grid-template-columns:96px minmax(0,1fr);gap:18px;padding:13px 0;border-top:1px solid var(--border)}
.sl-steps li>span{font:600 12px/1.5 var(--font-b);letter-spacing:.06em;text-transform:uppercase;color:color-mix(in oklab,var(--primary) 82%,var(--text));padding-top:2px}
.sl-steps h3{font:600 16px/1.3 var(--font-b);margin-bottom:2px}
.sl-steps p{font-size:14px;line-height:1.5;color:var(--muted)}
.sl-proc{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);gap:48px;align-items:start}
.sl-proc-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 28px;margin-top:20px}
.sl-proc-list div{padding:12px 0;border-top:1px solid var(--border);display:grid;gap:2px}
.sl-proc-list b{font-size:15px}
.sl-proc-list p{font-size:13.5px;line-height:1.45;color:var(--muted)}
.sl-week{padding:26px;display:grid;gap:14px}
.sl-days{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px}
.sl-days div{min-height:112px;padding:10px;border:1px dashed var(--border);border-radius:var(--radius-sm);display:grid;align-content:space-between;gap:6px;font-size:12.5px;line-height:1.35;color:var(--muted)}
.sl-days b{font:600 13px var(--font-b);color:inherit}
.sl-days div.on{border:1px solid var(--primary);background:color-mix(in oklab,var(--primary) 12%,var(--bg));color:var(--text)}
.sl-send{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);gap:56px;align-items:center}
.sl-send ol{list-style:none;display:grid;gap:12px;margin-top:18px}
.sl-send ol li{display:grid;grid-template-columns:30px minmax(0,1fr);gap:12px;font-size:15px}
.sl-send ol .num{width:30px;height:30px;display:grid;place-items:center;font-size:13px;border-radius:50%;background:color-mix(in oklab,var(--primary) 14%,var(--bg))}
.sl-photo{padding:26px;display:grid;gap:14px}
.sl-slots{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
.sl-slot{display:grid;gap:6px;font-size:12.5px;font-weight:500}
.sl-slot>div{position:relative;height:104px;border-radius:var(--radius);overflow:hidden;border:1px solid var(--border)}
.sl-slot svg.sl-sw{height:100%}
.sl-slot>div>span{position:absolute;right:6px;top:6px;width:22px;height:22px;border-radius:50%;display:grid;place-items:center;background:var(--success);color:var(--bg)}
.sl-slot.add>div{display:grid;place-items:center;border:1.5px dashed var(--muted);color:var(--muted);background:var(--bg)}
.sl-privacy{display:grid;grid-template-columns:20px minmax(0,1fr);gap:10px;padding:12px 14px;font-size:13px;line-height:1.5;border:1px solid var(--border);border-radius:var(--radius);background:var(--bg)}
.sl-photo .sk-g2{gap:12px}
.sl-photo .sk-input{height:42px}
.sl-team{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:20px}
.sl-bio{display:grid;gap:8px;align-content:start;padding-top:14px;border-top:2px solid var(--text)}
.sl-bio h3{font-size:calc(19px * var(--hs))}
.sl-bio p{font-size:14px;line-height:1.5;color:var(--muted)}
.sl-tags{display:flex;flex-wrap:wrap;gap:5px}
.sl-slotnote{padding:18px;border:1.5px dashed var(--muted);border-radius:var(--radius);display:grid;gap:8px;align-content:center;justify-items:start;font-size:14px;color:var(--muted)}
.sl-book{display:grid;grid-template-columns:minmax(0,.86fr) minmax(0,1.14fr);gap:48px;align-items:start}
.sl-prep{list-style:none;display:grid;margin:16px 0 22px}
.sl-prep li{display:grid;grid-template-columns:20px minmax(0,1fr);gap:10px;padding:10px 0;border-top:1px solid var(--border);font-size:14px;line-height:1.45}
.sl-prep svg{margin-top:2px;color:color-mix(in oklab,var(--primary) 82%,var(--text))}
.sl-emerg{display:grid;grid-template-columns:20px minmax(0,1fr);gap:10px;padding:13px 16px;border-left:3px solid var(--danger);background:var(--bg);font-size:14px;line-height:1.5}
.sl-form{padding:30px;display:grid;gap:12px}
.sl-form .sk-g2{gap:12px}
.sl-pick{display:flex;flex-wrap:wrap;gap:8px}
.sl-pick label{height:40px;padding:0 13px;border:1px solid var(--border);border-radius:var(--radius);display:inline-flex;align-items:center;gap:8px;font-size:14px;font-weight:500;background:var(--bg)}
.sl-pick label.on{border-color:var(--primary);box-shadow:inset 0 0 0 1px var(--primary)}
@media (max-width:1024px){
  .sk-navend .btn:not(.primary){display:none}
  .sl-chips{grid-template-columns:repeat(3,minmax(0,1fr))}
  .sl-sw{height:110px}
  .sl-jour,.sl-send,.sl-proc{gap:32px}
  .sl-team{grid-template-columns:repeat(2,minmax(0,1fr))}
}
@media (max-width:860px){
  .sl-jour,.sl-send,.sl-proc,.sl-book{grid-template-columns:minmax(0,1fr)}
  .sl-col{padding:26px 22px}
  .sl-scope svg{max-width:360px}
}
@media (max-width:760px){
  .sl>.sk-sec{padding:44px 0}
  .sl-hero{padding:40px 0 36px}
  .sl-spine{display:none}
  .sl-switch{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:4px;padding:4px;margin-bottom:14px;border:1px solid var(--border);border-radius:var(--radius);background:var(--surface)}
  .sl-switch label{height:42px;display:grid;place-items:center;font-weight:600;font-size:14px;border-radius:var(--radius-sm);color:var(--muted);cursor:pointer}
  #sl-med:checked~.sl-switch label[for=sl-med],#sl-cos:checked~.sl-switch label[for=sl-cos]{background:var(--primary);color:var(--on-primary)}
  #sl-med:focus-visible~.sl-switch label[for=sl-med],#sl-cos:focus-visible~.sl-switch label[for=sl-cos]{outline:2px solid var(--text);outline-offset:1px}
  .sl-sides{grid-template-columns:minmax(0,1fr)}
  #sl-med:checked~.sl-sides .sl-col-cos,#sl-cos:checked~.sl-sides .sl-col-med{display:none}
  .sl-col+.sl-col{border-left:0}
  .sl-col>p,.sl-rows small{min-height:0}
  .sl-col h2{font-size:calc(26px * var(--hs))}
  .sl-chips{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
  .sl-sw{height:84px}
  .sl-chip>div{padding:10px 11px 12px}
  .sl-jour,.sl-send,.sl-proc{gap:22px}
  .sl-scope{padding:18px}
  .sl-scope p{display:none}
  .sl-steps li{grid-template-columns:minmax(0,1fr);gap:2px;padding:11px 0}
  .sl-proc-list{grid-template-columns:minmax(0,1fr);margin-top:12px}
  .sl-proc-list div:nth-child(n+4){display:none}
  .sl-week{padding:20px}
  .sl-days{gap:4px}
  .sl-days div{min-height:92px;padding:7px 5px;font-size:11px;overflow-wrap:anywhere}
  .sl-send>div:first-child ol{display:none}
  .sl-photo{padding:20px}
  .sl-slot>div{height:82px}
  .sl-team{display:flex}
  .sl-bio{padding:16px}
  .sl-book{gap:26px}
  .sl-prep{margin-bottom:16px}
  .sl-prep li:nth-child(n+5){display:none}
  .sl-form{padding:22px}
  .sl-form .sk-g2{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
  .sk-foot-grid>:last-child{grid-column:1/-1}
}
</style>`;

// ---- abstract artwork, all themed through CSS classes -----------------------------------------------------------
const lcg = (s) => () => (s = (s * 16807) % 2147483647) / 2147483647;
const contours = () => {
  const out = [];
  for (let i = 0; i < 17; i++) {
    const R = 46 + i * 37, pts = [];
    for (let k = 0; k < 110; k++) {
      const a = (k / 110) * Math.PI * 2, r = R * (1 + 0.09 * Math.sin(3 * a + i * 0.23) + 0.05 * Math.sin(5 * a - i * 0.37));
      pts.push(`${(600 + r * 1.72 * Math.cos(a)).toFixed(1)} ${(250 + r * Math.sin(a)).toFixed(1)}`);
    }
    out.push(`<path d="M${pts.join("L")}Z"/>`);
  }
  return `<svg viewBox="0 0 1200 500" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${out.join("")}</svg>`;
};
const SW = {
  stipple: () => { const r = lcg(41); return Array.from({ length: 70 }, () => `<circle class="sl-m" cx="${(r() * 240).toFixed(0)}" cy="${(r() * 160).toFixed(0)}" r="${(1.6 + r() * 4).toFixed(1)}"/>`).join(""); },
  crackle: () => { const r = lcg(77), g = []; for (let y = 0; y <= 5; y++) for (let x = 0; x <= 7; x++) g.push([x * 40 - 20 + r() * 24, y * 40 - 20 + r() * 24]); const seg = []; g.forEach((p, i) => { if ((i + 1) % 8) seg.push(`M${p[0].toFixed(0)} ${p[1].toFixed(0)}L${g[i + 1][0].toFixed(0)} ${g[i + 1][1].toFixed(0)}`); if (g[i + 8]) seg.push(`M${p[0].toFixed(0)} ${p[1].toFixed(0)}L${g[i + 8][0].toFixed(0)} ${g[i + 8][1].toFixed(0)}`); }); return `<path class="sl-l" d="${seg.join("")}"/>`; },
  scale: () => { let d = ""; for (let y = 0; y < 9; y++) for (let x = -1; x < 11; x++) { const cx = x * 28 + (y % 2) * 14; d += `M${cx - 14} ${y * 20}a14 14 0 0 0 28 0`; } return `<path class="sl-l" d="${d}"/>`; },
  flush: () => `<defs><filter id="sl-blur"><feGaussianBlur stdDeviation="9"/></filter></defs><g filter="url(#sl-blur)"><circle class="sl-a" cx="70" cy="60" r="44"/><circle class="sl-m" cx="160" cy="88" r="34" opacity=".7"/><circle class="sl-a" cx="202" cy="30" r="32"/><circle class="sl-m" cx="66" cy="140" r="26" opacity=".6"/></g>`,
  rings: () => [[68, 54, 4], [172, 44, 3], [132, 118, 5], [38, 134, 2], [214, 124, 2]].map(([x, y, n]) => Array.from({ length: n }, (_, i) => `<circle class="sl-l" cx="${x}" cy="${y}" r="${5 + i * 7}"/>`).join("") + `<circle class="sl-m" cx="${x}" cy="${y}" r="3"/>`).join(""),
  strands: () => { const r = lcg(13); return `<path class="sl-l" d="${Array.from({ length: 34 }, (_, i) => { const x = i * 7.4 - 4, k = 8 + r() * 14; return `M${x.toFixed(0)} 170C${(x + k).toFixed(0)} 120 ${(x - k).toFixed(0)} 60 ${(x + k / 2).toFixed(0)} -10`; }).join("")}"/>`; },
};
const swatch = (k) => `<svg class="sl-sw" viewBox="0 0 240 160" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect class="sl-b" width="240" height="160"/>${SW[k]()}</svg>`;
// Dermatoscope: a lens over an abstract dotted field, with scale ticks and a handle. Nothing here depicts skin.
const scope = () => { const r = lcg(29); const dots = Array.from({ length: 90 }, () => { const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 118; return `<circle class="sl-m" cx="${(180 + d * Math.cos(a)).toFixed(0)}" cy="${(150 + d * Math.sin(a)).toFixed(0)}" r="${(1.4 + r() * 3.4).toFixed(1)}"/>`; }).join("");
  return `<svg viewBox="0 0 440 320" role="img" aria-label="Diagram of a handheld dermatoscope, a lens with a built-in light and a measuring scale"><circle class="sl-b" cx="180" cy="150" r="128"/>${dots}<circle class="sl-l" cx="180" cy="150" r="128" style="stroke-width:10;stroke:var(--text)"/><circle class="sl-l" cx="180" cy="150" r="112" style="stroke-dasharray:2 16;stroke-width:6"/><path d="M272 244l74 66" style="stroke:var(--text);stroke-width:20;stroke-linecap:round"/><path class="sl-l" d="M180 60v180M90 150h180" style="stroke-dasharray:3 7;stroke:var(--text);stroke-width:1"/><text x="332" y="60" style="font:600 13px var(--font-b);fill:var(--muted)">Built-in light</text><path class="sl-l" d="M326 56L290 78" style="stroke:var(--muted);stroke-width:1"/><text x="332" y="150" style="font:600 13px var(--font-b);fill:var(--muted)">Magnifying</text><text x="332" y="166" style="font:600 13px var(--font-b);fill:var(--muted)">lens</text><path class="sl-l" d="M326 150L304 150" style="stroke:var(--muted);stroke-width:1"/></svg>`; };

// ---- content ----------------------------------------------------------------------------------------------------
const MEDICAL = [
  ["New patient consultation", "$220", "30 minutes with a dermatologist for any skin, hair or nail concern."],
  ["Follow-up consultation", "$130", "A 15 minute review of how a plan is going."],
  ["Mole check", "$165", "Up to three marks looked at closely with a dermatoscope."],
  ["Full-body skin check", "$260", "A head to toe check, with time for your questions."],
  ["Patch testing", "$480", "Three visits across one week, for suspected contact allergy."],
  ["Minor surgery", "from $340", "Removal or sampling of a skin lesion under local anaesthetic."],
];
const COSMETIC = [
  ["Cosmetic consultation", "$120", "30 minutes on options, suitability, risks and cost, with no treatment that day."],
  ["Muscle-relaxing injections", "from $260", "A prescription injectable placed in small amounts in chosen facial muscles."],
  ["Dermal filler", "from $420", "A gel placed beneath the skin by a doctor, after a full discussion."],
  ["Chemical peels", "from $150", "A solution applied to the outer skin layers, strength chosen with you."],
  ["Light and laser sessions", "from $190", "Light energy used on redness, pigment or unwanted hair, after a skin type check."],
  ["Cosmetic lesion removal", "from $240", "Skin tags and benign marks, always checked by a dermatologist first."],
];
const CONDITIONS = [
  ["stipple", "Acne", "Spots, blackheads and marks, in teenagers and adults."],
  ["crackle", "Eczema", "Dry, itchy, inflamed skin that comes and goes."],
  ["scale", "Psoriasis", "Raised, scaly patches on skin, scalp or nails."],
  ["flush", "Rosacea", "Facial redness, flushing and small bumps."],
  ["rings", "Moles and skin lesions", "New marks, changing moles and growths."],
  ["strands", "Hair and nail conditions", "Thinning, shedding, scalp and nail changes."],
];
const JOURNEY = [
  ["Before", "Note anything new or changing", "Bring photos if a mark has changed. Skip nail polish and makeup so nothing is hidden."],
  ["In the room", "A head to toe look", "You undress to your underwear with a gown, and a chaperone is available. We include scalp, nails and between the toes."],
  ["Close up", "The dermatoscope", "Any mark of interest is looked at through a handheld magnifier with its own light, and may be photographed for your record."],
  ["Results", "How we share what we saw", "You hear what we saw before you leave. If a sample goes to the lab, we call or send a secure message once the report is back, usually within 10 working days."],
  ["Follow up", "A plan for next time", "You get a written summary, and a recall date if your clinician suggests one. Your usual doctor gets a copy if you agree."],
];
const PROCEDURES = [
  ["Skin biopsy", "A small sample taken under local anaesthetic and sent to a lab."],
  ["Excision", "Removal of a lesion with stitches, followed by a wound check."],
  ["Curettage", "Gentle scraping of a surface lesion under local anaesthetic."],
  ["Cryotherapy", "Freezing of a small surface lesion in a short clinic visit."],
];
const WEEK = [["Mon", "Patches applied to your back", 1], ["Tue", "", 0], ["Wed", "Patches off, first reading", 1], ["Thu", "", 0], ["Fri", "Final reading and results", 1]];
const TEAM = [
  ["Dr Ingrid Sorvald", "Consultant dermatologist", ["Skin checks", "Lesion surgery"], "Specialist training in dermatology, with further training in dermoscopy and skin surgery."],
  ["Dr Kofi Marchetti-Lowe", "Consultant dermatologist", ["Eczema", "Patch testing"], "Specialist training in dermatology, with a focus on contact allergy and inflammatory skin."],
  ["Dr Sana Teverill", "Dermatologist, cosmetic lead", ["Acne", "Rosacea", "Cosmetic"], "Specialist training in dermatology, with further training in laser and injectable procedures."],
];
const PREP = [
  "Bring a list of your current medicines and creams.",
  "Bring the skincare you use, or photos of the labels.",
  "For a facial concern, come without makeup.",
  "For a skin check, remove nail polish and wear easy clothing.",
  "If a rash has settled, bring photos from when it was at its worst.",
  "Bring past biopsy reports or letters if you have them.",
];

const row = ([t, pr, d]) => `<li><b>${t}</b><span class="num">${pr}</span><small>${d}</small></li>`;

const web = (p, st) => K.page(st, `${K.nav(p, ["Medical", "Cosmetic", "Skin checks", "Send photos", "Our clinicians"], "Book", "Call (555) 016-3120")}
<main class="sl">
<section class="sl-hero" id="top">${contours()}<div class="sk-wrap">
  <span class="sk-eyebrow">Dermatology on Sorrel Lane</span>
  <h1 class="sk-h1">A skin clinic with a medical side and a cosmetic side</h1>
  <p class="sk-lede">${esc(p.name)} looks after rashes, moles, hair and nails, and offers cosmetic treatments led by the same clinicians. Not sure which you need? Start with a photo.</p>
  <div class="sl-routes"><a class="btn primary sk-btn-lg" href="#book">Book an appointment</a><a class="btn sk-btn-lg" href="#send-photos">${ic("image", 16)} Send photos first</a></div>
</div></section>
<div class="sl-spine" aria-hidden="true"></div>

<section class="sk-wrap" id="two-sides" style="padding-bottom:12px">
  <input class="sl-radio" type="radio" name="sl-side" id="sl-med" checked aria-label="Show medical dermatology"><input class="sl-radio" type="radio" name="sl-side" id="sl-cos" aria-label="Show cosmetic dermatology">
  <div class="sl-switch"><label for="sl-med">Medical</label><label for="sl-cos">Cosmetic</label></div>
  <div class="sl-sides">
    <div class="sl-col sl-col-med" id="medical"><span class="sk-eyebrow">Medical dermatology</span><h2>When something needs looking at</h2><p>Diagnosis and ongoing care for skin, hair and nail conditions. Book directly or with a referral. Some insurers ask for a letter, so check your policy.</p>
      <ul class="sl-rows">${MEDICAL.map(row).join("")}</ul><p class="sl-foot">Self-pay guide prices for 2026. Insured patients are billed to their plan where it applies.</p></div>
    <div class="sl-col sl-col-cos" id="cosmetic"><span class="sk-eyebrow">Cosmetic dermatology</span><h2>When it’s a personal choice</h2><p>Self-pay treatments, always after a consultation. A clinician checks suitability first, explains the risks, and may suggest not going ahead.</p>
      <ul class="sl-rows">${COSMETIC.map(row).join("")}</ul><p class="sl-foot">Self-pay guide prices for 2026. You get a written quote after your consultation.</p></div>
  </div>
</section>

<section class="sk-sec" id="conditions"><div class="sk-wrap">
  <div class="sk-head sl-wide" style="margin-bottom:26px"><div><span class="sk-eyebrow">Conditions we see</span><h2 class="sk-h2">From flare-ups to long-term skin care</h2></div></div>
  <div class="sl-chips">${CONDITIONS.map(([k, t, d]) => `<article class="sl-chip">${swatch(k)}<div><h3>${t}</h3><p>${d}</p></div></article>`).join("")}</div>
</div></section>

<section class="sk-sec sk-alt" id="skin-checks"><div class="sk-wrap sl-jour">
  <div class="sk-stack" style="gap:14px"><span class="sk-eyebrow">Skin checks</span><h2 class="sk-h2">What happens at a mole or full-body check</h2>
    <div class="card sl-scope">${scope()}<p class="muted" style="font-size:14px">A dermatoscope lets a clinician see patterns that are hard to pick out with the naked eye.</p></div></div>
  <ol class="sl-steps">${JOURNEY.map(([w, t, d]) => `<li><span>${w}</span><div><h3>${t}</h3><p>${d}</p></div></li>`).join("")}</ol>
</div></section>

<section class="sk-sec" id="procedures"><div class="sk-wrap sl-proc">
  <div><span class="sk-eyebrow">Procedures</span><h2 class="sk-h2" style="margin-top:12px">Minor surgery and clinic procedures</h2>
    <div class="sl-proc-list">${PROCEDURES.map(([t, d]) => `<div><b>${t}</b><p>${d}</p></div>`).join("")}</div></div>
  <aside class="card sl-week" aria-label="A patch testing week"><div><h3 class="sk-h3">A patch testing week</h3><p class="muted" style="font-size:14px">Three short visits. Your back needs to stay dry until the last reading.</p></div>
    <div class="sl-days">${WEEK.map(([d, t, on]) => `<div class="${on ? "on" : ""}"><b>${d}</b><span>${t}</span></div>`).join("")}</div></aside>
</div></section>

<section class="sk-sec sk-alt" id="send-photos"><div class="sk-wrap sl-send">
  <div><span class="sk-eyebrow">Send photos first</span><h2 class="sk-h2" style="margin-top:12px">Not sure which appointment you need?</h2>
    <p class="muted" style="margin-top:12px;font-size:16px">Send us a few photos before you book, and our team will suggest the right appointment type and clinician.</p>
    <ol><li><span class="num">1</span><span>Add up to three clear photos in daylight.</span></li><li><span class="num">2</span><span>A clinician looks at them, usually within two working days.</span></li><li><span class="num">3</span><span>We reply with a suggested appointment and a link to book.</span></li></ol></div>
  <form class="card sl-photo" aria-label="Send photos before booking">
    <div class="sl-slots"><div class="sl-slot"><div>${swatch("stipple")}<span>${ic("check", 13)}</span></div>Close up</div><div class="sl-slot"><div>${swatch("rings")}<span>${ic("check", 13)}</span></div>Arm’s length</div><div class="sl-slot add"><div>${ic("upload", 20)}</div>Wider view</div></div>
    <div class="sk-g2"><div class="sk-field"><label for="sl-about">What is it about?</label><select class="sk-input" id="sl-about"><option>A mole or mark</option><option>A rash</option><option>Hair or nails</option><option>Cosmetic question</option></select></div><div class="sk-field"><label for="sl-long">How long for?</label><select class="sk-input" id="sl-long"><option>A few months</option><option>A few weeks</option><option>Over a year</option></select></div></div>
    <div class="sk-field"><label for="sl-mail">Where should we reply?</label><input class="sk-input" id="sl-mail" value="tess.harwin@mail.example"></div>
    <div class="sl-privacy">${ic("lock", 18)}<span><b>Your privacy.</b> Photos travel over an encrypted link, are seen only by our clinical team, and are deleted after 30 days unless you become a patient. This is not a diagnosis. Please don’t send intimate images, or photos of a child unless you’re their parent or guardian. Call us instead and we’ll arrange a visit.</span></div>
    <button class="btn primary sk-btn-lg" type="button">Send securely</button></form>
</div></section>

<section class="sk-sec" id="our-clinicians"><div class="sk-wrap">
  <div class="sk-head" style="margin-bottom:26px"><div><span class="sk-eyebrow">Our clinicians</span><h2 class="sk-h2">Who you’ll see</h2></div></div>
  <div class="sl-team sk-rail">${TEAM.map(([n, r, tags, d]) => `<article class="sl-bio"><h3>${n}</h3><p>${r}</p><div class="sl-tags">${tags.map((t) => `<span class="badge">${t}</span>`).join("")}</div><p>${d}</p></article>`).join("")}<div class="sl-slotnote">${ic("edit", 18)}<span>Add your registration and accreditation details here</span></div></div>
</div></section>

<section class="sk-sec sk-alt" id="book"><div class="sk-wrap sl-book">
  <div><span class="sk-eyebrow">How to prepare</span><h2 class="sk-h2" style="margin-top:12px">Before you come in</h2>
    <ul class="sl-prep">${PREP.map((t) => `<li>${ic("check", 16)}<span>${t}</span></li>`).join("")}</ul>
    <div class="sl-emerg">${ic("bell", 18)}<span><b>Urgent?</b> This clinic is not an emergency service. In an emergency, call your local emergency number.</span></div></div>
  <form class="card sl-form" aria-label="Book an appointment">
    <h2 class="sk-h3" style="font-size:calc(26px * var(--hs))">Book an appointment</h2>
    <div class="sk-field"><span style="font-weight:500;font-size:13px">Which side of the clinic?</span><div class="sl-pick"><label class="on"><input type="radio" name="sl-book" checked> Medical</label><label><input type="radio" name="sl-book"> Cosmetic</label><label><input type="radio" name="sl-book"> Not sure</label></div></div>
    <div class="sk-g2"><div class="sk-field"><label for="sl-name">Full name</label><input class="sk-input" id="sl-name" value="Tess Harwin"></div><div class="sk-field"><label for="sl-phone">Mobile</label><input class="sk-input" id="sl-phone" value="(555) 017-5581"></div></div>
    <div class="sk-g2"><div class="sk-field"><label for="sl-type">Appointment</label><select class="sk-input" id="sl-type"><option>Full-body skin check</option><option>Mole check</option><option>New patient consultation</option><option>Patch testing</option><option>Cosmetic consultation</option></select></div><div class="sk-field"><label for="sl-day">Preferred day</label><input class="sk-input" id="sl-day" value="Thu 12 Nov, afternoon"></div></div>
    <div class="sk-field"><label for="sl-who">Clinician</label><select class="sk-input" id="sl-who"><option>First available</option><option>Dr Ingrid Sorvald</option><option>Dr Kofi Marchetti-Lowe</option><option>Dr Sana Teverill</option></select></div>
    <button class="btn primary sk-btn-lg" type="button">Request appointment</button>
    <p class="muted" style="font-size:13px">We’ll reply within one working day. Open Mon to Fri 8:30 AM to 6:00 PM, Sat 9:00 AM to 1:00 PM.</p>
  </form>
</div></section>
</main>
${K.footer(p, "Medical and cosmetic dermatology, with photo-first enquiries before you book.", [["Medical", ["Conditions", "Skin checks", "Patch testing"]], ["Cosmetic", ["Consultations", "Guide prices", "Lesion removal"]], ["Visit", ["12 Sorrel Lane", "(555) 016-3120", "hello@sorrellanederm.example"]]], "Fictional practice created for this template. General information only, not medical advice.")}`, CSS);

module.exports = {
  "dermatology-website": K.def("dermatology", "Dermatology clinic website",
    "a full dermatology clinic home page: navigation with a call button, a centred hero over a contour line pattern with booking and send photos buttons, medical and cosmetic dermatology as two parallel columns of services with neutral descriptions and self-pay guide prices that become a css-only switch on phones, a conditions row of abstract texture swatches, a skin check journey with a dermatoscope diagram and steps for results and follow up, minor surgery and procedures beside a patch testing week, a photo-first enquiry card with photo slots and a privacy note, clinician bios with a credentials slot, how to prepare with an emergency note, a booking form and a footer",
    ["navigation-header", "centered-hero", "pattern-background", "two-column-comparison", "css-switch", "pricing-list", "texture-swatches", "journey-steps", "diagram", "week-calendar", "file-upload", "privacy-note", "team-bios", "credentials-slot", "checklist", "booking-form", "footer", "dermatology"], web),
};
