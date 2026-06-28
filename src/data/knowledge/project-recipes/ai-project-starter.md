---
title: AI Project Starter Recipe
tags: [recipe, project, ai, template]
---

## Overview

A repeatable checklist for bootstrapping a new project that uses AI (Claude API, Gemini, etc.) in a way that's maintainable, testable, and cost-aware.

---

## Phase 1: Foundations (Day 1)

### Repository Setup
- [ ] Init git, push to GitHub, set `main` as protected branch
- [ ] Create `.github/workflows/ci.yml` — lint + tests on every PR
- [ ] Add `.env.example` with all required env vars (no values)
- [ ] Add `.gitignore` — never commit `.env`, `node_modules`, build artifacts

### CLAUDE.md
Write it on day 1, before any code. Include:
- Project goal and target user
- Tech stack with reasons (especially constraints like "free tier only")
- Directory structure (fill in as you build)
- Conventions: naming, testing, commit style
- Hard prohibitions: what Claude must never do

### Environment Variables Pattern
```
# .env.example
GEMINI_API_KEY=
SUPABASE_URL=
SUPABASE_ANON_KEY=
```

Always use a `.env.example` as the source of truth for required vars.

---

## Phase 2: AI Integration

### Prompt Contract
Before writing any code, write the prompt and its expected JSON schema:

```js
// What goes in
const PROMPT = `
Classify this article. Respond with JSON only — no markdown, no prose.
Schema: { "category": "AI|Tactics|Processes|Industry", "relevance_score": 1-10, "summary": "string" }
Article: ${article.title}\n${article.content}
`

// What comes out
const SCHEMA = {
  category: z.enum(['AI', 'Tactics', 'Processes', 'Industry']),
  relevance_score: z.number().int().min(1).max(10),
  summary: z.string()
}
```

Treat the prompt like an API contract. Change it deliberately, not casually.

### Gemini Free Tier Limits (as of 2026)
- `gemini-2.0-flash`: 1,500 requests/day, 1M tokens/day
- Rate limit: 15 requests/minute
- Always add retry logic with exponential backoff
- Log token usage in CI so you can spot runaway consumption

### Error Handling Pattern
```js
async function classifyWithRetry(article, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await classify(article)
      return SCHEMA.parse(result) // validate before returning
    } catch (err) {
      if (attempt === maxRetries) throw err
      await sleep(1000 * attempt) // linear backoff
    }
  }
}
```

---

## Phase 3: Data Layer

### Supabase Free Tier Checklist
- [ ] Enable Row Level Security (RLS) on all tables — even on solo projects
- [ ] Add unique constraints to prevent duplicate inserts (idempotency)
- [ ] Use `upsert` with `onConflict` rather than insert+check
- [ ] Set up a `created_at` default on every table
- [ ] Keep the schema in `supabase/schema.sql` — always the source of truth

### Idempotent Inserts
```js
await supabase
  .from('articles')
  .upsert(articles, { onConflict: 'url', ignoreDuplicates: true })
```

---

## Phase 4: CI/CD

### Minimal GitHub Actions CI
```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npm run lint
      - run: npm test
```

### Scheduled Job Pattern
```yaml
on:
  schedule:
    - cron: '0 */6 * * *'   # every 6 hours
  workflow_dispatch:          # allow manual trigger
```

Always add `workflow_dispatch` — you'll want to trigger it manually during debugging.

---

## Phase 5: Observability

Even on a personal project, add minimal logging:
- Log each article processed: title + outcome (classified / skipped / errored)
- Log token usage per run
- Log any HTTP errors from RSS feeds (feeds rot; you want to know)

Use `console.log` in GitHub Actions — it's free and searchable in the Actions UI.

---

## Cost Awareness

| Service | Free tier limit | Watch for |
|---------|----------------|-----------|
| Gemini API | 1,500 req/day | Batching too small; retry storms |
| Supabase | 500MB DB, 2GB bandwidth | Large `raw_content` fields |
| GitHub Actions | 2,000 min/month | Frequent cron + long runs |
| Vercel | 100GB bandwidth | Large static assets |
