-- 3-Nov-2026: rights/hosting fields for LINK-ONLY non-commercial records (BSB + ÖNB historical annual reports).
-- Additive only (other agents share this D1). Old Worker code ignores these columns; new code never uses them in SQL.
-- rights        exact licence/rights statement of the item, e.g. 'NoC-NC 1.0 (No Copyright – Non-Commercial Use Only)'
-- rights_holder holding institution, e.g. 'Bayerische Staatsbibliothek' / 'Österreichische Nationalbibliothek'
-- hosting       NULL = image hosted in our R2 (normal rows); 'link' = metadata only, image stays at the library
-- image_url     the library's own IIIF/thumbnail URL (hosting='link' rows only)
ALTER TABLE items ADD COLUMN rights TEXT;
ALTER TABLE items ADD COLUMN rights_holder TEXT;
ALTER TABLE items ADD COLUMN hosting TEXT;
ALTER TABLE items ADD COLUMN image_url TEXT;
