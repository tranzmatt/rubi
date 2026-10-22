---
name: rubi
description: Prevent long conversations from consuming the user's usage limit. When a conversation grows large, save where the work stopped so the user can continue in a new chat without losing context. Also use when the user says "continue where I left off," "remember this," or names a saved project.
---

# Rubi: continuous memory

Every new message in a long conversation resends the conversation so far. Large conversations therefore consume the usage limit much faster. This skill keeps conversations short without losing the thread.

## 1. Notice when the conversation is long

There is no automatic meter here. Treat the conversation as long when it exceeds about 25 message exchanges, contains large documents or code blocks, moves into a new phase, or the user complains about limits, slowness, or forgotten details.

Offer once: "This conversation is getting long. Would you like me to save where we stopped so you can continue in a new conversation? It will use much less of your limit." If the user declines, do not ask again until the work changes phase.

## 2. Save a handoff

Write a short note of no more than about 800 words:

```markdown
# <topic in one line>
## Goal
## Work completed and decisions made
## Important details (numbers, names, links, and text that must not be lost)
## Next step
```

- **With the Rubi connector** (`rubi_*` tools): call `rubi_salvar_handoff` with `projeto` set to a short topic name, such as `thesis` or `ana-store`. Tell the user: "Saved. Open a new conversation and say: continue where I left off in <project>."
- **Without the connector:** return the note in one code block and tell the user to copy it into a new conversation with: "Continue from here."

## 3. Continue in a new conversation

When the user says "continue where I left off," call `rubi_ultimo_handoff`. Use `rubi_projetos` if you do not know the project name. Continue from the next step without asking the user to explain everything again. If the user pasted a handoff, use it as context and continue.

## 4. Remember durable information

When the user says "remember this," or shares something useful across conversations, store it with `rubi_registrar`. Choose the correct type: `preferencia`, `decisao` (including why), `conceito`, or `como-fazer`. Connect facts with `liga`. When something changes, use `substitui` so the previous fact is marked superseded. Before asking the user to repeat something they may have shared before, search with `rubi_contexto` and include related `termos`.

Never store passwords, personal documents, or payment-card information.
