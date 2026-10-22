---
name: organize
description: Organize a project's Rubi memory. Shrink a large CLAUDE.md by moving details into graph nodes and the map, writing missing summaries, and connecting isolated knowledge. Use when the user asks to organize the project, reduce fixed context, or when CLAUDE.md exceeds about 2,000 tokens.
---

# Organize the project

The goal is for every session to start light, with only the map, and retrieve everything else on demand.

1. **Measure.** Run `rubi_auditar` to see how much fixed context comes from CLAUDE.md and other sources.
2. **Read CLAUDE.md** and split it into two groups:
   - **Keep:** rules that apply to every message, such as "never push to main," "reply in English," and the test command.
   - **Move to nodes:** architecture, old decisions, module explanations, how-tos, and history. Store these with `rubi_registrar`, using the right type and linking relevant files.
3. **Write summaries.** Use `rubi_escrever_resumo` with target `mapa` for the overview, then summarize the main modules from CLAUDE.md and the code map.
4. **Show the proposal before editing CLAUDE.md.** Present the shorter file and a list of the new nodes. Rewrite it only after the user approves. End it with:
   > Project context: map and knowledge graph in `.rubi/` (Rubi). Search with `rubi_contexto` before exploring.
5. **Check the result.** Run `rubi_auditar` again and report how much the fixed context shrank.

Do not discard information. Anything removed from CLAUDE.md must exist as a node or remain recoverable from Git.
