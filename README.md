# MGD Inspiration

A design-inspiration gallery (typography / brand-font niche) for madegooddesigns.com — a **user-retention feature**, hand-curated, serverless on Cloudflare. Phase 0 MVP.

## Architecture — one data layer, two front doors
- **Worker** (`src/index.js`) — JSON API + serves the gallery & curation UIs + serves images from R2.
- **D1** (`schema.sql`) — `items` (+ `boards`/`saves`/`users` for Phase 1).
- **R2** — image storage (zero egress fees; never the WordPress media library).
- **NVIDIA Build (NIM)** — best-effort vision auto-tagging + description on ingest (batch, ≈ $0). Saves never block on it.

Front doors: (1) the **public gallery** (`src/ui/gallery.html`) at `/` — masonry, search, style filter, detail modal with HEX/RGB/OKLCH palette and **plain-text source (no outbound link)**. (2) the private **curation UI** (`src/ui/add.html`) at `/add` — token-gated; downsizes images client-side, extracts palette, triggers enrichment.

## Endpoints
| Route | Purpose |
|---|---|
| `GET /` | gallery |
| `GET /add` | curation UI (needs ADMIN_TOKEN) |
| `POST /api/items` | add item (Bearer ADMIN_TOKEN) |
| `GET /api/feed?style=&cursor=&limit=` | paginated feed |
| `GET /api/search?q=` | text search |
| `GET /api/item/:id` | one item |
| `DELETE /api/items/:id` | soft-remove (Bearer) |
| `GET /img/:key` | image from R2 (immutable cache) |

Supports an optional `BASE_PATH` var to mount at `madegooddesigns.com/inspiration/` via a Cloudflare route.

## Deploy / run
See **DEPLOY.md**. TL;DR: `wrangler login` → create D1 + R2 → apply `schema.sql` → set `NVIDIA_API_KEY` + `ADMIN_TOKEN` secrets → `wrangler deploy`.

## Design decisions (locked)
Niche = typography/brand-font · seeding = hand-curated (no scraper) · attribution = store URL, **display source as plain text, no link** (anti-spam) · stack = Cloudflare serverless · **success metric = return visits** (if the read-only gallery doesn't retain, don't build Phase 1).

Full plan: `~/.claude/plans/pure-purring-hippo.md`.
