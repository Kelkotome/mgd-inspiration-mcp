-- Annual Reports Archive — additive migration for the live `items` table.
-- Safe to run while the current Worker is deployed (old code ignores new columns).
-- ADD COLUMN ... DEFAULT 'design' backfills all existing rows to 'design'.
ALTER TABLE items ADD COLUMN collection TEXT DEFAULT 'design';
ALTER TABLE items ADD COLUMN company TEXT;
ALTER TABLE items ADD COLUMN report_year INTEGER;
ALTER TABLE items ADD COLUMN designer TEXT;
ALTER TABLE items ADD COLUMN industry TEXT;
CREATE INDEX IF NOT EXISTS idx_items_collection ON items(collection, created_at DESC);
