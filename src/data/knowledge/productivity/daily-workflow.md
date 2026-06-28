---
title: Daily SE Workflow
tags: [productivity, workflow, routine]
---

## Morning Routine (15 min)

1. **Scan DevDeck** — check articles scored ≥ 7 from the last 24h. Read 2-3 max. Anything that changes what you're doing today? Note it.
2. **Check CI** — any failing builds on `main` or open PRs? Fix before starting new work.
3. **Set intent** — write one sentence: "Today I'm moving [X] forward by doing [Y]." This forces clarity before Slack/email.
4. **Triage GitHub notifications** — archive anything not requiring action today.

---

## Deep Work Block

Protect at least one 2-hour uninterrupted block per day. Structure it:

- **First 10 min**: orient — read the relevant code, write a comment or doc fragment explaining what you're about to change and why. This forces clarity.
- **Main block**: implement. Commit small and often (`git commit -m "wip:"` is fine during this block).
- **Last 10 min**: write a real commit message, open a draft PR, update the task tracker.

---

## AI-Assisted PR Review Prompt

When reviewing a PR (yours or someone else's), use this prompt:

```
Here is a git diff. Review it as a senior engineer.

Focus areas:
1. Correctness — will this break in edge cases?
2. Security — any injection, auth bypass, data exposure risks?
3. Simplicity — is there a simpler way to achieve the same thing?

Format: bullet list. One finding per bullet. Be terse.
Skip style and formatting comments.
Skip anything that's obviously correct.

<diff>
[paste diff here]
</diff>
```

---

## Commit Message Convention

```
<type>(<scope>): <short description>

[optional body — the WHY, not the WHAT]
```

Types: `feat`, `fix`, `chore`, `refactor`, `test`, `docs`

**Good:**
```
fix(fetch): skip articles with empty content before classifying

Gemini returns a 400 on blank input; previously this crashed the whole
batch. Now we log and skip instead.
```

**Bad:**
```
updated stuff
```

---

## Weekly Retrospective Prompt (Friday, 10 min)

Ask yourself (or Claude):

```
Here are my commits and closed issues from this week:
[paste git log / issue list]

Answer these questions briefly:
1. What did I ship? (outcomes, not tasks)
2. What slowed me down that I could fix?
3. What did I learn that's worth keeping?
4. What's the one thing I should do differently next week?
```

Write the answers in a weekly note. Patterns emerge over months.

---

## Context Switching Protocol

When you're forced to switch tasks mid-flow:

1. **Before switching**: write a one-line "parking note" in the file you're leaving:
   ```
   // TODO(resume): next step is X; blocked on Y
   ```
2. **When returning**: read the parking note before doing anything else.
3. **Never** start a new task without closing the loop on the parking note — either do it or convert it to a tracked issue.

---

## Tech Lead Specific

### 1:1 Prep Prompt
```
I'm having a 1:1 with [person] who is [role].
Their recent work: [summary].
Things I want to raise: [list].
Help me structure 3-4 good open-ended questions that will surface blockers or growth areas.
```

### Architecture Decision Record (ADR) Template
Keep `docs/decisions/` with numbered ADRs:

```markdown
# ADR-001: [Decision Title]

**Status**: Accepted

**Context**: [Why this decision needed to be made]

**Decision**: [What we decided]

**Consequences**: [What becomes easier / harder as a result]
```

One ADR per significant decision. Future-you will thank present-you.

### Incident Debrief Prompt
After any production incident:

```
Help me write a blameless post-mortem for this incident.
Timeline: [what happened when]
Impact: [who was affected, for how long]
Root cause: [what actually caused it]
Format: timeline → impact → root cause → contributing factors → action items
Keep it factual and forward-looking.
```
