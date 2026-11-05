-- 5-Nov-2026: per-visitor daily cap on get_ui_screen_code / get_ui_flow (src/index.js mcpOverCap) counts a visitor's calls
-- of one tool in the last 24h; this keeps that lookup to ≤ cap index entries instead of every row the visitor ever made.
CREATE INDEX IF NOT EXISTS idx_mcpev_cap ON mcp_events(visitor, tool, created_at);
