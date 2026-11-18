// MCP r7 (18-Nov-2026): the round's changes, against the base tree (tests/r7/.base = d157482, the code of the live Worker 59aee919,
// fonts r6), both running in Node on the local copy of live D1 (tests/r3/.data/live.sqlite; see mcp-r3.md "Local D1 copy"):
//   A. accent folding: pure helpers + real searches (Hammershoi/Hammershøi, Kobke/Købke, Bjorg/Bjørg, Muller/Müller, Dvorak, Rodenbach)
//   B. the 320 real library queries of r4: byte-identical to base, and fewer D1 round trips (first OR tier in the batch)
//   C. get_ui_flow: every alias, descriptions, no-match suggestion; unchanged answers for flow ids
//   D. design_md_from_references with plain text; E. barcode check digits; F. list_inspiration_themes (same counts, cached, faster)
//   G. intent hints (font / brand / palette): firing, near-misses, palette line replaced, logged as mcp_events kinds
//   H. brand + font name folding
// Run: node --no-warnings --import=./tests/r3/register.mjs tests/test_r7.mjs   (prints "N passed, M failed"; VERBOSE=1 lists every check)
import { openDb, makeEnv, cacheShim, callTool } from "./r3/env.mjs";
import { existsSync, readFileSync } from "node:fs";

if (!existsSync(new URL("./r7/.base/src/index.js", import.meta.url))) { console.log("no tests/r7/.base (git archive d157482 src ui-screens/taxonomy.json | tar -x -C tests/r7/.base)"); process.exit(1); }
const shim = cacheShim(); globalThis.caches = shim;
const { default: base } = await import("./r7/.base/src/index.js");
const { default: next } = await import("../src/index.js");
const F = await import("../src/fold.js");
const SX = await import("../src/search_extras.js");
const IH = await import("../src/intent_hints.js");
const UI = await import("../src/ui_screens.js");
const MT = await import("../src/mcp_tools.js");
const { knownFont } = await import("../src/font_pairing.js");
const db = openDb();
let ok = 0, fail = 0;
const t = (name, cond, info) => { cond ? ok++ : fail++; if (!cond || process.env.VERBOSE) console.log((cond ? "PASS " : "FAIL ") + name + (cond || info == null ? "" : " | " + String(typeof info === "string" ? info : JSON.stringify(info)).slice(0, 400))); };
const text = (r) => ((r.result && r.result.content) || []).filter((c) => c.type === "text").map((c) => c.text).join("\n");
const ids = (s) => [...new Set([...s.matchAll(/\b[0-9a-f]{12}\b/g)].map((m) => m[0]))];
const head = (s) => s.split("\n")[0];
const B = makeEnv(db, { version: "r7-base" }), N = makeEnv(db, { version: "r7-next" });
const both = async (tool, args) => [await callTool(base, B.env, tool, args), await callTool(next, N.env, tool, args)];

