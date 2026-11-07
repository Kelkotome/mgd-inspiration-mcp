// UI components, round 1 (7-Nov-2026). See compkit.js for the document shape and the copyable markers.
// Every component: semantic HTML, WAI-ARIA Authoring Practices roles/keyboard where a widget role applies, :hover / :focus-visible /
// disabled / open-or-selected states, tokens only (light + dark), tiny inline JS (no libraries). Class prefix "mgd-<component>".
// Specimens (States strip) reuse the same classes with forced state classes (.is-hover, .is-focus, .is-on …) and carry no ids or roles.
const { ic, esc } = require("../lib");

const RM = (sel) => `@media (prefers-reduced-motion:reduce){${sel},${sel} *{transition:none!important;animation-duration:2.4s!important}}`;
const FOCUS = (sel) => `${sel}:focus-visible,${sel}.is-focus{outline:var(--c-ring);outline-offset:2px}`;
// Button shared by several components (copied into each snippet that uses it, so every snippet stands alone).
const BTN = `.mgd-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:40px;padding:0 16px;border:var(--c-bw) solid var(--c-line);border-radius:var(--c-pill);background:var(--surface);color:var(--text);font:var(--c-fw) var(--c-fs)/1 var(--font-b);text-transform:var(--c-tt);letter-spacing:var(--c-ls);box-shadow:var(--c-sh);cursor:pointer;white-space:nowrap;transition:background-color .12s,border-color .12s}
.mgd-btn:hover,.mgd-btn.is-hover{background:color-mix(in oklab,var(--primary) 9%,var(--surface))}
${FOCUS(".mgd-btn")}
.mgd-btn[aria-expanded="true"],.mgd-btn.is-open{background:color-mix(in oklab,var(--primary) 15%,var(--surface))}
.mgd-btn--primary{background:var(--primary);border-color:var(--primary);color:var(--on-primary)}
.mgd-btn--primary:hover,.mgd-btn--primary.is-hover{background:color-mix(in oklab,var(--primary) 84%,var(--text))}
.mgd-btn:disabled,.mgd-btn[aria-disabled="true"],.mgd-btn.is-disabled{opacity:.5;cursor:not-allowed;box-shadow:none}
.mgd-btn svg{flex:none}`;
const LABEL = `text-transform:var(--c-tt);letter-spacing:var(--c-ls)`;
const edge = (s) => (["brutalist", "retro", "editorial"].includes(s) ? "var(--text)" : "var(--muted)"); // control boundaries need 3:1 (WCAG 1.4.11)

// ---------------------------------------------------------------------------------------------------------------- tabs
const tabs = {
  type: "component", family: "workspace", name: "Tabs", size: { web: [1440, 1400], mobile: [390, 3000] },
  shows: "a tab list with a count badge and a disabled tab, the selected panel, and every tab state (default, hover, focus-visible, selected, disabled)",
  elements: ["tabs", "badge", "list"],
  css: (st, s) => `.mgd-tabs{max-width:760px}
.mgd-tabs__list{display:flex;gap:${s === "playful" ? "6px" : "4px"};overflow-x:auto;scrollbar-width:none;${s === "playful" ? "padding:5px;background:var(--surface);border-radius:999px;box-shadow:var(--c-sh);width:max-content;max-width:100%" : `border-bottom:var(--c-bw) solid ${s === "brutalist" || s === "retro" || s === "editorial" ? "var(--text)" : "var(--border)"}`}}
.mgd-tabs__tab{flex:none;display:inline-flex;align-items:center;gap:8px;min-height:44px;padding:0 16px;border:0;background:none;color:var(--muted);font:var(--c-fw) var(--c-fs)/1 var(--font-b);${LABEL};cursor:pointer;${s === "playful" ? "border-radius:999px;" : `border-radius:var(--c-r) var(--c-r) 0 0;margin-bottom:calc(-1 * var(--c-bw));`}transition:color .12s,background-color .12s,box-shadow .12s}
.mgd-tabs__tab:hover,.mgd-tabs__tab.is-hover{color:var(--text);background:color-mix(in oklab,var(--primary) 7%,transparent)}
.mgd-tabs__tab:focus-visible,.mgd-tabs__tab.is-focus{outline:var(--c-ring);outline-offset:-2px}
.mgd-tabs__tab[aria-selected="true"],.mgd-tabs__tab.is-on{color:var(--text);${s === "playful" ? "background:var(--primary);color:var(--on-primary)" : s === "brutalist" ? "background:var(--text);color:var(--bg)" : `box-shadow:inset 0 calc(-1 * var(--c-ind)) 0 ${s === "editorial" || s === "monochrome" || s === "luxury" ? "var(--text)" : "var(--primary)"}`}}
.mgd-tabs__tab[aria-disabled="true"],.mgd-tabs__tab.is-off{opacity:.45;cursor:not-allowed;background:none}
.mgd-tabs__count{min-width:22px;height:20px;padding:0 6px;border-radius:999px;display:inline-grid;place-items:center;font:600 11px/1 var(--font-b);letter-spacing:0;background:color-mix(in oklab,var(--accent) 18%,var(--surface));color:var(--text)}
.mgd-tabs__panel{padding:22px 2px 4px}
.mgd-tabs__panel:focus-visible{outline:var(--c-ring);outline-offset:4px;border-radius:4px}
.mgd-tabs__panel h3{margin:0 0 6px;font:var(--hw) 20px/1.2 var(--font-h)}
.mgd-tabs__panel p{margin:0 0 14px;color:var(--muted)}
.mgd-tabs__rows{list-style:none;margin:0;padding:0;display:grid;gap:8px}
.mgd-tabs__rows li{display:flex;justify-content:space-between;gap:12px;padding:12px 14px;border:var(--c-bw) solid var(--c-line);border-radius:var(--c-r);background:var(--surface);box-shadow:var(--c-sh)}
.mgd-tabs__rows span{color:var(--muted);font-size:13px;font-variant-numeric:tabular-nums}
${RM(".mgd-tabs")}`,
  demo: (p) => {
    const T = [["overview", "Overview"], ["tasks", "Tasks", 12], ["files", "Files"], ["activity", "Activity"], ["billing", "Billing", null, true]];
    const P = {
      overview: `<h3>Q4 launch</h3><p>Ship the new onboarding to every ${esc(p.name)} workspace by 12 December.</p><ul class="mgd-tabs__rows"><li>Owner<span>Mara Okafor</span></li><li>Due<span>12 Dec</span></li><li>Progress<span>7 of 12 tasks</span></li></ul>`,
      tasks: `<h3>12 open tasks</h3><p>Sorted by due date.</p><ul class="mgd-tabs__rows"><li>Write welcome email copy<span>Teodora · Fri</span></li><li>Record the 60-second tour<span>Sam · Mon</span></li><li>QA the invite flow on mobile<span>Lin · Tue</span></li></ul>`,
      files: `<h3>Files</h3><p>4 files, 18 MB.</p><ul class="mgd-tabs__rows"><li>onboarding-flow.fig<span>12 MB</span></li><li>launch-brief.pdf<span>2 MB</span></li></ul>`,
      activity: `<h3>Activity</h3><p>Latest first.</p><ul class="mgd-tabs__rows"><li>Jonah moved 3 tasks to Done<span>2h ago</span></li><li>Priya commented on the tour script<span>5h ago</span></li></ul>`,
      billing: `<h3>Billing</h3><p>Only workspace admins can see billing.</p>`,
    };
    return `<div class="mgd-tabs">
  <div class="mgd-tabs__list" role="tablist" aria-label="Q4 launch project">
${T.map(([id, l, n, off], i) => `    <button class="mgd-tabs__tab" type="button" role="tab" id="tab-${id}" aria-controls="panel-${id}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}"${off ? ' aria-disabled="true"' : ""}>${l}${n ? ` <span class="mgd-tabs__count">${n}</span>` : ""}</button>`).join("\n")}
  </div>
${T.map(([id], i) => `  <div class="mgd-tabs__panel" role="tabpanel" id="panel-${id}" aria-labelledby="tab-${id}" tabindex="0"${i ? " hidden" : ""}>${P[id]}</div>`).join("\n")}
</div>`;
  },
  js: `document.querySelectorAll(".mgd-tabs [role=tablist]").forEach(function (list) {
  var tabs = [].slice.call(list.querySelectorAll("[role=tab]"));
  var usable = function () { return tabs.filter(function (t) { return t.getAttribute("aria-disabled") !== "true"; }); };
  function select(tab) {
    if (tab.getAttribute("aria-disabled") === "true") return;
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute("aria-selected", on); t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
    });
    tab.focus();
  }
  list.addEventListener("click", function (e) { var t = e.target.closest("[role=tab]"); if (t) select(t); });
  list.addEventListener("keydown", function (e) {
    var u = usable(), i = u.indexOf(document.activeElement), next = null;
    if (e.key === "ArrowRight") next = u[(i + 1) % u.length];
    else if (e.key === "ArrowLeft") next = u[(i - 1 + u.length) % u.length];
    else if (e.key === "Home") next = u[0];
    else if (e.key === "End") next = u[u.length - 1];
    if (next) { e.preventDefault(); select(next); }
  });
});`,
  specimens: () => [["Default", `<span class="mgd-tabs__tab">Files</span>`], ["Hover", `<span class="mgd-tabs__tab is-hover">Files</span>`], ["Focus-visible", `<span class="mgd-tabs__tab is-focus">Files</span>`],
    ["Selected", `<span class="mgd-tabs__tab is-on">Overview</span>`], ["Disabled", `<span class="mgd-tabs__tab is-off">Billing</span>`]],
};

