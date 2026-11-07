/* UI components (type "component", round 1, 7-Nov-2026). One responsive HTML document per component and style, shot at 1440 and 390.
   The copyable part is marked: <style id="mgd-tokens"> (colour + style tokens), <style id="mgd-component-css">, the markup between
   <!-- component --> and <!-- /component -->, and <script id="mgd-component-js">. Everything else (page chrome, the States strip) is
   presentation only. Component CSS uses ONLY tokens (--bg … --accent, --font-*, and the --c-* style knobs below), never lib.js classes,
   so the copied snippet works on its own. Template shape (tpl/components.js):
     { type: "component", family, name, shows, elements, size, css: (st) => string, js: string, demo: (p, st) => html, specimens: (p, st) => [[label, html]] }
   Specimens are static copies drawn in a forced state (.is-hover / .is-focus / data-state) and sit in an aria-hidden, inert strip. */
const META = require("../src/ui_components.json");
const { esc } = require("./lib");

// Style knobs: what makes the 8 styles look different beyond colour and font (border weight and colour, corners, shadows, case).
const KNOBS = {
  minimal:    { bw: "1px", line: "var(--border)", r: "8px",  pill: "8px",   sh: "0 1px 2px rgb(0 0 0 / .06)", pop: "0 12px 32px rgb(0 0 0 / .14)", tt: "none", ls: "0", fw: "500", fs: "14px", ring: "2px solid var(--primary)", ind: "2px" },
  editorial:  { bw: "1px", line: "var(--text)",   r: "2px",  pill: "2px",   sh: "none", pop: "0 10px 30px rgb(0 0 0 / .12)", tt: "none", ls: "0", fw: "500", fs: "14px", ring: "2px solid var(--text)", ind: "1px" },
  brutalist:  { bw: "2px", line: "var(--text)",   r: "0",    pill: "0",     sh: "3px 3px 0 var(--text)", pop: "6px 6px 0 var(--text)", tt: "uppercase", ls: ".02em", fw: "700", fs: "13px", ring: "3px solid var(--text)", ind: "4px" },
  luxury:     { bw: "1px", line: "var(--border)", r: "0",    pill: "0",     sh: "none", pop: "0 18px 40px rgb(0 0 0 / .10)", tt: "uppercase", ls: ".14em", fw: "500", fs: "11px", ring: "1px solid var(--text)", ind: "1px" },
  playful:    { bw: "2px", line: "transparent",   r: "14px", pill: "999px", sh: "0 4px 14px rgb(0 0 0 / .10)", pop: "0 16px 40px rgb(0 0 0 / .18)", tt: "none", ls: "0", fw: "700", fs: "14px", ring: "3px solid var(--accent)", ind: "4px" },
  corporate:  { bw: "1px", line: "var(--border)", r: "4px",  pill: "4px",   sh: "0 1px 2px rgb(0 0 0 / .08)", pop: "0 8px 24px rgb(0 0 0 / .16)", tt: "none", ls: "0", fw: "600", fs: "14px", ring: "2px solid var(--primary)", ind: "3px" },
  retro:      { bw: "2px", line: "var(--text)",   r: "10px", pill: "10px",  sh: "3px 3px 0 var(--primary)", pop: "5px 5px 0 var(--text)", tt: "none", ls: "0", fw: "700", fs: "14px", ring: "3px solid var(--accent)", ind: "3px" },
  monochrome: { bw: "1px", line: "var(--border)", r: "6px",  pill: "6px",   sh: "none", pop: "0 10px 28px rgb(0 0 0 / .16)", tt: "none", ls: "0", fw: "500", fs: "14px", ring: "2px solid var(--text)", ind: "2px" },
};
const ROLE_VARS = [["bg", "background"], ["surface", "surface"], ["border", "border"], ["text", "text"], ["muted", "muted"], ["primary", "primary"], ["on-primary", "on-primary"], ["accent", "accent"]];
const vars = (t) => ROLE_VARS.map(([v, k]) => `--${v}:${t[k]};`).join("");

function tokenCss(light, dark, st, styleName) {
  const k = KNOBS[styleName];
  return `:root{${vars(light)}--font-h:"${st.hf}",Georgia,serif;--font-b:"${st.bf}",system-ui,sans-serif;--hw:${st.hw};
--c-bw:${k.bw};--c-line:${k.line};--c-r:${k.r};--c-pill:${k.pill};--c-sh:${k.sh};--c-pop:${k.pop};--c-tt:${k.tt};--c-ls:${k.ls};--c-fw:${k.fw};--c-fs:${k.fs};--c-ring:${k.ring};--c-ind:${k.ind};color-scheme:light}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){${vars(dark)}color-scheme:dark}}
:root[data-theme="dark"]{${vars(dark)}color-scheme:dark}`;
}

