-- MCP analytics (29-Oct-2026): one row per initialize / tools/list / tools/call on /mcp and /mcp/boards.
-- visitor = salted SHA-256 of IP + user agent (no raw IP); session_id = the Mcp-Session-Id we issue on initialize.
CREATE TABLE IF NOT EXISTS mcp_events (
  id             TEXT PRIMARY KEY,
  created_at     INTEGER NOT NULL,
  endpoint       TEXT,     -- 'public' | 'boards'
  kind           TEXT,     -- 'initialize' | 'tools_list' | 'call'
  session_id     TEXT,
  client_name    TEXT,     -- clientInfo.name from initialize
  client_version TEXT,
  protocol       TEXT,
  visitor        TEXT,
  ua             TEXT,
  country        TEXT,
  tool           TEXT,
  ok             INTEGER,  -- 1 = tool returned normally, 0 = isError
  zero           INTEGER,  -- 1 = search returned no results
  ms             INTEGER,  -- tool run time
  bot            INTEGER   -- 1 = scanner / probe user agent
);
CREATE INDEX IF NOT EXISTS idx_mcpev_created ON mcp_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mcpev_session ON mcp_events(session_id);
CREATE INDEX IF NOT EXISTS idx_mcpev_visitor ON mcp_events(visitor);