// ---------------------------------------------------------------------------------------------------------------- cards
const ART = (k) => {
  const shapes = {
    pour: `<rect x="70" y="30" width="60" height="58" rx="8" fill="color-mix(in oklab,var(--accent) 55%,var(--surface))"/><path d="M60 30h80l-12 22H72z" fill="color-mix(in oklab,var(--primary) 60%,var(--surface))"/><rect x="62" y="92" width="76" height="8" rx="4" fill="color-mix(in oklab,var(--text) 25%,var(--surface))"/>`,
    pan: `<circle cx="92" cy="62" r="34" fill="color-mix(in oklab,var(--text) 70%,var(--surface))"/><circle cx="92" cy="62" r="26" fill="color-mix(in oklab,var(--text) 55%,var(--surface))"/><rect x="124" y="57" width="52" height="10" rx="5" fill="color-mix(in oklab,var(--accent) 50%,var(--text))"/>`,
    linen: `<rect x="50" y="28" width="100" height="70" rx="6" fill="color-mix(in oklab,var(--primary) 35%,var(--surface))"/><path d="M50 50h100M50 72h100M80 28v70M115 28v70" stroke="color-mix(in oklab,var(--primary) 60%,var(--surface))" stroke-width="3"/>`,
    jar: `<rect x="72" y="36" width="56" height="64" rx="12" fill="color-mix(in oklab,var(--accent) 35%,var(--surface))"/><rect x="78" y="24" width="44" height="14" rx="4" fill="color-mix(in oklab,var(--text) 45%,var(--surface))"/>`,
  };
  return `<svg viewBox="0 0 200 120" aria-hidden="true" focusable="false">${shapes[k]}</svg>`;
};
const cards = {
  type: "component", family: "commerce", name: "Cards", size: { web: [1440, 1400], mobile: [390, 3000] },
  shows: "a responsive grid of product cards with one clickable link per card, a sale badge, a sold-out card, and every card state (default, hover, focus-visible, selected, disabled)",
  elements: ["card", "badge", "image"],
  css: (st, s) => `.mgd-cards{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:20px}
.mgd-card{position:relative;display:flex;flex-direction:column;height:100%;background:var(--surface);border:var(--c-bw) solid ${s === "playful" ? "transparent" : "var(--c-line)"};border-radius:var(--c-r);box-shadow:var(--c-sh);overflow:hidden;transition:transform .14s,box-shadow .14s,border-color .14s}
.mgd-card__media{aspect-ratio:5/3;display:grid;place-items:center;background:color-mix(in oklab,var(--primary) 8%,var(--bg));${s === "brutalist" || s === "retro" ? "border-bottom:var(--c-bw) solid var(--text);" : ""}}
.mgd-card__media svg{width:100%;height:100%}
.mgd-card__body{display:flex;flex-direction:column;gap:6px;padding:16px 16px 18px;flex:1}
.mgd-card__cat{margin:0;font:600 11px/1.2 var(--font-b);letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
.mgd-card__title{margin:0;font:var(--hw) ${s === "editorial" || s === "luxury" ? "21px" : "17px"}/1.25 var(--font-h)}
.mgd-card__link{color:inherit;text-decoration:none}
.mgd-card__link::after{content:"";position:absolute;inset:0;border-radius:inherit}
.mgd-card__text{margin:0;color:var(--muted);font-size:14px}
.mgd-card__foot{margin-top:auto;padding-top:8px;display:flex;align-items:center;justify-content:space-between;gap:8px}
.mgd-card__price{font:600 16px/1 var(--font-b);font-variant-numeric:tabular-nums}
.mgd-card__price s{color:var(--muted);font-weight:400;font-size:13px;margin-left:6px}
.mgd-card__badge{position:absolute;top:12px;left:12px;padding:4px 10px;border-radius:var(--c-pill);font:700 11px/1.2 var(--font-b);${LABEL};background:var(--text);color:var(--bg)}
.mgd-card:hover,.mgd-card.is-hover{transform:translateY(-2px);box-shadow:${s === "brutalist" ? "5px 5px 0 var(--text)" : s === "retro" ? "5px 5px 0 var(--primary)" : "var(--c-pop)"}}
.mgd-card:hover .mgd-card__link,.mgd-card.is-hover .mgd-card__link{text-decoration:underline;text-underline-offset:3px}
.mgd-card:has(.mgd-card__link:focus-visible),.mgd-card.is-focus{outline:var(--c-ring);outline-offset:3px}
.mgd-card__link:focus-visible{outline:none}
.mgd-card.is-on{border-color:var(--primary);box-shadow:0 0 0 2px var(--primary)}
.mgd-card.is-on .mgd-card__cat::after{content:" · in your basket";color:var(--text)}
.mgd-card--soldout{background:color-mix(in oklab,var(--surface) 60%,var(--bg))}
.mgd-card--soldout .mgd-card__media{filter:grayscale(1);opacity:.6}
.mgd-card--soldout .mgd-card__badge{background:var(--surface);color:var(--text);border:1px solid var(--muted)}
.mgd-card--soldout:hover{transform:none;box-shadow:var(--c-sh)}
${RM(".mgd-card")}`,
  demo: (p) => {
    const C = [["pour", "Coffee & tea", "Stoneware pour-over set", "Hand-glazed dripper, carafe and two cups.", "$48", null, "New"],
      ["pan", "Cookware", "Carbon steel skillet, 26 cm", "Pre-seasoned, oven-safe, lighter than cast iron.", "$54", "$68", "Sale"],
      ["linen", "Table", "Washed linen napkins (set of 4)", "Soft from the first use. Machine washable.", "$32"],
      ["jar", "Storage", "Glass pantry jar, 1.5 L", "Airtight bamboo lid. Back in January.", "$18", null, "Sold out", true]];
    return `<ul class="mgd-cards" aria-label="${esc(p.name)} new arrivals">
${C.map(([art, cat, t, txt, price, was, badge, sold], i) => `  <li><article class="mgd-card${sold ? " mgd-card--soldout" : ""}"${sold ? ' aria-labelledby="card-t' + i + '" aria-describedby="card-s' + i + '"' : ""}>
    <div class="mgd-card__media">${ART(art)}</div>${badge ? `<span class="mgd-card__badge"${sold ? ` id="card-s${i}"` : ""}>${badge}</span>` : ""}
    <div class="mgd-card__body"><p class="mgd-card__cat">${esc(cat)}</p>
      <h3 class="mgd-card__title"${sold ? ` id="card-t${i}"` : ""}>${sold ? esc(t) : `<a class="mgd-card__link" href="#product-${i + 1}">${esc(t)}</a>`}</h3>
      <p class="mgd-card__text">${esc(txt)}</p>
      <p class="mgd-card__foot"><span class="mgd-card__price">${price}${was ? ` <s><span class="mgd-sr">was </span>${was}</s>` : ""}</span></p></div>
  </article></li>`).join("\n")}
</ul>`;
  },
  js: "",
  specimens: () => {
    const c = (cls, t) => `<article class="mgd-card ${cls}" style="height:auto"><div class="mgd-card__body" style="padding:12px"><p class="mgd-card__cat">Cookware</p><p class="mgd-card__title"><span class="mgd-card__link">${t}</span></p><p class="mgd-card__price">$54</p></div></article>`;
    return [["Default", c("", "Skillet")], ["Hover", c("is-hover", "Skillet")], ["Focus-visible", c("is-focus", "Skillet")], ["Selected", c("is-on", "Skillet")], ["Disabled", c("mgd-card--soldout", "Pantry jar")]];
  },
};

// ---------------------------------------------------------------------------------------------------------------- pagination
const pagination = {
  type: "component", family: "media", name: "Pagination", size: { web: [1440, 1400], mobile: [390, 3000] },
  shows: "numbered pagination with previous and next links, the current page, collapsed gaps and a result range, plus every link state (default, hover, focus-visible, current, disabled)",
  elements: ["pagination"],
  css: (st, s) => `.mgd-pg{display:grid;gap:14px;justify-items:start}
.mgd-pg__range{margin:0;color:var(--muted);font-size:14px;font-variant-numeric:tabular-nums}
.mgd-pg__list{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;align-items:center;gap:${s === "brutalist" ? "0" : "6px"}}
.mgd-pg__link{min-width:42px;height:42px;padding:0 12px;display:inline-flex;align-items:center;justify-content:center;gap:6px;border:var(--c-bw) solid ${s === "playful" ? "transparent" : "var(--c-line)"};${s === "brutalist" ? "margin-left:calc(-1 * var(--c-bw));" : ""}border-radius:var(--c-pill);background:var(--surface);color:var(--text);font:var(--c-fw) var(--c-fs)/1 var(--font-b);${LABEL};font-variant-numeric:tabular-nums;text-decoration:none;box-shadow:${s === "brutalist" ? "none" : "var(--c-sh)"};transition:background-color .12s,border-color .12s}
a.mgd-pg__link:hover,.mgd-pg__link.is-hover{background:color-mix(in oklab,var(--primary) 10%,var(--surface));border-color:${s === "playful" ? "transparent" : "var(--primary)"}}
.mgd-pg__link:focus-visible,.mgd-pg__link.is-focus{outline:var(--c-ring);outline-offset:2px;position:relative;z-index:1}
.mgd-pg__link[aria-current="page"],.mgd-pg__link.is-on{background:var(--primary);border-color:var(--primary);color:var(--on-primary)}
.mgd-pg__link[aria-disabled="true"],.mgd-pg__link.is-off{opacity:.45;cursor:not-allowed;box-shadow:none}
.mgd-pg__gap{min-width:28px;text-align:center;color:var(--muted)}
@media (max-width:520px){.mgd-pg__far,.mgd-pg__gap{display:none}.mgd-pg__word{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}}
${RM(".mgd-pg")}`,
  demo: () => `<nav class="mgd-pg" aria-label="Pagination" data-total="1284" data-per="20" data-page="3">
  <p class="mgd-pg__range" aria-live="polite">Showing 41–60 of 1,284 photos</p>
  <ul class="mgd-pg__list">
    <li><a class="mgd-pg__link" href="?page=2" data-page="2">${ic("back", 16)}<span class="mgd-pg__word">Previous</span></a></li>
    <li class="mgd-pg__far"><a class="mgd-pg__link" href="?page=1" data-page="1" aria-label="Page 1">1</a></li>
    <li class="mgd-pg__far"><a class="mgd-pg__link" href="?page=2" data-page="2" aria-label="Page 2">2</a></li>
    <li><a class="mgd-pg__link" href="?page=3" data-page="3" aria-label="Page 3" aria-current="page">3</a></li>
    <li class="mgd-pg__far"><a class="mgd-pg__link" href="?page=4" data-page="4" aria-label="Page 4">4</a></li>
    <li class="mgd-pg__gap" aria-hidden="true">…</li>
    <li class="mgd-pg__far"><a class="mgd-pg__link" href="?page=65" data-page="65" aria-label="Page 65">65</a></li>
    <li><a class="mgd-pg__link" href="?page=4" data-page="4"><span class="mgd-pg__word">Next</span><svg class="i" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></a></li>
  </ul>
</nav>`,
  // Demo only: re-renders in place instead of loading ?page=N. On a real site keep the links and render the page server-side.
  js: `document.querySelectorAll(".mgd-pg").forEach(function (nav) {
  var total = +nav.dataset.total, per = +nav.dataset.per, last = Math.ceil(total / per), list = nav.querySelector(".mgd-pg__list"), range = nav.querySelector(".mgd-pg__range");
  var prevIcon = list.querySelector("li:first-child svg").outerHTML, nextIcon = list.querySelector("li:last-child svg").outerHTML;
  function link(n, label, html, cls) {
    var off = n < 1 || n > last;
    return "<li" + (cls ? ' class="' + cls + '"' : "") + "><a class=\\"mgd-pg__link\\"" + (off ? ' role="link" aria-disabled="true"' : ' href="?page=' + n + '" data-page="' + n + '"') + (label ? ' aria-label="' + label + '"' : "") + (n === +nav.dataset.page && label ? ' aria-current="page"' : "") + ">" + html + "</a></li>";
  }
  function render(p, focus) {
    nav.dataset.page = p;
    var pages = [1], h = "";
    for (var i = Math.max(2, p - 1); i <= Math.min(last - 1, p + 1); i++) pages.push(i);
    if (last > 1) pages.push(last);
    h += link(p - 1, "", prevIcon + '<span class="mgd-pg__word">Previous</span>');
    pages.forEach(function (n, k) {
      if (k && n - pages[k - 1] > 1) h += '<li class="mgd-pg__gap" aria-hidden="true">…</li>';
      h += link(n, "Page " + n, String(n), n === p ? "" : "mgd-pg__far");
    });
    h += link(p + 1, "", '<span class="mgd-pg__word">Next</span>' + nextIcon);
    list.innerHTML = h;
    range.textContent = "Showing " + ((p - 1) * per + 1) + "–" + Math.min(p * per, total) + " of " + total.toLocaleString("en") + " photos";
    if (focus) { var cur = list.querySelector("[aria-current]"); if (cur) cur.focus(); }
  }
  list.addEventListener("click", function (e) {
    var a = e.target.closest("a[data-page]"); if (!a) return;
    e.preventDefault(); render(+a.dataset.page, true);
  });
  render(+nav.dataset.page, false);
});`,
  specimens: () => [["Default", `<span class="mgd-pg__link">4</span>`], ["Hover", `<span class="mgd-pg__link is-hover">4</span>`], ["Focus-visible", `<span class="mgd-pg__link is-focus">4</span>`],
    ["Current page", `<span class="mgd-pg__link is-on">3</span>`], ["Disabled", `<span class="mgd-pg__link is-off">${ic("back", 16)} Previous</span>`]],
};

