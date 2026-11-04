-- (C) 5-Nov-2026: FTS5 index for the MCP library searches (src/search_extras.js ftsSearch). Additive: the old Worker ignores it.
-- External-content table over items (no second copy of the text), porter stemming on unicode61, diacritics folded, prefix indexes.
-- Order matters: triggers FIRST, then 'rebuild' (rebuild wipes and re-reads every row, so a row inserted in between is never lost
-- or doubled). Run in a quiet window (rebuild reads all ~81k rows). Rollback: rollback_fts.sql.
CREATE VIRTUAL TABLE IF NOT EXISTS items_fts USING fts5(
  title, company, designer, tags, themes, industry, country, category, description,
  content='items', content_rowid='rowid', tokenize='porter unicode61 remove_diacritics 2', prefix='2 3');
CREATE TRIGGER IF NOT EXISTS items_fts_ai AFTER INSERT ON items BEGIN
  INSERT INTO items_fts(rowid, title, company, designer, tags, themes, industry, country, category, description)
  VALUES (new.rowid, new.title, new.company, new.designer, new.tags, new.themes, new.industry, new.country, new.category, new.description);
END;
CREATE TRIGGER IF NOT EXISTS items_fts_ad AFTER DELETE ON items BEGIN
  INSERT INTO items_fts(items_fts, rowid, title, company, designer, tags, themes, industry, country, category, description)
  VALUES ('delete', old.rowid, old.title, old.company, old.designer, old.tags, old.themes, old.industry, old.country, old.category, old.description);
END;
CREATE TRIGGER IF NOT EXISTS items_fts_au AFTER UPDATE OF title, company, designer, tags, themes, industry, country, category, description ON items BEGIN
  INSERT INTO items_fts(items_fts, rowid, title, company, designer, tags, themes, industry, country, category, description)
  VALUES ('delete', old.rowid, old.title, old.company, old.designer, old.tags, old.themes, old.industry, old.country, old.category, old.description);
  INSERT INTO items_fts(rowid, title, company, designer, tags, themes, industry, country, category, description)
  VALUES (new.rowid, new.title, new.company, new.designer, new.tags, new.themes, new.industry, new.country, new.category, new.description);
END;
INSERT INTO items_fts(items_fts) VALUES('rebuild');
