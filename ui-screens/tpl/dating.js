/* MCP gaps r2 (11-Nov-2026): dating app UI. Real zero-result searches on 10/11 Nov: "mobile dating swipe dark luxury", "dating app swipe".
   Patterns (2 variants each) for Duskwell (family "dating"), an invented dating app (name web-searched: no dating app by that name):
     dating-swipe      card-stack | match       swipe card stack (discover) and the mutual-match screen
     dating-profile    profile | filters        a full dating profile and the discovery filters
     dating-chat       matches | thread         new matches + conversations, and a chat thread with a date plan card
     dating-onboarding basics | photos          sign-up steps: about you, and photos + a prompt
   Original layouts and copy only. No real dating app's name, logo, colours, wording or signature features are used: no flame or
   hexagon marks, no "It's a Match!", no super-like star, no stamps on the cards, no "women message first" rule, no roses.
   Profile "photos" are flat SVG illustrations (faceless portraits, fixed natural tones, no external images). People are invented;
   the signed-in member is Priya Nair from the recurring cast. "Now" is Wednesday 11 November 2026, about 8:40 PM. */
const { ic, esc, status, tabBar, ICON } = require("../lib");

Object.assign(ICON, {
  dt_mark: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/><path d="M15.5 4.5a5 5 0 0 1 3.5 3"/>',
  dt_undo: '<path d="M9 14L4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',
  dt_verified: '<path d="M12 2.8l2.3 1.7 2.8-.2.9 2.7 2.3 1.6-.9 2.7.9 2.7-2.3 1.6-.9 2.7-2.8-.2L12 21.2l-2.3-1.7-2.8.2-.9-2.7-2.3-1.6.9-2.7-.9-2.7 2.3-1.6.9-2.7 2.8.2z"/><path d="M8.5 12.2l2.3 2.3 4.7-4.7"/>',
  dt_sliders: '<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>',
  dt_ruler: '<path d="M3 16.5L16.5 3 21 7.5 7.5 21z"/><path d="M7 12.5l1.5 1.5M10 9.5l2 2M13 6.5l1.5 1.5"/>',
  dt_glass: '<path d="M7 3h10l-1 7a4 4 0 0 1-8 0zM12 14v6M8.5 21h7"/>',
  dt_cap: '<path d="M2.5 9L12 5l9.5 4L12 13z"/><path d="M6.5 11v4.5c1.5 1.5 3.5 2 5.5 2s4-.5 5.5-2V11M21.5 9v5"/>',
  dt_brief: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M3 13h18"/>',
  dt_mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/>',
  dt_smile: '<circle cx="12" cy="12" r="9"/><path d="M8.5 14.5a4.5 4.5 0 0 0 7 0M9 9.5h.01M15 9.5h.01"/>',
  dt_flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
  dt_camera: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  dt_coffee: '<path d="M5 9h11v4.5A5.5 5.5 0 0 1 10.5 19A5.5 5.5 0 0 1 5 13.5z"/><path d="M16 10.5h1.5a2.5 2.5 0 0 1 0 5H16"/>',
  dt_hand: '<path d="M8 13V6.5a1.5 1.5 0 0 1 3 0V11M11 11V4.5a1.5 1.5 0 0 1 3 0V11M14 11V6.5a1.5 1.5 0 0 1 3 0V13c0 4.2-2.6 7.5-6.2 7.5-2.3 0-3.8-1.1-5.2-3.3l-1.9-3.4a1.5 1.5 0 0 1 2.5-1.7L8 14"/>',
  dt_drag: '<circle cx="9" cy="6" r="1.2"/><circle cx="15" cy="6" r="1.2"/><circle cx="9" cy="12" r="1.2"/><circle cx="15" cy="12" r="1.2"/><circle cx="9" cy="18" r="1.2"/><circle cx="15" cy="18" r="1.2"/>',
  dt_moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
});

const H = (st, px) => Math.round(px * st.hscale);
const tint = (pct, v = "primary") => `color-mix(in oklab,var(--${v}) ${pct}%,var(--surface))`;
const kbd = (t) => `<span style="display:inline-grid;place-items:center;min-width:22px;height:22px;padding:0 6px;border:1px solid var(--border);border-bottom-width:2px;border-radius:5px;font:600 11px var(--font-b);color:var(--muted);background:var(--bg)">${t}</span>`;
const sw = (on) => `<span role="switch" aria-checked="${on}" style="flex:none;width:38px;height:22px;border-radius:999px;position:relative;background:${on ? "var(--primary)" : "color-mix(in oklab,var(--muted) 30%,var(--surface))"}"><span style="position:absolute;top:2px;left:${on ? 18 : 2}px;width:18px;height:18px;border-radius:50%;background:${on ? "var(--on-primary)" : "var(--surface)"};box-shadow:0 1px 2px rgba(0,0,0,.25)"></span></span>`;
const chip = (t, on, i) => `<span class="dt-chip${on ? " on" : ""}">${i ? ic(i, 14) : ""}${t}</span>`;
const verified = (s = 18) => `<span title="Photo verified" style="display:inline-flex;color:var(--accent)">${ic("dt_verified", s)}</span>`;

const CSS = `<style>
.dt-chip{display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 12px;border-radius:999px;border:1px solid var(--border);background:var(--surface);font-size:13px;font-weight:500;white-space:nowrap;flex:none}
.dt-chip.on{background:color-mix(in oklab,var(--primary) 14%,var(--surface));border-color:color-mix(in oklab,var(--primary) 55%,var(--surface));color:color-mix(in oklab,var(--primary) 75%,var(--text))}
.dt-ph{position:relative;overflow:hidden;background:#cdb9a6}
.dt-ph>svg{position:absolute;inset:0;width:100%;height:100%;display:block}
.dt-scrim{position:absolute;left:0;right:0;bottom:0;padding:16px 18px;color:var(--on-ink);background:linear-gradient(to top,color-mix(in oklab,var(--ink) 82%,transparent),color-mix(in oklab,var(--ink) 45%,transparent) 60%,transparent)}
.dt-scrim .dt-chip{background:color-mix(in oklab,var(--on-ink) 16%,transparent);border-color:color-mix(in oklab,var(--on-ink) 30%,transparent);color:var(--on-ink);height:26px;font-size:12px}
.dt-dots{position:absolute;top:10px;left:12px;right:12px;display:flex;gap:4px}
.dt-dots i{flex:1;height:3px;border-radius:3px;background:color-mix(in oklab,var(--on-ink) 40%,transparent)}
.dt-dots i.on{background:var(--on-ink)}
.dt-act{display:grid;place-items:center;border-radius:50%;background:var(--surface);border:1px solid var(--border);box-shadow:var(--shadow);flex:none}
.dt-act.like{background:var(--primary);border-color:var(--primary);color:var(--on-primary)}
.dt-side{border-right:1px solid var(--border);padding:20px 14px;display:flex;flex-direction:column;gap:2px;background:color-mix(in oklab,var(--surface) 60%,var(--bg))}
.dt-nav{display:flex;align-items:center;gap:11px;padding:9px 10px;border-radius:var(--radius);color:var(--muted);font-weight:500}
.dt-nav.on{background:color-mix(in oklab,var(--primary) 12%,var(--surface));color:var(--text)}
.dt-n{margin-left:auto;min-width:20px;height:20px;padding:0 6px;border-radius:999px;background:var(--primary);color:var(--on-primary);font:700 11px/20px var(--font-b);text-align:center}
.dt-lbl{font:600 11px var(--font-b);text-transform:uppercase;letter-spacing:.07em;color:var(--muted)}
.dt-prompt{padding:14px 16px;border-radius:var(--radius-lg);background:color-mix(in oklab,var(--primary) 7%,var(--surface));border:1px solid color-mix(in oklab,var(--primary) 18%,var(--border))}
.dt-prompt b{display:block;font:600 12px var(--font-b);color:var(--muted);margin-bottom:4px}
.dt-ell{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.dt-bub{padding:9px 13px;border-radius:18px;max-width:76%;line-height:1.45;font-size:14px}
.dt-bub.them{background:color-mix(in oklab,var(--text) 7%,var(--surface));border-bottom-left-radius:6px;align-self:flex-start}
.dt-bub.me{background:var(--primary);color:var(--on-primary);border-bottom-right-radius:6px;align-self:flex-end}
.dt-range{position:relative;height:22px}
.dt-range::before{content:"";position:absolute;left:0;right:0;top:9px;height:4px;border-radius:4px;background:color-mix(in oklab,var(--muted) 25%,var(--surface))}
.dt-range i{position:absolute;top:9px;height:4px;border-radius:4px;background:var(--primary)}
.dt-range b{position:absolute;top:0;width:22px;height:22px;margin-left:-11px;border-radius:50%;background:var(--surface);border:2px solid var(--primary);box-shadow:var(--shadow-sm)}
.dt-seg{display:flex;padding:3px;border-radius:999px;background:color-mix(in oklab,var(--text) 6%,var(--surface));border:1px solid var(--border)}
.dt-seg span{flex:1;text-align:center;padding:6px 10px;border-radius:999px;font-weight:500;font-size:13px;color:var(--muted);white-space:nowrap}
.dt-seg span.on{background:var(--surface);color:var(--text);box-shadow:0 1px 3px color-mix(in oklab,var(--text) 16%,transparent)}
.dt-slot{border:2px dashed var(--border);border-radius:var(--radius-lg);display:grid;place-items:center;color:var(--muted);background:color-mix(in oklab,var(--text) 3%,var(--surface))}
.dt-typing{display:inline-flex;gap:4px;align-items:center;padding:12px 14px;border-radius:18px;border-bottom-left-radius:6px;background:color-mix(in oklab,var(--text) 7%,var(--surface));align-self:flex-start}
.dt-typing i{width:6px;height:6px;border-radius:50%;background:var(--muted)}
</style>`;