// ---------------------------------------------------------------------------------------------------------------- popover
const popPanel = (forSpec) => `<h3 class="mgd-pop__title"${forSpec ? "" : ' id="share-title"'}>Share “API latency”</h3>
    <p class="mgd-pop__hint">People you invite can view this dashboard.</p>
    <label class="mgd-pop__label"${forSpec ? "" : ' for="share-email"'}>Email</label>
    <${forSpec ? 'span class="mgd-pop__input"' : 'input class="mgd-pop__input" id="share-email" type="email" autocomplete="email" placeholder="name@company.com"'}>${forSpec ? "lin@patchbay.dev</span>" : ""}
    <div class="mgd-pop__actions"><${forSpec ? "span" : 'button type="button"'} class="mgd-btn" ${forSpec ? "" : "data-pop-close"}>Cancel</${forSpec ? "span" : "button"}><${forSpec ? "span" : 'button type="button"'} class="mgd-btn mgd-btn--primary">Send invite</${forSpec ? "span" : "button"}></div>`;
const popover = {
  type: "component", family: "marketing", name: "Popover", size: { web: [1440, 1400], mobile: [390, 3000] },
  shows: "a share button that opens a non-modal popover with a short form, a disabled trigger, and every state (default, hover, focus-visible, open, disabled)",
  elements: ["popover", "button", "form"],
  css: (st, s) => `${BTN}
.mgd-pop{position:relative;display:inline-block}
.mgd-pop__panel{position:absolute;z-index:10;top:calc(100% + 10px);left:0;width:min(340px,calc(100vw - 40px));padding:18px;background:var(--surface);color:var(--text);border:var(--c-bw) solid ${s === "playful" ? "transparent" : "var(--c-line)"};border-radius:var(--c-r);box-shadow:var(--c-pop)}
.mgd-pop__panel[hidden]{display:none}
.mgd-pop__panel:focus-visible{outline:var(--c-ring);outline-offset:2px}
.mgd-pop__title{margin:0 0 4px;font:var(--hw) 17px/1.25 var(--font-h)}
.mgd-pop__hint{margin:0 0 14px;color:var(--muted);font-size:13px}
.mgd-pop__label{display:block;margin:0 0 6px;font:600 13px var(--font-b)}
.mgd-pop__input{display:flex;align-items:center;width:100%;height:42px;padding:0 12px;border:1px solid ${edge(s)};border-radius:var(--c-r);background:var(--bg);color:var(--text);font:15px var(--font-b)}
.mgd-pop__input::placeholder{color:var(--muted)}
.mgd-pop__input:focus-visible{outline:var(--c-ring);outline-offset:1px}
.mgd-pop__actions{display:flex;justify-content:flex-end;gap:8px;margin-top:16px}
.mgd-pop-row{display:flex;flex-wrap:wrap;gap:12px;align-items:center}
${RM(".mgd-pop")}`,
  demo: () => `<div class="mgd-pop-row">
  <div class="mgd-pop">
    <button class="mgd-btn" type="button" aria-expanded="false" aria-controls="share-pop">${ic("share", 16)} Share</button>
    <div class="mgd-pop__panel" id="share-pop" role="dialog" aria-labelledby="share-title" tabindex="-1" hidden>
    ${popPanel(false)}
    </div>
  </div>
  <button class="mgd-btn" type="button" disabled>${ic("download", 16)} Export (Pro)</button>
</div>`,
  js: `document.querySelectorAll(".mgd-pop").forEach(function (wrap) {
  var btn = wrap.querySelector("[aria-controls]"), panel = document.getElementById(btn.getAttribute("aria-controls"));
  function open() { panel.hidden = false; btn.setAttribute("aria-expanded", "true"); (panel.querySelector("input,select,textarea,button") || panel).focus(); }
  function close(back) { if (panel.hidden) return; panel.hidden = true; btn.setAttribute("aria-expanded", "false"); if (back) btn.focus(); }
  btn.addEventListener("click", function () { panel.hidden ? open() : close(true); });
  panel.addEventListener("click", function (e) { if (e.target.closest("[data-pop-close]")) close(true); });
  wrap.addEventListener("keydown", function (e) { if (e.key === "Escape" && !panel.hidden) { e.stopPropagation(); close(true); } });
  document.addEventListener("click", function (e) { if (!wrap.contains(e.target)) close(false); });
  wrap.addEventListener("focusout", function (e) { if (e.relatedTarget && !wrap.contains(e.relatedTarget)) close(false); });
});`,
  specimens: () => [["Default", `<span class="mgd-btn">${ic("share", 16)} Share</span>`], ["Hover", `<span class="mgd-btn is-hover">${ic("share", 16)} Share</span>`], ["Focus-visible", `<span class="mgd-btn is-focus">${ic("share", 16)} Share</span>`],
    ["Disabled", `<span class="mgd-btn is-disabled">${ic("download", 16)} Export</span>`], ["Open", `<div class="mgd-pop__panel" style="position:static;width:100%">${popPanel(true)}</div>`, true]],
};

