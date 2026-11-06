// "Build this with your AI" panel for UI screen pages: server-rendered from the screen's DESIGN.md, so the colours and
// fonts are in the HTML. Same buttons and GA4 event as the WordPress kit panel (mgd-kit/mu-plugin/mgd-kit/kit-panel.js).
const ROLES = ["background", "surface", "border", "text", "muted", "primary", "on-primary", "accent"];
const MCP = "https://madegooddesigns.com/inspiration/mcp";
const AIS = [
  { id: "claude", name: "Claude", q: "https://claude.ai/new?q=" },
  { id: "chatgpt", name: "ChatGPT", q: "https://chatgpt.com/?q=" },
  { id: "gemini", name: "Gemini", open: "https://gemini.google.com/app" },
  { id: "perplexity", name: "Perplexity", q: "https://www.perplexity.ai/search?q=", more: 1 },
  { id: "copilot", name: "Copilot", q: "https://copilot.microsoft.com/?q=", more: 1 },
  { id: "grok", name: "Grok", q: "https://grok.com/?q=", more: 1 },
  { id: "lechat", name: "Le Chat (Mistral)", q: "https://chat.mistral.ai/chat?q=", more: 1 },
  { id: "deepseek", name: "DeepSeek", open: "https://chat.deepseek.com/", more: 1 },
];

// DESIGN.md front matter → { light: {role: hex}, dark: {role: hex}, heading, body }. Null if it has no colours.
export function parseDesignMd(md) {
  const fm = (String(md || "").match(/^---\n([\s\S]*?)\n---/) || [])[1];
  const colors = fm && (fm.match(/^colors:\n((?: {2}.+\n)+)/m) || [])[1];
  if (!colors) return null;
  const light = {}, dark = {};
  for (const [, k, v] of colors.matchAll(/^ {2}([a-z-]+): "(#[0-9a-fA-F]{3,8})"/gm)) (k.startsWith("dark-") ? dark : light)[k.replace(/^dark-/, "")] = v;
  const font = (k) => (fm.match(new RegExp(`^ {2}${k}:\\n(?: {4}.+\\n)*? {4}fontFamily: "([^"]+)"`, "m")) || [])[1] || null;
  return { light, dark, heading: font("h1"), body: font("body-md") };
}

const fontsLink = (fonts) => "https://fonts.googleapis.com/css2?" + fonts.map((n) => "family=" + encodeURIComponent(n).replace(/%20/g, "+") + ":wght@400;600;700").join("&") + "&display=swap";
const vars = (o) => ROLES.filter((r) => o[r]).map((r) => `  --${r}: ${o[r]};`).join("\n");

export function cssVariables(t) {
  const fonts = [...new Set([t.heading, t.body].filter(Boolean))], f = [];
  if (t.heading) f.push(`  --font-heading: "${t.heading}", sans-serif;`);
  if (t.body) f.push(`  --font-body: "${t.body}", sans-serif;`);
  const dark = vars(t.dark);
  return (fonts.length ? `<link href="${fontsLink(fonts)}" rel="stylesheet">\n` : "") + `:root {\n${[vars(t.light), ...f].join("\n")}\n}` + (dark ? `\n.dark {\n${dark}\n}` : "");
}

export function tailwindColours(t) {
  const lines = [...ROLES.filter((r) => t.light[r]).map((r) => `  "${r}": "${t.light[r]}",`), ...ROLES.filter((r) => t.dark[r]).map((r) => `  "dark-${r}": "${t.dark[r]}",`)];
  const fonts = [t.heading && `  heading: ['"${t.heading}"', "sans-serif"],`, t.body && `  body: ['"${t.body}"', "sans-serif"],`].filter(Boolean);
  return `theme: { extend: {\ncolors: {\n${lines.join("\n")}\n},${fonts.length ? `\nfontFamily: {\n${fonts.join("\n")}\n},` : ""}\n} }`;
}

export const buildPrompt = (what, mdUrl, codeUrl) => `Rebuild this ${what} for my project. Ask me which framework I'm using first. Follow the design tokens in the DESIGN.md: ${mdUrl}. Use the HTML as the reference: ${codeUrl}.`;

