---
title: Cursor Rules & Workflows
tags: [cursor, ai, ide, rules]
---

## .cursorrules / .cursor/rules

Cursor reads rules files to calibrate AI behaviour per-project. As of Cursor 0.45+, rules live in `.cursor/rules/` as individual `.mdc` files (replaces the old `.cursorrules`).

**Effective rule structure:**

```
---
description: When to apply this rule (be specific)
globs: src/**/*.tsx, src/**/*.ts
---

# Rule Title

[concrete instructions]
```

**High-value rules to write:**

- **Component conventions** — functional only, no class components, prop naming patterns
- **Import ordering** — absolute vs relative, library order
- **Testing conventions** — what to mock, what to always use real implementations for
- **Prohibited patterns** — `any` types, `console.log` in prod, specific anti-patterns you've burned yourself on
- **Context rules** — "when editing `scripts/`, use ESM syntax and never import from `src/`"

---

## Context Management

Cursor's AI is only as good as the context it has. Strategies:

### @ References
- `@file` — pin a specific file (use for the main module you're editing)
- `@folder` — pull in a whole directory (useful for "show me all components")
- `@codebase` — semantic search across the repo (expensive; use when you don't know where something is)
- `@docs` — attach external documentation (add your framework's docs once, reuse)
- `@git` — reference specific commits or diffs

### Compose Context Intentionally
Before a big session, pin:
1. The file you're editing
2. Its test file
3. Any types/interfaces it depends on
4. The relevant CLAUDE.md or architecture doc

Don't let Cursor guess — you'll get generic output.

---

## Effective Workflows

### Refactor Loop
1. Write the test for the desired behaviour first (or ask Cursor to)
2. Ask Cursor to implement against the test, not against the existing code
3. Review the diff carefully — Cursor tends to over-refactor
4. Run tests; fix with Cursor if needed, but read every line it changes

### PR Review Assist
Open the diff in Cursor and prompt:

```
Review this diff. Focus on: correctness, edge cases, security.
Format: one finding per line. Be terse. Skip style comments.
```

### Debugging Pattern
1. Paste the error + stack trace
2. Say: "Before suggesting a fix, explain what you think the root cause is."
3. Only after agreeing on root cause: "Now suggest the minimal fix."

This prevents Cursor from patching symptoms instead of causes.

### Documentation Generation
For an undocumented function:

```
Write a one-line comment for this function.
Only document the WHY (non-obvious constraint or invariant), not the WHAT.
If there's nothing surprising, write nothing.
```

---

## Composer vs Chat vs Inline Edit

| Mode | Use for |
|------|---------|
| Inline edit (Cmd+K) | Small, scoped changes to a single block |
| Chat | Exploration, asking questions, reviewing |
| Composer (Cmd+I) | Multi-file changes, features, refactors |

Composer is powerful but can make changes across many files — always review with `git diff` before accepting.

---

## Anti-Patterns

- **Accepting composer output without diffing** — it deletes things silently
- **Too-wide context** — `@codebase` on a large repo gives generic answers; narrow it
- **Using chat for implementation** — chat doesn't apply edits; use Composer
- **Not writing `.cursor/rules`** — you'll repeat yourself every session