// ---------------------------------------------------------------------------------------------------------------- tooltip
const tooltip = {
  type: "component", family: "finance", name: "Tooltip", size: { web: [1440, 1400], mobile: [390, 3000] },
  shows: "icon buttons and a glossary term with tooltips on hover and keyboard focus, a disabled button that still explains itself, and every state (default, hover, focus-visible, open, disabled)",
  elements: ["tooltip", "toolbar", "button"],
  css: (st, s) => `.mgd-tipbar{display:flex;flex-wrap:wrap;align-items:center;gap:10px;padding-top:44px}
.mgd-tip{position:relative;display:inline-flex}
.mgd-tip__btn{width:42px;height:42px;display:inline-grid;place-items:center;border:var(--c-bw) solid ${s === "playful" ? "transparent" : "var(--c-line)"};border-radius:var(--c-pill);background:var(--surface);color:var(--text);box-shadow:var(--c-sh);cursor:pointer;transition:background-color .12s}
.mgd-tip__btn:hover,.mgd-tip__btn.is-hover{background:color-mix(in oklab,var(--primary) 10%,var(--surface))}
${FOCUS(".mgd-tip__btn")}
.mgd-tip__btn[aria-disabled="true"],.mgd-tip__btn.is-off{opacity:.45;cursor:not-allowed;box-shadow:none}
.mgd-tip__term{border:0;padding:0;background:none;color:inherit;font:inherit;cursor:help;text-decoration:underline dotted;text-underline-offset:4px}
.mgd-tip__term:focus-visible{outline:var(--c-ring);outline-offset:2px;border-radius:2px}
.mgd-tip__bubble{position:absolute;z-index:10;bottom:calc(100% + 8px);left:50%;transform:translateX(-50%);width:max-content;max-width:240px;padding:7px 10px;border-radius:${s === "playful" ? "10px" : "var(--c-r)"};background:var(--text);color:var(--bg);font:500 13px/1.35 var(--font-b);letter-spacing:0;text-transform:none;box-shadow:var(--c-pop);opacity:0;visibility:hidden;transition:opacity .12s .15s,visibility 0s .27s;pointer-events:none}
.mgd-tip__bubble::after{content:"";position:absolute;top:100%;left:50%;margin-left:-5px;border:5px solid transparent;border-top-color:var(--text)}
.mgd-tip--start .mgd-tip__bubble{left:0;transform:none}.mgd-tip--start .mgd-tip__bubble::after{left:21px}
.mgd-tip:hover .mgd-tip__bubble,.mgd-tip:focus-within .mgd-tip__bubble,.mgd-tip.is-open .mgd-tip__bubble{opacity:1;visibility:visible;transition-delay:.15s,0s;pointer-events:auto}
.mgd-tip.is-dismissed .mgd-tip__bubble{opacity:0;visibility:hidden}
.mgd-tip-copy{margin:22px 0 0;max-width:58ch;font-size:15px}
.mgd-tip-copy .mgd-tip__bubble{white-space:normal}
${RM(".mgd-tip")}`,
  demo: () => {
    const B = [["refresh", "Refresh data", "start"], ["filter", "Filter by plan"], ["calendar", "Change date range"], ["download", "Export CSV (needs the Growth plan)", "", true]];
    return `<div class="mgd-tipbar" role="group" aria-label="Revenue chart tools">
${B.map(([icn, t, pos, off], i) => `  <span class="mgd-tip${pos ? " mgd-tip--" + pos : ""}"><button class="mgd-tip__btn" type="button" aria-labelledby="tip-${i}"${off ? ' aria-disabled="true"' : ""}>${ic(icn, 18)}</button><span class="mgd-tip__bubble" role="tooltip" id="tip-${i}">${t}</span></span>`).join("\n")}
</div>
<p class="mgd-tip-copy">Your <span class="mgd-tip"><button class="mgd-tip__term" type="button" aria-describedby="tip-mrr">MRR</button><span class="mgd-tip__bubble" role="tooltip" id="tip-mrr">Monthly recurring revenue: active subscriptions, normalised to one month.</span></span> grew 4.2% in October.</p>`;
  },
  // A plain group of buttons (not role=toolbar, so no arrow-key promise); Tab moves between them. Escape hides the open tooltip without moving focus (WCAG 1.4.13).
  js: `document.querySelectorAll(".mgd-tip").forEach(function (tip) {
  tip.addEventListener("keydown", function (e) { if (e.key === "Escape") tip.classList.add("is-dismissed"); });
  tip.addEventListener("mouseleave", function () { tip.classList.remove("is-dismissed"); });
  tip.addEventListener("focusout", function () { tip.classList.remove("is-dismissed"); });
});
document.addEventListener("keydown", function (e) { if (e.key === "Escape") document.querySelectorAll(".mgd-tip:hover").forEach(function (t) { t.classList.add("is-dismissed"); }); });
document.querySelectorAll('.mgd-tip__btn[aria-disabled="true"]').forEach(function (b) { b.addEventListener("click", function (e) { e.preventDefault(); }); });`,
  specimens: () => {
    const b = (cls) => `<span class="mgd-tip__btn ${cls}">${ic("filter", 18)}</span>`;
    return [["Default", b("")], ["Hover", b("is-hover")], ["Focus-visible", b("is-focus")], ["Disabled", b("is-off")],
      ["Open", `<span class="mgd-tip mgd-tip--start is-open" style="margin-top:40px">${b("")}<span class="mgd-tip__bubble">Filter by plan</span></span>`]];
  },
};

// ---------------------------------------------------------------------------------------------------------------- dropdown menu
const MENU = [["edit", "Rename"], ["doc", "Duplicate"], ["folder", "Move to…"], ["link", "Copy link"], ["lock", "Change owner", true], null, ["trash", "Delete"]];
const dropdownMenu = {
  type: "component", family: "workspace", name: "Dropdown menu", size: { web: [1440, 1400], mobile: [390, 3000] },
  shows: "a menu button on a file row that opens an actions menu with icons, a disabled item and a separator, plus every state (default, hover, focus-visible, open, disabled)",
  elements: ["dropdown", "menu", "button"],
  css: (st, s) => `${BTN}
.mgd-menu{position:relative;display:inline-block}
.mgd-menu__list{position:absolute;z-index:10;top:calc(100% + 6px);right:0;min-width:220px;margin:0;padding:6px;list-style:none;background:var(--surface);border:var(--c-bw) solid ${s === "playful" ? "transparent" : "var(--c-line)"};border-radius:var(--c-r);box-shadow:var(--c-pop)}
.mgd-menu__list[hidden]{display:none}
.mgd-menu__item{display:flex;align-items:center;gap:10px;min-height:38px;padding:0 10px;border-radius:calc(var(--c-r) * .6);color:var(--text);font:500 14px var(--font-b);${LABEL};cursor:pointer;outline:none}
.mgd-menu__item svg{color:var(--muted)}
.mgd-menu__item:hover,.mgd-menu__item.is-hover{background:color-mix(in oklab,var(--primary) 9%,var(--surface))}
.mgd-menu__item:focus-visible,.mgd-menu__item:focus,.mgd-menu__item.is-focus{background:${s === "brutalist" ? "var(--text);color:var(--bg)" : "color-mix(in oklab,var(--primary) 16%,var(--surface))"};box-shadow:inset 0 0 0 2px ${s === "brutalist" ? "var(--text)" : "var(--primary)"}}
.mgd-menu__item[aria-disabled="true"],.mgd-menu__item.is-off{opacity:.45;cursor:not-allowed;background:none;box-shadow:none}
.mgd-menu__item kbd{margin-left:auto;font:12px var(--font-b);color:var(--muted)}
.mgd-menu__sep{height:1px;margin:6px 4px;background:var(--border)}
.mgd-file{display:flex;align-items:center;gap:14px;max-width:640px;padding:14px 16px;background:var(--surface);border:var(--c-bw) solid ${s === "playful" ? "transparent" : "var(--c-line)"};border-radius:var(--c-r);box-shadow:var(--c-sh)}
.mgd-file__name{flex:1;min-width:0}.mgd-file__name b{display:block;font-weight:600}.mgd-file__name span{color:var(--muted);font-size:13px}
.mgd-menu-out{margin:14px 0 0;color:var(--muted);font-size:14px;min-height:1.5em}
${RM(".mgd-menu")}`,
  demo: () => `<div class="mgd-file">
  ${ic("doc", 22)}<div class="mgd-file__name"><b>launch-brief.pdf</b><span>2 MB · edited by Priya Nair</span></div>
  <div class="mgd-menu">
    <button class="mgd-btn" type="button" id="file-menu-btn" aria-haspopup="menu" aria-expanded="false" aria-controls="file-menu">Actions ${ic("chevdown", 16)}</button>
    <ul class="mgd-menu__list" id="file-menu" role="menu" aria-labelledby="file-menu-btn" hidden>
${MENU.map((m) => (m ? `      <li class="mgd-menu__item" role="menuitem" tabindex="-1"${m[2] ? ' aria-disabled="true"' : ""}>${ic(m[0], 16)}${m[1]}</li>` : `      <li class="mgd-menu__sep" role="separator"></li>`)).join("\n")}
    </ul>
  </div>
</div>
<p class="mgd-menu-out" aria-live="polite"></p>`,
  js: `document.querySelectorAll(".mgd-menu").forEach(function (wrap) {
  var btn = wrap.querySelector("[aria-haspopup]"), menu = document.getElementById(btn.getAttribute("aria-controls")), out = document.querySelector(".mgd-menu-out");
  var items = [].slice.call(menu.querySelectorAll("[role=menuitem]")), usable = items.filter(function (i) { return i.getAttribute("aria-disabled") !== "true"; });
  function open(at) { menu.hidden = false; btn.setAttribute("aria-expanded", "true"); (at === "last" ? usable[usable.length - 1] : usable[0]).focus(); }
  function close(back) { if (menu.hidden) return; menu.hidden = true; btn.setAttribute("aria-expanded", "false"); if (back) btn.focus(); }
  function choose(item) { if (item.getAttribute("aria-disabled") === "true") return; close(true); if (out) out.textContent = item.textContent.trim() + " chosen."; }
  btn.addEventListener("click", function () { menu.hidden ? open() : close(true); });
  btn.addEventListener("keydown", function (e) {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); open("last"); }
  });
  menu.addEventListener("click", function (e) { var it = e.target.closest("[role=menuitem]"); if (it) choose(it); });
  menu.addEventListener("keydown", function (e) {
    var i = usable.indexOf(document.activeElement), k = e.key, next = null;
    if (k === "ArrowDown") next = usable[(i + 1) % usable.length];
    else if (k === "ArrowUp") next = usable[(i - 1 + usable.length) % usable.length];
    else if (k === "Home") next = usable[0];
    else if (k === "End") next = usable[usable.length - 1];
    else if (k === "Escape") { e.preventDefault(); close(true); return; }
    else if (k === "Tab") { close(false); return; }
    else if (k === "Enter" || k === " ") { e.preventDefault(); choose(document.activeElement); return; }
    else if (k.length === 1 && /\\S/.test(k)) {
      var from = usable.slice(i + 1).concat(usable.slice(0, i + 1));
      next = from.filter(function (it) { return it.textContent.trim().toLowerCase().indexOf(k.toLowerCase()) === 0; })[0] || null;
    }
    if (next) { e.preventDefault(); next.focus(); }
  });
  document.addEventListener("click", function (e) { if (!wrap.contains(e.target)) close(false); });
});`,
  specimens: () => [["Default", `<span class="mgd-btn">Actions ${ic("chevdown", 16)}</span>`], ["Hover", `<span class="mgd-btn is-hover">Actions ${ic("chevdown", 16)}</span>`], ["Focus-visible", `<span class="mgd-btn is-focus">Actions ${ic("chevdown", 16)}</span>`],
    ["Disabled", `<span class="mgd-btn is-disabled">Actions ${ic("chevdown", 16)}</span>`],
    ["Open (item focused, one disabled)", `<div class="mgd-menu__list" style="position:static;min-width:0"><div class="mgd-menu__item">${ic("edit", 16)}Rename</div><div class="mgd-menu__item is-focus">${ic("doc", 16)}Duplicate</div><div class="mgd-menu__item is-off">${ic("lock", 16)}Change owner</div></div>`, true]],
};

