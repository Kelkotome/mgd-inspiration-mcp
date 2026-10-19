-- 2026-09-01: index source_url so ingest de-dup (SELECT id FROM items WHERE source_url=?)
-- stops doing a full-table scan on every seed/build insert. Big rows_read saver.
CREATE INDEX IF NOT EXISTS idx_items_source_url ON items(source_url);
