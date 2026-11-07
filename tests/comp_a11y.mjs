// UI components round 1: accessibility + keyboard checks on the rendered files (axe-core is not installed, so these are targeted checks).
//   PW_DIR=<dir with node_modules/playwright-core> node tests/comp_a11y.mjs [component ...]
// Per component and style (8 styles; the web file, since web and mobile share one document):
//   structure  unique ids; every aria-controls / -labelledby / -describedby target exists; every button, link, input and role widget has a name
//   contrast   text inside the live demo >= 4.5:1 against its real background, light and dark (disabled controls are exempt, as WCAG allows)
//   focus      every focusable control in the demo shows a visible focus indicator when reached with the keyboard
//   overflow   no sideways scroll at 390 px
// and once per component (minimal style), the keyboard / ARIA behaviour of its WAI-ARIA pattern (tabs, menu button, accordion …).
import { createRequire } from "node:module"; import { readdirSync, existsSync } from "node:fs"; import path from "node:path"; import os from "node:os"; import { fileURLToPath } from "node:url";
const require = createRequire((process.env.PW_DIR || process.cwd()) + "/");
const HERE = path.dirname(fileURLToPath(import.meta.url)), OUT = process.env.COMP_OUT || path.join(HERE, "../ui-screens/out-comp");
let pw; for (const c of ["playwright-core", "playwright"]) { try { pw = require(c); break; } catch {} }
if (!pw) { console.error("playwright-core not found (set PW_DIR)"); process.exit(2); }
const cache = path.join(os.homedir(), "Library/Caches/ms-playwright"), shell = readdirSync(cache).find((d) => d.startsWith("chromium_headless_shell"));
const exe = (() => { const r = path.join(cache, shell); const sub = readdirSync(r).find((d) => d.startsWith("chrome")); return path.join(r, sub, "chrome-headless-shell"); })();
const STYLES = ["minimal", "editorial", "brutalist", "luxury", "playful", "corporate", "retro", "monochrome"];
const ALL = ["tabs", "cards", "pagination", "popover", "tooltip", "dropdown-menu", "accordion", "radio-group", "breadcrumbs", "toggle-switch", "stepper", "sidebar-nav", "spinner"];
const want = process.argv.slice(2).length ? process.argv.slice(2) : ALL;
const b = await pw.chromium.launch({ executablePath: exe });
let fails = 0, checks = 0; const notes = [];
const ok = (cond, msg) => { checks++; if (!cond) { fails++; console.log("FAIL", msg); } };
const file = (p, s, pl = "web") => "file://" + path.join(OUT, `${p}-${pl}-${s}`, "index.html");

