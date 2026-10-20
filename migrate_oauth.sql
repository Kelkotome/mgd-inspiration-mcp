-- 2026-10: OAuth 2.1 authorization server + authenticated MCP endpoint (/mcp/me).
-- Additive + deploy-safe: the currently deployed Worker never touches these tables.
-- Apply ONCE. The two ALTER TABLE lines at the bottom are not idempotent in SQLite:
-- a second run fails with "duplicate column name" (harmless - everything already exists).
--
-- Secrets are never stored: client secrets, authorization codes, access tokens and
-- refresh tokens are stored ONLY as lowercase hex SHA-256 hashes.
-- All timestamps are epoch MILLISECONDS (same convention as the rest of the schema).

-- Dynamically registered clients (RFC 7591).
CREATE TABLE IF NOT EXISTS oauth_clients (
  client_id           TEXT PRIMARY KEY,
  client_secret_hash  TEXT,                 -- NULL for public clients (token_endpoint_auth_method = 'none')
  client_name         TEXT,                 -- self-asserted, untrusted; HTML-escaped on display
  redirect_uris       TEXT NOT NULL,        -- JSON array; exact-match only
  auth_method         TEXT NOT NULL,        -- none | client_secret_post | client_secret_basic
  created_ip          TEXT,                 -- for registration rate-limiting
  created_at          INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_oauth_clients_ip ON oauth_clients(created_ip, created_at);

-- Authorization codes: single use, 5-minute TTL, PKCE S256 challenge bound.
CREATE TABLE IF NOT EXISTS oauth_codes (
  code_hash       TEXT PRIMARY KEY,
  client_id       TEXT NOT NULL,
  user_id         TEXT NOT NULL,
  redirect_uri    TEXT NOT NULL,
  code_challenge  TEXT NOT NULL,
  scope           TEXT NOT NULL,
  resource        TEXT NOT NULL,            -- RFC 8707 audience the tokens will be bound to
  expires_at      INTEGER NOT NULL,
  used_at         INTEGER,                  -- set atomically on first redemption attempt
  grant_id        TEXT,                     -- set on successful redemption (reuse => revoke this grant)
  created_at      INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_oauth_codes_exp ON oauth_codes(expires_at);

-- One row per user<->client authorization ("connected app"); tokens hang off it.
CREATE TABLE IF NOT EXISTS oauth_grants (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL,
  client_id     TEXT NOT NULL,
  scope         TEXT NOT NULL,
  resource      TEXT NOT NULL,
  created_at    INTEGER NOT NULL,
  last_used_at  INTEGER,
  revoked_at    INTEGER
);
CREATE INDEX IF NOT EXISTS idx_oauth_grants_user ON oauth_grants(user_id, created_at DESC);

-- Access (~1h) and refresh (~30d, rotated on every use) tokens.
CREATE TABLE IF NOT EXISTS oauth_tokens (
  token_hash      TEXT PRIMARY KEY,
  kind            TEXT NOT NULL,            -- access | refresh
  grant_id        TEXT NOT NULL,
  client_id       TEXT NOT NULL,
  user_id         TEXT NOT NULL,
  scope           TEXT NOT NULL,
  resource        TEXT NOT NULL,
  expires_at      INTEGER NOT NULL,
  revoked_at      INTEGER,
  revoked_reason  TEXT,                     -- rotated | revoked | reuse
  created_at      INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_oauth_tokens_grant ON oauth_tokens(grant_id);
CREATE INDEX IF NOT EXISTS idx_oauth_tokens_exp ON oauth_tokens(expires_at);

-- Attribute authenticated MCP calls to a user/client (public /mcp rows stay NULL).
ALTER TABLE mcp_calls ADD COLUMN user_id TEXT;
ALTER TABLE mcp_calls ADD COLUMN client_id TEXT;
