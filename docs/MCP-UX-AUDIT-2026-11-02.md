# MCP UX audit and improvement plan (2 Nov 2026)

Server: Worker `mgd-inspiration`, public endpoint `https://madegooddesigns.com/inspiration/mcp`, 64 tools, docs page /design-mcp-server/.
Branch: `mcp-ux` (worktree `mgd-inspiration-mcpux`), **not deployed**. Deploy with the scratchpad script `deploy_mcp_ux.sh`.

Data window: 26 Oct to 2 Nov 2026 (7 days). Sources: D1 `mcp_events` (from 29 Oct) and `mcp_calls` (from Aug). Read-only SELECTs only.

Rows to exclude from analysis:
- Our own tests: curl UA, `analytics-test` (Cursor UA, 29 Oct).
- The audit's own live checks on 2 Nov, 04:50–05:10 SGT. These include one non-bot `list_inspiration_themes` call sent with a Kittl-like browser UA.

## 1. Findings (numbers)

### 1.1 The "80% connect and never call" figure is mostly structural, and part of it is bots

| | Brief (raw) | Corrected |
|---|---|---|
| Connections (initialize) | 3,647–3,929 | **2,822** |
| Connecting visitors | 212–219 | **202** |
| Tool calls | 96–100 | **86** |
| Visitors who called | 40 | **39** |
| Callers who called on 2+ days | – | **7 (18%)** |

Why the numbers were corrected:
- About 1,100 connections were liveness or catalogue probes, which send a real `clientInfo` but never use tools:
  - `glimind-probe` (UA `SentinelOracle`): 937 connections from 1 visitor.
  - `histor` crawler: 164.
  - `catalog-health`, `mcpcost`, `probe`, `agentready-probe` and others.
- `analytics-test` was our own test.

Why most of the gap is structural:
- Desktop clients (Claude Code, Codex, opencode) open a session every time the app starts, for every configured server. One Claude Code user can produce 268 sessions in a week.
- Per-session activation (21 of 2,822 sessions = 0.7%) therefore says little. Visitor-level activation is the KPI that means something.

### 1.2 Activation by client (visitor level, 7 days)