// ---- in-page helpers (run in the browser) -------------------------------------------------------------------------
const STRUCT = () => {
  const out = [], ids = {};
  document.querySelectorAll("[id]").forEach((e) => { ids[e.id] = (ids[e.id] || 0) + 1; });
  for (const [k, n] of Object.entries(ids)) if (n > 1) out.push("duplicate id " + k);
  document.querySelectorAll("[aria-controls],[aria-labelledby],[aria-describedby]").forEach((e) => {
    for (const a of ["aria-controls", "aria-labelledby", "aria-describedby"]) for (const id of (e.getAttribute(a) || "").split(/\s+/).filter(Boolean)) if (!document.getElementById(id)) out.push(`${a}=${id} missing`);
  });
  const stage = document.querySelector(".cx-stage");
  const name = (e) => {
    if (e.getAttribute("aria-label")) return e.getAttribute("aria-label");
    if (e.getAttribute("aria-labelledby")) return e.getAttribute("aria-labelledby").split(/\s+/).map((id) => (document.getElementById(id) || {}).textContent || "").join(" ");
    if (e.labels && e.labels.length) return [...e.labels].map((l) => l.textContent).join(" ");
    if (e.tagName === "INPUT" && e.placeholder) return e.placeholder;
    return e.textContent;
  };
  stage.querySelectorAll("button,a,input,select,textarea,[role=tab],[role=menuitem],[role=switch],[role=dialog],[role=tooltip],[role=tablist],[role=menu],[role=region],nav,fieldset").forEach((e) => {
    if (e.tagName === "FIELDSET") { if (!e.querySelector("legend")) out.push("fieldset without legend"); return; }
    if (e.tagName === "NAV" && !e.getAttribute("aria-label") && !e.getAttribute("aria-labelledby")) { out.push("nav without label"); return; }
    if (!String(name(e) || "").trim()) out.push(`no name: ${e.tagName.toLowerCase()}.${e.className}`);
  });
  if (!document.documentElement.lang) out.push("no lang");
  return out;
};
// WCAG contrast of visible text in the live demo. Colours come back from getComputedStyle; color-mix() resolves to color(srgb …) or rgb().
const CONTRAST = () => {
  const cv = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const rgba = (c) => { cv.clearRect(0, 0, 1, 1); cv.fillStyle = "#000"; cv.fillStyle = c; cv.fillRect(0, 0, 1, 1); const d = cv.getImageData(0, 0, 1, 1).data; return [d[0], d[1], d[2], d[3] / 255]; };
  const parse = (c) => { if (!c || c === "transparent") return [0, 0, 0, 0]; const m = c.match(/^color\(srgb ([\d.e-]+) ([\d.e-]+) ([\d.e-]+)(?: \/ ([\d.]+))?\)$/); if (m) return [+m[1] * 255, +m[2] * 255, +m[3] * 255, m[4] === undefined ? 1 : +m[4]]; const r = c.match(/^rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)$/); if (r) return [+r[1], +r[2], +r[3], r[4] === undefined ? 1 : +r[4]]; return rgba(c); };
  const over = (top, bot) => { const a = top[3]; return [top[0] * a + bot[0] * (1 - a), top[1] * a + bot[1] * (1 - a), top[2] * a + bot[2] * (1 - a), 1]; };
  const lum = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
  const bgOf = (el) => { const stack = []; for (let e = el; e; e = e.parentElement) { const c = parse(getComputedStyle(e).backgroundColor); if (c[3] > 0) { stack.push(c); if (c[3] >= 1) break; } } let bg = [255, 255, 255, 1]; for (let i = stack.length - 1; i >= 0; i--) bg = over(stack[i], bg); return bg; };
  const res = []; let n = 0;
  const stage = document.querySelector(".cx-stage");
  const walker = document.createTreeWalker(stage, NodeFilter.SHOW_TEXT);
  const seen = new Set();
  while (walker.nextNode()) {
    const t = walker.currentNode; if (!t.textContent.trim()) continue;
    const el = t.parentElement; if (seen.has(el)) continue; seen.add(el);
    const cs = getComputedStyle(el); const r = el.getBoundingClientRect();
    if (!r.width || cs.visibility === "hidden" || el.closest("[hidden],.mgd-sr,[aria-hidden=true]")) continue;
    let op = 1, disabled = false; for (let e = el; e; e = e.parentElement) { op *= +getComputedStyle(e).opacity; if (e.matches && e.matches(":disabled,[aria-disabled=true],.mgd-card--soldout")) disabled = true; }
    if (disabled || op < 0.99) continue; // disabled controls are exempt (WCAG 1.4.3)
    const fg = over(parse(cs.color), bgOf(el)), bg = bgOf(el), L1 = lum(fg), L2 = lum(bg), ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
    const size = parseFloat(cs.fontSize), bold = +cs.fontWeight >= 700, large = size >= 24 || (bold && size >= 18.66);
    n++; if (ratio < (large ? 3 : 4.5)) res.push(`${ratio.toFixed(2)} "${t.textContent.trim().slice(0, 24)}" (${el.tagName.toLowerCase()}.${String(el.className).slice(0, 24)})`);
  }
  return { n, bad: res };
};
const FOCUSABLES = () => [...document.querySelectorAll(".cx-stage a[href],.cx-stage button:not([disabled]),.cx-stage input:not([disabled]),.cx-stage [tabindex='0']")].filter((e) => e.getBoundingClientRect().width && !e.closest("[hidden]")).length;
const RING = () => { const e = document.activeElement; if (!e || e === document.body) return "none"; const host = e.closest(".mgd-card") && e.matches(".mgd-card__link") ? e.closest(".mgd-card") : e; const cs = getComputedStyle(host), cf = getComputedStyle(e);
  const o = cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) > 0; const s = cf.boxShadow && cf.boxShadow !== "none"; const bg = cf.backgroundColor; return o || s ? "ok" : `none:${e.tagName}.${e.className} bg=${bg}`; };

