-- Boards v2 (2026-10-28): groups (Work / Interests / Personal / custom), descriptions, custom cover,
-- optional public share link, per-pin notes. Additive only — existing boards and saves are untouched.
ALTER TABLE boards ADD COLUMN grp TEXT;
ALTER TABLE boards ADD COLUMN description TEXT;
ALTER TABLE boards ADD COLUMN cover_item_id TEXT;
ALTER TABLE boards ADD COLUMN share_id TEXT;
ALTER TABLE boards ADD COLUMN updated_at INTEGER;
CREATE UNIQUE INDEX IF NOT EXISTS idx_boards_share ON boards(share_id);
ALTER TABLE saves ADD COLUMN note TEXT;
