// UI components (round 1, 7-Nov-2026): item-page parts for type "component" rows. The R2 index.html carries four marked parts
// (ui-screens/compkit.js): <style id="mgd-tokens">, <style id="mgd-component-css">, the markup between <!-- component --> and
// <!-- /component -->, and <script id="mgd-component-js">. The page shows a live demo (the raw file in a sandboxed iframe), those
// parts as copyable code, and the DESIGN.md component section. Nothing here is guessed: a part that is missing is left out.
import UI_COMPONENTS from "./ui_components.json";

export const UI_COMPONENT_PATTERNS = Object.keys(UI_COMPONENTS);
export const componentMeta = (p) => UI_COMPONENTS[p] || null;

const grab = (s, re) => { const m = s.match(re); return m ? m[1].trim() : ""; };
export function componentParts(html) {
  const s = String(html || "");
  const tokens = grab(s, /<style id="mgd-tokens">([\s\S]*?)<\/style>/), css = grab(s, /<style id="mgd-component-css">([\s\S]*?)<\/style>/);
  const markup = grab(s, /<!-- component -->([\s\S]*?)<!-- \/component -->/), js = grab(s, /<script id="mgd-component-js">([\s\S]*?)<\/script>/);
  if (!markup || !css) return null;
  return { html: markup, css: (tokens ? `/* Tokens (light + dark) */\n${tokens.replace(/\}\s*/g, "}\n").trim()}\n\n` : "") + `/* Component */\n${css.replace(/\}\s*(?=[.@:a-z])/g, "}\n")}`, js };
}

// The "## Component: …" section of the DESIGN.md, up to the end of the file.
export const componentMdSection = (md) => { const i = String(md || "").indexOf("\n## Component: "); return i < 0 ? "" : md.slice(i + 1).trim(); };

// Spec block lines for a component (after Colours / Fonts / Light and dark). esc = HTML escaper.
export function componentSpecLines(pattern, esc) {
  const m = UI_COMPONENTS[pattern]; if (!m) return [];
  const L = [];
  L.push(["ARIA pattern", m.apg ? `<a href="https://www.w3.org/WAI/ARIA/apg/patterns/${esc(m.apg)}/" rel="nofollow noopener" target="_blank">${esc(m.apgName)}</a> (WAI-ARIA Authoring Practices)` : "Semantic HTML, no widget role needed"]);
  L.push(["Keyboard", esc(m.keysShort)]);
  L.push(["States", esc(m.states.join(", "))]);
  return L;
}

export const COMPONENT_CSS = `.demo{width:100%;height:var(--h,720px);max-height:82vh;border:1px solid var(--border);border-radius:12px;background:var(--surface);display:block}
.detail.mobile .demo{max-width:390px}
.code{border:1px solid var(--border);border-radius:10px;margin:0 0 .9rem;overflow:hidden;background:var(--surface)}
.code__bar{display:flex;align-items:center;justify-content:space-between;gap:.5rem;padding:.4rem .5rem .4rem .8rem;border-bottom:1px solid var(--border);font-size:.85rem}
.code pre{margin:0;padding:.8rem;max-height:420px;overflow:auto;font:.78rem/1.5 ui-monospace,Menlo,monospace;white-space:pre;tab-size:2}
details.mdsec summary{cursor:pointer;font-weight:600;margin:0 0 .5rem}`;

export function componentDemoHtml(it, base, h, name, viewportH) {
  const hgt = Math.min(Math.max(+viewportH || 720, 420), 1400);
  return `<iframe class="demo" style="--h:${hgt}px" src="${h.escHtml(base + it.code)}" title="Live demo: ${h.escHtml(name)}" loading="lazy" sandbox="allow-scripts" referrerpolicy="no-referrer" data-theme-frame></iframe>
<p class="muted" style="font-size:.85rem;margin:.5rem 0 0">Live: try it with the mouse and the keyboard (Tab, arrows, Escape).</p>`;
}

export function componentCodeHtml(parts, md, h) {
  if (!parts) return "";
  const block = (id, lab, text) => text ? `<div class="code"><div class="code__bar"><b>${lab}</b><button class="btn" data-copy-el="${id}">Copy ${lab}</button></div><pre id="${id}"><code>${h.escHtml(text)}</code></pre></div>` : "";
  const sec = componentMdSection(md);
  return `<h2 id="code">Code</h2>
<p class="lede" style="margin:0 0 .8rem">Paste the HTML where the component goes, the CSS into your stylesheet and the script before <code>&lt;/body&gt;</code>. The tokens block holds the light and dark colours; swap in your own.</p>
${block("code-html", "HTML", parts.html)}${block("code-css", "CSS", parts.css)}${block("code-js", "JavaScript", parts.js)}${parts.js ? "" : `<p class="muted" style="font-size:.85rem">No JavaScript needed.</p>`}
${sec ? `<h2>DESIGN.md</h2><details class="mdsec"><summary>Component section (states, ARIA, keyboard)</summary><div class="code"><pre><code>${h.escHtml(sec)}</code></pre></div></details>` : ""}`;
}