/* ---------------------------------------------------------------- people + illustrated photos (fixed natural tones are allowed for photos) */
const SCENES = [
  ["#f3cfa4", "#d98b6a", "#b0644f"], // sunset street
  ["#b9d6c8", "#79a493", "#4e7a6a"], // park
  ["#e7cfae", "#b98d68", "#7c5a42"], // café wall
  ["#a9b6d6", "#6f7fae", "#3d4874"], // city dusk
  ["#cfe2ea", "#9cc3cf", "#e8d6b0"], // seaside
  ["#e9d9c9", "#c7aa93", "#95725d"], // studio
];
const PEOPLE = {
  imani: { n: "Imani", a: 31, job: "Landscape architect", edu: "Uni of Sheffield", town: "Clifton", km: 3, skin: "#8a5a3c", hair: "#1d1410", hs: "curly", top: "#c79a3e", sc: 1, h: "5′7″",
    tags: ["Wild swimming", "Plant swaps", "Jazz bars", "Board games", "Pottery"], ints: ["Wild swimming", "Jazz bars", "Board games"] },
  callum: { n: "Callum", a: 33, job: "Science teacher", edu: "Cardiff University", town: "Redland", km: 2, skin: "#e6bd9c", hair: "#6a4a2d", hs: "short", top: "#3e5c79", sc: 0, h: "6′0″" },
  rosa: { n: "Rosa", a: 29, job: "Pastry chef", edu: "Westminster Kingsway", town: "Stokes Croft", km: 4, skin: "#c69873", hair: "#2a1a12", hs: "long", top: "#a54a3b", sc: 2, h: "5′4″" },
  jun: { n: "Jun", a: 34, job: "Sound engineer", edu: "SAE Institute", town: "Bedminster", km: 5, skin: "#e2b88e", hair: "#141414", hs: "short2", top: "#2f4a3b", sc: 3, h: "5′10″" },
  leila: { n: "Leila", a: 32, job: "Architect", edu: "UWE Bristol", town: "Southville", km: 6, skin: "#b7825f", hair: "#19110d", hs: "bun", top: "#2d2d39", sc: 5, h: "5′6″" },
  felix: { n: "Felix", a: 30, job: "Physiotherapist", edu: "King's College London", town: "Bishopston", km: 3, skin: "#efc8a6", hair: "#c4965a", hs: "short", top: "#76689a", sc: 4, h: "5′11″" },
  anouk: { n: "Anouk", a: 28, job: "UX researcher", edu: "TU Delft", town: "Harbourside", km: 1, skin: "#f1d0b4", hair: "#b6763e", hs: "long", top: "#4c6f5b", sc: 4, h: "5′8″" },
  tomasz: { n: "Tomasz", a: 35, job: "Carpenter", edu: "City of Bristol College", town: "Easton", km: 4, skin: "#e9c3a0", hair: "#3b2a1e", hs: "short2", top: "#8a5a3a", sc: 0, h: "6′1″" },
  priya: { n: "Priya", a: 31, job: "Product designer", edu: "Loughborough University", town: "Cotham", km: 0, skin: "#a8735a", hair: "#1a110c", hs: "long", top: "#5b4a7a", sc: 2, h: "5′5″" },
};
let PH = 0;
const HAIR = {
  short: (c) => `<path d="M100 168c-6-58 26-84 50-84s58 20 50 84c-6-24-22-40-50-40s-44 14-50 40z" fill="${c}"/>`,
  short2: (c) => `<path d="M98 172c-8-50 18-90 54-90 34 0 58 30 50 90-4-26-12-34-20-38-10 10-44 14-70 6-8 8-12 18-14 32z" fill="${c}"/>`,
  long: (c) => `<path d="M96 170c-8-60 22-92 54-92s62 30 54 92l8 120c-20 10-40 12-62 12s-42-2-62-12z" fill="${c}"/>`,
  curly: (c) => `<g fill="${c}">${[[150, 92, 30], [118, 104, 26], [182, 104, 26], [100, 132, 22], [200, 132, 22], [96, 160, 18], [204, 160, 18], [134, 86, 22], [166, 86, 22]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join("")}</g>`,
  bun: (c) => `<g fill="${c}"><circle cx="150" cy="70" r="24"/><path d="M100 168c-6-58 26-84 50-84s58 20 50 84c-4-30-20-48-50-48s-46 18-50 48z"/></g>`,
};
// A faceless illustrated portrait: scene gradient, a soft sun/hill, shoulders, neck, head, hair. `alt` shifts pose and scene for photo 2/3.
function portrait(k, alt = 0) {
  const p = PEOPLE[k], s = SCENES[(p.sc + alt) % SCENES.length], id = `dtp${++PH}`, dx = alt === 1 ? -26 : alt === 2 ? 22 : 0, sc = alt === 2 ? 0.86 : 1;
  const back = p.hs === "long" ? HAIR.long(p.hair).replace(/^<path/, `<path opacity="1"`) : "";
  return `<svg viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0.3" y2="1"><stop offset="0" stop-color="${s[0]}"/><stop offset="1" stop-color="${s[1]}"/></linearGradient></defs>
<rect width="300" height="400" fill="url(#${id})"/><circle cx="${alt ? 60 : 236}" cy="${alt ? 70 : 96}" r="${alt ? 34 : 46}" fill="#fff" opacity=".28"/>
<path d="M0 ${300 - alt * 14}q70-44 150-12t150-8V400H0z" fill="${s[2]}" opacity=".55"/>
<g transform="translate(${150 + dx} 400) scale(${sc}) translate(-150 -400)">${p.hs === "long" ? `<g transform="translate(0 18)">${back}</g>` : ""}<path d="M44 400c4-84 52-128 106-128s102 44 106 128z" fill="${p.top}"/><path d="M128 222h44v58c-14 9-30 9-44 0z" fill="${p.skin}" opacity=".85"/>
<g transform="translate(0 18)"><ellipse cx="150" cy="168" rx="47" ry="58" fill="${p.skin}"/>${p.hs === "long" ? HAIR.short(p.hair) : HAIR[p.hs](p.hair)}</g><path d="M108 300c20 18 64 18 84 0" stroke="#000" stroke-opacity=".16" stroke-width="1.5" fill-opacity="0"/></g></svg>`;
}
const photo = (k, style = "", alt = 0, inner = "") => `<div class="dt-ph" style="${style}">${portrait(k, alt)}${inner}</div>`;
const av = (k, s = 44, ring) => `<span style="flex:none;width:${s}px;height:${s}px;border-radius:50%;overflow:hidden;position:relative;display:block;${ring ? `box-shadow:0 0 0 2px var(--surface),0 0 0 4px var(--${ring})` : ""}">${photo(k, "width:100%;height:100%")}</span>`;
const dots = (n, on = 0) => `<div class="dt-dots">${Array.from({ length: n }, (_, i) => `<i class="${i === on ? "on" : ""}"></i>`).join("")}</div>`;

