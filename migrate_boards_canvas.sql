-- Boards canvas (Release 2, 2026-10-28): free-form layout per board, stored as validated JSON.
-- canvas_rev guards against two editors (web tab + MCP) overwriting each other. Additive only.
ALTER TABLE boards ADD COLUMN canvas TEXT;
ALTER TABLE boards ADD COLUMN canvas_rev INTEGER DEFAULT 0;
