# Made Good Designs — Design Inspiration MCP Server

A public **MCP (Model Context Protocol) server** that lets any AI assistant search
[Made Good Designs](https://madegooddesigns.com/inspiration/)' curated library of
**typography & brand-design inspiration** — returning descriptions, tags, colour palettes
(HEX), source attribution, and image URLs. Built on Cloudflare Workers (the same Worker also
serves the human web gallery).

- **MCP endpoint:** `https://madegooddesigns.com/inspiration/mcp`
- **Transport:** Streamable HTTP (remote MCP server)
- **Auth:** none (public, read-only)
- **Protocol:** Model Context Protocol / JSON-RPC 2.0 (`initialize`, `tools/list`, `tools/call`, `ping`)
- **Homepage:** https://madegooddesigns.com/inspiration/

## MCP tools

This server exposes three **MCP tools** (no resources or prompts are defined — tools only):

| Tool | Description |
|---|---|
| `search_design_inspiration(query, theme?, limit?)` | Free-text search of the inspiration library (e.g. "serif wordmark", "vintage poster", "monospace terminal"). Optional theme filter. |
| `list_inspiration_themes()` | List the curated themes (retro, vintage, minimal, editorial, brutalist, art-deco, y2k, swiss, …) with item counts. |
| `browse_inspiration_by_theme(theme, limit?)` | Browse items within a curated theme. |

Every tool result includes source attribution back to madegooddesigns.com, descriptive tags,
a curated theme, a colour palette (HEX), and an absolute image URL.

## Connect

### Claude / Claude Desktop
Settings → Connectors → **Add custom connector** → paste the endpoint URL:
`https://madegooddesigns.com/inspiration/mcp`

### JSON config (Cursor, Cline, and other MCP clients)
```json
{
  "mcpServers": {
    "mgd-inspiration": {
      "type": "streamable-http",
      "url": "https://madegooddesigns.com/inspiration/mcp"
    }
  }
}
```

### Verify with the MCP SDK inspector
```bash
npx @modelcontextprotocol/inspector
# → connect to https://madegooddesigns.com/inspiration/mcp
# → run tools/list, then call search_design_inspiration({ "query": "serif branding", "limit": 3 })
```

### Raw JSON-RPC (MCP over Streamable HTTP)
```bash
curl -s https://madegooddesigns.com/inspiration/mcp \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
```

## How the MCP server is implemented

The MCP handler lives in [`src/index.js`](src/index.js) (`mcpHandler` + `MCP_TOOLS`). It implements
the Model Context Protocol over Streamable HTTP: `initialize` (echoing the client's
`protocolVersion` and advertising `tools`), `tools/list`, `tools/call`, and `ping`, with CORS
enabled and notifications acknowledged. Tool calls query the same Cloudflare D1 database that
backs the public gallery, so MCP clients and human visitors see the same curated corpus.

---

## The rest of the project (web gallery + API)

The same Cloudflare Worker also powers a human web gallery — one data layer, two front doors.

**Architecture**
- **Worker** (`src/index.js`) — MCP server + JSON API + serves the gallery & curation UIs + serves images from R2.
- **D1** (`schema.sql`) — `items` (+ `boards`/`saves`/`users`).
- **R2** — image storage (zero egress fees).
- **NVIDIA Build (NIM)** — best-effort vision auto-tagging + description on ingest (batch, ≈ $0). Saves never block on it.

**HTTP endpoints**

| Route | Purpose |
|---|---|
| `POST /mcp` | **MCP server** (Streamable HTTP, JSON-RPC 2.0) |
| `GET /` | public masonry gallery |
| `GET /add` | curation UI (needs `ADMIN_TOKEN`) |
| `POST /api/items` | add item (Bearer `ADMIN_TOKEN`) |
| `GET /api/feed?theme=&style=&cursor=&limit=` | paginated feed |
| `GET /api/search?q=` | text search |
| `GET /api/item/:id` | one item |
| `DELETE /api/items/:id` | remove (Bearer) |
| `GET /img/:key` | image from R2 (immutable cache) |

Supports an optional `BASE_PATH` var to mount at `madegooddesigns.com/inspiration/` via a Cloudflare route.

**Deploy / run** — see **DEPLOY.md**. TL;DR: `wrangler login` → create D1 + R2 → apply `schema.sql`
→ set `NVIDIA_API_KEY` + `ADMIN_TOKEN` secrets → `wrangler deploy`.

**Design decisions (locked)** — niche = typography/brand design · attribution = store URL,
display source as plain text (no outbound link, anti-spam) · stack = Cloudflare serverless.

---

Built by [Made Good Designs](https://madegooddesigns.com) · a privacy-first, ad-free design resource.