/* ---------------------------------------------------------------- shared frame */
const logo = (p, s = 15) => `<div style="display:flex;align-items:center;gap:8px;font:700 ${s + 2}px var(--font-h);letter-spacing:var(--ls)"><span style="width:${s + 13}px;height:${s + 13}px;border-radius:var(--radius);display:grid;place-items:center;background:var(--primary);color:var(--on-primary)">${ic("dt_moon", s)}</span>${esc(p.name)}</div>`;
const NAV = [["dt_mark", "Discover"], ["heart", "Likes you", 12], ["users", "Matches"], ["chat", "Messages", 3], ["users", "Profile"], ["gear", "Settings"]];
const side = (p, active) => `<aside class="dt-side"><div style="padding:2px 6px 22px">${logo(p)}</div>
${NAV.map(([i, l, n]) => `<div class="dt-nav${l === active ? " on" : ""}">${ic(i, 19)}${l}${n ? `<span class="dt-n">${n}</span>` : ""}</div>`).join("")}
<div class="card" style="margin-top:auto;padding:14px;display:grid;gap:8px;box-shadow:none"><div style="display:flex;gap:8px;align-items:center;font-weight:600;font-size:13px">${ic("shield", 16)}Date safely</div><div class="muted" style="font-size:12px;line-height:1.45">Meet somewhere public and tell a friend your plans. Chat here until you feel ready to swap numbers.</div></div>
<div style="display:flex;align-items:center;gap:10px;padding:14px 6px 0">${av("priya", 34)}<div><div style="font-weight:600;font-size:13.5px">Priya Nair</div><div class="muted" style="font-size:12px">Profile 90% complete</div></div></div></aside>`;
const shell = (p, active, main, cols = "248px 1fr") => `${CSS}<div style="display:grid;grid-template-columns:${cols};height:100%">${side(p, active)}<main style="overflow:hidden;display:flex;flex-direction:column;min-width:0">${main}</main></div>`;
const top = (title, sub, right = "") => `<div style="height:68px;flex:none;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:14px;padding:0 28px"><div><div style="font:var(--hw) 20px var(--font-h);letter-spacing:var(--ls)">${title}</div>${sub ? `<div class="muted" style="font-size:12.5px">${sub}</div>` : ""}</div><div style="margin-left:auto;display:flex;gap:10px;align-items:center">${right}</div></div>`;
const TABS = [["dt_mark", "Discover"], ["heart", "Likes"], ["chat", "Chats"], ["users", "Profile"]];
const phone = (inner, tab) => `${CSS}<div class="phone" style="position:relative">${status()}${inner}${tab ? tabBar(tab, TABS) : ""}</div>`;

/* ================================================================= dating-swipe: card-stack */
const cardInfo = (k, big) => {
  const p = PEOPLE[k];
  return `<div class="dt-scrim" style="padding:${big ? "60px 22px 20px" : "54px 16px 16px"}"><div style="display:flex;align-items:center;gap:8px"><span style="font:var(--hw) ${big ? 30 : 26}px var(--font-h);letter-spacing:var(--ls)">${p.n}</span><span class="num" style="font-size:${big ? 24 : 21}px;font-weight:500;opacity:.9">${p.a}</span>${verified(big ? 22 : 19)}</div>
<div style="display:flex;gap:14px;font-size:13px;opacity:.92;margin:4px 0 10px;flex-wrap:wrap"><span style="display:inline-flex;gap:5px;align-items:center">${ic("dt_brief", 14)}${p.job}</span><span style="display:inline-flex;gap:5px;align-items:center">${ic("pin", 14)}${p.km} km away</span></div>
<div style="display:flex;gap:6px;flex-wrap:wrap">${(p.ints || ["Climbing", "Film photography", "Ramen"]).map((t) => chip(t)).join("")}</div></div>`;
};
const stack = (w, h, big) => `<div style="position:relative;width:${w}px;height:${h}px;flex:none">
${photo("callum", `position:absolute;inset:0;border-radius:var(--radius-lg);transform:translateY(${big ? 22 : 16}px) scale(.9);opacity:.55;box-shadow:var(--shadow)`)}
${photo("rosa", `position:absolute;inset:0;border-radius:var(--radius-lg);transform:translateY(${big ? 11 : 8}px) scale(.95);opacity:.8;box-shadow:var(--shadow)`)}
${photo("imani", `position:absolute;inset:0;border-radius:var(--radius-lg);transform:rotate(-2.5deg) translateX(-6px);box-shadow:var(--shadow-lg);border:1px solid var(--border)`, 0,
  dots(4) + `<span style="position:absolute;top:24px;right:16px;display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 12px;border-radius:999px;background:var(--surface);color:var(--text);font:600 12.5px var(--font-b);box-shadow:var(--shadow)">${ic("dt_moon", 14)}Daily pick</span>` + cardInfo("imani", big))}</div>`;
const actions = (s) => `<div style="display:flex;align-items:center;justify-content:center;gap:${s > 60 ? 22 : 16}px">
<span class="dt-act" style="width:${Math.round(s * 0.7)}px;height:${Math.round(s * 0.7)}px;color:var(--muted)" title="Undo">${ic("dt_undo", Math.round(s * 0.3))}</span>
<span class="dt-act" style="width:${s}px;height:${s}px;color:var(--text)" title="Pass">${ic("x", Math.round(s * 0.42))}</span>
<span class="dt-act" style="width:${Math.round(s * 0.78)}px;height:${Math.round(s * 0.78)}px;color:var(--accent)" title="Save for later">${ic("bookmark", Math.round(s * 0.34))}</span>
<span class="dt-act like" style="width:${s}px;height:${s}px" title="Like">${ic("heart", Math.round(s * 0.44))}</span></div>`;

const swipeWeb = (p, st) => shell(p, "Discover", `${top("Discover", "Daily picks · 8 of 20 left today · new picks at 9 PM",
  `<span class="btn" style="height:38px">${ic("dt_sliders", 16)}Filters · 27–36 · within 15 km</span><span class="btn" style="height:38px">${ic("bell", 16)}</span>`)}
<div style="flex:1;display:grid;grid-template-columns:minmax(0,1fr) 420px;min-height:0">
<div style="display:grid;justify-items:center;align-content:center;gap:26px;padding:20px">${stack(420, 560, true)}${actions(68)}
<div class="muted" style="display:flex;gap:16px;align-items:center;font-size:12.5px"><span style="display:inline-flex;gap:6px;align-items:center">${kbd("←")}Pass</span><span style="display:inline-flex;gap:6px;align-items:center">${kbd("→")}Like</span><span style="display:inline-flex;gap:6px;align-items:center">${kbd("S")}Save</span><span style="display:inline-flex;gap:6px;align-items:center">${kbd("Space")}Next photo</span></div></div>
<aside style="border-left:1px solid var(--border);padding:24px 26px;display:grid;gap:16px;align-content:start;overflow:hidden;background:var(--surface)">
<div style="display:flex;justify-content:space-between;align-items:center"><span class="dt-lbl">About Imani</span><span class="badge">${ic("dt_verified", 12)}&nbsp;Photo verified</span></div>
<p style="font-size:14px;line-height:1.6">Designs parks for a living, so expect strong opinions about benches. Happiest in cold water at 7 AM or in a dark jazz bar at 11 PM. Looking for someone to lose at board games to.</p>
<div class="dt-prompt"><b>A perfect Sunday looks like</b><div style="font-size:14.5px">A lido swim, a long brunch, then a plant swap where I come home with more than I took.</div></div>
<div class="dt-prompt"><b>We’ll get on if</b><div style="font-size:14.5px">You have a favourite bench in Bristol and a reason for it.</div></div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px 14px;font-size:13px">${[["dt_ruler", "5′7″"], ["dt_brief", "Landscape architect"], ["dt_cap", "Uni of Sheffield"], ["pin", "Clifton · 3 km"], ["dt_glass", "Drinks socially"], ["search", "Long-term partner"]].map(([i, t]) => `<span style="display:flex;gap:8px;align-items:center"><span style="display:flex;color:var(--muted)">${ic(i, 16)}</span>${t}</span>`).join("")}</div>
<div><div class="dt-lbl" style="margin-bottom:8px">Interests · 3 in common</div><div style="display:flex;gap:6px;flex-wrap:wrap">${PEOPLE.imani.tags.map((t, i) => chip(t, i === 0 || i === 2 || i === 3)).join("")}</div></div>
<div class="muted" style="display:flex;gap:16px;font-size:12.5px;padding-top:4px;border-top:1px solid var(--border)"><span style="display:inline-flex;gap:6px;align-items:center;padding-top:10px">${ic("dt_flag", 14)}Report</span><span style="display:inline-flex;gap:6px;align-items:center;padding-top:10px">${ic("x", 14)}Hide from my picks</span></div></aside></div>`);

const swipeMobile = (p) => phone(`<div class="mtop" style="padding-bottom:8px">${logo(p, 13)}<div style="display:flex;gap:16px;color:var(--text)">${ic("dt_sliders", 22)}${ic("bell", 22)}</div></div>
<div class="mbody" style="align-items:center;gap:18px;padding-top:2px">${stack(350, 500)}${actions(62)}
<div class="muted" style="font-size:12px">Swipe right to like · left to pass · tap for more photos</div></div>`, "Discover");

