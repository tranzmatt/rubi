---
name: handoff
description: Save where the work stopped and the session's durable knowledge before compaction or moving to a new window. Use when the context meter warns, when the user requests /handoff, or when a major phase ends.
---

# Handoff

Complete these three steps in order. If the context meter requested the handoff, do not stop to ask the user.

## 1. Store durable knowledge (`rubi_registrar`)

The full context is already available. Store facts from this session that will matter beyond the current task: decisions and reasons, bugs and fixes, gotchas, new concepts, and how-to instructions.

Link every fact to relevant files and other nodes. Use `substitui` when a decision changed.

## 2. Fill missing summaries

If you now understand a module with no map summary, write 2-5 lines with `rubi_escrever_resumo`.

## 3. Save the handoff (`rubi_salvar_handoff`)

Write the note you would want if you resumed the work with no memory. Rubi restores it automatically after compaction.

```markdown
# <task in one line>

## Goal
What the user wants at the end, using their words when that matters.

## Current state
What is complete and verified. What is partially done, including the exact file and location.

## Key files
- `path/file.ext`: role in this task

## Next step
1. The next concrete action, including the command or file.

## Task-specific gotchas
- What already went wrong and how to avoid it.
```

- Pass the key files in `arquivos` so the handoff connects to the graph.
- Be concrete about paths, functions, and commands. Keep it under about 1,000 words and do not retell the conversation.
- Do not repeat facts already saved as nodes; search will restore them.
- Never store secrets.
- If the user requested the handoff, say where it was saved and mention that they can run `/clear`; Rubi restores the handoff in the new window.