for (const p of want) {
  for (const s of STYLES) {
    if (!existsSync(path.join(OUT, `${p}-web-${s}`))) { ok(false, `${p} ${s}: not rendered`); continue; }
    for (const scheme of ["light", "dark"]) {
      const page = await b.newPage({ viewport: { width: 1280, height: 900 }, colorScheme: scheme });
      await page.goto(file(p, s)); await page.waitForTimeout(30);
      if (scheme === "light") { const st = await page.evaluate(STRUCT); ok(!st.length, `${p} ${s} structure: ${st.join("; ")}`); }
      const c = await page.evaluate(CONTRAST); ok(c.n > 0 && !c.bad.length, `${p} ${s} ${scheme} contrast (${c.n} texts): ${c.bad.slice(0, 4).join(" | ")}`);
      if (scheme === "light") { // visible focus on every keyboard stop inside the demo
        const n = await page.evaluate(FOCUSABLES); await page.focus("body"); await page.evaluate(() => { const h = document.querySelector("#cx-demo"); h.tabIndex = -1; h.focus(); });
        const bad = []; for (let i = 0; i < n; i++) { await page.keyboard.press("Tab"); const inStage = await page.evaluate(() => !!document.activeElement.closest(".cx-stage")); if (!inStage) break; const r = await page.evaluate(RING); if (r !== "ok") bad.push(r); }
        ok(!bad.length, `${p} ${s} focus ring: ${bad.slice(0, 3).join(" | ")}`);
      }
      await page.close();
    }
    const m = await b.newPage({ viewport: { width: 390, height: 844 } }); await m.goto(file(p, s, "mobile")); await m.waitForTimeout(30);
    const sw = await m.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]); ok(sw[0] <= sw[1] + 1, `${p} ${s} 390px sideways scroll ${sw}`); await m.close();
  }
}

