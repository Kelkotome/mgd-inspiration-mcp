-- MCP error detail (9-Nov-2026, mcp-errors-r1): a short "class: message" for failed tool calls (ok=0), so mcp_report.py can show
-- why a call failed. Classes: exception, busy, capped, unknown_tool, bad_args, invalid_args, tool (see mcpErrText in src/index.js).
-- The Worker works with or without this column (it falls back to the old insert), so this can be applied before or after the deploy.
-- Apply: npx wrangler d1 execute mgd-inspiration --remote --file=./migrate_mcp_events_err.sql
-- Re-running it fails with "duplicate column name: err", which is harmless.
ALTER TABLE mcp_events ADD COLUMN err TEXT;