| Client | Via | Connected | Activated | Activation | Calls | Calls / active |
|---|---|---|---|---|---|---|
| claude-code | direct (user's own IP) | 69 | 5 | **7%** | 25 | 5.0 |
| claude-code | Anthropic proxy (`Claude-User`) | 56 | 27 | 48% | 43 | 1.6 |
| Anthropic/ClaudeAI (claude.ai) | proxy | 55 | 26 | 47% | 42 | 1.6 |
| kittl-agent | direct (browser) | 30 | 0 | **0%** | 0 | – |
| codex-mcp-client | direct | 25 | 1 | **4%** | 1 | 1.0 |
| opencode | direct | 11 | 1 | 9% | 2 | 2.0 |

How to read the proxy rows:
- A "visitor" is a salted hash of IP + UA.
- `Claude-User` traffic comes from Anthropic's egress IPs, so one visitor can be many people. Calls can also be counted under several client names.
- The proxy rows over-count both people and calls.
- The **direct rows are the honest signal**: coding agents installed on users' machines activate at about **6% (7 of 135 visitors)**.

### 1.3 What gets used: 14 of 64 tools, ever

Real calls since Aug 2026, from `mcp_calls`, excluding our IP, curl, scanners and our own Cursor-UA test:

| Tool | Calls | IPs | Tool | Calls | IPs |
|---|---|---|---|---|---|
| search_design_inspiration | 179 | 68 | list_inspiration_themes | 15 | 13 |
| search_ui_screens | 35 | 14 | generate_logo_concepts | 7 | 7 |
| browse_inspiration_by_theme | 27 | 20 | get_ui_screen_code | 5 | 4 |
| search_museum_art | 20 | 16 | generate_website_color_palette | 4 | 4 |
| search_annual_reports | 18 | 14 | generate_color_combinations | 4 | 2 |
| generate_design_md | 17 | 1 | get_ui_flow | 3 | 2 |
| check_contrast | 3 | 2 | get_share_feedback | 1 | 1 |

**50 of the 64 tools have never been called by a real client.** These are all the utility batches: b44 puzzles and charts, b45, b48–b53 print, 3D and characters.

Those 50 tools take **79%** (about 80 KB) of the 102 KB tools/list. The whole list is roughly 25k tokens.

Where the calls come from:
- In coding agents, almost every call is `search_ui_screens` during a UI build, with queries like "data table with logo cells, right-aligned tabular numbers…". This is the clearest product-market fit.
- On claude.ai, calls are moodboard fan-outs (search_design_inspiration + search_museum_art + browse_inspiration_by_theme) and logo concepts.

### 1.4 Zero results, errors and latency: not the churn cause

- **Zero results:** 3 real zero-result calls in 7 days:
  - museum "Bauhaus", which is out of scope by design;
  - "engineering corporate wordmark";
  - "architecture blueprint technical grid".
  Zero results already return a sibling-tool suggestion.
- **Errors:** 0 real errors. All 3 `make_word_search` errors were our own test.
- **Latency (avg / max ms):**

| Tool | Avg ms | Max ms |
|---|---|---|
| search_design_inspiration | 2,052 | 3,612 |
| list_inspiration_themes | 2,624 | 3,217 |
| search_museum_art | 999 | 3,640 |
| search_ui_screens | 709 | 1,739 |
| generators | under 300 | – |

`list_inspiration_themes` scans every design row on every call. It is fixed on this branch with a 30-minute memo.

### 1.5 Protocol and features

- **Protocol versions sent:**
  - `2025-11-25`: Claude Code, claude.ai, Kittl, opencode, Copilot CLI.
  - `2025-06-18`: Codex.
  - `2024-11-05` / `2025-03-26`: a few probes.
- **Transport is healthy for every client.** Each session lists tools right after initialize:

| Client | Sessions | Listed tools |
|---|---|---|
| claude-code | 1,216 | 1,170 |
| codex | 810 | 810 |
| kittl | 297 | 293 |
| claude.ai | 378 | 316 |

- **Already in place:** tool annotations (readOnlyHint etc.) on all 64 tools; `outputSchema`/`structuredContent` for the two DESIGN.md generators plus the b48 tools (≥2025-06-18 clients only); "Use when…" descriptions; Next-step hints; sibling suggestions on zero results; UTM-tagged deep links; and 3 prompts.
- **Prompts:** 0 `prompts/get` in 7 days. `prompts/list` was not logged until this branch, so we cannot tell whether clients even fetch them.
- **Resources:** not offered. Low value: few clients surface resources to the model.
- **`title` field:** absent at the top level; it exists inside annotations. It is cosmetic, and adding it to 64 tools would cost about 2 KB.
- **Image content blocks:** not used. Results carry image URLs as text.

### 1.6 Schema audit of the live tools/list (64 tools)

- All names are valid (`^[a-zA-Z0-9_-]{1,64}$`), and `mcp__<server>__name` stays at 64 characters or fewer.
- Every top-level `inputSchema` is `type: object`. There is no top-level `oneOf`/`anyOf` and no `$ref`.
- **Risky constructs:**
  - **1 array without `items`:** `make_extruded_part.polygons[]`, added 1 Nov in b51. OpenAI-function-based agents reject an array schema without `items`, and that can fail the whole request rather than one tool.
  - **1 description over 1,024 characters:** `search_ui_screens`, at 1,061 since the 31-Oct "Use when" prefix. The OpenAI function-description limit is 1,024.
  - 12 nested `anyOf` (colour inputs, storyboard shots…) and 3 typeless `items: {}`. These are valid JSON Schema and are tolerated by Claude and Codex, which sanitises them. They stay as they are.
- Codex demonstrably tolerated the live schema: its one call, `list_inspiration_themes`, came on 1 Nov 15:13 SGT, after b51. **Neither Codex nor Kittl was blocked by schema or transport.**

### 1.7 Boards (Google-OAuth /mcp/boards): 0 grants since 20 Oct

Using it takes four steps of friction:
1. Know that a second URL exists, which is mentioned only on the docs page.
2. Add a second connector.
3. Complete a Google consent flow.
4. Know about the save tools.

Nothing in the public endpoint's results points to boards. Anonymous users have no way to keep or share what they found, so a good session leaves no trace that brings them back.

### 1.8 Observation: the claude.ai directory connector may serve a stale snapshot

In this account's Claude Code session, the claude.ai "Made Good Designs" connector exposes **36 tools** (the 31-Oct set) and the **pre-31-Oct instructions text**. The live server has 64 tools and new instructions.

Directory or claude.ai connectors may therefore cache tool metadata, which means changes only reach those users once Anthropic refreshes the snapshot. The live `tools_list` events from `Anthropic/ClaudeAI` (316 per week) suggest most sessions do fetch fresh lists. Treat this as a single-account observation.

## 2. Root causes, per client

| Client | Root cause (evidence) | Fix |
|---|---|---|
| **Claude Code (direct), 7% activation** | Installed user-wide, so it connects on every start. 102 KB (~25k tokens) of tools is above Claude Code's auto tool-search threshold, so our tools are **deferred**: the model sees only names plus the server `instructions`. The old instructions were a routing table with no trigger telling the model *when* a design MCP is relevant to a coding task. When it does call, it is `search_ui_screens` during UI builds (5 activated visitors, 5 calls each). | Trigger-first instructions (done). `/mcp/core`, about 7.7k tokens, so full descriptions can load (done). Prompts as slash commands (done: moodboard). |
| **claude.ai / Claude-User proxy, ~47%** | Healthy activation. Only 18% of callers returned on another day, and proxy IPs blur people. There is no artefact to come back to. | Retention hooks (P2: shareable moodboard link, "new this week"). |
| **Codex, 4% (1 of 25)** | Transport, tools/list and schema are all fine (810 of 810 sessions listed tools; the 1 call succeeded post-b51). **Two visitors account for 755 of 824 connections:** NL, 12 visitors / 486 connections, and DE, 1 visitor / 269. That pattern looks like automated or CI Codex runs with our server configured, not people asking design questions. | Core profile + trigger instructions. Don't chase. |
| **Kittl agent, 0 of 30** | Browser-side MCP client (Mozilla UA; DE 25 / GB 4 visitors → Kittl HQ in Berlin). Not blocked: a CORS preflight from a Kittl origin returns 204, and a browser-UA tools/call returns 200. 293 of 297 sessions listed tools. Activity is **fading** (95 / 104 / 85 / 13 / 0 per day, 29 Oct to 2 Nov), which fits an internal evaluation of user-added connectors where their own canvas tools win routing. Possible extra factor: tool count and size inside their agent (unverifiable). | Nothing to fix on our side. A lean `/mcp/core` helps if they come back. |
| **Probes (≈1,100 connections)** | glimind SentinelOracle, histor, catalogue checkers. | Bot-flagged by UA in the Worker (done); dropped by client name in `mcp_report.py` (done). |

## 3. Prioritised plan (impact × effort, quick wins first)

### P0: quick wins, built on `mcp-ux` (not deployed)

| # | Change | Impact | Effort | Status |
|---|---|---|---|---|
| 1 | **Trigger-first `instructions`**: "Call them BEFORE building or restyling UI, picking colours or fonts, or making a logo or brand…". Every routed tool is still named (1,497 → 1,447 chars). | High: Claude Code shows instructions even when tools are deferred | XS | ✅ built |
| 2 | **`/mcp/core` lean profile**: the 18 design tools, 30,995 B vs 102,061 B. Plus `/mcp/all`. `/mcp` keeps all 64 (`MCP_DEFAULT_PROFILE = "all"`). **Every tool stays callable on every profile**; only the list differs. Core has its own instructions. | High for coding agents (full schemas fit in context) | S | ✅ built; **decision: flip default?** |
| 3 | **Schema hygiene**: `items: {}` on item-less arrays (generic, future-proof); `search_ui_screens` description trimmed under 1,000 chars. Inputs that validated before still validate. | Medium: removes the two constructs that break OpenAI-function clients | XS | ✅ built |
| 4 | **`moodboard` prompt** (the top claude.ai job), plus `prompts_list` telemetry so we learn whether clients fetch prompts. | Medium (discoverability: slash command) | XS | ✅ built |
| 5 | **`list_inspiration_themes` memo** (30 min per isolate): avg 2.6 s → about 0 on warm isolates. Output identical. | Low–medium | XS | ✅ built |
| 6 | **Honest metrics**: SentinelOracle and histor bot-flagged; `mcp_report.py` retries transient D1 errors, drops probe clients, and adds KPI, retention, prompt and endpoint tables. | Enables everything else | XS | ✅ built |

### P1: next (small to medium, no new tools)

1. **Advertise `/mcp/core` for coding agents** on /design-mcp-server/, e.g. `claude mcp add --transport http mgd https://madegooddesigns.com/inspiration/mcp/core` and the Codex TOML. Then, if activation rises, flip `MCP_DEFAULT_PROFILE` to `"core"` and point "all tools" users at `/mcp/all`.
   - This is a WordPress edit; it needs the user's go-ahead.
2. **Thumbnail image blocks** in `search_ui_screens` / `search_design_inspiration`: the top 2–3 results as small `image` content blocks. claude.ai and Claude Code render them inline, and seeing a reference is the product. Cap at about 60 KB per result.
3. **"New this week" without a new tool**: a `sort: "newest"` option on the search tools, and a "N new this week" line in `list_inspiration_themes`. This gives repeat users a reason to ask again.
4. **Faster design search**: D1 FTS5 index over title, description and tags, so `search_design_inspiration` drops from 2 s avg to under 0.3 s.
5. **Weekly KPI review** with the query in section 5. Judge P0 on the *direct* rows.

### P2: retention hooks (medium)

1. **Shareable moodboard link, no login**:
   - Search results already carry item ids.
   - A `save_moodboard(items[], title)` tool, or a "board" link built from the session's results, creates a public, unlisted page on madegooddesigns.com/inspiration/b/<id>.
   - That page is something people revisit, share and cite: a traffic and return loop.
   - This replaces the OAuth boards friction (0 grants).
   - Needs rate limits, a size cap, expiry for untouched boards and no PII.
2. **Session continuity**: key on `Mcp-Session-Id` so a follow-up call can say "the 6 references you saved this session: <link>".
3. **Retire or demote the OAuth `/mcp/boards`** in the docs if P2.1 ships. Keep the endpoint for existing (zero) users.

### P3: low value or later

- Top-level `title` on tools (+2 KB).
- MCP resources (DESIGN.md spec, sample screens).
- Merging utility tools into fewer multi-mode tools. This only matters if the default stays "all".

### Explicitly not doing

- Directory listings, per the standing decision.
- "Come back tomorrow" or nag text in results, fake urgency, or upsells inside tool output.
- Hiding tools from tools/call: old names must keep working.

## 4. Metrics to track (weekly; judge on `direct` rows, since proxy rows blur people)

| Metric | Definition | Baseline (26 Oct–2 Nov) | Target in 4 weeks |
|---|---|---|---|
| **Activation (direct)** | Non-bot visitors with ≥1 `call` in the window ÷ visitors with an `initialize` (direct UA) | 7 / 135 = **5.2%** (claude-code 7%, codex 4%, kittl 0%) | ≥ 12% |
| Activation (proxy) | Same, for `Claude-User` UA (people ≠ visitors) | ~47% | hold |
| **Return (D7-style)** | Callers with calls on ≥2 distinct SGT days in 7 days ÷ callers | 7 / 39 = **18%** | ≥ 25% |
| **Calls per active visitor** | Calls ÷ activated visitors | 2.2 overall (direct claude-code 5.0) | ≥ 3 |
| Profile split | connects / calls by `endpoint` (`public` vs `public-core`) | public only | – |
| Prompt use | `prompts_list` and `prompt` events | 0 | > 0 |
| Zero-result rate | `zero=1` ÷ calls | 2–3 / 86 | < 5% |
| p50/max latency | `ms` per tool | design search 2.05 s avg | < 1 s |
| MCP → site visits | GA4 session source `mcp` (campaign = tool, content = client) | check GA4 | ↑ |

`python3 mcp_report.py 7` now prints the KPI, retention, prompt and endpoint tables directly.

## 5. Weekly report query (D1; paste into `wrangler d1 execute mgd-inspiration --remote --command`)

```sql
-- Weekly MCP KPIs by client + via (direct vs Anthropic proxy). Bots and probe clients excluded.
WITH ev AS (
  SELECT * FROM mcp_events
  WHERE bot = 0 AND created_at > (strftime('%s','now') - 7*86400) * 1000
    AND visitor NOT IN (SELECT visitor FROM mcp_events WHERE kind = 'initialize' AND client_name IN
        ('glimind-probe','histor','catalog-health','mcpcost','probe','agentready-probe','agentservicedirectory.com','analytics-test'))
),
conn AS (SELECT DISTINCT visitor, client_name, CASE WHEN ua LIKE 'Claude-User%' THEN 'proxy' ELSE 'direct' END via FROM ev WHERE kind = 'initialize'),
calls AS (SELECT visitor, COUNT(*) n, COUNT(DISTINCT date(created_at/1000, 'unixepoch', '+8 hours')) days FROM ev WHERE kind = 'call' GROUP BY visitor)
SELECT conn.client_name AS client, conn.via,
       COUNT(DISTINCT conn.visitor)                                          AS connected,
       COUNT(DISTINCT calls.visitor)                                         AS activated,
       ROUND(100.0 * COUNT(DISTINCT calls.visitor) / COUNT(DISTINCT conn.visitor), 1) AS activation_pct,
       SUM(calls.n)                                                          AS calls,
       ROUND(1.0 * SUM(calls.n) / MAX(COUNT(DISTINCT calls.visitor), 1), 1)  AS calls_per_active,
       SUM(calls.days > 1)                                                   AS returned_2plus_days
FROM conn LEFT JOIN calls USING (visitor)
GROUP BY 1, 2 HAVING connected >= 3 ORDER BY connected DESC;
```

## 6. What was prototyped on `mcp-ux`, and how it was tested

The changes are all in `src/index.js` and post-process the tool modules, so the generated `tools_core*` and `mcp_tools*` files are untouched.

**Tests.** `bash tests/mcpux_local/run.sh` builds two workers and compares them:
- The new worker and an untouched `git archive origin/museum-collection-2026-10`.
- Each runs on its own copy of the same seeded local D1: about 1,900 live-sampled rows from `/tmp/mgd-designmd-test`.

The run covers:
- `tests/rpc_mcpux.py`: **36/36**.
- All older RPC suites against the new worker: rpc45 12/12, rpc48 73/73, rpc49 29/29, rpc50 23/23, rpc51 38/38, rpc52 19/19, rpc53 16/16.
- `rpc_designmd`: 66/68. The new worker has the same 2 failures as the baseline, both caused by having no local R2 seed.
- Node suites test_tools45–53: all pass.

**What `rpc_mcpux.py` asserts:**
- Same 64 names in the same order.
- inputSchemas identical except `items: {}`, which touched only `make_extruded_part`.
- Descriptions identical except `search_ui_screens`.
- Annotations and outputSchema identical.
- 14 tool outputs byte-identical to the baseline, including the D1 searches and a zero-result case.

**OAuth suite** (`run_local_tests.sh`):
- The public /mcp differs from the baseline only at `initialize` and `tools/list`, which is intended.
- The authorize/login checks need `.dev.vars` (Google client id). That file exists only in the main checkout, so the deploy script runs this suite there.

**tools/list byte sizes:**

| Endpoint | 2025-06-18 client | 2024-11-05 client |
|---|---|---|
| live / baseline `/mcp` | 102,061 B | 101,052 B |
| new `/mcp` (all) | 101,816 B | 100,807 B |
| new `/mcp/core` | **30,995 B** | 29,986 B |
