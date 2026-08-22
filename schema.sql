-- MGD Inspiration — D1 schema (Phase 1: accounts + boards + themes + newsletter capture)
-- Nothing is deployed yet, so this is the full target schema (no migrations needed).
-- Local: recreate with  npm run db:local:reset  (drops + reapplies).

CREATE TABLE IF NOT EXISTS items (
  id           TEXT PRIMARY KEY,
  title        TEXT,
  description  TEXT,
  source_url   TEXT,                      -- stored for de-dup/takedowns; shown as PLAIN TEXT, no link
  source_host  TEXT,                      -- e.g. "pizza4ps.com" (what we display)
  image_key    TEXT NOT NULL,             -- R2 object key
  width        INTEGER,
  height       INTEGER,
  tags         TEXT DEFAULT '[]',         -- JSON array (AI-generated)
  themes       TEXT DEFAULT '[]',         -- JSON array of curated theme slugs (retro, vintage, ...)
  palette      TEXT DEFAULT '[]',         -- JSON array of hex
  style        TEXT,                      -- AI style slug, e.g. "serif-branding"
  owner_id     TEXT,                      -- NULL = curated/public; set = user-added (private to their boards)
  status       TEXT NOT NULL DEFAULT 'published',
  created_at   INTEGER NOT NULL,
  collection   TEXT DEFAULT 'design',     -- 'design' (default gallery) | 'annual-report'
  company      TEXT,                      -- annual-report only: issuing company/entity
  report_year  INTEGER,                   -- annual-report only: fiscal/report year
  designer     TEXT,                      -- annual-report only: designer/agency (curated, not AI)
  industry     TEXT                       -- annual-report only: industry/sector
);
CREATE INDEX IF NOT EXISTS idx_items_created ON items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_items_style   ON items(style, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_items_status  ON items(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_items_collection ON items(collection, created_at DESC);

CREATE TABLE IF NOT EXISTS users (
  id                TEXT PRIMARY KEY,
  google_sub        TEXT UNIQUE,          -- Google account id
  email             TEXT UNIQUE,
  name              TEXT,
  picture           TEXT,
  newsletter_opt_in INTEGER NOT NULL DEFAULT 0,
  created_at        INTEGER NOT NULL,
  last_active_at    INTEGER
);

CREATE TABLE IF NOT EXISTS boards (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL,
  name       TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_boards_user ON boards(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS saves (
  id         TEXT PRIMARY KEY,
  board_id   TEXT NOT NULL,
  item_id    TEXT NOT NULL,
  user_id    TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  UNIQUE(board_id, item_id)
);
CREATE INDEX IF NOT EXISTS idx_saves_board ON saves(board_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_saves_user  ON saves(user_id, created_at DESC);
