# Mobbin MCP: what it does well, and what MGD's UI-screens MCP should build next (3 Nov 2026)

INTERNAL PLANNING ONLY. This is not for publishing. Public MGD copy never frames anything as competition (see feedback_free_no_competition_framing).
Rule for every build below: we take patterns and element checklists only. We never copy Mobbin screenshots, app content or real brand UI. Every screen stays an original fictional product built through tpl → gen → shoot → trim → ingest.

## Method

- **Mobbin, 17 read-only calls:**
  - `search_screens` ×11, covering web and iOS, deep and standard modes, an app-name filter, and element-level queries.
  - `search_flows` ×2.
  - `search_sections` ×2.
  - `list_collections` and `get_collection_contents` (all-saved), 1 call each.
  - I never called create/save/comment.
- **MGD, about 30 live calls to `POST /inspiration/mcp`** (curl UA, which our reports exclude as bot traffic):
  - `search_ui_screens` ×27.
  - `get_ui_flow` ×1.
  - `get_ui_screen_code` ×1.
  - `tools/list` ×1.
- **Query set:** 12 queries are verbatim from the real log in `mcp_ui_queries_2026-11-03.txt`. The rest are element-level probes (toast, date range, toggles, filter chips) and vertical probes (plumber, running shoes, tablet).

## 1. Mobbin's strengths, as seen through the MCP

| Area | What I saw |
|---|---|
| **Corpus** | Real shipped apps, current to 2026. ChatGPT Deep Research, Dropbox Dash, Braintrust, Retool, Base44, incident.io, Lloyds, bunq, Zocdoc, Yuka, Urban Company and others. Every query returned **several different apps**: 3–4 distinct products per 3–4 results. Coverage of new categories (AI agents, MCP settings, AEO tools) is very fresh. |
| **Platforms** | The MCP enum is `ios` and `web` only for screens and flows. There is **no Android or iPad parameter**, even though the website has Android. Sections are web-only. |
| **Search quality** | `deep` mode, the default, is an AI re-ranking pipeline and it is clearly strong on **element- and state-level intent**:<br>• "toast notification with undo action" → real Asana/Coda screens with an undo toast in the corner.<br>• "date range picker" → Airbnb/Tripadvisor range calendars.<br>• "AI model settings with provider API keys" → Braintrust/Retool provider tables, one even showing a success toast.<br>• "plumber home services booking" (we score 0) → Walmart auto-service slot picker and Urban Company cleaning booking.<br>`standard` mode is noticeably looser: "security vulnerabilities dashboard" gave an incident chart, an SEO-issues table and an empty security page. Naming an app ("Spotify now-playing") filters to that app, but intent is weaker in standard mode (podcast player, "What's New"). |
| **Flows** | Real, long journeys: **7–15 screens** (Lloyds onboarding 13, bunq 15, Paramount+ password reset 7). They include **error and edge states**: the password-reset flow opens on a "Unable to verify your account" error. Each flow carries `actions` tags (e.g. "Creating Account, Onboarding, Selecting & Choosing, Setting Up") and is paginated up to 20 pages. |
| **Sections** | A separate `search_sections` for website sections (pricing, hero, footer…), across many real marketing sites (Webflow, Intercom, Upwork, Square, Save.design). It is paginated. |
| **Metadata richness** | **Search results are deliberately thin:** `id`, `app_name`, `platform`, `image_url` (a short link that expires after 30 days), `mobbin_url`, plus **inline image previews** that the agent is told to "look at". There are no pattern or element tags in search output. The tag vocabulary only surfaces through **collections**: `get_collection_contents` items list `screen_patterns`, `ui_elements`, `section_patterns`, `actions` and team `comments`. |
| **Agent-oriented params** | Every tool takes `output_destination` (code / design_tool / doc / reference_library / chat / other), `output_tool` (Figma, Notion…) and `task_intent`. This is telemetry about what agents do with results (very smart product research), and per its description it "helps return results in the form the workflow needs". Tool descriptions are long, prescriptive prompt engineering: query-writing guidance, "always cite mobbin_url", "download image_url rather than link", and an `ai_usage_notice` to show verbatim. It renders an MCP Apps interactive gallery on hosts that support it. |
| **Collections** | Personal and team boards with comments, counts per kind, and paging rules written into the description. Our test account has 0 saves, so I couldn't see a real item's metadata payload. Write tools (`create_collection`, `save_content`, `add_comment`) exist, which makes Mobbin a two-way workspace and not just a search box. |
| **Code** | **No code is returned.** Output is images and links only, so the agent has to re-derive layout, tokens and copy from pixels. |
| **Auth / paywall / limits** | OAuth-authenticated (the connector is signed in to a Mobbin account). Every call worked and I hit **no rate limit or paywall message** in 17 calls. However, **I couldn't see which plan the account is on**, so I can't say what a free account gets through the MCP. No `ai_usage_notice` appeared in any response. The 30-day expiring image URLs and the "cite mobbin_url" rule push traffic back to mobbin.com. |
| **Cost to the agent** | Each result costs one inline image, and flows inline about 5 previews each, so context use is heavy. Text is tiny (~150 bytes per result). |