/* ================================================================= dating-swipe: match */
const pairPhotos = (s) => `<div style="position:relative;width:${Math.round(s * 1.7)}px;height:${Math.round(s * 1.25)}px;flex:none">
${photo("priya", `position:absolute;left:0;top:${Math.round(s * 0.1)}px;width:${s}px;height:${Math.round(s * 1.15)}px;border-radius:var(--radius-lg);transform:rotate(-7deg);border:4px solid var(--surface);box-shadow:var(--shadow-lg)`)}
${photo("imani", `position:absolute;right:0;top:0;width:${s}px;height:${Math.round(s * 1.15)}px;border-radius:var(--radius-lg);transform:rotate(6deg);border:4px solid var(--surface);box-shadow:var(--shadow-lg)`)}
<span style="position:absolute;left:50%;top:${Math.round(s * 0.62)}px;transform:translateX(-50%);width:${Math.round(s * 0.42)}px;height:${Math.round(s * 0.42)}px;border-radius:50%;display:grid;place-items:center;background:var(--primary);color:var(--on-primary);border:4px solid var(--surface);box-shadow:var(--shadow)">${ic("heart", Math.round(s * 0.2))}</span></div>`;
const OPENERS = ["Which Bristol bench is your favourite, and why?", "Lido at 7 AM: brave or a bit unwell?", "What board game do you always win?"];
const matchBody = (st, w) => `<div style="display:grid;justify-items:center;gap:${w ? 18 : 16}px;text-align:center">
<span class="badge" style="height:24px;padding:0 12px">${ic("dt_moon", 12)}&nbsp;New match</span>
<h1 style="font-size:${H(st, w ? 36 : 31)}px;line-height:1.1">You and Imani<br>like each other</h1>
<p class="muted" style="font-size:14px;max-width:${w ? 400 : 310}px">Say hello while it’s fresh. This match stays open for 7 days, until Wednesday 18 November.</p></div>`;
const openers = (w) => `<div style="display:grid;gap:8px;width:100%"><div class="dt-lbl" style="text-align:left">Start with something from her profile</div>
${OPENERS.map((o, i) => `<div style="display:flex;align-items:center;gap:10px;padding:11px 14px;border-radius:var(--radius-lg);border:1px solid ${i === 0 ? "color-mix(in oklab,var(--primary) 55%,var(--border))" : "var(--border)"};background:${i === 0 ? tint(9) : "var(--surface)"};font-size:${w ? 14 : 13.5}px;text-align:left"><span style="display:flex;color:var(--primary)">${ic("chat", 16)}</span><span style="flex:1">${o}</span>${i === 0 ? `<span style="display:flex;color:var(--primary)">${ic("check", 16)}</span>` : ""}</div>`).join("")}</div>`;
const composer = (w) => `<div style="display:flex;gap:8px;width:100%;align-items:center"><div class="input filled" style="flex:1;height:${w ? 48 : 46}px;border-radius:999px;padding:0 18px;font-size:14px;color:var(--text)">Which Bristol bench is your favourite, and why?</div><span class="btn primary" style="width:${w ? 48 : 46}px;height:${w ? 48 : 46}px;padding:0;border-radius:50%">${ic("send", 19)}</span></div>`;
const matchWeb = (p, st) => shell(p, "Discover", `${top("Discover", "Daily picks · 7 of 20 left today")}
<div style="flex:1;position:relative;min-height:0;display:grid;place-items:center">
<div style="position:absolute;inset:0;display:grid;place-items:center;filter:blur(3px);opacity:.6">${stack(420, 560, true)}</div>
<div style="position:absolute;inset:0;background:color-mix(in oklab,var(--ink) 55%,transparent)"></div>
<div class="card" style="position:relative;width:600px;padding:34px 40px 30px;display:grid;justify-items:center;gap:20px;box-shadow:var(--shadow-lg)">
<span style="position:absolute;top:16px;right:16px;color:var(--muted)">${ic("x", 20)}</span>${pairPhotos(150)}${matchBody(st, true)}
<div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center">${["Wild swimming", "Board games", "Jazz bars"].map((t) => chip(t, true, "check")).join("")}</div>
${openers(true)}${composer(true)}
<span class="muted" style="font-size:13px;font-weight:500">Keep browsing</span></div></div>`);
const matchMobile = (p, st) => phone(`<div class="mtop">${ic("x", 22)}<span class="dt-lbl">${esc(p.name)}</span>${ic("share", 20)}</div>
<div class="mbody" style="align-items:center;gap:16px;padding-top:4px;background:radial-gradient(120% 60% at 50% 0%,color-mix(in oklab,var(--primary) 16%,var(--bg)),var(--bg))">${pairPhotos(124)}${matchBody(st)}${openers()}${composer()}
<span class="muted" style="font-size:13.5px;font-weight:500">Keep browsing</span></div>`);

/* ================================================================= dating-profile: profile */
const BASICS = [["dt_ruler", "5′7″"], ["dt_brief", "Landscape architect"], ["dt_cap", "Uni of Sheffield"], ["pin", "Clifton, Bristol"], ["dt_glass", "Drinks socially"], ["search", "Long-term partner"], ["globe", "English, Yoruba"], ["users", "Wants children someday"]];
const profWeb = (p, st) => shell(p, "Discover", `${top("Imani, 31", "Clifton · 3 km away · active today", `<span class="btn" style="height:38px">${ic("back", 16)}Back to picks</span><span class="btn" style="height:38px">${ic("more", 16)}</span>`)}
<div style="flex:1;display:grid;grid-template-columns:560px minmax(0,1fr);gap:28px;padding:24px 28px;min-height:0">
<div style="display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 190px;gap:10px;min-height:0">
${photo("imani", "grid-column:1/-1;border-radius:var(--radius-lg)", 0, dots(4) + `<span style="position:absolute;left:16px;bottom:16px;display:inline-flex;gap:6px;align-items:center;height:28px;padding:0 12px;border-radius:999px;background:var(--surface);font:600 12px var(--font-b);color:var(--text)">${ic("dt_verified", 14)}Photo verified</span>`)}
${photo("imani", "border-radius:var(--radius-lg)", 1)}${photo("imani", "border-radius:var(--radius-lg)", 2, `<span style="position:absolute;right:10px;bottom:10px;height:26px;padding:0 10px;border-radius:999px;background:color-mix(in oklab,var(--ink) 60%,transparent);color:var(--on-ink);font:600 12px/26px var(--font-b)">+1 photo</span>`)}</div>
<div style="display:grid;gap:16px;align-content:start;min-width:0">
<div style="display:flex;align-items:center;gap:10px"><h1 style="font-size:${H(st, 34)}px">Imani</h1><span class="num" style="font-size:26px;font-weight:500">31</span>${verified(24)}<span class="badge" style="margin-left:auto">3 interests in common</span></div>
<p style="font-size:14.5px;line-height:1.6;max-width:640px">Designs parks for a living, so expect strong opinions about benches. Happiest in cold water at 7 AM or in a dark jazz bar at 11 PM. Looking for someone to lose at board games to.</p>
<div style="display:flex;flex-wrap:wrap;gap:8px">${BASICS.map(([i, t]) => chip(t, false, i)).join("")}</div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px"><div class="dt-prompt"><b>A perfect Sunday looks like</b><div>A lido swim, a long brunch, then a plant swap where I come home with more than I took.</div></div>
<div class="dt-prompt"><b>My most irrational fear</b><div>Geese. I have read the research and I stand by it.</div></div>
<div class="dt-prompt"><b>We’ll get on if</b><div>You have a favourite bench in Bristol and a reason for it.</div></div>
<div class="dt-prompt"><b>Ideal first date</b><div>Coffee that turns into a walk along the harbour if it’s going well.</div></div></div>
<div><div class="dt-lbl" style="margin-bottom:8px">Interests</div><div style="display:flex;gap:6px;flex-wrap:wrap">${PEOPLE.imani.tags.concat(["Allotments", "Film nights"]).map((t, i) => chip(t, [0, 2, 3].includes(i))).join("")}</div></div>
<div style="display:flex;gap:12px;align-items:center;padding-top:6px"><span class="btn" style="height:48px;padding:0 22px;font-size:14px">${ic("x", 18)}Pass</span><span class="btn" style="height:48px;padding:0 18px;font-size:14px">${ic("bookmark", 17)}Save</span><span class="btn primary" style="height:48px;padding:0 26px;font-size:14px">${ic("heart", 18)}Like Imani</span>
<span class="muted" style="margin-left:auto;display:inline-flex;gap:14px;font-size:12.5px"><span style="display:inline-flex;gap:5px;align-items:center">${ic("dt_flag", 14)}Report</span><span style="display:inline-flex;gap:5px;align-items:center">${ic("lock", 14)}Block</span></span></div></div></div>`);
const profMobile = (p, st) => phone(`<div style="flex:1;overflow:hidden;display:flex;flex-direction:column;position:relative">
${photo("imani", "height:430px;flex:none;margin:0 12px;border-radius:var(--radius-lg)", 0, dots(4) + `<div style="position:absolute;top:22px;left:14px;right:14px;display:flex;justify-content:space-between">${["back", "more"].map((i) => `<span style="width:36px;height:36px;border-radius:50%;display:grid;place-items:center;background:color-mix(in oklab,var(--ink) 45%,transparent);color:var(--on-ink)">${ic(i, 19)}</span>`).join("")}</div>
<div class="dt-scrim" style="padding:60px 18px 18px"><div style="display:flex;align-items:center;gap:8px"><span style="font:var(--hw) 30px var(--font-h);letter-spacing:var(--ls)">Imani</span><span class="num" style="font-size:24px;font-weight:500">31</span>${verified(21)}</div><div style="font-size:13px;opacity:.92;display:flex;gap:6px;align-items:center">${ic("pin", 14)}Clifton · 3 km away · active today</div></div>`)}
<div style="padding:14px 20px 0;display:grid;gap:12px">
<div style="display:flex;gap:6px;flex-wrap:wrap">${BASICS.slice(0, 5).map(([i, t]) => chip(t, false, i)).join("")}</div>
<div class="dt-prompt"><b>A perfect Sunday looks like</b><div style="font-size:15px">A lido swim, a long brunch, then a plant swap where I come home with more than I took.</div></div>
<div class="dt-prompt"><b>My most irrational fear</b><div style="font-size:15px">Geese. I have read the research and I stand by it.</div></div></div>
<div style="position:absolute;left:0;right:0;bottom:0;height:120px;background:linear-gradient(to top,var(--bg) 55%,transparent)"></div>
<div style="position:absolute;left:0;right:0;bottom:22px">${actions(60)}</div></div>`);

