---
name: x-ray
description: Show where tokens are going through a Claude Code transcript X-ray and audit the fixed context loaded in every session. Use when the user asks about usage, cost, tokens, caching, limits, or context.
---

# Usage X-ray

1. Run `rubi_raio_x` (30 days by default; set `dias` when the user requests another period).
2. Run `rubi_auditar` to inspect the current project's fixed context.
3. Explain in plain language:
   - where most of the cost comes from, usually cache reads in long sessions;
   - the three highest-impact savings, in order, with the number supporting each one;
   - what the plugin handles automatically (early compaction, handoffs, and the read guard) and what the user controls (shortening CLAUDE.md and disabling unused MCP servers).

Costs are input-token equivalents: cache reads count as 0.1, cache writes as 1.25-2, and output as 5. They are not currency values. Do not invent dollar amounts.
