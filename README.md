# Made Good Designs — Free Design Inspiration MCP Server

A free, public **MCP (Model Context Protocol) server** that lets any AI assistant — Claude, ChatGPT,
Cursor, VS Code, Cline — search [Made Good Designs](https://madegooddesigns.com/inspiration/)'
curated design-reference library and cite real sources instead of describing styles from memory.

**What it can search**
- **40,000+ brand, typography and design references** — tagged by style, theme, colour palette (HEX) and industry.
- **4,000+ vintage corporate annual-report covers** (1950s–90s) — by company, country, decade, industry and designer.
- **~1,000 public-domain / CC0 museum artworks** chosen for designers (The Met, Art Institute of Chicago, Cleveland Museum of Art) — posters, ukiyo-e, lettering, ornament, Art Nouveau.

Two endpoints:

| Endpoint | Auth | What you get |
|---|---|---|
| `https://madegooddesigns.com/inspiration/mcp` | **none** (public, read-only) | the 6 public tools |
| `https://madegooddesigns.com/inspiration/mcp/boards` | OAuth 2.1 — **sign in with Google** | your **personal mood boards**, synced across every assistant you connect, plus all public tools |

- **Transport:** Streamable HTTP (remote MCP server), JSON-RPC 2.0 (`initialize`, `tools/list`, `tools/call`, `ping`)
- **Cost:** free. No API key.
- **Setup guide:** https://madegooddesigns.com/design-mcp-server/

## MCP tools

**Public (`/mcp` and `/mcp/boards`)**

| Tool | Description |
|---|---|
| `search_design_inspiration(query, theme?, limit?)` | Free-text search of the inspiration library (e.g. "serif wordmark", "vintage poster", "brutalist web"). Optional theme filter. |
| `list_inspiration_themes()` | List the curated themes (retro, minimal, editorial, brutalist, art-deco, y2k, swiss, …) with item counts. |
| `browse_inspiration_by_theme(theme, limit?)` | Browse items within a curated theme. |
| `search_annual_reports(query, year?, industry?, limit?)` | Search vintage corporate annual-report cover designs (Paul Rand, Chermayeff & Geismar and many uncredited studios). |
| `search_museum_art(query, theme?, culture?, limit?)` | Search public-domain (CC0) museum artworks curated for designers. |
| `get_share_feedback(link? \| id + key)` | Fetch reviewer comments (as FEEDBACK.md) for a page shared with the free [HTML to Link](https://madegooddesigns.com/tools/html-to-link/) tool. |

**Personal (`/mcp/boards` only, after sign-in)**

| Tool | Scope | Description |
|---|---|---|
| `list_my_boards()` | `boards:read` | Your boards with item counts. |
| `get_board(board_id, limit?)` | `boards:read` | Items on a board, with palettes, tags, image and citable page URLs. |
| `create_board(name)` | `boards:write` | Create a board. |
| `save_to_board(board_id, item_id)` | `boards:write` | Save a search result (search results on this endpoint include `item_id`). |
| `remove_from_board(board_id, item_id)` | `boards:write` | Remove an item. |

Every result includes source attribution back to madegooddesigns.com, descriptive tags, a colour
palette (HEX) and an absolute image URL. Boards are the same ones you see in the web gallery's
Boards tab; manage connected apps at https://madegooddesigns.com/inspiration/account/connected-apps.

## Connect

### Claude / Claude Desktop
Settings → Connectors → **Add custom connector** → paste
`https://madegooddesigns.com/inspiration/mcp` (or `/mcp/boards` to sync your boards — you'll be asked to sign in with Google).

### Claude Code
```bash
claude mcp add --transport http mgd-inspiration https://madegooddesigns.com/inspiration/mcp
# personal boards:
claude mcp add --transport http mgd-boards https://madegooddesigns.com/inspiration/mcp/boards   # then /mcp to sign in
```

### JSON config (Cursor, Cline and other MCP clients)
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

## Authentication for `/mcp/boards`

Spec-compliant MCP authorization (2025-06-18): the Worker is both the OAuth 2.1 authorization server
and the resource server. PKCE (S256) required, dynamic client registration (RFC 7591), protected-resource
metadata (RFC 9728), authorization-server metadata (RFC 8414), audience-bound tokens (RFC 8707),
refresh-token rotation with replay detection, revocation (RFC 7009). Tokens are stored only as SHA-256
hashes. Implementation: [`src/oauth.js`](src/oauth.js); tests: `run_local_tests.sh` / `test_mcp_oauth.py`.

**Privacy:** both endpoints log each tool call (tool name, query, time, IP, user agent) to understand
usage and improve the library. Conversations are never sent to the server — only the tool requests.

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
| `POST /mcp/boards` | **Authenticated MCP server** (personal boards; OAuth 2.1 bearer token) |
| `/oauth/register`, `/oauth/authorize`, `/oauth/token`, `/oauth/revoke` | OAuth 2.1 authorization server for `/mcp/boards` |
| `GET /museum`, `GET /annual-reports` | Museum collection and annual-reports archive (browse + facets) |
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

**Design decisions** — niche = typography/brand design · attribution = store URL,
display source as plain text (no outbound link, anti-spam) · stack = Cloudflare serverless.

---

Built by [Made Good Designs](https://madegooddesigns.com) · a privacy-first, ad-free design resource.