// ---------------------------------------------------------------------------------------------------------------- accordion
const ACC = [["included", "What's included in the plan?", "Unlimited workouts, habit tracking, weekly check-ins with your coach and offline access on two devices."],
  ["billing", "How does billing work?", "You pay monthly or yearly. Yearly plans are billed once and renew on the same date; we email you a week before."],
  ["pause", "Can I pause my plan?", "Yes, for up to 8 weeks a year. Your streaks and history stay as they are while you are paused."],
  ["family", "Family sharing (coming soon)", "", true]];
const accordion = {
  type: "component", family: "health", name: "Accordion", size: { web: [1440, 1400], mobile: [390, 3000] },
  shows: "an accordion with one section open, a disabled section, chevrons that rotate, and every header state (default, hover, focus-visible, open, disabled)",
  elements: ["accordion", "list"],
  css: (st, s) => `.mgd-acc{max-width:720px;${s === "playful" ? "display:grid;gap:10px" : `border-top:var(--c-bw) solid ${s === "brutalist" || s === "retro" || s === "editorial" ? "var(--text)" : "var(--border)"}`}}
.mgd-acc__item{${s === "playful" ? "background:var(--surface);border-radius:var(--c-r);box-shadow:var(--c-sh)" : `border-bottom:var(--c-bw) solid ${s === "brutalist" || s === "retro" || s === "editorial" ? "var(--text)" : "var(--border)"}`}}
.mgd-acc__h{margin:0;font:inherit}
.mgd-acc__btn{width:100%;display:flex;align-items:center;justify-content:space-between;gap:16px;min-height:56px;padding:14px ${s === "playful" ? "18px" : "4px"};border:0;background:none;color:var(--text);font:${s === "editorial" || s === "luxury" ? "var(--hw) 20px/1.3 var(--font-h)" : "600 16px/1.35 var(--font-b)"};${s === "luxury" ? "" : LABEL};text-align:left;cursor:pointer;border-radius:var(--c-r);transition:background-color .12s}
.mgd-acc__btn:hover,.mgd-acc__btn.is-hover{background:color-mix(in oklab,var(--primary) 7%,transparent)}
.mgd-acc__btn:focus-visible,.mgd-acc__btn.is-focus{outline:var(--c-ring);outline-offset:-2px}
.mgd-acc__btn[aria-disabled="true"],.mgd-acc__btn.is-off{opacity:.45;cursor:not-allowed;background:none}
.mgd-acc__icon{flex:none;width:28px;height:28px;display:grid;place-items:center;border-radius:${s === "playful" ? "999px" : "var(--c-r)"};background:${s === "brutalist" ? "var(--text)" : "color-mix(in oklab,var(--primary) 12%,transparent)"};color:${s === "brutalist" ? "var(--bg)" : "var(--text)"};transition:transform .16s}
.mgd-acc__btn[aria-expanded="true"] .mgd-acc__icon,.mgd-acc__btn.is-on .mgd-acc__icon{transform:rotate(180deg)}
.mgd-acc__panel{padding:0 ${s === "playful" ? "18px" : "4px"} 18px;color:var(--muted);max-width:62ch}
.mgd-acc__panel p{margin:0}
${RM(".mgd-acc")}`,
  demo: () => `<div class="mgd-acc">
${ACC.map(([id, q, a, off], i) => `  <div class="mgd-acc__item">
    <h3 class="mgd-acc__h"><button class="mgd-acc__btn" type="button" id="acc-${id}-btn" aria-expanded="${i === 0}" aria-controls="acc-${id}"${off ? ' aria-disabled="true"' : ""}>${esc(q)}<span class="mgd-acc__icon">${ic("chevdown", 16)}</span></button></h3>
    <div class="mgd-acc__panel" id="acc-${id}" role="region" aria-labelledby="acc-${id}-btn"${i === 0 ? "" : " hidden"}><p>${esc(a || "Family plans arrive in the spring.")}</p></div>
  </div>`).join("\n")}
</div>`,
  js: `document.querySelectorAll(".mgd-acc").forEach(function (acc) {
  var btns = [].slice.call(acc.querySelectorAll(".mgd-acc__btn"));
  acc.addEventListener("click", function (e) {
    var b = e.target.closest(".mgd-acc__btn"); if (!b || b.getAttribute("aria-disabled") === "true") return;
    var open = b.getAttribute("aria-expanded") !== "true";
    b.setAttribute("aria-expanded", open); document.getElementById(b.getAttribute("aria-controls")).hidden = !open;
  });
  acc.addEventListener("keydown", function (e) {
    var i = btns.indexOf(document.activeElement); if (i < 0) return;
    var n = e.key === "ArrowDown" ? btns[(i + 1) % btns.length] : e.key === "ArrowUp" ? btns[(i - 1 + btns.length) % btns.length] : e.key === "Home" ? btns[0] : e.key === "End" ? btns[btns.length - 1] : null;
    if (n) { e.preventDefault(); n.focus(); }
  });
});`,
  specimens: () => {
    const b = (cls, t) => `<span class="mgd-acc__btn ${cls}" style="font-size:14px;min-height:44px">${t}<span class="mgd-acc__icon">${ic("chevdown", 14)}</span></span>`;
    return [["Default", b("", "Billing")], ["Hover", b("is-hover", "Billing")], ["Focus-visible", b("is-focus", "Billing")], ["Open", b("is-on", "Billing")], ["Disabled", b("is-off", "Family")]];
  },
};

// ---------------------------------------------------------------------------------------------------------------- radio group
const RAD = [["daily", "Daily", "Every business day, for balances over $50."], ["weekly", "Weekly", "Every Monday. Most freelancers pick this.", true], ["monthly", "Monthly", "On the 1st of each month."], ["instant", "Instant", "Not available on the Starter account.", false, true]];
const radioGroup = {
  type: "component", family: "bank", name: "Radio buttons", size: { web: [1440, 1400], mobile: [390, 3000] },
  shows: "a radio group of option cards with descriptions, a checked option and a disabled option, plus every state (default, hover, focus-visible, selected, disabled)",
  elements: ["radio", "form"],
  css: (st, s) => `.mgd-radio{margin:0;padding:0;border:0;max-width:560px;display:grid;gap:10px}
.mgd-radio__legend{padding:0;margin:0 0 6px;font:var(--hw) 20px/1.25 var(--font-h)}
.mgd-radio__opt{position:relative;display:grid;grid-template-columns:auto 1fr;gap:4px 12px;align-items:start;padding:14px 16px;background:var(--surface);border:var(--c-bw) solid ${s === "playful" ? "transparent" : "var(--c-line)"};border-radius:var(--c-r);box-shadow:var(--c-sh);cursor:pointer;transition:border-color .12s,background-color .12s}
.mgd-radio__opt:hover,.mgd-radio__opt.is-hover{border-color:${s === "playful" ? "transparent" : "var(--primary)"};background:color-mix(in oklab,var(--primary) 6%,var(--surface))}
.mgd-radio__opt:has(:checked),.mgd-radio__opt.is-on{border-color:var(--primary);box-shadow:0 0 0 1px var(--primary)${s === "brutalist" || s === "retro" ? ",var(--c-sh)" : ""};background:color-mix(in oklab,var(--primary) 8%,var(--surface))}
.mgd-radio__opt:has(:disabled),.mgd-radio__opt.is-off{opacity:.5;cursor:not-allowed;background:var(--surface);border-color:var(--c-line);box-shadow:none}
.mgd-radio__input{appearance:none;-webkit-appearance:none;grid-row:span 2;width:20px;height:20px;margin:2px 0 0;border:2px solid ${edge(s)};border-radius:50%;background:var(--bg);display:grid;place-items:center;cursor:inherit}
.mgd-radio__input::before{content:"";width:10px;height:10px;border-radius:50%;transform:scale(0);background:var(--primary);transition:transform .12s}
.mgd-radio__input:checked,.mgd-radio__input.is-on{border-color:var(--primary)}
.mgd-radio__input:checked::before,.mgd-radio__input.is-on::before{transform:scale(1)}
.mgd-radio__input:focus-visible,.mgd-radio__input.is-focus{outline:var(--c-ring);outline-offset:3px}
.mgd-radio__label{font:600 15px/1.35 var(--font-b);${LABEL}}
.mgd-radio__hint{grid-column:2;color:var(--muted);font-size:13px}
@media (forced-colors:active){.mgd-radio__input:checked::before{background:CanvasText}}
${RM(".mgd-radio")}`,
  demo: () => `<fieldset class="mgd-radio">
  <legend class="mgd-radio__legend">Payout schedule</legend>
${RAD.map(([id, l, h, on, off]) => `  <label class="mgd-radio__opt"><input class="mgd-radio__input" type="radio" name="payout" value="${id}" aria-describedby="payout-${id}-hint"${on ? " checked" : ""}${off ? " disabled" : ""}><span class="mgd-radio__label">${l}</span><span class="mgd-radio__hint" id="payout-${id}-hint">${esc(h)}</span></label>`).join("\n")}
</fieldset>`,
  js: "",
  specimens: () => {
    const o = (cls, icls, t) => `<span class="mgd-radio__opt ${cls}" style="padding:10px 12px"><span class="mgd-radio__input ${icls}"></span><span class="mgd-radio__label">${t}</span></span>`;
    return [["Default", o("", "", "Daily")], ["Hover", o("is-hover", "", "Daily")], ["Focus-visible", o("", "is-focus", "Daily")], ["Selected", o("is-on", "is-on", "Weekly")], ["Disabled", o("is-off", "", "Instant")]];
  },
};