/* ================================================================= dating-profile: filters */
const range = (a, b, lo, hi) => { const L = (a - lo) / (hi - lo) * 100, R = (b - lo) / (hi - lo) * 100; return `<div class="dt-range"><i style="left:${L}%;right:${100 - R}%"></i><b style="left:${L}%"></b>${b !== null ? `<b style="left:${R}%"></b>` : ""}</div>`; };
const one = (v, lo, hi) => { const L = (v - lo) / (hi - lo) * 100; return `<div class="dt-range"><i style="left:0;right:${100 - L}%"></i><b style="left:${L}%"></b></div>`; };
const fRow = (label, val, ctl) => `<div style="display:grid;gap:10px"><div style="display:flex;justify-content:space-between;align-items:baseline"><span style="font-weight:600">${label}</span><span class="num" style="font-size:14px;color:var(--muted)">${val}</span></div>${ctl}</div>`;
const LOOK = [["Long-term partner", true], ["Something casual", false], ["Not sure yet", true], ["New friends", false]];
const filterCore = (w) => `${fRow("Age", "27 – 36", range(27, 36, 18, 60))}
${fRow("Distance", "Within 15 km of Bristol", one(15, 1, 80))}
<div style="display:grid;gap:10px"><span style="font-weight:600">Show me</span><div class="dt-seg"><span class="on">Men</span><span>Women</span><span>Everyone</span></div></div>
<div style="display:grid;gap:10px"><span style="font-weight:600">Looking for</span><div style="display:flex;gap:7px;flex-wrap:wrap">${LOOK.map(([t, on]) => chip(t, on, on ? "check" : null)).join("")}</div></div>
${w ? "" : `<div style="display:flex;justify-content:space-between;align-items:center"><div><div style="font-weight:600">Photo-verified only</div><div class="muted" style="font-size:12.5px">Hide profiles that skipped the selfie check</div></div>${sw(true)}</div>`}`;
const ADV = [["Height", "5′8″ – 6′4″"], ["Drinking", "Socially, rarely"], ["Children", "Wants someday, open"], ["Languages", "Any"], ["Star sign", "Any"]];
const filtersWeb = (p, st) => shell(p, "Discover", `${top("Discovery filters", "Who shows up in your daily picks", `<span class="muted" style="font-size:13px;font-weight:500">Reset all</span><span class="btn primary" style="height:40px;padding:0 18px">Show 142 people</span>`)}
<div style="flex:1;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr) 340px;gap:22px;padding:24px 28px;align-content:start;min-height:0">
<div class="card" style="padding:22px 24px;display:grid;gap:22px;align-content:start"><div class="dt-lbl">The basics</div>${filterCore(true)}</div>
<div style="display:grid;gap:18px;align-content:start"><div class="card" style="padding:20px 24px;display:grid;gap:4px"><div class="dt-lbl" style="margin-bottom:8px">More preferences</div>
${ADV.map(([a, b], i) => `<div style="display:flex;justify-content:space-between;align-items:center;padding:11px 0;${i ? "border-top:1px solid var(--border)" : ""}"><span style="font-weight:500">${a}</span><span style="display:inline-flex;gap:6px;align-items:center;color:var(--muted);font-size:13.5px">${b}${ic("chevron", 15)}</span></div>`).join("")}</div>
<div class="card" style="padding:18px 24px;display:grid;gap:14px">${[["Photo-verified only", "Hide profiles that skipped the selfie check", true], ["Recently active", "Active in the last 7 days", true], ["Show me further away when I run out", "Picks can come from up to 30 km", false]].map(([a, b, on]) => `<div style="display:flex;justify-content:space-between;gap:12px;align-items:center"><div><div style="font-weight:600">${a}</div><div class="muted" style="font-size:12.5px">${b}</div></div>${sw(on)}</div>`).join("")}</div></div>
<div style="display:grid;gap:16px;align-content:start"><div class="card" style="padding:20px;display:grid;gap:12px;justify-items:start"><div class="dt-lbl">With these filters</div><div style="display:flex;align-items:baseline;gap:8px"><span class="num" style="font-size:44px">142</span><span class="muted">people nearby</span></div>
<div style="display:flex">${["callum", "jun", "felix", "tomasz"].map((k, i) => `<span style="margin-left:${i ? -10 : 0}px">${av(k, 40, "surface")}</span>`).join("")}<span style="margin-left:-10px;width:40px;height:40px;border-radius:50%;display:grid;place-items:center;background:${tint(16)};color:var(--primary);font:700 12px var(--font-b);box-shadow:0 0 0 2px var(--surface)">+138</span></div>
<div class="muted" style="font-size:12.5px;line-height:1.5">Widening the age range to 40 would add about 60 more. Your filters are private: nobody sees them.</div></div>
<div class="card" style="padding:16px 20px;display:flex;gap:12px;align-items:flex-start;box-shadow:none;background:${tint(8, "accent")}"><span style="display:flex;color:var(--accent)">${ic("dt_verified", 20)}</span><div style="font-size:13px;line-height:1.5"><b>You’re photo verified.</b> Verified members see each other first in daily picks.</div></div></div></div>`);
const filtersMobile = (p) => phone(`<div class="mtop" style="border-bottom:1px solid var(--border);padding-bottom:12px">${ic("x", 22)}<span style="font-weight:700;font-size:16px">Filters</span><span style="font-size:14px;font-weight:600;color:var(--primary)">Reset</span></div>
<div class="mbody" style="gap:20px;padding-top:18px">${filterCore()}
<div class="card" style="padding:2px 14px;box-shadow:none">${ADV.slice(0, 3).map(([a, b], i) => `<div style="display:flex;justify-content:space-between;align-items:center;padding:11px 0;font-size:14px;${i ? "border-top:1px solid var(--border)" : ""}"><span style="font-weight:500">${a}</span><span style="display:inline-flex;gap:4px;align-items:center;color:var(--muted);font-size:13px">${b}${ic("chevron", 14)}</span></div>`).join("")}</div>
<span class="btn primary block" style="height:50px;margin-top:auto;font-size:15px">Show 142 people</span></div>`);

/* ================================================================= dating-chat: matches + thread */
const NEW = [["callum", "2d left"], ["jun", "5d left"], ["felix", "6d left"], ["anouk", "Today"], ["tomasz", "3d left"]];
const CONVOS = [["imani", "Imani", "Ha, fine. The bench by the cathedral. Ask me why on Thursday", "8:31 PM", 2, "Date Thu"],
  ["leila", "Leila", "You: that exhibition closes Sunday, have you been?", "6:02 PM", 0, ""],
  ["rosa", "Rosa", "Sent a voice note · 0:24", "Mon", 1, ""],
  ["jun", "Jun", "Liked your answer to “A perfect Sunday”", "Sun", 0, "Your turn"],
  ["anouk", "Anouk", "You matched. Say hello before Sat", "Sat", 0, "New"]];
