// MCP r4 part D (imported by tests/test_r4.mjs): get_ui_flow with a description instead of a flow id, and the directory aliases.
export async function run({ base, next, db, makeEnv, callTool, text, t }) {
  const B = makeEnv(db, { version: "r4-base-ui" }), N = makeEnv(db, { version: "r4-next-ui" });
  // the real failed call of 12-Nov (openai-mcp): base = error with the flow list; r4 = the closest screens after the flow list
  const q = { flow: "employee directory browse and view team hierarchy", device: "web", style: "corporate" };
  const rb = await callTool(base, B.env, "get_ui_flow", q), rn = await callTool(next, N.env, "get_ui_flow", q);
  t("ui flow: base answered the 12-Nov description with an error", rb.result.isError === true, text(rb).slice(0, 80));
  const tn = text(rn);
  t("ui flow: r4 answers it without an error, flow list first, then screens led by team members", !rn.result.isError && /^No step-by-step flow matches "employee directory browse and view team hierarchy"/.test(tn)
    && /call get_ui_flow with one of these ids: sign-up/.test(tn) && /pattern: team-members/.test(tn.split("\n").find((l) => /pattern: /.test(l)) || ""), tn.slice(0, 300));
  // the screens part is exactly the search_ui_screens answer for the same text (no second ranking)
  const rs = await callTool(next, N.env, "search_ui_screens", { query: q.flow, device: "web", style: "corporate", limit: 4 });
  const sids = (x) => [...x.matchAll(/screen_id: ([0-9a-f]{12})/g)].map((m) => m[1]).join(",");   // the tool-specific "Next step" line differs
  t("ui flow: the screens are the search_ui_screens answer for the same text, device and style (same screens, same order)", sids(tn) && sids(tn) === sids(text(rs)), sids(tn) + " vs " + sids(text(rs)));
  // unchanged: real flow ids, aliases and bare unknown ids
  for (const f of ["invite-teammate", "checkout", "sign up", "password reset"]) {
    const a = await callTool(base, B.env, "get_ui_flow", { flow: f }), b = await callTool(next, N.env, "get_ui_flow", { flow: f });
    t(`ui flow: "${f}" answers exactly as base`, text(a) === text(b) && !b.result.isError, text(b).slice(0, 80));
  }
  for (const f of ["zzqx", "", "nonexistentflow"]) {
    const a = await callTool(base, B.env, "get_ui_flow", { flow: f }), b = await callTool(next, N.env, "get_ui_flow", { flow: f });
    t(`ui flow: unknown id "${f}" is still the same error`, b.result.isError === true && text(a) === text(b), text(b).slice(0, 80));
  }
  // a description that matches no screen either stays the error (nothing unrelated is shown)
  const z = await callTool(next, N.env, "get_ui_flow", { flow: "qwxz plorbt vrrmk" });
  t("ui flow: a description that matches no screen stays the error", z.result.isError === true && /^No flow matches/.test(text(z)), text(z).slice(0, 80));
  // directory searches
  for (const [s, want] of [["employee directory", "team-members"], ["staff directory", "team-members"], ["doctor directory", "doctor-directory"], ["directory", "doctor-directory"]]) {
    const r = text(await callTool(next, N.env, "search_ui_screens", { query: s, limit: 3 }));
    const first = (r.match(/pattern: ([a-z0-9-]+)/) || [])[1];
    t(`ui search: "${s}" leads with ${want}`, first === want, first);
  }
}
