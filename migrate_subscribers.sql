-- Newsletter subscribers (anonymous email capture from the WP footer + the app).
-- Distinct from `users` (Google-login app members with newsletter_opt_in).
CREATE TABLE IF NOT EXISTS subscribers (
  id            TEXT PRIMARY KEY,
  email         TEXT UNIQUE NOT NULL,
  source        TEXT,                          -- 'footer-wp' | 'inspiration' | ...
  status        TEXT NOT NULL DEFAULT 'subscribed',  -- subscribed | pending | unsubscribed
  confirm_token TEXT,                           -- reserved for future double opt-in
  created_at    INTEGER,
  confirmed_at  INTEGER
);
CREATE INDEX IF NOT EXISTS idx_sub_created ON subscribers(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sub_source ON subscribers(source);