export const UI_KIT_CSS = `.kit{--acc:#4b3cf2;--ok:#12805c;margin:2rem 0 0;padding:18px 20px;border:1px solid var(--border);border-radius:14px;background:var(--surface);font-size:15px;line-height:1.5}
.kit .head{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:14px}.kit .head h2{font-size:17px;margin:0;flex:1;min-width:160px}
.kit .badge{font:700 11px/1 system-ui;letter-spacing:.06em;color:#fff;background:var(--acc);border-radius:6px;padding:4px 7px}
.kit .b{font:600 14px/1 system-ui,sans-serif;padding:10px 14px;border-radius:9px;border:1px solid var(--border);background:var(--surface);color:var(--text);cursor:pointer;text-decoration:none;display:inline-block;white-space:nowrap}
.kit .b:hover{border-color:var(--acc)}.kit .b.ai{background:var(--acc);border-color:var(--acc);color:#fff}.kit .b.ghost{background:transparent}.kit .b.sm{font-size:12.5px;padding:5px 10px}
.kit .b.cta{background:var(--text);border-color:var(--text);color:var(--bg)}.kit .b.ok{border-color:var(--ok);background:var(--ok);color:#fff}
.kit .row,.kit .ask{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0;align-items:center}.kit .lbl{font-weight:600;margin-right:4px}
.kit .note,.kit .hint,.kit .lead,.kit .cl p{color:var(--muted);margin:8px 0;font-size:14px}.kit .hint{color:var(--ok);font-weight:600}
.kit .sws{display:grid;grid-template-columns:repeat(auto-fill,minmax(92px,1fr));gap:10px;margin:0 0 12px}
.kit .sw{all:unset;cursor:pointer;display:block;min-width:0}.kit .sw:focus-visible{outline:2px solid var(--acc);outline-offset:2px}
.kit .sw i{display:block;height:52px;border-radius:10px;border:1px solid var(--border)}.kit .sw b,.kit .sw span{display:block;font-size:12px;line-height:1.3;margin-top:4px}.kit .sw b{font-weight:600}
.kit .sw span{font-family:ui-monospace,Menlo,monospace;color:var(--muted);margin-top:0}.kit .sws[hidden]{display:none}
.kit .more{position:relative}.kit .more summary{list-style:none}.kit .more summary::-webkit-details-marker{display:none}
.kit .menu{position:absolute;z-index:5;top:44px;left:0;background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:6px;min-width:190px;box-shadow:0 8px 24px rgba(20,20,40,.12)}
.kit .mi{display:block;padding:8px 10px;border-radius:7px;text-decoration:none;font-weight:600;font-size:14px}.kit .mi:hover{background:var(--bg)}
.kit .conn{margin:0 0 14px;border-bottom:1px solid var(--border);padding-bottom:12px}.kit .url{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:8px 0 12px}
.kit code{font:12.5px/1.45 ui-monospace,Menlo,monospace;background:rgba(127,127,140,.12);padding:3px 6px;border-radius:6px;word-break:break-all}
.kit .clients{display:grid;gap:8px}.kit .cl{display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap;border:1px solid var(--border);border-radius:10px;padding:10px 12px}
.kit .cl>div:first-child{flex:1;min-width:220px}.kit .cl p{margin:2px 0 0}.kit .acts{display:flex;gap:6px;flex-wrap:wrap;margin:0}
.kit .cite{margin:12px 0 0;display:flex;align-items:center;gap:8px;flex-wrap:wrap}
@media(max-width:520px){.kit{padding:14px}.kit .head h2{min-width:100%}.kit .b.cta{width:100%;text-align:center;white-space:normal;line-height:1.3}}`;