### Top 5 Mobbin strengths
1. **Real, current, very broad corpus** (thousands of shipped apps, fresh AI-product coverage), so every query returns diverse apps.
2. **Deep (AI re-ranked) search that understands element and state intent** (toast + undo, date range, provider-key table, error state).
3. **Long real flows (7–15 steps) including error and edge states**, tagged with actions and paginated.
4. **Visual-first output:** inline previews the model can actually see, plus an MCP Apps gallery on supporting hosts.
5. **Workflow hooks:** collections with tags and team comments, write tools, and `output_destination`/`task_intent` telemetry that tells them what agents build.

## 2. Where MGD is already stronger

1. **Code returned.** `get_ui_screen_code` returns full self-contained HTML/CSS plus a DESIGN.md (colours with WCAG roles, light and dark tokens, type scale, spacing, radius, components): about 29 KB per screen. Mobbin returns pixels only. For the dominant real use (coding agents in Cursor and Claude Code) this is the decisive edge.
2. **Light and dark for every screen.** Each screen has a dark screenshot plus dark tokens, and the HTML switches on `prefers-color-scheme` or `data-theme`. Queries with "dark" automatically lead with the dark screenshot. Mobbin dark mode depends on what the app shipped.
3. **8 style variants of every pattern** (minimal → brutalist) with a `style` filter. Mobbin can't restyle a screen, and "clean"/"modern" style words are explicitly discouraged in its query guidance.
4. **Free, no auth, no expiry.** No account, no OAuth, stable image URLs, and screens that are free to use and adapt (the original-work licence; credit requested). Mobbin is account-gated, its images expire in 30 days, and it pushes traffic back to its own pages.
5. **Structured, filterable output in text.** `pattern`/`platform`/`style` enums, colour roles with hex values, an element list, flow membership and cite URLs, all readable without vision. Mobbin search exposes no tags. Flows share one fictional product and design system across steps, so they are directly buildable. Mobbin flows are real but in someone else's brand.

Also: legal clarity (no brand or trademark exposure when an agent ships something based on our screen), and pattern landing pages for SEO.

## 3. What the side-by-side showed about OUR search (the biggest finding)

On 27 queries, **every response returned six style twins of a single screen**: 1 pattern × 6 styles. Mobbin returned 3–4 different products. On top of that, the ranking often picked the wrong pattern:

