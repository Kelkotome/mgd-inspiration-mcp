-- No-login MCP moodboards (2-Nov-2026, src/moodboards.js). Additive only. Apply: wrangler d1 execute mgd-inspiration --remote --file=migrate_moodboards.sql
-- edit_hash = SHA-256 of the creator's edit token (the token itself is never stored); ip_hash = salted SHA-256 (rate limit only).
-- disabled: 0 visible, 1 disabled by admin, 2 hidden after reports (pending review).
CREATE TABLE IF NOT EXISTS mcp_moodboards (
  id         TEXT PRIMARY KEY,
  edit_hash  TEXT NOT NULL,
  title      TEXT NOT NULL,
  notes      TEXT,
  items      TEXT NOT NULL DEFAULT '[]',
  ip_hash    TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER,
  reports    INTEGER NOT NULL DEFAULT 0,
  disabled   INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_mcp_moodboards_ip ON mcp_moodboards(ip_hash, created_at);
