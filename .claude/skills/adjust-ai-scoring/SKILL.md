# Skill: Adjust AI Scoring

Use this skill when tuning the Gemini classification prompt — to change scoring criteria, add/rename categories, or fix inconsistent output.

## The JSON contract (must not break)

`classify-with-gemini.js` expects Gemini to return **only** valid JSON in this exact shape:
```json
{
  "summary": "2-3 sentence plain-text summary",
  "category": "AI | Tactics | Processes | Industry",
  "relevance_score": 7
}
```

Rules:
- `category` must be one of exactly: `AI`, `Tactics`, `Processes`, `Industry` (case-sensitive)
- `relevance_score` must be an integer 1–10
- No extra keys, no markdown fences, no explanation text — raw JSON only

Breaking this contract causes `classify-with-gemini.js` to throw and skip the article silently.

## Steps

### 1. Edit the prompt in `scripts/classify-with-gemini.js`

The prompt is the string passed to `model.generateContent(...)`. Typical changes:

- **Relevance criteria**: describe what makes an article high-score for a tech lead (practical applicability, depth, novelty — not marketing content)
- **Category definitions**: if the existing four don't fit, add or rename — but update `feeds.json` notes and the DB schema check accordingly
- **Summary style**: length, tone, audience

### 2. Run the tests immediately after any prompt change

```bash
npm test -- tests/classify-with-gemini.test.js
```

The tests assert:
- Output parses as valid JSON
- `category` is one of the four allowed values
- `relevance_score` is an integer between 1 and 10
- `summary` is a non-empty string

All four must pass before committing.

### 3. Spot-check with a real article

Run the script against one article manually and read the output:
```bash
node scripts/classify-with-gemini.js --dry-run
```
Confirm the summary reads naturally and the score feels calibrated.

### 4. Watch for category drift

If you change the category definitions, run the pipeline against 5–10 stored articles and verify old categories haven't been reassigned in unexpected ways. The DB stores category as free-text so old records are unaffected; only new fetches use the updated prompt.

### 5. Commit

```bash
git add scripts/classify-with-gemini.js tests/classify-with-gemini.test.js
git commit -m "feat: tune Gemini scoring — <brief reason>"
```

## When NOT to use this skill

- If you want to change the Supabase schema (add columns, rename fields) — do that in `supabase/schema.sql` and migrate separately.
- If you want to add a new RSS source — use the `add-rss-feed` skill instead.