| Query (real log ⭐) | MGD returned | Should have been |
|---|---|---|
| ⭐ healthcare clinic doctor directory (mobile) | Clinic homepage ×6 | doctor-directory (exists; "doctor directory" alone works) |
| ⭐ banking app onboarding (mobile) | Flow canvas editor ×6 | bank-onboarding: no stemming, so "banking" ≠ "bank", and "onboarding" matched the canvas description |
| ⭐ Telehealth video call … mute camera, end call (web) | After-visit summary ×6 | telehealth-visit (call in progress) |
| ⭐ data table with logo cells … row selection checkboxes | LMS dashboard ×6 | data-table |
| ⭐ small agency services pricing packages | Portfolio home ×6 | pricing section |
| ⭐ dark centered hero decorative graphics | Portfolio / clinic homepages | hero section |
| settings with toggle switches (mobile) | AI settings ×6 | settings |
| toast notification undo | Flow canvas editor | nothing has a toast, so it should say so |
| ⭐ running shoes (mobile) | Office floor plan ×6 ("no text match; showing filters") | a commerce product-detail, or an honest "no match" |
| date picker range | Analytics report | no range-picker screen exists |

The good ones were music player, skincare scan, kanban, form wizard, paywall, playlist, security dashboard and AI chat, all once the words matched a title.

**Causes:**
- Ties sort by `created_at DESC`, so the newest patterns win.
- No stemming or synonyms.
- No pattern-title boost.
- No diversity across patterns.
- The zero-match fallback shows unrelated filtered rows.

**Cost:** about 11–13 KB of text per 6-result search (~3k tokens), much of it repeated UTM URLs. Six near-identical blocks is a poor use of an agent's context.

Also found: the **claude.ai connector still shows the old schema** (70 patterns / 15 flows), while the live `tools/list` has 91 / 20. Clients cache `tools/list`, so growing enums go stale. Unknown enum values get rejected client-side **before they ever reach us**.

**Coverage gaps vs Mobbin:**
- Flows average **2.75 steps** (20 flows, 2–4 steps) vs Mobbin's 7–15, with no error-state steps.
- No component or state screens (toast, modal, drawer, date-range picker, dropdown open, inline validation errors) even though `elements` lists them.
- No tablet or watch.
- 44 of 90 real queries name specific elements or compositions ("with sparklines", "status chips", "sticky right rail", "row selection checkboxes"). That is exactly where deep search wins and our word-match loses.

## 4. Gaps ranked by impact on what our users actually query, with builds

Ranking basis: the 90 real queries (mostly coding agents asking for a specific composition), weighted by how often the gap causes a wrong or useless answer today.

