---
name: memory
description: Rubi project memory, with a code map and knowledge graph in .rubi/ that opens in Obsidian. Use it to find context before exploring code and to store decisions, bugs, gotchas, and concepts. "/rubi:memory <topic>" searches it.
---

# Project memory (Rubi)

Rubi stores project knowledge at three levels under `.rubi/` in the project root:

- **Level 0:** `mapa.md`, loaded at the start of every session. It contains modules, central files, and the most important knowledge.
- **Level 1:** `modulos/<x>.md`, opened with `rubi_mapa(modulo)`.
- **Level 2:** `conhecimento/*.md`, graph nodes found through `rubi_contexto`.

## Search before exploring

Before opening several files, call `rubi_contexto` with:

- `pergunta`: what you want to know;
- `termos`: 4-8 synonyms, technical terms, and likely function or file names;
- `arquivos`: files you already know are relevant.

The response combines text matches, file names, and graph neighbors, so it finds related knowledge even when it uses different words. Items marked ⚠ refer to files changed after the note was written; verify them in code. Delegate broad questions to the `rubi-researcher` agent.

If the user supplied a topic with `/rubi:memory <topic>`, search and summarize the results.

## Store durable knowledge (`rubi_registrar`)

Store anything that would be expensive to rediscover:

| Type | When to use it |
|---|---|
| `decisao` | A choice of X over Y; **always include why** |
| `bug` | What broke, the cause, and the fix (`status: resolvido` when closed) |
| `armadilha` | Something that looks correct but is not, or a mistake that already happened |
| `conceito` | A domain term or system component, such as "Checkout" or "billing queue" |
| `como-fazer` | How to run, test, publish, or migrate something |
| `preferencia` | How the user wants things done (`escopo: "pessoal"` when it applies to every project) |

- Use a short, stable title and a 1-4 sentence description.
- List involved files in `arquivos`.
- Use `liga` to connect other nodes or modules (`rel`: `sobre`, `depende_de`, `causa`, `corrige`, `usa`, `parte_de`, `contradiz`).
- When a decision changes, save the new one with `substitui: "<old title>"`. The old decision remains but is marked superseded.
- Rubi merges duplicates automatically.
- Never store secrets.

## Summaries

When you understand the project or a module whose map summary is empty, use `rubi_escrever_resumo`:

- target `mapa`: 3-6 lines explaining what it is, its stack, and how to run it;
- target `modulo:<name>`: 2-5 lines describing its responsibility and caveats.