const convoRow = ([k, n, t, time, un, tag], on, w) => `<div style="display:flex;gap:12px;align-items:center;padding:${w ? "11px 18px" : "10px 0"};${on ? `background:${tint(10)};box-shadow:inset 3px 0 0 var(--primary)` : ""}">${av(k, w ? 48 : 52)}<div style="flex:1;min-width:0"><div style="display:flex;gap:8px;align-items:center"><span style="font-weight:${un ? 700 : 600}">${n}</span>${tag ? `<span class="badge">${tag}</span>` : ""}<span class="muted" style="margin-left:auto;font-size:12px">${time}</span></div>
<div style="display:flex;gap:8px;align-items:center"><span class="dt-ell" style="flex:1;font-size:13.5px;${un ? "font-weight:600" : "color:var(--muted)"}">${t}</span>${un ? `<span class="dt-n" style="margin-left:0">${un}</span>` : ""}</div></div></div>`;
const newRow = (s) => `<div style="display:flex;gap:${s > 60 ? 16 : 13}px">${NEW.map(([k, d], i) => `<div style="display:grid;justify-items:center;gap:6px;flex:none"><span style="padding:3px;border-radius:50%;border:2px solid ${i < 2 ? "var(--primary)" : "var(--border)"}">${av(k, s)}</span><span style="font-size:12.5px;font-weight:600">${PEOPLE[k].n}</span><span class="muted" style="font-size:11px;margin-top:-6px">${d}</span></div>`).join("")}</div>`;
const listCol = (w, on) => `<div style="border-right:1px solid var(--border);display:flex;flex-direction:column;min-height:0;background:var(--surface)">
<div style="padding:18px 18px 12px;display:grid;gap:12px"><div style="display:flex;justify-content:space-between;align-items:center"><span style="font:var(--hw) 20px var(--font-h)">Messages</span><span class="muted">${ic("dt_sliders", 18)}</span></div>
<div class="input" style="height:38px;gap:8px;border-radius:999px">${ic("search", 15)}Search matches</div></div>
${w ? `<div style="padding:0 18px 14px;border-bottom:1px solid var(--border)"><div class="dt-lbl" style="margin-bottom:10px">New matches · 5</div>${newRow(46)}</div>` : ""}
<div style="overflow:hidden">${CONVOS.map((c, i) => convoRow(c, i === on, true)).join("")}</div></div>`;
const matchesWeb = (p, st) => shell(p, "Messages", `<div style="flex:1;display:grid;grid-template-columns:400px minmax(0,1fr);min-height:0">${listCol(true, -1)}
<div style="padding:26px 30px;display:grid;gap:18px;align-content:start;min-width:0"><div style="display:flex;justify-content:space-between;align-items:flex-end"><div><div class="dt-lbl">Waiting on you</div><h1 style="font-size:${H(st, 28)}px;margin-top:4px">5 new matches, 2 ending soon</h1></div><span class="btn">Sort: ending soonest ${ic("chevdown", 14)}</span></div>
<div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px">${NEW.slice(0, 4).map(([k, d], i) => photo(k, "height:420px;border-radius:var(--radius-lg)", 0, `<span style="position:absolute;top:10px;left:10px;height:24px;padding:0 9px;border-radius:999px;background:${i < 2 ? "var(--primary)" : "var(--surface)"};color:${i < 2 ? "var(--on-primary)" : "var(--text)"};font:600 11.5px/24px var(--font-b)">${ic("clock", 11)} ${d}</span><div class="dt-scrim" style="padding:40px 14px 14px"><div style="font-weight:700;font-size:17px">${PEOPLE[k].n}, <span class="num" style="font-weight:500">${PEOPLE[k].a}</span></div><div style="font-size:12px;opacity:.9">${PEOPLE[k].job} · ${PEOPLE[k].km} km</div></div>`)).join("")}</div>
<div class="card" style="padding:18px 20px;display:grid;grid-template-columns:auto 1fr auto;gap:16px;align-items:center"><span style="width:44px;height:44px;border-radius:50%;display:grid;place-items:center;background:${tint(14)};color:var(--primary)">${ic("chat", 21)}</span><div><div style="font-weight:600">Not sure what to say?</div><div class="muted" style="font-size:13px">Reply to one of their answers instead of “hey”. Each match card suggests three openers from their profile.</div></div><span class="btn primary">Open Callum’s profile</span></div>
<div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px">${[["chat", "3 unread", "Imani, Rosa and Leila"], ["calendar", "1 date planned", "Thu 12 Nov · 7:30 PM"], ["heart", "12 likes", "Like back to match"]].map(([i, a, b]) => `<div class="card" style="padding:16px 18px;display:flex;gap:12px;align-items:center"><span style="display:flex;color:var(--primary)">${ic(i, 20)}</span><div><div class="num" style="font-size:18px">${a}</div><div class="muted" style="font-size:12.5px">${b}</div></div></div>`).join("")}</div></div></div>`);
const matchesMobile = (p) => phone(`<div class="mtop"><span style="font:var(--hw) 26px var(--font-h);letter-spacing:var(--ls)">Chats</span><span style="display:flex;gap:16px">${ic("search", 22)}${ic("dt_sliders", 22)}</span></div>
<div class="mbody" style="gap:8px;padding-top:0"><div class="dt-lbl" style="display:flex;justify-content:space-between">New matches<span style="text-transform:none;letter-spacing:0;font-weight:500">5</span></div>${newRow(54)}
<div class="dt-lbl" style="margin-top:10px">Conversations</div><div>${CONVOS.map((c) => convoRow(c, false)).join("")}</div></div>`, "Chats");

const VOICE = [6, 10, 16, 9, 20, 14, 8, 18, 24, 12, 7, 15, 21, 11, 6, 13, 19, 9, 5, 12];
const wave = (on) => `<span style="display:inline-flex;gap:2px;align-items:center;height:24px">${VOICE.map((h, i) => `<i style="width:3px;height:${h}px;border-radius:2px;background:${i < 8 ? (on ? "var(--on-primary)" : "var(--primary)") : "color-mix(in oklab,currentColor 40%,transparent)"}"></i>`).join("")}</span>`;
const datePlan = (w) => `<div style="align-self:center;width:${w ? 380 : 300}px;border:1px solid var(--border);border-radius:var(--radius-lg);background:var(--surface);overflow:hidden;box-shadow:var(--shadow-sm)">
<div style="display:flex;gap:10px;align-items:center;padding:12px 14px;border-bottom:1px solid var(--border)"><span style="width:34px;height:34px;border-radius:var(--radius);display:grid;place-items:center;background:${tint(14)};color:var(--primary)">${ic("dt_coffee", 18)}</span><div style="flex:1"><div style="font-weight:600;font-size:14px">Coffee, then a harbour walk</div><div class="muted" style="font-size:12.5px">Thu 12 Nov · 7:30 PM · Harbourside</div></div></div>
<div style="display:flex;gap:8px;padding:10px 14px;align-items:center"><span class="badge" style="background:${tint(14, "success")};color:var(--success)">${ic("check", 12)}&nbsp;Both said yes</span><span class="muted" style="margin-left:auto;font-size:12.5px;display:inline-flex;gap:5px;align-items:center">${ic("shield", 13)}Share with a friend</span></div></div>`;
const threadMsgs = (w) => `<div style="flex:1;overflow:hidden;display:flex;flex-direction:column;gap:8px;padding:${w ? "20px 28px" : "12px 16px"};justify-content:flex-end">
<div class="muted" style="text-align:center;font-size:12px;margin-bottom:4px">You matched on Friday 6 November</div>
<div style="align-self:flex-end;max-width:76%;display:grid;gap:4px;justify-items:end"><div style="padding:8px 12px;border-radius:12px;border-left:3px solid var(--primary);background:${tint(8)};font-size:12.5px;color:var(--muted)"><b style="color:var(--text)">We’ll get on if</b> · You have a favourite bench in Bristol…</div><div class="dt-bub me">Okay I need to know: which bench, and what’s the reason?</div></div>
<div class="dt-bub them">Ha, fine. The one by the cathedral. Ask me why on Thursday</div>
<div class="dt-bub them" style="display:flex;gap:10px;align-items:center">${ic("play", 16)}${wave(false)}<span class="num" style="font-size:12px;color:var(--muted)">0:24</span></div>
${w ? `<div class="dt-bub me">Deal. I’ll bring my bench ratings spreadsheet</div>` : ""}
${datePlan(w)}
<div class="dt-bub me">Booked a table by the window. See you at 7:30</div><div class="muted" style="align-self:flex-end;font-size:11.5px;margin-top:-4px">Read 8:34 PM</div>
<div class="dt-typing"><i></i><i style="opacity:.7"></i><i style="opacity:.45"></i></div></div>`;
const threadComposer = (w) => `<div style="flex:none;display:flex;gap:8px;align-items:center;padding:${w ? "14px 28px 18px" : "10px 14px 30px"};border-top:1px solid var(--border);background:var(--surface)"><span style="display:flex;color:var(--muted)">${ic("plus", 22)}</span><div class="input" style="flex:1;height:42px;border-radius:999px;padding:0 16px">Message Imani…</div><span style="display:flex;color:var(--muted)">${ic("dt_smile", 21)}</span><span class="btn primary" style="width:42px;height:42px;padding:0;border-radius:50%">${ic("dt_mic", 19)}</span></div>`;
const threadHead = (w) => `<div style="flex:none;display:flex;align-items:center;gap:12px;padding:${w ? "14px 28px" : "4px 16px 12px"};border-bottom:1px solid var(--border)">${w ? "" : ic("back", 22)}${av("imani", w ? 44 : 38)}<div style="flex:1;min-width:0"><div style="display:flex;gap:6px;align-items:center;font-weight:700">Imani ${verified(16)}</div><div style="font-size:12px;color:var(--success)">Active now</div></div><span style="display:flex;gap:16px;color:var(--muted)">${ic("calendar", 21)}${ic("more", 21)}</span></div>`;
const threadWeb = (p, st) => shell(p, "Messages", `<div style="flex:1;display:grid;grid-template-columns:360px minmax(0,1fr) 320px;min-height:0">${listCol(false, 0)}
<div style="display:flex;flex-direction:column;min-height:0;min-width:0">${threadHead(true)}${threadMsgs(true)}${threadComposer(true)}</div>
<aside style="border-left:1px solid var(--border);padding:20px;display:grid;gap:14px;align-content:start;background:var(--surface);overflow:hidden">${photo("imani", "height:300px;border-radius:var(--radius-lg)", 0, dots(4))}
<div><div style="display:flex;gap:8px;align-items:center"><span style="font:var(--hw) 22px var(--font-h)">Imani, <span class="num" style="font-weight:500">31</span></span>${verified(18)}</div><div class="muted" style="font-size:13px">Landscape architect · Clifton · 3 km</div></div>
<div class="dt-prompt"><b>A perfect Sunday looks like</b><div style="font-size:13.5px">A lido swim, a long brunch, then a plant swap where I come home with more than I took.</div></div>
<div style="display:grid;gap:2px">${[["shield", "Share date plans with a friend"], ["users", "View full profile"], ["x", "Unmatch"], ["dt_flag", "Report"]].map(([i, t], k) => `<div style="display:flex;gap:10px;align-items:center;padding:9px 2px;font-size:13.5px;${k ? "border-top:1px solid var(--border)" : ""};${k === 3 ? "color:var(--danger)" : ""}"><span style="display:flex;${k === 3 ? "" : "color:var(--muted)"}">${ic(i, 16)}</span>${t}</div>`).join("")}</div></aside></div>`);
const threadMobile = (p) => phone(`${threadHead()}${threadMsgs()}${threadComposer()}`);

