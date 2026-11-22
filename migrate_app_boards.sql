-- App board links, Phase 1 (23-Nov-2026, src/app_boards.js). Additive only: two new tables + four indexes; nothing else changes.
-- Live: run each statement on its own with  npx wrangler d1 execute mgd-inspiration --remote --command "<statement>"  (see DEPLOY-app-boards-p1.md).
-- edit_hash = SHA-256 of the creator's edit token (the token itself is never stored); ip_hash = salted SHA-256 (rate limit only).
-- items = JSON array of typed items (library | palette | colour | font | note), validated on write.
-- last_seen = last view or edit (ms); boards with last_seen older than APP_BOARD_EXPIRY_DAYS read as expired.
-- upd_day/upd_count = per-board daily update counter (UTC day number); disabled: 0 visible, 1 admin, 2 hidden after reports, 3 expired.
CREATE TABLE IF NOT EXISTS app_boards (id TEXT PRIMARY KEY, edit_hash TEXT NOT NULL, title TEXT NOT NULL, notes TEXT, items TEXT NOT NULL DEFAULT '[]', ip_hash TEXT, created_at INTEGER NOT NULL, updated_at INTEGER, last_seen INTEGER NOT NULL, upd_day INTEGER NOT NULL DEFAULT 0, upd_count INTEGER NOT NULL DEFAULT 0, reports INTEGER NOT NULL DEFAULT 0, disabled INTEGER NOT NULL DEFAULT 0);
CREATE INDEX IF NOT EXISTS idx_app_boards_ip ON app_boards(ip_hash, created_at);
CREATE INDEX IF NOT EXISTS idx_app_boards_seen ON app_boards(last_seen);
-- Reports (one per IP hash per board counts; 3 distinct IP hashes hide a board; an IP hash counts at most 20 reports a day).
CREATE TABLE IF NOT EXISTS app_board_reports (board_id TEXT NOT NULL, ip_hash TEXT NOT NULL, created_at INTEGER NOT NULL, PRIMARY KEY (board_id, ip_hash));
CREATE INDEX IF NOT EXISTS idx_app_board_reports_ip ON app_board_reports(ip_hash, created_at);
CREATE INDEX IF NOT EXISTS idx_app_board_reports_at ON app_board_reports(created_at);