// Presentation chrome (not part of the copyable snippet).
const CHROME = `*,*::before,*::after{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--text);font:15px/1.55 var(--font-b);-webkit-font-smoothing:antialiased}
.cx{max-width:1120px;margin:0 auto;padding:48px 48px 56px}
.cx-k{margin:0 0 6px;font:600 12px var(--font-b);letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
.cx h1{margin:0;font-family:var(--font-h);font-weight:var(--hw);font-size:40px;line-height:1.1;letter-spacing:-.01em}
.cx-d{margin:10px 0 0;max-width:62ch;color:var(--muted)}
.cx-h{margin:36px 0 12px;font:600 12px var(--font-b);letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
.cx-stage{background:color-mix(in oklab,var(--surface) 55%,var(--bg));border:1px solid var(--border);border-radius:16px;padding:36px}
.cx-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:14px}
.cx-tile{border:1px dashed var(--border);border-radius:12px;padding:14px 14px 18px;min-height:96px;background:var(--bg)}
.cx-tile>b{display:block;margin:0 0 12px;font:600 11px var(--font-b);letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
.cx-tile.wide{grid-column:span 2}
.cx-note{margin:28px 0 0;font-size:13px;color:var(--muted)}
@media (max-width:640px){.cx{padding:28px 16px 40px}.cx h1{font-size:30px}.cx-stage{padding:18px 14px;border-radius:12px}.cx-grid{grid-template-columns:1fr 1fr;gap:10px}.cx-tile{padding:12px}}`;

// Shared helper CSS every component snippet carries (visually hidden text, focus ring, reduced motion).
const BASE = `.mgd-sr{position:absolute!important;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}`;

function page(d, p, st, styleName, light, dark, pattern) {
  const m = META[pattern] || {};
  const css = BASE + "\n" + d.css(st, styleName);
  const specimens = d.specimens ? d.specimens(p, st, styleName) : [];
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(m.name || d.name)} component (${styleName}) · MGD UI components</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=${st.fonts}&display=swap" rel="stylesheet">
<!-- Made Good Designs UI screen — original reference design, free to copy. Tokens: see DESIGN.md -->
<style id="mgd-tokens">${tokenCss(light, dark, st, styleName)}</style>
<style>${CHROME}</style>
<style id="mgd-component-css">${css}</style></head>
<body><main class="cx">
<header><p class="cx-k">${esc(p.name)} · UI component</p><h1>${esc(m.name || d.name)}</h1><p class="cx-d">${esc(m.lede || d.shows)}</p></header>
<h2 class="cx-h" id="cx-demo">Live demo</h2>
<div class="cx-stage">
<!-- component -->
${d.demo(p, st, styleName).trim()}
<!-- /component -->
</div>
${specimens.length ? `<h2 class="cx-h">States</h2>
<div class="cx-grid" aria-hidden="true" inert>${specimens.map(([lab, html, wide]) => `<div class="cx-tile${wide ? " wide" : ""}"><b>${esc(lab)}</b>${html}</div>`).join("")}</div>` : ""}
<p class="cx-note">${esc(m.keysShort ? "Keyboard: " + m.keysShort + "." : "")}</p>
</main>
${d.js ? `<script id="mgd-component-js">${d.js.trim()}</script>` : ""}
<script>(function(){function t(){var h=location.hash.slice(1);if(h==="dark"||h==="light")document.documentElement.setAttribute("data-theme",h)}t();addEventListener("hashchange",t)})();</script>
</body></html>`;
}

// DESIGN.md section appended to the generic design-system DESIGN.md.
function designSection(pattern, d, styleName) {
  const m = META[pattern]; if (!m) return "";
  const k = KNOBS[styleName];
  return `

## Component: ${m.name}

${m.lede}

- **Pattern:** ${m.apg ? `WAI-ARIA Authoring Practices, ${m.apgName} (https://www.w3.org/WAI/ARIA/apg/patterns/${m.apg}/)` : "Semantic HTML (no ARIA widget role needed)"}
- **Roles and attributes:** ${m.aria}
- **States drawn:** ${m.states.join(", ")}
- **Focus:** a visible \`:focus-visible\` outline (${k.ring.replace("var(--", "").replace(")", "")}), never removed
- **Style knobs (${styleName}):** border ${k.bw}, corners ${k.r}, shadow ${k.sh === "none" ? "none" : "\`" + k.sh + "\`"}, labels ${k.tt === "uppercase" ? "uppercase, tracked " + k.ls : "sentence case"}
- **Motion:** transitions are short (≤160ms) and switched off under \`prefers-reduced-motion: reduce\`
- **Code:** HTML + CSS + ${d.js ? "a few lines of plain JavaScript (no libraries)" : "no JavaScript"}; colours come only from the tokens above, so light and dark both work

### Keyboard
${m.keys.map(([key, what]) => `- **${key}:** ${what}`).join("\n")}

### Licence
Original Made Good Designs code: free to use and adapt in any project, including commercial ones, with no credit needed. Fonts are Google Fonts under their own licences.
`;
}

module.exports = { page, designSection, KNOBS, META };