/* ================================================================= dating-onboarding: basics + photos */
const STEPS = ["Your account", "About you", "Photos", "Prompts", "Interests", "Verify"];
const stepsCol = (p, cur) => `<aside style="padding:34px 36px;display:flex;flex-direction:column;gap:26px;background:${tint(10)};border-right:1px solid var(--border)">${logo(p)}
<div><div class="dt-lbl">Create your profile</div><div class="num" style="font-size:15px;margin-top:4px">Step ${cur + 1} of ${STEPS.length}</div></div>
<div style="display:grid;gap:4px">${STEPS.map((s, i) => `<div style="display:flex;gap:12px;align-items:center;padding:9px 10px;border-radius:var(--radius);${i === cur ? "background:var(--surface);box-shadow:var(--shadow-sm);font-weight:600" : i < cur ? "" : "color:var(--muted)"}"><span style="width:26px;height:26px;border-radius:50%;display:grid;place-items:center;font:700 12px var(--font-b);${i < cur ? "background:var(--primary);color:var(--on-primary)" : i === cur ? "border:2px solid var(--primary);color:var(--primary)" : "border:1.5px solid var(--border)"}">${i < cur ? ic("check", 14) : i + 1}</span>${s}</div>`).join("")}</div>
<div class="card" style="margin-top:auto;padding:16px;display:grid;gap:8px;box-shadow:none"><div style="display:flex;gap:8px;align-items:center;font-weight:600;font-size:13.5px">${ic("lock", 16)}What others see</div><div class="muted" style="font-size:12.5px;line-height:1.5">Your first name, age, photos, prompts and interests. Never your surname, birthday or exact location.</div></div></aside>`;
const prog = (cur) => `<div style="display:flex;gap:5px">${STEPS.map((_, i) => `<i style="flex:1;height:4px;border-radius:4px;background:${i <= cur ? "var(--primary)" : "color-mix(in oklab,var(--muted) 25%,var(--surface))"}"></i>`).join("")}</div>`;
const basicsForm = (st, w) => `<div style="display:grid;gap:6px"><h1 style="font-size:${H(st, w ? 34 : 27)}px">A little about you</h1><p class="muted" style="font-size:14px">This is what your matches see first. You can change it later.</p></div>
<div class="field"><label>First name</label><div class="input filled" style="height:46px">Priya</div></div>
<div class="field"><label>Birthday</label><div style="display:grid;grid-template-columns:1fr 1fr 1.4fr;gap:8px">${["14", "03", "1995"].map((v) => `<div class="input filled num" style="height:46px;justify-content:center;font-size:15px">${v}</div>`).join("")}</div><div class="muted" style="font-size:12.5px;display:flex;gap:6px;align-items:center">${ic("eye", 14)}Your profile shows your age (31), not your birthday.</div></div>
<div class="field"><label>I am</label><div style="display:flex;gap:7px;flex-wrap:wrap">${["Woman", "Man", "Non-binary", "Another identity"].map((t, i) => chip(t, i === 0, i === 0 ? "check" : null)).join("")}</div></div>
<div class="field"><label>Show me</label><div class="dt-seg"><span class="on">Men</span><span>Women</span><span>Everyone</span></div></div>
<div class="field"><label>I’m looking for</label><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">${[["heart", "A long-term partner", true], ["dt_coffee", "Something casual", false], ["search", "Not sure yet", false], ["users", "New friends", false]].map(([i, t, on]) => `<div style="display:flex;gap:10px;align-items:center;padding:11px 12px;border-radius:var(--radius-lg);border:${on ? "2px solid var(--primary)" : "1px solid var(--border)"};background:${on ? tint(9) : "var(--surface)"};font-size:13.5px;font-weight:${on ? 600 : 500}"><span style="display:flex;color:${on ? "var(--primary)" : "var(--muted)"}">${ic(i, 17)}</span>${t}</div>`).join("")}</div></div>`;
const basicsWeb = (p, st) => `${CSS}<div style="display:grid;grid-template-columns:400px 1fr;height:100%">${stepsCol(p, 1)}
<main style="display:grid;place-items:center;padding:30px"><div style="width:560px;display:grid;gap:20px">${prog(1)}${basicsForm(st, true)}
<div style="display:flex;justify-content:space-between;align-items:center;padding-top:6px"><span class="btn" style="height:46px;padding:0 20px">${ic("back", 16)}Back</span><span class="btn primary" style="height:46px;padding:0 30px">Continue${ic("arrow", 16)}</span></div></div></main></div>`;
const basicsMobile = (p, st) => phone(`<div class="mtop" style="padding-bottom:6px">${ic("back", 22)}<span class="muted" style="font-size:13px;font-weight:600">Step 2 of 6</span><span class="muted" style="font-size:14px">Skip</span></div>
<div class="mbody" style="gap:16px">${prog(1)}${basicsForm(st)}<span class="btn primary block" style="height:50px;margin-top:auto;font-size:15px">Continue</span></div>`);

const slots = (cols, h, n = 6) => `<div style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:10px">${Array.from({ length: n }, (_, i) => i < 3
  ? photo("priya", `height:${h}px;border-radius:var(--radius-lg)`, i, `${i === 0 ? `<span style="position:absolute;top:8px;left:8px;height:22px;padding:0 9px;border-radius:999px;background:var(--primary);color:var(--on-primary);font:700 11px/22px var(--font-b)">Main</span>` : ""}<span style="position:absolute;top:8px;right:8px;width:26px;height:26px;border-radius:50%;display:grid;place-items:center;background:var(--surface);color:var(--text);box-shadow:var(--shadow-sm)">${ic("x", 13)}</span><span style="position:absolute;bottom:8px;right:8px;color:var(--on-ink);display:flex;opacity:.9">${ic("dt_drag", 16)}</span>`)
  : `<div class="dt-slot" style="height:${h}px"><span style="display:grid;justify-items:center;gap:4px;font-size:12px;font-weight:600"><span style="width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:var(--primary);color:var(--on-primary)">${ic("plus", 18)}</span>${i === 3 ? "Add photo" : ""}</span></div>`).join("")}</div>`;