// ---------------------------------------------------------------------------------------------------------------- breadcrumbs
const CRUMBS = [["Home", "/"], ["Kitchen", "/kitchen"], ["Coffee & tea", "/kitchen/coffee"], ["Pour-over", "/kitchen/coffee/pour-over"], ["Stoneware pour-over set"]];
const breadcrumbs = {
  type: "component", family: "commerce", name: "Breadcrumbs", size: { web: [1440, 1400], mobile: [390, 3000] },
  shows: "a full breadcrumb trail with the current page, a long trail collapsed behind a show-more button, a mobile back-to-parent form, and every link state (default, hover, focus-visible, current, collapsed)",
  elements: ["breadcrumbs"],
  css: (st, s) => `.mgd-crumbs{font:${s === "luxury" ? "500 12px" : "500 14px"}/1.4 var(--font-b);${LABEL}}
.mgd-crumbs ol{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;align-items:center;gap:6px}
.mgd-crumbs li{display:inline-flex;align-items:center;gap:6px;min-width:0}
.mgd-crumbs li+li::before{content:"";flex:none;width:7px;height:7px;border:solid ${s === "brutalist" ? "var(--text)" : "var(--muted)"};border-width:${s === "brutalist" ? "2.5px 2.5px 0 0" : "1.5px 1.5px 0 0"};transform:rotate(45deg);margin:0 6px 0 2px}
.mgd-crumbs__link{color:var(--muted);text-decoration:none;padding:4px 2px;border-radius:4px;transition:color .12s}
.mgd-crumbs__link:hover,.mgd-crumbs__link.is-hover{color:var(--text);text-decoration:underline;text-underline-offset:3px}
${FOCUS(".mgd-crumbs__link")}
.mgd-crumbs [aria-current="page"],.mgd-crumbs__link.is-on{color:var(--text);font-weight:600;text-decoration:none;${s === "playful" ? "background:color-mix(in oklab,var(--primary) 14%,transparent);padding:4px 10px;border-radius:999px" : s === "brutalist" ? "background:var(--text);color:var(--bg);padding:2px 8px" : ""}}
.mgd-crumbs__more{min-width:32px;height:28px;padding:0 8px;border:1px solid ${edge(s)};border-radius:var(--c-pill);background:var(--surface);color:var(--text);font:600 14px/1 var(--font-b);cursor:pointer}
.mgd-crumbs__more:hover,.mgd-crumbs__more.is-hover{background:color-mix(in oklab,var(--primary) 10%,var(--surface))}
${FOCUS(".mgd-crumbs__more")}
.mgd-crumbs [data-crumb-hidden]{display:none}
.mgd-crumbs-demo{display:grid;gap:26px}
.mgd-crumbs-demo h3{margin:0 0 10px;font:600 12px var(--font-b);letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
@media (max-width:520px){.mgd-crumbs--fold li{display:none}.mgd-crumbs--fold li:nth-last-child(2){display:inline-flex}.mgd-crumbs--fold li:nth-last-child(2)::before{content:"";width:7px;height:7px;border:solid var(--muted);border-width:0 0 1.5px 1.5px;transform:rotate(45deg);margin:0 4px 0 2px}}
${RM(".mgd-crumbs")}`,
  demo: () => `<div class="mgd-crumbs-demo">
<div><h3>Full trail (folds to a back link on phones)</h3>
<nav class="mgd-crumbs mgd-crumbs--fold" aria-label="Breadcrumb">
  <ol>
${CRUMBS.map(([t, href]) => `    <li>${href ? `<a class="mgd-crumbs__link" href="${href}">${esc(t)}</a>` : `<a class="mgd-crumbs__link" href="#" aria-current="page">${esc(t)}</a>`}</li>`).join("\n")}
  </ol>
</nav></div>
<div><h3>Long trail, collapsed</h3>
<nav class="mgd-crumbs" aria-label="Breadcrumb, help centre">
  <ol>
    <li><a class="mgd-crumbs__link" href="/help">Help</a></li>
    <li><button class="mgd-crumbs__more" type="button" aria-expanded="false" aria-label="Show 3 more levels">…</button></li>
    <li data-crumb-hidden><a class="mgd-crumbs__link" href="/help/orders">Orders</a></li>
    <li data-crumb-hidden><a class="mgd-crumbs__link" href="/help/orders/delivery">Delivery</a></li>
    <li data-crumb-hidden><a class="mgd-crumbs__link" href="/help/orders/delivery/international">International</a></li>
    <li><a class="mgd-crumbs__link" href="/help/orders/delivery/international/customs">Customs</a></li>
    <li><a class="mgd-crumbs__link" href="#" aria-current="page">Duties on orders over $150</a></li>
  </ol>
</nav></div>
</div>`,
  js: `document.querySelectorAll(".mgd-crumbs__more").forEach(function (b) {
  b.addEventListener("click", function () {
    var hidden = [].slice.call(b.closest("ol").querySelectorAll("[data-crumb-hidden]"));
    hidden.forEach(function (li) { li.removeAttribute("data-crumb-hidden"); });
    var li = b.parentNode, first = hidden[0] && hidden[0].querySelector("a");
    li.parentNode.removeChild(li);
    if (first) first.focus();
  });
});`,
  specimens: () => [["Default", `<span class="mgd-crumbs"><span class="mgd-crumbs__link">Kitchen</span></span>`], ["Hover", `<span class="mgd-crumbs"><span class="mgd-crumbs__link is-hover">Kitchen</span></span>`],
    ["Focus-visible", `<span class="mgd-crumbs"><span class="mgd-crumbs__link is-focus">Kitchen</span></span>`], ["Current page", `<span class="mgd-crumbs"><span class="mgd-crumbs__link is-on">Pour-over set</span></span>`],
    ["Collapsed", `<span class="mgd-crumbs"><span class="mgd-crumbs__more">…</span></span>`]],
};

// ---------------------------------------------------------------------------------------------------------------- toggle switch
const SW = [["digest", "Weekly email digest", "A Monday summary of what changed in your projects.", true], ["desktop", "Desktop notifications", "Pop-ups while Fernway is open in a browser tab.", false],
  ["mentions", "Only when I'm mentioned", "Mute everything except @mentions and direct replies.", true], ["sms", "Text message alerts", "Add a phone number in your profile first.", false, true]];
const toggleSwitch = {
  type: "component", family: "workspace", name: "Toggle switch", size: { web: [1440, 1400], mobile: [390, 3000] },
  shows: "a list of on/off settings with labels and hints, switches on and off, a disabled switch, and every state (default, hover, focus-visible, on, disabled)",
  elements: ["toggle", "list"],
  css: (st, s) => `.mgd-switches{list-style:none;margin:0;padding:0;max-width:640px;${s === "playful" ? "display:grid;gap:10px" : `border-top:1px solid ${s === "brutalist" || s === "retro" || s === "editorial" ? "var(--text)" : "var(--border)"}`}}
.mgd-switches li{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:16px ${s === "playful" ? "18px" : "2px"};${s === "playful" ? "background:var(--surface);border-radius:var(--c-r);box-shadow:var(--c-sh)" : `border-bottom:1px solid ${s === "brutalist" || s === "retro" || s === "editorial" ? "var(--text)" : "var(--border)"}`}}
.mgd-switches__label{display:block;font:600 15px/1.35 var(--font-b);${LABEL}}
.mgd-switches__hint{display:block;margin-top:2px;color:var(--muted);font-size:13px}
.mgd-switch{flex:none;position:relative;width:48px;height:28px;padding:0;border:${s === "brutalist" || s === "retro" ? "2px solid var(--text)" : `1.5px solid ${edge(s)}`};border-radius:${s === "brutalist" ? "0" : s === "luxury" ? "2px" : "999px"};background:color-mix(in oklab,var(--muted) 22%,var(--bg));cursor:pointer;transition:background-color .14s,border-color .14s}
.mgd-switch__thumb{position:absolute;top:50%;left:3px;width:20px;height:20px;margin-top:-10px;border-radius:${s === "brutalist" ? "0" : s === "luxury" ? "1px" : "50%"};background:${s === "brutalist" || s === "retro" ? "var(--text)" : "var(--muted)"};box-shadow:${s === "playful" || s === "minimal" || s === "corporate" ? "0 1px 3px rgb(0 0 0 / .25)" : "none"};transition:transform .14s,background-color .14s}
.mgd-switch:hover,.mgd-switch.is-hover{background:color-mix(in oklab,var(--muted) 34%,var(--bg))}
.mgd-switch:focus-visible,.mgd-switch.is-focus{outline:var(--c-ring);outline-offset:3px}
.mgd-switch[aria-checked="true"],.mgd-switch.is-on{background:var(--primary);border-color:var(--primary)}
.mgd-switch[aria-checked="true"] .mgd-switch__thumb,.mgd-switch.is-on .mgd-switch__thumb{transform:translateX(20px);background:var(--on-primary)}
.mgd-switch:disabled,.mgd-switch.is-off{opacity:.45;cursor:not-allowed}
@media (forced-colors:active){.mgd-switch[aria-checked="true"] .mgd-switch__thumb{background:Highlight}}
${RM(".mgd-switch")}`,
  demo: () => `<ul class="mgd-switches" aria-label="Notification settings">
${SW.map(([id, l, h, on, off]) => `  <li><span><span class="mgd-switches__label" id="sw-${id}">${esc(l)}</span><span class="mgd-switches__hint" id="sw-${id}-hint">${esc(h)}</span></span>
    <button class="mgd-switch" type="button" role="switch" aria-checked="${on}" aria-labelledby="sw-${id}" aria-describedby="sw-${id}-hint"${off ? " disabled" : ""}><span class="mgd-switch__thumb"></span></button></li>`).join("\n")}
</ul>`,
  js: `document.querySelectorAll(".mgd-switch").forEach(function (sw) {
  sw.addEventListener("click", function () { sw.setAttribute("aria-checked", sw.getAttribute("aria-checked") !== "true"); });
});`,
  specimens: () => {
    const w = (cls) => `<span class="mgd-switch ${cls}" style="display:inline-block"><span class="mgd-switch__thumb"></span></span>`;
    return [["Off", w("")], ["Hover", w("is-hover")], ["Focus-visible", w("is-focus")], ["On", w("is-on")], ["Disabled", w("is-off")]];
  },
};

