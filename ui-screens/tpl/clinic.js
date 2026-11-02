/* Clinic family (Harbourline Health — fictional multi-specialty clinic, in-person and video visits):
   doctor-directory, telehealth-visit (waiting-room → in-call → visit-summary), clinic-home.
   One consistent video visit throughout: patient Priya Nair with Dr. Amara Osei (family medicine),
   Tue 3 Nov 2026, booked 10:30 AM, 20-min video follow-up for a cough that has lasted three weeks.
   Doctor and patient "photos" are illustrated SVG portraits in fixed natural tones (no images). */
const { ic, esc, status, tabBar, ICON } = require("../lib");

Object.assign(ICON, {
  clinic_cam: '<rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10.5l5-3v9l-5-3z"/>',
  clinic_camoff: '<rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10.5l5-3v9l-5-3zM2 3l19 19"/>',
  clinic_mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M8.5 21h7"/>',
  clinic_micoff: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M8.5 21h7M3 3l18 18"/>',
  clinic_hangup: '<path d="M3 14.5c5-4.7 13-4.7 18 0l-2.3 2.6-3.6-1.5v-2.6c-2.7-.9-4.5-.9-7.2 0v2.6l-3.6 1.5z"/>',
  clinic_screen: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4M12 13V7M9 10l3-3 3 3"/>',
  clinic_speaker: '<path d="M4 9.5h4l5-4v13l-5-4H4z"/><path d="M16.5 9a4 4 0 0 1 0 6M19 6.5a7.5 7.5 0 0 1 0 11"/>',
  clinic_wifi: '<path d="M2.5 9a14 14 0 0 1 19 0M5.5 12.5a9.5 9.5 0 0 1 13 0M8.5 16a5 5 0 0 1 7 0"/><circle cx="12" cy="19.3" r=".9"/>',
  clinic_steth: '<path d="M5 3v5a5 5 0 0 0 10 0V3M10 13v2.5a4.5 4.5 0 0 0 9 0V13"/><circle cx="19" cy="11" r="2"/>',
  clinic_cross: '<path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z"/>',
  clinic_baby: '<circle cx="12" cy="12.5" r="8.5"/><path d="M9 11h.01M15 11h.01M9.5 15a3.5 3.5 0 0 0 5 0M12 4c-1 1.6-.4 3 1.2 3"/>',
  clinic_bone: '<path d="M7.5 4.5a2.5 2.5 0 0 0-3 3 2.5 2.5 0 0 0 1.8 3.7L13 18a2.5 2.5 0 0 0 3.7 1.8 2.5 2.5 0 0 0 3-3A2.5 2.5 0 0 0 18 13L11.2 6.3a2.5 2.5 0 0 0-3.7-1.8z"/>',
  clinic_brain: '<path d="M10 4.5a3 3 0 0 0-4 2.3 3 3 0 0 0-2 5.2 3 3 0 0 0 2 5.2 3 3 0 0 0 4 2.3zM14 4.5a3 3 0 0 1 4 2.3 3 3 0 0 1 2 5.2 3 3 0 0 1-2 5.2 3 3 0 0 1-4 2.3z"/>',
  clinic_skin: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/><path d="M9.5 14.5a2.5 2.5 0 0 0 2.5 2.5"/>',
  clinic_venus: '<circle cx="12" cy="9" r="5.5"/><path d="M12 14.5V21M9 18h6"/>',
  clinic_pill: '<rect x="3" y="8.5" width="18" height="7" rx="3.5" transform="rotate(-45 12 12)"/><path d="M9.5 9.5l5 5"/>',
  clinic_lab: '<path d="M9 3h6M10 3v6l-5.5 9.5A1.7 1.7 0 0 0 6 21h12a1.7 1.7 0 0 0 1.5-2.5L14 9V3M7.5 15h9"/>',
  clinic_thermo: '<path d="M10 4a2 2 0 0 1 4 0v10a4 4 0 1 1-4 0z"/><path d="M12 10v6"/>',
  clinic_receipt: '<path d="M6 3h12v18l-2-1.5-2 1.5-2-1.5-2 1.5-2-1.5L6 21z"/><path d="M9 8h6M9 12h6M9 16h3"/>',
  clinic_call: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z"/>',
  clinic_user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4.5 4.2-7 8-7s7 2.5 8 7"/>',
  clinic_blur: '<circle cx="12" cy="12" r="9"/><path d="M12 3v18M16 5.5v13M19.5 9v6"/>',
  clinic_flip: '<path d="M4 8h12l-3-3M20 16H8l3 3"/>',
  clinic_note: '<path d="M5 3h10l4 4v14H5z"/><path d="M9 11h6M9 15h4"/>',
  clinic_pulse: '<path d="M3 12h4l2-5 4 10 2-5h6"/>',
  clinic_drop2: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',
});

const H = (st, px) => Math.round(px * st.hscale);
const CSS = `<style>
.cl-row{display:flex;align-items:center;gap:10px}
.mbody>*{flex-shrink:0}
.cl-ell{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.cl-hd{height:64px;flex:none;display:flex;align-items:center;gap:36px;padding:0 40px;border-bottom:1px solid var(--border);background:var(--surface)}
.cl-nav{display:flex;gap:26px;font-weight:500;font-size:14px;color:var(--muted);align-self:stretch}
.cl-nav span{display:flex;align-items:center;border-bottom:2px solid transparent;margin-bottom:-1px;white-space:nowrap}
.cl-nav span.on{color:var(--text);border-bottom-color:var(--primary)}
.cl-mark{display:grid!important;place-items:center;color:var(--on-primary)}
.cl-ph{position:relative;overflow:hidden;flex:none;border-radius:var(--radius);background:color-mix(in oklab,var(--text) 8%,var(--surface))}
.cl-ph>svg{position:absolute;inset:0;width:100%;height:100%;display:block}
.cl-ph.round{border-radius:50%}
.cl-chip{display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 12px;border-radius:999px;border:1px solid var(--border);background:var(--surface);font:500 13px var(--font-b);white-space:nowrap;flex:none}
.cl-chip.on{background:var(--primary);border-color:var(--primary);color:var(--on-primary)}
.cl-chip.soft{background:color-mix(in oklab,var(--primary) 9%,var(--surface));border-color:color-mix(in oklab,var(--primary) 30%,var(--border))}
.cl-slot{display:inline-flex;align-items:center;justify-content:center;height:28px;padding:0 9px;border-radius:var(--radius);border:1px solid color-mix(in oklab,var(--primary) 32%,var(--border));background:color-mix(in oklab,var(--primary) 7%,var(--surface));color:color-mix(in oklab,var(--primary) 72%,var(--text));font:600 12px var(--font-b);white-space:nowrap;font-variant-numeric:tabular-nums}
.cl-slot.on{background:var(--primary);border-color:var(--primary);color:var(--on-primary)}
.cl-mode{display:inline-flex;align-items:center;gap:4px;height:22px;padding:0 8px;border-radius:999px;font:600 11px var(--font-b);border:1px solid var(--border);color:var(--muted);white-space:nowrap;background:var(--surface)}
.cl-mode.v{border-color:color-mix(in oklab,var(--primary) 35%,var(--border));color:color-mix(in oklab,var(--primary) 75%,var(--text));background:color-mix(in oklab,var(--primary) 8%,var(--surface))}
.cl-cb{width:16px;height:16px;border-radius:4px;border:1.5px solid color-mix(in oklab,var(--text) 28%,var(--surface));display:grid;place-items:center;flex:none}
.cl-cb.on{background:var(--primary);border-color:var(--primary);color:var(--on-primary)}
.cl-rd{width:16px;height:16px;border-radius:50%;border:1.5px solid color-mix(in oklab,var(--text) 28%,var(--surface));display:grid;place-items:center;flex:none}
.cl-rd.on{border:5px solid var(--primary)}
.cl-ok{width:20px;height:20px;border-radius:50%;display:grid;place-items:center;flex:none;background:color-mix(in oklab,var(--primary) 14%,var(--surface));color:color-mix(in oklab,var(--primary) 80%,var(--text))}
.cl-seg{display:inline-flex;padding:3px;border-radius:var(--radius);background:color-mix(in oklab,var(--text) 6%,var(--surface));border:1px solid var(--border);font:500 13px var(--font-b)}
.cl-seg span{flex:1;display:inline-flex;align-items:center;justify-content:center;gap:6px;height:28px;padding:0 12px;border-radius:calc(var(--radius) - 2px);color:var(--muted);white-space:nowrap}
.cl-seg span.on{background:var(--surface);color:var(--text);box-shadow:var(--shadow-sm);font-weight:600}
.cl-sel{justify-content:space-between;gap:8px;color:var(--text)}
.cl-lbl{font:600 11px var(--font-b);text-transform:uppercase;letter-spacing:.06em;color:var(--muted)}
.cl-kv{display:grid;grid-template-columns:104px 1fr;gap:9px 12px;font-size:13px}
.cl-kv>span:nth-child(odd){color:var(--muted)}
.cl-hr{height:1px;background:var(--border);flex:none}
.cl-tile{position:relative;overflow:hidden;border-radius:var(--radius-lg);background:color-mix(in oklab,var(--on-ink) 10%,var(--ink))}
.cl-tile>svg{position:absolute;inset:0;width:100%;height:100%;display:block}
.cl-tag{position:absolute;left:12px;bottom:12px;display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 10px;border-radius:var(--radius);background:rgba(18,16,14,.58);color:#fff;font:600 12px var(--font-b);white-space:nowrap}
.cl-cap{position:absolute;left:50%;transform:translateX(-50%);bottom:18px;width:max-content;max-width:72%;padding:9px 16px;border-radius:var(--radius);background:rgba(18,16,14,.66);color:#fff;font-size:14px;line-height:1.45;text-align:center}
.cl-stage{background:var(--ink);color:var(--on-ink)}
.cl-ctl{width:48px;height:48px;border-radius:999px;display:grid;place-items:center;flex:none;background:color-mix(in oklab,var(--on-ink) 14%,var(--ink));color:var(--on-ink);border:1px solid color-mix(in oklab,var(--on-ink) 16%,transparent)}
.cl-ctl.off{background:var(--on-ink);color:var(--ink)}
.cl-ctl.glass{background:rgba(18,16,14,.55);color:#fff;border-color:rgba(255,255,255,.18)}
.cl-end{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:48px;padding:0 20px;border-radius:999px;background:var(--danger);color:var(--on-danger);font:600 14px var(--font-b);white-space:nowrap;flex:none}
.cl-end.sq{width:56px;padding:0}
.cl-meter{display:inline-flex;align-items:flex-end;gap:2px;height:14px}
.cl-meter i{width:3px;border-radius:2px;background:color-mix(in oklab,var(--text) 18%,var(--surface))}
.cl-meter i.on{background:var(--primary)}
.cl-step{display:flex;gap:10px;align-items:flex-start;font-size:13px}
.cl-step .d{width:18px;height:18px;border-radius:50%;flex:none;display:grid;place-items:center;margin-top:1px;border:1.5px solid var(--border);background:var(--surface)}
.cl-step .d.done{background:var(--primary);border-color:var(--primary);color:var(--on-primary)}
.cl-step .d.now{border:2px solid var(--primary)}
.cl-step .d.now::after{content:"";width:6px;height:6px;border-radius:50%;background:var(--primary)}
.cl-pulse{width:8px;height:8px;border-radius:50%;background:var(--accent);box-shadow:0 0 0 4px color-mix(in oklab,var(--accent) 22%,transparent);flex:none}
.cl-ico{width:40px;height:40px;border-radius:var(--radius);display:grid;place-items:center;flex:none;background:color-mix(in oklab,var(--primary) 11%,var(--surface));color:color-mix(in oklab,var(--primary) 80%,var(--text))}
.cl-bub{padding:9px 12px;border-radius:var(--radius-lg);background:color-mix(in oklab,var(--text) 6%,var(--surface));line-height:1.45;font-size:13px}
.cl-bub.me{background:var(--primary);color:var(--on-primary);justify-self:end}
.cl-star{color:color-mix(in oklab,var(--accent) 80%,var(--text));display:inline-flex}
</style>`;