// ---- behaviour per pattern (minimal) -------------------------------------------------------------------------------
const B = {};
const A = (page, sel, attr) => page.getAttribute(sel, attr);
const act = (page) => page.evaluate(() => { const e = document.activeElement; return (e.id || e.textContent || "").trim(); });
B.tabs = async (pg) => {
  await pg.focus("#tab-overview"); await pg.keyboard.press("ArrowRight");
  ok((await A(pg, "#tab-tasks", "aria-selected")) === "true" && !(await pg.isHidden("#panel-tasks")) && (await pg.isHidden("#panel-overview")), "tabs: ArrowRight selects Tasks and shows its panel");
  ok((await act(pg)) === "tab-tasks" && (await A(pg, "#tab-tasks", "tabindex")) === "0" && (await A(pg, "#tab-overview", "tabindex")) === "-1", "tabs: roving tabindex");
  await pg.keyboard.press("End"); ok((await act(pg)) === "tab-activity", "tabs: End skips the disabled Billing tab");
  await pg.keyboard.press("ArrowRight"); ok((await act(pg)) === "tab-overview", "tabs: ArrowRight wraps past the disabled tab");
  await pg.keyboard.press("ArrowLeft"); ok((await act(pg)) === "tab-activity", "tabs: ArrowLeft wraps");
  await pg.keyboard.press("Home"); await pg.keyboard.press("Tab"); ok((await act(pg)) === "panel-overview", "tabs: Tab moves into the panel");
  await pg.click("#tab-billing", { force: true }); // Playwright treats aria-disabled as not actionable ok((await A(pg, "#tab-billing", "aria-selected")) === "false", "tabs: disabled tab cannot be selected");
};
B["dropdown-menu"] = async (pg) => {
  await pg.focus("#file-menu-btn"); await pg.keyboard.press("ArrowDown");
  ok(!(await pg.isHidden("#file-menu")) && (await A(pg, "#file-menu-btn", "aria-expanded")) === "true" && (await act(pg)) === "Rename", "menu: ArrowDown opens and focuses the first item");
  await pg.keyboard.press("End"); ok((await act(pg)) === "Delete", "menu: End");
  await pg.keyboard.press("ArrowUp"); ok((await act(pg)) === "Copy link", "menu: ArrowUp skips the disabled item");
  await pg.keyboard.press("d"); ok((await act(pg)) === "Delete", "menu: type-ahead d from Copy link → Delete");
  await pg.keyboard.press("d"); ok((await act(pg)) === "Duplicate", "menu: type-ahead wraps to Duplicate");
  await pg.keyboard.press("Escape"); ok((await pg.isHidden("#file-menu")) && (await act(pg)) === "file-menu-btn" && (await A(pg, "#file-menu-btn", "aria-expanded")) === "false", "menu: Escape closes and returns focus");
  await pg.keyboard.press("ArrowUp"); ok((await act(pg)) === "Delete", "menu: ArrowUp on the button opens at the last item");
  await pg.keyboard.press("Enter"); ok((await pg.isHidden("#file-menu")) && /Delete chosen/.test(await pg.textContent(".mgd-menu-out")), "menu: Enter runs the item and closes");
  ok((await A(pg, "#file-menu", "role")) === "menu" && (await pg.locator("[role=menuitem][aria-disabled=true]").count()) === 1 && (await pg.locator("[role=separator]").count()) === 1, "menu: roles");
};
B.accordion = async (pg) => {
  ok((await A(pg, "#acc-included-btn", "aria-expanded")) === "true" && !(await pg.isHidden("#acc-included")), "accordion: first section open");
  await pg.focus("#acc-billing-btn"); await pg.keyboard.press("Enter"); ok((await A(pg, "#acc-billing-btn", "aria-expanded")) === "true" && !(await pg.isHidden("#acc-billing")), "accordion: Enter opens");
  await pg.keyboard.press(" "); ok((await pg.isHidden("#acc-billing")), "accordion: Space closes");
  await pg.keyboard.press("ArrowDown"); ok((await act(pg)) === "acc-pause-btn", "accordion: ArrowDown");
  await pg.keyboard.press("Home"); ok((await act(pg)) === "acc-included-btn", "accordion: Home");
  await pg.keyboard.press("End"); await pg.keyboard.press("Enter"); ok((await A(pg, "#acc-family-btn", "aria-expanded")) === "false", "accordion: disabled header does not open");
  ok((await pg.locator(".mgd-acc__h > button").count()) === 4 && (await A(pg, "#acc-billing", "role")) === "region", "accordion: buttons inside headings, regions");
};
B.popover = async (pg) => {
  await pg.focus(".mgd-pop > button"); await pg.keyboard.press("Enter");
  ok(!(await pg.isHidden("#share-pop")) && (await act(pg)) === "share-email" && (await A(pg, ".mgd-pop > button", "aria-expanded")) === "true", "popover: Enter opens and focuses the field");
  await pg.keyboard.press("Escape"); ok((await pg.isHidden("#share-pop")) && (await act(pg)).includes("Share"), "popover: Escape closes and returns focus");
  await pg.keyboard.press(" "); await pg.mouse.click(5, 5); ok(await pg.isHidden("#share-pop"), "popover: click outside closes");
  ok((await A(pg, "#share-pop", "role")) === "dialog" && !(await A(pg, "#share-pop", "aria-modal")), "popover: non-modal dialog");
};
B.tooltip = async (pg) => {
  await pg.focus("[aria-labelledby=tip-1]"); await pg.waitForTimeout(400);
  const vis = () => pg.evaluate(() => getComputedStyle(document.getElementById("tip-1")).visibility);
  ok((await vis()) === "visible", "tooltip: shows on keyboard focus");
  await pg.keyboard.press("Escape"); await pg.waitForTimeout(350); ok((await vis()) === "hidden" && (await act(pg)) === "", "tooltip: Escape hides it and keeps focus");
  await pg.keyboard.press("Tab"); await pg.waitForTimeout(400); ok(await pg.evaluate(() => getComputedStyle(document.getElementById("tip-2")).visibility === "visible"), "tooltip: next trigger shows its own");
  await pg.hover("[aria-describedby=tip-mrr]"); await pg.waitForTimeout(400); ok(await pg.evaluate(() => getComputedStyle(document.getElementById("tip-mrr")).visibility === "visible"), "tooltip: shows on hover");
  await pg.hover("#tip-mrr"); await pg.waitForTimeout(100); ok(await pg.evaluate(() => getComputedStyle(document.getElementById("tip-mrr")).visibility === "visible"), "tooltip: stays while hovered (WCAG 1.4.13)");
  ok((await pg.locator("[role=tooltip]").count()) === 5 && (await A(pg, "[aria-labelledby=tip-3]", "aria-disabled")) === "true", "tooltip: roles, disabled trigger stays focusable");
};
B["toggle-switch"] = async (pg) => {
  const sw = "[aria-labelledby=sw-desktop]";
  await pg.focus(sw); await pg.keyboard.press(" "); ok((await A(pg, sw, "aria-checked")) === "true", "switch: Space turns it on");
  await pg.keyboard.press("Enter"); ok((await A(pg, sw, "aria-checked")) === "false", "switch: Enter turns it off");
  ok(await pg.isDisabled("[aria-labelledby=sw-sms]"), "switch: disabled switch");
  ok((await pg.locator("[role=switch]").count()) === 4, "switch: role=switch");
};
B["radio-group"] = async (pg) => {
  await pg.focus("input[value=weekly]"); await pg.keyboard.press("ArrowDown");
  ok(await pg.isChecked("input[value=monthly]"), "radio: ArrowDown selects the next option");
  await pg.keyboard.press("ArrowDown"); ok(await pg.isChecked("input[value=daily]"), "radio: arrows skip the disabled option and wrap");
  ok((await pg.locator("fieldset > legend").count()) === 1 && await pg.isDisabled("input[value=instant]"), "radio: fieldset, legend, disabled");
};
B.pagination = async (pg) => {
  ok((await A(pg, "[aria-label='Page 3']", "aria-current")) === "page", "pagination: current page");
  await pg.click("[aria-label='Page 4']");
  ok((await A(pg, "[aria-label='Page 4']", "aria-current")) === "page" && (await act(pg)) === "4", "pagination: moves current page and focus");
  ok(/Showing 61–80 of 1,284/.test(await pg.textContent(".mgd-pg__range")), "pagination: range updates (live region)");
  await pg.click("[aria-label='Page 1']"); ok((await pg.locator(".mgd-pg__link[aria-disabled=true]").count()) === 1, "pagination: Previous disabled on page 1");
  ok((await A(pg, "nav.mgd-pg", "aria-label")) === "Pagination", "pagination: nav label");
};
B.breadcrumbs = async (pg) => {
  ok((await pg.locator("nav[aria-label=Breadcrumb] [aria-current=page]").count()) === 1, "breadcrumbs: current page");
  await pg.focus(".mgd-crumbs__more"); await pg.keyboard.press("Enter");
  ok((await pg.locator("[data-crumb-hidden]").count()) === 0 && (await act(pg)) === "Orders", "breadcrumbs: show-more reveals levels and focuses the first");
  ok((await pg.locator("nav.mgd-crumbs ol").count()) === 2, "breadcrumbs: ordered lists");
};
B.stepper = async (pg) => {
  ok((await pg.locator("[aria-current=step]").textContent()).includes("Verify identity"), "stepper: current step");
  await pg.click("[data-step-go='1']"); ok((await pg.locator("[aria-current=step]").textContent()).includes("Fund account") && /Step 4 of 5/.test(await pg.textContent("[data-step-live]")), "stepper: Next moves on and announces");
  for (let i = 0; i < 4; i++) await pg.click("[data-step-go='-1']", { force: true });
  ok((await A(pg, "[data-step-go='-1']", "aria-disabled")) === "true" && (await pg.locator("[aria-current=step]").textContent()).includes("Business details"), "stepper: Back disabled on step 1");
  ok((await pg.locator(".mgd-steps .mgd-sr").first().textContent()).includes("Current"), "stepper: hidden state text");
};
B["sidebar-nav"] = async (pg) => {
  ok((await pg.locator("nav[aria-label=Main] [aria-current=page]").count()) === 1, "sidebar: current page");
  await pg.click("[aria-controls=side-reports]"); ok((await pg.isHidden("#side-reports")) && (await A(pg, "[aria-controls=side-reports]", "aria-expanded")) === "false", "sidebar: group collapses");
  await pg.focus(".mgd-side__collapse"); await pg.keyboard.press("Enter");
  ok((await A(pg, ".mgd-side__collapse", "aria-expanded")) === "false" && (await A(pg, ".mgd-side__collapse", "aria-label")) === "Expand sidebar" && (await pg.evaluate(() => document.getElementById("side").classList.contains("is-collapsed"))), "sidebar: collapse button");
  ok((await pg.evaluate(() => document.querySelector(".mgd-side__link[aria-current] .mgd-side__label").textContent)) === "Overview", "sidebar: collapsed links keep their names");
};
B.spinner = async (pg) => {
  ok((await pg.locator("[role=status]").count()) === 2, "spinner: status regions");
  await pg.focus("[data-busy-label]"); await pg.keyboard.press("Enter");
  ok((await A(pg, "[data-busy-label]", "aria-busy")) === "true" && (await act(pg)).includes("Summarising") && /Summarising your sources/.test(await pg.textContent(".mgd-load__msg")), "spinner: busy button keeps focus and announces");
  await pg.emulateMedia({ reducedMotion: "reduce" }); ok((await pg.evaluate(() => getComputedStyle(document.querySelector(".mgd-spin")).animationDuration)).startsWith("2.4"), "spinner: reduced motion slows the spin");
};
B.cards = async (pg) => {
  ok((await pg.locator(".cx-stage a.mgd-card__link").count()) === 3 && (await pg.locator(".cx-stage .mgd-card--soldout a").count()) === 0, "cards: one link per available card, none on the sold-out card");
  const box = await pg.locator(".mgd-card").first().boundingBox(); await pg.mouse.click(box.x + 20, box.y + 20); await pg.waitForTimeout(80); ok(/#product-1$/.test(await pg.evaluate(() => location.hash)), "cards: whole card is clickable");
};
for (const p of want) {
  if (!B[p]) continue;
  const pg = await b.newPage({ viewport: { width: 1280, height: 900 } }); await pg.goto(file(p, "minimal")); await pg.waitForTimeout(30);
  try { await B[p](pg); } catch (e) { ok(false, `${p} behaviour threw: ${e.message.split("\n")[0]}`); }
  await pg.close();
}
await b.close();
console.log(`${checks} checks, ${fails} failed (${want.length} components × ${STYLES.length} styles; axe-core not installed, targeted checks)`);
process.exit(fails ? 1 : 0);