// ---------------------------------------------------------------------------------------------------------------- stepper
const STEPS = ["Business details", "Owners", "Verify identity", "Fund account", "Review"];
const STEP_TEXT = ["Legal name, address and what the business does.", "Everyone who owns 25% or more.", "A photo of a passport or driving licence and a quick selfie.", "Move at least $1 in from another bank.", "Check everything once, then open the account."];
const stepper = {
  type: "component", family: "bank", name: "Stepper", size: { web: [1440, 1400], mobile: [390, 3000] },
  shows: "a five-step progress stepper with completed, current and upcoming steps, Back and Next buttons, and every step state (default, hover, focus-visible, current, disabled)",
  elements: ["stepper", "button", "progress"],
  css: (st, s) => `${BTN}
.mgd-steps{list-style:none;margin:0 0 22px;padding:0;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px;counter-reset:step}
.mgd-steps__item{position:relative;display:grid;justify-items:center;gap:8px;text-align:center;font:500 13px/1.3 var(--font-b);color:var(--muted);${LABEL}}
.mgd-steps>.mgd-steps__item:not(:first-child)::before{content:"";position:absolute;top:17px;right:calc(50% + 24px);width:calc(100% - 40px);height:${s === "brutalist" || s === "retro" ? "3px" : "2px"};background:var(--border)}
.mgd-steps>.mgd-steps__item.is-done:not(:first-child)::before,.mgd-steps>.mgd-steps__item[aria-current="step"]:not(:first-child)::before{background:var(--primary)}
.mgd-steps__dot{width:36px;height:36px;display:grid;place-items:center;border-radius:${s === "brutalist" ? "0" : s === "luxury" ? "2px" : "50%"};border:2px solid ${edge(s)};background:var(--bg);color:var(--text);font:600 14px/1 var(--font-b);font-variant-numeric:tabular-nums;transition:background-color .14s,border-color .14s}
.mgd-steps__item.is-done .mgd-steps__dot{background:var(--primary);border-color:var(--primary);color:var(--on-primary)}
.mgd-steps__item[aria-current="step"],.mgd-steps__item.is-on{color:var(--text);font-weight:700}
.mgd-steps__item[aria-current="step"] .mgd-steps__dot,.mgd-steps__item.is-on .mgd-steps__dot{border-color:var(--primary);box-shadow:0 0 0 4px color-mix(in oklab,var(--primary) 22%,transparent)}
.mgd-steps__item.is-hover .mgd-steps__dot{background:color-mix(in oklab,var(--primary) 10%,var(--bg))}
.mgd-steps__item.is-focus .mgd-steps__dot{outline:var(--c-ring);outline-offset:2px}
.mgd-steps__item.is-off{opacity:.45}
.mgd-steps__panel{max-width:560px;padding:18px;background:var(--surface);border:var(--c-bw) solid ${s === "playful" ? "transparent" : "var(--c-line)"};border-radius:var(--c-r);box-shadow:var(--c-sh)}
.mgd-steps__panel h3{margin:0 0 4px;font:var(--hw) 19px/1.25 var(--font-h)}
.mgd-steps__panel p{margin:0;color:var(--muted)}
.mgd-steps__nav{display:flex;gap:10px;margin-top:16px}
@media (max-width:640px){.mgd-steps{grid-template-columns:1fr;gap:0}.mgd-steps__item{grid-template-columns:36px 1fr;justify-items:start;align-items:center;text-align:left;padding:0 0 18px}.mgd-steps>.mgd-steps__item:not(:first-child)::before{top:auto;bottom:calc(100% - 0px);right:auto;left:17px;width:2px;height:18px}}
${RM(".mgd-steps")}`,
  demo: () => `<div class="mgd-stepper" data-step="3">
  <ol class="mgd-steps" aria-label="Open a business account">
${STEPS.map((t, i) => `    <li class="mgd-steps__item${i < 2 ? " is-done" : ""}"${i === 2 ? ' aria-current="step"' : ""}><span class="mgd-steps__dot" aria-hidden="true">${i < 2 ? ic("check", 16) : i + 1}</span><span><span class="mgd-sr">${i < 2 ? "Completed: " : i === 2 ? "Current: " : "Not started: "}</span>${esc(t)}</span></li>`).join("\n")}
  </ol>
  <div class="mgd-steps__panel">
    <h3 class="mgd-steps__title">Step 3 of 5: Verify identity</h3>
    <p class="mgd-steps__text">${esc(STEP_TEXT[2])}</p>
    <div class="mgd-steps__nav"><button class="mgd-btn" type="button" data-step-go="-1">Back</button><button class="mgd-btn mgd-btn--primary" type="button" data-step-go="1">Next</button></div>
  </div>
  <p class="mgd-sr" aria-live="polite" data-step-live></p>
</div>`,
  js: `document.querySelectorAll(".mgd-stepper").forEach(function (box) {
  var items = [].slice.call(box.querySelectorAll(".mgd-steps__item")), n = items.length, live = box.querySelector("[data-step-live]");
  var texts = ${JSON.stringify(STEP_TEXT)};
  var check = items[0].querySelector(".mgd-steps__dot").innerHTML;
  function render(step, announce) {
    box.dataset.step = step;
    items.forEach(function (li, i) {
      var done = i < step - 1, cur = i === step - 1;
      li.classList.toggle("is-done", done);
      if (cur) li.setAttribute("aria-current", "step"); else li.removeAttribute("aria-current");
      li.querySelector(".mgd-steps__dot").innerHTML = done ? check : String(i + 1);
      li.querySelector(".mgd-sr").textContent = done ? "Completed: " : cur ? "Current: " : "Not started: ";
    });
    var title = "Step " + step + " of " + n + ": " + items[step - 1].lastElementChild.lastChild.textContent;
    box.querySelector(".mgd-steps__title").textContent = title;
    box.querySelector(".mgd-steps__text").textContent = texts[step - 1];
    var back = box.querySelector('[data-step-go="-1"]'), next = box.querySelector('[data-step-go="1"]');
    back.setAttribute("aria-disabled", step === 1); next.textContent = step === n ? "Open account" : "Next";
    if (announce) live.textContent = title;
  }
  box.addEventListener("click", function (e) {
    var b = e.target.closest("[data-step-go]"); if (!b || b.getAttribute("aria-disabled") === "true") return;
    var s = Math.min(n, Math.max(1, +box.dataset.step + +b.dataset.stepGo)); if (s !== +box.dataset.step) render(s, true);
  });
  render(+box.dataset.step, false);
});`,
  specimens: () => {
    const d = (cls, inner, t) => `<span class="mgd-steps__item ${cls}" style="justify-items:start;text-align:left"><span class="mgd-steps__dot">${inner}</span>${t}</span>`;
    return [["Upcoming", d("", "4", "Fund account")], ["Hover", d("is-hover", "4", "Fund account")], ["Focus-visible", d("is-focus", "4", "Fund account")], ["Current", d("is-on", "3", "Verify identity")], ["Done", d("is-done", ic("check", 16), "Owners")], ["Disabled", d("is-off", "5", "Review")]];
  },
};