export function uiKitPanel({ tokens: t, what, kind, name, pageUrl, mdUrl, codeUrl, ref, esc }) {
  const mcpUrl = `${MCP}?ref=${encodeURIComponent(ref)}`, prompt = buildPrompt(what, mdUrl, codeUrl);
  const copy = (label, text, act, cls = "") => `<button type="button" class="b ${cls}" data-kit-copy="${esc(text)}" data-act="${act}">${esc(label)}</button>`;
  const swatches = (o, theme, hidden) => `<div class="sws" data-kit-theme="${theme}"${hidden ? " hidden" : ""}>${ROLES.filter((r) => o[r]).map((r) =>
    `<button type="button" class="sw" data-kit-copy="${esc(o[r])}" data-act="copy_hex" title="Copy ${esc(o[r])}"><i style="background:${esc(o[r])}"></i><b>${r}</b><span>${esc(o[r])}</span></button>`).join("")}</div>`;
  const aiLink = (a, cls) => `<a class="${cls}" target="_blank" rel="noopener nofollow" data-act="ask_${a.id}"${a.q ? "" : ` data-kit-copy="${esc(prompt)}" data-paste="1"`} href="${esc(a.q ? a.q + encodeURIComponent(prompt) : a.open)}">${esc(a.name)}</a>`;
  const cc = `claude mcp add --transport http made-good-designs ${mcpUrl}`, gem = `gemini mcp add --transport http made-good-designs ${mcpUrl}`;
  const vscode = "vscode:mcp/install?" + encodeURIComponent(JSON.stringify({ name: "made-good-designs", type: "http", url: mcpUrl }));
  const clients = [
    ["Claude", "Settings → Connectors → <b>Add custom connector</b> → paste the URL.", copy("Copy URL", mcpUrl, "copy_url_claude")],
    ["ChatGPT", "Settings → Apps &amp; Connectors → Advanced → <b>Developer mode</b> → Create → paste the URL.", copy("Copy URL", mcpUrl, "copy_url_chatgpt")],
    ["Cursor", "One click, then confirm in Cursor.", `<a class="b ai" data-act="install_cursor" href="cursor://anysphere.cursor-deeplink/mcp/install?name=made-good-designs&amp;config=${esc(btoa(JSON.stringify({ url: mcpUrl })))}">Add to Cursor</a>`],
    ["VS Code", "One click, then confirm in VS Code (Copilot agent mode).", `<a class="b ai" data-act="install_vscode" href="${esc(vscode)}">Add to VS Code</a>`],
    ["Claude Code", `<code>${esc(cc)}</code>`, copy("Copy command", cc, "copy_cc")],
    ["Gemini CLI", `<code>${esc(gem)}</code>`, copy("Copy command", gem, "copy_gemini")],
    ["Windsurf &amp; other MCP apps", "Add this to the app's MCP config (Windsurf: <code>mcp_config.json</code>).", copy("Copy config", JSON.stringify({ mcpServers: { "made-good-designs": { url: mcpUrl } } }, null, 2), "copy_json")],
  ];
  const fonts = [...new Set([t.heading, t.body].filter(Boolean))];
  return `<section class="kit" data-page="${esc(ref)}" data-nosnippet>
<div class="head"><span class="badge">AI</span><h2>Build this with your AI</h2><button type="button" class="b cta" aria-expanded="false" data-act="connect_toggle">⚡ Connect Made Good Designs to your AI</button></div>
<div class="conn" hidden><p class="lead">Add the Made Good Designs library to your assistant once. Then ask for UI references, brand palettes, font pairings and design tokens in any chat.</p>
<div class="url"><code>${esc(mcpUrl)}</code>${copy("Copy URL", mcpUrl, "copy_mcp_url", "ai")}</div>
<div class="clients">${clients.map(([n, d, a]) => `<div class="cl"><div><b>${n}</b><p>${d}</p></div><div class="acts">${a}</div></div>`).join("")}</div></div>
${swatches(t.light, "light", false)}${Object.keys(t.dark).length ? swatches(t.dark, "dark", true) : ""}
${fonts.length ? `<p class="note">Fonts: <b>${esc(fonts.join(" + "))}</b> (Google Fonts)</p>` : ""}
<div class="row">${copy("Copy CSS variables", cssVariables(t), "copy_css")}${copy("Copy Tailwind colours", tailwindColours(t), "copy_tailwind")}</div>
<div class="ask"><span class="lbl">Ask your AI</span>${AIS.filter((a) => !a.more).map((a) => aiLink(a, "b ai")).join("")}<details class="more"><summary class="b">More ▾</summary><div class="menu">${AIS.filter((a) => a.more).map((a) => aiLink(a, "mi")).join("")}</div></details>${copy("Copy prompt", prompt, "copy_prompt", "ghost")}</div>
<p class="hint" hidden>Prompt copied: paste it into the chat that just opened.</p>
<p class="note cite">Writing about this ${esc(kind)}? <button type="button" class="b sm" data-kit-copy="${esc(`${name}, Made Good Designs: ${pageUrl}`)}" data-html="${esc(`<a href="${pageUrl}">${esc(name)}</a> (Made Good Designs)`)}" data-act="copy_cite">Copy a link to this ${esc(kind)}</button></p>
</section>`;
}

export const UI_KIT_JS = `<script>(function(){var k=document.querySelector(".kit");if(!k)return;var q=function(s){return k.querySelector(s)};
var track=function(a){try{if(window.gtag)gtag("event","kit_panel",{action:a,page:k.dataset.page,kind:"ui-screen"})}catch(e){}};
var put=function(t,r){var c=navigator.clipboard;if(!c)return Promise.reject();return r&&window.ClipboardItem?c.write([new ClipboardItem({"text/html":new Blob([r],{type:"text/html"}),"text/plain":new Blob([t],{type:"text/plain"})})]).catch(function(){return c.writeText(t)}):c.writeText(t)};
k.addEventListener("click",function(e){var t=e.target.closest("[data-act]");if(!t)return;var a=t.dataset.act,x=t.getAttribute("data-kit-copy");
if(a==="connect_toggle"){var c=q(".conn"),o=c.hidden;c.hidden=!o;t.setAttribute("aria-expanded",o?"true":"false");t.textContent=o?"Hide connect options":"⚡ Connect Made Good Designs to your AI";if(o)track("connect_open");return}
if(x!=null){var p=t.hasAttribute("data-paste");if(!p)e.preventDefault();put(x,t.dataset.html).then(function(){if(p){var h=q(".hint");h.hidden=false;setTimeout(function(){h.hidden=true},6000);return}
var s=t.querySelector("span");if(s){var v=s.textContent;s.textContent="Copied";setTimeout(function(){s.textContent=v},1400);return}var l=t.textContent;t.classList.add("ok");t.textContent="Copied ✓";setTimeout(function(){t.textContent=l;t.classList.remove("ok")},1400)}).catch(function(){})}
var m=t.closest(".more");if(m)m.open=false;track(a)});
document.addEventListener("click",function(e){var b=e.target.closest("[data-ui-theme]");if(b)k.querySelectorAll(".sws").forEach(function(s){s.hidden=s.dataset.kitTheme!==b.dataset.uiTheme});
k.querySelectorAll(".more[open]").forEach(function(m){if(!m.contains(e.target))m.open=false})})})()</script>`;
