CREATE TABLE IF NOT EXISTS mcp_calls (
  id         TEXT PRIMARY KEY,
  tool       TEXT,
  query      TEXT,
  ip         TEXT,
  ua         TEXT,
  created_at INTEGER
);
CREATE INDEX IF NOT EXISTS idx_mcp_created ON mcp_calls(created_at DESC);
