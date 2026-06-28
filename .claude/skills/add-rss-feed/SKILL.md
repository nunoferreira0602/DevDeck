# Skill: Add RSS Feed

Use this skill when adding a new RSS source to the aggregator.

## Steps

### 1. Add entry to `scripts/feeds.json`

Each entry requires:
```json
{
  "name": "Human-readable source name",
  "url": "https://example.com/feed",
  "notes": "Optional: paywall/truncation warning if applicable"
}
```

### 2. Validate the URL with a real HTTP request

Do not trust the URL on sight — fetch it:
```bash
curl -sI "https://example.com/feed"
```
- HTTP 200 → proceed
- HTTP 301/302 → follow the redirect, update the URL in feeds.json to the final destination
- HTTP 404 / connection refused / timeout → find an alternative source URL before committing

### 3. Smoke test — confirm at least 1 article parses

Run the fetch script against just this feed:
```bash
node scripts/fetch-feeds.js --feed "https://example.com/feed"
```
Confirm the output contains at least one article with a non-empty `title` and `url`.

### 4. Check for paywall or content truncation

Inspect the `raw_content` in the parsed output:
- If `raw_content` is empty or under ~100 chars, the feed is truncating (common on Substack and Medium).
- Add a `"notes"` field in feeds.json: `"Substack — free RSS only; raw_content may be snippet-only"`
- Gemini will fall back to summarizing title + description only. This is acceptable but produces shorter summaries.

### 5. Commit

```bash
git add scripts/feeds.json
git commit -m "feat: add <source name> RSS feed"
```

## Common pitfalls

- Atom feeds (`.atom` extension or `<feed>` root element) are fully supported by `rss-parser` — no special handling needed.
- Medium-hosted blogs truncate RSS to ~200 words. Don't file a bug; it's a platform limitation.
- Feeds that return 200 but empty `<item>` lists are effectively dead — treat the same as a 404.
