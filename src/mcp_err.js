// Error text for MCP answers and mcp_events.err (mcp-errors-r1, 9-Nov-2026; moved out of index.js in MCP r3, 12-Nov-2026, so tests can import it).
export const MCP_USAGE_HEAD = "This tool accepts:";
// MCP r3 (12-Nov-2026): an exception always gives a message. A thrown Error with an empty message, a thrown object without one, or a
// thrown null/undefined used to read "Error: " (and mcp_events.err "tool: Error:"); now it names what was thrown.
export function mcpExcText(e) {
  if (e && typeof e === "object") {
    const m = String(e.message == null ? "" : e.message).trim();
    if (m) return m;
    let j = ""; try { j = JSON.stringify(e); } catch (_) {}
    const nm = e.name || (e.constructor && e.constructor.name) || "object";
    return j && j !== "{}" ? `${nm} ${j.slice(0, 120)}` : `${nm} thrown with no message`;
  }
  const m = String(e == null ? "" : e).trim();
  return m || `${e === undefined ? "undefined" : e === null ? "null" : "empty " + typeof e} thrown with no message`;
}

// "class: first line of the message". Classes: exception (the tool threw), busy (D1 error), capped, unknown_tool, bad_args (no
// argument the tool knows; the answer lists what it accepts), invalid_args (run_design_tool schema check), tool (the tool's own message).
export function mcpErrText(r) {
  const t = String((r && Array.isArray(r.content) && r.content[0] && r.content[0].text) || "").replace(/\s+/g, " ").trim();
  // MCP r3: never an empty class or message
  if (!t || /^Error:$/.test(t)) return t ? "exception: Error: (no message)" : `tool: (no error text${r && Array.isArray(r.content) ? "" : "; no content"})`;
  const cls = /^Error: | failed: /.test(t.slice(0, 120)) ? "exception" : /^The search failed \(database error/.test(t) ? "busy" : /^Daily limit reached/.test(t) ? "capped"
    : /^Unknown tool/.test(t) ? "unknown_tool" : /^Invalid arguments/.test(t) ? "invalid_args" : t.includes(MCP_USAGE_HEAD) ? "bad_args" : "tool";
  return `${cls}: ${t.slice(0, 180)}`;
}

// MCP r3: a tool error with no text (a module's catch returning err(e.message) for an Error with an empty message) gets one.
export function mcpNoBlankError(name, r) {
  if (!r || !r.isError) return r;
  if (!Array.isArray(r.content) || !r.content.length) r.content = [{ type: "text", text: "" }];
  const c = r.content[0];
  if (c && c.type === "text" && !String(c.text || "").trim()) c.text = `Error: ${name} failed with no message (an internal error, not a problem with the arguments). Retry the call; if it fails again, change the arguments.`;
  return r;
}