| # | Gap → Build | Effort | Expected impact |
|---|---|---|---|
| 1 | **Ranking is wrong on ~40% of real queries.** Rewrite `search_ui_screens` scoring: pattern-name/title boost > elements > description; light stemming (banking→bank, toggles→toggle) plus a synonym map (now-playing→music-player, video consult→telehealth-visit, wizard→form-wizard, toast→toast); kill the `created_at` tiebreak; when 0 words match, say so and suggest the closest patterns instead of filler. Ship with a regression test of the 90 logged queries and expected patterns (`tests/ui_rank/`). | S–M | **Highest.** Fixes the most common failure today with no new screens. |
| 2 | **Six style twins per answer.** Diversify by default: at most 1–2 results per pattern. Group the rest under one line per screen ("also in: playful, retro, brutalist → pass style="). Add `group_by_pattern` / `distinct=true` (default true) and a compact output mode (one site URL and one UTM base per response, no repeated long query strings). | S | High. Each answer shows 4–6 different relevant screens and ~60% fewer tokens. |
| 3 | **Element-level and composition search** (44/90 queries). Enrich ingest with a per-screen **element inventory** parsed from the generated HTML: components present (table + checkbox column, sparkline, status chip, sticky rail, avatar stack, progress ring, toast, modal, drawer, stepper, date picker…), counts, layout (sidebar / top-nav / split / master-detail) and density. Store it as `el:` tags plus `layout:`/`density:` facets. Add an `elements` array param (AND-match) and return "matched elements: …" per result. All of this is derivable from our own HTML; no vision model needed. | M | High. Directly answers the compositional queries Cursor and Claude Code users send. |
| 4 | **Interaction states and component screens.** New "states" tpl module: toast/snackbar with undo, confirm-delete modal, side drawer, open dropdown/command palette, date-range picker, inline form validation errors, loading/skeleton per pattern, offline/permission-denied, destructive confirmation. Each is an overlay rendered **on top of an existing family screen**, so the context is real. Make them a pattern family `state:*` with variants. | M | Medium-high. Covers what Mobbin's deep search excels at (states). |
| 5 | **Longer flows with edge states.** Extend the 20 flows from 2–4 to 6–10 steps by adding the real intermediate and error steps from existing patterns plus new variants: wrong password → lockout, card declined → retry, email-verify sent → expired link, empty → first item → success. Add a `get_ui_flow` param `include_errors` and an `actions` list per flow (verbs like Mobbin's). | M | Medium-high. Flows are our second tool, and current 2-step "flows" read thin next to 13-step real ones. |
| 6 | **Vertical breadth (product diversity).** The family list is 14 products. Real queries ask for home services/booking (plumber), retail/sports commerce (running shoes), staff/school admin, clinics, beauty, food business. Add 6–8 new families: home-services marketplace, sports retail, restaurant/food ops, school admin, real estate, travel booking, nonprofit/donations, logistics. Reuse existing patterns, so the yield is about 70 patterns × new p.name/p.cat/palette/copy without new templates. Make `category` a search param. | M–L | Medium. Makes results feel like many products, not one. Also SEO landing pages per vertical. |
| 7 | **Schema staleness in clients.** Change `pattern` (and `flow`) from a strict enum to a free string **with the list in the description** and server-side fuzzy mapping ("doctor directory" → doctor-directory). Expose `list_ui_patterns` (or an MCP resource) returning the live taxonomy with counts. Clients with cached schemas stop rejecting new values. | S | Medium. Removes a silent failure mode as the library grows (91 now, more coming). |
| 8 | **Platform coverage: tablet (and watch).** Add a `tablet` viewport (1024×1366 / 1180×820) to shoot.sh and gen.js for the ~30 patterns where tablet differs meaningfully (dashboard, split-view, calendar, editor, kanban, chat, player, booking). Also add a `watch` mini set (health, music, notifications, 2FA approve), about 10 patterns. Mobbin's MCP has no iPad or Android param, so this is open ground. | M | Medium-low in real queries ("tablet" 0 so far), but distinctive and cheap after #6. |
| 9 | **Agent-side images.** Optionally inline a small preview image (MCP `image` content, ~400px webp, only when `previews=true` or limit ≤4) so vision-capable clients can "see" like Mobbin. Add an MCP Apps gallery later. | S–M | Medium. Helps chat hosts (claude.ai) choose. Coding agents mostly need the code. |
| 10 | **Copy and microcopy as data.** Expose each screen's text strings (headings, button labels, empty-state and error messages) as a `get_ui_screen_code` format `copy` (JSON). Also add a `search_ui_copy`-style param (e.g. "empty state copy for an invoice list"). We already author specific copy per template, so this is extraction only. | S | Low-medium. Cheap, unique, and useful for UX writers and agents. |

Also worth borrowing, at no build cost:
- An `intent` / `output_destination` optional param on our UI tools (logged only). It tells us whether people build code, docs or designs, which is the same insight Mobbin collects.
- Query-writing guidance in the tool description ("one screen per query; name the kind of product; add an element only if needed").

## 5. What I couldn't see

- **Which Mobbin plan the connected account has,** and therefore free-tier MCP limits or paywall behaviour. No limit or paywall was hit in 17 calls.
- **The real collection item payload** (`screen_patterns` / `ui_elements` / `comments`), because the account has 0 saves. That shape is taken from the tool description, not observed.
- **Corpus size via the MCP.** It gives no totals. `has_next_page` was true on every flow and section search.
- **Latency** of deep vs standard mode (not timed).
- **MCP Apps gallery rendering** (not available in this host).
- **Android:** the website has it, but the MCP doesn't expose it.
