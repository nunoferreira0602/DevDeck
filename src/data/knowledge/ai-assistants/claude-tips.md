---
title: Claude Tips & Structures
tags: [claude, ai, prompting]
---

## CLAUDE.md Patterns

A well-structured `CLAUDE.md` is the single highest-leverage thing you can do for a project. Claude reads it at the start of every session and uses it to calibrate behaviour.

**Core sections to always include:**

- **Project description and goal** — one paragraph explaining what the project is and who it's for
- **Tech stack (and why)** — list the tools and include the constraints/reasons; prevents Claude from suggesting alternatives
- **Repository structure** — a tree of the key directories and what they contain
- **Conventions** — naming, file organisation, testing approach, commit style
- **Things NOT to do** — explicit prohibitions are more effective than implied ones
- **Skills available** — reference any `.claude/skills/` you've written

**Anti-patterns to avoid:**

- Leaving it vague ("use good practices") — be specific
- Not updating it after decisions are made in chat — stale CLAUDE.md is worse than none
- Putting too many things in one file — split large projects into sub-`CLAUDE.md` files per module

---

## Prompting Structures

### The Task Brief Pattern
For any non-trivial task, front-load context before giving the instruction:

```
Context: [what already exists, what you tried, what you know]
Goal: [what you want the end state to look like]
Constraint: [hard limits — tech, time, backwards compat]
Task: [the actual instruction]
```

### The Rubber Duck Pattern
Useful when you're not sure what you want:

```
I'm trying to [goal]. I'm thinking about [approach A] vs [approach B].
The tradeoff I see is [X]. What am I missing? Don't write code yet.
```

### The Reviewer Pattern
Ask Claude to review *as a specific role*:

```
Review this PR diff as a senior engineer focused on [correctness / security / performance].
List findings as: CRITICAL / WARNING / SUGGESTION.
Be terse. Don't explain what the code does.
```

### The Delegator Pattern (multi-agent)
For large tasks, decompose first:

```
Break this task into independent subtasks that could be worked on in parallel.
For each subtask: name it, list its inputs/outputs, and note any dependencies.
Don't implement yet.
```

---

## Extended Thinking

Enable extended thinking (`thinking: {type: "enabled", budget_tokens: N}`) when:

- Solving algorithmic problems with multiple valid approaches
- Reviewing security-sensitive code
- Designing a schema or architecture you'll live with for a long time
- Debugging subtle, non-obvious bugs

Don't enable it for: simple edits, boilerplate generation, explanations you already understand.

---

## Tool Use Tips

- **Prefer parallel tool calls** — Claude can call multiple tools simultaneously; structure prompts so independent lookups don't block each other
- **Name your tools clearly** — the tool name is part of the prompt; `get_article_by_id` is better than `fetch`
- **Use strict JSON schemas** — the tighter the schema, the less retrying you'll need
- **Set `cache_control`** on large static documents (system prompts, large context) to cut costs on repeated calls

---

## Model Selection (as of mid-2026)

| Model | Best for |
|-------|----------|
| claude-sonnet-4-6 | Day-to-day coding, reviews, analysis |
| claude-opus-4-8 | Complex architecture, hard bugs, adversarial review |
| claude-haiku-4-5 | High-volume cheap tasks: classification, short summaries |
| claude-fable-5 | Creative/narrative tasks |

For agentic loops with many steps, start with Sonnet and escalate to Opus only for the hardest reasoning steps.

---

## Common Mistakes

- **Asking for too much at once** — Claude will try to do everything and do nothing well. One task per turn.
- **Not providing file paths** — always give exact paths so Claude doesn't hallucinate them
- **Forgetting to say "don't explain"** — if you just want code, say so; otherwise you'll get paragraphs
- **Trusting output without reading it** — Claude is wrong in subtle ways more often than obvious ones
