-- Cross-cutting discipline "category" — the recent.design-style top tabs.
-- Additive + deploy-safe: old Worker code ignores the new column; all existing
-- rows stay category=NULL (the "All" tab shows them, no tab bar until seeded).
--
-- Two-level model:
--   collection = sourcing/provenance unit (annual-report, brand-guidelines, posters, ...)
--   category   = discipline tab that SPANS collections (one tab surfaces many archives)
-- e.g. a poster item: collection='posters',          category='print'
--      a brand guide:  collection='brand-guidelines', category='branding'
--
-- Canonical categories (static-image, honestly sourceable only — no motion/3d):
--   typography | branding | editorial | print | packaging | logos | interface | illustration
ALTER TABLE items ADD COLUMN category TEXT;
CREATE INDEX IF NOT EXISTS idx_items_category ON items(collection, category, created_at DESC);