const TIPS = [["dt_smile", "Your face, clearly, in the first photo"], ["image", "At least one full-length photo"], ["dt_camera", "Recent: from the last year or two"]];
const promptCard = (w) => `<div class="dt-prompt" style="display:grid;gap:8px"><div style="display:flex;justify-content:space-between;align-items:center"><b style="margin:0">A perfect Sunday looks like</b><span style="font-size:12.5px;font-weight:600;color:var(--primary)">Change prompt</span></div>
<div class="input filled" style="height:auto;min-height:${w ? 60 : 64}px;padding:10px 12px;align-items:flex-start;line-height:1.45">Farmers’ market at 9, a long walk on the Downs, then whoever cooks dinner gets out of washing up.</div><div class="muted" style="font-size:12px;text-align:right">96 / 150</div></div>`;
const photosWeb = (p, st) => `${CSS}<div style="display:grid;grid-template-columns:400px 1fr;height:100%">${stepsCol(p, 2)}
<main style="display:grid;place-items:center;padding:28px"><div style="width:720px;display:grid;gap:18px">${prog(2)}
<div style="display:grid;gap:6px"><h1 style="font-size:${H(st, 34)}px">Add your photos</h1><p class="muted" style="font-size:14px">Add at least 2. Drag to reorder: the first one is the photo people see in their picks.</p></div>
<div style="display:grid;grid-template-columns:minmax(0,1fr) 230px;gap:18px;align-items:start">${slots(3, 200)}
<div class="card" style="padding:16px;display:grid;gap:12px;box-shadow:none"><div class="dt-lbl">Photos that work</div>${TIPS.map(([i, t]) => `<div style="display:flex;gap:9px;align-items:flex-start;font-size:13px"><span style="display:flex;color:var(--primary)">${ic(i, 16)}</span>${t}</div>`).join("")}<div class="muted" style="font-size:12px;line-height:1.45;padding-top:8px;border-top:1px solid var(--border)">No group shots as your main photo, and no photos of other people’s children.</div></div></div>
${promptCard(true)}
<div style="display:flex;justify-content:space-between;align-items:center"><span class="btn" style="height:46px;padding:0 20px">${ic("back", 16)}Back</span><span class="muted" style="font-size:13px">3 of 6 photos</span><span class="btn primary" style="height:46px;padding:0 30px">Continue${ic("arrow", 16)}</span></div></div></main></div>`;
const photosMobile = (p, st) => phone(`<div class="mtop" style="padding-bottom:6px">${ic("back", 22)}<span class="muted" style="font-size:13px;font-weight:600">Step 3 of 6</span><span class="muted" style="font-size:14px">Skip</span></div>
<div class="mbody" style="gap:14px">${prog(2)}<div style="display:grid;gap:4px"><h1 style="font-size:${H(st, 27)}px">Add your photos</h1><p class="muted" style="font-size:13.5px">At least 2. The first one shows in people’s picks.</p></div>
${slots(3, 148)}<div style="display:flex;gap:8px;align-items:center;font-size:12.5px" class="muted">${ic("dt_smile", 15)}Tip: your face, clearly, in the first photo</div>${promptCard()}
<span class="btn primary block" style="height:50px;margin-top:auto;font-size:15px">Continue</span></div>`);

/* ================================================================= exports */
const NOTE = " Original design for an invented app, not modelled on any real dating app.";
module.exports = {
  "dating-swipe": { family: "dating", name: "Dating app swipe cards", shows: "a dating app's swipe card stack for discovering people (pass, like, save) and the screen shown when two people like each other" + NOTE,
    elements: ["swipe-cards", "card-stack", "profile-card", "photo-carousel", "action-buttons", "match-screen", "chips", "badge", "verified-badge", "keyboard-shortcuts", "details-panel", "sidebar-nav", "tab-bar", "composer", "modal"],
    variants: {
      "card-stack": { name: "Swipe card stack (dating app discover)", shows: "a dating app discover screen: a stack of swipeable profile cards with a full-bleed photo, photo progress dots, name, age, photo-verified badge, job, distance and interest chips, a daily pick label, undo / pass / save / like buttons, swipe or keyboard hints (left to pass, right to like) and, on web, the profile details panel with bio, prompts, basics and interests in common, plus the daily picks count and a filters button; on mobile with a tab bar" },
      "mutual-match": { name: "Mutual match screen (you both liked each other)", shows: "a dating app match screen after two people like each other: both photos overlapping with a heart badge, a new-match headline, how long the match stays open, interests in common, suggested openers taken from the other person's profile prompts, a message composer with send, and a keep-browsing link; on web a modal over the blurred card stack" },
    },
    web: (p, st) => p.variant === "mutual-match" ? matchWeb(p, st) : swipeWeb(p, st),
    mobile: (p, st) => p.variant === "mutual-match" ? matchMobile(p, st) : swipeMobile(p, st) },
  "dating-profile": { family: "dating", name: "Dating profile", shows: "a dating app profile with photos, bio, prompts, basics and interests, or the discovery filters for who appears in the daily picks" + NOTE,
    elements: ["profile", "photo-gallery", "photo-carousel", "prompts", "chips", "verified-badge", "action-buttons", "filters", "range-slider", "segmented-control", "toggle", "settings-list", "sidebar-nav", "avatar-stack"],
    variants: {
      "full-profile": { name: "Dating profile with photos and prompts", shows: "a full dating profile: a large photo with progress dots and a photo-verified badge, more photos, name and age, distance and activity, a bio, basics (height, job, education, location, drinking, looking for, languages, children) as chips, prompt answer cards, interests with the ones in common highlighted, pass / save / like actions and report or block links" },
      "discovery-filters": { name: "Dating app discovery filters", shows: "dating app discovery filters: an age range slider, a distance slider, show me (men, women, everyone), looking for chips, photo-verified only and recently active toggles, more preferences (height, drinking, children, languages), a reset link and a show 142 people button with a preview of how many people match" },
    },
    web: (p, st) => p.variant === "discovery-filters" ? filtersWeb(p, st) : profWeb(p, st),
    mobile: (p, st) => p.variant === "discovery-filters" ? filtersMobile(p, st) : profMobile(p, st) },
  "dating-chat": { family: "dating", name: "Dating app chats", shows: "a dating app's matches and messages: new matches that expire, the conversation list, and a chat thread with a match including a planned date" + NOTE,
    elements: ["chat-list", "conversation-list", "new-matches", "avatar", "unread-badge", "search-bar", "chat-messages", "chat-bubbles", "voice-note", "quoted-reply", "date-plan-card", "typing-indicator", "composer", "details-panel", "sidebar-nav", "tab-bar"],
    variants: {
      "matches-list": { name: "Dating app matches and conversations list", shows: "a dating app inbox: a row of new matches with avatars and days left before each match expires, a search bar and the conversation list with photos, last-message previews, times, unread counts and your-turn / date / new badges; on web also new match cards ending soonest, an openers tip and counts of unread messages, planned dates and likes" },
      "date-thread": { name: "Dating app chat thread with a date plan", shows: "a dating app chat thread: the match header with photo, verified badge and active status, the day you matched, a reply quoting their profile prompt, message bubbles, a voice note with a waveform, a date plan card both people accepted (coffee then a walk, time and place, share with a friend), read receipt, typing indicator and a composer with voice; on web also the conversation list and the match's profile panel with unmatch and report" },
    },
    web: (p, st) => p.variant === "date-thread" ? threadWeb(p, st) : matchesWeb(p, st),
    mobile: (p, st) => p.variant === "date-thread" ? threadMobile(p, st) : matchesMobile(p, st) },
  "dating-onboarding": { family: "dating", name: "Dating app onboarding", shows: "dating app sign-up steps: about you (name, birthday, gender, who to show, what you're looking for) and adding photos with a profile prompt" + NOTE,
    elements: ["onboarding", "stepper", "progress", "form", "input", "chips", "segmented-control", "option-cards", "photo-upload", "photo-grid", "drag-to-reorder", "prompts", "textarea", "tips", "button"],
    variants: {
      "about-you": { name: "Dating app sign-up: about you", shows: "a dating app onboarding step: step 2 of 6 progress, first name, birthday (only the age is shown), gender chips, show me (men, women, everyone), what you're looking for as option cards and a continue button; on web a step list with what others see and a back button" },
      "add-photos": { name: "Dating app sign-up: add photos and a prompt", shows: "a dating app onboarding step: a 3 by 2 photo grid with 3 photos added (the first marked main, remove and drag-to-reorder handles) and empty add-photo slots, photo tips, a profile prompt answer with a character count and a continue button; on web a step list" },
    },
    web: (p, st) => p.variant === "add-photos" ? photosWeb(p, st) : basicsWeb(p, st),
    mobile: (p, st) => p.variant === "add-photos" ? photosMobile(p, st) : basicsMobile(p, st) },
};
