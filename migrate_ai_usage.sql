-- b60 AI design tools: daily usage counters only (no images, prompts, outputs or raw IPs).
-- (day, 'g') = global spend in micro-dollars (n = calls); (day, 'ip:<sha256 prefix>') = calls today for one IP.
-- Idempotent. Apply: wrangler d1 execute mgd-inspiration --remote --file=migrate_ai_usage.sql
CREATE TABLE IF NOT EXISTS ai_usage (
  day   TEXT    NOT NULL,
  k     TEXT    NOT NULL,
  n     INTEGER NOT NULL DEFAULT 0,
  micro INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, k)
);
