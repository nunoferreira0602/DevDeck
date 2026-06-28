process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
import Parser from 'rss-parser'
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
)

const parser = new Parser({ timeout: 10000 })

export async function fetchAndStore(feedsOverride = null) {
  const feeds = feedsOverride ?? JSON.parse(readFileSync(join(__dirname, 'feeds.json'), 'utf-8'))

  const allArticles = []
  for (const feed of feeds) {
    try {
      const result = await parser.parseURL(feed.url)
      for (const item of result.items) {
        if (!item.link || !item.title) continue
        allArticles.push({
          title: item.title.trim(),
          url: item.link.trim(),
          source: feed.name,
          published_at: item.pubDate ? new Date(item.pubDate).toISOString() : null,
          raw_content: item.contentSnippet || item.content || null,
        })
      }
      console.error(`[fetch] ${feed.name}: ${result.items.length} items`)
    } catch (err) {
      console.error(`[fetch] ${feed.name}: ERROR — ${err.message}`)
    }
  }

  if (allArticles.length === 0) {
    console.error('[fetch] No articles found')
    return
  }

  const urls = allArticles.map((a) => a.url)
  const { data: existing, error } = await supabase
    .from('articles')
    .select('url')
    .in('url', urls)

  if (error) throw new Error(`Supabase query failed: ${error.message}`)

  const existingUrls = new Set((existing || []).map((r) => r.url))
  const newArticles = allArticles.filter((a) => !existingUrls.has(a.url))

  console.error(`[fetch] ${newArticles.length} new articles (${allArticles.length - newArticles.length} duplicates skipped)`)

  if (newArticles.length === 0) return

  const { error: upsertError } = await supabase
    .from('articles')
    .upsert(newArticles, { onConflict: 'url', ignoreDuplicates: true })

  if (upsertError) throw new Error(`Supabase upsert failed: ${upsertError.message}`)

  console.error(`[fetch] Stored ${newArticles.length} articles`)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  fetchAndStore()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[fetch] Fatal:', err.message)
      process.exit(1)
    })
}