// ---------------------------------------------------------------------------------------------------------------- A. accent folding
{
  for (const [a, b] of [["Hammershøi", "Hammershoi"], ["Købke", "Kobke"], ["Bjørg", "Bjorg"], ["Müller", "Muller"], ["Dvořák", "Dvorak"], ["Rodenbach", "Rodenbach"],
    ["Ærø", "AEro"], ["Straße", "Strasse"], ["Łódź", "Lodz"], ["Œuvre", "OEuvre"], ["Þingvellir", "THingvellir"], ["Đorđe", "Dorde"], ["Crème brûlée", "Creme brulee"], ["Façade", "Facade"], ["Señor", "Senor"]])
    t(`fold: ${a} → ${b}`, F.fold(a) === b, F.fold(a));
  t("fold: plain ASCII is returned as is (no normalize call)", F.fold("Swiss poster 1960") === "Swiss poster 1960");
  t("accentVariants: hammershoi → hammershøi", F.accentVariants("hammershoi").includes("hammershøi"), F.accentVariants("hammershoi"));
  t("accentVariants: bjorg → bjørg, kobke → købke, lodz → łodz, strasse → straße, aero → ærø",
    F.accentVariants("bjorg").includes("bjørg") && F.accentVariants("kobke").includes("købke") && F.accentVariants("lodz").includes("łodz") &&
    F.accentVariants("strasse").includes("straße") && F.accentVariants("aero").includes("ærø"));
  t("accentVariants: capped at 12, none for words under 4 letters or with non-letters", F.accentVariants("illuminated old world").length === 0 && F.accentVariants("illuminated").length <= 12 && F.accentVariants("ode").length === 0);
  t("wordForms: Hammershøi → as typed + folded; Müller → muller", F.wordForms("hammershøi").includes("hammershoi") && F.wordForms("müller").includes("muller"));
  const tiers = SX.ftsTiers(["vilhelm", "hammershoi"], ["title", "designer"], { forms: F.wordForms });
  const all = tiers.find((x) => x.tier === "all");
  t("ftsTiers + forms: each word ORs its spellings in the AND tier", /\("hammershoi" OR "hammershøi"/.test(all.expr) && all.expr.startsWith("{title designer} : ("), all.expr);
  const ph = SX.ftsTiers(["hammershøi", "interior"], null, { forms: F.wordForms })[0];
  t("ftsTiers + forms: the phrase tier also tries the folded phrase", ph.expr === '("hammershøi interior" OR "hammershoi interior")', ph.expr);
  t("ftsTiers without forms = the pre-r7 expressions", JSON.stringify(SX.ftsTiers(["modern", "jazz", "poster"], null)) === JSON.stringify((await import("./r7/.base/src/search_extras.js")).ftsTiers(["modern", "jazz", "poster"], null)));
  t("ftsCoverageSort folds both sides", SX.ftsCoverageSort([{ id: "a", title: "x" }, { id: "b", title: "Vilhelm Hammershøi" }], ["hammershoi"], ["title"])[0].id === "b");

  // real searches on the local copy of live D1
  const pair = async (tool, a, b) => { const ra = await callTool(next, N.env, tool, { query: a }), rb = await callTool(next, N.env, tool, { query: b }); return [ids(text(ra)), ids(text(rb)), text(ra)]; };
  const [hb] = await both("search_museum_art", { query: "Hammershoi" });
  t("museum: base answered 'Hammershoi' with 0 results (the live complaint)", /^0 museum/.test(text(hb)), head(text(hb)));
  let [x, y, tx] = await pair("search_museum_art", "Hammershoi", "Hammershøi");
  t(`museum: 'Hammershoi' finds the same ${y.length} works as 'Hammershøi'`, x.length >= 8 && x.join() === y.join(), head(tx));
  [x, y, tx] = await pair("search_museum_art", "Kobke", "Købke");
  t(`museum: 'Kobke' = 'Købke' (${y.length})`, x.length > 0 && x.join() === y.join(), head(tx));
  [x, y, tx] = await pair("search_design_inspiration", "Bjørg", "Bjorg");
  t("design: 'Bjørg' finds what 'Bjorg' finds (the Bjorg guide; the index has the plain spelling)", y.length > 0 && x.join() === y.join(), head(tx));
  for (const tool of ["search_design_inspiration", "search_museum_art", "search_annual_reports"]) {
    [x, y, tx] = await pair(tool, "Müller", "Muller");
    t(`${tool}: 'Muller' and 'Müller' give the same answer (${x.length})`, x.join() === y.join(), head(tx));
  }
  [x, y, tx] = await pair("search_museum_art", "Dvorak", "Dvořák");
  t("museum: 'Dvorak' and 'Dvořák' give the same answer", x.join() === y.join(), head(tx));
  const [rb, rn] = await both("search_design_inspiration", { query: "Rodenbach" });
  t("design: 'Rodenbach' (no accents) answers exactly as base", text(rb) === text(rn), head(text(rn)));
  const v = await callTool(next, N.env, "search_museum_art", { query: "Vilhelm Hammershoi interior" });
  t("museum: 'Vilhelm Hammershoi interior' leads with Hammershøi works matching every word", /match all of: vilhelm, hammershoi, interior/.test(head(text(v))) && /Hammershøi/.test(text(v).split("\n").slice(0, 8).join(" ")), head(text(v)));
  const k = makeEnv(db, { version: "r7-kill", vars: { FTS_FOLD: "0" } });
  t("kill switch: Worker var FTS_FOLD=0 gives the base answer back", text(await callTool(next, k.env, "search_museum_art", { query: "Hammershoi" })) === text(hb));
  // search_ui_screens folds too
  const u1 = await callTool(next, N.env, "search_ui_screens", { query: "café menu", limit: 3 }), u2 = await callTool(next, N.env, "search_ui_screens", { query: "cafe menu", limit: 3 });
  t("ui screens: 'café menu' = 'cafe menu'", ids(text(u1)).join() === ids(text(u2)).join() && ids(text(u1)).length > 0, head(text(u1)));
}

// ---------------------------------------------------------------------------------------------------------------- B. real queries
{
  const { rows } = JSON.parse(readFileSync(new URL("./r4_queries.json", import.meta.url)));
  const B2 = makeEnv(db, { version: "r7-base-q" }), N2 = makeEnv(db, { version: "r7-next-q" });
  const rt = (E) => { const s = { b: 0, inb: 0 }; const ob = E.env.DB.batch; E.env.DB.batch = async (l) => { s.b++; s.inb += l.length; return ob(l); }; return s; };
  const sb = rt(B2), sn = rt(N2);
  let same = 0, diff = [], hinted = [], nb = 0, nn = 0, msb = 0, msn = 0, dsB = 0, dsN = 0, dN = 0;
  for (const { tool, q } of rows) {
    const b0 = B2.dbStats.n, n0 = N2.dbStats.n;
    const rb = await callTool(base, B2.env, tool, { query: q }), rn = await callTool(next, N2.env, tool, { query: q });
    nb += B2.dbStats.n - b0; nn += N2.dbStats.n - n0; msb += rb.ms; msn += rn.ms;
    if (tool === "search_design_inspiration") { dsB += rb.ms; dsN += rn.ms; dN++; }
    const tb = text(rb), tn = text(rn);
    if (tb === tn) { same++; continue; }
    // r7 intent hint: the answer = the hint line + the base answer without its palette line
    const hk = IH.hintKindOf(tn);
    if (hk && tn.slice(tn.indexOf("\n\n") + 2) === tb.replace(/\n\nPalette from these references: [^\n]*$/, "")) { hinted.push(`${hk}: ${q}`); continue; }
    diff.push(`${tool}: ${q}`);
  }
  t(`real queries: ${same}/${rows.length} answers byte-identical to base, ${hinted.length} = base + an intent hint (palette line dropped), 0 other changes`, diff.length === 0, diff.slice(0, 5).join(" ; "));
  if (process.env.VERBOSE) console.log("  hinted: " + hinted.join(" ; "));
  const rtB = nb - sb.inb + sb.b, rtN = nn - sn.inb + sn.b;
  t(`real queries: D1 round trips ${rtB} -> ${rtN} (statements ${nb} -> ${nn}, incl. the 2 deferred log writes per call)`, rtN < rtB, `${rtB} -> ${rtN}`);
  console.log(`  timing (local SQLite, no network): 320 queries ${Math.round(msb)} -> ${Math.round(msn)} ms; design avg ${(dsB / dN).toFixed(1)} -> ${(dsN / dN).toFixed(1)} ms; read round trips per call ${((rtB - 2 * rows.length) / rows.length).toFixed(2)} -> ${((rtN - 2 * rows.length) / rows.length).toFixed(2)}`);
  const K = makeEnv(db, { version: "r7-kill-pf", vars: { FTS_PREFETCH: "0" } }); const sk = rt(K); let nk = 0;
  for (const { tool, q } of rows.slice(0, 60)) { const k0 = K.dbStats.n; await callTool(next, K.env, tool, { query: q }); nk += K.dbStats.n - k0; }
  t("kill switch: FTS_PREFETCH=0 batches only the AND tiers (as base)", sk.inb <= sk.b * 3);
}

// ---------------------------------------------------------------------------------------------------------------- C. get_ui_flow
{
  let bad = [];
  for (const [id, al] of Object.entries(UI.FLOW_ALIASES)) for (const a of al) { const r = UI.resolveFlow(a); if (!r || r.id !== id) bad.push(`${a} -> ${r && r.id}`); }
  t(`ui flow: every alias resolves to its flow (${Object.values(UI.FLOW_ALIASES).flat().length} aliases)`, bad.length === 0, bad.join(", "));
  t("ui flow: alias list only names real flows", Object.keys(UI.FLOW_ALIASES).every((id) => UI.UI_FLOWS[id]));
  for (const [q, want] of [["onboarding", "sign-up"], ["signup", "sign-up"], ["register", "sign-up"], ["2fa", "login-2fa"], ["MFA", "login-2fa"], ["forgot password", "password-reset"],
    ["forgot my password", "password-reset"], ["purchase", "checkout"], ["buy", "checkout"], ["upgrade", "upgrade-plan"], ["pricing", "upgrade-plan"], ["cancel", "cancel-subscription"],
    ["invite", "invite-teammate"], ["user onboarding for a banking app", "sign-up"], ["sign in", "login-2fa"]]) {
    const r = UI.resolveFlow(q); t(`ui flow: "${q}" → ${want}`, r && r.id === want, r);
  }
  for (const q of ["settings", "dashboard", "qwxz plorbt vrrmk", "employee directory browse and view team hierarchy"]) t(`ui flow: "${q}" matches no flow`, UI.resolveFlow(q) === null, UI.resolveFlow(q));
  const [ob, on] = await both("get_ui_flow", { flow: "onboarding" });
  t("ui flow: base answered 'onboarding' with an error", ob.result.isError === true);
  t("ui flow: 'onboarding' → the sign-up flow, first-run named as also close", !on.result.isError && /^\(flow "onboarding" → sign-up; also close: first-run\) Flow "Sign up and onboarding"/.test(text(on)), head(text(on)));
  for (const f of ["invite-teammate", "checkout", "sign up", "password reset", "find-a-date"]) {
    const [a, b] = await both("get_ui_flow", { flow: f });
    t(`ui flow: "${f}" answers exactly as base`, text(a) === text(b) && !b.result.isError, head(text(b)));
  }
  const nm = await callTool(next, N.env, "get_ui_flow", { flow: "onbording" });
  t("ui flow: no match → error that names the closest flow and a search_ui_screens call", nm.result.isError === true && /^No flow matches "onbording"\. Closest flow: sign-up \(sign up and onboarding\); call get_ui_flow\(flow="sign-up"\)\. For single screens instead: search_ui_screens\(query="onbording"\)\./.test(text(nm)), head(text(nm)));
  const nd = await callTool(next, N.env, "get_ui_flow", { flow: "dashboard" });
  t("ui flow: 'dashboard' (no close flow) → search_ui_screens(query=\"dashboard\") + the flow list", nd.result.isError === true && /search_ui_screens\(query="dashboard"\)/.test(text(nd)) && /Available: sign-up/.test(text(nd)), head(text(nd)));
  const gib = await callTool(next, N.env, "get_ui_flow", { flow: "qwxz plorbt vrrmk" });
  t("ui flow: gibberish stays an error starting 'No flow matches' (r4_rpc.py)", gib.result.isError === true && /^No flow matches/.test(text(gib)), head(text(gib)));
  const [db1, dn1] = await both("get_ui_flow", { flow: "employee directory browse and view team hierarchy", device: "web", style: "corporate" });
  t("ui flow: the r4 description fallback (closest screens) is unchanged", text(db1) === text(dn1) && /^No step-by-step flow matches/.test(text(dn1)), head(text(dn1)));
}

// ---------------------------------------------------------------------------------------------------------------- D. design_md text fallback
{
  const [b, n] = await both("design_md_from_references", { references: "Materials Marketplace", project_name: "Materials Marketplace" });
  t("design_md: base stopped plain-text references with an error", b.result.isError === true);
  const tn = text(n);
  t("design_md: plain text → searched like search_design_inspiration, top results used, said in one line", !n.result.isError &&
    /^The references you passed were plain text, not item IDs or URLs, so "Materials Marketplace" was searched as search_design_inspiration would search it, and the top \d+ result\(s\) below were used\.\nDesign system from \d+ reference\(s\) matching "Materials Marketplace"/.test(tn), tn.slice(0, 300));
  const s = await callTool(next, N.env, "search_design_inspiration", { query: "Materials Marketplace", limit: 8 });
  const used = ids(n.result.content[0].text);
  const sids = ids(text(s));
  t("design_md: the references are the design search's top results (those with a palette, same order)", used.length > 0 && used.every((r) => sids.includes(r)) && used.map((r) => sids.indexOf(r)).every((v, i, a) => !i || v > a[i - 1]), used.join() + " vs " + sids.join());
  const arr = await callTool(next, N.env, "design_md_from_references", { references: ["eco packaging"] });
  t("design_md: an array of plain text works the same way", !arr.result.isError && /plain text/.test(head(text(arr))));
  const [ub, un] = await both("design_md_from_references", { references: ["https://example.com/not-ours"] });
  t("design_md: a URL that is not ours stays the old error", text(ub) === text(un) && un.result.isError === true);
  const [qb, qn] = await both("design_md_from_references", { query: "art deco poster" });
  t("design_md: a query call answers exactly as base", text(qb) === text(qn));
}

// ---------------------------------------------------------------------------------------------------------------- E. barcode
{
  for (const [args, fixed, extra] of [[{ number: "036000291453" }, "036000291452", '(or pass the first 11 digits, "03600029145"'],
    [{ type: "ean13", number: "4006381333932" }, "4006381333931", 'type="ean13" (or pass the first 12 digits'],
    [{ type: "isbn", number: "9780306406150" }, "9780306406157", 'type="isbn"'], [{ type: "isbn", number: "0306406151" }, "0306406152", 'type="isbn". Your number'],
    [{ type: "upce", number: "04252613" }, "04252614", 'type="upce"']]) {
    const [b, n] = await both("generate_upc_barcode", args);
    const tn = text(n);
    t(`barcode ${args.type || "upca"} ${args.number}: still an error, base message first, corrected code ${fixed} named`, n.result.isError === true && tn.startsWith(text(b)) &&
      tn.includes(`the full code is ${fixed}`) && tn.includes(`number="${fixed}"`) && tn.includes(extra) && /Your number was not changed/.test(tn), tn);
  }
  const good = await callTool(next, N.env, "generate_upc_barcode", { number: "036000291452" });
  t("barcode: a correct code still makes the barcode", !good.result.isError && /^UPCA 036000291452/.test(text(good)), head(text(good)));
  const [lb, ln] = await both("generate_upc_barcode", { number: "12345" });
  t("barcode: a length error is unchanged (no check-digit line)", text(lb) === text(ln));
  t("upcFixed: never invents a code for a non-check-digit error", MT.upcFixed("upce", "036000291452", null) === "036000291452");
}

// ---------------------------------------------------------------------------------------------------------------- F. themes
{
  const B3 = makeEnv(db, { version: "r7-base-th" }), N3 = makeEnv(db, { version: "r7-next-th" });
  const b0 = performance.now(); const rb = await callTool(base, B3.env, "list_inspiration_themes", {}); const bms = performance.now() - b0;
  shim.store.clear();
  const n0s = N3.dbStats.n, n0 = performance.now(); const rn = await callTool(next, N3.env, "list_inspiration_themes", {}); const nms = performance.now() - n0;
  t("themes: same text as base (same counts)", text(rb) === text(rn), text(rn).slice(0, 200));
  const sqlN = N3.dbStats.sql.slice(n0s).filter((x) => /^SELECT/.test(x));
  t("themes: one D1 statement that counts in SQL (json_each, GROUP BY)", sqlN.length === 1 && /json_each/.test(sqlN[0]), sqlN);
  console.log(`  timing (local SQLite, cold): list_inspiration_themes ${Math.round(bms)} -> ${Math.round(nms)} ms; D1 returns ~26 counts instead of ~74k themes strings (~2.1 MB)`);
  const n1 = N3.dbStats.n; await callTool(next, N3.env, "list_inspiration_themes", {});
  t("themes: second call is cached (no D1 read)", N3.dbStats.sql.slice(n1).filter((x) => /^SELECT/.test(x)).length === 0);
  const { _memClear } = await import("../src/mcp_cache.js"); _memClear();
  const N4 = makeEnv(db, { version: "r7-next-th-other-deploy" }); const n2 = N4.dbStats.n;
  await callTool(next, N4.env, "list_inspiration_themes", {});
  t("themes: the colo cache survives a new deploy version (global key)", N4.dbStats.sql.slice(n2).filter((x) => /^SELECT/.test(x)).length === 0);
  const off = makeEnv(db, { version: "r7-off", vars: { MCP_CACHE: "0" } });
  t("themes: MCP_CACHE=0 still answers the same (no cache)", text(await callTool(next, off.env, "list_inspiration_themes", {})) === text(rb));
}

// ---------------------------------------------------------------------------------------------------------------- G. intent hints
{
  const L = (r) => head(text(r));
  const fires = async (tool, q, kind) => {
    const r = await callTool(next, N.env, tool, { query: q }); const h = IH.hintKindOf(text(r));
    return [h === IH.HINT_KINDS[kind], r];
  };
  for (const [tool, q, kind, call] of [["search_design_inspiration", "Poppins font", "font", 'get_font_pairing(font="Poppins")'], ["search_design_inspiration", "fonts like Futura", "font", 'get_font_pairing(font="Futura")'],
    ["search_museum_art", "Montserrat Bold typeface", "font", 'get_font_pairing(font="Montserrat")'], ["search_design_inspiration", "Nike font", "brand", 'get_brand_typeface(brand="Nike")'],
    ["search_design_inspiration", "Nike brand guidelines", "brand", 'get_brand_typeface(brand="Nike")'], ["search_design_inspiration", "Spotify", "brand", 'get_brand_typeface(brand="Spotify")'],
    ["search_design_inspiration", "warm colour palette", "palette", 'generate_website_color_palette(style="warm")'], ["search_annual_reports", "#1e40af corporate", "palette", 'generate_website_color_palette(brand_color="#1E40AF")'],
    ["search_museum_art", "blue color scheme", "palette", "generate_website_color_palette()"]]) {
    const [ok1, r] = await fires(tool, q, kind);
    t(`hint fires: ${tool} "${q}" → ${call}`, ok1 && L(r).includes(call) && !/Palette from these references/.test(text(r)), L(r));
  }
  for (const [tool, q] of [["search_design_inspiration", "iconic"], ["search_design_inspiration", "brand new"], ["search_design_inspiration", "Fontaine poster"], ["search_design_inspiration", "fontface lettering"],
    ["search_design_inspiration", "serif font"], ["search_design_inspiration", "vintage typography poster"], ["search_design_inspiration", "colorful poster"], ["search_museum_art", "palette knife painting"],
    ["search_museum_art", "apple still life"], ["search_annual_reports", "IBM"], ["search_design_inspiration", "brand identity"], ["search_design_inspiration", "Nike website"], ["search_design_inspiration", "settings icon"],
    ["search_design_inspiration", "art deco font"], ["search_design_inspiration", "font"]]) {
    const r = await callTool(next, N.env, tool, { query: q }), rb = await callTool(base, B.env, tool, { query: q });
    t(`hint does not fire: ${tool} "${q}" (answer as base)`, !IH.hintKindOf(text(r)) && text(r) === text(rb), L(r));
  }
  // the palette line stays when no hint fires, goes when one does
  const p0 = await callTool(next, N.env, "search_design_inspiration", { query: "art deco poster gold" });
  t("no hint → the palette line is still there", /Palette from these references: /.test(text(p0)) && !IH.hintKindOf(text(p0)));
  // logged as mcp_events kinds
  db.exec("DELETE FROM temp.mcp_events");
  await callTool(next, N.env, "search_design_inspiration", { query: "Poppins font" });
  await callTool(next, N.env, "search_design_inspiration", { query: "Nike font" });
  await callTool(next, N.env, "search_design_inspiration", { query: "warm colour palette" });
  await callTool(next, N.env, "search_design_inspiration", { query: "art deco poster gold" });
  const kinds = db.prepare("SELECT kind, tool FROM temp.mcp_events WHERE kind IN ('font_hint','brand_hint','palette_hint') ORDER BY created_at").all().map((r) => r.kind + ":" + r.tool);
  t("hints are logged once each (font_hint, brand_hint, palette_hint; tool = the search)", kinds.join() === "font_hint:search_design_inspiration,brand_hint:search_design_inspiration,palette_hint:search_design_inspiration", kinds.join());
  // one hint per answer: UI / museum / icon hints keep priority
  t("intentHint: none on UI, art-history or icon queries", !IH.intentHint("search_design_inspiration", "pricing page font", []) && !IH.intentHint("search_design_inspiration", "art nouveau font", []) && !IH.intentHint("search_design_inspiration", "font icon", []));
  t("fontName: whole words only; generic style words name no font", IH.fontName("Fontaine typeface") === null && IH.fontName("serif fonts") === null && IH.fontName("bold font") === null && IH.fontName("DM Serif Display font") === "DM Serif Display");
  t("brandOf: needs that brand's own guide among the results", IH.brandOf("Nike", [{ company: "Nike", style: "brand-cover" }]) === "Nike" && IH.brandOf("Nike", [{ company: "Nike Golf", style: "brand-cover" }]) === null && IH.brandOf("brand new", [{ company: "Brand New", style: "type-specimen" }]) === null);
  t("paletteAsk: hex, words; not 'palette knife' or 'colorful'", IH.paletteAsk("#abc logo").hex === "#AABBCC" && IH.paletteAsk("colour scheme") && !IH.paletteAsk("palette knife") && !IH.paletteAsk("colorful"));
}

// ---------------------------------------------------------------------------------------------------------------- H. names
{
  t("btKey folds ø/æ/ł (Søstrene Grene → sostrenegrene); btKeyLegacy keeps the D1 build's key", SX.btKey("Søstrene Grene") === "sostrenegrene" && SX.btKeyLegacy("Søstrene Grene") === "sstrenegrene");
  for (const [q, brand] of [["Søstrene Grene", "Søstrene Grene"], ["Sostrene Grene", "Søstrene Grene"], ["Snohetta", "Snøhetta"], ["Snøhetta", "Snøhetta"], ["Orsted", "Ørsted"], ["Ørsted", "Ørsted"], ["Nike", "Nike"]]) {
    const r = await callTool(next, N.env, "get_brand_typeface", { brand: q });
    t(`get_brand_typeface "${q}" → ${brand}`, !r.result.isError && text(r).includes(`• ${brand}`), head(text(r)));
  }
  const [b1, n1] = await both("get_brand_typeface", { brands: ["Nike", "Rolex", "Supreme"] });
  t("get_brand_typeface: plain names answer exactly as base", text(b1) === text(n1));
  t("btTilePatterns: folded + accented first word, capitalised, ≤ 8", SX.btTilePatterns("Sostrene Grene").includes("Søstrene Grene") && SX.btTilePatterns("Sostrene Grene").length <= 8);
  t("knownFont: exact names only", knownFont("Poppins") === "Poppins" && knownFont("Popins") === null && knownFont("bold") === null);
  const [fb, fn] = await both("get_font_pairing", { font: "Playfair Display" });
  t("get_font_pairing: answers exactly as base", text(fb) === text(fn));
}

console.log(`${ok} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