// ---------------------------------------------------------------------------------------------------------------- sidebar nav
const sidebarNav = {
  type: "component", family: "security", name: "Sidebar navigation", size: { web: [1440, 1400], mobile: [390, 3000] },
  shows: "a vertical app sidebar with a current page, a count badge, a collapsible Reports group, a locked item and a collapse-to-icons button, plus every link state (default, hover, focus-visible, current, disabled)",
  elements: ["sidebar-nav", "badge", "navigation"],
  css: (st, s) => `.mgd-side-demo{display:grid;grid-template-columns:auto 1fr;min-height:540px;border:1px solid var(--border);border-radius:14px;overflow:hidden;background:var(--bg)}
.mgd-side{width:248px;display:flex;flex-direction:column;gap:2px;padding:16px 12px;background:${s === "corporate" ? "color-mix(in oklab,var(--primary) 10%,var(--surface))" : "var(--surface)"};border-right:var(--c-bw) solid ${s === "brutalist" || s === "retro" || s === "editorial" ? "var(--text)" : "var(--border)"};transition:width .16s}
.mgd-side__top{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:2px 4px 14px}
.mgd-side__brand{display:flex;align-items:center;gap:10px;font:700 16px var(--font-h);white-space:nowrap;overflow:hidden}
.mgd-side__mark{flex:none;width:26px;height:26px;border-radius:${s === "playful" ? "9px" : "var(--c-r)"};background:var(--primary)}
.mgd-side__collapse{flex:none;width:34px;height:34px;display:grid;place-items:center;border:1px solid ${edge(s)};border-radius:var(--c-pill);background:var(--bg);color:var(--text);cursor:pointer}
.mgd-side__collapse:hover{background:color-mix(in oklab,var(--primary) 10%,var(--bg))}
.mgd-side ul{list-style:none;margin:0;padding:0;display:grid;gap:2px}
.mgd-side__link{display:flex;align-items:center;gap:12px;width:100%;min-height:40px;padding:0 10px;border:0;border-radius:${s === "playful" ? "999px" : "var(--c-r)"};background:none;color:var(--muted);font:500 14px/1 var(--font-b);${LABEL};text-decoration:none;text-align:left;white-space:nowrap;cursor:pointer;transition:background-color .12s,color .12s}
.mgd-side__link:hover,.mgd-side__link.is-hover{background:color-mix(in oklab,var(--primary) 9%,transparent);color:var(--text)}
.mgd-side__link:focus-visible,.mgd-side__link.is-focus,.mgd-side__collapse:focus-visible{outline:var(--c-ring);outline-offset:-2px}
.mgd-side__link[aria-current="page"],.mgd-side__link.is-on{color:var(--text);font-weight:600;background:${s === "brutalist" ? "var(--text);color:var(--bg)" : s === "playful" ? "var(--primary);color:var(--on-primary)" : `color-mix(in oklab,var(--primary) 15%,transparent);box-shadow:inset ${s === "editorial" || s === "luxury" || s === "monochrome" ? "2px 0 0 var(--text)" : "3px 0 0 var(--primary)"}`}}
.mgd-side__link[aria-disabled="true"],.mgd-side__link.is-off{opacity:.45;cursor:not-allowed;background:none}
.mgd-side__count{margin-left:auto;min-width:22px;height:20px;padding:0 6px;display:inline-grid;place-items:center;border-radius:999px;background:var(--text);color:var(--bg);font:700 11px/1 var(--font-b);letter-spacing:0}
.mgd-side__chev{margin-left:auto;transition:transform .14s}
.mgd-side__link[aria-expanded="true"] .mgd-side__chev{transform:rotate(180deg)}
.mgd-side__sub{padding-left:28px!important}
.mgd-side__sub[hidden]{display:none!important}
.mgd-side__sub .mgd-side__link{min-height:34px;font-size:13px}
.mgd-side__label{overflow:hidden;text-overflow:ellipsis}
.mgd-side__foot{margin-top:auto;padding-top:12px;border-top:1px solid var(--border)}
.mgd-side.is-collapsed{width:68px}
.mgd-side.is-collapsed .mgd-side__top{flex-direction:column}
.mgd-side.is-collapsed .mgd-side__label,.mgd-side.is-collapsed .mgd-side__brand span,.mgd-side.is-collapsed .mgd-side__chev,.mgd-side.is-collapsed .mgd-side__sub{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
.mgd-side.is-collapsed .mgd-side__count{position:absolute;margin:-18px 0 0 14px;min-width:16px;height:16px;font-size:10px}
.mgd-side.is-collapsed .mgd-side__link{justify-content:center;padding:0}
.mgd-side-main{padding:28px}
.mgd-side-main h3{margin:0 0 6px;font:var(--hw) 22px/1.2 var(--font-h)}
.mgd-side-main p{margin:0;color:var(--muted)}
@media (max-width:640px){.mgd-side-demo{grid-template-columns:1fr}.mgd-side{width:auto;border-right:0;border-bottom:var(--c-bw) solid var(--border)}.mgd-side.is-collapsed{width:auto}.mgd-side-main{padding:18px}}
${RM(".mgd-side")}`,
  demo: (p) => {
    const L = (icn, t, extra = "", count) => `<li><a class="mgd-side__link" href="#${t.toLowerCase().replace(/\s+/g, "-")}"${extra}>${ic(icn, 18)}<span class="mgd-side__label">${t}</span>${count ? `<span class="mgd-side__count"><span class="mgd-sr">, </span>${count}<span class="mgd-sr"> new</span></span>` : ""}</a></li>`;
    return `<div class="mgd-side-demo">
<nav class="mgd-side" id="side" aria-label="Main">
  <div class="mgd-side__top"><span class="mgd-side__brand"><b class="mgd-side__mark" aria-hidden="true"></b><span>${esc(p.name)}</span></span>
    <button class="mgd-side__collapse" type="button" aria-expanded="true" aria-controls="side" aria-label="Collapse sidebar">${ic("back", 16)}</button></div>
  <ul>
    ${L("home", "Overview", ' aria-current="page"')}
    ${L("bell", "Alerts", "", 3)}
    ${L("shield", "Assets")}
    <li><button class="mgd-side__link" type="button" aria-expanded="true" aria-controls="side-reports">${ic("chart", 18)}<span class="mgd-side__label">Reports</span><span class="mgd-side__chev">${ic("chevdown", 16)}</span></button>
      <ul class="mgd-side__sub" id="side-reports">
        <li><a class="mgd-side__link" href="#weekly"><span class="mgd-side__label">Weekly summary</span></a></li>
        <li><a class="mgd-side__link" href="#compliance"><span class="mgd-side__label">Compliance</span></a></li>
        <li><a class="mgd-side__link" href="#exports"><span class="mgd-side__label">Exports</span></a></li>
      </ul></li>
    <li><a class="mgd-side__link" role="link" aria-disabled="true">${ic("lock", 18)}<span class="mgd-side__label">Audit log (Enterprise)</span></a></li>
  </ul>
  <ul class="mgd-side__foot">${L("gear", "Settings")}</ul>
</nav>
<div class="mgd-side-main"><h3>Overview</h3><p>4 open findings across 128 cloud assets. Last scan 6 minutes ago.</p></div>
</div>`;
  },
  js: `document.querySelectorAll(".mgd-side").forEach(function (nav) {
  nav.addEventListener("click", function (e) {
    var b = e.target.closest("button[aria-expanded]"); if (!b) return;
    var open = b.getAttribute("aria-expanded") !== "true";
    b.setAttribute("aria-expanded", open);
    if (b.classList.contains("mgd-side__collapse")) { nav.classList.toggle("is-collapsed", !open); b.setAttribute("aria-label", open ? "Collapse sidebar" : "Expand sidebar"); }
    else document.getElementById(b.getAttribute("aria-controls")).hidden = !open;
  });
});`,
  specimens: () => {
    const l = (cls, icn, t) => `<span class="mgd-side__link ${cls}">${ic(icn, 18)}<span class="mgd-side__label">${t}</span></span>`;
    return [["Default", l("", "shield", "Assets")], ["Hover", l("is-hover", "shield", "Assets")], ["Focus-visible", l("is-focus", "shield", "Assets")], ["Current", l("is-on", "home", "Overview")], ["Disabled", l("is-off", "lock", "Audit log")]];
  },
};

// ---------------------------------------------------------------------------------------------------------------- spinner
const SPIN = (s) => s === "brutalist" ? `.mgd-spin{border-radius:0;border-width:4px;border-color:var(--text);border-top-color:var(--primary);animation-timing-function:steps(4)}`
  : s === "playful" ? `.mgd-spin{border-style:dotted;border-width:4px;border-color:color-mix(in oklab,var(--accent) 45%,transparent);border-top-color:var(--primary);border-right-color:var(--primary)}`
  : s === "luxury" ? `.mgd-spin{border-width:1px;border-top-color:var(--text);animation-duration:1.4s}`
  : s === "editorial" ? `.mgd-spin{border-width:1.5px;border-top-color:var(--text)}`
  : s === "retro" ? `.mgd-spin{border-width:4px;border-color:var(--text);border-top-color:var(--accent);border-right-color:var(--primary)}`
  : s === "monochrome" ? `.mgd-spin{border-top-color:var(--text)}` : "";
const spinner = {
  type: "component", family: "ai", name: "Loading spinner", size: { web: [1440, 1400], mobile: [390, 3000] },
  shows: "loading spinners in three sizes, a button that shows a busy state, an inline loading status with screen-reader text, and every state (default, hover, focus-visible, busy, disabled)",
  elements: ["spinner", "button", "card"],
  css: (st, s) => `${BTN}
.mgd-spin{display:inline-block;flex:none;width:var(--size,24px);height:var(--size,24px);border:3px solid color-mix(in oklab,var(--muted) 30%,transparent);border-top-color:var(--primary);border-radius:50%;animation:mgd-spin .8s linear infinite;vertical-align:middle}
.mgd-spin--sm{--size:16px;border-width:2px}.mgd-spin--lg{--size:44px;border-width:4px}
${SPIN(s)}
@keyframes mgd-spin{to{transform:rotate(360deg)}}
@keyframes mgd-pulse{50%{opacity:.35}}
@media (prefers-reduced-motion:reduce){.mgd-spin{animation:mgd-spin 2.4s linear infinite,mgd-pulse 1.6s ease-in-out infinite}}
.mgd-btn[aria-busy="true"]{cursor:progress}
.mgd-load{display:grid;gap:22px;max-width:640px}
.mgd-load__sizes{display:flex;align-items:center;gap:26px}
.mgd-load__card{display:flex;align-items:center;gap:14px;padding:16px 18px;background:var(--surface);border:var(--c-bw) solid ${s === "playful" ? "transparent" : "var(--c-line)"};border-radius:var(--c-r);box-shadow:var(--c-sh)}
.mgd-load__card b{display:block;font-weight:600}.mgd-load__card span{color:var(--muted);font-size:13px}
.mgd-load__row{display:flex;flex-wrap:wrap;align-items:center;gap:12px}
.mgd-load__msg{color:var(--muted);font-size:14px}`,
  demo: () => `<div class="mgd-load">
  <div class="mgd-load__sizes" aria-hidden="true"><span class="mgd-spin mgd-spin--sm"></span><span class="mgd-spin"></span><span class="mgd-spin mgd-spin--lg"></span></div>
  <div class="mgd-load__card" role="status"><span class="mgd-spin"></span><span><b>Reading 24 sources…</b><span>Lumen Desk is pulling quotes and figures from your folder.</span></span></div>
  <div class="mgd-load__row">
    <button class="mgd-btn mgd-btn--primary" type="button" data-busy-label="Summarising…">${ic("spark", 16)}<span>Summarise sources</span></button>
    <button class="mgd-btn" type="button" disabled>Export brief</button>
    <span class="mgd-load__msg" role="status"></span>
  </div>
</div>`,
  // Busy button: aria-disabled (not disabled) keeps keyboard focus on it while it works.
  js: `document.querySelectorAll("[data-busy-label]").forEach(function (btn) {
  var label = btn.querySelector("span"), idle = label.textContent, icon = btn.querySelector("svg"), msg = btn.parentNode.querySelector("[role=status]");
  btn.addEventListener("click", function () {
    if (btn.getAttribute("aria-busy") === "true") return;
    btn.setAttribute("aria-busy", "true"); btn.setAttribute("aria-disabled", "true");
    var spin = document.createElement("span"); spin.className = "mgd-spin mgd-spin--sm"; spin.setAttribute("aria-hidden", "true");
    if (icon) icon.replaceWith(spin); else btn.prepend(spin);
    label.textContent = btn.dataset.busyLabel; if (msg) msg.textContent = "Summarising your sources…";
    setTimeout(function () {
      btn.removeAttribute("aria-busy"); btn.removeAttribute("aria-disabled");
      spin.replaceWith(icon || document.createTextNode("")); label.textContent = idle; if (msg) msg.textContent = "Summary ready.";
    }, 2500);
  });
});`,
  specimens: () => [["Default", `<span class="mgd-btn mgd-btn--primary">${ic("spark", 16)} Summarise</span>`], ["Hover", `<span class="mgd-btn mgd-btn--primary is-hover">${ic("spark", 16)} Summarise</span>`],
    ["Focus-visible", `<span class="mgd-btn mgd-btn--primary is-focus">${ic("spark", 16)} Summarise</span>`], ["Busy", `<span class="mgd-btn mgd-btn--primary" style="cursor:progress"><span class="mgd-spin mgd-spin--sm" style="animation:none"></span> Summarising…</span>`],
    ["Disabled", `<span class="mgd-btn is-disabled">Export brief</span>`]],
};

module.exports = { tabs, cards, pagination, popover, tooltip, "dropdown-menu": dropdownMenu, accordion, "radio-group": radioGroup, breadcrumbs, "toggle-switch": toggleSwitch, stepper, "sidebar-nav": sidebarNav, spinner };