// ---- Illustrated people (fixed natural tones; artwork, not UI colour) -----------------------
const PPL = {
  AO: { name: "Dr. Amara Osei", skin: "#7a4a2a", hair: "#16100c", style: "bun", coat: true, shirt: "#2f6f8f", wall: ["#dccdb9", "#b8a38a"] },
  KW: { name: "Dr. Kenji Watanabe", skin: "#e6c19a", hair: "#141110", style: "short", glasses: true, coat: true, shirt: "#46506b", wall: ["#ccd3d2", "#a0aba9"] },
  SM: { name: "Dr. Sofía Márquez", skin: "#c98f63", hair: "#3a2216", style: "curly", coat: true, shirt: "#b8604f", wall: ["#e6d6c2", "#c4ae94"] },
  RM: { name: "Dr. Rahul Menon", skin: "#94603a", hair: "#110b08", style: "short", beard: true, coat: true, shirt: "#5d7a5a", wall: ["#bcc6b5", "#909d89"] },
  LH: { name: "Dr. Leila Haddad", skin: "#d4a37a", hair: "#2a1910", style: "bob", coat: true, shirt: "#6b4a7a", wall: ["#ddd2c7", "#b6a798"] },
  TN: { name: "Dr. Tomasz Nowak", skin: "#f0c8a8", hair: "#8a6038", style: "short", coat: true, shirt: "#3f5e7c", wall: ["#d0d7dd", "#a6b1bb"] },
  GL: { name: "Dr. Grace Liang", skin: "#ecc8a0", hair: "#121010", style: "long", glasses: true, coat: true, shirt: "#7b5b3b", wall: ["#d9d4c7", "#b3ab98"] },
  FA: { name: "Dr. Femi Adeyemi", skin: "#4e2f1d", hair: "#0d0907", style: "crop", beard: true, coat: true, shirt: "#8a6a3a", wall: ["#c6b8a6", "#9a8b78"] },
  PN: { name: "Priya Nair", skin: "#a86b40", hair: "#1c140e", style: "long", coat: false, shirt: "#2f5d50", wall: ["#cfc1ab", "#a3927a"] },
};
let artN = 0;
const figure = (a) => {
  const hair = {
    long: `<path d="M64 58c0-13 7-20 16-20s16 7 16 20c-4-8-10-11-16-11s-12 3-16 11z" fill="${a.hair}"/>`,
    short: `<path d="M64 56c0-12 7-18 16-18s16 6 16 18c-3-6-8-8-16-8s-13 2-16 8z" fill="${a.hair}"/>`,
    bob: `<path d="M62 64c-2-17 6-27 18-27s20 10 18 27c0 6-2 10-3 12h-2c1-8 0-16-4-20-6 3-13 4-20 3-3 5-4 10-3 17h-2c-1-2-2-6-2-12z" fill="${a.hair}"/>`,
    bun: `<circle cx="80" cy="33" r="7" fill="${a.hair}"/><path d="M64 58c0-13 7-19 16-19s16 6 16 19c-3-7-9-10-16-10s-13 3-16 10z" fill="${a.hair}"/>`,
    curly: [[66, 50, 8], [74, 43, 9], [86, 43, 9], [94, 50, 8], [64, 60, 6], [96, 60, 6], [62, 70, 5], [98, 70, 5]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${a.hair}"/>`).join(""),
    crop: `<path d="M65.5 57c1-11 7-17 14.5-17s13.5 6 14.5 17c-3-5-8-7.5-14.5-7.5S68.5 52 65.5 57z" fill="${a.hair}"/>`,
  }[a.style];
  const backHair = a.style === "long" ? `<path d="M61 62c-1-18 7-28 19-28s20 10 19 28c2 12 4 22 7 30H54c3-8 5-18 7-30z" fill="${a.hair}"/>` : "";
  const body = a.coat
    ? `<path d="M36 121c1-21 17-32 44-32s43 11 44 32z" fill="#eeebe4"/><path d="M72 89l8 17 8-17z" fill="${a.shirt}"/><path d="M72 89l-5 32M88 89l5 32" stroke="#cdc7bb" stroke-width="1.4" fill="none"/><path d="M71 92c-5 9-3 18 3 21M89 92c4 8 4 15 1 19" stroke="#2f3439" stroke-width="1.6" fill="none" stroke-linecap="round"/><circle cx="90" cy="112.5" r="2.6" fill="#9aa3ab"/><rect x="97" y="101" width="12" height="3" rx="1" fill="#cdc7bb"/>`
    : `<path d="M36 121c1-21 17-32 44-32s43 11 44 32z" fill="${a.shirt}"/><path d="M73.5 89c2 4 11 4 13 0" fill="none" stroke="#000" stroke-opacity=".15" stroke-width="2"/>`;
  const beard = a.beard ? `<path d="M66 64c1 11 7 16.5 14 16.5S93 75 94 64c-2 4-5 6-7 6-2-2-4.5-2.8-7-2.8s-5 .8-7 2.8c-2 0-5-2-7-6z" fill="${a.hair}" opacity=".92"/>` : "";
  const glasses = a.glasses ? `<g fill="none" stroke="#2a2522" stroke-width="1.1"><circle cx="74" cy="62" r="4.3"/><circle cx="86" cy="62" r="4.3"/><path d="M78.3 62h3.4M69.7 61l-4 -1M90.3 61l4-1"/></g>` : "";
  return `${backHair}${body}<path d="M73.5 76h13v13c-3 4-10 4-13 0z" fill="${a.skin}"/>
<ellipse cx="65.5" cy="64" rx="3" ry="4.5" fill="${a.skin}"/><ellipse cx="94.5" cy="64" rx="3" ry="4.5" fill="${a.skin}"/><ellipse cx="80" cy="62" rx="15" ry="18" fill="${a.skin}"/><g fill="#1f1510" opacity=".78"><ellipse cx="74" cy="62" rx="1.7" ry="2"/><ellipse cx="86" cy="62" rx="1.7" ry="2"/></g><path d="M71 57.5q3-1.6 6 0M83 57.5q3-1.6 6 0" stroke="#1f1510" stroke-opacity=".55" stroke-width="1.2" fill="none" stroke-linecap="round"/><path d="M80 63.5l-1.4 4.2h2.4" stroke="#000" stroke-opacity=".18" stroke-width="1" fill="none"/>${beard}<path d="M75.5 72q4.5 3.2 9 0" stroke="#5a2a20" stroke-opacity=".7" stroke-width="1.3" fill="none" stroke-linecap="round"/><ellipse cx="72" cy="68" rx="3" ry="1.8" fill="#d0705a" opacity=".12"/><ellipse cx="88" cy="68" rx="3" ry="1.8" fill="#d0705a" opacity=".12"/>${glasses}${hair}`;
};
const bg = (a, id) => `<defs><linearGradient id="${id}w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a.wall[0]}"/><stop offset="1" stop-color="${a.wall[1]}"/></linearGradient><radialGradient id="${id}l" cx=".3" cy=".2" r=".9"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset="1" stop-color="#000" stop-opacity=".16"/></radialGradient></defs><rect x="-200" y="-40" width="560" height="200" fill="url(#${id}w)"/>`;
// head-and-shoulders portrait (directory cards, avatars)
const portrait = (k) => { const a = PPL[k], id = `clp${k}${artN++}`; return `<svg viewBox="34 30 92 92" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${bg(a, id)}${figure(a)}<rect x="-200" y="-40" width="560" height="200" fill="url(#${id}l)"/></svg>`; };
// wide "camera feed": consulting room for doctors, a living room for the patient
const feed = (k) => {
  const a = PPL[k], id = `clf${k}${artN++}`;
  const props = a.coat
    ? `<rect x="14" y="16" width="30" height="22" rx="1" fill="#f6f2ea" opacity=".75"/><rect x="18" y="20" width="22" height="2" fill="#b8ad9c"/><rect x="18" y="25" width="16" height="1.6" fill="#c8bfb0"/><rect x="18" y="29" width="19" height="1.6" fill="#c8bfb0"/><rect x="112" y="44" width="46" height="4" fill="#ffffff" opacity=".45"/><rect x="116" y="28" width="7" height="16" fill="#5f7d8c" opacity=".55"/><rect x="124" y="31" width="6" height="13" fill="#8b6c55" opacity=".5"/><rect x="131" y="26" width="5" height="18" fill="#6e7f62" opacity=".5"/><path d="M146 44c-6-6-4-14 0-18 4 4 6 12 0 18z" fill="#5f7e57" opacity=".7"/>`
    : `<rect x="10" y="10" width="40" height="52" rx="2" fill="#f4ead6" opacity=".55"/><path d="M30 10v52M10 36h40" stroke="#a3927a" stroke-width="1.4" opacity=".6"/><path d="M128 54c0-14 8-22 14-22s14 8 14 22z" fill="#e9d9b8" opacity=".6"/><rect x="140" y="54" width="3" height="40" fill="#6d5c48" opacity=".5"/><path d="M112 70c-5-8-2-18 3-22 5 4 7 14 0 22z" fill="#6d8a5c" opacity=".65"/>`;
  return `<svg viewBox="0 0 160 120" preserveAspectRatio="xMidYMax slice" aria-hidden="true">${bg(a, id)}${props}${figure(a)}<rect x="-200" y="-40" width="560" height="200" fill="url(#${id}l)"/></svg>`;
};
const ph = (k, s, round) => `<span class="cl-ph${round ? " round" : ""}" style="width:${s}px;height:${s}px">${portrait(k)}</span>`;

const spin = (s) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" aria-hidden="true" style="flex:none"><circle cx="12" cy="12" r="9" style="stroke:color-mix(in oklab,var(--primary) 20%,transparent)" stroke-width="2.5"/><path d="M12 3a9 9 0 0 1 9 9" style="stroke:var(--primary)" stroke-width="2.5" stroke-linecap="round"/></svg>`;
// ---- shared bits ----------------------------------------------------------------------------
const mark = `<b class="cl-mark">${ic("clinic_cross", 13)}</b>`;
const logo = (p) => `<div class="logo" style="white-space:nowrap">${mark}${esc(p.name)}</div>`;
const hdr = (p, active) => `<header class="cl-hd">${logo(p)}<nav class="cl-nav">${["Find a doctor", "Specialties", "Video visits", "Locations", "Patients & visitors"].map((l) => `<span class="${l === active ? "on" : ""}">${l}</span>`).join("")}</nav>
<div class="cl-row" style="margin-left:auto;gap:10px"><span class="cl-row muted" style="gap:6px;font-size:13px;font-weight:500;white-space:nowrap">${ic("clinic_call", 15)}(555) 014-2200</span><span class="btn">${ic("lock", 15)}Patient portal</span><span class="btn primary">${ic("calendar", 15)}Book a visit</span></div></header>`;
const cb = (on) => `<span class="cl-cb${on ? " on" : ""}">${on ? ic("check", 11) : ""}</span>`;
const rd = (on) => `<span class="cl-rd${on ? " on" : ""}"></span>`;
const mode = (m) => m === "Video" ? `<span class="cl-mode v">${ic("clinic_cam", 12)}Video</span>` : `<span class="cl-mode">${ic("pin", 12)}In-person</span>`;
const seg = (items, on) => `<span class="cl-seg">${items.map((t, i) => `<span class="${i === on ? "on" : ""}">${t}</span>`).join("")}</span>`;
const meter = (n, lit, hs) => `<span class="cl-meter">${Array.from({ length: n }, (_, i) => `<i class="${i < lit ? "on" : ""}" style="height:${hs ? hs[i % hs.length] : 4 + ((i * 5) % 10)}px"></i>`).join("")}</span>`;
const sel = (t, icon) => `<div class="input cl-sel"><span class="cl-row cl-ell" style="gap:8px">${icon ? ic(icon, 15) : ""}${t}</span>${ic("chevdown", 15)}</div>`;
const step = (state, t, sub) => `<div class="cl-step"><span class="d ${state}">${state === "done" ? ic("check", 10) : ""}</span><div style="min-width:0"><div style="${state === "now" ? "font-weight:600" : state === "done" ? "" : "color:var(--muted)"}">${t}</div>${sub ? `<div class="muted" style="font-size:12px">${sub}</div>` : ""}</div></div>`;

// =============================================================================================
// doctor-directory
const DOCS = [
  ["AO", "Family medicine", ["English", "Twi"], ["In-person", "Video"], "4.9", 318, "Quayside · Level 2", "Today", ["3:40 PM", "4:20 PM", "5:00 PM"], "14 yrs"],
  ["SM", "Paediatrics", ["English", "Spanish"], ["In-person", "Video"], "4.9", 276, "Quayside · Level 3", "Today", ["4:20 PM", "5:40 PM"], "11 yrs"],
  ["FA", "Mental health", ["English", "Yoruba"], ["Video"], "5.0", 142, "Video only", "Today", ["6:00 PM", "7:30 PM"], "9 yrs"],
  ["RM", "Dermatology", ["English", "Hindi", "Malayalam"], ["Video", "In-person"], "4.8", 203, "Northgate · Level 1", "Tomorrow", ["8:50 AM", "9:30 AM", "1:15 PM"], "12 yrs"],
  ["GL", "Endocrinology & diabetes", ["English", "Mandarin", "Cantonese"], ["In-person", "Video"], "4.9", 187, "Quayside · Level 4", "Tomorrow", ["1:10 PM", "2:50 PM"], "16 yrs"],
  ["KW", "Cardiology", ["English", "Japanese"], ["In-person"], "4.8", 254, "Quayside · Heart centre", "Wed 5 Nov", ["9:15 AM", "11:40 AM"], "21 yrs"],
  ["LH", "Women’s health", ["English", "Arabic", "French"], ["In-person", "Video"], "4.9", 231, "Northgate · Level 2", "Thu 6 Nov", ["11:00 AM", "3:30 PM"], "13 yrs"],
  ["TN", "Orthopaedics & sports", ["English", "Polish"], ["In-person", "Video"], "4.7", 165, "Northgate · Level 1", "Fri 7 Nov", ["2:30 PM"], "18 yrs"],
];
const docCard = ([k, sp, langs, modes, rt, rv, loc, day, slots, yrs]) => `<div class="card" style="padding:14px 16px;display:flex;flex-direction:column;gap:10px;min-width:0">
<div style="display:flex;gap:12px;align-items:flex-start">${ph(k, 64)}<div style="flex:1;min-width:0"><div style="font-weight:600;font-size:15px" class="cl-ell">${PPL[k].name}</div><div class="muted" style="font-size:13px" class="cl-ell">${sp} · ${yrs}</div>
<div class="cl-row" style="gap:4px;font-size:12px;margin-top:4px"><span class="cl-star">${ic("star", 13)}</span><b style="font-weight:600">${rt}</b><span class="muted">(${rv} reviews)</span></div></div><span class="muted">${ic("bookmark", 17)}</span></div>
<div style="display:grid;gap:5px;font-size:12.5px"><div class="cl-row cl-ell" style="gap:7px"><span class="muted">${ic("globe", 14)}</span>${langs.join(", ")}</div><div class="cl-row cl-ell" style="gap:7px"><span class="muted">${ic("pin", 14)}</span>${loc}</div></div>
<div class="cl-row" style="gap:6px">${modes.map(mode).join("")}<span class="badge" style="margin-left:auto">New patients</span></div>
<div class="cl-hr"></div>
<div><div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:7px"><span class="muted">Next available</span><b style="font-weight:600">${day}</b></div><div class="cl-row" style="gap:6px">${slots.map((s) => `<span class="cl-slot">${s}</span>`).join("")}${slots.length < 3 ? `<span class="muted" style="font-size:12px">More times</span>` : ""}</div></div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><span class="btn">View profile</span><span class="btn primary">Book</span></div></div>`;

const SPECS = [["Family medicine", 9], ["Paediatrics", 5], ["Mental health", 5], ["Women’s health", 6], ["Dermatology", 3], ["Cardiology", 4], ["Orthopaedics & sports", 4], ["Endocrinology & diabetes", 3]];
const TPL = {};
TPL["doctor-directory/web"] = (p, st) => `${CSS}<div style="height:100%;display:flex;flex-direction:column">${hdr(p, "Find a doctor")}
<div style="flex:1;min-height:0;display:grid;grid-template-columns:288px minmax(0,1fr)">
<aside style="border-right:1px solid var(--border);padding:22px 24px;display:flex;flex-direction:column;gap:16px;background:color-mix(in oklab,var(--surface) 55%,var(--bg));overflow:hidden">
<div style="display:flex;justify-content:space-between;align-items:baseline"><div style="font-weight:600;font-size:15px">Filters</div><span style="color:var(--primary);font-size:13px;font-weight:500">Clear all</span></div>
<div class="field"><label style="font-size:12px">Location</label>${sel("Quayside · within 5 km", "pin")}</div>
<div style="display:grid;gap:8px"><div class="cl-lbl">Specialty</div>${SPECS.map(([n, c, on]) => `<div class="cl-row" style="gap:9px;font-size:13px">${cb(on)}<span style="flex:1" class="cl-ell">${n}</span><span class="muted" style="font-size:12px">${c}</span></div>`).join("")}<span style="color:var(--primary);font-size:13px;font-weight:500">Show 4 more</span></div>
<div style="display:grid;gap:8px"><div class="cl-lbl">Visit type</div>${seg(["Any", `${ic("pin", 13)}In-person`, `${ic("clinic_cam", 13)}Video`], 0)}</div>
<div style="display:grid;gap:8px"><div class="cl-lbl">Availability</div>${[["Any time", 0], ["Today", 0], ["Next 3 days", 1]].map(([t, on]) => `<div class="cl-row" style="gap:9px;font-size:13px">${rd(on)}${t}</div>`).join("")}</div>
<div style="display:grid;gap:8px"><div class="cl-lbl">Languages spoken</div><div style="display:flex;flex-wrap:wrap;gap:6px">${["English", "Spanish", "Mandarin", "Hindi", "Arabic", "+7"].map((l, i) => `<span class="cl-chip" style="height:26px;font-size:12px;padding:0 10px">${l}</span>`).join("")}</div></div>
<div class="cl-row" style="gap:9px;font-size:13px">${cb(1)}Accepting new patients</div>
</aside>
<main style="padding:20px 32px;display:flex;flex-direction:column;gap:14px;min-width:0;overflow:hidden">
<div style="display:flex;align-items:flex-end;justify-content:space-between;gap:20px"><div><h1 style="font-size:${H(st, 28)}px">Find a doctor</h1><p class="muted" style="margin-top:4px">42 doctors across 12 specialties. Most offer a video visit within 48 hours.</p></div>
<div class="input" style="width:400px;height:44px;gap:10px;flex:none">${ic("search", 17)}<span class="cl-ell">Search by name, specialty or condition</span></div></div>
<div class="cl-row" style="gap:8px;flex-wrap:nowrap"><span class="cl-chip">Specialty ${ic("chevdown", 13)}</span><span class="cl-chip soft">Availability: next 3 days ${ic("chevdown", 13)}</span><span class="cl-chip">Language ${ic("chevdown", 13)}</span><span class="cl-chip">${ic("clinic_cam", 14)}Video visits</span><span class="cl-chip soft">New patients ${ic("x", 12)}</span>
<span class="cl-row" style="margin-left:auto;gap:8px"><span class="muted" style="font-size:13px;white-space:nowrap">Sort</span><div style="width:180px">${sel("Soonest available")}</div><span class="cl-seg"><span class="on">${ic("grid", 14)}</span><span>${ic("list", 14)}</span></span></span></div>
<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:-4px"><div class="cl-row" style="gap:8px"><span style="font-weight:600">Providers near you</span><span class="muted cl-row" style="gap:5px;font-size:13px">${ic("pin", 13)}Quayside, within 5 km · 2 clinics</span></div><span class="muted" style="font-size:13px;white-space:nowrap">Showing 6 of 18 matches</span></div>
<div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px">${DOCS.slice(0, 6).map(docCard).join("")}</div>
</main></div></div>`;

TPL["doctor-directory/mobile"] = (p, st) => `${CSS}<div class="phone">${status()}
<div class="mtop">${ic("back", 22)}<div class="h" style="font-size:${H(st, 18)}px">Find a doctor</div><span class="btn" style="height:34px;padding:0 10px;position:relative">${ic("filter", 16)}<span style="position:absolute;top:-6px;right:-6px;min-width:18px;height:18px;border-radius:999px;background:var(--primary);color:var(--on-primary);font:700 10px/18px var(--font-b);text-align:center">3</span></span></div>
<div class="mbody" style="gap:12px">
<div class="input" style="gap:8px">${ic("search", 16)}Doctor, specialty or condition</div>
<div style="display:flex;gap:8px;overflow:hidden;margin-right:-20px">${[`Specialty ${ic("chevdown", 12)}`, `Next 3 days ${ic("chevdown", 12)}`, `Language ${ic("chevdown", 12)}`, `${ic("clinic_cam", 13)}Video visits`].map((t, i) => `<span class="cl-chip${i === 1 ? " on" : ""}">${t}</span>`).join("")}</div>
<div style="display:flex;justify-content:space-between;align-items:center;font-size:13px"><span class="cl-row" style="gap:5px"><span class="muted">${ic("pin", 13)}</span><span><b style="font-weight:600">Near you</b> <span class="muted">· Quayside</span></span></span><span class="cl-row" style="gap:8px;font-weight:500">${ic("clinic_cam", 15)}Video only<span style="width:34px;height:20px;border-radius:999px;background:var(--primary);position:relative"><span style="position:absolute;right:2px;top:2px;width:16px;height:16px;border-radius:50%;background:var(--on-primary)"></span></span></span></div>
${DOCS.slice(0, 3).map(([k, sp, langs, modes, rt, rv, loc, day, slots]) => `<div class="card" style="padding:14px;display:grid;gap:10px">
<div style="display:flex;gap:12px;align-items:flex-start">${ph(k, 56)}<div style="flex:1;min-width:0"><div style="font-weight:600" class="cl-ell">${PPL[k].name}</div><div class="muted cl-ell" style="font-size:12.5px">${sp} · ${langs.join(", ")}</div><div class="cl-row" style="gap:5px;margin-top:5px">${modes.map(mode).join("")}<span class="cl-row" style="gap:3px;font-size:12px;margin-left:2px"><span class="cl-star">${ic("star", 12)}</span>${rt}</span></div></div></div>
<div style="display:flex;align-items:center;gap:10px;padding-top:10px;border-top:1px solid var(--border)"><div style="flex:1;min-width:0"><div class="muted" style="font-size:11px">Next available</div><div style="font-weight:600;font-size:13px">${day}, ${slots[0]}</div></div><span class="btn" style="height:34px">Profile</span><span class="btn primary" style="height:34px">Book</span></div></div>`).join("")}
</div><div style="flex:none;padding:12px 20px 30px;border-top:1px solid var(--border);background:var(--surface);display:flex;align-items:center;gap:12px;box-shadow:var(--shadow)"><div style="flex:1;min-width:0"><div style="font-weight:600">18 doctors</div><div class="muted" style="font-size:12px">Soonest: today, 3:40 PM</div></div><span class="btn primary" style="height:44px;padding:0 22px">${ic("calendar", 16)}Book now</span></div></div>`;

// =============================================================================================
// telehealth-visit
const tHdr = (p, st, right) => `<header class="cl-hd" style="height:60px;gap:16px;padding:0 28px">${logo(p)}<span style="width:1px;height:24px;background:var(--border)"></span>
<div style="min-width:0"><div class="h" style="font-size:${H(st, 15)}px;white-space:nowrap">Video visit with Dr. Amara Osei</div><div class="muted" style="font-size:12px;white-space:nowrap">Family medicine · Tue 3 Nov 2026 · booked 10:30 AM</div></div>${right}</header>`;

TPL["telehealth-visit/web"] = (p, st) => {
  const v = p.variant || "waiting-room";
  if (v === "in-call") {
    return `${CSS}<div style="height:100%;display:flex;flex-direction:column">${tHdr(p, st, `<span class="badge" style="gap:5px;margin-left:8px">${ic("lock", 11)}End-to-end encrypted</span>
<span class="cl-row" style="margin-left:auto;gap:18px"><span class="cl-row muted" style="gap:6px;font-size:13px">${ic("clinic_wifi", 16)}Strong connection</span><span class="num cl-row" style="font-size:15px;gap:6px">${ic("clock", 15)}08:42</span><span class="btn">${ic("users", 15)}Add a caregiver</span></span>`)}
<div style="flex:1;min-height:0;display:grid;grid-template-columns:minmax(0,1fr) 372px">
<div class="cl-stage" style="display:flex;flex-direction:column;min-height:0">
<div style="flex:1;min-height:0;padding:18px 20px 0;position:relative;display:flex">
<div class="cl-tile" style="flex:1">${feed("AO")}<span class="cl-tag"><span class="cl-meter" style="height:12px">${[6, 11, 8].map((h) => `<i class="on" style="height:${h}px;background:#fff"></i>`).join("")}</span>Dr. Amara Osei · Family medicine</span>
<div class="cl-cap" style="bottom:60px">“A cough that’s worse when you lie down, with a tickle at the back of the throat, often points to post-nasal drip.”</div>
<span class="cl-tag" style="bottom:auto;top:12px">${ic("doc", 13)}Captions on</span></div>
<div class="cl-tile" style="position:absolute;right:40px;top:38px;width:232px;height:146px;box-shadow:0 0 0 2px color-mix(in oklab,var(--on-ink) 30%,transparent),0 10px 30px rgba(0,0,0,.35)">${feed("PN")}<span class="cl-tag" style="left:8px;bottom:8px;height:24px;font-size:11px">${ic("clinic_mic", 12)}You · Priya</span></div></div>
<div style="height:92px;flex:none;display:flex;align-items:center;padding:0 24px;gap:10px">
<div style="flex:1;min-width:0"><div style="font-weight:600;font-size:13px">Follow-up: cough for 3 weeks</div><div style="font-size:12px;opacity:.7">Started 10:33 AM · 20 min booked</div></div>
<div class="cl-row" style="gap:12px">${[["clinic_mic", ""], ["clinic_cam", ""], ["clinic_screen", ""], ["clinic_speaker", ""], ["more", ""]].map(([i, c]) => `<span class="cl-ctl ${c}">${ic(i, 20)}</span>`).join("")}</div>
<div style="flex:1;display:flex;justify-content:flex-end"><span class="cl-end">${ic("clinic_hangup", 18)}End visit</span></div></div></div>
<aside style="border-left:1px solid var(--border);display:flex;flex-direction:column;min-height:0;background:var(--surface)">
<div style="padding:14px 18px;border-bottom:1px solid var(--border);flex:none">${seg([`${ic("clinic_note", 13)}Visit`, `${ic("chat", 13)}Chat · 3`, `${ic("doc", 13)}Files`], 0)}</div>
<div style="padding:16px 18px;display:grid;gap:12px;border-bottom:1px solid var(--border);flex:none">
<div class="cl-row" style="gap:10px">${ph("AO", 40, 1)}<div style="min-width:0"><div style="font-weight:600">Dr. Amara Osei</div><div class="muted" style="font-size:12px">Family medicine · Quayside clinic</div></div></div>
<div class="cl-kv"><span>Reason</span><span>Cough for 3 weeks, worse at night</span><span>You shared</span><span>No fever (36.9 °C at home) · mild sore throat in the mornings</span><span>Medications</span><span>Vitamin D 1,000 IU daily</span><span>Allergies</span><span><span class="badge">Penicillin</span></span></div></div>
<div style="padding:12px 18px;border-bottom:1px solid var(--border);display:grid;gap:8px;flex:none"><div style="display:flex;justify-content:space-between;align-items:center"><span style="font-weight:600;font-size:13px">My notes</span><span class="muted" style="font-size:11px">Only you can see these</span></div>
<div class="cl-bub" style="background:color-mix(in oklab,var(--primary) 6%,var(--surface));border:1px dashed color-mix(in oklab,var(--primary) 30%,var(--border))">Ask about the nasal spray at night · pharmacy is Quayside on 52 Quayside Rd</div></div>
<div style="flex:1;min-height:0;display:flex;flex-direction:column;justify-content:flex-end;gap:10px;padding:12px 18px;overflow:hidden">
<div class="muted" style="font-size:11px;text-align:center">Chat with Dr. Osei · today</div>
<div style="display:grid;gap:4px;justify-items:end"><div class="cl-bub me">Sound dropped for a second, all good now.</div><span class="muted" style="font-size:11px">You · 10:34 AM</span></div>
<div style="display:grid;gap:4px;justify-items:start"><div class="cl-bub">Could you upload a photo of the inhaler you used last spring? Just the label is fine.</div><span class="muted" style="font-size:11px">Dr. Osei · 10:36 AM</span></div>
<div style="display:grid;gap:4px;justify-items:end"><div class="cl-bub me" style="display:flex;gap:10px;align-items:center">${ic("image", 18)}<div><div style="font-weight:600">inhaler-label.jpg</div><div style="font-size:11px;opacity:.8">1.2 MB</div></div></div><span class="muted" style="font-size:11px">You · 10:37 AM</span></div>
<div style="display:grid;gap:4px;justify-items:start"><div class="cl-bub">Thanks, that helps. I’ll add it to your record.</div><span class="muted" style="font-size:11px">Dr. Osei · 10:38 AM</span></div></div>
<div style="padding:12px 18px 16px;border-top:1px solid var(--border);flex:none"><div class="input" style="gap:8px">${ic("plus", 16)}<span class="cl-ell">Message Dr. Osei</span><span style="margin-left:auto;color:var(--primary);display:inline-flex">${ic("send", 16)}</span></div></div>
</aside></div></div>`;
  }
  if (v === "visit-summary") {
    const nav = [["home", "Home"], ["calendar", "Appointments"], ["clinic_note", "Visit summaries"], ["clinic_pill", "Prescriptions"], ["chat", "Messages"], ["clinic_receipt", "Billing & insurance"]];
    return `${CSS}<div class="shell"><aside class="side">${logo(p).replace('class="logo"', 'class="logo" style="padding:2px 8px 18px;white-space:nowrap"')}${nav.map(([i, l]) => `<div class="nav${l === "Visit summaries" ? " on" : ""}">${ic(i)}${l}${l === "Messages" ? '<span class="badge" style="margin-left:auto">2</span>' : ""}</div>`).join("")}
<div class="grp">My care team</div>${[["AO", "Dr. Amara Osei", "Family medicine"], ["RM", "Dr. Rahul Menon", "Dermatology"]].map(([k, n, s]) => `<div class="nav" style="gap:9px">${ph(k, 26, 1)}<div style="min-width:0;line-height:1.25"><div style="font-size:13px;font-weight:500" class="cl-ell">${n}</div><div style="font-size:11px" class="cl-ell">${s}</div></div></div>`).join("")}
<div class="foot">${ph("PN", 30, 1)}<div style="min-width:0"><div style="font-weight:500">Priya Nair</div><div class="muted" style="font-size:12px">Patient ID HL-20417</div></div></div></aside>
<main class="main"><div class="top"><span class="muted">Visit summaries</span><span class="muted">/</span><span style="font-weight:500;white-space:nowrap">Video visit · 3 Nov 2026</span><span class="cl-row" style="margin-left:auto;gap:8px"><span class="btn">${ic("download", 15)}Download PDF</span><span class="btn">${ic("share", 15)}Share</span><span class="btn primary">${ic("chat", 15)}Message Dr. Osei</span></span></div>
<div class="page" style="gap:14px;padding:18px 28px">
<div style="display:flex;align-items:center;gap:14px">${ph("AO", 52, 1)}<div style="flex:1;min-width:0"><div class="cl-row" style="gap:10px"><h1 style="font-size:${H(st, 24)}px">Your visit summary</h1><span class="badge">Completed</span></div><p class="muted" style="margin-top:2px">Video follow-up with Dr. Amara Osei · Tue 3 Nov 2026, 10:33–10:52 AM · Shared with you at 10:58 AM</p></div></div>
<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px">${[["clinic_thermo", "Temperature", "36.9 °C", "Home reading"], ["clinic_pulse", "Heart rate", "72 bpm", "Home reading"], ["clinic_drop2", "Oxygen saturation", "98%", "Pulse oximeter"], ["heart", "Blood pressure", "118/76", "Home cuff, 9:50 AM"]].map(([i, l, val, s]) => `<div class="card" style="padding:9px 14px;display:flex;gap:12px;align-items:center"><span class="cl-ico" style="width:36px;height:36px">${ic(i, 18)}</span><div style="min-width:0"><div class="muted" style="font-size:12px">${l}</div><div class="num" style="font-size:18px">${val}</div><div class="muted" style="font-size:11px">${s}</div></div></div>`).join("")}</div>
<div style="display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);gap:14px;align-items:start">
<div style="display:grid;gap:14px">
<div class="card" style="padding:16px 18px;display:grid;gap:10px"><div class="cl-lbl">What we found</div>
<div><div style="font-weight:600;font-size:16px">Allergic rhinitis with post-nasal drip</div><div class="muted" style="font-size:13px">In plain words: seasonal nasal allergies</div></div>
<p style="line-height:1.5">Your cough most likely comes from mucus draining down the back of your throat, which is why it’s worse when you lie down. You have no fever and your breathing sounded clear on video, so this doesn’t look like a chest infection.</p>
<div style="display:grid;gap:8px">${["Take cetirizine every evening for the next 4 weeks", "Use the nasal spray each morning: 2 sprays in each nostril", "Sleep with your head slightly raised on an extra pillow"].map((t) => `<div class="cl-row" style="gap:10px;font-size:13px"><span class="cl-ok">${ic("check", 12)}</span>${t}</div>`).join("")}</div>
<div style="padding:10px 12px;border-radius:var(--radius);background:color-mix(in oklab,var(--warning) 12%,var(--surface));border:1px solid color-mix(in oklab,var(--warning) 45%,var(--border));font-size:13px;display:flex;gap:10px"><span style="color:var(--warning);display:inline-flex">${ic("bell", 16)}</span><span><b style="font-weight:600">Get seen sooner</b> if you develop a fever over 38 °C, feel short of breath, or the cough brings up blood. Call (555) 014-2200, any time.</span></div></div>
<div class="card" style="overflow:hidden"><div style="padding:14px 18px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--border)"><span style="font-weight:600">Prescriptions</span><span class="muted" style="font-size:12px">Sent to Quayside Pharmacy · 52 Quayside Rd</span></div>
${[["Cetirizine 10 mg tablets", "1 tablet each evening · 30 tablets · 1 refill"], ["Fluticasone nasal spray 50 mcg", "2 sprays each nostril, mornings · 1 bottle"], ["Saline nasal rinse", "Over the counter · once daily before the spray", "OTC"]].map(([n, d, otc]) => otc ? `<div style="display:flex;align-items:center;gap:12px;padding:10px 18px;border-top:1px solid var(--border)"><span class="cl-ico" style="width:34px;height:34px">${ic("clinic_drop2", 17)}</span><div style="flex:1;min-width:0"><div style="font-weight:500">${n}</div><div class="muted" style="font-size:12px">${d}</div></div><div style="text-align:right"><span class="cl-mode">No prescription</span><div class="muted" style="font-size:11px;margin-top:2px">Any pharmacy</div></div></div>` : `<div style="display:flex;align-items:center;gap:12px;padding:10px 18px;border-top:1px solid var(--border)"><span class="cl-ico" style="width:34px;height:34px">${ic("clinic_pill", 17)}</span><div style="flex:1;min-width:0"><div style="font-weight:500">${n}</div><div class="muted" style="font-size:12px">${d}</div></div><div style="text-align:right"><span class="badge">Sent</span><div class="muted" style="font-size:11px;margin-top:2px">Ready from 2:00 PM</div></div></div>`).join("")}</div></div>
<div style="display:grid;gap:14px">
<div class="card" style="padding:16px 18px;display:grid;gap:11px"><div style="display:flex;justify-content:space-between;align-items:center"><span style="font-weight:600">Book your follow-up</span><span class="cl-mode v">${ic("clinic_cam", 12)}Video · 15 min</span></div>
<p class="muted" style="font-size:13px">Dr. Osei recommends a check-in in about 4 weeks to see how the cough has settled.</p>
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">${[["Tue", "1 Dec"], ["Wed", "2 Dec"], ["Thu", "3 Dec"]].map(([d, n], i) => `<div style="padding:8px;border-radius:var(--radius);text-align:center;border:1px solid ${i === 2 ? "var(--primary)" : "var(--border)"};${i === 2 ? "background:color-mix(in oklab,var(--primary) 8%,var(--surface));box-shadow:0 0 0 1px var(--primary)" : ""}"><div class="muted" style="font-size:11px">${d}</div><div style="font-weight:600;font-size:13px">${n}</div></div>`).join("")}</div>
<div style="display:flex;gap:6px;flex-wrap:wrap">${["9:10 AM", "10:30 AM", "11:50 AM", "4:20 PM"].map((s, i) => `<span class="cl-slot${i === 1 ? " on" : ""}">${s}</span>`).join("")}</div>
<span class="btn primary block">Book Thu 3 Dec, 10:30 AM</span></div>
<div class="card" style="padding:16px 18px;display:grid;gap:9px"><div style="display:flex;justify-content:space-between;align-items:center"><span style="font-weight:600">Invoice & insurance</span><span class="muted" style="font-size:12px">INV-30981</span></div>
${[["Video follow-up, 20 min", "$85.00"], ["Meridian Mutual covered", "−$68.00"]].map(([a, b]) => `<div style="display:flex;justify-content:space-between;font-size:13px"><span class="muted">${a}</span><span class="num" style="font-size:13px">${b}</span></div>`).join("")}
<div class="cl-hr"></div><div style="display:flex;justify-content:space-between;align-items:baseline"><span style="font-weight:600">You pay</span><span class="num" style="font-size:20px">$17.00</span></div>
<div style="display:grid;gap:8px;margin:2px 0">${step("done", "Claim submitted", "3 Nov, 10:58 AM")}${step("now", "Insurer reviewing", "Usually 3–5 working days")}${step("", "Settled")}</div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><span class="btn">View invoice</span><span class="btn primary">Pay $17.00</span></div></div></div></div></div></main></div>`;
  }
  // waiting-room
  return `${CSS}<div style="height:100%;display:flex;flex-direction:column">${tHdr(p, st, `<span class="cl-row" style="margin-left:auto;gap:10px"><span class="badge" style="gap:5px">${ic("lock", 11)}Private & encrypted</span><span class="btn">${ic("chat", 15)}Help</span><span class="btn">Leave waiting room</span></span>`)}
<div style="flex:1;min-height:0;display:grid;grid-template-columns:minmax(0,1fr) 400px;gap:24px;padding:24px 32px">
<div style="display:flex;flex-direction:column;gap:14px;min-height:0">
<div style="display:flex;justify-content:space-between;align-items:flex-end"><div><h1 style="font-size:${H(st, 24)}px">Check your camera and microphone</h1><p class="muted" style="margin-top:2px">Dr. Osei will see you exactly like this when the visit starts.</p></div><span class="badge" style="gap:5px;background:color-mix(in oklab,var(--success) 14%,var(--surface));color:var(--success);border-color:color-mix(in oklab,var(--success) 35%,var(--border))">${ic("check", 11)}Everything looks good</span></div>
<div class="cl-tile" style="flex:1;min-height:0">${feed("PN")}<span class="cl-tag">${ic("clinic_mic", 13)}Priya Nair (you)</span>
<span class="cl-tag" style="left:auto;right:12px;bottom:auto;top:12px">${ic("sun", 13)}Good lighting</span>
<div style="position:absolute;left:50%;bottom:14px;transform:translateX(-50%);display:flex;gap:10px">${["clinic_mic", "clinic_cam", "clinic_blur", "gear"].map((i) => `<span class="cl-ctl glass">${ic(i, 20)}</span>`).join("")}</div></div>
<div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;flex:none">
<div class="field"><label>Camera</label>${sel("FaceTime HD Camera", "clinic_cam")}<span class="muted cl-row" style="gap:6px;font-size:12px"><span class="cl-ok" style="width:16px;height:16px">${ic("check", 10)}</span>720p · 30 fps</span></div>
<div class="field"><label>Microphone</label>${sel("AirPods Pro", "clinic_mic")}<span class="muted cl-row" style="gap:8px;font-size:12px">${meter(16, 9)}Picking up your voice</span></div>
<div class="field"><label>Speaker</label>${sel("AirPods Pro", "clinic_speaker")}<span class="cl-row" style="gap:6px;font-size:12px;color:var(--primary);font-weight:500">${ic("play", 12)}Play test sound</span></div></div>
<div class="card" style="padding:12px 16px;display:flex;gap:22px;align-items:center;flex:none;font-size:13px">${[["Camera working"], ["Microphone working"], ["Speaker tested"], ["Connection 38 Mbps · stable"]].map(([t]) => `<span class="cl-row" style="gap:8px;white-space:nowrap"><span class="cl-ok">${ic("check", 12)}</span>${t}</span>`).join("")}<span class="muted" style="margin-left:auto;font-size:12px;white-space:nowrap">Checked 10:29 AM</span></div>
</div>
<div style="display:flex;flex-direction:column;gap:14px;min-height:0">
<div class="card" style="padding:18px;display:grid;gap:14px">
<div class="cl-row" style="gap:12px">${ph("AO", 52, 1)}<div style="flex:1;min-width:0"><div style="font-weight:600;font-size:15px">Dr. Amara Osei</div><div class="muted" style="font-size:13px">Family medicine · Quayside clinic</div></div></div>
<div style="padding:14px;border-radius:var(--radius);background:color-mix(in oklab,var(--primary) 8%,var(--surface));display:flex;gap:12px;align-items:center">${spin(30)}<div style="flex:1;min-width:0"><div class="muted" style="font-size:12px">Connecting…</div><div style="font-weight:600;font-size:14px;line-height:1.3">Your doctor will join shortly</div></div><div style="text-align:right;flex:none"><div class="muted" style="font-size:11px">Est. wait</div><div class="num" style="font-size:18px">3 min</div></div></div>
<div style="display:grid;gap:9px">${step("done", "Checked in", "10:24 AM · insurance verified")}${step("done", "Camera and microphone ready")}${step("now", "Dr. Osei is finishing with another patient", "You’re next · we’ll chime when she lets you in")}</div></div>
<div class="card" style="padding:16px 18px;display:grid;gap:12px"><div style="font-weight:600">Appointment details</div>
<div class="cl-kv"><span>When</span><span>Tue 3 Nov 2026, 10:30 AM</span><span>Visit</span><span>Video follow-up · 20 min</span><span>Reason</span><span>Cough for 3 weeks, worse at night</span><span>Insurance</span><span>Meridian Mutual · $17 copay</span><span>Pharmacy</span><span>Quayside Pharmacy, 52 Quayside Rd</span></div></div>
<div class="card" style="padding:14px 18px;display:grid;gap:8px"><div style="font-weight:600;font-size:13px">While you wait</div>${[["Medication list nearby", 1], ["Quiet, well-lit spot", 1], ["Photo of the inhaler label ready", 0]].map(([t, on]) => `<div class="cl-row" style="gap:9px;font-size:13px">${cb(on)}${t}</div>`).join("")}</div>
<div style="margin-top:auto;display:grid;gap:8px"><span class="btn primary block" style="height:48px;font-size:15px">${ic("clinic_cam", 18)}Join visit</span><div style="display:flex;justify-content:space-between;font-size:12px"><span class="muted">Visits aren’t recorded.</span><span style="color:var(--primary);font-weight:500">Cancel or reschedule</span></div></div>
</div></div></div>`;
};

TPL["telehealth-visit/mobile"] = (p, st) => {
  const v = p.variant || "waiting-room";
  if (v === "in-call") {
    return `${CSS}<div class="phone cl-stage" style="position:relative">${status()}
<div class="mtop" style="gap:12px;padding-bottom:10px">${ic("chevdown", 22)}<div style="flex:1;min-width:0;text-align:center"><div style="font-weight:700">Dr. Amara Osei</div><div style="font-size:12px;opacity:.75;display:inline-flex;gap:6px;align-items:center">${ic("lock", 11)}Encrypted · <span class="num" style="font-size:12px">08:42</span></div></div>${ic("clinic_wifi", 20)}</div>
<div style="flex:1;min-height:0;padding:0 12px;display:flex;position:relative">
<div class="cl-tile" style="flex:1">${feed("AO")}<span class="cl-tag">Dr. Osei · Family medicine</span><div class="cl-cap" style="bottom:56px;max-width:88%;font-size:13px">“That pattern usually points to post-nasal drip rather than your chest.”</div></div>
<div class="cl-tile" style="position:absolute;right:24px;top:12px;width:100px;height:140px;box-shadow:0 0 0 2px color-mix(in oklab,var(--on-ink) 35%,transparent),0 8px 24px rgba(0,0,0,.35)">${feed("PN")}<span class="cl-tag" style="left:6px;bottom:6px;height:22px;font-size:11px;padding:0 7px">You</span></div></div>
<div style="margin:12px 12px 0;padding:10px 14px;border-radius:var(--radius-lg);background:color-mix(in oklab,var(--on-ink) 10%,var(--ink));display:flex;align-items:center;gap:12px;flex:none">${ic("clinic_note", 18)}<div style="flex:1;min-width:0"><div style="font-weight:600;font-size:13px">Follow-up: cough for 3 weeks</div><div style="font-size:12px;opacity:.7" class="cl-ell">Started 10:33 AM · 20 min · 1 new message</div></div>${ic("chevron", 16)}</div>
<div style="flex:none;padding:16px 20px 32px;display:flex;justify-content:space-between;align-items:center">${["clinic_mic", "clinic_cam", "clinic_speaker", "chat"].map((i) => `<span class="cl-ctl">${ic(i, 21)}</span>`).join("")}<span class="cl-end sq">${ic("clinic_hangup", 22)}</span></div></div>`;
  }
  if (v === "visit-summary") {
    return `${CSS}<div class="phone">${status()}<div class="mtop">${ic("back", 22)}<div style="font-weight:600">Visit summary</div>${ic("download", 20)}</div>
<div class="mbody" style="gap:12px">
<div class="cl-row" style="gap:12px">${ph("AO", 44, 1)}<div style="flex:1;min-width:0"><div style="font-weight:600">Dr. Amara Osei</div><div class="muted" style="font-size:12px">Video visit · Tue 3 Nov · 19 min</div></div><span class="badge">Completed</span></div>
<div class="card" style="padding:14px;display:grid;gap:8px"><div class="cl-lbl">What we found</div><div style="font-weight:600">Allergic rhinitis with post-nasal drip</div><p style="font-size:13px;line-height:1.5" class="muted">Seasonal allergies are making mucus drain down your throat, which is why the cough is worse lying down. No sign of a chest infection.</p>
<div style="font-size:12px;padding:8px 10px;border-radius:var(--radius);background:color-mix(in oklab,var(--warning) 12%,var(--surface));border:1px solid color-mix(in oklab,var(--warning) 45%,var(--border))"><b style="font-weight:600;color:var(--warning)">Call us</b> if you get a fever over 38 °C or feel short of breath.</div></div>
<div class="card" style="overflow:hidden"><div style="padding:11px 14px;display:flex;justify-content:space-between;font-size:13px"><b style="font-weight:600">Prescriptions</b><span class="muted">Quayside Pharmacy</span></div>
${[["Cetirizine 10 mg", "Each evening · 30 tablets"], ["Fluticasone nasal spray", "2 sprays each nostril, mornings"]].map(([n, d]) => `<div style="display:flex;align-items:center;gap:10px;padding:10px 14px;border-top:1px solid var(--border)"><span class="cl-ico" style="width:32px;height:32px">${ic("clinic_pill", 16)}</span><div style="flex:1;min-width:0"><div style="font-weight:500;font-size:13px">${n}</div><div class="muted cl-ell" style="font-size:12px">${d}</div></div><span class="badge">Sent</span></div>`).join("")}</div>
<div class="card" style="padding:14px;display:grid;gap:10px"><div style="display:flex;justify-content:space-between;align-items:center"><b style="font-weight:600;font-size:13px">Follow-up in 4 weeks</b><span class="cl-mode v">${ic("clinic_cam", 12)}Video</span></div>
<div style="display:flex;gap:6px">${["Thu 3 Dec · 10:30", "9:10", "4:20 PM"].map((s, i) => `<span class="cl-slot${i === 0 ? " on" : ""}">${s}</span>`).join("")}</div><span class="btn primary block" style="height:40px">Book follow-up</span></div>
<div class="card" style="padding:12px 14px;display:flex;align-items:center;gap:12px"><span class="cl-ico" style="width:36px;height:36px">${ic("clinic_receipt", 18)}</span><div style="flex:1;min-width:0"><div style="font-weight:600;font-size:13px">You pay <span class="num" style="font-size:14px">$17.00</span></div><div class="muted cl-ell" style="font-size:12px">Meridian Mutual reviewing claim</div></div><span class="btn" style="height:34px">Pay</span></div>
</div>${tabBar("Visits", [["home", "Home"], ["clinic_steth", "Doctors"], ["calendar", "Visits"], ["clinic_user", "Profile"]])}</div>`;
  }
  return `${CSS}<div class="phone">${status()}<div class="mtop">${ic("x", 22)}<div style="text-align:center"><div style="font-weight:600">Waiting room</div><div class="muted" style="font-size:12px">Video visit · 10:30 AM</div></div>${ic("chat", 20)}</div>
<div class="mbody" style="gap:12px">
<div class="cl-tile" style="height:344px;flex:none">${feed("PN")}<span class="cl-tag" style="top:12px;bottom:auto">${ic("sun", 13)}Good lighting</span>
<div style="position:absolute;left:50%;bottom:14px;transform:translateX(-50%);display:flex;gap:10px">${["clinic_mic", "clinic_cam", "clinic_flip", "clinic_blur"].map((i) => `<span class="cl-ctl glass" style="width:44px;height:44px">${ic(i, 19)}</span>`).join("")}</div></div>
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">${[["clinic_cam", "Camera", "Front · 720p"], ["clinic_mic", "Mic", meter(9, 6, [5, 9, 7, 12, 8, 6, 10, 5, 7])], ["clinic_wifi", "Network", "Strong"]].map(([i, l, s]) => `<div class="card" style="padding:10px;display:grid;gap:4px"><div class="cl-row" style="gap:6px;font-size:12px;font-weight:600"><span class="cl-ok" style="width:16px;height:16px">${ic("check", 10)}</span>${l}</div><div class="muted" style="font-size:11px;min-height:14px;display:flex;align-items:center">${s}</div></div>`).join("")}</div>
<div class="card" style="padding:14px;display:grid;gap:10px"><div class="cl-row" style="gap:12px">${ph("AO", 44, 1)}<div style="flex:1;min-width:0"><div style="font-weight:600">Dr. Amara Osei</div><div class="cl-row muted" style="gap:7px;font-size:12px"><span class="cl-pulse" style="width:7px;height:7px"></span>Finishing with another patient</div></div></div>
<div style="display:flex;gap:10px;align-items:center;padding-top:10px;border-top:1px solid var(--border)">${spin(24)}<span style="flex:1;font-weight:600;font-size:13px">Connecting… she’ll join shortly</span><span class="muted" style="font-size:12px;white-space:nowrap">Est. <b class="num" style="font-size:13px;color:var(--text)">3 min</b></span></div></div>
<div class="cl-row muted" style="gap:8px;font-size:12px">${ic("calendar", 15)}<span class="cl-ell">Tue 3 Nov · Follow-up for cough · 20 min · $17 copay</span></div>
<div style="margin-top:auto;display:grid;gap:6px"><span class="btn primary block" style="height:48px;font-size:15px">${ic("clinic_cam", 18)}Join visit</span><span class="btn block" style="height:40px">Leave waiting room</span></div>
</div></div>`;
};

// =============================================================================================
// clinic-home
const SPEC_TILES = [["users", "Family medicine", "9 doctors"], ["clinic_baby", "Paediatrics", "5 doctors"], ["heart", "Cardiology", "4 doctors"], ["clinic_venus", "Women’s health", "6 doctors"], ["clinic_skin", "Dermatology", "3 doctors"], ["clinic_bone", "Orthopaedics", "4 doctors"], ["clinic_brain", "Mental health", "5 doctors"], ["eye", "Eye care", "3 doctors"]];
const INS = ["Meridian Mutual", "Northstar Health", "Bluefen Care", "Civica Plan", "Larkspur", "Harbour Union"];
TPL["clinic-home/web"] = (p, st) => `${CSS}<div style="height:100%;display:flex;flex-direction:column;overflow:hidden">
<div style="height:34px;flex:none;display:flex;align-items:center;gap:20px;padding:0 40px;font-size:12px;background:color-mix(in oklab,var(--primary) 9%,var(--bg));border-bottom:1px solid var(--border)"><span class="cl-row" style="gap:6px;font-weight:500">${ic("clinic_cam", 14)}Same-day video visits, 7 AM – 10 PM every day</span><span class="muted" style="margin-left:auto">Quayside & Northgate clinics</span><span class="muted">English · Español · 中文</span></div>
${hdr(p, "")}
<section style="flex:none;display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,1fr);gap:48px;padding:22px 56px 0;height:300px">
<div style="display:flex;flex-direction:column;justify-content:center;gap:12px;padding-bottom:34px"><span class="badge" style="align-self:flex-start">Now booking this week · 46 open appointments</span>
<h1 style="font-size:${Math.round((/text-transform:uppercase/.test(st.css || "") && /h1/.test(st.css || "") ? 34 : 40) * Math.min(st.hscale, 1.15))}px">Unhurried care from doctors who know your name</h1>
<p class="muted" style="font-size:16px;max-width:520px">Family and specialist doctors in Quayside and Northgate, plus video visits for the days you can’t come in.</p>
<div class="cl-row" style="gap:22px;font-size:13px;margin-top:2px">${[["star", "4.9 from 2,800+ patient reviews"], ["clock", "Most visits within 48 hours"]].map(([i, t]) => `<span class="cl-row" style="gap:7px;white-space:nowrap"><span style="color:var(--primary);display:inline-flex">${ic(i, 15)}</span>${t}</span>`).join("")}</div></div>
<div style="position:relative;border-radius:var(--radius-lg) var(--radius-lg) 0 0;overflow:hidden;background:linear-gradient(160deg,#e3d6c4,#c7b297)">
<svg viewBox="0 0 600 280" preserveAspectRatio="xMidYMid slice" style="position:absolute;inset:0;width:100%;height:100%" aria-hidden="true"><rect x="0" y="200" width="600" height="80" fill="#b49d80"/><rect x="40" y="40" width="150" height="120" rx="4" fill="#f4ecdf" opacity=".6"/><path d="M115 40v120M40 100h150" stroke="#c7b297" stroke-width="3"/><rect x="430" y="70" width="120" height="6" fill="#fff" opacity=".5"/><path d="M500 70c-14-14-10-34 0-44 10 10 14 30 0 44z" fill="#6f8a60" opacity=".8"/><rect x="450" y="52" width="10" height="18" fill="#7d93a3" opacity=".6"/></svg>
<div style="position:absolute;inset:auto 0 0 0;display:flex;justify-content:center;align-items:flex-end;gap:0">${["SM", "AO", "KW"].map((k, i) => `<span class="cl-ph" style="width:${i === 1 ? 230 : 190}px;height:${i === 1 ? 250 : 205}px;border-radius:0;background:transparent;margin:0 ${i === 1 ? -26 : 0}px;z-index:${i === 1 ? 2 : 1}"><svg viewBox="34 30 92 92" preserveAspectRatio="xMidYMax slice" aria-hidden="true">${figure(PPL[k])}</svg></span>`).join("")}</div>
<div class="card" style="position:absolute;z-index:4;left:18px;top:18px;padding:10px 12px;display:flex;gap:10px;align-items:center;box-shadow:var(--shadow-lg)">${ph("SM", 34, 1)}<div><div style="font-weight:600;font-size:13px">Dr. Sofía Márquez</div><div class="muted" style="font-size:12px">Paediatrics · next today 4:20 PM</div></div></div>
<div class="card" style="position:absolute;z-index:4;right:18px;top:18px;padding:10px 12px;display:flex;gap:10px;align-items:center;box-shadow:var(--shadow-lg)"><span class="cl-ico" style="width:32px;height:32px">${ic("clinic_cam", 16)}</span><div><div style="font-weight:600;font-size:13px">Video visit confirmed</div><div class="muted" style="font-size:12px">Tue 10:30 AM · Dr. Osei</div></div></div></div>
</section>
<div style="flex:none;padding:0 56px;position:relative;z-index:3;margin-top:-22px"><div class="card" style="padding:12px;display:grid;grid-template-columns:1.2fr 1.2fr auto 1fr auto;gap:12px;align-items:end;box-shadow:var(--shadow-lg)">
<div class="field"><label style="font-size:12px">Specialty or reason</label>${sel("Family medicine", "clinic_steth")}</div>
<div class="field"><label style="font-size:12px">Doctor</label>${sel("Any available doctor", "users")}</div>
<div class="field"><label style="font-size:12px">Visit type</label>${seg([`${ic("pin", 13)}In-person`, `${ic("clinic_cam", 13)}Video`], 1)}</div>
<div class="field"><label style="font-size:12px">When</label>${sel("This week", "calendar")}</div>
<span class="btn primary" style="height:40px;padding:0 20px">${ic("search", 16)}Find appointments</span></div></div>
<section style="flex:none;padding:16px 56px 0;display:grid;gap:10px">
<div style="display:flex;justify-content:space-between;align-items:baseline"><h2 style="font-size:${H(st, 20)}px">Specialties</h2><span style="color:var(--primary);font-weight:500;font-size:13px" class="cl-row">All 12 specialties ${ic("arrow", 14)}</span></div>
<div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px 12px">${SPEC_TILES.map(([i, n, c]) => `<div class="card" style="padding:6px 12px;display:flex;gap:10px;align-items:center;min-width:0"><span class="cl-ico" style="width:30px;height:30px">${ic(i, 18)}</span><div style="min-width:0"><div style="font-weight:600;font-size:13px" class="cl-ell">${n}</div><div class="muted" style="font-size:12px">${c} · in-person & video</div></div><span class="muted" style="margin-left:auto">${ic("chevron", 15)}</span></div>`).join("")}</div></section>
<section style="flex:1;min-height:0;padding:14px 56px 16px;display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1.25fr) minmax(0,1fr);gap:16px">
<div class="card" style="padding:14px 16px;display:grid;grid-template-rows:auto 1fr;gap:10px;min-height:0"><div style="display:flex;justify-content:space-between;align-items:baseline"><span style="font-weight:600">Meet some of our doctors</span><span style="color:var(--primary);font-size:13px;font-weight:500">All 42</span></div>
<div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;min-height:0">${[["AO", "Family medicine"], ["RM", "Dermatology"], ["LH", "Women’s health"]].map(([k, s]) => `<div style="display:grid;gap:6px;align-content:start;min-width:0"><span class="cl-ph" style="width:100%;height:80px">${portrait(k)}</span><div style="font-weight:600;font-size:12.5px;line-height:1.3" class="cl-ell">${PPL[k].name}</div><div class="muted cl-ell" style="font-size:11.5px;margin-top:-4px">${s}</div></div>`).join("")}</div></div>
<div class="card" style="padding:12px 16px 10px;display:grid;gap:4px;align-content:start;min-width:0"><div style="display:flex;gap:18px;font-size:13px;font-weight:500;border-bottom:1px solid var(--border);margin-bottom:2px">${["About", "Services", "Team", "Reviews"].map((t) => `<span style="padding:2px 0 8px;margin-bottom:-1px;border-bottom:2px solid ${t === "Services" ? "var(--primary)" : "transparent"};${t === "Services" ? "" : "color:var(--muted)"}">${t}</span>`).join("")}<span class="muted" style="margin-left:auto;font-weight:400;font-size:12px;padding-top:2px">Self-pay prices</span></div>
${[["New patient visit", "40 min · in-person", "$140"], ["Video consultation", "20 min · same day", "$65"], ["Annual health check", "60 min · bloods included", "$210"]].map(([n, d, pr], i) => `<div style="display:flex;align-items:center;gap:12px;padding:4px 0;${i ? "border-top:1px solid var(--border)" : ""}"><div style="flex:1;min-width:0"><div style="font-weight:600;font-size:13px" class="cl-ell">${n}</div><div class="muted cl-row" style="gap:5px;font-size:12px">${ic("clock", 12)}${d}</div></div><span class="num" style="font-size:14px">${pr}</span><span class="cl-chip soft" style="height:28px;color:color-mix(in oklab,var(--primary) 80%,var(--text));font-weight:600">Book</span></div>`).join("")}</div>
<div class="card" style="padding:14px 16px;display:grid;gap:6px;align-content:start;font-size:13px"><div style="display:flex;justify-content:space-between;align-items:baseline"><span style="font-weight:600">Quayside clinic</span><span class="badge">Open now</span></div><div class="cl-row muted" style="gap:6px;font-size:12px">${ic("pin", 13)}48 Quayside Road, Level 2</div>
${[["Mon – Fri", "8 AM – 8 PM"], ["Sat", "9 AM – 2 PM"], ["Sun", "Video visits only"]].map(([d, h]) => `<div style="display:flex;justify-content:space-between;font-size:12.5px"><span class="muted">${d}</span><span style="font-weight:500">${h}</span></div>`).join("")}
<div class="cl-hr" style="margin:3px 0"></div><div style="display:flex;justify-content:space-between;align-items:baseline"><span style="font-weight:600">Insurance accepted</span><span class="cl-row" style="gap:4px;color:var(--primary);font-weight:500;font-size:12px">${ic("shield", 13)}Check yours</span></div>
<div class="muted" style="font-size:12px;line-height:1.45">${INS.join(" · ")}</div></div>
</section></div>`;

TPL["clinic-home/mobile"] = (p, st) => `${CSS}<div class="phone">${status()}<div class="mtop" style="border-bottom:1px solid var(--border);padding-bottom:10px">${logo(p)}<span class="cl-row" style="gap:16px">${ic("clinic_call", 20)}${ic("menu", 22)}</span></div>
<div class="mbody" style="gap:14px;padding-top:14px">
<div style="display:grid;gap:8px"><span class="badge" style="justify-self:start">Same-day video visits until 10 PM</span><h1 style="font-size:${H(st, 27)}px">Unhurried care, in person or by video</h1></div>
<div class="card" style="padding:14px;display:grid;gap:10px">${sel("Family medicine", "clinic_steth")}<div style="display:grid;grid-template-columns:1fr 1fr;gap:0">${seg([`${ic("pin", 13)}In-person`, `${ic("clinic_cam", 13)}Video`], 1).replace('class="cl-seg"', 'class="cl-seg" style="grid-column:1/3"')}</div><span class="btn primary block">${ic("search", 16)}Find appointments</span></div>
<div style="display:flex;justify-content:space-between;align-items:baseline"><span style="font-weight:600">Specialties</span><span style="color:var(--primary);font-size:13px;font-weight:500">See all 12</span></div>
<div style="display:flex;gap:8px;margin:-4px -20px 0 0;overflow:hidden">${SPEC_TILES.map(([i, n]) => `<span class="cl-chip" style="height:38px;padding:0 12px 0 6px;gap:8px"><span class="cl-ico" style="width:28px;height:28px;border-radius:999px">${ic(i, 15)}</span>${n}</span>`).join("")}</div>
<div style="display:flex;justify-content:space-between;align-items:baseline"><span style="font-weight:600">Our doctors</span><span style="color:var(--primary);font-size:13px;font-weight:500">All 42</span></div>
<div style="display:flex;gap:10px;margin-right:-20px;overflow:hidden;margin-top:-4px">${[["AO", "Family medicine", "Today 3:40 PM"], ["SM", "Paediatrics", "Today 4:20 PM"], ["RM", "Dermatology", "Tomorrow"]].map(([k, s, n]) => `<div class="card" style="flex:none;width:148px;padding:10px;display:grid;gap:6px"><span class="cl-ph" style="width:100%;height:64px">${portrait(k)}</span><div style="font-weight:600;font-size:12.5px" class="cl-ell">${PPL[k].name}</div><div class="muted cl-ell" style="font-size:11px;margin-top:-5px">${s}</div><span class="cl-slot" style="height:24px;font-size:11px">${n}</span></div>`).join("")}</div>
<div class="card" style="padding:12px 14px;display:grid;gap:4px;font-size:12.5px"><div class="cl-row" style="gap:8px;font-weight:600">${ic("pin", 15)}Quayside · Open today 8 AM – 8 PM</div><div class="muted cl-ell">Insurance: Meridian Mutual, Northstar, Bluefen, Civica +2</div></div>
</div><div style="flex:none;padding:10px 20px 28px;border-top:1px solid var(--border);background:var(--surface);display:flex;gap:10px"><span class="btn" style="height:44px">${ic("clinic_call", 16)}Call</span><span class="btn primary" style="height:44px;flex:1">${ic("calendar", 16)}Book an appointment</span></div></div>`;

// =============================================================================================
const def = (name, shows, elements, key, extra) => ({ family: "clinic", name, shows, elements, web: TPL[key + "/web"], mobile: TPL[key + "/mobile"], ...(extra || {}) });
module.exports = {
  "doctor-directory": def("Doctor directory (find a doctor)", "a browsable medical team directory with specialty, visit-type, availability and language filters, search, doctor cards with portrait, specialty, languages, rating, in-person and video badges, next available time slots and book buttons",
    ["navigation-header", "search-bar", "filters", "checkbox", "chips", "doctor-cards", "avatar", "badge", "time-slots", "button", "healthcare"], "doctor-directory"),
  "telehealth-visit": def("Telehealth video visit", "a patient's video appointment with a doctor: device check waiting room, the in-call view with controls, and the after-visit summary",
    ["video-call", "call-controls", "self-view", "device-check", "appointment-details", "chat-panel", "status-steps", "prescriptions", "invoice", "healthcare"], "telehealth-visit", {
      variants: {
        "waiting-room": { name: "Telehealth waiting room (device check)", shows: "a camera self-preview with mic, camera and background controls, camera/microphone/speaker selectors with a live mic meter, a connection check, the doctor's joining status with steps, appointment details and a join-visit button" },
        "in-call": { name: "Telehealth video call in progress", shows: "a doctor video feed with live captions and a patient self-view on a dark stage, mute, camera, share, speaker and end-visit controls, a call timer, an appointment details panel, private notes and chat with the doctor" },
        "visit-summary": { name: "After-visit summary (telehealth)", shows: "a patient-portal visit summary with home vitals, a plain-language diagnosis and next steps, warning signs, prescriptions sent to the pharmacy, a follow-up booking slot picker and invoice and insurance claim status" },
      },
    }),
  "clinic-home": def("Clinic / hospital homepage", "a patient-facing clinic homepage with a hero and doctor photos, an appointment booking strip (specialty, doctor, in-person or video, date), a medical specialties grid, a doctor team preview, location and opening hours and accepted insurance",
    ["navigation-header", "hero", "booking-form", "segmented-control", "specialties-grid", "doctor-cards", "opening-hours", "insurance-logos", "landing-page", "healthcare"], "clinic-home"),
};
