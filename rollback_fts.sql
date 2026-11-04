-- Rollback for migrate_fts.sql: drop the triggers first (so writes to items never touch a missing table), then the index.
-- The Worker falls back to the LIKE search by itself once items_fts is gone (ftsReady re-checks every 10 min; errors → LIKE at once).
DROP TRIGGER IF EXISTS items_fts_ai;
DROP TRIGGER IF EXISTS items_fts_ad;
DROP TRIGGER IF EXISTS items_fts_au;
DROP TABLE IF EXISTS items_fts;
